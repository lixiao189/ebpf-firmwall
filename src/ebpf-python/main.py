import queue
from threading import Thread
from bcc import BPF
from packet import Packet
from flow import FlowGenerator

bpf = BPF(src_file=b"xdp.c")
pkt_queue: queue.Queue[Packet] = queue.Queue()
flow_generator = FlowGenerator()


def receive_callback(ctx, data, size):
    pkt_event = bpf["pkt_buffer"].event(data)

    # extract tcp flags
    fin_flag = not (pkt_event.flags & (1 << 7)) == 0
    syn_flag = not (pkt_event.flags & (1 << 6)) == 0
    rst_flag = not (pkt_event.flags & (1 << 5)) == 0
    psh_flag = not (pkt_event.flags & (1 << 4)) == 0
    ack_flag = not (pkt_event.flags & (1 << 3)) == 0
    urg_flag = not (pkt_event.flags & (1 << 2)) == 0

    packet = Packet(
        timestamp=pkt_event.timestamp,
        src=pkt_event.src_ip,
        dst=pkt_event.dst_ip,
        proto=pkt_event.protocol,
        sport=pkt_event.src_port,
        dport=pkt_event.dst_port,
        fin=fin_flag,
        syn=syn_flag,
        rst=rst_flag,
        psh=psh_flag,
        ack=ack_flag,
        urg=urg_flag,
        icmp_type=pkt_event.icmp_type,
        icmp_code=pkt_event.icmp_code
    )

    # send the packet to the queue
    pkt_queue.put(packet)


def packets_handler():
    while True:
        packet = pkt_queue.get()
        flow_generator.add_packet(packet)


def main():
    # create the packets handler
    bg_thread = Thread(target=packets_handler)
    bg_thread.daemon = True  # background thread quit when the main thread quits
    bg_thread.start()

    # attach a new xdp program to the network interface
    ifname = "lo"
    bpf.attach_xdp(dev=ifname, fn=bpf.load_func("extract_pkt_info", BPF.XDP))
    bpf["pkt_buffer"].open_ring_buffer(receive_callback)

    try:
        while True:
            bpf.ring_buffer_poll(30)
    except KeyboardInterrupt:
        bpf.remove_xdp(ifname)  # detach the xdp


if __name__ == '__main__':
    main()

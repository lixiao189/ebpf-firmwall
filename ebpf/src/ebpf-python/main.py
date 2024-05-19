import os
import sys
import pika
import socket
import struct

from config import ML_TO_EBPF_QUEUE, RABBIT_MQ_HOST
from bcc import BPF
from ctypes import c_uint32, c_uint8

ifname = "eth0"
bpf = BPF(src_file=b"xdp.c")


def callback(ch, method, properties, body):
    data = body.decode('utf-8').split('+', 1)
    if len(data) != 2:
        return
    ip = socket.inet_aton(data[0])
    ip = c_uint32(struct.unpack("!I", ip)[0])
    predict_result = data[1]

    print(ip) # debug

    # update the map with the new prediction result
    if predict_result == "1":
        bpf["black_list"][ip] = c_uint8(1)
    else:
        try:
            bpf["black_list"].__delitem__(ip)
        except KeyError:
            pass


def main():
    # attach a new xdp program to the network interface
    bpf.attach_xdp(dev=ifname, fn=bpf.load_func("extract_pkt_info", BPF.XDP))

    # RabbitMQ connection
    connection = pika.BlockingConnection(
        pika.ConnectionParameters(host=RABBIT_MQ_HOST))
    channel = connection.channel()

    # Declare the queue
    channel.queue_declare(queue=ML_TO_EBPF_QUEUE)

    channel.basic_consume(
        queue=ML_TO_EBPF_QUEUE, on_message_callback=callback, auto_ack=True)

    print(' [*] Waiting for messages. To exit press CTRL+C')
    channel.start_consuming()


if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print('Interrupted')
        bpf.remove_xdp(ifname)  # detach the xdp
        try:
            sys.exit(0)
        except SystemExit:
            os._exit(0)

    main()

from time import sleep
from bcc import BPF, table

prog = """
struct value_t {
    u64 value_x;
    u64 value_y;
};

BPF_RINGBUF_OUTPUT(data_events, 8);

int xdp_demo(struct xdp_md *ctx) {
    // Push a new event
    struct value_t *value = data_events.ringbuf_reserve(sizeof(struct value_t));
    if (value) {
        value->value_x = 1;
        value->value_y = 2;
        data_events.ringbuf_submit(value, 0);
    } else {
        return XDP_DROP;
    }

    return XDP_PASS;
}
"""

bpf = BPF(text=prog)


def print_event(cpu, data, size):
    event = bpf["data_events"].event(data)
    print(f"Event: {event.value_x}, {event.value_y}")


def main():
    ifname = "lo"
    bpf.attach_xdp(dev=ifname, fn=bpf.load_func("xdp_demo", BPF.XDP))
    bpf["data_events"].open_ring_buffer(print_event)
    try:
        while True:
            bpf.ring_buffer_consume()
    except KeyboardInterrupt:
        bpf.remove_xdp(ifname)


if __name__ == '__main__':
    main()

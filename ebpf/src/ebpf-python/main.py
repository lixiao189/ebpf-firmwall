import os
import sys
import pika

from config import ML_TO_EBPF_QUEUE, RABBIT_MQ_HOST
from bcc import BPF

ifname = "lo"
bpf = BPF(src_file=b"xdp.c")


def main():
    # attach a new xdp program to the network interface
    bpf.attach_xdp(dev=ifname, fn=bpf.load_func("extract_pkt_info", BPF.XDP))

    # RabbitMQ connection
    connection = pika.BlockingConnection(
        pika.ConnectionParameters(host=RABBIT_MQ_HOST))
    channel = connection.channel()

    # Declare the queue
    channel.queue_declare(queue=ML_TO_EBPF_QUEUE)

    def callback(ch, method, properties, body):
        print(f" [x] Received {body}")

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

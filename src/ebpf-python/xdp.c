#include <linux/icmp.h>
#include <linux/ip.h>
#include <linux/tcp.h>
#include <linux/udp.h>

struct packet {
  // General info
  u32 src_ip;
  u32 dst_ip;
  u8 protocol;
  u64 timestamp;

  // ICMP info
  u8 icmp_type;
  u8 icmp_code;

  // Port in TCP and UDP packets
  u16 src_port;
  u16 dst_port;

  // Tcp flags
  u8 flags;
};

// Use the ring buffer to transform the packet info
BPF_RINGBUF_OUTPUT(pkt_buffer, 8);

int extract_pkt_info(struct xdp_md *ctx) {
  // Reserve the space for the packet
  struct packet *pkt = pkt_buffer.ringbuf_reserve(sizeof(struct packet));
  if (!pkt) {
    // TODO: need an alert to indicate that the ring buffer is full
    return XDP_DROP;
  }

  // Generate timestamp data
  pkt->timestamp = bpf_ktime_get_ns();

  // Fetch the packet data
  void *data = (void *)(long)ctx->data;
  void *data_end = (void *)(long)ctx->data_end;

  // Check that whether it's an IP packet
  struct ethhdr *eth = data;
  if (data + sizeof(struct ethhdr) > data_end ||
      bpf_ntohs(eth->h_proto) != ETH_P_IP) {
    pkt_buffer.ringbuf_discard(pkt, 0);
    return XDP_PASS;
  }

  // Fetch information from IP header
  struct iphdr *iph = data + sizeof(struct ethhdr);

  // Filter the package which is too small
  if ((void *)iph + sizeof(struct iphdr) > data_end) {
    pkt_buffer.ringbuf_discard(pkt, 0);
    return XDP_DROP;
  }

  pkt->protocol = iph->protocol;
  pkt->src_ip = iph->saddr;
  pkt->dst_ip = iph->daddr;

  // Fetch info from TCP header
  if (iph->protocol == IPPROTO_ICMP) {
    struct icmphdr *icmph = (void *)iph + sizeof(struct iphdr);
    if ((void *)icmph + sizeof(struct icmphdr) <= data_end) {
      // Fetch ICMP type and code
      pkt->icmp_type = icmph->type;
      pkt->icmp_code = icmph->code;
    } else {
      pkt_buffer.ringbuf_discard(pkt, 0);
      return XDP_DROP;
    }
  } else if (iph->protocol == IPPROTO_TCP) {
    struct tcphdr *tcph = (void *)iph + sizeof(struct iphdr);
    if ((void *)tcph + sizeof(struct tcphdr) <= data_end) {
      // Fetch flags
      pkt->flags = (tcph->fin << 7) | (tcph->syn << 6) | (tcph->rst << 5) |
                   (tcph->psh << 4) | (tcph->ack << 3) | (tcph->urg << 2);

      // Fetch ports
      pkt->src_port = bpf_ntohs(tcph->source);
      pkt->dst_port = bpf_ntohs(tcph->dest);
    } else {
      pkt_buffer.ringbuf_discard(pkt, 0);
      return XDP_DROP;
    }
  } else if (iph->protocol == IPPROTO_UDP) {
    struct udphdr *udph = (void *)iph + sizeof(struct iphdr);
    if ((void *)udph + sizeof(struct udphdr) <= data_end) {
      // Fetch ports
      pkt->src_port = bpf_ntohs(udph->source);
      pkt->dst_port = bpf_ntohs(udph->dest);
    } else {
      pkt_buffer.ringbuf_discard(pkt, 0);
      return XDP_DROP;
    }
  }

  // submit the data into user space
  pkt_buffer.ringbuf_submit(pkt, 0);
  return XDP_PASS;
}

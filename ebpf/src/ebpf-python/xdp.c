#include <linux/icmp.h>
#include <linux/ip.h>
#include <linux/tcp.h>
#include <linux/udp.h>

BPF_HASH(black_list, u32, u8);

int extract_pkt_info(struct xdp_md *ctx) {
  // Fetch the packet data
  void *data = (void *)(long)ctx->data;
  void *data_end = (void *)(long)ctx->data_end;

  // Check that whether it's an IP packet
  struct ethhdr *eth = data;
  if (data + sizeof(struct ethhdr) > data_end ||
      bpf_ntohs(eth->h_proto) != ETH_P_IP) {
    return XDP_PASS;
  }

  // Fetch information from IP header
  struct iphdr *iph = data + sizeof(struct ethhdr);

  // Filter the package which is too small
  if ((void *)iph + sizeof(struct iphdr) > data_end) {
    return XDP_DROP;
  }

  bpf_trace_printk("%u\n", bpf_ntohl(iph->saddr));
  u32 key = bpf_ntohl(iph->saddr);

  if (black_list.lookup(&key)) {
    return XDP_DROP;
  }

  return XDP_PASS;
}

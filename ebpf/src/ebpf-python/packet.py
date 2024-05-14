from pydantic import BaseModel
from utils import network_address_to_ip


class Packet(BaseModel):
    timestamp: int

    # IP header
    src: int
    dst: int
    proto: int

    # TCP and UDP ports
    sport: int
    dport: int

    # TCP flags
    fin: bool
    syn: bool
    rst: bool
    psh: bool
    ack: bool
    urg: bool

    # ICMP info
    icmp_type: int
    icmp_code: int

    @property
    def id(self):
        src_ip = network_address_to_ip(self.src)
        dst_ip = network_address_to_ip(self.dst)
        return f"{src_ip}-{dst_ip}-{self.sport}-{self.dport}-{self.proto}"

    @property
    def bwd_id(self):
        src_ip = network_address_to_ip(self.src)
        dst_ip = network_address_to_ip(self.dst)
        return f"{dst_ip}-{src_ip}-{self.sport}-{self.dport}-{self.proto}"

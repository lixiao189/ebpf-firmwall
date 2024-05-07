from pydantic import BaseModel


class Packet(BaseModel):
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

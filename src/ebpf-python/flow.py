from pydantic import BaseModel
from typing import Dict, List
from packet import Packet


class FLow(BaseModel):
    pass


class FlowGenerator(BaseModel):
    flows: Dict[str, List[Packet]] = {}

    def add_packet(self, packet: Packet):
        fwd_id = packet.id
        bwd_id = packet.bwd_id

        if fwd_id not in self.flows and bwd_id not in self.flows:
            pass
        else:
            pass

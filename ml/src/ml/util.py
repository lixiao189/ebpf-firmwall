def addr_to_ip(addr: str) -> str:
    result = addr.split(':', 1)
    if len(result) != 2:
        return ""
    else:
        return result[0]

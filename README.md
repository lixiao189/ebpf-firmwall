# EBPF firewall

A tiny firewall based on bcc python

Use the follow command to show the python virtual env path

```bash
poetry env info --path
```

## Message queue

use rabbit mq as message queue

message: `{IP-info}+{Data}`

## Folder structure

### ebpf 

> the ebpf codes

- data folder: ML model puts at here
- test folder Tests

### waf

> the reverse proxy 

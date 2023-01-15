# Configuration Guide

By default, the configuration of `dd-gateway` is stored in `data/`.

This folder has two files:
 - `config.json` - The main configuration
 - `apis.json` - A list of named APIs with their respective URLs.

## Defaults

### config.json

```json
{
    "cors": {
        "allowedHost": "http://localhost:4096"
    },
    "api": {
        "version": "v1"
    },
    "http": {
        "port": 9000
    }
}
```

**Clarifications**:

- `cors.allowedHost` usually refers to the client host for which the gateway is to accept requests from. 

### apis.json
```json
{
    "auth": "http://localhost:8082",
    "usersvc": "http://localhost:1927",
    "msgsvc": "http://localhost:1928",
    "cdn": "http://localhost:8083"
}
```
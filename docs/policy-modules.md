# Policy modules

Rem can reuse shared routing logic by storing typed snippet records as **policy modules**.

## Supported kinds

- `routing-rule-set` — reusable `routing.rules` fragments
- `outbound-set` — reusable `outbounds` fragments
- `balancer-set` — reusable `routing.balancers` fragments

## Supported scopes

- `shared` — intended for reuse across profiles
- `internal` — operator/private helper module

## Create a reusable JP split module

### Outbound module

```json
{
  "name": "OUTBOUND_JP_AI",
  "kind": "outbound-set",
  "scope": "shared",
  "description": "JP AI egress outbound",
  "snippet": [
    {
      "tag": "JP-AI",
      "protocol": "freedom",
      "settings": {}
    }
  ]
}
```

### Routing module

```json
{
  "name": "POLICY_SPLIT_NORMAL",
  "kind": "routing-rule-set",
  "scope": "shared",
  "description": "Send AI / media domains to JP-AI",
  "snippet": [
    {
      "type": "field",
      "domain": [
        "domain:openai.com",
        "domain:chatgpt.com",
        "domain:byteoversea.com",
        "domain:netflix.com"
      ],
      "outboundTag": "JP-AI"
    }
  ]
}
```

## Use policy modules in a config profile

### Legacy placeholder style

```json
{
  "outbounds": [
    { "tag": "DIRECT", "protocol": "freedom" },
    { "tag": "BLOCK", "protocol": "blackhole" },
    { "snippet": "OUTBOUND_JP_AI" }
  ],
  "routing": {
    "rules": [{ "snippet": "POLICY_SPLIT_NORMAL" }]
  }
}
```

### New profile-assembly style

```json
{
  "inbounds": [
    {
      "tag": "YC-Reality",
      "listen": "0.0.0.0",
      "port": 443,
      "protocol": "vless",
      "settings": { "clients": [], "decryption": "none" }
    }
  ],
  "outbounds": [
    { "tag": "DIRECT", "protocol": "freedom" },
    { "tag": "BLOCK", "protocol": "blackhole" }
  ],
  "routing": { "rules": [] },
  "policyModules": {
    "outbounds": ["OUTBOUND_JP_AI"],
    "routingRules": ["POLICY_SPLIT_NORMAL"]
  }
}
```

At runtime, Rem resolves `policyModules` into snippet placeholders, expands the snippet payloads, and only then injects users / returns computed config preview.

Creating, updating, or deleting a snippet automatically queues a configuration reload for every profile that references the snippet. This applies to both `policyModules` references and legacy `{ "snippet": "..." }` placeholders. Profiles that do not reference the changed snippet are not reloaded.

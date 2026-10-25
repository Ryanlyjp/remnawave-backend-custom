# Policy modules

Rem can reuse shared routing logic by storing typed snippet records as **policy modules**.

Every module and config profile has an `engine`: `XRAY` or `SINGBOX`. Module names are unique
within an engine, so both engines may have a module named `POLICY_SPLIT_NORMAL` without sharing
payloads or deployment targets. Node configuration generation also filters modules by the
profile engine, so an identically named Sing-box module cannot replace an Xray module.

## Supported kinds

- `routing-rule-set` — reusable `routing.rules` fragments
- `outbound-set` — reusable `outbounds` fragments
- `balancer-set` — reusable `routing.balancers` fragments

`balancer-set` is Xray-only. Xray routing modules use `outboundTag`; Sing-box routing modules use
`outbound` or `action` and are inserted into `route.rules`.

## Supported scopes

- `shared` — intended for reuse across profiles
- `internal` — operator/private helper module

## Create a reusable JP split module

### Outbound module

```json
{
  "name": "OUTBOUND_JP_AI",
  "engine": "XRAY",
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
  "engine": "XRAY",
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

## Sing-box equivalent

Create separate `SINGBOX` modules with equivalent routing intent; do not paste Xray JSON into them.

```json
{
  "name": "POLICY_SPLIT_NORMAL",
  "engine": "SINGBOX",
  "kind": "routing-rule-set",
  "scope": "shared",
  "snippet": [
    {
      "domain_suffix": ["openai.com", "chatgpt.com", "byteoversea.com", "netflix.com"],
      "outbound": "JP-AI"
    }
  ]
}
```

A Sing-box profile selects only `SINGBOX` modules. On save, Rem expands `policyModules.outbounds`
into `outbounds` and `policyModules.routingRules` into `route.rules`, then sends the full config to
the Agent selected by `CUSTOM_SINGBOX_TARGETS`. The Agent validates the candidate with
`sing-box check` before replacing the live config. An optional credential-free `subscriptionUrl`
uses the first TUIC user's current UUID and password from that Profile when shared subscription
links are generated, so a saved credential change cannot leave the server and subscription out
of sync.

Sing-box inbounds are synchronized into the same selectable inbound list used by internal squads.
A controller startup also synchronizes stored inbounds with the parser for the Profile's engine, so
restarting Remnawave preserves Sing-box inbound UUIDs and their existing squad selections.
A managed TUIC link is included only when the requesting user belongs to a squad that has selected
that Profile's TUIC inbound. The same visibility check is used for Base64/V2Ray clients and Mihomo
clients; Mihomo receives a native `type: tuic` proxy entry. Credentials remain shared by the
Profile and are not generated per user.

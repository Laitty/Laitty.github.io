# Optional visitor API (Cloudflare Worker)

Free-tier scaffold for a later authenticated write path. **Not wired into the live site.** The visitor map keeps writing to ExtendsClass + Abacus until you deliberately point `window.visitorHistory` at this Worker.

## Why optional

- Needs a Cloudflare account, `wrangler` login, and a write token you generate
- Daily GitHub Actions backup already covers durability without CF
- Leaving the client on ExtendsClass avoids breaking the map while CF is unset

## Setup (when you want it)

```bash
cd tools/visitor-api
npm install -g wrangler   # or use npx
wrangler login
# create KV namespace, paste id into wrangler.toml under [[kv_namespaces]]
wrangler secret put WRITE_TOKEN   # long random string
wrangler deploy
```

Then (later, manually) add the Worker URL as a store in `_includes/head.liquid` and send `Authorization: Bearer <WRITE_TOKEN>` from a trusted writer (Actions heal, not from public browser JS — browsers would expose the token).

Public browser traffic should stay on unauthenticated free mirrors or a rate-limited public `GET` only.

## Endpoints (scaffold)

| Method | Path | Auth | Behavior |
| ------ | ---- | ---- | -------- |
| `GET` | `/history` | none | Return `{ places: [...] }` from KV |
| `PUT` | `/history` | `Bearer WRITE_TOKEN` | Merge body with KV (max count per key); reject empty wipe over non-empty store |

## Cost

Cloudflare Workers + KV free tier is enough for a personal site at low volume. Still requires your account and secrets — do not commit tokens.

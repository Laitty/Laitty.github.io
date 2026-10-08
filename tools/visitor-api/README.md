# Visitor API (Cloudflare Worker)

Free-tier Worker that **owns all writes** to ExtendsClass + Abacus. The browser never sees ExtendsClass write URLs or tokens; it only calls `POST /visit` on this Worker.

Until you deploy and paste the Worker URL into `_includes/head.liquid` (`visitorApi`), the live site is **read-only**: map still loads from the seed + public GET mirrors, but new visits are not recorded (fail closed — no public `PUT`).

## Architecture

```
Visitor browser
  ├─ GET seed JSON + ExtendsClass bins (read-only)
  ├─ GET Abacus (optional count reconcile, read-only)
  └─ POST https://<worker>/visit   ← only write path
         │
         ▼
Cloudflare Worker (secrets)
  ├─ HIT Abacus
  └─ PUT ExtendsClass bin A + bin B (dual-mirror heal)
```

## One-time deploy (Tianyou)

Requires a free [Cloudflare](https://dash.cloudflare.com/) account.

```bash
cd tools/visitor-api
npm install -g wrangler    # or: npx wrangler …
wrangler login

# Long random admin token (for PUT /history from Actions / you — NOT for the browser)
openssl rand -hex 32
wrangler secret put WRITE_TOKEN
# paste the token

# Same ExtendsClass bin URLs currently used for reads (Worker alone will PUT them)
wrangler secret put EXTENDSCLASS_A
# paste: https://extendsclass.com/api/json-storage/bin/feeabdc

wrangler secret put EXTENDSCLASS_B
# paste: https://extendsclass.com/api/json-storage/bin/ddfbcda

wrangler deploy
```

Deploy prints a URL like `https://laitty-visitor-api.<your-subdomain>.workers.dev`.

1. Open `_includes/head.liquid` and set:

   ```js
   visitorApi: "https://laitty-visitor-api.<your-subdomain>.workers.dev",
   ```

2. Commit and push so GitHub Pages picks it up.

3. Smoke-test:

   ```bash
   curl -sS https://laitty-visitor-api.<subdomain>.workers.dev/history | head
   curl -sS -X POST https://laitty-visitor-api.<subdomain>.workers.dev/visit \
     -H 'Content-Type: application/json' \
     -H 'Origin: https://laitty.github.io' \
     -d '{"key":"0.0,0.0","lat":0,"lng":0,"label":"Smoke"}'
   ```

## Endpoints

| Method | Path | Auth | Behavior |
| ------ | ---- | ---- | -------- |
| `GET` | `/history` | none | Merge-read both ExtendsClass bins → `{ places }` |
| `POST` | `/visit` | none (CORS + light IP rate limit) | Hit Abacus, merge place, dual-`PUT` bins |
| `PUT` | `/history` | `Authorization: Bearer WRITE_TOKEN` | Admin merge; refuse empty wipe of non-empty data |

CORS allows `https://laitty.github.io` and local Jekyll/Docker origins (`localhost:4000`, `:8080`).

## Optional: Actions heal via Worker

Daily backup (`bin/backup_visit_history.py`) **GETs** public bins by default and no longer PUTs them directly. To heal remotes from CI after a wipe, add repo secrets `VISITOR_API_URL` + `VISITOR_WRITE_TOKEN` and run:

```bash
python3 bin/backup_visit_history.py --heal-via-worker
```

## Cost / safety

- Workers free tier is enough for a personal site.
- Do **not** commit `WRITE_TOKEN` or put it in frontend JS.
- Rotating bins: create new ExtendsClass bins, `wrangler secret put` the new URLs, update public GET `stores` in `head.liquid` if you still expose read URLs, redeploy Worker.

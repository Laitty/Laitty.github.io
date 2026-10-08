# Visitor map: storage, backup, and privacy

Site-specific notes for the cumulative visitor map on the publications page. This is not part of upstream al-folio runtime; it lives in this repository’s static assets and third-party free stores.

## Data flow

1. A visitor loads a page that includes `assets/js/visitor-map.js` (wired from `_includes/head.liquid`).
2. The client **reads**:
   - **Seed** — committed `assets/json/visit-history.json` (static fallback / restore point)
   - **Public mirrors** — two ExtendsClass JSON bins (GET only from the browser)
   - **Optional** — `GET {visitorApi}/history` when the Cloudflare Worker is configured
   - **Counters** — Abacus GET under namespace `laitty-github-io-visits` (read-only reconcile)
3. Location is coarse IP geolocation via [geojs](https://www.geojs.io/) in the browser (Worker can fall back to Cloudflare `request.cf`). Coordinates are rounded to 0.1° (~11 km).
4. **Writes** go only to the Cloudflare Worker: `POST {visitorApi}/visit`. The Worker holds ExtendsClass URLs + hits Abacus and dual-`PUT`s both bins. If `visitorApi` is empty, recording is skipped (fail closed — no public `PUT`).

```
Browser
  ├─ GET seed JSON (GitHub Pages)
  ├─ GET ExtendsClass bin A + bin B          (read-only)
  ├─ GET Abacus counters                     (read-only)
  ├─ GET geojs (IP → coarse lat/lng + label)
  └─ POST Cloudflare Worker /visit           (only write path)
         │
         ▼
Worker (secrets: EXTENDSCLASS_*, WRITE_TOKEN)
  ├─ HIT Abacus
  └─ PUT ExtendsClass bin A + bin B

GitHub Actions (daily)
  └─ bin/backup_visit_history.py
       ├─ GET seed + bins (+ Abacus for known keys)
       ├─ write assets/json/visit-history.json if richer
       └─ optional heal via Worker PUT /history (secrets)
```

## Stores

| Store                            | Role                        | Durability                                    |
| -------------------------------- | --------------------------- | --------------------------------------------- |
| Cloudflare Worker                | Sole write path + dual heal | Free tier; requires deploy + secrets          |
| ExtendsClass bins                | Live map data (dual mirror) | Best-effort; browser GET only; Worker PUTs    |
| Abacus                           | Per-key visit counters      | HIT only from Worker; browser may GET         |
| `assets/json/visit-history.json` | Git-backed seed / restore   | Survives remote wipe; updated by Actions cron |

Public GET URLs may remain in `head.liquid` for the map. Write URLs live only in Worker secrets (`tools/visitor-api/`).

## Deploy the Worker

Exact steps: [`tools/visitor-api/README.md`](../tools/visitor-api/README.md).

Summary: `wrangler login` → `secret put WRITE_TOKEN` / `EXTENDSCLASS_A` / `EXTENDSCLASS_B` → `wrangler deploy` → paste Worker URL into `visitorApi` in `_includes/head.liquid` → push.

## Backup Action

Workflow: [`.github/workflows/backup-visit-history.yml`](../.github/workflows/backup-visit-history.yml)

- **Schedule:** daily `17 5 * * *` UTC, plus `workflow_dispatch`
- **Script:** `python3 bin/backup_visit_history.py` (stdlib only)
- **Commit:** only when the seed file changes (`chore: backup visit history seed [skip ci]`)
- **Scope:** runs only on `Laitty/Laitty.github.io`
- **Default:** GET remotes + update seed; **no direct ExtendsClass PUT**
- **Optional heal:** repo secrets `VISITOR_API_URL` + `VISITOR_WRITE_TOKEN`, then `--heal-via-worker`

Manual run: Actions → “Backup visit history” → Run workflow.

Local dry-run:

```bash
python3 bin/backup_visit_history.py --dry-run
```

### Restore from git seed

If both ExtendsClass bins are emptied or corrupted:

1. Ensure `assets/json/visit-history.json` is the last good backup (from git history if needed).
2. Heal via Worker (preferred):

   ```bash
   export VISITOR_API_URL=https://laitty-visitor-api.<subdomain>.workers.dev
   export VISITOR_WRITE_TOKEN=<WRITE_TOKEN>
   python3 bin/backup_visit_history.py --heal-via-worker
   ```

3. Or `PUT /history` with Bearer token against the Worker using the seed JSON body.

## Privacy (honest summary)

- **What is stored:** rounded lat/lng, a display label (city/country when available), and a visit count per coarse cell. No names, emails, or user accounts.
- **How location is derived:** IP geolocation (geojs in browser, or Cloudflare edge metadata in the Worker). Accuracy is city-level at best; VPNs/proxies mislocate visitors.
- **Cookies / consent:** the map uses `sessionStorage` only to avoid double-counting within a tab session. There is **no cookie-consent gate** specifically for this feature today.
- **Public data:** ExtendsClass bins (if left world-readable) and the committed seed are world-readable. Writes require the Worker (and admin `WRITE_TOKEN` for `PUT /history`).

## What this is not

This stack is **not enterprise-reliable**: third-party free APIs can change, wipe, or throttle without notice; Actions can miss a day; `GITHUB_TOKEN` bot commits do not always retrigger Pages deploy (seed still lands in git). Dual mirrors + daily git backup + Worker-gated writes are the free hardening layer, not a SLA.

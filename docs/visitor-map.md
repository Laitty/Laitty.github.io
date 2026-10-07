# Visitor map: storage, backup, and privacy

Site-specific notes for the cumulative visitor map on the publications page. This is not part of upstream al-folio runtime; it lives in this repository’s static assets and third-party free stores.

## Data flow

1. A visitor loads a page that includes `assets/js/visitor-map.js` (wired from `_includes/head.liquid`).
2. The client reads:
   - **Seed** — committed `assets/json/visit-history.json` (static fallback / restore point)
   - **Primary mirrors** — two public ExtendsClass JSON bins (live read/write)
   - **Counters** — Abacus (`abacus.jasoncameron.dev`) per place key under namespace `laitty-github-io-visits`
3. Location is coarse IP geolocation via [geojs](https://www.geojs.io/) (`get.geojs.io`). Coordinates are rounded to 0.1° (~11 km). City/country labels come from that response.
4. Counts are merged by place key (higher `n` wins). The client heals any ExtendsClass bin that is behind the merged registry, and dual-writes both bins.

```
Browser
  ├─ GET seed JSON (GitHub Pages)
  ├─ GET/PUT ExtendsClass bin A + bin B
  ├─ GET/HIT Abacus counters
  └─ GET geojs (IP → coarse lat/lng + label)
         │
         ▼
GitHub Actions (daily)
  └─ bin/backup_visit_history.py
       ├─ merge seed + bins (+ Abacus for known keys)
       ├─ write assets/json/visit-history.json if richer
       └─ optional PUT-heal of behind bins
```

## Stores

| Store | Role | Durability |
| ----- | ---- | ---------- |
| ExtendsClass bins | Live map data (dual mirror) | Best-effort free JSON storage; can wipe or rate-limit |
| Abacus | Per-key visit counters | Independent of ExtendsClass; no full key listing API |
| `assets/json/visit-history.json` | Git-backed seed / restore | Survives remote wipe; updated by Actions cron |

Bin URLs are public (same as in `head.liquid`). No GitHub Actions secrets are required for backup.

## Backup Action

Workflow: [`.github/workflows/backup-visit-history.yml`](../.github/workflows/backup-visit-history.yml)

- **Schedule:** daily `17 5 * * *` UTC, plus `workflow_dispatch`
- **Script:** `python3 bin/backup_visit_history.py` (stdlib only)
- **Commit:** only when the seed file changes (`chore: backup visit history seed [skip ci]`)
- **Scope:** runs only on `Laitty/Laitty.github.io`

Manual run: Actions → “Backup visit history” → Run workflow.

Local dry-run:

```bash
python3 bin/backup_visit_history.py --dry-run
```

### Restore from git seed

If both ExtendsClass bins are emptied or corrupted:

1. Ensure `assets/json/visit-history.json` is the last good backup (from git history if needed).
2. Run `python3 bin/backup_visit_history.py` (or the workflow). The script merges the seed and PUT-heals bins that are behind.
3. Or open the site once after the seed is restored: the client’s `heal` path also pushes richer data to behind remotes.

## Privacy (honest summary)

- **What is stored:** rounded lat/lng, a display label (city/country when available), and a visit count per coarse cell. No names, emails, or user accounts.
- **How location is derived:** server-side IP geolocation via geojs (third party). Accuracy is city-level at best; VPNs/proxies mislocate visitors.
- **Cookies / consent:** the map uses `sessionStorage` only to avoid double-counting within a tab session. There is **no cookie-consent gate** specifically for this feature today. If you need GDPR-style consent, enable site-wide cookie consent (see [Analytics](ANALYTICS.md) / `al_cookie`) and gate third-party calls accordingly — that is not wired here yet.
- **Public data:** ExtendsClass bins and the committed seed are world-readable.

## Optional Cloudflare Worker (not required)

Scaffold: [`tools/visitor-api/`](../tools/visitor-api/). Free-tier Worker + KV can later provide authenticated writes. The live site does **not** depend on it; deploy only if you create a Cloudflare account and add secrets. Until then, ExtendsClass + Abacus + the Actions seed remain the path.

## What this is not

This stack is **not enterprise-reliable**: third-party free APIs can change, wipe, or throttle without notice; Actions can miss a day; `GITHUB_TOKEN` bot commits do not always retrigger Pages deploy (seed still lands in git). Dual mirrors + daily git backup are the free hardening layer, not a SLA.

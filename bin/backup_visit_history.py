#!/usr/bin/env python3
"""Merge remote visitor-map stores into the committed seed JSON.

Mirrors the client merge/heal rules in assets/js/visitor-map.js:
  - take the richer (higher) count per place key
  - optionally lift counts from Abacus for known keys
  - refuse to overwrite a non-empty seed with an empty merge
  - optionally PUT-heal ExtendsClass bins that are behind

Usage:
    python3 bin/backup_visit_history.py
    python3 bin/backup_visit_history.py --no-heal-remote
    python3 bin/backup_visit_history.py --dry-run
"""

from __future__ import annotations

import argparse
import json
import shutil
import subprocess
import sys
import tempfile
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_OUT = REPO_ROOT / "assets" / "json" / "visit-history.json"

STORES = [
    "https://extendsclass.com/api/json-storage/bin/feeabdc",
    "https://extendsclass.com/api/json-storage/bin/ddfbcda",
]
COUNTER = "https://abacus.jasoncameron.dev"
NAMESPACE = "laitty-github-io-visits"
USER_AGENT = "laitty-visit-history-backup/1.0 (+https://github.com/Laitty/Laitty.github.io)"
HAS_CURL = shutil.which("curl") is not None


def _curl_json(method: str, url: str, body: bytes | None = None, timeout: float = 30.0) -> tuple[int, bytes]:
    cmd = [
        "curl",
        "-sS",
        "-X",
        method,
        "-A",
        USER_AGENT,
        "-H",
        "Accept: application/json",
        "--max-time",
        str(int(timeout)),
        "-w",
        "\n%{http_code}",
    ]
    tmp_path = None
    if body is not None:
        tmp = tempfile.NamedTemporaryFile(delete=False)
        tmp.write(body)
        tmp.close()
        tmp_path = tmp.name
        cmd.extend(["-H", "Content-Type: application/json", "--data-binary", f"@{tmp_path}"])
    cmd.append(url)
    try:
        proc = subprocess.run(cmd, capture_output=True, check=False)
    finally:
        if tmp_path:
            Path(tmp_path).unlink(missing_ok=True)
    if proc.returncode != 0:
        raise RuntimeError(proc.stderr.decode("utf-8", errors="replace") or f"curl exit {proc.returncode}")
    out = proc.stdout
    # Last line is HTTP status from -w.
    nl = out.rfind(b"\n")
    if nl < 0:
        raise RuntimeError("curl produced no status line")
    status = int(out[nl + 1 :].decode("ascii").strip() or "0")
    return status, out[:nl]


def fetch_json(url: str, timeout: float = 30.0, *, allow_404: bool = False) -> object | None:
    try:
        if HAS_CURL:
            status, raw = _curl_json("GET", url, timeout=timeout)
            if status == 404 and allow_404:
                return {"value": 0}
            if not (200 <= status < 300):
                raise RuntimeError(f"HTTP {status}")
            return json.loads(raw.decode("utf-8") or "null")
        req = urllib.request.Request(
            url,
            headers={"User-Agent": USER_AGENT, "Accept": "application/json"},
            method="GET",
        )
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        if allow_404 and exc.code == 404:
            return {"value": 0}
        print(f"warn: GET failed for {url}: {exc}", file=sys.stderr)
        return None
    except Exception as exc:  # noqa: BLE001 — network helpers must soft-fail
        print(f"warn: GET failed for {url}: {exc}", file=sys.stderr)
        return None


def put_json(url: str, payload: dict, timeout: float = 30.0) -> bool:
    body = json.dumps(payload, ensure_ascii=False, separators=(",", ":")).encode("utf-8")
    try:
        if HAS_CURL:
            status, _ = _curl_json("PUT", url, body=body, timeout=timeout)
            return 200 <= status < 300
        req = urllib.request.Request(
            url,
            data=body,
            headers={
                "User-Agent": USER_AGENT,
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
            method="PUT",
        )
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            return 200 <= resp.status < 300
    except Exception as exc:  # noqa: BLE001
        print(f"warn: PUT failed for {url}: {exc}", file=sys.stderr)
        return False


def normalize(data: object | None) -> list[dict]:
    if data is None:
        return []
    if isinstance(data, list):
        places = data
    elif isinstance(data, dict):
        places = data.get("places")
    else:
        return []
    return places if isinstance(places, list) else []


def pack(places: list[dict]) -> list[dict]:
    packed = []
    for place in places:
        lat = place.get("lat")
        lng = place.get("lng")
        try:
            lat_n = float(lat) if lat is not None else None
            lng_n = float(lng) if lng is not None else None
        except (TypeError, ValueError):
            lat_n = lng_n = None
        located = lat_n is not None and lng_n is not None
        packed.append(
            {
                "key": place["key"],
                "n": int(place.get("n") or 0),
                "lat": round(lat_n, 1) if located else None,
                "lng": round(lng_n, 1) if located else None,
                "label": place.get("label") or "Visit",
            }
        )
    return packed


def merge(lists: list[list[dict]]) -> list[dict]:
    by_key: dict[str, dict] = {}
    for place in (p for lst in lists for p in lst):
        if not isinstance(place, dict):
            continue
        key = place.get("key")
        if not key:
            continue
        try:
            lat = float(place["lat"]) if place.get("lat") is not None else None
            lng = float(place["lng"]) if place.get("lng") is not None else None
        except (TypeError, ValueError):
            lat = lng = None
        located = lat is not None and lng is not None
        if key != "unknown" and not located:
            continue
        n = int(place.get("n") or 0)
        prev = by_key.get(key)
        if prev is None or n >= int(prev.get("n") or 0):
            by_key[key] = {
                "key": key,
                "n": max(n, int(prev["n"]) if prev else 0),
                "lat": round(lat, 1) if located else None,
                "lng": round(lng, 1) if located else None,
                "label": place.get("label") or (prev.get("label") if prev else None) or "Visit",
            }
    return list(by_key.values())


def behind(remote: list[dict], full: list[dict]) -> bool:
    counts = {p["key"]: int(p.get("n") or 0) for p in remote}
    return any(counts.get(p["key"], 0) < int(p.get("n") or 0) for p in full)


def counter_key(key: str) -> str:
    return str(key).replace(",", "_")


def read_count(key: str) -> int | None:
    url = f"{COUNTER}/get/{NAMESPACE}/{urllib.parse.quote(counter_key(key), safe='')}"
    data = fetch_json(url, allow_404=True)
    if data is None:
        return None
    if isinstance(data, dict) and "value" in data:
        try:
            return int(data["value"] or 0)
        except (TypeError, ValueError):
            return 0
    return None


def sync_counts(places: list[dict]) -> list[dict]:
    out = []
    for place in places:
        value = read_count(place["key"])
        if value is None:
            out.append(place)
        else:
            out.append({**place, "n": max(int(place.get("n") or 0), value)})
    return out


def load_seed(path: Path) -> list[dict]:
    if not path.is_file():
        return []
    try:
        return normalize(json.loads(path.read_text(encoding="utf-8")))
    except (OSError, json.JSONDecodeError) as exc:
        print(f"warn: could not read seed {path}: {exc}", file=sys.stderr)
        return []


def fingerprint(places: list[dict]) -> str:
    rows = [
        f"{p['key']}:{int(p.get('n') or 0)}:{p.get('label') or ''}"
        for p in places
    ]
    return "|".join(sorted(rows))


def write_seed(path: Path, places: list[dict], dry_run: bool) -> bool:
    payload = {"places": pack(places)}
    text = json.dumps(payload, ensure_ascii=False, indent=2) + "\n"
    if dry_run:
        print(f"dry-run: would write {len(places)} places to {path}")
        return False
    path.parent.mkdir(parents=True, exist_ok=True)
    before = path.read_text(encoding="utf-8") if path.is_file() else ""
    if before == text:
        print(f"unchanged: {path} ({len(places)} places)")
        return False
    path.write_text(text, encoding="utf-8")
    print(f"wrote: {path} ({len(places)} places)")
    return True


def heal_remotes(places: list[dict], remotes: list[list[dict] | None], dry_run: bool) -> None:
    packed = {"places": pack(places)}
    if not places:
        print("skip remote heal: merged registry is empty")
        return
    for url, remote in zip(STORES, remotes):
        if remote is None:
            print(f"skip heal {url}: fetch failed")
            continue
        if not behind(remote, places):
            print(f"ok: {url} already current")
            continue
        if dry_run:
            print(f"dry-run: would PUT heal {url}")
            continue
        ok = put_json(url, packed)
        print(f"{'healed' if ok else 'failed heal'}: {url}")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--out", type=Path, default=DEFAULT_OUT, help="seed JSON path")
    parser.add_argument("--no-abacus", action="store_true", help="skip Abacus count reconcile")
    parser.add_argument("--no-heal-remote", action="store_true", help="do not PUT ExtendsClass bins")
    parser.add_argument("--dry-run", action="store_true", help="print actions without writing")
    args = parser.parse_args()

    seed = load_seed(args.out)
    remotes_raw = [fetch_json(f"{url}?t=backup") for url in STORES]
    remotes = [normalize(raw) if raw is not None else None for raw in remotes_raw]
    fetched = [r for r in remotes if r is not None]
    failed = sum(1 for r in remotes if r is None)

    if failed == len(STORES) and not seed:
        print("error: all remote stores failed and no local seed", file=sys.stderr)
        return 1

    merged = merge([seed, *fetched])
    if not args.no_abacus and merged:
        print(f"reconciling Abacus counts for {len(merged)} keys…")
        merged = sync_counts(merged)
        merged = merge([merged])

    # Wipe guard: never replace a non-empty seed with empty when remotes failed.
    if not merged and seed:
        print("refuse: would wipe non-empty seed with empty merge; keeping seed", file=sys.stderr)
        merged = seed
    if failed and seed and fingerprint(merged) == fingerprint([]) and seed:
        print("refuse: empty merge after remote failures; keeping seed", file=sys.stderr)
        merged = seed

    changed = write_seed(args.out, merged, args.dry_run)
    if not args.no_heal_remote:
        heal_remotes(merged, remotes, args.dry_run)

    print(
        f"summary: places={len(merged)} seed_changed={changed} "
        f"remotes_ok={len(fetched)}/{len(STORES)} abacus={not args.no_abacus}"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

#!/usr/bin/env python3
"""Sync `_bibliography/papers.bib` with Google Scholar and arXiv.

The publications page is generated from `papers.bib`. This script looks for
papers that are on Tianyou Lai's Scholar profile or arXiv but missing from the
bib, and for existing entries that still lack an arXiv id.

It is conservative on purpose:
  - new arXiv papers are appended as `category = {preprint}`
  - missing `arxiv` fields are filled in
  - existing titles, venues, author lists, and selected flags are left alone
  - venue mismatches are printed, not applied

Usage:
    python3 bin/sync_scholar_pubs.py              # dry-run
    python3 bin/sync_scholar_pubs.py --write      # update papers.bib
    python3 bin/sync_scholar_pubs.py --skip-scholar
"""

from __future__ import annotations

import argparse
import os
import re
import sys
import urllib.error
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[1]
BIB_PATH = REPO_ROOT / "_bibliography" / "papers.bib"
SOCIALS_PATH = REPO_ROOT / "_data" / "socials.yml"
ARXIV_API = "https://export.arxiv.org/api/query"
ATOM = "{http://www.w3.org/2005/Atom}"
ARXIV_NS = "{http://arxiv.org/schemas/atom}"
USER_AGENT = "laitty-github-io pub-sync/1.0 (+https://github.com/Laitty/Laitty.github.io)"
AUTHOR_QUERY = '"Tianyou Lai"'
ARXIV_ID_RE = re.compile(r"(\d{4}\.\d{4,5})(?:v\d+)?")
ENTRY_RE = re.compile(r"^@(\w+)\{([^,]+),\n(.*?)\n\}", re.M | re.S)
FIELD_RE = re.compile(r"^(\s*)([A-Za-z_]+)\s*=\s*\{(.*)\}\s*,?\s*$", re.M)
STOPWORDS = {
    "a",
    "an",
    "and",
    "for",
    "from",
    "in",
    "of",
    "on",
    "the",
    "to",
    "with",
}


def norm_title(value: str) -> str:
    text = value.lower()
    text = re.sub(r"[{}$\\\\]", " ", text)
    text = re.sub(r"[^a-z0-9]+", " ", text)
    return " ".join(text.split())


def extract_arxiv_id(value: str | None) -> str:
    if not value:
        return ""
    match = ARXIV_ID_RE.search(str(value))
    return match.group(1) if match else ""


def load_scholar_user_id() -> str:
    if not SOCIALS_PATH.exists():
        return ""
    for line in SOCIALS_PATH.read_text(encoding="utf-8").splitlines():
        if line.strip().startswith("scholar_userid:"):
            return line.split(":", 1)[1].strip().strip("'\"")
    return ""


def parse_bib(text: str) -> list[dict]:
    entries = []
    for match in ENTRY_RE.finditer(text):
        fields = {}
        for field in FIELD_RE.finditer(match.group(3)):
            fields[field.group(2).lower()] = field.group(3)
        entries.append(
            {
                "type": match.group(1),
                "key": match.group(2),
                "fields": fields,
                "raw": match.group(0),
            }
        )
    return entries


def fetch_arxiv_papers() -> list[dict]:
    params = urllib.parse.urlencode(
        {
            "search_query": f"au:{AUTHOR_QUERY}",
            "start": 0,
            "max_results": 50,
            "sortBy": "submittedDate",
            "sortOrder": "descending",
        }
    )
    request = urllib.request.Request(
        f"{ARXIV_API}?{params}",
        headers={"User-Agent": USER_AGENT, "Accept": "application/atom+xml"},
    )
    with urllib.request.urlopen(request, timeout=30) as response:
        payload = response.read()
    root = ET.fromstring(payload)
    papers = []
    for entry in root.findall(f"{ATOM}entry"):
        title = " ".join((entry.findtext(f"{ATOM}title") or "").split())
        authors = [el.findtext(f"{ATOM}name") or "" for el in entry.findall(f"{ATOM}author")]
        arxiv_id = extract_arxiv_id(entry.findtext(f"{ATOM}id") or "")
        published = entry.findtext(f"{ATOM}published") or ""
        year = published[:4] if published[:4].isdigit() else ""
        comment = entry.findtext(f"{ARXIV_NS}comment") or ""
        papers.append(
            {
                "title": title,
                "authors": [name for name in authors if name],
                "arxiv": arxiv_id,
                "year": year,
                "venue": "arXiv",
                "comment": comment,
                "source": "arxiv",
            }
        )
    return papers


def fetch_scholar_papers(user_id: str) -> list[dict]:
    from scholarly import scholarly

    scholarly.set_timeout(15)
    scholarly.set_retries(2)
    author = scholarly.search_author_id(user_id)
    author_data = scholarly.fill(author)
    papers = []
    for pub in author_data.get("publications") or []:
        bib = pub.get("bib") or {}
        title = bib.get("title") or ""
        if not title:
            continue
        venue = bib.get("venue") or bib.get("journal") or bib.get("booktitle") or ""
        eprint = bib.get("eprint") or bib.get("arxiv") or ""
        papers.append(
            {
                "title": title,
                "authors": [],
                "arxiv": extract_arxiv_id(eprint) or extract_arxiv_id(venue) or extract_arxiv_id(title),
                "year": str(bib.get("pub_year") or ""),
                "venue": venue,
                "comment": "",
                "source": "scholar",
            }
        )
    return papers


def authors_to_bib(names: list[str]) -> str:
    formatted = []
    for name in names:
        parts = [part for part in name.replace(",", " ").split() if part]
        if not parts:
            continue
        if len(parts) == 1:
            formatted.append(parts[0])
        else:
            formatted.append(f"{parts[-1]}, {' '.join(parts[:-1])}")
    return " and ".join(formatted)


def slug_key(paper: dict, existing_keys: set[str]) -> str:
    authors = paper.get("authors") or []
    last = "lai"
    if authors:
        last = re.sub(r"[^a-z]", "", authors[0].split()[-1].lower()) or last
    year = paper.get("year") or "0000"
    words = [word for word in norm_title(paper["title"]).split() if word not in STOPWORDS]
    token = words[0] if words else "paper"
    base = f"{last}{year}{token}"
    key = base
    index = 2
    while key in existing_keys:
        key = f"{base}{index}"
        index += 1
    existing_keys.add(key)
    return key


def match_entry(paper: dict, entries: list[dict]) -> dict | None:
    arxiv = paper.get("arxiv") or ""
    if arxiv:
        for entry in entries:
            if extract_arxiv_id(entry["fields"].get("arxiv", "")) == arxiv:
                return entry
            if extract_arxiv_id(entry["fields"].get("doi", "")) == arxiv:
                return entry
    title = norm_title(paper.get("title") or "")
    if not title:
        return None
    for entry in entries:
        if norm_title(entry["fields"].get("title", "")) == title:
            return entry
    return None


def insert_arxiv_field(raw: str, arxiv_id: str) -> str:
    if re.search(r"^\s*arxiv\s*=", raw, re.M):
        return raw
    year_line = re.search(r"^(\s*year\s*=\s*\{[^}]*\}\s*,?\s*)$", raw, re.M)
    line = f"  arxiv    = {{{arxiv_id}}},"
    if year_line:
        return raw.replace(year_line.group(1), year_line.group(1) + "\n" + line, 1)
    return raw[:-1] + f"  {line}\n}}"


def render_new_entry(paper: dict, key: str) -> str:
    authors = authors_to_bib(paper.get("authors") or []) or "Lai, Tianyou"
    year = paper.get("year") or "2026"
    return "\n".join(
        [
            f"@article{{{key},",
            f"  title    = {{{paper['title']}}},",
            f"  author   = {{{authors}}},",
            "  journal  = {arXiv},",
            f"  year     = {{{year}}},",
            f"  arxiv    = {{{paper['arxiv']}}},",
            "  selected = {true},",
            "  category = {preprint}",
            "}",
            "",
        ]
    )


def venue_looks_like_arxiv(venue: str) -> bool:
    text = (venue or "").lower()
    return not text or "arxiv" in text or "preprint" in text


def merge(entries: list[dict], papers: list[dict], max_new: int) -> tuple[list[str], list[str], list[str]]:
    fills: list[str] = []
    news: list[str] = []
    notes: list[str] = []
    existing_keys = {entry["key"] for entry in entries}
    added_titles: set[str] = set()

    for paper in papers:
        title = paper["title"]
        entry = match_entry(paper, entries)
        if entry:
            current_arxiv = extract_arxiv_id(entry["fields"].get("arxiv", ""))
            if paper.get("arxiv") and not current_arxiv:
                entry["raw"] = insert_arxiv_field(entry["raw"], paper["arxiv"])
                entry["fields"]["arxiv"] = paper["arxiv"]
                fills.append(f"{entry['key']}: add arxiv {paper['arxiv']} ({title})")
            venue = paper.get("venue") or ""
            current_venue = " ".join(
                filter(
                    None,
                    [
                        entry["fields"].get("journal", ""),
                        entry["fields"].get("booktitle", ""),
                    ],
                )
            )
            if venue and not venue_looks_like_arxiv(venue) and venue.lower() not in current_venue.lower():
                notes.append(f"{entry['key']}: Scholar venue is {venue!r}; bib keeps {current_venue!r}")
            continue

        if not paper.get("arxiv"):
            notes.append(f"unmatched without arXiv id (not added): {title}")
            continue
        if norm_title(title) in added_titles:
            continue
        if len(news) >= max_new:
            notes.append(f"skipped extra new paper over --max-new {max_new}: {title}")
            continue
        key = slug_key(paper, existing_keys)
        rendered = render_new_entry(paper, key)
        entries.append({"type": "article", "key": key, "fields": {"title": title, "arxiv": paper["arxiv"]}, "raw": rendered.rstrip()})
        added_titles.add(norm_title(title))
        news.append(f"{key}: {title} (arXiv:{paper['arxiv']})")

    return fills, news, notes


def rebuild_bib(original: str, entries: list[dict]) -> str:
    rebuilt = original
    parsed_original = {entry["key"]: entry for entry in parse_bib(original)}
    for entry in entries:
        old = parsed_original.get(entry["key"])
        if old and old["raw"] != entry["raw"]:
            rebuilt = rebuilt.replace(old["raw"], entry["raw"], 1)

    new_blocks = []
    original_keys = set(parsed_original)
    for entry in entries:
        if entry["key"] in original_keys:
            continue
        new_blocks.append(entry["raw"].rstrip() + "\n")
    if new_blocks:
        rebuilt = rebuilt.rstrip() + "\n\n" + "\n".join(new_blocks) + "\n"
    return rebuilt


def run_self_test() -> None:
    sample = """---
---

@article{lai2026choice2seq,
  title    = {Correct Choices, Failed Sequences: Choice2Seq Benchmarks Correctness Retention Across Output Interfaces},
  author   = {Lai, Tianyou},
  journal  = {arXiv},
  year     = {2026},
  selected = {true},
  category = {preprint}
}
"""
    entries = parse_bib(sample)
    papers = [
        {
            "title": "Correct Choices, Failed Sequences: Choice2Seq Benchmarks Correctness Retention Across Output Interfaces",
            "authors": ["Tianyou Lai"],
            "arxiv": "2610.16191",
            "year": "2026",
            "venue": "arXiv",
            "source": "arxiv",
        },
        {
            "title": "A Brand New Diagnostic Paper",
            "authors": ["Tianyou Lai", "Wentao Yue"],
            "arxiv": "2612.00001",
            "year": "2026",
            "venue": "arXiv",
            "source": "arxiv",
        },
    ]
    fills, news, notes = merge(entries, papers, max_new=8)
    assert fills and "2610.16191" in fills[0], fills
    assert news and news[0].startswith("lai2026brand"), news
    assert not notes, notes
    print("self-test ok")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--write", action="store_true", help="write updates to papers.bib")
    parser.add_argument("--skip-scholar", action="store_true", help="only query arXiv")
    parser.add_argument("--max-new", type=int, default=8)
    parser.add_argument("--self-test", action="store_true")
    args = parser.parse_args()

    if args.self_test:
        run_self_test()
        return 0

    os.chdir(REPO_ROOT)
    original = BIB_PATH.read_text(encoding="utf-8")
    entries = parse_bib(original)

    papers: list[dict] = []
    try:
        arxiv_papers = fetch_arxiv_papers()
        print(f"arXiv: {len(arxiv_papers)} papers for {AUTHOR_QUERY}")
        papers.extend(arxiv_papers)
    except (urllib.error.URLError, TimeoutError, ET.ParseError) as error:
        print(f"arXiv fetch failed: {error}", file=sys.stderr)
        return 1

    if not args.skip_scholar:
        user_id = load_scholar_user_id()
        if not user_id:
            print("No scholar_userid in _data/socials.yml; skipping Scholar.")
        else:
            try:
                scholar_papers = fetch_scholar_papers(user_id)
                print(f"Google Scholar: {len(scholar_papers)} papers for {user_id}")
                papers.extend(scholar_papers)
            except Exception as error:  # scholarly raises assorted errors on CAPTCHA
                print(f"Google Scholar fetch skipped: {error}")

    fills, news, notes = merge(entries, papers, max_new=args.max_new)
    if fills:
        print("fills:")
        for item in fills:
            print(f"  {item}")
    if news:
        print("new preprints:")
        for item in news:
            print(f"  {item}")
    if notes:
        print("notes:")
        for item in notes:
            print(f"  {item}")
    if not fills and not news:
        print("papers.bib is already current with arXiv/Scholar.")
        return 0

    updated = rebuild_bib(original, entries)
    if args.write:
        BIB_PATH.write_text(updated, encoding="utf-8")
        print(f"wrote {BIB_PATH.relative_to(REPO_ROOT)}")
    else:
        print("dry-run only; pass --write to update papers.bib")
    return 0


if __name__ == "__main__":
    sys.exit(main())

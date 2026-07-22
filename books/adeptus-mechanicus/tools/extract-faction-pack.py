from __future__ import annotations

import argparse
import hashlib
import json
import re
from pathlib import Path

import pdfplumber


ROOT = Path(__file__).resolve().parents[1]
PDF = ROOT / "sources" / "adeptus-mechanicus-faction-pack-v1.0.pdf"
OUTPUT = ROOT / "content" / "adeptus-mechanicus-source.en.json"


def clean_text(value: str) -> str:
    value = re.sub(r"\ufffd+", ".", value)
    value = value.replace("\u00ad", "").replace("\r\n", "\n")
    value = re.sub(r"[ \t]+\n", "\n", value)
    value = re.sub(r"\n{3,}", "\n\n", value)
    return value.strip()


def build_snapshot() -> dict:
    digest = hashlib.sha256(PDF.read_bytes()).hexdigest().upper()
    pages: dict[str, str] = {}
    with pdfplumber.open(PDF) as document:
        for number, page in enumerate(document.pages, 1):
            pages[str(number)] = clean_text(
                page.extract_text(x_tolerance=2, y_tolerance=3) or ""
            )
        return {
            "meta": {
                "title": "Adeptus Mechanicus Faction Pack",
                "version": "1.0",
                "legalFrom": "2026-06-20",
                "pageCount": len(document.pages),
                "sha256": digest,
                "file": "sources/adeptus-mechanicus-faction-pack-v1.0.pdf",
            },
            "pages": pages,
        }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    expected = json.dumps(build_snapshot(), ensure_ascii=False, indent=2) + "\n"
    if args.check:
        if not OUTPUT.exists() or OUTPUT.read_text(encoding="utf-8") != expected:
            print("adeptus-mechanicus-source.en.json is stale")
            return 1
        print("Faction Pack source snapshot is current")
        return 0
    OUTPUT.write_text(expected, encoding="utf-8")
    print(f"Generated {OUTPUT.name}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

from __future__ import annotations

import argparse
import hashlib
import json
import re
from pathlib import Path

import pdfplumber


ROOT = Path(__file__).resolve().parents[1]
PDF = ROOT / "sources" / "tyranids-faction-pack-v1.0.pdf"
OUTPUT = ROOT / "content" / "tyranids-faction-pack.en.json"


def clean_text(value: str) -> str:
    value = re.sub(r"\ufffd+", ".", value)
    value = value.replace("\u00ad", "").replace("\r\n", "\n")
    value = re.sub(r"[ \t]+\n", "\n", value)
    value = re.sub(r"\n{3,}", "\n\n", value)
    return value.strip()


def comparable(value: str) -> str:
    value = value.replace("‑", "-").replace("–", "-").replace("—", "-")
    value = value.replace("/", " / ")
    return re.sub(r"\s+", " ", value).strip().casefold()


def source_text(data: dict, source_pages: list[int]) -> str:
    return "\n".join(data["pages"][str(page)]["text"] for page in source_pages)


def appears_in_source(value: str, page_text: str) -> bool:
    needle = comparable(value)
    haystack = comparable(page_text)
    if needle in haystack:
        return True
    words = iter(haystack.split())
    return all(any(candidate == word for candidate in words) for word in needle.split())


def extract_source() -> tuple[dict, dict[str, dict]]:
    digest = hashlib.sha256(PDF.read_bytes()).hexdigest().upper()
    pages: dict[str, dict] = {}
    with pdfplumber.open(PDF) as document:
        for number, page in enumerate(document.pages, 1):
            text = clean_text(page.extract_text(x_tolerance=2, y_tolerance=3) or "")
            pages[str(number)] = {
                "sha256": hashlib.sha256(text.encode("utf-8")).hexdigest().upper(),
                "text": text,
            }
        meta = {
            "title": "Tyranids Faction Pack",
            "version": "1.0",
            "legalFrom": "2026-06-20",
            "pageCount": len(document.pages),
            "sha256": digest,
            "file": "sources/tyranids-faction-pack-v1.0.pdf",
        }
    return meta, pages


def validate(data: dict) -> list[str]:
    errors: list[str] = []
    serialized = json.dumps(data, ensure_ascii=False)
    for marker in ("вЂ", "вЂ™", "�"):
        if marker in serialized:
            errors.append(f"mojibake marker found: {marker}")
    if len(data.get("detachments", [])) != 4:
        errors.append("expected 4 detachments")
    for detachment in data.get("detachments", []):
        if not detachment.get("rule", {}).get("text"):
            errors.append(f"{detachment.get('id')}: missing detachment rule")
        for stratagem in detachment.get("stratagems", []):
            page_text = source_text(data, stratagem.get("sourcePages", []))
            for field in ("when", "target", "effect"):
                if not stratagem.get(field):
                    errors.append(f"{stratagem.get('id')}: missing {field}")
                elif not appears_in_source(stratagem[field], page_text):
                    errors.append(f"{stratagem.get('id')}: {field} does not match PDF text")
    expected = {"matched": 3, "imperialArmour": 3, "legends": 5}
    for group, count in expected.items():
        if len(data.get("datasheets", {}).get(group, [])) != count:
            errors.append(f"expected {count} {group} datasheets")
    if len(data.get("faqs", [])) != 14:
        errors.append("expected 14 FAQs")
    for faq in data.get("faqs", []):
        page_text = source_text(data, faq.get("sourcePages", []))
        for field in ("question", "answer"):
            if not appears_in_source(faq.get(field, ""), page_text):
                errors.append(f"{faq.get('id')}: {field} does not match PDF text")
    page_count = data.get("meta", {}).get("pageCount", 0)
    collections = [
        data.get("detachments", []),
        data.get("updates", []),
        data.get("faqs", []),
        *data.get("datasheets", {}).values(),
    ]
    for detachment in data.get("detachments", []):
        collections.extend(([detachment.get("rule", {})], detachment.get("enhancements", []), detachment.get("stratagems", [])))
    for collection in collections:
        for item in collection:
            pages = item.get("sourcePages", [])
            if not pages or any(not isinstance(page, int) or page < 1 or page > page_count for page in pages):
                errors.append(f"{item.get('id')}: invalid sourcePages")
            provenance = item.get("provenance", {})
            if provenance.get("sourceId") != "tyranids-faction-pack-v1.0" or provenance.get("sourcePages") != pages:
                errors.append(f"{item.get('id')}: invalid provenance")
    return errors


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    data = json.loads(OUTPUT.read_text(encoding="utf-8"))
    meta, pages = extract_source()
    if args.check:
        errors = validate(data)
        if data.get("meta") != meta or data.get("pages") != pages:
            errors.append("PDF snapshot is stale")
        if errors:
            print("\n".join(errors))
            return 1
        print("Tyranids Faction Pack source layer is current")
        return 0
    data["meta"] = meta
    data["pages"] = pages
    OUTPUT.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Refreshed {OUTPUT.name}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

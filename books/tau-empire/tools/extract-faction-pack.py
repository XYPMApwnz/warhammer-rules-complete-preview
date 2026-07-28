from __future__ import annotations

import argparse
import hashlib
import json
import re
from pathlib import Path

import pdfplumber


ROOT = Path(__file__).resolve().parents[1]
PDF = ROOT / "sources" / "tau-empire-faction-pack-v1.0.pdf"
OUTPUT = ROOT / "content" / "tau-empire-faction-pack.en.json"
RELATED = ROOT / "content" / "tau-empire-related-rules.en.json"
DATASHEETS = ROOT / "content" / "tau-empire-codex-datasheets.en.json"
SOURCE_ID = "tau-empire-faction-pack-v1.0"


def clean_text(value: str) -> str:
    value = re.sub(r"\ufffd+", ".", value)
    value = value.replace("\u00ad", "").replace("\r\n", "\n")
    value = re.sub(r"[ \t]+\n", "\n", value)
    value = re.sub(r"\n{3,}", "\n\n", value)
    return value.strip()


def tokens(value: str) -> list[str]:
    value = value.replace("\u2011", "-").replace("\u2013", "-").replace("\u2014", "-")
    return re.findall(r"[\w+]+", value.casefold(), flags=re.UNICODE)


def source_text(data: dict, source_pages: list[int]) -> str:
    return "\n".join(data["pages"][str(page)]["text"] for page in source_pages)


def appears_in_source(value: str, page_text: str) -> bool:
    needle = tokens(value)
    words = iter(tokens(page_text))
    return bool(needle) and all(any(candidate == word for candidate in words) for word in needle)


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
            "title": "T'au Empire Faction Pack",
            "version": "1.0",
            "legalFrom": "2026-06-20",
            "pageCount": len(document.pages),
            "sha256": digest,
            "file": "sources/tau-empire-faction-pack-v1.0.pdf",
        }
    return meta, pages


def validate_related_rules(data: dict, errors: list[str]) -> None:
    related = json.loads(RELATED.read_text(encoding="utf-8"))
    datasheets = json.loads(DATASHEETS.read_text(encoding="utf-8"))
    unit_ids = {
        unit["id"]
        for group in ("datasheets", "imperialArmour", "legends")
        for unit in datasheets.get(group, [])
    }
    stratagem_ids = {
        stratagem["id"]
        for detachment in data.get("detachments", [])
        for stratagem in detachment.get("stratagems", [])
    }
    eligibility = related.get("stratagems", {})
    if set(eligibility) != stratagem_ids:
        errors.append("related-rules Stratagem ids do not exactly match the Faction Pack")
    for rule_id, schema in eligibility.items():
        if schema.get("v") != 1 or not schema.get("roles"):
            errors.append(f"{rule_id}: invalid related-rules v1 schema")
            continue
        if not isinstance(schema.get("conditions"), list):
            errors.append(f"{rule_id}: conditions must be an array")
        for role in schema["roles"]:
            selector = role.get("selector", {})
            if role.get("side") != "friendly" or role.get("subject") != "unit" or role.get("count") != 1:
                errors.append(f"{rule_id}: invalid related-rules role")
            if not any(selector.get(field) for field in ("unitIds", "allKeywords", "anyKeywords")):
                errors.append(f"{rule_id}: selector has no positive unit constraint")
            unknown = set(selector.get("unitIds", [])) - unit_ids
            if unknown:
                errors.append(f"{rule_id}: unknown unitIds {sorted(unknown)}")


def validate(data: dict) -> list[str]:
    errors: list[str] = []
    serialized = json.dumps(data, ensure_ascii=False)
    for marker in ("\u0432\u0402", "\ufffd", "\u00e2\u20ac"):
        if marker in serialized:
            errors.append(f"mojibake marker found: {marker!r}")
    detachments = data.get("detachments", [])
    if len(detachments) != 3:
        errors.append("expected 3 detachments")
    if sum(len(item.get("enhancements", [])) for item in detachments) != 7:
        errors.append("expected 7 Enhancements")
    if sum(len(item.get("stratagems", [])) for item in detachments) != 7:
        errors.append("expected 7 Stratagems")
    for detachment in detachments:
        for item in [detachment.get("rule", {}), *detachment.get("enhancements", [])]:
            if not appears_in_source(item.get("text", ""), source_text(data, item.get("sourcePages", []))):
                errors.append(f"{item.get('id') or item.get('title')}: text does not match PDF")
        for stratagem in detachment.get("stratagems", []):
            page_text = source_text(data, stratagem.get("sourcePages", []))
            for field in ("when", "target", "effect"):
                if not stratagem.get(field):
                    errors.append(f"{stratagem.get('id')}: missing {field}")
                elif not appears_in_source(stratagem[field], page_text):
                    errors.append(f"{stratagem.get('id')}: {field} does not match PDF")
    expected = {"matched": 3, "imperialArmour": 4, "legends": 20}
    for group, count in expected.items():
        if len(data.get("datasheets", {}).get(group, [])) != count:
            errors.append(f"expected {count} {group} datasheets")
    if len(data.get("updates", [])) != 25:
        errors.append("expected 25 updates")
    for update in data.get("updates", []):
        if not appears_in_source(update.get("change", ""), source_text(data, update.get("sourcePages", []))):
            errors.append(f"{update.get('id')}: change does not match PDF")
    if len(data.get("faqs", [])) != 2:
        errors.append("expected 2 FAQs")
    for faq in data.get("faqs", []):
        page_text = source_text(data, faq.get("sourcePages", []))
        for field in ("question", "answer"):
            if not appears_in_source(faq.get(field, ""), page_text):
                errors.append(f"{faq.get('id')}: {field} does not match PDF")
    page_count = data.get("meta", {}).get("pageCount", 0)
    collections = [
        detachments,
        data.get("updates", []),
        data.get("faqs", []),
        *data.get("datasheets", {}).values(),
    ]
    for detachment in detachments:
        collections.extend(([detachment.get("rule", {})], detachment.get("enhancements", []), detachment.get("stratagems", [])))
    for collection in collections:
        for item in collection:
            pages = item.get("sourcePages", [])
            if not pages or any(not isinstance(page, int) or page < 1 or page > page_count for page in pages):
                errors.append(f"{item.get('id') or item.get('title')}: invalid sourcePages")
            provenance = item.get("provenance", {})
            if provenance.get("sourceId") != SOURCE_ID or provenance.get("sourcePages") != pages:
                errors.append(f"{item.get('id') or item.get('title')}: invalid provenance")
    validate_related_rules(data, errors)
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
        print("T'au Empire Faction Pack source layer is current")
        return 0
    data["meta"] = meta
    data["pages"] = pages
    OUTPUT.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Refreshed {OUTPUT.name}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

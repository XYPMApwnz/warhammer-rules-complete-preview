from __future__ import annotations

import argparse
import hashlib
import json
import re
from pathlib import Path

import pdfplumber


ROOT = Path(__file__).resolve().parents[1]
PDF = ROOT / "sources" / "dark-angels-faction-pack-v1.0.pdf"
OUTPUT = ROOT / "content" / "dark-angels-faction-pack.en.json"
RELATED_OUTPUT = ROOT / "content" / "dark-angels-related-rules.en.json"
SOURCE_ID = "dark-angels-faction-pack-v1.0"


def e(title: str, points: int) -> dict:
    return {"title": title, "points": points}


def s(title: str, cp: int) -> dict:
    return {"title": title, "cp": cp}


DETACHMENTS = [
    {"title": "Dark Age Arsenal", "page": 2, "rule": "Invocations of Ancient Fury",
     "enhancements": [e("Petition of Stability", 15), e("Entreaty of Perpetual Ardour", 15)],
     "stratagems": [s("Searing Bursts", 1), s("No Sacrifice Too Great", 1), s("Revelation of Guilt", 1)]},
    {"title": "Darkflight Pursuit", "page": 3, "rule": "Black-winged Vigilance",
     "enhancements": [e("Thundercowl Turbines", 15), e("Nightforged Battery", 15)],
     "stratagems": [s("Skyborne Surveillance", 1), s("Wings of Shadow", 1), s("We Are Vengeance", 1)]},
    {"title": "Interrogation Conclave", "page": 4, "rule": "Dread Catechism",
     "enhancements": [e("Limitless Zeal", 10), e("Inescapable Interrogation", 20)],
     "stratagems": [s("Exacting Punishment", 1), s("Terrifying Zeal", 1), s("Wages of Cowardice", 1)]},
    {"title": "Lion’s Blade Task Force", "page": 5, "rule": "In the Lion’s Claws",
     "enhancements": [e("Calibanite Armaments", 15), e("Lord of the Hunt", 15), e("Stalwart Champion", 25), e("Fulgus Magna", 20)],
     "stratagems": [s("Overpowering Exaction", 1), s("Knights of Iron", 1), s("Armour of Contempt", 1), s("Illuminating Fire", 1), s("Strength in Unity", 1), s("Inescapable Wrath", 2)]},
    {"title": "Wrath of the Rock", "page": 7, "rule": "Dutiful Tenacity",
     "enhancements": [e("Tempered in Battle (Aura)", 10), e("Ancient Weapons", 25), e("Deathwing Assault", 15), e("Lord of the Ravenwing", 10)],
     "stratagems": [s("Inescapable Justice", 2), s("Tactical Mastery", 1), s("Lion’s Will", 1), s("Relics of the Dark Age", 1), s("Armour of Contempt", 1), s("Leonine Aggression", 1)]},
]

MFM_DETACHMENTS = [
    "Company of Hunters", "Dark Age Arsenal", "Darkflight Pursuit", "Inner Circle Task Force",
    "Interrogation Conclave", "Lion’s Blade Task Force", "Unforgiven Task Force", "Wrath of the Rock",
]


def clean(value: str) -> str:
    value = value.replace("\ufffd", ".").replace("\u00ad", "").replace("\r\n", "\n")
    return re.sub(r"\n{3,}", "\n\n", re.sub(r"[ \t]+\n", "\n", value)).strip()


def flat(value: str) -> str:
    return re.sub(r"\s+([.,;:])", r"\1", re.sub(r"\s+", " ", clean(value).replace("\n", " "))).strip()


def comparable(value: str) -> str:
    value = value.replace("’", "'").replace("‑", "-").replace("–", "-").replace("—", "-")
    return re.sub(r"[^a-z0-9]+", " ", value.casefold()).strip()


def slug(value: str) -> str:
    return comparable(value).replace(" ", "-")


def source(item: dict, pages: list[int]) -> dict:
    return {**item, "sourcePages": pages, "provenance": {"sourceId": SOURCE_ID, "sourcePages": pages}}


def crop(page, box) -> str:
    return clean(page.crop(box).extract_text(x_tolerance=2, y_tolerance=3) or "")


def heading(lines: list[str], title: str) -> tuple[int, int]:
    wanted = comparable(title)
    for start in range(len(lines)):
        for count in (1, 2, 3):
            candidate = comparable(" ".join(lines[start:start + count]))
            if candidate == wanted or re.fullmatch(rf"{re.escape(wanted)}(?: upgrade)? \d+cp", candidate):
                return start, start + count
            if candidate == f"{wanted} upgrade":
                return start, start + count
    raise ValueError(f"Heading not found: {title}")


def blocks(text: str, names: list[str]) -> dict[str, str]:
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    spans = [(name, *heading(lines, name)) for name in names]
    spans.sort(key=lambda item: item[1])
    output = {}
    for index, (name, _start, body_start) in enumerate(spans):
        end = spans[index + 1][1] if index + 1 < len(spans) else len(lines)
        body = [line for line in lines[body_start:end] if comparable(line) not in {"enhancements", "detachment rule", "detachment rules"}]
        while body and re.fullmatch(r"\d+", body[-1]):
            body.pop()
        output[name] = flat("\n".join(body))
    return output


def fields(body: str) -> dict:
    labels = ["WHEN", "TARGET", "EFFECT", "RESTRICTIONS"]
    output = {}
    for index, label in enumerate(labels):
        following = "|".join(labels[index + 1:])
        end = rf"(?=\b(?:{following}):|$)" if following else "$"
        match = re.search(rf"\b{label}:\s*(.*?){end}", body, re.I)
        if match:
            output[label.casefold()] = flat(match.group(1))
    return output


def columns(page_number: int, pages):
    page = pages[page_number - 1]
    if page_number <= 4:
        return crop(page, (20, 220, 300, 780)), crop(page, (310, 220, 595, 780)), [crop(page, (310, 220, 595, 780))]
    return crop(page, (150, 230, 340, 760)), crop(page, (345, 230, 540, 760)), [crop(pages[page_number], (180, 65, 340, 750)), crop(pages[page_number], (375, 65, 535, 750))]


def extract_detachments(pages) -> list[dict]:
    output = []
    name_counts = {}
    for spec in DETACHMENTS:
        for item in spec["stratagems"]:
            name_counts[slug(item["title"])] = name_counts.get(slug(item["title"]), 0) + 1
    for spec in DETACHMENTS:
        left, right, strat_columns = columns(spec["page"], pages)
        if spec["page"] <= 4:
            rule_blocks = blocks(left, [spec["rule"], *[item["title"] for item in spec["enhancements"]]])
        else:
            rule_blocks = blocks(left, [spec["rule"]])
            rule_blocks.update(blocks(right, [item["title"] for item in spec["enhancements"]]))
        strat_blocks = blocks("\n".join(strat_columns), [item["title"] for item in spec["stratagems"]])
        strat_page = spec["page"] if spec["page"] <= 4 else spec["page"] + 1
        stratagems = []
        for item in spec["stratagems"]:
            parsed = fields(strat_blocks[item["title"]])
            if not all(parsed.get(field) for field in ("when", "target", "effect")):
                raise ValueError(f"Incomplete Stratagem: {spec['title']} / {item['title']}")
            base_id = slug(item["title"])
            item_id = f"{slug(spec['title'])}-{base_id}" if name_counts[base_id] > 1 else base_id
            stratagems.append(source({"id": item_id, "title": item["title"], "cp": item["cp"], **parsed}, [strat_page]))
        pages_used = [spec["page"]] if strat_page == spec["page"] else [spec["page"], strat_page]
        output.append(source({
            "id": slug(spec["title"]), "title": spec["title"],
            "rule": source({"title": spec["rule"], "text": rule_blocks[spec["rule"]]}, [spec["page"]]),
            "enhancements": [source({"id": slug(item["title"]), "title": item["title"], "points": item["points"], "text": rule_blocks[item["title"]]}, [spec["page"]]) for item in spec["enhancements"]],
            "stratagems": stratagems,
        }, pages_used))
    return output


def parse_faq(text: str) -> list[dict]:
    return [source({"id": slug(q), "question": flat(q), "answer": flat(a)}, [10]) for q, a in re.findall(r"Q:\s*(.*?)\s*A:\s*(.*?)(?=\s*Q:|$)", text, re.S)]


def title_case(value: str) -> str:
    return " ".join(word.casefold() if index and word.casefold() in {"of", "on", "with"} else word for index, word in enumerate(value.title().split()))


def build() -> dict:
    digest = hashlib.sha256(PDF.read_bytes()).hexdigest().upper()
    page_data, page_objects = {}, []
    with pdfplumber.open(PDF) as document:
        for number, page in enumerate(document.pages, 1):
            text = clean(page.extract_text(x_tolerance=2, y_tolerance=3) or "")
            page_objects.append(page)
            page_data[str(number)] = {"sha256": hashlib.sha256(text.encode()).hexdigest().upper(), "text": text}
        meta = {"title": "Dark Angels Faction Pack", "version": "1.0", "legalFrom": "2026-06-20", "pageCount": len(document.pages), "sha256": digest, "file": "sources/dark-angels-faction-pack-v1.0.pdf"}
        detachments = extract_detachments(page_objects)
        updates = [
            source({"id": "rules-updates-9-left", "section": "Rules Updates", "subject": "Page 9 · left column", "change": crop(page_objects[8], (35, 190, 295, 780))}, [9]),
            source({"id": "rules-updates-9-right", "section": "Datasheets", "subject": "Page 9 · right column", "change": crop(page_objects[8], (300, 190, 555, 780))}, [9]),
            source({"id": "rules-updates-10-left", "section": "Datasheets", "subject": "Page 10 · left column", "change": crop(page_objects[9], (35, 60, 295, 780))}, [10]),
        ]
        faqs = parse_faq(crop(page_objects[9], (300, 60, 555, 780)))
        legends = []
        for first in (11, 13, 15):
            raw = re.sub(r"\s+WARHAMMER\s+L\s*E\s*G\s*E\s*N\s*D\s*S.*$", "", page_data[str(first)]["text"].splitlines()[0], flags=re.I)
            legends.append(source({"id": slug(raw), "title": title_case(raw)}, [first, first + 1]))
    return {
        "meta": meta,
        "provenance": {"sourceId": SOURCE_ID, "authority": "Games Workshop", "documentType": "faction-pack", "edition": "Warhammer 40,000 11th Edition", "pageNumbering": "physical PDF pages", "note": "Supplement layer. Dark Angels armies also depend on the Space Marines base rules and datasheets."},
        "dependency": {"type": "codex-supplement", "book": "space-marines", "required": True, "duplicatedHere": False},
        "pages": page_data,
        "detachments": detachments,
        "detachmentAudit": {"source": "Munitorum Field Manual v1.0", "url": "https://mfm.warhammer-community.com/en/dark-angels", "checkedAt": "2026-07-28", "expected": 8, "count": len(MFM_DETACHMENTS), "current": MFM_DETACHMENTS, "factionPackCount": len(DETACHMENTS), "factionPack": [item["title"] for item in DETACHMENTS]},
        "updates": updates, "faqs": faqs,
        "datasheets": {"matched": [], "legends": legends},
    }


def validate(data: dict, related: dict) -> list[str]:
    errors = []
    strata = [item for detachment in data.get("detachments", []) for item in detachment.get("stratagems", [])]
    checks = [(len(data.get("detachments", [])), 5, "detachments"), (len(strata), 21, "Stratagems"), (sum(len(item["enhancements"]) for item in data.get("detachments", [])), 14, "Enhancements"), (len(data.get("faqs", [])), 1, "FAQs"), (len(data.get("datasheets", {}).get("legends", [])), 3, "Legends"), (len(data.get("detachmentAudit", {}).get("current", [])), 8, "MFM detachments")]
    for actual, expected, label in checks:
        if actual != expected:
            errors.append(f"expected {expected} {label}, found {actual}")
    ids = {item["id"] for item in strata}
    if ids != set(related):
        errors.append(f"related-rules coverage mismatch: missing={sorted(ids-set(related))}, extra={sorted(set(related)-ids)}")
    if data.get("dependency", {}).get("book") != "space-marines" or data.get("dependency", {}).get("duplicatedHere") is not False:
        errors.append("Space Marines supplement dependency is invalid")
    if chr(0xFFFD) in json.dumps(data, ensure_ascii=False):
        errors.append("replacement character found")
    return errors


def eligibility(selector: dict, *conditions: str) -> dict:
    return {
        "v": 1,
        "roles": [{
            "id": "friendly-target",
            "side": "friendly",
            "subject": "unit",
            "count": 1,
            "selector": selector,
        }],
        "conditions": list(conditions),
    }


# Explicit selectors are intentionally data, not inferred from rules prose.
RELATED_RULES: dict[str, dict] = {
    "searing-bursts": eligibility(
        {"unitIds": ["unit-hellblaster-squad"]},
        "unit-has-shot",
    ),
    "no-sacrifice-too-great": eligibility(
        {"allKeywords": ["ADEPTUS ASTARTES"]},
        "selected-to-shoot",
    ),
    "revelation-of-guilt": eligibility(
        {"allKeywords": ["ADEPTUS ASTARTES"]},
        "selected-to-shoot",
    ),
    "skyborne-surveillance": eligibility(
        {"allKeywords": ["RAVENWING", "FLY"]},
        "unit-has-shot",
    ),
    "wings-of-shadow": eligibility(
        {"allKeywords": ["RAVENWING", "FLY"]},
        "targeted-by-enemy-attack",
    ),
    "we-are-vengeance": eligibility(
        {"allKeywords": ["RAVENWING", "FLY"]},
        "enemy-unit-that-targeted-this-unit-has-shot",
        "not-within-engagement-range",
    ),
    "exacting-punishment": eligibility(
        {"allKeywords": ["CHAPLAIN"]},
        "selected-to-attack",
    ),
    "terrifying-zeal": eligibility(
        {"allKeywords": ["CHAPLAIN"]},
        "ended-charge-move",
    ),
    "wages-of-cowardice": eligibility(
        {"allKeywords": ["CHAPLAIN"]},
        "enemy-ended-fall-back-after-engagement",
        "not-within-engagement-range",
    ),
    "overpowering-exaction": eligibility(
        {"allKeywords": ["ADEPTUS ASTARTES"]},
    ),
    "knights-of-iron": eligibility(
        {"allKeywords": ["RAVENWING"]},
    ),
    "lion-s-blade-task-force-armour-of-contempt": eligibility(
        {"allKeywords": ["ADEPTUS ASTARTES"]},
        "targeted-by-enemy-attack",
    ),
    "illuminating-fire": eligibility(
        {"allKeywords": ["RAVENWING"]},
        "selected-to-shoot",
    ),
    "strength-in-unity": eligibility(
        {"allKeywords": ["ADEPTUS ASTARTES"]},
        "targeted-by-enemy-attack",
    ),
    "inescapable-wrath": eligibility(
        {
            "alternatives": [
                {"allKeywords": ["DEATHWING", "INFANTRY"]},
                {"allKeywords": ["DEATHWING", "WALKER"]},
            ]
        },
        "within-6-of-enemy-unit",
        "eligible-to-declare-charge",
    ),
    "inescapable-justice": eligibility(
        {"allKeywords": ["ADEPTUS ASTARTES", "CHARACTER"]},
        "on-battlefield",
        "oath-of-moment-target-destroyed",
    ),
    "tactical-mastery": eligibility(
        {"allKeywords": ["ADEPTUS ASTARTES"]},
    ),
    "lion-s-will": eligibility(
        {"allKeywords": ["ADEPTUS ASTARTES"]},
        "within-engagement-range",
    ),
    "relics-of-the-dark-age": eligibility(
        {
            "alternatives": [
                {"allKeywords": ["ADEPTUS ASTARTES", "INFANTRY"]},
                {"allKeywords": ["ADEPTUS ASTARTES", "MOUNTED"]},
            ]
        },
        "not-selected-to-shoot",
    ),
    "wrath-of-the-rock-armour-of-contempt": eligibility(
        {"allKeywords": ["ADEPTUS ASTARTES"]},
        "targeted-by-enemy-attack",
    ),
    "leonine-aggression": eligibility(
        {"allKeywords": ["ADEPTUS ASTARTES"]},
        "within-3-of-enemy-or-deathwing-within-6",
        "eligible-to-declare-charge",
    ),
}


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    data = build()
    related_document = {"schema": 1, "faction": "Dark Angels", "stratagems": RELATED_RULES}
    errors = validate(data, RELATED_RULES)
    content = json.dumps(data, ensure_ascii=False, indent=2) + "\n"
    related_content = json.dumps(related_document, ensure_ascii=False, indent=2) + "\n"
    if args.check:
        if not OUTPUT.exists() or OUTPUT.read_text(encoding="utf-8") != content:
            errors.append("Faction Pack output is stale")
        if not RELATED_OUTPUT.exists() or RELATED_OUTPUT.read_text(encoding="utf-8") != related_content:
            errors.append("Related Rules output is stale")
        if errors:
            print("\n".join(errors)); return 1
        print("Dark Angels Faction Pack source layer is current"); return 0
    if errors:
        raise ValueError("\n".join(errors))
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(content, encoding="utf-8")
    RELATED_OUTPUT.write_text(related_content, encoding="utf-8")
    print(f"Refreshed {OUTPUT.name}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

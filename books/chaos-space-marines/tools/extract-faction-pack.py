from __future__ import annotations

import argparse
from collections import Counter
import hashlib
import json
import re
from pathlib import Path

import pdfplumber


ROOT = Path(__file__).resolve().parents[1]
PDF = ROOT / "sources" / "chaos-space-marines-faction-pack-v1.0.pdf"
OUTPUT = ROOT / "content" / "chaos-space-marines-faction-pack.en.json"
RELATED_OUTPUT = ROOT / "content" / "chaos-space-marines-related-rules.en.json"
SOURCE_ID = "chaos-space-marines-faction-pack-v1.0"


def e(title: str, points: int) -> dict:
    return {"title": title, "points": points}


def s(title: str, cp: int) -> dict:
    return {"title": title, "cp": cp}


DETACHMENTS = [
    {
        "title": "Cabal of Chaos", "page": 2, "rule": "Empyric Wellspring",
        "enhancements": [e("Touched by the Warp", 10), e("Conduit of Chaos", 20)],
        "stratagems": [s("Infernal Vigour", 1), s("Fleshy Curse", 1), s("Wreathed in Warpflame", 1)],
    },
    {
        "title": "Devotees of Destruction", "page": 3, "rule": "Rain of Ruin",
        "enhancements": [e("Pact of Destruction", 15), e("Eye of Oblivion", 20)],
        "stratagems": [s("Ruination’s Bounty", 1), s("Snare of Fire", 1), s("Undying Hatred", 1)],
    },
    {
        "title": "Murdertalon Raiders", "page": 4, "rule": "Prey on the Weak",
        "enhancements": [e("Shadowcowl Talisman", 20), e("Pact of Cursed Pinions", 20)],
        "stratagems": [s("Plunging Talons", 1), s("Raking Pass", 1), s("Warp-twisted Terrors", 1)],
    },
    {
        "title": "Warpstrike Champions", "page": 5, "rule": "Warp Portals",
        "enhancements": [e("Infernal Fulgurite", 20), e("Eye of the Warp", 15), e("Akshur’s Binding Runes", 20), e("Tzagulla", 25)],
        "stratagems": [s("Empyric Dislocation", 1), s("Warp-tainted", 1), s("Armour of Corruption", 2), s("Siegebreaker Strike", 1), s("Warp Flicker", 1), s("Portal of Spite", 1)],
    },
    {
        "title": "Cult of the Arkifane", "page": 7, "rule": "Soul Forge Boons",
        "enhancements": [e("Wyredjinn", 25), e("Cybinfernal Font", 20), e("Mark of the Soul Forges", 20), e("Crown of Worms", 15)],
        "stratagems": [s("Touch of the Arkifane", 1), s("Biomechanoid Regeneration", 1), s("Balefire Boon", 1), s("Forge-fire Surge", 1), s("Soul-tally Offering", 2), s("Unholy Fortitude", 1)],
    },
    {
        "title": "Creations of Bile", "page": 9, "rule": "Experimental Augmentations",
        "enhancements": [e("Surgical Precision", 10), e("Living Carapace", 15), e("Helm of All-seeing", 25), e("Prime Test Subject", 35)],
        "stratagems": [s("Monstrous Visages", 2), s("Delayed Mutations", 1), s("Masters Are Watching", 1), s("Diabolic Regeneration", 1), s("Specimens for the Spider", 2), s("Autostimulants", 1)],
    },
    {
        "title": "Nightmare Hunt", "page": 11, "rule": "Terror Made Manifest",
        "enhancements": [e("Greyveil Hex", 25), e("Warp-fuelled Thrusters", 20), e("Terrorglut Parasite", 20), e("Sorrowscent Vulture", 35)],
        "stratagems": [s("Talons Sunk Deep", 1), s("Malicious Surge", 1), s("Prey on the Weak", 1), s("Relentless Terror", 1), s("Sadistic Display", 1), s("Horrific Incursion", 1)],
    },
    {
        "title": "Huron’s Marauders", "page": 13, "rule": "Tyrannical Motivation",
        "enhancements": [e("Voice of the Tyrant", 25), e("Raid Leader", 20), e("Dread Reputation", 25), e("Eager for Bloodshed", 30)],
        "stratagems": [s("Hardened Killers", 1), s("Reavers’ Flurry", 1), s("At the Tyrant’s Command", 1), s("To the Favoured the Spoils", 1), s("Seize the Prize", 1), s("Encircling Surge", 1)],
    },
    {
        "title": "Renegade Warband", "page": 15, "rule": "Slaves to None",
        "enhancements": [e("Weaponised Hatred", 35), e("Eyes of the Hunter", 15), e("Fratricidal Trophies", 5), e("Empyric Symbiote", 15)],
        "stratagems": [s("Never Outgunned", 1), s("Renegade Claim", 1), s("Vengeful Destruction", 1), s("Corrupted Munitions", 1), s("Undying Hatred", 1), s("Reavers’ Reaction", 1)],
    },
]

MATCHED_DATASHEETS = [
    ("Kravek Morne", 17), ("Mutilators", 19), ("Defiler", 21),
    ("Huron Blackheart", 23), ("Masters of the Maelstrom", 25),
    ("Red Corsairs Raiders", 27), ("Red Corsairs Reave-Captain", 29),
    ("Nemesis Claw", 31), ("Raptors", 33), ("Warp Talons", 35),
]

MFM_DETACHMENTS = [
    "Cabal of Chaos", "Chaos Cult", "Creations of Bile", "Cult of the Arkifane",
    "Deceptors", "Devotees of Destruction", "Dread Talons", "Fellhammer Siege-host",
    "Huron’s Marauders", "Murdertalon Raiders", "Nightmare Hunt", "Pactbound Zealots",
    "Renegade Raiders", "Renegade Warband", "Soulforged Warpack",
    "Veterans of the Long War", "Warpstrike Champions",
]

STRATAGEM_NAME_COUNTS = Counter(slug_name for spec in DETACHMENTS for slug_name in [re.sub(r"[^a-z0-9]+", "-", item["title"].casefold().replace("’", "'")).strip("-") for item in spec["stratagems"]])


def eligibility(selector: dict, conditions: list[str] | None = None, count: int = 1) -> dict:
    return {
        "v": 1,
        "roles": [{"id": "friendly-target", "side": "friendly", "subject": "unit", "count": count, "selector": selector}],
        "conditions": conditions or [],
    }


HA = ["HERETIC ASTARTES"]
RELATED_RULES = {
    "infernal-vigour": eligibility({"allKeywords": HA, "anyKeywords": ["PSYKER", "DAEMON"], "noneKeywords": ["KHORNE"]}),
    "fleshy-curse": eligibility({"allKeywords": [*HA, "PSYKER"]}),
    "wreathed-in-warpflame": eligibility({"allKeywords": [*HA, "PSYKER"]}, ["selected-to-shoot"]),
    "ruination-s-bounty": eligibility({"unitIds": ["unit-havocs", "unit-obliterators"]}, ["selected-to-shoot"]),
    "snare-of-fire": eligibility({"unitIds": ["unit-havocs"]}, ["enemy-ended-move-within-8", "not-within-engagement-range"]),
    "devotees-of-destruction-undying-hatred": eligibility({"unitIds": ["unit-havocs", "unit-obliterators"]}, ["targeted-by-enemy-attack"]),
    "plunging-talons": eligibility({"allKeywords": [*HA, "INFANTRY", "FLY"]}, ["made-charge-move-this-turn", "selected-to-fight"]),
    "raking-pass": eligibility({"allKeywords": [*HA, "INFANTRY", "FLY"]}, ["selected-to-fall-back"]),
    "warp-twisted-terrors": eligibility({"unitIds": ["unit-warp-talons"]}, ["ended-move"]),
    "empyric-dislocation": eligibility({"allKeywords": HA, "noneKeywords": ["DAMNED"]}, ["targeted-by-enemy-attack"]),
    "warp-tainted": eligibility({"allKeywords": HA, "anyKeywords": ["TERMINATOR", "OBLITERATORS", "MUTILATORS"]}, ["within-range-of-controlled-objective"]),
    "armour-of-corruption": eligibility({"allKeywords": HA, "anyKeywords": ["TERMINATOR", "OBLITERATORS", "MUTILATORS"]}, ["targeted-by-enemy-attack"]),
    "siegebreaker-strike": eligibility({"allKeywords": HA}, ["set-up-using-deep-strike-this-turn", "not-selected-to-shoot", "up-to-two-targets"], 2),
    "warp-flicker": eligibility({"allKeywords": HA, "anyKeywords": ["TERMINATOR", "OBLITERATORS", "MUTILATORS"]}),
    "portal-of-spite": eligibility({"allKeywords": HA}, ["set-up-using-deep-strike-this-turn", "not-declared-charge"]),
    "touch-of-the-arkifane": eligibility({"allKeywords": HA, "noneKeywords": ["DAMNED"]}, ["not-selected-to-shoot-or-fight"]),
    "biomechanoid-regeneration": eligibility({"allKeywords": HA, "noneKeywords": ["DAMNED"]}),
    "balefire-boon": eligibility({"allKeywords": ["SOUL FORGE"]}, ["not-selected-to-shoot-or-fight"]),
    "forge-fire-surge": eligibility({"allKeywords": HA}, ["just-advanced"]),
    "soul-tally-offering": eligibility({"allKeywords": ["SOUL FORGE"]}, ["not-selected-to-shoot-or-fight"]),
    "unholy-fortitude": eligibility({"allKeywords": ["SOUL FORGE"]}, ["targeted-by-enemy-attack"]),
    "monstrous-visages": eligibility({"allKeywords": [*HA, "INFANTRY"]}, ["targeted-by-enemy-attack"]),
    "delayed-mutations": eligibility({"allKeywords": [*HA, "INFANTRY"], "noneKeywords": ["DAMNED"]}),
    "masters-are-watching": eligibility({"allKeywords": [*HA, "INFANTRY"]}, ["targeted-by-enemy-attack"]),
    "diabolic-regeneration": eligibility({"allKeywords": [*HA, "INFANTRY"], "noneKeywords": ["DAMNED"]}),
    "specimens-for-the-spider": eligibility({"allKeywords": [*HA, "INFANTRY"]}, ["not-selected-to-fight"]),
    "autostimulants": eligibility({"allKeywords": [*HA, "INFANTRY"]}),
    "talons-sunk-deep": eligibility({"allKeywords": [*HA, "INFANTRY"]}, ["not-selected-to-shoot-or-fight"]),
    "malicious-surge": eligibility({"allKeywords": [*HA, "INFANTRY"]}),
    "prey-on-the-weak": eligibility({"allKeywords": [*HA, "INFANTRY"]}, ["not-selected-to-shoot-or-fight"]),
    "relentless-terror": eligibility({"allKeywords": [*HA, "INFANTRY"]}, ["just-fell-back"]),
    "sadistic-display": eligibility({"allKeywords": HA}, ["destroyed-enemy-unit-this-fight-phase"]),
    "horrific-incursion": eligibility({"allKeywords": HA}, ["arrived-from-reserves-this-turn"]),
    "hardened-killers": eligibility({"allKeywords": ["DAMNED"]}),
    "reavers-flurry": eligibility({"allKeywords": HA}, ["made-charge-move-this-turn"]),
    "at-the-tyrant-s-command": eligibility({"allKeywords": HA, "noneKeywords": ["MONSTER", "VEHICLE"]}),
    "to-the-favoured-the-spoils": eligibility({"allKeywords": HA}, ["lost-wounds-from-last-enemy-shooting"]),
    "seize-the-prize": eligibility({"allKeywords": HA, "noneKeywords": ["MONSTER", "VEHICLE"]}, ["selected-to-advance"]),
    "encircling-surge": eligibility({"allKeywords": HA, "noneKeywords": ["MONSTER", "VEHICLE"]}, ["within-6-of-battlefield-edge", "not-within-engagement-range"]),
    "never-outgunned": eligibility({"allKeywords": HA}, ["selected-to-shoot-or-fight"]),
    "renegade-claim": eligibility({"allKeywords": HA}, ["within-range-of-controlled-objective"]),
    "vengeful-destruction": eligibility({"allKeywords": HA, "anyKeywords": ["INFANTRY", "MOUNTED"], "noneKeywords": ["DAMNED"]}, ["not-selected-to-shoot-or-fight"]),
    "corrupted-munitions": eligibility({"allKeywords": HA}, ["selected-to-shoot"]),
    "renegade-warband-undying-hatred": eligibility({"allKeywords": HA}, ["targeted-by-enemy-attack"]),
    "reavers-reaction": eligibility({"allKeywords": HA, "noneKeywords": ["MONSTER", "VEHICLE"]}, ["hit-by-last-enemy-shooting"]),
}


def clean_text(value: str) -> str:
    value = value.replace("\ufffd", ".").replace("\u00ad", "").replace("\r\n", "\n")
    value = value.replace("Dark DestinyAbility", "Dark Destiny Ability")
    value = value.replace("tht use", "that use")
    value = value.replace("HERETIC ASTARTESmodel", "HERETIC ASTARTES model")
    value = re.sub(r"[ \t]+\n", "\n", value)
    value = re.sub(r"\n{3,}", "\n\n", value)
    return value.strip()


def flat(value: str) -> str:
    value = clean_text(value).replace("\n", " ")
    value = re.sub(r"\s+", " ", value)
    value = re.sub(r"\s+([.,;:])", r"\1", value)
    return value.strip()


def comparable(value: str) -> str:
    value = value.replace("’", "'").replace("‑", "-").replace("–", "-").replace("—", "-")
    return re.sub(r"[^a-z0-9]+", " ", value.casefold()).strip()


def slug(value: str) -> str:
    return comparable(value).replace(" ", "-")


def provenance(pages: list[int]) -> dict:
    return {"sourceId": SOURCE_ID, "sourcePages": pages}


def sourced(item: dict, pages: list[int]) -> dict:
    return {**item, "sourcePages": pages, "provenance": provenance(pages)}


def crop_text(page, box: tuple[float, float, float, float]) -> str:
    return clean_text(page.crop(box).extract_text(x_tolerance=2, y_tolerance=3) or "")


def find_heading(lines: list[str], title: str) -> tuple[int, int]:
    wanted = comparable(title)
    for start in range(len(lines)):
        for count in (1, 2, 3):
            candidate = comparable(" ".join(lines[start:start + count]))
            if candidate == wanted or re.fullmatch(rf"{re.escape(wanted)} \d+cp", candidate):
                return start, start + count
    raise ValueError(f"Heading not found: {title}")


def named_blocks(text: str, names: list[str]) -> dict[str, str]:
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    spans = [(name, *find_heading(lines, name)) for name in names]
    spans.sort(key=lambda item: item[1])
    output: dict[str, str] = {}
    for index, (name, _start, body_start) in enumerate(spans):
        body_end = spans[index + 1][1] if index + 1 < len(spans) else len(lines)
        body = [line for line in lines[body_start:body_end] if comparable(line) not in {"enhancements", "detachment rule", "detachment rules"}]
        while body and re.fullmatch(r"\d+", body[-1]):
            body.pop()
        output[name] = flat("\n".join(body))
    return output


def stratagem_fields(body: str) -> dict:
    labels = ["WHEN", "TARGET", "EFFECT", "RESTRICTIONS"]
    fields: dict[str, str] = {}
    for index, label in enumerate(labels):
        next_labels = "|".join(labels[index + 1:])
        end = rf"(?=\b(?:{next_labels}):|$)" if next_labels else r"$"
        match = re.search(rf"\b{label}:\s*(.*?){end}", body, re.I)
        if match:
            fields[label.casefold()] = flat(match.group(1))
    return fields


def detachment_columns(page_number: int, pages) -> tuple[str, str, list[str]]:
    page = pages[page_number - 1]
    if page_number <= 4:
        left = crop_text(page, (20, 220, 300, 780))
        right = crop_text(page, (310, 220, 595, 780))
        return left, right, [right]
    left = crop_text(page, (150, 230, 340, 760))
    right = crop_text(page, (345, 230, 540, 760))
    strat_page = pages[page_number]
    return left, right, [
        crop_text(strat_page, (180, 65, 340, 750)),
        crop_text(strat_page, (375, 65, 535, 750)),
    ]


def extract_detachments(pages) -> list[dict]:
    output = []
    for spec in DETACHMENTS:
        left, right, strat_columns = detachment_columns(spec["page"], pages)
        if spec["page"] <= 4:
            left_blocks = named_blocks(left, [spec["rule"], *[item["title"] for item in spec["enhancements"]]])
        else:
            left_blocks = named_blocks(left, [spec["rule"]])
            left_blocks.update(named_blocks(right, [item["title"] for item in spec["enhancements"]]))
        strat_text = "\n".join(strat_columns)
        strat_blocks = named_blocks(strat_text, [item["title"] for item in spec["stratagems"]])
        stratagems = []
        strat_page = spec["page"] if spec["page"] <= 4 else spec["page"] + 1
        for item in spec["stratagems"]:
            fields = stratagem_fields(strat_blocks[item["title"]])
            if not all(fields.get(field) for field in ("when", "target", "effect")):
                raise ValueError(f"Incomplete Stratagem fields: {spec['title']} / {item['title']}")
            base_id = slug(item["title"])
            stratagem_id = f"{slug(spec['title'])}-{base_id}" if STRATAGEM_NAME_COUNTS[base_id] > 1 else base_id
            stratagems.append(sourced({"id": stratagem_id, "title": item["title"], "cp": item["cp"], **fields}, [strat_page]))
        output.append(sourced({
            "id": slug(spec["title"]), "title": spec["title"],
            "rule": sourced({"title": spec["rule"], "text": left_blocks[spec["rule"]]}, [spec["page"]]),
            "enhancements": [sourced({"id": slug(item["title"]), "title": item["title"], "points": item["points"], "text": left_blocks[item["title"]]}, [spec["page"]]) for item in spec["enhancements"]],
            "stratagems": stratagems,
        }, [spec["page"], *([] if strat_page == spec["page"] else [strat_page])]))
    return output


def parse_faqs(text: str, page: int) -> list[dict]:
    matches = re.findall(r"Q:\s*(.*?)\s*A:\s*(.*?)(?=\s*Q:|$)", clean_text(text), re.S)
    return [sourced({"id": slug(question), "question": flat(question), "answer": flat(answer)}, [page]) for question, answer in matches]


def datasheet_index(title: str, first_page: int) -> dict:
    return sourced({"id": slug(title), "title": title}, [first_page, first_page + 1])


def legends_title(page_text: str) -> str:
    line = next(line.strip() for line in page_text.splitlines() if line.strip())
    words = flat(re.sub(r"\s+WARHAMMER\s+L\s*E\s*G\s*E\s*N\s*D\s*S.*$", "", line, flags=re.I)).title().split()
    return " ".join(word.casefold() if index and word.casefold() in {"of", "on", "with"} else word for index, word in enumerate(words))


def extract_source() -> tuple[dict, list, dict[str, dict]]:
    digest = hashlib.sha256(PDF.read_bytes()).hexdigest().upper()
    page_objects = []
    page_data: dict[str, dict] = {}
    with pdfplumber.open(PDF) as document:
        for number, page in enumerate(document.pages, 1):
            text = clean_text(page.extract_text(x_tolerance=2, y_tolerance=3) or "")
            page_objects.append(page)
            page_data[str(number)] = {"sha256": hashlib.sha256(text.encode("utf-8")).hexdigest().upper(), "text": text}
        meta = {
            "title": "Chaos Space Marines Faction Pack", "version": "1.0",
            "legalFrom": "2026-06-20", "pageCount": len(document.pages),
            "sha256": digest, "file": "sources/chaos-space-marines-faction-pack-v1.0.pdf",
        }
        detachments = extract_detachments(page_objects)
        faqs = parse_faqs(
            crop_text(page_objects[38], (35, 60, 295, 780)) + "\n" + crop_text(page_objects[38], (300, 60, 555, 780)), 39
        )
        updates = [
            sourced({"id": "rules-updates-37-left", "section": "Rules Updates", "subject": "Page 37 · left column", "change": crop_text(page_objects[36], (35, 200, 295, 780))}, [37]),
            sourced({"id": "rules-updates-37-right", "section": "Rules Updates", "subject": "Page 37 · right column", "change": crop_text(page_objects[36], (300, 190, 555, 780))}, [37]),
            sourced({"id": "rules-updates-38-left", "section": "Datasheets", "subject": "Page 38 · left column", "change": crop_text(page_objects[37], (35, 60, 295, 780))}, [38]),
            sourced({"id": "rules-updates-38-right", "section": "Datasheets", "subject": "Page 38 · right column", "change": crop_text(page_objects[37], (300, 60, 555, 780))}, [38]),
        ]
        legends = [datasheet_index(legends_title(page_data[str(first)]["text"]), first) for first in range(40, 102, 2)]
    return meta, detachments, page_data, updates, faqs, legends


def build() -> dict:
    meta, detachments, pages, updates, faqs, legends = extract_source()
    return {
        "meta": meta,
        "provenance": {
            "sourceId": SOURCE_ID, "authority": "Games Workshop",
            "documentType": "faction-pack", "edition": "Warhammer 40,000 11th Edition",
            "pageNumbering": "physical PDF pages",
            "note": "This pack supplements Codex: Chaos Space Marines; it is not a complete codex source.",
        },
        "pages": pages,
        "detachments": detachments,
        "detachmentAudit": {
            "source": "Munitorum Field Manual v1.0", "checkedAt": "2026-07-28",
            "url": "https://mfm.warhammer-community.com/en/chaos-space-marines",
            "expected": 17, "count": len(MFM_DETACHMENTS), "current": MFM_DETACHMENTS,
            "factionPackCount": len(DETACHMENTS), "factionPack": [item["title"] for item in DETACHMENTS],
        },
        "updates": updates,
        "faqs": faqs,
        "datasheets": {
            "matched": [datasheet_index(title, page) for title, page in MATCHED_DATASHEETS],
            "legends": legends,
        },
    }


def validate(data: dict) -> list[str]:
    errors = []
    if len(data.get("detachments", [])) != 9:
        errors.append("expected 9 Faction Pack detachments")
    if len(data.get("detachmentAudit", {}).get("current", [])) != 17:
        errors.append("expected 17 MFM detachments")
    if not {comparable(item["title"]) for item in data.get("detachments", [])}.issubset({comparable(item) for item in data.get("detachmentAudit", {}).get("current", [])}):
        errors.append("Faction Pack detachments do not match the MFM audit")
    if len(data.get("datasheets", {}).get("matched", [])) != 10:
        errors.append("expected 10 matched-play datasheets")
    if len(data.get("datasheets", {}).get("legends", [])) != 31:
        errors.append("expected 31 Legends datasheets")
    if len(data.get("faqs", [])) != 15:
        errors.append("expected 15 FAQs")
    stratagems = [stratagem for detachment in data.get("detachments", []) for stratagem in detachment.get("stratagems", [])]
    if len(stratagems) != 45:
        errors.append("expected 45 Faction Pack Stratagems")
    for stratagem in stratagems:
        for field in ("when", "target", "effect"):
            if not stratagem.get(field):
                errors.append(f"{stratagem.get('id')}: missing {field}")
    stratagem_ids = {item["id"] for item in stratagems}
    if stratagem_ids != set(RELATED_RULES):
        errors.append(f"related-rules coverage mismatch: missing={sorted(stratagem_ids - set(RELATED_RULES))}, extra={sorted(set(RELATED_RULES) - stratagem_ids)}")
    serialized = json.dumps(data, ensure_ascii=False)
    for marker in ("РІР‚", "пїЅ", "�"):
        if marker in serialized:
            errors.append(f"mojibake marker found: {marker}")
    return errors


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    data = build()
    errors = validate(data)
    content = json.dumps(data, ensure_ascii=False, indent=2) + "\n"
    related = json.dumps({"schema": 1, "faction": "Chaos Space Marines", "stratagems": RELATED_RULES}, ensure_ascii=False, indent=2) + "\n"
    if args.check:
        if not OUTPUT.exists() or OUTPUT.read_text(encoding="utf-8") != content:
            errors.append("Faction Pack output is stale")
        if not RELATED_OUTPUT.exists() or RELATED_OUTPUT.read_text(encoding="utf-8") != related:
            errors.append("Related Rules output is stale")
        if errors:
            print("\n".join(errors))
            return 1
        print("Chaos Space Marines Faction Pack source layer is current")
        return 0
    if errors:
        raise ValueError("\n".join(errors))
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(content, encoding="utf-8")
    RELATED_OUTPUT.write_text(related, encoding="utf-8")
    print(f"Refreshed {OUTPUT.name}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

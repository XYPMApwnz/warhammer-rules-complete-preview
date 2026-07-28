from __future__ import annotations

import argparse
import hashlib
import json
import re
import unicodedata
from pathlib import Path

import pdfplumber
from pypdf import PdfReader


ROOT = Path(__file__).resolve().parents[1]
PDF = ROOT / "sources" / "space-marines-faction-pack-v1.0.pdf"
OUTPUT = ROOT / "content" / "space-marines-faction-pack.en.json"
RELATED = ROOT / "content" / "space-marines-related-rules.en.json"
POINTS = ROOT / "content" / "space-marines-points.en.json"
CODEX = ROOT / "content" / "space-marines-codex-datasheets.en.json"
BSDATA = ROOT.parents[1] / "tmp" / "bsdata-wh40k-11e" / "Imperium - Space Marines.json"
BSDATA_LIBRARY = ROOT.parents[1] / "tmp" / "bsdata-wh40k-11e" / "Library - Astartes Heresy Legends.json"
SOURCE_ID = "space-marines-faction-pack-v1.0"

DETACHMENTS = [
    ("Fulguris Task Force", 2, 2),
    ("Librarius Conclave", 3, None),
    ("Subversion Assets", 4, 4),
    ("Armoured Speartip", 5, 6),
    ("Headhunter Task Force", 7, 8),
    ("Ceramite Sentinels", 9, 10),
    ("Blade of Ultramar", 11, 12),
    ("Hammer of Avernii", 13, 14),
    ("Spearpoint Task Force", 15, 16),
    ("Forgefather's Seekers", 17, 18),
    ("Emperor's Shield", 19, 20),
    ("Shadowmark Talon", 21, 22),
    ("Bastion Task Force", 23, 24),
    ("Orbital Assault Force", 25, 26),
    ("Reclamation Force", 27, 28),
]

MATCHED = [
    ("Eradicator Squad with Heavy Bolters", [31]),
    ("Land Speeder", [32]),
    ("Terminator Assault Squad", [33, 34]),
    ("Marneus Calgar in Armour of Antilochus", [35, 36]),
    ("Cato Sicarius", [37, 38]),
    ("Victrix Honour Guard", [39, 40]),
    ("Captain Titus", [41, 42]),
    ("Wardens of Ultramar", [43, 44]),
    ("Caanok Var", [45, 46]),
    ("Suboden Khan", [47, 48]),
    ("Vulkan He'stan", [49, 50]),
    ("Aethon Shaan", [51, 52]),
    ("Darnath Lysander", [53, 54]),
    ("Drop Pod", [55, 56]),
]

LEGENDS = [
    ("Land Raider Helios", 65), ("Mortis Dreadnought", 67),
    ("Deimos Predator", 69), ("Chaplain Venerable Dreadnought", 71),
    ("Land Speeder Tempest", 73), ("Carab Culln the Risen", 75),
    ("Caestus Assault Ram", 77), ("Land Raider Prometheus", 79),
    ("Venerable Dreadnought", 81), ("Rhino Primaris", 83),
    ("Land Raider Excelsior", 85), ("Imperial Space Marine", 87),
    ("Terminus Ultra", 89), ("Relic Razorback", 91),
    ("Company Veterans on Bikes", 93), ("Company Champion on Bike", 95),
    ("Ancient on Bike", 97), ("Apothecary on Bike", 99),
    ("Techmarine on Bike", 101), ("Librarian on Bike", 103),
    ("Thunderhawk Transporter", 105), ("Tarantula Air Defence Battery", 107),
    ("Chaplain Cassius", 109), ("Sergeant Chronus", 111),
    ("Sergeant Telion", 113), ("Captain on Bike", 115),
    ("Astartes Servitors", 117), ("Vanguard Veteran Squad", 119),
    ("Ironclad Dreadnought", 121), ("Assault Squad", 123),
    ("Assault Squad with Jump Packs", 125), ("Primaris Company Champion", 127),
    ("Command Squad", 129), ("Relic Terminator Squad", 131),
    ("Scout Sniper Squad", 133), ("Tyrannic War Veterans", 135),
    ("Bike Squad", 137), ("Attack Bike Squad", 139),
    ("Scout Bike Squad", 141), ("Land Speeder Tornado", 143),
    ("Land Speeder Typhoon", 145), ("Librarian with Jump Pack", 147),
    ("Thunderfire Cannon", 149), ("Hunter", 151),
    ("Stalker", 153), ("Land Speeder Storm", 155),
    ("Kratos", 158), ("Deredeo Dreadnought", 160),
    ("Relic Contemptor Dreadnought", 162), ("Leviathan Dreadnought", 164),
    ("Javelin Attack Speeder", 166), ("Deathstorm Drop Pod", 168),
    ("Land Raider Proteus", 170), ("Land Raider Achilles", 172),
    ("Sicaran Battle Tank", 174), ("Sicaran Arcus", 176),
    ("Sicaran Venator", 178), ("Sicaran Punisher", 180),
    ("Sicaran Omega", 182), ("Rapier Carrier", 184),
    ("Whirlwind Scorpius", 186), ("Vindicator Laser Destroyer", 188),
    ("Dreadnought Drop Pod", 190), ("Terrax-pattern Termite", 192),
    ("Xiphon Interceptor", 194), ("Storm Eagle Gunship", 196),
    ("Fire Raptor Gunship", 198), ("Typhon", 200),
    ("Cerberus", 202), ("Spartan", 204), ("Fellblade", 206),
    ("Falchion", 208), ("Mastodon", 210),
    ("Sokar-pattern Stormbird", 212), ("Tarantula Sentry Battery", 214),
]


def slug(value: str) -> str:
    value = re.sub(r"[\u2010-\u2015\u2212]", "-", value)
    value = value.translate(str.maketrans({"‘": "'", "’": "'"}))
    value = unicodedata.normalize("NFKD", value).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]+", "-", value.casefold()).strip("-")


def clean(value: str) -> str:
    value = value.replace("\ufffd", ".").replace("\u00ad", "")
    value = value.replace("^^", "").replace("**", "")
    value = re.sub(r"[ \t]+", " ", value)
    value = re.sub(r"\s*\n\s*", " ", value)
    value = value.replace("Y ou", "You")
    value = value.replace("ADEPTUS ASTARTES INFANTRYmodels", "ADEPTUS ASTARTES INFANTRY models")
    return value.strip()


def provenance(pages: list[int]) -> dict:
    return {"sourceId": SOURCE_ID, "sourcePages": pages}


def indexed(title: str, pages: list[int]) -> dict:
    return {"id": slug(title), "title": title, "sourcePages": pages, "provenance": provenance(pages)}


def pdf_source() -> tuple[dict, dict[str, dict], list[str]]:
    digest = hashlib.sha256(PDF.read_bytes()).hexdigest().upper()
    pages: dict[str, dict] = {}
    texts: list[str] = []
    with pdfplumber.open(PDF) as document:
        for number, page in enumerate(document.pages, 1):
            text = page.extract_text(x_tolerance=2, y_tolerance=3) or ""
            text = text.replace("\ufffd", ".").replace("\u00ad", "").strip()
            texts.append(text)
            pages[str(number)] = {
                "sha256": hashlib.sha256(text.encode("utf-8")).hexdigest().upper(),
                "text": text,
            }
        meta = {
            "title": "Space Marines Faction Pack",
            "version": "1.0",
            "legalFrom": "2026-06-20",
            "pageCount": len(document.pages),
            "sha256": digest,
            "file": "sources/space-marines-faction-pack-v1.0.pdf",
        }
    return meta, pages, texts


def bsdata_rules() -> dict[str, dict]:
    by_id: dict[str, dict] = {}
    named: dict[str, list[dict]] = {}

    def visit(value):
        if isinstance(value, dict):
            if value.get("id"):
                by_id[value["id"]] = value
            if value.get("name"):
                named.setdefault(value["name"], []).append(value)
            for child in value.values():
                visit(child)
        elif isinstance(value, list):
            for child in value:
                visit(child)

    visit(json.loads(BSDATA.read_text(encoding="utf-8")))
    visit(json.loads(BSDATA_LIBRARY.read_text(encoding="utf-8")))
    result = {}
    for title, _, _ in DETACHMENTS:
        candidates = named.get(title, [])
        resolved = []
        for candidate in candidates:
            resolved.append(by_id.get(candidate.get("targetId"), candidate))
        entry = next((item for item in resolved if item.get("rules")), None)
        if not entry:
            raise ValueError(f"No BSData detachment rule found for {title}")
        rule = entry["rules"][0]
        result[title] = {"title": rule["name"], "text": clean(rule["description"])}
    return result


def parse_stratagems(text: str, detachment: str, page: int) -> list[dict]:
    text = text.replace("\ufffd", ".").replace("\u00ad", "")
    taglines = {
        2: "ANTI-GRAV SPEEDERS HIT THE FOE WITH THUNDEROUS FIREPOWER AT DEADLY VELOCITIES",
        4: "STEALTHY BATTLE-BROTHERS AND NEOPHYTES ELIMINATE THE FOE'S LURKING THREATS",
    }
    if page in taglines:
        text = text.split(taglines[page], 1)[0]
    header = re.compile(r"(?m)^(.+?)(?:\s+([12])CP)?\n([^\n]+STRATAGEM)\s*$")
    matches = list(header.finditer(text))
    trailing_costs = [int(value) for value in re.findall(r"(?m)^([12])CP$", text)]
    items = []
    for index, match in enumerate(matches):
        block = text[match.end():matches[index + 1].start() if index + 1 < len(matches) else len(text)]
        block = re.sub(r"\n(?:[12]CP\n)+\d+\s*$", "", block.strip())
        when = re.search(r"WHEN:\s*(.*?)(?=\nTARGET:)", block, re.S)
        target = re.search(r"TARGET:\s*(.*?)(?=\nEFFECT:)", block, re.S)
        effect = re.search(r"EFFECT:\s*(.*?)(?=\nRESTRICTIONS:|\Z)", block, re.S)
        restrictions = re.search(r"RESTRICTIONS:\s*(.*?)\Z", block, re.S)
        if not all((when, target, effect)):
            raise ValueError(f"Could not parse stratagem {match.group(1)!r} on page {page}")
        title = clean(match.group(1))
        strat_id = f"{slug(detachment)}-{slug(title)}"
        cost = int(match.group(2)) if match.group(2) else trailing_costs[index]
        item = {
            "id": strat_id,
            "title": title,
            "cp": cost,
            "when": clean(when.group(1)),
            "target": clean(target.group(1)),
            "effect": clean(effect.group(1)),
            "sourcePages": [page],
            "provenance": provenance([page]),
        }
        if restrictions:
            item["restrictions"] = clean(restrictions.group(1))
        items.append(item)
    return items


RULE_STARTS = {
    "Fulguris Task Force": "Friendly LAND SPEEDER",
    "Librarius Conclave": "At the start of the battle round",
    "Subversion Assets": "Friendly PHOBOS/SCOUT SQUAD",
    "Armoured Speartip": "Each time an Adeptus Astartes",
    "Headhunter Task Force": "Each time a Tank Ace",
    "Ceramite Sentinels": "Each time an Adeptus Astartes",
    "Blade of Ultramar": "At the start of up to three",
    "Hammer of Avernii": "Each time a model from your army",
    "Spearpoint Task Force": "Adeptus Astartes units from your army",
    "Forgefather's Seekers": "Ranged weapons equipped by Adeptus",
    "Emperor's Shield": "Each time a model from your army",
    "Shadowmark Talon": "Each time a ranged attack targets",
    "Bastion Task Force": "Adeptus Astartes Battleline units",
    "Orbital Assault Force": "At the start of the Declare Battle",
    "Reclamation Force": "Each time an Adeptus Astartes model",
}


def exact_rule_text(page_text: str, detachment: str) -> str:
    block = page_text.split("ENHANCEMENTS", 1)[0]
    if "RESTRICTIONS" in block:
        block = block.split("RESTRICTIONS", 1)[0]
    start_words = comparable(RULE_STARTS[detachment])
    lines = block.splitlines()
    for index in range(len(lines)):
        if comparable(" ".join(lines[index:index + 3]))[:len(start_words)] == start_words:
            return clean("\n".join(lines[index:]))
    raise ValueError(f"Could not locate exact detachment rule text for {detachment}")


def enhancement_key(value: str) -> str:
    return slug(value).replace("-data-link", "-datalink").replace("stormseer-s-wisdom", "stormseers-wisdom")


def exact_enhancements(page_text: str, titles: list[str]) -> dict[str, str]:
    section = page_text.split("ENHANCEMENTS", 1)[1]
    taglines = {
        "ANTI-GRAV SPEEDERS HIT THE FOE WITH THUNDEROUS FIREPOWER AT DEADLY VELOCITIES",
        "WARRIOR-MYSTICS OF THE CHAPTER UNLEASH SUPERNATURAL WARP-FUELLED POWERS",
        "STEALTHY BATTLE-BROTHERS AND NEOPHYTES ELIMINATE THE FOE'S LURKING THREATS",
    }
    lines = [line for line in section.splitlines() if line.strip() not in taglines]
    first_stratagem = next((index - 1 for index, line in enumerate(lines) if "STRATAGEM" in line and index), None)
    if first_stratagem is not None:
        lines = lines[:first_stratagem]
    positions = {}
    for index, line in enumerate(lines):
        key = enhancement_key(re.sub(r"\s+UPGRADE\s*$", "", line, flags=re.I))
        for title in titles:
            if key == enhancement_key(title):
                positions[title] = index
    missing = set(titles) - set(positions)
    if missing:
        raise ValueError(f"Could not locate enhancement titles: {sorted(missing)}")
    ordered = sorted(positions.items(), key=lambda item: item[1])
    result = {}
    effect_start = re.compile(r"^(?:SPEEDER|ADEPTUS ASTARTES|INFANTRY PHOBOS|PHOBOS|GRAVIS)\b", re.I)
    for offset, (title, start) in enumerate(ordered):
        end = ordered[offset + 1][1] if offset + 1 < len(ordered) else len(lines)
        block = lines[start + 1:end]
        first = next((index for index, line in enumerate(block) if effect_start.match(line.strip())), None)
        if first is None:
            raise ValueError(f"Could not locate rules text for enhancement {title}")
        value = re.sub(r"\s+\d+$", "", clean("\n".join(block[first:])))
        result[title] = value
    return result


def chapter_condition(detachment: str) -> list[str]:
    chapters = {
        "Blade of Ultramar": "ultramarines",
        "Hammer of Avernii": "iron-hands",
        "Spearpoint Task Force": "white-scars",
        "Forgefather's Seekers": "salamanders",
        "Emperor's Shield": "imperial-fists",
        "Shadowmark Talon": "raven-guard",
        "Reclamation Force": "ultramarines",
    }
    return [f"detachment-army-restricted-to-{chapters[detachment]}"] if detachment in chapters else []


def role(selector: dict, role_id: str = "friendly-target", count: int = 1, subject: str = "unit") -> dict:
    return {"id": role_id, "side": "friendly", "subject": subject, "count": count, "selector": selector}


ASTARTES = {"allKeywords": ["ADEPTUS ASTARTES"]}
INFANTRY = {"allKeywords": ["ADEPTUS ASTARTES", "INFANTRY"]}
INFANTRY_OR_MOUNTED = {"alternatives": [
    {"allKeywords": ["ADEPTUS ASTARTES", "INFANTRY"]},
    {"allKeywords": ["ADEPTUS ASTARTES", "MOUNTED"]},
]}
VETERANS = {"alternatives": [
    {"allKeywords": ["ADEPTUS ASTARTES", "DREADNOUGHT"]},
    {"allKeywords": ["ADEPTUS ASTARTES", "TERMINATOR"]},
    {"unitIds": ["unit-bladeguard-veteran-squad", "unit-sternguard-veteran-squad", "unit-vanguard-veteran-squad"]},
]}
ELITE_INFANTRY = {"alternatives": VETERANS["alternatives"][1:]}
PHOBOS_OR_SCOUT = {"alternatives": [
    {"allKeywords": ["ADEPTUS ASTARTES", "PHOBOS"]},
    {"unitIds": ["unit-scout-squad"]},
]}
SPEEDERS = {"unitIds": [
    "unit-land-speeder", "unit-storm-speeder-hailstrike",
    "unit-storm-speeder-hammerstrike", "unit-storm-speeder-thunderstrike",
]}
TANK_ACE = {"allKeywords": ["ADEPTUS ASTARTES", "VEHICLE"], "noneKeywords": ["FORTIFICATION", "DROP POD", "WALKER", "FLY"]}
HEAVY_TRANSPORT = {"allKeywords": ["ADEPTUS ASTARTES", "TRANSPORT"], "noneKeywords": ["FLY"]}


def eligibility(detachment: str, title: str) -> dict:
    title = slug(title)
    conditions = chapter_condition(detachment)
    roles = [role(ASTARTES)]
    if detachment == "Fulguris Task Force":
        roles = [role(SPEEDERS)]
    elif detachment == "Subversion Assets":
        roles = [role(PHOBOS_OR_SCOUT)]
    elif detachment == "Armoured Speartip":
        if title == "machine-wrath":
            roles = [role(HEAVY_TRANSPORT)]
            conditions += ["wounds-characteristic-14-or-more", "detachment-grants-heavy-transport", "deadly-demise-roll-was-6"]
        elif title == "rapid-embarkation":
            roles = [role(INFANTRY, "friendly-infantry"), role(HEAVY_TRANSPORT, "friendly-heavy-transport")]
            conditions += ["transport-wounds-characteristic-14-or-more", "infantry-able-to-embark", "infantry-wholly-within-6"]
        elif title in {"ceramite-sledgehammer", "advanced-deployment"}:
            roles = [role({"allKeywords": ["ADEPTUS ASTARTES", "TRANSPORT"]})]
    elif detachment == "Headhunter Task Force" and title not in {"armour-of-contempt", "rapid-gunnery"}:
        roles = [role(TANK_ACE)]
        conditions += ["detachment-grants-tank-ace"]
        if title in {"reactive-repositioning", "machine-vengeance"}:
            conditions.append("unit-contains-no-model-with-16-or-more-wounds")
    elif detachment == "Ceramite Sentinels" and title in {"priority-strike", "evasive-repositioning"}:
        roles = [role(INFANTRY_OR_MOUNTED)]
    elif detachment == "Hammer of Avernii":
        if title == "armour-of-contempt":
            roles = [role(ASTARTES)]
        elif title == "dropship-extraction":
            roles = [role({"allKeywords": ["ADEPTUS ASTARTES", "TERMINATOR"]})]
        else:
            roles = [role(ELITE_INFANTRY if title == "augmetic-fortitude" else VETERANS)]
    elif detachment == "Spearpoint Task Force":
        if title == "hunter-s-instincts":
            roles = [role(INFANTRY_OR_MOUNTED)]
        elif title in {"evasive-manoeuvres", "withdraw-and-regroup"}:
            roles = [role({"alternatives": [
                {"allKeywords": ["ADEPTUS ASTARTES", "MOUNTED"]},
                {"allKeywords": ["ADEPTUS ASTARTES", "VEHICLE", "FLY"]},
            ]})]
    elif detachment == "Forgefather's Seekers":
        if title in {"crucible-of-battle", "wrathful-inferno"}:
            roles = [role(INFANTRY)]
        elif title == "burning-vengeance":
            roles = [role({"allKeywords": ["ADEPTUS ASTARTES", "TRANSPORT"]})]
        elif title == "blazing-earth":
            conditions.append("unit-equipped-with-torrent-weapon")
    elif detachment == "Emperor's Shield":
        if title == "armour-of-contempt":
            roles = [role(ASTARTES)]
        elif title == "dropship-extraction":
            roles = [role({"allKeywords": ["ADEPTUS ASTARTES", "TERMINATOR"]})]
        else:
            roles = [role(ELITE_INFANTRY)]
    elif detachment == "Shadowmark Talon":
        if title in {"lay-low-the-tyrants", "stunning-fusillade"}:
            roles = [role(INFANTRY)]
        elif title == "raptorial-vigilance":
            roles = [role(INFANTRY_OR_MOUNTED)]
        elif title == "into-darkness":
            roles = [role({"alternatives": PHOBOS_OR_SCOUT["alternatives"] + [INFANTRY]}, count=2)]
            conditions.append("up-to-two-phobos-or-scout-units-or-one-other-infantry-unit")
    elif detachment == "Bastion Task Force":
        if title in {"guided-disruption", "shock-bombardment", "angels-defiant"}:
            roles = [role({"allKeywords": ["ADEPTUS ASTARTES", "BATTLELINE"]})]
        elif title == "heresy-undone":
            roles = [role({"allKeywords": ["ADEPTUS ASTARTES"], "noneKeywords": ["BATTLELINE"]})]
    elif detachment == "Orbital Assault Force":
        if title == "blind-screen":
            roles = [
                role({"allKeywords": ["ADEPTUS ASTARTES"], "noneKeywords": ["TITANIC"]}),
                role({"alternatives": [
                    {"allKeywords": ["ADEPTUS ASTARTES", "VEHICLE", "SMOKE"]},
                    {"unitIds": ["unit-drop-pod"]},
                ]}, "friendly-screening-unit"),
            ]
            conditions.append("screening-unit-within-9")
        elif title == "onward-for-the-emperor":
            roles = [role(INFANTRY), role({"allKeywords": ["TRANSPORT"]}, "friendly-transport")]
            conditions += ["infantry-not-set-up-this-turn", "infantry-able-to-embark"]
    return {"v": 1, "roles": roles, "conditions": conditions}


def build() -> tuple[dict, dict]:
    meta, pages, source_texts = pdf_source()
    pypdf_texts = [page.extract_text() or "" for page in PdfReader(str(PDF)).pages]
    rules = bsdata_rules()
    points = json.loads(POINTS.read_text(encoding="utf-8"))
    enhancements = {}
    for item in points["enhancements"]:
        enhancements.setdefault(item["detachment"], []).append(item)
    detachments = []
    related = {"schema": 1, "faction": "Space Marines", "sourceId": SOURCE_ID, "stratagems": {}}
    for title, rule_page, stratagem_page in DETACHMENTS:
        page_text = pypdf_texts[rule_page - 1].replace("\ufffd", ".")
        restriction = re.search(r"RESTRICTIONS\s+(.*?)\nENHANCEMENTS", page_text, re.S)
        det_id = slug(title)
        exact_enhancement_text = exact_enhancements(page_text, [entry["title"] for entry in enhancements.get(title, [])])
        rule = {
            "id": f"{det_id}-{slug(rules[title]['title'])}",
            "title": rules[title]["title"],
            "text": exact_rule_text(page_text, title),
            "sourcePages": [rule_page],
            "provenance": provenance([rule_page]),
        }
        item = {
            "id": det_id,
            "title": title,
            "sourcePages": [rule_page] + ([stratagem_page] if stratagem_page and stratagem_page != rule_page else []),
            "provenance": provenance([rule_page] + ([stratagem_page] if stratagem_page and stratagem_page != rule_page else [])),
            "rule": rule,
            "enhancements": [],
            "stratagems": [],
        }
        if restriction:
            item["restrictions"] = clean(restriction.group(1))
        for enhancement in sorted(enhancements.get(title, []), key=lambda value: value["title"]):
            official_title = {"Stormseer's Wisdom": "Stormseers’ Wisdom"}.get(enhancement["title"], enhancement["title"])
            item["enhancements"].append({
                "id": slug(official_title),
                "title": official_title,
                "kind": "Upgrade" if "UPGRADE" in source_texts[rule_page - 1].upper() and len(enhancements.get(title, [])) == 2 else "Enhancement",
                "points": enhancement.get("value"),
                "text": exact_enhancement_text[enhancement["title"]],
                "sourcePages": [rule_page],
                "provenance": provenance([rule_page]),
            })
        if stratagem_page:
            item["stratagems"] = parse_stratagems(pypdf_texts[stratagem_page - 1], title, stratagem_page)
            for stratagem in item["stratagems"]:
                related["stratagems"][stratagem["id"]] = eligibility(title, stratagem["title"])
        detachments.append(item)

    faqs = []
    faq_text = pypdf_texts[61].replace("\ufffd", ".")
    faq_part = faq_text.split("FAQS", 1)[1]
    for index, match in enumerate(re.finditer(r"Q:\s*(.*?)\nA:\s*(.*?)(?=\nQ:|\Z)", faq_part, re.S), 1):
        question, answer = clean(match.group(1)), clean(match.group(2))
        answer = re.sub(r"\s+62$", "", answer)
        faqs.append({
            "id": f"faq-{index:02d}-{slug(question)[:48]}",
            "question": question,
            "answer": answer,
            "sourcePages": [62],
            "provenance": provenance([62]),
        })

    updates = []
    for page in range(59, 63):
        text = pypdf_texts[page - 1].replace("\ufffd", ".")
        if page == 62:
            text = text.split("FAQS", 1)[0]
        text = re.sub(r"^.*?UPDATES\s*", "", text, count=1, flags=re.S) if page == 59 else text
        updates.append({
            "id": f"rules-updates-page-{page}",
            "section": "Rules Updates",
            "subject": f"Official rules updates, page {page}",
            "change": clean(text),
            "sourcePages": [page],
            "provenance": provenance([page]),
        })

    data = {
        "meta": meta,
        "provenance": {
            "sourceId": SOURCE_ID,
            "authority": "Games Workshop",
            "documentType": "faction-pack",
            "edition": "Warhammer 40,000 11th Edition",
            "pageNumbering": "physical PDF pages",
            "note": "This pack supplements Codex: Space Marines; it is not a complete codex source.",
        },
        "pages": pages,
        "indexes": {
            "detachmentPages": {
                title: [rule_page] + ([stratagem_page] if stratagem_page and stratagem_page != rule_page else [])
                for title, rule_page, stratagem_page in DETACHMENTS
            },
            "rulesUpdates": [59, 60, 61, 62],
            "faqs": [62],
            "legendsArmoury": [157, 216],
            "renegadesAndTraitors": [217],
        },
        "detachments": detachments,
        "datasheets": {
            "matched": [indexed(title, pages_) for title, pages_ in MATCHED],
            "imperialArmour": [indexed("Thunderhawk Gunship", [57, 58])],
            "legends": [indexed(title, [page, page + 1]) for title, page in LEGENDS],
        },
        "updates": updates,
        "faqs": faqs,
    }
    return data, related


def comparable(value: str) -> list[str]:
    value = unicodedata.normalize("NFKD", value).encode("ascii", "ignore").decode().casefold()
    return re.findall(r"[a-z0-9]+", value)


def appears(value: str, page_text: str) -> bool:
    wanted = comparable(value)
    available = iter(comparable(page_text))
    return all(any(word == candidate for candidate in available) for word in wanted)


def validate(data: dict, related: dict) -> list[str]:
    errors = []
    if data["meta"]["pageCount"] != 217:
        errors.append("expected 217 PDF pages")
    if len(data["detachments"]) != 15:
        errors.append("expected 15 Faction Pack detachments")
    stratagems = [item for detachment in data["detachments"] for item in detachment["stratagems"]]
    if len(stratagems) != 78:
        errors.append(f"expected 78 Faction Pack stratagems, found {len(stratagems)}")
    if set(related["stratagems"]) != {item["id"] for item in stratagems}:
        errors.append("related-rules coverage does not exactly match Faction Pack stratagems")
    for detachment in data["detachments"]:
        source = "\n".join(data["pages"][str(page)]["text"] for page in detachment["rule"]["sourcePages"])
        if not appears(detachment["rule"]["text"], source):
            errors.append(f"{detachment['rule']['id']}: detachment rule does not match PDF")
        for enhancement in detachment["enhancements"]:
            if not appears(enhancement["text"], source):
                errors.append(f"{detachment['id']}/{enhancement['id']}: enhancement does not match PDF")
        if detachment.get("restrictions") and not appears(detachment["restrictions"], source):
            errors.append(f"{detachment['id']}: restrictions do not match PDF")
    for stratagem in stratagems:
        source = "\n".join(data["pages"][str(page)]["text"] for page in stratagem["sourcePages"])
        for field in ("when", "target", "effect"):
            if not appears(stratagem[field], source):
                errors.append(f"{stratagem['id']}: {field} does not match PDF")
        contract = related["stratagems"][stratagem["id"]]
        if contract.get("v") != 1 or not contract.get("roles"):
            errors.append(f"{stratagem['id']}: invalid related-rules contract")
        for entry in contract.get("roles", []):
            selector = entry.get("selector", {})
            if not any(selector.get(key) for key in ("unitIds", "allKeywords", "alternatives")):
                errors.append(f"{stratagem['id']}/{entry.get('id')}: empty selector")
    codex = json.loads(CODEX.read_text(encoding="utf-8"))
    known_unit_ids = {
        item["id"] for group in ("datasheets", "imperialArmour", "legends") for item in codex[group]
    }
    for stratagem_id, contract in related["stratagems"].items():
        for entry in contract["roles"]:
            selectors = [entry["selector"], *entry["selector"].get("alternatives", [])]
            for selector in selectors:
                unknown = set(selector.get("unitIds", [])) - known_unit_ids
                if unknown:
                    errors.append(f"{stratagem_id}/{entry['id']}: unknown unitIds {sorted(unknown)}")
    if len(data["datasheets"]["matched"]) != 14:
        errors.append("expected 14 matched-play Faction Pack datasheets")
    if len(data["datasheets"]["imperialArmour"]) != 1:
        errors.append("expected 1 Imperial Armour datasheet")
    if len(data["datasheets"]["legends"]) != 75:
        errors.append("expected 75 Legends datasheets")
    if len(data["faqs"]) != 14:
        errors.append(f"expected 14 FAQs, found {len(data['faqs'])}")
    for faq in data["faqs"]:
        source = data["pages"]["62"]["text"]
        if not appears(faq["question"], source) or not appears(faq["answer"], source):
            errors.append(f"{faq['id']}: FAQ does not match PDF")
    for update in data["updates"]:
        source = PdfReader(str(PDF)).pages[update["sourcePages"][0] - 1].extract_text() or ""
        if not appears(update["change"], source):
            errors.append(f"{update['id']}: update text does not match PDF")
    serialized = json.dumps(data, ensure_ascii=False)
    for marker in ("\ufffd", "Ã", "â€", "ï¿½"):
        if marker in serialized:
            errors.append(f"mojibake marker found: {marker!r}")
    return errors


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    data, related = build()
    errors = validate(data, related)
    if args.check:
        if not OUTPUT.exists() or json.loads(OUTPUT.read_text(encoding="utf-8")) != data:
            errors.append("Faction Pack snapshot is stale")
        if not RELATED.exists() or json.loads(RELATED.read_text(encoding="utf-8")) != related:
            errors.append("related-rules snapshot is stale")
    if errors:
        print("\n".join(errors))
        return 1
    if not args.check:
        OUTPUT.parent.mkdir(parents=True, exist_ok=True)
        OUTPUT.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        RELATED.write_text(json.dumps(related, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        print(f"Wrote {OUTPUT.name} and {RELATED.name}")
    else:
        print("Space Marines Faction Pack source layer is current")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

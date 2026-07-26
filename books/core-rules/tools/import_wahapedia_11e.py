"""Extract the 11E digital Core Rules layer from a saved Wahapedia page.

Usage:
  python import_wahapedia_11e.py INPUT_HTML OUTPUT_JSON

The website never loads Wahapedia at runtime. This importer creates a small,
reviewable 11E snapshot for the reader; the official GW PDF is retained as a
verification source.
"""

from __future__ import annotations

import hashlib
import json
import re
import sys
from copy import deepcopy
from pathlib import Path
from urllib.parse import urljoin, urlparse

from lxml import html


CODE_RE = re.compile(r"\b((?:0[1-9]|1\d|2[0-5])\.\d{2}(?:\.\d{2})?)\b")
SECTION_BY_NUMBER = {
    "01": "core-concepts", "02": "datasheets", "03": "moving",
    "04": "making-attacks", "05": "attack-sequence", "06": "other-concepts",
    "07": "battle-round-overview", "08": "command-phase", "09": "movement-phase",
    "10": "shooting-phase", "11": "charge-phase", "12": "fight-phase",
    "13": "terrain", "14": "objectives", "15": "stratagems", "16": "actions",
    "17": "monsters-vehicles", "18": "transports", "19": "attached-units",
    "20": "strategic-reserves", "21": "flying-surging",
    "22": "other-rules-abilities", "23": "aircraft", "24": "core-abilities",
    "25": "muster-armies",
}
SKIP_IMAGES = {
    "ArrowRight.png", "turnEither.png", "turnYour.png", "turnEnemy.png",
    "wh40k9_logo2.png", "CommandPhase_logo2.png", "MovementPhase_logo2.png",
    "ShootingPhase_logo2.png", "ChargePhase_logo2.png", "FightPhase_logo2.png",
    "Action_logo2.png",
}


def clean_text(element) -> str:
    node = deepcopy(element)
    for unwanted in node.xpath(
        './/*[contains(concat(" ",normalize-space(@class)," ")," tooltip_header ") '
        'or contains(concat(" ",normalize-space(@class)," ")," tooltip_link ") '
        'or contains(concat(" ",normalize-space(@class)," ")," abNameWrap ") '
        'or contains(concat(" ",normalize-space(@class)," ")," str11Wrap ") '
        'or contains(concat(" ",normalize-space(@class)," ")," abWrap ") '
        'or self::script or self::style]'
    ):
        unwanted.getparent().remove(unwanted)
    for br in node.xpath(".//br"):
        br.tail = "\n" + (br.tail or "")
    for li in node.xpath(".//li"):
        li.text = "\n• " + (li.text or "")
        li.tail = "\n" + (li.tail or "")
    for block in node.xpath(".//p|.//div|.//tr|.//h3"):
        block.tail = "\n" + (block.tail or "")
    lines = []
    for line in "".join(node.itertext()).replace("\xa0", " ").splitlines():
        line = re.sub(r"\s+", " ", line).strip()
        if line and (not lines or line != lines[-1]):
            lines.append(line)
    return "\n".join(lines)


def heading_record(heading) -> dict | None:
    label = " ".join(heading.text_content().split())
    match = CODE_RE.search(label)
    if not match:
        return None
    code = match.group(1)
    title = (label[:match.start()] + label[match.end():]).strip(" -")
    holder = html.Element("div")
    if heading.tail and heading.tail.strip():
        holder.text = heading.tail
    sibling = heading.getnext()
    while sibling is not None and sibling.tag not in {"h2", "h3"}:
        holder.append(deepcopy(sibling))
        sibling = sibling.getnext()
    text = clean_text(holder)
    return {"code": code, "title": title or code, "text": text}


def strip_embedded_records(records: dict[str, dict]) -> None:
    """Remove rule bodies that Wahapedia nests inside a neighbouring heading."""
    for record in records.values():
        text = record.get("text", "")
        for other in records.values():
            if other["code"] == record["code"] or not other.get("text"):
                continue
            child = other["code"].startswith(record["code"] + ".")
            variants = [
                f'{other["code"]} {other["title"]}\n{other["text"]}',
                f'{other["title"]} {other["code"]}{other["text"]}',
                f'{other["title"]} {other["code"]}\n{other["text"]}',
                f'{other["title"]}\n{other["text"]}',
                f'{other["title"].upper()}\n{other["text"]}',
            ]
            for block in variants:
                text = text.replace(block, "")
            if len(record["code"].split(".")) == 2 and len(other["code"].split(".")) == 2:
                marker = f'\n{other["title"]} {other["code"]}'
                index = text.find(marker)
                remainder = text[index + len(marker):].lstrip() if index >= 0 else ""
                if index >= 0 and remainder.startswith(other["text"][:80]):
                    text = text[:index]
        record["text"] = re.sub(r"\n{3,}", "\n\n", text).strip()


def normalize_record_structure(records: dict[str, dict]) -> None:
    """Repair known Wahapedia layout fragments without changing the rule hierarchy."""
    def add_child(code: str, title: str, text: str) -> None:
        records.setdefault(code, {
            "code": code,
            "title": title,
            "text": text,
            "kind": "digital-clarification",
        })

    def remove_section(code: str, start: str, end: str = "") -> None:
        record = records.get(code)
        if not record:
            return
        text = record["text"]
        begin = text.find(start)
        if begin < 0:
            return
        finish = text.find(end, begin + len(start)) if end else -1
        record["text"] = re.sub(
            r"\n{3,}", "\n\n", text[:begin] + (text[finish:] if finish >= 0 else "")
        ).strip()

    add_child(
        "03.04.01",
        "What Is Engagement",
        "While opposing models are within each other’s engagement range, they are able to fight in vicious melee, so unless they are seeking to make melee attacks, models should keep out of their foes’ reach.",
    )
    add_child(
        "19.04.01",
        "Only In Death Does Duty End",
        "Leader and support units often have abilities that make the models they are leading more powerful. In the same way, some bodyguard units’ abilities can enhance the power of those leading them. The rules in Abilities in Attached Units mean that once the models conferring such effects are destroyed, that attached unit does not continue to benefit from them. Should those models later be revived, however, those abilities will once more apply to their attached unit.",
    )

    modifiers = records.get("02.02.01")
    if modifiers:
        modifiers["title"] = "Modifiers"
        if not modifiers["text"].startswith("WHAT ARE MODIFIERS?"):
            introduction = (
                "WHAT ARE MODIFIERS?\n"
                "Many rules in the game modify a value, characteristic or roll elsewhere in the game. A rule that does so is known as a modifier. A value that has been changed is a modified rule (for example, a modified characteristic, modified roll or modified value).\n"
                "One of the most common ways for modifiers to be presented is as +1 or -1 to a characteristic, roll or value.\n"
                "If a rule has +1 to a characteristic, it improves it by the value after the ‘+’ symbol. For example, ‘This weapon has +1 AP’ would improve an AP characteristic of -2 to -3.\n"
                "If a rule has -1 to a characteristic, it worsens it by the value after the ‘-’ symbol. For example, ‘This unit has -1 Sv’ would worsen a Sv characteristic of 3+ to 4+."
            )
            modifiers["text"] = f'{introduction}\n\n{modifiers["text"]}'

    if "24.37.01" in records:
        records["24.37.01"]["title"] = "Torrent Restrictions"

    remove_section("03.02", "IF YOU CANNOT SET UP A UNIT")
    remove_section("03.03", "WHAT IS COHERENCY?", "COHERENCY\n")
    remove_section("03.04", "WHAT IS ENGAGEMENT?", "ENGAGEMENT\n")
    remove_section("09.02", "SELECTING UNITS TO MOVE", "SEE ALSO")
    remove_section("11.02", "FAILED CHARGES", "SEE ALSO")
    remove_section("19.04", "ONLY IN DEATH DOES DUTY END")

    strength = records.get("01.02.01")
    if strength:
        strength["text"] = strength["text"].replace(
            "UNIT STRENGTH\nSTARTING STRENGTH OF 1STARTING STRENGTH OF 2 OR MORE\nBELOW STARTING STRENGTHModel’s remaining wounds are less than its W characteristic.Number of remaining models in the unit is less than its starting strength.\nAT HALF-STRENGTHModel’s remaining wounds are half of its W characteristic.Number of remaining models in the unit is half of its starting strength.\nBELOW HALF-STRENGTHModel’s remaining wounds are less than half of its W characteristic.Number of remaining models in the unit is less than half of its starting strength.",
            "UNIT STRENGTH\nBelow Starting Strength\nStarting strength of 1: The model’s remaining wounds are less than its W characteristic.\nStarting strength of 2 or more: The number of remaining models is less than the unit’s starting strength.\nAt Half-Strength\nStarting strength of 1: The model’s remaining wounds are half of its W characteristic.\nStarting strength of 2 or more: The number of remaining models is half of the unit’s starting strength.\nBelow Half-Strength\nStarting strength of 1: The model’s remaining wounds are less than half of its W characteristic.\nStarting strength of 2 or more: The number of remaining models is less than half of the unit’s starting strength.",
        )

    attached = records.get("19.04")
    if attached:
        attached["text"] = attached["text"].replace(
            "ABILITIES IN ATTACHED UNITS\nSOURCE OF ABILITY/RULEAPPLIES TO THE ATTACHED UNIT UNTIL\nLeader/support unitThe last model in that leader/support unit is destroyed.*\nBodyguard unit (for example from a datasheet ability)The last model in that bodyguard unit is destroyed.\nA specific model (for example the bearer of an enhancement or an item of wargear)That model is destroyed.",
            "ABILITIES IN ATTACHED UNITS\nLeader/support unit: Applies until the last model in that leader/support unit is destroyed.*\nBodyguard unit (for example, from a datasheet ability): Applies until the last model in that bodyguard unit is destroyed.\nA specific model (for example, the bearer of an enhancement or an item of wargear): Applies until that model is destroyed.",
        )

    battle_size = records.get("25.03")
    if battle_size:
        battle_size["text"] = battle_size["text"].replace(
            "BATTLE SIZEPoints TotalDetachment Points (DP)Enhancement LimitUnit Limit*\nINCURSION1000222\nSTRIKE FORCE2000343",
            "BATTLE SIZE\nIncursion: 1000 points; 2 Detachment Points; Enhancement limit 2; Unit limit 2.\nStrike Force: 2000 points; 3 Detachment Points; Enhancement limit 4; Unit limit 3.",
        )


def main(input_file: str, output_file: str) -> None:
    source = Path(input_file)
    raw = source.read_bytes()
    document = html.fromstring(raw)
    records: dict[str, dict] = {}

    tooltip_codes: dict[str, list[str]] = {}
    for trigger in document.xpath('//*[@data-tooltip-content]'):
        target = (trigger.get("data-tooltip-content") or "").lstrip("#")
        codes = CODE_RE.findall(" ".join(trigger.text_content().split()))
        if target and codes:
            tooltip_codes.setdefault(target, []).extend(codes)

    for element in document.xpath('//*[@id and starts-with(@id,"tooltip_content")]'):
        headers = element.xpath(
            './/*[contains(concat(" ",normalize-space(@class)," ")," tooltip_header ")]'
        )
        if not headers:
            continue
        label = " ".join(headers[0].text_content().split())
        match = CODE_RE.match(label)
        code = match.group(1) if match else next(iter(tooltip_codes.get(element.get("id"), [])), None)
        if not code:
            continue
        records[code] = {
            "code": code,
            "title": label[match.end():].strip() if match else label,
            "text": clean_text(element),
            "kind": "digital-clarification",
        }

    for name in document.xpath(
        '//*[contains(concat(" ",normalize-space(@class)," ")," str11Name ")]'
    ):
        label = " ".join(name.text_content().split())
        match = re.search(r"((?:0[1-9]|1\d|2[0-5])\.\d{2})$", label)
        if not match:
            continue
        wrapper = next(
            (ancestor for ancestor in name.iterancestors()
             if "str11Wrap" in (ancestor.get("class") or "").split()),
            None,
        )
        if wrapper is None:
            continue
        code = match.group(1)
        title = label[:match.start()].strip()
        cp = " ".join(wrapper.xpath('string(.//*[contains(@class,"str11CP")])').split())
        rule_type = " ".join(wrapper.xpath('string(.//*[contains(@class,"str11Type")])').split())
        legend = " ".join(wrapper.xpath('string(.//*[contains(@class,"str11Legend")])').split())
        body_nodes = wrapper.xpath('.//*[contains(concat(" ",normalize-space(@class)," ")," str11Text ")]')
        body = clean_text(body_nodes[0]) if body_nodes else clean_text(wrapper)
        records[code] = {
            "code": code,
            "title": title,
            "text": "\n".join(part for part in [cp, rule_type, legend, body] if part),
            "kind": "sequence" if not code.startswith("15.") else "stratagem",
        }

    for name in document.xpath(
        '//*[contains(concat(" ",normalize-space(@class)," ")," abName ")]'
    ):
        label = " ".join(name.text_content().split())
        pairs = re.findall(r"([^/]+?)((?:0[1-9]|1\d|2[0-5])\.\d{2})(?:\s*/\s*|$)", label)
        wrapper = next(
            (ancestor for ancestor in name.iterancestors()
             if "abWrap" in (ancestor.get("class") or "").split()),
            None,
        )
        if wrapper is None:
            continue
        legend = " ".join(wrapper.xpath('string(.//*[contains(@class,"abLegend")])').split())
        body = clean_text(wrapper)
        if legend and body.startswith(f"{legend}\n{legend}"):
            body = body[len(legend) + 1:]
        for title, code in pairs:
            title = title.strip()
            # Wahapedia currently duplicates 24.23 for SUPPORT and LETHAL HITS;
            # the official 11E PDF numbers SUPPORT as 24.34.
            if title == "SUPPORT":
                code = "24.34"
            records[code] = {
                "code": code,
                "title": title,
                "text": "\n".join(part for part in [legend, body] if part),
                "kind": "ability",
            }

    for heading in document.xpath("//h2|//h3"):
        record = heading_record(heading)
        if record:
            record["kind"] = "muster" if record["code"].startswith("25.") else "rule"
            records[record["code"]] = record

    strip_embedded_records(records)
    normalize_record_structure(records)

    images: dict[str, list[dict]] = {}
    seen: set[str] = set()
    for image in document.xpath("//img[@src]"):
        url = urljoin("https://wahapedia.ru/wh40k11ed/the-rules/core-rules/", image.get("src"))
        filename = Path(urlparse(url).path).name
        if filename in seen or filename in SKIP_IMAGES:
            continue
        headings = image.xpath(
            'preceding::h2[contains(concat(" ",normalize-space(@class)," ")," outline_header ")] '
            '| preceding::h3[contains(concat(" ",normalize-space(@class)," ")," outline_header ")]'
        )
        if not headings:
            continue
        label = " ".join(headings[-1].text_content().split())
        number = re.search(r"\b(\d{2})\b", label)
        if not number and "Attack Sequence Examples" in label:
            section = "attack-sequence"
        elif number:
            section = SECTION_BY_NUMBER.get(number.group(1))
        else:
            continue
        if not section:
            continue
        seen.add(filename)
        caption = re.sub(r"(?<!^)([A-Z])", r" \1", Path(filename).stem).strip()
        images.setdefault(section, []).append({"file": filename, "url": url, "caption": caption})

    payload = {
        "meta": {
            "edition": "11E",
            "source": "https://wahapedia.ru/wh40k11ed/the-rules/core-rules/",
            "sha256": hashlib.sha256(raw).hexdigest(),
            "note": "Wahapedia 11E reference snapshot for reader rendering; official GW PDF retained for verification.",
        },
        "records": sorted(records.values(), key=lambda item: [int(part) for part in item["code"].split(".")]),
        "images": images,
    }
    Path(output_file).write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Imported {len(payload['records'])} digital records and {sum(map(len, images.values()))} diagrams.")


if __name__ == "__main__":
    if len(sys.argv) != 3:
        raise SystemExit("Usage: import_wahapedia_11e.py INPUT_HTML OUTPUT_JSON")
    main(sys.argv[1], sys.argv[2])

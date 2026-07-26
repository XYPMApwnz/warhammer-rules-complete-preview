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

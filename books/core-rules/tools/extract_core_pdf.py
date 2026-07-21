"""Extract the local Core Rules PDF into a deterministic browser-ready source snapshot."""

from __future__ import annotations

import hashlib
import json
import re
import sys
from pathlib import Path

from pypdf import PdfReader


SECTION_PAGES = {
    "introduction": [4, 5],
    "core-concepts": [8, 9],
    "datasheets": [10, 11],
    "moving": [12, 13, 14, 15],
    "making-attacks": [16, 17],
    "attack-sequence": [18, 19, 20, 21, 22, 23],
    "other-concepts": [24, 25],
    "battle-round-overview": [28, 29],
    "command-phase": [30, 31],
    "movement-phase": [32, 33],
    "shooting-phase": [34, 35],
    "charge-phase": [36, 37],
    "fight-phase": [38, 39, 40, 41, 42, 43],
    "terrain": [46, 47, 48, 49, 50, 51],
    "objectives": [52, 53],
    "stratagems": [54, 55, 56, 57],
    "actions": [58, 59],
    "monsters-vehicles": [62, 63],
    "transports": [64, 65],
    "attached-units": [66, 67],
    "strategic-reserves": [68, 69],
    "flying-surging": [70, 71],
    "other-rules-abilities": [72, 73],
    "aircraft": [74, 75],
    "core-abilities": [78, 79, 80, 81, 82, 83, 84, 85],
    "rules-appendix": [86, 87, 88],
}

APPENDIX_ARTICLES = [
    {"id": "starting-strength", "title": "Starting Strength and Half-strength", "page": 86},
    {"id": "adding-new-unit", "title": "Adding a New Unit to Your Army", "page": 87},
    {"id": "destroyed", "title": "Destroyed", "page": 87},
    {"id": "different-move-characteristics", "title": "Different Move Characteristics", "page": 87},
    {"id": "eligible-unable-fight", "title": "Eligible to Fight, but Unable to Fight", "page": 87},
    {"id": "mixed-keywords", "title": "Mixed Keywords in Units", "page": 87},
    {"id": "objectives-outside-terrain", "title": "Objectives Not Within a Terrain Area", "page": 88},
    {"id": "revived", "title": "Revived", "page": 88},
    {"id": "faqs", "title": "FAQs", "page": 88},
]


def clean_text(value: str) -> str:
    value = value.replace("\x08", "").replace("\ufffd", "").replace("\u00ad", "")
    value = value.replace("\u2011", "-").replace("\u2013", "-").replace("\u2014", "-")
    value = re.sub(r"(?<=\w)-\n(?=\w)", "", value)
    lines = [re.sub(r"[ \t]+", " ", line).strip() for line in value.splitlines()]
    lines = [line for line in lines if line and not re.fullmatch(r"\d{1,3}", line)]
    return "\n".join(lines).strip()


def heading_like(value: str) -> bool:
    letters = "".join(character for character in value if character.isalpha())
    return bool(letters) and letters == letters.upper() and len(value) <= 56 and not value.startswith("▪")


def extract_rules(section_id: str, page_numbers: list[int], pages: dict[str, str]) -> list[dict[str, object]]:
    section_number = re.match(r"\d+", section_id)  # Kept for type clarity; IDs are semantic.
    del section_number
    entries: list[dict[str, object]] = []
    for page_number in page_numbers:
        for line in pages[str(page_number)].splitlines():
            entries.append({"page": page_number, "line": line})

    prefix_by_section = {
        section: f"{index:02d}."
        for index, section in enumerate(
            [
                "core-concepts", "datasheets", "moving", "making-attacks", "attack-sequence", "other-concepts",
                "battle-round-overview", "command-phase", "movement-phase", "shooting-phase", "charge-phase",
                "fight-phase", "terrain", "objectives", "stratagems", "actions", "monsters-vehicles",
                "transports", "attached-units", "strategic-reserves", "flying-surging", "other-rules-abilities",
                "aircraft", "core-abilities",
            ],
            start=1,
        )
    }
    prefix = prefix_by_section.get(section_id)
    if not prefix:
        return []

    found: list[dict[str, object]] = []
    direct_pattern = re.compile(r"^(.+?)\s+(\d{2}\.\d{2})$")
    code_pattern = re.compile(r"^\d{2}\.\d{2}$")
    for index, entry in enumerate(entries):
        line = str(entry["line"])
        direct = direct_pattern.match(line)
        if direct and direct.group(2).startswith(prefix):
            title = direct.group(1).strip()
            start = index
            code = direct.group(2)
        elif code_pattern.fullmatch(line) and line.startswith(prefix):
            title_lines: list[str] = []
            cursor = index - 1
            while cursor >= 0 and len(title_lines) < 4:
                candidate = str(entries[cursor]["line"])
                if not heading_like(candidate):
                    break
                title_lines.insert(0, candidate)
                cursor -= 1
            if not title_lines:
                continue
            title = " ".join(title_lines)
            start = cursor + 1
            code = line
        else:
            continue
        title = re.sub(r"^\d+\s+", "", title).strip(" ▪")
        if section_id == "monsters-vehicles" and title.startswith("MONSTERS AND VEHICLES "):
            title = title.removeprefix("MONSTERS AND VEHICLES ")
        if section_id == "strategic-reserves" and title.startswith("STRATEGIC RESERVES "):
            title = title.removeprefix("STRATEGIC RESERVES ")
        if not title or any(item["code"] == code for item in found):
            continue
        found.append({"code": code, "title": title, "page": entry["page"], "start": start, "content": index + 1})

    rules: list[dict[str, object]] = []
    for position, item in enumerate(found):
        end = int(found[position + 1]["start"]) if position + 1 < len(found) else len(entries)
        text_lines = [str(entry["line"]) for entry in entries[int(item["content"]):end]]
        text = "\n".join(text_lines).strip()
        rules.append({"code": item["code"], "title": item["title"], "page": item["page"], "text": text})
    return rules


def main() -> None:
    if len(sys.argv) != 3:
        raise SystemExit("usage: extract_core_pdf.py INPUT.pdf OUTPUT.js")
    source = Path(sys.argv[1]).resolve()
    destination = Path(sys.argv[2]).resolve()
    reader = PdfReader(str(source))
    pages = {str(index + 1): clean_text(page.extract_text() or "") for index, page in enumerate(reader.pages)}
    rules = {section_id: extract_rules(section_id, page_numbers, pages) for section_id, page_numbers in SECTION_PAGES.items()}
    payload = {
        "meta": {
            "file": source.name,
            "sha256": hashlib.sha256(source.read_bytes()).hexdigest(),
            "pageCount": len(reader.pages),
            "language": "en",
        },
        "sections": SECTION_PAGES,
        "rules": rules,
        "appendix": APPENDIX_ARTICLES,
        "pages": pages,
    }
    destination.parent.mkdir(parents=True, exist_ok=True)
    encoded = json.dumps(payload, ensure_ascii=False, separators=(",", ":"))
    destination.write_text(
        "window.CORE_PDF_SOURCE=Object.freeze(" + encoded + ");\n", encoding="utf-8"
    )
    print(f"extracted {len(reader.pages)} pages -> {destination}")


if __name__ == "__main__":
    main()

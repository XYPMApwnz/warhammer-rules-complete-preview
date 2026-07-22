#!/usr/bin/env python3
"""Extract the reproducible Adeptus Mechanicus codex layer from BSData XML.

The official Faction Pack remains authoritative and is overlaid by the site
builder.  This snapshot supplies the Codex datasheets that the supplement does
not reprint, in the same role Wahapedia transcriptions played in the DG build.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import re
from pathlib import Path

from lxml import etree


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "sources" / "bsdata-adeptus-mechanicus.cat"
OUTPUT = ROOT / "content" / "adeptus-mechanicus-codex-datasheets.en.json"
SOURCE_URL = "https://github.com/BSData/wh40k-10e/blob/main/Imperium%20-%20Adeptus%20Mechanicus.cat"
WAHAPEDIA_URL = "https://wahapedia.ru/wh40k10ed/factions/adeptus-mechanicus/datasheets.html"
EXCLUDED = {"Detachment", "Show/Hide Options", "Order of Battle"}
NON_DATASHEET_LINKS = {"warlord", "enhancements", "crusade", "weapon modifications", "crusade relic upgrades"}


def clean(value: str | None) -> str:
    value = value or ""
    value = value.replace("^^**", "").replace("**^^", "").replace("**", "")
    value = value.replace("\u00a0", " ").replace("\u2011", "-").replace("\ufffd", "")
    return re.sub(r"[ \t]+", " ", value).strip()


def slug(value: str) -> str:
    value = clean(value).lower().replace("’", "").replace("'", "")
    value = re.sub(r"\[[^]]+]", "", value)
    return re.sub(r"[^a-z0-9]+", "-", value).strip("-")


def characteristics(profile) -> dict[str, str]:
    return {
        clean(item.get("name")): clean(item.text)
        for item in profile.xpath('./b:characteristics/b:characteristic', namespaces=NS)
    }


def constraint_range(entry) -> str:
    values: dict[str, int] = {}
    for item in entry.xpath('./b:constraints/b:constraint[@field="selections"]', namespaces=NS):
        try:
            values[item.get("type")] = int(float(item.get("value", "0")))
        except ValueError:
            pass
    low, high = values.get("min", 0), values.get("max", 0)
    if low and high and low != high:
        return f"{low}-{high}"
    return str(low or high or 1)


def unique(items, key):
    seen = set()
    output = []
    for item in items:
        marker = key(item)
        if marker in seen:
            continue
        seen.add(marker)
        output.append(item)
    return output


def resolved_profiles(entry):
    profiles = []
    pending = [entry]
    visited = set()
    while pending:
        node = pending.pop()
        marker = node.get("id") or id(node)
        if marker in visited:
            continue
        visited.add(marker)
        profiles.extend(node.xpath('.//b:profile[not(@hidden="true")]', namespaces=NS))
        for link in node.xpath('.//b:infoLink[@type="profile"] | .//b:entryLink', namespaces=NS):
            if link.tag.endswith("entryLink") and clean(link.get("name")).lower() in NON_DATASHEET_LINKS:
                continue
            target = BY_ID.get(link.get("targetId"))
            if target is None:
                continue
            if target.tag.endswith("profile"):
                profiles.append(target)
            elif target.tag.endswith("selectionEntry") or target.tag.endswith("selectionEntryGroup"):
                pending.append(target)
    return unique(profiles, lambda item: item.get("id") or etree.tostring(item))


def resolved_rules(entry) -> list[dict[str, str]]:
    rules = []
    for link in entry.xpath('./b:infoLinks/b:infoLink[@type="rule"]', namespaces=NS):
        title = clean(link.get("name"))
        additions = [clean(x.get("value")) for x in link.xpath('./b:modifiers/b:modifier[@type="append"]', namespaces=NS)]
        if additions:
            title = f"{title} {' '.join(additions)}"
        target = BY_ID.get(link.get("targetId"))
        text = ""
        if target is not None:
            text = clean(target.get("description") or target.findtext(f"{{{URI}}}description"))
        rules.append({"title": title, "text": text})
    return rules


def category_for(name: str, categories: list[str]) -> str:
    if "[Legends]" in name:
        return "Warhammer Legends"
    category_set = {item.lower() for item in categories}
    if "epic hero" in category_set:
        return "Epic Heroes"
    if "character" in category_set:
        return "Characters"
    if "battleline" in category_set:
        return "Battleline"
    if "dedicated transport" in category_set:
        return "Dedicated Transports"
    return "Other"


def parse_unit(link) -> dict:
    entry = BY_ID[link.get("targetId")]
    raw_name = clean(link.get("name"))
    title = clean(re.sub(r"\s*\[Legends]\s*$", "", raw_name))
    profiles = resolved_profiles(entry)

    stat_profiles = []
    for profile in profiles:
        if profile.get("typeName") != "Unit":
            continue
        stats = characteristics(profile)
        if all(key in stats for key in ("M", "T", "SV", "W", "LD", "OC")):
            stat_profiles.append({
                "name": clean(profile.get("name")),
                "stats": {"M": stats["M"], "T": stats["T"], "Sv": stats["SV"], "W": stats["W"], "Ld": stats["LD"], "OC": stats["OC"]},
            })
    stat_profiles = unique(stat_profiles, lambda item: (item["name"], tuple(item["stats"].values())))
    if not stat_profiles:
        raise ValueError(f"No stat profile for {title}")

    weapons = []
    for profile in profiles:
        profile_type = profile.get("typeName")
        if profile_type not in {"Ranged Weapons", "Melee Weapons"}:
            continue
        stats = characteristics(profile)
        skill = stats.get("BS") if profile_type == "Ranged Weapons" else stats.get("WS")
        weapons.append({
            "name": clean(profile.get("name")),
            "mode": "ranged" if profile_type == "Ranged Weapons" else "melee",
            "range": stats.get("Range", "-"),
            "a": stats.get("A", "-"),
            "skill": skill or "-",
            "s": stats.get("S", "-"),
            "ap": stats.get("AP", "-"),
            "d": stats.get("D", "-"),
            "abilities": ", ".join(clean(x) for x in stats.get("Keywords", "").split(",") if clean(x) and clean(x) != "-"),
        })
    weapons = unique(weapons, lambda item: tuple(str(item[key]) for key in ("name", "mode", "range", "a", "skill", "s", "ap", "d")))

    abilities = []
    invulnerable = ""
    for profile in profiles:
        if profile.get("typeName") != "Abilities":
            continue
        title_text = clean(profile.get("name"))
        text = characteristics(profile).get("Description", "")
        if title_text.lower().startswith("invulnerable save"):
            invulnerable = re.search(r"\d\+", f"{title_text} {text}").group(0) if re.search(r"\d\+", f"{title_text} {text}") else invulnerable
            continue
        abilities.append({"title": title_text, "text": text})
    abilities.extend(resolved_rules(entry))
    abilities = unique([item for item in abilities if item["title"]], lambda item: item["title"].lower())
    for link_node in entry.xpath('.//b:infoLink[contains(@name,"Invulnerable Save")]', namespaces=NS):
        match = re.search(r"\d\+", clean(link_node.get("name")))
        if match:
            invulnerable = match.group(0)

    categories = unique(
        [clean(item.get("name")).replace("Faction: ", "") for item in entry.xpath('./b:categoryLinks/b:categoryLink', namespaces=NS)],
        lambda item: item.lower(),
    )
    model_entries = entry.xpath('./b:selectionEntries/b:selectionEntry[@type="model"]', namespaces=NS)
    if entry.get("type") == "model":
        composition = f"1 {title}."
    elif model_entries:
        composition = "; ".join(f"{constraint_range(item)} {clean(item.get('name'))}" for item in model_entries) + "."
    else:
        composition = f"See the model selections for {title}."

    points = []
    for cost in entry.xpath('.//b:cost[@name="pts"]', namespaces=NS):
        value = clean(cost.get("value"))
        if value and value != "0":
            points.append(value)
    points = sorted(set(points), key=lambda value: float(value))

    return {
        "id": f"unit-{slug(title)}",
        "title": title,
        "status": "Warhammer Legends" if "[Legends]" in raw_name else "Codex transcription",
        "category": category_for(raw_name, categories),
        "points": points,
        "stats": stat_profiles[0]["stats"],
        "profiles": stat_profiles,
        "invulnerable": invulnerable,
        "weapons": weapons,
        "abilities": abilities,
        "composition": composition,
        "wargear": [f"Available weapon profiles: {', '.join(item['name'] for item in weapons)}."] if weapons else [],
        "keywords": categories,
        "source": {"label": "Codex transcription · BSData", "url": SOURCE_URL},
        "referenceUrl": WAHAPEDIA_URL,
    }


def build() -> dict:
    global NS, URI, BY_ID
    tree = etree.parse(str(SOURCE))
    root = tree.getroot()
    URI = root.nsmap[None]
    NS = {"b": URI}
    BY_ID = {item.get("id"): item for item in root.xpath('//*[@id]')}
    links = root.xpath('./b:entryLinks/b:entryLink[@type="selectionEntry"]', namespaces=NS)
    links = [item for item in links if item.get("name") not in EXCLUDED and "[Crucible]" not in item.get("name", "")]
    datasheets = [parse_unit(item) for item in links]
    datasheets.sort(key=lambda item: (item["category"], item["title"]))
    return {
        "schema": 1,
        "source": {
            "title": "BSData Warhammer 40,000 10th Edition · Adeptus Mechanicus",
            "url": SOURCE_URL,
            "revision": root.get("revision"),
            "sha256": hashlib.sha256(SOURCE.read_bytes()).hexdigest().upper(),
        },
        "datasheets": datasheets,
        "audit": {
            "datasheets": len(datasheets),
            "legendsDatasheets": sum(item["status"] == "Warhammer Legends" for item in datasheets),
        },
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    output = json.dumps(build(), ensure_ascii=False, indent=2) + "\n"
    if args.check:
        if not OUTPUT.exists() or OUTPUT.read_text(encoding="utf-8") != output:
            raise SystemExit("Codex datasheet snapshot is stale; run tools/extract-bsdata.py")
        print("Codex datasheet snapshot is current")
        return
    OUTPUT.write_text(output, encoding="utf-8")
    data = json.loads(output)
    print(f"Extracted {data['audit']['datasheets']} datasheets ({data['audit']['legendsDatasheets']} Legends)")


if __name__ == "__main__":
    main()

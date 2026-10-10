"""Enumerate accepted CSM source nodes before canonical identity assignment.

The corpus is an enrolled source extraction, not a publication projection.
Official PDF edits/FAQ are supplied by the caller after reading that PDF.
This module neither interprets effects nor reads an earlier audit or book build.
Persistent source-address bindings cross-reference the official MFM capture.
Display labels never choose identities; every cross-reference must resolve.
"""

from __future__ import annotations

import copy
import json
import re
from pathlib import Path

from lxml import html


def _read_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def _normalize(value: str) -> str:
    return re.sub(r"\s+", " ", value).strip()


def _unique(items, description: str):
    values = list(items)
    if len(values) != 1:
        raise ValueError(f"Source binding must be unique: {description} ({len(values)})")
    return values[0]


def collect_sources(root: Path, official: dict) -> list[dict]:
    """Return source-owned rows from current enrolled CSM inputs only.

    ``official`` contains ``updates`` (individual PDF edit blocks) and ``faqs``
    (PDF questions/answers with their explicit secondary occurrence source IDs).
    Their text is never obtained from a legacy transcription or QA artifact.
    Parent rows and structured children are source occurrences, not independent
    canonical semantic owners; the foundation builder resolves that ownership.
    """
    root = Path(root)
    book = root / "books/chaos-space-marines"
    captured = book / "sources/waha-11e-current-2026-09-29"
    corpus = _read_json(captured / "corpus.json")
    mfm = _read_json(book / "sources/official-mfm-v1.5.json")
    bindings = _read_json(book / "v2/capture-bindings.json")
    rows: list[dict] = []

    def relative(path: Path) -> str:
        return path.relative_to(root).as_posix()

    def add(kind, source_id, name, owner, document, location, payload=None,
            *, path="", status="ACCEPTED_SECONDARY", **proof):
        row = {
            "SOURCE_ENTITY_ID": source_id + (("#" + path) if path else ""),
            "ENTITY_TYPE": kind,
            "DISPLAY_NAME": name,
            "SOURCE_OWNER": owner,
            "SOURCE_DOCUMENT": document,
            "SOURCE_LOCATION": location,
            "PROVENANCE_STATUS": status,
            "PAYLOAD": copy.deepcopy(payload),
        }
        row.update(copy.deepcopy(proof))
        rows.append(row)
        return row

    hub = relative(captured / "chaos-space-marines.html")
    hub_tree = html.fromstring((root / hub).read_text(encoding="utf-8"))
    source_anchors = set(hub_tree.xpath("//@id | //@name"))
    for army in corpus["armyRules"]:
        anchor = _unique((value for value in source_anchors
                          if value.lower() == army["sourceId"].removeprefix("army-rule-")),
                         "Army Rule source anchor " + army["sourceId"])
        add("ARMY_RULE", army["sourceId"], army["title"], army["sourceId"],
            hub, "anchor " + anchor,
            army["components"])

    for detachment in corpus["detachments"]:
        owner = detachment["sourceId"]
        add("DETACHMENT", owner, detachment["title"], owner, hub,
            "detachment heading " + detachment["title"],
            {key: value for key, value in detachment.items()
             if key not in {"enhancements", "stratagems", "rule"}})
        rule = detachment["rule"]
        add("DETACHMENT_RULE", rule["sourceId"], rule["title"], owner, hub,
            "Detachment Rule under " + detachment["title"], rule)
        for table in rule["tables"]:
            add("STRUCTURED_RULE_TABLE", table["sourceId"], rule["title"] + " table",
                rule["sourceId"], hub, "detachment rule table " + table["sourceId"], table)
        for collection, kind in (("enhancements", "ENHANCEMENT"), ("stratagems", "STRATAGEM")):
            for item in detachment[collection]:
                add(kind, item["sourceId"], item["title"], owner, hub,
                    collection + " under " + detachment["title"], item)

    datasheets = corpus["datasheets"]
    for datasheet in datasheets:
        owner = datasheet["sourceId"]
        document = relative(captured / (datasheet["url"].rsplit("/", 1)[-1] + ".html"))
        # Decode explicitly: byte parsing can guess a different character encoding.
        tree = html.fromstring((root / document).read_text(encoding="utf-8"))
        frame = _unique(tree.xpath('//div[contains(@class,"dsOuterFrame") and contains(@class,"datasheet")]'), document)
        add("DATASHEET", owner, datasheet["title"], owner, document,
            "div.dsOuterFrame.datasheet", {"url": datasheet["url"], "sourceBadges": datasheet["sourceBadges"]})
        for profile in datasheet["profiles"]:
            add("MODEL_PROFILE", profile["sourceId"], profile["name"], owner,
                document, f'div.dsProfileBaseWrap[{profile["order"]}]', profile)
        for weapon in datasheet["weapons"]:
            add("WEAPON_PROFILE", weapon["sourceId"], weapon["name"], owner,
                document, f'tr.dsWeaponRow[{weapon["order"]}]', weapon)
        for option in datasheet["wargearOptions"]:
            kind = "NO_WARGEAR_OPTIONS" if option["text"].strip().lower() == "none" else "WARGEAR_OPTION"
            add(kind, option["sourceId"], option["text"], owner, document,
                "wargear list/comment ordinal " + str(option["order"]), option)

        for section in datasheet["sections"]:
            heading, section_id = section["title"].upper(), section["sourceId"]
            blocks = section["blocks"]
            if heading == "ABILITIES":
                for index, block in enumerate(blocks):
                    kind = "EQUIPMENT_ABILITY" if block["wargearAbility"] else "DATASHEET_ABILITY"
                    add(kind, section_id, block["text"].split(":", 1)[0], owner,
                        document, f"{heading} block {index + 1}", block,
                        path=f"/blocks/{index}/text")
            elif heading == "UNIT COMPOSITION":
                add("UNIT_COMPOSITION", section_id, datasheet["title"] + " composition",
                    owner, document, heading, blocks)
                member = 0
                for index, block in enumerate(blocks):
                    for line in block["text"].splitlines():
                        if re.match(r"^-\s*\d", line):
                            member += 1
                            add("COMPOSITION_MEMBER", section_id + f":member:{member}",
                                line[2:], owner, document,
                                f"{heading} block {index + 1} line {member}", line)
            elif heading in {"LEADER", "SUPPORT", "ATTACHED UNIT"}:
                add("ATTACHMENT_DECLARATION", section_id, datasheet["title"] + " " + heading,
                    owner, document, heading, blocks)
            elif heading == "TRANSPORT":
                add("TRANSPORT_DECLARATION", section_id, datasheet["title"] + " transport",
                    owner, document, heading, blocks)
            elif heading == "DAEMONIC ALLEGIANCE":
                add("UPGRADE_DECLARATION", section_id, datasheet["title"] + " " + section["title"],
                    owner, document, heading, blocks)
                for index, block in enumerate(blocks[1:], 1):
                    add("UPGRADE_OPTION", section_id + f":option:{index}",
                        block["text"].split(":", 1)[0], section_id, document,
                        heading + f" option {index}", block)
            else:
                add("SPECIAL_DATASHEET_RULE", section_id, datasheet["title"] + " " + section["title"],
                    owner, document, heading, blocks)
                if heading == "WARMASTER":
                    for index, block in enumerate(blocks):
                        add("NAMED_RULE_COMPONENT", section_id, block["text"].split(":", 1)[0],
                            section_id, document, heading + f" block {index + 1}", block,
                            path=f"/blocks/{index}/text")

        for reference in datasheet["ruleReferences"]:
            # Corpus membership occurrences carry source labels, not runtime IDs.
            kind = bindings["referenceKinds"][reference["sourceId"]]
            reference = copy.deepcopy(reference)
            if kind == "ARMY_RULE_MEMBERSHIP":
                reference["armyRuleId"] = bindings["armyRuleTargets"][reference["sourceId"]]
            add(kind, reference["sourceId"], reference["label"], owner, document,
                "dsCoreArmyValue occurrence " + str(reference["order"]), reference)
        for field, kind in (("keywords", "KEYWORD_MEMBERSHIP"), ("factionKeywords", "FACTION_KEYWORD")):
            for index, keyword in enumerate(datasheet[field], 1):
                add(kind, owner + f":{field}:{index}", keyword, owner, document,
                    field + f"[{index - 1}]", keyword)
        for index, node in enumerate(frame.xpath('.//*[contains(concat(" ",normalize-space(@class)," ")," ShowBaseSize ")]'), 1):
            text = _normalize(node.text_content())
            add("MODEL_BASE_METADATA", owner + f":base:{index}", text, owner,
                document, f".ShowBaseSize[{index}]", text)
        for index, node in enumerate(frame.xpath('.//*[contains(@class,"Comment") or contains(@class,"dsWeaponsGap")]'), 1):
            text = _normalize(node.text_content())
            if text:
                add("SOURCE_PRESENTATION_NOTE", owner + f":raw-note:{index}", text,
                    owner, document, node.getroottree().getpath(node),
                    {"text": text, "class": node.get("class")})

    mfm_document = relative(book / "sources/official-mfm-v1.5.json")
    for index, unit in enumerate(mfm["units"]):
        if unit["sourceGroup"] != "UNITS":
            continue
        owner = bindings["units"][str(index)]["ownerSourceId"]
        for schedule_index, schedule in enumerate(unit["pointSchedules"]):
            for row_index, points in enumerate(schedule["entries"]):
                add("POINTS_SCHEDULE_ROW", owner + f":mfm:points:{schedule_index}:{row_index}",
                    unit["title"] + " " + points["sourceLabel"], owner, mfm_document,
                    f"/units/{index}/pointSchedules/{schedule_index}/entries/{row_index}",
                    points, status="AUTHORITATIVE_CURRENT")
        for option_index, option in enumerate(unit.get("paidOptions", [])):
            add("PAID_WARGEAR_COST", owner + f":mfm:paid:{option_index}", option["title"],
                owner, mfm_document, f"/units/{index}/paidOptions/{option_index}",
                option, status="AUTHORITATIVE_CURRENT")
        for role, recipients in unit.get("relations", {}).items():
            for target_index, target in enumerate(recipients):
                add("ATTACHMENT_RELATION", owner + f":mfm:{role}:{target_index}",
                    unit["title"] + " → " + target, owner, mfm_document,
                    f"/units/{index}/relations/{role}/{target_index}",
                    {"role": role, "recipientSourceOwner": bindings["units"][str(index)]["relations"][role][target_index]},
                    status="AUTHORITATIVE_CURRENT")
    for index, detachment in enumerate(mfm["detachments"]):
        owner = bindings["detachments"][str(index)]["ownerSourceId"]
        add("DETACHMENT_ROSTER_METADATA", owner + ":mfm", detachment["title"], owner,
            mfm_document, f"/detachments/{index}",
            {key: value for key, value in detachment.items() if key != "enhancements"},
            status="AUTHORITATIVE_CURRENT")
        for enhancement_index, enhancement in enumerate(detachment["enhancements"]):
            matched_id = bindings["detachments"][str(index)]["enhancementSourceIds"][enhancement_index]
            add("ENHANCEMENT_COST_QUALIFIERS", matched_id + ":mfm", enhancement["title"],
                matched_id, mfm_document,
                f"/detachments/{index}/enhancements/{enhancement_index}", enhancement,
                status="AUTHORITATIVE_CURRENT")
    for filename in ("official-mfm-v1.5-khorne-berzerkers.json", "official-mfm-v1.5-rubric-marines.json"):
        dependency = _read_json(book / "sources" / filename)
        unit = dependency["unit"]
        source_key = bindings["alliedSourceIds"][filename]
        add("ALLIED_POINTS_DEPENDENCY", source_key, unit["title"],
            "army-rule-cult-of-the-dark-gods", relative(book / "sources" / filename),
            "/unit", unit, status="AUTHORITATIVE_CURRENT")

    # This is a book-owned source grammar extraction, not runtime rule inference.
    marks = _unique((item["rule"] for item in corpus["detachments"]
                     if item["rule"]["sourceId"] == bindings["marksSourceId"]), "Marks source owner")
    add("UPGRADE_DECLARATION", marks["sourceId"] + ":muster-selection", marks["title"],
        marks["sourceId"], hub, "Marks of Chaos / muster paragraph / Restrictions", marks["text"])
    choices = re.search(r"Army Roster: (.+?)\. Each time", marks["text"])
    if choices is None:
        raise ValueError("Enrolled muster choice list no longer has its source structure")
    for index, keyword in enumerate(re.split(r"[.,]\s*", choices.group(1)), 1):
        add("UPGRADE_OPTION", marks["sourceId"] + f":mark:{index}", keyword,
            marks["sourceId"], hub, "Marks of Chaos keyword list", keyword)

    official_faqs = {}
    for faq in official["faqs"]:
        if faq["sourceId"] in official_faqs:
            raise ValueError("Duplicate official FAQ occurrence binding")
        official_faqs[faq["sourceId"]] = faq
    seen_official = set()
    pdf = relative(book / "sources/chaos-space-marines-faction-pack-v1.2.pdf")
    for occurrence in corpus["errata"]:
        if occurrence["class"] == "FAQ" and int(occurrence["sourceId"].split("-")[1]) > 17:
            continue  # Appended general Core FAQ are not CSM factual owners.
        if occurrence["class"] == "ERRATA" and "Tank Shock" in occurrence["title"]:
            continue  # Appended general Core change is outside the CSM scope.
        faq = official_faqs.get(occurrence["sourceId"])
        if faq is not None:
            seen_official.add(faq["sourceId"])
            add("FAQ", occurrence["sourceId"], faq["question"], occurrence["sourceId"],
                pdf, f'PDF page {faq["page"]}; FAQ occurrence {faq["sourceId"]}',
                {"officialQuestion": faq["question"], "officialAnswer": faq["answer"]},
                status="AUTHORITATIVE_CURRENT", SUPPORTING_OCCURRENCES=[{
                    "SOURCE_DOCUMENT": hub, "SOURCE_LOCATION": occurrence["sourceId"] + " FAQ wrapper",
                    "PROVENANCE_STATUS": "ACCEPTED_SECONDARY", "PAYLOAD": occurrence}])
        else:
            add(occurrence["class"], occurrence["sourceId"], occurrence["title"],
                occurrence["sourceId"], hub, occurrence["sourceId"] + " FAQ/errata wrapper", occurrence)
    if seen_official != set(official_faqs):
        raise ValueError("Official FAQ binding does not resolve to an enrolled CSM occurrence")
    for update in official["updates"]:
        add("OFFICIAL_UPDATE", update["sourceEntityId"], update["sourceHeading"],
            update["sourceOwnerSelector"], pdf,
            f'PDF page {update["sourcePage"]} {update["sourceColumn"]}; '
            f'normalized column span {update["sourceSpan"]}; block {update["sourceEntityId"]}',
            update, status="AUTHORITATIVE_CURRENT")

    identifiers = [row["SOURCE_ENTITY_ID"] for row in rows]
    if len(identifiers) != len(set(identifiers)):
        raise ValueError("Distinct source nodes collide during source census")
    return rows

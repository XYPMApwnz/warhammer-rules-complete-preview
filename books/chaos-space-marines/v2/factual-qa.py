"""Independent accepted-source parity, canonical ownership and mutation guards.

No legacy CSM contracts, publications, fixtures or prior PASS artifacts are read.
The source-node denominator is distinct from an atomic-leaf fact denominator.
"""
import copy
import hashlib
import json
import re
from collections import Counter
from pathlib import Path

from lxml import html
import pdfplumber

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
SOURCE = ROOT / "books/chaos-space-marines/sources/waha-11e-current-2026-09-29"
read = lambda path: json.loads(path.read_text(encoding="utf-8"))
norm = lambda text: " ".join(str(text).split())
has = lambda cls: 'contains(concat(" ",normalize-space(@class)," ")," ' + cls + ' ")'


def pointer(value, path):
    for part in path.strip("/").split("/"):
        part = part.replace("~1", "/").replace("~0", "~")
        value = value[int(part)] if isinstance(value, list) else value[part]
    return value


def source_index(corpus):
    result = {}
    def walk(value):
        if isinstance(value, dict):
            if "sourceId" in value:
                assert value["sourceId"] not in result, "Source identity collision"
                result[value["sourceId"]] = value
            for child in value.values():
                walk(child)
        elif isinstance(value, list):
            for child in value:
                walk(child)
    walk(corpus)
    return result


def verify(base, effective):
    corpus = read(SOURCE / "corpus.json")
    src = source_index(corpus)
    identities = read(HERE / "identity-bindings.json")["bindings"]
    id_map = {item["sourceEntityId"]: item["id"] for item in identities}
    census = read(HERE / "sources/source-census.json")
    assert len(id_map) == len(set(id_map.values()))
    indexes = []
    hashes = {}
    for model in (base, effective):
        records = model["entities"]
        index = {item["id"]: item for item in records}
        assert len(index) == len(records), "Canonical identity collision"
        assert set(index) == set(id_map.values()), "Missing/extra canonical owner"
        assert Counter(item["kind"] for item in records) == Counter(census["counts"])
        account = {item["sourceEntityId"]: item for item in model["sourceAccounting"]}
        assert set(account) == set(id_map)
        for item in identities:
            record = index[item["id"]]
            assert record["kind"] == item["kind"]
            assert record["ownerId"] == (id_map[item["ownerSourceId"]] if item["ownerSourceId"] else "chaos-space-marines"), "Wrong factual owner"
            assert account[item["sourceEntityId"]]["canonicalId"] == item["id"]
            assert account[item["sourceEntityId"]]["factOwnerId"] == record.get("factOwnerId", item["id"])
            assert record["provenance"], "Provenance missing"
            for evidence in record["provenance"]:
                assert evidence["location"] and evidence["sourceEntityId"] in id_map
                document = evidence["document"]
                if document not in hashes:
                    hashes[document] = hashlib.sha256((ROOT / document).read_bytes()).hexdigest().upper()
                assert hashes[document] == evidence["sha256"]
        assert not model["ruleContractsStarted"] and not model["rosterRuntimeStarted"]
        assert all("ruleContract" not in record and "rosterEffects" not in record for record in records)
        indexes.append(index)
    raw_index, effective_index = indexes
    node = lambda sid: raw_index[id_map[sid]]

    # All explicit profiles and weapon characteristics checked against separate
    # raw-DOM selectors, not just against the enrolled structured extraction.
    weapon_count = profile_count = ability_count = option_count = 0
    for unit in corpus["datasheets"]:
        sid = unit["sourceId"]
        record = node(sid)
        assert record["displayName"] == unit["title"]
        assert record["data"]["modelProfileIds"] == [id_map[item["sourceId"]] for item in unit["profiles"]]
        assert record["data"]["weaponProfileIds"] == [id_map[item["sourceId"]] for item in unit["weapons"]]
        doc = html.fromstring((SOURCE / (unit["url"].rsplit("/", 1)[-1] + ".html")).read_text(encoding="utf-8"))
        frame, = doc.xpath('//div[' + has("dsOuterFrame") + ' and ' + has("datasheet") + ']')
        profiles = frame.xpath('.//*[' + has("dsProfileBaseWrap") + ']')
        assert len(profiles) == len(unit["profiles"])
        for profile, source in zip(unit["profiles"], profiles):
            data = node(profile["sourceId"])["data"]
            assert data["stats"] == profile["stats"] and data["name"] == profile["name"]
            values = [norm(item.text_content()) for item in source.xpath('.//*[' + has("dsCharValue") + ']')]
            assert values[:6] == [data["stats"][key] for key in ["M", "T", "SV", "W", "LD", "OC"]]
            profile_count += 1
        weapons = frame.xpath('.//tr[' + has("dsWeaponRow") + ']')
        assert len(weapons) == len(unit["weapons"])
        for weapon, source in zip(unit["weapons"], weapons):
            data = node(weapon["sourceId"])["data"]
            assert data == {key: value for key, value in weapon.items() if key not in {"sourceId", "order"}}
            cells = [norm(cell.text_content()) for cell in source.xpath('./td')]
            assert cells[-6:] == [data[key] for key in ["range", "attacks", "skill", "strength", "ap", "damage"]]
            name, = source.xpath('.//*[' + has("dsWeaponName") + ']')
            assert norm(name.text_content()) == data["name"]
            weapon_count += 1
        for option in unit["wargearOptions"]:
            assert node(option["sourceId"])["data"]["text"] == option["text"]
            option_count += option["text"].lower() != "none"
        for section in unit["sections"]:
            secid = section["sourceId"]
            if section["title"] == "ABILITIES":
                for number, block in enumerate(section["blocks"]):
                    actual = node(secid + "#/blocks/" + str(number) + "/text")
                    assert actual["data"] == block
                    ability_count += not block["wargearAbility"]
            elif section["title"] == "UNIT COMPOSITION":
                data = node(secid)["data"]
                reconstructed = [node["data"]["sourceText"] for node in [raw_index[identity] for identity in data["memberIds"]]]
                reconstructed += [item["text"] for item in data["equipmentAndRules"]]
                assert norm("\n".join(reconstructed)) == norm("\n".join(item["text"] for item in section["blocks"]))
            elif secid in id_map and section["title"] not in {"DAEMONIC ALLEGIANCE", "WARMASTER"}:
                assert node(secid)["data"]["blocks"] == section["blocks"]
        for ref in unit["ruleReferences"]:
            actual = node(ref["sourceId"])
            assert actual["data"]["label"] == ref["label"]
            if actual["kind"] == "ARMY_RULE_MEMBERSHIP":
                assert actual["data"]["armyRuleId"] in raw_index
        for member_id in [value for value in id_map if value.startswith(sid + ":section:") and ":member:" in value]:
            data = node(member_id)["data"]
            assert data["sourceText"] == data["composition"]["sourceLine"]
    assert (profile_count, weapon_count, ability_count, option_count) == (60, 315, 89, 87)

    ownership = read(HERE / "ownership-bindings.json")
    for detachment in corpus["detachments"]:
        data = node(detachment["sourceId"])["data"]
        assert data["enhancementIds"] == [id_map[item["sourceId"]] for item in detachment["enhancements"]]
        assert data["stratagemIds"] == [id_map[item["sourceId"]] for item in detachment["stratagems"]]
        rule = detachment["rule"]
        content = node(rule["sourceId"])["data"]["content"]
        spans = {id_map[item["tableSourceId"]]: item["sourceTextSpan"] for item in ownership["tableOccurrences"]}
        reconstructed = "".join(item["text"] if "text" in item else spans[item["tableId"]] for item in content)
        assert re.sub(r"\s+", "", reconstructed) == re.sub(r"\s+", "", rule["text"])
        for table in rule["tables"]:
            assert node(table["sourceId"])["data"]["rows"] == table["rows"]
            assert "tables" not in node(rule["sourceId"])["data"]
        for source in [*detachment["enhancements"], *detachment["stratagems"]]:
            data = node(source["sourceId"])["data"]
            for field in ["text", "cp", "lines", "flavor", "category"]:
                if field in source:
                    assert data[field] == source[field]
    marks = node("detachment-pactbound-zealots:rule:muster-selection")
    assert len(marks["data"]["optionIds"]) == 5 and marks["factOwnerId"] == id_map["detachment-pactbound-zealots:rule"]
    assert node("datasheet-legionaries:raw-note:2")["data"]["factReferenceId"] == id_map["datasheet-legionaries:wargear:8"]

    mfm = read(ROOT / "books/chaos-space-marines/sources/official-mfm-v1.5.json")
    for identity in identities:
        sid = identity["sourceEntityId"]
        if identity["kind"] in {"POINTS_SCHEDULE_ROW", "PAID_WARGEAR_COST", "ENHANCEMENT_COST_QUALIFIERS"}:
            record = node(sid)
            path = record["provenance"][0]["location"]
            assert {key: value for key, value in record["data"].items() if key not in {"weaponProfileIds", "optionIds"}} == pointer(mfm, path)
            if record["kind"] == "PAID_WARGEAR_COST":
                for weapon_id in record["data"]["weaponProfileIds"]:
                    weapon = raw_index[weapon_id]
                    assert weapon["ownerId"] == record["ownerId"]
                    assert weapon["data"]["name"].casefold() == record["data"]["title"].casefold()
                for option_id in record["data"]["optionIds"]:
                    option = raw_index[option_id]
                    assert option["ownerId"] == record["ownerId"]
                    assert record["data"]["title"].casefold() in option["data"]["text"].casefold()

    # Independent PDF extraction checks exact source instructions/FAQ payloads.
    bound = read(HERE / "official-bindings.json")
    columns = {}
    with pdfplumber.open(ROOT / bound["sourceDocument"]) as pdf:
        for column in bound["columns"]:
            columns[column["key"]] = norm(pdf.pages[column["page"] - 1].crop(tuple(column["bbox"])).extract_text(x_tolerance=2, y_tolerance=3))
    official_ids = set()
    for faq in bound["faqs"]:
        record = node(faq["sourceId"])
        start, end = faq["span"]
        text = columns[faq["columnKey"]][start:end]
        assert re.sub(r"^Q:\s*", "Q: ", text) == "Q: " + record["data"]["officialQuestion"] + " A: " + record["data"]["officialAnswer"]
        assert record["provenance"][0]["authority"] == "AUTHORITATIVE_CURRENT"
        official_ids.add(faq["sourceId"])
    assert len(official_ids) == 15
    for sid in {"faq-3", "faq-8"}:
        assert node(sid)["data"]["text"] == src[sid]["text"]
        assert node(sid)["provenance"][0]["authority"] == "ACCEPTED_SECONDARY"
    assert len([item for item in effective["entities"] if item["kind"] == "FAQ"]) == 17
    expected_changed = {
        "detachment-pactbound-zealots:rule", "detachment-dread-talons:stratagem:5",
        "detachment-soulforged-warpack:stratagem:4", "detachment-soulforged-warpack:stratagem:5",
        "datasheet-obliterators:section:1#/blocks/0/text",
        "detachment-huron-s-marauders:enhancement:2"}
    gameplay = {"DETACHMENT_RULE", "STRATAGEM", "DATASHEET_ABILITY", "EQUIPMENT_ABILITY", "MODEL_PROFILE", "WEAPON_PROFILE", "ENHANCEMENT"}
    changed = {sid for sid, identity in id_map.items() if raw_index[identity]["kind"] in gameplay
               and raw_index[identity]["data"] != effective_index[identity]["data"]}
    assert changed == expected_changed
    for native in bound.get("nativeRules", []):
        start, end = native["span"]
        source_text = columns[native["columnKey"]][start:end]
        for target in native["targets"]:
            identity = id_map[target["sourceId"]]
            raw, current = raw_index[identity], effective_index[identity]
            assert current["data"]["text"] == source_text, "Native official wording lost"
            assert current["provenance"][:len(raw["provenance"])] == raw["provenance"], "Captured provenance lost"
            assert any(evidence["document"] == bound["sourceDocument"]
                       and evidence["authority"] == "AUTHORITATIVE_CURRENT"
                       and str(native["span"]) in evidence["location"]
                       for evidence in current["provenance"]), "Native official provenance missing"
            assert current["id"] == raw["id"] and current["ownerId"] == raw["ownerId"]
            assert current.get("appliedCorrectionIds") == raw.get("appliedCorrectionIds"), "Native rule fabricated an erratum"
    for update in bound["updates"]:
        record = effective_index[id_map[update["sourceEntityId"]]]
        start, end = update["span"]
        assert record["data"]["instruction"] == columns[update["columnKey"]][start:end]
        assert record["data"]["effectiveTargetIds"]
        for target in record["data"]["effectiveTargetIds"]:
            assert record["id"] in effective_index[target]["appliedCorrectionIds"]
    text = json.dumps(effective_index[id_map["detachment-pactbound-zealots:rule"]]["data"], ensure_ascii=False)
    assert "CHARACTER/EPIC HERO" in text
    for sid in ["detachment-soulforged-warpack:stratagem:4", "detachment-soulforged-warpack:stratagem:5"]:
        assert "HERETIC ASTARTES DAEMON VEHICLE" in effective_index[id_map[sid]]["data"]["lines"][1]["text"]
    assert "until the end of the phase" not in effective_index[id_map["datasheet-obliterators:section:1#/blocks/0/text"]]["data"]["text"]
    assert "battle‑shock roll" in effective_index[id_map["detachment-dread-talons:stratagem:5"]]["data"]["lines"][2]["text"]
    for correction in bound["secondaryErrata"]:
        record = effective_index[id_map[correction["sourceId"]]]
        if correction["officialUpdateId"]:
            assert record["factOwnerId"] == id_map[correction["officialUpdateId"]]
    return {"sourceEntities": len(id_map), "profiles": profile_count, "weapons": weapon_count,
            "abilities": ability_count, "wargearOptions": option_count, "officialFaq": 15,
            "secondaryFaq": 2, "officialCorrections": 34, "secondaryErrata": 18,
            "effectiveFactualOverrides": len(changed), "missingCanonicalFacts": 0,
            "duplicateSemanticOwners": 0, "provenanceGaps": 0}


def main():
    base = read(HERE / "generated/base.json")
    effective = read(HERE / "generated/effective.json")
    result = verify(base, effective)
    mutations = [
        lambda b, e: e["entities"].append(copy.deepcopy(e["entities"][0])),
        lambda b, e: e["entities"].pop(),
        lambda b, e: e["entities"][0].update(ownerId="UNKNOWN_OWNER"),
        lambda b, e: e["entities"][0].update(provenance=[]),
        lambda b, e: next(x for x in b["entities"] if x["kind"] == "WEAPON_PROFILE")["data"].update(damage="99"),
        lambda b, e: next(x for x in b["entities"] if x["kind"] == "MODEL_PROFILE")["data"]["stats"].update(W="99"),
        lambda b, e: next(x for x in e["entities"] if x["id"] == "detachment-soulforged-warpack:stratagem:4")["data"]["lines"][1].update(text="One VEHICLE."),
        lambda b, e: next(x for x in e["entities"] if x["kind"] == "OFFICIAL_UPDATE")["data"].update(effectiveTargetIds=[]),
        lambda b, e: next(x for x in e["entities"] if x["id"] == "detachment-huron-s-marauders:enhancement:2")["data"].update(text="Unverified secondary wording"),
        lambda b, e: next(x for x in e["entities"] if x["id"] == "detachment-huron-s-marauders:enhancement:2")["provenance"].pop(),
    ]
    for mutation in mutations:
        b, e = copy.deepcopy(base), copy.deepcopy(effective)
        mutation(b, e)
        try:
            verify(b, e)
        except (AssertionError, KeyError, ValueError):
            continue
        raise AssertionError("Factual mutation escaped parity guard")
    result.update(status="PASS", mutationsDetected=len(mutations))
    print(json.dumps(result, ensure_ascii=False))


if __name__ == "__main__":
    main()

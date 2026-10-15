"""Bounded independent raw-source oracle for the first twelve V2 rule owners."""
import copy
import hashlib
import json
import re
from pathlib import Path

import pdfplumber
from lxml import html

ROOT = Path(__file__).resolve().parents[3]
HERE = Path(__file__).resolve().parent
RAW = "books/tyranids/sources/waha-11e-current-2026-09-27/"
PDF_SHA = "B8AF0DF04063ACC6E935C8B8C29A2E722367B4B90BF5023E06F441E2B8DE8E6F"
UNIVERSAL_SHA = "E9368C75BF4C9040FA978E7F792080E71D140997DEF77182DD41E71959185A72"


def read(path):
    return json.loads(path.read_text(encoding="utf-8"))


def norm(value):
    value = value.translate(str.maketrans({"’": "'", "‘": "'", "“": '"', "”": '"',
                                         "‑": "-", "−": "-", "\ufffd": "."}))
    return re.sub(r"\s+", " ", value).strip()


def text(node):
    return norm("".join(node.itertext()))


def at(value, pointer):
    for key in pointer.strip("/").split("/"):
        value = value[int(key)] if isinstance(value, list) else value[key]
    return value


# Fixed independently reviewed source addresses, not the generated artifact's inventory.
# id, owner, raw title/ability, corpus pointer, owner scope, target binding, operation facts
ROWS = [
    ("datasheet-broodlord:section:1", "unit-broodlord", "Vicious Insight", "/datasheets/2/sections/0", "MODEL", "SOURCE_UNIT", [("GRANT_WEAPON_ABILITY", "DEVASTATING WOUNDS")]),
    ("datasheet-winged-tyranid-prime:section:1", "unit-winged-tyranid-prime", "Alpha Warrior", "/datasheets/50/sections/0", "MODEL", "SOURCE_UNIT", [("GRANT_WEAPON_ABILITY", "SUSTAINED HITS 1")]),
    ("datasheet-tyranid-prime-with-lash-whip:section:1", "unit-tyranid-prime-with-lash-whip", "Alpha Warrior", "/datasheets/41/sections/0", "MODEL", "SOURCE_UNIT", [("GRANT_WEAPON_ABILITY", "SUSTAINED HITS 1")]),
    ("datasheet-hyperadapted-raveners:section:1", "unit-hyperadapted-raveners", "Alpha Invader", "/datasheets/16/sections/0", "UNIT", "SOURCE_UNIT", [("GRANT_WEAPON_ABILITY", "SUSTAINED HITS 1")]),
    ("detachment-subterranean-assault:enhancement:4", "detachment-subterranean-assault", "Trygon Prime", "/detachments/0/enhancements/3", "MODEL", "SOURCE_MODEL", [("GRANT_MODEL_KEYWORD", "SYNAPSE"), ("MODIFY_STAT", "strength", "ADD", 1, "melee"), ("MODIFY_STAT", "WS", "ADD", -1, "melee")]),
    ("detachment-invasion-fleet:enhancement:4", "detachment-invasion-fleet", "Adaptive Biology", "/detachments/1/enhancements/3", "MODEL", "SOURCE_MODEL", [("GRANT_MODEL_ABILITY", "Feel No Pain", 5)]),
    ("detachment-assimilation-swarm:enhancement:4", "detachment-assimilation-swarm", "Parasitic Biomorphology", "/detachments/3/enhancements/3", "MODEL", "SOURCE_UNIT", [("MODIFY_STAT", "strength", "ADD", 1, "melee")]),
    ("detachment-crusher-stampede:enhancement:1", "detachment-crusher-stampede", "Ominous Presence", "/detachments/4/enhancements/0", "MODEL", "SOURCE_MODEL", [("MODIFY_STAT", "OC", "ADD", 3, None)]),
    ("detachment-unending-swarm:enhancement:1", "detachment-unending-swarm", "Relentless Hunger", "/detachments/6/enhancements/0", "MODEL", "SOURCE_UNIT_MODELS", [("MODIFY_STAT", "M", "ADD", 2, None)]),
    ("detachment-ambush-predators:enhancement:2", "detachment-ambush-predators", "Cryptophotaic Camouflage", "/detachments/7/enhancements/1", "UNIT", "SOURCE_UNIT", [("MODIFY_RULE_METRIC", "detectionRange", "ADD", -3, None)]),
    ("detachment-talons-of-the-norn-queen:enhancement:1", "detachment-talons-of-the-norn-queen", "Destabilising Predation", "/detachments/8/enhancements/0", "UNIT", "SOURCE_UNIT", [("GRANT_WEAPON_ABILITY", "ANTI-CHARACTER 2+", "ranged")]),
    ("detachment-talons-of-the-norn-queen:enhancement:2", "detachment-talons-of-the-norn-queen", "Synaptoprescience", "/detachments/8/enhancements/1", "UNIT", "SOURCE_UNIT_MODELS", [("MODIFY_STAT", "INSV", "SET", 4, None)]),
]


def signature(effect):
    op = effect["operation"]
    if op == "GRANT_WEAPON_ABILITY":
        return (op, effect["ability"], effect["weaponMode"]) if "weaponMode" in effect else (op, effect["ability"])
    if op == "GRANT_MODEL_KEYWORD":
        return (op, effect["keyword"])
    if op == "GRANT_MODEL_ABILITY":
        return (op, effect["ability"]["name"], effect["ability"]["value"])
    return (op, effect["field"], effect["mode"], effect["value"], effect.get("weaponMode"))


def source_oracle(enrollment, corpus):
    artifacts = {a["path"]: a for a in enrollment["artifacts"]}
    cache = {}
    oracle = {}
    for identity, owner, name, pointer, *_ in ROWS:
        occurrence = at(corpus, pointer)
        assert occurrence["sourceId"] == identity, (identity, "raw corpus identity")
        if identity.startswith("detachment"):
            document = RAW + "tyranids.html"
        else:
            document = RAW + corpus["datasheets"][int(pointer.split("/")[2])]["url"].rstrip("/").split("/")[-1] + ".html"
        if document not in cache:
            data = (ROOT / document).read_bytes()
            assert hashlib.sha256(data).hexdigest().upper() == artifacts[document]["sha256"]
            cache[document] = html.fromstring(data.decode("utf-8"))
        tree = cache[document]
        if identity.startswith("detachment"):
            headings = [e for e in tree.xpath('//ul[@class="EnhancementsPts"]')
                        if text(e).startswith(name)]
            assert len(headings) == 1, (identity, "exact raw enhancement occurrence")
            container = headings[0].getparent()
            owner_node = next(a for a in container.iterancestors()
                              if "clFl" in a.get("class", "").split())
            assert owner_node.xpath('.//h2')[0].get("id").lower() == owner.removeprefix("detachment-")
            paragraphs = container.xpath('./p[not(contains(@class,"ShowFluff"))]')
            raw_text = norm("\n".join(text(p) for p in paragraphs))
            corpus_text = norm(occurrence["text"])
        else:
            blocks = tree.xpath('//*[contains(concat(" ",normalize-space(@class)," ")," dsAbility ")]')
            matches = [e for e in blocks if text(e).startswith(name + ":")]
            assert len(matches) == 1, (identity, "raw datasheet ability occurrence")
            raw_text = text(matches[0])
            corpus_text = norm(occurrence["blocks"][0]["text"])
        assert raw_text == corpus_text, (identity, raw_text, corpus_text)
        oracle[identity] = {"text": raw_text, "document": document,
                            "sha256": artifacts[document]["sha256"], "pointer": pointer}
    return oracle, cache


def compare(artifact, facts, oracle):
    errors = []
    contracts = artifact.get("contracts", [])
    if sorted(c.get("ruleId", "") for c in contracts) != sorted(r[0] for r in ROWS):
        errors.append("missing/extra/duplicate contract identity")
    entities = {e["id"]: e for e in facts["entities"]}
    for identity, owner, name, pointer, subject, target, specs in ROWS:
        candidates = [c for c in contracts if c.get("ruleId") == identity]
        if len(candidates) != 1:
            continue
        contract, entity, expected = candidates[0], entities[identity], oracle[identity]
        if contract.get("ownerId") != owner or entity.get("parentId") != owner:
            errors.append(identity + ": owner")
        current_text = entity["data"].get("text") if identity.startswith("detachment") else entity["data"]["blocks"][0]["text"]
        if norm(current_text) != expected["text"]:
            errors.append(identity + ": canonical wording/value/condition")
        provenance = contract.get("currentness", {}).get("factualOwner", {})
        if (contract.get("sourceId") != "tyranids-waha-11e-2026-09-27"
                or entity["provenance"].get("sourceId") != contract.get("sourceId")
                or provenance != entity["provenance"]):
            errors.append(identity + ": canonical source binding")
        for key in ["document", "sha256", "pointer"]:
            if provenance.get(key) != expected[key] or entity["provenance"].get(key) != expected[key]:
                errors.append(identity + ": provenance " + key)
        if provenance.get("sourceEntityId") != identity:
            errors.append(identity + ": source identity")
        clause = contract["clauses"][0]
        if clause["roles"][0]["subject"] != subject or clause["roles"][1].get("binding") != target:
            errors.append(identity + ": physical scope")
        leading = identity in [ROWS[0][0], ROWS[1][0]]
        if any(c.get("predicate") == "LEADING" and c.get("arguments", {}).get("value") is True
               for c in clause["conditions"]) != leading:
            errors.append(identity + ": leading condition")
        effects = clause["rosterEffects"]
        actual_specs = [signature(e) for e in effects if not e["id"].endswith("/formed")]
        if actual_specs != specs:
            errors.append(identity + ": typed effect value/selector")
        # All raw text must remain represented; partial executable clauses require retained conditional text.
        rendered = " ".join(c["sourceText"] for c in contract["clauses"])
        if identity in [ROWS[5][0], ROWS[6][0]]:
            eligible, remaining = expected["text"].split("only. ", 1)
            if norm(remaining) not in norm(rendered) or not any(c["rosterClassification"] == "BATTLE_ONLY" for c in contract["clauses"]):
                errors.append(identity + ": lost battle clause")
        elif norm(clause["sourceText"]) != expected["text"]:
            errors.append(identity + ": contract wording")
        for effect in effects:
            if effect.get("provenance", {}).get("sourceEvidence") != entity["provenance"]:
                errors.append(identity + ": effect provenance")
            if leading and not any(c["predicate"].get("predicate") == "LEADING" for c in effect["conditions"]):
                errors.append(identity + ": effect leading condition")
    return errors


def main():
    enrollment = read(HERE / "sources/enrollment.json")
    corpus = read(ROOT / (RAW + "corpus.json"))
    enrolled = {a["path"]: a for a in enrollment["artifacts"]}
    for relative, expected in [("books/tyranids/v2/sources/tyranids-faction-pack-v1.3.pdf", PDF_SHA),
                               ("books/tyranids/v2/sources/universal-rules-updates-v1.1.pdf", UNIVERSAL_SHA)]:
        assert hashlib.sha256((ROOT / relative).read_bytes()).hexdigest().upper() == expected == enrolled[relative]["sha256"]
    assert hashlib.sha256((ROOT / (RAW + "corpus.json")).read_bytes()).hexdigest().upper() == enrolled[RAW + "corpus.json"]["sha256"]
    oracle, trees = source_oracle(enrollment, corpus)
    artifact = read(HERE / "generated/rule-contracts.json")
    facts = read(HERE / "generated/effective.json")
    assert not compare(artifact, facts, oracle), compare(artifact, facts, oracle)
    # Official column/ability crops are scoped to owner occurrences, avoiding unrelated PDF text.
    with pdfplumber.open(HERE / "sources/tyranids-faction-pack-v1.3.pdf") as pdf:
        for page, bbox, phrases in [
            (2, (40, 490, 300, 610), ["CRYPTOPHOTAIC CAMOUFLAGE UPGRADE", "VON RYAN'S LEAPERS unit only. This unit has -3\" detection range."]),
            (3, (40, 400, 300, 620), ["DESTABILISING PREDATION UPGRADE", "NORN EMISSARY unit only. This unit's ranged attacks have [ANTI-CHARACTER 2+].", "SYNAPTOPRESCIENCE UPGRADE", "NORN ASSIMILATOR unit only. This unit has 4+ InSv."]),
            (5, (340, 608, 590, 790), ["TRYGON PRIME", "Trygon model only. The bearer gains the Synapse keyword. Improve the Strength and Weapon Skill characteristics of melee weapons equipped by the bearer by 1."]),
            (9, (335, 145, 525, 188), ["Alpha Warrior: Weapons equipped by models in this model's unit have the [SUSTAINED HITS 1] ability"]),
            (13, (335, 145, 525, 192), ["Alpha Invader: Weapons equipped by models in this unit have the [SUSTAINED HITS 1] ability"]),
        ]:
            extracted = norm(pdf.pages[page - 1].crop(bbox).extract_text() or "").casefold()
            for phrase in phrases:
                assert norm(phrase).casefold() in extracted, (page, phrase, extracted)
        assert "shadow in the warp (ravener prime only)" in norm(pdf.pages[12].extract_text()).casefold()
    entities = {e["id"]: e for e in facts["entities"]}
    native = artifact["nativeReferenceSemantics"]
    expected_native = [("old-one-eye", 1), ("psychophage", 2)]
    assert set(native) == {f"datasheet-{owner}:rule-reference:{number}" for owner, number in expected_native}
    for owner, number in expected_native:
        identity = f"datasheet-{owner}:rule-reference:{number}"
        entity = entities[identity]
        document = entity["provenance"]["document"]
        raw = (ROOT / document).read_bytes()
        assert hashlib.sha256(raw).hexdigest().upper() == enrolled[document]["sha256"] == entity["provenance"]["sha256"]
        tree = html.fromstring(raw.decode("utf-8"))
        assert "Feel No Pain 5+" in text(tree.xpath('//td[@class="dsCoreArmyValue"]')[0])
        assert native[identity]["abilities"] == [{"name": "Feel No Pain", "value": 5}]
        assert native[identity]["scope"] == "MODEL"
        assert native[identity]["modelProfileIds"] == [f"datasheet-{owner}:profile:1"]
        assert native[identity]["compositionMemberIds"] == [f"datasheet-{owner}:section:2:member:1"]
        assert native[identity]["provenance"] == entity["provenance"]
    shadow = next(e for e in facts["entities"] if e.get("parentId") == "unit-hyperadapted-raveners"
                  and e["kind"] == "RULE_REFERENCE" and e["data"]["label"].startswith("Shadow"))
    tree = trees[RAW + "Hyperadapted-Raveners.html"]
    assert "Shadow In The Warp (Ravener Prime only)" in text(tree.xpath('//td[@class="dsCoreArmyValue"]')[1])
    assert shadow["data"]["recipient"]["modelProfileIds"] == ["datasheet-hyperadapted-raveners:profile:1"]
    assert shadow["data"]["recipient"]["compositionMemberIds"] == ["datasheet-hyperadapted-raveners:section:2:member:1"]
    assert shadow["id"] not in native
    mutations = []
    for name in ["missing", "wrong-owner", "wrong-value", "lost-condition", "duplicate", "lost-provenance", "canonical-wording", "canonical-owner"]:
        altered, canonical = copy.deepcopy(artifact), copy.deepcopy(facts)
        if name == "missing": altered["contracts"].pop()
        elif name == "wrong-owner": altered["contracts"][0]["ownerId"] = "unit-carnifexes"
        elif name == "wrong-value": altered["contracts"][7]["clauses"][0]["rosterEffects"][0]["value"] = 4
        elif name == "lost-condition": altered["contracts"][0]["clauses"][0]["conditions"] = []
        elif name == "duplicate": altered["contracts"].append(copy.deepcopy(altered["contracts"][0]))
        elif name == "lost-provenance": altered["contracts"][0]["currentness"]["factualOwner"].pop("pointer")
        elif name == "canonical-wording": next(e for e in canonical["entities"] if e["id"] == ROWS[0][0])["data"]["blocks"][0]["text"] = "Vicious Insight: All models always have it."
        elif name == "canonical-owner": next(e for e in canonical["entities"] if e["id"] == ROWS[0][0])["parentId"] = "unit-carnifexes"
        assert compare(altered, canonical, oracle), (name, "mutation escaped comparator")
        mutations.append(name)
    print(json.dumps({"status": "PASS", "sourceOwners": 12, "officialPages": [2, 3, 5, 9, 13],
                      "nativeFnp": 2, "primeShadow": "MODEL_ONLY", "mutations": mutations,
                      "sourceFilesChanged": 0}))


if __name__ == "__main__":
    main()

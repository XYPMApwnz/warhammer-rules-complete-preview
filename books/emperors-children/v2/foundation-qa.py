"""Independent, narrowly scoped checks for the Emperor's Children foundation.

Expected correction targets come from the official PDF and accepted source, not
from the builder's correction registry. Nothing is written by this check.
"""
from __future__ import annotations

import copy
import hashlib
import importlib.util
import json
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent
CURRENT_SHA = "18A192A36C22468368D957AAC3EB230A40C8F7BBFAEFA46372D8918422B0B49A"
HISTORICAL_SHA = "50F456E9F4A20889450093A9E6627AA1C1ED0AF66EFBC29C583C46D910295CA7"
MODEL_TARGETS = {
    "datasheet-chaos-terminators:profile:1": ("T", "6"),
    "datasheet-lord-kakophonist:profile:1": ("T", "6"),
    "datasheet-lucius-the-eternal:profile:1": ("T", "6"),
    "datasheet-infractors:profile:1": ("T", "5"),
    "datasheet-lord-exultant:profile:1": ("T", "5"),
    "datasheet-sorcerer:profile:1": ("T", "5"),
    "datasheet-tormentors:profile:1": ("T", "5"),
    "datasheet-noise-marines:profile:1": ("W", "3"),
}
WEAPON_TARGETS = {
    "datasheet-flawless-blades:weapon:1": {"strength": "5", "ap": "-1"},
    "datasheet-infractors:weapon:1": {"strength": "5", "ap": "-1"},
    "datasheet-lord-exultant:weapon:1": {"strength": "5", "ap": "-1"},
    "datasheet-sorcerer:weapon:3": {"strength": "5", "ap": "-1"},
    "datasheet-tormentors:weapon:1": {"strength": "5", "ap": "-1"},
    "datasheet-tormentors:weapon:2": {"strength": "5", "ap": "-1"},
    "datasheet-chaos-land-raider:weapon:1": {"strength": "5", "ap": "-1"},
    "datasheet-chaos-rhino:weapon:1": {"strength": "5", "ap": "-1"},
    "datasheet-chaos-terminators:weapon:1": {"strength": "5", "ap": "-1"},
    "datasheet-chaos-land-raider:weapon:2": {"strength": "5", "ap": "-1"},
    "datasheet-chaos-rhino:weapon:2": {"strength": "5", "ap": "-1"},
    "datasheet-chaos-terminators:weapon:2": {"strength": "5", "ap": "-1"},
    "datasheet-lord-exultant:weapon:5": {"strength": "5"},
    "datasheet-lord-kakophonist:weapon:2": {"strength": "5"},
    "datasheet-noise-marines:weapon:5": {"strength": "5"},
    "datasheet-tormentors:weapon:8": {"strength": "5"},
    "datasheet-infractors:weapon:4": {"strength": "5"},
}
FRANTIC = "When a friendly EMPEROR’S CHILDREN BATTLELINE unit is selected to make an advance/fall-back move, that unit’s BATTLELINE models’ attacks have [SUSTAINED HITS 1] until the end of the turn."
HOST_RESTRICTION = "This detachment has the HOST tag and cannot be taken with another HOST detachment."
VENGEFUL = {
    "WHEN": "Your opponent’s Shooting phase, when an enemy unit that targeted a friendly unengaged EMPEROR’S CHILDREN CHARACTER unit this phase has shot.",
    "TARGET": "That EMPEROR’S CHILDREN CHARACTER unit.",
    "EFFECT": 'Your unit can make a surge move of up to D6". If your unit is not your army’s Favoured Champions, you can re-roll the dice to determine the distance of that surge move.',
}
LORD_HOST = 'If this model is attached to an EMPEROR’S CHILDREN BATTLELINE unit during the Declare Battle Formations step, this model has the Infiltrators and Scouts 6" abilities.'
FAULTLESS = 'You can target this unit with the Heroic Intervention stratagem, regardless of any other uses of that stratagem this phase. If you do:\n- That use is -1 CP.\n- That use does not prevent any uses of that stratagem on other units this phase.'
ARMOUR = 'Until the attacking unit has finished making its attacks, each time an attack targets your unit, worsen the Armour Penetration characteristic of that attack by 1.'
CACOPHONIC = 'LORD KAKOPHONIST model only.\n▪ This model has Deep Strike.\n▪ This unit’s ranged attacks have [IGNORES COVER].'


class QAError(AssertionError):
    pass


def require(condition, message):
    if not condition:
        raise QAError(message)


def normalized(value):
    value = str(value).replace("’", "'").replace("‘", "'")
    value = value.replace("‑", "-").replace("–", "-")
    return re.sub(r"\s+", " ", value).strip()


def entities(document):
    value = document["entities"]
    return list(value.values()) if isinstance(value, dict) else value


def entity_id(entity):
    return entity.get("id", entity.get("sourceId"))


def index(document):
    rows = entities(document)
    ids = [entity_id(row) for row in rows]
    require(all(ids), "Every entity requires an ID")
    require(len(ids) == len(set(ids)), "Duplicate entity IDs")
    return dict(zip(ids, rows))


def source_objects(value):
    result = {}
    def walk(node):
        if isinstance(node, dict):
            if "sourceId" in node:
                require(node["sourceId"] not in result, "Duplicate accepted source ID")
                result[node["sourceId"]] = node
            for child in node.values():
                walk(child)
        elif isinstance(node, list):
            for child in node:
                walk(child)
    walk(value)
    return result


def read_expected(root=ROOT, pdf_path=None):
    """Read raw accepted corpus and fresh official PDF directly."""
    import pdfplumber
    sources = root.parent / "sources"
    corpus_path = sources / "waha-11e-current-2026-09-28/corpus.json"
    corpus = json.loads(corpus_path.read_text(encoding="utf-8"))
    historical = sources / "emperors-children-faction-pack-v1.2.pdf"
    require(hashlib.sha256(historical.read_bytes()).hexdigest().upper() == HISTORICAL_SHA,
            "Historical v1.2 bytes changed")
    candidates = [pathlib.Path(pdf_path)] if pdf_path else (root / "sources").glob("*.pdf")
    pdfs = [path for path in candidates
            if hashlib.sha256(path.read_bytes()).hexdigest().upper() == CURRENT_SHA]
    require(len(pdfs) == 1, "Exactly one enrolled v1.3 PDF with the pinned official SHA is required")
    with pdfplumber.open(pdfs[0]) as pdf:
        require(len(pdf.pages) == 10, "Official PDF page count")
        cover = normalized(pdf.pages[0].extract_text())
        require("VERSION 1.3" in cover and "30th September 2026" in cover,
                "Official version and effective date")
        cacophonic = pdf.pages[1].crop((53, 433, 296, 469)).extract_text()
        require(cacophonic == CACOPHONIC, "Exact official native-card Cacophonic Accompaniment body")
        focus = normalized(pdf.pages[2].crop((45, 237, 296, 369)).extract_text())
        require(normalized(FRANTIC) in focus and normalized(HOST_RESTRICTION) in focus,
                "Independent PDF Frantic Focus wording and restriction")
        surge = normalized(pdf.pages[8].crop((300, 215, 555, 315)).extract_text())
        for label, text in VENGEFUL.items():
            require(normalized(label + ": " + text) in surge, "Independent PDF Vengeful " + label)
        faultless = normalized(pdf.pages[8].crop((40, 461, 296, 535)).extract_text()).replace("▪", "-")
        require(normalized(FAULTLESS) in faultless, "Independent PDF complete Faultless Opportunist bullets")
        armour = normalized(pdf.pages[8].crop((40, 337, 296, 391)).extract_text())
        require(normalized(ARMOUR) in armour, "Independent PDF Armour of Abhorrence recipient")
        model_rows = [((303, 477, 554, 491), "T 6 Chaos Terminators, Lord Kakophanist, Lucius the Eternal"),
                      ((303, 490, 554, 504), "T 5 Infractors, Lord Exultant, Sorcerer, Tormentors"),
                      ((303, 503, 554, 516), "W 3 Noise Marines")]
        for box, text in model_rows:
            require(normalized(pdf.pages[8].crop(box).extract_text()) == normalized(text),
                    "Independent PDF model correction row")
        weapon_rows = [((303, 555, 554, 579), "Bolt Pistol", ["Flawless Blades", "Infractors", "Lord Exultant", "Sorcerer", "Tormentors"], True),
                       ((303, 579, 554, 603), "Boltgun", ["Tormentors"], True),
                       ((303, 603, 554, 628), "Combi-bolter", ["Chaos Land Raider", "Chaos Rhino", "Chaos Terminators"], True),
                       ((303, 628, 554, 652), "Combi-weapon", ["Chaos Land Raider", "Chaos Rhino", "Chaos Terminators"], True),
                       ((303, 652, 554, 674), "Close Combat", ["Lord Exultant", "Lord Kakophanist", "Noise Marines", "Tormentors"], False),
                       ((303, 674, 554, 686), "Duelling Sabre", ["Infractors"], False)]
        for box, name, units, ap in weapon_rows:
            text = normalized(pdf.pages[8].crop(box).extract_text())
            unit_column = normalized(pdf.pages[8].crop((414, box[1], box[2], box[3])).extract_text())
            require(name in text and "S 5" in text and all(unit in unit_column for unit in units),
                    "Independent PDF weapon correction row: " + name)
            require(("AP -1" in text) == ap, "Independent PDF AP correction: " + name)
        faq = normalized(pdf.pages[9].crop((40, 480, 300, 550)).extract_text())
        require("Daemonic Empowerment" in faq and "A: Yes." in faq,
                "Official answer to the accepted unanswered FAQ")
        heldrake = pdf.pages[9].crop((40, 215, 300, 254)).extract_text()
        require('▪ Profile: Change M to 12", Sv to \'3+\' and OC to \'0\'.' in heldrake
                and "▪ Keywords: Remove 'AIRCRAFT'." in heldrake,
                "Independent official Heldrake profile fields and keyword removal")
    raw = (sources / "waha-11e-current-2026-09-28/Noise-Marines.html").read_text(encoding="utf-8")
    require(raw.count('class="dsProfileWrap"') == 1 and "1 Disharmonist" in raw and "5 Noise Marines" in raw,
            "Noise Marine and Disharmonist use one raw-source profile")
    objects = source_objects(corpus)
    require(objects["datasheet-lord-exultant:section:4"]["blocks"][0]["text"] == LORD_HOST,
            "Full accepted Lord of the Host condition")
    return corpus, {"pdfPath": str(pdfs[0]), "sha256": CURRENT_SHA,
                    "corpusSha256": hashlib.sha256(corpus_path.read_bytes()).hexdigest().upper()}


def validate(result, corpus, official):
    base, effective = result["base"], result["effective"]
    b, e, original = index(base), index(effective), source_objects(corpus)
    require(set(b) == set(e), "Official overlay may not add/drop foundation entities")
    accounting = [row for row in base["sourceAccounting"]
                  if row.get("sourceEntityId") and row.get("entityId")]
    source_to_entity = {row["sourceEntityId"]: row["entityId"] for row in accounting}
    require(len(source_to_entity) == len(accounting), "Unique source-to-entity accounting")
    allowed_delta = set(MODEL_TARGETS) | set(WEAPON_TARGETS) | {
        "detachment-frenzied-host:rule", "detachment-slaaneshs-chosen:stratagem:6",
        "detachment-peerless-bladesmen:enhancement:1",
        "detachment-elegant-brutes:enhancement:1",
        "detachment-coterie-of-the-conceited:stratagem:6", "faq-3",
    }
    for sid in b:
        require(b[sid].get("parentId") == e[sid].get("parentId"), "Official correction cannot change physical owner " + sid)
        if b[sid]["data"] != e[sid]["data"]:
            require(sid in allowed_delta, "Unscoped official semantic delta " + sid)
        require(b[sid].get("kind") == e[sid].get("kind"), "Official correction cannot change entity kind " + sid)
    require(len(MODEL_TARGETS) == 8 and len(WEAPON_TARGETS) == 17, "Independent correction target cardinality")
    for sid in set(MODEL_TARGETS) | set(WEAPON_TARGETS):
        require(sid in original and sid in b and sid in e, "Missing correction target " + sid)
    # Verify every original field of every profile; unchanged damage, attacks,
    # range, save, wound and characteristic fields are equally significant.
    changed_models, changed_weapons = set(), set()
    for sid, source in original.items():
        if ":profile:" in sid:
            require(sid in b and sid in e, "Missing accepted model profile " + sid)
            unit_sid = sid.split(":profile:")[0]
            require(e[sid].get("parentId") == source_to_entity[unit_sid], "Wrong model profile owner " + sid)
            expected = copy.deepcopy(source["stats"])
            require(b[sid]["data"]["stats"] == expected, "Base profile changed " + sid)
            if sid in MODEL_TARGETS:
                field, value = MODEL_TARGETS[sid]
                expected[field] = value
            require(e[sid]["data"]["stats"] == expected, "Wrong effective model stats " + sid)
            if b[sid]["data"]["stats"] != e[sid]["data"]["stats"]:
                changed_models.add(sid)
            for key, value in source.items():
                if key not in {"sourceId", "stats"}:
                    require(b[sid]["data"].get(key) == value and e[sid]["data"].get(key) == value,
                            "Model profile non-stat field changed " + sid + ":" + key)
        elif ":weapon:" in sid:
            require(sid in b and sid in e, "Missing accepted weapon profile " + sid)
            unit_sid = sid.split(":weapon:")[0]
            require(e[sid].get("parentId") == source_to_entity[unit_sid], "Wrong weapon profile owner " + sid)
            for key, value in source.items():
                if key == "sourceId":
                    continue
                require(b[sid]["data"].get(key) == value, "Base weapon changed " + sid + ":" + key)
                expected = WEAPON_TARGETS.get(sid, {}).get(key, value)
                require(e[sid]["data"].get(key) == expected, "Wrong effective weapon " + sid + ":" + key)
            if any(b[sid]["data"].get(key) != e[sid]["data"].get(key) for key in source if key != "sourceId"):
                changed_weapons.add(sid)
    require(changed_models == set(MODEL_TARGETS), "Model delta differs from exact official eight")
    require(changed_weapons == set(WEAPON_TARGETS), "Weapon delta differs from exact official seventeen")
    for kind, expected in {"DATASHEET": 23, "DETACHMENT": 10, "ARMY_RULE": 2,
                           "ENHANCEMENT": 34, "STRATAGEM": 51}.items():
        require(sum(row.get("kind") == kind for row in entities(effective)) == expected,
                "Factual count for " + kind)
    require(normalized(e["detachment-frenzied-host:rule"]["data"]["text"]) ==
            normalized(FRANTIC + "\n" + HOST_RESTRICTION), "Full corrected Frantic Focus model qualifier")
    surge = e["detachment-slaaneshs-chosen:stratagem:6"]["data"]["lines"]
    require({line["label"]: normalized(line["text"]) for line in surge} ==
            {label: normalized(text) for label, text in VENGEFUL.items()}, "Full corrected Vengeful WHEN/TARGET/EFFECT")
    require(normalized(e["detachment-peerless-bladesmen:enhancement:1"]["data"]["text"]) == normalized(FAULTLESS),
            "Historical official Faultless replacement includes both operative bullets")
    armour = e["detachment-coterie-of-the-conceited:stratagem:6"]["data"]["lines"]
    require(normalized(next(line["text"] for line in armour if line["label"] == "EFFECT")) == normalized(ARMOUR),
            "Historical official Armour replacement targets the unit")
    require(e["faq-3"]["data"]["text"] == "Yes.", "Official FAQ answer replaces the accepted placeholder")
    require(e["detachment-elegant-brutes:enhancement:1"]["data"]["text"] == CACOPHONIC,
            "Cacophonic native-card model and unit bullets must both remain complete")
    proof = e["detachment-elegant-brutes:enhancement:1"].get("fieldProvenance", {}).get("text", {})
    require(proof.get("sha256") == CURRENT_SHA and proof.get("sourcePointer") ==
            "/detachments/9/enhancements/0/text" and proof.get("correctionId"),
            "Complete Cacophonic body has official source-field provenance")
    heldrake_id = source_to_entity["datasheet-heldrake"]
    require(heldrake_id == "unit-heldrake" and "AIRCRAFT" not in e[heldrake_id]["data"]["keywords"],
            "Exact Heldrake unit must retain official AIRCRAFT removal")
    for field, value in {"M": '12"', "SV": "3+", "OC": "0"}.items():
        profile = e["datasheet-heldrake:profile:1"]
        require(profile["data"]["stats"][field] == value, "Specific current Heldrake field " + field)
        proof = profile.get("fieldProvenance", {}).get("stats/" + field, {})
        require(proof.get("sha256") == CURRENT_SHA and proof.get("sourcePointer") ==
                "/datasheets/19/profiles/0/stats/" + field and proof.get("correctionId"),
                "Specific Heldrake profile-field official provenance " + field)
    proof = e[heldrake_id].get("fieldProvenance", {}).get("keywords", {})
    require(proof.get("sha256") == CURRENT_SHA and proof.get("sourcePointer") ==
            "/datasheets/19/keywords" and proof.get("correctionId"), "Heldrake keyword-removal official provenance")
    lord = e["datasheet-lord-exultant:section:4"]["data"]
    require(lord["blocks"][0]["text"] == LORD_HOST, "Lord Host raw condition must remain complete")
    bindings = lord.get("recipientBindings", [])
    require(bindings, "Lord Host must explicitly bind its recipient")
    if isinstance(bindings, dict):
        bindings = [bindings]
    for binding in bindings:
        require(binding.get("scope") == "COMPOSITION_MEMBER", "Lord Host is a model recipient")
        require(binding.get("sourceQualifier") == LORD_HOST and binding.get("executable") is False,
                "Lord Host retains its raw attachment condition without executable lowering")
        mids, pids = binding.get("compositionMemberIds", []), binding.get("modelProfileIds", [])
        require(len(mids) == 1 and pids == ["datasheet-lord-exultant:profile:1"], "Lord Host cannot grant bodyguard profiles")
        for mid in mids:
            require(mid in e and e[mid].get("kind") == "COMPOSITION_MEMBER", "Lord Host composition owner exists")
            require(e[mid]["data"].get("modelProfileId") == "datasheet-lord-exultant:profile:1",
                    "Lord Host recipient must be Lord Exultant")
    noise = [row for row in entities(effective) if row.get("kind") == "COMPOSITION_MEMBER"
             and row.get("data", {}).get("modelProfileId") == "datasheet-noise-marines:profile:1"]
    require(len(noise) == 2, "Both distinct Noise composition members require the common profile")
    names = " ".join(str(row["data"].get("name", "")) for row in noise)
    require("Disharmonist" in names and "Noise Marine" in names, "Noise Marine and Disharmonist physical ownership")
    require(e["datasheet-noise-marines:profile:1"]["data"]["stats"]["W"] == "3", "Both Noise members inherit W3")
    for row in entities(effective):
        if row.get("kind") == "COMPOSITION_MEMBER":
            pid = row["data"]["modelProfileId"]
            require(pid in e and e[pid]["kind"] == "MODEL_PROFILE", "Composition profile exists")
            require(row.get("parentId") == e[pid].get("parentId"), "Composition profile belongs to the physical unit")
            require(entity_id(row) in e[pid]["data"]["compositionMemberIds"], "Reciprocal shared-profile membership")
    # Source accounting belongs to each document, independent of rendering.
    require(base.get("sourceAccounting") and effective.get("sourceAccounting"), "Entity source accounting")
    require(base.get("sourceLeafAccounting") and effective.get("sourceLeafAccounting"), "Leaf source accounting")
    require(base["sourceAccounting"] == effective["sourceAccounting"], "Overlay preserves source occurrence accounting")
    require(base["sourceLeafAccounting"] == effective["sourceLeafAccounting"], "Overlay preserves source leaf accounting")
    leaf_pointers = [row["sourcePointer"] for row in base["sourceLeafAccounting"]]
    def scalar_pointers(value, pointer=""):
        if isinstance(value, dict):
            return [p for key, child in value.items() for p in scalar_pointers(child, pointer + "/" + key.replace("~", "~0").replace("/", "~1"))]
        if isinstance(value, list):
            return [p for i, child in enumerate(value) for p in scalar_pointers(child, pointer + "/" + str(i))]
        return [pointer]
    require(len(leaf_pointers) == len(set(leaf_pointers)) and set(leaf_pointers) == set(scalar_pointers(corpus)),
            "Every accepted scalar leaf has exactly one disposition")
    for row in base["sourceLeafAccounting"]:
        require(row.get("classification") and (not row.get("entityId") or row["entityId"] in b), "Valid source leaf disposition")
    repo = ROOT.parents[2]
    source_hashes = {}
    for row in entities(effective):
        proof = row.get("provenance", {})
        require(proof.get("sha256") and proof.get("document"), "Source byte provenance " + entity_id(row))
        path = proof["document"]
        if path not in source_hashes:
            source_hashes[path] = hashlib.sha256((repo / path).read_bytes()).hexdigest().upper()
        require(proof["sha256"].upper() == source_hashes[path], "Source SHA mismatch " + entity_id(row))
        if proof.get("authority") == "ACCEPTED_SECONDARY":
            require(proof.get("corpusSha256") == official["corpusSha256"], "Accepted corpus SHA provenance")
    for sid, fields in [(sid, ["stats/" + MODEL_TARGETS[sid][0]]) for sid in MODEL_TARGETS] + [(sid, list(values)) for sid, values in WEAPON_TARGETS.items()]:
        for field in fields:
            proof = e[sid].get("fieldProvenance", {}).get(field, {})
            require(proof.get("sha256") == CURRENT_SHA and proof.get("correctionId") and proof.get("sourcePointer"),
                    "Official field-level provenance " + sid + ":" + field)
    require(official["sha256"] == CURRENT_SHA, "Official source identity")
    require(effective.get("appliedOfficialUpdates"), "Official applied-update provenance")
    require(sum(row.get("group") == "V13_CHANGE" for row in effective["appliedOfficialUpdates"]) == 11,
            "Exactly eleven new official groups")
    require("factual-census" in result, "Factual census emitted")
    census = result["factual-census"]
    require(census["officialNewGroups"] == 11 and census["ruleContractsImplemented"] == 0
            and census["rosterRuntimeImplemented"] == 0 and census["contentCertified"] is False,
            "Foundation census does not claim later implementation or content certification")
    return {"status": "PASS", "modelProfilesChanged": len(changed_models),
            "weaponProfilesChanged": len(changed_weapons), "officialSha256": CURRENT_SHA}


def mutation_checks(result, corpus, official):
    """Prove the validator rejects omissions and materially incorrect grants."""
    mutations = []
    def run(name, change):
        altered = copy.deepcopy(result)
        change(altered)
        try:
            validate(altered, corpus, official)
        except QAError:
            mutations.append({"mutation": name, "rejected": True})
        else:
            raise QAError("Validator accepted mutation: " + name)
    def remove(document, sid):
        rows = document["entities"]
        if isinstance(rows, dict):
            key = next(key for key, row in rows.items() if entity_id(row) == sid)
            del rows[key]
        else:
            rows[:] = [row for row in rows if entity_id(row) != sid]
    run("missing model profile", lambda r: remove(r["effective"], "datasheet-lord-kakophonist:profile:1"))
    run("wrong model value", lambda r: index(r["effective"])["datasheet-noise-marines:profile:1"]["data"]["stats"].update(W="2"))
    run("wrong weapon value", lambda r: index(r["effective"])["datasheet-tormentors:weapon:2"]["data"].update(ap="0"))
    run("unexpected unchanged weapon field", lambda r: index(r["effective"])["datasheet-tormentors:weapon:2"]["data"].update(damage="2"))
    run("missing BATTLELINE model qualifier", lambda r: index(r["effective"])["detachment-frenzied-host:rule"]["data"].update(text=FRANTIC.replace("BATTLELINE models’", "models’") + "\n" + HOST_RESTRICTION))
    run("missing Cacophonic model bullet", lambda r: index(r["effective"])["detachment-elegant-brutes:enhancement:1"]["data"].update(text=CACOPHONIC.replace("\n▪ This model has Deep Strike.", "")))
    run("missing Cacophonic unit bullet", lambda r: index(r["effective"])["detachment-elegant-brutes:enhancement:1"]["data"].update(text=CACOPHONIC.replace("\n▪ This unit’s ranged attacks have [IGNORES COVER].", "")))
    run("Heldrake restores AIRCRAFT", lambda r: index(r["effective"])["unit-heldrake"]["data"]["keywords"].append("AIRCRAFT"))
    run("Heldrake keyword evidence omitted", lambda r: index(r["effective"])["unit-heldrake"].get("fieldProvenance", {}).pop("keywords", None))
    def wrong_noise_owner(r):
        row = next(row for row in entities(r["effective"]) if row.get("kind") == "COMPOSITION_MEMBER" and row["data"].get("modelProfileId") == "datasheet-noise-marines:profile:1")
        row["data"]["modelProfileId"] = "datasheet-tormentors:profile:1"
    run("wrong physical profile owner", wrong_noise_owner)
    run("wrong weapon owner", lambda r: index(r["effective"])["datasheet-tormentors:weapon:2"].update(parentId="qa-wrong-owner"))
    def duplicate(r):
        rows = r["effective"]["entities"]
        row = copy.deepcopy(index(r["effective"])["datasheet-noise-marines:profile:1"])
        if isinstance(rows, dict):
            rows["qa-duplicate"] = row
        else:
            rows.append(row)
    run("duplicate entity", duplicate)
    def wrong_lord(r):
        bindings = index(r["effective"])["datasheet-lord-exultant:section:4"]["data"]["recipientBindings"]
        binding = bindings if isinstance(bindings, dict) else bindings[0]
        binding["modelProfileIds"] = ["datasheet-tormentors:profile:1"]
    run("Lord Host grants bodyguard profile", wrong_lord)
    run("wrong source SHA", lambda r: index(r["effective"])["datasheet-noise-marines:profile:1"]["provenance"].update(sha256="0" * 64))
    run("missing official field provenance", lambda r: index(r["effective"])["datasheet-noise-marines:profile:1"].update(fieldProvenance={}))
    return mutations


def main():
    sys.path.insert(0, str(ROOT))
    spec = importlib.util.spec_from_file_location("ec_foundation_build", ROOT / "build.py")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    corpus, official = read_expected()
    result = module.build(root=ROOT.parents[2])
    report = validate(result, corpus, official)
    report["mutations"] = mutation_checks(result, corpus, official)
    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()

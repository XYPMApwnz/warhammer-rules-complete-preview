"""Frozen, network-free CSM factual foundation. No runtime or publication input.

Identity bindings are persistent book-owned declarations. Source labels never
choose canonical identities. Captured source occurrences are accounted for
separately from the canonical owners of their effective factual content.
"""
from __future__ import annotations

import argparse
import copy
import hashlib
import json
from collections import Counter, defaultdict
from pathlib import Path

from lxml import html

from source_nodes import collect_sources
from official_sources import read_official, apply_official_overrides
from model_sources import validate_model_bindings

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
BOOK = "chaos-space-marines"
read = lambda path: json.loads(path.read_text(encoding="utf-8"))


def serialized(value):
    return json.dumps(value, ensure_ascii=False, indent=2) + "\n"


def digest(value):
    return hashlib.sha256(value).hexdigest().upper()


def payload_digest(value):
    return digest(json.dumps(value, ensure_ascii=False, sort_keys=True).encode("utf-8"))


def unique_index(items, field):
    result = {}
    for item in items:
        key = item[field]
        if key in result:
            raise ValueError(f"Identity collision: {field}={key}")
        result[key] = item
    return result


def verify_sources(root, enrollment):
    artifacts = unique_index(enrollment["artifacts"], "path")
    for name, artifact in artifacts.items():
        path = root / name
        if not path.is_file() or digest(path.read_bytes()) != artifact["sha256"]:
            raise ValueError(f"Enrolled source hash mismatch: {name}")
    return artifacts


def canonicalize(rows, bindings, enrollment, ownership, model_bindings):
    source_index = unique_index(rows, "SOURCE_ENTITY_ID")
    registry = unique_index(bindings["bindings"], "sourceEntityId")
    unique_index(bindings["bindings"], "id")
    if set(source_index) != set(registry):
        raise ValueError("Source census and persistent canonical identity registry differ")
    by_parent = defaultdict(list)
    for binding in registry.values():
        if binding["ownerSourceId"]:
            if binding["ownerSourceId"] not in registry:
                raise ValueError("Unbound canonical owner: " + binding["sourceEntityId"])
            by_parent[binding["ownerSourceId"]].append(binding["sourceEntityId"])
    canonical_id = lambda source_id: registry[source_id]["id"]
    models = unique_index(model_bindings["datasheets"], "sourceId")
    table_bindings = defaultdict(list)
    for binding in ownership["tableOccurrences"]:
        table_bindings[binding["ownerSourceId"]].append(binding)
    notes = {entry["sourceEntityId"]: entry["factOwnerSourceId"]
             for entry in ownership["duplicateNotes"]}
    records = []
    accounting = []
    for source_id, row in source_index.items():
        binding = registry[source_id]
        kind = row["ENTITY_TYPE"]
        if kind != binding["kind"]:
            raise ValueError("Source kind changed: " + source_id)
        payload = copy.deepcopy(row["PAYLOAD"])
        data = payload if isinstance(payload, dict) else {"text": payload} if isinstance(payload, str) else {"blocks": payload}
        for key in ("sourceId", "class", "order", "normalizedContentFingerprint", "wahaPoints"):
            data.pop(key, None)
        children = by_parent[source_id]
        child_ids = lambda kinds: [canonical_id(child) for child in children
                                  if registry[child]["kind"] in kinds]
        fact_owner = canonical_id(source_id)
        if kind == "DATASHEET":
            data["childIds"] = child_ids(set(b["kind"] for b in registry.values()))
            data["modelProfileIds"] = child_ids({"MODEL_PROFILE"})
            data["weaponProfileIds"] = child_ids({"WEAPON_PROFILE"})
            data["modelGroups"] = [{"modelProfileId": canonical_id(profile["sourceId"]),
                                    "compositionMemberIds": [canonical_id(member) for member in profile["compositionMemberSourceIds"]]}
                                   for profile in models[source_id]["statProfiles"]]
        elif kind == "KEYWORD_MEMBERSHIP":
            keyword = next(value for value in models[row["SOURCE_OWNER"]]["keywordBindings"]
                           if value["sourceEntityId"] == source_id)
            data = copy.deepcopy(keyword)
        elif kind == "FACTION_KEYWORD":
            keyword = next(value for value in models[row["SOURCE_OWNER"]]["factionKeywordBindings"]
                           if value["sourceEntityId"] == source_id)
            data = copy.deepcopy(keyword)
        elif kind == "MODEL_BASE_METADATA":
            data["scopeBindings"] = [copy.deepcopy(value) for value in models[row["SOURCE_OWNER"]]["baseMetadataBindings"]
                                     if value["sourceEntityId"] == source_id]
        elif kind == "MODEL_PROFILE":
            data["characteristicScopeBindings"] = [copy.deepcopy(value) for value in models[row["SOURCE_OWNER"]]["characteristicScopeBindings"]
                                                   if source_id in value["modelProfileSourceIds"]]
        elif kind == "DETACHMENT":
            data = {"ruleIds": child_ids({"DETACHMENT_RULE"}),
                    "enhancementIds": child_ids({"ENHANCEMENT"}),
                    "stratagemIds": child_ids({"STRATAGEM"}),
                    "rosterMetadataIds": child_ids({"DETACHMENT_ROSTER_METADATA"})}
        elif kind == "DETACHMENT_RULE":
            data.pop("tables", None)
            content = []
            text = data.pop("text")
            # Explicit source occurrence bindings, never title/prose inference.
            for table in table_bindings[source_id]:
                span = table["sourceTextSpan"]
                if text.count(span) != 1:
                    raise ValueError("Structured table occurrence is not unique: " + source_id)
                before, text = text.split(span, 1)
                if before.strip():
                    content.append({"text": before.strip()})
                content.append({"tableId": canonical_id(table["tableSourceId"])})
            if text.strip():
                content.append({"text": text.strip()})
            data["content"] = content
        elif kind == "UNIT_COMPOSITION":
            members = [candidate for candidate in source_index.values()
                       if candidate["ENTITY_TYPE"] == "COMPOSITION_MEMBER"
                       and candidate["SOURCE_ENTITY_ID"].startswith(source_id + ":member:")]
            text_blocks = copy.deepcopy(data["blocks"])
            for member in members:
                line = member["PAYLOAD"]
                found = 0
                for block in text_blocks:
                    lines = block["text"].splitlines()
                    found += lines.count(line)
                    block["text"] = "\n".join(value for value in lines if value != line)
                if found != 1:
                    raise ValueError("Composition member occurrence missing/duplicated")
            data = {"memberIds": [canonical_id(member["SOURCE_ENTITY_ID"]) for member in members],
                    "equipmentAndRules": [block for block in text_blocks if block["text"].strip()]}
        elif kind == "COMPOSITION_MEMBER":
            owner = binding["ownerSourceId"]
            member = next(value for value in models[owner]["compositionMembers"] if value["sourceId"] == source_id)
            data = {"sourceText": payload, "composition": copy.deepcopy(member)}
        elif kind == "UPGRADE_DECLARATION":
            options = [candidate for candidate in registry if candidate.startswith(source_id + ":option:")]
            if options:
                data["blocks"] = data["blocks"][:1]
                data["optionIds"] = [canonical_id(option) for option in options]
            else:
                # Marks selection is a view of its one factual Detachment rule.
                data = {"selectionRuleId": canonical_id(binding["ownerSourceId"]),
                        "optionIds": [canonical_id(candidate) for candidate in ownership["marksOptionSourceIds"]]}
                fact_owner = data["selectionRuleId"]
        elif kind == "UPGRADE_OPTION" and ":mark:" in source_id:
            data = {"keyword": payload, "selectionRuleId": canonical_id(binding["ownerSourceId"])}
            fact_owner = data["selectionRuleId"]
        elif kind == "SPECIAL_DATASHEET_RULE":
            components = [candidate for candidate in registry if candidate.startswith(source_id + "#/blocks/")]
            if components:
                data = {"componentIds": [canonical_id(component) for component in components]}
        elif kind == "SOURCE_PRESENTATION_NOTE" and source_id in notes:
            fact_owner = canonical_id(notes[source_id])
            data = {"factReferenceId": fact_owner}
        elif kind == "ATTACHMENT_RELATION":
            data["recipientId"] = canonical_id(data.pop("recipientSourceOwner"))
        elif kind == "ENHANCEMENT":
            data["costRecordIds"] = child_ids({"ENHANCEMENT_COST_QUALIFIERS"})
        elif kind == "PAID_WARGEAR_COST":
            cost = next(value for value in ownership["paidOptionBindings"] if value["costSourceId"] == source_id)
            data["weaponProfileIds"] = [canonical_id(value) for value in cost["weaponProfileSourceIds"]]
            data["optionIds"] = [canonical_id(value) for value in cost["optionSourceIds"]]
        # Evidence is source-addressed, with byte hashes verified at every build.
        evidence = []
        occurrences = [row, *row.get("SUPPORTING_OCCURRENCES", [])]
        for occurrence in occurrences:
            document = occurrence["SOURCE_DOCUMENT"]
            if document not in enrollment:
                raise ValueError("Unenrolled factual source: " + document)
            evidence.append({"sourceEntityId": source_id, "document": document,
                             "location": occurrence["SOURCE_LOCATION"],
                             "sha256": enrollment[document]["sha256"],
                             "authority": occurrence["PROVENANCE_STATUS"]})
        record = {"id": canonical_id(source_id), "kind": kind,
                  "ownerId": canonical_id(binding["ownerSourceId"]) if binding["ownerSourceId"] else BOOK,
                  "displayName": row["DISPLAY_NAME"], "data": data, "provenance": evidence}
        if fact_owner != record["id"]:
            record["factOwnerId"] = fact_owner
        records.append(record)
        accounting.append({"sourceEntityId": source_id, "kind": kind, "canonicalId": record["id"],
                           "factOwnerId": fact_owner, "capturedPayloadSha256": payload_digest(payload),
                           "classification": "CANONICAL_FACT" if fact_owner == record["id"] else "SOURCE_OCCURRENCE_REFERENCE"})
    return records, accounting


def bind_corrections(records, accounting, official, corpus, identities):
    """Resolve exact source addresses to canonical owners, not source labels."""
    registry = {binding["sourceEntityId"]: binding["id"] for binding in identities["bindings"]}
    index = {record["id"]: record for record in records}
    addresses = {}
    def visit(value, path=""):
        if isinstance(value, dict):
            if "sourceId" in value:
                addresses[path] = value["sourceId"]
            for key, child in value.items():
                visit(child, path + "/" + key)
        elif isinstance(value, list):
            for number, child in enumerate(value):
                visit(child, path + "/" + str(number))
    visit(corpus)
    def targets(target):
        pointer = target["corpusPointer"]
        candidates = [(path, sid) for path, sid in addresses.items()
                      if pointer == path or pointer.startswith(path + "/")]
        path, source_id = max(candidates, key=lambda value: len(value[0]))
        remainder = pointer[len(path):]
        if source_id not in registry and remainder.startswith("/blocks/"):
            pieces = remainder.split("/")
            source_id += "#/blocks/" + pieces[2] + "/text"
        elif remainder.startswith("/keywords"):
            return [registry[sid] for sid in registry if sid.startswith(source_id + ":keywords:")]
        elif remainder.startswith("/ruleReferences"):
            return [registry[sid] for sid in registry if sid.startswith(source_id + ":rule-reference:")]
        elif remainder.startswith("/statline/"):
            profiles = [sid for sid in registry if sid.startswith(source_id + ":profile:")]
            if len(profiles) != 1:
                raise ValueError("Official statline update has ambiguous model scope")
            source_id = profiles[0]
        if source_id not in registry:
            raise ValueError("Official correction has no canonical target: " + pointer)
        return [registry[source_id]]
    applications = []
    for update in official["updates"]:
        correction = index[registry[update["sourceEntityId"]]]
        affected = sorted({identity for target in update["targets"] for identity in targets(target)})
        correction["data"] = {"instruction": update["sourceText"], "sourceHeading": update["sourceHeading"],
                              "status": update["status"], "effectiveTargetIds": affected}
        for identity in affected:
            index[identity].setdefault("appliedCorrectionIds", []).append(correction["id"])
            index[identity]["provenance"].extend(copy.deepcopy(correction["provenance"]))
        applications.append({"correctionId": correction["id"], "effectiveTargetIds": affected,
                             "status": update["status"]})
    for occurrence in official["secondaryErrata"]:
        correction = index[registry[occurrence["sourceId"]]]
        affected = sorted({identity for target in occurrence["targets"] for identity in targets(target)})
        correction["data"]["effectiveTargetIds"] = affected
        correction["data"]["status"] = occurrence["status"]
        if occurrence["officialUpdateId"]:
            owner = registry[occurrence["officialUpdateId"]]
            correction["factOwnerId"] = owner
            correction["data"]["sameCorrectionAs"] = owner
            for row in accounting:
                if row["canonicalId"] == correction["id"]:
                    row.update(factOwnerId=owner, classification="SOURCE_OCCURRENCE_REFERENCE")
        else:
            correction["data"]["officialEffectiveRulePage"] = occurrence["officialEffectiveRulePage"]
        for identity in affected:
            index[identity].setdefault("appliedCorrectionIds", []).append(correction["id"])
            index[identity]["provenance"].extend(copy.deepcopy(correction["provenance"]))
    # Native official wording is source precedence, not a newly invented erratum.
    # Retain the captured secondary evidence and append the actual native owner.
    for native in official.get("nativeRules", []):
        for target in native["targets"]:
            for identity in targets(target):
                index[identity]["provenance"].append({
                    "sourceEntityId": target["sourceId"],
                    "document": native["sourceDocument"],
                    "location": f"PDF page {native['sourcePage']} {native['sourceColumn']}; normalized column span {native['sourceSpan']}; native rule",
                    "sha256": official["sourceSha256"].upper(),
                    "authority": "AUTHORITATIVE_CURRENT"})
    return applications


def reference_metadata(root, here, records, identities, artifacts):
    binding = read(here / "presentation-bindings.json")
    registry = {item["sourceEntityId"]: item["id"] for item in identities["bindings"]}
    index = {record["id"]: record for record in records}
    documents = {}
    def document(name):
        if name not in artifacts:
            raise ValueError("Presentation binding has an unenrolled factual source")
        if name not in documents:
            documents[name] = html.fromstring((root / name).read_text(encoding="utf-8"))
        return documents[name]
    instructions = []
    for item in binding["instructionBindings"]:
        nodes = document(item["sourceDocument"]).xpath(item["selector"])
        if len(nodes) != 1:
            raise ValueError("Canonical instruction source selector ambiguous")
        text = " ".join(nodes[0].text_content().split())
        if digest(text.encode()).lower() != item["expectedTextSha256"]:
            raise ValueError("Canonical instruction source changed")
        instructions.append({"id": item["id"], "kind": item["kind"], "text": text,
                             "provenance": {"document": item["sourceDocument"], "location": item["selector"],
                                            "sha256": artifacts[item["sourceDocument"]]["sha256"]}})
    for group in binding["weaponProfileGroups"]:
        if any(index[registry[weapon]]["kind"] != "WEAPON_PROFILE" for weapon in group["weaponProfileSourceIds"]):
            raise ValueError("Canonical weapon group recipient is not a weapon profile")
        index[registry[group["ownerSourceId"]]]["data"].setdefault("weaponProfileGroups", []).append(
            {"id": group["id"], "instructionId": group["instructionId"],
             "weaponProfileIds": [registry[value] for value in group["weaponProfileSourceIds"]]})
    groups = unique_index(binding["weaponProfileGroups"], "id")
    seen = set()
    for occurrence in binding["instructionOccurrences"]:
        sid = occurrence["sourceEntityId"]
        if sid in seen or sid not in groups[occurrence["groupId"]]["weaponProfileSourceIds"]:
            raise ValueError("Duplicate/incorrect canonical weapon occurrence binding")
        seen.add(sid)
        tree = document(occurrence["sourceDocument"])
        row, = tree.xpath(occurrence["weaponRowSelector"])
        text = html.tostring(row, encoding="unicode")
        if digest(text.encode()).lower() != occurrence["expectedRowSha256"]:
            raise ValueError("Weapon source occurrence changed")
        fields = [" ".join(cell.text_content().split()) for cell in row.xpath("./td")][-6:]
        weapon = index[registry[sid]]["data"]
        if fields != [weapon[key] for key in ("range", "attacks", "skill", "strength", "ap", "damage")]:
            raise ValueError("Weapon source occurrence is bound to another canonical profile")
        marker, = tree.xpath(occurrence["markerSelector"])
        template, = tree.xpath(occurrence["templateSelector"])
        selector = marker.get("data-tooltip-content", "")
        target_id = selector.removeprefix("#")
        # The template is sometimes a child span inside the target wrapper.
        if template.get("id") != target_id and not template.xpath("ancestor::*[@id=$target]", target=target_id):
            raise ValueError("Canonical instruction marker target differs")
        instruction_text = " ".join(template.text_content().split())
        if digest(instruction_text.encode()).lower() != occurrence["expectedInstructionTextSha256"]:
            raise ValueError("Instruction occurrence does not share its canonical instruction")
    return {"instructions": instructions, "sourceBindings": binding}


def validate(records, accounting, census):
    index = unique_index(records, "id")
    occurrences = unique_index(accounting, "sourceEntityId")
    expected = {item["sourceEntityId"]: item["kind"] for item in census["entities"]}
    if {key: item["kind"] for key, item in occurrences.items()} != expected:
        raise ValueError("Frozen source census parity failure")
    if dict(Counter(item["kind"] for item in records)) != census["counts"]:
        raise ValueError("Unclassified/missing canonical record")
    for item in records:
        if item["ownerId"] != BOOK and item["ownerId"] not in index:
            raise ValueError("Canonical owner missing")
        if not item["provenance"] or any(not p.get("location") or not p.get("sha256") for p in item["provenance"]):
            raise ValueError("Provenance gap")
        if item.get("factOwnerId", item["id"]) not in index:
            raise ValueError("Semantic owner missing")
    return {"sourceEntities": len(occurrences), "sourceEntitiesBound": len(occurrences),
            "counts": dict(sorted(Counter(item["kind"] for item in records).items())),
            "missingCanonicalFacts": 0, "duplicateSemanticOwners": 0,
            "canonicalIdCollisions": 0, "provenanceGaps": 0, "unclassifiedCanonicalRecords": 0,
            "legacyFactualReads": 0, "legacyGeneratedDataAsAuthority": 0,
            "ruleContractsImplemented": 0, "rosterEffectsImplemented": 0,
            "newRuntimeCapabilitiesImplemented": 0}


def build(root=ROOT):
    root = Path(root)
    here = root / "books/chaos-space-marines/v2"
    enrollment = read(here / "sources/enrollment.json")
    artifacts = verify_sources(root, enrollment)
    identities = read(here / "identity-bindings.json")
    ownership = read(here / "ownership-bindings.json")
    models = read(here / "model-bindings.json")
    census = read(here / "sources/source-census.json")
    corpus = read(root / "books/chaos-space-marines/sources/waha-11e-current-2026-09-29/corpus.json")
    validate_model_bindings(root, models, corpus)
    official = read_official(root)
    rows = collect_sources(root, official)
    records, accounting = canonicalize(rows, identities, artifacts, ownership, models)
    references = reference_metadata(root, here, records, identities, artifacts)
    base = {"schema": "csm-v2-canonical/v1", "bookId": BOOK, "edition": "11E",
            "acceptedBaseHead": enrollment["acceptedBaseHead"],
            "sourceEnrollment": enrollment["artifacts"], "entities": records,
            "sourceAccounting": accounting, "referenceMetadata": references, "ruleContractsStarted": False,
            "rosterRuntimeStarted": False}
    # The source module applies only adjudicated fields from the enrolled PDF.
    corrected = apply_official_overrides(corpus, official)
    # Build effective rows without overwriting the immutable captured corpus.
    effective_rows = copy.deepcopy(rows)
    replacements = {}
    def visit(value):
        if isinstance(value, dict):
            if "sourceId" in value:
                replacements[value["sourceId"]] = value
            for child in value.values():
                visit(child)
        elif isinstance(value, list):
            for child in value:
                visit(child)
    visit(corrected)
    for row in effective_rows:
        sid = row["SOURCE_ENTITY_ID"]
        if row["ENTITY_TYPE"] in {"DETACHMENT_RULE", "STRATAGEM", "ENHANCEMENT"}:
            row["PAYLOAD"] = copy.deepcopy(replacements[sid])
        elif "#/blocks/" in sid:
            container, path = sid.split("#", 1)
            block_index = int(path.split("/")[2])
            row["PAYLOAD"] = copy.deepcopy(replacements[container]["blocks"][block_index])
    effective_records, effective_accounting = canonicalize(effective_rows, identities, artifacts, ownership, models)
    captured_hashes = {row["sourceEntityId"]: row["capturedPayloadSha256"] for row in accounting}
    for row in effective_accounting:
        row["effectivePayloadSha256"] = row["capturedPayloadSha256"]
        row["capturedPayloadSha256"] = captured_hashes[row["sourceEntityId"]]
    reference_metadata(root, here, effective_records, identities, artifacts)
    corrections = bind_corrections(effective_records, effective_accounting, official, corrected, identities)
    effective = {**copy.deepcopy(base), "schema": "csm-v2-effective/v1",
                 "entities": effective_records, "sourceAccounting": effective_accounting,
                 "correctionBindings": corrections}
    summary = validate(effective_records, effective_accounting, census)
    return {"base": base, "effective": effective, "factual-census": summary}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    outputs = build()
    for name, data in outputs.items():
        path = HERE / "generated" / (name + ".json")
        text = serialized(data)
        if args.check:
            if not path.is_file() or path.read_text(encoding="utf-8") != text:
                raise SystemExit("STALE factual output: " + str(path))
        else:
            path.parent.mkdir(exist_ok=True)
            path.write_text(text, encoding="utf-8")
    print(json.dumps(outputs["factual-census"], ensure_ascii=False))


if __name__ == "__main__":
    main()

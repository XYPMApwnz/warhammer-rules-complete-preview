"""Build an inactive Core candidate from the frozen corpus's own DOM scopes.

No production snapshot, identity registry, reader or glossary is written.
--with-corpus explicitly orchestrates the three source-only candidate outputs.
"""
from __future__ import annotations

import argparse
import base64
from copy import deepcopy
import hashlib
import json
from pathlib import Path
import re
import subprocess
from types import SimpleNamespace

from lxml import html

from build_waha_core_corpus import (ROOT, DEFAULT_SOURCE, source_outputs, json_bytes,
    has_class, sha256, normalize, text as corpus_text)
import import_wahapedia_11e as accepted_format

BASELINE = "7b15dc36425ac577b6928837ec9983409972e278"
CANDIDATE_FILE = "core-rules.candidate.v1.json"
HISTORICAL_BASELINE = ROOT / "books/core-rules/sources/core-importer-baselines/7b15dc36.v1.json"
HISTORICAL_BASELINE_SHA256 = "075D31795979CBE8FEB7AC999D013134A4FE09FC40DD4DBDDB0D8D97E83196C0"


def load_historical_baseline(file=HISTORICAL_BASELINE):
    """Authenticate the authored Git export, independently of the live Core."""
    raw = Path(file).read_bytes()
    if sha256(raw) != HISTORICAL_BASELINE_SHA256:
        raise ValueError("Historical Core baseline fixture integrity failure: " + str(file))
    result = json.loads(raw)
    if result.get("schema") != "core-importer-historical-source-baseline/v1" or result.get("baselineHead") != BASELINE:
        raise ValueError("Unknown historical Core baseline source")
    if len(result["view"]["records"]) != 371:
        raise ValueError("Historical Core baseline must retain all 371 accepted records")
    return result


def historical_artifact(name, baseline=None):
    source = (baseline or load_historical_baseline())["artifacts"][name]
    raw = base64.b64decode(source["base64"], validate=True)
    blob = hashlib.sha1(b"blob " + str(len(raw)).encode("ascii") + b"\0" + raw).hexdigest()
    if len(raw) != source["bytes"] or sha256(raw) != source["sha256"] or blob != source["gitBlob"]:
        raise ValueError("Historical Core artifact integrity failure: " + source["file"])
    return json.loads(raw)


def verify_baseline_inputs():
    """Verify the frozen source witness against Git, not the new live files."""
    historical = load_historical_baseline()
    paths = ["books/core-rules/content", "books/core-rules/sources/waha-core-2026-09-25",
             "books/shared/canonical-content-v2", "books/core-rules/tools/import_wahapedia_11e.py"]
    listing = subprocess.run(["git", "ls-tree", "-r", "-z", BASELINE, "--", *paths],
                             cwd=ROOT, check=True, capture_output=True).stdout
    result = []
    for row in listing.split(b"\0"):
        if not row:
            continue
        metadata, name = row.decode("utf-8").split("\t", 1)
        git_blob = metadata.split()[2]
        expected = subprocess.run(["git", "cat-file", "blob", git_blob], cwd=ROOT,
                                  check=True, capture_output=True).stdout
        result.append({"file": name, "gitBlob": git_blob, "sha256": sha256(expected)})
    if not result:
        raise ValueError("Missing accepted baseline input manifest")
    if result != historical["inputs"]:
        raise ValueError("Historical Core source witnesses do not match the accepted Git baseline")
    # This is a witness for the historical transition, not a pin on future HEAD
    # formatter code. The active producer still uses accepted_format above.
    formatter = next(item for item in result if item["file"] == "books/core-rules/tools/import_wahapedia_11e.py")
    historical_formatter = subprocess.run(
        ["git", "show", "913cfef538bc96b7f2d9b55e21995c631cabffeb:" + formatter["file"]],
        cwd=ROOT, check=True, capture_output=True).stdout
    if sha256(historical_formatter) != formatter["sha256"]:
        raise ValueError("Historical accepted Core formatter changed")
    return result


def baseline_view():
    """Keep the 7b source authority while the live catalog accepts a new Core."""
    return deepcopy(load_historical_baseline()["view"])


def raw_body(scope, heading):
    """Formatting only: ownership was already fixed by the corpus producer."""
    body = deepcopy(scope)
    owner = body[0]
    if heading.tag in ("h2", "h3"):
        owner.drop_tree()
    else:
        # Keep the owner card's body, while the existing formatter still removes
        # any independently embedded card. No new boundary rule lives here.
        owner.set("class", " ".join(name for name in (owner.get("class") or "").split()
                                      if name not in ("str11Wrap", "abWrap")))
        for name in owner.xpath('.//*[contains(concat(" ",normalize-space(@class)," ")," str11Name ")]'):
            name.drop_tree()
    for panel in list(body.xpath('.//*[contains(concat(" ",normalize-space(@class)," ")," faqErrataSpoiler ")]')):
        panel.drop_tree()
    for panel in list(body.xpath('.//*[contains(concat(" ",normalize-space(@class)," ")," faq ") or contains(concat(" ",normalize-space(@class)," ")," errata ")]')):
        panel.drop_tree()
    visual = []
    for node in body.iter():
        values = [match.group(1) for name in (node.get("class") or "").split()
                  if (match := re.fullmatch(r"cruD([1-6])", name))]
        if len(values) == 1:
            node.text = values[0] + (node.text or "")
            visual.append({"class": "cruD" + values[0], "value": values[0]})
    return accepted_format.clean_text(body), visual


def build_candidate(source_dir, corpus):
    declarations = json.loads((source_dir / "source-identities.v1.json").read_text("utf-8"))
    identities = json.loads((source_dir / "candidate-identities.v1.json").read_text("utf-8"))
    capture = json.loads((source_dir / "capture.json").read_text("utf-8"))
    baseline_inputs = verify_baseline_inputs()
    baseline = baseline_view()
    old = {record["id"]: record for record in baseline["records"]}
    units = {unit["id"]: unit for page in corpus["pages"]
             for field in ("numbered", "faqs", "errata", "universalRulesUpdates") for unit in page[field]}
    main = {}
    formatting = {}
    source_proofs = {}

    def locator(unit, occurrence=None):
        return {"snapshotDate": capture["captureDate"], "page": unit["page"], "url": unit["pageUrl"],
                "sourceUnitId": unit["id"], "anchor": occurrence.get("stableDomId") if occurrence else unit.get("stableDomId"),
                "sourceOrder": occurrence["sourceOrder"] if occurrence else unit["sourceOrder"],
                "sourceContentHash": occurrence["content"]["contentHash"] if occurrence else unit["contentHash"],
                "sourceUnitContentHash": unit["contentHash"],
                "hierarchy": occurrence["headingHierarchy"] if occurrence else []}

    # Core is visited first. Appendix owns additional explicit units, never a
    # tooltip replacement for an already admitted full Core owner.
    for page in corpus["pages"]:
        for unit in page["numbered"]:
            code = unit["code"]
            for occurrence in unit["occurrences"]:
                declared = identities.get("sourceNodes", {}).get(occurrence["stableDomId"])
                canonical = declared["id"] if declared and declared.get("code") == code else identities["rules"].get(code)
                if not canonical:
                    raise ValueError("Unbound candidate source owner: " + page["id"] + " " + code)
                if canonical in main:
                    continue
                scope = html.fromstring(occurrence["ownedHtml"])
                if corpus_text(scope) != occurrence["content"]["text"]:
                    raise ValueError("Corpus owned fragment text mismatch: " + unit["id"])
                rows = [[corpus_text(cell) for cell in row if cell.tag in ("td", "th")] for row in scope.xpath('.//tr')]
                if rows != occurrence["content"]["tables"]:
                    raise ValueError("Corpus owned fragment table mismatch: " + unit["id"])
                body, visual = raw_body(scope, SimpleNamespace(tag=occurrence["ownerHeading"]["tag"]))
                title = old.get(canonical, {}).get("title") or occurrence["title"]
                record = {"id": canonical, "recordType": "MAIN_RULE", "code": unit.get("sourceCode", code),
                          "title": title, "text": body, "sourceUnitIds": [unit["id"]],
                          "sourceLocators": [locator(unit, occurrence)], "origin": "CAPTURED_WAHAPEDIA"}
                if unit.get("sourceCode") and unit["sourceCode"] != code:
                    record["internalLocator"] = code
                    record["sourceCitation"] = unit["sourceCode"]
                    record["parentId"] = identities["rules"][unit["sourceCode"]]
                elif code.count(".") == 2 and code.rsplit(".", 1)[0] in identities["rules"]:
                    record["parentId"] = identities["rules"][code.rsplit(".", 1)[0]]
                record["subsections"] = deepcopy(occurrence["subsections"])
                if visual:
                    record["visibleSourceTokens"] = visual
                main[canonical] = record
                formatting[canonical] = {"code": code, "title": title, "text": body}
                source_proofs[canonical] = {
                    "text": normalize("".join(scope.itertext())),
                    "tables": [[normalize("".join(cell.itertext())) for cell in row if cell.tag in ("td", "th")]
                               for row in scope.xpath('.//tr')
                               if not any(has_class(parent, "faq") or has_class(parent, "errata") for parent in row.iterancestors())],
                    "tableGroups": [[[normalize("".join(cell.itertext())) for cell in row if cell.tag in ("td", "th")]
                                     for row in table.xpath('.//tr')] for table in scope.xpath('.//table')
                                     if not any(has_class(parent, "faq") or has_class(parent, "errata") for parent in table.iterancestors())]}

    # Reuse the accepted formatter's existing prose/table transforms, in memory.
    # Its old DOM scanner and output writer are never invoked.
    by_code = {}
    owners = {}
    for canonical, record in formatting.items():
        if record["code"] == "02.02.01" and record["text"].upper().startswith("WHAT ARE MODIFIERS?"):
            record["text"] = "WHAT ARE MODIFIERS?" + record["text"][len("WHAT ARE MODIFIERS?"):]
        key = record["code"] if sum(item["code"] == record["code"] for item in formatting.values()) == 1 else (record["code"], canonical)
        by_code[key] = record
        owners[id(record)] = canonical
    accepted_format.strip_embedded_records(by_code)
    accepted_format.normalize_record_structure(by_code)
    for record in by_code.values():
        canonical = owners.get(id(record))
        if canonical is None:
            raise ValueError("Accepted formatter invented an unbound candidate record: " + record["code"])
        main[canonical]["text"] = record["text"]
    canonical_main = deepcopy(main)
    raw_records = []
    for record in main.values():
        raw = deepcopy(record)
        location = raw["sourceLocators"][0]
        occurrence = next(item for item in units[location["sourceUnitId"]]["occurrences"]
                          if item["sourceOrder"] == location["sourceOrder"])
        raw["text"] = occurrence["content"]["text"]
        raw_records.append(raw)
    for field, record_type in (("faqs", "FAQ_CLARIFICATION"), ("errata", "ERRATA"),
                               ("universalRulesUpdates", "UNIVERSAL_RULE_UPDATE")):
        for declaration in declarations[field]:
            unit = units[declaration["sourceId"]]
            text = unit["content"]["text"]
            record = {"id": declaration["canonicalId"], "recordType": record_type,
                      "title": unit.get("title") or unit.get("label") or declaration.get("question", ""),
                      "text": text, "sourceUnitIds": [unit["id"]], "sourceLocators": [locator(unit)],
                      "origin": "CAPTURED_WAHAPEDIA"}
            if record_type == "FAQ_CLARIFICATION":
                question = next(row[1] for row in unit["content"]["tables"] if row[0] == "Q:")
                answer = next(row[1] for row in unit["content"]["tables"] if row[0] == "A:")
                record.update(title=question, question=question, answer=answer, text=answer)
            if unit.get("ownerCode"):
                record["code"] = unit["ownerCode"]
                record["parentId"] = identities["rules"][unit["ownerCode"]]
            raw_records.append(record)

    records = {record["id"]: deepcopy(record) for record in raw_records}
    records.update(canonical_main)
    old_corpus = historical_artifact("corpus")
    old_units = {unit["id"]: unit for page in old_corpus["pages"] for unit in page["numbered"]}
    comparable = lambda value: re.sub(r"[•\s]+", "", normalize(value)).lower()
    old_faqs = [unit for page in old_corpus["pages"] for unit in page["faqs"]]
    new_faqs = [unit for page in corpus["pages"] for unit in page["faqs"]]

    def without_faq_panels(value, faq_units):
        result = comparable(value)
        removed = False
        for faq in faq_units:
            payload = comparable(faq["content"]["text"])
            if payload in result:
                result = result.replace(payload, "")
                removed = True
        if removed:
            result = result.replace("faqshow", "")
        return result

    templates = {}
    accepted_format.normalize_record_structure(templates)
    for canonical, record in canonical_main.items():
        accepted = old.get(canonical)
        if not accepted:
            continue
        own = units[record["sourceUnitIds"][0]]
        own_text = next(item["content"]["text"] for item in own["occurrences"]
                        if item["sourceOrder"] == record["sourceLocators"][0]["sourceOrder"])
        old_text = accepted.get("semanticContent") or ""
        if record["text"] != old_text and comparable(record["text"]) in comparable(old_text) and comparable(old_text) in comparable(own_text):
            records[canonical]["text"] = old_text
            records[canonical]["representation"] = {"kind": "EXACT_BASELINE_SOURCE_RENDER",
                "baselineTextSha256": sha256(old_text), "completeBodyContainedInOwnSource": True}
        template = templates.get(record.get("internalLocator", record["code"]))
        if template and comparable(template["text"]) == comparable(old_text):
            unchanged = any(comparable(source_proofs[canonical]["text"]) in comparable(item["content"]["text"])
                            for source_id in accepted.get("sourceUnitIds", [])
                            for item in old_units.get(source_id, {}).get("occurrences", []))
            if unchanged:
                records[canonical]["text"] = old_text
                records[canonical]["representation"] = {"kind": "EXACT_ACCEPTED_PROSE_TEMPLATE",
                    "baselineTextSha256": sha256(old_text), "sourceFactsVerifiedUnchanged": True}
    for canonical, record in canonical_main.items():
        accepted = old.get(canonical)
        if not accepted or not accepted.get("content"):
            continue
        proof = source_proofs[canonical]
        previous = next((occurrence for source_id in accepted.get("sourceUnitIds", [])
                         for occurrence in old_units.get(source_id, {}).get("occurrences", [])
                         if without_faq_panels(proof["text"], new_faqs) in without_faq_panels(occurrence["content"]["text"], old_faqs)), None)
        if previous is None:
            continue
        own = units[record["sourceUnitIds"][0]]
        own_text = next(item["content"]["text"] for item in own["occurrences"]
                        if item["sourceOrder"] == record["sourceLocators"][0]["sourceOrder"])
        current_facts = without_faq_panels(own_text, new_faqs)
        if record["code"] == "19.04":
            current_facts = current_facts.replace("e.g.", "forexample")
        pieces = []
        table_blocks = []
        for block in accepted["content"]:
            kind = block["type"]
            if kind in ("comparison-table", "matrix"):
                table_blocks.append(block)
            elif kind in ("paragraph", "heading"):
                pieces.append(block["text"])
            elif kind in ("list", "see-also"):
                pieces.extend(block["items"])
            elif kind in ("procedure", "named-stages"):
                for stage in block.get("steps", block.get("stages", [])):
                    pieces.extend([stage["label"] + ": " + stage["text"], *stage.get("items", [])])
                    if stage.get("afterText"):
                        pieces.append(stage["afterText"])
        # Existing typed rendering introduces list punctuation, not words or
        # numerical values. Every non-table fact must still exist here today.
        def has_current_fact(piece):
            value = comparable(piece)
            if value in current_facts:
                return True
            value = value.rstrip(".").replace(":", "")
            return value in current_facts.replace(":", "")
        if not all(has_current_fact(piece) for piece in pieces):
            continue
        old_rows = [list(map(comparable, row)) for row in previous["content"]["tables"] if not row or row[0] not in ("Q:", "A:")]
        complete_groups = [[list(map(comparable, row)) for row in group] for group in proof["tableGroups"]]
        current_content = next(item["content"] for item in own["occurrences"]
                               if item["sourceOrder"] == record["sourceLocators"][0]["sourceOrder"])
        current_rows = [list(map(comparable, row)) for row in current_content["tables"]]
        valid_tables = True
        for block in table_blocks:
            groups = [group for group in complete_groups if any(old_rows[index:index + len(group)] == group
                      for index in range(len(old_rows) - len(group) + 1))]
            if not groups:
                valid_tables = False
                break
            def label(value):
                result = comparable(value)
                return result.replace("e.g.", "forexample").replace("forexample,", "forexample") if record["code"] == "19.04" else result
            for row in block["rows"]:
                if block["type"] == "matrix":
                    condition, result = comparable(row["condition"]), comparable(row["result"]).rstrip(".")
                    backed = any(len(current) >= 2 and "".join(current[:-1]) == condition and current[-1] == result for current in current_rows)
                else:
                    # Accepted cell wording is reused only with the complete,
                    # exact old source row still present in today's own grid.
                    backed = any(len(previous_row) == len(row["cells"]) + 1 and label(previous_row[0]) == label(row["label"])
                                 and previous_row in current_rows for previous_row in old_rows)
                if not backed:
                    valid_tables = False
                    break
            if not valid_tables:
                break
        if not valid_tables:
            continue
        cursor = 0
        for row in proof["tables"]:
            row = list(map(comparable, row))
            match = next((index for index in range(cursor, len(old_rows)) if old_rows[index] == row), None)
            if match is None:
                break
            cursor = match + 1
        else:
            visible = [entry["value"] for entry in record.get("visibleSourceTokens", [])]
            expected_faces = []
            for block in accepted["content"]:
                if block["type"] == "list":
                    expected_faces.extend(match.group(1) for item in block["items"]
                                          if (match := re.match(r"Unmodified ([1-6]):", item)))
                if block["type"] == "matrix":
                    expected_faces.extend(match.group(1) for row in block["rows"]
                                          if (match := re.match(r"([1-6])\+", row["result"])))
            if visible and visible != expected_faces:
                raise ValueError("Visible source dice facts differ from accepted typed representation: " + canonical)
            records[canonical]["text"] = accepted["semanticContent"]
            records[canonical]["content"] = deepcopy(accepted["content"])
            records[canonical]["representation"] = {"kind": "EXACT_ACCEPTED_TYPED_RENDER",
                "baselineTextSha256": sha256(accepted["semanticContent"]),
                "sourceFactsVerifiedUnchanged": True, "visibleDiceFaces": visible}
    support = baseline["identities"]["rules"]["24.34"]
    protected = set(baseline["protectedMain"]) | {support}
    for record in baseline["records"]:
        if record["recordType"] in ("CORE_CONCEPT", "UNIVERSAL_RULE_UPDATE") or (
            record["recordType"] in ("ERRATA", "FAQ_CLARIFICATION") and not record.get("sourceUnitIds")):
            protected.add(record["id"])
    for canonical in protected:
        record = deepcopy(old[canonical])
        record["text"] = record.get("semanticContent") or ""
        record["origin"] = "BASELINE_CONCEPT_UNCHANGED" if record["recordType"] == "CORE_CONCEPT" else "BASELINE_OFFICIAL_UNCHANGED"
        if canonical == support:
            record["origin"] = "BASELINE_PRESENTATION_EXCEPTION"
        record["sourceLocators"] = [{"snapshotDate": "2026-09-25", "sourceUnitId": source_id}
                                    for source_id in record.get("sourceUnitIds", [])]
        records[canonical] = record
    missing = sorted(set(old) - set(records))
    if missing:
        raise ValueError("Lost baseline canonical identities: " + ", ".join(missing))
    if len(records) != 385:
        raise ValueError("Unexpected candidate identity inventory: " + str(len(records)))
    return {"schema": "core-rules-candidate/v1", "status": "CANDIDATE_ONLY_NOT_ACTIVE",
            "baselineHead": BASELINE, "captureDate": capture["captureDate"],
            "baselineInputs": baseline_inputs,
            "corpusFingerprint": corpus["fingerprint"], "identityMapSha256": sha256((source_dir / "candidate-identities.v1.json").read_bytes()),
            "records": sorted(records.values(), key=lambda record: record["id"]),
            "rawRecords": sorted(raw_records, key=lambda record: record["id"]),
            "ownershipCorrections": [correction for correction in ownership_corrections(records, identities)],
            "protectedBaselineIds": sorted(protected)}


def ownership_corrections(records, identities):
    for source_code, destination_codes in (("12.07", ["12.08"]), ("19.01", ["24.22"]),
                                           ("20.03", ["20.04"]), ("21.01", ["21.02", "21.03"])):
        source_id = identities["rules"][source_code]
        destination_ids = [identities["rules"][code] for code in destination_codes]
        source_location = records[source_id]["sourceLocators"][0]
        section = source_location["hierarchy"][-1]
        destinations = []
        for identifier in destination_ids:
            location = records[identifier]["sourceLocators"][0]
            if location["hierarchy"][-1] != section or location["page"] != source_location["page"]:
                raise ValueError("Redistribution is not inside the same captured source section: " + identifier)
            destinations.append({"id": identifier, "sourceLocator": location})
        yield {"fromId": source_id, "toIds": destination_ids, "sectionAnchor": section["id"],
               "sectionTitle": section["title"], "fromSourceLocator": source_location,
               "destinations": destinations, "reason": "Captured source hierarchy assigns the preserved sentences to these listed owners"}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    mode = parser.add_mutually_exclusive_group(required=True)
    mode.add_argument("--write", action="store_true")
    mode.add_argument("--check", action="store_true")
    parser.add_argument("--out", type=Path)
    parser.add_argument("--source-dir", type=Path, default=DEFAULT_SOURCE)
    parser.add_argument("--with-corpus", action="store_true")
    args = parser.parse_args()
    source_dir = args.source_dir.resolve()
    output_dir = (args.out or source_dir).resolve()
    if output_dir.is_relative_to(ROOT) and output_dir != DEFAULT_SOURCE.resolve():
        raise SystemExit("Repository outputs are restricted to the new candidate source directory")
    corpus, outputs = source_outputs(source_dir)
    if not args.with_corpus:
        for name, expected in outputs.items():
            target = output_dir / name
            if not target.exists() or target.read_bytes() != expected:
                raise SystemExit("Missing/stale source candidate " + str(target) + "; run build_waha_core_corpus.py --write first")
        outputs = {}
    candidate = build_candidate(source_dir, corpus)
    outputs[CANDIDATE_FILE] = json_bytes(candidate)
    if args.write:
        output_dir.mkdir(parents=True, exist_ok=True)
    for name, expected in outputs.items():
        target = output_dir / name
        if args.check:
            if not target.exists() or target.read_bytes() != expected:
                raise SystemExit("Stale candidate " + str(target) + "; rebuild with build_core_candidate.py --write --with-corpus")
        else:
            target.write_bytes(expected)
    print(json.dumps({"status": "PASS", "candidateOnly": True, "records": len(candidate["records"]),
                      "rawRecords": len(candidate["rawRecords"]), "outputs": list(outputs)}))


if __name__ == "__main__":
    main()

"""Read accepted official CSM PDF occurrences through reviewed source bindings.

Bindings identify locations and owners; factual payloads are read afresh from
the enrolled PDF. Nothing here reads publication output, legacy contracts or
an earlier audit. Source typography is preserved after whitespace normalization.
"""

from __future__ import annotations

import copy
import hashlib
import json
import re
from pathlib import Path

import pdfplumber


def _sha(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def _value_sha(value) -> str:
    return _sha(json.dumps(value, sort_keys=True, ensure_ascii=False,
                           separators=(",", ":")))


def _normalized(text: str) -> str:
    return " ".join(text.split())


def _span(text: str, bound: dict, label: str) -> str:
    start, end = bound["span"]
    if not (isinstance(start, int) and isinstance(end, int)
            and 0 <= start < end <= len(text)):
        raise ValueError(f"Invalid official source span: {label}")
    fragment = text[start:end]
    if _sha(fragment) != bound["textSha256"]:
        raise ValueError(f"Official source span changed: {label}")
    return fragment


def _resolve(root, pointer: str):
    value = root
    ancestors = []
    if not pointer.startswith("/"):
        raise ValueError("Source pointer must be absolute")
    for token in pointer[1:].split("/"):
        if isinstance(value, dict) and value.get("sourceId"):
            ancestors.append(value["sourceId"])
        token = token.replace("~1", "/").replace("~0", "~")
        value = value[int(token)] if isinstance(value, list) else value[token]
    if isinstance(value, dict) and value.get("sourceId"):
        ancestors.append(value["sourceId"])
    return value, ancestors


def _validate_target(corpus: dict, target: dict):
    value, owners = _resolve(corpus, target["corpusPointer"])
    if target["sourceId"] not in owners:
        raise ValueError(f"Official target source owner changed: {target}")
    if _value_sha(value) != target["expectedInputSha256"]:
        raise ValueError(f"Official target input changed: {target['corpusPointer']}")
    return value


def read_official(root: Path) -> dict:
    """Read bound official edits, native rule fields and FAQ occurrences.

    ``root`` is the repository root. Returned edit dictionaries deliberately
    retain the collect_sources interface and also expose typed source targets
    and verified replacement payloads for canonical normalization.
    """
    root = Path(root)
    binding_path = root / "books/chaos-space-marines/v2/official-bindings.json"
    binding = json.loads(binding_path.read_text(encoding="utf-8"))
    pdf_path = root / binding["sourceDocument"]
    if hashlib.sha256(pdf_path.read_bytes()).hexdigest() != binding["sourceSha256"]:
        raise ValueError("The enrolled official CSM PDF hash changed")
    corpus = json.loads((root / binding["corpusDocument"]).read_text(encoding="utf-8"))
    columns = {}
    with pdfplumber.open(pdf_path) as pdf:
        for column in binding["columns"]:
            text = pdf.pages[column["page"] - 1].crop(tuple(column["bbox"])).extract_text(
                x_tolerance=2, y_tolerance=3)
            text = _normalized(text or "")
            if _sha(text) != column["textSha256"]:
                raise ValueError(f"Official PDF column changed: {column['key']}")
            columns[column["key"]] = (text, column)

    updates = []
    native_rules = []
    seen_spans = set()
    for bound in [*binding["updates"], *binding.get("nativeRules", [])]:
        text, column = columns[bound["columnKey"]]
        identity = (bound["columnKey"], *bound["span"])
        if identity in seen_spans:
            raise ValueError("Official edit source span has multiple semantic owners")
        seen_spans.add(identity)
        raw = _span(text, bound, bound["sourceEntityId"])
        for target in bound["targets"]:
            _validate_target(corpus, target)
        replacements = []
        for patch in bound.get("patches", []):
            start, end = patch["replacementSpan"]
            if not (0 <= start < end <= len(raw)):
                raise ValueError("Invalid replacement source span")
            replacement = raw[start:end]
            if _sha(replacement) != patch["replacementSha256"]:
                raise ValueError("Replacement is no longer supported by official source")
            target = bound["targets"][patch["targetIndex"]]
            current = _validate_target(corpus, target)
            if not isinstance(current, str):
                raise ValueError("Text correction is bound to a non-text fact")
            if patch["mode"] == "replace_fragment":
                if current.count(patch["expectedFragment"]) != 1:
                    raise ValueError("Official replacement fragment is absent or ambiguous")
            elif patch["mode"] != "replace_value":
                raise ValueError("Unsupported official text correction operation")
            replacements.append({**patch, "replacement": replacement})
        record = {
            "sourceEntityId": bound["sourceEntityId"],
            "sourceHeading": bound["sourceHeading"],
            "sourceOwnerSelector": bound["sourceOwnerSelector"],
            "sourcePage": column["page"], "sourceColumn": column["column"],
            "sourceLedgerPointer": bound.get("sourceLedgerPointer"),
            "sourceDocument": binding["sourceDocument"],
            "sourceText": raw, "sourceSpan": bound["span"],
            "sourceTextSha256": bound["textSha256"],
            "status": bound["status"], "targets": copy.deepcopy(bound["targets"]),
            "patches": replacements,
        }
        (native_rules if bound.get("nativeRule") else updates).append(record)

    faqs = []
    for bound in binding["faqs"]:
        text, column = columns[bound["columnKey"]]
        raw = _span(text, bound, bound["sourceId"])
        if not re.match(r"^Q:\s*", raw) or raw.count("A:") != 1:
            raise ValueError("Official FAQ no longer has its enrolled question/answer structure")
        question, answer = raw.split("A:", 1)
        faqs.append({
            "sourceId": bound["sourceId"], "question": re.sub(r"^Q:\s*", "", question).strip(),
            "answer": answer.strip(), "page": column["page"], "column": column["column"],
            "officialOrder": bound["officialOrder"], "sourceSpan": bound["span"],
            "sourceDocument": binding["sourceDocument"], "sourceTextSha256": bound["textSha256"],
        })
    for family, key in ((updates, "sourceEntityId"), (native_rules, "sourceEntityId"), (faqs, "sourceId")):
        if len({item[key] for item in family}) != len(family):
            raise ValueError("Official source occurrence identity collision")
    secondary = copy.deepcopy(binding["secondaryErrata"])
    for occurrence in secondary:
        for target in occurrence["targets"]:
            _validate_target(corpus, target)
    return {"updates": updates, "nativeRules": native_rules, "faqs": faqs, "secondaryErrata": secondary,
            "sourceDocument": binding["sourceDocument"], "sourceSha256": binding["sourceSha256"]}


def apply_official_overrides(corpus: dict, official: dict) -> dict:
    """Deep-copy source extraction and apply only explicitly bound official edits.

    The caller retains immutable raw input. A changed source owner or value
    fails closed instead of permitting a title, prose or position fallback.
    """
    replacements = [*official["updates"], *official.get("nativeRules", [])]
    for update in replacements:
        for target in update["targets"]:
            _validate_target(corpus, target)
    effective = copy.deepcopy(corpus)
    touched = set()
    for update in replacements:
        for patch in update["patches"]:
            target = update["targets"][patch["targetIndex"]]
            pointer = target["corpusPointer"]
            if pointer in touched:
                raise ValueError("Multiple uncomposed official replacements target one factual field")
            touched.add(pointer)
            current, _ = _resolve(effective, pointer)
            if patch["mode"] == "replace_fragment":
                current = current.replace(patch["expectedFragment"], patch["replacement"])
            else:
                current = patch["replacement"]
            parent_pointer, key = pointer.rsplit("/", 1)
            parent, _ = _resolve(effective, parent_pointer)
            parent[int(key) if isinstance(parent, list) else key] = current
    return effective

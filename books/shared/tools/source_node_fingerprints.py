"""Parser-independent evidence for explicitly enrolled native source nodes.

Only hashes are persisted. Full source-byte integrity and semantic data guards
remain with each native producer; these helpers neither choose identities nor
interpret rules.
"""
from __future__ import annotations

import hashlib
import json
from pathlib import Path
import re

SCHEMA = "native-source-node-fingerprints/v1"
NODE_FIELDS = {"sourceEntityId", "document", "pointer", "legacySerializerSha256", "fingerprintSha256"}
QA_SCHEMA = "source-node-qa-fingerprints/v1"
QA_FIELDS = {"id", "sourceDocument", "selector", "parserInput", "legacySerializerSha256", "fingerprintSha256"}
QA_GROUPS = {"roster-source-review", "roster-named-recipient", "static-gameplay", "reference"}


def _norm(value):
    return " ".join((value or "").split())


def _digest(value):
    return hashlib.sha256(json.dumps(value, ensure_ascii=False,
                                    separators=(",", ":")).encode("utf-8")).hexdigest().upper()


def fingerprint(node):
    """Match the cross-parser census: complete rows or ordered structural tokens."""
    if node.tag == "tr":
        value = ["row", [_norm("".join(cell.itertext())) for cell in node.xpath("./td|./th")]]
    else:
        tokens = []

        def visit(element):
            if isinstance(element.tag, str):
                tokens.append(["open", element.tag,
                               sorted(set(element.get("class", "").split()))])
                tokens.append(["text", _norm(element.text)])
                for child in element:
                    visit(child)
                tokens.append(["close", element.tag])
            else:
                tokens.append(["comment", _norm(element.text)])
            tokens.append(["tail", _norm(element.tail)])

        visit(node)
        value = ["tree", tokens]
    return _digest(value)


def row_text_fingerprint(row):
    """Preserve the existing CSM complete-cell payload and lowercase hash."""
    if row.tag != "tr" or not row.xpath("./th|./td"):
        raise ValueError("Weapon source occurrence is not a table row")
    cells = [" ".join(str(cell.text_content()).split()) for cell in row.xpath("./th|./td")]
    return _digest({"schema": "html-row-cell-text/v1", "cells": cells}).lower()


def load_native_expectations(here, addresses):
    """Require an exact sidecar join to every unchanged native source binding."""
    here = Path(here)
    document = json.loads((here / "source-node-fingerprints.json").read_text(encoding="utf-8"))
    if (not isinstance(document, dict) or set(document) != {"schema", "bookId", "nodes"}
            or document["schema"] != SCHEMA or document["bookId"] != here.parent.name
            or not isinstance(document["nodes"], list) or not isinstance(addresses, list)):
        raise ValueError("Unsupported native source-node fingerprint schema/book")
    by_source = {}
    for address in addresses:
        if not isinstance(address, dict) or not all(key in address for key in
                ("sourceEntityId", "document", "pointer", "rawNodeSha256")):
            raise ValueError("Incomplete native source-node address")
        sid = address["sourceEntityId"]
        if not isinstance(sid, str) or sid in by_source:
            raise ValueError("Duplicate/invalid native source-node address")
        by_source[sid] = address
    expected = {}
    for node in document["nodes"]:
        if not isinstance(node, dict) or set(node) != NODE_FIELDS:
            raise ValueError("Incomplete native source-node fingerprint fields")
        sid = node["sourceEntityId"]
        if not isinstance(sid, str) or sid in expected or sid not in by_source:
            raise ValueError("Duplicate/extra native source-node fingerprint")
        address = by_source[sid]
        if (node["document"] != address["document"] or node["pointer"] != address["pointer"]
                or node["legacySerializerSha256"] != address["rawNodeSha256"]):
            raise ValueError("Native source-node fingerprint address/legacy evidence changed")
        for key in ("legacySerializerSha256", "fingerprintSha256"):
            if not isinstance(node[key], str) or not re.fullmatch(r"[0-9A-F]{64}", node[key]):
                raise ValueError("Invalid native source-node fingerprint hash")
        expected[sid] = node
    if set(expected) != set(by_source):
        raise ValueError("Missing native source-node fingerprint")
    return expected


def load_qa_expectations(here, contexts, *, group):
    """Join QA-only portable pins to their unchanged authored locator evidence."""
    here = Path(here)
    document = json.loads((here / "source-node-qa-fingerprints.json").read_text(encoding="utf-8"))
    if (not isinstance(document, dict) or set(document) != {"schema", "bookId", "groups"}
            or document["schema"] != QA_SCHEMA or document["bookId"] != here.parent.name
            or not isinstance(document["groups"], dict) or group not in QA_GROUPS
            or group not in document["groups"] or not isinstance(contexts, list)):
        raise ValueError("Unsupported source-node QA fingerprint schema/book/group")
    indexed_groups = {}
    for name, records in document["groups"].items():
        if name not in QA_GROUPS or not isinstance(records, list):
            raise ValueError("Invalid source-node QA fingerprint group")
        indexed = {}
        for record in records:
            if not isinstance(record, dict) or set(record) != QA_FIELDS:
                raise ValueError("Incomplete source-node QA fingerprint fields")
            if (any(not isinstance(record[key], str) or not record[key] for key in QA_FIELDS)
                    or record["id"] in indexed
                    or record["parserInput"] not in {"bytes", "unicode"}
                    or not re.fullmatch(r"[0-9a-fA-F]{64}", record["legacySerializerSha256"])
                    or not re.fullmatch(r"[0-9A-F]{64}", record["fingerprintSha256"])):
                raise ValueError("Invalid/duplicate source-node QA fingerprint")
            indexed[record["id"]] = record
        indexed_groups[name] = indexed
    expected = indexed_groups[group]
    seen = set()
    for context in contexts:
        if (not isinstance(context, dict) or set(context) != QA_FIELDS - {"fingerprintSha256"}
                or any(not isinstance(context[key], str) or not context[key] for key in context)
                or context["id"] in seen or context["id"] not in expected):
            raise ValueError("Duplicate/extra source-node QA fingerprint context")
        record = expected[context["id"]]
        if any(record[key] != context[key] for key in context):
            raise ValueError("Source-node QA locator/legacy evidence changed")
        seen.add(context["id"])
    if seen != set(expected):
        raise ValueError("Missing source-node QA fingerprint context")
    return expected

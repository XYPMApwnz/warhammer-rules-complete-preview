"""Measure native SM-family DOM pins without emitting accepted source contents."""
from __future__ import annotations

import argparse
import csv
import hashlib
import json
from pathlib import Path
import re
import subprocess
import sys

from lxml import etree, html

BOOKS = ("space-marines", "blood-angels", "dark-angels")
ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "books/shared/tools"))
from source_node_fingerprints import fingerprint as candidate_fingerprint, load_native_expectations, load_qa_expectations

FIELDS = ("book", "canonicalId", "sourceEntityId", "kind", "document", "selector",
          "nodeTag", "expectedSerializerSha256", "actualSerializerSha256",
          "serializerMatches", "candidateFingerprintSha256", "guardType", "guardId",
          "parserInput", "activeScheme", "expectedActiveFingerprintSha256",
          "actualActiveFingerprintSha256", "activeFingerprintMatches")


class CensusError(Exception):
    """Only a fixed error code and an approved book identifier may be printed."""

    def __init__(self, code, book=None):
        self.code, self.book = code, book
        super().__init__(code)


def digest(raw):
    return hashlib.sha256(raw).hexdigest().upper()


def read_json(path):
    return json.loads(path.read_text(encoding="utf-8"))


def source_path(root, name):
    if (not isinstance(name, str) or not name.startswith("books/")
            or not re.fullmatch(r"[A-Za-z0-9_./-]+", name)):
        raise CensusError("INVALID_SOURCE_PATH")
    relative = Path(name)
    if relative.is_absolute() or ".." in relative.parts:
        raise CensusError("INVALID_SOURCE_PATH")
    path = (root / relative).resolve()
    if not path.is_relative_to(root.resolve()):
        raise CensusError("INVALID_SOURCE_PATH")
    return path


def versions():
    return {"python": list(sys.version_info[:3]), "lxml": list(etree.LXML_VERSION),
            "libxml": list(etree.LIBXML_VERSION)}


def checkout_source_sha(source):
    """Read local Git identity without importing or executing checkout code."""
    def git(*args):
        result = subprocess.run(["git", "-C", str(source), "rev-parse", *args],
                                stdout=subprocess.PIPE, stderr=subprocess.DEVNULL,
                                text=True, encoding="utf-8", errors="replace", check=False)
        if result.returncode:
            raise CensusError("SOURCE_CHECKOUT_IDENTITY_FAILED")
        return result.stdout.strip()

    top = git("--show-toplevel")
    if not top or Path(top).resolve() != source.resolve():
        raise CensusError("SOURCE_CHECKOUT_ROOT_MISMATCH")
    sha = git("--verify", "HEAD^{commit}")
    if not re.fullmatch(r"[0-9a-fA-F]{40}", sha):
        raise CensusError("SOURCE_CHECKOUT_IDENTITY_FAILED")
    return sha.lower()


def verify_sources(root, book):
    """Keep native whole-file SHA/byte checks, including BA's reviewed artifacts."""
    here = root / "books" / book / "v2"
    enrollment = read_json(here / "sources/enrollment.json")
    groups = [("enrollment", enrollment["artifacts"])]
    if book == "blood-angels":
        groups.append(("reviewedArtifacts", read_json(here / "source-review.json")["reviewedArtifacts"]))
    verified = []
    for group, artifacts in groups:
        for artifact in artifacts:
            raw = source_path(root, artifact["path"]).read_bytes()
            actual = digest(raw)
            if actual != artifact["sha256"].upper() or len(raw) != artifact["bytes"]:
                raise CensusError("SOURCE_INTEGRITY_MISMATCH", book)
            verified.append({"book": book, "group": group, "path": artifact["path"],
                             "expectedSha256": artifact["sha256"].upper(),
                             "actualSha256": actual, "bytes": len(raw)})
    return verified, {artifact["path"] for artifact in enrollment["artifacts"]}


def collect_qa(root, here, book, enrolled):
    path = here / "source-node-qa-fingerprints.json"
    if not path.exists():
        return []
    document = read_json(path)
    if not isinstance(document, dict) or not isinstance(document.get("groups"), dict):
        raise CensusError("INVALID_ACTIVE_QA_FINGERPRINTS", book)
    rows, trees = [], {}
    for group, records in document["groups"].items():
        try:
            contexts = [{key: record[key] for key in
                         ("id", "sourceDocument", "selector", "legacySerializerSha256", "parserInput")}
                        for record in records]
            expected = load_qa_expectations(here, contexts, group=group)
        except (ValueError, KeyError, TypeError):
            raise CensusError("INVALID_ACTIVE_QA_FINGERPRINTS", book) from None
        for identifier, record in expected.items():
            if not re.fullmatch(r"[A-Za-z0-9_./:#\[\]-]+", identifier):
                raise CensusError("INVALID_QA_IDENTIFIER", book)
            name, selector, mode = record["sourceDocument"], record["selector"], record["parserInput"]
            source_path(root, name)
            if name not in enrolled:
                raise CensusError("UNENROLLED_QA_SOURCE", book)
            if not re.fullmatch(r"(?:/[a-z][a-z0-9]*(?:\[\d+\])?)+", selector):
                raise CensusError("INVALID_QA_SELECTOR", book)
            key = (name, mode)
            if key not in trees:
                file = source_path(root, name)
                trees[key] = html.fromstring(file.read_bytes() if mode == "bytes" else file.read_text(encoding="utf-8"))
            selected = trees[key].xpath(selector)
            if len(selected) != 1:
                raise CensusError("NON_UNIQUE_QA_SELECTOR", book)
            node = selected[0]
            actual = candidate_fingerprint(node)
            rows.append({"book": book, "canonicalId": "", "sourceEntityId": identifier,
                         "kind": "QA_SOURCE_PIN", "document": name, "selector": selector,
                         "nodeTag": node.tag, "expectedSerializerSha256": record["legacySerializerSha256"],
                         "actualSerializerSha256": "", "serializerMatches": "",
                         "candidateFingerprintSha256": actual, "guardType": "qa", "guardId": identifier,
                         "parserInput": mode, "activeScheme": "portable",
                         "expectedActiveFingerprintSha256": record["fingerprintSha256"],
                         "actualActiveFingerprintSha256": actual,
                         "activeFingerprintMatches": actual == record["fingerprintSha256"]})
    return rows


def collect(root):
    rows, books, sources = [], [], []
    enrolled_by_book = {}
    # Authenticate every enrolled file before parsing any accepted HTML.
    for book in BOOKS:
        verified, enrolled = verify_sources(root, book)
        sources.extend(verified)
        enrolled_by_book[book] = enrolled
    for book in BOOKS:
        enrolled = enrolled_by_book[book]
        here = root / "books" / book / "v2"
        bindings = read_json(here / "source-bindings.json")["recordAddresses"]
        identities = read_json(here / "identity-bindings.json")["bindings"]
        by_source = {row["sourceEntityId"]: row["id"] for row in identities}
        source_ids = [row["sourceEntityId"] for row in bindings]
        keys = [row["key"] for row in bindings]
        if (len(by_source) != len(identities) or len(set(source_ids)) != len(bindings)
                or len(set(keys)) != len(bindings) or set(source_ids) != set(by_source)):
            raise CensusError("INCOMPLETE_OR_DUPLICATE_BINDINGS", book)
        portable = None
        if (here / "source-node-fingerprints.json").exists():
            try:
                portable = load_native_expectations(here, bindings)
            except (ValueError, KeyError, TypeError):
                raise CensusError("INVALID_ACTIVE_NATIVE_FINGERPRINTS", book) from None
        documents, book_rows = {}, []
        for binding in bindings:
            sid, document, selector = (binding["sourceEntityId"], binding["document"], binding["pointer"])
            source_path(root, document)
            kind, canonical = binding["kind"], by_source[sid]
            if any(not isinstance(value, str) or not re.fullmatch(r"[A-Za-z0-9_.:-]+", value)
                   for value in (sid, kind, canonical)):
                raise CensusError("INVALID_BINDING_IDENTIFIER", book)
            if not isinstance(selector, str) or not re.fullmatch(r"(?:/[a-z][a-z0-9]*(?:\[\d+\])?)+", selector):
                raise CensusError("INVALID_BINDING_SELECTOR", book)
            if document not in enrolled or binding["key"] != document + "#" + selector + "::" + kind:
                raise CensusError("UNENROLLED_BINDING_SOURCE", book)
            if document not in documents:
                # Match native load_tree: UTF-8 decoded text, not byte-parser encoding inference.
                documents[document] = html.fromstring(source_path(root, document).read_text(encoding="utf-8"))
            selected = documents[document].xpath(selector)
            if len(selected) != 1:
                raise CensusError("NON_UNIQUE_SELECTOR", book)
            node = selected[0]
            actual = digest(html.tostring(node, encoding="utf-8"))
            expected = binding["rawNodeSha256"].upper()
            if not re.fullmatch(r"[0-9A-F]{64}", expected):
                raise CensusError("INVALID_EXPECTED_HASH", book)
            candidate = candidate_fingerprint(node)
            active_expected = portable[sid]["fingerprintSha256"] if portable is not None else expected
            active_actual = candidate if portable is not None else actual
            row = {"book": book, "canonicalId": canonical, "sourceEntityId": sid, "kind": kind,
                   "document": document, "selector": selector, "nodeTag": node.tag,
                   "expectedSerializerSha256": expected, "actualSerializerSha256": actual,
                   "serializerMatches": actual == expected, "candidateFingerprintSha256": candidate,
                   "guardType": "native", "guardId": sid, "parserInput": "unicode",
                   "activeScheme": "portable" if portable is not None else "legacy-serializer",
                   "expectedActiveFingerprintSha256": active_expected,
                   "actualActiveFingerprintSha256": active_actual,
                   "activeFingerprintMatches": active_actual == active_expected}
            book_rows.append(row)
        rows.extend(book_rows)
        qa_rows = collect_qa(root, here, book, enrolled)
        rows.extend(qa_rows)
        books.append({"book": book, "bindings": len(bindings),
                      "serializerMatches": sum(row["serializerMatches"] for row in book_rows),
                      "serializerDifferences": sum(not row["serializerMatches"] for row in book_rows),
                      "rowNodes": sum(row["nodeTag"] == "tr" for row in book_rows),
                      "nonRowNodes": sum(row["nodeTag"] != "tr" for row in book_rows),
                      "activeScheme": "portable" if portable is not None else "legacy-serializer",
                      "nativeActiveDifferences": sum(not row["activeFingerprintMatches"] for row in book_rows),
                      "qaBindings": len(qa_rows),
                      "qaActiveDifferences": sum(not row["activeFingerprintMatches"] for row in qa_rows)})
    return {"schema": "native-parser-dom-census/v2", "status": "FAIL" if any(
        book["nativeActiveDifferences"] or book["qaActiveDifferences"] for book in books) else "PASS",
        "versions": versions(),
        "totalBindings": sum(book["bindings"] for book in books),
        "qaBindings": sum(book["qaBindings"] for book in books),
        "activeFingerprintDifferences": sum(not row["activeFingerprintMatches"] for row in rows),
        "serializerDifferences": sum(
            book["serializerDifferences"] for book in books), "books": books,
        "sources": sources}, rows


def write_results(out, result, rows):
    (out / "RESULTS.json").write_text(json.dumps(result, ensure_ascii=True, indent=2) + "\n", encoding="utf-8")
    with (out / "INVENTORY.csv").open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=FIELDS)
        writer.writeheader()
        writer.writerows(rows)


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source", type=Path, default=ROOT,
                        help="Checkout to inspect as data; no target checkout code is executed")
    parser.add_argument("--out", required=True, type=Path)
    args = parser.parse_args(argv)
    out = args.out.resolve()
    source = args.source.resolve()
    if out.is_relative_to(ROOT) or out.is_relative_to(source) or out.exists():
        print(json.dumps({"status": "FAIL", "code": "OUTPUT_MUST_BE_NEW_EXTERNAL_DIRECTORY"}))
        return 1
    out.mkdir(parents=True)
    try:
        result, rows = collect(source)
        result["sourceSha"] = checkout_source_sha(source)
    except CensusError as error:
        result = {"schema": "native-parser-dom-census/v2", "status": "FAIL", "code": error.code,
                  "versions": versions()}
        if error.book in BOOKS:
            result["book"] = error.book
        rows = []
    except Exception:
        # Parser and filesystem exceptions may contain accepted source snippets or user paths.
        result, rows = {"schema": "native-parser-dom-census/v2", "status": "FAIL", "code": "CENSUS_INPUT_FAILURE",
                        "versions": versions()}, []
    write_results(out, result, rows)
    print(json.dumps({key: result[key] for key in
                      ("status", "code", "book", "sourceSha", "versions", "totalBindings", "qaBindings", "serializerDifferences", "activeFingerprintDifferences", "books")
                      if key in result}, separators=(",", ":")))
    return 0 if result["status"] == "PASS" else 1


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception:
        # Also suppress unexpected output-directory/I/O errors before results can be saved.
        print(json.dumps({"status": "FAIL", "code": "CENSUS_IO_FAILURE", "versions": versions()}))
        raise SystemExit(1)

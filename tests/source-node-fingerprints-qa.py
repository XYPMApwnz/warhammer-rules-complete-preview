"""Synthetic fail-closed and structural controls for native source evidence."""
import copy
import hashlib
import importlib.util
import json
from pathlib import Path
import tempfile
import unittest

from lxml import html

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("source_node_fingerprints", ROOT / "books/shared/tools/source_node_fingerprints.py")
helper = importlib.util.module_from_spec(spec)
spec.loader.exec_module(helper)


def fp(markup):
    return helper.fingerprint(html.fromstring(markup))


class SourceNodeFingerprintsQA(unittest.TestCase):
    def test_nonrow_invariance(self):
        self.assertEqual(fp('<div class="a b" id="x"> one <b>two</b> tail </div>'),
                         fp('<div id="x" class="b a">\n one\t<b>two</b>  tail\n</div>'))

    def test_nonrow_mutations(self):
        base = fp('<div class="a">one<b>two</b>tail<i>three</i></div>')
        for changed in ('<section class="a">one<b>two</b>tail<i>three</i></section>',
                        '<div class="b">one<b>two</b>tail<i>three</i></div>',
                        '<div class="a">changed<b>two</b>tail<i>three</i></div>',
                        '<div class="a">one<b>two</b>changed<i>three</i></div>',
                        '<div class="a">one<i>three</i><b>two</b>tail</div>',
                        '<div class="a">one two tail three</div>'):
            with self.subTest(changed=changed):
                self.assertNotEqual(base, fp(changed))

    def test_nonrow_comment_mutation(self):
        self.assertNotEqual(fp('<div>one<!--a-->tail</div>'), fp('<div>one<!--b-->tail</div>'))

    def test_row_complete_cell_and_order_mutations(self):
        base = fp('<tr><td>first</td><td>second</td></tr>')
        self.assertNotEqual(base, fp('<tr><td>changed</td><td>second</td></tr>'))
        self.assertNotEqual(base, fp('<tr><td>second</td><td>first</td></tr>'))
        self.assertNotEqual(base, fp('<tr><td>first</td><td>second</td><td>third</td></tr>'))

    def test_row_exact_census_payload(self):
        value = ["row", ["first second", "third"]]
        expected = hashlib.sha256(json.dumps(value, ensure_ascii=False, separators=(",", ":")).encode()).hexdigest().upper()
        self.assertEqual(fp('<tr><td> first <b>second</b> </td><td>third</td></tr>'), expected)

    def test_nonrow_exact_census_payload(self):
        value = ["tree", [["open", "div", ["a", "b"]], ["text", "one"],
                          ["open", "b", []], ["text", "two"], ["close", "b"],
                          ["tail", "tail"], ["close", "div"], ["tail", ""]]]
        expected = hashlib.sha256(json.dumps(value, ensure_ascii=False, separators=(",", ":")).encode()).hexdigest().upper()
        self.assertEqual(fp('<div class="b a">one<b>two</b> tail </div>'), expected)

    def test_csm_row_payload_unchanged(self):
        row = html.fromstring('<tr><td> first <b>second</b> </td><td>third</td></tr>')
        payload = {"schema": "html-row-cell-text/v1", "cells": ["first second", "third"]}
        expected = hashlib.sha256(json.dumps(payload, ensure_ascii=False, separators=(",", ":")).encode()).hexdigest()
        self.assertEqual(helper.row_text_fingerprint(row), expected)

    def test_csm_nonrow_and_empty_row_rejected(self):
        for markup in ('<div>not a row</div>', '<tr></tr>'):
            with self.subTest(markup=markup), self.assertRaises(ValueError):
                helper.row_text_fingerprint(html.fromstring(markup))

    def test_loader_exact_join(self):
        self.assertEqual(self.load(self.sidecar())["source-example"]["fingerprintSha256"], "B" * 64)

    @staticmethod
    def address():
        return {"sourceEntityId": "source-example", "document": "books/example/source.html",
                "pointer": "/html/body/div", "rawNodeSha256": "A" * 64}

    def sidecar(self):
        address = self.address()
        return {"schema": helper.SCHEMA, "bookId": "example", "nodes": [{
            "sourceEntityId": address["sourceEntityId"], "document": address["document"],
            "pointer": address["pointer"], "legacySerializerSha256": address["rawNodeSha256"],
            "fingerprintSha256": "B" * 64}]}

    def load(self, document, addresses=None):
        with tempfile.TemporaryDirectory() as name:
            here = Path(name) / "example/v2"
            here.mkdir(parents=True)
            (here / "source-node-fingerprints.json").write_text(json.dumps(document), encoding="utf-8")
            return helper.load_native_expectations(here, [self.address()] if addresses is None else addresses)

    def test_schema_book_and_fields_mutations_rejected(self):
        for field, value in (("schema", "wrong/v1"), ("bookId", "other"), ("nodes", {})):
            with self.subTest(field=field), self.assertRaises(ValueError):
                data = self.sidecar()
                data[field] = value
                self.load(data)
        with self.assertRaises(ValueError):
            self.load({**self.sidecar(), "extra": True})

    def test_node_field_mutations_rejected(self):
        for field, value in (("sourceEntityId", "extra-id"), ("document", "books/other/source.html"),
                             ("pointer", "/html/body/p"), ("legacySerializerSha256", "C" * 64),
                             ("fingerprintSha256", "invalid"), ("fingerprintSha256", "b" * 64)):
            with self.subTest(field=field, value=value), self.assertRaises(ValueError):
                data = self.sidecar()
                data["nodes"][0][field] = value
                self.load(data)
        for mutate in (lambda node: node.pop("pointer"), lambda node: node.update(extra=True)):
            with self.assertRaises(ValueError):
                data = self.sidecar()
                mutate(data["nodes"][0])
                self.load(data)

    def test_missing_duplicate_and_extra_nodes_rejected(self):
        with self.assertRaises(ValueError):
            data = self.sidecar()
            data["nodes"] = []
            self.load(data)
        with self.assertRaises(ValueError):
            data = self.sidecar()
            data["nodes"].append(copy.deepcopy(data["nodes"][0]))
            self.load(data)
        with self.assertRaises(ValueError):
            self.load(self.sidecar(), [self.address(), self.address()])

    def qa_document(self):
        return {"schema": helper.QA_SCHEMA, "bookId": "example", "groups": {"static-gameplay": [{
            "id": "proof-one", "sourceDocument": "books/example/source.html", "selector": "/html/body/div",
            "parserInput": "unicode", "legacySerializerSha256": "a" * 64, "fingerprintSha256": "B" * 64}]}}

    def load_qa(self, document, contexts=None, group="static-gameplay"):
        if contexts is None:
            contexts = [{key: value for key, value in self.qa_document()["groups"]["static-gameplay"][0].items()
                         if key != "fingerprintSha256"}]
        with tempfile.TemporaryDirectory() as name:
            here = Path(name) / "example/v2"
            here.mkdir(parents=True)
            (here / "source-node-qa-fingerprints.json").write_text(json.dumps(document), encoding="utf-8")
            return helper.load_qa_expectations(here, contexts, group=group)

    def test_qa_loader_exact_join(self):
        self.assertEqual(self.load_qa(self.qa_document())["proof-one"]["fingerprintSha256"], "B" * 64)

    def test_qa_loader_explicit_parser_domain(self):
        data = self.qa_document()
        data["groups"]["static-gameplay"][0]["parserInput"] = "bytes"
        contexts = [{key: value for key, value in data["groups"]["static-gameplay"][0].items()
                     if key != "fingerprintSha256"}]
        self.assertEqual(self.load_qa(data, contexts)["proof-one"]["parserInput"], "bytes")
        with self.assertRaises(ValueError):
            self.load_qa(data)
        data["groups"]["static-gameplay"][0]["parserInput"] = "auto"
        with self.assertRaises(ValueError):
            self.load_qa(data, contexts)

    def test_qa_loader_closed_schema_book_group(self):
        for field, value in (("schema", "wrong/v1"), ("bookId", "other"), ("groups", [])):
            with self.subTest(field=field), self.assertRaises(ValueError):
                data = self.qa_document()
                data[field] = value
                self.load_qa(data)
        with self.assertRaises(ValueError):
            self.load_qa(self.qa_document(), group="reference")
        with self.assertRaises(ValueError):
            data = self.qa_document()
            data["groups"]["unknown-group"] = []
            self.load_qa(data)

    def test_qa_loader_record_and_context_mutations(self):
        for field, value in (("id", "other-id"), ("sourceDocument", "books/other/source.html"),
                             ("selector", "/html/body/p"), ("legacySerializerSha256", "A" * 64),
                             ("fingerprintSha256", "invalid"), ("parserInput", "bytes")):
            with self.subTest(field=field), self.assertRaises(ValueError):
                data = self.qa_document()
                data["groups"]["static-gameplay"][0][field] = value
                self.load_qa(data)
        for context_change in (lambda context: context.pop("selector"), lambda context: context.update(extra=True)):
            with self.assertRaises(ValueError):
                context = {key: value for key, value in self.qa_document()["groups"]["static-gameplay"][0].items()
                           if key != "fingerprintSha256"}
                context_change(context)
                self.load_qa(self.qa_document(), [context])

    def test_qa_loader_all_groups_validated_and_duplicates_rejected(self):
        with self.assertRaises(ValueError):
            data = self.qa_document()
            data["groups"]["reference"] = [{"id": "malformed"}]
            self.load_qa(data)
        with self.assertRaises(ValueError):
            data = self.qa_document()
            data["groups"]["static-gameplay"].append(copy.deepcopy(data["groups"]["static-gameplay"][0]))
            self.load_qa(data)
        with self.assertRaises(ValueError):
            self.load_qa(self.qa_document(), [])


if __name__ == "__main__":
    unittest.main()

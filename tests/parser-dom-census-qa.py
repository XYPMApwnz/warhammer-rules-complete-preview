"""Synthetic controls for safe native parser comparison; no accepted RAW is emitted."""
import contextlib
import importlib.util
import io
import json
from pathlib import Path
import tempfile
import unittest
from types import SimpleNamespace
from unittest.mock import patch

from lxml import html

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("parser_dom_census", ROOT / "tools/parser-dom-census.py")
census = importlib.util.module_from_spec(spec)
spec.loader.exec_module(census)


def fingerprint(markup):
    return census.candidate_fingerprint(html.fromstring(markup))


def fixture(root):
    for book in census.BOOKS:
        here = root / "books" / book / "v2"
        (here / "sources").mkdir(parents=True)
        document = "books/" + book + "/v2/sources/input.html"
        raw = b'<html><body><div class="alpha beta">PRIVATE_BODY_SENTINEL<span>child</span> tail</div></body></html>'
        (root / document).write_bytes(raw)
        artifact = {"path": document, "sha256": census.digest(raw), "bytes": len(raw)}
        def write(name, value):
            (here / name).write_text(json.dumps(value), encoding="utf-8")
        write("sources/enrollment.json", {"artifacts": [artifact]})
        write("source-review.json", {"reviewedArtifacts": [artifact]})
        node = html.fromstring(raw.decode()).xpath("/html/body/div")[0]
        write("source-bindings.json", {"recordAddresses": [{"key": document + "#/html/body/div::ABILITY",
            "sourceEntityId": "source-example", "kind": "ABILITY", "document": document,
            "pointer": "/html/body/div", "rawNodeSha256": census.digest(html.tostring(node, encoding="utf-8"))}]})
        write("identity-bindings.json", {"bindings": [{"sourceEntityId": "source-example", "id": "ability-example"}]})


class ParserDOMCensusQA(unittest.TestCase):
    def test_checkout_identity_uses_local_git_only(self):
        with patch.object(census.subprocess, "run", side_effect=[
                SimpleNamespace(returncode=0, stdout=str(ROOT) + "\n"),
                SimpleNamespace(returncode=0, stdout="a" * 40 + "\n")]) as run:
            self.assertEqual(census.checkout_source_sha(ROOT), "a" * 40)
            self.assertEqual(run.call_args_list[0].args[0],
                             ["git", "-C", str(ROOT), "rev-parse", "--show-toplevel"])
            self.assertEqual(run.call_args_list[1].args[0],
                             ["git", "-C", str(ROOT), "rev-parse", "--verify", "HEAD^{commit}"])
            self.assertTrue(all(call.kwargs["stderr"] == census.subprocess.DEVNULL
                                for call in run.call_args_list))

    def test_invalid_checkout_sha_rejected(self):
        with patch.object(census.subprocess, "run", side_effect=[
                SimpleNamespace(returncode=0, stdout=str(ROOT)),
                SimpleNamespace(returncode=0, stdout="PRIVATE_BODY_SENTINEL owner@example.invalid")]):
            with self.assertRaises(census.CensusError) as raised:
                census.checkout_source_sha(ROOT)
            self.assertEqual(raised.exception.code, "SOURCE_CHECKOUT_IDENTITY_FAILED")

    def test_parent_checkout_rejected(self):
        with patch.object(census.subprocess, "run", return_value=
                          SimpleNamespace(returncode=0, stdout=str(ROOT.parent))) as run:
            with self.assertRaises(census.CensusError) as raised:
                census.checkout_source_sha(ROOT)
            self.assertEqual(raised.exception.code, "SOURCE_CHECKOUT_ROOT_MISMATCH")
            self.assertEqual(run.call_count, 1)

    def test_not_a_git_checkout_rejected(self):
        with patch.object(census.subprocess, "run", return_value=
                          SimpleNamespace(returncode=128, stdout="")):
            with self.assertRaises(census.CensusError) as raised:
                census.checkout_source_sha(ROOT)
            self.assertEqual(raised.exception.code, "SOURCE_CHECKOUT_IDENTITY_FAILED")

    def test_attribute_class_order_and_whitespace_invariance(self):
        self.assertEqual(fingerprint('<div id="a" class="beta alpha"> text <b>bold</b> tail </div>'),
                         fingerprint('<div class="alpha beta" id="a">\n text\t<b>bold</b>  tail\n</div>'))

    def test_nonrow_class_change(self):
        self.assertNotEqual(fingerprint('<div class="a">text</div>'), fingerprint('<div class="b">text</div>'))

    def test_nonrow_tag_change(self):
        self.assertNotEqual(fingerprint('<div>text</div>'), fingerprint('<p>text</p>'))

    def test_nonrow_text_change(self):
        self.assertNotEqual(fingerprint('<div>first</div>'), fingerprint('<div>second</div>'))

    def test_nonrow_tail_change(self):
        self.assertNotEqual(fingerprint('<div><b>one</b> first</div>'), fingerprint('<div><b>one</b> second</div>'))

    def test_nonrow_order_change(self):
        self.assertNotEqual(fingerprint('<div><b>one</b><i>two</i></div>'), fingerprint('<div><i>two</i><b>one</b></div>'))

    def test_nonrow_structure_not_just_text(self):
        self.assertNotEqual(fingerprint('<div><b>same</b></div>'), fingerprint('<div>same</div>'))

    def test_complete_row_cells(self):
        self.assertNotEqual(fingerprint('<tr><td>first</td><td>second</td></tr>'),
                            fingerprint('<tr><td>changed</td><td>second</td></tr>'))

    def test_row_order(self):
        self.assertNotEqual(fingerprint('<tr><td>first</td><td>second</td></tr>'),
                            fingerprint('<tr><td>second</td><td>first</td></tr>'))

    def test_row_whitespace_and_markup_invariance(self):
        self.assertEqual(fingerprint('<tr><td> first <b>second</b> </td></tr>'),
                         fingerprint('<tr><td>first second</td></tr>'))

    def test_safe_complete_output_and_versions(self):
        with tempfile.TemporaryDirectory() as name:
            root = Path(name)
            fixture(root)
            result, rows = census.collect(root)
            self.assertEqual(result["status"], "PASS")
            self.assertEqual(result["totalBindings"], len(census.BOOKS))
            self.assertEqual(set(result["versions"]), {"python", "lxml", "libxml"})
            for row in rows:
                self.assertEqual(tuple(row), census.FIELDS)
                self.assertTrue(row["serializerMatches"])
            out = root / "output"
            out.mkdir()
            census.write_results(out, result, rows)
            for path in out.iterdir():
                output = path.read_text(encoding="utf-8")
                self.assertNotIn("PRIVATE_BODY_SENTINEL", output)
                self.assertNotIn("alpha", output)
                self.assertNotIn("<div", output)

    def test_all_source_sha_checks_precede_parsing(self):
        for book in census.BOOKS:
            with self.subTest(book=book), tempfile.TemporaryDirectory() as name:
                root = Path(name)
                fixture(root)
                source = root / "books" / book / "v2/sources/input.html"
                source.write_bytes(source.read_bytes() + b"CORRUPTED")
                with self.assertRaises(census.CensusError) as raised:
                    census.collect(root)
                self.assertEqual(raised.exception.code, "SOURCE_INTEGRITY_MISMATCH")

    def test_later_book_integrity_checked_before_any_parser(self):
        with tempfile.TemporaryDirectory() as name:
            root = Path(name)
            fixture(root)
            path = root / "books/dark-angels/v2/sources/input.html"
            path.write_bytes(b"BROKEN")
            original = census.html.fromstring
            def forbidden(_):
                self.fail("Parsing started before every enrolled source was authenticated")
            census.html.fromstring = forbidden
            try:
                with self.assertRaises(census.CensusError) as raised:
                    census.collect(root)
                self.assertEqual(raised.exception.code, "SOURCE_INTEGRITY_MISMATCH")
            finally:
                census.html.fromstring = original

    def test_private_or_escaping_source_path_rejected(self):
        for name in ("../outside.html", "owner@example.invalid.html", "C:/private.html", "sources\\private.html", "other/file.html"):
            with self.subTest(name=name), self.assertRaises(census.CensusError):
                census.source_path(ROOT, name)

    def test_malicious_snapshot_and_binding_paths_never_leak(self):
        for kind in ("snapshot", "binding"):
            with self.subTest(kind=kind), tempfile.TemporaryDirectory() as name:
                root = Path(name) / "source"
                fixture(root)
                v2 = root / "books/space-marines/v2"
                malicious = "books/PRIVATE_BODY_SENTINEL-owner@example.invalid.html"
                if kind == "snapshot":
                    path = v2 / "sources/enrollment.json"
                    data = json.loads(path.read_text())
                    data["artifacts"][0]["path"] = malicious
                else:
                    path = v2 / "source-bindings.json"
                    data = json.loads(path.read_text())
                    data["recordAddresses"][0]["document"] = malicious
                path.write_text(json.dumps(data))
                out = Path(name) / "output"
                capture = io.StringIO()
                with contextlib.redirect_stdout(capture):
                    self.assertEqual(census.main(["--source", str(root), "--out", str(out)]), 1)
                output = capture.getvalue() + (out / "RESULTS.json").read_text() + (out / "INVENTORY.csv").read_text()
                self.assertIn("INVALID_SOURCE_PATH", output)
                self.assertNotIn("PRIVATE_BODY_SENTINEL", output)
                self.assertNotIn("owner@", output)

    def test_ba_reviewed_artifact_sha_preserved(self):
        with tempfile.TemporaryDirectory() as name:
            root = Path(name)
            fixture(root)
            review = root / "books/blood-angels/v2/source-review.json"
            data = json.loads(review.read_text())
            data["reviewedArtifacts"][0]["sha256"] = "0" * 64
            review.write_text(json.dumps(data))
            with self.assertRaises(census.CensusError) as raised:
                census.collect(root)
            self.assertEqual(raised.exception.code, "SOURCE_INTEGRITY_MISMATCH")

    def test_serializer_difference_is_reported(self):
        with tempfile.TemporaryDirectory() as name:
            root = Path(name)
            fixture(root)
            path = root / "books/space-marines/v2/source-bindings.json"
            bindings = json.loads(path.read_text())
            bindings["recordAddresses"][0]["rawNodeSha256"] = "0" * 64
            path.write_text(json.dumps(bindings))
            result, rows = census.collect(root)
            self.assertEqual(result["status"], "FAIL")
            self.assertEqual(result["serializerDifferences"], 1)
            self.assertFalse(rows[0]["serializerMatches"])

    def test_portable_guard_accepts_serializer_drift_but_preserves_legacy_measurement(self):
        with tempfile.TemporaryDirectory() as name:
            root = Path(name)
            fixture(root)
            here = root / "books/space-marines/v2"
            path = here / "source-bindings.json"
            bindings = json.loads(path.read_text())
            address = bindings["recordAddresses"][0]
            address["rawNodeSha256"] = "0" * 64
            path.write_text(json.dumps(bindings))
            node = html.fromstring((root / address["document"]).read_text()).xpath(address["pointer"])[0]
            sidecar = {"schema": "native-source-node-fingerprints/v1", "bookId": "space-marines", "nodes": [{
                "sourceEntityId": address["sourceEntityId"], "document": address["document"], "pointer": address["pointer"],
                "legacySerializerSha256": address["rawNodeSha256"], "fingerprintSha256": census.candidate_fingerprint(node)}]}
            (here / "source-node-fingerprints.json").write_text(json.dumps(sidecar))
            result, rows = census.collect(root)
            self.assertEqual(result["status"], "PASS")
            self.assertEqual(result["serializerDifferences"], 1)
            self.assertEqual(result["activeFingerprintDifferences"], 0)
            self.assertEqual(rows[0]["activeScheme"], "portable")
            self.assertFalse(rows[0]["serializerMatches"])
            self.assertTrue(rows[0]["activeFingerprintMatches"])
            sidecar["nodes"][0]["fingerprintSha256"] = "0" * 64
            (here / "source-node-fingerprints.json").write_text(json.dumps(sidecar))
            failed, _ = census.collect(root)
            self.assertEqual(failed["status"], "FAIL")
            self.assertEqual(failed["activeFingerprintDifferences"], 1)

    def test_portable_qa_guard_uses_explicit_input_domain_without_source_body(self):
        with tempfile.TemporaryDirectory() as name:
            root = Path(name)
            fixture(root)
            here = root / "books/space-marines/v2"
            address = json.loads((here / "source-bindings.json").read_text())["recordAddresses"][0]
            node = html.fromstring((root / address["document"]).read_text()).xpath(address["pointer"])[0]
            record = {"id": "qa-proof/example[0]", "sourceDocument": address["document"], "selector": address["pointer"],
                      "legacySerializerSha256": address["rawNodeSha256"], "parserInput": "unicode",
                      "fingerprintSha256": census.candidate_fingerprint(node)}
            sidecar = {"schema": "source-node-qa-fingerprints/v1", "bookId": "space-marines",
                       "groups": {"static-gameplay": [record]}}
            (here / "source-node-qa-fingerprints.json").write_text(json.dumps(sidecar))
            result, rows = census.collect(root)
            self.assertEqual(result["status"], "PASS")
            self.assertEqual(result["totalBindings"], 3)
            self.assertEqual(result["qaBindings"], 1)
            self.assertEqual(result["activeFingerprintDifferences"], 0)
            self.assertEqual([row["parserInput"] for row in rows if row["guardType"] == "qa"], ["unicode"])
            self.assertNotIn("PRIVATE_BODY_SENTINEL", json.dumps(result) + json.dumps(rows))
            record["parserInput"] = "auto"
            (here / "source-node-qa-fingerprints.json").write_text(json.dumps(sidecar))
            with self.assertRaises(census.CensusError) as raised:
                census.collect(root)
            self.assertEqual(raised.exception.code, "INVALID_ACTIVE_QA_FINGERPRINTS")

    def test_duplicate_binding_rejected(self):
        with tempfile.TemporaryDirectory() as name:
            root = Path(name)
            fixture(root)
            path = root / "books/space-marines/v2/source-bindings.json"
            data = json.loads(path.read_text())
            data["recordAddresses"].append(data["recordAddresses"][0])
            path.write_text(json.dumps(data))
            with self.assertRaises(census.CensusError) as raised:
                census.collect(root)
            self.assertEqual(raised.exception.code, "INCOMPLETE_OR_DUPLICATE_BINDINGS")

    def test_failure_output_never_echoes_exception_contents(self):
        with tempfile.TemporaryDirectory() as name:
            out = Path(name) / "fresh"
            original = census.collect
            def fail(_):
                raise ValueError("PRIVATE_BODY_SENTINEL owner@example.invalid")
            census.collect = fail
            try:
                capture = io.StringIO()
                with contextlib.redirect_stdout(capture):
                    self.assertEqual(census.main(["--out", str(out)]), 1)
                output = capture.getvalue() + (out / "RESULTS.json").read_text()
                self.assertNotIn("PRIVATE_BODY_SENTINEL", output)
                self.assertNotIn("owner@", output)
                self.assertIn("CENSUS_INPUT_FAILURE", output)
            finally:
                census.collect = original


if __name__ == "__main__":
    unittest.main()

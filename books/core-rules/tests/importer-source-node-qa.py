"""Standalone synthetic guard: citation codes are not unique source-node identities."""

import contextlib
import importlib.util
import io
import json
from pathlib import Path
import sys
import tempfile
import unittest

sys.dont_write_bytecode = True
spec = importlib.util.spec_from_file_location(
    "core_importer", Path(__file__).resolve().parents[1] / "tools" / "import_wahapedia_11e.py"
)
importer = importlib.util.module_from_spec(spec)
spec.loader.exec_module(importer)


class SourceNodeIdentityGuard(unittest.TestCase):
    first = '<h3 id="Synthetic-Definition">Synthetic definition 13.02.01</h3><p>Definition body.</p>'
    second = '<h3 id="Synthetic-Trigger">Synthetic trigger 13.02.01</h3><p>Conditional body.</p>'

    def import_records(self, fragments):
        with tempfile.TemporaryDirectory(prefix="core-importer-source-node-") as directory:
            source = Path(directory) / "source.html"
            output = Path(directory) / "output.json"
            source.write_text('<html><body>' + ''.join(fragments) + '</body></html>', encoding="utf-8")
            with contextlib.redirect_stdout(io.StringIO()):
                importer.main(str(source), str(output))
            return json.loads(output.read_text(encoding="utf-8"))["records"]

    def test_distinct_same_code_nodes_survive_in_either_order(self):
        forward = self.import_records([self.first, self.second])
        reverse = self.import_records([self.second, self.first])
        self.assertEqual(forward, reverse)
        repeated = [record for record in forward if record["code"] == "13.02.01"]
        self.assertEqual(len(repeated), 2)
        self.assertEqual(
            {record["sourceNode"]["anchor"]: record["text"] for record in repeated},
            {"Synthetic-Definition": "Definition body.", "Synthetic-Trigger": "Conditional body."},
        )
        for record in repeated:
            self.assertEqual(record["sourceNode"]["sourceUrl"], importer.SOURCE_URL)
            self.assertEqual(record["sourceNode"]["code"], record["code"])

    def test_missing_duplicate_anchor_fails_closed(self):
        with self.assertRaisesRegex(ValueError, "distinct anchors required"):
            self.import_records([self.first, self.second.replace(' id="Synthetic-Trigger"', '')])

    def test_repeated_anchor_fails_closed(self):
        with self.assertRaisesRegex(ValueError, "distinct anchors required"):
            self.import_records([self.first, self.second.replace("Synthetic-Trigger", "Synthetic-Definition")])

    def test_unique_heading_still_replaces_tooltip_and_normalizes(self):
        tooltip = ('<div id="tooltip_content-test"><div class="tooltip_header">'
                   '24.37.01 Tooltip title</div><p>Tooltip body.</p></div>')
        heading = '<h3 id="Synthetic-Restriction">Source title 24.37.01</h3><p>Heading body.</p>'
        records = self.import_records([tooltip, heading])
        matches = [record for record in records if record["code"] == "24.37.01"]
        self.assertEqual(len(matches), 1)
        self.assertEqual(matches[0]["title"], "Torrent Restrictions")
        self.assertEqual(matches[0]["text"], "Heading body.")
        self.assertNotIn("sourceNode", matches[0])
        self.assertNotIn("sourceCode", matches[0])

    def test_heading_identity_does_not_depend_on_title_or_body(self):
        records = self.import_records([self.first, self.second.replace("Synthetic trigger", "Synthetic definition")
                                       .replace("Conditional body.", "Definition body.")])
        repeated = [record for record in records if record["code"] == "13.02.01"]
        self.assertEqual(len(repeated), 2)
        self.assertEqual(len({record["sourceNode"]["anchor"] for record in repeated}), 2)


if __name__ == "__main__":
    unittest.main()

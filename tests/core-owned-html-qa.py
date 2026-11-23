"""Deterministic source-fragment serialization without publishing source text."""
from pathlib import Path
import sys
import unittest
from unittest.mock import patch

from lxml import etree, html

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "books/core-rules/tools"))
import build_waha_core_corpus as builder
from owned_html import serialize_owned_html


class OwnedHtmlTests(unittest.TestCase):
    def test_text_attribute_quotes_and_order(self):
        node = html.Element("div", attrib={"id": "sample", "empty": "", "title": 'a "quote"', "both": '\"and\''})
        node.text = "<text> & \u00a0\r\n"
        self.assertEqual(serialize_owned_html(node), '<div id="sample" empty="" title=\'a "quote"\' both="&quot;and\'">&lt;text&gt; &amp; \u00a0\r\n</div>')

    def test_uri_encoding_and_html_escaping(self):
        node = html.Element("a", href='https://example.test/a b/\u00e9?x=1&y="two"')
        self.assertEqual(serialize_owned_html(node), '<a href=\'https://example.test/a%20b/%C3%A9?x=1&amp;y="two"\'></a>')

    def test_boolean_attributes_and_html4_void_elements(self):
        node = html.fromstring('<div><input disabled="false" value=""><br><img src="x"><wbr></wbr><source></source></div>')
        self.assertEqual(serialize_owned_html(node), '<div><input disabled value=""><br><img src="x"><wbr></wbr><source></source></div>')

    def test_comments_raw_text_and_tails(self):
        node = html.Element("div")
        node.append(etree.Comment("synthetic"))
        script = etree.SubElement(node, "script")
        script.text = "a < b && c > d"
        script.tail = " < tail &"
        node.tail = " root > tail"
        self.assertEqual(serialize_owned_html(node), '<div><!--synthetic--><script>a < b && c > d</script> &lt; tail &amp;</div> root &gt; tail')

    def test_unknown_node_kind_fails_closed(self):
        with self.assertRaisesRegex(ValueError, "Unsupported owned HTML node kind"):
            serialize_owned_html(etree.ProcessingInstruction("synthetic", "value"))

    def test_accepted_outputs_remain_exact_and_ignore_libxml_serializer(self):
        source = builder.DEFAULT_SOURCE
        # These committed artifacts are comparison expectations only. The
        # producer obtains every fact and fragment from authenticated captures.
        with patch.object(html, "tostring", side_effect=RuntimeError("Synthetic serializer drift")):
            _, outputs = builder.source_outputs(source)
        self.assertEqual(len(outputs), 3)
        for name, actual in outputs.items():
            self.assertTrue((source / name).read_bytes() == actual,
                            "Accepted Core output bytes changed: " + name)
        # Corrupt one serialized byte: the exact-output comparison still rejects it.
        name = "waha-core-corpus.v1.json"
        corrupted = outputs[name].replace(b"ownedHtml", b"ownedHTML", 1)
        self.assertTrue(corrupted != outputs[name])
        self.assertFalse((source / name).read_bytes() == corrupted,
                         "Corrupted serialized source fragment was accepted")


if __name__ == "__main__":
    unittest.main()

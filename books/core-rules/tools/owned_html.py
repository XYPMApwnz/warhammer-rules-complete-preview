"""Deterministic HTML4 serialization of bounded, accepted source fragments.

The source parser still owns the DOM. Serialization is explicit so a libxml
upgrade cannot silently change the reviewed corpus's HTML and derived hashes.
"""
from __future__ import annotations

from html import escape
import re
from urllib.parse import quote

from lxml import etree, html


VOID = frozenset("area base basefont br col frame hr img input isindex link meta param".split())
BOOLEAN = frozenset("checked compact declare defer disabled ismap multiple nohref noresize noshade nowrap readonly selected".split())
URI = frozenset(("href", "src", "action"))
URI_SAFE = "".join(chr(code) for code in range(33, 127))
NEWLINE_REFERENCE = re.compile(rb"&#(?:0*(?:10|13)(?![0-9])|[xX]0*[aAdD](?![0-9a-fA-F]));?|&NewLine;")


def parse_owned_document(raw: bytes):
    """Keep authenticated capture line endings independent of parser version.

    Both accepted captures have uniform physical CRLF and no character-reference
    newlines. Mixed/ambiguous input needs an explicit review rather than a guess
    about whether a parsed newline was physical source layout or encoded content.
    """
    crlf = b"\r\n" in raw
    canonical = raw.replace(b"\r\n", b"\n")
    if b"\r" in canonical or crlf and b"\n" in raw.replace(b"\r\n", b""):
        raise ValueError("Unsupported mixed source HTML line endings")
    if crlf and NEWLINE_REFERENCE.search(raw):
        raise ValueError("Unsupported source HTML newline reference with CRLF")
    document = html.fromstring(canonical, parser=html.HTMLParser(encoding="utf-8"))
    for node in document.iter():
        # libxml 2.14 retains a quote-only empty attribute from malformed HTML;
        # earlier parsers discard it. It is not a valid HTML attribute or fact.
        if '"' in node.attrib:
            if node.attrib['"'] != "":
                raise ValueError("Unsupported nonempty quote-only HTML attribute")
            del node.attrib['"']
        if crlf:
            for field in ("text", "tail"):
                value = getattr(node, field)
                if value:
                    setattr(node, field, value.replace("\n", "\r\n"))
            for name, value in list(node.attrib.items()):
                node.set(name, value.replace("\n", "\r\n"))
    return document


def attribute(value: str, uri: bool = False) -> str:
    if uri:
        value = quote(value, safe=URI_SAFE)
    value = escape(value, quote=False)
    if '"' in value and "'" not in value:
        return "'" + value + "'"
    return '"' + value.replace('"', "&quot;") + '"'


def serialize_owned_html(node) -> str:
    """Preserve DOM/attribute order, HTML4 spelling and the root's tail."""
    parts = []

    def emit(current):
        if current.tag is etree.Comment:
            parts.extend(("<!--", current.text or "", "-->"))
        else:
            tag = current.tag
            if not isinstance(tag, str) or "{" in tag:
                raise ValueError("Unsupported owned HTML node kind")
            parts.extend(("<", tag))
            for name, value in current.attrib.items():
                if "{" in name:
                    raise ValueError("Unsupported owned HTML attribute namespace")
                parts.extend((" ", name))
                if name.lower() not in BOOLEAN:
                    parts.extend(("=", attribute(value, name.lower() in URI)))
            parts.append(">")
            if current.text:
                parts.append(current.text if tag.lower() in ("script", "style") else escape(current.text, quote=False))
            for child in current:
                emit(child)
            if tag.lower() not in VOID:
                parts.extend(("</", tag, ">"))
        if current.tail:
            parts.append(escape(current.tail, quote=False))

    emit(node)
    return "".join(parts)

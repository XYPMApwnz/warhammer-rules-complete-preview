"""Deterministic HTML4 serialization of bounded, accepted source fragments.

The source parser still owns the DOM. Serialization is explicit so a libxml
upgrade cannot silently change the reviewed corpus's HTML and derived hashes.
"""
from __future__ import annotations

from html import escape
from urllib.parse import quote

from lxml import etree


VOID = frozenset("area base basefont br col frame hr img input isindex link meta param".split())
BOOLEAN = frozenset("checked compact declare defer disabled ismap multiple nohref noresize noshade nowrap readonly selected".split())
URI = frozenset(("href", "src", "action"))
URI_SAFE = "".join(chr(code) for code in range(33, 127))


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

"""Reproduce inactive Core and Appendix source candidates from frozen HTML.

The command has no network path. Source identities are explicit reviewed input;
DOM order controls presentation only. Use --write to produce corpus, manifest
and source-only census, and --check to compare their exact bytes. No active
snapshot, player-visible reader or runtime glossary is consumed or written.
"""

from __future__ import annotations

import argparse
from copy import deepcopy
import hashlib
import json
from pathlib import Path
import re
import unicodedata
from urllib.parse import unquote, urljoin, urlparse

from lxml import html


ROOT = Path(__file__).resolve().parents[3]
DEFAULT_SOURCE = ROOT / "books/core-rules/sources/waha-core-2026-11-11"
CODE = re.compile(r"(?<![\d.])((?:0[1-9]|1\d|2[0-5])\.\d{2}(?:\.\d{2})?)(?![\d.])")
PARTITIONS = ("numbered", "faqs", "errata", "universalRulesUpdates")
NORMALIZATION = {
    "whitespace": True,
    "nbsp": True,
    "quoteVariants": True,
    "presentationDashes": True,
    "semanticPunctuationPreserved": True,
    "sourceOrderPreserved": True,
    "tooltipTemplateBodiesExcluded": True,
    "visibleTooltipReferencesPreserved": True,
    "visibleCssDiceFaces": True,
}


def normalize(value: str) -> str:
    value = unicodedata.normalize("NFKC", str(value or ""))
    value = value.translate(str.maketrans({"‘": "'", "’": "'", "“": '"', "”": '"', "–": "-", "—": "-"}))
    return re.sub(r"\s+", " ", value).strip()


def canonical(value) -> str:
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":"))


def sha256(value: bytes | str) -> str:
    if isinstance(value, str):
        value = value.encode("utf-8")
    return hashlib.sha256(value).hexdigest().upper()


def identity_fingerprint(value: str) -> str:
    return sha256(re.sub(r"\s+", "", normalize(value)))


def text(node) -> str:
    faces = [part for part in node.iter() if any(re.fullmatch(r"cruD[1-6]", name)
             for name in (part.get("class") or "").split())]
    if faces:
        node = deepcopy(node)
        for part in node.iter():
            values = [match.group(1) for name in (part.get("class") or "").split()
                      if (match := re.fullmatch(r"cruD([1-6])", name))]
            if len(values) == 1:
                part.text = values[0] + (part.text or "")
    return normalize("".join(node.itertext()))


def has_class(node, name: str) -> bool:
    return name in (node.get("class") or "").split()


def class_nodes(node, name: str):
    return node.xpath('.//*[contains(concat(" ",normalize-space(@class)," ")," ' + name + ' ")]')


def is_independent_heading(node, owner, anchors):
    if node in anchors or node.get("id") in anchors:
        return True
    if node.tag not in ("h1", "h2", "h3"):
        return False
    if CODE.search(text(node)):
        return True
    if has_class(node, "outline_header"):
        return True
    numbers = [text(item) for item in class_nodes(node, "h_number")]
    if any(re.fullmatch(r"\d{2}", number) for number in numbers):
        return True
    return node.tag in ("h1", "h2")


def next_rule_wrapper(node):
    return any(CODE.search(text(item)) for item in node.iter()
               if has_class(item, "str11Name") or has_class(item, "abName"))


def prefix_before_next_owner(node, owner, independent_anchors):
    """Preserve layout prose before the next independently headed source owner."""
    if is_independent_heading(node, owner, independent_anchors):
        return None, True
    if (has_class(node, "str11Wrap") or has_class(node, "abWrap")) and next_rule_wrapper(node):
        return None, True
    if not isinstance(node.tag, str):
        return deepcopy(node), False
    result = html.Element(node.tag, attrib=dict(node.attrib))
    result.text = node.text
    for child in node:
        prefix, ended = prefix_before_next_owner(child, owner, independent_anchors)
        if prefix is not None:
            result.append(prefix)
            if not ended:
                prefix.tail = child.tail
        if ended:
            return result, True
    return result, False


def following_scope_nodes(node):
    """Cross layout-only columns, retaining logical frame/card boundaries."""
    current = node
    while current.getparent() is not None:
        sibling = current.getnext()
        while sibling is not None:
            yield sibling
            sibling = sibling.getnext()
        parent = current.getparent()
        classes = set((parent.get("class") or "").split())
        if parent.get("id") == "wahMainContent" or parent.tag != "div":
            return
        if classes - {"Columns2", "BreakInsideAvoid", "mIndent"}:
            return
        if parent.tail:
            yield parent.tail
        current = parent


def extend_source_scope(initial, owner, independent_anchors):
    result = html.Element("div")
    result.append(deepcopy(initial))
    result[-1].tail = initial.tail
    for sibling in following_scope_nodes(initial):
        if isinstance(sibling, str):
            result[-1].tail = (result[-1].tail or "") + sibling
            continue
        if is_independent_heading(sibling, owner, independent_anchors):
            break
        prefix, ended = prefix_before_next_owner(sibling, owner, independent_anchors)
        if prefix is not None:
            result.append(prefix)
            if not ended:
                prefix.tail = sibling.tail
        if ended:
            break
    return result


def heading_body(heading, independent_anchors=()):
    """Include unnumbered subsections within this owner, ending at the next rule.

    Named rule cards already supply an explicit source container. Ordinary
    headings use sibling scopes; an unnumbered subheading does not end that
    scope, while another numbered rule, admitted independent heading or major
    chapter does. The enclosing column/frame remains an outer boundary.
    """
    return extend_source_scope(heading, heading, independent_anchors)


def source_wrapper(heading, independent_anchors):
    for name in ("str11Wrap", "abWrap"):
        if has_class(heading, "str11Name" if name == "str11Wrap" else "abName"):
            wrapper = next(parent for parent in heading.iterancestors() if has_class(parent, name))
            return extend_source_scope(wrapper, heading, independent_anchors)
    return heading_body(heading, independent_anchors)


def faq_source_heading(node) -> str:
    headings = node.xpath('preceding::*[(self::h2 or self::h3) and @id or contains(concat(" ",normalize-space(@class)," ")," str11Name ") or contains(concat(" ",normalize-space(@class)," ")," abName ")]')
    if not headings:
        raise ValueError("FAQ has no visible source heading")
    return text(headings[-1])


class Page:
    def __init__(self, capture: dict, source_dir: Path):
        self.capture = capture
        self.id = capture["id"]
        self.url = capture["url"]
        raw_file = (source_dir / capture["file"]).resolve()
        if not raw_file.is_relative_to(source_dir.resolve()):
            raise ValueError("Captured HTML must belong to its frozen source directory")
        raw = raw_file.read_bytes()
        if len(raw) != capture["rawBytes"] or sha256(raw) != capture["rawSha256"]:
            raise ValueError(f"Captured HTML integrity failure: {capture['file']}")
        document = html.fromstring(raw, parser=html.HTMLParser(encoding="utf-8"))
        roots = document.xpath('//*[@id="wahMainContent"]')
        if len(roots) != 1:
            raise ValueError(f"Expected one player-visible main content: {capture['file']}")
        self.main = roots[0]
        boundaries = json.loads((source_dir / "source-boundaries.v1.json").read_text("utf-8"))
        if boundaries.get("schema") != "core-candidate-source-boundaries/v1":
            raise ValueError("Unknown authored source-boundary schema")
        self.boundary_nodes = {}
        seen_boundaries = set()
        for declaration in boundaries["boundaries"]:
            if declaration["page"] != self.id:
                continue
            if declaration["rawSha256"] != capture["rawSha256"]:
                raise ValueError("Source-boundary capture mismatch: " + declaration["xpath"])
            key = (declaration["page"], declaration["xpath"])
            if key in seen_boundaries:
                raise ValueError("Duplicate authored source boundary: " + declaration["xpath"])
            seen_boundaries.add(key)
            matches = document.xpath(declaration["xpath"])
            if len(matches) != 1 or text(matches[0]) != declaration["headingText"]:
                raise ValueError("Missing or changed authored source boundary: " + declaration["xpath"])
            if matches[0] in self.boundary_nodes:
                raise ValueError("Two authored boundary locators select the same owner: " + declaration["xpath"])
            self.boundary_nodes[matches[0]] = declaration
        self.tooltips = {}
        self.external_tooltips = {}
        for template in document.xpath('//*[starts-with(@id,"tooltip_content")]'):
            headers = class_nodes(template, "tooltip_header")
            if not headers:
                headers = class_nodes(template, "abName") or class_nodes(template, "str11Name")
            if not headers:
                headers = [node for node in template.xpath(".//h2|.//h3") if CODE.search(text(node))]
            label = text(headers[0]) if headers else ""
            codes = list(dict.fromkeys(CODE.findall(label)))
            if label:
                self.tooltips["#" + template.get("id")] = (
                    "code:" + codes[0] if len(codes) == 1 else "title:" + label
                )
            owner_headers = class_nodes(template, "EnhancementsPts")
            for header in owner_headers:
                links = {link.get("href") for link in header.xpath(".//a[@href]")
                         if "/wh40k11ed/factions/" in urlparse(urljoin(self.url, link.get("href"))).path}
                if len(links) == 1:
                    raw_target = next(iter(links))
                    self.external_tooltips["#" + template.get("id")] = {
                        "sourceTitle": text(header), "rawTarget": raw_target,
                        "target": urljoin(self.url, raw_target),
                    }
        for template in self.main.xpath('.//*[starts-with(@id,"tooltip_content")]'):
            template.getparent().remove(template)
        for node in self.main.xpath('.//script|.//style'):
            node.getparent().remove(node)
        self.anchors = {node.get("id") for node in self.main.iter() if node.get("id")}
        self.heading_hierarchy = {node: hierarchy(node) for node in self.main.iter()
                                  if node.tag in ("h2", "h3") or has_class(node, "str11Name") or has_class(node, "abName")}
        first_rule = next((node for node in self.main.iter()
                           if (node.tag in ("h2", "h3") or has_class(node, "str11Name") or has_class(node, "abName"))
                           and CODE.search(text(node))), None)
        if first_rule is None:
            raise ValueError(f"No numbered rules found in {capture['file']}")
        # The accepted corpus starts at the first rules owner. The table of
        # contents, publication metadata and introductory navigation are not
        # rules-owned facts or player-visible rule-reference occurrences.
        branch = first_rule
        while branch is not self.main:
            parent = branch.getparent()
            while branch.getprevious() is not None:
                parent.remove(branch.getprevious())
            parent.text = None
            branch = parent

    def references(self, node, internal_only=False):
        result = []
        for element in node.iter():
            selector = element.get("data-tooltip-content")
            if selector:
                external = self.external_tooltips.get(selector)
                if external:
                    if not internal_only:
                        result.append({
                            "kind": "tooltip", "label": text(element), "selector": selector,
                            "resolved": True, "identity": "external:" + external["target"],
                            "internalCore": False, **external,
                        })
                else:
                    identity = self.tooltips.get(selector)
                    result.append({
                        "kind": "tooltip", "label": text(element), "selector": selector,
                        "resolved": bool(identity), "identity": identity,
                    })
            raw_target = element.get("href") if element.tag == "a" else None
            if raw_target:
                target = urljoin(self.url, raw_target)
                parsed = urlparse(target)
                internal_core = parsed.hostname == "wahapedia.ru" and parsed.path in (
                    "/wh40k11ed/the-rules/core-rules/", "/wh40k11ed/the-rules/rules-appendix/"
                )
                if internal_core or not internal_only:
                    result.append({
                        "kind": "href", "label": text(element), "rawTarget": raw_target,
                        "target": target, "internalCore": internal_core,
                    })
        return result

    def content(self, node):
        lists = [{"ordered": item.tag == "ol", "items": [text(li) for li in item if li.tag == "li"]}
                 for item in node.xpath(".//ul|.//ol")]
        tables = [[text(cell) for cell in row if cell.tag in ("td", "th")]
                  for row in node.xpath(".//tr")]
        result = {
            "text": text(node), "lists": lists, "tables": tables,
            "notes": [text(item) for item in class_nodes(node, "blackComment")],
            "examples": [text(item) for item in class_nodes(node, "redExample")],
            "references": self.references(node),
        }
        result["contentHash"] = sha256(canonical(result))
        return result


def hierarchy(heading):
    # Heading levels vary between chapters. The captured part/chapter markers,
    # rather than h2 or a missing subsection number, establish ownership.
    part = None
    chapter = None
    for item in heading.xpath('preceding::*[(self::h1 or self::h2 or self::h3) and @id]'):
        if has_class(item, "super_header"):
            part, chapter = item, None
        elif has_class(item, "outline_header"):
            chapter = item
    return [{"id": item.get("id"), "title": text(item)}
            for item in (part, chapter) if item is not None]


def numbered_scopes(page: Page, declarations: dict):
    """The single source-owner enumeration shared by corpus and candidate views."""
    extra = {entry["anchor"]: entry for entry in declarations["unnumberedRules"]}
    independent_anchors = set(extra)
    independent_anchors.update(item["anchor"] for item in declarations["universalRulesUpdates"])
    independent_anchors.update(page.boundary_nodes)
    candidates = []
    for node in page.main.iter():
        if not (node.tag in ("h2", "h3") or has_class(node, "str11Name") or has_class(node, "abName")):
            continue
        label = text(node)
        codes = CODE.findall(label)
        boundary = page.boundary_nodes.get(node)
        declared = ({"code": boundary["internalCode"], "title": boundary["headingText"], **boundary}
                    if boundary else extra.get(node.get("id")) if page.id == "core" else None)
        if not codes and declared:
            codes = [declared["code"]]
        if codes:
            candidates.append((node, label, codes, declared))
    for order, (heading, label, codes, declared) in enumerate(candidates, 1):
        scope = source_wrapper(heading, independent_anchors)
        if heading in page.boundary_nodes:
            declaration = page.boundary_nodes[heading]
            body = normalize(text(scope)[len(text(heading)):])
            if body != declaration["bodyQuote"] or sha256(body) != declaration["bodyQuoteSha256"]:
                raise ValueError("Changed authored source-boundary body: " + declaration["xpath"])
        yield {"heading": heading, "label": label, "codes": codes, "declared": declared,
               "sourceOrder": order, "scope": scope}


def numbered_units(page: Page, declarations: dict):
    units = {}
    for entry in numbered_scopes(page, declarations):
        heading, label, codes, declared, order = (entry[key] for key in
            ("heading", "label", "codes", "declared", "sourceOrder"))
        content = page.content(entry["scope"])
        subheadings = [node for node in entry["scope"].iter()
                       if node.tag in ("h2", "h3") and not CODE.search(text(node))
                       and not has_class(node, "outline_header") and node is not entry["scope"][0]]
        subsection_nodes = set(subheadings)
        subsections = [{"title": text(node), "anchor": node.get("id"),
                        "orderWithinOwner": index, "body": page.content(heading_body(node, subsection_nodes))}
                       for index, node in enumerate(subheadings, 1)]
        for code in dict.fromkeys(codes):
            title = normalize(CODE.sub("", label)).strip(" /")
            if declared:
                title = declared["title"]
            unit = units.setdefault(code, {
                "kind": "NUMBERED_RULE", "id": f"waha-{page.id}-rule-{code.replace('.', '-')}",
                "code": code, "page": page.id, "pageUrl": page.url,
                "firstSourceOrder": order, "occurrences": [],
            })
            occurrence = {
                "sourceOrder": order, "stableDomId": heading.get("id"),
                "headingHierarchy": page.heading_hierarchy[heading], "title": title,
                "content": content,
                "subsections": subsections,
                "ownedHtml": html.tostring(entry["scope"], encoding="unicode", method="html"),
                "ownerHeading": {"tag": heading.tag, "anchor": heading.get("id"), "label": label},
            }
            if declared and declared.get("citationSource"):
                occurrence["authoredBoundary"] = deepcopy(declared)
            if declared and declared.get("sourceCode"):
                unit["sourceCode"] = declared["sourceCode"]
                occurrence["sourceCode"] = declared["sourceCode"]
            unit["occurrences"].append(occurrence)
    for unit in units.values():
        unit["contentHash"] = sha256(canonical(unit["occurrences"]))
    return list(units.values())


def faq_units(page: Page, declarations: dict):
    accepted = {(item["sourceHeading"], item["identityFingerprint"]): item
                for item in declarations["faqs"] if item["page"] == page.id}
    units = []
    for order, node in enumerate(class_nodes(page.main, "faq"), 1):
        key = (faq_source_heading(node), identity_fingerprint(text(node)))
        declaration = accepted.get(key)
        if declaration is None:
            raise ValueError(f"Unreviewed FAQ identity on {page.id}: {text(node)[:150]}")
        content = page.content(node)
        units.append({
            "kind": "FAQ", "id": declaration["sourceId"], "page": page.id,
            "pageUrl": page.url, "sourceOrder": order,
            "ownerCode": declaration["ownerCode"], "content": content,
            "contentHash": sha256(canonical(content)),
        })
    actual = [unit["id"] for unit in units]
    expected = [item["sourceId"] for item in accepted.values()]
    if len(set(actual)) != len(actual) or set(actual) != set(expected):
        raise ValueError(f"Missing or duplicate accepted FAQ identity on {page.id}")
    return units


def errata_units(page: Page, declarations: dict):
    accepted = {normalize(item["label"]): item for item in declarations["errata"] if item["page"] == page.id}
    units = []
    for order, node in enumerate(class_nodes(page.main, "errata"), 1):
        previous = node.getprevious()
        if previous is None or not has_class(previous, "errata_H"):
            raise ValueError(f"Unlabelled source erratum on {page.id}")
        label = text(previous)
        declaration = accepted.get(label)
        if declaration is None:
            raise ValueError(f"Unreviewed erratum identity: {label}")
        content = page.content(node)
        units.append({
            "kind": "ERRATUM", "id": declaration["sourceId"], "page": page.id,
            "pageUrl": page.url, "sourceOrder": order, "ownerCode": declaration["ownerCode"],
            "label": label, "content": content,
            "contentHash": sha256(canonical({"label": label, "content": content})),
        })
    if {unit["id"] for unit in units} != {item["sourceId"] for item in accepted.values()}:
        raise ValueError(f"Missing accepted erratum on {page.id}")
    return units


def universal_updates(page: Page, declarations: dict):
    units = []
    for declaration in declarations["universalRulesUpdates"]:
        if declaration["page"] != page.id:
            continue
        found = page.main.xpath('.//*[@id="' + declaration["anchor"] + '"]')
        if len(found) != 1:
            raise ValueError(f"Missing or duplicate URU anchor: {declaration['anchor']}")
        content = page.content(heading_body(found[0], {item["anchor"] for item in declarations["universalRulesUpdates"]}))
        units.append({
            "kind": "UNIVERSAL_RULE_UPDATE", "id": declaration["sourceId"],
            "page": page.id, "pageUrl": page.url, "sourceOrder": len(units) + 1,
            "stableDomId": declaration["anchor"], "title": declaration["title"],
            "content": content, "contentHash": sha256(canonical(content)),
        })
    return units


def counts(page):
    # Source tables/lists can be embedded in a numbered owner and have their own
    # FAQ owner. Inventory counts report physical page DOM below, not both scopes.
    return {
        "numbered": len(page["numbered"]), "faq": len(page["faqs"]),
        "errata": len(page["errata"]), "uru": len(page["universalRulesUpdates"]),
        "total": sum(len(page[field]) for field in PARTITIONS),
    }


def validate_identity_declarations(declarations):
    for field in ("faqs", "errata", "universalRulesUpdates"):
        entries = declarations[field]
        for key in ("sourceId", "canonicalId"):
            values = [item[key] for item in entries]
            if not all(values) or len(set(values)) != len(values):
                raise ValueError(f"Missing or duplicate {field} {key}")
    faq_keys = [(item["page"], item["sourceHeading"], item["identityFingerprint"])
                for item in declarations["faqs"]]
    if len(set(faq_keys)) != len(faq_keys):
        raise ValueError("Duplicate accepted FAQ source occurrence")
    for item in declarations["faqs"]:
        witnessed = "Q:" + item["question"] + "A:" + item["answer"]
        if not item["question"] or not item["answer"] or identity_fingerprint(witnessed) != item["identityFingerprint"]:
            raise ValueError(f"FAQ identity evidence mismatch: {item['sourceId']}")
    for field, key in (("errata", "label"), ("universalRulesUpdates", "anchor")):
        values = [(item["page"], item[key]) for item in declarations[field]]
        if len(set(values)) != len(values):
            raise ValueError(f"Duplicate accepted {field} source locator")
    extra = declarations["unnumberedRules"]
    if len({item["anchor"] for item in extra}) != len(extra):
        raise ValueError("Duplicate unnumbered source heading")


def structural_counts(page: Page):
    see_also = set()
    for note in class_nodes(page.main, "CornerSeeAlso"):
        see_also.update(note.xpath(".//li"))
    all_items = page.main.xpath(".//li")
    faq_tables = [table for table in page.main.xpath(".//table")
                  if any(has_class(parent, "faq") for parent in table.iterancestors())]
    return {
        "gameplayListItems": len([item for item in all_items if item not in see_also]),
        "seeAlsoItems": len(see_also),
        "tables": len(page.main.xpath(".//table")),
        "tableRows": len(page.main.xpath(".//tr")),
        "faqTableRows": sum(len(table.xpath(".//tr")) for table in faq_tables),
        "notes": len(class_nodes(page.main, "blackComment")),
        "examples": len(class_nodes(page.main, "redExample")),
        "referenceOccurrences": len(page.references(page.main, internal_only=True)),
    }


def build_corpus(source_dir: Path):
    capture = json.loads((source_dir / "capture.json").read_text("utf-8"))
    declarations = json.loads((source_dir / "source-identities.v1.json").read_text("utf-8"))
    if capture["schema"] != "waha-core-frozen-capture/v1" or declarations["schema"] != "waha-core-source-identities/v1":
        raise ValueError("Unknown frozen source input schema")
    validate_identity_declarations(declarations)
    pages = []
    documents = []
    for item in capture["sources"]:
        page = Page(item, source_dir)
        documents.append(page)
        result = {
            "id": page.id, "url": page.url, "rawSha256": item["rawSha256"], "rawBytes": item["rawBytes"],
            "numbered": numbered_units(page, declarations),
            "faqs": faq_units(page, declarations), "errata": errata_units(page, declarations),
            "universalRulesUpdates": universal_updates(page, declarations),
            "references": page.references(page.main, internal_only=True),
        }
        result["counts"] = {**counts(result), **structural_counts(page)}
        pages.append(result)
    if [page["id"] for page in pages] != ["core", "appendix"]:
        raise ValueError("Expected Core and Appendix captures in their accepted order")
    source_by_code = {}
    for page in pages:
        for unit in page["numbered"]:
            source_by_code.setdefault(unit["code"], []).append({
                "page": page["id"], "unitId": unit["id"], "contentHash": unit["contentHash"],
            })
    overlaps = sorted(code for code, owners in source_by_code.items() if len(owners) > 1)
    effective = {
        "counts": {
            "numbered": len(source_by_code), "faq": sum(len(page["faqs"]) for page in pages),
            "errata": sum(len(page["errata"]) for page in pages),
            "uru": sum(len(page["universalRulesUpdates"]) for page in pages),
            "total": len(source_by_code) + sum(len(page[field]) for page in pages for field in PARTITIONS[1:]),
            "numberedOverlap": len(overlaps),
        },
        "numberedOverlapCodes": overlaps,
        "numbered": [{"code": code, "sources": owners} for code, owners in sorted(source_by_code.items())],
        "faqIds": [unit["id"] for page in pages for unit in page["faqs"]],
        "errataIds": [unit["id"] for page in pages for unit in page["errata"]],
        "universalRulesUpdateIds": [unit["id"] for page in pages for unit in page["universalRulesUpdates"]],
    }
    anchors = {document.url: document.anchors for document in documents}
    unresolved = []
    for page in pages:
        for reference in page["references"]:
            if reference["kind"] == "tooltip" and not reference["resolved"]:
                unresolved.append({"page": page["id"], **reference})
            if reference["kind"] == "href":
                parsed = urlparse(reference["target"])
                target_page = parsed._replace(fragment="").geturl()
                if parsed.fragment and unquote(parsed.fragment) not in anchors.get(target_page, set()):
                    unresolved.append({"page": page["id"], **reference})
    corpus = {
        "schema": "waha-11e-core-corpus/v1", "normalization": NORMALIZATION,
        "pages": pages, "effective": effective, "sourceDiagnostics": {"unresolvedReferences": unresolved},
    }
    corpus["fingerprint"] = sha256(canonical(corpus))
    corpus_bytes = json_bytes(corpus)
    manifest = {
        "schema": "waha-11e-core-corpus-manifest/v1", "captureDate": capture["captureDate"],
        "sources": [{"id": item["id"], "url": item["url"], "rawBytes": item["rawBytes"],
                     "rawSha256": item["rawSha256"]} for item in capture["sources"]],
        "counts": {**{page["id"]: page["counts"] for page in pages}, "effective": effective["counts"]},
        "identityMapFile": "source-identities.v1.json",
        "identityMapSha256": sha256((source_dir / "source-identities.v1.json").read_bytes()),
        "sourceBoundaryMapFile": "source-boundaries.v1.json",
        "sourceBoundaryMapSha256": sha256((source_dir / "source-boundaries.v1.json").read_bytes()),
        "numberedOverlapCodes": overlaps, "corpusFingerprint": corpus["fingerprint"],
        "corpusFile": "waha-core-corpus.v1.json", "corpusFileSha256": sha256(corpus_bytes),
        "unresolvedReferences": unresolved,
    }
    return corpus, {"waha-core-corpus.v1.json": corpus_bytes, "waha-core-corpus.manifest.json": json_bytes(manifest)}


def json_bytes(value) -> bytes:
    return (json.dumps(value, ensure_ascii=False, indent=2) + "\n").encode("utf-8")


def source_outputs(source_dir: Path):
    corpus, outputs = build_corpus(source_dir)
    identities = json.loads((source_dir / "candidate-identities.v1.json").read_text("utf-8"))
    boundaries = json.loads((source_dir / "source-boundaries.v1.json").read_text("utf-8"))
    for declaration in boundaries["boundaries"]:
        if identities["rules"].get(declaration["internalCode"]) != declaration["canonicalId"]:
            raise ValueError("Authored source boundary has a different canonical identity: " + declaration["xpath"])
    declarations = json.loads((source_dir / "source-identities.v1.json").read_text("utf-8"))
    targets = set()
    rows = []
    for page in corpus["pages"]:
        for unit in page["numbered"]:
            node_ids = [entry["id"] for entry in identities.get("sourceNodes", {}).values()
                        if entry.get("code") == unit["code"]]
            ids = node_ids or [identities["rules"].get(unit["code"])]
            if not all(ids):
                raise ValueError("Unbound numbered source: " + unit["id"])
            targets.update(ids)
            rows.append({"sourceUnitId": unit["id"], "canonicalIds": ids,
                         "occurrences": len(unit["occurrences"])})
    for partition in ("faqs", "errata", "universalRulesUpdates"):
        for entry in declarations[partition]:
            targets.add(entry["canonicalId"])
    census = {"schema": "core-candidate-source-census/v1", "scope": "SOURCE_AND_CANDIDATE_ONLY",
              "notRuntimePublicationCoverage": True, "corpusFingerprint": corpus["fingerprint"],
              "counts": {**{page["id"]: page["counts"] for page in corpus["pages"]},
                         "effective": corpus["effective"]["counts"]},
              "numberedOwnership": rows, "canonicalTargetIds": sorted(targets),
              "subsectionHierarchy": [{"sourceUnitId": unit["id"], "ownerAnchor": occurrence["stableDomId"],
                  "sourceOrder": occurrence["sourceOrder"], "parentHierarchy": occurrence["headingHierarchy"],
                  "subsections": occurrence["subsections"]} for page in corpus["pages"]
                  for unit in page["numbered"] for occurrence in unit["occurrences"] if occurrence["subsections"]],
              "unresolvedReferences": corpus["sourceDiagnostics"]["unresolvedReferences"]}
    outputs["waha-core-corpus.census.json"] = json_bytes(census)
    return corpus, outputs


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    mode = parser.add_mutually_exclusive_group(required=True)
    mode.add_argument("--write", action="store_true")
    mode.add_argument("--check", action="store_true")
    parser.add_argument("--source-dir", type=Path, default=DEFAULT_SOURCE)
    parser.add_argument("--out", type=Path, help="Candidate-only output directory")
    args = parser.parse_args()
    source_dir = args.source_dir.resolve()
    output_dir = (args.out or source_dir).resolve()
    if output_dir.is_relative_to(ROOT) and output_dir != DEFAULT_SOURCE.resolve():
        raise SystemExit("Repository outputs are restricted to the new candidate source directory")
    corpus, outputs = source_outputs(source_dir)
    if args.write:
        output_dir.mkdir(parents=True, exist_ok=True)
    for name, expected in outputs.items():
        target = output_dir / name
        if args.check:
            if not target.exists() or target.read_bytes() != expected:
                display = target.relative_to(ROOT) if target.is_relative_to(ROOT) else target
                raise SystemExit(f"Stale {display}; rebuild with python books/core-rules/tools/build_waha_core_corpus.py --write")
        else:
            target.write_bytes(expected)
    print(json.dumps({"status": "PASS", "mode": "check" if args.check else "write",
                      "fingerprint": corpus["fingerprint"], "counts": corpus["effective"]["counts"]}))


if __name__ == "__main__":
    main()

"""Source-structure guards for presentation bindings, not a factual catalog."""
import hashlib
import json
import re
from pathlib import Path

from lxml import html

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
bindings = json.loads((HERE / "app-datasheet-bindings.json").read_text(encoding="utf-8"))
payload = json.loads((HERE / "generated/app-presentation.json").read_text(encoding="utf-8"))
cards = {card["id"]: card for card in payload["cards"]}

for binding in bindings["tableStructures"]:
    raw = (ROOT / binding["source"]["document"]).read_bytes()
    assert hashlib.sha256(raw).hexdigest() == binding["source"]["sha256"]
    tables = html.fromstring(raw.decode("utf-8")).xpath(binding["source"]["selector"])
    assert len(tables) == 1
    cells = {(ri, ci): cell for ri, row in enumerate(tables[0].xpath(".//tr"))
             for ci, cell in enumerate(row.xpath("./td|./th"))}
    assert len(cells) == len(binding["cells"])
    card = cards[binding["tableId"]]
    parent = cards[card["parentId"]]
    for item in binding["cells"]:
        _, row, column = item["fieldPath"].strip("/").split("/")
        source = cells[int(row), int(column)]
        assert item["rowSpan"] == int(source.get("rowspan", "1"))
        assert item["columnSpan"] == int(source.get("colspan", "1"))
        assert item["header"] == (source.tag == "th" or "background-color:" in source.get("style", ""))
        field = next(f for f in card["fields"] if f["source"]["path"] == item["fieldPath"])
        parent_field = next(f for f in parent["fields"] if f["id"] == field["id"])
        assert field == parent_field
        assert field["table"]["rowSpan"] == item["rowSpan"]
        assert field["table"]["columnSpan"] == item["columnSpan"]
        if "displayValue" in item:
            paragraphs = []
            for paragraph in source.xpath("./p"):
                markup = re.sub(r"<br\s*/?>", "\n", html.tostring(paragraph, encoding="unicode"), flags=re.I)
                paragraphs.append(re.sub(r"[^\S\n]+", " ", html.fromstring(markup).text_content()).strip())
            assert item["displayValue"] == "\n\n".join(paragraphs)
            assert re.sub(r"\s", "", field["value"]) == re.sub(r"\s", "", item["displayValue"])
            assert field["displayValue"] == item["displayValue"]

# Source section headings are independent of runtime attachment roles.
corpus = json.loads((ROOT / "books/chaos-space-marines/sources/waha-11e-current-2026-09-29/corpus.json").read_text(encoding="utf-8"))
identities = json.loads((HERE / "identity-bindings.json").read_text(encoding="utf-8"))["bindings"]
source_ids = {item["id"]: item["sourceEntityId"] for item in identities}
source_headings = {section["sourceId"]: section["title"].upper()
                   for unit in corpus["datasheets"] for section in unit["sections"]}
for declaration in json.loads((HERE / "roster-attachment-bindings.json").read_text(encoding="utf-8"))["declarations"]:
    card = cards[declaration["declarationId"]]
    heading = next(f for f in card["fields"] if f.get("presentation") == "heading")
    source_heading = source_headings[source_ids[declaration["declarationId"]]]
    assert heading["displayValue"] == {"LEADER": "Leader", "SUPPORT": "Support", "ATTACHED UNIT": "Attached Unit"}[source_heading]

print(json.dumps({"status": "PASS", "sourceTableStructures": len(bindings["tableStructures"]),
                  "boundCells": sum(len(b["cells"]) for b in bindings["tableStructures"])}))

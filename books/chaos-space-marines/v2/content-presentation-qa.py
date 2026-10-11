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

# Display headings retain the exact source role. Eligible recipients are untouched.
for declaration in json.loads((HERE / "roster-attachment-bindings.json").read_text(encoding="utf-8"))["declarations"]:
    card = cards[declaration["declarationId"]]
    heading = next(f for f in card["fields"] if f.get("presentation") == "heading")
    assert heading["displayValue"] == {"LEADER": "Leader", "SUPPORT": "Support"}[declaration["role"]]

print(json.dumps({"status": "PASS", "sourceTableStructures": len(bindings["tableStructures"]),
                  "boundCells": sum(len(b["cells"]) for b in bindings["tableStructures"])}))

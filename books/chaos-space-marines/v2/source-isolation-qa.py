"""Rebuild from a closed source-only tree with no legacy files or outputs."""
import copy
import json
import shutil
import tempfile
from pathlib import Path

from build import build, canonicalize, unique_index
from model_sources import validate_model_bindings

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
read = lambda path: json.loads(path.read_text(encoding="utf-8"))


def rejects(action):
    try:
        action()
    except (ValueError, AssertionError, KeyError):
        return
    raise AssertionError("Source-binding mutation was accepted")


def identity_controls():
    # Independent structural nodes may share source codes AND display titles.
    # Neither source order nor any display label is an identity/priority key.
    rows = [{"SOURCE_ENTITY_ID": "source-node-a", "ENTITY_TYPE": "WARGEAR_OPTION",
             "DISPLAY_NAME": "Shared label", "SOURCE_OWNER": "source-node-a",
             "SOURCE_DOCUMENT": "source.txt", "SOURCE_LOCATION": "anchor-a",
             "PROVENANCE_STATUS": "ACCEPTED_SECONDARY", "PAYLOAD": {"sourceCode": "09.01", "text": "Fact A"}},
            {"SOURCE_ENTITY_ID": "source-node-b", "ENTITY_TYPE": "WARGEAR_OPTION",
             "DISPLAY_NAME": "Shared label", "SOURCE_OWNER": "source-node-b",
             "SOURCE_DOCUMENT": "source.txt", "SOURCE_LOCATION": "anchor-b",
             "PROVENANCE_STATUS": "ACCEPTED_SECONDARY", "PAYLOAD": {"sourceCode": "09.01", "text": "Fact B"}}]
    registry = {"bindings": [{"sourceEntityId": row["SOURCE_ENTITY_ID"], "id": "canonical-" + str(number),
                              "kind": row["ENTITY_TYPE"], "ownerSourceId": None}
                             for number, row in enumerate(rows)]}
    run = lambda source, ids: canonicalize(source, ids, {"source.txt": {"sha256": "synthetic"}},
                                           {"tableOccurrences": [], "duplicateNotes": []}, {"datasheets": []})
    records, _ = run(rows, registry)
    assert len(records) == 2 and {record["data"]["text"] for record in records} == {"Fact A", "Fact B"}
    reverse, _ = run(list(reversed(rows)), registry)
    assert sorted(records, key=lambda value: value["id"]) == sorted(reverse, key=lambda value: value["id"])
    rejects(lambda: run([*rows, rows[0]], registry))
    duplicate = copy.deepcopy(registry)
    duplicate["bindings"][1]["id"] = duplicate["bindings"][0]["id"]
    rejects(lambda: run(rows, duplicate))
    missing = copy.deepcopy(registry)
    missing["bindings"][1]["ownerSourceId"] = "unbound-source"
    rejects(lambda: run(rows, missing))
    return 5


def main():
    expected = build()
    enrollment = read(HERE / "sources/enrollment.json")
    with tempfile.TemporaryDirectory(prefix="csm-v2-source-only-") as directory:
        isolated = Path(directory)
        for artifact in enrollment["artifacts"]:
            relative = artifact["path"]
            destination = isolated / relative
            destination.parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(ROOT / relative, destination)
        for path in HERE.rglob("*"):
            if path.is_file() and "generated" not in path.parts and path.suffix in {".py", ".json"}:
                destination = isolated / path.relative_to(ROOT)
                destination.parent.mkdir(parents=True, exist_ok=True)
                shutil.copyfile(path, destination)
        assert not (isolated / "books/chaos-space-marines/content").exists()
        assert not (isolated / "books/chaos-space-marines/scripts").exists()
        assert not (isolated / "books/chaos-space-marines/v2/generated").exists()
        assert not (isolated / "books/death-guard").exists()
        assert not (isolated / "books/adeptus-mechanicus").exists()
        assert build(isolated) == expected, "Closed source-only build differs"
        # Frozen byte enrollment rejects an altered source, rather than silently
        # filling a hole from a generated publication or a former PASS artifact.
        corrupt = isolated / enrollment["artifacts"][0]["path"]
        corrupt.write_bytes(corrupt.read_bytes() + b"\nMUTATED")
        rejects(lambda: build(isolated))
    corpus = read(ROOT / "books/chaos-space-marines/sources/waha-11e-current-2026-09-29/corpus.json")
    models = read(HERE / "model-bindings.json")
    for field, value in [("quantity", {"min": 99, "max": 99}), ("name", "Wrong member"), ("modelProfileSourceId", "unknown-profile")]:
        mutant = copy.deepcopy(models)
        mutant["datasheets"][0]["compositionMembers"][0][field] = value
        rejects(lambda: validate_model_bindings(ROOT, mutant, corpus))
    mutant = copy.deepcopy(models)
    mutant["datasheets"][0]["keywordBindings"][0]["keyword"] = "INVENTED"
    rejects(lambda: validate_model_bindings(ROOT, mutant, corpus))
    print(json.dumps({"status": "PASS", "closedSourceOnlyRebuild": "PASS", "legacyFactualReads": 0,
                      "legacyGeneratedDataAsAuthority": 0, "sourceHashMutationRejected": True,
                      "modelBindingMutationsRejected": 4, "identityControls": identity_controls()}))


if __name__ == "__main__":
    main()

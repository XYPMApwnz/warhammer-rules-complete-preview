from __future__ import annotations

import argparse
import json
import subprocess
import tempfile
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
REPO = ROOT.parents[1]
CONFIG = ROOT / "sources" / "bsdata-extract.config.json"
EXTRACTOR = REPO / "books" / "shared" / "tools" / "extract-bsdata-11e.mjs"
NODE = Path(r"C:\Users\denis\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe")
SNAPSHOT = ROOT / "sources" / "bsdata-space-marines-11e.json"
DATASHEETS = ROOT / "content" / "space-marines-codex-datasheets.en.json"
POINTS = ROOT / "content" / "space-marines-points.en.json"
ULTRAMARINES_LEGENDS = {
    "Chaplain Cassius", "Sergeant Chronus", "Sergeant Telion", "Tyrannic War Veterans"
}


def absolute_config(config: dict, folder: Path, faction: str) -> Path:
    source_dir = CONFIG.parent
    inputs = []
    for item in config["inputs"]:
        copied = dict(item)
        copied["path"] = str((source_dir / item["path"]).resolve())
        copied["role"] = "library"
        inputs.append(copied)
    faction_path = (REPO / "tmp" / "bsdata-wh40k-11e" / faction).resolve()
    inputs.insert(0, {"role": "faction", "path": str(faction_path)})
    seen = set()
    config["inputs"] = [item for item in inputs if not (item["path"] in seen or seen.add(item["path"]))]
    config["outputs"] = {
        "snapshot": "snapshot.json",
        "datasheets": "datasheets.json",
        "points": "points.json",
    }
    path = folder / "config.json"
    path.write_text(json.dumps(config, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return path


def extract(config: dict, folder: Path, faction: str) -> tuple[dict, dict, dict]:
    folder.mkdir(parents=True)
    path = absolute_config(config, folder, faction)
    subprocess.run([str(NODE), str(EXTRACTOR), str(path)], cwd=REPO, check=True)
    return tuple(json.loads((folder / name).read_text(encoding="utf-8")) for name in ("snapshot.json", "datasheets.json", "points.json"))


def build() -> tuple[dict, dict, dict]:
    config = json.loads(CONFIG.read_text(encoding="utf-8"))
    with tempfile.TemporaryDirectory(prefix="space-marines-bsdata-", dir=ROOT / "sources") as temp:
        temp = Path(temp)
        snapshot, datasheets, points = extract(json.loads(json.dumps(config)), temp / "space-marines", "Imperium - Space Marines.json")
        _, ultramarines, ultramarines_points = extract(json.loads(json.dumps(config)), temp / "ultramarines", "Imperium - Ultramarines.json")

    datasheets["legends"] = [item for item in datasheets["legends"] if item["title"] != "Ferren Areios"]
    extras = [item for item in ultramarines["legends"] if item["title"] in ULTRAMARINES_LEGENDS]
    if {item["title"] for item in extras} != ULTRAMARINES_LEGENDS:
        raise ValueError("Pinned Ultramarines catalogue does not contain all four official Legends supplements")
    datasheets["legends"] = sorted(datasheets["legends"] + extras, key=lambda item: item["title"])
    datasheets["audit"]["legends"] = len(datasheets["legends"])

    points["units"] = [item for item in points["units"] if item["title"] != "Ferren Areios"]
    extra_points = [item for item in ultramarines_points["units"] if item["title"] in ULTRAMARINES_LEGENDS]
    points["units"] = sorted(points["units"] + extra_points, key=lambda item: item["title"])
    points["audit"]["units"] = len(points["units"])
    return snapshot, datasheets, points


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    snapshot, datasheets, points = build()
    errors = []
    if len(datasheets["datasheets"]) != 83:
        errors.append("expected 83 codex datasheets")
    if len(datasheets["imperialArmour"]) != 1:
        errors.append("expected Thunderhawk Gunship as the sole current Imperial Armour datasheet")
    if len(datasheets["legends"]) != 75:
        errors.append(f"expected 75 official Legends datasheets, found {len(datasheets['legends'])}")
    if len(points["enhancements"]) != 85:
        errors.append(f"expected 85 enhancements across 22 detachments, found {len(points['enhancements'])}")
    if args.check:
        for path, value in ((SNAPSHOT, snapshot), (DATASHEETS, datasheets), (POINTS, points)):
            if not path.exists() or json.loads(path.read_text(encoding="utf-8")) != value:
                errors.append(f"{path.name} is stale")
    if errors:
        print("\n".join(errors))
        return 1
    if not args.check:
        for path, value in ((SNAPSHOT, snapshot), (DATASHEETS, datasheets), (POINTS, points)):
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        print("Wrote Space Marines BSData snapshot, datasheets and points")
    else:
        print("Space Marines BSData source layer is current")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

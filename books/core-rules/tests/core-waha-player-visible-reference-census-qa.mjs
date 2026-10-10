#!/usr/bin/env node
import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const sourceDir = path.resolve(here, "..", "sources", "waha-core-2026-09-25");
const corpusPath = path.join(sourceDir, "waha-core-corpus.v1.json");
const outputPath = path.join(sourceDir, "waha-core-player-visible-reference-census.v1.json");
const targetRoot = process.env.CORE_REPO_ROOT || path.resolve(here, "..", "..", "..");
const sha256 = (value) => crypto.createHash("sha256").update(value).digest("hex").toUpperCase();
const norm = (value) => String(value || "").toUpperCase().replace(/[^A-Z0-9]+/g, "");
const signature = (ref) => JSON.stringify({
  kind: ref.kind, label: ref.label, selector: ref.selector || null,
  rawTarget: ref.rawTarget || null, identity: ref.identity || null,
});

const titleCode = new Map([
  ["SAVEROLLS", "05.03"], ["HITROLL", "05.01"], ["WOUNDROLL", "05.02"],
  ["INFLICTDAMAGE", "05.04"], ["WHENMODIFYINGCHARACTERISTICS", "02.02.01"],
  ["IDENTICALATTACKS", "04.03.01"], ["MOVINGAMODELINASTRAIGHTLINE", "03.01"],
  ["ROTATINGAMODEL", "03.01"], ["SURGEMOVE", "21.02"], ["KEYWORDS", "02.05"],
  ["SELECTENHANCEMENTS", "25.04"],
]);
const sectionCode = new Map(Object.entries({
  "The-Battle-Round-1": "07.01", Stratagems: "15.01", Actions: "16.01",
  "Command-Phase": "08.01", "Starting-an-Action": "16.01", Objectives: "14.01",
  Transports: "18.01", Terrain: "13.01", "Monsters-and-Vehicles": "17.01",
  "Strategic-Reserves": "20.01", "Attack-Sequence": "05.01", "Making-Attacks": "04.01",
  "Core-Abilities": "24.01", "Attached-Units": "19.01", "Movement-Phase": "09.01",
  "Shooting-Phase": "10.01", "Charge-Phase": "11.01", "Fight-Phase": "12.01",
  Aircraft: "23.01", Moving: "03.01", "When-a-Unit-is-Selected-to-Fight": "12.04",
  Datasheets: "02.01",
}));
const expectedRepair = new Map([
  ["18.04.01", {
    canonicalId: "core-rule-18-04-01-rapid-disembark-and-limitations",
    readerPath: "books/core-rules/reader/transports.html#rule-18-04-01",
    currentState: "MISSING_CANONICAL_RECORD",
  }],
  ["22.03.01", {
    canonicalId: "core-rule-22-03-01-psychic-abilities-with-a-psychic-level",
    readerPath: "books/core-rules/reader/other-rules-abilities.html#rule-22-03-01",
    currentState: "MISSING_CANONICAL_RECORD",
  }],
  ["18.06", {
    canonicalId: "core-rule-18-06-assault-disembark-move",
    readerPath: "books/core-rules/reader/transports.html#rule-18-06",
    currentState: "IDENTITY_ONLY_NO_PLAYER_PROJECTION",
  }],
  ["18.07", {
    canonicalId: "core-rule-18-07-shock-disembark-move",
    readerPath: "books/core-rules/reader/transports.html#rule-18-07",
    currentState: "IDENTITY_ONLY_NO_PLAYER_PROJECTION",
  }],
]);

function referencesOf(content) {
  return Array.isArray(content?.references) ? content.references : [];
}
function ownerRows(page) {
  const rows = [];
  const add = (kind, unit) => {
    const occurrences = unit.occurrences || [{
      sourceOrder: unit.sourceOrder,
      occurrenceIndex: 0,
      title: unit.title || unit.label || unit.id,
      content: unit.content,
    }];
    for (let index = 0; index < occurrences.length; index += 1) {
      const occurrence = occurrences[index];
      referencesOf(occurrence.content).forEach((reference, referenceIndex) => rows.push({
        signature: signature(reference),
        sourceOwner: {
          kind, id: unit.id, code: unit.code || unit.ownerCode || null,
          title: occurrence.title || unit.title || unit.label || unit.id,
          sourceOrder: occurrence.sourceOrder,
          occurrenceIndex: occurrence.occurrenceIndex ?? index,
          referenceIndex,
        },
      }));
    }
  };
  page.numbered.forEach((unit) => add("NUMBERED_RULE", unit));
  page.faqs.forEach((unit) => add("FAQ", unit));
  page.errata.forEach((unit) => add("ERRATUM", unit));
  page.universalRulesUpdates.forEach((unit) => add("UNIVERSAL_RULE_UPDATE", unit));
  return rows;
}
function ownerSpecificity(row) {
  const codeDepth = (row.sourceOwner.code || "").split(".").filter(Boolean).length;
  return (row.sourceOwner.kind === "NUMBERED_RULE" ? 0 : 10) + codeDepth;
}
function intendedCodeOf(reference, sourceByAnchor) {
  if (reference.kind === "tooltip") {
    const identity = reference.identity || "";
    if (identity.startsWith("code:")) return identity.slice(5);
    const title = identity.startsWith("title:") ? identity.slice(6) : reference.label;
    if (/SUPPORT24\.23/i.test(title)) return "24.23";
    if (/LEADER24\.22/i.test(title)) return "24.22";
    const suffix = title.match(/(\d{2}\.\d{2}(?:\.\d{2})?)\s*$/);
    if (suffix) return suffix[1];
    return titleCode.get(norm(title)) || null;
  }
  if (reference.rawTarget === "/wh40k11ed/the-rules/core-rules/#Assault-") return "24.10";
  const decoded = decodeURIComponent(String(reference.rawTarget || "").split("#")[1] || "");
  const exact = sourceByAnchor.get(decoded) || [];
  const codes = [...new Set(exact.map((unit) => unit.code).filter(Boolean))];
  if (codes.length === 1) return codes[0];
  return sectionCode.get(decoded) || null;
}
function resolveCanonical(catalog, intendedCode, reference) {
  const anchor=decodeURIComponent(String(reference.rawTarget||'').split('#')[1]||'');
  const exact=anchor&&catalog.getByAnchor(anchor);
  if(exact)return exact;
  const isSupport = intendedCode === "24.23" &&
    /SUPPORT/i.test(String(reference.label || "") + " " + String(reference.identity || ""));
  return isSupport ? catalog.getById("core-support") : catalog.getByCode(intendedCode);
}
function readerAnchorExists(readerPath) {
  const parts = readerPath.split("#");
  const htmlPath = path.join(targetRoot, parts[0]);
  if (!fs.existsSync(htmlPath)) return false;
  if (!parts[1]) return true;
  const html = fs.readFileSync(htmlPath, "utf8");
  return html.includes('id="' + parts[1] + '"') || html.includes('name="' + parts[1] + '"');
}

export async function buildCensus() {
  const corpusRaw = fs.readFileSync(corpusPath);
  const corpus = JSON.parse(corpusRaw);
  assert.equal(sha256(corpusRaw), "7761005215C03F9D0E0A5BC217894F8605662FC41F04052150FF73218A3D588E");
  assert.equal(corpus.fingerprint, "7AD0124845D23DB5CAADEE077732F8BDB6ECD9B2D713E6977F7917BBE0B14D5F");
  const corePage = corpus.pages.find((page) => page.id === "core");
  const appendixPage = corpus.pages.find((page) => page.id === "appendix");
  assert.ok(corePage && appendixPage);
  const catalogModule = await import(pathToFileURL(path.join(targetRoot,
    "books/core-rules/content/effective-core-catalog.mjs")).href);
  const catalog = catalogModule.createEffectiveCoreCatalog();
  const glossary = JSON.parse(fs.readFileSync(path.join(targetRoot,
    "glossary/v2/generated/index.en.json"), "utf8"));
  const v2ById = new Map(glossary.entries.filter((entry) => entry.domain === "CORE")
    .map((entry) => [entry.id, entry]));

  const sourceByAnchor = new Map();
  for (const page of [corePage, appendixPage]) {
    for (const unit of [...page.numbered, ...page.faqs, ...page.errata, ...page.universalRulesUpdates]) {
      const occurrences = unit.occurrences || [unit];
      for (const occurrence of occurrences) {
        if (!occurrence.stableDomId) continue;
        const bucket = sourceByAnchor.get(occurrence.stableDomId) || [];
        bucket.push(unit);
        sourceByAnchor.set(occurrence.stableDomId, bucket);
      }
    }
  }

  const entries = [];
  for (const [sourcePage, page] of [["core", corePage], ["appendix", appendixPage]]) {
    const candidatesBySignature = new Map();
    for (const candidate of ownerRows(page)) {
      const bucket = candidatesBySignature.get(candidate.signature) || [];
      bucket.push(candidate);
      candidatesBySignature.set(candidate.signature, bucket);
    }
    for (const bucket of candidatesBySignature.values()) bucket.sort((a, b) =>
      ownerSpecificity(b) - ownerSpecificity(a) ||
      a.sourceOwner.sourceOrder - b.sourceOwner.sourceOrder ||
      a.sourceOwner.occurrenceIndex - b.sourceOwner.occurrenceIndex ||
      a.sourceOwner.referenceIndex - b.sourceOwner.referenceIndex);

    for (let pageOccurrence = 0; pageOccurrence < page.references.length; pageOccurrence += 1) {
      const reference = page.references[pageOccurrence];
      const candidates = candidatesBySignature.get(signature(reference)) || [];
      const chosen = candidates[0]?.sourceOwner || {
        kind: "PAGE_SCOPE", id: "waha-" + sourcePage + "-page", code: null,
        title: page.id, sourceOrder: null, occurrenceIndex: null,
        referenceIndex: pageOccurrence,
      };
      const intendedCode = intendedCodeOf(reference, sourceByAnchor);
      assert.ok(intendedCode, "No intended code for " + sourcePage + " reference " +
        pageOccurrence + ": " + JSON.stringify(reference));
      const repair = expectedRepair.get(intendedCode);
      const canonical = resolveCanonical(catalog, intendedCode, reference);
      const canonicalId = canonical?.id || repair?.canonicalId || null;
      assert.ok(canonicalId, "No canonical ID for intended code " + intendedCode);
      if (repair) assert.equal(canonicalId, repair.canonicalId);
      const playerV2Id = "core::" + canonicalId;
      const playerReaderPath = canonical?.fullRulePath || repair?.readerPath || null;
      const defect = reference.rawTarget === "/wh40k11ed/the-rules/core-rules/#Assault-";
      const status = defect ? "KNOWN_SOURCE_NAVIGATION_DEFECT_RESOLVED" : "RESOLVED_PLAYER_NAVIGABLE";
      if (status === "RESOLVED_PLAYER_NAVIGABLE" || defect) {
        assert.ok(canonical);
        assert.ok(v2ById.has(playerV2Id), "Missing V2 entry " + playerV2Id);
        assert.ok(playerReaderPath && readerAnchorExists(playerReaderPath),
          "Missing Reader target " + playerReaderPath);
      }
      entries.push({
        censusIndex: entries.length + 1,
        sourcePage,
        sourceUnitId: chosen.id,
        sourceUnitOccurrenceIndex: chosen.occurrenceIndex,
        sourceOwner: chosen,
        sourceOwnerCandidates: [...new Map(candidates.map((candidate) => [
          [candidate.sourceOwner.kind, candidate.sourceOwner.id,
            candidate.sourceOwner.sourceOrder, candidate.sourceOwner.occurrenceIndex].join("|"),
          candidate.sourceOwner,
        ])).values()],
        sourceOccurrence: {
          pageReferenceIndex: pageOccurrence, kind: reference.kind, label: reference.label,
          selector: reference.selector || null, rawTarget: reference.rawTarget || null,
          identity: reference.identity || null,
        },
        intendedCode, canonicalId, playerV2Id, playerReaderPath, status,
        currentState: "PLAYER_NAVIGABLE",
      });
    }
  }

  assert.equal(entries.length, 1087);
  const byStatus = Object.fromEntries([...new Set(entries.map((entry) => entry.status))]
    .sort().map((status) => [status, entries.filter((entry) => entry.status === status).length]));
  assert.deepEqual(byStatus, {
    KNOWN_SOURCE_NAVIGATION_DEFECT_RESOLVED: 1,
    RESOLVED_PLAYER_NAVIGABLE: 1086,
  });
  const expectedRows = entries.filter((entry) => entry.status === "EXPECTED_AFTER_CATALOG_REPAIR");
  assert.equal(expectedRows.length, 0);

  const defectRows = entries.filter((entry) =>
    entry.status === "KNOWN_SOURCE_NAVIGATION_DEFECT_RESOLVED");
  assert.equal(defectRows.length, 1);
  const defect = defectRows[0];
  assert.equal(defect.sourceOwner.id, "waha-core-rule-24-23");
  assert.equal(defect.sourceOwner.sourceOrder, 162);
  assert.equal(defect.sourceOccurrence.label, "[DEVASTATING WOUNDS]");
  assert.equal(defect.intendedCode, "24.10");
  assert.equal(defect.canonicalId, "core-devastating-wounds");
  assert.equal(defect.playerV2Id, "core::core-devastating-wounds");
  const sourceTitleMatches = [...corePage.numbered, ...appendixPage.numbered]
    .filter((unit) => (unit.occurrences || [])
      .some((occurrence) => norm(occurrence.title) === "DEVASTATINGWOUNDS"));
  assert.equal(sourceTitleMatches.length, 1);
  assert.equal(sourceTitleMatches[0].id, "waha-core-rule-24-10");
  assert.equal(catalog.records.filter((record) => record.id === "core-devastating-wounds").length, 1);
  assert.equal(glossary.entries.filter((entry) =>
    entry.id === "core::core-devastating-wounds").length, 1);

  return {
    schema: "waha-core-player-visible-reference-census.v1",
    generatedFrom: {
      targetHead: null,
      corpusFingerprint: corpus.fingerprint,
      corpusSha256: sha256(corpusRaw),
      sourceReferenceCounts: {
        core: corePage.references.length, appendix: appendixPage.references.length,
        total: entries.length,
      },
      sourceOwnerResolution: "MOST_SPECIFIC_CAPTURED_CONTENT_OWNER_WITH_ALL_CANDIDATES_RETAINED",
    },
    counts: {
      total: entries.length, byStatus,
      uniqueReferenceEdges: 925,
      currentlyCanonicalResolved: entries.filter((entry) =>
        entry.currentState !== "MISSING_CANONICAL_RECORD").length,
      currentlyPlayerNavigable: entries.filter((entry) =>
        entry.status === "RESOLVED_PLAYER_NAVIGABLE" ||
        entry.status === "KNOWN_SOURCE_NAVIGATION_DEFECT_RESOLVED").length,
      expectedAfterCatalogRepair: expectedRows.length,
      capturedContentOwner: entries.filter((entry) =>
        entry.sourceOwner.kind !== "PAGE_SCOPE").length,
      pageScopedNavigationOrQuickReference: entries.filter((entry) =>
        entry.sourceOwner.kind === "PAGE_SCOPE").length,
    },
    expectedAfterCatalogRepair: [],
    knownSourceNavigationDefects: [{
      rawTarget: "/wh40k11ed/the-rules/core-rules/#Assault-",
      label: "[DEVASTATING WOUNDS]", occurrenceCount: 1,
      adjudication: "STRICT_UNIQUE_TARGET_RESOLUTION",
      sourceRecordId: "waha-core-rule-24-10", intendedCode: "24.10",
      canonicalId: "core-devastating-wounds",
      playerV2Id: "core::core-devastating-wounds",
      playerReaderPath: "books/core-rules/reader/core-abilities.html#rule-24-10",
      status: "KNOWN_SOURCE_NAVIGATION_DEFECT_RESOLVED",
    }],
    entries,
  };
}

const census = await buildCensus();
if (process.argv.includes("--write")) {
  fs.writeFileSync(outputPath, JSON.stringify(census, null, 2) + "\n");
  console.log("WROTE " + outputPath);
} else {
  assert.ok(fs.existsSync(outputPath), "Missing census JSON: run " +
    path.basename(process.argv[1]) + " --write");
  const committed = JSON.parse(fs.readFileSync(outputPath, "utf8"));
  assert.deepEqual(committed, census);
  console.log("PASS: " + census.counts.total + " references; " +
    JSON.stringify(census.counts.byStatus));
}

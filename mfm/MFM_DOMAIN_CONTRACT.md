# MFM factual domain contract

The current Warhammer 40,000 11th Edition Munitorum Field Manual flows through one factual boundary:

`accepted official version-scoped MFM captures → explicit canonical MFM identities and facts → createEffectiveMfmCatalog() → future consumers`

The historical nine-faction v1.4 registry and the later scoped v1.5/v1.6 registries preserve distinct accepted snapshots. The active registry selects the accepted version per faction; it does not relabel older facts. Two separately enrolled, exact-unit v1.5 captures own the scoped cross-faction Khorne Berzerkers and Rubric Marines dependencies required by Chaos Space Marines; they do not enroll World Eaters or Thousand Sons as supported Army Books. The identity registry owns only persistent opaque canonical IDs and exact bindings to accepted source locators. Display labels and prose never generate identities. Missing, duplicate, renamed, or otherwise unmatched source locators fail closed and require explicit identity adjudication.

Canonical record classes are explicit faction pricing groups, unit references, unit point records with model-count schedules, paid upgrades, Leader eligibility, Support eligibility, Detachments with Detachment Points and Force Disposition references, Enhancement costs, and qualifier records. Every record retains the official source ID, version-specific fingerprint, authority, cutoff, currentness, and exact source locator.

`CURRENT` and `LEGENDS` are explicit unit-price and relation statuses. The default effective catalog includes only current records. `CURRENT_AND_LEGENDS` includes both while preserving each record's status. Detachment, Enhancement, qualifier, and Force Disposition assignment facts are current MFM facts and are common to both catalog scopes.

MFM owns each Detachment's assignment to a stable opaque `mfm-force-disposition-*` reference. Missions owns Force Disposition concepts, mission matrices, and layout semantics. The binding registry links those two identity spaces explicitly; neither domain copies the other's facts.

Cross-domain bindings are declared in the accepted version's `mfm/content/mfm-*-army-mission-bindings.json` (or the historical `mfm-army-mission-bindings.json`). Every supported MFM unit reference has either an explicit Army canonical unit ID or an explicit `REFERENCE_ONLY` disposition. Detachment, Enhancement and qualifier-owner bindings also allow `bindingStatus: REFERENCE_ONLY` with a required `reason` and no Army identity fields. Omitted status retains the historical BOUND semantics. Unresolved MFM facts retain their own identity, price, MFM parent, qualifiers and provenance; they are excluded from active Army points/qualifier projection and exposed through `referenceOnlyOwnerRecords`. An unresolved parent cannot support a resolved child. Counts distinguish resolved bindings from optional `*ReferenceOnly` counts. No title-based resolution occurs. The five MFM Force Disposition references have opaque persistent MFM IDs and explicit links to the five Mission Force Disposition IDs; no source label, display title, or slug generates a factual cross-domain identity.

### Conditional role replacement compatibility

Existing `relationAdjudications` may use `decision: CONDITIONAL_ROLE_REPLACEMENT`, with role LEADER or SUPPORT and the existing exact source/target reference fields. The two records must have the same owner and targets, complementary `roleCondition.expectedPresent` values, and identical condition provenance. The supported condition is `{kind: ARMY_UNIT_PRESENT, unitReferenceId, expectedPresent}`: Leader requires false, Support requires true. `provenance.armyRule` records the exact rule's `canonicalRuleId`, `armyBookId`, `ownerUnitId`, `triggerUnitId`, `sourceId`, `sourcePath`, SHA-256, `sourceLocator` and full `sourceText`; owner and trigger must match confirmed same-book unit bindings. The producer verifies the condition artifact's bytes. Canonical eligibility records retain `roleCondition`, `roleConditionProvenance` and the trigger reference; ordinary unconditional records retain their previous shape.

The accepted Space Marines source assigns Captain of the Honour Guard to Cato Sicarius: Marneus Calgar anywhere in the army replaces Cato's Leader with Support while retaining the same targets. Victrix Honour Guard is the target, not the owner or trigger. `relationEdges({effectiveUnitIds, presentUnitIds})` uses the explicit complete army presence list to evaluate conditional roles. `effectiveUnitIds` is catalog coverage, not physical army composition. Missing presence context fails explicitly instead of implying absence or emitting two unconditional roles. This contract extension does not enroll SM v1.6, activate new bridges, or implement a roster consumer for the new Space Marines book.

### Observation and publication dates

For v1.6, `observedAt` and `verifiedAt` are actual ISO dates; observation must not follow verification, and `currentnessCutoff` equals the verification date. There is no fixed 14 October observation requirement. An optional raw `capturedAt` timestamp must agree with the observation date. A known `sourceUpdatedAt` and `currentnessEvidence.downloadsUpdatedAt` describe publication/list updates independently and cannot postdate verification. Known publication metadata is preserved through canonical provenance and Army source metadata. An unknown publication/effective date is not inferred from a download-list date; `effectiveDate` remains null for this accepted contract. A catalog's cutoff must cover all of its source snapshots. Historical v1.4/v1.5 acceptance and query cutoffs remain supported.

Current MFM is the effective owner of Leader and Support eligibility. When a structurally valid current MFM relation conflicts with a Faction Pack, the MFM relation remains effective and the Faction Pack evidence is retained as conflict provenance. Huron Blackheart follows this rule: the four current MFM targets are effective and Masters of the Maelstrom remains recorded only as conflicting official evidence. When the current MFM relation is structurally malformed, it is preserved without heuristic parsing and an accepted official Faction Pack may provide an explicitly enumerated fallback. The historical v1.4 Marneus Calgar adjudication follows this rule: its fused raw target and 13 exact Faction Pack fallback targets remain in that historical registry. The native v1.6 snapshot instead retains its own complete current targets without reapplying that historical repair.

This foundation does not migrate Army Book, roster, Missions, Glossary, or UI consumers. Its records expose stable IDs, labels, types, references, factual values, and provenance for future consumer migrations and Glossary indexing.

### Native Space Marines v1.6 enrollment (20 October 2026)

The active Space Marines faction binding now uses the separately frozen official v1.6 capture at `mfm/sources/v1.6/space-marines.json`: 87 CURRENT priced units, 123 schedules / 160 rows, 22 Detachments (including Deathwatch Support), 57 Enhancement/Upgrade costs, and eight paid options. Its accepted raw HTML and source-ingestion fingerprints are retained. This is enrollment of an already reviewed capture; the standalone six-faction v1.5 live producer was not run. The old `v1.6-scoped-six` sourceVersion remains the registry-format identifier; it is not a claim that only six faction sources are now v1.6.

`historicalSourceBindings` is an optional explicit continuation of the existing faction binding format. Each entry must refer to a distinct, independently frozen source for an already active faction, with exactly `acceptedStatuses: ["LEGENDS"]`, `includeDetachments: false`, and no Detachment bindings. The producer verifies the full original capture before selecting that status partition. Historical source snapshots carry `historical: true` and `statusScope: ["LEGENDS"]`. Historical point records cannot be CURRENT. Thus the 76 Space Marines LEGENDS prices and relations retain their original v1.4 identities, source fingerprint and September observation; they are never relabelled as verified v1.6 facts. CURRENT projection excludes them. CURRENT_AND_LEGENDS exposes them with their original status and provenance.

Native Army bindings are independently reviewed against persistent book-owned source identities. Unknown current references remain REFERENCE_ONLY and cannot silently acquire Army IDs. The legacy Space Marines builder is not an input or a compatibility requirement for this native path. Existing v1.4/v1.5 source registries remain independently queryable historical snapshots. Other faction sources and identities are unchanged.

### Native Space Marines owner boundary

The explicit `armyBookBindings` dictionary identifies factual owners, not Home
registrations. Its declared count must equal its actual identity set. Deathwatch
Support and Beacon Angelis therefore bind to their existing `deathwatch` source
owner, independently of the 21 Space Marines Detachments and 56 SM items. This
does not register another Army Book or manufacture Deathwatch Datasheets.

The native Army projection excludes historical snapshots when selecting current
source metadata. `relationEdges` remains strict without army presence by default;
native factual consumers may explicitly set `allowUnresolvedConditions: true`
to obtain unconditional edges only while retaining the conditional central
declarations separately. This option never assumes a conditional role is active.

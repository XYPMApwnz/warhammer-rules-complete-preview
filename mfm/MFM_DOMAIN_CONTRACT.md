# MFM factual domain contract

The current Warhammer 40,000 11th Edition Munitorum Field Manual flows through one factual boundary:

`accepted official MFM v1.4 captures → explicit canonical MFM identities and facts → createEffectiveMfmCatalog() → future consumers`

The nine enrolled `official-mfm-v1.4.json` captures own current MFM facts for the supported Army Books. Two separately enrolled, exact-unit v1.5 captures own the scoped cross-faction Khorne Berzerkers and Rubric Marines dependencies required by Chaos Space Marines; they do not enroll World Eaters or Thousand Sons as supported Army Books. The identity registry owns only persistent opaque canonical IDs and exact bindings to accepted source locators. Display labels and prose never generate identities. Missing, duplicate, renamed, or otherwise unmatched source locators fail closed and require explicit identity adjudication.

Canonical record classes are explicit faction pricing groups, unit references, unit point records with model-count schedules, paid upgrades, Leader eligibility, Support eligibility, Detachments with Detachment Points and Force Disposition references, Enhancement costs, and qualifier records. Every record retains the official source ID, v1.4 fingerprint, authority, cutoff, currentness, and exact source locator.

`CURRENT` and `LEGENDS` are explicit unit-price and relation statuses. The default effective catalog includes only current records. `CURRENT_AND_LEGENDS` includes both while preserving each record's status. Detachment, Enhancement, qualifier, and Force Disposition assignment facts are current MFM facts and are common to both catalog scopes.

MFM owns each Detachment's assignment to a stable opaque `mfm-force-disposition-*` reference. Missions owns Force Disposition concepts, mission matrices, and layout semantics. The binding registry links those two identity spaces explicitly; neither domain copies the other's facts.

Cross-domain bindings are declared in `mfm/content/mfm-army-mission-bindings.json`. Every supported MFM unit reference has either an explicit Army canonical unit ID or an explicit `REFERENCE_ONLY` disposition. Every MFM Detachment and scoped Enhancement has an explicit Army canonical ID. Qualifier records point to their explicit Army owner. The five MFM Force Disposition references have opaque persistent MFM IDs and explicit links to the five Mission Force Disposition IDs; no source label, display title, or slug generates a factual cross-domain identity.

Current MFM is the effective owner of Leader and Support eligibility. When a structurally valid current MFM relation conflicts with a Faction Pack, the MFM relation remains effective and the Faction Pack evidence is retained as conflict provenance. Huron Blackheart follows this rule: the four current MFM targets are effective and Masters of the Maelstrom remains recorded only as conflicting official evidence. When the current MFM relation is structurally malformed, it is preserved without heuristic parsing and an accepted official Faction Pack may provide an explicitly enumerated fallback. Marneus Calgar follows this rule: the fused raw target remains preserved, while the 13 exact Space Marines Faction Pack targets are effective with both source identities and fingerprints attached.

This foundation does not migrate Army Book, roster, Missions, Glossary, or UI consumers. Its records expose stable IDs, labels, types, references, factual values, and provenance for future consumer migrations and Glossary indexing.

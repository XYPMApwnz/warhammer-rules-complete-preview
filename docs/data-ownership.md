# Data ownership

## Source roles

`book.config.json` source entries define build input contracts. A referenced source can be `CANONICAL_FACTUAL`, `PROVENANCE`, `PRESENTATION`, or `EVIDENCE`. Only an explicitly identified `CANONICAL_FACTUAL` source owns gameplay facts.

For standard Datasheet facts, including profiles, abilities, weapons, keywords, and relations, the configured Codex Datasheet source is normally canonical. Existing config-owned overrides remain canonical for the fields they override. Manifests, transcripts, evidence captures, images, presentation metadata, and generated presentation assets are not automatically factual owners.

## Production truth

Reviewed tracked canonical factual sources and explicit config-owned overrides are production truth. Existing builders consume these contracts and produce runtime derivatives.

## Importers and promotion

Importers parse external sources and produce candidate data. They are not production factual owners. Import does not promote data and must not overwrite reviewed canonical files. An accepted promotion is a focused, reviewed Git patch to canonical tracked data.

## Generated output

Reader HTML, target data, roster data, points data, and generated inverse relations are derivatives, not factual owners.

## Historical reproducibility

Historical importer reproducibility is useful forensic evidence, but unavailable historical inputs do not block maintenance of reviewed current production facts.

## Identity

Canonical repairs and candidate comparisons use stable identities where available. Title-only equality is not authoritative identity.

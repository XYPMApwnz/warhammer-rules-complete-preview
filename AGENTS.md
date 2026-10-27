# Codex repository guide

Start with [README.md](README.md), the current task and the nearest scoped `AGENTS.md`. README describes the supported product, architecture, build/QA and release policy; old conversations are not authority.

## Product boundary

- Unified V2 is the only user interface: nine Army Books, Core reader and Mega Glossary.
- Legacy V1 readers, Roster Guides, V1 saved-roster/URL compatibility and V1 update scenarios are retired. Do not reintroduce those requirements.
- Orks is not a public tenth book. Keep accepted sources and necessary tools for future native V2 enrollment.
- A filename containing `v1` does not prove retirement; trace real consumers first.

## Source and gameplay safety

- Preserve `accepted sources -> canonical identities -> effective contextual facts -> deterministic artifacts -> UI`.
- Generated outputs, tests and documentation never own gameplay facts. Repair the proven owner/producer, then rebuild.
- Use explicit identities, physical UNIT/MODEL/weapon scope, conditions, membership and provenance. Do not infer recipients, defaults or aliases.
- Central MFM owns prices and MFM relations. Unknown context remains explicit; a partial/text-only mechanic is not fully executable.
- Keep source integrity, currentness, content certification and user-path certification separate. Preserve accepted RAW/enrollment bytes.
- Read the [source/gameplay contract](docs/PROJECT_SOURCE_OF_TRUTH.md) and [rule presentation contract](docs/codex/V2_RULE_PRESENTATION_CONTRACT.md) when their boundary is affected.

## Work narrowly

- Verify HEAD, branch and tree before changes. Use `rg` and the [repository map](docs/codex/REPO_MAP.md) for the named owner.
- Search source/config/producers first; inspect generated heavy files only for a concrete consumer trace.
- Do not reopen completed architecture, refresh sources or audit unrelated books without a demonstrated dependency.
- SM changes require DA/BA regression when their inherited semantics can change.
- Do not delete files by naming convention. Check imports, commands, producers and publication references.

## Verification and delivery

- Run `npm run qa:help` and the [QA matrix](docs/codex/QA_MATRIX.md); choose relevant native V2 and boundary tests.
- Use normal producer `--check` paths; keep builds network-free. Never weaken guards or change EXPECTED merely for PASS.
- Shared/runtime changes require affected consumers, integration and real-browser evidence where observable. Preserve current V2 user state.
- Record historical failures separately in [TRACKER](docs/TRACKER.md); the known Deathwatch `--fresh` failure is not PASS.
- Inspect the full diff and keep the final tree clean. Report exact scope, tests, limits and semantic changes.
- Push, deployment, cache/release changes and live source updates require task authorization. No force push or history rewrite.
- Use runtime-only packaging for Pages. Do not publish the source repository or QA archives wholesale.

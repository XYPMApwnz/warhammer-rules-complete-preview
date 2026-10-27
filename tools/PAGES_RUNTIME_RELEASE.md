# Unified V2 runtime publication

[README](../README.md#runtime-only-packaging-and-publication) is the primary build and product guide. Unified V2 is the sole UI. Roster Guides, V1 readers, old mobile HTML routes and V1 URL/roster/update compatibility are retired. Canonical sources, accepted RAW/PDF, required producers, the Core iframe reader and active V2 presentation modules remain in source.

## Build and verify

Use Node.js 24 and a fresh clean checkout of the exact reviewed source commit. Check working bytes with `git ls-files --eol` when hashes differ from Git blobs. Do not change accepted enrollment bytes or normalize source inputs to force a desired hash.

```text
node tools/pages-runtime-package.mjs --source SOURCE --out NEW_PUBLISH_DIRECTORY
node tools/pages-runtime-package.mjs --source SOURCE --out NEW_PUBLISH_DIRECTORY --check
node tools/pages-runtime-package-qa.mjs --source SOURCE --published NEW_PUBLISH_DIRECTORY --work NEW_QA_DIRECTORY
```

Normal packaging is network-free. It publishes only the explicit `tools/pages-runtime-manifest.json` allowlist and refuses a non-empty output directory, missing module/resource dependencies, symlinks, unsafe paths, unlisted files or corrupted bodies. QA files and development archives are not runtime inputs. Retained publicly linked source downloads remain explicitly declared; a `/sources/` pathname alone is not permission to publish a capture.

`PAGES_RUNTIME_MANIFEST.json` records paths, byte sizes, SHA-256, input hashes and a deterministic aggregate. Runtime bodies are copied verbatim except declared outputs of existing publication/cache producers and the static `.nojekyll` LF marker. Review any changed dependency reason and repeat dist-only browser checks. File counts and hashes are new release baselines, not fixed historical targets.

The mandatory precache contains V2 code and small shell resources, including `books/shared/datasheet-system.css` and `books/shared/unit-art.css`. Army Book JSON and the large glossary payloads remain lazy. Core still needs `glossary/v2/generated/index.en.js` after it is opened. Test current V2 install, compatible cached data, manual updates and offline reading; no retired V1 migration journey is an acceptance requirement.

## Source review and release authorization

The GitHub repository is `XYPMApwnz/warhammer-rules-complete-preview`. `codex/unified-v2-source` and authorized feature/review branches carry source review. Check the actual Git remotes; a local `origin` may be a backup rather than GitHub.

`.github/workflows/pages-runtime.yml` runs on `unified-v2-release` and guards its build/deploy jobs with that exact ref. Pages is configured for GitHub Actions. Source or feature pushes do not publish the site. Never change Pages settings, dispatch a workflow or push a release without explicit authorization.

For an authorized release:

1. Verify clean source/candidate, current source and release refs, exact tree/parent/diff, reviewed limitations and required QA. Record the previous release SHA and available Pages artifact for rollback.
2. Independently package the exact source and a fresh candidate checkout. Require matching reviewed runtime hashes, file inventories, packaging checks and deterministic rebuilds.
3. Confirm current Pages configuration and release workflow. Push only the reviewed candidate through an explicit GitHub URL, normally fast-forward; no force push or history rewrite.
4. Wait for hosted build and deploy SUCCESS at the candidate SHA. Verify the actual HTTPS `PAGES_RUNTIME_MANIFEST.json`, not only local output or an Actions conclusion.
5. Check root V2 entry, nine books, Core, Glossary, representative roster/Effective/Guide paths, required assets, cache revision, manual updates and desktop/mobile behavior on the live site.

Prefer a verified previous Pages artifact for rollback. Otherwise prepare a reviewed new rollback commit preserving release history and runtime-only packaging. Do not reset or force-push, and do not clear current V2 localStorage/rosters to make a test pass.

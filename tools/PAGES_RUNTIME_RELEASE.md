# Unified V2 runtime publication

The repository retains sources, PDFs, V1, factual producers and QA. Pages receives
only the explicit reviewed `pages-runtime-manifest.json` dependency allowlist.
No directory-wide copy of the repository is used.

## Local build

Use Node 24, the approved seven-book candidate as `SOURCE`, and a new empty output
directory outside that candidate:

```text
node tools/pages-runtime-package.mjs --source SOURCE --out PUBLISH_DIRECTORY
node tools/pages-runtime-package.mjs --source SOURCE --out PUBLISH_DIRECTORY --check
node tools/pages-runtime-package-qa.mjs --source SOURCE --published PUBLISH_DIRECTORY --work NEW_QA_DIRECTORY
```

No package installation, network source refresh or factual producer runs. Output
paths must be explicit. A build refuses to overwrite a non-empty directory. The
check command writes nothing and rejects changed or unlisted files. Symlinked
publication files, path traversal and accidental QA/source capture publication
are rejected. One reviewed Core source JSON remains because a public page links
to its download; being in `sources/` alone is not grounds for omission.

The allowlist covers native V2 module imports, dynamically loaded JSON/styles,
data-driven images, the Core iframe and all existing legacy public entry routes.
Files named `*build*` can be browser dependencies, so names are not a deny rule.
When adding runtime dependencies, extend the explicit allowlist with their owner
and reason, then repeat dependency and dist-only browser checks.

`PAGES_RUNTIME_MANIFEST.json` records every published runtime path, bytes, SHA-256,
input SHA-256, producer and a deterministic aggregate content hash. Source facts,
runtime modules and images are copied verbatim. The non-gameplay `.nojekyll`
marker is normalized to LF (including its declared input fingerprint) to remove
Windows/Linux checkout variance. The allowlist fingerprint also normalizes only
checkout line endings; a CRLF/LF build comparison checks identical output. Only `service-worker.js` and
`glossary/generated/cache-revision.js` are regenerated through the existing
offline-mobile and cache-revision producers. The optional `sourceRoot` parameter
lets those producers read source-side inventories/configs without publishing them.

The offline mobile list is refreshed from the accepted publication inventory.
Previously available URLs remain in the package, including the historical held
Orks index URL; refreshing precache membership does not remove that file. Native
V2 cold offline support is not newly promised by this packaging task. Existing
legacy precache and previously visited native routes must be tested separately.

## Prepared Pages workflow — not activated

Current Pages source is `unified-v2-release`, root `/`, `build_type=legacy`.
That automatically publishes the whole repository and therefore must not be used
to publish the over-limit full seven-book tree.

`.github/workflows/pages-runtime.yml` prepares the standard GitHub Pages artifact
workflow. It builds from checked-in runtime projections, uploads only the explicit
publish directory, and deploys that artifact. It does not rewrite game facts or
delete source-side/V1 files. It only runs for `unified-v2-release`; ordinary
Recovery pushes do not publish. No workflow has been dispatched in Stage 6B.1.

After separate release authorization, the required actions are:

1. Close any independent release gate, including the known Wardens import notice.
   Recheck remote release SHA and record the exact source/tree to promote.
2. Preserve the old release SHA and last successful Pages artifact. Confirm the
   github-pages environment permits deployments from `unified-v2-release`.
3. Change Settings / Pages / Build and deployment / Source to **GitHub Actions**.
   This switch was not performed in Stage 6B.1. The workflow's configure-pages
   enablement is explicitly false; it is not a settings-migration mechanism.
4. Promote the reviewed seven-book tree and these packaging files with a normal
   fast-forward release commit. Push only to the explicit GitHub URL; Recovery's
   `origin` points at the backup and must not be used for publication.
5. Check workflow artifact size/content manifest, deployment SHA and the live
   HTTPS site under `/warhammer-rules-complete-preview/` on desktop/mobile.

The workflow also offers manual dispatch if GitHub has registered that workflow
on the default branch. The release-branch push trigger does not depend on that
registration and does not require modifying `main`.

For rollback, prefer redeploying the preserved previous artifact. Otherwise create
a new rollback commit restoring the previous runtime input tree while retaining
the packaging workflow/tools, build a reviewed previous-runtime artifact and
deploy it. Never force push/reset release history or silently remove user roster
storage. The old complete six-book branch remains below the Pages size limit, but
switching back to branch publication would be a separate explicit Pages change.

Official workflow reference:
https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages

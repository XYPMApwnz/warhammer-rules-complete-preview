# Pinned BSData test setup

Before running `tests/sm-authenticated-bsdata-argument-binding-qa.mjs` or a source
suite containing it, prepare its accepted input explicitly:

```powershell
npm run qa:sm:prepare-bsdata
node tests/sm-authenticated-bsdata-argument-binding-qa.mjs
```

Preparation normally needs Git and network access. It reads the repository, exact Git SHA
and input paths from `books/space-marines/sources/bsdata-extract.config.json`;
it does not select the latest BSData revision. The current pin is
`fa30730fca11fbfe87be90684d481d50e0efaf66`.

The checkout is stored under `QA_TMP_ROOT` (the normal QA temporary root when
unset), with a directory link at the unchanged configured `tmp/bsdata-wh40k-11e`
path. Preparation verifies the Git root, exact HEAD, origin, a clean tracked and
untracked tree, and all configured input files through the existing source
verifier. No repository, commit or input-path override is accepted. Normal builds
and tests remain offline.

If upstream is unavailable, an existing clean checkout of the **same accepted
upstream and exact SHA** can supply the Git objects:

```powershell
npm run qa:sm:prepare-bsdata -- --cache="<verified-local-checkout>"
```

The cache is verified before cloning: Git worktree root, configured SHA, accepted
origin, clean tree and the same configured input paths. The script logs the cache
path and upstream explicitly, clones with `--local --no-hardlinks`, restores the
verified upstream origin in the new clone, checks out the configured SHA detached,
and runs the normal verification again. This changes only transport; it cannot
select a different commit or substitute input files. A dirty, wrong-origin or
wrong-revision cache is rejected without modifying it.

An existing dirty, wrong-revision or wrong-origin checkout is rejected and left
untouched. Inspect that checkout rather than bypassing authentication. After
removing or relocating it yourself, repeat the preparation command.

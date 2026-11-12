# Updating an Army Book

Work on a feature branch. Accepted sources and reviewed declarations own the
rules. Never edit generated files or change a source pin just to silence a check.
The commands below do not commit, push, merge, publish or capture anything online
unless you explicitly run `mfm:update` without saved input.

## A balance update was published

1. Save and review the official source. Open the file named by
   `passport.official.input` in the book's `book.config.json`. Add an entry using
   the shared format: a unique ID, source document/version/page, exact entity
   ID and field, operation, previous value and replacement. Never target a rule
   by its displayed name. This real DG entry changes a Plague Marines bolt
   pistol's Strength from 4 to 5:

   ```json
   {
     "id": "gw-death-guard-faction-pack-v1.3-2026-09-30:operation:001",
     "source": {
       "id": "gw-death-guard-faction-pack-v1.3-2026-09-30",
       "document": "books/death-guard/v2/sources/gw-death-guard-faction-pack-2026-09-30.pdf",
       "version": "v1.3", "page": 7, "authority": "OFFICIAL_GW",
       "effectiveFrom": "2026-09-30"
     },
     "target": {
       "id": "datasheet-plague-marines:weapon:3",
       "field": ["strength"],
       "guards": [{"path": ["kind"], "expected": "WEAPON_PROFILE"}]
     },
     "kind": "WEAPON_PROFILE", "operation": "SET",
     "expectedBefore": "4", "after": "5",
     "provenance": {
       "page": 7,
       "documentPath": "books/death-guard/v2/sources/gw-death-guard-faction-pack-2026-09-30.pdf",
       "sourceLocator": "Rules Updates / DATASHEETS / Weapon changes / Bolt pistol / plague-marines"
     }
   }
   ```

   Keep the existing document's selection and audit declarations. The example
   is already present in DG: do not add it a second time. Use the exact value
   types (`"4"` is different from `4`). Only additions may omit
   `expectedBefore`.
2. Complete the normal source acceptance checks. If authentication requires
   committed source bytes, commit those accepted input changes locally first.
   A source-review rejection needs explicit acceptance of the exact changed
   blocks; this command does not grant that acceptance or refresh source-review
   acceptance fingerprints.
3. Run `npm run book:update -- --book=death-guard` (replace the book ID).
   Inherited books are selected from their passports. Checks run sequentially.
4. Read the printed report path. Review every gameplay change and the changed
   generated-file list. The **Official updates applied** table shows each
   update ID, source, exact target and previous/replacement value. This includes
   existing accepted updates applied again while rebuilding; the gameplay list
   separately identifies what changed since HEAD. Provenance and hash changes
   are counted separately.
5. Commit the reviewed outputs and metadata, run `npm run qa:pre-ff`, and request independent
   review before asking the owner to authorize a source fast-forward.

## A new MFM was published

1. Run `npm run mfm:update -- --version=v1.7`, substituting the actual release.
   For saved pages use `--input=E:/saved-pages --observed-at=ACTUAL_CAPTURE_TIME`.
2. Read the capture report. Supply explicit decisions for new, renamed or removed
   positions, then repeat capture with `--decisions=E:/decisions.json`.
3. Run `npm run mfm:activate -- --version=v1.7`. This switches the pointer and
   archives the old sources; it does not rebuild books.
4. Review and locally commit the accepted release, registrations and pointer.
5. Run `npm run book:update -- --all`. The declared current-MFM checks run once;
   read the per-book price changes in the report, including reference-only rows.
6. Commit the reviewed outputs, run `npm run qa:pre-ff`, then request review and
   owner approval. Historical MFM snapshots must remain intact.

## A check failed

1. Read the book name, input filenames and child log named in the failure report.
   A failed build or QA publishes no outputs back to the checkout.
2. Fix the proven input or declaration. Missing evidence, unknown identities or
   stale source acceptance require review, not a new expected test value.
   **GW update no longer matches** means the exact target value differs from
   `expectedBefore`. Compare the named entity/field with the accepted source
   and earlier updates. Correct the source binding or explicitly supersede the
   earlier update after review; do not simply copy the error's found value into
   `expectedBefore` to force a pass. The failed update publishes no generated
   files, and no part of a failed official-update transaction is applied.
3. Use `npm run book:update -- --book=death-guard --check` to check freshness
   without writing the checkout. This checks the selected book outputs in scratch
   and skips book QA and global publication outputs. Use `npm run generated:check`
   for freshness of the entire publication.
4. Run the normal update again after correcting the cause. Use a fresh `--out`
   folder if you provide one, so earlier evidence is not overwritten.
5. Review the new report before committing. If an old test needs a different
   expectation or an unrelated gameplay value changed, stop for owner review.

## What the command selects

`--book=<id>` runs the declared book chain and its declared dependants. `--all`
runs all nine book chains. Shared steps run only when a declared input or rebuilt
output changed. Uncovered changed files select the full declared plan, with the
reason printed in the report. The Core reader is not rebuilt merely because a
book was selected.

The report uses the MFM source witnessed by the saved publication. Where that
projection has no explicit current-MFM witness, its accepted source manifest at
the publication's Git commit is the declared fallback. An already committed
activation therefore does not erase the old prices from the comparison.
Shared steps also check declared input history against their output history.
The source registry uses the existing explicit delta
export and append-only merge; old entries cannot be replaced. All production
work happens in a real temporary Git clone before successful outputs are copied
back. Keep the checkout unchanged while an update is running.

New source bindings can change how the same evidence is serialized. When a
declared registry operation adds entries, the command runs the selected declared
plan once more before QA. This is reported as a second build pass. A registry
that keeps changing fails instead of publishing an unstable result.

Three declared review pins include the MFM version label in their factual-file hashes.
The command may migrate that pin only when restoring the previous version label
reconstructs the exact old full fingerprint. All other factual bytes stay pinned;
a rule, characteristic or unrelated metadata change still requires explicit
review. This does not refresh source-review acceptance or rewrite rule clauses.

`--out=E:/Warhammer/qa-evidence/my-update` retains Markdown, JSON and child logs
outside the checkout. Scratch files use the project's QA temporary directory;
`QA_TMP_ROOT` may select another external project directory. `--help` lists the
supported options. Freshness checking does not replace gameplay review or pre-ff.

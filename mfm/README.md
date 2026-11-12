# Updating points

`current.json` selects the accepted MFM release for all nine Army Books and both
CSM dependencies. `releases.json` is append-only archive history. Existing raw
captures and identity files are never overwritten after acceptance.

1. Capture a release:

   ```text
   npm run mfm:update -- --version=v1.7
   ```

   This is the only network step. It contacts the official MFM domain. To read
   saved official pages offline, add `--input=E:/saved-pages`. The input folder
   must contain every raw filename listed in the current eleven capture JSON
   files, including their Legends pages. An incomplete page or changed layout
   aborts the whole capture before any candidate is published.

2. Read `mfm/releases/v1.7/REPORT.md` and `capture.json`. Prices, model tiers,
   paid equipment, detachment points, qualifiers and relationships are compared.
   A new, renamed, removed or differently owned occurrence needs a decision.
   Similar names never establish an identity.

3. Put decisions in an external JSON file with a `decisions` array, then repeat
   capture with `--decisions=E:/decisions.json`. Each entry has the exact `key`
   and `kind` from the report plus a review `note`.

   - `ADD_UNIT`: choose `action: "BOUND"` with an explicit `armyBookId` and
     `armyUnitId`, or `action: "REFERENCE_ONLY"`. Copy the proposed opaque
     `unitReferenceId` and `unitPointRecordId` from the report. These are proposed
     identifiers, never inferred Army identities.
   - `REMOVE_OR_RENAME_UNIT`: choose `action: "REMOVE"`, or `action: "RENAME"`
     with the exact new `sourceTitle`, `sourceGroup` and `status`. A rename keeps
     the old opaque identities.
   - `REVIEW_BINDING`: provide the reviewed faction `binding`, its
     `expectedBindingHash`, and explicit `crossDomainChanges`. Each change names
     a `partition`, opaque `id`, exact `expectedBefore` (or null), and `after`
     disposition (or null for removal). Supported partitions are `unitBindings`,
     `detachmentBindings`, `enhancementBindings` and `qualifierOwnerBindings`.
     This form covers new or removed detachments, enhancements/upgrades, paid
     options, qualifiers and relationship targets. Unchanged source occurrences
     must retain their IDs. The existing canonical validators check complete
     source coverage and every disposition before activation.

4. Activate only after the report has no unresolved decisions:

   ```text
   npm run mfm:activate -- --version=v1.7
   ```

   Activation parses the retained HTML again offline, verifies the exact
   candidate artifact set and pointer, authenticates all sources and validates
   all identity partitions before writing. It archives the previous nine faction
   and two dependency declarations in the real book manifests, appends history,
   and switches the pointer together. It does not build, commit or publish.
   Temporary transaction bytes and a pre-write journal are kept under
   `E:/Warhammer/qa-tmp` (or `QA_TMP_ROOT`). An interrupted journal blocks further
   writes and names the recovery directory; preserve it for recovery.

5. Run the existing book build chains, review their changes, then run QA before
   requesting review. The shared `book:update` command is a separate task.

## Reproducing the accepted v1.6 capture

```text
npm run mfm:update -- --replay --input=mfm/sources/v1.6 --out=E:/Warhammer/qa-tmp/mfm-update-v1/replay
```

The replay input in `capture/replay-v1.6.json` explicitly preserves observation
times and field-order profiles. Profiles contain field names, not prices.
`capture/owner-scope.json` records exact foreign occurrences omitted from the
accepted supplement captures. The opaque identity registry is an authored input;
it is validated against the independently parsed source occurrences. All 27
capture files and the registry must match the accepted bytes. Replay writes only
to a fresh external directory and never replaces the accepted v1.6 snapshot.

Dates of observation are not official effective dates. If GW has not established
an effective date, it remains null. Old v1.4/v1.5 artifacts and their exact tests
remain historical evidence; they do not become selectors for the current release.

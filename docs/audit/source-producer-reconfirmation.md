# Source producer reconfirmation

Reason: **Translate 3: source-reference format**. Base: `75d322e4e3274f14d7e2a81abace3ba63c784ec5`.

The owner explicitly authorized this producer reconfirmation after a serialization-only diff and an automatic proof that every original Space Marines field remains unchanged. Hash checks and accepted source/gameplay facts are retained.

## Producer

- Path: `books/space-marines/v2/build.py`.
- Old SHA-256: `874db1b4dd016c2565f4a71a8bf46bcc2f071986139e2ddf24b558516bfc3fa4`.
- New SHA-256: `f887c2e4f6d64e4543367159ce3e49aa1bf5ba3b065a39693662c3f2ba4c702e`.
- Complete diff SHA-256: `ccc9c2177f190024b4c523cdadceb6bd3d57df1278fc7f7efcc171cf6921f8ef`.
- Exact reversal of the two import/path lines and final serialization-loop substitution restores the complete base producer byte-for-byte. All factual parsing/build functions and original --check guard remain unchanged.

```diff
diff --git a/books/space-marines/v2/build.py b/books/space-marines/v2/build.py
index d6727536..39b0f37b 100644
--- a/books/space-marines/v2/build.py
+++ b/books/space-marines/v2/build.py
@@ -18,6 +18,8 @@ from lxml import html
 sys.dont_write_bytecode = True
 HERE = Path(__file__).resolve().parent
 ROOT = HERE.parents[2]
+sys.path.insert(0, str(ROOT/'books/shared/tools'))
+from source_refs_output import serialized_source_outputs
 BOOK = 'space-marines'
 RAW = 'books/space-marines/v2/sources/raw/'
 HUB = RAW+'wahapedia-space-marines-main.html'
@@ -440,9 +442,8 @@ def main():
     parser.add_argument('--check',action='store_true')
     args=parser.parse_args()
     documents=build()
-    for name,value in documents.items():
+    for name,expected in serialized_source_outputs(documents, ROOT).items():
         path=HERE/'generated'/(name+'.json')
-        expected=serialize(value)
         if args.check:
             if not path.exists() or path.read_bytes()!=expected:
                 raise ValueError('Stale/non-deterministic factual output: '+name)
```

## Updated pin copies

| Review | JSON pointer | New SHA-256 |
| --- | --- | --- |
| books/shared/roster-v2/source-completeness-review.json | /books/space-marines/sourceReview/artifacts/1/sha256 | f887c2e4f6d64e4543367159ce3e49aa1bf5ba3b065a39693662c3f2ba4c702e |
| books/space-marines/v2/source-review.json | /books/space-marines/sourceReview/artifacts/1/sha256 | f887c2e4f6d64e4543367159ce3e49aa1bf5ba3b065a39693662c3f2ba4c702e |
| books/space-marines/v2/source-review.json | /books/deathwatch/sourceReview/artifacts/1/sha256 | f887c2e4f6d64e4543367159ce3e49aa1bf5ba3b065a39693662c3f2ba4c702e |

All seven source-review/global completeness review JSON files were scanned. The only changed pinned producer is the one above. BA and DA have no separate copy of its pin. The historical Deathwatch entry in the SM review refers to these same producer bytes; its data remains unchanged.

## Automatic all-field proof

All 19 SM generated JSON artifacts pass exact inverse compact UTF-8 serialization equality with base, preserving object order and every field/string. The companion JSON records artifact hashes, entity/field counts, and regeneration state. All native outputs are now final: 16 artifacts are sourceRefs-encoded and 3 have no migratable source slots. No downstream artifact remains unfinalized.

## Guards and commit reference

The exact artifact-byte SHA computation and `UNREVIEWED_SOURCE_REVISION` comparison statements are unchanged. Only three recorded artifact hash values in two review files were updated.

Implementation commit: [c73bd5396aa358d97603650ebd28a4886b61cf6b](https://github.com/XYPMApwnz/warhammer-rules-complete-preview/commit/c73bd5396aa358d97603650ebd28a4886b61cf6b). This commit contains the serialization-only producer change and its lossless source-reference migration.

## Shared serialization bridge

- Python bridge SHA-256: `5e17904f2dc4a5dcce6021b190a85eb5af437a66b44094f286b2c542800de35e`.
- Node bridge SHA-256: `d55cb154c93705e7d655acafc6c322dca21595f2dd5125c30a9a7471e20fa34f`.
- Codec SHA-256: `65390b89d5020141a89db6996e981eaeeca1e202fb573e5a8d47d4390295f77b`.

## Limits

- All 19 native SM generated JSON outputs are final: 16 contain regenerated sourceRefs and 3 require no source binding migration. Every inverse field/string/order matches base. Final QA results are reported separately.
- This is an automatic static all-field/inverse proof and producer diff review, not a new semantic audit or browser attestation. No QA suites were executed for this reconfirmation.
- BA and DA review files were scanned. They contain no separate pin for this SM producer; the SM source-review also contains a historical Deathwatch copy, which is updated to the identical producer bytes without changing Deathwatch data or scope.

## Serialization closure follow-up

The [common serializer fix](https://github.com/XYPMApwnz/warhammer-rules-complete-preview/commit/2c6d6716eb97394c91ddde4efc462f3ae507eed2) traverses ordinary factual sourceBindings containers and validates table closure independently of warm reader pools. The pinned SM producer remains f887c2e4; no additional pinned producer changed. Current shared serializer SHA-256: `4c1a0d5600fe22154b863dd46a1c6883ef14827653413b6c51c96620d161c620`; closure validator SHA-256: `77a67efd8e515abf394847aefb3ddf8996dcc752cd738b7a11acccb00c88f684`.

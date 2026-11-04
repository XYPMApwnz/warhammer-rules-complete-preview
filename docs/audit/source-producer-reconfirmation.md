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

## Accepted corpus artifacts stored with LF

Norma-1 reconfirms these three artifacts from source `0c7dfdfcebd81fe585a669b789a5ad13da940476`. Their Git blobs are unchanged from the source commits listed below. Converting each LF blob to CRLF reproduces its previous accepted SHA-256 exactly. The new pins authenticate the tracked LF bytes using the existing strict byte verification.

| Artifact | Source commit | Previous CRLF SHA-256 | Tracked LF SHA-256 |
| --- | --- | --- | --- |
| `books/death-guard/sources/waha-11e-current-2026-09-25/corpus.json` | `1f78d606d4cc3719fb510171b13abfa353ca71e6` | `6c1ae25df0fcdcfe87e40764b71321b63c69c0fdb1a0af983ef8f0dcc7d1e582` | `8ddc937999e6e84ccb9f149f385a477d91191549639f472a1995006ba9ec0fcf` |
| `books/adeptus-mechanicus/sources/waha-11e-current-2026-09-25/corpus.json` | `fba9214b16473e03ea4366d1e680042e8ae1191e` | `977dce523fe59b95bc3251c7d53145a0ffa7d14fbd670ce4091de5c6fd75454d` | `b779fbc93da3383aedae78a506750b6aced8c84b2566187f171dff717cc58d17` |
| `books/tyranids/sources/waha-11e-current-2026-09-27/source-defects.json` | `cc04c1853fb68117ca43403a1a2f2ea88d2f20b0` | `94fa9a970978de9b97f6745911bd27c6a5221143a6e7b2eb21c6aa0bcf0133e9` | `018b6f6dce64429589437247443b536f3e7895608263ea4c89053640525f20ba` |

## Source history artifact reconfirmation on 2026-11-04

Source history was checked against `0c7dfdfcebd81fe585a669b789a5ad13da940476`. Commit dates below are the dates recorded in source history. Historical GitHub ref update timestamps are unavailable.
For project files, the six canonical projections read the listed inputs and passed, together with each book’s V2 app and roster import QA and the shared source-effect regression QA.

| Artifact | Previous SHA-256 | New SHA-256 | Source history or reproduction |
| --- | --- | --- | --- |
| `books/adeptus-mechanicus/content/adeptus-mechanicus-codex-datasheets.en.json` | `8745f76dfa0d2019e96ec4d22248d4c66055932cfc9cf8fab6f248a4da4ace12` | `e69d67e9a800acf29a1d61143a3529371b405f709a7e2f86159ce0938a31e8d3` | accepted by owner on 2026-11-04 as part of source history. `f1a2a99bfffe4e028ce1cb8f3ca5e0450dfceee2` (2026-10-01) Restore missing transport datasheet facts. |
| `books/adeptus-mechanicus/sources/adeptus-mechanicus-effect-contracts.v1.json` | `1fa1d13840daa48f105819fbf2305cd20dfae37b862d5841e84995aaf93bc05f` | `2dc41d3581f35cea5b95f6f0655c073004ef18f46e3866778bff63dc3a05b43c` | accepted by owner on 2026-11-04 as part of source history. `f6942ecf20fe3ac1afe870f8a50837d11cf1d59d` (2026-09-26) Execute AdMech selected-wargear effects; `aa4b1a50b1a2a9b6818d67569969d4cad26038b7` (2026-09-26) Fix AdMech Enhancement unit scopes. |
| `books/chaos-space-marines/sources/chaos-space-marines-effect-contracts.v1.json` | `7baeec409dc89c8e6a1043fa8cc9e4dfa65cd53a96ca0259ac6a1675f41b4244` | `612ef11d6a9669dccbda8665c96ac137f9c98c91d861588896cc88aeaf70eb47` | accepted by owner on 2026-11-04 as part of source history. `44d8a8c7560ee23ea9b566f58a5f6e1c7c406920` (2026-09-29) Rebind CSM effect provenance; `defa4cc0dac8a078d5b32e1bb9e542beac4c5167` (2026-09-29) Execute CSM Advance and Charge effects; `66cdecd03bb2a2bf3041fb308832ba5e1ee2cde0` (2026-09-29) Execute CSM Greyveil Hex targeting restriction; `7ca338fe92815236c0fd82b1e77db2f38954cd28` (2026-09-29) Enforce CSM Warp Talons Enhancement qualifiers; `6b4d43aee58c9104894cb586ae937b18dd521fda` (2026-09-29) Execute CSM Crown of Worms ability ranges; `fa0fa7cbcffc8639697631e48914f3f6588a46a3` (2026-09-29) Execute CSM Experimental Augmentations choice; `d4bb5ec026b75b44649385971187feb0dbfe4c00` (2026-09-29) Execute CSM transport rules; `20f3a13f7658b7a5305e9b8c1e5e254443036e41` (2026-09-29) Enforce Abaddon Supreme Commander legality; `757889c7d9f5432358f263fd1e175cffde48b7f7` (2026-09-30) Execute CSM Mutated Bodyguard effect; `d4b81c81f36feb6ae515df8179d8beafe4c43aef` (2026-09-30) Execute CSM Devoted to Destruction effect; `418ef9e2f43169ebb3a6310a8cd22b76f08e8c71` (2026-09-30) Execute CSM Daemonic Allegiance choices; `35c90fdff20859143654d45eeb2af37866b26aa7` (2026-09-30) Enforce CSM Cult of the Dark Gods muster rules; `8fc01265a18e6c367451d18a7b86bf522edf63e8` (2026-09-30) Execute CSM Masters of Misdirection. |
| `books/death-guard/sources/death-guard-effect-contracts.v1.json` | `1b05e32b0dadbf96406849ee2ed2404a987b2ea7e0535d10ca2f03a5054c9f9f` | `d6cf321156de19e9a57dfd0440d05f316d9c07b98c6ee0cef6360dcd56861c33` | accepted by owner on 2026-11-04 as part of source history. `ef5a1bb16b4ca3f68eca33e5b517cc8f5ffb3b07` (2026-09-26) Fix Plagueveil attached-unit scope; `5a087d75fab37b65b852e57379f6d54dc878e7f0` (2026-09-26) Execute Death Guard Contagion Range effects. |
| `books/emperors-children/content/emperors-children-codex-parity.en.json` | `51bec45f16fe8c164913e0b46e69549c1b93ad5b9887b70dab60d3ff99a7cff1` | `a1545473d1b299861eaddcc7f11e8885df4d30d21f4f205ba8a56b8486e10508` | accepted by owner on 2026-11-04 as part of source history. `2c30fc03ffa188d7948c6fbe32d30b2271359130` (2026-09-28) Certify complete Emperor's Children content against Waha 11E. |
| `books/emperors-children/content/emperors-children-codex-datasheets.en.json` | `d6279131a5071c7f78a6598e193ef4d178e0361da497d6b0000fa76462ef3102` | `35f118a6a1b5cdbddab574552310c10e2e1df3c2f153b7b156b5e76828b90794` | accepted by owner on 2026-11-04 as part of source history. `2c30fc03ffa188d7948c6fbe32d30b2271359130` (2026-09-28) Certify complete Emperor's Children content against Waha 11E. |
| `books/emperors-children/sources/emperors-children-effect-contracts.v1.json` | `1ba14f7d14762bfbdde75dd4f62546298427485168c9faf7f33e0361e587ce6f` | `67aa273714c5a7ca8b74bcbbd64d986e7f4f7c01df1f49394b3188bf77e024c2` | accepted by owner on 2026-11-04 as part of source history. `d57e1d9a4076167e0f85f0d7efe82777c862e29c` (2026-09-28) Enforce Emperor's Children roster legality rules; `b9c4fa849d7f2775646c94db170290afc9db48ed` (2026-09-29) Execute Emperor's Children transport rules; `9829016b67d6b6cb55b724b780cf1745726a843a` (2026-09-29) Rebind Emperor's Children effect provenance; `e06640c39411d1b53b14b9b20a740a98a995f46a` (2026-09-29) Execute Emperor's Children unit-wide effects; `ee11bc41387750423b0832400198ff20f8822feb` (2026-09-29) Execute remaining Emperor's Children roster effects. |
| `books/tau-empire/sources/tau-empire-effect-contracts.v1.json` | `efcdf5ffa4588c0093e2ae054a572694df97a3ab4060d9ed7f9deffbb25a1754` | `e48bb085215a01fb3cfac4e1f19e1963168b031bb96bd115e2934fdfee715688` | accepted by owner on 2026-11-04 as part of source history. `0ceb28bc6f46ce6a6edf836fe3ba3dfce3710cd8` (2026-09-28) Execute T'au Shield Drone and Pech'ra effects; `db3b2ada239866df96a59928dc67bfab601d2644` (2026-09-28) Execute T'au Transport Bay effect; `bdc43be872181f394fa4ffb709f318e612aa644c` (2026-10-01) Enforce T'au leading-state prerequisites. |
| `books/tyranids/content/tyranids-codex-datasheets.en.json` | `12e853ed4e67f6cd468f02518a37f4eef25494b30c706efa9c52abc188ec5bdb` | `f00ce399dbbcd94c66fd6acd115c43ce23720ccd9e668dcedbcf202f2e59729c` | accepted by owner on 2026-11-04 as part of source history. `3e5afc20ff12bed62765d516742f9efa40889e5c` (2026-09-27) Fix Tyranids roster composition and profile stats. |
| `books/tyranids/sources/tyranids-effect-contracts.v1.json` | `d2dd884810fdb03512208746a9fbb13d2ae9a53ef97549bdf896ea6615a15011` | `0699ecac277a78f100b70a1767805c2f854cb16ec9095a5b9a3f3a327fe55ace` | accepted by owner on 2026-11-04 as part of source history. `9b0f667f6bf98aeab2c58982bf6afbc7d36de2b5` (2026-09-27) Execute Tyranids Synapse and keyword effects. |
| `books/tyranids/content/tyranids-related-rules.en.json` | `136bfed588f8da7dfef5986df3caa7cf137905943e713c9670109578a2f4c63a` | `16da70f2a0d07e409bbf6d2eab5f780fc3de776d88027a55576e9036e7af7cb2` | accepted by owner on 2026-11-04 as part of source history. `1d6b023428ca5b0aac655b924d810e3124958d90` (2026-09-28) Execute Tyranids Surprise Assault roster choice. |
| `books/tyranids/sources/waha-11e-current-2026-09-27/corpus.json` | `bdb6b4e438a2fc6a079dee12263056737874e7d4bc73b0a74552de57d2005744` | `79c7ddc234934a619d24aa486acea0af149b6ab1c203b464bcef12af69d611f3` | reproduced from captured source by `books/tyranids/tools/import-waha-current-corpus.py`, raw capture set SHA-256 `76575383c3259f687b0cd37b6bf838263a001ab07bd36b34d7ce14873382c8ec` (53 authenticated HTML files), with page manifest SHA-256 `e8921fdc13e8aa52166f4ed18811b4818923c6dfd370b4af9f6f1aa7943d578e`. |
| `books/tau-empire/sources/waha-11e-current-2026-09-28/corpus.json` | `613c17fdea940ca662620c8e5ddf1bb865f4d12f719bebc89f8a37a976063c7b` | `04b6261cf7740977f385d8df0b76f37e9d0358354780563ff11e0ad5154f1721` | reproduced from captured source by `books/tau-empire/tools/import-waha-current-corpus.py`, raw capture set SHA-256 `4bbcd84657af4f9b49ca7da05eea0f427b4c7eaea415d8886c5b36764304d095` (44 authenticated HTML files), with page manifest SHA-256 `1d298af22595c6714b008d6c51a70ddb695ffac2357eb5d2446d77ec451a2f94`. |
| `books/emperors-children/sources/waha-11e-current-2026-09-28/corpus.json` | `a5fdb9334b18a3dba29d94ad930f6d611f9079529d602796ce6ea42d25a1a1d3` | `ed0c7577998aea4b0dfa6f39ef6cde523bb8b4aee6cf36a9c69e04ceaa14131e` | reproduced from captured source by `books/emperors-children/tools/import-waha-current-corpus.py`, raw capture set SHA-256 `a0e71c8477d9be366e8570ea9d47bd0cfd8c3ff0aa43160916df0209597c652c` (24 authenticated HTML files), with page manifest SHA-256 `bfbde48102a8ffc4db9d509ffcb55c6f3f98fdf5ef11fff3fc0ce6d0aa65171d`. |

The Death Guard Waha `source-defects.json` pin is unchanged. Its historical capture inputs are unavailable in Git, and the corpus extractor does not produce the editorial ledger.

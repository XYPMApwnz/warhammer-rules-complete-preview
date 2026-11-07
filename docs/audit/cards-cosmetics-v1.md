# Card and import cosmetics audit

Base: 61e7c87075edbfe9e1d8b50070216e8fb3318253. Owner task dated 2026-11-08.

## Import notices

Warnings remain player-visible. Only their shared display copy changes; the book producers, published metadata, import decisions and saved roster behavior remain unchanged. The sentence “Ten MFM reference-only relations remain inactive.” is removed from the import screen as internal diagnostics and retained here and in the original metadata.

| Book | Original | Player copy | Decision |
| --- | --- | --- | --- |
| blood-angels | Source and physical import limitations | Import limitations | REWRITE |
| blood-angels | Two weapon mappings remain NOT_PROVEN: Chainsword / Astartes Chainsword and Bolt Rifle Fire / Focused or Saturation profiles. | Two weapons cannot be told apart from the export: Chainsword vs Astartes Chainsword, and the Bolt Rifle firing modes (Focused Fire or Saturation). | REWRITE |
| blood-angels | Ambiguous selections are rejected without replacing the saved roster. | If your list needs one of them, the import stops and your saved roster is kept. | REWRITE |
| blood-angels | An authentic Blood Angels New Recruit export has not been verified. | This importer has not yet been checked against a real Blood Angels export. | REWRITE |
| blood-angels | Gameplay and points limitations | Rules and points | REWRITE |
| blood-angels | Black Rage retains its source OR and unknown positional context. | Black Rage can apply when any one of its listed conditions is met. The app cannot check battlefield positions. | REWRITE |
| blood-angels | Legacy of the Angel requires BLOOD ANGELS and CHARACTER; general Space Marines units do not gain BLOOD ANGELS automatically. | Legacy of the Angel only applies to a BLOOD ANGELS CHARACTER. General Space Marines units do not automatically count as BLOOD ANGELS. | REWRITE |
| blood-angels | Stormlance remains a source conflict. | Check Stormlance against your rules, as the available references disagree. | REWRITE |
| blood-angels | Ten MFM reference-only relations remain inactive. | — | REMOVE_FROM_IMPORT_UI_KEEP_DOCUMENTATION |
| blood-angels | Unsupported mechanics retain full text; paid equipment requires an exact physical selection, otherwise points are unresolved. | Some rules are shown in full but are not applied automatically. To calculate paid equipment costs, the app needs to know exactly what was selected, how many, and who has it; otherwise the points total stays unresolved. | REWRITE |
| dark-angels | Chapter context and keyword grants | Dark Angels keywords | REWRITE |
| dark-angels | A roster containing only general Space Marines units has unconfirmed Dark Angels army context. DEATHWING and RAVENWING grants remain inactive until a source-confirmed Dark Angels unit and validated roster membership establish that context. Opening this book, a Detachment or an attachment does not establish Chapter context. | A list made only of general Space Marines units does not tell the app that it is a Dark Angels army. A confirmed Dark Angels unit must be in the roster, and the units receiving DEATHWING or RAVENWING must belong to that army. Opening the book, choosing a Detachment or attaching units is not enough. | REWRITE |
| dark-angels | Source and import limitations | Import limitations | REWRITE |
| dark-angels | Ten MFM reference-only relations remain inactive. | — | REMOVE_FROM_IMPORT_UI_KEEP_DOCUMENTATION |
| dark-angels | This importer has constructed-input coverage; an authentic Dark Angels New Recruit export has not been verified. | This importer has been tested with sample lists, but has not yet been checked against a real Dark Angels export. | REWRITE |
| ALL_9 | This selected Detachment has no reviewed canonical membership in this Army Book. Its selection remains unresolved; no roster changes were saved. | This Detachment could not be matched to the rules in this Army Book. Check its name in the New Recruit export. No roster changes were saved. | REWRITE_AT_UI_RENDER_ONLY |
| ALL_9 | Imported text: <N> physical unit entries | Imported text: <N> physical unit entries | KEEP (already understandable; no importer behavior change) |
| ALL_9 | This label needs clarification. Confirm which matching source entry it represents. Imported quantities remain unchanged. | This label needs clarification. Confirm which matching source entry it represents. Imported quantities remain unchanged. | KEEP (already understandable; no importer behavior change) |
| ALL_9 | Matching source entry | Matching source entry | KEEP (already understandable; no importer behavior change) |
| ALL_9 | The selected equipment source reference could not be verified. | The selected equipment source reference could not be verified. | KEEP (already understandable; no importer behavior change) |
| ALL_9 | Existing already plain reasons for unknown selections, quantities, unit size, costs and Enhancement cost. | Unchanged | KEEP |
| ALL_9 | Existing fixed ordinary-language messages for empty/invalid quantity/ambiguous Warlord/Enhancement cases. | Unchanged | KEEP |

Other seven books have no static import notices. Shared reason-coded error handling and all existing per-need identity matching remain intact.

## Presentation boundaries

- Granted-keyword notes follow the complete keyword lists; source/recipient identities remain attached to their original fields.
- Conditional clauses keep their own text, conditions and proof metadata. An identical source/recipient caption is shared through explicit accessibility references. Different physical sources or recipients keep separate captions.
- Weapon metric cells remain visible at the requested widths; Melee never wraps.
- Datasheet abilities remain in the Abilities column instead of being moved to fill space under Weapons.
- Warlord labels read existing roster state: Yes for the marked unit, No for others when marked, Not set when no Warlord is marked. No state is changed.
- Only an exact redundant heading is removed from Enhancement display. Restrictions, exclusions, body prose and the Upgrade type remain visible in normal, selected, popup and attached-rule views. Other Enhancement fields stay intact; existing full-source metric proof checks are unchanged.
- Characteristic and granted-ability source captions use the explicit name at the exact, unique bound source field, when present. EC Daemonic Icon and Tyranids Vicious Insight already have names in their source text. Ambiguous/unnamed fields are not assigned invented names.

## Item 9: not a redundant heading

CSM Prey on the Weak, detachment-murdertalon-raiders:rule, contains two legitimate source bullets, beginning “- Friendly HERETIC ASTARTES INFANTRY FLY” and “- When an enemy unit”. There is no repeated “- Prey on the Weak” heading. Both bullets remain unchanged; before/after browser observations record this at 390, 1200 and 1600 px.

## Test expectation change

| File | Before | After | Reason |
| --- | --- | --- | --- |
| v2/card-display-2-browser-qa.mjs | Every conditional row contains its own visible Source caption | Each row contains its caption or explicitly references a shared caption for that same canonical rule | Item 3 requires one identical caption rather than duplicates. Clause identity, exact canonical quote and provenance assertions remain unchanged. |

New cosmetics tests are enrolled in qa:integration and test:browser. The browser suite uses the same owner-authored assertions against the original checkout for negative controls. The layout assertions cover all five requested widths; before/after evidence uses 390, 1200 and 1600 px (plus the other two weapon widths). Existing source text, data and generated outputs are not updated.

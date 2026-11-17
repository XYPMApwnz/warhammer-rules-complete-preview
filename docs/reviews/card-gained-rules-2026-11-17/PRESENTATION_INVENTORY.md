# Gained-rule presentation inventory

This is a bounded inspection of the committed roster fixtures selected for this task, not a census of every possible roster or battle state. The initial nine-book source inspection is preserved in `BASELINE_AUDIT.json`. The final browser inventory must be read from the completed run's `SOURCE_INVENTORY.json`; intermediate galleries are diagnostic.

## Why the source caption was repeated

On accepted source `9a487657`, the common weapon renderer emitted a source/recipient caption for each granted ability field. Vector of Disease has two separate existing executed contributions: SUSTAINED HITS 1 and LANCE. Each Manreaper mode therefore received two captions for the same physical rule source. Those effects must remain separate; only their repeated presentation caption is grouped.

The presentation identity must retain canonical rule ID, source physical unit/model/composition scope, exact source field/block and provenance. An effect ID cannot be the grouping key because different effects of the same rule deliberately have different IDs. A section title such as ABILITIES is also insufficient: one section can contain several independent named rules.

The initial nine-book fixture sample found four affected weapon rows, all DG: two Manreaper modes on Deathshroud Terminators and two on Lord of Contagion. Each had one excess caption, for four excess source blocks. No duplicate weapon-source blocks were observed in the other eight selected book scenarios. The DG initial sample had only the owner Lord of Contagion attachment; the final gallery additionally uses the explicitly derived Putrifier attachment needed by Foul Infusion.

## Existing text without a computed result in the selected snapshot

The following rows had ROLE proof and no ROSTER_EFFECT proof in this selected snapshot. Their accepted full text must remain readable; moving it does not authorize a new computation.

| Book | Rules |
|---|---|
| Death Guard | Death Approaches; Icon of Despair (Aura) |
| Adeptus Mechanicus | Battle Protocols |
| Chaos Space Marines | Accursed Horde; Malign Sacrifice |
| Space Marines | Unyielding in the Face of the Foe; Strategic Acumen |
| Blood Angels | Unyielding in the Face of the Foe; Strategic Acumen |
| Dark Angels | Unyielding in the Face of the Foe; Strategic Acumen |
| T'au Empire | Suppression Volley; DS8 Support Turret; Exemplar of the Kauyon |
| Tyranids | Vanguard Predator |

This list describes the recorded runtime proof in these inputs; it does not claim that every rule is globally incapable of automation in another supported context. Cacophonic Accompaniment and Volley Fire have ROSTER_EFFECT proof even though the chosen snapshot did not contain a corresponding applied contribution; they are not classified as inherently text-only. Emperor's Children therefore has no ROLE-only entry in this sample.

Silent Bodyguard is not text-only on the accepted baseline: it already grants Feel No Pain 4+ to the attached Lord of Contagion. The new top chip exposes that existing computed result, and its complete source text remains in Gained rules. No effect was added to implement that chip.

## Meaning of the old ability stripes

The previous green/pink left borders came from `.ability` and `.ability:nth-child(even)` in `books/shared/datasheet-system.css`. They alternated by position and did not encode rule ownership or execution. The roster presentation now reserves gained accents and the explicit `+` marker for gains; normal datasheet abilities do not gain ownership merely from their position. The exact common chip accent is checked as `rgb(199, 174, 117)` across the nine selected books.

## Scope and coverage limits

The final browser test compares actual existing metric values, source proofs, physical recipients and visual position. It also checks source-chip keyboard/touch behavior, complete tooltip containment, actual Gained rules navigation, exact per-instance prices and independent copy-tier examples.

The selected real/derived gallery inputs do not provide a positive mixed-unit case where an existing computed MODEL gain covers only one model of a multi-model profile. No new gameplay effect or recipient is invented to manufacture that case. The shared recipient helper and existing physical-scope controls must retain that boundary separately; this inventory makes no broader positive browser-coverage claim.

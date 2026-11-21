# Опись кодирования правил, получателей и условий

База: `8dbbb9e5f9032a009939d3dd70a62f1ac068ef8a`. Ветка: `codex/rule-encoding-census`. Режим всей описи: **STATIC_CODE_ONLY**. Orks исключены. Генераторы игровых данных, приложение и runtime не менялись.

## 1. Происхождение данных и воспроизводимость

Документ и соседний JSON создаёт только `node tools/audit/rule-encoding-census.mjs --write`. Проверка: `node tools/audit/rule-encoding-census.mjs --check`. Время запуска, locale и абсолютный путь не входят в результат. В `inputs[]` находятся пути, SHA-256 и размеры всех прочитанных файлов; базовое дерево: `d48160e58a5c88315a4f922ba71a81fbde4e84ff`.

**Generated — не первичный источник игровых фактов.** Читается фактический артефакт, который загружает книга; принятые HTML/JSON/декларации и доказанные producer edges перечислены отдельно. Отсутствующее звено не восстанавливается по сходству названий.

| Книга | Прочитано entities | Все contract clauses | Пунктов в описи | Текстовых сущностей без clauses | Runtime |
|---|---:|---:|---:|---:|---|
| adeptus-mechanicus | 616 | 289 | 170 | 0 | [books/adeptus-mechanicus/v2/generated/roster-runtime.json](../../books/adeptus-mechanicus/v2/generated/roster-runtime.json) |
| blood-angels | 1622 | 754 | 395 | 4 | [books/blood-angels/v2/generated/roster-import.json](../../books/blood-angels/v2/generated/roster-import.json) |
| chaos-space-marines | 1837 | 410 | 278 | 0 | [books/chaos-space-marines/v2/generated/roster-runtime.json](../../books/chaos-space-marines/v2/generated/roster-runtime.json) |
| dark-angels | 1641 | 769 | 421 | 4 | [books/dark-angels/v2/generated/roster-import.json](../../books/dark-angels/v2/generated/roster-import.json) |
| death-guard | 538 | 306 | 124 | 0 | [books/death-guard/v2/generated/rule-contract-effective.json](../../books/death-guard/v2/generated/rule-contract-effective.json) |
| emperors-children | 526 | 38 | 36 | 47 | [books/emperors-children/v2/generated/roster-attachments.json](../../books/emperors-children/v2/generated/roster-attachments.json) |
| space-marines | 1716 | 963 | 532 | 1 | [books/space-marines/v2/generated/roster-import.json](../../books/space-marines/v2/generated/roster-import.json) |
| tau-empire | 753 | 308 | 162 | 0 | [books/tau-empire/v2/generated/roster-import.json](../../books/tau-empire/v2/generated/roster-import.json) |
| tyranids | 732 | 29 | 29 | 81 | [books/tyranids/v2/generated/roster-runtime.json](../../books/tyranids/v2/generated/roster-runtime.json) |

«Все contract clauses» включает типы вне целевого среза, в том числе Stratagem и структурные декларации. «Пунктов в описи» — только выбранные clauses, без фиктивных пунктов для неконтрактного текста. Повторные SM-идентичности в BA/DA считаются внутри каждой книги; ключ записи — тройка book/entity/clause.

### adeptus-mechanicus

**Принятые входы и форматы:**
- [books/adeptus-mechanicus/v2/sources/enrollment.json](../../books/adeptus-mechanicus/v2/sources/enrollment.json) — JSON.
- [books/adeptus-mechanicus/sources/waha-11e-current-2026-09-25/corpus.json](../../books/adeptus-mechanicus/sources/waha-11e-current-2026-09-25/corpus.json) — JSON.
- [books/adeptus-mechanicus/sources/waha-11e-current-2026-09-25](../../books/adeptus-mechanicus/sources/waha-11e-current-2026-09-25) — HTML directory.
- [books/adeptus-mechanicus/v2/source-adjudications.json](../../books/adeptus-mechanicus/v2/source-adjudications.json) — JSON.
- [books/adeptus-mechanicus/v2/sources/official-v1.4-updates.json](../../books/adeptus-mechanicus/v2/sources/official-v1.4-updates.json) — JSON.
- [books/adeptus-mechanicus/v2/contract-datasheet-army-declarations.json](../../books/adeptus-mechanicus/v2/contract-datasheet-army-declarations.json) — JSON.
- [books/adeptus-mechanicus/v2/contract-enhancement-detachment-declarations.json](../../books/adeptus-mechanicus/v2/contract-enhancement-detachment-declarations.json) — JSON.
- [books/adeptus-mechanicus/v2/contract-stratagem-declarations.json](../../books/adeptus-mechanicus/v2/contract-stratagem-declarations.json) — JSON.

**Проверенная цепочка producers → runtime/presentation:**
- [books/adeptus-mechanicus/v2/app-build.mjs:18](../../books/adeptus-mechanicus/v2/app-build.mjs#L18) — `const built=buildAdMechContracts();`.
- [books/adeptus-mechanicus/v2/build.py:44](../../books/adeptus-mechanicus/v2/build.py#L44) — `def build():`.
- [books/adeptus-mechanicus/v2/build.py:48](../../books/adeptus-mechanicus/v2/build.py#L48) — `corpus = read(SOURCE+'/corpus.json')`.
- [books/adeptus-mechanicus/v2/build.py:322](../../books/adeptus-mechanicus/v2/build.py#L322) — `for operation in read('books/adeptus-mechanicus/v2/source-adjudications.json'):`.
- [books/adeptus-mechanicus/v2/build.py:343](../../books/adeptus-mechanicus/v2/build.py#L343) — `for operation in official_updates['operations']:`.
- [books/adeptus-mechanicus/v2/contract-datasheet-army-declarations.json:5055](../../books/adeptus-mechanicus/v2/contract-datasheet-army-declarations.json#L5055) — `"datasheet-skitarii-marshal:section:1": {`.
- [books/adeptus-mechanicus/v2/contract-datasheet-army-declarations.json:5185](../../books/adeptus-mechanicus/v2/contract-datasheet-army-declarations.json#L5185) — `"Control Edict: While this model is leading a unit`.
- [books/adeptus-mechanicus/v2/contract-datasheet-army-declarations.json:18488](../../books/adeptus-mechanicus/v2/contract-datasheet-army-declarations.json#L18488) — `"datasheet-cybernetica-datasmith:section:1": {`.
- [books/adeptus-mechanicus/v2/contract-enhancement-detachment-declarations.json:5628](../../books/adeptus-mechanicus/v2/contract-enhancement-detachment-declarations.json#L5628) — `"halo-override-selection"`.
- [books/adeptus-mechanicus/v2/roster-build.mjs:13](../../books/adeptus-mechanicus/v2/roster-build.mjs#L13) — `export function buildRosterRuntimeBook`.
- [books/adeptus-mechanicus/v2/roster-build.mjs:29](../../books/adeptus-mechanicus/v2/roster-build.mjs#L29) — `clause.rosterClassification='BATTLE_ONLY'`.
- [books/adeptus-mechanicus/v2/roster-runtime.mjs:45](../../books/adeptus-mechanicus/v2/roster-runtime.mjs#L45) — `readJson('./generated/roster-runtime.json')`.
- [books/adeptus-mechanicus/v2/rule-contract-build.mjs:12](../../books/adeptus-mechanicus/v2/rule-contract-build.mjs#L12) — `export const declarationFiles=`.
- [books/adeptus-mechanicus/v2/rule-contract-build.mjs:55](../../books/adeptus-mechanicus/v2/rule-contract-build.mjs#L55) — `export function ownerInventory`.
- [books/adeptus-mechanicus/v2/rule-contract-build.mjs:69](../../books/adeptus-mechanicus/v2/rule-contract-build.mjs#L69) — `export function buildAdMechContracts`.
- [books/adeptus-mechanicus/v2/rule-contract-schema.mjs:5](../../books/adeptus-mechanicus/v2/rule-contract-schema.mjs#L5) — `export function createAdMechSchema`.

Полные роли звеньев и ограничения: `books[].lineage` в JSON. Каждый anchor проверяется по указанной строке; первичные пути каждой записи — `source.paths[]`, исходная provenance сохранена целиком.

### blood-angels

**Принятые входы и форматы:**
- [books/blood-angels/book.config.json](../../books/blood-angels/book.config.json) — JSON.
- [books/blood-angels/v2/generated/base.json](../../books/blood-angels/v2/generated/base.json) — JSON.
- [books/blood-angels/v2/generated/effective.json](../../books/blood-angels/v2/generated/effective.json) — JSON.
- [books/blood-angels/v2/identity-bindings.json](../../books/blood-angels/v2/identity-bindings.json) — JSON.
- [books/blood-angels/v2/inherited-sm-references.json](../../books/blood-angels/v2/inherited-sm-references.json) — JSON.
- [books/blood-angels/v2/rule-clause-review.json](../../books/blood-angels/v2/rule-clause-review.json) — JSON.
- [books/blood-angels/v2/rule-contract-declarations.mjs](../../books/blood-angels/v2/rule-contract-declarations.mjs) — MJS.
- [books/blood-angels/v2/source-bindings.json](../../books/blood-angels/v2/source-bindings.json) — JSON.
- [books/blood-angels/v2/sources/enrollment.json](../../books/blood-angels/v2/sources/enrollment.json) — JSON.
- [books/blood-angels/v2/sources/raw/wahapedia-blood-angels-main.html](../../books/blood-angels/v2/sources/raw/wahapedia-blood-angels-main.html) — FROZEN_HTML.
- [books/blood-angels/v2/sources/raw/wahapedia-blood-angels-main.html](../../books/blood-angels/v2/sources/raw/wahapedia-blood-angels-main.html) — HTML.
- [books/blood-angels/v2/sources/raw/wahapedia-datasheets.html](../../books/blood-angels/v2/sources/raw/wahapedia-datasheets.html) — FROZEN_HTML.
- [books/blood-angels/v2/sources/raw/wahapedia-datasheets.html](../../books/blood-angels/v2/sources/raw/wahapedia-datasheets.html) — HTML.
- [books/space-marines/v2/generated/effective.json](../../books/space-marines/v2/generated/effective.json) — JSON.
- [books/space-marines/v2/rule-contract-build.mjs](../../books/space-marines/v2/rule-contract-build.mjs) — MJS.
- [books/space-marines/v2/sources/raw/wahapedia-datasheets-probe.html](../../books/space-marines/v2/sources/raw/wahapedia-datasheets-probe.html) — FROZEN_HTML.
- [books/space-marines/v2/sources/raw/wahapedia-datasheets-probe.html](../../books/space-marines/v2/sources/raw/wahapedia-datasheets-probe.html) — HTML.
- [books/space-marines/v2/sources/raw/wahapedia-space-marines-main.html](../../books/space-marines/v2/sources/raw/wahapedia-space-marines-main.html) — FROZEN_HTML.
- [books/space-marines/v2/sources/raw/wahapedia-space-marines-main.html](../../books/space-marines/v2/sources/raw/wahapedia-space-marines-main.html) — HTML.

**Проверенная цепочка producers → runtime/presentation:**
- [books/blood-angels/v2/app-build.mjs:16](../../books/blood-angels/v2/app-build.mjs#L16) — `export function buildApp()`.
- [books/blood-angels/v2/book-build.mjs:19](../../books/blood-angels/v2/book-build.mjs#L19) — `export function build`.
- [books/blood-angels/v2/book-build.mjs:21](../../books/blood-angels/v2/book-build.mjs#L21) — `inherited-sm-references.json`.
- [books/blood-angels/v2/build.py:198](../../books/blood-angels/v2/build.py#L198) — `'DATASHEET_SECTION',owner`.
- [books/blood-angels/v2/build.py:322](../../books/blood-angels/v2/build.py#L322) — `def verify_sources(`.
- [books/blood-angels/v2/build.py:338](../../books/blood-angels/v2/build.py#L338) — `source-bindings.json`.
- [books/blood-angels/v2/build.py:339](../../books/blood-angels/v2/build.py#L339) — `identity-bindings.json`.
- [books/blood-angels/v2/build.py:416](../../books/blood-angels/v2/build.py#L416) — `def build():`.
- [books/blood-angels/v2/build.py:426](../../books/blood-angels/v2/build.py#L426) — `effective=copy.deepcopy(base)`.
- [books/blood-angels/v2/conditional-policy-declarations.mjs:2](../../books/blood-angels/v2/conditional-policy-declarations.mjs#L2) — `conditionalPolicyDeclarations`.
- [books/blood-angels/v2/gameplay-presentation-build.mjs:12](../../books/blood-angels/v2/gameplay-presentation-build.mjs#L12) — `export function buildGameplayPresentation`.
- [books/blood-angels/v2/registration.mjs:8](../../books/blood-angels/v2/registration.mjs#L8) — `async loadPayload()`.
- [books/blood-angels/v2/roster-boot.mjs:5](../../books/blood-angels/v2/roster-boot.mjs#L5) — `generated/roster-import.json`.
- [books/blood-angels/v2/roster-build.mjs:110](../../books/blood-angels/v2/roster-build.mjs#L110) — `generated/roster-import.json`.
- [books/blood-angels/v2/rule-contract-build.mjs:23](../../books/blood-angels/v2/rule-contract-build.mjs#L23) — `export function build`.
- [books/blood-angels/v2/rule-contract-build.mjs:39](../../books/blood-angels/v2/rule-contract-build.mjs#L39) — `source.ruleContract&&source.parentId`.
- [books/blood-angels/v2/rule-contract-build.mjs:44](../../books/blood-angels/v2/rule-contract-build.mjs#L44) — `effect.excludeWeaponIds.filter(id=>index.has(id))`.
- [books/blood-angels/v2/rule-contract-build.mjs:107](../../books/blood-angels/v2/rule-contract-build.mjs#L107) — `return atom('ALWAYS'`.
- [books/blood-angels/v2/rule-contract-build.mjs:115](../../books/blood-angels/v2/rule-contract-build.mjs#L115) — `purpose:'OWNER'`.
- [books/blood-angels/v2/rule-contract-build.mjs:147](../../books/blood-angels/v2/rule-contract-build.mjs#L147) — `rosterClassification:'ROSTER_EXECUTABLE'`.
- [books/blood-angels/v2/rule-contract-build.mjs:153](../../books/blood-angels/v2/rule-contract-build.mjs#L153) — `rosterClassification:'DISPLAY_ONLY'`.
- [books/blood-angels/v2/rule-contract-build.mjs:159](../../books/blood-angels/v2/rule-contract-build.mjs#L159) — `bindCanonicalContract(`.
- [books/blood-angels/v2/rule-contract-schema.mjs:3](../../books/blood-angels/v2/rule-contract-schema.mjs#L3) — `export function create`.
- [books/shared/army-book-app-v2/personal.mjs:506](../../books/shared/army-book-app-v2/personal.mjs#L506) — `const hasSource=row=>`.
- [books/shared/roster-v2/conditional-policy.mjs:13](../../books/shared/roster-v2/conditional-policy.mjs#L13) — `clause.rosterClassification==='DISPLAY_ONLY'&&clause.rosterEffects.length===0`.
- [books/shared/roster-v2/conditional-policy.mjs:69](../../books/shared/roster-v2/conditional-policy.mjs#L69) — `return ['MODEL_KEYWORD','UNIT_KEYWORD','MODEL_ID','UNIT_ID'].includes(node?.predicate)`.
- [books/shared/roster-v2/conditional-policy.mjs:87](../../books/shared/roster-v2/conditional-policy.mjs#L87) — `['EFFECT_RECIPIENT','RECIPIENT'].includes(role.purpose)`.
- [books/shared/roster-v2/conditional-policy.mjs:141](../../books/shared/roster-v2/conditional-policy.mjs#L141) — `clause.rosterClassification!=='BATTLE_ONLY'`.
- [books/shared/roster-v2/conditional-policy.mjs:240](../../books/shared/roster-v2/conditional-policy.mjs#L240) — `export function projectConditionalRow`.
- [books/shared/roster-v2/detachment-reference-build.mjs:14](../../books/shared/roster-v2/detachment-reference-build.mjs#L14) — `assert.ok(!row.ruleContract,'Unreviewed allied rule execution')`.
- [books/shared/rule-contract-v2/bindings.mjs:4](../../books/shared/rule-contract-v2/bindings.mjs#L4) — `Typed declarations are the input authority`.
- [books/shared/rule-contract-v2/bindings.mjs:145](../../books/shared/rule-contract-v2/bindings.mjs#L145) — `export function bindCanonicalContract`.
- [books/shared/rule-contract-v2/schema.mjs:229](../../books/shared/rule-contract-v2/schema.mjs#L229) — `case 'ALWAYS': return 'TRUE'`.

Полные роли звеньев и ограничения: `books[].lineage` в JSON. Каждый anchor проверяется по указанной строке; первичные пути каждой записи — `source.paths[]`, исходная provenance сохранена целиком.

### chaos-space-marines

**Принятые входы и форматы:**
- [books/chaos-space-marines/v2/sources/enrollment.json](../../books/chaos-space-marines/v2/sources/enrollment.json) — Pinned artifact byte inventory.
- [books/chaos-space-marines/sources/waha-11e-current-2026-09-29/corpus.json](../../books/chaos-space-marines/sources/waha-11e-current-2026-09-29/corpus.json) — Accepted HTML-derived captured JSON, plus accepted hub/datasheet HTML occurrences.
- [books/chaos-space-marines/v2/identity-bindings.json](../../books/chaos-space-marines/v2/identity-bindings.json) — Persistent SOURCE_ENTITY_ID -> canonical ID/owner bindings.
- [books/chaos-space-marines/v2/ownership-bindings.json](../../books/chaos-space-marines/v2/ownership-bindings.json) — Explicit canonical fact owner versus repeated source occurrence.
- [books/chaos-space-marines/v2/model-bindings.json](../../books/chaos-space-marines/v2/model-bindings.json) — Explicit composition/model statline identities.
- [books/chaos-space-marines/v2/official-bindings.json](../../books/chaos-space-marines/v2/official-bindings.json) — Accepted official PDF source addresses/overrides.
- [books/chaos-space-marines/v2/contract-datasheet-army-declarations.json](../../books/chaos-space-marines/v2/contract-datasheet-army-declarations.json) — Reviewed semantic JSON declarations and explicit owner dispositions; not a new factual source.
- [books/chaos-space-marines/v2/contract-enhancement-detachment-declarations.json](../../books/chaos-space-marines/v2/contract-enhancement-detachment-declarations.json) — Reviewed semantic JSON declarations and explicit owner dispositions; not a new factual source.
- [books/chaos-space-marines/v2/contract-stratagem-declarations.json](../../books/chaos-space-marines/v2/contract-stratagem-declarations.json) — Reviewed semantic JSON declarations and explicit owner dispositions; not a new factual source.
- [books/chaos-space-marines/v2/contract-construction-declarations.json](../../books/chaos-space-marines/v2/contract-construction-declarations.json) — Reviewed semantic JSON declarations and explicit owner dispositions; not a new factual source.

**Проверенная цепочка producers → runtime/presentation:**
- [books/chaos-space-marines/v2/build.py:368](../../books/chaos-space-marines/v2/build.py#L368) — `def build(root=ROOT):`.
- [books/chaos-space-marines/v2/registration.mjs:12](../../books/chaos-space-marines/v2/registration.mjs#L12) — `async createRoster(){return (await import('./roster-boot.mjs')).createBrowserRoster();}`.
- [books/chaos-space-marines/v2/roster-boot.mjs:13](../../books/chaos-space-marines/v2/roster-boot.mjs#L13) — `const runtime=createCSMRosterRuntime(book,importBook,bindings);`.
- [books/chaos-space-marines/v2/roster-boot.mjs:43](../../books/chaos-space-marines/v2/roster-boot.mjs#L43) — `const inputs=await Promise.all(['./generated/roster-runtime.json','./generated/roster-import.json','./roster-attachment-bindings.json']`.
- [books/chaos-space-marines/v2/roster-effect-build.mjs:22](../../books/chaos-space-marines/v2/roster-effect-build.mjs#L22) — `export function buildCSMRosterEffectBook(built=buildCSMContracts())`.
- [books/chaos-space-marines/v2/roster-effect-build.mjs:86](../../books/chaos-space-marines/v2/roster-effect-build.mjs#L86) — `clause.rosterClassification=clause.rosterClassification==='BATTLE_ONLY'`.
- [books/chaos-space-marines/v2/roster-effect-build.mjs:171](../../books/chaos-space-marines/v2/roster-effect-build.mjs#L171) — `else if(key==='isBodyguardComponentOfSource')`.
- [books/chaos-space-marines/v2/roster-effect-build.mjs:224](../../books/chaos-space-marines/v2/roster-effect-build.mjs#L224) — `    clause.rosterClassification='ROSTER_EXECUTABLE';`.
- [books/chaos-space-marines/v2/roster-effect-context.mjs:50](../../books/chaos-space-marines/v2/roster-effect-context.mjs#L50) — `export function createCSMRosterEffectContext(book,state,`.
- [books/chaos-space-marines/v2/roster-presentation.mjs:31](../../books/chaos-space-marines/v2/roster-presentation.mjs#L31) — `export function normalizeCSMEffectiveBook(book)`.
- [books/chaos-space-marines/v2/roster-runtime-build.mjs:10](../../books/chaos-space-marines/v2/roster-runtime-build.mjs#L10) — `export function buildCSMRosterRuntimeBook()`.
- [books/chaos-space-marines/v2/rule-contract-build.mjs:12](../../books/chaos-space-marines/v2/rule-contract-build.mjs#L12) — `export const declarationFiles=`.
- [books/chaos-space-marines/v2/rule-contract-build.mjs:28](../../books/chaos-space-marines/v2/rule-contract-build.mjs#L28) — `export function createCSMSchema(declarations)`.
- [books/chaos-space-marines/v2/rule-contract-build.mjs:47](../../books/chaos-space-marines/v2/rule-contract-build.mjs#L47) — `export function buildCSMContracts({facts=`.
- [books/chaos-space-marines/v2/rule-contract-context.mjs:9](../../books/chaos-space-marines/v2/rule-contract-context.mjs#L9) — `export function semanticInputs(facts,identities)`.
- [books/chaos-space-marines/v2/source_nodes.py:35](../../books/chaos-space-marines/v2/source_nodes.py#L35) — `def collect_sources(root: Path, official: dict)`.

Полные роли звеньев и ограничения: `books[].lineage` в JSON. Каждый anchor проверяется по указанной строке; первичные пути каждой записи — `source.paths[]`, исходная provenance сохранена целиком.

### dark-angels

**Принятые входы и форматы:**
- [books/dark-angels/book.config.json](../../books/dark-angels/book.config.json) — JSON.
- [books/dark-angels/v2/generated/base.json](../../books/dark-angels/v2/generated/base.json) — JSON.
- [books/dark-angels/v2/generated/effective.json](../../books/dark-angels/v2/generated/effective.json) — JSON.
- [books/dark-angels/v2/identity-bindings.json](../../books/dark-angels/v2/identity-bindings.json) — JSON.
- [books/dark-angels/v2/inherited-sm-references.json](../../books/dark-angels/v2/inherited-sm-references.json) — JSON.
- [books/dark-angels/v2/rule-clause-review.json](../../books/dark-angels/v2/rule-clause-review.json) — JSON.
- [books/dark-angels/v2/rule-contract-declarations.mjs](../../books/dark-angels/v2/rule-contract-declarations.mjs) — MJS.
- [books/dark-angels/v2/source-bindings.json](../../books/dark-angels/v2/source-bindings.json) — JSON.
- [books/dark-angels/v2/sources/enrollment.json](../../books/dark-angels/v2/sources/enrollment.json) — JSON.
- [books/dark-angels/v2/sources/raw/wahapedia-dark-angels-main.html](../../books/dark-angels/v2/sources/raw/wahapedia-dark-angels-main.html) — FROZEN_HTML.
- [books/dark-angels/v2/sources/raw/wahapedia-dark-angels-main.html](../../books/dark-angels/v2/sources/raw/wahapedia-dark-angels-main.html) — HTML.
- [books/dark-angels/v2/sources/raw/wahapedia-datasheets.html](../../books/dark-angels/v2/sources/raw/wahapedia-datasheets.html) — FROZEN_HTML.
- [books/dark-angels/v2/sources/raw/wahapedia-datasheets.html](../../books/dark-angels/v2/sources/raw/wahapedia-datasheets.html) — HTML.
- [books/space-marines/v2/generated/effective.json](../../books/space-marines/v2/generated/effective.json) — JSON.
- [books/space-marines/v2/rule-contract-build.mjs](../../books/space-marines/v2/rule-contract-build.mjs) — MJS.

**Проверенная цепочка producers → runtime/presentation:**
- [books/dark-angels/v2/app-build.mjs:16](../../books/dark-angels/v2/app-build.mjs#L16) — `export function buildApp()`.
- [books/dark-angels/v2/book-build.mjs:19](../../books/dark-angels/v2/book-build.mjs#L19) — `export function build`.
- [books/dark-angels/v2/book-build.mjs:21](../../books/dark-angels/v2/book-build.mjs#L21) — `inherited-sm-references.json`.
- [books/dark-angels/v2/build.py:177](../../books/dark-angels/v2/build.py#L177) — `'DATASHEET_SECTION',owner`.
- [books/dark-angels/v2/build.py:301](../../books/dark-angels/v2/build.py#L301) — `def verify_sources(`.
- [books/dark-angels/v2/build.py:312](../../books/dark-angels/v2/build.py#L312) — `source-bindings.json`.
- [books/dark-angels/v2/build.py:313](../../books/dark-angels/v2/build.py#L313) — `identity-bindings.json`.
- [books/dark-angels/v2/build.py:390](../../books/dark-angels/v2/build.py#L390) — `def build():`.
- [books/dark-angels/v2/build.py:401](../../books/dark-angels/v2/build.py#L401) — `effective=copy.deepcopy(base)`.
- [books/dark-angels/v2/chapter-bindings-build.mjs:9](../../books/dark-angels/v2/chapter-bindings-build.mjs#L9) — `export function chapterGrantDeclarations`.
- [books/dark-angels/v2/conditional-policy-declarations.mjs:5](../../books/dark-angels/v2/conditional-policy-declarations.mjs#L5) — `conditionalPolicyDeclarations`.
- [books/dark-angels/v2/gameplay-presentation-build.mjs:12](../../books/dark-angels/v2/gameplay-presentation-build.mjs#L12) — `export function buildGameplayPresentation`.
- [books/dark-angels/v2/registration.mjs:8](../../books/dark-angels/v2/registration.mjs#L8) — `async loadPayload()`.
- [books/dark-angels/v2/roster-boot.mjs:5](../../books/dark-angels/v2/roster-boot.mjs#L5) — `generated/roster-import.json`.
- [books/dark-angels/v2/roster-import-build.mjs:98](../../books/dark-angels/v2/roster-import-build.mjs#L98) — `generated/roster-import.json`.
- [books/dark-angels/v2/rule-contract-build.mjs:22](../../books/dark-angels/v2/rule-contract-build.mjs#L22) — `export function build`.
- [books/dark-angels/v2/rule-contract-build.mjs:38](../../books/dark-angels/v2/rule-contract-build.mjs#L38) — `source.ruleContract&&source.parentId`.
- [books/dark-angels/v2/rule-contract-build.mjs:43](../../books/dark-angels/v2/rule-contract-build.mjs#L43) — `effect.excludeWeaponIds.filter(id=>index.has(id))`.
- [books/dark-angels/v2/rule-contract-build.mjs:90](../../books/dark-angels/v2/rule-contract-build.mjs#L90) — `return atom('ALWAYS'`.
- [books/dark-angels/v2/rule-contract-build.mjs:98](../../books/dark-angels/v2/rule-contract-build.mjs#L98) — `purpose:'OWNER'`.
- [books/dark-angels/v2/rule-contract-build.mjs:130](../../books/dark-angels/v2/rule-contract-build.mjs#L130) — `rosterClassification:'ROSTER_EXECUTABLE'`.
- [books/dark-angels/v2/rule-contract-build.mjs:136](../../books/dark-angels/v2/rule-contract-build.mjs#L136) — `rosterClassification:'DISPLAY_ONLY'`.
- [books/dark-angels/v2/rule-contract-build.mjs:142](../../books/dark-angels/v2/rule-contract-build.mjs#L142) — `bindCanonicalContract(`.
- [books/dark-angels/v2/rule-contract-schema.mjs:6](../../books/dark-angels/v2/rule-contract-schema.mjs#L6) — `export function create`.
- [books/shared/army-book-app-v2/personal.mjs:506](../../books/shared/army-book-app-v2/personal.mjs#L506) — `const hasSource=row=>`.
- [books/shared/roster-v2/conditional-policy.mjs:13](../../books/shared/roster-v2/conditional-policy.mjs#L13) — `clause.rosterClassification==='DISPLAY_ONLY'&&clause.rosterEffects.length===0`.
- [books/shared/roster-v2/conditional-policy.mjs:69](../../books/shared/roster-v2/conditional-policy.mjs#L69) — `return ['MODEL_KEYWORD','UNIT_KEYWORD','MODEL_ID','UNIT_ID'].includes(node?.predicate)`.
- [books/shared/roster-v2/conditional-policy.mjs:87](../../books/shared/roster-v2/conditional-policy.mjs#L87) — `['EFFECT_RECIPIENT','RECIPIENT'].includes(role.purpose)`.
- [books/shared/roster-v2/conditional-policy.mjs:141](../../books/shared/roster-v2/conditional-policy.mjs#L141) — `clause.rosterClassification!=='BATTLE_ONLY'`.
- [books/shared/roster-v2/conditional-policy.mjs:240](../../books/shared/roster-v2/conditional-policy.mjs#L240) — `export function projectConditionalRow`.
- [books/shared/roster-v2/detachment-reference-build.mjs:14](../../books/shared/roster-v2/detachment-reference-build.mjs#L14) — `assert.ok(!row.ruleContract,'Unreviewed allied rule execution')`.
- [books/shared/rule-contract-v2/bindings.mjs:4](../../books/shared/rule-contract-v2/bindings.mjs#L4) — `Typed declarations are the input authority`.
- [books/shared/rule-contract-v2/bindings.mjs:145](../../books/shared/rule-contract-v2/bindings.mjs#L145) — `export function bindCanonicalContract`.
- [books/shared/rule-contract-v2/schema.mjs:229](../../books/shared/rule-contract-v2/schema.mjs#L229) — `case 'ALWAYS': return 'TRUE'`.

Полные роли звеньев и ограничения: `books[].lineage` в JSON. Каждый anchor проверяется по указанной строке; первичные пути каждой записи — `source.paths[]`, исходная provenance сохранена целиком.

### death-guard

**Принятые входы и форматы:**
- [books/death-guard/v2/sources/source-enrollment.json](../../books/death-guard/v2/sources/source-enrollment.json) — JSON.
- [books/death-guard/sources/waha-11e-current-2026-09-25/corpus.json](../../books/death-guard/sources/waha-11e-current-2026-09-25/corpus.json) — JSON.
- [books/death-guard/v2/sources/accepted-waha-pages](../../books/death-guard/v2/sources/accepted-waha-pages) — HTML directory.
- [books/death-guard/v2/foundation-closure.json](../../books/death-guard/v2/foundation-closure.json) — JSON.
- [books/death-guard/v2/sources/profile-selection-evidence.json](../../books/death-guard/v2/sources/profile-selection-evidence.json) — JSON.
- [books/death-guard/v2/rule-contract-enhancements.mjs](../../books/death-guard/v2/rule-contract-enhancements.mjs) — ES module.
- [books/death-guard/v2/rule-contract-stratagems.mjs](../../books/death-guard/v2/rule-contract-stratagems.mjs) — ES module.
- [books/death-guard/v2/roster-contract-build.mjs](../../books/death-guard/v2/roster-contract-build.mjs) — ES module.

**Проверенная цепочка producers → runtime/presentation:**
- [books/death-guard/v2/app-build.mjs:16](../../books/death-guard/v2/app-build.mjs#L16) — `'./generated/rule-contract-effective.json'`.
- [books/death-guard/v2/build.mjs:20](../../books/death-guard/v2/build.mjs#L20) — `export function buildFactualV2`.
- [books/death-guard/v2/build.mjs:39](../../books/death-guard/v2/build.mjs#L39) — `const normalized = normalizeDeathGuardCorpus`.
- [books/death-guard/v2/build.mjs:46](../../books/death-guard/v2/build.mjs#L46) — `const projected = applyOverlays`.
- [books/death-guard/v2/roster-boot.mjs:33](../../books/death-guard/v2/roster-boot.mjs#L33) — `fetch(new URL('./generated/rule-contract-effective.json'`.
- [books/death-guard/v2/roster-contract-build.mjs:31](../../books/death-guard/v2/roster-contract-build.mjs#L31) — `declare('datasheet-deathshroud-terminators:section:1'`.
- [books/death-guard/v2/roster-contract-build.mjs:44](../../books/death-guard/v2/roster-contract-build.mjs#L44) — `declare('datasheet-lord-of-contagion:section:1'`.
- [books/death-guard/v2/roster-contract-build.mjs:114](../../books/death-guard/v2/roster-contract-build.mjs#L114) — `function classify(entity,clause)`.
- [books/death-guard/v2/roster-contract-build.mjs:119](../../books/death-guard/v2/roster-contract-build.mjs#L119) — `if(contract.kind==='ENHANCEMENT')return ['BATTLE_ONLY'`.
- [books/death-guard/v2/roster-contract-build.mjs:127](../../books/death-guard/v2/roster-contract-build.mjs#L127) — `export function extendRosterContracts`.
- [books/death-guard/v2/rule-contract-build.mjs:19](../../books/death-guard/v2/rule-contract-build.mjs#L19) — `const kinds=new Set`.
- [books/death-guard/v2/rule-contract-build.mjs:22](../../books/death-guard/v2/rule-contract-build.mjs#L22) — `function classifySourceClause`.
- [books/death-guard/v2/rule-contract-build.mjs:31](../../books/death-guard/v2/rule-contract-build.mjs#L31) — `function basicContract`.
- [books/death-guard/v2/rule-contract-build.mjs:44](../../books/death-guard/v2/rule-contract-build.mjs#L44) — `export function buildRuleContractV2`.
- [books/death-guard/v2/rule-contract-enhancements.mjs:48](../../books/death-guard/v2/rule-contract-enhancements.mjs#L48) — `enhancement('detachment-virulent-vectorium:enhancement:3'`.
- [books/death-guard/v2/rule-contract-state-fields.mjs:3](../../books/death-guard/v2/rule-contract-state-fields.mjs#L3) — `export const stateFields`.

Полные роли звеньев и ограничения: `books[].lineage` в JSON. Каждый anchor проверяется по указанной строке; первичные пути каждой записи — `source.paths[]`, исходная provenance сохранена целиком.

### emperors-children

**Принятые входы и форматы:**
- [books/emperors-children/v2/sources/enrollment.json](../../books/emperors-children/v2/sources/enrollment.json) — JSON.
- [books/emperors-children/sources/waha-11e-current-2026-09-28/corpus.json](../../books/emperors-children/sources/waha-11e-current-2026-09-28/corpus.json) — JSON.
- [books/emperors-children/v2/model-bindings.json](../../books/emperors-children/v2/model-bindings.json) — JSON.
- [books/emperors-children/v2/identity-bindings.json](../../books/emperors-children/v2/identity-bindings.json) — JSON.
- [books/emperors-children/v2/official_sources.py](../../books/emperors-children/v2/official_sources.py) — Python.
- [books/emperors-children/v2/rule-contract-declarations.mjs](../../books/emperors-children/v2/rule-contract-declarations.mjs) — ES module.
- [books/emperors-children/v2/rule-contract-permission-declarations.mjs](../../books/emperors-children/v2/rule-contract-permission-declarations.mjs) — ES module.
- [books/emperors-children/v2/rule-contract-formation-bindings.mjs](../../books/emperors-children/v2/rule-contract-formation-bindings.mjs) — ES module.
- [books/emperors-children/v2/rule-contract-final-bindings.mjs](../../books/emperors-children/v2/rule-contract-final-bindings.mjs) — ES module.
- [books/emperors-children/v2/rule-contract-aegis-bindings.mjs](../../books/emperors-children/v2/rule-contract-aegis-bindings.mjs) — ES module.
- [books/emperors-children/v2/rule-contract-instrument-bindings.mjs](../../books/emperors-children/v2/rule-contract-instrument-bindings.mjs) — ES module.

**Проверенная цепочка producers → runtime/presentation:**
- [books/emperors-children/v2/app-build.mjs:44](../../books/emperors-children/v2/app-build.mjs#L44) — `export function buildApp`.
- [books/emperors-children/v2/build.py:238](../../books/emperors-children/v2/build.py#L238) — `elif kind == 'STRUCTURED_RULE_TABLE' and sid in table_wrappers:`.
- [books/emperors-children/v2/build.py:267](../../books/emperors-children/v2/build.py#L267) — `def build(root=ROOT):`.
- [books/emperors-children/v2/build.py:275](../../books/emperors-children/v2/build.py#L275) — `records, accounting = canonicalize`.
- [books/emperors-children/v2/roster-attachment-build.mjs:10](../../books/emperors-children/v2/roster-attachment-build.mjs#L10) — `export function buildECRosterAttachmentBook`.
- [books/emperors-children/v2/roster-attachments.mjs:34](../../books/emperors-children/v2/roster-attachments.mjs#L34) — `const context=createFormationContext`.
- [books/emperors-children/v2/roster-boot.mjs:71](../../books/emperors-children/v2/roster-boot.mjs#L71) — `read(new URL('./generated/roster-attachments.json'`.
- [books/emperors-children/v2/rule-contract-build.mjs:30](../../books/emperors-children/v2/rule-contract-build.mjs#L30) — `export function buildECContracts`.
- [books/emperors-children/v2/rule-contract-build.mjs:33](../../books/emperors-children/v2/rule-contract-build.mjs#L33) — `assert.equal(inputs.length,10`.
- [books/emperors-children/v2/rule-contract-build.mjs:90](../../books/emperors-children/v2/rule-contract-build.mjs#L90) — `rosterClassification:'ROSTER_EXECUTABLE'`.
- [books/emperors-children/v2/rule-contract-build.mjs:153](../../books/emperors-children/v2/rule-contract-build.mjs#L153) — `id:'permission-reference'`.
- [books/emperors-children/v2/rule-contract-build.mjs:202](../../books/emperors-children/v2/rule-contract-build.mjs#L202) — `remainingLegacyContracts:'NOT_MIGRATED_OR_CLASSIFIED_BY_THIS_BUILD'`.
- [books/emperors-children/v2/rule-contract-final-bindings.mjs:71](../../books/emperors-children/v2/rule-contract-final-bindings.mjs#L71) — `book.rosterContextBindings[bladeField]`.
- [books/emperors-children/v2/rule-contract-formation-bindings.mjs:8](../../books/emperors-children/v2/rule-contract-formation-bindings.mjs#L8) — `export const formationBindings`.
- [books/emperors-children/v2/rule-contract-schema.mjs:6](../../books/emperors-children/v2/rule-contract-schema.mjs#L6) — `export const finalStateFields`.

Полные роли звеньев и ограничения: `books[].lineage` в JSON. Каждый anchor проверяется по указанной строке; первичные пути каждой записи — `source.paths[]`, исходная provenance сохранена целиком.

### space-marines

**Принятые входы и форматы:**
- [books/space-marines/book.config.json](../../books/space-marines/book.config.json) — JSON.
- [books/space-marines/v2/generated/base.json](../../books/space-marines/v2/generated/base.json) — JSON.
- [books/space-marines/v2/generated/effective.json](../../books/space-marines/v2/generated/effective.json) — JSON.
- [books/space-marines/v2/identity-bindings.json](../../books/space-marines/v2/identity-bindings.json) — JSON.
- [books/space-marines/v2/official-bindings.json](../../books/space-marines/v2/official-bindings.json) — JSON.
- [books/space-marines/v2/official.py](../../books/space-marines/v2/official.py) — PY.
- [books/space-marines/v2/rule-clause-review.json](../../books/space-marines/v2/rule-clause-review.json) — JSON.
- [books/space-marines/v2/rule-contract-declarations.mjs](../../books/space-marines/v2/rule-contract-declarations.mjs) — MJS.
- [books/space-marines/v2/source-bindings.json](../../books/space-marines/v2/source-bindings.json) — JSON.
- [books/space-marines/v2/sources/enrollment.json](../../books/space-marines/v2/sources/enrollment.json) — JSON.
- [books/space-marines/v2/sources/raw/official-sm-updates.pdf](../../books/space-marines/v2/sources/raw/official-sm-updates.pdf) — PDF.
- [books/space-marines/v2/sources/raw/wahapedia-datasheets-probe.html](../../books/space-marines/v2/sources/raw/wahapedia-datasheets-probe.html) — FROZEN_HTML.
- [books/space-marines/v2/sources/raw/wahapedia-datasheets-probe.html](../../books/space-marines/v2/sources/raw/wahapedia-datasheets-probe.html) — HTML.
- [books/space-marines/v2/sources/raw/wahapedia-space-marines-main.html](../../books/space-marines/v2/sources/raw/wahapedia-space-marines-main.html) — FROZEN_HTML.
- [books/space-marines/v2/sources/raw/wahapedia-space-marines-main.html](../../books/space-marines/v2/sources/raw/wahapedia-space-marines-main.html) — HTML.

**Проверенная цепочка producers → runtime/presentation:**
- [books/shared/army-book-app-v2/personal.mjs:506](../../books/shared/army-book-app-v2/personal.mjs#L506) — `const hasSource=row=>`.
- [books/shared/roster-v2/conditional-policy.mjs:13](../../books/shared/roster-v2/conditional-policy.mjs#L13) — `clause.rosterClassification==='DISPLAY_ONLY'&&clause.rosterEffects.length===0`.
- [books/shared/roster-v2/conditional-policy.mjs:69](../../books/shared/roster-v2/conditional-policy.mjs#L69) — `return ['MODEL_KEYWORD','UNIT_KEYWORD','MODEL_ID','UNIT_ID'].includes(node?.predicate)`.
- [books/shared/roster-v2/conditional-policy.mjs:87](../../books/shared/roster-v2/conditional-policy.mjs#L87) — `['EFFECT_RECIPIENT','RECIPIENT'].includes(role.purpose)`.
- [books/shared/roster-v2/conditional-policy.mjs:141](../../books/shared/roster-v2/conditional-policy.mjs#L141) — `clause.rosterClassification!=='BATTLE_ONLY'`.
- [books/shared/roster-v2/conditional-policy.mjs:240](../../books/shared/roster-v2/conditional-policy.mjs#L240) — `export function projectConditionalRow`.
- [books/shared/roster-v2/detachment-reference-build.mjs:14](../../books/shared/roster-v2/detachment-reference-build.mjs#L14) — `assert.ok(!row.ruleContract,'Unreviewed allied rule execution')`.
- [books/shared/rule-contract-v2/bindings.mjs:4](../../books/shared/rule-contract-v2/bindings.mjs#L4) — `Typed declarations are the input authority`.
- [books/shared/rule-contract-v2/bindings.mjs:145](../../books/shared/rule-contract-v2/bindings.mjs#L145) — `export function bindCanonicalContract`.
- [books/shared/rule-contract-v2/schema.mjs:229](../../books/shared/rule-contract-v2/schema.mjs#L229) — `case 'ALWAYS': return 'TRUE'`.
- [books/space-marines/v2/app-build.mjs:20](../../books/space-marines/v2/app-build.mjs#L20) — `export function buildApp()`.
- [books/space-marines/v2/build.py:179](../../books/space-marines/v2/build.py#L179) — `'DATASHEET_SECTION',owner`.
- [books/space-marines/v2/build.py:318](../../books/space-marines/v2/build.py#L318) — `def verify_sources(`.
- [books/space-marines/v2/build.py:329](../../books/space-marines/v2/build.py#L329) — `source-bindings.json`.
- [books/space-marines/v2/build.py:330](../../books/space-marines/v2/build.py#L330) — `identity-bindings.json`.
- [books/space-marines/v2/build.py:407](../../books/space-marines/v2/build.py#L407) — `def build():`.
- [books/space-marines/v2/build.py:418](../../books/space-marines/v2/build.py#L418) — `effective=apply_official(base,root=ROOT)`.
- [books/space-marines/v2/gameplay-presentation-build.mjs:22](../../books/space-marines/v2/gameplay-presentation-build.mjs#L22) — `export function buildGameplayPresentation`.
- [books/space-marines/v2/mfm-build.mjs:7](../../books/space-marines/v2/mfm-build.mjs#L7) — `import {buildNativeBook}`.
- [books/space-marines/v2/official.py:62](../../books/space-marines/v2/official.py#L62) — `def apply_official(`.
- [books/space-marines/v2/official.py:65](../../books/space-marines/v2/official.py#L65) — `official-bindings.json`.
- [books/space-marines/v2/registration.mjs:8](../../books/space-marines/v2/registration.mjs#L8) — `async loadPayload()`.
- [books/space-marines/v2/roster-boot.mjs:6](../../books/space-marines/v2/roster-boot.mjs#L6) — `generated/roster-import.json`.
- [books/space-marines/v2/roster-import-build.mjs:146](../../books/space-marines/v2/roster-import-build.mjs#L146) — `generated/roster-import.json`.
- [books/space-marines/v2/rule-contract-build.mjs:25](../../books/space-marines/v2/rule-contract-build.mjs#L25) — `export function build`.
- [books/space-marines/v2/rule-contract-build.mjs:90](../../books/space-marines/v2/rule-contract-build.mjs#L90) — `return atom('ALWAYS'`.
- [books/space-marines/v2/rule-contract-build.mjs:98](../../books/space-marines/v2/rule-contract-build.mjs#L98) — `purpose:'OWNER'`.
- [books/space-marines/v2/rule-contract-build.mjs:143](../../books/space-marines/v2/rule-contract-build.mjs#L143) — `rosterClassification:'ROSTER_EXECUTABLE'`.
- [books/space-marines/v2/rule-contract-build.mjs:151](../../books/space-marines/v2/rule-contract-build.mjs#L151) — `rosterClassification:'DISPLAY_ONLY'`.
- [books/space-marines/v2/rule-contract-build.mjs:155](../../books/space-marines/v2/rule-contract-build.mjs#L155) — `bindCanonicalContract(`.
- [books/space-marines/v2/rule-contract-schema.mjs:4](../../books/space-marines/v2/rule-contract-schema.mjs#L4) — `export function create`.

Полные роли звеньев и ограничения: `books[].lineage` в JSON. Каждый anchor проверяется по указанной строке; первичные пути каждой записи — `source.paths[]`, исходная provenance сохранена целиком.

### tau-empire

**Принятые входы и форматы:**
- [books/tau-empire/v2/sources/enrollment.json](../../books/tau-empire/v2/sources/enrollment.json) — Pinned captured HTML/corpus/official PDF inventory, official v1.1 and central MFM declarations.
- [books/tau-empire/sources/waha-11e-current-2026-09-28/corpus.json](../../books/tau-empire/sources/waha-11e-current-2026-09-28/corpus.json) — Captured HTML transcription JSON; raw HTML XPath bindings preserve complete source blocks.
- [books/tau-empire/v2/source-bindings.json](../../books/tau-empire/v2/source-bindings.json) — Reviewed raw XPath addresses and textSha256, not alternative facts.
- [books/tau-empire/v2/identity-bindings.json](../../books/tau-empire/v2/identity-bindings.json) — Persistent source/canonical identities.
- [books/tau-empire/v2/official-bindings.json](../../books/tau-empire/v2/official-bindings.json) — Official PDF text regions and patch instructions.
- [books/tau-empire/v2/rule-clause-review.json](../../books/tau-empire/v2/rule-clause-review.json) — Exact source-field/quote fingerprints, reviewed classification, recipient descriptions and dependencies.
- [books/tau-empire/v2/rule-contract-declarations.mjs](../../books/tau-empire/v2/rule-contract-declarations.mjs) — Explicit reviewed executable operations, enhancement eligibility, pending exact-weapon bindings.
- [books/tau-empire/v2/roster-import-source-bindings.json](../../books/tau-empire/v2/roster-import-source-bindings.json) — Physical composition/equipment/BSData vocabulary bindings.

**Проверенная цепочка producers → runtime/presentation:**
- [books/tau-empire/v2/build.py:60](../../books/tau-empire/v2/build.py#L60) — `def verify_sources(enrollment):`.
- [books/tau-empire/v2/build.py:200](../../books/tau-empire/v2/build.py#L200) — `# Factual native recipients; semantic/executable classification belongs to Stage 3.`.
- [books/tau-empire/v2/registration.mjs:10](../../books/tau-empire/v2/registration.mjs#L10) — `async createRoster(){return (await import('./roster-boot.mjs')).createBrowserRoster();}`.
- [books/tau-empire/v2/roster-boot.mjs:16](../../books/tau-empire/v2/roster-boot.mjs#L16) — `const runtime=createTauRosterRuntime(book),importer=createTauRosterImport(book)`.
- [books/tau-empire/v2/roster-boot.mjs:100](../../books/tau-empire/v2/roster-boot.mjs#L100) — `const response=await read(new URL('./generated/roster-import.json',import.meta.url));`.
- [books/tau-empire/v2/roster-import-build.mjs:20](../../books/tau-empire/v2/roster-import-build.mjs#L20) — `export function buildTauImportBook()`.
- [books/tau-empire/v2/roster-import.mjs:165](../../books/tau-empire/v2/roster-import.mjs#L165) — `const candidate=imports.load(value),boundBook=`.
- [books/tau-empire/v2/roster-source-choices.mjs:49](../../books/tau-empire/v2/roster-source-choices.mjs#L49) — `export function validateTauAttachmentSourceConditions(book,state)`.
- [books/tau-empire/v2/roster-source-choices.mjs:189](../../books/tau-empire/v2/roster-source-choices.mjs#L189) — `export function bindTauStudentPairs(book,state)`.
- [books/tau-empire/v2/rule-contract-build.mjs:18](../../books/tau-empire/v2/rule-contract-build.mjs#L18) — `export function buildTauContracts({facts=`.
- [books/tau-empire/v2/rule-contract-build.mjs:127](../../books/tau-empire/v2/rule-contract-build.mjs#L127) — `const staticPresentation=entity.kind=`.
- [books/tau-empire/v2/rule-contract-build.mjs:133](../../books/tau-empire/v2/rule-contract-build.mjs#L133) — `reviewedRecipient:{scope:row.recipientScope`.
- [books/tau-empire/v2/rule-contract-schema.mjs:4](../../books/tau-empire/v2/rule-contract-schema.mjs#L4) — `export function createTauRuleSchema(`.

Полные роли звеньев и ограничения: `books[].lineage` в JSON. Каждый anchor проверяется по указанной строке; первичные пути каждой записи — `source.paths[]`, исходная provenance сохранена целиком.

**Ограничение шаблона:** Student/prototype/Shield могут добавлять clauses по подтверждённому физическому выбору при импорте. Они не считаются отсутствующим игровым механизмом; отдельные будущие физические экземпляры этой статической описью не порождаются.

### tyranids

**Принятые входы и форматы:**
- [books/tyranids/v2/sources/enrollment.json](../../books/tyranids/v2/sources/enrollment.json) — Pinned accepted HTML/corpus/current official v1.3 PDF inventory, central MFM owner.
- [books/tyranids/sources/waha-11e-current-2026-09-27/corpus.json](../../books/tyranids/sources/waha-11e-current-2026-09-27/corpus.json) — Captured HTML transcription JSON; raw named rule and enhancement locators preserve complete source text.
- [books/tyranids/v2/source-bindings.json](../../books/tyranids/v2/source-bindings.json) — Persistent reviewed raw named-rule anchors/XPaths/text hashes.
- [books/tyranids/v2/identity-bindings.json](../../books/tyranids/v2/identity-bindings.json) — Persistent canonical identity/owner bindings.
- [books/tyranids/v2/official-bindings.json](../../books/tyranids/v2/official-bindings.json) — Official PDF occurrence/override declarations.
- [books/tyranids/v2/rule-contract-declarations.mjs](../../books/tyranids/v2/rule-contract-declarations.mjs) — Nineteen explicitly quoted reviewed semantic owners plus deferred source-evidence candidates.
- [books/tyranids/v2/roster-import-source-bindings.json](../../books/tyranids/v2/roster-import-source-bindings.json) — Physical model/composition/export vocabulary and allowed weapon bindings.
- [books/tyranids/v2/source-issues.json](../../books/tyranids/v2/source-issues.json) — Explicit unresolved source conflicts, including Foul Spores; not a permissive aura declaration.

**Проверенная цепочка producers → runtime/presentation:**
- [books/tyranids/v2/app-build.mjs:164](../../books/tyranids/v2/app-build.mjs#L164) — `for(const [name,value]of [['app-presentation',payload],['roster-runtime',built.book]])`.
- [books/tyranids/v2/build.py:20](../../books/tyranids/v2/build.py#L20) — `SOURCE = 'books/tyranids/sources/waha-11e-current-2026-09-27'`.
- [books/tyranids/v2/registration.mjs:14](../../books/tyranids/v2/registration.mjs#L14) — `async createRoster(){return (await import('./roster-boot.mjs')).createBrowserRoster();}`.
- [books/tyranids/v2/roster-boot.mjs:86](../../books/tyranids/v2/roster-boot.mjs#L86) — `const response=await read(new URL('./generated/roster-runtime.json',import.meta.url));`.
- [books/tyranids/v2/roster-import-build.mjs:14](../../books/tyranids/v2/roster-import-build.mjs#L14) — `export function buildTyranidsImportBook(facts=`.
- [books/tyranids/v2/roster-source-choices.mjs:28](../../books/tyranids/v2/roster-source-choices.mjs#L28) — `export function validateTyranidsSourceChoices(book,state)`.
- [books/tyranids/v2/roster-source-choices.mjs:84](../../books/tyranids/v2/roster-source-choices.mjs#L84) — `export function createTyranidsRuleSchema(`.
- [books/tyranids/v2/rule-contract-build.mjs:19](../../books/tyranids/v2/rule-contract-build.mjs#L19) — `export function buildTyranidsContracts({facts=`.
- [books/tyranids/v2/rule-contract-build.mjs:21](../../books/tyranids/v2/rule-contract-build.mjs#L21) — `assert.equal(inputs.length,19,`.
- [books/tyranids/v2/rule-contract-build.mjs:87](../../books/tyranids/v2/rule-contract-build.mjs#L87) — `evidence:clone(executableEvidence),sourceText:input.executableQuote||input.quote,rosterClassification:'ROSTER_EXECUTABLE',`.
- [books/tyranids/v2/rule-contract-build.mjs:107](../../books/tyranids/v2/rule-contract-build.mjs#L107) — `sourceText:quote,rosterClassification:'BATTLE_ONLY'`.
- [books/tyranids/v2/rule-contract-build.mjs:150](../../books/tyranids/v2/rule-contract-build.mjs#L150) — `const deferred=conditionalCandidates.map(input=>`.
- [books/tyranids/v2/rule-contract-declarations.mjs:105](../../books/tyranids/v2/rule-contract-declarations.mjs#L105) — `export const conditionalCandidates=[`.

Полные роли звеньев и ограничения: `books[].lineage` в JSON. Каждый anchor проверяется по указанной строке; первичные пути каждой записи — `source.paths[]`, исходная provenance сохранена целиком.

## 2. Полный словарь используемых конструкций

Общая схема: [books/shared/rule-contract-v2/schema.mjs:5](../../books/shared/rule-contract-v2/schema.mjs#L5). Допустимые subjects: `MODEL`, `UNIT`, `FORMED_ATTACHED_UNIT`, `ROSTER`. Контексты: `STATIC`, `ROSTER`, `BATTLE`. Предикаты: `ALWAYS`, `BODYGUARD_ID`, `CHARACTER_MODEL_COUNT`, `DETACHMENT`, `FIELD`, `LEADING`, `MODEL_ABILITY`, `MODEL_ID`, `MODEL_KEYWORD`, `UNIT_ID`, `UNIT_KEYWORD`. Это определения общей схемы; фактическое употребление ниже посчитано отдельно.

`dictionary` содержит частоты **каждого сериализованного употребления** во всех ruleContract книги: contract roles и clause roles считаются раздельно, копии одного predicate в разных местах тоже считаются раздельно. `ABSENT` — реально отсутствующее поле, а не значение по умолчанию. Полные AST условий/селекторов остаются в записях и `predicateArguments.*`; это не подсчёт уникальных игровых правил.

В JSON по каждой книге также есть `clause.fieldNames`, `contractRole.fieldNames`, `clauseRole.fieldNames`, `rosterEffect.fieldNames`, `fieldDefinitions`, `FIELD.keyAndLevel` и `additionalPredicateUsage`. Они отделяют общий каркас от фактически используемых полей расширения и локальных FIELD. Расширение не объявляется неподдержанным лишь потому, что его нет в основном schema.mjs.

### adeptus-mechanicus

| Конструкция | Фактические значения × число |
|---|---|
| `contractSchema` | `rule-contract/v2` × 205 |
| `executionMode` | `BATTLE_ACTION` × 51; `DATASHEET_DECLARATION` × 60; `DECLARATIVE_APPLICABILITY` × 85; `SOURCE_DIRECTIVE` × 9 |
| `contractRole.subject` | `MODEL` × 115; `ROSTER` × 9; `UNIT` × 134 |
| `contractRole.purpose` | `ANCHOR` × 12; `DECLARED_PARTICIPANT` × 9; `EFFECT_RECIPIENT` × 38; `OWNER` × 126; `TARGET` × 53; `TRIGGER_ACTOR` × 20 |
| `contractRole.binding` | `ABSENT` × 140; `INDEPENDENT_ENTITY` × 3; `ROSTER_MODELS` × 2; `ROSTER_UNITS` × 1; `SOURCE_MODEL` × 65; `SOURCE_UNIT` × 47 |
| `contractRole.sourceRoleId` | `ABSENT` × 258 |
| `clauseRole.subject` | `FORMED_ATTACHED_UNIT` × 5; `MODEL` × 221; `ROSTER` × 10; `UNIT` × 281 |
| `clauseRole.purpose` | `ANCHOR` × 42; `DECLARED_PARTICIPANT` × 16; `EFFECT_RECIPIENT` × 120; `OWNER` × 178; `ROSTER_RESTRICTION` × 1; `TARGET` × 79; `TRIGGER_ACTOR` × 81 |
| `clauseRole.binding` | `ABSENT` × 192; `ATTACK_TARGET` × 4; `INDEPENDENT_ENTITY` × 52; `LEADERS_OF_SOURCE` × 2; `ROSTER_MODELS` × 5; `ROSTER_UNITS` × 1; `SOURCE_FORMED_MODELS` × 12; `SOURCE_MODEL` × 135; `SOURCE_UNIT` × 109; `SOURCE_UNIT_MODELS` × 5 |
| `clauseRole.sourceRoleId` | `ABSENT` × 512; `beneficiary` × 1; `halo-unit` × 3; `led-unit` × 1 |
| `effectRecipientRoleIds` | `ABSENT` × 201; `["bearerUnit"]` × 2; `["datasmith"]` × 1; `["disembarkingUnit"]` × 1; `["enemyRecipients"]` × 2; `["enemyTarget"]` × 2; `["formedModels"]` × 4; `["recipient"]` × 13; `["recipientModels","optionalRecipientModels"]` × 1; `["recipientModels"]` × 18; `["recipientUnit"]` × 11; `["sourceUnit"]` × 1; `["target","optionalSupport"]` × 4; `["target","secondTarget"]` × 2; `["target","smokeSupport"]` × 1; `["target"]` × 23; `[]` × 2 |
| `rosterEffect.targetBinding` | `LEADERS_OF_SOURCE` × 1; `ROSTER_MODELS` × 3; `ROSTER_UNITS` × 3; `SOURCE_FORMED_MODELS` × 10; `SOURCE_MODEL` × 16; `SOURCE_UNIT` × 20; `SOURCE_UNIT_MODELS` × 1 |
| `rosterEffect.targetSubject` | `MODEL` × 31; `UNIT` × 23 |
| `rosterEffect.unitScope` | `ABSENT` × 48; `FORMED` × 5; `PHYSICAL` × 1 |
| `rosterEffect.containingUnitScope` | `ABSENT` × 51; `FORMED` × 1; `PHYSICAL` × 2 |
| `conditionalPolicy.kind` | `ABSENT` × 289 |
| `conditionalPolicy.recipientScope` | `ABSENT` × 289 |
| `predicates` | `ALWAYS` × 177; `BODYGUARD_ID` × 10; `DETACHMENT` × 95; `FIELD` × 552; `LEADING` × 31; `MODEL_ABILITY` × 1; `MODEL_ID` × 201; `MODEL_KEYWORD` × 252; `UNIT_ID` × 529; `UNIT_KEYWORD` × 304; `{"args":[{"args":[{"arguments":{"keyword":"SKITARII"},"contextLevel":"STATIC","evidence":{"field":["text"],"quote":"SKITARII"},"predicate":"UNIT_KEYWORD","subject":"UNIT"},{"arguments":{"keyword":"INFANTRY"},"contextLevel":"STATIC","evidence":{"field":["text"],"quote":"INFANTRY"},"predicate":"UNIT_KEYWORD","subject":"UNIT"}],"op":"ALL"},{"args":[{"arguments":{"keyword":"SKITARII"},"contextLevel":"STATIC","evidence":{"field":["text"],"quote":"SKITARII"},"predicate":"UNIT_KEYWORD","subject":"UNIT"},{"arguments":{"keyword":"MOUNTED"},"contextLevel":"STATIC","evidence":{"field":["text"],"quote":"MOUNTED"},"predicate":"UNIT_KEYWORD","subject":"UNIT"}],"op":"ALL"},{"arguments":{"keyword":"IRONSTRIDER BALLISTARII"},"contextLevel":"STATIC","evidence":{"field":["text"],"quote":"IRONSTRIDER BALLISTARII"},"predicate":"UNIT_KEYWORD","subject":"UNIT"}],"op":"ANY","subject":"UNIT"}` × 1; `{"args":[{"arguments":{"id":"unit-kastelan-robots"},"contextLevel":"ROSTER","evidence":{"field":["blocks",1,"text"],"quote":"If there are no KASTELAN ROBOT models in this unit"},"predicate":"BODYGUARD_ID","subject":"MODEL"}],"op":"NOT","roleId":"sourceModel","subject":"MODEL"}` × 2; `{"args":[{"arguments":{"keyword":"ELECTRO-PRIESTS"},"contextLevel":"STATIC","evidence":{"field":["blocks",0,"text"],"quote":"ELECTRO-PRIESTS"},"predicate":"UNIT_KEYWORD","subject":"FORMED_ATTACHED_UNIT"}],"op":"NOT","subject":"FORMED_ATTACHED_UNIT"}` × 1; `{"args":[{"arguments":{"keyword":"PTERAXII"},"contextLevel":"STATIC","evidence":{"field":["text"],"quote":"PTERAXII"},"predicate":"UNIT_KEYWORD","subject":"UNIT"},{"arguments":{"keyword":"INFILTRATORS"},"contextLevel":"STATIC","evidence":{"field":["text"],"quote":"INFILTRATORS"},"predicate":"UNIT_KEYWORD","subject":"UNIT"},{"arguments":{"keyword":"RANGERS"},"contextLevel":"STATIC","evidence":{"field":["text"],"quote":"RANGERS"},"predicate":"UNIT_KEYWORD","subject":"UNIT"},{"arguments":{"id":"unit-serberys-raiders"},"contextLevel":"STATIC","evidence":{"field":["text"],"quote":"SERBERYS RAIDERS"},"predicate":"UNIT_ID","subject":"UNIT"},{"arguments":{"id":"unit-serberys-sulphurhounds"},"contextLevel":"STATIC","evidence":{"field":["text"],"quote":"SERBERYS SULPHURHOUNDS"},"predicate":"UNIT_ID","subject":"UNIT"}],"op":"ANY"}` × 1; `{"arguments":{"equals":false,"key":"attached"},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"Models in the bearer’s unit"},"predicate":"FIELD","roleId":"owner","subject":"MODEL"}` × 1; `{"arguments":{"equals":true,"key":"attached"},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"Models in the bearer’s unit"},"predicate":"FIELD","roleId":"owner","subject":"MODEL"}` × 1; `{"arguments":{"equals":true,"key":"equipmentRequirementSatisfied"},"contextLevel":"ROSTER","evidence":{"field":["blocks",1,"text"],"quote":"Chaff Launcher"},"predicate":"FIELD","roleId":"sourceModel","subject":"MODEL"}` × 3; `{"arguments":{"equals":true,"key":"equipmentRequirementSatisfied"},"contextLevel":"ROSTER","evidence":{"field":["blocks",2,"text"],"quote":"Broad spectrum data-tether"},"predicate":"FIELD","roleId":"sourceModel","subject":"MODEL"}` × 1; `{"arguments":{"equals":true,"key":"equipmentRequirementSatisfied"},"contextLevel":"ROSTER","evidence":{"field":["blocks",2,"text"],"quote":"Omnispex"},"predicate":"FIELD","subject":"UNIT"}` × 2; `{"arguments":{"id":"datasheet-cybernetica-datasmith:profile:default"},"contextLevel":"STATIC","evidence":{"field":["name"],"otherEntityId":"datasheet-cybernetica-datasmith:profile:default","quote":"Cybernetica Datasmith"},"predicate":"MODEL_ID","subject":"MODEL"}` × 1; `{"arguments":{"id":"unit-kastelan-robots"},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"When the bearer is attached to a KASTELAN ROBOTS unit"},"predicate":"BODYGUARD_ID","roleId":"owner","subject":"MODEL"}` × 1; `{"arguments":{"id":"unit-kastelan-robots"},"contextLevel":"ROSTER","evidence":{"field":["title"],"otherEntityId":"unit-kastelan-robots","quote":"Kastelan Robots"},"predicate":"BODYGUARD_ID","subject":"MODEL"}` × 1; `{"arguments":{"keyword":"CORPUSCARII"},"contextLevel":"STATIC","evidence":{"field":["text"],"quote":"CORPUSCARII"},"predicate":"UNIT_KEYWORD","subject":"UNIT"}` × 1; `{"arguments":{"keyword":"ELECTRO-PRIESTS"},"contextLevel":"STATIC","evidence":{"field":["blocks",0,"text"],"quote":"ELECTRO-PRIESTS"},"predicate":"UNIT_KEYWORD","subject":"FORMED_ATTACHED_UNIT"}` × 1; `{"arguments":{"value":false},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"models in any unit they are leading"},"predicate":"LEADING","roleId":"owner","subject":"MODEL"}` × 2; `{"arguments":{"value":true},"contextLevel":"ROSTER","evidence":{"field":["blocks",0,"text"],"quote":"While this model is leading a unit"},"predicate":"LEADING","subject":"MODEL"}` × 4; `{"arguments":{"value":true},"contextLevel":"ROSTER","evidence":{"field":["blocks",0,"text"],"quote":"is leading this unit"},"predicate":"LEADING","subject":"MODEL"}` × 1; `{"arguments":{"value":true},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"When the bearer is attached to a KASTELAN ROBOTS unit"},"predicate":"LEADING","roleId":"owner","subject":"MODEL"}` × 1; `{"arguments":{"value":true},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"While the bearer is leading a unit"},"predicate":"LEADING","roleId":"owner","subject":"MODEL"}` × 1; `{"arguments":{"value":true},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"While the bearer is leading a unit"},"predicate":"LEADING","subject":"MODEL"}` × 1; `{"arguments":{"value":true},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"models in any unit they are leading"},"predicate":"LEADING","roleId":"owner","subject":"MODEL"}` × 2 |
| `predicateContext` | `BATTLE` × 476; `ROSTER` × 236; `STATIC` × 1470 |
| `rosterClassification` | `BATTLE_ONLY` × 175; `NOT_AN_EFFECT` × 70; `ROSTER_EXECUTABLE` × 44 |

Связи ролей (`actorRoleId`, `prerequisites`, `distinctFromRoleIds`, required/optional) со всеми значениями и частотами: `books[0].dictionary` в JSON. Отсутствующий purpose не доказывает получателя.

**FIELD key / уровень × число:** `["aboutToConsolidate","BATTLE"]` × 2; `["analysed","BATTLE"]` × 1; `["atEndOfPhase","BATTLE"]` × 1; `["atStartOfBattle","BATTLE"]` × 1; `["atStartOfBattleRound","BATTLE"]` × 1; `["atStartOfFirstBattleRound","BATTLE"]` × 3; `["atStartOfPhase","BATTLE"]` × 7; `["attached","ROSTER"]` × 5; `["attackAllocated","BATTLE"]` × 1; `["attackFromTargetUnitAllocatedToModel","BATTLE"]` × 2; `["attackType","BATTLE"]` × 2; `["battleInProgress","BATTLE"]` × 2; `["battleRoundInTwoToFive","BATTLE"]` × 1; `["battleShocked","BATTLE"]` × 3; `["belowStartingStrength","BATTLE"]` × 2; `["bombardmentChoice","BATTLE"]` × 2; `["bothArmiesDeployed","BATTLE"]` × 1; `["broadSpectrumDataTetherEquipped","ROSTER"]` × 1; `["canAttachToReferencedUnit","ROSTER"]` × 3; `["characterModelLeadingSource","ROSTER"]` × 1; `["citationInSavageryActive","BATTLE"]` × 1; `["commandUplinkEquipped","ROSTER"]` × 3; `["conquerorImperativeActive","BATTLE"]` × 7; `["containsTechPriestModel","ROSTER"]` × 1; `["destroyed","BATTLE"]` × 3; `["disembarkedFromTransportThisTurn","BATTLE"]` × 2; `["disembarkingFromTargetModel","BATTLE"]` × 2; `["equipmentBearerLabel","ROSTER"]` × 2; `["equipmentRequirementSatisfied","ROSTER"]` × 12; `["everyModelWithin3OfTargetTransport","BATTLE"]` × 2; `["failedBattleShockTest","BATTLE"]` × 1; `["foughtThisPhase","BATTLE"]` × 2; `["hasFought","BATTLE"]` × 1; `["hasShot","BATTLE"]` × 1; `["hasShotThisPhase","BATTLE"]` × 4; `["inOptionalSupportUnit","ROSTER"]` × 2; `["inTargetUnit","ROSTER"]` × 45; `["justAllocatedMortalWound","BATTLE"]` × 2; `["justDeclaredCharge","BATTLE"]` × 4; `["justDestroyed","BATTLE"]` × 2; `["justEndedNormalAdvanceOrFallBackMove","BATTLE"]` × 2; `["justFellBack","BATTLE"]` × 2; `["justSelectedAttackTargets","BATTLE"]` × 14; `["justShot","BATTLE"]` × 4; `["leadershipTestPassed","BATTLE"]` × 2; `["lostModelsToTriggerEnemyUnit","BATTLE"]` × 2; `["madeChargeMoveThisTurn","BATTLE"]` × 1; `["makingAttack","BATTLE"]` × 5; `["meleeAttackTargetsUnit","BATTLE"]` × 3; `["modelInUnitMakingAttack","BATTLE"]` × 3; `["moreThan3FromAllEnemyUnits","BATTLE"]` × 2; `["onBattlefield","BATTLE"]` × 1; `["oncePerBattleRoundUseAvailable","BATTLE"]` × 1; `["oncePerBattleUseAvailable","BATTLE"]` × 4; `["oncePerPhaseUseAvailable","BATTLE"]` × 1; `["oncePerTurnUseAvailable","BATTLE"]` × 2; `["otherDataPsalmDetachmentSelected","ROSTER"]` × 1; `["panegyricProcessionActive","BATTLE"]` × 1; `["phase","BATTLE"]` × 79; `["phaseBoundary","BATTLE"]` × 8; `["protectorImperativeActive","BATTLE"]` × 7; `["remainingWoundsBand","BATTLE"]` × 2; `["resolvingFallout","BATTLE"]` × 1; `["savingThrowFailed","BATTLE"]` × 1; `["secondBattleRoundOrLater","BATTLE"]` × 1; `["selectedAttackTargetsNow","BATTLE"]` × 2; `["selectedObjectiveIsAcquisitionObjective","BATTLE"]` × 2; `["selectedObjectiveWithin24","BATTLE"]` × 4; `["selectedOverrideAbility","BATTLE"]` × 4; `["selectedToAdvanceNow","BATTLE"]` × 2; `["selectedToAttackNow","BATTLE"]` × 2; `["selectedToFallBackNow","BATTLE"]` × 4; `["selectedToFight","BATTLE"]` × 1; `["selectedToFightThisPhase","BATTLE"]` × 14; `["selectedToMoveThisPhase","BATTLE"]` × 5; `["selectedToShoot","BATTLE"]` × 1; `["selectedToShootNow","BATTLE"]` × 2; `["selectedToShootThisPhase","BATTLE"]` × 21; `["settingUpAsReinforcements","BATTLE"]` × 1; `["startingActionNow","BATTLE"]` × 2; `["sufficientCapacityForEntireTargetUnit","BATTLE"]` × 2; `["targetTransportMadeNormalMove","BATTLE"]` × 2; `["targetedByTriggerEnemyCharge","BATTLE"]` × 2; `["targetedByTriggerEnemyUnit","BATTLE"]` × 18; `["turnOwner","BATTLE"]` × 79; `["usedPostShootingNormalMove","BATTLE"]` × 1; `["visibleEnemyTarget","BATTLE"]` × 2; `["visibleToBearer","BATTLE"]` × 1; `["visibleToReconUnit","BATTLE"]` × 1; `["within12OfBearer","BATTLE"]` × 5; `["within12OfReconAnchor","BATTLE"]` × 2; `["within12OfReconUnit","BATTLE"]` × 1; `["within18OfTargetUnit","BATTLE"]` × 3; `["within3OfEnemyUnit","BATTLE"]` × 2; `["within6OfCultMechanicusModelInTargetUnit","BATTLE"]` × 2; `["within6OfOpponentDeploymentZone","BATTLE"]` × 1; `["within6OfTargetUnit","BATTLE"]` × 11; `["within8OfTriggerEnemyUnit","BATTLE"]` × 2; `["withinAcquisitionObjectiveRange","BATTLE"]` × 6; `["withinEnemyEngagementRange","BATTLE"]` × 2; `["withinEngagementRange","BATTLE"]` × 1; `["withinEngagementRangeOfEnemy","BATTLE"]` × 8; `["withinEngagementRangeOfTargetUnit","BATTLE"]` × 2; `["withinFriendlyMechanicusBattleline6","BATTLE"]` × 6; `["withinFriendlyMechanicusVehicle3","BATTLE"]` × 1; `["withinHalfWeaponRange","BATTLE"]` × 1; `["withinOpponentDeploymentZone","BATTLE"]` × 2; `["withinOtherFriendlyMechanicus3","BATTLE"]` × 2; `["withinRangeOfAcquisitionObjective","BATTLE"]` × 2; `["withinRangeOfFriendlyControlledObjectiveWhenDestroyed","BATTLE"]` × 2; `["withinRangeOfObjective","BATTLE"]` × 2; `["withinRangeOfSelectedObjective","BATTLE"]` × 2; `["withinSource12","BATTLE"]` × 1; `["withinSource3","BATTLE"]` × 2; `["withinSource6","BATTLE"]` × 13; `["withinSourceEngagementRange","BATTLE"]` × 2.

Ключи без извлечённой literal-декларации: нет. Это **не** отсутствие schema: factories могут выводить объявления из FIELD-атомов или computed constant keys; точный исходный factory указан в `fieldDeclarationEvidence`/`lineage.producerRefs`. Числа употребления ключей вычислены из данных независимо от literal extraction.

### blood-angels

| Конструкция | Фактические значения × число |
|---|---|
| `contractSchema` | `rule-contract/v2` × 340 |
| `executionMode` | `BATTLE_ACTION` × 60; `DECLARATIVE_APPLICABILITY` × 280 |
| `contractRole.subject` | `MODEL` × 32; `UNIT` × 308 |
| `contractRole.purpose` | `OWNER` × 340 |
| `contractRole.binding` | `ABSENT` × 340 |
| `contractRole.sourceRoleId` | `ABSENT` × 340 |
| `clauseRole.subject` | `MODEL` × 80; `UNIT` × 674 |
| `clauseRole.purpose` | `OWNER` × 754 |
| `clauseRole.binding` | `ABSENT` × 754 |
| `clauseRole.sourceRoleId` | `ABSENT` × 754 |
| `effectRecipientRoleIds` | `ABSENT` × 754 |
| `rosterEffect.targetBinding` | `ROSTER_MODELS` × 1; `ROSTER_UNITS` × 1; `SOURCE_FORMED_MODELS` × 5; `SOURCE_MODEL` × 21; `SOURCE_UNIT` × 23; `SOURCE_UNIT_MODELS` × 5 |
| `rosterEffect.targetSubject` | `MODEL` × 32; `UNIT` × 24 |
| `rosterEffect.unitScope` | `ABSENT` × 45; `FORMED` × 11 |
| `rosterEffect.containingUnitScope` | `ABSENT` × 55; `FORMED` × 1 |
| `conditionalPolicy.kind` | `ABSENT` × 741; `ACTION_CP_MODIFIER` × 1; `ATTACK_TARGET_RESTRICTION` × 1; `INCOMING_MODIFIER` × 3; `REROLL` × 8 |
| `conditionalPolicy.recipientScope` | `ABSENT` × 741; `FORMED_UNIT` × 11; `ROSTER_UNITS` × 2 |
| `predicates` | `ALWAYS` × 955; `FIELD` × 30; `MODEL_ID` × 3; `MODEL_KEYWORD` × 172; `UNIT_KEYWORD` × 95; `{"args":[{"arguments":{"keyword":"ADEPTUS ASTARTES"},"contextLevel":"STATIC","evidence":{"field":["text"],"quote":"Friendly ADEPTUS ASTARTES TERMINATOR units have +1 to charge rolls."},"predicate":"UNIT_KEYWORD","subject":"UNIT"},{"arguments":{"keyword":"TERMINATOR"},"contextLevel":"STATIC","evidence":{"field":["text"],"quote":"Friendly ADEPTUS ASTARTES TERMINATOR units have +1 to charge rolls."},"predicate":"UNIT_KEYWORD","subject":"UNIT"}],"op":"ALL"}` × 1; `{"arguments":{"equals":false,"key":"attached"},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"Blood Chalice: This unit has +1 T."},"predicate":"FIELD","subject":"UNIT"}` × 1; `{"arguments":{"equals":false,"key":"attached"},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"Has 5+ InSv."},"predicate":"FIELD","subject":"UNIT"}` × 1; `{"arguments":{"equals":false,"key":"attached"},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"Honour of the Company: This unit has +1 OC."},"predicate":"FIELD","subject":"UNIT"}` × 1; `{"arguments":{"equals":false,"key":"attached"},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"Shield Dome: This unit has 5+ InSv."},"predicate":"FIELD","subject":"UNIT"}` × 1; `{"arguments":{"equals":false,"key":"attached"},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"This unit has +1 OC."},"predicate":"FIELD","subject":"UNIT"}` × 1; `{"arguments":{"equals":true,"key":"attached"},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"Blood Chalice: This unit has +1 T."},"predicate":"FIELD","subject":"UNIT"}` × 1; `{"arguments":{"equals":true,"key":"attached"},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"Has 5+ InSv."},"predicate":"FIELD","subject":"UNIT"}` × 1; `{"arguments":{"equals":true,"key":"attached"},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"Honour of the Company: This unit has +1 OC."},"predicate":"FIELD","subject":"UNIT"}` × 1; `{"arguments":{"equals":true,"key":"attached"},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"Shield Dome: This unit has 5+ InSv."},"predicate":"FIELD","subject":"UNIT"}` × 1; `{"arguments":{"equals":true,"key":"attached"},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"This unit has +1 OC."},"predicate":"FIELD","subject":"UNIT"}` × 1; `{"arguments":{"equals":true,"key":"equipmentRequirementSatisfied"},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"Combat Shield: This model has 5+ InSv."},"predicate":"FIELD","subject":"UNIT"}` × 1; `{"arguments":{"equals":true,"key":"equipmentRequirementSatisfied"},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"Grav-chutes: This unit has Deep Strike."},"predicate":"FIELD","subject":"UNIT"}` × 1; `{"arguments":{"equals":true,"key":"equipmentRequirementSatisfied"},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"Orbital Comms Array: This unit has Scouts 6\"."},"predicate":"FIELD","subject":"UNIT"}` × 1; `{"arguments":{"equals":true,"key":"equipmentRequirementSatisfied"},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"Relic Shield: This model has +1 W."},"predicate":"FIELD","subject":"UNIT"}` × 4; `{"arguments":{"equals":true,"key":"equipmentRequirementSatisfied"},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"Shield Dome: This unit has 5+ InSv."},"predicate":"FIELD","subject":"UNIT"}` × 2; `{"arguments":{"equals":true,"key":"equipmentRequirementSatisfied"},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"Storm Shield: This model has +1 W."},"predicate":"FIELD","subject":"UNIT"}` × 1; `{"arguments":{"equals":true,"key":"equipmentRequirementSatisfied"},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"Storm Shield: This model has a 4+ InSv."},"predicate":"FIELD","subject":"UNIT"}` × 1; `{"arguments":{"equals":true,"key":"smEquipmentBearerSatisfied"},"contextLevel":"ROSTER","evidence":{"field":["text"],"otherEntityId":"ability-ba-da87d6022de8416d9040","quote":"Relic Shield: This model has +1 W."},"predicate":"FIELD","subject":"MODEL"}` × 1; `{"arguments":{"equals":true,"key":"smEquipmentBearerSatisfied"},"contextLevel":"ROSTER","evidence":{"field":["text"],"otherEntityId":"ability-sm-097567b13c02404d","quote":"Storm Shield: This model has a 4+ InSv."},"predicate":"FIELD","subject":"MODEL"}` × 1; `{"arguments":{"equals":true,"key":"smEquipmentBearerSatisfied"},"contextLevel":"ROSTER","evidence":{"field":["text"],"otherEntityId":"ability-sm-431f22d15f7545b4","quote":"Relic Shield: This model has +1 W."},"predicate":"FIELD","subject":"MODEL"}` × 1; `{"arguments":{"equals":true,"key":"smEquipmentBearerSatisfied"},"contextLevel":"ROSTER","evidence":{"field":["text"],"otherEntityId":"ability-sm-63d4ca967fa64b79","quote":"Combat Shield: This model has 5+ InSv."},"predicate":"FIELD","subject":"MODEL"}` × 1; `{"arguments":{"equals":true,"key":"smEquipmentBearerSatisfied"},"contextLevel":"ROSTER","evidence":{"field":["text"],"otherEntityId":"ability-sm-8c9e7e37a8494c1d","quote":"Relic Shield: This model has +1 W."},"predicate":"FIELD","subject":"MODEL"}` × 1; `{"arguments":{"equals":true,"key":"smEquipmentBearerSatisfied"},"contextLevel":"ROSTER","evidence":{"field":["text"],"otherEntityId":"ability-sm-aa81f0067a3140de","quote":"Storm Shield: This model has +1 W."},"predicate":"FIELD","subject":"MODEL"}` × 1; `{"arguments":{"equals":true,"key":"smEquipmentBearerSatisfied"},"contextLevel":"ROSTER","evidence":{"field":["text"],"otherEntityId":"ability-sm-daf87042d20348dd","quote":"Relic Shield: This model has +1 W."},"predicate":"FIELD","subject":"MODEL"}` × 1; `{"arguments":{"equals":true,"key":"smPermanentAssaultSource"},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"If the assault doctrine is active for this unit, +2 S and AP."},"predicate":"FIELD","subject":"UNIT"}` × 2 |
| `predicateContext` | `ABSENT` × 31; `ROSTER` × 30; `STATIC` × 1225 |
| `rosterClassification` | `DISPLAY_ONLY` × 711; `ROSTER_EXECUTABLE` × 43 |

Связи ролей (`actorRoleId`, `prerequisites`, `distinctFromRoleIds`, required/optional) со всеми значениями и частотами: `books[1].dictionary` в JSON. Отсутствующий purpose не доказывает получателя.

**FIELD key / уровень × число:** `["attached","ROSTER"]` × 10; `["equipmentRequirementSatisfied","ROSTER"]` × 11; `["smEquipmentBearerSatisfied","ROSTER"]` × 7; `["smPermanentAssaultSource","ROSTER"]` × 2.

Ключи без извлечённой literal-декларации: нет. Это **не** отсутствие schema: factories могут выводить объявления из FIELD-атомов или computed constant keys; точный исходный factory указан в `fieldDeclarationEvidence`/`lineage.producerRefs`. Числа употребления ключей вычислены из данных независимо от literal extraction.

### chaos-space-marines

| Конструкция | Фактические значения × число |
|---|---|
| `contractSchema` | `rule-contract/v2` × 315 |
| `executionMode` | `BATTLE_ACTION` × 93; `DATASHEET_DECLARATION` × 21; `DECLARATIVE_APPLICABILITY` × 201 |
| `contractRole.subject` | `MODEL` × 195; `ROSTER` × 1; `UNIT` × 232 |
| `contractRole.purpose` | `ANCHOR` × 1; `DECLARED_PARTICIPANT` × 41; `EFFECT_RECIPIENT` × 43; `OWNER` × 184; `RECIPIENT` × 17; `SOURCE` × 21; `TARGET` × 119; `TRIGGER_ACTOR` × 2 |
| `contractRole.binding` | `ABSENT` × 182; `INDEPENDENT_ENTITY` × 41; `ROSTER` × 1; `ROSTER_MODELS` × 4; `ROSTER_UNITS` × 13; `RULE_APPLICABILITY` × 1; `SOURCE_FORMED_MODELS` × 2; `SOURCE_MODEL` × 146; `SOURCE_UNIT` × 37; `SOURCE_UNIT_MODELS` × 1 |
| `contractRole.sourceRoleId` | `ABSENT` × 428 |
| `clauseRole.subject` | `MODEL` × 281; `ROSTER` × 8; `UNIT` × 345 |
| `clauseRole.purpose` | `ACTOR` × 3; `ANCHOR` × 26; `DECLARED_PARTICIPANT` × 44; `EFFECT_RECIPIENT` × 43; `OWNER` × 226; `RECIPIENT` × 130; `SOURCE` × 21; `TARGET` × 130; `TRIGGER_ACTOR` × 11 |
| `clauseRole.binding` | `ABSENT` × 225; `INDEPENDENT_ENTITY` × 44; `ROSTER` × 1; `ROSTER_MODELS` × 30; `ROSTER_UNITS` × 60; `RULE_APPLICABILITY` × 2; `SOURCE_FORMED_MODELS` × 3; `SOURCE_MODEL` × 186; `SOURCE_UNIT` × 70; `SOURCE_UNIT_MODELS` × 13 |
| `clauseRole.sourceRoleId` | `ABSENT` × 634 |
| `effectRecipientRoleIds` | `ABSENT` × 240; `["attackingModels"]` × 1; `["bearer-unit"]` × 1; `["bodyguardModels"]` × 2; `["characterModels"]` × 1; `["destroyedEnemy"]` × 1; `["eligible-models"]` × 2; `["enemy"]` × 2; `["enemyRecipient"]` × 6; `["enemyRecipients"]` × 2; `["friendlyTarget"]` × 1; `["ledModels"]` × 1; `["owner"]` × 22; `["recipient"]` × 7; `["recipientModels"]` × 33; `["repairedVehicle"]` × 1; `["source"]` × 29; `["target","damnedTarget"]` × 1; `["target","enemyRecipient"]` × 1; `["target","optionalSecondTarget"]` × 1; `["target"]` × 46; `["unit-models"]` × 7; `[]` × 2 |
| `rosterEffect.targetBinding` | `ROSTER_MODELS` × 4; `ROSTER_UNITS` × 9; `SOURCE_FORMED_MODELS` × 11; `SOURCE_MODEL` × 44; `SOURCE_UNIT` × 2; `SOURCE_UNIT_MODELS` × 9 |
| `rosterEffect.targetSubject` | `MODEL` × 68; `UNIT` × 11 |
| `rosterEffect.unitScope` | `ABSENT` × 72; `FORMED` × 2; `PHYSICAL` × 5 |
| `rosterEffect.containingUnitScope` | `ABSENT` × 75; `FORMED` × 4 |
| `conditionalPolicy.kind` | `ABSENT` × 410 |
| `conditionalPolicy.recipientScope` | `ABSENT` × 410 |
| `predicates` | `ALWAYS` × 175; `DETACHMENT` × 172; `FIELD` × 1508; `LEADING` × 37; `MODEL_ABILITY` × 18; `MODEL_ID` × 256; `MODEL_KEYWORD` × 541; `UNIT_ID` × 494; `UNIT_KEYWORD` × 596; `{"args":[{"args":[{"arguments":{"keyword":"HERETIC ASTARTES"},"contextLevel":"STATIC","evidence":{"field":["content",0,"text"],"quote":"HERETIC ASTARTES VEHICLE, LORD DISCORDANT and VASHTORR THE ARKIFANE units from your army gain the SOUL FORGE keyword."},"predicate":"UNIT_KEYWORD","subject":"UNIT"},{"arguments":{"keyword":"VEHICLE"},"contextLevel":"STATIC","evidence":{"field":["content",0,"text"],"quote":"HERETIC ASTARTES VEHICLE, LORD DISCORDANT and VASHTORR THE ARKIFANE units from your army gain the SOUL FORGE keyword."},"predicate":"UNIT_KEYWORD","subject":"UNIT"}],"op":"ALL"},{"arguments":{"id":"unit-lord-discordant-on-helstalker"},"contextLevel":"STATIC","evidence":{"field":["content",0,"text"],"quote":"HERETIC ASTARTES VEHICLE, LORD DISCORDANT and VASHTORR THE ARKIFANE units from your army gain the SOUL FORGE keyword."},"predicate":"UNIT_ID","subject":"UNIT"},{"arguments":{"id":"unit-vashtorr-the-arkifane"},"contextLevel":"STATIC","evidence":{"field":["content",0,"text"],"quote":"HERETIC ASTARTES VEHICLE, LORD DISCORDANT and VASHTORR THE ARKIFANE units from your army gain the SOUL FORGE keyword."},"predicate":"UNIT_ID","subject":"UNIT"}],"op":"ANY","subject":"UNIT"}` × 1; `{"args":[{"arguments":{"id":"datasheet-traitor-enforcer:section:2:member:1"},"contextLevel":"STATIC","evidence":{"field":["name"],"otherEntityId":"datasheet-traitor-enforcer:profile:1","quote":"TRAITOR ENFORCER"},"predicate":"MODEL_ID","subject":"MODEL"},{"arguments":{"keyword":"CHARACTER"},"contextLevel":"STATIC","evidence":{"field":["text"],"quote":"CHARACTER models"},"predicate":"MODEL_KEYWORD","roleId":"characterModels","subject":"MODEL"}],"op":"ALL","subject":"MODEL"}` × 1; `{"args":[{"arguments":{"id":"unit-havocs"},"contextLevel":"STATIC","evidence":{"field":["content",0,"text"],"quote":"Friendly HAVOCS/OBLITERATORS units’ ranged attacks have [HEAVY]."},"predicate":"UNIT_ID","subject":"UNIT"},{"arguments":{"id":"unit-obliterators"},"contextLevel":"STATIC","evidence":{"field":["content",0,"text"],"quote":"Friendly HAVOCS/OBLITERATORS units’ ranged attacks have [HEAVY]."},"predicate":"UNIT_ID","subject":"UNIT"}],"op":"ANY","subject":"UNIT"}` × 1; `{"args":[{"arguments":{"keyword":"HERETIC ASTARTES"},"contextLevel":"STATIC","evidence":{"field":["content",0,"text"],"quote":"HERETIC ASTARTES VEHICLE units from your army gain the DAEMON keyword."},"predicate":"UNIT_KEYWORD","subject":"UNIT"},{"arguments":{"keyword":"VEHICLE"},"contextLevel":"STATIC","evidence":{"field":["content",0,"text"],"quote":"HERETIC ASTARTES VEHICLE units from your army gain the DAEMON keyword."},"predicate":"UNIT_KEYWORD","subject":"UNIT"}],"op":"ALL","subject":"UNIT"}` × 1; `{"args":[{"arguments":{"keyword":"HERETIC ASTARTES"},"contextLevel":"STATIC","evidence":{"field":["content",0,"text"],"quote":"When mustering your army, when you select a HERETIC ASTARTES unit to include in your army, if that unit is not an EPIC HERO and does not already have one of the following keywords, you must select one for that unit and note it on your Army Roster: KHORNE. TZEENTCH, NURGLE, SLAANESH, CHAOS UNDIVIDED. Each time a unit with one of these keywords gains a weapon ability as the result of a Dark Pact and does not fail the resulting Leadership test, until the end of the phase, that unit gains the associated ability below."},"predicate":"UNIT_KEYWORD","subject":"UNIT"},{"args":[{"arguments":{"keyword":"EPIC HERO"},"contextLevel":"STATIC","evidence":{"field":["content",0,"text"],"quote":"When mustering your army, when you select a HERETIC ASTARTES unit to include in your army, if that unit is not an EPIC HERO and does not already have one of the following keywords, you must select one for that unit and note it on your Army Roster: KHORNE. TZEENTCH, NURGLE, SLAANESH, CHAOS UNDIVIDED. Each time a unit with one of these keywords gains a weapon ability as the result of a Dark Pact and does not fail the resulting Leadership test, until the end of the phase, that unit gains the associated ability below."},"predicate":"UNIT_KEYWORD","subject":"UNIT"}],"op":"NOT"}],"op":"ALL"}` × 5; `{"args":[{"arguments":{"keyword":"KHORNE"},"contextLevel":"STATIC","evidence":{"field":["text"],"quote":"HERETIC ASTARTES KHORNE model only. Add 1 to the Attacks and Strength characteristics of the bearer’s melee weapons. Each time the bearer’s unit makes a Dark Pact and does not fail the resulting Leadership test, roll one D3: until the end of the phase, add the result to the Attacks and Strength characteristics of the bearers melee weapons instead."},"predicate":"MODEL_KEYWORD","subject":"MODEL"},{"arguments":{"equals":true,"key":"sourceBackedModelMark:KHORNE"},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"HERETIC ASTARTES KHORNE model only. Add 1 to the Attacks and Strength characteristics of the bearer’s melee weapons. Each time the bearer’s unit makes a Dark Pact and does not fail the resulting Leadership test, roll one D3: until the end of the phase, add the result to the Attacks and Strength characteristics of the bearers melee weapons instead."},"predicate":"FIELD","roleId":"owner","subject":"MODEL"}],"op":"ANY","subject":"MODEL"}` × 2; `{"args":[{"arguments":{"keyword":"PSYKER"},"contextLevel":"STATIC","evidence":{"field":["content",0,"text"],"quote":"You cannot select the KHORNE keyword for a PSYKER unit."},"predicate":"UNIT_KEYWORD","subject":"UNIT"}],"op":"NOT"}` × 1; `{"args":[{"arguments":{"keyword":"SLAANESH"},"contextLevel":"STATIC","evidence":{"field":["text"],"quote":"HERETIC ASTARTES SLAANESH model only. The bearer has the Feel No Pain 5+ ability. Each time the bearer shoots or fights, if the bearer’s unit made a Dark Pact this phase and did not fail the resulting Leadership test, after the bearer has resolved those attacks, select one enemy unit that was hit by one or more of those attacks; that enemy unit must take a Battle-shock test."},"predicate":"MODEL_KEYWORD","subject":"MODEL"},{"arguments":{"equals":true,"key":"sourceBackedModelMark:SLAANESH"},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"HERETIC ASTARTES SLAANESH model only. The bearer has the Feel No Pain 5+ ability. Each time the bearer shoots or fights, if the bearer’s unit made a Dark Pact this phase and did not fail the resulting Leadership test, after the bearer has resolved those attacks, select one enemy unit that was hit by one or more of those attacks; that enemy unit must take a Battle-shock test."},"predicate":"FIELD","roleId":"owner","subject":"MODEL"}],"op":"ANY","subject":"MODEL"}` × 1; `{"arguments":{"equals":"datasheet-heretic-astartes-daemon-prince-with-wings:section:3:option:1","key":"selectedUpgrade:datasheet-heretic-astartes-daemon-prince-with-wings:section:3"},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"Khorne: Add 2 to the Strength characteristic of this model's hellforged weapons."},"predicate":"FIELD","roleId":"source","subject":"MODEL"}` × 2; `{"arguments":{"equals":"datasheet-heretic-astartes-daemon-prince-with-wings:section:3:option:2","key":"selectedUpgrade:datasheet-heretic-astartes-daemon-prince-with-wings:section:3"},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"Tzeentch: Add 3 to the Attacks characteristic of its infernal cannon."},"predicate":"FIELD","roleId":"source","subject":"MODEL"}` × 2; `{"arguments":{"equals":"datasheet-heretic-astartes-daemon-prince-with-wings:section:3:option:3","key":"selectedUpgrade:datasheet-heretic-astartes-daemon-prince-with-wings:section:3"},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"Nurgle: Add 1 to its Toughness characteristic."},"predicate":"FIELD","roleId":"source","subject":"MODEL"}` × 2; `{"arguments":{"equals":"datasheet-heretic-astartes-daemon-prince-with-wings:section:3:option:4","key":"selectedUpgrade:datasheet-heretic-astartes-daemon-prince-with-wings:section:3"},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"Slaanesh: Add 2\" to its Move characteristic."},"predicate":"FIELD","roleId":"source","subject":"MODEL"}` × 2; `{"arguments":{"equals":"datasheet-heretic-astartes-daemon-prince:section:3:option:1","key":"selectedUpgrade:datasheet-heretic-astartes-daemon-prince:section:3"},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"Khorne: Add 2 to the Strength characteristic of this model's hellforged weapons."},"predicate":"FIELD","roleId":"source","subject":"MODEL"}` × 2; `{"arguments":{"equals":"datasheet-heretic-astartes-daemon-prince:section:3:option:2","key":"selectedUpgrade:datasheet-heretic-astartes-daemon-prince:section:3"},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"Tzeentch: Add 3 to the Attacks characteristic of its infernal cannon."},"predicate":"FIELD","roleId":"source","subject":"MODEL"}` × 2; `{"arguments":{"equals":"datasheet-heretic-astartes-daemon-prince:section:3:option:3","key":"selectedUpgrade:datasheet-heretic-astartes-daemon-prince:section:3"},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"Nurgle: Add 1 to its Toughness characteristic."},"predicate":"FIELD","roleId":"source","subject":"MODEL"}` × 2; `{"arguments":{"equals":"datasheet-heretic-astartes-daemon-prince:section:3:option:4","key":"selectedUpgrade:datasheet-heretic-astartes-daemon-prince:section:3"},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"Slaanesh: Add 2\" to its Move characteristic."},"predicate":"FIELD","roleId":"source","subject":"MODEL"}` × 2; `{"arguments":{"equals":false,"key":"attached"},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"Models in the bearers unit have the Scouts 6\" ability."},"predicate":"FIELD","subject":"MODEL"}` × 1; `{"arguments":{"equals":false,"key":"attached"},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"Models in the bearer’s unit have the SOUL FORGE keyword."},"predicate":"FIELD","subject":"MODEL"}` × 1; `{"arguments":{"equals":false,"key":"attached"},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"Models in the bearer’s unit have the Scouts 6\" ability."},"predicate":"FIELD","subject":"MODEL"}` × 1; `{"arguments":{"equals":false,"key":"attached"},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"Models in the bearer’s unit have the Stealth ability."},"predicate":"FIELD","subject":"MODEL"}` × 2; `{"arguments":{"equals":false,"key":"attached"},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"Ranged weapons equipped by models in the bearer’s unit have the [IGNORES COVER] ability."},"predicate":"FIELD","subject":"MODEL"}` × 1; `{"arguments":{"equals":false,"key":"attached"},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"This unit has 5+ InSv."},"predicate":"FIELD","subject":"MODEL"}` × 1; `{"arguments":{"equals":false,"key":"attached"},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"While the bearer is leading a unit with the Scouts 6\" ability, every model in the bearer’s unit has the Scouts 6\" ability."},"predicate":"FIELD","subject":"MODEL"}` × 1; `{"arguments":{"equals":true,"key":"attached"},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"Models in the bearers unit have the Scouts 6\" ability."},"predicate":"FIELD","subject":"MODEL"}` × 1; `{"arguments":{"equals":true,"key":"attached"},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"Models in the bearer’s unit have the SOUL FORGE keyword."},"predicate":"FIELD","subject":"MODEL"}` × 1; `{"arguments":{"equals":true,"key":"attached"},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"Models in the bearer’s unit have the Scouts 6\" ability."},"predicate":"FIELD","subject":"MODEL"}` × 1; `{"arguments":{"equals":true,"key":"attached"},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"Models in the bearer’s unit have the Stealth ability."},"predicate":"FIELD","subject":"MODEL"}` × 2; `{"arguments":{"equals":true,"key":"attached"},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"Ranged weapons equipped by models in the bearer’s unit have the [IGNORES COVER] ability."},"predicate":"FIELD","subject":"MODEL"}` × 1; `{"arguments":{"equals":true,"key":"attached"},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"This unit has 5+ InSv."},"predicate":"FIELD","subject":"MODEL"}` × 1; `{"arguments":{"equals":true,"key":"attached"},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"While the bearer is leading a unit with the Scouts 6\" ability, every model in the bearer’s unit has the Scouts 6\" ability."},"predicate":"FIELD","subject":"MODEL"}` × 1; `{"arguments":{"equals":true,"key":"attachedAtBattleStart"},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"If this unit is attached to a unit at the start of the battle"},"predicate":"FIELD","roleId":"source","subject":"UNIT"}` × 2; `{"arguments":{"equals":true,"key":"containsProfile:datasheet-dark-commune:profile:1"},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"contains a CULT DEMAGOGUE model"},"predicate":"FIELD","roleId":"source","subject":"UNIT"}` × 1; `{"arguments":{"equals":true,"key":"containsProfile:datasheet-traitor-enforcer:profile:2"},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"contains a Traitor Ogryn model"},"predicate":"FIELD","roleId":"source","subject":"UNIT"}` × 1; `{"arguments":{"equals":true,"key":"enhancementAssigned:detachment-cabal-of-chaos:enhancement:1"},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"HERETIC ASTARTES model only (excluding KHORNE models).\n- This model has PSYKER.\n- This model’s weapons have [PSYCHIC]."},"predicate":"FIELD","roleId":"owner","subject":"MODEL"}` × 2; `{"arguments":{"equals":true,"key":"enhancementAssigned:detachment-cabal-of-chaos:enhancement:2"},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"HERETIC ASTARTES DAEMON model only (excluding KHORNE models). This model’s melee attacks have [LANCE]."},"predicate":"FIELD","roleId":"owner","subject":"MODEL"}` × 1; `{"arguments":{"equals":true,"key":"enhancementAssigned:detachment-creations-of-bile:enhancement:1"},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"HERETIC ASTARTES model (excluding DAMNED models) only. The bearer’s melee weapons have the [PRECISION] ability."},"predicate":"FIELD","roleId":"owner","subject":"MODEL"}` × 1; `{"arguments":{"equals":true,"key":"enhancementAssigned:detachment-creations-of-bile:enhancement:2"},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"CHAOS LORD model only. Add 1 to the bearer’s Wounds characteristic and the bearer has the Feel No Pain 5+ ability."},"predicate":"FIELD","roleId":"owner","subject":"MODEL"}` × 2; `{"arguments":{"equals":true,"key":"enhancementAssigned:detachment-creations-of-bile:enhancement:4"},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"HERETIC ASTARTES INFANTRY model (excluding DAMNED models) only. Add 1 to the Damage characteristic of melee weapons equipped by the bearer. Each time the bearer makes a melee attack, you can re-roll the Hit roll."},"predicate":"FIELD","roleId":"owner","subject":"MODEL"}` × 1; `{"arguments":{"equals":true,"key":"enhancementAssigned:detachment-cult-of-the-arkifane:enhancement:3"},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"HERETIC ASTARTES model only (excluding DAMNED models). Each time the bearer makes an attack, an unmodified Hit roll of 5+ scores a Critical Hit."},"predicate":"FIELD","roleId":"owner","subject":"MODEL"}` × 1; `{"arguments":{"equals":true,"key":"enhancementAssigned:detachment-cult-of-the-arkifane:enhancement:4"},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"WARPSMITH model only. Add 3\" to the range of the bearer’s Warpsmith, Master of Mechanisms and Enrage Machine Spirits abilities."},"predicate":"FIELD","roleId":"owner","subject":"MODEL"}` × 3; `{"arguments":{"equals":true,"key":"enhancementAssigned:detachment-deceptors:enhancement:1"},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"HERETIC ASTARTES INFANTRY model only. Improve the Armour Penetration characteristic of the bearer’s melee weapons by 1, and the bearer’s melee weapons have the [PRECISION] ability."},"predicate":"FIELD","roleId":"owner","subject":"MODEL"}` × 2; `{"arguments":{"equals":true,"key":"enhancementAssigned:detachment-deceptors:enhancement:3"},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"HERETIC ASTARTES INFANTRY model only. The bearer has the Stealth and Lone Operative abilities."},"predicate":"FIELD","roleId":"owner","subject":"MODEL"}` × 2; `{"arguments":{"equals":true,"key":"enhancementAssigned:detachment-fellhammer-siege-host:enhancement:2"},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"HERETIC ASTARTES INFANTRY model only. The bearers weapons have the [ANTI-VEHICLE 4+] and [ANTI-FORTIFICATION 4+] abilities."},"predicate":"FIELD","roleId":"owner","subject":"MODEL"}` × 2; `{"arguments":{"equals":true,"key":"enhancementAssigned:detachment-huron-s-marauders:enhancement:4"},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"HERETIC ASTARTES model only. The bearer has the Infiltrators ability."},"predicate":"FIELD","roleId":"owner","subject":"MODEL"}` × 1; `{"arguments":{"equals":true,"key":"enhancementAssigned:detachment-murdertalon-raiders:enhancement:2"},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"LEADER: WARP TALONS\nCHAOS LORD WITH JUMP PACK model only.\n- This model has DAEMON.\n- This model’s melee attacks have +1 A."},"predicate":"FIELD","roleId":"owner","subject":"MODEL"}` × 2; `{"arguments":{"equals":true,"key":"enhancementAssigned:detachment-pactbound-zealots:enhancement:2"},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"HERETIC ASTARTES SLAANESH model only. The bearer has the Feel No Pain 5+ ability. Each time the bearer shoots or fights, if the bearer’s unit made a Dark Pact this phase and did not fail the resulting Leadership test, after the bearer has resolved those attacks, select one enemy unit that was hit by one or more of those attacks; that enemy unit must take a Battle-shock test."},"predicate":"FIELD","roleId":"owner","subject":"MODEL"}` × 1; `{"arguments":{"equals":true,"key":"enhancementAssigned:detachment-pactbound-zealots:enhancement:4"},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"HERETIC ASTARTES KHORNE model only. Add 1 to the Attacks and Strength characteristics of the bearer’s melee weapons. Each time the bearer’s unit makes a Dark Pact and does not fail the resulting Leadership test, roll one D3: until the end of the phase, add the result to the Attacks and Strength characteristics of the bearers melee weapons instead."},"predicate":"FIELD","roleId":"owner","subject":"MODEL"}` × 2; `{"arguments":{"equals":true,"key":"enhancementAssigned:detachment-soulforged-warpack:enhancement:2"},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"WARPSMITH model only. Add 4\" to the bearer’s Move characteristic."},"predicate":"FIELD","roleId":"owner","subject":"MODEL"}` × 1; `{"arguments":{"equals":true,"key":"enhancementAssigned:detachment-warpstrike-champions:enhancement:4"},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"HERETIC ASTARTES model with the Deep Strike ability only. Improve the Attacks, Strength and Armour Penetration characteristics of the bearer’s weapons by 1. In addition, each time the bearer’s unit is set up on the battlefield from Reserves, until the end of the turn, improve the Damage characteristic of the bearer’s weapons by 1."},"predicate":"FIELD","roleId":"owner","subject":"MODEL"}` × 3; `{"arguments":{"equals":true,"key":"equipmentRequirementSatisfied"},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"equipped with two melee weapons in addition to its close combat weapon"},"predicate":"FIELD","roleId":"source","subject":"MODEL"}` × 1; `{"arguments":{"equals":true,"key":"isBodyguardModel"},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"Bodyguard models in that unit"},"predicate":"FIELD","roleId":"bodyguardModels","subject":"MODEL"}` × 2; `{"arguments":{"equals":true,"key":"ledBodyguardHasScouts6:detachment-chaos-cult:enhancement:4"},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"While the bearer is leading a unit with the Scouts 6\" ability, every model in the bearer’s unit has the Scouts 6\" ability."},"predicate":"FIELD","roleId":"owner","subject":"MODEL"}` × 2; `{"arguments":{"equals":true,"key":"needsInvulnerableSave:5"},"contextLevel":"ROSTER","evidence":{"field":["content",0,"text"],"quote":"SOUL FORGE units from your army have a 5+ invulnerable save."},"predicate":"FIELD","subject":"MODEL"}` × 1; `{"arguments":{"equals":true,"key":"needsInvulnerableSave:5"},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"Faithful Flock: While this unit is leading a unit and contains a CULT DEMAGOGUE model, models in that unit have a 5+ invulnerable save."},"predicate":"FIELD","subject":"MODEL"}` × 1; `{"arguments":{"equals":true,"key":"needsInvulnerableSave:5"},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"This unit has 5+ InSv."},"predicate":"FIELD","subject":"MODEL"}` × 2; `{"arguments":{"equals":true,"key":"needsMarkSelection:detachment-pactbound-zealots:rule"},"contextLevel":"ROSTER","evidence":{"field":["content",0,"text"],"quote":"When mustering your army, when you select a HERETIC ASTARTES unit to include in your army, if that unit is not an EPIC HERO and does not already have one of the following keywords, you must select one for that unit and note it on your Army Roster: KHORNE. TZEENTCH, NURGLE, SLAANESH, CHAOS UNDIVIDED."},"predicate":"FIELD","subject":"UNIT"}` × 5; `{"arguments":{"equals":true,"key":"sourceBackedUnitMark:CHAOS UNDIVIDED"},"contextLevel":"ROSTER","evidence":{"field":["content",0,"text"],"quote":"When mustering your army, when you select a HERETIC ASTARTES unit to include in your army, if that unit is not an EPIC HERO and does not already have one of the following keywords, you must select one for that unit and note it on your Army Roster: KHORNE. TZEENTCH, NURGLE, SLAANESH, CHAOS UNDIVIDED."},"predicate":"FIELD","subject":"UNIT"}` × 1; `{"arguments":{"equals":true,"key":"sourceBackedUnitMark:KHORNE"},"contextLevel":"ROSTER","evidence":{"field":["content",0,"text"],"quote":"When mustering your army, when you select a HERETIC ASTARTES unit to include in your army, if that unit is not an EPIC HERO and does not already have one of the following keywords, you must select one for that unit and note it on your Army Roster: KHORNE. TZEENTCH, NURGLE, SLAANESH, CHAOS UNDIVIDED."},"predicate":"FIELD","subject":"UNIT"}` × 1; `{"arguments":{"equals":true,"key":"sourceBackedUnitMark:NURGLE"},"contextLevel":"ROSTER","evidence":{"field":["content",0,"text"],"quote":"When mustering your army, when you select a HERETIC ASTARTES unit to include in your army, if that unit is not an EPIC HERO and does not already have one of the following keywords, you must select one for that unit and note it on your Army Roster: KHORNE. TZEENTCH, NURGLE, SLAANESH, CHAOS UNDIVIDED."},"predicate":"FIELD","subject":"UNIT"}` × 1; `{"arguments":{"equals":true,"key":"sourceBackedUnitMark:SLAANESH"},"contextLevel":"ROSTER","evidence":{"field":["content",0,"text"],"quote":"When mustering your army, when you select a HERETIC ASTARTES unit to include in your army, if that unit is not an EPIC HERO and does not already have one of the following keywords, you must select one for that unit and note it on your Army Roster: KHORNE. TZEENTCH, NURGLE, SLAANESH, CHAOS UNDIVIDED."},"predicate":"FIELD","subject":"UNIT"}` × 1; `{"arguments":{"equals":true,"key":"sourceBackedUnitMark:TZEENTCH"},"contextLevel":"ROSTER","evidence":{"field":["content",0,"text"],"quote":"When mustering your army, when you select a HERETIC ASTARTES unit to include in your army, if that unit is not an EPIC HERO and does not already have one of the following keywords, you must select one for that unit and note it on your Army Roster: KHORNE. TZEENTCH, NURGLE, SLAANESH, CHAOS UNDIVIDED."},"predicate":"FIELD","subject":"UNIT"}` × 1; `{"arguments":{"id":"datasheet-helbrute:section:2:member:1"},"contextLevel":"STATIC","evidence":{"field":["name"],"otherEntityId":"datasheet-helbrute:profile:1","quote":"Helbrute"},"predicate":"MODEL_ID","subject":"MODEL"}` × 1; `{"arguments":{"id":"datasheet-heretic-astartes-daemon-prince-with-wings:section:2:member:1"},"contextLevel":"STATIC","evidence":{"field":["name"],"otherEntityId":"datasheet-heretic-astartes-daemon-prince-with-wings:profile:1","quote":"Heretic Astartes Daemon Prince With Wings"},"predicate":"MODEL_ID","subject":"MODEL"}` × 8; `{"arguments":{"id":"datasheet-heretic-astartes-daemon-prince:section:2:member:1"},"contextLevel":"STATIC","evidence":{"field":["name"],"otherEntityId":"datasheet-heretic-astartes-daemon-prince:profile:1","quote":"Heretic Astartes Daemon Prince"},"predicate":"MODEL_ID","subject":"MODEL"}` × 8; `{"arguments":{"id":"datasheet-master-of-possession:section:2:member:1"},"contextLevel":"STATIC","evidence":{"field":["name"],"otherEntityId":"datasheet-master-of-possession:profile:1","quote":"Master Of Possession"},"predicate":"MODEL_ID","subject":"MODEL"}` × 1; `{"arguments":{"id":"unit-traitor-guardsmen-squad"},"contextLevel":"STATIC","evidence":{"field":["content",0,"text"],"quote":"TRAITOR GUARDSMEN SQUAD units from your army gain the BATTLELINE keyword."},"predicate":"UNIT_ID","subject":"UNIT"}` × 1; `{"arguments":{"value":true},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"While the bearer is leading a unit with the Scouts 6\" ability, every model in the bearer’s unit has the Scouts 6\" ability."},"predicate":"LEADING","roleId":"owner","subject":"MODEL"}` × 2; `{"arguments":{"value":true},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"While this model is leading a unit"},"predicate":"LEADING","roleId":"source","subject":"MODEL"}` × 1; `{"arguments":{"value":true},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"While this unit is leading a unit"},"predicate":"LEADING","roleId":"source","subject":"UNIT"}` × 1; `{"arguments":{},"contextLevel":"STATIC","evidence":{"field":["text"],"quote":"Add 1 to Advance and Charge rolls made for the bearer’s unit."},"predicate":"ALWAYS","subject":"UNIT"}` × 1; `{"arguments":{},"contextLevel":"STATIC","evidence":{"field":["text"],"quote":"Bodyguard models in that unit"},"predicate":"ALWAYS","subject":"MODEL"}` × 2; `{"arguments":{},"contextLevel":"STATIC","evidence":{"field":["text"],"quote":"Daemonkin (Psychic): While this model is leading a unit, add 1 to Advance and Charge rolls made for that unit."},"predicate":"ALWAYS","subject":"UNIT"}` × 1; `{"arguments":{},"contextLevel":"STATIC","evidence":{"field":["text"],"quote":"models in that unit"},"predicate":"ALWAYS","subject":"MODEL"}` × 1 |
| `predicateContext` | `ABSENT` × 123; `BATTLE` × 943; `ROSTER` × 774; `STATIC` × 2080 |
| `rosterClassification` | `BATTLE_ONLY` × 301; `DISPLAY_ONLY` × 31; `NOT_AN_EFFECT` × 17; `ROSTER_EXECUTABLE` × 61 |

Связи ролей (`actorRoleId`, `prerequisites`, `distinctFromRoleIds`, required/optional) со всеми значениями и частотами: `books[2].dictionary` в JSON. Отсутствующий purpose не доказывает получателя.

**FIELD key / уровень × число:** `["advanceOrChargeRoll","BATTLE"]` × 3; `["advancedOrFellBackThisTurn","BATTLE"]` × 3; `["allocatedAttackAndTurnAllowance","BATTLE"]` × 3; `["armyFaction","ROSTER"]` × 8; `["arrivedFromReservesThisTurn","BATTLE"]` × 2; `["arrivedUsingDeepStrikeThisTurn","BATTLE"]` × 6; `["attached","ROSTER"]` × 16; `["attachedAtBattleStart","ROSTER"]` × 7; `["attachedToSelectedUnit:detachment-deceptors:rule","ROSTER"]` × 1; `["attachedUnitsShareSelectedMark:detachment-pactbound-zealots:rule","ROSTER"]` × 1; `["attackAllocated","BATTLE"]` × 3; `["attackClosestEligibleEnemy","BATTLE"]` × 3; `["attackTargetsFlyingUnit","BATTLE"]` × 3; `["battleEnemyRecipientEligible","BATTLE"]` × 18; `["battleSelectedRecipient:detachment-soulforged-warpack:enhancement:1","BATTLE"]` × 2; `["battleTargetPrerequisitesSatisfied","BATTLE"]` × 114; `["chargeDeclaredEnemyObjectiveWithin12","BATTLE"]` × 3; `["chargeMoveEndedAndEnemyEngaged","BATTLE"]` × 3; `["chargeRollMoveAndEngagement","BATTLE"]` × 3; `["chargedThisTurn","BATTLE"]` × 2; `["commandPhaseOncePerBattleChosen","BATTLE"]` × 3; `["commandPhaseVehicleWithin3","BATTLE"]` × 5; `["compositionMemberId","ROSTER"]` × 4; `["containsProfile:datasheet-dark-apostle:profile:1","ROSTER"]` × 3; `["containsProfile:datasheet-dark-apostle:profile:2","ROSTER"]` × 3; `["containsProfile:datasheet-dark-commune:profile:1","ROSTER"]` × 7; `["containsProfile:datasheet-traitor-enforcer:profile:1","ROSTER"]` × 3; `["containsProfile:datasheet-traitor-enforcer:profile:2","ROSTER"]` × 4; `["darkPactAndAttackResolution","BATTLE"]` × 6; `["darkPactLeadershipRoll7Plus","BATTLE"]` × 3; `["darkPactOncePerBattle","BATTLE"]` × 3; `["darkPactSelectedOnShootFight","BATTLE"]` × 5; `["declaredChargeThisPhase","BATTLE"]` × 4; `["deploymentCompleteSourceOnBattlefield","BATTLE"]` × 3; `["destroyedModelReturnEligible:detachment-chaos-cult:enhancement:1","BATTLE"]` × 1; `["disembarkAfterNormalMove","BATTLE"]` × 3; `["disembarkedThisTurn","BATTLE"]` × 2; `["distinctFromPrimaryTarget","BATTLE"]` × 2; `["eligibleReplacementUnit:detachment-deceptors:enhancement:2","BATTLE"]` × 4; `["eligibleToFightThisPhase","BATTLE"]` × 2; `["enemyCharacterDestroyed","BATTLE"]` × 3; `["enemyEngagedOnlyFortifications","BATTLE"]` × 3; `["enemyInBearerUnitEngagementRange","BATTLE"]` × 2; `["enemyMoveEndsWithin8AndNotEngaged","BATTLE"]` × 3; `["enemyNonVehicleWithin3","BATTLE"]` × 3; `["enemyRangeStrengthAndCommandShockStep","BATTLE"]` × 3; `["enemyShootingDestroyedSourceModel","BATTLE"]` × 3; `["enemyShootingFriendlyWithin3","BATTLE"]` × 3; `["enemyStartingStrengthAttack","BATTLE"]` × 3; `["enemyStratagemWithin12AndTurnAllowance","BATTLE"]` × 3; `["enemyWithin18TargetsSource","BATTLE"]` × 5; `["enemyWithin6LeadershipOrShockTest","BATTLE"]` × 3; `["enhancementAssigned:detachment-cabal-of-chaos:enhancement:1","ROSTER"]` × 6; `["enhancementAssigned:detachment-cabal-of-chaos:enhancement:2","ROSTER"]` × 4; `["enhancementAssigned:detachment-chaos-cult:enhancement:1","ROSTER"]` × 3; `["enhancementAssigned:detachment-chaos-cult:enhancement:2","ROSTER"]` × 3; `["enhancementAssigned:detachment-chaos-cult:enhancement:3","ROSTER"]` × 3; `["enhancementAssigned:detachment-chaos-cult:enhancement:4","ROSTER"]` × 3; `["enhancementAssigned:detachment-creations-of-bile:enhancement:1","ROSTER"]` × 4; `["enhancementAssigned:detachment-creations-of-bile:enhancement:2","ROSTER"]` × 6; `["enhancementAssigned:detachment-creations-of-bile:enhancement:3","ROSTER"]` × 3; `["enhancementAssigned:detachment-creations-of-bile:enhancement:4","ROSTER"]` × 5; `["enhancementAssigned:detachment-cult-of-the-arkifane:enhancement:1","ROSTER"]` × 3; `["enhancementAssigned:detachment-cult-of-the-arkifane:enhancement:2","ROSTER"]` × 3; `["enhancementAssigned:detachment-cult-of-the-arkifane:enhancement:3","ROSTER"]` × 4; `["enhancementAssigned:detachment-cult-of-the-arkifane:enhancement:4","ROSTER"]` × 8; `["enhancementAssigned:detachment-deceptors:enhancement:1","ROSTER"]` × 5; `["enhancementAssigned:detachment-deceptors:enhancement:2","ROSTER"]` × 7; `["enhancementAssigned:detachment-deceptors:enhancement:3","ROSTER"]` × 5; `["enhancementAssigned:detachment-deceptors:enhancement:4","ROSTER"]` × 4; `["enhancementAssigned:detachment-devotees-of-destruction:enhancement:1","ROSTER"]` × 4; `["enhancementAssigned:detachment-devotees-of-destruction:enhancement:2","ROSTER"]` × 4; `["enhancementAssigned:detachment-dread-talons:enhancement:1","ROSTER"]` × 3; `["enhancementAssigned:detachment-dread-talons:enhancement:2","ROSTER"]` × 3; `["enhancementAssigned:detachment-dread-talons:enhancement:3","ROSTER"]` × 3; `["enhancementAssigned:detachment-dread-talons:enhancement:4","ROSTER"]` × 4; `["enhancementAssigned:detachment-fellhammer-siege-host:enhancement:1","ROSTER"]` × 3; `["enhancementAssigned:detachment-fellhammer-siege-host:enhancement:2","ROSTER"]` × 5; `["enhancementAssigned:detachment-fellhammer-siege-host:enhancement:3","ROSTER"]` × 3; `["enhancementAssigned:detachment-fellhammer-siege-host:enhancement:4","ROSTER"]` × 4; `["enhancementAssigned:detachment-huron-s-marauders:enhancement:1","ROSTER"]` × 3; `["enhancementAssigned:detachment-huron-s-marauders:enhancement:2","ROSTER"]` × 3; `["enhancementAssigned:detachment-huron-s-marauders:enhancement:3","ROSTER"]` × 3; `["enhancementAssigned:detachment-huron-s-marauders:enhancement:4","ROSTER"]` × 4; `["enhancementAssigned:detachment-murdertalon-raiders:enhancement:1","ROSTER"]` × 3; `["enhancementAssigned:detachment-murdertalon-raiders:enhancement:2","ROSTER"]` × 7; `["enhancementAssigned:detachment-nightmare-hunt:enhancement:1","ROSTER"]` × 4; `["enhancementAssigned:detachment-nightmare-hunt:enhancement:2","ROSTER"]` × 3; `["enhancementAssigned:detachment-nightmare-hunt:enhancement:3","ROSTER"]` × 3; `["enhancementAssigned:detachment-nightmare-hunt:enhancement:4","ROSTER"]` × 4; `["enhancementAssigned:detachment-pactbound-zealots:enhancement:1","ROSTER"]` × 3; `["enhancementAssigned:detachment-pactbound-zealots:enhancement:2","ROSTER"]` × 5; `["enhancementAssigned:detachment-pactbound-zealots:enhancement:3","ROSTER"]` × 3; `["enhancementAssigned:detachment-pactbound-zealots:enhancement:4","ROSTER"]` × 6; `["enhancementAssigned:detachment-renegade-raiders:enhancement:1","ROSTER"]` × 3; `["enhancementAssigned:detachment-renegade-raiders:enhancement:2","ROSTER"]` × 3; `["enhancementAssigned:detachment-renegade-raiders:enhancement:3","ROSTER"]` × 3; `["enhancementAssigned:detachment-renegade-raiders:enhancement:4","ROSTER"]` × 3; `["enhancementAssigned:detachment-renegade-warband:enhancement:1","ROSTER"]` × 4; `["enhancementAssigned:detachment-renegade-warband:enhancement:2","ROSTER"]` × 3; `["enhancementAssigned:detachment-renegade-warband:enhancement:3","ROSTER"]` × 3; `["enhancementAssigned:detachment-renegade-warband:enhancement:4","ROSTER"]` × 4; `["enhancementAssigned:detachment-soulforged-warpack:enhancement:1","ROSTER"]` × 4; `["enhancementAssigned:detachment-soulforged-warpack:enhancement:2","ROSTER"]` × 4; `["enhancementAssigned:detachment-soulforged-warpack:enhancement:3","ROSTER"]` × 5; `["enhancementAssigned:detachment-soulforged-warpack:enhancement:4","ROSTER"]` × 3; `["enhancementAssigned:detachment-veterans-of-the-long-war:enhancement:1","ROSTER"]` × 4; `["enhancementAssigned:detachment-veterans-of-the-long-war:enhancement:2","ROSTER"]` × 3; `["enhancementAssigned:detachment-veterans-of-the-long-war:enhancement:3","ROSTER"]` × 3; `["enhancementAssigned:detachment-veterans-of-the-long-war:enhancement:4","ROSTER"]` × 3; `["enhancementAssigned:detachment-warpstrike-champions:enhancement:1","ROSTER"]` × 3; `["enhancementAssigned:detachment-warpstrike-champions:enhancement:2","ROSTER"]` × 3; `["enhancementAssigned:detachment-warpstrike-champions:enhancement:3","ROSTER"]` × 3; `["enhancementAssigned:detachment-warpstrike-champions:enhancement:4","ROSTER"]` × 7; `["equipmentBattleTrigger:datasheet-chaos-bikers:section:1:block:1:text","BATTLE"]` × 3; `["equipmentBattleTrigger:datasheet-chosen:section:1:block:1:text","BATTLE"]` × 3; `["equipmentBattleTrigger:datasheet-dark-commune:section:1:block:2:text","BATTLE"]` × 3; `["equipmentBattleTrigger:datasheet-legionaries:section:1:block:1:text","BATTLE"]` × 3; `["equipmentBattleTrigger:datasheet-nemesis-claw:section:1:block:1:text","BATTLE"]` × 3; `["equipmentBattleTrigger:datasheet-possessed:section:1:block:1:text","BATTLE"]` × 3; `["equipmentBattleTrigger:datasheet-sorcerer-in-terminator-armour:section:1:block:2:text","BATTLE"]` × 3; `["equipmentRequirementSatisfied","ROSTER"]` × 1; `["fightAttacksFinishedAndEnemyDestroyed","BATTLE"]` × 3; `["fightEndDestroyedEnemyAndNotEngaged","BATTLE"]` × 3; `["fightEndSourceAttackDestroyedEnemy","BATTLE"]` × 3; `["fightPhaseChosenOncePerBattle","BATTLE"]` × 3; `["fightPhaseSacrificeRoll","BATTLE"]` × 3; `["fightStartEnemyEngaged","BATTLE"]` × 3; `["firstEnemyDestroyedAndNotBattleShocked","BATTLE"]` × 3; `["firstFabiusDestroyedAndPhaseEndRoll","BATTLE"]` × 3; `["friendlyCommandEndObjectiveControl","BATTLE"]` × 3; `["friendlyCommandStart","BATTLE"]` × 3; `["friendlyDaemonVehicleWithin3","BATTLE"]` × 3; `["friendlyDaemonVehicleWithin6","BATTLE"]` × 3; `["friendlyInfantryRangeAndRangedAttackAllocated","BATTLE"]` × 3; `["friendlyInfantryWithin3","BATTLE"]` × 3; `["friendlyInfantryWithin6NotBattleShocked","BATTLE"]` × 3; `["friendlyModelWhollyWithin9","BATTLE"]` × 3; `["friendlyVehicleWithin3","BATTLE"]` × 3; `["friendlyWithin6DarkPact","BATTLE"]` × 3; `["garreonOnBattlefieldCommandPhase","BATTLE"]` × 3; `["hasCanonicalDarkPacts:detachment-chaos-cult:rule","ROSTER"]` × 1; `["hatedFoeBattleSelection","BATTLE"]` × 3; `["hitByTriggerAttack","BATTLE"]` × 2; `["inReserves","BATTLE"]` × 2; `["inTargetUnit","ROSTER"]` × 68; `["inTriggerUnit","BATTLE"]` × 2; `["invokedContractWithinBearer3:detachment-soulforged-warpack:enhancement:3","BATTLE"]` × 3; `["isBodyguardComponentOfSource","ROSTER"]` × 3; `["isBodyguardModel","ROSTER"]` × 2; `["isTriggerUnit","BATTLE"]` × 28; `["leadershipTest","BATTLE"]` × 3; `["ledBodyguardHasScouts6:detachment-chaos-cult:enhancement:4","ROSTER"]` × 3; `["ledModelMeleeAttack","BATTLE"]` × 3; `["ledUnitAttackTargeted","BATTLE"]` × 3; `["ledUnitChargeMoveEnded","BATTLE"]` × 3; `["lostWoundsFromTriggerAttack","BATTLE"]` × 2; `["meleeAttackAfterCharge","BATTLE"]` × 3; `["meleeAttackEnemyObjectiveState","BATTLE"]` × 3; `["meleeEnemyStartingStrength","BATTLE"]` × 3; `["memberOfEligibleUnit:detachment-cabal-of-chaos:rule:battle-branch-1","ROSTER"]` × 1; `["memberOfEligibleUnit:detachment-cabal-of-chaos:rule:battle-branch-2","ROSTER"]` × 1; `["memberOfEligibleUnit:detachment-chaos-cult:rule","ROSTER"]` × 1; `["memberOfEligibleUnit:detachment-huron-s-marauders:rule:table-2-row-1","ROSTER"]` × 1; `["memberOfEligibleUnit:detachment-murdertalon-raiders:rule:source-clause-1-1","ROSTER"]` × 1; `["memberOfEligibleUnit:detachment-pactbound-zealots:rule:source-clause-1-3","ROSTER"]` × 1; `["memberOfEligibleUnit:detachment-pactbound-zealots:rule:source-clause-1-4","ROSTER"]` × 1; `["memberOfEligibleUnit:detachment-pactbound-zealots:rule:source-clause-1-5","ROSTER"]` × 1; `["memberOfEligibleUnit:detachment-pactbound-zealots:rule:source-clause-1-7","ROSTER"]` × 1; `["memberOfEligibleUnit:detachment-pactbound-zealots:rule:source-clause-1-8","ROSTER"]` × 1; `["memberOfEligibleUnit:detachment-pactbound-zealots:rule:source-clause-1-9","ROSTER"]` × 1; `["memberOfEligibleUnit:detachment-soulforged-warpack:rule:source-clause-1-2","ROSTER"]` × 1; `["memberOfEligibleUnit:detachment-soulforged-warpack:rule:source-clause-1-3","ROSTER"]` × 1; `["memberOfOwnerUnit:detachment-chaos-cult:enhancement:4","ROSTER"]` × 3; `["memberOfOwnerUnit:detachment-cult-of-the-arkifane:enhancement:2","ROSTER"]` × 3; `["memberOfOwnerUnit:detachment-dread-talons:enhancement:2","ROSTER"]` × 3; `["memberOfOwnerUnit:detachment-nightmare-hunt:enhancement:1","ROSTER"]` × 3; `["memberOfOwnerUnit:detachment-nightmare-hunt:enhancement:4","ROSTER"]` × 3; `["memberOfOwnerUnit:detachment-renegade-raiders:enhancement:3","ROSTER"]` × 3; `["memberOfOwnerUnit:detachment-renegade-warband:enhancement:2","ROSTER"]` × 3; `["memberOfSelectedUnit:detachment-cult-of-the-arkifane:rule","ROSTER"]` × 2; `["memberOfSelectedUnit:detachment-murdertalon-raiders:enhancement:1","ROSTER"]` × 3; `["memberOfUnitRole:detachment-chaos-cult:enhancement:1:bearer-unit","ROSTER"]` × 1; `["memberOfUnitRole:detachment-chaos-cult:enhancement:3:bearer-unit","ROSTER"]` × 1; `["memberOfUnitRole:detachment-renegade-warband:enhancement:3:bearer-unit","ROSTER"]` × 1; `["memberOfUnitRole:detachment-soulforged-warpack:enhancement:3:nearby-contract-unit","ROSTER"]` × 1; `["memberOfUnitRole:detachment-veterans-of-the-long-war:enhancement:1:bearer-unit","ROSTER"]` × 1; `["moveAdvanceChargeModifierChoice","BATTLE"]` × 3; `["movementEndEnemyVehicleWithin12","BATTLE"]` × 3; `["needsInvulnerableSave:5","ROSTER"]` × 4; `["needsMarkSelection:detachment-pactbound-zealots:rule","ROSTER"]` × 6; `["normalAdvanceFallBackMove","BATTLE"]` × 3; `["normalMoveEndedOncePerBattle","BATTLE"]` × 3; `["normalOrAdvanceMoveEndedAndEnemyMovedOver","BATTLE"]` × 3; `["oncePerPhaseSelectedShootFight","BATTLE"]` × 5; `["overwatchTurnAllowance","BATTLE"]` × 3; `["phaseStartOncePerBattleAndRecipientRange","BATTLE"]` × 3; `["pileInOrConsolidate","BATTLE"]` × 3; `["rangedAttackAllocatedMonsterOrVehicle","BATTLE"]` × 3; `["rangedAttackEngagementContext","BATTLE"]` × 3; `["rangedAttackHitModifiers","BATTLE"]` × 3; `["rangedAttackOccludedByFortification","BATTLE"]` × 3; `["rangedAttackTargetsInfantry","BATTLE"]` × 3; `["remainingWoundsBand:datasheet-chaos-land-raider:section:4","BATTLE"]` × 3; `["remainingWoundsBand:datasheet-chaos-predator-annihilator:section:3","BATTLE"]` × 3; `["remainingWoundsBand:datasheet-chaos-predator-destructor:section:3","BATTLE"]` × 3; `["remainingWoundsBand:datasheet-chaos-vindicator:section:3","BATTLE"]` × 3; `["remainingWoundsBand:datasheet-defiler:section:3","BATTLE"]` × 3; `["remainingWoundsBand:datasheet-forgefiend:section:3","BATTLE"]` × 3; `["remainingWoundsBand:datasheet-heldrake:section:3","BATTLE"]` × 3; `["remainingWoundsBand:datasheet-khorne-lord-of-skulls:section:3","BATTLE"]` × 3; `["remainingWoundsBand:datasheet-maulerfiend:section:3","BATTLE"]` × 3; `["remainingWoundsBand:datasheet-vashtorr-the-arkifane:section:3","BATTLE"]` × 3; `["ruleActive:detachment-cabal-of-chaos:rule","BATTLE"]` × 1; `["ruleActive:detachment-cabal-of-chaos:rule:1","BATTLE"]` × 1; `["ruleActive:detachment-cabal-of-chaos:rule:2","BATTLE"]` × 1; `["ruleActive:detachment-chaos-cult:enhancement:1","BATTLE"]` × 1; `["ruleActive:detachment-chaos-cult:enhancement:1:battle-clause-1","BATTLE"]` × 1; `["ruleActive:detachment-chaos-cult:enhancement:2","BATTLE"]` × 1; `["ruleActive:detachment-chaos-cult:enhancement:2:battle-clause-1","BATTLE"]` × 1; `["ruleActive:detachment-chaos-cult:enhancement:3","BATTLE"]` × 1; `["ruleActive:detachment-chaos-cult:enhancement:3:battle-clause-1","BATTLE"]` × 1; `["ruleActive:detachment-chaos-cult:rule:source-clause-1-1","BATTLE"]` × 1; `["ruleActive:detachment-chaos-cult:rule:source-clause-1-3","BATTLE"]` × 1; `["ruleActive:detachment-creations-of-bile:enhancement:3","BATTLE"]` × 1; `["ruleActive:detachment-creations-of-bile:enhancement:3:battle-clause-1","BATTLE"]` × 1; `["ruleActive:detachment-creations-of-bile:enhancement:4:battle-clause-1","BATTLE"]` × 1; `["ruleActive:detachment-creations-of-bile:rule","BATTLE"]` × 1; `["ruleActive:detachment-creations-of-bile:rule:source-clause-1-1","BATTLE"]` × 1; `["ruleActive:detachment-creations-of-bile:rule:table-2-row-1","BATTLE"]` × 1; `["ruleActive:detachment-creations-of-bile:rule:table-2-row-2","BATTLE"]` × 1; `["ruleActive:detachment-creations-of-bile:rule:table-2-row-3","BATTLE"]` × 1; `["ruleActive:detachment-creations-of-bile:rule:table-2-row-4","BATTLE"]` × 1; `["ruleActive:detachment-creations-of-bile:rule:table-2-row-5","BATTLE"]` × 1; `["ruleActive:detachment-creations-of-bile:rule:table-2-row-6","BATTLE"]` × 1; `["ruleActive:detachment-cult-of-the-arkifane:enhancement:1","BATTLE"]` × 1; `["ruleActive:detachment-cult-of-the-arkifane:enhancement:1:battle-clause-1","BATTLE"]` × 1; `["ruleActive:detachment-deceptors:enhancement:2","BATTLE"]` × 1; `["ruleActive:detachment-deceptors:enhancement:2:battle-clause-1","BATTLE"]` × 1; `["ruleActive:detachment-deceptors:enhancement:2:battle-clause-2","BATTLE"]` × 1; `["ruleActive:detachment-deceptors:enhancement:2:battle-clause-3","BATTLE"]` × 2; `["ruleActive:detachment-deceptors:enhancement:2:battle-clause-4","BATTLE"]` × 1; `["ruleActive:detachment-deceptors:enhancement:4","BATTLE"]` × 1; `["ruleActive:detachment-deceptors:enhancement:4:battle-clause-1","BATTLE"]` × 1; `["ruleActive:detachment-deceptors:enhancement:4:battle-clause-2","BATTLE"]` × 1; `["ruleActive:detachment-deceptors:rule","BATTLE"]` × 1; `["ruleActive:detachment-deceptors:rule:source-clause-1-1","BATTLE"]` × 1; `["ruleActive:detachment-deceptors:rule:source-clause-1-2","BATTLE"]` × 1; `["ruleActive:detachment-deceptors:rule:table-2-row-1","BATTLE"]` × 1; `["ruleActive:detachment-deceptors:rule:table-2-row-2","BATTLE"]` × 1; `["ruleActive:detachment-deceptors:rule:table-2-row-3","BATTLE"]` × 1; `["ruleActive:detachment-deceptors:rule:table-2-row-4","BATTLE"]` × 1; `["ruleActive:detachment-deceptors:rule:table-2-row-5","BATTLE"]` × 1; `["ruleActive:detachment-devotees-of-destruction:enhancement:1","BATTLE"]` × 1; `["ruleActive:detachment-devotees-of-destruction:enhancement:1:battle-clause-1","BATTLE"]` × 1; `["ruleActive:detachment-devotees-of-destruction:enhancement:1:battle-clause-2","BATTLE"]` × 1; `["ruleActive:detachment-devotees-of-destruction:enhancement:2","BATTLE"]` × 1; `["ruleActive:detachment-devotees-of-destruction:enhancement:2:battle-clause-1","BATTLE"]` × 1; `["ruleActive:detachment-devotees-of-destruction:enhancement:2:battle-clause-2","BATTLE"]` × 1; `["ruleActive:detachment-dread-talons:enhancement:1","BATTLE"]` × 1; `["ruleActive:detachment-dread-talons:enhancement:1:battle-clause-1","BATTLE"]` × 1; `["ruleActive:detachment-dread-talons:enhancement:3","BATTLE"]` × 1; `["ruleActive:detachment-dread-talons:enhancement:3:battle-clause-1","BATTLE"]` × 1; `["ruleActive:detachment-dread-talons:enhancement:4","BATTLE"]` × 1; `["ruleActive:detachment-dread-talons:enhancement:4:battle-clause-1","BATTLE"]` × 1; `["ruleActive:detachment-dread-talons:enhancement:4:battle-clause-2","BATTLE"]` × 1; `["ruleActive:detachment-dread-talons:rule","BATTLE"]` × 1; `["ruleActive:detachment-dread-talons:rule:source-clause-1-1","BATTLE"]` × 1; `["ruleActive:detachment-dread-talons:rule:source-clause-1-2","BATTLE"]` × 1; `["ruleActive:detachment-dread-talons:rule:source-clause-1-3","BATTLE"]` × 1; `["ruleActive:detachment-fellhammer-siege-host:enhancement:1","BATTLE"]` × 1; `["ruleActive:detachment-fellhammer-siege-host:enhancement:1:battle-clause-1","BATTLE"]` × 1; `["ruleActive:detachment-fellhammer-siege-host:enhancement:3","BATTLE"]` × 1; `["ruleActive:detachment-fellhammer-siege-host:enhancement:3:battle-clause-1","BATTLE"]` × 1; `["ruleActive:detachment-fellhammer-siege-host:enhancement:4","BATTLE"]` × 1; `["ruleActive:detachment-fellhammer-siege-host:enhancement:4:battle-clause-1","BATTLE"]` × 1; `["ruleActive:detachment-fellhammer-siege-host:enhancement:4:battle-clause-2","BATTLE"]` × 1; `["ruleActive:detachment-fellhammer-siege-host:rule","BATTLE"]` × 1; `["ruleActive:detachment-fellhammer-siege-host:rule:source-clause-1-1","BATTLE"]` × 1; `["ruleActive:detachment-huron-s-marauders:enhancement:1","BATTLE"]` × 1; `["ruleActive:detachment-huron-s-marauders:enhancement:2","BATTLE"]` × 1; `["ruleActive:detachment-huron-s-marauders:enhancement:2:battle-clause-1","BATTLE"]` × 1; `["ruleActive:detachment-huron-s-marauders:enhancement:3","BATTLE"]` × 1; `["ruleActive:detachment-huron-s-marauders:enhancement:3:battle-clause-1","BATTLE"]` × 1; `["ruleActive:detachment-huron-s-marauders:rule","BATTLE"]` × 1; `["ruleActive:detachment-huron-s-marauders:rule:source-clause-1-1","BATTLE"]` × 1; `["ruleActive:detachment-huron-s-marauders:rule:table-2-row-1","BATTLE"]` × 1; `["ruleActive:detachment-huron-s-marauders:rule:table-3-row-1","BATTLE"]` × 1; `["ruleActive:detachment-murdertalon-raiders:rule","BATTLE"]` × 1; `["ruleActive:detachment-murdertalon-raiders:rule:source-clause-1-1","BATTLE"]` × 1; `["ruleActive:detachment-murdertalon-raiders:rule:source-clause-1-2","BATTLE"]` × 1; `["ruleActive:detachment-nightmare-hunt:enhancement:1:battle-clause-1","BATTLE"]` × 1; `["ruleActive:detachment-nightmare-hunt:enhancement:2","BATTLE"]` × 1; `["ruleActive:detachment-nightmare-hunt:enhancement:2:battle-clause-1","BATTLE"]` × 1; `["ruleActive:detachment-nightmare-hunt:enhancement:3","BATTLE"]` × 1; `["ruleActive:detachment-nightmare-hunt:enhancement:3:battle-clause-1","BATTLE"]` × 1; `["ruleActive:detachment-nightmare-hunt:rule","BATTLE"]` × 1; `["ruleActive:detachment-nightmare-hunt:rule:source-clause-1-1","BATTLE"]` × 1; `["ruleActive:detachment-nightmare-hunt:rule:source-clause-1-2","BATTLE"]` × 1; `["ruleActive:detachment-nightmare-hunt:rule:source-clause-1-3","BATTLE"]` × 1; `["ruleActive:detachment-nightmare-hunt:rule:source-clause-1-4","BATTLE"]` × 1; `["ruleActive:detachment-pactbound-zealots:enhancement:1","BATTLE"]` × 1; `["ruleActive:detachment-pactbound-zealots:enhancement:1:battle-clause-1","BATTLE"]` × 1; `["ruleActive:detachment-pactbound-zealots:enhancement:2:battle-clause-1","BATTLE"]` × 1; `["ruleActive:detachment-pactbound-zealots:enhancement:3","BATTLE"]` × 1; `["ruleActive:detachment-pactbound-zealots:enhancement:3:battle-clause-1","BATTLE"]` × 1; `["ruleActive:detachment-pactbound-zealots:enhancement:4:battle-clause-1","BATTLE"]` × 1; `["ruleActive:detachment-pactbound-zealots:rule:dark-pact","BATTLE"]` × 1; `["ruleActive:detachment-pactbound-zealots:rule:source-clause-1-13","BATTLE"]` × 1; `["ruleActive:detachment-pactbound-zealots:rule:source-clause-1-3","BATTLE"]` × 1; `["ruleActive:detachment-pactbound-zealots:rule:source-clause-1-4","BATTLE"]` × 1; `["ruleActive:detachment-pactbound-zealots:rule:source-clause-1-5","BATTLE"]` × 1; `["ruleActive:detachment-pactbound-zealots:rule:source-clause-1-7","BATTLE"]` × 1; `["ruleActive:detachment-pactbound-zealots:rule:source-clause-1-8","BATTLE"]` × 1; `["ruleActive:detachment-pactbound-zealots:rule:source-clause-1-9","BATTLE"]` × 1; `["ruleActive:detachment-renegade-raiders:enhancement:1","BATTLE"]` × 1; `["ruleActive:detachment-renegade-raiders:enhancement:1:battle-clause-1","BATTLE"]` × 1; `["ruleActive:detachment-renegade-raiders:enhancement:2","BATTLE"]` × 1; `["ruleActive:detachment-renegade-raiders:enhancement:2:battle-clause-1","BATTLE"]` × 1; `["ruleActive:detachment-renegade-raiders:enhancement:4","BATTLE"]` × 1; `["ruleActive:detachment-renegade-raiders:enhancement:4:battle-clause-1","BATTLE"]` × 1; `["ruleActive:detachment-renegade-raiders:rule:source-clause-1-1","BATTLE"]` × 1; `["ruleActive:detachment-renegade-warband:enhancement:1","BATTLE"]` × 1; `["ruleActive:detachment-renegade-warband:enhancement:1:battle-clause-1","BATTLE"]` × 1; `["ruleActive:detachment-renegade-warband:enhancement:1:battle-clause-2","BATTLE"]` × 1; `["ruleActive:detachment-renegade-warband:enhancement:3","BATTLE"]` × 1; `["ruleActive:detachment-renegade-warband:enhancement:3:battle-clause-1","BATTLE"]` × 1; `["ruleActive:detachment-renegade-warband:rule:battle-clause-1","BATTLE"]` × 1; `["ruleActive:detachment-renegade-warband:rule:battle-clause-2","BATTLE"]` × 1; `["ruleActive:detachment-soulforged-warpack:enhancement:1","BATTLE"]` × 1; `["ruleActive:detachment-soulforged-warpack:enhancement:1:battle-clause-1","BATTLE"]` × 1; `["ruleActive:detachment-soulforged-warpack:enhancement:1:battle-clause-2","BATTLE"]` × 1; `["ruleActive:detachment-soulforged-warpack:enhancement:3","BATTLE"]` × 1; `["ruleActive:detachment-soulforged-warpack:enhancement:3:battle-clause-1","BATTLE"]` × 1; `["ruleActive:detachment-soulforged-warpack:enhancement:3:battle-clause-2","BATTLE"]` × 1; `["ruleActive:detachment-soulforged-warpack:enhancement:3:battle-clause-3","BATTLE"]` × 1; `["ruleActive:detachment-soulforged-warpack:enhancement:4","BATTLE"]` × 1; `["ruleActive:detachment-soulforged-warpack:enhancement:4:battle-clause-1","BATTLE"]` × 1; `["ruleActive:detachment-soulforged-warpack:rule","BATTLE"]` × 1; `["ruleActive:detachment-soulforged-warpack:rule:source-clause-1-1","BATTLE"]` × 1; `["ruleActive:detachment-soulforged-warpack:rule:source-clause-1-2","BATTLE"]` × 1; `["ruleActive:detachment-soulforged-warpack:rule:source-clause-1-3","BATTLE"]` × 1; `["ruleActive:detachment-veterans-of-the-long-war:enhancement:1","BATTLE"]` × 1; `["ruleActive:detachment-veterans-of-the-long-war:enhancement:1:battle-clause-1","BATTLE"]` × 1; `["ruleActive:detachment-veterans-of-the-long-war:enhancement:1:battle-clause-2","BATTLE"]` × 1; `["ruleActive:detachment-veterans-of-the-long-war:enhancement:2","BATTLE"]` × 1; `["ruleActive:detachment-veterans-of-the-long-war:enhancement:2:battle-clause-1","BATTLE"]` × 1; `["ruleActive:detachment-veterans-of-the-long-war:enhancement:3","BATTLE"]` × 1; `["ruleActive:detachment-veterans-of-the-long-war:enhancement:3:battle-clause-1","BATTLE"]` × 1; `["ruleActive:detachment-veterans-of-the-long-war:enhancement:4","BATTLE"]` × 1; `["ruleActive:detachment-veterans-of-the-long-war:enhancement:4:battle-clause-1","BATTLE"]` × 1; `["ruleActive:detachment-veterans-of-the-long-war:rule","BATTLE"]` × 1; `["ruleActive:detachment-veterans-of-the-long-war:rule:source-clause-1-1","BATTLE"]` × 1; `["ruleActive:detachment-warpstrike-champions:enhancement:1","BATTLE"]` × 1; `["ruleActive:detachment-warpstrike-champions:enhancement:1:battle-clause-1","BATTLE"]` × 1; `["ruleActive:detachment-warpstrike-champions:enhancement:2","BATTLE"]` × 1; `["ruleActive:detachment-warpstrike-champions:enhancement:2:battle-clause-2","BATTLE"]` × 1; `["ruleActive:detachment-warpstrike-champions:enhancement:3","BATTLE"]` × 1; `["ruleActive:detachment-warpstrike-champions:enhancement:3:battle-clause-2","BATTLE"]` × 1; `["ruleActive:detachment-warpstrike-champions:enhancement:4:battle-clause-2","BATTLE"]` × 1; `["ruleActive:detachment-warpstrike-champions:rule","BATTLE"]` × 1; `["ruleActive:detachment-warpstrike-champions:rule:source-clause-1-1","BATTLE"]` × 1; `["ruleActive:detachment-warpstrike-champions:rule:source-clause-3-1","BATTLE"]` × 1; `["ruleActive:detachment-warpstrike-champions:rule:table-2-row-1","BATTLE"]` × 1; `["ruleActive:detachment-warpstrike-champions:rule:table-2-row-2","BATTLE"]` × 1; `["ruleActive:detachment-warpstrike-champions:rule:table-2-row-3","BATTLE"]` × 1; `["ruleActive:detachment-warpstrike-champions:rule:table-2-row-4","BATTLE"]` × 1; `["sameUnitAsOwner:detachment-chaos-cult:enhancement:1","ROSTER"]` × 1; `["sameUnitAsOwner:detachment-chaos-cult:enhancement:2","ROSTER"]` × 1; `["sameUnitAsOwner:detachment-chaos-cult:enhancement:3","ROSTER"]` × 1; `["sameUnitAsOwner:detachment-devotees-of-destruction:enhancement:1","ROSTER"]` × 2; `["sameUnitAsOwner:detachment-devotees-of-destruction:enhancement:2","ROSTER"]` × 2; `["sameUnitAsOwner:detachment-dread-talons:enhancement:3","ROSTER"]` × 1; `["sameUnitAsOwner:detachment-fellhammer-siege-host:enhancement:1","ROSTER"]` × 1; `["sameUnitAsOwner:detachment-huron-s-marauders:enhancement:1","ROSTER"]` × 1; `["sameUnitAsOwner:detachment-huron-s-marauders:enhancement:2","ROSTER"]` × 1; `["sameUnitAsOwner:detachment-huron-s-marauders:enhancement:3","ROSTER"]` × 1; `["sameUnitAsOwner:detachment-murdertalon-raiders:enhancement:1","ROSTER"]` × 1; `["sameUnitAsOwner:detachment-nightmare-hunt:enhancement:1","ROSTER"]` × 1; `["sameUnitAsOwner:detachment-nightmare-hunt:enhancement:2","ROSTER"]` × 1; `["sameUnitAsOwner:detachment-nightmare-hunt:enhancement:3","ROSTER"]` × 1; `["sameUnitAsOwner:detachment-pactbound-zealots:enhancement:1","ROSTER"]` × 1; `["sameUnitAsOwner:detachment-pactbound-zealots:enhancement:2","ROSTER"]` × 1; `["sameUnitAsOwner:detachment-pactbound-zealots:enhancement:3","ROSTER"]` × 1; `["sameUnitAsOwner:detachment-pactbound-zealots:enhancement:4","ROSTER"]` × 1; `["sameUnitAsOwner:detachment-renegade-raiders:enhancement:4","ROSTER"]` × 1; `["sameUnitAsOwner:detachment-renegade-warband:enhancement:3","ROSTER"]` × 1; `["sameUnitAsOwner:detachment-veterans-of-the-long-war:enhancement:1","ROSTER"]` × 2; `["sameUnitAsOwner:detachment-warpstrike-champions:enhancement:1","ROSTER"]` × 1; `["sameUnitAsOwner:detachment-warpstrike-champions:enhancement:2","ROSTER"]` × 1; `["sameUnitAsOwner:detachment-warpstrike-champions:enhancement:3","ROSTER"]` × 1; `["sameUnitAsOwner:detachment-warpstrike-champions:enhancement:4","ROSTER"]` × 1; `["selectedAsAttackTarget","BATTLE"]` × 30; `["selectedEquipment:datasheet-chaos-bikers:wargear:4","ROSTER"]` × 3; `["selectedEquipment:datasheet-chosen:wargear:5","ROSTER"]` × 3; `["selectedEquipment:datasheet-dark-commune:section:2","ROSTER"]` × 3; `["selectedEquipment:datasheet-legionaries:wargear:3","ROSTER"]` × 3; `["selectedEquipment:datasheet-nemesis-claw:wargear:6","ROSTER"]` × 3; `["selectedEquipment:datasheet-possessed:wargear:1","ROSTER"]` × 3; `["selectedEquipment:datasheet-sorcerer-in-terminator-armour:wargear:2","ROSTER"]` × 3; `["selectedOtherDonor:detachment-deceptors:enhancement:4","BATTLE"]` × 2; `["selectedReplacementModel:detachment-deceptors:enhancement:2","BATTLE"]` × 3; `["selectedToFightThisPhase","BATTLE"]` × 32; `["selectedToMoveThisPhase","BATTLE"]` × 4; `["selectedToShootThisPhase","BATTLE"]` × 36; `["selectedUpgrade:datasheet-heretic-astartes-daemon-prince-with-wings:section:3","ROSTER"]` × 28; `["selectedUpgrade:datasheet-heretic-astartes-daemon-prince:section:3","ROSTER"]` × 28; `["selectedWarmasterAbility","BATTLE"]` × 9; `["setUpFromReservesWithinBearerExclusion:detachment-creations-of-bile:enhancement:3","BATTLE"]` × 1; `["shootFightCompletedPsychicAttackHit","BATTLE"]` × 3; `["shootOrFightResolution","BATTLE"]` × 3; `["shootSelectedActivation","BATTLE"]` × 3; `["shootingCompletedAndEnemyHit","BATTLE"]` × 3; `["shootingSelectedOncePerBattle","BATTLE"]` × 3; `["shootingStartEnemyVisibleWithin12","BATTLE"]` × 3; `["shootingStartPsychicSelectionAndRoll","BATTLE"]` × 5; `["shootingStartVisibleEnemySelected","BATTLE"]` × 3; `["sourceBackedModelMark:KHORNE","ROSTER"]` × 6; `["sourceBackedModelMark:NURGLE","ROSTER"]` × 3; `["sourceBackedModelMark:SLAANESH","ROSTER"]` × 5; `["sourceBackedModelMark:TZEENTCH","ROSTER"]` × 3; `["sourceBackedUnitMark:CHAOS UNDIVIDED","ROSTER"]` × 3; `["sourceBackedUnitMark:KHORNE","ROSTER"]` × 2; `["sourceBackedUnitMark:NURGLE","ROSTER"]` × 2; `["sourceBackedUnitMark:SLAANESH","ROSTER"]` × 2; `["sourceBackedUnitMark:TZEENTCH","ROSTER"]` × 2; `["sourceBattleApplicability:datasheet-abaddon-the-despoiler:section:5:block:0:text","BATTLE"]` × 2; `["sourceBattleApplicability:datasheet-abaddon-the-despoiler:section:5:block:1:text","BATTLE"]` × 2; `["sourceBattleApplicability:datasheet-abaddon-the-despoiler:section:5:block:2:text","BATTLE"]` × 2; `["sourceBattleApplicability:datasheet-dark-apostle:section:1:block:1:text","BATTLE"]` × 2; `["sourceBattleApplicability:datasheet-helbrute:section:1:block:0:text","BATTLE"]` × 2; `["sourceBattleApplicability:datasheet-heretic-astartes-daemon-prince:section:1:block:0:text","BATTLE"]` × 2; `["sourceBattleApplicability:datasheet-heretic-astartes-daemon-prince:section:1:block:2:text","BATTLE"]` × 2; `["sourceBattleApplicability:datasheet-huron-blackheart:section:1:block:0:text","BATTLE"]` × 2; `["sourceBattleApplicability:datasheet-lord-discordant-on-helstalker:section:1:block:1:text","BATTLE"]` × 2; `["sourceBattleApplicability:datasheet-masters-of-the-maelstrom:section:1:block:1:text","BATTLE"]` × 2; `["sourceBattleApplicability:datasheet-noctilith-crown:section:1:block:0:text","BATTLE"]` × 2; `["sourceBattleApplicability:datasheet-vashtorr-the-arkifane:section:1:block:0:text","BATTLE"]` × 2; `["sourceBattleApplicability:datasheet-vashtorr-the-arkifane:section:1:block:2:text","BATTLE"]` × 2; `["sourceBattleApplicability:datasheet-warpsmith:section:1:block:0:text","BATTLE"]` × 2; `["sourceBattleApplicability:datasheet-warpsmith:section:1:block:1:text","BATTLE"]` × 3; `["sourceUnitChargeMoveEnded","BATTLE"]` × 3; `["sourceWithinObjectiveRangeAndRangedAttack","BATTLE"]` × 3; `["stratagemTimingSatisfied","BATTLE"]` × 93; `["stratagemUseAndRoundAllowance","BATTLE"]` × 9; `["strategicReservesBattleRoundAndReinforcements","BATTLE"]` × 3; `["twoAdditionalMeleeWeaponsEquipped","ROSTER"]` × 3; `["visibleToPrimaryAndAttacker","BATTLE"]` × 2; `["warmasterCommandSelection","BATTLE"]` × 3; `["warmasterRecipientWithin6:datasheet-abaddon-the-despoiler:section:5:block:0:text","BATTLE"]` × 3; `["warmasterRecipientWithin6:datasheet-abaddon-the-despoiler:section:5:block:1:text","BATTLE"]` × 3; `["warmasterRecipientWithin6:datasheet-abaddon-the-despoiler:section:5:block:2:text","BATTLE"]` × 3; `["withinEnemyEngagementRange","BATTLE"]` × 12; `["withinFocusOfHatredEngagementRange","BATTLE"]` × 2; `["withinFriendlyObjectiveRange","BATTLE"]` × 4; `["withinPrimaryTargetRange","BATTLE"]` × 2.

Ключи без извлечённой literal-декларации: нет. Это **не** отсутствие schema: factories могут выводить объявления из FIELD-атомов или computed constant keys; точный исходный factory указан в `fieldDeclarationEvidence`/`lineage.producerRefs`. Числа употребления ключей вычислены из данных независимо от literal extraction.

### dark-angels

| Конструкция | Фактические значения × число |
|---|---|
| `contractSchema` | `rule-contract/v2` × 326 |
| `executionMode` | `BATTLE_ACTION` × 60; `DECLARATIVE_APPLICABILITY` × 266 |
| `contractRole.subject` | `MODEL` × 30; `UNIT` × 296 |
| `contractRole.purpose` | `OWNER` × 326 |
| `contractRole.binding` | `ABSENT` × 326 |
| `contractRole.sourceRoleId` | `ABSENT` × 326 |
| `clauseRole.subject` | `MODEL` × 75; `UNIT` × 694 |
| `clauseRole.purpose` | `OWNER` × 769 |
| `clauseRole.binding` | `ABSENT` × 769 |
| `clauseRole.sourceRoleId` | `ABSENT` × 769 |
| `effectRecipientRoleIds` | `ABSENT` × 769 |
| `rosterEffect.targetBinding` | `ROSTER_MODELS` × 1; `ROSTER_UNITS` × 9; `SOURCE_FORMED_MODELS` × 7; `SOURCE_MODEL` × 21; `SOURCE_UNIT` × 23; `SOURCE_UNIT_MODELS` × 7 |
| `rosterEffect.targetSubject` | `MODEL` × 36; `UNIT` × 32 |
| `rosterEffect.unitScope` | `ABSENT` × 50; `FORMED` × 11; `PHYSICAL` × 7 |
| `rosterEffect.containingUnitScope` | `ABSENT` × 67; `FORMED` × 1 |
| `conditionalPolicy.kind` | `ABSENT` × 752; `IGNORE_MODIFIERS` × 2; `INCOMING_MODIFIER` × 4; `QUALIFIED_FNP` × 4; `REROLL` × 6; `STRATAGEM_TARGET_RESTRICTION` × 1 |
| `conditionalPolicy.recipientScope` | `ABSENT` × 752; `AURA_UNRESOLVED` × 3; `FORMED_UNIT` × 14 |
| `predicates` | `ALWAYS` × 956; `FIELD` × 44; `MODEL_ABILITY` × 4; `MODEL_ID` × 3; `MODEL_KEYWORD` × 154; `UNIT_ID` × 32; `UNIT_KEYWORD` × 115; `{"args":[{"arguments":{"id":"unit-sm-0b0b22ecffa74125"},"contextLevel":"STATIC","evidence":{"field":["text"],"quote":"- BLADEGUARD ANCIENT, BLADEGUARD VETERAN SQUAD, STERNGUARD VETERAN SQUAD and VANGUARD VETERAN SQUAD WITH JUMP PACKS units."},"predicate":"UNIT_ID","subject":"UNIT"},{"arguments":{"id":"unit-sm-24b4709c45ef4b2d"},"contextLevel":"STATIC","evidence":{"field":["text"],"quote":"- BLADEGUARD ANCIENT, BLADEGUARD VETERAN SQUAD, STERNGUARD VETERAN SQUAD and VANGUARD VETERAN SQUAD WITH JUMP PACKS units."},"predicate":"UNIT_ID","subject":"UNIT"},{"arguments":{"id":"unit-sm-67f47cb0752e44ad"},"contextLevel":"STATIC","evidence":{"field":["text"],"quote":"- BLADEGUARD ANCIENT, BLADEGUARD VETERAN SQUAD, STERNGUARD VETERAN SQUAD and VANGUARD VETERAN SQUAD WITH JUMP PACKS units."},"predicate":"UNIT_ID","subject":"UNIT"},{"arguments":{"id":"unit-sm-74c53544aa694147"},"contextLevel":"STATIC","evidence":{"field":["text"],"quote":"- BLADEGUARD ANCIENT, BLADEGUARD VETERAN SQUAD, STERNGUARD VETERAN SQUAD and VANGUARD VETERAN SQUAD WITH JUMP PACKS units."},"predicate":"UNIT_ID","subject":"UNIT"}],"op":"ANY"}` × 1; `{"args":[{"arguments":{"id":"unit-sm-0dd92e6d8ad54ee6"},"contextLevel":"STATIC","evidence":{"field":["text"],"quote":"- MOUNTED units."},"predicate":"UNIT_ID","subject":"UNIT"},{"arguments":{"id":"unit-sm-4cd4bf89720c4fa0"},"contextLevel":"STATIC","evidence":{"field":["text"],"quote":"- MOUNTED units."},"predicate":"UNIT_ID","subject":"UNIT"},{"arguments":{"id":"unit-sm-56eaa095b0ae4fe4"},"contextLevel":"STATIC","evidence":{"field":["text"],"quote":"- MOUNTED units."},"predicate":"UNIT_ID","subject":"UNIT"},{"arguments":{"id":"unit-sm-9f9e7c18b7354927"},"contextLevel":"STATIC","evidence":{"field":["text"],"quote":"- MOUNTED units."},"predicate":"UNIT_ID","subject":"UNIT"}],"op":"ANY"}` × 1; `{"args":[{"arguments":{"id":"unit-sm-1330b7672f934fd8"},"contextLevel":"STATIC","evidence":{"field":["text"],"quote":"- TERMINATOR units."},"predicate":"UNIT_ID","subject":"UNIT"},{"arguments":{"id":"unit-sm-5ce71f2f4e5e4ebb"},"contextLevel":"STATIC","evidence":{"field":["text"],"quote":"- TERMINATOR units."},"predicate":"UNIT_ID","subject":"UNIT"},{"arguments":{"id":"unit-sm-9e163be8d4bb42c1"},"contextLevel":"STATIC","evidence":{"field":["text"],"quote":"- TERMINATOR units."},"predicate":"UNIT_ID","subject":"UNIT"},{"arguments":{"id":"unit-sm-b994e641eaea4060"},"contextLevel":"STATIC","evidence":{"field":["text"],"quote":"- TERMINATOR units."},"predicate":"UNIT_ID","subject":"UNIT"},{"arguments":{"id":"unit-sm-d101fa171b7a40c4"},"contextLevel":"STATIC","evidence":{"field":["text"],"quote":"- TERMINATOR units."},"predicate":"UNIT_ID","subject":"UNIT"},{"arguments":{"id":"unit-sm-db3ce647d7024b24"},"contextLevel":"STATIC","evidence":{"field":["text"],"quote":"- TERMINATOR units."},"predicate":"UNIT_ID","subject":"UNIT"}],"op":"ANY"}` × 1; `{"args":[{"arguments":{"id":"unit-sm-32e5b655a21342f6"},"contextLevel":"STATIC","evidence":{"field":["text"],"quote":"- DREADNOUGHT units."},"predicate":"UNIT_ID","subject":"UNIT"},{"arguments":{"id":"unit-sm-4f6baee09b3248a6"},"contextLevel":"STATIC","evidence":{"field":["text"],"quote":"- DREADNOUGHT units."},"predicate":"UNIT_ID","subject":"UNIT"},{"arguments":{"id":"unit-sm-fee1a559233f4cbb"},"contextLevel":"STATIC","evidence":{"field":["text"],"quote":"- DREADNOUGHT units."},"predicate":"UNIT_ID","subject":"UNIT"}],"op":"ANY"}` × 1; `{"args":[{"arguments":{"id":"unit-sm-46fb0fe9443c4e95"},"contextLevel":"STATIC","evidence":{"field":["text"],"quote":"- LAND RAIDER, LAND RAIDER CRUSADER, LAND RAIDER REDEEMER, REPULSOR and REPULSOR EXECUTIONER units."},"predicate":"UNIT_ID","subject":"UNIT"},{"arguments":{"id":"unit-sm-65c7cc53e3fc4fc8"},"contextLevel":"STATIC","evidence":{"field":["text"],"quote":"- LAND RAIDER, LAND RAIDER CRUSADER, LAND RAIDER REDEEMER, REPULSOR and REPULSOR EXECUTIONER units."},"predicate":"UNIT_ID","subject":"UNIT"},{"arguments":{"id":"unit-sm-bc409233f3fe4dc1"},"contextLevel":"STATIC","evidence":{"field":["text"],"quote":"- LAND RAIDER, LAND RAIDER CRUSADER, LAND RAIDER REDEEMER, REPULSOR and REPULSOR EXECUTIONER units."},"predicate":"UNIT_ID","subject":"UNIT"},{"arguments":{"id":"unit-sm-d0a8c043f5c24b22"},"contextLevel":"STATIC","evidence":{"field":["text"],"quote":"- LAND RAIDER, LAND RAIDER CRUSADER, LAND RAIDER REDEEMER, REPULSOR and REPULSOR EXECUTIONER units."},"predicate":"UNIT_ID","subject":"UNIT"},{"arguments":{"id":"unit-sm-e75d543e81cf49f3"},"contextLevel":"STATIC","evidence":{"field":["text"],"quote":"- LAND RAIDER, LAND RAIDER CRUSADER, LAND RAIDER REDEEMER, REPULSOR and REPULSOR EXECUTIONER units."},"predicate":"UNIT_ID","subject":"UNIT"}],"op":"ANY"}` × 1; `{"args":[{"arguments":{"id":"unit-sm-80ac1421ce0f4de3"},"contextLevel":"STATIC","evidence":{"field":["text"],"quote":"- VEHICLE FLY units."},"predicate":"UNIT_ID","subject":"UNIT"},{"arguments":{"id":"unit-sm-d44763a8089742c3"},"contextLevel":"STATIC","evidence":{"field":["text"],"quote":"- VEHICLE FLY units."},"predicate":"UNIT_ID","subject":"UNIT"},{"arguments":{"id":"unit-sm-f4717a6371254e73"},"contextLevel":"STATIC","evidence":{"field":["text"],"quote":"- VEHICLE FLY units."},"predicate":"UNIT_ID","subject":"UNIT"},{"arguments":{"id":"unit-sm-f92faa31422041f5"},"contextLevel":"STATIC","evidence":{"field":["text"],"quote":"- VEHICLE FLY units."},"predicate":"UNIT_ID","subject":"UNIT"}],"op":"ANY"}` × 1; `{"args":[{"arguments":{"keyword":"ADEPTUS ASTARTES"},"contextLevel":"STATIC","evidence":{"field":["text"],"quote":"Friendly ADEPTUS ASTARTES TERMINATOR units have +1 to charge rolls."},"predicate":"UNIT_KEYWORD","subject":"UNIT"},{"arguments":{"keyword":"TERMINATOR"},"contextLevel":"STATIC","evidence":{"field":["text"],"quote":"Friendly ADEPTUS ASTARTES TERMINATOR units have +1 to charge rolls."},"predicate":"UNIT_KEYWORD","subject":"UNIT"}],"op":"ALL"}` × 1; `{"args":[{"arguments":{"keyword":"RAVENWING"},"contextLevel":"STATIC","evidence":{"field":["text"],"quote":"Friendly RAVENWING FLY units’ ranged attacks have [IGNORES COVER]."},"predicate":"UNIT_KEYWORD","subject":"UNIT"},{"arguments":{"keyword":"FLY"},"contextLevel":"STATIC","evidence":{"field":["text"],"quote":"Friendly RAVENWING FLY units’ ranged attacks have [IGNORES COVER]."},"predicate":"UNIT_KEYWORD","subject":"UNIT"}],"op":"ALL"}` × 1; `{"arguments":{"equals":false,"key":"attached"},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"- This unit has MOBILE."},"predicate":"FIELD","subject":"UNIT"}` × 1; `{"arguments":{"equals":false,"key":"attached"},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"Astartes Banner: While this unit contains a RAVENWING ANCIENT, this unit has +1 OC."},"predicate":"FIELD","subject":"UNIT"}` × 1; `{"arguments":{"equals":false,"key":"attached"},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"Has 5+ InSv."},"predicate":"FIELD","subject":"UNIT"}` × 1; `{"arguments":{"equals":false,"key":"attached"},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"Honour of the Company: This unit has +1 OC."},"predicate":"FIELD","subject":"UNIT"}` × 1; `{"arguments":{"equals":false,"key":"attached"},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"Shield Dome: This unit has 5+ InSv."},"predicate":"FIELD","subject":"UNIT"}` × 1; `{"arguments":{"equals":false,"key":"attached"},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"The Lion Helm: This unit has 4+ InSv."},"predicate":"FIELD","subject":"UNIT"}` × 1; `{"arguments":{"equals":false,"key":"attached"},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"This unit has +1 OC."},"predicate":"FIELD","subject":"UNIT"}` × 1; `{"arguments":{"equals":true,"key":"attached"},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"- This unit has MOBILE."},"predicate":"FIELD","subject":"UNIT"}` × 1; `{"arguments":{"equals":true,"key":"attached"},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"Astartes Banner: While this unit contains a RAVENWING ANCIENT, this unit has +1 OC."},"predicate":"FIELD","subject":"UNIT"}` × 1; `{"arguments":{"equals":true,"key":"attached"},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"Has 5+ InSv."},"predicate":"FIELD","subject":"UNIT"}` × 1; `{"arguments":{"equals":true,"key":"attached"},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"Honour of the Company: This unit has +1 OC."},"predicate":"FIELD","subject":"UNIT"}` × 1; `{"arguments":{"equals":true,"key":"attached"},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"Shield Dome: This unit has 5+ InSv."},"predicate":"FIELD","subject":"UNIT"}` × 1; `{"arguments":{"equals":true,"key":"attached"},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"The Lion Helm: This unit has 4+ InSv."},"predicate":"FIELD","subject":"UNIT"}` × 1; `{"arguments":{"equals":true,"key":"attached"},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"This unit has +1 OC."},"predicate":"FIELD","subject":"UNIT"}` × 1; `{"arguments":{"equals":true,"key":"daAncientPresent"},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"Astartes Banner: While this unit contains a RAVENWING ANCIENT, this unit has +1 OC."},"predicate":"FIELD","subject":"UNIT"}` × 2; `{"arguments":{"equals":true,"key":"daArmyMembershipProven"},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"- BLADEGUARD ANCIENT, BLADEGUARD VETERAN SQUAD, STERNGUARD VETERAN SQUAD and VANGUARD VETERAN SQUAD WITH JUMP PACKS units."},"predicate":"FIELD","subject":"UNIT"}` × 1; `{"arguments":{"equals":true,"key":"daArmyMembershipProven"},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"- DREADNOUGHT units."},"predicate":"FIELD","subject":"UNIT"}` × 1; `{"arguments":{"equals":true,"key":"daArmyMembershipProven"},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"- LAND RAIDER, LAND RAIDER CRUSADER, LAND RAIDER REDEEMER, REPULSOR and REPULSOR EXECUTIONER units."},"predicate":"FIELD","subject":"UNIT"}` × 1; `{"arguments":{"equals":true,"key":"daArmyMembershipProven"},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"- MOUNTED units."},"predicate":"FIELD","subject":"UNIT"}` × 1; `{"arguments":{"equals":true,"key":"daArmyMembershipProven"},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"- TERMINATOR units."},"predicate":"FIELD","subject":"UNIT"}` × 1; `{"arguments":{"equals":true,"key":"daArmyMembershipProven"},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"- VEHICLE FLY units."},"predicate":"FIELD","subject":"UNIT"}` × 1; `{"arguments":{"equals":true,"key":"daChampionPresent"},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"- This unit has +1 to advance rolls and charge rolls."},"predicate":"FIELD","subject":"UNIT"}` × 2; `{"arguments":{"equals":true,"key":"equipmentRequirementSatisfied"},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"Combat Shield: This model has 5+ InSv."},"predicate":"FIELD","subject":"UNIT"}` × 1; `{"arguments":{"equals":true,"key":"equipmentRequirementSatisfied"},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"Grav-chutes: This unit has Deep Strike."},"predicate":"FIELD","subject":"UNIT"}` × 1; `{"arguments":{"equals":true,"key":"equipmentRequirementSatisfied"},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"Orbital Comms Array: This unit has Scouts 6\"."},"predicate":"FIELD","subject":"UNIT"}` × 1; `{"arguments":{"equals":true,"key":"equipmentRequirementSatisfied"},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"Relic Shield: This model has +1 W."},"predicate":"FIELD","subject":"UNIT"}` × 3; `{"arguments":{"equals":true,"key":"equipmentRequirementSatisfied"},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"Shield Dome: This unit has 5+ InSv."},"predicate":"FIELD","subject":"UNIT"}` × 2; `{"arguments":{"equals":true,"key":"equipmentRequirementSatisfied"},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"Storm Shield: This model has +1 W."},"predicate":"FIELD","subject":"UNIT"}` × 1; `{"arguments":{"equals":true,"key":"equipmentRequirementSatisfied"},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"Storm Shield: This model has a 4+ InSv."},"predicate":"FIELD","subject":"UNIT"}` × 1; `{"arguments":{"equals":true,"key":"equipmentRequirementSatisfied"},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"The Lion Helm: This unit has 4+ InSv."},"predicate":"FIELD","subject":"UNIT"}` × 2; `{"arguments":{"equals":true,"key":"smEquipmentBearerSatisfied"},"contextLevel":"ROSTER","evidence":{"field":["text"],"otherEntityId":"ability-sm-097567b13c02404d","quote":"Storm Shield: This model has a 4+ InSv."},"predicate":"FIELD","subject":"MODEL"}` × 1; `{"arguments":{"equals":true,"key":"smEquipmentBearerSatisfied"},"contextLevel":"ROSTER","evidence":{"field":["text"],"otherEntityId":"ability-sm-431f22d15f7545b4","quote":"Relic Shield: This model has +1 W."},"predicate":"FIELD","subject":"MODEL"}` × 1; `{"arguments":{"equals":true,"key":"smEquipmentBearerSatisfied"},"contextLevel":"ROSTER","evidence":{"field":["text"],"otherEntityId":"ability-sm-63d4ca967fa64b79","quote":"Combat Shield: This model has 5+ InSv."},"predicate":"FIELD","subject":"MODEL"}` × 1; `{"arguments":{"equals":true,"key":"smEquipmentBearerSatisfied"},"contextLevel":"ROSTER","evidence":{"field":["text"],"otherEntityId":"ability-sm-8c9e7e37a8494c1d","quote":"Relic Shield: This model has +1 W."},"predicate":"FIELD","subject":"MODEL"}` × 1; `{"arguments":{"equals":true,"key":"smEquipmentBearerSatisfied"},"contextLevel":"ROSTER","evidence":{"field":["text"],"otherEntityId":"ability-sm-aa81f0067a3140de","quote":"Storm Shield: This model has +1 W."},"predicate":"FIELD","subject":"MODEL"}` × 1; `{"arguments":{"equals":true,"key":"smEquipmentBearerSatisfied"},"contextLevel":"ROSTER","evidence":{"field":["text"],"otherEntityId":"ability-sm-daf87042d20348dd","quote":"Relic Shield: This model has +1 W."},"predicate":"FIELD","subject":"MODEL"}` × 1; `{"arguments":{"equals":true,"key":"smPermanentAssaultSource"},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"If the assault doctrine is active for this unit, +2 S and AP."},"predicate":"FIELD","subject":"UNIT"}` × 2; `{"arguments":{"id":"unit-sm-0dd92e6d8ad54ee6"},"contextLevel":"STATIC","evidence":{"field":["text"],"quote":"Friendly OUTRIDER SQUAD units have BATTLELINE."},"predicate":"UNIT_ID","subject":"UNIT"}` × 1; `{"arguments":{"keyword":"ADEPTUS ASTARTES"},"contextLevel":"STATIC","evidence":{"field":["text"],"quote":"- BLADEGUARD ANCIENT, BLADEGUARD VETERAN SQUAD, STERNGUARD VETERAN SQUAD and VANGUARD VETERAN SQUAD WITH JUMP PACKS units."},"predicate":"UNIT_KEYWORD","subject":"UNIT"}` × 1; `{"arguments":{"keyword":"ADEPTUS ASTARTES"},"contextLevel":"STATIC","evidence":{"field":["text"],"quote":"- DREADNOUGHT units."},"predicate":"UNIT_KEYWORD","subject":"UNIT"}` × 1; `{"arguments":{"keyword":"ADEPTUS ASTARTES"},"contextLevel":"STATIC","evidence":{"field":["text"],"quote":"- LAND RAIDER, LAND RAIDER CRUSADER, LAND RAIDER REDEEMER, REPULSOR and REPULSOR EXECUTIONER units."},"predicate":"UNIT_KEYWORD","subject":"UNIT"}` × 1; `{"arguments":{"keyword":"ADEPTUS ASTARTES"},"contextLevel":"STATIC","evidence":{"field":["text"],"quote":"- MOUNTED units."},"predicate":"UNIT_KEYWORD","subject":"UNIT"}` × 1; `{"arguments":{"keyword":"ADEPTUS ASTARTES"},"contextLevel":"STATIC","evidence":{"field":["text"],"quote":"- TERMINATOR units."},"predicate":"UNIT_KEYWORD","subject":"UNIT"}` × 1; `{"arguments":{"keyword":"ADEPTUS ASTARTES"},"contextLevel":"STATIC","evidence":{"field":["text"],"quote":"- VEHICLE FLY units."},"predicate":"UNIT_KEYWORD","subject":"UNIT"}` × 1 |
| `predicateContext` | `ABSENT` × 59; `ROSTER` × 44; `STATIC` × 1264 |
| `rosterClassification` | `DISPLAY_ONLY` × 718; `ROSTER_EXECUTABLE` × 51 |

Связи ролей (`actorRoleId`, `prerequisites`, `distinctFromRoleIds`, required/optional) со всеми значениями и частотами: `books[3].dictionary` в JSON. Отсутствующий purpose не доказывает получателя.

**FIELD key / уровень × число:** `["attached","ROSTER"]` × 14; `["daAncientPresent","ROSTER"]` × 2; `["daArmyMembershipProven","ROSTER"]` × 6; `["daChampionPresent","ROSTER"]` × 2; `["equipmentRequirementSatisfied","ROSTER"]` × 12; `["smEquipmentBearerSatisfied","ROSTER"]` × 6; `["smPermanentAssaultSource","ROSTER"]` × 2.

Ключи без извлечённой literal-декларации: нет. Это **не** отсутствие schema: factories могут выводить объявления из FIELD-атомов или computed constant keys; точный исходный factory указан в `fieldDeclarationEvidence`/`lineage.producerRefs`. Числа употребления ключей вычислены из данных независимо от literal extraction.

### death-guard

| Конструкция | Фактические значения × число |
|---|---|
| `contractSchema` | `death-guard-rule-contract/v2` × 239 |
| `executionMode` | `BATTLE_ACTION` × 45; `DATASHEET_DECLARATION` × 142; `DECLARATIVE_APPLICABILITY` × 39; `RULE_DECLARATION` × 8; `SOURCE_DIRECTIVE` × 5 |
| `contractRole.subject` | `FORMED_ATTACHED_UNIT` × 3; `MODEL` × 48; `ROSTER` × 25; `UNIT` × 227 |
| `contractRole.purpose` | `ABSENT` × 194; `ANCHOR` × 5; `CREATED_OUTPUT` × 1; `EFFECT_RECIPIENT` × 55; `PRIMARY_TARGET` × 45; `SECONDARY_TARGET` × 1; `TRIGGER_ACTOR` × 2 |
| `contractRole.binding` | `ABSENT` × 194; `ATTACK_TARGET` × 2; `INDEPENDENT_ENTITY` × 32; `PRIMARY_ACTOR` × 60; `PRIMARY_MEMBERS` × 15 |
| `contractRole.sourceRoleId` | `ABSENT` × 303 |
| `clauseRole.subject` | `FORMED_ATTACHED_UNIT` × 6; `MODEL` × 29; `ROSTER` × 7; `UNIT` × 78 |
| `clauseRole.purpose` | `ABSENT` × 54; `ANCHOR` × 5; `CREATED_OUTPUT` × 1; `EFFECT_RECIPIENT` × 57; `SECONDARY_TARGET` × 1; `TRIGGER_ACTOR` × 2 |
| `clauseRole.binding` | `ABSENT` × 54; `ATTACK_TARGET` × 4; `INDEPENDENT_ENTITY` × 32; `PRIMARY_ACTOR` × 15; `PRIMARY_MEMBERS` × 15 |
| `clauseRole.sourceRoleId` | `ABSENT` × 120 |
| `effectRecipientRoleIds` | `ABSENT` × 250; `["attacking-enemy"]` × 1; `["enemy-affected"]` × 7; `["friendly-army-models"]` × 1; `["friendly-beneficiary"]` × 1; `["new-unit"]` × 1; `["primary-attacks"]` × 1; `["primary-destroyed-model"]` × 1; `["primary-effect-1"]` × 7; `["primary-effect-2"]` × 3; `["primary-melee-weapons"]` × 1; `["primary-model-attack"]` × 1; `["primary-model-attacks"]` × 6; `["primary-models"]` × 5; `["primary-ranged-attacks"]` × 2; `["primary-ranged-attacks-2"]` × 1; `["primary-ranged-weapons"]` × 2; `["recipient-unit"]` × 1; `["selected-enemy"]` × 8; `["shield-unit"]` × 1; `["triggering-enemy"]` × 1; `[]` × 4 |
| `rosterEffect.targetBinding` | `LEADERS_OF_SOURCE` × 1; `ROSTER_UNITS` × 4; `SOURCE_FORMED_MODELS` × 9; `SOURCE_MODEL` × 9; `SOURCE_UNIT` × 4; `SOURCE_UNIT_MODELS` × 2 |
| `rosterEffect.targetSubject` | `MODEL` × 21; `UNIT` × 8 |
| `rosterEffect.unitScope` | `ABSENT` × 27; `FORMED` × 2 |
| `rosterEffect.containingUnitScope` | `ABSENT` × 29 |
| `conditionalPolicy.kind` | `ABSENT` × 306 |
| `conditionalPolicy.recipientScope` | `ABSENT` × 306 |
| `predicates` | `ALWAYS` × 161; `BODYGUARD_ID` × 5; `CHARACTER_MODEL_COUNT` × 1; `DETACHMENT` × 84; `FIELD` × 536; `LEADING` × 18; `MODEL_ABILITY` × 1; `MODEL_KEYWORD` × 120; `UNIT_ID` × 142; `UNIT_KEYWORD` × 131; `{"args":[{"arguments":{"keyword":"FOETID BLOAT-DRONE"},"contextLevel":"STATIC","evidence":{"field":["text"],"quote":"FOETID BLOAT-DRONE"},"predicate":"UNIT_KEYWORD","subject":"UNIT"},{"arguments":{"keyword":"FOETID BLOAT-DRONE WITH HEAVY BLIGHT LAUNCHER"},"contextLevel":"STATIC","evidence":{"field":["text"],"quote":"FOETID BLOAT-DRONE WITH HEAVY BLIGHT LAUNCHER"},"predicate":"UNIT_KEYWORD","subject":"UNIT"},{"arguments":{"keyword":"HELBRUTE"},"contextLevel":"STATIC","evidence":{"field":["text"],"quote":"HELBRUTE"},"predicate":"UNIT_KEYWORD","subject":"UNIT"},{"arguments":{"keyword":"MYPHITIC BLIGHT-HAULER"},"contextLevel":"STATIC","evidence":{"field":["text"],"quote":"MYPHITIC BLIGHT-HAULER"},"predicate":"UNIT_KEYWORD","subject":"UNIT"}],"op":"ANY"}` × 1; `{"arguments":{"equals":true,"key":"equipmentRequirementSatisfied"},"contextLevel":"ROSTER","evidence":{"field":["blocks",1,"text"],"quote":"equipped with two melee weapons in addition to its close combat weapon"},"predicate":"FIELD","subject":"MODEL"}` × 1; `{"arguments":{"equals":true,"key":"equipmentRequirementSatisfied"},"contextLevel":"ROSTER","evidence":{"field":["text"],"otherEntityId":"datasheet-plague-drones:wargear:1","quote":"can be equipped with 1 instrument of Chaos."},"predicate":"FIELD","subject":"UNIT"}` × 1; `{"arguments":{"equals":true,"key":"equipmentRequirementSatisfied"},"contextLevel":"ROSTER","evidence":{"field":["text"],"otherEntityId":"datasheet-plague-drones:wargear:2","quote":"1 daemonic icon."},"predicate":"FIELD","subject":"UNIT"}` × 1; `{"arguments":{"equals":true,"key":"equipmentRequirementSatisfied"},"contextLevel":"ROSTER","evidence":{"field":["text"],"otherEntityId":"datasheet-plaguebearers:wargear:1","quote":"can be equipped with 1 instrument of Chaos."},"predicate":"FIELD","subject":"UNIT"}` × 1; `{"arguments":{"equals":true,"key":"equipmentRequirementSatisfied"},"contextLevel":"ROSTER","evidence":{"field":["text"],"otherEntityId":"datasheet-plaguebearers:wargear:2","quote":"1 daemonic icon."},"predicate":"FIELD","subject":"UNIT"}` × 1; `{"arguments":{"id":"unit-poxwalkers"},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"POXWALKERS unit"},"predicate":"BODYGUARD_ID","subject":"MODEL"}` × 2; `{"arguments":{"keyword":"CHARACTER"},"contextLevel":"STATIC","evidence":{"field":["blocks",0,"text"],"quote":"CHARACTER model"},"predicate":"MODEL_KEYWORD","subject":"MODEL"}` × 1; `{"arguments":{"keyword":"CHARACTER"},"contextLevel":"STATIC","evidence":{"field":["text"],"quote":"CHARACTER"},"predicate":"UNIT_KEYWORD","subject":"UNIT"}` × 1; `{"arguments":{"keyword":"CONTAGION ENGINE"},"contextLevel":"STATIC","evidence":{"field":["text"],"quote":"CONTAGION ENGINE"},"predicate":"UNIT_KEYWORD","subject":"UNIT"}` × 1; `{"arguments":{"keyword":"DEATH GUARD"},"contextLevel":"STATIC","evidence":{"field":["text"],"quote":"DEATH GUARD"},"predicate":"UNIT_KEYWORD","subject":"UNIT"}` × 1; `{"arguments":{"keyword":"POXWALKERS"},"contextLevel":"STATIC","evidence":{"field":["text"],"quote":"POXWALKERS models"},"predicate":"MODEL_KEYWORD","subject":"MODEL"}` × 1; `{"arguments":{"keyword":"POXWALKERS"},"contextLevel":"STATIC","evidence":{"field":["text"],"quote":"POXWALKERS"},"predicate":"UNIT_KEYWORD","subject":"UNIT"}` × 1; `{"arguments":{"value":true},"contextLevel":"ROSTER","evidence":{"field":["blocks",0,"text"],"quote":"leading a unit"},"predicate":"LEADING","subject":"MODEL"}` × 6; `{"arguments":{"value":true},"contextLevel":"ROSTER","evidence":{"field":["blocks",0,"text"],"quote":"leading this unit"},"predicate":"LEADING","subject":"MODEL"}` × 1; `{"arguments":{"value":true},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"While the bearer is leading a POXWALKERS unit"},"predicate":"LEADING","subject":"MODEL"}` × 2; `{"arguments":{"value":true},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"While the bearer is leading a unit"},"predicate":"LEADING","subject":"MODEL"}` × 2 |
| `predicateContext` | `ABSENT` × 25; `BATTLE` × 479; `ROSTER` × 165; `STATIC` × 555 |
| `rosterClassification` | `BATTLE_ONLY` × 158; `DISPLAY_ONLY` × 11; `NOT_AN_EFFECT` × 112; `ROSTER_EXECUTABLE` × 25 |

Связи ролей (`actorRoleId`, `prerequisites`, `distinctFromRoleIds`, required/optional) со всеми значениями и частотами: `books[4].dictionary` в JSON. Отсутствующий purpose не доказывает получателя.

**FIELD key / уровень × число:** `["additionalPlagueSelected","BATTLE"]` × 2; `["afflicted","BATTLE"]` × 4; `["afterAttackingUnitFinishedAttacks","BATTLE"]` × 2; `["allocatedToModelInPrimaryUnit","BATTLE"]` × 2; `["attached","ROSTER"]` × 6; `["attackAllocatedToThisModel","BATTLE"]` × 2; `["attackStrengthExceedsUnitToughness","BATTLE"]` × 1; `["attackTargetEnemyWithinEngagementRangeOfFriendlyPlagueLegionsUnit","BATTLE"]` × 2; `["attackTargetsUnitInFriendlyContagionRange","BATTLE"]` × 1; `["attackedPrimaryUnitThisPhase","BATTLE"]` × 2; `["attackerWithinEighteen","BATTLE"]` × 1; `["attacksFromSelectedAttackEvent","BATTLE"]` × 2; `["battleRoundStart","BATTLE"]` × 2; `["battleShockTest","BATTLE"]` × 1; `["battleShockTestPassed","BATTLE"]` × 2; `["battleShocked","BATTLE"]` × 2; `["bearerMadePlagueWindAttacks","BATTLE"]` × 1; `["bearerMeleeAttack","BATTLE"]` × 1; `["bearerUnitFinishedAttacks","BATTLE"]` × 1; `["bearerUnitFinishedFighting","BATTLE"]` × 1; `["bearerUnitModelAttacks","BATTLE"]` × 1; `["bearerUnitNotEngaged","BATTLE"]` × 1; `["bearerUnitWithinControlledObjective","BATTLE"]` × 1; `["belowStartingStrength","BATTLE"]` × 3; `["canBeLedByPrimary","ROSTER"]` × 2; `["characterDestroyedByThoseAttacks","BATTLE"]` × 1; `["controlsObjective","BATTLE"]` × 1; `["destroyedThisPhase","BATTLE"]` × 2; `["diceForPrimaryModelsDestroyedByThoseAttacks","BATTLE"]` × 2; `["dicePerPrimaryModelWithinEngagementRangeOfSelectedEnemy","BATTLE"]` × 2; `["enemiesWithinEngagementRangeOfPrimary","BATTLE"]` × 2; `["enemyAttackTargetBelowStartingStrength","BATTLE"]` × 2; `["enemyAttackTargetWithinHalfRange","BATTLE"]` × 2; `["enemyEngagedWithPrimary","BATTLE"]` × 2; `["enemyFallBackSelection","BATTLE"]` × 4; `["enemyModelLosesWoundWhileItsUnitEngagedWithPrimary","BATTLE"]` × 2; `["enemyModelsDestroyedByThisStratagem","BATTLE"]` × 2; `["enemySelectedForMiasmicBombardment","BATTLE"]` × 1; `["enemyTargetInOpponentDeploymentZone","BATTLE"]` × 2; `["enemyTargetSelectionJustFinished","BATTLE"]` × 10; `["enfeebledByBearerPestilentFallout","BATTLE"]` × 1; `["engaged","BATTLE"]` × 3; `["engagedWithPrimary","BATTLE"]` × 2; `["equipmentRequirementSatisfied","ROSTER"]` × 5; `["failedLeadershipImpliesRemainStationary","BATTLE"]` × 2; `["fightAfterAttackerFinishesThenRemove","BATTLE"]` × 2; `["fightPhaseStart","BATTLE"]` × 1; `["fireOverwatchSelected","BATTLE"]` × 1; `["friendlyActionStarted","BATTLE"]` × 2; `["friendlyAttackSelection","BATTLE"]` × 2; `["friendlyChargeMoveJustEnded","BATTLE"]` × 4; `["friendlyShootingSelection","BATTLE"]` × 6; `["hasAtLeastTwoLeaderUnits","ROSTER"]` × 2; `["hasFriendlyCharacterLeader","ROSTER"]` × 2; `["hasLostWounds","BATTLE"]` × 1; `["hasNotFoughtThisPhase","BATTLE"]` × 2; `["identicalToDestroyedPrimaryUnit","ROSTER"]` × 2; `["inBearerUnitEngagementRange","BATTLE"]` × 1; `["inOpponentDeploymentZone","BATTLE"]` × 3; `["inStrategicReserves","BATTLE"]` × 2; `["isAfflicted","BATTLE"]` × 2; `["isBodyguardModel","ROSTER"]` × 1; `["isTriggerUnit","BATTLE"]` × 8; `["isWarlord","ROSTER"]` × 1; `["justDestroyed","BATTLE"]` × 3; `["makesAttack","BATTLE"]` × 2; `["meleeWeaponEquippedByPrimaryUnitModel","ROSTER"]` × 2; `["memberOfBearerUnit","ROSTER"]` × 2; `["memberOfPrimaryAttachedUnit","ROSTER"]` × 6; `["memberOfPrimaryUnit","ROSTER"]` × 12; `["modelFromYourArmy","ROSTER"]` × 2; `["modelMemberOfPrimaryUnit","ROSTER"]` × 6; `["moreThanTwelveFromEveryFriendlyModelOnBattlefield","BATTLE"]` × 1; `["movementBeforeReinforcements","BATTLE"]` × 2; `["movementStep","BATTLE"]` × 2; `["nearFriendlyDeathGuardVehicle","BATTLE"]` × 1; `["normalAdvanceOrChargeMove","BATTLE"]` × 2; `["onBattlefield","BATTLE"]` × 1; `["oncePerBattleAvailable","BATTLE"]` × 2; `["oncePerBattlePerArmyAvailable","BATTLE"]` × 1; `["oncePerBattleRoundAvailable","BATTLE"]` × 1; `["opponentCommandBattleShockStep","BATTLE"]` × 1; `["opponentCommandPhase","BATTLE"]` × 1; `["opponentTurnEnd","BATTLE"]` × 1; `["optionalAbilityActivated","BATTLE"]` × 2; `["optionalPlagueSelected","BATTLE"]` × 1; `["originalAttacker","BATTLE"]` × 2; `["otherFriendlyUnit","ROSTER"]` × 2; `["ownCommandPhase","BATTLE"]` × 2; `["ownCommandPhaseEnd","BATTLE"]` × 1; `["ownShootingPhaseStarted","BATTLE"]` × 1; `["phase","BATTLE"]` × 98; `["phaseWindow","BATTLE"]` × 16; `["plagueSelectedInBattleFormations","BATTLE"]` × 1; `["primaryMakesNormalAdvanceOrChargeMove","BATTLE"]` × 2; `["primaryNotDestroyedAfterAttackerFought","BATTLE"]` × 2; `["rangedAttackTargetIsAfflictedEnemyUnit","BATTLE"]` × 2; `["rangedAttackTargetsBearerVisibleEnemy","BATTLE"]` × 1; `["rangedTargeting","BATTLE"]` × 1; `["rangedWeaponEquippedByPrimaryUnitModels","ROSTER"]` × 4; `["rollResultSixOrLess","BATTLE"]` × 1; `["sameActionStartedInTrigger","BATTLE"]` × 2; `["securedObjectiveStillControlled","BATTLE"]` × 1; `["selectedAsEnemyAttackTarget","BATTLE"]` × 5; `["selectedEnemyDeclaresCharge","BATTLE"]` × 2; `["selectedInDeclareBattleFormations","BATTLE"]` × 1; `["selectedShootingEvent","BATTLE"]` × 6; `["selectedToFallBack","BATTLE"]` × 4; `["selectedToFightThisPhase","BATTLE"]` × 2; `["selectedToMakeFallBackMove","BATTLE"]` × 2; `["selectedToMoveOrChargeThisPhase","BATTLE"]` × 2; `["selectedToShootOrFightThisPhase","BATTLE"]` × 2; `["selectedToShootThisPhase","BATTLE"]` × 5; `["selectsAnchoredEnemyAsRangedAttackTarget","BATTLE"]` × 2; `["shieldEligibleTargetForThatAttack","BATTLE"]` × 2; `["shieldVisibleToAttackingModel","BATTLE"]` × 2; `["sourceTableAllowsCurrentBattleRound","BATTLE"]` × 1; `["sourceTableSelectionCapSatisfied","BATTLE"]` × 1; `["sufferedMortalWoundsFromThisDeadlyDemise","BATTLE"]` × 2; `["targetingAfflictedEnemy","BATTLE"]` × 1; `["targetsSelectedJustNow","BATTLE"]` × 2; `["turnOwner","BATTLE"]` × 72; `["unitAdvanceRoll","BATTLE"]` × 1; `["unitBattleShockOrLeadershipTest","BATTLE"]` × 1; `["unitBeingSetUp","BATTLE"]` × 1; `["unitFinishedFighting","BATTLE"]` × 1; `["unitSelectedForVerminousHaze","BATTLE"]` × 1; `["unmodifiedHitRollFiveOrMore","BATTLE"]` × 1; `["usedThisStratagemThisBattle","BATTLE"]` × 1; `["usingDeepStrikeSetup","BATTLE"]` × 1; `["usingTaintedNarthecium","BATTLE"]` × 1; `["visibleEnemyAttackTarget","BATTLE"]` × 2; `["visibleEnemyUnit","BATTLE"]` × 2; `["visibleToAttackingUnit","BATTLE"]` × 2; `["visibleToOneOrMorePrimaryModels","BATTLE"]` × 2; `["visibleToPrimary","BATTLE"]` × 15; `["visibleToPrimaryModel","BATTLE"]` × 2; `["visibleToPrimaryUnit","BATTLE"]` × 2; `["whollyWithinTwelveOfBearer","BATTLE"]` × 1; `["within12OfPrimary","BATTLE"]` × 2; `["within24OfPrimary","BATTLE"]` × 2; `["within2HorizontalOfPrimary","BATTLE"]` × 2; `["within30OfPrimaryModel","BATTLE"]` × 2; `["within3OfPrimary","BATTLE"]` × 2; `["within3OfPrimaryModel","BATTLE"]` × 2; `["within3OfSelectedTerrain","BATTLE"]` × 2; `["within5VerticalOfPrimary","BATTLE"]` × 2; `["within6OfPrimary","BATTLE"]` × 2; `["within8OfPrimary","BATTLE"]` × 4; `["withinBearerContagionRange","BATTLE"]` × 1; `["withinBearerUnitContagionRange","BATTLE"]` × 1; `["withinContagionRangeOfPrimary","BATTLE"]` × 2; `["withinEnemyEngagementRange","BATTLE"]` × 1; `["withinEngagementRangeOfEnemyAttackRecipient","BATTLE"]` × 2; `["withinEngagementRangeOfPrimary","BATTLE"]` × 6; `["withinEngagementRangeOfTriggeringEnemy","BATTLE"]` × 2; `["withinRangeOfSelectedObjective","BATTLE"]` × 4; `["withinSecuredObjectiveRange","BATTLE"]` × 1; `["withinSevenOfFriendlyDeathGuard","BATTLE"]` × 1; `["withinSevenOfFriendlyPlagueLegions","BATTLE"]` × 1; `["withinSixOfBearer","BATTLE"]` × 1; `["withinThreeOfBearer","BATTLE"]` × 1; `["withinTwelveOfBearer","BATTLE"]` × 3.

Ключи без извлечённой literal-декларации: нет. Это **не** отсутствие schema: factories могут выводить объявления из FIELD-атомов или computed constant keys; точный исходный factory указан в `fieldDeclarationEvidence`/`lineage.producerRefs`. Числа употребления ключей вычислены из данных независимо от literal extraction.

### emperors-children

| Конструкция | Фактические значения × число |
|---|---|
| `contractSchema` | `rule-contract/v2` × 26 |
| `executionMode` | `DATASHEET_DECLARATION` × 4; `DECLARATIVE_APPLICABILITY` × 22 |
| `contractRole.subject` | `MODEL` × 37; `UNIT` × 19 |
| `contractRole.purpose` | `OWNER` × 26; `RECIPIENT` × 30 |
| `contractRole.binding` | `ABSENT` × 16; `INDEPENDENT_ENTITY` × 2; `ROSTER_UNITS` × 3; `SOURCE_FORMED_MODELS` × 3; `SOURCE_MODEL` × 18; `SOURCE_UNIT` × 11; `SOURCE_UNIT_MODELS` × 3 |
| `contractRole.sourceRoleId` | `ABSENT` × 56 |
| `clauseRole.subject` | `MODEL` × 48; `UNIT` × 30 |
| `clauseRole.purpose` | `ACTOR` × 3; `OWNER` × 38; `RECIPIENT` × 37 |
| `clauseRole.binding` | `ABSENT` × 21; `INDEPENDENT_ENTITY` × 3; `ROSTER_UNITS` × 5; `SOURCE_FORMED_MODELS` × 5; `SOURCE_MODEL` × 24; `SOURCE_UNIT` × 17; `SOURCE_UNIT_MODELS` × 3 |
| `clauseRole.sourceRoleId` | `ABSENT` × 78 |
| `effectRecipientRoleIds` | `ABSENT` × 38 |
| `rosterEffect.targetBinding` | `ROSTER_UNITS` × 2; `SOURCE_FORMED_MODELS` × 7; `SOURCE_MODEL` × 50; `SOURCE_UNIT` × 10; `SOURCE_UNIT_MODELS` × 3 |
| `rosterEffect.targetSubject` | `MODEL` × 60; `UNIT` × 12 |
| `rosterEffect.unitScope` | `ABSENT` × 63; `FORMED` × 9 |
| `rosterEffect.containingUnitScope` | `ABSENT` × 72 |
| `conditionalPolicy.kind` | `ABSENT` × 38 |
| `conditionalPolicy.recipientScope` | `ABSENT` × 38 |
| `predicates` | `ALWAYS` × 62; `FIELD` × 69; `LEADING` × 7; `MODEL_ID` × 58; `MODEL_KEYWORD` × 59; `UNIT_ID` × 16; `UNIT_KEYWORD` × 10; `{"arguments":{"equals":"detachment-carnival-of-excess:enhancement:3::choice::datasheet-chaos-land-raider:weapon:6","key":"selectedUpgrade:detachment-carnival-of-excess:enhancement:3"},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"EMPEROR’S CHILDREN model only. At the start of the battle, select one melee weapon equipped by the bearer; add 1 to the Attacks characteristic of that weapon. In addition, each time the bearer is selected to fight, it can use this Enhancement. If it does, while resolving those attacks, add 1 to the Damage characteristic of that weapon and that weapon has the [devastating wounds] and [hazardous] abilities."},"predicate":"FIELD","subject":"MODEL"}` × 1; `{"arguments":{"equals":"detachment-carnival-of-excess:enhancement:3::choice::datasheet-chaos-rhino:weapon:4","key":"selectedUpgrade:detachment-carnival-of-excess:enhancement:3"},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"EMPEROR’S CHILDREN model only. At the start of the battle, select one melee weapon equipped by the bearer; add 1 to the Attacks characteristic of that weapon. In addition, each time the bearer is selected to fight, it can use this Enhancement. If it does, while resolving those attacks, add 1 to the Damage characteristic of that weapon and that weapon has the [devastating wounds] and [hazardous] abilities."},"predicate":"FIELD","subject":"MODEL"}` × 1; `{"arguments":{"equals":"detachment-carnival-of-excess:enhancement:3::choice::datasheet-chaos-spawn:weapon:1","key":"selectedUpgrade:detachment-carnival-of-excess:enhancement:3"},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"EMPEROR’S CHILDREN model only. At the start of the battle, select one melee weapon equipped by the bearer; add 1 to the Attacks characteristic of that weapon. In addition, each time the bearer is selected to fight, it can use this Enhancement. If it does, while resolving those attacks, add 1 to the Damage characteristic of that weapon and that weapon has the [devastating wounds] and [hazardous] abilities."},"predicate":"FIELD","subject":"MODEL"}` × 1; `{"arguments":{"equals":"detachment-carnival-of-excess:enhancement:3::choice::datasheet-chaos-terminators:weapon:5","key":"selectedUpgrade:detachment-carnival-of-excess:enhancement:3"},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"EMPEROR’S CHILDREN model only. At the start of the battle, select one melee weapon equipped by the bearer; add 1 to the Attacks characteristic of that weapon. In addition, each time the bearer is selected to fight, it can use this Enhancement. If it does, while resolving those attacks, add 1 to the Damage characteristic of that weapon and that weapon has the [devastating wounds] and [hazardous] abilities."},"predicate":"FIELD","subject":"MODEL"}` × 1; `{"arguments":{"equals":"detachment-carnival-of-excess:enhancement:3::choice::datasheet-chaos-terminators:weapon:6","key":"selectedUpgrade:detachment-carnival-of-excess:enhancement:3"},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"EMPEROR’S CHILDREN model only. At the start of the battle, select one melee weapon equipped by the bearer; add 1 to the Attacks characteristic of that weapon. In addition, each time the bearer is selected to fight, it can use this Enhancement. If it does, while resolving those attacks, add 1 to the Damage characteristic of that weapon and that weapon has the [devastating wounds] and [hazardous] abilities."},"predicate":"FIELD","subject":"MODEL"}` × 1; `{"arguments":{"equals":"detachment-carnival-of-excess:enhancement:3::choice::datasheet-chaos-terminators:weapon:7","key":"selectedUpgrade:detachment-carnival-of-excess:enhancement:3"},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"EMPEROR’S CHILDREN model only. At the start of the battle, select one melee weapon equipped by the bearer; add 1 to the Attacks characteristic of that weapon. In addition, each time the bearer is selected to fight, it can use this Enhancement. If it does, while resolving those attacks, add 1 to the Damage characteristic of that weapon and that weapon has the [devastating wounds] and [hazardous] abilities."},"predicate":"FIELD","subject":"MODEL"}` × 1; `{"arguments":{"equals":"detachment-carnival-of-excess:enhancement:3::choice::datasheet-chaos-terminators:weapon:8","key":"selectedUpgrade:detachment-carnival-of-excess:enhancement:3"},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"EMPEROR’S CHILDREN model only. At the start of the battle, select one melee weapon equipped by the bearer; add 1 to the Attacks characteristic of that weapon. In addition, each time the bearer is selected to fight, it can use this Enhancement. If it does, while resolving those attacks, add 1 to the Damage characteristic of that weapon and that weapon has the [devastating wounds] and [hazardous] abilities."},"predicate":"FIELD","subject":"MODEL"}` × 1; `{"arguments":{"equals":"detachment-carnival-of-excess:enhancement:3::choice::datasheet-daemon-prince-of-slaanesh-with-wings:weapon:2","key":"selectedUpgrade:detachment-carnival-of-excess:enhancement:3"},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"EMPEROR’S CHILDREN model only. At the start of the battle, select one melee weapon equipped by the bearer; add 1 to the Attacks characteristic of that weapon. In addition, each time the bearer is selected to fight, it can use this Enhancement. If it does, while resolving those attacks, add 1 to the Damage characteristic of that weapon and that weapon has the [devastating wounds] and [hazardous] abilities."},"predicate":"FIELD","subject":"MODEL"}` × 1; `{"arguments":{"equals":"detachment-carnival-of-excess:enhancement:3::choice::datasheet-daemon-prince-of-slaanesh-with-wings:weapon:3","key":"selectedUpgrade:detachment-carnival-of-excess:enhancement:3"},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"EMPEROR’S CHILDREN model only. At the start of the battle, select one melee weapon equipped by the bearer; add 1 to the Attacks characteristic of that weapon. In addition, each time the bearer is selected to fight, it can use this Enhancement. If it does, while resolving those attacks, add 1 to the Damage characteristic of that weapon and that weapon has the [devastating wounds] and [hazardous] abilities."},"predicate":"FIELD","subject":"MODEL"}` × 1; `{"arguments":{"equals":"detachment-carnival-of-excess:enhancement:3::choice::datasheet-daemon-prince-of-slaanesh:weapon:2","key":"selectedUpgrade:detachment-carnival-of-excess:enhancement:3"},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"EMPEROR’S CHILDREN model only. At the start of the battle, select one melee weapon equipped by the bearer; add 1 to the Attacks characteristic of that weapon. In addition, each time the bearer is selected to fight, it can use this Enhancement. If it does, while resolving those attacks, add 1 to the Damage characteristic of that weapon and that weapon has the [devastating wounds] and [hazardous] abilities."},"predicate":"FIELD","subject":"MODEL"}` × 1; `{"arguments":{"equals":"detachment-carnival-of-excess:enhancement:3::choice::datasheet-daemon-prince-of-slaanesh:weapon:3","key":"selectedUpgrade:detachment-carnival-of-excess:enhancement:3"},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"EMPEROR’S CHILDREN model only. At the start of the battle, select one melee weapon equipped by the bearer; add 1 to the Attacks characteristic of that weapon. In addition, each time the bearer is selected to fight, it can use this Enhancement. If it does, while resolving those attacks, add 1 to the Damage characteristic of that weapon and that weapon has the [devastating wounds] and [hazardous] abilities."},"predicate":"FIELD","subject":"MODEL"}` × 1; `{"arguments":{"equals":"detachment-carnival-of-excess:enhancement:3::choice::datasheet-defiler:weapon:10","key":"selectedUpgrade:detachment-carnival-of-excess:enhancement:3"},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"EMPEROR’S CHILDREN model only. At the start of the battle, select one melee weapon equipped by the bearer; add 1 to the Attacks characteristic of that weapon. In addition, each time the bearer is selected to fight, it can use this Enhancement. If it does, while resolving those attacks, add 1 to the Damage characteristic of that weapon and that weapon has the [devastating wounds] and [hazardous] abilities."},"predicate":"FIELD","subject":"MODEL"}` × 1; `{"arguments":{"equals":"detachment-carnival-of-excess:enhancement:3::choice::datasheet-defiler:weapon:11","key":"selectedUpgrade:detachment-carnival-of-excess:enhancement:3"},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"EMPEROR’S CHILDREN model only. At the start of the battle, select one melee weapon equipped by the bearer; add 1 to the Attacks characteristic of that weapon. In addition, each time the bearer is selected to fight, it can use this Enhancement. If it does, while resolving those attacks, add 1 to the Damage characteristic of that weapon and that weapon has the [devastating wounds] and [hazardous] abilities."},"predicate":"FIELD","subject":"MODEL"}` × 1; `{"arguments":{"equals":"detachment-carnival-of-excess:enhancement:3::choice::datasheet-defiler:weapon:12","key":"selectedUpgrade:detachment-carnival-of-excess:enhancement:3"},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"EMPEROR’S CHILDREN model only. At the start of the battle, select one melee weapon equipped by the bearer; add 1 to the Attacks characteristic of that weapon. In addition, each time the bearer is selected to fight, it can use this Enhancement. If it does, while resolving those attacks, add 1 to the Damage characteristic of that weapon and that weapon has the [devastating wounds] and [hazardous] abilities."},"predicate":"FIELD","subject":"MODEL"}` × 1; `{"arguments":{"equals":"detachment-carnival-of-excess:enhancement:3::choice::datasheet-flawless-blades:weapon:2","key":"selectedUpgrade:detachment-carnival-of-excess:enhancement:3"},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"EMPEROR’S CHILDREN model only. At the start of the battle, select one melee weapon equipped by the bearer; add 1 to the Attacks characteristic of that weapon. In addition, each time the bearer is selected to fight, it can use this Enhancement. If it does, while resolving those attacks, add 1 to the Damage characteristic of that weapon and that weapon has the [devastating wounds] and [hazardous] abilities."},"predicate":"FIELD","subject":"MODEL"}` × 1; `{"arguments":{"equals":"detachment-carnival-of-excess:enhancement:3::choice::datasheet-fulgrim:weapon:2","key":"selectedUpgrade:detachment-carnival-of-excess:enhancement:3"},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"EMPEROR’S CHILDREN model only. At the start of the battle, select one melee weapon equipped by the bearer; add 1 to the Attacks characteristic of that weapon. In addition, each time the bearer is selected to fight, it can use this Enhancement. If it does, while resolving those attacks, add 1 to the Damage characteristic of that weapon and that weapon has the [devastating wounds] and [hazardous] abilities."},"predicate":"FIELD","subject":"MODEL"}` × 1; `{"arguments":{"equals":"detachment-carnival-of-excess:enhancement:3::choice::datasheet-fulgrim:weapon:3","key":"selectedUpgrade:detachment-carnival-of-excess:enhancement:3"},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"EMPEROR’S CHILDREN model only. At the start of the battle, select one melee weapon equipped by the bearer; add 1 to the Attacks characteristic of that weapon. In addition, each time the bearer is selected to fight, it can use this Enhancement. If it does, while resolving those attacks, add 1 to the Damage characteristic of that weapon and that weapon has the [devastating wounds] and [hazardous] abilities."},"predicate":"FIELD","subject":"MODEL"}` × 1; `{"arguments":{"equals":"detachment-carnival-of-excess:enhancement:3::choice::datasheet-fulgrim:weapon:4","key":"selectedUpgrade:detachment-carnival-of-excess:enhancement:3"},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"EMPEROR’S CHILDREN model only. At the start of the battle, select one melee weapon equipped by the bearer; add 1 to the Attacks characteristic of that weapon. In addition, each time the bearer is selected to fight, it can use this Enhancement. If it does, while resolving those attacks, add 1 to the Damage characteristic of that weapon and that weapon has the [devastating wounds] and [hazardous] abilities."},"predicate":"FIELD","subject":"MODEL"}` × 1; `{"arguments":{"equals":"detachment-carnival-of-excess:enhancement:3::choice::datasheet-heldrake:weapon:3","key":"selectedUpgrade:detachment-carnival-of-excess:enhancement:3"},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"EMPEROR’S CHILDREN model only. At the start of the battle, select one melee weapon equipped by the bearer; add 1 to the Attacks characteristic of that weapon. In addition, each time the bearer is selected to fight, it can use this Enhancement. If it does, while resolving those attacks, add 1 to the Damage characteristic of that weapon and that weapon has the [devastating wounds] and [hazardous] abilities."},"predicate":"FIELD","subject":"MODEL"}` × 1; `{"arguments":{"equals":"detachment-carnival-of-excess:enhancement:3::choice::datasheet-infractors:weapon:4","key":"selectedUpgrade:detachment-carnival-of-excess:enhancement:3"},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"EMPEROR’S CHILDREN model only. At the start of the battle, select one melee weapon equipped by the bearer; add 1 to the Attacks characteristic of that weapon. In addition, each time the bearer is selected to fight, it can use this Enhancement. If it does, while resolving those attacks, add 1 to the Damage characteristic of that weapon and that weapon has the [devastating wounds] and [hazardous] abilities."},"predicate":"FIELD","subject":"MODEL"}` × 1; `{"arguments":{"equals":"detachment-carnival-of-excess:enhancement:3::choice::datasheet-infractors:weapon:5","key":"selectedUpgrade:detachment-carnival-of-excess:enhancement:3"},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"EMPEROR’S CHILDREN model only. At the start of the battle, select one melee weapon equipped by the bearer; add 1 to the Attacks characteristic of that weapon. In addition, each time the bearer is selected to fight, it can use this Enhancement. If it does, while resolving those attacks, add 1 to the Damage characteristic of that weapon and that weapon has the [devastating wounds] and [hazardous] abilities."},"predicate":"FIELD","subject":"MODEL"}` × 1; `{"arguments":{"equals":"detachment-carnival-of-excess:enhancement:3::choice::datasheet-infractors:weapon:6","key":"selectedUpgrade:detachment-carnival-of-excess:enhancement:3"},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"EMPEROR’S CHILDREN model only. At the start of the battle, select one melee weapon equipped by the bearer; add 1 to the Attacks characteristic of that weapon. In addition, each time the bearer is selected to fight, it can use this Enhancement. If it does, while resolving those attacks, add 1 to the Damage characteristic of that weapon and that weapon has the [devastating wounds] and [hazardous] abilities."},"predicate":"FIELD","subject":"MODEL"}` × 1; `{"arguments":{"equals":"detachment-carnival-of-excess:enhancement:3::choice::datasheet-lord-exultant:weapon:5","key":"selectedUpgrade:detachment-carnival-of-excess:enhancement:3"},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"EMPEROR’S CHILDREN model only. At the start of the battle, select one melee weapon equipped by the bearer; add 1 to the Attacks characteristic of that weapon. In addition, each time the bearer is selected to fight, it can use this Enhancement. If it does, while resolving those attacks, add 1 to the Damage characteristic of that weapon and that weapon has the [devastating wounds] and [hazardous] abilities."},"predicate":"FIELD","subject":"MODEL"}` × 1; `{"arguments":{"equals":"detachment-carnival-of-excess:enhancement:3::choice::datasheet-lord-exultant:weapon:6","key":"selectedUpgrade:detachment-carnival-of-excess:enhancement:3"},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"EMPEROR’S CHILDREN model only. At the start of the battle, select one melee weapon equipped by the bearer; add 1 to the Attacks characteristic of that weapon. In addition, each time the bearer is selected to fight, it can use this Enhancement. If it does, while resolving those attacks, add 1 to the Damage characteristic of that weapon and that weapon has the [devastating wounds] and [hazardous] abilities."},"predicate":"FIELD","subject":"MODEL"}` × 1; `{"arguments":{"equals":"detachment-carnival-of-excess:enhancement:3::choice::datasheet-lord-exultant:weapon:7","key":"selectedUpgrade:detachment-carnival-of-excess:enhancement:3"},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"EMPEROR’S CHILDREN model only. At the start of the battle, select one melee weapon equipped by the bearer; add 1 to the Attacks characteristic of that weapon. In addition, each time the bearer is selected to fight, it can use this Enhancement. If it does, while resolving those attacks, add 1 to the Damage characteristic of that weapon and that weapon has the [devastating wounds] and [hazardous] abilities."},"predicate":"FIELD","subject":"MODEL"}` × 1; `{"arguments":{"equals":"detachment-carnival-of-excess:enhancement:3::choice::datasheet-lord-exultant:weapon:8","key":"selectedUpgrade:detachment-carnival-of-excess:enhancement:3"},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"EMPEROR’S CHILDREN model only. At the start of the battle, select one melee weapon equipped by the bearer; add 1 to the Attacks characteristic of that weapon. In addition, each time the bearer is selected to fight, it can use this Enhancement. If it does, while resolving those attacks, add 1 to the Damage characteristic of that weapon and that weapon has the [devastating wounds] and [hazardous] abilities."},"predicate":"FIELD","subject":"MODEL"}` × 1; `{"arguments":{"equals":"detachment-carnival-of-excess:enhancement:3::choice::datasheet-lord-exultant:weapon:9","key":"selectedUpgrade:detachment-carnival-of-excess:enhancement:3"},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"EMPEROR’S CHILDREN model only. At the start of the battle, select one melee weapon equipped by the bearer; add 1 to the Attacks characteristic of that weapon. In addition, each time the bearer is selected to fight, it can use this Enhancement. If it does, while resolving those attacks, add 1 to the Damage characteristic of that weapon and that weapon has the [devastating wounds] and [hazardous] abilities."},"predicate":"FIELD","subject":"MODEL"}` × 1; `{"arguments":{"equals":"detachment-carnival-of-excess:enhancement:3::choice::datasheet-lord-kakophonist:weapon:2","key":"selectedUpgrade:detachment-carnival-of-excess:enhancement:3"},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"EMPEROR’S CHILDREN model only. At the start of the battle, select one melee weapon equipped by the bearer; add 1 to the Attacks characteristic of that weapon. In addition, each time the bearer is selected to fight, it can use this Enhancement. If it does, while resolving those attacks, add 1 to the Damage characteristic of that weapon and that weapon has the [devastating wounds] and [hazardous] abilities."},"predicate":"FIELD","subject":"MODEL"}` × 1; `{"arguments":{"equals":"detachment-carnival-of-excess:enhancement:3::choice::datasheet-lord-kakophonist:weapon:3","key":"selectedUpgrade:detachment-carnival-of-excess:enhancement:3"},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"EMPEROR’S CHILDREN model only. At the start of the battle, select one melee weapon equipped by the bearer; add 1 to the Attacks characteristic of that weapon. In addition, each time the bearer is selected to fight, it can use this Enhancement. If it does, while resolving those attacks, add 1 to the Damage characteristic of that weapon and that weapon has the [devastating wounds] and [hazardous] abilities."},"predicate":"FIELD","subject":"MODEL"}` × 1; `{"arguments":{"equals":"detachment-carnival-of-excess:enhancement:3::choice::datasheet-lucius-the-eternal:weapon:1","key":"selectedUpgrade:detachment-carnival-of-excess:enhancement:3"},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"EMPEROR’S CHILDREN model only. At the start of the battle, select one melee weapon equipped by the bearer; add 1 to the Attacks characteristic of that weapon. In addition, each time the bearer is selected to fight, it can use this Enhancement. If it does, while resolving those attacks, add 1 to the Damage characteristic of that weapon and that weapon has the [devastating wounds] and [hazardous] abilities."},"predicate":"FIELD","subject":"MODEL"}` × 1; `{"arguments":{"equals":"detachment-carnival-of-excess:enhancement:3::choice::datasheet-lucius-the-eternal:weapon:2","key":"selectedUpgrade:detachment-carnival-of-excess:enhancement:3"},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"EMPEROR’S CHILDREN model only. At the start of the battle, select one melee weapon equipped by the bearer; add 1 to the Attacks characteristic of that weapon. In addition, each time the bearer is selected to fight, it can use this Enhancement. If it does, while resolving those attacks, add 1 to the Damage characteristic of that weapon and that weapon has the [devastating wounds] and [hazardous] abilities."},"predicate":"FIELD","subject":"MODEL"}` × 1; `{"arguments":{"equals":"detachment-carnival-of-excess:enhancement:3::choice::datasheet-maulerfiend:weapon:2","key":"selectedUpgrade:detachment-carnival-of-excess:enhancement:3"},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"EMPEROR’S CHILDREN model only. At the start of the battle, select one melee weapon equipped by the bearer; add 1 to the Attacks characteristic of that weapon. In addition, each time the bearer is selected to fight, it can use this Enhancement. If it does, while resolving those attacks, add 1 to the Damage characteristic of that weapon and that weapon has the [devastating wounds] and [hazardous] abilities."},"predicate":"FIELD","subject":"MODEL"}` × 1; `{"arguments":{"equals":"detachment-carnival-of-excess:enhancement:3::choice::datasheet-maulerfiend:weapon:3","key":"selectedUpgrade:detachment-carnival-of-excess:enhancement:3"},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"EMPEROR’S CHILDREN model only. At the start of the battle, select one melee weapon equipped by the bearer; add 1 to the Attacks characteristic of that weapon. In addition, each time the bearer is selected to fight, it can use this Enhancement. If it does, while resolving those attacks, add 1 to the Damage characteristic of that weapon and that weapon has the [devastating wounds] and [hazardous] abilities."},"predicate":"FIELD","subject":"MODEL"}` × 1; `{"arguments":{"equals":"detachment-carnival-of-excess:enhancement:3::choice::datasheet-noise-marines:weapon:5","key":"selectedUpgrade:detachment-carnival-of-excess:enhancement:3"},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"EMPEROR’S CHILDREN model only. At the start of the battle, select one melee weapon equipped by the bearer; add 1 to the Attacks characteristic of that weapon. In addition, each time the bearer is selected to fight, it can use this Enhancement. If it does, while resolving those attacks, add 1 to the Damage characteristic of that weapon and that weapon has the [devastating wounds] and [hazardous] abilities."},"predicate":"FIELD","subject":"MODEL"}` × 1; `{"arguments":{"equals":"detachment-carnival-of-excess:enhancement:3::choice::datasheet-noise-marines:weapon:6","key":"selectedUpgrade:detachment-carnival-of-excess:enhancement:3"},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"EMPEROR’S CHILDREN model only. At the start of the battle, select one melee weapon equipped by the bearer; add 1 to the Attacks characteristic of that weapon. In addition, each time the bearer is selected to fight, it can use this Enhancement. If it does, while resolving those attacks, add 1 to the Damage characteristic of that weapon and that weapon has the [devastating wounds] and [hazardous] abilities."},"predicate":"FIELD","subject":"MODEL"}` × 1; `{"arguments":{"equals":"detachment-carnival-of-excess:enhancement:3::choice::datasheet-sorcerer:weapon:4","key":"selectedUpgrade:detachment-carnival-of-excess:enhancement:3"},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"EMPEROR’S CHILDREN model only. At the start of the battle, select one melee weapon equipped by the bearer; add 1 to the Attacks characteristic of that weapon. In addition, each time the bearer is selected to fight, it can use this Enhancement. If it does, while resolving those attacks, add 1 to the Damage characteristic of that weapon and that weapon has the [devastating wounds] and [hazardous] abilities."},"predicate":"FIELD","subject":"MODEL"}` × 1; `{"arguments":{"equals":"detachment-carnival-of-excess:enhancement:3::choice::datasheet-tormentors:weapon:10","key":"selectedUpgrade:detachment-carnival-of-excess:enhancement:3"},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"EMPEROR’S CHILDREN model only. At the start of the battle, select one melee weapon equipped by the bearer; add 1 to the Attacks characteristic of that weapon. In addition, each time the bearer is selected to fight, it can use this Enhancement. If it does, while resolving those attacks, add 1 to the Damage characteristic of that weapon and that weapon has the [devastating wounds] and [hazardous] abilities."},"predicate":"FIELD","subject":"MODEL"}` × 1; `{"arguments":{"equals":"detachment-carnival-of-excess:enhancement:3::choice::datasheet-tormentors:weapon:8","key":"selectedUpgrade:detachment-carnival-of-excess:enhancement:3"},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"EMPEROR’S CHILDREN model only. At the start of the battle, select one melee weapon equipped by the bearer; add 1 to the Attacks characteristic of that weapon. In addition, each time the bearer is selected to fight, it can use this Enhancement. If it does, while resolving those attacks, add 1 to the Damage characteristic of that weapon and that weapon has the [devastating wounds] and [hazardous] abilities."},"predicate":"FIELD","subject":"MODEL"}` × 1; `{"arguments":{"equals":"detachment-carnival-of-excess:enhancement:3::choice::datasheet-tormentors:weapon:9","key":"selectedUpgrade:detachment-carnival-of-excess:enhancement:3"},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"EMPEROR’S CHILDREN model only. At the start of the battle, select one melee weapon equipped by the bearer; add 1 to the Attacks characteristic of that weapon. In addition, each time the bearer is selected to fight, it can use this Enhancement. If it does, while resolving those attacks, add 1 to the Damage characteristic of that weapon and that weapon has the [devastating wounds] and [hazardous] abilities."},"predicate":"FIELD","subject":"MODEL"}` × 1; `{"arguments":{"equals":false,"key":"attached"},"contextLevel":"ROSTER","evidence":{"field":["blocks",1,"text"],"quote":"Daemonic Icon: Models in the bearer’s unit have a Leadership characteristic of 6+."},"predicate":"FIELD","subject":"UNIT"}` × 2; `{"arguments":{"equals":false,"key":"attached"},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"FLAWLESS BLADES unit only. This unit has +2\" M."},"predicate":"FIELD","subject":"UNIT"}` × 1; `{"arguments":{"equals":true,"key":"attached"},"contextLevel":"ROSTER","evidence":{"field":["blocks",1,"text"],"quote":"Daemonic Icon: Models in the bearer’s unit have a Leadership characteristic of 6+."},"predicate":"FIELD","subject":"UNIT"}` × 2; `{"arguments":{"equals":true,"key":"attached"},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"FLAWLESS BLADES unit only. This unit has +2\" M."},"predicate":"FIELD","subject":"UNIT"}` × 1; `{"arguments":{"equals":true,"key":"equipmentRequirementSatisfied"},"contextLevel":"ROSTER","evidence":{"field":["blocks",2,"text"],"quote":"Shining Aegis: The bearer has a Save characteristic of 3+."},"predicate":"FIELD","subject":"MODEL"}` × 1; `{"arguments":{"equals":true,"key":"equipmentRequirementSatisfied"},"contextLevel":"ROSTER","evidence":{"field":["text"],"otherEntityId":"datasheet-daemonettes:wargear:1","quote":"1 Daemonette that is not equipped with a daemonic icon can be equipped with 1 instrument of Chaos."},"predicate":"FIELD","subject":"UNIT"}` × 1; `{"arguments":{"equals":true,"key":"equipmentRequirementSatisfied"},"contextLevel":"ROSTER","evidence":{"field":["text"],"otherEntityId":"datasheet-daemonettes:wargear:2","quote":"1 Daemonette that is not equipped with an instrument of Chaos can be equipped with 1 daemonic icon."},"predicate":"FIELD","subject":"UNIT"}` × 2; `{"arguments":{"equals":true,"key":"equipmentRequirementSatisfied"},"contextLevel":"ROSTER","evidence":{"field":["text"],"otherEntityId":"datasheet-seekers:wargear:1","quote":"1 Seeker that is not equipped with a daemonic icon can be equipped with 1 instrument of Chaos."},"predicate":"FIELD","subject":"UNIT"}` × 1; `{"arguments":{"equals":true,"key":"equipmentRequirementSatisfied"},"contextLevel":"ROSTER","evidence":{"field":["text"],"otherEntityId":"datasheet-seekers:wargear:2","quote":"1 Seeker that is not equipped with an instrument of Chaos can be equipped with 1 daemonic icon."},"predicate":"FIELD","subject":"UNIT"}` × 2; `{"arguments":{"equals":true,"key":"lordOfHostDeclaredBattleline"},"contextLevel":"ROSTER","evidence":{"field":["blocks",0,"text"],"quote":"If this model is attached to an EMPEROR’S CHILDREN BATTLELINE unit during the Declare Battle Formations step, this model has the Infiltrators and Scouts 6\" abilities."},"predicate":"FIELD","subject":"MODEL"}` × 2; `{"arguments":{"id":"datasheet-chaos-land-raider:profile:1"},"contextLevel":"STATIC","evidence":{"field":["text"],"quote":"EMPEROR’S CHILDREN model only. At the start of the battle, select one melee weapon equipped by the bearer; add 1 to the Attacks characteristic of that weapon. In addition, each time the bearer is selected to fight, it can use this Enhancement. If it does, while resolving those attacks, add 1 to the Damage characteristic of that weapon and that weapon has the [devastating wounds] and [hazardous] abilities."},"predicate":"MODEL_ID","subject":"MODEL"}` × 1; `{"arguments":{"id":"datasheet-chaos-rhino:profile:1"},"contextLevel":"STATIC","evidence":{"field":["text"],"quote":"EMPEROR’S CHILDREN model only. At the start of the battle, select one melee weapon equipped by the bearer; add 1 to the Attacks characteristic of that weapon. In addition, each time the bearer is selected to fight, it can use this Enhancement. If it does, while resolving those attacks, add 1 to the Damage characteristic of that weapon and that weapon has the [devastating wounds] and [hazardous] abilities."},"predicate":"MODEL_ID","subject":"MODEL"}` × 1; `{"arguments":{"id":"datasheet-chaos-spawn:profile:1"},"contextLevel":"STATIC","evidence":{"field":["text"],"quote":"EMPEROR’S CHILDREN model only. At the start of the battle, select one melee weapon equipped by the bearer; add 1 to the Attacks characteristic of that weapon. In addition, each time the bearer is selected to fight, it can use this Enhancement. If it does, while resolving those attacks, add 1 to the Damage characteristic of that weapon and that weapon has the [devastating wounds] and [hazardous] abilities."},"predicate":"MODEL_ID","subject":"MODEL"}` × 1; `{"arguments":{"id":"datasheet-chaos-terminators:profile:1"},"contextLevel":"STATIC","evidence":{"field":["text"],"quote":"EMPEROR’S CHILDREN model only. At the start of the battle, select one melee weapon equipped by the bearer; add 1 to the Attacks characteristic of that weapon. In addition, each time the bearer is selected to fight, it can use this Enhancement. If it does, while resolving those attacks, add 1 to the Damage characteristic of that weapon and that weapon has the [devastating wounds] and [hazardous] abilities."},"predicate":"MODEL_ID","subject":"MODEL"}` × 4; `{"arguments":{"id":"datasheet-daemon-prince-of-slaanesh-with-wings:profile:1"},"contextLevel":"STATIC","evidence":{"field":["text"],"quote":"EMPEROR’S CHILDREN model only. At the start of the battle, select one melee weapon equipped by the bearer; add 1 to the Attacks characteristic of that weapon. In addition, each time the bearer is selected to fight, it can use this Enhancement. If it does, while resolving those attacks, add 1 to the Damage characteristic of that weapon and that weapon has the [devastating wounds] and [hazardous] abilities."},"predicate":"MODEL_ID","subject":"MODEL"}` × 2; `{"arguments":{"id":"datasheet-daemon-prince-of-slaanesh:profile:1"},"contextLevel":"STATIC","evidence":{"field":["text"],"quote":"EMPEROR’S CHILDREN model only. At the start of the battle, select one melee weapon equipped by the bearer; add 1 to the Attacks characteristic of that weapon. In addition, each time the bearer is selected to fight, it can use this Enhancement. If it does, while resolving those attacks, add 1 to the Damage characteristic of that weapon and that weapon has the [devastating wounds] and [hazardous] abilities."},"predicate":"MODEL_ID","subject":"MODEL"}` × 2; `{"arguments":{"id":"datasheet-defiler:profile:1"},"contextLevel":"STATIC","evidence":{"field":["text"],"quote":"EMPEROR’S CHILDREN model only. At the start of the battle, select one melee weapon equipped by the bearer; add 1 to the Attacks characteristic of that weapon. In addition, each time the bearer is selected to fight, it can use this Enhancement. If it does, while resolving those attacks, add 1 to the Damage characteristic of that weapon and that weapon has the [devastating wounds] and [hazardous] abilities."},"predicate":"MODEL_ID","subject":"MODEL"}` × 3; `{"arguments":{"id":"datasheet-flawless-blades:profile:1"},"contextLevel":"STATIC","evidence":{"field":["text"],"quote":"EMPEROR’S CHILDREN model only. At the start of the battle, select one melee weapon equipped by the bearer; add 1 to the Attacks characteristic of that weapon. In addition, each time the bearer is selected to fight, it can use this Enhancement. If it does, while resolving those attacks, add 1 to the Damage characteristic of that weapon and that weapon has the [devastating wounds] and [hazardous] abilities."},"predicate":"MODEL_ID","subject":"MODEL"}` × 1; `{"arguments":{"id":"datasheet-fulgrim:profile:1"},"contextLevel":"STATIC","evidence":{"field":["text"],"quote":"EMPEROR’S CHILDREN model only. At the start of the battle, select one melee weapon equipped by the bearer; add 1 to the Attacks characteristic of that weapon. In addition, each time the bearer is selected to fight, it can use this Enhancement. If it does, while resolving those attacks, add 1 to the Damage characteristic of that weapon and that weapon has the [devastating wounds] and [hazardous] abilities."},"predicate":"MODEL_ID","subject":"MODEL"}` × 3; `{"arguments":{"id":"datasheet-heldrake:profile:1"},"contextLevel":"STATIC","evidence":{"field":["text"],"quote":"EMPEROR’S CHILDREN model only. At the start of the battle, select one melee weapon equipped by the bearer; add 1 to the Attacks characteristic of that weapon. In addition, each time the bearer is selected to fight, it can use this Enhancement. If it does, while resolving those attacks, add 1 to the Damage characteristic of that weapon and that weapon has the [devastating wounds] and [hazardous] abilities."},"predicate":"MODEL_ID","subject":"MODEL"}` × 1; `{"arguments":{"id":"datasheet-infractors:profile:1"},"contextLevel":"STATIC","evidence":{"field":["text"],"quote":"EMPEROR’S CHILDREN model only. At the start of the battle, select one melee weapon equipped by the bearer; add 1 to the Attacks characteristic of that weapon. In addition, each time the bearer is selected to fight, it can use this Enhancement. If it does, while resolving those attacks, add 1 to the Damage characteristic of that weapon and that weapon has the [devastating wounds] and [hazardous] abilities."},"predicate":"MODEL_ID","subject":"MODEL"}` × 3; `{"arguments":{"id":"datasheet-keeper-of-secrets:profile:1"},"contextLevel":"STATIC","evidence":{"field":["blocks",2,"text"],"quote":"Shining Aegis: The bearer has a Save characteristic of 3+."},"predicate":"MODEL_ID","subject":"MODEL"}` × 1; `{"arguments":{"id":"datasheet-lord-exultant:profile:1"},"contextLevel":"STATIC","evidence":{"field":["text"],"quote":"EMPEROR’S CHILDREN model only. At the start of the battle, select one melee weapon equipped by the bearer; add 1 to the Attacks characteristic of that weapon. In addition, each time the bearer is selected to fight, it can use this Enhancement. If it does, while resolving those attacks, add 1 to the Damage characteristic of that weapon and that weapon has the [devastating wounds] and [hazardous] abilities."},"predicate":"MODEL_ID","subject":"MODEL"}` × 5; `{"arguments":{"id":"datasheet-lord-kakophonist:profile:1"},"contextLevel":"STATIC","evidence":{"field":["text"],"quote":"EMPEROR’S CHILDREN model only. At the start of the battle, select one melee weapon equipped by the bearer; add 1 to the Attacks characteristic of that weapon. In addition, each time the bearer is selected to fight, it can use this Enhancement. If it does, while resolving those attacks, add 1 to the Damage characteristic of that weapon and that weapon has the [devastating wounds] and [hazardous] abilities."},"predicate":"MODEL_ID","subject":"MODEL"}` × 2; `{"arguments":{"id":"datasheet-lucius-the-eternal:profile:1"},"contextLevel":"STATIC","evidence":{"field":["text"],"quote":"EMPEROR’S CHILDREN model only. At the start of the battle, select one melee weapon equipped by the bearer; add 1 to the Attacks characteristic of that weapon. In addition, each time the bearer is selected to fight, it can use this Enhancement. If it does, while resolving those attacks, add 1 to the Damage characteristic of that weapon and that weapon has the [devastating wounds] and [hazardous] abilities."},"predicate":"MODEL_ID","subject":"MODEL"}` × 2; `{"arguments":{"id":"datasheet-maulerfiend:profile:1"},"contextLevel":"STATIC","evidence":{"field":["text"],"quote":"EMPEROR’S CHILDREN model only. At the start of the battle, select one melee weapon equipped by the bearer; add 1 to the Attacks characteristic of that weapon. In addition, each time the bearer is selected to fight, it can use this Enhancement. If it does, while resolving those attacks, add 1 to the Damage characteristic of that weapon and that weapon has the [devastating wounds] and [hazardous] abilities."},"predicate":"MODEL_ID","subject":"MODEL"}` × 2; `{"arguments":{"id":"datasheet-noise-marines:profile:1"},"contextLevel":"STATIC","evidence":{"field":["text"],"quote":"EMPEROR’S CHILDREN model only. At the start of the battle, select one melee weapon equipped by the bearer; add 1 to the Attacks characteristic of that weapon. In addition, each time the bearer is selected to fight, it can use this Enhancement. If it does, while resolving those attacks, add 1 to the Damage characteristic of that weapon and that weapon has the [devastating wounds] and [hazardous] abilities."},"predicate":"MODEL_ID","subject":"MODEL"}` × 2; `{"arguments":{"id":"datasheet-sorcerer:profile:1"},"contextLevel":"STATIC","evidence":{"field":["text"],"quote":"EMPEROR’S CHILDREN model only. At the start of the battle, select one melee weapon equipped by the bearer; add 1 to the Attacks characteristic of that weapon. In addition, each time the bearer is selected to fight, it can use this Enhancement. If it does, while resolving those attacks, add 1 to the Damage characteristic of that weapon and that weapon has the [devastating wounds] and [hazardous] abilities."},"predicate":"MODEL_ID","subject":"MODEL"}` × 1; `{"arguments":{"id":"datasheet-tormentors:profile:1"},"contextLevel":"STATIC","evidence":{"field":["text"],"quote":"EMPEROR’S CHILDREN model only. At the start of the battle, select one melee weapon equipped by the bearer; add 1 to the Attacks characteristic of that weapon. In addition, each time the bearer is selected to fight, it can use this Enhancement. If it does, while resolving those attacks, add 1 to the Damage characteristic of that weapon and that weapon has the [devastating wounds] and [hazardous] abilities."},"predicate":"MODEL_ID","subject":"MODEL"}` × 3; `{"arguments":{"keyword":"EMPEROR’S CHILDREN"},"contextLevel":"STATIC","evidence":{"field":["text"],"quote":"You can re-roll Advance rolls made for EMPEROR’S CHILDREN units from your army."},"predicate":"UNIT_KEYWORD","subject":"UNIT"}` × 1; `{"arguments":{"keyword":"FLAWLESS BLADES"},"contextLevel":"STATIC","evidence":{"field":["text"],"quote":"Friendly FLAWLESS BLADES units have Fights First"},"predicate":"UNIT_KEYWORD","subject":"UNIT"}` × 1; `{"arguments":{"value":true},"contextLevel":"ROSTER","evidence":{"field":["blocks",0,"text"],"quote":"leading a unit"},"predicate":"LEADING","subject":"MODEL"}` × 2; `{"arguments":{"value":true},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"leading a unit"},"predicate":"LEADING","subject":"MODEL"}` × 2 |
| `predicateContext` | `ABSENT` × 100; `BATTLE` × 8; `ROSTER` × 68; `STATIC` × 205 |
| `rosterClassification` | `BATTLE_ONLY` × 8; `NOT_AN_EFFECT` × 2; `ROSTER_EXECUTABLE` × 28 |

Связи ролей (`actorRoleId`, `prerequisites`, `distinctFromRoleIds`, required/optional) со всеми значениями и частотами: `books[5].dictionary` в JSON. Отсутствующий purpose не доказывает получателя.

**FIELD key / уровень × число:** `["attached","ROSTER"]` × 6; `["equipmentRequirementSatisfied","ROSTER"]` × 12; `["heroicInterventionSelected","BATTLE"]` × 2; `["lordOfHostDeclaredBattleline","ROSTER"]` × 4; `["meleeAttack","BATTLE"]` × 1; `["meleeAttackTargetsCharacter","BATTLE"]` × 1; `["normalAdvanceFallBackMove","BATTLE"]` × 1; `["possessedBladeFightUse","BATTLE"]` × 1; `["selectedUpgrade:detachment-carnival-of-excess:enhancement:3","ROSTER"]` × 39; `["snapShootingAttack","BATTLE"]` × 1; `["unitAdvanceRoll","BATTLE"]` × 1.

Ключи без извлечённой literal-декларации: нет. Это **не** отсутствие schema: factories могут выводить объявления из FIELD-атомов или computed constant keys; точный исходный factory указан в `fieldDeclarationEvidence`/`lineage.producerRefs`. Числа употребления ключей вычислены из данных независимо от literal extraction.

### space-marines

| Конструкция | Фактические значения × число |
|---|---|
| `contractSchema` | `rule-contract/v2` × 390 |
| `executionMode` | `BATTLE_ACTION` × 84; `DECLARATIVE_APPLICABILITY` × 306 |
| `contractRole.subject` | `MODEL` × 45; `UNIT` × 345 |
| `contractRole.purpose` | `OWNER` × 390 |
| `contractRole.binding` | `ABSENT` × 390 |
| `contractRole.sourceRoleId` | `ABSENT` × 390 |
| `clauseRole.subject` | `MODEL` × 115; `UNIT` × 848 |
| `clauseRole.purpose` | `OWNER` × 963 |
| `clauseRole.binding` | `ABSENT` × 963 |
| `clauseRole.sourceRoleId` | `ABSENT` × 963 |
| `effectRecipientRoleIds` | `ABSENT` × 963 |
| `rosterEffect.targetBinding` | `ROSTER_MODELS` × 1; `ROSTER_UNITS` × 3; `SOURCE_FORMED_MODELS` × 5; `SOURCE_MODEL` × 33; `SOURCE_UNIT` × 32; `SOURCE_UNIT_MODELS` × 5 |
| `rosterEffect.targetSubject` | `MODEL` × 44; `UNIT` × 35 |
| `rosterEffect.unitScope` | `ABSENT` × 66; `FORMED` × 13 |
| `rosterEffect.containingUnitScope` | `ABSENT` × 78; `FORMED` × 1 |
| `conditionalPolicy.kind` | `ABSENT` × 963 |
| `conditionalPolicy.recipientScope` | `ABSENT` × 963 |
| `predicates` | `ALWAYS` × 1157; `FIELD` × 30; `MODEL_ID` × 13; `MODEL_KEYWORD` × 222; `UNIT_KEYWORD` × 118; `{"args":[{"arguments":{"keyword":"ADEPTUS ASTARTES"},"contextLevel":"STATIC","evidence":{"field":["text"],"quote":"Friendly ADEPTUS ASTARTES TERMINATOR units have +1 to charge rolls."},"predicate":"UNIT_KEYWORD","subject":"UNIT"},{"arguments":{"keyword":"TERMINATOR"},"contextLevel":"STATIC","evidence":{"field":["text"],"quote":"Friendly ADEPTUS ASTARTES TERMINATOR units have +1 to charge rolls."},"predicate":"UNIT_KEYWORD","subject":"UNIT"}],"op":"ALL"}` × 1; `{"args":[{"arguments":{"keyword":"PHOBOS"},"contextLevel":"STATIC","evidence":{"field":["text"],"quote":"Friendly PHOBOS/SCOUT SQUAD units have -3\" detection range."},"predicate":"UNIT_KEYWORD","subject":"UNIT"},{"arguments":{"keyword":"SCOUT SQUAD"},"contextLevel":"STATIC","evidence":{"field":["text"],"quote":"Friendly PHOBOS/SCOUT SQUAD units have -3\" detection range."},"predicate":"UNIT_KEYWORD","subject":"UNIT"}],"op":"ANY"}` × 1; `{"arguments":{"equals":false,"key":"attached"},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"Has 5+ InSv."},"predicate":"FIELD","subject":"UNIT"}` × 1; `{"arguments":{"equals":false,"key":"attached"},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"Honour of the Company: This unit has +1 OC."},"predicate":"FIELD","subject":"UNIT"}` × 1; `{"arguments":{"equals":false,"key":"attached"},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"Shield Dome: This unit has 5+ InSv."},"predicate":"FIELD","subject":"UNIT"}` × 1; `{"arguments":{"equals":false,"key":"attached"},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"Skilled Riders: This unit has MOBILE."},"predicate":"FIELD","subject":"UNIT"}` × 1; `{"arguments":{"equals":false,"key":"attached"},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"This unit has +1 OC."},"predicate":"FIELD","subject":"UNIT"}` × 1; `{"arguments":{"equals":true,"key":"attached"},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"Has 5+ InSv."},"predicate":"FIELD","subject":"UNIT"}` × 1; `{"arguments":{"equals":true,"key":"attached"},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"Honour of the Company: This unit has +1 OC."},"predicate":"FIELD","subject":"UNIT"}` × 1; `{"arguments":{"equals":true,"key":"attached"},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"Shield Dome: This unit has 5+ InSv."},"predicate":"FIELD","subject":"UNIT"}` × 1; `{"arguments":{"equals":true,"key":"attached"},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"Skilled Riders: This unit has MOBILE."},"predicate":"FIELD","subject":"UNIT"}` × 1; `{"arguments":{"equals":true,"key":"attached"},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"This unit has +1 OC."},"predicate":"FIELD","subject":"UNIT"}` × 1; `{"arguments":{"equals":true,"key":"equipmentRequirementSatisfied"},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"Combat Shield: This model has 5+ InSv."},"predicate":"FIELD","subject":"UNIT"}` × 1; `{"arguments":{"equals":true,"key":"equipmentRequirementSatisfied"},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"Grav-chutes: This unit has Deep Strike."},"predicate":"FIELD","subject":"UNIT"}` × 1; `{"arguments":{"equals":true,"key":"equipmentRequirementSatisfied"},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"Orbital Comms Array: This unit has Scouts 6\"."},"predicate":"FIELD","subject":"UNIT"}` × 1; `{"arguments":{"equals":true,"key":"equipmentRequirementSatisfied"},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"Relic Shield: This model has +1 W."},"predicate":"FIELD","subject":"UNIT"}` × 3; `{"arguments":{"equals":true,"key":"equipmentRequirementSatisfied"},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"Shield Dome: This unit has 5+ InSv."},"predicate":"FIELD","subject":"UNIT"}` × 2; `{"arguments":{"equals":true,"key":"equipmentRequirementSatisfied"},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"Storm Shield: This model has +1 W."},"predicate":"FIELD","subject":"UNIT"}` × 1; `{"arguments":{"equals":true,"key":"equipmentRequirementSatisfied"},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"Storm Shield: This model has a 4+ InSv."},"predicate":"FIELD","subject":"UNIT"}` × 1; `{"arguments":{"equals":true,"key":"smEquipmentBearerSatisfied"},"contextLevel":"ROSTER","evidence":{"field":["text"],"otherEntityId":"ability-sm-097567b13c02404d","quote":"Storm Shield: This model has a 4+ InSv."},"predicate":"FIELD","subject":"MODEL"}` × 1; `{"arguments":{"equals":true,"key":"smEquipmentBearerSatisfied"},"contextLevel":"ROSTER","evidence":{"field":["text"],"otherEntityId":"ability-sm-431f22d15f7545b4","quote":"Relic Shield: This model has +1 W."},"predicate":"FIELD","subject":"MODEL"}` × 1; `{"arguments":{"equals":true,"key":"smEquipmentBearerSatisfied"},"contextLevel":"ROSTER","evidence":{"field":["text"],"otherEntityId":"ability-sm-63d4ca967fa64b79","quote":"Combat Shield: This model has 5+ InSv."},"predicate":"FIELD","subject":"MODEL"}` × 1; `{"arguments":{"equals":true,"key":"smEquipmentBearerSatisfied"},"contextLevel":"ROSTER","evidence":{"field":["text"],"otherEntityId":"ability-sm-8c9e7e37a8494c1d","quote":"Relic Shield: This model has +1 W."},"predicate":"FIELD","subject":"MODEL"}` × 1; `{"arguments":{"equals":true,"key":"smEquipmentBearerSatisfied"},"contextLevel":"ROSTER","evidence":{"field":["text"],"otherEntityId":"ability-sm-aa81f0067a3140de","quote":"Storm Shield: This model has +1 W."},"predicate":"FIELD","subject":"MODEL"}` × 1; `{"arguments":{"equals":true,"key":"smEquipmentBearerSatisfied"},"contextLevel":"ROSTER","evidence":{"field":["text"],"otherEntityId":"ability-sm-daf87042d20348dd","quote":"Relic Shield: This model has +1 W."},"predicate":"FIELD","subject":"MODEL"}` × 1; `{"arguments":{"equals":true,"key":"smPermanentAssaultSource"},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"If the assault doctrine is active for this unit, +2 S and AP."},"predicate":"FIELD","subject":"UNIT"}` × 4; `{"arguments":{"keyword":"ADEPTUS ASTARTES"},"contextLevel":"STATIC","evidence":{"field":["text"],"quote":"Friendly ADEPTUS ASTARTES units have Stealth."},"predicate":"UNIT_KEYWORD","subject":"UNIT"}` × 1 |
| `predicateContext` | `ABSENT` × 33; `ROSTER` × 30; `STATIC` × 1510 |
| `rosterClassification` | `DISPLAY_ONLY` × 905; `ROSTER_EXECUTABLE` × 58 |

Связи ролей (`actorRoleId`, `prerequisites`, `distinctFromRoleIds`, required/optional) со всеми значениями и частотами: `books[6].dictionary` в JSON. Отсутствующий purpose не доказывает получателя.

**FIELD key / уровень × число:** `["attached","ROSTER"]` × 10; `["equipmentRequirementSatisfied","ROSTER"]` × 10; `["smEquipmentBearerSatisfied","ROSTER"]` × 6; `["smPermanentAssaultSource","ROSTER"]` × 4.

Ключи без извлечённой literal-декларации: нет. Это **не** отсутствие schema: factories могут выводить объявления из FIELD-атомов или computed constant keys; точный исходный factory указан в `fieldDeclarationEvidence`/`lineage.producerRefs`. Числа употребления ключей вычислены из данных независимо от literal extraction.

### tau-empire

| Конструкция | Фактические значения × число |
|---|---|
| `contractSchema` | `rule-contract/v2` × 153 |
| `executionMode` | `BATTLE_ACTION` × 31; `DECLARATIVE_APPLICABILITY` × 122 |
| `contractRole.subject` | `MODEL` × 21; `UNIT` × 132 |
| `contractRole.purpose` | `OWNER` × 153 |
| `contractRole.binding` | `ABSENT` × 153 |
| `contractRole.sourceRoleId` | `ABSENT` × 153 |
| `clauseRole.subject` | `MODEL` × 31; `UNIT` × 277 |
| `clauseRole.purpose` | `OWNER` × 308 |
| `clauseRole.binding` | `ABSENT` × 308 |
| `clauseRole.sourceRoleId` | `ABSENT` × 308 |
| `effectRecipientRoleIds` | `ABSENT` × 308 |
| `rosterEffect.targetBinding` | `ROSTER_UNITS` × 2; `SOURCE_FORMED_MODELS` × 6; `SOURCE_MODEL` × 10; `SOURCE_UNIT` × 20 |
| `rosterEffect.targetSubject` | `MODEL` × 16; `UNIT` × 22 |
| `rosterEffect.unitScope` | `ABSENT` × 23; `FORMED` × 2; `PHYSICAL` × 13 |
| `rosterEffect.containingUnitScope` | `ABSENT` × 38 |
| `conditionalPolicy.kind` | `ABSENT` × 308 |
| `conditionalPolicy.recipientScope` | `ABSENT` × 308 |
| `predicates` | `ALWAYS` × 405; `FIELD` × 247; `LEADING` × 9; `MODEL_ID` × 9; `MODEL_KEYWORD` × 116; `UNIT_ID` × 13; `UNIT_KEYWORD` × 2; `{"args":[{"arguments":{"keyword":"BATTLESUIT"},"contextLevel":"STATIC","evidence":{"field":["text"],"quote":"Friendly BATTLESUIT CHARACTER units’ ranged attacks have +6\" R."},"predicate":"UNIT_KEYWORD","subject":"UNIT"},{"arguments":{"keyword":"CHARACTER"},"contextLevel":"STATIC","evidence":{"field":["text"],"quote":"Friendly BATTLESUIT CHARACTER units’ ranged attacks have +6\" R."},"predicate":"UNIT_KEYWORD","subject":"UNIT"}],"op":"ALL"}` × 1; `{"arguments":{"equals":true,"key":"equipmentRequirementSatisfied"},"contextLevel":"ROSTER","evidence":{"field":["blocks",1,"text"],"quote":"Pech’ra: Ranged weapons equipped by the bearer’s unit have the [IGNORES COVER] ability."},"predicate":"FIELD","subject":"UNIT"}` × 1; `{"arguments":{"equals":true,"key":"equipmentRequirementSatisfied"},"contextLevel":"ROSTER","evidence":{"field":["blocks",1,"text"],"quote":"Transport Bay: The bearer has the TRANSPORT keyword and has a transport capacity of 12 TACTICAL DRONES models."},"predicate":"FIELD","subject":"UNIT"}` × 1; `{"arguments":{"equals":true,"key":"equipmentRequirementSatisfied"},"contextLevel":"ROSTER","evidence":{"field":["blocks",1,"text"],"quote":"it loses the SMOKE keyword."},"predicate":"FIELD","subject":"UNIT"}` × 1; `{"arguments":{"equals":true,"key":"equipmentRequirementSatisfied"},"contextLevel":"ROSTER","evidence":{"field":["blocks",2,"text"],"quote":"Hover Drone: The bearer can FLY and has a Move characteristic of 10\"."},"predicate":"FIELD","subject":"UNIT"}` × 2; `{"arguments":{"equals":true,"key":"equipmentRequirementSatisfied"},"contextLevel":"ROSTER","evidence":{"field":["blocks",2,"text"],"quote":"Pulse Accelerator Drone: Add 6\" to the Range characteristic of pulse carbines equipped by models in the bearer’s unit."},"predicate":"FIELD","subject":"UNIT"}` × 1; `{"arguments":{"equals":true,"key":"equipmentRequirementSatisfied"},"contextLevel":"ROSTER","evidence":{"field":["blocks",2,"text"],"quote":"Shield Generator: The bearer has a 4+ invulnerable save."},"predicate":"FIELD","subject":"UNIT"}` × 2; `{"arguments":{"equals":true,"key":"equipmentRequirementSatisfied"},"contextLevel":"ROSTER","evidence":{"field":["blocks",2,"text"],"quote":"Tidewall Defence Platform: If equipped with a Tidewall defence platform, this FORTIFICATION has a Wounds characteristic of 15."},"predicate":"FIELD","subject":"UNIT"}` × 1; `{"arguments":{"equals":true,"key":"equipmentRequirementSatisfied"},"contextLevel":"ROSTER","evidence":{"field":["blocks",3,"text"],"quote":"Recon Drone: The bearer is equipped with 1 drone burst cannon and the bearer’s unit has the Infiltrators ability."},"predicate":"FIELD","subject":"UNIT"}` × 1; `{"arguments":{"equals":true,"key":"tauMarkerSelected"},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"Any number of models can be equipped with up to two of the following, but cannot take duplicates:\n- 1 gun drone\n- 1 marker drone\n- 1 shield drone"},"predicate":"FIELD","subject":"UNIT"}` × 1; `{"arguments":{"equals":true,"key":"tauMarkerSelected"},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"Any number of models can be equipped with up to two of the following, but cannot take duplicates\n- 1 gun drone\n- 1 marker drone\n- 1 shield drone"},"predicate":"FIELD","subject":"UNIT"}` × 2; `{"arguments":{"equals":true,"key":"tauMarkerSelected"},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"Any number of models can each be equipped with up to two of the following, and can take duplicates:\n- 1 gun drone\n- 1 marker drone\n- 1 missile drone\n- 1 shield drone"},"predicate":"FIELD","subject":"UNIT"}` × 1; `{"arguments":{"equals":true,"key":"tauMarkerSelected"},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"The Breacher Fire Warrior Shas’ui can be equipped with up to two of the following, and can take duplicates:\n- 1 guardian drone (it cannot take duplicates of this piece of wargear)\n- 1 gun drone\n- 1 marker drone\n- 1 shield drone"},"predicate":"FIELD","subject":"UNIT"}` × 1; `{"arguments":{"equals":true,"key":"tauMarkerSelected"},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"The Fire Warrior Shas’ui can be equipped with up to two of the following, and can take duplicates:\n- 1 guardian drone (it cannot take duplicates of this piece of wargear)\n- 1 gun drone\n- 1 marker drone\n- 1 shield drone"},"predicate":"FIELD","subject":"UNIT"}` × 1; `{"arguments":{"equals":true,"key":"tauMarkerSelected"},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"The Pathfinder Shas’ui can be equipped with up to two of the following, and can take duplicates:\n- 1 gun drone\n- 1 marker drone\n- 1 shield drone"},"predicate":"FIELD","subject":"UNIT"}` × 1; `{"arguments":{"equals":true,"key":"tauMarkerSelected"},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"The Stealth Shas’vre can be equipped with 1 marker drone."},"predicate":"FIELD","subject":"UNIT"}` × 1; `{"arguments":{"equals":true,"key":"tauMarkerSelected"},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"This model can be equipped with up to two of the following, and can take duplicates:\n- 1 gun drone\n- 1 marker drone\n- 1 shield drone"},"predicate":"FIELD","subject":"UNIT"}` × 4; `{"arguments":{"id":"unit-kroot-carnivores"},"contextLevel":"STATIC","evidence":{"field":["text"],"quote":"If you select this Detachment, KROOT CARNIVORE units from your army have the Battleline keyword."},"predicate":"UNIT_ID","subject":"UNIT"}` × 1; `{"arguments":{"value":true},"contextLevel":"ROSTER","evidence":{"field":["blocks",0,"text"],"quote":"Coldstar Commander: While this model is leading a unit, models in that unit have a Move characteristic of 12\" and ranged weapons equipped by models in that unit have the [ASSAULT] ability."},"predicate":"LEADING","subject":"UNIT"}` × 2; `{"arguments":{"value":true},"contextLevel":"ROSTER","evidence":{"field":["blocks",0,"text"],"quote":"Failure Is Not an Option: While this model is leading a unit, models in that unit have the Feel No Pain 5+ ability."},"predicate":"LEADING","subject":"UNIT"}` × 1; `{"arguments":{"value":true},"contextLevel":"ROSTER","evidence":{"field":["blocks",0,"text"],"quote":"Ritual Butchery: While this model is leading a unit, melee weapons equipped by models in that unit have the [SUSTAINED HITS 1] ability."},"predicate":"LEADING","subject":"UNIT"}` × 1; `{"arguments":{"value":true},"contextLevel":"ROSTER","evidence":{"field":["blocks",0,"text"],"quote":"Volley Fire: While this model is leading a unit, add 1 to the Attacks characteristic of ranged weapons equipped by models in that unit."},"predicate":"LEADING","subject":"UNIT"}` × 1; `{"arguments":{"value":true},"contextLevel":"ROSTER","evidence":{"field":["blocks",1,"text"],"quote":"Rites of Feasting: While this model is leading a unit, models in that unit have the Feel No Pain 6+ ability."},"predicate":"LEADING","subject":"UNIT"}` × 1; `{"arguments":{"value":true},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"KROOT TRAIL SHAPER model only. While the bearer is leading a unit, add 3\" to the Move characteristic of models in that unit and ranged weapons equipped by models in that unit have the [ASSAULT] ability."},"predicate":"LEADING","subject":"MODEL"}` × 2; `{"arguments":{"value":true},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"Kroot Flesh Shaper only. While the bearer is leading a unit, each time a model in that unit makes a melee attack, an unmodified Hit roll of 5+ scores a Critical Hit."},"predicate":"LEADING","subject":"MODEL"}` × 1 |
| `predicateContext` | `ABSENT` × 33; `BATTLE` × 225; `ROSTER` × 31; `STATIC` × 545 |
| `rosterClassification` | `BATTLE_ONLY` × 225; `DISPLAY_ONLY` × 49; `ROSTER_EXECUTABLE` × 34 |

Связи ролей (`actorRoleId`, `prerequisites`, `distinctFromRoleIds`, required/optional) со всеми значениями и частотами: `books[7].dictionary` в JSON. Отсутствующий purpose не доказывает получателя.

**FIELD key / уровень × число:** `["battleConditionSatisfied","BATTLE"]` × 225; `["equipmentRequirementSatisfied","ROSTER"]` × 10; `["tauMarkerSelected","ROSTER"]` × 12.

Ключи без извлечённой literal-декларации: нет. Это **не** отсутствие schema: factories могут выводить объявления из FIELD-атомов или computed constant keys; точный исходный factory указан в `fieldDeclarationEvidence`/`lineage.producerRefs`. Числа употребления ключей вычислены из данных независимо от literal extraction.

### tyranids

| Конструкция | Фактические значения × число |
|---|---|
| `contractSchema` | `rule-contract/v2` × 19 |
| `executionMode` | `DECLARATIVE_APPLICABILITY` × 19 |
| `contractRole.subject` | `MODEL` × 19; `UNIT` × 19 |
| `contractRole.purpose` | `OWNER` × 19; `RECIPIENT` × 19 |
| `contractRole.binding` | `ABSENT` × 19; `LEADERS_OF_SOURCE` × 1; `ROSTER_UNITS` × 3; `SOURCE_MODEL` × 5; `SOURCE_UNIT` × 8; `SOURCE_UNIT_MODELS` × 2 |
| `contractRole.sourceRoleId` | `ABSENT` × 38 |
| `clauseRole.subject` | `MODEL` × 26; `UNIT` × 23 |
| `clauseRole.purpose` | `OWNER` × 29; `RECIPIENT` × 20 |
| `clauseRole.binding` | `ABSENT` × 29; `LEADERS_OF_SOURCE` × 1; `ROSTER_MODELS` × 1; `ROSTER_UNITS` × 3; `SOURCE_MODEL` × 5; `SOURCE_UNIT` × 8; `SOURCE_UNIT_MODELS` × 2 |
| `clauseRole.sourceRoleId` | `ABSENT` × 49 |
| `effectRecipientRoleIds` | `ABSENT` × 29 |
| `rosterEffect.targetBinding` | `LEADERS_OF_SOURCE` × 1; `ROSTER_MODELS` × 1; `ROSTER_UNITS` × 4; `SOURCE_FORMED_MODELS` × 1; `SOURCE_MODEL` × 8; `SOURCE_UNIT` × 8; `SOURCE_UNIT_MODELS` × 2 |
| `rosterEffect.targetSubject` | `MODEL` × 13; `UNIT` × 12 |
| `rosterEffect.unitScope` | `ABSENT` × 20; `FORMED` × 1; `PHYSICAL` × 4 |
| `rosterEffect.containingUnitScope` | `ABSENT` × 24; `PHYSICAL` × 1 |
| `conditionalPolicy.kind` | `ABSENT` × 29 |
| `conditionalPolicy.recipientScope` | `ABSENT` × 29 |
| `predicates` | `ALWAYS` × 39; `FIELD` × 14; `LEADING` × 4; `MODEL_ID` × 25; `MODEL_KEYWORD` × 32; `UNIT_ID` × 38; `{"args":[{"arguments":{"id":"unit-deathleaper"},"contextLevel":"STATIC","evidence":{"field":["text"],"quote":"- Friendly DEATHLEAPER/LICTOR/NEUROLICTOR units have Deep Strike.\n- Friendly LICTOR/NEUROLICTOR units’ attacks that target a CHARACTER unit can re-roll hit rolls of 1."},"predicate":"UNIT_ID","subject":"UNIT"},{"arguments":{"id":"unit-lictor"},"contextLevel":"STATIC","evidence":{"field":["text"],"quote":"- Friendly DEATHLEAPER/LICTOR/NEUROLICTOR units have Deep Strike.\n- Friendly LICTOR/NEUROLICTOR units’ attacks that target a CHARACTER unit can re-roll hit rolls of 1."},"predicate":"UNIT_ID","subject":"UNIT"},{"arguments":{"id":"unit-neurolictor"},"contextLevel":"STATIC","evidence":{"field":["text"],"quote":"- Friendly DEATHLEAPER/LICTOR/NEUROLICTOR units have Deep Strike.\n- Friendly LICTOR/NEUROLICTOR units’ attacks that target a CHARACTER unit can re-roll hit rolls of 1."},"predicate":"UNIT_ID","subject":"UNIT"}],"op":"ANY"}` × 1; `{"args":[{"arguments":{"id":"unit-trygon"},"contextLevel":"STATIC","evidence":{"field":["text"],"quote":"Each time a TYRANIDS model from your army makes an attack, re-roll a Hit roll of 1.\nEach time a BURROWER unit from your army is set up on the battlefield from Reserves, place a circular 40mm Tunnel Marker anywhere on the battlefield within 1\" of that unit and more than 3\" horizontally away from all enemy units.\nIn the Reinforcements step of your Movement phase, when you set up a unit on the battlefield from Reserves, you can set that unit up wholly within 9\" of one of your Tunnel Markers and more than 6\" horizontally away from any enemy units.\nIf an enemy model (excluding AIRCRAFT) ends any kind of move within 3\" of one of your Tunnel Markers, that Tunnel Marker is removed from the battlefield.\nKEYWORDS\nMAWLOC and TRYGON units from your army have the BURROWER keyword.\nIn the Muster Armies step, you can select up to 2 TRYGON models from your army. The selected units gain the CHARACTER keyword.\nDesigner’s Note: This means that the selected models can be given Enhancements and one of them can be selected as your WARLORD."},"predicate":"UNIT_ID","subject":"UNIT"},{"arguments":{"equals":"detachment-subterranean-assault:rule::choice::trygon-character","key":"selectedSurpriseAssaultChoice"},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"In the Muster Armies step, you can select up to 2 TRYGON models from your army. The selected units gain the CHARACTER keyword."},"predicate":"FIELD","subject":"UNIT"}],"op":"ALL"}` × 1; `{"args":[{"arguments":{"id":"unit-tyranid-warriors-with-ranged-bio-weapons"},"contextLevel":"STATIC","evidence":{"field":["text"],"quote":"- Friendly TYRANID WARRIORS WITH RANGED BIO-WEAPONS/TYRANID WARRIORS WITH MELEE BIO-WEAPONS units have:\n- TYRANID WARRIORS.\n- BATTLELINE.\n- TYRANID WARRIORS/TYRANID PRIME WITH LASH WHIP/WINGED TYRANID PRIME models from your army have 5+ InSv."},"predicate":"UNIT_ID","subject":"UNIT"},{"arguments":{"id":"unit-tyranid-warriors-with-melee-bio-weapons"},"contextLevel":"STATIC","evidence":{"field":["text"],"quote":"- Friendly TYRANID WARRIORS WITH RANGED BIO-WEAPONS/TYRANID WARRIORS WITH MELEE BIO-WEAPONS units have:\n- TYRANID WARRIORS.\n- BATTLELINE.\n- TYRANID WARRIORS/TYRANID PRIME WITH LASH WHIP/WINGED TYRANID PRIME models from your army have 5+ InSv."},"predicate":"UNIT_ID","subject":"UNIT"}],"op":"ANY"}` × 2; `{"args":[{"arguments":{"keyword":"CHARACTER"},"contextLevel":"STATIC","evidence":{"field":["blocks",0,"text"],"quote":"Guardian Organism: While a CHARACTER model is leading this unit, that CHARACTER has the Feel No Pain 5+ ability."},"predicate":"MODEL_KEYWORD","subject":"MODEL"}],"op":"ALL"}` × 1; `{"arguments":{"equals":false,"key":"attached"},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"TYRANIDS model only. Add 2\" to the Move characteristic of models in the bearer’s unit."},"predicate":"FIELD","subject":"MODEL"}` × 1; `{"arguments":{"equals":true,"key":"attached"},"contextLevel":"ROSTER","evidence":{"field":["text"],"quote":"TYRANIDS model only. Add 2\" to the Move characteristic of models in the bearer’s unit."},"predicate":"FIELD","subject":"MODEL"}` × 1; `{"arguments":{"value":true},"contextLevel":"ROSTER","evidence":{"field":["blocks",0,"text"],"quote":"leading a unit"},"predicate":"LEADING","subject":"MODEL"}` × 2 |
| `predicateContext` | `ABSENT` × 9; `BATTLE` × 9; `ROSTER` × 9; `STATIC` × 134 |
| `rosterClassification` | `BATTLE_ONLY` × 9; `ROSTER_EXECUTABLE` × 20 |

Связи ролей (`actorRoleId`, `prerequisites`, `distinctFromRoleIds`, required/optional) со всеми значениями и частотами: `books[8].dictionary` в JSON. Отсутствующий purpose не доказывает получателя.

**FIELD key / уровень × число:** `["attached","ROSTER"]` × 2; `["battleConditionSatisfied","BATTLE"]` × 9; `["selectedSurpriseAssaultChoice","ROSTER"]` × 3.

Ключи без извлечённой literal-декларации: нет. Это **не** отсутствие schema: factories могут выводить объявления из FIELD-атомов или computed constant keys; точный исходный factory указан в `fieldDeclarationEvidence`/`lineage.producerRefs`. Числа употребления ключей вычислены из данных независимо от literal extraction.

## 3. Перепись правил и текущие пути отображения

Одна запись `clauses[]` соответствует одному пункту. При отсутствии clauses создаётся одна текстовая запись с `clauseId: null`; отсутствие контракта не превращается в выдуманную способность. Явные ABILITIES/WARGEAR ABILITIES и типизированные ability/component entities включены. Состав, варианты оружия, LEADER/SUPPORT/TRANSPORT и пустые контейнеры с контрактными дочерними правилами не объявляются пропущенными боевыми способностями; их ID и причины находятся в `exclusions[]`. Army/Weapon определения присутствуют как контекст, но не становятся отдельной F4-семьёй.

Статусы доказанности относятся к **отношению получателя и источника**, а не к правильности английского правила:

| Статус | Основание |
|---|---|
| EXPLICIT | Конкретный структурированный receiver edge: effect binding, typed policy или явно участвующая recipient-role. |
| IMPLICIT_CANDIDATE | Проверяемая возможная связь, контрактная роль без ребра к пункту либо reviewed metadata; ручное подтверждение ещё нужно. |
| OWNER_ONLY | Только доказанный physical/source binding или physical policy. OWNER/ALWAYS сами по себе этого не доказывают. |
| NONE | Только доказанное отсутствие UNIT/MODEL-получателя по назначению. Не используется как запасная категория. |
| UNKNOWN | Недостаточно доказательств. Причина сохраняется в записи и каждом отдельном пути. |

| Книга | Статусы записей | Отдельные каналы recipientPaths | UNKNOWN paths |
|---|---|---:|---:|
| adeptus-mechanicus | `EXPLICIT` × 111; `IMPLICIT_CANDIDATE` × 4; `OWNER_ONLY` × 8; `UNKNOWN` × 47 | 177 | 0 |
| blood-angels | `EXPLICIT` × 43; `OWNER_ONLY` × 13; `UNKNOWN` × 343 | 69 | 0 |
| chaos-space-marines | `EXPLICIT` × 165; `IMPLICIT_CANDIDATE` × 39; `NONE` × 6; `OWNER_ONLY` × 1; `UNKNOWN` × 67 | 287 | 0 |
| dark-angels | `EXPLICIT` × 56; `OWNER_ONLY` × 12; `UNKNOWN` × 357 | 85 | 0 |
| death-guard | `EXPLICIT` × 16; `IMPLICIT_CANDIDATE` × 73; `UNKNOWN` × 35 | 168 | 51 |
| emperors-children | `EXPLICIT` × 35; `IMPLICIT_CANDIDATE` × 1; `UNKNOWN` × 47 | 119 | 0 |
| space-marines | `EXPLICIT` × 40; `OWNER_ONLY` × 18; `UNKNOWN` × 475 | 79 | 0 |
| tau-empire | `EXPLICIT` × 13; `IMPLICIT_CANDIDATE` × 140; `OWNER_ONLY` × 8; `UNKNOWN` × 1 | 165 | 0 |
| tyranids | `EXPLICIT` × 20; `IMPLICIT_CANDIDATE` × 9; `UNKNOWN` × 81 | 55 | 0 |

Один пункт может содержать одновременно применяемый эффект и недоказанную роль. Поэтому итоговый status не заменяет `recipientPaths[]`/`statusCounts`; роль и execution-канал не сливаются по совпадению ruleId. Независимыми здесь считаются **каналы записи адресации**, а не дополнительные игровые эффекты или уникальные физические модели. При явном role-ID ребре `realizationLinks` предотвращает повторный подсчёт.

**Границы адресации:** `SOURCE_UNIT_MODELS` — физические модели; `SOURCE_FORMED_MODELS` — модели сформированной группы; `SOURCE_UNIT` c UNIT может распространять UNIT-свойство на formed group, если операция не требует PHYSICAL. `SOURCE_MODEL` без доказанного Enhancement bearer не означает одну модель: остаются физические профили source. `LEADERS_OF_SOURCE` направлен от Bodyguard к ведущим моделям. UNIT keywords сформированной группы не становятся intrinsic keywords каждой MODEL. Код: [books/shared/roster-v2/effects.mjs:282](../../books/shared/roster-v2/effects.mjs#L282); [books/shared/army-book-app-v2/personal.mjs:163](../../books/shared/army-book-app-v2/personal.mjs#L163). Противник и attack target остаются отдельными role paths. Radius/FIELD без binding не доказывает физическое множество получателей.

**Отображение сегодня:**

- Выполненный rosterEffect: `executeRosterEffects → projectEffectiveInstance → projectInstanceCards → createDatasheetPresenter`; только после TRUE условий и физических доказательств.
- Typed policy: `appendConditionalPolicy → projectConditionalPolicy → projectInstanceCards → rosterConditionalPolicies`; battle state остаётся UNKNOWN, execution — CONDITIONAL_TEXT_ONLY.
- F1: `detachmentTextDeclaration → detachmentTextRows/projectDetachmentText → rosterDetachmentTexts`; только допущенные clause roles, выбранный Detachment, точный источник и физический получатель. Существующий production gate проверяется напрямую, новый English parser не создаётся.
- Обычный BATTLE_ONLY Enhancement/Leader без typed policy не получает автоматически receiver-side текст: служебная conditional-строка остаётся отдельным каналом. Само наличие source card доказывает лишь source-page route.
- `rosterReferenceBinding` — отдельный канонический reference channel в `projectEffectiveInstance.enhancements.grantedRules`. Он не равен общему копированию условного текста на все даташиты.

Код: [books/shared/roster-v2/effects.mjs:237](../../books/shared/roster-v2/effects.mjs#L237); [books/shared/roster-v2/conditional-policy.mjs:212](../../books/shared/roster-v2/conditional-policy.mjs#L212); [books/shared/roster-v2/conditional-policy.mjs:249](../../books/shared/roster-v2/conditional-policy.mjs#L249); [books/shared/roster-v2/conditional-policy.mjs:140](../../books/shared/roster-v2/conditional-policy.mjs#L140); [books/shared/army-book-app-v2/personal.mjs:253](../../books/shared/army-book-app-v2/personal.mjs#L253); [books/shared/army-book-app-v2/datasheet-v1.mjs:582](../../books/shared/army-book-app-v2/datasheet-v1.mjs#L582); [books/shared/army-book-app-v2/datasheet-v1.mjs:527](../../books/shared/army-book-app-v2/datasheet-v1.mjs#L527); [books/shared/army-book-app-v2/datasheet-v1.mjs:335](../../books/shared/army-book-app-v2/datasheet-v1.mjs#L335).

**CURRENTLY_PRESENTED означает найденный статический production-путь с указанными gate, а не увиденный браузером эффект.** Для каждой записи/ветви сохранено `verification: STATIC_CODE_ONLY`; фактические ростеры и UI здесь не запускались. Частичное отображение отмечено `PARTIAL_OR_SOURCE_ONLY`.

### Контрольные записи JSON

Ниже — компактные проекции конкретных записей из соседнего JSON; полный raw clause, roles, conditions, provenance и отдельные paths не сокращены в JSON. Примеры сверяются по каноническим ID, а не находят семантику по английским словам.

#### adeptus-mechanicus / `datasheet-cybernetica-datasmith:section:1`

```json
{
  "bookId": "adeptus-mechanicus",
  "entityId": "datasheet-cybernetica-datasmith:section:1",
  "clauseId": "battle-protocols",
  "sourceId": "am-waha-11e-2026-09-25",
  "sourcePaths": [
    {
      "path": "books/adeptus-mechanicus/sources/waha-11e-current-2026-09-25/corpus.json",
      "status": "RESOLVED"
    }
  ],
  "sourceFields": [
    [
      "blocks",
      0,
      "text"
    ]
  ],
  "quote": "Battle Protocols: At the start of the battle, if this model is leading a KASTELAN ROBOTS unit, that unit enters Aegis Protocols (see below). In your Command pha",
  "rosterClassification": "BATTLE_ONLY",
  "status": "UNKNOWN",
  "f4Category": "D",
  "recipientPaths": [],
  "unknownReason": "Source ownership/participation is recorded, but a receiver-to-source relationship is not proven."
}
```

Доказательства producer: [books/adeptus-mechanicus/v2/app-build.mjs:18](../../books/adeptus-mechanicus/v2/app-build.mjs#L18); [books/adeptus-mechanicus/v2/build.py:44](../../books/adeptus-mechanicus/v2/build.py#L44); [books/adeptus-mechanicus/v2/build.py:48](../../books/adeptus-mechanicus/v2/build.py#L48); [books/adeptus-mechanicus/v2/build.py:322](../../books/adeptus-mechanicus/v2/build.py#L322). Путь исходной runtime-записи: [books/adeptus-mechanicus/v2/generated/roster-runtime.json](../../books/adeptus-mechanicus/v2/generated/roster-runtime.json) `/entities/62`.

Ограничение: Source ownership/participation is recorded, but a receiver-to-source relationship is not proven. Другие пункты этого владельца: `battle-protocols`, `data-severed`.

#### adeptus-mechanicus / `datasheet-skitarii-marshal:section:1`

```json
{
  "bookId": "adeptus-mechanicus",
  "entityId": "datasheet-skitarii-marshal:section:1",
  "clauseId": "block-1",
  "sourceId": "am-waha-11e-2026-09-25",
  "sourcePaths": [
    {
      "path": "books/adeptus-mechanicus/sources/waha-11e-current-2026-09-25/corpus.json",
      "status": "RESOLVED"
    }
  ],
  "sourceFields": [
    [
      "blocks",
      0,
      "text"
    ]
  ],
  "quote": "Control Edict: While this model is leading a unit, each time a model in that unit makes an attack, you can re-roll the Hit roll.",
  "rosterClassification": "BATTLE_ONLY",
  "status": "UNKNOWN",
  "f4Category": "D",
  "recipientPaths": [],
  "unknownReason": "Source ownership/participation is recorded, but a receiver-to-source relationship is not proven."
}
```

Доказательства producer: [books/adeptus-mechanicus/v2/app-build.mjs:18](../../books/adeptus-mechanicus/v2/app-build.mjs#L18); [books/adeptus-mechanicus/v2/build.py:44](../../books/adeptus-mechanicus/v2/build.py#L44); [books/adeptus-mechanicus/v2/build.py:48](../../books/adeptus-mechanicus/v2/build.py#L48); [books/adeptus-mechanicus/v2/build.py:322](../../books/adeptus-mechanicus/v2/build.py#L322). Путь исходной runtime-записи: [books/adeptus-mechanicus/v2/generated/roster-runtime.json](../../books/adeptus-mechanicus/v2/generated/roster-runtime.json) `/entities/295`.

Ограничение: Source ownership/participation is recorded, but a receiver-to-source relationship is not proven. Другие пункты этого владельца: `block-1`, `block-2`.

#### adeptus-mechanicus / `datasheet-tech-priest-dominus:section:1`

```json
{
  "bookId": "adeptus-mechanicus",
  "entityId": "datasheet-tech-priest-dominus:section:1",
  "clauseId": "block-1",
  "sourceId": "am-waha-11e-2026-09-25",
  "sourcePaths": [
    {
      "path": "books/adeptus-mechanicus/sources/waha-11e-current-2026-09-25/corpus.json",
      "status": "RESOLVED"
    }
  ],
  "sourceFields": [
    [
      "blocks",
      0,
      "text"
    ]
  ],
  "quote": "Lord of the Machine Cult: While this model is leading a unit, models in that unit have the Feel No Pain 5+ ability. If that unit has the ELECTRO-PRIESTS keyword",
  "rosterClassification": "ROSTER_EXECUTABLE",
  "status": "EXPLICIT",
  "f4Category": "A",
  "recipientPaths": [
    {
      "pathId": "EFFECT:000",
      "channel": "EFFECT",
      "status": "EXPLICIT",
      "relation": "FORMED_SOURCE_UNIT_MODELS",
      "roleId": null,
      "targetBinding": "SOURCE_FORMED_MODELS",
      "presentation": "CURRENTLY_PRESENTED",
      "unknownReason": null
    },
    {
      "pathId": "ROLE:001",
      "channel": "ROLE",
      "status": "EXPLICIT",
      "relation": "DECLARED_SOURCE_FORMED_MODELS_ROLE",
      "roleId": "formedModels",
      "targetBinding": null,
      "presentation": "UNKNOWN",
      "unknownReason": null
    }
  ],
  "unknownReason": null
}
```

Доказательства producer: [books/adeptus-mechanicus/v2/app-build.mjs:18](../../books/adeptus-mechanicus/v2/app-build.mjs#L18); [books/adeptus-mechanicus/v2/build.py:44](../../books/adeptus-mechanicus/v2/build.py#L44); [books/adeptus-mechanicus/v2/build.py:48](../../books/adeptus-mechanicus/v2/build.py#L48); [books/adeptus-mechanicus/v2/build.py:322](../../books/adeptus-mechanicus/v2/build.py#L322). Путь исходной runtime-записи: [books/adeptus-mechanicus/v2/generated/roster-runtime.json](../../books/adeptus-mechanicus/v2/generated/roster-runtime.json) `/entities/420`.

Ограничение: Физический roster/instance и battle context здесь не инстанцированы; это статическая связь, не UI-наблюдение. Другие пункты этого владельца: `block-1`, `block-1-electro-priests`, `block-2`.

#### adeptus-mechanicus / `detachment-haloscreed-battle-clade:rule`

```json
{
  "bookId": "adeptus-mechanicus",
  "entityId": "detachment-haloscreed-battle-clade:rule",
  "clauseId": "halo-override-selection",
  "sourceId": "am-waha-11e-2026-09-25",
  "sourcePaths": [
    {
      "path": "books/adeptus-mechanicus/sources/waha-11e-current-2026-09-25/corpus.json",
      "status": "RESOLVED"
    }
  ],
  "sourceFields": [
    [
      "text"
    ],
    [
      "tables"
    ]
  ],
  "quote": "In your Command phase, select one or more ADEPTUS MECHANICUS units from your army (including units that are embarked within TRANSPORTS). The maximum number of u",
  "rosterClassification": "BATTLE_ONLY",
  "status": "EXPLICIT",
  "f4Category": null,
  "recipientPaths": [
    {
      "pathId": "ROLE:000",
      "channel": "ROLE",
      "status": "IMPLICIT_CANDIDATE",
      "relation": "FRIENDLY_STRUCTURED_SELECTOR",
      "roleId": "beneficiary",
      "targetBinding": null,
      "presentation": "UNKNOWN",
      "unknownReason": "Contract-level applicability role is not an explicit edge from this clause to that recipient."
    },
    {
      "pathId": "ROLE:001",
      "channel": "ROLE",
      "status": "EXPLICIT",
      "relation": "FRIENDLY_STRUCTURED_SELECTOR",
      "roleId": "selected-unit",
      "targetBinding": null,
      "presentation": "CURRENTLY_PRESENTED",
      "unknownReason": null
    }
  ],
  "unknownReason": null
}
```

Доказательства producer: [books/adeptus-mechanicus/v2/app-build.mjs:18](../../books/adeptus-mechanicus/v2/app-build.mjs#L18); [books/adeptus-mechanicus/v2/build.py:44](../../books/adeptus-mechanicus/v2/build.py#L44); [books/adeptus-mechanicus/v2/build.py:48](../../books/adeptus-mechanicus/v2/build.py#L48); [books/adeptus-mechanicus/v2/build.py:322](../../books/adeptus-mechanicus/v2/build.py#L322). Путь исходной runtime-записи: [books/adeptus-mechanicus/v2/generated/roster-runtime.json](../../books/adeptus-mechanicus/v2/generated/roster-runtime.json) `/entities/487`.

Ограничение: Физический roster/instance и battle context здесь не инстанцированы; это статическая связь, не UI-наблюдение. Другие пункты этого владельца: `electromotive`, `halo-override-selection`, `microactuator`, `muted-servomotors`, `override-choice`, `predation`.

#### blood-angels / `ability-ba-16b14dac906045e3a48b`

```json
{
  "bookId": "blood-angels",
  "entityId": "ability-ba-16b14dac906045e3a48b",
  "clauseId": "review/ability-ba-16b14dac906045e3a48b/text/0:57",
  "sourceId": "blood-angels-waha-11e-2026-10-22",
  "sourcePaths": [
    {
      "path": "books/blood-angels/v2/sources/raw/wahapedia-datasheets.html",
      "status": "RESOLVED"
    }
  ],
  "sourceFields": [
    [
      "text"
    ]
  ],
  "quote": "Overcharged Engines: This unit can re-roll advance rolls.",
  "rosterClassification": "DISPLAY_ONLY",
  "status": "EXPLICIT",
  "f4Category": null,
  "recipientPaths": [
    {
      "pathId": "POLICY:000",
      "channel": "POLICY",
      "status": "EXPLICIT",
      "relation": "FORMED_UNIT",
      "roleId": null,
      "targetBinding": null,
      "presentation": "CURRENTLY_PRESENTED",
      "unknownReason": null
    }
  ],
  "unknownReason": null
}
```

Доказательства producer: [books/blood-angels/v2/app-build.mjs:16](../../books/blood-angels/v2/app-build.mjs#L16); [books/blood-angels/v2/book-build.mjs:19](../../books/blood-angels/v2/book-build.mjs#L19); [books/blood-angels/v2/book-build.mjs:21](../../books/blood-angels/v2/book-build.mjs#L21); [books/blood-angels/v2/build.py:198](../../books/blood-angels/v2/build.py#L198). Путь исходной runtime-записи: [books/blood-angels/v2/generated/roster-import.json](../../books/blood-angels/v2/generated/roster-import.json) `/entities/1`.

Ограничение: Физический roster/instance и battle context здесь не инстанцированы; это статическая связь, не UI-наблюдение. Другие пункты этого владельца: `review/ability-ba-16b14dac906045e3a48b/text/0:57`.

#### blood-angels / `ability-ba-1d205c52ba9d49fbbcfd`

```json
{
  "bookId": "blood-angels",
  "entityId": "ability-ba-1d205c52ba9d49fbbcfd",
  "clauseId": "review/ability-ba-1d205c52ba9d49fbbcfd/text/12:67",
  "sourceId": "blood-angels-waha-11e-2026-10-22",
  "sourcePaths": [
    {
      "path": "books/blood-angels/v2/sources/raw/wahapedia-datasheets.html",
      "status": "RESOLVED"
    }
  ],
  "sourceFields": [
    [
      "text"
    ]
  ],
  "quote": "- This unit’s melee attacks can re-roll hit rolls of 1.",
  "rosterClassification": "DISPLAY_ONLY",
  "status": "EXPLICIT",
  "f4Category": "A",
  "recipientPaths": [
    {
      "pathId": "POLICY:000",
      "channel": "POLICY",
      "status": "EXPLICIT",
      "relation": "FORMED_UNIT",
      "roleId": null,
      "targetBinding": null,
      "presentation": "CURRENTLY_PRESENTED",
      "unknownReason": null
    }
  ],
  "unknownReason": null
}
```

Доказательства producer: [books/blood-angels/v2/app-build.mjs:16](../../books/blood-angels/v2/app-build.mjs#L16); [books/blood-angels/v2/book-build.mjs:19](../../books/blood-angels/v2/book-build.mjs#L19); [books/blood-angels/v2/book-build.mjs:21](../../books/blood-angels/v2/book-build.mjs#L21); [books/blood-angels/v2/build.py:198](../../books/blood-angels/v2/build.py#L198). Путь исходной runtime-записи: [books/blood-angels/v2/generated/roster-import.json](../../books/blood-angels/v2/generated/roster-import.json) `/entities/2`.

Ограничение: Физический roster/instance и battle context здесь не инстанцированы; это статическая связь, не UI-наблюдение. Другие пункты этого владельца: `review/ability-ba-1d205c52ba9d49fbbcfd/text/12:67`, `review/ability-ba-1d205c52ba9d49fbbcfd/text/68:278`.

#### blood-angels / `ability-ba-3c7cd126400b4e7cb0fc`

```json
{
  "bookId": "blood-angels",
  "entityId": "ability-ba-3c7cd126400b4e7cb0fc",
  "clauseId": "forlorn-hero-scouts",
  "sourceId": "blood-angels-waha-11e-2026-10-22",
  "sourcePaths": [
    {
      "path": "books/blood-angels/v2/sources/raw/wahapedia-datasheets.html",
      "status": "RESOLVED"
    }
  ],
  "sourceFields": [
    [
      "text"
    ]
  ],
  "quote": "Forlorn Hero: This unit has Scouts 6\".",
  "rosterClassification": "ROSTER_EXECUTABLE",
  "status": "EXPLICIT",
  "f4Category": "A",
  "recipientPaths": [
    {
      "pathId": "EFFECT:000",
      "channel": "EFFECT",
      "status": "EXPLICIT",
      "relation": "UNIT_EFFECT_FORMED_IF_ATTACHED",
      "roleId": null,
      "targetBinding": "SOURCE_UNIT",
      "presentation": "CURRENTLY_PRESENTED",
      "unknownReason": null
    }
  ],
  "unknownReason": null
}
```

Доказательства producer: [books/blood-angels/v2/app-build.mjs:16](../../books/blood-angels/v2/app-build.mjs#L16); [books/blood-angels/v2/book-build.mjs:19](../../books/blood-angels/v2/book-build.mjs#L19); [books/blood-angels/v2/book-build.mjs:21](../../books/blood-angels/v2/book-build.mjs#L21); [books/blood-angels/v2/build.py:198](../../books/blood-angels/v2/build.py#L198). Путь исходной runtime-записи: [books/blood-angels/v2/generated/roster-import.json](../../books/blood-angels/v2/generated/roster-import.json) `/entities/6`.

Ограничение: Физический roster/instance и battle context здесь не инстанцированы; это статическая связь, не UI-наблюдение. Другие пункты этого владельца: `forlorn-hero-scouts`.

#### blood-angels / `ability-ba-40389ffef38645ca922a`

```json
{
  "bookId": "blood-angels",
  "entityId": "ability-ba-40389ffef38645ca922a",
  "clauseId": "fury-unbound-melee",
  "sourceId": "blood-angels-waha-11e-2026-10-22",
  "sourcePaths": [
    {
      "path": "books/blood-angels/v2/sources/raw/wahapedia-datasheets.html",
      "status": "RESOLVED"
    }
  ],
  "sourceFields": [
    [
      "text"
    ]
  ],
  "quote": "Fury Unbound: This unit’s melee attacks have [LETHAL HITS].",
  "rosterClassification": "ROSTER_EXECUTABLE",
  "status": "EXPLICIT",
  "f4Category": "A",
  "recipientPaths": [
    {
      "pathId": "EFFECT:000",
      "channel": "EFFECT",
      "status": "EXPLICIT",
      "relation": "UNIT_EFFECT_FORMED_IF_ATTACHED",
      "roleId": null,
      "targetBinding": "SOURCE_UNIT",
      "presentation": "CURRENTLY_PRESENTED",
      "unknownReason": null
    }
  ],
  "unknownReason": null
}
```

Доказательства producer: [books/blood-angels/v2/app-build.mjs:16](../../books/blood-angels/v2/app-build.mjs#L16); [books/blood-angels/v2/book-build.mjs:19](../../books/blood-angels/v2/book-build.mjs#L19); [books/blood-angels/v2/book-build.mjs:21](../../books/blood-angels/v2/book-build.mjs#L21); [books/blood-angels/v2/build.py:198](../../books/blood-angels/v2/build.py#L198). Путь исходной runtime-записи: [books/blood-angels/v2/generated/roster-import.json](../../books/blood-angels/v2/generated/roster-import.json) `/entities/7`.

Ограничение: Физический roster/instance и battle context здесь не инстанцированы; это статическая связь, не UI-наблюдение. Другие пункты этого владельца: `fury-unbound-melee`.

#### blood-angels / `army-rule-sm-940f2057cc7c4551`

```json
{
  "bookId": "blood-angels",
  "entityId": "army-rule-sm-940f2057cc7c4551",
  "clauseId": null,
  "sourceId": "space-marines-waha-11e-2026-10-20",
  "sourcePaths": [
    {
      "path": "books/space-marines/v2/sources/raw/wahapedia-space-marines-main.html",
      "status": "RESOLVED"
    }
  ],
  "sourceFields": [
    [
      "text"
    ]
  ],
  "quote": "Transhuman Strategist\nAt the start of the battle round, if a model with this ability is your WARLORD, gain 1CP.",
  "rosterClassification": null,
  "status": "UNKNOWN",
  "f4Category": null,
  "recipientPaths": [],
  "unknownReason": "No clause/contract in the actual execution artifact; source-only text is not a physical recipient declaration."
}
```

Доказательства producer: [books/blood-angels/v2/app-build.mjs:16](../../books/blood-angels/v2/app-build.mjs#L16); [books/blood-angels/v2/book-build.mjs:19](../../books/blood-angels/v2/book-build.mjs#L19); [books/blood-angels/v2/book-build.mjs:21](../../books/blood-angels/v2/book-build.mjs#L21); [books/blood-angels/v2/build.py:198](../../books/blood-angels/v2/build.py#L198). Путь исходной runtime-записи: [books/blood-angels/v2/generated/roster-import.json](../../books/blood-angels/v2/generated/roster-import.json) `/entities/148`.

Ограничение: No clause/contract in the actual execution artifact; source-only text is not a physical recipient declaration. Другие пункты этого владельца: `null`.

#### blood-angels / `army-rule-sm-a3907d06530b419a`

```json
{
  "bookId": "blood-angels",
  "entityId": "army-rule-sm-a3907d06530b419a",
  "clauseId": null,
  "sourceId": "space-marines-waha-11e-2026-10-20",
  "sourcePaths": [
    {
      "path": "books/space-marines/v2/sources/raw/wahapedia-space-marines-main.html",
      "status": "RESOLVED"
    }
  ],
  "sourceFields": [
    [
      "text"
    ]
  ],
  "quote": "Librarius\nADEPTUS ASTARTES PSYKER units with this ability have a psyker level of 1 or higher, specified in that unit’s abilities. Each psychic ability has a psy",
  "rosterClassification": null,
  "status": "UNKNOWN",
  "f4Category": null,
  "recipientPaths": [],
  "unknownReason": "No clause/contract in the actual execution artifact; source-only text is not a physical recipient declaration."
}
```

Доказательства producer: [books/blood-angels/v2/app-build.mjs:16](../../books/blood-angels/v2/app-build.mjs#L16); [books/blood-angels/v2/book-build.mjs:19](../../books/blood-angels/v2/book-build.mjs#L19); [books/blood-angels/v2/book-build.mjs:21](../../books/blood-angels/v2/book-build.mjs#L21); [books/blood-angels/v2/build.py:198](../../books/blood-angels/v2/build.py#L198). Путь исходной runtime-записи: [books/blood-angels/v2/generated/roster-import.json](../../books/blood-angels/v2/generated/roster-import.json) `/entities/149`.

Ограничение: No clause/contract in the actual execution artifact; source-only text is not a physical recipient declaration. Другие пункты этого владельца: `null`.

#### blood-angels / `army-rule-sm-fcdb8cd8bb5f40dd`

```json
{
  "bookId": "blood-angels",
  "entityId": "army-rule-sm-fcdb8cd8bb5f40dd",
  "clauseId": null,
  "sourceId": "space-marines-waha-11e-2026-10-20",
  "sourcePaths": [
    {
      "path": "books/space-marines/v2/sources/raw/wahapedia-space-marines-main.html",
      "status": "RESOLVED"
    }
  ],
  "sourceFields": [
    [
      "text"
    ]
  ],
  "quote": "Combat Doctrines\nAt the start of your Command phase, you can select one combat doctrine listed below. If you do, that combat doctrine is active for friendly ADE",
  "rosterClassification": null,
  "status": "UNKNOWN",
  "f4Category": null,
  "recipientPaths": [],
  "unknownReason": "No clause/contract in the actual execution artifact; source-only text is not a physical recipient declaration."
}
```

Доказательства producer: [books/blood-angels/v2/app-build.mjs:16](../../books/blood-angels/v2/app-build.mjs#L16); [books/blood-angels/v2/book-build.mjs:19](../../books/blood-angels/v2/book-build.mjs#L19); [books/blood-angels/v2/book-build.mjs:21](../../books/blood-angels/v2/book-build.mjs#L21); [books/blood-angels/v2/build.py:198](../../books/blood-angels/v2/build.py#L198). Путь исходной runtime-записи: [books/blood-angels/v2/generated/roster-import.json](../../books/blood-angels/v2/generated/roster-import.json) `/entities/150`.

Ограничение: No clause/contract in the actual execution artifact; source-only text is not a physical recipient declaration. Другие пункты этого владельца: `null`.

#### blood-angels / `detachment-rule-ba-10c56bef78b24440bb5f`

```json
{
  "bookId": "blood-angels",
  "entityId": "detachment-rule-ba-10c56bef78b24440bb5f",
  "clauseId": "review/detachment-rule-ba-10c56bef78b24440bb5f/text/121:255",
  "sourceId": "blood-angels-waha-11e-2026-10-22",
  "sourcePaths": [
    {
      "path": "books/blood-angels/v2/sources/raw/wahapedia-blood-angels-main.html",
      "status": "RESOLVED"
    }
  ],
  "sourceFields": [
    [
      "text"
    ]
  ],
  "quote": "Restrictions: Your army can include BLOOD ANGELS units, but it cannot include any ADEPTUS ASTARTES units drawn from any other Chapter.",
  "rosterClassification": "DISPLAY_ONLY",
  "status": "UNKNOWN",
  "f4Category": null,
  "recipientPaths": [],
  "unknownReason": "Source ownership/participation is recorded, but a receiver-to-source relationship is not proven."
}
```

Доказательства producer: [books/blood-angels/v2/app-build.mjs:16](../../books/blood-angels/v2/app-build.mjs#L16); [books/blood-angels/v2/book-build.mjs:19](../../books/blood-angels/v2/book-build.mjs#L19); [books/blood-angels/v2/book-build.mjs:21](../../books/blood-angels/v2/book-build.mjs#L21); [books/blood-angels/v2/build.py:198](../../books/blood-angels/v2/build.py#L198). Путь исходной runtime-записи: [books/blood-angels/v2/generated/roster-import.json](../../books/blood-angels/v2/generated/roster-import.json) `/entities/260`.

Ограничение: Source ownership/participation is recorded, but a receiver-to-source relationship is not proven. Другие пункты этого владельца: `review/detachment-rule-ba-10c56bef78b24440bb5f/text/121:255`, `review/detachment-rule-ba-10c56bef78b24440bb5f/text/59:88`, `review/detachment-rule-ba-10c56bef78b24440bb5f/text/89:120`.

#### blood-angels / `detachment-rule-ba-891412625ddf4fba9a95`

```json
{
  "bookId": "blood-angels",
  "entityId": "detachment-rule-ba-891412625ddf4fba9a95",
  "clauseId": "review/detachment-rule-ba-891412625ddf4fba9a95/text/16:116",
  "sourceId": "blood-angels-waha-11e-2026-10-22",
  "sourcePaths": [
    {
      "path": "books/blood-angels/v2/sources/raw/wahapedia-blood-angels-main.html",
      "status": "RESOLVED"
    }
  ],
  "sourceFields": [
    [
      "text"
    ]
  ],
  "quote": "The tactical doctrine is active for SANGUINARY GUARD units in addition to any other combat doctrine.",
  "rosterClassification": "DISPLAY_ONLY",
  "status": "UNKNOWN",
  "f4Category": null,
  "recipientPaths": [],
  "unknownReason": "Source ownership/participation is recorded, but a receiver-to-source relationship is not proven."
}
```

Доказательства producer: [books/blood-angels/v2/app-build.mjs:16](../../books/blood-angels/v2/app-build.mjs#L16); [books/blood-angels/v2/book-build.mjs:19](../../books/blood-angels/v2/book-build.mjs#L19); [books/blood-angels/v2/book-build.mjs:21](../../books/blood-angels/v2/book-build.mjs#L21); [books/blood-angels/v2/build.py:198](../../books/blood-angels/v2/build.py#L198). Путь исходной runtime-записи: [books/blood-angels/v2/generated/roster-import.json](../../books/blood-angels/v2/generated/roster-import.json) `/entities/261`.

Ограничение: Source ownership/participation is recorded, but a receiver-to-source relationship is not proven. Другие пункты этого владельца: `review/detachment-rule-ba-891412625ddf4fba9a95/text/117:251`, `review/detachment-rule-ba-891412625ddf4fba9a95/text/16:116`.

#### blood-angels / `detachment-rule-dw-b41deacc51464866`

```json
{
  "bookId": "blood-angels",
  "entityId": "detachment-rule-dw-b41deacc51464866",
  "clauseId": null,
  "sourceId": "space-marines-waha-11e-2026-10-20",
  "sourcePaths": [
    {
      "path": "books/space-marines/v2/sources/raw/wahapedia-space-marines-main.html",
      "status": "RESOLVED"
    }
  ],
  "sourceFields": [
    [
      "text"
    ]
  ],
  "quote": "Mission Tactics\nFriendly KILL TEAM units with this ability have the following abilities:\nFuror Tactics\nIf the devastator doctrine is active for your unit, your ",
  "rosterClassification": null,
  "status": "UNKNOWN",
  "f4Category": null,
  "recipientPaths": [],
  "unknownReason": "No clause/contract in the actual execution artifact; source-only text is not a physical recipient declaration."
}
```

Доказательства producer: [books/blood-angels/v2/app-build.mjs:16](../../books/blood-angels/v2/app-build.mjs#L16); [books/blood-angels/v2/book-build.mjs:19](../../books/blood-angels/v2/book-build.mjs#L19); [books/blood-angels/v2/book-build.mjs:21](../../books/blood-angels/v2/book-build.mjs#L21); [books/blood-angels/v2/build.py:198](../../books/blood-angels/v2/build.py#L198). Путь исходной runtime-записи: [books/blood-angels/v2/generated/roster-import.json](../../books/blood-angels/v2/generated/roster-import.json) `/entities/1621`.

Ограничение: No clause/contract in the actual execution artifact; source-only text is not a physical recipient declaration. Другие пункты этого владельца: `null`.

#### chaos-space-marines / `datasheet-abaddon-the-despoiler:section:5:block:0:text`

```json
{
  "bookId": "chaos-space-marines",
  "entityId": "datasheet-abaddon-the-despoiler:section:5:block:0:text",
  "clauseId": "source-clause",
  "sourceId": "datasheet-abaddon-the-despoiler:section:5#/blocks/0/text",
  "sourcePaths": [
    {
      "path": "books/chaos-space-marines/sources/waha-11e-current-2026-09-29/Abaddon-The-Despoiler.html",
      "status": "RESOLVED"
    }
  ],
  "sourceFields": [
    [
      "text"
    ]
  ],
  "quote": "Paragon of Hatred (Aura): While a friendly HERETIC ASTARTES unit is within 6\" (excluding DAMNED units) of this model, each time a model in that unit makes an at",
  "rosterClassification": "BATTLE_ONLY",
  "status": "IMPLICIT_CANDIDATE",
  "f4Category": "C",
  "recipientPaths": [
    {
      "pathId": "ROLE:000",
      "channel": "ROLE",
      "status": "IMPLICIT_CANDIDATE",
      "relation": "UNKNOWN",
      "roleId": "friendlyTarget",
      "targetBinding": null,
      "presentation": "STRUCTURALLY_SUPPORTED_NOT_PRESENTED",
      "unknownReason": null
    }
  ],
  "unknownReason": null
}
```

Доказательства producer: [books/chaos-space-marines/v2/build.py:368](../../books/chaos-space-marines/v2/build.py#L368); [books/chaos-space-marines/v2/roster-effect-build.mjs:22](../../books/chaos-space-marines/v2/roster-effect-build.mjs#L22); [books/chaos-space-marines/v2/roster-effect-build.mjs:86](../../books/chaos-space-marines/v2/roster-effect-build.mjs#L86); [books/chaos-space-marines/v2/roster-effect-build.mjs:171](../../books/chaos-space-marines/v2/roster-effect-build.mjs#L171). Путь исходной runtime-записи: [books/chaos-space-marines/v2/generated/roster-runtime.json](../../books/chaos-space-marines/v2/generated/roster-runtime.json) `/entities/673`.

Ограничение: Физический roster/instance и battle context здесь не инстанцированы; это статическая связь, не UI-наблюдение. Другие пункты этого владельца: `source-clause`.

#### chaos-space-marines / `datasheet-fabius-bile:section:1:block:0:text`

```json
{
  "bookId": "chaos-space-marines",
  "entityId": "datasheet-fabius-bile:section:1:block:0:text",
  "clauseId": "bodyguard-melee-strength",
  "sourceId": "datasheet-fabius-bile:section:1#/blocks/0/text",
  "sourcePaths": [
    {
      "path": "books/chaos-space-marines/sources/waha-11e-current-2026-09-29/Fabius-Bile.html",
      "status": "RESOLVED"
    }
  ],
  "sourceFields": [
    [
      "text"
    ]
  ],
  "quote": "Enhanced Warriors: If this unit is attached to a unit at the start of the battle, until the end of the battle, add 1 to the Strength characteristic of melee wea",
  "rosterClassification": "ROSTER_EXECUTABLE",
  "status": "EXPLICIT",
  "f4Category": "A",
  "recipientPaths": [
    {
      "pathId": "EFFECT:000",
      "channel": "EFFECT",
      "status": "EXPLICIT",
      "relation": "FORMED_SOURCE_UNIT_MODELS",
      "roleId": null,
      "targetBinding": "SOURCE_FORMED_MODELS",
      "presentation": "CURRENTLY_PRESENTED",
      "unknownReason": null
    },
    {
      "pathId": "ROLE:001",
      "channel": "ROLE",
      "status": "EXPLICIT",
      "relation": "DECLARED_SOURCE_FORMED_MODELS_ROLE",
      "roleId": "bodyguardModels",
      "targetBinding": null,
      "presentation": "UNKNOWN",
      "unknownReason": null
    }
  ],
  "unknownReason": null
}
```

Доказательства producer: [books/chaos-space-marines/v2/build.py:368](../../books/chaos-space-marines/v2/build.py#L368); [books/chaos-space-marines/v2/roster-effect-build.mjs:22](../../books/chaos-space-marines/v2/roster-effect-build.mjs#L22); [books/chaos-space-marines/v2/roster-effect-build.mjs:86](../../books/chaos-space-marines/v2/roster-effect-build.mjs#L86); [books/chaos-space-marines/v2/roster-effect-build.mjs:171](../../books/chaos-space-marines/v2/roster-effect-build.mjs#L171). Путь исходной runtime-записи: [books/chaos-space-marines/v2/generated/roster-runtime.json](../../books/chaos-space-marines/v2/generated/roster-runtime.json) `/entities/715`.

Ограничение: Физический roster/instance и battle context здесь не инстанцированы; это статическая связь, не UI-наблюдение. Другие пункты этого владельца: `bodyguard-melee-strength`, `bodyguard-toughness`.

#### chaos-space-marines / `datasheet-master-of-possession:section:1:block:0:text`

```json
{
  "bookId": "chaos-space-marines",
  "entityId": "datasheet-master-of-possession:section:1:block:0:text",
  "clauseId": "charge-roll-clause",
  "sourceId": "datasheet-master-of-possession:section:1#/blocks/0/text",
  "sourcePaths": [
    {
      "path": "books/chaos-space-marines/sources/waha-11e-current-2026-09-29/Master-Of-Possession.html",
      "status": "RESOLVED"
    }
  ],
  "sourceFields": [
    [
      "text"
    ]
  ],
  "quote": "Daemonkin (Psychic): While this model is leading a unit, add 1 to Advance and Charge rolls made for that unit.",
  "rosterClassification": "ROSTER_EXECUTABLE",
  "status": "EXPLICIT",
  "f4Category": "C",
  "recipientPaths": [
    {
      "pathId": "EFFECT:000",
      "channel": "EFFECT",
      "status": "EXPLICIT",
      "relation": "UNIT_EFFECT_FORMED_IF_ATTACHED",
      "roleId": null,
      "targetBinding": "SOURCE_UNIT",
      "presentation": "CURRENTLY_PRESENTED",
      "unknownReason": null
    },
    {
      "pathId": "ROLE:001",
      "channel": "ROLE",
      "status": "EXPLICIT",
      "relation": "DECLARED_SOURCE_UNIT_ROLE",
      "roleId": "bearer-unit",
      "targetBinding": null,
      "presentation": "STRUCTURALLY_SUPPORTED_NOT_PRESENTED",
      "unknownReason": null
    }
  ],
  "unknownReason": null
}
```

Доказательства producer: [books/chaos-space-marines/v2/build.py:368](../../books/chaos-space-marines/v2/build.py#L368); [books/chaos-space-marines/v2/roster-effect-build.mjs:22](../../books/chaos-space-marines/v2/roster-effect-build.mjs#L22); [books/chaos-space-marines/v2/roster-effect-build.mjs:86](../../books/chaos-space-marines/v2/roster-effect-build.mjs#L86); [books/chaos-space-marines/v2/roster-effect-build.mjs:171](../../books/chaos-space-marines/v2/roster-effect-build.mjs#L171). Путь исходной runtime-записи: [books/chaos-space-marines/v2/generated/roster-runtime.json](../../books/chaos-space-marines/v2/generated/roster-runtime.json) `/entities/506`.

Ограничение: Физический roster/instance и battle context здесь не инстанцированы; это статическая связь, не UI-наблюдение. Другие пункты этого владельца: `charge-roll-clause`, `source-clause`.

#### chaos-space-marines / `detachment-creations-of-bile:rule`

```json
{
  "bookId": "chaos-space-marines",
  "entityId": "detachment-creations-of-bile:rule",
  "clauseId": "source-clause-1-1",
  "sourceId": "detachment-creations-of-bile:rule",
  "sourcePaths": [
    {
      "path": "books/chaos-space-marines/sources/waha-11e-current-2026-09-29/chaos-space-marines.html",
      "status": "RESOLVED"
    }
  ],
  "sourceFields": [
    [
      "content",
      0,
      "text"
    ]
  ],
  "quote": "At the start of the battle, select which augmentations are active for HERETIC ASTARTES INFANTRY models (excluding DAMNED models) from your army until the end of",
  "rosterClassification": "BATTLE_ONLY",
  "status": "EXPLICIT",
  "f4Category": null,
  "recipientPaths": [
    {
      "pathId": "ROLE:000",
      "channel": "ROLE",
      "status": "EXPLICIT",
      "relation": "DECLARED_ROSTER_MODELS_ROLE",
      "roleId": "recipient",
      "targetBinding": null,
      "presentation": "CURRENTLY_PRESENTED",
      "unknownReason": null
    }
  ],
  "unknownReason": null
}
```

Доказательства producer: [books/chaos-space-marines/v2/build.py:368](../../books/chaos-space-marines/v2/build.py#L368); [books/chaos-space-marines/v2/roster-effect-build.mjs:22](../../books/chaos-space-marines/v2/roster-effect-build.mjs#L22); [books/chaos-space-marines/v2/roster-effect-build.mjs:86](../../books/chaos-space-marines/v2/roster-effect-build.mjs#L86); [books/chaos-space-marines/v2/roster-effect-build.mjs:171](../../books/chaos-space-marines/v2/roster-effect-build.mjs#L171). Путь исходной runtime-записи: [books/chaos-space-marines/v2/generated/roster-runtime.json](../../books/chaos-space-marines/v2/generated/roster-runtime.json) `/entities/15`.

Ограничение: Физический roster/instance и battle context здесь не инстанцированы; это статическая связь, не UI-наблюдение. Другие пункты этого владельца: `source-clause-1-1`, `table-2-row-1`, `table-2-row-2`, `table-2-row-3`, `table-2-row-4`, `table-2-row-5`, `table-2-row-6`.

#### chaos-space-marines / `detachment-pactbound-zealots:rule`

```json
{
  "bookId": "chaos-space-marines",
  "entityId": "detachment-pactbound-zealots:rule",
  "clauseId": "dark-pact-phase-effects",
  "sourceId": "detachment-pactbound-zealots:rule",
  "sourcePaths": [
    {
      "path": "books/chaos-space-marines/sources/waha-11e-current-2026-09-29/chaos-space-marines.html",
      "status": "RESOLVED"
    },
    {
      "path": "books/chaos-space-marines/v2/sources/chaos-space-marines-faction-pack-v1.3.pdf",
      "status": "RESOLVED"
    }
  ],
  "sourceFields": [
    [
      "content",
      0,
      "text"
    ]
  ],
  "quote": "Each time a unit with one of these keywords gains a weapon ability as the result of a Dark Pact and does not fail the resulting Leadership test, until the end o",
  "rosterClassification": "BATTLE_ONLY",
  "status": "EXPLICIT",
  "f4Category": null,
  "recipientPaths": [
    {
      "pathId": "ROLE:000",
      "channel": "ROLE",
      "status": "EXPLICIT",
      "relation": "DECLARED_ROSTER_UNITS_ROLE",
      "roleId": "recipient",
      "targetBinding": null,
      "presentation": "CURRENTLY_PRESENTED",
      "unknownReason": null
    }
  ],
  "unknownReason": null
}
```

Доказательства producer: [books/chaos-space-marines/v2/build.py:368](../../books/chaos-space-marines/v2/build.py#L368); [books/chaos-space-marines/v2/roster-effect-build.mjs:22](../../books/chaos-space-marines/v2/roster-effect-build.mjs#L22); [books/chaos-space-marines/v2/roster-effect-build.mjs:86](../../books/chaos-space-marines/v2/roster-effect-build.mjs#L86); [books/chaos-space-marines/v2/roster-effect-build.mjs:171](../../books/chaos-space-marines/v2/roster-effect-build.mjs#L171). Путь исходной runtime-записи: [books/chaos-space-marines/v2/generated/roster-runtime.json](../../books/chaos-space-marines/v2/generated/roster-runtime.json) `/entities/3`.

Ограничение: Физический roster/instance и battle context здесь не инстанцированы; это статическая связь, не UI-наблюдение. Другие пункты этого владельца: `dark-pact-phase-effects`, `source-clause-1-1`, `source-clause-1-10`, `source-clause-1-11`, `source-clause-1-12`, `source-clause-1-13`, `source-clause-1-2`, `source-clause-1-3`, `source-clause-1-4`, `source-clause-1-5`, `source-clause-1-6`, `source-clause-1-7`, `source-clause-1-8`, `source-clause-1-9`.

#### chaos-space-marines / `detachment-renegade-warband:enhancement:4`

```json
{
  "bookId": "chaos-space-marines",
  "entityId": "detachment-renegade-warband:enhancement:4",
  "clauseId": "battle-clause-1",
  "sourceId": "detachment-renegade-warband:enhancement:4",
  "sourcePaths": [
    {
      "path": "books/chaos-space-marines/sources/waha-11e-current-2026-09-29/chaos-space-marines.html",
      "status": "RESOLVED"
    }
  ],
  "sourceFields": [
    [
      "text"
    ]
  ],
  "quote": "Add 1 to Advance and Charge rolls made for the bearer’s unit.",
  "rosterClassification": "DISPLAY_ONLY",
  "status": "EXPLICIT",
  "f4Category": "B",
  "recipientPaths": [
    {
      "pathId": "ROLE:000",
      "channel": "ROLE",
      "status": "EXPLICIT",
      "relation": "DECLARED_SOURCE_UNIT_ROLE",
      "roleId": "bearer-unit",
      "targetBinding": null,
      "presentation": "STRUCTURALLY_SUPPORTED_NOT_PRESENTED",
      "unknownReason": null
    }
  ],
  "unknownReason": null
}
```

Доказательства producer: [books/chaos-space-marines/v2/build.py:368](../../books/chaos-space-marines/v2/build.py#L368); [books/chaos-space-marines/v2/roster-effect-build.mjs:22](../../books/chaos-space-marines/v2/roster-effect-build.mjs#L22); [books/chaos-space-marines/v2/roster-effect-build.mjs:86](../../books/chaos-space-marines/v2/roster-effect-build.mjs#L86); [books/chaos-space-marines/v2/roster-effect-build.mjs:171](../../books/chaos-space-marines/v2/roster-effect-build.mjs#L171). Путь исходной runtime-записи: [books/chaos-space-marines/v2/generated/roster-runtime.json](../../books/chaos-space-marines/v2/generated/roster-runtime.json) `/entities/132`.

Ограничение: Физический roster/instance и battle context здесь не инстанцированы; это статическая связь, не UI-наблюдение. Другие пункты этого владельца: `battle-clause-1`, `charge-roll-clause`.

#### dark-angels / `ability-da-490661bbb1ff4d45a4b8`

```json
{
  "bookId": "dark-angels",
  "entityId": "ability-da-490661bbb1ff4d45a4b8",
  "clauseId": "review/ability-da-490661bbb1ff4d45a4b8/text/0:111",
  "sourceId": "dark-angels-waha-11e-2026-10-21",
  "sourcePaths": [
    {
      "path": "books/dark-angels/v2/sources/raw/wahapedia-datasheets.html",
      "status": "RESOLVED"
    }
  ],
  "sourceFields": [
    [
      "text"
    ]
  ],
  "quote": "The Emperor's Shield: Attacks that target this unit with a S greater than this unit’s T have -1 to wound rolls.",
  "rosterClassification": "DISPLAY_ONLY",
  "status": "EXPLICIT",
  "f4Category": null,
  "recipientPaths": [
    {
      "pathId": "POLICY:000",
      "channel": "POLICY",
      "status": "EXPLICIT",
      "relation": "FORMED_UNIT",
      "roleId": null,
      "targetBinding": null,
      "presentation": "CURRENTLY_PRESENTED",
      "unknownReason": null
    }
  ],
  "unknownReason": null
}
```

Доказательства producer: [books/dark-angels/v2/app-build.mjs:16](../../books/dark-angels/v2/app-build.mjs#L16); [books/dark-angels/v2/book-build.mjs:19](../../books/dark-angels/v2/book-build.mjs#L19); [books/dark-angels/v2/book-build.mjs:21](../../books/dark-angels/v2/book-build.mjs#L21); [books/dark-angels/v2/build.py:177](../../books/dark-angels/v2/build.py#L177). Путь исходной runtime-записи: [books/dark-angels/v2/generated/roster-import.json](../../books/dark-angels/v2/generated/roster-import.json) `/entities/9`.

Ограничение: Физический roster/instance и battle context здесь не инстанцированы; это статическая связь, не UI-наблюдение. Другие пункты этого владельца: `review/ability-da-490661bbb1ff4d45a4b8/text/0:111`.

#### dark-angels / `ability-da-4c9ca538c02844aa9c2a`

```json
{
  "bookId": "dark-angels",
  "entityId": "ability-da-4c9ca538c02844aa9c2a",
  "clauseId": "review/ability-da-4c9ca538c02844aa9c2a/text/56:68",
  "sourceId": "dark-angels-waha-11e-2026-10-21",
  "sourcePaths": [
    {
      "path": "books/dark-angels/v2/sources/raw/wahapedia-datasheets.html",
      "status": "RESOLVED"
    }
  ],
  "sourceFields": [
    [
      "text"
    ]
  ],
  "quote": "- BS and WS.",
  "rosterClassification": "DISPLAY_ONLY",
  "status": "EXPLICIT",
  "f4Category": null,
  "recipientPaths": [
    {
      "pathId": "POLICY:000",
      "channel": "POLICY",
      "status": "EXPLICIT",
      "relation": "FORMED_UNIT",
      "roleId": null,
      "targetBinding": null,
      "presentation": "CURRENTLY_PRESENTED",
      "unknownReason": null
    }
  ],
  "unknownReason": null
}
```

Доказательства producer: [books/dark-angels/v2/app-build.mjs:16](../../books/dark-angels/v2/app-build.mjs#L16); [books/dark-angels/v2/book-build.mjs:19](../../books/dark-angels/v2/book-build.mjs#L19); [books/dark-angels/v2/book-build.mjs:21](../../books/dark-angels/v2/book-build.mjs#L21); [books/dark-angels/v2/build.py:177](../../books/dark-angels/v2/build.py#L177). Путь исходной runtime-записи: [books/dark-angels/v2/generated/roster-import.json](../../books/dark-angels/v2/generated/roster-import.json) `/entities/10`.

Ограничение: Физический roster/instance и battle context здесь не инстанцированы; это статическая связь, не UI-наблюдение. Другие пункты этого владельца: `review/ability-da-4c9ca538c02844aa9c2a/text/56:68`, `review/ability-da-4c9ca538c02844aa9c2a/text/69:81`.

#### dark-angels / `ability-da-4d1396f4342347baa772`

```json
{
  "bookId": "dark-angels",
  "entityId": "ability-da-4d1396f4342347baa772",
  "clauseId": "astartes-banner",
  "sourceId": "dark-angels-waha-11e-2026-10-21",
  "sourcePaths": [
    {
      "path": "books/dark-angels/v2/sources/raw/wahapedia-datasheets.html",
      "status": "RESOLVED"
    }
  ],
  "sourceFields": [
    [
      "text"
    ]
  ],
  "quote": "Astartes Banner: While this unit contains a RAVENWING ANCIENT, this unit has +1 OC.",
  "rosterClassification": "ROSTER_EXECUTABLE",
  "status": "EXPLICIT",
  "f4Category": "A",
  "recipientPaths": [
    {
      "pathId": "EFFECT:000",
      "channel": "EFFECT",
      "status": "EXPLICIT",
      "relation": "FORMED_SOURCE_UNIT_MODELS",
      "roleId": null,
      "targetBinding": "SOURCE_FORMED_MODELS",
      "presentation": "CURRENTLY_PRESENTED",
      "unknownReason": null
    },
    {
      "pathId": "EFFECT:001",
      "channel": "EFFECT",
      "status": "OWNER_ONLY",
      "relation": "PHYSICAL_SOURCE_UNIT_MODELS",
      "roleId": null,
      "targetBinding": "SOURCE_UNIT_MODELS",
      "presentation": "CURRENTLY_PRESENTED",
      "unknownReason": null
    }
  ],
  "unknownReason": null
}
```

Доказательства producer: [books/dark-angels/v2/app-build.mjs:16](../../books/dark-angels/v2/app-build.mjs#L16); [books/dark-angels/v2/book-build.mjs:19](../../books/dark-angels/v2/book-build.mjs#L19); [books/dark-angels/v2/book-build.mjs:21](../../books/dark-angels/v2/book-build.mjs#L21); [books/dark-angels/v2/build.py:177](../../books/dark-angels/v2/build.py#L177). Путь исходной runtime-записи: [books/dark-angels/v2/generated/roster-import.json](../../books/dark-angels/v2/generated/roster-import.json) `/entities/12`.

Ограничение: Физический roster/instance и battle context здесь не инстанцированы; это статическая связь, не UI-наблюдение. Другие пункты этого владельца: `astartes-banner`.

#### dark-angels / `ability-da-594a7ae294c948b39173`

```json
{
  "bookId": "dark-angels",
  "entityId": "ability-da-594a7ae294c948b39173",
  "clauseId": "book-of-salvation",
  "sourceId": "dark-angels-waha-11e-2026-10-21",
  "sourcePaths": [
    {
      "path": "books/dark-angels/v2/sources/raw/wahapedia-datasheets.html",
      "status": "RESOLVED"
    }
  ],
  "sourceFields": [
    [
      "text"
    ]
  ],
  "quote": "Book of Salvation: This unit’s melee attacks have +1 A.",
  "rosterClassification": "ROSTER_EXECUTABLE",
  "status": "EXPLICIT",
  "f4Category": "A",
  "recipientPaths": [
    {
      "pathId": "EFFECT:000",
      "channel": "EFFECT",
      "status": "EXPLICIT",
      "relation": "UNIT_EFFECT_FORMED_IF_ATTACHED",
      "roleId": null,
      "targetBinding": "SOURCE_UNIT",
      "presentation": "CURRENTLY_PRESENTED",
      "unknownReason": null
    }
  ],
  "unknownReason": null
}
```

Доказательства producer: [books/dark-angels/v2/app-build.mjs:16](../../books/dark-angels/v2/app-build.mjs#L16); [books/dark-angels/v2/book-build.mjs:19](../../books/dark-angels/v2/book-build.mjs#L19); [books/dark-angels/v2/book-build.mjs:21](../../books/dark-angels/v2/book-build.mjs#L21); [books/dark-angels/v2/build.py:177](../../books/dark-angels/v2/build.py#L177). Путь исходной runtime-записи: [books/dark-angels/v2/generated/roster-import.json](../../books/dark-angels/v2/generated/roster-import.json) `/entities/15`.

Ограничение: Физический roster/instance и battle context здесь не инстанцированы; это статическая связь, не UI-наблюдение. Другие пункты этого владельца: `book-of-salvation`.

#### dark-angels / `army-rule-sm-940f2057cc7c4551`

```json
{
  "bookId": "dark-angels",
  "entityId": "army-rule-sm-940f2057cc7c4551",
  "clauseId": null,
  "sourceId": "space-marines-waha-11e-2026-10-20",
  "sourcePaths": [
    {
      "path": "books/space-marines/v2/sources/raw/wahapedia-space-marines-main.html",
      "status": "RESOLVED"
    }
  ],
  "sourceFields": [
    [
      "text"
    ]
  ],
  "quote": "Transhuman Strategist\nAt the start of the battle round, if a model with this ability is your WARLORD, gain 1CP.",
  "rosterClassification": null,
  "status": "UNKNOWN",
  "f4Category": null,
  "recipientPaths": [],
  "unknownReason": "No clause/contract in the actual execution artifact; source-only text is not a physical recipient declaration."
}
```

Доказательства producer: [books/dark-angels/v2/app-build.mjs:16](../../books/dark-angels/v2/app-build.mjs#L16); [books/dark-angels/v2/book-build.mjs:19](../../books/dark-angels/v2/book-build.mjs#L19); [books/dark-angels/v2/book-build.mjs:21](../../books/dark-angels/v2/book-build.mjs#L21); [books/dark-angels/v2/build.py:177](../../books/dark-angels/v2/build.py#L177). Путь исходной runtime-записи: [books/dark-angels/v2/generated/roster-import.json](../../books/dark-angels/v2/generated/roster-import.json) `/entities/159`.

Ограничение: No clause/contract in the actual execution artifact; source-only text is not a physical recipient declaration. Другие пункты этого владельца: `null`.

#### dark-angels / `army-rule-sm-a3907d06530b419a`

```json
{
  "bookId": "dark-angels",
  "entityId": "army-rule-sm-a3907d06530b419a",
  "clauseId": null,
  "sourceId": "space-marines-waha-11e-2026-10-20",
  "sourcePaths": [
    {
      "path": "books/space-marines/v2/sources/raw/wahapedia-space-marines-main.html",
      "status": "RESOLVED"
    }
  ],
  "sourceFields": [
    [
      "text"
    ]
  ],
  "quote": "Librarius\nADEPTUS ASTARTES PSYKER units with this ability have a psyker level of 1 or higher, specified in that unit’s abilities. Each psychic ability has a psy",
  "rosterClassification": null,
  "status": "UNKNOWN",
  "f4Category": null,
  "recipientPaths": [],
  "unknownReason": "No clause/contract in the actual execution artifact; source-only text is not a physical recipient declaration."
}
```

Доказательства producer: [books/dark-angels/v2/app-build.mjs:16](../../books/dark-angels/v2/app-build.mjs#L16); [books/dark-angels/v2/book-build.mjs:19](../../books/dark-angels/v2/book-build.mjs#L19); [books/dark-angels/v2/book-build.mjs:21](../../books/dark-angels/v2/book-build.mjs#L21); [books/dark-angels/v2/build.py:177](../../books/dark-angels/v2/build.py#L177). Путь исходной runtime-записи: [books/dark-angels/v2/generated/roster-import.json](../../books/dark-angels/v2/generated/roster-import.json) `/entities/160`.

Ограничение: No clause/contract in the actual execution artifact; source-only text is not a physical recipient declaration. Другие пункты этого владельца: `null`.

#### dark-angels / `army-rule-sm-fcdb8cd8bb5f40dd`

```json
{
  "bookId": "dark-angels",
  "entityId": "army-rule-sm-fcdb8cd8bb5f40dd",
  "clauseId": null,
  "sourceId": "space-marines-waha-11e-2026-10-20",
  "sourcePaths": [
    {
      "path": "books/space-marines/v2/sources/raw/wahapedia-space-marines-main.html",
      "status": "RESOLVED"
    }
  ],
  "sourceFields": [
    [
      "text"
    ]
  ],
  "quote": "Combat Doctrines\nAt the start of your Command phase, you can select one combat doctrine listed below. If you do, that combat doctrine is active for friendly ADE",
  "rosterClassification": null,
  "status": "UNKNOWN",
  "f4Category": null,
  "recipientPaths": [],
  "unknownReason": "No clause/contract in the actual execution artifact; source-only text is not a physical recipient declaration."
}
```

Доказательства producer: [books/dark-angels/v2/app-build.mjs:16](../../books/dark-angels/v2/app-build.mjs#L16); [books/dark-angels/v2/book-build.mjs:19](../../books/dark-angels/v2/book-build.mjs#L19); [books/dark-angels/v2/book-build.mjs:21](../../books/dark-angels/v2/book-build.mjs#L21); [books/dark-angels/v2/build.py:177](../../books/dark-angels/v2/build.py#L177). Путь исходной runtime-записи: [books/dark-angels/v2/generated/roster-import.json](../../books/dark-angels/v2/generated/roster-import.json) `/entities/161`.

Ограничение: No clause/contract in the actual execution artifact; source-only text is not a physical recipient declaration. Другие пункты этого владельца: `null`.

#### dark-angels / `detachment-rule-da-40ccb5dde8fa45a89798`

```json
{
  "bookId": "dark-angels",
  "entityId": "detachment-rule-da-40ccb5dde8fa45a89798",
  "clauseId": "review/detachment-rule-da-40ccb5dde8fa45a89798/text/146:279",
  "sourceId": "dark-angels-waha-11e-2026-10-21",
  "sourcePaths": [
    {
      "path": "books/dark-angels/v2/sources/raw/wahapedia-dark-angels-main.html",
      "status": "RESOLVED"
    }
  ],
  "sourceFields": [
    [
      "text"
    ]
  ],
  "quote": "Restrictions: Your army can include DARK ANGELS units, but it cannot include any ADEPTUS ASTARTES units drawn from any other Chapter.",
  "rosterClassification": "DISPLAY_ONLY",
  "status": "UNKNOWN",
  "f4Category": null,
  "recipientPaths": [],
  "unknownReason": "Source ownership/participation is recorded, but a receiver-to-source relationship is not proven."
}
```

Доказательства producer: [books/dark-angels/v2/app-build.mjs:16](../../books/dark-angels/v2/app-build.mjs#L16); [books/dark-angels/v2/book-build.mjs:19](../../books/dark-angels/v2/book-build.mjs#L19); [books/dark-angels/v2/book-build.mjs:21](../../books/dark-angels/v2/book-build.mjs#L21); [books/dark-angels/v2/build.py:177](../../books/dark-angels/v2/build.py#L177). Путь исходной runtime-записи: [books/dark-angels/v2/generated/roster-import.json](../../books/dark-angels/v2/generated/roster-import.json) `/entities/278`.

Ограничение: Source ownership/participation is recorded, but a receiver-to-source relationship is not proven. Другие пункты этого владельца: `review/detachment-rule-da-40ccb5dde8fa45a89798/text/146:279`, `review/detachment-rule-da-40ccb5dde8fa45a89798/text/17:145`.

#### dark-angels / `detachment-rule-dw-b41deacc51464866`

```json
{
  "bookId": "dark-angels",
  "entityId": "detachment-rule-dw-b41deacc51464866",
  "clauseId": null,
  "sourceId": "space-marines-waha-11e-2026-10-20",
  "sourcePaths": [
    {
      "path": "books/space-marines/v2/sources/raw/wahapedia-space-marines-main.html",
      "status": "RESOLVED"
    }
  ],
  "sourceFields": [
    [
      "text"
    ]
  ],
  "quote": "Mission Tactics\nFriendly KILL TEAM units with this ability have the following abilities:\nFuror Tactics\nIf the devastator doctrine is active for your unit, your ",
  "rosterClassification": null,
  "status": "UNKNOWN",
  "f4Category": null,
  "recipientPaths": [],
  "unknownReason": "No clause/contract in the actual execution artifact; source-only text is not a physical recipient declaration."
}
```

Доказательства producer: [books/dark-angels/v2/app-build.mjs:16](../../books/dark-angels/v2/app-build.mjs#L16); [books/dark-angels/v2/book-build.mjs:19](../../books/dark-angels/v2/book-build.mjs#L19); [books/dark-angels/v2/book-build.mjs:21](../../books/dark-angels/v2/book-build.mjs#L21); [books/dark-angels/v2/build.py:177](../../books/dark-angels/v2/build.py#L177). Путь исходной runtime-записи: [books/dark-angels/v2/generated/roster-import.json](../../books/dark-angels/v2/generated/roster-import.json) `/entities/1640`.

Ограничение: No clause/contract in the actual execution artifact; source-only text is not a physical recipient declaration. Другие пункты этого владельца: `null`.

#### death-guard / `datasheet-deathshroud-terminators:section:1`

```json
{
  "bookId": "death-guard",
  "entityId": "datasheet-deathshroud-terminators:section:1",
  "clauseId": "source-clause-1",
  "sourceId": "dg-waha-2026-09-25",
  "sourcePaths": [
    {
      "path": "books/death-guard/sources/waha-11e-current-2026-09-25/corpus.json",
      "status": "RESOLVED"
    }
  ],
  "sourceFields": [
    [
      "blocks",
      0
    ]
  ],
  "quote": "",
  "rosterClassification": "ROSTER_EXECUTABLE",
  "status": "EXPLICIT",
  "f4Category": "C",
  "recipientPaths": [
    {
      "pathId": "EFFECT:000",
      "channel": "EFFECT",
      "status": "EXPLICIT",
      "relation": "ATTACHED_LEADERS_MODELS",
      "roleId": null,
      "targetBinding": "LEADERS_OF_SOURCE",
      "presentation": "CURRENTLY_PRESENTED",
      "unknownReason": null
    },
    {
      "pathId": "ROLE:001",
      "channel": "ROLE",
      "status": "IMPLICIT_CANDIDATE",
      "relation": "UNKNOWN",
      "roleId": "datasheet-owner",
      "targetBinding": null,
      "presentation": "STRUCTURALLY_SUPPORTED_NOT_PRESENTED",
      "unknownReason": "Contract-level applicability role is not an explicit edge from this clause to that recipient."
    }
  ],
  "unknownReason": null
}
```

Доказательства producer: [books/death-guard/v2/app-build.mjs:16](../../books/death-guard/v2/app-build.mjs#L16); [books/death-guard/v2/build.mjs:20](../../books/death-guard/v2/build.mjs#L20); [books/death-guard/v2/build.mjs:39](../../books/death-guard/v2/build.mjs#L39); [books/death-guard/v2/build.mjs:46](../../books/death-guard/v2/build.mjs#L46). Путь исходной runtime-записи: [books/death-guard/v2/generated/rule-contract-effective.json](../../books/death-guard/v2/generated/rule-contract-effective.json) `/entities/131`.

Ограничение: Физический roster/instance и battle context здесь не инстанцированы; это статическая связь, не UI-наблюдение. Другие пункты этого владельца: `source-clause-1`, `source-clause-2`, `source-clause-3`.

#### death-guard / `datasheet-lord-of-contagion:section:1`

```json
{
  "bookId": "death-guard",
  "entityId": "datasheet-lord-of-contagion:section:1",
  "clauseId": "source-clause-1",
  "sourceId": "dg-waha-2026-09-25",
  "sourcePaths": [
    {
      "path": "books/death-guard/sources/waha-11e-current-2026-09-25/corpus.json",
      "status": "RESOLVED"
    }
  ],
  "sourceFields": [
    [
      "blocks",
      0
    ]
  ],
  "quote": "",
  "rosterClassification": "ROSTER_EXECUTABLE",
  "status": "EXPLICIT",
  "f4Category": "C",
  "recipientPaths": [
    {
      "pathId": "EFFECT:000",
      "channel": "EFFECT",
      "status": "EXPLICIT",
      "relation": "FORMED_SOURCE_UNIT_MODELS",
      "roleId": null,
      "targetBinding": "SOURCE_FORMED_MODELS",
      "presentation": "CURRENTLY_PRESENTED",
      "unknownReason": null
    },
    {
      "pathId": "EFFECT:001",
      "channel": "EFFECT",
      "status": "EXPLICIT",
      "relation": "FORMED_SOURCE_UNIT_MODELS",
      "roleId": null,
      "targetBinding": "SOURCE_FORMED_MODELS",
      "presentation": "CURRENTLY_PRESENTED",
      "unknownReason": null
    },
    {
      "pathId": "ROLE:002",
      "channel": "ROLE",
      "status": "IMPLICIT_CANDIDATE",
      "relation": "UNKNOWN",
      "roleId": "datasheet-owner",
      "targetBinding": null,
      "presentation": "STRUCTURALLY_SUPPORTED_NOT_PRESENTED",
      "unknownReason": "Contract-level applicability role is not an explicit edge from this clause to that recipient."
    }
  ],
  "unknownReason": null
}
```

Доказательства producer: [books/death-guard/v2/app-build.mjs:16](../../books/death-guard/v2/app-build.mjs#L16); [books/death-guard/v2/build.mjs:20](../../books/death-guard/v2/build.mjs#L20); [books/death-guard/v2/build.mjs:39](../../books/death-guard/v2/build.mjs#L39); [books/death-guard/v2/build.mjs:46](../../books/death-guard/v2/build.mjs#L46). Путь исходной runtime-записи: [books/death-guard/v2/generated/rule-contract-effective.json](../../books/death-guard/v2/generated/rule-contract-effective.json) `/entities/238`.

Ограничение: Физический roster/instance и battle context здесь не инстанцированы; это статическая связь, не UI-наблюдение. Другие пункты этого владельца: `source-clause-1`, `source-clause-2`.

#### death-guard / `detachment-flyblown-host:rule`

```json
{
  "bookId": "death-guard",
  "entityId": "detachment-flyblown-host:rule",
  "clauseId": "exclusive-detachment",
  "sourceId": "dg-waha-2026-09-25",
  "sourcePaths": [
    {
      "path": "books/death-guard/sources/waha-11e-current-2026-09-25/corpus.json",
      "status": "RESOLVED"
    }
  ],
  "sourceFields": [
    [
      "text"
    ]
  ],
  "quote": "In the Declare Battle Formations step, you can select up to two friendly PLAGUE MARINES units. Those units have Infiltrators.\nThis detachment has the FLYBLOWN t",
  "rosterClassification": "NOT_AN_EFFECT",
  "status": "UNKNOWN",
  "f4Category": null,
  "recipientPaths": [
    {
      "pathId": "ROLE:000",
      "channel": "ROLE",
      "status": "UNKNOWN",
      "relation": "ROSTER_CONTEXT",
      "roleId": "eligible-owner",
      "targetBinding": null,
      "presentation": "UNKNOWN",
      "unknownReason": "No explicit recipient purpose, relation binding, or nontrivial source-qualified selector; ALWAYS is not recipient proof."
    }
  ],
  "unknownReason": "Source ownership/participation is recorded, but a receiver-to-source relationship is not proven."
}
```

Доказательства producer: [books/death-guard/v2/app-build.mjs:16](../../books/death-guard/v2/app-build.mjs#L16); [books/death-guard/v2/build.mjs:20](../../books/death-guard/v2/build.mjs#L20); [books/death-guard/v2/build.mjs:39](../../books/death-guard/v2/build.mjs#L39); [books/death-guard/v2/build.mjs:46](../../books/death-guard/v2/build.mjs#L46). Путь исходной runtime-записи: [books/death-guard/v2/generated/rule-contract-effective.json](../../books/death-guard/v2/generated/rule-contract-effective.json) `/entities/525`.

Ограничение: Source ownership/participation is recorded, but a receiver-to-source relationship is not proven. Другие пункты этого владельца: `exclusive-detachment`, `selected-infiltrators`.

#### death-guard / `detachment-virulent-vectorium:enhancement:3`

```json
{
  "bookId": "death-guard",
  "entityId": "detachment-virulent-vectorium:enhancement:3",
  "clauseId": "attack-reroll",
  "sourceId": "dg-waha-2026-09-25",
  "sourcePaths": [
    {
      "path": "books/death-guard/sources/waha-11e-current-2026-09-25/corpus.json",
      "status": "RESOLVED"
    }
  ],
  "sourceFields": [
    [
      "text"
    ]
  ],
  "quote": "DEATH GUARD model only. While the bearer’s unit is within range of an objective marker you control, each time a model in the bearer’s unit makes an attack, you ",
  "rosterClassification": "BATTLE_ONLY",
  "status": "UNKNOWN",
  "f4Category": "E",
  "recipientPaths": [
    {
      "pathId": "ROLE:000",
      "channel": "ROLE",
      "status": "UNKNOWN",
      "relation": "UNKNOWN",
      "roleId": "affected-unit",
      "targetBinding": null,
      "presentation": "UNKNOWN",
      "unknownReason": "No explicit recipient purpose, relation binding, or nontrivial source-qualified selector; ALWAYS is not recipient proof."
    }
  ],
  "unknownReason": "Source ownership/participation is recorded, but a receiver-to-source relationship is not proven."
}
```

Доказательства producer: [books/death-guard/v2/app-build.mjs:16](../../books/death-guard/v2/app-build.mjs#L16); [books/death-guard/v2/build.mjs:20](../../books/death-guard/v2/build.mjs#L20); [books/death-guard/v2/build.mjs:39](../../books/death-guard/v2/build.mjs#L39); [books/death-guard/v2/build.mjs:46](../../books/death-guard/v2/build.mjs#L46). Путь исходной runtime-записи: [books/death-guard/v2/generated/rule-contract-effective.json](../../books/death-guard/v2/generated/rule-contract-effective.json) `/entities/442`.

Ограничение: Source ownership/participation is recorded, but a receiver-to-source relationship is not proven. Другие пункты этого владельца: `attack-reroll`.

#### emperors-children / `datasheet-lord-exultant:section:1`

```json
{
  "bookId": "emperors-children",
  "entityId": "datasheet-lord-exultant:section:1",
  "clauseId": "roster-known",
  "sourceId": "ec-waha-11e-2026-09-28",
  "sourcePaths": [
    {
      "path": "books/emperors-children/sources/waha-11e-current-2026-09-28/Lord-Exultant.html",
      "status": "RESOLVED"
    },
    {
      "path": "books/emperors-children/sources/waha-11e-current-2026-09-28/corpus.json",
      "status": "RESOLVED"
    }
  ],
  "sourceFields": [
    [
      "blocks",
      0,
      "text"
    ]
  ],
  "quote": "Perfectionists: While this model is leading a unit, weapons equipped by models in that unit have the [LETHAL HITS] ability.",
  "rosterClassification": "ROSTER_EXECUTABLE",
  "status": "EXPLICIT",
  "f4Category": "C",
  "recipientPaths": [
    {
      "pathId": "EFFECT:000",
      "channel": "EFFECT",
      "status": "EXPLICIT",
      "relation": "FORMED_SOURCE_UNIT_MODELS",
      "roleId": null,
      "targetBinding": "SOURCE_FORMED_MODELS",
      "presentation": "CURRENTLY_PRESENTED",
      "unknownReason": null
    },
    {
      "pathId": "ROLE:001",
      "channel": "ROLE",
      "status": "EXPLICIT",
      "relation": "DECLARED_SOURCE_FORMED_MODELS_ROLE",
      "roleId": "recipient",
      "targetBinding": null,
      "presentation": "STRUCTURALLY_SUPPORTED_NOT_PRESENTED",
      "unknownReason": null
    }
  ],
  "unknownReason": null
}
```

Доказательства producer: [books/emperors-children/v2/app-build.mjs:44](../../books/emperors-children/v2/app-build.mjs#L44); [books/emperors-children/v2/build.py:238](../../books/emperors-children/v2/build.py#L238); [books/emperors-children/v2/build.py:267](../../books/emperors-children/v2/build.py#L267); [books/emperors-children/v2/build.py:275](../../books/emperors-children/v2/build.py#L275). Путь исходной runtime-записи: [books/emperors-children/v2/generated/roster-attachments.json](../../books/emperors-children/v2/generated/roster-attachments.json) `/entities/255`.

Ограничение: Физический roster/instance и battle context здесь не инстанцированы; это статическая связь, не UI-наблюдение. Другие пункты этого владельца: `roster-known`.

#### emperors-children / `datasheet-lord-exultant:section:4`

```json
{
  "bookId": "emperors-children",
  "entityId": "datasheet-lord-exultant:section:4",
  "clauseId": "source-effect-1",
  "sourceId": "ec-waha-11e-2026-09-28",
  "sourcePaths": [
    {
      "path": "books/emperors-children/sources/waha-11e-current-2026-09-28/Lord-Exultant.html",
      "status": "RESOLVED"
    },
    {
      "path": "books/emperors-children/sources/waha-11e-current-2026-09-28/corpus.json",
      "status": "RESOLVED"
    }
  ],
  "sourceFields": [
    [
      "blocks",
      0,
      "text"
    ]
  ],
  "quote": "If this model is attached to an EMPEROR’S CHILDREN BATTLELINE unit during the Declare Battle Formations step, this model has the Infiltrators and Scouts 6\" abil",
  "rosterClassification": "ROSTER_EXECUTABLE",
  "status": "EXPLICIT",
  "f4Category": "C",
  "recipientPaths": [
    {
      "pathId": "EFFECT:000",
      "channel": "EFFECT",
      "status": "OWNER_ONLY",
      "relation": "PHYSICAL_SOURCE_UNIT_MODELS",
      "roleId": null,
      "targetBinding": "SOURCE_MODEL",
      "presentation": "CURRENTLY_PRESENTED",
      "unknownReason": null
    },
    {
      "pathId": "ROLE:001",
      "channel": "ROLE",
      "status": "EXPLICIT",
      "relation": "DECLARED_SOURCE_MODEL_ROLE",
      "roleId": "recipient-1",
      "targetBinding": null,
      "presentation": "STRUCTURALLY_SUPPORTED_NOT_PRESENTED",
      "unknownReason": null
    },
    {
      "pathId": "ROLE:002",
      "channel": "ROLE",
      "status": "IMPLICIT_CANDIDATE",
      "relation": "DECLARED_SOURCE_MODEL_ROLE",
      "roleId": "recipient-2",
      "targetBinding": null,
      "presentation": "STRUCTURALLY_SUPPORTED_NOT_PRESENTED",
      "unknownReason": "Contract-level applicability role is not an explicit edge from this clause to that recipient."
    }
  ],
  "unknownReason": null
}
```

Доказательства producer: [books/emperors-children/v2/app-build.mjs:44](../../books/emperors-children/v2/app-build.mjs#L44); [books/emperors-children/v2/build.py:238](../../books/emperors-children/v2/build.py#L238); [books/emperors-children/v2/build.py:267](../../books/emperors-children/v2/build.py#L267); [books/emperors-children/v2/build.py:275](../../books/emperors-children/v2/build.py#L275). Путь исходной runtime-записи: [books/emperors-children/v2/generated/roster-attachments.json](../../books/emperors-children/v2/generated/roster-attachments.json) `/entities/258`.

Ограничение: Физический roster/instance и battle context здесь не инстанцированы; это статическая связь, не UI-наблюдение. Другие пункты этого владельца: `source-effect-1`, `source-effect-2`.

#### emperors-children / `detachment-carnival-of-excess:enhancement:3`

```json
{
  "bookId": "emperors-children",
  "entityId": "detachment-carnival-of-excess:enhancement:3",
  "clauseId": "selected-weapon",
  "sourceId": "ec-waha-11e-2026-09-28",
  "sourcePaths": [
    {
      "path": "books/emperors-children/sources/waha-11e-current-2026-09-28/corpus.json",
      "status": "RESOLVED"
    },
    {
      "path": "books/emperors-children/sources/waha-11e-current-2026-09-28/emperor-s-children.html",
      "status": "RESOLVED"
    }
  ],
  "sourceFields": [
    [
      "text"
    ]
  ],
  "quote": "EMPEROR’S CHILDREN model only. At the start of the battle, select one melee weapon equipped by the bearer; add 1 to the Attacks characteristic of that weapon. I",
  "rosterClassification": "ROSTER_EXECUTABLE",
  "status": "EXPLICIT",
  "f4Category": "C",
  "recipientPaths": [
    {
      "pathId": "EFFECT:000",
      "channel": "EFFECT",
      "status": "OWNER_ONLY",
      "relation": "BEARER_MODEL",
      "roleId": null,
      "targetBinding": "SOURCE_MODEL",
      "presentation": "CURRENTLY_PRESENTED",
      "unknownReason": null
    },
    {
      "pathId": "EFFECT:001",
      "channel": "EFFECT",
      "status": "OWNER_ONLY",
      "relation": "BEARER_MODEL",
      "roleId": null,
      "targetBinding": "SOURCE_MODEL",
      "presentation": "CURRENTLY_PRESENTED",
      "unknownReason": null
    },
    {
      "pathId": "EFFECT:002",
      "channel": "EFFECT",
      "status": "OWNER_ONLY",
      "relation": "BEARER_MODEL",
      "roleId": null,
      "targetBinding": "SOURCE_MODEL",
      "presentation": "CURRENTLY_PRESENTED",
      "unknownReason": null
    },
    {
      "pathId": "EFFECT:003",
      "channel": "EFFECT",
      "status": "OWNER_ONLY",
      "relation": "BEARER_MODEL",
      "roleId": null,
      "targetBinding": "SOURCE_MODEL",
      "presentation": "CURRENTLY_PRESENTED",
      "unknownReason": null
    },
    {
      "pathId": "EFFECT:004",
      "channel": "EFFECT",
      "status": "OWNER_ONLY",
      "relation": "BEARER_MODEL",
      "roleId": null,
      "targetBinding": "SOURCE_MODEL",
      "presentation": "CURRENTLY_PRESENTED",
      "unknownReason": null
    },
    {
      "pathId": "EFFECT:005",
      "channel": "EFFECT",
      "status": "OWNER_ONLY",
      "relation": "BEARER_MODEL",
      "roleId": null,
      "targetBinding": "SOURCE_MODEL",
      "presentation": "CURRENTLY_PRESENTED",
      "unknownReason": null
    },
    {
      "pathId": "EFFECT:006",
      "channel": "EFFECT",
      "status": "OWNER_ONLY",
      "relation": "BEARER_MODEL",
      "roleId": null,
      "targetBinding": "SOURCE_MODEL",
      "presentation": "CURRENTLY_PRESENTED",
      "unknownReason": null
    },
    {
      "pathId": "EFFECT:007",
      "channel": "EFFECT",
      "status": "OWNER_ONLY",
      "relation": "BEARER_MODEL",
      "roleId": null,
      "targetBinding": "SOURCE_MODEL",
      "presentation": "CURRENTLY_PRESENTED",
      "unknownReason": null
    },
    {
      "pathId": "EFFECT:008",
      "channel": "EFFECT",
      "status": "OWNER_ONLY",
      "relation": "BEARER_MODEL",
      "roleId": null,
      "targetBinding": "SOURCE_MODEL",
      "presentation": "CURRENTLY_PRESENTED",
      "unknownReason": null
    },
    {
      "pathId": "EFFECT:009",
      "channel": "EFFECT",
      "status": "OWNER_ONLY",
      "relation": "BEARER_MODEL",
      "roleId": null,
      "targetBinding": "SOURCE_MODEL",
      "presentation": "CURRENTLY_PRESENTED",
      "unknownReason": null
    },
    {
      "pathId": "EFFECT:010",
      "channel": "EFFECT",
      "status": "OWNER_ONLY",
      "relation": "BEARER_MODEL",
      "roleId": null,
      "targetBinding": "SOURCE_MODEL",
      "presentation": "CURRENTLY_PRESENTED",
      "unknownReason": null
    },
    {
      "pathId": "EFFECT:011",
      "channel": "EFFECT",
      "status": "OWNER_ONLY",
      "relation": "BEARER_MODEL",
      "roleId": null,
      "targetBinding": "SOURCE_MODEL",
      "presentation": "CURRENTLY_PRESENTED",
      "unknownReason": null
    },
    {
      "pathId": "EFFECT:012",
      "channel": "EFFECT",
      "status": "OWNER_ONLY",
      "relation": "BEARER_MODEL",
      "roleId": null,
      "targetBinding": "SOURCE_MODEL",
      "presentation": "CURRENTLY_PRESENTED",
      "unknownReason": null
    },
    {
      "pathId": "EFFECT:013",
      "channel": "EFFECT",
      "status": "OWNER_ONLY",
      "relation": "BEARER_MODEL",
      "roleId": null,
      "targetBinding": "SOURCE_MODEL",
      "presentation": "CURRENTLY_PRESENTED",
      "unknownReason": null
    },
    {
      "pathId": "EFFECT:014",
      "channel": "EFFECT",
      "status": "OWNER_ONLY",
      "relation": "BEARER_MODEL",
      "roleId": null,
      "targetBinding": "SOURCE_MODEL",
      "presentation": "CURRENTLY_PRESENTED",
      "unknownReason": null
    },
    {
      "pathId": "EFFECT:015",
      "channel": "EFFECT",
      "status": "OWNER_ONLY",
      "relation": "BEARER_MODEL",
      "roleId": null,
      "targetBinding": "SOURCE_MODEL",
      "presentation": "CURRENTLY_PRESENTED",
      "unknownReason": null
    },
    {
      "pathId": "EFFECT:016",
      "channel": "EFFECT",
      "status": "OWNER_ONLY",
      "relation": "BEARER_MODEL",
      "roleId": null,
      "targetBinding": "SOURCE_MODEL",
      "presentation": "CURRENTLY_PRESENTED",
      "unknownReason": null
    },
    {
      "pathId": "EFFECT:017",
      "channel": "EFFECT",
      "status": "OWNER_ONLY",
      "relation": "BEARER_MODEL",
      "roleId": null,
      "targetBinding": "SOURCE_MODEL",
      "presentation": "CURRENTLY_PRESENTED",
      "unknownReason": null
    },
    {
      "pathId": "EFFECT:018",
      "channel": "EFFECT",
      "status": "OWNER_ONLY",
      "relation": "BEARER_MODEL",
      "roleId": null,
      "targetBinding": "SOURCE_MODEL",
      "presentation": "CURRENTLY_PRESENTED",
      "unknownReason": null
    },
    {
      "pathId": "EFFECT:019",
      "channel": "EFFECT",
      "status": "OWNER_ONLY",
      "relation": "BEARER_MODEL",
      "roleId": null,
      "targetBinding": "SOURCE_MODEL",
      "presentation": "CURRENTLY_PRESENTED",
      "unknownReason": null
    },
    {
      "pathId": "EFFECT:020",
      "channel": "EFFECT",
      "status": "OWNER_ONLY",
      "relation": "BEARER_MODEL",
      "roleId": null,
      "targetBinding": "SOURCE_MODEL",
      "presentation": "CURRENTLY_PRESENTED",
      "unknownReason": null
    },
    {
      "pathId": "EFFECT:021",
      "channel": "EFFECT",
      "status": "OWNER_ONLY",
      "relation": "BEARER_MODEL",
      "roleId": null,
      "targetBinding": "SOURCE_MODEL",
      "presentation": "CURRENTLY_PRESENTED",
      "unknownReason": null
    },
    {
      "pathId": "EFFECT:022",
      "channel": "EFFECT",
      "status": "OWNER_ONLY",
      "relation": "BEARER_MODEL",
      "roleId": null,
      "targetBinding": "SOURCE_MODEL",
      "presentation": "CURRENTLY_PRESENTED",
      "unknownReason": null
    },
    {
      "pathId": "EFFECT:023",
      "channel": "EFFECT",
      "status": "OWNER_ONLY",
      "relation": "BEARER_MODEL",
      "roleId": null,
      "targetBinding": "SOURCE_MODEL",
      "presentation": "CURRENTLY_PRESENTED",
      "unknownReason": null
    },
    {
      "pathId": "EFFECT:024",
      "channel": "EFFECT",
      "status": "OWNER_ONLY",
      "relation": "BEARER_MODEL",
      "roleId": null,
      "targetBinding": "SOURCE_MODEL",
      "presentation": "CURRENTLY_PRESENTED",
      "unknownReason": null
    },
    {
      "pathId": "EFFECT:025",
      "channel": "EFFECT",
      "status": "OWNER_ONLY",
      "relation": "BEARER_MODEL",
      "roleId": null,
      "targetBinding": "SOURCE_MODEL",
      "presentation": "CURRENTLY_PRESENTED",
      "unknownReason": null
    },
    {
      "pathId": "EFFECT:026",
      "channel": "EFFECT",
      "status": "OWNER_ONLY",
      "relation": "BEARER_MODEL",
      "roleId": null,
      "targetBinding": "SOURCE_MODEL",
      "presentation": "CURRENTLY_PRESENTED",
      "unknownReason": null
    },
    {
      "pathId": "EFFECT:027",
      "channel": "EFFECT",
      "status": "OWNER_ONLY",
      "relation": "BEARER_MODEL",
      "roleId": null,
      "targetBinding": "SOURCE_MODEL",
      "presentation": "CURRENTLY_PRESENTED",
      "unknownReason": null
    },
    {
      "pathId": "EFFECT:028",
      "channel": "EFFECT",
      "status": "OWNER_ONLY",
      "relation": "BEARER_MODEL",
      "roleId": null,
      "targetBinding": "SOURCE_MODEL",
      "presentation": "CURRENTLY_PRESENTED",
      "unknownReason": null
    },
    {
      "pathId": "EFFECT:029",
      "channel": "EFFECT",
      "status": "OWNER_ONLY",
      "relation": "BEARER_MODEL",
      "roleId": null,
      "targetBinding": "SOURCE_MODEL",
      "presentation": "CURRENTLY_PRESENTED",
      "unknownReason": null
    },
    {
      "pathId": "EFFECT:030",
      "channel": "EFFECT",
      "status": "OWNER_ONLY",
      "relation": "BEARER_MODEL",
      "roleId": null,
      "targetBinding": "SOURCE_MODEL",
      "presentation": "CURRENTLY_PRESENTED",
      "unknownReason": null
    },
    {
      "pathId": "EFFECT:031",
      "channel": "EFFECT",
      "status": "OWNER_ONLY",
      "relation": "BEARER_MODEL",
      "roleId": null,
      "targetBinding": "SOURCE_MODEL",
      "presentation": "CURRENTLY_PRESENTED",
      "unknownReason": null
    },
    {
      "pathId": "EFFECT:032",
      "channel": "EFFECT",
      "status": "OWNER_ONLY",
      "relation": "BEARER_MODEL",
      "roleId": null,
      "targetBinding": "SOURCE_MODEL",
      "presentation": "CURRENTLY_PRESENTED",
      "unknownReason": null
    },
    {
      "pathId": "EFFECT:033",
      "channel": "EFFECT",
      "status": "OWNER_ONLY",
      "relation": "BEARER_MODEL",
      "roleId": null,
      "targetBinding": "SOURCE_MODEL",
      "presentation": "CURRENTLY_PRESENTED",
      "unknownReason": null
    },
    {
      "pathId": "EFFECT:034",
      "channel": "EFFECT",
      "status": "OWNER_ONLY",
      "relation": "BEARER_MODEL",
      "roleId": null,
      "targetBinding": "SOURCE_MODEL",
      "presentation": "CURRENTLY_PRESENTED",
      "unknownReason": null
    },
    {
      "pathId": "EFFECT:035",
      "channel": "EFFECT",
      "status": "OWNER_ONLY",
      "relation": "BEARER_MODEL",
      "roleId": null,
      "targetBinding": "SOURCE_MODEL",
      "presentation": "CURRENTLY_PRESENTED",
      "unknownReason": null
    },
    {
      "pathId": "EFFECT:036",
      "channel": "EFFECT",
      "status": "OWNER_ONLY",
      "relation": "BEARER_MODEL",
      "roleId": null,
      "targetBinding": "SOURCE_MODEL",
      "presentation": "CURRENTLY_PRESENTED",
      "unknownReason": null
    },
    {
      "pathId": "EFFECT:037",
      "channel": "EFFECT",
      "status": "OWNER_ONLY",
      "relation": "BEARER_MODEL",
      "roleId": null,
      "targetBinding": "SOURCE_MODEL",
      "presentation": "CURRENTLY_PRESENTED",
      "unknownReason": null
    },
    {
      "pathId": "EFFECT:038",
      "channel": "EFFECT",
      "status": "OWNER_ONLY",
      "relation": "BEARER_MODEL",
      "roleId": null,
      "targetBinding": "SOURCE_MODEL",
      "presentation": "CURRENTLY_PRESENTED",
      "unknownReason": null
    },
    {
      "pathId": "ROLE:039",
      "channel": "ROLE",
      "status": "EXPLICIT",
      "relation": "DECLARED_SOURCE_MODEL_ROLE",
      "roleId": "bearer",
      "targetBinding": null,
      "presentation": "STRUCTURALLY_SUPPORTED_NOT_PRESENTED",
      "unknownReason": null
    }
  ],
  "unknownReason": null
}
```

Доказательства producer: [books/emperors-children/v2/app-build.mjs:44](../../books/emperors-children/v2/app-build.mjs#L44); [books/emperors-children/v2/build.py:238](../../books/emperors-children/v2/build.py#L238); [books/emperors-children/v2/build.py:267](../../books/emperors-children/v2/build.py#L267); [books/emperors-children/v2/build.py:275](../../books/emperors-children/v2/build.py#L275). Путь исходной runtime-записи: [books/emperors-children/v2/generated/roster-attachments.json](../../books/emperors-children/v2/generated/roster-attachments.json) `/entities/22`.

Ограничение: Физический roster/instance и battle context здесь не инстанцированы; это статическая связь, не UI-наблюдение. Другие пункты этого владельца: `optional-fight-use`, `selected-weapon`.

#### emperors-children / `detachment-mercurial-host:rule`

```json
{
  "bookId": "emperors-children",
  "entityId": "detachment-mercurial-host:rule",
  "clauseId": "permission-reference",
  "sourceId": "ec-waha-11e-2026-09-28",
  "sourcePaths": [
    {
      "path": "books/emperors-children/sources/waha-11e-current-2026-09-28/corpus.json",
      "status": "RESOLVED"
    },
    {
      "path": "books/emperors-children/sources/waha-11e-current-2026-09-28/emperor-s-children.html",
      "status": "RESOLVED"
    }
  ],
  "sourceFields": [
    [
      "text"
    ]
  ],
  "quote": "You can re-roll Advance rolls made for EMPEROR’S CHILDREN units from your army.",
  "rosterClassification": "ROSTER_EXECUTABLE",
  "status": "EXPLICIT",
  "f4Category": null,
  "recipientPaths": [
    {
      "pathId": "EFFECT:000",
      "channel": "EFFECT",
      "status": "EXPLICIT",
      "relation": "FRIENDLY_ROSTER_UNITS",
      "roleId": null,
      "targetBinding": "ROSTER_UNITS",
      "presentation": "CURRENTLY_PRESENTED",
      "unknownReason": null
    },
    {
      "pathId": "ROLE:001",
      "channel": "ROLE",
      "status": "EXPLICIT",
      "relation": "DECLARED_ROSTER_UNITS_ROLE",
      "roleId": "recipient",
      "targetBinding": null,
      "presentation": "UNKNOWN",
      "unknownReason": null
    }
  ],
  "unknownReason": null
}
```

Доказательства producer: [books/emperors-children/v2/app-build.mjs:44](../../books/emperors-children/v2/app-build.mjs#L44); [books/emperors-children/v2/build.py:238](../../books/emperors-children/v2/build.py#L238); [books/emperors-children/v2/build.py:267](../../books/emperors-children/v2/build.py#L267); [books/emperors-children/v2/build.py:275](../../books/emperors-children/v2/build.py#L275). Путь исходной runtime-записи: [books/emperors-children/v2/generated/roster-attachments.json](../../books/emperors-children/v2/generated/roster-attachments.json) `/entities/79`.

Ограничение: Физический roster/instance и battle context здесь не инстанцированы; это статическая связь, не UI-наблюдение. Другие пункты этого владельца: `advance-roll`, `permission-reference`.

#### space-marines / `ability-sm-044155170e2840d9`

```json
{
  "bookId": "space-marines",
  "entityId": "ability-sm-044155170e2840d9",
  "clauseId": "press-attack-qualified-baseline",
  "sourceId": "space-marines-waha-11e-2026-10-20",
  "sourcePaths": [
    {
      "path": "books/space-marines/v2/sources/raw/wahapedia-datasheets-probe.html",
      "status": "RESOLVED"
    }
  ],
  "sourceFields": [
    [
      "text"
    ]
  ],
  "quote": "This unit’s melee attacks have:\n- [Sustained Hits 1: non-Monster/vehicle].",
  "rosterClassification": "ROSTER_EXECUTABLE",
  "status": "EXPLICIT",
  "f4Category": "A",
  "recipientPaths": [
    {
      "pathId": "EFFECT:000",
      "channel": "EFFECT",
      "status": "EXPLICIT",
      "relation": "UNIT_EFFECT_FORMED_IF_ATTACHED",
      "roleId": null,
      "targetBinding": "SOURCE_UNIT",
      "presentation": "CURRENTLY_PRESENTED",
      "unknownReason": null
    }
  ],
  "unknownReason": null
}
```

Доказательства producer: [books/shared/roster-v2/detachment-reference-build.mjs:14](../../books/shared/roster-v2/detachment-reference-build.mjs#L14); [books/space-marines/v2/app-build.mjs:20](../../books/space-marines/v2/app-build.mjs#L20); [books/space-marines/v2/build.py:179](../../books/space-marines/v2/build.py#L179); [books/space-marines/v2/build.py:318](../../books/space-marines/v2/build.py#L318). Путь исходной runtime-записи: [books/space-marines/v2/generated/roster-import.json](../../books/space-marines/v2/generated/roster-import.json) `/entities/2`.

Ограничение: Физический roster/instance и battle context здесь не инстанцированы; это статическая связь, не UI-наблюдение. Другие пункты этого владельца: `ability-sm-044155170e2840d9#text:0-49`, `ability-sm-044155170e2840d9#text:93-167`, `press-attack-qualified-baseline`.

#### space-marines / `ability-sm-046203ae581f416e`

```json
{
  "bookId": "space-marines",
  "entityId": "ability-sm-046203ae581f416e",
  "clauseId": "ranged-assault",
  "sourceId": "space-marines-waha-11e-2026-10-20",
  "sourcePaths": [
    {
      "path": "books/space-marines/v2/sources/raw/wahapedia-datasheets-probe.html",
      "status": "RESOLVED"
    }
  ],
  "sourceFields": [
    [
      "text"
    ]
  ],
  "quote": "This unit’s ranged attacks have [ASSAULT]",
  "rosterClassification": "ROSTER_EXECUTABLE",
  "status": "EXPLICIT",
  "f4Category": "A",
  "recipientPaths": [
    {
      "pathId": "EFFECT:000",
      "channel": "EFFECT",
      "status": "EXPLICIT",
      "relation": "UNIT_EFFECT_FORMED_IF_ATTACHED",
      "roleId": null,
      "targetBinding": "SOURCE_UNIT",
      "presentation": "CURRENTLY_PRESENTED",
      "unknownReason": null
    }
  ],
  "unknownReason": null
}
```

Доказательства producer: [books/shared/roster-v2/detachment-reference-build.mjs:14](../../books/shared/roster-v2/detachment-reference-build.mjs#L14); [books/space-marines/v2/app-build.mjs:20](../../books/space-marines/v2/app-build.mjs#L20); [books/space-marines/v2/build.py:179](../../books/space-marines/v2/build.py#L179); [books/space-marines/v2/build.py:318](../../books/space-marines/v2/build.py#L318). Путь исходной runtime-записи: [books/space-marines/v2/generated/roster-import.json](../../books/space-marines/v2/generated/roster-import.json) `/entities/3`.

Ограничение: Физический roster/instance и battle context здесь не инстанцированы; это статическая связь, не UI-наблюдение. Другие пункты этого владельца: `ability-sm-046203ae581f416e#text:15-58`, `ability-sm-046203ae581f416e#text:59-100`, `melee-lance`, `ranged-assault`.

#### space-marines / `detachment-rule-dw-b41deacc51464866`

```json
{
  "bookId": "space-marines",
  "entityId": "detachment-rule-dw-b41deacc51464866",
  "clauseId": null,
  "sourceId": "space-marines-waha-11e-2026-10-20",
  "sourcePaths": [
    {
      "path": "books/space-marines/v2/sources/raw/wahapedia-space-marines-main.html",
      "status": "RESOLVED"
    }
  ],
  "sourceFields": [
    [
      "text"
    ]
  ],
  "quote": "Mission Tactics\nFriendly KILL TEAM units with this ability have the following abilities:\nFuror Tactics\nIf the devastator doctrine is active for your unit, your ",
  "rosterClassification": null,
  "status": "UNKNOWN",
  "f4Category": null,
  "recipientPaths": [],
  "unknownReason": "No clause/contract in the actual execution artifact; source-only text is not a physical recipient declaration."
}
```

Доказательства producer: [books/shared/roster-v2/detachment-reference-build.mjs:14](../../books/shared/roster-v2/detachment-reference-build.mjs#L14); [books/space-marines/v2/app-build.mjs:20](../../books/space-marines/v2/app-build.mjs#L20); [books/space-marines/v2/build.py:179](../../books/space-marines/v2/build.py#L179); [books/space-marines/v2/build.py:318](../../books/space-marines/v2/build.py#L318). Путь исходной runtime-записи: [books/space-marines/v2/generated/roster-import.json](../../books/space-marines/v2/generated/roster-import.json) `/entities/1715`.

Ограничение: No clause/contract in the actual execution artifact; source-only text is not a physical recipient declaration. Другие пункты этого владельца: `null`.

#### space-marines / `detachment-rule-sm-07f085c819ea4835`

```json
{
  "bookId": "space-marines",
  "entityId": "detachment-rule-sm-07f085c819ea4835",
  "clauseId": "detachment-rule-sm-07f085c819ea4835#text:19-89",
  "sourceId": "space-marines-waha-11e-2026-10-20",
  "sourcePaths": [
    {
      "path": "books/space-marines/v2/sources/raw/wahapedia-space-marines-main.html",
      "status": "RESOLVED"
    }
  ],
  "sourceFields": [
    [
      "text"
    ]
  ],
  "quote": "You can select the devastator doctrine one additional time per battle.",
  "rosterClassification": "DISPLAY_ONLY",
  "status": "UNKNOWN",
  "f4Category": null,
  "recipientPaths": [],
  "unknownReason": "Source ownership/participation is recorded, but a receiver-to-source relationship is not proven."
}
```

Доказательства producer: [books/shared/roster-v2/detachment-reference-build.mjs:14](../../books/shared/roster-v2/detachment-reference-build.mjs#L14); [books/space-marines/v2/app-build.mjs:20](../../books/space-marines/v2/app-build.mjs#L20); [books/space-marines/v2/build.py:179](../../books/space-marines/v2/build.py#L179); [books/space-marines/v2/build.py:318](../../books/space-marines/v2/build.py#L318). Путь исходной runtime-записи: [books/space-marines/v2/generated/roster-import.json](../../books/space-marines/v2/generated/roster-import.json) `/entities/285`.

Ограничение: Source ownership/participation is recorded, but a receiver-to-source relationship is not proven. Другие пункты этого владельца: `detachment-rule-sm-07f085c819ea4835#text:19-89`.

#### space-marines / `detachment-rule-sm-35102c2d34334220`

```json
{
  "bookId": "space-marines",
  "entityId": "detachment-rule-sm-35102c2d34334220",
  "clauseId": "detachment-rule-sm-35102c2d34334220#text:17-85",
  "sourceId": "space-marines-waha-11e-2026-10-20",
  "sourcePaths": [
    {
      "path": "books/space-marines/v2/sources/raw/wahapedia-space-marines-main.html",
      "status": "RESOLVED"
    }
  ],
  "sourceFields": [
    [
      "text"
    ]
  ],
  "quote": "You can select the tactical doctrine one additional time per battle.",
  "rosterClassification": "DISPLAY_ONLY",
  "status": "UNKNOWN",
  "f4Category": null,
  "recipientPaths": [],
  "unknownReason": "Source ownership/participation is recorded, but a receiver-to-source relationship is not proven."
}
```

Доказательства producer: [books/shared/roster-v2/detachment-reference-build.mjs:14](../../books/shared/roster-v2/detachment-reference-build.mjs#L14); [books/space-marines/v2/app-build.mjs:20](../../books/space-marines/v2/app-build.mjs#L20); [books/space-marines/v2/build.py:179](../../books/space-marines/v2/build.py#L179); [books/space-marines/v2/build.py:318](../../books/space-marines/v2/build.py#L318). Путь исходной runtime-записи: [books/space-marines/v2/generated/roster-import.json](../../books/space-marines/v2/generated/roster-import.json) `/entities/286`.

Ограничение: Source ownership/participation is recorded, but a receiver-to-source relationship is not proven. Другие пункты этого владельца: `detachment-rule-sm-35102c2d34334220#text:17-85`.

#### space-marines / `detachment-rule-sm-c3bc7e5bc3614044`

```json
{
  "bookId": "space-marines",
  "entityId": "detachment-rule-sm-c3bc7e5bc3614044",
  "clauseId": "detachment-rule-sm-c3bc7e5bc3614044#text:0-117",
  "sourceId": "space-marines-waha-11e-2026-10-20",
  "sourcePaths": [
    {
      "path": "books/space-marines/v2/sources/raw/wahapedia-space-marines-main.html",
      "status": "RESOLVED"
    }
  ],
  "sourceFields": [
    [
      "text"
    ]
  ],
  "quote": "Unparalleled Tactician: (Once per battle round, per army) When you use the Into Darkness stratagem, that use is -1CP.",
  "rosterClassification": "DISPLAY_ONLY",
  "status": "UNKNOWN",
  "f4Category": null,
  "recipientPaths": [],
  "unknownReason": "Source ownership/participation is recorded, but a receiver-to-source relationship is not proven."
}
```

Доказательства producer: [books/shared/roster-v2/detachment-reference-build.mjs:14](../../books/shared/roster-v2/detachment-reference-build.mjs#L14); [books/space-marines/v2/app-build.mjs:20](../../books/space-marines/v2/app-build.mjs#L20); [books/space-marines/v2/build.py:179](../../books/space-marines/v2/build.py#L179); [books/space-marines/v2/build.py:318](../../books/space-marines/v2/build.py#L318). Путь исходной runtime-записи: [books/space-marines/v2/generated/roster-import.json](../../books/space-marines/v2/generated/roster-import.json) `/entities/300`.

Ограничение: Source ownership/participation is recorded, but a receiver-to-source relationship is not proven. Другие пункты этого владельца: `detachment-rule-sm-c3bc7e5bc3614044#text:0-117`.

#### space-marines / `detachment-rule-sm-e17a6e4c352748be`

```json
{
  "bookId": "space-marines",
  "entityId": "detachment-rule-sm-e17a6e4c352748be",
  "clauseId": "detachment-rule-sm-e17a6e4c352748be#text:0-128",
  "sourceId": "space-marines-waha-11e-2026-10-20",
  "sourcePaths": [
    {
      "path": "books/space-marines/v2/sources/raw/wahapedia-space-marines-main.html",
      "status": "RESOLVED"
    }
  ],
  "sourceFields": [
    [
      "text"
    ]
  ],
  "quote": "Wrath of the First Khan: At the end of the Fight phase, if this unit was eligible to fight this phase, you can use this ability.",
  "rosterClassification": "DISPLAY_ONLY",
  "status": "UNKNOWN",
  "f4Category": null,
  "recipientPaths": [],
  "unknownReason": "Source ownership/participation is recorded, but a receiver-to-source relationship is not proven."
}
```

Доказательства producer: [books/shared/roster-v2/detachment-reference-build.mjs:14](../../books/shared/roster-v2/detachment-reference-build.mjs#L14); [books/space-marines/v2/app-build.mjs:20](../../books/space-marines/v2/app-build.mjs#L20); [books/space-marines/v2/build.py:179](../../books/space-marines/v2/build.py#L179); [books/space-marines/v2/build.py:318](../../books/space-marines/v2/build.py#L318). Путь исходной runtime-записи: [books/space-marines/v2/generated/roster-import.json](../../books/space-marines/v2/generated/roster-import.json) `/entities/303`.

Ограничение: Source ownership/participation is recorded, but a receiver-to-source relationship is not proven. Другие пункты этого владельца: `detachment-rule-sm-e17a6e4c352748be#text:0-128`, `detachment-rule-sm-e17a6e4c352748be#text:140-202`, `detachment-rule-sm-e17a6e4c352748be#text:203-270`.

#### tau-empire / `datasheet-cadre-fireblade:section:1`

```json
{
  "bookId": "tau-empire",
  "entityId": "datasheet-cadre-fireblade:section:1",
  "clauseId": "datasheet-cadre-fireblade:section:1#ability-2-conditional",
  "sourceId": "tau-empire-waha-11e-2026-09-28",
  "sourcePaths": [
    {
      "path": "books/tau-empire/sources/waha-11e-current-2026-09-28/Cadre-Fireblade.html",
      "status": "RESOLVED"
    }
  ],
  "sourceFields": [
    [
      "blocks",
      1,
      "text"
    ]
  ],
  "quote": "Crack Shot: Each time this model makes a ranged attack, on a Critical Wound, that attack has an Armour Penetration characteristic of -3.",
  "rosterClassification": "BATTLE_ONLY",
  "status": "IMPLICIT_CANDIDATE",
  "f4Category": "C",
  "recipientPaths": [
    {
      "pathId": "REVIEW_METADATA:000",
      "channel": "REVIEW_METADATA",
      "status": "IMPLICIT_CANDIDATE",
      "relation": "UNKNOWN",
      "roleId": null,
      "targetBinding": null,
      "presentation": "UNKNOWN",
      "unknownReason": "Descriptive recipient review is not a runtime selector or physical source-to-recipient binding."
    }
  ],
  "unknownReason": null
}
```

Доказательства producer: [books/tau-empire/v2/build.py:60](../../books/tau-empire/v2/build.py#L60); [books/tau-empire/v2/build.py:200](../../books/tau-empire/v2/build.py#L200); [books/tau-empire/v2/roster-import-build.mjs:20](../../books/tau-empire/v2/roster-import-build.mjs#L20); [books/tau-empire/v2/rule-contract-build.mjs:18](../../books/tau-empire/v2/rule-contract-build.mjs#L18). Путь исходной runtime-записи: [books/tau-empire/v2/generated/roster-import.json](../../books/tau-empire/v2/generated/roster-import.json) `/entities/103`.

Ограничение: Физический roster/instance и battle context здесь не инстанцированы; это статическая связь, не UI-наблюдение. Другие пункты этого владельца: `datasheet-cadre-fireblade:section:1#ability-2-conditional`, `volley-fire`.

#### tau-empire / `datasheet-commander-in-coldstar-battlesuit:section:1`

```json
{
  "bookId": "tau-empire",
  "entityId": "datasheet-commander-in-coldstar-battlesuit:section:1",
  "clauseId": "coldstar-commander",
  "sourceId": "tau-empire-waha-11e-2026-09-28",
  "sourcePaths": [
    {
      "path": "books/tau-empire/sources/waha-11e-current-2026-09-28/Commander-In-Coldstar-Battlesuit.html",
      "status": "RESOLVED"
    }
  ],
  "sourceFields": [
    [
      "blocks",
      0,
      "text"
    ]
  ],
  "quote": "Coldstar Commander: While this model is leading a unit, models in that unit have a Move characteristic of 12\" and ranged weapons equipped by models in that unit",
  "rosterClassification": "ROSTER_EXECUTABLE",
  "status": "EXPLICIT",
  "f4Category": "A",
  "recipientPaths": [
    {
      "pathId": "EFFECT:000",
      "channel": "EFFECT",
      "status": "EXPLICIT",
      "relation": "FORMED_SOURCE_UNIT_MODELS",
      "roleId": null,
      "targetBinding": "SOURCE_FORMED_MODELS",
      "presentation": "CURRENTLY_PRESENTED",
      "unknownReason": null
    },
    {
      "pathId": "EFFECT:001",
      "channel": "EFFECT",
      "status": "EXPLICIT",
      "relation": "FORMED_SOURCE_UNIT_MODELS",
      "roleId": null,
      "targetBinding": "SOURCE_FORMED_MODELS",
      "presentation": "CURRENTLY_PRESENTED",
      "unknownReason": null
    }
  ],
  "unknownReason": null
}
```

Доказательства producer: [books/tau-empire/v2/build.py:60](../../books/tau-empire/v2/build.py#L60); [books/tau-empire/v2/build.py:200](../../books/tau-empire/v2/build.py#L200); [books/tau-empire/v2/roster-import-build.mjs:20](../../books/tau-empire/v2/roster-import-build.mjs#L20); [books/tau-empire/v2/rule-contract-build.mjs:18](../../books/tau-empire/v2/rule-contract-build.mjs#L18). Путь исходной runtime-записи: [books/tau-empire/v2/generated/roster-import.json](../../books/tau-empire/v2/generated/roster-import.json) `/entities/125`.

Ограничение: Физический roster/instance и battle context здесь не инстанцированы; это статическая связь, не UI-наблюдение. Другие пункты этого владельца: `coldstar-commander`, `datasheet-commander-in-coldstar-battlesuit:section:1#ability-2-conditional`, `datasheet-commander-in-coldstar-battlesuit:section:1#ability-4-conditional`, `shield-generator`.

#### tau-empire / `datasheet-commander-shadowsun:section:1`

```json
{
  "bookId": "tau-empire",
  "entityId": "datasheet-commander-shadowsun:section:1",
  "clauseId": "datasheet-commander-shadowsun:section:1#ability-1-conditional",
  "sourceId": "tau-empire-waha-11e-2026-09-28",
  "sourcePaths": [
    {
      "path": "books/tau-empire/sources/waha-11e-current-2026-09-28/Commander-Shadowsun.html",
      "status": "RESOLVED"
    }
  ],
  "sourceFields": [
    [
      "blocks",
      0,
      "text"
    ]
  ],
  "quote": "Agile Combatant: This model is eligible to shoot in a turn in which it Fell Back.",
  "rosterClassification": "BATTLE_ONLY",
  "status": "IMPLICIT_CANDIDATE",
  "f4Category": null,
  "recipientPaths": [
    {
      "pathId": "REVIEW_METADATA:000",
      "channel": "REVIEW_METADATA",
      "status": "IMPLICIT_CANDIDATE",
      "relation": "UNKNOWN",
      "roleId": null,
      "targetBinding": null,
      "presentation": "UNKNOWN",
      "unknownReason": "Descriptive recipient review is not a runtime selector or physical source-to-recipient binding."
    }
  ],
  "unknownReason": null
}
```

Доказательства producer: [books/tau-empire/v2/build.py:60](../../books/tau-empire/v2/build.py#L60); [books/tau-empire/v2/build.py:200](../../books/tau-empire/v2/build.py#L200); [books/tau-empire/v2/roster-import-build.mjs:20](../../books/tau-empire/v2/roster-import-build.mjs#L20); [books/tau-empire/v2/rule-contract-build.mjs:18](../../books/tau-empire/v2/rule-contract-build.mjs#L18). Путь исходной runtime-записи: [books/tau-empire/v2/generated/roster-import.json](../../books/tau-empire/v2/generated/roster-import.json) `/entities/266`.

Ограничение: Физический roster/instance и battle context здесь не инстанцированы; это статическая связь, не UI-наблюдение. Другие пункты этого владельца: `datasheet-commander-shadowsun:section:1#ability-1-conditional`, `datasheet-commander-shadowsun:section:1#ability-2-conditional`, `datasheet-commander-shadowsun:section:1#ability-3-conditional`, `datasheet-commander-shadowsun:section:1#ability-4-conditional`.

#### tau-empire / `datasheet-kroot-carnivores:section:bodyguard`

```json
{
  "bookId": "tau-empire",
  "entityId": "datasheet-kroot-carnivores:section:bodyguard",
  "clauseId": "datasheet-kroot-carnivores:section:bodyguard#bodyguard-two-leaders",
  "sourceId": "tau-empire-waha-11e-2026-09-28",
  "sourcePaths": [
    {
      "path": "books/tau-empire/sources/waha-11e-current-2026-09-28/Kroot-Carnivores.html",
      "status": "RESOLVED"
    }
  ],
  "sourceFields": [
    [
      "blocks",
      0,
      "text"
    ]
  ],
  "quote": "If this unit has a Starting Strength of 20, you can attach up to two Leader units to it instead of one, provided those Leaders are not duplicates (e.g. you cann",
  "rosterClassification": "DISPLAY_ONLY",
  "status": "IMPLICIT_CANDIDATE",
  "f4Category": null,
  "recipientPaths": [
    {
      "pathId": "REVIEW_METADATA:000",
      "channel": "REVIEW_METADATA",
      "status": "IMPLICIT_CANDIDATE",
      "relation": "UNKNOWN",
      "roleId": null,
      "targetBinding": null,
      "presentation": "UNKNOWN",
      "unknownReason": "Descriptive recipient review is not a runtime selector or physical source-to-recipient binding."
    }
  ],
  "unknownReason": null
}
```

Доказательства producer: [books/tau-empire/v2/build.py:60](../../books/tau-empire/v2/build.py#L60); [books/tau-empire/v2/build.py:200](../../books/tau-empire/v2/build.py#L200); [books/tau-empire/v2/roster-import-build.mjs:20](../../books/tau-empire/v2/roster-import-build.mjs#L20); [books/tau-empire/v2/rule-contract-build.mjs:18](../../books/tau-empire/v2/rule-contract-build.mjs#L18). Путь исходной runtime-записи: [books/tau-empire/v2/generated/roster-import.json](../../books/tau-empire/v2/generated/roster-import.json) `/entities/316`.

Ограничение: Физический roster/instance и battle context здесь не инстанцированы; это статическая связь, не UI-наблюдение. Другие пункты этого владельца: `datasheet-kroot-carnivores:section:bodyguard#bodyguard-two-leaders`.

#### tau-empire / `detachment-auxiliary-cadre:enhancement:1`

```json
{
  "bookId": "tau-empire",
  "entityId": "detachment-auxiliary-cadre:enhancement:1",
  "clauseId": "detachment-auxiliary-cadre:enhancement:1#chosen-units-deep-strike",
  "sourceId": "tau-empire-waha-11e-2026-09-28",
  "sourcePaths": [
    {
      "path": "books/tau-empire/sources/waha-11e-current-2026-09-28/tau-empire.html",
      "status": "RESOLVED"
    }
  ],
  "sourceFields": [
    [
      "text"
    ]
  ],
  "quote": "KROOT SHAPER model only. In the Declare Battle Formations step, you can select up to three friendly KROOT CARNIVORES/FARSTALKERS units. Those units have Deep St",
  "rosterClassification": "DISPLAY_ONLY",
  "status": "UNKNOWN",
  "f4Category": "D",
  "recipientPaths": [],
  "unknownReason": "Source ownership/participation is recorded, but a receiver-to-source relationship is not proven."
}
```

Доказательства producer: [books/tau-empire/v2/build.py:60](../../books/tau-empire/v2/build.py#L60); [books/tau-empire/v2/build.py:200](../../books/tau-empire/v2/build.py#L200); [books/tau-empire/v2/roster-import-build.mjs:20](../../books/tau-empire/v2/roster-import-build.mjs#L20); [books/tau-empire/v2/rule-contract-build.mjs:18](../../books/tau-empire/v2/rule-contract-build.mjs#L18). Путь исходной runtime-записи: [books/tau-empire/v2/generated/roster-import.json](../../books/tau-empire/v2/generated/roster-import.json) `/entities/54`.

Ограничение: Source ownership/participation is recorded, but a receiver-to-source relationship is not proven. Другие пункты этого владельца: `detachment-auxiliary-cadre:enhancement:1#chosen-units-deep-strike`.

#### tau-empire / `detachment-experimental-prototype-cadre:enhancement:1`

```json
{
  "bookId": "tau-empire",
  "entityId": "detachment-experimental-prototype-cadre:enhancement:1",
  "clauseId": "detachment-experimental-prototype-cadre:enhancement:1#selected-weapon-ap",
  "sourceId": "tau-empire-waha-11e-2026-09-28",
  "sourcePaths": [
    {
      "path": "books/tau-empire/sources/waha-11e-current-2026-09-28/tau-empire.html",
      "status": "RESOLVED"
    }
  ],
  "sourceFields": [
    [
      "text"
    ]
  ],
  "quote": "BATTLESUIT model only. In the Declare Battle Formations step, select one of this model’s T’au Flamer weapons. That weapon’s attacks have: +2 S +1 AP and D.",
  "rosterClassification": "DISPLAY_ONLY",
  "status": "IMPLICIT_CANDIDATE",
  "f4Category": "C",
  "recipientPaths": [
    {
      "pathId": "REVIEW_METADATA:000",
      "channel": "REVIEW_METADATA",
      "status": "IMPLICIT_CANDIDATE",
      "relation": "UNKNOWN",
      "roleId": null,
      "targetBinding": null,
      "presentation": "UNKNOWN",
      "unknownReason": "Descriptive recipient review is not a runtime selector or physical source-to-recipient binding."
    }
  ],
  "unknownReason": null
}
```

Доказательства producer: [books/tau-empire/v2/build.py:60](../../books/tau-empire/v2/build.py#L60); [books/tau-empire/v2/build.py:200](../../books/tau-empire/v2/build.py#L200); [books/tau-empire/v2/roster-import-build.mjs:20](../../books/tau-empire/v2/roster-import-build.mjs#L20); [books/tau-empire/v2/rule-contract-build.mjs:18](../../books/tau-empire/v2/rule-contract-build.mjs#L18). Путь исходной runtime-записи: [books/tau-empire/v2/generated/roster-import.json](../../books/tau-empire/v2/generated/roster-import.json) `/entities/61`.

Ограничение: Физический roster/instance и battle context здесь не инстанцированы; это статическая связь, не UI-наблюдение. Другие пункты этого владельца: `detachment-experimental-prototype-cadre:enhancement:1#selected-weapon-ap`, `detachment-experimental-prototype-cadre:enhancement:1#selected-weapon-damage`, `detachment-experimental-prototype-cadre:enhancement:1#selected-weapon-strength`.

#### tyranids / `datasheet-broodlord:section:1`

```json
{
  "bookId": "tyranids",
  "entityId": "datasheet-broodlord:section:1",
  "clauseId": "conditional-block-1",
  "sourceId": "tyranids-waha-11e-2026-09-27",
  "sourcePaths": [
    {
      "path": "books/tyranids/sources/waha-11e-current-2026-09-27/Broodlord.html",
      "status": "RESOLVED"
    },
    {
      "path": "books/tyranids/sources/waha-11e-current-2026-09-27/corpus.json",
      "status": "RESOLVED"
    }
  ],
  "sourceFields": [
    [
      "blocks",
      1,
      "text"
    ]
  ],
  "quote": "Hypnotic Gaze (Psychic): At the start of the Fight phase, select one enemy unit within Engagement Range of this model. Until the end of the phase, each time a m",
  "rosterClassification": "BATTLE_ONLY",
  "status": "IMPLICIT_CANDIDATE",
  "f4Category": "C",
  "recipientPaths": [
    {
      "pathId": "ROLE:000",
      "channel": "ROLE",
      "status": "IMPLICIT_CANDIDATE",
      "relation": "DECLARED_SOURCE_UNIT_ROLE",
      "roleId": "recipient",
      "targetBinding": null,
      "presentation": "STRUCTURALLY_SUPPORTED_NOT_PRESENTED",
      "unknownReason": "Contract-level applicability role is not an explicit edge from this clause to that recipient."
    }
  ],
  "unknownReason": null
}
```

Доказательства producer: [books/tyranids/v2/app-build.mjs:164](../../books/tyranids/v2/app-build.mjs#L164); [books/tyranids/v2/build.py:20](../../books/tyranids/v2/build.py#L20); [books/tyranids/v2/roster-import-build.mjs:14](../../books/tyranids/v2/roster-import-build.mjs#L14); [books/tyranids/v2/rule-contract-build.mjs:19](../../books/tyranids/v2/rule-contract-build.mjs#L19). Путь исходной runtime-записи: [books/tyranids/v2/generated/roster-runtime.json](../../books/tyranids/v2/generated/roster-runtime.json) `/entities/133`.

Ограничение: Физический roster/instance и battle context здесь не инстанцированы; это статическая связь, не UI-наблюдение. Другие пункты этого владельца: `conditional-block-1`, `roster-known`.

#### tyranids / `datasheet-hive-tyrant:section:1`

```json
{
  "bookId": "tyranids",
  "entityId": "datasheet-hive-tyrant:section:1",
  "clauseId": null,
  "sourceId": "tyranids-waha-11e-2026-09-27",
  "sourcePaths": [
    {
      "path": "books/tyranids/sources/waha-11e-current-2026-09-27/Hive-Tyrant.html",
      "status": "RESOLVED"
    },
    {
      "path": "books/tyranids/sources/waha-11e-current-2026-09-27/corpus.json",
      "status": "RESOLVED"
    },
    {
      "path": "books/tyranids/v2/sources/tyranids-faction-pack-v1.3.pdf",
      "status": "RESOLVED"
    }
  ],
  "sourceFields": [
    [
      "blocks",
      "0",
      "text"
    ],
    [
      "blocks",
      "1",
      "text"
    ]
  ],
  "quote": "Will of the Hive Mind: Once per battle round, one model from your army with this ability can use it when a friendly TYRANIDS unit within 12\" of that model is ta",
  "rosterClassification": null,
  "status": "UNKNOWN",
  "f4Category": "E",
  "recipientPaths": [],
  "unknownReason": "No clause/contract in the actual execution artifact; source-only text is not a physical recipient declaration."
}
```

Доказательства producer: [books/tyranids/v2/app-build.mjs:164](../../books/tyranids/v2/app-build.mjs#L164); [books/tyranids/v2/build.py:20](../../books/tyranids/v2/build.py#L20); [books/tyranids/v2/roster-import-build.mjs:14](../../books/tyranids/v2/roster-import-build.mjs#L14); [books/tyranids/v2/rule-contract-build.mjs:19](../../books/tyranids/v2/rule-contract-build.mjs#L19). Путь исходной runtime-записи: [books/tyranids/v2/generated/roster-runtime.json](../../books/tyranids/v2/generated/roster-runtime.json) `/entities/285`.

Ограничение: No clause/contract in the actual execution artifact; source-only text is not a physical recipient declaration. Другие пункты этого владельца: `null`.

#### tyranids / `datasheet-neurotyrant:section:1`

```json
{
  "bookId": "tyranids",
  "entityId": "datasheet-neurotyrant:section:1",
  "clauseId": null,
  "sourceId": "tyranids-waha-11e-2026-09-27",
  "sourcePaths": [
    {
      "path": "books/tyranids/sources/waha-11e-current-2026-09-27/Neurotyrant.html",
      "status": "RESOLVED"
    },
    {
      "path": "books/tyranids/sources/waha-11e-current-2026-09-27/corpus.json",
      "status": "RESOLVED"
    }
  ],
  "sourceFields": [
    [
      "blocks",
      "0",
      "text"
    ],
    [
      "blocks",
      "1",
      "text"
    ],
    [
      "blocks",
      "2",
      "text"
    ]
  ],
  "quote": "Node Lash (Psychic): While this model is leading a unit, each time a model in that unit makes an attack, add 1 to the Hit roll. If the target is Battle-shocked,",
  "rosterClassification": null,
  "status": "UNKNOWN",
  "f4Category": "E",
  "recipientPaths": [],
  "unknownReason": "No clause/contract in the actual execution artifact; source-only text is not a physical recipient declaration."
}
```

Доказательства producer: [books/tyranids/v2/app-build.mjs:164](../../books/tyranids/v2/app-build.mjs#L164); [books/tyranids/v2/build.py:20](../../books/tyranids/v2/build.py#L20); [books/tyranids/v2/roster-import-build.mjs:14](../../books/tyranids/v2/roster-import-build.mjs#L14); [books/tyranids/v2/rule-contract-build.mjs:19](../../books/tyranids/v2/rule-contract-build.mjs#L19). Путь исходной runtime-записи: [books/tyranids/v2/generated/roster-runtime.json](../../books/tyranids/v2/generated/roster-runtime.json) `/entities/379`.

Ограничение: No clause/contract in the actual execution artifact; source-only text is not a physical recipient declaration. Другие пункты этого владельца: `null`.

#### tyranids / `datasheet-tyrant-guard:section:1`

```json
{
  "bookId": "tyranids",
  "entityId": "datasheet-tyrant-guard:section:1",
  "clauseId": "roster-known",
  "sourceId": "tyranids-waha-11e-2026-09-27",
  "sourcePaths": [
    {
      "path": "books/tyranids/sources/waha-11e-current-2026-09-27/Tyrant-Guard.html",
      "status": "RESOLVED"
    },
    {
      "path": "books/tyranids/sources/waha-11e-current-2026-09-27/corpus.json",
      "status": "RESOLVED"
    }
  ],
  "sourceFields": [
    [
      "blocks",
      0,
      "text"
    ]
  ],
  "quote": "Guardian Organism: While a CHARACTER model is leading this unit, that CHARACTER has the Feel No Pain 5+ ability.",
  "rosterClassification": "ROSTER_EXECUTABLE",
  "status": "EXPLICIT",
  "f4Category": "C",
  "recipientPaths": [
    {
      "pathId": "EFFECT:000",
      "channel": "EFFECT",
      "status": "EXPLICIT",
      "relation": "ATTACHED_LEADERS_MODELS",
      "roleId": null,
      "targetBinding": "LEADERS_OF_SOURCE",
      "presentation": "CURRENTLY_PRESENTED",
      "unknownReason": null
    },
    {
      "pathId": "ROLE:001",
      "channel": "ROLE",
      "status": "EXPLICIT",
      "relation": "DECLARED_LEADERS_OF_SOURCE_ROLE",
      "roleId": "recipient",
      "targetBinding": null,
      "presentation": "STRUCTURALLY_SUPPORTED_NOT_PRESENTED",
      "unknownReason": null
    }
  ],
  "unknownReason": null
}
```

Доказательства producer: [books/tyranids/v2/app-build.mjs:164](../../books/tyranids/v2/app-build.mjs#L164); [books/tyranids/v2/build.py:20](../../books/tyranids/v2/build.py#L20); [books/tyranids/v2/roster-import-build.mjs:14](../../books/tyranids/v2/roster-import-build.mjs#L14); [books/tyranids/v2/rule-contract-build.mjs:19](../../books/tyranids/v2/rule-contract-build.mjs#L19). Путь исходной runtime-записи: [books/tyranids/v2/generated/roster-runtime.json](../../books/tyranids/v2/generated/roster-runtime.json) `/entities/640`.

Ограничение: Физический roster/instance и battle context здесь не инстанцированы; это статическая связь, не UI-наблюдение. Другие пункты этого владельца: `roster-known`.

#### tyranids / `detachment-assimilation-swarm:enhancement:4`

```json
{
  "bookId": "tyranids",
  "entityId": "detachment-assimilation-swarm:enhancement:4",
  "clauseId": "battle-dependent",
  "sourceId": "tyranids-waha-11e-2026-09-27",
  "sourcePaths": [
    {
      "path": "books/tyranids/sources/waha-11e-current-2026-09-27/corpus.json",
      "status": "RESOLVED"
    },
    {
      "path": "books/tyranids/sources/waha-11e-current-2026-09-27/tyranids.html",
      "status": "RESOLVED"
    }
  ],
  "sourceFields": [
    [
      "text"
    ]
  ],
  "quote": "The first time the bearer’s unit destroys an enemy unit in the Fight phase while the bearer is within 6\" of one or more friendly HARVESTER units, until the end ",
  "rosterClassification": "BATTLE_ONLY",
  "status": "IMPLICIT_CANDIDATE",
  "f4Category": "C",
  "recipientPaths": [
    {
      "pathId": "ROLE:000",
      "channel": "ROLE",
      "status": "IMPLICIT_CANDIDATE",
      "relation": "DECLARED_SOURCE_UNIT_ROLE",
      "roleId": "recipient",
      "targetBinding": null,
      "presentation": "STRUCTURALLY_SUPPORTED_NOT_PRESENTED",
      "unknownReason": "Contract-level applicability role is not an explicit edge from this clause to that recipient."
    }
  ],
  "unknownReason": null
}
```

Доказательства producer: [books/tyranids/v2/app-build.mjs:164](../../books/tyranids/v2/app-build.mjs#L164); [books/tyranids/v2/build.py:20](../../books/tyranids/v2/build.py#L20); [books/tyranids/v2/roster-import-build.mjs:14](../../books/tyranids/v2/roster-import-build.mjs#L14); [books/tyranids/v2/rule-contract-build.mjs:19](../../books/tyranids/v2/rule-contract-build.mjs#L19). Путь исходной runtime-записи: [books/tyranids/v2/generated/roster-runtime.json](../../books/tyranids/v2/generated/roster-runtime.json) `/entities/48`.

Ограничение: Физический roster/instance и battle context здесь не инстанцированы; это статическая связь, не UI-наблюдение. Другие пункты этого владельца: `battle-dependent`, `roster-known`.

#### tyranids / `detachment-invasion-fleet:enhancement:4`

```json
{
  "bookId": "tyranids",
  "entityId": "detachment-invasion-fleet:enhancement:4",
  "clauseId": "battle-dependent",
  "sourceId": "tyranids-waha-11e-2026-09-27",
  "sourcePaths": [
    {
      "path": "books/tyranids/sources/waha-11e-current-2026-09-27/corpus.json",
      "status": "RESOLVED"
    },
    {
      "path": "books/tyranids/sources/waha-11e-current-2026-09-27/tyranids.html",
      "status": "RESOLVED"
    }
  ],
  "sourceFields": [
    [
      "text"
    ]
  ],
  "quote": "At the start of any turn, if the bearer has fewer than its starting number of wounds remaining, until the end of the battle, it has the Feel No Pain 4+ ability ",
  "rosterClassification": "BATTLE_ONLY",
  "status": "IMPLICIT_CANDIDATE",
  "f4Category": "C",
  "recipientPaths": [
    {
      "pathId": "ROLE:000",
      "channel": "ROLE",
      "status": "IMPLICIT_CANDIDATE",
      "relation": "DECLARED_SOURCE_MODEL_ROLE",
      "roleId": "recipient",
      "targetBinding": null,
      "presentation": "STRUCTURALLY_SUPPORTED_NOT_PRESENTED",
      "unknownReason": "Contract-level applicability role is not an explicit edge from this clause to that recipient."
    }
  ],
  "unknownReason": null
}
```

Доказательства producer: [books/tyranids/v2/app-build.mjs:164](../../books/tyranids/v2/app-build.mjs#L164); [books/tyranids/v2/build.py:20](../../books/tyranids/v2/build.py#L20); [books/tyranids/v2/roster-import-build.mjs:14](../../books/tyranids/v2/roster-import-build.mjs#L14); [books/tyranids/v2/rule-contract-build.mjs:19](../../books/tyranids/v2/rule-contract-build.mjs#L19). Путь исходной runtime-записи: [books/tyranids/v2/generated/roster-runtime.json](../../books/tyranids/v2/generated/roster-runtime.json) `/entities/24`.

Ограничение: Физический roster/instance и battle context здесь не инстанцированы; это статическая связь, не UI-наблюдение. Другие пункты этого владельца: `battle-dependent`, `roster-known`.

#### tyranids / `detachment-subterranean-assault:rule`

```json
{
  "bookId": "tyranids",
  "entityId": "detachment-subterranean-assault:rule",
  "clauseId": "battle-dependent",
  "sourceId": "tyranids-waha-11e-2026-09-27",
  "sourcePaths": [
    {
      "path": "books/tyranids/sources/waha-11e-current-2026-09-27/corpus.json",
      "status": "RESOLVED"
    },
    {
      "path": "books/tyranids/sources/waha-11e-current-2026-09-27/tyranids.html",
      "status": "RESOLVED"
    }
  ],
  "sourceFields": [
    [
      "text"
    ]
  ],
  "quote": "Each time a BURROWER unit from your army is set up on the battlefield from Reserves, place a circular 40mm Tunnel Marker anywhere on the battlefield within 1\" o",
  "rosterClassification": "BATTLE_ONLY",
  "status": "IMPLICIT_CANDIDATE",
  "f4Category": null,
  "recipientPaths": [
    {
      "pathId": "ROLE:000",
      "channel": "ROLE",
      "status": "IMPLICIT_CANDIDATE",
      "relation": "DECLARED_ROSTER_UNITS_ROLE",
      "roleId": "recipient",
      "targetBinding": null,
      "presentation": "UNKNOWN",
      "unknownReason": "Contract-level applicability role is not an explicit edge from this clause to that recipient."
    }
  ],
  "unknownReason": null
}
```

Доказательства producer: [books/tyranids/v2/app-build.mjs:164](../../books/tyranids/v2/app-build.mjs#L164); [books/tyranids/v2/build.py:20](../../books/tyranids/v2/build.py#L20); [books/tyranids/v2/roster-import-build.mjs:14](../../books/tyranids/v2/roster-import-build.mjs#L14); [books/tyranids/v2/rule-contract-build.mjs:19](../../books/tyranids/v2/rule-contract-build.mjs#L19). Путь исходной runtime-записи: [books/tyranids/v2/generated/roster-runtime.json](../../books/tyranids/v2/generated/roster-runtime.json) `/entities/5`.

Ограничение: Физический roster/instance и battle context здесь не инстанцированы; это статическая связь, не UI-наблюдение. Другие пункты этого владельца: `battle-dependent`, `roster-known`.

### DG: Arch Contaminator → Lord of Contagion → Deathshroud

Arch Contaminator (`detachment-virulent-vectorium:enhancement:3`, `attack-reroll`) имеет assignment eligible-owner MODEL и отдельный affected-unit UNIT. У последней роли нет recipient purpose; ALWAYS и FIELD bearerUnitModelAttacks не задают физическое ребро bearer → formed recipients. Поэтому эта опись не утверждает передачу Arch Contaminator Deathshroud. Lord of Contagion и Deathshroud проверяются отдельными приведёнными записями: собственные melee/leader grants не заменяют отсутствующую адресацию Enhancement. Цену, состав, attachment или бой опись не вычисляет.

### AM и CSM: что именно сравнивается

Control Edict принадлежит Skitarii Marshal, а не всем Tech-priest. У Datasmith Battle Protocols и начальное Data-severed membership — разные clauses. Noospheric Transference содержит самостоятельные selection/choice/option пункты: контрактный beneficiary не подставляется автоматически в каждый clause-role. CSM имеет явно типизированные SOURCE_UNIT/SOURCE_FORMED_MODELS и зависимые роли; это не основание переносить их смысл в DG/AM без такого же ребра. У SM/BA/DA DISPLAY_ONLY и OWNER/ALWAYS — подтверждённый способ сохранить текст владельца, а не доказательство receiver или BATTLE_ONLY.

## 4. Расхождения одинаково называемых игровых понятий

Таблицы ниже показывают **реальные структурные аналоги**, не устанавливают равенство игровой семантики. Полный набор ID для каждой ячейки находится в `conceptComparison[].books[].recordIds`. Ноль означает UNKNOWN для сопоставления понятия по данному структурному критерию, а не отсутствие правила в источнике.

### bearer’s unit

UNIT от источника / formed scope. Английский текст не разрешает связь автоматически.

| Книга | Совпавших clauses | Без clauses | Проверяемый пример |
|---|---:|---:|---|
| adeptus-mechanicus | 14 | 0 | `datasheet-cybernetica-datasmith:section:1` / `data-severed` |
| blood-angels | 34 | 0 | `ability-ba-16b14dac906045e3a48b` / `review/ability-ba-16b14dac906045e3a48b/text/0:57` |
| chaos-space-marines | 2 | 0 | `datasheet-master-of-possession:section:1:block:0:text` / `charge-roll-clause` |
| dark-angels | 36 | 0 | `ability-da-490661bbb1ff4d45a4b8` / `review/ability-da-490661bbb1ff4d45a4b8/text/0:111` |
| death-guard | 4 | 0 | `datasheet-plague-drones:section:1` / `source-clause-3` |
| emperors-children | 10 | 0 | `datasheet-daemonettes:section:1` / `instrument-of-chaos` |
| space-marines | 31 | 0 | `ability-sm-044155170e2840d9` / `press-attack-qualified-baseline` |
| tau-empire | 8 | 0 | `datasheet-cadre-fireblade:section:1` / `volley-fire` |
| tyranids | 8 | 0 | `datasheet-broodlord:section:1` / `roster-known` |

### models in the bearer’s unit

Физические MODEL и formed MODEL считаются отдельно. Английский текст не разрешает связь автоматически.

| Книга | Совпавших clauses | Без clauses | Проверяемый пример |
|---|---:|---:|---|
| adeptus-mechanicus | 11 | 0 | `datasheet-tech-priest-dominus:section:1` / `block-1` |
| blood-angels | 5 | 0 | `ability-ba-630ec2727ede4d3f85a2` / `blood-chalice-toughness` |
| chaos-space-marines | 12 | 0 | `datasheet-dark-commune:section:1:block:0:text` / `model-invulnerable` |
| dark-angels | 7 | 0 | `ability-da-4d1396f4342347baa772` / `astartes-banner` |
| death-guard | 9 | 0 | `datasheet-biologus-putrifier:section:1` / `source-clause-1` |
| emperors-children | 6 | 0 | `datasheet-daemonettes:section:1` / `source-effect-1` |
| space-marines | 5 | 0 | `ability-sm-171a2821469d4d0e` / `skilled-riders-mobile-models` |
| tau-empire | 4 | 0 | `datasheet-commander-in-coldstar-battlesuit:section:1` / `coldstar-commander` |
| tyranids | 2 | 0 | `detachment-talons-of-the-norn-queen:enhancement:2` / `roster-known` |

### while this model is leading a unit

Только реальный predicate LEADING. Английский текст не разрешает связь автоматически.

| Книга | Совпавших clauses | Без clauses | Проверяемый пример |
|---|---:|---:|---|
| adeptus-mechanicus | 19 | 0 | `datasheet-cybernetica-datasmith:section:1` / `battle-protocols` |
| blood-angels | 0 | 0 | UNKNOWN — структурное сопоставление не доказано |
| chaos-space-marines | 12 | 0 | `datasheet-chaos-lord-with-jump-pack:section:1:block:1:text` / `source-clause` |
| dark-angels | 0 | 0 | UNKNOWN — структурное сопоставление не доказано |
| death-guard | 9 | 0 | `datasheet-biologus-putrifier:section:1` / `source-clause-1` |
| emperors-children | 3 | 0 | `datasheet-lord-exultant:section:1` / `roster-known` |
| space-marines | 0 | 0 | UNKNOWN — структурное сопоставление не доказано |
| tau-empire | 7 | 0 | `datasheet-cadre-fireblade:section:1` / `volley-fire` |
| tyranids | 2 | 0 | `datasheet-broodlord:section:1` / `roster-known` |

### that unit

Только sourceRoleId / prerequisites; местоимение не разрешается по тексту. Английский текст не разрешает связь автоматически.

| Книга | Совпавших clauses | Без clauses | Проверяемый пример |
|---|---:|---:|---|
| adeptus-mechanicus | 5 | 0 | `detachment-data-psalm-conclave:rule` / `citation-in-savagery` |
| blood-angels | 0 | 0 | UNKNOWN — структурное сопоставление не доказано |
| chaos-space-marines | 0 | 0 | UNKNOWN — структурное сопоставление не доказано |
| dark-angels | 0 | 0 | UNKNOWN — структурное сопоставление не доказано |
| death-guard | 0 | 0 | UNKNOWN — структурное сопоставление не доказано |
| emperors-children | 0 | 0 | UNKNOWN — структурное сопоставление не доказано |
| space-marines | 0 | 0 | UNKNOWN — структурное сопоставление не доказано |
| tau-empire | 0 | 0 | UNKNOWN — структурное сопоставление не доказано |
| tyranids | 0 | 0 | UNKNOWN — структурное сопоставление не доказано |

### лидерский бонус Bodyguard

BODYGUARD_ID либо LEADERS_OF_SOURCE; направление гранта сохраняется. Английский текст не разрешает связь автоматически.

| Книга | Совпавших clauses | Без clauses | Проверяемый пример |
|---|---:|---:|---|
| adeptus-mechanicus | 6 | 0 | `datasheet-cybernetica-datasmith:section:1` / `battle-protocols` |
| blood-angels | 0 | 0 | UNKNOWN — структурное сопоставление не доказано |
| chaos-space-marines | 0 | 0 | UNKNOWN — структурное сопоставление не доказано |
| dark-angels | 0 | 0 | UNKNOWN — структурное сопоставление не доказано |
| death-guard | 3 | 0 | `datasheet-deathshroud-terminators:section:1` / `source-clause-1` |
| emperors-children | 0 | 0 | UNKNOWN — структурное сопоставление не доказано |
| space-marines | 0 | 0 | UNKNOWN — структурное сопоставление не доказано |
| tau-empire | 0 | 0 | UNKNOWN — структурное сопоставление не доказано |
| tyranids | 1 | 0 | `datasheet-tyrant-guard:section:1` / `roster-known` |

### ауры дружественным отрядам

Только typed AURA_UNRESOLVED; остальные — отдельные reviewed controls. Английский текст не разрешает связь автоматически.

| Книга | Совпавших clauses | Без clauses | Проверяемый пример |
|---|---:|---:|---|
| adeptus-mechanicus | 0 | 0 | UNKNOWN — структурное сопоставление не доказано |
| blood-angels | 0 | 0 | UNKNOWN — структурное сопоставление не доказано |
| chaos-space-marines | 0 | 0 | UNKNOWN — структурное сопоставление не доказано |
| dark-angels | 3 | 0 | `ability-da-531bbeae023c4f4fa766` / `review/ability-da-531bbeae023c4f4fa766/text/110:135` |
| death-guard | 0 | 0 | UNKNOWN — структурное сопоставление не доказано |
| emperors-children | 0 | 0 | UNKNOWN — структурное сопоставление не доказано |
| space-marines | 0 | 0 | UNKNOWN — структурное сопоставление не доказано |
| tau-empire | 0 | 0 | UNKNOWN — структурное сопоставление не доказано |
| tyranids | 0 | 0 | UNKNOWN — структурное сопоставление не доказано |

### условный выбор игрока

Явно зарегистрированные control examples выбора; не поиск английских слов. Английский текст не разрешает связь автоматически.

| Книга | Совпавших clauses | Без clauses | Проверяемый пример |
|---|---:|---:|---|
| adeptus-mechanicus | 8 | 0 | `datasheet-cybernetica-datasmith:section:1` / `battle-protocols` |
| blood-angels | 0 | 0 | UNKNOWN — структурное сопоставление не доказано |
| chaos-space-marines | 14 | 0 | `detachment-pactbound-zealots:rule` / `dark-pact-phase-effects` |
| dark-angels | 0 | 0 | UNKNOWN — структурное сопоставление не доказано |
| death-guard | 2 | 0 | `detachment-flyblown-host:rule` / `exclusive-detachment` |
| emperors-children | 0 | 0 | UNKNOWN — структурное сопоставление не доказано |
| space-marines | 0 | 0 | UNKNOWN — структурное сопоставление не доказано |
| tau-empire | 4 | 0 | `detachment-auxiliary-cadre:enhancement:1` / `detachment-auxiliary-cadre:enhancement:1#chosen-units-deep-strike` |
| tyranids | 2 | 0 | `detachment-subterranean-assault:rule` / `battle-dependent` |

### неизвестные обстоятельства боя

Реальные BATTLE-предикаты / policy; UNKNOWN не равен применённому эффекту. Английский текст не разрешает связь автоматически.

| Книга | Совпавших clauses | Без clauses | Проверяемый пример |
|---|---:|---:|---|
| adeptus-mechanicus | 87 | 0 | `army-rule-doctrina-imperatives:conqueror-imperative` / `imperative-clause-1` |
| blood-angels | 13 | 0 | `ability-ba-16b14dac906045e3a48b` / `review/ability-ba-16b14dac906045e3a48b/text/0:57` |
| chaos-space-marines | 217 | 0 | `army-rule-dark-pacts` / `pact-weapon-abilities` |
| dark-angels | 17 | 0 | `ability-da-490661bbb1ff4d45a4b8` / `review/ability-da-490661bbb1ff4d45a4b8/text/0:111` |
| death-guard | 30 | 0 | `detachment-champions-of-contagion:enhancement:1` / `additional-plague` |
| emperors-children | 8 | 0 | `detachment-carnival-of-excess:enhancement:1` / `heroic-intervention` |
| space-marines | 0 | 0 | UNKNOWN — структурное сопоставление не доказано |
| tau-empire | 122 | 0 | `army-rule-for-the-greater-good:definition` / `army-rule-for-the-greater-good:definition#guided-bs-and-markerlight` |
| tyranids | 9 | 0 | `datasheet-broodlord:section:1` / `conditional-block-1` |

Существенные противоречия: literal bearer’s unit может быть физическим SOURCE_UNIT, formed MODEL или лишь текстом OWNER; одинаковая фраза не выбирает один из них. LEADING — доказанный roster predicate, но сам по себе не адрес получателя бонуса. `that unit` требует sourceRoleId/prerequisites/конкретного binding. Типизированная аура BA/DA отличается от поля дальности/сырого текста другой книги; остальные ауры по отсутствию typed policy не объявляются отсутствующими. Условный выбор и неизвестный бой сохраняются как текст/UNKNOWN, не как выполненное игровое действие.

## 5. Почему классификация Detachment clauses различается

| Книга | Все contract classifications | Только DETACHMENT_RULE clauses | Неконтрактных Detachment entities |
|---|---|---|---:|
| adeptus-mechanicus | `BATTLE_ONLY` × 175; `NOT_AN_EFFECT` × 70; `ROSTER_EXECUTABLE` × 44 | `BATTLE_ONLY` × 23; `NOT_AN_EFFECT` × 1; `ROSTER_EXECUTABLE` × 6 | 0 |
| blood-angels | `DISPLAY_ONLY` × 711; `ROSTER_EXECUTABLE` × 43 | `DISPLAY_ONLY` × 31; `ROSTER_EXECUTABLE` × 2 | 1 |
| chaos-space-marines | `BATTLE_ONLY` × 301; `DISPLAY_ONLY` × 31; `NOT_AN_EFFECT` × 17; `ROSTER_EXECUTABLE` × 61 | `BATTLE_ONLY` × 43; `DISPLAY_ONLY` × 3; `NOT_AN_EFFECT` × 15; `ROSTER_EXECUTABLE` × 9 | 0 |
| dark-angels | `DISPLAY_ONLY` × 718; `ROSTER_EXECUTABLE` × 51 | `DISPLAY_ONLY` × 30; `ROSTER_EXECUTABLE` × 4 | 1 |
| death-guard | `BATTLE_ONLY` × 158; `DISPLAY_ONLY` × 11; `NOT_AN_EFFECT` × 112; `ROSTER_EXECUTABLE` × 25 | `BATTLE_ONLY` × 9; `NOT_AN_EFFECT` × 4; `ROSTER_EXECUTABLE` × 4 | 0 |
| emperors-children | `BATTLE_ONLY` × 8; `NOT_AN_EFFECT` × 2; `ROSTER_EXECUTABLE` × 28 | `BATTLE_ONLY` × 1; `ROSTER_EXECUTABLE` × 2 | 9 |
| space-marines | `DISPLAY_ONLY` × 905; `ROSTER_EXECUTABLE` × 58 | `DISPLAY_ONLY` × 56; `ROSTER_EXECUTABLE` × 4 | 1 |
| tau-empire | `BATTLE_ONLY` × 225; `DISPLAY_ONLY` × 49; `ROSTER_EXECUTABLE` × 34 | `BATTLE_ONLY` × 12; `ROSTER_EXECUTABLE` × 2 | 0 |
| tyranids | `BATTLE_ONLY` × 9; `ROSTER_EXECUTABLE` × 20 | `BATTLE_ONLY` × 2; `ROSTER_EXECUTABLE` × 4 | 8 |

**adeptus-mechanicus — доказанная причина в producer.** Книжные typed declarations задают классификацию каждого пункта. Roster-build заполняет отсутствующий BATTLE_ONLY только для STRATAGEM+BATTLE_ACTION; это не общий классификатор всех Detachment-текстов. Доказательства: [books/adeptus-mechanicus/v2/roster-build.mjs:13](../../books/adeptus-mechanicus/v2/roster-build.mjs#L13); [books/adeptus-mechanicus/v2/roster-build.mjs:29](../../books/adeptus-mechanicus/v2/roster-build.mjs#L29); [books/adeptus-mechanicus/v2/rule-contract-build.mjs:12](../../books/adeptus-mechanicus/v2/rule-contract-build.mjs#L12); [books/adeptus-mechanicus/v2/rule-contract-build.mjs:55](../../books/adeptus-mechanicus/v2/rule-contract-build.mjs#L55); [books/adeptus-mechanicus/v2/rule-contract-build.mjs:69](../../books/adeptus-mechanicus/v2/rule-contract-build.mjs#L69).

**blood-angels — доказанная причина в producer.** Явно lowered spans становятся ROSTER_EXECUTABLE; остальные reviewed spans — DISPLAY_ONLY. Часть DISPLAY_ONLY имеет отдельно подтверждённую conditionalPolicy. Наследуемые SM contracts копируются с ограниченной membership. Доказательства: [books/blood-angels/v2/roster-build.mjs:110](../../books/blood-angels/v2/roster-build.mjs#L110); [books/blood-angels/v2/rule-contract-build.mjs:23](../../books/blood-angels/v2/rule-contract-build.mjs#L23); [books/blood-angels/v2/rule-contract-build.mjs:39](../../books/blood-angels/v2/rule-contract-build.mjs#L39); [books/blood-angels/v2/rule-contract-build.mjs:44](../../books/blood-angels/v2/rule-contract-build.mjs#L44); [books/blood-angels/v2/rule-contract-build.mjs:107](../../books/blood-angels/v2/rule-contract-build.mjs#L107); [books/blood-angels/v2/rule-contract-build.mjs:115](../../books/blood-angels/v2/rule-contract-build.mjs#L115); [books/blood-angels/v2/rule-contract-build.mjs:147](../../books/blood-angels/v2/rule-contract-build.mjs#L147); [books/blood-angels/v2/rule-contract-build.mjs:153](../../books/blood-angels/v2/rule-contract-build.mjs#L153); [books/blood-angels/v2/rule-contract-build.mjs:159](../../books/blood-angels/v2/rule-contract-build.mjs#L159).

**chaos-space-marines — доказанная причина в producer.** Исходные declaration inventories, productClassification и executionMode задают fallback BATTLE_ONLY / NOT_AN_EFFECT / DISPLAY_ONLY. Только reviewed roster-known operations/semanticEffects проходят lowering в ROSTER_EXECUTABLE. Доказательства: [books/chaos-space-marines/v2/rule-contract-build.mjs:12](../../books/chaos-space-marines/v2/rule-contract-build.mjs#L12); [books/chaos-space-marines/v2/rule-contract-build.mjs:28](../../books/chaos-space-marines/v2/rule-contract-build.mjs#L28); [books/chaos-space-marines/v2/rule-contract-build.mjs:47](../../books/chaos-space-marines/v2/rule-contract-build.mjs#L47).

**dark-angels — доказанная причина в producer.** Reviewed lowering, DISPLAY_ONLY fallback и отдельные typed policies, как у BA; Chapter grants — отдельные явные declarations. Метка не описывает автоматически боевую условность текста. Доказательства: [books/dark-angels/v2/rule-contract-build.mjs:22](../../books/dark-angels/v2/rule-contract-build.mjs#L22); [books/dark-angels/v2/rule-contract-build.mjs:38](../../books/dark-angels/v2/rule-contract-build.mjs#L38); [books/dark-angels/v2/rule-contract-build.mjs:43](../../books/dark-angels/v2/rule-contract-build.mjs#L43); [books/dark-angels/v2/rule-contract-build.mjs:90](../../books/dark-angels/v2/rule-contract-build.mjs#L90); [books/dark-angels/v2/rule-contract-build.mjs:98](../../books/dark-angels/v2/rule-contract-build.mjs#L98); [books/dark-angels/v2/rule-contract-build.mjs:130](../../books/dark-angels/v2/rule-contract-build.mjs#L130); [books/dark-angels/v2/rule-contract-build.mjs:136](../../books/dark-angels/v2/rule-contract-build.mjs#L136); [books/dark-angels/v2/rule-contract-build.mjs:142](../../books/dark-angels/v2/rule-contract-build.mjs#L142).

**death-guard — доказанная причина в producer.** basicContract исторически классифицирует source payload и категории; unlowered Enhancement/ability payload обычно BATTLE_ONLY, отдельные категории DISPLAY_ONLY, структурные разделы NOT_AN_EFFECT. Исполняемость добавляется конечным allowlist с точной проверкой цитаты. Доказательства: [books/death-guard/v2/roster-contract-build.mjs:31](../../books/death-guard/v2/roster-contract-build.mjs#L31); [books/death-guard/v2/roster-contract-build.mjs:44](../../books/death-guard/v2/roster-contract-build.mjs#L44); [books/death-guard/v2/roster-contract-build.mjs:114](../../books/death-guard/v2/roster-contract-build.mjs#L114); [books/death-guard/v2/roster-contract-build.mjs:119](../../books/death-guard/v2/roster-contract-build.mjs#L119); [books/death-guard/v2/roster-contract-build.mjs:127](../../books/death-guard/v2/roster-contract-build.mjs#L127); [books/death-guard/v2/rule-contract-build.mjs:19](../../books/death-guard/v2/rule-contract-build.mjs#L19); [books/death-guard/v2/rule-contract-build.mjs:22](../../books/death-guard/v2/rule-contract-build.mjs#L22); [books/death-guard/v2/rule-contract-build.mjs:31](../../books/death-guard/v2/rule-contract-build.mjs#L31); [books/death-guard/v2/rule-contract-build.mjs:44](../../books/death-guard/v2/rule-contract-build.mjs#L44).

**emperors-children — доказанная причина в producer.** Ограниченный overlay прямых эффектов/permissions/formations. Permission-reference и battle payload — разные clauses. Остальные canonical rules producer прямо не классифицирует; нельзя объявить их все BATTLE_ONLY. Доказательства: [books/emperors-children/v2/rule-contract-build.mjs:30](../../books/emperors-children/v2/rule-contract-build.mjs#L30); [books/emperors-children/v2/rule-contract-build.mjs:33](../../books/emperors-children/v2/rule-contract-build.mjs#L33); [books/emperors-children/v2/rule-contract-build.mjs:90](../../books/emperors-children/v2/rule-contract-build.mjs#L90); [books/emperors-children/v2/rule-contract-build.mjs:153](../../books/emperors-children/v2/rule-contract-build.mjs#L153); [books/emperors-children/v2/rule-contract-build.mjs:202](../../books/emperors-children/v2/rule-contract-build.mjs#L202).

**space-marines — доказанная причина в producer.** Reviewed lowering даёт ROSTER_EXECUTABLE; fallback DISPLAY_ONLY сохраняет независимые source spans. Nested rules сохраняют parent chain. TEXT_ONLY в review ledger прямо не утверждает ни условность, ни невозможность автоматизации. Доказательства: [books/space-marines/v2/rule-contract-build.mjs:25](../../books/space-marines/v2/rule-contract-build.mjs#L25); [books/space-marines/v2/rule-contract-build.mjs:90](../../books/space-marines/v2/rule-contract-build.mjs#L90); [books/space-marines/v2/rule-contract-build.mjs:98](../../books/space-marines/v2/rule-contract-build.mjs#L98); [books/space-marines/v2/rule-contract-build.mjs:143](../../books/space-marines/v2/rule-contract-build.mjs#L143); [books/space-marines/v2/rule-contract-build.mjs:151](../../books/space-marines/v2/rule-contract-build.mjs#L151); [books/space-marines/v2/rule-contract-build.mjs:155](../../books/space-marines/v2/rule-contract-build.mjs#L155).

**tau-empire — доказанная причина в producer.** Review status сопоставляется с typed lowering: CONDITIONAL/DISPLAY обычно BATTLE_ONLY, кроме явных static presentation sections; CAPABILITY_MISSING/SOURCE_CONFLICT/NOT_PROVEN остаются DISPLAY_ONLY. Физические source choices — дополнительный runtime overlay. Доказательства: [books/tau-empire/v2/rule-contract-build.mjs:18](../../books/tau-empire/v2/rule-contract-build.mjs#L18); [books/tau-empire/v2/rule-contract-build.mjs:127](../../books/tau-empire/v2/rule-contract-build.mjs#L127); [books/tau-empire/v2/rule-contract-build.mjs:133](../../books/tau-empire/v2/rule-contract-build.mjs#L133).

**tyranids — доказанная причина в producer.** Классифицируется только конечный reviewed allowlist. Остальные фактические тексты остаются без contracts; deferred metadata не является классификацией каждого uncontracted owner. Доказательства: [books/tyranids/v2/rule-contract-build.mjs:19](../../books/tyranids/v2/rule-contract-build.mjs#L19); [books/tyranids/v2/rule-contract-build.mjs:21](../../books/tyranids/v2/rule-contract-build.mjs#L21); [books/tyranids/v2/rule-contract-build.mjs:87](../../books/tyranids/v2/rule-contract-build.mjs#L87); [books/tyranids/v2/rule-contract-build.mjs:107](../../books/tyranids/v2/rule-contract-build.mjs#L107); [books/tyranids/v2/rule-contract-build.mjs:150](../../books/tyranids/v2/rule-contract-build.mjs#L150).

**Наблюдаемое различие без доказанной причины:** степень покрытия контрактами и семантическая эквивалентность похожих английских правил между книгами не выводятся из классификации. Почему конкретный нелowered span не был переведён в другой producer-механизм, если ledger этого не объясняет, — UNKNOWN. Числа рассчитаны по каждому clause, общая метка книги не назначается.

## 6. Числа для планирования F4

Категории взаимоисключающие **для записи clause**: A — существующий static presentation route для всех её доказанных каналов; B — адресован, но conditional receiver-text route отсутствует; C — частичное/кандидатное/смешанное покрытие; D — у существующего clause нет отдельного receiver encoding, только owner roles; E — UNKNOWN либо текст без clause. D не означает, что известен новый source fact или гарантирована отдельная задача по данным. Доказанные NONE с ROSTER_COMMAND_POINTS / SOURCE_BACKED_MUSTERING_RESTRICTION и локальной ROSTER recipient-role вынесены в N: у них не UNIT/MODEL-получатель, и их нельзя подменять UNKNOWN или задачей F4.

Семейство leader/support определяется структурными attachment relations и LEADING/formed/leader bindings, а не английскими названиями. Оно включает личные способности таких source units: эти числа не равны числу бонусов Bodyguard. Неконтрактные сущности учитываются отдельно и не увеличивают число clauses.

В ячейках: **clauses / independent recipient paths / uncontracted entities**. При mixed clause категория C может иметь ноль C-paths: его отдельные пути остаются, например, A и B. Поэтому нельзя суммировать колонку путей только внутри clauses той же категории. Полная cross-check структура сохранена в JSON.

| Книга | Семейство | A | B | C | D | E | N: NONE clauses | Всего A–E clauses / paths / без clauses |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| adeptus-mechanicus | ENHANCEMENT | 4 / 34 / 0 | 22 / 43 / 0 | 21 / 0 / 0 | 3 / 0 / 0 | 0 / 0 / 0 | 0 | 50 / 77 / 0 |
| adeptus-mechanicus | LEADER_SUPPORT_ABILITY | 6 / 7 / 0 | 2 / 2 / 0 | 1 / 1 / 0 | 6 / 0 / 0 | 0 / 0 / 0 | 0 | 15 / 10 / 0 |
| blood-angels | ENHANCEMENT | 17 / 27 / 0 | 0 / 0 / 0 | 0 / 0 / 0 | 83 / 0 / 0 | 0 / 0 / 0 | 0 | 100 / 27 / 0 |
| blood-angels | LEADER_SUPPORT_ABILITY | 23 / 26 / 0 | 0 / 0 / 0 | 0 / 0 / 0 | 91 / 0 / 0 | 0 / 0 / 0 | 0 | 114 / 26 / 0 |
| chaos-space-marines | ENHANCEMENT | 1 / 44 / 0 | 40 / 79 / 0 | 32 / 3 / 0 | 10 / 0 / 0 | 0 / 0 / 0 | 6 | 83 / 126 / 0 |
| chaos-space-marines | LEADER_SUPPORT_ABILITY | 4 / 5 / 0 | 7 / 8 / 0 | 21 / 20 / 0 | 21 / 0 / 0 | 0 / 0 / 0 | 0 | 53 / 33 / 0 |
| dark-angels | ENHANCEMENT | 17 / 28 / 0 | 0 / 0 / 0 | 0 / 0 / 0 | 83 / 0 / 0 | 0 / 0 / 0 | 0 | 100 / 28 / 0 |
| dark-angels | LEADER_SUPPORT_ABILITY | 24 / 30 / 0 | 0 / 0 / 0 | 0 / 0 / 0 | 94 / 0 / 0 | 0 / 0 / 0 | 0 | 118 / 30 / 0 |
| death-guard | ENHANCEMENT | 0 / 12 / 0 | 0 / 0 / 0 | 18 / 11 / 0 | 0 / 0 / 0 | 18 / 26 / 0 | 0 | 36 / 49 / 0 |
| death-guard | LEADER_SUPPORT_ABILITY | 0 / 8 / 0 | 0 / 0 / 0 | 23 / 23 / 0 | 0 / 0 / 0 | 0 / 0 / 0 | 0 | 23 / 31 / 0 |
| emperors-children | ENHANCEMENT | 0 / 59 / 0 | 3 / 23 / 0 | 21 / 6 / 0 | 0 / 0 / 0 | 0 / 0 / 18 | 0 | 24 / 88 / 18 |
| emperors-children | LEADER_SUPPORT_ABILITY | 0 / 8 / 0 | 0 / 6 / 0 | 6 / 4 / 0 | 0 / 0 / 0 | 0 / 0 / 2 | 0 | 6 / 18 / 2 |
| space-marines | ENHANCEMENT | 25 / 43 / 0 | 0 / 0 / 0 | 0 / 0 / 0 | 116 / 0 / 0 | 0 / 0 / 0 | 0 | 141 / 43 / 0 |
| space-marines | LEADER_SUPPORT_ABILITY | 23 / 26 / 0 | 0 / 0 / 0 | 0 / 0 / 0 | 141 / 0 / 0 | 0 / 0 / 0 | 0 | 164 / 26 / 0 |
| tau-empire | ENHANCEMENT | 6 / 8 / 0 | 0 / 0 / 0 | 26 / 26 / 0 | 1 / 0 / 0 | 0 / 0 / 0 | 0 | 33 / 34 / 0 |
| tau-empire | LEADER_SUPPORT_ABILITY | 8 / 10 / 0 | 0 / 0 / 0 | 17 / 17 / 0 | 0 / 0 / 0 | 0 / 0 / 0 | 0 | 25 / 27 / 0 |
| tyranids | ENHANCEMENT | 0 / 15 / 0 | 0 / 11 / 0 | 14 / 3 / 0 | 0 / 0 / 0 | 0 / 0 / 23 | 0 | 14 / 29 / 23 |
| tyranids | LEADER_SUPPORT_ABILITY | 0 / 5 / 0 | 0 / 5 / 0 | 9 / 4 / 0 | 0 / 0 / 0 | 0 / 0 / 4 | 0 | 9 / 14 / 4 |

B–D — планировочные группы, **не обещание исправления общим кодом без изменения данных и нового аудита**. Для E не выбирается трактовка по умолчанию. Runtime gates не проверялись на физическом ростере; поэтому A не заявляется браузерным PASS.

**UNKNOWN:** 1453 записей, из них 1316 существующих clauses и 137 текстовых сущностей без clauses; 51 отдельных путей UNKNOWN. Кроме этих чисел, semanticEquivalence в сравнении понятий остаётся UNKNOWN: это другая ось неопределённости, не дополнительные clauses.

**Пять главных расхождений:**

1. SM/BA/DA используют reviewed DISPLAY_ONLY и OWNER/ALWAYS; DG/AM/CSM используют другие модели roles и BATTLE_ONLY. Это разные результаты producers, а не одинаковый F1-адрес.
2. DG Arch Contaminator имеет affected-unit без доказанного source-to-formed binding; существующие LoC/Deathshroud эффекты не доказывают передачу этого Enhancement.
3. Книжные effects явно различают SOURCE_UNIT, физические MODEL и formed MODEL; отсутствие purpose либо одинаковый datasheet не задаёт тот же физический recipient.
4. BA/DA typed conditional policies дают отдельный строгий presentation route; ordinary BATTLE_ONLY и contract-level beneficiary не получают его автоматически.
5. EC/Tyranids ограничивают lowering выбранными owners, Tau дополнительно вводит clauses из подтверждённых физических source choices. Непокрытый static text и отсутствующий runtime mechanism — разные выводы.

**Контроль результата:** script проверяет девять книг, уникальные entity IDs внутри книги и clause IDs внутри owner, существование sourceFields, producer anchors/file paths, зарегистрированные исключения, суммы F4 и отсутствие изменений входов относительно базы. --check сравнивает оба файла побайтово. Неподтверждённые source paths завершают генерацию FAIL, а не превращаются в придуманную ссылку. Зарегистрированных исключений: 0.

**Ограничения:** источники не обновлялись, live ingestion и игровые генераторы не запускались; источниковедческая полнота RAW не доказывается. Нет браузерного подтверждения, новых ростеров или оценки игрового баланса. Literal schema extraction не покрывает все динамические factories; фактические FIELD occurrences при этом посчитаны полностью. Сопоставимость английских формулировок и незафиксированные physical/battle contexts остаются UNKNOWN. F4 не начата.

/** Read-only, static inventory. No gameplay interpretation from English prose. */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {subjects,levels,predicateTypes} from '../../books/shared/rule-contract-v2/schema.mjs';
import {detachmentTextDeclaration} from '../../books/shared/roster-v2/conditional-policy.mjs';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const BASE='8dbbb9e5f9032a009939d3dd70a62f1ac068ef8a';
const BOOKS={
 'adeptus-mechanicus':'roster-runtime','blood-angels':'roster-import',
 'chaos-space-marines':'roster-runtime','dark-angels':'roster-import',
 'death-guard':'rule-contract-effective','emperors-children':'roster-attachments',
 'space-marines':'roster-import','tau-empire':'roster-import','tyranids':'roster-runtime'
};
const cmp=(a,b)=>a<b?-1:a>b?1:0,sorted=items=>[...items].sort(cmp);
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const inputs=new Map(),exceptions=new Map(),refs=new Map(),textCache=new Map();
const invariant=(ok,message)=>{if(!ok)throw new Error(message);};
const exists=p=>fs.existsSync(path.join(ROOT,p));
function read(p){if(textCache.has(p))return textCache.get(p);invariant(!path.isAbsolute(p)&&!p.split('/').includes('..'),'Unsafe input '+p);const bytes=fs.readFileSync(path.join(ROOT,p));inputs.set(p,{path:p,sha256:sha(bytes),bytes:bytes.length});const text=bytes.toString('utf8').replace(/^\uFEFF/,'');textCache.set(p,text);return text;}
const json=p=>JSON.parse(read(p));
function cite(p,needle){const source=read(p),lines=source.split(/\r?\n/),line=lines.findIndex(line=>line.includes(needle))+1;invariant(line>0,'Missing citation anchor '+p+' '+needle);const ref={path:p,line,anchor:needle};refs.set(p+':'+line,ref);return ref;}
const loc=(file,pointer)=>({file,pointer});
const at=(v,p)=>p.reduce((v,k)=>v?.[k],v);
const pointer=parts=>'/'+parts.map(p=>String(p).replaceAll('~','~0').replaceAll('/','~1')).join('/');
const ordered=v=>Array.isArray(v)?v.map(ordered):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort(cmp).map(k=>[k,ordered(v[k])])):v;
const stable=v=>JSON.stringify(ordered(v));
const unique=items=>[...new Map(items.map(v=>[stable(v),v])).values()].sort((a,b)=>cmp(stable(a),stable(b)));
const leaves=v=>v?.op?(v.args||[]).flatMap(leaves):v?.predicate?[v]:[];
function walk(v,run,p=[]){if(!v||typeof v!=='object')return;run(v,p);for(const[k,c]of Object.entries(v))if(c&&typeof c==='object')walk(c,run,[...p,k]);}
function strings(v,p=[]){if(typeof v==='string')return [{path:p,text:v}];if(!v||typeof v!=='object')return [];return Object.entries(v).flatMap(([k,c])=>strings(c,[...p,k]));}
const effectsFile='books/shared/roster-v2/effects.mjs',policyFile='books/shared/roster-v2/conditional-policy.mjs',personalFile='books/shared/army-book-app-v2/personal.mjs';
const CODE={schema:cite('books/shared/rule-contract-v2/schema.mjs','export const predicateTypes'),
 effects:cite(effectsFile,'export function executeRosterEffects'),targets:cite(effectsFile,'const targets ='),
 owner:cite(effectsFile,'const ownerRole=rule.ruleContract.roles.find'),battle:cite(effectsFile,"clause.rosterClassification === 'BATTLE_ONLY'"),
 policy:cite(policyFile,'export function appendConditionalPolicy'),policyProof:cite(policyFile,'export function projectConditionalPolicy'),
 f1:cite(policyFile,'export function detachmentTextDeclaration'),project:cite(personalFile,'export function projectInstanceCards'),
 formed:cite(personalFile,'export function projectFormedUnitCards'),
 renderer:cite('books/shared/army-book-app-v2/datasheet-v1.mjs','for(const row of card.rosterConditionalPolicies'),
 text:cite('books/shared/army-book-app-v2/datasheet-v1.mjs','const displayRows=groupDetachmentTextRows'),
 source:cite('books/shared/army-book-app-v2/datasheet-v1.mjs','const renderSection='),
 bookSource:cite('books/shared/army-book-app-v2/book-v1.mjs','export function createBookPresenter'),
 effective:cite('books/shared/roster-v2/effective-instance.mjs','export function projectEffectiveInstance')};
const semanticLoweringEvidence=cite('books/chaos-space-marines/v2/roster-effect-build.mjs','sourceEvidence:clone(canonical.provenance.sourceEvidence),semanticEvidence:clone(semantic.evidence||clause.evidence)');

// Explicit, code-defined structural vocabulary. These labels describe the
// executed binding, never an inferred English meaning or a new recipient.
const BINDINGS={SOURCE_MODEL:'BEARER_MODEL',SOURCE_UNIT_MODELS:'PHYSICAL_SOURCE_UNIT_MODELS',
 SOURCE_FORMED_MODELS:'FORMED_SOURCE_UNIT_MODELS',SOURCE_UNIT:'PHYSICAL_SOURCE_UNIT',
 LEADERS_OF_SOURCE:'ATTACHED_LEADERS_MODELS',ROSTER_MODELS:'FRIENDLY_ROSTER_MODELS',ROSTER_UNITS:'FRIENDLY_ROSTER_UNITS'};
const SCOPES={PHYSICAL_UNIT:'PHYSICAL_SOURCE_UNIT',FORMED_UNIT:'FORMED_UNIT',AURA_UNRESOLVED:'FRIENDLY_UNITS_IN_UNRESOLVED_RADIUS',ROSTER_UNITS:'FRIENDLY_KEYWORD_UNITS'};
const RENDERED=new Set(['MODIFY_STAT','GRANT_MODEL_KEYWORD','GRANT_UNIT_KEYWORD','REMOVE_KEYWORD','GRANT_MODEL_ABILITY','GRANT_ABILITY','MODIFY_ABILITY_RANGE','REMOVE_ABILITY','GRANT_WEAPON_ABILITY','MODIFY_RULE_METRIC','CONTRIBUTE_WEAPON_PROFILE']);
const ownerPurposes=new Set(['OWNER','ANCHOR','TRIGGER_ACTOR']);
const recipientPurposes=new Set(['RECIPIENT','EFFECT_RECIPIENT','TARGET']);
const noncombatHeadings=new Set(['UNIT COMPOSITION','WARGEAR OPTIONS','LEADER','SUPPORT','TRANSPORT','DEPLOYMENT','KEYWORDS','FACTION KEYWORDS','MODEL DETAILS']);
const abilityHeadings=new Set(['ABILITIES','WARGEAR ABILITIES']);
const sum=(rows,key)=>rows.reduce((n,row)=>n+(row[key]||0),0);

// Populated below with reviewed producer edges, not generated-data authority.
const PRODUCTION = {
  "adeptus-mechanicus": {
    "runtimePath": "books/adeptus-mechanicus/v2/generated/roster-runtime.json",
    "producerRefs": [
      {
        "path": "books/adeptus-mechanicus/v2/build.py",
        "line": 44,
        "needle": "def build():",
        "role": "Native accepted factual producer"
      },
      {
        "path": "books/adeptus-mechanicus/v2/build.py",
        "line": 48,
        "needle": "corpus = read(SOURCE+'/corpus.json')",
        "role": "Pinned JSON corpus plus pinned HTML pages"
      },
      {
        "path": "books/adeptus-mechanicus/v2/build.py",
        "line": 322,
        "needle": "for operation in read('books/adeptus-mechanicus/v2/source-adjudications.json'):",
        "role": "Reviewed source adjudications"
      },
      {
        "path": "books/adeptus-mechanicus/v2/build.py",
        "line": 343,
        "needle": "for operation in official_updates['operations']:",
        "role": "Accepted official replacements"
      },
      {
        "path": "books/adeptus-mechanicus/v2/rule-contract-build.mjs",
        "line": 12,
        "needle": "export const declarationFiles=",
        "role": "Book-owned JSON semantic declaration inputs"
      },
      {
        "path": "books/adeptus-mechanicus/v2/rule-contract-build.mjs",
        "line": 55,
        "needle": "export function ownerInventory",
        "role": "Explicit rule-owner vs fact/reference inventory"
      },
      {
        "path": "books/adeptus-mechanicus/v2/rule-contract-build.mjs",
        "line": 69,
        "needle": "export function buildAdMechContracts",
        "role": "Typed contract binding with exact evidence"
      },
      {
        "path": "books/adeptus-mechanicus/v2/roster-build.mjs",
        "line": 13,
        "needle": "export function buildRosterRuntimeBook",
        "role": "Disposable runtime projection"
      },
      {
        "path": "books/adeptus-mechanicus/v2/roster-build.mjs",
        "line": 29,
        "needle": "clause.rosterClassification='BATTLE_ONLY'",
        "role": "Only missing Stratagem BATTLE_ACTION clause annotation"
      },
      {
        "path": "books/adeptus-mechanicus/v2/rule-contract-schema.mjs",
        "line": 5,
        "needle": "export function createAdMechSchema",
        "role": "State fields derived from declaration FIELD atoms"
      },
      {
        "path": "books/adeptus-mechanicus/v2/roster-runtime.mjs",
        "line": 45,
        "needle": "readJson('./generated/roster-runtime.json')",
        "role": "Actual browser execution input"
      },
      {
        "path": "books/adeptus-mechanicus/v2/app-build.mjs",
        "line": 18,
        "needle": "const built=buildAdMechContracts();",
        "role": "Presentation derives from same contract/factual producer"
      },
      {
        "path": "books/adeptus-mechanicus/v2/contract-datasheet-army-declarations.json",
        "line": 5055,
        "needle": "\"datasheet-skitarii-marshal:section:1\": {",
        "role": "Control Edict canonical ability-section owner"
      },
      {
        "path": "books/adeptus-mechanicus/v2/contract-datasheet-army-declarations.json",
        "line": 5185,
        "needle": "\"Control Edict: While this model is leading a unit",
        "role": "Exact reviewed Control Edict quote"
      },
      {
        "path": "books/adeptus-mechanicus/v2/contract-datasheet-army-declarations.json",
        "line": 18488,
        "needle": "\"datasheet-cybernetica-datasmith:section:1\": {",
        "role": "Battle Protocols and Data-severed shared section owner"
      },
      {
        "path": "books/adeptus-mechanicus/v2/contract-enhancement-detachment-declarations.json",
        "line": 5628,
        "needle": "\"halo-override-selection\"",
        "role": "Noospheric leading source selection clause"
      }
    ],
    "factInputs": [
      {
        "path": "books/adeptus-mechanicus/v2/sources/enrollment.json",
        "format": "JSON",
        "role": "Native accepted artifact registry"
      },
      {
        "path": "books/adeptus-mechanicus/sources/waha-11e-current-2026-09-25/corpus.json",
        "format": "JSON",
        "role": "Captured canonical facts"
      },
      {
        "path": "books/adeptus-mechanicus/sources/waha-11e-current-2026-09-25",
        "format": "HTML directory",
        "role": "Pinned raw pages for source normalization"
      },
      {
        "path": "books/adeptus-mechanicus/v2/source-adjudications.json",
        "format": "JSON",
        "role": "Reviewed field corrections"
      },
      {
        "path": "books/adeptus-mechanicus/v2/sources/official-v1.4-updates.json",
        "format": "JSON",
        "role": "Official source field operations"
      },
      {
        "path": "books/adeptus-mechanicus/v2/contract-datasheet-army-declarations.json",
        "format": "JSON",
        "role": "Book-owned typed declarations"
      },
      {
        "path": "books/adeptus-mechanicus/v2/contract-enhancement-detachment-declarations.json",
        "format": "JSON",
        "role": "Book-owned typed declarations"
      },
      {
        "path": "books/adeptus-mechanicus/v2/contract-stratagem-declarations.json",
        "format": "JSON",
        "role": "Book-owned typed declarations"
      }
    ],
    "classificationCauses": [
      {
        "category": "EXPLICIT_TYPED_DECLARATIONS",
        "cause": "Existing rule owners require a declaration or explicit blocked record; clauses carry their own rosterClassification/effects. No native fallback across all Army prose."
      },
      {
        "category": "STRATAGEM_RUNTIME_ANNOTATION",
        "cause": "roster-build assigns BATTLE_ONLY only when undefined, after asserting STRATAGEM+BATTLE_ACTION and no effects."
      },
      {
        "category": "OWNER_VERSUS_FACT",
        "cause": "ownerInventory explicitly excludes UNIT COMPOSITION, reference containers, attachment references, explicit no-wargear and product scope from rule-owner disposition."
      }
    ],
    "limits": "Entity and ruleContract kinds plus explicit clause extensions/classifications must be read together. DATASHEET_SECTION/DATASHEET_ABILITY includes non-effect declaration sections; no prose-only combat-ability heuristic is justified.",
    "examples": [
      {
        "concept": "conditional leader permission without executing battle rolls",
        "entityId": "datasheet-skitarii-marshal:section:1",
        "clauseId": "block-1",
        "note": "Control Edict is a Skitarii Marshal rule, not a Tech-priest identity; explicit LEADING condition does not turn its hit reroll into a roster effect."
      },
      {
        "concept": "initial roster membership versus protocol selection",
        "entityId": "datasheet-cybernetica-datasmith:section:1",
        "clauseId": "battle-protocols",
        "note": "Battle Protocols is BATTLE_ONLY, no selected protocol state is inferred; sibling data-severed computes initial membership keyword facts."
      },
      {
        "concept": "roster-known leadership physical recipients",
        "entityId": "datasheet-tech-priest-dominus:section:1",
        "clauseId": "block-1",
        "note": "SOURCE_FORMED_MODELS is explicit; companion Electro-priest clause is separately addressed."
      },
      {
        "concept": "UNIT source selection with multiple clauses and embedded table",
        "entityId": "detachment-haloscreed-battle-clade:rule",
        "clauseId": "halo-override-selection",
        "note": "All six clauses remain BATTLE_ONLY; selection/table/potential keyword declarations do not record a choice."
      }
    ],
    "controls": [
      "datasheet-skitarii-marshal:section:1",
      "datasheet-cybernetica-datasmith:section:1",
      "datasheet-kastelan-robots:section:1",
      "datasheet-tech-priest-dominus:section:1",
      "datasheet-tech-priest-manipulus:section:1",
      "datasheet-tech-priest-dominus:section:3",
      "detachment-haloscreed-battle-clade:rule"
    ]
  },
  "death-guard": {
    "runtimePath": "books/death-guard/v2/generated/rule-contract-effective.json",
    "producerRefs": [
      {
        "path": "books/death-guard/v2/build.mjs",
        "line": 20,
        "needle": "export function buildFactualV2",
        "role": "Accepted corpus, original pinned pages and overlay foundation"
      },
      {
        "path": "books/death-guard/v2/build.mjs",
        "line": 39,
        "needle": "const normalized = normalizeDeathGuardCorpus",
        "role": "Normalize pinned source occurrences"
      },
      {
        "path": "books/death-guard/v2/build.mjs",
        "line": 46,
        "needle": "const projected = applyOverlays",
        "role": "Official/source overlay operations"
      },
      {
        "path": "books/death-guard/v2/rule-contract-build.mjs",
        "line": 19,
        "needle": "const kinds=new Set",
        "role": "Explicit native entity-kind coverage"
      },
      {
        "path": "books/death-guard/v2/rule-contract-build.mjs",
        "line": 22,
        "needle": "function classifySourceClause",
        "role": "Basic source-only semantic/context labels"
      },
      {
        "path": "books/death-guard/v2/rule-contract-build.mjs",
        "line": 31,
        "needle": "function basicContract",
        "role": "Fallback classification-only contract for remaining declared kinds"
      },
      {
        "path": "books/death-guard/v2/rule-contract-build.mjs",
        "line": 44,
        "needle": "export function buildRuleContractV2",
        "role": "Specific Stratagem/Enhancement/Detachment bindings override basic contracts"
      },
      {
        "path": "books/death-guard/v2/roster-contract-build.mjs",
        "line": 114,
        "needle": "function classify(entity,clause)",
        "role": "Runtime classification owner"
      },
      {
        "path": "books/death-guard/v2/roster-contract-build.mjs",
        "line": 119,
        "needle": "if(contract.kind==='ENHANCEMENT')return ['BATTLE_ONLY'",
        "role": "Undeclared Enhancement executable payload remains battle-only"
      },
      {
        "path": "books/death-guard/v2/roster-contract-build.mjs",
        "line": 127,
        "needle": "export function extendRosterContracts",
        "role": "Exact source/effect roster lowering"
      },
      {
        "path": "books/death-guard/v2/roster-contract-build.mjs",
        "line": 44,
        "needle": "declare('datasheet-lord-of-contagion:section:1'",
        "role": "Actual Vector of Disease executable declaration"
      },
      {
        "path": "books/death-guard/v2/roster-contract-build.mjs",
        "line": 31,
        "needle": "declare('datasheet-deathshroud-terminators:section:1'",
        "role": "Actual Deathshroud leader FNP physical target declaration"
      },
      {
        "path": "books/death-guard/v2/rule-contract-enhancements.mjs",
        "line": 48,
        "needle": "enhancement('detachment-virulent-vectorium:enhancement:3'",
        "role": "Arch Contaminator source-bound owner and UNIT role"
      },
      {
        "path": "books/death-guard/v2/rule-contract-state-fields.mjs",
        "line": 3,
        "needle": "export const stateFields",
        "role": "Finite DG context vocabulary"
      },
      {
        "path": "books/death-guard/v2/roster-boot.mjs",
        "line": 33,
        "needle": "fetch(new URL('./generated/rule-contract-effective.json'",
        "role": "Actual browser execution input"
      },
      {
        "path": "books/death-guard/v2/app-build.mjs",
        "line": 16,
        "needle": "'./generated/rule-contract-effective.json'",
        "role": "Actual presentation factual input"
      }
    ],
    "factInputs": [
      {
        "path": "books/death-guard/v2/sources/source-enrollment.json",
        "format": "JSON",
        "role": "Native accepted base and overlay registry"
      },
      {
        "path": "books/death-guard/sources/waha-11e-current-2026-09-25/corpus.json",
        "format": "JSON",
        "role": "Accepted canonical source corpus"
      },
      {
        "path": "books/death-guard/v2/sources/accepted-waha-pages",
        "format": "HTML directory",
        "role": "Pinned original source bytes"
      },
      {
        "path": "books/death-guard/v2/foundation-closure.json",
        "format": "JSON",
        "role": "Reviewed source closure"
      },
      {
        "path": "books/death-guard/v2/sources/profile-selection-evidence.json",
        "format": "JSON",
        "role": "Exact raw physical profile selection evidence"
      },
      {
        "path": "books/death-guard/v2/rule-contract-enhancements.mjs",
        "format": "ES module",
        "role": "Source-ID-keyed applicability semantics"
      },
      {
        "path": "books/death-guard/v2/rule-contract-stratagems.mjs",
        "format": "ES module",
        "role": "Source-ID-keyed Stratagem semantics"
      },
      {
        "path": "books/death-guard/v2/roster-contract-build.mjs",
        "format": "ES module",
        "role": "Exact reviewed source-clause executable lowering"
      }
    ],
    "classificationCauses": [
      {
        "category": "BASIC_CLASSIFICATION_ONLY",
        "cause": "basicContract uses source text patterns for semanticCategory/context labels; these are not executable predicates. Census must report this producer behavior rather than infer semantics itself."
      },
      {
        "category": "FINITE_EXECUTABLE_ALLOWLIST",
        "cause": "Exact [ruleId,clauseId] declarations in roster-contract-build produce ROSTER_EXECUTABLE only after accepted source quote validation."
      },
      {
        "category": "DEFAULT_BATTLE_PAYLOAD",
        "cause": "Unlowered Enhancement/Datasheet-ability payloads default BATTLE_ONLY; selected categories such as FAQ become DISPLAY_ONLY, composition/Leader/transport fall through NOT_AN_EFFECT."
      }
    ],
    "limits": "Entity and ruleContract kinds plus explicit clause extensions/classifications must be read together. DATASHEET_SECTION/DATASHEET_ABILITY includes non-effect declaration sections; no prose-only combat-ability heuristic is justified.",
    "examples": [
      {
        "concept": "conditional Enhancement/unit Wound reroll",
        "entityId": "detachment-virulent-vectorium:enhancement:3",
        "clauseId": "attack-reroll",
        "note": "Source text names bearer unit; role UNIT/ALWAYS is applicability metadata, not a runtime physical-recipient binding. No conditionalPolicy and no rosterEffects. Current engine stores generic UNKNOWN only on source component."
      },
      {
        "concept": "leading melee weapon abilities",
        "entityId": "datasheet-lord-of-contagion:section:1",
        "clauseId": "source-clause-1",
        "note": "Explicit SOURCE_FORMED_MODELS effects for SUSTAINED HITS 1 and LANCE are distinct from Arch Contaminator conditional text."
      },
      {
        "concept": "bodyguard grants ability to its leading CHARACTER",
        "entityId": "datasheet-deathshroud-terminators:section:1",
        "clauseId": "source-clause-1",
        "note": "LEADERS_OF_SOURCE + CHARACTER + LEADING are exact typed target evidence, not an ownership transfer."
      },
      {
        "concept": "detachment optional pregame unit selection",
        "entityId": "detachment-flyblown-host:rule",
        "clauseId": null,
        "note": "Recipient selector/eligibility and a recorded selection are different data."
      }
    ],
    "controls": [
      "detachment-virulent-vectorium:enhancement:3",
      "datasheet-lord-of-contagion:section:1",
      "datasheet-deathshroud-terminators:section:1",
      "datasheet-lord-of-contagion:section:3",
      "detachment-flyblown-host:rule"
    ]
  },
  "emperors-children": {
    "runtimePath": "books/emperors-children/v2/generated/roster-attachments.json",
    "producerRefs": [
      {
        "path": "books/emperors-children/v2/build.py",
        "line": 267,
        "needle": "def build(root=ROOT):",
        "role": "Frozen factual foundation producer"
      },
      {
        "path": "books/emperors-children/v2/build.py",
        "line": 275,
        "needle": "records, accounting = canonicalize",
        "role": "Identity/model binding independent of source occurrences"
      },
      {
        "path": "books/emperors-children/v2/build.py",
        "line": 238,
        "needle": "elif kind == 'STRUCTURED_RULE_TABLE' and sid in table_wrappers:",
        "role": "Typed wrapper presentation notes distinguished from rule tables"
      },
      {
        "path": "books/emperors-children/v2/rule-contract-build.mjs",
        "line": 30,
        "needle": "export function buildECContracts",
        "role": "Bounded reviewed contract overlays"
      },
      {
        "path": "books/emperors-children/v2/rule-contract-build.mjs",
        "line": 33,
        "needle": "assert.equal(inputs.length,10",
        "role": "Reviewed ten-rule direct scope"
      },
      {
        "path": "books/emperors-children/v2/rule-contract-build.mjs",
        "line": 90,
        "needle": "rosterClassification:'ROSTER_EXECUTABLE'",
        "role": "Exact source/assignment/formation executable wrapper"
      },
      {
        "path": "books/emperors-children/v2/rule-contract-build.mjs",
        "line": 153,
        "needle": "id:'permission-reference'",
        "role": "Passive canonical permission reference independent of battle payload"
      },
      {
        "path": "books/emperors-children/v2/rule-contract-build.mjs",
        "line": 202,
        "needle": "remainingLegacyContracts:'NOT_MIGRATED_OR_CLASSIFIED_BY_THIS_BUILD'",
        "role": "Uncontracted facts not automatically battle classified"
      },
      {
        "path": "books/emperors-children/v2/rule-contract-schema.mjs",
        "line": 6,
        "needle": "export const finalStateFields",
        "role": "Selected weapon/optional battle-use schema"
      },
      {
        "path": "books/emperors-children/v2/rule-contract-formation-bindings.mjs",
        "line": 8,
        "needle": "export const formationBindings",
        "role": "Typed initial formation and unit upgrade declarations"
      },
      {
        "path": "books/emperors-children/v2/rule-contract-final-bindings.mjs",
        "line": 71,
        "needle": "book.rosterContextBindings[bladeField]",
        "role": "Selected weapon option binds existing canonical weapon"
      },
      {
        "path": "books/emperors-children/v2/roster-attachment-build.mjs",
        "line": 10,
        "needle": "export function buildECRosterAttachmentBook",
        "role": "Final browser runtime book merges import bindings and attachment evidence"
      },
      {
        "path": "books/emperors-children/v2/roster-boot.mjs",
        "line": 71,
        "needle": "read(new URL('./generated/roster-attachments.json'",
        "role": "Actual browser execution input"
      },
      {
        "path": "books/emperors-children/v2/roster-attachments.mjs",
        "line": 34,
        "needle": "const context=createFormationContext",
        "role": "EC context adapter before shared executor"
      },
      {
        "path": "books/emperors-children/v2/app-build.mjs",
        "line": 44,
        "needle": "export function buildApp",
        "role": "Shared presentation from factual/contract snapshot"
      }
    ],
    "factInputs": [
      {
        "path": "books/emperors-children/v2/sources/enrollment.json",
        "format": "JSON",
        "role": "Native accepted artifacts/identities registry"
      },
      {
        "path": "books/emperors-children/sources/waha-11e-current-2026-09-28/corpus.json",
        "format": "JSON",
        "role": "Pinned source corpus"
      },
      {
        "path": "books/emperors-children/v2/model-bindings.json",
        "format": "JSON",
        "role": "Canonical physical profiles/parts source bindings"
      },
      {
        "path": "books/emperors-children/v2/identity-bindings.json",
        "format": "JSON",
        "role": "Canonical IDs independent from source occurrences"
      },
      {
        "path": "books/emperors-children/v2/official_sources.py",
        "format": "Python",
        "role": "Accepted official replacement source reader"
      },
      {
        "path": "books/emperors-children/v2/rule-contract-declarations.mjs",
        "format": "ES module",
        "role": "Ten source-proven direct executable rules"
      },
      {
        "path": "books/emperors-children/v2/rule-contract-permission-declarations.mjs",
        "format": "ES module",
        "role": "Five passive permission bindings and event state vocabulary"
      },
      {
        "path": "books/emperors-children/v2/rule-contract-formation-bindings.mjs",
        "format": "ES module",
        "role": "Initial attachment/formation source facts"
      },
      {
        "path": "books/emperors-children/v2/rule-contract-final-bindings.mjs",
        "format": "ES module",
        "role": "Selected physical weapon and Transport source facts"
      },
      {
        "path": "books/emperors-children/v2/rule-contract-aegis-bindings.mjs",
        "format": "ES module",
        "role": "Shining Aegis"
      },
      {
        "path": "books/emperors-children/v2/rule-contract-instrument-bindings.mjs",
        "format": "ES module",
        "role": "Physical instrument bindings"
      }
    ],
    "classificationCauses": [
      {
        "category": "BOUNDED_CONTRACT_OVERLAY",
        "cause": "Only explicit reviewed direct/permission/formation/final/aegis/instrument inputs receive contracts. Remaining legacy/canonical rules are unassessed by this producer."
      },
      {
        "category": "PASSIVE_PERMISSION_VS_PAYLOAD",
        "cause": "permission-reference uses GRANT_ABILITY to canonical rule text; a separate BATTLE_ONLY clause preserves timing/conditions without executing rolls or moves."
      },
      {
        "category": "FACT_KIND_ADAPTER",
        "cause": "Canonical MODEL_PROFILE becomes shared PROFILE in disposable runtime; FAQ/ERRATA become SOURCE_ERRATUM only for presentation. These are interface adaptations, not gameplay identity changes."
      }
    ],
    "limits": "Entity and ruleContract kinds plus explicit clause extensions/classifications must be read together. DATASHEET_SECTION/DATASHEET_ABILITY includes non-effect declaration sections; no prose-only combat-ability heuristic is justified.",
    "examples": [
      {
        "concept": "leading source weapon ability",
        "entityId": "datasheet-lord-exultant:section:1",
        "clauseId": "roster-known",
        "note": "Explicit SOURCE_FORMED_MODELS LETHAL HITS, not conditional transfer inference."
      },
      {
        "concept": "passive permission plus unresolved event",
        "entityId": "detachment-mercurial-host:rule",
        "clauseId": "permission-reference",
        "note": "Canonical Advance reroll reference executable; actual advance-roll event BATTLE_ONLY, no battle roll computed."
      },
      {
        "concept": "physical selected weapon option plus optional fight payload",
        "entityId": "detachment-carnival-of-excess:enhancement:3",
        "clauseId": "selected-weapon",
        "note": "39 canonical option effects are alternatives addressed by selectedUpgrade; not39 applied bonuses; optional-fight-use remains BATTLE_ONLY."
      },
      {
        "concept": "initial attachment declaration retained as exact field",
        "entityId": "datasheet-lord-exultant:section:4",
        "clauseId": null,
        "note": "INITIAL_ATTACHMENT context binding and physical source are explicit; not inferred from generic attachment alone."
      }
    ],
    "controls": [
      "datasheet-lord-exultant:section:1",
      "datasheet-lord-exultant:section:4",
      "detachment-mercurial-host:rule",
      "detachment-carnival-of-excess:enhancement:3",
      "datasheet-chaos-rhino:section:2"
    ]
  },
  "chaos-space-marines": {
    "runtimePath": "books/chaos-space-marines/v2/generated/roster-runtime.json",
    "producerRefs": [
      {
        "path": "books/chaos-space-marines/v2/registration.mjs",
        "needle": "async createRoster(){return (await import('./roster-boot.mjs')).createBrowserRoster();}",
        "line": 12,
        "note": "Actual registry dispatch"
      },
      {
        "path": "books/chaos-space-marines/v2/roster-boot.mjs",
        "needle": "const inputs=await Promise.all(['./generated/roster-runtime.json','./generated/roster-import.json','./roster-attachment-bindings.json']",
        "line": 43,
        "note": "Actual browser fetch order: execution book, import book, attachment bindings"
      },
      {
        "path": "books/chaos-space-marines/v2/roster-boot.mjs",
        "needle": "const runtime=createCSMRosterRuntime(book,importBook,bindings);",
        "line": 13,
        "note": "First fetched book is executed"
      },
      {
        "path": "books/chaos-space-marines/v2/roster-runtime-build.mjs",
        "needle": "export function buildCSMRosterRuntimeBook()",
        "line": 10,
        "note": "Final runtime producer composes effect lowering with native import/attachment inputs"
      },
      {
        "path": "books/chaos-space-marines/v2/roster-effect-build.mjs",
        "needle": "export function buildCSMRosterEffectBook(built=buildCSMContracts())",
        "line": 22,
        "note": "Lowering owner"
      },
      {
        "path": "books/chaos-space-marines/v2/rule-contract-build.mjs",
        "needle": "export const declarationFiles=",
        "line": 12,
        "note": "Four reviewed declaration JSON families"
      },
      {
        "path": "books/chaos-space-marines/v2/rule-contract-build.mjs",
        "needle": "export function createCSMSchema(declarations)",
        "line": 28,
        "note": "Schema FIELD registry derived from explicit declarations, not a per-book interpreter"
      },
      {
        "path": "books/chaos-space-marines/v2/rule-contract-build.mjs",
        "needle": "export function buildCSMContracts({facts=",
        "line": 47,
        "note": "Canonical effective facts plus semantic declarations"
      },
      {
        "path": "books/chaos-space-marines/v2/roster-effect-build.mjs",
        "needle": "clause.rosterClassification=clause.rosterClassification==='BATTLE_ONLY'",
        "line": 86,
        "note": "Default classification mapping"
      },
      {
        "path": "books/chaos-space-marines/v2/roster-effect-build.mjs",
        "needle": "    clause.rosterClassification='ROSTER_EXECUTABLE';",
        "line": 224,
        "note": "Lowered selected declarations become executable"
      },
      {
        "path": "books/chaos-space-marines/v2/roster-effect-build.mjs",
        "needle": "else if(key==='isBodyguardComponentOfSource')",
        "line": 171,
        "note": "Fabius bodyguard role FIELD lowered to shared isBodyguardModel"
      },
      {
        "path": "books/chaos-space-marines/v2/roster-effect-context.mjs",
        "needle": "export function createCSMRosterEffectContext(book,state,",
        "line": 50,
        "note": "Existing physical source-state normalization"
      },
      {
        "path": "books/chaos-space-marines/v2/rule-contract-context.mjs",
        "needle": "export function semanticInputs(facts,identities)",
        "line": 9,
        "note": "Canonical composition members become physical PROFILE identities"
      },
      {
        "path": "books/chaos-space-marines/v2/roster-presentation.mjs",
        "needle": "export function normalizeCSMEffectiveBook(book)",
        "line": 31,
        "note": "Only the effective reader normalizes kind aliases; this is not the executor census input"
      },
      {
        "path": "books/chaos-space-marines/v2/build.py",
        "needle": "def build(root=ROOT):",
        "line": 368,
        "note": "Accepted factual producer"
      },
      {
        "path": "books/chaos-space-marines/v2/source_nodes.py",
        "needle": "def collect_sources(root: Path, official: dict)",
        "line": 35,
        "note": "Captured raw/corpus source nodes"
      }
    ],
    "factInputs": [
      {
        "path": "books/chaos-space-marines/v2/sources/enrollment.json",
        "format": "Pinned artifact byte inventory"
      },
      {
        "path": "books/chaos-space-marines/sources/waha-11e-current-2026-09-29/corpus.json",
        "format": "Accepted HTML-derived captured JSON, plus accepted hub/datasheet HTML occurrences"
      },
      {
        "path": "books/chaos-space-marines/v2/identity-bindings.json",
        "format": "Persistent SOURCE_ENTITY_ID -> canonical ID/owner bindings"
      },
      {
        "path": "books/chaos-space-marines/v2/ownership-bindings.json",
        "format": "Explicit canonical fact owner versus repeated source occurrence"
      },
      {
        "path": "books/chaos-space-marines/v2/model-bindings.json",
        "format": "Explicit composition/model statline identities"
      },
      {
        "path": "books/chaos-space-marines/v2/official-bindings.json",
        "format": "Accepted official PDF source addresses/overrides"
      },
      {
        "path": "books/chaos-space-marines/v2/contract-datasheet-army-declarations.json",
        "format": "Reviewed semantic JSON declarations and explicit owner dispositions; not a new factual source"
      },
      {
        "path": "books/chaos-space-marines/v2/contract-enhancement-detachment-declarations.json",
        "format": "Reviewed semantic JSON declarations and explicit owner dispositions; not a new factual source"
      },
      {
        "path": "books/chaos-space-marines/v2/contract-stratagem-declarations.json",
        "format": "Reviewed semantic JSON declarations and explicit owner dispositions; not a new factual source"
      },
      {
        "path": "books/chaos-space-marines/v2/contract-construction-declarations.json",
        "format": "Reviewed semantic JSON declarations and explicit owner dispositions; not a new factual source"
      }
    ],
    "classificationCauses": [
      "The four declaration inventories classify every canonical rule owner as BUILT / BATTLE_ONLY_NO_RUNTIME_NEEDED / BLOCKED_BY_CONFIRMED_GENERIC_CAPABILITY / NOT_EFFECT_OR_PRESENTATION_ONLY; bindCanonicalContract validates exact evidence.",
      "Runtime default is BATTLE_ONLY when declared BATTLE_ONLY, productClassification BATTLE_ONLY, or executionMode BATTLE_ACTION; NOT_EFFECT becomes NOT_AN_EFFECT; remaining clauses default DISPLAY_ONLY.",
      "Only reviewed ROSTER_KNOWN semantic operations, semanticEffects and the exact selected-Mark clause are lowered; lowered clauses are labelled ROSTER_EXECUTABLE. This is not equivalent to an all-prose battle census.",
      "Named ability text is mostly one DATASHEET_ABILITY per block, unlike Tau/Tyranids multi-block DATASHEET_SECTION contracts. Core/army memberships become RULE_REFERENCE with separate native semantics."
    ],
    "limits": {
      "id": "datasheet-abaddon-the-despoiler:section:5",
      "hasText": false,
      "hasContract": false,
      "disposition": "NOT_EFFECT_OR_PRESENTATION_ONLY",
      "reason": "Container only; the three NAMED_RULE_COMPONENT children own their contracts. Do not count as missing combat encoding."
    },
    "examples": [
      {
        "concept": "bearer unit",
        "entityId": "detachment-renegade-warband:enhancement:4",
        "clauseId": null,
        "note": "MODEL owner and exact enhancement assignment; SOURCE_UNIT recipient. Charge metric is FORMED UNIT scoped; separate Advance/battle text is DISPLAY_ONLY, not an active bonus."
      },
      {
        "concept": "Leader",
        "entityId": "datasheet-master-of-possession:section:1:block:0:text",
        "clauseId": null,
        "note": "Exact composition-member MODEL_ID, LEADING condition, SOURCE_UNIT/FORMED charge metric. Source clause is retained independently."
      },
      {
        "concept": "Bodyguard only",
        "entityId": "datasheet-fabius-bile:section:1:block:0:text",
        "clauseId": null,
        "note": "SOURCE_FORMED_MODELS plus TARGET isBodyguardModel; requires explicit initial attachment history, not every attached CHARACTER."
      },
      {
        "concept": "Aura",
        "entityId": "datasheet-abaddon-the-despoiler:section:5:block:0:text",
        "clauseId": null,
        "note": "Named canonical aura component has explicit declared participants and BATTLE context fields; no proximity is inferred from attachment."
      },
      {
        "concept": "Player source selection",
        "entityId": "detachment-pactbound-zealots:rule",
        "clauseId": null,
        "note": "Exact selectedMarkId/source-backed UNIT Mark input gates PHYSICAL GRANT_UNIT_KEYWORD; a free text occurrence is not a selected mark."
      },
      {
        "concept": "Unknown battle/table choice",
        "entityId": "detachment-creations-of-bile:rule",
        "clauseId": null,
        "note": "Leading clause/table clauses remain BATTLE_ONLY with source-defined MODEL roles; F1 can show pending options without applying them."
      }
    ],
    "controls": [
      "detachment-renegade-warband:enhancement:4",
      "datasheet-master-of-possession:section:1:block:0:text",
      "datasheet-fabius-bile:section:1:block:0:text",
      "datasheet-abaddon-the-despoiler:section:5:block:0:text",
      "detachment-pactbound-zealots:rule",
      "detachment-creations-of-bile:rule"
    ]
  },
  "tau-empire": {
    "runtimePath": "books/tau-empire/v2/generated/roster-import.json",
    "producerRefs": [
      {
        "path": "books/tau-empire/v2/registration.mjs",
        "needle": "async createRoster(){return (await import('./roster-boot.mjs')).createBrowserRoster();}",
        "line": 10,
        "note": "Actual registration"
      },
      {
        "path": "books/tau-empire/v2/roster-boot.mjs",
        "needle": "const response=await read(new URL('./generated/roster-import.json',import.meta.url));",
        "line": 100,
        "note": "Actual browser execution artifact"
      },
      {
        "path": "books/tau-empire/v2/roster-boot.mjs",
        "needle": "const runtime=createTauRosterRuntime(book),importer=createTauRosterImport(book)",
        "line": 16,
        "note": "Fetched book is the runtime input"
      },
      {
        "path": "books/tau-empire/v2/roster-import-build.mjs",
        "needle": "export function buildTauImportBook()",
        "line": 20,
        "note": "Final producer calls contracts and adds physical equipment/choice bindings"
      },
      {
        "path": "books/tau-empire/v2/rule-contract-build.mjs",
        "needle": "export function buildTauContracts({facts=",
        "line": 18,
        "note": "Contracts over immutable effective facts and exact clause review"
      },
      {
        "path": "books/tau-empire/v2/rule-contract-build.mjs",
        "needle": "const staticPresentation=entity.kind=",
        "line": 127,
        "note": "Display classification uses reviewed category plus explicit static section kinds"
      },
      {
        "path": "books/tau-empire/v2/rule-contract-build.mjs",
        "needle": "reviewedRecipient:{scope:row.recipientScope",
        "line": 133,
        "note": "Reviewed recipient descriptions explicitly have runtimeSelector:false"
      },
      {
        "path": "books/tau-empire/v2/rule-contract-schema.mjs",
        "needle": "export function createTauRuleSchema(",
        "line": 4,
        "note": "Seven scalar state extensions"
      },
      {
        "path": "books/tau-empire/v2/roster-import.mjs",
        "needle": "const candidate=imports.load(value),boundBook=",
        "line": 165,
        "note": "Actual runtime creates physical Student/prototype/Shield overlays on validated load"
      },
      {
        "path": "books/tau-empire/v2/roster-source-choices.mjs",
        "needle": "export function bindTauStudentPairs(book,state)",
        "line": 189,
        "note": "Confirmed source/recipient pairs create executable clauses"
      },
      {
        "path": "books/tau-empire/v2/roster-source-choices.mjs",
        "needle": "export function validateTauAttachmentSourceConditions(book,state)",
        "line": 49,
        "note": "Kroot Starting Strength 20 is a physical boundary, not a default aura/effect"
      },
      {
        "path": "books/tau-empire/v2/build.py",
        "needle": "def verify_sources(enrollment):",
        "line": 60,
        "note": "Pinned accepted factual artifact integrity"
      },
      {
        "path": "books/tau-empire/v2/build.py",
        "needle": "# Factual native recipients; semantic/executable classification belongs to Stage 3.",
        "line": 200,
        "note": "Raw factual recipient scopes are separate from semantic lowering"
      }
    ],
    "factInputs": [
      {
        "path": "books/tau-empire/v2/sources/enrollment.json",
        "format": "Pinned captured HTML/corpus/official PDF inventory, official v1.1 and central MFM declarations"
      },
      {
        "path": "books/tau-empire/sources/waha-11e-current-2026-09-28/corpus.json",
        "format": "Captured HTML transcription JSON; raw HTML XPath bindings preserve complete source blocks"
      },
      {
        "path": "books/tau-empire/v2/source-bindings.json",
        "format": "Reviewed raw XPath addresses and textSha256, not alternative facts"
      },
      {
        "path": "books/tau-empire/v2/identity-bindings.json",
        "format": "Persistent source/canonical identities"
      },
      {
        "path": "books/tau-empire/v2/official-bindings.json",
        "format": "Official PDF text regions and patch instructions"
      },
      {
        "path": "books/tau-empire/v2/rule-clause-review.json",
        "format": "Exact source-field/quote fingerprints, reviewed classification, recipient descriptions and dependencies"
      },
      {
        "path": "books/tau-empire/v2/rule-contract-declarations.mjs",
        "format": "Explicit reviewed executable operations, enhancement eligibility, pending exact-weapon bindings"
      },
      {
        "path": "books/tau-empire/v2/roster-import-source-bindings.json",
        "format": "Physical composition/equipment/BSData vocabulary bindings"
      }
    ],
    "classificationCauses": [
      "Review covers gameplay kinds and every ability block; RULE_REFERENCE native seeds are handled separately rather than inventing contracts for every membership.",
      "EXECUTABLE review rows must match a lowering declaration. CONDITIONAL / DISPLAY rows become BATTLE_ONLY except explicit static presentation section kinds; CAPABILITY_MISSING and SOURCE_CONFLICT / NOT_PROVEN remain DISPLAY_ONLY.",
      "Non-executable clauses generally have only OWNER role plus battleConditionSatisfied. reviewedRecipient/sourceDefinition records are useful semantic evidence but explicitly runtimeSelector:false, unlike CSM machine recipient roles.",
      "The browser input is roster-import.json, not the rule-contract artifact. Physical Student/prototype/Shield choices add executable clauses dynamically at runtime; static DISPLAY_ONLY templates are intentional and must not be counted as proven missing execution."
    ],
    "limits": {
      "id": "army-rule-for-the-greater-good",
      "hasContract": false,
      "hasText": false,
      "componentId": "army-rule-for-the-greater-good:definition",
      "componentHasContract": true,
      "reason": "Title/component container is not missing ability text."
    },
    "examples": [
      {
        "concept": "Leader",
        "entityId": "datasheet-commander-in-coldstar-battlesuit:section:1",
        "clauseId": null,
        "note": "Coldstar Commander: LEADING gate + SOURCE_FORMED_MODELS/MODEL. Separate shield-generator bearer SOURCE_MODEL effect is equipment-gated."
      },
      {
        "concept": "Bearer unit versus formed models",
        "entityId": "datasheet-cadre-fireblade:section:1",
        "clauseId": null,
        "note": "Volley Fire uses SOURCE_UNIT/UNIT with LEADING gate, whereas Ethereal uses SOURCE_FORMED_MODELS/MODEL; these encodings are not interchangeable by caption."
      },
      {
        "concept": "Bodyguard attachment source gate",
        "entityId": "datasheet-kroot-carnivores:section:bodyguard",
        "clauseId": null,
        "note": "Runtime artifact contains a display declaration, but physical adapter separately validates 20 starting models and two distinct Leaders."
      },
      {
        "concept": "Aura/unknown battle",
        "entityId": "datasheet-commander-shadowsun:section:1",
        "clauseId": null,
        "note": "Hero of the Empire aura has a reviewed recipient sourceDefinition with runtimeSelector:false; no structured runtime aura recipient selection is inferred."
      },
      {
        "concept": "Physical player source selection",
        "entityId": "detachment-auxiliary-cadre:enhancement:1",
        "clauseId": null,
        "note": "Student of Kauyon template is DISPLAY_ONLY; validated exact source/recipient instance pairs dynamically add Deep Strike, maximum three eligible Kroot units."
      },
      {
        "concept": "Exact selected physical weapon",
        "entityId": "detachment-experimental-prototype-cadre:enhancement:1",
        "clauseId": null,
        "note": "Static template is non-executable pending one weapon occurrence; runtime adapter uses physical scope + selection key, not canonical weapon ID alone."
      }
    ],
    "controls": [
      "datasheet-commander-in-coldstar-battlesuit:section:1",
      "datasheet-cadre-fireblade:section:1",
      "datasheet-kroot-carnivores:section:bodyguard",
      "datasheet-commander-shadowsun:section:1",
      "detachment-auxiliary-cadre:enhancement:1",
      "detachment-experimental-prototype-cadre:enhancement:1"
    ]
  },
  "tyranids": {
    "runtimePath": "books/tyranids/v2/generated/roster-runtime.json",
    "producerRefs": [
      {
        "path": "books/tyranids/v2/registration.mjs",
        "needle": "async createRoster(){return (await import('./roster-boot.mjs')).createBrowserRoster();}",
        "line": 14,
        "note": "Actual registration"
      },
      {
        "path": "books/tyranids/v2/roster-boot.mjs",
        "needle": "const response=await read(new URL('./generated/roster-runtime.json',import.meta.url));",
        "line": 86,
        "note": "Actual browser execution input"
      },
      {
        "path": "books/tyranids/v2/app-build.mjs",
        "needle": "for(const [name,value]of [['app-presentation',payload],['roster-runtime',built.book]])",
        "line": 164,
        "note": "app-build writes contract-bearing built.book to actual runtime artifact"
      },
      {
        "path": "books/tyranids/v2/rule-contract-build.mjs",
        "needle": "export function buildTyranidsContracts({facts=",
        "line": 19,
        "note": "Final runtime book starts from factual import view then overlays bounded contracts"
      },
      {
        "path": "books/tyranids/v2/rule-contract-build.mjs",
        "needle": "assert.equal(inputs.length,19,",
        "line": 21,
        "note": "Bounded reviewed inventory: nineteen source owners"
      },
      {
        "path": "books/tyranids/v2/rule-contract-build.mjs",
        "needle": "evidence:clone(executableEvidence),sourceText:input.executableQuote||input.quote,rosterClassification:'ROSTER_EXECUTABLE',",
        "line": 87,
        "note": "Explicit reviewed clauses become executable"
      },
      {
        "path": "books/tyranids/v2/rule-contract-build.mjs",
        "needle": "sourceText:quote,rosterClassification:'BATTLE_ONLY'",
        "line": 107,
        "note": "Only declared battle quote/sibling blocks become BATTLE_ONLY; no global default classification"
      },
      {
        "path": "books/tyranids/v2/rule-contract-build.mjs",
        "needle": "const deferred=conditionalCandidates.map(input=>",
        "line": 150,
        "note": "Deferred source evidence is separate metadata; it does not manufacture clauses on every uncontracted owner"
      },
      {
        "path": "books/tyranids/v2/roster-source-choices.mjs",
        "needle": "export function createTyranidsRuleSchema(",
        "line": 84,
        "note": "Three scalar schema extensions"
      },
      {
        "path": "books/tyranids/v2/roster-source-choices.mjs",
        "needle": "export function validateTyranidsSourceChoices(book,state)",
        "line": 28,
        "note": "Trygon choice requires exact physical model and reciprocal saved decision evidence"
      },
      {
        "path": "books/tyranids/v2/roster-import-build.mjs",
        "needle": "export function buildTyranidsImportBook(facts=",
        "line": 14,
        "note": "Import normalization/physical identities are an intermediate, not the final browser contract artifact"
      },
      {
        "path": "books/tyranids/v2/build.py",
        "needle": "SOURCE = 'books/tyranids/sources/waha-11e-current-2026-09-27'",
        "line": 20,
        "note": "Accepted factual RAW/corpus root"
      },
      {
        "path": "books/tyranids/v2/rule-contract-declarations.mjs",
        "needle": "export const conditionalCandidates=[",
        "line": 105,
        "note": "Explicit unlowered battle/capability/source-conflict examples"
      }
    ],
    "factInputs": [
      {
        "path": "books/tyranids/v2/sources/enrollment.json",
        "format": "Pinned accepted HTML/corpus/current official v1.3 PDF inventory, central MFM owner"
      },
      {
        "path": "books/tyranids/sources/waha-11e-current-2026-09-27/corpus.json",
        "format": "Captured HTML transcription JSON; raw named rule and enhancement locators preserve complete source text"
      },
      {
        "path": "books/tyranids/v2/source-bindings.json",
        "format": "Persistent reviewed raw named-rule anchors/XPaths/text hashes"
      },
      {
        "path": "books/tyranids/v2/identity-bindings.json",
        "format": "Persistent canonical identity/owner bindings"
      },
      {
        "path": "books/tyranids/v2/official-bindings.json",
        "format": "Official PDF occurrence/override declarations"
      },
      {
        "path": "books/tyranids/v2/rule-contract-declarations.mjs",
        "format": "Nineteen explicitly quoted reviewed semantic owners plus deferred source-evidence candidates"
      },
      {
        "path": "books/tyranids/v2/roster-import-source-bindings.json",
        "format": "Physical model/composition/export vocabulary and allowed weapon bindings"
      },
      {
        "path": "books/tyranids/v2/source-issues.json",
        "format": "Explicit unresolved source conflicts, including Foul Spores; not a permissive aura declaration"
      }
    ],
    "classificationCauses": [
      "This producer lowers only an explicitly reviewed bounded owner allowlist. Executable and sibling BATTLE_ONLY clause counts are computed from the execution artifact; this is not a complete all-prose clause census.",
      "All other raw rules remain factual text without ruleContract unless separately named; conditionalCandidates/deferred metadata preserves selected known blockers but does not label all uncontracted text BATTLE_ONLY.",
      "MODEL owner and recipient selector are separate: SOURCE_UNIT, SOURCE_UNIT_MODELS, SOURCE_FORMED_MODELS, LEADERS_OF_SOURCE and PHYSICAL ROSTER_UNITS are all explicitly used.",
      "Native RULE_REFERENCE seed semantics are another channel. Army title containers have no contract; the corresponding ARMY_RULE_COMPONENT definition text also lacks a contract here (unlike Tau)."
    ],
    "limits": [],
    "examples": [
      {
        "concept": "Bearer MODEL with unknown battle upgrade",
        "entityId": "detachment-invasion-fleet:enhancement:4",
        "clauseId": null,
        "note": "Adaptive Biology has executable MODEL FNP5 and independent BATTLE_ONLY FNP4 predicate; no battle state inferred."
      },
      {
        "concept": "Bearer unit",
        "entityId": "detachment-assimilation-swarm:enhancement:4",
        "clauseId": null,
        "note": "Parasitic Biomorphology uses SOURCE_UNIT/UNIT weapon Strength; its later destruction/range condition remains BATTLE_ONLY."
      },
      {
        "concept": "Leader",
        "entityId": "datasheet-broodlord:section:1",
        "clauseId": null,
        "note": "Vicious Insight uses LEADING + SOURCE_UNIT/UNIT, with sibling Hypnotic Gaze as BATTLE_ONLY."
      },
      {
        "concept": "Bodyguard grants to Leader",
        "entityId": "datasheet-tyrant-guard:section:1",
        "clauseId": null,
        "note": "Guardian Organism uses LEADERS_OF_SOURCE/MODEL and CHARACTER target selector; it does not grant FNP to every Bodyguard model."
      },
      {
        "concept": "Physical player selection",
        "entityId": "detachment-subterranean-assault:rule",
        "clauseId": null,
        "note": "Trygon CHARACTER grant is ROSTER_UNITS/UNIT with exact Trygon UNIT_ID and selectedSurpriseAssaultChoice FIELD. Tunnel-marker battle clause stays BATTLE_ONLY."
      },
      {
        "concept": "Aura without runtime contract",
        "entityId": "datasheet-hive-tyrant:section:1",
        "clauseId": null,
        "note": "Onslaught source text is retained; conditionalCandidates says proximity/battle-dependent. There is no structured live aura recipient contract to count."
      },
      {
        "concept": "Unlowered capability",
        "entityId": "datasheet-neurotyrant:section:1",
        "clauseId": null,
        "note": "Node Lash source text is retained but has no contract; deferred capability metadata explicitly distinguishes Hit/Wound rolls from BS/WS characteristics."
      }
    ],
    "controls": [
      "detachment-invasion-fleet:enhancement:4",
      "detachment-assimilation-swarm:enhancement:4",
      "datasheet-broodlord:section:1",
      "datasheet-tyrant-guard:section:1",
      "detachment-subterranean-assault:rule",
      "datasheet-hive-tyrant:section:1",
      "datasheet-neurotyrant:section:1"
    ]
  },
  "space-marines": {
    "runtimePath": "books/space-marines/v2/generated/roster-import.json",
    "producerRefs": [
      {
        "path": "books/space-marines/v2/build.py",
        "needle": "def build():",
        "line": 407
      },
      {
        "path": "books/space-marines/v2/build.py",
        "needle": "def verify_sources(",
        "line": 318
      },
      {
        "path": "books/space-marines/v2/build.py",
        "needle": "source-bindings.json",
        "line": 329
      },
      {
        "path": "books/space-marines/v2/build.py",
        "needle": "identity-bindings.json",
        "line": 330
      },
      {
        "path": "books/space-marines/v2/build.py",
        "needle": "'DATASHEET_SECTION',owner",
        "line": 179
      },
      {
        "path": "books/space-marines/v2/rule-contract-build.mjs",
        "needle": "export function build",
        "line": 25
      },
      {
        "path": "books/space-marines/v2/rule-contract-build.mjs",
        "needle": "rosterClassification:'ROSTER_EXECUTABLE'",
        "line": 143
      },
      {
        "path": "books/space-marines/v2/rule-contract-build.mjs",
        "needle": "rosterClassification:'DISPLAY_ONLY'",
        "line": 151
      },
      {
        "path": "books/space-marines/v2/rule-contract-build.mjs",
        "needle": "purpose:'OWNER'",
        "line": 98
      },
      {
        "path": "books/space-marines/v2/rule-contract-build.mjs",
        "needle": "return atom('ALWAYS'",
        "line": 90
      },
      {
        "path": "books/space-marines/v2/rule-contract-build.mjs",
        "needle": "bindCanonicalContract(",
        "line": 155
      },
      {
        "path": "books/space-marines/v2/rule-contract-schema.mjs",
        "needle": "export function create",
        "line": 4
      },
      {
        "path": "books/space-marines/v2/gameplay-presentation-build.mjs",
        "needle": "export function buildGameplayPresentation",
        "line": 22
      },
      {
        "path": "books/space-marines/v2/app-build.mjs",
        "needle": "export function buildApp()",
        "line": 20
      },
      {
        "path": "books/space-marines/v2/registration.mjs",
        "needle": "async loadPayload()",
        "line": 8
      },
      {
        "path": "books/space-marines/v2/roster-boot.mjs",
        "needle": "generated/roster-import.json",
        "line": 6
      },
      {
        "path": "books/shared/rule-contract-v2/bindings.mjs",
        "needle": "export function bindCanonicalContract",
        "line": 145
      },
      {
        "path": "books/shared/rule-contract-v2/bindings.mjs",
        "needle": "Typed declarations are the input authority",
        "line": 4
      },
      {
        "path": "books/shared/rule-contract-v2/schema.mjs",
        "needle": "case 'ALWAYS': return 'TRUE'",
        "line": 229
      },
      {
        "path": "books/shared/roster-v2/conditional-policy.mjs",
        "needle": "clause.rosterClassification==='DISPLAY_ONLY'&&clause.rosterEffects.length===0",
        "line": 13
      },
      {
        "path": "books/shared/roster-v2/conditional-policy.mjs",
        "needle": "return ['MODEL_KEYWORD','UNIT_KEYWORD','MODEL_ID','UNIT_ID'].includes(node?.predicate)",
        "line": 69
      },
      {
        "path": "books/shared/roster-v2/conditional-policy.mjs",
        "needle": "['EFFECT_RECIPIENT','RECIPIENT'].includes(role.purpose)",
        "line": 87
      },
      {
        "path": "books/shared/roster-v2/conditional-policy.mjs",
        "needle": "clause.rosterClassification!=='BATTLE_ONLY'",
        "line": 141
      },
      {
        "path": "books/shared/roster-v2/conditional-policy.mjs",
        "needle": "export function projectConditionalRow",
        "line": 240
      },
      {
        "path": "books/shared/army-book-app-v2/personal.mjs",
        "needle": "const hasSource=row=>",
        "line": 506
      },
      {
        "path": "books/shared/roster-v2/detachment-reference-build.mjs",
        "needle": "assert.ok(!row.ruleContract,'Unreviewed allied rule execution')",
        "line": 14
      },
      {
        "path": "books/space-marines/v2/roster-import-build.mjs",
        "needle": "generated/roster-import.json",
        "line": 146
      },
      {
        "path": "books/space-marines/v2/official.py",
        "needle": "def apply_official(",
        "line": 62
      },
      {
        "path": "books/space-marines/v2/official.py",
        "needle": "official-bindings.json",
        "line": 65
      },
      {
        "path": "books/space-marines/v2/build.py",
        "needle": "effective=apply_official(base,root=ROOT)",
        "line": 418
      },
      {
        "path": "books/space-marines/v2/mfm-build.mjs",
        "needle": "import {buildNativeBook}",
        "line": 7
      }
    ],
    "factInputs": {
      "configPath": "books/space-marines/book.config.json",
      "configDeclaredSources": {
        "factionPack": "content/space-marines-faction-pack.en.json",
        "codexDatasheets": "content/space-marines-codex-datasheets.en.json",
        "codexParity": "content/space-marines-current-overlay.en.json",
        "codexWargear": "content/space-marines-codex-wargear.en.json",
        "relatedRules": "content/space-marines-related-rules.en.json",
        "manifest": "sources/source-manifest.json",
        "effectContracts": "sources/space-marines-effect-contracts.v1.json",
        "mfmCurrentCapture": "sources/official-mfm-v1.4.json"
      },
      "configBoundary": "Config source JSON declarations are recorded separately; native V2 build.py directly reads its pinned RAW HTML via V2 enrollment and explicit identity/source ledgers.",
      "enrollmentPath": "books/space-marines/v2/sources/enrollment.json",
      "acceptedStatus": "ACCEPTED_FROZEN_SECONDARY_WITH_APPLICABLE_OFFICIAL_FIELDS",
      "rawFactualInputs": [
        {
          "path": "books/space-marines/v2/sources/raw/wahapedia-space-marines-main.html",
          "format": "FROZEN_HTML",
          "authority": "ACCEPTED_SECONDARY",
          "usage": "FACTUAL_INPUT_BY_BUILD_PY",
          "sha256": "DD7420597CCC235859B9326F146964746EFFBC8A48752DA4D622BC99DEE1BED7"
        },
        {
          "path": "books/space-marines/v2/sources/raw/wahapedia-datasheets-probe.html",
          "format": "FROZEN_HTML",
          "authority": "ACCEPTED_SECONDARY",
          "usage": "FACTUAL_INPUT_BY_BUILD_PY",
          "sha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D"
        }
      ],
      "sourceBindings": "books/space-marines/v2/source-bindings.json",
      "identityBindings": "books/space-marines/v2/identity-bindings.json",
      "canonicalPath": "books/space-marines/v2/generated/base.json",
      "effectivePath": "books/space-marines/v2/generated/effective.json",
      "reviewLedger": "books/space-marines/v2/rule-clause-review.json",
      "explicitOperations": "books/space-marines/v2/rule-contract-declarations.mjs",
      "mfmOwner": "mfm/content effective centralized v1.6 catalog; book adapters bind identities without transferring ownership",
      "officialOverlay": {
        "format": "PINNED_PDF_INSTRUCTIONS_WITH_EXPLICIT_JSON_BINDINGS",
        "source": "books/space-marines/v2/sources/raw/official-sm-updates.pdf",
        "bindings": "books/space-marines/v2/official-bindings.json",
        "producer": "books/space-marines/v2/official.py"
      }
    },
    "classificationCauses": [
      {
        "cause": "EXPLICIT_REVIEWED_LOWERING",
        "detail": "Literal reviewed source spans and book-owned operation declarations create ROSTER_EXECUTABLE clauses; classification is explicitly assigned by this producer, not inferred by shared presentation.",
        "refs": [
          {
            "path": "books/space-marines/v2/rule-contract-build.mjs",
            "needle": "rosterClassification:'ROSTER_EXECUTABLE'",
            "line": 143
          }
        ]
      },
      {
        "cause": "EXPLICIT_UNLOWERED_FALLBACK",
        "detail": "Every reviewed span not covered by a complete typed lowering is emitted DISPLAY_ONLY with the review reason/status and no rosterEffects. This label alone does not prove BATTLE_ONLY semantics or a physical recipient.",
        "refs": [
          {
            "path": "books/space-marines/v2/rule-contract-build.mjs",
            "needle": "rosterClassification:'DISPLAY_ONLY'",
            "line": 151
          }
        ]
      },
      {
        "cause": "OWNER_IS_NOT_RECIPIENT",
        "detail": "All stored clause roles are purpose OWNER. Non-Enhancement owners default to STATIC ALWAYS. The F1 text path requires BATTLE_ONLY and a declared recipient role/selector; OWNER/ALWAYS is not sufficient.",
        "refs": [
          {
            "path": "books/space-marines/v2/rule-contract-build.mjs",
            "needle": "purpose:'OWNER'",
            "line": 98
          },
          {
            "path": "books/space-marines/v2/rule-contract-build.mjs",
            "needle": "return atom('ALWAYS'",
            "line": 90
          },
          {
            "path": "books/shared/roster-v2/conditional-policy.mjs",
            "needle": "return ['MODEL_KEYWORD','UNIT_KEYWORD','MODEL_ID','UNIT_ID'].includes(node?.predicate)",
            "line": 69
          },
          {
            "path": "books/shared/roster-v2/conditional-policy.mjs",
            "needle": "['EFFECT_RECIPIENT','RECIPIENT'].includes(role.purpose)",
            "line": 87
          },
          {
            "path": "books/shared/roster-v2/conditional-policy.mjs",
            "needle": "clause.rosterClassification!=='BATTLE_ONLY'",
            "line": 141
          }
        ]
      },
      {
        "cause": "NESTED_SOURCE_TEXT_STAYS_INDEPENDENT",
        "detail": "A nested DETACHMENT_RULE keeps its own identity and parent chain. This producer asserts nested executable bindings absent and only puts direct-child detachmentId on the contract.",
        "refs": [
          {
            "path": "books/space-marines/v2/rule-contract-build.mjs",
            "needle": "Nested source records remain independent display-only clauses.",
            "line": 104
          },
          {
            "path": "books/space-marines/v2/rule-contract-build.mjs",
            "needle": "Nested executable needs an explicit supported binding",
            "line": 107
          }
        ]
      },
      {
        "cause": "TEXT_ONLY_IS_NOT_SEMANTIC_BATTLE_CLASS",
        "detail": "The source-clause review ledger explicitly says TEXT_ONLY does not assert conditionality or that automation is out of product scope.",
        "refs": [
          {
            "path": "books/space-marines/v2/rule-clause-review.json",
            "needle": "TEXT_ONLY does not assert that the clause is conditional",
            "line": 166
          }
        ]
      }
    ],
    "limits": [
      "Read-only structural census; no gameplay completeness claim.",
      "No source prose classification or inferred recipient selectors."
    ],
    "examples": [
      {
        "concept": "displayDetachment",
        "entityId": "detachment-rule-sm-07f085c819ea4835",
        "clauseId": "detachment-rule-sm-07f085c819ea4835#text:19-89",
        "note": "{\"reason\":\"Accepted source text is retained. This exact source clause has no independently verified executable binding in this review yet. TEXT_ONLY does not assert that the clause is conditional or that automation is out of product scope.\",\"reviewClassification\":\"TEXT_ONLY_SOURCE_BACKED\"}"
      },
      {
        "concept": "displayDetachment",
        "entityId": "detachment-rule-sm-35102c2d34334220",
        "clauseId": "detachment-rule-sm-35102c2d34334220#text:17-85",
        "note": "{\"reason\":\"Accepted source text is retained. This exact source clause has no independently verified executable binding in this review yet. TEXT_ONLY does not assert that the clause is conditional or that automation is out of product scope.\",\"reviewClassification\":\"TEXT_ONLY_SOURCE_BACKED\"}"
      },
      {
        "concept": "nestedDetachment",
        "entityId": "detachment-rule-sm-c3bc7e5bc3614044",
        "clauseId": "detachment-rule-sm-c3bc7e5bc3614044#text:0-117",
        "note": "{\"reason\":\"Accepted source text is retained. This exact source clause has no independently verified executable binding in this review yet. TEXT_ONLY does not assert that the clause is conditional or that automation is out of product scope.\",\"reviewClassification\":\"TEXT_ONLY_SOURCE_BACKED\"}"
      },
      {
        "concept": "nestedDetachment",
        "entityId": "detachment-rule-sm-e17a6e4c352748be",
        "clauseId": "detachment-rule-sm-e17a6e4c352748be#text:0-128",
        "note": "{\"reason\":\"Accepted source text is retained. This exact source clause has no independently verified executable binding in this review yet. TEXT_ONLY does not assert that the clause is conditional or that automation is out of product scope.\",\"reviewClassification\":\"TEXT_ONLY_SOURCE_BACKED\"}"
      },
      {
        "concept": "nestedDetachment",
        "entityId": "detachment-rule-sm-e17a6e4c352748be",
        "clauseId": "detachment-rule-sm-e17a6e4c352748be#text:140-202",
        "note": "{\"reason\":\"Accepted source text is retained. This exact source clause has no independently verified executable binding in this review yet. TEXT_ONLY does not assert that the clause is conditional or that automation is out of product scope.\",\"reviewClassification\":\"TEXT_ONLY_SOURCE_BACKED\"}"
      },
      {
        "concept": "executable",
        "entityId": "ability-sm-044155170e2840d9",
        "clauseId": "press-attack-qualified-baseline",
        "note": "{\"reason\":\"Explicit source-reviewed typed lowering; independently exercised on constructed physical rosters.\"}"
      },
      {
        "concept": "executable",
        "entityId": "ability-sm-046203ae581f416e",
        "clauseId": "ranged-assault",
        "note": "{\"reason\":\"Explicit source-reviewed typed lowering; independently exercised on constructed physical rosters.\"}"
      },
      {
        "concept": "UNCONTRACTED_SOURCE_REFERENCE",
        "entityId": "detachment-rule-dw-b41deacc51464866",
        "clauseId": null,
        "note": "null"
      }
    ],
    "controls": [
      "detachment-rule-sm-07f085c819ea4835",
      "detachment-rule-sm-35102c2d34334220",
      "detachment-rule-sm-c3bc7e5bc3614044",
      "detachment-rule-sm-e17a6e4c352748be",
      "ability-sm-044155170e2840d9",
      "ability-sm-046203ae581f416e",
      "detachment-rule-dw-b41deacc51464866"
    ]
  },
  "blood-angels": {
    "runtimePath": "books/blood-angels/v2/generated/roster-import.json",
    "producerRefs": [
      {
        "path": "books/blood-angels/v2/build.py",
        "needle": "def build():",
        "line": 416
      },
      {
        "path": "books/blood-angels/v2/build.py",
        "needle": "def verify_sources(",
        "line": 322
      },
      {
        "path": "books/blood-angels/v2/build.py",
        "needle": "source-bindings.json",
        "line": 338
      },
      {
        "path": "books/blood-angels/v2/build.py",
        "needle": "identity-bindings.json",
        "line": 339
      },
      {
        "path": "books/blood-angels/v2/build.py",
        "needle": "'DATASHEET_SECTION',owner",
        "line": 198
      },
      {
        "path": "books/blood-angels/v2/rule-contract-build.mjs",
        "needle": "export function build",
        "line": 23
      },
      {
        "path": "books/blood-angels/v2/rule-contract-build.mjs",
        "needle": "rosterClassification:'ROSTER_EXECUTABLE'",
        "line": 147
      },
      {
        "path": "books/blood-angels/v2/rule-contract-build.mjs",
        "needle": "rosterClassification:'DISPLAY_ONLY'",
        "line": 153
      },
      {
        "path": "books/blood-angels/v2/rule-contract-build.mjs",
        "needle": "purpose:'OWNER'",
        "line": 115
      },
      {
        "path": "books/blood-angels/v2/rule-contract-build.mjs",
        "needle": "return atom('ALWAYS'",
        "line": 107
      },
      {
        "path": "books/blood-angels/v2/rule-contract-build.mjs",
        "needle": "bindCanonicalContract(",
        "line": 159
      },
      {
        "path": "books/blood-angels/v2/rule-contract-schema.mjs",
        "needle": "export function create",
        "line": 3
      },
      {
        "path": "books/blood-angels/v2/gameplay-presentation-build.mjs",
        "needle": "export function buildGameplayPresentation",
        "line": 12
      },
      {
        "path": "books/blood-angels/v2/app-build.mjs",
        "needle": "export function buildApp()",
        "line": 16
      },
      {
        "path": "books/blood-angels/v2/registration.mjs",
        "needle": "async loadPayload()",
        "line": 8
      },
      {
        "path": "books/blood-angels/v2/roster-boot.mjs",
        "needle": "generated/roster-import.json",
        "line": 5
      },
      {
        "path": "books/shared/rule-contract-v2/bindings.mjs",
        "needle": "export function bindCanonicalContract",
        "line": 145
      },
      {
        "path": "books/shared/rule-contract-v2/bindings.mjs",
        "needle": "Typed declarations are the input authority",
        "line": 4
      },
      {
        "path": "books/shared/rule-contract-v2/schema.mjs",
        "needle": "case 'ALWAYS': return 'TRUE'",
        "line": 229
      },
      {
        "path": "books/shared/roster-v2/conditional-policy.mjs",
        "needle": "clause.rosterClassification==='DISPLAY_ONLY'&&clause.rosterEffects.length===0",
        "line": 13
      },
      {
        "path": "books/shared/roster-v2/conditional-policy.mjs",
        "needle": "return ['MODEL_KEYWORD','UNIT_KEYWORD','MODEL_ID','UNIT_ID'].includes(node?.predicate)",
        "line": 69
      },
      {
        "path": "books/shared/roster-v2/conditional-policy.mjs",
        "needle": "['EFFECT_RECIPIENT','RECIPIENT'].includes(role.purpose)",
        "line": 87
      },
      {
        "path": "books/shared/roster-v2/conditional-policy.mjs",
        "needle": "clause.rosterClassification!=='BATTLE_ONLY'",
        "line": 141
      },
      {
        "path": "books/shared/roster-v2/conditional-policy.mjs",
        "needle": "export function projectConditionalRow",
        "line": 240
      },
      {
        "path": "books/shared/army-book-app-v2/personal.mjs",
        "needle": "const hasSource=row=>",
        "line": 506
      },
      {
        "path": "books/shared/roster-v2/detachment-reference-build.mjs",
        "needle": "assert.ok(!row.ruleContract,'Unreviewed allied rule execution')",
        "line": 14
      },
      {
        "path": "books/blood-angels/v2/roster-build.mjs",
        "needle": "generated/roster-import.json",
        "line": 110
      },
      {
        "path": "books/blood-angels/v2/book-build.mjs",
        "needle": "export function build",
        "line": 19
      },
      {
        "path": "books/blood-angels/v2/book-build.mjs",
        "needle": "inherited-sm-references.json",
        "line": 21
      },
      {
        "path": "books/blood-angels/v2/rule-contract-build.mjs",
        "needle": "source.ruleContract&&source.parentId",
        "line": 39
      },
      {
        "path": "books/blood-angels/v2/rule-contract-build.mjs",
        "needle": "effect.excludeWeaponIds.filter(id=>index.has(id))",
        "line": 44
      },
      {
        "path": "books/blood-angels/v2/build.py",
        "needle": "effective=copy.deepcopy(base)",
        "line": 426
      },
      {
        "path": "books/blood-angels/v2/conditional-policy-declarations.mjs",
        "needle": "conditionalPolicyDeclarations",
        "line": 2
      }
    ],
    "factInputs": {
      "configPath": "books/blood-angels/book.config.json",
      "configDeclaredSources": {
        "factionPack": "content/blood-angels-faction-pack.en.json",
        "codexDatasheets": "content/blood-angels-codex-datasheets.en.json",
        "points": "content/blood-angels-points.en.json",
        "codexParity": "content/blood-angels-codex-parity.en.json",
        "codexWargear": "content/blood-angels-codex-wargear.en.json",
        "relatedRules": "content/blood-angels-related-rules.en.json",
        "manifest": "sources/source-manifest.json",
        "effectContracts": "sources/blood-angels-effect-contracts.v1.json",
        "mfmCurrentCapture": "sources/official-mfm-v1.4.json"
      },
      "configBoundary": "Config source JSON declarations are recorded separately; native V2 build.py directly reads its pinned RAW HTML via V2 enrollment and explicit identity/source ledgers.",
      "enrollmentPath": "books/blood-angels/v2/sources/enrollment.json",
      "acceptedStatus": "ACCEPTED_FOR_LIMITED_FACTUAL_IMPLEMENTATION;SECONDARY_WITH_OFFICIAL_PARTIAL_CORROBORATION",
      "rawFactualInputs": [
        {
          "path": "books/blood-angels/v2/sources/raw/wahapedia-blood-angels-main.html",
          "format": "FROZEN_HTML",
          "authority": "ACCEPTED_SECONDARY",
          "usage": "FACTUAL_INPUT",
          "sha256": "1843A4B2841F7C404CEF7C1B797CFC4344F39B8063ADB236B1DF63A5F43332D4"
        },
        {
          "path": "books/blood-angels/v2/sources/raw/wahapedia-datasheets.html",
          "format": "FROZEN_HTML",
          "authority": "ACCEPTED_SECONDARY",
          "usage": "FACTUAL_INPUT",
          "sha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D"
        },
        {
          "path": "books/space-marines/v2/sources/raw/wahapedia-space-marines-main.html",
          "format": "FROZEN_HTML",
          "authority": "EXISTING_ACCEPTED_SM_OWNER",
          "usage": "DEPENDENCY_SOURCE_REFERENCE_NOT_COPIED_OR_REAPPLIED",
          "sha256": "DD7420597CCC235859B9326F146964746EFFBC8A48752DA4D622BC99DEE1BED7"
        },
        {
          "path": "books/space-marines/v2/sources/raw/wahapedia-datasheets-probe.html",
          "format": "FROZEN_HTML",
          "authority": "EXISTING_ACCEPTED_SM_OWNER",
          "usage": "DEPENDENCY_SOURCE_REFERENCE_NOT_COPIED_OR_REAPPLIED",
          "sha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D"
        }
      ],
      "sourceBindings": "books/blood-angels/v2/source-bindings.json",
      "identityBindings": "books/blood-angels/v2/identity-bindings.json",
      "canonicalPath": "books/blood-angels/v2/generated/base.json",
      "effectivePath": "books/blood-angels/v2/generated/effective.json",
      "reviewLedger": "books/blood-angels/v2/rule-clause-review.json",
      "explicitOperations": "books/blood-angels/v2/rule-contract-declarations.mjs",
      "mfmOwner": "mfm/content effective centralized v1.6 catalog; book adapters bind identities without transferring ownership",
      "officialOverlay": {
        "mode": "NO_ADDITIONAL_APPLICABLE_LOCAL_OFFICIAL_FIELDS_PROVEN",
        "inheritedSmCorrections": "Consume the existing SM effective owner, do not reapply local copies"
      },
      "inheritance": {
        "owner": "space-marines",
        "membership": "books/blood-angels/v2/inherited-sm-references.json",
        "facts": "books/space-marines/v2/generated/effective.json",
        "contracts": "books/space-marines/v2/rule-contract-build.mjs",
        "admission": "Explicit roots plus descendants; canonical parent/source identity/provenance retained"
      }
    },
    "classificationCauses": [
      {
        "cause": "EXPLICIT_REVIEWED_LOWERING",
        "detail": "Literal reviewed source spans and book-owned operation declarations create ROSTER_EXECUTABLE clauses; classification is explicitly assigned by this producer, not inferred by shared presentation.",
        "refs": [
          {
            "path": "books/blood-angels/v2/rule-contract-build.mjs",
            "needle": "rosterClassification:'ROSTER_EXECUTABLE'",
            "line": 147
          }
        ]
      },
      {
        "cause": "EXPLICIT_UNLOWERED_FALLBACK",
        "detail": "Every reviewed span not covered by a complete typed lowering is emitted DISPLAY_ONLY with the review reason/status and no rosterEffects. This label alone does not prove BATTLE_ONLY semantics or a physical recipient.",
        "refs": [
          {
            "path": "books/blood-angels/v2/rule-contract-build.mjs",
            "needle": "rosterClassification:'DISPLAY_ONLY'",
            "line": 153
          }
        ]
      },
      {
        "cause": "OWNER_IS_NOT_RECIPIENT",
        "detail": "All stored clause roles are purpose OWNER. Non-Enhancement owners default to STATIC ALWAYS. The F1 text path requires BATTLE_ONLY and a declared recipient role/selector; OWNER/ALWAYS is not sufficient.",
        "refs": [
          {
            "path": "books/blood-angels/v2/rule-contract-build.mjs",
            "needle": "purpose:'OWNER'",
            "line": 115
          },
          {
            "path": "books/blood-angels/v2/rule-contract-build.mjs",
            "needle": "return atom('ALWAYS'",
            "line": 107
          },
          {
            "path": "books/shared/roster-v2/conditional-policy.mjs",
            "needle": "return ['MODEL_KEYWORD','UNIT_KEYWORD','MODEL_ID','UNIT_ID'].includes(node?.predicate)",
            "line": 69
          },
          {
            "path": "books/shared/roster-v2/conditional-policy.mjs",
            "needle": "['EFFECT_RECIPIENT','RECIPIENT'].includes(role.purpose)",
            "line": 87
          },
          {
            "path": "books/shared/roster-v2/conditional-policy.mjs",
            "needle": "clause.rosterClassification!=='BATTLE_ONLY'",
            "line": 141
          }
        ]
      },
      {
        "cause": "INHERITED_CONTRACT_COPY_WITH_CLOSED_MEMBERSHIP",
        "detail": "Parented SM contracts are copied from the SM owner; excluded weapon-selector IDs are only intersected with admitted entity identities. Parentless SM ARMY_RULEs deliberately are not rebound as local contracts.",
        "refs": [
          {
            "path": "books/blood-angels/v2/rule-contract-build.mjs",
            "needle": "source.ruleContract&&source.parentId",
            "line": 39
          },
          {
            "path": "books/blood-angels/v2/rule-contract-build.mjs",
            "needle": "effect.excludeWeaponIds.filter(id=>index.has(id))",
            "line": 44
          }
        ]
      },
      {
        "cause": "TYPED_CONDITIONAL_DISPLAY_IS_SEPARATE_OPT_IN",
        "detail": "Only listed reviewed record IDs receive conditionalPolicy. These clauses remain DISPLAY_ONLY with zero rosterEffects; shared validation binds evidence/context/provenance, selected ownership and physical recipients. They do not enter the F1 BATTLE_ONLY channel.",
        "refs": [
          {
            "path": "books/blood-angels/v2/rule-contract-build.mjs",
            "needle": "conditionalDeclarations=",
            "line": 67
          },
          {
            "path": "books/blood-angels/v2/rule-contract-build.mjs",
            "needle": "rosterClassification:'DISPLAY_ONLY'",
            "line": 153
          },
          {
            "path": "books/blood-angels/v2/conditional-policy-declarations.mjs",
            "needle": "conditionalPolicyDeclarations",
            "line": 2
          },
          {
            "path": "books/shared/roster-v2/conditional-policy.mjs",
            "needle": "clause.rosterClassification==='DISPLAY_ONLY'&&clause.rosterEffects.length===0",
            "line": 13
          },
          {
            "path": "books/shared/roster-v2/conditional-policy.mjs",
            "needle": "export function projectConditionalRow",
            "line": 240
          },
          {
            "path": "books/shared/army-book-app-v2/personal.mjs",
            "needle": "const hasSource=row=>",
            "line": 506
          }
        ]
      }
    ],
    "limits": [
      "Read-only structural census; no gameplay completeness claim.",
      "No source prose classification or inferred recipient selectors."
    ],
    "examples": [
      {
        "concept": "displayDetachment",
        "entityId": "detachment-rule-ba-10c56bef78b24440bb5f",
        "clauseId": "review/detachment-rule-ba-10c56bef78b24440bb5f/text/121:255",
        "note": "{\"reason\":\"Exact prohibition against other Chapters retained as source text, without an invented army legality validator.\",\"reviewClassification\":\"TEXT_ONLY_SOURCE_BACKED\"}"
      },
      {
        "concept": "displayDetachment",
        "entityId": "detachment-rule-ba-891412625ddf4fba9a95",
        "clauseId": "review/detachment-rule-ba-891412625ddf4fba9a95/text/16:116",
        "note": "{\"reason\":\"Requires exact selected Detachment, confirmed recipient predicates and complete semantics; partial doctrine/restriction fragments cannot certify the complete rule.\",\"reviewClassification\":\"TEXT_ONLY_SOURCE_BACKED\"}"
      },
      {
        "concept": "executable",
        "entityId": "ability-ba-3c7cd126400b4e7cb0fc",
        "clauseId": "forlorn-hero-scouts",
        "note": "{\"reason\":\"Source-reviewed static/physical lowering.\"}"
      },
      {
        "concept": "executable",
        "entityId": "ability-ba-40389ffef38645ca922a",
        "clauseId": "fury-unbound-melee",
        "note": "{\"reason\":\"Source-reviewed static/physical lowering.\"}"
      },
      {
        "concept": "typedConditional",
        "entityId": "ability-ba-16b14dac906045e3a48b",
        "clauseId": "review/ability-ba-16b14dac906045e3a48b/text/0:57",
        "note": "{\"reason\":\"A reroll instruction is preserved, not represented as a numeric stat modifier or assumed roll result.\",\"reviewClassification\":\"TEXT_ONLY_SOURCE_BACKED\"}"
      },
      {
        "concept": "typedConditional",
        "entityId": "ability-ba-1d205c52ba9d49fbbcfd",
        "clauseId": "review/ability-ba-1d205c52ba9d49fbbcfd/text/12:67",
        "note": "{\"reason\":\"A reroll instruction is preserved, not represented as a numeric stat modifier or assumed roll result.\",\"reviewClassification\":\"TEXT_ONLY_SOURCE_BACKED\"}"
      },
      {
        "concept": "UNCONTRACTED_SOURCE_REFERENCE",
        "entityId": "army-rule-sm-940f2057cc7c4551",
        "clauseId": null,
        "note": "null"
      },
      {
        "concept": "UNCONTRACTED_SOURCE_REFERENCE",
        "entityId": "army-rule-sm-a3907d06530b419a",
        "clauseId": null,
        "note": "null"
      },
      {
        "concept": "UNCONTRACTED_SOURCE_REFERENCE",
        "entityId": "army-rule-sm-fcdb8cd8bb5f40dd",
        "clauseId": null,
        "note": "null"
      },
      {
        "concept": "UNCONTRACTED_SOURCE_REFERENCE",
        "entityId": "detachment-rule-dw-b41deacc51464866",
        "clauseId": null,
        "note": "null"
      }
    ],
    "controls": [
      "detachment-rule-ba-10c56bef78b24440bb5f",
      "detachment-rule-ba-891412625ddf4fba9a95",
      "ability-ba-3c7cd126400b4e7cb0fc",
      "ability-ba-40389ffef38645ca922a",
      "ability-ba-16b14dac906045e3a48b",
      "ability-ba-1d205c52ba9d49fbbcfd",
      "army-rule-sm-940f2057cc7c4551",
      "army-rule-sm-a3907d06530b419a",
      "army-rule-sm-fcdb8cd8bb5f40dd",
      "detachment-rule-dw-b41deacc51464866"
    ]
  },
  "dark-angels": {
    "runtimePath": "books/dark-angels/v2/generated/roster-import.json",
    "producerRefs": [
      {
        "path": "books/dark-angels/v2/build.py",
        "needle": "def build():",
        "line": 390
      },
      {
        "path": "books/dark-angels/v2/build.py",
        "needle": "def verify_sources(",
        "line": 301
      },
      {
        "path": "books/dark-angels/v2/build.py",
        "needle": "source-bindings.json",
        "line": 312
      },
      {
        "path": "books/dark-angels/v2/build.py",
        "needle": "identity-bindings.json",
        "line": 313
      },
      {
        "path": "books/dark-angels/v2/build.py",
        "needle": "'DATASHEET_SECTION',owner",
        "line": 177
      },
      {
        "path": "books/dark-angels/v2/rule-contract-build.mjs",
        "needle": "export function build",
        "line": 22
      },
      {
        "path": "books/dark-angels/v2/rule-contract-build.mjs",
        "needle": "rosterClassification:'ROSTER_EXECUTABLE'",
        "line": 130
      },
      {
        "path": "books/dark-angels/v2/rule-contract-build.mjs",
        "needle": "rosterClassification:'DISPLAY_ONLY'",
        "line": 136
      },
      {
        "path": "books/dark-angels/v2/rule-contract-build.mjs",
        "needle": "purpose:'OWNER'",
        "line": 98
      },
      {
        "path": "books/dark-angels/v2/rule-contract-build.mjs",
        "needle": "return atom('ALWAYS'",
        "line": 90
      },
      {
        "path": "books/dark-angels/v2/rule-contract-build.mjs",
        "needle": "bindCanonicalContract(",
        "line": 142
      },
      {
        "path": "books/dark-angels/v2/rule-contract-schema.mjs",
        "needle": "export function create",
        "line": 6
      },
      {
        "path": "books/dark-angels/v2/gameplay-presentation-build.mjs",
        "needle": "export function buildGameplayPresentation",
        "line": 12
      },
      {
        "path": "books/dark-angels/v2/app-build.mjs",
        "needle": "export function buildApp()",
        "line": 16
      },
      {
        "path": "books/dark-angels/v2/registration.mjs",
        "needle": "async loadPayload()",
        "line": 8
      },
      {
        "path": "books/dark-angels/v2/roster-boot.mjs",
        "needle": "generated/roster-import.json",
        "line": 5
      },
      {
        "path": "books/shared/rule-contract-v2/bindings.mjs",
        "needle": "export function bindCanonicalContract",
        "line": 145
      },
      {
        "path": "books/shared/rule-contract-v2/bindings.mjs",
        "needle": "Typed declarations are the input authority",
        "line": 4
      },
      {
        "path": "books/shared/rule-contract-v2/schema.mjs",
        "needle": "case 'ALWAYS': return 'TRUE'",
        "line": 229
      },
      {
        "path": "books/shared/roster-v2/conditional-policy.mjs",
        "needle": "clause.rosterClassification==='DISPLAY_ONLY'&&clause.rosterEffects.length===0",
        "line": 13
      },
      {
        "path": "books/shared/roster-v2/conditional-policy.mjs",
        "needle": "return ['MODEL_KEYWORD','UNIT_KEYWORD','MODEL_ID','UNIT_ID'].includes(node?.predicate)",
        "line": 69
      },
      {
        "path": "books/shared/roster-v2/conditional-policy.mjs",
        "needle": "['EFFECT_RECIPIENT','RECIPIENT'].includes(role.purpose)",
        "line": 87
      },
      {
        "path": "books/shared/roster-v2/conditional-policy.mjs",
        "needle": "clause.rosterClassification!=='BATTLE_ONLY'",
        "line": 141
      },
      {
        "path": "books/shared/roster-v2/conditional-policy.mjs",
        "needle": "export function projectConditionalRow",
        "line": 240
      },
      {
        "path": "books/shared/army-book-app-v2/personal.mjs",
        "needle": "const hasSource=row=>",
        "line": 506
      },
      {
        "path": "books/shared/roster-v2/detachment-reference-build.mjs",
        "needle": "assert.ok(!row.ruleContract,'Unreviewed allied rule execution')",
        "line": 14
      },
      {
        "path": "books/dark-angels/v2/roster-import-build.mjs",
        "needle": "generated/roster-import.json",
        "line": 98
      },
      {
        "path": "books/dark-angels/v2/book-build.mjs",
        "needle": "export function build",
        "line": 19
      },
      {
        "path": "books/dark-angels/v2/book-build.mjs",
        "needle": "inherited-sm-references.json",
        "line": 21
      },
      {
        "path": "books/dark-angels/v2/rule-contract-build.mjs",
        "needle": "source.ruleContract&&source.parentId",
        "line": 38
      },
      {
        "path": "books/dark-angels/v2/rule-contract-build.mjs",
        "needle": "effect.excludeWeaponIds.filter(id=>index.has(id))",
        "line": 43
      },
      {
        "path": "books/dark-angels/v2/build.py",
        "needle": "effective=copy.deepcopy(base)",
        "line": 401
      },
      {
        "path": "books/dark-angels/v2/conditional-policy-declarations.mjs",
        "needle": "conditionalPolicyDeclarations",
        "line": 5
      },
      {
        "path": "books/dark-angels/v2/chapter-bindings-build.mjs",
        "needle": "export function chapterGrantDeclarations",
        "line": 9
      }
    ],
    "factInputs": {
      "configPath": "books/dark-angels/book.config.json",
      "configDeclaredSources": {
        "factionPack": "content/dark-angels-faction-pack.en.json",
        "codexDatasheets": "content/dark-angels-codex-datasheets.en.json",
        "relatedRules": "content/dark-angels-related-rules.en.json",
        "manifest": "sources/source-manifest.json",
        "codexParity": "content/dark-angels-codex-parity.en.json",
        "effectContracts": "sources/dark-angels-effect-contracts.v1.json",
        "mfmCurrentCapture": "sources/official-mfm-v1.4.json"
      },
      "configBoundary": "Config source JSON declarations are recorded separately; native V2 build.py directly reads its pinned RAW HTML via V2 enrollment and explicit identity/source ledgers.",
      "enrollmentPath": "books/dark-angels/v2/sources/enrollment.json",
      "acceptedStatus": "ACCEPTED_FROZEN_SECONDARY; OFFICIAL_PARTIAL_CORROBORATION",
      "rawFactualInputs": [
        {
          "path": "books/dark-angels/v2/sources/raw/wahapedia-dark-angels-main.html",
          "format": "FROZEN_HTML",
          "authority": "ACCEPTED_SECONDARY",
          "usage": "FACTUAL_INPUT",
          "sha256": "67E319B48234DFE7CA854A66E3408146FE637ACB4722AC1DFBC5FC86847DE3DC"
        },
        {
          "path": "books/dark-angels/v2/sources/raw/wahapedia-datasheets.html",
          "format": "FROZEN_HTML",
          "authority": "ACCEPTED_SECONDARY",
          "usage": "FACTUAL_INPUT",
          "sha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D"
        }
      ],
      "sourceBindings": "books/dark-angels/v2/source-bindings.json",
      "identityBindings": "books/dark-angels/v2/identity-bindings.json",
      "canonicalPath": "books/dark-angels/v2/generated/base.json",
      "effectivePath": "books/dark-angels/v2/generated/effective.json",
      "reviewLedger": "books/dark-angels/v2/rule-clause-review.json",
      "explicitOperations": "books/dark-angels/v2/rule-contract-declarations.mjs",
      "mfmOwner": "mfm/content effective centralized v1.6 catalog; book adapters bind identities without transferring ownership",
      "officialOverlay": {
        "mode": "NO_ADDITIONAL_APPLICABLE_LOCAL_OFFICIAL_FIELDS_PROVEN",
        "inheritedSmCorrections": "Consume the existing SM effective owner, do not reapply local copies"
      },
      "inheritance": {
        "owner": "space-marines",
        "membership": "books/dark-angels/v2/inherited-sm-references.json",
        "facts": "books/space-marines/v2/generated/effective.json",
        "contracts": "books/space-marines/v2/rule-contract-build.mjs",
        "admission": "Explicit roots plus descendants; canonical parent/source identity/provenance retained"
      }
    },
    "classificationCauses": [
      {
        "cause": "EXPLICIT_REVIEWED_LOWERING",
        "detail": "Literal reviewed source spans and book-owned operation declarations create ROSTER_EXECUTABLE clauses; classification is explicitly assigned by this producer, not inferred by shared presentation.",
        "refs": [
          {
            "path": "books/dark-angels/v2/rule-contract-build.mjs",
            "needle": "rosterClassification:'ROSTER_EXECUTABLE'",
            "line": 130
          }
        ]
      },
      {
        "cause": "EXPLICIT_UNLOWERED_FALLBACK",
        "detail": "Every reviewed span not covered by a complete typed lowering is emitted DISPLAY_ONLY with the review reason/status and no rosterEffects. This label alone does not prove BATTLE_ONLY semantics or a physical recipient.",
        "refs": [
          {
            "path": "books/dark-angels/v2/rule-contract-build.mjs",
            "needle": "rosterClassification:'DISPLAY_ONLY'",
            "line": 136
          }
        ]
      },
      {
        "cause": "OWNER_IS_NOT_RECIPIENT",
        "detail": "All stored clause roles are purpose OWNER. Non-Enhancement owners default to STATIC ALWAYS. The F1 text path requires BATTLE_ONLY and a declared recipient role/selector; OWNER/ALWAYS is not sufficient.",
        "refs": [
          {
            "path": "books/dark-angels/v2/rule-contract-build.mjs",
            "needle": "purpose:'OWNER'",
            "line": 98
          },
          {
            "path": "books/dark-angels/v2/rule-contract-build.mjs",
            "needle": "return atom('ALWAYS'",
            "line": 90
          },
          {
            "path": "books/shared/roster-v2/conditional-policy.mjs",
            "needle": "return ['MODEL_KEYWORD','UNIT_KEYWORD','MODEL_ID','UNIT_ID'].includes(node?.predicate)",
            "line": 69
          },
          {
            "path": "books/shared/roster-v2/conditional-policy.mjs",
            "needle": "['EFFECT_RECIPIENT','RECIPIENT'].includes(role.purpose)",
            "line": 87
          },
          {
            "path": "books/shared/roster-v2/conditional-policy.mjs",
            "needle": "clause.rosterClassification!=='BATTLE_ONLY'",
            "line": 141
          }
        ]
      },
      {
        "cause": "INHERITED_CONTRACT_COPY_WITH_CLOSED_MEMBERSHIP",
        "detail": "Parented SM contracts are copied from the SM owner; excluded weapon-selector IDs are only intersected with admitted entity identities. Parentless SM ARMY_RULEs deliberately are not rebound as local contracts.",
        "refs": [
          {
            "path": "books/dark-angels/v2/rule-contract-build.mjs",
            "needle": "source.ruleContract&&source.parentId",
            "line": 38
          },
          {
            "path": "books/dark-angels/v2/rule-contract-build.mjs",
            "needle": "effect.excludeWeaponIds.filter(id=>index.has(id))",
            "line": 43
          }
        ]
      },
      {
        "cause": "TYPED_CONDITIONAL_DISPLAY_IS_SEPARATE_OPT_IN",
        "detail": "Only listed reviewed record IDs receive conditionalPolicy. These clauses remain DISPLAY_ONLY with zero rosterEffects; shared validation binds evidence/context/provenance, selected ownership and physical recipients. They do not enter the F1 BATTLE_ONLY channel.",
        "refs": [
          {
            "path": "books/dark-angels/v2/rule-contract-build.mjs",
            "needle": "conditionalDeclarations=",
            "line": 69
          },
          {
            "path": "books/dark-angels/v2/rule-contract-build.mjs",
            "needle": "rosterClassification:'DISPLAY_ONLY'",
            "line": 136
          },
          {
            "path": "books/dark-angels/v2/conditional-policy-declarations.mjs",
            "needle": "conditionalPolicyDeclarations",
            "line": 5
          },
          {
            "path": "books/shared/roster-v2/conditional-policy.mjs",
            "needle": "clause.rosterClassification==='DISPLAY_ONLY'&&clause.rosterEffects.length===0",
            "line": 13
          },
          {
            "path": "books/shared/roster-v2/conditional-policy.mjs",
            "needle": "export function projectConditionalRow",
            "line": 240
          },
          {
            "path": "books/shared/army-book-app-v2/personal.mjs",
            "needle": "const hasSource=row=>",
            "line": 506
          }
        ]
      },
      {
        "cause": "DA_CHAPTER_GRANTS_ARE_EXPLICIT_TYPED_DECLARATIONS",
        "detail": "chapterGrantDeclarations are appended to declared effects; physical Chapter and army membership come from the schema binder, not book/Detachment names or consumer extras.",
        "refs": [
          {
            "path": "books/dark-angels/v2/rule-contract-build.mjs",
            "needle": "inputs=[...inputs,...chapterGrantDeclarations()]",
            "line": 23
          },
          {
            "path": "books/dark-angels/v2/rule-contract-schema.mjs",
            "needle": "const stateFields={}",
            "line": 7
          },
          {
            "path": "books/dark-angels/v2/rule-contract-schema.mjs",
            "needle": "modelAbilities:['Deep Strike']",
            "line": 12
          },
          {
            "path": "books/dark-angels/v2/rule-contract-schema.mjs",
            "needle": "Caller extras cannot substitute for the verified physical source row.",
            "line": 18
          }
        ]
      }
    ],
    "limits": [
      "Read-only structural census; no gameplay completeness claim.",
      "No source prose classification or inferred recipient selectors."
    ],
    "examples": [
      {
        "concept": "displayDetachment",
        "entityId": "detachment-rule-da-40ccb5dde8fa45a89798",
        "clauseId": "review/detachment-rule-da-40ccb5dde8fa45a89798/text/17:145",
        "note": "{\"reason\":\"Full source text retained; battle action, target, timing, restriction or unsupported operation is not automatically assumed.\",\"reviewClassification\":\"TEXT_ONLY_SOURCE_BACKED\"}"
      },
      {
        "concept": "displayDetachment",
        "entityId": "detachment-rule-da-40ccb5dde8fa45a89798",
        "clauseId": "review/detachment-rule-da-40ccb5dde8fa45a89798/text/146:279",
        "note": "{\"reason\":\"Full source text retained; battle action, target, timing, restriction or unsupported operation is not automatically assumed.\",\"reviewClassification\":\"TEXT_ONLY_SOURCE_BACKED\"}"
      },
      {
        "concept": "executable",
        "entityId": "ability-da-4d1396f4342347baa772",
        "clauseId": "astartes-banner",
        "note": "{\"reason\":\"Source-reviewed static/physical lowering.\"}"
      },
      {
        "concept": "executable",
        "entityId": "ability-da-594a7ae294c948b39173",
        "clauseId": "book-of-salvation",
        "note": "{\"reason\":\"Source-reviewed static/physical lowering.\"}"
      },
      {
        "concept": "typedConditional",
        "entityId": "ability-da-490661bbb1ff4d45a4b8",
        "clauseId": "review/ability-da-490661bbb1ff4d45a4b8/text/0:111",
        "note": "{\"reason\":\"Typed incoming-attack policy retains actual defending physical UNIT/formation, melee/ranged or S>T qualification and exact source. It does not change outgoing weapons, target T, or resolve an unknown attack.\",\"reviewClassification\":\"CONDITIONAL_TEXT_ONLY\"}"
      },
      {
        "concept": "typedConditional",
        "entityId": "ability-da-4c9ca538c02844aa9c2a",
        "clauseId": "review/ability-da-4c9ca538c02844aa9c2a/text/56:68",
        "note": "{\"reason\":\"Exact optional ignore-modifier policy identifies BS/WS or Hit rolls and current physical UNIT/formation. It does not SET skill or silently suppress any existing modifier; application requires the actual attack/modifier and player choice.\",\"reviewClassification\":\"CONDITIONAL_TEXT_ONLY\"}"
      },
      {
        "concept": "UNCONTRACTED_SOURCE_REFERENCE",
        "entityId": "army-rule-sm-940f2057cc7c4551",
        "clauseId": null,
        "note": "null"
      },
      {
        "concept": "UNCONTRACTED_SOURCE_REFERENCE",
        "entityId": "army-rule-sm-a3907d06530b419a",
        "clauseId": null,
        "note": "null"
      },
      {
        "concept": "UNCONTRACTED_SOURCE_REFERENCE",
        "entityId": "army-rule-sm-fcdb8cd8bb5f40dd",
        "clauseId": null,
        "note": "null"
      },
      {
        "concept": "UNCONTRACTED_SOURCE_REFERENCE",
        "entityId": "detachment-rule-dw-b41deacc51464866",
        "clauseId": null,
        "note": "null"
      }
    ],
    "controls": [
      "detachment-rule-da-40ccb5dde8fa45a89798",
      "ability-da-4d1396f4342347baa772",
      "ability-da-594a7ae294c948b39173",
      "ability-da-490661bbb1ff4d45a4b8",
      "ability-da-4c9ca538c02844aa9c2a",
      "army-rule-sm-940f2057cc7c4551",
      "army-rule-sm-a3907d06530b419a",
      "army-rule-sm-fcdb8cd8bb5f40dd",
      "detachment-rule-dw-b41deacc51464866"
    ]
  }
};

const REGISTERED_EXCEPTIONS=new Set([]); // No missing source files at this base.
function exception(book,code,key,reason){const id=book+'|'+code+'|'+key;invariant(REGISTERED_EXCEPTIONS.has(id),'Unregistered exception: '+id);exceptions.set(id,{id,bookId:book,code,key,reason});return id;}
function sourceInfo(book,entity,contract,file,index){
 const proof=entity.provenance||{},fieldProvenance=entity.fieldProvenance||{},ids=[];walk({proof,fieldProvenance},v=>{if(typeof v.sourceId==='string')ids.push(v.sourceId);});if(contract?.sourceId)ids.push(contract.sourceId);
 const candidates=[];walk({proof,fieldProvenance},v=>{for(const k of ['sourcePath','document','corpusDocument','file','path'])if(typeof v[k]==='string'&&/^(books|mfm|missions)\//.test(v[k]))candidates.push(v[k]);});
 const paths=unique(candidates).map(p=>{if(exists(p)){read(p);return {path:p,status:'RESOLVED'};}return {path:p,status:'UNKNOWN',exceptionId:exception(book,'MISSING_HISTORICAL_SOURCE_PATH',p,'Runtime provenance names a file absent at the fixed base; no source refresh or replacement inferred.')};});
 if(!paths.length)paths.push({path:'UNKNOWN',status:'UNKNOWN',exceptionId:exception(book,'SOURCE_FILE_NOT_BOUND',unique(ids).join(','),'Source identity is present or absent as recorded, but provenance does not directly identify a repository source artifact; no filename guessed.')});
 return {sourceIds:unique(ids),paths,provenance:proof,fieldProvenance,fieldProvenanceEvidence:loc(file,`/entities/${index}/fieldProvenance`),runtimeEvidence:loc(file,`/entities/${index}/provenance`)};
}
function dictionary(book){
 const buckets={};const add=(key,value)=>{buckets[key]??={};const label=value===undefined?'ABSENT':typeof value==='string'?value:stable(value);buckets[key][label]=(buckets[key][label]||0)+1;};
 for(const e of book.entities)if(e.ruleContract){const c=e.ruleContract;add('executionMode',c.executionMode);add('contractKind',c.kind);add('contractSchema',c.schema);
  const role=(r,where)=>{for(const k of ['subject','purpose','binding','sourceRoleId','actorRoleId','required','optional','distinctFromRoleIds','prerequisites'])add(where+'.'+k,r[k]);for(const key of Object.keys(r))add(where+'.fieldNames',key);};
  for(const r of c.roles||[])role(r,'contractRole');
  for(const clause of c.clauses||[]){add('rosterClassification',clause.rosterClassification);add('effectRecipientRoleIds',clause.effectRecipientRoleIds);for(const key of Object.keys(clause))add('clause.fieldNames',key);
   for(const r of clause.roles||[])role(r,'clauseRole');
   for(const ef of clause.rosterEffects||[]){for(const k of ['targetBinding','targetSubject','operation','unitScope','containingUnitScope'])add('rosterEffect.'+k,ef[k]);for(const key of Object.keys(ef))add('rosterEffect.fieldNames',key);}
   add('conditionalPolicy.kind',clause.conditionalPolicy?.kind);add('conditionalPolicy.recipientScope',clause.conditionalPolicy?.recipientScope);
  }
  walk(c,(node,p)=>{if(node.predicate){add('predicates',node.predicate);add('predicateArguments.'+node.predicate,node.arguments);add('predicateContext',node.contextLevel);add('predicateSubject',node.subject);if(node.predicate==='FIELD'){add('FIELD.key',node.arguments?.key);add('FIELD.keyAndLevel',[node.arguments?.key,node.contextLevel]);}}
   if(node.op&&Array.isArray(node.args))add('logicalOperators',node.op);});
 }
 return buckets;
}
function presentation(channel,effect,clause){
 if(channel==='POLICY')return {status:'CURRENTLY_PRESENTED',function:'appendConditionalPolicy -> projectConditionalPolicy -> projectInstanceCards -> rosterConditionalPolicies',verification:'STATIC_CODE_ONLY',evidence:[CODE.policy,CODE.policyProof,CODE.project,CODE.renderer],limitation:'Opt-in policy; requires actual source/assignment/recipient proof, UNKNOWN battle state, no automatic resolution.'};
 if(channel==='EFFECT'&&RENDERED.has(effect.operation))return {status:'CURRENTLY_PRESENTED',function:'executeRosterEffects -> projectEffectiveInstance -> projectInstanceCards -> createDatasheetPresenter',verification:'STATIC_CODE_ONLY',evidence:[CODE.effects,CODE.targets,CODE.project],limitation:'Only when execution predicates are TRUE and the operation-specific proof succeeds; a conditional failure is not an active effect.'};
 if(channel==='ROLE')return {status:'STRUCTURALLY_SUPPORTED_NOT_PRESENTED',function:'No generic receiver-side Enhancement/Leader conditional-text projection; non-Detachment BATTLE_ONLY rows are stored on source only',verification:'STATIC_CODE_ONLY',evidence:[CODE.battle,CODE.project],limitation:'Role participation is not itself a renderer or effect target binding.'};
 return {status:'UNKNOWN',function:'UNKNOWN',verification:'STATIC_CODE_ONLY',evidence:[CODE.project],limitation:'No proven recipient presentation route for this path.'};
}
function recipientPaths(book,entity,clause,contract,file,entityIndex){
 const paths=[],roles=new Map((contract.roles||[]).map(r=>[r.id,r]));for(const r of clause.roles||[])roles.set(r.id,r);
 // This invokes the existing, read-only production declaration gate, not a
 // census-specific English-text selector. It does not instantiate a roster.
 const f1=detachmentTextDeclaration(book,entity,clause);
 const cp=`/entities/${entityIndex}/ruleContract/clauses/${contract.clauses.indexOf(clause)}`;
 const push=v=>paths.push({pathId:v.channel+':'+String(paths.length).padStart(3,'0'),...v});
 for(const [i,effect]of (clause.rosterEffects||[]).entries()){
  const semantics=(clause.semanticEffects||[]).map((value,index)=>({value,index})).filter(({value})=>value.operation===effect.operation&&value.evidence&&stable(value.evidence)===stable(effect.provenance?.semanticEvidence));
  const semanticRoleIds=unique(semantics.map(s=>s.value.recipientRoleId).filter(Boolean));
  let relation=BINDINGS[effect.targetBinding]||'UNKNOWN';
  if(effect.targetBinding==='SOURCE_MODEL'&&!(entity.kind==='ENHANCEMENT'&&contract.assignment))relation='PHYSICAL_SOURCE_UNIT_MODELS';
  if(effect.targetBinding==='SOURCE_UNIT'&&effect.targetSubject==='UNIT')relation=effect.unitScope==='PHYSICAL'?'PHYSICAL_SOURCE_UNIT':'UNIT_EFFECT_FORMED_IF_ATTACHED';
  const ownerOnly=['BEARER_MODEL','PHYSICAL_SOURCE_UNIT','PHYSICAL_SOURCE_UNIT_MODELS'].includes(relation);
  const evidence=[loc(file,cp+'/rosterEffects/'+i),CODE.targets];
  push({channel:'EFFECT',effectId:effect.id??null,operation:effect.operation,targetBinding:effect.targetBinding??null,targetSubject:effect.targetSubject??null,
   relation,unitScope:effect.unitScope??null,targetRoleId:effect.targetRoleId??effect.recipientRoleId??(semanticRoleIds.length===1?semanticRoleIds[0]:null),status:relation==='UNKNOWN'?'UNKNOWN':ownerOnly?'OWNER_ONLY':'EXPLICIT',
   semanticDeclarations:semantics.map(s=>({semanticEffect:s.value,evidence:loc(file,cp+'/semanticEffects/'+s.index),producerEvidence:semanticLoweringEvidence,bindingProof:'Exact operation and provenance.semanticEvidence edge to this canonical clause, not a text-semantic match'})),
   evidence,conditions:effect.conditions||[],selector:effect.selector??null,recipientKeywords:effect.recipientKeywords??null,
   recipientSelectors:effect.recipientSelectors??null,containingUnitScope:effect.containingUnitScope??null,
   weaponSelector:effect.weaponSelector??null,excludeWeaponIds:effect.excludeWeaponIds??null,effectEncoding:effect,
   presentation:presentation('EFFECT',effect,clause),unknownReason:relation==='UNKNOWN'?'UNRECOGNIZED_EFFECT_BINDING':null});
 }
 for(const [i,semantic]of (clause.semanticEffects||[]).entries())invariant(paths.some(p=>p.channel==='EFFECT'&&p.semanticDeclarations.some(s=>s.evidence.pointer===cp+'/semanticEffects/'+i)),'Unregistered unlowered semantic effect '+entity.id+'/'+clause.id+'/'+i);
 if(clause.conditionalPolicy){const policy=clause.conditionalPolicy,relation=SCOPES[policy.recipientScope]||'UNKNOWN';
  push({channel:'POLICY',kind:policy.kind,recipientScope:policy.recipientScope,relation,targetSubject:'UNIT',unitScope:policy.recipientScope,
   status:relation==='UNKNOWN'?'UNKNOWN':policy.recipientScope==='PHYSICAL_UNIT'?'OWNER_ONLY':'EXPLICIT',
   selector:policy.recipientKeywords??null,aura:policy.aura??null,evidence:[loc(file,cp+'/conditionalPolicy'),CODE.policy,CODE.policyProof],
   presentation:presentation('POLICY'),unknownReason:relation==='UNKNOWN'?'UNRECOGNIZED_POLICY_SCOPE':null});
 }
 const reviewedRecipient=clause.reviewedRecipient||clause.rosterClassificationNote?.reviewedRecipient;
 if(reviewedRecipient)push({channel:'REVIEW_METADATA',status:'IMPLICIT_CANDIDATE',relation:'UNKNOWN',
  reviewedRecipient,evidence:[loc(file,cp+(clause.reviewedRecipient?'/reviewedRecipient':'/rosterClassificationNote/reviewedRecipient'))],unknownReason:'Descriptive recipient review is not a runtime selector or physical source-to-recipient binding.',
  presentation:{status:'UNKNOWN',verification:'STATIC_CODE_ONLY',function:'Review annotation only; see concrete effects/policies/roles separately',evidence:[CODE.effects]}});
 if(clause.rosterReferenceBinding)for(const id of clause.rosterReferenceBinding.canonicalRuleReferences||[])push({channel:'REFERENCE',referenceId:id,status:'EXPLICIT',relation:'DECLARED_REFERENCE_RECIPIENTS',
  binding:clause.rosterReferenceBinding,evidence:[loc(file,cp+'/rosterReferenceBinding'),cite('books/shared/roster-v2/effective-instance.mjs','const grantedRules=')],
  presentation:{status:'STRUCTURALLY_SUPPORTED_NOT_PRESENTED',verification:'STATIC_CODE_ONLY',function:'projectEffectiveInstance.enhancements.grantedRules -> source card rosterEnhancements; no generic conditional Enhancement text copy to every receiving component',
   evidence:[CODE.project],limitation:'Referenced ability may have an independent presented effect path. This counts the declared reference/text channel, not a duplicate grant.'}});
 for(const [id,r]of [...roles].sort(([a],[b])=>cmp(a,b))){
  const local=(clause.roles||[]).some(value=>value.id===id);
  const explicit=(clause.effectRecipientRoleIds||[]).includes(id)||recipientPurposes.has(r.purpose),linked=Boolean(r.sourceRoleId||r.binding||r.prerequisites?.length||r.distinctFromRoleIds?.length);
  if((ownerPurposes.has(r.purpose)||contract.assignment?.ownerRoleId===id)&&!explicit)continue;
  if(!explicit&&!linked&&r.purpose!==undefined)continue;
  // An unlabelled role with a nontrivial selector can be a candidate, not proof.
  const nontrivial=leaves(r.selector).some(p=>p.predicate!=='ALWAYS');
  const physicalSelector=leaves(r.selector).some(p=>['MODEL_KEYWORD','UNIT_KEYWORD','MODEL_ID','UNIT_ID'].includes(p.predicate));
  let status=explicit?'EXPLICIT':linked||nontrivial?'IMPLICIT_CANDIDATE':'UNKNOWN';
  if(!local&&status==='EXPLICIT')status='IMPLICIT_CANDIDATE';
  let relation=r.allegiance==='ENEMY'?'ENEMY':r.sourceRoleId?'LINKED_ROLE':r.subject==='FORMED_ATTACHED_UNIT'?'FORMED_UNIT':r.binding==='ATTACK_TARGET'?'ATTACK_TARGET':BINDINGS[r.binding]?'DECLARED_'+r.binding+'_ROLE':'UNKNOWN';
  if(r.allegiance==='FRIENDLY'&&explicit&&physicalSelector&&!linked)relation='FRIENDLY_STRUCTURED_SELECTOR';
  if(!['UNIT','MODEL','FORMED_ATTACHED_UNIT'].includes(r.subject)){
   const nonphysical=r.subject==='ROSTER'&&local&&explicit&&['ROSTER_COMMAND_POINTS','SOURCE_BACKED_MUSTERING_RESTRICTION'].includes(clause.effect?.scope);
   status=nonphysical?'NONE':explicit?'EXPLICIT':'UNKNOWN';relation=r.subject==='ROSTER'?'ROSTER_CONTEXT':'UNKNOWN';
  }
  // Do not hide a partially addressed role merely because another effect exists.
  // Only an explicit role-ID edge proves it is that same realization.
  const explained=paths.filter(p=>p.channel!=='ROLE'&&p.targetRoleId===id).map(p=>p.pathId);
  push({channel:'ROLE',roleId:id,subject:r.subject,purpose:r.purpose??null,relation,status,
   role:r,roleDeclarationLevel:local?'CLAUSE':'CONTRACT',nonUnitModelPurpose:status==='NONE'?clause.effect.scope:null,conditions:clause.conditions||[],evidence:[loc(file,local?cp+'/roles/'+clause.roles.findIndex(value=>value.id===id):`/entities/${entityIndex}/ruleContract/roles/${contract.roles.findIndex(value=>value.id===id)}`),CODE.schema,...(status==='NONE'?[loc(file,cp+'/effect/scope')]:[])],
   realizationLinks:explained,countsAsIndependentRecipientPath:explained.length===0,
   presentation:explained.length?{status:'UNKNOWN',verification:'STATIC_CODE_ONLY',function:'See realizationLinks; role and execution path are not double-counted',evidence:[CODE.effects]}:entity.kind==='DETACHMENT_RULE'?{
    status:local&&f1?.roles.some(role=>role.id===id)?'CURRENTLY_PRESENTED':'UNKNOWN',
    function:'detachmentTextDeclaration -> appendConditionalPolicy -> projectDetachmentText -> rosterDetachmentTexts (strict source/selector/owner-chain gates)',verification:'STATIC_CODE_ONLY',evidence:[CODE.f1,CODE.text],
    limitation:'Conservative structural gate only; no English fallback inference or browser observation. Actual selected Detachment and physical proof still required.'}:
    status==='UNKNOWN'?{status:'UNKNOWN',verification:'STATIC_CODE_ONLY',function:'No proved receiver address; source-only text must not be projected by guessing',evidence:[CODE.battle,CODE.project]}:presentation('ROLE'),
   unknownReason:!local?'Contract-level applicability role is not an explicit edge from this clause to that recipient.':status==='UNKNOWN'?'No explicit recipient purpose, relation binding, or nontrivial source-qualified selector; ALWAYS is not recipient proof.':null});
 }
 return paths;
}
function pathCategory(p){
 if(p.status==='NONE')return null;
 if(p.status==='UNKNOWN')return 'E';
 if(p.status==='IMPLICIT_CANDIDATE')return 'C';
 if(p.presentation.status==='CURRENTLY_PRESENTED')return 'A';
 if(['EXPLICIT','OWNER_ONLY'].includes(p.status)&&['ROLE','REFERENCE'].includes(p.channel))return p.relation==='UNKNOWN'?'C':'B';
 return 'E';
}
function classifyRecord(record){
 const paths=record.recipientPaths.filter(p=>p.countsAsIndependentRecipientPath!==false);
 for(const p of record.recipientPaths)p.f4Category=pathCategory(p);
 if(!paths.length)return record.clauseId!==null&&record.roles.length>0&&record.roles.every(r=>ownerPurposes.has(r.purpose)||record.assignment?.ownerRoleId===r.id)?'D':'E';
 const cats=new Set(paths.map(p=>p.f4Category).filter(Boolean));if(!cats.size)return null;if(cats.size===1)return [...cats][0];return 'C';
}

invariant(execFileSync('git',['diff',BASE,'--name-only','--','books','mfm','missions','package.json'],{cwd:ROOT,encoding:'utf8'}).trim()==='', 'Factual/producer inputs differ from the declared base');
const ALLOWED=new Set(['docs/audit/rule-encoding-census.md','docs/audit/rule-encoding-census.json','tools/audit/rule-encoding-census.mjs']);
for(const args of [['diff',BASE,'--name-only'],['ls-files','--others','--exclude-standard']])for(const file of execFileSync('git',args,{cwd:ROOT,encoding:'utf8'}).trim().split(/\r?\n/).filter(Boolean))invariant(ALLOWED.has(file),'Out-of-scope path '+file);
read('AGENTS.md');read('README.md');read('tools/audit/rule-encoding-census.mjs');
for(const [bookId,p]of Object.entries(PRODUCTION)){
 if(!Array.isArray(p.factInputs)){
  p.factualInputDetails=p.factInputs;
  const values=[];walk(p.factInputs,node=>{if(node.path&&node.format)values.push(node);});
  for(const entry of strings(p.factInputs))if(/^books\/.*\.(?:json|mjs|py|html|pdf)$/.test(entry.text))values.push({path:entry.text,format:path.posix.extname(entry.text).slice(1).toUpperCase(),role:'Explicit producer/input/dependency path; see factualInputDetails for authority'});
  p.factInputs=unique(values).sort((a,b)=>cmp(a.path,b.path));
 }
 invariant(p.runtimePath===`books/${bookId}/v2/generated/${BOOKS[bookId]}.json`,'Unregistered execution artifact '+bookId);
 p.producerRefs=p.producerRefs.map(ref=>{const source=read(ref.path),needle=ref.needle||ref.anchor;
  invariant(source.split(/\r?\n/)[ref.line-1]?.includes(needle),'Stale producer reference '+ref.path+':'+ref.line);
  return {path:ref.path,line:ref.line,anchor:needle,role:ref.role||ref.note||null};}).sort((a,b)=>cmp(a.path,b.path)||a.line-b.line);
 p.examples=p.examples.filter(e=>e.entityId).sort((a,b)=>cmp(a.entityId,b.entityId)||cmp(a.clauseId||'',b.clauseId||''));
 p.controls=sorted(p.controls);
 walk(p,node=>{if(node.path&&node.line&&(node.needle||node.anchor)){
  invariant(read(node.path).split(/\r?\n/)[node.line-1]?.includes(node.needle||node.anchor),'Stale nested evidence '+node.path+':'+node.line);
 }});
 for(const input of p.factInputs||[]){invariant(exists(input.path),'Missing factual input '+input.path);if(fs.statSync(path.join(ROOT,input.path)).isFile())read(input.path);}
 const folder=`books/${bookId}/v2`;
 for(const name of fs.readdirSync(path.join(ROOT,folder)).sort(cmp))if(/(?:declarations|bindings|schema|state-fields|review).*\.(?:json|mjs)$/.test(name))read(folder+'/'+name);
}
const outputBooks=[],records=[],exclusions=[];
for(const [bookId,artifact]of Object.entries(BOOKS)){
 const file=`books/${bookId}/v2/generated/${artifact}.json`,book=json(file),index=new Map();
 invariant(book.bookId===bookId,'Missing/wrong book '+bookId);
 for(const e of book.entities){invariant(!index.has(e.id),'Duplicate entity '+bookId+'/'+e.id);index.set(e.id,e);if(e.ruleContract)invariant(new Set((e.ruleContract.clauses||[]).map(c=>c.id)).size===(e.ruleContract.clauses||[]).length,'Duplicate clause '+bookId+'/'+e.id);}
 const config=json(`books/${bookId}/book.config.json`),leaderIds=new Set([...(book.rosterAttachmentPolicies||[]).map(p=>p.sourceId),
  ...(book.mfmImportReferences?.relationDeclarations||[]).filter(p=>['leader','support'].includes(p.role)).map(p=>p.sourceId)]);
 const sourceConfigReferences=[];
 for(const entry of strings(config.sources||{}))if(/\.(json|html|txt|pdf|mjs)$/.test(entry.text)&&!/^https?:/.test(entry.text)){
  const candidate=path.posix.normalize(/^(books|mfm|missions)\//.test(entry.text)?entry.text:`books/${bookId}/${entry.text}`);
  invariant(exists(candidate),'Unknown configured source path '+bookId+'/'+entry.text);read(candidate);sourceConfigReferences.push({declaration:pointer(entry.path),path:candidate,status:'RESOLVED_CONFIG_DECLARATION_NOT_PROOF_OF_NATIVE_CONSUMPTION'});
 }
 const census={bookId,runtime:file,entityCount:book.entities.length,contractOwners:book.entities.filter(e=>e.ruleContract).length,
  contractClauseCount:sum(book.entities.map(e=>({n:e.ruleContract?.clauses?.length||0})),'n'),dictionary:dictionary(book),
  runtimeSchema:book.schema,fieldDefinitions:book.rosterSchema?.stateFields??'UNKNOWN',lineage:PRODUCTION[bookId]||'UNKNOWN',sourceConfig:config.sources??config.inputs??config,sourceConfigReferences:sourceConfigReferences.sort((a,b)=>cmp(a.declaration,b.declaration)),
  verification:'STATIC_CODE_ONLY',dynamicOverlays:bookId==='tau-empire'?{
   status:'PHYSICAL_CONTEXT_DEPENDENT_NOT_ENUMERATED_AS_TEMPLATE_CLAUSES',evidence:PRODUCTION[bookId].producerRefs.filter(r=>/roster-(?:source|import|runtime)/.test(r.path)),
   note:'Confirmed physical Student/prototype/Shield decisions can add clauses. No fabricated roster is used; template counts are not a census of all future physical instantiations.'}: {status:'STATIC_ARTIFACT_WITH_CONTEXTUAL_EXECUTION',note:'Physical assignments and attachments are evaluated at runtime; this census does not instantiate a roster.'},
  leaderSourceUnitIds:sorted(leaderIds),fieldDeclarationEvidence:PRODUCTION[bookId].producerRefs.filter(r=>/schema|state-fields/.test(r.path))};
 const presentationFile=`books/${bookId}/v2/generated/app-presentation.json`,payload=json(presentationFile),cards=new Map(payload.cards.map(c=>[c.id,c]));
 for(const id of PRODUCTION[bookId].controls)invariant(index.has(id),'Unresolved reviewed control '+bookId+'/'+id);
 for(const [i,e]of book.entities.entries()){
  const c=e.ruleContract,parent=index.get(e.parentId),heading=e.data?.title||e.data?.heading||e.data?.section;
  const wrapper=[...index.values()].some(child=>['DATASHEET_ABILITY','NAMED_RULE_COMPONENT'].includes(child.kind)&&
   (child.parentId===e.id||child.parentId===e.parentId&&child.data?.section===heading));
  const typedAbilityAlias=e.sourceKind==='DATASHEET_ABILITY'||e.data?.wargearAbility===true;
  const textAbility=typedAbilityAlias||['DATASHEET_ABILITY','NAMED_RULE_COMPONENT','EQUIPMENT_ABILITY','SUPPLEMENTAL_DATASHEET_RULE','SPECIAL_DATASHEET_RULE','WEAPON_ABILITY'].includes(e.kind)||
   ['ARMY_RULE','ARMY_RULE_COMPONENT'].includes(e.kind)&&strings(e.data).some(v=>['text','description'].includes(v.path.at(-1)))||
   e.kind==='DATASHEET_SECTION'&&abilityHeadings.has(heading)&&!wrapper;
  const selected=!(noncombatHeadings.has(heading)&&!typedAbilityAlias)&&!(wrapper&&!strings(e.data).some(v=>['text','description'].includes(v.path.at(-1))))&&
   (['ENHANCEMENT','DETACHMENT_RULE'].includes(e.kind)||c?.kind==='DATASHEET_ABILITY'||textAbility);
  if(!selected){exclusions.push({bookId,entityId:e.id,kind:e.kind,reason:noncombatHeadings.has(heading)?'DECLARED_NONCOMBAT_SECTION':wrapper?'CONTRACTED_ABILITY_WRAPPER':'OUTSIDE_REQUESTED_RULE_FAMILIES',evidence:loc(file,`/entities/${i}`)});continue;}
  const clauses=c?.clauses?.length?c.clauses:[null];
  for(const clause of clauses){
   const source=sourceInfo(bookId,e,c,file,i),fields=clause?.sourceFields||c?.sourceFields||strings(e.data).filter(v=>['text','description'].includes(v.path.at(-1))).map(v=>v.path);
   const raw=clause?.evidence?.quote??fields.map(p=>at(e.data,p)).filter(v=>typeof v==='string').join('\n');
   const roles=[...(c?.roles||[]),...(clause?.roles||[])];
   for(const field of fields)invariant(at(e.data,field)!==undefined,'Unknown source field '+bookId+'/'+e.id+'/'+JSON.stringify(field));
   const paths=clause?recipientPaths(book,e,clause,c,file,i):[];
   const record={recordId:JSON.stringify([bookId,e.id,clause?.id??null]),bookId,entityId:e.id,entityKind:e.kind,sourceKind:e.sourceKind??null,contractKind:c?.kind??null,parentId:e.parentId??null,
    title:e.data?.title||e.data?.name||e.displayName||cards.get(e.id)?.title||e.id,clauseId:clause?.id??null,
    sourceId:c?.sourceId||e.provenance?.sourceId||(source.sourceIds.length===1?source.sourceIds[0]:null),sourceIdentityMeaning:c?.sourceId?'CONTRACT_SOURCE':e.provenance?.sourceId?'ENTITY_BASE_SOURCE_NOT_FIELD_OVERRIDE':source.sourceIds.length===1?'UNIQUE_PROVENANCE_SOURCE':'MULTIPLE_OR_UNBOUND_SOURCES',source,sourceFields:fields,
    sourceFieldBindings:fields.map(field=>({field,overrides:Object.entries(e.fieldProvenance||{}).filter(([key])=>{const joined=field.join('/');return joined===key||joined.startsWith(key+'/')||key.startsWith(joined+'/');}).map(([key,provenance])=>({key,provenance})).sort((a,b)=>cmp(a.key,b.key))})),
    quote:Array.from(String(raw||'')).slice(0,160).join(''),quoteLength:Array.from(String(raw||'')).length,
    rosterClassification:clause?.rosterClassification??null,executionMode:c?.executionMode??null,conditionalPolicy:clause?.conditionalPolicy??null,rosterEffects:clause?.rosterEffects||[],clauseEncoding:clause,
    roles,contractRoles:c?.roles||[],clauseRoles:clause?.roles||[],assignment:c?.assignment??null,effectRecipientRoleIds:clause?.effectRecipientRoleIds??null,
    contractMetadata:c?Object.fromEntries(Object.entries(c).filter(([key])=>!['clauses','roles','conditions','assignment','sourceFields'].includes(key))):null,
    conditions:{contract:c?.conditions||[],clause:clause?.conditions||[]},recipientPaths:paths,
    evidence:[loc(file,`/entities/${i}`),CODE.effects,CODE.project],verification:'STATIC_CODE_ONLY',
    sourcePresentation:{status:cards.has(e.id)?'PRESENTED_ON_SOURCE_ONLY':'UNKNOWN',verification:'STATIC_CODE_ONLY',function:cards.has(e.id)?(['ENHANCEMENT','DETACHMENT_RULE','ARMY_RULE','ARMY_RULE_COMPONENT'].includes(e.kind)?'createBookPresenter.render via canonical source card':'createDatasheetPresenter.renderSection / referenced ability card'):'UNKNOWN',evidence:[loc(presentationFile,'/cards'),CODE.source,CODE.bookSource]},
    f4Family:e.kind==='ENHANCEMENT'?'ENHANCEMENT':(parent?.kind==='DATASHEET'||index.get(parent?.parentId)?.kind==='DATASHEET')&&(leaderIds.has(parent.id)||leaderIds.has(parent.parentId)||
      [...leaves(clause?.conditions),...(clause?.roles||[]).flatMap(role=>[...leaves(role.selector),...(role.conditions||[]).flatMap(leaves)])].some(p=>p.predicate==='LEADING')||
      clause?.rosterEffects?.some(effect=>['SOURCE_FORMED_MODELS','LEADERS_OF_SOURCE'].includes(effect.targetBinding)))&&
      !(clause?.attachmentDeclaration||clause?.transportDeclaration||clause?.rosterClassification==='NOT_AN_EFFECT')?'LEADER_SUPPORT_ABILITY':null,
    unknownReason:clause?null:'No clause/contract in the actual execution artifact; source-only text is not a physical recipient declaration.'};
   record.status=paths.some(p=>p.status==='EXPLICIT')?'EXPLICIT':paths.some(p=>p.status==='IMPLICIT_CANDIDATE')?'IMPLICIT_CANDIDATE':paths.some(p=>p.status==='UNKNOWN')?'UNKNOWN':paths.length&&paths.every(p=>p.status==='OWNER_ONLY')?'OWNER_ONLY':paths.length&&paths.every(p=>p.status==='NONE')?'NONE':'UNKNOWN';
   record.statusCounts=Object.fromEntries(['EXPLICIT','IMPLICIT_CANDIDATE','OWNER_ONLY','NONE','UNKNOWN'].map(status=>[status,paths.filter(p=>p.status===status).length]));
   record.producerEvidence=PRODUCTION[bookId].producerRefs.filter(ref=>/build|declarations|lower/.test(ref.path)).slice(0,4);
   record.f4Category=classifyRecord(record);record.presentation={status:paths.some(p=>p.presentation.status==='CURRENTLY_PRESENTED')?'CURRENTLY_PRESENTED':cards.has(e.id)?'PRESENTED_ON_SOURCE_ONLY':'UNKNOWN',verification:'STATIC_CODE_ONLY',presentedPathIds:paths.filter(p=>p.presentation.status==='CURRENTLY_PRESENTED').map(p=>p.pathId),completeness:paths.length&&paths.every(p=>p.presentation.status==='CURRENTLY_PRESENTED')?'ALL_RECORDED_PATHS':'PARTIAL_OR_SOURCE_ONLY',evidence:[CODE.project]};
   if(record.status==='UNKNOWN')record.unknownReason??='Source ownership/participation is recorded, but a receiver-to-source relationship is not proven.';
   records.push(record);
  }
 }
 census.includedRecords=records.filter(r=>r.bookId===bookId).length;
 census.includedClauses=records.filter(r=>r.bookId===bookId&&r.clauseId!==null).length;
 census.uncontractedTextEntities=records.filter(r=>r.bookId===bookId&&r.clauseId===null).length;
 census.includedEntityCount=new Set(records.filter(r=>r.bookId===bookId).map(r=>r.entityId)).size;
 census.detachmentClassifications={};
 for(const e of book.entities.filter(e=>e.kind==='DETACHMENT_RULE'))for(const clause of e.ruleContract?.clauses||[]){const key=clause.rosterClassification??'ABSENT';census.detachmentClassifications[key]=(census.detachmentClassifications[key]||0)+1;}
 census.uncontractedDetachments=book.entities.filter(e=>e.kind==='DETACHMENT_RULE'&&!e.ruleContract?.clauses?.length).length;
 const declarations={};
 if(book.rosterSchema?.stateFields)for(const[key,value]of Object.entries(book.rosterSchema.stateFields))declarations[key]={...value,evidence:loc(file,'/rosterSchema/stateFields/'+key)};
 for(const [p,text]of textCache)if(p.startsWith(`books/${bookId}/v2/`)&&p.endsWith('.mjs')){
  for(const m of text.matchAll(/["']?([A-Za-z_][\w:]*)["']?\s*:\s*\{\s*["']?contextLevel["']?\s*:\s*['"](ROSTER|BATTLE)['"]\s*,\s*["']?valueType["']?\s*:\s*['"](boolean|string|number)['"]/g))
   declarations[m[1]]??={contextLevel:m[2],valueType:m[3],evidence:{path:p,line:text.slice(0,m.index).split(/\r?\n/).length},extraction:'JS_LITERAL_DECLARATION_NOT_PROSE'};
  const constants=new Map([...text.matchAll(/(?:export\s+)?const\s+(\w+)\s*=\s*['"]([^'"]+)['"]/g)].map(m=>[m[1],m[2]]));
  for(const m of text.matchAll(/\[(\w+)\]\s*:\s*\{\s*contextLevel\s*:\s*['"](ROSTER|BATTLE)['"]\s*,\s*valueType\s*:\s*['"](boolean|string|number)['"]/g))if(constants.has(m[1]))
   declarations[constants.get(m[1])]??={contextLevel:m[2],valueType:m[3],evidence:{path:p,line:text.slice(0,m.index).split(/\r?\n/).length},extraction:'JS_COMPUTED_KEY_WITH_LOCAL_STRING_CONSTANT_NOT_PROSE'};
  for(const m of text.matchAll(/for\(const key of \[([^\]]+)\]\)stateFields\[key\]=\{contextLevel:'(ROSTER|BATTLE)',valueType:'(boolean|string|number)'\}/g))
   for(const key of [...m[1].matchAll(/'([^']+)'/g)].map(value=>value[1]))declarations[key]??={contextLevel:m[2],valueType:m[3],evidence:{path:p,line:text.slice(0,m.index).split(/\r?\n/).length},extraction:'JS_LITERAL_KEY_LIST_FACTORY_NOT_PROSE'};
  for(const m of text.matchAll(/stateFields\.(\w+)\s*=\s*\{contextLevel:'(ROSTER|BATTLE)',valueType:'(boolean|string|number)'\}/g))
   declarations[m[1]]??={contextLevel:m[2],valueType:m[3],evidence:{path:p,line:text.slice(0,m.index).split(/\r?\n/).length},extraction:'JS_EXPLICIT_PROPERTY_DECLARATION_NOT_PROSE'};
 }
 if(bookId==='emperors-children'){
  // Explicit producer exports, including computed declaration keys. No effects
  // are executed and no source prose is interpreted by the census.
  const schemaPath='books/emperors-children/v2/rule-contract-schema.mjs',permissionPath='books/emperors-children/v2/rule-contract-permission-declarations.mjs';
  const schema=await import('../../'+schemaPath),permission=await import('../../'+permissionPath);
  for(const [specs,p,anchor]of [[schema.finalStateFields,schemaPath,'export const finalStateFields'],[schema.formationStateFields,schemaPath,'export const formationStateFields'],[permission.permissionStateFields,permissionPath,'export const permissionStateFields']])
   for(const[key,value]of Object.entries(specs))declarations[key]={...value,evidence:cite(p,anchor),extraction:'EXPLICIT_READ_ONLY_PRODUCER_EXPORT'};
 }
 census.fieldDefinitions=declarations;
 census.usedFieldsWithoutLiteralDefinition=Object.keys(census.dictionary['FIELD.key']||{}).filter(key=>!declarations[key]).sort(cmp);
 census.fieldDefinitionLimitation='Literal extraction is a lower bound, not schema validation. Book factories also derive fields from contract FIELD atoms or computed constant keys. Used keys/context/counts above are exhaustive serialized occurrences.';
 census.additionalPredicateUsage=Object.fromEntries(Object.entries(census.dictionary.predicates||{}).filter(([key])=>!predicateTypes[key]));
 outputBooks.push(census);
}
// BA's schema factory delegates to SM; it does not have an empty vocabulary.
{
 const ba=outputBooks.find(b=>b.bookId==='blood-angels'),sm=outputBooks.find(b=>b.bookId==='space-marines');
 const delegation=cite('books/blood-angels/v2/rule-contract-schema.mjs','const schema=createSpaceMarinesRuleSchema');
 for(const[key,value]of Object.entries(sm.fieldDefinitions))ba.fieldDefinitions[key]={...value,delegationEvidence:delegation};
 ba.usedFieldsWithoutLiteralDefinition=Object.keys(ba.dictionary['FIELD.key']||{}).filter(key=>!ba.fieldDefinitions[key]).sort(cmp);
}
invariant(outputBooks.length===9,'Missing book');invariant(new Set(records.map(r=>r.recordId)).size===records.length,'Duplicate census record');
records.sort((a,b)=>cmp(a.bookId,b.bookId)||cmp(a.entityId,b.entityId)||cmp(a.clauseId||'',b.clauseId||''));
const planning=[];
for(const book of outputBooks)for(const family of ['ENHANCEMENT','LEADER_SUPPORT_ABILITY']){
 const familyRows=records.filter(r=>r.bookId===book.bookId&&r.f4Family===family),rows=familyRows.filter(r=>r.f4Category!==null),nonphysical=familyRows.filter(r=>r.f4Category===null),categories={};
 for(const category of ['A','B','C','D','E'])categories[category]={records:rows.filter(r=>r.f4Category===category).length,clauses:rows.filter(r=>r.f4Category===category&&r.clauseId!==null).length,uncontractedEntities:rows.filter(r=>r.f4Category===category&&r.clauseId===null).length,
  recipientPaths:sum(rows.map(r=>({n:r.recipientPaths.filter(p=>p.countsAsIndependentRecipientPath!==false&&p.f4Category===category).length})),'n')};
 invariant(sum(Object.values(categories),'records')===rows.length,'F4 double count');
 invariant(sum(Object.values(categories),'clauses')===rows.filter(r=>r.clauseId!==null).length,'Invented/missing clauses');
 invariant(sum(Object.values(categories),'recipientPaths')===sum(rows.map(r=>({n:r.recipientPaths.filter(p=>p.countsAsIndependentRecipientPath!==false&&p.f4Category!==null).length})),'n'),'Lost/double-counted recipient path');
 planning.push({bookId:book.bookId,family,records:rows.length,actualClauses:rows.filter(r=>r.clauseId!==null).length,uncontractedEntities:rows.filter(r=>r.clauseId===null).length,
  excludedNonUnitModel:{clauses:nonphysical.filter(r=>r.clauseId!==null).length,recordIds:nonphysical.map(r=>r.recordId),reason:'Proved ROSTER command-point/mustering purpose; no UNIT/MODEL receiver. Preserved as NONE, not placed in A–E.'},categories});
}

// Report/output implementation follows the independently reviewed producer map.
const result={schema:'rule-encoding-census/v1',base:BASE,baseTree:execFileSync('git',['rev-parse',BASE+'^{tree}'],{cwd:ROOT,encoding:'utf8'}).trim(),featureBranch:'codex/rule-encoding-census',verification:'STATIC_CODE_ONLY',excludedBooks:['orks'],
 definitions:{subjects,levels,predicateTypes,evidence:CODE.schema},books:outputBooks,planning,
 unknown:{records:records.filter(r=>r.status==='UNKNOWN').length,clauses:records.filter(r=>r.status==='UNKNOWN'&&r.clauseId!==null).length,uncontractedEntities:records.filter(r=>r.status==='UNKNOWN'&&r.clauseId===null).length,recipientPaths:sum(records.map(r=>({n:r.recipientPaths.filter(p=>p.status==='UNKNOWN').length})),'n')},
 exceptions:[...exceptions.values()].sort((a,b)=>cmp(a.id,b.id)),exclusions,clauses:records};

// Concept comparisons use structural addresses only. A matching binding is
// evidence for that binding, never proof that similar English has one meaning.
const CONCEPTS=[
 ['bearer’s unit','UNIT от источника / formed scope',r=>r.recipientPaths.some(p=>p.targetBinding==='SOURCE_UNIT'||['FORMED_UNIT','PHYSICAL_UNIT'].includes(p.recipientScope))],
 ['models in the bearer’s unit','Физические MODEL и formed MODEL считаются отдельно',r=>r.recipientPaths.some(p=>['SOURCE_UNIT_MODELS','SOURCE_FORMED_MODELS'].includes(p.targetBinding))],
 ['while this model is leading a unit','Только реальный predicate LEADING',r=>{let yes=false;walk(r.clauseEncoding||{},v=>{if(v.predicate==='LEADING')yes=true;});return yes;}],
 ['that unit','Только sourceRoleId / prerequisites; местоимение не разрешается по тексту',r=>r.recipientPaths.some(p=>p.role?.sourceRoleId||p.role?.prerequisites?.length)],
 ['лидерский бонус Bodyguard','BODYGUARD_ID либо LEADERS_OF_SOURCE; направление гранта сохраняется',r=>{let yes=r.recipientPaths.some(p=>p.targetBinding==='LEADERS_OF_SOURCE');walk(r.clauseEncoding||{},v=>{if(v.predicate==='BODYGUARD_ID')yes=true;});return yes;}],
 ['ауры дружественным отрядам','Только typed AURA_UNRESOLVED; остальные — отдельные reviewed controls',r=>r.recipientPaths.some(p=>p.recipientScope==='AURA_UNRESOLVED')],
 ['условный выбор игрока','Явно зарегистрированные control examples выбора; не поиск английских слов',r=>PRODUCTION[r.bookId].examples.some(e=>e.entityId===r.entityId&&['Player source selection','Physical player source selection','Exact selected physical weapon','Physical player selection','UNIT source selection with multiple clauses and embedded table','detachment optional pregame unit selection','initial roster membership versus protocol selection'].includes(e.concept))],
 ['неизвестные обстоятельства боя','Реальные BATTLE-предикаты / policy; UNKNOWN не равен применённому эффекту',r=>{let yes=Boolean(r.conditionalPolicy);walk(r.clauseEncoding||{},v=>{if(v.predicate&&v.contextLevel==='BATTLE')yes=true;});return yes;}]
];
result.methodology={
 scope:'Nine fixed browser execution templates; all Enhancement/Detachment clauses and typed textual datasheet/ability owners, plus Army/Weapon textual definitions for coverage context. Orks excluded.',
 counts:'dictionary counts every serialized ruleContract occurrence, including repeated evidence/role copies. Selected clauses are separately counted once per bookId/entityId/clauseId. Uncontracted text is one entity record with clauseId=null, never an invented clause.',
 arrays:'Catalog arrays sorted by canonical book/entity/clause/path IDs. Copied source AST args, field paths, tables, provenance and source arrays preserve deterministic source order because their order can be semantic.',
 recipientPaths:'Independent structural encoding channels, not deduplicated physical people or claims of extra gameplay effects. No role-to-effect equivalence is inferred without an explicit role-ID edge. Contract-level roles without a clause edge are candidates only.',
 proofStatuses:{EXPLICIT:'A concrete structured receiver edge, with raw evidence and code.',IMPLICIT_CANDIDATE:'A possible structured role/review link; no inferred English recipient.',OWNER_ONLY:'Only an actual SOURCE_MODEL / physical-source binding or physical policy, not mere source ownership.',NONE:'Reserved for a proved non-UNIT/MODEL purpose; never a fallback for absent data.',UNKNOWN:'No sufficient receiver proof; empty or OWNER/ALWAYS-only declarations do not become OWNER_ONLY.'},
 f4:{A:'Existing static code route for every independently recorded UNIT/MODEL path; not a browser observation.',B:'Every recorded path explicitly addressed but lacking the conditional receiver-text route; feasibility still requires a new audit.',C:'Candidate, contract-only, partial, or mixed A/B/E channels; retain every per-path category.',D:'A clause exists and has only source-owner roles, with no receiver channel. This describes encoding absence, not proof of gameplay need or guaranteed data-only repair.',E:'Unknown receiver encoding, or a textual owner with no clause/contract.',excludedNonUnitModel:'Proved NONE is reported separately, not forced into A–E or hidden as UNKNOWN.'},
 leaderSupportFamily:'Abilities on a datasheet with a structured leader/support relation, plus clauses with LEADING or SOURCE_FORMED_MODELS/LEADERS_OF_SOURCE. Includes personal abilities on those source units; does not infer every one is a Bodyguard bonus. Structural noncombat headings/declarations excluded.',
 presentation:'STATIC_CODE_ONLY throughout. CURRENTLY_PRESENTED means a conditional production code capability with its gates, not observed browser visibility. Physical instance, selected Detachment, attachment, equipment and unknown battle conditions remain unresolved until an actual scenario.',
 f1:'Existing pure detachmentTextDeclaration is executed for static admission. No census-specific English selector is added. Legacy selection logic belongs to that cited production function; its admission does not promote a missing receiver proof to EXPLICIT.',
 sourceAuthority:'Generated artifacts are inventory inputs, not primary gameplay evidence. Source provenance paths, hashes, accepted factual inputs and producer anchors are recorded separately.',
 dynamicLimit:'Tau physical-context source-choice overlays are documented separately; the finite template counts are not a census of all possible dynamically instantiated clauses.'
};
result.controlExamples=outputBooks.flatMap(book=>book.lineage.examples.map(example=>({bookId:book.bookId,...example,
 recordIds:records.filter(r=>r.bookId===book.bookId&&r.entityId===example.entityId&&(example.clauseId===null||r.clauseId===example.clauseId)).map(r=>r.recordId),
 excludedEntity:exclusions.find(e=>e.bookId===book.bookId&&e.entityId===example.entityId)??null
}))).sort((a,b)=>cmp(a.bookId,b.bookId)||cmp(a.entityId,b.entityId)||cmp(a.clauseId||'',b.clauseId||'')||cmp(a.concept,b.concept));
result.conceptComparison=CONCEPTS.map(([concept,boundary,match])=>({concept,boundary,verification:'STRUCTURAL_COMPARISON_NOT_ENGLISH_EQUIVALENCE',books:outputBooks.map(book=>{
 const rows=records.filter(r=>r.bookId===book.bookId&&match(r));return {bookId:book.bookId,clauses:rows.filter(r=>r.clauseId!==null).length,uncontractedEntities:rows.filter(r=>r.clauseId===null).length,recordIds:rows.map(r=>r.recordId),semanticEquivalence:'UNKNOWN'};
})}));
const esc=value=>String(value??'UNKNOWN').replaceAll('|','\\|').replaceAll('\n',' ');
const inline=value=>'`'+String(value).replaceAll('`','′')+'`';
const link=ref=>ref.path?'['+ref.path+':'+ref.line+'](../../'+ref.path+'#L'+ref.line+')':'['+ref.file+'](../../'+ref.file+') '+inline(ref.pointer);
const tally=(rows,key)=>{const out={};for(const r of rows){const k=r[key]??'ABSENT';out[k]=(out[k]||0)+1;}return Object.fromEntries(Object.entries(out).sort(([a],[b])=>cmp(a,b)));};
const dictText=v=>Object.entries(v||{}).sort(([a],[b])=>cmp(a,b)).map(([k,n])=>inline(k)+' × '+n).join('; ')||'нет';
function markdown(data){
 const lines=['# Опись кодирования правил, получателей и условий','',
 'База: '+inline(BASE)+'. Ветка: '+inline(data.featureBranch)+'. Режим всей описи: **STATIC_CODE_ONLY**. Orks исключены. Генераторы игровых данных, приложение и runtime не менялись.','',
 '## 1. Происхождение данных и воспроизводимость','',
 'Документ и соседний JSON создаёт только `node tools/audit/rule-encoding-census.mjs --write`. Проверка: `node tools/audit/rule-encoding-census.mjs --check`. Время запуска, locale и абсолютный путь не входят в результат. В `inputs[]` находятся пути, SHA-256 и размеры всех прочитанных файлов; базовое дерево: '+inline(data.baseTree)+'.','',
 '**Generated — не первичный источник игровых фактов.** Читается фактический артефакт, который загружает книга; принятые HTML/JSON/декларации и доказанные producer edges перечислены отдельно. Отсутствующее звено не восстанавливается по сходству названий.','',
 '| Книга | Прочитано entities | Все contract clauses | Пунктов в описи | Текстовых сущностей без clauses | Runtime |',
 '|---|---:|---:|---:|---:|---|'];
 for(const b of data.books)lines.push('| '+[b.bookId,b.entityCount,b.contractClauseCount,b.includedClauses,b.uncontractedTextEntities,'['+b.runtime+'](../../'+b.runtime+')'].join(' | ')+' |');
 lines.push('','«Все contract clauses» включает типы вне целевого среза, в том числе Stratagem и структурные декларации. «Пунктов в описи» — только выбранные clauses, без фиктивных пунктов для неконтрактного текста. Повторные SM-идентичности в BA/DA считаются внутри каждой книги; ключ записи — тройка book/entity/clause.','');
 for(const b of data.books){lines.push('### '+b.bookId,'','**Принятые входы и форматы:**');
  for(const input of b.lineage.factInputs||[])lines.push('- ['+input.path+'](../../'+input.path+') — '+esc(input.format||'формат указан в source/config')+'.');
  lines.push('','**Проверенная цепочка producers → runtime/presentation:**');
  for(const ref of b.lineage.producerRefs)lines.push('- '+link(ref)+' — '+inline(ref.anchor)+'.');
  lines.push('','Полные роли звеньев и ограничения: `books[].lineage` в JSON. Каждый anchor проверяется по указанной строке; первичные пути каждой записи — `source.paths[]`, исходная provenance сохранена целиком.');
  if(b.bookId==='tau-empire')lines.push('','**Ограничение шаблона:** Student/prototype/Shield могут добавлять clauses по подтверждённому физическому выбору при импорте. Они не считаются отсутствующим игровым механизмом; отдельные будущие физические экземпляры этой статической описью не порождаются.');
  lines.push('');
 }
 lines.push('## 2. Полный словарь используемых конструкций','',
 'Общая схема: '+link(CODE.schema)+'. Допустимые subjects: '+data.definitions.subjects.map(inline).join(', ')+'. Контексты: '+data.definitions.levels.map(inline).join(', ')+'. Предикаты: '+Object.keys(data.definitions.predicateTypes).sort(cmp).map(inline).join(', ')+'. Это определения общей схемы; фактическое употребление ниже посчитано отдельно.','',
 '`dictionary` содержит частоты **каждого сериализованного употребления** во всех ruleContract книги: contract roles и clause roles считаются раздельно, копии одного predicate в разных местах тоже считаются раздельно. `ABSENT` — реально отсутствующее поле, а не значение по умолчанию. Полные AST условий/селекторов остаются в записях и `predicateArguments.*`; это не подсчёт уникальных игровых правил.','',
 'В JSON по каждой книге также есть `clause.fieldNames`, `contractRole.fieldNames`, `clauseRole.fieldNames`, `rosterEffect.fieldNames`, `fieldDefinitions`, `FIELD.keyAndLevel` и `additionalPredicateUsage`. Они отделяют общий каркас от фактически используемых полей расширения и локальных FIELD. Расширение не объявляется неподдержанным лишь потому, что его нет в основном schema.mjs.','');
 const vocab=['contractSchema','executionMode','contractRole.subject','contractRole.purpose','contractRole.binding','contractRole.sourceRoleId','clauseRole.subject','clauseRole.purpose','clauseRole.binding','clauseRole.sourceRoleId','effectRecipientRoleIds','rosterEffect.targetBinding','rosterEffect.targetSubject','rosterEffect.unitScope','rosterEffect.containingUnitScope','conditionalPolicy.kind','conditionalPolicy.recipientScope','predicates','predicateContext','rosterClassification'];
 for(const b of data.books){lines.push('### '+b.bookId,'','| Конструкция | Фактические значения × число |','|---|---|');
  for(const key of vocab)lines.push('| '+inline(key)+' | '+esc(dictText(b.dictionary[key]))+' |');
  lines.push('','Связи ролей (`actorRoleId`, `prerequisites`, `distinctFromRoleIds`, required/optional) со всеми значениями и частотами: `books['+data.books.indexOf(b)+'].dictionary` в JSON. Отсутствующий purpose не доказывает получателя.','',
   '**FIELD key / уровень × число:** '+esc(dictText(b.dictionary['FIELD.keyAndLevel']))+'.','',
   'Ключи без извлечённой literal-декларации: '+(b.usedFieldsWithoutLiteralDefinition.map(inline).join(', ')||'нет')+'. Это **не** отсутствие schema: factories могут выводить объявления из FIELD-атомов или computed constant keys; точный исходный factory указан в `fieldDeclarationEvidence`/`lineage.producerRefs`. Числа употребления ключей вычислены из данных независимо от literal extraction.','');
 }
 lines.push('## 3. Перепись правил и текущие пути отображения','',
 'Одна запись `clauses[]` соответствует одному пункту. При отсутствии clauses создаётся одна текстовая запись с `clauseId: null`; отсутствие контракта не превращается в выдуманную способность. Явные ABILITIES/WARGEAR ABILITIES и типизированные ability/component entities включены. Состав, варианты оружия, LEADER/SUPPORT/TRANSPORT и пустые контейнеры с контрактными дочерними правилами не объявляются пропущенными боевыми способностями; их ID и причины находятся в `exclusions[]`. Army/Weapon определения присутствуют как контекст, но не становятся отдельной F4-семьёй.','',
 'Статусы доказанности относятся к **отношению получателя и источника**, а не к правильности английского правила:','',
 '| Статус | Основание |','|---|---|',
 '| EXPLICIT | Конкретный структурированный receiver edge: effect binding, typed policy или явно участвующая recipient-role. |',
 '| IMPLICIT_CANDIDATE | Проверяемая возможная связь, контрактная роль без ребра к пункту либо reviewed metadata; ручное подтверждение ещё нужно. |',
 '| OWNER_ONLY | Только доказанный physical/source binding или physical policy. OWNER/ALWAYS сами по себе этого не доказывают. |',
 '| NONE | Только доказанное отсутствие UNIT/MODEL-получателя по назначению. Не используется как запасная категория. |',
 '| UNKNOWN | Недостаточно доказательств. Причина сохраняется в записи и каждом отдельном пути. |','',
 '| Книга | Статусы записей | Отдельные каналы recipientPaths | UNKNOWN paths |','|---|---|---:|---:|');
 for(const b of data.books){const rows=data.clauses.filter(r=>r.bookId===b.bookId);lines.push('| '+[b.bookId,esc(dictText(tally(rows,'status'))),sum(rows.map(r=>({n:r.recipientPaths.filter(p=>p.countsAsIndependentRecipientPath!==false).length})),'n'),sum(rows.map(r=>({n:r.recipientPaths.filter(p=>p.status==='UNKNOWN').length})),'n')].join(' | ')+' |');}
 lines.push('','Один пункт может содержать одновременно применяемый эффект и недоказанную роль. Поэтому итоговый status не заменяет `recipientPaths[]`/`statusCounts`; роль и execution-канал не сливаются по совпадению ruleId. Независимыми здесь считаются **каналы записи адресации**, а не дополнительные игровые эффекты или уникальные физические модели. При явном role-ID ребре `realizationLinks` предотвращает повторный подсчёт.','',
 '**Границы адресации:** `SOURCE_UNIT_MODELS` — физические модели; `SOURCE_FORMED_MODELS` — модели сформированной группы; `SOURCE_UNIT` c UNIT может распространять UNIT-свойство на formed group, если операция не требует PHYSICAL. `SOURCE_MODEL` без доказанного Enhancement bearer не означает одну модель: остаются физические профили source. `LEADERS_OF_SOURCE` направлен от Bodyguard к ведущим моделям. UNIT keywords сформированной группы не становятся intrinsic keywords каждой MODEL. Код: '+link(CODE.targets)+'; '+link(CODE.formed)+'. Противник и attack target остаются отдельными role paths. Radius/FIELD без binding не доказывает физическое множество получателей.','',
 '**Отображение сегодня:**','',
 '- Выполненный rosterEffect: `executeRosterEffects → projectEffectiveInstance → projectInstanceCards → createDatasheetPresenter`; только после TRUE условий и физических доказательств.','- Typed policy: `appendConditionalPolicy → projectConditionalPolicy → projectInstanceCards → rosterConditionalPolicies`; battle state остаётся UNKNOWN, execution — CONDITIONAL_TEXT_ONLY.','- F1: `detachmentTextDeclaration → detachmentTextRows/projectDetachmentText → rosterDetachmentTexts`; только допущенные clause roles, выбранный Detachment, точный источник и физический получатель. Существующий production gate проверяется напрямую, новый English parser не создаётся.','- Обычный BATTLE_ONLY Enhancement/Leader без typed policy не получает автоматически receiver-side текст: служебная conditional-строка остаётся отдельным каналом. Само наличие source card доказывает лишь source-page route.','- `rosterReferenceBinding` — отдельный канонический reference channel в `projectEffectiveInstance.enhancements.grantedRules`. Он не равен общему копированию условного текста на все даташиты.','',
 'Код: '+[CODE.effects,CODE.policy,CODE.policyProof,CODE.f1,CODE.project,CODE.renderer,CODE.text,CODE.source].map(link).join('; ')+'.','',
 '**CURRENTLY_PRESENTED означает найденный статический production-путь с указанными gate, а не увиденный браузером эффект.** Для каждой записи/ветви сохранено `verification: STATIC_CODE_ONLY`; фактические ростеры и UI здесь не запускались. Частичное отображение отмечено `PARTIAL_OR_SOURCE_ONLY`.','',
 '### Контрольные записи JSON','',
 'Ниже — компактные проекции конкретных записей из соседнего JSON; полный raw clause, roles, conditions, provenance и отдельные paths не сокращены в JSON. Примеры сверяются по каноническим ID, а не находят семантику по английским словам.','');
 const shown=new Set();
 for(const example of data.controlExamples){const id=example.bookId+'|'+example.entityId;if(shown.has(id))continue;shown.add(id);
  const candidates=data.clauses.filter(r=>r.bookId===example.bookId&&r.entityId===example.entityId),r=candidates.find(r=>r.clauseId===example.clauseId)||candidates[0];
  lines.push('#### '+example.bookId+' / '+inline(example.entityId),'');
  if(!r){lines.push('Структурный или пустой контейнер исключён из списка боевых способностей: '+esc(example.excludedEntity?.reason||'UNKNOWN')+'. Его производитель и исходная запись доступны в `controlExamples[]`.','');continue;}
  const snippet={bookId:r.bookId,entityId:r.entityId,clauseId:r.clauseId,sourceId:r.sourceId,sourcePaths:r.source.paths,sourceFields:r.sourceFields,quote:r.quote,rosterClassification:r.rosterClassification,status:r.status,f4Category:r.f4Family?r.f4Category:null,recipientPaths:r.recipientPaths.map(p=>({pathId:p.pathId,channel:p.channel,status:p.status,relation:p.relation,roleId:p.roleId??null,targetBinding:p.targetBinding??null,presentation:p.presentation.status,unknownReason:p.unknownReason??null})),unknownReason:r.unknownReason};
  lines.push('```json',JSON.stringify(snippet,null,2),'```','',
   'Доказательства producer: '+r.producerEvidence.map(link).join('; ')+'. Путь исходной runtime-записи: '+link(r.evidence[0])+'.','',
   'Ограничение: '+(r.unknownReason||'Физический roster/instance и battle context здесь не инстанцированы; это статическая связь, не UI-наблюдение.')+' Другие пункты этого владельца: '+candidates.map(v=>inline(v.clauseId??'null')).join(', ')+'.','');
 }
 lines.push('### DG: Arch Contaminator → Lord of Contagion → Deathshroud','',
 'Arch Contaminator (`detachment-virulent-vectorium:enhancement:3`, `attack-reroll`) имеет assignment eligible-owner MODEL и отдельный affected-unit UNIT. У последней роли нет recipient purpose; ALWAYS и FIELD bearerUnitModelAttacks не задают физическое ребро bearer → formed recipients. Поэтому эта опись не утверждает передачу Arch Contaminator Deathshroud. Lord of Contagion и Deathshroud проверяются отдельными приведёнными записями: собственные melee/leader grants не заменяют отсутствующую адресацию Enhancement. Цену, состав, attachment или бой опись не вычисляет.','',
 '### AM и CSM: что именно сравнивается','',
 'Control Edict принадлежит Skitarii Marshal, а не всем Tech-priest. У Datasmith Battle Protocols и начальное Data-severed membership — разные clauses. Noospheric Transference содержит самостоятельные selection/choice/option пункты: контрактный beneficiary не подставляется автоматически в каждый clause-role. CSM имеет явно типизированные SOURCE_UNIT/SOURCE_FORMED_MODELS и зависимые роли; это не основание переносить их смысл в DG/AM без такого же ребра. У SM/BA/DA DISPLAY_ONLY и OWNER/ALWAYS — подтверждённый способ сохранить текст владельца, а не доказательство receiver или BATTLE_ONLY.','',
 '## 4. Расхождения одинаково называемых игровых понятий','',
 'Таблицы ниже показывают **реальные структурные аналоги**, не устанавливают равенство игровой семантики. Полный набор ID для каждой ячейки находится в `conceptComparison[].books[].recordIds`. Ноль означает UNKNOWN для сопоставления понятия по данному структурному критерию, а не отсутствие правила в источнике.','');
 for(const concept of data.conceptComparison){lines.push('### '+concept.concept,'',concept.boundary+'. Английский текст не разрешает связь автоматически.','',
  '| Книга | Совпавших clauses | Без clauses | Проверяемый пример |','|---|---:|---:|---|');
  for(const b of concept.books){const r=data.clauses.find(r=>r.recordId===b.recordIds[0]);lines.push('| '+[b.bookId,b.clauses,b.uncontractedEntities,r?inline(r.entityId)+' / '+inline(r.clauseId??'null'):'UNKNOWN — структурное сопоставление не доказано'].join(' | ')+' |');}
  lines.push('');
 }
 lines.push('Существенные противоречия: literal bearer’s unit может быть физическим SOURCE_UNIT, formed MODEL или лишь текстом OWNER; одинаковая фраза не выбирает один из них. LEADING — доказанный roster predicate, но сам по себе не адрес получателя бонуса. `that unit` требует sourceRoleId/prerequisites/конкретного binding. Типизированная аура BA/DA отличается от поля дальности/сырого текста другой книги; остальные ауры по отсутствию typed policy не объявляются отсутствующими. Условный выбор и неизвестный бой сохраняются как текст/UNKNOWN, не как выполненное игровое действие.','',
 '## 5. Почему классификация Detachment clauses различается','',
 '| Книга | Все contract classifications | Только DETACHMENT_RULE clauses | Неконтрактных Detachment entities |','|---|---|---|---:|');
 for(const b of data.books)lines.push('| '+[b.bookId,esc(dictText(b.dictionary.rosterClassification)),esc(dictText(b.detachmentClassifications)),b.uncontractedDetachments].join(' | ')+' |');
 const reasons={
 'adeptus-mechanicus':'Книжные typed declarations задают классификацию каждого пункта. Roster-build заполняет отсутствующий BATTLE_ONLY только для STRATAGEM+BATTLE_ACTION; это не общий классификатор всех Detachment-текстов.',
 'blood-angels':'Явно lowered spans становятся ROSTER_EXECUTABLE; остальные reviewed spans — DISPLAY_ONLY. Часть DISPLAY_ONLY имеет отдельно подтверждённую conditionalPolicy. Наследуемые SM contracts копируются с ограниченной membership.',
 'chaos-space-marines':'Исходные declaration inventories, productClassification и executionMode задают fallback BATTLE_ONLY / NOT_AN_EFFECT / DISPLAY_ONLY. Только reviewed roster-known operations/semanticEffects проходят lowering в ROSTER_EXECUTABLE.',
 'dark-angels':'Reviewed lowering, DISPLAY_ONLY fallback и отдельные typed policies, как у BA; Chapter grants — отдельные явные declarations. Метка не описывает автоматически боевую условность текста.',
 'death-guard':'basicContract исторически классифицирует source payload и категории; unlowered Enhancement/ability payload обычно BATTLE_ONLY, отдельные категории DISPLAY_ONLY, структурные разделы NOT_AN_EFFECT. Исполняемость добавляется конечным allowlist с точной проверкой цитаты.',
 'emperors-children':'Ограниченный overlay прямых эффектов/permissions/formations. Permission-reference и battle payload — разные clauses. Остальные canonical rules producer прямо не классифицирует; нельзя объявить их все BATTLE_ONLY.',
 'space-marines':'Reviewed lowering даёт ROSTER_EXECUTABLE; fallback DISPLAY_ONLY сохраняет независимые source spans. Nested rules сохраняют parent chain. TEXT_ONLY в review ledger прямо не утверждает ни условность, ни невозможность автоматизации.',
 'tau-empire':'Review status сопоставляется с typed lowering: CONDITIONAL/DISPLAY обычно BATTLE_ONLY, кроме явных static presentation sections; CAPABILITY_MISSING/SOURCE_CONFLICT/NOT_PROVEN остаются DISPLAY_ONLY. Физические source choices — дополнительный runtime overlay.',
 'tyranids':'Классифицируется только конечный reviewed allowlist. Остальные фактические тексты остаются без contracts; deferred metadata не является классификацией каждого uncontracted owner.'};
 for(const b of data.books){lines.push('','**'+b.bookId+' — доказанная причина в producer.** '+reasons[b.bookId]+' Доказательства: '+b.lineage.producerRefs.filter(r=>/contract.*build|roster-build|review|lower/.test(r.path)).map(link).join('; ')+'.');}
 lines.push('','**Наблюдаемое различие без доказанной причины:** степень покрытия контрактами и семантическая эквивалентность похожих английских правил между книгами не выводятся из классификации. Почему конкретный нелowered span не был переведён в другой producer-механизм, если ledger этого не объясняет, — UNKNOWN. Числа рассчитаны по каждому clause, общая метка книги не назначается.','',
 '## 6. Числа для планирования F4','',
 'Категории взаимоисключающие **для записи clause**: A — существующий static presentation route для всех её доказанных каналов; B — адресован, но conditional receiver-text route отсутствует; C — частичное/кандидатное/смешанное покрытие; D — у существующего clause нет отдельного receiver encoding, только owner roles; E — UNKNOWN либо текст без clause. D не означает, что известен новый source fact или гарантирована отдельная задача по данным. Доказанные NONE с ROSTER_COMMAND_POINTS / SOURCE_BACKED_MUSTERING_RESTRICTION и локальной ROSTER recipient-role вынесены в N: у них не UNIT/MODEL-получатель, и их нельзя подменять UNKNOWN или задачей F4.','',
 'Семейство leader/support определяется структурными attachment relations и LEADING/formed/leader bindings, а не английскими названиями. Оно включает личные способности таких source units: эти числа не равны числу бонусов Bodyguard. Неконтрактные сущности учитываются отдельно и не увеличивают число clauses.','',
 'В ячейках: **clauses / independent recipient paths / uncontracted entities**. При mixed clause категория C может иметь ноль C-paths: его отдельные пути остаются, например, A и B. Поэтому нельзя суммировать колонку путей только внутри clauses той же категории. Полная cross-check структура сохранена в JSON.','',
 '| Книга | Семейство | A | B | C | D | E | N: NONE clauses | Всего A–E clauses / paths / без clauses |','|---|---|---:|---:|---:|---:|---:|---:|---:|');
 for(const row of data.planning){const value=c=>{const v=row.categories[c];return [v.clauses,v.recipientPaths,v.uncontractedEntities].join(' / ');};lines.push('| '+[row.bookId,row.family,...['A','B','C','D','E'].map(value),row.excludedNonUnitModel.clauses,[row.actualClauses,sum(Object.values(row.categories),'recipientPaths'),row.uncontractedEntities].join(' / ')].join(' | ')+' |');}
 lines.push('','B–D — планировочные группы, **не обещание исправления общим кодом без изменения данных и нового аудита**. Для E не выбирается трактовка по умолчанию. Runtime gates не проверялись на физическом ростере; поэтому A не заявляется браузерным PASS.','',
 '**UNKNOWN:** '+data.unknown.records+' записей, из них '+data.unknown.clauses+' существующих clauses и '+data.unknown.uncontractedEntities+' текстовых сущностей без clauses; '+data.unknown.recipientPaths+' отдельных путей UNKNOWN. Кроме этих чисел, semanticEquivalence в сравнении понятий остаётся UNKNOWN: это другая ось неопределённости, не дополнительные clauses.','',
 '**Пять главных расхождений:**','',
 '1. SM/BA/DA используют reviewed DISPLAY_ONLY и OWNER/ALWAYS; DG/AM/CSM используют другие модели roles и BATTLE_ONLY. Это разные результаты producers, а не одинаковый F1-адрес.','2. DG Arch Contaminator имеет affected-unit без доказанного source-to-formed binding; существующие LoC/Deathshroud эффекты не доказывают передачу этого Enhancement.','3. Книжные effects явно различают SOURCE_UNIT, физические MODEL и formed MODEL; отсутствие purpose либо одинаковый datasheet не задаёт тот же физический recipient.','4. BA/DA typed conditional policies дают отдельный строгий presentation route; ordinary BATTLE_ONLY и contract-level beneficiary не получают его автоматически.','5. EC/Tyranids ограничивают lowering выбранными owners, Tau дополнительно вводит clauses из подтверждённых физических source choices. Непокрытый static text и отсутствующий runtime mechanism — разные выводы.','',
 '**Контроль результата:** script проверяет девять книг, уникальные entity IDs внутри книги и clause IDs внутри owner, существование sourceFields, producer anchors/file paths, зарегистрированные исключения, суммы F4 и отсутствие изменений входов относительно базы. --check сравнивает оба файла побайтово. Неподтверждённые source paths завершают генерацию FAIL, а не превращаются в придуманную ссылку. Зарегистрированных исключений: '+data.exceptions.length+'.','',
 '**Ограничения:** источники не обновлялись, live ingestion и игровые генераторы не запускались; источниковедческая полнота RAW не доказывается. Нет браузерного подтверждения, новых ростеров или оценки игрового баланса. Literal schema extraction не покрывает все динамические factories; фактические FIELD occurrences при этом посчитаны полностью. Сопоставимость английских формулировок и незафиксированные physical/battle contexts остаются UNKNOWN. F4 не начата.','');
 return lines.join('\n');
}
result.inputs=[...inputs.values()].sort((a,b)=>cmp(a.path,b.path));
const outputs={'docs/audit/rule-encoding-census.json':JSON.stringify(result,null,2)+'\n','docs/audit/rule-encoding-census.md':markdown(result)};
const mode=process.argv.slice(2);invariant(mode.length===1&&['--write','--check'].includes(mode[0]),'Use exactly --write or --check');
for(const [p,content]of Object.entries(outputs))if(mode[0]==='--write'){fs.mkdirSync(path.dirname(path.join(ROOT,p)),{recursive:true});fs.writeFileSync(path.join(ROOT,p),content,'utf8');}else invariant(exists(p)&&fs.readFileSync(path.join(ROOT,p)).equals(Buffer.from(content,'utf8')),'FAIL: stale census '+p);
console.log(JSON.stringify({status:'PASS',mode:mode[0],books:outputBooks.length,entities:sum(outputBooks,'entityCount'),templateClauses:sum(outputBooks,'contractClauseCount'),includedClauses:sum(outputBooks,'includedClauses'),records:records.length,unknown:result.unknown,inputs:result.inputs.length}));

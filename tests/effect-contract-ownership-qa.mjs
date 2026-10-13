import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {EFFECT_TYPES,effectBindingKey,effectiveEffectContracts,validateEffectContractSet,validateEffectContractsAgainstCatalog} from '../books/shared/tools/effect-contract.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const books=['death-guard','adeptus-mechanicus','tyranids','tau-empire','emperors-children','chaos-space-marines','space-marines','dark-angels','blood-angels'];
const expected={
  'death-guard':50,'adeptus-mechanicus':48,tyranids:58,'tau-empire':40,'emperors-children':45,
  'chaos-space-marines':100,'space-marines':133,'dark-angels':159,'blood-angels':159
};
const expectedSource={...expected,'dark-angels':46,'blood-angels':46};
// Scoped identity inventory: ef5a1bb1's 549 contracts plus the 17 source-verified
// additions. These fingerprint sorted identity tuples, not generated file bytes.
const expectedInventory={
  'death-guard':'ed404cabbcf42e451952aa110b94e1e963aef1f819b0f660774757791cd06438',
  'adeptus-mechanicus':'ef846a485cfb4a89ac6289e5b4798397041a20b619daf312b053674a352cabb0',
  tyranids:'965fda52dfae5b2f20263f274c60df5ecdec2526972373c0e242ce6461014f10',
  'tau-empire':'cff3439590e2cc7528537bc8c250634d82f49c38d2e49f7f03acb8da86255320',
  'emperors-children':'218679b8b2b64056fcf3f4ee8180e588bd9a8352ec3f3dc4dd4c59eb24fd08e6',
  'chaos-space-marines':'76cf9e656b0cf41d87e179c7bf1a26a5cd3bacec6724bd798ebcc75f5c6140e2',
  'space-marines':'77eb428287452dd8f8535b300fecaefdfb69c3e7394a7e7280b574d91c9dbc6c',
  'dark-angels':'5d92af25d7850dcd00c1d4017ad90ec2c719fbdc3fe37571d8ce27ee99cbf679',
  'blood-angels':'30304e229352d31fea67a72be60ae1eae44991a5cc688f5cf257bddbec716b63'
};
const assertSourceInventory=set=>assert.equal(createHash('sha256').update(JSON.stringify(
  set.contracts.map(contract=>JSON.stringify([contract.sourceBookId,effectBindingKey(contract)])).sort()
)).digest('hex'),expectedInventory[set.bookId],`${set.bookId}: scoped source inventory`);
const clone=value=>structuredClone(value);
const read=relative=>fs.readFileSync(path.join(root,relative),'utf8');
const sourcePath=book=>`books/${book}/sources/${book}-effect-contracts.v1.json`;
const catalogFor=book=>{const scope={window:{}};vm.runInNewContext(read(`books/${book}/scripts/roster-data.js`),scope,{filename:`${book}/roster-data.js`});return scope.window.WH_BOOK_ROSTER_CATALOG;};
const sets=new Map(),catalogs=new Map();
for(const book of books){
  const set=JSON.parse(read(sourcePath(book))),catalog=catalogFor(book);
  validateEffectContractsAgainstCatalog(set,catalog);
  assert.equal(set.bookId,book,`${book}: factual owner`);
  assert.equal(set.contracts.every(contract=>contract.sourceBookId===book),true,`${book}: source ownership`);
  assert.equal(set.contracts.length,expectedSource[book],`${book}: local source projection count`);
  assertSourceInventory(set);
  sets.set(book,set);catalogs.set(book,catalog);
}
assert.equal([...sets.values()].reduce((sum,set)=>sum+set.contracts.length,0),566,'unique source effect contracts');
assert.deepEqual(new Set([...sets.values()].flatMap(set=>set.contracts.flatMap(contract=>contract.clauses.flatMap(clause=>clause.operations.map(operation=>operation.type))))),EFFECT_TYPES,'exact supported effect operation vocabulary');

const localSets=[...sets.values()];
const assertFullEffectPayload=(actual,expected,label)=>assert.deepEqual(
  JSON.parse(JSON.stringify(actual)),
  JSON.parse(JSON.stringify(expected)),
  `${label}: full source/effective effect payload differs`
);
for(const book of books){
  const effective=effectiveEffectContracts(localSets,book),published=catalogs.get(book).effectContracts;
  assert.equal(effective.length,expected[book],`${book}: effective source projection count`);
  assert.deepEqual(effective.map(effectBindingKey),Array.from(published,effectBindingKey),`${book}: generated effective bindings equal source projection`);
  assertFullEffectPayload(published,effective,book);
  assert.deepEqual(effectiveEffectContracts([...localSets].reverse(),book).map(effectBindingKey),effective.map(effectBindingKey),`${book}: source construction order cannot change effective bindings`);
}
assert.equal(Object.values(expected).reduce((sum,value)=>sum+value,0),792,'effective book-scoped bindings');

const runtimeFiles=[
  'books/extensions/book-roster-enhancement-providers.js','books/death-guard/scripts/roster-semantics.js','books/death-guard/scripts/roster-filter.js',
  'books/adeptus-mechanicus/scripts/roster-enhancements.js','books/adeptus-mechanicus/scripts/roster-filter.js','books/tyranids/scripts/roster-filter.js',
  'books/tau-empire/scripts/roster-filter.js','books/emperors-children/scripts/roster-filter.js','books/chaos-space-marines/scripts/roster-filter.js'
];
const runtimeSources=runtimeFiles.map(file=>[file,read(file)]);
for(const [file,source] of runtimeSources){
  assert.match(source,/WHEffectContractRuntime/,`${file}: structured runtime delegation`);
  assert.doesNotMatch(source,/(?:smFamilyEffects|detachmentEffects|enhancementEffects|datasheetEffects|structuredRecords|effectCodeMap|legacyEffects)s*=/,`${file}: runtime factual map remains`);
  assert.doesNotMatch(source,/\b(?:CHARACTERISTIC_ADD|CHARACTERISTIC_SET|WEAPON_CHARACTERISTIC_ADD|WEAPON_TAG_GRANT|WEAPON_PROFILE_GRANT|ABILITY_GRANT|ABILITY_REMOVE|KEYWORD_GRANT|KEYWORD_REMOVE|CANONICAL_REFERENCE)\b|\boperation\s*:\s*['"](?:add|set|grant|remove)['"]/,`${file}: book-specific factual executor emits a gameplay operation`);
}
for(const id of ['enhancement-pledge-of-dark-glory','volley-fire','aegis-protocol-toughness','firestorm-assault-force-war-tempered-artifice']){
  assert.equal(runtimeSources.some(([,source])=>source.includes(id)),false,`${id}: factual identity remains in runtime implementation`);
}
const factualRuntimeTokens=new Set(localSets.flatMap(set=>set.contracts.flatMap(contract=>[contract.canonicalRecordId,...contract.clauses.flatMap(clause=>clause.operations.flatMap(operation=>{
  const target=typeof operation.canonicalTarget==='string'?operation.canonicalTarget:operation.canonicalTarget?.id;
  return [operation.id,...(target?.includes('-')?[target]:[])];
}))])).filter(token=>typeof token==='string'&&token.length>=5));
for(const [file,source] of runtimeSources)for(const token of factualRuntimeTokens)assert.equal(source.includes(token),false,`${file}: runtime-only factual executor contains ${token}`);

const first=sets.get('emperors-children'),firstCatalog=catalogs.get('emperors-children');
const inventoryMutation=(label,change)=>{const changed=clone(first);change(changed);assert.throws(()=>assertSourceInventory(changed),/scoped source inventory/,label);};
inventoryMutation('MISSING_INVENTORY_CONTRACT',set=>{set.contracts.pop();});
inventoryMutation('EXTRA_INVENTORY_CONTRACT',set=>{const extra=clone(set.contracts[0]);extra.canonicalRecordId='unexpected-inventory-contract';set.contracts.push(extra);});
inventoryMutation('DUPLICATE_INVENTORY_CONTRACT',set=>{set.contracts.push(clone(set.contracts[0]));});
inventoryMutation('WRONG_INVENTORY_OWNER',set=>{set.contracts[0].sourceBookId='chaos-space-marines';});
const mutation=(label,change,pattern)=>{const changed=clone(first);change(changed);assert.throws(()=>validateEffectContractsAgainstCatalog(changed,firstCatalog),pattern,label);};
mutation('UNKNOWN_EFFECT_TYPE_MUTATION',set=>{set.contracts[0].clauses[0].operations[0].type='EXECUTE_JS';},/unsupported effect type/);
mutation('UNKNOWN_RECORD_MUTATION',set=>{set.contracts.find(item=>item.sourceKind==='enhancement').canonicalRecordId='enhancement-unknown';},/unknown canonical Enhancement/);
mutation('UNKNOWN_TARGET_MUTATION',set=>{const operation=set.contracts.flatMap(item=>item.clauses.flatMap(clause=>clause.operations)).find(item=>item.type==='CANONICAL_REFERENCE');operation.canonicalTarget='ability-unknown';operation.parameters.referenceKind='ability';},/unknown canonical target/);
mutation('DUPLICATE_EFFECT_MUTATION',set=>{set.contracts.push(clone(set.contracts[0]));},/duplicate scoped effect contract/);
mutation('WRONG_DETACHMENT_MUTATION',set=>{set.contracts.find(item=>item.detachmentId).detachmentId='wrong-detachment';},/unknown Detachment/);
mutation('WRONG_SELECTOR_MUTATION',set=>{set.contracts[0].selector.unitIds=['unit-unknown'];},/selector references unknown unit/);
const staleChildMutation=clone(sets.get('space-marines')),staleChildBinding=staleChildMutation.childIdentities.find(item=>item.canonicalId==='unit-captain-wargear-ability-e950f63e04'),staleChildContract=staleChildMutation.contracts.find(item=>item.canonicalRecordId===staleChildBinding.canonicalId),staleChildId=staleChildBinding.referenceIds[0];staleChildContract.canonicalRecordId=staleChildId;staleChildContract.selector.selectedWargearAbilityIds=[staleChildId];assert.throws(()=>validateEffectContractsAgainstCatalog(staleChildMutation,catalogs.get('space-marines')),/must use canonical persistent child/,'STALE_PERSISTENT_CHILD_EFFECT_REFERENCE_MUTATION');

const semantic=value=>JSON.stringify(value);
const changedParameter=clone(first),changedOperation=changedParameter.contracts.flatMap(item=>item.clauses.flatMap(clause=>clause.operations)).find(item=>typeof item.parameters.delta==='number');changedOperation.parameters.delta=99;
assert.notEqual(semantic(changedParameter),semantic(first),'NUMERIC_PARAMETER_MUTATION must change the accepted semantic projection');
const poisonedEffective=effectiveEffectContracts([changedParameter,...localSets.filter(set=>set.bookId!=='emperors-children')],'emperors-children');
assert.throws(()=>assertFullEffectPayload(firstCatalog.effectContracts,poisonedEffective,'EFFECT_PLUS_99_ATTACK'),/full source\/effective effect payload differs/,'EFFECT_PLUS_99_ATTACK');
const changedCondition=clone(first),conditionOwner=changedCondition.contracts.find(item=>item.clauses.some(clause=>clause.conditions.length));conditionOwner.clauses.find(clause=>clause.conditions.length).conditions=[];
assert.notEqual(semantic(changedCondition),semantic(first),'CONDITION_MUTATION must change the accepted semantic projection');
const changedTiming=clone(first);changedTiming.contracts[0].timingState={kind:'manual-resolution',state:'unknown'};
assert.notEqual(semantic(changedTiming),semantic(first),'TIMING_STATE_MUTATION must change the accepted semantic projection');
mutation('COUNT_PRESERVING_EFFECT_MUTATION',set=>{set.contracts[0].canonicalRecordId='enhancement-count-preserving-substitute';},/unknown canonical/);

const smMutation=clone(sets.get('space-marines')),inherited=smMutation.contracts.find(item=>item.effectiveBookIds.includes('dark-angels'));inherited.effectiveBookIds=inherited.effectiveBookIds.filter(id=>id!=='dark-angels');
assert.equal(effectiveEffectContracts([smMutation,sets.get('dark-angels')],'dark-angels').length,158,'SM inheritance mutation must remove one DA binding');
const supplementMutation=clone(sets.get('dark-angels'));supplementMutation.contracts[0].sourceBookId='space-marines';
assert.throws(()=>validateEffectContractSet(supplementMutation,{expectedBookId:'dark-angels'}),/sourceBookId must equal factual owner/,'supplement local precedence mutation');

const am=catalogs.get('adeptus-mechanicus'),unknownContract=am.effectContracts.find(contract=>contract.clauses.some(clause=>clause.conditions.some(condition=>condition.state==='unknown')));
assert.ok(unknownContract,'unknown conditional state contract');
const runtimeScope={window:{WH_BOOK_ROSTER_CATALOG:{...am,effectContracts:[unknownContract]}}};vm.runInNewContext(read('books/shared/effect-contract-runtime.js'),runtimeScope);
assert.match(read('books/shared/effect-contract-runtime.js'),/effect\.state='conditional';effect\.certainty='unknown'/,'unknown conditional state must not become active');

console.log('Effect contract ownership QA: PASS (566 source contracts, 792 effective bindings, 13 operation types, runtime factual maps removed, 18 adversarial controls).');

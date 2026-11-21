/** Synthetic source-owned equipment: production runtime and attribution, with
 * no Army Book-specific evaluator, aliases, callbacks or computed saved state. */
import assert from 'node:assert/strict';
import {createRuleContractSchema} from '../rule-contract-v2/schema.mjs';
import {sourceSnapshot,compileBookSourceRefs} from '../source-refs-v2/source-refs.mjs';
import {compileRecipientFixture} from './recipient-fixture.mjs';
import {createRosterRuntime} from './runtime.mjs';
import {createRosterConditionBinding} from './condition-binding.mjs';
import {formRoster} from './context.mjs';
import {resolvePhysicalSelectionEffects} from './recipient-execution.mjs';
import {buildAttachmentFeasibility} from './compatibility-feasibility.mjs';
import {projectEffectiveInstance} from './effective-instance.mjs';

const clone=structuredClone,checks=[],negativeControls=[];
const check=(name,run)=>{run();checks.push(name);};
const expectedErrors={
  'foreign MODEL scope':/Physical selection binding: foreign or stale physical MODEL scope/,
  'empty MODEL scope':/Physical selection binding: foreign or stale physical MODEL scope/,
  'foreign source instance':/Physical selection binding: foreign or stale physical MODEL scope/,
  'missing per-MODEL quantity':/Physical selection binding: requires confirmed per-MODEL quantity and source evidence/,
  'pooled quantity':/Physical selection binding: physical quantity contradicts MODEL selection evidence/,
  'corrupt quantity evidence':/Physical selection binding: physical quantity contradicts MODEL selection evidence/,
  'foreign source evidence':/Physical selection binding: requires confirmed per-MODEL quantity and source evidence/,
  'ambiguous local source':/Physical selection binding: ambiguous equipment source occurrence/,
  'duplicate physical selection':/Physical selection binding: duplicate physical equipment selection/,
  'UNIT inventory spoofed as MODEL':/Physical selection binding: UNIT inventory has no confirmed MODEL scope/,
  'unknown binding kind':/Physical selection binding: unknown descriptor/,
  'unknown binding field':/Physical selection binding: unknown descriptor/,
  'missing binding source':/Physical selection binding: missing equipment source reference/,
  'wrong source reference':/Physical selection binding: missing equipment source reference/,
  'wrong physical operation':/Physical selection binding: unsupported physical operation/,
  'wrong physical recipient':/Recipient contract: unresolved or duplicate recipient ID/,
  'orphan recipient guard retained':/Recipient contract: orphan recipient declaration/,
  'wrong same-profile target attribution':/Physical selection binding: unresolved executed MODEL attribution/,
  'inherited proof uses derived group quantity':/Physical selection binding: physical quantity contradicts MODEL selection evidence/,
  'loadout proof uses whole row quantity':/Physical selection binding: physical quantity contradicts MODEL selection evidence/,
  'forged derived group quantity':/Physical selection binding: unresolved derived physical MODEL group/,
  'selection copied to unrelated derived group':/Physical selection binding: selection has no recorded physical owner/
};
const negative=(name,run)=>{
  const expected=expectedErrors[name];assert.ok(expected,'Every negative control needs an exact guard expectation');
  let observed;
  assert.throws(run,error=>{assert.notEqual(error.code,'ERR_ASSERTION','An unrelated assertion is not a rejected mutation');
    assert.match(error.message,expected,name);observed=error.message;return true;},name);
  negativeControls.push({name,expected:expected.source,observed});
};
const id=name=>'synthetic-physical:'+name;
const text='Synthetic equipment adds one wound to its confirmed bearer.';
const evidence={field:['text'],quote:text};
const root={id:id('equipment'),kind:'EQUIPMENT',data:{text},provenance:{sourceId:id('accepted-source')}};
const local={id:id('occurrence'),parentId:id('unit'),kind:'WARGEAR_OPTION',data:{text},provenance:{sourceId:id('local-source')}};
const source=sourceSnapshot(root);
local.ruleContract={schema:'rule-contract/v2',ruleId:local.id,ownerId:local.parentId,sourceId:id('local-source'),kind:'OTHER_RULE',
  executionMode:'DECLARATIVE_APPLICABILITY',contextLevel:'ROSTER',roles:[],conditions:[],sourceFields:[['text']],
  canonicalRuleReferences:[root.id],clauses:[{id:'equipment-bearer',roles:[],conditions:[],sourceFields:[['text']],
    rosterClassification:'ROSTER_EXECUTABLE',rosterEffects:[{id:'equipment-bearer/wounds',operation:'MODIFY_STAT',field:'W',mode:'ADD',value:1,
      targetBinding:'SOURCE_UNIT_MODELS',targetSubject:'MODEL',lifetime:'WHILE_EQUIPPED',conditions:[],sourceFields:[['text']],evidence:clone(evidence),
      referencedRuleId:root.id,sourceRuleEvidence:{evidence:{otherEntityId:root.id,...clone(evidence)}},
      physicalSelection:{kind:'MODEL_EQUIPMENT_QUANTITY',equipmentId:root.id,clauseIdPrefix:'::equipment-instance/',effectIdSuffix:'/wounds'},
      provenance:{canonicalRuleId:root.id,canonicalOwnerId:id('book'),canonicalClauseId:'equipment#wounds',sourceEvidence:source}}]}]};
const declared={bookId:id('book'),entities:[root,local,{id:id('detachment'),kind:'DETACHMENT',data:{title:'Synthetic detachment'}},
  {id:id('unit'),kind:'DATASHEET',data:{title:'Synthetic unit',keywords:[],factionKeywords:[],profileIds:[id('profile')],weaponIds:[],ruleReferenceIds:[],sectionIds:[],wargearOptionIds:[local.id]}},
  {id:id('profile'),kind:'PROFILE',parentId:id('unit'),data:{name:'Synthetic model',W:'8',M:'6"',T:'4',SV:'3+',LD:'6+',OC:'1'}}],
  rosterProfileBindings:[{unitId:id('unit'),profileId:id('profile'),intrinsicKeywords:[],abilities:[],referenceIds:[]}],rosterAttachmentPolicies:[]};
const kernel=createRuleContractSchema({stateFields:{
  physicalUnitInstanceId:{contextLevel:'ROSTER',valueType:'string'},
  physicalModelScopeId:{contextLevel:'ROSTER',valueType:'string'}
}});
declared.compatibilityFeasibility=buildAttachmentFeasibility(declared,[{unitId:id('unit'),profileId:id('profile'),intrinsicKeywords:[],maxModels:3}]);
const book=compileBookSourceRefs(compileRecipientFixture(declared,kernel)),original=JSON.stringify(book);
const equipment=(key,quantity,modelQuantity=1)=>({selectionKey:key,physicalQuantity:quantity*modelQuantity,perModelQuantity:quantity,
  quantityEvidence:{selectedQuantity:quantity,modelQuantity},canonicalProfileIds:[],canonicalEquipmentIds:[local.id],
  canonicalFieldPaths:{[local.id]:['/text']},sourceEquipmentIdentity:root.id,sourceEquipmentProvenance:clone(source)});
const unit=(instance,counts)=>({instanceId:instance,canonicalUnitId:id('unit'),startingStrength:counts.length,enhancementIds:[],selections:[],warlord:null,
  modelRows:counts.map((count,i)=>({rowId:'model-'+i,canonicalProfileId:id('profile'),quantity:1,selections:count?[equipment('selection-'+i,count)]:[],loadouts:[]}))});
const state={schema:'roster-v2/roster',bookId:book.bookId,rosterId:'synthetic-roster',detachments:[{instanceId:'detachment/1',canonicalDetachmentId:id('detachment')}],
  detachmentIds:[id('detachment')],units:[unit('alpha',[2,1,0]),unit('duplicate',[0,0,0])],attachments:[],warlordInstanceId:null};
const schema=input=>createRosterConditionBinding({book,state:input,schema:kernel,inputs:[{key:'sourceEquipmentSelected',arguments:{sourceEquipmentIdentity:root.id},physicalIdentity:true}]});
const runtime=input=>{const service=createRosterRuntime(book,schema(input));service.load(input);return service;};
const wounds=projection=>projection.units.map(unit=>unit.profiles.map(model=>Number(model.profile.W)));
const run=runtime(state),projection=run.projection,saved=run.snapshot();
check('exact MODEL quantities and duplicate isolation',()=>assert.deepEqual(wounds(projection),[[10,9,8],[8,8,8]]));
check('all recorded source and physical trace evidence',()=>{
  const entries=resolvePhysicalSelectionEffects(book,formRoster(book,state));assert.equal(entries.length,2);
  for(const entry of entries){
    assert.equal(entry.effect.value,entry.physicalTarget.model.selections[0].perModelQuantity);
    assert.deepEqual(sourceSnapshot(entry.effect).sourceEvidence,source);
    assert.equal(sourceSnapshot(entry.effect).physicalEquipmentReference.modelScopeId,entry.physicalTarget.model.scopeId);
    assert.equal(entry.declaration.recipientId,entry.effect.recipientId);
  }
  assert.equal(run.effective('alpha').statSources.length,2);
});
check('repeat load is idempotent and source book byte-identical',()=>{
  run.load(run.snapshot());assert.deepEqual(run.projection,projection);assert.equal(JSON.stringify(book),original);
  assert.equal(book.entities.flatMap(rule=>rule.ruleContract?.clauses||[]).length,1);
});
check('explicit homogeneous group retains per-MODEL quantity',()=>{
  const grouped=clone(state);grouped.units[0].modelRows=[{rowId:'group',canonicalProfileId:id('profile'),quantity:3,selections:[equipment('group',2,3)],loadouts:[]}];
  assert.deepEqual(wounds(runtime(grouped).projection),[[10],[8,8,8]]);
});
const splitState=()=>{
  const split=clone(state);
  split.units[0].modelRows=[{rowId:'group',canonicalProfileId:id('profile'),quantity:3,
    selections:[equipment('whole-row',1,3)],loadouts:[{loadoutId:'special',quantity:1,selections:[]}]}];
  return split;
};
check('row quantity three splits into one and two without changing its inventory proof',()=>{
  const split=splitState(),service=runtime(split),derived=service.projection;
  assert.deepEqual(derived.units[0].profiles.map(model=>model.quantity),[1,2]);
  assert.deepEqual(wounds(derived),[[9,9],[8,8,8]]);
  assert.equal(service.snapshot().units[0].modelRows[0].selections[0].physicalQuantity,3);
  const entries=resolvePhysicalSelectionEffects(book,derived);assert.equal(entries.length,2);
  for(const entry of entries){
    assert.equal(entry.effect.value,1);
    assert.equal(entry.clause.id,local.id+'::equipment-instance/'+JSON.stringify(['alpha',entry.physicalTarget.model.scopeId,'whole-row']));
    assert.equal(sourceSnapshot(entry.effect).physicalEquipmentReference.perModelQuantity,1);
  }
  const snapshot=service.snapshot();service.load(snapshot);assert.deepEqual(service.projection,derived);assert.deepEqual(service.snapshot(),snapshot);
  assert.equal(service.effective('alpha').statSources.length,2);
});
check('inherited and loadout-local selections retain distinct original owners',()=>{
  const split=splitState();split.units[0].modelRows[0].loadouts[0].selections=[equipment('loadout-only',1,1)];
  assert.deepEqual(wounds(runtime(split).projection),[[10,9],[8,8,8]]);
  split.units[0].modelRows[0].selections=[];
  assert.deepEqual(wounds(runtime(split).projection),[[9,8],[8,8,8]]);
});
check('row selection survives full allocation and several derived loadout groups',()=>{
  const split=splitState(),row=split.units[0].modelRows[0];
  row.loadouts=[{loadoutId:'first',quantity:1,selections:[]},{loadoutId:'second',quantity:1,selections:[]}];
  assert.deepEqual(wounds(runtime(split).projection),[[9,9,9],[8,8,8]]);
  row.loadouts=[{loadoutId:'all',quantity:3,selections:[]}];
  assert.deepEqual(wounds(runtime(split).projection),[[9],[8,8,8]]);
});
negative('inherited proof uses derived group quantity',()=>{
  const split=splitState();split.units[0].modelRows[0].selections[0].quantityEvidence.modelQuantity=1;runtime(split);
});
negative('loadout proof uses whole row quantity',()=>{
  const split=splitState(),loadout=split.units[0].modelRows[0].loadouts[0];
  loadout.selections=[equipment('loadout-only',1,1)];loadout.selections[0].quantityEvidence.modelQuantity=3;runtime(split);
});
negative('forged derived group quantity',()=>{
  const derived=formRoster(book,splitState());derived.units[0].profiles[1].quantity=1;resolvePhysicalSelectionEffects(book,derived);
});
negative('selection copied to unrelated derived group',()=>{
  const split=splitState();split.units[0].modelRows[0].loadouts[0].selections=[equipment('loadout-only',1,1)];
  const derived=formRoster(book,split);
  derived.units[0].profiles[1].selections.push(clone(derived.units[0].profiles[0].selections.find(selection=>selection.selectionKey==='loadout-only')));
  resolvePhysicalSelectionEffects(book,derived);
});
check('UNIT aggregate and absent selection never manufacture MODEL ownership',()=>{
  const aggregate=clone(state);aggregate.units[0].modelRows.forEach(row=>row.selections=[]);
  aggregate.units[0].selections=[{...equipment('aggregate',4),perModelQuantity:null}];
  assert.deepEqual(wounds(runtime(aggregate).projection),[[8,8,8],[8,8,8]]);
  aggregate.units[0].selections=[];assert.deepEqual(wounds(runtime(aggregate).projection),[[8,8,8],[8,8,8]]);
});
for(const [name,mutate]of [
  ['foreign MODEL scope',selection=>selection.sourceModelScopeId='duplicate/model-0'],
  ['empty MODEL scope',selection=>selection.sourceModelScopeId=''],
  ['foreign source instance',selection=>selection.sourceInstanceId='duplicate'],
  ['missing per-MODEL quantity',selection=>delete selection.perModelQuantity],
  ['pooled quantity',selection=>selection.physicalQuantity=3],
  ['corrupt quantity evidence',selection=>selection.quantityEvidence.selectedQuantity=3],
  ['foreign source evidence',selection=>selection.sourceEquipmentProvenance.sourceId='foreign'],
  ['ambiguous local source',selection=>selection.canonicalEquipmentIds.push(local.id)]
])negative(name,()=>{
  const bad=clone(state);mutate(bad.units[0].modelRows[0].selections[0]);
  try{run.load(bad);}finally{assert.deepEqual(run.snapshot(),saved);assert.deepEqual(run.projection,projection);}
});
negative('duplicate physical selection',()=>{const bad=clone(state);bad.units[0].modelRows[0].selections.push(clone(bad.units[0].modelRows[0].selections[0]));runtime(bad);});
negative('UNIT inventory spoofed as MODEL',()=>{const bad=clone(state);bad.units[0].selections=[{...equipment('aggregate',2),sourceModelScopeId:projection.units[0].profiles[0].scopeId}];runtime(bad);});
for(const [name,mutate]of [
  ['unknown binding kind',effect=>effect.physicalSelection.kind='UNKNOWN'],
  ['unknown binding field',effect=>effect.physicalSelection.callback='unsafe'],
  ['missing binding source',effect=>effect.physicalSelection.equipmentId='missing'],
  ['wrong source reference',effect=>effect.referencedRuleId='missing'],
  ['wrong physical operation',effect=>effect.mode='SET'],
  ['wrong physical recipient',effect=>effect.recipientId='missing']
])negative(name,()=>{
  const bad=clone(book),rule=bad.entities.find(entity=>entity.id===local.id);mutate(rule.ruleContract.clauses[0].rosterEffects[0]);
  createRosterRuntime(bad,schema(state));
});
negative('orphan recipient guard retained',()=>{
  const bad=clone(book);bad.entities.find(entity=>entity.id===local.id).ruleContract.clauses[0].rosterEffects=[];createRosterRuntime(bad,schema(state));
});
// Reject a trace aimed at another same-profile MODEL, even with a valid alias.
negative('wrong same-profile target attribution',()=>{
  const bad=clone(projection);bad.units[0].applied[0].targetCompositionId=bad.units[0].profiles[2].scopeId;
  projectEffectiveInstance(book,bad,'alpha');
});
assert.equal(JSON.stringify(book),original);
console.log(JSON.stringify({status:'PASS',checks,negativeControls,bookMutated:false}));

import assert from 'node:assert/strict';
import {buildAdMechContracts,readJson} from './rule-contract-build.mjs';
import {buildRosterRuntimeBook} from './roster-build.mjs';
import {createAdMechRosterRuntime} from './roster-runtime.mjs';

// Import actual equipment selections. Evidence occurrences are not equipment
// owners and must never substitute for the independently selected canonical ID.
const built=buildAdMechContracts(),book=buildRosterRuntimeBook(built),before=structuredClone(book);
const records=new Map(book.entities.map(e=>[e.id,e]));
const sourceId='datasheet-onager-dunecrawler:section:1';
const equipmentId='datasheet-onager-dunecrawler:wargear:3';
const clauseId='data-tether-smoke-removal';
const clause=records.get(sourceId).ruleContract.clauses.find(c=>c.id===clauseId);
const effect=clause.rosterEffects[0];
assert.deepEqual(effect.equipmentRequirement,{binding:'SOURCE',kind:'EQUIPMENT_PRESENT',
  equipmentId,sourceFieldPath:['text']});
assert.deepEqual(effect.evidence,{field:['blocks',2,'text'],quote:'The bearer loses the SMOKE keyword'});
assert.deepEqual(effect.sourceFields,[['blocks',2,'text']]);
assert.equal(records.get(equipmentId).parentId,records.get(sourceId).parentId);
assert.equal(records.get(equipmentId).kind,'WARGEAR_OPTION');
assert.equal(records.get(equipmentId).data.text,'This model can be equipped with 1 broad spectrum data-tether.');

const header='+ FACTION KEYWORD: Imperium - Adeptus Mechanicus\n+ DETACHMENT: Explorator Maniple\n';
const onager='1x Onager Dunecrawler (120 pts): Neutron laser, Cognis heavy stubber, Dunecrawler legs';
const text=header+'\n10x Skitarii Vanguard (95 pts): 10x Radium carbine, 10x Close combat weapon\n\n'+onager+'\n\n'+onager+', Broad spectrum data-tether';
const service=createAdMechRosterRuntime(book,readJson('roster-import-aliases.json'));
const imported=service.import(text);assert.equal(imported.status,'READY');
assert(imported.resolutions.every(r=>r.state==='AUTO_RESOLVED'));
const initial=service.snapshot(),[vanguard,unequipped,equipped]=initial.units;
const selection=equipped.selections.find(s=>s.canonicalEquipmentIds.includes(equipmentId));
assert.equal(selection.physicalQuantity,1);
assert.deepEqual(selection.canonicalFieldPaths,{[equipmentId]:['/text']});
assert.deepEqual(selection.sourceReferences,[{entityId:sourceId,path:'/blocks/2/text'}]);
assert(!unequipped.selections.some(s=>s.canonicalEquipmentIds.includes(equipmentId)));
const incense='detachment-explorator-maniple:stratagem:5';
let controls=0;
function verify(instanceId,smoke) {
  const effective=service.effective(instanceId);
  assert.equal(effective.keywords.includes('SMOKE'),smoke);
  assert(effective.profiles.every(p=>p.keywords.includes('SMOKE')===smoke));
  assert(effective.profiles.every(p=>p.intrinsicKeywords.includes('SMOKE')));
  const applied=effective.applied.filter(row=>row.ruleId===sourceId&&row.clauseId===clauseId);
  assert.equal(applied.length,smoke?0:1);
  for(const row of applied) {
    assert.equal(row.sourceInstanceId,instanceId);assert.equal(row.targetInstanceId,instanceId);
    assert.equal(row.operation,'REMOVE_KEYWORD');assert.deepEqual(row.sourceFields,[['blocks',2,'text']]);
    assert.equal(row.targetProfileId,'datasheet-onager-dunecrawler:profile:default');
    assert(row.before.includes('SMOKE'));assert(!row.after.includes('SMOKE'));
  }
  controls++;return effective;
}
const related=expected=>{assert.equal(service.related(vanguard.instanceId).find(r=>r.ruleId===incense).applicability,expected);controls++;};
const firstA=verify(unequipped.instanceId,true),firstB=verify(equipped.instanceId,false);related('CONDITIONAL');
const isolated=structuredClone(initial);isolated.units=isolated.units.filter(u=>u.instanceId!==unequipped.instanceId);
service.load(isolated);verify(equipped.instanceId,false);related('NO_MATCH');
const absent=structuredClone(isolated),owner=absent.units.find(u=>u.instanceId===equipped.instanceId);
owner.selections=owner.selections.filter(s=>!s.canonicalEquipmentIds.includes(equipmentId));
// A valid canonical source reference on another actual selection is not proof
// that its equipment was selected. Existing runtime membership must stay strict.
owner.selections[0].sourceReferences=[{entityId:sourceId,path:'/blocks/2/text'}];
service.load(absent);verify(equipped.instanceId,true);related('CONDITIONAL');
service.load(isolated);verify(equipped.instanceId,false);related('NO_MATCH');
const noEvidence=structuredClone(isolated);
delete noEvidence.units.find(u=>u.instanceId===equipped.instanceId).selections.find(s=>s.canonicalEquipmentIds.includes(equipmentId)).sourceReferences;
service.load(noEvidence);verify(equipped.instanceId,false);related('NO_MATCH');
service.load(initial);assert.deepEqual(verify(unequipped.instanceId,true),firstA);
assert.deepEqual(verify(equipped.instanceId,false),firstB);
const reversed=structuredClone(initial);reversed.units.reverse();service.load(reversed);
assert.deepEqual(verify(unequipped.instanceId,true),firstA);assert.deepEqual(verify(equipped.instanceId,false),firstB);

// Permanent negative controls: the old evidence-address binding and a wrong
// selected-field binding both preserve evidence but must fail this integration.
for(const requirement of [
  {...effect.equipmentRequirement,equipmentId:sourceId,sourceFieldPath:['blocks',2,'text']},
  {...effect.equipmentRequirement,sourceFieldPath:['order']}
]) {
  const mutant=structuredClone(book);
  mutant.entities.find(e=>e.id===sourceId).ruleContract.clauses.find(c=>c.id===clauseId).rosterEffects[0].equipmentRequirement=requirement;
  const bad=createAdMechRosterRuntime(mutant,readJson('roster-import-aliases.json'));
  bad.load(initial);
  assert.throws(()=>assert.equal(bad.effective(equipped.instanceId).keywords.includes('SMOKE'),false));controls++;
}

// AM-08 is outside this fix: passenger execution restrictions do not change
// these source-backed TARGET applicability results.
for(const target of ['5x Pteraxii Skystalkers (65 pts)','3x Kataphron Breachers (150 pts)','1x Sydonian Skatros (50 pts)']) {
  const result=service.import(header+'\n'+target+'\n\n1x Skorpius Dunerider (85 pts)');
  assert.equal(result.status,'READY');
  assert.equal(service.related('parsed-unit-1').find(r=>r.ruleId==='detachment-explorator-maniple:stratagem:6').applicability,'CONDITIONAL');controls++;
}
assert.deepEqual(book,before,'Execution changed canonical inputs');
const rebuilt=buildRosterRuntimeBook(buildAdMechContracts());assert.deepEqual(rebuilt,book,'Build is nondeterministic');
console.log(JSON.stringify({status:'PASS',controls,mutations:2,AM09:'PASS',AM08Unchanged:true,
  selectionVsEvidence:'SEPARATE',sourceReferencesAsOwnership:false,physicalIsolation:true,removeRestore:true,
  canonicalFactsImmutable:true,deterministic:true,sharedRuntimeChanged:false,legacyReads:0}));

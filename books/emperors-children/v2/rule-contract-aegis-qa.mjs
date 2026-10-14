/** Source-backed Shining Aegis controls; no EC importer or battle state. */
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {buildECContracts} from './rule-contract-build.mjs';
import {aegisBinding as binding} from './rule-contract-aegis-bindings.mjs';
import {createFormationContext} from './rule-contract-formation-context.mjs';
import {validateRoster,changeAttachment} from '../../shared/roster-v2/context.mjs';
import {validateRosterEffects,executeRosterEffects} from '../../shared/roster-v2/effects.mjs';
import {consumeMfm,resolveOwnedFact} from './mfm-boundary.mjs';
const clone=structuredClone,sha=bytes=>createHash('sha256').update(bytes).digest('hex').toUpperCase();
const facts=JSON.parse(fs.readFileSync(new URL('./generated/effective.json',import.meta.url))),original=JSON.stringify(facts);
const {book,schema,contracts,artifact}=buildECContracts({facts}),canonical=new Map(facts.entities.map(e=>[e.id,e]));
const id='datasheet-keeper-of-secrets:section:1',field=['blocks',2,'text'],profileId='datasheet-keeper-of-secrets:profile:1';
const quote='Shining Aegis: The bearer has a Save characteristic of 3+.';
let checks=0,mutations=0;
const check=fn=>{fn();checks++;};
const contract=book.entities.find(e=>e.id===id).ruleContract;
function inventory(c) {
  assert.equal(c.ruleId,id);assert.equal(c.ownerId,'unit-keeper-of-secrets');
  assert.deepEqual(c.sourceFields,[field]);assert.equal(c.clauses[0].sourceText,quote);
  assert.equal(c.roles.find(r=>r.id==='owner').subject,'MODEL');
  assert.equal(c.roles.find(r=>r.id==='bearer').selector.arguments.id,profileId);
  assert.deepEqual(c.currentness.factualOwner,canonical.get(id).provenance);
  assert.equal(c.clauses.length,1);assert.equal(c.clauses[0].rosterEffects.length,1);
  const e=c.clauses[0].rosterEffects[0];
  assert.deepEqual([e.operation,e.targetSubject,e.targetBinding,e.field,e.mode,e.value],['MODIFY_STAT','MODEL','SOURCE_MODEL','SV','SET',3]);
  assert.deepEqual(e.equipmentRequirement,{binding:'SOURCE',kind:'EQUIPMENT_PRESENT',equipmentId:id,sourceFieldPath:field});
  assert.equal(e.conditions.length,2);assert.equal(e.conditions[0].predicate.arguments.key,'equipmentRequirementSatisfied');
  assert.equal(e.conditions[0].predicate.arguments.equals,true);assert.equal(e.conditions[1].predicate.arguments.id,profileId);
  assert.equal(e.conditions[1].binding,'TARGET');assert.equal(e.lifetime,'WHILE_EQUIPMENT_SELECTED');
}
check(()=>inventory(contract));
check(()=>{
  assert.equal(binding.id,id);assert.deepEqual(binding.field,field);assert.equal(binding.quote,quote);
  const source=canonical.get(id).provenance,root=new URL('../../../',import.meta.url);
  const raw=fs.readFileSync(new URL(source.document,root));assert.equal(sha(raw),source.sha256);
  // Reconcile the exact span against raw accepted HTML, not generated prose.
  const texts=JSON.parse(execFileSync(process.env.PYTHON||'python',['-B','-c',
    'import sys,json; from lxml import html; sys.stdout.reconfigure(encoding="utf-8");print(json.dumps(list(html.parse(sys.argv[1]).getroot().itertext()),ensure_ascii=False))',
    fileURLToPath(new URL(source.document,root))],{encoding:'utf8'}));
  assert.ok(texts.join(' ').replace(/\s/g,'').includes(quote.replace(/\s/g,'')));
  assert.equal(sha(fs.readFileSync(new URL('./sources/emperors-children-faction-pack-v1.3.pdf',import.meta.url))),
    '18A192A36C22468368D957AAC3EB230A40C8F7BBFAEFA46372D8918422B0B49A');
  const official=JSON.parse(fs.readFileSync(new URL('./official-bindings.json',import.meta.url)));
  assert.ok(!official.occurrences.some(o=>o.patches.some(p=>p.sourceId===id)));
  assert.equal(canonical.get(profileId).data.stats.SV,'5+');assert.equal(canonical.get(profileId).data.stats.INSV,'4+');
});
const selection=(equipmentId=id,pointer='/blocks/2/text',quantity=1)=>({selectionKey:'optional-equipment',physicalQuantity:quantity,
  canonicalProfileIds:[],canonicalEquipmentIds:[equipmentId],canonicalFieldPaths:{[equipmentId]:[pointer]}});
const unit=(instanceId,name,quantity=1,selected=[])=>({instanceId,canonicalUnitId:'unit-'+name,startingStrength:quantity,
  enhancementIds:[],selections:[],warlord:false,equipmentContextKnown:true,
  modelRows:[{rowId:'models',quantity,canonicalProfileId:'datasheet-'+name+':profile:1',loadouts:[],selections:selected}]});
function input(equipment=[selection()]) {
  return {schema:'roster-v2/roster',bookId:book.bookId,rosterId:'ec/aegis',
    detachments:[{instanceId:'main',canonicalDetachmentId:'detachment-carnival-of-excess'}],attachments:[],warlordInstanceId:null,
    units:[unit('bearer','keeper-of-secrets',1,equipment),unit('other','keeper-of-secrets'),unit('leader','lord-exultant'),unit('bodyguard','infractors',10)]};
}
function evaluate(state,candidate=book) {
  schema.validateContracts(candidate);validateRosterEffects(candidate,schema.validatePredicate,schema.evaluatePredicate);
  const validated=validateRoster(candidate,state,candidate.rosterAttachmentPolicies);
  return {state:validated,projection:executeRosterEffects(candidate,validated,createFormationContext(candidate,validated,schema))};
}
const keeper=result=>result.projection.units.find(u=>u.instanceId==='bearer').profiles[0];
function resultParity(result,save) {
  for(const u of result.projection.units)for(const model of u.profiles) {
    const expected=clone(canonical.get(model.canonicalProfileId).data.stats);
    if(u.instanceId==='bearer')expected.SV=save;
    assert.deepEqual(model.profile.stats,expected,'Ordinary Save must remain physically isolated from other characteristics and Invulnerable');
  }
  assert.equal(keeper(result).profile.stats.INSV,'4+');
}
check(()=>{
  const state=input(),before=clone(state),result=evaluate(state);resultParity(result,'3+');assert.deepEqual(state,before);
  const applied=result.projection.units[0].applied.filter(a=>a.ruleId===id);assert.equal(applied.length,1);
  assert.equal(applied[0].targetModelInstanceId,'bearer');assert.deepEqual(applied[0].targetFieldPath,['stats','SV']);
  assert.deepEqual([applied[0].before,applied[0].after,applied[0].characteristic],['5+','3+','SV']);
  assert.deepEqual(evaluate(result.state).projection,result.projection,'Repeated/reloaded state rebuilds identically');
  const off=clone(result.state);off.units[0].modelRows[0].selections=[];resultParity(evaluate(off),'5+');
  off.units[0].modelRows[0].selections=[selection()];resultParity(evaluate(off),'3+');
});
check(()=>{
  for(const selected of [[],[selection(id,'/blocks/0/text')],[selection(id,'/blocks/1/text')],
    [selection(binding.optionId,'/text')],[selection(id,'/blocks/2/text',0)]])resultParity(evaluate(input(selected)),'5+');
  for(const n of [1,4]) {
    const state=input([{selectionKey:'alternative',physicalQuantity:1,canonicalProfileIds:['datasheet-keeper-of-secrets:weapon:'+n],canonicalEquipmentIds:[]}]);
    const result=evaluate(state);resultParity(result,'5+');assert.equal(keeper(result).weapons.length,1);
  }
  const unknown=input([]);delete unknown.units[0].equipmentContextKnown;
  const result=evaluate(unknown);resultParity(result,'5+');assert.ok(result.projection.units[0].conditional.some(c=>c.ruleId===id));
  const wrong=input([]);wrong.units[2].modelRows[0].selections=[selection()];
  assert.throws(()=>evaluate(wrong),/Foreign equipment owner/);
});
check(()=>{
  let result=evaluate(input());
  for(const [action,target] of [['ATTACH','bodyguard'],['DETACH',undefined],['REATTACH','bodyguard']]) {
    result=evaluate(changeAttachment(book,result.state,book.rosterAttachmentPolicies,action,'leader',target));resultParity(result,'3+');
  }
  assert.throws(()=>changeAttachment(book,result.state,book.rosterAttachmentPolicies,'ATTACH','bearer','bodyguard'),/No canonical attachment relation/);
});
check(()=>{
  const mfm=consumeMfm(facts.entities),bridge=mfm.unitBindings.find(b=>b.entityId==='unit-keeper-of-secrets');
  assert.ok(bridge);const record=resolveOwnedFact(bridge.mfmRecordId);assert.equal(record.provenance.sourceVersion,'v1.6');
  assert.ok(!mfm.paidUpgradeBindings.some(b=>b.entityId===id||b.entityId===binding.optionId));
  assert.deepEqual(contracts.slice(0,25),buildECContracts({aegisInputs:[]}).contracts,'Previous twenty-four families / twenty-five owners unchanged');
  assert.equal(artifact.scope.shiningAegisRules,1);assert.equal(contracts.length,26);
  assert.deepEqual(book.entities.map(e=>[e.id,e.data,e.provenance,e.fieldProvenance]),buildECContracts({aegisInputs:[]}).book.entities.map(e=>[e.id,e.data,e.provenance,e.fieldProvenance]));
});
function mutate(change,compare) {
  compare(book);const bad=clone(book);change(bad.entities.find(e=>e.id===id).ruleContract);assert.throws(()=>compare(bad));mutations++;
}
const compare=candidate=>inventory(candidate.entities.find(e=>e.id===id).ruleContract);
mutate(c=>c.clauses[0].rosterEffects[0].value=4,candidate=>resultParity(evaluate(input(),candidate),'3+'));
mutate(c=>c.clauses[0].rosterEffects[0].field='INSV',compare);
mutate(c=>c.roles.find(r=>r.id==='bearer').selector.arguments.id='datasheet-lord-exultant:profile:1',compare);
mutate(c=>c.clauses[0].rosterEffects[0].conditions[0].predicate.arguments.equals=false,candidate=>resultParity(evaluate(input(),candidate),'3+'));
mutate(c=>c.clauses[0].rosterEffects[0].conditions.shift(),candidate=>resultParity(evaluate(input([]),candidate),'5+'));
mutate(c=>c.clauses[0].rosterEffects[0].conditions[1].predicate.arguments.id='datasheet-lord-exultant:profile:1',candidate=>resultParity(evaluate(input(),candidate),'3+'));
assert.equal(JSON.stringify(facts),original,'Factual owner must remain immutable');
console.log(JSON.stringify({status:'PASS',sourceOwner:id,checks,mutations,ordinarySave:'5+ -> 3+',invulnerable:'UNCHANGED 4+',previous24:'PASS',MFM:'UNCHANGED v1.6'}));

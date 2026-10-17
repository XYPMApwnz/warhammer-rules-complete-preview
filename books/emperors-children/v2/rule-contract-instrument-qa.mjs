/** Two literal source occurrences, one UNIT modifier, MODEL selection restrictions. */
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {buildECContracts} from './rule-contract-build.mjs';
import {createFormationContext} from './rule-contract-formation-context.mjs';
import {validateRoster,changeAttachment} from '../../shared/roster-v2/context.mjs';
import {executeRosterEffects,validateRosterEffects} from '../../shared/roster-v2/effects.mjs';
const clone=structuredClone,sha=b=>createHash('sha256').update(b).digest('hex').toUpperCase();
const facts=JSON.parse(fs.readFileSync(new URL('./generated/effective.json',import.meta.url))),original=JSON.stringify(facts);
const {book,schema,contracts,artifact}=buildECContracts({facts}),prior=buildECContracts({facts,instrumentInputs:[]});
const records=new Map(facts.entities.map(e=>[e.id,e])),names=['daemonettes','seekers'];
const quote='Instrument of Chaos: Add 1 to Charge rolls made for the bearer’s unit.';
let checks=0,mutations=0;const check=fn=>{fn();checks++;};
const ruleId=name=>'datasheet-'+name+':section:1',equipmentId=(name,icon=false)=>'datasheet-'+name+':wargear:'+(icon?2:1);
function inventory(candidate){
  for(const name of names) {
    const c=candidate.entities.find(e=>e.id===ruleId(name)).ruleContract;
    const added=c.clauses.find(c=>c.id==='instrument-of-chaos');assert.ok(added);assert.equal(added.sourceText,quote);
    assert.equal(c.ownerId,'unit-'+name);assert.deepEqual(added.sourceFields,[['blocks',2,'text']]);
    assert.equal(added.rosterEffects.length,1);const e=added.rosterEffects[0];
    assert.deepEqual([e.operation,e.targetSubject,e.targetBinding,e.unitScope,e.field,e.mode,e.value],
      ['MODIFY_RULE_METRIC','UNIT','SOURCE_UNIT','FORMED','chargeRoll','ADD',1]);
    assert.deepEqual(e.equipmentRequirement,{binding:'SOURCE',kind:'EQUIPMENT_PRESENT',equipmentId:equipmentId(name),sourceFieldPath:['text']});
    assert.equal(e.conditions.length,1);assert.equal(e.conditions[0].predicate.arguments.key,'equipmentRequirementSatisfied');
    assert.equal(e.conditions[0].predicate.arguments.equals,true);assert.equal(e.lifetime,'WHILE_EQUIPMENT_SELECTED');
    assert.deepEqual(added.currentness.factualOwner,records.get(ruleId(name)).provenance);
  }
  assert.equal(candidate.rosterEquipmentRestrictions.length,2);
  for(const r of candidate.rosterEquipmentRestrictions){assert.equal(r.scope,'MODEL');assert.equal(r.maximumEach,1);assert.equal(r.evidence.length,2);}
}
check(()=>inventory(book));
check(()=>{
  for(const [i,name]of names.entries()) {
    const e=records.get(ruleId(name)),rawPath=new URL(e.provenance.document,new URL('../../../',import.meta.url));
    const raw=fs.readFileSync(rawPath);assert.equal(sha(raw),e.provenance.sha256);
    const text=execFileSync(process.env.PYTHON||'python',['-B','-c',
      'import sys;from lxml import html;sys.stdout.reconfigure(encoding="utf-8");print(" ".join(html.parse(sys.argv[1]).getroot().itertext()))',fileURLToPath(rawPath)],{encoding:'utf8'});
    assert.ok(text.replace(/\s/g,'').includes(quote.replace(/\s/g,'')));
    for(const [icon,expected]of [[false,`1 ${i?'Seeker':'Daemonette'} that is not equipped with a daemonic icon can be equipped with 1 instrument of Chaos.`],
      [true,`1 ${i?'Seeker':'Daemonette'} that is not equipped with an instrument of Chaos can be equipped with 1 daemonic icon.`]]) {
      assert.equal(records.get(equipmentId(name,icon)).data.text,expected);assert.ok(text.replace(/\s/g,'').includes(expected.replace(/\s/g,'')));
    }
  }
  assert.equal(sha(fs.readFileSync(new URL('./sources/emperors-children-faction-pack-v1.3.pdf',import.meta.url))),
    '18A192A36C22468368D957AAC3EB230A40C8F7BBFAEFA46372D8918422B0B49A');
  const official=JSON.parse(fs.readFileSync(new URL('./official-bindings.json',import.meta.url)));
  assert.ok(!official.occurrences.some(o=>o.patches.some(p=>names.some(n=>p.sourceId===ruleId(n)))));
});
const selected=(name,icon=false,quantity=1,pointer='/text')=>({selectionKey:icon?'icon':'instrument',physicalQuantity:quantity,
  canonicalProfileIds:[],canonicalEquipmentIds:[equipmentId(name,icon)],canonicalFieldPaths:{[equipmentId(name,icon)]:[pointer]}});
const row=(name,key,quantity,selections=[])=>({rowId:key,quantity,canonicalProfileId:'datasheet-'+name+':profile:1',compositionScope:'MODEL_ROW',selections,loadouts:[]});
const unit=(instanceId,name,count,rows=[row(name,'models',count)])=>({instanceId,canonicalUnitId:'unit-'+name,startingStrength:count,enhancementIds:[],warlord:false,selections:[],equipmentContextKnown:true,modelRows:rows});
function input(name='daemonettes',choice='instrument') {
  const count=name==='daemonettes'?10:5,rows=[row(name,'instrument-bearer',1,choice==='instrument'||choice==='both'?[selected(name)]:[]),
    row(name,'icon-bearer',1,choice==='icon'||choice==='both'?[selected(name,true)]:[]),row(name,'others',count-2)];
  return {schema:'roster-v2/roster',bookId:book.bookId,rosterId:'ec/instrument',detachments:[{instanceId:'main',canonicalDetachmentId:'detachment-carnival-of-excess'}],
    units:[unit('a',name,count,rows),unit('b',name,count),unit('l','lord-exultant',1),unit('g','infractors',10)],attachments:[],warlordInstanceId:null};
}
function evaluate(state,candidate=book){schema.validateContracts(candidate);validateRosterEffects(candidate,schema.validatePredicate,schema.evaluatePredicate);
  const validated=validateRoster(candidate,state,candidate.rosterAttachmentPolicies);
  return {state:validated,projection:executeRosterEffects(candidate,validated,createFormationContext(candidate,validated,schema))};}
const bonus=(r,id='a')=>r.projection.units.find(u=>u.instanceId===id).metrics.chargeRoll?.modifier||0;
function parity(result,{charge=1,icon=false}={}) {
  assert.equal(bonus(result),charge);for(const id of ['b','l','g'])assert.equal(bonus(result,id),0);
  for(const u of result.projection.units)for(const m of u.profiles){
    const expected=clone(records.get(m.canonicalProfileId).data.stats);if(u.instanceId==='a'&&icon)expected.LD='6+';
    assert.deepEqual(m.profile.stats,expected,'Charge changes no characteristic; Icon alone sets LD6');
    assert.equal(m.metrics.chargeRoll,undefined);
  }
  assert.equal(result.projection.chargeRollResult,undefined);
}
for(const name of names)check(()=>{
  for(const choice of ['none','instrument','icon','both']){const state=input(name,choice),before=clone(state),result=evaluate(state);
    parity(result,{charge:['instrument','both'].includes(choice)?1:0,icon:['icon','both'].includes(choice)});assert.deepEqual(state,before);
    assert.deepEqual(evaluate(JSON.parse(JSON.stringify(result.state))).projection,result.projection);
  }
  const state=input(name,'both'),result=evaluate(state);const off=clone(result.state);off.units[0].modelRows[0].selections=[];
  parity(evaluate(off),{charge:0,icon:true});off.units[0].modelRows[0].selections=[selected(name)];assert.deepEqual(evaluate(off).projection,result.projection);
  const grouped=input(name,'none'),count=grouped.units[0].startingStrength;
  grouped.units[0].modelRows=[row(name,'models',count)];grouped.units[0].modelRows[0].loadouts=[
    {loadoutId:'instrument-model',quantity:1,selections:[selected(name)]},{loadoutId:'icon-model',quantity:1,selections:[selected(name,true)]}];
  parity(evaluate(grouped),{icon:true});
});
for(const name of names)check(()=>{
  const both=input(name,'both');both.units[0].modelRows[0].selections.push(both.units[0].modelRows[1].selections.pop());
  assert.throws(()=>evaluate(both),/cannot share a physical MODEL/);
  const ambiguous=input(name,'both');ambiguous.units[0].selections=ambiguous.units[0].modelRows.flatMap(r=>r.selections);
  ambiguous.units[0].modelRows.forEach(r=>r.selections=[]);parity(evaluate(ambiguous),{icon:true});
  assert.ok(ambiguous.units[0].modelRows.every(r=>r.selections.length===0),'Known UNIT effects never invent a MODEL bearer');
  const tooMany=input(name);tooMany.units[0].modelRows[0].selections[0].physicalQuantity=2;assert.throws(()=>evaluate(tooMany),/Only one Instrument/);
  const duplicate=input(name);duplicate.units[0].modelRows[2].selections=[selected(name)];assert.throws(()=>evaluate(duplicate),/Only one Instrument/);
  const inactive=input(name);inactive.units[0].modelRows[0].selections=[];
  inactive.units[0].modelRows[0].loadouts=[{loadoutId:'inactive',quantity:0,selections:[selected(name)]}];
  assert.throws(()=>evaluate(inactive),/no physical MODEL bearer/);
  const overlapping=input(name,'both');overlapping.units[0].modelRows[0].loadouts=[
    {loadoutId:'same-bearer',quantity:1,selections:[overlapping.units[0].modelRows[1].selections.pop()]}];
  assert.throws(()=>evaluate(overlapping),/cannot share a physical MODEL/);
  const wrong=input(name,'none');wrong.units[2].modelRows[0].selections=[selected(name)];assert.throws(()=>evaluate(wrong),/Foreign equipment owner/);
  const zero=input(name);zero.units[0].modelRows[0].selections[0].physicalQuantity=0;parity(evaluate(zero),{charge:0});
  const wrongField=input(name);wrongField.units[0].modelRows[0].selections[0].canonicalFieldPaths[equipmentId(name)]=['/order'];
  parity(evaluate(wrongField),{charge:0});
});
check(()=>{
  let result=evaluate(input());for(const [action,target]of [['ATTACH','g'],['DETACH',undefined],['REATTACH','g']]){
    result=evaluate(changeAttachment(book,result.state,book.rosterAttachmentPolicies,action,'l',target));parity(result);
  }
  for(const name of names){const state=input(name);assert.throws(()=>changeAttachment(book,state,book.rosterAttachmentPolicies,'ATTACH','l','a'),/No canonical attachment relation/);}
});
check(()=>{
  const restored=clone(contracts);
  for(const c of restored)if(names.some(n=>c.ruleId===ruleId(n))){
    c.clauses=c.clauses.filter(c=>c.id!=='instrument-of-chaos');c.roles=c.roles.filter(r=>r.id!=='instrument-recipient');
    c.sourceFields=c.sourceFields.filter(f=>JSON.stringify(f)!==JSON.stringify(['blocks',2,'text']));
  }
  assert.deepEqual(restored,prior.contracts,'Every previous clause, role and source binding remains unchanged');
  assert.equal(contracts.length,26,'No duplicate section owner or invented fact');assert.equal(artifact.scope.instrumentSourceOwners,2);
  assert.deepEqual(book.entities.map(e=>[e.id,e.data,e.provenance,e.fieldProvenance]),prior.book.entities.map(e=>[e.id,e.data,e.provenance,e.fieldProvenance]));
});
function mutate(change,compare){compare(book);const bad=clone(book);change(bad);assert.throws(()=>compare(bad));mutations++;}
const effect=b=>b.entities.find(e=>e.id===ruleId('daemonettes')).ruleContract.clauses.find(c=>c.id==='instrument-of-chaos').rosterEffects[0];
mutate(b=>effect(b).value=2,b=>parity(evaluate(input(),b)));
mutate(b=>effect(b).targetBinding='ROSTER_UNITS',b=>parity(evaluate(input(),b)));
mutate(b=>effect(b).conditions=[],b=>parity(evaluate(input('daemonettes','none'),b),{charge:0}));
mutate(b=>effect(b).equipmentRequirement.equipmentId=equipmentId('daemonettes',true),b=>parity(evaluate(input('daemonettes','icon'),b),{charge:0,icon:true}));
mutate(b=>b.entities.find(e=>e.id===ruleId('daemonettes')).ruleContract.ownerId='unit-seekers',inventory);
mutate(b=>b.rosterEquipmentRestrictions=[],b=>{const state=input('daemonettes','both');state.units[0].modelRows[0].selections.push(state.units[0].modelRows[1].selections.pop());assert.throws(()=>evaluate(state,b),/cannot share a physical MODEL/);});
assert.equal(JSON.stringify(facts),original);console.log(JSON.stringify({status:'PASS',checks,mutations,sourceOwners:2,ruleFamilies:1,previous25:'PASS',iconCompatibility:'MODEL_EXCLUSIVITY',battleSimulation:false}));

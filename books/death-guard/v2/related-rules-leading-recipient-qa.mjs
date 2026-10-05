import assert from 'node:assert/strict';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {buildRuleContractV2,compileCompatibility} from './rule-contract-build.mjs';
import {buildRelatedRules,armyBookContext} from './related-rules-build.mjs';
import * as evaluator from './rule-contract-schema.mjs';
import {createRosterRuntime} from '../../shared/roster-v2/runtime.mjs';
import {parse} from '../../shared/roster-v2/parser.mjs';
import {requiredRecipientRoles,evaluateRequiredRecipients,staticCapabilities,validateCompatibilityFeasibility,buildAttachmentFeasibility} from '../../shared/roster-v2/compatibility-feasibility.mjs';

const read=path=>JSON.parse(fs.readFileSync(new URL(path,import.meta.url),'utf8'));
const source=read('../sources/waha-11e-current-2026-09-25/corpus.json'),mfm=read('../sources/official-mfm-v1.5.json');
const book=buildRuleContractV2(),byId=new Map(book.entities.map(e=>[e.id,e]));
const sheets=source.datasheets,units=book.entities.filter(e=>e.kind==='DATASHEET');
const normalize=text=>text.toUpperCase().replace(/[^A-Z0-9]+/g,' ').trim();
const labels=new Map(sheets.map(s=>[normalize(s.title),s.sourceId.replace(/^datasheet-/,'unit-')]));
const outgoing=new Map(units.map(u=>[u.id,new Set()])),incoming=new Set();
// Expected relationships come from accepted source data, never generated bounds.
for(const record of mfm.units.filter(r=>r.status==='CURRENT'&&r.sourceGroup==='UNITS'&&r.relations?.leader)) {
  const owner=labels.get(normalize(record.title));assert(outgoing.has(owner));
  for(const label of record.relations.leader) {
    const target=labels.get(normalize(label));assert(byId.has(target));
    outgoing.get(owner).add(target);incoming.add(target);
  }
}
const strata=source.detachments.flatMap(d=>d.stratagems);
const expectedRecipients=strata.filter(rule=>
  /\band one friendly\b/i.test(rule.lines.find(l=>l.label==='TARGET')?.text||'')||
  /select one other friendly[\s\S]*that your unit can lead/i.test(rule.lines.find(l=>l.label==='EFFECT')?.text||''));
assert.equal(strata.length,45);assert.equal(expectedRecipients.length,2);
const found=[];
for(const rule of strata) {
  const entity=byId.get(rule.sourceId);assert.deepEqual(entity.data.lines,rule.lines);
  if(requiredRecipientRoles(entity.ruleContract).length)found.push(entity.id);
}
assert.deepEqual(found.sort(),expectedRecipients.map(r=>r.sourceId).sort(),'No optional, enemy, anchor, output or passive role promoted to a mandatory recipient');
const wallSource=expectedRecipients.find(r=>/\band one friendly\b/i.test(r.lines.find(l=>l.label==='TARGET').text));
const mobileSource=expectedRecipients.find(r=>r!==wallSource);
const wall=byId.get(wallSource.sourceId),mobile=byId.get(mobileSource.sourceId);
const make=()=>createRosterRuntime(book,{parse,...evaluator});
const imported=(detachment,units)=>{const r=make();assert.equal(r.import(`+ DETACHMENT: ${detachment}\n${units}`).status,'READY');return r;};
const answer=(r,id,instance='parsed-unit-1')=>r.related(instance).find(row=>row.ruleId===id).applicability;
const pm='5x Plague Marines (90 pts)',pox='10x Poxwalkers (50 pts)',lord='Char1: 1x Lord of Contagion (110 pts): Manreaper',guard='3x Deathshroud Terminators (150 pts)';
const absent=imported('Shamblerot Vectorium',pm);assert.equal(answer(absent,wall.id),'NO_MATCH');
const present=imported('Shamblerot Vectorium',pm+'\n'+pox);assert.equal(answer(present,wall.id),'CONDITIONAL');
const self=imported('Shamblerot Vectorium',pox);assert.equal(answer(self,wall.id),'CONDITIONAL','Source does not demand a different Poxwalkers instance');
const duplicate=imported('Shamblerot Vectorium',pox+'\n'+pox);
assert.equal(answer(duplicate,wall.id),'CONDITIONAL');assert.equal(answer(duplicate,wall.id,'parsed-unit-2'),'CONDITIONAL');
const reloaded=make();reloaded.load(JSON.parse(JSON.stringify(present.snapshot())));
assert.deepEqual(reloaded.related('parsed-unit-1'),present.related('parsed-unit-1'));
const mobileAbsent=imported('Champions of Contagion',lord);assert.equal(answer(mobileAbsent,mobile.id),'NO_MATCH');
const mobilePresent=imported('Champions of Contagion',lord+'\n'+guard+'\n'+guard);
assert.equal(answer(mobilePresent,mobile.id),'CONDITIONAL');
mobilePresent.attach('parsed-unit-1','parsed-unit-2');assert.equal(answer(mobilePresent,mobile.id),'NO_MATCH');
assert.equal(mobilePresent.context('parsed-unit-1').roster.leading,true);
assert.equal(mobilePresent.context('parsed-unit-2').roster.leading,false,'AH-04 remains component-relative');
mobilePresent.detach('parsed-unit-1');assert.equal(answer(mobilePresent,mobile.id),'CONDITIONAL');
const occupied=imported('Champions of Contagion',lord+'\nChar2: 1x Lord of Virulence (100 pts)\n'+guard);
occupied.attach('parsed-unit-2','parsed-unit-3');assert.equal(answer(occupied,mobile.id),'NO_MATCH','Occupied recipient remains source-ineligible');

const index=buildRelatedRules(book),row=(unitId,ruleId)=>index.rows.find(r=>r.unitId===unitId&&r.ruleId===ruleId);
const leading={predicate:'LEADING',subject:'MODEL',contextLevel:'ROSTER',arguments:{value:true}};
let leadingCases=0,bodyguardCases=0;
for(const unit of units) {
  assert.equal(staticCapabilities(book,unit.id).canBeBodyguard,incoming.has(unit.id));
  const context=armyBookContext(book,unit,'MODEL');
  const possible=outgoing.get(unit.id).size>0;
  assert.equal(evaluator.evaluatePredicate(leading,context),possible?'UNKNOWN':'FALSE');
  assert.equal(evaluator.evaluatePredicate({...leading,arguments:{value:false}},context),possible?'UNKNOWN':'TRUE');leadingCases+=2;
  for(const target of units) {
    const node={predicate:'BODYGUARD_ID',subject:'MODEL',contextLevel:'ROSTER',arguments:{id:target.id}};
    const feasible=outgoing.get(unit.id).has(target.id)||(incoming.has(unit.id)&&unit.id===target.id);
    assert.equal(evaluator.evaluatePredicate(node,context),feasible?'UNKNOWN':'FALSE');bodyguardCases++;
  }
}
const walking=source.detachments.flatMap(d=>d.enhancements).find(e=>/If the bearer is leading a POXWALKER unit/.test(e.text));
const talisman=source.detachments.flatMap(d=>d.enhancements).find(e=>/^DEATH GUARD model only\. While the bearer is leading a unit, add 1 to the Toughness/.test(e.text));
assert(walking&&talisman);
let publicCases=0;
for(const sheet of sheets.filter(s=>s.factionKeywords.includes('DEATH GUARD')&&s.keywords.includes('CHARACTER'))) {
  const id=labels.get(normalize(sheet.title));
  assert.equal(row(id,walking.sourceId).selectedDetachment.applicability,outgoing.get(id).has('unit-poxwalkers')?'CONDITIONAL':'NO_MATCH');
  assert.equal(row(id,talisman.sourceId).selectedDetachment.applicability,outgoing.get(id).size?'CONDITIONAL':'NO_MATCH');publicCases+=2;
}
const lordPox=imported('Shamblerot Vectorium',lord+'\nEnhancement: Lord of the Walking Pox (+15 pts)\n'+guard);
assert.equal(answer(lordPox,walking.sourceId),'NO_MATCH');lordPox.attach('parsed-unit-1','parsed-unit-2');assert.equal(answer(lordPox,walking.sourceId),'NO_MATCH');
const capable=imported('Shamblerot Vectorium','Char1: 1x Noxious Blightbringer (50 pts)\nEnhancement: Lord of the Walking Pox (+15 pts)\n'+pox);
assert.equal(answer(capable,walking.sourceId),'NO_MATCH','Known unattached is not hypothetical leading');
capable.attach('parsed-unit-1','parsed-unit-2');assert.equal(answer(capable,walking.sourceId),'CONDITIONAL');
capable.detach('parsed-unit-1');assert.equal(answer(capable,walking.sourceId),'NO_MATCH');
capable.reattach('parsed-unit-1','parsed-unit-2');assert.equal(answer(capable,walking.sourceId),'CONDITIONAL');

// An either-role entity must retain both possibilities without becoming a Leader
// merely because it can be a Bodyguard.
const fixture={entities:['a','b','c'].map(id=>({id,kind:'DATASHEET',data:{profileIds:[id+'-profile']}})),rosterAttachmentPolicies:[{sourceId:'a',targetId:'b',additionalLeaders:0},{sourceId:'b',targetId:'c',additionalLeaders:0}]};
fixture.compatibilityFeasibility=buildAttachmentFeasibility(fixture,fixture.entities.map(e=>({unitId:e.id,profileId:e.id+'-profile',maxModels:1,intrinsicKeywords:[]})));
validateCompatibilityFeasibility(fixture);
const both=staticCapabilities(fixture,'b');assert.equal(both.canBeBodyguard,true);assert.deepEqual(both.leaderTargetIds,['c']);
const bContext={subject:'UNIT',unitId:'b',capabilities:both,roster:{}};
for(const id of ['b','c'])assert.equal(evaluator.evaluatePredicate({predicate:'BODYGUARD_ID',subject:'UNIT',contextLevel:'ROSTER',arguments:{id}},bContext),'UNKNOWN');
assert.equal(evaluator.evaluatePredicate({...leading,subject:'UNIT'},bContext),'UNKNOWN');
assert.equal(evaluator.evaluatePredicate({...leading,subject:'UNIT'},{...bContext,roster:{leading:false,bodyguardId:'b'}}),'FALSE');

const candidates=units.map(u=>({canonicalUnitId:u.id}));
const options={book,evaluateRole:evaluator.evaluateRole,contextFor:(candidate,subject)=>armyBookContext(book,byId.get(candidate.canonicalUnitId),subject,wall.parentId)};
assert.equal(evaluateRequiredRecipients(wall.ruleContract,'unit-plague-marines',[],options),'FALSE');
assert.equal(evaluateRequiredRecipients(wall.ruleContract,'unit-plague-marines',[{canonicalUnitId:'unit-foetid-bloat-drone'}],options),'FALSE');
assert.equal(evaluateRequiredRecipients(wall.ruleContract,'unit-plague-marines',candidates,options),'UNKNOWN');
// Canonical absence is a static NO_MATCH, not a generic battle UNKNOWN.
assert.equal(evaluateRequiredRecipients(mobile.ruleContract,'unit-mortarion',candidates,options),'FALSE');
let exclusionControls=0;
for(const entity of book.entities.filter(e=>e.ruleContract?.kind==='STRATAGEM'&&!found.includes(e.id))) {
  assert.equal(evaluateRequiredRecipients(entity.ruleContract,'unit-plague-marines',[],options),'TRUE');exclusionControls++;
}
const optional=structuredClone(wall.ruleContract);
for(const role of [...optional.roles,...optional.clauses.flatMap(c=>c.roles)])role.required=false;
assert.equal(evaluateRequiredRecipients(optional,'unit-plague-marines',[],options),'TRUE');
const compound=structuredClone(mobile.ruleContract);
for(const role of [...compound.roles,...compound.clauses.flatMap(c=>c.roles)])role.conditions=role.conditions.map(node=>node.arguments?.key==='otherFriendlyUnit'?{op:'NOT',args:[{op:'NOT',args:[node]}]}:node);
assert.equal(evaluateRequiredRecipients(compound,'unit-lord-of-contagion',[],options),'FALSE');

// Guards reject lost/mis-scoped feasibility rather than trusting generated rows.
const mutation=structuredClone(book);staticCapabilities(mutation,'unit-lord-of-contagion').canBeBodyguard=true;
assert.throws(()=>buildRelatedRules(mutation),/static capability policy parity/);
const missing=structuredClone(book);delete staticCapabilities(missing,'unit-plague-marines').canBeBodyguard;
assert.throws(()=>buildRelatedRules(missing),/Unresolved static capability/);
const dropped=structuredClone(wall.ruleContract);
for(const clause of dropped.clauses)if(clause.effectRecipientRoleIds)clause.effectRecipientRoleIds=clause.effectRecipientRoleIds.filter(id=>id!=='shield-unit');
assert.equal(evaluateRequiredRecipients(dropped,'unit-plague-marines',[],options),'FALSE','Top-level mandatory role survives dropped clause projection');
const baseline=JSON.parse(execFileSync('git',['show','c9d62beaab1a71fc371b1a7f37f697333d2a69ce:books/death-guard/v2/generated/rule-contract-effective.json'],{encoding:'utf8',maxBuffer:30e6}));
assert.deepEqual(book.entities,baseline.entities,'No factual/Rule Contract semantic change');assert.deepEqual(book.mfm,baseline.mfm);
const oldAtBase=JSON.parse(execFileSync('git',['show','c9d62beaab1a71fc371b1a7f37f697333d2a69ce:books/death-guard/v2/generated/related-rules-v2.json'],{encoding:'utf8',maxBuffer:10e6}));
const ownerRules=source.detachments.flatMap(d=>d.enhancements).filter(r=>/^PLAGUE MARINES unit only\./.test(r.text));
const allowed=new Set([walking.sourceId,talisman.sourceId,mobile.id,...ownerRules.map(r=>r.sourceId)]);let changed=0,changedOutcomes=0;
for(const previous of oldAtBase.rows) {
  const current=row(previous.unitId,previous.ruleId);
  if(JSON.stringify(current)!==JSON.stringify(previous)){assert(allowed.has(previous.ruleId),'Unrelated compatibility delta '+previous.ruleId);changed++;}
  if(!ownerRules.some(r=>r.sourceId===current.ruleId)&&(current.applicability!==previous.applicability||current.selectedDetachment.applicability!==previous.selectedDetachment.applicability))changedOutcomes++;
}
assert.equal(changedOutcomes,14);assert.deepEqual(buildRelatedRules(book),index);
assert.equal(index.summary.allDetachments.INVALID+index.summary.selectedDetachment.INVALID,0);
assert(compileCompatibility(book).rows.every(r=>r.state!=='INVALID'));
console.log(JSON.stringify({status:'PASS',stratagemsScanned:strata.length,mandatoryFriendlyRules:found,exclusionControls,leadingCases,bodyguardCases,publicCases,changedBookRelations:changed,changedOutcomes,
  shamblingAbsent:'NO_MATCH',shamblingPresent:'CONDITIONAL',selfRecipient:'CONDITIONAL',lordCannotLeadPox:'NO_MATCH',actualUnattached:'NO_MATCH',actualAttached:'CONDITIONAL',canonicalDelta:0,mfmDelta:0,ah04:'UNCHANGED'}));

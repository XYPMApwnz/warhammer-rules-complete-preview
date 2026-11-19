/** Source-bound UNIT upgrade text; no battle reroll execution is introduced. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {parseSourceFixtureJSON} from '../../../tests/helpers/source-refs-fixtures.mjs';
import {validateRuleRecipients,presentationRecipientLinks} from '../../shared/rule-contract-v2/recipients.mjs';
import {sourceSnapshot} from '../../shared/source-refs-v2/source-refs.mjs';
import {createDGRosterRuntime} from './roster-boot.mjs';

const BASE='635c503b4bb45d13e3c2cc92c439b86a75e1c954';
const root=fileURLToPath(new URL('../../../',import.meta.url));
const ruleId='detachment-flyblown-host:enhancement:1',clauseId='wound-reroll';
const fixture=JSON.parse(fs.readFileSync(new URL('./recipient-enrollment-qa.json',import.meta.url),'utf8'));
const cases=fixture.browserCases.filter(row=>row.canonical.ruleId===ruleId&&row.clauseIds.includes(clauseId));
assert.equal(cases.length,1,'One existing physical source/recipient fixture');
const c=cases[0];
assert.equal(c.id,'death-guard:detachment-flyblown-host:enhancement:1:28');
assert.equal(c.expectedAttached,true,'The exact former missing-text case is now admitted');
assert.equal(c.ownerInstance,'parsed-unit-2');assert.equal(c.target,'parsed-unit-1');
assert.deepEqual(c.canonical.sourcePath,['text']);
const relative='books/death-guard/v2/generated/rule-contract-effective.json';
const before=parseSourceFixtureJSON(execFileSync('git',['show',BASE+':'+relative],
  {cwd:root,encoding:'utf8',maxBuffer:64*1024*1024}));
const book=parseSourceFixtureJSON(fs.readFileSync(new URL('./generated/rule-contract-effective.json',import.meta.url),'utf8'));
const source=book.entities.find(entity=>entity.id===ruleId),historical=before.entities.find(entity=>entity.id===ruleId);
assert.deepEqual(source.data,historical.data,'Complete canonical wording/values unchanged');
assert.equal(source.data.text,c.canonical.text,'Independent exact complete source text');
assert.deepEqual(sourceSnapshot(source,{book}),sourceSnapshot(historical,{book:before}),'Original source ownership/provenance retained');
const contract=source.ruleContract,clause=contract.clauses.find(row=>row.id===clauseId);
const historicalClause=historical.ruleContract.clauses.find(row=>row.id===clauseId);
const owner=contract.roles.find(row=>row.id===contract.assignment.ownerRoleId);
assert.equal(owner.subject,'UNIT');assert.equal(owner.purpose,'OWNER');assert.equal(owner.binding,'SOURCE_UNIT');
assert.deepEqual(owner.selector,historical.ruleContract.roles.find(row=>row.id===owner.id).selector,
  'Exact PLAGUE MARINES source eligibility, without borrowed Character keywords');
assert.deepEqual(contract.assignment,historical.ruleContract.assignment,'Physical enhancement assignment unchanged');
assert.deepEqual(clause.conditions,historicalClause.conditions,'Original battle target/range gate unchanged');
assert.equal(clause.rosterClassification,'BATTLE_ONLY');assert.deepEqual(clause.rosterEffects,[]);
assert.equal(clause.conditionalPolicy,undefined,'No replacement execution/policy');
assert.equal(clause.recipientStatus,'RECORDED');assert.equal(clause.recipients.length,1);
const recipient=clause.recipients[0];
assert.equal(recipient.id,'wound-reroll::recipient/role/1');
assert.equal(recipient.roleId,'affected-unit');assert.equal(recipient.who,'UNIT');
assert.equal(recipient.side,'FRIENDLY');assert.equal(recipient.from,'SOURCE_UNIT');
assert.equal(recipient.scope,'FORMED');assert.equal(recipient.purpose,'EFFECT_RECIPIENT');
assert.deepEqual(recipient.selector,historicalClause.roles.find(row=>row.id==='affected-unit').selector);
validateRuleRecipients(book,source);
assert.equal(presentationRecipientLinks(source,clause).filter(link=>link.path==='ROLE').length,1,
  'One exact O-1 recipient channel');

const runtimes=[before,book].map(createDGRosterRuntime);
const selected=runtime=>runtime.effective(c.target).attachedRuleTexts.filter(row=>row.ruleId===ruleId);
const gameplay=runtime=>JSON.stringify(runtime.projection);
const withoutAttachedText=runtime=>runtime.state.units.map(unit=>{
  const {attachedRuleTexts,...rest}=runtime.effective(unit.instanceId);return rest;
});
const parity=stage=>{
  assert.equal(gameplay(runtimes[1]),gameplay(runtimes[0]),stage+': complete native execution is unchanged');
  assert.deepEqual(runtimes[1].snapshot(),runtimes[0].snapshot(),stage+': saved physical roster is unchanged');
  assert.deepEqual(withoutAttachedText(runtimes[1]),withoutAttachedText(runtimes[0]),
    stage+': every effective field except admitted text is unchanged');
};
for(const runtime of runtimes){
  assert.equal(runtime.import(c.text,{}, {replaceExisting:true}).status,'READY');
  for(const edge of [...runtime.state.attachments])runtime.detach(edge.leaderInstanceId);
  assert.equal(runtime.state.units.length,3,'Leader, exact upgrade owner, independent duplicate');
  assert.equal(selected(runtime).length,0,'A standalone Character does not inherit the UNIT upgrade');
  runtime.attach('parsed-unit-1','parsed-unit-2');
}
parity('attached');
assert.equal(selected(runtimes[0]).length,0,'Accepted historical source reproduces the missing text');
const [row]=selected(runtimes[1]);assert.equal(selected(runtimes[1]).length,1,'One complete rule block');
assert.equal(row.title,'Insectile Murmuration');assert.equal(row.text,c.canonical.text);
assert.equal(row.ruleId,ruleId);assert.equal(row.sourceInstanceId,c.ownerInstance);
assert.equal(row.sourceUnitId,'unit-plague-marines');assert.equal(row.recipientInstanceId,c.target);
assert.deepEqual(row.sourcePath,['text']);assert.equal(row.sourceLabel,'Plague Marines');
assert.equal(row.proofs.length,1);assert.equal(row.proofs[0].clauseId,clauseId);
assert.equal(row.proofs[0].recipientId,recipient.id);assert.equal(row.proofs[0].path,'ROLE');
assert.equal(row.proofs[0].relation,'EFFECT_RECIPIENT');assert.deepEqual(row.proofs[0].modelScopeIds,[]);
assert.deepEqual(sourceSnapshot(row,{slot:'sourceProvenance'}),sourceSnapshot(source,{book}));
assert.equal(runtimes[1].effective('parsed-unit-3').attachedRuleTexts.filter(row=>row.ruleId===ruleId).length,0,
  'An unrelated duplicate does not receive text');
const attached=runtimes[1].snapshot();
for(const runtime of runtimes)runtime.detach('parsed-unit-1');
parity('detached');assert.equal(selected(runtimes[1]).length,0,'Detach removes the former recipient text');
for(const runtime of runtimes)runtime.reattach('parsed-unit-1','parsed-unit-2');
parity('reattached');assert.deepEqual(selected(runtimes[1]),[row],'Reattach restores the exact original source block');
runtimes[1].load(attached);assert.deepEqual(selected(runtimes[1]),[row],'Snapshot reload preserves physical ownership');

const mutationResults=[];
for(const mode of ['missing-owner-proof','physical-recipient']){
  const candidate=structuredClone(book),rule=candidate.entities.find(entity=>entity.id===ruleId);
  const alteredOwner=rule.ruleContract.roles.find(role=>role.id===owner.id);
  // Either explicit owner channel is independently sufficient. Removing both
  // reproduces the accepted historical owner-gate defect exactly.
  if(mode==='missing-owner-proof'){delete alteredOwner.binding;delete alteredOwner.purpose;}
  if(mode==='physical-recipient'){
    const altered=rule.ruleContract.clauses.find(row=>row.id===clauseId);
    altered.roles.find(role=>role.id==='affected-unit').scope='PHYSICAL';
    altered.recipients[0].scope='PHYSICAL';
  }
  const runtime=createDGRosterRuntime(candidate);runtime.load(attached);
  assert.equal(selected(runtime).length,0,mode+': the exact positive text assertion must fail');
  assert.equal(gameplay(runtime),gameplay(runtimes[1]),mode+': no effect is introduced by text metadata');
  mutationResults.push({mode,status:'DETECTED'});
}
const omitted=createDGRosterRuntime(book);
assert.equal(omitted.import(c.text.replace('\nEnhancement: Insectile Murmuration',''),{}, {replaceExisting:true}).status,'READY');
omitted.attach('parsed-unit-1','parsed-unit-2');assert.equal(selected(omitted).length,0,'Unselected UNIT upgrade never transfers');
console.log(JSON.stringify({status:'PASS',ruleId,source:c.ownerInstance,recipient:c.target,
  canonicalText:'EXACT',scope:'UNIT/FROM_SOURCE_UNIT/FORMED',blocks:1,
  baselineMissingText:'REPRODUCED',gameplayParity:'PASS',mutations:mutationResults,
  independentDuplicate:'PASS',detachReattach:'PASS',snapshotReload:'PASS',unselected:'PASS'}));

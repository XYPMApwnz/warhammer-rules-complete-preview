/** Seven independently reviewed source obligations, exercised through the real
 * book adapters and shared executor/presentation. No expected set is derived
 * from production contracts. This is focused QA, not 397-requirement parity. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {chargeFixtures} from './charge-qa-fixtures.mjs';
import {assertSourceEffectExpectation,assessEffectCoverage} from '../books/shared/roster-v2/source-effect-expectations-qa.mjs';
import {createDGRosterRuntime} from '../books/death-guard/v2/roster-boot.mjs';
import {createAdMechRosterRuntime} from '../books/adeptus-mechanicus/v2/roster-runtime.mjs';
import {createCSMBrowserRoster} from '../books/chaos-space-marines/v2/roster-boot.mjs';
import {createECBrowserRoster} from '../books/emperors-children/v2/roster-boot.mjs';
import {prepareRosterPresentationCards,projectFormedUnitCards} from '../books/shared/army-book-app-v2/personal.mjs';
import {resolveRecipient,recipientDeclarationView,compileBookRecipients} from '../books/shared/rule-contract-v2/recipients.mjs';
import {producerDetachmentTextDeclaration} from '../books/shared/roster-v2/conditional-policy.mjs';

const root=new URL('../',import.meta.url),read=path=>JSON.parse(fs.readFileSync(new URL(path,root),'utf8'));
const expectations=read('books/shared/roster-v2/charge-source-expectations.json');
const ledger=read('books/shared/roster-v2/source-effect-coverage-baseline.json');
const clone=structuredClone,results=[],mutations=[];
const compile=book=>compileBookRecipients(book,{f1Declaration:producerDetachmentTextDeclaration});
assert.equal(expectations.sourceAuditCsvSha256,ledger.auditCsvSha256);
assert.equal(expectations.cases.length,7);
const adapters=new Map();
for(const bookId of new Set(expectations.cases.map(e=>e.bookId))){
  const base=`books/${bookId}/v2/`,file=bookId==='death-guard'?'rule-contract-effective.json':bookId==='emperors-children'?'roster-attachments.json':'roster-runtime.json';
  const book=read(base+'generated/'+file),payload=read(base+'generated/app-presentation.json');
  const cards=prepareRosterPresentationCards(new Map(payload.cards.map(card=>[card.id,card])),payload.rosterPresentation);
  const extra=bookId==='adeptus-mechanicus'?[read(base+'roster-import-aliases.json')]:bookId==='chaos-space-marines'?[read(base+'generated/roster-import.json'),read(base+'roster-attachment-bindings.json')]:[];
  const create={'death-guard':createDGRosterRuntime,'adeptus-mechanicus':createAdMechRosterRuntime,'chaos-space-marines':createCSMBrowserRoster,'emperors-children':createECBrowserRoster}[bookId];
  adapters.set(bookId,{book,cards,make:(candidate=book)=>create(candidate,...extra)});
}
const characteristics=service=>service.projection.units.map(unit=>({id:unit.instanceId,
  profiles:unit.profiles.map(model=>({id:model.canonicalProfileId,profile:model.profile,weapons:model.weapons})),weapons:unit.weapons}));
function observe(service,cards,expectation){
  return service.projection.units.map(unit=>{
    const view=projectFormedUnitCards(cards,service,unit.instanceId);
    const metrics=view.components.flatMap(c=>c.card.rosterUnitMetrics||[]).filter(m=>m.key==='chargeRoll');
    return {id:unit.instanceId,charge:unit.metrics.chargeRoll?.modifier??0,
      modelCharge:unit.profiles.some(model=>Object.hasOwn(model.metrics,'chargeRoll')),
      applied:unit.applied.filter(a=>a.ruleId===expectation.source.canonicalId&&a.field==='chargeRoll').map(a=>({
        source:a.sourceInstanceId,target:a.targetInstanceId,model:a.targetModelInstanceId,after:a.after})),
      presentation:metrics.map(m=>({key:m.key,label:m.label,value:m.value.modifier,display:m.displayValue,
        scope:m.unitScope,recipients:[...m.recipientInstanceIds].sort(),sources:[...new Set(m.sources.map(s=>s.ruleId))],
        sourceInstances:[...new Set(m.sources.map(s=>s.sourceInstanceId))],provenance:m.sources.every(s=>Object.keys(s.provenance).length>0)}))};
  });
}
function expected(service,fixture,expectation,enabled){
  return service.state.units.map(unit=>{
    const on=enabled.includes(unit.instanceId),source=fixture.id==='am-gait'?unit.instanceId:fixture.source;
    const recipients=on&&fixture.bodyguard&&service.state.attachments.length?[fixture.source,...enabled.filter(id=>id!==fixture.source)].sort():[unit.instanceId];
    return {id:unit.instanceId,charge:on?1:0,modelCharge:false,
      applied:on?[{source,target:unit.instanceId,model:null,after:{modifier:1}}]:[],
      presentation:on?[{key:expectation.presentation.key,label:expectation.presentation.label,value:1,display:'+1',scope:'FORMED',recipients,
        sources:[expectation.source.canonicalId],sourceInstances:[source],provenance:true}]:[]};
  });
}
function verify(service,adapter,fixture,expectation,enabled,{binding=true}={}){
  assert.deepEqual(service.state.units.map(unit=>unit.instanceId).sort(),[...new Set([...fixture.enabled,...fixture.negative])].sort(),
    'Physical positive/negative fixture inventory cannot disappear');
  const actual=observe(service,adapter.cards,expectation),wanted=expected(service,fixture,expectation,enabled);
  // Compare even if the binding has disappeared. An empty contract cannot
  // shrink the independent expected recipients or turn this into a PASS.
  assert.deepEqual(actual,wanted,'Independent Charge source -> executor -> presentation: '+fixture.id);
  if(binding&&enabled.length)assertSourceEffectExpectation({expectation,book:adapter.book,
    applied:service.projection.units.flatMap(u=>u.applied).filter(a=>a.ruleId===expectation.source.canonicalId&&a.field==='chargeRoll'),
    observation:actual,expectedObservation:wanted});
}
for(const expectation of expectations.cases){
  const fixture=chargeFixtures.find(f=>f.id===expectation.id),adapter=adapters.get(expectation.bookId),service=adapter.make();
  const raw=fs.readFileSync(new URL(expectation.source.document,root));
  assert.equal(createHash('sha256').update(raw).digest('hex'),expectation.source.sha256,'Frozen independent source changed');
  assert.equal(service.import(fixture.text).status,'READY',fixture.id);
  assert.equal(service.state.units[0].canonicalUnitId,expectation.ownerUnitId);
  const canonicalUnits=fixture.equipment?Array(3).fill(expectation.ownerUnitId):fixture.id==='am-gait'?
    ['unit-sicarian-ruststalkers','unit-sicarian-ruststalkers','unit-skitarii-rangers']:
    [expectation.ownerUnitId,expectation.ownerUnitId,'unit-legionaries','unit-legionaries',...(fixture.id==='csm-daemonkin'?['unit-chaos-lord']:[])];
  assert.deepEqual(service.state.units.map(unit=>unit.canonicalUnitId),canonicalUnits,'Exact source-backed fixture identities');
  const initial=service.snapshot(),profileBaseline=characteristics(service);
  const standalone=fixture.bodyguard?(fixture.standalone?[fixture.source]:[]):fixture.enabled;
  verify(service,adapter,fixture,expectation,standalone);
  if(fixture.bodyguard)service.attach(fixture.source,fixture.bodyguard);
  verify(service,adapter,fixture,expectation,fixture.enabled);
  const enabled=service.snapshot();
  // Recompile the disposable producer declaration after deleting a binding;
  // leaving its canonical recipient behind would create an orphan fixture.
  const withoutCharge=recipientDeclarationView(adapter.book);
  for(const clause of withoutCharge.entities.find(e=>e.id===expectation.source.canonicalId).ruleContract.clauses)
    if(clause.rosterEffects?.some(effect=>effect.field==='chargeRoll')){clause.rosterEffects=[];clause.rosterClassification='DISPLAY_ONLY';}
  const neutral=adapter.make(compile(withoutCharge));neutral.load(enabled);
  assert.deepEqual(characteristics(service),characteristics(neutral),'Activating Charge must not change MODEL or weapon characteristics');
  service.load(JSON.parse(JSON.stringify(enabled)));verify(service,adapter,fixture,expectation,fixture.enabled);
  assert.deepEqual(characteristics(service),profileBaseline,'Charge changed MODEL/weapon characteristics');
  const reloaded=adapter.make();reloaded.load(enabled);verify(reloaded,adapter,fixture,expectation,fixture.enabled);
  if(fixture.bodyguard){
    service.detach(fixture.source);verify(service,adapter,fixture,expectation,standalone);
    service.attach(fixture.source,fixture.otherBodyguard);verify(service,adapter,fixture,expectation,[fixture.source,fixture.otherBodyguard]);
    service.reattach(fixture.source,fixture.bodyguard);verify(service,adapter,fixture,expectation,fixture.enabled);
  }
  if(fixture.id==='csm-daemonkin'){
    service.load(initial);service.attach('parsed-unit-5',fixture.bodyguard);verify(service,adapter,fixture,expectation,[]);
    // Reimport now preserves current links. Explicitly undo this negative
    // attachment before restoring the positive source, rather than losing it
    // as an incidental side effect of importing the same text again.
    service.detach('parsed-unit-5');assert.equal(service.state.attachments.length,0);
  }else{
    assert.equal(service.import(fixture.disabledText,{}, {replaceExisting:true}).status,'READY');verify(service,adapter,fixture,expectation,[]);
  }
  assert.equal(service.import(fixture.text,{}, {replaceExisting:true}).status,'READY');if(fixture.bodyguard)service.attach(fixture.source,fixture.bodyguard);
  verify(service,adapter,fixture,expectation,fixture.enabled);
  for(const mutation of ['missing-binding','wrong-value','wrong-recipient']){
    const declaration=recipientDeclarationView(adapter.book),rule=declaration.entities.find(e=>e.id===expectation.source.canonicalId);
    for(const clause of rule.ruleContract.clauses){
      const charge=clause.rosterEffects?.filter(e=>e.field==='chargeRoll')||[];
      if(mutation==='missing-binding'&&charge.length){clause.rosterEffects=clause.rosterEffects.filter(e=>e.field!=='chargeRoll');clause.rosterClassification='DISPLAY_ONLY';}
      if(mutation==='wrong-value')charge.forEach(e=>e.value=2);
    }
    const changed=compile(declaration),canonicalRule=changed.entities.find(e=>e.id===expectation.source.canonicalId);
    if(mutation==='wrong-recipient')for(const clause of canonicalRule.ruleContract.clauses)
      for(const effect of clause.rosterEffects||[])if(effect.field==='chargeRoll')resolveRecipient(canonicalRule,clause,effect.recipientId).from='ROSTER_UNITS';
    assert.throws(()=>{const bad=adapter.make(changed);bad.load(enabled);verify(bad,adapter,fixture,expectation,fixture.enabled,{binding:false});},
      /Independent Charge source -> executor -> presentation/,'Mutation escaped independent comparator: '+fixture.id+'/'+mutation);
    mutations.push(fixture.id+'/'+mutation);
  }
  const brokenPresentation={...service,effective(id){const view=clone(service.effective(id));delete view.unitMetrics;delete view.unitMetricSources;return view;}};
  assert.throws(()=>verify(brokenPresentation,adapter,fixture,expectation,fixture.enabled),/Independent Charge source -> executor -> presentation/);
  mutations.push(fixture.id+'/missing-presentation');
  const lostNegative={...service,state:{...service.state,units:service.state.units.filter(unit=>unit.instanceId!==fixture.negative[0])}};
  assert.throws(()=>verify(lostNegative,adapter,fixture,expectation,fixture.enabled),/fixture inventory cannot disappear/);
  mutations.push(fixture.id+'/missing-negative-instance');
  results.push({id:fixture.id,source:'PASS',binding:'PASS',executor:'PASS',presentation:'PASS',recipients:'PASS',negative:'PASS',recompute:'PASS'});
}
const coverage=assessEffectCoverage(ledger,expectations.cases,results.map(r=>r.id));
for(const reviewDecision of [undefined,'BATTLE_ONLY','EXECUTABLE_REQUIRED']){
  const altered=clone(ledger);altered.newRequirements.push({canonicalId:'independently-discovered-new-rule',sourceEvidence:'reviewed source',reviewDecision});
  assert.throws(()=>assessEffectCoverage(altered,expectations.cases,results.map(r=>r.id)),/New requirement|Unknown requirement|no passing effect guard/);
  mutations.push('new-obligation/'+(reviewDecision||'unclassified'));
}
assert.equal(coverage.freshlyVerified,7);assert.equal(coverage.allRequirementsPassed,false);
assert.equal(coverage.historicalRequired,397);
// Exercise the explicit reviewed-extension boundary without altering the frozen
// historical census. This tests bookkeeping only, never claims an eighth effect.
const extended=clone(ledger),additional={id:'review-boundary-fixture',bookId:'synthetic',source:{canonicalId:'reviewed-canonical-fixture'}};
extended.newRequirements.push({bookId:additional.bookId,canonicalId:additional.source.canonicalId,caseId:additional.id,
  sourceEvidence:'Synthetic ledger-only guard control',reviewDecision:'EXECUTABLE_REQUIRED'});
assert.equal(assessEffectCoverage(extended,[...expectations.cases,additional],[...results.map(r=>r.id),additional.id]).historicalRequired,397);
assert.throws(()=>assessEffectCoverage(extended,[...expectations.cases,additional],results.map(r=>r.id)),/Unverified current obligation/);
export const chargeSourceGuardResult={status:'PASS',results,mutationsRejected:mutations.length,mutations,coverage,
  realNewRecruitExportTested:false,sharedExecutorChanged:false};
console.log(JSON.stringify(chargeSourceGuardResult));

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {buildAdMechContracts,compileAdMechContracts,readJson,directory} from './rule-contract-build.mjs';
import {buildRosterRuntimeBook} from './roster-build.mjs';
import {createAdMechRosterRuntime} from './roster-runtime.mjs';

// These literal expectations were read from official v1.4 pp. 4, 8 and 19.
// They are deliberately independent of the overlay producer and declarations.
const baseHead='27e692ae16a88acc5565947f0deebafa95d33e66';
const sourceId='gw-am-faction-pack-v1.4';
const sha='35908C5BFA7BD6428936B00F48CA0C4B666AC14575CDF38341180C23650D0149';
const chant='detachment-luminen-auto-choir:stratagem:2';
const guided='detachment-haloscreed-battle-clade:stratagem:5';
const faq='faq-2';
const expected=new Map([
  [chant,{page:4,when:'Your Movement phase, when a friendly ELECTRO-PRIESTS unit is selected to make an advance move.',
    effect:'That move does not prevent your unit from being eligible to declare a charge.'}],
  [guided,{page:8,when:'Your Movement phase, when a friendly ADEPTUS MECHANICUS unit is selected to make a fall-back move.',
    effect:'• If your unit is a HALO OVERRIDE unit, your unit can re-roll hazard rolls.\n• That fall-back move does not prevent your unit from:\n  • Being eligible to shoot.\n  • Being eligible to declare a charge.'}],
  [faq,{page:19,title:'When I select one of Thulia Ghuld’s Icon of War abilities, when do I select the unit that ability affects?',
    text:'When you have selected the Icon of War ability you want to use.'}]
]);
const canonical=readJson('generated/effective.json');
const root=path.resolve(directory,'../../..');
const prior=JSON.parse(execFileSync('git',['show',baseHead+':books/adeptus-mechanicus/v2/generated/effective.json'],
  {cwd:root,encoding:'utf8',maxBuffer:40e6}));
const built=buildAdMechContracts(),{compiler}=compileAdMechContracts(built);
const index=new Map(built.book.entities.map(entity=>[entity.id,entity]));
const leaves=value=>!value||typeof value!=='object'?[]:value.predicate?[value]:
  Object.values(value).flatMap(child=>Array.isArray(child)?child.flatMap(leaves):leaves(child));
let controls=0,mutations=0;
const check=(value,message)=>{controls++;assert.ok(value,message);};
const same=(actual,wanted,message)=>{controls++;assert.deepEqual(actual,wanted,message);};

function compareContent(candidate) {
  const records=new Map(candidate.entities.map(entity=>[entity.id,entity]));
  for(const [id,value]of expected) {
    const entity=records.get(id);
    assert.ok(entity,'Missing official current rule: '+id);
    if(id===faq) {
      assert.equal(entity.data.class,'FAQ');
      assert.equal(entity.data.title,value.title);
      assert.equal(entity.data.text,value.text);
    } else {
      assert.equal(entity.data.lines.find(line=>line.label==='WHEN').text,value.when);
      assert.equal(entity.data.lines.find(line=>line.label==='EFFECT').text,value.effect);
      assert.equal(entity.data.cp,'1CP');
      assert.equal(entity.parentId,id.slice(0,id.indexOf(':stratagem:')));
    }
  }
}
compareContent(canonical);
const enrollment=canonical.sources;
const current=enrollment.artifacts.find(artifact=>artifact.authority==='OFFICIAL_GW'&&artifact.version==='1.4');
check(current,'Current official v1.4 is enrolled');
same(current.sha256,sha,'Enrolled v1.4 SHA');
same(createHash('sha256').update(fs.readFileSync(path.join(root,current.path))).digest('hex').toUpperCase(),sha,'Exact official PDF bytes');
same(current.effectiveFrom,'2026-10-14');
const historical=enrollment.artifacts.find(artifact=>artifact.version==='1.3'&&artifact.authority==='OFFICIAL_GW');
const oldHistorical=prior.sources.artifacts.find(artifact=>artifact.path===historical?.path);
same(historical.sha256,oldHistorical.sha256,'Historical v1.3 enrollment preserved');
same(createHash('sha256').update(fs.readFileSync(path.join(root,historical.path))).digest('hex').toUpperCase(),historical.sha256,
  'Historical v1.3 PDF preserved');
check(enrollment.sourceIds[sourceId]?.sourcePath===current.path,'Current source identity resolves to verified v1.4');
same(canonical.appliedOfficialUpdates.length,3,'Exactly three scoped official updates');
for(const [id,value]of expected) {
  const entity=index.get(id);
  const fields=id===faq?[]:id===chant?['lines/0/text']:['lines/0/text','lines/2/text'];
  const evidence=id===faq?[entity.provenance]:fields.map(field=>entity.fieldProvenance?.[field]);
  check(evidence.every(proof=>proof?.sourceId===sourceId&&proof.sourcePath===current.path&&proof.sha256===sha&&proof.page===value.page),
    'Every changed field retains exact current source/page provenance: '+id);
}
// No unrelated factual data, owners or canonical identities change.
const original=new Map(prior.entities.map(entity=>[entity.id,entity]));
for(const id of [chant,guided]) {
  const entity=index.get(id),old=original.get(id),data=structuredClone(old.data);
  data.lines[0].text=expected.get(id).when;
  if(id===guided)data.lines[2].text=expected.get(id).effect;
  same(entity.data,data,'Only approved operative fields change: '+id);
  same({id:entity.id,kind:entity.kind,parentId:entity.parentId,provenance:entity.provenance},
    {id:old.id,kind:old.kind,parentId:old.parentId,provenance:old.provenance},'Canonical owner and original provenance preserved: '+id);
}
for(const entity of canonical.entities) {
  if(expected.has(entity.id)||entity.kind==='SOURCE_UPDATE_REFERENCE'&&!original.has(entity.id))continue;
  const old=original.get(entity.id);
  check(old,'Unexpected new canonical owner: '+entity.id);
  same(entity,old,'Unrelated canonical entity changed: '+entity.id);
}
for(const id of original.keys())check(canonical.entities.some(entity=>entity.id===id),'Removed canonical identity: '+id);

const chantContract=index.get(chant).ruleContract,guidedContract=index.get(guided).ruleContract;
for(const contract of [chantContract,guidedContract]) {
  same(contract.executionMode,'BATTLE_ACTION');
  same(contract.contextLevel,'BATTLE');
  check(contract.clauses.every(clause=>!(clause.rosterEffects||[]).length),'No battle action lowered to roster execution');
}
for(const role of [chantContract.roles[0],chantContract.clauses[0].roles[0]])
  same(leaves(role.selector).map(atom=>atom.arguments.keyword),['ELECTRO-PRIESTS'],'No obsolete BATTLECLADE eligibility');
for(const unit of ['unit-corpuscarii-electro-priests','unit-fulgurite-electro-priests']) {
  check(!compiler.context(unit,'UNIT').keywords.has('BATTLECLADE'),'Representative source unit has no BATTLECLADE');
  same(compiler.evaluateRule(unit,chant,{detachmentIds:['detachment-luminen-auto-choir']}).applicability,'CONDITIONAL',
    'Roster-known Electro-priest remains eligible but battle-dependent');
}
same(compiler.evaluateRule('unit-skitarii-rangers',chant,{detachmentIds:['detachment-luminen-auto-choir']}).state,'FALSE',
  'Unrelated unit is not an Electro-priest');
for(const role of [guidedContract.roles[0],guidedContract.clauses[0].roles[0]])
  same(role.conditions.map(condition=>condition.arguments.key),['selectedToFallBackNow'],'Selection timing, not completed move');
same(guidedContract.duration,[{id:'duration-not-explicit',endpoint:'NOT_EXPLICIT',inferredExpiry:false}]);
same(guidedContract.durationFacts,[],'No invented end-of-turn lifetime');
function guidedState(battle) {
  const unitId='unit-skitarii-rangers',base=compiler.context(unitId,'UNIT');
  return built.schema.evaluator.evaluateRole(guidedContract.roles[0],guidedContract.conditions,
    {...base,roster:{detachmentId:'detachment-haloscreed-battle-clade'},battle});
}
same(guidedState({phase:'MOVEMENT',turnOwner:'FRIENDLY',selectedToFallBackNow:true}),'TRUE');
same(guidedState({phase:'MOVEMENT',turnOwner:'FRIENDLY',selectedToFallBackNow:false,justFellBack:true}),'FALSE');
same(guidedState({phase:'MOVEMENT',turnOwner:'FRIENDLY',justFellBack:true}),'UNKNOWN');
same(guidedState({phase:'SHOOTING',turnOwner:'FRIENDLY',selectedToFallBackNow:true}),'FALSE');
same(guidedState({phase:'MOVEMENT',turnOwner:'ENEMY',selectedToFallBackNow:true}),'FALSE');
same(guidedState({}),'UNKNOWN','Roster state cannot invent battle timing');
const faqClause=index.get(faq).ruleContract.clauses[0];
same(index.get(faq).ruleContract.executionMode,'SOURCE_DIRECTIVE');
same(faqClause.rosterClassification,'NOT_AN_EFFECT');
same(faqClause.rosterEffects,[]);
same(faqClause.directiveTargets,['datasheet-thulia-ghuld:section:1','datasheet-thulia-ghuld:section:4']);
for(const clause of index.get('datasheet-thulia-ghuld:section:4').ruleContract.clauses) {
  same(clause.rosterClassification,'BATTLE_ONLY');
  same(clause.rosterEffects,[],'FAQ does not turn Icon of War into a static roster effect');
}
const runtimeBook=buildRosterRuntimeBook(built),metadata=readJson('roster-import-aliases.json');
for(const [detachment,unitText,rule]of [
  ['Luminen Auto-choir','5x Corpuscarii Electro-priests (65 pts)',chant],
  ['Haloscreed Battle Clade','10x Skitarii Rangers (85 pts)',guided]
]) {
  const runtime=createAdMechRosterRuntime(runtimeBook,metadata);
  same(runtime.import('+ DETACHMENT: '+detachment+'\n\n'+unitText).status,'READY');
  same(runtime.related('parsed-unit-1').find(row=>row.ruleId===rule).applicability,'CONDITIONAL');
  check(runtime.projection.units.every(unit=>unit.applied.every(effect=>!expected.has(effect.ruleId))),
    'Official battle/FAQ changes do not execute from imported roster state');
}
// Mutated values are passed to the same actual comparator as the live input.
for(const [id,change]of [
  [chant,entity=>entity.data.lines[0].text=entity.data.lines[0].text.replace('ELECTRO-PRIESTS','ELECTRO-PRIESTS BATTLECLADE')],
  [guided,entity=>entity.data.lines[0].text='Your Movement phase, just after a unit Fell Back.'],
  [guided,entity=>entity.data.lines[2].text=entity.data.lines[2].text.replace('hazard rolls','Desperate Escape tests')],
  [faq,entity=>entity.data.text='Select the recipient when resolving the ability later.']
]) {
  const changed=structuredClone(canonical);
  change(changed.entities.find(entity=>entity.id===id));
  assert.throws(()=>compareContent(changed),assert.AssertionError,'Comparator missed changed official content: '+id);
  mutations++;
}
console.log(JSON.stringify({status:'PASS',officialChanges:3,controls,mutations,unrelatedCanonicalDelta:0,
  battleOnlyExecution:0,sourceSha256:sha}));

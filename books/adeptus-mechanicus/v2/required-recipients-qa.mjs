import assert from 'node:assert/strict';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {createAdMechRosterRuntime} from './roster-runtime.mjs';
import {buildRosterRuntimeBook} from './roster-build.mjs';
import {buildAdMechContracts,readJson} from './rule-contract-build.mjs';

const rangers='10x Skitarii Rangers (85 pts): 10x Galvanic rifle, 10x Close combat weapon';
const onager='1x Onager Dunecrawler (120 pts): Neutron laser, Cognis heavy stubber, Dunecrawler legs';
export const cases=[
  {id:'AM02',detachment:'Cohort Acquisitus',ruleId:'detachment-cohort-acquisitus:stratagem:1',
    actor:onager,recipient:rangers,roleId:'reconAnchor',sourceQuote:'within 12" of a friendly RECON AUGURY unit',line:2},
  {id:'AM03',detachment:'Explorator Maniple',ruleId:'detachment-explorator-maniple:stratagem:5',
    actor:rangers,recipient:onager,roleId:'smokeSupport',sourceQuote:'and one friendly ADEPTUS MECHANICUS SMOKE unit within 6" of it',line:1},
  {id:'AM04',detachment:'Explorator Maniple',ruleId:'detachment-explorator-maniple:stratagem:6',
    actor:rangers,recipient:'1x Skorpius Dunerider (85 pts)',roleId:'transport',sourceQuote:'and one friendly ADEPTUS MECHANICUS TRANSPORT',line:1},
  {id:'AM05',detachment:'Skitarii Hunter Cohort',ruleId:'detachment-skitarii-hunter-cohort:stratagem:2',
    actor:rangers,recipient:rangers,roleId:'secondTarget',sourceQuote:'Two SKITARII units from your army',line:1}
];
export const rosterText=(test,present)=>`+ FACTION KEYWORD: Imperium - Adeptus Mechanicus\n+ DETACHMENT: ${test.detachment}\n\n${test.actor}${present?'\n\n'+test.recipient:''}`;
export const attachedPairText=`+ DETACHMENT: Skitarii Hunter Cohort\n\nChar1: 1x Skitarii Marshal (50 pts): Control stave, Mechanicus pistol\n\n${rangers}`;

// Reviewed changes since the recipient/dependency snapshots, shared by both QA
// entrypoints. Expectations come from accepted source and the historical
// contract; no current executable declaration is copied into the baseline.
export function assertReviewedContractUpdate(entity,old) {
  const current=entity.ruleContract;
  if(entity.id==='datasheet-sicarian-ruststalkers:section:1') {
    const baseQuote='Add 1 to Advance and Charge rolls made for this unit.';
    const conditionalQuote='While this unit is within 6" of one or more friendly ADEPTUS MECHANICUS BATTLELINE units, add 2 to Advance and Charge rolls made for this unit instead.';
    const fullQuote='Optimised Gait: '+baseQuote+' '+conditionalQuote;
    const sourceRoot=new URL('../sources/waha-11e-current-2026-09-25/',import.meta.url);
    const raw=fs.readFileSync(new URL('Sicarian-Ruststalkers.html',sourceRoot),'utf8').replace(/<[^>]*>/g,'');
    const corpus=JSON.parse(fs.readFileSync(new URL('corpus.json',sourceRoot),'utf8'));
    assert.ok(raw.includes(fullQuote),'Accepted raw Optimised Gait text changed');
    assert.equal(corpus.datasheets.find(row=>row.sourceId==='datasheet-sicarian-ruststalkers')
      .sections.find(row=>row.sourceId===entity.id).blocks[0].text,fullQuote);
    assert.equal(entity.data.blocks[0].text,fullQuote,'Full Advance and proximity text must survive');
    const field=['blocks',0,'text'],evidence={field,quote:baseQuote};
    const source=structuredClone(old.roles[0]),recipient={...structuredClone(source),id:'sourceUnit',purpose:'EFFECT_RECIPIENT'};
    const expectedBase={id:'base-charge',roles:[source,recipient],conditions:[],sourceFields:[field],evidence,
      rosterClassification:'ROSTER_EXECUTABLE',rosterClassificationNote:{
        reason:'The source UNIT always adds 1 to Charge rolls. This is a typed roll modifier, never a Move characteristic or a resolved roll.',
        capabilityMissing:[{metric:'advanceRoll',status:'CAPABILITY_MISSING',
          reason:'The same source sentence also grants base Advance +1; the current shared metric vocabulary does not support Advance.'}]},
      rosterEffects:[{id:'base-charge-roster-effect',operation:'MODIFY_RULE_METRIC',targetBinding:'SOURCE_UNIT',
        targetSubject:'UNIT',unitScope:'FORMED',field:'chargeRoll',mode:'ADD',value:1,recipientRoleId:'sourceUnit',
        lifetime:'WHILE_SOURCE_UNIT_HAS_RULE',conditions:[],sourceFields:[field],evidence}],effectRecipientRoleIds:['sourceUnit']};
    const conditional=structuredClone(old.clauses[0]);
    conditional.evidence.quote=conditionalQuote;
    conditional.rosterClassificationNote={reason:'The replacement +2 requires a friendly ADEPTUS MECHANICUS BATTLELINE unit within 6". Preserve the source-dependent replacement without inferring battlefield range.'};
    assert.deepEqual(current,{...old,clauses:[expectedBase,conditional]},'Unreviewed Optimised Gait delta');
    return true;
  }
  // These scoped v1.4 updates are independently source-checked in
  // official-v1.4-qa.mjs. Preserve all other historical fields here too.
  if(entity.id==='faq-2') {
    assert.equal(old,undefined);
    assert.equal(current.executionMode,'SOURCE_DIRECTIVE');
    assert.equal(current.currentness.sourceId,'gw-am-faction-pack-v1.4');
    assert.ok(current.clauses.every(c=>c.rosterClassification==='NOT_AN_EFFECT'&&c.rosterEffects.length===0));
    return true;
  }
  if(['detachment-luminen-auto-choir:stratagem:2','detachment-haloscreed-battle-clade:stratagem:5'].includes(entity.id)) {
    const normalized=structuredClone(current);
    assert.ok(Object.values(current.currentness.fieldProvenance).every(p=>p.sourceId==='gw-am-faction-pack-v1.4'));
    normalized.currentness=old.currentness;normalized.timing=old.timing;
    if(entity.id==='detachment-luminen-auto-choir:stratagem:2') {
      normalized.roles[0].selector=old.roles[0].selector;
      normalized.clauses[0].roles[0].selector=old.clauses[0].roles[0].selector;
    } else {
      normalized.duration=old.duration;normalized.durationFacts=old.durationFacts;
      normalized.roles[0].conditions=old.roles[0].conditions;
      normalized.clauses[0].roles[0].conditions=old.clauses[0].roles[0].conditions;
      normalized.clauses[0].lifetimeEvidence=old.clauses[0].lifetimeEvidence;
    }
    assert.deepEqual(normalized,old,'Unreviewed official update contract delta');
    return true;
  }
  return false;
}

if(process.argv[1]===fileURLToPath(import.meta.url)) {
  const built=buildAdMechContracts(),book=buildRosterRuntimeBook(built),metadata=readJson('roster-import-aliases.json');
  const corpus=JSON.parse(fs.readFileSync(new URL('../sources/waha-11e-current-2026-09-25/corpus.json',import.meta.url)));
  const source=new Map(corpus.detachments.flatMap(d=>d.stratagems).map(rule=>[rule.sourceId,rule]));
  const pristine=structuredClone(book),make=()=>createAdMechRosterRuntime(book,metadata);
  const answer=(runtime,rule,instance='parsed-unit-1')=>runtime.related(instance).find(row=>row.ruleId===rule).applicability;
  let controls=0,mutations=0;
  for(const test of cases) {
    assert(source.get(test.ruleId).lines[test.line].text.includes(test.sourceQuote));
    assert.deepEqual(book.entities.find(e=>e.id===test.ruleId).data.lines[test.line],source.get(test.ruleId).lines[test.line]);
    const runtime=make();assert.equal(runtime.import(rosterText(test,false)).status,'READY');
    assert.equal(answer(runtime,test.ruleId),'NO_MATCH');
    assert.equal(runtime.import(rosterText(test,true)).status,'READY');
    assert.equal(answer(runtime,test.ruleId),'CONDITIONAL','Missing battle state must not become FALSE');
    const snapshot=runtime.snapshot();const without=structuredClone(snapshot);without.units.pop();runtime.load(without);
    assert.equal(answer(runtime,test.ruleId),'NO_MATCH');runtime.load(snapshot);assert.equal(answer(runtime,test.ruleId),'CONDITIONAL');
    controls+=7;
    const dropped=structuredClone(book);
    const contract=dropped.entities.find(e=>e.id===test.ruleId).ruleContract;
    for(const role of [contract.roles,...contract.clauses.map(c=>c.roles)].flat())if(role.id===test.roleId)role.required=false;
    // Cardinality metadata needs a required role and must fail validation too.
    assert.throws(()=>{
      const poisoned=createAdMechRosterRuntime(dropped,metadata);poisoned.import(rosterText(test,false));
      assert.equal(answer(poisoned,test.ruleId),'NO_MATCH');
    });mutations++;
  }
  const pair=make();assert.equal(pair.import(attachedPairText).status,'READY');
  const pairRule=cases[3].ruleId;
  for(const id of ['parsed-unit-1','parsed-unit-2'])assert.equal(answer(pair,pairRule,id),'CONDITIONAL');
  pair.attach('parsed-unit-1','parsed-unit-2');
  for(const id of ['parsed-unit-1','parsed-unit-2'])assert.equal(answer(pair,pairRule,id),'NO_MATCH');
  pair.detach('parsed-unit-1');assert.equal(answer(pair,pairRule),'CONDITIONAL');
  pair.reattach('parsed-unit-1','parsed-unit-2');assert.equal(answer(pair,pairRule),'NO_MATCH');controls+=6;
  const dropped=structuredClone(book),contract=dropped.entities.find(e=>e.id===pairRule).ruleContract;
  for(const role of [contract.roles,...contract.clauses.map(c=>c.roles)].flat())delete role.distinctFromRoleIds;
  const poisoned=createAdMechRosterRuntime(dropped,metadata);poisoned.import(attachedPairText);poisoned.attach('parsed-unit-1','parsed-unit-2');
  assert.throws(()=>assert.equal(answer(poisoned,pairRule),'NO_MATCH'));mutations++;
  // A RECON actor can itself supply the friendly anchor; source does not say another.
  const self=make();assert.equal(self.import(rosterText({...cases[0],actor:rangers},false)).status,'READY');
  assert.equal(answer(self,cases[0].ruleId),'CONDITIONAL');controls++;
  // Scope closure: no other declarations, factual fields or executable effects change.
  const previous=JSON.parse(execFileSync('git',['show','cd97ef803308ea8a0c44b945d74df57e747e47ad:books/adeptus-mechanicus/v2/generated/rule-contracts.json'],{encoding:'utf8',maxBuffer:40e6}));
  // AM-09 separately guards this approved selection/evidence binding repair.
  // Keep every other executable field and all recipient declarations frozen.
  previous.contracts['datasheet-onager-dunecrawler:section:1'].clauses.find(c=>c.id==='data-tether-smoke-removal')
    .rosterEffects[0].equipmentRequirement={binding:'SOURCE',kind:'EQUIPMENT_PRESENT',
      equipmentId:'datasheet-onager-dunecrawler:wargear:3',sourceFieldPath:['text']};
  const allowed=new Set(cases.map(test=>test.ruleId));
  // Subsequent dependent-role repair has its own exact four-owner diff guard.
  const dependentOwners=new Set([1,3,4,6].map(i=>'detachment-rad-zone-corps:stratagem:'+i));
  for(const entity of built.book.entities.filter(e=>e.ruleContract)) {
    const old=previous.contracts[entity.id],current=entity.ruleContract;
    if(assertReviewedContractUpdate(entity,old))continue;
    if(!allowed.has(entity.id)) {
      const normalized=structuredClone(current);
      if(dependentOwners.has(entity.id))for(const role of [normalized.roles,...normalized.clauses.map(c=>c.roles)].flat())
        if(role.id==='optionalSupport'){delete role.optional;delete role.prerequisites;}
      assert.deepEqual(normalized,old,'Out-of-scope contract changed: '+entity.id);
    }
    else {
      const strip=value=>{
        value=structuredClone(value);
        for(const role of [value.roles,...value.clauses.map(c=>c.roles)].flat()) {
          delete role.required;delete role.distinctFromRoleIds;delete role.evidence;
        }
        return value;
      };
      assert.deepEqual(strip(current),strip(old),'Changes beyond recipient binding');
    }
    for(let i=0;i<current.clauses.length;i++)assert.deepEqual(current.clauses[i].rosterEffects,old.clauses[i].rosterEffects);
  }
  const gait=built.book.entities.find(entity=>entity.id==='datasheet-sicarian-ruststalkers:section:1');
  for(const change of [
    contract=>contract.clauses.shift(),
    contract=>contract.clauses[0].rosterEffects.push(structuredClone(contract.clauses[0].rosterEffects[0])),
    contract=>contract.clauses[0].rosterEffects[0].recipientRoleId='battlelineAnchor',
    contract=>contract.clauses[0].rosterEffects[0].targetBinding='ROSTER_UNITS',
    contract=>contract.clauses[0].rosterEffects[0].value=3,
    contract=>contract.clauses[0].rosterEffects[0].field='M'
  ]) {
    const poison=structuredClone(gait);change(poison.ruleContract);
    assert.throws(()=>assertReviewedContractUpdate(poison,previous.contracts[gait.id]),assert.AssertionError);
    mutations++;
  }
  assert.deepEqual(book,pristine,'Runtime mutated canonical input');
  console.log(JSON.stringify({status:'PASS',cases:cases.map(test=>test.id),controls,mutations,
    requiredAbsent:'NO_MATCH',requiredPresent:'CONDITIONAL',attachedPair:'NO_MATCH',canonicalMutation:0,unrelatedContractDelta:0}));
}

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
  const allowed=new Set(cases.map(test=>test.ruleId));
  for(const entity of built.book.entities.filter(e=>e.ruleContract)) {
    const old=previous.contracts[entity.id],current=entity.ruleContract;
    if(!allowed.has(entity.id))assert.deepEqual(current,old,'Out-of-scope contract changed: '+entity.id);
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
  assert.deepEqual(book,pristine,'Runtime mutated canonical input');
  console.log(JSON.stringify({status:'PASS',cases:cases.map(test=>test.id),controls,mutations,
    requiredAbsent:'NO_MATCH',requiredPresent:'CONDITIONAL',attachedPair:'NO_MATCH',canonicalMutation:0,unrelatedContractDelta:0}));
}

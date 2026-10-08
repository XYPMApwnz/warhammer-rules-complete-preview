import assert from 'node:assert/strict';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {createAdMechRosterRuntime} from './roster-runtime.mjs';
import {buildRosterRuntimeBook} from './roster-build.mjs';
import {buildAdMechContracts,readJson} from './rule-contract-build.mjs';
import {createAdMechCompatibilityCompiler} from './rule-contract-context.mjs';
import {evaluateCompatibilityRole,requiredRecipientRoles} from '../../shared/roster-v2/compatibility-feasibility.mjs';

const onager='1x Onager Dunecrawler (120 pts): Neutron laser, Cognis heavy stubber, Dunecrawler legs';
const rangers='10x Skitarii Rangers (85 pts): 10x Galvanic rifle, 10x Close combat weapon';
export const cases=[1,3,4,6].map(i=>({id:'AM01-'+i,detachment:'Rad-Zone Corps',ruleId:'detachment-rad-zone-corps:stratagem:'+i,
  actor:onager,recipient:rangers,absentState:i===1?'NO_MATCH':'CONDITIONAL'}));
export const rosterText=(test,present)=>`+ DETACHMENT: ${test.detachment}\n\n${test.actor}${present?'\n\n'+test.recipient:''}`;

if(process.argv[1]===fileURLToPath(import.meta.url)) {
  const built=buildAdMechContracts(),book=buildRosterRuntimeBook(built),metadata=readJson('roster-import-aliases.json');
  const source=JSON.parse(fs.readFileSync(new URL('../sources/waha-11e-current-2026-09-25/corpus.json',import.meta.url)));
  const sources=new Map(source.detachments.flatMap(d=>d.stratagems).map(row=>[row.sourceId,row]));
  const schema=built.schema.evaluator,compiler=createAdMechCompatibilityCompiler(built.book,schema);
  let controls=0,mutations=0;
  for(const test of cases) {
    const contract=book.entities.find(e=>e.id===test.ruleId).ruleContract,secondary=contract.roles.find(r=>r.id==='optionalSupport');
    assert(sources.get(test.ruleId).lines[1].text.includes('If that unit is BATTLELINE'));
    assert.equal(secondary.optional,true);assert(!requiredRecipientRoles(contract).some(r=>r.id===secondary.id));
    assert.equal(secondary.prerequisites[0].roleId,'target');
    assert.equal(secondary.prerequisites[0].condition.roleId,'target');
    assert.equal(secondary.prerequisites[0].condition.contextLevel,'STATIC');
    assert.equal(compiler.evaluateRule('unit-onager-dunecrawler',test.ruleId).applicability,'CONDITIONAL');
    const runtime=createAdMechRosterRuntime(book,metadata);
    for(const present of [false,true]) {
      assert.equal(runtime.import(rosterText(test,present)).status,'READY');
      assert.equal(runtime.related('parsed-unit-1').find(row=>row.ruleId===test.ruleId).applicability,present?'CONDITIONAL':test.absentState);
      const contextsForRole=role=>runtime.state.units.map(unit=>runtime.context(unit.instanceId,role.subject)).filter(Boolean);
      assert.equal(evaluateCompatibilityRole(contract,secondary,runtime.context('parsed-unit-1'),{...schema,contextsForRole}),present?'UNKNOWN':'FALSE');
      controls+=4;
    }
    // A legal PRIMARY does not need an optional second target or BATTLELINE.
    for(const actor of [rangers,'5x Sicarian Infiltrators (85 pts)']) {
      assert.equal(runtime.import(rosterText({...test,actor},false)).status,'READY');
      assert.equal(runtime.related('parsed-unit-1').find(row=>row.ruleId===test.ruleId).applicability,'CONDITIONAL');controls+=2;
    }
    // STATIC source gate must survive binding into every occurrence.
    const poison=structuredClone(book),changed=poison.entities.find(e=>e.id===test.ruleId).ruleContract;
    for(const role of [changed.roles,...changed.clauses.map(c=>c.roles)].flat())delete role.prerequisites;
    const mutated=createAdMechRosterRuntime(poison,metadata);mutated.import(rosterText(test,false));
    const poisonedState=evaluateCompatibilityRole(changed,changed.roles.find(r=>r.id==='optionalSupport'),mutated.context('parsed-unit-1'),
      {...schema,contextsForRole:role=>mutated.state.units.map(unit=>mutated.context(unit.instanceId,role.subject)).filter(Boolean)});
    assert.throws(()=>assert.equal(poisonedState,'FALSE','Dropping the PRIMARY prerequisite must be detected'));mutations++;
  }
  // The previous release remains unchanged outside these four role bindings.
  const base=JSON.parse(execFileSync('git',['show','ef530dad5bddae1521cfca2bbbeba92fa48348d4:books/adeptus-mechanicus/v2/generated/rule-contracts.json'],{encoding:'utf8',maxBuffer:40e6}));
  for(const entity of built.book.entities.filter(e=>e.ruleContract)) {
    const current=structuredClone(entity.ruleContract),previous=base.contracts[entity.id];
    if(cases.some(test=>test.ruleId===entity.id))for(const role of [current.roles,...current.clauses.map(c=>c.roles)].flat())
      if(role.id==='optionalSupport'){delete role.optional;delete role.prerequisites;}
    assert.deepEqual(current,previous,'Unrelated contract delta: '+entity.id);
  }
  assert.deepEqual(readJson('generated/effective.json').entities,built.book.entities.map(entity=>{
    const row=structuredClone(entity);delete row.ruleContract;return row;
  }),'Canonical factual data changed');
  console.log(JSON.stringify({status:'PASS',owners:cases.map(test=>test.ruleId),controls,mutations,
    optionalSecondary:'OPTIONAL',primaryBinding:'PASS',scopeIsolation:'PASS',unrelatedContractDelta:0}));
}

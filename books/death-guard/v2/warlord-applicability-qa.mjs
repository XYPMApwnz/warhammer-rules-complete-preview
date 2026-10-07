import assert from 'node:assert/strict';
import fs from 'node:fs';
import {buildRelatedRules,armyBookContext} from './related-rules-build.mjs';
import {createRosterRuntime} from '../../shared/roster-v2/runtime.mjs';
import {withRosterDetachments} from '../../shared/roster-v2/context.mjs';
import {parse} from '../../shared/roster-v2/parser.mjs';
import * as evaluator from './rule-contract-schema.mjs';
import {stateFields} from './rule-contract-state-fields.mjs';
import {createRuleContractSchema} from '../../shared/rule-contract-v2/schema.mjs';

const book=JSON.parse(fs.readFileSync(new URL('./generated/rule-contract-effective.json',import.meta.url),'utf8'));
const records=new Map(book.entities.map(entity=>[entity.id,entity]));
const atoms=node=>node?.op?node.args.flatMap(atoms):node?.predicate?[node]:[];
const predicates=contract=>[...contract.roles.flatMap(role=>[role.selector,...role.conditions||[]]),...contract.conditions||[],
  ...contract.clauses.flatMap(clause=>[...clause.roles.flatMap(role=>[role.selector,...role.conditions||[]]),...clause.conditions||[]])].flatMap(atoms);
const warlordRules=book.entities.filter(entity=>entity.ruleContract&&predicates(entity.ruleContract).some(node=>node.predicate==='FIELD'&&node.arguments.key==='isWarlord'));
// The denominator comes from the complete canonical contract corpus. Exact
// canonical source evidence establishes every WARLORD atom, not an old matrix.
assert.ok(warlordRules.length);
for(const entity of warlordRules)for(const node of predicates(entity.ruleContract).filter(node=>node.arguments?.key==='isWarlord')){
  const value=node.evidence.field.reduce((data,key)=>data[key],entity.data);
  assert.ok(String(value).includes(node.evidence.quote));assert.match(node.evidence.quote,/WARLORD/i);
  assert.equal(node.contextLevel,'ROSTER');
}
assert.deepEqual(stateFields.isWarlord.intrinsicAllKeywords,['CHARACTER']);
const plague=records.get('detachment-virulent-vectorium:stratagem:3');
const role=plague.ruleContract.roles.find(role=>role.id==='primary');
const predicate=predicates(plague.ruleContract).find(node=>node.arguments?.key==='isWarlord');
const field=(subject='UNIT',equals=true)=>({...predicate,subject,arguments:{key:'isWarlord',equals}});
const api={parse,...evaluator},make=()=>createRosterRuntime(book,api);
const input=header=>`+ DETACHMENT: Paragons of Putrescence, Virulent Vectorium
${header||''}
Char1: 1x Lord of Contagion (110 pts): Manreaper
Char2: 1x Lord of Contagion (110 pts): Manreaper
3x Deathshroud Terminators (150 pts)
1x Foetid Bloat-drone (100 pts)`;
const imported=header=>{const service=make();assert.equal(service.import(input(header)).status,'READY');return service;};
const knownBattle={onBattlefield:true,phase:'COMMAND',turnOwner:'YOU'};
const bound=withRosterDetachments(evaluator);
const fullRole=context=>bound.evaluateRole(role,plague.ruleContract.conditions,{...context,battle:knownBattle});
const units=book.entities.filter(entity=>entity.kind==='DATASHEET');
const index=buildRelatedRules(book);
let nonCharacterWarlordMatches=0,bookCases=0;
for(const rule of warlordRules){
  for(const unit of units){
    const intrinsic=unit.data.keywords.includes('CHARACTER');
    for(const subject of ['MODEL','UNIT','FORMED_ATTACHED_UNIT']){
      const context=armyBookContext(book,unit,subject,rule.parentId);
      assert.equal(evaluator.evaluatePredicate(field(subject),context),intrinsic?'UNKNOWN':'FALSE');
      for(const status of [true,false]){
        context.roster.isWarlord=status;
        const result=evaluator.evaluatePredicate(field(subject),context);
        assert.equal(result,intrinsic&&status?'TRUE':'FALSE');
        if(!intrinsic&&result!=='FALSE')nonCharacterWarlordMatches++;
      }
      // Even an effective/possible CHARACTER grant is not intrinsic identity.
      context.keywords.add('CHARACTER');context.unknownKeywords?.add('CHARACTER');context.roster.isWarlord=true;
      assert.equal(evaluator.evaluatePredicate(field(subject),context),intrinsic?'TRUE':'FALSE');bookCases++;
    }
    if(!intrinsic)for(const row of index.rows.filter(row=>row.ruleId===rule.id&&row.unitId===unit.id)){
      assert.equal(row.applicability,'NO_MATCH');assert.equal(row.selectedDetachment.applicability,'NO_MATCH');
    }
  }
}
const drone=index.rows.find(row=>row.unitId==='unit-foetid-bloat-drone'&&row.ruleId===plague.id);
assert.equal(drone.applicability,'NO_MATCH');
const character=armyBookContext(book,records.get('unit-lord-of-contagion'),role.subject,plague.parentId);
assert.equal(fullRole(character),'UNKNOWN');

const unknown=imported();
assert.equal(unknown.state.units[0].warlord,null);
for(const subject of ['MODEL','UNIT']){
  const context=unknown.context('parsed-unit-1',subject);
  assert.equal(Object.hasOwn(context.roster,'isWarlord'),false);
  assert.equal(evaluator.evaluatePredicate(field(subject),context),'UNKNOWN');
}
assert.equal(fullRole(unknown.context('parsed-unit-1',role.subject)),'UNKNOWN');
const service=imported(' WARLORD: Char1: Lord of Contagion');
assert.deepEqual(service.state.units.map(unit=>unit.warlord),[true,false,false,false]);
assert.equal(fullRole(service.context('parsed-unit-1',role.subject)),'TRUE');
assert.equal(fullRole(service.context('parsed-unit-2',role.subject)),'FALSE');
// Resolving WARLORD does not pretend to resolve source BATTLE prerequisites.
assert.equal(service.related('parsed-unit-1').find(row=>row.ruleId===plague.id).applicability,'CONDITIONAL');
assert.equal(service.related('parsed-unit-2').find(row=>row.ruleId===plague.id).applicability,'NO_MATCH');
let formedUnitCharacterWarlordMatches=0;
service.attach('parsed-unit-1','parsed-unit-3');
for(const subject of ['MODEL','UNIT','FORMED_ATTACHED_UNIT']){
  const context=service.context('parsed-unit-3',subject);
  assert.equal(context.intrinsicKeywords.has('CHARACTER'),false);
  if(subject!=='MODEL')assert.equal(context.keywords.has('CHARACTER'),true);
  assert.equal(context.roster.isWarlord,false,'Attached Warlord ownership must not propagate');
  assert.equal(evaluator.evaluatePredicate(field(subject),context),'FALSE');
  context.roster.isWarlord=true;
  const result=evaluator.evaluatePredicate(field(subject),context);assert.equal(result,'FALSE');
  if(result!=='FALSE')formedUnitCharacterWarlordMatches++;
}
assert.equal(service.related('parsed-unit-3').find(row=>row.ruleId===plague.id).applicability,'NO_MATCH');
service.detach('parsed-unit-1');service.attach('parsed-unit-1','parsed-unit-3');
const roundtrip=make();roundtrip.load(JSON.parse(JSON.stringify(service.snapshot())));
assert.deepEqual(roundtrip.related('parsed-unit-3'),service.related('parsed-unit-3'));
const unknownRoundtrip=make();unknownRoundtrip.load(JSON.parse(JSON.stringify(unknown.snapshot())));
assert.equal(fullRole(unknownRoundtrip.context('parsed-unit-1',role.subject)),'UNKNOWN');
assert.equal(evaluator.evaluatePredicate(field(),{subject:'UNIT',keywords:new Set(['CHARACTER']),roster:{isWarlord:true}}),'INVALID','Missing intrinsic identity fails closed');

// Mutations reproduce both original defect paths without touching production
// artifacts. The guards must reject a lost gate and formed-keyword substitution.
// Factories snapshot their input: poison the declaration before constructing
// the mutation evaluator, rather than changing a live production registry.
const mutatedFields=structuredClone(stateFields);
delete mutatedFields.isWarlord.intrinsicAllKeywords;
const mutatedEvaluator=createRuleContractSchema({stateFields:mutatedFields,
  modelAbilities:['Deadly Demise'],contractSchema:'death-guard-rule-contract/v2'});
const mutationContext=armyBookContext(book,records.get('unit-foetid-bloat-drone'),'UNIT',plague.parentId);
assert.throws(()=>assert.equal(mutatedEvaluator.evaluatePredicate(field(),mutationContext),'FALSE'));
assert.equal(evaluator.evaluatePredicate(field(),mutationContext),'FALSE','Mutation must not contaminate the DG evaluator');
const poisoned=service.context('parsed-unit-3','UNIT');poisoned.intrinsicKeywords=poisoned.keywords;poisoned.roster.isWarlord=true;
assert.throws(()=>assert.equal(evaluator.evaluatePredicate(field(),poisoned),'FALSE'));
const missingAsFalse=unknown.context('parsed-unit-1','UNIT');missingAsFalse.roster.isWarlord=false;
assert.throws(()=>assert.equal(evaluator.evaluatePredicate(field(),missingAsFalse),'UNKNOWN'));

// Optional one-time comparison with the pre-repair disposable projection:
// no rule outside the independently enumerated WARLORD class may change.
if(process.argv.includes('--baseline')){
  const baseline=JSON.parse(fs.readFileSync(process.argv[process.argv.indexOf('--baseline')+1],'utf8'));
  const unaffected=rows=>rows.filter(row=>!warlordRules.some(rule=>rule.id===row.ruleId));
  assert.deepEqual(unaffected(index.rows),unaffected(baseline.rows));
}
assert.equal(index.summary.allDetachments.INVALID+index.summary.selectedDetachment.INVALID,0);
assert.equal(index.summary.allDetachments.UNRESOLVED+index.summary.selectedDetachment.UNRESOLVED,0);
console.log(JSON.stringify({status:'PASS',warlordRulesScanned:warlordRules.length,ruleIds:warlordRules.map(rule=>rule.id),bookCases,
  nonCharacterWarlordMatches,formedUnitCharacterWarlordMatches,invalid:0,unresolved:0,duplicateInstances:'PASS',roundtrip:'PASS',
  battlePrerequisites:'REMAIN_CONDITIONAL',mutations:3}));

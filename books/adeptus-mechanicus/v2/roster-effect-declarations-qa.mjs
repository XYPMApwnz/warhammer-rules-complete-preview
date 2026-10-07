import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {buildAdMechContracts,readJson,directory} from './rule-contract-build.mjs';
import {compilerInputs} from './rule-contract-context.mjs';
import {abilityReferences} from './ability-reference-registry.mjs';
import {inspectDeclarationEvidence} from '../../shared/rule-contract-v2/bindings.mjs';
import {validateRosterEffects} from '../../shared/roster-v2/effects.mjs';

// Declaration conformance only: do not execute effects, build effective roster
// datasheets, or connect the frontend to a new runtime path in this stage.
const built=buildAdMechContracts(),canonical=readJson('generated/effective.json');
const {book}=compilerInputs(built.book,{abilityReferences:abilityReferences()});
const records=new Map(book.entities.map(e=>[e.id,e]));
const clause=(id,c)=>records.get(id).ruleContract.clauses.find(x=>x.id===c);
const root=path.resolve(directory,'../../..');
const leaves=p=>p.op?p.args.flatMap(leaves):[p];
const clean=p=>{const result=structuredClone(p);delete result.roleId;return result;};
const condition=(binding,p)=>({binding,predicate:clean(p),contextLevel:leaves(p)[0].contextLevel});
const ds=name=>'datasheet-'+name+':section:1';
const newlyBound=[
  [ds('kastelan-robots'),'block-1','GRANT_MODEL_ABILITY','LEADERS_OF_SOURCE','MODEL',{ability:{name:'Feel No Pain',value:4}}],
  [ds('skitarii-rangers'),'block-3','GRANT_WEAPON_ABILITY','SOURCE_UNIT','UNIT',{ability:'IGNORES COVER',weaponMode:'ranged'}],
  [ds('skitarii-vanguard'),'block-3','GRANT_WEAPON_ABILITY','SOURCE_UNIT','UNIT',{ability:'IGNORES COVER',weaponMode:'ranged'}],
  [ds('tech-priest-dominus'),'block-1','GRANT_MODEL_ABILITY','SOURCE_FORMED_MODELS','MODEL',{ability:{name:'Feel No Pain',value:5}}],
  [ds('tech-priest-dominus'),'block-1-electro-priests','GRANT_MODEL_ABILITY','SOURCE_FORMED_MODELS','MODEL',{ability:{name:'Feel No Pain',value:4}}],
  [ds('tech-priest-manipulus'),'block-1','GRANT_WEAPON_ABILITY','SOURCE_FORMED_MODELS','MODEL',{ability:'LETHAL HITS'}],
  [ds('technoarcheologist'),'block-1','MODIFY_STAT','SOURCE_FORMED_MODELS','MODEL',{field:'OC',mode:'ADD',value:1}]
];
const normalized=[
  ['detachment-haloscreed-battle-clade:enhancement:4','bearer-melee-statistics'],
  ['detachment-data-psalm-conclave:enhancement:1','bearer-leadership'],
  ['detachment-cohort-cybernetica:enhancement:4','bearer-ranged-anti-vehicle'],
  ['detachment-rad-zone-corps:enhancement:3','led-unit-ranged-sustained-hits'],
  ['detachment-rad-zone-corps:enhancement:4','bearer-ranged-anti-keywords'],
  ['detachment-luminen-auto-choir:rule','corpuscarii-lethal-hits'],
  ['detachment-cohort-acquisitus:rule','recon-augury-keyword']
];
const shape=e=>[e.operation,e.targetBinding,e.targetSubject,e.field??null,e.mode??null,e.value??null,e.ability??null,e.weaponMode??null,e.keyword??null];
const normalizedShapes=[
  [['MODIFY_STAT','SOURCE_MODEL','MODEL','attacks','ADD',3,null,'melee',null],['MODIFY_STAT','SOURCE_MODEL','MODEL','damage','ADD',1,null,'melee',null]],
  [['MODIFY_STAT','SOURCE_MODEL','MODEL','LD','SET',6,null,null,null]],
  [['GRANT_WEAPON_ABILITY','SOURCE_MODEL','MODEL',null,null,null,'ANTI-VEHICLE 4+','ranged',null]],
  [['GRANT_WEAPON_ABILITY','SOURCE_FORMED_MODELS','MODEL',null,null,null,'SUSTAINED HITS 1','ranged',null]],
  [['GRANT_WEAPON_ABILITY','SOURCE_MODEL','MODEL',null,null,null,'ANTI-INFANTRY 2+','ranged',null],['GRANT_WEAPON_ABILITY','SOURCE_MODEL','MODEL',null,null,null,'ANTI-MONSTER 4+','ranged',null]],
  [['GRANT_WEAPON_ABILITY','ROSTER_UNITS','UNIT',null,null,null,'LETHAL HITS','ranged',null]],
  [['GRANT_UNIT_KEYWORD','ROSTER_UNITS','UNIT',null,null,null,null,null,'RECON AUGURY']]
];

function verify(candidate) {
  const index=new Map(candidate.entities.map(e=>[e.id,e]));
  const get=(id,c)=>index.get(id).ruleContract.clauses.find(x=>x.id===c);
  const counts={ROSTER_EXECUTABLE:0,BATTLE_ONLY:0,DISPLAY_ONLY:0,NOT_AN_EFFECT:0};
  let owners=0;
  for(const entity of candidate.entities.filter(e=>e.ruleContract)) {
    owners++;
    inspectDeclarationEvidence(entity.ruleContract,index,entity);
    for(const c of entity.ruleContract.clauses) {
      // Stratagem execution was never lowered. Independently require canonical
      // WHEN evidence and a BATTLE context before accounting for those clauses.
      let classification=c.rosterClassification;
      if(classification===undefined && entity.kind==='STRATAGEM') {
        assert.ok(entity.data.lines.some(line=>line.label==='WHEN'&&line.text.trim()));
        assert.equal(entity.ruleContract.contextLevel,'BATTLE');
        classification='BATTLE_ONLY';
      }
      assert.ok(Object.hasOwn(counts,classification),'Unclassified source clause');
      counts[classification]++;
      if(classification!=='ROSTER_EXECUTABLE')assert.equal(c.rosterEffects?.length||0,0,'Battle/non-effect execution leak');
      else {
        assert.ok(c.rosterEffects.length,'Missing executable declaration');
        assert.equal(c.operation,undefined,'Declarative-only operation retained');
        assert.equal(c.operationParameters,undefined,'Competing operation parameters retained');
        assert.ok(c.rosterEffects.every(e=>e.lifetime&&e.evidence&&e.sourceFields.length));
      }
    }
  }
  assert.equal(owners,204);
  assert.deepEqual(counts,{ROSTER_EXECUTABLE:43,BATTLE_ONLY:175,DISPLAY_ONLY:0,NOT_AN_EFFECT:69});
  for(const [id,cid,operation,targetBinding,targetSubject,values]of newlyBound) {
    const c=get(id,cid),e=c.rosterEffects[0];
    assert.equal(c.rosterEffects.length,1);
    assert.equal(c.rosterClassification,'ROSTER_EXECUTABLE');
    assert.deepEqual({operation:e.operation,targetBinding:e.targetBinding,targetSubject:e.targetSubject},{operation,targetBinding,targetSubject});
    for(const [key,value]of Object.entries(values))assert.deepEqual(e[key],value);
    assert.deepEqual(e.evidence,c.evidence);assert.deepEqual(e.sourceFields,c.sourceFields);
    assert.deepEqual(c.effectRecipientRoleIds,[e.recipientRoleId]);
    const role=c.roles.find(r=>r.id===e.recipientRoleId);
    assert.equal(role.binding,e.targetBinding);assert.equal(role.subject,e.targetSubject);
    const expected=id===ds('kastelan-robots')
      ? [role.selector,...role.conditions].map(p=>condition('TARGET',p))
      : c.conditions.map(p=>condition('SOURCE',p));
    assert.deepEqual(e.conditions,expected,'Executable condition/role binding lost');
    if(id===ds('kastelan-robots')) {
      assert.deepEqual(e.conditions.map(c=>[c.binding,c.predicate.predicate,c.predicate.arguments]),[
        ['TARGET','MODEL_ID',{id:'datasheet-cybernetica-datasmith:profile:default'}],
        ['TARGET','LEADING',{value:true}],['TARGET','BODYGUARD_ID',{id:'unit-kastelan-robots'}]
      ]);
    } else if(!id.includes('skitarii-')) {
      assert.equal(e.conditions[0].binding,'SOURCE');
      assert.equal(e.conditions[0].predicate.predicate,'LEADING');
      assert.deepEqual(e.conditions[0].predicate.arguments,{value:true});
      if(id===ds('tech-priest-dominus')) {
        assert.equal(e.conditions.length,2);
        const membership=e.conditions[1].predicate;
        assert.equal(membership.op,cid==='block-1'?'NOT':undefined);
        assert.deepEqual(leaves(membership).map(p=>[p.predicate,p.subject,p.arguments]),
          [['UNIT_KEYWORD','FORMED_ATTACHED_UNIT',{keyword:'ELECTRO-PRIESTS'}]]);
      }
    }
    if(id.includes('skitarii-')) {
      assert.deepEqual(e.equipmentRequirement,{binding:'SOURCE',kind:'EQUIPMENT_PRESENT',equipmentId:id,sourceFieldPath:['blocks',2,'text']});
      assert.equal(e.conditions[0].predicate.arguments.key,'equipmentRequirementSatisfied');
      assert.equal(e.lifetime,'WHILE_EQUIPMENT_REQUIREMENT_SATISFIED');
      assert.ok(!JSON.stringify(e).includes('omnispexEquipped'));
    } else assert.ok(e.lifetime.includes('LEADING'));
  }
  for(const [i,[id,cid]]of normalized.entries()) {
    assert.equal(get(id,cid).rosterClassification,'ROSTER_EXECUTABLE');
    assert.deepEqual(get(id,cid).rosterEffects.map(shape),normalizedShapes[i],'Existing declarative operation was reinterpreted');
  }
  const led=get('detachment-rad-zone-corps:enhancement:3','led-unit-ranged-sustained-hits').rosterEffects[0];
  assert.equal(led.conditions.length,1);assert.equal(led.conditions[0].binding,'SOURCE');
  assert.equal(led.conditions[0].predicate.predicate,'LEADING');assert.equal(led.conditions[0].predicate.arguments.value,true);
  const corpus=get('detachment-luminen-auto-choir:rule','corpuscarii-lethal-hits').rosterEffects[0];
  assert.equal(corpus.conditions.length,1);assert.equal(corpus.conditions[0].binding,'TARGET');
  assert.equal(corpus.conditions[0].predicate.predicate,'UNIT_KEYWORD');
  assert.equal(corpus.conditions[0].predicate.arguments.keyword,'CORPUSCARII');
  const recon=get('detachment-cohort-acquisitus:rule','recon-augury-keyword').rosterEffects[0];
  assert.equal(recon.conditions.length,1);assert.equal(recon.conditions[0].binding,'TARGET');
  assert.equal(recon.conditions[0].predicate.op,'ANY');
  assert.deepEqual(leaves(recon.conditions[0].predicate).map(p=>[p.predicate,p.arguments]),[
    ['UNIT_KEYWORD',{keyword:'PTERAXII'}],['UNIT_KEYWORD',{keyword:'INFILTRATORS'}],['UNIT_KEYWORD',{keyword:'RANGERS'}],
    ['UNIT_ID',{id:'unit-serberys-raiders'}],['UNIT_ID',{id:'unit-serberys-sulphurhounds'}]
  ]);
  assert.equal(get('detachment-luminen-auto-choir:rule','data-psalm-exclusivity').rosterClassification,'NOT_AN_EFFECT');
  const dominus=index.get(ds('tech-priest-dominus')).ruleContract.clauses.filter(c=>c.rosterClassification==='ROSTER_EXECUTABLE');
  assert.equal(new Set(dominus.flatMap(c=>c.rosterEffects.map(e=>e.id))).size,2,'FNP branches share a runtime deduplication identity');
  // The scope of validation is execution declarations. Unlowered Stratagems
  // remain source-backed battle information, never an executable input here.
  const validation=structuredClone(candidate);
  for(const entity of validation.entities)if(entity.kind==='STRATAGEM')delete entity.ruleContract;
  validateRosterEffects(validation,built.schema.evaluator.validatePredicate,built.schema.evaluator.evaluatePredicate);
  for(const entity of candidate.entities.filter(e=>e.ruleContract)) {
    if(entity.kind==='ARMY_RULE_COMPONENT')assert.ok(entity.ruleContract.clauses.every(c=>c.rosterClassification==='BATTLE_ONLY'&&!c.rosterEffects.length));
  }
  for(const id of ['detachment-haloscreed-battle-clade:enhancement:2','detachment-eradication-cohort:enhancement:1']) {
    const c=index.get(id).ruleContract;
    assert.deepEqual(c.clauses.flatMap(c=>c.rosterEffects.map(e=>e.field||e.ability)),['BS','HEAVY','WS','ASSAULT']);
    assert.equal(c.clauses.filter(c=>c.rosterClassification==='BATTLE_ONLY').length,2);
    assert.ok(c.clauses.filter(c=>c.rosterClassification==='BATTLE_ONLY').every(c=>!c.rosterEffects.length));
  }
  return counts;
}
const counts=verify(book);
// Compare changed owners to accepted captures, not to their generated overlay.
for(const id of new Set([...newlyBound,...normalized].map(row=>row[0]))) {
  const original=canonical.entities.find(e=>e.id===id),{sourcePath,pointer}=original.provenance;
  const source=JSON.parse(fs.readFileSync(path.join(root,sourcePath),'utf8'));
  const captured=pointer.slice(1).split('/').reduce((v,key)=>v[key],source);
  for(const field of records.get(id).ruleContract.sourceFields)
    assert.deepEqual(field.reduce((v,key)=>v[key],original.data),field.reduce((v,key)=>v[key],captured),'Source field changed');
}

// Predicate truth controls exercise declarations without applying any effect.
const context=(subject,roster={},keywords=[],modelId)=>({subject,unitId:'unit-kastelan-robots',modelId,keywords:new Set(keywords),intrinsicKeywords:new Set(keywords),abilities:new Set(),roster,battle:{}});
let controls=0;
const truth=(e,source,target)=>e.conditions.map(c=>built.schema.evaluator.evaluatePredicate(c.predicate,c.binding==='SOURCE'?source:target));
const all=(states)=>states.every(x=>x==='TRUE');
const fnp4=clause(ds('kastelan-robots'),'block-1').rosterEffects[0];
const target=context('MODEL',{leading:true,bodyguardId:'unit-kastelan-robots'},[],'datasheet-cybernetica-datasmith:profile:default');
assert.ok(all(truth(fnp4,null,target)));controls++;
for(const changed of [{...target,modelId:'datasheet-tech-priest-dominus:profile:default'},
  {...target,roster:{leading:false,bodyguardId:'unit-kastelan-robots'}},
  {...target,roster:{leading:true,bodyguardId:'unit-skitarii-rangers'}}]) {assert.ok(truth(fnp4,null,changed).includes('FALSE'));controls++;}
for(const keywords of [[],['ELECTRO-PRIESTS']])for(const leading of [true,false]) {
  const sourceModel=context('MODEL',{leading});
  const sourceFormed=context('FORMED_ATTACHED_UNIT',{leading},keywords);
  const states=['block-1','block-1-electro-priests'].map(cid=>clause(ds('tech-priest-dominus'),cid).rosterEffects[0].conditions.map(c=>
    built.schema.evaluator.evaluatePredicate(c.predicate,leaves(c.predicate)[0].subject==='MODEL'?sourceModel:sourceFormed)));
  assert.deepEqual(states.map(all),leading?[keywords.length===0,keywords.length!==0]:[false,false]);controls++;
}
for(const name of ['skitarii-rangers','skitarii-vanguard']) {
  const e=clause(ds(name),'block-3').rosterEffects[0];
  for(const known of [true,false,undefined]) {
    const states=truth(e,context('UNIT',known===undefined?{}:{equipmentRequirementSatisfied:known}),null);
    assert.deepEqual(states,[known===undefined?'UNKNOWN':known?'TRUE':'FALSE']);controls++;
  }
}
let mutations=0;
const mutate=(id,cid,change)=>{const candidate=structuredClone(book);change(candidate.entities.find(e=>e.id===id).ruleContract.clauses.find(c=>c.id===cid));assert.throws(()=>verify(candidate));mutations++;};
for(const [id,cid]of [...newlyBound,...normalized])mutate(id,cid,c=>c.rosterEffects=[]);
for(const [id,cid]of normalized)mutate(id,cid,c=>c.rosterEffects[0].targetBinding='SOURCE_UNIT_MODELS');
for(const [id,cid]of newlyBound) {
  mutate(id,cid,c=>c.rosterEffects[0].targetSubject=c.rosterEffects[0].targetSubject==='MODEL'?'UNIT':'MODEL');
  mutate(id,cid,c=>c.rosterEffects[0].evidence.quote='UNSOURCED');
  mutate(id,cid,c=>c.rosterEffects[0].conditions=[]);
}
mutate(ds('skitarii-rangers'),'block-3',c=>c.rosterEffects[0].equipmentRequirement.equipmentId=ds('skitarii-vanguard'));
mutate(ds('kastelan-robots'),'block-1',c=>c.rosterEffects[0].targetBinding='SOURCE_FORMED_MODELS');
mutate(ds('tech-priest-dominus'),'block-1-electro-priests',c=>c.rosterEffects[0].id=clause(ds('tech-priest-dominus'),'block-1').rosterEffects[0].id);
mutate('detachment-haloscreed-battle-clade:enhancement:2','conqueror-roster-characteristics',c=>c.rosterEffects[0].field='ap');
assert.deepEqual(readJson('generated/effective.json'),canonical,'Audit changed canonical data');
console.log(JSON.stringify({status:'PASS',rules:204,clauses:287,counts,complete:'43/43',newlyBound:7,normalized:7,controls,mutations,
  unsupported:0,unclassified:0,battleEffectLeakage:0,effectiveDatasheetsProjected:false,sharedRuntimeChanged:false}));

/** Presentation attribution follows executed canonical effects. Synthetic inputs
 * exercise occurrence joins; native BA inputs are constructed diagnostics, not
 * authentic New Recruit exports or assertions of whole-army legality. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {projectEffectiveInstance} from '../roster-v2/effective-instance.mjs';
import {projectInstanceCards} from './personal.mjs';
import {createSyntheticPersonalFixture} from './personal-datasheet-qa.mjs';
import {createBloodAngelsRosterService} from '../../blood-angels/v2/roster-import.mjs';

const clone=structuredClone,read=file=>JSON.parse(fs.readFileSync(new URL(file,import.meta.url),'utf8'));
const results=[];
function check(id,run){try{run();results.push({id,status:'PASS'});}catch(error){results.push({id,status:'FAIL',error:error.stack});}}

function weaponFixture(nested=false){
  const f=createSyntheticPersonalFixture('weapon-attribution-'+nested,nested),{id}=f;
  for(const entity of f.model.entities.filter(e=>e.kind==='DATASHEET'))Object.assign(entity.data,{
    title:entity.data.name,sectionIds:[],ruleReferenceIds:[],weaponIds:[],wargearOptionIds:[]});
  const rule=f.model.entities.find(e=>e.id===id('equipment-rule'));
  const origin=f.model.entities.find(e=>e.id===id('weapon-rule'));
  origin.provenance={sourceId:id('accepted-origin')};
  const effect={id:id('effect'),operation:'GRANT_WEAPON_ABILITY',ability:'LETHAL HITS',
    targetSubject:'MODEL',referencedRuleId:origin.id,provenance:{canonicalRuleId:origin.id}};
  rule.ruleContract={clauses:[{id:'grant',rosterEffects:[effect]}]};
  const make=(unit,effective)=>({...clone(unit),intrinsicKeywords:['INFANTRY'],keywords:['INFANTRY'],
    weapons:[],applied:[],conditional:[],profiles:effective.profiles.map(profile=>({
      ...clone(profile),canonicalProfileId:profile.id,profile:clone(f.model.entities.find(e=>e.id===profile.id).data),
      intrinsicKeywords:['INFANTRY'],weapons:[]}))});
  const raw=make(f.unit,f.effective),peer=make(f.duplicate.unit,f.duplicate.effective),model=raw.profiles[0];
  const data=clone(f.model.entities.find(e=>e.id===id('selected-weapon')).data);
  const weapon=(key,abilities)=>({canonicalProfileId:id('selected-weapon'),scopeId:model.scopeId,
    selectionKey:key,physicalQuantity:1,modelInstanceId:model.modelInstanceId,data:{...clone(data),abilities}});
  model.weapons=[weapon('selected',['LETHAL HITS']),weapon('independent',[])];
  const trace={ruleId:rule.id,clauseId:'grant',effectId:effect.id,operation:effect.operation,field:'abilities',
    sourceInstanceId:raw.instanceId,targetInstanceId:raw.instanceId,targetProfileId:model.canonicalProfileId,
    targetCompositionId:model.scopeId,targetWeaponProfileId:id('selected-weapon'),
    targetWeaponSelectionKey:'selected',targetWeaponScopeId:model.scopeId,before:[],after:['LETHAL HITS'],
    sourceFields:[['text']],lifetime:'ROSTER'};
  raw.applied.push(trace);
  return {...f,raw,peer,rule,origin,effect,trace,projection:{units:[raw,peer],formedUnits:[]}};
}

for(const nested of [false,true]){
  check('weapon-source-occurrence-'+nested,()=>{
    const f=weaponFixture(nested),before=clone(f.projection);
    const effective=projectEffectiveInstance(f.model,f.projection,f.raw.instanceId);
    const selected=effective.weapons.find(w=>w.selectionKey==='selected');
    assert.equal(selected.abilitySources?.length,1,'Executed grant must retain one actual source');
    const source=selected.abilitySources[0];
    assert.equal(source.canonicalRuleId,f.origin.id,'Canonical granting rule, not the selection wrapper');
    assert.notEqual(source.canonicalRuleId,source.ruleId);
    assert.equal(source.targetWeaponSelectionKey,'selected');
    assert.equal(source.targetCompositionId,selected.scopeId);
    assert.equal(effective.weapons.find(w=>w.selectionKey==='independent').abilitySources,undefined);
    const variants=projectInstanceCards(f.cards,f.unit,effective).get(f.id('selected-weapon'));
    const granted=variants.find(card=>card.selectionKey==='selected').fields.find(field=>field.value==='LETHAL HITS');
    assert.equal(granted.weaponGrantSources[0].canonicalRuleId,f.origin.id);
    assert.ok(variants.find(card=>card.selectionKey==='independent').fields.every(field=>!field.weaponGrantSources));
    assert.equal(projectEffectiveInstance(f.model,f.projection,f.peer.instanceId).weapons.length,0);
    assert.deepEqual(f.projection,before,'Presentation must not mutate physical projection');
    assert.deepEqual(projectEffectiveInstance(f.model,clone(f.projection),f.raw.instanceId),effective);
  });
  check('intrinsic-and-no-op-do-not-invent-source-'+nested,()=>{
    const f=weaponFixture(nested);f.raw.applied=[];
    f.model.entities.find(e=>e.id===f.id('selected-weapon')).data.abilities=['LETHAL HITS'];
    const effective=projectEffectiveInstance(f.model,f.projection,f.raw.instanceId);
    assert.ok(effective.weapons.every(w=>!w.abilitySources),'Intrinsic ability has no executed grant source');
    const variants=projectInstanceCards(f.cards,f.unit,effective).get(f.id('selected-weapon'));
    assert.ok(variants.every(card=>card.fields.every(field=>!field.weaponGrantSources)));
  });
  for(const [name,alter]of [
    ['missing-effect',f=>f.trace.effectId='missing'],
    ['missing-clause',f=>f.trace.clauseId='missing'],
    ['missing-canonical-origin',f=>f.effect.referencedRuleId='missing'],
    ['contradictory-origin',f=>f.effect.provenance.canonicalRuleId=f.rule.id],
    ['not-a-grant-transition',f=>f.trace.before=['LETHAL HITS']]
  ])check('reject-'+name+'-'+nested,()=>{
    const f=weaponFixture(nested);alter(f);
    assert.throws(()=>projectEffectiveInstance(f.model,f.projection,f.raw.instanceId),/attribution|origin/);
  });
  check('wrong-weapon-occurrence-does-not-claim-source-'+nested,()=>{
    const f=weaponFixture(nested);f.trace.targetWeaponSelectionKey='foreign';
    const effective=projectEffectiveInstance(f.model,f.projection,f.raw.instanceId);
    assert.ok(effective.weapons.every(w=>!w.abilitySources));
  });
}

const book=read('../../blood-angels/v2/generated/roster-import.json');
const payload=read('../../blood-angels/v2/generated/gameplay-presentation.json');
const cards=new Map(payload.cards.map(card=>[card.id,card]));
const header='+ FACTION KEYWORD: Blood Angels\n+ DETACHMENT: Gladius Task Force\n';
const body='5x Death Company Marines with Jump Packs (9999 pts)\n'+
  '• 5x Death Company Marines with Jump Packs: 1x Chainsword, 1x Heavy Bolt Pistol\n';
const nativeCases=[
  {id:'lemartes',unit:'unit-ba-3483c88a4df4495ca2e2',rule:'ability-ba-40389ffef38645ca922a',
    quote:'This unit’s melee attacks have [LETHAL HITS].',ability:'LETHAL HITS',
    text:'1x Lemartes (9999 pts)\n• 1x Lemartes: 1x The Blood Crozius, 1x Absolvor Bolt Pistol\n'},
  {id:'jump-death-company-captain',unit:'unit-ba-5269d704246f4e3a8d81',rule:'ability-ba-7cbf2dc160514d6d83d6',
    quote:'This unit’s melee attacks have [SUSTAINED HITS 1].',ability:'SUSTAINED HITS 1',
    text:'1x Death Company Captain with Jump Pack (9999 pts)\n'+
      '• 1x Death Company Captain with Jump Pack: 1x Chainsword, 1x Heavy Bolt Pistol\n'}
];
for(const test of nativeCases)check('native-weapon-source-'+test.id,()=>{
  assert.ok(book.entities.find(e=>e.id===test.rule).data.text.includes(test.quote),'Accepted source clause changed');
  const service=createBloodAngelsRosterService(book),input=header+test.text+body+body;
  assert.equal(service.import(input).status,'READY');
  assert.equal(service.state.units[0].canonicalUnitId,test.unit);
  assert.equal(service.state.units[1].canonicalUnitId,'unit-ba-6903525e7ae0497e943a');
  service.attach('parsed-unit-1','parsed-unit-2');
  const effective=service.effective('parsed-unit-2');
  const melee=effective.weapons.filter(w=>w.fields.some(field=>field.label==='mode'&&field.value==='melee'));
  assert.ok(melee.length,'Non-vacuous physically selected melee inventory');
  for(const weapon of melee){
    assert.ok(weapon.fields.find(field=>field.label==='abilities').value.includes(test.ability));
    assert.ok(weapon.abilitySources?.some(source=>source.canonicalRuleId===test.rule&&source.sourceInstanceId==='parsed-unit-1'));
  }
  const variants=projectInstanceCards(cards,service.state.units[1],effective);
  assert.ok(melee.every(weapon=>variants.get(weapon.id).some(card=>card.fields.some(field=>
    field.value===test.ability&&field.weaponGrantSources?.some(source=>source.canonicalRuleId===test.rule)))));
  assert.ok(effective.weapons.filter(w=>!melee.includes(w)).every(w=>!w.abilitySources?.some(source=>source.canonicalRuleId===test.rule)));
  assert.ok(service.effective('parsed-unit-3').weapons.every(w=>!w.abilitySources?.some(source=>source.canonicalRuleId===test.rule)));
  if(test.id==='lemartes')assert.ok(service.effective('parsed-unit-1').weapons.every(w=>
    !w.abilitySources?.some(source=>source.canonicalRuleId===test.rule)),'Intrinsic crozius LETHAL HITS must not invent Fury Unbound grant attribution');
  const snapshot=service.snapshot(),projection=clone(service.projection),points=clone(service.points);
  service.recompute();assert.deepEqual(service.effective('parsed-unit-2'),effective);
  service.load(JSON.parse(JSON.stringify(snapshot)));assert.deepEqual(service.projection,projection);assert.deepEqual(service.points,points);
  assert.equal(service.import(input).status,'READY');assert.deepEqual(service.snapshot(),snapshot);
  service.detach('parsed-unit-1');assert.ok(service.effective('parsed-unit-2').weapons.every(w=>
    !w.abilitySources?.some(source=>source.canonicalRuleId===test.rule)));
  service.reattach('parsed-unit-1','parsed-unit-2');assert.deepEqual(service.effective('parsed-unit-2'),effective);
});

function statFixture(nested){
  const f=weaponFixture(nested),model=f.raw.profiles[0];
  delete f.effect.ability;
  Object.assign(f.effect,{operation:'MODIFY_STAT',field:'T',mode:'ADD',value:1});
  Object.assign(f.trace,{operation:'MODIFY_STAT',field:'T',before:'4',after:'5',targetWeaponProfileId:null});
  delete f.trace.targetWeaponSelectionKey;delete f.trace.targetWeaponScopeId;
  (model.profile.stats||model.profile).T='5';
  return f;
}
for(const nested of [false,true]){
  check('stat-source-physical-recipient-'+nested,()=>{
    const f=statFixture(nested),before=clone(f.projection);
    const effective=projectEffectiveInstance(f.model,f.projection,f.raw.instanceId);
    assert.equal(effective.statSources?.length,1);
    const source=effective.statSources[0],profile=effective.profiles[0];
    assert.equal(source.canonicalRuleId,f.origin.id);
    assert.notEqual(source.canonicalRuleId,source.ruleId,'Canonical source must not collapse to wrapper');
    assert.equal(source.targetInstanceId,f.raw.instanceId);
    assert.equal(source.targetProfileId,profile.id);
    assert.equal(source.targetCompositionId,profile.scopeId);
    assert.equal(source.before,'4');assert.equal(source.after,'5');
    const value=profile.fields.find(field=>field.label===(nested?'stats':'T')).value;
    assert.equal(nested?value.T:value,'5','Attribution does not recalculate the effective value');
    const variants=projectInstanceCards(f.cards,f.unit,effective),card=variants.get(profile.id).find(c=>c.scopeId===profile.scopeId);
    assert.ok(card.fields.some(field=>field.source?.path===(nested?'/stats/T':'/T')&&field.value==='5'));
    assert.equal(projectEffectiveInstance(f.model,f.projection,f.peer.instanceId).statSources,undefined);
    assert.deepEqual(f.projection,before,'Attribution must leave numeric traces and physical projection unchanged');
    assert.deepEqual(projectEffectiveInstance(f.model,clone(f.projection),f.raw.instanceId),effective);
  });
  check('intrinsic-stat-has-no-source-'+nested,()=>{
    const f=statFixture(nested);f.raw.applied=[];
    assert.equal(projectEffectiveInstance(f.model,f.projection,f.raw.instanceId).statSources,undefined);
  });
  for(const [name,alter]of [
    ['missing-stat-effect',f=>f.trace.effectId='missing'],
    ['wrong-characteristic',f=>f.effect.field='W'],
    ['missing-stat-origin',f=>f.effect.referencedRuleId='missing'],
    ['contradictory-stat-origin',f=>f.effect.provenance.canonicalRuleId=f.rule.id]
  ])check('reject-'+name+'-'+nested,()=>{
    const f=statFixture(nested);alter(f);
    assert.throws(()=>projectEffectiveInstance(f.model,f.projection,f.raw.instanceId),/attribution|origin/);
  });
}
check('native-blood-chalice-numeric-source-and-lifecycle',()=>{
  const rule='ability-ba-630ec2727ede4d3f85a2';
  assert.ok(book.entities.find(e=>e.id===rule).data.text.includes('This unit has +1 T.'));
  // Exact source composition, with omitted loadout left unknown. No points or
  // weapon selection is invented to test a static MODEL Toughness modifier.
  const intercessors='5x Intercessor Squad (9999 pts)\n• 1x Intercessor Sergeant\n• 4x Intercessor\n';
  const input=header+'1x Sanguinary Priest (9999 pts)\n• 1x Sanguinary Priest\n'+intercessors+intercessors;
  const service=createBloodAngelsRosterService(book);
  assert.equal(service.import(input).status,'READY');
  assert.equal(service.state.units[0].canonicalUnitId,'unit-ba-1388b9b0dc5d40c1aba4');
  assert.equal(service.state.units[1].canonicalUnitId,'unit-sm-59162946fee84360');
  const toughness=id=>service.effective(id).profiles.map(profile=>profile.fields.find(field=>field.label==='stats').value.T);
  assert.ok(toughness('parsed-unit-2').every(value=>value==='5'),'Independent source base T5');
  service.attach('parsed-unit-1','parsed-unit-2');
  const effective=service.effective('parsed-unit-2'),snapshot=service.snapshot(),projection=clone(service.projection),points=clone(service.points);
  assert.ok(toughness('parsed-unit-1').every(value=>value==='6'));
  assert.ok(toughness('parsed-unit-2').every(value=>value==='6'));
  assert.ok(toughness('parsed-unit-3').every(value=>value==='5'));
  for(const profile of effective.profiles){
    const sources=effective.statSources?.filter(source=>source.targetCompositionId===profile.scopeId&&source.field==='T');
    assert.equal(sources?.length,1);
    assert.equal(sources[0].canonicalRuleId,rule);assert.equal(sources[0].sourceInstanceId,'parsed-unit-1');
    assert.equal(sources[0].before,'5');assert.equal(sources[0].after,'6');
  }
  assert.ok(!service.effective('parsed-unit-3').statSources?.some(source=>source.canonicalRuleId===rule));
  const variants=projectInstanceCards(cards,service.state.units[1],effective);
  assert.ok(effective.profiles.every(profile=>variants.get(profile.id).some(card=>card.scopeId===profile.scopeId&&
    card.fields.some(field=>field.source?.path==='/stats/T'&&field.value==='6'))));
  service.recompute();assert.deepEqual(service.effective('parsed-unit-2'),effective);
  service.load(JSON.parse(JSON.stringify(snapshot)));assert.deepEqual(service.projection,projection);assert.deepEqual(service.points,points);
  assert.equal(service.import(input).status,'READY');assert.deepEqual(service.snapshot(),snapshot);
  service.detach('parsed-unit-1');assert.ok(toughness('parsed-unit-2').every(value=>value==='5'));
  assert.ok(!service.effective('parsed-unit-2').statSources?.some(source=>source.canonicalRuleId===rule));
  service.reattach('parsed-unit-1','parsed-unit-2');assert.deepEqual(service.effective('parsed-unit-2'),effective);
});

console.log(JSON.stringify({status:results.some(row=>row.status==='FAIL')?'FAIL':'PASS',
  checks:results.length,passed:results.filter(row=>row.status==='PASS').length,
  failed:results.filter(row=>row.status==='FAIL').length,results,
  fixtures:'SYNTHETIC_AND_CONSTRUCTED_NATIVE_DIAGNOSTICS',realNewRecruitExportTested:false},null,2));
if(results.some(row=>row.status==='FAIL'))process.exitCode=1;

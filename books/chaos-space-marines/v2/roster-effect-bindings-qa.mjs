/** Independent high-risk binding controls. Explicit canonical fixture state;
 * no importer, title matching, or legacy factual input. */
import assert from 'node:assert/strict';
import {buildCSMRosterEffectBook} from './roster-effect-build.mjs';
import {evaluateCSMRosterDeclarations,createCSMRosterEffectContext} from './roster-effect-context.mjs';
import {formRoster,predicateContext} from '../../shared/roster-v2/context.mjs';

const book=buildCSMRosterEffectBook(), original=JSON.stringify(book), clone=structuredClone;
const records=new Map(book.entities.map(e=>[e.id,e]));
const checks=[],failures=[];
function test(name,run){try{run();checks.push(name);}catch(error){failures.push({name,error:error.message});}}
function physical(instanceId,canonicalUnitId,enhancementIds=[]){
  const unit=records.get(canonicalUnitId);
  assert.equal(unit?.kind,'DATASHEET');
  const modelRows=unit.data.profileIds.map((canonicalProfileId,i)=>{
    const quantity=records.get(canonicalProfileId).data.composition.quantity.min;
    return {rowId:`row-${i}`,canonicalProfileId,quantity,compositionScope:'MODEL_ROW',loadouts:[],
      selections:unit.data.weaponIds.map(id=>({selectionKey:id,canonicalProfileIds:[id],canonicalEquipmentIds:[],physicalQuantity:quantity}))};
  });
  return {instanceId,canonicalUnitId,startingStrength:modelRows.reduce((n,r)=>n+r.quantity,0),modelRows,
    selections:[],enhancementIds,warlord:null};
}
function state(detachment,units,attachments=[]){return {schema:'roster-v2/roster',bookId:book.bookId,
  rosterId:'csm-independent-binding-controls',detachmentIds:[`detachment-${detachment}`],units,attachments,warlordInstanceId:null};}
function assigned(input,ruleId,unitIndex=0,profileIndex=0){
  const scope=formRoster(book,input).units[unitIndex].profiles[profileIndex].scopeId;
  input.units[unitIndex].enhancementAssignments=[{enhancementId:ruleId,modelScopeId:scope}];return input;
}
const applied=(projection,ruleId)=>projection.units.flatMap(u=>u.applied).filter(a=>a.ruleId===ruleId);
const unit=(projection,id)=>projection.units.find(u=>u.instanceId===id);
const characteristic=(projection,id,key)=>{const p=unit(projection,id).profiles[0].profile;return p.stats?.[key]??p[key];};
const outputs=(input,activeBook=book)=>evaluateCSMRosterDeclarations(activeBook,input);
const edge=(leaderInstanceId,bodyguardInstanceId)=>({leaderInstanceId,bodyguardInstanceId,role:'LEADER'});
function withoutRow(input,unitIndex,rowIndex){const u=input.units[unitIndex];u.modelRows.splice(rowIndex,1);u.startingStrength=u.modelRows.reduce((n,r)=>n+r.quantity,0);}

test('Exact selected canonical Mark enables only its physical Enhancement owner',()=>{
  const id='detachment-pactbound-zealots:enhancement:2';
  const input=assigned(state('pactbound-zealots',[physical('a','unit-dark-apostle',[id]),physical('b','unit-dark-apostle')]),id);
  input.units[0].selectedMarkId='detachment-pactbound-zealots:rule:mark:4';
  const yes=outputs(input);assert.ok(applied(yes,id).length);assert.ok(applied(yes,id).every(a=>a.sourceInstanceId==='a'));
  input.units[0].selectedMarkId=null;assert.equal(applied(outputs(input),id).length,0);
  input.units[0].selectedMarkId='detachment-pactbound-zealots:rule:mark:3';assert.equal(applied(outputs(input),id).length,0);
  delete input.units[0].selectedMarkId;assert.equal(applied(outputs(input),id).length,0);
});
test('Unknown/title/foreign Mark selection fails closed',()=>{
  for(const mark of ['SLAANESH','datasheet-heretic-astartes-daemon-prince:section:3:option:4',{},42]){
    const input=state('pactbound-zealots',[physical('a','unit-dark-apostle')]);input.units[0].selectedMarkId=mark;
    assert.throws(()=>outputs(input),/selected canonical Mark/);
  }
});
test('Source-excluded Khorne PSYKER and EPIC HERO Mark assignments rejected',()=>{
  for(const canonicalUnitId of ['unit-master-of-possession','unit-abaddon-the-despoiler']){
    const input=state('pactbound-zealots',[physical('a',canonicalUnitId)]);
    input.units[0].selectedMarkId='detachment-pactbound-zealots:rule:mark:1';
    assert.throws(()=>outputs(input),/Source-excluded selected Mark/);
  }
});
for(const prince of ['heretic-astartes-daemon-prince','heretic-astartes-daemon-prince-with-wings']){
  test(`Canonical selected Allegiance identity and physical isolation: ${prince}`,()=>{
    const rule=`datasheet-${prince}:section:3:option:3`,input=state('renegade-raiders',[
      physical('a',`unit-${prince}`),physical('b',`unit-${prince}`)]);
    input.units[0].selectedUpgradeIds=[rule];input.units[1].selectedUpgradeIds=[];
    const yes=outputs(input),profileData=records.get(input.units[0].modelRows[0].canonicalProfileId).data,base=(profileData.stats||profileData).T;
    assert.equal(Number.parseInt(characteristic(yes,'a','T')),Number.parseInt(base)+1);
    assert.equal(String(characteristic(yes,'b','T')),String(base));
    input.units[0].selectedUpgradeIds=[];assert.equal(applied(outputs(input),rule).length,0);
    input.units[0].modelRows[0].selectedUpgradeIds=[rule];assert.ok(applied(outputs(input),rule).length);
  });
}
test('Malformed, duplicate, competing, foreign and ambiguous Upgrade choices rejected',()=>{
  const prefix='datasheet-heretic-astartes-daemon-prince:section:3:option:';
  for(const choice of [prefix+'3',[prefix+'3',prefix+'3'],[prefix+'3',prefix+'4'],['NURGLE'],
    ['datasheet-heretic-astartes-daemon-prince-with-wings:section:3:option:3']]){
    const input=state('renegade-raiders',[physical('a','unit-heretic-astartes-daemon-prince')]);
    input.units[0].selectedUpgradeIds=choice;assert.throws(()=>outputs(input),/canonical Upgrade/);
  }
  const input=state('renegade-raiders',[physical('a','unit-heretic-astartes-daemon-prince')]);
  input.units[0].startingStrength=2;input.units[0].modelRows[0].quantity=2;
  input.units[0].selectedUpgradeIds=[prefix+'3'];assert.throws(()=>outputs(input),/Ambiguous MODEL Upgrade ownership/);
  const repeated=state('renegade-raiders',[physical('a','unit-heretic-astartes-daemon-prince')]);
  const u=repeated.units[0];u.startingStrength=2;u.modelRows.push({...clone(u.modelRows[0]),rowId:'separate-physical-row'});
  u.modelRows[0].selectedUpgradeIds=[prefix+'3'];u.modelRows[1].selectedUpgradeIds=[];
  assert.throws(()=>outputs(repeated),/Ambiguous MODEL Upgrade ownership/,
    'Singleton-only canonical upgrade cannot use repeated canonical-profile rows as bearer identity');
});

const scoutsId='detachment-chaos-cult:enhancement:4';
function scoutsFixture(){return assigned(state('chaos-cult',[physical('leader','unit-dark-commune',[scoutsId]),
  physical('bodyguard','unit-accursed-cultists'),physical('unrelated','unit-accursed-cultists')],[edge('leader','bodyguard')]),scoutsId);}
test('Scouts prerequisite uses canonical identity and exact distance, not captions',()=>{
  const input=scoutsFixture();assert.ok(applied(outputs(input),scoutsId).length);
  for(const ability of [{canonicalId:'core-scouts',name:'Scouts',parameters:{distance:9}},
    {canonicalId:'synthetic-independent-scouts',name:'Scouts',parameters:{distance:6}}]){
    const changed=clone(book);changed.rosterReferenceSemantics['datasheet-accursed-cultists:rule-reference:2'].abilities=[ability];
    assert.equal(applied(outputs(input,changed),scoutsId).length,0);
  }
  const changed=clone(book);changed.rosterReferenceSemantics['datasheet-accursed-cultists:rule-reference:2'].abilities[0].name='Unrelated display caption';
  assert.ok(applied(outputs(input,changed),scoutsId).length);
  input.attachments=[];assert.equal(applied(outputs(input),scoutsId).length,0);
});
test('Scouts does not leak to unrelated physical recipient',()=>{
  const input=scoutsFixture(),yes=outputs(input);
  assert.equal(unit(yes,'unrelated').applied.filter(a=>a.ruleId===scoutsId).length,0);
  assert.ok(unit(yes,'bodyguard').profiles.every(p=>p.abilities.some(a=>a.canonicalId==='core-scouts'&&a.parameters.distance===6)));
});
test('One bodyguard profile with Scouts does not establish UNIT-wide Scouts prerequisite',()=>{
  const input=scoutsFixture(),projection=formRoster(book,input),bodyguard=unit(projection,'bodyguard');
  bodyguard.abilities=[];bodyguard.profiles.forEach(p=>p.abilities=[]);
  bodyguard.profiles[0].abilities=[{canonicalId:'core-scouts',name:'Scouts',parameters:{distance:6}}];
  const predicate={predicate:'FIELD',subject:'MODEL',contextLevel:'ROSTER',
    arguments:{key:`ledBodyguardHasScouts6:${scoutsId}`,equals:true}};
  const context=predicateContext(input,projection,'leader','MODEL',unit(projection,'leader').profiles[0].scopeId);
  const api=createCSMRosterEffectContext(book,input,{abilityProjection:projection});
  assert.equal(api.evaluatePredicate(predicate,context),'FALSE');
  bodyguard.profiles.forEach(p=>p.abilities=[{canonicalId:'core-scouts',name:'Scouts',parameters:{distance:6}}]);
  assert.equal(api.evaluatePredicate(predicate,context),'TRUE');
});

test('Intrinsic 4+ invulnerable save is never downgraded by bearer-unit 5+',()=>{
  const id='detachment-murdertalon-raiders:enhancement:1';
  const input=assigned(state('murdertalon-raiders',[physical('a','unit-chaos-lord-with-jump-pack',[id]),
    physical('b','unit-chaos-lord-with-jump-pack')]),id);
  const yes=outputs(input);assert.equal(characteristic(yes,'a','INSV'),'4+');
  assert.equal(characteristic(yes,'b','INSV'),'4+');
});
test('Intrinsic stronger saves preserved under global SOUL FORGE grant',()=>{
  const input=state('cult-of-the-arkifane',[physical('discordant','unit-lord-discordant-on-helstalker'),
    physical('vashtorr','unit-vashtorr-the-arkifane'),physical('helbrute','unit-helbrute')]);
  const yes=outputs(input);
  for(const id of ['discordant','vashtorr'])assert.equal(characteristic(yes,id,'INSV'),'4+');
  assert.equal(characteristic(yes,'helbrute','INSV'),'5+');
});
test('Cult Demagogue exact canonical profile presence controls invulnerable grant',()=>{
  const rule='datasheet-dark-commune:section:1:block:0:text';
  const input=state('renegade-raiders',[physical('leader','unit-dark-commune'),physical('bodyguard','unit-accursed-cultists')],
    [edge('leader','bodyguard')]);
  assert.ok(applied(outputs(input),rule).length);
  withoutRow(input,0,0);assert.equal(applied(outputs(input),rule).length,0);
  input.attachments=[];assert.equal(applied(outputs(input),rule).length,0);
});
test('Fabius requires explicit matching initial attachment and bodyguard scope',()=>{
  const id='datasheet-fabius-bile:section:1:block:0:text';
  const input=state('renegade-raiders',[physical('leader','unit-fabius-bile'),physical('bodyguard','unit-legionaries'),
    physical('other','unit-legionaries')],[edge('leader','bodyguard')]);
  assert.equal(applied(outputs(input),id).length,0,'Current attachment must not invent initial attachment');
  input.initialAttachments=[];assert.equal(applied(outputs(input),id).length,0);
  input.initialAttachments=[edge('leader','bodyguard')];
  const yes=outputs(input);assert.ok(applied(yes,id).length);
  assert.equal(unit(yes,'leader').applied.filter(a=>a.ruleId===id).length,0);
  assert.equal(unit(yes,'other').applied.filter(a=>a.ruleId===id).length,0);
  input.attachments=[edge('leader','other')];assert.equal(applied(outputs(input),id).length,0);
  input.attachments=[];assert.equal(applied(outputs(input),id).length,0);
  input.attachments=[edge('leader','bodyguard')];assert.ok(applied(outputs(input),id).length);
});
test('Enhanced Warriors changes only Bodyguard models with Fabius and an attached Support character',()=>{
  const id='datasheet-fabius-bile:section:1:block:0:text';
  const input=state('renegade-raiders',[physical('leader','unit-fabius-bile'),physical('bodyguard','unit-legionaries'),
    physical('support','unit-master-of-executions'),physical('other','unit-legionaries')],
    [edge('leader','bodyguard'),{leaderInstanceId:'support',bodyguardInstanceId:'bodyguard',role:'SUPPORT'}]);
  input.initialAttachments=clone(input.attachments);
  const base=formRoster(book,input),yes=outputs(input),rows=applied(yes,id);
  for(const clauseId of ['bodyguard-melee-strength','bodyguard-toughness']){
    const found=rows.filter(row=>row.clauseId===clauseId);
    assert.ok(found.length,'Enhanced Warriors clause did not execute: '+clauseId);
    assert.ok(found.every(row=>row.targetInstanceId==='bodyguard'),'Enhanced Warriors escaped the physical Bodyguard component');
  }
  for(const instanceId of ['leader','support','other']){
    assert.equal(unit(yes,instanceId).applied.filter(row=>row.ruleId===id).length,0);
    for(const profile of unit(yes,instanceId).profiles){
      const original=unit(base,instanceId).profiles.find(row=>row.scopeId===profile.scopeId);
      assert.equal(profile.profile.stats?.T??profile.profile.T,original.profile.stats?.T??original.profile.T);
      assert.deepEqual(profile.weapons.map(weapon=>weapon.data.strength),original.weapons.map(weapon=>weapon.data.strength));
    }
  }
  for(const profile of unit(yes,'bodyguard').profiles){
    const original=unit(base,'bodyguard').profiles.find(row=>row.scopeId===profile.scopeId);
    assert.equal(Number(profile.profile.stats?.T??profile.profile.T),Number(original.profile.stats?.T??original.profile.T)+1);
    for(const weapon of profile.weapons.filter(row=>row.data.mode==='melee')){
      const source=original.weapons.find(row=>row.canonicalProfileId===weapon.canonicalProfileId&&row.selectionKey===weapon.selectionKey);
      assert.ok(source);assert.equal(Number(weapon.data.strength),Number(source.data.strength)+1);
    }
  }
});

test('Malformed or source-illegal initial attachment fails closed',()=>{
  const input=state('renegade-raiders',[physical('leader','unit-fabius-bile'),physical('bodyguard','unit-legionaries')]);
  for(const edges of [{},[edge('missing','bodyguard')],[edge('leader','leader')],
    [edge('leader','bodyguard'),edge('leader','bodyguard')]]){
    input.initialAttachments=edges;assert.throws(()=>outputs(input),/initial.*attachment/);
  }
  const illegal=state('renegade-raiders',[physical('leader','unit-fabius-bile'),physical('bodyguard','unit-chaos-lord')]);
  illegal.initialAttachments=[edge('leader','bodyguard')];assert.throws(()=>outputs(illegal),/Source-illegal initial attachment/);
});
test('Binding evaluation preserves canonical book immutability and determinism',()=>{
  assert.equal(JSON.stringify(book),original);
  const input=scoutsFixture();assert.deepEqual(outputs(input),outputs(input));assert.equal(JSON.stringify(book),original);
});
console.log(JSON.stringify({status:failures.length?'FAIL':'PASS',guards:checks.length,checks,failures},null,2));
assert.equal(failures.length,0,'Independent CSM binding controls failed');

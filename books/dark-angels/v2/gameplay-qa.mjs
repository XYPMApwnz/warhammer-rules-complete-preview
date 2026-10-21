/** Independent source-authored Stage 3A expectations over constructed physical
 * snapshots. This proves native projections, never NR exports or browser UI.
 * Diagnostic attachment policies below test scope, not source legality. */
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {buildDarkAngelsContracts} from './rule-contract-build.mjs';
import {buildGameplayPresentation} from './gameplay-presentation-build.mjs';
import {createDarkAngelsRuleSchema} from './rule-contract-schema.mjs';
import {createDarkAngelsRosterRuntime} from './roster-runtime.mjs';
import {validateRoster,formRoster,changeAttachment,predicateContext} from '../../shared/roster-v2/context.mjs';
import {executeRosterEffects} from '../../shared/roster-v2/effects.mjs';
import {projectEffectiveInstance} from '../../shared/roster-v2/effective-instance.mjs';
import {projectInstanceCards,projectPersonalBook,projectFormedUnitCards} from '../../shared/army-book-app-v2/personal.mjs';
import {projectAbilityPresentation} from '../../shared/army-book-app-v2/ability-presentation.mjs';

const read=name=>JSON.parse(fs.readFileSync(new URL(name,import.meta.url),'utf8'));
const clone=structuredClone;
const ID={azrael:'unit-da-f8f0629206e744459a9f',ezekiel:'unit-da-955db164dd7144368578',
  companions:'unit-da-6b2744f187a748cda0df',command:'unit-da-467009b00bb9402dadee',
  sammael:'unit-da-0e189995095847bf9d47',knights:'unit-da-a1d3821fd56946f0951d',
  intercessors:'unit-sm-59162946fee84360',darkflight:'detachment-da-d7c1a2b23f2e443aa22a',
  wrath:'detachment-da-5a438082b8a74f8e8e08',inner:'detachment-da-7e310c5c15914267a0ae',
  ancient:'model-da-9bdc9ba0422949849ecc',champion:'model-da-d9a85659ae224494b0a7'};
const cases=[
  {id:'azrael-sustained',rule:'ability-da-7cd58c9465f544f08e8b',unit:ID.azrael,
    quote:'This unit’s attacks have [SUSTAINED HITS 1].',expect:{weaponAbility:'SUSTAINED HITS 1'}},
  {id:'ezekiel-book',rule:'ability-da-594a7ae294c948b39173',unit:ID.ezekiel,
    quote:'This unit’s melee attacks have +1 A.',expect:{weaponStats:{attacks:1},mode:'melee'}},
  {id:'braziers-stealth',rule:'ability-da-6fefb0cfda4848bf9dd1',unit:ID.companions,
    quote:'This unit has Stealth.',expect:{unitAbility:'core-stealth'}},
  {id:'lion-helm',rule:'ability-da-95887a48130640feaf11',unit:ID.azrael,
    quote:'This unit has 4+ InSv.',equipment:true,formation:true,expect:{invulnerable:4}},
  {id:'ancient-weapons',rule:'enhancement-da-9dcd451b895a4cfea19f',unit:'unit-sm-99eb03d4f2d448e2',det:ID.wrath,enhancement:true,
    quote:'This model’s melee attacks:\n- Have +2 S.\n- Have +1 AP.',
    expect:{weaponStats:{strength:2,ap:-1},mode:'melee',modelOnly:true}},
  {id:'darkflight-cover',rule:'detachment-rule-da-6a259c00bc9f4bf498ee',unit:ID.sammael,det:ID.darkflight,global:true,
    quote:'Friendly RAVENWING FLY units’ ranged attacks have [IGNORES COVER].',
    expect:{weaponAbility:'IGNORES COVER',mode:'ranged'}},
  {id:'darkflight-battleline',rule:'detachment-rule-da-6a259c00bc9f4bf498ee',unit:null,det:ID.darkflight,global:true,
    quote:'Friendly OUTRIDER SQUAD units have BATTLELINE.',expect:{unitKeyword:'BATTLELINE'}},
  {id:'ravenwing-banner',rule:'ability-da-4d1396f4342347baa772',unit:ID.command,
    quote:'While this unit contains a RAVENWING ANCIENT, this unit has +1 OC.',expect:{oc:1}},
  {id:'ravenwing-champion-charge',rule:'ability-da-61ae3e245d824682a480',unit:ID.command,
    quote:'This unit has +1 to advance rolls and charge rolls.',expect:{charge:1}}
];
const allWeapons=unit=>[...unit.weapons,...unit.profiles.flatMap(profile=>profile.weapons)];
const stat=(profile,key)=>profile.profile.stats?.[key]??profile.profile[key];
const numeric=(value,delta)=>{
  const raw=String(value),fixed=raw.match(/^(-?\d+)(["+]?)$/);
  if(fixed)return String(Number(fixed[1])+delta)+fixed[2];
  const dice=raw.match(/^(\d*D\d+)(?:\+(\d+))?$/i);assert.ok(dice,'Unreviewed numeric source '+raw);
  const n=Number(dice[2]||0)+delta;return dice[1]+(n?'+'+n:'');
};
const unitTrace=(projection,instance,rule)=>projection.units.find(unit=>unit.instanceId===instance).applied.filter(row=>row.ruleId===rule);

export function runDarkAngelsGameplayQA(built=buildDarkAngelsContracts()){
  const {book,schema}=built,payload=buildGameplayPresentation(built),cards=new Map(payload.cards.map(card=>[card.id,card]));
  const facts=read('./generated/effective.json'),smFacts=read('../../space-marines/v2/generated/effective.json');
  const originalFacts=JSON.stringify([facts,smFacts]),sources=new Map([...facts.entities,...smFacts.entities].map(row=>[row.id,row]));
  const records=new Map(book.entities.map(row=>[row.id,row]));
  // This UNIT ID is proven through its reviewed inherited source record, not a
  // physical keyword inferred from its title during execution.
  const outrider=sources.get('unit-sm-0dd92e6d8ad54ee6');assert.equal(outrider.kind,'DATASHEET');
  assert.equal(outrider.data.title,'Outrider Squad');assert.equal(outrider.bookId,'space-marines');assert.ok(records.has(outrider.id));
  const scenarios=cases.map(row=>({...row,unit:row.unit||outrider.id}));
  const checks=[],mutations=[],scenarioResults=[],inheritedResults=[];
  const check=(id,fn)=>{fn();checks.push({id,status:'PASS'});};
  const reject=(id,fn)=>{assert.throws(fn,undefined,id);mutations.push(id);};
  function physical(instanceId,unitId,{enhancement,equipment=false,double=false,omit=[]}={}){
    const source=records.get(unitId);assert.equal(source?.kind,'DATASHEET');
    const rows=source.data.profileIds.filter(profile=>!omit.includes(profile)).map((profileId,n)=>({rowId:'row-'+n,
      canonicalProfileId:profileId,quantity:1,compositionScope:'MODEL_ROW',
      selections:source.data.weaponIds.map((weaponId,w)=>({selectionKey:`${instanceId}/${n}/weapon/${w}`,
        canonicalProfileIds:[weaponId],canonicalEquipmentIds:[],physicalQuantity:1,perModelQuantity:1}))}));
    if(double){const other=clone(rows[0]);other.rowId='separate-identical-model';other.selections=other.selections.map((s,n)=>({...s,selectionKey:instanceId+'/other/'+n}));rows.push(other);}
    const unit={instanceId,canonicalUnitId:unitId,startingStrength:rows.length,modelRows:rows,selections:[],
      equipmentContextKnown:true,enhancementIds:enhancement?[enhancement]:[],warlord:null};
    if(enhancement)unit.enhancementAssignments=[{enhancementId:enhancement,modelScopeId:instanceId+'/row-0/PROFILE/row-0'}];
    if(equipment){
      const binding=book.rosterEquipmentCaptionBindings.find(row=>row.ownerId===unitId&&row.canonicalEquipmentIds.includes('ability-da-95887a48130640feaf11'));
      assert.ok(binding,'Missing source-owned Lion Helm binding');
      unit.selections.push({selectionKey:instanceId+'/unit-equipment',physicalQuantity:1,canonicalProfileIds:[],
        canonicalEquipmentIds:clone(binding.canonicalEquipmentIds),canonicalFieldPaths:clone(binding.canonicalFieldPaths),sourceReferences:clone(binding.sourceReferences)});
    }
    return unit;
  }
  const roster=(units,det=ID.inner)=>({schema:'roster-v2/roster',bookId:'dark-angels',rosterId:'da-stage3a-source-diagnostic',
    detachments:[{instanceId:'detachment/diagnostic',canonicalDetachmentId:det}],detachmentIds:[det],units,attachments:[],warlordInstanceId:null});
  const policy=source=>({sourceId:source,targetId:ID.intercessors,role:'LEADER',sourceIds:[],additionalLeaders:0});
  const project=(state,model=book,policies=[])=>{
    const verified=validateRoster(model,clone(state),policies);
    return {state:verified,projection:executeRosterEffects(model,verified,createDarkAngelsRuleSchema({state:verified,book:{...model,rosterAttachmentPolicies:policies}}))};
  };
  function fixture(row){
    const state=roster([physical('source',row.unit,{enhancement:row.enhancement?row.rule:null,equipment:row.equipment,double:row.enhancement}),
      physical('peer',row.unit),physical('unrelated',ID.intercessors)],row.det||ID.inner),policies=[];
    if(row.formation){policies.push(policy(row.unit));state.attachments.push({leaderInstanceId:'source',bodyguardInstanceId:'unrelated',role:'LEADER'});}
    return {state,policies};
  }
  function assertExpected(row,state,projection){
    const unit=projection.units.find(unit=>unit.instanceId==='source'),base=formRoster(book,state).units.find(unit=>unit.instanceId==='source');
    const expected=row.expect;
    if(expected.weaponAbility||expected.weaponStats){
      const affected=allWeapons(unit).filter(w=>(!expected.mode||w.data.mode===expected.mode)&&(!expected.modelOnly||w.scopeId===unit.profiles[0].scopeId));
      assert.ok(affected.length,'Empty positive weapons '+row.id);
      for(const weapon of affected){
        const before=allWeapons(base).find(w=>w.scopeId===weapon.scopeId&&w.selectionKey===weapon.selectionKey&&w.canonicalProfileId===weapon.canonicalProfileId);assert.ok(before);
        if(expected.weaponAbility)assert.ok(weapon.data.abilities.some(a=>a.toUpperCase()===expected.weaponAbility),row.id+' granted ability');
        for(const [key,delta]of Object.entries(expected.weaponStats||{}))assert.equal(String(weapon.data[key]),numeric(before.data[key],delta),row.id+' '+key);
      }
      for(const weapon of allWeapons(unit).filter(w=>expected.mode&&w.data.mode!==expected.mode||expected.modelOnly&&w.scopeId!==unit.profiles[0].scopeId)){
        const before=allWeapons(base).find(w=>w.scopeId===weapon.scopeId&&w.selectionKey===weapon.selectionKey&&w.canonicalProfileId===weapon.canonicalProfileId);
        for(const key of Object.keys(expected.weaponStats||{}))assert.equal(weapon.data[key],before.data[key],row.id+' leaked weapon field '+key);
        if(expected.weaponAbility)assert.equal(weapon.data.abilities.includes(expected.weaponAbility),before.data.abilities.includes(expected.weaponAbility),'Wrong weapon mode affected');
      }
    }
    if(expected.unitAbility)assert.ok(unit.abilities?.some(ability=>ability.canonicalId===expected.unitAbility));
    if(expected.unitKeyword){assert.ok(unit.keywords.includes(expected.unitKeyword));assert.ok(unit.profiles.every(model=>!model.keywords.includes(expected.unitKeyword)),'UNIT keyword leaked to MODEL');}
    if(expected.oc)for(const model of unit.profiles){const before=base.profiles.find(p=>p.scopeId===model.scopeId);assert.equal(String(stat(model,'OC')),numeric(stat(before,'OC'),expected.oc));}
    if(expected.charge){assert.equal(unit.metrics.chargeRoll?.modifier,1);assert.ok(unit.profiles.every(model=>!model.metrics.chargeRoll),'UNIT Charge mirrored to MODEL');}
    if(expected.invulnerable){
      const bodyguard=projection.units.find(unit=>unit.instanceId==='unrelated');
      for(const model of [...unit.profiles,...bodyguard.profiles])assert.equal(Number.parseInt(stat(model,'INSV')),4);
      assert.ok(unitTrace(projection,'unrelated',row.rule).length,'UNIT-wide shield must affect formed bodyguard');
    }else assert.ok(unitTrace(projection,'source',row.rule).length,'Missing physical applied source '+row.id);
    assert.deepEqual(allWeapons(unit).map(w=>[w.scopeId,w.selectionKey,w.canonicalProfileId,w.physicalQuantity]),allWeapons(base).map(w=>[w.scopeId,w.selectionKey,w.canonicalProfileId,w.physicalQuantity]),'Changed physical weapon quantities');
  }
  check('source-independent-nine-lowerings',()=>{
    assert.equal(scenarios.length,9);
    for(const row of scenarios)assert.ok(sources.get(row.rule)?.data.text.includes(row.quote),'Independent accepted source expectation changed '+row.id);
    const executable=book.entities.filter(e=>e.bookId==='dark-angels'&&e.kind!=='ARMY_RULE').flatMap(e=>(e.ruleContract?.clauses||[]).filter(c=>c.rosterEffects.length).map(c=>({rule:e.id,clause:c.id})));
    assert.equal(executable.length,9,'Independent lowering denominator differs');
    assert.equal(built.artifact.executed.length,15,'Nine original and six separately tested army clauses required');
    assert.deepEqual([...new Set(executable.map(row=>row.rule))].sort(),[...new Set(scenarios.map(row=>row.rule))].sort());
  });
  for(const row of scenarios){
    const {state,policies}=fixture(row);let result;
    check(row.id+'-positive',()=>{result=project(state,book,policies);assertExpected(row,result.state,result.projection);});
    check(row.id+'-physical-isolation-and-provenance',()=>{
      for(const unit of result.projection.units)for(const trace of unit.applied.filter(trace=>trace.ruleId===row.rule)){
        assert.equal(trace.targetInstanceId,unit.instanceId);assert.ok(trace.sourceFields?.length);
        if(!row.global)assert.equal(trace.sourceInstanceId,unit.instanceId==='peer'?'peer':'source');
        const source=records.get(trace.ruleId);assert.deepEqual(source.provenance,sources.get(trace.ruleId).provenance);
      }
      if(!row.global&&!['ravenwing-banner','ravenwing-champion-charge','azrael-sustained','ezekiel-book','braziers-stealth'].includes(row.id))assert.equal(unitTrace(result.projection,'peer',row.rule).length,0,row.id+': assigned/selected effect escaped to repeated Datasheet');
      if(!row.global&&!row.formation)assert.equal(unitTrace(result.projection,'unrelated',row.rule).length,0);
      if(row.global)assert.equal(unitTrace(result.projection,'unrelated',row.rule).length,0,'Detachment rule escaped eligible recipients');
    });
    check(row.id+'-effective-and-personal',()=>{
      const effective=projectEffectiveInstance(book,result.projection,'source'),variants=projectInstanceCards(cards,result.state.units[0],effective);
      assert.ok(variants.get(row.unit)?.length);assert.equal(effective.instanceId,'source');
      const guide=projectPersonalBook(payload,result.state);assert.equal(guide.instances.length,3);assert.equal(guide.instances.filter(entry=>entry.id===row.unit).length,2);
      for(const weapon of effective.weapons){const card=variants.get(weapon.id)?.find(card=>card.scopeId===weapon.scopeId&&card.selectionKey===weapon.selectionKey);assert.ok(card,'Lost physical weapon card');
        for(const key of Object.keys(row.expect.weaponStats||{}))assert.equal(card.fields.find(field=>field.source?.path==='/'+key)?.value,weapon.fields.find(field=>field.label===key)?.value,'Calculated weapon field lost in Personal');}
      if(row.expect.charge){const metric=variants.get(row.unit)[0].rosterUnitMetrics.find(metric=>metric.key==='chargeRoll');assert.equal(metric.displayValue,'+1');assert.ok(metric.sources.some(source=>source.ruleId===row.rule));}
      if(row.expect.unitAbility){const abilities=projectAbilityPresentation({instanceId:'source',profiles:effective.profiles,unitAbilities:effective.unitAbilities,applied:effective.applied});assert.ok(abilities.core.some(ability=>ability.sources?.some(source=>source.ruleId===row.rule)),'Granted ability attribution lost');}
    });
    check(row.id+'-snapshot-recompute',()=>{
      assert.deepEqual(project(result.state,book,policies).projection,result.projection);
      assert.deepEqual(project(JSON.parse(JSON.stringify(result.state)),book,policies).projection,result.projection);
    });
    if(row.global)check(row.id+'-detachment-removal',()=>{
      const changed=clone(state);changed.detachmentIds=[ID.inner];changed.detachments=[{instanceId:'changed',canonicalDetachmentId:ID.inner}];
      assert.ok(project(changed).projection.units.every(unit=>!unit.applied.some(trace=>trace.ruleId===row.rule)));
    });
    reject(row.id+'-missing-effect-mutation',()=>{
      const altered=clone(book),source=altered.entities.find(e=>e.id===row.rule);
      for(const clause of source.ruleContract.clauses){clause.rosterEffects=[];clause.rosterClassification='DISPLAY_ONLY';}
      assertExpected(row,state,project(state,altered,policies).projection);
    });
    scenarioResults.push({id:row.id,status:'PASS',ruleId:row.rule,source:sources.get(row.rule).provenance,expected:clone(row.expect),physicalFixture:state,
      sourceValidity:'CONSTRUCTED_SCOPE_DIAGNOSTIC_NOT_ARMY_LEGALITY',effectiveProjection:'PASS',personalProjection:'PASS',browserVerified:false});
  }
  for(const [name,profile,rule]of [['ancient',ID.ancient,'ability-da-4d1396f4342347baa772'],['champion',ID.champion,'ability-da-61ae3e245d824682a480']])check(name+'-physical-presence-removal',()=>{
    const state=roster([physical('source',ID.command,{omit:[profile]}),physical('peer',ID.command)]),result=project(state);
    assert.equal(unitTrace(result.projection,'source',rule).length,0,'Canonical composition was mistaken for a live physical model');
    assert.ok(unitTrace(result.projection,'peer',rule).length,'Independent complete physical squad lost its effect');
    if(name==='ancient')assert.ok(unitTrace(result.projection,'source','ability-da-61ae3e245d824682a480').length,'Ancient removal incorrectly disabled Champion');
    else assert.ok(unitTrace(result.projection,'source','ability-da-4d1396f4342347baa772').length,'Champion removal incorrectly disabled Ancient');
  });
  check('aggregate-equipment-unknown-bearer-retained-and-removal',()=>{
    const row=scenarios.find(row=>row.id==='lion-helm'),{state,policies}=fixture(row),selection=state.units[0].selections[0];
    assert.ok(!Object.hasOwn(selection,'modelInstanceId'));assert.equal(selection.physicalQuantity,1);
    const without=clone(state);without.units[0].selections=[];
    assert.equal(unitTrace(project(without,book,policies).projection,'unrelated',row.rule).length,0);
    assertExpected(row,state,project(state,book,policies).projection);
  });
  check('model-enhancement-known-bearer-only-and-remove-reselect',()=>{
    const row=scenarios.find(row=>row.id==='ancient-weapons'),{state}=fixture(row),result=project(state);
    assert.equal(result.projection.units[0].profiles.length,2);assertExpected(row,state,result.projection);
    assert.ok(unitTrace(result.projection,'source',row.rule).every(trace=>trace.targetWeaponScopeId===result.projection.units[0].profiles[0].scopeId));
    const without=clone(state);without.units[0].enhancementIds=[];without.units[0].enhancementAssignments=[];
    assert.equal(unitTrace(project(without).projection,'source',row.rule).length,0);
    assert.deepEqual(project(state).projection,result.projection);
  });
  check('ineligible-model-enhancement-does-not-execute',()=>{
    const row=scenarios.find(row=>row.id==='ancient-weapons'),altered=clone(book);
    for(const binding of altered.rosterProfileBindings.filter(binding=>binding.unitId===row.unit))binding.intrinsicKeywords=binding.intrinsicKeywords.filter(keyword=>keyword!=='ADEPTUS ASTARTES');
    const {state}=fixture(row),result=project(state,altered);
    assert.equal(unitTrace(result.projection,'source',row.rule).length,0);
  });
  check('all-eight-source-eligibility-selectors-positive-and-negative',()=>{
    const eligibility=[
      ['enhancement-da-3c2c519eaabc48088aa4',ID.sammael,'UNIT','RAVENWING'],
      ['enhancement-da-fb83cfb304e74056b819','unit-da-48fe8c59ed2449e1a36b','UNIT','EXACT_UNIT'],
      ['enhancement-da-468d9a93dc9a47f2a229',ID.ezekiel,'MODEL','ADEPTUS ASTARTES'],
      ['enhancement-da-4e1c055c3dfe4754bd0c',ID.knights,'MODEL','DEATHWING'],
      ['enhancement-da-6504b6d091f844b68c1a',ID.knights,'MODEL','DEEP_STRIKE'],
      ['enhancement-da-822dfec678424ec293c2',ID.sammael,'MODEL','RAVENWING'],
      ['enhancement-da-9dcd451b895a4cfea19f',ID.ezekiel,'MODEL','ADEPTUS ASTARTES'],
      ['enhancement-da-aaf27210de7e47a792f7',ID.knights,'MODEL','DEATHWING']
    ];
    assert.equal(eligibility.length,8);
    for(const [ruleId,unitId,subject,negative]of eligibility){
      const contract=records.get(ruleId).ruleContract;assert.ok(contract?.assignment,'Missing source-backed assignment selector '+ruleId);
      const role=contract.roles.find(role=>role.id===contract.assignment.ownerRoleId);assert.equal(role.subject,subject);
      const state=roster([physical('source',unitId)]),projection=formRoster(book,state),ctx=predicateContext(state,projection,'source',subject,subject==='MODEL'?projection.units[0].profiles[0].scopeId:null);
      assert.equal(schema.evaluatePredicate(contract.assignment.selector,ctx),'TRUE','Source-eligible recipient rejected '+ruleId);
      const wrong={...ctx,keywords:new Set(ctx.keywords),abilities:new Set(ctx.abilities)};
      if(negative==='EXACT_UNIT')wrong.unitId=ID.sammael;
      else if(negative==='DEEP_STRIKE')wrong.abilities.delete('Deep Strike');
      else wrong.keywords.delete(negative);
      assert.equal(schema.evaluatePredicate(contract.assignment.selector,wrong),'FALSE','Source-ineligible recipient accepted '+ruleId);
    }
  });
  check('darkflight-ravenwing-without-fly-and-fly-without-ravenwing-negative',()=>{
    const rw=ID.command,fly=records.get('unit-sm-80ac1421ce0f4de3');assert.ok(fly,'Missing inherited source-backed Fly control');
    const state=roster([physical('source',rw)],ID.darkflight),result=project(state);
    assert.ok(result.projection.units[0].keywords.includes('RAVENWING'));assert.ok(!result.projection.units[0].keywords.includes('FLY'));
    assert.ok(result.projection.units.every(unit=>!unit.applied.some(trace=>trace.ruleId==='detachment-rule-da-6a259c00bc9f4bf498ee')));
    const generic=project(roster([physical('fly',fly.id)],ID.darkflight)).projection.units[0];
    assert.ok(generic.keywords.includes('FLY'));assert.ok(!generic.keywords.includes('RAVENWING'));
    assert.ok(!generic.applied.some(trace=>trace.ruleId==='detachment-rule-da-6a259c00bc9f4bf498ee'));
  });
  check('formed-unit-detach-reattach-no-stacking',()=>{
    const row=scenarios.find(row=>row.id==='ezekiel-book'),state=roster([physical('source',ID.ezekiel),physical('bodyguard',ID.intercessors),physical('peer',ID.intercessors)]),policies=[policy(ID.ezekiel)];
    const detached=project(state,book,policies),attached=changeAttachment(book,state,policies,'ATTACH','source','bodyguard'),result=project(attached,book,policies);
    assert.ok(unitTrace(result.projection,'bodyguard',row.rule).length);assert.equal(unitTrace(result.projection,'peer',row.rule).length,0);
    const service={state:result.state,effective:id=>projectEffectiveInstance(book,result.projection,id)};
    assert.equal(projectFormedUnitCards(cards,service,'bodyguard').components.length,2);
    const removed=changeAttachment(book,result.state,policies,'DETACH','source');assert.deepEqual(project(removed,book,policies).projection,detached.projection);
    const restored=changeAttachment(book,removed,policies,'ATTACH','source','bodyguard');assert.deepEqual(project(restored,book,policies).projection,result.projection);
  });
  check('outrider-battleline-physical-only-with-attached-captain',()=>{
    // Constructed relation tests existing formed-context semantics. It is not
    // a claim that a foot Captain has permission to join an Outrider Squad.
    const captain='unit-sm-99eb03d4f2d448e2',out='unit-sm-0dd92e6d8ad54ee6';
    const policies=[{sourceId:captain,targetId:out,role:'LEADER',sourceIds:[],additionalLeaders:0}];
    const state=roster([physical('captain',captain),physical('outriders',out),physical('unrelated',ID.intercessors)],ID.darkflight);
    const attached=changeAttachment(book,state,policies,'ATTACH','captain','outriders'),result=project(attached,book,policies);
    const owner=result.projection.units.find(unit=>unit.instanceId==='outriders'),leader=result.projection.units.find(unit=>unit.instanceId==='captain');
    assert.ok(owner.keywords.includes('BATTLELINE'),'Selected physical Outrider UNIT lost its source grant');
    assert.ok(!leader.keywords.includes('BATTLELINE'),'Physical UNIT grant leaked through formed bodyguard identity to Captain');
    for(const unit of [owner,leader])for(const model of unit.profiles)assert.ok(!model.keywords.includes('BATTLELINE'),'UNIT keyword leaked into MODEL facts');
    assert.ok(result.projection.formedUnits[0].keywords.includes('BATTLELINE'),'Formed unit lost legitimate member keyword union');
    assert.equal(unitTrace(result.projection,'captain','detachment-rule-da-6a259c00bc9f4bf498ee').length,0,'Physical Captain received Outrider source trace');
    assert.deepEqual(project(attached,book,policies).projection,result.projection,'Recompute changed exact physical keyword ownership');
    const detached=changeAttachment(book,attached,policies,'DETACH','captain'),after=project(detached,book,policies).projection;
    assert.ok(after.units.find(unit=>unit.instanceId==='outriders').keywords.includes('BATTLELINE'));
    assert.ok(!after.units.find(unit=>unit.instanceId==='captain').keywords.includes('BATTLELINE'));
  });
  check('no-implicit-chapter-context-or-unit-keyword-on-model',()=>{
    const chapter=read('./chapter-conditions.json'),inherited=chapter.records.map(row=>row.recipient.canonicalId);
    const targetIds=[...new Set(inherited.length?inherited:book.entities.filter(e=>e.kind==='DATASHEET'&&e.bookId==='space-marines').map(e=>e.id))];
    assert.ok(targetIds.length>=18,'Missing Chapter negative-control recipients');
    const state=roster(targetIds.map((id,n)=>({...physical('inherited/'+n,id),chapter:'DARK ANGELS',faction:'DARK ANGELS',metadata:{chapter:'DARK ANGELS'},daChapterConfirmed:true})),ID.darkflight);
    const result=project(state);for(const unit of result.projection.units){
      assert.ok(!unit.keywords.includes('DEATHWING')&&!unit.keywords.includes('RAVENWING'),'Unproven imported extras activated Chapter grants');
      for(const model of unit.profiles)assert.ok(!model.keywords.includes('DEATHWING')&&!model.keywords.includes('RAVENWING'));
    }
    assert.equal(book.entities.flatMap(e=>(e.ruleContract?.clauses||[]).flatMap(c=>c.rosterEffects)).filter(effect=>effect.operation==='GRANT_UNIT_KEYWORD'&&['DEATHWING','RAVENWING'].includes(effect.keyword)).length,6);
  });
  check('conditional-fnp-incoming-modifiers-and-battle-events-remain-text',()=>{
    const state=roster(facts.entities.filter(e=>e.kind==='DATASHEET').map((unit,n)=>physical('own/'+n,unit.id))),result=project(state);
    for(const unit of result.projection.units)for(const model of unit.profiles)assert.ok(!model.abilities.some(ability=>ability.name==='Feel No Pain'),'Qualified FNP became unconditional');
    for(const rule of ['detachment-rule-da-40ccb5dde8fa45a89798','detachment-rule-da-e82b128e971543ed97fc','ability-da-a17359d95b4b4ff4a606','ability-da-490661bbb1ff4d45a4b8']){
      const source=records.get(rule);assert.ok(source.data.text.length);assert.ok((source.ruleContract?.clauses||[]).every(clause=>clause.rosterEffects.length===0),'Unsupported incoming/conditional mechanic executed');
    }
  });
  check('native-rule-counts-full-text-and-source-ownership',()=>{
    const kindCount=kind=>book.entities.filter(e=>(e.sourceKind||e.kind)===kind).length;
    assert.equal(kindCount('DATASHEET'),83);assert.equal(kindCount('ARMY_RULE'),5);assert.equal(kindCount('DETACHMENT'),18);assert.equal(kindCount('STRATAGEM'),60);assert.equal(kindCount('ENHANCEMENT'),40);
    for(const source of facts.entities.filter(e=>['ARMY_RULE','DETACHMENT_RULE','ENHANCEMENT','STRATAGEM','DATASHEET_ABILITY'].includes(e.kind))){
      const actual=records.get(source.id);assert.equal(actual.data.text,source.data.text);assert.equal(actual.bookId,'dark-angels');assert.deepEqual(actual.provenance,source.provenance);
      const card=cards.get(source.id);assert.ok(card?.fields.some(field=>field.value===source.data.text),'Complete native source text missing from presentation '+source.id);
    }
    const nested=facts.entities.filter(e=>e.kind==='DATASHEET_ABILITY'&&e.data.supplemental);assert.equal(nested.length,5);for(const source of nested)assert.ok(cards.has(source.id));
    assert.equal(records.get(ID.command).data.profileIds.length,3);
    assert.equal(JSON.stringify([facts,smFacts]),originalFacts,'Canonical facts were modified by QA');
  });
  check('native-invulnerable-and-core-presence-exact-model-recipients',()=>{
    const sourceInvul=facts.entities.filter(e=>e.kind==='INVULNERABLE_SAVE');assert.equal(sourceInvul.length,15);
    const state=roster(facts.entities.filter(e=>e.kind==='DATASHEET').map((unit,n)=>physical('native/'+n,unit.id))),result=project(state);
    for(const source of sourceInvul){const physicalUnit=result.projection.units.find(unit=>unit.canonicalUnitId===source.parentId);assert.ok(physicalUnit);
      for(const id of source.data.sourceProfileIds){
        const model=physicalUnit.profiles.find(profile=>profile.canonicalProfileId===id);assert.equal(stat(model,'INSV'),source.data.value,'Native source-owned InSv lost');
        const effective=projectEffectiveInstance(book,result.projection,physicalUnit.instanceId);
        const projected=effective.profiles.find(profile=>profile.id===id);assert.equal(projected.fields.find(field=>field.label==='stats').value.INSV,source.data.value);
        const unit=result.state.units.find(unit=>unit.instanceId===physicalUnit.instanceId),variants=projectInstanceCards(cards,unit,effective);
        assert.ok(variants.get(id).every(card=>card.fields.some(field=>field.source?.path==='/stats/INSV'&&field.value===source.data.value)),'Native InSv missing from Personal profile fields');
      }}
    const native=facts.entities.filter(e=>e.kind==='RULE_REFERENCE'&&['Deep Strike','Fights First','Lone Operative 15"','Deadly Demise D3'].includes(e.data.label));assert.equal(native.length,12);
    for(const source of native){const physicalUnit=result.projection.units.find(unit=>unit.canonicalUnitId===source.parentId);
      for(const model of physicalUnit.profiles){
        const ability=model.abilities.find(ability=>ability.name===source.data.label);assert.ok(ability,'Native MODEL Core reference missing '+source.id);
        if(source.data.label==='Lone Operative 15"')assert.equal(ability.parameters.range,15,'Native Lone Operative range qualification lost');
        if(source.data.label==='Deadly Demise D3')assert.equal(ability.parameters.value,'D3','Native dice expression was treated as a fixed value');
      }}
  });
  check('inherited-sm-chaplain-typed-lance-retains-owner-and-physical-source',()=>{
    const rule='ability-sm-779fefc8580f4b31',owner='unit-sm-536d38b5ac7645dc',source=sources.get(rule);
    assert.equal(source.bookId,'space-marines');assert.ok(source.data.text.includes('This unit’s melee attacks have [Lance].'));
    const state=roster([physical('source',owner),physical('unrelated',ID.intercessors)]),result=project(state);
    const assertLance=projection=>{
      const unit=projection.units[0],melee=allWeapons(unit).filter(weapon=>weapon.data.mode==='melee');assert.ok(melee.length);
      for(const weapon of melee)assert.ok(weapon.data.abilities.some(ability=>ability.toUpperCase()==='LANCE'));
      assert.ok(unit.applied.some(trace=>trace.ruleId===rule&&trace.sourceInstanceId==='source'));
      assert.equal(unitTrace(projection,'unrelated',rule).length,0);
    };
    assertLance(result.projection);assert.deepEqual(records.get(rule).provenance,source.provenance);
    const effective=projectEffectiveInstance(book,result.projection,'source'),variants=projectInstanceCards(cards,result.state.units[0],effective);
    assert.ok(variants.get(owner)?.length);assert.equal(cards.get(rule).identity.registryId,'space-marines');
    assert.equal(projectPersonalBook(payload,result.state).instances.length,2);
    const altered=clone(book);for(const clause of altered.entities.find(e=>e.id===rule).ruleContract.clauses){clause.rosterEffects=[];clause.rosterClassification='DISPLAY_ONLY';}
    reject('inherited-sm-lance-missing-effect',()=>assertLance(project(state,altered).projection));
    inheritedResults.push({ruleId:rule,canonicalOwner:'space-marines',consumer:'dark-angels',expected:'Melee LANCE on source formation; no unrelated recipient',status:'PASS',provenance:source.provenance});
  });
  check('inherited-sm-model-enhancement-stats-fnp-and-no-peer-leak',()=>{
    const rule='enhancement-sm-33db6f7f8bc04d0c',owner='unit-sm-99eb03d4f2d448e2',source=sources.get(rule);
    assert.equal(source.bookId,'space-marines');assert.ok(source.data.text.includes('This model has:\n- 2+ Sv.\n- Feel No Pain 5+.'));
    const state=roster([physical('source',owner,{enhancement:rule,double:true}),physical('peer',owner)],source.parentId),result=project(state);
    const assertArmour=projection=>{
      const model=projection.units[0].profiles[0];assert.equal(Number.parseInt(stat(model,'SV')),2);
      assert.ok(model.abilities.some(ability=>ability.name==='Feel No Pain'&&ability.value===5));
      for(const other of [...projection.units[0].profiles.slice(1),...projection.units[1].profiles]){
        assert.equal(Number.parseInt(stat(other,'SV')),Number.parseInt(sources.get(other.canonicalProfileId).data.stats.SV));
        assert.ok(!other.abilities.some(ability=>ability.name==='Feel No Pain'),'MODEL Enhancement leaked to another physical model');
      }
      assert.ok(projection.units[0].applied.filter(trace=>trace.ruleId===rule).every(trace=>trace.sourceInstanceId==='source'));
      assert.equal(unitTrace(projection,'peer',rule).length,0);
    };
    assertArmour(result.projection);assert.deepEqual(records.get(rule).provenance,source.provenance);
    const effective=projectEffectiveInstance(book,result.projection,'source'),variants=projectInstanceCards(cards,result.state.units[0],effective);
    assert.ok(variants.get(owner)?.length);assert.equal(cards.get(rule).identity.registryId,'space-marines');
    assert.equal(projectPersonalBook(payload,result.state).instances.length,2);assert.deepEqual(project(result.state).projection,result.projection);
    const altered=clone(book);for(const clause of altered.entities.find(e=>e.id===rule).ruleContract.clauses){clause.rosterEffects=[];clause.rosterClassification='DISPLAY_ONLY';}
    reject('inherited-sm-model-armour-missing-effect',()=>assertArmour(project(state,altered).projection));
    inheritedResults.push({ruleId:rule,canonicalOwner:'space-marines',consumer:'dark-angels',expected:'Assigned MODEL Sv2+/unqualified FNP5; no second MODEL or physical UNIT leak',status:'PASS',provenance:source.provenance});
  });
  check('native-runtime-adapter-rebinds-physical-presence-and-retains-state-on-invalid-load',()=>{
    const state=roster([physical('source',ID.command),physical('peer',ID.command)]),service=createDarkAngelsRosterRuntime(built);
    service.load(state);const initial=service.projection;
    assert.ok(unitTrace(initial,'source','ability-da-4d1396f4342347baa772').length);
    assert.ok(unitTrace(initial,'source','ability-da-61ae3e245d824682a480').length);
    const withoutAncient=roster([physical('source',ID.command,{omit:[ID.ancient]}),physical('peer',ID.command)]);
    service.load(withoutAncient);assert.equal(unitTrace(service.projection,'source','ability-da-4d1396f4342347baa772').length,0);
    assert.ok(unitTrace(service.projection,'source','ability-da-61ae3e245d824682a480').length);
    const saved=service.snapshot(),projection=service.projection;service.recompute();assert.deepEqual(service.snapshot(),saved);assert.deepEqual(service.projection,projection);
    const invalid=clone(saved);invalid.units[0].modelRows[0].canonicalProfileId='unproved-model';assert.throws(()=>service.load(invalid));
    assert.deepEqual(service.snapshot(),saved,'Invalid load replaced prior active snapshot');assert.deepEqual(service.projection,projection,'Invalid load damaged prior effective state');
    service.load(JSON.parse(JSON.stringify(state)));assert.deepEqual(service.projection,initial,'Restoring physical Ancient duplicated effects');
    const withoutChampion=roster([physical('source',ID.command,{omit:[ID.champion]}),physical('peer',ID.command)]);service.load(withoutChampion);
    assert.ok(unitTrace(service.projection,'source','ability-da-4d1396f4342347baa772').length);
    assert.equal(unitTrace(service.projection,'source','ability-da-61ae3e245d824682a480').length,0);
  });
  return {status:'PASS',checks,negativeMutationControls:mutations,scenarios:scenarioResults,inheritedScenarios:inheritedResults,
    counts:{sourceAuthoredTypedScenarios:9,positiveChecks:checks.length,missingEffectMutations:mutations.length,nativeInvulnerableSources:15,nativeAbilitySources:12,
      physicalChapterGrants:0,datasheets:83,armyRules:5,detachments:18,enhancementsAndUpgrades:40,stratagems:60,inheritedGameplayScenarios:2},
    limitations:{fixtures:'CONSTRUCTED_DIAGNOSTICS',attachments:'SCOPE_ONLY_NOT_SOURCE_ELIGIBILITY',browserVerified:false,realNewRecruitExportTested:false,
      physicalChapterContext:'NOT_PROVEN',qualifiedFnp:'TEXT_ONLY_SOURCE_BACKED',lazarus:'SOURCE_CONFLICT',cyclonePhysicalPricing:'NOT_PROVEN'}};
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
  const result=runDarkAngelsGameplayQA();console.log(JSON.stringify({status:result.status,counts:result.counts,checks:result.checks,negativeMutationControls:result.negativeMutationControls},null,2));
}

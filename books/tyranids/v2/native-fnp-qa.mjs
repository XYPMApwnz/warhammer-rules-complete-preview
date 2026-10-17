/** QA-only overrides/suppression exercise existing numeric executor/presenter.
 * No 4+ native rule or suppression is invented as a Tyranids source fact. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {buildTyranidsContracts} from './rule-contract-build.mjs';
import {createTyranidsRosterImport} from './roster-import.mjs';
import {createRosterRuntime} from '../../shared/roster-v2/runtime.mjs';
import {projectAbilityPresentation,abilityPresentationLabel} from '../../shared/army-book-app-v2/ability-presentation.mjs';

const {book,schema}=buildTyranidsContracts(),clone=structuredClone;
const text=`+ FACTION KEYWORD: Tyranids
+ DETACHMENT: Invasion Fleet
1x Old One Eye (150 pts)
• 1x Old One Eye
1x Old One Eye (150 pts)
• 1x Old One Eye
1x Psychophage (110 pts)
• 1x Psychophage
1x Psychophage (110 pts)
• 1x Psychophage
1x Carnifexes (120 pts)
• 1x Carnifex
`;
const imported=createTyranidsRosterImport(book).import(text);
assert.equal(imported.status,'READY',JSON.stringify(imported.needsBindings));
const service=createRosterRuntime(book,schema);service.load(imported.roster);
service.attach('parsed-unit-1','parsed-unit-5');const state=service.snapshot(),baseline=service.projection;
const nativeIds=['parsed-unit-1','parsed-unit-2','parsed-unit-3','parsed-unit-4'];
const rows=(projection,id)=>{
  const unit=projection.units.find(u=>u.instanceId===id),native=nativeIds.includes(id);
  const presented=projectAbilityPresentation({instanceId:id,profiles:unit.profiles.map(p=>({id:p.canonicalProfileId,
    scopeId:p.scopeId,quantity:p.quantity,abilities:p.abilities,suppressedAbilityIds:p.suppressedAbilityIds||[]})),applied:unit.applied,
    references:native?[{canonicalId:'core-feel-no-pain',group:'CORE ABILITIES',parameters:{value:5},legacyValue:true,label:'Feel No Pain 5+'}]:[]});
  return [...presented.core,...presented.profiles.flatMap(p=>p.abilities)].filter(a=>a.canonicalId==='core-feel-no-pain');
};
const checkNative=projection=>{
  for(const id of nativeIds){
    const ability=rows(projection,id);assert.equal(ability.length,1);assert.equal(ability[0].subject,'MODEL');
    assert.equal(abilityPresentationLabel(ability[0]),'Feel No Pain 5+');
    const model=projection.units.find(u=>u.instanceId===id).profiles[0];
    assert.deepEqual(model.abilities,[{name:'Feel No Pain',value:5}]);
  }
  assert.deepEqual(rows(projection,'parsed-unit-5'),[],'FNP leaked to attached Carnifex');
  assert.ok(projection.units.find(u=>u.instanceId==='parsed-unit-5').profiles.every(p=>
    !p.abilities.some(a=>a.name==='Feel No Pain')),'Numeric FNP bag leaked to Bodyguard');
};
checkNative(baseline);
for(const action of [()=>service.detach('parsed-unit-1'),()=>service.reattach('parsed-unit-1','parsed-unit-5'),
  ()=>service.load(service.snapshot())]){action();checkNative(service.projection);}

function control(operation,value,ownerId){
  const b=clone(book),id='qa-only:fnp',quote='QA-only numeric/suppression executor control';
  b.rosterAbilityReferences={...b.rosterAbilityReferences,'core-feel-no-pain':{id:'core-feel-no-pain',title:'Feel No Pain',parameters:{value:{type:'number'}}}};
  const selector={predicate:'MODEL_ID',subject:'MODEL',contextLevel:'STATIC',arguments:{id:`datasheet-${ownerId}:profile:1`},
    evidence:{field:['text'],quote}};
  const owner={id:'owner',subject:'MODEL',purpose:'OWNER',allegiance:'FRIENDLY',selector,conditions:[]};
  b.entities.push({id,parentId:'detachment-invasion-fleet',kind:'ENHANCEMENT',data:{text:quote},provenance:{sourceId:'qa-only'},
    ruleContract:{schema:'rule-contract/v2',ruleId:id,ownerId:'detachment-invasion-fleet',sourceId:'qa-only',kind:'ENHANCEMENT',
      detachmentId:'detachment-invasion-fleet',executionMode:'DECLARATIVE_APPLICABILITY',contextLevel:'ROSTER',sourceFields:[['text']],
      roles:[owner],conditions:[],assignment:{ownerRoleId:'owner',selector},clauses:[{id:'control',roles:[owner],conditions:[],
        sourceFields:[['text']],rosterClassification:'ROSTER_EXECUTABLE',rosterEffects:[{id:id+'/effect',operation,
          ability:operation==='REMOVE_ABILITY'?{canonicalId:'core-feel-no-pain'}:{name:'Feel No Pain',value},
          targetSubject:'MODEL',targetBinding:'SOURCE_MODEL',conditions:[],evidence:{field:['text'],quote},sourceFields:[['text']],lifetime:'QA_ONLY'}]}]}});
  return b;
}
let controls=0,mutations=0;
for(const [id,slug]of [['parsed-unit-1','old-one-eye'],['parsed-unit-3','psychophage']]){
  for(const [operation,value]of [['GRANT_MODEL_ABILITY',4],['GRANT_MODEL_ABILITY',5],['REMOVE_ABILITY',undefined]]){
    const b=control(operation,value,slug),runtime=createRosterRuntime(b,schema),snapshot=clone(state);
    snapshot.units.find(u=>u.instanceId===id).enhancementIds.push('qa-only:fnp');runtime.load(snapshot);
    const projection=runtime.projection,result=rows(projection,id);
    if(operation==='REMOVE_ABILITY'){
      assert.deepEqual(result,[]);
      assert.deepEqual(projection.units.find(u=>u.instanceId===id).profiles[0].suppressedAbilityIds,['core-feel-no-pain']);
    }else{assert.equal(result.length,1);assert.equal(result[0].parameters.value,value);}
    for(const other of nativeIds.filter(other=>other!==id))assert.equal(rows(projection,other)[0].parameters.value,5);
    assert.deepEqual(rows(projection,'parsed-unit-5'),[]);
    for(const unit of projection.units)assert.deepEqual(unit.profiles.map(p=>p.profile),
      baseline.units.find(u=>u.instanceId===unit.instanceId).profiles.map(p=>p.profile),'SV/INSV or other characteristic changed');
    runtime.load(runtime.snapshot());assert.deepEqual(runtime.projection,projection,'Override accumulated');
    runtime.load(state);assert.deepEqual(runtime.projection,baseline,'Native baseline not restored');controls++;
  }
}
for(const mutate of [b=>delete b.rosterReferenceSemantics['datasheet-old-one-eye:rule-reference:1'],
  b=>b.entities.find(e=>e.id==='datasheet-old-one-eye:rule-reference:1').parentId='unit-carnifexes',
  b=>b.entities.find(e=>e.id==='datasheet-psychophage:rule-reference:2').data.label='Feel No Pain 4+',
  b=>b.rosterReferenceSemantics['datasheet-old-one-eye:rule-reference:1'].modelProfileIds=['datasheet-carnifexes:profile:1']]){
  // Mutate factual input, not the validated output returned by the producer.
  const facts=JSON.parse(fs.readFileSync(new URL('./generated/effective.json',import.meta.url),'utf8'));
  mutate(facts);assert.throws(()=>buildTyranidsContracts({facts}));mutations++;
}
for(const mutate of [p=>p.units[0].profiles[0].abilities=[],p=>p.units[0].profiles[0].abilities[0].value=4,
  p=>p.units[0].profiles[0].abilities.push({name:'Feel No Pain',value:5}),
  p=>p.units[4].profiles[0].abilities.push({name:'Feel No Pain',value:5})]){
  const candidate=clone(baseline);mutate(candidate);assert.throws(()=>checkNative(candidate));mutations++;
}
assert.deepEqual(service.snapshot(),state);
console.log(JSON.stringify({status:'PASS',nativeOwners:2,physicalInstances:4,numericOverrides:[4,5],suppressionPresentation:true,
  saveUnchanged:true,recompute:true,controls,mutations,browser:'NOT_RUN_BY_THIS_NODE_QA'}));

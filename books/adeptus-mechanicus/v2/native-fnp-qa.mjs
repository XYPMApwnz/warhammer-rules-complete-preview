/** One independently reviewed source obligation, two exact native occurrences.
 * Numeric overrides/suppression below are disposable QA inputs to the existing
 * executor, never new gameplay facts or claimed UI controls. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {nativeFnpFixture as fixture} from './native-fnp-fixtures.mjs';
import {createAdMechRosterRuntime} from './roster-runtime.mjs';
import {assertSourceEffectExpectation} from '../../shared/roster-v2/source-effect-expectations-qa.mjs';
import {collectAbilityReferences,projectAbilityPresentation,abilityPresentationLabel} from '../../shared/army-book-app-v2/ability-presentation.mjs';
import {projectFormedUnitCards,prepareRosterPresentationCards} from '../../shared/army-book-app-v2/personal.mjs';

const read=file=>JSON.parse(fs.readFileSync(new URL(file,import.meta.url),'utf8'));
export const nativeFnpExpectation=read('./native-fnp-source-expectations.json');
const expectation=nativeFnpExpectation,book=read('./generated/roster-runtime.json'),facts=read('./generated/effective.json'),
  metadata=read('./roster-import-aliases.json'),payload=read('./generated/app-presentation.json'),clone=structuredClone;
const cards=prepareRosterPresentationCards(new Map(payload.cards.map(c=>[c.id,c])),payload.rosterPresentation);
const root=new URL('../../../',import.meta.url),byId=new Map(book.entities.map(e=>[e.id,e])),
  fnp=a=>a.canonicalId==='core-feel-no-pain'||a.name==='Feel No Pain'||expectation.nativeSources.some(s=>s.entryId===a.id),
  allRows=p=>[...p.core,...p.profiles.flatMap(x=>x.abilities)].filter(fnp);
const mutations=[],scenarios=[];
function sourceCheck(candidate=book){
  for(const source of [expectation.source,...expectation.nativeSources]){
    const raw=fs.readFileSync(new URL(source.document,root));
    assert.equal(createHash('sha256').update(raw).digest('hex'),source.sha256,'Independent accepted source SHA');
    const visible=raw.toString('utf8').replace(/<[^>]*>/g,' ').replace(/&nbsp;/g,' ').replace(/\s+/g,' ');
    assert.ok(visible.includes(source.quote),'Expected exact source clause absent from raw');
    const entity=candidate.entities.find(e=>e.id===source.canonicalId);
    assert.equal(entity.parentId,source.ownerId,'SOURCE OWNER');
    assert.deepEqual(entity.provenance,facts.entities.find(e=>e.id===source.canonicalId).provenance);
    assert.ok(entity.provenance.sourceId&&entity.provenance.sourcePath&&entity.provenance.pointer);
    const accepted=JSON.parse(fs.readFileSync(new URL(entity.provenance.sourcePath,root),'utf8'));
    const occurrence=entity.provenance.pointer.slice(1).split('/').reduce((o,k)=>o[k],accepted);
    if(source.entryId){
      const group=entity.data.groups.find(g=>g.label==='CORE ABILITIES'),entry=group.entries.find(e=>e.id===source.entryId);
      assert.equal(entry.label,source.quote);assert.ok(occurrence.label.includes('CORE ABILITIES'+source.quote));
      assert.deepEqual(candidate.rosterReferenceSemantics[source.canonicalId].abilities.find(a=>a.id===source.entryId),
        {id:source.entryId,name:'Feel No Pain',value:expectation.nativeValue},'Typed native numeric source binding');
    }else assert.equal(occurrence.blocks[0].text,source.quote);
  }
}
function make(candidate=book,text=fixture.text){const s=createAdMechRosterRuntime(candidate,metadata);assert.equal(s.import(text).status,'READY');return s;}
function input(service,id){
  const view=projectFormedUnitCards(cards,service,id),component=view.components.find(c=>c.unit.instanceId===id);
  const children=component.card.children.flatMap(child=>component.variants.get(child)||[cards.get(child)]);
  return {instanceId:id,profiles:children.filter(c=>c.kind==='PROFILE').map(c=>({id:c.id,scopeId:c.scopeId,
    quantity:c.rosterQuantity,abilities:c.effectiveAbilities||c.rosterAbilities||[],suppressedAbilityIds:c.suppressedAbilityIds||[]})),
    unitAbilities:component.card.rosterUnitAbilities||[],references:collectAbilityReferences(children.filter(c=>c.kind==='RULE_REFERENCE'),payload.datasheetPresentation.referenceBindings),
    applied:service.effective(id).applied};
}
function observe(service){return service.state.units.map(u=>{
  const x=input(service,u.instanceId),rows=allRows(projectAbilityPresentation(x));
  return {id:u.instanceId,canonicalId:u.canonicalUnitId,
    modelBags:x.profiles.map(p=>({id:p.id,scope:p.scopeId,values:p.abilities.filter(fnp).map(a=>a.value)})),
    presentation:rows.map(a=>({id:a.canonicalId,value:a.parameters.value,label:abilityPresentationLabel(a),subject:a.subject,scopes:[...a.recipientScopes].sort()}))};
});}
function expected(service,values,suppressedIds=[]){return service.state.units.map(u=>{
  const models=service.effective(u.instanceId).profiles,value=values[u.instanceId],scopes=models.map(p=>JSON.stringify([u.instanceId,p.id,p.scopeId||null])).sort();
  return {id:u.instanceId,canonicalId:u.canonicalUnitId,
    modelBags:models.map(p=>({id:p.id,scope:p.scopeId,values:value===null?[]:[value]})),
    presentation:value===null||suppressedIds.includes(u.instanceId)?[]:[{id:'core-feel-no-pain',value,label:`Feel No Pain ${value}+`,subject:'MODEL',scopes}]};
});}
const baselineValues=Object.fromEntries(['parsed-unit-1','parsed-unit-2','parsed-unit-3','parsed-unit-4','parsed-unit-5','parsed-unit-6'].map((id,i)=>[id,i>0&&i<5?5:null]));
const attachedValues=body=>({...baselineValues,[fixture.leader]:4,[body]:4});
const characteristics=s=>s.projection.units.map(u=>({id:u.instanceId,profiles:u.profiles.map(p=>({id:p.canonicalProfileId,profile:p.profile})),weapons:u.weapons}));
function verify(service,values,{guard=false,candidate=book,suppressedIds=[]}={}){
  assert.deepEqual(service.state.units.map(u=>u.canonicalUnitId),['unit-tech-priest-dominus','unit-fulgurite-electro-priests','unit-corpuscarii-electro-priests','unit-fulgurite-electro-priests','unit-corpuscarii-electro-priests','unit-skitarii-rangers']);
  const actual=observe(service),wanted=expected(service,values,suppressedIds);
  assert.deepEqual(actual,wanted,'Independent FNP source -> native/granted executor -> presentation');
  if(guard)assertSourceEffectExpectation({expectation,book:candidate,observation:actual,expectedObservation:wanted,
    applied:service.projection.units.flatMap(u=>u.applied).filter(a=>a.ruleId===expectation.source.canonicalId&&a.clauseId===expectation.expectedClauseId)});
  return actual;
}
sourceCheck();
const service=make(),originalState=service.snapshot(),initialProfiles=characteristics(service),baseline=verify(service,baselineValues);
for(const body of [fixture.fulgurite,fixture.corpuscarii]){
  service.attach(fixture.leader,body);verify(service,attachedValues(body),{guard:true});
  const grant=service.effective(body).applied.find(a=>a.ruleId===expectation.source.canonicalId&&a.clauseId===expectation.expectedClauseId),
    native=expectation.nativeSources.find(s=>s.ownerId===service.effective(body).canonicalUnitId);
  assert.ok(grant.before.some(a=>a.id===native.entryId&&a.value===5),'Native occurrence provenance lost during override');
  assert.ok(grant.after.some(a=>a.name==='Feel No Pain'&&a.value===4));
  assert.ok(input(service,body).references.some(r=>r.runtimeEntryId===native.entryId&&r.canonicalId==='core-feel-no-pain'&&r.parameters.value===5),'Native canonical reference/provenance removed');
  assert.equal(byId.get(grant.ruleId).provenance.sourceId,'am-waha-11e-2026-09-25');
  assert.deepEqual(characteristics(service),initialProfiles,'FNP changed Save, Invulnerable Save or other characteristics');
  for(const u of service.projection.units){const prior=baseline.find(x=>x.id===u.instanceId);assert.equal(u.profiles.length,prior.modelBags.length);}
  const saved=service.snapshot();service.load(JSON.parse(JSON.stringify(saved)));verify(service,attachedValues(body));
  assert.deepEqual(service.snapshot().units,originalState.units,'Attachment rewrote the import');
  const loaded=make();loaded.load(saved);verify(loaded,attachedValues(body));
  service.detach(fixture.leader);verify(service,baselineValues);
  const duplicate=body===fixture.fulgurite?fixture.fulguriteDuplicate:fixture.corpuscariiDuplicate;
  service.attach(fixture.leader,duplicate);verify(service,attachedValues(duplicate));
  service.reattach(fixture.leader,body);verify(service,attachedValues(body));
  service.detach(fixture.leader);assert.deepEqual(verify(service,baselineValues),baseline);
  scenarios.push({owner:native.ownerId,native:5,attached:4,detachReattach:true,reload:true,independentInstances:true});
}
service.attach(fixture.leader,fixture.unrelated);verify(service,{...baselineValues,[fixture.leader]:5,[fixture.unrelated]:5});
service.detach(fixture.leader);verify(service,baselineValues);assert.equal(service.import(fixture.text).status,'READY');verify(service,baselineValues);

// Two physical composition rows sharing a canonical profile must both receive
// the formed UNIT grant, without spilling into another UNIT_INSTANCE.
for(const body of [fixture.fulgurite,fixture.corpuscarii]){
  const split=make(),state=split.snapshot(),unit=state.units.find(u=>u.instanceId===body),row=unit.modelRows[0];
  unit.modelRows=[{...clone(row),rowId:body+'/two-models',quantity:2},{...clone(row),rowId:body+'/three-models',quantity:3}];
  split.load(state);assert.equal(split.effective(body).profiles.length,2);verify(split,baselineValues);
  split.attach(fixture.leader,body);verify(split,attachedValues(body));
  assert.deepEqual(split.effective(body).profiles.map(p=>p.quantity),[2,3]);
  assert.equal(allRows(projectAbilityPresentation(input(split,body)))[0].recipientScopes.length,2);
  split.detach(fixture.leader);verify(split,baselineValues);
}

// A real, independent Lords of the Forge grant must survive loss of the
// stronger leading grant; removing native duplicates must not erase it.
const forge=make(book,fixture.text.replace('Haloscreed Battle Clade','Lords of the Forge'));
verify(forge,{...baselineValues,[fixture.leader]:5});forge.attach(fixture.leader,fixture.fulgurite);verify(forge,attachedValues(fixture.fulgurite));
forge.detach(fixture.leader);verify(forge,{...baselineValues,[fixture.leader]:5});
assert.ok(forge.effective(fixture.leader).applied.some(a=>a.ruleId!==expectation.source.canonicalId&&a.after?.some?.(x=>x.name==='Feel No Pain'&&x.value===5)));

// Production source/data remain immutable. Only these disposable QA books add
// an assignment-targeted numeric override or suppression operation.
function synthetic(operation,value=4){
  const b=clone(book),ruleId='qa-only:admech-fnp-control',quote='Disposable typed executor control',
    selector={predicate:'UNIT_ID',subject:'UNIT',contextLevel:'STATIC',arguments:{id:'unit-fulgurite-electro-priests'},evidence:{field:['text'],quote}},
    effect={id:ruleId+'/effect',operation,targetSubject:'MODEL',targetBinding:'SOURCE_UNIT_MODELS',
      ability:operation==='REMOVE_ABILITY'?{canonicalId:'core-feel-no-pain'}:{name:'Feel No Pain',value},
      conditions:[],evidence:{field:['text'],quote},sourceFields:[['text']],lifetime:'ROSTER'};
  b.rosterAbilityReferences['core-feel-no-pain']={id:'core-feel-no-pain',title:'Feel No Pain',parameters:{value:{type:'number'}}};
  b.entities.push({id:ruleId,parentId:'detachment-haloscreed-battle-clade',kind:'ENHANCEMENT',provenance:{sourceId:'qa-only'},data:{text:quote},
    ruleContract:{schema:'rule-contract/v2',ruleId,ownerId:'detachment-haloscreed-battle-clade',sourceId:'qa-only',kind:'ENHANCEMENT',
      detachmentId:'detachment-haloscreed-battle-clade',executionMode:'DECLARATIVE_APPLICABILITY',contextLevel:'ROSTER',
      roles:[{id:'owner',subject:'UNIT',purpose:'OWNER',allegiance:'FRIENDLY',selector,conditions:[]}],assignment:{ownerRoleId:'owner',selector:clone(selector)},
      conditions:[],sourceFields:[['text']],clauses:[{id:'qa-only',roles:[],conditions:[],sourceFields:[['text']],rosterClassification:'ROSTER_EXECUTABLE',rosterEffects:[effect]}]}});
  // The production presenter now resolves selected rules, including this
  // explicitly synthetic executor input. Supply its matching canonical card;
  // do not remove the selection or bypass the presenter to test FNP.
  cards.set(ruleId,{id:ruleId,kind:'ENHANCEMENT',parentId:'detachment-haloscreed-battle-clade',
    title:quote,children:[],links:[],fields:[{id:ruleId+'::/text',value:quote,
      source:{entityId:ruleId,path:'/text'}}]});
  const s=make(b),state=s.snapshot();state.units.find(u=>u.instanceId===fixture.fulgurite).enhancementIds.push(ruleId);s.load(state);return s;
}
for(const value of [4,5]){
  const changed=synthetic('GRANT_MODEL_ABILITY',value);verify(changed,{...baselineValues,[fixture.fulgurite]:value});
  assert.deepEqual(characteristics(changed),initialProfiles);changed.load(originalState);verify(changed,baselineValues);
}
const suppressed=synthetic('REMOVE_ABILITY');verify(suppressed,baselineValues,{suppressedIds:[fixture.fulgurite]});
assert.ok(suppressed.effective(fixture.fulgurite).profiles.every(p=>p.suppressedAbilityIds.includes('core-feel-no-pain')));
assert.deepEqual(characteristics(suppressed),initialProfiles);suppressed.load(originalState);verify(suppressed,baselineValues);
// Every non-FNP ability retains the exact entry identity and physical owner.
const nonFnp=s=>s.projection.units.map(u=>({id:u.instanceId,models:u.profiles.map(p=>p.abilities.filter(a=>!fnp(a)))}));
const unchanged=nonFnp(make());for(const s of [service,forge,synthetic('GRANT_MODEL_ABILITY'),synthetic('REMOVE_ABILITY')])assert.deepEqual(nonFnp(s),unchanged);

function reject(name,mutate,{attached=true,native=false}={}){
  const b=clone(book);mutate(b);const bad=make(b);if(attached)bad.attach(fixture.leader,fixture.fulgurite);
  assert.throws(()=>{if(native)sourceCheck(b);verify(bad,attached?attachedValues(fixture.fulgurite):baselineValues);},
    /Typed native numeric source binding|Independent FNP source -> native\/granted executor -> presentation/,'Comparator failed to reject '+name);
  mutations.push(name);
}
for(const source of expectation.nativeSources){
  // Run the same numeric/owner checks for both repaired binding occurrences.
  const activeBody=source.ownerId==='unit-fulgurite-electro-priests'?fixture.fulgurite:fixture.corpuscarii;
  for(const [name,edit]of [['removed-numeric',a=>delete a.value],['wrong-native-value',a=>a.value=6]]){
    const b=clone(book);edit(b.rosterReferenceSemantics[source.canonicalId].abilities.find(a=>a.id===source.entryId));
    const bad=make(b);assert.throws(()=>verify(bad,baselineValues),/Independent FNP source -> native\/granted executor -> presentation/);
    bad.attach(fixture.leader,activeBody);if(name==='removed-numeric')assert.throws(()=>verify(bad,attachedValues(activeBody)),/Independent FNP source -> native\/granted executor -> presentation/);
    mutations.push(source.ownerId+'/'+name);
  }
}
const clause=b=>b.entities.find(e=>e.id===expectation.source.canonicalId).ruleContract.clauses.find(c=>c.id===expectation.expectedClauseId);
reject('wrong-MODEL-recipient',b=>clause(b).rosterEffects[0].targetBinding='SOURCE_MODEL');
reject('missing-granted-4',b=>{clause(b).rosterEffects=[];clause(b).rosterClassification='DISPLAY_ONLY';});
// Presenter-regression mutations operate on actual projected runtime bags.
const attached=make();attached.attach(fixture.leader,fixture.fulgurite);
const duplicate={...attached,effective(id){const e=clone(attached.effective(id));if(id===fixture.fulgurite)e.profiles.forEach(p=>p.abilities.push({id:expectation.nativeSources[0].entryId,name:'Feel No Pain',value:5}));return e;}};
assert.throws(()=>verify(duplicate,attachedValues(fixture.fulgurite)),/Independent FNP source -> native\/granted executor -> presentation/);mutations.push('two-visible-values-4-and-5');
const eraseIndependent={...attached,effective(id){const e=clone(attached.effective(id));if(id===fixture.fulguriteDuplicate)e.profiles.forEach(p=>p.suppressedAbilityIds=['core-feel-no-pain']);return e;}};
assert.throws(()=>verify(eraseIndependent,attachedValues(fixture.fulgurite)),/Independent FNP source -> native\/granted executor -> presentation/);mutations.push('unjustified-suppression-independent-FNP');
const eraseForge={...forge,effective(id){const e=clone(forge.effective(id));if(id===fixture.leader)e.profiles.forEach(p=>p.abilities=p.abilities.filter(a=>!fnp(a)));return e;}};
assert.throws(()=>verify(eraseForge,{...baselineValues,[fixture.leader]:5}),/Independent FNP source -> native\/granted executor -> presentation/);mutations.push('lost-independent-Forge-grant');
assert.deepEqual(book,read('./generated/roster-runtime.json'));sourceCheck();
export const nativeFnpGuardResult={status:'PASS',id:expectation.id,nativeOccurrences:2,scenarios,mutationCount:mutations.length,mutations,
  sourceToPresentation:true,numericOverride:[4,5],suppression:true,independentForgeGrant:true,saveInvulnerableSaveUnchanged:true,
  physicalModelScope:true,multiplePhysicalRows:true,recompute:true,realNewRecruitExportTested:false,sharedExecutorChanged:false};
console.log(JSON.stringify(nativeFnpGuardResult));

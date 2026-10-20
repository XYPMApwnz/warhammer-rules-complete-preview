/** Independent accepted-source obligations. Production declarations do not
 * create the expected inventory, values, recipients or mutation oracles. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {sevenEffectFixtures} from './seven-effects-fixtures.mjs';
import {make} from './roster-ui-fixtures.mjs';
import {createTyranidsBrowserRoster} from './roster-boot.mjs';
import {createRosterRuntime} from '../../shared/roster-v2/runtime.mjs';
import {createTyranidsRuleSchema} from './rule-contract-build.mjs';
import {projectFormedUnitCards,prepareRosterPresentationCards,projectPersonalBook} from '../../shared/army-book-app-v2/personal.mjs';
import {collectAbilityReferences,projectAbilityPresentation} from '../../shared/army-book-app-v2/ability-presentation.mjs';
import {assertSourceEffectExpectation} from '../../shared/roster-v2/source-effect-expectations-qa.mjs';
const read=f=>JSON.parse(fs.readFileSync(new URL(f,import.meta.url),'utf8')),clone=structuredClone;
export const sevenEffectsExpectations=read('./seven-effects-source-expectations.json').cases;
const book=read('./generated/roster-runtime.json'),facts=read('./generated/effective.json'),payload=read('./generated/app-presentation.json');
const cards=prepareRosterPresentationCards(new Map(payload.cards.map(c=>[c.id,c])),payload.rosterPresentation),root=new URL('../../../',import.meta.url);
const sorted=values=>[...new Set(values)].sort(),normal=s=>s.replace(/\s+/g,''),sha=b=>createHash('sha256').update(b).digest('hex').toUpperCase();
const sourceRecords=new Map(facts.entities.map(e=>[e.id,e])),mutations=[],scenarios=[],negativeControls=[];
const relevant=(e,x)=>e.expectedOperations.some(op=>x.operation===op.operation&&x.field===op.field);
const effects=(b,e)=>b.entities.find(x=>x.id===e.source.canonicalId).ruleContract?.clauses.flatMap(c=>c.rosterEffects||[]).filter(x=>relevant(e,x))||[];
function sourceCheck(e,b=book){
 const s=e.source,raw=fs.readFileSync(new URL(s.document,root));assert.equal(sha(raw),s.sha256,'Accepted source SHA');
 const visible=raw.toString('utf8').replace(/<[^>]*>/g,' ').replaceAll('&nbsp;',' ').replaceAll('&amp;','&');
 for(const clause of s.rawClauses||[s.quote])assert.ok(normal(visible).includes(normal(clause)),`RAW SOURCE CLAUSE: ${e.id}: ${clause}`);
 const entity=b.entities.find(x=>x.id===s.canonicalId);assert.equal(entity.parentId,s.ownerId,'SOURCE OWNER');
 assert.equal(s.field.reduce((v,k)=>v?.[k],entity.data),s.quote,'SOURCE EXACT TEXT');
 assert.deepEqual(entity.provenance,sourceRecords.get(s.canonicalId).provenance,'SOURCE PROVENANCE');
 assert.equal(entity.provenance.document,s.document);assert.equal(entity.provenance.sha256,s.sha256);
 assert.ok(entity.provenance.pointer&&entity.provenance.corpusSha256);
 const card=cards.get(s.canonicalId);assert.deepEqual(card.provenance,entity.provenance,'Presentation source provenance');
 assert.ok(card.fields.some(f=>f.value===s.quote)||s.field[0]==='blocks'&&card.fields.some(f=>f.value===s.quote),'Presentation full source text');
}
function bindingCheck(e,b=book){
 const entity=b.entities.find(x=>x.id===e.source.canonicalId),actual=effects(b,e);
 assert.ok(entity.ruleContract,'EXECUTABLE BINDING REQUIRED');assert.equal(entity.ruleContract.ownerId,e.source.ownerId,'CONTRACT OWNER');
 assert.equal(actual.length,e.expectedOperations.length,'EXACT EXECUTABLE EFFECT INVENTORY');
 for(const expected of e.expectedOperations){
  const matched=actual.filter(x=>x.operation===expected.operation&&x.field===expected.field&&(!expected.keyword||x.keyword===expected.keyword));
  assert.equal(matched.length,1,'EXACT EXECUTABLE OPERATION');
  for(const [k,v]of Object.entries(expected))assert.deepEqual(matched[0][k],v,'SOURCE TYPED OPERATION '+k);
  assert.equal(matched[0].provenance.canonicalRuleId,e.source.canonicalId);assert.equal(matched[0].provenance.canonicalOwnerId,e.source.ownerId);
  assert.deepEqual(matched[0].provenance.sourceEvidence,entity.provenance);
 }
 if(e.declarativeClause){assert.ok(entity.ruleContract.clauses.some(c=>c.rosterClassification==='BATTLE_ONLY'&&c.sourceText.includes(e.declarativeClause)&&!c.rosterEffects.length),'Wound reroll must remain separate declarative clause');}
}
function removeEffects(b,e){for(const c of b.entities.find(x=>x.id===e.source.canonicalId).ruleContract.clauses){c.rosterEffects=(c.rosterEffects||[]).filter(x=>!relevant(e,x));if(!c.rosterEffects.length&&c.rosterClassification==='ROSTER_EXECUTABLE')c.rosterClassification='DISPLAY_ONLY';}}
function without(e){const b=clone(book);removeEffects(b,e);return b;}
const baseBooks=new Map(sevenEffectsExpectations.map(e=>[e.id,without(e)]));
function service(e,b=book,state=null){const s=createTyranidsBrowserRoster(b);if(state)s.load(clone(state));else assert.equal(s.import(sevenEffectFixtures[e.fixture].text).status,'READY');return s;}
const cleanAbility=a=>({canonicalId:a.canonicalId||null,name:a.canonicalId?null:a.name||null,value:a.value??null,parameters:a.parameters||{}});
function runtimeRows(s){return s.projection.units.map(u=>({id:u.instanceId,canonicalUnitId:u.canonicalUnitId,keywords:sorted(u.keywords),abilities:(u.abilities||[]).map(cleanAbility),
 profiles:u.profiles.map(p=>({id:p.canonicalProfileId,scope:p.scopeId,quantity:p.quantity,stats:{...p.profile.stats,...Object.fromEntries(['INSV','SV','M','T','W','LD','OC'].filter(k=>p.profile[k]!==undefined).map(k=>[k,p.profile[k]]))},
   keywords:sorted(p.keywords),intrinsicKeywords:sorted(p.intrinsicKeywords),abilities:p.abilities.map(cleanAbility)})),
 weapons:[...u.weapons,...u.profiles.flatMap(p=>p.weapons)].map(w=>({id:w.canonicalProfileId,scope:w.scopeId,quantity:w.physicalQuantity,data:clone(w.data)}))}));}
function component(s,id){const view=projectFormedUnitCards(cards,s,id),c=view.components.find(x=>x.unit.instanceId===id);
 return {root:c.card,children:c.card.children.flatMap(key=>c.variants.get(key)||[cards.get(key)])};}
function presentationRows(s,e){return s.state.units.map(u=>{
 const c=component(s,u.instanceId),profileCards=c.children.filter(x=>x.kind==='PROFILE'),weaponCards=c.children.filter(x=>x.kind==='WEAPON_PROFILE');
 const input={instanceId:u.instanceId,profiles:profileCards.map(p=>({id:p.id,scopeId:p.scopeId,quantity:p.rosterQuantity,abilities:p.effectiveAbilities||[],suppressedAbilityIds:p.suppressedAbilityIds||[]})),
  unitAbilities:c.root.rosterUnitAbilities||[],references:collectAbilityReferences(c.children.filter(x=>x.kind==='RULE_REFERENCE'),payload.datasheetPresentation.referenceBindings),applied:s.effective(u.instanceId).applied};
 const a=projectAbilityPresentation(input),abilityRows=[...a.core,...a.profiles.flatMap(x=>x.abilities)].filter(a=>a.canonicalId===e.abilityId);
 return {id:u.instanceId,profiles:profileCards.map(p=>({id:p.id,scope:p.scopeId,stats:Object.fromEntries(p.fields.filter(f=>/^(?:\/stats\/|\/)(?:M|T|SV|W|LD|OC|INSV)$/.test(f.presentationPath||f.source?.path)).map(f=>[(f.presentationPath||f.source.path).split('/').at(-1),f.value]))})),
  weapons:weaponCards.map(w=>({id:w.id,scope:w.scopeId,strength:w.fields.find(f=>f.source?.path==='/strength')?.value,ap:w.fields.find(f=>f.source?.path==='/ap')?.value})),
  keywords:sorted(c.root.fields.filter(f=>/^\/keywords\//.test(f.source?.path||'')).flatMap(f=>f.value)),
  abilityRows:abilityRows.map(a=>({id:a.canonicalId,subject:a.subject,parameters:a.parameters,scopes:a.recipientScopes}))};
 });}
function recipients(e,state){const f=sevenEffectFixtures[e.fixture],selected=id=>state.units.find(u=>u.instanceId===id)?.enhancementIds.includes(e.source.canonicalId);
 const correctDet=state.detachmentIds.includes(e.source.ownerId);
 if(e.id==='tyr-guardian')return state.attachments.filter(a=>state.units.find(u=>u.instanceId===a.bodyguardInstanceId)?.canonicalUnitId==='unit-tyrant-guard').map(a=>a.leaderInstanceId);
 if(e.id==='tyr-elevated')return correctDet?f.owners.filter(selected):[];
 if(e.id==='tyr-power')return correctDet&&selected(f.owner)?[f.owner]:[];
 if(e.id==='tyr-chameleonic')return correctDet&&selected(f.owner)?[f.owner,...state.attachments.filter(a=>a.leaderInstanceId===f.owner).map(a=>a.bodyguardInstanceId)]:[];
 if(!correctDet)return [];
 if(e.id==='tyr-mindhunger')return f.recipients;
 if(e.id==='tyr-leader-keywords')return f.keywordRecipients;
 return f.invulnerableRecipients;
}
function expected(e,s){const state=s.snapshot(),base=service(e,baseBooks.get(e.id),state),rows=runtimeRows(base),ids=recipients(e,state);
 for(const u of rows)if(ids.includes(u.id)){
  if(e.id==='tyr-guardian')for(const p of u.profiles)p.abilities.push({canonicalId:null,name:'Feel No Pain',value:e.value,parameters:{}});
  if(['tyr-elevated','tyr-power'].includes(e.id))for(const w of u.weapons){
   const matches=e.id==='tyr-elevated'?w.data.mode==='melee':w.id===e.psychicProfileId;
   if(matches){w.data.ap=String(Number(w.data.ap)+e.apDelta);if(e.strengthDelta)w.data.strength=String(Number(w.data.strength)+e.strengthDelta);}
  }
  if(['tyr-chameleonic','tyr-mindhunger'].includes(e.id))u.abilities.push({canonicalId:e.abilityId,name:null,value:null,parameters:{}});
  if(e.id==='tyr-leader-keywords')u.keywords=sorted([...u.keywords,...e.keywords]);
  if(e.id==='tyr-leader-invulnerable')for(const p of u.profiles){assert.ok(e.recipientProfileIds.includes(p.id));p.stats.INSV=e.value;}
 }
 return {rows,base,ids};
}
function expectedPresentation(e,s,expectedRows){return expectedRows.map(u=>{
 const group=s.effective(u.id).formedUnit,groupIds=group?.memberInstanceIds||[u.id];
 const abilities=[];
 if(e.abilityId){
  const unitAbility=u.abilities.find(a=>a.canonicalId===e.abilityId);
  if(unitAbility)abilities.push({id:e.abilityId,subject:'UNIT',parameters:unitAbility.parameters,scopes:[JSON.stringify([u.id,'UNIT'])]});
  const granted=u.profiles.filter(p=>p.abilities.some(a=>a.name==='Feel No Pain'&&e.abilityId==='core-feel-no-pain'));
  if(granted.length)abilities.push({id:e.abilityId,subject:'MODEL',parameters:{value:e.value},scopes:granted.map(p=>JSON.stringify([u.id,p.id,p.scope])).sort()});
 }
 return {id:u.id,profiles:u.profiles.map(p=>({id:p.id,scope:p.scope,stats:p.stats})),
  weapons:u.weapons.map(w=>({id:w.id,scope:w.scope,strength:w.data.strength,ap:w.data.ap})),
  keywords:sorted(expectedRows.filter(x=>groupIds.includes(x.id)).flatMap(x=>x.keywords)),abilityRows:abilities};
});}
function verify(e,s,{candidate=book,active=true,observation=null}={}){
 sourceCheck(e,candidate);bindingCheck(e,candidate);
 const expectedResult=expected(e,s),observed={runtime:runtimeRows(s),presentation:presentationRows(s,e)},wanted={runtime:expectedResult.rows,presentation:expectedPresentation(e,s,expectedResult.rows)};
 assert.deepEqual(observation||observed,wanted,'SOURCE -> EXECUTOR -> PRESENTATION '+e.id);
 const applied=s.projection.units.flatMap(u=>u.applied).filter(a=>a.ruleId===e.source.canonicalId&&e.expectedOperations.some(op=>op.operation===a.operation&&(op.field===undefined||op.field===a.field)));
 if(active){assert.ok(applied.length,'EXECUTOR RESULT REQUIRED');
  const expectedOperation=clone(e.expectedOperations[0]);if(e.id==='tyr-leader-keywords')delete expectedOperation.keyword;
  assertSourceEffectExpectation({expectation:{...e,expectedOperation},book:candidate,applied,observation:observed,expectedObservation:wanted});
 }else assert.equal(applied.length,0,'INACTIVE GATE EXECUTED');
 const guide=projectPersonalBook(payload,s.snapshot());
 assert.ok(guide.instances.length===s.state.units.length,'Personal Guide lost physical instances');
 if(active)assert.ok(guide.allowedIds.has(e.source.canonicalId),'Personal Guide lost selected canonical source');
 return {observed,wanted};
}
const current=new Map();
for(const e of sevenEffectsExpectations){
 sourceCheck(e);bindingCheck(e);const f=sevenEffectFixtures[e.fixture],s=service(e),initial=s.snapshot();
 if(e.id==='tyr-guardian'){
  verify(e,s,{active:false});for(const leader of f.leaders){
   s.attach(leader,f.bodyguard);verify(e,s);const attached=clone(s.projection);s.load(s.snapshot());assert.deepEqual(s.projection,attached,'Recompute accumulated');verify(e,s);
   s.detach(leader);verify(e,s,{active:false});s.reattach(leader,f.otherBodyguard);verify(e,s);s.detach(leader);
  }s.attach(f.leaders[0],f.bodyguard);
 }else if(['tyr-elevated','tyr-power','tyr-chameleonic'].includes(e.id)){
  verify(e,s);const pairs=e.id==='tyr-elevated'?f.owners.map((owner,i)=>[owner,f.bodyguards[i]]):[[f.owner,f.bodyguard]];
  for(const [owner,body]of pairs){s.attach(owner,body);verify(e,s);s.detach(owner);verify(e,s);s.reattach(owner,body);verify(e,s);}
  const selected=s.snapshot(),off=clone(selected);for(const u of off.units){u.enhancementIds=u.enhancementIds.filter(id=>id!==e.source.canonicalId);u.enhancementAssignments=u.enhancementAssignments.filter(a=>a.enhancementId!==e.source.canonicalId);u.mfmEnhancementRecordIds=[];}
  s.load(off);verify(e,s,{active:false});s.load(selected);verify(e,s);
 }else{
  verify(e,s);if(e.fixture==='leaderBeasts')for(let i=0;i<2;i++){s.attach(f.leaders[i],f.bodyguards[i]);verify(e,s);s.detach(f.leaders[i]);verify(e,s);s.reattach(f.leaders[i],f.bodyguards[i]);verify(e,s);}
  const on=s.snapshot();assert.equal(s.import(f.text.replace('+ DETACHMENT: '+f.detachment,'+ DETACHMENT: Invasion Fleet'),{},{replaceExisting:true}).status,'READY');
  for(const a of on.attachments)s.attach(a.leaderInstanceId,a.bodyguardInstanceId);verify(e,s,{active:false});s.load(on);verify(e,s);
 }
 const saved=s.snapshot(),projection=clone(s.projection);s.load(JSON.parse(JSON.stringify(saved)));assert.deepEqual(s.projection,projection);verify(e,s);
 const repeated=service(e);assert.deepEqual(repeated.snapshot(),initial,'Repeated import changed physical/canonical identities');
 current.set(e.id,saved);scenarios.push({id:e.id,status:'PASS',canonicalId:e.source.canonicalId,physicalInstances:s.state.units.length,removeRecompute:true,presentation:true,personalGuide:true});
}

// Invalid physical Enhancement owners must fail both the import boundary and
// the existing selector at execution, including borrowed formed keywords.
for(const [id,leader,body,invalidIndex]of [
 ['tyr-elevated','unit-winged-tyranid-prime','unit-tyranid-warriors-with-melee-bio-weapons',1],
 ['tyr-power','unit-neurotyrant','unit-tyrant-guard',1],
 ['tyr-chameleonic','unit-hive-tyrant','unit-tyrant-guard',0]]){
 const e=sevenEffectsExpectations.find(e=>e.id===id),f=sevenEffectFixtures[e.fixture],s=createTyranidsBrowserRoster(book);
 assert.notEqual(s.import(make(f.detachment,[[invalidIndex?body:leader,e.source.canonicalId]])).status,'READY','Invalid physical Enhancement owner passed import');
 assert.notEqual(s.import(f.text.replace('+ DETACHMENT: '+f.detachment,'+ DETACHMENT: Crusher Stampede')).status,'READY','Foreign Detachment Enhancement passed import');
 assert.equal(s.import(make(f.detachment,[leader,body])).status,'READY');s.attach('parsed-unit-1','parsed-unit-2');
 const forged=clone(s.snapshot()),owner=forged.units[invalidIndex],ownerId=owner.instanceId;
 // Select exactly one physical MODEL, so a multi-model bearer validation
 // failure cannot stand in for the eligibility selector being tested.
 const row=owner.modelRows[0];
 if(row.quantity>1)owner.modelRows.splice(0,1,
  {...clone(row),rowId:row.rowId+'/one',quantity:1},
  {...clone(row),rowId:row.rowId+'/others',quantity:row.quantity-1});
 const untreated=createRosterRuntime(book,createTyranidsRuleSchema());untreated.load(forged);
 const bearer=untreated.effective(ownerId).profiles.find(profile=>profile.quantity===1);assert.ok(bearer);
 owner.enhancementIds=[e.source.canonicalId];owner.enhancementAssignments=[{enhancementId:e.source.canonicalId,modelScopeId:bearer.scopeId}];
 const bad=createRosterRuntime(book,createTyranidsRuleSchema());bad.load(forged);
 assert.deepEqual(runtimeRows(bad),runtimeRows(untreated),'Wrong physical MODEL borrowed the formed UNIT eligibility');
 assert.deepEqual(presentationRows(bad,e),presentationRows(untreated,e),'Wrong physical MODEL acquired a presentation effect');
 assert.ok(bad.projection.units.every(u=>!u.applied.some(a=>a.ruleId===e.source.canonicalId)));
 negativeControls.push({id:e.id,wrongPhysicalOwner:true,borrowedFormedKeywordsBlocked:true,foreignDetachmentImportRejected:true});
}

// Mutants remain disposable inputs/observations. Expected source values stay
// fixed; failures must come from source/operation/result comparisons.
function rejected(e,name,mutate){const b=clone(book);mutate(b);let s;
 if(name==='wrong-source-owner'){
  assert.throws(()=>sourceCheck(e,b),/SOURCE OWNER/,'Independent source owner comparator missed mutation');
  mutations.push({id:e.id,mutation:name});return;
 }
 try{s=service(e,b,current.get(e.id));}catch(error){throw new Error(`Mutation ${e.id}/${name} failed before comparator: ${error.message}`);}
 assert.throws(()=>verify(e,s,{candidate:b}),/SOURCE OWNER|CONTRACT OWNER|EXECUTABLE|SOURCE TYPED OPERATION|SOURCE -> EXECUTOR -> PRESENTATION|EXECUTOR RESULT REQUIRED/,'Comparator missed '+name);
 mutations.push({id:e.id,mutation:name});
}
for(const e of sevenEffectsExpectations){
 rejected(e,'deleted-executable-binding',b=>{const count=b.entities.filter(x=>x.ruleContract).length;removeEffects(b,e);assert.equal(b.entities.filter(x=>x.ruleContract).length,count);});
 rejected(e,'wrong-value-or-canonical-ability',b=>{const x=effects(b,e)[0];if(x.value!==undefined)x.value+=1;else if(x.ability?.value!==undefined)x.ability.value=4;else if(x.ability)x.ability.canonicalId=e.abilityId==='core-stealth'?'core-deep-strike':'core-stealth';else x.keyword='TYRANIDS';});
 rejected(e,'wrong-source-owner',b=>{b.entities.find(x=>x.id===e.source.canonicalId).parentId='unit-psychophage';});
 const badContract=clone(book);badContract.entities.find(x=>x.id===e.source.canonicalId).ruleContract.ownerId='unit-psychophage';
 assert.throws(()=>bindingCheck(e,badContract),/CONTRACT OWNER/);mutations.push({id:e.id,mutation:'wrong-contract-owner'});
 rejected(e,'wrong-recipient',b=>{for(const x of effects(b,e))x.conditions.push({binding:'TARGET',predicate:{predicate:x.targetSubject==='MODEL'?'MODEL_ID':'UNIT_ID',subject:x.targetSubject,contextLevel:'STATIC',arguments:{id:x.targetSubject==='MODEL'?'datasheet-psychophage:profile:1':'unit-psychophage'},evidence:clone(x.evidence)}});});
 rejected(e,'wrong-activation-gate',b=>{const rule=b.entities.find(x=>x.id===e.source.canonicalId).ruleContract;
  if(e.id==='tyr-guardian')for(const x of effects(b,e))x.conditions.push({binding:'SOURCE',predicate:{predicate:'LEADING',subject:'UNIT',contextLevel:'ROSTER',arguments:{value:true},evidence:clone(x.evidence)}});
  else rule.detachmentId='detachment-crusher-stampede';});
 const s=service(e,book,current.get(e.id)),result=verify(e,s),mutated=clone(result.observed),baseline=runtimeRows(service(e,baseBooks.get(e.id),s.snapshot()));
 const affected=recipients(e,s.snapshot())[0],row=mutated.presentation.find(x=>x.id===affected);
 if(e.abilityId)row.abilityRows=[];
 else if(e.id==='tyr-leader-keywords')row.keywords=row.keywords.filter(k=>!e.keywords.includes(k));
 else if(e.id==='tyr-leader-invulnerable')delete row.profiles[0].stats.INSV;
 else {const w=row.weapons.find(w=>e.id==='tyr-power'?w.id===e.psychicProfileId:true);w.ap=baseline.find(u=>u.id===affected).weapons.find(x=>x.id===w.id&&x.scope===w.scope).data.ap;}
 assert.throws(()=>verify(e,s,{observation:mutated}),/SOURCE -> EXECUTOR -> PRESENTATION/,'Missing presentation escaped comparator');
 mutations.push({id:e.id,mutation:'missing-production-presentation-result'});
}
export const sevenEffectsGuardResult={status:'PASS',obligations:7,scenarios,mutations:mutations.length,mutationResults:mutations,
 negativeControls,
 expectedSource:'Independently reviewed accepted raw HTML and fixed source-derived values; no declaration-derived expected census',
 realNewRecruitExportTested:false,battleSimulationAdded:false};
console.log(JSON.stringify(sevenEffectsGuardResult));

/** Stage3D source-authored expectations through native physical import.
 * No browser, army-legality, real export or unknown battle event is claimed. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import {buildDarkAngelsContracts} from './rule-contract-build.mjs';
import {declarations} from './rule-contract-declarations.mjs';
import {buildDarkAngelsImportBook} from './roster-import-build.mjs';
import {createDarkAngelsRosterService} from './roster-import.mjs';
import {buildGameplayPresentation} from './gameplay-presentation-build.mjs';
import {createEffectiveCoreCatalog} from '../../core-rules/content/effective-core-catalog.mjs';
import {projectInstanceCards} from '../../shared/army-book-app-v2/personal.mjs';
const clone=structuredClone,built=buildDarkAngelsContracts(),book=buildDarkAngelsImportBook({built});
const index=new Map(book.entities.map(row=>[row.id,row])),cards=new Map(buildGameplayPresentation(built).cards.map(card=>[card.id,card]));
const ID={sammael:'unit-da-0e189995095847bf9d47',blackKnights:'unit-da-1f093db4ae584ac19636',command:'unit-da-467009b00bb9402dadee',
 outriders:'unit-sm-0dd92e6d8ad54ee6',intercessors:'unit-sm-59162946fee84360',mobile:'ability-da-a9d37be88a7a4a5a9efd',
 darkflight:'detachment-da-d7c1a2b23f2e443aa22a'};
const defaultDet=book.entities.find(row=>row.kind==='DETACHMENT'&&row.bookId==='space-marines').id;
const header=(det=defaultDet)=>'+ FACTION KEYWORD: Dark Angels\n+ DETACHMENT: '+index.get(det).data.title+'\n';
const text=id=>{
 const members=book.importBindings.compositions.filter(row=>row.ownerId===id&&row.quantity.min>0),unit=index.get(id);
 const ranged=unit.data.weaponIds.map(id=>index.get(id)).find(row=>row.data.mode==='ranged'&&!row.data.name.includes(','));
 return members.reduce((n,row)=>n+row.quantity.min,0)+'x '+unit.data.title+' (9999 pts)\n'+members.map(row=>
  '• '+row.quantity.min+'x '+index.get(row.id).data.name+(ranged?': 1x '+ranged.data.name:'')+'\n').join('');
};
const ready=(service,input,options)=>{const result=service.import(input,{},options);assert.equal(result.status,'READY',JSON.stringify(result.errors||result.needsBindings));return result;};
const checks=[],check=(id,fn)=>{fn();checks.push({id,status:'PASS'});};
const unit=(service,id)=>service.projection.units.find(row=>row.instanceId===id);
const assertMobile=(service,id,expected,rule=ID.mobile)=>{
 const physical=unit(service,id);assert.ok(physical);
 for(const model of physical.profiles){
  assert.equal(model.keywords.includes('MOBILE'),expected,id+'/'+model.scopeId);
  assert.equal(model.keywords.filter(value=>value==='MOBILE').length,expected?1:0,'Duplicate MODEL keyword');
 }
 const traces=physical.applied.filter(trace=>trace.ruleId===rule);
 assert.equal(traces.length,expected?physical.profiles.length:0,'Missing or duplicate MODEL contribution');
 if(expected)for(const model of physical.profiles)assert.equal(traces.filter(trace=>trace.targetCompositionId===model.scopeId).length,1);
 for(const trace of traces){assert.equal(trace.sourceInstanceId,'parsed-unit-1');assert.equal(trace.targetInstanceId,id);
  assert.equal(trace.operation,'GRANT_MODEL_KEYWORD');assert.equal(trace.field,'keywords');assert.ok(trace.targetCompositionId);
  assert.deepEqual(trace.sourceFields,[['text']]);}
 const effective=service.effective(id),personal=projectInstanceCards(cards,service.state.units.find(row=>row.instanceId===id),effective);
 const attributed=effective.applied.filter(trace=>trace.ruleId===rule);
 assert.equal(attributed.length,traces.length);
 for(const trace of attributed){assert.equal(trace.sourceInstanceId,'parsed-unit-1');assert.equal(trace.label,index.get(rule).data.title);}
 for(const model of physical.profiles){
  assert.equal(effective.profiles.find(row=>row.id===model.canonicalProfileId).keywords.includes('MOBILE'),expected);
  const projected=personal.get(model.canonicalProfileId);assert.ok(projected?.length);
 }
 const root=personal.get(physical.canonicalUnitId)[0];
 assert.equal(root.fields.some(field=>field.value==='MOBILE'&&field.runtimeDerived),expected,'Personal projection lost the derived keyword');
};
check('exact-accepted-source-and-core-model-scope',()=>{
 const rule=index.get(ID.mobile);assert.equal(rule.sourceEntityId,'da-source-9153eeea0f2a40a9a830');assert.equal(rule.parentId,ID.sammael);
 const raw=fs.readFileSync(new URL('./sources/raw/wahapedia-datasheets.html',import.meta.url));
 assert.equal(crypto.createHash('sha256').update(raw).digest('hex').toUpperCase(),'66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D');
 assert.equal(rule.provenance.pointer,'/html/body/div/div[1]/div[3]/div[6]/div[4]/div[2]/div[2]/div[3]');
 assert.ok(rule.data.text.includes('- This unit has MOBILE.\n- In your Command phase'));
 const core=createEffectiveCoreCatalog(),declaration=declarations.find(row=>row.ruleId===ID.mobile);
 assert.equal(declaration.coreDependencies.length,2);
 for(const proof of declaration.coreDependencies){const fact=core.getById(proof.id);assert.equal(fact.state,'FULL_CONTENT');assert.ok(fact.text.includes(proof.quote));}
 const clauses=rule.ruleContract.clauses.filter(row=>row.rosterEffects.length);assert.equal(clauses.length,1);
 assert.equal(clauses[0].rosterEffects.length,2);assert.ok(clauses[0].rosterEffects.every(effect=>effect.provenance.coreEvidence.length===2));
 assert.ok(rule.ruleContract.clauses.filter(row=>row.sourceText.includes('Command phase')||row.sourceText.includes('combat doctrine')).every(row=>row.rosterEffects.length===0));
});
check('detached-source-only-and-independent-identical-bodyguards',()=>{
 const service=createDarkAngelsRosterService(book);ready(service,header()+text(ID.sammael)+text(ID.blackKnights)+text(ID.blackKnights));
 assertMobile(service,'parsed-unit-1',true);assertMobile(service,'parsed-unit-2',false);assertMobile(service,'parsed-unit-3',false);
 const without=createDarkAngelsRosterService(book);ready(without,header()+text(ID.blackKnights)+text(ID.blackKnights));
 assertMobile(without,'parsed-unit-1',false);assertMobile(without,'parsed-unit-2',false);
});
check('source-formed-models-leader-support-detach-reattach-reload-reimport',()=>{
 const service=createDarkAngelsRosterService(book),input=header()+text(ID.sammael)+text(ID.blackKnights)+text(ID.blackKnights)+text(ID.command);
 ready(service,input);service.attach('parsed-unit-1','parsed-unit-2');service.attach('parsed-unit-4','parsed-unit-2');
 for(const id of ['parsed-unit-1','parsed-unit-2','parsed-unit-4'])assertMobile(service,id,true);
 assertMobile(service,'parsed-unit-3',false);
 const projection=service.projection,snapshot=service.snapshot();service.recompute();assert.deepEqual(service.projection,projection);
 service.load(JSON.parse(JSON.stringify(snapshot)));assert.deepEqual(service.projection,projection);
 ready(service,input);assert.deepEqual(service.snapshot(),snapshot);assert.deepEqual(service.projection,projection);
 service.detach('parsed-unit-1');assertMobile(service,'parsed-unit-1',true);assertMobile(service,'parsed-unit-2',false);assertMobile(service,'parsed-unit-4',false);
 service.reattach('parsed-unit-1','parsed-unit-3');assertMobile(service,'parsed-unit-3',true);assertMobile(service,'parsed-unit-2',false);assertMobile(service,'parsed-unit-4',false);
 ready(service,input);assertMobile(service,'parsed-unit-3',true);assertMobile(service,'parsed-unit-2',false);
 const noSource=header()+text(ID.blackKnights)+text(ID.blackKnights)+text(ID.command);
 assert.equal(service.import(noSource).status,'REPLACEMENT_REQUIRED');assertMobile(service,'parsed-unit-3',true);
 ready(service,noSource,{replaceExisting:true});for(const physical of service.projection.units)assertMobile(service,physical.instanceId,false);
});
check('independent-command-squad-model-modifier-survives-mobile-detach',()=>{
 const service=createDarkAngelsRosterService(book),input=header()+text(ID.sammael)+text(ID.blackKnights)+text(ID.command);
 ready(service,input);service.attach('parsed-unit-1','parsed-unit-2');service.attach('parsed-unit-3','parsed-unit-2');
 const assertOc=id=>{const physical=unit(service,id);for(const model of physical.profiles){
  assert.equal(Number(model.profile.stats.OC),Number(index.get(model.canonicalProfileId).data.stats.OC)+1);
  assert.equal(physical.applied.filter(trace=>trace.ruleId==='ability-da-4d1396f4342347baa772'&&trace.targetCompositionId===model.scopeId).length,1);
 }};
 for(const id of ['parsed-unit-1','parsed-unit-2','parsed-unit-3']){assertMobile(service,id,true);assertOc(id);}
 const projection=service.projection;service.recompute();assert.deepEqual(service.projection,projection);
 ready(service,input);assert.deepEqual(service.projection,projection);
 service.detach('parsed-unit-1');assertMobile(service,'parsed-unit-1',true);
 for(const id of ['parsed-unit-2','parsed-unit-3']){assertMobile(service,id,false);assertOc(id);}
 // The existing SM Skilled Riders precedent belongs to another Chapter and must
 // not be imported as an Outrider ability merely to manufacture an overlap.
 assert.ok(!index.has('ability-sm-171a2821469d4d0e'));
});
check('chapter-unit-keywords-stay-scoped-while-darkflight-cover-remains-computed',()=>{
 const service=createDarkAngelsRosterService(book),generic=header(ID.darkflight)+text(ID.outriders)+text(ID.intercessors);
 ready(service,generic);assert.ok(!unit(service,'parsed-unit-1').keywords.includes('RAVENWING'));
 assert.ok(service.chapterContexts.every(row=>row.armyApplicability.status==='DA_ARMY_CONTEXT_NOT_PROVEN'));
 const proven=header(ID.darkflight)+text(ID.sammael)+text(ID.outriders)+text(ID.outriders);ready(service,proven,{replaceExisting:true});
 for(const physical of service.projection.units.slice(1)){
  assert.ok(physical.keywords.includes('RAVENWING'));assert.ok(physical.profiles.every(model=>!model.keywords.includes('RAVENWING')));
 }
 const ranged=[...unit(service,'parsed-unit-1').weapons,...unit(service,'parsed-unit-1').profiles.flatMap(model=>model.weapons)].filter(weapon=>weapon.data.mode==='ranged');
 assert.ok(ranged.length);assert.ok(ranged.every(weapon=>weapon.data.abilities.includes('IGNORES COVER')));
 assert.ok(unit(service,'parsed-unit-1').applied.some(trace=>trace.ruleId==='detachment-rule-da-6a259c00bc9f4bf498ee'));
});
check('new-clause-mutation-controls-and-no-battle-automation',()=>{
 const missing=clone(book);missing.entities.find(row=>row.id===ID.mobile).ruleContract.clauses.forEach(row=>{
  if(row.rosterEffects.length){row.rosterEffects=[];row.rosterClassification='DISPLAY_ONLY';row.rosterClassificationNote={reason:'Mutation removes source binding'};}});
 const service=createDarkAngelsRosterService(missing);ready(service,header()+text(ID.sammael)+text(ID.blackKnights));
 assert.throws(()=>assertMobile(service,'parsed-unit-1',true));
 const bad=clone(declarations);bad.find(row=>row.ruleId===ID.mobile).coreDependencies[0].quote='Unproven model scope';assert.throws(()=>buildDarkAngelsContracts({inputs:bad}),/Unproved Core static dependency/);
 const wrong=clone(book);wrong.entities.find(row=>row.id===ID.mobile).ruleContract.clauses.filter(row=>row.rosterEffects.length).forEach(row=>{
  for(const effect of row.rosterEffects)if(effect.targetBinding==='SOURCE_FORMED_MODELS')effect.targetBinding='SOURCE_UNIT_MODELS';});
 const narrowed=createDarkAngelsRosterService(wrong);ready(narrowed,header()+text(ID.sammael)+text(ID.blackKnights));narrowed.attach('parsed-unit-1','parsed-unit-2');
 assert.throws(()=>assertMobile(narrowed,'parsed-unit-2',true),'Missing formed recipients must be detected');
});
console.log(JSON.stringify({status:'PASS',checks,counts:{newExecutableClauses:1,checks:checks.length,coreScopeProofs:2,mutationControls:3},
 effect:'MOBILE MODEL keyword derived from UNIT ability with explicit Core scope proof; no new movement simulation',
 limits:{doctrine:'TEXT_ONLY_NO_COMMAND_PHASE_ASSUMED',psychic:'TEXT_ONLY_NO_ROLL_ASSUMED',incoming:'UNSUPPORTED',qualifiedFnp:'TEXT_ONLY',
  genericOnlyChapter:'NOT_PROVEN',realNewRecruitExportTested:false,browserVerified:false}},null,2));

/** Focused source/input ownership and persistence regressions, constructed NR. */
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {sourceSnapshot} from '../../shared/source-refs-v2/source-refs.mjs';
import {sourceFixture} from '../../../tests/helpers/source-refs-fixtures.mjs';
import {buildDarkAngelsImportBook} from './roster-import-build.mjs';
import {createDarkAngelsRosterService} from './roster-import.mjs';
import {renderRosterPointsStatus} from '../../shared/army-book-app-v2/roster.mjs';
import {projectInstanceCards} from '../../shared/army-book-app-v2/personal.mjs';
import {buildGameplayPresentation} from './gameplay-presentation-build.mjs';
const clone=structuredClone,book=buildDarkAngelsImportBook(),index=new Map(book.entities.map(row=>[row.id,row]));
const header='+ FACTION KEYWORD: Dark Angels\n+ DETACHMENT: Gladius Task Force\n';
const checks=[],check=(id,fn)=>{fn();checks.push({id,status:'PASS'});};
const cards=new Map(buildGameplayPresentation().cards.map(card=>[card.id,card]));
const ready=(service,text,bindings={},options)=>{const result=service.import(text,bindings,options);assert.equal(result.status,'READY',JSON.stringify({needs:result.needsBindings,errors:result.errors}));return result;};
const unitText=(id,{unitGear='',modelGear=''}={})=>{
 const members=book.importBindings.compositions.filter(row=>row.ownerId===id&&row.quantity.min>0),count=members.reduce((n,row)=>n+row.quantity.min,0);
 return count+'x '+index.get(id).data.title+' (9999 pts)'+(unitGear?': '+unitGear:'')+'\n'+
  members.map((row,n)=>'• '+row.quantity.min+'x '+index.get(row.id).data.name+(n===0&&modelGear?': '+modelGear:'')+'\n').join('');
};
const shieldUnit='unit-sm-5ce71f2f4e5e4ebb',shieldRule='ability-sm-aa81f0067a3140de';
check('unit-paid-inventory-never-guesses-model-bearer',()=>{
 const service=createDarkAngelsRosterService(book);ready(service,header+unitText(shieldUnit,{unitGear:'1x Storm Shield'}));
 assert.equal(service.points.units[0].paid.knownPaidPoints,5);
 assert.ok(service.projection.units[0].profiles.every(model=>model.profile.stats.W==='3'));
 assert.ok(!service.projection.units[0].applied.some(trace=>trace.ruleId===shieldRule));
 const selection=service.state.units[0].selections[0];assert.equal(selection.sourceEquipmentIdentity,shieldRule);
 assert.deepEqual(sourceSnapshot(selection,{slot:'sourceEquipmentProvenance'}),sourceSnapshot(index.get(shieldRule)));assert.equal(selection.physicalQuantity,1);
});
check('confirmed-model-equipment-effect-isolated-from-other-models-and-unit-copy',()=>{
 const service=createDarkAngelsRosterService(book),text=header+unitText(shieldUnit,{modelGear:'1x Storm Shield'})+unitText(shieldUnit,{unitGear:'1x Storm Shield'});
 ready(service,text);const scope=service.state.units[0].modelRows[0].canonicalProfileId;
 for(const model of service.projection.units[0].profiles)assert.equal(model.profile.stats.W,model.canonicalProfileId===scope?'4':'3');
 assert.ok(service.projection.units[1].profiles.every(model=>model.profile.stats.W==='3'));
 const effective=service.effective(service.state.units[0].instanceId),personal=projectInstanceCards(cards,service.state.units[0],effective);
 for(const model of service.projection.units[0].profiles){
  const expected=model.canonicalProfileId===scope?'4':'3',profile=effective.profiles.find(row=>row.id===model.canonicalProfileId);
  assert.equal(profile.fields.find(field=>field.label==='stats').value.W,expected);
  assert.ok(personal.get(model.canonicalProfileId).some(card=>card.fields.some(field=>field.source?.path==='/stats/W'&&field.value===expected)));
 }
 assert.ok(service.projection.units[0].applied.filter(trace=>trace.ruleId===shieldRule).every(trace=>trace.targetCompositionId?.includes('/PROFILE/')));
 const snapshot=service.snapshot(),projection=service.projection;service.recompute();assert.deepEqual(service.projection,projection);
 ready(service,text);assert.deepEqual(service.snapshot(),snapshot);
 const restored=createDarkAngelsRosterService(book);restored.load(JSON.parse(JSON.stringify(snapshot)));assert.deepEqual(restored.projection,projection);
});
check('exact-enhancement-bearer-reimport-choice-and-sibling-isolation',()=>{
 const enhancement='enhancement-sm-33db6f7f8bc04d0c',det=index.get(enhancement).parentId;
 const text='+ FACTION KEYWORD: Dark Angels\n+ DETACHMENT: '+index.get(det).data.title+'\n2x Captain (9999 pts)\n• 1x Captain\n• 1x Captain\nEnhancement: '+index.get(enhancement).data.title+'\n';
 const service=createDarkAngelsRosterService(book),result=service.import(text);assert.equal(result.status,'NEEDS_BINDINGS');
 const need=result.needsBindings.find(row=>row.kind==='ENHANCEMENT_BEARER');assert.equal(need.candidates.length,2);
 ready(service,text,{enhancementBearers:{[need.key]:need.candidates[1].id}});
 assert.equal(service.state.units[0].enhancementAssignments[0].modelScopeId,need.candidates[1].id);
 const snapshot=service.snapshot(),projection=service.projection;ready(service,text);assert.deepEqual(service.snapshot(),snapshot);
 service.recompute();assert.deepEqual(service.projection,projection);
 const invalid=clone(snapshot);invalid.units[0].enhancementAssignments[0].modelScopeId='foreign-scope';
 assert.throws(()=>service.load(invalid));assert.deepEqual(service.snapshot(),snapshot);
});
check('unit-upgrade-can-use-proven-army-grant-without-model-keyword',()=>{
 const upgrade='enhancement-da-3c2c519eaabc48088aa4',det=index.get(upgrade).parentId;
 const text='+ FACTION KEYWORD: Dark Angels\n+ DETACHMENT: '+index.get(det).data.title+'\n'+
  unitText('unit-sm-0dd92e6d8ad54ee6')+'Enhancement: '+index.get(upgrade).data.title+'\n'+unitText('unit-da-f8f0629206e744459a9f');
 const service=createDarkAngelsRosterService(book);ready(service,text);
 const unit=service.projection.units[0];assert.ok(unit.keywords.includes('RAVENWING'));
 assert.ok(unit.profiles.every(model=>!model.keywords.includes('RAVENWING')));assert.equal(service.state.units[0].enhancementAssignments.length,0);
 const saved=service.snapshot(),unknown=text.slice(0,text.indexOf('1x Azrael'));
 assert.notEqual(service.import(unknown,{}, {replaceExisting:true}).status,'READY');assert.deepEqual(service.snapshot(),saved);
});
check('unknown-and-resolved-points-feed-existing-warning-renderer',()=>{
 const element=tag=>({tag,children:[],dataset:{},value:'',attributes:{},set textContent(value){this.value=String(value);this.children=[];},
  get textContent(){return this.value+this.children.map(child=>child.textContent).join('');},get childElementCount(){return this.children.length;},append(...nodes){this.children.push(...nodes);},setAttribute(key,value){this.attributes[key]=value;}});
 const document={createElement:element},service=createDarkAngelsRosterService(book),id='unit-da-9f8f2ccbdb7d4c72857c';
 ready(service,header+unitText(id));assert.equal(service.points.status,'UNRESOLVED');assert.equal(service.points.totalPoints,null);
 const warning=renderRosterPointsStatus(document,{service,titleForId:key=>index.get(key)?.data.title});
 assert.match(warning.textContent,/Points cannot be calculated reliably/);assert.match(warning.textContent,/Cyclone/i);
 const saved=service.snapshot(),forged=clone(saved);forged.units[0].equipmentContextKnown=true;
 assert.throws(()=>service.load(forged));assert.deepEqual(service.snapshot(),saved);
 ready(service,header+unitText(id,{unitGear:'1x Cyclone Missile Launcher'}),{}, {replaceExisting:true});
 assert.equal(service.points.status,'RESOLVED');assert.equal(renderRosterPointsStatus(document,{service}),null);
 const snapshot=service.snapshot();service.load(JSON.parse(JSON.stringify(snapshot)));assert.equal(service.points.status,'RESOLVED');
});
check('quantity-identity-and-owner-mutations-cannot-replace-saved-roster',()=>{
 const service=createDarkAngelsRosterService(book);ready(service,header+unitText(shieldUnit,{modelGear:'1x Storm Shield'}));
 const saved=service.snapshot();let controls=0;
 for(const corrupt of [
  value=>{value.units[0].modelRows[0].selections[0].physicalQuantity+=1;},
  value=>{value.units[0].modelRows[0].selections[0].sourceEquipmentIdentity='wrong-id';},
  value=>{sourceFixture(value.units[0].modelRows[0].selections[0]).sourceEquipmentProvenance.sha256='00';},
  value=>{value.units[0].modelRows[0].selections[0].canonicalFieldPaths[shieldRule]=['/wrong'];},
  value=>{value.units[0].modelRows[0].selections.push(clone(value.units[0].modelRows[0].selections[0]));},
  value=>{value.units[0].mfmUnitRecordId='foreign-price';},
  value=>{value.units[0].modelRows[0].canonicalProfileId=index.get('unit-da-f8f0629206e744459a9f').data.profileIds[0];}
 ]){const bad=clone(saved);corrupt(bad);assert.throws(()=>service.load(bad),undefined,'Snapshot mutation '+controls+' escaped');assert.deepEqual(service.snapshot(),saved);controls++;}
 assert.equal(controls,7);
});
console.log(JSON.stringify({status:'PASS',checks,quantityOwnershipMutations:7,
 uncertainty:'UNRESOLVED totalPoints=null; existing warning renderer PASS',
 uiProof:'PRESENTATION_FUNCTION_ONLY_NOT_BROWSER',realNewRecruitExportTested:false},null,2));

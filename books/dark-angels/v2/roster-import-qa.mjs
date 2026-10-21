/** Independent source/input parity through the real shared import boundary.
 * All input texts are constructed, not authentic New Recruit exports. */
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {buildDarkAngelsImportBook} from './roster-import-build.mjs';
import {createDarkAngelsRosterService} from './roster-import.mjs';
import {buildGameplayPresentation} from './gameplay-presentation-build.mjs';
import {createDarkAngelsRuleSchema} from './rule-contract-schema.mjs';
import {formRoster,predicateContext,selections} from '../../shared/roster-v2/context.mjs';
import {createRosterImportService} from '../../shared/roster-v2/import-service.mjs';
import {enhancementOwnerContext} from '../../shared/roster-v2/compatibility-context.mjs';
import {projectInstanceCards,projectPersonalBook} from '../../shared/army-book-app-v2/personal.mjs';
import {renderRosterPointsStatus} from '../../shared/army-book-app-v2/roster.mjs';
const read=path=>JSON.parse(fs.readFileSync(new URL(path,import.meta.url),'utf8')),clone=structuredClone;
const book=buildDarkAngelsImportBook(),index=new Map(book.entities.map(row=>[row.id,row]));
const sources=new Map([...read('./generated/effective.json').entities,...read('../../space-marines/v2/generated/effective.json').entities].map(row=>[row.id,row]));
const originalSources=JSON.stringify([...sources.values()]),payload=buildGameplayPresentation(),cards=new Map(payload.cards.map(card=>[card.id,card]));
const rawCaptures={'dark-angels':read('../../../mfm/sources/v1.6/dark-angels.json'),'space-marines':read('../../../mfm/sources/v1.6/space-marines.json')};
const priceBridges=[...read('./mfm-bindings.json').unitBindings,...read('../../space-marines/v2/mfm-bindings.json').unitBindings];
const sourceBase=(unitId,count,copy=1)=>{
 const binding=priceBridges.find(row=>row.entityId===unitId),owner=sources.get(unitId).bookId;
 const source=binding.proof.mfm.jsonPointer.slice(1).split('/').reduce((node,key)=>node[key],rawCaptures[owner]);
 const prices=source.pointSchedules.filter(row=>(row.minCopies===undefined||copy>=row.minCopies)&&(row.maxCopies===undefined||copy<=row.maxCopies))
  .flatMap(row=>row.entries).filter(row=>count>=row.minModels&&count<=row.maxModels);
 return prices.length===1?prices[0].value:null;
};
const ID={azrael:'unit-da-f8f0629206e744459a9f',command:'unit-da-467009b00bb9402dadee',sammael:'unit-da-0e189995095847bf9d47',
 out:'unit-sm-0dd92e6d8ad54ee6',ordinary:'unit-sm-59162946fee84360',darkflight:'detachment-da-d7c1a2b23f2e443aa22a',
 cyclone:'unit-da-9f8f2ccbdb7d4c72857c',lazarus:'unit-da-efa93d33ea414d8b8f11'};
const defaultDet=book.entities.find(row=>row.kind==='DETACHMENT'&&row.bookId==='space-marines').id;
const header=(ids=[defaultDet])=>'+ FACTION KEYWORD: Dark Angels\n'+ids.map(id=>'+ DETACHMENT: '+index.get(id).data.title+'\n').join('');
const fixture=(id,{weapon,unitGear='',enhancement,optional=true}={})=>{
 const unit=sources.get(id),members=[...sources.values()].filter(row=>row.kind==='COMPOSITION_MEMBER'&&row.parentId===id&&
  (optional||row.data.quantity.min>0));
 assert.ok(members.length);
 const rows=members.map((member,n)=>({id:member.id,quantity:Math.max(1,member.data.quantity.min),name:member.data.name,
  weapon:n===0&&weapon?weapon:null}));
 const count=rows.reduce((n,row)=>n+row.quantity,0);
 return {id,rows,count,text:count+'x '+unit.data.title+' (9999 pts)'+(unitGear?': '+unitGear:'')+'\n'+
  rows.map(row=>'• '+row.quantity+'x '+row.name+(row.weapon?': 1x '+row.weapon:'')+'\n').join('')+
  (enhancement?'Enhancement: '+sources.get(enhancement).data.title+'\n':'')};
};
const ready=(service,text,bindings={},options)=>{
 const result=service.import(text,bindings,options);
 assert.equal(result.status,'READY',JSON.stringify({needs:result.needsBindings,errors:result.errors}));return result;
};
const checks=[],physical=[],weaponEvidence=[],assignmentEvidence=[];
const check=(id,fn)=>{fn();checks.push({id,status:'PASS'});process.stderr.write(id+' PASS\n');};
const profileIds=new Set();let inputModelCount=0;
check('83-source-datasheets-113-profile-occurrences-and-native-projections',()=>{
 for(const unit of book.entities.filter(row=>row.kind==='DATASHEET')){
  const input=fixture(unit.id),service=createDarkAngelsRosterService(book);ready(service,header()+input.text);
  const actual=service.state.units[0];assert.equal(actual.canonicalUnitId,unit.id);assert.equal(actual.startingStrength,input.count);
  assert.equal(service.points.units[0].basePoints,sourceBase(unit.id,input.count),'Base cost differs from official MFM capture');
  assert.equal(actual.modelRows.length,input.rows.length);
  for(const [n,row]of actual.modelRows.entries()){
   const expected=input.rows[n],proof=book.importBindings.compositions.find(member=>member.id===expected.id);
   assert.equal(row.quantity,expected.quantity);assert.equal(row.compositionMemberId,expected.id);
   assert.equal(row.canonicalProfileId,proof.profileId);profileIds.add(row.canonicalProfileId);
   assert.equal(row.selections.length,0,'An omitted loadout became invented equipment');
  }
  assert.equal(index.get(unit.id).bookId,sources.get(unit.id).bookId);assert.deepEqual(index.get(unit.id).provenance,sources.get(unit.id).provenance);
  const effective=service.effective(actual.instanceId),variants=projectInstanceCards(cards,actual,effective);
  assert.ok(variants.get(unit.id)?.length);assert.equal(projectPersonalBook(payload,service.state).instances.length,1);
  if([ID.azrael,ID.command].includes(unit.id)){
   const snapshot=service.snapshot(),projection=service.projection;
   ready(service,header()+input.text);assert.deepEqual(service.snapshot(),snapshot);
   service.recompute();assert.deepEqual(service.projection,projection);
   service.load(JSON.parse(JSON.stringify(snapshot)));assert.deepEqual(service.projection,projection);
  }
  inputModelCount+=input.count;physical.push({canonicalId:unit.id,sourceOwner:unit.bookId,models:input.count,status:'PASS'});
 }
 assert.equal(physical.length,83);assert.equal(profileIds.size,113);
});
check('all-source-weapon-profiles-retain-exact-physical-owner-and-quantity',()=>{
 const shared=createRosterImportService(book,book.importBindings);
 for(const weapon of book.entities.filter(row=>row.kind==='WEAPON_PROFILE')){
  const input=fixture(weapon.parentId,{weapon:sources.get(weapon.id).data.name}),result=shared.import(header()+input.text);
  assert.equal(result.status,'READY',weapon.id+' '+JSON.stringify(result.needsBindings));
  const unit=result.roster.units[0],row=unit.modelRows[0],selection=row.selections[0];
  assert.ok(selection?.canonicalProfileIds.includes(weapon.id));assert.equal(selection.physicalQuantity,input.rows[0].quantity);
  assert.equal(selection.perModelQuantity,1);assert.equal(selection.canonicalEquipmentIds.length,0);
  assert.ok(selection.canonicalProfileIds.every(id=>index.get(id).parentId===unit.canonicalUnitId));
  weaponEvidence.push({canonicalWeaponId:weapon.id,ownerUnitId:weapon.parentId,physicalQuantity:selection.physicalQuantity,status:'PASS'});
 }
 assert.equal(weaponEvidence.length,397);
});
check('all-18-detachments-through-shared-parser',()=>{
 const ids=book.entities.filter(row=>row.kind==='DETACHMENT').map(row=>row.id),service=createDarkAngelsRosterService(book);
 ready(service,header(ids)+fixture(ID.azrael).text);assert.deepEqual(service.state.detachmentIds,ids);assert.equal(ids.length,18);
});
check('ravenwing-command-three-models-and-azrael-without-token-model',()=>{
 const service=createDarkAngelsRosterService(book);ready(service,header()+fixture(ID.command).text+fixture(ID.azrael).text);
 assert.equal(service.state.units[0].startingStrength,3);
 assert.deepEqual(new Set(service.state.units[0].modelRows.map(row=>row.canonicalProfileId)),
  new Set(['model-da-9bdc9ba0422949849ecc','model-da-8eb29eaced8e486caf37','model-da-d9a85659ae224494b0a7']));
 assert.equal(service.state.units[1].startingStrength,1);assert.equal(service.state.units[1].modelRows.length,1);
 const saved=service.snapshot(),invalid=service.import(header()+fixture(ID.azrael).text+'• 1x Watcher in the Dark\n');
 assert.notEqual(invalid.status,'READY');assert.deepEqual(service.snapshot(),saved);
});
check('26-chapter-grants-import-positive-negative-and-repeated-unit-isolation',()=>{
 for(const condition of read('./chapter-conditions.json').records){
  const id=condition.recipient.canonicalId,keyword=condition.grantedKeywords[0],service=createDarkAngelsRosterService(book);
  const input=fixture(id).text+fixture(id).text;
  const unknown=ready(service,header()+input);
  assert.ok(unknown.chapterContexts.every(row=>row.armyApplicability.status==='DA_ARMY_CONTEXT_NOT_PROVEN'));
  assert.ok(service.projection.units.every(row=>!row.keywords.includes(keyword)));
  const proven=ready(service,header()+input+fixture(ID.azrael).text,{}, {replaceExisting:true});
  for(const unit of service.projection.units.slice(0,2)){
   assert.ok(unit.keywords.includes(keyword));assert.ok(unit.profiles.every(model=>!model.keywords.includes(keyword)));
   assert.equal(service.chapterContext(unit.instanceId).chapter,null);
  }
  assert.ok(proven.chapterContexts.every(row=>row.armyApplicability.status==='DA_ARMY_CONTEXT_PROVEN'));
  const projection=service.projection;service.recompute();assert.deepEqual(service.projection,projection);
  ready(service,header()+input,{}, {replaceExisting:true});assert.ok(service.projection.units.every(row=>!row.keywords.includes(keyword)));
 }
});
check('40-source-enhancement-upgrade-assignments',()=>{
 const bareState=(candidate,det)=>({schema:'roster-v2/roster',bookId:'dark-angels',rosterId:'eligibility-probe',
  detachments:[{instanceId:'det',canonicalDetachmentId:det}],detachmentIds:[det],attachments:[],warlordInstanceId:null,
  units:[{instanceId:'probe',canonicalUnitId:candidate.id,startingStrength:candidate.count,warlord:null,selections:[],enhancementIds:[],
   modelRows:candidate.rows.map((row,n)=>({rowId:'row'+n,canonicalProfileId:book.importBindings.compositions.find(member=>member.id===row.id).profileId,quantity:row.quantity,compositionScope:'MODEL_ROW',selections:[]}))}]});
 for(const binding of book.importBindings.enhancements){
  let chosen;
  for(const unit of book.entities.filter(row=>row.kind==='DATASHEET')){
   const candidate=fixture(unit.id,{optional:false}),state=bareState(candidate,binding.detachmentId),projection=formRoster(book,state);
   const predicate=binding.assignmentReference?.selector||{predicate:'UNIT_KEYWORD',subject:'UNIT',contextLevel:'STATIC',arguments:{keyword:'ADEPTUS ASTARTES'}};
   const contract=index.get(binding.id).ruleContract,schema=createDarkAngelsRuleSchema();
   const contexts=binding.scope==='UNIT'?[predicateContext(state,projection,'probe','UNIT')]:projection.units[0].profiles.filter(row=>row.quantity===1).map(row=>predicateContext(state,projection,'probe','MODEL',row.scopeId));
   if(contexts.some(context=>schema.evaluatePredicate(predicate,enhancementOwnerContext(contract,context))==='TRUE')){chosen=candidate;break;}
  }
  assert.ok(chosen,'No confirmed source bearer for '+binding.id);
  const service=createDarkAngelsRosterService(book);ready(service,header([binding.detachmentId])+chosen.text+'Enhancement: '+sources.get(binding.id).data.title+'\n');
  const unit=service.state.units[0];assert.deepEqual(unit.enhancementIds,[binding.id]);
  assert.equal(unit.enhancementAssignments.length,binding.scope==='MODEL'?1:0);
  assignmentEvidence.push({canonicalId:binding.id,scope:binding.scope,recipientUnitId:unit.canonicalUnitId,status:'PASS'});
 }
 assert.equal(assignmentEvidence.length,40);
});
check('paid-option-import-numeric-totals-known-unknown-and-alternative-family',()=>{
 for(const binding of book.mfmPhysicalPaidOptions){
  const label=binding.profileIds.length?binding.alternativeProfilesOnePurchase?index.get(binding.profileIds[0]).data.name.split(/\s+[–—-]\s+/)[0]:index.get(binding.profileIds[0]).data.name:index.get(binding.equipmentIds[0]).data.title;
  const service=createDarkAngelsRosterService(book),without=fixture(binding.ownerUnitId);
  ready(service,header()+without.text);assert.equal(service.points.status,'UNRESOLVED');assert.equal(service.points.totalPoints,null);
  const input=fixture(binding.ownerUnitId,{unitGear:'2x '+label}),result=ready(service,header()+input.text,{}, {replaceExisting:true});
  const option=result.points.units[0].paid.options.find(row=>row.costRecordId===binding.costRecordId);
  assert.equal(option.quantity,2);assert.equal(option.points,2*binding.value);assert.equal(service.state.units[0].selections.length,1);
  assert.equal(result.points.units[0].totalPoints,result.points.units[0].basePoints+2*binding.value);
  const snapshot=service.snapshot();ready(service,header()+input.text);assert.deepEqual(service.snapshot(),snapshot);
  service.recompute();assert.equal(service.points.units[0].paid.options.find(row=>row.costRecordId===binding.costRecordId).quantity,2);
 }
});
check('leader-support-formation-effects-and-identical-reimport',()=>{
 const service=createDarkAngelsRosterService(book),text=header()+fixture(ID.sammael).text+fixture(ID.command).text+fixture(ID.out).text+fixture(ID.out).text;
 ready(service,text);service.attach('parsed-unit-1','parsed-unit-3');service.attach('parsed-unit-2','parsed-unit-3');
 assert.deepEqual(new Set(service.state.attachments.map(row=>row.role)),new Set(['LEADER','SUPPORT']));
 const before=service.snapshot(),projection=service.projection;ready(service,text);assert.deepEqual(service.snapshot(),before);assert.deepEqual(service.projection,projection);
 service.detach('parsed-unit-2');ready(service,text);assert.equal(service.state.attachments.length,1);
 service.reattach('parsed-unit-2','parsed-unit-3');assert.deepEqual(service.snapshot(),before);
 assert.equal(service.projection.formedUnits.length,1);assert.ok(!service.state.attachments.some(row=>row.bodyguardInstanceId==='parsed-unit-4'));
 const commander=service.projection.units.find(row=>row.instanceId==='parsed-unit-2');
 assert.ok(commander.applied.some(trace=>trace.ruleId==='ability-da-4d1396f4342347baa772'));
 const restored=createDarkAngelsRosterService(JSON.parse(JSON.stringify(book)));restored.load(JSON.parse(JSON.stringify(before)));
 assert.deepEqual(restored.projection,projection);
 const other=header()+fixture(ID.azrael).text;assert.equal(service.import(other).status,'REPLACEMENT_REQUIRED');assert.deepEqual(service.snapshot(),before);
 ready(service,other,{}, {replaceExisting:true});assert.equal(service.state.attachments.length,0);
});
check('negative-import-and-snapshot-preserve-previous-state',()=>{
 const service=createDarkAngelsRosterService(book);ready(service,header()+fixture(ID.azrael).text);const saved=service.snapshot();
 for(const text of [header()+'1x Marneus Calgar (999 pts)\n',header()+'1x Invented Unknown Unit (999 pts)\n',
  header().replace('Dark Angels','Tyranids')+fixture(ID.azrael).text]){
  assert.notEqual(service.import(text).status,'READY');assert.deepEqual(service.snapshot(),saved);
 }
 const malformed=clone(saved);malformed.units[0].modelRows[0].canonicalProfileId='unknown-model';
 assert.throws(()=>service.load(malformed));assert.deepEqual(service.snapshot(),saved);
 const foreign=clone(saved);foreign.units[0].modelRows[0].canonicalProfileId=index.get(ID.command).data.profileIds[0];
 assert.throws(()=>service.load(foreign));assert.deepEqual(service.snapshot(),saved);
 const lazarus=createDarkAngelsRosterService(book);ready(lazarus,header()+fixture(ID.lazarus).text+fixture(ID.ordinary).text);
 assert.throws(()=>lazarus.attach('parsed-unit-1','parsed-unit-2'));assert.equal(lazarus.state.attachments.length,0);
});
check('browser-native-runtime-closure-and-source-immutability',()=>{
 const visited=new Set();const visit=url=>{if(visited.has(url.href))return;visited.add(url.href);
  const text=fs.readFileSync(url,'utf8');for(const match of text.matchAll(/^import\s+.*?from\s+['"]([^'"]+)['"]/gm)){
   assert.ok(!match[1].startsWith('node:'),'Producer dependency leaked into runtime');if(match[1].startsWith('.'))visit(new URL(match[1],url));}};
 visit(new URL('./roster-boot.mjs',import.meta.url));assert.ok(visited.size>5);
 assert.equal(JSON.stringify([...sources.values()]),originalSources);
});
console.log(JSON.stringify({status:'PASS',checks,physical,weaponEvidence,assignmentEvidence,
 counts:{datasheetsImportable:physical.length,totalDatasheets:83,modelProfiles:profileIds.size,physicalModels:inputModelCount,
  weaponProfiles:weaponEvidence.length,detachments:18,enhancementAssignments:assignmentEvidence.filter(row=>row.scope==='MODEL').length,
  upgradeAssignments:assignmentEvidence.filter(row=>row.scope==='UNIT').length,chapterConditions:26,paidOptions:8},
 limitations:{fixtures:'CONSTRUCTED_NEW_RECRUIT_COMPATIBLE',realNewRecruitExportTested:false,browserVerified:false,
  genericOnlyChapter:'NOT_PROVEN',lazarus:'SOURCE_CONFLICT_INACTIVE',mfmRelationReferences:'10_REFERENCE_ONLY_UNCHANGED'}},null,2));

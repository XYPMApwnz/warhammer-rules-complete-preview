import {parseSourceFixtureJSON} from '../../../tests/helpers/source-refs-fixtures.mjs';
/** Independent physical-input oracle, plus accepted MFM capture comparisons.
 * These texts are constructed diagnostic New Recruit-compatible fixtures. */
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {buildSpaceMarinesImportBook,writeSpaceMarinesImportBook} from './roster-import-build.mjs';
import {createSpaceMarinesRosterImport,createSpaceMarinesRosterService} from './roster-import.mjs';
import {formRoster,predicateContext,selections} from '../../shared/roster-v2/context.mjs';
import {createSpaceMarinesRuleSchema} from './rule-contract-schema.mjs';
import {enhancementOwnerContext} from '../../shared/roster-v2/compatibility-context.mjs';
import {projectInstanceCards,projectPersonalBook} from '../../shared/army-book-app-v2/personal.mjs';
import {buildGameplayPresentation} from './gameplay-presentation-build.mjs';

const read=name=>parseSourceFixtureJSON(fs.readFileSync(new URL(name,import.meta.url),'utf8')),clone=structuredClone;
const facts=read('./generated/effective.json'),index=new Map(facts.entities.map(row=>[row.id,row]));
const book=buildSpaceMarinesImportBook(),sourceMfm=read('../../../mfm/sources/v1.6/space-marines.json');
const bridges=read('./mfm-bindings.json'),payload=buildGameplayPresentation(),cards=new Map(payload.cards.map(card=>[card.id,card]));
const DEFAULT='detachment-sm-6341f5a9b9584677',CAPTAIN='unit-sm-99eb03d4f2d448e2',INTERCESSORS='unit-sm-59162946fee84360';
const DAINAL_UNIT='unit-sm-c7226873c51d43c0',CATO='unit-sm-02d5dee4717544ad',MARNEUS='unit-sm-1af70808102d4286',VICTRIX='unit-sm-f169827c554c4eee';
const header=ids=>'+ FACTION KEYWORD: Space Marines\n'+(ids||[DEFAULT]).map(id=>'+ DETACHMENT: '+index.get(id).data.title+'\n').join('');
function fixture(id,{gear=true,unitEquipment='',modelEquipment='',enhancement='',extraModels=0,variant=0}={}){
  const unit=index.get(id),members=facts.entities.filter(row=>row.kind==='COMPOSITION_MEMBER'&&row.parentId===id&&row.data.quantity.min>0);
  const rows=members.map((member,n)=>{
    const quantity=member.data.quantity.min+(n===members.length-1?extraModels:0);
    const weaponIds=unit.data.weaponIds.filter(id=>!index.get(id).data.name.includes(',')),weaponId=weaponIds[(n+variant)%weaponIds.length];
    const weapon=gear&&weaponId?index.get(weaponId):null,selectedQuantity=1+(variant%2);
    const parts=[...(weapon?[selectedQuantity+'x '+weapon.data.name]:[]),...(modelEquipment&&n===0?['1x '+modelEquipment]:[])];
    return {memberId:member.id,name:member.data.name,quantity,weaponId:weapon?.id,selectedQuantity,
      text:'• '+quantity+'x '+member.data.name+(parts.length?': '+parts.join(', '):'')+'\n'};
  });
  const total=rows.reduce((sum,row)=>sum+row.quantity,0);
  return {id,total,rows,text:total+'x '+unit.data.title+' (9999 pts)'+(unitEquipment?': '+unitEquipment:'')+'\n'+rows.map(row=>row.text).join('')+
    (enhancement?'Enhancement: '+enhancement+'\n':'')};
}
function ready(service,text,choices={},options){
  const result=service.import(text,choices,options);assert.equal(result.status,'READY',JSON.stringify({needs:result.needsBindings,errors:result.errors}));return result;
}
function expectedBase(unitId,count,copy=1){
  const bridge=bridges.unitBindings.find(row=>row.entityId===unitId);
  const raw=bridge.proof.mfm.jsonPointer.slice(1).split('/').reduce((node,key)=>node[key],sourceMfm);
  const schedules=raw.pointSchedules.filter(row=>(row.minCopies===undefined||copy>=row.minCopies)&&(row.maxCopies===undefined||copy<=row.maxCopies));
  const prices=schedules.flatMap(row=>row.entries).filter(row=>count>=row.minModels&&count<=row.maxModels);
  return prices.length===1?prices[0].value:null;
}
function pricedFixture(unitId,options={}){
  const input=fixture(unitId,options),bridge=bridges.unitBindings.find(row=>row.entityId===unitId);
  const raw=bridge.proof.mfm.jsonPointer.slice(1).split('/').reduce((node,key)=>node[key],sourceMfm);
  return fixture(unitId,{...options,extraModels:raw.pointSchedules[0].entries[0].minModels-input.total});
}
const physical=[],blocked=[];let inputModelCount=0;
for(const unit of facts.entities.filter(row=>row.kind==='DATASHEET')){
  const input=fixture(unit.id),service=createSpaceMarinesRosterService(book),result=service.import(header()+input.text);
  if(unit.id===DAINAL_UNIT){assert.equal(result.status,'NEEDS_BINDINGS');blocked.push({unitId:unit.id,status:result.status,needs:result.needsBindings});continue;}
  assert.equal(result.status,'READY',unit.id+' '+JSON.stringify({needs:result.needsBindings,errors:result.errors}));
  const actual=service.state.units[0];assert.equal(actual.canonicalUnitId,unit.id);assert.equal(actual.startingStrength,input.total);
  assert.equal(actual.modelRows.length,input.rows.length);
  for(const [n,row]of actual.modelRows.entries()){
    const expected=input.rows[n];assert.equal(row.quantity,expected.quantity);assert.equal(row.presentationLabel,expected.name);assert.equal(row.compositionMemberId,expected.memberId);
    if(expected.weaponId){assert.equal(row.selections.length,1,'Default/duplicate weapon introduced');
      assert.ok(row.selections[0].canonicalProfileIds.includes(expected.weaponId));assert.equal(row.selections[0].physicalQuantity,expected.quantity*expected.selectedQuantity);}
  }
  const effective=service.effective(actual.instanceId),variants=projectInstanceCards(cards,actual,effective);
  assert.ok(variants.get(unit.id)?.length);assert.equal(projectPersonalBook(payload,service.state).instances.length,1);
  for(const weapon of effective.weapons)assert.ok(variants.get(weapon.id).some(card=>card.scopeId===weapon.scopeId&&card.selectionKey===weapon.selectionKey));
  const snapshot=service.snapshot(),projection=service.projection;
  ready(service,header()+input.text);assert.deepEqual(service.snapshot(),snapshot);service.load(snapshot);assert.deepEqual(service.projection,projection);
  inputModelCount+=input.total;physical.push({unitId:unit.id,models:input.total,status:'PASS',points:result.points.status});
}
assert.equal(physical.length,84);assert.equal(blocked.length,1);

// All 21 existing Detachment identities pass through the real shared parser.
const detachmentInput=fixture(INTERCESSORS),allDetachmentIds=facts.entities.filter(row=>row.kind==='DETACHMENT').map(row=>row.id);
const multi=createSpaceMarinesRosterService(book);ready(multi,header(allDetachmentIds)+detachmentInput.text);
assert.deepEqual(multi.state.detachmentIds,allDetachmentIds);assert.equal(multi.points.detachmentPoints.length,21);

// Repeated canonical units keep independent model counts and selected pieces.
const small=fixture(INTERCESSORS),large=fixture(INTERCESSORS,{extraModels:5,variant:1});
const repeated=createSpaceMarinesRosterService(book);ready(repeated,header()+small.text+large.text);
assert.deepEqual(repeated.state.units.map(row=>row.startingStrength),[5,10]);assert.equal(new Set(repeated.state.units.map(row=>row.instanceId)).size,2);
assert.deepEqual(repeated.points.units.map(row=>row.basePoints),[85,170]);
assert.notDeepEqual(repeated.state.units[0].modelRows.map(row=>row.selections),repeated.state.units[1].modelRows.map(row=>row.selections));

const paidSourceExpected=[10,5,10,15,5,10,10,5],paidResults=[];
for(const [n,binding]of book.mfmPhysicalPaidOptions.entries()){
  assert.equal(binding.value,paidSourceExpected[n]);
  const selectedId=binding.equipmentIds[0]||binding.profileIds[0],selectedSource=index.get(selectedId);
  const label=binding.equipmentIds.length?selectedSource.data.title:selectedSource.data.name.split(/\s+[–—-]\s+/)[0];
  const input=pricedFixture(binding.ownerUnitId,{unitEquipment:'1x '+label}),service=createSpaceMarinesRosterService(book);
  const result=ready(service,header()+input.text),paid=result.points.units[0].paid;
  // A fixture's normal weapon may itself be the paid weapon. Use explicitly
  // selected equipment-only inventory for an independent one-purchase control.
  const clean=pricedFixture(binding.ownerUnitId,{gear:false,unitEquipment:'1x '+label});
  const exact=createSpaceMarinesRosterService(book),one=ready(exact,header()+clean.text);
  assert.equal(one.points.units[0].paid.totalPaidPoints,paidSourceExpected[n]);
  assert.equal(one.points.units[0].basePoints,expectedBase(binding.ownerUnitId,clean.total));
  assert.equal(one.points.totalPoints,expectedBase(binding.ownerUnitId,clean.total)+paidSourceExpected[n]);
  assert.ok(one.points.units[0].paid.options[0].selections.every(row=>row.scope.modelScopeId===null),'UNIT inventory acquired a fabricated MODEL');
  const nonPaid=index.get(binding.ownerUnitId).data.weaponIds.find(id=>!binding.profileIds.includes(id)&&!index.get(id).data.name.includes(','));
  const noPaid=pricedFixture(binding.ownerUnitId,{gear:false,unitEquipment:'1x '+index.get(nonPaid).data.name});
  const pair=createSpaceMarinesRosterService(book);ready(pair,header()+clean.text+noPaid.text);
  assert.deepEqual(pair.points.units.map(row=>row.paid.totalPaidPoints),[paidSourceExpected[n],0]);
  const before=pair.snapshot();ready(pair,header()+clean.text+noPaid.text);assert.deepEqual(pair.snapshot(),before);
  const missing=createSpaceMarinesRosterService(book);ready(missing,header()+pricedFixture(binding.ownerUnitId,{gear:false}).text);
  assert.equal(missing.points.status,'UNRESOLVED');assert.equal(missing.points.totalPoints,null);
  const corrupted=missing.snapshot();corrupted.units[0].equipmentContextKnown=true;
  assert.throws(()=>missing.load(corrupted));assert.equal(missing.points.totalPoints,null,'Unsupported snapshot flag turned missing evidence into zero');
  paidResults.push({costRecordId:binding.costRecordId,sourcePrice:paidSourceExpected[n],sourceOwner:binding.ownerUnitId,status:'PASS',selected:true,unselected:true,reimport:true,missingEvidence:'UNRESOLVED'});
}
assert.equal(paidResults.length,8);

// Every source-backed assignment can be represented, without executing unknown
// battle conditions. Fixture recipient discovery is not a new eligibility oracle.
const assignmentResults=[],schema=createSpaceMarinesRuleSchema();
for(const binding of book.importBindings.enhancements){
  let chosen=null;
  for(const source of facts.entities.filter(row=>row.kind==='DATASHEET'&&row.id!==DAINAL_UNIT)){
    const candidate=fixture(source.id,{gear:false});
    // Discover a diagnostic recipient from source MODEL rows without repeatedly
    // executing full imports. The chosen fixture still goes through the real
    // parser/import/commit path below, with no expected result taken from it.
    const state={schema:'roster-v2/roster',bookId:book.bookId,rosterId:'recipient-fixture-discovery',
      detachments:[{instanceId:'det/one',canonicalDetachmentId:binding.detachmentId}],detachmentIds:[binding.detachmentId],attachments:[],warlordInstanceId:null,
      units:[{instanceId:'parsed-unit-1',canonicalUnitId:source.id,startingStrength:candidate.total,selections:[],enhancementIds:[],warlord:null,
        modelRows:candidate.rows.map((row,n)=>({rowId:'row/'+n,canonicalProfileId:book.importBindings.compositions.find(member=>member.id===row.memberId).profileId,
          compositionScope:'MODEL_ROW',quantity:row.quantity,selections:[],loadouts:[]}))}]};
    const projection=formRoster(book,state),contract=book.entities.find(row=>row.id===binding.id).ruleContract;
    const predicate=binding.assignmentReference?.selector||{predicate:'UNIT_KEYWORD',subject:'UNIT',arguments:{keyword:'ADEPTUS ASTARTES'},contextLevel:'STATIC',evidence:{field:['eligibilityText'],quote:binding.eligibilityText}};
    const contexts=binding.scope==='UNIT'?[predicateContext(state,projection,state.units[0].instanceId,'UNIT')]:projection.units[0].profiles.filter(row=>row.quantity===1).map(row=>predicateContext(state,projection,state.units[0].instanceId,'MODEL',row.scopeId));
    if(contexts.some(context=>schema.evaluatePredicate(predicate,enhancementOwnerContext(contract,context))==='TRUE')){chosen=candidate;break;}
  }
  assert.ok(chosen,'No physical source recipient for '+binding.id);
  const service=createSpaceMarinesRosterService(book),result=ready(service,header([binding.detachmentId])+chosen.text+'Enhancement: '+index.get(binding.id).data.title+'\n');
  const unit=service.state.units[0];assert.deepEqual(unit.enhancementIds,[binding.id]);
  if(binding.scope==='UNIT')assert.equal(unit.enhancementAssignments.length,0);else assert.equal(unit.enhancementAssignments.length,1);
  assert.equal(result.points.units[0].enhancementPoints,book.mfmImportReferences.nativePoints.enhancements.find(row=>row.id===binding.id).value);
  assignmentResults.push({id:binding.id,scope:binding.scope,itemKind:index.get(binding.id).data.itemKind,status:'PASS'});
}
assert.equal(assignmentResults.length,56);assert.equal(assignmentResults.filter(row=>row.itemKind==='UNIT_UPGRADE').length,9);

// Native roles depend on army presence, not on Marneus's attachment.
const catoResults=[];
for(const [includeMarneus,expectedRole]of [[false,'LEADER'],[true,'SUPPORT']]){
  const source=fixture(CATO),body=fixture(VICTRIX),trigger=fixture(MARNEUS);
  const service=createSpaceMarinesRosterService(book),text=header()+source.text+body.text+(includeMarneus?trigger.text:'');ready(service,text);
  const units=service.state.units,sourceId=units[0].instanceId,target=units[1].instanceId;
  service.attach(sourceId,target);assert.equal(service.projection.formedUnits.length,1);
  const snapshot=service.snapshot();assert.equal(snapshot.units.some(row=>row.canonicalUnitId===MARNEUS),includeMarneus);
  // A second role cannot be inferred from source captions. Query the actual
  // bound runtime's graph after the attachment has been independently checked.
  const reimport=ready(service,text);assert.deepEqual(reimport.roster,snapshot);
  const {createSpaceMarinesRosterRuntime}=await import('./roster-runtime.mjs');const runtime=createSpaceMarinesRosterRuntime(book);runtime.load(snapshot);
  assert.equal(runtime.book.rosterAttachmentPolicies.find(row=>row.sourceId===CATO).role,expectedRole);
  service.detach(sourceId);assert.equal(service.state.attachments.length,0);ready(service,text);assert.equal(service.state.attachments.length,0);
  service.reattach(sourceId,target);service.recompute();assert.equal(service.state.attachments.length,1);
  catoResults.push({includeMarneus,role:expectedRole,status:'PASS'});
}

const captain=fixture(CAPTAIN),body=fixture(INTERCESSORS),text=header()+captain.text+body.text;
const active=createSpaceMarinesRosterService(book);ready(active,text);active.attach(active.state.units[0].instanceId,active.state.units[1].instanceId);
const valid=active.snapshot(),projection=active.projection;
for(const changed of [text.replace('Bolt Rifle','Unrecognised test weapon'),text.replace('4x Intercessor','5x Intercessor'),header()+body.text,
  header()+body.text+captain.text,header()+fixture(CAPTAIN,{gear:false}).text+body.text]){
  const result=active.import(changed);assert.notEqual(result.status,'READY');assert.deepEqual(active.snapshot(),valid);assert.deepEqual(active.projection,projection);
}
const changed=header()+body.text;assert.equal(active.import(changed).status,'REPLACEMENT_REQUIRED');assert.deepEqual(active.snapshot(),valid);
ready(active,changed,{}, {replaceExisting:true});assert.equal(active.state.units.length,1);assert.equal(active.state.attachments.length,0);
const unknown=active.import(header()+'1x Astraeus (9999 pts)\n');assert.equal(unknown.status,'NEEDS_BINDINGS');
assert.equal(book.importBindings.referenceOnly.length,21);
const unknownInput=active.import(header()+'1x Thunderhawk Gunship (9999 pts)\n');assert.equal(unknownInput.status,'NEEDS_BINDINGS');

const original=JSON.stringify(book);assert.deepEqual(buildSpaceMarinesImportBook(),book);assert.equal(JSON.stringify(book),original);
writeSpaceMarinesImportBook({check:true});
console.log(JSON.stringify({status:'PASS',physicalSourceUnits:84,sourceMappingBlockedUnits:blocked,constructedInputModels:inputModelCount,
  physical:physical,detachments:21,paidOptionControls:paidResults,assignments:assignmentResults,cato:catoResults,
  repeatedUnits:true,quantityParity:true,sourceReplacementsNoDefaultGear:true,atomicImport:true,replacementConfirmation:true,
  snapshots:true,reimportAttachments:true,deterministic:true,realNewRecruitExportTested:false,browserAcceptance:'NOT_RUN'}));

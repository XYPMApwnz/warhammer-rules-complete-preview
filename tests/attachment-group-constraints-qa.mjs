import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
import {createEffectiveMfmCatalog} from '../mfm/content/effective-mfm-catalog.mjs';
import {validateAttachmentGroupConstraintSet} from '../books/shared/tools/attachment-group-constraint.mjs';
import {verifyFrozenSource} from '../books/shared/tools/source-ingestion-contract.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const local=value=>JSON.parse(JSON.stringify(value));
const load=(file,key)=>{const scope={window:{}};vm.runInNewContext(fs.readFileSync(path.join(root,file),'utf8'),scope);return local(scope.window[key]);};
const runtimeSource=fs.readFileSync(path.join(root,'books/shared/roster-context.js'),'utf8');
const apiFor=source=>{const scope={window:{},URL,URLSearchParams};vm.runInNewContext(source,scope);return scope.window.WHArmyRosterContext;};
const api=apiFor(runtimeSource);
const catalogs=Object.fromEntries(['death-guard','adeptus-mechanicus','tyranids','tau-empire','emperors-children','chaos-space-marines','space-marines','blood-angels','dark-angels'].map(book=>[book,load(`books/${book}/scripts/roster-data.js`,'WH_BOOK_ROSTER_CATALOG')]));
const points=load('roster-guides/points-data.js','WH_POINTS_CATALOG');
const pointKeys={'death-guard':'death guard','adeptus-mechanicus':'adeptus mechanicus','tyranids':'tyranids','tau-empire':'t au empire','emperors-children':'emperor s children','chaos-space-marines':'chaos space marines','space-marines':'space marines','blood-angels':'blood angels','dark-angels':'dark angels'};
const canonical=(catalog,id)=>{const matches=catalog.units.filter(unit=>unit.id===id);assert.equal(matches.length,1,id);return matches[0];};
const physical=(catalog,id,instanceId,models=1)=>({instanceId,canonicalUnit:canonical(catalog,id),rosterUnit:{id:instanceId,canonicalUnitId:id,name:canonical(catalog,id).title,points:1,models:[{quantity:models,name:canonical(catalog,id).title,loadouts:[]}]}});
const attachAll=(workflow,units,bodyguardInstanceId,ids)=>{let state={attachments:{}};for(const leaderInstanceId of ids)state=workflow.attach({units,attachments:state.attachments,bodyguardInstanceId,leaderInstanceId});return state;};
const constraintOn=(unit,partition,targetId)=>unit.relations[partition].find(item=>item.unitId===targetId)?.attachmentGroupConstraint;

const am=catalogs['adeptus-mechanicus'],tau=catalogs['tau-empire'],sm=catalogs['space-marines'],dg=catalogs['death-guard'];
const datasmithConstraint=constraintOn(canonical(am,'unit-cybernetica-datasmith'),'canSupport','unit-kastelan-robots');
const datasmithInverse=constraintOn(canonical(am,'unit-kastelan-robots'),'canBeSupportedBy','unit-cybernetica-datasmith');
assert.deepEqual(datasmithInverse,datasmithConstraint,'Datasmith direct/inverse constraint parity');
assert.equal(datasmithConstraint.sameCanonicalLimit,'UNBOUNDED');assert.equal(datasmithConstraint.totalCapacity,'UNBOUNDED');assert.equal(datasmithConstraint.perRoleCapacity,'UNBOUNDED');
assert.deepEqual(points['adeptus mechanicus'].units['cybernetica datasmith'].relations.canSupport[0].attachmentGroupConstraint,datasmithConstraint,'Datasmith editor/reader constraint parity');

const amUnits=[physical(am,'unit-kastelan-robots','kastelan-1',2),physical(am,'unit-kastelan-robots','kastelan-2',2),...['datasmith-1','datasmith-2','datasmith-3'].map(id=>physical(am,'unit-cybernetica-datasmith',id))];
let state=attachAll(api.attachments,amUnits,'kastelan-1',['datasmith-1','datasmith-2','datasmith-3']);
assert.equal(state.changed,true);assert.deepEqual(local(state.attachments),{'kastelan-1':['datasmith-1','datasmith-2','datasmith-3']});
assert.equal(api.attachments.candidates({units:amUnits,attachments:{'kastelan-1':['datasmith-1']},bodyguardInstanceId:'kastelan-1'}).some(item=>item.instanceId==='datasmith-2'),true,'second Datasmith remains candidate');
assert.equal(api.attachments.candidates({units:amUnits,attachments:{'kastelan-1':['datasmith-1']},bodyguardInstanceId:'kastelan-2'}).some(item=>item.instanceId==='datasmith-1'),false,'physical Datasmith cannot join two groups');
state=api.attachments.detach({units:amUnits,attachments:state.attachments,bodyguardInstanceId:'kastelan-1',leaderInstanceId:'datasmith-2'});assert.deepEqual(local(state.attachments),{'kastelan-1':['datasmith-1','datasmith-3']});
state=api.attachments.detach({units:amUnits,attachments:state.attachments,bodyguardInstanceId:'kastelan-1',leaderInstanceId:'datasmith-1'});state=api.attachments.detach({units:amUnits,attachments:state.attachments,bodyguardInstanceId:'kastelan-1',leaderInstanceId:'datasmith-3'});assert.deepEqual(local(state.attachments),{});
const noTarget=api.attachments.sanitize({units:[physical(am,'unit-cybernetica-datasmith','datasmith-alone')],attachments:{}}).formationIssues[0];
assert.equal(noTarget.reason,'mandatory-no-valid-target');assert.deepEqual(local(noTarget.consequence),{deployment:'CANNOT_DEPLOY',destroyedTiming:'FIRST_BATTLE_ROUND'});
const available=api.attachments.sanitize({units:amUnits.slice(0,2).concat(amUnits[2]),attachments:{}}).formationIssues.find(item=>item.participantInstanceId==='datasmith-1');assert.equal(available.reason,'mandatory-attachment-required');
assert.equal(api.attachments.sanitize({units:amUnits,attachments:{'kastelan-1':['datasmith-1'],'kastelan-2':['datasmith-2']}}).formationIssues.some(item=>item.participantInstanceId==='datasmith-1'||item.participantInstanceId==='datasmith-2'),false);
const rangerUnits=[physical(am,'unit-skitarii-rangers','rangers',10),physical(am,'unit-cybernetica-datasmith','datasmith')];assert.equal(api.attachments.attach({units:rangerUnits,attachments:{},bodyguardInstanceId:'rangers',leaderInstanceId:'datasmith'}).changed,false);

const krootConstraint=constraintOn(canonical(tau,'unit-kroot-war-shaper'),'canLead','unit-kroot-carnivores');
assert.deepEqual(constraintOn(canonical(tau,'unit-kroot-carnivores'),'canBeLedBy','unit-kroot-war-shaper'),krootConstraint,'Kroot direct/inverse constraint parity');
assert.deepEqual(points['t au empire'].units['kroot war shaper'].relations.canLead.find(item=>item.unitId==='unit-kroot-carnivores').attachmentGroupConstraint,krootConstraint,'Kroot editor/reader constraint parity');
const krootUnits=size=>[physical(tau,'unit-kroot-carnivores','carnivores',size),physical(tau,'unit-kroot-war-shaper','war-1'),physical(tau,'unit-kroot-war-shaper','war-2'),physical(tau,'unit-kroot-trail-shaper','trail'),physical(tau,'unit-kroot-flesh-shaper','flesh')];
state=attachAll(api.attachments,krootUnits(20),'carnivores',['war-1','trail']);assert.deepEqual(local(state.attachments),{carnivores:['war-1','trail']});
assert.equal(api.attachments.attach({units:krootUnits(20),attachments:{carnivores:['war-1']},bodyguardInstanceId:'carnivores',leaderInstanceId:'war-2'}).changed,false,'duplicate Shaper rejected');
assert.equal(api.attachments.attach({units:krootUnits(20),attachments:{carnivores:['war-1','trail']},bodyguardInstanceId:'carnivores',leaderInstanceId:'flesh'}).changed,false,'third Shaper rejected');
assert.deepEqual(local(api.attachments.sanitize({units:krootUnits(10),attachments:{carnivores:['war-1','trail']}}).attachments),{carnivores:['war-1']},'small Kroot retains ordinary capacity');
const farstalkerUnits=[physical(tau,'unit-kroot-farstalkers','farstalkers',12),physical(tau,'unit-kroot-war-shaper','war-1'),physical(tau,'unit-kroot-trail-shaper','trail')];assert.deepEqual(local(api.attachments.sanitize({units:farstalkerUnits,attachments:{farstalkers:['war-1','trail']}}).attachments),{farstalkers:['war-1']},'target specificity');

// Imported composition must activate the same accepted attachment predicate in
// the editor and effective projection, including after persistence and reparse.
const importedScope={window:{},URL,URLSearchParams};
vm.createContext(importedScope);
for(const file of ['books/shared/roster-parser.js','books/shared/roster-context.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),importedScope);
const parser=importedScope.window.WHRosterParser,importedApi=importedScope.window.WHArmyRosterContext;
const certified=['death-guard','adeptus-mechanicus','tyranids','tau-empire','emperors-children','chaos-space-marines'];
const dependent=new Map();
for(const book of certified)for(const unit of catalogs[book].units)for(const edge of Object.values(unit.relations).flat()){
  const constraint=edge.attachmentGroupConstraint;
  if(constraint?.bodyguardPredicate)dependent.set(`${book}/${constraint.id}`,{book,constraint});
}
const sourceDependent=JSON.parse(fs.readFileSync(path.join(root,'books/tau-empire/sources/tau-empire-attachment-group-constraints.v1.json'),'utf8')).constraints.filter(item=>item.bodyguardPredicate);
assert.deepEqual([...dependent.keys()],[...sourceDependent.map(item=>`tau-empire/${item.id}`)],'Source-backed Starting Strength denominator');
let startingStrengthCases=0;
for(const {book,constraint}of dependent.values()){
  const catalog=catalogs[book],target=canonical(catalog,constraint.targetUnitId),leaderIds=constraint.sourceUnitIds;
  assert.deepEqual(local(constraint),sourceDependent.find(item=>item.id===constraint.id));
  const modelRanges=target.gameSelections.models,minSize=modelRanges.reduce((sum,model)=>sum+model.min,0),maxSize=modelRanges.reduce((sum,model)=>sum+model.max,0);
  const orders=leaderIds.flatMap(first=>leaderIds.map(second=>[first,second]));
  for(const first of leaderIds)for(const second of leaderIds.filter(id=>id!==first))orders.push([first,second,leaderIds.find(id=>id!==first&&id!==second)]);
  for(const size of Array.from({length:maxSize-minSize+1},(_,index)=>minSize+index))for(const detailed of [false,true])for(const order of orders){
    const sourceText=`+ FACTION KEYWORD: ${catalog.book.title}\n${size}x ${target.title} (100 pts)${detailed?`\n• 1x Long-quill\n• ${size-1}x Kroot Carnivore`:''}\n`+order.map(id=>`1x ${canonical(catalog,id).title} (50 pts)`).join('\n');
    let roster=parser.parse(sourceText),record={id:'starting-strength',sourceText,roster,attachments:{'parsed-unit-1':order.map((_,index)=>`parsed-unit-${index+2}`)}};
    const expected=[],seen=new Set(),capacity=size===constraint.bodyguardPredicate.value?constraint.totalCapacity:1;
    order.forEach((id,index)=>{if(!seen.has(id)&&expected.length<capacity){seen.add(id);expected.push(`parsed-unit-${index+2}`);}});
    for(const stage of ['import','reload','backup']){
      if(stage!=='import'){record=local(record);record.roster=parser.parse(record.sourceText,{identityHints:record.roster});roster=record.roster;}
      const units=roster.units.map((raw,index)=>({instanceId:raw.id,canonicalUnit:canonical(catalog,index===0?target.id:order[index-1]),rosterUnit:raw}));
      const state=importedApi.attachments.sanitize({units,attachments:record.attachments});
      assert.deepEqual(local(state.attachments),{'parsed-unit-1':expected},`${size}/${detailed}/${stage}/${order}`);
      const projection=importedApi.project({catalog,roster,record});
      assert.equal(projection.game.units[0].selection.modelCount.value,size);
      assert.deepEqual(local(projection.attachmentState.attachments),local(state.attachments),'Editor/effective attachment parity');
      const detached=importedApi.attachments.detach({units,attachments:state.attachments,bodyguardInstanceId:'parsed-unit-1',leaderInstanceId:expected.at(-1)});
      const reattached=importedApi.attachments.attach({units,attachments:detached.attachments,bodyguardInstanceId:'parsed-unit-1',leaderInstanceId:expected.at(-1)});
      assert.deepEqual(local(reattached.attachments),local(state.attachments),'Detach/re-attach recomputation');
      startingStrengthCases++;
    }
  }
}
const aggregateKroot=krootUnits(20).map(item=>({...item,rosterUnit:{...item.rosterUnit,quantity:item.rosterUnit.models[0].quantity,models:[]}}));
assert.deepEqual(local(attachAll(api.attachments,aggregateKroot,'carnivores',['war-1','trail']).attachments),{carnivores:['war-1','trail']});
const isolated=[...aggregateKroot,physical(tau,'unit-kroot-carnivores','small-carnivores',10)];
assert.equal(api.attachments.candidates({units:isolated,attachments:{carnivores:['war-1']},bodyguardInstanceId:'small-carnivores'}).some(item=>item.instanceId==='war-1'),false,'Physical leader remains exclusive to its own group');
assert.deepEqual(local(api.attachments.sanitize({units:isolated,attachments:{'small-carnivores':['trail','flesh']}}).attachments),{'small-carnivores':['trail']},'Duplicate Bodyguard does not inherit conditional capacity');
for(const models of [[{quantity:0}],{quantity:20},[{quantity:1},{quantity:0}],[{quantity:Number.MAX_SAFE_INTEGER},{quantity:1}]]){
  const units=local(aggregateKroot);units[0].rosterUnit.models=models;
  assert.deepEqual(local(api.attachments.sanitize({units,attachments:{carnivores:['war-1','trail']}}).attachments),{carnivores:['war-1']},'Invalid detailed composition must not fall back to aggregate quantity');
}
const aggregateUnits=units=>units.map(item=>({...item,rosterUnit:{...item.rosterUnit,quantity:item.rosterUnit.models.reduce((sum,model)=>sum+model.quantity,0),models:[]}}));
assert.deepEqual(local(attachAll(api.attachments,aggregateUnits(amUnits),'kastelan-1',['datasmith-1','datasmith-2','datasmith-3']).attachments),{'kastelan-1':['datasmith-1','datasmith-2','datasmith-3']},'Aggregate Datasmith multiplicity remains unlimited');
console.log(`Imported Starting Strength class guard PASS: ${dependent.size} source records, ${startingStrengthCases} attachment/projection/persistence cases`);

const projectionRecord=(catalog,units,attachments,id)=>({id,name:id,sourceText:'',attachments,roster:{faction:catalog.book.title,declared:1,calculated:1,unitLineTotal:1,detachments:[],enhancements:[],warnings:[],units:units.map(item=>item.rosterUnit)}});
const amProjectionRecord=projectionRecord(am,amUnits,{'kastelan-1':['datasmith-1','datasmith-2','datasmith-3']},'am-constraint');
const projected=api.project({catalog:am,roster:amProjectionRecord.roster,record:amProjectionRecord});assert.deepEqual(local(projected.record.attachments),amProjectionRecord.attachments);assert.deepEqual(local(projected.game.units.find(unit=>unit.identity.instanceId==='kastelan-1').attachments.leaders.map(item=>item.instanceId)),['datasmith-1','datasmith-2','datasmith-3']);

const ordinary=[physical(sm,'unit-intercessor-squad','body'),physical(sm,'unit-captain','captain'),physical(sm,'unit-ancient','ancient'),physical(sm,'unit-apothecary','apothecary')];assert.deepEqual(local(attachAll(api.attachments,ordinary,'body',['captain','ancient']).attachments),{body:['captain','ancient']});assert.equal(api.attachments.attach({units:ordinary,attachments:{body:['ancient']},bodyguardInstanceId:'body',leaderInstanceId:'apothecary'}).changed,false);
const judiciar=physical(sm,'unit-judiciar','judiciar'),judiciarTarget=judiciar.canonicalUnit.relations.canSupport[0].unitId,judiciarUnits=[physical(sm,judiciarTarget,'judiciar-body'),physical(sm,'unit-captain','judiciar-leader'),judiciar];assert.deepEqual(local(attachAll(api.attachments,judiciarUnits,'judiciar-body',['judiciar-leader','judiciar']).attachments),{'judiciar-body':['judiciar-leader','judiciar']});
const cato=physical(sm,'unit-cato-sicarius','cato'),catoTarget=cato.canonicalUnit.relations.canSupport[0].unitId,catoUnits=[physical(sm,catoTarget,'cato-body'),physical(sm,'unit-captain','cato-leader'),cato];assert.deepEqual(local(attachAll(api.attachments,catoUnits,'cato-body',['cato-leader','cato']).attachments),{'cato-body':['cato-leader','cato']});
const dgUnits=[physical(dg,'unit-plague-marines','dg-body'),physical(dg,'unit-biologus-putrifier','biologus'),physical(dg,'unit-tallyman','tallyman')];assert.deepEqual(local(attachAll(api.attachments,dgUnits,'dg-body',['biologus','tallyman']).attachments),{'dg-body':['biologus','tallyman']});
assert.deepEqual(local(attachAll(api.attachments,aggregateUnits(dgUnits),'dg-body',['biologus','tallyman']).attachments),{'dg-body':['biologus','tallyman']},'Aggregate DG exception remains legal');

const {catalog:mfm}=await createEffectiveMfmCatalog(),refs=new Map(mfm.unitReferences.map(item=>[item.id,item])),supportRecords=mfm.supportEligibilityRecords.filter(item=>item.status==='CURRENT');assert.equal(supportRecords.length,36);assert.equal(supportRecords.reduce((sum,item)=>sum+item.targetUnitReferenceIds.length,0),226);
for(const record of supportRecords){
  const source=refs.get(record.sourceUnitReferenceId),sourceBinding=source?.armyBinding;
  assert.ok(source&&sourceBinding,`${record.id} source reference`);
  for(const targetRef of record.targetUnitReferenceIds)assert.ok(refs.has(targetRef),`${record.id} target reference`);
  if(sourceBinding.bindingStatus!=='BOUND')continue;
  const catalog=catalogs[sourceBinding.armyBookId];assert.ok(catalog,record.id);
  for(const targetRef of record.targetUnitReferenceIds){
    const targetBinding=refs.get(targetRef)?.armyBinding;
    if(targetBinding?.bindingStatus!=='BOUND'||targetBinding.armyBookId!==sourceBinding.armyBookId)continue;
    const sourceId=sourceBinding.armyUnitId,targetId=targetBinding.armyUnitId;
    assert.equal(canonical(catalog,sourceId).relations.canSupport.some(item=>item.unitId===targetId),true,`${record.id} direct`);
    assert.equal(canonical(catalog,targetId).relations.canBeSupportedBy.some(item=>item.unitId===sourceId),true,`${record.id} inverse`);
  }
}
const dgOverlayEdges=dg.units.flatMap(unit=>unit.relations.canSupport.map(edge=>[unit.id,edge.unitId]));assert.equal(dgOverlayEdges.length,7);for(const [sourceId,targetId] of dgOverlayEdges)assert.equal(canonical(dg,targetId).relations.canBeSupportedBy.some(item=>item.unitId===sourceId),true,`DG overlay ${sourceId}/${targetId}`);assert.equal(supportRecords.length+dgOverlayEdges.length,43,'accepted faction-scoped exception records');

const killed=(label,run)=>{let survived=true;try{run();}catch{survived=false;}assert.equal(survived,false,`${label} mutation survived`);};
killed('aggregate Starting Strength regression',()=>{const broken=apiFor(runtimeSource.replace('return positiveInteger(quantity)?quantity:null;','return null;'));assert.deepEqual(local(attachAll(broken.attachments,aggregateKroot,'carnivores',['war-1','trail']).attachments),{carnivores:['war-1','trail']});});
killed('Datasmith same-canonical permission',()=>{const units=local(amUnits);for(const unit of units)for(const edge of Object.values(unit.canonicalUnit.relations).flat())if(edge.attachmentGroupConstraint?.id===datasmithConstraint.id)edge.attachmentGroupConstraint.sameCanonicalLimit=1;assert.deepEqual(local(attachAll(api.attachments,units,'kastelan-1',['datasmith-1','datasmith-2','datasmith-3']).attachments),{'kastelan-1':['datasmith-1','datasmith-2','datasmith-3']});});
killed('Kroot condition',()=>{const units=krootUnits(10);for(const unit of units)for(const edge of Object.values(unit.canonicalUnit.relations).flat())if(edge.attachmentGroupConstraint?.id===krootConstraint.id)delete edge.attachmentGroupConstraint.bodyguardPredicate;assert.deepEqual(local(api.attachments.sanitize({units,attachments:{carnivores:['war-1','trail']}}).attachments),{carnivores:['war-1']});});
killed('duplicate restriction',()=>{const units=krootUnits(20);for(const unit of units)for(const edge of Object.values(unit.canonicalUnit.relations).flat())if(edge.attachmentGroupConstraint?.id===krootConstraint.id)edge.attachmentGroupConstraint.sameCanonicalLimit='UNBOUNDED';assert.equal(api.attachments.attach({units,attachments:{carnivores:['war-1']},bodyguardInstanceId:'carnivores',leaderInstanceId:'war-2'}).changed,false);});
killed('target specificity',()=>{const units=local(farstalkerUnits);for(const unit of units.filter(item=>['war-1','trail'].includes(item.instanceId))){const edge=unit.canonicalUnit.relations.canLead.find(item=>item.unitId==='unit-kroot-farstalkers');edge.attachmentGroupConstraint={...local(krootConstraint),targetUnitId:'unit-kroot-farstalkers'};}assert.deepEqual(local(api.attachments.sanitize({units,attachments:{farstalkers:['war-1','trail']}}).attachments),{farstalkers:['war-1']});});

for(const [bookId,file,unitsFile] of [['adeptus-mechanicus','books/adeptus-mechanicus/sources/adeptus-mechanicus-attachment-group-constraints.v1.json','books/adeptus-mechanicus/content/adeptus-mechanicus-codex-datasheets.en.json'],['tau-empire','books/tau-empire/sources/tau-empire-attachment-group-constraints.v1.json','books/tau-empire/content/tau-empire-codex-datasheets.en.json']]){
  const accepted=JSON.parse(fs.readFileSync(path.join(root,unitsFile),'utf8'));
  validateAttachmentGroupConstraintSet(JSON.parse(fs.readFileSync(path.join(root,file),'utf8')),{bookId,units:[...(accepted.datasheets??[]),...(accepted.imperialArmour??[]),...(accepted.legends??[])]});
}
for(const sourceId of ['adeptus-mechanicus-attachment-group-constraints','tau-empire-attachment-group-constraints'])assert.equal(verifyFrozenSource(sourceId,{repoRoot:root}).sourceId,sourceId);
assert.equal(/Cybernetica Datasmith|Kastelan Robots|Kroot Carnivores|War Shaper|tau-empire|adeptus-mechanicus/i.test(runtimeSource),false,'shared runtime contains no book/title branch');
console.log('Attachment-group constraints QA PASS: 43/43 exception records; Datasmith, Kroot, mandatory consequence, mutations and regressions');

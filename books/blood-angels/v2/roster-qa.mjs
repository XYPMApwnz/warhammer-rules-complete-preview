import {buildBloodAngelsContracts} from './rule-contract-build.mjs';
import {qaProgress} from '../../../tests/helpers/qa-progress.mjs';
import {parseSourceFixtureJSON} from '../../../tests/helpers/source-refs-fixtures.mjs';
import {sourceSnapshot} from '../../shared/source-refs-v2/source-refs.mjs';
/** Source/input-first acceptance of constructed text through the real shared
 * physical importer. These fixtures are not authentic New Recruit exports or
 * source-valid complete armies; no browser acceptance is claimed. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {buildBloodAngelsRosterBook} from './roster-build.mjs';
import {createBloodAngelsRosterService} from './roster-import.mjs';
import {projectBloodAngelsPaidOptions} from './roster-paid-options.mjs';
import {buildGameplayPresentation} from './gameplay-presentation-build.mjs';
import {createBloodAngelsRuleSchema} from './rule-contract-schema.mjs';
import {readSpaceMarinesRosterCorrections} from '../../space-marines/v2/roster-source-review.mjs';
import {formRoster,predicateContext} from '../../shared/roster-v2/context.mjs';
import {enhancementOwnerContext} from '../../shared/roster-v2/compatibility-context.mjs';
import {projectInstanceCards,projectPersonalBook} from '../../shared/army-book-app-v2/personal.mjs';
import {renderRosterPointsStatus} from '../../shared/army-book-app-v2/roster.mjs';
import {projectAbilityPresentation} from '../../shared/army-book-app-v2/ability-presentation.mjs';
import {verifyFrozenSource} from '../../shared/tools/source-ingestion-contract.mjs';

const read=p=>parseSourceFixtureJSON(fs.readFileSync(new URL(p,import.meta.url),'utf8')),clone=structuredClone;
const own=read('./generated/effective.json'),sm=read('../../space-marines/v2/generated/effective.json'),ledger=read('./inherited-sm-references.json');
const accepted=new Set(ledger.references.map(r=>r.canonicalId));
const sourceUnits=[...own.entities.filter(e=>e.kind==='DATASHEET'),...sm.entities.filter(e=>e.kind==='DATASHEET'&&accepted.has(e.id))];
const unitIds=new Set(sourceUnits.map(e=>e.id)),sources=new Map([...own.entities,...sm.entities].map(e=>[e.id,e]));
const corrections=readSpaceMarinesRosterCorrections({facts:sm});
const MODEL_PAIRS=new Map(corrections.modelMappings.map(r=>[r.memberId,r.profileId]));
const profilesForMember=e=>e.data.modelProfileId||MODEL_PAIRS.get(e.id);
const ID={captain:'unit-ba-09adea2bf319462fb4ed',dcCaptain:'unit-ba-014cc7b19aca4d5b84a3',jumpCaptain:'unit-ba-5269d704246f4e3a8d81',
 priest:'unit-ba-1388b9b0dc5d40c1aba4',lemartes:'unit-ba-3483c88a4df4495ca2e2',jump:'unit-ba-6903525e7ae0497e943a',
 dc:'unit-ba-548417d73e544f7f920e',dante:'unit-ba-92fdb23a526b4c328367',guard:'unit-ba-5981fb6513b9436487f0',mephiston:'unit-ba-d84ea7c581874feca80b',
 ordinary:'unit-sm-59162946fee84360',smCaptain:'unit-sm-99eb03d4f2d448e2'};
const DEFAULT='detachment-sm-6341f5a9b9584677';
const PAID=[
 ['mfm-paid-upgrade-1d8e8976d73dd2f9','IMPULSOR','per Orbital Comms Array',10],
 ['mfm-paid-upgrade-2dcc41d973fb7e5a','DESOLATION SQUAD','per Vengor Launcher',5],
 ['mfm-paid-upgrade-49288d49d083d7cb','TERMINATOR SQUAD','per Cyclone Missile Launcher',10],
 ['mfm-paid-upgrade-77bc7dc58d636b7a','INVADER ATVS','per Multi-melta',5],
 ['mfm-paid-upgrade-ccbd208631bacc48','REDEMPTOR DREADNOUGHT','per Macro plasma incinerator',10],
 ['mfm-paid-upgrade-f0d7680f02efab10','REPULSOR EXECUTIONER','per Heavy Laser Destroyer',10],
 ['mfm-paid-upgrade-fe9bdd5878ada46f','TERMINATOR ASSAULT SQUAD','per Storm Shield',5]
];
const captures={'blood-angels':read('../../../mfm/sources/v1.6/blood-angels.json'),'space-marines':read('../../../mfm/sources/v1.6/space-marines.json')};
const stable=value=>Array.isArray(value)?value.map(stable):value&&typeof value==='object'?Object.fromEntries(Object.keys(value).sort().map(key=>[key,stable(value[key])])):value;
const sha=value=>createHash('sha256').update(value).digest('hex').toUpperCase();
const verifiedCaptures=new Set();
const verifyCapture=owner=>{
 if(verifiedCaptures.has(owner))return;const capture=captures[owner],{captureSha256,...payload}=capture;
 // captureSha256 identifies the stable JSON payload, not serialized file bytes.
 // Frozen-source acceptance and raw artifact pins separately verify file bytes.
 verifyFrozenSource(owner+'-mfm-v1.6');assert.equal(sha(JSON.stringify(stable(payload))),captureSha256);
 for(const artifact of capture.rawArtifacts){const bytes=fs.readFileSync(new URL('../../../mfm/sources/v1.6/'+artifact.path,import.meta.url));assert.equal(sha(bytes),artifact.sha256);assert.equal(bytes.length,artifact.bytes);}
 verifiedCaptures.add(owner);
};
const pricing=[...read('./mfm-bindings.json').unitBindings,...read('../../space-marines/v2/mfm-bindings.json').unitBindings];
const sourceBase=(id,count,copy=1)=>{
 const binding=pricing.find(r=>r.entityId===id),owner=sources.get(id).bookId;
 verifyCapture(owner);assert.equal(captures[owner].captureSha256,binding.proof.mfm.captureSha256);
 assert.ok(binding);const source=binding.proof.mfm.jsonPointer.slice(1).split('/').reduce((node,key)=>node[key],captures[owner]);
 const values=source.pointSchedules.filter(s=>(s.minCopies===undefined||copy>=s.minCopies)&&(s.maxCopies===undefined||copy<=s.maxCopies))
  .flatMap(s=>s.entries).filter(e=>count>=e.minModels&&count<=e.maxModels);
 return values.length===1?values[0].value:null;
};

export function runBloodAngelsRosterQA({onlyGroups=null}={}){
 const progress=qaProgress('BA roster');
 const built=buildBloodAngelsContracts();progress('contracts built');
 const produced=buildBloodAngelsRosterBook({built}),book=produced.book||produced,index=new Map(book.entities.map(e=>[e.id,e]));
 const before=JSON.stringify([...sources.values()]),payload=buildGameplayPresentation(built),cards=new Map(payload.cards.map(c=>[c.id,c]));
 const checks=[],physical=[],weaponEvidence=[],assignments=[],paidEvidence=[],mutations=[];
 const check=(id,fn)=>{progress(id,checks.length);if(onlyGroups&&!onlyGroups.includes(id))return;fn();checks.push({id,status:'PASS'});process.stderr.write(id+' PASS\n');};
 const header=(dets=[DEFAULT])=>'+ FACTION KEYWORD: Blood Angels\n'+dets.map(id=>'+ DETACHMENT: '+sources.get(id).data.title+'\n').join('');
 const fixture=(id,{weapon,unitGear='',modelGear='',optional=true}={})=>{
  const unit=sources.get(id),members=[...sources.values()].filter(e=>e.kind==='COMPOSITION_MEMBER'&&e.parentId===id&&(optional||e.data.quantity.min>0));assert.ok(members.length);
  const rows=members.map(e=>({id:e.id,profileId:profilesForMember(e),quantity:Math.max(1,e.data.quantity.min),name:e.data.name}));
  const count=rows.reduce((sum,r)=>sum+r.quantity,0);
  return {id,rows,count,text:count+'x '+unit.data.title+' (9999 pts)'+(unitGear?': '+unitGear:'')+'\n'+rows.map((r,n)=>'• '+r.quantity+'x '+r.name+(n===0&&(weapon||modelGear)?': '+(weapon?'1x '+weapon:modelGear):'')+'\n').join('')};
 };
 const ready=(service,text,bindings={},options)=>{const r=service.import(text,bindings,options);assert.equal(r.status,'READY',JSON.stringify({needs:r.needsBindings,errors:r.errors}));return r;};
 const profileIds=new Set();let modelOccurrences=0;
 check('81-bare-source-datasheet-physical-inventories-without-default-loadout',()=>{
  assert.equal(sourceUnits.length,81);
  for(const unit of sourceUnits){const input=fixture(unit.id),service=createBloodAngelsRosterService(book);ready(service,header()+input.text);
   const actual=service.state.units[0];assert.equal(actual.canonicalUnitId,unit.id);assert.equal(actual.startingStrength,input.count);assert.equal(actual.modelRows.length,input.rows.length);
   assert.equal(service.points.units[0].basePoints,sourceBase(unit.id,input.count),'Official MFM tier parity '+unit.id);
   for(const [n,row]of actual.modelRows.entries()){const expected=input.rows[n];assert.equal(row.quantity,expected.quantity);assert.equal(row.compositionMemberId,expected.id);
    assert.equal(row.canonicalProfileId,expected.profileId,'Independent source composition/profile mapping');assert.equal(row.selections.length,0,'Omitted equipment was invented');profileIds.add(row.canonicalProfileId);}
   assert.deepEqual(sourceSnapshot(index.get(unit.id)),sourceSnapshot(unit));assert.equal(index.get(unit.id).bookId,unit.bookId);
   const effective=service.effective(actual.instanceId),variants=projectInstanceCards(cards,actual,effective);assert.ok(variants.get(unit.id)?.length);assert.equal(projectPersonalBook(payload,service.state).instances.length,1);
   physical.push({canonicalId:unit.id,owner:unit.bookId,models:input.count,status:'PASS',scope:'EXPLICIT_COMPOSITION_OMITTED_LOADOUT_UNKNOWN'});modelOccurrences+=input.count;
  }
  assert.equal(profileIds.size,106);
 });
 check('400-explicit-source-profile-labels-owner-and-quantities',()=>{
  const weapons=[...sources.values()].filter(e=>e.kind==='WEAPON_PROFILE'&&unitIds.has(e.parentId));assert.equal(weapons.length,400);
  for(const weapon of weapons){const input=fixture(weapon.parentId,{weapon:weapon.data.name}),service=createBloodAngelsRosterService(book),r=service.import(header()+input.text);
   assert.equal(r.status,'READY',weapon.id+' '+JSON.stringify(r.needsBindings));const unit=r.roster.units[0],selection=unit.modelRows[0].selections[0];assert.ok(selection);
   assert.ok(selection.canonicalProfileIds.includes(weapon.id));assert.equal(selection.physicalQuantity,input.rows[0].quantity);assert.equal(selection.perModelQuantity,1);
   assert.ok(selection.canonicalProfileIds.every(id=>sources.get(id).parentId===unit.canonicalUnitId));
   weaponEvidence.push({canonicalId:weapon.id,ownerUnitId:weapon.parentId,quantity:selection.physicalQuantity,status:'PASS',scope:'EXPLICIT_PROFILE_NOT_PERMISSION_ALIAS'});
  }
 });
 check('two-ambiguous-permission-labels-remain-unresolved-and-atomic',()=>{
  const service=createBloodAngelsRosterService(book);ready(service,header()+fixture(ID.captain).text);const saved=service.snapshot();
  for(const [id,label]of [[ID.jumpCaptain,'Astartes Chainsword'],[ID.dc,'Bolt Rifle Fire']]){
   const r=service.import(header()+fixture(id,{weapon:label}).text,{}, {replaceExisting:true});assert.equal(r.status,'NEEDS_BINDINGS');
   assert.ok(r.needsBindings.some(n=>n.rawLabel?.includes(label)||n.reason?.includes('NOT_PROVEN')));assert.deepEqual(service.snapshot(),saved);
   const need=r.needsBindings.find(n=>n.rawLabel?.includes(label)),candidate=id===ID.jumpCaptain?'weapon-ba-d9f4b7805ff843238b95':'weapon-ba-8803cd648fe94795bbe9';
   assert.equal(sources.get(candidate).parentId,id,'Independent proposed profile must retain its source owner');
   const forced=service.import(header()+fixture(id,{weapon:label}).text,{selections:{[need.key]:{canonicalProfileIds:[candidate],canonicalEquipmentIds:[]}}},{replaceExisting:true});
   assert.notEqual(forced.status,'READY','Unproven permission/profile mapping admitted by a caller override');assert.deepEqual(service.snapshot(),saved);
  }
 });
 check('18-detachments-and-no-foreign-chapter-membership',()=>{
  const dets=[...sources.values()].filter(e=>e.kind==='DETACHMENT'&&(e.bookId==='blood-angels'||accepted.has(e.id))).map(e=>e.id);assert.equal(dets.length,18);
  const service=createBloodAngelsRosterService(book);ready(service,header(dets)+fixture(ID.captain).text);assert.deepEqual(service.state.detachmentIds,dets);
  const saved=service.snapshot(),foreign=sm.entities.filter(e=>e.kind==='DATASHEET'&&!unitIds.has(e.id));assert.equal(foreign.length,18);
  for(const e of foreign){assert.ok(!index.has(e.id));assert.notEqual(service.import(header()+'1x '+e.data.title+' (9999 pts)\n',{}, {replaceExisting:true}).status,'READY');assert.deepEqual(service.snapshot(),saved);}
 });
 check('stormlance-conflict-and-central-owner-boundary-preserved',()=>{
  const issue=read('./source-issues.json').issues.find(i=>i.id==='BA-SRC-STORMLANCE-DP');assert.equal(issue.status,'SOURCE_CONFLICT');assert.equal(issue.applied,false);
  const storm='detachment-sm-53f689af321a4813',row=book.mfmImportReferences.nativePoints.detachments.find(d=>d.id===storm);
  assert.equal(index.get(storm).bookId,'space-marines');assert.equal(row.sourceOwner,'space-marines');assert.equal(row.detachmentPoints,1);
  assert.equal(book.mfmImportReferences.nativePoints.detachments.filter(d=>d.id===storm).length,1);
  assert.ok(!book.entities.some(e=>e.bookId==='blood-angels'&&e.id===storm));
 });
 check('all-32-enhancements-8-upgrades-have-source-eligible-physical-assignments',()=>{
  assert.equal(book.importBindings.enhancements.length,40);
  const rawState=(input,det)=>({schema:'roster-v2/roster',bookId:'blood-angels',rosterId:'source-bearer-probe',
   detachments:[{instanceId:'det',canonicalDetachmentId:det}],detachmentIds:[det],attachments:[],warlordInstanceId:null,
   units:[{instanceId:'probe',canonicalUnitId:input.id,startingStrength:input.count,selections:[],warlord:null,enhancementIds:[],
    modelRows:input.rows.map((r,n)=>({rowId:'row'+n,canonicalProfileId:r.profileId,quantity:r.quantity,compositionScope:'MODEL_ROW',selections:[]}))}]});
  for(const binding of book.importBindings.enhancements){let chosen;
   const expectedScope=corrections.scopeCorrections.find(r=>r.entityId===binding.id)?.scope||sources.get(binding.id).data.scope;
   assert.equal(binding.scope,expectedScope,'Source-owned assignment scope changed');assert.equal(binding.eligibilityText,sources.get(binding.id).data.eligibilityText);
   for(const source of sourceUnits){const input=fixture(source.id,{optional:false}),state=rawState(input,binding.detachmentId),projection=formRoster(book,state),contract=index.get(binding.id).ruleContract;
    const predicate=binding.assignmentReference?.selector||{predicate:'UNIT_KEYWORD',subject:'UNIT',contextLevel:'STATIC',arguments:{keyword:'ADEPTUS ASTARTES'}};
    const contexts=binding.scope==='UNIT'?[predicateContext(state,projection,'probe','UNIT')]:projection.units[0].profiles.filter(p=>p.quantity===1).map(p=>predicateContext(state,projection,'probe','MODEL',p.scopeId));
    if(contexts.some(c=>createBloodAngelsRuleSchema().evaluatePredicate(predicate,enhancementOwnerContext(contract,c))==='TRUE')){chosen=input;break;}
   }
   assert.ok(chosen,'No source-eligible physical bearer '+binding.id);const service=createBloodAngelsRosterService(book);
   ready(service,header([binding.detachmentId])+chosen.text+'Enhancement: '+sources.get(binding.id).data.title+'\n');const unit=service.state.units[0];
   assert.deepEqual(unit.enhancementIds,[binding.id]);assert.equal(unit.enhancementAssignments.length,binding.scope==='MODEL'?1:0);
   const snapshot=service.snapshot(),wrong=clone(snapshot);wrong.units[0].enhancementAssignments=[{enhancementId:binding.id,modelScopeId:'foreign-physical-unit/model'}];
   assert.throws(()=>service.load(wrong),undefined,'Foreign/fictitious bearer escaped '+binding.id);assert.deepEqual(service.snapshot(),snapshot);
   assignments.push({id:binding.id,scope:binding.scope,recipientUnitId:chosen.id,status:'PASS',armyLegality:'NOT_ASSESSED'});
  }
 });
 check('7-paid-options-official-prices-physical-counts-and-total-parity',()=>{
  assert.deepEqual(book.mfmPhysicalPaidOptions.map(r=>r.costRecordId).sort(),PAID.map(r=>r[0]).sort());
  for(const [id,owner,label,price]of PAID){const binding=book.mfmPhysicalPaidOptions.find(r=>r.costRecordId===id);assert.equal(binding.value,price);
   assert.equal(sourceSnapshot(binding).sourceLocator.sourceTitle,owner);assert.equal(sourceSnapshot(binding).sourceLocator.sourceLabel,label);assert.equal(sourceSnapshot(binding).sourceId,'space-marines-mfm-v1.6');
   const service=createBloodAngelsRosterService(book),bare=fixture(binding.ownerUnitId);ready(service,header()+bare.text);
   assert.equal(service.points.status,'UNRESOLVED');assert.equal(service.points.totalPoints,null);
   // Redemptor RAW proves Heavy Onslaught OR Macro; an independent Icarus
   // selection is not an unpaid-main control. Other six policies are unchanged.
   const unpaidIds=id==='mfm-paid-upgrade-ccbd208631bacc48'?['weapon-sm-4ba707edc43c44f6']:sources.get(binding.ownerUnitId).data.weaponIds;
   const unpaid=unpaidIds.map(id=>sources.get(id)).find(w=>!binding.profileIds.includes(w.id));assert.ok(unpaid,'No explicit unpaid equipment control');
   ready(service,header()+fixture(binding.ownerUnitId,{weapon:unpaid.data.name}).text,{}, {replaceExisting:true});
   assert.equal(service.points.status,'RESOLVED');assert.equal(service.points.units[0].paid.knownPaidPoints,0);
   const input=fixture(binding.ownerUnitId,{unitGear:'2x '+label.replace(/^per /,'')}),r=ready(service,header()+input.text,{}, {replaceExisting:true});
   const option=r.points.units[0].paid.options.find(o=>o.costRecordId===id);assert.equal(option.quantity,2);assert.equal(option.points,2*price);
   assert.equal(r.points.units[0].totalPoints,sourceBase(binding.ownerUnitId,input.count)+2*price);
   const snapshot=service.snapshot(),points=service.points;ready(service,header()+input.text);assert.deepEqual(service.snapshot(),snapshot);service.recompute();assert.deepEqual(service.points,points);
   const repeated=ready(service,header()+input.text+bare.text,{}, {replaceExisting:true});assert.equal(repeated.points.units[0].paid.knownPaidPoints,2*price);assert.equal(repeated.points.units[1].paid.knownPaidPoints,0);
   paidEvidence.push({id,price,owner,status:'PASS'});
  }
 });
 check('paid-options-negative-unknown-identity-quantity-and-alternative-correlations',()=>{
  const project=units=>projectBloodAngelsPaidOptions({bookId:'blood-angels',units},{bindings:book.mfmPhysicalPaidOptions});
  const selection=(b,key='ONE')=>({selectionKey:key,physicalQuantity:1,perModelQuantity:1,canonicalProfileIds:clone(b.profileIds),canonicalEquipmentIds:clone(b.equipmentIds),canonicalFieldPaths:Object.fromEntries(b.equipmentIds.map(id=>[id,['/text']]))});
  const unit=(b,id,items=[])=>({instanceId:id,canonicalUnitId:b.ownerUnitId,equipmentContextKnown:true,modelRows:[],selections:items});
  for(const [id,,,price]of PAID){const b=book.mfmPhysicalPaidOptions.find(r=>r.costRecordId===id),one=selection(b);
   assert.equal(project([unit(b,'A',[one])]).totalPaidPoints,price);
   // An existential equipment flag with no main choice cannot close the
   // reviewed Redemptor slot; it does not instantiate omitted source defaults.
   const empty=project([unit(b,'A')]),exclusive=id==='mfm-paid-upgrade-ccbd208631bacc48';
   assert.equal(empty.totalPaidPoints,exclusive?null:0);
   if(exclusive){assert.equal(empty.status,'UNRESOLVED');assert.ok(empty.unresolved.some(row=>row.reason==='PAID_SELECTION_UNKNOWN'));}
   const unknown=unit(b,'A');unknown.equipmentContextKnown=false;assert.equal(project([unknown]).totalPaidPoints,null);
   const bad=clone(one);delete bad.physicalQuantity;assert.equal(project([unit(b,'A',[bad])]).totalPaidPoints,null);
   assert.equal(project([unit(b,'A',[one,clone(one)])]).totalPaidPoints,null);
   const wrong=unit(b,'A',[one]);wrong.canonicalUnitId=book.mfmPhysicalPaidOptions.find(r=>r.ownerUnitId!==b.ownerUnitId).ownerUnitId;assert.equal(project([wrong]).totalPaidPoints,null);
   if(b.profileIds.length>1){const a=selection(b,'A'),c=selection(b,'C');a.canonicalProfileIds=[b.profileIds[0]];c.canonicalProfileIds=[b.profileIds[1]];
    assert.equal(project([unit(b,'A',[a,c])]).totalPaidPoints,null,'Split alternative profiles cannot invent a shared purchase');}
   if(b.equipmentIds.length){const badField=selection(b);delete badField.canonicalFieldPaths;assert.equal(project([unit(b,'A',[badField])]).totalPaidPoints,null);}
  }
 });
 check('source-href-leader-support-membership-and-three-incoming-sm-edges',()=>{
  const anchors=new Map(sourceUnits.map(e=>[e.data.sourceAnchor,e.id])),expected=[];
  for(const e of sources.values())if(e.kind==='SOURCE_RELATION'&&unitIds.has(e.parentId))for(const ref of e.data.sourceReferences){const href=new URL(ref.href),target=anchors.get(decodeURIComponent(href.hash.slice(1)));if(target)expected.push({sourceId:e.parentId,targetId:target,role:e.data.role,sourceIdProof:e.id});}
  const ownEdges=expected.filter(r=>sources.get(r.sourceId).bookId==='blood-angels');assert.equal(ownEdges.filter(r=>r.role==='LEADER').length,12);assert.equal(ownEdges.filter(r=>r.role==='SUPPORT').length,8);
  const incoming=expected.filter(r=>sources.get(r.sourceId).bookId==='space-marines'&&sources.get(r.targetId).bookId==='blood-angels');assert.equal(incoming.length,3);
  for(const row of [...ownEdges,...incoming]){const service=createBloodAngelsRosterService(book),text=header()+fixture(row.sourceId).text+fixture(row.targetId).text+fixture(row.targetId).text+fixture(ID.mephiston).text;ready(service,text);
   const unattached=service.snapshot();assert.throws(()=>service.attach('parsed-unit-1','parsed-unit-4'),'Unsupported recipient permitted');assert.deepEqual(service.snapshot(),unattached);
   service.attach('parsed-unit-1','parsed-unit-2');assert.deepEqual(service.state.attachments,[{leaderInstanceId:'parsed-unit-1',bodyguardInstanceId:'parsed-unit-2',role:row.role}]);
   const saved=service.snapshot(),projection=service.projection,points=service.points;service.recompute();assert.deepEqual(service.projection,projection);assert.deepEqual(service.points,points);
   ready(service,text);assert.deepEqual(service.snapshot(),saved);service.detach('parsed-unit-1');ready(service,text);assert.equal(service.state.attachments.length,0);
   service.reattach('parsed-unit-1','parsed-unit-3');assert.equal(service.state.attachments[0].bodyguardInstanceId,'parsed-unit-3');
   const restored=createBloodAngelsRosterService(book);restored.load(JSON.parse(JSON.stringify(service.snapshot())));assert.deepEqual(restored.projection,service.projection);
  }
  const policyKeys=new Set(book.rosterAttachmentPolicies.map(r=>[r.sourceId,r.targetId,r.role].join('/')));
  assert.deepEqual([...policyKeys].sort(),[...new Set(expected.map(r=>[r.sourceId,r.targetId,r.role].join('/')))].sort(),'Missing or invented native recipient relation');
  assert.ok(book.mfmImportReferences.referenceOnlyRelationTargets.length===10);
  for(const r of book.mfmImportReferences.referenceOnlyRelationTargets){assert.ok(!index.has(r.mfmUnitReferenceId));assert.ok(!book.rosterAttachmentPolicies.some(p=>p.targetId===r.mfmUnitReferenceId));}
 });
 check('leader-support-capacity-and-formation-gameplay-not-peer',()=>{
  const service=createBloodAngelsRosterService(book),text=header()+fixture(ID.smCaptain).text+fixture(ID.priest).text+fixture(ID.ordinary).text+fixture(ID.ordinary).text+fixture(ID.smCaptain).text+fixture(ID.priest).text;
  ready(service,text);service.attach('parsed-unit-1','parsed-unit-3');service.attach('parsed-unit-2','parsed-unit-3');const saved=service.snapshot();
  assert.deepEqual(new Set(saved.attachments.map(r=>r.role)),new Set(['LEADER','SUPPORT']));assert.throws(()=>service.attach('parsed-unit-5','parsed-unit-3'));assert.throws(()=>service.attach('parsed-unit-6','parsed-unit-3'));assert.deepEqual(service.snapshot(),saved);
  const priestRule='ability-ba-630ec2727ede4d3f85a2',body=service.projection.units.find(u=>u.instanceId==='parsed-unit-3'),peer=service.projection.units.find(u=>u.instanceId==='parsed-unit-4');
  assert.ok(body.applied.some(t=>t.ruleId===priestRule&&t.sourceInstanceId==='parsed-unit-2'));assert.ok(!peer.applied.some(t=>t.ruleId===priestRule));
  const effective=service.effective(body.instanceId),variants=projectInstanceCards(cards,service.state.units[2],effective);assert.ok(variants.get(ID.ordinary)?.length);assert.equal(projectPersonalBook(payload,service.state).instances.length,6);
 });
 check('black-rage-chapter-and-printed-keywords-do-not-acquire-guessed-context',()=>{
  const service=createBloodAngelsRosterService(book);ready(service,header()+fixture(ID.jump).text+fixture(ID.ordinary).text+fixture(ID.jumpCaptain).text);
  const jump=service.projection.units[0],generic=service.projection.units[1],captain=service.projection.units[2];
  for(const model of jump.profiles)assert.equal(model.profile.stats.OC,sources.get(model.canonicalProfileId).data.stats.OC);
  assert.ok(!generic.keywords.includes('BLOOD ANGELS'));assert.ok(!captain.keywords.includes('IMPERIUM'));
  for(const unit of service.projection.units)for(const key of ['DEATHWING','RAVENWING','DOOMED','GRACE'])assert.ok(!unit.keywords.includes(key));
  for(const e of own.entities.filter(e=>e.kind==='DATASHEET_ABILITY'&&e.data.title==='Black Rage'))assert.ok(e.data.text.includes('or not within 12"'));
  const legacy=sources.get('detachment-rule-ba-10c56bef78b24440bb5f');assert.ok(legacy.data.text.includes('Friendly BLOOD ANGELS CHARACTER units:'));
  const attached=createBloodAngelsRosterService(book);ready(attached,header([legacy.parentId])+fixture(ID.captain).text+fixture(ID.ordinary).text);
  attached.attach('parsed-unit-1','parsed-unit-2');assert.ok(!attached.projection.units[1].keywords.includes('BLOOD ANGELS'),'Attachment invented a physical Faction keyword');
 });
 check('exact-model-enhancement-bearer-and-identical-reimport-preserve-choice',()=>{
  const enhancement='enhancement-ba-c6832a51a86e4ae784ba',source=sources.get(ID.dcCaptain),name=source.data.title;
  const text=header([sources.get(enhancement).parentId])+'2x '+name+' (9999 pts)\n• 1x '+name+'\n• 1x '+name+'\nEnhancement: '+sources.get(enhancement).data.title+'\n';
  const service=createBloodAngelsRosterService(book),r=service.import(text);assert.equal(r.status,'NEEDS_BINDINGS');const need=r.needsBindings.find(n=>n.kind==='ENHANCEMENT_BEARER');assert.equal(need.candidates.length,2);
  ready(service,text,{enhancementBearers:{[need.key]:need.candidates[1].id}});assert.equal(service.state.units[0].enhancementAssignments[0].modelScopeId,need.candidates[1].id);
  const saved=service.snapshot(),projection=service.projection;ready(service,text);assert.deepEqual(service.snapshot(),saved);service.recompute();assert.deepEqual(service.projection,projection);
  const bad=clone(saved);bad.units[0].enhancementAssignments[0].modelScopeId='foreign-model-scope';assert.throws(()=>service.load(bad));assert.deepEqual(service.snapshot(),saved);
 });
 check('replacement-confirmation-rejected-input-and-corrupt-snapshot-atomicity',()=>{
  const service=createBloodAngelsRosterService(book),first=header()+fixture(ID.lemartes).text+fixture(ID.jump).text;ready(service,first);service.attach('parsed-unit-1','parsed-unit-2');
  const saved=service.snapshot(),projection=service.projection,changed=header()+fixture(ID.captain).text;
  assert.equal(service.import(changed).status,'REPLACEMENT_REQUIRED');assert.deepEqual(service.snapshot(),saved);
  for(const text of [header()+'1x Invented Unit (1 pts)\n',header().replace('Blood Angels','Tyranids')+fixture(ID.captain).text]){assert.notEqual(service.import(text,{}, {replaceExisting:true}).status,'READY');assert.deepEqual(service.snapshot(),saved);}
  for(const [name,corrupt]of [
   ['foreign-model',s=>{s.units[0].modelRows[0].canonicalProfileId=sources.get(ID.captain).data.profileIds[0];}],
   ['foreign-mfm',s=>{s.units[0].mfmUnitRecordId='invented-price';}],
   ['foreign-equipment-owner',s=>{s.units[0].modelRows[0].selections=[{selectionKey:'corrupt',physicalQuantity:1,canonicalProfileIds:[sources.get(ID.ordinary).data.weaponIds[0]],canonicalEquipmentIds:[]}];}]
  ]){const bad=clone(saved);corrupt(bad);assert.throws(()=>service.load(bad),undefined,name);assert.deepEqual(service.snapshot(),saved);assert.deepEqual(service.projection,projection);mutations.push(name);}
  ready(service,changed,{}, {replaceExisting:true});assert.equal(service.state.attachments.length,0);
 });
 check('unknown-points-use-existing-visible-warning-without-false-final-total',()=>{
  const element=tag=>({tag,children:[],dataset:{},value:'',attributes:{},set textContent(v){this.value=String(v);this.children=[];},get textContent(){return this.value+this.children.map(c=>c.textContent).join('');},get childElementCount(){return this.children.length;},append(...v){this.children.push(...v);},setAttribute(k,v){this.attributes[k]=v;}}),document={createElement:element};
  const b=book.mfmPhysicalPaidOptions[0],service=createBloodAngelsRosterService(book);ready(service,header()+fixture(b.ownerUnitId).text);
  assert.equal(service.points.totalPoints,null);assert.equal(service.points.status,'UNRESOLVED');const warning=renderRosterPointsStatus(document,{service,titleForId:id=>sources.get(id)?.data.title});assert.match(warning.textContent,/Points cannot be calculated reliably/);
  ready(service,header()+fixture(b.ownerUnitId,{unitGear:'1x '+PAID.find(r=>r[0]===b.costRecordId)[2].replace(/^per /,'')}).text,{}, {replaceExisting:true});assert.equal(service.points.status,'RESOLVED');assert.equal(renderRosterPointsStatus(document,{service}),null);
 });
 check('eight-static-lowerings-through-physical-import-effective-and-guide',()=>{
  const allWeapons=unit=>[...unit.weapons,...unit.profiles.flatMap(p=>p.weapons)];
  const unit=(service,id)=>service.projection.units.find(u=>u.instanceId===id),trace=(u,rule)=>u.applied.filter(t=>t.ruleId===rule);
  const present=(service,id,rule,sourceId=id)=>{
   const effective=service.effective(id),raw=service.state.units.find(u=>u.instanceId===id),variants=projectInstanceCards(cards,raw,effective);
   assert.ok(variants.get(raw.canonicalUnitId)?.length);assert.ok(effective.applied.some(t=>t.ruleId===rule&&t.sourceInstanceId===sourceId),'Imported source trace absent '+rule+' on '+id+' from '+sourceId);
   assert.ok(cards.has(rule));assert.deepEqual(sourceSnapshot(cards.get(rule)),sourceSnapshot(sources.get(rule)));
   assert.equal(projectPersonalBook(payload,service.state).instances.length,service.state.units.length);
   return {effective,variants};
  };
  const stableProjection=service=>{const before=clone(service.projection),snapshot=service.snapshot();service.recompute();assert.deepEqual(service.projection,before);service.load(JSON.parse(JSON.stringify(snapshot)));assert.deepEqual(service.projection,before);};
  const sourceRows=[
   {id:ID.dcCaptain,rule:'ability-ba-3c7cd126400b4e7cb0fc',quote:'This unit has Scouts 6".',ability:'core-scouts'},
   {id:ID.jumpCaptain,rule:'ability-ba-7cbf2dc160514d6d83d6',quote:'This unit’s melee attacks have [SUSTAINED HITS 1].',weapon:'Relic Weapon',weaponAbility:'SUSTAINED HITS 1'},
   {id:ID.jump,rule:'ability-ba-f103714e8c8e4f6f9352',quote:'This unit has +1 to charge rolls.',charge:1},
   {id:ID.captain,rule:'enhancement-ba-c3527131d00a41efae68',quote:'This unit has Scouts 6".',ability:'core-scouts',enhancement:true}
  ];
  for(const test of sourceRows){const source=sources.get(test.rule);assert.ok(source.data.text.includes(test.quote));
   const service=createBloodAngelsRosterService(book),det=test.enhancement?source.parentId:DEFAULT;
   const text=header([det])+fixture(test.id,{weapon:test.weapon}).text+(test.enhancement?'Enhancement: '+source.data.title+'\n':'')+fixture(test.id,{weapon:test.weapon}).text+fixture(ID.ordinary).text;
   ready(service,text);const current=unit(service,'parsed-unit-1'),peer=unit(service,'parsed-unit-2'),unrelated=unit(service,'parsed-unit-3'),display=present(service,current.instanceId,test.rule);
   assert.ok(!trace(unrelated,test.rule).length);
   if(test.enhancement)assert.equal(trace(peer,test.rule).length,0);else assert.ok(trace(peer,test.rule).length);
   if(test.ability){assert.ok(current.abilities.some(a=>a.canonicalId===test.ability&&a.parameters.range===6));
    const view=projectAbilityPresentation({instanceId:current.instanceId,profiles:display.effective.profiles,unitAbilities:display.effective.unitAbilities,applied:display.effective.applied});
    assert.ok(view.core.some(a=>a.canonicalId===test.ability&&a.parameters.range===6&&a.sources.some(t=>t.ruleId===test.rule)));
    if(test.enhancement)assert.ok(!peer.abilities?.some(a=>a.canonicalId===test.ability));
   }
   if(test.weaponAbility){const melee=allWeapons(current).filter(w=>w.data.mode==='melee');assert.ok(melee.length);
    for(const w of melee){assert.equal(w.data.abilities.filter(a=>a.toUpperCase()===test.weaponAbility).length,1);
     const card=display.variants.get(w.canonicalProfileId).find(c=>c.scopeId===w.scopeId&&c.selectionKey===w.selectionKey);assert.ok(card.fields.some(f=>f.value===test.weaponAbility));}}
   if(test.charge){assert.equal(current.metrics.chargeRoll.modifier,1);assert.ok(current.profiles.every(p=>!p.metrics.chargeRoll));
    const metric=display.variants.get(test.id)[0].rosterUnitMetrics.find(m=>m.key==='chargeRoll');assert.equal(metric.displayValue,'+1');assert.ok(metric.sources.some(t=>t.ruleId===test.rule));}
   stableProjection(service);
  }
  // Lemartes' own crozius already has LETHAL HITS; the source-proven attached
  // bodyguard provides an independent, non-vacuous grant/attribution check.
  {const rule='ability-ba-40389ffef38645ca922a',service=createBloodAngelsRosterService(book),text=header()+fixture(ID.lemartes).text+fixture(ID.jump,{weapon:'Chainsword'}).text+fixture(ID.jump,{weapon:'Chainsword'}).text;
   assert.ok(sources.get(rule).data.text.includes('This unit’s melee attacks have [LETHAL HITS].'));ready(service,text);service.attach('parsed-unit-1','parsed-unit-2');
   const body=unit(service,'parsed-unit-2'),peer=unit(service,'parsed-unit-3');present(service,body.instanceId,rule,'parsed-unit-1');
   for(const w of allWeapons(body).filter(w=>w.data.mode==='melee'))assert.equal(w.data.abilities.filter(a=>a.toUpperCase()==='LETHAL HITS').length,1);
   assert.equal(trace(peer,rule).length,0);stableProjection(service);service.detach('parsed-unit-1');assert.equal(trace(unit(service,'parsed-unit-2'),rule).length,0);service.reattach('parsed-unit-1','parsed-unit-2');assert.ok(trace(unit(service,'parsed-unit-2'),rule).length);
  }
  {const rule='ability-ba-630ec2727ede4d3f85a2',service=createBloodAngelsRosterService(book);assert.ok(sources.get(rule).data.text.includes('This unit has +1 T.'));
   ready(service,header()+fixture(ID.priest).text+fixture(ID.ordinary).text+fixture(ID.ordinary).text);service.attach('parsed-unit-1','parsed-unit-2');
   const body=unit(service,'parsed-unit-2'),peer=unit(service,'parsed-unit-3'),display=present(service,body.instanceId,rule,'parsed-unit-1');
   for(const p of body.profiles){const expected=String(Number(sources.get(p.canonicalProfileId).data.stats.T)+1);assert.equal(String(p.profile.stats.T),expected);
    assert.ok(display.variants.get(p.canonicalProfileId).find(c=>c.scopeId===p.scopeId).fields.some(f=>f.source?.path==='/stats/T'&&String(f.value)===expected));}
   assert.equal(trace(peer,rule).length,0);stableProjection(service);
  }
  {const rule='ability-ba-da87d6022de8416d9040',service=createBloodAngelsRosterService(book);assert.ok(sources.get(rule).data.text.includes('This model has +1 W.'));
   ready(service,header()+fixture(ID.jumpCaptain,{modelGear:'1x Relic Shield, 1x Chainsword'}).text+fixture(ID.jumpCaptain,{unitGear:'1x Relic Shield',weapon:'Chainsword'}).text);
   const selected=unit(service,'parsed-unit-1'),unknown=unit(service,'parsed-unit-2'),display=present(service,selected.instanceId,rule);
   for(const p of selected.profiles){const expected=String(Number(sources.get(p.canonicalProfileId).data.stats.W)+1);assert.equal(String(p.profile.stats.W),expected);
    assert.ok(display.variants.get(p.canonicalProfileId).find(c=>c.scopeId===p.scopeId).fields.some(f=>f.source?.path==='/stats/W'&&String(f.value)===expected));}
   assert.equal(trace(unknown,rule).length,0);for(const p of unknown.profiles)assert.equal(p.profile.stats.W,sources.get(p.canonicalProfileId).data.stats.W);stableProjection(service);
  }
  {const rule='enhancement-ba-c6832a51a86e4ae784ba',source=sources.get(rule),name=sources.get(ID.dcCaptain).data.title,weapon='Master-crafted Chainsword';assert.ok(source.data.text.includes('This model’s melee attacks have +2 A.'));
   const text=header([source.parentId])+'2x '+name+' (9999 pts)\n• 1x '+name+': 1x '+weapon+'\n• 1x '+name+': 1x '+weapon+'\nEnhancement: '+source.data.title+'\n'+fixture(ID.dcCaptain,{weapon}).text;
   const service=createBloodAngelsRosterService(book),unbound=service.import(text),need=unbound.needsBindings.find(n=>n.kind==='ENHANCEMENT_BEARER');assert.equal(unbound.status,'NEEDS_BINDINGS');assert.equal(need.candidates.length,2);
   ready(service,text,{enhancementBearers:{[need.key]:need.candidates[1].id}});const assigned=service.state.units[0].enhancementAssignments[0].modelScopeId,current=unit(service,'parsed-unit-1'),display=present(service,current.instanceId,rule);
   for(const w of allWeapons(current)){const base=Number(sources.get(w.canonicalProfileId).data.attacks),expected=base+(w.data.mode==='melee'&&w.scopeId===assigned?2:0);assert.equal(Number(w.data.attacks),expected);
    const card=display.variants.get(w.canonicalProfileId).find(c=>c.scopeId===w.scopeId&&c.selectionKey===w.selectionKey);assert.equal(Number(card.fields.find(f=>f.source?.path==='/attacks').value),expected);}
   assert.equal(trace(unit(service,'parsed-unit-2'),rule).length,0);const saved=service.snapshot();
   const wrong=header([source.parentId])+fixture(ID.captain,{weapon:'Master-crafted Chainsword'}).text+'Enhancement: '+source.data.title+'\n';assert.notEqual(service.import(wrong,{}, {replaceExisting:true}).status,'READY');assert.deepEqual(service.snapshot(),saved);stableProjection(service);
  }
 });
 assert.equal(JSON.stringify([...sources.values()]),before,'Importer mutated accepted facts');
 if(onlyGroups)assert.deepEqual(checks.map(c=>c.id).sort(),[...onlyGroups].sort(),'Unknown targeted QA group');
 progress.close();
 return {status:'PASS',validationScope:onlyGroups?{mode:'TARGETED_GROUPS',groups:onlyGroups}:{mode:'FULL_DEFAULT'},checks,physical,weaponEvidence,assignments,paidEvidence,mutations,
  counts:{bareDatasheetsImportable:physical.length,totalDatasheets:81,modelProfiles:profileIds.size,physicalModelOccurrences:modelOccurrences,explicitWeaponProfiles:weaponEvidence.length,weaponPermissionAmbiguitiesNotProven:2,paidOptions:7,sourceAssignmentItems:40,baLeaderEdges:12,baSupportEdges:8,incomingSmEdges:3},
  limitations:{fixtures:'CONSTRUCTED_PHYSICAL_DIAGNOSTICS_NOT_ARMY_LEGALITY',realNewRecruitExportTested:false,browserVerified:false,weaponPermissionAliases:'NOT_PROVEN',chapterKeywords:'NO_AUTOMATIC_BLOOD_ANGELS',blackRagePositions:'NOT_PROVEN',mfmReferenceOnly:10}};
}
if(process.argv[1]===fileURLToPath(import.meta.url))console.log(JSON.stringify(runBloodAngelsRosterQA({onlyGroups:process.env.BA_ROSTER_QA_GROUPS?.split(',').filter(Boolean)||null}),null,2));

/** Native vocabulary/physical bindings over the closed BA consumer projection.
 * Common facts and reviewed import joins retain their Space Marines owner. */
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {buildBloodAngelsContracts} from './rule-contract-build.mjs';
import {enhancementEligibility} from './rule-contract-declarations.mjs';
import {buildSpaceMarinesImportBook} from '../../space-marines/v2/roster-import-build.mjs';
import {createBloodAngelsPaidOptionBindings} from './roster-paid-option-bindings-build.mjs';
import {buildBloodAngelsAttachmentPolicies} from './roster-relations-build.mjs';
import {buildAttachmentFeasibility} from '../../shared/roster-v2/compatibility-feasibility.mjs';
const clone=structuredClone;
const evidence=(entityId,path)=>({entityId,path});
export function buildBloodAngelsRosterBook({built=buildBloodAngelsContracts()}={}){
 const book=clone(built.book),before=JSON.stringify(built.book),index=new Map(book.entities.map(entity=>[entity.id,entity]));
 const admitted=new Set(index.keys()),sm=buildSpaceMarinesImportBook({built:built.sm}).importBindings;
 const compositions=clone(sm.compositions.filter(row=>admitted.has(row.ownerId)));
 for(const entity of book.entities.filter(row=>row.bookId==='blood-angels'&&row.kind==='COMPOSITION_MEMBER')){
  assert.equal(entity.data.profileBindingStatus,'SOURCE_CONFIRMED');
  assert.equal(index.get(entity.data.modelProfileId)?.parentId,entity.parentId);
  compositions.push({id:entity.id,ownerId:entity.parentId,profileId:entity.data.modelProfileId,
   quantity:clone(entity.data.quantity),labels:[entity.data.name],evidence:evidence(entity.id,'/name')});
 }
 const unresolvedCompositions=clone(sm.unresolvedCompositions.filter(row=>admitted.has(row.ownerId)));
 const identityAliases=clone(sm.identityAliases.filter(row=>admitted.has(row.canonicalId)));
 for(const entity of book.entities.filter(row=>row.bookId==='blood-angels'&&['DATASHEET','PROFILE','DETACHMENT','ENHANCEMENT'].includes(row.kind))){
  const label=entity.data.title||entity.data.name;assert.ok(label);
  identityAliases.push({canonicalId:entity.id,labels:[label],evidence:evidence(entity.id,entity.data.title?'/title':'/name')});
 }
 for(const member of compositions.filter(row=>index.get(row.ownerId).bookId==='blood-angels')){
  const alias=identityAliases.find(row=>row.canonicalId===member.profileId);assert.ok(alias);
  alias.labels=[...new Set([...alias.labels,...member.labels])];
  alias.compositionEvidence??=[];alias.compositionEvidence.push({memberId:member.id,evidence:clone(member.evidence)});
 }
 const weaponSelections=clone(sm.weaponSelections.filter(row=>admitted.has(row.ownerId)));
 for(const unit of book.entities.filter(row=>row.bookId==='blood-angels'&&row.kind==='DATASHEET')){
  const labels=new Map();
  // Exact source profile names are import vocabulary, never permission aliases
  // or an instruction to choose an alternative firing mode.
  for(const id of unit.data.weaponIds){
   const weapon=index.get(id);assert.equal(weapon?.parentId,unit.id);
   const rows=labels.get(weapon.data.name)||[];rows.push(id);labels.set(weapon.data.name,rows);
  }
  for(const [label,ids]of labels)weaponSelections.push({ownerId:unit.id,label,canonicalProfileIds:ids,
   evidence:ids.map(id=>evidence(id,'/name')),...(ids.length>1?{profileRelationship:'SOURCE_EXACT_SHARED_PROFILE_LABEL'}:{})});
 }
 const equipmentSelections=book.rosterEquipmentCaptionBindings.map(row=>({...clone(row),
  evidence:[evidence(row.canonicalEquipmentIds[0],'/title'),evidence(row.canonicalEquipmentIds[0],'/text')]}));
 const enhancements=clone(sm.enhancements.filter(row=>admitted.has(row.id)));
 for(const row of enhancements.filter(row=>row.sourceCorrection))index.get(row.id).data.scope=row.scope;
 for(const entity of book.entities.filter(row=>row.bookId==='blood-angels'&&row.kind==='ENHANCEMENT'))
  enhancements.push({id:entity.id,detachmentId:entity.parentId,scope:entity.data.scope,eligibilityText:entity.data.eligibilityText,
   sourceReference:evidence(entity.id,'/text'),eligibility:clone(enhancementEligibility[entity.id]),
   assignmentReference:clone(entity.ruleContract.assignment),unresolved:false,
   mfmRecordId:book.mfm.enhancementBindings.find(row=>row.entityId===entity.id)?.mfmRecordId});
 const issues=JSON.parse(fs.readFileSync(new URL('./source-issues.json',import.meta.url),'utf8')).issues;
 const unsupportedSelectionBindings=[
  {sourceIssueId:'BA-SRC-DC-JUMP-CHAIN',ownerId:'unit-ba-5269d704246f4e3a8d81',label:'Astartes Chainsword',
   reason:'NOT_PROVEN_WEAPON_PERMISSION_MAPPING',message:'The source permission says Astartes Chainsword, while the MODEL equipment and profile say Chainsword. Their correspondence is not independently confirmed.'},
  {sourceIssueId:'BA-SRC-DC-BOLT-RIFLE',ownerId:'unit-ba-548417d73e544f7f920e',label:'Bolt Rifle Fire',
   reason:'NOT_PROVEN_WEAPON_PERMISSION_MAPPING',message:'The source permission says Bolt Rifle Fire. Its correspondence to the Focused Fire and Saturation profiles is not independently confirmed; no firing profile is selected automatically.'}
 ].map(row=>{
  const issue=issues.find(issue=>issue.id===row.sourceIssueId),owner=index.get(row.ownerId);
  assert.equal(issue?.mappingStatus,'NOT_PROVEN');assert.equal(owner?.bookId,'blood-angels');
  assert.ok(issue.provenance.some(proof=>proof.pointer===owner.provenance.pointer&&proof.sha256===owner.provenance.sha256));
  return {...row,sourceProvenance:clone(issue.provenance)};
 });
 const relations=buildBloodAngelsAttachmentPolicies(book);
 book.rosterIntegrationImplemented=true;
 book.chapterGrantsActive=0;
 book.chapterContextStatus='INTRINSIC_SOURCE_KEYWORDS_ONLY; GENERIC_SM_CHAPTER_NOT_PROVEN';
 // Fresh New Recruit candidates still carry no attachments. Runtime load alone
 // validates user-authored graphs against the source-proven native policies.
 book.rosterAttachmentPolicies=clone(relations.policies);
 book.compatibilityFeasibility=buildAttachmentFeasibility(book,book.rosterProfileBindings.map(binding=>({...binding,
  maxModels:compositions.filter(row=>row.ownerId===binding.unitId&&row.profileId===binding.profileId).reduce((n,row)=>n+row.quantity.max,0)})));
 book.rosterRelationReview=clone(relations);
 book.mfmImportReferences={owner:'CENTRALIZED_MFM',source:clone(built.native.points.sources),
  partitions:Object.fromEntries(['unitBindings','detachmentBindings','enhancementBindings','paidUpgradeBindings'].map(key=>[key,clone(book.mfm[key])])),
  nativePoints:clone(built.native.points),referenceOnlyRelationTargets:clone(built.native.consumed.referenceOnlyRelationTargets)};
 book.mfmPhysicalPaidOptions=createBloodAngelsPaidOptionBindings({book});
 book.importBindings={schema:'blood-angels-v2/import-bindings/v1',identityAliases,compositions,unresolvedCompositions,
  weaponSelections,equipmentSelections,enhancements,unsupportedSelectionBindings,
  nativeReferenceBindings:book.entities.filter(row=>row.kind==='RULE_REFERENCE').map(row=>({id:row.id,ownerId:row.parentId,
   label:row.data.label,recipient:clone(row.data.recipient),provenance:clone(row.provenance)})),
  defaults:'OMITTED_LOADOUT_UNKNOWN',legality:'NOT_ASSESSED',realNewRecruitExportTested:false,
  referenceOnly:clone(built.native.consumed.referenceOnlyRelationTargets),
  chapterContext:'NO_CHAPTER_INFERENCE_FROM_BOOK_FACTION_HEADER_DETACHMENT_OR_ATTACHMENT'};
 assert.equal(book.entities.filter(row=>row.kind==='DATASHEET').length,81);
 assert.equal(compositions.filter(row=>index.get(row.ownerId).bookId==='blood-angels').length,14);
 assert.equal(enhancements.length,40);assert.equal(book.mfmPhysicalPaidOptions.length,7);
 assert.equal(JSON.stringify(built.book),before,'Import bindings changed the canonical consumer');
 return book;
}
export function writeBloodAngelsRosterBook({check=false}={}){
 const book=buildBloodAngelsRosterBook(),target=new URL('./generated/roster-import.json',import.meta.url),bytes=JSON.stringify(book,null,2)+'\n';
 if(check)assert.equal(fs.readFileSync(target,'utf8'),bytes,'Stale BA import output');else fs.writeFileSync(target,bytes);
 return {status:'PASS',datasheets:81,compositions:book.importBindings.compositions.length,
  unresolvedCompositions:book.importBindings.unresolvedCompositions.length,paidOptions:7,relations:book.rosterRelationReview.coverage,
  realNewRecruitExportTested:false};
}
if(process.argv[1]===fileURLToPath(import.meta.url))console.log(JSON.stringify(writeBloodAngelsRosterBook({check:process.argv.includes('--check')})));

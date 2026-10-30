import {serializeSourceJSON,prepareSourceProducer} from '../../shared/source-refs-v2/producer-io.mjs';
/** Native vocabulary/physical bindings over the closed DA consumer projection.
 * Common facts and reviewed import joins retain their Space Marines owner. */
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {buildDarkAngelsContracts} from './rule-contract-build.mjs';
import {enhancementEligibility} from './rule-contract-declarations.mjs';
import {buildSpaceMarinesImportBook} from '../../space-marines/v2/roster-import-build.mjs';
import {createDarkAngelsPaidOptionBindings} from './roster-paid-option-bindings-build.mjs';
import {buildDarkAngelsAttachmentPolicies} from './roster-relations-build.mjs';
import {buildAttachmentFeasibility} from '../../shared/roster-v2/compatibility-feasibility.mjs';
import {buildDetachmentReferences} from './detachment-reference-build.mjs';
const clone=structuredClone;
const evidence=(entityId,path)=>({entityId,path});
export function buildDarkAngelsImportBook({built=buildDarkAngelsContracts()}={}){
  built={...built,book:prepareSourceProducer(built.book),...(built.facts?{facts:prepareSourceProducer(built.facts)}:{}),...(built.native?{native:{...built.native,model:prepareSourceProducer(built.native.model),payload:prepareSourceProducer(built.native.payload)}}:{})};
 const book=clone(built.book),before=JSON.stringify(built.book),index=new Map(book.entities.map(entity=>[entity.id,entity]));
 const admitted=new Set(index.keys()),sm=buildSpaceMarinesImportBook({built:built.sm}).importBindings;
 const compositions=clone(sm.compositions.filter(row=>admitted.has(row.ownerId)));
 for(const entity of book.entities.filter(row=>row.bookId==='dark-angels'&&row.kind==='COMPOSITION_MEMBER')){
  assert.equal(entity.data.profileBindingStatus,'SOURCE_CONFIRMED');
  assert.equal(index.get(entity.data.modelProfileId)?.parentId,entity.parentId);
  compositions.push({id:entity.id,ownerId:entity.parentId,profileId:entity.data.modelProfileId,
   quantity:clone(entity.data.quantity),labels:[entity.data.name],evidence:evidence(entity.id,'/name')});
 }
 const unresolvedCompositions=clone(sm.unresolvedCompositions.filter(row=>admitted.has(row.ownerId)));
 const identityAliases=clone(sm.identityAliases.filter(row=>admitted.has(row.canonicalId)));
 for(const entity of book.entities.filter(row=>row.bookId==='dark-angels'&&['DATASHEET','PROFILE','DETACHMENT','ENHANCEMENT'].includes(row.kind))){
  const label=entity.data.title||entity.data.name;assert.ok(label);
  identityAliases.push({canonicalId:entity.id,labels:[label],evidence:evidence(entity.id,entity.data.title?'/title':'/name')});
 }
 for(const member of compositions.filter(row=>index.get(row.ownerId).bookId==='dark-angels')){
  const alias=identityAliases.find(row=>row.canonicalId===member.profileId);assert.ok(alias);
  alias.labels=[...new Set([...alias.labels,...member.labels])];
  alias.compositionEvidence??=[];alias.compositionEvidence.push({memberId:member.id,evidence:clone(member.evidence)});
 }
 const weaponSelections=clone(sm.weaponSelections.filter(row=>admitted.has(row.ownerId)));
 for(const unit of book.entities.filter(row=>row.bookId==='dark-angels'&&row.kind==='DATASHEET')){
  const labels=new Map(),families=new Set();
  for(const id of unit.data.weaponIds){
   const weapon=index.get(id);assert.equal(weapon?.parentId,unit.id);
   const rows=labels.get(weapon.data.name)||[];rows.push(id);labels.set(weapon.data.name,rows);
   const split=weapon.data.name.split(/\s+[–—-]\s+/);if(split.length>1)families.add(split[0]);
  }
  for(const label of families)labels.set(label,unit.data.weaponIds.filter(id=>{
   const name=index.get(id).data.name;return name===label||name.split(/\s+[–—-]\s+/)[0]===label;
  }));
  for(const [label,ids]of labels)weaponSelections.push({ownerId:unit.id,label,canonicalProfileIds:ids,
   evidence:ids.map(id=>evidence(id,'/name')),...(ids.length>1?{profileRelationship:'SOURCE_NAMED_ALTERNATIVE_PROFILES'}:{})});
 }
 const equipmentSelections=book.rosterEquipmentCaptionBindings.map(row=>({...clone(row),
  evidence:[evidence(row.canonicalEquipmentIds[0],'/title'),evidence(row.canonicalEquipmentIds[0],'/text')]}));
 const enhancements=clone(sm.enhancements.filter(row=>admitted.has(row.id)));
 for(const row of enhancements.filter(row=>row.sourceCorrection))index.get(row.id).data.scope=row.scope;
 for(const entity of book.entities.filter(row=>row.bookId==='dark-angels'&&row.kind==='ENHANCEMENT'))
  enhancements.push({id:entity.id,detachmentId:entity.parentId,scope:entity.data.scope,eligibilityText:entity.data.eligibilityText,
   sourceReference:evidence(entity.id,'/text'),eligibility:clone(enhancementEligibility[entity.id]),
   assignmentReference:clone(entity.ruleContract.assignment),unresolved:false,
   mfmRecordId:book.mfm.enhancementBindings.find(row=>row.entityId===entity.id)?.mfmRecordId});
 const relations=buildDarkAngelsAttachmentPolicies(book);
 book.rosterIntegrationImplemented=true;
 book.chapterGrantsActive=26;
 book.chapterContextStatus='CONDITIONAL_SOURCE_FIXED_DA_ARMY_MEMBERSHIP; GENERIC_ONLY_NOT_PROVEN';
 // Fresh New Recruit candidates still carry no attachments. Runtime load alone
 // validates user-authored graphs against the source-proven native policies.
 book.rosterAttachmentPolicies=clone(relations.policies);
 book.compatibilityFeasibility=buildAttachmentFeasibility(book,book.rosterProfileBindings.map(binding=>({...binding,
  maxModels:compositions.filter(row=>row.ownerId===binding.unitId&&row.profileId===binding.profileId).reduce((n,row)=>n+row.quantity.max,0)})));
 book.rosterRelationReview=clone(relations);
 book.mfmImportReferences={owner:'CENTRALIZED_MFM',source:clone(built.native.points.sources),
  partitions:Object.fromEntries(['unitBindings','detachmentBindings','enhancementBindings','paidUpgradeBindings'].map(key=>[key,clone(book.mfm[key])])),
  nativePoints:clone(built.native.points),referenceOnlyRelationTargets:clone(built.native.consumed.referenceOnlyRelationTargets)};
 book.mfmPhysicalPaidOptions=createDarkAngelsPaidOptionBindings({book});
 book.importBindings={schema:'dark-angels-v2/import-bindings/v1',identityAliases,compositions,unresolvedCompositions,
  weaponSelections,equipmentSelections,enhancements,
  nativeReferenceBindings:book.entities.filter(row=>row.kind==='RULE_REFERENCE').map(row=>({id:row.id,ownerId:row.parentId,
   label:row.data.label,recipient:clone(row.data.recipient),provenance:clone(row.provenance)})),
  defaults:'OMITTED_LOADOUT_UNKNOWN',legality:'NOT_ASSESSED',realNewRecruitExportTested:false,
  referenceOnly:clone(built.native.consumed.referenceOnlyRelationTargets),
  chapterContext:'SOURCE_FIXED_DA_MEMBER_AND_VALIDATED_CLOSED_MEMBERSHIP; GENERIC_ONLY_NOT_PROVEN'};
 assert.equal(book.entities.filter(row=>row.kind==='DATASHEET').length,83);
 assert.equal(compositions.filter(row=>index.get(row.ownerId).bookId==='dark-angels').length,21);
 assert.equal(enhancements.length,40);assert.equal(book.mfmPhysicalPaidOptions.length,8);
 // Membership admits only source-backed references, never allied gameplay.
 const allied=buildDetachmentReferences(built.sm.native);
 assert.ok(allied.entities.every(row=>!index.has(row.id)),'Duplicate allied membership');
 book.entities.push(...allied.entities);
 book.canonicalMembership.push(...allied.membership);
 book.mfm.detachmentBindings.push(clone(allied.binding));
 book.mfmImportReferences.partitions.detachmentBindings.push(clone(allied.binding));
 book.mfmImportReferences.nativePoints.detachments.push(clone(allied.points));
 book.rosterDetachmentReferenceReview=clone(allied.review);
 // Exact exported army label is not a physical Chapter keyword grant.
 book.importBindings.factionIdentityLabels=['Imperium - Adeptus Astartes - Dark Angels'];
 assert.equal(JSON.stringify(built.book),before,'Import bindings changed the canonical consumer');
 return book;
}
export function writeDarkAngelsImportBook({check=false}={}){
 const book=buildDarkAngelsImportBook(),target=new URL('./generated/roster-import.json',import.meta.url),bytes=serializeSourceJSON(book);
 if(check)assert.equal(fs.readFileSync(target,'utf8'),bytes,'Stale DA import output');else fs.writeFileSync(target,bytes);
 return {status:'PASS',datasheets:83,compositions:book.importBindings.compositions.length,
  unresolvedCompositions:book.importBindings.unresolvedCompositions.length,paidOptions:8,relations:book.rosterRelationReview.coverage,
  realNewRecruitExportTested:false};
}
if(process.argv[1]===fileURLToPath(import.meta.url))console.log(JSON.stringify(writeDarkAngelsImportBook({check:process.argv.includes('--check')})));

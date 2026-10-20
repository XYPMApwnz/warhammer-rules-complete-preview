/** Source-owned import vocabulary over the existing physical V2 contract.
 * These names address existing records; they create no models, default weapons,
 * points, army legality decisions or legacy compatibility identities.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import {buildSpaceMarinesContracts} from './rule-contract-build.mjs';
import {enhancementEligibility} from './rule-contract-declarations.mjs';
import {createSpaceMarinesPaidOptionBindings} from './roster-paid-option-bindings-build.mjs';
import {readSpaceMarinesRosterCorrections} from './roster-source-review.mjs';

const clone=structuredClone;
const evidence=(entityId,path)=>({entityId,path});
const names=entity=>[entity.data.title,entity.data.name].filter(value=>typeof value==='string'&&value.length);
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);

export function buildSpaceMarinesImportBook({built=buildSpaceMarinesContracts(),modelMappings,scopeCorrections}={}){
  if(modelMappings===undefined||scopeCorrections===undefined){
    const review=readSpaceMarinesRosterCorrections();
    modelMappings??=review.modelMappings;scopeCorrections??=review.scopeCorrections;
  }
  const book=clone(built.book),original=JSON.stringify(built.book),index=new Map(book.entities.map(entity=>[entity.id,entity]));
  assert.equal(book.bookId,'space-marines');
  const approved=new Map();
  for(const mapping of modelMappings){
    const member=index.get(mapping.memberId),profile=index.get(mapping.profileId);
    assert.equal(member?.kind,'COMPOSITION_MEMBER');assert.equal(profile?.kind,'PROFILE');
    assert.equal(member.parentId,profile.parentId,'Foreign composition/profile mapping');
    assert.ok(mapping.evidence?.length&&mapping.provenance,'Missing reviewed mapping proof');
    assert.ok(!approved.has(member.id),'Duplicate reviewed composition mapping');approved.set(member.id,mapping);
  }
  const compositions=[],unresolvedCompositions=[];
  for(const member of book.entities.filter(entity=>entity.kind==='COMPOSITION_MEMBER')){
    const reviewed=approved.get(member.id),profileId=reviewed?.profileId||member.data.modelProfileId;
    if(member.data.profileBindingStatus!=='SOURCE_CONFIRMED'&&!reviewed){
      unresolvedCompositions.push({id:member.id,ownerId:member.parentId,label:member.data.name,status:'NOT_PROVEN',
        reason:'The source composition member has no independently confirmed MODEL profile binding.',provenance:clone(member.provenance)});continue;
    }
    assert.equal(index.get(profileId)?.parentId,member.parentId);
    compositions.push({id:member.id,ownerId:member.parentId,profileId,quantity:clone(member.data.quantity),
      labels:[member.data.name],evidence:evidence(member.id,'/name'),
      ...(reviewed?{reviewedMapping:clone(reviewed)}:{})});
  }
  const identityAliases=[];
  for(const entity of book.entities.filter(entity=>['DATASHEET','PROFILE','DETACHMENT','ENHANCEMENT'].includes(entity.kind))){
    const labels=names(entity),path=entity.data.title?'/title':'/name';assert.ok(labels.length);
    identityAliases.push({canonicalId:entity.id,labels:[...new Set(labels)],evidence:evidence(entity.id,path)});
  }
  // A composition's literal model name may address its source-confirmed
  // profile. This is an explicit canonical join, not pluralisation or a fuzzy
  // alias inferred from a nearby profile name.
  for(const member of compositions){
    const alias=identityAliases.find(row=>row.canonicalId===member.profileId);
    assert.ok(alias);alias.labels=[...new Set([...alias.labels,...member.labels])];
    alias.compositionEvidence??=[];alias.compositionEvidence.push({memberId:member.id,evidence:clone(member.evidence)});
  }
  const weaponSelections=[];
  for(const unit of book.entities.filter(entity=>entity.kind==='DATASHEET')){
    const labels=new Map(),families=new Set();
    for(const id of unit.data.weaponIds){
      const profile=index.get(id);assert.equal(profile?.kind,'WEAPON_PROFILE');assert.equal(profile.parentId,unit.id);
      const named=labels.get(profile.data.name)||[];named.push(id);labels.set(profile.data.name,named);
      const split=profile.data.name.split(/\s+[–—-]\s+/);
      if(split.length>1)families.add(split[0]);
    }
    // Existing shared import vocabulary represents alternate firing modes as
    // profiles of the same exported piece, with one retained physical quantity.
    // Some sources also give the ordinary mode the unsuffixed weapon name;
    // retain that profile alongside the suffixed mode (e.g. Melta Rifle).
    for(const label of families)labels.set(label,unit.data.weaponIds.filter(id=>{
      const name=index.get(id).data.name;return name===label||name.split(/\s+[–—-]\s+/)[0]===label;
    }));
    for(const [label,ids]of labels)weaponSelections.push({ownerId:unit.id,label,canonicalProfileIds:ids,
      evidence:ids.map(id=>evidence(id,'/name')),...(ids.length>1?{profileRelationship:'SOURCE_NAMED_ALTERNATIVE_PROFILES'}:{})});
  }
  const equipmentSelections=[];
  for(const item of book.entities.filter(entity=>entity.kind==='DATASHEET_SECTION'&&entity.data.wargearAbility)){
    const label=item.data.title,start=item.data.text.indexOf(label);
    assert.equal(start,0,'Equipment caption is not the literal source heading');
    const permissions=book.entities.filter(entity=>entity.kind==='WARGEAR_OPTION'&&entity.parentId===item.parentId&&
      entity.data.text.toLowerCase().includes(label.toLowerCase()));
    equipmentSelections.push({ownerId:item.parentId,label,canonicalEquipmentIds:[item.id],canonicalFieldPaths:{[item.id]:['/text']},
      requiresModelBearer:false,modelEffectRequiresConfirmedBearer:true,
      evidence:[evidence(item.id,'/title'),evidence(item.id,'/text'),...permissions.map(entity=>evidence(entity.id,'/text'))],
      sourceReferences:[{entityId:item.id,path:'/text',bookId:book.bookId,caption:{start,end:start+label.length}}],
      sourcePermissionReferences:permissions.map(entity=>evidence(entity.id,'/text'))});
  }
  const reviewedScopes=new Map();
  for(const correction of scopeCorrections){
    const entity=index.get(correction.entityId||correction.id);
    assert.equal(entity?.kind,'ENHANCEMENT');assert.equal(entity.data.scope,correction.previousScope||'MODEL');
    assert.equal(correction.scope||correction.correctedScope,'UNIT');
    assert.ok(correction.provenance&&correction.evidence,'Missing source scope correction evidence');
    assert.ok(/\bunit only\./i.test(entity.data.eligibilityText),'Reviewed UNIT scope lacks literal source permission');
    assert.ok(!reviewedScopes.has(entity.id));reviewedScopes.set(entity.id,clone(correction));
    entity.data.scope='UNIT';
  }
  const enhancements=book.entities.filter(entity=>entity.kind==='ENHANCEMENT').map(entity=>({id:entity.id,
    detachmentId:entity.parentId,scope:entity.data.scope,eligibilityText:entity.data.eligibilityText,
    sourceReference:evidence(entity.id,'/text'),eligibility:reviewedScopes.has(entity.id)?{
      subject:'UNIT',keywords:['ADEPTUS ASTARTES'],eligibilityEvidence:entity.data.eligibilityText,
      sourceCorrection:clone(reviewedScopes.get(entity.id)),unresolved:false
    }:clone(enhancementEligibility[entity.id]),
    assignmentReference:clone(entity.ruleContract?.assignment||null),
    unresolved:!entity.ruleContract?.assignment&&!reviewedScopes.has(entity.id),
    ...(reviewedScopes.has(entity.id)?{sourceCorrection:clone(reviewedScopes.get(entity.id))}:{}),
    mfmRecordId:built.consumed.partitions.enhancementBindings.find(row=>row.entityId===entity.id)?.mfmRecordId}));
  const inactiveTargets=built.consumed.relationDeclarations.flatMap(row=>row.targets).filter(row=>!row.entityId);
  const referenceOnly=clone([...(built.consumed.referenceOnlyUnits||[]),
    ...new Map(inactiveTargets.map(row=>[row.mfmUnitReferenceId,row])).values()]);
  // The import-only boundary validates an empty graph. Runtime constructs the
  // actual army-context-dependent policies before accepting attachments.
  book.rosterAttachmentPolicies=[];
  book.mfmImportReferences=clone(Object.fromEntries(['source','partitions','relationDeclarations','nativePoints','referenceOnlyUnits','referenceOnlyOwners']
    .map(key=>[key,built.consumed[key]])));
  book.mfmPhysicalPaidOptions=createSpaceMarinesPaidOptionBindings();
  book.importBindings={schema:'space-marines-v2/import-bindings/v1',identityAliases,compositions,unresolvedCompositions,
    weaponSelections,equipmentSelections,enhancements,
    nativeReferenceBindings:book.entities.filter(entity=>entity.kind==='RULE_REFERENCE').map(entity=>({id:entity.id,ownerId:entity.parentId,
      label:entity.data.label,recipient:clone(entity.data.recipient),provenance:clone(entity.provenance)})),
    defaults:'OMITTED_LOADOUT_UNKNOWN',legality:'NOT_ASSESSED',realNewRecruitExportTested:false,
    referenceOnly,paidOptionsPhysicalStatus:'REQUIRES_EXACT_PHYSICAL_SELECTION_BINDING'};
  book.rosterEquipmentCaptionBindings=clone(equipmentSelections);
  assert.equal(JSON.stringify(built.book),original,'Import builder changed the gameplay factual view');
  assert.ok(book.entities.every(entity=>entity.bookId==='space-marines'),'Foreign book factual owner');
  assert.equal(new Set(book.entities.map(entity=>entity.id)).size,book.entities.length);
  assert.ok(same(book.importBindings.compositions.map(row=>row.id).sort(),[...compositions.map(row=>row.id)].sort()));
  return book;
}

export function writeSpaceMarinesImportBook({check=false}={}){
  const book=buildSpaceMarinesImportBook(),target=new URL('./generated/roster-import.json',import.meta.url);
  const bytes=JSON.stringify(book,null,2)+'\n';
  if(check)assert.equal(fs.readFileSync(target,'utf8'),bytes,'Stale Space Marines native import view');
  else fs.writeFileSync(target,bytes);
  return {status:'PASS',datasheets:book.entities.filter(entity=>entity.kind==='DATASHEET').length,
    compositions:book.importBindings.compositions.length,unresolvedCompositions:book.importBindings.unresolvedCompositions.length,
    equipmentBindings:book.importBindings.equipmentSelections.length,paidOptions:book.mfmPhysicalPaidOptions.length,
    realNewRecruitExportTested:false,frontendVerified:false};
}
if(process.argv[1]&&fileURLToPath(import.meta.url)===fs.realpathSync(process.argv[1]))
  console.log(JSON.stringify(writeSpaceMarinesImportBook({check:process.argv.includes('--check')})));

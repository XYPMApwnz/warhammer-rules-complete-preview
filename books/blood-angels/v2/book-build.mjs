/** Closed BA consumer membership over independently owned native facts.
 * This is a disposable V2 projection, never a second SM factual owner.
 */
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {buildNativeMfmBook as buildSM} from '../../space-marines/v2/mfm-build.mjs';
import {bindNativeKeywords} from '../../space-marines/v2/native-ability-bindings.mjs';
import {readSpaceMarinesRosterCorrections} from '../../space-marines/v2/roster-source-review.mjs';
import {createEffectiveMfmCatalog} from '../../../mfm/content/effective-mfm-catalog.mjs';
import {createEffectiveMfmArmyProjection} from '../../shared/tools/effective-mfm-army-projection.mjs';
import {projectArmyBook} from '../../shared/army-book-app-v2/project.mjs';
import {buildAttachmentFeasibility} from '../../shared/roster-v2/compatibility-feasibility.mjs';
import {consumeMfm} from './mfm-boundary.mjs';
import {buildBAOwnedNative} from './owned-book-view.mjs';
const read=name=>JSON.parse(fs.readFileSync(new URL(name,import.meta.url),'utf8'));
const clone=structuredClone,sort=rows=>[...rows].sort((a,b)=>a.id.localeCompare(b.id));

export function buildBloodAngelsMixedBook({baFacts=read('./generated/effective.json'),
  baBase=read('./generated/base.json'),smFacts=read('../../space-marines/v2/generated/effective.json'),
  membership=read('./inherited-sm-references.json')}={}){
  assert.deepEqual(membership,read('./inherited-sm-references.json'),'Unreviewed inherited membership');
  const before=[baFacts,baBase,smFacts,membership].map(value=>JSON.stringify(value));
  const smById=new Map(smFacts.entities.map(entity=>[entity.id,entity]));
  const declared=new Set();
  for(const ref of membership.references){
    const entity=smById.get(ref.canonicalId);
    assert.ok(entity&&entity.bookId==='space-marines'&&ref.sourceOwner===entity.bookId,'Unresolved/foreign inherited reference');
    assert.equal(ref.sourceEntityId,entity.sourceEntityId);assert.equal(ref.kind,entity.kind);
    assert.deepEqual(ref.provenance,entity.provenance,'Changed inherited source provenance');
    assert.ok(!declared.has(entity.id),'Duplicate inherited membership');declared.add(entity.id);
  }
  assert.equal(declared.size,180);
  // Admission is explicit. Descendants retain their original parent and owner;
  // no title, Chapter, source order or attachment can add another root.
  const inheritedIds=new Set(declared);
  for(let changed=true;changed;){changed=false;
    for(const entity of smFacts.entities)if(inheritedIds.has(entity.parentId)&&!inheritedIds.has(entity.id)){
      inheritedIds.add(entity.id);changed=true;
    }
  }
  const canonicalEntities=[...baFacts.entities,...smFacts.entities.filter(entity=>inheritedIds.has(entity.id))];
  const canonicalIds=new Set(canonicalEntities.map(entity=>entity.id));
  assert.equal(canonicalIds.size,canonicalEntities.length,'Ambiguous canonical ownership');
  const ba=buildBAOwnedNative({facts:baFacts,base:baBase}),sm=buildSM({facts:smFacts});
  const smView=clone(sm.model),keywordReview=bindNativeKeywords(smView);
  const entities=sort([...ba.model.entities,...smView.entities.filter(entity=>inheritedIds.has(entity.id))]);
  const byId=new Map(entities.map(entity=>[entity.id,entity]));
  const units=entities.filter(entity=>entity.kind==='DATASHEET'),unitIds=new Set(units.map(entity=>entity.id));
  assert.equal(units.length,81);assert.equal(units.filter(entity=>entity.bookId==='space-marines').length,67);
  for(const excluded of membership.excludedOtherChapterDatasheets)assert.ok(!unitIds.has(excluded.canonicalId),'Foreign Chapter member');
  for(const entity of entities){
    assert.ok(['blood-angels','space-marines'].includes(entity.bookId));
    if(entity.parentId)assert.equal(byId.get(entity.parentId)?.bookId,entity.bookId,'Cross-owner canonical parent');
    if(entity.sourceKind==='DATASHEET_ABILITY'&&entity.data.wargearAbility)entity.kind='DATASHEET_SECTION';
  }
  const consumed=consumeMfm(baFacts.entities),central=createEffectiveMfmCatalog(),records=new Map();
  const partitions={};
  for(const part of ['unitBindings','detachmentBindings','enhancementBindings','paidUpgradeBindings']){
    partitions[part]=[...consumed.partitions[part],...sm.consumed.partitions[part].filter(binding=>canonicalIds.has(binding.entityId))];
    assert.equal(new Set(partitions[part].map(binding=>binding.mfmRecordId)).size,partitions[part].length,'Duplicate central price occurrence');
  }
  const own=id=>{
    if(records.has(id))return;
    const fact=central.getById(id);assert.ok(fact,'Unresolved central price reference');
    assert.equal(fact.provenance.sourceVersion,'v1.6','Stale price');records.set(id,fact);
    for(const child of [...fact.qualifierIds||[],...fact.enhancementCostIds||[]])own(child);
  };
  for(const bindings of Object.values(partitions))for(const binding of bindings)own(binding.mfmRecordId);
  const book={...clone(ba.model),bookId:'blood-angels',entities,
    authority:'DISPOSABLE_MIXED_OWNER_CONSUMER_PROJECTION',
    mfmBoundary:{...clone(ba.model.mfmBoundary),integration:'NATIVE_PRICING_BOUND'},
    canonicalMembership:canonicalEntities.map(entity=>({id:entity.id,bookId:entity.bookId,sourceEntityId:entity.sourceEntityId})),
    mfm:{source:{label:'Official MFM v1.6; source-owned BA/SM partitions'},...partitions,
      relations:[],eligibilityEvidenceBindings:[]},
    rosterAttachmentPolicies:[],rosterEquipmentCaptionBindings:[],
    chapterContextStatus:'NOT_PROVEN_FOR_INHERITED_PHYSICAL_UNIT',chapterGrantsActive:false};
  // Exact same source-flagged caption vocabulary as the existing SM adapter.
  // bookId on the display reference is the consumer domain, not source ownership.
  for(const item of entities.filter(entity=>entity.kind==='DATASHEET_SECTION'&&entity.data.wargearAbility)){
    const label=item.data.title,start=item.data.text.indexOf(label);assert.equal(start,0);
    book.rosterEquipmentCaptionBindings.push({ownerId:item.parentId,label,
      canonicalEquipmentIds:[item.id],canonicalFieldPaths:{[item.id]:['/text']},
      requiresModelBearer:false,modelEffectRequiresConfirmedBearer:true,
      sourceReferences:[{entityId:item.id,path:'/text',bookId:book.bookId,caption:{start,end:start+label.length}}]});
  }
  book.rosterProfileBindings=entities.filter(entity=>entity.kind==='PROFILE').map(profile=>{
    const unit=byId.get(profile.parentId),named=unit.data.modelKeywordDeclarations.filter(row=>row.sourceProfileId===profile.id);
    assert.ok(named.every(row=>row.profileBindingStatus==='SOURCE_CONFIRMED'));
    return {unitId:unit.id,profileId:profile.id,intrinsicKeywords:[...new Set([
      ...unit.data.keywords,...unit.data.factionKeywords,...named.flatMap(row=>row.keywords)])]};
  });
  const reviewed=readSpaceMarinesRosterCorrections({facts:smFacts}).modelMappings;
  const composition=book.rosterProfileBindings.map(binding=>{
    const member=entities.find(entity=>entity.kind==='COMPOSITION_MEMBER'&&entity.parentId===binding.unitId&&
      (entity.data.modelProfileId===binding.profileId||reviewed.some(row=>row.memberId===entity.id&&row.profileId===binding.profileId)));
    assert.ok(member?.data.quantity,'Unresolved physical composition boundary');
    return {...binding,maxModels:member.data.quantity.max};
  });
  book.compatibilityFeasibility=buildAttachmentFeasibility(book,composition);
  const payload=projectArmyBook(book,records,{title:'Blood Angels',edition:'11th Edition'});
  const templates=new Map([...ba.payload.cards,...sm.payload.cards.filter(card=>inheritedIds.has(card.id))].map(card=>[card.id,card]));
  for(const card of payload.cards){
    const entity=byId.get(card.id),centralFact=records.get(card.id);
    card.identity={registryId:entity?.bookId||'mfm',canonicalId:card.id};
    card.provenance=clone((entity||centralFact).provenance);
    const template=templates.get(card.id);if(!template)continue;
    const oldFields=new Map(template.fields.map(field=>[field.id,field]));
    card.fields=card.fields.map(field=>({...clone(oldFields.get(field.id)||{}),...field,
      ...(oldFields.get(field.id)?.presentationPath?{presentationPath:oldFields.get(field.id).presentationPath}:{})}));
    card.kind=template.kind;card.provenance=clone(byId.get(card.id).provenance);
    card.fieldProvenance=clone(byId.get(card.id).fieldProvenance||{});
    card.children=[...template.children.filter(id=>canonicalIds.has(id)),...card.children.filter(id=>!canonicalIds.has(id))];
    for(const key of ['keywordGroups','profileFieldIds'])if(template[key])card[key]=clone(template[key]);
  }
  payload.datasheetPresentation={...clone(ba.payload.datasheetPresentation),
    sectionRoles:{...ba.payload.datasheetPresentation.sectionRoles,...sm.payload.datasheetPresentation.sectionRoles}};
  payload.datasheetPresentation.sectionRoles=Object.fromEntries(Object.entries(payload.datasheetPresentation.sectionRoles).filter(([id])=>canonicalIds.has(id)));
  payload.bookPresentation={schema:'army-book-app-v2/book-v1-presentation',records:{
    ...ba.payload.bookPresentation.records,...Object.fromEntries(Object.entries(sm.payload.bookPresentation.records).filter(([id])=>canonicalIds.has(id)))}};
  payload.groups=payload.groups.filter(group=>group.itemIds.length);
  payload.sourceCompleteness={sourceCompleteness:'PARTIAL',semanticCompleteness:'NOT_PROVEN',contentCertified:false};
  payload.rulePresentationLimitations={runtime:'NO_GAMEPLAY_CONTRACTS_ACTIVATED',chapterContext:'NOT_PROVEN_FOR_INHERITED_UNIT',
    relations:'SOURCE_DECLARATIONS_ONLY; CENTRAL_REFERENCE_ONLY_TARGETS_INACTIVE',
    physicalPaidOptions:'NOT_PROVEN_NO_CHARGE',scope:'STAGE_2C_MIXED_OWNER_PROJECTION_ONLY'};
  const smPoints=createEffectiveMfmArmyProjection('space-marines').pointsForArmyBook('space-marines');
  const points={owner:'CENTRALIZED_MFM',bookId:'blood-angels',
    sources:{'blood-angels':clone(consumed.source),'space-marines':clone(smPoints.source)}};
  for(const part of ['units','detachments','enhancements'])points[part]=[...consumed.points[part],
    ...smPoints[part].filter(row=>canonicalIds.has(row.id))].map(row=>({...clone(row),sourceOwner:byId.get(row.id).bookId}));
  assert.equal(new Set(points.units.map(row=>row.id)).size,81);
  points.physicalPaidOptions='NOT_PROVEN_NO_CHARGE';
  const centralRefs=new Map(central.catalog.unitReferences.map(row=>[row.id,row]));
  const relationReferences=[...central.catalog.leaderEligibilityRecords,...central.catalog.supportEligibilityRecords]
    .filter(row=>unitIds.has(centralRefs.get(row.sourceUnitReferenceId)?.armyBinding?.armyUnitId))
    .map(row=>{
      const source=centralRefs.get(row.sourceUnitReferenceId).armyBinding.armyUnitId;
      return {mfmRecordId:row.id,sourceCanonicalId:source,sourceOwner:byId.get(source).bookId,
        role:row.recordType==='MFM_LEADER_ELIGIBILITY'?'LEADER':'SUPPORT',
        targets:row.targetUnitReferenceIds.map(id=>{
          const target=centralRefs.get(id)?.armyBinding,canonicalId=target?.bindingStatus==='BOUND'?target.armyUnitId:null;
          return {mfmUnitReferenceId:id,canonicalId:unitIds.has(canonicalId)?canonicalId:null,
            sourceOwner:unitIds.has(canonicalId)?byId.get(canonicalId).bookId:null,
            status:unitIds.has(canonicalId)?'MEMBER_SOURCE_DECLARATION':canonicalId?'OUTSIDE_MEMBERSHIP':'REFERENCE_ONLY'};
        }),active:false,provenance:clone(row.provenance)};
    });
  book.sourceRelationReferences=clone(relationReferences);
  book.mixedOwnerRuntimeStatus='VERIFIED_NATIVE_PROJECTIONS; PHYSICAL_CHAPTER_CONTEXT_NOT_PROVEN';
  const coverage={inheritedReferences:declared.size,inheritedClosure:inheritedIds.size,
    datasheets:units.length,ownedDatasheets:14,inheritedDatasheets:67,
    modelProfiles:entities.filter(entity=>entity.kind==='PROFILE').length,
    weaponProfiles:entities.filter(entity=>entity.kind==='WEAPON_PROFILE').length,
    equipmentCaptionBindings:book.rosterEquipmentCaptionBindings.length,
    pricingBindings:Object.fromEntries(Object.entries(partitions).map(([part,rows])=>[part,rows.length])),
    keywordNormalizations:keywordReview.bindings.filter(row=>unitIds.has(row.id)).length,
    chapterGrants:0,physicalChapterContext:'NOT_PROVEN',
    sourceRelationReferences:relationReferences.length,
    relationPoliciesActive:0,executableEffects:0,realNewRecruitExportTested:false,
    factsCopiedToNewOwner:false,sharedChanges:0};
  assert.deepEqual([baFacts,baBase,smFacts,membership].map(value=>JSON.stringify(value)),before,'Factual owner mutated');
  return {book,model:book,payload,points,canonicalEntities,membership,coverage,consumed,inheritedIds,relationReferences};
}
export function writeBloodAngelsMixedBook({check=false}={}){
  const result=buildBloodAngelsMixedBook();
  for(const [name,value]of [['mixed-owner-book',result.book],['mixed-owner-presentation',result.payload],
    ['mixed-owner-points',result.points],['mixed-owner-coverage',result.coverage]]){
    const file=new URL('./generated/'+name+'.json',import.meta.url),bytes=JSON.stringify(value,null,2)+'\n';
    if(check)assert.equal(fs.readFileSync(file,'utf8'),bytes,'Stale BA mixed-owner output '+name);else fs.writeFileSync(file,bytes);
  }
  return result;
}
if(process.argv[1]===fileURLToPath(import.meta.url))console.log(JSON.stringify(writeBloodAngelsMixedBook({check:process.argv.includes('--check')}).coverage));

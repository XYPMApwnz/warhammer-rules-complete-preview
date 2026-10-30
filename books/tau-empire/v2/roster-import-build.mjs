import {parseProducerJSON,serializeSourceJSON} from '../../shared/source-refs-v2/producer-io.mjs';
import {finalizeRecipientBook} from '../../shared/rule-contract-v2/finalize-recipients.mjs';
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {buildTauContracts,createTauRuleSchema} from './rule-contract-build.mjs';
import {enhancementEligibility} from './rule-contract-declarations.mjs';
import {consumeMfm} from './mfm-boundary.mjs';
import {addTauSourceChoices,tauStudentRuleId} from './roster-source-choices.mjs';
import {addTauPrototypeChoices} from './roster-weapon-choices.mjs';
import {createEffectiveCoreCatalog} from '../../core-rules/content/effective-core-catalog.mjs';
import {validateRosterEffects,validateRosterEffectDeclarations} from '../../shared/roster-v2/effects.mjs';
import {bindCanonicalContract,bindDeclarationClauses,inspectDeclarationEvidence} from '../../shared/rule-contract-v2/bindings.mjs';

const read=name=>parseProducerJSON(fs.readFileSync(new URL(name,import.meta.url),'utf8'));
const copy=structuredClone;
const at=(value,path)=>path.slice(1).split('/').reduce((item,key)=>item?.[key],value);

/** Disposable import/runtime view; canonical entities remain the factual owners.
 * No selection legality or inferred default weapon is introduced here. */
export function buildTauImportBook(){
  const {book}=buildTauContracts({recipientStage:'DECLARATION'}),source=read('./roster-import-source-bindings.json');
  const index=new Map(book.entities.map(e=>[e.id,e]));
  const bytes=fs.readFileSync(new URL('../../../'+source.exportSource.document,import.meta.url));
  assert.equal(createHash('sha256').update(bytes).digest('hex').toUpperCase(),source.exportSource.sha256);
  const vocabulary=parseProducerJSON(bytes);
  for(const binding of [...source.unitAliases,...source.compositionAliases,...source.weaponAliases])
    for(const proof of binding.exportEvidence||[]){
      const item=at(vocabulary,proof.path);assert.equal(item?.id,proof.entryId);assert.equal(item.name,proof.label);
      assert.equal(proof.document,source.exportSource.document);
    }
  const compositions=book.entities.filter(e=>e.kind==='COMPOSITION_MEMBER').map(e=>({id:e.id,ownerId:e.parentId,
    profileId:e.data.modelProfileId,quantity:copy(e.data.quantity),
    labels:[...new Set([e.data.name,...source.compositionAliases.find(row=>row.memberId===e.id).labels])],
    evidence:{entityId:e.id,path:'/name'}}));
  const identityAliases=source.unitAliases.map(row=>({canonicalId:row.unitId,labels:[...new Set(row.labels)],evidence:row.evidence}));
  for(const profile of book.entities.filter(e=>e.kind==='PROFILE')){
    const rows=compositions.filter(row=>row.profileId===profile.id);
    identityAliases.push({canonicalId:profile.id,labels:[...new Set(rows.flatMap(row=>row.labels))],evidence:rows[0].evidence});
  }
  book.mfmImportReferences=consumeMfm(book.entities);
  const enhancements=book.entities.filter(e=>e.kind==='ENHANCEMENT').map(e=>({id:e.id,detachmentId:e.parentId,
    scope:e.data.scope,eligibilityText:e.data.eligibilityText,eligibility:copy(enhancementEligibility[e.id]),
    sourceReference:{entityId:e.id,path:'/text'},
    mfmRecordId:book.mfmImportReferences.partitions.enhancementBindings.find(row=>row.entityId===e.id)?.mfmRecordId}));
  const equipmentSelections=copy(source.equipmentSelections);
  // Generic drone weapons retain their one original factual owner. The
  // disposable unit view references them, rather than cloning/reparenting facts.
  for(const binding of equipmentSelections)for(const id of binding.providedWeaponProfileIds||[]){
    const weapon=index.get(id);assert.equal(weapon?.kind,'WEAPON_PROFILE');
    assert.equal(weapon.parentId,binding.genericEquipmentId||binding.ownerId,'Foreign provided drone weapon owner');
    const sourceFact=binding.genericEquipmentId?index.get(binding.genericEquipmentId):null;
    const text=sourceFact?.data.text||binding.evidence.map(proof=>at(index.get(proof.entityId).data,proof.path)).join('\n');
    assert.ok(text.toLowerCase().includes(weapon.data.name.toLowerCase()),'Provided drone weapon missing in accepted source block');
    const unit=index.get(binding.ownerId);if(!unit.data.weaponIds.includes(id))unit.data.weaponIds.push(id);
  }
  book.importBindings={schema:'tau-empire-v2/import-bindings/v1',identityAliases,compositions,
    weaponSelections:[...copy(source.weaponSelections),...copy(source.weaponAliases)],equipmentSelections,enhancements,
    nativeReferenceBindings:book.entities.filter(e=>e.kind==='RULE_REFERENCE').map(e=>({id:e.id,ownerId:e.parentId,
      label:e.data.label,recipient:copy(e.data.recipient),provenance:copy(e.provenance)})),
    defaults:'OMITTED_LOADOUT_UNKNOWN',legality:'NOT_ASSESSED',exportSource:copy(source.exportSource)};
  // The local occurrence owns selection/dispatch; the generic rule remains
  // the sole factual owner. This is the established reference-lowering path.
  const marker=index.get('drone-marker-drone'),markerQuote='The bearer’s unit has the MARKERLIGHT keyword';
  assert.ok(marker.data.text.includes(markerQuote)&&marker.provenance.sourceId);
  const markerBindings=equipmentSelections.filter(row=>row.genericEquipmentId===marker.id);
  for(const binding of markerBindings){
    assert.equal(binding.canonicalEquipmentIds.length,1);
    const local=index.get(binding.canonicalEquipmentIds[0]);
    assert.equal(local.parentId,binding.ownerId);assert.equal(local.kind,'WARGEAR_OPTION');
    assert.deepEqual(binding.canonicalFieldPaths[local.id],['/text']);
    assert.ok(!local.ruleContract,'Duplicate local equipment reference contract');
    const proof={field:['text'],quote:local.data.text};
    const owner={id:'owner',subject:'UNIT',purpose:'OWNER',allegiance:'FRIENDLY',
      selector:{predicate:'ALWAYS',subject:'UNIT',arguments:{},contextLevel:'STATIC',evidence:copy(proof)},conditions:[]};
    const sourceRuleEvidence={evidence:{otherEntityId:marker.id,field:['text'],quote:markerQuote}};
    const effect={id:local.id+'::marker-drone-physical-unit',operation:'GRANT_UNIT_KEYWORD',keyword:'MARKERLIGHT',
      targetBinding:'SOURCE_UNIT',targetSubject:'UNIT',unitScope:'PHYSICAL',lifetime:'WHILE_EQUIPPED',
      sourceFields:[['text']],evidence:copy(proof),referencedRuleId:marker.id,sourceRuleEvidence,
      conditions:[{binding:'SOURCE',predicate:{predicate:'FIELD',subject:'UNIT',contextLevel:'ROSTER',
        arguments:{key:'tauMarkerSelected',equals:true},evidence:copy(proof)}}],
      provenance:{canonicalRuleId:marker.id,canonicalOwnerId:marker.parentId||book.bookId,
        canonicalClauseId:'drone-marker-drone#markerlight',sourceEvidence:copy(marker.provenance),
        physicalEquipmentReference:{entityId:local.id,field:['text'],provenance:copy(local.provenance)}}};
    const declaration={kind:'OTHER_RULE',executionMode:'DECLARATIVE_APPLICABILITY',contextLevel:'ROSTER',
      canonicalRuleReferences:[marker.id],roles:[owner],conditions:[],sourceFields:[['text']],clauses:[{
        id:'marker-drone-physical-unit',roles:[copy(owner)],conditions:[],sourceFields:[['text']],evidence:copy(proof),
        sourceText:markerQuote,rosterClassification:'ROSTER_EXECUTABLE',
        rosterClassificationNote:{reason:'Exact validated generic equipment identity on the physical UNIT; Observer permission remains conditional'},rosterEffects:[]}]};
    local.ruleContract=bindCanonicalContract({entity:local,bookId:book.bookId,schema:'rule-contract/v2',
      declaration:bindDeclarationClauses(declaration),index});
    inspectDeclarationEvidence(sourceRuleEvidence,index,local);
    local.ruleContract.clauses[0].rosterEffects=[effect];
  }
  // Reuse the same local equipment-reference contract. Runtime lowering adds
  // executable clauses only for proven MODEL scopes and per-model quantities.
  const shield=index.get('drone-shield-drone'),shieldQuote='SHIELD DRONE Add 1 to the bearer’s Wounds characteristic.';
  assert.equal(shield.data.text,shieldQuote);
  const shieldBindings=equipmentSelections.filter(row=>row.genericEquipmentId===shield.id);
  for(const binding of shieldBindings){
    assert.equal(binding.canonicalEquipmentIds.length,1);
    const local=index.get(binding.canonicalEquipmentIds[0]),contract=local.ruleContract;
    assert.equal(local.parentId,binding.ownerId);assert.equal(local.kind,'WARGEAR_OPTION');
    assert.ok(contract&&!contract.canonicalRuleReferences.includes(shield.id),'Missing/duplicate equipment reference owner');
    const sourceRuleEvidence={evidence:{otherEntityId:shield.id,field:['text'],quote:shieldQuote}};
    inspectDeclarationEvidence(sourceRuleEvidence,index,local);
    contract.canonicalRuleReferences.push(shield.id);
    contract.clauses.push({id:'shield-drone-physical-model',roles:copy(contract.clauses[0].roles),conditions:[],
      sourceFields:[['text']],evidence:{field:['text'],quote:local.data.text},sourceText:shieldQuote,
      rosterClassification:'DISPLAY_ONLY',rosterClassificationNote:{reason:'Requires a proven physical MODEL scope and per-model equipment quantity'},rosterEffects:[]});
  }
  // The platform's selected item is an option, whereas its characteristic
  // declaration is an ordinary ability (not a wargear-ability inventory row).
  // Bind the existing operation to that exact option; keep the rule's owner,
  // operation/value and source evidence unchanged.
  const platformOption=index.get('datasheet-tidewall-shieldline:wargear:1');
  assert.equal(platformOption.data.text,'This model can be equipped with 1 Tidewall defence platform.');
  const platformRule=index.get('datasheet-tidewall-shieldline:section:1');
  const platform=platformRule.ruleContract.clauses.find(clause=>clause.id==='tidewall-defence-platform');
  assert.equal(platform.sourceText,'Tidewall Defence Platform: If equipped with a Tidewall defence platform, this FORTIFICATION has a Wounds characteristic of 15.');
  for(const effect of platform.rosterEffects){
    assert.equal(effect.equipmentRequirement.equipmentId,platformRule.id);
    effect.equipmentRequirement={binding:'SOURCE',kind:'EQUIPMENT_PRESENT',equipmentId:platformOption.id,sourceFieldPath:['text']};
  }
  addTauSourceChoices(book);
  addTauPrototypeChoices(book);
  // Lower only the independently validated physical recipient choice. The
  // existing executor performs the grant; the source decision stores no result.
  const rule=index.get(tauStudentRuleId),clause=rule.ruleContract.clauses.find(c=>c.sourceText===rule.data.text);
  assert.ok(clause&&clause.rosterEffects.length===0);
  const core=createEffectiveCoreCatalog().getById('core-deep-strike');assert.equal(core.state,'FULL_CONTENT');
  book.rosterAbilityReferences[core.id]={id:core.id,title:core.title,parameters:{},provenance:copy(core.provenance)};
  clause.rosterClassification='DISPLAY_ONLY';clause.conditions=[];
  clause.rosterClassificationNote={reason:'Validated physical source/recipient pairs are lowered at the T’au runtime boundary; no battle simulation',
    sourceChoice:tauStudentRuleId};
  clause.rosterEffects=[];
  book.importReadiness={stage:4,status:'PARTIAL',frontendVerified:false,realNewRecruitExportTested:false,
    remainingBlockers:['EXACT_DUPLICATE_WEAPON_OCCURRENCE'],
    unprovenExportFormats:['DIRECT_GENERIC_WEAPON_ONLY_IMPORT'],markerOccurrenceCount:markerBindings.length,
    prototypePhysicalWeapon:'EXISTING_SCOPE_AND_SELECTION_QUANTITY_ONE_ONLY',
    shieldOccurrenceCount:shieldBindings.length,shieldPhysicalModel:'CONFIRMED_SCOPE_AND_PER_MODEL_QUANTITY_ONLY',
    student:'PHYSICAL_SOURCE_RECIPIENT_PAIR_LOWERING',krootBodyguard:'BOOK_BOUNDARY_STARTING_STRENGTH_GATE'};
  const schema=createTauRuleSchema();
  schema.validateContractDeclarations(book);validateRosterEffectDeclarations(book,schema.validatePredicate,schema.evaluatePredicate);
  finalizeRecipientBook(book);schema.validateContracts(book);
  validateRosterEffects(book,schema.validatePredicate,schema.evaluatePredicate);
  return book;
}
if(process.argv[1]&&fileURLToPath(import.meta.url)===fs.realpathSync(process.argv[1])){
  const target=new URL('./generated/roster-import.json',import.meta.url),bytes=serializeSourceJSON(buildTauImportBook());
  if(process.argv.includes('--check'))assert.equal(fs.readFileSync(target,'utf8'),bytes,'Stale T’au import view');
  else fs.writeFileSync(target,bytes);
  console.log('T’au import view: PASS (43 datasheets; physical/runtime blockers explicitly retained)');
}

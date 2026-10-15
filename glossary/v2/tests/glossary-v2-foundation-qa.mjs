import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {BOOK_IDS,FACTUAL_INPUTS,buildGlossaryV2Index,createGlossaryV2Index,loadGlossaryV2Inputs} from '../content/glossary-v2-index.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../..');
const generated=JSON.parse(fs.readFileSync(path.join(root,'glossary/v2/generated/index.en.json'),'utf8'));
const terrainReferences=JSON.parse(fs.readFileSync(path.join(root,'missions/sources/game-data-missions-terrain-reference-2026-09-22.json'),'utf8'));
const missionEvidence=JSON.parse(fs.readFileSync(path.join(root,'missions/sources/chapter-approved-2026-27-evidence.json'),'utf8'));
const missionCanonical=JSON.parse(fs.readFileSync(path.join(root,'missions/content/chapter-approved-2026-27.canonical.json'),'utf8'));
const inputs=await loadGlossaryV2Inputs();
const index=createGlossaryV2Index(inputs);
assert.deepEqual(generated,index,'generated Glossary V2 index must equal the effective-domain projection');
assert.equal(index.schema,'wh40k-glossary-v2-index/v1');
assert.equal(index.factualAuthority,false);
assert.equal(index.counts.total,index.entries.length);
assert.equal(new Set(index.entries.map(entry=>entry.id)).size,index.entries.length,'V2 entry IDs must be unique');

const admech=inputs.armyModels.find(model=>model.book.id==='adeptus-mechanicus');
for(const entity of admech.entities.filter(entity=>entity.kind==='OFFICIAL_UPDATE')){
  const entry=index.entries.find(entry=>entry.sourceOwner.bookId==='adeptus-mechanicus'&&entry.sourceOwner.canonicalId===entity.id);
  assert(entry,'Every canonical AdMech official update must remain indexed');
  assert.deepEqual(entry.facts.canonicalData,entity.data,'Official update must come from the current V2 owner');
  assert.deepEqual(entry.provenance,entity.provenance);
}

assert.equal(index.counts.byDomain.CORE,369,'Core must contribute every full certified factual record except alias-only errata');
assert.equal(index.coverage.coreNotIndexed.identityOnly.length,0);
assert.equal(index.coverage.coreNotIndexed.aliasOnlyErrata.length,2);
assert.equal(index.counts.byDomain.MISSIONS,156,'Missions must contribute the Standard/Event union plus eight factual FAQ clarifications');
const missionSequenceEntries=index.entries.filter(entry=>entry.recordType==='MISSION_SEQUENCE_RULE');
assert.equal(missionSequenceEntries.length,21,'all 21 accepted Mission Sequence Rule identities must be projected');
assert.equal(new Set(missionSequenceEntries.map(entry=>entry.id)).size,21,'Mission Sequence Rule identities must remain unique');
for(const entry of missionSequenceEntries)assert(entry.facts.requirements?.length,`${entry.id}: accepted structured requirements must remain the factual source`);
const createBattlefieldFacts=missionSequenceEntries.find(entry=>entry.id==='missions::mission-sequence-create-battlefield').facts.requirements;
assert.deepEqual(createBattlefieldFacts.map(requirement=>requirement.type),[
  'BATTLEFIELD_SIZE',
  'CENTRAL_OBJECTIVE_ROLL',
  'ALTERNATING_TERRAIN_PLACEMENT_AFTER_ROLL_OFF',
  'TERRAIN_OBJECTIVE_AT_EACH_OBJECTIVE_POINT'
],'Create the Battlefield must retain all four accepted structured operations');
assert.deepEqual(createBattlefieldFacts[0],{type:'BATTLEFIELD_SIZE',widthInches:60,heightInches:44});
assert.deepEqual(createBattlefieldFacts[1],{type:'CENTRAL_OBJECTIVE_ROLL',singleOnResults:[1,2,3,4,5],doubleOnResults:[6],doubleOffsetInches:6});
const primaryMissions=index.entries.filter(entry=>entry.recordType==='PRIMARY_MISSION');
const secondaryMissions=index.entries.filter(entry=>entry.recordType==='SECONDARY_MISSION');
assert.equal(primaryMissions.length,25,'all 25 accepted Primary Missions must be projected');
assert.equal(secondaryMissions.length,18,'all 18 accepted Secondary Missions must be projected');
assert.equal(primaryMissions.reduce((count,entry)=>count+entry.facts.ruleBody.scoringClauses.length,0),100,'all Primary scoring clauses must remain projected');
assert.equal(secondaryMissions.reduce((count,entry)=>count+entry.facts.ruleBody.scoringClauses.length,0),27,'all Secondary scoring clauses must remain projected');
assert.equal(secondaryMissions.reduce((count,entry)=>count+entry.facts.ruleBody.scoringClauses.reduce((sum,clause)=>sum+clause.victoryPointAwards.length,0),0),31,'all Secondary VP award branches must remain projected');
assert.equal(primaryMissions.filter(entry=>entry.facts.ruleBody.objectiveAction).length,11,'all Primary Objective Actions must remain projected');
assert.equal(secondaryMissions.filter(entry=>entry.facts.ruleBody.objectiveAction).length,2,'all Secondary Objective Actions must remain projected');
assert.equal(secondaryMissions.filter(entry=>entry.facts.ruleBody.whenDrawn.length).length,10,'all Secondary When Drawn records must remain projected');
assert.equal(secondaryMissions.filter(entry=>entry.facts.ruleBody.caps).length,4,'all Secondary per-card caps must remain projected');
assert.equal(primaryMissions.filter(entry=>entry.facts.effectiveClarifications?.length).length,3,'all effective Primary FAQ clarifications must remain projected');
assert.equal(secondaryMissions.filter(entry=>entry.facts.effectiveClarifications?.length).length,2,'all effective Secondary FAQ clarifications must remain projected');
assert.equal(missionEvidence.directedPrimaryMatrix.length,25,'accepted Mission evidence must contain all 25 directed Primary relations');
assert.equal(new Set(missionEvidence.directedPrimaryMatrix.map(relation=>relation.primaryMissionId)).size,25,'each accepted Primary Mission must own one directed relation');
let acceptedCoreReferenceCount=0;
for(const accepted of missionCanonical.primaryMissions){
  const evidenceRelation=missionEvidence.directedPrimaryMatrix.find(relation=>relation.primaryMissionId===accepted.id);
  assert(evidenceRelation,`${accepted.id}: accepted directed relation evidence`);
  assert.equal(accepted.playerForceDispositionId,evidenceRelation.playerForceDispositionId,`${accepted.id}: canonical player Force Disposition`);
  assert.equal(accepted.opponentForceDispositionId,evidenceRelation.opponentForceDispositionId,`${accepted.id}: canonical opponent Force Disposition`);
  const projected=primaryMissions.find(entry=>entry.id===`missions::${accepted.id}`);
  assert(projected,`${accepted.id}: V2 Primary Mission projection`);
  assert.equal(projected.facts.playerForceDispositionId,evidenceRelation.playerForceDispositionId,`${accepted.id}: projected player Force Disposition`);
  assert.equal(projected.facts.opponentForceDispositionId,evidenceRelation.opponentForceDispositionId,`${accepted.id}: projected opponent Force Disposition`);
  const expectedReferences=[
    ['MISSIONS',evidenceRelation.playerForceDispositionId,'PLAYER_FORCE_DISPOSITION'],
    ['MISSIONS',evidenceRelation.opponentForceDispositionId,'OPPONENT_FORCE_DISPOSITION'],
    ...accepted.ruleBody.coreRuleRefs.map(id=>['CORE',id,'CORE_RULE'])
  ].map(([domain,canonicalId,relationType])=>`${domain}|${canonicalId}|${relationType}`).sort();
  const projectedReferences=projected.canonicalReferences.map(reference=>`${reference.domain}|${reference.canonicalId}|${reference.relationType}`).sort();
  assert.deepEqual(projectedReferences,expectedReferences,`${accepted.id}: exact accepted relation/reference projection`);
  acceptedCoreReferenceCount+=accepted.ruleBody.coreRuleRefs.length;
}
assert.equal(acceptedCoreReferenceCount,60,'accepted Primary Mission canonical facts must contain all 60 Core references');
const twists=index.entries.filter(entry=>entry.recordType==='TWIST');
assert.equal(twists.length,6,'all six accepted Twist identities must be projected');
assert.equal(new Set(twists.map(entry=>entry.id)).size,6,'Twist identities must remain unique');
assert.equal(twists.reduce((count,entry)=>count+entry.facts.ruleBody.operations.length,0),7,'all seven accepted Twist operations must remain projected');
for(const entry of twists){
  assert(entry.facts.ruleBody.rules.length,`${entry.id}: accepted readable Twist rule`);
  assert(entry.facts.ruleBody.designersNotes.length,`${entry.id}: accepted Designer's Note`);
}
const mirroredWorld=twists.find(entry=>entry.id==='missions::twist-mirrored-world');
assert.equal(mirroredWorld.facts.ruleBody.options.length,6,'Mirrored World must retain all accepted options including reroll');
assert(mirroredWorld.facts.ruleBody.options.every(option=>option.roll===''),'Mirrored World roll-to-option mapping must remain explicitly unproven');
assert.deepEqual(mirroredWorld.facts.ruleBody.operations[0].randomSelection,{die:'D6',rerollResults:[6]},'Mirrored World must retain only its proven D6 metadata');
const forceDispositions=index.entries.filter(entry=>entry.recordType==='FORCE_DISPOSITION');
const forceDispositionMatchups=index.entries.filter(entry=>entry.recordType==='FORCE_DISPOSITION_MATCHUP');
assert.equal(forceDispositions.length,5,'all five Force Disposition identities must be projected');
assert.equal(new Set(forceDispositions.map(entry=>entry.id)).size,5,'Force Disposition identities must remain unique');
assert.equal(forceDispositions.reduce((count,entry)=>count+entry.facts.missionMatrixRelations.length,0),25,'all 25 directed Primary matrix relations must remain projected');
assert.equal(forceDispositions.reduce((count,entry)=>count+entry.facts.references.length,0),50,'all 50 Force Disposition Mission references must remain projected');
const expectedDispositionAssignments=inputs.mfmCatalog.detachments.filter(record=>BOOK_IDS.includes(record.armyBookId)).flatMap(record=>{
  const model=inputs.armyModels.find(model=>model.book.id===record.armyBookId),canonicalId=model.mfmIdentityBindings[record.id];
  assert(canonicalId,'Detachment assignment requires explicit V2 identity binding');
  return record.missionForceDispositionIds.map(id=>id+'|'+record.armyBookId+'|'+canonicalId);
}).sort();
const actualDispositionAssignments=forceDispositions.flatMap(disposition=>disposition.mfm.assignedDetachmentIds.map(id=>{
  const detachment=index.entries.find(entry=>entry.id===id);assert(detachment,'Assigned Detachment must be available');
  return disposition.sourceOwner.canonicalId+'|'+detachment.sourceOwner.bookId+'|'+detachment.sourceOwner.canonicalId;
})).sort();
assert.deepEqual(actualDispositionAssignments,expectedDispositionAssignments,'Exact connected Detachment/Force Disposition assignments, including multi-disposition owners');
assert.equal(new Set(actualDispositionAssignments).size,actualDispositionAssignments.length,'No duplicate assignment within one Force Disposition');
assert.equal(new Set(forceDispositions.flatMap(entry=>entry.mfm.assignedDetachmentIds)).size,46,'Every connected Detachment assigned');
assert(forceDispositions.every(entry=>entry.facts.physicalMultiplicity===2),'each Force Disposition must retain its physical card multiplicity');
assert.equal(forceDispositionMatchups.length,15,'all 15 unordered matchup identities must be projected');
assert.equal(new Set(forceDispositionMatchups.map(entry=>entry.id)).size,15,'matchup identities must remain unique');
assert(forceDispositionMatchups.every(entry=>entry.facts.unordered&&entry.facts.reverseOrderEquivalent),'every matchup must retain unordered reverse-order equivalence');
assert.equal(forceDispositionMatchups.reduce((count,entry)=>count+entry.facts.directedPrimaryRelations.length,0),25,'matchups must retain all 25 directed Primary relations');
assert.equal(forceDispositionMatchups.reduce((count,entry)=>count+entry.facts.layoutIds.length,0),45,'matchups must retain all 45 A/B/C layout links');
const matchupKeys=forceDispositionMatchups.map(entry=>[...entry.facts.memberForceDispositionIds].sort().join('|'));
assert.equal(new Set(matchupKeys).size,15,'reverse order must not create duplicate matchup identities');
const deployments=index.entries.filter(entry=>entry.recordType==='DEPLOYMENT');
assert.equal(deployments.length,6,'all six Deployment identities must be projected');
assert.equal(new Set(deployments.map(entry=>entry.id)).size,6,'Deployment identities must remain unique');
assert.equal(new Set(deployments.map(entry=>entry.facts.geometry.sourceRegistration.url)).size,6,'each Deployment must retain its own authenticated source visual');
for(const entry of deployments){
  const geometry=entry.facts.geometry,source=geometry.sourceRegistration;
  assert.deepEqual(geometry.coordinateSystem.battlefield,{width:60,height:44},`${entry.id}: battlefield dimensions`);
  assert.equal(geometry.digitizationStatus,'SOURCE_REGISTERED_PENDING_VERIFIED_DIGITIZATION',`${entry.id}: pending digitization state`);
  assert.deepEqual([geometry.zones,geometry.objectives,geometry.terrainAreas],[[],[],[]],`${entry.id}: unverified geometry must remain absent`);
  assert.equal(geometry.requiredVerifiedLayers.length,5,`${entry.id}: all pending geometry layers retained`);
  assert.equal(source.type,'AUTHENTICATED_RASTER_REFERENCE',`${entry.id}: authenticated raster registration`);
  assert(source.url.endsWith(entry.facts.sourceImagePath),`${entry.id}: registered visual must match accepted source path`);
  assert(Number.isInteger(source.pixelDimensions.width)&&Number.isInteger(source.pixelDimensions.height)&&Number.isInteger(source.byteSize)&&source.sha256,`${entry.id}: authenticated visual metadata`);
}
const terrainLayouts=index.entries.filter(entry=>entry.recordType==='TERRAIN_LAYOUT'),acceptedTerrainLayouts=terrainReferences.matchups.flatMap(matchup=>matchup.layouts);
assert.equal(terrainLayouts.length,45,'all 45 Terrain Layout identities must be projected');
assert.equal(new Set(terrainLayouts.map(entry=>entry.id)).size,45,'Terrain Layout identities must remain unique');
assert.deepEqual(Object.fromEntries(['A','B','C'].map(variant=>[variant,terrainLayouts.filter(entry=>entry.facts.variant===variant).length])),{A:15,B:15,C:15},'each matchup must retain A/B/C variants');
assert.equal(new Set(terrainLayouts.map(entry=>entry.facts.visualReferences.measurements.url)).size,45,'each Terrain Layout must retain its own measurements visual');
assert.equal(terrainLayouts.reduce((count,entry)=>count+entry.facts.geometry.measurements.length,0),90,'all 90 battlefield dimension measurements must remain projected');
for(const entry of terrainLayouts){
  const facts=entry.facts,geometry=facts.geometry,registration=geometry.sourceRegistration,accepted=acceptedTerrainLayouts.find(layout=>layout.officialPdfPage===registration.page);
  assert(accepted,`${entry.id}: independently enrolled visual reference`);
  assert.equal(facts.variant,accepted.officialLayoutIdentity,`${entry.id}: accepted A/B/C identity`);
  assert.deepEqual(geometry.coordinateSystem.battlefield,{width:44,height:60},`${entry.id}: battlefield dimensions`);
  assert.equal(geometry.digitizationStatus,'SOURCE_REGISTERED_PENDING_VERIFIED_DIGITIZATION',`${entry.id}: pending digitization state`);
  assert.deepEqual([geometry.zones,geometry.objectives,geometry.terrainAreas],[[],[],[]],`${entry.id}: unverified geometry must remain absent`);
  assert.equal(geometry.requiredVerifiedLayers.length,4,`${entry.id}: all pending layout layers retained`);
  assert.equal(registration.type,'OFFICIAL_PDF_VECTOR_PAGE',`${entry.id}: official PDF registration`);
  assert.equal(registration.pdfPath,terrainReferences.officialAuthority.localPath,`${entry.id}: current official Event Companion source`);
  assert(Object.values(registration.battlefieldBoundsPdfPoints).every(Number.isFinite),`${entry.id}: registered PDF bounds`);
  assert.equal(facts.visualReferences.factualAuthority,false,`${entry.id}: visual reference is not factual authority`);
  assert.equal(facts.visualReferences.authorityClass,'SECONDARY_VISUAL_REFERENCE',`${entry.id}: visual authority class`);
  assert.equal(facts.visualReferences.plain.url,accepted.assets.plain.url,`${entry.id}: accepted plain visual`);
  assert.equal(facts.visualReferences.plain.sha256,accepted.assets.plain.sha256,`${entry.id}: accepted plain fingerprint`);
  assert.equal(facts.visualReferences.measurements.url,accepted.assets.measurements.url,`${entry.id}: accepted measurements visual`);
  assert.equal(facts.visualReferences.measurements.sha256,accepted.assets.measurements.sha256,`${entry.id}: accepted measurements fingerprint`);
  const matchup=index.entries.find(candidate=>candidate.id===`missions::${facts.matchupId}`);
  assert(matchup?.facts.layoutIds.includes(facts.id),`${entry.id}: exact canonical matchup binding`);
}
assert.deepEqual(index.coverage.armyEffectiveBooks,BOOK_IDS,'exactly the connected V2 Army Books must contribute');
for(const bookId of BOOK_IDS)assert(index.entries.some(entry=>entry.domain==='ARMY'&&entry.contexts.some(context=>context.effectiveBookId===bookId)),`${bookId} must contribute an effective Army context`);

const coreDeepStrike=index.entries.filter(entry=>entry.id==='core::core-deep-strike');
assert.equal(coreDeepStrike.length,1,'one Core fact referenced by many datasheets must remain one article');
assert(coreDeepStrike[0].contexts.length>1,'Core ability article must retain Army occurrence contexts');
const standardEventPrimary=index.entries.find(entry=>entry.id==='missions::primary-battlefield-dominance');
assert.deepEqual(new Set(standardEventPrimary.contexts.map(context=>context.scope)),new Set(['STANDARD_MATCHED_PLAY','EVENT_PLAY']),'shared Mission fact must be one article with both scopes');

const connected=new Set(BOOK_IDS);
const dependencies=inputs.mfmCatalog.unitReferences.filter(record=>connected.has(record.crossFactionDependency?.consumerArmyBookId));
const pointRecords=inputs.mfmCatalog.unitPointRecords.filter(record=>connected.has(record.factionId)||dependencies.some(reference=>reference.id===record.unitReferenceId));
assert.equal(index.coverage.mfm.standaloneArticles,2,'Only the two source-owned allied points dependencies have separate central articles');
assert.equal(index.counts.byDomain.MFM,2);
const allProjectedPoints=index.entries.flatMap(entry=>[...(entry.mfm?.pointRecords||[]),...(entry.domain==='MFM'?[entry.facts]:[])]);
assert.deepEqual(allProjectedPoints.map(record=>record.id).sort(),pointRecords.map(record=>record.id).sort(),'Every connected or explicitly dependent central points owner appears exactly once');
assert.equal(index.coverage.mfm.augmentation.pointRecords,pointRecords.length-dependencies.length);
assert.equal(index.coverage.mfm.augmentation.paidUpgrades,inputs.mfmCatalog.paidUpgradeRecords.filter(record=>pointRecords.some(point=>point.id===record.unitPointRecordId)).length);
for(const [partition,countKey]of [['detachments','detachments'],['enhancementCosts','enhancementCosts'],['qualifierRecords','qualifiers']])assert.equal(index.coverage.mfm.augmentation[countKey],inputs.mfmCatalog[partition].filter(record=>connected.has(record.armyBookId)).length);
assert.equal(index.coverage.mfm.augmentation.referenceOnlyPointRecords.length,2);
assert(index.entries.some(entry=>entry.recordType==='UNIT'&&entry.mfm?.pointRecords?.length),'bound MFM points must augment Army units');
assert(index.entries.some(entry=>entry.recordType==='DETACHMENT'&&entry.mfm?.detachment),'bound MFM DP/Force Disposition facts must augment Army Detachments');
assert(index.entries.some(entry=>entry.recordType==='ENHANCEMENT'&&entry.mfm?.enhancementCost),'bound MFM cost must augment Army Enhancements');

const detachmentEntries=index.entries.filter(entry=>entry.recordType==='DETACHMENT');
assert.equal(detachmentEntries.length,46,'All connected V2 Detachments');
assert.equal(new Set(detachmentEntries.map(entry=>entry.id)).size,46);
for(const entry of detachmentEntries){
  const model=inputs.armyModels.find(model=>model.book.id===entry.sourceOwner.bookId);
  const source=model.entities.find(entity=>entity.id===entry.sourceOwner.canonicalId);
  assert.deepEqual(entry.facts.canonicalData,source.data);
  assert(entry.facts.detachmentRules?.length,'Detachment rule must remain reachable '+entry.id);
}
const mortarionsHammer=detachmentEntries.find(entry=>entry.sourceOwner.canonicalId==='detachment-mortarions-hammer');
assert(mortarionsHammer,'Mortarion’s Hammer standalone article');
const miasmic=mortarionsHammer.facts.detachmentRules.find(rule=>rule.id==='detachment-mortarions-hammer:rule');
assert(miasmic,'Stable Miasmic Bombardment owner');
assert.match(miasmic.text,/select a number of enemy units/i);
assert.deepEqual(miasmic.tables[0].rows,[['BATTLE SIZE','UNITS'],['Incursion','1'],['Strike Force','2'],['Onslaught','3']]);

assert(!FACTUAL_INPUTS.some(input=>/registry\.en\.json|aliases\.en\.json|scripts\/data\.js|\.html/i.test(input)),'generated and legacy glossary artifacts cannot be factual inputs');
assert(!index.entries.some(entry=>entry.sourceOwner.domain==='GLOSSARY'),'legacy Glossary cannot own V2 gameplay facts');
assert.equal(index.coverage.legacy.editorialMigrated,11,'only editorial contracts with one exact canonical target may migrate');
assert.equal(index.coverage.legacy.editorialUnresolved.length,13,'unbound legacy editorial identities must remain explicit');
assert.equal(index.coverage.legacy.resolutionAliasesMigrated,10);
assert.equal(index.coverage.legacy.supplementalAliasesMigrated,56,'all accepted supplemental aliases and match labels must resolve');
assert.equal(index.coverage.legacy.supplementalTargetBindings,8,'legacy presentation IDs must bind explicitly to existing V2 owners');
assert.equal(index.coverage.legacy.preferredMatchesMigrated,5);
assert.equal(index.coverage.legacy.preferredMatchesUnresolved.length,0);
assert.equal(index.coverage.legacy.legacyGameplayRejected.length,65,'legacy supplemental gameplay bodies are rejected as factual input');
assert.equal(index.coverage.legacy.quickReferenceGameplayRejected,14,'legacy quick-reference gameplay bodies are rejected as factual input');

const migratedLegacyLabels=new Map([
  ['damage-roll','core::core-rule-02-02-03-random-characteristics'],
  ['Damage roll','core::core-rule-02-02-03-random-characteristics'],
  ['Damage rolls','core::core-rule-02-02-03-random-characteristics'],
  ['battle-shocked','core::core-rule-01-07-battle-shock-rolls'],
  ['Battle-shocked','core::core-rule-01-07-battle-shock-rolls'],
  ['plagues','army::death-guard::army_rule::army-rule-nurgles-gift'],
  ['Plague','army::death-guard::army_rule::army-rule-nurgles-gift'],
  ['Plagues','army::death-guard::army_rule::army-rule-nurgles-gift'],
  ['range-characteristics','core::core-rule-02-04-weapons'],
  ['Range characteristic','core::core-rule-02-04-weapons'],
  ['Range characteristics','core::core-rule-02-04-weapons'],
  ['attacks','core::core-rule-02-04-weapons'],
  ['Attacks characteristic','core::core-rule-02-04-weapons'],
  ['Attacks characteristics','core::core-rule-02-04-weapons'],
  ['damage-characteristic','core::core-rule-02-04-weapons'],
  ['Damage characteristic','core::core-rule-02-04-weapons'],
  ['Damage characteristics','core::core-rule-02-04-weapons']
]);
for(const [label,targetId] of migratedLegacyLabels){
  const matches=index.entries.filter(entry=>entry.aliases.includes(label));
  assert.equal(matches.length,1,`${label}: supplemental label must resolve without dangling or ambiguous bindings`);
  assert.equal(matches[0].id,targetId,`${label}: supplemental label must resolve to its explicit factual owner`);
}
const deathGuardKeyword=index.entries.filter(entry=>entry.aliases.includes('keyword-death-guard'));
assert.deepEqual(deathGuardKeyword.map(entry=>entry.id),['core::core-rule-02-05-keywords'],'Death Guard keyword compatibility identity must resolve to the canonical Core Keywords rule');
assert(!index.entries.some(entry=>entry.id==='keyword-death-guard'),'Death Guard keyword compatibility identity must not create a duplicate article');
const transportPreferred=index.entries.filter(entry=>entry.presentation.preferredMatchLabels?.includes('transport'));
assert.deepEqual(transportPreferred.map(entry=>entry.id),['core::core-rule-18-01-transport-capacity'],'transport preferred match must resolve through the accepted keyword-transport migration binding');

const excluded=['tyranids','tau-empire','space-marines','dark-angels','blood-angels'];
assert(!index.entries.some(entry=>entry.domain==='ARMY'&&excluded.includes(entry.sourceOwner.bookId)),'No excluded standalone Army facts');
assert(!index.entries.some(entry=>entry.sourceOwner.canonicalId==='army-rule-oath-of-moment'),'Unconnected Space Marines rule must not be promoted');
const coreSupport=index.entries.find(entry=>entry.id==='core::core-support');
assert(coreSupport.aliases.includes('chaos-space-marines-ability-support'),'Connected Support occurrence binds canonical Core owner');
assert(coreSupport.contexts.some(context=>context.effectiveBookId==='chaos-space-marines'&&context.parentUnitId==='unit-masters-of-the-maelstrom'));
const masters=index.entries.find(entry=>entry.sourceOwner.bookId==='chaos-space-marines'&&entry.sourceOwner.canonicalId==='unit-masters-of-the-maelstrom');
assert(masters.mfm.supportRelations.some(record=>record.id==='mfm-support-eligibility-d50c824cb1d8dabe'),'CSM support relation stays on its physical unit');
const ownerEntries=index.entries.filter(entry=>entry.domain==='ARMY');
for(const model of inputs.armyModels)for(const entity of model.entities.filter(entity=>!['POINTS_SCHEDULE_ROW','PAID_WARGEAR_COST','DETACHMENT_ROSTER_METADATA','ENHANCEMENT_COST_QUALIFIERS','ALLIED_POINTS_DEPENDENCY','ATTACHMENT_RELATION'].includes(entity.kind))){
  const matches=ownerEntries.filter(entry=>entry.sourceOwner.bookId===model.book.id&&entry.sourceOwner.canonicalId===entity.id);
  assert.equal(matches.length,1,'Exactly one entry per canonical owner '+entity.id);
  assert.deepEqual(matches[0].facts.canonicalData,entity.data);
  assert.deepEqual(matches[0].provenance,entity.provenance);
}
assert.equal(index.counts.standalone+index.counts.scopedChildren,index.entries.length);

const weapons=index.entries.filter(entry=>entry.recordType==='WEAPON_PROFILE');
const duplicateByLabel=new Map();for(const entry of weapons){const key=entry.label.toLocaleLowerCase('en');if(!duplicateByLabel.has(key))duplicateByLabel.set(key,[]);duplicateByLabel.get(key).push(entry);}
const scopedDuplicate=[...duplicateByLabel.values()].find(group=>new Set(group.map(entry=>entry.parent.canonicalId)).size>1);
assert(scopedDuplicate,'same-name weapon profiles must coexist as parent-scoped entries');
assert.equal(new Set(scopedDuplicate.map(entry=>entry.id)).size,scopedDuplicate.length);

// A changed source value without its Army Book projection is a factual mismatch.
const staleInputs={...inputs,armyModels:structuredClone(inputs.armyModels)};
const staleModel=staleInputs.armyModels.find(model=>model.book.id==='chaos-space-marines');
staleModel.entities.find(entity=>entity.id==='datasheet-legionaries:profile:1').data.stats.T='4';
assert.throws(()=>createGlossaryV2Index(staleInputs),/factual mismatch|stale Army/i);

const danglingTargetInputs={...inputs,supplemental:structuredClone(inputs.supplemental)};
danglingTargetInputs.supplemental.v2Targets['keyword-transport']='core::missing-transport-owner';
assert.throws(()=>createGlossaryV2Index(danglingTargetInputs),/resolves to absent V2 entry/,'dangling legacy presentation bindings must fail closed');

for(const entry of index.entries){
  assert(entry.sourceOwner?.canonicalId,`${entry.id}: source owner is required`);
  if(entry.parent)assert(entry.id.includes(entry.parent.canonicalId),`${entry.id}: scoped child ID must retain parent identity`);
}
const second=await buildGlossaryV2Index();
assert.equal(JSON.stringify(second),JSON.stringify(index),'Glossary V2 build must be deterministic');

console.log(`Glossary V2 foundation QA PASS (${index.counts.total} entries; ${index.counts.standalone} standalone; ${index.counts.scopedChildren} scoped children)`);

/** Current source acceptance, historical compatibility and unchanged semantics. */
import assert from 'node:assert/strict';
import os from 'node:os';import {execFileSync} from 'node:child_process';
import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';import {fileURLToPath} from 'node:url';
import {createCanonicalMfmFacts} from '../content/canonical-mfm-facts.mjs';
import {createEffectiveMfmCatalog} from '../content/effective-mfm-catalog.mjs';
import {validateCanonicalMfmFacts,validateMfmIdentityRegistry,validateMfmCrossDomainBindings,validateMfmSourceDates} from '../content/mfm-model-contract.mjs';
import {createEffectiveMfmArmyProjection} from '../../books/shared/tools/effective-mfm-army-projection.mjs';
import {aggregateArtifactHash} from '../../books/shared/tools/source-ingestion-contract.mjs';
import {verifyFrozenSource} from '../../books/shared/tools/source-ingestion-contract.mjs';
import {validateRegistry} from '../../books/death-guard/v2/overlay-engine.mjs';
const root=fileURLToPath(new URL('../../',import.meta.url));
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const sha=x=>crypto.createHash('sha256').update(x).digest('hex').toUpperCase();
const stable=v=>Array.isArray(v)?v.map(stable):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,stable(v[k])])):v;
const withoutProvenance=value=>Array.isArray(value)?value.map(withoutProvenance):value&&typeof value==='object'?Object.fromEntries(Object.entries(value).filter(([key])=>key!=='provenance').map(([key,v])=>[key,withoutProvenance(v)])):value;
const oldRegistry=read('mfm/content/mfm-v1.5-scoped.identity-registry.json');
const currentRegistry=read('mfm/content/mfm-v1.6-scoped.identity-registry.json');
validateMfmIdentityRegistry(read('mfm/content/mfm-v1.4.identity-registry.json'));
const old=createCanonicalMfmFacts({identityRegistry:oldRegistry}),current=createCanonicalMfmFacts();
validateCanonicalMfmFacts(old);validateCanonicalMfmFacts(current);
assert.equal(current.sourceVersion,'v1.6-scoped-six');assert.equal(current.currentnessCutoff,'2026-10-20');
assert.equal(createEffectiveMfmCatalog({canonicalFacts:old}).catalog.currentnessCutoff,'2026-09-30');
const partitions=['pricingGroups','unitReferences','unitPointRecords','paidUpgradeRecords','leaderEligibilityRecords','supportEligibilityRecords','detachments','enhancementCosts','qualifierRecords'];
const equalGameplay=facts=>{for(const key of partitions)assert.deepEqual(withoutProvenance(facts[key].filter(r=>r.factionId!=='space-marines')),withoutProvenance(old[key].filter(r=>r.factionId!=='space-marines')),key+' changed unrelated faction semantics');};
equalGameplay(current);
const six=['death-guard','adeptus-mechanicus','chaos-space-marines','emperors-children','tyranids','tau-empire'];
const findings=[];
for(const book of six){
  const binding=currentRegistry.factionBindings.find(f=>f.factionId===book),previous=oldRegistry.factionBindings.find(f=>f.factionId===book);
  const capture=read(binding.sourceCapturePath),historical=read(previous.sourceCapturePath);
  verifyFrozenSource(binding.sourceId);verifyFrozenSource(previous.sourceId);
  assert.deepEqual(capture.units,historical.units,book+' units/schedules/paid options/relations');
  assert.deepEqual(capture.detachments,historical.detachments,book+' Enhancements/eligibility/qualifiers/Force Dispositions');
  const {captureSha256,...payload}=capture;assert.equal(sha(JSON.stringify(stable(payload))),captureSha256);
  for(const artifact of capture.rawArtifacts){const bytes=fs.readFileSync(path.join(root,path.dirname(binding.sourceCapturePath),artifact.path));assert.equal(sha(bytes),artifact.sha256);assert.equal(bytes.length,artifact.bytes);}
  assert.equal(capture.version,'v1.6');assert.equal(capture.effectiveDate,null);assert.equal(capture.sourceUpdatedAt,null);assert.equal(capture.verifiedAt,'2026-10-14');
  const projection=createEffectiveMfmArmyProjection(book),points=projection.pointsForArmyBook(book);
  assert.equal(projection.sourceMetadata.version,'v1.6');assert.equal(projection.sourceMetadata.effectiveDate,null);
  assert.equal(projection.sourceMetadata.verifiedAt,'2026-10-14');
  for(const sourceUnit of capture.units){const record=current.unitPointRecords.find(p=>p.factionId===book&&p.label===sourceUnit.title);assert.ok(record);assert.deepEqual(record.pointSchedules,sourceUnit.pointSchedules);}
  findings.push({book,rawUnits:capture.units.length,detachments:capture.detachments.length,boundCurrentUnits:points.units.length,semanticDifferences:0});
}
for(const binding of currentRegistry.crossFactionUnitDependencies){
  const capture=read(binding.sourceCapturePath),previous=oldRegistry.crossFactionUnitDependencies.find(x=>x.id===binding.id);
  verifyFrozenSource(binding.sourceId);assert.deepEqual(capture.unit,read(previous.sourceCapturePath).unit);
  assert.equal(capture.effectiveDate,null);
}
for(const book of ['dark-angels','blood-angels']){
  assert.deepEqual(currentRegistry.factionBindings.find(f=>f.factionId===book),oldRegistry.factionBindings.find(f=>f.factionId===book));
  assert.equal(createEffectiveMfmArmyProjection(book).sourceMetadata.version,'v1.4');
}
let mutations=0;
const reject=(change,check=equalGameplay)=>{const mutant=structuredClone(current);change(mutant);assert.throws(()=>check(mutant));mutations++;};
reject(f=>f.unitPointRecords.find(record=>record.factionId!=='space-marines').pointSchedules[0].entries[0].value++);
reject(f=>f.unitPointRecords.find(record=>record.factionId!=='space-marines').pointSchedules[0].entries[0].maxModels++);
reject(f=>f.enhancementCosts.find(record=>record.factionId!=='space-marines').value++);
reject(f=>f.leaderEligibilityRecords.find(record=>record.factionId!=='space-marines').targetUnitReferenceIds.pop());
reject(f=>f.detachments.find(record=>record.factionId!=='space-marines').forceDispositionIds=[]);
reject(f=>f.unitPointRecords.splice(f.unitPointRecords.findIndex(r=>r.factionId!=='space-marines'),1));
reject(f=>f.unitPointRecords.push(structuredClone(f.unitPointRecords.find(record=>record.factionId!=='space-marines'))));
reject(f=>f.sourceSnapshots.find(s=>s.version==='v1.6').effectiveDate='2026-09-30',validateCanonicalMfmFacts);
reject(f=>f.unitPointRecords.find(r=>r.provenance.sourceVersion==='v1.6').provenance.verifiedAt='2026-09-30',validateCanonicalMfmFacts);
const validReference={id:'central-mfm-source',type:'CENTRALIZED_MFM_REFERENCE',authority:'CENTRALIZED_MFM',versionOrDate:'v1.6',status:'CURRENT',effectiveDate:null,verifiedAt:'2026-10-14',currentnessCutoff:'2026-10-14',url:'https://mfm.warhammer-community.com/en/death-guard'};
validateRegistry([validReference]);
assert.throws(()=>validateRegistry([{...validReference,effectiveFrom:'2026-09-30'}]));
assert.throws(()=>validateRegistry([{...validReference,verifiedAt:null}]));
assert.throws(()=>validateRegistry([{...validReference,type:'OFFICIAL_PDF',authority:'OFFICIAL_GW'}]));
console.log(JSON.stringify({status:'PASS',findings,alliedDependencies:2,historicalV15:'PASS',historicalV14:'PASS',gameplayDifferences:0,mutations,undatedSourceNegativeControls:3}));

// Stage 2B compatibility probes retained against the enrolled native source. Clones are diagnostics.
const cross=read('mfm/content/mfm-v1.6-army-mission-bindings.json');
const ids=read('books/space-marines/v2/identity-bindings.json').bindings;
const sourceBindings=read('books/space-marines/v2/source-bindings.json').recordAddresses;
const ruleId='relation-sm-a134a100f37f4f64',ownerId='unit-sm-02d5dee4717544ad',triggerId='unit-sm-1af70808102d4286',targetId='unit-sm-f169827c554c4eee';
const ruleIdentity=ids.find(i=>i.id===ruleId),ownerIdentity=ids.find(i=>i.id===ownerId);
assert.equal(ruleIdentity.ownerSourceId,ownerIdentity.sourceEntityId);
assert.equal(ruleIdentity.kind,'SOURCE_RELATION');
for(const id of [ownerId,triggerId,targetId])assert.equal(ids.find(i=>i.id===id).kind,'DATASHEET');
const locator=sourceBindings.find(s=>s.sourceEntityId===ruleIdentity.sourceEntityId);
const enrollment=read('books/space-marines/v2/sources/enrollment.json');
const rawArtifact=enrollment.artifacts.find(a=>a.path===locator.document);
assert.equal(sha(fs.readFileSync(path.join(root,locator.document))),rawArtifact.sha256);
const python=process.env.PYTHON||(process.platform==='win32'?path.join(os.homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe'):'python3');
const rawProof=JSON.parse(execFileSync(python,['-X','utf8','-c',
  'import sys,json;from lxml import html;t=html.parse(sys.argv[1]);n=t.xpath(sys.argv[2])[0];print(json.dumps({"text":" ".join("".join(n.itertext()).split()),"owner":n.getparent().getparent().getparent().xpath(".//a[@id]")[0].get("id") if n.getparent().getparent().getparent().xpath(".//a[@id]") else None}))',
  path.join(root,locator.document),locator.pointer],{encoding:'utf8'}));
const sourceClause='Captain of the Honour Guard: If your army includes a MARNEUS CALGAR unit, replace this unit’s Leader ability with the Support ability (this unit can still be attached to the same units).';
assert.equal(rawProof.text,sourceClause);
const smIds=currentRegistry.factionBindings.find(b=>b.factionId==='space-marines'),smByTitle=new Map(smIds.unitBindings.map(b=>[b.sourceTitle,b]));
const catoRef=smByTitle.get('CATO SICARIUS').unitReferenceId,calgarRef=smByTitle.get('MARNEUS CALGAR').unitReferenceId,victrixRef=smByTitle.get('VICTRIX HONOUR GUARD').unitReferenceId;
const support=current.supportEligibilityRecords.find(r=>r.sourceUnitReferenceId===catoRef);
// Exercise the enrolled physical-source roles through the same conditional contract.
const probeLeaderId=smByTitle.get('CATO SICARIUS').leaderEligibilityRecordId;
const conditionalCross=structuredClone(cross);
for(const [ref,id] of [[catoRef,ownerId],[calgarRef,triggerId],[victrixRef,targetId]])conditionalCross.unitBindings[ref]={bindingStatus:'BOUND',armyBookId:'space-marines',armyUnitId:id};
const conditionProof={mfm:{sourceId:support.provenance.sourceId,sourceCaptureSha256:support.provenance.sourceCaptureSha256,rawArtifactSha256:read(smIds.sourceCapturePath).rawArtifacts[0].sha256},armyRule:{sourceId:'space-marines-waha-11e-2026-10-20',sourcePath:locator.document,sha256:rawArtifact.sha256,sourceLocator:locator.pointer,sourceText:sourceClause,canonicalRuleId:ruleId,armyBookId:'space-marines',ownerUnitId:ownerId,triggerUnitId:triggerId}};
for(const [role,id,expectedPresent] of [['LEADER',probeLeaderId,false],['SUPPORT',support.id,true]])conditionalCross.relationAdjudications[id]={role,sourceMfmUnitReferenceId:catoRef,decision:'CONDITIONAL_ROLE_REPLACEMENT',effectiveTargetIds:[{mfmUnitReferenceId:victrixRef,armyUnitId:targetId}],roleCondition:{kind:'ARMY_UNIT_PRESENT',unitReferenceId:calgarRef,expectedPresent},provenance:structuredClone(conditionProof)};
for(const a of Object.values(conditionalCross.relationAdjudications))for(const t of a.effectiveTargetIds)t.armyUnitId=conditionalCross.unitBindings[t.mfmUnitReferenceId].armyUnitId;
conditionalCross.declaredCounts.relationAdjudications=Object.keys(conditionalCross.relationAdjudications).length;
validateMfmCrossDomainBindings(conditionalCross);
const conditionalFacts=structuredClone(current);
for(const [ref,id] of [[catoRef,ownerId],[calgarRef,triggerId],[victrixRef,targetId]])conditionalFacts.unitReferences.find(u=>u.id===ref).armyBinding={bindingStatus:'BOUND',armyBookId:'space-marines',armyUnitId:id};
const conditionalSupport=conditionalFacts.supportEligibilityRecords.find(r=>r.id===support.id);
conditionalSupport.roleCondition=structuredClone(conditionalCross.relationAdjudications[support.id].roleCondition);
conditionalSupport.roleConditionProvenance=structuredClone(conditionProof);if(!conditionalSupport.references.includes(calgarRef))conditionalSupport.references.push(calgarRef);
const conditionalLeader={...structuredClone(conditionalSupport),id:probeLeaderId,recordType:'MFM_LEADER_ELIGIBILITY',roleCondition:structuredClone(conditionalCross.relationAdjudications[probeLeaderId].roleCondition)};
conditionalFacts.leaderEligibilityRecords=conditionalFacts.leaderEligibilityRecords.map(record=>record.id===probeLeaderId?conditionalLeader:record);
validateCanonicalMfmFacts(conditionalFacts);
const cp=createEffectiveMfmArmyProjection('space-marines',{canonicalFacts:conditionalFacts});
const coverage=conditionalFacts.unitReferences.filter(u=>u.armyBinding?.armyBookId==='space-marines').map(u=>u.armyBinding.armyUnitId);
const roleProbe=present=>cp.relationEdges({effectiveUnitIds:coverage,presentUnitIds:present}).filter(e=>e.sourceId===ownerId);
for(const present of [[],[targetId],[ownerId,targetId],['unit-unrelated-character']])assert.deepEqual(roleProbe(present).map(e=>e.role),['leader']);
for(const present of [[triggerId],[ownerId,triggerId,targetId]])assert.deepEqual(roleProbe(present).map(e=>e.role),['support']);
assert.equal(roleProbe([triggerId])[0].targetId,targetId);
assert.equal(roleProbe([triggerId])[0].roleConditionProvenance.armyRule.canonicalRuleId,ruleId);
assert.equal(roleProbe([])[0].roleCondition.expectedPresent,false);
assert.throws(()=>cp.relationEdges({effectiveUnitIds:coverage}),/explicit army presence context/);
// Unknown catalog state must not masquerade as a physical army missing Marneus.
assert.equal(createEffectiveMfmCatalog({canonicalFacts:conditionalFacts}).catalog.unitReferences.some(r=>r.id===calgarRef),true);
let compatibilityMutations=0;
const rejectCross=mutate=>{const c=structuredClone(conditionalCross);mutate(c);assert.throws(()=>validateMfmCrossDomainBindings(c));compatibilityMutations++;};
rejectCross(c=>c.relationAdjudications[probeLeaderId].roleCondition.expectedPresent=true);
rejectCross(c=>delete c.relationAdjudications[probeLeaderId].roleCondition);
rejectCross(c=>c.relationAdjudications[probeLeaderId].roleCondition.kind='TARGET_ATTACHED_TO_CALGAR');
rejectCross(c=>c.relationAdjudications[probeLeaderId].provenance.armyRule.ownerUnitId=targetId);
rejectCross(c=>c.relationAdjudications[probeLeaderId].roleCondition.unitReferenceId=victrixRef);
rejectCross(c=>c.relationAdjudications[probeLeaderId].roleCondition.unitReferenceId='mfm-unit-ref-0000000000000000');
rejectCross(c=>c.relationAdjudications[probeLeaderId].effectiveTargetIds[0].armyUnitId=ownerId);
rejectCross(c=>delete c.relationAdjudications[support.id]);
const rejectFacts=mutate=>{const f=structuredClone(conditionalFacts);mutate(f);assert.throws(()=>validateCanonicalMfmFacts(f));compatibilityMutations++;};
rejectFacts(f=>delete f.leaderEligibilityRecords.find(r=>r.id===probeLeaderId).roleCondition);
rejectFacts(f=>f.leaderEligibilityRecords.push({...structuredClone(conditionalLeader),id:'mfm-leader-eligibility-0000000000000002',roleCondition:undefined,roleConditionProvenance:undefined}));
rejectFacts(f=>f.supportEligibilityRecords.find(r=>r.id===support.id).roleConditionProvenance.mfm.sourceCaptureSha256='0'.repeat(64));
rejectFacts(f=>f.supportEligibilityRecords.find(r=>r.id===support.id).references=f.supportEligibilityRecords.find(r=>r.id===support.id).references.filter(id=>id!==calgarRef));
// Independent oracle detects removal of both conditions (which would otherwise look like old records).
const unguarded=structuredClone(conditionalFacts);for(const r of [...unguarded.leaderEligibilityRecords,...unguarded.supportEligibilityRecords].filter(r=>r.sourceUnitReferenceId===catoRef)){delete r.roleCondition;delete r.roleConditionProvenance;}
assert.throws(()=>assert.deepEqual(createEffectiveMfmArmyProjection('space-marines',{canonicalFacts:unguarded}).relationEdges({effectiveUnitIds:coverage,presentUnitIds:[]}).filter(e=>e.sourceId===ownerId).map(e=>e.role),['leader']));compatibilityMutations++;
// Enrolled source contains both roles; producer preserves both complementary conditions.
assert.deepEqual(createCanonicalMfmFacts({crossDomainBindings:conditionalCross}).leaderEligibilityRecords.find(r=>r.id===probeLeaderId).roleCondition,conditionalLeader.roleCondition);
const unconsumed=structuredClone(conditionalCross);unconsumed.relationAdjudications['mfm-leader-eligibility-0000000000000001']={...structuredClone(unconsumed.relationAdjudications[probeLeaderId])};unconsumed.declaredCounts.relationAdjudications++;assert.throws(()=>createCanonicalMfmFacts({crossDomainBindings:unconsumed}),/relation adjudication coverage|exactly two complementary/);

// Reference-only facts are retained under their MFM owners, never silently joined by titles.
const unknown=structuredClone(cross),det=current.detachments.find(d=>d.factionId==='tau-empire'&&d.qualifierIds.length),detEnh=current.enhancementCosts.filter(e=>e.detachmentId===det.id);
const mark=(set,id,fields)=>{const b=set[id];for(const f of fields)delete b[f];b.bindingStatus='REFERENCE_ONLY';b.reason='NOT_PROVEN: independent Army identity review pending';};
mark(unknown.detachmentBindings,det.id,['armyBookId','armyDetachmentId']);
for(const e of detEnh)mark(unknown.enhancementBindings,e.id,['armyBookId','armyDetachmentId','armyEnhancementId']);
const qs=current.qualifierRecords.filter(q=>q.ownerId===det.id||detEnh.some(e=>e.id===q.ownerId));
for(const q of qs)mark(unknown.qualifierOwnerBindings,q.id,['armyBookId','armyDetachmentId','armyEnhancementId']);
for(const [key,bindings] of [['detachment',unknown.detachmentBindings],['enhancement',unknown.enhancementBindings],['qualifierOwner',unknown.qualifierOwnerBindings]]){unknown.declaredCounts[`${key}Bindings`]=Object.values(bindings).filter(b=>b.bindingStatus!=='REFERENCE_ONLY').length;unknown.declaredCounts[`${key}ReferenceOnly`]=Object.values(bindings).filter(b=>b.bindingStatus==='REFERENCE_ONLY').length;}
validateMfmCrossDomainBindings(unknown);
const unknownFacts=createCanonicalMfmFacts({crossDomainBindings:unknown});
const unresolvedDet=unknownFacts.detachments.find(d=>d.id===det.id);
assert.equal(unresolvedDet.armyDetachmentId,undefined);assert.equal(unresolvedDet.bindingStatus,'REFERENCE_ONLY');
assert.deepEqual(unresolvedDet.provenance,det.provenance);assert.equal(unresolvedDet.detachmentPoints,det.detachmentPoints);
const up=createEffectiveMfmArmyProjection('tau-empire',{canonicalFacts:unknownFacts});
assert.equal(up.pointsForArmyBook('tau-empire').detachments.some(d=>d.mfmRecordId===det.id),false);
assert.equal(up.pointsForArmyBook('tau-empire').enhancements.some(e=>detEnh.some(old=>old.id===e.mfmRecordId)),false);
assert.equal(up.referenceOnlyOwnerRecords.length,1+detEnh.length+qs.length);
assert.equal(createEffectiveMfmCatalog({canonicalFacts:unknownFacts}).getDetachment(det.id).bindingStatus,'REFERENCE_ONLY');
assert.equal(JSON.stringify(createCanonicalMfmFacts({crossDomainBindings:unknown})),JSON.stringify(unknownFacts));
for(const [set,id,field] of [['detachmentBindings',det.id,'armyDetachmentId'],['enhancementBindings',detEnh[0].id,'armyEnhancementId'],['qualifierOwnerBindings',qs[0].id,'armyDetachmentId']]){const bad=structuredClone(unknown);bad[set][id][field]='unit-invented';assert.throws(()=>validateMfmCrossDomainBindings(bad),/reference-only owner/);compatibilityMutations++;}
const badReason=structuredClone(unknown);delete badReason.detachmentBindings[det.id].reason;assert.throws(()=>validateMfmCrossDomainBindings(badReason),/reason/);compatibilityMutations++;
const badChild=structuredClone(unknownFacts);Object.assign(badChild.enhancementCosts.find(e=>e.id===detEnh[0].id),{bindingStatus:'BOUND',armyBookId:'tau-empire',armyDetachmentId:det.armyDetachmentId,armyEnhancementId:detEnh[0].armyEnhancementId});delete badChild.enhancementCosts.find(e=>e.id===detEnh[0].id).reason;assert.throws(()=>validateCanonicalMfmFacts(badChild),/scope mismatch/);compatibilityMutations++;
// An unresolved Enhancement is also safe under a confirmed Detachment.
const lone=structuredClone(cross),enh=detEnh.find(e=>!e.qualifierIds.length);mark(lone.enhancementBindings,enh.id,['armyBookId','armyDetachmentId','armyEnhancementId']);lone.declaredCounts.enhancementBindings--;lone.declaredCounts.enhancementReferenceOnly=(lone.declaredCounts.enhancementReferenceOnly??0)+1;
assert.equal(createCanonicalMfmFacts({crossDomainBindings:lone}).enhancementCosts.find(e=>e.id===enh.id).bindingStatus,'REFERENCE_ONLY');

// Publication 14 Oct is independent of actual capture and verification 20 Oct.
const dateProbe={version:'v1.6',observedAt:'2026-10-20',verifiedAt:'2026-10-20',currentnessCutoff:'2026-10-20',effectiveDate:null,sourceUpdatedAt:null,capturedAt:'2026-10-20T10:01:30.831Z',currentnessEvidence:{downloadsUpdatedAt:'2026-10-14'}};
validateMfmSourceDates(dateProbe);
const late=structuredClone(current);late.currentnessCutoff='2026-10-20';
const snapshot=late.sourceSnapshots.find(s=>s.version==='v1.6');Object.assign(snapshot,dateProbe);
for(const partition of partitions)for(const r of late[partition].filter(r=>r.provenance.sourceId===snapshot.sourceId))Object.assign(r.provenance,{observedAt:snapshot.observedAt,verifiedAt:snapshot.verifiedAt,effectiveDate:null,capturedAt:snapshot.capturedAt,sourceUpdatedAt:null,currentnessEvidence:structuredClone(snapshot.currentnessEvidence),currentnessCutoff:snapshot.currentnessCutoff});
validateCanonicalMfmFacts(late);createEffectiveMfmCatalog({canonicalFacts:late});
const dateCross=structuredClone(cross);dateCross.currentnessCutoff='2026-10-20';validateMfmCrossDomainBindings(dateCross);
const dateIds=structuredClone(currentRegistry);dateIds.currentnessCutoff='2026-10-20';validateMfmIdentityRegistry(dateIds);
for(const patch of [{observedAt:'2026-10-21'},{observedAt:'2026-02-30'},{verifiedAt:'2026-10-19'},{capturedAt:'2026-10-14T00:00:00.000Z'},{sourceUpdatedAt:'2026-10-21'},{currentnessEvidence:{downloadsUpdatedAt:'yesterday'}},{effectiveDate:'2026-10-14'}]){assert.throws(()=>validateMfmSourceDates({...dateProbe,...patch}));compatibilityMutations++;}
const drift=structuredClone(late);drift.unitPointRecords.find(r=>r.provenance.sourceId===snapshot.sourceId).provenance.currentnessEvidence.downloadsUpdatedAt='2026-10-13';assert.throws(()=>validateCanonicalMfmFacts(drift),/provenance drift/);compatibilityMutations++;
// CURRENT enrollment is v1.6; historical LEGENDS stay explicitly source-scoped v1.4.
assert.equal(createCanonicalMfmFacts().sourceSnapshots.find(s=>s.factionId==='space-marines'&&!s.historical).version,'v1.6');
const candidates=read('books/space-marines/v2/mfm-identity-candidates.json');
assert.equal(JSON.stringify(candidates).includes('"active":true'),false);
console.log(JSON.stringify({stage2B:'PASS',conditionalSource:'Cato Sicarius / Captain of the Honour Guard',conditionalRoles:'LEADER iff Marneus absent; SUPPORT iff present; no context rejected',unresolvedOwnersRetainedAndInactive:true,publicationVsCaptureDates:'2026-10-14 / 2026-10-20',compatibilityMutations,spaceMarinesEnrollment:'V1_6_SOURCE_ENROLLED_NATIVE_BINDINGS_SEPARATELY_REVIEWED'}));

// End-to-end producer probes use an isolated frozen-source fixture. No accepted input is edited.
// sourceRegistryPath reuses verifyFrozenSource's existing registry injection, including exact hashes.
const fixtureRoot=fs.mkdtempSync(path.join(os.tmpdir(),'sm-mfm-compat-'));
try{
  const fixtureRegistry=read('books/source-ingestion-contract.json'),selectedSources=new Set([...currentRegistry.factionBindings,...(currentRegistry.historicalSourceBindings??[]),...currentRegistry.crossFactionUnitDependencies].map(b=>b.sourceId));
  fixtureRegistry.sources=fixtureRegistry.sources.filter(s=>selectedSources.has(s.sourceId));
  for(const src of fixtureRegistry.sources)for(const a of src.artifacts){const dest=path.join(fixtureRoot,a.path);fs.mkdirSync(path.dirname(dest),{recursive:true});fs.copyFileSync(path.join(root,a.path),dest);}
  const proofDest=path.join(fixtureRoot,locator.document);fs.mkdirSync(path.dirname(proofDest),{recursive:true});fs.copyFileSync(path.join(root,locator.document),proofDest);
  const diagnosticIds=structuredClone(currentRegistry),diagnosticCross=structuredClone(conditionalCross);
  const smBinding=diagnosticIds.factionBindings.find(b=>b.factionId==='space-marines'),smCapture=JSON.parse(fs.readFileSync(path.join(fixtureRoot,smBinding.sourceCapturePath)));
  smCapture.units.find(u=>u.title==='CATO SICARIUS').relations.leader=['VICTRIX HONOUR GUARD'];
  smCapture.authority='DIAGNOSTIC_TEST_FIXTURE_NOT_ENROLLED';
  smBinding.unitBindings.find(u=>u.unitReferenceId===catoRef).leaderEligibilityRecordId=probeLeaderId;
  const freezeFixture=(binding,capture)=>{
    const {captureSha256,...payload}=capture;capture.captureSha256=sha(JSON.stringify(stable(payload)));binding.sourceCaptureSha256=capture.captureSha256;
    const bytes=JSON.stringify(capture,null,2)+'\n';fs.writeFileSync(path.join(fixtureRoot,binding.sourceCapturePath),bytes);
    const source=fixtureRegistry.sources.find(s=>s.sourceId===binding.sourceId);source.artifacts.find(a=>a.path===binding.sourceCapturePath).sha256=sha(bytes).toLowerCase();source.acceptedHash=aggregateArtifactHash(source.artifacts);
  };
  freezeFixture(smBinding,smCapture);
  for(const a of Object.values(diagnosticCross.relationAdjudications).filter(a=>a.provenance.mfm.sourceId===smBinding.sourceId))a.provenance.mfm.sourceCaptureSha256=smCapture.captureSha256;
  const sourceRegistryPath=path.join(fixtureRoot,'diagnostic-source-registry.json');
  const buildFixture=()=>{fs.writeFileSync(sourceRegistryPath,JSON.stringify(fixtureRegistry));return createCanonicalMfmFacts({repoRoot:fixtureRoot,identityRegistry:diagnosticIds,crossDomainBindings:diagnosticCross,sourceRegistryPath});};
  const produced=buildFixture();
  const producedProjection=createEffectiveMfmArmyProjection('space-marines',{canonicalFacts:produced});
  for(const [presence,expected] of [[[],['leader']],[[triggerId],['support']]])assert.deepEqual(producedProjection.relationEdges({effectiveUnitIds:coverage,presentUnitIds:presence}).filter(e=>e.sourceId===ownerId).map(e=>e.role),expected);
  for(const a of [diagnosticCross.relationAdjudications[probeLeaderId],diagnosticCross.relationAdjudications[support.id]])a.provenance.armyRule.sha256='0'.repeat(64);
  assert.throws(buildFixture,/Conditional role source fingerprint drift/);compatibilityMutations++;
  for(const a of [diagnosticCross.relationAdjudications[probeLeaderId],diagnosticCross.relationAdjudications[support.id]])a.provenance.armyRule.sha256=rawArtifact.sha256;
  const tauBinding=diagnosticIds.factionBindings.find(b=>b.factionId==='tau-empire'),tauCapture=JSON.parse(fs.readFileSync(path.join(fixtureRoot,tauBinding.sourceCapturePath)));
  Object.assign(tauCapture,dateProbe);freezeFixture(tauBinding,tauCapture);diagnosticIds.currentnessCutoff='2026-10-20';diagnosticCross.currentnessCutoff='2026-10-20';
  const laterProduced=buildFixture(),laterProjection=createEffectiveMfmArmyProjection('tau-empire',{canonicalFacts:laterProduced});
  assert.equal(laterProjection.sourceMetadata.observedAt,'2026-10-20');assert.equal(laterProjection.sourceMetadata.verifiedAt,'2026-10-20');assert.equal(laterProjection.sourceMetadata.currentnessEvidence.downloadsUpdatedAt,'2026-10-14');assert.equal(laterProjection.sourceMetadata.effectiveDate,null);
  assert.equal(JSON.stringify(buildFixture()),JSON.stringify(laterProduced));
  for(const oldCutoff of ['2026-09-22','2026-09-30','2026-10-14'])assert.equal(createEffectiveMfmCatalog({canonicalFacts:current,asOf:oldCutoff}).catalog.currentnessCutoff,oldCutoff);
  console.log(JSON.stringify({stage2BProducer:'PASS',isolatedFrozenFixture:true,conditionalRoles:'PRESERVED_THROUGH_PRODUCER_AND_PROJECTION',sourceDates:'20_OCT_OBSERVATION_14_OCT_DOWNLOAD_LIST',mutations:compatibilityMutations,deterministic:true}));
}finally{
  const safe=path.resolve(fixtureRoot),prefix=path.resolve(os.tmpdir())+path.sep;
  assert.ok(safe.startsWith(prefix)&&path.basename(safe).startsWith('sm-mfm-compat-'));
  fs.rmSync(safe,{recursive:true,force:true});
}

// Stage 4A: enrolled native source facts, exact CURRENT/HISTORICAL separation.
const smCapture=read(smIds.sourceCapturePath),smRaw=fs.readFileSync(path.join(root,path.dirname(smIds.sourceCapturePath),smCapture.rawArtifacts[0].path));
verifyFrozenSource(smIds.sourceId);
assert.equal(smCapture.version,'v1.6');assert.equal(smCapture.observedAt,'2026-10-20');assert.equal(smCapture.verifiedAt,'2026-10-20');assert.equal(smCapture.effectiveDate,null);assert.equal(smCapture.sourceUpdatedAt,null);assert.equal(smCapture.currentnessEvidence.downloadsUpdatedAt,'2026-10-14');
const {captureSha256:smFingerprint,...smPayload}=smCapture;assert.equal(sha(JSON.stringify(stable(smPayload))),smFingerprint);assert.equal(sha(smRaw),smCapture.rawArtifacts[0].sha256);assert.equal(smRaw.length,smCapture.rawArtifacts[0].bytes);
const smCurrent=current.unitPointRecords.filter(r=>r.factionId==='space-marines'&&r.status==='CURRENT'),smLegend=current.unitPointRecords.filter(r=>r.factionId==='space-marines'&&r.status==='LEGENDS');
assert.equal(smCurrent.length,87);assert.equal(smCurrent.reduce((n,r)=>n+r.pointSchedules.length,0),123);assert.equal(smCurrent.reduce((n,r)=>n+r.pointSchedules.reduce((a,s)=>a+s.entries.length,0),0),160);
assert.equal(smLegend.length,76);assert.equal(current.detachments.filter(r=>r.factionId==='space-marines').length,22);assert.equal(current.enhancementCosts.filter(r=>r.factionId==='space-marines').length,57);
for(const sourceUnit of smCapture.units){const binding=smByTitle.get(sourceUnit.title),record=current.unitPointRecords.find(r=>r.id===binding.unitPointRecordId);assert.ok(record);assert.deepEqual(record.pointSchedules,sourceUnit.pointSchedules);assert.equal(record.status,'CURRENT');assert.equal(record.provenance.sourceId,smIds.sourceId);for(const role of ['leader','support']){const expected=sourceUnit.relations?.[role]??[],actual=current[role==='leader'?'leaderEligibilityRecords':'supportEligibilityRecords'].find(r=>r.sourceUnitReferenceId===binding.unitReferenceId);assert.equal(Boolean(actual),expected.length>0);if(actual)assert.deepEqual(actual.rawMfmTargetUnitReferenceIds,expected.map(title=>smByTitle.get(title).unitReferenceId));}}
for(const sourceDetachment of smCapture.detachments){const b=smIds.detachmentBindings.find(r=>r.sourceTitle===sourceDetachment.title),record=current.detachments.find(r=>r.id===b.id);assert.equal(record.detachmentPoints,sourceDetachment.detachmentPoints);for(const enhancement of sourceDetachment.enhancements){const eb=b.enhancementBindings.find(r=>r.sourceTitle===enhancement.title);assert.equal(current.enhancementCosts.find(r=>r.id===eb.id).value,enhancement.value);}}
const historical=currentRegistry.historicalSourceBindings;assert.equal(historical.length,1);assert.deepEqual(historical[0].acceptedStatuses,['LEGENDS']);assert.equal(historical[0].includeDetachments,false);verifyFrozenSource(historical[0].sourceId);
for(const record of smLegend){const previous=old.unitPointRecords.find(r=>r.id===record.id);assert.deepEqual(record,previous);assert.equal(record.provenance.sourceVersion,'v1.4');assert.equal(record.provenance.currentnessCutoff,'2026-09-22');}
const legendPointIds=new Set(smLegend.map(r=>r.id));for(const part of ['paidUpgradeRecords','leaderEligibilityRecords','supportEligibilityRecords'])for(const record of current[part].filter(r=>legendPointIds.has(r.unitPointRecordId??r.sourceUnitPointRecordId)))assert.deepEqual(record,old[part].find(r=>r.id===record.id));
const currentCatalog=createEffectiveMfmCatalog({canonicalFacts:current}).catalog;assert.equal(currentCatalog.unitPointRecords.some(r=>r.factionId==='space-marines'&&r.status==='LEGENDS'),false);assert.equal(createEffectiveMfmCatalog({canonicalFacts:current,scope:'CURRENT_AND_LEGENDS'}).catalog.unitPointRecords.filter(r=>r.factionId==='space-marines').length,163);
let enrollmentMutations=0;const rejectIds=mutate=>{const ids=structuredClone(currentRegistry);mutate(ids);assert.throws(()=>createCanonicalMfmFacts({identityRegistry:ids}));enrollmentMutations++;};
rejectIds(r=>r.historicalSourceBindings[0].acceptedStatuses=['CURRENT','LEGENDS']);rejectIds(r=>r.historicalSourceBindings[0].includeDetachments=true);rejectIds(r=>r.historicalSourceBindings[0].unitBindings.find(b=>b.status==='LEGENDS').status='CURRENT');rejectIds(r=>r.historicalSourceBindings[0].sourceCaptureSha256='0'.repeat(64));rejectIds(r=>r.factionBindings.find(b=>b.factionId==='space-marines').sourceCaptureSha256='0'.repeat(64));rejectIds(r=>r.factionBindings.find(b=>b.factionId==='space-marines').unitBindings.pop());rejectIds(r=>r.factionBindings.find(b=>b.factionId==='space-marines').unitBindings[0].sourceTitle='UNPROVEN_ALIAS');rejectIds(r=>r.historicalSourceBindings[0].detachmentBindings=[structuredClone(r.factionBindings.find(b=>b.factionId==='space-marines').detachmentBindings[0])]);
const badScope=structuredClone(current);badScope.sourceSnapshots.find(s=>s.historical).statusScope=['CURRENT','LEGENDS'];assert.throws(()=>validateCanonicalMfmFacts(badScope),/LEGENDS-only/);enrollmentMutations++;
const laundered=structuredClone(current),historicalSnapshot=laundered.sourceSnapshots.find(s=>s.historical),launderedPoint=laundered.unitPointRecords.find(r=>r.provenance.sourceId===historicalSnapshot.sourceId);launderedPoint.status='CURRENT';laundered.pricingGroups.find(g=>g.id===launderedPoint.pricingGroupId).status='CURRENT';assert.throws(()=>validateCanonicalMfmFacts(laundered),/historical source cannot price CURRENT/);enrollmentMutations++;
const reordered=structuredClone(currentRegistry);reordered.factionBindings.reverse();reordered.historicalSourceBindings.reverse();for(const binding of [...reordered.factionBindings,...reordered.historicalSourceBindings]){binding.groupBindings.reverse();binding.unitBindings.reverse();binding.detachmentBindings.reverse();for(const detachment of binding.detachmentBindings){detachment.enhancementBindings.reverse();detachment.qualifierBindings.reverse();}}
// Field arrays retain explicit source order; facts use stable canonical identity order.
assert.deepEqual(createCanonicalMfmFacts({identityRegistry:reordered}).unitPointRecords,current.unitPointRecords);assert.deepEqual(createCanonicalMfmFacts(),current);
console.log(JSON.stringify({stage4A:'PASS',sourceVersion:'v1.6',observedAt:smCapture.observedAt,currentUnits:87,pointSchedules:123,pointRows:160,detachments:22,enhancementsAndUpgrades:57,paidOptions:smCapture.counts.paidOptions,historicalLegendsPreserved:76,historicalSourceVersion:'v1.4',conditionalRoles:'SOURCE_PROVEN_COMPLEMENTARY',mutations:enrollmentMutations,sourceParity:'PASS',deterministic:true,otherEightFactionGameplayDifferences:0}));

// Independent accepted-source comparisons must also detect syntactically valid wrong prices/tiers.
const assertSmNumericParity=facts=>{
  const points=facts.unitPointRecords.filter(r=>r.factionId==='space-marines'&&r.status==='CURRENT');assert.equal(points.length,smCapture.units.length);
  for(const source of smCapture.units){const b=smByTitle.get(source.title),record=points.find(r=>r.id===b.unitPointRecordId);assert.ok(record);assert.deepEqual(record.pointSchedules,source.pointSchedules);const paid=facts.paidUpgradeRecords.filter(r=>r.unitPointRecordId===record.id);assert.equal(paid.length,(source.paidOptions??[]).length);for(const option of source.paidOptions??[]){const binding=b.paidUpgradeBindings.find(p=>p.sourceGroup===option.sourceGroup&&p.sourceLabel===option.sourceLabel),actual=paid.find(p=>p.id===binding.id);assert.ok(actual);assert.equal(actual.value,option.value);assert.equal(actual.sourceLabel,option.sourceLabel);}}
  for(const source of smCapture.detachments){const b=smIds.detachmentBindings.find(d=>d.sourceTitle===source.title),actual=facts.detachments.find(d=>d.id===b.id);assert.ok(actual);assert.equal(actual.detachmentPoints,source.detachmentPoints);for(const option of source.enhancements){const eb=b.enhancementBindings.find(e=>e.sourceTitle===option.title);assert.equal(facts.enhancementCosts.find(e=>e.id===eb.id).value,option.value);}}
};
assertSmNumericParity(current);let numericMutations=0;
for(const mutate of [f=>f.unitPointRecords.find(r=>r.id===smCurrent[0].id).pointSchedules[0].entries[0].value++,f=>f.unitPointRecords.find(r=>r.id===smCurrent[0].id).pointSchedules[0].entries[0].maxModels++,f=>f.unitPointRecords.splice(f.unitPointRecords.findIndex(r=>r.id===smCurrent[0].id),1),f=>f.detachments.find(r=>r.factionId==='space-marines').detachmentPoints++,f=>f.enhancementCosts.find(r=>r.factionId==='space-marines').value++,f=>f.paidUpgradeRecords.find(r=>r.factionId==='space-marines'&&r.status==='CURRENT').value++]){const bad=structuredClone(current);mutate(bad);assert.throws(()=>assertSmNumericParity(bad));numericMutations++;}
console.log(JSON.stringify({stage4ANumericParity:'PASS',independentSource:'ACCEPTED_OFFICIAL_CAPTURE_PINNED_TO_RAW_BYTES',numericMutations}));

// A central factual reference owner does not register another application Army Book.
assert.deepEqual(cross.armyBookBindings.deathwatch,{armyBookId:'deathwatch'});
const missingDeathwatchOwner=structuredClone(cross);delete missingDeathwatchOwner.armyBookBindings.deathwatch;missingDeathwatchOwner.declaredCounts.armyBooks--;assert.throws(()=>validateMfmCrossDomainBindings(missingDeathwatchOwner),/explicit Army Book scope|required/);
const wrongOwnerCount=structuredClone(cross);wrongOwnerCount.declaredCounts.armyBooks--;assert.throws(()=>validateMfmCrossDomainBindings(wrongOwnerCount),/binding count drift|Army Book/);
console.log(JSON.stringify({stage4AFactualOwners:'PASS',deathwatchReferenceOwner:'EXPLICIT_SEPARATE_NOT_APPLICATION_REGISTRATION',ownerCountControls:2}));

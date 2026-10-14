/** Current source acceptance, historical compatibility and unchanged semantics. */
import assert from 'node:assert/strict';
import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';import {fileURLToPath} from 'node:url';
import {createCanonicalMfmFacts} from '../content/canonical-mfm-facts.mjs';
import {createEffectiveMfmCatalog} from '../content/effective-mfm-catalog.mjs';
import {validateCanonicalMfmFacts,validateMfmIdentityRegistry} from '../content/mfm-model-contract.mjs';
import {createEffectiveMfmArmyProjection} from '../../books/shared/tools/effective-mfm-army-projection.mjs';
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
assert.equal(current.sourceVersion,'v1.6-scoped-six');assert.equal(current.currentnessCutoff,'2026-10-14');
assert.equal(createEffectiveMfmCatalog({canonicalFacts:old}).catalog.currentnessCutoff,'2026-09-30');
const partitions=['pricingGroups','unitReferences','unitPointRecords','paidUpgradeRecords','leaderEligibilityRecords','supportEligibilityRecords','detachments','enhancementCosts','qualifierRecords'];
const equalGameplay=facts=>{for(const key of partitions)assert.deepEqual(withoutProvenance(facts[key]),withoutProvenance(old[key]),key+' changed source semantics');};
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
for(const book of ['space-marines','dark-angels','blood-angels']){
  assert.deepEqual(currentRegistry.factionBindings.find(f=>f.factionId===book),oldRegistry.factionBindings.find(f=>f.factionId===book));
  assert.equal(createEffectiveMfmArmyProjection(book).sourceMetadata.version,'v1.4');
}
let mutations=0;
const reject=(change,check=equalGameplay)=>{const mutant=structuredClone(current);change(mutant);assert.throws(()=>check(mutant));mutations++;};
reject(f=>f.unitPointRecords[0].pointSchedules[0].entries[0].value++);
reject(f=>f.unitPointRecords[0].pointSchedules[0].entries[0].maxModels++);
reject(f=>f.enhancementCosts[0].value++);
reject(f=>f.leaderEligibilityRecords[0].targetUnitReferenceIds.pop());
reject(f=>f.detachments[0].forceDispositionIds=[]);
reject(f=>f.unitPointRecords.pop());
reject(f=>f.unitPointRecords.push(structuredClone(f.unitPointRecords[0])));
reject(f=>f.sourceSnapshots.find(s=>s.version==='v1.6').effectiveDate='2026-09-30',validateCanonicalMfmFacts);
reject(f=>f.unitPointRecords.find(r=>r.provenance.sourceVersion==='v1.6').provenance.verifiedAt='2026-09-30',validateCanonicalMfmFacts);
const validReference={id:'central-mfm-source',type:'CENTRALIZED_MFM_REFERENCE',authority:'CENTRALIZED_MFM',versionOrDate:'v1.6',status:'CURRENT',effectiveDate:null,verifiedAt:'2026-10-14',currentnessCutoff:'2026-10-14',url:'https://mfm.warhammer-community.com/en/death-guard'};
validateRegistry([validReference]);
assert.throws(()=>validateRegistry([{...validReference,effectiveFrom:'2026-09-30'}]));
assert.throws(()=>validateRegistry([{...validReference,verifiedAt:null}]));
assert.throws(()=>validateRegistry([{...validReference,type:'OFFICIAL_PDF',authority:'OFFICIAL_GW'}]));
console.log(JSON.stringify({status:'PASS',findings,alliedDependencies:2,historicalV15:'PASS',historicalV14:'PASS',gameplayDifferences:0,mutations,undatedSourceNegativeControls:3}));

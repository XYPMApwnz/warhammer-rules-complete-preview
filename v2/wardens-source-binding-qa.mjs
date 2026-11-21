/** Reviewed named-model source join through the actual browser roster entry. */
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {parseProducerJSON} from '../books/shared/source-refs-v2/producer-io.mjs';
import {createBrowserRoster} from '../books/space-marines/v2/roster-boot.mjs';
import {validateSpaceMarinesRosterCorrections} from '../books/space-marines/v2/roster-source-review.mjs';
import {getCurrentMfmSource} from '../mfm/content/current-mfm-release.mjs';

const read=name=>parseProducerJSON(fs.readFileSync(new URL('../books/space-marines/v2/'+name,import.meta.url),'utf8'));
const facts=read('generated/effective.json'),review=read('roster-source-corrections.json'),book=read('generated/roster-import.json');
const originalFacts=JSON.stringify(facts),originalBook=JSON.stringify(book),clone=structuredClone;
const UNIT='unit-sm-c7226873c51d43c0',MEMBER='composition-sm-11f249c8e3af4b85',PROFILE='model-sm-1e6ba64c42ba4d79';
const BODY='unit-sm-59162946fee84360',BANNER='ability-sm-5f9181b4142f4205';
const validated=validateSpaceMarinesRosterCorrections(review,{facts});
assert.deepEqual(validated.modelMappings.map(row=>[row.memberId,row.profileId]),[
  ['composition-sm-b2e054ed2ab6473c','model-sm-55bf1242f2bb4dae'],
  ['composition-sm-dc1b983be26846bf','model-sm-eaba389795c342e3'],[MEMBER,PROFILE]]);
assert.equal(facts.entities.find(entity=>entity.id===MEMBER).data.profileBindingStatus,'NOT_PROVEN','Factual source status is preserved');
assert.equal(facts.entities.find(entity=>entity.id===MEMBER).data.modelProfileId,null,'Reviewed join must not rewrite factual data');
assert.equal(facts.entities.find(entity=>entity.id===PROFILE).data.name,'Dainal Komelius','Factual profile spelling is preserved');
assert.equal(book.importBindings.unresolvedCompositions.filter(row=>row.ownerId===UNIT).length,0);
const mapping=book.importBindings.compositions.find(row=>row.id===MEMBER);
assert.equal(mapping.profileId,PROFILE);assert.deepEqual(mapping.labels,['Dainal Kornelius']);
assert.equal(mapping.reviewedMapping.provenance.reviewId,'sm-o3-reviewed-'+MEMBER);

// This is a constructed diagnostic fixture, not an actual New Recruit export.
const fixture=fs.readFileSync(new URL('./fixtures/wardens-contextual-source.txt',import.meta.url),'utf8');
const fetch=async url=>({ok:true,json:async()=>JSON.parse(fs.readFileSync(url,'utf8'))});
const service=await createBrowserRoster({fetch}),imported=service.import(fixture,{}, {replaceExisting:true});
assert.equal(imported.status,'READY',JSON.stringify({needs:imported.needsBindings,errors:imported.errors}));
assert.deepEqual(imported.needsBindings,[]);assert.deepEqual(imported.errors,[]);
assert.equal(service.state.units.length,3);
const source=service.state.units[0],target=service.state.units[1],independent=service.state.units[2];
assert.equal(source.canonicalUnitId,UNIT);assert.equal(target.canonicalUnitId,BODY);assert.equal(independent.canonicalUnitId,BODY);
assert.equal(source.startingStrength,6);assert.equal(source.modelRows.length,6);
const expectedMembers=facts.entities.filter(entity=>entity.parentId===UNIT&&entity.kind==='COMPOSITION_MEMBER');
assert.equal(expectedMembers.length,6);
for(const member of expectedMembers){
  const row=source.modelRows.find(model=>model.compositionMemberId===member.id);
  assert.ok(row,member.id);assert.equal(row.quantity,1);assert.equal(row.presentationLabel,member.data.name);
  assert.equal(row.canonicalProfileId,member.id===MEMBER?PROFILE:member.data.modelProfileId);
}
assert.equal(new Set(source.modelRows.map(row=>row.canonicalProfileId)).size,6,'Six distinct proven physical identities');
const dainal=source.modelRows.find(row=>row.compositionMemberId===MEMBER);
assert.deepEqual(dainal.selections.flatMap(selection=>selection.canonicalProfileIds).sort(),
  ['weapon-sm-4e2c60ee42944338','weapon-sm-ef91e4d8964546a9'].sort(),'Exact named model weapons');

const declaration=book.mfm.relationDeclarations.find(row=>row.sourceId===UNIT&&row.role==='support');
assert.ok(declaration,'Existing official MFM SUPPORT declaration');
assert.equal(declaration.provenance.sourceId,getCurrentMfmSource('space-marines').sourceId);
assert.ok(declaration.targets.some(row=>row.entityId===BODY&&row.status==='BOUND'),'Intercessors are a proven MFM SUPPORT target');
assert(service.candidates(source.instanceId).some(candidate=>candidate.instanceId===target.instanceId));
const banner=id=>service.effective(id).attachedRuleTexts.filter(row=>row.ruleId===BANNER);
assert.equal(banner(target.instanceId).length,0,'Unattached bodyguard has no Wardens text');
service.attach(source.instanceId,target.instanceId);
assert.deepEqual(service.state.attachments,[{leaderInstanceId:source.instanceId,bodyguardInstanceId:target.instanceId,role:'SUPPORT'}]);
const rows=banner(target.instanceId);assert.equal(rows.length,1,'Exactly one source-backed Banner block');
assert.equal(rows[0].text,facts.entities.find(entity=>entity.id===BANNER).data.text);
assert.equal(rows[0].sourceLabel,'Wardens of Ultramar');assert.equal(rows[0].sourceInstanceId,source.instanceId);
assert.equal(rows[0].recipientInstanceId,target.instanceId);assert(rows[0].proofs.length);
assert.equal(banner(independent.instanceId).length,0,'Independent duplicate cannot receive the text');
const snapshot=service.snapshot(),projection=JSON.stringify(service.projection);
service.load(snapshot);assert.deepEqual(banner(target.instanceId),rows,'Repeated load preserves source and recipient');
assert.equal(JSON.stringify(service.projection),projection);
service.detach(source.instanceId);assert.equal(banner(target.instanceId).length,0,'Detached component loses Banner text');
assert.equal(service.state.attachments.length,0);

// Each negative starts from the already validated, READY physical fixture and
// corrupts only the exact source evidence being tested, never roster structure.
let controls=0;
const reject=(mutate,expected)=>{
  const candidate=clone(review),sourceFacts=clone(facts);
  mutate(candidate.corrections.find(row=>row.compositionId===MEMBER),sourceFacts);
  assert.throws(()=>validateSpaceMarinesRosterCorrections(candidate,{facts:sourceFacts}),expected);controls++;
};
reject(row=>row.modelProfileId='model-sm-3b16612be262433d',error=>error.code==='ERR_ASSERTION');
reject(row=>row.corroboration.sha256='0'.repeat(64),error=>error.code==='ERR_ASSERTION');
reject(row=>row.corroboration.modelPointer='/documents/2/data/catalogue/sharedSelectionEntries/15/selectionEntries/2',error=>error.code==='ERR_ASSERTION');
reject(row=>row.context.fixedQuantity=2,error=>error.code==='ERR_ASSERTION');
reject(row=>row.globalAliasesAdded=true,error=>error.code==='ERR_ASSERTION');
reject((row,candidate)=>candidate.entities.find(entity=>entity.id===UNIT).data.modelKeywordDeclarations=[],/Canonical Wardens named PSYKER is ambiguous/);
reject(row=>row.sourceProof[0].source.sha256='0'.repeat(64),/Source provenance changed/);
assert.equal(JSON.stringify(facts),originalFacts);assert.equal(JSON.stringify(book),originalBook);
console.log(JSON.stringify({status:'PASS',models:6,compositionBinding:[MEMBER,PROFILE],attachmentRole:'SUPPORT',
  banner:{attached:1,independent:0,detached:0},negativeControls:controls,fixtureSha256:createHash('sha256').update(fixture).digest('hex')}));

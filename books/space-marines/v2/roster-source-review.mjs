/** Reviewed source joins for physical import. The factual owner stays unchanged.
 * These four explicit corrections are not aliases, new sources or gameplay rules.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
const read=name=>JSON.parse(fs.readFileSync(new URL(name,import.meta.url),'utf8'));
const sha=value=>createHash('sha256').update(value).digest('hex').toUpperCase();
const root=new URL('../../../',import.meta.url);
const modelPairs=[
 ['composition-sm-b2e054ed2ab6473c','model-sm-55bf1242f2bb4dae','SERGEANT'],
 ['composition-sm-dc1b983be26846bf','model-sm-eaba389795c342e3','ORDINARY_VETERAN']
];
const scopeIds=['enhancement-sm-1599eafe5bab4e91','enhancement-sm-32c4e009e6c84003'];
const vanguard='unit-sm-74c53544aa694147',dainal='composition-sm-11f249c8e3af4b85';
const sectionIds=['section-sm-d342cadab9a64c24','section-sm-c6194f07927c474c'];
const norm=value=>String(value).replace(/\s+/gu,' ').trim();
const sameSet=(actual,expected,label)=>assert.deepEqual([...actual].sort(),[...expected].sort(),label);
const ordered=value=>Array.isArray(value)?value.map(ordered):value&&typeof value==='object'?
 Object.fromEntries(Object.keys(value).sort().map(key=>[key,ordered(value[key])])):value;

export function validateSpaceMarinesRosterCorrections(review,{facts=read('./generated/effective.json')}={}){
 const before=JSON.stringify(facts),index=new Map(facts.entities.map(e=>[e.id,e]));
 assert.equal(review.schema,'space-marines-v2-reviewed-roster-source-corrections/v1');
 assert.equal(review.corrections.length,4,'Unreviewed physical source correction');
 const addresses=read('./source-bindings.json').recordAddresses;
 const enrollment=read('./sources/enrollment.json').artifacts;
 const rawSeen=new Set();
 function proof(row){
  assert.ok(row&&typeof row==='object','Missing source proof');
  const entity=index.get(row.canonicalId);assert.ok(entity,'Unknown source proof canonical ID');
  assert.equal(entity.bookId,'space-marines','Foreign source owner');
  assert.equal(row.sourceEntityId,entity.sourceEntityId,'Source occurrence changed');
  assert.equal(row.kind,entity.kind,'Source kind changed');
  assert.equal(row.parentId,entity.parentId,'Source parent changed');
  assert.deepEqual(row.source,entity.provenance,'Source provenance changed');
  const accepted=enrollment.find(a=>a.path===row.source.document);
  assert.ok(accepted,'Unaccepted source document');assert.equal(accepted.sha256,row.source.sha256,'Source SHA changed');
  if(!rawSeen.has(accepted.path)){
   assert.equal(sha(fs.readFileSync(new URL(accepted.path,root))),accepted.sha256,'Accepted source bytes changed');rawSeen.add(accepted.path);
  }
  const address=addresses.filter(a=>a.sourceEntityId===row.sourceEntityId&&a.kind===row.kind);
  assert.equal(address.length,1,'Source identity must have one accepted address');
  assert.equal(address[0].document,row.source.document);assert.equal(address[0].pointer,row.source.pointer,'Source XPath changed');
  const sourceData=structuredClone(entity.data);
  if(entity.kind==='COMPOSITION_MEMBER'){
   assert.equal(sourceData.modelProfileId,null,'Unresolved source composition unexpectedly bound');
   delete sourceData.modelProfileId;sourceData.modelProfileKey=null;
  }
  assert.equal(sha(JSON.stringify(ordered(sourceData))),address[0].dataFingerprint,'Accepted factual source fields changed');
  assert.match(row.selectedHtmlSha256,/^[A-F0-9]{64}$/u,'Missing selected HTML pin');
  assert.equal(sha(row.selectedSourceText),row.selectedTextSha256,'Selected source quote changed');
  return entity;
 }
 const mappings=review.corrections.filter(r=>r.type==='SOURCE_CONTEXTUAL_COMPOSITION_PROFILE_BINDING');
 const scopes=review.corrections.filter(r=>r.type==='SOURCE_REVIEWED_PHYSICAL_ASSIGNMENT_SCOPE');
 sameSet(mappings.map(r=>r.compositionId),modelPairs.map(r=>r[0]),'Composition correction coverage changed');
 sameSet(scopes.map(r=>r.canonicalId),scopeIds,'Scope correction coverage changed');
 assert.equal(new Set(review.corrections.map(r=>r.id)).size,4,'Duplicate reviewed correction');
 const modelMappings=mappings.map(row=>{
  const expected=modelPairs.find(r=>r[0]===row.compositionId),[memberId,profileId,role]=expected;
  assert.equal(row.id,'sm-stage4c-reviewed-'+memberId);assert.equal(row.status,'SOURCE_CONFIRMED');
  assert.equal(row.canonicalOwnerId,vanguard);assert.equal(row.modelProfileId,profileId,'Wrong contextual MODEL recipient');
  assert.equal(row.sourceRole,role,'Wrong source MODEL role');
  assert.deepEqual(row.old,{profileBindingStatus:'NOT_PROVEN',modelProfileId:null});
  assert.deepEqual(row.new,{profileBindingStatus:'SOURCE_CONFIRMED',modelProfileId:profileId});
  assert.equal(row.preserveSourceLabels,true);assert.equal(row.globalAliasesAdded,false,'Global alias forbidden');
  const member=index.get(memberId),profile=index.get(profileId),owner=index.get(vanguard);
  assert.equal(member.kind,'COMPOSITION_MEMBER');assert.equal(profile.kind,'MODEL_PROFILE');
  assert.equal(member.parentId,vanguard);assert.equal(profile.parentId,vanguard);
  assert.equal(member.data.profileBindingStatus,row.old.profileBindingStatus,'Original composition status changed');
  assert.equal(member.data.modelProfileId,null,'Source join must remain a separate reviewed correction');
  assert.deepEqual(owner.data.profileIds.map(id=>index.get(id).parentId),[vanguard,vanguard]);
  sameSet(owner.data.compositionMemberIds,modelPairs.map(r=>r[0]),'Source role population changed');
  sameSet(owner.data.profileIds,modelPairs.map(r=>r[1]),'Source profile population changed');
  sameSet(row.sourceProof.map(p=>p.canonicalId),[memberId,profileId,...sectionIds],'Source proof coverage changed');
  row.sourceProof.forEach(proof);
  const context=row.context;assert.equal(context.unitSourceId,owner.sourceEntityId);
  assert.equal(context.unitPointer,owner.provenance.pointer);assert.equal(context.unitHeader,owner.data.title);
  assert.equal(context.profileCount,2);sameSet(context.profileRoleSet,['SERGEANT','ORDINARY_VETERAN'],'Role context changed');
  sameSet(context.compositionMemberIds,owner.data.compositionMemberIds,'Composition context changed');
  assert.equal(context.statsAreCorroborationNotIdentityKey,true);
  assert.deepEqual(context.sourceStatsBothProfiles,profile.data.stats,'Corroborating profile stats changed');
  const memberText=row.sourceProof.find(p=>p.canonicalId===memberId).selectedSourceText;
  const profileText=row.sourceProof.find(p=>p.canonicalId===profileId).selectedSourceText;
  assert.ok(memberText.includes(member.data.name),'Source composition label changed');
  assert.ok(profileText.includes(profile.data.name),'Source profile label changed');
  const physicalRole=role==='SERGEANT'?'Vanguard Veteran Sergeant':'Vanguard Veteran';
  assert.equal(profile.data.name,physicalRole);assert.equal(member.data.name,physicalRole+' with Jump Pack');
  return {memberId,profileId,evidence:[{entityId:memberId,path:['text']},{entityId:profileId,path:['name']},
   {entityId:vanguard,path:['title']},...sectionIds.map(entityId=>({entityId,path:['text']}))],
   provenance:{...structuredClone(member.provenance),reviewId:row.id,reviewType:row.type}};
 });
 const scopeCorrections=scopes.map(row=>{
  const entity=proof(row.sourceProof),id=entity.id;
  assert.equal(row.id,'sm-stage4c-reviewed-'+id);assert.equal(row.status,'SOURCE_CONFIRMED');
  assert.equal(row.canonicalId,id);assert.equal(row.canonicalOwnerId,entity.parentId);
  assert.equal(entity.kind,'ENHANCEMENT');assert.equal(entity.data.scope,'MODEL','Original scope changed');
  assert.deepEqual(row.old,{scope:'MODEL'});assert.deepEqual(row.new,{scope:'UNIT'});
  assert.deepEqual(row.unchanged,{itemKind:entity.data.itemKind,canonicalId:id,sourceEntityId:entity.sourceEntityId,
   text:entity.data.text,eligibilityText:entity.data.eligibilityText},'Scope correction changed another factual field');
  assert.equal(row.unchanged.itemKind,'ENHANCEMENT','Source Enhancement must not become an Upgrade');
  assert.ok(norm(entity.data.text).includes('ADEPTUS ASTARTES unit only.'),'Source UNIT requirement missing');
  assert.ok(row.sourceProof.selectedSourceText.includes('ADEPTUS ASTARTES unit only.'),'Reviewed source UNIT requirement missing');
  assert.equal(row.globalAliasesAdded,false);assert.equal(row.executableBindingChangeAuthorizedByThisEvidence,false);
  return {entityId:id,previousScope:'MODEL',scope:'UNIT',evidence:[{entityId:id,path:['text']},
   {entityId:id,path:['eligibilityText']}],provenance:{...structuredClone(entity.provenance),reviewId:row.id,reviewType:row.type}};
 });
 assert.equal(review.unresolved.length,1);const unresolved=review.unresolved[0];
 assert.equal(unresolved.canonicalId,dainal);assert.equal(unresolved.status,'NOT_PROVEN','Dainal cannot be silently resolved');
 assert.equal(unresolved.candidateModelProfileId,'model-sm-1e6ba64c42ba4d79');unresolved.sourceProof.forEach(proof);
 const sourceMember=index.get(dainal),candidate=index.get(unresolved.candidateModelProfileId);
 assert.equal(sourceMember.data.name,'Dainal Kornelius');assert.equal(sourceMember.data.profileBindingStatus,'NOT_PROVEN');
 assert.equal(sourceMember.data.modelProfileId,null);assert.equal(candidate.data.name,'Dainal Komelius');
 assert.equal(JSON.stringify(facts),before,'Source review mutated factual owner');
 return {review:structuredClone(review),modelMappings,scopeCorrections};
}

export function readSpaceMarinesRosterCorrections({facts=read('./generated/effective.json')}={}){
 return validateSpaceMarinesRosterCorrections(read('./roster-source-corrections.json'),{facts});
}

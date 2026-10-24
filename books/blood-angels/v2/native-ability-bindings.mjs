/** Reviewed native presence and static source-profile InSv, matching SM V2.
 * Qualified FNP and unknown battle events are deliberately not lowered. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {createEffectiveCoreCatalog} from '../../core-rules/content/effective-core-catalog.mjs';
const review=JSON.parse(fs.readFileSync(new URL('./native-ability-review.json',import.meta.url),'utf8'));
const clone=structuredClone,sha=text=>createHash('sha256').update(text).digest('hex').toUpperCase();
export function bindBloodAngelsNative(book){
 const index=new Map(book.entities.map(entity=>[entity.id,entity])),core=createEffectiveCoreCatalog();
 book.rosterReferenceSemantics??={};book.rosterAbilityReferences??={};
 const nativeAbilities=[],nativeProfiles=[];
 for(const proof of review.nativeAbilities){
  const entity=index.get(proof.id),owner=index.get(proof.ownerId);
  assert.equal(entity.parentId,proof.ownerId);assert.equal(entity.sourceEntityId,proof.sourceEntityId);
  assert.equal(entity.data.text,proof.quote);assert.equal(sha(entity.data.text),proof.sourceFieldSha256);
  assert.deepEqual(entity.provenance,proof.provenance);assert.deepEqual(owner.data.profileIds,proof.modelProfileIds);
  const fact=core.getById(proof.canonicalAbilityId);assert.equal(fact?.state,'FULL_CONTENT');
  book.rosterReferenceSemantics[proof.id]={scope:'MODEL',modelProfileIds:clone(proof.modelProfileIds),
   abilities:[fact.id==='core-feel-no-pain'?{name:'Feel No Pain',value:proof.parameters.value}:{canonicalId:fact.id,name:entity.data.label,parameters:clone(proof.parameters)}],
   sourceFields:[['text']],sourceId:entity.provenance.sourceId,provenance:clone(entity.provenance)};
  // Native dice-valued presence is not a numeric executable grant.
  book.rosterAbilityReferences[fact.id]??={id:fact.id,title:fact.title,parameters:{},provenance:clone(fact.provenance)};
  nativeAbilities.push({...clone(proof),status:'EXECUTABLE_PROVEN',scope:'MODEL'});
 }
 for(const proof of review.invulnerablePanels){
  const entity=index.get(proof.id);assert.equal(entity.parentId,proof.ownerId);assert.deepEqual(entity.provenance,proof.provenance);
  for(const [key,value]of Object.entries(proof.data))assert.deepEqual(entity.data[key],value);
  assert.equal(entity.data.conditionText,'');
  for(const id of proof.data.sourceProfileIds){
   const profile=index.get(id);assert.equal(profile?.kind,'PROFILE');assert.equal(profile.parentId,proof.ownerId);
   assert.equal(profile.data.invulnerableSaveId,entity.id);
   profile.data.stats.INSV=proof.data.value;
   nativeProfiles.push({id:entity.id,profileId:id,ownerId:proof.ownerId,value:proof.data.value,
    provenance:clone(entity.provenance),status:'EXECUTABLE_PROVEN'});
  }
 }
 return {nativeAbilities,nativeProfiles,invulnerablePanels:review.invulnerablePanels.length};
}

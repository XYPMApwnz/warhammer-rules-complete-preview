/** Focused source/native physical projection checks; constructed diagnostic rows. */
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {bindNativeAbilities,bindNativeBaseProfiles,nativeAbilityReview,nativeInvulnerableReview,bindNativeKeywords,nativeKeywordReview} from './native-ability-bindings.mjs';
import {createRosterRuntime} from '../../shared/roster-v2/runtime.mjs';
import {buildAttachmentFeasibility} from '../../shared/roster-v2/compatibility-feasibility.mjs';
import {createRuleContractSchema} from '../../shared/rule-contract-v2/schema.mjs';
import {projectAbilityPresentation,abilityPresentationLabel} from '../../shared/army-book-app-v2/ability-presentation.mjs';
const clone=structuredClone,read=name=>JSON.parse(fs.readFileSync(new URL(name,import.meta.url),'utf8'));
const native=read('./generated/native-book.json'),facts=read('./generated/effective.json');
const index=new Map(native.entities.map(e=>[e.id,e]));
const book=clone(native),initial=JSON.stringify(native),keywords=bindNativeKeywords(book),result=bindNativeAbilities(book),base=bindNativeBaseProfiles(book);
assert.equal(keywords.bindings.length,26);assert.equal(keywords.unresolved.length,26);
assert.equal(JSON.stringify(native),initial,'Factual/presentation owner mutated');
assert.equal(result.review.length,232);assert.equal(result.bindings.length,73);assert.equal(result.unsupported.length,159);
assert.equal(base.bindings.length,36);assert.equal(base.unsupported.length,1);
// Independently read accepted source DOM for all source clauses/tooltip pointers.
const python='C:/Users/denis/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe';
const script=`import json,sys,hashlib\nfrom lxml import html\nf=json.load(sys.stdin); t=html.parse(f['raw']); out=[]\nfor r in f['records']:\n n=t.xpath(r['sourcePointer'])[0];out.append({'id':r['id'],'text':' '.join(n.text_content().split()),'tooltip':n.get('data-tooltip-content')})\nprint(json.dumps(out))`;
const raw=fileURLToPath(new URL('./sources/raw/wahapedia-datasheets-probe.html',import.meta.url));
const parsed=spawnSync(python,['-X','utf8','-c',script],{input:JSON.stringify({raw,records:nativeAbilityReview}),encoding:'utf8'});
assert.equal(parsed.status,0,parsed.stderr);
for(const row of JSON.parse(parsed.stdout)){
 const proof=nativeAbilityReview.find(e=>e.id===row.id);assert.equal(row.text,proof.quote);assert.equal(row.tooltip,proof.sourceTooltip);
}
assert.equal(createHash('sha256').update(fs.readFileSync(raw)).digest('hex').toUpperCase(),nativeAbilityReview[0].sourceSha256);
const keywordScript=`import json,sys
from lxml import html
f=json.load(sys.stdin);t=html.parse(f['raw']);out=[]
for r in f['records']:
 n=t.xpath(r['sourcePointer'])[0];tokens=[]
 for s in n.xpath('.//span[@data-tooltip-content]'):
  classes=s.get('class','').split();tokens.append({'value':' '.join(s.text_content().split()),'pointer':t.getpath(s),'tooltip':s.get('data-tooltip-content'),'classes':classes,'conditional':'clFl' in classes})
 out.append({'id':r['id'],'text':' '.join(n.text_content().split()),'tokens':tokens})
print(json.dumps(out))`;
const keywordRaw=spawnSync(python,['-X','utf8','-c',keywordScript],{input:JSON.stringify({raw,records:nativeKeywordReview}),encoding:'utf8'});
assert.equal(keywordRaw.status,0,keywordRaw.stderr);
for(const row of JSON.parse(keywordRaw.stdout)){
 const proof=nativeKeywordReview.find(e=>e.id===row.id);assert.equal(row.text,proof.sourceText);assert.deepEqual(row.tokens,proof.tokens);
 const view=book.entities.find(e=>e.id===proof.id);
 assert.deepEqual(view.data.keywords,row.tokens.filter(t=>!t.conditional).map(t=>t.value));
 assert.ok(!view.data.keywords.includes('DEATHWING')&&!view.data.keywords.includes('RAVENWING'));
 assert.deepEqual(view.data.modelKeywordDeclarations,index.get(view.id).data.modelKeywordDeclarations);
}
book.rosterAttachmentPolicies=[];
book.rosterProfileBindings=book.entities.filter(e=>e.kind==='PROFILE').map(e=>({unitId:e.parentId,profileId:e.id,
 intrinsicKeywords:[...book.entities.find(u=>u.id===e.parentId).data.keywords,...index.get(e.parentId).data.factionKeywords]}));
const composition=book.rosterProfileBindings.map(row=>({...row,maxModels:1}));
book.compatibilityFeasibility=buildAttachmentFeasibility(book,composition);
const detachment=book.entities.find(e=>e.kind==='DETACHMENT').id;
const units=book.entities.filter(e=>e.kind==='DATASHEET').map(e=>({instanceId:'native/'+e.id,canonicalUnitId:e.id,
 startingStrength:e.data.profileIds.length,modelRows:e.data.profileIds.map((id,n)=>({rowId:id,canonicalProfileId:id,
  compositionScope:'MODEL_ROW',quantity:1,selections:n?[]:e.data.weaponIds.map(id=>({selectionKey:e.id+'/'+id,
   canonicalProfileIds:[id],canonicalEquipmentIds:[],perModelQuantity:1,physicalQuantity:1}))})),
 selections:[],enhancementIds:[],warlord:null}));
const fnp=result.bindings.find(e=>e.canonicalAbilityId==='core-feel-no-pain');
const repeat=clone(units.find(e=>e.canonicalUnitId===fnp.ownerId));repeat.instanceId='native/repeated';units.push(repeat);
const state={schema:'roster-v2/roster',bookId:'space-marines',rosterId:'native-source-diagnostic',detachmentIds:[detachment],
 detachments:[{instanceId:'det/one',canonicalDetachmentId:detachment}],units,attachments:[],warlordInstanceId:null};
const service=createRosterRuntime(book,createRuleContractSchema());service.load(state);
const projection=service.projection;
let modelChecks=0,weaponChecks=0;
for(const unit of projection.units){
 const source=index.get(unit.canonicalUnitId),refs=result.bindings.filter(ref=>ref.ownerId===source.id);
 for(const profile of unit.profiles){
  const expected=refs.map(ref=>ref.canonicalAbilityId==='core-feel-no-pain'?{name:'Feel No Pain',value:ref.parameters.value}:
   {canonicalId:ref.canonicalAbilityId,name:ref.quote,parameters:ref.parameters});
  assert.deepEqual([...profile.abilities].sort((a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b))),expected.sort((a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b))),'Native MODEL scope mismatch '+unit.instanceId);modelChecks++;
 }
 const effective=service.effective(unit.instanceId);
 const abilityView=projectAbilityPresentation({instanceId:unit.instanceId,
  profiles:effective.profiles,references:refs.map(ref=>({canonicalId:ref.canonicalAbilityId,parameters:ref.parameters,
   group:'CORE ABILITIES',label:ref.quote,...(ref.legacyValue?{legacyValue:true}:{})})),applied:effective.applied});
 for(const ref of refs)assert.ok(abilityView.core.some(a=>a.canonicalId===ref.canonicalAbilityId&&abilityPresentationLabel(a)===ref.quote),'Lost native presentation '+ref.id);
 assert.deepEqual(unit.metrics,{});assert.deepEqual(unit.applied,[],'Native source was mislabeled as granted modifier');
 for(const weapon of effective.weapons){
  assert.deepEqual(weapon.fields.find(f=>f.label==='abilities').value,index.get(weapon.id).data.abilities);weaponChecks++;
 }
}
for(const proof of nativeInvulnerableReview){
 const unit=projection.units.find(u=>u.canonicalUnitId===proof.ownerId);
 for(const profile of unit.profiles){
  const staticApplicable=(!proof.data.conditionText||proof.data.scopeQualification==='EXPLICIT_NAMED_MODEL')&&proof.data.sourceProfileIds.includes(profile.canonicalProfileId);
  if(staticApplicable)assert.equal(profile.profile.stats.INSV,proof.data.value);
  else if(!nativeInvulnerableReview.some(other=>other.ownerId===proof.ownerId&&other.data.sourceProfileIds.includes(profile.canonicalProfileId)&&other.data.scopeQualification==='EXPLICIT_NAMED_MODEL'))
   assert.equal(profile.profile.stats.INSV,undefined,'Conditional/named invulnerable leaked');
 }
}
for(const [id,keyword]of [['unit-sm-5ce71f2f4e5e4ebb','TERMINATOR'],['unit-sm-0b0b22ecffa74125','TACTICUS'],['unit-sm-80ac1421ce0f4de3','SPEEDER']]){
 const unit=projection.units.find(u=>u.canonicalUnitId===id);
 assert.ok(unit.keywords.includes(keyword));assert.ok(unit.profiles.every(p=>p.keywords.includes(keyword)));
 const schema=createRuleContractSchema(),context=service.context(unit.instanceId,'MODEL',unit.profiles[0].scopeId);
 assert.equal(schema.evaluatePredicate({predicate:'MODEL_KEYWORD',subject:'MODEL',contextLevel:'STATIC',arguments:{keyword}},context),'TRUE');
 for(const conditional of ['DEATHWING','RAVENWING'])assert.equal(schema.evaluatePredicate({predicate:'MODEL_KEYWORD',subject:'MODEL',contextLevel:'STATIC',arguments:{keyword:conditional}},context),'FALSE');
}
const saved=service.snapshot();service.load(saved);assert.deepEqual(service.projection,projection,'Native abilities accumulated');
// A physical attachment must not spread a native character's FNP to Bodyguards.
const leader=state.units.find(u=>u.canonicalUnitId===fnp.ownerId),bodyguard=state.units.find(u=>u.canonicalUnitId!==fnp.ownerId&&!result.bindings.some(r=>r.ownerId===u.canonicalUnitId&&r.canonicalAbilityId==='core-feel-no-pain'));
const attachedBook=clone(book);attachedBook.rosterAttachmentPolicies=[{sourceId:leader.canonicalUnitId,targetId:bodyguard.canonicalUnitId,
 role:'LEADER',additionalLeaders:0,sourceIds:[fnp.id]}];
attachedBook.compatibilityFeasibility=buildAttachmentFeasibility(attachedBook,composition);
const attached=createRosterRuntime(attachedBook,createRuleContractSchema());attached.load(state);attached.attach(leader.instanceId,bodyguard.instanceId);
assert.ok(attached.projection.units.find(u=>u.instanceId===bodyguard.instanceId).profiles.every(p=>!p.abilities.some(a=>a.name==='Feel No Pain')));
attached.detach(leader.instanceId);assert.deepEqual(attached.projection,projection);
let mutations=0;
for(const mutate of [b=>b.entities.splice(b.entities.findIndex(e=>e.id===fnp.id),1),
 b=>b.entities.find(e=>e.id===fnp.id).data.label='Feel No Pain 4+',
 b=>b.entities.find(e=>e.id===fnp.id).parentId=bodyguard.canonicalUnitId,
 b=>b.entities.find(e=>e.id===fnp.id).provenance.pointer+='[2]',
 b=>b.entities.find(e=>e.id===fnp.ownerId).data.profileIds=[bodyguard.modelRows[0].canonicalProfileId]]){
 const candidate=clone(native);mutate(candidate);assert.throws(()=>bindNativeAbilities(candidate));mutations++;
}
for(const mutate of [b=>delete b.rosterReferenceSemantics[fnp.id],b=>b.rosterReferenceSemantics[fnp.id].abilities[0].value=4]){
 const candidate=clone(book);mutate(candidate);const runtime=createRosterRuntime(candidate,createRuleContractSchema());runtime.load(state);
 assert.throws(()=>assert.deepEqual(runtime.projection,projection));mutations++;
}
const inv=nativeInvulnerableReview.find(row=>!row.data.conditionText);
for(const mutate of [b=>b.entities.find(e=>e.id===inv.id).data.value='2+',
 b=>b.entities.find(e=>e.id===inv.id).data.sourceProfileIds=[bodyguard.modelRows[0].canonicalProfileId],
 b=>delete b.entities.find(e=>e.id===inv.data.sourceProfileIds[0]).data.invulnerableSaveId]){
 const candidate=clone(native);mutate(candidate);assert.throws(()=>bindNativeBaseProfiles(candidate));mutations++;
}
for(const mutate of [b=>b.entities.splice(b.entities.findIndex(e=>e.id===nativeKeywordReview[0].id),1),
 b=>b.entities.find(e=>e.id===nativeKeywordReview[0].id).data.keywords.push('DEATHWING'),
 b=>b.entities.find(e=>e.id===nativeKeywordReview[0].id).provenance.pointer+='[2]']){
 const candidate=clone(native);mutate(candidate);assert.throws(()=>bindNativeKeywords(candidate));mutations++;
}
for(const mutate of [b=>b.entities.find(e=>e.id==='unit-sm-5ce71f2f4e5e4ebb').data.keywords.splice(-1,1),
 b=>b.entities.find(e=>e.id==='unit-sm-5ce71f2f4e5e4ebb').data.keywords.push('DEATHWING')]){
 const candidate=clone(book);mutate(candidate);assert.throws(()=>bindNativeKeywords(candidate));mutations++;
}
const reverse=clone(native);reverse.entities.reverse();assert.deepEqual(bindNativeKeywords(reverse),keywords);assert.deepEqual(bindNativeAbilities(reverse),result);assert.deepEqual(bindNativeBaseProfiles(reverse),base);
for(const e of facts.entities.filter(e=>e.kind==='MODEL_PROFILE'))assert.deepEqual(index.get(e.id).data.stats,e.data.stats,'Accepted MODEL stats changed');
console.log(JSON.stringify({status:'PASS',reviewedReferences:232,nativeCoreOccurrences:73,textOnlyReferences:159,
 nativeFnp:6,staticInvulnerableRecords:33,staticInvulnerableModelBindings:36,conditionalInvulnerableRecords:1,physicalUnits:86,modelChecks,weaponChecks,
 sourceDOMReferences:232,sourceDOMKeywordRecords:26,conditionalKeywordsNotGranted:26,mutations,deterministic:true,recompute:true,bodyguardIsolation:true,
 browser:'NOT_RUN',constructedPhysicalFixture:true}));

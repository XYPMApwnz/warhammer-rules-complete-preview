/** Independent Stage 3B evidence checks. Fixtures are constructed physical
 * snapshots; diagnostic attachment policies prove isolation, not eligibility.
 * No New Recruit format, browser acceptance or unavailable Chapter is claimed. */
import fs from 'node:fs';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {buildDarkAngelsContracts} from './rule-contract-build.mjs';
import {resolvePhysicalChapterContexts} from './physical-chapter.mjs';
import {createDarkAngelsRosterRuntime} from './roster-runtime.mjs';
import {createDarkAngelsRuleSchema} from './rule-contract-schema.mjs';
import {commitRosterImport} from '../../shared/roster-v2/runtime.mjs';
import {changeAttachment} from '../../shared/roster-v2/context.mjs';
import {buildAttachmentFeasibility} from '../../shared/roster-v2/compatibility-feasibility.mjs';

const read=name=>JSON.parse(fs.readFileSync(new URL(name,import.meta.url),'utf8'));
const clone=structuredClone;
const DA='DARK ANGELS',PROVEN='CHAPTER_CONTEXT_PROVEN',UNKNOWN='CHAPTER_CONTEXT_NOT_PROVEN';
const RAW_SHA='66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D';
const DEFINITION_SHA='DD7420597CCC235859B9326F146964746EFFBC8A48752DA4D622BC99DEE1BED7';
const DEFINITION='army-rule-sm-0fc8f686c793466d';
// Independently reviewed source addresses, not generated runtime expectations.
const SOURCE_POINTERS={
 'unit-da-0e189995095847bf9d47':'/div[6]/div[4]',
 'unit-da-1f093db4ae584ac19636':'/div[26]/div[6]',
 'unit-da-4649795c02b646809e13':'/div[18]/div[4]',
 'unit-da-467009b00bb9402dadee':'/div[12]/div[6]',
 'unit-da-48fe8c59ed2449e1a36b':'/div[32]/div[24]',
 'unit-da-4d0a2295a562420599b3':'/div[4]/div[4]',
 'unit-da-6b2744f187a748cda0df':'/div[24]/div[50]',
 'unit-da-8bdfb4e3460d4ed9926a':'/div[18]/div[2]',
 'unit-da-955db164dd7144368578':'/div[2]/div[54]',
 'unit-da-9579698010884b4bae95':'/div[32]/div[26]',
 'unit-da-9f8f2ccbdb7d4c72857c':'/div[24]/div[48]',
 'unit-da-a1d3821fd56946f0951d':'/div[24]/div[46]',
 'unit-da-d711371794d441bf92a8':'/div[2]/div[48]',
 'unit-da-efa93d33ea414d8b8f11':'/div[2]/div[56]',
 'unit-da-f1f33dda5c5047efb013':'/div[2]/div[52]',
 'unit-da-f8f0629206e744459a9f':'/div[2]/div[50]'
};
const hash=bytes=>crypto.createHash('sha256').update(bytes).digest('hex').toUpperCase();
const strip=text=>text.replace(/<[^>]+>/g,' ').replace(/&nbsp;/g,' ').replace(/\s+/g,' ').trim();

export function runPhysicalChapterQA(built=buildDarkAngelsContracts()){
 const {book}=built,index=new Map(book.entities.map(row=>[row.id,row]));
 const facts=read('./generated/effective.json'),sm=read('../../space-marines/v2/generated/effective.json');
 const source=new Map([...facts.entities,...sm.entities].map(row=>[row.id,row]));
 const conditions=read('./chapter-conditions.json'),membership=read('./inherited-sm-references.json');
 const originalFacts=JSON.stringify([facts,sm,conditions,membership]);
 const checks=[],negativeControls=[],physicalEvidence=[],sourceEvidence=[];
 const check=(id,fn)=>{fn();checks.push({id,status:'PASS'});};
 const reject=(id,fn)=>{assert.throws(fn,undefined,id);negativeControls.push(id);};
 const units=book.entities.filter(row=>row.kind==='DATASHEET');
 const det=book.entities.find(row=>row.kind==='DETACHMENT'&&row.bookId==='dark-angels').id;
 const darkflight='detachment-da-d7c1a2b23f2e443aa22a';
 const common=conditions.records[0].recipient.canonicalId;
 const azrael='unit-da-f8f0629206e744459a9f',sammael='unit-da-0e189995095847bf9d47';
 const physical=(instanceId,id,{weapons=false}={})=>{
  const entity=index.get(id);assert.equal(entity?.kind,'DATASHEET');
  const modelRows=entity.data.profileIds.map((profileId,n)=>({rowId:'row-'+n,canonicalProfileId:profileId,quantity:1,
   compositionScope:'MODEL_ROW',selections:weapons?entity.data.weaponIds.map((weaponId,w)=>({selectionKey:`${instanceId}/${n}/w/${w}`,
    canonicalProfileIds:[weaponId],canonicalEquipmentIds:[],physicalQuantity:1,perModelQuantity:1})):[]}));
  return {instanceId,canonicalUnitId:id,startingStrength:modelRows.length,modelRows,selections:[],enhancementIds:[],warlord:null};
 };
 const roster=(entries,detachment=det)=>({schema:'roster-v2/roster',bookId:'dark-angels',rosterId:'stage3b-independent-physical',
  detachments:[{instanceId:'detachment',canonicalDetachmentId:detachment}],detachmentIds:[detachment],units:entries,attachments:[],warlordInstanceId:null});
 const assertProof=(row,id,instance)=>{
  assert.equal(row.instanceId,instance);assert.equal(row.canonicalUnitId,id);assert.equal(row.sourceOwner,source.get(id).bookId);
  const known=Object.hasOwn(SOURCE_POINTERS,id);assert.equal(row.status,known?PROVEN:UNKNOWN);assert.equal(row.chapter,known?DA:null);
  assert.ok(Array.isArray(row.sourceReferences));if(known)assert.ok(row.sourceReferences.length,'Missing source attribution');
 };
 check('independent-accepted-raw-chapter-definition-and-sixteen-panels',()=>{
  const raw=fs.readFileSync(new URL('./sources/raw/wahapedia-datasheets.html',import.meta.url));assert.equal(hash(raw),RAW_SHA);
  const definitionRaw=fs.readFileSync(new URL('../../space-marines/v2/sources/raw/wahapedia-space-marines-main.html',import.meta.url));
  assert.equal(hash(definitionRaw),DEFINITION_SHA);
  const definition=source.get(DEFINITION);assert.equal(definition.bookId,'space-marines');
  assert.ok(definition.data.text.includes('If an ADEPTUS ASTARTES unit has a second Faction keyword on its datasheet, that Faction keyword is the name of that unit’s Chapter.'));
  assert.ok(strip(definitionRaw.toString()).includes('Faction keyword is the name of that unit’s Chapter.'));
  const text=raw.toString();
  for(const [id,suffix]of Object.entries(SOURCE_POINTERS)){
   const entity=source.get(id);assert.equal(entity.kind,'DATASHEET');assert.equal(entity.bookId,'dark-angels');
   assert.deepEqual(entity.data.factionKeywords,['ADEPTUS ASTARTES',DA]);
   const pointer='/html/body/div/div[1]/div[3]'+suffix;assert.equal(entity.provenance.pointer,pointer);assert.equal(entity.provenance.sha256,RAW_SHA);
   const start=text.indexOf('id="'+entity.data.sourceAnchor+'"');assert.ok(start>=0);
   const tail=text.slice(start),panel=tail.match(/FACTION KEYWORDS:([\s\S]*?)<\/div>/);assert.ok(panel);
   assert.equal(strip(panel[0]),'FACTION KEYWORDS: ADEPTUS ASTARTES ; DARK ANGELS');
   sourceEvidence.push({canonicalUnitId:id,sourceEntityId:entity.sourceEntityId,sourceOwner:entity.bookId,
    document:entity.provenance.document,sha256:RAW_SHA,pointer:pointer+'/div[3]/div[2]',definitionId:DEFINITION,status:'SOURCE_PROVEN'});
  }
 });
 check('all-eighty-three-source-owned-members-and-physical-contexts',()=>{
  assert.equal(units.length,83);assert.equal(Object.keys(SOURCE_POINTERS).length,16);
  const inherited=units.filter(row=>row.bookId==='space-marines');assert.equal(inherited.length,67);
  for(const entity of inherited)assert.deepEqual(source.get(entity.id).data.factionKeywords,['ADEPTUS ASTARTES']);
  const state=roster(units.map((entity,n)=>physical('physical-'+n,entity.id))),runtime=createDarkAngelsRosterRuntime(built);
  runtime.load(state);const contexts=resolvePhysicalChapterContexts(book,state);assert.equal(contexts.length,83);
  for(const unit of state.units){
   const row=contexts.find(row=>row.instanceId===unit.instanceId);assertProof(row,unit.canonicalUnitId,unit.instanceId);
   assert.equal(row.sourceReferences[0].canonicalId,unit.canonicalUnitId);assert.deepEqual(row.sourceReferences[0].provenance,source.get(unit.canonicalUnitId).provenance);
   if(row.status===PROVEN){assert.equal(row.sourceReferences[0].path,'/factionKeywords/1');assert.equal(row.sourceReferences[1].canonicalId,DEFINITION);
    assert.deepEqual(row.sourceReferences[1].provenance,source.get(DEFINITION).provenance);}
   assert.deepEqual(runtime.chapterContext(unit.instanceId),row);
   const context=runtime.context(unit.instanceId,'UNIT');assert.equal(context.roster.daChapterContextStatus,row.status);
   assert.equal(context.roster.daPhysicalChapter,row.chapter??undefined);
   physicalEvidence.push({...row});
  }
 });
 check('forged-canonical-chapter-metadata-is-rejected-not-promoted',()=>{
  const state=roster([physical('fixed',azrael),physical('generic',common)]);
  const variants=[
   ['wrong-source-owner',value=>value.rosterChapterBindings.known[0].sourceOwner='space-marines'],
   ['wrong-source-identity',value=>value.rosterChapterBindings.known[0].sourceEntityId='invented-source'],
   ['wrong-source-provenance',value=>value.rosterChapterBindings.known[0].provenance.sha256='00'],
   ['wrong-chapter',value=>value.rosterChapterBindings.known[0].chapter='BLOOD ANGELS'],
   ['wrong-faction-field',value=>value.entities.find(row=>row.id===azrael).data.factionKeywords=['ADEPTUS ASTARTES','BLOOD ANGELS']],
   ['missing-membership-proof',value=>value.rosterChapterBindings.known.pop()]
  ];
  for(const [id,mutate]of variants){const malformed=clone(book);mutate(malformed);reject(id,()=>resolvePhysicalChapterContexts(malformed,state));}
 });
 check('twenty-six-source-conditions-have-no-proven-generic-chapter',()=>{
  assert.equal(conditions.records.length,26);assert.equal(conditions.records.filter(row=>row.grantedKeywords.includes('DEATHWING')).length,18);
  assert.equal(conditions.records.filter(row=>row.grantedKeywords.includes('RAVENWING')).length,8);
  const state=roster(conditions.records.flatMap((row,n)=>[physical('recipient-'+n,row.recipient.canonicalId),physical('peer-'+n,row.recipient.canonicalId)]));
  const runtime=createDarkAngelsRosterRuntime(built);runtime.load(state);
  for(const unit of state.units){assertProof(runtime.chapterContext(unit.instanceId),unit.canonicalUnitId,unit.instanceId);
   const projected=runtime.projection.units.find(row=>row.instanceId===unit.instanceId);
   for(const keyword of ['DEATHWING','RAVENWING']){assert.ok(!projected.keywords.includes(keyword));assert.ok(projected.profiles.every(model=>!model.keywords.includes(keyword)));}
   assert.ok(!projected.applied.some(row=>row.operation==='GRANT_UNIT_KEYWORD'&&['DEATHWING','RAVENWING'].includes(row.keyword)));
  }
 });
 check('untrusted-claims-faction-owner-and-field-extras-cannot-prove-chapter',()=>{
  for(const claimed of ['DARK ANGELS','BLOOD ANGELS']){
   const state=roster([physical('a',common),physical('b',common),physical('fixed',azrael)]);
   state.importEvidence={faction:claimed};Object.assign(state.units[0],{chapter:claimed,chapterConfirmed:true,sourceOwner:'dark-angels',
    chapterEvidence:{sourceId:'forged',canonicalUnitId:common},daPhysicalChapter:claimed,daChapterContextStatus:PROVEN});
   const runtime=createDarkAngelsRosterRuntime(built);runtime.load(state);assert.equal(runtime.chapterContext('a').status,UNKNOWN);assert.equal(runtime.chapterContext('b').status,UNKNOWN);
   assert.equal(runtime.chapterContext('fixed').chapter,DA);
   const extra={daPhysicalChapter:DA,daChapterContextStatus:PROVEN};const context=runtime.context('a','UNIT',undefined,extra);
   assert.equal(context.roster.daPhysicalChapter,undefined);assert.equal(context.roster.daChapterContextStatus,UNKNOWN);
   const schema=createDarkAngelsRuleSchema({book,state});
   const predicate={predicate:'FIELD',subject:'UNIT',contextLevel:'ROSTER',arguments:{key:'daPhysicalChapter',equals:DA}};
   const forged={...context,roster:{...context.roster,...extra}};
   assert.notEqual(schema.evaluatePredicate(predicate,forged),'TRUE');
  }
 });
 check('same-canonical-independent-units-recompute-reload-and-canonical-replacement',()=>{
  const state=roster([physical('a',azrael),physical('b',azrael),physical('c',common)]),runtime=createDarkAngelsRosterRuntime(built);
  runtime.load(state);assertProof(runtime.chapterContext('a'),azrael,'a');assertProof(runtime.chapterContext('b'),azrael,'b');
  const snapshot=runtime.snapshot(),before=runtime.projection;runtime.recompute();assert.deepEqual(runtime.projection,before);
  runtime.load(JSON.parse(JSON.stringify(snapshot)));assert.deepEqual(runtime.projection,before);
  const replacement=clone(snapshot);replacement.units[0]=physical('a',common);runtime.load(replacement);
  assertProof(runtime.chapterContext('a'),common,'a');assertProof(runtime.chapterContext('b'),azrael,'b');
  const saved=runtime.snapshot(),projected=runtime.projection,invalid=clone(saved);invalid.units[0].modelRows[0].canonicalProfileId='unknown-profile';
  reject('invalid-load-does-not-replace-physical-context',()=>runtime.load(invalid));assert.deepEqual(runtime.snapshot(),saved);assert.deepEqual(runtime.projection,projected);
  const foreignSource=sm.entities.find(entity=>entity.kind==='DATASHEET'&&!index.has(entity.id)&&entity.data.factionKeywords.includes('ULTRAMARINES'));
  assert.ok(foreignSource,'Missing real excluded Chapter source control');
  const foreign=clone(saved);foreign.units[0].canonicalUnitId=foreignSource.id;
  reject('foreign-chapter-canonical-is-not-consumer-member',()=>runtime.load(foreign));assert.deepEqual(runtime.snapshot(),saved);
  const unknown=clone(saved);unknown.units[0].canonicalUnitId='unknown-unit';reject('unknown-canonical-reference',()=>resolvePhysicalChapterContexts(book,unknown));
 });
 check('diagnostic-leader-support-attachment-is-not-component-chapter-evidence',()=>{
  for(const role of ['LEADER','SUPPORT']){
   const diagnostic=clone(book);diagnostic.rosterAttachmentPolicies=[{sourceId:azrael,targetId:common,role,sourceIds:[source.get(azrael).data.relationIds[0]],additionalLeaders:0}];
   diagnostic.compatibilityFeasibility=buildAttachmentFeasibility(diagnostic,units.flatMap(unit=>unit.data.profileIds.map(profileId=>({
    unitId:unit.id,profileId,maxModels:1,intrinsicKeywords:diagnostic.rosterProfileBindings.find(binding=>binding.profileId===profileId).intrinsicKeywords}))));
   const runtime=createDarkAngelsRosterRuntime({...built,book:diagnostic});
   const detached=roster([physical('character',azrael),physical('bodyguard',common)]);runtime.load(detached);
   const attached=changeAttachment(diagnostic,runtime.snapshot(),diagnostic.rosterAttachmentPolicies,'ATTACH','character','bodyguard');runtime.load(attached);
   assertProof(runtime.chapterContext('bodyguard'),common,'bodyguard');assertProof(runtime.chapterContext('character'),azrael,'character');
   assert.equal(runtime.context('bodyguard','UNIT').roster.daChapterContextStatus,UNKNOWN);
   assert.ok(runtime.projection.formedUnits[0].keywords.includes(DA),'Diagnostic formed union expected');
   const candidate=runtime.snapshot();candidate.attachments=[];
   assert.equal(commitRosterImport({status:'READY',roster:candidate},runtime.snapshot(),state=>runtime.load(state)).status,'READY');
   assert.equal(runtime.snapshot().attachments.length,1);assert.equal(runtime.chapterContext('bodyguard').status,UNKNOWN);
   const next=changeAttachment(diagnostic,runtime.snapshot(),diagnostic.rosterAttachmentPolicies,'DETACH','character');runtime.load(next);
   assert.equal(runtime.chapterContext('bodyguard').status,UNKNOWN);
   runtime.load(changeAttachment(diagnostic,runtime.snapshot(),diagnostic.rosterAttachmentPolicies,'ATTACH','character','bodyguard'));
   runtime.recompute();assert.equal(runtime.chapterContext('bodyguard').status,UNKNOWN);
  }
 });
 check('native-model-eligibility-cannot-use-forged-chapter-or-unit-keywords',()=>{
  const state=roster([physical('fixed',azrael),physical('generic',common)]);
  Object.assign(state.units[1],{chapter:DA,chapterConfirmed:true,keywords:['DEATHWING'],modelKeywords:['DEATHWING']});
  for(const row of state.units[1].modelRows)row.keywords=['DEATHWING'];
  const runtime=createDarkAngelsRosterRuntime(built);runtime.load(state);const schema=createDarkAngelsRuleSchema({book,state});
  const selector=index.get('enhancement-da-4e1c055c3dfe4754bd0c').ruleContract.assignment.selector;
  for(const [instance,expected]of [['fixed','TRUE'],['generic','FALSE']]){
   const projected=runtime.projection.units.find(row=>row.instanceId===instance),scope=projected.profiles[0].scopeId;
   const context=runtime.context(instance,'MODEL',scope,{daPhysicalChapter:DA,daChapterContextStatus:PROVEN});
   assert.equal(context.roster.daPhysicalChapter,undefined,'UNIT Chapter field escaped into MODEL scope');
   assert.equal(schema.evaluatePredicate(selector,context),expected);
  }
 });
 check('shared-reimport-candidate-boundary-retains-or-replaces-proof-atomically',()=>{
  const runtime=createDarkAngelsRosterRuntime(built),state=roster([physical('a',azrael),physical('b',common)]);runtime.load(state);
  const load=candidate=>runtime.load(candidate),ready=roster=>({status:'READY',roster});
  const before=runtime.snapshot();assert.equal(commitRosterImport(ready(clone(before)),before,load).status,'READY');assertProof(runtime.chapterContext('a'),azrael,'a');
  const changed=clone(before);changed.units[0]=physical('a',common);
  assert.equal(commitRosterImport(ready(changed),runtime.snapshot(),load).status,'REPLACEMENT_REQUIRED');assert.deepEqual(runtime.snapshot(),before);
  assert.equal(runtime.chapterContext('a').status,PROVEN);
  assert.equal(commitRosterImport(ready(changed),runtime.snapshot(),load,{replaceExisting:true}).status,'READY');assert.equal(runtime.chapterContext('a').status,UNKNOWN);
  const saved=runtime.snapshot();assert.equal(commitRosterImport({status:'NEEDS_BINDINGS',roster:null},saved,load).status,'NEEDS_BINDINGS');assert.deepEqual(runtime.snapshot(),saved);
 });
 check('darkflight-valid-da-army-applies-to-generic-ravenwing-fly',()=>{
  const flyer=conditions.records.find(row=>row.grantedKeywords.includes('RAVENWING')&&index.get(row.recipient.canonicalId).data.keywords.includes('FLY'));assert.ok(flyer);
  const state=roster([physical('fixed',sammael,{weapons:true}),physical('generic',flyer.recipient.canonicalId,{weapons:true})],darkflight);
  Object.assign(state.units[1],{chapter:DA,chapterConfirmed:true,keywords:['RAVENWING','FLY']});
  const runtime=createDarkAngelsRosterRuntime(built);runtime.load(state);
  const weapons=unit=>[...unit.weapons,...unit.profiles.flatMap(model=>model.weapons)].filter(weapon=>weapon.data.mode==='ranged');
  const fixed=runtime.projection.units.find(row=>row.instanceId==='fixed'),generic=runtime.projection.units.find(row=>row.instanceId==='generic');
  assert.ok(weapons(fixed).length);assert.ok(weapons(fixed).every(weapon=>weapon.data.abilities.includes('IGNORES COVER')));
  assert.ok(generic.keywords.includes('RAVENWING'));
  assert.ok(weapons(generic).length);assert.ok(weapons(generic).every(weapon=>weapon.data.abilities.includes('IGNORES COVER')));
  assert.ok(generic.applied.some(trace=>trace.ruleId==='detachment-rule-da-6a259c00bc9f4bf498ee'));
  assert.equal(runtime.chapterContext('generic').chapter,null,'Army applicability must not assign a Chapter');
  assert.equal(runtime.chapterContext('generic').armyApplicability.physicalAnchors[0].instanceId,'fixed');
  runtime.recompute();assert.deepEqual(runtime.projection.units.find(row=>row.instanceId==='fixed').applied,fixed.applied);
 });
 check('source-facts-unchanged-grants-require-reviewed-army-applicability',()=>{
  assert.equal(JSON.stringify([facts,sm,conditions,membership]),originalFacts);
  for(const condition of conditions.records){assert.equal(condition.runtimeActive,true);assert.equal(condition.recipient.sourceOwner,'space-marines');
   assert.deepEqual(source.get(condition.recipient.canonicalId).provenance,condition.recipient.provenance);}
  const grants=book.entities.flatMap(entity=>(entity.ruleContract?.clauses||[]).flatMap(clause=>clause.rosterEffects||[]))
   .filter(effect=>effect.operation==='GRANT_UNIT_KEYWORD'&&['DEATHWING','RAVENWING'].includes(effect.keyword));
  assert.equal(grants.length,6);assert.ok(grants.every(effect=>effect.unitScope==='PHYSICAL'&&effect.conditions.some(condition=>
   condition.predicate.arguments?.key==='daArmyMembershipProven')));
 });
 return {status:'PASS',checks,negativeControls,sourceEvidence,physicalEvidence,
  counts:{checks:checks.length,negativeControls:negativeControls.length,physicalMembership:83,intrinsicChapterProven:16,inheritedChapterNotProven:67,
   deathwingProven:18,ravenwingProven:8,activeConditionalChapterGrants:26},
  chapterGrantDisposition:'CONDITIONAL_VALIDATED_DA_ARMY_MEMBERSHIP; GENERIC_ONLY_UNKNOWN',
  limitations:{fixtures:'CONSTRUCTED_DIAGNOSTIC_SNAPSHOTS',attachmentPolicies:'DIAGNOSTIC_SCOPE_ONLY_NOT_SOURCE_ELIGIBILITY',
   reimport:'EXISTING_SHARED_CANDIDATE_COMMIT_BOUNDARY_ONLY_NOT_DA_IMPORTER',realNewRecruitExportTested:false,browserVerified:false}};
}
if(process.argv[1]===fileURLToPath(import.meta.url))console.log(JSON.stringify(runPhysicalChapterQA(),null,2));

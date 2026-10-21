/** Keyword attribution follows recorded effects, never titles or keyword-value guesses.
 * Synthetic traces exercise presentation boundaries; native controls below use
 * existing source-owned contracts and constructed physical selections. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {projectEffectiveInstance} from '../roster-v2/effective-instance.mjs';
import {projectInstanceCards,projectPersonalBook} from './personal.mjs';
import {createSyntheticPersonalFixture} from './personal-datasheet-qa.mjs';
import {createDGRosterRuntime} from '../../death-guard/v2/roster-boot.mjs';
import {createAdMechRosterRuntime} from '../../adeptus-mechanicus/v2/roster-runtime.mjs';
import {createSpaceMarinesRosterRuntime} from '../../space-marines/v2/roster-runtime.mjs';
import {createTauBrowserRoster} from '../../tau-empire/v2/roster-boot.mjs';
import {createTyranidsBrowserRoster} from '../../tyranids/v2/roster-boot.mjs';
const clone=structuredClone,read=p=>JSON.parse(fs.readFileSync(new URL(p,import.meta.url),'utf8'));
let checks=0,mutations=0;
function fixture(nested){
 const f=createSyntheticPersonalFixture('keyword-source-'+nested,nested),{id}=f;
 for(const entity of f.model.entities.filter(e=>e.kind==='DATASHEET'))Object.assign(entity.data,{title:entity.data.name,sectionIds:[],ruleReferenceIds:[],weaponIds:[],wargearOptionIds:[]});
 const rule=f.model.entities.find(e=>e.id===id('equipment-rule'));
 rule.provenance={sourceId:id('source')};
 const effect={id:id('effect'),operation:'GRANT_UNIT_KEYWORD',keyword:'GRANTED',targetSubject:'UNIT',unitScope:'PHYSICAL'};
 rule.ruleContract={clauses:[{id:'grant',rosterEffects:[effect]}]};
 const make=(unit,effective)=>({...clone(unit),intrinsicKeywords:['INFANTRY','SYNTHETIC'],keywords:[...effective.keywords],weapons:[],applied:[],conditional:[],
  profiles:effective.profiles.map(p=>({...clone(p),canonicalProfileId:p.id,profile:clone(f.model.entities.find(e=>e.id===p.id).data),intrinsicKeywords:[...p.keywords],weapons:[]}))});
 const raw=make(f.unit,f.effective),peer=make(f.duplicate.unit,f.duplicate.effective);
 raw.keywords.push('GRANTED');
 const trace={ruleId:rule.id,clauseId:'grant',effectId:effect.id,operation:effect.operation,field:'keywords',
  sourceInstanceId:raw.instanceId,targetInstanceId:raw.instanceId,targetModelInstanceId:null,targetProfileId:null,targetCompositionId:null,
  before:['INFANTRY'],after:['INFANTRY','GRANTED'],sourceFields:[['text']],lifetime:'ROSTER'};
 raw.applied.push(trace);
 return {...f,rule,effect,raw,peer,trace,projection:{units:[raw,peer],formedUnits:[]}};
}
for(const nested of [false,true]){
 const f=fixture(nested),before=clone(f.projection),effective=projectEffectiveInstance(f.model,f.projection,f.unit.instanceId);
 assert.equal(effective.keywordSources.length,1);assert.equal(effective.keywordSources[0].canonicalRuleId,f.rule.id);
 const card=projectInstanceCards(f.cards,f.unit,effective).get(f.unit.canonicalUnitId)[0];
 const granted=card.fields.filter(field=>field.value==='GRANTED');assert.equal(granted.length,1);
 assert.equal(granted[0].keywordSources[0].targetInstanceId,f.unit.instanceId);
 assert.ok(card.fields.filter(field=>field.value==='INFANTRY').every(field=>!field.keywordSources));
 assert.deepEqual(f.projection,before);assert.deepEqual(projectEffectiveInstance(f.model,clone(f.projection),f.unit.instanceId),effective);checks++;
 // Existing native keyword on an independent physical copy has no grant source.
 f.peer.keywords.push('GRANTED');
 assert.equal(projectEffectiveInstance(f.model,f.projection,f.peer.instanceId).keywordSources,undefined);checks++;
 // Later keyword removal cannot leave stale attribution.
 f.raw.keywords=f.raw.keywords.filter(word=>word!=='GRANTED');
 assert.equal(projectEffectiveInstance(f.model,f.projection,f.raw.instanceId).keywordSources,undefined);checks++;
 for(const alter of [x=>x.trace.effectId='missing',x=>x.trace.clauseId='missing',x=>x.trace.targetInstanceId=x.peer.instanceId,
  x=>x.effect.referencedRuleId='missing',x=>{x.effect.referencedRuleId=x.rule.id;x.effect.provenance={canonicalRuleId:'contradiction'};}]){
  const bad=fixture(nested);alter(bad);
  assert.throws(()=>projectEffectiveInstance(bad.model,bad.projection,bad.raw.instanceId),/keyword grant/);mutations++;
 }
}
{
 const f=fixture(true),profile=f.raw.profiles[0];
 Object.assign(f.effect,{operation:'GRANT_MODEL_KEYWORD',targetSubject:'MODEL'});delete f.effect.unitScope;
 Object.assign(f.trace,{operation:f.effect.operation,targetCompositionId:profile.scopeId,targetProfileId:profile.canonicalProfileId,targetModelInstanceId:profile.modelInstanceId});
 profile.keywords.push('GRANTED');
 const effective=projectEffectiveInstance(f.model,f.projection,f.raw.instanceId);
 const card=projectInstanceCards(f.cards,f.unit,effective).get(f.unit.canonicalUnitId)[0];
 const fields=card.fields.filter(field=>field.value==='GRANTED');assert.equal(fields.length,2,'UNIT union and exact MODEL group');
 assert.ok(fields.every(field=>field.keywordSources[0].targetCompositionId===profile.scopeId));
 assert.ok(!card.fields.some(field=>field.keywordSources?.some(source=>source.targetCompositionId===f.raw.profiles[1].scopeId)));checks++;
}
{
 const f=fixture(false);f.raw.formedUnitId=f.peer.formedUnitId='formed';f.peer.keywords.push('GRANTED');
 const other=clone(f.trace);other.sourceInstanceId=f.peer.instanceId;other.targetInstanceId=f.peer.instanceId;f.peer.applied.push(other);
 f.projection.formedUnits=[{formedUnitId:'formed',memberInstanceIds:[f.raw.instanceId,f.peer.instanceId],keywords:[...f.raw.keywords]}];
 const effective=projectEffectiveInstance(f.model,f.projection,f.raw.instanceId),card=projectInstanceCards(f.cards,f.unit,effective).get(f.unit.canonicalUnitId)[0];
 assert.deepEqual(card.fields.find(field=>field.value==='GRANTED').keywordSources.map(source=>source.targetInstanceId),[f.raw.instanceId,f.peer.instanceId]);checks++;
}
function physical(book,instanceId,canonicalUnitId,quantity=1){const e=book.entities.find(e=>e.id===canonicalUnitId);return {instanceId,canonicalUnitId,startingStrength:quantity,
 modelRows:[{rowId:'source-model',canonicalProfileId:e.data.profileIds[0],quantity,selections:[],loadouts:[]}],selections:[],equipmentContextKnown:false,enhancementIds:[],warlord:null};}
function state(book,det,units){return {schema:'roster-v2/roster',bookId:book.bookId,rosterId:'keyword-attribution-native',detachments:[{instanceId:'d',canonicalDetachmentId:det}],detachmentIds:[det],units,attachments:[],warlordInstanceId:null};}
function native(runtime,book,payload,s,keyword,origin){
 runtime.load(s);const saved=runtime.snapshot(),projection=clone(runtime.projection),effective=runtime.effective(s.units[0].instanceId);
 const sources=effective.keywordSources.filter(source=>source.keyword===keyword);assert.ok(sources.length);assert.ok(sources.every(source=>source.canonicalRuleId===origin));
 assert.ok(sources.every(source=>effective.applied.some(row=>row.ruleId===source.ruleId&&row.effectId===source.effectId&&row.targetInstanceId===source.targetInstanceId)));
 const unit=runtime.state.units[0],cards=new Map(payload.cards.map(card=>[card.id,card]));
 const card=projectInstanceCards(cards,unit,effective).get(unit.canonicalUnitId)[0];assert.ok(card.fields.some(field=>field.value===keyword&&field.keywordSources?.some(source=>source.canonicalRuleId===origin)));
 assert.ok(!runtime.effective(s.units[1].instanceId).keywordSources?.some(source=>source.keyword===keyword));
 assert.deepEqual(runtime.projection,projection);runtime.load(JSON.parse(JSON.stringify(saved)));assert.deepEqual(runtime.effective(unit.instanceId),effective);checks++;
 return effective;
}
{
 const b=read('../../death-guard/v2/generated/rule-contract-effective.json'),p=read('../../death-guard/v2/generated/app-presentation.json');
 const s=state(b,'detachment-contagion-engines',[physical(b,'selected','unit-foetid-bloat-drone'),physical(b,'peer','unit-poxwalkers',10)]);
 native(createDGRosterRuntime(b),b,p,s,'CONTAGION ENGINE','detachment-contagion-engines:rule');
}
{
 const b=read('../../adeptus-mechanicus/v2/generated/roster-runtime.json'),p=read('../../adeptus-mechanicus/v2/generated/app-presentation.json');
 const selected=physical(b,'selected','unit-archaeopter-fusilave'),peer=physical(b,'peer','unit-archaeopter-fusilave');
 selected.equipmentContextKnown=peer.equipmentContextKnown=true;
 selected.selections=[{selectionKey:'chaff',physicalQuantity:1,canonicalProfileIds:[],canonicalEquipmentIds:['datasheet-archaeopter-fusilave:section:1'],canonicalFieldPaths:{'datasheet-archaeopter-fusilave:section:1':['/blocks/1/text']}}];
 native(createAdMechRosterRuntime(b,read('../../adeptus-mechanicus/v2/roster-import-aliases.json')),b,p,state(b,'detachment-eradication-cohort',[selected,peer]),'SMOKE','datasheet-archaeopter-fusilave:section:1');
}
{
 const b=read('../../space-marines/v2/generated/roster-import.json'),p=read('../../space-marines/v2/generated/gameplay-presentation.json');
 native(createSpaceMarinesRosterRuntime(b),b,p,state(b,'detachment-sm-6341f5a9b9584677',[physical(b,'selected','unit-sm-70b477e461b5487a'),physical(b,'peer','unit-sm-59162946fee84360',5)]),'MOBILE','ability-sm-171a2821469d4d0e');
}
{
 const b=read('../../tau-empire/v2/generated/roster-import.json'),p=read('../../tau-empire/v2/generated/app-presentation.json'),runtime=createTauBrowserRoster(b);
 assert.equal(runtime.import(`+ FACTION KEYWORD: T’au Empire\n+ DETACHMENT: Mont'ka\n1x Commander In Coldstar Battlesuit (100 pts)\n• 1x Commander in Coldstar Battlesuit: 1x Marker Drone\n1x Commander In Coldstar Battlesuit (100 pts)\n• 1x Commander in Coldstar Battlesuit\n`).status,'READY');
 const e=native(runtime,b,p,runtime.snapshot(),'MARKERLIGHT','drone-marker-drone');
 assert.notEqual(e.keywordSources[0].canonicalRuleId,e.keywordSources[0].ruleId,'Canonical grant definition, not equipment-selection permission');
 assert.ok(e.keywordSources[0].effectProvenance.sourceEvidence);checks++;
 const snapshot=runtime.snapshot();
 assert.ok(projectPersonalBook(p,snapshot).allowedIds.has('drone-marker-drone'),'Canonical equipment source is readable without bypassing reference guards');checks++;
 for(const alter of [s=>s.physicalQuantity=0,s=>s.sourceEquipmentProvenance.sha256='foreign',s=>s.canonicalEquipmentIds=['missing'],s=>s.sourceEquipmentIdentity='drone-shield-drone']){
  const bad=clone(snapshot),selection=bad.units[0].modelRows[0].selections[0];alter(selection);
  assert.ok(!projectPersonalBook(p,bad).allowedIds.has('drone-marker-drone'));mutations++;
 }
}
{
 const b=read('../../tyranids/v2/generated/roster-runtime.json'),p=read('../../tyranids/v2/generated/app-presentation.json');
 const selected=physical(b,'selected','unit-tyranid-warriors-with-melee-bio-weapons',3),peer=physical(b,'peer','unit-termagants',10);
 for(const unit of [selected,peer]){
  unit.modelRows=b.entities.filter(entity=>entity.kind==='COMPOSITION_MEMBER'&&entity.parentId===unit.canonicalUnitId&&entity.data.quantity.min>0)
   .map(entity=>({rowId:entity.id,compositionMemberId:entity.id,canonicalProfileId:entity.data.modelProfileId,
    quantity:entity.data.quantity.min,selections:[],loadouts:[]}));
  unit.startingStrength=unit.modelRows.reduce((sum,row)=>sum+row.quantity,0);
 }
 for(const keyword of ['TYRANID WARRIORS','BATTLELINE'])native(createTyranidsBrowserRoster(b),b,p,
  state(b,'detachment-warrior-bioform-onslaught',[selected,peer]),keyword,'detachment-warrior-bioform-onslaught:rule');
}
console.log(JSON.stringify({status:'PASS',checks,mutations,syntheticAndNative:true,executorChanged:false,realNewRecruitExport:false}));

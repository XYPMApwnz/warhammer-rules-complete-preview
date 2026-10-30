import {parseSourceFixtureJSON,sourceFixture} from '../tests/helpers/source-refs-fixtures.mjs';
import {sourceSnapshot} from '../books/shared/source-refs-v2/source-refs.mjs';
/** Independent F1 source -> physical recipient -> effective/personal projection controls.
 * Constructed physical snapshots do not claim a real New Recruit export or battle simulation.
 * All mutations below are disposable in-memory inputs; accepted facts stay unchanged. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {createRuleContractSchema} from '../books/shared/rule-contract-v2/schema.mjs';
import {validateRoster,changeAttachment,withRosterDetachments} from '../books/shared/roster-v2/context.mjs';
import {executeRosterEffects,validateRosterEffects} from '../books/shared/roster-v2/effects.mjs';
import {projectEffectiveInstance} from '../books/shared/roster-v2/effective-instance.mjs';
import {detachmentTextDeclaration,projectConditionalRow} from '../books/shared/roster-v2/conditional-policy.mjs';
import {prepareRosterPresentationCards,projectFormedUnitCards,validateComponentDetachmentText} from '../books/shared/army-book-app-v2/personal.mjs';
import {decodeSourceText} from '../books/death-guard/v2/raw-source.mjs';
import * as dgSchema from '../books/death-guard/v2/rule-contract-schema.mjs';
import {createECRuleSchema} from '../books/emperors-children/v2/rule-contract-schema.mjs';
import {createSpaceMarinesRuleSchema} from '../books/space-marines/v2/rule-contract-schema.mjs';
import {createBloodAngelsRuleSchema} from '../books/blood-angels/v2/rule-contract-schema.mjs';
import {createDarkAngelsRuleSchema} from '../books/dark-angels/v2/rule-contract-schema.mjs';
import {createTauRuleSchema} from '../books/tau-empire/v2/rule-contract-schema.mjs';
import {createTyranidsRuleSchema} from '../books/tyranids/v2/roster-source-choices.mjs';

const root=fileURLToPath(new URL('../',import.meta.url)),clone=structuredClone;
const read=relative=>parseSourceFixtureJSON(fs.readFileSync(path.join(root,relative),'utf8'));
const normalize=value=>String(value).replace(/[‘’]/g,"'").replace(/\s+/g,' ').trim();
const files={
 'adeptus-mechanicus':'roster-runtime','death-guard':'rule-contract-effective','chaos-space-marines':'roster-runtime',
 'emperors-children':'roster-attachments','blood-angels':'roster-runtime','space-marines':'roster-runtime',
 'dark-angels':'roster-runtime','tau-empire':'roster-import','tyranids':'roster-runtime'
};
const books=new Map(Object.entries(files).map(([id,file])=>[id,read(`books/${id}/v2/generated/${file}.json`)]));
const entity=(book,id)=>{const value=book.entities.find(row=>row.id===id);assert.ok(value,'Missing independently named entity '+id);return value;};
const clause=(book,id,key)=>{const value=entity(book,id).ruleContract.clauses.find(row=>row.id===key);assert.ok(value,'Missing independently named clause '+id+'/'+key);return value;};
const forge='detachment-lords-of-the-forge:rule',halo='detachment-haloscreed-battle-clade:rule',fly='detachment-flyblown-host:rule';
const raiders='detachment-renegade-raiders:rule',mercurial='detachment-mercurial-host:rule',legacy='detachment-rule-ba-10c56bef78b24440bb5f';
const dominus='unit-tech-priest-dominus',rangers='unit-skitarii-rangers',servitors='unit-servitor-battleclade';
const underseer='datasheet-servitor-battleclade:profile:servitor-underseer',servitorModels='datasheet-servitor-battleclade:profile:combat-and-gun-servitors';
const checks=[],mutations=[],scenarios=[],sourceProof=[],failures=[];
const check=(id,run)=>{try{run();checks.push(id);}catch(error){failures.push({id,error:error.message,stack:error.stack});}};
function rejected(id,run){assert.throws(run,undefined,id+' escaped the independent observation');mutations.push(id);}

// Fixed source identities and quotes come from the accepted corpus, independently
// of recipient declarations. Enrollment byte hashes are verified before projection.
const sources=[
 {book:'adeptus-mechanicus',id:forge,file:'books/adeptus-mechanicus/sources/waha-11e-current-2026-09-25/corpus.json',sha:'B779FBC93DA3383AEDAE78A506750B6ACED8C84B2566187F171DFF717CC58D17',pointer:'/detachments/8/rule/text',quote:'Friendly TECH-PRIEST models have the following ability:'},
 {book:'adeptus-mechanicus',id:halo,file:'books/adeptus-mechanicus/sources/waha-11e-current-2026-09-25/corpus.json',sha:'B779FBC93DA3383AEDAE78A506750B6ACED8C84B2566187F171DFF717CC58D17',pointer:'/detachments/0/rule/text',quote:'In your Command phase, select one or more ADEPTUS MECHANICUS units from your army (including units that are embarked within TRANSPORTS).'},
 {book:'death-guard',id:fly,file:'books/death-guard/sources/waha-11e-current-2026-09-25/corpus.json',sha:'8DDC937999E6E84CCB9F149F385A477D91191549639F472A1995006BA9EC0FCF',pointer:'/detachments/8/rule/text',quote:'In the Declare Battle Formations step, you can select up to two friendly PLAGUE MARINES units.'},
 {book:'chaos-space-marines',id:raiders,file:'books/chaos-space-marines/sources/waha-11e-current-2026-09-29/chaos-space-marines.html',sha:'54E028296C063629F43E82A9ABA26943568DEE3AE819E36620F72DEC47529C4E',quote:'each time a HERETIC ASTARTES model from your army makes an attack that targets a unit within range of an objective marker, improve the Armour Penetration characteristic of that attack by 1.'},
 {book:'emperors-children',id:mercurial,file:'books/emperors-children/sources/waha-11e-current-2026-09-28/emperor-s-children.html',sha:'C668A60432C38E89FD30F8D6C48ECE3199D21355D5DF92272125D2FF62C98239',quote:'You can re-roll Advance rolls made for EMPEROR’S CHILDREN units from your army.'},
 {book:'blood-angels',id:legacy,file:'books/blood-angels/v2/sources/raw/wahapedia-blood-angels-main.html',sha:'1843A4B2841F7C404CEF7C1B797CFC4344F39B8063ADB236B1DF63A5F43332D4',quote:'Friendly BLOOD ANGELS CHARACTER units:'}
];
function hasEnrollment(value,file,sha){
 if(!value||typeof value!=='object')return false;
 if(value.path===file&&String(value.sha256).toUpperCase()===sha)return true;
 return Object.values(value).some(child=>Array.isArray(child)?child.some(item=>hasEnrollment(item,file,sha)):hasEnrollment(child,file,sha));
}
for(const expected of sources)check('source/'+expected.id,()=>{
 const raw=fs.readFileSync(path.join(root,expected.file));
 assert.equal(createHash('sha256').update(raw).digest('hex').toUpperCase(),expected.sha,'Accepted RAW bytes changed');
 const enrollment=read(`books/${expected.book}/v2/sources/${expected.book==='death-guard'?'source-enrollment':'enrollment'}.json`);
 assert.ok(hasEnrollment(enrollment,expected.file,expected.sha),'Source is not enrolled at the independent SHA');
 const text=expected.pointer?expected.pointer.slice(1).split('/').reduce((value,key)=>value[key],JSON.parse(raw)):
  decodeSourceText(raw.toString('utf8').replace(/<[^>]*>/g,' '));
 assert.ok(normalize(text).includes(normalize(expected.quote)),'Exact accepted recipient quote absent');
 const record=entity(books.get(expected.book),expected.id);
 assert.ok(sourceSnapshot(record)?.sourceId,'Canonical source identity missing');
 assert.ok(normalize(JSON.stringify(record.data)).includes(normalize(expected.quote).replace(/"/g,'\\"'))||
  Object.values(record.data).some(value=>typeof value==='string'&&normalize(value).includes(normalize(expected.quote))), 'Runtime rule lost accepted recipient quote');
 sourceProof.push({...expected});
});

function unit(book,id,instanceId,profiles){
 const canonical=entity(book,id),rows=profiles||[[canonical.data.profileIds[0],1]];
 return {instanceId,canonicalUnitId:id,startingStrength:rows.reduce((sum,[,quantity])=>sum+quantity,0),
  modelRows:rows.map(([canonicalProfileId,quantity],index)=>({rowId:'physical-row-'+index,canonicalProfileId,quantity,selections:[],loadouts:[]})),
  selections:[],enhancementIds:[],warlord:null};
}
function state(book,detachmentId,units){return {schema:'roster-v2/roster',bookId:book.bookId,rosterId:'independent-f1',
 detachments:detachmentId?[{instanceId:'detachment/1',canonicalDetachmentId:detachmentId}]:[],detachmentIds:detachmentId?[detachmentId]:[],
 units,attachments:[],warlordInstanceId:null};}
function execute(book,snapshot){
 const beforeBook=clone(book),beforeState=clone(snapshot),api=schemaFor(book,snapshot);
 validateRosterEffects(book,api.validatePredicate,api.evaluatePredicate);
 const verified=validateRoster(book,snapshot,book.rosterAttachmentPolicies),projection=executeRosterEffects(book,verified,api);
 assert.deepEqual(book,beforeBook,'Text projection mutated canonical data');assert.deepEqual(snapshot,beforeState,'Text projection mutated imported roster');
 return projection;
}
function schemaFor(book,snapshot){
 const factories={'death-guard':()=>dgSchema,'emperors-children':createECRuleSchema,'space-marines':createSpaceMarinesRuleSchema,
  'blood-angels':createBloodAngelsRuleSchema,'dark-angels':()=>createDarkAngelsRuleSchema({book,state:snapshot}),
  'tau-empire':createTauRuleSchema,'tyranids':createTyranidsRuleSchema};
 return withRosterDetachments(factories[book.bookId]?.()||createRuleContractSchema(book.rosterSchema));
}
const rows=(projection,instance,id,key)=>projection.units.find(unit=>unit.instanceId===instance).conditional.filter(row=>row.ruleId===id&&(!key||row.clauseId===key));
const textRows=(projection,instance,id,key)=>rows(projection,instance,id,key).filter(row=>row.detachmentText);
const effective=(book,projection,id)=>projectEffectiveInstance(book,projection,id);
function personal(book,snapshot,projection,id){
 const payload=read(`books/${book.bookId}/v2/generated/app-presentation.json`);
 const cards=prepareRosterPresentationCards(new Map(payload.cards.map(card=>[card.id,card])),payload.rosterPresentation);
 try{return projectFormedUnitCards(cards,{state:snapshot,effective:instance=>effective(book,projection,instance)},id);}
 catch(error){
  if(process.env.F1_DEBUG)console.error(JSON.stringify(projection.units.map(unit=>({id:unit.instanceId,rows:effective(book,projection,unit.instanceId).conditional.filter(row=>row.policy||row.detachmentText).map(row=>({row,card:cards.get(row.ruleId)}))})),null,2));
  throw error;
 }
}
const wrongDetachment=(book,snapshot)=>{
 const alternative=book.entities.find(record=>record.kind==='DETACHMENT'&&!snapshot.detachmentIds.includes(record.id));
 assert.ok(alternative,'Negative control requires a different accepted detachment');
 return {...clone(snapshot),detachments:[{instanceId:'detachment/other',canonicalDetachmentId:alternative.id}],detachmentIds:[alternative.id]};
};
const withoutConditional=projection=>{const value=clone(projection);for(const unit of value.units)delete unit.conditional;return value;};
let baselineExecute=null,baselineNumericParity=0;
if(process.env.F1_BASELINE_ROOT){
 const module=await import(pathToFileURL(path.join(process.env.F1_BASELINE_ROOT,'books/shared/roster-v2/effects.mjs')));
 baselineExecute=module.executeRosterEffects;
}
function unchangedNumerics(book,snapshot,projection){
 if(!baselineExecute)return;
 const api=schemaFor(book,snapshot);
 const baseline=baselineExecute(book,validateRoster(book,snapshot,book.rosterAttachmentPolicies),api);
 assert.deepEqual(withoutConditional(projection),withoutConditional(baseline),'Text extension changed numeric/applied/keyword/selection/attachment projection');baselineNumericParity++;
}

const am=books.get('adeptus-mechanicus');
const amState=state(am,'detachment-lords-of-the-forge',[
 unit(am,dominus,'priest'),unit(am,dominus,'standalone'),unit(am,rangers,'rangers'),unit(am,rangers,'unled-rangers'),
 unit(am,servitors,'servitors',[[underseer,1],[servitorModels,8]])]);
const amAttached=changeAttachment(am,amState,am.rosterAttachmentPolicies,'ATTACH','priest','rangers');
function expectForge(book,snapshot,projection){
 for(const id of ['priest','standalone','servitors']){
  const visible=textRows(projection,id,forge,'baffling-data-screed');assert.equal(visible.length,1,'Source-backed model ability missing');
  const row=visible[0];assert.equal(row.detachmentText.kind,'ABILITY_PRESENT');assert.equal(row.detachmentText.recipientSubject,'MODEL');
  assert.equal(row.detachmentText.classification,'BATTLE_ONLY','Presentation reclassified gameplay');
  assert.equal(row.execution,'CONDITIONAL_TEXT_ONLY');assert.deepEqual(row.recipientInstanceIds,[id]);
  const profiles=projection.units.find(unit=>unit.instanceId===id).profiles;
  const wanted=profiles.filter(profile=>id!=='servitors'||profile.canonicalProfileId===underseer).map(profile=>profile.scopeId);
  assert.deepEqual(row.recipientModelScopeIds,wanted,'Physical MODEL receiver mismatch');
  const projected=effective(book,projection,id).conditional.find(item=>item.ruleId===forge&&item.clauseId==='baffling-data-screed');
  assert.deepEqual(projected.recipientModelScopeIds,wanted);
  assert.deepEqual(sourceSnapshot(row,{slot:'sourceProvenance'}),sourceSnapshot(entity(book,forge)));
 }
 for(const id of ['rangers','unled-rangers'])assert.equal(textRows(projection,id,forge).length,0,'Formed UNIT keyword leaked to Bodyguard MODEL');
 const view=personal(book,snapshot,projection,'rangers');
 const rendered=view.components.flatMap(component=>(component.card.rosterDetachmentTexts||[]).filter(row=>row.ruleId===forge&&row.clauseId==='baffling-data-screed').map(row=>({component:component.unit.instanceId,row})));
 assert.deepEqual(rendered.map(row=>row.component),['priest'],'Combined card must retain the MODEL recipient component');
 const priest=projection.units.find(unit=>unit.instanceId==='priest').profiles[0];
 assert.equal(priest.profile.INSV,'4+','Existing InSv changed');
 assert.ok(priest.abilities.some(ability=>ability.name==='Feel No Pain'&&ability.value===5),'Existing FNP5 changed');
 const servitor=projection.units.find(unit=>unit.instanceId==='servitors');
 assert.equal(servitor.profiles.find(profile=>profile.canonicalProfileId===underseer).profile.INSV,'4+');
 assert.ok(servitor.profiles.find(profile=>profile.canonicalProfileId===underseer).abilities.some(ability=>ability.name==='Feel No Pain'&&ability.value===5),'Underseer FNP5 changed');
 assert.equal(servitor.profiles.find(profile=>profile.canonicalProfileId===servitorModels).abilities.some(ability=>ability.name==='Feel No Pain'&&ability.value===5),false,'Forge FNP leaked to non-priest models');
}
let amProjection;
check('AM/Forge/model-presence-standalone-attached-underseer-and-numeric-parity',()=>{
 amProjection=execute(am,amAttached);expectForge(am,amAttached,amProjection);unchangedNumerics(am,amAttached,amProjection);
 assert.equal(textRows(execute(am,wrongDetachment(am,amAttached)),'priest',forge).length,0,'Unselected Forge appeared');
 const solo=execute(am,amState);assert.equal(textRows(solo,'priest',forge).length,1);assert.equal(textRows(solo,'rangers',forge).length,0);
 scenarios.push({book:'adeptus-mechanicus',ruleId:forge,scope:'MODEL',kind:'ABILITY_PRESENT',positive:['Dominus standalone','Dominus attached to Rangers','Servitor Underseer'],negative:['Rangers models in formed UNIT','unled Rangers','Combat/Gun Servitors'],wrongDetachment:true,INV4FNP5:'UNCHANGED'});
});
check('AM/Halo/UNIT-selection-eligible-not-selected',()=>{
 const snapshot=clone(amAttached);snapshot.detachments=[{instanceId:'detachment/1',canonicalDetachmentId:'detachment-haloscreed-battle-clade'}];snapshot.detachmentIds=['detachment-haloscreed-battle-clade'];
 const projection=execute(am,snapshot);
 for(const id of snapshot.units.map(unit=>unit.instanceId)){
  const visible=textRows(projection,id,halo,'halo-override-selection');assert.equal(visible.length,1);assert.equal(visible[0].detachmentText.kind,'ELIGIBLE_FOR_SELECTION');
  assert.equal(visible[0].detachmentText.recipientSubject,'UNIT');assert.deepEqual(visible[0].recipientModelScopeIds,[]);
  assert.equal(projection.units.find(unit=>unit.instanceId===id).keywords.includes('HALO OVERRIDE'),false,'Unrecorded choice executed');
 }
 const view=personal(am,snapshot,projection,'rangers');
 for(const component of view.components)assert.equal((component.card.rosterDetachmentTexts||[]).filter(row=>row.ruleId===halo&&row.clauseId==='halo-override-selection').length,1,'F2: each proven physical component shows the UNIT choice once');
 // A missing local UNIT row can use another current component's native proof,
 // without changing either effective array or its complete recipient set.
 const payload=read('books/adeptus-mechanicus/v2/generated/app-presentation.json');
 const cards=prepareRosterPresentationCards(new Map(payload.cards.map(card=>[card.id,card])),payload.rosterPresentation);
 const snapshots=new Map(snapshot.units.map(unit=>[unit.instanceId,effective(am,projection,unit.instanceId)]));
 const own=snapshots.get('priest');own.conditional=own.conditional.filter(row=>row.ruleId!==halo);
 const before=clone([...snapshots]),service={state:snapshot,effective:id=>snapshots.get(id)};
 const copied=projectFormedUnitCards(cards,service,'rangers').components.find(component=>component.unit.instanceId==='priest').card.rosterDetachmentTexts.find(row=>row.ruleId===halo&&row.clauseId==='halo-override-selection');
 assert.ok(copied,'Missing local UNIT presentation is recovered only from current native proof');
 assert.deepEqual([...snapshots],before,'Presentation changed effective rows');
 assert.deepEqual(copied.recipientInstanceIds,['rangers','priest']);
 const physical=snapshot.units.find(unit=>unit.instanceId==='priest');
 for(const [name,mutate]of [
  ['recipient',row=>row.recipientInstanceIds=['priest']],
  ['clause',row=>row.clauseId='foreign-clause'],
  ['provenance',row=>sourceFixture(row).sourceProvenance.sourceId='foreign-source'],
  ['physical-source',row=>row.sourceInstanceId='foreign-physical-source'],
  ['physical-source-model',row=>row.sourceModelScopeId='foreign-physical-model'],
  ['owner',row=>row.sourceOwnerChain.at(-1).id='foreign-owner'],
  ['MODEL-transfer',row=>row.detachmentText.recipientSubject='MODEL'],
  ['canonical-text',row=>row.detachmentText.text+=' changed']
 ]){const row=clone(copied);mutate(row);rejected('F2/UNIT-copy/'+name,()=>validateComponentDetachmentText(cards,service,physical,own,row));}
 const detached=clone(own);detached.formedUnit=null;
 rejected('F2/UNIT-copy/stale-after-detach',()=>validateComponentDetachmentText(cards,service,physical,detached,copied));
 assert.equal(textRows(execute(am,wrongDetachment(am,snapshot)),'rangers',halo).length,0);unchangedNumerics(am,snapshot,projection);
 const outsider=clone(am);for(const binding of outsider.rosterProfileBindings.filter(binding=>binding.unitId===rangers))binding.intrinsicKeywords=binding.intrinsicKeywords.filter(keyword=>keyword!=='ADEPTUS MECHANICUS');
 for(const member of outsider.entities.filter(record=>record.id===rangers))member.data.factionKeywords=[];
 const alone=state(outsider,'detachment-haloscreed-battle-clade',[unit(outsider,rangers,'outside')]);
 assert.equal(textRows(execute(outsider,alone),'outside',halo).length,0,'Non-Mechanicus disposable recipient must not be eligible');
 scenarios.push({book:'adeptus-mechanicus',ruleId:halo,scope:'UNIT',kind:'ELIGIBLE_FOR_SELECTION',positive:'ADEPTUS MECHANICUS',negative:'explicit keyword-removal mutant (all accepted units share faction)',formedDeduplicated:true,wrongDetachment:true,automaticKeywordGrant:false});
});

for(const spec of [
 {book:'death-guard',rule:fly,detachment:'detachment-flyblown-host',clause:'selected-infiltrators',positive:'unit-plague-marines',negative:'unit-blightlord-terminators',scope:'UNIT',kind:'ELIGIBLE_FOR_SELECTION'},
 {book:'chaos-space-marines',rule:raiders,detachment:'detachment-renegade-raiders',clause:'source-clause-1-1',positive:'unit-legionaries',negative:null,scope:'MODEL',kind:'CONDITIONAL'},
 {book:'emperors-children',rule:mercurial,detachment:'detachment-mercurial-host',clause:'advance-roll',positive:'unit-noise-marines',negative:'unit-daemonettes',scope:'UNIT',kind:'CONDITIONAL'}
])check(spec.book+'/positive-negative-wrong-detachment',()=>{
 const book=books.get(spec.book),snapshot=state(book,spec.detachment,[unit(book,spec.positive,'right'),...(spec.negative?[unit(book,spec.negative,'wrong')]:[])]);
 const projection=execute(book,snapshot),visible=textRows(projection,'right',spec.rule,spec.clause);
 assert.equal(visible.length,1,'Accepted recipient clause missing');assert.equal(visible[0].detachmentText.recipientSubject,spec.scope);assert.equal(visible[0].detachmentText.kind,spec.kind);
 assert.equal(effective(book,projection,'right').conditional.filter(row=>row.ruleId===spec.rule&&row.clauseId===spec.clause&&row.detachmentText).length,1);
 if(spec.negative)assert.equal(textRows(projection,'wrong',spec.rule,spec.clause).length,0,'Foreign recipient');
 else {
  const altered=clone(book);for(const binding of altered.rosterProfileBindings.filter(binding=>binding.unitId===spec.positive))binding.intrinsicKeywords=binding.intrinsicKeywords.filter(keyword=>keyword!=='HERETIC ASTARTES');
  assert.equal(textRows(execute(altered,snapshot),'right',spec.rule,spec.clause).length,0,'Non-HERETIC MODEL mutant received text');
 }
 assert.equal(textRows(execute(book,wrongDetachment(book,snapshot)),'right',spec.rule,spec.clause).length,0);
 assert.equal(projection.units.some(unit=>unit.applied.some(row=>row.ruleId===spec.rule&&row.clauseId===spec.clause)),false,'Text clause calculated a battle effect');
 if(spec.book==='death-guard')assert.equal((projection.units.find(unit=>unit.instanceId==='right').abilities||[]).some(ability=>ability.canonicalId==='core-infiltrators'),false,'Eligibility granted unrecorded Infiltrators');
 unchangedNumerics(book,snapshot,projection);
 scenarios.push({book:spec.book,ruleId:spec.rule,scope:spec.scope,kind:spec.kind,positive:spec.positive,negative:spec.negative||'disposable intrinsic MODEL-keyword removal; all accepted CSM units share faction',wrongDetachment:true});
});

check('BA/existing-Legacy-HIT-WOUND-typed-policies-preserved',()=>{
 const book=books.get('blood-angels'),snapshot=state(book,'detachment-ba-23df164069854eb2996c',[
  unit(book,'unit-ba-09adea2bf319462fb4ed','captain'),unit(book,'unit-ba-548417d73e544f7f920e','marines')]);
 const projection=execute(book,snapshot),visible=rows(projection,'captain',legacy).filter(row=>row.policy);
 assert.deepEqual(visible.map(row=>row.policy.payload.roll).sort(),['HIT','WOUND']);assert.ok(visible.every(row=>row.policy.kind==='REROLL'&&row.policy.payload.results==='ONES'&&!row.detachmentText));
 assert.equal(rows(projection,'marines',legacy).filter(row=>row.policy).length,0);assert.equal(rows(execute(book,wrongDetachment(book,snapshot)),'captain',legacy).length,0);
 for(const row of effective(book,projection,'captain').conditional.filter(row=>row.ruleId===legacy&&row.policy))assert.equal(row.execution,'CONDITIONAL_TEXT_ONLY');
 unchangedNumerics(book,snapshot,projection);scenarios.push({book:'blood-angels',ruleId:legacy,scope:'UNIT',kind:'EXISTING_TYPED_REROLL',positive:'Blood Angels Captain',negative:'Death Company Marines',wrongDetachment:true});
});

for(const id of ['space-marines','dark-angels','tau-empire','tyranids'])check(id+'/no-unproven-text-dispatch',()=>{
 const book=books.get(id),rules=book.entities.filter(record=>record.kind==='DETACHMENT_RULE');
 const declarations=rules.flatMap(rule=>(rule.ruleContract?.clauses||[]).filter(clause=>detachmentTextDeclaration(book,rule,clause)));
 assert.equal(declarations.length,0,'This book has newly exposed selector coverage requiring independent source review');
 const detachment=book.entities.find(record=>record.kind==='DETACHMENT'),canonical=book.entities.find(record=>record.kind==='DATASHEET');
 const projection=execute(book,state(book,detachment.id,[unit(book,canonical.id,'physical')]));
 assert.equal(projection.units.flatMap(unit=>unit.conditional).filter(row=>row.detachmentText).length,0);
 scenarios.push({book:id,scope:'N/A',kind:'NO_PROVEN_TEXT_SELECTOR',textRows:0,reason:'No source-bound recipient declaration in existing contracts; no coverage expansion'});
});

check('DG/legacy-source-selection-is-not-an-objective-or-created-unit-fallback',()=>{
 const book=books.get('death-guard');
 const declarations=book.entities.filter(rule=>rule.kind==='DETACHMENT_RULE').flatMap(rule=>(rule.ruleContract?.clauses||[])
  .filter(clause=>detachmentTextDeclaration(book,rule,clause)).map(clause=>rule.id+'/'+clause.id));
 assert.deepEqual(declarations,[fly+'/selected-infiltrators'],'Trigger, anchor or created-unit roles must not become recipients');
});
check('service-diagnostics-are-not-F1',()=>{
 for(const reason of ['Enhancement owner context unavailable','Roster recipient context unavailable','Roster context unavailable','Physical weapon selection unavailable']){
  const row={ruleId:'diagnostic-source',clauseId:'diagnostic-clause',state:'UNKNOWN',reason};
  assert.deepEqual(projectConditionalRow(am,{units:[],formedUnits:[]},{},row),row);
 }
});

// Independent observation must fail for each semantically meaningful corruption.
for(const [name,mutate]of [
 ['recipient-selector',candidate=>{clause(candidate,forge,'baffling-data-screed').roles.find(role=>role.id==='recipient').selector.arguments.keyword='RANGERS';}],
 ['UNIT-MODEL-filter',candidate=>{const role=clause(candidate,forge,'baffling-data-screed').roles.find(role=>role.id==='recipient');role.subject='UNIT';role.selector.subject='UNIT';role.selector.predicate='UNIT_KEYWORD';}],
 ['missing-proven-selector',candidate=>{const role=clause(candidate,forge,'baffling-data-screed').roles.find(role=>role.id==='recipient');role.selector={predicate:'ALWAYS',subject:'MODEL',contextLevel:'STATIC',arguments:{},evidence:clone(role.selector.evidence)};}],
 ['missing-source-provenance',candidate=>{delete sourceFixture(entity(candidate,forge)).provenance.sourceId;}],
 ['formed-keyword-leakage',candidate=>{for(const binding of candidate.rosterProfileBindings.filter(binding=>binding.unitId===rangers))binding.intrinsicKeywords.push('TECH-PRIEST');}]
])rejected(name,()=>{const candidate=clone(am);mutate(candidate);expectForge(candidate,amAttached,execute(candidate,amAttached));});
rejected('selected-detachment-filter',()=>expectForge(am,wrongDetachment(am,amAttached),execute(am,wrongDetachment(am,amAttached))));
for(const [name,mutate]of [
 ['MODEL-scope-tamper',row=>row.recipientModelScopeIds.push('rangers/physical-row-0/PROFILE/physical-row-0')],
 ['recipient-instance-tamper',row=>row.recipientInstanceIds.push('rangers')],
 ['source-provenance-tamper',row=>sourceFixture(row).sourceProvenance.sourceId='unaccepted-source'],
 ['status-tamper',row=>row.detachmentText.kind='ELIGIBLE_FOR_SELECTION']
])rejected(name,()=>{
 const altered=clone(amProjection),row=textRows(altered,'priest',forge,'baffling-data-screed')[0];mutate(row);effective(am,altered,'priest');
});
check('unknown-ROSTER-prerequisite-is-not-proof',()=>{
 const candidate=clone(am),record=entity(candidate,forge),entry=clause(candidate,forge,'baffling-data-screed');
 candidate.rosterSchema.stateFields['f1UnknownRecipientPermission']={contextLevel:'ROSTER',valueType:'boolean'};
 entry.conditions.push({predicate:'FIELD',subject:'MODEL',contextLevel:'ROSTER',roleId:'recipient',arguments:{key:'f1UnknownRecipientPermission',equals:true},evidence:clone(entry.evidence)});
 const projection=execute(candidate,amAttached);assert.equal(textRows(projection,'priest',forge,'baffling-data-screed').length,0,'UNKNOWN roster prerequisite treated as TRUE');
 rejected('unknown-roster-condition',()=>expectForge(candidate,amAttached,projection));
 assert.ok(sourceSnapshot(record).sourceId);
});
check('nested-ROSTER-prerequisite-for-foreign-role-is-not-recipient-proof',()=>{
 const candidate=clone(am),entry=clause(candidate,forge,'baffling-data-screed');
 candidate.rosterSchema.stateFields.modelFromYourArmy={contextLevel:'ROSTER',valueType:'boolean'};
 entry.conditions.push({op:'ALL',subject:'MODEL',args:[{predicate:'FIELD',subject:'MODEL',contextLevel:'ROSTER',roleId:'different-physical-role',
  arguments:{key:'modelFromYourArmy',equals:true},evidence:clone(entry.evidence)}]});
 const projection=execute(candidate,amAttached);
 assert.equal(textRows(projection,'priest',forge,'baffling-data-screed').length,0,'Nested prerequisite was evaluated in the wrong physical role');
 rejected('nested-foreign-roster-role',()=>expectForge(candidate,amAttached,projection));
});

const result={status:failures.length?'FAIL':'PASS',failures,checks:checks.length,checkIds:checks,scenarios,sourceProof,mutationControls:mutations.length,mutations,
 numericAppliedKeywordSelectionAttachmentParity:baselineExecute?{baselineRoot:process.env.F1_BASELINE_ROOT,cases:baselineNumericParity,status:'PASS'}:{status:'NOT_RUN',reason:'Set F1_BASELINE_ROOT for independent interpreter parity; fixed INV/FNP controls still run'},
 gameplayExecutionChanged:false,realNewRecruitExportTested:false,browserAcceptance:'Separate v2/detachment-recipient-browser-qa.mjs',
 limits:['CSM and AM Halo negative faction controls use disposable keyword-removal mutants because accepted book membership shares the faction selector','SM/DA/Tau/Tyr text dispatch is N/A; unsupported selectors were not invented','Existing typed BA HIT/WOUND policy coverage retained; EC existing passive grant remains unchanged']};
if(process.env.F1_UNIT_OUT){fs.mkdirSync(process.env.F1_UNIT_OUT,{recursive:true});fs.writeFileSync(path.join(process.env.F1_UNIT_OUT,'RESULTS.json'),JSON.stringify(result,null,2)+'\n');}
console.log(JSON.stringify(result));
assert.equal(failures.length,0,JSON.stringify(failures,null,2));

/** Core 25.04/FAQ oracles. Does not call the production Epic eligibility helper. */
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {fileURLToPath,pathToFileURL} from 'node:url';

const self=fileURLToPath(import.meta.url),fixture=JSON.parse(fs.readFileSync(new URL('./fixtures/epic-hero-enhancements.json',import.meta.url)));
const arg=name=>process.argv.find(value=>value.startsWith(name+'='))?.slice(name.length+1);
const root=path.resolve(arg('--root')||fileURLToPath(new URL('../',import.meta.url)));
const selected=arg('--book'),suite=arg('--suite')||'all',caseId=arg('--case');
assert(['all','rule','import','manual','faq'].includes(suite),'Unknown Epic Hero suite');
assert(!selected||fixture.books[selected],'Unknown native book');
const decodeModule=await import(pathToFileURL(path.join(root,'books/shared/source-refs-v2/producer-io.mjs')).href);
const readJson=file=>decodeModule.parseProducerJSON(fs.readFileSync(path.join(root,file),'utf8'));
const outcomes=rows=>Object.fromEntries(['MATCH','CONDITIONAL','NO_MATCH','INVALID','UNRESOLVED'].map(value=>[value,rows.filter(row=>row.applicability===value).length]));

/** Read accepted intrinsic UNIT and explicitly owned MODEL facts only. No formed UNIT union. */
function nativeIdentities(book){
 const prefix='books/'+book+'/v2/generated/';
 const inputs=['roster-runtime','roster-import','rule-contract-effective','effective'].map(name=>prefix+name+'.json')
  .filter(file=>fs.existsSync(path.join(root,file))).map(readJson).filter(value=>Array.isArray(value.entities));
 assert(inputs.length,book+': missing native facts');
 const facts=inputs[0],index=new Map(facts.entities.map(entity=>[entity.id,entity]));
 const units=facts.entities.filter(entity=>entity.kind==='DATASHEET');
 const keywords=unit=>{
  const bindings=inputs.flatMap(input=>input.rosterProfileBindings||[]).filter(row=>row.unitId===unit.id);
  for(const binding of bindings){
   const model=index.get(binding.profileId);
   assert(model&&(model.parentId===unit.id||model.ownerId===unit.id||(unit.data.profileIds||[]).includes(model.id)||(unit.data.modelProfileIds||[]).includes(model.id)),book+': foreign MODEL keyword evidence');
  }
  return [...new Set([...(unit.data.keywords||[]),...(unit.data.factionKeywords||[]),...bindings.flatMap(row=>row.intrinsicKeywords)])];
 };
 return {units,keywords};
}
const checks=[],failures=[];
async function check(id,run){try{const result=await run();checks.push({id,status:'PASS',...result});console.log('PASS '+id);}catch(error){failures.push({id,message:error.message});console.error('FAIL '+id+': '+error.message);}}

if(['all','rule'].includes(suite))for(const [book,baseline]of Object.entries(fixture.books).filter(([book])=>!selected||book===selected))await check('rule/'+book,()=>{
 const {units,keywords}=nativeIdentities(book),rows=readJson('books/'+book+'/v2/generated/app-presentation.json').relatedRules.rows;
 const epicIds=units.filter(unit=>keywords(unit).includes('EPIC HERO')).map(unit=>unit.id).sort();
 assert.deepEqual(epicIds,baseline.epicUnitIds,book+': Epic physical identities must match accepted baseline');
 assert(epicIds.length,book+': the prohibition test must inspect real Epic Heroes');
 const bad=[];let pairs=0;
 for(const unitId of epicIds){
  const own=rows.filter(row=>row.unitId===unitId&&row.kind==='ENHANCEMENT');assert(own.length,book+': missing Enhancement/Upgrade domain for '+unitId);
  for(const row of own){pairs++;if(row.applicability!=='NO_MATCH'||row.selectedDetachment.applicability!=='NO_MATCH')bad.push({unitId,ruleId:row.ruleId,all:row.applicability,selected:row.selectedDetachment.applicability});}
 }
 assert.equal(bad.length,0,book+': Core 25.04 forbids these Epic Hero Enhancement/Upgrade pairs: '+JSON.stringify(bad));
 const ordinary=units.filter(unit=>!epicIds.includes(unit.id)&&keywords(unit).includes('CHARACTER'));
 assert.deepEqual(ordinary.map(unit=>unit.id).sort(),baseline.ordinaryCharacters.map(unit=>unit.unitId).sort(),book+': ordinary CHARACTER identities unchanged');
 for(const expected of baseline.ordinaryCharacters){
  const own=rows.filter(row=>row.unitId===expected.unitId&&row.kind==='ENHANCEMENT');
  assert.deepEqual(outcomes(own),expected.allDetachments,book+': ordinary CHARACTER Enhancement counts changed: '+expected.unitId);
  assert.deepEqual(outcomes(own.map(row=>row.selectedDetachment)),expected.selectedDetachment,book+': selected ordinary CHARACTER counts changed: '+expected.unitId);
 }
 return {book,epicUnits:epicIds.length,epicPairs:pairs,ordinaryCharacters:ordinary.length};
});

const services=new Map();
async function service(book){
 if(!services.has(book)){
  const entry=book==='adeptus-mechanicus'?'roster-runtime':'roster-boot';
  const {createBrowserRoster}=await import(pathToFileURL(path.join(root,'books/'+book+'/v2/'+entry+'.mjs')).href);
  const read=async url=>({ok:true,json:async()=>JSON.parse(fs.readFileSync(url,'utf8'))});
  globalThis.fetch=read;services.set(book,await createBrowserRoster({fetch:read}));
 }
 return services.get(book);
}
const diagnostic=result=>JSON.stringify({status:result.status,errors:result.errors,needsBindings:result.needsBindings});
const activeSignature=view=>({
 profiles:view.profiles.map(model=>({id:model.id,quantity:model.quantity,fields:model.fields,keywords:model.keywords,metrics:model.metrics,abilities:model.abilities})),
 keywords:view.physicalKeywords,weapons:view.weapons.map(weapon=>({id:weapon.id,fields:weapon.fields})),abilities:view.unitAbilities||[]
});
if(['all','import'].includes(suite))for(const c of fixture.importCases.filter(c=>(!selected||selected===c.book)&&(!caseId||caseId===c.id)))await check('import/'+c.id,async()=>{
 const run=await service(c.book),bareText=c.text.replace(/^Enhancement:[^\n]*\n/m,'');
 const bareResult=run.import(bareText,{}, {replaceExisting:true});assert.equal(bareResult.status,'READY',c.id+': bare control must import: '+diagnostic(bareResult));
 const bare=run.effective('parsed-unit-1');
 const result=run.import(c.text,{}, {replaceExisting:true});assert.equal(result.status,'READY',c.id+': invalid Enhancement must not reject the whole import: '+diagnostic(result));
 const state=run.snapshot(),raw=state.units[0],view=run.effective(raw.instanceId),projected=run.projection.units.find(unit=>unit.instanceId===raw.instanceId);
 assert.equal(raw.canonicalUnitId,c.unitId,'Literal unit identity');
 assert.deepEqual(raw.enhancementIds,[c.enhancementId],'Keep the imported selection as evidence; never silently edit the exported list');
 assert.equal(Number(raw.raw.points),c.exportPoints,'Retain the unit point figure from the export');
 assert.equal(state.importEvidence.pointsLimit,2000,'Preserve the declared list limit');
 assert.equal(result.draft.sourceText,c.text,'Keep the original export text byte-for-byte');
 assert.equal(result.draft.enhancements[0].exportedCost,c.exportEnhancementPoints,'Keep the exported Enhancement charge');
 assert.deepEqual(raw.mfmEnhancementRecordIds,[c.expectedMfmEnhancementRecordId],'Retain the exact accepted Enhancement cost identity');
 if(c.epic){
  const message=(result.warnings||[]).map(warning=>typeof warning==='string'?warning:warning.message).join('\n');
  assert(message.includes(c.unit)&&message.includes(c.enhancement),'Epic warning names the physical unit and Enhancement');
  assert.match(message,/Epic Hero/i);assert.match(message,/Core Rules 25\.04/);assert.match(message,/not applied/i);assert.match(message,/invalid|violat|illegal/i,'Tell the player the exported list violates the rule');
  assert(!projected.enhancementIds.includes(c.enhancementId),'Banned Enhancement must not be active in the execution projection');
  assert(!view.enhancements.some(row=>row.canonicalId===c.enhancementId),'Banned Enhancement is not presented as active');
  assert(!run.projection.units.some(unit=>[...unit.applied,...unit.conditional].some(row=>row.ruleId===c.enhancementId)),'No banned applied or conditional effect');
  assert.deepEqual(activeSignature(view),activeSignature(bare),'Epic stats, weapon facts and abilities equal the no-Enhancement control');
  const relatedEnhancements=run.related(raw.instanceId).filter(row=>row.kind==='ENHANCEMENT');
  assert(relatedEnhancements.length,'The roster compatibility oracle must inspect actual Enhancement rows');
  assert(relatedEnhancements.every(row=>row.applicability==='NO_MATCH'),'Roster panel also blocks Epic Enhancements');
 }else{
  assert.equal(result.warnings?.length||0,0,'Ordinary CHARACTER must not get an Epic warning');
  assert(projected.enhancementIds.includes(c.enhancementId),'Ordinary Enhancement remains active');
  assert(view.enhancements.some(row=>row.canonicalId===c.enhancementId),'Ordinary Enhancement is presented');
  assert(run.projection.units.some(unit=>unit.applied.some(row=>row.ruleId===c.enhancementId)),'The ordinary Enhancement keeps its executable effect');
  if(c.book==='space-marines')assert.equal(view.profiles[0].fields.find(field=>field.label==='stats').value.SV,'2+','Artificer Armour retains its literal 2+ Save');
  else assert(view.profiles.some(model=>model.keywords.includes('GRENADES')),'Internal Grenade Racks retains GRENADES on the ordinary Commander');
 }
 if(c.book==='space-marines'){
  assert(result.points,'The existing SM point calculation must remain available');
  const priced=result.points.units.find(row=>row.unitInstanceId===raw.instanceId);assert(priced,'Missing physical SM price');
  assert.equal(priced.enhancementPoints,c.acceptedEnhancementPoints,'A forbidden Enhancement remains charged; no silent points correction');
  assert.deepEqual(priced.enhancementCostRecordIds,[c.expectedMfmEnhancementRecordId]);
 }else{
  // Tau has no roster points calculator. Preserve its existing exact price identity
  // and the original export charge rather than inventing a second total here.
  const {createEffectiveMfmCatalog}=await import(pathToFileURL(path.join(root,'mfm/content/effective-mfm-catalog.mjs')).href);
  const cost=createEffectiveMfmCatalog().getEnhancementCost(c.expectedMfmEnhancementRecordId);
  assert(cost,'The retained Tau price identity resolves to an accepted MFM charge');
  assert.equal(cost.value,c.acceptedEnhancementPoints);
 }
 const refs=structuredClone(raw.mfmEnhancementRecordIds);run.load(state);
 assert.deepEqual(run.snapshot().units[0].mfmEnhancementRecordIds,refs,'Reload retains price evidence');
 assert.equal(run.effective(raw.instanceId).enhancements.some(row=>row.canonicalId===c.enhancementId),!c.epic,'Reload cannot reactivate an Epic Enhancement');
 const repeated=run.import(c.text,{}, {replaceExisting:true});assert.equal(repeated.status,'READY');
 assert.equal(run.effective(raw.instanceId).enhancements.some(row=>row.canonicalId===c.enhancementId),!c.epic,'Repeated import keeps the same eligibility');
 return {book:c.book,unit:c.unit,enhancement:c.enhancement,epic:c.epic,exportPoints:c.exportPoints,points:c.book==='space-marines'?result.points:{status:'NO_TAU_ROSTER_CALCULATOR',retainedCostRecord:c.expectedMfmEnhancementRecordId,exportCharge:c.exportEnhancementPoints}};
});

/** This real mixed Epic UNIT has two distinct single MODEL bearer candidates on
 * the baseline. It exercises the manual-choice branch, unlike a singleton Hero.
 * The export itself is constructed and does not claim a legal army/points build. */
if(['all','manual'].includes(suite)&&(!selected||selected===fixture.manualBearer.book))await check('manual/victrix-epic-bearers-not-offered',async()=>{
 const c=fixture.manualBearer,facts=readJson('books/'+c.book+'/v2/generated/roster-import.json');
 const intrinsic=facts.rosterProfileBindings.filter(binding=>binding.unitId===c.unitId&&binding.intrinsicKeywords.includes('EPIC HERO'));
 assert.deepEqual(intrinsic.map(binding=>binding.profileId).sort(),[...c.epicProfileIds].sort(),'Two independently recorded physical Epic MODEL identities');
 const run=await service(c.book),bareResult=run.import(c.text.replace(/^Enhancement:[^\n]*\n/m,''),{}, {replaceExisting:true});
 assert.equal(bareResult.status,'READY','Bare mixed-model control must import: '+diagnostic(bareResult));
 const bare=run.effective('parsed-unit-1'),before=run.snapshot();
 for(const id of c.epicProfileIds)assert.equal(before.units[0].modelRows.find(row=>row.canonicalProfileId===id)?.quantity,1,'Each Epic bearer is one physically selectable MODEL');
 const result=run.import(c.text,{}, {replaceExisting:true});
 assert.equal(result.status,'READY','Core 25.04: do not offer either Epic MODEL as an Enhancement bearer; observed '+diagnostic(result));
 assert.equal(result.needsBindings.filter(need=>need.kind==='ENHANCEMENT_BEARER'||need.kind==='ENHANCEMENT_MODEL_OWNER').length,0,'Epic models cannot enter manual Enhancement bearer choices');
 const unit=run.state.units[0],view=run.effective(unit.instanceId),projected=run.projection.units.find(row=>row.instanceId===unit.instanceId);
 assert.deepEqual(unit.enhancementIds,[c.enhancementId],'Preserve the imported invalid choice as evidence');
 assert(!projected.enhancementIds.includes(c.enhancementId),'Manual-choice branch cannot activate an Epic Enhancement');
 assert(!view.enhancements.some(row=>row.canonicalId===c.enhancementId));
 assert(!projected.applied.some(row=>row.ruleId===c.enhancementId));
 assert.deepEqual(activeSignature(view),activeSignature(bare),'No stat/weapon/ability change from the forbidden manual bearer');
 const message=(result.warnings||[]).map(warning=>typeof warning==='string'?warning:warning.message).join('\n');
 assert(message.includes(c.unit)&&message.includes(c.enhancement),'Manual bearer warning names the mixed Epic UNIT and Enhancement');
 assert.equal(result.points.units[0].enhancementPoints,15,'The blocked manual bearer does not silently remove the imported price');
 return {book:c.book,unit:c.unitId,physicalEpicCandidates:c.epicProfileIds,offeredEnhancementBearers:0,fixtureKind:c.kind};
});

if(['all','faq'].includes(suite)&&(!selected||selected===fixture.faq.book))await check('faq/darkstrider-pathfinder-upgrade',async()=>{
 const c=fixture.faq,facts=readJson('books/'+c.book+'/v2/generated/roster-import.json');
 const leaderSource=facts.entities.find(entity=>entity.kind==='DATASHEET_SECTION'&&entity.parentId===c.leaderId&&entity.data.title==='LEADER');
 assert(leaderSource&&leaderSource.data.blocks.some(block=>/PATHFINDER TEAM/i.test(block.text)),'Independent accepted Darkstrider LEADER text lists PATHFINDER TEAM');
 const upgrade=facts.entities.find(entity=>entity.id===c.enhancementId);
 assert.equal(upgrade.data.scope,'UNIT','Unmasking Suite belongs to a UNIT, not to its attached Epic Hero');
 assert(/PATHFINDER TEAM/.test(upgrade.data.text),'Accepted Upgrade restriction names PATHFINDER TEAM');
 const run=await service(c.book),result=run.import(c.text,{}, {replaceExisting:true});
 assert.equal(result.status,'READY','Real accepted Upgrade/Leader pair imports: '+diagnostic(result));
 assert.equal(result.warnings?.length||0,0,'The Upgrade belongs to Pathfinder Team, not the Epic Leader');
 const state=run.snapshot(),leader=state.units.find(unit=>unit.canonicalUnitId===c.leaderId),bodyguard=state.units.find(unit=>unit.canonicalUnitId===c.bodyguardId);
 assert(leader&&bodyguard);assert.equal(leader.enhancementIds.length,0);assert.deepEqual(bodyguard.enhancementIds,[c.enhancementId]);
 assert(run.candidates(leader.instanceId).some(unit=>unit.instanceId===bodyguard.instanceId),'Accepted Darkstrider LEADER relation remains eligible');
 run.attach(leader.instanceId,bodyguard.instanceId);
 assert.equal(run.state.attachments.length,1,'FAQ explicitly permits Epic Leader attached to an upgraded UNIT');
 assert(run.effective(bodyguard.instanceId).enhancements.some(row=>row.canonicalId===c.enhancementId),'The non-Epic physical Upgrade owner keeps its Upgrade');
 assert(run.related(bodyguard.instanceId).some(row=>row.ruleId===c.enhancementId&&row.applicability!=='NO_MATCH'),'Formation must not lend EPIC HERO to the physical Upgrade owner');
 run.detach(leader.instanceId);assert.equal(run.state.attachments.length,0);
 run.reattach(leader.instanceId,bodyguard.instanceId);assert.equal(run.state.attachments.length,1);
 const snapshot=run.snapshot();run.load(snapshot);assert.equal(run.state.attachments.length,1,'FAQ combination persists');
 return {book:c.book,leader:c.leaderId,bodyguard:c.bodyguardId,upgrade:c.enhancementId,sourceRelation:c.sourceRelationId,fixtureKind:c.kind};
});
assert(checks.length+failures.length,'No matching Epic Hero scenarios');
console.log(JSON.stringify({status:failures.length?'FAIL':'PASS',root,baseline:fixture.baseline,suite,checks,failures},null,2));
if(failures.length)process.exitCode=1;

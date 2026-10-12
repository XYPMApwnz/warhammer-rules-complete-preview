/** Independent source-value/scope oracles on real imported physical instances.
 * Mutation inputs are disposable clones; no source catalog is modified. */
import assert from 'node:assert/strict';
import {book,importBook,bindings,fixtures,imported,runtime,runtimeFromState,rows,unit,clone,removeSelection} from './roster-runtime-qa.mjs';
import {createCSMRosterRuntime} from './roster-runtime.mjs';
import {formRoster} from '../../shared/roster-v2/context.mjs';
import {createCSMBrowserRoster} from './roster-boot.mjs';
import {makePersonalPayload} from './personal-guide-qa.mjs';
import * as personal from '../../shared/army-book-app-v2/personal.mjs';
import {selectedMarkClause} from './roster-effect-build.mjs';

const original=JSON.stringify(book),canonical=JSON.stringify(importBook),checks=[],mutations=[];
const fixture=(owner,clauseId)=>{const found=fixtures.find(f=>f.owner===owner&&(!clauseId||f.clauseId===clauseId));assert.ok(found,owner);return found;};
const profile=(projection,id,index=0)=>unit(projection,id).profiles[index];
const stat=(model,key)=>model.profile.stats?.[key]??model.profile[key];
const ability=(model,id)=>model.abilities.find(a=>a.canonicalId===id);
const weapon=(model,id)=>model.weapons.find(w=>w.canonicalProfileId===id);
const test=(name,run)=>{run();checks.push(name);};
const mutation=(name,run)=>{assert.throws(run,undefined,'Undetected mutation: '+name);mutations.push(name);};
const rangeOwner='detachment-cult-of-the-arkifane:enhancement:4';
const ranges=[['datasheet-warpsmith:section:1:block:0:text',3,6],
  ['datasheet-warpsmith:section:1:block:1:text',3,6],['datasheet-warpsmith:section:1:block:2:text',12,15]];
const woundsOwner='detachment-creations-of-bile:enhancement:2',woundsFixture=fixture(woundsOwner,'roster-clause-1');
function woundsOracle(service){const state=service.snapshot(),base=formRoster(book,state),result=service.projection;
  assert.equal(Number.parseInt(stat(profile(result,state.units[0].instanceId),'W')),
    Number.parseInt(stat(profile(base,state.units[0].instanceId),'W'))+1);
  assert.deepEqual(profile(result,state.units[1].instanceId).profile,profile(base,state.units[1].instanceId).profile);
}
function rangeOracle(service){const [a,b]=service.state.units;
  for(const [id,base,effective] of ranges){assert.equal(ability(profile(service.projection,a.instanceId),id).parameters.range,effective);
    assert.equal(ability(profile(service.projection,b.instanceId),id).parameters.range,base);}}

test('Real imported stronger invulnerable saves remain 4+ under the 5+ grant',()=>{
  const seed=fixture('detachment-cult-of-the-arkifane:rule','roster-clause-3');
  const f={...seed,text:'+ FACTION KEYWORD: Chaos - Chaos Space Marines\n+ DETACHMENT: Cult of the Arkifane\n'+
    '1x Lord Discordant on Helstalker (100 pts)\n1x Vashtorr the Arkifane (100 pts)\n1x Helbrute (100 pts)\n'};
  const service=runtime(f),[a,b,c]=service.state.units;
  assert.equal(stat(profile(service.projection,a.instanceId),'INSV'),'4+');
  assert.equal(stat(profile(service.projection,b.instanceId),'INSV'),'4+');
  assert.equal(stat(profile(service.projection,c.instanceId),'INSV'),'5+');
});
test('Canonical ability suppression does not remove an independent same-caption identity',()=>{
  const input=clone(book),f=fixture('detachment-renegade-warband:rule','roster-clause-1');
  const ref=input.entities.find(e=>e.id==='unit-chaos-lord').data.ruleReferenceIds.find(id=>input.rosterReferenceSemantics[id]?.abilities.some(a=>a.canonicalId==='army-rule-dark-pacts'));
  input.rosterReferenceSemantics[ref].abilities.push({canonicalId:'army-rule-cult-of-the-dark-gods',name:'Dark Pacts',parameters:{}});
  const service=runtime(f,input);
  for(const raw of service.state.units.filter(u=>u.canonicalUnitId==='unit-chaos-lord')){
    const model=profile(service.projection,raw.instanceId);assert.equal(ability(model,'army-rule-dark-pacts'),undefined);
    assert.ok(ability(model,'army-rule-cult-of-the-dark-gods'));assert.ok(model.suppressedAbilityIds.includes('army-rule-dark-pacts'));
  }
});
test('Three source-backed canonical ability ranges and same-caption isolation',()=>{
  const f=fixture(rangeOwner),input=clone(book),ref=input.entities.find(e=>e.id==='unit-warpsmith').data.ruleReferenceIds.find(id=>input.rosterReferenceSemantics[id]?.abilities);
  input.rosterReferenceSemantics[ref].abilities.push({canonicalId:'army-rule-cult-of-the-dark-gods',name:'Warpsmith',parameters:{range:3}});
  const service=runtime(f,input);rangeOracle(service);
  assert.equal(ability(profile(service.projection,service.state.units[0].instanceId),'army-rule-cult-of-the-dark-gods').parameters.range,3);
  const state=service.snapshot(),removed=clone(state);removed.units[0].enhancementIds=[];removed.units[0].enhancementAssignments=[];
  service.load(removed);for(const [id,base] of ranges)assert.equal(ability(profile(service.projection,state.units[0].instanceId),id).parameters.range,base);
  service.load(state);rangeOracle(service);
});
test('Ogryn presence and exact mixed CHARACTER profile recipients',()=>{
  const f=fixture('datasheet-traitor-enforcer:section:1:block:1:text'),service=runtime(f),[a,b]=service.state.units;
  assert.ok(profile(service.projection,a.instanceId).abilities.some(a=>a.name==='Feel No Pain'&&a.value===4));
  assert.ok(!profile(service.projection,a.instanceId,1).abilities.some(a=>a.name==='Feel No Pain'&&a.value===4));
  const state=service.snapshot();state.units[0].modelRows.splice(1,1);state.units[0].startingStrength=1;service.load(state);
  assert.ok(!profile(service.projection,a.instanceId).abilities.some(a=>a.name==='Feel No Pain'&&a.value===4));
  assert.ok(profile(service.projection,b.instanceId).abilities.some(a=>a.name==='Feel No Pain'&&a.value===4));
});
test('Demagogue profile presence controls attached MODEL invulnerable grant',()=>{
  const f=fixture('datasheet-dark-commune:section:1:block:0:text'),service=runtime(f),state=service.snapshot();
  assert.ok(rows(service.projection,f).length);const first=state.units[0];first.modelRows.splice(0,1);first.startingStrength--;
  service.load(state);assert.equal(rows(service.projection,f).filter(row=>row.sourceInstanceId===first.instanceId).length,0);
});
test('Exact imported Helbrute pair; removal/re-add and duplicate independence',()=>{
  const f=fixture('datasheet-helbrute:section:1:block:1:text'),service=runtime(f),state=service.snapshot(),[a,b]=state.units;
  const positive=rows(service.projection,f);assert.deepEqual(new Set(positive.map(r=>r.targetWeaponProfileId)),
    new Set(['datasheet-helbrute:weapon:11','datasheet-helbrute:weapon:12']));assert.ok(positive.every(r=>Number(r.after)===Number(r.before)+2));
  const absent=clone(state);absent.units[0].modelRows[0].selections=absent.units[0].modelRows[0].selections.filter(s=>!s.canonicalProfileIds.includes('datasheet-helbrute:weapon:12'));
  service.load(absent);assert.equal(rows(service.projection,f).filter(r=>r.sourceInstanceId===a.instanceId).length,0);
  assert.ok(rows(service.projection,f).some(r=>r.sourceInstanceId===b.instanceId));service.load(state);assert.deepEqual(rows(service.projection,f),positive);
});
test('Selected Mark and Allegiance prerequisites are exact imported identities',()=>{
  const f=fixture('detachment-pactbound-zealots:enhancement:2'),service=runtime(f),state=service.snapshot();
  assert.ok(rows(service.projection,f).length);service.load(removeSelection(clone(state),'detachment-pactbound-zealots:rule:mark:4'));
  assert.equal(rows(service.projection,f).length,0);service.load(state);assert.ok(rows(service.projection,f).length);
  const prince=fixture('datasheet-heretic-astartes-daemon-prince:section:3:option:3','selected-characteristic-modifier'),p=runtime(prince),s=p.snapshot();
  const a=s.units[0].instanceId,base=formRoster(book,s);assert.equal(Number(stat(profile(p.projection,a),'T')),Number(stat(profile(base,a),'T'))+1);
  p.load(removeSelection(clone(s),prince.owner));assert.equal(stat(profile(p.projection,a),'T'),stat(profile(base,a),'T'));
});

const markOwner='detachment-pactbound-zealots:rule',markClause='source-clause-1-1';
const markWords=['KHORNE','TZEENTCH','NURGLE','SLAANESH','CHAOS UNDIVIDED'];
const markFixture=fixture(markOwner,markClause),markPayload=makePersonalPayload();
const markCards=personal.prepareRosterPresentationCards(new Map(markPayload.cards.map(card=>[card.id,card])),markPayload.rosterPresentation);
function markService(text=markFixture.text) {
  const service=createCSMBrowserRoster(book,importBook,bindings);
  assert.equal(service.import(text).status,'READY');return service;
}
function checkMark(service,instanceId,word) {
  const raw=service.state.units.find(unit=>unit.instanceId===instanceId),projection=service.projection;
  const actual=unit(projection,instanceId),base=unit(formRoster(book,service.state),instanceId);
  assert.deepEqual(actual.keywords.filter(keyword=>markWords.includes(keyword)),word?[word]:[]);
  assert.deepEqual(actual.profiles.map(model=>model.keywords),base.profiles.map(model=>model.keywords),'UNIT Mark must not rewrite MODEL keywords');
  assert.deepEqual(actual.profiles.map(model=>model.profile),base.profiles.map(model=>model.profile),'Mark must not execute battle characteristic effects');
  assert.deepEqual(actual.profiles.map(model=>model.weapons),base.profiles.map(model=>model.weapons),'Mark must not execute Dark Pact weapon effects');
  const proof=rows(projection,markFixture).filter(row=>row.targetInstanceId===instanceId);
  assert.equal(proof.length,word?1:0);
  if(word){assert.equal(proof[0].sourceInstanceId,null);assert.equal(proof[0].targetProfileId,null);assert.equal(proof[0].operation,'GRANT_UNIT_KEYWORD');}
  const effective=service.effective(instanceId);
  assert.equal(effective.keywords.filter(keyword=>keyword===word).length,word?1:0);
  const root=personal.projectInstanceCards(markCards,raw,effective).get(raw.canonicalUnitId)[0];
  assert.equal(root.fields.filter(field=>field.value===word).length,word?1:0,'Selected UNIT Mark appears once in Personal Guide');
  assert.deepEqual(root.fields.filter(field=>field.presentationPath?.startsWith('/factionKeywords/')).map(field=>field.value),
    markCards.get(raw.canonicalUnitId).fields.filter(field=>field.presentationPath?.startsWith('/factionKeywords/')).map(field=>field.value),
    'Faction Keywords remain source-backed and unchanged');
}
for(const word of markWords)test('Real import -> Effective Datasheet -> Personal Guide selected UNIT Mark '+word,()=>{
  const service=markService(markFixture.text.replaceAll('Mark: KHORNE','Mark: '+word));
  for(const raw of service.state.units)checkMark(service,raw.instanceId,word);
  assert.equal(service.state.units[0].selectedMarkId,book.entities.find(entity=>entity.data.selectionRuleId===markOwner&&entity.data.keyword===word).id);
});
test('Unselected Marks, duplicate physical owners, change/remove/restore and missing Detachment',()=>{
  const absent=markService(markFixture.text.replace(/^Mark: KHORNE\n/gm,''));
  for(const raw of absent.state.units)checkMark(absent,raw.instanceId,null);
  let index=0;
  const text=markFixture.text.replaceAll('Mark: KHORNE',()=>`Mark: ${['TZEENTCH','NURGLE','TZEENTCH','NURGLE'][index++]}`);
  const service=markService(text);
  const state=service.snapshot(),[a,b]=state.units;
  checkMark(service,a.instanceId,'TZEENTCH');checkMark(service,b.instanceId,'NURGLE');
  assert.equal(service.import(text.replace('Mark: TZEENTCH','Mark: SLAANESH')).status,'READY');
  checkMark(service,a.instanceId,'SLAANESH');checkMark(service,b.instanceId,'NURGLE');
  const removed=markService(text.replace('Mark: TZEENTCH\n','')).snapshot();
  assert.ok(!Object.hasOwn(removed.units[0],'selectedMarkId'));
  service.load(removed);checkMark(service,a.instanceId,null);checkMark(service,b.instanceId,'NURGLE');
  service.load(state);checkMark(service,a.instanceId,'TZEENTCH');
  const reordered=clone(state);reordered.units.reverse();service.load(reordered);
  checkMark(service,a.instanceId,'TZEENTCH');checkMark(service,b.instanceId,'NURGLE');
  const missing=clone(state);missing.detachmentIds=['detachment-veterans-of-the-long-war'];
  missing.detachments=[{instanceId:'replacement',canonicalDetachmentId:missing.detachmentIds[0]}];
  assert.throws(()=>service.load(missing),/Unresolved selected option/);
  for(const raw of missing.units)removeSelection(missing,raw.selectedMarkId);
  service.load(missing);for(const raw of missing.units)checkMark(service,raw.instanceId,null);
  service.load(state);checkMark(service,a.instanceId,'TZEENTCH');
});
test('Selected physical Mark retains component ownership through attach/detach/reattach',()=>{
  const service=markService(),[leader,,bodyguard]=service.state.units,first=service.projection;
  service.attach(leader.instanceId,bodyguard.instanceId);const attached=service.projection;
  for(const raw of service.state.units)checkMark(service,raw.instanceId,'KHORNE');
  assert.equal(attached.formedUnits[0].keywords.filter(keyword=>keyword==='KHORNE').length,1);
  for(const id of [leader.instanceId,bodyguard.instanceId])assert.equal(rows(attached,markFixture).filter(row=>row.targetInstanceId===id).length,1,'Formation dedup must not lose a physical Mark recipient');
  service.detach(leader.instanceId);assert.deepEqual(service.projection,first);
  service.reattach(leader.instanceId,bodyguard.instanceId);assert.deepEqual(service.projection,attached);
  let ordinal=0;
  const invalid=markService(markFixture.text.replaceAll('Mark: KHORNE',()=>++ordinal===3?'Mark: NURGLE':'Mark: KHORNE')).snapshot();
  invalid.attachments=clone(service.state.attachments);
  assert.throws(()=>service.load(invalid),/attachment|Mark|mark/i,'Different selected Marks cannot form an attachment');
});
test('Source-excluded Mark recipients fail closed, including native and selected-option Marks',()=>{
  for(const id of ['unit-abaddon-the-despoiler','unit-master-of-possession']) {
    const service=markService(),state=service.snapshot();
    // The native source exclusion is checked with canonical physical composition,
    // never by editing source facts or borrowing an Attached Unit keyword.
    const canonical=book.entities.find(entity=>entity.id===id);
    state.units[0]={...state.units[0],canonicalUnitId:id,startingStrength:1,
      modelRows:canonical.data.profileIds.map((profileId,i)=>({rowId:'excluded-'+i,canonicalProfileId:profileId,
        quantity:book.entities.find(entity=>entity.id===profileId).data.composition.quantity.min,selections:[],loadouts:[]}))};
    state.units[0].startingStrength=state.units[0].modelRows.reduce((sum,row)=>sum+row.quantity,0);
    assert.throws(()=>service.load(state),/Source-excluded selected Mark/);
  }
  const service=markService(markFixture.text.replaceAll('Mark: KHORNE','Mark: NURGLE')),state=service.snapshot(),native=book.entities.find(entity=>entity.id==='unit-khorne-lord-of-skulls');
  state.units[0]={...state.units[0],canonicalUnitId:native.id,startingStrength:1,
    modelRows:native.data.profileIds.map((id,i)=>({rowId:'native-'+i,canonicalProfileId:id,quantity:1,selections:[],loadouts:[]})),
    selectedMarkId:markOwner+':mark:3'};
  service.load(state);
  assert.equal(rows(service.projection,markFixture).filter(row=>row.targetInstanceId===state.units[0].instanceId).length,0);
  assert.deepEqual(unit(service.projection,state.units[0].instanceId).keywords.filter(word=>markWords.includes(word)),['KHORNE']);
  const prince=runtime(fixture('datasheet-heretic-astartes-daemon-prince:section:3:option:3','selected-characteristic-modifier')).snapshot();
  prince.detachmentIds.push('detachment-pactbound-zealots');prince.detachments.push({instanceId:'pactbound',canonicalDetachmentId:'detachment-pactbound-zealots'});
  prince.units[0].selectedMarkId=markOwner+':mark:4';
  const projected=runtimeFromState(prince).projection;
  assert.equal(rows(projected,markFixture).filter(row=>row.targetInstanceId===prince.units[0].instanceId).length,0,'Selected Allegiance already provides a Mark');
  assert.deepEqual(unit(projected,prince.units[0].instanceId).keywords.filter(word=>markWords.includes(word)),['NURGLE']);
});
test('Exactly the five roster Mark grants were added; all battle-only payloads remain empty',()=>{
  const clause=book.entities.find(entity=>entity.id===markOwner).ruleContract.clauses.find(clause=>clause.id===markClause);
  assert.equal(selectedMarkClause,markOwner+'::'+markClause);
  assert.deepEqual(clause.rosterEffects.map(effect=>effect.keyword),markWords);
  assert.ok(clause.rosterEffects.every(effect=>effect.unitScope==='PHYSICAL'&&effect.targetBinding==='ROSTER_UNITS'&&
    effect.conditions.every(condition=>condition.binding==='TARGET')));
  for(const rule of book.entities)for(const clause of rule.ruleContract?.clauses||[])if(clause.rosterClassification==='BATTLE_ONLY')assert.deepEqual(clause.rosterEffects,[]);
});
test('Bearer-owned weapons remain isolated from Disciples and attached Bodyguard',()=>{
  const f=fixture('detachment-creations-of-bile:enhancement:4'),service=runtime(f),[a,b,bodyguard]=service.state.units;
  const base=formRoster(book,service.state),crozius='datasheet-dark-apostle:weapon:2';
  assert.equal(Number(weapon(profile(service.projection,a.instanceId),crozius).data.damage),Number(weapon(profile(base,a.instanceId),crozius).data.damage)+1);
  assert.deepEqual(profile(service.projection,a.instanceId,1).weapons,profile(base,a.instanceId,1).weapons);
  assert.deepEqual(profile(service.projection,b.instanceId).weapons,profile(base,b.instanceId).weapons);
  service.attach(bodyguard.instanceId,a.instanceId);assert.ok(rows(service.projection,f).every(row=>row.targetInstanceId===a.instanceId));
  service.detach(a.instanceId);assert.deepEqual(profile(service.projection,a.instanceId).weapons,profile(runtime(f).projection,a.instanceId).weapons);
});
test('Fabius requires explicit initial attachment and does not transfer to another Bodyguard',()=>{
  const f=fixture('datasheet-fabius-bile:section:1:block:0:text','bodyguard-toughness'),service=runtime(f),state=service.snapshot();
  assert.ok(rows(service.projection,f).length);const absent=clone(state);delete absent.initialAttachments;
  assert.equal(rows(runtimeFromState(absent).projection,f).length,0,'Current attachment must not invent initial history');
  service.detach(state.units[0].instanceId);assert.equal(rows(service.projection,f).length,0);
  service.reattach(state.units[3].instanceId,state.units[0].instanceId);assert.equal(rows(service.projection,f).length,0);
  service.reattach(state.units[2].instanceId,state.units[0].instanceId);assert.ok(rows(service.projection,f).length);
});
test('Actual imported multiple Detachments never assign a unit to one Detachment',()=>{
  const f={...woundsFixture,text:woundsFixture.text.replace('+ DETACHMENT: Creations of Bile',
    '+ DETACHMENT: Creations of Bile, Renegade Raiders')},service=runtime(f),state=service.snapshot();
  assert.deepEqual(state.detachmentIds,['detachment-creations-of-bile','detachment-renegade-raiders']);
  assert.ok(state.units.every(raw=>!Object.hasOwn(raw,'detachmentId')));woundsOracle(service);
  for(const raw of state.units.slice(0,2))assert.ok(profile(service.projection,raw.instanceId).weapons.filter(w=>w.data.mode==='ranged')
    .every(w=>w.data.abilities.includes('ASSAULT')),'Global selected Detachment excludes unrelated duplicate');
  const before=service.projection,removed=clone(state);removed.detachmentIds=removed.detachmentIds.filter(id=>id!=='detachment-renegade-raiders');
  removed.detachments=removed.detachments.filter(item=>item.canonicalDetachmentId!=='detachment-renegade-raiders');service.load(removed);woundsOracle(service);
  assert.ok(profile(service.projection,state.units[0].instanceId).weapons.filter(w=>w.data.mode==='ranged')
    .every(w=>!w.data.abilities.includes('ASSAULT')));service.load(state);assert.deepEqual(service.projection,before);
});
test('Independent source Wounds +1 oracle',()=>woundsOracle(runtime(woundsFixture)));

test('Canonical exclusive group proof survives dispatch normalization and rejects a foreign group',()=>{
  const f=fixture('datasheet-heretic-astartes-daemon-prince:section:3:option:3','selected-characteristic-modifier'),service=runtime(f);
  const state=service.snapshot(),selection=state.units[0].selections.find(selection=>selection.canonicalOptionIds?.includes(f.owner));
  assert.equal(selection.exclusiveGroupId,'datasheet-heretic-astartes-daemon-prince:section:3');
  assert.equal(importBook.entities.find(entity=>entity.id===f.owner).parentId,selection.exclusiveGroupId);
  assert.equal(book.entities.find(entity=>entity.id===f.owner).canonicalOwnerId,selection.exclusiveGroupId);
  selection.exclusiveGroupId='datasheet-heretic-astartes-daemon-prince-with-wings:section:3';
  const before=service.projection,snapshot=service.snapshot();
  assert.throws(()=>service.load(state),/exclusive selection group/);assert.deepEqual(service.projection,before);assert.deepEqual(service.snapshot(),snapshot);
  const exposed=service.projection;exposed.units[0].profiles[0].keywords=[];
  assert.deepEqual(service.projection,before,'Returned projection copy mutated internal state');
});

test('Missing mixed MODEL bearer is not guessed from physical unit ownership',()=>{
  const f=fixture('detachment-creations-of-bile:enhancement:4'),service=createCSMRosterRuntime(book,importBook,bindings);
  assert.throws(()=>service.import(f.text),/Ambiguous physical Enhancement bearer/);
  assert.equal(service.state,null);assert.equal(service.projection,null);
});

mutation('wrong physical Enhancement owner',()=>{const state=imported(woundsFixture),a=state.units[0],b=state.units[1];
  a.enhancementIds=[];a.enhancementAssignments=[];b.enhancementIds=[woundsOwner];
  woundsOracle(runtimeFromState(state));});
mutation('wrong mixed MODEL/profile bearer',()=>{const f=fixture('detachment-creations-of-bile:enhancement:4'),state=imported(f),a=state.units[0];
  a.enhancementAssignments[0].modelScopeId=profile(formRoster(book,state),a.instanceId,1).scopeId;runtimeFromState(state);});
mutation('wrong Enhancement identity',()=>{const state=imported(woundsFixture),other='detachment-creations-of-bile:enhancement:1';state.units[0].enhancementIds=[other];
  state.units[0].enhancementAssignments[0].enhancementId=other;
  woundsOracle(runtimeFromState(state));});
mutation('missing Detachment prerequisite',()=>{const f=fixture('detachment-renegade-raiders:rule'),input=clone(book);
  delete input.entities.find(e=>e.id===f.owner).ruleContract.detachmentId;
  const absent={...f,text:f.text.replace('+ DETACHMENT: Renegade Raiders','+ DETACHMENT: Veterans of the Long War')};
  assert.equal(rows(runtime(absent,input).projection,f).length,0,'Unselected Detachment must not grant ASSAULT');});
mutation('wrong selected Mark',()=>{const f=fixture('detachment-pactbound-zealots:enhancement:2'),changed={...f,text:f.text.replaceAll('Mark: SLAANESH','Mark: NURGLE')};
  assert.ok(rows(runtime(changed).projection,f).length,'Expected source-proven SLAANESH FNP grant');});
mutation('wrong selected Allegiance option',()=>{const f=fixture('datasheet-heretic-astartes-daemon-prince:section:3:option:3','selected-characteristic-modifier'),changed={...f,text:f.text.replace('Daemonic Allegiance: Nurgle','Daemonic Allegiance: Slaanesh')};
  assert.ok(rows(runtime(changed).projection,f).length,'Expected source-proven NURGLE +1 Toughness');});
mutation('wrong canonical weapon identity',()=>{const f=fixture('detachment-pactbound-zealots:enhancement:4'),input=clone(book);
  for(const e of input.entities.find(e=>e.id===f.owner).ruleContract.clauses[0].rosterEffects)e.weaponIds=['datasheet-dark-apostle:weapon:3'];
  const service=runtime(f,input),id=service.state.units[0].instanceId,base=formRoster(book,service.state),key='datasheet-dark-apostle:weapon:2';
  assert.equal(Number(weapon(profile(service.projection,id),key).data.attacks),Number(weapon(profile(base,id),key).data.attacks)+1);});
mutation('wrong canonical ability identity',()=>{const input=clone(book),e=input.entities.find(e=>e.id===rangeOwner).ruleContract.clauses[0].rosterEffects[0];
  e.ability.canonicalId=ranges[1][0];rangeOracle(runtime(fixture(rangeOwner),input));});
mutation('changed numeric modifier value',()=>{const input=clone(book);input.entities.find(e=>e.id===woundsOwner).ruleContract.clauses[0].rosterEffects[0].value=2;
  woundsOracle(runtime(woundsFixture,input));});

assert.equal(JSON.stringify(book),original);assert.equal(JSON.stringify(importBook),canonical);
assert.equal(mutations.length,9);
console.log(JSON.stringify({status:'PASS',realImportEdgeControls:checks.length,checks,mutationsDetected:mutations.length,mutations,
  canonicalFactsMutated:0,baseDatasheetsMutated:0,instanceLeakage:0,profileLeakage:0,battleEffectLeakage:0}));

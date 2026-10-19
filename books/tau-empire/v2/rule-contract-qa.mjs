/** Independent accepted-source Stage 3 expectations. No import/frontend claim. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {buildTauContracts} from './rule-contract-build.mjs';
import {createRosterRuntime} from '../../shared/roster-v2/runtime.mjs';

const read=file=>JSON.parse(fs.readFileSync(new URL(file,import.meta.url),'utf8'));
const expected=read('./rule-contract-expectations.json'),facts=read('./generated/effective.json');
const clone=structuredClone,root=new URL('../../../',import.meta.url);
const sha=value=>createHash('sha256').update(value).digest('hex').toUpperCase();
const compact=value=>value.replace(/\s+/g,'');
const decode=value=>value.replace(/&#x([0-9a-f]+);/gi,(_,n)=>String.fromCodePoint(parseInt(n,16)))
 .replace(/&#(\d+);/g,(_,n)=>String.fromCodePoint(Number(n)))
 .replace(/&(nbsp|amp|quot|lt|gt|rsquo|lsquo|rdquo|ldquo|ndash|mdash);/g,(_,name)=>({nbsp:' ',amp:'&',quot:'"',lt:'<',gt:'>',rsquo:'’',lsquo:'‘',rdquo:'”',ldquo:'“',ndash:'–',mdash:'—'})[name]);
const visible=value=>decode(value.replace(/<[^>]*>/g,''));
const report={schema:'tau-empire-v2-rule-contract-qa/v1',scope:'SOURCE_TO_BOUND_CONTRACT_TO_SHARED_EXECUTOR_ONLY',sourceChecks:[],bindingChecks:[],runtimeCases:[],negativeControls:[],mutations:[],nativeChecks:[],stage4Dependencies:[]};

function checkPending(artifact){
 const oracle=expected.deferredSelectionExpectations.find(item=>item.id==='prototype-weapon-choice'),pending=artifact.pendingPhysicalBindings;
 assert.equal(pending?.length,oracle.canonicalIds.length,'Missing pending source-backed weapon declaration');
 for(const [index,id]of oracle.canonicalIds.entries()){
  const declarations=pending.filter(item=>item.ruleId===id);assert.equal(declarations.length,1,'Missing/duplicate pending source owner');
  const declaration=declarations[0];assert.equal(declaration.ownerId,'detachment-experimental-prototype-cadre');
  assert.equal(declaration.status,'NOT_PROVEN');assert.equal(declaration.executable,false,'Physical choice dependency silently executed');
  assert.equal(declaration.dependency,'one-physical-weapon-choice');assert.ok(declaration.missingBinding,'Unexplained physical dependency');
  assert.deepEqual([...declaration.eligibleWeaponProfileIds].sort(),[...oracle.eligibleWeaponIds[index]].sort(),'Wrong source weapon identities');
  assert.deepEqual(declaration.operationSpecs.map(signature).sort((a,b)=>a.field.localeCompare(b.field)),
   Object.entries(oracle.expectedDeltas[index]).map(([field,value])=>({operation:'MODIFY_STAT',field,mode:'ADD',value})).sort((a,b)=>a.field.localeCompare(b.field)),'Wrong independent source weapon values');
  assert.equal(declaration.sourceReference.entityId,id,'Pending source identity');
  assert.equal(declaration.provenance.document,oracle.independentSources[index].document,'Pending provenance');
  const contract=artifact.contracts.find(candidate=>candidate.ruleId===id);assert.ok(contract,'Pending full source text lost');
  assert.ok(contract.clauses.every(clause=>clause.rosterEffects.length===0),'Unconfirmed physical weapon selection applied automatically');
 }
}

function sourceCheck(spec){
 const raw=fs.readFileSync(new URL(spec.document,root));
 assert.equal(sha(raw),spec.sha256,'Independent accepted source bytes');
 if(spec.quote){assert.equal(sha(spec.quote),spec.quoteSha256,'Independent quote integrity');assert.ok(compact(visible(raw.toString('utf8'))).includes(compact(spec.quote)),`Accepted raw quote missing: ${spec.quote}`);}
}
function checkNativeSeed(book,native){
 const reference=book.entities.find(entity=>entity.id===native.canonicalId);assert.equal(reference?.parentId,native.ownerId,'Native owner');
 const seed=book.rosterReferenceSemantics?.[native.canonicalId];
 assert.equal(seed?.scope,native.scope,'Native reference scope');
 assert.deepEqual(seed.modelProfileIds,native.modelProfileIds,'Native physical profile recipients');
 assert.deepEqual(seed.compositionMemberIds,native.compositionMemberIds,'Native physical composition recipients');
 assert.equal(seed.abilities?.length,1,'Missing/duplicate native ability');
 assert.equal(seed.abilities[0].canonicalId,native.targetId,'Native Core identity');
 assert.deepEqual(seed.abilities[0].parameters,native.parameters,'Native numeric semantics');
 assert.equal(seed.provenance.document,native.source.document,'Native source provenance');
}
const operationKeys=['operation','field','mode','value','ability','keyword','weaponMode'];
const signature=operation=>Object.fromEntries(operationKeys.filter(key=>Object.hasOwn(operation,key)).map(key=>[key,operation[key]]));
const allEffects=entity=>entity.ruleContract?.clauses.flatMap(clause=>clause.rosterEffects||[])||[];
function matchingClauses(book,e){
 const entity=book.entities.find(record=>record.id===e.canonicalId);
 return entity?.ruleContract?.clauses.filter(clause=>clause.rosterEffects?.length&&
  (compact(clause.sourceText||'').includes(compact(e.source.quote))||compact(e.source.quote).includes(compact(clause.sourceText||''))))||[];
}
function checkBinding(book,e){
 const entity=book.entities.find(record=>record.id===e.canonicalId);
 assert.equal(entity?.parentId??null,e.canonicalOwnerId,'Independent canonical owner');
 assert.equal(entity.ruleContract?.ownerId,e.canonicalOwnerId||book.bookId,'Independent bound owner');
 assert.equal(entity.provenance.document,e.source.document,'Independent provenance document');
 const clauses=matchingClauses(book,e),effects=clauses.flatMap(clause=>clause.rosterEffects||[]);
 assert.ok(clauses.length,'Missing independently required source clause');
 const physical=effects.filter(effect=>!effect.id.endsWith('/formed'));
 assert.deepEqual(physical.map(signature).sort((a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b))),e.expectedOperations.map(signature).sort((a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b))),'Independent typed operation/number');
 assert.equal(new Set(effects.map(effect=>effect.id)).size,effects.length,'Duplicate effect identity');
 for(const effect of effects){
  assert.equal(effect.provenance.canonicalRuleId,e.canonicalId,'Effect canonical identity');
  assert.equal(effect.provenance.canonicalOwnerId,e.canonicalOwnerId,'Effect canonical owner');
  assert.equal(effect.provenance.sourceEvidence.document,e.source.document,'Effect source document');
  if(e.activation.includes('LEADING'))assert.ok(effect.conditions.some(condition=>JSON.stringify(condition).includes('LEADING')),'Required leading gate lost');
 }
 return {clauses,effects};
}

function oneCaseBook(book,e){
 const candidate=clone(book);
 for(const entity of candidate.entities){
  if(entity.id!==e.canonicalId)delete entity.ruleContract;
  else if(entity.ruleContract){
   const allowed=new Set(matchingClauses(candidate,e).map(clause=>clause.id));
   for(const clause of entity.ruleContract.clauses)if(!allowed.has(clause.id)){
    clause.rosterEffects=[];
    if(clause.rosterClassification==='ROSTER_EXECUTABLE')clause.rosterClassification='DISPLAY_ONLY';
   }
  }
 }
 return candidate;
}
function absentBook(book,e){const candidate=oneCaseBook(book,e);delete candidate.entities.find(record=>record.id===e.canonicalId).ruleContract;return candidate;}
const weapons=unit=>[...unit.weapons,...unit.profiles.flatMap(profile=>profile.weapons)];
const stats=profile=>({...profile.profile,...profile.profile.stats});
const observable=unit=>({instanceId:unit.instanceId,keywords:unit.keywords,abilities:unit.abilities||[],metrics:unit.metrics,
 profiles:unit.profiles.map(profile=>({scope:profile.scopeId,quantity:profile.quantity,stats:stats(profile),keywords:profile.keywords,abilities:profile.abilities,metrics:profile.metrics})),
 weapons:weapons(unit).map(weapon=>({id:weapon.canonicalProfileId,scope:weapon.scopeId,quantity:weapon.physicalQuantity,data:weapon.data}))});
function makeUnit(book,id,instanceId){
 const entity=book.entities.find(record=>record.id===id);assert.ok(entity?.kind==='DATASHEET',id);
 const members=book.entities.filter(record=>record.kind==='COMPOSITION_MEMBER'&&record.parentId===id);
 const profiles=entity.data.profileIds;
 return {instanceId,canonicalUnitId:id,startingStrength:profiles.reduce((total,profileId)=>total+Math.max(1,members.filter(member=>member.data.profileId===profileId||member.data.modelProfileId===profileId).reduce((n,member)=>n+(member.data.quantity?.min||1),0)),0),
  warlord:null,enhancementIds:[],selections:[],equipmentContextKnown:true,
  modelRows:profiles.map((profileId,i)=>({rowId:`row-${i+1}`,canonicalProfileId:profileId,quantity:Math.max(1,members.filter(member=>member.data.profileId===profileId||member.data.modelProfileId===profileId).reduce((n,member)=>n+(member.data.quantity?.min||1),0)),
   selections:entity.data.weaponIds.map((weaponId,j)=>({selectionKey:`weapon-${j+1}`,physicalQuantity:1,canonicalProfileIds:[weaponId],canonicalEquipmentIds:[],sourceIds:[weaponId]}))}))};
}
function runtime(book,schema,state){const service=createRosterRuntime(book,schema);service.load(clone(state));return service;}

// State construction is diagnostic only: no importer, owner guessing, DOM or UI.
function scenario(book,e){
 const id=e.leader||e.unit,detachment=e.detachment||'detachment-montka';
 const source=makeUnit(book,id,'source'),duplicate=makeUnit(book,id,'duplicate');
 const others=[makeUnit(book,'unit-devilfish','foreign')];
 if(e.bodyguard)others.unshift(makeUnit(book,e.bodyguard,'bodyguard'));
 const state={schema:'roster-v2/roster',bookId:'tau-empire',rosterId:`independent/${e.id}`,detachmentIds:[detachment],warlordInstanceId:null,units:[source,duplicate,...others],attachments:[]};
 if(e.activation.includes('ENHANCEMENT')||e.activation==='ASSIGNED_UNIT_UPGRADE')source.enhancementIds=[e.canonicalId];
 if(e.activation.includes('LEADING')||e.bodyguard)state.attachments=[{leaderInstanceId:'source',bodyguardInstanceId:'bodyguard',role:'LEADER'}];
 if(e.activation==='SELECTED_EQUIPMENT'){
  const entity=book.entities.find(record=>record.id===e.canonicalId),fieldIndex=entity.data.blocks.findIndex(block=>compact(block.text).includes(compact(e.source.quote)));
  assert.ok(fieldIndex>=0,'Equipment source field');
  source.modelRows[0].selections.push({selectionKey:'independent-equipment',physicalQuantity:1,canonicalProfileIds:[],canonicalEquipmentIds:[e.canonicalId],canonicalFieldPaths:{[e.canonicalId]:[`/blocks/${fieldIndex}/text`]},sourceIds:[e.canonicalId]});
 }
 return state;
}

function assertRuntime(e,service,base){
 const actual=service.projection,baseline=base.projection;
 const recipients=e.activation==='SELECTED_DETACHMENT'?['source','duplicate',...(e.bodyguard?['bodyguard']:[])]:e.recipient.startsWith('FORMED_UNIT')&&e.bodyguard?['source','bodyguard']:['source'];
 for(const unit of actual.units){
  const before=baseline.units.find(candidate=>candidate.instanceId===unit.instanceId);
  if(!recipients.includes(unit.instanceId)){assert.deepEqual(observable(unit),observable(before),'Foreign physical instance changed');continue;}
  for(const operation of e.expectedOperations){
   if(operation.operation==='MODIFY_STAT'&&['M','INSV','W'].includes(operation.field))for(const profile of unit.profiles){
    const old=before.profiles.find(candidate=>candidate.scopeId===profile.scopeId),value=operation.mode==='SET'?operation.value:Number.parseFloat(stats(old)[operation.field])+operation.value;
    assert.equal(Number.parseFloat(stats(profile)[operation.field]),value,'Independent MODEL characteristic');
    assert.equal(stats(profile).SV,stats(old).SV,'Ordinary save changed');
   }
   else if(operation.operation==='GRANT_MODEL_ABILITY')for(const profile of unit.profiles){
    assert.equal(profile.abilities.filter(ability=>ability.name===operation.ability.name).length,1,'FNP duplicate');
    assert.equal(profile.abilities.find(ability=>ability.name===operation.ability.name)?.value,operation.ability.value,'Independent numeric ability');
   }
   else if(['GRANT_MODEL_KEYWORD','REMOVE_KEYWORD'].includes(operation.operation))for(const profile of unit.profiles)
    assert.equal(profile.keywords.includes(operation.keyword),operation.operation==='GRANT_MODEL_KEYWORD','Independent MODEL keyword');
   else if(operation.operation==='GRANT_UNIT_KEYWORD')assert.ok(unit.keywords.includes(operation.keyword),'Independent UNIT keyword');
   else if(operation.operation==='GRANT_ABILITY')assert.equal((unit.abilities||[]).filter(ability=>ability.canonicalId===operation.ability.canonicalId).length,1,'Independent canonical ability');
   else if(operation.operation==='MODIFY_RULE_METRIC'&&operation.field==='detectionRange')assert.equal(unit.metrics.detectionRange?.modifier,operation.value,'Independent detection range');
   else for(const weapon of weapons(unit)){
    const old=weapons(before).find(candidate=>candidate.canonicalProfileId===weapon.canonicalProfileId&&candidate.scopeId===weapon.scopeId);
    const correctMode=!operation.weaponMode||weapon.data.mode===operation.weaponMode;
    const correctWeapon=!e.weaponRestriction||weapon.data.name?.toLowerCase()==='pulse carbine';
    const eligible=correctMode&&correctWeapon;
    if(operation.operation==='GRANT_WEAPON_ABILITY')assert.equal(weapon.data.abilities.some(ability=>ability.toUpperCase()===operation.ability),eligible||old.data.abilities.some(ability=>ability.toUpperCase()===operation.ability),'Independent weapon ability/mode');
    else if(operation.operation==='MODIFY_RULE_METRIC')assert.equal(weapon.data.criticalHitThreshold??6,eligible?operation.value:old.data.criticalHitThreshold??6,'Independent Critical Hit threshold/mode');
    else if(operation.operation==='MODIFY_STAT')assert.equal(Number.parseFloat(weapon.data[operation.field]),Number.parseFloat(old.data[operation.field])+(eligible?operation.value:0),'Independent weapon characteristic/mode');
   }
  }
 }
 const applied=actual.units.flatMap(unit=>unit.applied).filter(row=>row.ruleId===e.canonicalId);
 assert.ok(applied.length,'Positive source clause never reached executor');
 assert.ok(applied.every(row=>recipients.includes(row.targetInstanceId)),'Incorrect physical effect recipient');
 return applied.length;
}

const before=JSON.stringify(facts),built=buildTauContracts(),{book,schema}=built;
assert.equal(JSON.stringify(facts),before,'Stage 2 facts mutated');
assert.deepEqual(buildTauContracts().artifact,built.artifact,'Non-deterministic contracts');
checkPending(built.artifact);
for(const e of expected.cases){
 sourceCheck(e.source);report.sourceChecks.push(e.id);
 if(e.stage4Dependency){report.stage4Dependencies.push({id:e.id,reason:e.stage4Dependency});continue;}
 const binding=checkBinding(book,e);report.bindingChecks.push(e.id);
 const candidate=oneCaseBook(book,e),state=scenario(candidate,e),service=runtime(candidate,schema,state),base=runtime(absentBook(book,e),schema,state);
 const applied=assertRuntime(e,service,base);report.runtimeCases.push({id:e.id,result:'PASS',applied});
 assert.deepEqual(runtime(candidate,schema,service.snapshot()).projection,service.projection,'Reload/recompute accumulates');
 const inactive=clone(state);
 if(e.activation.includes('LEADING'))inactive.attachments=[];
 else if(e.activation.includes('ENHANCEMENT')||e.activation==='ASSIGNED_UNIT_UPGRADE')inactive.units[0].enhancementIds=[];
 else if(e.activation==='SELECTED_EQUIPMENT')inactive.units[0].modelRows.forEach(row=>row.selections=row.selections.filter(selection=>selection.selectionKey!=='independent-equipment'));
 else inactive.detachmentIds=['detachment-kauyon'];
 const noEffect=runtime(candidate,schema,inactive),noSource=runtime(absentBook(book,e),schema,inactive);
 assert.deepEqual(noEffect.projection.units.map(observable),noSource.projection.units.map(observable),'Missing/incorrect activation still applies');
 report.negativeControls.push({id:e.id,type:'source-absent-or-condition-false',result:'PASS'});
 if(e.activation.includes('ENHANCEMENT')||e.activation==='ASSIGNED_UNIT_UPGRADE'){
  const wrongOwner=clone(state);wrongOwner.units[0].enhancementIds=[];
  wrongOwner.units.find(unit=>unit.instanceId==='foreign').enhancementIds=[e.canonicalId];
  const denied=runtime(candidate,schema,wrongOwner),without=runtime(absentBook(book,e),schema,wrongOwner);
  assert.deepEqual(denied.projection.units.map(observable),without.projection.units.map(observable),'Wrong physical/canonical Enhancement owner executed');
  report.negativeControls.push({id:e.id,type:'wrong-enhancement-owner',result:'PASS'});
 }
 if(e.activation==='SELECTED_EQUIPMENT'){
  const wrongOwner=clone(state),gear=wrongOwner.units[0].modelRows[0].selections.find(selection=>selection.selectionKey==='independent-equipment');
  wrongOwner.units[0].modelRows[0].selections=wrongOwner.units[0].modelRows[0].selections.filter(selection=>selection!==gear);
  wrongOwner.units.find(unit=>unit.instanceId==='foreign').modelRows[0].selections.push(gear);
  assert.throws(()=>runtime(candidate,schema,wrongOwner),'Foreign physical equipment owner accepted');
  report.negativeControls.push({id:e.id,type:'foreign-equipment-owner',result:'PASS'});
 }
}
for(const native of expected.nativeExpectations){
 sourceCheck(native.source);
 const reference=book.entities.find(entity=>entity.id===native.canonicalId);assert.equal(reference?.parentId,native.ownerId,'Native owner');
 const seed=book.rosterReferenceSemantics?.[native.canonicalId];
 if(native.targetId.startsWith('army-rule-')){assert.ok(!seed||!seed.abilities?.length,'Army battle rule acquired automatic ability');continue;}
 checkNativeSeed(book,native);
 report.nativeChecks.push(native.canonicalId);
}
const nativeBook=clone(book);nativeBook.entities.forEach(entity=>delete entity.ruleContract);
const normalizeAbility=ability=>({canonicalId:ability.canonicalId,parameters:ability.parameters});
const sortedAbilities=abilities=>abilities.map(normalizeAbility).sort((a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b)));
for(const ownerId of [...new Set(expected.nativeExpectations.map(native=>native.ownerId))]){
 const state={schema:'roster-v2/roster',bookId:'tau-empire',rosterId:'native/'+ownerId,detachmentIds:['detachment-montka'],warlordInstanceId:null,
  units:[makeUnit(nativeBook,ownerId,'native-source'),makeUnit(nativeBook,ownerId,'native-copy'),makeUnit(nativeBook,'unit-devilfish','native-foreign')],attachments:[]};
 const service=runtime(nativeBook,schema,state);
 for(const unit of service.projection.units)for(const profile of unit.profiles){
  const desired=expected.nativeExpectations.filter(native=>native.ownerId===unit.canonicalUnitId&&native.modelProfileIds.includes(profile.canonicalProfileId)&&!native.targetId.startsWith('army-rule-'))
   .map(native=>({canonicalId:native.targetId,parameters:native.parameters}));
  assert.deepEqual(sortedAbilities(profile.abilities),desired.sort((a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b))),'Native reference -> exact physical MODEL bag');
  assert.equal(new Set(profile.abilities.map(ability=>JSON.stringify(normalizeAbility(ability)))).size,profile.abilities.length,'Duplicate native MODEL ability');
 }
}
for(const deferred of expected.deferredSelectionExpectations){
 for(const source of deferred.independentSources)sourceCheck(source);
 for(const weapon of deferred.weaponIdentityProofs||[])sourceCheck(weapon.source);
 report.stage4Dependencies.push({id:deferred.id,reason:deferred.missing});
}
// Three compact integration controls retain EVERY production contract. Their
// numeric/recipient expectations come from the separately enrolled raw quotes.
report.combinedRuntimeCases=[];report.fullBookContractCount=book.entities.filter(entity=>entity.ruleContract).length;
const fixture=(name,ids,detachmentIds)=>({schema:'roster-v2/roster',bookId:'tau-empire',rosterId:`combined/${name}`,detachmentIds,warlordInstanceId:null,
 units:ids.map((id,index)=>makeUnit(book,id,['leader','bodyguard','independent'][index])),attachments:[{leaderInstanceId:'leader',bodyguardInstanceId:'bodyguard',role:'LEADER'}]});
const row=(service,id)=>service.projection.units.find(unit=>unit.instanceId===id);
const baselineWeapon=(unit,weapon)=>weapons(unit).find(candidate=>candidate.canonicalProfileId===weapon.canonicalProfileId&&candidate.scopeId===weapon.scopeId);
const hasWeaponAbility=(weapon,name)=>weapon.data.abilities.some(ability=>ability.toUpperCase()===name);
const rangeDelta=(unit,base,value)=>{for(const weapon of weapons(unit)){
 const before=baselineWeapon(base,weapon);
 if(weapon.data.mode==='ranged')assert.equal(Number.parseFloat(weapon.data.range),Number.parseFloat(before.data.range)+value,'Combined ranged range delta');
 else assert.equal(weapon.data.range,before.data.range,'Combined melee range changed');
}};
const fnp=(unit,value)=>{for(const profile of unit.profiles){const abilities=profile.abilities.filter(ability=>ability.name==='Feel No Pain');
 assert.equal(abilities.length,value===null?0:1,'Combined FNP duplicate/missing');if(value!==null)assert.equal(abilities[0].value,value,'Battle-earned FNP activated without trigger');
}};
{
 const state=fixture('coldstar-grenades-prototype',['unit-commander-in-coldstar-battlesuit','unit-crisis-starscythe-battlesuits','unit-crisis-starscythe-battlesuits'],['detachment-retaliation-cadre','detachment-experimental-prototype-cadre']);
 state.units[0].enhancementIds=['detachment-retaliation-cadre:enhancement:1'];
 const service=runtime(book,schema,state),base=runtime(nativeBook,schema,state);
 for(const id of ['leader','bodyguard']){
  assert.ok(row(service,id).profiles.every(profile=>Number.parseFloat(stats(profile).M)===12),'Combined Coldstar formed Move12');
  assert.ok(weapons(row(service,id)).filter(weapon=>weapon.data.mode==='ranged').every(weapon=>hasWeaponAbility(weapon,'ASSAULT')),'Combined Coldstar formed Assault');
  rangeDelta(row(service,id),row(base,id),6);
 }
 assert.ok(row(service,'leader').profiles.every(profile=>profile.keywords.includes('GRENADES')),'Combined bearer Grenades');
 assert.ok(row(service,'bodyguard').profiles.every(profile=>!profile.keywords.includes('GRENADES')),'Grenades leaked to Bodyguard MODEL');
 assert.deepEqual(observable(row(service,'independent')),observable(row(base,'independent')),'Combined independent Crisis changed');
 const before=service.projection;assert.deepEqual(runtime(book,schema,service.snapshot()).projection,before,'Combined reload accumulated effects');
 service.detach('leader');
 rangeDelta(row(service,'leader'),row(base,'leader'),6);
 assert.deepEqual(observable(row(service,'bodyguard')),observable(row(base,'bodyguard')),'Detached Crisis retained Commander/formed CHARACTER range');
 assert.ok(row(service,'leader').profiles.every(profile=>profile.keywords.includes('GRENADES')),'Detach removed bearer Enhancement');
 service.reattach('leader','bodyguard');assert.deepEqual(service.projection,before,'Combined reattach changed effect stack');
 report.combinedRuntimeCases.push({id:'coldstar-grenades-prototype',result:'PASS',contractsRemoved:0});
}
{
 const state=fixture('ethereal-hover-fnp',['unit-ethereal','unit-strike-team','unit-strike-team'],['detachment-montka']);
 const gear=expected.cases.find(item=>item.id==='hover-drone'),source=scenario(book,gear).units[0].modelRows[0].selections.find(selection=>selection.selectionKey==='independent-equipment');
 state.units[0].modelRows[0].selections.push(clone(source));
 const service=runtime(book,schema,state),base=runtime(nativeBook,schema,state);
 for(const id of ['leader','bodyguard'])fnp(row(service,id),5);
 assert.ok(row(service,'leader').profiles.every(profile=>Number.parseFloat(stats(profile).M)===10&&profile.keywords.includes('FLY')),'Combined Hover bearer');
 assert.ok(row(service,'bodyguard').profiles.every(profile=>Number.parseFloat(stats(profile).M)===6&&!profile.keywords.includes('FLY')),'Hover leaked to Bodyguard MODEL');
 assert.deepEqual(observable(row(service,'independent')),observable(row(base,'independent')),'Combined independent Strike Team changed');
 assert.ok(service.projection.units.flatMap(unit=>unit.applied).every(effect=>['GRANT_MODEL_ABILITY','MODIFY_STAT','GRANT_MODEL_KEYWORD'].includes(effect.operation)),'Battle-dependent effect activated');
 service.detach('leader');for(const id of ['leader','bodyguard'])fnp(row(service,id),null);
 assert.ok(row(service,'leader').profiles.every(profile=>Number.parseFloat(stats(profile).M)===10&&profile.keywords.includes('FLY')),'Detach removed selected Hover Drone');
 assert.deepEqual(observable(row(service,'bodyguard')),observable(row(base,'bodyguard')),'Detached Strike Team retained FNP');
 report.combinedRuntimeCases.push({id:'ethereal-hover-fnp',result:'PASS',contractsRemoved:0});
}
{
 const state=fixture('kroot-flesh-borthrod',['unit-kroot-flesh-shaper','unit-kroot-carnivores','unit-kroot-carnivores'],['detachment-kroot-hunting-pack']);
 state.units[0].enhancementIds=['detachment-kroot-hunting-pack:enhancement:1'];
 const service=runtime(book,schema,state),base=runtime(nativeBook,schema,state);
 for(const id of ['leader','bodyguard']){
  fnp(row(service,id),6);
  for(const weapon of weapons(row(service,id))){
   const before=baselineWeapon(row(base,id),weapon);
   if(weapon.data.mode==='melee'){assert.ok(hasWeaponAbility(weapon,'SUSTAINED HITS 1'),'Combined Kroot melee Sustained Hits');assert.equal(weapon.data.criticalHitThreshold,5,'Combined Kroot melee Critical5');}
   else {assert.equal(weapon.data.criticalHitThreshold,before.data.criticalHitThreshold,'Critical threshold leaked to ranged weapon');assert.deepEqual(weapon.data.abilities,before.data.abilities,'Melee grant leaked to ranged weapon');}
  }
  for(const profile of row(service,id).profiles)assert.equal(stats(profile).INSV,stats(row(base,id).profiles.find(before=>before.scopeId===profile.scopeId)).INSV,'Skirmish contextual save became unconditional');
 }
 const independent=row(service,'independent'),unaffected=clone(row(base,'independent'));unaffected.keywords=[...new Set([...unaffected.keywords,'BATTLELINE'])].sort();
 assert.deepEqual(observable(independent),observable(unaffected),'Independent Carnivores changed beyond source-correct global Battleline');
 assert.ok(independent.keywords.includes('BATTLELINE'),'Global Carnivore Battleline missing');fnp(independent,null);
 service.detach('leader');for(const id of ['leader','bodyguard'])fnp(row(service,id),null);
 for(const id of ['leader','bodyguard'])for(const weapon of weapons(row(service,id))){const before=baselineWeapon(row(base,id),weapon);assert.deepEqual(weapon.data.abilities,before.data.abilities);assert.equal(weapon.data.criticalHitThreshold,before.data.criticalHitThreshold);}
 report.combinedRuntimeCases.push({id:'kroot-flesh-borthrod',result:'PASS',contractsRemoved:0});
}
// Focused mutation oracles exercise independent required inventory, not counts.
const sample=expected.cases.find(e=>e.id==='volley-fire');
for(const [name,mutate]of [
 ['missing-binding',candidate=>{delete candidate.entities.find(entity=>entity.id===sample.canonicalId).ruleContract;}],
 ['wrong-owner',candidate=>{candidate.entities.find(entity=>entity.id===sample.canonicalId).parentId='unit-devilfish';}],
 ['wrong-value',candidate=>{matchingClauses(candidate,sample)[0].rosterEffects[0].value=2;}],
 ['wrong-recipient',candidate=>{const effect=matchingClauses(candidate,sample)[0].rosterEffects[0];effect.targetBinding='SOURCE_MODEL';effect.targetSubject='MODEL';}],
 ['incorrect-condition',candidate=>{matchingClauses(candidate,sample)[0].rosterEffects.forEach(effect=>effect.conditions=[]);}],
 ['duplicate-effects',candidate=>{const clause=matchingClauses(candidate,sample)[0];clause.rosterEffects.push(clone(clause.rosterEffects[0]));}]
]){
 const candidate=clone(book);mutate(candidate);
 assert.throws(()=>{checkBinding(candidate,sample);const state=scenario(candidate,sample);assertRuntime(sample,runtime(oneCaseBook(candidate,sample),schema,state),runtime(absentBook(candidate,sample),schema,state));},'Mutation escaped: '+name);
 report.mutations.push({name,result:'DETECTED'});
}
const numericNative=expected.nativeExpectations.find(native=>native.targetId==='core-scouts');
for(const [name,mutate]of [
 ['native-missing-binding',seed=>{seed.abilities=[];}],
 ['native-wrong-numeric-value',seed=>{seed.abilities[0].parameters.distance+=1;}],
 ['native-foreign-model-profile',seed=>{seed.modelProfileIds=['datasheet-devilfish:profile:1'];}]
]){
 const candidate=clone(book);mutate(candidate.rosterReferenceSemantics[numericNative.canonicalId]);
 assert.throws(()=>checkNativeSeed(candidate,numericNative),'Native mutation escaped: '+name);
 report.mutations.push({name,result:'DETECTED'});
}
const review=read('./rule-clause-review.json');
const missingReview=clone(review);missingReview.records=missingReview.records.filter(row=>row.canonicalId!=='army-rule-for-the-greater-good:definition');
assert.throws(()=>buildTauContracts({review:missingReview}),'Unclassified conditional source owner escaped');
report.mutations.push({name:'missing-reviewed-source-owner',result:'DETECTED'});
const changedSource=clone(facts);changedSource.entities.find(entity=>entity.id==='datasheet-ethereal:section:1').data.blocks[0].text+=' Additional unreviewed semantic clause.';
assert.throws(()=>buildTauContracts({facts:changedSource}),'Appended source clause escaped review fingerprint');
report.mutations.push({name:'appended-unreviewed-source-clause',result:'DETECTED'});
for(const [name,mutate]of [
 ['pending-physical-binding-removed',pending=>pending.shift()],
 ['pending-physical-value-wrong',pending=>{pending[0].operationSpecs[0].value=999;}]
]){
 const artifact=clone(built.artifact);mutate(artifact.pendingPhysicalBindings);
 assert.throws(()=>checkPending(artifact),'Pending source expectation mutation escaped: '+name);
 report.mutations.push({name,result:'DETECTED'});
}
assert.equal(fs.readFileSync(new URL('./generated/effective.json',import.meta.url),'utf8').trim(),JSON.stringify(facts,null,2),'Stage 2 generated bytes were rewritten');
report.result='PASS';report.frontend='NOT_TESTED_STAGE3';report.importer='NOT_CREATED_STAGE3';
const reportIndex=process.argv.indexOf('--report');
if(reportIndex>=0){assert.ok(process.argv[reportIndex+1],'Missing report path');fs.writeFileSync(process.argv[reportIndex+1],JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({result:report.result,cases:report.runtimeCases.length,combinedCases:report.combinedRuntimeCases.length,fullBookContracts:report.fullBookContractCount,nativeBindings:report.nativeChecks.length,negativeControls:report.negativeControls.length,mutations:report.mutations.length,report:process.argv[reportIndex+1]}));}
else console.log(JSON.stringify(report,null,2));

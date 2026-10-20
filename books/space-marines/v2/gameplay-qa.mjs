/** Source-authored gameplay expectations over constructed physical snapshots.
 * This is focused native V2 QA, not a New Recruit export or browser acceptance.
 */
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {buildSpaceMarinesContracts} from './rule-contract-build.mjs';
import {createSpaceMarinesRosterRuntime} from './roster-runtime.mjs';
import {buildGameplayPresentation} from './gameplay-presentation-build.mjs';
import {formRoster} from '../../shared/roster-v2/context.mjs';
import {projectInstanceCards,projectPersonalBook,projectFormedUnitCards} from '../../shared/army-book-app-v2/personal.mjs';
import {projectAbilityPresentation} from '../../shared/army-book-app-v2/ability-presentation.mjs';
import {consumeMfm} from './mfm-boundary.mjs';

const clone=structuredClone,built=buildSpaceMarinesContracts(),book=built.book;
const facts=JSON.parse(fs.readFileSync(new URL('./generated/effective.json',import.meta.url),'utf8'));
const index=new Map(book.entities.map(e=>[e.id,e])),sourceIndex=new Map(facts.entities.map(e=>[e.id,e]));
const DEFAULT_DET='detachment-sm-6341f5a9b9584677';
const CAPTAIN='unit-sm-99eb03d4f2d448e2',GRAVIS='unit-sm-bc9aa3cbedb2415c',TERM='unit-sm-d101fa171b7a40c4';
const INTERCESSORS='unit-sm-59162946fee84360',IMPULSOR='unit-sm-4fce70f042cc4e5d';
// Literal expected amounts/abilities are reviewed from the source clauses.
// They are not copied from declaration.effects, generated contracts or runtime.
const cases=[];
const add=(ruleId,clauseId,unitId,sourceLiteral,expect,extra={})=>cases.push({ruleId,clauseId,unitId,sourceLiteral,expect,...extra});
add('ability-sm-046203ae581f416e','ranged-assault','unit-sm-f9d22ec2aff840de','This unit’s ranged attacks have [ASSAULT]',{weaponAbility:'ASSAULT',mode:'ranged'});
add('ability-sm-046203ae581f416e','melee-lance','unit-sm-f9d22ec2aff840de','This unit’s melee attacks have [LANCE].',{weaponAbility:'LANCE',mode:'melee'});
for(const [ruleId,unitId]of [
 ['ability-sm-779fefc8580f4b31','unit-sm-536d38b5ac7645dc'],['ability-sm-846fc84a9f914844','unit-sm-4cd4bf89720c4fa0'],
 ['ability-sm-9d616a4674ec4997','unit-sm-ff2af9c56daa4536'],['ability-sm-d0e46ad8ba424e4c','unit-sm-b994e641eaea4060']
])add(ruleId,'litany-melee-lance',unitId,'This unit’s melee attacks have [Lance].',{weaponAbility:'LANCE',mode:'melee'});
add('ability-sm-dec499b740e84d6b','spear-ranged-assault','unit-sm-70b477e461b5487a','This unit’s ranged attacks have [Assault].',{weaponAbility:'ASSAULT',mode:'ranged'});
add('ability-sm-683740758e7c490c','grav-chutes-deep-strike','unit-sm-5d6184dd92154615','This unit has Deep Strike.',{ability:'core-deep-strike'},{equipment:true});
add('ability-sm-7d0c729bd52143f9','orbital-comms-scouts',IMPULSOR,'This unit has Scouts 6".',{ability:'core-scouts',range:6},{equipment:true});
add('ability-sm-b954019b08c44c19','tempormortis-fights-first','unit-sm-a2a8db8a9f124a7f','This unit has Fights First.',{ability:'core-fights-first'});
add('ability-sm-b165097313314e4e','honour-company-objective-control','unit-sm-eb2d6ede583e4473','This unit has +1 OC.',{stats:{OC:1}});
add('ability-sm-30c57ce03186422e','trifold-stealth','unit-sm-55f195878fab446f','- Stealth.',{ability:'core-stealth'});
for(const [ruleId,unitId,sourceLiteral]of [
 ['ability-sm-431f22d15f7545b4','unit-sm-b994e641eaea4060','Relic Shield: This model has +1 W.'],
 ['ability-sm-8c9e7e37a8494c1d',CAPTAIN,'Relic Shield: This model has +1 W.'],
 ['ability-sm-daf87042d20348dd','unit-sm-e595c56eab2f493b','Relic Shield: This model has +1 W.'],
 ['ability-sm-aa81f0067a3140de','unit-sm-5ce71f2f4e5e4ebb','Storm Shield: This model has +1 W.']
])add(ruleId,'shield-extra-wound',unitId,sourceLiteral,{stats:{W:1},modelOnly:true},{equipment:true});
add('ability-sm-097567b13c02404d','storm-shield-invulnerable','unit-sm-4660f547cc3744b0','This model has a 4+ InSv.',{setStats:{INSV:4},modelOnly:true},{equipment:true});
add('ability-sm-63d4ca967fa64b79','combat-shield-invulnerable','unit-sm-74c53544aa694147','This model has 5+ InSv.',{setStats:{INSV:5},modelOnly:true},{equipment:true});
add('ability-sm-68f84cbf74d9438b','shield-dome-invulnerable',IMPULSOR,'This unit has 5+ InSv.',{setStats:{INSV:5}},{equipment:true});
add('detachment-rule-sm-05b00954e4744b59','death-blow-charge',TERM,'Friendly ADEPTUS ASTARTES TERMINATOR units have +1 to charge rolls.',{charge:1},{detachmentId:'detachment-sm-0a8e3fa989c9415e',global:true});
add('detachment-rule-sm-5d279871994f428e','lightning-fast-movement','unit-sm-0dd92e6d8ad54ee6','Friendly ADEPTUS ASTARTES MOUNTED/SPEEDER units have +2" M.',{stats:{M:2}},{detachmentId:'detachment-sm-53f689af321a4813',global:true});
add('detachment-rule-sm-b0de270f61aa47ac','shadow-tactics-stealth',INTERCESSORS,'Friendly ADEPTUS ASTARTES units have Stealth.',{ability:'core-stealth'},{detachmentId:'detachment-sm-39d8ec1f10c44b7b',global:true});
add('enhancement-sm-2e657d2b65ed41fd','war-tempered-melee',CAPTAIN,'This model’s melee attacks have:\n- +1 S.\n- +1 D.',{weaponStats:{strength:1,damage:1},mode:'melee',modelOnly:true});
for(const ruleId of ['enhancement-sm-33db6f7f8bc04d0c','enhancement-sm-4291db0993f24db5'])
 add(ruleId,'armour-save-and-fnp',CAPTAIN,'This model has:\n- 2+ Sv.\n- Feel No Pain 5+.',{setStats:{SV:2},fnp:5,modelOnly:true});
add('enhancement-sm-5f35bb72c3a14bf0','flesh-toughness-and-fnp',CAPTAIN,'Has +1 T.\n- Has Feel No Pain 5+.',{stats:{T:1},fnp:5,modelOnly:true});
add('enhancement-sm-7aeb998517e94f4d','veteran-ranged-sustained',CAPTAIN,'This unit’s ranged attacks have [Sustained Hits 1].',{weaponAbility:'SUSTAINED HITS 1',mode:'ranged'});
add('enhancement-sm-839dc39b99364e56','hunters-eye-ranged',CAPTAIN,'Have [IGNORES COVER].\n- Have [SUSTAINED HITS 1].',{weaponAbilities:['IGNORES COVER','SUSTAINED HITS 1'],mode:'ranged'});
add('enhancement-sm-f2a5e85d052342cd','champion-melee-lethal',TERM,'This unit’s melee attacks have [Lethal Hits].',{weaponAbility:'LETHAL HITS',mode:'melee'});
add('enhancement-sm-a6d2243e7dab403e','gunnery-ranged-heavy','unit-sm-6da1ff60a2ff4591','This unit’s ranged attacks have [Heavy].',{weaponAbility:'HEAVY',mode:'ranged'});
add('enhancement-sm-928cd50003a8461e','blackwing-infiltrators',CAPTAIN,'This unit has Infiltrators.',{ability:'core-infiltrators'});
add('enhancement-sm-07e95c69297b4d6f','relentless-scouts',GRAVIS,'This unit has Scouts 5".',{ability:'core-scouts',range:5});
add('enhancement-sm-1ba9914b76954183','spearpoint-scouts',CAPTAIN,'This unit has Scouts 6".',{ability:'core-scouts',range:6});
add('enhancement-sm-dcbae3c2b6534ac1','immovable-objective-control',GRAVIS,'This unit has +1 OC.',{stats:{OC:1}});
add('enhancement-sm-4fce0dc37bd14c6f','honour-ranged-lethal',CAPTAIN,'This unit’s ranged attacks have [Lethal Hits].',{weaponAbility:'LETHAL HITS',mode:'ranged'});
add('enhancement-sm-37140db132394ce3','redoubtable-invulnerable','unit-sm-6da1ff60a2ff4591','Has 5+ InSv.',{setStats:{INSV:5}});
add('enhancement-sm-4c07c7ad03a44355','standard-static-stats','unit-sm-0b0b22ecffa74125','This model has:\n- +1 OC and Ld.\n- Feel No Pain 5+.',{stats:{OC:1,LD:-1},fnp:5,modelOnly:true});
add('enhancement-sm-16dc6ab9b09f4bd2','umbral-model-abilities',CAPTAIN,'This model has:\n- Fights First.\n- Lone Operative.',{modelAbilities:['core-fights-first','core-lone-operative'],modelOnly:true});
add('enhancement-sm-6d3f4024b9f14a67','master-forged-firearms',CAPTAIN,'This model’s ranged attacks (excluding [Psychic] attacks) have +1 A, S, AP and D.',{weaponStats:{attacks:1,strength:1,ap:-1,damage:1},mode:'ranged',excludeAbility:'PSYCHIC',modelOnly:true});
add('enhancement-sm-bb65f6f6f8834a96','immolator-torrent-attacks','unit-sm-e595c56eab2f493b','This unit’s [TORRENT] weapons have +1 A.',{weaponStats:{attacks:1},requireAbility:'TORRENT'});

function physicalUnit(id,unitId,{enhancementIds=[],equipment=[],aggregateEquipment=[],secondModel=false,weaponIds}={}){
 const source=index.get(unitId);assert.equal(source?.kind,'DATASHEET');
 const select=(canonicalProfileIds,canonicalEquipmentIds,n)=>({selectionKey:id+'/selection/'+n,canonicalProfileIds,canonicalEquipmentIds,
   physicalQuantity:1,perModelQuantity:1,...(canonicalEquipmentIds.length?{canonicalFieldPaths:Object.fromEntries(canonicalEquipmentIds.map(id=>[id,['/text']]))}:{})});
 const weapons=weaponIds||source.data.weaponIds;
 const modelRows=source.data.profileIds.map((profileId,n)=>({rowId:'row-'+n,canonicalProfileId:profileId,compositionScope:'MODEL_ROW',quantity:1,
   selections:[...weapons.map((id,i)=>select([id],[],n+'w'+i)),...(n?[]:equipment.map((id,i)=>select([],[id],n+'e'+i)))]}));
 if(secondModel){const copy=clone(modelRows[0]);copy.rowId='second-independent-model';copy.selections=copy.selections.filter(s=>!s.canonicalEquipmentIds.length);modelRows.push(copy);}
 return {instanceId:id,canonicalUnitId:unitId,startingStrength:modelRows.length,modelRows,
  selections:aggregateEquipment.map((id,i)=>select([],[id],'aggregate'+i)),equipmentContextKnown:true,enhancementIds,
  enhancementAssignments:enhancementIds.filter(id=>index.get(id).ruleContract?.assignment?.identity==='EXACT_PHYSICAL_INSTANCE_MODEL_PROFILE').map(enhancementId=>({enhancementId,modelScopeId:id+'/row-0/PROFILE/row-0'})),warlord:null};
}
function roster(units,detachmentId=DEFAULT_DET){return {schema:'roster-v2/roster',bookId:'space-marines',rosterId:'source-gameplay-diagnostic',
 detachmentIds:[detachmentId],detachments:[{instanceId:'source-detachment',canonicalDetachmentId:detachmentId}],units,attachments:[],warlordInstanceId:null};}
const weapons=unit=>[...unit.weapons,...unit.profiles.flatMap(model=>model.weapons)];
const profileField=(profile,field)=>profile.profile.stats[field]??profile.profile[field];
const numeric=(before,delta)=>{const m=String(before).match(/^(-?\d+)(["+]?)$/);assert.ok(m,'Unsupported independent numeric base '+before);return Number(m[1])+delta;};
const modifiedWeaponValue=(before,delta)=>{
 const raw=String(before),fixed=raw.match(/^(-?\d+)(["+]?)$/);
 if(fixed)return String(Number(fixed[1])+delta)+fixed[2];
 const dice=raw.match(/^(\d*D\d+)(?:\+(\d+))?$/i);assert.ok(dice,'Unsupported independent weapon base '+before);
 const total=Number(dice[2]||0)+delta;return dice[1]+(total?'+'+total:'');
};
const selectedScope=unit=>unit.profiles[0].scopeId;
const traces=(unit,row)=>unit.applied.filter(t=>t.ruleId===row.ruleId&&t.clauseId===row.clauseId);
function assertExpected(service,state,row){
 const unit=service.projection.units.find(u=>u.instanceId==='source'),base=formRoster(book,state).units.find(u=>u.instanceId==='source');
 const expected=row.expect,affectedModels=expected.modelOnly?unit.profiles.slice(0,1):unit.profiles;
 for(const model of affectedModels){
  const before=base.profiles.find(p=>p.scopeId===model.scopeId);
  for(const [field,value]of Object.entries(expected.stats||{}))assert.equal(Number.parseFloat(profileField(model,field)),numeric(profileField(before,field),value),row.ruleId+' '+field);
  for(const [field,value]of Object.entries(expected.setStats||{}))assert.equal(Number.parseFloat(profileField(model,field)),Math.min(Number.parseFloat(profileField(before,field))||Infinity,value),row.ruleId+' '+field);
  if(expected.fnp){const sourceValues=before.abilities.filter(a=>a.name==='Feel No Pain').map(a=>a.value);
   assert.equal(Math.min(...model.abilities.filter(a=>a.name==='Feel No Pain').map(a=>a.value)),Math.min(expected.fnp,...sourceValues),row.ruleId+' FNP');}
  for(const ability of expected.modelAbilities||[])assert.ok(model.abilities.some(a=>a.canonicalId===ability),row.ruleId+' MODEL '+ability);
 }
 if(expected.modelOnly)for(const model of unit.profiles.slice(1)){
  const before=base.profiles.find(p=>p.scopeId===model.scopeId);assert.deepEqual(model.profile,before.profile,'MODEL effect leaked outside its confirmed bearer');
  assert.deepEqual(model.abilities,before.abilities,'MODEL ability leaked outside its confirmed bearer');
 }
 if(expected.ability){const list=unit.abilities||[];assert.ok(list.some(a=>a.canonicalId===expected.ability&&(expected.range===undefined||a.parameters.range===expected.range)),row.ruleId+' UNIT ability');}
 if(expected.charge)assert.equal(unit.metrics.chargeRoll?.modifier,expected.charge,row.ruleId+' Charge');
 const affected=weapons(unit).filter(w=>(!expected.mode||w.data.mode===expected.mode)&&(!expected.modelOnly||w.scopeId===selectedScope(unit))&&
  (!expected.excludeAbility||!w.data.abilities.some(a=>a.toUpperCase()===expected.excludeAbility))&&(!expected.requireAbility||w.data.abilities.some(a=>a.toUpperCase()===expected.requireAbility)));
 if(expected.weaponAbility||expected.weaponAbilities||expected.weaponStats)assert.ok(affected.length,'Empty positive weapon fixture '+row.ruleId);
 for(const weapon of affected){
  const before=weapons(base).find(w=>w.selectionKey===weapon.selectionKey&&w.scopeId===weapon.scopeId&&w.canonicalProfileId===weapon.canonicalProfileId);assert.ok(before);
  for(const a of expected.weaponAbilities||[expected.weaponAbility].filter(Boolean))assert.ok(weapon.data.abilities.some(v=>v.toUpperCase()===a),row.ruleId+' weapon ability '+a);
  for(const [field,value]of Object.entries(expected.weaponStats||{}))assert.equal(String(weapon.data[field]),modifiedWeaponValue(before.data[field],value),row.ruleId+' weapon '+field);
 }
 assert.ok(traces(unit,row).length,'Missing applied source trace '+row.ruleId+' '+row.clauseId);
 assert.ok(traces(unit,row).every(t=>t.targetInstanceId==='source'&&t.sourceFields?.length),'Trace owner/field provenance lost');
 const beforeQty=weapons(base).map(w=>[w.scopeId,w.selectionKey,w.canonicalProfileId,w.physicalQuantity]);
 assert.deepEqual(weapons(unit).map(w=>[w.scopeId,w.selectionKey,w.canonicalProfileId,w.physicalQuantity]),beforeQty,'Gameplay changed physical quantities');
}

const records=[],payload=buildGameplayPresentation(built),cards=new Map(payload.cards.map(card=>[card.id,card]));
let physicalIsolationCases=0,repeatedDatasourceIsolationCases=0,detachmentDeactivationCases=0,ineligibleGlobalRecipientCases=0,unknownBearerCases=0;
assert.equal(cases.length,40,'Independent source-case census changed');
assert.deepEqual(cases.map(row=>row.ruleId+'::'+row.clauseId).sort(),built.artifact.executed.map(row=>row.ruleId+'::'+row.clauseId).sort(),'Production executable coverage differs from independent source expectations');
for(const row of cases){
 const fact=sourceIndex.get(row.ruleId);assert.ok(fact.data.text.includes(row.sourceLiteral),'Independent source clause changed '+row.ruleId);
 const enhancement=fact.kind==='ENHANCEMENT',detachmentId=row.detachmentId||(enhancement?fact.parentId:DEFAULT_DET);
 const options={enhancementIds:enhancement?[row.ruleId]:[],equipment:row.equipment?[row.ruleId]:[]};
 // Explicit source selections include a TORRENT profile for Immolator.
 if(row.expect.requireAbility==='TORRENT')options.weaponIds=index.get(row.unitId).data.weaponIds;
 const unit=physicalUnit('source',row.unitId,options),peer=physicalUnit('peer',row.unitId),unrelated=physicalUnit('unrelated',INTERCESSORS);
 const state=roster([unit,peer,unrelated],detachmentId),service=createSpaceMarinesRosterRuntime(built);service.load(state);
 assertExpected(service,state,row);
 if(!row.global){
  assert.equal(service.projection.units.find(u=>u.instanceId==='unrelated').applied.filter(t=>t.ruleId===row.ruleId&&t.clauseId===row.clauseId).length,0,'Effect escaped source formation');
  physicalIsolationCases++;
  if(enhancement||row.equipment){assert.equal(traces(service.projection.units.find(u=>u.instanceId==='peer'),row).length,0,'Effect leaked to repeated Datasheet');repeatedDatasourceIsolationCases++;}
 }else{
  if(!row.expect.ability){assert.equal(traces(service.projection.units.find(u=>u.instanceId==='unrelated'),row).length,0,'Global effect escaped source eligibility');ineligibleGlobalRecipientCases++;}
  const without=clone(state);without.detachmentIds=[DEFAULT_DET];without.detachments=[{instanceId:'other',canonicalDetachmentId:DEFAULT_DET}];
  if(detachmentId!==DEFAULT_DET){service.load(without);assert.ok(service.projection.units.every(u=>!traces(u,row).length),'Deselected Detachment still executes');service.load(state);detachmentDeactivationCases++;}
 }
 const saved=service.snapshot(),projection=service.projection;service.recompute();assert.deepEqual(service.projection,projection,'Recompute accumulated source effect');
 service.load(saved);assert.deepEqual(service.projection,projection,'Snapshot reload changed source effect');
 const effective=service.effective('source');assert.ok(effective.applied.some(t=>t.ruleId===row.ruleId&&t.clauseId===row.clauseId),'Effective trace missing');
 const variants=projectInstanceCards(cards,saved.units[0],effective);assert.ok(variants.get(row.unitId)?.length,'Effective physical card missing');
 const root=variants.get(row.unitId)[0];
 if(row.expect.charge){const metric=root.rosterUnitMetrics.find(m=>m.key==='chargeRoll');assert.equal(metric.displayValue,'+1');assert.ok(metric.sources.some(t=>t.ruleId===row.ruleId&&t.clauseId===row.clauseId),'Visible Charge attribution lost');}
 for(const profile of effective.profiles){const card=variants.get(profile.id).find(c=>c.scopeId===profile.scopeId);assert.ok(card,'Missing physical MODEL presentation');
  for(const key of Object.keys({...row.expect.stats,...row.expect.setStats})){
   const value=profile.fields.find(f=>f.label===key)?.value??profile.fields.find(f=>f.label==='stats')?.value[key];
   if(value!==undefined)assert.ok(card.fields.some(f=>f.value===value&&(f.source?.path.endsWith('/'+key)||f.presentationPath==='/'+key)),'Computed characteristic lost in card '+key);
  }
 }
 for(const weapon of effective.weapons){const card=variants.get(weapon.id).find(c=>c.scopeId===weapon.scopeId&&c.selectionKey===weapon.selectionKey);assert.ok(card,'Missing physical weapon occurrence presentation');
  for(const key of Object.keys(row.expect.weaponStats||{})){const value=weapon.fields.find(f=>f.label===key).value;assert.equal(card.fields.find(f=>f.source?.path==='/'+key).value,value,'Computed weapon value lost in card');}
 }
 if(row.expect.ability||row.expect.modelAbilities||row.expect.fnp){const presentation=projectAbilityPresentation({instanceId:'source',profiles:effective.profiles,unitAbilities:effective.unitAbilities,applied:effective.applied});
  const abilities=[...presentation.core,...presentation.profiles.flatMap(profile=>profile.abilities)];
  assert.ok(abilities.some(a=>a.sources?.some(t=>t.ruleId===row.ruleId&&t.clauseId===row.clauseId)),'Ability physical source attribution lost');
 }
 const personal=projectPersonalBook(payload,saved);assert.equal(personal.instances.length,3);assert.equal(personal.instances.filter(v=>v.id===row.unitId).length,row.unitId===INTERCESSORS?3:2,'Guide lost repeated physical units');
 if(row.equipment&&row.expect.modelOnly){const unknown=clone(state);unknown.units[0].selections=unknown.units[0].modelRows[0].selections.filter(s=>s.canonicalEquipmentIds.length);unknown.units[0].modelRows[0].selections=unknown.units[0].modelRows[0].selections.filter(s=>!s.canonicalEquipmentIds.length);service.load(unknown);assert.equal(traces(service.projection.units[0],row).length,0,'Unknown MODEL bearer received effect');service.load(state);unknownBearerCases++;}
 records.push({ruleId:row.ruleId,clauseId:row.clauseId,expected:row.expect,source:fact.provenance,status:'PASS',physicalProjection:true,effective:true,personal:true,recompute:true,snapshot:true});
}

// Every executable source clause has an independent recurrence control: deleting
// its effects must fail the same literal expected result, not a mirrored schema.
let mutations=0;
for(const row of cases){
 const candidate={...built,book:clone(book)},entity=candidate.book.entities.find(e=>e.id===row.ruleId),clause=entity.ruleContract.clauses.find(c=>c.id===row.clauseId);
 clause.rosterEffects=[];clause.rosterClassification='DISPLAY_ONLY';
 const source=sourceIndex.get(row.ruleId),det=row.detachmentId||(source.kind==='ENHANCEMENT'?source.parentId:DEFAULT_DET);
 const state=roster([physicalUnit('source',row.unitId,{enhancementIds:source.kind==='ENHANCEMENT'?[row.ruleId]:[],equipment:row.equipment?[row.ruleId]:[]})],det);
 assert.throws(()=>{const service=createSpaceMarinesRosterRuntime(candidate);service.load(state);assertExpected(service,state,row);},undefined,'Missing typed clause passed independent source expectation '+row.ruleId);mutations++;
}

// UNIT grants follow the source formation; MODEL grants stay on the assigned
// bearer. Detach restores recipients and reattach recomputes, without stacking.
let formationControls=0;
for(const [ruleId,expectedUnitGrant]of [['enhancement-sm-839dc39b99364e56',true],['enhancement-sm-2e657d2b65ed41fd',false]]){
 const row=cases.find(c=>c.ruleId===ruleId),state=roster([physicalUnit('source',CAPTAIN,{enhancementIds:[ruleId]}),physicalUnit('bodyguard',INTERCESSORS),physicalUnit('peer',INTERCESSORS)],sourceIndex.get(ruleId).parentId);
 const service=createSpaceMarinesRosterRuntime(built);service.load(state);const before=service.projection;
 service.attach('source','bodyguard');
 assert.equal(service.projection.units.find(u=>u.instanceId==='bodyguard').applied.some(t=>t.ruleId===ruleId),expectedUnitGrant,'MODEL/UNIT formation scope disagrees with source');
 assert.equal(service.projection.units.find(u=>u.instanceId==='peer').applied.some(t=>t.ruleId===ruleId),false);
 const formed=projectFormedUnitCards(cards,service,'bodyguard');assert.equal(formed.components.length,2);
 service.detach('source');assert.deepEqual(service.projection,before,'Detach did not restore source recipients');
 service.attach('source','bodyguard');const attached=service.projection;service.recompute();assert.deepEqual(service.projection,attached);formationControls++;
}

// A MODEL Enhancement changes its assigned physical model, never a second
// identical model or an independently imported instance of the same Datasheet.
const modelCase=cases.find(r=>r.ruleId==='enhancement-sm-6d3f4024b9f14a67');
const modelState=roster([physicalUnit('source',CAPTAIN,{enhancementIds:[modelCase.ruleId],secondModel:true}),physicalUnit('peer',CAPTAIN)],sourceIndex.get(modelCase.ruleId).parentId);
const modelService=createSpaceMarinesRosterRuntime(built);modelService.load(modelState);assertExpected(modelService,modelState,modelCase);
const baseModel=formRoster(book,modelState).units[0],projectedModel=modelService.projection.units[0];
assert.deepEqual(projectedModel.profiles[1].weapons,baseModel.profiles[1].weapons,'Bearer modifier leaked to identical MODEL/profile');
assert.ok(projectedModel.applied.filter(t=>t.ruleId===modelCase.ruleId).every(t=>t.targetWeaponScopeId===projectedModel.profiles[0].scopeId),'Weapon occurrence trace lost exact physical scope');

// The exclusion uses source weapon ability identities, not a weapon name.
const psychic=roster([physicalUnit('source','unit-sm-c60b9f00ff7a42b0',{enhancementIds:[modelCase.ruleId]})],sourceIndex.get(modelCase.ruleId).parentId);
const psychicService=createSpaceMarinesRosterRuntime(built);psychicService.load(psychic);assertExpected(psychicService,psychic,modelCase);
const psychicBase=formRoster(book,psychic).units[0];let exclusions=0;
for(const w of weapons(psychicService.projection.units[0]).filter(w=>w.data.abilities.some(a=>a.toUpperCase()==='PSYCHIC'))){
 const before=weapons(psychicBase).find(b=>b.selectionKey===w.selectionKey&&b.scopeId===w.scopeId&&b.canonicalProfileId===w.canonicalProfileId);assert.deepEqual(w.data,before.data,'Master-forged modifier leaked into Psychic profile');exclusions++;
}assert.ok(exclusions);

const targetedMutations=[];
function mutation(name,ruleId,clauseId,change,state,verify){
 const candidate={...built,book:clone(book)},entity=candidate.book.entities.find(e=>e.id===ruleId),clause=entity.ruleContract.clauses.find(c=>c.id===clauseId);
 change(clause,entity);assert.throws(()=>{const service=createSpaceMarinesRosterRuntime(candidate);service.load(state);verify(service);},undefined,'Undetected mutation '+name);
 targetedMutations.push(name);
}
mutation('wrong-numeric-amount',modelCase.ruleId,modelCase.clauseId,c=>{c.rosterEffects.find(e=>e.field==='attacks').value=2;},modelState,s=>assertExpected(s,modelState,modelCase));
const armourCase=cases.find(c=>c.ruleId==='enhancement-sm-33db6f7f8bc04d0c');
const armourState=roster([physicalUnit('source',CAPTAIN,{enhancementIds:[armourCase.ruleId]})],sourceIndex.get(armourCase.ruleId).parentId);
mutation('wrong-fnp-value',armourCase.ruleId,armourCase.clauseId,c=>{c.rosterEffects.find(e=>e.operation==='GRANT_MODEL_ABILITY').ability.value=4;},armourState,s=>assertExpected(s,armourState,armourCase));
mutation('model-effect-widened-to-unit',modelCase.ruleId,modelCase.clauseId,c=>{for(const e of c.rosterEffects){e.targetBinding='SOURCE_UNIT';e.targetSubject='UNIT';}},modelState,s=>{
 assertExpected(s,modelState,modelCase);assert.deepEqual(s.projection.units[0].profiles[1].weapons,baseModel.profiles[1].weapons,'Widened target reached another MODEL');
});
mutation('missing-psychic-exclusion',modelCase.ruleId,modelCase.clauseId,c=>{for(const e of c.rosterEffects)e.excludeWeaponIds=[];},psychic,s=>{
 for(const weapon of weapons(s.projection.units[0]).filter(w=>w.data.abilities.some(a=>a.toUpperCase()==='PSYCHIC'))){
  const before=weapons(psychicBase).find(w=>w.canonicalProfileId===weapon.canonicalProfileId&&w.scopeId===weapon.scopeId&&w.selectionKey===weapon.selectionKey);assert.deepEqual(weapon.data,before.data);
 }
});
const shieldCase=cases.find(c=>c.ruleId==='ability-sm-8c9e7e37a8494c1d');
const shieldState=roster([physicalUnit('source',CAPTAIN,{equipment:[shieldCase.ruleId],secondModel:true})]);
mutation('missing-physical-equipment-bearer-gate',shieldCase.ruleId,shieldCase.clauseId,c=>{for(const e of c.rosterEffects)e.conditions=e.conditions.filter(condition=>condition.binding!=='TARGET');},shieldState,s=>assertExpected(s,shieldState,shieldCase));

// Explicit assignment to a source-ineligible MODEL must not activate the rule.
const termCase=cases.find(c=>c.ruleId==='enhancement-sm-f2a5e85d052342cd');
const wrongTerm=roster([physicalUnit('source',CAPTAIN,{enhancementIds:[termCase.ruleId]})],sourceIndex.get(termCase.ruleId).parentId);
const wrongTermService=createSpaceMarinesRosterRuntime(built);let wrongEligibilityRejected=false;
try{wrongTermService.load(wrongTerm);}catch{wrongEligibilityRejected=true;}
if(!wrongEligibilityRejected)assert.equal(traces(wrongTermService.projection.units[0],termCase).length,0,'TERMINATOR-only grant applied to a TACTICUS Captain');

// Invalid canonical equipment and foreign MODEL profiles cannot damage the
// previous committed runtime state; this does not assess loadout legality.
let invalidControls=0;
for(const change of [s=>{s.units[0].modelRows[0].canonicalProfileId=index.get(INTERCESSORS).data.profileIds[0];},
 s=>{s.units[0].modelRows[0].selections.push({selectionKey:'bad',canonicalProfileIds:['weapon-not-proven'],canonicalEquipmentIds:[],physicalQuantity:1});},
 s=>{s.units[0].enhancementAssignments[0].modelScopeId='unrelated/unknown-model';}]){
 const before=modelService.snapshot(),bad=clone(before);change(bad);assert.throws(()=>modelService.load(bad));assert.deepEqual(modelService.snapshot(),before,'Invalid candidate replaced previous roster');invalidControls++;
}

// Conditional source role remains explicitly unresolved without army context.
const all=[...built.native.model.entities,...built.native.deathwatch.model.entities];
for(const [presentUnitIds,expected]of [[undefined,null],[[],'leader'],[['unit-sm-1af70808102d4286'],'support']]){
 const consumed=consumeMfm(all,{presentUnitIds}),edges=consumed.relations.filter(e=>e.sourceId==='unit-sm-02d5dee4717544ad');
 if(expected===null){assert.equal(consumed.relationStatus,'NEEDS_ARMY_CONTEXT');assert.equal(edges.length,0);}
 else{assert.equal(edges.length,1);assert.equal(edges[0].role,expected);assert.equal(edges[0].targetId,'unit-sm-f169827c554c4eee');}
}

// The runtime must resolve the complementary role from the actual imported
// army composition, independently of a source-only no-context catalog query.
let catoRuntimeControls=0;
for(const [includeMarneus,expectedRole]of [[false,'LEADER'],[true,'SUPPORT']]){
 const units=[physicalUnit('cato','unit-sm-02d5dee4717544ad'),physicalUnit('victrix','unit-sm-f169827c554c4eee')];
 if(includeMarneus)units.push(physicalUnit('marneus','unit-sm-1af70808102d4286'));
 const service=createSpaceMarinesRosterRuntime(built);service.load(roster(units));
 const policies=service.book.rosterAttachmentPolicies.filter(p=>p.sourceId==='unit-sm-02d5dee4717544ad');assert.equal(policies.length,1);assert.equal(policies[0].role,expectedRole);
 service.attach('cato','victrix');assert.equal(service.projection.formedUnits.length,1);service.detach('cato');assert.equal(service.projection.formedUnits.length,0);catoRuntimeControls++;
}
const company=createSpaceMarinesRosterRuntime(built);company.load(roster([physicalUnit('company','unit-sm-e43fc0c6d8b14ad8')]));
assert.equal(company.book.compatibilityFeasibility.units.find(u=>u.unitId==='unit-sm-e43fc0c6d8b14ad8').intrinsicCharacterModelsMax,1,'Company Heroes Ancient MODEL bound widened to UNIT size');
let pendingScopeControls=0;
for(const id of ['enhancement-sm-1599eafe5bab4e91','enhancement-sm-32c4e009e6c84003']){
 const factual=sourceIndex.get(id),contract=index.get(id).ruleContract;
 assert.equal(factual.data.scope,'MODEL');assert.ok(factual.data.eligibilityText.includes('ADEPTUS ASTARTES unit only.'));
 assert.equal(contract.assignment,undefined,'Unresolved source/factual scope guessed an assignment');assert.ok(contract.clauses.every(c=>!c.rosterEffects.length),'Unresolved source scope executed');
 const service=createSpaceMarinesRosterRuntime(built);service.load(roster([physicalUnit('source',CAPTAIN,{enhancementIds:[id]})],factual.parentId));
 assert.ok(service.projection.units.every(u=>u.applied.every(t=>t.ruleId!==id)),'Unresolved Enhancement gained effects');pendingScopeControls++;
}

console.log(JSON.stringify({status:'PASS',sourceAuthoredCases:records.length,sourceExecutables:built.artifact.executed.length,
 positiveRuntimeCases:records.length,physicalIsolationCases,repeatedDatasourceIsolationCases,detachmentDeactivationCases,ineligibleGlobalRecipientCases,unknownBearerCases,
 wrongEligibleModelControl:{ruleId:termCase.ruleId,result:wrongEligibilityRejected?'REJECTED':'NO_EFFECT'},physicalModelOccurrenceIsolation:true,psychicExclusions:exclusions,
 invalidImportStateControls:invalidControls,conditionalCato:{unknown:'NEEDS_ARMY_CONTEXT',withoutMarneus:'LEADER',withMarneus:'SUPPORT'},
 missingEffectMutationControls:mutations,targetedMutations,formationControls,
 companyHeroesIntrinsicCharacterMax:1,pendingScopeControls,catoRuntimeControls,
 effectiveProjectionCases:records.length,personalProjectionCases:records.length,recompute:records.length,snapshotReload:records.length,
 sourceCases:records,constructedPhysicalFixtures:true,realNewRecruitExportTested:false,browserAcceptance:'NOT_RUN'}));

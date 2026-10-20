/** Constructed New Recruit-format inputs exercise the existing shared resolver.
 * Input quantities and identities are authored from accepted source records,
 * not from import results, gameplay calculations or legacy Space Marines.
 */
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {buildSpaceMarinesContracts} from './rule-contract-build.mjs';
import {buildSpaceMarinesImportBook} from './roster-import-build.mjs';
import {createRosterImportService} from '../../shared/roster-v2/import-service.mjs';
import {normalizeImportLabel} from '../../shared/roster-v2/import.mjs';

const clone=structuredClone,built=buildSpaceMarinesContracts(),book=buildSpaceMarinesImportBook({built,modelMappings:[],scopeCorrections:[]});
const facts=JSON.parse(fs.readFileSync(new URL('./generated/effective.json',import.meta.url),'utf8'));
const source=new Map(facts.entities.map(entity=>[entity.id,entity])),index=new Map(book.entities.map(entity=>[entity.id,entity]));
const units=facts.entities.filter(entity=>entity.kind==='DATASHEET'),profiles=facts.entities.filter(entity=>entity.kind==='MODEL_PROFILE');
const detachments=facts.entities.filter(entity=>entity.kind==='DETACHMENT');
const header='+ FACTION KEYWORD: ADEPTUS ASTARTES\n+ DETACHMENT: Gladius Task Force\n';
const service=()=>createRosterImportService(book,book.importBindings),shared=service();
let controls=0,mutations=0;
const ready=(text,bindings={},target=shared)=>{const result=target.import(text,bindings);assert.equal(result.status,'READY',JSON.stringify({needs:result.needsBindings,errors:result.errors}));return result;};
const unitText=(unit,{gear='',profileIds=unit.data.profileIds,quantity=1}={})=>`${quantity*profileIds.length}x ${unit.data.title} (100 pts)${gear?': '+gear:''}\n`+
  profileIds.map(id=>`• ${quantity}x ${source.get(id).data.name}\n`).join('');
const negative=fn=>{fn();controls++;};
const mutation=fn=>{fn();mutations++;};

assert.equal(units.length,85);assert.equal(profiles.length,117);assert.equal(book.importBindings.enhancements.length,56);
assert.equal(book.importBindings.identityAliases.filter(row=>index.get(row.canonicalId).kind==='DETACHMENT').length,21);
assert.equal(book.importBindings.referenceOnly.length,21);
assert.equal(book.importBindings.compositions.length,114);assert.equal(book.importBindings.unresolvedCompositions.length,3);
const reviewedBook=buildSpaceMarinesImportBook({built});
assert.equal(reviewedBook.importBindings.compositions.length,116);
assert.equal(reviewedBook.importBindings.unresolvedCompositions.length,1);
assert.equal(reviewedBook.importBindings.unresolvedCompositions[0].id,'composition-sm-11f249c8e3af4b85');
assert.equal(reviewedBook.mfmPhysicalPaidOptions.length,8);
const corrected=reviewedBook.importBindings.enhancements.filter(row=>row.sourceCorrection);
assert.equal(corrected.length,2);
for(const item of corrected){
 assert.equal(item.scope,'UNIT');assert.equal(item.unresolved,false);assert.equal(item.eligibility.subject,'UNIT');
 assert.deepEqual(item.eligibility.keywords,['ADEPTUS ASTARTES']);assert.equal(item.eligibility.unresolved,false);
 assert.ok(item.eligibility.eligibilityEvidence.includes('ADEPTUS ASTARTES unit only.'));
 assert.ok(item.eligibility.sourceCorrection.provenance.sourceId);
 assert.equal(item.assignmentReference,null,'No guessed MODEL assignment or new gameplay effect');
}
const reviewedShared=createRosterImportService(reviewedBook,reviewedBook.importBindings);
const reviewedModelInput=header+'5x Vanguard Veteran Squad With Jump Packs (100 pts)\n'+
 '• 1x Vanguard Veteran Sergeant with Jump Pack\n• 4x Vanguard Veteran with Jump Pack\n';
const reviewedModelResult=ready(reviewedModelInput,{},reviewedShared);
assert.deepEqual(reviewedModelResult.roster.units[0].modelRows.map(row=>row.canonicalProfileId),[
 'model-sm-55bf1242f2bb4dae','model-sm-eaba389795c342e3']);
assert.equal(new Set(book.entities.map(row=>row.id)).size,facts.entities.length,'No fabricated facts or foreign Deathwatch owner');
for(const actual of book.entities){
 const original=source.get(actual.id);assert.ok(original);assert.equal(actual.parentId,original.parentId);assert.deepEqual(actual.provenance,original.provenance);
 if(['PROFILE','WEAPON_PROFILE','COMPOSITION_MEMBER'].includes(actual.kind))assert.deepEqual(actual.data,built.book.entities.find(row=>row.id===actual.id).data,'Import metadata never rewrites the proven native physical source view');
}
for(const alias of book.importBindings.identityAliases){
 const entity=source.get(alias.canonicalId);assert.ok(entity.provenance.sourceId);
 for(const label of alias.labels)assert.ok([entity.data.title,entity.data.name,
  ...facts.entities.filter(row=>row.kind==='COMPOSITION_MEMBER'&&row.data.modelProfileId===entity.id).map(row=>row.data.name)].includes(label),'Alias must be literal canonical name with explicit source composition binding');
}

// One diagnostic roster exposes every source MODEL profile with an explicit
// quantity. It does not claim these model combinations are army-legal.
const all=ready(header+units.map(unit=>unitText(unit)).join('')).roster;
assert.equal(all.units.length,85);assert.equal(all.units.reduce((n,unit)=>n+unit.startingStrength,0),117);
for(const [i,unit]of all.units.entries()){
 assert.equal(unit.canonicalUnitId,units[i].id);assert.deepEqual(unit.modelRows.map(row=>row.canonicalProfileId),units[i].data.profileIds);
 assert.ok(unit.modelRows.every(row=>row.quantity===1&&row.selections.length===0),'No fabricated default weapon');
 assert.equal(unit.selections.length,0);
}

// All 386 source weapon profiles are selectable under their own physical UNIT.
// Repeated literal names and alternate modes address one input selection with
// multiple profiles, never several additional physical pieces.
let weaponChecks=0;
for(const unit of units){
 const unique=[...new Set(unit.data.weaponIds.map(id=>source.get(id).data.name))];
 const input=header+unitText(unit,{profileIds:[unit.data.profileIds[0]],gear:unique.map(name=>'1x '+name).join(', ')});
 const imported=ready(input).roster.units[0];assert.equal(imported.selections.length,unique.length);
 for(const [i,label]of unique.entries()){
  const expected=unit.data.weaponIds.filter(id=>source.get(id).data.name===label||
   source.get(id).data.name.split(/\s+[–—-]\s+/)[0]===label);
  assert.deepEqual([...imported.selections[i].canonicalProfileIds].sort(),expected.sort(),unit.data.title+': '+label);
  assert.equal(imported.selections[i].physicalQuantity,1);assert.equal(imported.selections[i].perModelQuantity,null);
  weaponChecks+=expected.length;
 }
 assert.ok(unit.data.weaponIds.every(id=>imported.selections.some(selection=>selection.canonicalProfileIds.includes(id))),'Missing source weapon profile');
}
assert.ok(weaponChecks>=386);

let equipmentChecks=0;
for(const binding of book.importBindings.equipmentSelections){
 const unit=source.get(binding.ownerId),ability=source.get(binding.canonicalEquipmentIds[0]);
 const result=ready(header+unitText(unit,{gear:'2x '+ability.data.title,profileIds:[unit.data.profileIds[0]]})).roster.units[0];
 assert.equal(result.selections.length,1);assert.equal(result.selections[0].physicalQuantity,2);assert.equal(result.selections[0].perModelQuantity,null);
 assert.deepEqual(result.selections[0].canonicalEquipmentIds,[ability.id]);assert.deepEqual(result.selections[0].canonicalFieldPaths,{[ability.id]:['/text']});
 assert.equal(result.modelRows[0].selections.length,0,'Unknown UNIT-level equipment bearer must not be fabricated');
 assert.deepEqual(result.selections[0].sourceReferences,binding.sourceReferences);equipmentChecks++;
}

// Distinct physical occurrences retain their own selected item quantities.
const intercessors=source.get('unit-sm-59162946fee84360'),rifle=source.get('weapon-sm-1a481963a41a4b6a');
const repeated=header+unitText(intercessors,{quantity:1,gear:'1x Bolt Rifle'})+unitText(intercessors,{quantity:3,gear:'4x Bolt Rifle'});
const repeatedState=ready(repeated).roster;
assert.notEqual(repeatedState.units[0].instanceId,repeatedState.units[1].instanceId);
assert.deepEqual(repeatedState.units.map(unit=>unit.selections[0].physicalQuantity),[1,4]);
assert.deepEqual(repeatedState.units.map(unit=>unit.startingStrength),[2,6]);
assert.deepEqual(ready(repeated).roster,repeatedState,'Identical import has deterministic physical identities');
const receiver=service();receiver.load(repeatedState);assert.deepEqual(receiver.snapshot(),repeatedState,'Import-only snapshot validation');

for(const detachment of detachments){
 const text=header.replace('Gladius Task Force',detachment.data.title)+unitText(intercessors);
 assert.deepEqual(ready(text).roster.detachmentIds,[detachment.id]);
}
for(const enhancement of facts.entities.filter(entity=>entity.kind==='ENHANCEMENT')){
 const parent=source.get(enhancement.parentId);
 const result=ready(header.replace('Gladius Task Force',parent.data.title)+unitText(intercessors)+'Enhancement: '+enhancement.data.title+'\n');
 assert.deepEqual(result.roster.units[0].enhancementIds,[enhancement.id],'Import identity only; book adapter validates physical eligibility');
}

negative(()=>{
 const old=shared.snapshot(),result=shared.import(header+unitText(intercessors,{gear:'1x Not A Confirmed Weapon'}));
 assert.equal(result.status,'NEEDS_BINDINGS');assert.deepEqual(shared.snapshot(),old);
});
negative(()=>{
 const old=shared.snapshot(),text=header+unitText(intercessors,{gear:'1x Bolt Rifle'});
 const foreign=facts.entities.find(entity=>entity.kind==='WEAPON_PROFILE'&&entity.parentId!==intercessors.id);
 const result=shared.import(text,{selections:{'parsed-unit-1/unit/selection/1':{canonicalProfileIds:[foreign.id],canonicalEquipmentIds:[]}}});
 assert.equal(result.status,'INVALID');assert.ok(result.errors.some(row=>row.code==='FOREIGN_SELECTION_OWNER'));assert.deepEqual(shared.snapshot(),old);
});
negative(()=>{
 const old=shared.snapshot(),result=shared.import(header+unitText(intercessors),{profiles:{'parsed-unit-1/model-row/1':'not-a-profile'}});
 assert.equal(result.status,'INVALID');assert.deepEqual(shared.snapshot(),old);
});
negative(()=>{
 const result=shared.import(header+'1x Astraeus (100 pts)\n');assert.equal(result.status,'NEEDS_BINDINGS');assert.ok(!result.roster,'REFERENCE_ONLY does not become fabricated DATASHEET');
});
negative(()=>{
 const result=shared.import(header+'1x Deathwatch Veterans (100 pts)\n');assert.equal(result.status,'NEEDS_BINDINGS');
});
for(const change of [
 meta=>{meta.weaponSelections[0].canonicalProfileIds=['missing-profile'];},
 meta=>{meta.weaponSelections[0].ownerId=units.find(unit=>unit.id!==meta.weaponSelections[0].ownerId).id;},
 meta=>{meta.equipmentSelections[0].canonicalFieldPaths[meta.equipmentSelections[0].canonicalEquipmentIds[0]]=['/missing'];},
 meta=>{meta.identityAliases[0].canonicalId='missing-profile';}
])mutation(()=>{const metadata=clone(book.importBindings);change(metadata);assert.throws(()=>createRosterImportService(book,metadata));});
mutation(()=>{
 const metadata=clone(book.importBindings),owner='unit-sm-ddda2ee77e3342c5';
 const binding=metadata.weaponSelections.find(row=>row.ownerId===owner&&row.label==='Melta Rifle');
 assert.ok(binding);const full=clone(binding.canonicalProfileIds);binding.canonicalProfileIds=[full[0]];
 const broken=createRosterImportService(book,metadata),result=ready(header+unitText(source.get(owner),{profileIds:[source.get(owner).data.profileIds[0]],gear:'1x Melta Rifle'}),{},broken);
 assert.notDeepEqual(result.roster.units[0].selections[0].canonicalProfileIds,full,'Mutation control detects dropped unsuffixed base profile');
});

console.log(JSON.stringify({status:'PASS',physicalDatasheets:85,physicalProfileRows:117,sourceWeaponProfiles:386,
 alternativeProfileFamilies:book.importBindings.weaponSelections.filter(row=>row.profileRelationship).length,
 equipmentBindings:equipmentChecks,detachments:21,enhancementsAndUpgrades:56,
 confirmedCompositions:114,unresolvedCompositions:3,reviewedConfirmedCompositions:116,reviewedUnresolvedCompositions:1,
 reviewedUnitScopeCorrections:2,paidOptions:8,inactiveReferences:21,
 negativeControls:controls,mutationControls:mutations,
 constructedNewRecruitFormat:true,REAL_NEW_RECRUIT_EXPORT_TESTED:'NO',frontendVerified:false},null,2));

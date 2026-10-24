/** Constructed contract diagnostics; these are not user New Recruit exports. */
import assert from 'node:assert/strict';
import {createRosterImportService} from './import-service.mjs';
import {formRoster} from './context.mjs';
const books=['death-guard','adeptus-mechanicus','tyranids','tau-empire','emperors-children','chaos-space-marines','space-marines','dark-angels','blood-angels'];
function fixture(bookId,mixed=false){
  const entity=(id,kind,data,parentId=null)=>({id,kind,bookId,parentId,data,provenance:{sourceId:'CONSTRUCTED_DIAGNOSTIC'}});
  return {bookId,rosterAttachmentPolicies:[],entities:[entity('det','DETACHMENT',{title:'Test Detachment'}),
    entity('unit','DATASHEET',{title:'Test Unit',profileIds:mixed?['model','other']:['model'],weaponIds:['gun','pistol'],keywords:[],factionKeywords:[],ruleReferenceIds:[]}),
    entity('model','PROFILE',{name:'Model',stats:{}},'unit'),entity('gun','WEAPON_PROFILE',{name:'Gun',stats:{}},'unit'),
    entity('pistol','WEAPON_PROFILE',{name:'Pistol',stats:{}},'unit'),...(mixed?[entity('other','PROFILE',{name:'Other Model',stats:{}},'unit')]:[])]};
}
const header='+ DETACHMENT: Test Detachment\n';let assertions=0;
for(const bookId of books){
  const book=fixture(bookId),service=createRosterImportService(book,{});
  const text=header+'2x Test Unit (999 pts): 2 with Gun, 2x Pistol';
  const result=service.import(text);assert.equal(result.status,'READY');
  const unit=result.roster.units[0],load=unit.modelRows[0].loadouts[0];
  assert.equal(unit.startingStrength,2);assert.equal(unit.selections.length,0);assert.equal(load.quantity,2);
  assert.deepEqual(load.selections.map(row=>[row.physicalQuantity,row.perModelQuantity]),[[2,1],[4,2]]);
  const projected=formRoster(book,result.roster).units[0];assert.equal(projected.profiles.length,1);assert.equal(projected.profiles[0].quantity,2);
  assert.equal(projected.weapons.length,0);assert.equal(projected.profiles[0].weapons.length,2);
  const snapshot=service.snapshot();service.load(JSON.parse(JSON.stringify(snapshot)));assert.deepEqual(service.snapshot(),snapshot);
  assert.equal(service.import(text).status,'READY');assert.deepEqual(service.snapshot(),snapshot);assertions+=12;
  const split=service.import(header+'2x Test Unit (999 pts): 1 with Gun\n1 with Pistol');
  assert.equal(split.status,'READY');assert.deepEqual(split.roster.units[0].modelRows[0].loadouts.map(row=>row.quantity),[1,1]);
  const scopes=formRoster(book,split.roster).units[0].profiles;assert.deepEqual(scopes.map(row=>row.weapons.map(w=>w.canonicalProfileId)),[['gun'],['pistol']]);assertions+=3;
  const partial=service.import(header+'3x Test Unit (999 pts): 2 with Gun');assert.equal(partial.status,'READY');
  const portions=formRoster(book,partial.roster).units[0].profiles;assert.equal(portions.find(row=>row.quantity===1).weapons.length,0);assertions+=2;
  const saved=service.snapshot();
  for(const bad of ['2x Test Unit (999 pts): 3 with Gun','2x Test Unit (999 pts): 0 with Gun','2x Test Unit (999 pts): 1 with Gun\n2 with Pistol']){
    assert.equal(service.import(header+bad).status,'INVALID');assert.deepEqual(service.snapshot(),saved);assertions+=2;
  }
  const mixed=createRosterImportService(fixture(bookId,true),{});
  const unresolved=mixed.import(header+'2x Test Unit (999 pts): 2 with Gun');assert.equal(unresolved.status,'NEEDS_BINDINGS');
  assert.ok(unresolved.needsBindings.some(row=>row.kind==='PROFILE'&&row.candidateIds.length===2));assertions+=2;
  const explicit=mixed.import(header+'2x Test Unit (999 pts): 2 with Gun',{profiles:{'parsed-unit-1/aggregate':'model'}});assert.equal(explicit.status,'READY');assertions++;
  const named=service.import(header+'2x Test Unit (999 pts)\n• 2x Model: 2 with Gun');assert.equal(named.status,'READY');assertions++;
  const ambiguous=service.import(header+'2x Test Unit (999 pts): 2 with Gun\n• 2x Model');assert.equal(ambiguous.status,'INVALID');assertions++;
}
console.log(JSON.stringify({status:'PASS',books:books.length,assertions,fixtureAuthority:'CONSTRUCTED_GENERIC_CONTRACT_DIAGNOSTICS'}));

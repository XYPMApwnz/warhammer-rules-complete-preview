import assert from 'node:assert/strict';
import {createRosterImportService} from './import-service.mjs';

// Independent fictional canonical registry: equipment selection and rule
// evidence are different records. Choices never imply equipment ownership.
const book={bookId:'synthetic',entities:[
  {id:'formation',kind:'DETACHMENT',data:{title:'Formation'}},
  {id:'crew',kind:'DATASHEET',data:{title:'Crew',profileIds:['model'],weaponIds:['gun']}},
  {id:'model',kind:'PROFILE',parentId:'crew',data:{name:'Crew'}},
  {id:'gun',kind:'WEAPON_PROFILE',parentId:'crew',data:{name:'Ray gun'}},
  {id:'equipment',kind:'WARGEAR_OPTION',parentId:'crew',data:{text:'Optional field projector'},provenance:{sourceId:'source'}},
  {id:'evidence',kind:'DATASHEET_SECTION',parentId:'crew',data:{text:'Equipped bearer receives a benefit'},provenance:{sourceId:'source'}},
  {id:'choice',kind:'UPGRADE_DECLARATION',parentId:'crew',data:{text:'Select one configuration'},provenance:{sourceId:'source'}},
  {id:'blue',kind:'UPGRADE_OPTION',parentId:'choice',data:{text:'Blue configuration'},provenance:{sourceId:'source'}},
  {id:'green',kind:'UPGRADE_OPTION',parentId:'choice',data:{text:'Green configuration'},provenance:{sourceId:'source'}},
  {id:'mark',kind:'UPGRADE_OPTION',parentId:'formation',data:{text:'Signal mark'},provenance:{sourceId:'source'}}
]};
const equipmentSelections=[{ownerId:'crew',label:'Field projector',canonicalEquipmentIds:['equipment'],canonicalFieldPaths:{equipment:['/text']},evidence:[{entityId:'evidence',path:'/text'}]}];
const optionSelections=['blue','green'].map(id=>({ownerId:'crew',label:id,canonicalOptionId:id,selectionField:'selectedUpgradeIds',selectionCardinality:'MANY',exclusiveGroupId:'choice',evidence:[{entityId:id,path:'/text'}]}));
optionSelections.push({detachmentId:'formation',label:'Mark: Signal',canonicalOptionId:'mark',selectionField:'selectedMarkId',selectionCardinality:'ONE',evidence:[{entityId:'mark',path:'/text'}]});
const make=()=>createRosterImportService(book,{equipmentSelections,optionSelections});
const header='+ DETACHMENT: Formation\n',original=structuredClone(book);
const ready=text=>{const r=make().import(header+text);assert.equal(r.status,'READY',JSON.stringify(r));return r.roster;};
const state=ready('1x Crew (10 pts): Field projector, blue\n1x Crew (10 pts): green');
assert.deepEqual(state.units[0].selections[0].canonicalEquipmentIds,['equipment']);
assert.deepEqual(state.units[0].selections[0].canonicalFieldPaths,{equipment:['/text']});
assert(!state.units[0].selections.some(s=>s.canonicalEquipmentIds.includes('evidence')));
assert.deepEqual(state.units.map(u=>u.selectedUpgradeIds),[['blue'],['green']]);
assert(!state.units[1].selections.some(s=>s.canonicalEquipmentIds.length));
assert.equal(state.units[1].equipmentContextKnown,false);
assert.equal(state.units[0].selectedMarkId,undefined);
assert.equal(ready('1x Crew (10 pts)\n• Mark: Signal').units[0].selectedUpgradeIds,undefined);
assert.equal(ready('1x Crew (10 pts)\nMark: Signal').units[0].equipmentContextKnown,false);
assert.equal(make().import(header+'1x Crew (10 pts): blue, green').status,'INVALID');
assert.equal(make().import(header+'1x Crew (10 pts): Missing').status,'NEEDS_BINDINGS');
const collision=createRosterImportService(book,{equipmentSelections:[...equipmentSelections,
  {...equipmentSelections[0],canonicalEquipmentIds:['evidence'],canonicalFieldPaths:{evidence:['/text']}}]});
assert.equal(collision.import(header+'1x Crew (10 pts): Field projector').status,'NEEDS_BINDINGS','A duplicate label must not silently overwrite a selection binding');
assert.throws(()=>createRosterImportService(book,{equipmentSelections:[{...equipmentSelections[0],canonicalEquipmentIds:['evidence'],canonicalFieldPaths:{evidence:['/missing']}}]}),/evidence/);
assert.throws(()=>createRosterImportService(book,{optionSelections:[{...optionSelections[0],detachmentId:'formation',ownerId:undefined}]}),/Foreign canonical option/);
const removed=ready('1x Crew (10 pts): blue\n1x Crew (10 pts): green');
assert.equal(removed.units[0].equipmentContextKnown,false);
assert.deepEqual(removed.units[1],state.units[1]);
assert.deepEqual(ready('1x Crew (10 pts): Field projector, blue\n1x Crew (10 pts): green'),state);
const restored=make();restored.load(state);assert.deepEqual(restored.snapshot(),state);
const orphan=structuredClone(state);orphan.units[0].selections=orphan.units[0].selections.filter(item=>!item.canonicalOptionIds);
orphan.units[0].selectedUpgradeIds=['does-not-exist'];
assert.throws(()=>make().load(orphan),/canonical option/);
const injected=structuredClone(state);injected.units[0].selectedUnregisteredId='blue';
assert.throws(()=>make().load(injected),/option field/);
assert.deepEqual(book,original);
// Output-field names and cardinality belong to metadata, not to an army branch.
const genericOptions=optionSelections.map(item=>({...item,selectionField:item.selectionCardinality==='ONE'?'selectedSignalId':'selectedConfigurationIds'}));
const generic=createRosterImportService(book,{optionSelections:genericOptions}).import(header+'1x Crew (10 pts): blue, Mark: Signal');
assert.equal(generic.status,'READY');
assert.deepEqual(generic.roster.units[0].selectedConfigurationIds,['blue']);
assert.equal(generic.roster.units[0].selectedSignalId,'mark');
console.log(JSON.stringify({status:'PASS',selectionVsEvidence:'PASS',canonicalChoices:'PASS',exclusiveChoice:'PASS',unknownFamiliesPreserved:'PASS',physicalScope:'PASS',removeRestore:'PASS',effectsExecuted:0}));

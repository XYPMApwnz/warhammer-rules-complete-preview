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
// Exact equipment captions quote their own canonical text. The existing
// ability occurrence remains a separate reference, with unchanged behavior.
const captionBook=structuredClone(book);
const item=captionBook.entities.find(entity=>entity.id==='equipment');
item.data.text='1 model can be equipped with 1 field projector.';
captionBook.entities.find(entity=>entity.id==='evidence').data.blocks=[{text:'Field Projector: Equipped bearer receives a benefit',wargearAbility:true}];
const start=item.data.text.indexOf('field projector');
const captionReference={entityId:'equipment',path:'/text',bookId:captionBook.bookId,caption:{start,end:start+'field projector'.length}};
const captionBindings=[{...equipmentSelections[0],sourceReferences:[captionReference]}];
const captionService=()=>createRosterImportService(captionBook,{equipmentSelections:captionBindings});
const captionResult=captionService().import(header+'1x Crew (10 pts): Field projector\n1x Crew (10 pts)');
assert.equal(captionResult.status,'READY');
const captionState=captionResult.roster,selected=captionState.units[0].selections[0];
assert.deepEqual(selected.sourceReferences,[{entityId:'evidence',path:'/blocks/0/text'},captionReference]);
assert.deepEqual(selected.canonicalEquipmentIds,['equipment']);
assert.deepEqual(selected.canonicalFieldPaths,{equipment:['/text']});
assert.equal(selected.physicalQuantity,1);
assert.equal(captionState.units[1].selections.length,0);
assert.equal(item.data.text.slice(captionReference.caption.start,captionReference.caption.end),'field projector');
const reloaded=captionService();reloaded.load(JSON.parse(JSON.stringify(captionState)));assert.deepEqual(reloaded.snapshot(),captionState);
const badCaption=mutate=>{
  const state=structuredClone(captionState),selection=state.units[0].selections[0];
  mutate(selection.sourceReferences[1],selection);
  assert.throws(()=>captionService().load(state),/equipment (caption|source) reference/);
};
badCaption(ref=>{ref.bookId='foreign-book';});
badCaption(ref=>{ref.entityId='evidence';}); // Same owner, but not the selected item.
badCaption(ref=>{ref.entityId='missing';});
badCaption(ref=>{ref.path='/missing';});
badCaption(ref=>{ref.caption.start=-1;});
badCaption(ref=>{ref.caption.end=Number.MAX_SAFE_INTEGER;});
badCaption(ref=>{ref.caption.end=ref.caption.start;});
badCaption(ref=>{ref.caption.start=0.5;});
badCaption(ref=>{ref.caption={start:1,end:2};}); // Whitespace only.
badCaption((ref,selection)=>{ref.path='/constructor/name';selection.canonicalFieldPaths.equipment=['/constructor/name'];ref.caption={start:0,end:6};});
badCaption((ref,selection)=>{selection.sourceReferences.push(structuredClone(ref));});
badCaption(ref=>{delete ref.caption;}); // Plain /text references remain forbidden.
const foreignOwnerBook=structuredClone(captionBook);foreignOwnerBook.entities.push({id:'foreign-item',kind:'WARGEAR_OPTION',parentId:'other-unit',data:{text:item.data.text}});
const foreignOwner=structuredClone(captionState);foreignOwner.units[0].selections[0].sourceReferences[1].entityId='foreign-item';
assert.throws(()=>createRosterImportService(foreignOwnerBook,{equipmentSelections:captionBindings}).load(foreignOwner),/Foreign equipment caption reference/);
assert.deepEqual(ready('1x Crew (10 pts): Field projector, blue\n1x Crew (10 pts): green'),state,'Existing no-caption imports unchanged');
console.log(JSON.stringify({status:'PASS',selectionVsEvidence:'PASS',canonicalChoices:'PASS',exclusiveChoice:'PASS',unknownFamiliesPreserved:'PASS',physicalScope:'PASS',removeRestore:'PASS',effectsExecuted:0}));

/** Presentation-only controls: no acceptance, prices or roster mutations. */
import assert from 'node:assert/strict';
import {importMessages,importNoticeCopy,importLabel,importChoiceOptions,importErrorCopy,importNeedCopy,physicalUnitCaption} from './cosmetics.mjs';
import {assertPlayerImportCopy} from '../../../tests/helpers/import-copy-assertions.mjs';

for(const [key,expected]of Object.entries({
  'import-success':'Roster imported.','warlord-saved':'Warlord saved.',
  'attached-status':'Character or Support attached.','detached-status':'Character or Support detached.',
  'backup-restored':'Roster backup restored.','saved-restored':'Saved roster reloaded.',
  'replacement-kept':'Current roster kept.','backup-exported':'Backup downloaded.','source-choice-saved':'Choice saved.'
}))assert.equal(importMessages[key],expected);
assert.equal(importNoticeCopy.stormlance,'Stormlance: sources disagree on Detachment Points. Check the current Munitorum Field Manual.');
assert.equal(importNoticeCopy.unitCount(1),'1 unit');assert.equal(importNoticeCopy.unitCount(3),'3 units');
assert.equal(importLabel('Venom bolt requires one explicitly identified Ravener'),'Venom bolt bearer');
assert.equal(importLabel('parsed-unit-1'),'Imported entry');
assert.equal(importLabel('Icon of Despair'),'Icon of Despair');
assert.equal(importNeedCopy({kind:'OPTION'},true),'This choice is ambiguous in the export and cannot be confirmed here. Make the choice explicit in New Recruit, then export the list again.');
assert.equal(importNeedCopy({kind:'ENHANCEMENT_BEARER'},false),'The export does not identify one model as the Enhancement bearer. List that model separately in New Recruit, then export and import again.');
assert.equal(importErrorCopy({code:'INVALID_SELECTION_QUANTITY'},{}),importMessages['player-error-quantity']);
assert.equal(importErrorCopy({code:'UNRECOGNIZED',message:'NOT_PROVEN bindings-123'},{}),importMessages['player-error-fallback']);
assert.equal(importErrorCopy({code:'FOREIGN_FACTION_EXPORT'},{faction:'Another faction',book:'Opened book'}),'This list is for Another faction, but Opened book is open. Open the matching Army Book and import it there.');
assert.match(importNoticeCopy.saveFailed('Roster imported.'),/^Roster imported\. Your changes are visible, but this browser could not save them\./);

// Distinct same-name UNIT and weapon occurrences keep the exact native values.
const cards=new Map([['unit',{title:'Repeated squad'}],['weapon',{title:'Repeated weapon'}]]);
const state={units:[{instanceId:'parsed-unit-1',canonicalUnitId:'unit',startingStrength:1},{instanceId:'parsed-unit-2',canonicalUnitId:'unit',startingStrength:1}]};
const recipients={options:[{id:'["parsed-unit-1"]',title:'Repeated squad · parsed-unit-1'},{id:'["parsed-unit-2"]',title:'Repeated squad · parsed-unit-2'},{id:'["parsed-unit-1","parsed-unit-2"]',title:'technical'}]};
const before=structuredClone({state,recipients});
const formatted=importChoiceOptions(recipients,{state,cards});
assert.deepEqual(formatted.map(option=>option.id),recipients.options.map(option=>option.id));
assert.deepEqual(formatted.map(option=>option.title),['Repeated squad #1','Repeated squad #2','Repeated squad #1 + Repeated squad #2']);
assert.deepEqual({state,recipients},before);
const weapons=['a','b'].map(selectionKey=>({canonicalProfileId:'weapon',selectionKey,physicalQuantity:2,scopeId:null}));
const choice={options:weapons.map(weapon=>({id:JSON.stringify({unitInstanceId:'parsed-unit-1',scopeId:null,selectionKey:weapon.selectionKey,canonicalProfileId:'weapon'}),title:'technical'}))};
const weaponLabels=importChoiceOptions(choice,{state,cards,projection:{units:[{instanceId:'parsed-unit-1',weapons,profiles:[]}]}});
assert.deepEqual(weaponLabels.map(option=>option.title),['Repeated weapon — choose 1 of 2 weapons · Selection 1','Repeated weapon — choose 1 of 2 weapons · Selection 2']);
assert.deepEqual(weaponLabels.map(option=>option.id),choice.options.map(option=>option.id));
// Native effects partition a confirmed two-weapon selection into two effective
// rows. These are projection fixtures, not additional accepted roster formats.
let partitionCases=0,partitionRefusals=0;
for(const scopeId of [null,'model-scope'])for(const ruleId of ['prototype-one','prototype-two','prototype-three']){
  const original={unitInstanceId:'parsed-unit-1',scopeId,selectionKey:'original-weapon',canonicalProfileId:'weapon'};
  const source={selectionKey:original.selectionKey,physicalQuantity:2,canonicalProfileIds:['weapon'],quantityEvidence:{selectedQuantity:2}};
  const parts=['selected','remainder'].map(role=>({canonicalProfileId:'weapon',scopeId,selectionKey:original.selectionKey+'/'+role,physicalQuantity:1,
    quantityPartition:{role,originalQuantity:2,sourceSelectionKey:original.selectionKey,sourceRuleId:ruleId,sourceSelection:structuredClone(source)}}));
  const project=weapons=>({units:[{instanceId:original.unitInstanceId,weapons:scopeId===null?weapons:[],
    profiles:scopeId===null?[]:[{scopeId,canonicalProfileId:'unit',weapons}]}]});
  const selectedChoice={id:ruleId,options:[{id:JSON.stringify(original),title:'Native caption'}]};
  const argumentsFor=weapons=>({state,cards,projection:project(weapons)});
  const pristine=[{...original,physicalQuantity:2}],before=structuredClone({state,selectedChoice,parts});
  assert.deepEqual(importChoiceOptions(selectedChoice,argumentsFor(parts)),importChoiceOptions(selectedChoice,argumentsFor(pristine)),
    'A partition retains the original choice ID and original two-weapon caption');
  assert.deepEqual({state,selectedChoice,parts},before,'Caption lookup never mutates source decisions or effective weapons');
  for(const corrupt of [
    rows=>rows.pop(),rows=>rows.push(structuredClone(rows[0])),
    rows=>rows[1].quantityPartition.role='selected',rows=>rows[1].quantityPartition.sourceRuleId='another-rule',
    rows=>rows[1].quantityPartition.sourceSelectionKey='another-selection',rows=>rows[1].scopeId='another-scope',
    rows=>rows[1].quantityPartition.sourceSelection.canonicalProfileIds=['another-weapon'],
    rows=>rows[1].quantityPartition.sourceSelection.quantityEvidence.selectedQuantity=1
  ]){const bad=structuredClone(parts);corrupt(bad);assert.throws(()=>importChoiceOptions(selectedChoice,argumentsFor(bad)),/Unresolved equipment choice caption/);partitionRefusals++;}
  partitionCases++;
}
assert.throws(()=>physicalUnitCaption(state,new Map([['unit',{title:'unit'}]]),'parsed-unit-1'),/Missing human name/,'The captionName validation remains active');
assert.throws(()=>importChoiceOptions(choice,{state,cards,projection:{units:[]}}),/Unresolved equipment choice caption/);
assert.throws(()=>importChoiceOptions({options:[{id:'["missing"]',title:'Recipient'}]},{state,cards}),/Unresolved recipient choice caption/);
assert.throws(()=>importChoiceOptions({options:[{id:'opaque',title:'parsed-unit-1'}]},{state,cards}),/Missing human name for rule choice/);
assertPlayerImportCopy(formatted.concat(weaponLabels).map(option=>({location:'option',text:option.title})));
for(const text of ['NOT_PROVEN','canonical','physical','source entry','bindings-1','MFM','parsed-unit-2','UNKNOWN'])
  assert.throws(()=>assertPlayerImportCopy([{location:'mutation',text}]),/Internal import copy/);
console.log(JSON.stringify({status:'PASS',exactStatuses:9,choiceValuesAndStateUnchanged:true,captionValidationPreserved:true,negativeCopyControls:8,partitionCases,partitionRefusals}));

/** Presentation-only import limitation regression. Constructed New Recruit
 * INPUT, not a real export. The accepted Wardens naming discrepancy remains
 * unresolved: this test must never add an alias or relax MODEL validation. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {buildApp} from './app-build.mjs';
import {buildSpaceMarinesImportBook} from './roster-import-build.mjs';
import {createSpaceMarinesRosterService} from './roster-import.mjs';
import {importLimitationForNeed} from '../../shared/army-book-app-v2/roster.mjs';

const ownerId='unit-sm-c7226873c51d43c0';
const header='+ FACTION KEYWORD: Space Marines\n+ DETACHMENT: Gladius Task Force\n';
const supported=header+'1x Impulsor (9999 pts)\n• 1x Impulsor: 1x Armoured Hull, 1x Storm Bolters\n';
// Independent source-default composition, preserved exactly as documented in
// Stage 5D DAINAL_REVIEW.json and the accepted composition block.
const wardens=header+'6x Wardens of Ultramar (9999 pts)\n'+[
  'Aemelia Minervas','Ancient Gadriel','Dainal Kornelius',
  'Gaius Silva','Lucia Vestha','Veteran Sergeant Metaurus'
].map(name=>'• 1x '+name+'\n').join('');
const book=buildSpaceMarinesImportBook(),bookBefore=JSON.stringify(book);
const payload=buildApp(),limitations=payload.rulePresentationLimitations.importLimitations;
assert.equal(limitations.length,1);
const limitation=limitations[0];
assert.deepEqual({ownerId:limitation.ownerId,bindingKind:limitation.bindingKind,rawLabel:limitation.rawLabel},
  {ownerId,bindingKind:'PROFILE',rawLabel:'Dainal Kornelius'});
assert.match(limitation.title,/Wardens of Ultramar/);
assert.match(limitation.message,/not currently supported by automatic import/);
assert.match(limitation.message,/Dainal Kornelius.*composition.*Dainal Komelius.*MODEL profile/);
assert.match(limitation.message,/not been confirmed by official data/);
assert.match(limitation.message,/Other supported units can be imported/);

const service=createSpaceMarinesRosterService(book);
assert.equal(service.import(supported).status,'READY');
const snapshot=structuredClone(service.snapshot()),projection=structuredClone(service.projection);
const result=service.import(wardens);
assert.equal(result.status,'NEEDS_BINDINGS');
assert.equal(result.needsBindings.length,1);
const need=result.needsBindings[0];
assert.deepEqual({kind:need.kind,ownerId:need.ownerId,rawLabel:need.rawLabel,
  state:need.state,candidateIds:need.candidateIds},
  {kind:'PROFILE',ownerId,rawLabel:'Dainal Kornelius',state:'UNRESOLVED',candidateIds:[]});
assert.equal(importLimitationForNeed(need,limitations),limitation,'The real unresolved result receives its specific explanation');
assert.deepEqual(service.snapshot(),snapshot,'Refusal preserves the complete active physical roster');
assert.deepEqual(service.projection,projection,'Refusal preserves all computed results');
service.recompute();assert.deepEqual(service.snapshot(),snapshot,'Recompute must not commit the rejected candidate');
service.load(structuredClone(snapshot));assert.deepEqual(service.snapshot(),snapshot,'Existing snapshot remains loadable');
assert.equal(service.import(supported).status,'READY','A supported roster still imports after refusal');
assert.equal(JSON.stringify(book),bookBefore,'Presentation must not mutate canonical bindings, source data or identities');

const mismatches=[
  ['foreign UNIT',{...need,ownerId:'another-unit'}],
  ['foreign binding kind',{...need,kind:'COMPOSITION_MEMBER'}],
  ['different raw source label',{...need,rawLabel:'Dainal Komelius'}],
  ['different letter case',{...need,rawLabel:'dainal kornelius'}],
  ['resolved binding',{...need,state:'RESOLVED'}],
  ['ambiguous binding',{...need,state:'AMBIGUOUS'}],
  ['unknown binding state',{...need,state:undefined}],
  ['confirmed canonical candidate',{...need,candidateIds:['confirmed-profile']}],
  ['confirmed physical candidate',{...need,candidates:[{id:'confirmed-profile'}]}],
  ['absent need',null]
];
for(const [label,value] of mismatches)assert.equal(importLimitationForNeed(value,limitations),null,label);
assert.equal(importLimitationForNeed(need),null,'An unconfigured consumer has no faction-specific warning');
const sixBooks=['death-guard','adeptus-mechanicus','chaos-space-marines','emperors-children','tyranids','tau-empire'];
for(const id of sixBooks){
  const other=JSON.parse(fs.readFileSync(new URL(`../../${id}/v2/generated/app-presentation.json`,import.meta.url),'utf8'));
  const otherLimitations=other.rulePresentationLimitations?.importLimitations||[];
  assert.equal(importLimitationForNeed(need,otherLimitations),null,id+' must not inherit SM warning metadata');
  assert.ok(!otherLimitations.some(row=>row.ownerId===ownerId),id+' has no Wardens limitation');
}
const report={status:'PASS',constructedFixture:true,realNewRecruitExportTested:false,
  sourceDefaultWardens:'NEEDS_BINDINGS',canonicalOwner:ownerId,unresolvedRawLabel:need.rawLabel,
  candidateIds:need.candidateIds,previousRosterPreserved:true,snapshotPreserved:true,
  supportedImportAfterRefusal:true,sourceAndBindingsUnchanged:true,
  exactExplanationPositive:1,negativeAttributionControls:mismatches.length+1,
  sixBookMetadataIsolation:sixBooks.length,browserAcceptance:'NOT_RUN_BY_THIS_TEST'};
console.log(JSON.stringify(report));

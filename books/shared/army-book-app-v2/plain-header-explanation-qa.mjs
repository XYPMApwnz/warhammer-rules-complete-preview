/** Presentation-only header guidance over unchanged native parsing/import. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {plainHeaderImportExplanation} from './cosmetics.mjs';
import {parse} from '../roster-v2/parser.mjs';
import {createRosterImportService} from '../roster-v2/import-service.mjs';

// Synthetic registry and controls, not an additional accepted New Recruit export.
const book={bookId:'header-presentation-fixture',entities:[
  {id:'det',kind:'DETACHMENT',data:{title:'Sample Formation'}},
  {id:'unit',kind:'DATASHEET',data:{title:'Sample Crew',profileIds:['model'],weaponIds:[]}},
  {id:'model',parentId:'unit',kind:'PROFILE',data:{name:'Crew'}}
]};
const header='Sample list (950 Points)\nSample faction\nSample Formation (1 Detachment Point)',
  body='\n\n1x Sample Crew (50 pts)\n• 1x Crew',input=header+body;
const service=createRosterImportService(book),ready=service.import(input);
assert.equal(ready.status,'READY');
assert.equal(plainHeaderImportExplanation(ready),null);
const saved=service.snapshot(),parsed=parse(input),controls=[];
const freeze=value=>{if(value&&typeof value==='object'){Object.values(value).forEach(freeze);Object.freeze(value);}return value;};
for(const [name,text]of [
  ['extra fourth preamble line',header+'\nAttached Units'+body],
  ['malformed plain points',input.replace('(950 Points)','(9,50 Points)')],
  ['unrecognized plain heading',input.replace('(1 Detachment Point)','(1 unfamiliar heading)')]
]){
  const value=parse(text),result=service.import(text),before=structuredClone(result);
  assert.equal(value.plainHeader,undefined,name);
  assert.equal(value.faction,'—');assert.equal(value.detachment,'—');
  assert.deepEqual(value.units,parsed.units,'An unsupported preamble must not change the body decoder');
  assert.equal(result.status,'NEEDS_BINDINGS');assert.equal(result.roster,null);
  const help=plainHeaderImportExplanation(freeze(result));assert(help,name);
  assert.match(help.instruction,/exactly three nonempty lines/);
  assert.equal(help.example.split('\n').length,3);
  assert.match(help.guidance,/Re-export.*New Recruit/);assert.match(help.guidance,/send the original export as a sample/);
  assert.match(help.message,/current roster and saved roster were not changed/);
  assert.deepEqual(result,before,'Presentation must not alter statuses, needs, errors, metadata or roster');
  assert.deepEqual(service.snapshot(),saved,'Unresolved input must preserve the complete native roster');
  controls.push(name);
}
for(const [name,text]of [
  ['recognized plain header with unknown Detachment',input.replace('Sample Formation','Unreviewed Formation')],
  ['recognized plain header with unknown unit',input.replace('Sample Crew','Unknown Crew')],
  ['recognized labelled header with unknown unit','+ DETACHMENT: Sample Formation\n1x Unknown Crew (50 pts)'],
  ['recognized labelled unknown Detachment','+ DETACHMENT: Unreviewed Formation'+body]
]){
  const result=service.import(text);assert.equal(result.status,'NEEDS_BINDINGS');
  assert.equal(plainHeaderImportExplanation(result),null,name);assert.deepEqual(service.snapshot(),saved);
  controls.push(name);
}
for(const labelled of ['+ FACTION KEYWORD: Sample faction\n+ DETACHMENT: Sample Formation',
  'FACTION KEYWORD: Sample faction\nDETACHMENT: Sample Formation','+ DETACHMENT: Sample Formation']){
  const result=service.import(labelled+body);assert.equal(result.status,'READY');
  assert.equal(plainHeaderImportExplanation(result),null,'Existing labelled forms, including missing faction, remain accepted');
}
const unresolved=service.import(header+'\nAttached Units'+body);
for(const result of [null,{...unresolved,status:'READY'},{...unresolved,status:'INVALID'},
  {...unresolved,errors:[{code:'AMBIGUOUS_WARLORD_IDENTITY'}]},service.import('Not a supported export')]){
  assert.equal(plainHeaderImportExplanation(result),null,'Specific failures and other statuses retain their existing presentation');
}
// The displayed example is copied from the accepted owner fixture, not guessed.
const owner=fs.readFileSync(new URL('../../../v2/fixtures/new-recruit-v37.15-owner-death-guard.txt',import.meta.url),'utf8');
const ownerBefore=parse(owner),help=plainHeaderImportExplanation(unresolved);
assert.equal(help.example,owner.split(/\r?\n/).map(line=>line.trim()).filter(Boolean).slice(0,3).join('\n'));
assert.deepEqual(parse(owner),ownerBefore,'Presentation leaves all parsed owner-export fields unchanged');
console.log(JSON.stringify({status:'PASS',controls,acceptedLabelledForms:3,specificFailureControls:5,parserAndImportBehaviorUnchanged:true}));

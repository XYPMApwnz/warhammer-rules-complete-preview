import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const index=JSON.parse(read('glossary/v2/generated/index.en.json'));
const scope={window:{WH40K_GLOSSARY_V2_INDEX:index}};
vm.runInNewContext(read('glossary/v2/runtime/glossary-v2-runtime.js'),scope);
const api=scope.window.WH40K_GLOSSARY;
const sourceUnits=index.entries.filter(entry=>entry.recordType==='UNIT');
const articles=api.standaloneEntries().filter(entry=>entry.recordType==='UNIT');
const nonDg=articles.filter(entry=>entry.sourceOwner.bookId!=='death-guard');
const affected=nonDg.filter(entry=>Array.isArray(entry.facts.composition));
const existingMeaningful=nonDg.filter(entry=>typeof entry.facts.composition==='string');
const dg=articles.filter(entry=>entry.sourceOwner.bookId==='death-guard');

assert.equal(articles.length,376,'standalone Unit identity count');
assert.equal(nonDg.length,340,'non-DG Unit identity count');
assert.equal(affected.length,307,'structured-composition Unit population');
assert.equal(existingMeaningful.length,33,'existing meaningful string-composition Unit population');
assert.equal(dg.length,36,'DG Unit identity count remains outside this repair');
assert.deepEqual([...articles.map(entry=>entry.id)].sort(),[...sourceUnits.map(entry=>entry.id)].sort(),'Unit identities are unchanged');
for(const entry of affected){
  assert.doesNotMatch(entry.definition.en,/\[object Object\]/,`${entry.id}: no raw object serialization`);
  assert.match(entry.definition.en,/UNIT COMPOSITION\n/,`${entry.id}: composition section`);
  assert.match(entry.definition.en,/MODEL PROFILES\n/,`${entry.id}: model profiles section`);
  const source=sourceUnits.find(candidate=>candidate.id===entry.id);
  const weapons=index.entries.filter(candidate=>candidate.recordType==='WEAPON_PROFILE'&&candidate.parent?.canonicalId===source.facts.id&&candidate.sourceOwner?.bookId===source.sourceOwner.bookId);
  if(weapons.length)assert.match(entry.definition.en,/WEAPON PROFILES\n/,`${entry.id}: parent-scoped weapon profiles section`);
  if(source.facts.ruleFacts?.abilities?.length)assert.match(entry.definition.en,/ABILITIES\n/,`${entry.id}: ability references section`);
  if(source.facts.keywords?.length)assert.match(entry.definition.en,/KEYWORDS\n/,`${entry.id}: keywords section`);
  assert.equal(api.get(entry.id).definition.en,entry.definition.en,`${entry.id}: popup/article parity`);
}
for(const entry of existingMeaningful){
  const facts=entry.facts||{},expected=[facts.composition,(facts.keywords||[]).length?`Keywords: ${facts.keywords.join(', ')}`:''].filter(Boolean).join('\n');
  assert.equal(entry.definition.en,expected,`${entry.id}: existing meaningful Unit rendering remains unchanged`);
}
for(const entry of dg){
  assert.doesNotMatch(entry.definition.en,/\[object Object\]/,`${entry.id}: no raw object serialization`);
  for(const section of ['UNIT COMPOSITION','MODEL PROFILES','WEAPON PROFILES','ABILITIES','KEYWORDS'])assert(entry.definition.en.includes(section),`${entry.id}: ${section} section`);
  assert.equal(api.get(entry.id).definition.en,entry.definition.en,`${entry.id}: popup/article parity`);
}

const dgControls=['unit-mortarion','unit-plague-marines','unit-deathshroud-terminators','unit-plagueburst-crawler','unit-malignant-plaguecaster','unit-nurglings'];
for(const unitId of dgControls){const entry=api.get(`army::death-guard::unit::${unitId}`);assert(entry,`${unitId}: representative DG Unit article`);assert.match(entry.definition.en,/UNIT COMPOSITION[\s\S]+MODEL PROFILES[\s\S]+WEAPON PROFILES[\s\S]+ABILITIES[\s\S]+KEYWORDS/,`${unitId}: useful DG Unit presentation`);}
assert.match(api.get('army::death-guard::unit::unit-malignant-plaguecaster').definition.en,/LEADER[\s\S]+Plague Marines; Poxwalkers/i,'DG Leader references remain player-facing');
assert.match(api.get('army::death-guard::unit::unit-plague-marines').definition.en,/WARGEAR OPTIONS/i,'DG wargear/loadout information remains player-facing');

const controls={
  'adeptus-mechanicus':'unit-servitor-battleclade',
  'blood-angels':'unit-astorath',
  'chaos-space-marines':'unit-chaos-bikers',
  'dark-angels':'unit-asmodai',
  'emperors-children':'unit-chaos-land-raider',
  'space-marines':'unit-adrax-agatone',
  'tau-empire':'unit-breacher-team',
  tyranids:'unit-barbgaunts'
};
for(const [bookId,unitId] of Object.entries(controls)){
  const entry=api.get(`army::${bookId}::unit::${unitId}`);
  assert(entry,`${bookId}: representative Unit article`);
  assert.match(entry.definition.en,/UNIT COMPOSITION[\s\S]+MODEL PROFILES[\s\S]+WEAPON PROFILES[\s\S]+ABILITIES[\s\S]+KEYWORDS/,`${bookId}: complete structured Unit presentation`);
}

const multiModel=api.get('army::adeptus-mechanicus::unit::unit-servitor-battleclade');
for(const value of ['Servitor Underseer: 1','Gun Servitor: 2','Combat Servitor: 6'])assert(multiModel.definition.en.includes(value),`multi-model composition preserves ${value}`);
const leader=api.get('army::blood-angels::unit::unit-astorath');
assert.match(leader.definition.en,/ABILITIES[\s\S]+• Leader/,`Character/Leader ability reference`);
const vehicle=api.get('army::emperors-children::unit::unit-chaos-land-raider');
assert.match(vehicle.definition.en,/MODEL PROFILES[\s\S]+W 16/,`vehicle profile`);
const infantry=api.get('army::tau-empire::unit::unit-breacher-team');
assert.match(infantry.definition.en,/Breacher Fire Warriors: 9/,`simple infantry composition`);

const sourceWeapons=index.entries.filter(entry=>entry.recordType==='WEAPON_PROFILE');
const runtimeWeapons=api.entries().filter(entry=>entry.recordType==='WEAPON_PROFILE');
assert.deepEqual([...runtimeWeapons.map(entry=>entry.id)].sort(),[...sourceWeapons.map(entry=>entry.id)].sort(),'weapon profile identities are unchanged');
const sameName=runtimeWeapons.filter(entry=>entry.sourceOwner.bookId==='chaos-space-marines'&&entry.parent?.canonicalId==='unit-abaddon-the-despoiler'&&entry.label==='Talon of Horus');
assert.equal(sameName.length,2,'same-name weapon profiles remain distinct');
assert.equal(new Set(sameName.map(entry=>entry.id)).size,2,'same-name profiles keep persistent child identities');
assert(sameName.every(entry=>entry.parent.canonicalId==='unit-abaddon-the-despoiler'),'same-name profiles remain parent-scoped');
const abaddon=api.get('army::chaos-space-marines::unit::unit-abaddon-the-despoiler');
assert.equal((abaddon.definition.en.match(/• Talon of Horus:/g)||[]).length,2,'Unit article preserves both same-name profile occurrences');

console.log('Glossary V2 Unit rendering QA PASS (376 meaningful; 36 DG structured projections; stable parent-scoped weapon identities).');

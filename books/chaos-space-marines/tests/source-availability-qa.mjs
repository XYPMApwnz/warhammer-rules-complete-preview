import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const repo=path.resolve(root,'../..');
const readJson=file=>JSON.parse(fs.readFileSync(path.join(root,file),'utf8'));
const loadScript=(file,name)=>{const context={window:{}};vm.runInNewContext(fs.readFileSync(file,'utf8'),context);return context.window[name];};
const targetData=loadScript(path.join(root,'scripts/target-data.js'),'WH_ARMY_BOOK_TARGETS');
const target=id=>{const record=targetData.targets[id];assert.ok(record,`Missing target ${id}`);return targetData.html.slice(record.start,record.end);};

const pack=readJson('content/chaos-space-marines-faction-pack.en.json');
const codex=readJson('content/chaos-space-marines-codex-datasheets.en.json');
const manifest=readJson('sources/source-manifest.json');
const entries=JSON.parse(fs.readFileSync(path.join(repo,'glossary/v2/generated/index.en.json'),'utf8')).entries;
const deceptors=pack.detachments.find(item=>item.id==='deceptors');
const warmaster=codex.datasheets.find(item=>item.id==='unit-abaddon-the-despoiler').abilities.find(item=>item.title==='The Warmaster');

assert.ok(deceptors.rule.text.includes('Declare Battle Formations'),'Masters of Misdirection current body is missing');
assert.deepEqual(deceptors.rule.tables[0].rows.slice(2),[
  ['Incursion','Up to 2 units','Up to 2 units'],
  ['Strike Force','Up to 3 units','Up to 3 units'],
  ['Onslaught','Up to 4 units','Up to 4 units'],
]);
assert.equal(deceptors.rule.sourceAvailability,undefined,'retired source-availability marker remains on Masters of Misdirection');
assert.equal(warmaster.choices.length,3,'The Warmaster current options are incomplete');
assert.deepEqual(warmaster.choices.map(item=>item.title),['Paragon of Hatred (Aura)','Mark of Chaos Ascendant (Aura)','Lord of the Traitor Legions (Aura)']);
assert.equal(warmaster.sourceAvailability,undefined,'retired source-availability marker remains on The Warmaster');

const deceptorsHtml=target('detachment-deceptors');
assert.match(deceptorsHtml,/Masters of Misdirection/);
assert.match(deceptorsHtml,/Up to 4 units/);
assert.doesNotMatch(deceptorsHtml,/Verified rule body is unavailable|data-source-availability=/);
const abaddonHtml=target('unit-abaddon-the-despoiler');
for(const title of warmaster.choices.map(item=>item.title))assert.ok(abaddonHtml.includes(title),`rendered Warmaster choice missing: ${title}`);
assert.doesNotMatch(abaddonHtml,/Verified option definitions are unavailable|data-source-availability=/);

const masters=entries.find(item=>item.id==='army::chaos-space-marines::detachment_rule::deceptors::chaos-space-marines-detachment-rule-masters-of-misdirection');
const warmasterEntry=entries.find(item=>item.id==='army::chaos-space-marines::ability::chaos-space-marines-ability-the-warmaster');
assert.equal(masters?.label,'Masters of Misdirection');
assert.equal(masters?.facts?.text,deceptors.rule.text);
assert.equal(warmasterEntry?.label,'The Warmaster');
assert.deepEqual(warmasterEntry?.facts?.choices,warmaster.choices);
assert.ok(entries.every(item=>!String(item.searchableContent||'').includes('Verified option definitions are unavailable')),'retired gap prose remains in Glossary V2');
assert.equal(manifest.gates.publishAsComplete,true);
assert.equal(manifest.secondaryConsensus.sourceMissing,0);
assert.deepEqual(manifest.knownGaps,[]);

console.log('CSM current source availability QA PASS: Masters of Misdirection and The Warmaster are complete, source-backed, and identical in Army Book and Glossary V2 projection.');

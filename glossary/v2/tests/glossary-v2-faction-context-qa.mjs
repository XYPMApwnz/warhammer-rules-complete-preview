import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
import {buildGlossaryV2Index,loadGlossaryV2Inputs} from '../content/glossary-v2-index.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../..');
const index=await buildGlossaryV2Index();
const repeat=await buildGlossaryV2Index();
assert.deepEqual(repeat,index,'context-aware Glossary V2 projection must remain deterministic');
assert.equal(index.counts.total,4706);
assert.equal(index.counts.standalone,1808);
assert.equal(index.counts.scopedChildren,2898);

const byId=new Map(index.entries.map(entry=>[entry.id,entry]));
const stormId='army::space-marines::detachment::stormlance-task-force';
const terminatorId='army::space-marines::unit::unit-terminator-squad';
const ravenwingId='army::space-marines::unit::unit-chaplain-on-bike';
const storm=byId.get(stormId),terminator=byId.get(terminatorId),ravenwing=byId.get(ravenwingId);
assert(storm&&terminator&&ravenwing,'shared SM-family controls must remain one canonical entry each');
const context=(entry,bookId)=>entry.contexts.find(item=>item.effectiveBookId===bookId);
assert.equal(storm.mfm.detachment.detachmentPoints,3);
assert.equal(context(storm,'dark-angels').mfm.detachment.detachmentPoints,3);
assert.equal(context(storm,'blood-angels').mfm.detachment.detachmentPoints,2);
assert(!terminator.facts.keywords.includes('DEATHWING'),'canonical Space Marines facts must not absorb the DA overlay');
assert(context(terminator,'dark-angels').factOverrides.keywords.includes('DEATHWING'));
assert(context(ravenwing,'dark-angels').factOverrides.keywords.includes('RAVENWING'));

const inputs=await loadGlossaryV2Inputs();
const family=new Map(inputs.armyModels.filter(model=>['space-marines','dark-angels','blood-angels'].includes(model.book.id)).map(model=>[model.book.id,model]));
const sharedUnits=new Map();
for(const [bookId,model] of family)for(const unit of model.units){
  if(bookId!=='space-marines'&&unit.sourceBookId!=='space-marines')continue;
  const rows=sharedUnits.get(unit.id)||[];rows.push({bookId,keywords:[...(unit.keywords||unit.intrinsicKeywords||[])].sort()});sharedUnits.set(unit.id,rows);
}
const contextualKeywordUnits=[...sharedUnits].filter(([,rows])=>rows.length>1&&new Set(rows.map(row=>JSON.stringify(row.keywords))).size>1);
assert.equal(contextualKeywordUnits.length,29,'the complete proven DA keyword-overlay family must remain represented');
for(const [unitId,rows] of contextualKeywordUnits){
  const entry=byId.get(`army::space-marines::unit::${unitId}`);assert(entry,`${unitId}: shared canonical article missing`);
  for(const row of rows){const override=context(entry,row.bookId)?.factOverrides||{},facts={...entry.facts,...override};assert.deepEqual([...facts.keywords].sort(),row.keywords,`${unitId}/${row.bookId}: contextual keywords diverged from effective Army model`);}
}

const sandbox={window:{WH40K_GLOSSARY_V2_INDEX:index}};vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(root,'glossary/v2/runtime/glossary-v2-runtime.js'),'utf8'),sandbox,{filename:'glossary-v2-runtime.js'});
const api=sandbox.window.WH40K_GLOSSARY;
const stormViews=Object.fromEntries(['space-marines','dark-angels','blood-angels'].map(bookId=>[bookId,api.resolveView(bookId,stormId)]));
assert.match(stormViews['space-marines'].definition,/Detachment Points: 3DP\./);
assert.match(stormViews['dark-angels'].definition,/Detachment Points: 3DP\./);
assert.match(stormViews['blood-angels'].definition,/Detachment Points: 2DP\./);
assert.equal(new Set(Object.values(stormViews).map(view=>view.id)).size,1,'context must not duplicate the canonical Stormlance identity');
assert.match(api.resolveView('dark-angels',terminatorId).definition,/KEYWORDS[\s\S]*DEATHWING/);
assert.doesNotMatch(api.resolveView('space-marines',terminatorId).definition,/DEATHWING/);
assert.doesNotMatch(api.resolveView('blood-angels',terminatorId).definition,/DEATHWING/);
assert.match(api.resolveView('dark-angels',ravenwingId).definition,/KEYWORDS[\s\S]*RAVENWING/);
assert.doesNotMatch(api.resolveView('space-marines',ravenwingId).definition,/RAVENWING/);
assert.equal(api.forBook('dark-angels')[terminatorId].id,terminatorId);
assert.equal(api.forBook('blood-angels')[stormId].scope,'blood-angels');
assert.equal(api.standaloneEntries({bookId:'dark-angels'}).length,index.counts.standalone);

console.log('PASS Glossary V2 faction context: Stormlance DP and all 29 DA inherited keyword overlays resolve by requested effective book without identity/count changes.');

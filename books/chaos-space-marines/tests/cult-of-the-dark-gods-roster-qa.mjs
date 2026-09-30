import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const clone=value=>structuredClone(value),plain=value=>JSON.parse(JSON.stringify(value));
const scope={console,URL,URLSearchParams};scope.window=scope;scope.globalThis=scope;vm.createContext(scope);
for(const file of ['books/shared/rule-facts.js','roster-guides/points-data.js','roster-guides/points-validator.js','books/chaos-space-marines/scripts/roster-data.js','books/shared/roster-context.js'])vm.runInContext(read(file),scope,{filename:file});

const catalog=plain(scope.WH_BOOK_ROSTER_CATALOG),pointsCatalog=scope.WH_POINTS_CATALOG['chaos space marines'];
const alliedIds=['unit-plague-marines','unit-noise-marines','unit-khorne-berzerkers','unit-rubric-marines'];
const byId=id=>[...catalog.units,...catalog.alliedUnits].find(unit=>unit.id===id);
const pointById=id=>Object.values(pointsCatalog.units).find(unit=>(unit.unitId||unit.id)===id);
const raw=(id,instanceId,quantity)=>({id:instanceId,canonicalUnitId:id,name:byId(id).title,quantity,points:0,wargear:'',models:[],warlord:false});
const roster=(pointsLimit,units)=>({faction:'Chaos Space Marines',pointsLimit,declared:0,calculated:0,unitLineTotal:0,detachments:[],enhancements:[],warnings:[],units});
const project=(pointsLimit,units,activeCatalog=catalog)=>{scope.WH_BOOK_ROSTER_CATALOG=activeCatalog;const source=roster(pointsLimit,units);return scope.WHArmyRosterContext.project({catalog:activeCatalog,roster:source,record:{id:'csm-cult-dark-gods',roster:source}});};
const muster=result=>result.game.legality.alliedMusters[0];
const keywords=(result,instanceId)=>result.game.units.find(unit=>unit.identity.instanceId===instanceId).effective.keywords.map(value=>value.toUpperCase());

const corpus=JSON.parse(read('books/chaos-space-marines/sources/waha-11e-current-2026-09-29/corpus.json'));
const source=corpus.armyRules.find(item=>item.sourceId==='army-rule-cult-of-the-dark-gods'),sourceText=source.components.map(item=>item.text).join('\n');
assert.match(sourceText,/KHORNE BERZERKERS/);assert.match(sourceText,/RUBRIC MARINES/);assert.match(sourceText,/PLAGUE MARINES/);assert.match(sourceText,/NOISE MARINES/);
assert.match(sourceText,/Incursion: Up to 250 pts/);assert.match(sourceText,/Strike Force: Up to 500 pts/);assert.match(sourceText,/Onslaught: Up to 750 pts/);

const contract=catalog.rosterLegality.alliedMusters.find(item=>item.id==='cult-of-the-dark-gods-allied-muster');
assert.deepEqual(contract.unitIds,alliedIds);assert.deepEqual(contract.keywordGrants,['HERETIC ASTARTES']);assert.deepEqual(contract.limits,[{pointsLimit:1000,maxPoints:250},{pointsLimit:2000,maxPoints:500},{pointsLimit:3000,maxPoints:750}]);
assert.deepEqual(catalog.alliedUnits.map(item=>item.id),alliedIds,'only the four source-backed identities are published as CSM allies');
for(const id of alliedIds){const unit=byId(id),points=pointById(id);assert.ok(unit&&points,`${id}: centralized MFM identity published`);assert.equal(unit.mfmRecordId,points.mfmRecordId,`${id}: Roster and point consumer share MFM owner`);}

let positive=0,negative=0,recompute=0,physical=0,mutations=0;
const allFour=alliedIds.map((id,index)=>raw(id,`ally-${index+1}`,id==='unit-noise-marines'?6:id==='unit-khorne-berzerkers'?10:5));
let result=project(3000,allFour);assert.equal(result.context.status,'ready');assert.equal(result.game.units.length,4);for(const unit of allFour){assert.ok(keywords(result,unit.id).includes('HERETIC ASTARTES'),`${unit.canonicalUnitId}: HERETIC ASTARTES granted`);positive++;}positive+=2;

const unknown={id:'unknown',canonicalUnitId:'unit-chaos-daemons-outsider',name:'Unlisted allied unit',quantity:1,points:0,wargear:'',models:[]};
result=project(1000,[unknown]);assert.equal(result.context.status,'unknown');assert.equal(result.game.units.length,0,'unlisted allied identity is not executable');negative++;

const below=project(1000,[raw('unit-plague-marines','plague',5)]);assert.equal(below.game.status,'ready');assert.equal(muster(below).total,90);positive++;
const incursionExact=project(1000,[raw('unit-plague-marines','plague',5),raw('unit-noise-marines','noise',6)]);assert.equal(incursionExact.game.status,'ready');assert.equal(muster(incursionExact).total,250);positive++;
const incursionAbove=project(1000,[raw('unit-noise-marines','noise-1',6),raw('unit-noise-marines','noise-2',6)]);assert.equal(incursionAbove.game.status,'invalid');assert.equal(muster(incursionAbove).total,320);negative++;
const strikeExact=project(2000,[raw('unit-noise-marines','noise',6),raw('unit-khorne-berzerkers','zerkers-1',10),raw('unit-khorne-berzerkers','zerkers-2',10)]);assert.equal(strikeExact.game.status,'ready');assert.equal(muster(strikeExact).total,500);positive++;
const strikeAbove=project(2000,[...strikeExact.roster.units,raw('unit-plague-marines','plague',5)]);assert.equal(strikeAbove.game.status,'invalid');assert.equal(muster(strikeAbove).total,590);negative++;
const onslaughtExact=project(3000,[raw('unit-khorne-berzerkers','zerkers-1',20),raw('unit-khorne-berzerkers','zerkers-2',20),raw('unit-plague-marines','plague',5)]);assert.equal(onslaughtExact.game.status,'ready');assert.equal(muster(onslaughtExact).total,750);positive++;
const onslaughtAbove=project(3000,[...onslaughtExact.roster.units,raw('unit-plague-marines','plague-2',5)]);assert.equal(onslaughtAbove.game.status,'invalid');assert.equal(muster(onslaughtAbove).total,840);negative++;

const unrelated=raw('unit-legionaries','legionaries',5),withUnrelated=project(1000,[unrelated,raw('unit-plague-marines','plague',5)]);assert.equal(muster(withUnrelated).total,90);assert.equal(withUnrelated.game.status,'ready');positive+=2;
const rubricCopies=project(2000,[1,2,3,4].map(index=>raw('unit-rubric-marines',`rubric-${index}`,5)));assert.equal(muster(rubricCopies).total,470,'Rubric Marines copy-scaled MFM schedule uses 115/115/115/125');assert.equal(rubricCopies.game.status,'ready');positive++;
const duplicates=project(1000,[raw('unit-plague-marines','plague-1',5),raw('unit-plague-marines','plague-2',5)]);assert.equal(muster(duplicates).total,180);assert.equal(muster(duplicates).unitInstanceIds.length,2);physical+=2;

const added=project(1000,[raw('unit-plague-marines','plague',5)]),resized=project(1000,[raw('unit-plague-marines','plague',10)]),removed=project(1000,[]);assert.equal(muster(added).total,90);assert.equal(muster(resized).total,175);assert.equal(muster(removed).total,0);recompute+=3;

const certify=active=>{const current=active.rosterLegality.alliedMusters[0];assert.deepEqual(current.unitIds,alliedIds);assert.deepEqual(current.keywordGrants,['HERETIC ASTARTES']);assert.deepEqual(current.limits,[{pointsLimit:1000,maxPoints:250},{pointsLimit:2000,maxPoints:500},{pointsLimit:3000,maxPoints:750}]);assert.deepEqual(active.alliedUnits.map(item=>item.id),alliedIds);};
const killed=(label,mutate)=>{const active=clone(catalog);mutate(active);assert.throws(()=>certify(active),undefined,`${label} mutation survived`);mutations++;};
killed('OMITTED_ELIGIBLE_UNIT',active=>active.rosterLegality.alliedMusters[0].unitIds.pop());
killed('ADDED_UNLISTED_UNIT',active=>active.rosterLegality.alliedMusters[0].unitIds.push('unit-legionaries'));
killed('REMOVED_KEYWORD_GRANT',active=>active.rosterLegality.alliedMusters[0].keywordGrants=[]);
killed('WRONG_BATTLE_SIZE_CAP',active=>active.rosterLegality.alliedMusters[0].limits[1].maxPoints=501);
killed('MISSING_MFM_IDENTITY',active=>active.alliedUnits=active.alliedUnits.filter(item=>item.id!=='unit-rubric-marines'));

assert.equal(mutations,5);assert.equal(plain(scope.WH_POINTS_CATALOG['chaos space marines']).units['rubric marines'].points[3].value,220,'v1.5 MFM remains numeric owner');
console.log(`CSM Cult of the Dark Gods QA: allies 4/4; positive ${positive}/${positive}; negative ${negative}/${negative}; recompute ${recompute}/${recompute}; physical-instance ${physical}/${physical}; mutations ${mutations}/${mutations} KILLED; PASS`);

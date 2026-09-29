import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';

const root=path.dirname(fileURLToPath(import.meta.url)),bookRoot=path.resolve(root,'..');
const readerShell=fs.readFileSync(path.join(bookRoot,'reader.html'),'utf8'),sandbox={window:{}};
vm.runInNewContext(fs.readFileSync(path.join(bookRoot,'scripts','target-data.js'),'utf8'),sandbox);
const generated=sandbox.window.WH_ARMY_BOOK_TARGETS,reader=readerShell+generated.html;
const runtimeVersions=JSON.parse(fs.readFileSync(path.join(bookRoot,'..','shared','runtime-asset-versions.json'),'utf8'));
const config=JSON.parse(fs.readFileSync(path.join(bookRoot,'book.config.json'),'utf8'));
const manifest=JSON.parse(fs.readFileSync(path.join(bookRoot,'sources/source-manifest.json'),'utf8'));
const source=JSON.parse(fs.readFileSync(path.join(bookRoot,'content/chaos-space-marines-codex-datasheets.en.json'),'utf8'));
const extractConfig=JSON.parse(fs.readFileSync(path.join(bookRoot,'sources/bsdata-extract.config.json'),'utf8'));

function extract(tag,id,html=reader){
  const opener=new RegExp(`<${tag}\\b[^>]*\\bid="${id}"[^>]*>`,'i').exec(html);
  assert.ok(opener,`Missing ${tag}#${id}`);
  const tags=new RegExp(`<\\/?${tag}\\b[^>]*>`,'gi');tags.lastIndex=opener.index;
  let depth=0;
  for(let match;(match=tags.exec(html));){depth+=match[0][1]==='/'?-1:1;if(depth===0)return html.slice(opener.index,tags.lastIndex);}
  assert.fail(`Unclosed ${tag}#${id}`);
}

const detachmentIds=[...reader.matchAll(/<section class="content-group detachment" id="(detachment-[^"]+)"/g)].map(match=>match[1]);
const categories=[...reader.matchAll(/<section class="content-group" id="(datasheets-[^"]+)"[^>]*>\s*<h3 class="category-title">([^<]+)<\/h3>/g)].map(([,id,title])=>{
  const section=extract('section',id);
  const unitIds=[...section.matchAll(/<article\b[^>]*\bclass="[^"]*\bunit-card\b[^"]*"[^>]*\bid="(unit-[^"]+)"/g)].map(match=>match[1]);
  return{id,title,unitIds};
});
const unitIds=categories.flatMap(category=>category.unitIds);
const routeIds=[...detachmentIds,...unitIds];
const routes=['index.html','army-rules.html','updates.html',...routeIds.map(id=>id.replace(/^(?:detachment|unit)-/,'')+'.html')];
const htmlFiles=fs.readdirSync(root).filter(file=>file.endsWith('.html')).sort();

assert.equal(detachmentIds.length,17);
assert.equal(unitIds.length,54);
assert.equal(new Set(routeIds).size,71);
assert.equal(routes.length,74);
assert.deepEqual(htmlFiles,routes.slice().sort(),'Phone routes contain missing or orphan HTML');
assert.deepEqual(Object.fromEntries(categories.map(category=>[category.title,category.unitIds.length])),{'Epic Heroes':8,'Characters':16,'Battleline':2,'Dedicated Transports':1,'Infantry':13,'Mounted':1,'Vehicle':11,'Beast':1,'Fortification':1});

for(const route of routes){
  const html=fs.readFileSync(path.join(root,route),'utf8');
  const expectedTarget=/data-canonical-target="([^"]+)"/.exec(html)?.[1];
  assert.match(html,/data-canonical-reader="\.\.\/reader\.html"/);
  assert.ok(expectedTarget&&(generated.targets[expectedTarget]||generated.targets[generated.aliases?.[expectedTarget]]),`${route}: generated target is absent`);
  assert.match(html,new RegExp(`\\.\\.\\/\\.\\.\\/shared\\/mobile-route-redirect\\.js\\?v=${runtimeVersions.shared.mobileRouteRedirect}`));
  assert.doesNotMatch(html,/<(?:article|section)\b|class="[^"]*\bunit-card\b|data-rule-id=/);
  assert.doesNotMatch(html,/mobile\.(?:js|css)|phone-popup-controller/);
}

const start=extract('section','start');
const armyRules=extract('section','army-rules');
const abaddon=extract('article','unit-abaddon-the-despoiler');
const defiler=extract('article','unit-defiler');
const rhino=extract('article','unit-chaos-rhino');
const desktopApp=fs.readFileSync(path.join(bookRoot,'scripts/app.js'),'utf8');

assert.match(reader,new RegExp(`\\.\\/scripts\\/app\\.js\\?v=${config.assetVersions.app}`),'CSM reader app wiring differs from the authoritative book config');
assert.match(desktopApp,/window\.WHArmyBook\.install\(/,'CSM must use the shared Army Book runtime');
assert.match(desktopApp,/bookId:'chaos-space-marines'/,'CSM shared runtime identity is missing');
assert.match(desktopApp,/createCompatibleRulesLoader/,'CSM shared Compatible Rules loader is missing');
assert.match(desktopApp,/rosterGuide:\(\)=>window\.CSM_ROSTER_GUIDE/,'CSM shared roster provider is missing');
assert.doesNotMatch(desktopApp,/abaddon/i,'Desktop to Phone mapping must not special-case Abaddon');
assert.match(start,/id="start"/);
assert.match(armyRules,/Dark Pacts/);
assert.match(armyRules,/data-term="chaos-space-marines-army-rule-dark-pacts"/);
assert.match(armyRules,/Cults of the Dark Gods/);
assert.match(armyRules,/data-term="chaos-space-marines-army-rule-cults-of-the-dark-gods"/);
assert.match(abaddon,/id="unit-abaddon-the-despoiler"/);
assert.match(abaddon,/data-journey-target="unit-chaos-terminator-squad"/);
assert.match(abaddon,/data-journey-target="unit-chosen"/);
assert.equal((defiler.match(/\+15 pts/g)||[]).length,2,'Defiler paid options are missing');
assert.match(rhino,/id="chaos-rhino-transport"/);
assert.match(rhino,/Transport/);

const limited=['chaos-cult.html','deceptors.html','dread-talons.html','fellhammer-siege-host.html','pactbound-zealots.html','renegade-raiders.html','soulforged-warpack.html','veterans-of-the-long-war.html'];
const unresolved=[];
assert.deepEqual(limited.filter(file=>extract('section',`detachment-${file.slice(0,-5)}`).includes('Codex source required')),unresolved);
for(const file of limited){const html=extract('section',`detachment-${file.slice(0,-5)}`);assert.equal((html.match(/class="enhancement surface"/g)||[]).length,4,`${file} must expose four full-text Enhancements`);assert.equal((html.match(/class="stratagem surface"/g)||[]).length,6,`${file} must expose six full-text Stratagems`);}

assert.equal(source.datasheets.length,54);
assert.equal(source.legends.length,53);
for(const item of source.legends){const file=(item.id||'').replace(/^unit-/,'')+'.html';assert.ok(file!=='.html'&&!htmlFiles.includes(file),`Legends route leaked: ${file}`);}
const foreign=[['Khorne Berzerkers','khorne-berzerkers.html'],['Noise Marines','noise-marines.html'],['Plague Marines','plague-marines.html'],['Rubric Marines','rubric-marines.html']];
for(const [title,file] of foreign){assert.ok(extractConfig.filters.excludeNames.includes(title),`Missing source exclusion for ${title}`);assert.ok(!htmlFiles.includes(file),`Other-faction route leaked: ${file}`);}

assert.equal(config.generatedMobile,true);
assert.equal(config.assetVersions.app,6);
assert.equal(manifest.gates.publishAsComplete,true);
assert.match(reader,/\.\.\/shared\/book-roster-enhancements\.js\?v=\d+/);
assert.match(reader,/\.\/scripts\/roster-filter\.js\?v=\d+/);
assert.ok(!fs.existsSync(path.join(root,'mobile.js'))&&!fs.existsSync(path.join(root,'mobile.css'))&&!fs.existsSync(path.join(root,'phone-popup-controller.js')));
console.log('Chaos Space Marines responsive QA: 74 content-free routes, 17 Detachments, 54 current Datasheets, 53 Legends and 4 other-faction units excluded.');

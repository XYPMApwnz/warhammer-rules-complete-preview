import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createEffectiveMfmArmyProjection} from '../books/shared/tools/effective-mfm-army-projection.mjs';

const json=file=>JSON.parse(fs.readFileSync(file,'utf8'));
const plain=value=>JSON.parse(JSON.stringify(value));
const orderedWargear=value=>plain(value).sort((left,right)=>`${left.name}\0${left.value}`.localeCompare(`${right.name}\0${right.value}`));
const normalize=value=>String(value||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const loadWindow=(file,key)=>{const context={window:{}};vm.runInNewContext(fs.readFileSync(file,'utf8'),context,{filename:file});return context.window[key];};
const catalog=loadWindow('books/shared/points/points-data.js','WH_POINTS_CATALOG');
const targetHtml=book=>loadWindow(`books/${book}/scripts/target-data.js`,'WH_ARMY_BOOK_TARGETS').html;
const unitCard=(html,id)=>{const start=html.indexOf(`<article class="unit-card surface" id="${id}"`);assert.notEqual(start,-1,`${id} effective Army Book card`);const end=html.indexOf('<article class="unit-card surface"',start+1);return html.slice(start,end<0?html.length:end);};
const visibleText=html=>normalize(html.replace(/<[^>]+>/g,' '));
const pointsSource=(book,config)=>json(`books/${book}/${config.sources.points||`content/${book}-points.en.json`}`);

const inheritedScheduleIds={
  'dark-angels':['unit-centurion-devastator-squad','unit-repulsor-executioner'],
  'blood-angels':['unit-centurion-devastator-squad','unit-assault-intercessor-squad','unit-assault-intercessors-with-jump-packs','unit-bladeguard-veteran-squad','unit-captain-with-jump-pack','unit-chaplain-with-jump-pack','unit-outrider-squad','unit-repulsor-executioner','unit-vanguard-veteran-squad-with-jump-packs']
};
for(const [book,ids] of Object.entries(inheritedScheduleIds)){
  const central=new Map(createEffectiveMfmArmyProjection(book).pointsForArmyBook('space-marines').units.map(item=>[item.id,item]));
  for(const id of ids){
    const expected=central.get(id);assert(expected,`${book}: centralized inherited schedule ${id}`);
    const current=catalog[book.replace('-', ' ')].units[normalize(expected.title)];assert(current,`${book}: published inherited schedule ${id}`);
    assert.deepEqual(plain(current.points.map(({label,value,minModels,maxModels,minCopies,maxCopies})=>({label,value,minModels,maxModels,minCopies,maxCopies}))),plain(expected.points.map(({label,value,minModels,maxModels,minCopies,maxCopies})=>({label,value,minModels,maxModels,minCopies,maxCopies}))),`${book}: ${id} must consume centralized MFM exactly`);
  }
}

assert.equal(createEffectiveMfmArmyProjection('blood-angels').pointsForArmyBook('space-marines').detachments.find(item=>item.id==='stormlance-task-force')?.detachmentPoints,2,'Blood Angels centralized MFM Stormlance remains 2DP');
assert.equal(catalog['blood angels'].detachments['stormlance task force'].detachmentPoints,2,'Blood Angels Roster Guides must consume centralized Stormlance DP');
assert.ok(visibleText(targetHtml('blood-angels')).includes(normalize('Stormlance Task Force 2DP')),'Blood Angels Army Book must retain Stormlance at 2DP');

for(const [book,catalogKey] of [['tau-empire','t au empire'],['tyranids','tyranids']]){
  const config=json(`books/${book}/book.config.json`),source=pointsSource(book,config),paid=source.units.filter(unit=>unit.paidWargear?.length);
  assert.ok(paid.length,`${book} paid-wargear source inventory`);
  for(const unit of paid)assert.deepEqual(orderedWargear(catalog[catalogKey].units[normalize(unit.title)].wargear),orderedWargear(unit.paidWargear),`${book} ${unit.title} paidWargear must normalize to catalog wargear`);
}

assert.deepEqual(plain(catalog['t au empire'].units['crisis starscythe battlesuits'].points.map(row=>row.value)),[100,110],'Starscythe factual catalog schedule remains 100/110; model-count resolution stays in Package 3');
const producer=fs.readFileSync('books/shared/points/build.mjs','utf8'),projectionProducer=fs.readFileSync('books/shared/points/effective-catalog.mjs','utf8'),dgAdapter=fs.readFileSync('books/death-guard/tools/canonical-source-adapter.mjs','utf8'),amAdapter=fs.readFileSync('books/adeptus-mechanicus/tools/canonical-source-adapter.mjs','utf8');
assert.match(producer,/createPointsCatalog/,'Roster Guides must consume the effective points projection');
assert.match(projectionProducer,/buildSharedCanonicalBook\(context,\{projectionOnly:true\}\)/,'all books must expose effective points through the shared effective-model build');
assert.match(dgAdapter,/buildDeathGuardCanonicalModel/,'Death Guard points must follow its configured canonical model');
assert.match(amAdapter,/createAdeptusMechanicusCanonicalModel/,'Adeptus Mechanicus points must follow its configured canonical model');
assert.match(amAdapter,/createEffectiveMfmArmyProjection\(config\.id\)/,'Adeptus Mechanicus facts must follow the centralized effective MFM owner');
assert.doesNotMatch(amAdapter,/readJson\(sourcePaths\.officialMfm\)/,'Adeptus Mechanicus must not retain its per-book MFM snapshot as factual authority');
assert.doesNotMatch(`${producer}\n${projectionProducer}`,/scripts[\\/]roster-data\.js|scripts[\\/]target-data\.js|reader\.html|mobile[\\/](?:generated|scripts)[\\/]/i,'points generation must not read generated consumer artifacts');

console.log('Package 2 points consumer convergence QA: PASS');

import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const source=JSON.parse(fs.readFileSync(path.join(root,'content/chaos-space-marines-codex-datasheets.en.json'),'utf8'));
const points=JSON.parse(fs.readFileSync(path.join(root,'content/chaos-space-marines-points.en.json'),'utf8'));
const targetContext={window:{}};
vm.runInNewContext(fs.readFileSync(path.join(root,'scripts/target-data.js'),'utf8'),targetContext);
const publication=targetContext.window.WH_ARMY_BOOK_TARGETS.html;
const glossary=JSON.parse(fs.readFileSync(path.resolve(root,'../../glossary/registry.en.json'),'utf8')).terms;
const localContext=JSON.parse(fs.readFileSync(path.resolve(root,'../../glossary/contexts/chaos-space-marines.json'),'utf8')).terms;
const v2Entries=JSON.parse(fs.readFileSync(path.resolve(root,'../../glossary/v2/generated/index.en.json'),'utf8')).entries;
const v2TermIds=new Set(v2Entries.filter(item=>item.contexts?.some(context=>context.effectiveBookId==='chaos-space-marines')).flatMap(item=>[item.facts?.termId,item.facts?.id,item.sourceOwner?.canonicalId,...(item.aliases||[])]).filter(Boolean));
const coreBaseKey=value=>String(value).toLowerCase().replace(/[^a-z0-9]+/g,' ').replace(/\s+(?:d\d+|\d+)$/,'').trim();
const coreTitles=new Set(Object.entries(glossary).filter(([id])=>id.startsWith('core-')).map(([,term])=>coreBaseKey(String(term.title?.en||'').replace(/^\[|\]$/g,''))));
const resolves=id=>Boolean(v2TermIds.has(id)||glossary[id]||localContext[id]);

function extract(tag,id,html=publication){
  const opener=new RegExp(`<${tag}\\b[^>]*\\bid="${id}"[^>]*>`,'i').exec(html);
  assert.ok(opener,`Missing ${tag}#${id}`);
  const tags=new RegExp(`<\\/?${tag}\\b[^>]*>`,'gi');tags.lastIndex=opener.index;
  let depth=0;
  for(let match;(match=tags.exec(html));){depth+=match[0][1]==='/'?-1:1;if(depth===0)return html.slice(opener.index,tags.lastIndex);}
  assert.fail(`Unclosed ${tag}#${id}`);
}

const slug=value=>String(value).toLowerCase().replace(/[’']/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const pollution=new Set(['Khorne','Nurgle','Slaanesh','Tzeentch','Warp Stalker','Mutant Form','Massive Fangs','Eightfold Eyes','Daemonic Flesh','Scorpion Tail','Iron-hard Talons','Dark Blessing','Chaos icon']);
const representatives=new Map([
  ['Accursed Cultists','Howling Horde'],['Cultist Mob','For the Dark Gods'],['Legionaries','Veterans of the Long War'],
  ['Chosen','Chosen Marauders'],['Chaos Terminator Squad','Despoilers'],['Abaddon the Despoiler','The Warmaster'],
  ['Defiler','Scuttling Walker'],['Forgefiend','Daemonic Ordnance'],['Possessed','Unholy Bloodshed']
]);

assert.equal(source.datasheets.length,54);
let wargearCount=0;
for(const unit of source.datasheets){
  const abilitiesId=`${unit.id.replace(/^unit-/,'')}-abilities`;
  const article=extract('article',unit.id),abilities=extract('section',abilitiesId,article);
  const stub=fs.readFileSync(path.join(root,'mobile',`${unit.id.replace(/^unit-/,'')}.html`),'utf8');
  assert.match(stub,new RegExp(`data-canonical-target="${unit.id}"`),`${unit.title}: legacy route target differs`);
  assert.doesNotMatch(stub,/<(?:article|section)\b|class="[^"]*\bunit-card\b|data-rule-id=/,`${unit.title}: legacy route contains copied content`);
  assert.equal((publication.match(new RegExp(`id="${abilitiesId}"`,'g'))||[]).length,1,`${unit.title}: target publication must expose one canonical Abilities section`);
  assert.equal(unit.abilities.filter(item=>item.abilityClass==='faction'&&item.title==='Dark Pacts').length,1,`${unit.title}: Dark Pacts classification`);
  for(const item of unit.abilities){
    assert.ok(['core','faction','datasheet','support'].includes(item.abilityClass)||coreTitles.has(coreBaseKey(item.title)),`${unit.title}: invalid class for ${item.title}`);
    const field=`data-source-field="abilities.${slug(item.title)}"`;
    const presentationClass=coreTitles.has(coreBaseKey(item.title))?'core':item.abilityClass;
    if(presentationClass==='core'||presentationClass==='faction'){
      assert.match(abilities,new RegExp(`data-ability-class="${presentationClass}"[\\s\\S]*?${field}`),`${unit.title}: ${item.title} is not compact`);
      assert.doesNotMatch(abilities,new RegExp(`<article class="ability" ${field}`),`${unit.title}: ${item.title} leaked as a full card`);
    }else{
      assert.match(abilities,new RegExp(`<article class="ability" ${field}[\\s\\S]*?<p data-source-field="text">`),`${unit.title}: ${item.title} lost full text`);
    }
  }
  assert.match(abilities,/data-ability-class="faction">[\s\S]*?<h5>FACTION<\/h5>[\s\S]*?>Dark Pacts<\/button>/,`${unit.title}: missing FACTION block`);
  for(const item of unit.wargearAbilities||[]){
    wargearCount++;
    assert.match(article,new RegExp(`data-source-field="wargearAbilities.${slug(item.title)}"`),`${unit.title}: source-backed Wargear Ability missing`);
  }
  for(const id of [...abilities.matchAll(/data-term="([^"]+)"/g)].map(match=>match[1]))assert.ok(resolves(id),`${unit.title}: unresolved term ${id}`);
}

for(const [title,ability] of representatives){
  const unit=source.datasheets.find(item=>item.title===title);
  assert.ok(unit,`Missing representative ${title}`);
  assert.ok(unit.abilities.some(item=>item.title===ability&&item.abilityClass==='datasheet'),`${title}: missing unique ${ability}`);
}
for(const unit of source.datasheets)for(const item of unit.abilities)assert.ok(!pollution.has(item.title),`${unit.title}: upgrade ${item.title} leaked`);
const accursed=extract('section','accursed-cultists-abilities');
assert.match(accursed,/data-ability-class="core">[\s\S]*?>Feel No Pain 6\+<\/button>[\s\S]*?>Scouts 6&quot;<\/button>/);
assert.match(accursed,/data-ability-class="faction">[\s\S]*?>Dark Pacts<\/button>/);
assert.match(accursed,/>Howling Horde<\/button>[\s\S]*?<p data-source-field="text">/);
assert.deepEqual(source.datasheets.filter(unit=>unit.wargearAbilities?.length).map(unit=>unit.title),['Legionaries','Dark Commune','Sorcerer in Terminator Armour','Chosen','Nemesis Claw','Possessed','Chaos Bikers']);
assert.equal(wargearCount,7,'CSM source-backed Wargear Abilities changed');

const baseRows=source.datasheets.flatMap(unit=>(unit.profiles||[]).map(profile=>[unit.id,profile.name,profile.stats.Base])).sort((a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b)));
assert.equal(baseRows.length,74,'CSM Base guide profile count');
assert.equal(source.datasheets.filter(unit=>(unit.profiles||[]).every(profile=>profile.stats.Base)).length,54,'Every current CSM Datasheet profile has a confirmed Base');
assert.equal(baseRows.filter(([, ,base])=>base==='Use model').length,7,'CSM hull/use-model Base count');
assert.equal(createHash('sha256').update(JSON.stringify(baseRows)).digest('hex').toUpperCase(),'5F5993D58A66465620E18F3DDF9505965D6CD4BD549CFD7BB04D95B3B65597B5','CSM Base guide mapping changed');
for(const current of source.datasheets){
  const article=extract('article',current.id);
  assert.match(article,/data-source-field="stats\.Base"/,`${current.title}: Desktop Base missing`);
  assert.equal((publication.match(new RegExp(`\\sid="${current.id}"`,'g'))||[]).length,1,`${current.title}: canonical Datasheet is duplicated`);
}

const unit=title=>source.datasheets.find(item=>item.title===title);
const pointUnit=title=>points.units.find(item=>item.title===title);
const huron=unit('Huron Blackheart'),heldrake=unit('Heldrake');
assert.match(huron.abilities.find(item=>item.title==='Hamadrya’s Knowledge (Psychic)').text,/within 8"/);
assert.doesNotMatch(huron.abilities.find(item=>item.title==='Hamadrya’s Knowledge (Psychic)').text,/within 9"/);
assert.equal(heldrake.profiles.find(item=>item.name==='Heldrake').stats.M,'12"');
assert.match(extract('article',huron.id),/within 8&amp;quot;|within 8&quot;/);
assert.match(extract('article',heldrake.id),/>12&amp;quot;<|>12&quot;</);

const expectedUpperSizes=new Map([
  ['Accursed Cultists',16],['Chosen',10],['Possessed',10],['Raptors',10],['Red Corsairs Raiders',10],['Warp Talons',10]
]);
for(const [title,size] of expectedUpperSizes){
  const rows=pointUnit(title).points;
  const sourceRows=unit(title).points;
  assert.ok(rows.some(row=>row.minModels===size&&row.maxModels===size),`${title}: missing ${size}-model schedule`);
  assert.ok(rows.filter(row=>row.minModels===size).every(row=>row.label.includes(String(size))),`${title}: stale upper-size label`);
  assert.deepEqual(sourceRows,rows,`${title}: structured Datasheet points differ from official MFM rows`);
}
const obliteratorRows=pointUnit('Obliterators').points;
assert.deepEqual([...new Set(obliteratorRows.map(row=>row.minModels))],[2]);
assert.equal(obliteratorRows.length,2,'Obliterators must expose only current 2-model schedules');
assert.deepEqual(unit('Obliterators').points,obliteratorRows,'Obliterators structured Datasheet points differ from official MFM rows');

const master=unit('Master of Executions'),maelstrom=unit('Masters of the Maelstrom');
assert.deepEqual(master.relations.leader,[]);
assert.deepEqual(master.relations.support,['CHOSEN','LEGIONARIES','NEMESIS CLAW','RED CORSAIRS RAIDERS']);
assert.deepEqual(maelstrom.relations.leader,[]);
assert.deepEqual(maelstrom.relations.support,['CHOSEN','LEGIONARIES','RED CORSAIRS RAIDERS']);
for(const subject of [master,maelstrom]){
  const desktop=extract('section',`${subject.id.replace(/^unit-/,'')}-support`,extract('article',subject.id));
  assert.match(desktop,/<h4>Support<\/h4>/);
  assert.equal((publication.match(new RegExp(`id="${subject.id.replace(/^unit-/,'')}-support"`,'g'))||[]).length,1,`${subject.title}: target publication must expose one canonical Support section`);
}
console.log(`CSM ability QA: 54 current Datasheets; Core/Faction compact; unique text, Wargear handling and glossary targets verified.`);

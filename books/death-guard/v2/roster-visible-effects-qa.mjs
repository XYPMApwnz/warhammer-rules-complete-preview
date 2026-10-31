import {launchQaBrowser} from '../../../tests/helpers/qa-browser.cjs';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {allowRosterDependencies} from './roster-browser-dependencies.mjs';
import {parseSourceHtml,sourceNodeText} from './raw-source.mjs';

// Source expectations below are independent of producer declarations and of
// applied/debug output. Each control reads the actual personal Reader card.
const directory=path.dirname(fileURLToPath(import.meta.url)),repo=path.resolve(directory,'../../..');
const book=JSON.parse(fs.readFileSync(path.join(directory,'generated/rule-contract-effective.json'),'utf8'));
const records=new Map(book.entities.map(entity=>[entity.id,entity]));
const normalize=value=>String(value).replace(/[‘’]/g,"'").replace(/\s+/g,' ').trim().toLowerCase();
const official=normalize(fs.readFileSync(path.join(directory,'sources/gw-death-guard-faction-pack-2026-09-30.txt'),'utf8'));
const sourceCache=new Map();
const source=file=>{if(!sourceCache.has(file)){const html=fs.readFileSync(path.join(directory,'sources/accepted-waha-pages',file),'utf8');sourceCache.set(file,normalize(sourceNodeText(html,parseSourceHtml(html))));}return sourceCache.get(file);};
const rule=(id,clause,file,quote)=>({id,clause,file,quote});
const expected=[
 rule('datasheet-biologus-putrifier:section:1','source-clause-1','Biologus-Putrifier.html','weapons equipped by models in that unit have the [LETHAL HITS] ability'),
 rule('datasheet-deathshroud-terminators:section:1','source-clause-1','Deathshroud-Terminators.html','that CHARACTER model has the Feel No Pain 4+ ability'),
 rule('datasheet-helbrute:section:1','source-clause-2','Helbrute.html','add 2 to the Attacks characteristic of those two weapons'),
 rule('datasheet-icon-bearer:section:1','source-clause-1','Icon-Bearer.html','add 1 to the Objective Control characteristic of models in that unit'),
 rule('datasheet-lord-of-contagion:section:1','source-clause-1','Lord-of-Contagion.html','melee weapons equipped by models in that unit have the [SUSTAINED HITS 1] and [LANCE] abilities'),
 rule('datasheet-lord-of-poxes:section:1','source-clause-1','Lord-of-Poxes.html','Add 3" to the range of this model’s Contagion Range'),
 rule('datasheet-noxious-blightbringer:section:1','source-clause-1','Noxious-Blightbringer.html','add 1" to the Move characteristic of models in that unit'),
 rule('datasheet-plague-drones:section:1','source-clause-2','Plague-Drones.html','Models in the bearer’s unit have a Leadership characteristic of 6+'),
 rule('datasheet-plaguebearers:section:1','source-clause-2','Plaguebearers.html','Models in the bearer’s unit have a Leadership characteristic of 6+'),
 rule('detachment-virulent-vectorium:enhancement:2','weapon-modifiers','death-guard.html','Add 1 to the Strength and Attacks characteristics of the bearers melee weapons'),
 rule('detachment-virulent-vectorium:enhancement:4','feel-no-pain','death-guard.html','The bearer has the Feel No Pain 5+ ability'),
 rule('detachment-shamblerot-vectorium:enhancement:1','objective-control','death-guard.html','add 1 to the Objective Control characteristic of models in that unit'),
 rule('detachment-shamblerot-vectorium:enhancement:3','plague-wind-damage','death-guard.html','add 1 to the Damage characteristic of the bearer’s Plague Wind weapon'),
 rule('detachment-shamblerot-vectorium:enhancement:4','poxwalkers-toughness','death-guard.html','add 1 to the Toughness characteristic of POXWALKERS models in that unit'),
 rule('detachment-tallyband-summoners:enhancement:2','melee-attacks','death-guard.html','Add 2 to the Attacks characteristic of the bearer’s melee weapons'),
 rule('detachment-death-lords-chosen:enhancement:2','movement','death-guard.html','add 1" to the Movement characteristic of models in that unit'),
 rule('detachment-contagion-engines:enhancement:2','mobile','death-guard.html','This unit has MOBILE'),
 rule('detachment-flyblown-host:enhancement:2','detection-range','death-guard.html','This unit has -3" detection range'),
 rule('detachment-shamblerot-vectorium:rule','battleline','death-guard.html','POXWALKERS units from your army gain the BATTLELINE keyword'),
 rule('detachment-paragons-of-putrescence:rule','contagion-range','death-guard.html','Friendly DEATH GUARD CHARACTER units have +3" to their Contagion Range'),
 rule('detachment-contagion-engines:rule','grant-contagion-engine','death-guard.html','units have CONTAGION ENGINE'),
 rule('detachment-contagion-engines:rule','ranged-assault','death-guard.html','Friendly CONTAGION ENGINE units’ ranged attacks have [ASSAULT]'),
 rule('datasheet-plague-drones:section:1','source-clause-3','Plague-Drones.html','Instrument of Chaos: Add 1 to Charge rolls made for the bearer’s unit.'),
 rule('datasheet-plaguebearers:section:1','source-clause-3','Plaguebearers.html','Instrument of Chaos: Add 1 to Charge rolls made for the bearer’s unit.'),
 rule('detachment-virulent-vectorium:enhancement:1','critical-hit','death-guard.html','DEATH GUARD model only. Each time the bearer makes a melee attack, an unmodified Hit roll of 5+ scores a Critical Hit.')
];
const sourceSnapshots=new Map(['generated/rule-contract-effective.json','generated/app-presentation.json','sources/gw-death-guard-faction-pack-2026-09-30.txt',
 ...new Set(expected.map(row=>'sources/accepted-waha-pages/'+row.file))].map(file=>[file,fs.readFileSync(path.join(directory,file))]));
const identity=row=>`${row.id}/${row.clause}`;
const denominator=new Set(expected.map(identity));
const categories=['WEAPON_ABILITY','PROFILE_DEFENSE','WEAPON_CHARACTERISTIC','OTHER_PLAYER_VISIBLE','WEAPON_ABILITY','OTHER_PLAYER_VISIBLE','OTHER_PLAYER_VISIBLE','OTHER_PLAYER_VISIBLE','OTHER_PLAYER_VISIBLE','WEAPON_CHARACTERISTIC','PROFILE_DEFENSE','OTHER_PLAYER_VISIBLE','WEAPON_CHARACTERISTIC','PROFILE_DEFENSE','WEAPON_CHARACTERISTIC','OTHER_PLAYER_VISIBLE','UNIT_KEYWORD','DETACHMENT_DERIVED_STATE','UNIT_KEYWORD','DETACHMENT_DERIVED_STATE','UNIT_KEYWORD','WEAPON_ABILITY','OTHER_PLAYER_VISIBLE','OTHER_PLAYER_VISIBLE','OTHER_PLAYER_VISIBLE'];
assert.equal(categories.length,expected.length);
const classifications=expected.map((row,index)=>({ruleId:row.id,clauseId:row.clause,category:categories[index]}));
assert.equal(expected.length,25);
assert.equal(denominator.size,25,'Independent source inventory has duplicate clause identities');
for(const row of expected)assert(source(row.file).includes(normalize(row.quote))||official.includes(normalize(row.quote)),`Accepted source expectation missing: ${identity(row)}`);
const executableIdentities=book.entities.flatMap(entity=>(entity.ruleContract?.clauses||[]).filter(clause=>clause.rosterClassification==='ROSTER_EXECUTABLE').map(clause=>`${entity.id}/${clause.id}`));
function assertExecutableCensus(actual){
 assert.equal(actual.length,25,'Executable source census changed');
 assert.equal(new Set(actual).size,actual.length,'Duplicate executable source clause identity');
 assert.deepEqual(new Set(actual),denominator,'Executable source identities changed');
}
assertExecutableCensus(executableIdentities);
let censusMutations=0;
for(const row of expected.slice(22)){
 const id=identity(row),index=executableIdentities.indexOf(id);
 for(const kind of ['missing','duplicate','wrong-identity']){
  const changed=[...executableIdentities];
  if(kind==='missing')changed.splice(index,1);
  if(kind==='duplicate')changed[(index+1)%changed.length]=id;
  if(kind==='wrong-identity')changed[index]=id+'/wrong-identity';
  assert.throws(()=>assertExecutableCensus(changed),assert.AssertionError,`${kind} ${id} mutation escaped`);censusMutations++;
 }
}

const unit=(instanceId,canonicalUnitId,count=1,{weapons=[],enhancements=[],selections=[]}={})=>({instanceId,canonicalUnitId,startingStrength:count,warlord:false,enhancementIds:enhancements,selections,
 modelRows:[{rowId:`${instanceId}/composition`,quantity:count,canonicalProfileId:records.get(canonicalUnitId).data.profileIds[0],loadouts:[],selections:weapons.map((id,index)=>({selectionKey:`${instanceId}/weapon/${index}`,canonicalProfileIds:[id],canonicalEquipmentIds:[],canonicalFieldPaths:{},physicalQuantity:count,perModelQuantity:1}))}]});
const state=(units,detachment='detachment-virulent-vectorium')=>({schema:'roster-v2/roster',bookId:book.bookId,rosterId:'visible-effects-qa',detachmentIds:[detachment],warlordInstanceId:null,units,attachments:[]});
const PM='unit-plague-marines',LOC='unit-lord-of-contagion',DS='unit-deathshroud-terminators';
const pmKnife='datasheet-plague-marines:weapon:13',melta='datasheet-plague-marines:weapon:4';
const lordWeapons=['datasheet-lord-of-contagion:weapon:1','datasheet-lord-of-contagion:weapon:2'];
const dsWeapons=['datasheet-deathshroud-terminators:weapon:2','datasheet-deathshroud-terminators:weapon:3'];
const profileId=id=>records.get(id).data.profileIds[0];

const {chromium}=createRequire(import.meta.url)('playwright');
const appURL='/v2/app.html?v2=ARMY_BOOK&book=death-guard&registry=death-guard';
const app='/v2/app.html';
const allowed=new Map([[app,'text/html'],['/books/death-guard/v2/generated/app-presentation.json','application/json'],['/books/shared/army-book-app-v2/runtime.mjs','text/javascript'],['/books/shared/army-book-app-v2/glossary.mjs','text/javascript'],['/books/shared/army-book-app-v2/styles.css','text/css']]);
allowRosterDependencies(allowed);
// Exact current production imports, not a wildcard bypass of the QA dependency boundary.
for(const file of ['books/shared/army-book-app-v2/formed-unit-presentation.mjs','books/shared/army-book-app-v2/effective-datasheet-presentation.mjs',
 'books/shared/roster-v2/effective-instance.mjs','books/shared/roster-v2/related.mjs'])allowed.set('/'+file,'text/javascript');
const forbiddenRequests=[];
let runtimePoison=null;
const server=http.createServer((req,res)=>{const address=new URL(req.url,'http://localhost').pathname;if(!allowed.has(address)){if(address!=='/favicon.ico')forbiddenRequests.push(address);res.writeHead(404);res.end();return;}res.writeHead(200,{'Content-Type':allowed.get(address),'Cache-Control':'no-store'});let content=fs.readFileSync(path.join(repo,address.slice(1)));if(address==='/books/shared/army-book-app-v2/runtime.mjs'&&runtimePoison){const original=content.toString();const needle=runtimePoison==='STANDALONE'?'const {variants,selected}=effectiveReference(id,context);':'dialogContent.replaceChildren(...(effectiveCards?.length';assert(original.includes(needle),'Mutation target no longer resolves');content=original.replace(needle,runtimePoison==='STANDALONE'?'const variants=null,selected=[cards.get(id)];':'dialogContent.replaceChildren(...(false');}res.end(content);});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
let browser;
const results=[];
try{
 browser=await launchQaBrowser(chromium,{headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE}:{})});
 for(const [device,viewport] of [['desktop',{width:1440,height:1000}],['phone',{width:390,height:844}]]){
  const context=await browser.newContext({viewport}),page=await context.newPage(),errors=[],covered=new Set();let controls=0,mutations=0;
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto(`http://127.0.0.1:${server.address().port}${appURL}`);
  await page.waitForFunction(()=>!!window.ArmyBookAppV2?.rosterPanel);await page.evaluate(()=>window.ArmyBookAppV2.rosterPanel.ready);
  const api=async(fn,arg)=>page.evaluate(fn,arg);
  let currentInstanceId=null;
  const open=async id=>{await api(id=>{window.ArmyBookAppV2.openPersonalGuide();window.ArmyBookAppV2.openInstance(id);},id);await page.waitForFunction(id=>[...document.querySelectorAll('main [data-roster-context-instance-id]')].some(node=>node.dataset.rosterContextInstanceId===id&&!!node.getClientRects().length),id);currentInstanceId=id;};
  const load=async snapshot=>api(snapshot=>window.ArmyBookAppV2.roster.load(snapshot),snapshot);
  const attach=async(source,target)=>api(([source,target])=>window.ArmyBookAppV2.roster.attach(source,target),[source,target]);
  const detach=async source=>api(source=>window.ArmyBookAppV2.roster.detach(source),source);
  const card=async(id,{detail=false}={})=>page.locator(`${detail?'.v2-dialog-content':'main'} [data-card-id], ${detail?'.v2-dialog-content':'main'} [data-profile-scopes]`).evaluateAll((nodes,id)=>nodes.filter(node=>!!node.getClientRects().length&&
    (node.dataset.cardId===id||JSON.parse(node.dataset.profileScopes||'[]').some(([profileId])=>profileId===id))).map(node=>({
      text:node.innerText,weaponQuantity:node.querySelector('.ds-weapon-quantity')?.textContent||null,displayScopes:JSON.parse(node.dataset.weaponScopes||node.dataset.profileScopes||'null'),
      criticalHits:[...node.querySelectorAll('[data-critical-hit-threshold]')].filter(note=>note.closest('[data-card-id]')===node).map(note=>({value:note.dataset.criticalHitThreshold,recipient:note.dataset.recipientInstanceId,text:note.innerText,sourceIds:[...note.querySelectorAll('a[data-target-id]')].map(link=>link.dataset.targetId)})),
      extras:[...node.children].filter(child=>child.classList.contains('v2-compatible-help')).map(child=>child.textContent),
      fields:[...node.querySelectorAll('[data-fact-id]')].filter(f=>!!f.getClientRects().length&&(f.closest('[data-card-id]')===node||
        node.dataset.profileScopes&&f.closest('[data-profile-scopes]')===node&&!node.contains(f.closest('[data-card-id]')))).map(f=>({path:f.dataset.factId.slice(f.dataset.factId.indexOf('::')+2),value:JSON.parse(f.dataset.factValue),text:f.textContent}))
    })),id);
  const values=(cards,path)=>cards.flatMap(card=>card.fields.filter(field=>field.path===path||field.path.startsWith(path+'/')).map(field=>field.value));
  const surfaces=async(id,options={})=>{const main=await card(id,options);if(options.detail)return [main];await api(id=>window.ArmyBookAppV2.showDetail(id),id);await page.waitForFunction(()=>document.querySelector('.v2-detail-dialog')?.open);const detail=await card(id,{detail:true});await page.getByRole('button',{name:'Close rule reference',exact:true}).click();await page.waitForFunction(()=>!document.querySelector('.v2-detail-dialog')?.open);return [main,detail];};
  const weaponAbility=async(id,ability,wanted=true,options={})=>{for(const actual of await surfaces(id,options)){assert(actual.length,`${device}: missing visible weapon ${id}`);for(const record of actual)assert.equal(values([record],'/abilities').some(value=>normalize(value)===normalize(ability)),wanted,`${device}: visible weapon ${id} ${ability} in every composition scope`);controls++;}};
  const stat=async(id,path,wanted)=>{for(const cards of await surfaces(id)){const actual=values(cards,'/'+path);assert(actual.length,`${device}: missing visible stat ${id}/${path}`);assert(actual.every(value=>value===wanted),`${device}: wrong visible stat ${id}/${path}: ${JSON.stringify(actual)}`);controls++;}};
  const modelAbility=async(id,name,value,wanted=true,options={})=>{
    const occurrences=await page.locator('main [data-canonical-ability-id="core-feel-no-pain"]').evaluateAll((nodes,{id,value})=>nodes.filter(node=>
      JSON.parse(node.dataset.abilityParameters).value===value&&JSON.parse(node.dataset.recipientScopes).some(scope=>JSON.parse(scope)[1]===id)).map(node=>node.innerText),{id,value});
    if(!options.detail){assert.equal(occurrences.length,wanted?1:0,`${device}: exact MODEL ability shown once in its canonical surface ${id}`);controls++;}
    const actual=(await surfaces(id,options)).at(-1);assert(actual.length,`${device}: missing visible MODEL profile popup ${id}`);
    const pattern=new RegExp(name.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'\\s*(?::\\s*)?'+value+'\\+','i');
    for(const record of actual){assert.equal(record.fields.some(field=>field.path.startsWith('/rosterAbilities/')&&field.value.name===name&&field.value.value===value&&field.text===value+'+'),wanted,`${device}: popup defensive value ${name} ${value}+ on ${id}`);assert.equal(pattern.test(record.text),wanted);}controls++;
  };
  const keyword=async(id,name,wanted=true)=>{const root=await page.locator(`main [data-card-id="${id}"][data-roster-instance-id="${currentInstanceId}"]`).evaluate(node=>({id:node.dataset.cardId,fields:[...node.querySelectorAll('[data-fact-id]')].filter(f=>f.closest('[data-card-id]')===node).map(f=>({path:f.dataset.factId.slice(f.dataset.factId.indexOf('::')+2),value:JSON.parse(f.dataset.factValue)}))}));assert.equal(root.id,id);assert.equal(root.fields.some(f=>f.path.startsWith('/keywords/')&&f.value===name),wanted,`${device}: effective UNIT keyword ${name}`);controls++;};
  const metric=async(id,name,modifier,max)=>{for(const actual of await surfaces(id)){assert(actual.length);for(const record of actual){const metrics=record.fields.filter(field=>field.path==='/rosterMetrics/'+name);assert.equal(metrics.length,1,`${device}: missing or duplicate natural profile metric ${name}`);assert.deepEqual(metrics[0].value,{modifier,...(max===undefined?{}:{max})},`${device}: wrong visible metric ${name}`);assert.equal(metrics[0].text,`${modifier>=0?'+':''}${modifier}"${max===undefined?'':` (maximum ${max}")`}`,`${device}: metric exposed as internal JSON`);controls++;}}};
  const charge=async(instanceId,ruleId,wanted=true)=>{
    const actual=await page.locator('main [data-unit-metric="chargeRoll"]').evaluateAll(nodes=>nodes.filter(node=>!!node.getClientRects().length).map(node=>({modifier:node.dataset.metricModifier,scope:node.dataset.unitScope,recipients:JSON.parse(node.dataset.recipientInstanceIds),ruleIds:JSON.parse(node.dataset.ruleIds),text:node.innerText})));
    assert.equal(actual.length,wanted?1:0,`${device}: missing, duplicate or leaked visible Charge modifier`);
    if(wanted){assert.equal(actual[0].modifier,'1');assert.equal(actual[0].scope,'FORMED');assert.deepEqual(actual[0].recipients,[instanceId]);assert(actual[0].ruleIds.includes(ruleId));assert.match(actual[0].text,/Charge-roll modifier:\s*\+1/);}controls++;
  };
  const critical=async(id,instanceId,wanted=true)=>{
    for(const actual of await surfaces(id)){assert(actual.length,`${device}: missing visible weapon ${id}`);for(const record of actual){
      assert.equal(record.criticalHits.length,wanted?1:0,`${device}: missing, duplicate or leaked Critical Hit threshold`);
      if(wanted){const note=record.criticalHits[0];assert.equal(note.value,'5');assert.equal(note.recipient,instanceId);assert.match(note.text,/Critical hits:\s*5\+/);assert(note.sourceIds.includes('detachment-virulent-vectorium:enhancement:1'));}controls++;
    }}
  };
  const mark=async(...indices)=>{const applied=await api(()=>window.ArmyBookAppV2.roster.projection.units.flatMap(unit=>unit.applied));for(const index of indices){const row=expected[index];assert(applied.some(effect=>effect.ruleId===row.id&&effect.clauseId===row.clause),`${device}: source clause not executed: ${identity(row)}`);covered.add(identity(row));}};
  const baseline=await api(()=>{window.ArmyBookAppV2.open('unit-lord-of-contagion');return [...document.querySelectorAll('main [data-fact-id]')].map(f=>[f.dataset.factId,f.dataset.factValue]);});

  // Complete user mega-case: every assertion reads natural profile/weapon/
  // keyword fields, excluding the still-present internal effective block.
  const megaExport=`+ FACTION KEYWORD: Chaos - Death Guard
+ DETACHMENT: Paragons of Putrescence, Virulent Vectorium (Hypervirulent Strains)
+ TOTAL ARMY POINTS: 285pts
+ ENHANCEMENT: Furnace of Plagues (on Char1: Lord of Contagion)
Char1: 1x Lord of Contagion (135 pts): Manreaper
Enhancement: Furnace of Plagues (+25 pts)
3x Deathshroud Terminators (150 pts)
• 1x Deathshroud Terminator Champion: Manreaper, Plaguespurt gauntlet
• 2x Deathshroud Terminator: 2 with Manreaper, Plaguespurt gauntlet`;
  assert.equal(await api(text=>window.ArmyBookAppV2.roster.import(text).status,megaExport),'READY');
  assert.deepEqual(new Set(await api(()=>window.ArmyBookAppV2.roster.state.detachmentIds)),new Set(['detachment-paragons-of-putrescence','detachment-virulent-vectorium']));
  const checkMega=async(attached)=>{
    await open('parsed-unit-1');await modelAbility(profileId(LOC),'Feel No Pain',4,attached);
    for(const [index,id] of lordWeapons.entries()){
      await stat(id,'attacks',index===0?'6':'11');await stat(id,'strength',index===0?'10':'7');
      for(const ability of ['LETHAL HITS','DEVASTATING WOUNDS'])await weaponAbility(id,ability);
      for(const ability of ['SUSTAINED HITS 1','LANCE'])await weaponAbility(id,ability,attached);
    }
    await metric(profileId(LOC),'contagionRange',3,12);
    const leaderContext=await page.locator('main [data-roster-context-instance-id="parsed-unit-1"]').innerText();
    assert.equal(leaderContext.includes('Leading: Deathshroud Terminators'),attached);
    assert.equal(leaderContext.includes('Deathshroud Terminators #'),false,'Single bodyguard received a duplicate-only suffix');
    assert.equal(await api(()=>window.ArmyBookAppV2.roster.state.attachments.some(row=>row.leaderInstanceId==='parsed-unit-1'&&row.bodyguardInstanceId==='parsed-unit-2')),attached);
    await open('parsed-unit-2');await keyword(DS,'CHARACTER',attached);
    const bodyguardContext=await page.locator('main [data-roster-context-instance-id="parsed-unit-2"]').innerText();
    assert.equal(bodyguardContext.includes('Led by Lord of Contagion'),attached);
    assert.equal(bodyguardContext.includes('Lord of Contagion #'),false,'Single leader received a duplicate-only suffix');
    for(const [index,id]of dsWeapons.entries()){
      await stat(id,'attacks',index===0?'4':'8');await stat(id,'strength',index===0?'8':'4');
      await weaponAbility(id,'LETHAL HITS');await weaponAbility(id,'DEVASTATING WOUNDS',false);
      for(const ability of ['SUSTAINED HITS 1','LANCE'])await weaponAbility(id,ability,attached);
    }
    if(attached)await metric(profileId(DS),'contagionRange',3,12);
    else for(const actual of await surfaces(profileId(DS)))assert.equal(values(actual,'/rosterMetrics/contagionRange').length,0,'Detached non-CHARACTER retained Hypervirulent modifier');
    assert(await api(()=>{const r=window.ArmyBookAppV2.roster;return r.projection.units.find(u=>u.instanceId==='parsed-unit-2').profiles.every(p=>!r.context('parsed-unit-2','MODEL',p.scopeId).keywords.has('CHARACTER'));}));
    assert(await api(()=>{const r=window.ArmyBookAppV2.roster;return r.effective('parsed-unit-2').applied.every(row=>row.ruleId!=='detachment-virulent-vectorium:enhancement:2')&&r.projection.units.every(u=>u.conditional.filter(c=>c.ruleId==='detachment-virulent-vectorium:rule').every(c=>c.state==='UNKNOWN'));}));
  };
  await attach('parsed-unit-1','parsed-unit-2');await checkMega(true);
  await detach('parsed-unit-1');await checkMega(false);
  await attach('parsed-unit-1','parsed-unit-2');await checkMega(true);
  // Losing a metric from the natural profile must fail even when debug/applied
  // state remains intact. The source-backed modifier cannot live only there.
  await api(()=>{const r=window.ArmyBookAppV2.roster;window.metricOriginal=r.effective;r.effective=function(id){const result=window.metricOriginal.call(this,id);result.profiles.forEach(p=>p.metrics={});return result;};});
  await open('parsed-unit-1');await assert.rejects(()=>metric(profileId(LOC),'contagionRange',3,12),assert.AssertionError);mutations++;
  await api(()=>{window.ArmyBookAppV2.roster.effective=window.metricOriginal;delete window.metricOriginal;});

  // Verbatim user reproduction, including NBSP labels, export prices and
  // grouped Champion/"2 with" composition. No manual canonical selectors.
  const exactExport=`+++++++++++++++++++++++++++++++++++++++++++++++
+ FACTION KEYWORD: Chaos - Death Guard
+ DETACHMENT: Virulent Vectorium (Worldblight)
+ FORCE DISPOSITION: Take and Hold
+ TOTAL ARMY POINTS: 260pts
+
+ NUMBER OF UNITS: 2
+ SECONDARY: - Assassination: 1 Characters
+++++++++++++++++++++++++++++++++++++++++++++++

Char1: 1x Lord of Contagion (110 pts): Manreaper

3x Deathshroud Terminators (150 pts)
• 1x Deathshroud Terminator Champion: Manreaper, Plaguespurt gauntlet
• 2x Deathshroud Terminator: 2 with Manreaper, Plaguespurt gauntlet

Created with newrecruit.eu v36.31`;
  assert.equal(await api(text=>window.ArmyBookAppV2.roster.import(text).status,exactExport),'READY',`${device}: verbatim export requires manual identity binding`);
  await attach('parsed-unit-1','parsed-unit-2');await open('parsed-unit-1');await modelAbility(profileId(LOC),'Feel No Pain',4);
  for(const id of lordWeapons)for(const ability of ['LETHAL HITS','SUSTAINED HITS 1','LANCE'])await weaponAbility(id,ability);
  await open('parsed-unit-2');
  for(const id of dsWeapons){const scopes=await card(id),represented=scopes.flatMap(record=>record.displayScopes||[]).filter(([weaponId])=>weaponId===id);assert.equal(represented.length,2,`${device}: grouped Champion/Terminators lost separate effective weapon scopes`);assert.equal(new Set(represented.map(scope=>JSON.stringify(scope))).size,2,`${device}: duplicate physical weapon scope in visible group`);assert.equal(scopes.reduce((total,record)=>{assert.match(record.weaponQuantity,/^ ×[0-9]+$/);return total+Number(record.weaponQuantity.slice(2));},0),3,`${device}: grouped weapon quantity differs from three imported models`);for(const ability of ['SUSTAINED HITS 1','LANCE'])await weaponAbility(id,ability);}
  await detach('parsed-unit-1');await open('parsed-unit-1');await modelAbility(profileId(LOC),'Feel No Pain',4,false);for(const id of lordWeapons)for(const ability of ['SUSTAINED HITS 1','LANCE'])await weaponAbility(id,ability,false);
  await open('parsed-unit-2');for(const id of dsWeapons)for(const ability of ['SUSTAINED HITS 1','LANCE'])await weaponAbility(id,ability,false);
  await attach('parsed-unit-1','parsed-unit-2');await open('parsed-unit-1');await modelAbility(profileId(LOC),'Feel No Pain',4);for(const id of lordWeapons)for(const ability of ['SUSTAINED HITS 1','LANCE'])await weaponAbility(id,ability);

  // Required real text-import path, two copies, both Manreaper profiles, and
  // contextual weapon/profile details. Source IDs resolve only at import.
  const real='+ DETACHMENT: Virulent Vectorium\nChar1: 1x Lord of Contagion (100 pts): Manreaper\nChar2: 1x Lord of Contagion (100 pts): Manreaper\n3x Deathshroud Terminators (140 pts)\n• 1x Deathshroud Champion: Manreaper, Plaguespurt gauntlet\n• 2x Deathshroud Terminator: Manreaper, Plaguespurt gauntlet\n3x Deathshroud Terminators (140 pts): 3x Manreaper, 3x Plaguespurt gauntlet';
  assert.equal(await api(text=>window.ArmyBookAppV2.roster.import(text).status,real),'READY');
  await attach('parsed-unit-1','parsed-unit-3');await open('parsed-unit-1');
  const membership=await api(()=>window.ArmyBookAppV2.roster.effective('parsed-unit-1').formedUnit);assert.deepEqual(new Set(membership.memberInstanceIds),new Set(['parsed-unit-1','parsed-unit-3']));
  const lordContext=page.locator('main [data-roster-context-instance-id="parsed-unit-1"]');
  assert((await lordContext.innerText()).includes('Leading: Deathshroud Terminators #1'),`${device}: actual attached physical Bodyguard absent from Reader context`);
  await modelAbility(profileId(LOC),'Feel No Pain',4);
  for(const id of lordWeapons)for(const ability of ['LETHAL HITS','SUSTAINED HITS 1','LANCE'])await weaponAbility(id,ability);
  await mark(1,4);
  await api(()=>localStorage.setItem(window.ArmyBookAppV2.rosterPanel.storageKey,JSON.stringify(window.ArmyBookAppV2.roster.snapshot())));
  // The V1 weapon name opens the scope-aware native detail route. Preserve its
  // physical projection and active effects through a real reload.
  const physicalWeapon=page.locator(`main [data-card-id="${lordWeapons[0]}"] a[data-popup-identity]`).first();
  const physicalScope=await physicalWeapon.getAttribute('data-composition-id');await physicalWeapon.click();
  await page.waitForSelector('dialog.v2-detail-dialog[open]');
  let physicalDetail=page.locator(`dialog.v2-detail-dialog[open] [data-card-id="${lordWeapons[0]}"]`);assert.equal(await physicalDetail.getAttribute('data-roster-instance-id'),'parsed-unit-1');assert.equal(await physicalDetail.getAttribute('data-composition-id'),physicalScope);
  for(const ability of ['SUSTAINED HITS 1','LANCE'])await weaponAbility(lordWeapons[0],ability,true,{detail:true});
  await page.reload();await page.waitForFunction(()=>!!window.ArmyBookAppV2?.rosterPanel);await page.evaluate(()=>window.ArmyBookAppV2.rosterPanel.ready);
  await page.waitForSelector('dialog.v2-detail-dialog[open]');physicalDetail=page.locator(`dialog.v2-detail-dialog[open] [data-card-id="${lordWeapons[0]}"]`);assert.equal(await physicalDetail.getAttribute('data-roster-instance-id'),'parsed-unit-1');assert.equal(await physicalDetail.getAttribute('data-composition-id'),physicalScope);
  for(const ability of ['SUSTAINED HITS 1','LANCE'])await weaponAbility(lordWeapons[0],ability,true,{detail:true});
  await page.getByRole('button',{name:'Close rule reference',exact:true}).click();await page.waitForFunction(()=>!document.querySelector('.v2-detail-dialog')?.open);
  for(const ability of ['SUSTAINED HITS 1','LANCE'])await weaponAbility(lordWeapons[0],ability);
  assert.equal(new URL(page.url()).searchParams.get('instance'),'parsed-unit-1');assert.equal(await page.locator(`main [data-card-id="${LOC}"][data-roster-instance-id="parsed-unit-1"]`).count(),1,'Back lost exact physical Character component');assert.match(await page.locator('main [data-canonical-ability-id="core-feel-no-pain"]').innerText(),/Feel No Pain\s*:?\s*4\+/i,`${device}: Back lost effective MODEL ability`);
  await page.goForward();await page.waitForSelector('dialog.v2-detail-dialog[open]');await weaponAbility(lordWeapons[0],'LANCE',true,{detail:true});await page.getByRole('button',{name:'Close rule reference',exact:true}).click();await page.waitForFunction(()=>!document.querySelector('.v2-detail-dialog')?.open);
  await open('parsed-unit-1');await api(id=>window.ArmyBookAppV2.showDetail(id),lordWeapons[0]);
  await page.waitForFunction(()=>document.querySelector('.v2-detail-dialog')?.open);
  for(const ability of ['SUSTAINED HITS 1','LANCE'])await weaponAbility(lordWeapons[0],ability,true,{detail:true});
  await page.getByRole('button',{name:'Close rule reference',exact:true}).click();await page.waitForFunction(()=>!document.querySelector('.v2-detail-dialog')?.open);
  await open('parsed-unit-3');assert((await page.locator('main [data-roster-context-instance-id="parsed-unit-3"]').innerText()).includes('Lord of Contagion #1'),`${device}: actual leading physical Character absent from Reader context`);for(const id of dsWeapons)for(const ability of ['SUSTAINED HITS 1','LANCE'])await weaponAbility(id,ability);
  await open('parsed-unit-2');await modelAbility(profileId(LOC),'Feel No Pain',4,false);for(const id of lordWeapons)await weaponAbility(id,'LANCE',false);
  await open('parsed-unit-4');for(const id of dsWeapons)await weaponAbility(id,'LANCE',false);
  await detach('parsed-unit-1');await open('parsed-unit-1');await modelAbility(profileId(LOC),'Feel No Pain',4,false);for(const id of lordWeapons)for(const ability of ['SUSTAINED HITS 1','LANCE'])await weaponAbility(id,ability,false);
  assert(!(await page.locator('main [data-roster-context-instance-id="parsed-unit-1"]').innerText()).includes('Attached to'),`${device}: stale attachment shown after detach`);
  await open('parsed-unit-3');for(const id of dsWeapons)for(const ability of ['SUSTAINED HITS 1','LANCE'])await weaponAbility(id,ability,false);
  await attach('parsed-unit-1','parsed-unit-3');await open('parsed-unit-1');await modelAbility(profileId(LOC),'Feel No Pain',4);for(const id of lordWeapons)for(const ability of ['SUSTAINED HITS 1','LANCE'])await weaponAbility(id,ability);
  await open('parsed-unit-3');for(const id of dsWeapons)for(const ability of ['SUSTAINED HITS 1','LANCE'])await weaponAbility(id,ability);
  const attachedBackup=await api(()=>window.ArmyBookAppV2.roster.snapshot());await load(JSON.parse(JSON.stringify(attachedBackup)));await open('parsed-unit-1');await modelAbility(profileId(LOC),'Feel No Pain',4);

  // A synthetic projection-disconnect mutation must fail the same DOM check;
  // changing a debug/provenance row alone cannot satisfy these assertions.
  await api(()=>{const service=window.ArmyBookAppV2.roster;window.visibleEffectsOriginal=service.effective;service.effective=function(id){const result=window.visibleEffectsOriginal.call(service,id);for(const profile of result.profiles)profile.abilities=[];return result;};});
  await open('parsed-unit-1');await assert.rejects(()=>modelAbility(profileId(LOC),'Feel No Pain',4),assert.AssertionError);mutations++;
  await api(()=>{window.ArmyBookAppV2.roster.effective=window.visibleEffectsOriginal;delete window.visibleEffectsOriginal;});await open('parsed-unit-1');await modelAbility(profileId(LOC),'Feel No Pain',4);

  await load(state([unit('bio','unit-biologus-putrifier'),unit('pm',PM,5,{weapons:[melta,pmKnife]}),unit('pm2',PM,5,{weapons:[melta]})]));await attach('bio','pm');await open('pm');for(const id of [melta,pmKnife])await weaponAbility(id,'LETHAL HITS');await mark(0);await open('pm2');await weaponAbility(melta,'LETHAL HITS',false);
  await load(state([unit('h','unit-helbrute',1,{weapons:['datasheet-helbrute:weapon:10','datasheet-helbrute:weapon:11','datasheet-helbrute:weapon:12']})]));await open('h');await stat('datasheet-helbrute:weapon:11','attacks','7');await stat('datasheet-helbrute:weapon:12','attacks','6');await stat('datasheet-helbrute:weapon:10','attacks','5');await mark(2);
  await load(state([unit('icon','unit-icon-bearer'),unit('pm',PM,5)]));await attach('icon','pm');await open('pm');await stat(profileId(PM),'OC','3');await mark(3);
  await load(state([unit('poxlord','unit-lord-of-poxes'),unit('bio','unit-biologus-putrifier')],'detachment-paragons-of-putrescence'));await open('poxlord');await metric(profileId('unit-lord-of-poxes'),'contagionRange',6,12);await open('bio');await metric(profileId('unit-biologus-putrifier'),'contagionRange',3,12);await mark(5,19);
  await load(state([unit('nox','unit-noxious-blightbringer'),unit('pm',PM,5)]));await attach('nox','pm');await open('pm');await stat(profileId(PM),'M','6"');await mark(6);
  for(const [slug,count,index] of [['plague-drones',3,7],['plaguebearers',10,8]]){const equipment=`datasheet-${slug}:wargear:2`;await load(state([unit('with',`unit-${slug}`,count,{selections:[{selectionKey:'icon',canonicalProfileIds:[],canonicalEquipmentIds:[equipment],canonicalFieldPaths:{[equipment]:['/text']},physicalQuantity:1}]}),unit('without',`unit-${slug}`,count)]));await open('with');await stat(profileId(`unit-${slug}`),'LD','6+');await mark(index);await open('without');await stat(profileId(`unit-${slug}`),'LD','7+');}
  await load(state([unit('enhanced',LOC,1,{weapons:lordWeapons,enhancements:['detachment-virulent-vectorium:enhancement:2','detachment-virulent-vectorium:enhancement:4']}),unit('ordinary',LOC,1,{weapons:lordWeapons})]));await open('enhanced');await stat(lordWeapons[0],'strength','10');await stat(lordWeapons[0],'attacks','6');for(const id of lordWeapons)await weaponAbility(id,'DEVASTATING WOUNDS');await modelAbility(profileId(LOC),'Feel No Pain',5);await mark(9,10);await open('ordinary');await stat(lordWeapons[0],'strength','9');await weaponAbility(lordWeapons[0],'DEVASTATING WOUNDS',false);await modelAbility(profileId(LOC),'Feel No Pain',5,false);
  await load(state([unit('nox','unit-noxious-blightbringer',1,{enhancements:['detachment-shamblerot-vectorium:enhancement:1']}),unit('caster','unit-malignant-plaguecaster',1,{weapons:['datasheet-malignant-plaguecaster:weapon:2','datasheet-malignant-plaguecaster:weapon:3'],enhancements:['detachment-shamblerot-vectorium:enhancement:3','detachment-shamblerot-vectorium:enhancement:4']}),unit('pox','unit-poxwalkers',20),unit('pox2','unit-poxwalkers',10)],'detachment-shamblerot-vectorium'));await attach('nox','pox');await attach('caster','pox');await open('pox');await stat(profileId('unit-poxwalkers'),'OC','2');await stat(profileId('unit-poxwalkers'),'T','5');await keyword('unit-poxwalkers','BATTLELINE');await open('caster');await stat('datasheet-malignant-plaguecaster:weapon:2','damage','D3+1');await stat('datasheet-malignant-plaguecaster:weapon:3','damage','D3+1');await stat(profileId('unit-malignant-plaguecaster'),'T','6');await mark(11,12,13,18);await open('pox2');await stat(profileId('unit-poxwalkers'),'T','4');await stat(profileId('unit-poxwalkers'),'OC','1');
  await load(state([unit('fell',LOC,1,{weapons:lordWeapons,enhancements:['detachment-tallyband-summoners:enhancement:2']})],'detachment-tallyband-summoners'));await open('fell');await stat(lordWeapons[0],'attacks','7');await mark(14);
  await load(state([unit('vile',LOC,1,{enhancements:['detachment-death-lords-chosen:enhancement:2']}),unit('ds',DS,3)],'detachment-death-lords-chosen'));await attach('vile','ds');await open('ds');await stat(profileId(DS),'M','6"');await mark(15);
  await load(state([unit('h','unit-helbrute',1,{weapons:['datasheet-helbrute:weapon:9'],enhancements:['detachment-contagion-engines:enhancement:2']}),unit('h2','unit-helbrute',1,{weapons:['datasheet-helbrute:weapon:9']}),unit('pm',PM,5,{weapons:['datasheet-plague-marines:weapon:2']})],'detachment-contagion-engines'));await open('h');await keyword('unit-helbrute','MOBILE');await keyword('unit-helbrute','CONTAGION ENGINE');await weaponAbility('datasheet-helbrute:weapon:9','ASSAULT');await mark(16,20,21);await open('h2');await keyword('unit-helbrute','MOBILE',false);await weaponAbility('datasheet-helbrute:weapon:9','ASSAULT');await open('pm');await keyword(PM,'CONTAGION ENGINE',false);await weaponAbility('datasheet-plague-marines:weapon:2','ASSAULT',false);
  await load(state([unit('veiled',PM,5,{enhancements:['detachment-flyblown-host:enhancement:2']}),unit('ordinary',PM,5)],'detachment-flyblown-host'));await open('veiled');await metric(profileId(PM),'detectionRange',-3);await mark(17);
  // These three independently sourced clauses were added after the old 22-clause census.
  for(const [slug,count,index] of [['plague-drones',3,22],['plaguebearers',10,23]]){
    const equipment=`datasheet-${slug}:wargear:1`,ruleId=`datasheet-${slug}:section:1`;
    const enabled=state([unit('instrument',`unit-${slug}`,count,{selections:[{selectionKey:'instrument',canonicalProfileIds:[],canonicalEquipmentIds:[equipment],canonicalFieldPaths:{[equipment]:['/text']},physicalQuantity:1}]}),unit('ordinary',`unit-${slug}`,count)]);
    await load(enabled);await open('instrument');await charge('instrument',ruleId);await mark(index);
    await open('ordinary');await charge('ordinary',ruleId,false);
    const removed=structuredClone(enabled);removed.units[0].selections=[];await load(removed);await open('instrument');await charge('instrument',ruleId,false);
    await load(enabled);await load(enabled);await open('instrument');await charge('instrument',ruleId);
  }
  const criticalEnabled=state([unit('critical',LOC,1,{weapons:lordWeapons,enhancements:['detachment-virulent-vectorium:enhancement:1']}),unit('ordinary',LOC,1,{weapons:lordWeapons})]);
  await load(criticalEnabled);await open('critical');for(const id of lordWeapons)await critical(id,'critical');await mark(24);
  await open('ordinary');for(const id of lordWeapons)await critical(id,'ordinary',false);
  const criticalRemoved=structuredClone(criticalEnabled);criticalRemoved.units[0].enhancementIds=[];await load(criticalRemoved);await open('critical');for(const id of lordWeapons)await critical(id,'critical',false);
  await load(criticalEnabled);await load(criticalEnabled);await open('critical');for(const id of lordWeapons)await critical(id,'critical');
  assert.deepEqual(covered,denominator,`${device}: complete25 source clauses through player-visible Reader`);
  // Independently remove each consumer's physical projection in HTTP memory.
  // Canonical fallback is the original defect, so source-backed assertions
  // must reject it even while the same runtime/applied debug rows are correct.
  for(const [mode,kind] of [['POPUP','WEAPON'],['POPUP','MODEL'],['STANDALONE','WEAPON']]){
   runtimePoison=mode;const poisonedContext=await browser.newContext({viewport}),poisonedPage=await poisonedContext.newPage();
   try{
    await poisonedPage.goto(`http://127.0.0.1:${server.address().port}${appURL}`);await poisonedPage.waitForFunction(()=>!!window.ArmyBookAppV2?.rosterPanel);await poisonedPage.evaluate(()=>window.ArmyBookAppV2.rosterPanel.ready);
    await poisonedPage.evaluate(text=>{const app=window.ArmyBookAppV2;assertReady(app.roster.import(text));app.roster.attach('parsed-unit-1','parsed-unit-3');app.openPersonalGuide();app.openInstance('parsed-unit-1');function assertReady(result){if(result.status!=='READY')throw new Error('Mutation import failed');}},real);
    const id=kind==='MODEL'?profileId(LOC):lordWeapons[0];
    await poisonedPage.evaluate(({mode,id})=>mode==='STANDALONE'?window.ArmyBookAppV2.open(id):window.ArmyBookAppV2.showDetail(id),{mode,id});
    const scope=mode==='STANDALONE'?'main':'.v2-dialog-content';
    const observed=await poisonedPage.locator(`${scope} [data-card-id="${id}"]`).evaluateAll(nodes=>({text:nodes.map(n=>n.innerText).join(' '),abilities:nodes.flatMap(n=>[...n.querySelectorAll('[data-fact-id]')].filter(f=>/::\/abilities\//.test(f.dataset.factId)).map(f=>JSON.parse(f.dataset.factValue)))}));
    assert.throws(()=>kind==='MODEL'?assert(/Feel No Pain\s*:\s*4\+/.test(observed.text),'Effective MODEL ability missing'):assert(observed.abilities.some(ability=>normalize(ability)==='lance'),'Effective weapon ability missing'),assert.AssertionError,`${device}: ${mode}/${kind} canonical-fallback mutation escaped`);mutations++;
   }finally{await poisonedContext.close();runtimePoison=null;}
  }
  const after=await api(()=>{window.ArmyBookAppV2.openLibrary();window.ArmyBookAppV2.open('unit-lord-of-contagion');return [...document.querySelectorAll('main [data-fact-id]')].map(f=>[f.dataset.factId,f.dataset.factValue]);});assert.deepEqual(after,baseline,`${device}: no-roster Reader changed`);
  assert.deepEqual(errors,[],`${device}: uncaught browser errors`);assert.equal(await api(()=>document.documentElement.scrollWidth>innerWidth+1),false,`${device}: page overflow`);
  results.push({device,sourceClauses:covered.size,controls,mutationsDetected:mutations});await context.close();
 }
 assert.deepEqual(forbiddenRequests,[],'Undeclared/legacy factual dependency');
 for(const [file,snapshot]of sourceSnapshots)assert.deepEqual(fs.readFileSync(path.join(directory,file)),snapshot,`Source/contract/factual projection changed during QA: ${file}`);
 console.log(JSON.stringify({status:'PASS',rosterExecutable:denominator.size,visibleEffectsCorrect:'25/25',censusMutationsDetected:censusMutations,missingVisibleEffects:0,wrongVisibleEffects:0,instanceLeakage:0,classifications,megaCase:'PASS',detachReattach:'PASS',results}));
}finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}

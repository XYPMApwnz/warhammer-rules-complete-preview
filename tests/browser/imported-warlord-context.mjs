import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {createServer} from 'node:http';
import {fileURLToPath} from 'node:url';
import {launchChromium} from '../helpers/browser-launch.mjs';
import {createCompatibleRulesSource} from '../../books/shared/compatible-rules-matrix.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const scope={URL,URLSearchParams};scope.window=scope;
vm.createContext(scope);
for(const file of ['books/shared/roster-parser.js','books/death-guard/scripts/roster-data.js','books/shared/rule-facts.js','books/shared/related-rules-matcher.js','roster-guides/points-data.js','roster-guides/points-validator.js','books/shared/roster-context.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),scope,{filename:file});
const sourceText=warlord=>`+ FACTION KEYWORD: Chaos - Death Guard
+ DETACHMENT: Virulent Vectorium (Worldblight)
+ BATTLE SIZE: Strike Force (2000 Point limit)
+ TOTAL ARMY POINTS: 240pts
${warlord?`+ WARLORD: ${warlord}`:''}
Char1: 1x Biologus Putrifier (60 pts)
Char2: 1x Lord of Contagion (120 pts)
Char3: 1x Biologus Putrifier (60 pts)`;
const negativeText=sourceText('Char2: Lord of Contagion'),positiveText=sourceText('Char3: Biologus Putrifier');
const project=(text,record={})=>scope.WHArmyRosterContext.project({roster:scope.WHRosterParser.parse(text,{identityHints:record.roster}),catalog:scope.WH_BOOK_ROSTER_CATALOG,record});
const matrix=JSON.parse(fs.readFileSync(path.join(root,'books/death-guard/generated/compatible-rules.json'),'utf8'));
for(const rows of Object.values(matrix.units))for(const row of rows)if(row.detachmentId)row.detachmentId=row.detachmentId.replace(/^detachment-/,'');
const source=createCompatibleRulesSource(matrix,{resolveDetachmentSelection:true});
const plaguesurge=(projection,instance)=>{
  const unit=projection.context.units.find(unit=>unit.instanceId===instance);
  return source.rowsForUnit(unit.datasheetId,{detachmentId:'virulent-vectorium',warlord:unit.warlord.state==='resolved'?unit.warlord.selected:null}).find(row=>row.ruleId==='stratagem-plaguesurge');
};
const negative=project(negativeText),positive=project(positiveText);
const flags=projection=>Array.from(projection.context.units,unit=>unit.warlord.selected);
assert.deepEqual(flags(negative),[false,true,false],'normalized physical Warlord identity');
assert.deepEqual(flags(positive),[false,false,true],'duplicate Datasheets must remain isolated');
assert.deepEqual(Array.from(negative.game.units,unit=>unit.rosterState.warlord.selected),[false,true,false],'effective roster context');
assert.equal(Object.isFrozen(negative.context.units[1].warlord),true);
assert.equal(plaguesurge(negative,'parsed-unit-1'),undefined,'exact negative reproduction');
assert.equal(plaguesurge(negative,'parsed-unit-3'),undefined,'non-Warlord duplicate');
assert.equal(plaguesurge(negative,'parsed-unit-2')?.state,'match','Lord of Contagion positive');
assert.equal(plaguesurge(positive,'parsed-unit-3')?.state,'match','Biologus positive');
assert.equal(plaguesurge(positive,'parsed-unit-1'),undefined,'same Datasheet does not inherit Warlord');
const predicate={v:1,roles:[{id:'target',side:'friendly',subject:'model',selector:{warlord:true}}]};
for(const unit of negative.context.units){
  const profile=scope.WHRuleFacts.profileFromRecord({id:unit.datasheetId,keywords:['CHARACTER'],warlord:unit.warlord.selected});
  assert.equal(scope.WHRelatedRules.match(predicate,profile).state,unit.warlord.selected?'match':'no-match','generic Warlord predicate consumes the physical flag');
}
assert.equal(project(sourceText()).context.units[0].warlord.state,'unknown','missing metadata remains unknown');
const roundtrip=project(negativeText,JSON.parse(JSON.stringify({id:'roundtrip',sourceText:negativeText,roster:negative.roster})));
assert.deepEqual(flags(roundtrip),flags(negative));
assert.deepEqual(Array.from(roundtrip.context.units,unit=>unit.instanceId),Array.from(negative.context.units,unit=>unit.instanceId));
assert.equal(JSON.stringify(negative.game.units.map(unit=>unit.effective)),JSON.stringify(positive.game.units.map(unit=>unit.effective)),'Warlord identity does not modify unrelated effective Datasheets');
assert.equal(JSON.stringify(negative.game.legality),JSON.stringify(positive.game.legality),'no new army-construction legality validation');
const attachedText=positiveText+'\n5x Plague Marines (100 pts)',attachedRecord={attachments:{'parsed-unit-4':['parsed-unit-3']}},attached=project(attachedText,attachedRecord),detached=project(attachedText);
assert.deepEqual(Array.from(attached.attachmentState.attachments['parsed-unit-4']),['parsed-unit-3'],'existing Character/Bodyguard flow remains legal');
assert.deepEqual(flags(attached),[false,false,true,false],'attached Bodyguard does not inherit Character Warlord state');
assert.deepEqual(flags(detached),flags(attached),'detachment preserves physical Warlord identity');
assert.equal(plaguesurge(attached,'parsed-unit-4'),undefined,'Bodyguard does not consume the attached Character Warlord identity');
const mixed=createCompatibleRulesSource({schema:'test/v1',units:{a:[{ruleId:'r',detachmentId:'d',state:'match'}],b:[{ruleId:'r',detachmentId:'d',state:'conditional',conditions:['warlord-unknown','attachment-unknown']}],c:[{ruleId:'r',detachmentId:'other',state:'match'}]}});
assert.equal(mixed.rowsForUnit('a',{warlord:false}).length,0);
assert.deepEqual(mixed.rowsForUnit('b',{warlord:true})[0].conditions,['attachment-unknown'],'other conditions remain unresolved');
assert.equal(mixed.rowsForUnit('b',{})[0].state,'conditional');
assert.equal(mixed.rowsForUnit('c',{warlord:false}).length,1,'detachment-qualified rule identity');

const types={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp'};
const server=createServer(async(request,response)=>{
  try{
    let file=path.resolve(root,'.'+decodeURIComponent(new URL(request.url,'http://localhost').pathname));
    assert.ok(file.startsWith(root+path.sep));
    if((await fs.promises.stat(file)).isDirectory())file=path.join(file,'index.html');
    response.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');
    response.end(await fs.promises.readFile(file));
  }catch{response.writeHead(404).end();}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
let browser,context;
try{
  browser=await launchChromium();
  context=await browser.newContext({serviceWorkers:'block',viewport:{width:390,height:844}});
  const page=await context.newPage(),errors=[];
  page.setDefaultTimeout(15000);page.on('pageerror',error=>errors.push(error.message));
  const origin=`http://127.0.0.1:${server.address().port}`,storage='wh40k-rosters-v1';
  const guides=()=>page.goto(`${origin}/roster-guides/index.html`);
  const records=()=>page.evaluate(key=>JSON.parse(localStorage.getItem(key)||'[]'),storage);
  const submit=async text=>{
    await guides();await page.locator('#roster-input').fill(text);await page.locator('#roster-form button[type="submit"]').click();
    await page.waitForFunction(source=>JSON.parse(localStorage.getItem('wh40k-rosters-v1')||'[]').some(record=>record.sourceText===source),text);
    return (await records()).find(record=>record.sourceText===text);
  };
  const check=async(record,instance,canonicalId,expected,reload=false)=>{
    await page.goto(`${origin}/books/death-guard/reader.html?view=mobile&roster=${record.id}&rosterInstance=${instance}#${canonicalId}`);
    if(reload)await page.reload();
    await page.waitForFunction(id=>window.WH_ARMY_ROSTER_CONTEXT?.units.some(unit=>unit.instanceId===id)&&document.querySelector(`.unit-card[data-roster-instance="${id}"] .related-rules-trigger`),instance);
    const state=await page.evaluate(id=>({normalized:window.WH_ARMY_ROSTER_CONTEXT.units.find(unit=>unit.instanceId===id).warlord.selected,effective:window.WH_ARMY_ROSTER_GAME_PROJECTION.units.find(unit=>unit.identity.instanceId===id).rosterState.warlord.selected}),instance);
    assert.deepEqual(state,{normalized:expected,effective:expected});
    await page.locator(`.unit-card[data-roster-instance="${instance}"] .related-rules-trigger`).click();
    const rule=page.locator('.related-rules-layer [data-rule-id="stratagem-plaguesurge"]');
    await rule.waitFor({state:'attached'});
    assert.equal(await rule.isVisible(),expected,`${instance}: production Compatible Stratagems`);
    assert.equal(await rule.getAttribute('data-match-state'),expected?'match':'no-match');
  };
  const imported=await submit(negativeText);
  assert.deepEqual(imported.roster.units.map(unit=>unit.warlord),[false,true,false]);
  await check(imported,'parsed-unit-1','unit-biologus-putrifier',false);
  await check(imported,'parsed-unit-2','unit-lord-of-contagion',true);
  await check(imported,'parsed-unit-3','unit-biologus-putrifier',false,true);
  const importedPositive=await submit(positiveText);
  await check(importedPositive,'parsed-unit-3','unit-biologus-putrifier',true);
  await check(importedPositive,'parsed-unit-1','unit-biologus-putrifier',false);
  await guides();await page.evaluate(key=>localStorage.removeItem(key),storage);await page.reload();
  await page.locator('#import-roster-file').setInputFiles({name:'warlord-roundtrip.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(imported))});
  await page.waitForFunction(()=>document.querySelector('#import-roster-file').value==='');
  const restored=(await records())[0];
  assert.deepEqual(restored.roster.units.map(unit=>({id:unit.id,warlord:unit.warlord})),imported.roster.units.map(unit=>({id:unit.id,warlord:unit.warlord})));
  await check(restored,'parsed-unit-2','unit-lord-of-contagion',true,true);
  await check(restored,'parsed-unit-1','unit-biologus-putrifier',false,true);
  assert.deepEqual(errors,[],'production import/reader runtime errors');
  console.log('Imported Warlord context QA: PASS (real import, negative/positive PLAGUESURGE, duplicate isolation, normalized/effective state, reload and JSON backup roundtrip).');
}finally{
  await context?.close();await browser?.close();await new Promise(resolve=>server.close(resolve));
}

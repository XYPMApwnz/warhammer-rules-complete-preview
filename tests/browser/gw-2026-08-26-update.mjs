import {createQaEvidenceDir} from '../helpers/qa-temp.mjs';
import {launchChromium} from '../helpers/browser-launch.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const screenshotDir=createQaEvidenceDir('gw-2026-08-26-');
fs.mkdirSync(screenshotDir,{recursive:true});
const types={'.css':'text/css','.html':'text/html','.js':'text/javascript','.json':'application/json','.mjs':'text/javascript','.png':'image/png','.webp':'image/webp'};
const server=http.createServer((request,response)=>{
  const pathname=decodeURIComponent(new URL(request.url,'http://127.0.0.1').pathname);
  const file=path.resolve(root,pathname.replace(/^\/+/,'')||'index.html');
  if(file!==root&&!file.startsWith(root+path.sep)){response.writeHead(403).end();return;}
  try{const stat=fs.statSync(file),target=stat.isDirectory()?path.join(file,'index.html'):file;response.writeHead(200,{'content-type':types[path.extname(target)]||'application/octet-stream'});fs.createReadStream(target).pipe(response);}
  catch{response.writeHead(404).end();}
});
await new Promise((resolve,reject)=>server.listen(0,'127.0.0.1',error=>error?reject(error):resolve()));
const origin='http://127.0.0.1:'+server.address().port;
const record=(id,sourceText,attachments={})=>({id,sourceText,attachments});
const fixtures={
  dg:record('gw-dg',"FACTION KEYWORD: Chaos - Death Guard\nDETACHMENT: Mortarion's Hammer\n1x Mortarion (375 pts)\n5x Blightlord Terminators (180 pts)"),
  am:record('gw-am',"FACTION KEYWORD: Imperium - Adeptus Mechanicus\nDETACHMENT: Cohort Cybernetica\n2x Kastelan Robots (180 pts): Incendine combustor, Twin Kastelan fist\n1x Cybernetica Datasmith (35 pts): Mechanicus pistol, Power fist\n1x Cybernetica Datasmith (35 pts): Mechanicus pistol, Power fist",{'parsed-unit-1':['parsed-unit-2']}),
  ec:record('gw-ec',"FACTION KEYWORD: Chaos - Emperor's Children\nDETACHMENT: Carnival of Excess\n1x Heldrake (0 pts)\n1x Lord Exultant (0 pts)\nEnhancement: Possessed Blade (+35 pts)\n1x Lord Exultant (0 pts)\nEnhancement: Warp Walker (+35 pts)"),
  tyr:record('gw-tyr',"FACTION KEYWORD: Xenos - Tyranids\n1x Norn Assimilator (0 pts): Toxinjector harpoon"),
  csm:record('gw-csm',"FACTION KEYWORD: Chaos - Chaos Space Marines\n1x Masters of the Maelstrom (0 pts)\n1x Heldrake (0 pts)"),
  sm:record('gw-sm',"FACTION KEYWORD: Imperium - Space Marines\n1x Wardens of Ultramar (0 pts)"),
  da:record('gw-da',"FACTION KEYWORD: Imperium - Dark Angels\n1x Lion El'Jonson (0 pts)"),
  ba:record('gw-ba',"FACTION KEYWORD: Imperium - Blood Angels\n1x Blood Angels Captain (0 pts)")
};
const browser=await launchChromium();
let scenarios=0,mobile=0,desktop=0,screens=0;
const open=async(book,saved,instanceId,canonicalId,viewport={width:390,height:844})=>{
  const context=await browser.newContext({serviceWorkers:'block',viewport});
  await context.addInitScript(value=>localStorage.setItem('wh40k-rosters-v1',JSON.stringify([value])),saved);
  const page=await context.newPage();
  await page.goto(origin+'/books/'+book+'/reader.html?view=mobile&roster='+saved.id+'&rosterInstance='+instanceId+'#'+canonicalId,{waitUntil:'networkidle'});
  await page.waitForFunction(id=>window.WH_ARMY_ROSTER_GAME_PROJECTION?.units.some(unit=>unit.identity.instanceId===id)&&document.querySelector('.unit-card.roster-game-view[data-roster-instance="'+id+'"]'),instanceId);
  if(viewport.width<=500)mobile++;else desktop++;
  return{context,page};
};
const capture=async(page,name)=>{const file=path.join(screenshotDir,name+'.png');await page.screenshot({path:file,fullPage:true});screens++;return file;};
const cardState=page=>page.evaluate(()=>{
  const card=document.querySelector('.unit-card.roster-game-view');
  const unit=window.WH_ARMY_ROSTER_GAME_PROJECTION.units.find(item=>item.identity.instanceId===card?.dataset.rosterInstance);
  const active=card?.querySelector('.roster-game-effects')?.textContent||'';
  const keywords=[...(card?.querySelectorAll('.keyword-list>*')||[])].filter(node=>!node.hidden&&getComputedStyle(node).display!=='none').map(node=>node.textContent.trim());
  const keywordNodes=[...(card?.querySelectorAll('*')||[])].filter(node=>!node.children.length&&/VEHICLE|INFANTRY/i.test(node.textContent||'')).map(node=>({text:node.textContent.trim(),className:node.className,parentClass:node.parentElement?.className||'',grandClass:node.parentElement?.parentElement?.className||'',hidden:node.hidden,display:getComputedStyle(node).display,height:node.getBoundingClientRect().height}));
  return{cardText:card?.textContent||'',active,keywords,rawKeywords:unit?.effective?.keywords||[],keywordNodes,abilities:unit?.effective?.abilities?.map(item=>item.title)||[],duplicateIds:[...document.querySelectorAll('[id]')].map(n=>n.id).filter((id,index,all)=>all.indexOf(id)!==index)};
});
const targetText=async(page,book,targetId)=>{
  await page.goto(origin+'/books/'+book+'/reader.html?view=mobile#'+targetId,{waitUntil:'networkidle'});
  await page.waitForFunction(id=>document.getElementById(id)?.getBoundingClientRect().height>0,targetId);
  return page.locator('#'+targetId).innerText();
};

try{
  const dg=await open('death-guard',fixtures.dg,'parsed-unit-1','unit-mortarion');
  const dgState=await cardState(dg.page);
  assert.match(dgState.cardText,/375/);scenarios++;
  const dgRuntime=await dg.page.evaluate(()=>{
    const catalog=window.WH_POINTS_CATALOG?.['death guard']||{};
    const raw=JSON.stringify(catalog);
    const glossary=window.WH40K_GLOSSARY?.forBook?.('death-guard')||{};
    const skull=Object.values(glossary).find(item=>item.title==='Skullsquirm Blight');
    return{raw,skull:JSON.stringify(skull||{})};
  });
  assert.match(dgRuntime.raw,/BLIGHTLORD TERMINATORS|Blightlord Terminators/i);
  assert.match(dgRuntime.raw,/180/);scenarios++;
  assert.doesNotMatch(dgRuntime.raw,/UNIQUE:\s*ENGINES/i);scenarios++;
  assert.match(dgRuntime.skull,/Benefit of Cover/i);assert.doesNotMatch(dgState.active,/Benefit of Cover/i);scenarios++;
  await capture(dg.page,'01-death-guard-update');await dg.context.close();

  const amAttached=await open('adeptus-mechanicus',fixtures.am,'parsed-unit-2','unit-cybernetica-datasmith');
  await amAttached.page.getByRole('button',{name:'Keywords',exact:true}).click();
  await amAttached.page.waitForFunction(()=>document.getElementById('cybernetica-datasmith-keywords')?.getBoundingClientRect().height>0);
  const amA=await cardState(amAttached.page);
  assert.match(amA.cardText,/KeywordsCybernetica DatasmithTech-PriestVehicleCharacter/i);
  assert.doesNotMatch(amA.active,/VEHICLE removed|INFANTRY added/i);
  assert.match(amA.cardText,/Data-severed/);scenarios++;
  await capture(amAttached.page,'02-am-datasmith-attached');await amAttached.context.close();
  const amAlone=await open('adeptus-mechanicus',fixtures.am,'parsed-unit-3','unit-cybernetica-datasmith');
  await amAlone.page.getByRole('button',{name:'Keywords',exact:true}).click();
  await amAlone.page.waitForFunction(()=>document.getElementById('cybernetica-datasmith-keywords')?.getBoundingClientRect().height>0);
  const amU=await cardState(amAlone.page);
  assert.ok(amU.keywordNodes.some(node=>node.text==='INFANTRY'&&node.parentClass==='roster-derived-keyword'&&node.height>0));
  assert.ok(amU.keywordNodes.some(node=>node.text==='Vehicle'&&node.grandClass==='keyword-list'&&node.height===0));
  assert.match(amU.cardText,/Data-severed/);
  assert.equal(amU.duplicateIds.length,0);scenarios++;
  await capture(amAlone.page,'03-am-datasmith-unattached');await amAlone.context.close();

  const ec=await open('emperors-children',fixtures.ec,'parsed-unit-2','unit-lord-exultant');
  const ecState=await cardState(ec.page);
  assert.match(ecState.cardText,/Possessed Blade/i);assert.match(ecState.cardText,/35 PTS INCLUDED/i);assert.doesNotMatch(ecState.cardText,/25 PTS CURRENT/i);scenarios++;
  await capture(ec.page,'04-ec-enhancement-points');await ec.context.close();
  const ecWarp=await open('emperors-children',fixtures.ec,'parsed-unit-3','unit-lord-exultant');
  const ecWarpState=await cardState(ecWarp.page);
  assert.match(ecWarpState.cardText,/Warp Walker/i);assert.match(ecWarpState.cardText,/35 PTS INCLUDED/i);assert.doesNotMatch(ecWarpState.cardText,/30 PTS CURRENT/i);scenarios++;
  await ecWarp.context.close();
  const ecDrake=await open('emperors-children',fixtures.ec,'parsed-unit-1','unit-heldrake');
  const ecDrakeState=await cardState(ecDrake.page);
  assert.match(ecDrakeState.cardText,/OC\s*0/i);assert.doesNotMatch(ecDrakeState.active,/On to the Next/i);scenarios++;
  await ecDrake.context.close();

  const tyr=await open('tyranids',fixtures.tyr,'parsed-unit-1','unit-norn-assimilator');
  const tyrState=await cardState(tyr.page);
  assert.match(tyrState.cardText,/Harpooned/);assert.match(tyrState.cardText,/\+2 to charge rolls/);
  assert.doesNotMatch(tyrState.active,/Harpooned|\+2 to charge/i);scenarios++;
  await capture(tyr.page,'05-tyranids-harpooned');await tyr.context.close();

  const csm=await open('chaos-space-marines',fixtures.csm,'parsed-unit-1','unit-masters-of-the-maelstrom');
  const csmState=await cardState(csm.page);
  assert.match(csmState.cardText,/Support/);assert.ok(!csmState.abilities.includes('Masters of the Maelstrom'));scenarios++;
  await capture(csm.page,'06-csm-masters-support');await csm.context.close();
  const csmDrake=await open('chaos-space-marines',fixtures.csm,'parsed-unit-2','unit-heldrake');
  assert.match((await cardState(csmDrake.page)).cardText,/OC\s*0/i);scenarios++;
  await csmDrake.context.close();

  const sm=await open('space-marines',fixtures.sm,'parsed-unit-1','unit-wardens-of-ultramar',{width:1280,height:900});
  const smState=await cardState(sm.page);
  assert.match(smState.cardText,/Support/);scenarios++;
  assert.doesNotMatch(smState.cardText,/Heroes of Ultramar/);scenarios++;
  await capture(sm.page,'07-sm-wardens-support');
  assert.match(await targetText(sm.page,'space-marines','detachment-anvil-siege-force'),/halve the Objective Control/);
  assert.match(await targetText(sm.page,'space-marines','detachment-armoured-speartip'),/turn it disembarked from a TRANSPORT/);scenarios++;
  await sm.context.close();

  const da=await open('dark-angels',fixtures.da,'parsed-unit-1','unit-lion-eljonson');
  const daState=await cardState(da.page);
  assert.match(daState.cardText,/In your Command phase/);assert.doesNotMatch(daState.cardText,/end of your opponent/);
  assert.doesNotMatch(daState.active,/Strategic Reserves|ingress move/i);scenarios++;
  const daCatalog=await da.page.evaluate(()=>JSON.stringify(window.WH_POINTS_CATALOG?.['dark angels']||{}));
  assert.doesNotMatch(daCatalog,/Wardens of Ultramar/i);
  await capture(da.page,'08-da-lion-and-inheritance');
  assert.match(await targetText(da.page,'dark-angels','detachment-anvil-siege-force'),/halve the Objective Control/);
  assert.match(await targetText(da.page,'dark-angels','detachment-armoured-speartip'),/turn it disembarked from a TRANSPORT/);scenarios++;
  await da.context.close();

  const ba=await open('blood-angels',fixtures.ba,'parsed-unit-1','unit-blood-angels-captain');
  const baInherited=await ba.page.evaluate(()=>({catalog:JSON.stringify(window.WH_POINTS_CATALOG?.['blood angels']||{}),card:document.querySelector('.unit-card.roster-game-view')?.textContent||''}));
  assert.doesNotMatch(baInherited.catalog,/Wardens of Ultramar/i);assert.match(baInherited.card,/Blood Angels Captain/i);
  await capture(ba.page,'09-ba-inherited-sm-update');
  assert.match(await targetText(ba.page,'blood-angels','detachment-anvil-siege-force'),/halve the Objective Control/);
  assert.match(await targetText(ba.page,'blood-angels','detachment-armoured-speartip'),/turn it disembarked from a TRANSPORT/);scenarios++;
  await ba.context.close();

  assert.equal(scenarios,18);
  assert.ok(screens>=8);
  console.log(JSON.stringify({browser:'Google Chrome via Playwright Chromium',rawFixtures:Object.keys(fixtures).length,scenarios,mobile,desktop,screens,screenshotDir},null,2));
  console.log('GW 26-Aug-2026 production-shaped browser acceptance: PASS');
}finally{
  await browser.close();
  await new Promise(resolve=>server.close(resolve));
}

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createServer} from 'node:http';
import {fileURLToPath} from 'node:url';
import {launchChromium} from '../helpers/browser-launch.mjs';
import {loadLeadingRuntime,sourceModelsForUnit,createLeadingRecord} from '../helpers/tau-leading-state-controls.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const loaded=loadLeadingRuntime('tau-empire');
const fixture=JSON.parse(fs.readFileSync(new URL('../fixtures/tau-leading-state.json',import.meta.url),'utf8'));
const visibleExemplars={
  'enhancement-nomadic-hunter':{tag:'ASSAULT',mode:'ranged'},
  'enhancement-borthrod-gland':{tag:'CRITICAL HITS 5+',mode:'melee'},
};
const specs=fixture.records.map(record=>({...record.spec,...visibleExemplars[record.spec.sourceId],
  ownerModels:sourceModelsForUnit(loaded,record.spec.ownerUnitId),bodyguardModels:sourceModelsForUnit(loaded,record.spec.bodyguardUnitId)}));
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml'};
const server=createServer((request,response)=>{try{
  let file=path.resolve(root,'.'+decodeURIComponent(new URL(request.url,'http://localhost').pathname));
  assert.ok(file.startsWith(root+path.sep));if(fs.statSync(file).isDirectory())file=path.join(file,'index.html');
  response.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');response.setHeader('Cache-Control','no-store');response.end(fs.readFileSync(file));
}catch{response.writeHead(404).end();}});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const origin=`http://127.0.0.1:${server.address().port}`,errors=[];let browser,cases=0;
try{
  browser=await launchChromium();
  for(const phone of [false,true])for(const spec of specs){
    const context=await browser.newContext({serviceWorkers:'block',acceptDownloads:true,viewport:phone?{width:390,height:844}:{width:1440,height:1000}});
    const guide=await context.newPage(),reader=await context.newPage();for(const page of [guide,reader]){page.setDefaultTimeout(15000);page.on('pageerror',e=>errors.push(e.message));}
    await guide.goto(origin+'/roster-guides/index.html');
    await guide.locator('#roster-input').fill(createLeadingRecord(loaded,spec).sourceText);
    await guide.locator('#roster-form button[type="submit"]').click();
    await guide.waitForFunction(()=>JSON.parse(localStorage.getItem('wh40k-rosters-v1')||'[]').length===1);
    const record=()=>guide.evaluate(()=>JSON.parse(localStorage.getItem('wh40k-rosters-v1'))[0]);
    const recordId=(await record()).id;
    async function verify(active,instance='parsed-unit-1'){
      const unitId=instance==='parsed-unit-2'?spec.bodyguardUnitId:spec.ownerUnitId;
      await reader.goto('about:blank');await reader.goto(`${origin}/books/tau-empire/reader.html?view=${phone?'mobile':'full'}&roster=${recordId}&rosterInstance=${instance}#${unitId}`);
      await reader.waitForFunction(id=>window.WH_ARMY_ROSTER_GAME_PROJECTION?.units.some(u=>u.identity.instanceId===id)&&document.querySelector(`.unit-card[data-roster-instance="${id}"]`),instance);
      const state=await reader.evaluate(({sourceId,operationIds,instance})=>{
        const units=window.WH_ARMY_ROSTER_GAME_PROJECTION.units;
        return {units:units.map(unit=>({id:unit.identity.instanceId,effects:unit.effects.filter(e=>e.source?.id===sourceId&&operationIds.includes(e.id)).map(e=>({id:e.id,owner:e.source.ownerInstanceId})),stats:unit.effective.stats,profiles:unit.effective.weaponProfiles.map(p=>({mode:p.mode,tags:p.tags}))})),text:[...document.querySelectorAll(`.unit-card[data-roster-instance="${instance}"] .weapon-row:not(.weapon-head)`)].filter(row=>!row.hidden).map(row=>row.innerText).join('\n'),move:document.querySelector(`.unit-card[data-roster-instance="${instance}"] .stat[data-source-field="stats.M"] span`)?.textContent};
      },{...spec,instance});
      assert.equal(state.units.length,4);assert.equal(new Set(state.units.map(u=>u.id)).size,4);
      for(const unit of state.units){const expected=active?spec.operationIds.filter(id=>(spec.operationTargets?.[id]||spec.expectedTargets).includes(unit.id)):[];assert.deepEqual(unit.effects.map(e=>e.id).sort(),[...expected].sort());for(const effect of unit.effects)assert.equal(effect.owner,'parsed-unit-1');}
      const selected=state.units.find(unit=>unit.id===instance);
      if(active&&spec.tag){assert.ok(selected.profiles.filter(p=>p.mode===spec.mode).some(p=>p.tags.includes(spec.tag)));assert.ok(state.text.includes(spec.tag),`${spec.sourceId}: player-visible selected weapon tag`);}
      if(spec.sourceId==='enhancement-nomadic-hunter'){assert.equal(selected.stats.M,active?'10"':'7"');assert.equal(state.move,active?'10"':'7"');}
      cases++;
    }
    async function change(value){await guide.locator('select[data-attachment-bodyguard="parsed-unit-2"]').filter({has:guide.locator(`option[value="${value}"]`)}).selectOption(value);await guide.waitForFunction(({id,attached})=>Boolean(JSON.parse(localStorage.getItem('wh40k-rosters-v1'))[0].attachments?.[id]?.length)===attached,{id:'parsed-unit-2',attached:!value.startsWith('remove:')});}
    await verify(false);await change('parsed-unit-1');await verify(true);await verify(true,'parsed-unit-2');
    await reader.reload();await verify(true);
    await change('remove:parsed-unit-1');await verify(false);await change('parsed-unit-1');await verify(true);
    const downloadEvent=guide.waitForEvent('download');await guide.locator(`[data-export-roster="${recordId}"]`).click();
    const download=await downloadEvent,stream=await download.createReadStream(),chunks=[];for await(const chunk of stream)chunks.push(chunk);const backup=Buffer.concat(chunks);
    assert.deepEqual(JSON.parse(backup).attachments,{'parsed-unit-2':['parsed-unit-1']});
    await guide.evaluate(()=>localStorage.removeItem('wh40k-rosters-v1'));await guide.reload();
    await guide.locator('#import-roster-file').setInputFiles({name:'leading-backup.json',mimeType:'application/json',buffer:backup});
    await guide.waitForFunction(()=>JSON.parse(localStorage.getItem('wh40k-rosters-v1')||'[]').length===1);await verify(true);await verify(true,'parsed-unit-2');
    console.log(`PASS ${spec.sourceId} ${phone?'phone':'desktop'}: import, UI attach/detach, duplicate isolation, reload, actual backup export/import`);
    await context.close();
  }
  assert.deepEqual(errors,[]);console.log(`Leading-state browser cases=${cases}`);
}finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}

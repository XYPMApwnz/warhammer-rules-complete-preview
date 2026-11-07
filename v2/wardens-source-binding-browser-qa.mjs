/** Constructed Wardens input, ordinary UI import and proven MFM SUPPORT edge. */
import fs from 'node:fs';import path from 'node:path';import http from 'node:http';import assert from 'node:assert/strict';import {fileURLToPath} from 'node:url';
import {createQaEvidenceDir} from '../tests/helpers/qa-temp.mjs';
import {launchChromium} from '../tests/helpers/browser-launch.mjs';
import {isApplicationTestDependency} from '../books/shared/application-v2/browser-test-dependencies.mjs';
import {parseProducerJSON} from '../books/shared/source-refs-v2/producer-io.mjs';
const root=fileURLToPath(new URL('../',import.meta.url)),out=createQaEvidenceDir('wh-wardens-source-browser-');
const text=fs.readFileSync(new URL('./fixtures/wardens-contextual-source.txt',import.meta.url),'utf8');
const facts=parseProducerJSON(fs.readFileSync(new URL('../books/space-marines/v2/generated/effective.json',import.meta.url),'utf8'));
const BANNER='ability-sm-5f9181b4142f4205',UNIT='unit-sm-c7226873c51d43c0',BODY='unit-sm-59162946fee84360';
const body=facts.entities.find(entity=>entity.id===BANNER).data.text.replace(/^Raise the Banner:\s*/,'');
const allowed=new Set(JSON.parse(fs.readFileSync(path.join(root,'tools/pages-runtime-manifest.json'))).files.map(row=>'/'+row.path));
const mime={'.html':'text/html','.mjs':'text/javascript','.js':'text/javascript','.json':'application/json','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg'};
const errors=[],missing=[],results=[];
const server=http.createServer((request,response)=>{
  const address=decodeURIComponent(new URL(request.url,'http://local').pathname),file=path.resolve(root,'.'+address);
  if(address==='/favicon.ico'){response.writeHead(204).end();return;}
  if(!file.startsWith(path.resolve(root)+path.sep)||!allowed.has(address)&&!isApplicationTestDependency(address)||!fs.existsSync(file)){
    missing.push(address);response.writeHead(404).end();return;
  }
  response.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'}).end(fs.readFileSync(file));
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const origin='http://127.0.0.1:'+server.address().port;
async function roster(page){await page.locator('[data-v2-primary-nav] [data-v2-destination="ROSTER"]').click();await page.getByRole('textbox',{name:'New Recruit text export',exact:true}).waitFor();}
async function inspect(page,id,mode,wanted,stage,device){
  await roster(page);
  if(mode==='Effective')await page.locator('[data-roster-instance-id="'+id+'"]').getByRole('button',{name:'Effective datasheet',exact:true}).click();
  else{await page.getByRole('button',{name:'Open personal guide',exact:true}).click();await page.locator('main a[data-target-id="roster-unit/'+id+'"]').click();}
  const card=page.locator('main .unit-card[data-roster-instance-id="'+id+'"]');await card.waitFor();
  const block=card.locator('article[data-attached-rule-id="'+BANNER+'"]');assert.equal(await block.count(),wanted?1:0,device+'/'+mode+'/'+stage+'/'+id);
  if(wanted){assert.equal(await block.locator('[data-attached-rule-text]').innerText(),body);assert((await block.innerText()).includes('Source: Wardens of Ultramar'));assert.equal(await block.getAttribute('data-source-instance-id'),'parsed-unit-1');}
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);
  results.push({device,mode,stage,instanceId:id,expected:wanted,status:'PASS'});
}
let browser,completed=false;
try{
  browser=await launchChromium();
  for(const [device,viewport]of [['desktop',{width:1440,height:1000}],['mobile',{width:390,height:844}]]){
    const context=await browser.newContext({viewport,serviceWorkers:'block'}),page=await context.newPage();context.setDefaultTimeout(30000);
    page.on('pageerror',error=>errors.push(error.message));
    try{
      console.log('RUN '+device+' Wardens public import');
      await page.goto(origin+'/v2/app.html');await page.locator('[data-v2-book="space-marines"]').click();await page.waitForFunction(()=>window.ArmyBookAppV2?.roster);
      await roster(page);await page.getByRole('textbox',{name:'New Recruit text export',exact:true}).fill(text);await page.locator('[data-roster-action="review-import"]').click();
      await page.waitForFunction(()=>!document.querySelector('.v2-roster[aria-busy="true"]'));
      assert.match(await page.locator('.v2-roster-status').innerText(),/^Roster imported\./);
      const units=await page.evaluate(()=>window.ArmyBookAppV2.roster.state.units);
      assert.deepEqual(units.map(unit=>unit.canonicalUnitId),[UNIT,BODY,BODY]);assert.equal(units[0].startingStrength,6);
      assert.equal(units[0].modelRows.length,6);assert.equal(new Set(units[0].modelRows.map(row=>row.canonicalProfileId)).size,6);
      for(const mode of ['Effective','Guide'])await inspect(page,'parsed-unit-2',mode,false,'before-attach',device);
      await roster(page);await page.locator('[data-attachment-candidate-for="parsed-unit-2"]').selectOption('parsed-unit-1');
      await page.locator('[data-attachment-target-instance-id="parsed-unit-2"] [data-roster-action="attach"]').click();await page.locator('[data-attached-leader-instance-id="parsed-unit-1"]').waitFor();
      assert.equal(await page.evaluate(()=>window.ArmyBookAppV2.roster.state.attachments[0].role),'SUPPORT');
      for(const mode of ['Effective','Guide']){
        await inspect(page,'parsed-unit-2',mode,true,'attached',device);await inspect(page,'parsed-unit-3',mode,false,'independent',device);
      }
      await page.screenshot({path:path.join(out,device+'-wardens-banner.png')});
      await roster(page);await page.locator('[data-roster-action="detach"][data-leader-instance-id="parsed-unit-1"]').click();
      await page.locator('[data-attached-leader-instance-id="parsed-unit-1"]').waitFor({state:'hidden'});
      for(const mode of ['Effective','Guide'])await inspect(page,'parsed-unit-2',mode,false,'detached',device);
      console.log('PASS '+device+' Wardens');
    }catch(error){await page.screenshot({path:path.join(out,device+'-FAIL.png')}).catch(()=>{});throw error;}finally{await context.close();}
  }
  assert.deepEqual(errors,[]);assert.deepEqual(missing,[]);completed=true;
}finally{
  fs.writeFileSync(path.join(out,'RESULTS.json'),JSON.stringify({status:completed?'PASS':'FAIL',results,errors,missing},null,2)+'\n');
  if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));
}
console.log(JSON.stringify({status:'PASS',devices:2,checks:results.length,evidence:out}));

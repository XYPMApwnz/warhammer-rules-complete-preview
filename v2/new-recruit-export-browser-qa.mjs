/** Exercise real export text through player controls; no injected roster state. */
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {createQaEvidenceDir} from '../tests/helpers/qa-temp.mjs';
import {launchChromium} from '../tests/helpers/browser-launch.mjs';
import {isApplicationTestDependency} from '../books/shared/application-v2/browser-test-dependencies.mjs';

const root=fileURLToPath(new URL('../',import.meta.url));
const out=createQaEvidenceDir('wh-new-recruit-browser-');
const fixtures=JSON.parse(fs.readFileSync(new URL('./fixtures/new-recruit-export.json',import.meta.url)));
const tau=fixtures.factions.find(row=>row.bookId==='tau-empire');
const cases=[{id:'tau-catalogue',bookId:tau.bookId,text:tau.text.replace(/^\+ FACTION KEYWORD:[^\r\n]*/m,"+ FACTION KEYWORD: Xenos - T'au Empire")},
  ...[true,false].map(equipped=>({id:'captain-'+(equipped?'shield':'bare'),bookId:'space-marines',
    text:equipped?fixtures.realCompactCaptain.text:fixtures.realCompactCaptain.text.replace(', Relic shield',''),wounds:equipped?'6':'5'}))];
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
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
let browser,completed=false;
try{
  browser=await launchChromium();
  for(const [device,viewport]of [['desktop',{width:1440,height:1000}],['mobile',{width:390,height:844}]]){
    const context=await browser.newContext({viewport,serviceWorkers:'block'}),page=await context.newPage();
    context.setDefaultTimeout(20000);page.on('pageerror',error=>errors.push(error.message));
    try{
      for(const c of cases){
        await page.goto('http://127.0.0.1:'+server.address().port+'/v2/app.html');
        await page.locator('[data-v2-book="'+c.bookId+'"]').click();
        await page.waitForFunction(()=>window.ArmyBookAppV2?.roster);
        await page.locator('[data-v2-primary-nav] [data-v2-destination="ROSTER"]').click();
        await page.getByRole('textbox',{name:'New Recruit text export',exact:true}).fill(c.text);
        await page.locator('[data-roster-action="review-import"]').click();
        const replace=page.locator('[data-roster-action="confirm-replace-roster"]');
        // Replacing an existing roster is an explicit player action.
        await page.waitForFunction(()=>!document.querySelector('.v2-roster[aria-busy="true"]'));
        if(await replace.isVisible())await replace.click();
        await page.waitForFunction(()=>document.querySelector('.v2-roster-status')?.textContent.startsWith('Roster imported.'));
        const state=await page.evaluate(()=>window.ArmyBookAppV2.roster.snapshot());
        assert.ok(state.units.length,'A real roster must be installed');
        if(c.wounds){
          const id=state.units[0].instanceId;
          await page.locator('[data-roster-instance-id="'+id+'"]').getByRole('button',{name:'Effective datasheet',exact:true}).click();
          const card=page.locator('main .unit-card[data-roster-instance-id="'+id+'"]');await card.waitFor();
          const stats=await card.locator('.statline').evaluateAll(nodes=>nodes.map(node=>node.innerText));
          const rendered=await card.locator('.statline [data-fact-id]').evaluateAll(nodes=>nodes.map(node=>({id:node.dataset.factId,text:node.textContent})));
          assert.ok(rendered.some(row=>/::\/(?:stats\/)?W$/.test(row.id)&&row.text===c.wounds),'The actual statline displays W '+c.wounds+': '+JSON.stringify({stats,rendered}));
          const view=await page.evaluate(id=>window.ArmyBookAppV2.roster.effective(id),id);
          assert.equal(view.profiles[0].fields.find(field=>field.label==='stats').value.W,c.wounds);
        }
        await page.screenshot({path:path.join(out,device+'-'+c.id+'.png')});
        results.push({device,...c,status:'PASS'});console.log('PASS '+device+' '+c.id);
      }
    }catch(error){await page.screenshot({path:path.join(out,device+'-failure.png')}).catch(()=>{});throw error;}
    finally{await context.close();}
  }
  assert.deepEqual(errors,[]);assert.deepEqual(missing,[]);completed=true;
}finally{
  fs.writeFileSync(path.join(out,'RESULTS.json'),JSON.stringify({status:completed?'PASS':'FAIL',results,errors,missing},null,2)+'\n');
  if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));
}

/** Owner-authored text expectations through import/attach/detach controls. */
import fs from 'node:fs';import path from 'node:path';import http from 'node:http';import assert from 'node:assert/strict';import {fileURLToPath} from 'node:url';
import {createQaEvidenceDir} from '../tests/helpers/qa-temp.mjs';
import {launchChromium} from '../tests/helpers/browser-launch.mjs';
import {isApplicationTestDependency} from '../books/shared/application-v2/browser-test-dependencies.mjs';
import {parseProducerJSON} from '../books/shared/source-refs-v2/producer-io.mjs';
const root=fileURLToPath(new URL('../',import.meta.url)),out=createQaEvidenceDir('wh-related-panel-browser-');
const cases=[
 {book:'tyranids',unit:'unit-genestealers',rule:'detachment-subterranean-assault:stratagem:1',expected:false,noEnhancements:true},
 {book:'tyranids',unit:'unit-trygon',rule:'detachment-subterranean-assault:stratagem:1',expected:true},
 {book:'space-marines',unit:'unit-sm-59162946fee84360',rule:'stratagem-sm-613cddaa26084fb2',expected:false},
 {book:'space-marines',unit:'unit-sm-bc409233f3fe4dc1',rule:'stratagem-sm-613cddaa26084fb2',expected:true},
 {book:'tau-empire',unit:'unit-strike-team',rule:'detachment-retaliation-cadre:stratagem:2',expected:false},
 {book:'tau-empire',unit:'unit-crisis-sunforge-battlesuits',rule:'detachment-retaliation-cadre:stratagem:2',expected:true}
];
const allowed=new Set(JSON.parse(fs.readFileSync(path.join(root,'tools/pages-runtime-manifest.json'))).files.map(row=>'/'+row.path));
const mime={'.html':'text/html','.mjs':'text/javascript','.js':'text/javascript','.json':'application/json','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg'};
const errors=[],missing=[],results=[];
const server=http.createServer((request,response)=>{
 const address=decodeURIComponent(new URL(request.url,'http://local').pathname),file=path.resolve(root,'.'+address);
 if(address==='/favicon.ico'){response.writeHead(204).end();return;}
 if(!file.startsWith(path.resolve(root)+path.sep)||!allowed.has(address)&&!isApplicationTestDependency(address)||!fs.existsSync(file)){missing.push(address);response.writeHead(404).end();return;}
 response.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'}).end(fs.readFileSync(file));
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const origin='http://127.0.0.1:'+server.address().port;
let browser,completed=false;
try{
 browser=await launchChromium();
 for(const [device,viewport]of [['desktop',{width:1440,height:1000}],['mobile',{width:390,height:844}]])for(const c of cases){
  const context=await browser.newContext({viewport,serviceWorkers:'block'}),page=await context.newPage();context.setDefaultTimeout(25000);page.on('pageerror',e=>errors.push(e.message));
  try{
   console.log('RUN '+device+' '+c.book+' '+c.unit);
   await page.goto(origin+'/v2/app.html');await page.locator('[data-v2-book="'+c.book+'"]').click();await page.waitForFunction(()=>Boolean(window.ArmyBookAppV2));
   await page.locator('main a[data-target-id="'+c.unit+'"]').first().click();
   await page.getByRole('button',{name:'Compatible Stratagems & Enhancements',exact:true}).click();
   const dialog=page.locator('dialog.v2-related-dialog[open]');await dialog.waitFor();
   const row=dialog.locator('[data-rule-id="'+c.rule+'"]');assert.equal(await row.count(),c.expected?1:0);
   if(c.expected){assert.equal(await row.isVisible(),true);assert.equal(await row.getAttribute('data-applicability'),'CONDITIONAL');
    assert((await row.innerText()).includes('TARGET'));assert((await row.innerText()).includes('EFFECT'));}
   await page.screenshot({path:path.join(out,device+'-'+c.book+'-'+c.unit+'-stratagems.png')});
   await dialog.getByRole('button',{name:'Enhancements',exact:true}).click();
   if(c.noEnhancements)assert.equal(await dialog.locator('[data-related-kind="enhancements"] .v2-compatible-item').count(),0);
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);
   await page.screenshot({path:path.join(out,device+'-'+c.book+'-'+c.unit+'.png')});
   results.push({...c,device,status:'PASS'});console.log('PASS '+device+' '+c.unit);
  }catch(e){await page.screenshot({path:path.join(out,device+'-'+c.book+'-failure.png')}).catch(()=>{});throw e;}finally{await context.close();}
 }
 assert.deepEqual(errors,[]);assert.deepEqual(missing,[]);completed=true;
}finally{fs.writeFileSync(path.join(out,'RESULTS.json'),JSON.stringify({status:completed?'PASS':'FAIL',results,errors,missing},null,2)+'\n');if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
console.log(JSON.stringify({status:'PASS',scenarios:cases.length,devices:2,checks:results.length,evidence:out}));

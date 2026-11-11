import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createServer} from 'node:http';
import {launchChromium} from '../../../tests/helpers/browser-launch.mjs';
import {createQaEvidenceDir} from '../../../tests/helpers/qa-temp.mjs';

const root=fileURLToPath(new URL('../../../',import.meta.url));
const evidence=createQaEvidenceDir('core-switch-browser-');
const types={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp'};
const errors=[],rows=[];
const server=createServer((request,response)=>{
 try{
  const url=new URL(request.url,'http://local');
  if(url.pathname==='/favicon.ico'){response.writeHead(204).end();return;}
  let file=path.resolve(root,'.'+decodeURIComponent(url.pathname));
  assert(file.startsWith(path.resolve(root)+path.sep));
  if(fs.statSync(file).isDirectory())file=path.join(file,'index.html');
  response.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');
  fs.createReadStream(file).pipe(response);
 }catch{response.writeHead(404).end();}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const origin=`http://127.0.0.1:${server.address().port}`,browser=await launchChromium();
let passed=false;
try{
 for(const width of [1440,390]){
  const context=await browser.newContext({viewport:{width,height:width===390?844:1000},serviceWorkers:'block'});
  const page=await context.newPage();
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto(origin+'/books/core-rules/reader/muster-armies.html');
  const parent=page.locator('[data-rule-id="core-rule-25-04-fill-your-army-roster"]');
  assert.equal(await parent.count(),1,'The existing25.04 parent must retain its identity');
  const children=[['01','Select Detachments','Select-Detachments'],['02','Select Units','Select-Units'],['03','Attach Leaders and Support Units','Attach-Leaders-and-Support-Units'],['04','Select Enhancements','Select-Enhancements']];
  for(const [suffix,title,anchor]of children){
   const child=parent.locator(`[data-rule-code="25.04.${suffix}"]`);
   assert.equal(await child.count(),1,'Missing restored child '+title);
   await child.locator('summary').click();
   assert.equal(await child.locator('summary').innerText(),title);
   assert.match(await child.locator('.source-label').innerText(),/25\.04/);
   assert.equal(new URL(await child.locator('.source-label a').getAttribute('href')).hash,'#'+anchor);
   assert(!/25\.04\.0[1-4]/.test(await child.innerText()),'Internal locators must not be player-visible');
  }
  assert.match(await parent.innerText(),/EPIC HEROES models cannot be given enhancements\./);
  await page.screenshot({path:path.join(evidence,`${width}-25-04.png`),fullPage:true});
  // The inherited parent lookup and a newly restored child each resolve to
  // their own article; the child must not replace the25.04 parent in search.
  await page.locator('#searchButton').click();
  await page.locator('#searchInput').fill('Select Enhancements');
  await page.waitForFunction(()=>document.querySelector('#searchResults')?.textContent.includes('Select Enhancements'));
  const links=await page.locator('#searchResults a').evaluateAll(nodes=>nodes.map(node=>({text:node.textContent,href:node.href})));
  assert(links.some(link=>link.text.includes('Select Enhancements')&&link.href.includes('core-rule-25-04-04-select-enhancements')),'Search must resolve the restored child');
  await page.locator('[aria-label="Close search"]').click();
  const popup=page.locator('[data-term="core-rule-25-04-01-select-detachments"]').first();
  assert.equal(await popup.count(),1,'The existing parent text must link to the restored Select Detachments term');
  await popup.click();
  await page.locator('#termDialog[open]').waitFor();
  assert.equal(await page.locator('#termTitle').innerText(),'Select Detachments');
  assert((await page.locator('#termSummary').innerText()).length>100,'The restored popup must contain its full definition');
  await page.locator('#termClose').click();
  await page.goto(origin+'/books/core-rules/reader/index.html#core-faq-waha-073');
  const faq=page.locator('#core-faq-waha-073');
  assert.equal(await faq.count(),1,'New FAQ073 must have its stable explicit ID');
  if(await faq.evaluate(node=>node.tagName==='DETAILS'&&!node.open))await faq.locator('summary').click();
  assert.match(await faq.innerText(),/Firing Deck/);
  assert.match(await faq.innerText(),/weapons/);
  await faq.scrollIntoViewIfNeeded();
  await faq.evaluate(node=>window.scrollTo({top:node.getBoundingClientRect().top+window.scrollY-90,behavior:'instant'}));
  await page.screenshot({path:path.join(evidence,`${width}-faq-073.png`),fullPage:false});
  for(const [chapter,expectedId]of [['transports.html','core-rule-18-07-shock-disembark-move--core-faq-waha-050'],['index.html','core-faq-waha-050']]){
   await page.goto(origin+'/books/core-rules/reader/'+chapter+'#'+expectedId);
   const faq050=page.locator('[data-faq-id="core-faq-waha-050"]');
   assert.equal(await faq050.count(),1,'FAQ050 must have exactly one panel per canonical destination');
   assert.equal(await faq050.getAttribute('id'),expectedId,'FAQ050 must retain its correct owner');
   for(const id of ['core-rule-18-04-disembark-move','core-rule-18-05-emergency-disembark-move','core-rule-18-07-shock-disembark-move'])
    assert.equal(await faq050.locator(`[data-term="${id}"]`).count(),1,'FAQ050 must retain each of its three buttons');
   assert.equal(await page.locator('[id="core-rule-18-03-disembarking--core-faq-waha-050"]').count(),0,'The old duplicate must not survive');
  }
  rows.push({width,status:'PASS',children:4,search:'PASS',popup:'PASS',faq:'core-faq-waha-073',parentIdentity:'preserved',internalNumbering:'not visible'});
  await context.close();
 }
 assert.deepEqual(errors,[],'Core pages must not raise browser errors');passed=true;
 console.log(JSON.stringify({status:'PASS',rows,evidence}));
}finally{
 fs.writeFileSync(path.join(evidence,'RESULTS.json'),JSON.stringify({status:passed?'PASS':'FAIL',rows,errors},null,2)+'\n');
 await browser.close();await new Promise(resolve=>server.close(resolve));
}

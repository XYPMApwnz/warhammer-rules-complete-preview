import {createQaEvidenceDir} from '../../../tests/helpers/qa-temp.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {createServer} from 'node:http';
import {fileURLToPath} from 'node:url';
import {launchChromium} from '../../../tests/helpers/browser-launch.mjs';
import {createCoreFactProjection} from '../content/core-fact-projection.mjs';
import {createReaderPresentation} from '../reader/presentation.mjs';

const repo=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../..');
const readerRoot=path.join(repo,'books/core-rules/reader');
const projection=createCoreFactProjection(),catalog=projection.catalog;
const bindings=JSON.parse(fs.readFileSync(path.join(readerRoot,'presentation-bindings.json'),'utf8'));
const presentation=createReaderPresentation(catalog,bindings);
const tableRules=catalog.mainRules.filter(record=>record.content?.some(block=>['matrix','comparison-table'].includes(block.type)));
const html=fs.readdirSync(readerRoot).filter(file=>file.endsWith('.html')).map(file=>({file,text:fs.readFileSync(path.join(readerRoot,file),'utf8')}));
const output=createQaEvidenceDir('core-reader-presentation-');
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.webp':'image/webp','.png':'image/png','.svg':'image/svg+xml'};
const server=createServer((request,response)=>{try{
  const file=path.resolve(repo,'.'+decodeURIComponent(new URL(request.url,'http://local').pathname));
  assert(file.startsWith(repo+path.sep));
  if(!fs.existsSync(file)){response.writeHead(404).end();return;}
  response.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');fs.createReadStream(file).pipe(response);
}catch{response.writeHead(404).end();}});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const browser=await launchChromium(),origin=`http://127.0.0.1:${server.address().port}`,screenshots=[];
let tableChecks=0,popupChecks=0;
const normalized=value=>value.replace(/\s+/g,' ').trim();
try{
  for(const width of [390,800,1440]){
    const context=await browser.newContext({viewport:{width,height:width===390?844:900},serviceWorkers:'block'}),page=await context.newPage(),errors=[];
    page.on('pageerror',error=>errors.push(error.message));
    try{
      for(const rule of tableRules){
        await page.goto(`${origin}/${rule.fullRulePath}`,{waitUntil:'domcontentloaded'});
        await page.locator('details.subrule').evaluateAll(nodes=>nodes.forEach(node=>node.open=true));
        const card=page.locator(`[data-rule-id="${rule.id}"]`);
        const wrappers=card.locator('.table-scroll').filter({has:page.locator('table')});
        assert.equal(await wrappers.count(),rule.content.filter(block=>['matrix','comparison-table'].includes(block.type)).length,'table content disappeared');
        assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${width}/${rule.code}: page-wide overflow with expanded table`);
        for(const wrapper of await wrappers.all()){
          const metrics=await wrapper.evaluate(node=>{const box=node.getBoundingClientRect();return {left:box.left,right:box.right,width:node.clientWidth,scroll:node.scrollWidth,font:parseFloat(getComputedStyle(node.querySelector('table')).fontSize)};});
          assert(metrics.left>=0&&metrics.right<=width+1,`${width}/${rule.code}: table wrapper escapes viewport`);
          assert(metrics.font>=12,'table text shrunk to hide overflow');
          if(metrics.scroll>metrics.width){
            await wrapper.evaluate(node=>node.scrollLeft=node.scrollWidth);
            assert(await wrapper.evaluate(node=>node.scrollLeft>0),'wide table cannot scroll internally');
            assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'table scrolling changes page width');
            await wrapper.evaluate(node=>node.scrollLeft=0);
          }
          tableChecks++;
        }
        if(rule.code==='01.02.01'){
          await card.scrollIntoViewIfNeeded();const file=path.join(output,`${width}-starting-strength.png`);await page.screenshot({path:file});screenshots.push(file);
        }
      }
      for(const binding of [...bindings.appliedErrataPanels,...bindings.visualMarkers]){
        const rule=catalog.getById(binding.ownerId);
        await page.goto(`${origin}/${rule.fullRulePath}`,{waitUntil:'domcontentloaded'});
        const card=page.locator(`[data-rule-id="${rule.id}"]`);
        const view=presentation.recordView(rule);
        if(binding.erratumId){
          const text=await card.innerText();assert(!/\bErrata\b|\bShow\b|Change to:|Add the following/.test(text),'applied source-edit instructions visible');
          assert(normalized(text).includes(normalized(view.text.split('\n')[0])),'effective rule sentence removed');
          assert(catalog.getById(binding.erratumId).semanticContent,'canonical erratum removed');
        }else{
          const icon=card.locator('img.rule-marker');assert.equal(await icon.count(),1);
          await icon.evaluate(node=>node.decode());assert(await icon.evaluate(node=>node.naturalWidth>0),'bound icon did not load');
          assert((await card.innerText()).includes('marked with this icon'),'source text was removed');
        }
        const source=html.find(item=>item.text.includes(`data-term="${rule.id}"`));assert(source,'no actual canonical popup trigger');
        await page.goto(`${origin}/books/core-rules/reader/${source.file}`,{waitUntil:'domcontentloaded'});
        const trigger=page.locator(`[data-term="${rule.id}"]`).first();
        await trigger.evaluate(node=>{for(let parent=node.parentElement;parent;parent=parent.parentElement)if(parent.tagName==='DETAILS')parent.open=true;});
        await trigger.click();await page.locator('#termDialog[open]').waitFor();
        let expected=rule.semanticContent;
        for(const omission of presentation.popupData[rule.id].omissions)expected=expected.slice(0,omission.range[0])+expected.slice(omission.range[1]);
        assert.equal(normalized(await page.locator('#termSummary').innerText()),normalized(expected),'popup bypassed canonical/presentation contract');
        if(!binding.erratumId){
          const icon=page.locator('#termSummary img.rule-marker');assert.equal(await icon.count(),1);assert.equal(await icon.getAttribute('alt'),binding.alt);
          await icon.evaluate(node=>node.decode());assert(await icon.evaluate(node=>node.naturalWidth>0),'popup icon did not load');
          const file=path.join(output,`${width}-${rule.code}-popup.png`);await page.screenshot({path:file});screenshots.push(file);
        }
        await page.keyboard.press('Escape');assert.equal(await page.locator('#termDialog[open]').count(),0);
        assert(await trigger.evaluate(node=>node===document.activeElement),'popup focus not restored');
        popupChecks++;
      }
      assert.deepEqual(errors,[],`${width}: reader browser errors`);
    }finally{await context.close();}
  }
  console.log(JSON.stringify({status:'PASS',widths:[390,800,1440],tableRules:tableRules.length,tableChecks,popupChecks,pageOverflow:0,screenshots}));
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}

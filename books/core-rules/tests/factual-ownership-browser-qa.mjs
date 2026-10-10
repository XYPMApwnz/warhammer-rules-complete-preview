import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {createServer} from 'node:http';
import {fileURLToPath} from 'node:url';
import {launchChromium} from '../../../tests/helpers/browser-launch.mjs';
import {createEffectiveCoreCatalog} from '../content/effective-core-catalog.mjs';

const repoRoot=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../..');
const readerRoot=path.join(repoRoot,'books/core-rules/reader');
const catalog=createEffectiveCoreCatalog();
const screenshots=fs.mkdtempSync(path.join(os.tmpdir(),'core-factual-ownership-browser-'));
const types={'.html':'text/html','.css':'text/css','.js':'text/javascript','.json':'application/json','.svg':'image/svg+xml','.jpg':'image/jpeg','.webp':'image/webp'};
const server=createServer((request,response)=>{try{
  const url=new URL(request.url,'http://localhost');
  if(url.pathname==='/favicon.ico'){response.writeHead(204).end();return;}
  let file=path.resolve(repoRoot,'.'+decodeURIComponent(url.pathname));
  assert(file.startsWith(repoRoot+path.sep));
  if(fs.statSync(file).isDirectory())file=path.join(file,'index.html');
  response.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');
  fs.createReadStream(file).pipe(response);
}catch{response.writeHead(404).end('Not found');}});
await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});
const origin=`http://127.0.0.1:${server.address().port}`;
const browser=await launchChromium();
const screenshotPaths=[];
try{
  for(const [name,viewport] of [['desktop',{width:1440,height:900}],['phone',{width:390,height:844}]]){
    const context=await browser.newContext({viewport,serviceWorkers:'block'});
    const page=await context.newPage(),errors=[];
    page.on('pageerror',error=>errors.push(error.message));
    try{
      for(const file of fs.readdirSync(readerRoot).filter(file=>file.endsWith('.html'))){
        await page.goto(`${origin}/books/core-rules/reader/${file}`,{waitUntil:'domcontentloaded'});
        assert(await page.locator('main').isVisible(),`${name}/${file}: reader main missing`);
        const duplicateIds=await page.locator('[id]').evaluateAll(nodes=>{const seen=new Set();return nodes.map(node=>node.id).filter(id=>seen.has(id)||!seen.add(id));});
        assert.deepEqual(duplicateIds,[],`${name}/${file}: duplicate IDs make fragment resolution ambiguous`);
        if(name==='phone')assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${file}: page-wide horizontal overflow`);
      }
      await page.goto(`${origin}/books/core-rules/reader/index.html#faq`,{waitUntil:'domcontentloaded'});
      assert.equal(await page.locator('#faq [data-faq-source]').count(),71,'FAQ provenance occurrences dropped or duplicated');
      assert.equal(await page.locator('#faq [data-faq-source]').filter({hasText:'Accepted Wahapedia FAQ'}).count(),66,'secondary FAQ label partition wrong');
      assert.equal(await page.locator('#faq [data-faq-source]').filter({hasText:'Official FAQ'}).count(),5,'official FAQ label partition wrong');
      for(const record of catalog.faqs)assert.equal(await page.locator(`[id="${record.id}"]`).count(),1,`${record.id}: canonical FAQ anchor not unique`);
      const faqPayloads=await page.locator('#faq aside[data-faq-id]').evaluateAll(nodes=>nodes.map(node=>`${node.querySelector('h4').textContent}|${node.querySelector('p').textContent}`));
      const key=value=>value.normalize('NFKC').replace(/[‘’]/g,"'").replace(/[“”]/g,'"').replace(/\s+/g,'').toLowerCase();
      assert.equal(new Set(faqPayloads.map(key)).size,faqPayloads.length,'FAQ catalog repeats a Q/A payload');
      const faqPath=path.join(screenshots,`${name}-faq.png`);await page.screenshot({path:faqPath});screenshotPaths.push(faqPath);
      for(const faq of catalog.faqs.filter(record=>record.provenance.sourceClass==='GW_CORE_FAQ')){
        const owner=catalog.getById(faq.relationships.primaryRuleId);
        const chapter=owner.fullRulePath.split('#')[0];
        await page.goto(`${origin}/${chapter}#${faq.id}`,{waitUntil:'domcontentloaded'});
        const anchor=page.locator(`[id="${faq.id}"]`);
        assert.equal(await anchor.count(),1,`${name}/${faq.id}: old chapter URL must resolve uniquely`);
        const payload=await anchor.evaluate(node=>{const panel=node.closest('aside[data-faq-id]');return panel?{question:panel.querySelector('h4').textContent,answer:panel.querySelector('p').textContent}:null;});
        assert(payload,`${faq.id}: compatibility anchor is detached from its canonical FAQ panel`);
        assert.equal(key(payload.question),key(faq.question),`${faq.id}: old chapter URL opens a different question`);
        assert.equal(key(payload.answer),key(faq.answer),`${faq.id}: old chapter URL opens a different answer`);
      }
      for(const rule of [...['05.01','05.04','12.08','18.05','01.02.06','25.03'].map(code=>catalog.getByCode(code)),...['Desperate-Escape-Test','Desperate-Escape'].map(anchor=>catalog.getByAnchor(anchor))]){
        const code=rule.code,url=rule.fullRulePath.replace('books/core-rules/reader/','');
        await page.goto(`${origin}/books/core-rules/reader/${url}`,{waitUntil:'domcontentloaded'});
        await page.locator('details.subrule').evaluateAll(nodes=>nodes.forEach(node=>node.open=true));
        const card=page.locator(`[data-rule-id="${rule.id}"]`),text=await card.innerText();
        assert(await card.isVisible(),`${name}/${code}: card not visible`);
        for(const fact of (rule.provenance.factSources||[]).filter(fact=>fact.source.artifact)){
          const normalized=value=>value.replace(/\s+/g,' ').trim();
          assert(normalized(text).includes(normalized(fact.source.transcription)),`${name}/${code}: page-image numeric outcome missing from rendered canonical fact`);
        }
        const headerCollisions=await card.locator(':scope > .rule-head').evaluateAll(headers=>headers.flatMap(header=>{
          const title=header.querySelector('h3'),source=header.querySelector('.page');
          if(!title||!source)return [];
          const textRects=node=>{const range=document.createRange();range.selectNodeContents(node);return [...range.getClientRects()].filter(rect=>rect.width&&rect.height);};
          return textRects(title).flatMap(a=>textRects(source).filter(b=>Math.min(a.right,b.right)-Math.max(a.left,b.left)>1&&Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top)>1).map(()=>title.textContent));
        }));
        assert.deepEqual(headerCollisions,[],`${name}/${code}: title and source label overlap`);
        if(rule.provenance.effectiveSourceBindings?.length)assert(text.toLowerCase().includes('accepted secondary update'),'effective accepted secondary update mislabeled as original official PDF');
        if(code==='12.08'){
          assert(text.includes('must be unengaged and within range'),'Objective prerequisite not visible');
          assert.equal((text.match(/when each is selected, it becomes eligible to fight and is selected to fight/g)||[]).length,2,'Ongoing and Engaging must each preserve their own current condition');
        }
        if(code==='18.05')assert(text.includes('If the above is not possible while remaining unengaged')&&text.includes('Each model that still cannot be set up is destroyed.'),'Emergency fallback not visible');
        if(code==='01.02.06')assert.equal((text.match(/A unit must be split into two units, each containing as equal a number of models as possible/g)||[]).length,1,'Splitting applied clause duplicated');
        if(code==='09.07.01'){
          assert(!text.toLowerCase().includes('source conflict'),'resolved source-node identity still exposes conflict UI');
          assert(!text.includes('Selecting Modes'),'sibling callout leaked into Desperate Escape owner');
          if(rule.sourceNode.anchor==='Desperate-Escape-Test')assert(text.includes('Some rules may reference the term'),'definition missing');
          else assert(text.includes('Must make one hazard roll for each model')&&text.includes('Must make a battle-shock roll'),'forced-test rule missing');
          assert.equal(await page.locator('[data-rule-code="09.07.01"]').count(),2,'both distinct source nodes must render');
        }
        if(code==='25.03'){
          assert.equal(await card.locator('table').count(),1,'Battle Size must render exactly one canonical structured table');
          for(const value of ['Incursion','Strike Force','1000','2000'])assert((await card.locator('table').innerText()).toLowerCase().includes(value.toLowerCase()),`Battle Size lost ${value}`);
          const outside=await card.evaluate(node=>{const clone=node.cloneNode(true);clone.querySelectorAll('table').forEach(table=>table.remove());return clone.textContent;});
          assert(!/\b(?:1000|2000)\b/.test(outside),'Battle Size values duplicated outside canonical table');
        }
        await card.scrollIntoViewIfNeeded();
        const screenshot=path.join(screenshots,`${name}-${rule.id}.png`);await page.screenshot({path:screenshot});screenshotPaths.push(screenshot);
      }
      assert.deepEqual(errors,[],`${name}: uncaught reader errors`);
    }finally{await context.close();}
  }
  console.log(JSON.stringify({status:'PASS',desktop:'1440x900',phone:'390x844',routes:27,faqCanonicalAnchors:71,legacyOfficialFaqRoutes:5,secondaryLabels:66,officialLabels:5,screenshots:screenshotPaths}));
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}

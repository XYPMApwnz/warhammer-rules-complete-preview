import {createQaEvidenceDir} from '../tests/helpers/qa-temp.mjs';
/** O-1: independent accepted-source text checks through normal player controls.
 * These are constructed New Recruit-compatible inputs, not real user exports.
 * Browser evaluation only reads state/DOM; it never injects roster or UI state. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {launchChromium} from '../tests/helpers/browser-launch.mjs';
import {isApplicationTestDependency} from '../books/shared/application-v2/browser-test-dependencies.mjs';

const option=name=>process.argv.find(arg=>arg.startsWith(name+'='))?.slice(name.length+1);
const repo=path.resolve(option('--root')||fileURLToPath(new URL('../',import.meta.url)));
const out=path.resolve(option('--out')||createQaEvidenceDir('wh-dg-am-enrollment-browser-'));
assert.ok(out!==repo&&!out.startsWith(repo+path.sep),'Keep browser evidence outside the repository');
fs.mkdirSync(out,{recursive:true});
const norm=value=>String(value).replace(/\s+/g,' ').replace(/[‘’]/g,"'").trim();
const fixtures=['death-guard','adeptus-mechanicus'].flatMap(book=>{const file=path.join(repo,'books',book,'v2/recipient-enrollment-qa.json');return fs.existsSync(file)?[JSON.parse(fs.readFileSync(file,'utf8'))]:[];});
const cases=fixtures.flatMap(fixture=>fixture.browserCases);
const runtimePaths=new Set(JSON.parse(fs.readFileSync(path.join(repo,'tools/pages-runtime-manifest.json'),'utf8')).files.map(row=>'/'+row.path));
const allowed=address=>!/(?:\/sources\/|-qa\.|-fixtures\.)/.test(address)&&(
  runtimePaths.has(address)||isApplicationTestDependency(address)||
  /^\/books\/(?:adeptus-mechanicus|death-guard)\/v2\/[\w./-]+\.(?:mjs|js|json|css)$/.test(address)||
  /^\/books\/(?:adeptus-mechanicus|death-guard)\/assets\/[\w./-]+\.(?:png|webp|jpe?g|svg)$/.test(address)||
  /^\/books\/shared\/(?:application-v2|army-book-app-v2|roster-v2|rule-contract-v2|source-refs-v2)\/[\w./-]+\.(?:mjs|js|json|css)$/.test(address));
const mime={'.html':'text/html','.mjs':'text/javascript','.js':'text/javascript','.json':'application/json',
  '.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg','.jpeg':'image/jpeg'};
const results=[],errors=[],missing=[],screenshots=[];
const server=http.createServer((request,response)=>{
  const requested=decodeURIComponent(new URL(request.url,'http://localhost').pathname),address=requested==='/'?'/index.html':requested;
  if(address==='/favicon.ico'){response.writeHead(204);response.end();return;}
  const file=path.resolve(repo,'.'+address);
  if(!allowed(address)||!file.startsWith(repo+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){
    missing.push(address);response.writeHead(404);response.end();return;
  }
  response.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});
  response.end(fs.readFileSync(file));
});
const ready=page=>page.waitForFunction(()=>window.ArmyBookAppV2?.roster);
async function roster(page){
  await page.locator('[data-v2-primary-nav] [data-v2-destination="ROSTER"]').click();
  await page.getByRole('textbox',{name:'New Recruit text export',exact:true}).waitFor();
}
async function imported(page,text){
  await roster(page);await page.getByRole('textbox',{name:'New Recruit text export',exact:true}).fill(text);
  await page.locator('[data-roster-action="review-import"]').click();
  await page.waitForFunction(()=>!document.querySelector('.v2-roster[aria-busy="true"]'));
  assert.match(await page.locator('.v2-roster-status').innerText(),/^Roster imported\./);
  const units=await page.evaluate(()=>window.ArmyBookAppV2.roster.state.units);
  assert.equal(units.length,3,'Constructed roster has a leader, bodyguard and independent duplicate');
}
async function attach(page){
  await roster(page);
  await page.locator('[data-attachment-candidate-for="parsed-unit-2"]').selectOption('parsed-unit-1');
  await page.locator('[data-attachment-target-instance-id="parsed-unit-2"] [data-roster-action="attach"]').click();
  await page.locator('[data-attached-leader-instance-id="parsed-unit-1"]').waitFor();
}
async function detach(page){
  await roster(page);await page.locator('[data-roster-action="detach"][data-leader-instance-id="parsed-unit-1"]').click();
  await page.locator('[data-attached-leader-instance-id="parsed-unit-1"]').waitFor({state:'hidden'});
}
async function view(page,id,mode){
  await roster(page);
  if(mode==='Effective')await page.locator('[data-roster-instance-id="'+id+'"]').getByRole('button',{name:'Effective datasheet',exact:true}).click();
  else{
    await page.getByRole('button',{name:'Open personal guide',exact:true}).click();
    await page.locator('main a[data-target-id="roster-unit/'+id+'"]').click();
  }
  await page.locator('main .unit-card[data-roster-instance-id="'+id+'"]').waitFor();
}
async function inspect(page,c,device,mode,id,stage,wanted){
  await view(page,id,mode);
  const card=page.locator('main .unit-card[data-roster-instance-id="'+id+'"]');
  const rows=await card.locator('article[data-attached-rule-id]').evaluateAll(nodes=>nodes.map(node=>({
    ruleId:node.dataset.attachedRuleId,sourceInstanceId:node.dataset.sourceInstanceId,sourcePath:JSON.parse(node.dataset.sourceFieldPath),
    title:node.querySelector('h5')?.textContent||'',text:node.querySelector('[data-attached-rule-text]')?.textContent||'',
    visible:!!node.getClientRects().length,content:node.innerText})));
  const found=rows.filter(row=>norm(row.title)===norm(c.rule));
  assert.equal(found.length,wanted?1:0,`${c.rule}: ${stage} ${mode} on ${id}`);
  if(wanted){
    const row=found[0];assert.equal(row.sourceInstanceId,c.ownerInstance,'Exact physical source');
    assert.ok(row.visible,'Rule is actually rendered');
    const body=c.quote?.startsWith(c.rule+':')?c.quote.slice(c.rule.length+1).trim():c.quote;
    assert.equal(row.ruleId,c.canonical.ruleId,'Exact canonical rule identity');assert.deepEqual(row.sourcePath,c.canonical.sourcePath,'Exact source block');
    const prefix=row.title+':';
    const expectedBody=c.canonical.text.startsWith(prefix)?c.canonical.text.slice(prefix.length):c.canonical.text;
    assert.equal(row.text,expectedBody,'Original source body is byte-for-byte identical after removing only its repeated heading');
    assert.ok(!row.text.startsWith(prefix),'Rule heading is not repeated in the body');
    if(c.quote)assert.ok(norm(row.text).includes(norm(body)),'Full independent accepted source text, including conditions');
    assert.ok(norm(row.content).toLowerCase().includes(norm(c.owner).toLowerCase()),'Visible source owner');
    assert.doesNotMatch(row.content,/Conditional rule|Not automatically|source-clause-|recipient\//i,'No technical labels on O-1 text');
    const rowNode=card.locator('article[data-attached-rule-id]').filter({has:page.locator('h5',{hasText:c.rule})}).first();
    await rowNode.scrollIntoViewIfNeeded();assert.ok(await rowNode.isVisible());
    if(stage==='attached'){
      const filename=`${device}-${String(cases.indexOf(c)+1).padStart(2,'0')}-${mode.toLowerCase()}.png`;
      await page.screenshot({path:path.join(out,filename)});screenshots.push(filename);
    }
  }
  for(const title of c.negative)assert.ok(!rows.some(row=>norm(row.title)===norm(title)),title+' must not transfer');
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,'No horizontal overflow');
  results.push({book:c.book,rule:c.rule,source:c.owner,target:id===c.target?(c.reverse?c.leader:c.bodyguard):'Independent duplicate',
    device,mode,stage,wanted,status:'PASS',observed:found});
}
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const origin='http://127.0.0.1:'+server.address().port;
const snapshots=[];
let browser,completed=false;
try{
  browser=await launchChromium();
  const selected=cases.filter(c=>(!option('--case')||option('--case').split('|').some(filter=>norm(c.rule).toLowerCase().includes(norm(filter).toLowerCase())))&&
    (!option('--books')||option('--books').split(',').includes(c.book)));
  assert.ok(selected.length,'Case filter must select at least one case');
  console.log('DG/AM enrollment browser evidence: '+out);
  for(const [device,viewport]of [['desktop',{width:1440,height:900}],['mobile',{width:390,height:844}]]){
    if(option('--device')&&option('--device')!==device)continue;
    for(const c of process.argv.includes('--source-only')?[]:selected){
      // This presentation-only suite reads current working-tree bytes. PWA
      // installation/hash certification belongs to the separate pre-ff queue.
      const context=await browser.newContext({viewport,serviceWorkers:'block'}),page=await context.newPage();
      page.on('pageerror',error=>errors.push({rule:c.rule,device,error:error.message}));
      try{
        await page.goto(origin+'/v2/app.html');await page.locator('[data-v2-book="'+c.book+'"]').click();await ready(page);
        await imported(page,c.text);if(!c.skipAttach)await attach(page);
        snapshots.push({id:c.id,book:c.book,device,state:await page.evaluate(()=>window.ArmyBookAppV2.roster.state)});
        await view(page,c.ownerInstance,'Guide');
        const ownerText=await page.locator('main .unit-card[data-roster-instance-id="'+c.ownerInstance+'"]').innerText();
        const original=c.canonical.text.startsWith(c.rule+':')?c.canonical.text.slice(c.rule.length+1):c.canonical.text;
        assert.ok(norm(ownerText).includes(norm(original)),'Original source text remains on owner card');
        const before=await page.evaluate(()=>JSON.stringify(window.ArmyBookAppV2.roster.projection));
        for(const mode of ['Effective','Guide']){
          await inspect(page,c,device,mode,c.target,'attached',c.expectedAttached);
          await inspect(page,c,device,mode,'parsed-unit-3','independent-control',false);
        }
        assert.equal(await page.evaluate(()=>JSON.stringify(window.ArmyBookAppV2.roster.projection)),before,'Reading text cannot change effects');
        if(!c.skipAttach)await detach(page);
        for(const mode of ['Effective','Guide'])await inspect(page,c,device,mode,c.target,'detached',false);
        if(!c.skipAttach)await attach(page);await page.reload();await ready(page);
        await inspect(page,c,device,'Effective',c.target,'reattached-reload',c.expectedAttached);
        await inspect(page,c,device,'Guide',c.target,'reattached-reload',c.expectedAttached);
        console.log('PASS '+device+' '+c.rule);
      }catch(error){
        process.exitCode=1;results.push({book:c.book,rule:c.rule,device,status:'NEW_FAIL',error:error.stack});
        console.error('FAIL '+device+' '+c.rule+': '+error.message);
        const filename=`failure-${device}-${cases.indexOf(c)+1}.png`;
        await page.screenshot({path:path.join(out,filename),fullPage:true}).catch(()=>{});screenshots.push(filename);
      }finally{await context.close();}
      fs.writeFileSync(path.join(out,'results.json'),JSON.stringify({results,errors,missing,screenshots,snapshots},null,2));
    }
    for(const fixture of fixtures)for(const record of fixture.records.filter(row=>!row.browserCase)){
      const presentation=JSON.parse(fs.readFileSync(path.join(repo,'books',fixture.bookId,'v2/generated/app-presentation.json'),'utf8'));
      const rule=presentation.cards.find(card=>card.id===record.ruleId);assert.equal(rule.kind,'DETACHMENT_RULE');
      const context=await browser.newContext({viewport,serviceWorkers:'block'}),page=await context.newPage();
      try{
        await page.goto(origin+'/v2/app.html');await page.locator('[data-v2-book="'+fixture.bookId+'"]').click();await ready(page);
        await page.locator('main a[data-target-id="'+rule.parentId+'"]').first().click();
        const card=page.locator('main [data-card-id="'+rule.id+'"]');await card.waitFor();
        // Canonical text may include a flattened duplicate of its structured
        // table. The reader renders the actual cells, with visual spacing.
        const tables=new Map();
        for(const field of rule.fields.filter(field=>field.presentation==='table-cell')){
          const key=field.table.id;if(!tables.has(key))tables.set(key,[]);
          const rows=tables.get(key);rows[field.table.row]||=[];rows[field.table.row][field.table.column]=field.value;
        }
        let prose=record.quote;
        for(const rows of tables.values()){
          const flat=rows.flat().join('');if(prose.endsWith(flat))prose=prose.slice(0,-flat.length).trimEnd();
        }
        for(const field of rule.fields.filter(field=>field.presentation==='table-cell')){
          const cell=card.locator('[data-fact-id="'+field.id+'"]');
          assert.equal(await cell.count(),1,'One exact source-bound table cell');
          assert.equal(await cell.textContent(),field.value,'Original table cell text');assert.ok(await cell.isVisible());
          assert.ok(await cell.evaluate(node=>!!node.closest('table,[role="table"]')),'Cell is in the visible reader table');
        }
        assert.ok(norm(await card.innerText()).includes(norm(prose)),'Enemy receiver keeps original detachment prose');
        assert.ok(await card.isVisible());results.push({book:fixture.bookId,ruleId:rule.id,clauseId:record.clauseId,device,mode:'Source detachment',status:'PASS'});
        console.log('PASS '+device+' source detachment '+record.ruleId+'/'+record.clauseId);
      }finally{await context.close();}
    }
  }
  assert.equal(errors.length,0,'No uncaught application errors');assert.equal(missing.length,0,'No missing runtime resources');
  completed=true;
}finally{
  fs.writeFileSync(path.join(out,'results.json'),JSON.stringify({status:!completed||process.exitCode||errors.length||missing.length?'NEW_FAIL':'PASS',
    browser:browser?.version(),serviceWorkers:'blocked',realNewRecruitExportTested:false,results,errors,missing,screenshots,snapshots},null,2));
  if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));
}

/** Public Library/book source captions and unchanged native model-base facts. */
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {launchChromium} from '../tests/helpers/browser-launch.mjs';
import {createQaEvidenceDir} from '../tests/helpers/qa-temp.mjs';
import {BOOK_PASSPORT_IDS,readBookPassport} from '../books/shared/tools/book-passport.mjs';
import {isApplicationTestDependency} from '../books/shared/application-v2/browser-test-dependencies.mjs';

const arg=name=>process.argv.find(value=>value.startsWith(name+'='))?.slice(name.length+1);
const root=path.resolve(arg('--root')||fileURLToPath(new URL('../',import.meta.url)));
const out=path.resolve(arg('--out')||createQaEvidenceDir('wh-library-sources-browser-'));
const widths=(arg('--widths')||'390,1440').split(',').map(Number);
assert(widths.length&&widths.every(width=>Number.isSafeInteger(width)&&width>0));
const read=file=>JSON.parse(fs.readFileSync(path.join(root,file),'utf8'));
const canonicalCore=read('books/core-rules/content/core-rules.digital-11e.json');
const captureDate=canonicalCore.meta.captureDate;
assert.match(captureDate,/^\d{4}-\d{2}-\d{2}$/);
// Independent English date rendering: this test does not import the presenter.
const [year,month,day]=captureDate.split('-').map(Number);
const months=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sept','Oct','Nov','Dec'];
const expectedLine=release=>`Points: Munitorum Field Manual ${release.version} · Core Rules: ${day} ${months[month-1]} ${year}`;
const globalLine=expectedLine(read('mfm/current.json'));
const normalize=value=>String(value).replace(/\s+/g,' ').trim();
const baseKind=kind=>kind==='MODEL_BASE'||kind==='MODEL_BASE_METADATA';
// Approved caption expectations, independent of the runtime formatter.
const baseCaptions=new Map([
  ['Use model','Use model base'],['⌀Use model','Use model base'],['ØUse model','Use model base'],
  ['(Use model)','(Use model base)'],['(⌀Use model)','(Use model base)'],['(ØUse model)','(Use model base)']
]);
const expectedBase=value=>baseCaptions.get(value)??value;
const escaped=value=>String(value).replaceAll('\\','\\\\').replaceAll('"','\\"');
const books=BOOK_PASSPORT_IDS.map(id=>{
  const passport=readBookPassport(id,{root}),payload=read(`books/${id}/v2/generated/app-presentation.json`);
  const cards=new Map(payload.cards.map(card=>[card.id,card]));
  const bases=payload.cards.filter(card=>baseKind(card.kind)),baseIds=new Set(bases.map(card=>card.id));
  const fields=payload.cards.flatMap(card=>card.fields.filter(field=>baseIds.has(field.source?.entityId)&&
    (field.source.path==='/text'||/^\/notes\/\d+$/.test(field.source.path))).map(field=>({card,field})));
  const unitOf=base=>{
    const seen=new Set();let owner=base;
    while(owner&&owner.kind!=='DATASHEET'&&!seen.has(owner.id)){seen.add(owner.id);owner=cards.get(owner.parentId);}
    assert.equal(owner?.kind,'DATASHEET','Every base has an explicit datasheet parent: '+id+' · '+base.id);return owner;
  };
  const rows=fields.map(({card,field})=>{
    const base=cards.get(field.source.entityId),unit=unitOf(base);
    return {bookId:id,baseId:base.id,baseKind:base.kind,unitId:unit.id,unitTitle:unit.title,
      presentationCardId:card.id,fieldId:field.id,sourcePath:field.source.path,value:field.value,
      displayed:expectedBase(field.displayValue??field.value)};
  });
  for(const base of bases)assert(rows.some(row=>row.baseId===base.id&&row.sourcePath==='/text'),'Every native model-base text has a retained fact: '+id+' · '+base.id);
  return {id,title:payload.book.title,line:expectedLine(read(passport.mfm.currentRelease)),mfmPointer:passport.mfm.currentRelease,rows,baseCards:bases.length};
});
assert.equal(books.length,9);
const csm=books.find(book=>book.id==='chaos-space-marines');
const csmExample=csm.rows.find(row=>row.unitId==='unit-chaos-rhino'&&row.sourcePath==='/text'&&typeof row.value==='string'&&row.value.includes('Use model'));
assert(csmExample,'The real CSM Rhino source supplies the model-base caption example');

const allowed=new Set(read('tools/pages-runtime-manifest.json').files.map(row=>'/'+row.path));
const report={status:'PREPARED',root,widths,sourceOwners:{coreCaptureDate:captureDate,coreCorpusFingerprint:canonicalCore.meta.corpusFingerprint},
  inventory:books.map(({id,title,mfmPointer,baseCards,rows})=>({bookId:id,title,mfmPointer,baseCards,rows})),checks:[],screenshots:[],errors:[],missing:[]};
fs.mkdirSync(out,{recursive:true});
const htmlEscape=value=>String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
const save=()=>{
  fs.writeFileSync(path.join(out,'RESULTS.json'),JSON.stringify(report,null,2)+'\n');
  fs.writeFileSync(path.join(out,'gallery.html'),`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Library sources and model bases</title><style>body{margin:24px;font:16px system-ui;background:#151714;color:#eee}main{display:grid;grid-template-columns:repeat(auto-fit,minmax(330px,1fr));gap:20px}figure{margin:0;background:#242923;padding:12px}img{display:block;max-width:100%;height:auto}figcaption{padding:8px 0}a{color:inherit}</style><h1>Library sources and model bases</h1><p>${htmlEscape(report.status)}</p><main>${report.screenshots.map(shot=>`<figure><figcaption>${htmlEscape(shot.width+'px · '+shot.title)}</figcaption><a href="${htmlEscape(shot.file)}"><img loading="lazy" src="${htmlEscape(shot.file)}" alt="${htmlEscape(shot.title)}"></a></figure>`).join('')}</main></html>`);
};
save();
const mime={'.html':'text/html','.mjs':'text/javascript','.js':'text/javascript','.json':'application/json',
  '.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.webmanifest':'application/manifest+json'};
const server=http.createServer((request,response)=>{
  const address=decodeURIComponent(new URL(request.url,'http://local').pathname),file=path.resolve(root,'.'+address);
  if(address==='/favicon.ico'){response.writeHead(204).end();return;}
  if(!file.startsWith(root+path.sep)||(!allowed.has(address)&&!isApplicationTestDependency(address))||!fs.existsSync(file)||!fs.statSync(file).isFile()){
    report.missing.push(address);response.writeHead(404).end();return;
  }
  response.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'}).end(fs.readFileSync(file));
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const origin='http://127.0.0.1:'+server.address().port;
let browser,current={};
async function ready(page){
  await page.waitForFunction(()=>Boolean(window.WarhammerAppV2));
  await page.evaluate(async()=>{await WarhammerAppV2.ready;await document.fonts.ready;});
  await page.waitForFunction(()=>[...document.querySelectorAll('link[rel="stylesheet"]')].every(link=>Boolean(link.sheet)));
  await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
}
async function shot(page,name,title){
  const file=`${current.width}-${name}.png`;
  await page.screenshot({path:path.join(out,file),animations:'disabled'});
  report.screenshots.push({...current,name,title,file,url:page.url()});save();
}
async function assertLine(page,line,expected,surface){
  assert.equal(await line.count(),1,'Exactly one '+surface+' source caption');
  assert.equal(await line.innerText(),expected,surface+' follows its MFM pointer and actual canonical capture date');
  await line.scrollIntoViewIfNeeded();assert(await line.isVisible(),surface+' caption is visible');
  const bounds=await line.boundingBox();assert(bounds&&bounds.x>=-1&&bounds.x+bounds.width<=current.width+1,surface+' caption stays within the viewport');
  return {text:await line.innerText(),bounds};
}
try{
  report.status='RUNNING';save();browser=await launchChromium();
  for(const width of widths){
    current={width};const context=await browser.newContext({viewport:{width,height:width<600?844:1000},serviceWorkers:'block'});
    context.setDefaultTimeout(30000);const page=await context.newPage();
    page.on('pageerror',error=>report.errors.push({...current,message:error.message}));
    try{
      await page.goto(origin+'/v2/app.html');await ready(page);
      const home=page.locator('.v2-library-home .library > [data-v2-sources-line]');
      const homeResult=await assertLine(page,home,globalLine,'Home');
      assert.equal(await home.evaluate(node=>node.previousElementSibling?.querySelector('h2')?.textContent),'Library','Home source caption is immediately below Library');
      await shot(page,'home-sources','Home · source caption');report.checks.push({...current,name:'home-source-caption',...homeResult});
      for(const book of books){
        current={width,bookId:book.id};
        if(!await page.locator('.v2-library-home').count()){
          await page.locator('[data-v2-primary-nav] [data-v2-destination="HOME"]').click();await ready(page);
        }
        await page.locator(`[data-v2-book="${escaped(book.id)}"]`).click();
        await page.waitForFunction(id=>window.ArmyBookAppV2?.payload.book.id===id,book.id);await ready(page);
        const footer=page.locator('main [data-v2-sources-line]');
        const footerResult=await assertLine(page,footer,book.line,book.title);
        assert(await footer.evaluate(node=>node.previousElementSibling?.classList.contains('v2-library-sections')),'The book caption follows the homepage library sections');
        await shot(page,book.id+'-sources',book.title+' · homepage source caption');
        report.checks.push({...current,name:'book-source-caption',mfmPointer:book.mfmPointer,...footerResult});

        const expectedIds=[...new Set(book.rows.map(row=>row.fieldId))];
        const displayed=await page.locator('main [data-fact-id]').evaluateAll((nodes,ids)=>{
          const expected=new Set(ids);return nodes.filter(node=>expected.has(node.dataset.factId)).map(node=>({
            id:node.dataset.factId,value:node.dataset.factValue,text:node.textContent,entityId:node.dataset.entityId,contextId:node.dataset.contextId}));
        },expectedIds);
        for(const row of book.rows){
          const matches=displayed.filter(node=>node.id===row.fieldId);
          assert(matches.length,'Every source model-base row is rendered: '+book.id+' · '+row.fieldId);
          for(const found of matches){
            assert.equal(found.value,JSON.stringify(row.value),'Native model-base data-fact-value remains exact: '+row.fieldId);
            assert.equal(found.entityId,row.baseId,'Native model-base source identity remains exact: '+row.fieldId);
            assert.equal(normalize(found.text),normalize(row.displayed),'Only the approved model-base caption changes: '+row.fieldId);
            if(typeof row.value==='string'&&row.value.includes('Use model')){
              assert.match(found.text,/Use model base/);assert.doesNotMatch(found.text,/[⌀Ø]/,'The model instruction has no diameter mark');
            }
          }
        }
        report.checks.push({...current,name:'all-native-model-base-facts',sourceRows:book.rows.length,baseCards:book.baseCards,renderedFacts:displayed.length,
          modelInstructions:book.rows.filter(row=>typeof row.value==='string'&&row.value.includes('Use model')).length,sourceValuesPreserved:true});

        if(book.id==='chaos-space-marines'){
          const link=page.locator(`main .v2-library-card[data-target-id="${escaped(csmExample.unitId)}"]`).first();
          await link.click();await ready(page);
          const unit=page.locator(`main .unit-card[data-card-id="${escaped(csmExample.unitId)}"]`).first();
          const fact=unit.locator(`[data-fact-id="${escaped(csmExample.fieldId)}"]`).first();
          for(const summary of await fact.locator('xpath=ancestor::details[not(@open)]/summary').all())await summary.click();
          await fact.scrollIntoViewIfNeeded();assert(await fact.isVisible(),'The real CSM model-base caption is readable through its datasheet');
          assert.equal(await fact.getAttribute('data-fact-value'),JSON.stringify(csmExample.value));
          assert.match(await fact.innerText(),/Use model base/);assert.doesNotMatch(await fact.innerText(),/[⌀Ø]/);
          await shot(page,'chaos-space-marines-model-base',csmExample.unitTitle+' · Use model base');
          report.checks.push({...current,name:'csm-public-datasheet-model-base',unitId:csmExample.unitId,fieldId:csmExample.fieldId,sourceValue:csmExample.value,displayed:await fact.innerText()});
        }
        save();
      }
    }catch(error){await shot(page,'failure-'+(current.bookId||'home'),'Failure evidence').catch(()=>{});throw error;}
    finally{await context.close();}
  }
  assert.deepEqual(report.errors,[],'No browser errors');assert.deepEqual(report.missing,[],'No missing publication dependencies');report.status='PASS';
}catch(error){report.status='FAIL';report.failure=error.stack;throw error;}
finally{save();await browser?.close();await new Promise(resolve=>server.close(resolve));}
console.log(JSON.stringify({status:report.status,books:books.length,widths,checks:report.checks.length,out}));

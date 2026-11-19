/** Player-route regression for named sections and human weapon popup types. */
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {launchChromium} from '../tests/helpers/browser-launch.mjs';
import {createQaEvidenceDir} from '../tests/helpers/qa-temp.mjs';
import {assertPlayerDialog} from '../tests/helpers/player-dialog-assertions.mjs';
import {isApplicationTestDependency} from '../books/shared/application-v2/browser-test-dependencies.mjs';
import {parseProducerJSON} from '../books/shared/source-refs-v2/producer-io.mjs';
import {armyBooks} from './army-books.mjs';

const own=fileURLToPath(new URL('../',import.meta.url)),arg=name=>process.argv.find(value=>value.startsWith(name+'='))?.slice(name.length+1);
const root=path.resolve(arg('--root')||own),out=path.resolve(arg('--out')||createQaEvidenceDir('wh-polish-5-'));
const observe=process.argv.includes('--observe-only'),widths=(arg('--widths')||'390,1440').split(',').map(Number),census=arg('--census')!=='off';
const books=armyBooks.filter(book=>!arg('--book')||book.id===arg('--book'));assert(books.length&&widths.every(width=>width>0));
const supported=new Set(['ABILITY','WARGEAR_ABILITY','DATASHEET_SECTION','SUPPLEMENTAL_DATASHEET_RULE','EQUIPMENT_RULE']);
const placeholder='Choose a named ability from the Glossary to read its complete rule.';
const bodyFields=card=>card.fields.filter(field=>typeof field.value==='string'&&field.value.trim()&&
  (/^\/blocks\/\d+\/text$/.test(field.presentationPath??field.source?.path??'')||['/text','/semanticContent'].includes(field.presentationPath??field.source?.path)));
const fixtures=[
  {bookId:'death-guard',unitId:'unit-mortarion',id:'datasheet-mortarion:section:1',label:'Lord of the Death Guard'},
  {bookId:'adeptus-mechanicus',unitId:'unit-belisarius-cawl',id:'datasheet-belisarius-cawl:section:4',label:'Canticles of the Omnissiah'},
  {bookId:'adeptus-mechanicus',unitId:'unit-thulia-ghuld',id:'datasheet-thulia-ghuld:section:4',label:'Icon of War'},
  {bookId:'emperors-children',unitId:'unit-fulgrim',id:'datasheet-fulgrim:section:5',label:'Daemon Primarch of Slaanesh'}
];
const allowed=new Set(JSON.parse(fs.readFileSync(path.join(own,'tools/pages-runtime-manifest.json'),'utf8')).files.map(row=>'/'+row.path));
const mime={'.mjs':'text/javascript','.js':'text/javascript','.json':'application/json','.html':'text/html','.css':'text/css','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.svg':'image/svg+xml'};
const rows=[],screens=[],inventory=[],errors=[],missing=[];let current={},browser,page,completed=false;
fs.mkdirSync(out,{recursive:true});
const server=http.createServer((req,res)=>{
  const address=decodeURIComponent(new URL(req.url,'http://local').pathname),file=path.resolve(root,'.'+address);
  if(address==='/favicon.ico'){res.writeHead(204).end();return;}
  if(!file.startsWith(root+path.sep)||(!allowed.has(address)&&!isApplicationTestDependency(address))||!fs.existsSync(file)){missing.push(address);res.writeHead(404).end();return;}
  res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'}).end(fs.readFileSync(file));
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const origin='http://127.0.0.1:'+server.address().port;
const norm=value=>String(value).replace(/\s+/g,' ').trim();
async function check(name,fn,extra={}){try{const detail=await fn();rows.push({...current,...extra,name,status:'PASS',detail});}catch(error){rows.push({...current,...extra,name,status:'FAIL',error:error.stack});if(!observe)throw error;}}
async function frames(){await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));}
async function shot(name,locator){const file=current.bookId+'-'+current.width+'-'+name+'.jpg';await locator.screenshot({path:path.join(out,file),type:'jpeg',quality:76,animations:'disabled'});screens.push({...current,name,file,url:page.url()});}
async function closeDialog(){const dialog=page.locator('dialog.v2-detail-dialog[open]');if(await dialog.count()){await dialog.getByRole('button',{name:'Close rule reference',exact:true}).click();await dialog.waitFor({state:'hidden'});}}
async function exactBody(target,fieldPath,{whole=false}={}){
  const dialog=page.locator('dialog.v2-detail-dialog[open]');await dialog.waitFor();
  assert.equal(await dialog.getAttribute('data-canonical-id'),target.id,'Exact clicked canonical identity');
  const texts=bodyFields(target),matches=fieldPath?texts.filter(field=>field.source.path===fieldPath||(field.presentationPath??field.source.path)===fieldPath):[];
  const expected=whole||matches.length!==1?texts:[matches[0]];assert(expected.length,'Accepted target has a canonical rule body');
  const actual=await dialog.locator('.reference-definition [data-fact-id]').evaluateAll(nodes=>nodes.map(node=>({id:node.dataset.factId,value:node.dataset.factValue,entityId:node.dataset.entityId,contextId:node.dataset.contextId,text:node.textContent})));
  const expectedBodyIds=new Set(texts.map(field=>field.id));
  assert.deepEqual(actual.filter(field=>expectedBodyIds.has(field.id)).map(field=>field.id),expected.map(field=>field.id),'Exact complete selected body set, no missing/extra sibling');
  for(const field of expected){const matches=actual.filter(value=>value.id===field.id);assert.equal(matches.length,1,'One instance of canonical body '+field.id);const found=matches[0];assert.equal(found.value,JSON.stringify(field.value));assert.equal(found.entityId,field.source.entityId);assert.equal(found.contextId,field.contextId);const split=field.value.indexOf(':'),body=whole?field.value:split>0&&split<160?field.value.slice(split+1):field.value;assert(norm(found.text).includes(norm(body)),'Complete source prose is readable');}
  assert(!await dialog.getByText(placeholder,{exact:true}).count(),'Removed generic instruction is absent');
  assert.equal(await dialog.locator('.reference-title').count(),1,'One human title');
  assert((await dialog.locator('.reference-context').first().innerText()).trim(),'Human type is present');await assertPlayerDialog(page);
  return {id:target.id,fieldPath:fieldPath||null,expectedBodyIds:expected.map(field=>field.id)};
}
try{
  browser=await launchChromium();
  for(const book of books){
    const payload=parseProducerJSON(fs.readFileSync(path.join(root,'books',book.id,'v2/generated/app-presentation.json'),'utf8')),cards=new Map(payload.cards.map(card=>[card.id,card]));
    const rules=new Map(payload.cards.filter(card=>supported.has(card.kind)&&bodyFields(card).length).map(card=>[card.id,card])),units=payload.cards.filter(card=>card.kind==='DATASHEET');
    for(const width of widths){
      current={bookId:book.id,width};const context=await browser.newContext({viewport:{width,height:900},serviceWorkers:'block'});page=await context.newPage();page.setDefaultTimeout(25000);page.on('pageerror',error=>errors.push({...current,error:error.message}));
      try{
        await page.goto(origin+'/v2/app.html');await page.locator(`[data-v2-book="${book.id}"]`).click();await page.waitForFunction(id=>window.ArmyBookAppV2?.payload.book.id===id,book.id);await frames();
        for(const fixture of fixtures.filter(fixture=>fixture.bookId===book.id)){
          await page.evaluate(()=>ArmyBookAppV2.openGlossary());await page.getByRole('searchbox',{name:'Search glossary',exact:true}).fill(fixture.label);
          const link=page.locator(`.v2-glossary-result[data-target-id="${fixture.id}"]`);assert.equal(await link.count(),1,'One actual canonical named-section result');
          await link.click();await page.locator('dialog.v2-detail-dialog[open]').waitFor();
          await check('named-section-complete-'+fixture.id,()=>exactBody(cards.get(fixture.id),null,{whole:true}),{targetId:fixture.id});
          await shot('section-'+fixture.unitId,page.locator('dialog.v2-detail-dialog[open]'));
          if(!observe&&book.id==='death-guard')await check('placeholder-mutation-rejected',async()=>{
            await page.evaluate(text=>{const node=document.createElement('p');node.dataset.polish5Mutation='';node.textContent=text;document.querySelector('dialog[open]').append(node);},placeholder);
            try{await assert.rejects(()=>assertPlayerDialog(page),/Player dialog contains technical text or unnamed controls/,'The player guard rejects the removed placeholder');}
            finally{await page.evaluate(()=>document.querySelector('[data-polish5-mutation]').remove());}
            await assertPlayerDialog(page);return {placeholderRejected:true};
          });
          await closeDialog();
        }
        if(book.id==='death-guard')for(const mode of['ranged','melee']){
          const weapon=payload.cards.find(card=>card.kind==='WEAPON_PROFILE'&&(card.fields.find(field=>(field.presentationPath??field.source?.path)==='/mode')?.value??card.weaponMode)===mode);assert(weapon,'Accepted exact weapon mode');
          await page.evaluate(id=>ArmyBookAppV2.open(id),weapon.parentId);await page.locator(`main .unit-card[data-card-id="${weapon.parentId}"]`).first().waitFor();
          const link=page.locator(`main .weapon-name a[data-target-id="${weapon.id}"]`).first();await link.click();const dialog=page.locator('dialog.v2-detail-dialog[open]');await dialog.waitFor();
          await check('human-weapon-type-'+mode,async()=>{assert.equal(await dialog.getAttribute('data-canonical-id'),weapon.id);const caption=dialog.locator('.popup-weapon-profile .reference-context');assert.equal(await caption.count(),1);assert.equal(await caption.innerText(),mode==='ranged'?'Ranged weapon':'Melee weapon');await assertPlayerDialog(page);assert(!await dialog.getByText(placeholder,{exact:true}).count());return {weaponId:weapon.id,mode};});
          await shot('weapon-'+mode,dialog);await closeDialog();
        }
        const censusRow={...current,sourceDatasheets:units.length,visited:0,visibleNamedLinks:0,uniquePopupTargets:0,inlineCanonicalBodyFacts:0,noninteractiveCaptions:0,failedTargets:0};
        if(census){const seen=new Set();
          for(const unit of units){
            await page.evaluate(id=>ArmyBookAppV2.open(id),unit.id);const source=page.locator(`main .unit-card[data-card-id="${unit.id}"]`).first();await source.waitFor();censusRow.visited++;
            const found=await source.evaluate((node,ids)=>{const supported=new Set(ids),visible=element=>Boolean(element.getClientRects().length)&&!element.closest('[hidden]');return {links:[...node.querySelectorAll('a[data-target-id]')].filter(link=>supported.has(link.dataset.targetId)&&visible(link)).map(link=>({targetId:link.dataset.targetId,href:link.href,label:link.textContent,fieldPath:new URL(link.href).searchParams.get('field')})),noninteractiveCaptions:[...node.querySelectorAll('.ds-inline-rule-title')].filter(visible).map(node=>({tag:node.tagName,insideAction:Boolean(node.closest('a,button'))})),facts:[...node.querySelectorAll('[data-fact-id]')].filter(visible).map(node=>({id:node.dataset.factId,value:node.dataset.factValue}))}},[...rules.keys()]);
            for(const caption of found.noninteractiveCaptions)assert(!caption.insideAction,'Full inline rule caption is not a redundant popup action');censusRow.noninteractiveCaptions+=found.noninteractiveCaptions.length;
            const visibleFacts=new Map(found.facts.map(field=>[field.id,field.value]));
            for(const target of rules.values())for(const field of bodyFields(target))if(visibleFacts.has(field.id)){assert.equal(visibleFacts.get(field.id),JSON.stringify(field.value),'Visible inline canonical value retained');censusRow.inlineCanonicalBodyFacts++;}
            censusRow.visibleNamedLinks+=found.links.length;
            for(const item of found.links){const key=JSON.stringify([item.targetId,item.fieldPath,new URL(item.href).searchParams.get('wargear')]);if(seen.has(key))continue;seen.add(key);censusRow.uniquePopupTargets++;
              const link=source.locator(`a[data-target-id="${item.targetId}"]`).filter({visible:true});const index=await link.evaluateAll((nodes,href)=>nodes.findIndex(node=>node.href===href),item.href);assert(index>=0,'Original visible link remains present');
              await link.nth(index).click();const before=rows.length;
              await check('named-link-census',()=>exactBody(cards.get(item.targetId),item.fieldPath,{whole:!item.fieldPath&&bodyFields(cards.get(item.targetId)).length>1}),{unitId:unit.id,targetId:item.targetId,href:item.href});
              if(rows[before]?.status==='FAIL')censusRow.failedTargets++;await closeDialog();
              if(!await source.count()){await page.evaluate(id=>ArmyBookAppV2.open(id),unit.id);await source.waitFor();}
            }
          }
          assert.equal(censusRow.visited,units.length,'Every accepted datasheet inspected, including full-inline nonbuttons');
        }
        inventory.push(censusRow);console.log(JSON.stringify({phase:'polish-5',...censusRow}));
      }finally{await context.close();}
    }
  }
  assert.deepEqual(errors,[],'No browser page errors');assert.deepEqual(missing,[],'All requested runtime dependencies available');completed=true;
}catch(error){rows.push({...current,name:'execution',status:'FAIL',error:error.stack});await page?.screenshot({path:path.join(out,'failure.jpg'),type:'jpeg',quality:76}).catch(()=>{});if(!observe)throw error;}
finally{fs.writeFileSync(path.join(out,'RESULTS.json'),JSON.stringify({status:completed&&!rows.some(row=>row.status==='FAIL')?'PASS':observe?'OBSERVED_WITH_FAILURES':'FAIL',root,observe,widths,census,rows,inventory,screens,errors,missing},null,2)+'\n');await browser?.close();await new Promise(resolve=>server.close(resolve));}
assert(observe||completed&&!rows.some(row=>row.status==='FAIL'),'Every required named-rule check must pass');
console.log(JSON.stringify({status:observe?'OBSERVED':'PASS',checks:rows.length,out}));

/** Visible player text guard. Inputs and navigation use the ordinary UI; evaluation is read-only.
 * Run: node v2/sweep-polish-browser-qa.mjs --root=<checkout> --out=<evidence-directory>
 * --book=<book-id> selects a bounded diagnostic run (glossary still runs).
 * Full normal books include their below-fold cards; closed evidence/details are excluded.
 * This test owns no factual labels, gameplay expectations, or source enrollment bytes.
 */
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {createQaEvidenceDir} from '../tests/helpers/qa-temp.mjs';
import {launchChromium} from '../tests/helpers/browser-launch.mjs';
import {isApplicationTestDependency} from '../books/shared/application-v2/browser-test-dependencies.mjs';
import {assertPlayerDialog} from '../tests/helpers/player-dialog-assertions.mjs';

const own=fileURLToPath(new URL('../',import.meta.url));
const arg=name=>process.argv.find(value=>value.startsWith(name+'='))?.slice(name.length+1);
const root=path.resolve(arg('--root')||process.env.SWEEP_POLISH_ROOT||own),out=path.resolve(arg('--out')||createQaEvidenceDir('wh-sweep-polish-'));
const fixture=JSON.parse(fs.readFileSync(new URL('./fixtures/sweep-polish-v1.json',import.meta.url),'utf8'));
assert(!arg('--book')||fixture.books.includes(arg('--book')),'Unknown --book');
for(const item of fixture.cases)assert.equal(createHash('sha256').update(item.text).digest('hex'),item.sha256,'Exact existing fixture bytes: '+item.id);
fs.mkdirSync(out,{recursive:true});
const allowed=new Set(JSON.parse(fs.readFileSync(path.join(own,'tools/pages-runtime-manifest.json'),'utf8')).files.map(row=>'/'+row.path));
const mime={'.html':'text/html','.mjs':'text/javascript','.js':'text/javascript','.json':'application/json','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg'};
const rows=[],errors=[],missing=[];
const server=http.createServer((request,response)=>{
  const address=decodeURIComponent(new URL(request.url,'http://local').pathname),file=path.resolve(root,'.'+address);
  if(address==='/favicon.ico'){response.writeHead(204).end();return;}
  if(!file.startsWith(root+path.sep)||(!allowed.has(address)&&!isApplicationTestDependency(address))||!fs.existsSync(file)){
    missing.push(address);response.writeHead(404).end();return;
  }
  response.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'}).end(fs.readFileSync(file));
});

/** Independent lexical guard; deliberately does not import production label/ID formatting. */
function inspectVisiblePlayerText(){
  const scope=document.querySelector('dialog[open]')||document.querySelector('main.main,main.v2-main,main.global-glossary-main,main')||document.body;
  // Uppercase machine statuses remain case-sensitive: human names such as Null-zone are valid.
  const bad=/\b(?:undefined|null|NaN|UNVERIFIED|NOT_IMPLEMENTED|SOURCE_CONFLICT|EXECUTABLE_MISSING|REVIEW_REQUIRED|TEXT_ONLY|CONDITIONAL_POLICY|NO_MATCH|NOT_PROVEN|REFERENCE_ONLY|BATTLE_ONLY|NEEDS_BINDINGS|ROSTER_EXECUTABLE|UNRESOLVED|UNKNOWN|SOURCE_DECLARATION|NOT_EXECUTABLE)\b|\[object Object\]|\bparsed-unit-\d+\b|\b(?:unit|detachment|datasheet|refs|bindings)-[a-z0-9][a-z0-9_-]{7,}(?::[a-z0-9_:/.-]+)?/g;
  const excluded='script,style,template,noscript,input,textarea,[contenteditable="true"],[aria-hidden="true"],.v2-sr-only,.sr-only';
  const visible=node=>{
    if(node.closest(excluded))return false;
    for(let ancestor=node;ancestor;ancestor=ancestor.parentElement){
      if(ancestor.hidden||ancestor.tagName==='DIALOG'&&!ancestor.open)return false;
      if(ancestor.tagName==='DETAILS'&&!ancestor.open){
        const summary=ancestor.querySelector(':scope > summary');
        if(!summary?.contains(node))return false;
      }
      const style=getComputedStyle(ancestor);
      if(style.display==='none'||style.contentVisibility==='hidden'||style.opacity==='0')return false;
    }
    const style=getComputedStyle(node);
    return style.visibility!=='hidden'&&style.visibility!=='collapse'&&!!node.getClientRects().length;
  };
  const leaks=[],walker=document.createTreeWalker(scope,NodeFilter.SHOW_TEXT);
  let node,scannedTextNodes=0;
  while((node=walker.nextNode())){
    const text=node.textContent.trim();if(!text)continue;scannedTextNodes++;
    const matches=[...text.matchAll(bad)];if(!matches.length||!visible(node.parentElement))continue;
    const range=document.createRange();range.selectNodeContents(node);
    if(![...range.getClientRects()].some(rect=>rect.width>0&&rect.height>0))continue;
    const owner=node.parentElement.closest('[data-card-id],[data-roster-instance-id],.v2-compatible-item');
    for(const match of matches)leaks.push({token:match[0],offendingText:text,nearestCard:{
      cardId:owner?.dataset.cardId||null,instanceId:owner?.dataset.rosterInstanceId||null,
      title:owner?.querySelector('h2,h3,h4,.v2-glossary-result')?.textContent?.trim()||null,
    },tag:node.parentElement.tagName,classes:node.parentElement.className});
  }
  const cards=[...scope.querySelectorAll('article.unit-card,article.v2-book-record,article.v2-roster-instance,article.rule-reference')].filter(visible);
  return {scannedTextNodes,visibleCards:cards.length,leaks};
}

let browser,page,complete=false,current=null;
const started=Date.now();
async function scan(meta){
  current=meta;
  await assertPlayerDialog(page);
  const result=await page.evaluate(inspectVisiblePlayerText);rows.push({...meta,...result});
  assert(result.scannedTextNodes>0,'Nonempty rendered screen: '+JSON.stringify(meta));
  assert.equal(result.leaks.length,0,'Visible technical text: '+JSON.stringify({...meta,leaks:result.leaks}));
}
async function roster(){
  await page.locator('[data-v2-primary-nav] [data-v2-destination="ROSTER"]').click();
  await page.locator('[data-roster-view]').waitFor();
}
async function settled(){await page.waitForFunction(()=>!document.querySelector('.v2-roster[aria-busy="true"]'));}
async function fullBookCoverage(){
  const result=await page.evaluate(()=>{
    const declared=new Set(ArmyBookAppV2.payload.groups.flatMap(group=>group.itemIds));
    const expected=ArmyBookAppV2.payload.cards.filter(card=>['DATASHEET','DETACHMENT'].includes(card.kind)&&declared.has(card.id));
    const present=new Set([...document.querySelectorAll('main .v1-contents-pages [data-card-id]')].map(node=>node.dataset.cardId));
    return {expected:expected.length,datasheets:expected.filter(card=>card.kind==='DATASHEET').length,detachments:expected.filter(card=>card.kind==='DETACHMENT').length,missing:expected.filter(card=>!present.has(card.id)).map(card=>({id:card.id,kind:card.kind}))};
  });
  assert(result.datasheets>0&&result.detachments>0,'Normal full book includes datasheets and detachments');
  assert.deepEqual(result.missing,[],'Every declared library datasheet and detachment is rendered in the normal full book');
  return result;
}
const mobileTitles=[
  {book:'adeptus-mechanicus',id:'detachment-eradication-cohort:stratagem:4',text:'THREAT‑COGITATION TARGETERS'},
  {book:'adeptus-mechanicus',id:'detachment-luminen-auto-choir:stratagem:2',text:'CHANT OF ELECTROTRACTION'},
  {book:'tyranids',id:'detachment-ambush-predators:stratagem:1',text:'COUNTERPREDATION'},
  {book:'tyranids',id:'detachment-talons-of-the-norn-queen:stratagem:1',text:'CATALYTIC BIOFORTIFICATION'},
];
async function titleFits(book,width){
  await page.evaluate(()=>document.fonts.ready);
  for(const expected of mobileTitles.filter(item=>item.book===book)){
    const measured=await page.evaluate(id=>{
      const card=[...document.querySelectorAll('main .stratagem[data-card-id]')].find(node=>node.dataset.cardId===id),heading=card?.querySelector('.stratagem-head h3');
      if(!heading)return null;
      const range=document.createRange();range.selectNodeContents(heading);const box=card.getBoundingClientRect();
      return {text:heading.textContent,cardLeft:box.left,cardRight:box.right,rectangles:[...range.getClientRects()].map(rect=>({left:rect.left,right:rect.right,width:rect.width,height:rect.height}))};
    },expected.id);
    assert(measured,'Stratagem heading exists: '+expected.id);
    assert.equal(measured.text.replace(/\s+/g,' ').trim().toUpperCase(),expected.text,'Complete accepted heading remains readable');
    assert(measured.rectangles.length&&measured.rectangles.every(rect=>rect.width>0&&rect.height>0&&rect.left>=measured.cardLeft-1&&rect.right<=measured.cardRight+1),'Every title line stays inside its physical card: '+JSON.stringify({book,width,...measured}));
    rows.push({book,width,screen:'stratagem-heading-fit',id:expected.id,status:'PASS',...measured});
  }
}

await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const origin='http://127.0.0.1:'+server.address().port;
try{
  browser=await launchChromium();
  for(const book of fixture.books.filter(book=>!arg('--book')||book===arg('--book'))){
    console.log('RUN visible player text '+book);
    const context=await browser.newContext({viewport:{width:1440,height:900},serviceWorkers:'block'});
    context.setDefaultTimeout(25000);page=await context.newPage();page.on('pageerror',error=>errors.push(error.message));
    try{
      await page.goto(origin+'/v2/app.html');await page.locator(`[data-v2-book="${book}"]`).click();
      await page.waitForFunction(id=>window.ArmyBookAppV2?.payload.book.id===id,book);
      await page.locator('main .v1-contents-pages').waitFor();
      const coverage=await fullBookCoverage();
      for(const width of fixture.widths){
        await page.setViewportSize({width,height:900});
        await scan({book,screen:'full-normal-library',width,coverage});
        await titleFits(book,width);
      }
      for(const input of fixture.cases.filter(row=>row.bookId===book)){
        current={book,screen:'import',inputId:input.id};await roster();
        await openImportForm(page);await page.getByRole('textbox',{name:'New Recruit text export',exact:true}).fill(input.text);
        await page.locator('[data-roster-action="review-import"]').click();await settled();
        const replace=page.locator('[data-roster-action="confirm-replace-roster"]');if(await replace.isVisible()){await replace.click();await settled();}
        assert.match(await page.locator('.v2-roster-status').innerText(),/^Roster imported\./,'Existing positive fixture imports through UI: '+input.id);
        if(input.attachment){
          const {leader,target}=input.attachment;
          await page.locator(`[data-attachment-candidate-for="${target}"]`).selectOption(leader);
          await page.locator(`[data-attachment-target-instance-id="${target}"] [data-roster-action="attach"]`).click();await settled();
          await page.locator(`[data-attached-leader-instance-id="${leader}"]`).waitFor();
        }
        // Every imported physical instance is opened through its own UI button.
        // Attributes identify the interaction only; their internal IDs are allowed.
        const instances=await page.locator('.v2-roster-instance[data-roster-instance-id]').evaluateAll(nodes=>nodes.map(node=>node.dataset.rosterInstanceId));
        assert(instances.length,'Fixture has physical instances: '+input.id);
        for(const width of fixture.widths){
          await page.setViewportSize({width,height:900});await roster();
          await scan({book,screen:'roster-after-import-and-attachment',width,inputId:input.id});
          for(const instanceId of instances){
            await roster();
            await openCard(page,page.locator(`.v2-roster-instance[data-roster-instance-id="${instanceId}"]`));
            await page.locator(`main .unit-card[data-roster-instance-id="${instanceId}"]`).first().waitFor();
            await scan({book,screen:'opened-physical-instance',width,inputId:input.id,instanceId,attachment:input.attachment});
            if(input.id==='character-pair-0039'){
              const shared=await page.evaluate(()=>{
                const ruleId='detachment-rule-ba-10c56bef78b24440bb5f';
                return [...document.querySelectorAll('main .unit-card[data-roster-instance-id]')].map(card=>{
                  const policies=[...card.querySelectorAll('.ds-conditional-policy[data-policy-source]')].filter(node=>JSON.parse(node.dataset.policySource).ruleId===ruleId);
                  const texts=[...card.querySelectorAll('.ds-source-text[data-rule-id]')].filter(node=>node.dataset.ruleId===ruleId);
                  return {instanceId:card.dataset.rosterInstanceId,clauses:policies.map(node=>JSON.parse(node.dataset.policySource).clauseId),refs:policies.map(node=>node.dataset.policyTextRef),textIds:texts.map(node=>node.id),text:texts[0]?.textContent};
                });
              });
              assert(shared.length,'Physical cards for Legacy of the Angel');
              for(const card of shared){
                assert.equal(card.clauses.length,2,'Both independent reroll effects remain on their physical card');
                assert.equal(new Set(card.clauses).size,2,'Hit and Wound clauses are not merged');
                assert.equal(card.textIds.length,1,'One complete rule text per physical card');
                assert(card.refs.every(id=>id===card.textIds[0]),'Both effects reference their own card’s complete text');
                assert.match(card.text,/Restrictions: Your army can include BLOOD ANGELS units, but it cannot include any ADEPTUS ASTARTES units drawn from any other Chapter\./,'Complete restriction is retained');
              }
              rows.push({book,width,screen:'one-rule-text-independent-effects',inputId:input.id,instanceId,cards:shared,status:'PASS'});
            }
          }
        }
      }
    }finally{await context.close();}
  }
  const context=await browser.newContext({viewport:{width:1440,height:900},serviceWorkers:'block'});
  context.setDefaultTimeout(25000);page=await context.newPage();page.on('pageerror',error=>errors.push(error.message));
  try{
    await page.goto(origin+'/v2/app.html');
    await page.locator('[data-v2-primary-nav] [data-v2-destination="GLOSSARY"]').click();
    await page.getByRole('searchbox',{name:'Search glossary',exact:true}).waitFor();
    for(const width of fixture.widths){
      await page.setViewportSize({width,height:900});
      for(const query of fixture.glossaryQueries){
        await page.getByRole('searchbox',{name:'Search glossary',exact:true}).fill(query);
        // Expand the actual result UI, so service aliases below the first page are covered too.
        let expansions=0;
        while(await page.getByRole('button',{name:'Show more entries',exact:true}).isVisible()){
          assert(expansions++<200,'Bounded glossary pagination: '+query);
          await page.getByRole('button',{name:'Show more entries',exact:true}).click();
        }
        const results=await page.locator('main .v2-glossary-result').count();assert(results>0,'Requested glossary query has results: '+query);
        await scan({book:'mega-glossary',screen:'all-search-results',width,query,results});
        await page.locator('main .v2-glossary-result').first().click();await page.locator('dialog[open]').waitFor();
        await scan({book:'mega-glossary',screen:'reference-popup',width,query});
        await page.getByRole('button',{name:'Close rule reference',exact:true}).click();
      }
    }
  }finally{await context.close();}
  assert.deepEqual(errors,[],'Browser errors');assert.deepEqual(missing,[],'Missing allowlisted runtime dependencies');complete=true;
}catch(error){
  const screenshot=path.join(out,'failure.png');await page?.screenshot({path:screenshot,fullPage:false}).catch(()=>{});
  rows.push({status:'FAIL',...current,error:error.message,screenshot});throw error;
}finally{
  fs.writeFileSync(path.join(out,'RESULTS.json'),JSON.stringify({status:complete?'PASS':'FAIL',root,fixtureBase:fixture.base,selectedBook:arg('--book')||null,elapsedMs:Date.now()-started,rows,errors,missing},null,2)+'\n');
  if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));
}
console.log(JSON.stringify({status:'PASS',screens:rows.length,elapsedMs:Date.now()-started,evidence:out}));

async function openCard(page,owner){
  assert.equal(await page.getByRole('button',{name:'Effective datasheet',exact:true,includeHidden:true}).count(),0,'Removed card label is absent');
  await owner.getByRole('button',{name:'Open card',exact:true}).click();
}

async function openImportForm(page){
  await page.locator('[data-roster-view]').waitFor();
  const raw=page.locator('[data-roster-input="raw-text"]');
  if(!await raw.isVisible())await page.locator('details[data-roster-import] > summary').filter({hasText:/^Import another roster$/}).click();
  await raw.waitFor();
}

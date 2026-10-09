/** Actual reference consumers on both books and viewports; no alternate renderer. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import {createReferenceContract} from './reference-contract.mjs';
import {createEffectiveCoreCatalog} from '../../core-rules/content/effective-core-catalog.mjs';
import {createEffectiveMfmCatalog} from '../../../mfm/content/effective-mfm-catalog.mjs';

const repo=fileURLToPath(new URL('../../../',import.meta.url));
const read=relative=>JSON.parse(fs.readFileSync(path.join(repo,relative),'utf8'));
const pointer=(value,address)=>address.slice(1).split('/').map(key=>key.replaceAll('~1','/').replaceAll('~0','~'))
  .reduce((current,key)=>current?.[key],value);
const core=new Map(createEffectiveCoreCatalog().records.map(record=>[record.id,record]));
const mfm=new Map(Object.values(createEffectiveMfmCatalog().catalog).filter(Array.isArray).flat()
  .filter(record=>record?.id).map(record=>[record.id,record]));
const books=[
  {id:'death-guard',initial:'unit-plague-marines',effective:'rule-contract-effective',text:[
    '+ DETACHMENT: Virulent Vectorium (Worldblight)',
    '+ WARLORD: Char1: Biologus Putrifier',
    'Char1: 1x Biologus Putrifier (50 pts): 1x Plague knives',
    '5x Plague Marines (90 pts): 1x Meltagun, 4x Boltgun, 5x Plague knives'
  ].join('\n')},
  {id:'adeptus-mechanicus',initial:'unit-tech-priest-dominus',effective:'effective',text:[
    '+ FACTION KEYWORD: Imperium - Adeptus Mechanicus',
    '+ DETACHMENT: Haloscreed Battle Clade',
    '+ WARLORD: Char1: Tech-priest Dominus',
    'Char1: 1x Tech-priest Dominus (100 pts): Volkite blaster, Macrostubber, Omnissian axe',
    'Enhancement: Cognitive Reinforcement',
    '10x Skitarii Rangers (85 pts): 10x Galvanic rifle, 10x Close combat weapon'
  ].join('\n')}
];
const originals=new Map();
for(const book of books){
  book.app=`/books/${book.id}/v2/app.html`;
  const payloadPath=`books/${book.id}/v2/generated/app-presentation.json`;
  book.payload=read(payloadPath);originals.set(payloadPath,fs.readFileSync(path.join(repo,payloadPath)));
  const effective=read(`books/${book.id}/v2/generated/${book.effective}.json`);
  book.entities=new Map(effective.entities.map(entity=>[entity.id,entity]));book.effectiveModel=effective;
  book.cards=new Map(book.payload.cards.map(card=>[card.id,card]));
  book.contract=createReferenceContract({cards:book.cards,index:book.payload.glossary});
  const categories=new Set(book.payload.glossary.entries.map(entry=>entry.category));
  book.samples=[...categories].map(category=>book.payload.glossary.entries.find(entry=>entry.category===category));
  book.aliasEntry=book.payload.glossary.entries.find(entry=>entry.aliases.some(alias=>alias.fieldPath));
  assert.ok(book.aliasEntry,book.id+' has no source-bound alias');
  book.weaponSelection=book.payload.cards.find(card=>card.kind==='WEAPON_PROFILE_SELECTION'&&
    card.fields.some(field=>field.targetIds?.some(id=>book.cards.get(id)?.kind==='WEAPON_PROFILE')));
  assert.ok(book.weaponSelection,book.id+' has no canonical weapon selection control');
  book.selectedWeaponId=book.weaponSelection.fields.flatMap(field=>field.targetIds||[]).find(id=>book.cards.get(id)?.kind==='WEAPON_PROFILE');
  book.contribution=book.payload.cards.find(card=>card.kind==='ENHANCEMENT'&&card.children.some(id=>book.cards.get(id)?.kind==='WEAPON_PROFILE'));
  const tableEntry=book.payload.glossary.entries.find(entry=>book.cards.get(entry.targetId).fields.some(field=>field.presentation==='table-cell'));
  for(const id of ['core-bodyguard','core-rule-19-01-forming-attached-units','core-deep-strike',tableEntry?.targetId,book.aliasEntry.targetId,book.contribution?.id])
    if(id&&!book.samples.some(entry=>entry.targetId===id))book.samples.push(book.payload.glossary.entries.find(entry=>entry.targetId===id));
  let fields=0;
  // The complete inventory is checked against effective sources in Node. The
  // real browser samples each semantic kind instead of repeating 600 dialogs.
  for(const entry of book.payload.glossary.entries){
    const model=book.contract.resolve(entry.targetId);assert.ok(model,book.id+' unresolved '+entry.targetId);
    assert.equal(model.targetId,entry.targetId);assert.equal(model.title,book.cards.get(entry.targetId).title);
    for(const section of model.sections)for(const field of section.fields){
      assert.ok(section.card.fields.includes(field),'Presentation copied a source field '+field.id);
      assert.equal(field.source.entityId,section.card.id,'Presentation changed source owner '+field.id);
      const entity=book.entities.get(field.source.entityId);
      const source=core.get(field.source.entityId)||mfm.get(field.source.entityId)||
        (field.source.path.startsWith('/qualifications/')?entity:entity?.data)||
        (field.source.entityId===effective.bookId?effective:null);
      assert.ok(source,'Missing effective source '+field.id);
      assert.deepEqual(field.value,pointer(source,field.source.path),'Wrong effective source value '+field.id);fields++;
    }
  }
  book.census={entries:book.payload.glossary.entries.length,categories:categories.size,sourceFields:fields};
}

const requests=[],unexpected=[];
const allowed=address=>/^\/books\/(?:death-guard|adeptus-mechanicus)\/v2\/[\w./-]+\.(?:html|mjs|json|css)$/.test(address)||
  /^\/books\/shared\/(?:army-book-app-v2|rule-contract-v2|roster-v2)\/[\w.-]+\.(?:mjs|css)$/.test(address)||
  /^\/books\/shared\/(?:datasheet-system|unit-art)\.css$/.test(address)||
  /^\/(?:assets|books\/(?:death-guard|adeptus-mechanicus)\/assets)\/[\w./-]+\.(?:png|webp|jpe?g|svg)$/.test(address);
const types={'.html':'text/html','.mjs':'text/javascript','.json':'application/json','.css':'text/css',
  '.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.jpg':'image/jpeg','.jpeg':'image/jpeg'};
const server=http.createServer((request,response)=>{
  const address=new URL(request.url,'http://localhost').pathname;requests.push(address);
  if(address==='/favicon.ico'){response.writeHead(204);response.end();return;}
  const filename=path.resolve(repo,address.slice(1));
  if(!allowed(address)||!filename.startsWith(path.resolve(repo)+path.sep)||!fs.existsSync(filename)){
    unexpected.push(address);response.writeHead(404);response.end();return;
  }
  response.writeHead(200,{'Content-Type':types[path.extname(filename)],'Cache-Control':'no-store'});response.end(fs.readFileSync(filename));
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const origin=`http://127.0.0.1:${server.address().port}`;
const {chromium}=createRequire(import.meta.url)('playwright');
const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE}:{})});
const screenshots=process.env.ARMY_APP_V2_SCREENSHOTS;if(screenshots)fs.mkdirSync(screenshots,{recursive:true});
const ready=async page=>{await page.waitForFunction(()=>Boolean(window.ArmyBookAppV2?.rosterPanel));
  await page.evaluate(()=>window.ArmyBookAppV2.rosterPanel.ready);await page.waitForLoadState('networkidle');};
const referenceUrl=(book,id,base=origin+book.app)=>{const url=new URL(base);url.searchParams.set('view','reference');url.hash=encodeURIComponent(id);return url.href;};
const resultIds=page=>page.locator('main .v2-glossary-result').evaluateAll(nodes=>nodes.map(node=>node.dataset.targetId));
const noInternal=/\b(?:CORE_MAIN_RULE|CORE_CORE_CONCEPT|CORE_ERRATA|CORE_FAQ_CLARIFICATION|CORE_UNIVERSAL_RULE_UPDATE|DATASHEET_SECTION|SUPPLEMENTAL_DATASHEET_RULE|SOURCE_ERRATUM|Source Rule Id)\b/;

async function observe(page,selector){
  return page.locator(selector).evaluate(article=>{
    const clone=article.cloneNode(true);clone.querySelectorAll('.reference-permalink').forEach(node=>node.remove());
    return {targetId:article.dataset.cardId,text:clone.textContent.replace(/\s+/g,' ').trim(),
      facts:[...article.querySelectorAll('[data-fact-id]')].map(node=>({id:node.dataset.factId,value:JSON.parse(node.dataset.factValue),
        text:node.textContent,entityId:node.dataset.entityId,contextId:node.dataset.contextId,ownerId:node.closest('[data-card-id]').dataset.cardId})),
      overflow:document.documentElement.scrollWidth>innerWidth+1};
  });
}
function assertFacts(book,id,observation){
  assert.equal(observation.targetId,id,'Reference resolved the wrong identity');assert.equal(observation.overflow,false,'Horizontal overflow');
  assert.doesNotMatch(observation.text,noInternal,'Machine-facing reference text');
  const model=book.contract.resolve(id),expected=[...(model.titleField?[model.titleField]:[])];
  for(const section of model.sections){
    if(section.card.kind==='WEAPON_PROFILE'){
      expected.push(...section.card.fields.filter(field=>/^\/(?:name|range|attacks|skill|strength|ap|damage)$/.test(field.source.path)||
        /^\/abilities\/\d+$/.test(field.source.path)));continue;
    }
    for(const field of section.fields){
    if(field.presentation==='caption'||/\/lines\/\d+\/label$/.test(field.source?.path||''))continue;
    const caption=section.card.fields.find(candidate=>candidate.id===field.captionFactId);if(caption)expected.push(caption);expected.push(field);
    }
  }
  const pointId=book.payload.bookPresentation.records[id]?.pointRecordId;
  const point=book.cards.get(pointId)?.fields.find(field=>field.source.path==='/value');if(point)expected.push(point);
  assert.equal(new Set(observation.facts.map(fact=>fact.id)).size,observation.facts.length,'Duplicate visible source field');
  assert.deepEqual(new Set(observation.facts.map(fact=>fact.id)),new Set(expected.map(field=>field.id)),'Incomplete reference definition '+id);
  for(const fact of observation.facts){
    const field=expected.find(field=>field.id===fact.id);assert.deepEqual(fact.value,field.value,'Changed canonical value '+fact.id);
    assert.equal(fact.entityId,field.source.entityId);assert.equal(fact.contextId,field.contextId);assert.equal(fact.ownerId,field.source.entityId);
  }
}
async function contrast(page,selector){
  const measured=await page.locator(selector).evaluateAll(nodes=>{
    const rgba=value=>{const parts=value.match(/[\d.]+/g).map(Number);return [...parts.slice(0,3),parts[3]??1];};
    const blend=(front,back)=>front.slice(0,3).map((value,index)=>value*front[3]+back[index]*(1-front[3]));
    const luminance=rgb=>rgb.map(value=>{value/=255;return value<=0.04045?value/12.92:((value+0.055)/1.055)**2.4;})
      .reduce((sum,value,index)=>sum+value*[0.2126,0.7152,0.0722][index],0);
    return nodes.filter(node=>node.getClientRects().length&&node.textContent.trim()).map(node=>{
      const ancestors=[];for(let current=node;current;current=current.parentElement)ancestors.unshift(current);
      let background=[255,255,255];for(const ancestor of ancestors)background=blend(rgba(getComputedStyle(ancestor).backgroundColor),background);
      const foreground=blend(rgba(getComputedStyle(node).color),background),a=luminance(foreground),b=luminance(background);
      return {text:node.textContent.slice(0,80),ratio:(Math.max(a,b)+0.05)/(Math.min(a,b)+0.05),
        foreground:getComputedStyle(node).color,background:background.map(Math.round)};
    });
  });
  assert.ok(measured.length,'No rendered contrast sample '+selector);
  for(const sample of measured)assert.ok(sample.ratio>=4.5,`Insufficient actual text contrast ${sample.ratio.toFixed(2)}: ${JSON.stringify(sample)}`);
  return Math.min(...measured.map(sample=>sample.ratio));
}
async function popupControls(page){
  const close=await page.getByRole('button',{name:'Close rule reference',exact:true}).boundingBox();
  const permalink=await page.locator('dialog[open] .reference-permalink').boundingBox();
  assert.ok(close&&permalink,'Missing reference popup controls');
  const horizontal=Math.min(close.x+close.width,permalink.x+permalink.width)-Math.max(close.x,permalink.x);
  const vertical=Math.min(close.y+close.height,permalink.y+permalink.height)-Math.max(close.y,permalink.y);
  assert.ok(horizontal<=1||vertical<=1,'Open full entry overlaps the popup close control');
}

const results=[];let activePage=null,step='startup';
try{
  for(const book of books)for(const [device,viewport]of [['desktop',{width:1440,height:1000}],['phone',{width:390,height:844}]]){
    const context=await browser.newContext({viewport,serviceWorkers:'block',...(device==='phone'?{isMobile:true,hasTouch:true}:{})});
    const page=await context.newPage();activePage=page;page.setDefaultTimeout(15000);const errors=[];
    context.on('page',tab=>tab.on('pageerror',error=>errors.push(error.message)));page.on('pageerror',error=>errors.push(error.message));
    const prefix=book.id+'/'+device;
    const search=async(query,expectedId)=>{await page.getByRole('searchbox',{name:'Search glossary',exact:true}).fill(query);
      const found=await resultIds(page);assert.equal(new Set(found).size,found.length,'Duplicate result');
      if(expectedId)assert.ok(found.includes(expectedId),'Missing query result '+query+' → '+expectedId);return found;};
    const catalog=async()=>{await page.goto(origin+book.app+'#view-glossary');await ready(page);await page.waitForSelector('main .v2-glossary');};
    step=prefix+'/categories';await catalog();
    assert.equal((await resultIds(page)).length,book.census.entries);assert.equal(await page.locator('main [data-fact-id]').count(),0);
    const filters=page.getByRole('group',{name:'Glossary categories'});
    await filters.getByRole('button',{name:'Main Rule',exact:true}).click();
    assert.deepEqual(new Set(await resultIds(page)),new Set(book.payload.glossary.entries.filter(entry=>entry.category==='CORE_MAIN_RULE').map(entry=>entry.targetId)));
    await search('Deep Strike','core-deep-strike');
    const categoryLink=page.locator('main .v2-glossary-result[data-target-id="core-deep-strike"]');
    for(const method of ['close','escape','outside']){
      step=prefix+'/category-history-focus/'+method;
      await categoryLink.click();await page.waitForSelector('dialog[open] .v1-reference-article');await popupControls(page);
      if(method==='close')await page.getByRole('button',{name:'Close rule reference',exact:true}).click();
      else if(method==='escape')await page.keyboard.press('Escape');
      else{
        const box=await page.locator('dialog[open]').boundingBox();
        const candidates=[[1,1],[1,viewport.height-1],[viewport.width-1,viewport.height-1]];
        const point=candidates.find(([x,y])=>x<box.x||x>box.x+box.width||y<box.y||y>box.y+box.height);
        assert.ok(point,'No reachable popup backdrop');await page.mouse.click(...point);
      }
      await page.waitForSelector('dialog[open]',{state:'hidden'});
      await page.waitForFunction(()=>document.activeElement?.matches('.v2-glossary-result')&&document.activeElement.dataset.targetId==='core-deep-strike');
      assert.equal(await filters.getByRole('button',{name:'Main Rule',exact:true}).getAttribute('aria-pressed'),'true','Popup close lost category');
      assert.equal(await page.getByRole('searchbox',{name:'Search glossary',exact:true}).inputValue(),'Deep Strike','Popup close lost query');
    }
    await page.reload();await ready(page);
    assert.equal(await filters.getByRole('button',{name:'Main Rule',exact:true}).getAttribute('aria-pressed'),'true','Reload lost category');
    assert.equal(await page.getByRole('searchbox',{name:'Search glossary',exact:true}).inputValue(),'Deep Strike','Reload lost query');
    assert.ok((await resultIds(page)).every(id=>book.payload.glossary.entries.find(entry=>entry.targetId===id).category==='CORE_MAIN_RULE'),'Reload changed category results');
    await search('');
    await filters.getByRole('button',{name:'All',exact:true}).click();assert.equal((await resultIds(page)).length,book.census.entries);
    await search('DÉEP STRIKE','core-deep-strike');await search('deep-strike','core-deep-strike');
    const alias=book.aliasEntry.aliases.find(alias=>alias.fieldPath);await search(alias.label,book.aliasEntry.targetId);
    await page.locator(`main .v2-glossary-result[data-target-id="${book.aliasEntry.targetId}"]`).click();
    await page.waitForSelector('dialog[open] .v1-reference-article');
    const aliasPopup=await observe(page,'dialog[open] .v1-reference-article');assertFacts(book,book.aliasEntry.targetId,aliasPopup);
    assert.ok(aliasPopup.facts.some(fact=>fact.id===book.aliasEntry.targetId+'::'+alias.fieldPath),'Alias lost its existing source field');
    await page.keyboard.press('Escape');await page.waitForSelector('dialog[open]',{state:'hidden'});
    assert.equal(await page.getByRole('searchbox',{name:'Search glossary',exact:true}).inputValue(),alias.label);
    const definitionId='core-rule-19-01-forming-attached-units';
    const definitionText=book.cards.get(definitionId).fields.find(field=>field.source.path==='/semanticContent').value;
    const definitionQuery=definitionText.split('\n')[0].split(/\s+/).slice(0,7).join(' ');
    assert.ok(!book.cards.get(definitionId).title.toLowerCase().includes(definitionQuery.toLowerCase()));await search(definitionQuery,definitionId);
    assert.deepEqual(await search('ZXQ_NO_REFERENCE_TERM_19734'),[]);await search('');
    let minContrast=Infinity,samples=0;
    for(const entry of book.samples){
      step=prefix+'/reference/'+entry.targetId;await search(entry.label,entry.targetId);
      const link=page.locator(`main .v2-glossary-result[data-target-id="${entry.targetId}"]`);
      assert.equal(await link.getAttribute('href'),referenceUrl(book,entry.targetId),'Catalog href differs from canonical standalone URL');
      await link.click();await page.waitForSelector('dialog[open] .v1-reference-article');
      await popupControls(page);
      assert.equal(await page.locator('dialog[open]').count(),1);const popup=await observe(page,'dialog[open] .v1-reference-article');assertFacts(book,entry.targetId,popup);
      assert.equal(await page.locator('dialog[open] .reference-permalink').getAttribute('href'),referenceUrl(book,entry.targetId));
      await page.getByRole('link',{name:'Open full entry',exact:true}).click();await page.waitForSelector('main .v1-reference-article');
      await page.waitForSelector('dialog[open]',{state:'hidden'});const article=await observe(page,'main .v1-reference-article');assertFacts(book,entry.targetId,article);
      assert.deepEqual(article,popup,'Popup/standalone definition differs '+entry.targetId);
      minContrast=Math.min(minContrast,await contrast(page,'main .v1-reference-article .reference-fact, main .v1-reference-article .reference-context, main .v1-reference-article h3, main .v1-reference-article .reference-links a'));
      await page.goBack();await page.waitForSelector('dialog[open] .v1-reference-article');assert.deepEqual(await observe(page,'dialog[open] .v1-reference-article'),popup);
      await page.goBack();await page.waitForSelector('main .v2-glossary');await page.waitForSelector('dialog[open]',{state:'hidden'});
      assert.equal(await page.getByRole('searchbox',{name:'Search glossary',exact:true}).inputValue(),entry.label);samples++;
    }
    step=prefix+'/bodyguard-inheritance';await search('Bodyguard','core-bodyguard');
    await page.locator('main .v2-glossary-result[data-target-id="core-bodyguard"]').click();await page.waitForSelector('dialog[open] .v1-reference-article');
    await popupControls(page);
    const inherited=await observe(page,'dialog[open] .v1-reference-article');assertFacts(book,'core-bodyguard',inherited);
    assert.ok(inherited.facts.some(fact=>fact.id===definitionId+'::/semanticContent'),'Bodyguard omitted its existing definition owner');
    assert.ok(!inherited.facts.some(fact=>fact.id==='core-bodyguard::/semanticContent'),'Bodyguard manufactured definition ownership');
    minContrast=Math.min(minContrast,await contrast(page,'dialog[open] .v1-reference-article .reference-fact, dialog[open] .v1-reference-article .reference-context, dialog[open] .v1-reference-article h3, dialog[open] .v1-reference-article .reference-links a'));
    if(screenshots)await page.screenshot({path:path.join(screenshots,`reference-${book.id}-${device}-bodyguard-popup.png`)});
    const fullCore=page.locator(`dialog[open] .reference-links a[data-target-id="${definitionId}"]`);
    assert.equal(await fullCore.getAttribute('href'),referenceUrl(book,definitionId));
    await fullCore.click();await page.waitForSelector(`dialog[open] .v1-reference-article[data-card-id="${definitionId}"]`);assertFacts(book,definitionId,await observe(page,'dialog[open] .v1-reference-article'));
    await page.getByRole('link',{name:'Open full entry',exact:true}).click();await page.waitForSelector('main .v1-reference-article');
    if(screenshots)await page.screenshot({path:path.join(screenshots,`reference-${book.id}-${device}-article.png`),fullPage:true});
    const fullSnapshot=await observe(page,'main .v1-reference-article');await page.reload();await ready(page);assert.deepEqual(await observe(page,'main .v1-reference-article'),fullSnapshot);

    step=prefix+'/modified-click-direct-history';await catalog();await search('deep strike','core-deep-strike');
    const deepLink=page.locator('main .v2-glossary-result[data-target-id="core-deep-strike"]');
    const [tab]=await Promise.all([context.waitForEvent('page'),deepLink.click({modifiers:['Control']})]);await ready(tab);
    assert.equal(tab.url(),referenceUrl(book,'core-deep-strike'));assert.equal(await page.locator('dialog[open]').count(),0,'Ctrl-click opened the source popup');
    const newTab=await observe(tab,'main .v1-reference-article');assertFacts(book,'core-deep-strike',newTab);await tab.reload();await ready(tab);assert.deepEqual(await observe(tab,'main .v1-reference-article'),newTab);await tab.close();
    const direct=await context.newPage();await direct.goto(referenceUrl(book,'core-bodyguard'));await ready(direct);assertFacts(book,'core-bodyguard',await observe(direct,'main .v1-reference-article'));
    const directLink=direct.locator(`main .reference-links a[data-target-id="${definitionId}"]`);await directLink.click();await direct.waitForSelector('dialog[open]');
    await direct.getByRole('link',{name:'Open full entry',exact:true}).click();await direct.waitForSelector(`main .v1-reference-article[data-card-id="${definitionId}"]`);
    await direct.goBack();await direct.waitForSelector('dialog[open]');await direct.goBack();await direct.waitForSelector('dialog[open]',{state:'hidden'});
    assertFacts(book,'core-bodyguard',await observe(direct,'main .v1-reference-article'));await direct.goForward();await direct.waitForSelector('dialog[open]');await direct.close();

    const returnBookEntry=book.payload.glossary.entries.find(entry=>entry.category==='ENHANCEMENT');
    for(const targetId of ['core-bodyguard',returnBookEntry.targetId])for(const method of ['close','escape']){
      step=prefix+'/article-glossary-return/'+targetId+'/'+method;
      await page.goto(referenceUrl(book,targetId));await ready(page);
      const originalArticle=await observe(page,'main .v1-reference-article');assertFacts(book,targetId,originalArticle);
      await page.getByRole('navigation',{name:'Breadcrumb',exact:true}).getByRole('button',{name:'Glossary',exact:true}).click();
      await page.waitForSelector('main .v2-glossary');
      // Reload the catalog before returning so its saved origin must survive
      // independently of the previous in-memory selected view or card.
      await page.reload();await ready(page);await page.waitForSelector('main .v2-glossary');
      if(method==='close')await page.getByRole('button',{name:'Close glossary',exact:true}).click();
      else{await page.getByRole('searchbox',{name:'Search glossary',exact:true}).focus();await page.keyboard.press('Escape');}
      await page.waitForSelector(`main .v1-reference-article[data-card-id="${targetId}"]`);
      assert.equal(page.url(),referenceUrl(book,targetId),'Glossary close changed the originating article route');
      assert.deepEqual(await observe(page,'main .v1-reference-article'),originalArticle,'Glossary close lost the original article shell or facts');
      await page.reload();await ready(page);
      assert.deepEqual(await observe(page,'main .v1-reference-article'),originalArticle,'Returned article changed after reload');
    }

    step=prefix+'/weapon-selection-native-link';
    await page.goto(referenceUrl(book,book.weaponSelection.id));await ready(page);
    const weaponLink=page.locator(`main .reference-links a[data-target-id="${book.selectedWeaponId}"]`);
    assert.equal(await weaponLink.getAttribute('href'),referenceUrl(book,book.selectedWeaponId));
    await weaponLink.click();await page.waitForSelector('dialog[open] .popup-weapon-profile');
    const weaponPopup=await observe(page,'dialog[open] .popup-weapon-profile');assertFacts(book,book.selectedWeaponId,weaponPopup);
    await page.keyboard.press('Escape');await page.waitForSelector('dialog[open]',{state:'hidden'});
    const [weaponTab]=await Promise.all([context.waitForEvent('page'),weaponLink.click({modifiers:['Control']})]);await ready(weaponTab);
    assert.equal(weaponTab.url(),referenceUrl(book,book.selectedWeaponId));
    const weaponArticle=await observe(weaponTab,'main .v1-reference-article');assertFacts(book,book.selectedWeaponId,weaponArticle);
    assert.deepEqual(weaponArticle.facts,weaponPopup.facts,'Native weapon article lost canonical popup stats');
    await weaponTab.reload();await ready(weaponTab);assert.deepEqual(await observe(weaponTab,'main .v1-reference-article'),weaponArticle);await weaponTab.close();
    const weaponDirect=await context.newPage();await weaponDirect.goto(referenceUrl(book,book.selectedWeaponId));await ready(weaponDirect);
    assertFacts(book,book.selectedWeaponId,await observe(weaponDirect,'main .v1-reference-article'));await weaponDirect.close();

    if(book.contribution){
      step=prefix+'/enhancement-contributed-weapon';await catalog();await search(book.contribution.title,book.contribution.id);
      await page.locator(`main .v2-glossary-result[data-target-id="${book.contribution.id}"]`).click();
      await page.waitForSelector('dialog[open] .v1-reference-article');
      const contributionPopup=await observe(page,'dialog[open] .v1-reference-article');assertFacts(book,book.contribution.id,contributionPopup);
      const contributionId=book.contribution.children.find(id=>book.cards.get(id)?.kind==='WEAPON_PROFILE');
      const contributionFields=book.cards.get(contributionId).fields.filter(field=>/^\/(?:range|attacks|skill|strength|ap|damage)$/.test(field.source.path));
      for(const field of contributionFields)assert.ok(contributionPopup.facts.some(fact=>fact.id===field.id&&fact.value===field.value),'Enhancement lost supplied weapon stat '+field.id);
      const contributedLink=page.locator(`dialog[open] .reference-links a[data-target-id="${contributionId}"]`);
      assert.equal(await contributedLink.getAttribute('href'),referenceUrl(book,contributionId));
      await contributedLink.click();await page.waitForSelector(`dialog[open] .popup-weapon-profile[data-card-id="${contributionId}"]`);
      assertFacts(book,contributionId,await observe(page,'dialog[open] .popup-weapon-profile'));
      await page.keyboard.press('Escape');await page.waitForSelector('dialog[open] .v1-reference-article');
      await page.getByRole('link',{name:'Open full entry',exact:true}).click();await page.waitForSelector('main .v1-reference-article');
      assert.deepEqual(await observe(page,'main .v1-reference-article'),contributionPopup,'Enhancement article omitted its supplied weapon');
    }

    step=prefix+'/personal-import';await page.evaluate(()=>window.ArmyBookAppV2.openRoster());
    await page.locator('[data-roster-input="raw-text"]').fill(book.text);await page.locator('[data-roster-action="review-import"]').click();
    await page.waitForFunction(()=>window.ArmyBookAppV2.roster.state?.units?.length===2);
    assert.equal(await page.locator('[data-roster-bindings] select').count(),0,'Import requires manual reconstruction');
    await page.locator('[data-roster-action="open-personal-guide"]').click();await page.waitForFunction(()=>new URLSearchParams(location.search).has('roster'));
    const personalBase=page.url();await page.evaluate(()=>window.ArmyBookAppV2.openGlossary());await search('Bodyguard','core-bodyguard');
    const personalLink=page.locator('main .v2-glossary-result[data-target-id="core-bodyguard"]');
    assert.equal(await personalLink.getAttribute('href'),referenceUrl(book,'core-bodyguard',personalBase));
    const [personalTab]=await Promise.all([context.waitForEvent('page'),personalLink.click({modifiers:['Control']})]);await ready(personalTab);
    assertFacts(book,'core-bodyguard',await observe(personalTab,'main .v1-reference-article'));
    assert.ok(new URL(personalTab.url()).searchParams.has('roster'),'Personal reference dropped roster context');
    const ownerLink=personalTab.locator(`main .reference-links a[data-target-id="${definitionId}"]`);assert.equal(await ownerLink.count(),1,'Personal Core owner link hidden by roster membership');
    await ownerLink.click();await personalTab.waitForSelector('dialog[open] .v1-reference-article');assertFacts(book,definitionId,await observe(personalTab,'dialog[open] .v1-reference-article'));
    await personalTab.getByRole('link',{name:'Open full entry',exact:true}).click();await personalTab.waitForSelector(`main .v1-reference-article[data-card-id="${definitionId}"]`);
    await personalTab.reload();await ready(personalTab);assertFacts(book,definitionId,await observe(personalTab,'main .v1-reference-article'));await personalTab.close();
    await personalLink.click();await page.waitForSelector('dialog[open] .v1-reference-article');assertFacts(book,'core-bodyguard',await observe(page,'dialog[open] .v1-reference-article'));
    await page.keyboard.press('Escape');await page.waitForSelector('dialog[open]',{state:'hidden'});assert.equal(await page.getByRole('searchbox',{name:'Search glossary',exact:true}).inputValue(),'Bodyguard');
    if(screenshots)await page.screenshot({path:path.join(screenshots,`reference-${book.id}-${device}-personal-catalog.png`),fullPage:true});

    step=prefix+'/unavailable-roster-reference-scope';
    const lostRoster=new URL(origin+book.app);lostRoster.searchParams.set('roster','unavailable-roster-19734');
    await page.goto(referenceUrl(book,'core-bodyguard',lostRoster));await ready(page);
    assertFacts(book,'core-bodyguard',await observe(page,'main .v1-reference-article'));
    const excluded=book.payload.glossary.entries.find(entry=>entry.category==='ENHANCEMENT');
    await page.goto(referenceUrl(book,excluded.targetId,lostRoster));await ready(page);await page.waitForSelector('main .v2-not-found');
    assert.match(await page.locator('main .v2-not-found').innerText(),/Imported roster context is unavailable/);
    assert.equal(await page.locator('main .v1-reference-article').count(),0,'Missing personal scope expanded to the full book');

    step=prefix+'/not-found-contrast';await page.goto(referenceUrl(book,'unknown-reference-19734'));await ready(page);await page.waitForSelector('main .v2-not-found');
    minContrast=Math.min(minContrast,await contrast(page,'main .v2-not-found'));assert.doesNotMatch(await page.locator('main .v2-not-found').innerText(),noInternal);
    if(screenshots)await page.screenshot({path:path.join(screenshots,`reference-${book.id}-${device}-not-found.png`)});
    assert.deepEqual(errors,[],prefix+' runtime errors');assert.deepEqual(unexpected,[],'Unexpected runtime dependencies');
    results.push({book:book.id,device,viewport,...book.census,sampledReferences:samples,minContrast:Number(minContrast.toFixed(2)),
      popupArticleParity:'PASS',inheritedCore:'PASS',nativeLinksAndHistory:'PASS',personalCoreNewTab:'PASS',
      categoryPersistence:'PASS',closeEscapeBackdropFocus:'PASS',nativeWeaponStats:'PASS',
      contributedWeapon:book.contribution?'PASS':'NOT_APPLICABLE',unavailableRosterScope:'PASS',
      articleGlossaryReturn:'PASS',runtimeErrors:0});
    console.log(JSON.stringify(results.at(-1)));await context.close();activePage=null;
  }
  for(const [relative,bytes]of originals)assert.deepEqual(fs.readFileSync(path.join(repo,relative)),bytes,'Browser modified source projection '+relative);
  console.log(JSON.stringify({status:'PASS',results,freshLoopbackServer:true,unexpectedDependencies:unexpected,requests:requests.length}));
}catch(error){
  console.error('Reference browser QA failed at '+step);
  if(activePage&&screenshots)await activePage.screenshot({path:path.join(screenshots,'reference-browser-failure.png'),fullPage:true}).catch(()=>{});
  throw error;
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}

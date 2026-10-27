/** Current canonical CSM source facts are the independent normal-book oracle. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import {validateGlossary,searchGlossary} from '../../shared/army-book-app-v2/glossary.mjs';
const {chromium}=createRequire(import.meta.url)('playwright');
const root=fileURLToPath(new URL('../../../',import.meta.url));
const facts=JSON.parse(fs.readFileSync(new URL('./generated/effective.json',import.meta.url),'utf8'));
const payload=JSON.parse(fs.readFileSync(new URL('./generated/app-presentation.json',import.meta.url),'utf8'));
const snapshot=JSON.stringify(facts),index=new Map(facts.entities.map(e=>[e.id,e]));
const cards=new Map(payload.cards.map(e=>[e.id,e]));
const glossary=validateGlossary(payload.glossary,payload.cards);assert.equal(glossary.unresolvedTargets+glossary.unresolvedAliases,0);
assert.ok(searchGlossary(payload.glossary,'Dark Pacts').some(e=>e.targetId==='army-rule-dark-pacts'));
assert.equal(new Set(payload.ruleContractIds).size,315);
const requests=[],errors=[];
const mime={'.html':'text/html','.mjs':'text/javascript','.js':'text/javascript','.css':'text/css','.json':'application/json','.webp':'image/webp','.png':'image/png','.svg':'image/svg+xml','.jpg':'image/jpeg','.webmanifest':'application/manifest+json'};
const server=http.createServer((req,res)=>{
  const pathname=decodeURIComponent(new URL(req.url,'http://local').pathname);requests.push(pathname);
  const file=path.resolve(root,'.'+pathname);
  if(!file.startsWith(root)||/\/books\/chaos-space-marines\/(?!v2\/|assets\/)/.test(pathname)) {res.writeHead(403);res.end();return;}
  if(!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end();return;}
  res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');res.end(fs.readFileSync(file));
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const origin=`http://127.0.0.1:${server.address().port}`,url=origin+'/v2/app.html?v2=ARMY_BOOK&registry=chaos-space-marines';
const out=path.join(root,'tmp/chaos-space-marines-v2-army-book');fs.mkdirSync(out,{recursive:true});
const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE}:{})});
const expectedFactIds=entity=>{
  const keys={MODEL_PROFILE:['stats'],WEAPON_PROFILE:['name','range','attacks','skill','strength','ap','damage','abilities'],
    DATASHEET_ABILITY:['text'],EQUIPMENT_ABILITY:['text'],WARGEAR_OPTION:['text'],UNIT_COMPOSITION:['equipmentAndRules'],
    COMPOSITION_MEMBER:['sourceText'],ATTACHMENT_DECLARATION:['blocks'],TRANSPORT_DECLARATION:['blocks'],SPECIAL_DATASHEET_RULE:['blocks'],
    UPGRADE_DECLARATION:['blocks'],UPGRADE_OPTION:['text'],NAMED_RULE_COMPONENT:['text'],CORE_ABILITY_MEMBERSHIP:['label'],ARMY_RULE_MEMBERSHIP:['label']};
  const result=[];function walk(value,p){if(Array.isArray(value))value.forEach((v,i)=>walk(v,p+'/'+i));else if(value&&typeof value==='object')for(const[k,v]of Object.entries(value)){if(k!=='wargearAbility')walk(v,p+'/'+k);}else result.push(entity.id+'::'+p);}
  for(const key of keys[entity.kind]||[])if(entity.data[key]!==undefined)walk(entity.data[key],'/'+key);return result;
};
const belongs=(entity,owner)=>{while(entity){if(entity.id===owner)return true;entity=index.get(entity.ownerId);}return false;};
const totals={};
const dgMega=`+ FACTION KEYWORD: Chaos - Death Guard
+ DETACHMENT: Paragons of Putrescence, Virulent Vectorium (Hypervirulent Strains)
+ ENHANCEMENT: Furnace of Plagues (on Char1: Lord of Contagion)
Char1: 1x Lord of Contagion (135 pts): Manreaper
Enhancement: Furnace of Plagues (+25 pts)
3x Deathshroud Terminators (150 pts)
• 1x Deathshroud Terminator Champion: Manreaper, Plaguespurt gauntlet
• 2x Deathshroud Terminator: 2 with Manreaper, Plaguespurt gauntlet`;
try{
  for(const [device,viewport]of [['desktop',{width:1440,height:1000}],['phone',{width:390,height:844}]]){
    const context=await browser.newContext({viewport}),page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
    page.on('response',res=>{if(res.status()>=400)errors.push(res.status()+' '+res.url());});
    await page.goto(origin+'/v2/app.html');await page.locator('[data-v2-book="chaos-space-marines"]').first().click();
    await page.waitForFunction(()=>window.ArmyBookAppV2?.payload.book.id==='chaos-space-marines');
    await page.screenshot({path:path.join(out,device+'-landing.png')});
    await page.locator('[data-v2-primary-nav] [data-v2-destination="ROSTER"]').click();
    await page.getByRole('heading',{name:'Attachment Setup',exact:true}).waitFor();
    assert.equal(await page.evaluate(()=>window.ArmyBookAppV2.payload.book.id),'chaos-space-marines');
    assert.equal(await page.locator('textarea').count(),1);
    await page.goBack();await page.waitForFunction(()=>window.ArmyBookAppV2?.payload.book.id==='chaos-space-marines');
    for(const address of [url,origin+'/v2/app.html?v2=ARMY_BOOK&book=chaos-space-marines&registry=chaos-space-marines']){
      const direct=await context.newPage();await direct.goto(address);await direct.waitForFunction(()=>window.ArmyBookAppV2?.payload.book.id==='chaos-space-marines');
      await direct.reload();await direct.waitForFunction(()=>window.ArmyBookAppV2?.payload.book.id==='chaos-space-marines');await direct.close();
    }
    const seenProfiles=new Set(),seenWeapons=new Set(),seenFacts=new Set();
    for(const unit of facts.entities.filter(e=>e.kind==='DATASHEET')){
      await page.evaluate(id=>window.ArmyBookAppV2.open(id),unit.id);
      const view=await page.locator('main').evaluate(main=>({root:main.querySelector('.unit-card')?.dataset.cardId,
        profiles:[...main.querySelectorAll('.model-profile')].map(n=>n.dataset.cardId),
        weapons:[...main.querySelectorAll('.weapon-row:not(.weapon-head)')].map(n=>n.dataset.cardId),
        facts:[...main.querySelectorAll('[data-fact-id]')].map(n=>n.dataset.factId),text:main.innerText,
        overflow:document.documentElement.scrollWidth>innerWidth+1}));
      assert.equal(view.root,unit.id);assert.equal(view.overflow,false,device+' overflow '+unit.id);
      assert.deepEqual(view.profiles.sort(),[...unit.data.modelProfileIds].sort(),device+' model profiles '+unit.id);
      assert.deepEqual(view.weapons.sort(),[...unit.data.weaponProfileIds].sort(),device+' weapons '+unit.id);
      // One canonical keyword membership may contribute to several explicitly
      // labelled MODEL scopes; those are distinct presentation facts.
      const unscopedFacts=view.facts.filter(id=>!['KEYWORD_MEMBERSHIP','FACTION_KEYWORD'].includes(index.get(id.split('::')[0])?.kind));
      assert.equal(new Set(unscopedFacts).size,unscopedFacts.length,device+' duplicated canonical facts '+unit.id);
      const captions=await page.locator('main .ds-rule-reference-label').allTextContents();
      assert.equal(new Set(captions).size,captions.length,device+' duplicated reference category '+unit.id);
      assert.doesNotMatch(view.text,/undefined|\[object Object\]|Active roster effects|Effective unit keywords|AUTHORITATIVE_CURRENT|ACCEPTED_SECONDARY|sourceEntityId|datasetVersion/);
      for(const e of facts.entities.filter(e=>belongs(e,unit.id)))for(const id of expectedFactIds(e))assert.ok(view.facts.includes(id),device+' missing '+id);
      view.profiles.forEach(id=>seenProfiles.add(id));view.weapons.forEach(id=>seenWeapons.add(id));view.facts.forEach(id=>seenFacts.add(id));
      if(['unit-legionaries','unit-dark-commune'].includes(unit.id))await page.screenshot({path:path.join(out,device+'-'+unit.id+'.png'),fullPage:true});
      if(unit.id==='unit-dark-commune')assert.deepEqual(await page.locator('main .ds-cost-tier').allTextContents(),['Units 1–2','Units 3+']);
    }
    assert.equal(seenProfiles.size,60);assert.equal(seenWeapons.size,315);
    for(const entity of facts.entities.filter(e=>['DETACHMENT','ARMY_RULE'].includes(e.kind))){
      await page.evaluate(id=>window.ArmyBookAppV2.open(id),entity.id);
      const view=await page.locator('main').evaluate(main=>({ids:[...main.querySelectorAll('[data-card-id]')].map(n=>n.dataset.cardId),facts:[...main.querySelectorAll('[data-fact-id]')].map(n=>n.dataset.factId),overflow:document.documentElement.scrollWidth>innerWidth+1,text:main.innerText}));
      assert.equal(view.overflow,false,device+' overflow '+entity.id);
      for(const e of facts.entities.filter(e=>belongs(e,entity.id))){
        if(['ENHANCEMENT','STRATAGEM','DETACHMENT_RULE'].includes(e.kind))assert.ok(view.ids.includes(e.id),'Missing rule '+e.id);
        if(e.kind==='DETACHMENT_RULE')for(const [i,b]of e.data.content.entries())if(typeof b.text==='string')assert.ok(view.facts.includes(e.id+`::/content/${i}/text`),'Missing Detachment source '+e.id+'/'+i);
        if(e.kind==='ARMY_RULE')for(const [i,b]of e.data.blocks.entries())assert.ok(view.facts.includes(e.id+`::/blocks/${i}/text`),'Missing Army Rule source');
        if(e.kind==='STRUCTURED_RULE_TABLE')for(const [i,row]of e.data.rows.entries())for(const [j,v]of row.entries())assert.ok(view.facts.includes(e.id+`::/rows/${i}/${j}`),'Missing table cell');
      }
      if(entity.id==='detachment-creations-of-bile')await page.screenshot({path:path.join(out,device+'-detachment.png'),fullPage:true});
      if(entity.id==='detachment-creations-of-bile')assert.equal(await page.locator('main img[alt^="Die face"]').evaluateAll(images=>images.filter(image=>image.complete&&image.naturalWidth>0).length),6);
    }
    for(const entity of facts.entities.filter(e=>['FAQ','OFFICIAL_UPDATE','ERRATA'].includes(e.kind)&&!e.factOwnerId)){
      await page.evaluate(id=>window.ArmyBookAppV2.open(id),entity.id);
      for(const field of cards.get(entity.id).fields)assert.equal(await page.locator('main [data-fact-id]').evaluateAll((nodes,id)=>nodes.filter(node=>node.dataset.factId===id).length,field.id),1,'Source update missing/duplicated '+field.id);
    }
    await page.evaluate(()=>window.ArmyBookAppV2.open('unit-legionaries'));
    await page.locator('main .weapon-row:not(.weapon-head) a').first().click();
    await page.locator('dialog.v2-detail-dialog[open]').waitFor();
    assert.ok((await page.locator('dialog.v2-detail-dialog[open]').innerText()).length>30);await page.keyboard.press('Escape');
    await page.getByRole('button',{name:/Compatible Stratagems/}).first().click();await page.locator('dialog[open]').waitFor();
    assert.ok((await page.locator('dialog[open]').innerText()).length>100);await page.keyboard.press('Escape');
    await page.evaluate(()=>window.ArmyBookAppV2.openGlossary());await page.reload();
    await page.waitForFunction(()=>window.ArmyBookAppV2?.payload.book.id==='chaos-space-marines');
    assert.match(await page.locator('main').innerText(),/Glossary/);
    await page.getByRole('searchbox',{name:'Search glossary'}).fill('Dark Pacts');
    const darkPacts=page.locator('main .v2-glossary-result[data-target-id="army-rule-dark-pacts"]');
    assert.equal(await darkPacts.count(),1);await darkPacts.click();await page.locator('dialog.v2-detail-dialog[open]').waitFor();
    assert.match(await page.locator('dialog.v2-detail-dialog[open]').innerText(),/Dark Pacts/i);await page.keyboard.press('Escape');
    await page.evaluate(()=>window.ArmyBookAppV2.open('core-leader'));await page.reload();
    await page.waitForFunction(()=>window.ArmyBookAppV2?.payload.book.id==='chaos-space-marines');
    assert.match(await page.locator('main').innerText(),/Leader/i);
    const newPage=await context.newPage();await newPage.goto(page.url());await newPage.waitForFunction(()=>window.ArmyBookAppV2);assert.match(await newPage.locator('main').innerText(),/Leader/i);await newPage.close();
    await page.goBack();await page.goForward();
    await page.evaluate(()=>{window.csmTestShell=window.WarhammerAppV2;window.csmOldModule=window.WarhammerAppV2.activeModule;});
    for(const book of ['death-guard','adeptus-mechanicus','core-rules','chaos-space-marines']){
      await page.evaluate(async book=>{
        const shell=window.WarhammerAppV2,previous=shell.activeModule;
        await shell.navigate(book==='core-rules'?{destination:'CORE_RULES',registryId:book}:{destination:'ARMY_BOOK',bookId:book,registryId:book});
        if(!previous.destroyed)throw new Error('Previous module was not destroyed');
        if(window.WarhammerAppV2!==window.csmTestShell)throw new Error('Shell was replaced');
      },book);
      if(book==='core-rules')assert.match(await page.frameLocator('iframe.v2-core-reader').locator('body').innerText(),/Core Rules/i);
      else await page.waitForFunction(id=>window.ArmyBookAppV2?.payload.book.id===id,book);
      if(book==='death-guard'){
        assert.equal(await page.evaluate(text=>window.ArmyBookAppV2.roster.import(text).status,dgMega),'READY');
        await page.evaluate(()=>{const app=window.ArmyBookAppV2;app.roster.attach('parsed-unit-1','parsed-unit-2');app.rosterPanel.refresh();app.openPersonalGuide();app.openInstance('parsed-unit-1');});
        const lord=page.locator('main .unit-card[data-roster-instance-id="parsed-unit-1"]');assert.match(await lord.innerText(),/Feel No Pain\s*4\+/i);
        for(const [weapon,stat,value]of [[1,'attacks','6'],[1,'strength','10'],[2,'attacks','11'],[2,'strength','7']]){
          assert.equal(await lord.locator(`[data-fact-id="datasheet-lord-of-contagion:weapon:${weapon}::/${stat}"]`).getAttribute('data-fact-value'),JSON.stringify(value));
        }
        await page.evaluate(()=>window.ArmyBookAppV2.openInstance('parsed-unit-2'));
        assert.doesNotMatch(await page.locator('main .unit-card[data-roster-instance-id="parsed-unit-2"]').innerText(),/Devastating Wounds/i);
        await page.evaluate(()=>{const app=window.ArmyBookAppV2;app.roster.detach('parsed-unit-1');app.rosterPanel.refresh();app.openInstance('parsed-unit-1');});
        assert.doesNotMatch(await lord.innerText(),/Feel No Pain\s*4\+/i);
        await page.evaluate(()=>{const app=window.ArmyBookAppV2;app.roster.attach('parsed-unit-1','parsed-unit-2');app.rosterPanel.refresh();app.openInstance('parsed-unit-1');});
        assert.match(await lord.innerText(),/Feel No Pain\s*4\+/i);
      }
      assert.equal(await page.locator('link[href*="chaos-space-marines/v2/theme.css"]').count(),book==='chaos-space-marines'?1:0);
    }
    assert.equal(await page.evaluate(()=>window.csmOldModule.destroyed),true);
    assert.equal(await page.evaluate(()=>!!window.ArmyBookAppV2.roster),true);
    totals[device]={datasheets:54,profiles:seenProfiles.size,weapons:seenWeapons.size,facts:seenFacts.size};await context.close();
  }
  assert.deepEqual(errors,[]);assert.equal(JSON.stringify(facts),snapshot);
  fs.writeFileSync(path.join(out,'browser-result.json'),JSON.stringify({status:'PASS',totals,requests:[...new Set(requests)],errors},null,2)+'\n');
  console.log(JSON.stringify({status:'PASS',totals,screenshots:out}));
}finally{await browser.close();await new Promise(r=>server.close(r));}

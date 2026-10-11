/** Real imported, source-legal formed units on the shared presentation surface.
 * CSM is rendered in a test-only harness: no Personal Guide is connected. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import {execFileSync} from 'node:child_process';

const repo=fileURLToPath(new URL('../../../',import.meta.url));
const out=process.env.ARMY_APP_V2_SCREENSHOTS||'E:/Warhammer/qa-artifacts/formed-units-9a952c7c';
fs.mkdirSync(out,{recursive:true});
const read=name=>JSON.parse(fs.readFileSync(path.join(repo,name),'utf8'));
const payloads=new Map(['death-guard','adeptus-mechanicus','chaos-space-marines'].map(army=>[army,read(`books/${army}/v2/generated/app-presentation.json`)]));
const fixtureFile=read('books/chaos-space-marines/v2/roster-attachment-fixtures.json').fixtures;
const fixtures=[{id:'dg-lord-deathshroud',army:'death-guard',bodyguard:2,participants:[1],text:`+ FACTION KEYWORD: Chaos - Death Guard
+ DETACHMENT: Paragons of Putrescence, Virulent Vectorium
Char1: 1x Lord of Contagion (135 pts): Manreaper
Enhancement: Furnace of Plagues (+25 pts)
3x Deathshroud Terminators (150 pts)
• 1x Deathshroud Terminator Champion: Manreaper, Plaguespurt gauntlet
• 2x Deathshroud Terminator: 2 with Manreaper, Plaguespurt gauntlet`},
{id:'am-character-support-rangers',army:'adeptus-mechanicus',bodyguard:3,participants:[1,2],text:`+ FACTION KEYWORD: Imperium - Adeptus Mechanicus
+ DETACHMENT: Haloscreed Battle Clade, Eradication Cohort
Char1: 1x Tech-priest Dominus (0 pts): Volkite blaster, Macrostubber, Omnissian axe
Enhancement: Cognitive Reinforcement (+0 pts)
Char2: 1x Skitarii Marshal (0 pts): Mechanicus pistol, Control stave
Enhancement: Omnicogitator (+0 pts)
10x Skitarii Rangers (0 pts)
• 1x Skitarii Ranger Alpha: Galvanic rifle, Close combat weapon
• 9x Skitarii Ranger: 9 with Galvanic rifle, Close combat weapon
Char3: 1x Tech-priest Dominus (0 pts): Eradication ray, Phosphor serpenta, Omnissian axe`},
...['duplicate-leader-support-ownership','mixed-profile-components'].map(id=>({id:'csm-'+id,army:'chaos-space-marines',
  text:fixtureFile.find(f=>f.id===id).text,bodyguard:id.startsWith('duplicate')?5:2,participants:id.startsWith('duplicate')?[1,3]:[1]}))];
const changed=['books/shared/army-book-app-v2/personal.mjs','books/shared/army-book-app-v2/runtime.mjs',
  'books/shared/army-book-app-v2/styles.css','books/shared/roster-v2/runtime.mjs'];
const baseline=new Map(changed.map(file=>['/'+file,execFileSync('git',['show','9a952c7c6e0d866677eb48897b5a4b32bc207682:'+file],{cwd:repo,maxBuffer:8e6})]));
const mime={'.mjs':'text/javascript','.js':'text/javascript','.json':'application/json','.css':'text/css','.html':'text/html','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.woff2':'font/woff2'};
const server=http.createServer((request,response)=>{
  const requested=decodeURIComponent(new URL(request.url,'http://localhost').pathname),old=requested.startsWith('/baseline/');
  const address=old?requested.slice('/baseline'.length):requested,file=path.resolve(repo,'.'+address);
  if(!file.startsWith(path.resolve(repo)+path.sep)||!fs.existsSync(file)||fs.statSync(file).isDirectory()){response.writeHead(404);response.end();return;}
  response.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');
  const army=[...payloads.keys()].find(name=>address===`/books/${name}/v2/generated/app-presentation.json`);
  response.end(army?JSON.stringify(payloads.get(army)):old&&baseline.has(address)?baseline.get(address):fs.readFileSync(file));
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const origin=`http://127.0.0.1:${server.address().port}`;
const {chromium}=createRequire(import.meta.url)('playwright');
const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE||'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const errors=[],results=[],screenshots=[],normal=[];
const ready=async page=>{await page.waitForFunction(()=>!!window.ArmyBookAppV2);if(await page.evaluate(()=>!!window.ArmyBookAppV2.rosterPanel))await page.evaluate(()=>window.ArmyBookAppV2.rosterPanel.ready);};
const settle=async page=>{await page.evaluate(async()=>{
  await document.fonts.ready;await Promise.all([...document.images].map(image=>image.decode().catch(()=>{})));
  const prefix=location.pathname.startsWith('/baseline/')?'/baseline':'';
  const {flushDatasheetLayouts}=await import(prefix+'/books/shared/army-book-app-v2/datasheet-v1-layout.mjs');
  flushDatasheetLayouts(document.querySelector('main'));
});await page.waitForTimeout(80);};
async function install(page,fixture){
  return page.evaluate(async f=>{
    let service,book,attach,detach;
    if(f.army==='chaos-space-marines'){
      const {loadRosterRuntime}=await import('/books/chaos-space-marines/v2/roster-runtime.mjs');
      const {projectEffectiveInstance}=await import('/books/shared/roster-v2/effective-instance.mjs');
      const {bindFixtureAbilityPresentation}=await import('/books/shared/army-book-app-v2/formed-unit-fixture-payload.mjs');
      const runtime=await loadRosterRuntime();book=await (await fetch('/books/chaos-space-marines/v2/generated/roster-runtime.json')).json();
      service={get state(){return runtime.state;},effective:id=>bindFixtureAbilityPresentation(
        projectEffectiveInstance(book,runtime.projection,id),window.ArmyBookAppV2.payload)};
      const imported=runtime.import(f.text);if(imported.status!=='READY')throw new Error('CSM import '+imported.status);
      attach=id=>runtime.attach('parsed-unit-'+f.bodyguard,id);detach=id=>runtime.detach(id);
      window.formedQA={runtime,service,attach,detach};
    }else{
      service=window.ArmyBookAppV2.roster;const imported=service.import(f.text);if(imported.status!=='READY')throw new Error('Import '+imported.status);
      attach=id=>service.attach(id,'parsed-unit-'+f.bodyguard);detach=id=>service.detach(id);
      window.formedQA={runtime:service,service,attach,detach};
    }
    for(const ordinal of f.participants)attach('parsed-unit-'+ordinal);
    window.formedQA.fixture=f;
    window.formedQA.before=JSON.stringify({state:service.state,projection:window.formedQA.runtime.projection});
    return {members:service.effective('parsed-unit-'+f.bodyguard).formedUnit.memberInstanceIds};
  },fixture);
}
async function render(page,instanceId){
  await page.evaluate(async id=>{
    const {service,fixture:f}=window.formedQA;
    if(f.army!=='chaos-space-marines'){window.ArmyBookAppV2.openInstance(id);return;}
    // The real CSM runtime stays unmounted. Exercise the same generic renderer
    // with its existing effective projection, without creating a CSM guide.
    const {projectFormedUnitCards}=await import('/books/shared/army-book-app-v2/personal.mjs');
    const {renderFormedUnit}=await import('/books/shared/army-book-app-v2/formed-unit-presentation.mjs');
    const {createDatasheetPresenter}=await import('/books/shared/army-book-app-v2/datasheet-v1.mjs');
    const {installDatasheetLayout}=await import('/books/shared/army-book-app-v2/datasheet-v1-layout.mjs');
    window.formedQA.layouts?.forEach(layout=>layout.destroy());
    const {prepareCSMFormedFixturePayload}=await import('/books/shared/army-book-app-v2/formed-unit-fixture-payload.mjs');
    const book=await(await fetch('/books/chaos-space-marines/v2/generated/roster-runtime.json')).json();
    const payload=prepareCSMFormedFixturePayload(window.ArmyBookAppV2.payload,book),cards=new Map(payload.cards.map(card=>[card.id,card]));
    const el=(tag,classes='',text)=>{const node=document.createElement(tag);node.className=classes;if(text!==undefined)node.textContent=text;return node;};
    const factValue=(tag,field)=>{const node=el(tag,'v2-field-value',typeof field.value==='object'?JSON.stringify(field.displayValue??field.value):String(field.displayValue??field.value));node.dataset.factId=field.id;node.dataset.factValue=JSON.stringify(field.value);return node;};
    const anchor=(text,id,detail,context)=>{const node=el('a','',text);node.dataset.targetId=id;node.href=window.ArmyBookAppV2.routeURL(id,detail,context);return node;};
    const presenter=createDatasheetPresenter({document,payload,cards,el,factValue,anchor,related:()=>el('div'),roster:service,navigateSection:()=>{}});
    const view=projectFormedUnitCards(cards,service,id),root=renderFormedUnit(view,{el,renderComponent:component=>
      presenter.renderDatasheet(component.card,{variants:component.variants,instanceId:component.unit.instanceId})});
    document.querySelector('main').replaceChildren(root);document.body.classList.add('v2-datasheet-mode');
    window.formedQA.layouts=[...root.matches('.unit-card')?[root]:root.querySelectorAll('.unit-card')].map(node=>installDatasheetLayout(node));
    await Promise.all(window.formedQA.layouts.map(layout=>layout.ready()));
  },instanceId);await settle(page);
}
async function inspect(page){return page.evaluate(()=>{
  const {service}=window.formedQA,main=document.querySelector('main');
  const components=[...main.querySelectorAll('.unit-card')].map(root=>{
    const id=root.dataset.rosterInstanceId,effective=service.effective(id),unit=service.state.units.find(unit=>unit.instanceId===id);
    return {id,title:root.querySelector('h3').textContent,text:root.innerText,
      composition:[...root.querySelectorAll('.ds-composition-member')].map(line=>({id:line.dataset.canonicalProfileId,text:line.textContent})),
      weapons:[...root.querySelectorAll('.weapon-row:not(.weapon-head)')].map(row=>({id:row.dataset.cardId,owner:row.dataset.rosterInstanceId,text:row.innerText,
        values:Object.fromEntries([...row.querySelectorAll('[data-label]')].map(cell=>[cell.dataset.label,cell.querySelector('.ds-effective-value').textContent])),
        scopes:row.dataset.weaponScopes?JSON.parse(row.dataset.weaponScopes):[[row.dataset.cardId,row.dataset.compositionId||null]]})),
      profiles:[...root.querySelectorAll('.ds-effective-profile-group,.model-profile')]
        .filter(row=>row.matches('.ds-effective-profile-group')||!row.closest('.ds-effective-profile-group'))
        .flatMap(row=>row.dataset.profileScopes?JSON.parse(row.dataset.profileScopes).map(([profile,scope])=>({id:profile,scope,owner:id})):
          [{id:row.dataset.cardId,scope:row.dataset.compositionId,owner:row.dataset.rosterInstanceId}]),
      statlines:root.querySelectorAll('.statline').length,
      stats:[...root.querySelectorAll('.statline')].map(line=>Object.fromEntries([...line.querySelectorAll('.stat')].map(stat=>[stat.querySelector('b').textContent,stat.querySelector('.v2-field-value').textContent]))),
      selectedIds:[...new Set([...root.querySelectorAll('[data-selected-canonical-ids]')].flatMap(line=>JSON.parse(line.dataset.selectedCanonicalIds)))].sort(),
      expectedSelectedIds:[...new Set([...(unit.selections||[]),...unit.modelRows.flatMap(row=>[...(row.selections||[]),...(row.loadouts||[]).flatMap(loadout=>loadout.selections||[])])]
        .filter(selection=>selection.physicalQuantity>0).flatMap(selection=>[...(selection.canonicalProfileIds||[]),...(selection.canonicalEquipmentIds||[])]))].sort(),
      effectiveWeapons:effective.weapons.map(w=>({id:w.id,scope:w.scopeId||null})),
      expectedProfiles:effective.profiles.map(p=>({id:p.id,scope:p.scopeId,owner:p.ownerInstanceId,quantity:p.quantity})),
      abilityNodes:[...root.querySelectorAll('.ability-list')].map(list=>list.textContent).join('\n'),
      sharedRuleIds:[...root.querySelectorAll('.shared-abilities [data-target-id]')].map(link=>link.dataset.targetId),
      enhancementIds:service.state.units.find(u=>u.instanceId===id).enhancementIds,
      presentedEnhancements:[...root.querySelectorAll('.ds-roster-context [data-target-id]')].map(node=>node.dataset.targetId),
      links:[...root.querySelectorAll('.weapon-button[data-target-id]')].map(link=>({id:link.dataset.targetId,popup:JSON.parse(link.dataset.popupIdentity)}))};
  });
  return {components,overflow:document.documentElement.scrollWidth>innerWidth+1,
    immutable:window.formedQA.before===JSON.stringify({state:service.state,projection:window.formedQA.runtime.projection}),
    ids:[...main.querySelectorAll('[id]')].map(node=>node.id)};
});}
function check(actual,memberIds){
  assert.deepEqual(actual.components.map(c=>c.id).sort(),[...memberIds].sort());assert.equal(actual.overflow,false);assert.equal(actual.immutable,true);
  assert.equal(new Set(actual.ids).size,actual.ids.length,'Unique section anchors for every physical component');
  for(const c of actual.components){
    assert.ok(c.statlines>0);assert.ok(c.composition.length);assert.ok(c.abilityNodes.trim());
    assert.deepEqual(c.selectedIds,c.expectedSelectedIds,'Complete selected equipment and weapon inventory in composition');
    assert.deepEqual(c.presentedEnhancements,c.enhancementIds);
    assert.deepEqual(c.profiles.map(p=>[p.id,p.scope,p.owner]).sort(),c.expectedProfiles.map(p=>[p.id,p.scope,p.owner]).sort());
    assert.deepEqual(c.weapons.flatMap(w=>w.scopes).sort(),c.effectiveWeapons.map(w=>[w.id,w.scope]).sort(),'All and only exact effective weapon scopes');
    assert.ok(c.weapons.every(w=>w.owner===c.id));assert.ok(c.links.every(link=>link.popup[1]===c.id));
    assert.equal(new Set(c.weapons.map(w=>JSON.stringify([w.id,w.scopes]))).size,c.weapons.length);
    assert.doesNotMatch(c.text,/Active roster effects|Effective unit keywords|\[object Object\]|undefined/);
  }
}
try{
  for(const [device,viewport]of [['desktop',{width:1440,height:1000}],['phone',{width:390,height:844}]]){
    for(const fixture of fixtures){
      console.log(JSON.stringify({phase:'formed',device,fixture:fixture.id}));
      const context=await browser.newContext({viewport,reducedMotion:'reduce'}),page=await context.newPage();
      page.on('pageerror',error=>errors.push({fixture:fixture.id,device,error:error.message}));
      await page.goto(origin+`/v2/app.html?v2=ARMY_BOOK&registry=${fixture.army}`);await ready(page);
      const {members}=await install(page,fixture),bodyguard='parsed-unit-'+fixture.bodyguard;
      await render(page,bodyguard);const attached=await inspect(page);check(attached,members);
      if(fixture.army==='death-guard'){
        const lord=attached.components.find(c=>c.id==='parsed-unit-1'),guard=attached.components.find(c=>c.id===bodyguard);
        assert.deepEqual(lord.stats,[{M:'5"',T:'7',SV:'2+',W:'6',LD:'6+',OC:'1',INV:'4+'}]);
        assert.match(lord.abilityNodes,/Vector of Disease/);assert.match(lord.abilityNodes,/Unholy Resilience/);assert.match(lord.abilityNodes,/Feel No Pain 4\+/);
        assert.ok(lord.weapons.some(w=>w.values.A==='6'&&w.values.S==='10'));
        assert.ok(lord.weapons.some(w=>w.values.A==='11'&&w.values.S==='7'));
        assert.ok(lord.weapons.every(w=>/DEVASTATING WOUNDS/i.test(w.text)));
        assert.ok(guard.weapons.every(w=>!/DEVASTATING WOUNDS/i.test(w.text)));
        assert.equal(guard.statlines,1);assert.equal(guard.composition.length,2);
      }
      if(fixture.army==='chaos-space-marines')for(const component of attached.components)
        assert.equal(component.sharedRuleIds.filter(id=>id==='army-rule-dark-pacts').length,1,'Canonical Army membership stays on one existing presentation surface');
      const file=path.join(out,device+'-'+fixture.id+'.png');await page.screenshot({path:file,fullPage:true});screenshots.push(file);
      if(fixture.army!=='chaos-space-marines'){
        for(const c of attached.components){
          const selector=`main .unit-card[data-roster-instance-id="${c.id}"] .weapon-button`;
          await page.locator(selector).first().click();await page.waitForSelector('dialog.v2-detail-dialog[open]');
          const popup=page.locator('dialog.v2-detail-dialog[open]');assert.equal(await popup.locator('[data-roster-instance-id]').first().getAttribute('data-roster-instance-id'),c.id);
          await page.keyboard.press('Escape');
        }
      }
      const participant='parsed-unit-'+fixture.participants[0];
      await page.evaluate(id=>{window.formedQA.detach(id);window.formedQA.before=JSON.stringify({state:window.formedQA.service.state,projection:window.formedQA.runtime.projection});},participant);
      await render(page,bodyguard);check(await inspect(page),members.filter(id=>id!==participant));
      await render(page,participant);check(await inspect(page),[participant]);
      await page.evaluate(id=>{window.formedQA.attach(id);window.formedQA.before=JSON.stringify({state:window.formedQA.service.state,projection:window.formedQA.runtime.projection});},participant);
      await render(page,bodyguard);const restored=await inspect(page);check(restored,members);assert.deepEqual(restored,attached,'Deterministic remove/restore DOM content');
      if(fixture.army!=='chaos-space-marines'){
        await page.evaluate(()=>window.ArmyBookAppV2.open('nav:army-rules'));await settle(page);
        const contents=await page.evaluate(members=>members.map(id=>{
          const targets=[...document.querySelectorAll('main [data-contents-target]')].filter(node=>node.dataset.contentsTarget==='roster-unit/'+encodeURIComponent(id));
          return {id,targets:targets.length,owner:targets[0]?.dataset.rosterInstanceId};
        }),members);
        assert.deepEqual(contents,members.map(id=>({id,targets:1,owner:id})),'One Contents target per exact physical component');
        for(const id of members){await page.evaluate(id=>window.ArmyBookAppV2.openInstance(id),id);await settle(page);
          check(await inspect(page),members);}
      }
      results.push({fixture:fixture.id,device,components:members.length,attachDetachReattach:'PASS',popupOwners:fixture.army==='chaos-space-marines'?'canonical scoped links; UI deferred':'PASS'});
      await context.close();
    }
    // Exact baseline DOM comparison over every normal datasheet in all books.
    for(const [army,payload]of payloads){
      const context=await browser.newContext({viewport,reducedMotion:'reduce'}),page=await context.newPage(),old=await context.newPage();
      await page.goto(origin+`/v2/app.html?v2=ARMY_BOOK&registry=${army}`);await old.goto(origin+`/baseline/v2/app.html?v2=ARMY_BOOK&registry=${army}`);
      await Promise.all([ready(page),ready(old)]);
      const snapshot=page=>page.locator('main .unit-card').evaluate(root=>{const copy=root.cloneNode(true);
        copy.querySelectorAll('[href],[src]').forEach(node=>{for(const attr of ['href','src'])if(node.hasAttribute(attr))node.setAttribute(attr,node.getAttribute(attr).replaceAll('/baseline/','/'));});return copy.outerHTML;});
      for(const card of payload.cards.filter(card=>card.kind==='DATASHEET')){
        await page.evaluate(id=>window.ArmyBookAppV2.open(id),card.id);await old.evaluate(id=>window.ArmyBookAppV2.open(id),card.id);
        await Promise.all([settle(page),settle(old)]);
        const actual=await snapshot(page),expected=await snapshot(old);
        if(actual!==expected){let index=0;while(actual[index]===expected[index])index++;
          fs.writeFileSync(path.join(out,'normal-difference.json'),JSON.stringify({army,id:card.id,index,actual:actual.slice(index-100,index+300),expected:expected.slice(index-100,index+300)},null,2));
          assert.fail(army+'/'+card.id+' normal book unchanged: '+path.join(out,'normal-difference.json'));}
      }
      normal.push({army,device,datasheets:payload.cards.filter(card=>card.kind==='DATASHEET').length,unchanged:'PASS'});await context.close();
    }
  }
  assert.deepEqual(errors,[]);const report={status:'PASS',results,normal,screenshots,pageErrors:errors};
  fs.writeFileSync(path.join(out,'formed-unit-browser-report.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}

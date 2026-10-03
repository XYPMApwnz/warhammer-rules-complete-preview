import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';

// Production UI integration: automatic import resolution, physical instances,
// and source-backed selectors. The Library filter is deliberately independent.
const {chromium}=createRequire(import.meta.url)('playwright');
const repo=fileURLToPath(new URL('../../../',import.meta.url));
const app='/books/death-guard/v2/app.html';
const detachments=['detachment-flyblown-host','detachment-paragons-of-putrescence','detachment-contagion-engines'];
const unselected='detachment-virulent-vectorium';
const plagueveil=detachments[0]+':enhancement:2',lancet=detachments[2]+':enhancement:2';
const paragons=detachments[1]+':rule',engines=detachments[2]+':rule';
const units=['unit-biologus-putrifier','unit-plague-marines','unit-plague-marines','unit-helbrute','unit-helbrute'];
const boltgun='datasheet-plague-marines:weapon:2',meltagun='datasheet-plague-marines:weapon:4',knives='datasheet-plague-marines:weapon:13',ranged='datasheet-helbrute:weapon:1';
const selections={
  'parsed-unit-2/unit/selection/1':meltagun,'parsed-unit-2/unit/selection/2':boltgun,'parsed-unit-2/unit/selection/3':knives,
  'parsed-unit-3/unit/selection/1':meltagun,'parsed-unit-3/unit/selection/2':boltgun,'parsed-unit-3/unit/selection/3':knives,
  'parsed-unit-4/unit/selection/1':ranged,'parsed-unit-5/unit/selection/1':ranged
};
const fixture=[
  '+ DETACHMENT: Flyblown Host','+ DETACHMENT: Paragons of Putrescence','+ DETACHMENT: Contagion Engines',
  'Char1: 1x Biologus Putrifier (50 pts)',
  '5x Plague Marines (90 pts): 1x Meltagun, 4x Boltgun, 5x Plague knives','Enhancement: Plagueveil',
  '10x Plague Marines (180 pts): 2x Meltagun, 8x Boltgun, 10x Plague knives',
  '1x Helbrute (120 pts): 1x Combi-bolter','Enhancement: Lancet of the Worldsore',
  '1x Helbrute (120 pts): 1x Combi-bolter'
].join('\n');
const allowed=new Map([
  [app,'text/html'],
  ...['books/death-guard/v2/generated/app-presentation.json','books/death-guard/v2/generated/rule-contract-effective.json'].map(p=>['/'+p,'application/json']),
  ...['books/death-guard/v2/roster-boot.mjs','books/death-guard/v2/rule-contract-schema.mjs','books/death-guard/v2/rule-contract-state-fields.mjs',
      'books/shared/army-book-app-v2/runtime.mjs','books/shared/army-book-app-v2/navigation-v1.mjs','books/shared/army-book-app-v2/navigation-v1-controller.mjs','books/shared/army-book-app-v2/navigation-v1-targets.mjs','books/shared/army-book-app-v2/roster.mjs','books/shared/army-book-app-v2/personal.mjs','books/shared/army-book-app-v2/glossary.mjs',
      'books/shared/roster-v2/runtime.mjs','books/shared/roster-v2/import.mjs','books/shared/roster-v2/context.mjs','books/shared/roster-v2/effects.mjs','books/shared/roster-v2/parser.mjs'].map(p=>['/'+p,'text/javascript']),
  ['/books/shared/army-book-app-v2/styles.css','text/css'],['/books/shared/army-book-app-v2/navigation-v1.css','text/css']
]);
const unexpected=[];
const server=http.createServer((req,res)=>{
  const p=new URL(req.url,'http://localhost').pathname;
  if(!allowed.has(p)){if(p!=='/favicon.ico')unexpected.push(p);res.writeHead(p==='/favicon.ico'?404:200,{'Content-Type':'application/json'});res.end('{"POISON_LEGACY":true}');return;}
  res.writeHead(200,{'Content-Type':allowed.get(p),'Cache-Control':'no-store'});res.end(fs.readFileSync(path.join(repo,p.slice(1))));
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const origin='http://127.0.0.1:'+server.address().port;
const out=process.env.ARMY_APP_V2_SCREENSHOTS||fs.mkdtempSync(path.join(os.tmpdir(),'dg-multi-detachments-'));
fs.mkdirSync(out,{recursive:true});
const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE}:{})});
const results=[];
let activePage,step='boot';
const ready=async page=>{await page.waitForFunction(()=>!!window.ArmyBookAppV2?.rosterPanel);await page.evaluate(()=>window.ArmyBookAppV2.rosterPanel.ready);};
const settled=async page=>{await page.waitForFunction(()=>!document.querySelector('.v2-roster[aria-busy=true]'));assert.equal(await page.locator('.v2-roster-error').count(),0,step+': '+await page.locator('.v2-roster-status').allTextContents());};
const snapshot=page=>page.evaluate(()=>{const r=window.ArmyBookAppV2.roster;return {state:r.snapshot(),projection:r.projection,effective:Object.fromEntries(r.state.units.map(u=>[u.instanceId,r.effective(u.instanceId)]))};});
const physical=(page,id)=>page.locator('[data-roster-instance-id="'+id+'"]');
const field=(w,label)=>w.fields.find(f=>f.label===label)?.value;
const metric=(unit,key)=>unit.profiles.map(p=>p.metrics[key]?.modifier||0);
try {
  for(const phone of [false,true]){
    const device=phone?'phone':'desktop',context=await browser.newContext({viewport:{width:phone?390:1440,height:phone?844:1000},acceptDownloads:true,...(phone?{isMobile:true,hasTouch:true}:{})});
    const page=await context.newPage();activePage=page;page.setDefaultTimeout(12000);const errors=[];
    page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&!m.text().includes('404'))errors.push(m.text());});
    await page.goto(origin+app);await ready(page);
    await page.evaluate(()=>window.ArmyBookAppV2.open('unit-plague-marines'));
    await page.locator('main .v2-detachment-filter').selectOption(unselected);
    const noRoster=await page.locator('main > article').textContent();
    if(phone)await page.getByRole('button',{name:'Open navigation',exact:true}).click();
    await page.getByRole('button',{name:'Roster',exact:true}).click();
    step=device+'/import';await page.locator('[data-roster-input=raw-text]').fill(fixture);await page.locator('[data-roster-action=review-import]').click();await settled(page);
    assert.equal(await page.locator('fieldset[data-binding-kind]').count(),0,'Unambiguous import required manual canonical choices');
    assert.equal(await page.locator('[data-roster-bindings] select').count(),0);
    let current=await snapshot(page);
    assert.deepEqual(current.state.detachmentIds,detachments);assert.equal('detachmentId' in current.state,false);
    assert.deepEqual(current.state.detachments,detachments.map((canonicalDetachmentId,i)=>({instanceId:'detachment/'+(i+1),canonicalDetachmentId})));
    assert.deepEqual(await page.locator('[data-roster-detachments] li').evaluateAll(ns=>ns.map(n=>n.dataset.canonicalDetachmentId)),detachments);
    assert.deepEqual(current.state.units.map(u=>u.canonicalUnitId),units);assert.deepEqual(current.state.units.map(u=>u.startingStrength),[1,5,10,1,1]);
    assert.deepEqual(current.state.units.map(u=>u.enhancementIds),[[],[plagueveil],[],[lancet],[]]);
    const sourceControls=(x,attached)=>{
      assert.deepEqual(metric(x.effective['parsed-unit-1'],'contagionRange'),[3]);
      assert.deepEqual(metric(x.effective['parsed-unit-2'],'detectionRange'),[-3]);
      assert.deepEqual(metric(x.effective['parsed-unit-3'],'detectionRange'),[0]);
      assert.deepEqual(metric(x.effective['parsed-unit-2'],'contagionRange'),[attached?3:0]);
      assert.deepEqual(metric(x.effective['parsed-unit-3'],'contagionRange'),[0]);
      for(const id of ['parsed-unit-4','parsed-unit-5']){
        assert.ok(x.effective[id].keywords.includes('CONTAGION ENGINE'));
        assert.equal(x.effective[id].keywords.includes('MOBILE'),id==='parsed-unit-4');
        const w=x.effective[id].weapons.find(w=>w.id===ranged);assert.ok(field(w,'abilities').includes('ASSAULT'));
        assert.ok(x.effective[id].applied.some(a=>a.ruleId===engines));
        assert.ok(x.effective[id].applied.every(a=>a.ruleId!==paragons));
      }
      for(const id of ['parsed-unit-1','parsed-unit-2','parsed-unit-3'])assert.equal(x.effective[id].keywords.includes('CONTAGION ENGINE'),false);
      for(const unit of Object.values(x.effective))assert.ok(unit.applied.every(a=>!a.ruleId.startsWith(unselected)),'Unselected Detachment applied');
      for(const [id,quantities]of [['parsed-unit-2',[1,4,5]],['parsed-unit-3',[2,8,10]]])assert.deepEqual([meltagun,boltgun,knives].map(wid=>x.effective[id].weapons.find(w=>w.id===wid).physicalQuantity),quantities);
    };
    sourceControls(current,false);
    for(const action of ['attach','detach','attach']){
      step=device+'/'+action;
      const root=physical(page,'parsed-unit-2');if(action==='attach')await root.locator('[data-attachment-candidate-for]').selectOption('parsed-unit-1');
      await root.locator(action==='attach'?'[data-roster-action=attach]':'[data-roster-action=detach][data-leader-instance-id="parsed-unit-1"]').click();await settled(page);current=await snapshot(page);sourceControls(current,action==='attach');
      if(action==='attach'){
        const effects=current.effective['parsed-unit-2'].applied;
        assert.ok(effects.some(e=>e.ruleId===plagueveil));assert.ok(effects.some(e=>e.ruleId===paragons));
        assert.ok(effects.some(e=>e.ruleId==='datasheet-biologus-putrifier:section:1'));
      }
    }
    let relatedChecks=0;
    for(const unit of current.state.units){
      await page.evaluate(id=>window.ArmyBookAppV2.openInstance(id),unit.instanceId);
      const root=page.locator('main [data-roster-related-instance-id="'+unit.instanceId+'"]');
      assert.deepEqual(await root.locator('select').evaluate(s=>[...s.options].map(o=>o.value).sort()),['',...detachments].sort());
      for(const detachmentId of ['',...detachments]){
        await root.locator('select').selectOption(detachmentId);await settled(page);
        const rows=await page.evaluate(({id,filter})=>window.ArmyBookAppV2.roster.related(id,filter||null),{id:unit.instanceId,filter:detachmentId});
        assert.ok(rows.every(r=>detachments.includes(r.detachmentId)&&(!detachmentId||r.detachmentId===detachmentId)),'Related Detachment leakage');
        assert.ok(rows.every(r=>r.state!=='INVALID'));
        const visible=await root.locator('[data-rule-id]').evaluateAll(ns=>ns.map(n=>({ruleId:n.dataset.ruleId,applicability:n.dataset.applicability})));
        assert.deepEqual(visible,rows.filter(r=>['MATCH','CONDITIONAL'].includes(r.applicability)&&(r.kind!=='ENHANCEMENT'||unit.enhancementIds.includes(r.ruleId))).map(({ruleId,applicability})=>({ruleId,applicability})));
        assert.equal(new Set(visible.map(r=>r.ruleId)).size,visible.length);relatedChecks++;
      }
    }
    const saved=await snapshot(page);
    await page.evaluate(()=>window.ArmyBookAppV2.openLibrary());await page.evaluate(()=>window.ArmyBookAppV2.open('unit-plague-marines'));
    await page.locator('main .v2-detachment-filter').selectOption(unselected);assert.equal(await page.locator('main > article').textContent(),noRoster);
    assert.deepEqual(await snapshot(page),saved,'Library filter altered roster Detachments');
    if(phone)await page.getByRole('button',{name:'Open navigation',exact:true}).click();await page.getByRole('button',{name:'Roster',exact:true}).click();
    await page.reload();await ready(page);assert.deepEqual(await snapshot(page),saved);assert.equal(await page.locator('[data-roster-detachments] li').count(),3);
    await page.getByText('Backup and restore',{exact:true}).click();
    const [download]=await Promise.all([page.waitForEvent('download'),page.locator('[data-roster-action=export-backup]').click()]);
    const backup=JSON.parse(fs.readFileSync(await download.path(),'utf8'));assert.deepEqual(backup,saved.state);
    await page.evaluate(()=>localStorage.clear());await page.reload();await ready(page);
    await page.getByText('Backup and restore',{exact:true}).click();
    await page.getByLabel('Restore a V2 roster backup',{exact:true}).setInputFiles({name:'roster-v2.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(backup))});await settled(page);assert.deepEqual(await snapshot(page),saved);
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);assert.deepEqual(errors,[]);assert.deepEqual(unexpected,[]);
    await page.locator('[data-roster-detachments]').scrollIntoViewIfNeeded();
    await page.screenshot({path:path.join(out,device+'-multi-detachments.png'),animations:'disabled'});
    results.push({device,status:'PASS',detachments:3,physicalInstances:5,relatedChecks,attachmentActions:3,libraryIndependent:true,reload:true,backupRoundtrip:true,legacyReads:0});
    await context.close();
  }
  fs.writeFileSync(path.join(out,'roster-multiple-detachments-browser.json'),JSON.stringify({status:'PASS',results},null,2));
  console.log(JSON.stringify({status:'PASS',results,evidence:out}));
}catch(error){console.error('Browser step '+step);if(activePage)await activePage.screenshot({path:path.join(out,'failure.png')}).catch(()=>{});throw error;}
finally{await browser.close();await new Promise(resolve=>server.close(resolve));}

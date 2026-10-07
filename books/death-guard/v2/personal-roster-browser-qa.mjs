import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';

// Production workflow integration. The fixture selects roster facts once at the
// import boundary; the only subsequent structure changes are attachments.
const {chromium}=createRequire(import.meta.url)('playwright');
const repo=fileURLToPath(new URL('../../../',import.meta.url));
const app='/books/death-guard/v2/app.html';
const payload=JSON.parse(fs.readFileSync(path.join(repo,'books/death-guard/v2/generated/app-presentation.json'),'utf8'));
const cards=new Map(payload.cards.map(card=>[card.id,card]));
const detachments=['detachment-virulent-vectorium','detachment-flyblown-host','detachment-paragons-of-putrescence','detachment-contagion-engines'];
const furnace=detachments[0]+':enhancement:2',plagueveil=detachments[1]+':enhancement:2',lancet=detachments[3]+':enhancement:2';
const ids={bio:'parsed-unit-1',caster:'parsed-unit-2',pox:'parsed-unit-3',lord:'parsed-unit-4',pmA:'parsed-unit-5',pmB:'parsed-unit-6',ds:'parsed-unit-7',rhino:'parsed-unit-8',helbrute:'parsed-unit-9'};
const unitIds=['unit-biologus-putrifier','unit-malignant-plaguecaster','unit-lord-of-poxes','unit-lord-of-contagion','unit-plague-marines','unit-plague-marines','unit-deathshroud-terminators','unit-chaos-rhino','unit-helbrute'];
const bolt='datasheet-plague-marines:weapon:2',melta='datasheet-plague-marines:weapon:4',knife='datasheet-plague-marines:weapon:13';
const infusion='datasheet-biologus-putrifier:section:1',silent='datasheet-deathshroud-terminators:section:1';
const fixture=[
  '+ DETACHMENT: Virulent Vectorium (Worldblight)','+ DETACHMENT: Flyblown Host','+ DETACHMENT: Paragons of Putrescence','+ DETACHMENT: Contagion Engines',
  '+ WARLORD: Char4: Lord of Contagion',
  'Char1: 1x Biologus Putrifier (50 pts): 1x Plague knives','Enhancement: Furnace of Plagues',
  'Char2: 1x Malignant Plaguecaster (60 pts)',
  'Char3: 1x Lord of Poxes (80 pts)',
  'Char4: 1x Lord of Contagion (100 pts): 1x Manreaper','Enhancement: Plagueveil',
  '5x Plague Marines (90 pts): 1x Meltagun, 4x Boltgun, 5x Plague knives, 1x Icon of Despair',
  '10x Plague Marines (180 pts): 2x Blight launcher, 8x Boltgun, 10x Plague knives',
  '3x Deathshroud Terminators (140 pts): 3x Plaguespurt gauntlet, 3x Manreaper, 1x Additional Plaguespurt gauntlet',
  '1x Chaos Rhino (75 pts): 1x Combi-bolter, 1x Havoc launcher',
  '1x Helbrute (120 pts): 1x Combi-bolter','Enhancement: Lancet of the Worldsore'
].join('\n');
const allowed=new Map([
  [app,'text/html'],
  ...['books/death-guard/v2/generated/app-presentation.json','books/death-guard/v2/generated/rule-contract-effective.json'].map(p=>['/'+p,'application/json']),
  ...['books/death-guard/v2/roster-boot.mjs','books/death-guard/v2/rule-contract-schema.mjs','books/death-guard/v2/rule-contract-state-fields.mjs',
    'books/shared/rule-contract-v2/schema.mjs',
      'books/shared/army-book-app-v2/runtime.mjs','books/shared/army-book-app-v2/navigation-v1.mjs','books/shared/army-book-app-v2/navigation-v1-controller.mjs','books/shared/army-book-app-v2/navigation-v1-targets.mjs','books/shared/army-book-app-v2/roster.mjs','books/shared/army-book-app-v2/personal.mjs','books/shared/army-book-app-v2/glossary.mjs',
      'books/shared/roster-v2/runtime.mjs','books/shared/roster-v2/import.mjs','books/shared/roster-v2/context.mjs','books/shared/roster-v2/effects.mjs','books/shared/roster-v2/parser.mjs'].map(p=>['/'+p,'text/javascript']),
  ['/books/shared/army-book-app-v2/styles.css','text/css'],['/books/shared/army-book-app-v2/navigation-v1.css','text/css']
]);
const legacyRequests=[];
const server=http.createServer((req,res)=>{
  const p=new URL(req.url,'http://localhost').pathname;
  if(!allowed.has(p)){if(p!=='/favicon.ico')legacyRequests.push(p);res.writeHead(p==='/favicon.ico'?404:200,{'Content-Type':'application/json'});res.end('{"POISON_LEGACY_FACTUAL_RUNTIME":true}');return;}
  res.writeHead(200,{'Content-Type':allowed.get(p),'Cache-Control':'no-store'});res.end(fs.readFileSync(path.join(repo,p.slice(1))));
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const origin='http://127.0.0.1:'+server.address().port;
const out=process.env.ARMY_APP_V2_SCREENSHOTS||fs.mkdtempSync(path.join(os.tmpdir(),'dg-personal-roster-'));
fs.mkdirSync(out,{recursive:true});
const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE}:{})});
let activePage,step='boot';
const results=[];
const ready=async page=>{await page.waitForFunction(()=>!!window.ArmyBookAppV2?.rosterPanel);await page.evaluate(()=>window.ArmyBookAppV2.rosterPanel.ready);};
const settled=async page=>{await page.waitForFunction(()=>!document.querySelector('.v2-roster[aria-busy=true]'));assert.equal(await page.locator('.v2-roster-error').count(),0,step+': '+await page.locator('.v2-roster-status').allTextContents());};
const snapshot=page=>page.evaluate(()=>{const r=window.ArmyBookAppV2.roster;return {state:r.snapshot(),projection:r.projection,effective:Object.fromEntries(r.state.units.map(u=>[u.instanceId,r.effective(u.instanceId)]))};});
const field=(record,label)=>record.fields.find(f=>f.label===label)?.value;
const lethal=record=>field(record,'abilities').some(a=>a.toUpperCase()==='LETHAL HITS');
const noOverflow=async page=>assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,step+' horizontal overflow');
const factObservation=(page,scope='main')=>page.locator(scope+' [data-fact-id]').evaluateAll(nodes=>nodes.map(n=>({id:n.dataset.factId,value:JSON.parse(n.dataset.factValue),entityId:n.dataset.entityId,contextId:n.dataset.contextId,cardId:n.closest('[data-card-id]').dataset.cardId,visible:!!n.getClientRects().length})).sort((a,b)=>a.id.localeCompare(b.id)));
const expectedFacts=id=>{
  const found=[];
  const visit=id=>{const card=cards.get(id);assert.ok(card,'Unresolved canonical card '+id);found.push(...card.fields.map(f=>({id:f.id,value:f.value,entityId:f.source.entityId,contextId:f.contextId,cardId:id})));card.children.forEach(visit);};
  visit(id);return found.sort((a,b)=>a.id.localeCompare(b.id));
};
async function fullReaderCensus(page,label){
  step=label;
  await page.evaluate(()=>window.ArmyBookAppV2.openLibrary());
  const observed=new Map();
  for(const id of payload.groups.flatMap(group=>group.itemIds)){
    await page.evaluate(id=>window.ArmyBookAppV2.open(id),id);
    const facts=await factObservation(page);
    assert.deepEqual(facts.map(({visible,...f})=>f),expectedFacts(id),label+' source projection parity');
    for(const fact of facts){assert.equal(fact.visible,true,label+' hidden field '+fact.id);observed.set(fact.id,fact);}
    await noOverflow(page);
  }
  assert.deepEqual(new Set(observed.keys()),new Set(payload.factManifest.map(f=>f.id)),label+' manifest census');
  return [...observed.values()].sort((a,b)=>a.id.localeCompare(b.id));
}

try{
  // Tests below exercise the public app API and production DOM. They are added
  // alongside the personal-book route and Bodyguard-first setup implementation.
  for(const phone of [false,true]){
    const device=phone?'phone':'desktop';
    const context=await browser.newContext({viewport:{width:phone?390:1440,height:phone?844:1000},acceptDownloads:true,...(phone?{isMobile:true,hasTouch:true}:{})});
    const page=await context.newPage();activePage=page;page.setDefaultTimeout(12000);const errors=[];
    page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&!m.text().includes('404'))errors.push(m.text());});
    await page.goto(origin+app);await ready(page);
    const before=await fullReaderCensus(page,device+'/reader-before');
    await page.evaluate(()=>window.ArmyBookAppV2.openRoster());
    step=device+'/automatic-import';
    await page.locator('[data-roster-input=raw-text]').fill(fixture);
    await page.locator('[data-roster-action=review-import]').click();await settled(page);
    assert.equal(await page.locator('[data-roster-bindings] select').count(),0,'Unambiguous export asks for canonical selectors');
    let current=await snapshot(page);
    assert.deepEqual(current.state.detachmentIds,detachments);
    assert.deepEqual(current.state.units.map(u=>u.canonicalUnitId),unitIds);
    assert.deepEqual(current.state.units.map(u=>u.startingStrength),[1,1,1,1,5,10,3,1,1]);
    assert.equal(current.state.warlordInstanceId,ids.lord);
    assert.deepEqual(current.state.units.map(u=>u.enhancementIds),[[furnace],[],[],[plagueveil],[],[],[],[],[lancet]]);
    assert.ok(current.state.units.find(u=>u.instanceId===ids.pmA).selections.some(s=>s.canonicalEquipmentIds.includes('datasheet-plague-marines:wargear:8')));
    assert.equal(current.state.units.find(u=>u.instanceId===ids.ds).selections.filter(s=>s.canonicalProfileIds.includes('datasheet-deathshroud-terminators:weapon:1')).reduce((n,s)=>n+s.physicalQuantity,0),4);
    assert.equal(await page.locator('main input[type=number]').count(),0,'Composition editor appeared');
    assert.equal(await page.locator('main input[type=checkbox]').count(),0,'Selection editor appeared');
    assert.equal(await page.locator('main h2').filter({hasText:'Attachment Setup'}).count(),1,'Import bypassed Attachment Setup');
    assert.equal(await page.locator('main [data-effective-instance-id]').count(),0,'Setup opened the Reader immediately');
    assert.equal(await page.locator('main [data-roster-related-instance-id]').count(),0);
    assert.equal(await page.locator('main [data-roster-action=open-personal-guide]').count(),1);
    // A personal guide is available even when the user chooses no attachments.
    await page.locator('[data-roster-action=open-personal-guide]').click();
    await page.waitForFunction(()=>location.hash==='#view-roster-guide');
    assert.deepEqual((await snapshot(page)).state.attachments,[]);
    await page.evaluate(()=>window.ArmyBookAppV2.openRoster());
    const target=id=>page.locator('[data-attachment-target-instance-id="'+id+'"]');
    const candidates=async id=>page.locator('select[data-attachment-candidate-for="'+id+'"]').evaluateAll(nodes=>nodes.flatMap(n=>[...n.options].map(o=>o.value).filter(Boolean)));
    const attach=async(leader,bodyguard)=>{
      step=device+'/attach/'+leader+'/'+bodyguard;
      const root=target(bodyguard);await root.locator('select').selectOption(leader);
      await root.locator('[data-roster-action=attach]').click();await settled(page);await noOverflow(page);
      const result=await snapshot(page);assert.ok(result.state.attachments.some(a=>a.leaderInstanceId===leader&&a.bodyguardInstanceId===bodyguard));return result;
    };
    const detach=async(leader,bodyguard)=>{
      step=device+'/detach/'+leader;
      await target(bodyguard).locator('[data-attached-leader-instance-id="'+leader+'"] [data-roster-action=detach]').click();await settled(page);
      const result=await snapshot(page);assert.ok(result.state.attachments.every(a=>a.leaderInstanceId!==leader));return result;
    };
    for(const id of [ids.pmA,ids.pmB])assert.deepEqual(new Set(await candidates(id)),new Set([ids.bio,ids.caster,ids.pox]),'Bodyguard candidates not limited to eligible imported instances');
    assert.deepEqual(await candidates(ids.ds),[ids.lord]);
    assert.deepEqual(await candidates(ids.rhino),[]);
    assert.equal(await page.locator('select[aria-label^="Attach "]').count(),0,'Character-first Bodyguard picker remains');
    current=await attach(ids.pox,ids.pmA);
    assert.equal((await candidates(ids.pmA)).includes(ids.caster),false,'Illegal second Leader was offered');
    assert.equal((await candidates(ids.pmB)).includes(ids.pox),false,'Used Character offered to another Bodyguard');
    const illegal=await page.evaluate(({leader,bodyguard})=>{
      const service=window.ArmyBookAppV2.roster,before=JSON.stringify(service.snapshot());
      try{service.attach(leader,bodyguard);return {rejected:false,unchanged:before===JSON.stringify(service.snapshot())};}
      catch{return {rejected:true,unchanged:before===JSON.stringify(service.snapshot())};}
    },{leader:ids.caster,bodyguard:ids.pmA});
    assert.deepEqual(illegal,{rejected:true,unchanged:true});
    await detach(ids.pox,ids.pmA);
    current=await attach(ids.bio,ids.pmA);
    assert.equal((await candidates(ids.pmB)).includes(ids.bio),false);
    current=await attach(ids.caster,ids.pmA);
    assert.deepEqual(new Set(current.state.attachments.filter(a=>a.bodyguardInstanceId===ids.pmA).map(a=>a.leaderInstanceId)),new Set([ids.bio,ids.caster]));
    assert.equal((await candidates(ids.pmA)).includes(ids.pox),false,'Third Character was offered');
    assert.ok((await candidates(ids.pmB)).includes(ids.pox));
    current=await attach(ids.pox,ids.pmB);
    current=await attach(ids.lord,ids.ds);
    const effectControls=(state,attached)=>{
      const a=state.effective[ids.pmA],b=state.effective[ids.pmB];
      assert.deepEqual([melta,bolt,knife].map(id=>a.weapons.find(w=>w.id===id).physicalQuantity),[1,4,5]);
      assert.deepEqual(['datasheet-plague-marines:weapon:1',bolt,knife].map(id=>b.weapons.find(w=>w.id===id).physicalQuantity),[2,8,10]);
      assert.equal(lethal(a.weapons.find(w=>w.id===melta)),attached);
      assert.ok(b.weapons.every(w=>!w.fields.find(f=>f.label==='abilities')?.value.includes('LETHAL HITS')),'Foul Infusion leaked to second PM');
      assert.equal(a.applied.some(row=>row.ruleId===infusion),attached);
      assert.ok(b.applied.every(row=>row.ruleId!==infusion));
      for(const row of a.applied.filter(row=>row.ruleId===infusion)){
        assert.equal(row.sourceInstanceId,ids.bio);assert.equal(row.targetInstanceId,ids.pmA);
        assert.ok(row.targetWeaponProfileId&&row.sourceFields.length);assert.equal(row.targetModelInstanceId,null,'Aggregate infantry acquired synthetic ownership');
      }
      for(const id of [ids.pmA,ids.pmB])assert.ok(state.effective[id].weapons.every(w=>!w.modelInstanceId));
      assert.equal(a.abilities.some(ability=>ability.id==='datasheet-plague-marines:wargear:8'),true);
      assert.equal(state.state.units.find(u=>u.instanceId===ids.pmB).selections.some(s=>s.canonicalEquipmentIds.length),false);
      assert.deepEqual(state.effective[ids.lord].profiles.flatMap(p=>p.abilities.filter(a=>a.name==='Feel No Pain')),[{name:'Feel No Pain',value:4}]);
      for(const id of Object.values(ids).filter(id=>id!==ids.lord))assert.ok(state.effective[id].applied.every(a=>a.ruleId!==silent));
      for(const [enhancement,owner] of [[furnace,ids.bio],[plagueveil,ids.lord],[lancet,ids.helbrute]])for(const unit of state.state.units)if(unit.instanceId!==owner)assert.ok(state.effective[unit.instanceId].applied.every(a=>a.ruleId!==enhancement),'Enhancement leaked to another owner');
    };
    effectControls(current,true);
    current=await detach(ids.bio,ids.pmA);effectControls(current,false);
    assert.ok((await candidates(ids.pmA)).includes(ids.bio));
    current=await attach(ids.bio,ids.pmA);effectControls(current,true);
    const saved=await snapshot(page);
    await page.locator('[data-roster-instance-id="'+ids.pmA+'"]').scrollIntoViewIfNeeded();
    await page.screenshot({path:path.join(out,device+'-attachment-setup.png'),animations:'disabled'});
    step=device+'/personal-guide';
    await page.locator('[data-roster-action=open-personal-guide]').click();
    await page.waitForFunction(()=>location.hash==='#view-roster-guide');
    await noOverflow(page);
    const personalNavigation=await page.locator('.v2-navigation [data-nav-target]').evaluateAll(nodes=>nodes.map(n=>({href:'#'+encodeURIComponent(n.dataset.navTarget),targetId:n.dataset.targetId,label:n.textContent})));
    const physicalLinks=personalNavigation.filter(n=>decodeURIComponent(n.href.slice(1)).startsWith('roster-unit/'));
    assert.equal(physicalLinks.length,current.state.units.length,'Personal navigation duplicated physical instances');
    assert.deepEqual(new Set(physicalLinks.map(n=>decodeURIComponent(n.href.slice(1)).slice('roster-unit/'.length))),new Set(current.state.units.map(u=>u.instanceId)),'Personal navigation merged/dropped physical instances');
    assert.deepEqual(physicalLinks.filter(n=>n.label.startsWith('Plague Marines')).map(n=>n.label),['Plague Marines #1','Plague Marines #2']);
    const canonicalLinks=personalNavigation.filter(n=>n.targetId&&cards.has(n.targetId));
    assert.deepEqual(new Set(canonicalLinks.filter(n=>cards.get(n.targetId).kind==='DETACHMENT').map(n=>n.targetId)),new Set(detachments));
    assert.equal(canonicalLinks.filter(n=>cards.get(n.targetId).kind==='DATASHEET').length,0,'Canonical faction datasheets exposed in place of instances');
    assert.equal(canonicalLinks.some(n=>cards.get(n.targetId).kind==='ENHANCEMENT'&&![furnace,plagueveil,lancet].includes(n.targetId)),false);
    let detachmentChecks=0;
    for(const detachmentId of detachments){
      step=device+'/detachment/'+detachmentId;
      await page.evaluate(id=>window.ArmyBookAppV2.open(id),detachmentId);
      const actual=await page.locator('main article[data-card-id]').evaluateAll(ns=>ns.map(n=>n.dataset.cardId));
      const enhancements=actual.filter(id=>cards.get(id)?.kind==='ENHANCEMENT');
      assert.deepEqual(new Set(enhancements),new Set([furnace,plagueveil,lancet].filter(id=>cards.get(id).parentId===detachmentId)),'Personal Detachment exposed unimported Enhancements');
      const stratagems=actual.filter(id=>cards.get(id)?.kind==='STRATAGEM');
      assert.deepEqual(new Set(stratagems),new Set(payload.cards.filter(c=>c.kind==='STRATAGEM'&&c.parentId===detachmentId).map(c=>c.id)),'Selected Detachment Stratagem scope changed');
      assert.ok(actual.filter(id=>['ENHANCEMENT','STRATAGEM','DETACHMENT_RULE'].includes(cards.get(id)?.kind)).every(id=>cards.get(id).parentId===detachmentId));
      await noOverflow(page);detachmentChecks++;
    }
    const visibleInstance=async id=>{
      await page.waitForSelector('main [data-roster-context-instance-id="'+id+'"]');
      assert.equal(await page.locator('main [data-roster-context-instance-id]').count(),1,'Multiple physical instances mounted');
    };
    let instanceChecks=0,relatedChecks=0,popupChecks=0;
    for(const unit of current.state.units){
      step=device+'/effective-instance/'+unit.instanceId;
      await page.evaluate(id=>window.ArmyBookAppV2.openInstance(id),unit.instanceId);await visibleInstance(unit.instanceId);
      const instance=page.locator('main [data-roster-context-instance-id="'+unit.instanceId+'"]');
      const effective=current.effective[unit.instanceId];
      const records=[...effective.profiles,...effective.weapons];
      const recordGroups=new Map();
      for(const record of records){const group=recordGroups.get(record.id)||[];group.push(record);recordGroups.set(record.id,group);}
      for(const [canonicalId,group] of recordGroups){
        const actual=await page.locator('main article[data-card-id="'+canonicalId+'"][data-roster-instance-id="'+unit.instanceId+'"]').evaluateAll(ns=>ns.map(n=>({id:n.dataset.cardId,instance:n.dataset.rosterInstanceId,scope:n.dataset.compositionId||null,text:n.textContent,facts:[...n.querySelectorAll('[data-fact-id]')].filter(f=>f.dataset.entityId===n.dataset.cardId).map(f=>({id:f.dataset.factId,value:JSON.parse(f.dataset.factValue)}))})));
        assert.equal(actual.length,group.length,'Missing/duplicate effective canonical profile '+canonicalId);
        for(let i=0;i<group.length;i++){
          const record=group[i];assert.equal(actual[i].instance,unit.instanceId);assert.equal(actual[i].scope,record.scopeId||null);
          for(const f of record.fields){
            if(f.label==='Base')continue; // This is an unchanged canonical child fact, covered by full Reader census.
            if(f.label==='order')continue; // Source presentation ordering is not a player-facing characteristic.
            const prefix=canonicalId+'::/'+f.label;
            if(Array.isArray(f.value))assert.deepEqual(actual[i].facts.filter(v=>v.id.startsWith(prefix+'/')).map(v=>v.value),f.value,'Effective array '+f.label);
            else assert.deepEqual(actual[i].facts.find(v=>v.id===prefix)?.value,f.value,'Effective scalar '+f.label);
          }
          const quantity=record.physicalQuantity===undefined?record.quantity:record.physicalQuantity;
          assert.ok(actual[i].text.includes(quantity+(record.physicalQuantity===undefined?' models in this profile':' selected')));
          for(const ability of record.abilities||[])assert.ok(actual[i].text.includes(ability.name+(ability.value===undefined?'':': '+ability.value)),'Missing effective profile ability');
        }
      }
      assert.deepEqual(await page.locator('main > article [data-fact-id^="'+unit.canonicalUnitId+'::/keywords/"]').evaluateAll(ns=>ns.map(n=>JSON.parse(n.dataset.factValue))),effective.keywords);
      const identity=await instance.locator('.v2-roster-identity > div').evaluateAll(ns=>Object.fromEntries(ns.map(n=>[n.querySelector('dt').textContent,n.querySelector('dd').textContent])));
      assert.equal(identity['Starting Strength'],String(unit.startingStrength));
      assert.equal(identity.Warlord,unit.warlord===null||unit.warlord===undefined?'Unknown':unit.warlord?'Yes':'No');
      assert.deepEqual(await instance.locator('.v2-roster-identity [data-target-id]').evaluateAll(ns=>ns.map(n=>n.dataset.targetId)),unit.enhancementIds);
      for(const selection of unit.selections){
        const selected=instance.locator('[data-selection-key="'+selection.selectionKey+'"]');assert.equal(await selected.count(),1);
        assert.equal(await selected.locator('strong').first().textContent(),selection.physicalQuantity+' selected · ');
        assert.deepEqual(await selected.locator('a[data-target-id]').evaluateAll(ns=>ns.map(n=>n.dataset.targetId)),[...selection.canonicalProfileIds,...selection.canonicalEquipmentIds]);
      }
      const related=instance.locator('[data-roster-related-instance-id="'+unit.instanceId+'"]');
      assert.deepEqual(await related.locator('select').evaluate(s=>[...s.options].map(o=>o.value).sort()),['',...detachments].sort());
      for(const filter of ['',...detachments]){
        await related.locator('select').selectOption(filter);await settled(page);
        const rows=await page.evaluate(({id,filter})=>window.ArmyBookAppV2.roster.related(id,filter||null),{id:unit.instanceId,filter});
        assert.ok(rows.every(row=>detachments.includes(row.detachmentId)&&(!filter||row.detachmentId===filter)));
        assert.ok(rows.every(row=>row.state!=='INVALID'));
        const visible=await related.locator('[data-rule-id]').evaluateAll(ns=>ns.map(n=>({ruleId:n.dataset.ruleId,applicability:n.dataset.applicability})));
        assert.deepEqual(visible,rows.filter(r=>['MATCH','CONDITIONAL'].includes(r.applicability)&&(r.kind!=='ENHANCEMENT'||unit.enhancementIds.includes(r.ruleId))).map(({ruleId,applicability})=>({ruleId,applicability})),'Stale/inapplicable roster Related Rules');
        assert.equal(new Set(visible.map(r=>r.ruleId)).size,visible.length);
        assert.ok(visible.filter(r=>cards.get(r.ruleId).kind==='ENHANCEMENT').every(r=>unit.enhancementIds.includes(r.ruleId)),'Unassigned Enhancement appeared in '+unit.instanceId+' Related Rules: '+JSON.stringify(visible.filter(r=>cards.get(r.ruleId).kind==='ENHANCEMENT')));
        relatedChecks++;
      }
      await noOverflow(page);instanceChecks++;
    }
    assert.deepEqual(await snapshot(page),saved,'Reading personal guide mutated imported selections or attachments');
    step=device+'/physical-history';
    await page.evaluate(id=>window.ArmyBookAppV2.openInstance(id),ids.pmA);await visibleInstance(ids.pmA);
    const hashA=await page.evaluate(()=>location.hash);
    const urlA=page.url();
    await page.evaluate(id=>window.ArmyBookAppV2.openInstance(id),ids.pmB);await visibleInstance(ids.pmB);
    await page.goBack();await visibleInstance(ids.pmA);assert.equal(await page.evaluate(()=>location.hash),hashA);
    await page.goForward();await visibleInstance(ids.pmB);
    await page.reload();await ready(page);await visibleInstance(ids.pmB);assert.deepEqual(await snapshot(page),saved);
    await page.goto(urlA);await ready(page);await visibleInstance(ids.pmA);
    step=device+'/malformed-physical-route';
    const malformedUrl=new URL(urlA);malformedUrl.hash='roster-unit%2F%25';
    await page.goto(malformedUrl.href);await ready(page);
    assert.equal(await page.locator('main [data-roster-context-instance-id]').count(),0,'Malformed instance route mounted an arbitrary unit');
    assert.equal(await page.locator('main .v2-not-found').count(),1,'Malformed instance route did not fail closed');
    assert.deepEqual(await snapshot(page),saved);
    await page.goto(urlA);await ready(page);await visibleInstance(ids.pmA);
    const popup=async id=>{
      await page.evaluate(id=>window.ArmyBookAppV2.showDetail(id),id);await page.waitForSelector('dialog[open]');
      assert.deepEqual((await factObservation(page,'dialog[open]')).map(({visible,...f})=>f),expectedFacts(id),'Popup canonical definition changed');
      assert.equal(await page.locator('dialog[open] article').first().getAttribute('data-card-id'),id);
      if(cards.get(id).kind==='DATASHEET'){
        assert.equal(await page.locator('dialog[open] .v2-compatible').count(),0,'Personal canonical popup appended the unscoped static Related Rules list');
        assert.equal(await page.locator('dialog[open] [data-rule-id]').count(),0,'Personal source popup exposed faction compatibility rows');
      }
      const facts=await factObservation(page,'dialog[open]');
      await page.getByRole('button',{name:'Close rule reference',exact:true}).click();await page.waitForSelector('dialog[open]',{state:'hidden'});
      popupChecks++;return facts;
    };
    step=device+'/roster-popup';
    const infusionPopup=await popup(infusion);await visibleInstance(ids.pmA);
    await popup('unit-plague-marines');await visibleInstance(ids.pmA);
    const relatedRule=await page.locator('main [data-roster-related-instance-id] [data-rule-id]').first().getAttribute('data-rule-id');
    await popup(relatedRule);await visibleInstance(ids.pmA);
    step=device+'/roster-glossary';
    await page.evaluate(()=>window.ArmyBookAppV2.openGlossary());
    const unassignedEnhancement=detachments[0]+':enhancement:1';
    await page.getByRole('searchbox',{name:'Search glossary',exact:true}).fill(cards.get(unassignedEnhancement).title);
    assert.equal(await page.locator('.v2-glossary-result[data-target-id="'+unassignedEnhancement+'"]').count(),0,'Personal Glossary exposed unimported Enhancement');
    await page.getByRole('searchbox',{name:'Search glossary',exact:true}).fill('Foul Infusion');
    assert.equal(await page.locator('.v2-glossary-result[data-target-id="'+infusion+'"]').count(),1);
    await page.locator('.v2-glossary-result[data-target-id="'+infusion+'"]').click();await page.waitForSelector('dialog[open]');
    assert.deepEqual(await factObservation(page,'dialog[open]'),infusionPopup,'Glossary and roster popup changed canonical identity/text');
    await page.getByRole('button',{name:'Close rule reference',exact:true}).click();await page.waitForSelector('dialog[open]',{state:'hidden'});
    await page.getByRole('button',{name:'Close glossary',exact:true}).click();await visibleInstance(ids.pmA);
    step=device+'/guide-navigation-search';
    if(phone)await page.getByRole('button',{name:'Open navigation',exact:true}).click();
    await page.getByRole('searchbox',{name:'Search the army book',exact:true}).fill('Mortarion');
    assert.equal(await page.locator('.v2-navigation [data-nav-target]').count(),0,'Roster search exposed unimported datasheet');
    await page.getByRole('searchbox',{name:'Search the army book',exact:true}).fill('Plague Marines');
    assert.equal(await page.locator('.v2-navigation [data-nav-target][data-roster-nav-instance-id][data-canonical-id="unit-plague-marines"]').count(),2,'Roster search merged duplicate copies');
    await page.locator('.v2-navigation [data-nav-target][data-roster-nav-instance-id="'+ids.pmA+'"]').click();await visibleInstance(ids.pmA);
    if(phone)assert.equal(await page.getByRole('button',{name:'Open navigation',exact:true}).getAttribute('aria-expanded'),'false');
    if(phone)await page.getByRole('button',{name:'Open navigation',exact:true}).click();
    await page.getByRole('searchbox',{name:'Search the army book',exact:true}).fill('');
    if(phone)await page.locator('#navMenu').click();
    const after=await fullReaderCensus(page,device+'/reader-after');assert.deepEqual(after,before,'Personal workflow changed the complete Army Book');
    assert.deepEqual(await snapshot(page),saved,'Full-book browsing changed roster state');
    await page.evaluate(()=>window.ArmyBookAppV2.openPersonalGuide());
    await page.screenshot({path:path.join(out,device+'-personal-guide.png'),animations:'disabled'});
    assert.deepEqual(errors,[]);assert.deepEqual(legacyRequests,[]);await noOverflow(page);
    results.push({device,status:'PASS',readerFacts:before.length,physicalInstances:9,selectedDetachments:4,importedEnhancements:3,attachmentActions:10,bodyguardFirst:true,twoCharacters:true,illegalPairRejected:true,usedCharacterNotReoffered:true,instanceChecks,relatedChecks,popupChecks,history:true,reload:true,glossaryParity:true,legacyReads:0});
    await context.close();
  }
  fs.writeFileSync(path.join(out,'personal-roster-browser.json'),JSON.stringify({status:'PASS',results},null,2));
  console.log(JSON.stringify({status:'PASS',results,evidence:out}));
}catch(error){console.error('Personal roster browser step '+step);if(activePage)await activePage.screenshot({path:path.join(out,'failure.png')}).catch(()=>{});throw error;}
finally{await browser.close();await new Promise(resolve=>server.close(resolve));}

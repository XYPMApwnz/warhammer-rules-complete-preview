/** Presentation-only checks through native imports and real player controls.
 * Canonical source fields, not source links, must replace metric annotations. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {launchChromium} from '../tests/helpers/browser-launch.mjs';
import {parseSourceFixtureJSON} from '../tests/helpers/source-refs-fixtures.mjs';
import {isApplicationTestDependency} from '../books/shared/application-v2/browser-test-dependencies.mjs';
import {chargeFixtures} from './charge-qa-fixtures.mjs';

const repo=path.resolve(fileURLToPath(new URL('../',import.meta.url)));
const option=name=>process.argv.find(arg=>arg.startsWith(name+'='))?.slice(name.length+1);
const out=path.resolve(option('--out')||fs.mkdtempSync(path.join(os.tmpdir(),'wh-card-display-')));
assert.ok(out!==repo&&!out.startsWith(repo+path.sep));fs.mkdirSync(out,{recursive:true});
const inputs={'adeptus-mechanicus':'roster-runtime','blood-angels':'roster-runtime','chaos-space-marines':'roster-runtime',
  'dark-angels':'roster-runtime','death-guard':'rule-contract-effective','emperors-children':'roster-attachments',
  'space-marines':'roster-runtime','tau-empire':'roster-import','tyranids':'roster-runtime'};
const counts={'adeptus-mechanicus':1,'blood-angels':4,'chaos-space-marines':2,'dark-angels':5,'death-guard':5,
  'emperors-children':2,'space-marines':5,'tau-empire':1,'tyranids':1};
const retained=new Set(['detachment-rule-sm-05b00954e4744b59','detachment-rule-sm-b0de270f61aa47ac','detachment-paragons-of-putrescence:rule']);
const enhancementOwners={'chaos-space-marines':'Chaos Lord','death-guard':'Plague Marines','tau-empire':'Stealth Battlesuits','tyranids':'Von Ryan’s Leapers'};
const equipmentFixtures={'adeptus-mechanicus:datasheet-sicarian-ruststalkers:section:1':'am-gait',
  'death-guard:datasheet-plague-drones:section:1':'dg-drones','death-guard:datasheet-plaguebearers:section:1':'dg-bearers',
  'emperors-children:datasheet-daemonettes:section:1':'ec-daemonettes','emperors-children:datasheet-seekers:section:1':'ec-seekers'};
const read=file=>parseSourceFixtureJSON(fs.readFileSync(path.join(repo,file),'utf8'));
const name=record=>record.data.title||record.data.name||record.displayName;
const norm=value=>String(value??'').replace(/[‘’]/g,"'").toLowerCase();
const cases=[];
for(const [bookId,file]of Object.entries(inputs)){
  const book=read(`books/${bookId}/v2/generated/${file}.json`),importPath=`books/${bookId}/v2/generated/roster-import.json`;
  const imports=fs.existsSync(path.join(repo,importPath))?read(importPath):book;
  const presentation=read(`books/${bookId}/v2/generated/app-presentation.json`),cards=new Map(presentation.cards.map(card=>[card.id,card]));
  let declarations=0;
  const unit=title=>{const record=book.entities.find(record=>record.kind==='DATASHEET'&&norm(name(record))===norm(title));assert.ok(record,title);return record;};
  const textFor=record=>{
    const members=(imports.importBindings?.compositions||[]).filter(member=>member.ownerId===record.id&&member.quantity.min>0);
    if(!members.length){
      const legacyQuantity={'unit-plague-marines':7,'unit-lord-of-contagion':1,'unit-lord-of-poxes':1}[record.id];
      assert.ok(bookId==='death-guard'&&legacyQuantity,'Missing native fixture composition');
      return legacyQuantity+'x '+name(record)+' (0 pts)';
    }
    assert.ok(members.length,'Recorded composition for '+record.id);
    return [members.reduce((sum,member)=>sum+member.quantity.min,0)+'x '+name(record)+' (0 pts)',
      ...members.map(member=>'• '+member.quantity.min+'x '+member.labels[0])].join('\n');
  };
  for(const rule of book.entities.filter(rule=>rule.kind!=='STRATAGEM'&&rule.ruleContract?.kind!=='STRATAGEM')){
    const effects=rule.ruleContract?.clauses.flatMap(clause=>clause.rosterEffects||[]).filter(effect=>
      effect.operation==='MODIFY_RULE_METRIC'&&['chargeRoll','advanceRoll','detectionRange','contagionRange'].includes(effect.field))||[];
    if(!effects.length)continue;declarations+=effects.length;
    const parent=book.entities.find(record=>record.id===rule.parentId);
    const owner=parent.kind==='DATASHEET'?parent:rule.kind==='ENHANCEMENT'?unit(enhancementOwners[bookId]):
      unit(rule.id==='detachment-rule-sm-05b00954e4744b59'?'Terminator Squad':
        rule.id==='detachment-rule-sm-b0de270f61aa47ac'?'Eliminator Squad':'Lord of Contagion');
    const detachment=parent.kind==='DETACHMENT'?parent:book.entities.find(record=>record.kind==='DETACHMENT');
    const gear=equipmentFixtures[bookId+':'+rule.id],charge=gear?chargeFixtures.find(fixture=>fixture.id===gear):
      bookId==='chaos-space-marines'?chargeFixtures.find(fixture=>fixture.id===(rule.kind==='ENHANCEMENT'?'csm-symbiote':'csm-daemonkin')):null;
    const text=charge?.text||['+ FACTION KEYWORD: '+bookId,'+ DETACHMENT: '+name(detachment),textFor(owner),
      ...(rule.kind==='ENHANCEMENT'?['Enhancement: '+name(rule)]:[])].join('\n');
    cases.push({bookId,ruleId:rule.id,title:name(rule),effects:effects.map(effect=>effect.field),text,charge,cards});
  }
  assert.equal(declarations,counts[bookId],'Complete metric census: '+bookId);
}
assert.equal(cases.length,25,'Every metric-bearing rule in all nine books');
const runtimePaths=new Set(JSON.parse(fs.readFileSync(path.join(repo,'tools/pages-runtime-manifest.json'),'utf8')).files.map(file=>'/'+file.path));
const mime={'.html':'text/html','.mjs':'text/javascript','.js':'text/javascript','.json':'application/json','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg'};
const errors=[],missing=[],results=[],screenshots=[];
const server=http.createServer((request,response)=>{
  const address=decodeURIComponent(new URL(request.url,'http://local').pathname),file=path.resolve(repo,'.'+address);
  if(address==='/favicon.ico'){response.writeHead(204).end();return;}
  if(!file.startsWith(repo+path.sep)||!runtimePaths.has(address)&&!isApplicationTestDependency(address)||!fs.existsSync(file)){
    missing.push(address);response.writeHead(404).end();return;
  }
  response.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});response.end(fs.readFileSync(file));
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const origin='http://127.0.0.1:'+server.address().port;
const roster=async page=>{await page.locator('[data-v2-primary-nav] [data-v2-destination="ROSTER"]').click();await page.getByRole('textbox',{name:'New Recruit text export',exact:true}).waitFor();};
async function view(page,id,mode){
  await roster(page);
  if(mode==='Effective')await page.locator('[data-roster-instance-id="'+id+'"]').getByRole('button',{name:'Effective datasheet',exact:true}).click();
  else{await page.getByRole('button',{name:'Open personal guide',exact:true}).click();await page.locator('main a[data-target-id="roster-unit/'+id+'"]').click();}
  await page.locator('main .unit-card[data-roster-instance-id="'+id+'"]').waitFor();
}
function sourceFields(c,source){
  const card=c.cards.get(source.ruleId);assert.ok(card,'Canonical metric source card');
  return source.sourceFields.map(path=>{
    const pointer='/'+path.map(String).join('/');
    const fields=card.fields.filter(field=>field.source?.path===pointer||field.presentationPath===pointer);
    assert.equal(fields.length,1,'Unique canonical metric text field');return fields[0];
  });
}
async function inspect(page,c,mode,device){
  const before=await page.evaluate(()=>JSON.stringify(window.ArmyBookAppV2.roster.projection));
  for(const id of await page.locator('main .unit-card[data-roster-instance-id]').evaluateAll(nodes=>nodes.map(node=>node.dataset.rosterInstanceId))){
    const root=page.locator('main .unit-card[data-roster-instance-id="'+id+'"]');
    const effective=await page.evaluate(id=>window.ArmyBookAppV2.roster.effective(id),id);
    const sources=effective.applied.filter(source=>source.operation==='MODIFY_RULE_METRIC'&&c.effects.includes(source.field));
    const observed=await root.evaluate(node=>({
      fields:[...node.querySelectorAll('[data-fact-id]')].filter(field=>!field.closest('a,dialog,[hidden],details:not([open])')).map(field=>({id:field.dataset.factId,text:field.textContent,visible:!!field.getClientRects().length})),
      attached:[...node.querySelectorAll('[data-attached-rule-id]')].map(rule=>({id:rule.dataset.attachedRuleId,source:rule.dataset.sourceInstanceId,
        text:rule.querySelector('[data-attached-rule-text]')?.textContent,title:rule.querySelector('h5')?.textContent,visible:!!rule.getClientRects().length})),
      metrics:[...node.querySelectorAll('[data-unit-metric]')].map(metric=>({key:metric.dataset.unitMetric,ruleIds:JSON.parse(metric.dataset.ruleIds),modifier:Number(metric.dataset.metricModifier),text:metric.innerText})),
      profileMetrics:[...node.querySelectorAll('[data-profile-metric]')].map(metric=>({key:metric.dataset.profileMetric,text:metric.innerText})),
      section:!!node.querySelector('[data-datasheet-section="unit-modifiers"]')
    }));
    for(const source of sources){
      const fields=sourceFields(c,source);
      for(const field of fields){
        const native=source.sourceInstanceId===id&&observed.fields.some(node=>node.id===field.id&&node.text===field.value&&node.visible);
        const attached=observed.attached.some(node=>node.id===source.ruleId&&node.source===source.sourceInstanceId&&node.visible&&
          node.text===(field.value.startsWith(node.title+':')?field.value.slice(node.title.length+1):field.value));
        if(!retained.has(source.ruleId))assert.ok(native||attached,c.bookId+' '+c.title+' full source text on '+id);
        else assert.equal(native||attached,false,'Exception has no inline source text');
      }
      // Exercise the same production guard on a detached DOM clone. Keep the
      // fact identity and links but replace every full source with a caption.
      // This must not qualify as inline text; live UI/state remain untouched.
      const coverage=await root.evaluate(async(node,{source,card})=>{
        const {hasInlineUnitMetricSource}=await import('/books/shared/army-book-app-v2/datasheet-v1.mjs');
        const cards=new Map([[card.id,card]]),original=hasInlineUnitMetricSource(node,source,cards),copy=node.cloneNode(true);
        const ids=new Set(card.fields.map(field=>field.id));
        for(const value of copy.querySelectorAll('[data-fact-id]'))if(ids.has(value.dataset.factId))value.textContent=card.title;
        for(const block of copy.querySelectorAll('[data-attached-rule-id]'))if(block.dataset.attachedRuleId===source.ruleId)
          block.querySelector('[data-attached-rule-text]').textContent=card.title;
        for(const block of copy.querySelectorAll('[data-detachment-rule-id]'))if(block.dataset.detachmentRuleId===source.ruleId)
          for(const value of block.querySelectorAll('[data-detachment-field-text]'))value.textContent=card.title;
        return {original,captionOnly:hasInlineUnitMetricSource(copy,source,cards)};
      },{source,card:c.cards.get(source.ruleId)});
      assert.equal(coverage.original,!retained.has(source.ruleId),'Production guard agrees with real visible text');
      assert.equal(coverage.captionOnly,false,'Matching identity/caption/link alone cannot hide a metric');
    }
    for(const metric of observed.metrics){
      assert.ok(metric.ruleIds.some(ruleId=>retained.has(ruleId)),'Only source-missing exceptions retain numeric rows');
      assert.equal(metric.modifier,effective.unitMetrics[metric.key].modifier,'Retained total is the unchanged complete executor result');
    }
    assert.equal(observed.section,observed.metrics.length>0,'No empty Unit modifiers section');
    const expectedUnitExceptions=(effective.unitMetricSources||[]).filter(source=>retained.has(source.ruleId));
    if(expectedUnitExceptions.length)assert.ok(observed.metrics.length,'Missing source text retains metric');
    const expectedProfileExceptions=sources.some(source=>retained.has(source.ruleId));
    assert.equal(observed.profileMetrics.length>0,expectedProfileExceptions&&effective.profiles.some(profile=>Object.keys(profile.metrics).length>0),'Range annotations yield only to complete source text');
    results.push({book:c.bookId,ruleId:c.ruleId,device,mode,instance:id,sources:sources.map(source=>source.ruleId),retained:observed.metrics,profileMetrics:observed.profileMetrics,status:'PASS'});
  }
  assert.equal(await page.evaluate(()=>JSON.stringify(window.ArmyBookAppV2.roster.projection)),before,'Display cannot alter effects or conditions');
}
let browser,completed=false;
try{
  const selected=cases.filter(c=>!option('--books')||option('--books').split(',').includes(c.bookId));
  assert.ok(selected.length,'Book filter must select a scenario');
  assert.ok(!option('--device')||['desktop','mobile'].includes(option('--device')),'Known browser viewport');
  browser=await launchChromium();
  console.log('Card display evidence: '+out);
  for(const [device,viewport]of [['desktop',{width:1440,height:1000}],['mobile',{width:390,height:844}]]){
    if(option('--device')&&option('--device')!==device)continue;
    for(const c of selected){
      const context=await browser.newContext({viewport,serviceWorkers:'block'}),page=await context.newPage();
      context.setDefaultTimeout(15000);
      page.on('pageerror',error=>errors.push(error.message));
      try{
        assert.equal((await page.goto(origin+'/v2/app.html')).status(),200,'Application entry must be served');
        await page.locator('[data-v2-book="'+c.bookId+'"]').click();
        await page.waitForFunction(()=>window.ArmyBookAppV2?.roster);await roster(page);
        await page.getByRole('textbox',{name:'New Recruit text export',exact:true}).fill(c.text);
        await page.locator('[data-roster-action="review-import"]').click();
        await page.waitForFunction(()=>!document.querySelector('.v2-roster[aria-busy="true"]'));
        const status=await page.locator('.v2-roster-status').innerText();
        const unresolved=await page.locator('select[aria-label^="Matching source entry"]').evaluateAll(nodes=>nodes.map(node=>node.getAttribute('aria-label')));
        assert.match(status,/^Roster imported\./,c.bookId+' '+c.title+' '+JSON.stringify(unresolved));
        if(c.charge?.bodyguard){
          await page.locator('[data-attachment-candidate-for="'+c.charge.bodyguard+'"]').selectOption(c.charge.source);
          await page.locator('[data-attachment-target-instance-id="'+c.charge.bodyguard+'"] [data-roster-action="attach"]').click();
        }
        const all=await page.evaluate(()=>window.ArmyBookAppV2.roster.projection.units.flatMap(unit=>unit.applied));
        assert.ok(all.some(source=>source.ruleId===c.ruleId&&source.operation==='MODIFY_RULE_METRIC'),'Fixture must activate the reviewed metric');
        for(const mode of ['Effective','Guide']){
          await view(page,c.charge?.bodyguard||'parsed-unit-1',mode);await inspect(page,c,mode,device);
        }
        const filename=device+'-'+c.bookId+'-'+cases.indexOf(c)+'.png';await page.screenshot({path:path.join(out,filename)});screenshots.push(filename);
        console.log('PASS '+device+' '+c.bookId+' '+c.title);
      }catch(error){process.exitCode=1;results.push({book:c.bookId,ruleId:c.ruleId,device,status:'NEW_FAIL',error:error.stack});console.error('FAIL '+device+' '+c.bookId+' '+c.title+': '+error.message);}
      finally{await context.close();fs.writeFileSync(path.join(out,'RESULTS.json'),JSON.stringify({results,errors,missing,screenshots},null,2));}
    }
  }
  assert.deepEqual(errors,[]);assert.deepEqual(missing,[]);completed=true;
}finally{
  fs.writeFileSync(path.join(out,'RESULTS.json'),JSON.stringify({status:completed&&!process.exitCode?'PASS':'NEW_FAIL',cases:cases.length,results,errors,missing,screenshots},null,2));
  if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));
}

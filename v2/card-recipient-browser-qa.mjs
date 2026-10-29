import {parseSourceFixtureJSON} from '../tests/helpers/source-refs-fixtures.mjs';
import {sourceSnapshot} from '../books/shared/source-refs-v2/source-refs.mjs';
/** F2: the real Personal Guide, physical components and source-bound clauses.
 * Constructed rosters are labelled below; the Deathshroud export is the owner's
 * unchanged New Recruit v37.6 text. All state changes use normal app controls. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {launchChromium} from '../tests/helpers/browser-launch.mjs';
import {isApplicationTestDependency} from '../books/shared/application-v2/browser-test-dependencies.mjs';

const sourceRepo=path.resolve(fileURLToPath(new URL('../',import.meta.url)));
const repo=path.resolve(process.env.F2_BROWSER_ROOT||sourceRepo);
const out=fs.mkdtempSync(path.join(os.tmpdir(),'wh-f2-card-recipients-browser-'));
const results=[],screenshots=[],errors=[],missing=[],requestFailures=[],consoleMessages=[];
const runtimeSourceBooks=new Map();
function runtimeSourceBook(bookId){
  if(!runtimeSourceBooks.has(bookId)){
    const files=[...manifest].filter(file=>file.startsWith('/books/'+bookId+'/v2/generated/')&&file.endsWith('.json')).sort();
    assert.ok(files.length,'The published book has actual source-bearing inputs');
    const catalogs={sourceRefCatalog:{},sourceLayoutCatalog:{},sourceContextCatalog:{}};
    for(const file of files){const input=parseSourceFixtureJSON(fs.readFileSync(path.join(repo,file.slice(1)),'utf8'));for(const key of Object.keys(catalogs))Object.assign(catalogs[key],input[key]||{});}
    runtimeSourceBooks.set(bookId,catalogs);
  }
  return runtimeSourceBooks.get(bookId);
}
const inventory=path.join(repo,fs.existsSync(path.join(repo,'tools/pages-runtime-manifest.json'))?'tools/pages-runtime-manifest.json':'PAGES_RUNTIME_MANIFEST.json');
const manifest=new Set(parseSourceFixtureJSON(fs.readFileSync(inventory,'utf8')).files.map(row=>'/'+row.path));
const allowed=address=>!/(?:\/sources\/|-qa\.|-fixtures\.)/.test(address)&&
  (manifest.has(address)||isApplicationTestDependency(address)||
   /^\/books\/(?:shared\/(?:application-v2|army-book-app-v2|roster-v2|rule-contract-v2)|(?:adeptus-mechanicus|death-guard|chaos-space-marines)\/v2)\/[\w./-]+\.(?:mjs|js|json|css)$/.test(address)||
   /^\/books\/(?:adeptus-mechanicus|death-guard|chaos-space-marines)\/assets\/[\w./-]+\.(?:png|webp|jpe?g|svg)$/.test(address));
const mime={'.html':'text/html','.mjs':'text/javascript','.js':'text/javascript','.json':'application/json','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg','.jpeg':'image/jpeg'};
const server=http.createServer((request,response)=>{
  const requested=decodeURIComponent(new URL(request.url,'http://localhost').pathname),address=requested==='/'?'/index.html':requested;
  if(address==='/favicon.ico'){response.writeHead(204);response.end();return;}
  const file=path.resolve(repo,'.'+address);
  if(!allowed(address)||!file.startsWith(repo+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){
    missing.push(address);response.writeHead(404);response.end();return;
  }
  response.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});response.end(fs.readFileSync(file));
});
const norm=value=>String(value).replace(/\s+/g,' ').replace(/[‘’]/g,"'").trim();
const halo='detachment-haloscreed-battle-clade:rule',forge='detachment-lords-of-the-forge:rule';
const fly='detachment-flyblown-host:rule',veterans='detachment-veterans-of-the-long-war:rule';
const constructed={
  am:`+ FACTION KEYWORD: Imperium - Adeptus Mechanicus
+ DETACHMENT: Haloscreed Battle Clade
+ DETACHMENT: Lords of the Forge
Char1: 1x Tech-priest Dominus (100 pts): Volkite blaster, Macrostubber, Omnissian axe
Enhancement: Cognitive Reinforcement
Char2: 1x Tech-priest Dominus (100 pts): Volkite blaster, Macrostubber, Omnissian axe
9x Servitor Battleclade (110 pts)
• 1x Servitor Underseer: Mechanicus pistol, Dataspikes
• 2x Gun Servitor: 2 with Heavy arc rifle, Servo-claw
• 6x Combat Servitor: 6 with Phosphor blaster, Servo-claw
10x Skitarii Rangers (85 pts): 10x Galvanic rifle, 10x Close combat weapon
10x Skitarii Rangers (85 pts): 10x Galvanic rifle, 10x Close combat weapon`,
  dg:`+ FACTION KEYWORD: Chaos - Death Guard
+ DETACHMENT: Flyblown Host
7x Plague Marines (125 pts)
• 1x Plague Champion: Boltgun, Plague knives
• 6x Plague Marine: Boltgun, Plague knives
1x Malignant Plaguecaster (65 pts)
• 1x Malignant Plaguecaster: Bolt pistol, Plague Wind, Corrupted staff
1x Biologus Putrifier (60 pts)
• 1x Biologus Putrifier: Hyper blight grenades, Injector pistol, Plague knives
5x Blightlord Terminators (185 pts)
1x Lord of Virulence (80 pts)
• 1x Lord of Virulence: Twin plague spewer, Power fist`,
  csm:`+ FACTION KEYWORD: Chaos - Chaos Space Marines
+ DETACHMENT: Veterans of the Long War
1x Chaos Lord (95 pts)
• 1x Chaos Lord: Plasma pistol, Daemon hammer
1x Master of Executions (80 pts)
• 1x Master of Executions: Bolt pistol, Axe of dismemberment
5x Legionaries (95 pts)
• 1x Aspiring Champion: Bolt pistol, Boltgun, Close combat weapon
• 4x Legionaries: Bolt pistol, Boltgun, Close combat weapon
5x Legionaries (95 pts)
• 1x Aspiring Champion: Bolt pistol, Boltgun, Close combat weapon
• 4x Legionaries: Bolt pistol, Boltgun, Close combat weapon`
};
const ready=page=>page.waitForFunction(()=>window.ArmyBookAppV2?.roster);
async function roster(page){
  await page.locator('[data-v2-primary-nav] [data-v2-destination="ROSTER"]').click();
  await page.getByRole('textbox',{name:'New Recruit text export',exact:true}).waitFor();
}
async function imported(page,text,count){
  await roster(page);await page.getByRole('textbox',{name:'New Recruit text export',exact:true}).fill(text);
  await page.locator('[data-roster-action="review-import"]').click();
  await page.waitForFunction(()=>!document.querySelector('.v2-roster[aria-busy="true"]'));
  assert.match(await page.locator('.v2-roster-status').innerText(),/^Roster imported\./);
  const state=await page.evaluate(()=>window.ArmyBookAppV2.roster.snapshot());assert.equal(state.units.length,count);return state;
}
async function attach(page,leader,bodyguard){
  await roster(page);await page.locator('[data-attachment-candidate-for="'+bodyguard+'"]').selectOption(leader);
  await page.locator('[data-attachment-target-instance-id="'+bodyguard+'"] [data-roster-action="attach"]').click();
  await page.locator('[data-attached-leader-instance-id="'+leader+'"]').waitFor();
}
async function detach(page,leader){
  await roster(page);await page.locator('[data-roster-action="detach"][data-leader-instance-id="'+leader+'"]').click();
  await page.locator('[data-attached-leader-instance-id="'+leader+'"]').waitFor({state:'hidden'});
}
async function guide(page,instance){
  await roster(page);await page.getByRole('button',{name:'Open personal guide',exact:true}).click();
  await page.locator('main a[data-target-id="roster-unit/'+instance+'"]').click();
  await page.locator('main .unit-card[data-roster-instance-id="'+instance+'"]').waitFor();
  assert.doesNotMatch(await page.locator('main').innerText(),/:rule:table:|table-\d+-row-\d+|source-clause-/i,'Internal source addresses are never visible text');
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,'No horizontal overflow');
}
const card=(page,instance)=>page.locator('main .unit-card[data-roster-instance-id="'+instance+'"]');
async function current(page){return page.evaluate(()=>({snapshot:window.ArmyBookAppV2.roster.snapshot(),projection:window.ArmyBookAppV2.roster.projection}));}
async function rows(page,instance,ruleId){return card(page,instance).locator('.ds-conditional-policy[data-conditional-policy="DETACHMENT_TEXT"]').evaluateAll((nodes,ruleId)=>nodes.flatMap(node=>{
  const source=JSON.parse(node.dataset.policySource||'{}');if(source.ruleId!==ruleId)return [];
  const text=node.querySelector('[data-detachment-clause-text]')||document.getElementById(node.dataset.detachmentClauseTextRef);
  const fieldRefs=JSON.parse(node.dataset.detachmentClauseFieldRefs||'[]');
  const fields=fieldRefs.map(id=>document.getElementById(id));
  // A shared text field can contain an inline source table. The canonical F1
  // flat clause keeps those fields separate and appends its referenced table;
  // reconstruct that contract from the actual visible text/table DOM only.
  const textWithoutTables=current=>current.nodeType===Node.TEXT_NODE?current.textContent:
    current.nodeType===Node.ELEMENT_NODE&&current.matches('table[data-detachment-source-table]')?'':
    [...current.childNodes].map(textWithoutTables).join('');
  const tableText=table=>[...table.querySelectorAll('tr')].map(row=>[...row.querySelectorAll('th,td')].map(cell=>cell.textContent).join(' · ')).join('\n');
  const fieldText=field=>!field?null:field.matches('table[data-detachment-source-table]')?tableText(field):textWithoutTables(field);
  const fieldEvidence=fields.map((field,index)=>({id:fieldRefs[index],exists:Boolean(field),visible:Boolean(field?.getClientRects().length),
    kind:field?.matches('table[data-detachment-source-table]')?'TABLE':'TEXT',text:fieldText(field)}));
  return [{source,subject:node.dataset.recipientSubject,instances:JSON.parse(node.dataset.recipientInstanceIds),models:JSON.parse(node.dataset.recipientModelScopeIds),
    classification:node.dataset.rosterClassification,execution:node.dataset.execution,status:node.dataset.selectionStatus,
    text:fieldRefs.length?fieldEvidence.map(field=>field.text).join('\n'):text?.textContent,fieldRefs,fields:fieldEvidence,
    evidence:node.dataset.detachmentClauseEvidence?JSON.parse(node.dataset.detachmentClauseEvidence):null,
    conditions:node.dataset.detachmentClauseConditions?JSON.parse(node.dataset.detachmentClauseConditions):null,
    body:node.innerText,applies:[...node.querySelectorAll('p')].map(p=>p.innerText).filter(text=>text.startsWith('Applies to:')),
    links:[...node.querySelectorAll('a[data-target-id]')].map(a=>a.dataset.targetId)}];
}),ruleId);}
async function validateClauses(page,instance,ruleId,{expectedClauses,localLabel,subject,recipients,status}={}){
  const shown=await rows(page,instance,ruleId),data=await current(page),physical=data.projection.units.find(unit=>unit.instanceId===instance);
  const sourceBook=runtimeSourceBook(data.snapshot.bookId);
  const canonical=data.projection.units.flatMap(unit=>unit.conditional).filter(row=>row.ruleId===ruleId&&row.detachmentText);
  assert.equal(await card(page,instance).locator('[data-detachment-rule-id="'+ruleId+'"]').count(),1,'Exactly one outer rule block in this physical datasheet');
  if(expectedClauses)assert.deepEqual(shown.map(row=>row.source.clauseId).toSorted(),[...expectedClauses].toSorted(),'Every independently named clause remains individually inspectable');
  assert.ok(shown.length,'Expected source-bound physical clause');
  for(const row of shown){
    const proof=canonical.find(proof=>proof.clauseId===row.source.clauseId&&proof.recipientInstanceIds.includes(instance));assert.ok(proof,'Current executed proof contains physical recipient');
    assert.ok(row.fields.every(field=>field.exists&&field.visible),'Every source-field reference resolves to actual visible content');
    assert.equal(norm(row.text),norm(proof.detachmentText.text),'Exact canonical clause text is retained, directly or by shared DOM reference');
    assert.deepEqual(sourceSnapshot(row.source,{book:sourceBook}),sourceSnapshot(proof,{book:sourceBook,slot:'sourceProvenance'}),'Source provenance is retained for every clause');
    assert.deepEqual(row.instances,proof.recipientInstanceIds,'Full effective recipient set is not rewritten for local labels');
    assert.deepEqual(row.models,proof.recipientModelScopeIds);assert.equal(row.classification,'BATTLE_ONLY');assert.equal(row.execution,'CONDITIONAL_TEXT_ONLY');
    assert.equal(row.status,proof.detachmentText.kind);if(status)assert.equal(row.status,status);if(subject)assert.equal(row.subject,subject);
    if(recipients)assert.deepEqual(row.instances.toSorted(),[...recipients].toSorted());
    assert.ok(row.links.includes(ruleId),'Each clause keeps source links');assert.match(row.body,/Not automatically calculated/);
    if(row.status==='ELIGIBLE_FOR_SELECTION'){assert.match(row.body,/Selection not recorded/);assert.doesNotMatch(row.body,/Effect applied|Selection recorded|Selected —/);}
    assert.equal(row.applies.length,1,'Each clause has its own recipient/status annotation');
    if(localLabel)assert.ok(row.applies[0].toLowerCase().includes(localLabel.toLowerCase()),'Recipient caption names this component');
    assert.ok(!physical.applied.some(effect=>effect.ruleId===ruleId&&effect.clauseId===row.source.clauseId),'This text-only clause is never executed; independent roster clauses of the same rule retain existing effects');
  }
  return shown;
}
async function screen(page,name){const file=path.join(out,name+'.png');await page.screenshot({path:file,fullPage:true});screenshots.push(file);}
async function weaponNote(page,instance,weapon,expected,expectedRows=1){
  const visible=card(page,instance),weapons=visible.locator('.weapon-row').filter({has:page.locator('.weapon-button').filter({hasText:weapon})});
  assert.equal(await weapons.count(),expectedRows,'Each canonical displayed weapon profile is grouped once');
  const notes=await weapons.locator('.ds-weapon-grant-sources').evaluateAll(nodes=>nodes.map(node=>({text:node.innerText,sources:JSON.parse(node.dataset.weaponGrantSources)})));
  const vector=notes.filter(note=>note.sources.some(source=>source.canonicalRuleId==='datasheet-lord-of-contagion:section:1'));
  assert.equal(vector.length,expectedRows*2,'The two actual Vector effects stay separate for every weapon profile');
  for(const note of vector)assert.ok(note.text.includes('Applies to: '+expected),'Explicit physical carrier counts: '+note.text);
  return {weapon,text:(await weapons.allInnerTexts()).join('\n'),vector};
}
async function ownWeaponCarriers(page,instance,profiles,{rules,label,profileId,contributionCounts={}}){
  const evidence=[];
  for(const id of profiles){
    const weapon=card(page,instance).locator('.weapon-row[data-card-id="'+id+'"]');assert.equal(await weapon.count(),1,'Exact selected weapon-profile identity');
    const notes=await weapon.locator('.ds-weapon-grant-sources').evaluateAll(nodes=>nodes.map(node=>({text:node.innerText,
      sources:JSON.parse(node.dataset.weaponGrantSources),carriers:JSON.parse(node.dataset.physicalCarriers||'null')})));
    for(const ruleId of rules){
      const contributions=notes.filter(note=>note.sources.some(source=>source.canonicalRuleId===ruleId&&source.targetWeaponProfileId===id));
      assert.equal(contributions.length,contributionCounts[ruleId]||1,'All distinct actual source contributions are shown on exact physical weapon profile '+id+'/'+ruleId);
      for(const note of contributions){
        assert.ok(note.text.includes('Applies to: '+label+' · 1 model'),'Visible caption names exactly the one physical model, not its weapon');
        assert.ok(Array.isArray(note.carriers)&&note.carriers.length,'The renderer exposes the actual physical-carrier evidence');
        for(const group of note.carriers){
          assert.equal(group.instanceId,instance);assert.equal(group.profileId,profileId);
          assert.equal(group.label,label,'Exact independently expected model label');assert.equal(group.quantity,1,'One physical bearer regardless of weapon copies');
          assert.deepEqual(group.labelIdentity,{kind:'PROFILE',canonicalId:profileId,instanceId:instance},'Typed label identity belongs to the MODEL profile, never a weapon');
          assert.ok(group.members.length&&group.members.every(member=>member.quantity===1),'Every contribution has an explicit single-model proof');
        }
        const sources=note.sources.filter(source=>source.canonicalRuleId===ruleId&&source.targetWeaponProfileId===id);
        assert.ok(sources.every(source=>source.targetInstanceId===instance),'Exact physical recipient identity is retained');
        assert.ok(sources.every(source=>source.clauseId&&source.effectId),'Executed clause/effect identities are retained');
        evidence.push({weaponProfileId:id,ruleId,note});
      }
    }
  }
  return evidence;
}
async function noosphericTable(page,instance){
  const outer=card(page,instance).locator('[data-detachment-rule-id="'+halo+'"]');
  const text=outer.locator('[data-detachment-field-text]'),table=outer.locator('table[data-detachment-source-table]');
  assert.equal(await text.count(),1,'Noospheric canonical text field is visible once across both clauses');
  assert.equal(await table.count(),1,'Noospheric canonical source table is visible once');
  const cells=await table.locator('tr').evaluateAll(rows=>rows.map(row=>[...row.querySelectorAll('th,td')].map(cell=>cell.textContent)));
  assert.deepEqual(cells,[['INCURSION:','1 UNIT'],['STRIKE FORCE','2 UNITS'],['ONSLAUGHT','3 UNITS']],'The existing three battle-size source rows are complete and separate cells');
  const rule=parseSourceFixtureJSON(fs.readFileSync(path.join(repo,'books/adeptus-mechanicus/v2/generated/roster-runtime.json'),'utf8')).entities.find(entity=>entity.id===halo);
  const placement=await outer.evaluate(outer=>{
    const field=outer.querySelector('[data-detachment-field-text]'),table=outer.querySelector('table[data-detachment-source-table]'),tokens=[];
    function visit(node){if(node===table){tokens.push({kind:'TABLE'});return;}if(node.nodeType===Node.TEXT_NODE){tokens.push({kind:'TEXT',text:node.textContent});return;}for(const child of node.childNodes)visit(child);}
    visit(field);const marker=tokens.findIndex(token=>token.kind==='TABLE');
    return {inline:field.contains(table),before:marker<0?null:tokens.slice(0,marker).map(token=>token.text||'').join(''),after:marker<0?null:tokens.slice(marker+1).map(token=>token.text||'').join(''),
      fieldText:tokens.filter(token=>token.kind==='TEXT').map(token=>token.text).join(''),
      followsField:Boolean(field.compareDocumentPosition(table)&Node.DOCUMENT_POSITION_FOLLOWING)};
  });
  assert.equal(norm(placement.fieldText),norm(rule.data.text),'One visible field retains the full canonical prose without truncation');
  if(process.env.F2_AM_TABLE_PLACEMENT==='APPENDED'){
    if(placement.inline){assert.equal(norm(placement.before),norm(rule.data.text),'An ambiguous anchor places the table only after all canonical text');assert.equal(norm(placement.after),'','No arbitrary middle anchor is selected');}
    else assert.equal(placement.followsField,true,'The complete source table is preserved after the field when its anchor is ambiguous');
  }else{
    const quote=rule.ruleContract.clauses.find(clause=>clause.id==='halo-override-selection').evidence.quote;
    assert.equal(rule.data.text.split(quote).length,2,'Normal accepted source has one exact structural anchor');
    assert.equal(placement.inline,true,'The actual source table belongs inside the shared source text field');
    assert.equal(norm(placement.before),norm(quote),'The source table follows the complete exact leading evidence, ending as follows:');
    assert.equal(norm(placement.after),norm(rule.data.text.slice(rule.data.text.indexOf(quote)+quote.length)),'The remaining source prose follows the table without duplication or loss');
  }
  const shown=await rows(page,instance,halo);assert.deepEqual(shown.map(row=>row.source.clauseId).toSorted(),['halo-override-selection','override-choice'].toSorted());
  for(const row of shown){const clause=rule.ruleContract.clauses.find(clause=>clause.id===row.source.clauseId);
    assert.deepEqual(row.evidence,clause.evidence,'Each independently addressed clause keeps its source evidence');
    assert.deepEqual(row.conditions,clause.conditions||[],'Different clause conditions are not merged into the shared prose');
  }
  assert.deepEqual(shown.map(row=>row.fields.map(field=>field.kind)),[['TEXT','TABLE'],['TEXT']],'Each distinct clause retains exactly its own canonical field references');
  assert.equal(shown[0].fieldRefs[0],shown[1].fieldRefs[0],'Both clauses reference the same visible canonical text');
  return {cells,placement,clauses:shown};
}

await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const origin='http://127.0.0.1:'+server.address().port;
let browser;
try{
  browser=await launchChromium();
  assert.ok(!process.env.F2_BROWSER_DEVICE||['desktop','mobile'].includes(process.env.F2_BROWSER_DEVICE),'Unknown device filter');
  assert.ok(!process.env.F2_AM_TABLE_PLACEMENT||process.env.F2_AM_TABLE_PLACEMENT==='APPENDED','Unknown table-placement fixture mode');
  const families=['DG Omega physical blade carriers','Owner Deathshroud New Recruit v37.6','AM-1 clauses and local recipients','DG-1 Verminous Haze local components','CSM Veterans three physical datasheets','EC native Lord Exultant physical bearer'];
  assert.ok(!process.env.F2_BROWSER_CASE||families.includes(process.env.F2_BROWSER_CASE),'Unknown scenario filter');
  for(const [device,viewport]of [['desktop',{width:1440,height:1000}],['mobile',{width:390,height:844}]].filter(([device])=>!process.env.F2_BROWSER_DEVICE||process.env.F2_BROWSER_DEVICE===device)){
    async function run(book,name,work){
      if(process.env.F2_BROWSER_CASE&&process.env.F2_BROWSER_CASE!==name)return;
      const context=await browser.newContext({viewport}),page=await context.newPage();page.setDefaultTimeout(60000);
      page.on('console',message=>consoleMessages.push({device,name,type:message.type(),text:message.text()}));
      page.on('pageerror',error=>errors.push({device,name,message:error.message}));
      page.on('requestfailed',request=>{if(!request.failure()?.errorText.includes('ERR_ABORTED'))requestFailures.push({device,name,url:request.url(),error:request.failure()?.errorText});});
      try{await page.goto(origin+'/v2/app.html');await page.locator('[data-v2-book="'+book+'"]').click();await ready(page);const evidence=await work(page);
        results.push({device,name,status:'PASS',...evidence});console.log('PASS F2 '+device+' '+name);
      }catch(error){results.push({device,name,status:'FAIL',error:error.stack,body:await page.locator('body').innerText().catch(()=>''),url:page.url()});throw error;}
      finally{await context.close();}
    }
    await run('death-guard','DG Omega physical blade carriers',async page=>{
      const state=await imported(page,fs.readFileSync(path.join(sourceRepo,'books/death-guard/v2/fixtures/omega-megaroster.txt'),'utf8'),38);
      assert.equal(state.units[33].canonicalUnitId,'unit-lord-of-contagion');assert.equal(state.units[7].canonicalUnitId,'unit-blightlord-terminators');
      await attach(page,'parsed-unit-34','parsed-unit-8');await guide(page,'parsed-unit-8');
      const proof=await weaponNote(page,'parsed-unit-8','Bubotic blade','Blightlord Champion · 1 model; Blightlord Terminator · 3 models');
      assert.match(proof.text,/×4/);await screen(page,device+'-omega-vector-physical-carriers');return {proof,expected:'Champion1 + Terminator3'};
    });
    await run('death-guard','Owner Deathshroud New Recruit v37.6',async page=>{
      const state=await imported(page,fs.readFileSync(path.join(sourceRepo,'v2/fixtures/f2-deathshroud-newrecruit.txt'),'utf8'),2);
      assert.deepEqual(state.units.map(unit=>unit.canonicalUnitId),['unit-lord-of-contagion','unit-deathshroud-terminators']);
      await attach(page,'parsed-unit-1','parsed-unit-2');await guide(page,'parsed-unit-2');
      const proof=await weaponNote(page,'parsed-unit-2','Manreaper','Deathshroud Terminator Champion · 1 model; Deathshroud Terminator · 2 models',2);
      const own=await ownWeaponCarriers(page,'parsed-unit-1',[1,2].map(number=>'datasheet-lord-of-contagion:weapon:'+number),{
        rules:['datasheet-lord-of-contagion:section:1','detachment-virulent-vectorium:enhancement:2'],label:'Lord of Contagion',profileId:'datasheet-lord-of-contagion:profile:default',
        contributionCounts:{'datasheet-lord-of-contagion:section:1':2}});
      const gauntlets=card(page,'parsed-unit-2').locator('.weapon-row').filter({has:page.locator('.weapon-button').filter({hasText:'Plaguespurt gauntlet'})});
      assert.equal(await gauntlets.count(),1);assert.match(await gauntlets.innerText(),/×4/);assert.equal(await gauntlets.locator('.ds-weapon-grant-sources').count(),0,'Do not invent an Applies-to effect for gauntlets');
      await screen(page,device+'-owner-deathshroud-vector');return {proof,own,realExport:true,gauntletWeapons:4,gauntletEffectInvented:false};
    });
    await run('adeptus-mechanicus','AM-1 clauses and local recipients',async page=>{
      await imported(page,constructed.am,5);await attach(page,'parsed-unit-1','parsed-unit-3');await attach(page,'parsed-unit-2','parsed-unit-4');
      const evidence=[];
      async function verify(stage){
        await guide(page,'parsed-unit-3');
        evidence.push({stage,ownImperatives:await ownWeaponCarriers(page,'parsed-unit-1',[3,5].map(number=>'datasheet-tech-priest-dominus:weapon:'+number),{
          rules:['army-rule-doctrina-imperatives:protector-imperative','army-rule-doctrina-imperatives:conqueror-imperative'],label:'Tech-priest Dominus',profileId:'datasheet-tech-priest-dominus:profile:default'})});
        for(const [instance,label,other]of [['parsed-unit-3','Servitor Underseer','Tech-priest Dominus'],['parsed-unit-1','Tech-priest Dominus','Servitor Underseer']]){
          const shown=await validateClauses(page,instance,halo,{expectedClauses:['halo-override-selection','override-choice'],localLabel:label,subject:'UNIT',recipients:['parsed-unit-1','parsed-unit-3'],status:'ELIGIBLE_FOR_SELECTION'});
          assert.ok(shown.every(row=>!row.applies.join(' ').includes(other)),'UNIT Applies to stays local to this datasheet');evidence.push({stage,instance,rule:halo,shown});
        }
        const underseer=await validateClauses(page,'parsed-unit-3',forge,{expectedClauses:['baffling-data-screed'],localLabel:'Servitor Underseer',subject:'MODEL',status:'ABILITY_PRESENT'});
        assert.ok(underseer.every(row=>!row.applies.join(' ').match(/Gun Servitor|Combat Servitor|Tech-priest Dominus/)));
        await guide(page,'parsed-unit-4');
        const dominus=await validateClauses(page,'parsed-unit-2',forge,{expectedClauses:['baffling-data-screed'],localLabel:'Tech-priest Dominus',subject:'MODEL',status:'ABILITY_PRESENT'});
        assert.equal((await rows(page,'parsed-unit-4',forge)).length,0,'MODEL-only Baffling never leaks to attached Rangers');
        assert.deepEqual(dominus[0].instances,['parsed-unit-2']);assert.ok(dominus[0].models.every(scope=>scope.startsWith('parsed-unit-2/')));
        await validateClauses(page,'parsed-unit-4',halo,{expectedClauses:['halo-override-selection','override-choice'],localLabel:'Skitarii Rangers',subject:'UNIT'});
        evidence.push({stage,instance:'parsed-unit-4',canonicalSourceTable:await noosphericTable(page,'parsed-unit-4')});
        assert.equal((await current(page)).projection.units.find(unit=>unit.instanceId==='parsed-unit-4').keywords.includes('HALO OVERRIDE'),false);
      }
      await verify('attached');await screen(page,device+'-am-grouped-clauses');
      await page.reload();await ready(page);await verify('reload');
      await detach(page,'parsed-unit-1');await guide(page,'parsed-unit-1');
      await validateClauses(page,'parsed-unit-1',halo,{expectedClauses:['halo-override-selection','override-choice'],recipients:['parsed-unit-1'],localLabel:'Tech-priest Dominus'});
      await guide(page,'parsed-unit-3');await validateClauses(page,'parsed-unit-3',halo,{expectedClauses:['halo-override-selection','override-choice'],recipients:['parsed-unit-3'],localLabel:'Servitor Underseer'});
      await attach(page,'parsed-unit-1','parsed-unit-3');await verify('reattached');return {evidence};
    });
    await run('death-guard','DG-1 Verminous Haze local components',async page=>{
      await imported(page,constructed.dg,5);await attach(page,'parsed-unit-2','parsed-unit-1');await attach(page,'parsed-unit-3','parsed-unit-1');await attach(page,'parsed-unit-5','parsed-unit-4');
      const evidence=[];
      async function verify(stage){
        await guide(page,'parsed-unit-1');
        for(const [instance,label]of [['parsed-unit-1','Plague Marine'],['parsed-unit-2','Malignant Plaguecaster'],['parsed-unit-3','Biologus Putrifier']]){
          const shown=await validateClauses(page,instance,fly,{expectedClauses:['selected-infiltrators'],localLabel:label,subject:'UNIT',recipients:['parsed-unit-1','parsed-unit-2','parsed-unit-3'],status:'ELIGIBLE_FOR_SELECTION'});
          for(const forbidden of ['Plague Marine','Malignant Plaguecaster','Biologus Putrifier'].filter(other=>other!==label))assert.ok(!shown[0].applies[0].includes(forbidden),'Local caption excludes other physical components');
          evidence.push({stage,instance,shown});
        }
        await guide(page,'parsed-unit-4');assert.equal((await rows(page,'parsed-unit-4',fly)).length,0);assert.equal((await rows(page,'parsed-unit-5',fly)).length,0,'Lord of Virulence does not inherit unrelated PM eligibility');
      }
      await verify('attached');await guide(page,'parsed-unit-1');await screen(page,device+'-dg-per-component-haze');
      await page.reload();await ready(page);await verify('reload');
      await detach(page,'parsed-unit-2');await guide(page,'parsed-unit-2');assert.equal((await rows(page,'parsed-unit-2',fly)).length,0,'Detached caster loses former UNIT recipient proof');
      await guide(page,'parsed-unit-1');await validateClauses(page,'parsed-unit-1',fly,{expectedClauses:['selected-infiltrators'],recipients:['parsed-unit-1','parsed-unit-3'],localLabel:'Plague Marine'});
      await attach(page,'parsed-unit-2','parsed-unit-1');await verify('reattached');return {evidence};
    });
    await run('chaos-space-marines','CSM Veterans three physical datasheets',async page=>{
      await imported(page,constructed.csm,4);await attach(page,'parsed-unit-1','parsed-unit-3');await attach(page,'parsed-unit-2','parsed-unit-3');const evidence=[];
      async function verify(stage){await guide(page,'parsed-unit-3');
        for(const [instance,label,caption]of [['parsed-unit-3','Legionaries','Aspiring Champion · 1 model; Legionaries · 4 models'],['parsed-unit-1','Chaos Lord','Chaos Lord · 1 model'],['parsed-unit-2','Master of Executions','Master of Executions · 1 model']]){
          const shown=await validateClauses(page,instance,veterans,{expectedClauses:['source-clause-1-1'],subject:'MODEL',recipients:[instance],localLabel:label,status:'CONDITIONAL'});
          assert.equal(shown[0].applies[0].toLowerCase(),('Applies to: '+caption).toLowerCase(),'Known MODEL groups retain their exact component-local quantities');
          assert.doesNotMatch(shown[0].applies[0],/unresolved/i,'These imported physical group sizes are known');
          assert.ok(shown[0].models.every(scope=>scope.startsWith(instance+'/')),'MODEL addresses cannot cross component identity');evidence.push({stage,instance,shown});
        }
      }
      await verify('attached');await screen(page,device+'-csm-veterans-three-datasheets');await page.reload();await ready(page);await verify('reload');
      await detach(page,'parsed-unit-2');await guide(page,'parsed-unit-3');assert.equal(await card(page,'parsed-unit-2').count(),0,'Detached second Character is no longer a formed component');
      await guide(page,'parsed-unit-2');await validateClauses(page,'parsed-unit-2',veterans,{expectedClauses:['source-clause-1-1'],recipients:['parsed-unit-2'],localLabel:'Master of Executions'});
      await attach(page,'parsed-unit-2','parsed-unit-3');await verify('reattached');return {evidence};
    });
    await run('emperors-children','EC native Lord Exultant physical bearer',async page=>{
      const fixtures=parseSourceFixtureJSON(fs.readFileSync(path.join(sourceRepo,'books/emperors-children/v2/roster-import-fixtures.json'),'utf8'));
      const fixture=fixtures.fixtures.find(item=>item.id==='character-bodyguard');assert.ok(fixture,'Existing native EC import fixture');
      const state=await imported(page,fixture.text,2);assert.deepEqual(state.units.map(unit=>unit.canonicalUnitId),['unit-lord-exultant','unit-infractors']);
      await attach(page,'parsed-unit-1','parsed-unit-2');await guide(page,'parsed-unit-1');
      // Four physical weapons retain both canonical Plasma pistol modes.
      const evidence=await ownWeaponCarriers(page,'parsed-unit-1',[1,2,3,5,7].map(number=>'datasheet-lord-exultant:weapon:'+number),{
        rules:['datasheet-lord-exultant:section:1'],label:'Lord Exultant',profileId:'datasheet-lord-exultant:profile:1'});
      await screen(page,device+'-ec-lord-exultant-own-carriers');return {fixture:fixture.id,physicalWeapons:4,canonicalWeaponModes:5,evidence};
    });
  }
  assert.equal(errors.length,0,'No uncaught browser errors');assert.equal(missing.length,0,'No missing runtime resources');assert.equal(requestFailures.length,0,'No failed runtime requests');
  assert.equal(results.length,(process.env.F2_BROWSER_CASE?1:6)*(process.env.F2_BROWSER_DEVICE?1:2),'Every selected family actually executed on its requested viewports');
}finally{
  fs.writeFileSync(path.join(out,'results.json'),JSON.stringify({browser:browser?.version(),root:repo,filters:{case:process.env.F2_BROWSER_CASE||null,device:process.env.F2_BROWSER_DEVICE||null},viewports:[{width:1440,height:1000},{width:390,height:844}],results,errors,missing,requestFailures,consoleMessages,screenshots},null,2)+'\n');
  console.log('F2 browser evidence: '+out);if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));
}

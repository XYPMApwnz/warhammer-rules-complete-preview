/** O-1: independent accepted-source text checks through normal player controls.
 * These are constructed New Recruit-compatible inputs, not real user exports.
 * Browser evaluation only reads state/DOM; it never injects roster or UI state. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {launchChromium} from '../tests/helpers/browser-launch.mjs';
import {isApplicationTestDependency} from '../books/shared/application-v2/browser-test-dependencies.mjs';

const repo=path.resolve(fileURLToPath(new URL('../',import.meta.url)));
const option=name=>process.argv.find(arg=>arg.startsWith(name+'='))?.slice(name.length+1);
const out=path.resolve(option('--out')||fs.mkdtempSync(path.join(os.tmpdir(),'wh-o1-browser-')));
assert.ok(out!==repo&&!out.startsWith(repo+path.sep),'Keep browser evidence outside the repository');
fs.mkdirSync(out,{recursive:true});
const norm=value=>String(value).replace(/\s+/g,' ').replace(/[‘’]/g,"'").trim();
const sourceBooks=Object.fromEntries(['death-guard','adeptus-mechanicus'].map(book=>[book,
  JSON.parse(fs.readFileSync(path.join(repo,'books',book,'sources/waha-11e-current-2026-09-25/corpus.json'),'utf8'))]));
const cases=[];
function scenario(book,rule,leader,bodyguard,{enhancement=false,reverse=false,negative=[]}={}){
  const corpus=sourceBooks[book],owner=reverse?bodyguard:leader;
  let source,detachment;
  if(enhancement){
    detachment=corpus.detachments.find(row=>row.enhancements.some(row=>norm(row.title)===norm(rule)));
    source=detachment?.enhancements.find(row=>norm(row.title)===norm(rule));
  }else{
    const datasheet=corpus.datasheets.find(row=>norm(row.title).toLowerCase()===norm(owner).toLowerCase());
    source=datasheet?.sections.flatMap(row=>row.blocks).find(row=>norm(row.text).startsWith(norm(rule)+':'));
  }
  assert.ok(source?.text,'Missing independent accepted source for '+rule);
  const header='+ FACTION KEYWORD: '+(book==='death-guard'?'Chaos - Death Guard':'Imperium - Adeptus Mechanicus');
  const unitLine=name=>(/Poxwalkers|Skitarii/.test(name)&&!name.includes('Marshal')?'10':/Plague Marines/.test(name)?'7':/Deathshroud/.test(name)?'3':/Kastelan/.test(name)?'2':'1')+'x '+name+' (0 pts)';
  const text=[header,'+ DETACHMENT: '+(detachment?.title||(book==='death-guard'?'Virulent Vectorium':'Haloscreed Battle Clade')),
    unitLine(leader),...(enhancement?['Enhancement: '+source.title]:[]),unitLine(bodyguard),unitLine(bodyguard)].join('\n');
  cases.push({book,rule,leader,bodyguard,owner,enhancement,reverse,negative,text,
    quote:source.text,sourceId:source.sourceId||null,target:reverse?'parsed-unit-1':'parsed-unit-2',
    ownerInstance:reverse?'parsed-unit-2':'parsed-unit-1'});
}
const dg='death-guard',am='adeptus-mechanicus';
scenario(dg,'Foul Infusion','Biologus Putrifier','Plague Marines');
scenario(dg,'Unclean Icon','Icon Bearer','Plague Marines');
scenario(dg,'Vector of Disease','Lord of Contagion','Deathshroud Terminators',{negative:['Unholy Resilience']});
scenario(dg,'Sickening Vitality','Noxious Blightbringer','Poxwalkers');
scenario(dg,'Silent Bodyguard','Lord of Contagion','Deathshroud Terminators',{reverse:true});
scenario(dg,'Witherbone Pipes','Noxious Blightbringer','Poxwalkers',{enhancement:true});
scenario(dg,'Talisman of Burgeoning','Noxious Blightbringer','Poxwalkers',{enhancement:true});
scenario(dg,'Vile Vigour','Lord of Contagion','Deathshroud Terminators',{enhancement:true});
scenario(am,'Robotic Bodyguard','Cybernetica Datasmith','Kastelan Robots',{reverse:true});
scenario(am,'Lord of the Machine Cult','Tech-priest Dominus','Skitarii Rangers');
scenario(am,'Galvanic Field','Tech-priest Manipulus','Skitarii Rangers',{negative:['Defend the Divine Work']});
scenario(am,'Seekers of Divine Arcana','Technoarcheologist','Skitarii Rangers');
for(const [rule,leader,bodyguard]of [
  ['Transoracular Dyad Wafers','Cybernetica Datasmith','Kastelan Robots'],
  ['Martial Signatum Amplificator','Tech-priest Dominus','Skitarii Rangers'],
  ['Temporcopia','Tech-priest Dominus','Skitarii Rangers'],
  ['Genetor','Tech-priest Manipulus','Skitarii Rangers'],
  ['Artisan','Tech-priest Manipulus','Skitarii Rangers'],
  ['Clandestine Infiltrator','Skitarii Marshal','Skitarii Rangers'],
  ['Malphonic Susurrus','Tech-priest Dominus','Skitarii Rangers'],
  ['Peerless Eradicator','Tech-priest Dominus','Skitarii Rangers'],
  ['Electromiasmic Brazier','Tech-priest Dominus','Skitarii Rangers'],
  ['Vingh’s Wafers of Dynamism','Cybernetica Datasmith','Kastelan Robots'],
  ['Explorator Dispensation','Skitarii Marshal','Skitarii Rangers']
])scenario(am,rule,leader,bodyguard,{enhancement:true,negative:leader==='Skitarii Marshal'?['Control Edict']:[]});

// Cross-book fixtures use ordinary import controls and canonical source fields.
// No roster state or presentation objects are injected into the browser.
for(const [book,rule,leader,bodyguard,detachment,leaderText,bodyText]of [
  ['chaos-space-marines','Daemonkin (Psychic)','Master of Possession','Legionaries','Veterans of the Long War',
    '1x Master of Possession (65 pts): Bolt pistol, Rite of Possession, Staff of possession',
    '5x Legionaries (95 pts)\n• 1x Aspiring Champion: Bolt pistol, Boltgun, Close combat weapon\n• 4x Legionaries: Bolt pistol, Boltgun, Close combat weapon'],
  ['emperors-children','Perfectionists','Lord Exultant','Infractors','Court of the Phoenician',
    '1x Lord Exultant (95 pts): Bolt pistol, Plasma pistol, Phoenix power spear, Close combat weapon',
    '5x Infractors (95 pts)\n• 1x Obsessionist: Bolt pistol, Power sword\n• 4x Infractor: Bolt pistol, Duelling sabre'],
  ['tau-empire','Failure Is Not an Option','Ethereal','Strike Team','Kauyon','1x Ethereal (0 pts)',"10x Strike Team (0 pts)\n• 1x Fire Warrior Shas'ui\n• 9x Fire Warriors"],
  ['tyranids','Relentless Hunger','Hive Tyrant','Tyrant Guard','Unending Swarm','1x Hive Tyrant (0 pts)\nEnhancement: Relentless Hunger','3x Tyrant Guard (0 pts)'],
  ['space-marines','Honour of the Company','Ancient','Intercessor Squad','Gladius Task Force','1x Ancient (0 pts)','5x Intercessor Squad (0 pts)\n• 1x Intercessor Sergeant\n• 4x Intercessor'],
  ['blood-angels','Blood Chalice','Sanguinary Priest','Assault Intercessor Squad','Angelic Inheritors','1x Sanguinary Priest (0 pts)','5x Assault Intercessor Squad (0 pts)\n• 1x Assault Intercessor Sergeant\n• 4x Assault Intercessor'],
  ['dark-angels','The Lion Helm','Azrael','Hellblaster Squad','Wrath of the Rock','1x Azrael (0 pts): The Lion Helm','5x Hellblaster Squad (0 pts)\n• 1x Hellblaster Sergeant\n• 4x Hellblaster']
])cases.push({book,rule,leader,bodyguard,owner:leader,negative:[],target:'parsed-unit-2',ownerInstance:'parsed-unit-1',
  text:['+ FACTION KEYWORD: '+book,'+ DETACHMENT: '+detachment,leaderText,bodyText,bodyText].join('\n')});

for(const c of cases){
  const presentation=JSON.parse(fs.readFileSync(path.join(repo,'books',c.book,'v2/generated/app-presentation.json'),'utf8'));
  const candidates=presentation.cards.flatMap(card=>(card.fields||[]).filter(field=>typeof field.value==='string'&&
    (norm(card.title)===norm(c.rule)&&field.source?.path==='/text'||norm(field.value).startsWith(norm(c.rule)+':')))
    .map(field=>({ruleId:card.id,text:field.value,fieldId:field.id})));
  assert.equal(candidates.length,1,'Exactly one canonical named text for '+c.rule);
  Object.assign(c,{canonical:candidates[0]});
}

const runtimePaths=new Set(JSON.parse(fs.readFileSync(path.join(repo,'tools/pages-runtime-manifest.json'),'utf8')).files.map(row=>'/'+row.path));
const allowed=address=>!/(?:\/sources\/|-qa\.|-fixtures\.)/.test(address)&&(
  runtimePaths.has(address)||isApplicationTestDependency(address)||
  /^\/books\/(?:adeptus-mechanicus|death-guard)\/v2\/[\w./-]+\.(?:mjs|js|json|css)$/.test(address)||
  /^\/books\/(?:adeptus-mechanicus|death-guard)\/assets\/[\w./-]+\.(?:png|webp|jpe?g|svg)$/.test(address)||
  /^\/books\/shared\/(?:application-v2|army-book-app-v2|roster-v2|rule-contract-v2|source-refs-v2)\/[\w./-]+\.(?:mjs|js|json|css)$/.test(address));
const mime={'.html':'text/html','.mjs':'text/javascript','.js':'text/javascript','.json':'application/json',
  '.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg','.jpeg':'image/jpeg'};
const results=[],errors=[],missing=[],screenshots=[];
const server=http.createServer((request,response)=>{
  const requested=decodeURIComponent(new URL(request.url,'http://localhost').pathname),address=requested==='/'?'/index.html':requested;
  if(address==='/favicon.ico'){response.writeHead(204);response.end();return;}
  const file=path.resolve(repo,'.'+address);
  if(!allowed(address)||!file.startsWith(repo+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){
    missing.push(address);response.writeHead(404);response.end();return;
  }
  response.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});
  response.end(fs.readFileSync(file));
});
const ready=page=>page.waitForFunction(()=>window.ArmyBookAppV2?.roster);
async function roster(page){
  await page.locator('[data-v2-primary-nav] [data-v2-destination="ROSTER"]').click();
  await page.getByRole('textbox',{name:'New Recruit text export',exact:true}).waitFor();
}
async function imported(page,text){
  await roster(page);await page.getByRole('textbox',{name:'New Recruit text export',exact:true}).fill(text);
  await page.locator('[data-roster-action="review-import"]').click();
  await page.waitForFunction(()=>!document.querySelector('.v2-roster[aria-busy="true"]'));
  assert.match(await page.locator('.v2-roster-status').innerText(),/^Roster imported\./);
  const units=await page.evaluate(()=>window.ArmyBookAppV2.roster.state.units);
  assert.equal(units.length,3,'Constructed roster has a leader, bodyguard and independent duplicate');
}
async function attach(page){
  await roster(page);
  await page.locator('[data-attachment-candidate-for="parsed-unit-2"]').selectOption('parsed-unit-1');
  await page.locator('[data-attachment-target-instance-id="parsed-unit-2"] [data-roster-action="attach"]').click();
  await page.locator('[data-attached-leader-instance-id="parsed-unit-1"]').waitFor();
}
async function detach(page){
  await roster(page);await page.locator('[data-roster-action="detach"][data-leader-instance-id="parsed-unit-1"]').click();
  await page.locator('[data-attached-leader-instance-id="parsed-unit-1"]').waitFor({state:'hidden'});
}
async function view(page,id,mode){
  await roster(page);
  if(mode==='Effective')await page.locator('[data-roster-instance-id="'+id+'"]').getByRole('button',{name:'Effective datasheet',exact:true}).click();
  else{
    await page.getByRole('button',{name:'Open personal guide',exact:true}).click();
    await page.locator('main a[data-target-id="roster-unit/'+id+'"]').click();
  }
  await page.locator('main .unit-card[data-roster-instance-id="'+id+'"]').waitFor();
}
async function inspect(page,c,device,mode,id,stage,wanted){
  await view(page,id,mode);
  const card=page.locator('main .unit-card[data-roster-instance-id="'+id+'"]');
  const rows=await card.locator('article[data-attached-rule-id]').evaluateAll(nodes=>nodes.map(node=>({
    ruleId:node.dataset.attachedRuleId,sourceInstanceId:node.dataset.sourceInstanceId,
    title:node.querySelector('h5')?.textContent||'',text:node.querySelector('[data-attached-rule-text]')?.textContent||'',
    visible:!!node.getClientRects().length,content:node.innerText})));
  const found=rows.filter(row=>norm(row.title)===norm(c.rule));
  assert.equal(found.length,wanted?1:0,`${c.rule}: ${stage} ${mode} on ${id}`);
  if(wanted){
    const row=found[0];assert.equal(row.sourceInstanceId,c.ownerInstance,'Exact physical source');
    assert.ok(row.visible,'Rule is actually rendered');
    const body=c.quote?.startsWith(c.rule+':')?c.quote.slice(c.rule.length+1).trim():c.quote;
    assert.equal(row.ruleId,c.canonical.ruleId,'Exact canonical rule identity');
    assert.equal(row.text,c.canonical.text,'Visible original source field is byte-for-byte identical');
    if(c.quote)assert.ok(norm(row.text).includes(norm(body)),'Full independent accepted source text, including conditions');
    assert.ok(norm(row.content).toLowerCase().includes(norm(c.owner).toLowerCase()),'Visible source owner');
    assert.doesNotMatch(row.content,/Conditional rule|Not automatically|source-clause-|recipient\//i,'No technical labels on O-1 text');
    const rowNode=card.locator('article[data-attached-rule-id]').filter({has:page.locator('h5',{hasText:c.rule})}).first();
    await rowNode.scrollIntoViewIfNeeded();assert.ok(await rowNode.isVisible());
    if(stage==='attached'){
      const filename=`${device}-${String(cases.indexOf(c)+1).padStart(2,'0')}-${mode.toLowerCase()}.png`;
      await page.screenshot({path:path.join(out,filename)});screenshots.push(filename);
    }
  }
  for(const title of c.negative)assert.ok(!rows.some(row=>norm(row.title)===norm(title)),title+' must not transfer');
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,'No horizontal overflow');
  results.push({book:c.book,rule:c.rule,source:c.owner,target:id===c.target?(c.reverse?c.leader:c.bodyguard):'Independent duplicate',
    device,mode,stage,wanted,status:'PASS',observed:found});
}
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const origin='http://127.0.0.1:'+server.address().port;
let browser,completed=false;
try{
  browser=await launchChromium();
  const selected=cases.filter(c=>(!option('--case')||norm(c.rule).toLowerCase().includes(norm(option('--case')).toLowerCase()))&&
    (!option('--books')||option('--books').split(',').includes(c.book)));
  assert.ok(selected.length,'Case filter must select at least one case');
  console.log('O-1 browser evidence: '+out);
  for(const [device,viewport]of [['desktop',{width:1440,height:900}],['mobile',{width:390,height:844}]]){
    if(option('--device')&&option('--device')!==device)continue;
    for(const c of selected){
      // This presentation-only suite reads current working-tree bytes. PWA
      // installation/hash certification belongs to the separate pre-ff queue.
      const context=await browser.newContext({viewport,serviceWorkers:'block'}),page=await context.newPage();
      page.on('pageerror',error=>errors.push({rule:c.rule,device,error:error.message}));
      try{
        await page.goto(origin+'/v2/app.html');await page.locator('[data-v2-book="'+c.book+'"]').click();await ready(page);
        await imported(page,c.text);await attach(page);
        const before=await page.evaluate(()=>JSON.stringify(window.ArmyBookAppV2.roster.projection));
        for(const mode of ['Effective','Guide']){
          await inspect(page,c,device,mode,c.target,'attached',true);
          await inspect(page,c,device,mode,'parsed-unit-3','independent-control',false);
        }
        assert.equal(await page.evaluate(()=>JSON.stringify(window.ArmyBookAppV2.roster.projection)),before,'Reading text cannot change effects');
        await detach(page);
        for(const mode of ['Effective','Guide'])await inspect(page,c,device,mode,c.target,'detached',false);
        await attach(page);await page.reload();await ready(page);
        await inspect(page,c,device,'Effective',c.target,'reattached-reload',true);
        await inspect(page,c,device,'Guide',c.target,'reattached-reload',true);
        console.log('PASS '+device+' '+c.rule);
      }catch(error){
        process.exitCode=1;results.push({book:c.book,rule:c.rule,device,status:'NEW_FAIL',error:error.stack});
        console.error('FAIL '+device+' '+c.rule+': '+error.message);
        const filename=`failure-${device}-${cases.indexOf(c)+1}.png`;
        await page.screenshot({path:path.join(out,filename),fullPage:true}).catch(()=>{});screenshots.push(filename);
      }finally{await context.close();}
      fs.writeFileSync(path.join(out,'results.json'),JSON.stringify({results,errors,missing,screenshots},null,2));
    }
  }
  assert.equal(errors.length,0,'No uncaught application errors');assert.equal(missing.length,0,'No missing runtime resources');
  completed=true;
}finally{
  fs.writeFileSync(path.join(out,'results.json'),JSON.stringify({status:!completed||process.exitCode||errors.length||missing.length?'NEW_FAIL':'PASS',
    browser:browser?.version(),serviceWorkers:'blocked',realNewRecruitExportTested:false,results,errors,missing,screenshots},null,2));
  if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));
}

import {createQaEvidenceDir} from '../tests/helpers/qa-temp.mjs';
/** SHOW-2 uses normal imports, attachments, Effective Datasheets and Guide.
 * Constructed New Recruit inputs; browser evaluation only reads state and DOM. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {launchChromium} from '../tests/helpers/browser-launch.mjs';
import {isApplicationTestDependency} from '../books/shared/application-v2/browser-test-dependencies.mjs';
import {displayDuplicateCensus} from './card-display-2-qa.mjs';

const option=name=>process.argv.find(arg=>arg.startsWith(name+'='))?.slice(name.length+1);
const repo=path.resolve(option('--root')||fileURLToPath(new URL('../',import.meta.url)));
const out=path.resolve(option('--out')||createQaEvidenceDir('wh-card-display-2-'));
assert.ok(out!==repo&&!out.startsWith(repo+path.sep));fs.mkdirSync(out,{recursive:true});
const baseline=process.argv.includes('--baseline'),read=file=>JSON.parse(fs.readFileSync(path.join(repo,file),'utf8'));
const census=displayDuplicateCensus(pathToFileURL(repo+path.sep));
const mk=(id,book,detachment,units,extra={})=>({id,book,text:['+ FACTION KEYWORD: '+book,'+ DETACHMENT: '+detachment,...units].join('\n'),...extra});
const librarian='1x Librarian (0 pts): Bolt pistol, Force weapon, Smite';
const librarianVariants=['1x Librarian in Terminator Armour (0 pts)','1x Librarian in Phobos Armour (0 pts)'];
const cases=[
  mk('am-lum','adeptus-mechanicus','Luminen Auto-choir',[
    '5x Corpuscarii Electro-priests (0 pts)','5x Fulgurite Electro-priests (0 pts)',
    '10x Skitarii Rangers (0 pts)','1x Tech-priest Manipulus (0 pts)'],{attach:['parsed-unit-4','parsed-unit-2']}),
  mk('am-modes','adeptus-mechanicus','Data-Psalm Conclave',['5x Fulgurite Electro-priests (0 pts)','10x Skitarii Rangers (0 pts)']),
  mk('dg-physical','death-guard','Virulent Vectorium',[
    '1x Lord of Contagion (0 pts): Manreaper','3x Deathshroud Terminators (0 pts)',
    '1x Defiler (0 pts)','3x Deathshroud Terminators (0 pts)'],{attach:['parsed-unit-1','parsed-unit-2']}),
  mk('sm-physical','space-marines','Gladius Task Force',[
    '1x Lieutenant in Phobos Armour (0 pts)','5x Infiltrator Squad (0 pts)\n• 1x Infiltrator Sergeant\n• 4x Infiltrator',
    librarian,'5x Infiltrator Squad (0 pts)\n• 1x Infiltrator Sergeant\n• 4x Infiltrator',...librarianVariants,
    '1x Chief Librarian Tigurius (0 pts)'],{attach:['parsed-unit-1','parsed-unit-2']}),
  mk('ba-psychic','blood-angels','Angelic Inheritors',[librarian,...librarianVariants]),
  mk('da-psychic-aura','dark-angels','Wrath of the Rock',[librarian,'1x Lion El’jonson (0 pts)',...librarianVariants]),
  mk('csm-damaged','chaos-space-marines','Veterans of the Long War',['1x Defiler (0 pts)']),
  mk('ec-damaged','emperors-children','Court of the Phoenician',['1x Defiler (0 pts)']),
  mk('tau-damaged','tau-empire','Kauyon',['1x Riptide Battlesuit (0 pts)']),
  mk('tyranids-damaged','tyranids','Invasion Fleet',['1x Tyrannofex (0 pts)'])
].filter(c=>!option('--case')||c.id.includes(option('--case')));
assert.ok(cases.length);
const manifest=new Set(read('tools/pages-runtime-manifest.json').files.map(row=>'/'+row.path));
const mime={'.html':'text/html','.mjs':'text/javascript','.js':'text/javascript','.json':'application/json','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg','.jpeg':'image/jpeg'};
const errors=[],missing=[],results=[],screenshots=[];
const server=http.createServer((request,response)=>{
  const requested=decodeURIComponent(new URL(request.url,'http://local').pathname),address=requested==='/'?'/index.html':requested;
  if(address==='/favicon.ico'){response.writeHead(204).end();return;}
  const file=path.resolve(repo,'.'+address);
  if(!file.startsWith(repo+path.sep)||!manifest.has(address)&&!isApplicationTestDependency(address)||!fs.existsSync(file)){
    missing.push(address);response.writeHead(404).end();return;
  }
  response.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});response.end(fs.readFileSync(file));
});
const roster=async page=>{await page.locator('[data-v2-primary-nav] [data-v2-destination="ROSTER"]').click();await page.getByRole('textbox',{name:'New Recruit text export',exact:true}).waitFor();};
async function view(page,id,mode){
  await roster(page);
  if(mode==='Effective')await page.locator('[data-roster-instance-id="'+id+'"]').getByRole('button',{name:'Effective datasheet',exact:true}).click();
  else{await page.getByRole('button',{name:'Open personal guide',exact:true}).click();await page.locator('main a[data-target-id="roster-unit/'+id+'"]').click();}
  await page.locator('main .unit-card[data-roster-instance-id="'+id+'"]').waitFor();
}
function count(text,quote){return text.split(quote).length-1;}
async function inspect(page,c,mode,device,id){
  await view(page,id,mode);await page.evaluate(()=>document.fonts.ready);
  const projection=await page.evaluate(()=>window.ArmyBookAppV2.roster.projection);
  const payload=read(`books/${c.book}/v2/generated/app-presentation.json`),cards=new Map(payload.cards.map(card=>[card.id,card]));
  const observed=await page.locator('main .unit-card[data-roster-instance-id]').evaluateAll(nodes=>nodes.map(node=>({
    id:node.dataset.rosterInstanceId,title:node.querySelector('h3')?.textContent,text:node.innerText,
    keywords:[...node.querySelectorAll('[data-datasheet-section="keywords"] [data-fact-id]')].map(field=>({id:field.dataset.factId,text:field.textContent})),
    keywordText:node.querySelector('[data-datasheet-section="keywords"]')?.innerText,
    paragraphs:[...node.querySelectorAll('p[data-fact-id]')].map(p=>({id:p.dataset.factId,text:p.textContent,visible:!!p.getClientRects().length})),
    ruleParagraphs:[...node.querySelectorAll('p')].filter(p=>p.getClientRects().length&&p.textContent.length>=60&&
      !p.textContent.startsWith('Source:')&&!p.textContent.startsWith('Applies to:')).map(p=>p.textContent),
    sections:[...node.querySelectorAll('section.unit-part')].map(section=>({id:section.dataset.cardId,title:section.querySelector('h4')?.textContent,text:section.innerText})),
    links:[...node.querySelectorAll('a[data-target-id]')].map(a=>a.dataset.targetId),
    attached:[...node.querySelectorAll('[data-attached-rule-id]')].map(row=>({id:row.dataset.attachedRuleId,source:row.dataset.sourceInstanceId,
      title:row.querySelector('h5')?.textContent,text:row.querySelector('[data-attached-rule-text]')?.textContent,content:row.innerText})),
    f1:[...node.querySelectorAll('[data-detachment-rule-id]')].map(row=>({id:row.dataset.detachmentRuleId,text:row.querySelector('.ds-detachment-fields')?.textContent,
      visible:!!row.querySelector('.ds-detachment-fields')?.getClientRects().length,source:row.innerText.includes('Source:')})),
    policies:[...node.querySelectorAll('.ds-conditional-policy:not([data-conditional-policy="DETACHMENT_TEXT"])')].map(row=>({text:row.innerText,
      identity:JSON.parse(row.dataset.policySource),canonicalText:row.querySelector('p:last-child')?.textContent,source:row.innerText.includes('Source:')}))
  })));
  fs.writeFileSync(path.join(out,device+'-'+c.id+'-'+mode+'-'+id+'.json'),JSON.stringify(observed,null,2));
  for(const card of observed){
    const unit=projection.units.find(unit=>unit.instanceId===card.id);assert.ok(unit);
    const effective=await page.evaluate(id=>window.ArmyBookAppV2.roster.effective(id),card.id);
    assert.deepEqual([...effective.keywords].sort(),[...projection.formedUnits.find(group=>group.formedUnitId===unit.formedUnitId)?.keywords||unit.keywords].sort(),
      'The executor formed keyword bag is unchanged');
    for(const keyword of unit.keywords)assert.ok(card.keywordText.includes(keyword),'Physical keyword retained: '+keyword);
    if(c.attach&&card.id===c.attach[1]){
      const leader=projection.units.find(unit=>unit.instanceId===c.attach[0]);
      for(const foreign of leader.keywords.filter(keyword=>!unit.keywords.includes(keyword)))
        assert.equal(card.keywordText.includes(foreign),baseline,'Only physical component keywords: '+foreign);
    }
    for(const row of census.find(book=>book.book===c.book).psychic.filter(row=>row.unitId===unit.canonicalUnitId)){
      const paragraphs=card.paragraphs.filter(field=>field.visible&&field.text.includes(row.text));
      assert.equal(paragraphs.length,baseline?2:1,'Whole canonical psychic rule appears once in its own datasheet: '+row.rule);
      const psychic=card.sections.find(section=>section.id===row.sectionId);assert.ok(psychic?.text.includes(row.text));
      if(!baseline)assert.ok(card.links.includes(row.abilityId),'Individual canonical source remains accessible');
    }
    for(const row of census.find(book=>book.book===c.book).damaged.filter(row=>row.unitId===unit.canonicalUnitId)){
      const section=card.sections.find(section=>section.id===row.sectionId);assert.ok(section);
      if(baseline)assert.ok(count(card.text,row.title)>=1,'Baseline damaged heading is visible');
      else assert.equal(count(card.text,row.title),1,'Full damaged heading appears once in the visible physical datasheet');
      for(const field of row.fields){
        const body=field.source?.path==='/text'&&field.value.startsWith(row.title+'\n')?field.value.slice(row.title.length+1):field.value;
        assert.equal(card.paragraphs.filter(p=>p.visible&&p.text.includes(body)).length,1,'Full damaged effect is never lost');
      }
    }
    for(const row of card.policies){
      assert.equal(row.text.includes('Conditional — Not automatically resolved'),baseline);
      assert.ok(row.source,'Typed policy source remains');
      const proof=effective.conditional.find(proof=>proof.ruleId===row.identity.ruleId&&proof.clauseId===row.identity.clauseId);
      assert.equal(row.canonicalText,proof.policy.contextQuote,'Original typed policy prose remains byte-for-byte intact');
    }
    if(c.id==='da-psychic-aura'&&card.id==='parsed-unit-2'){
      assert.ok(card.policies.length>=3,'Reachable real aura policies');
      assert.equal(card.policies.some(row=>row.text.includes('Recipient unresolved; requires measured')),baseline);
      for(const row of card.policies.filter(row=>/Martial Exemplar|No Hiding from the Watchers/.test(row.text)))
        assert.match(row.text,/within 6"/,'Original range remains in canonical prose');
    }
    if(c.id==='am-lum'){
      const row=card.f1.find(row=>row.id==='detachment-luminen-auto-choir:rule');
      if(['parsed-unit-2','parsed-unit-4'].includes(card.id)){
        assert.ok(row?.source&&row.visible);assert.ok(row.text.includes('When a friendly FULGURITE unit has fought, that unit heals D3 wounds.'));
        assert.equal(row.text.includes('CORPUSCARII'),baseline);assert.equal(row.text.includes('DATA-PSALM'),baseline);
      }else assert.equal(row,undefined,'Unproved units receive no F1 rule');
    }
    if(c.id==='am-modes'){
      const rule=cards.get('detachment-data-psalm-conclave:rule'),text=rule.fields.find(field=>field.source?.path==='/text').value;
      if(card.id==='parsed-unit-1')assert.equal(card.f1.find(row=>row.id===rule.id)?.text,text,'Whole canonical choice, both modes, unchanged');
      else assert.equal(card.f1.find(row=>row.id===rule.id),undefined,'Skitarii receives no Cult Mechanicus choice rule');
    }
    for(const row of card.attached){
      const source=cards.get(row.id),fields=source.fields.filter(field=>typeof field.value==='string'&&
        (field.value===row.text||field.value===row.title+':'+row.text));
      assert.equal(fields.length,1,'O-1 canonical text unchanged');assert.match(row.content,/Source:/);
      assert.ok(!row.text.startsWith(row.title+':'));
    }
    if(c.id==='dg-physical'&&card.id==='parsed-unit-2')assert.ok(card.attached.some(row=>row.title==='Vector of Disease'),'O-1 owner-to-bodyguard retained');
    if(c.id==='dg-physical'&&card.id==='parsed-unit-1')assert.ok(card.attached.some(row=>row.title==='Silent Bodyguard'),'O-1 bodyguard-to-owner retained');
    if(['dg-physical','sm-physical'].includes(c.id)&&card.id==='parsed-unit-4')
      assert.deepEqual(card.attached,[],'Independent duplicate receives no attached component rule');
    results.push({scenario:c.id,device,mode,opened:id,component:card.id,status:'PASS',observed:card});
  }
  assert.equal(JSON.stringify(await page.evaluate(()=>window.ArmyBookAppV2.roster.projection)),JSON.stringify(projection),'Presentation never changes gameplay projection');
}
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const origin='http://127.0.0.1:'+server.address().port;let browser,complete=false;
console.log('SHOW-2 browser evidence: '+out);
try{
  browser=await launchChromium();
  for(const [device,viewport]of [['desktop',{width:1440,height:1000}],['mobile',{width:390,height:844}]]){
    if(option('--device')&&option('--device')!==device)continue;
    for(const c of cases){
      const context=await browser.newContext({viewport,serviceWorkers:'block'}),page=await context.newPage();context.setDefaultTimeout(20000);
      page.on('pageerror',error=>errors.push({scenario:c.id,error:error.message}));
      try{
        await page.goto(origin+'/v2/app.html');await page.locator('[data-v2-book="'+c.book+'"]').click();
        await page.waitForFunction(()=>window.ArmyBookAppV2?.roster);await roster(page);
        await page.getByRole('textbox',{name:'New Recruit text export',exact:true}).fill(c.text);
        await page.locator('[data-roster-action="review-import"]').click();await page.waitForFunction(()=>!document.querySelector('.v2-roster[aria-busy="true"]'));
        assert.match(await page.locator('.v2-roster-status').innerText(),/^Roster imported\./);
        if(c.attach){const [leader,bodyguard]=c.attach;
          await page.locator('[data-attachment-candidate-for="'+bodyguard+'"]').selectOption(leader);
          await page.locator('[data-attachment-target-instance-id="'+bodyguard+'"] [data-roster-action="attach"]').click();
          await page.locator('[data-attached-leader-instance-id="'+leader+'"]').waitFor();
        }
        const ids=await page.evaluate(()=>window.ArmyBookAppV2.roster.state.units.map(unit=>unit.instanceId));
        for(const mode of ['Effective','Guide'])for(const id of ids){
          await inspect(page,c,mode,device,id);
          if(mode==='Guide'){const screenshot=device+'-'+c.id+'-'+id+'.png';
            await page.screenshot({path:path.join(out,screenshot),fullPage:true});screenshots.push(screenshot);}
        }
        if(!baseline&&c.id==='sm-physical'){
          await view(page,'parsed-unit-3','Guide');
          const link=page.locator('main .unit-card[data-roster-instance-id="parsed-unit-3"] a[data-represented-ability-id]').first();
          await link.click();await page.locator('dialog[open]').waitFor();
          assert.match(await page.locator('dialog[open]').innerText(),/Veil of Time|Force Dome/,'Canonical psychic source link opens the real source presenter');
          await page.keyboard.press('Escape');
        }
        console.log('PASS '+device+' '+c.id);
      }catch(error){process.exitCode=1;results.push({scenario:c.id,device,status:'NEW_FAIL',error:error.stack});console.error('FAIL '+device+' '+c.id+': '+error.message);}
      finally{await context.close();fs.writeFileSync(path.join(out,'RESULTS.json'),JSON.stringify({baseline,results,errors,missing,census,screenshots},null,2));}
    }
  }
  assert.deepEqual(errors,[]);assert.deepEqual(missing,[]);complete=true;
}finally{
  fs.writeFileSync(path.join(out,'RESULTS.json'),JSON.stringify({status:complete&&!process.exitCode?'PASS':'NEW_FAIL',baseline,results,errors,missing,census,screenshots},null,2));
  if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));
}

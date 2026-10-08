/** Real-browser normal-book invariants and unchanged Personal Guide comparison. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {buildApp as buildDg} from '../../death-guard/v2/app-build.mjs';
import {buildApp as buildAm} from '../../adeptus-mechanicus/v2/app-build.mjs';

const repo=fileURLToPath(new URL('../../../',import.meta.url));
const baselineHead='51088e8ece8e5e3a9ad0d0baa4db8d2d89b54f35';
const out=process.env.ARMY_APP_V2_SCREENSHOTS||fs.mkdtempSync(path.join(os.tmpdir(),'normal-datasheet-parity-'));
fs.mkdirSync(out,{recursive:true});
const {chromium}=createRequire(import.meta.url)('playwright');
const payloads=new Map([['death-guard',buildDg()],['adeptus-mechanicus',buildAm()]]);
const baseline=new Map(['datasheet-v1.mjs','datasheet-v1.css'].map(name=>[
  '/books/shared/army-book-app-v2/'+name,execFileSync('git',['show',baselineHead+':books/shared/army-book-app-v2/'+name],{cwd:repo,maxBuffer:8*1024*1024})
]));
const mime={'.html':'text/html','.mjs':'text/javascript','.js':'text/javascript','.json':'application/json','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg','.woff2':'font/woff2'};
const server=http.createServer((request,response)=>{
  const requested=decodeURIComponent(new URL(request.url,'http://localhost').pathname);
  const old=requested.startsWith('/baseline/');
  const address=old?requested.slice('/baseline'.length):requested;
  const file=path.resolve(repo,'.'+address);
  if(!file.startsWith(path.resolve(repo)+path.sep)||!fs.existsSync(file)||fs.statSync(file).isDirectory()){
    response.writeHead(404);response.end();return;
  }
  response.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});
  const army=[...payloads.keys()].find(name=>address===`/books/${name}/v2/generated/app-presentation.json`);
  response.end(army?JSON.stringify(payloads.get(army)):old&&baseline.has(address)?baseline.get(address):fs.readFileSync(file));
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const origin=`http://127.0.0.1:${server.address().port}`;
const installedChrome='C:/Program Files/Google/Chrome/Application/chrome.exe';
const executablePath=process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE||(fs.existsSync(installedChrome)?installedChrome:undefined);
const browser=await chromium.launch({headless:true,...(executablePath?{executablePath}:{})});
const errors=[],results=[],personalComparisons=[];
const priority=new Set(['unit-lord-of-contagion','unit-deathshroud-terminators','unit-plague-marines','unit-great-unclean-one','unit-defiler','unit-helbrute','unit-ironstrider-ballistarii','unit-skorpius-disintegrator','unit-servitor-battleclade','unit-tech-priest-dominus']);
const wait=async page=>{
  await page.waitForFunction(()=>!!window.ArmyBookAppV2?.rosterPanel);
  await page.evaluate(()=>window.ArmyBookAppV2.rosterPanel.ready);
};
const settle=async page=>{
  await page.evaluate(async()=>{
    await document.fonts.ready;
    await Promise.all([...document.images].map(image=>image.decode().catch(()=>{})));
    window.scrollTo({top:0,behavior:'instant'});
  });
  await page.waitForTimeout(180);
};
const imports={
  'death-guard':`+ FACTION KEYWORD: Chaos - Death Guard
+ DETACHMENT: Paragons of Putrescence, Virulent Vectorium
Char1: 1x Lord of Contagion (135 pts): Manreaper
Enhancement: Furnace of Plagues (+25 pts)
3x Deathshroud Terminators (150 pts)
• 1x Deathshroud Terminator Champion: Manreaper, Plaguespurt gauntlet
• 2x Deathshroud Terminator: 2 with Manreaper, Plaguespurt gauntlet
1x Great Unclean One (265 pts): Plague flail, Putrid vomit, Bilesword
1x Defiler (190 pts): Hades battle cannon, Excruciator cannon, Hades lascannon, Heavy reaper autocannon, Shearing claws`,
  'adeptus-mechanicus':`+ FACTION KEYWORD: Imperium - Adeptus Mechanicus
+ DETACHMENT: Haloscreed Battle Clade, Lords of the Forge
Char1: 1x Tech-priest Dominus (100 pts): Volkite blaster, Macrostubber, Omnissian axe
Enhancement: Cognitive Reinforcement
9x Servitor Battleclade (110 pts)
• 1x Servitor Underseer: Mechanicus pistol, Dataspikes
• 2x Gun Servitor: 2 with Heavy arc rifle, Servo-claw
• 6x Combat Servitor: 6 with Phosphor blaster, Servo-claw`
};

async function openPage(context,army,old=false) {
  const page=await context.newPage();
  page.on('pageerror',error=>errors.push({army,baseline:old,error:error.message}));
  await page.goto(origin+(old?'/baseline':'')+`/books/${army}/v2/app.html`);
  await wait(page);return page;
}
async function syntheticDom(page) {
  const observed=await page.evaluate(async()=>{
    const {projectArmyBook}=await import('/books/shared/army-book-app-v2/project.mjs');
    const {buildDatasheetPresentation,createDatasheetPresenter}=await import('/books/shared/army-book-app-v2/datasheet-v1.mjs');
    const weapon=id=>({id,kind:'WEAPON_PROFILE',parentId:'synthetic-unit',data:{name:'Same weapon label',mode:'melee',range:'Melee',attacks:'2',skill:'3+',strength:'4',ap:'0',damage:'1',abilities:[]}});
    const model={bookId:'synthetic-book',entities:[
      {id:'synthetic-unit',kind:'DATASHEET',data:{name:'Synthetic normal datasheet',profileIds:['synthetic-model'],keywords:['INFANTRY'],factionKeywords:['SYNTHETIC']}},
      {id:'synthetic-model',kind:'PROFILE',parentId:'synthetic-unit',data:{M:'6"',T:'4',SV:'3+',W:'2',LD:'7+',OC:'1'}},
      {id:'synthetic-base',kind:'MODEL_BASE',parentId:'synthetic-model',data:{text:'(Ø32MM)',scope:'MODEL'}},
      weapon('synthetic-strike'),weapon('synthetic-sweep'),weapon('synthetic-unbound'),
      {id:'synthetic-option',kind:'WARGEAR_OPTION',parentId:'synthetic-unit',data:{text:'A selectable item.'}},
      {id:'synthetic-ability',kind:'SUPPLEMENTAL_DATASHEET_RULE',parentId:'synthetic-unit',data:{text:'Bound ability: exact canonical text.'}},
      {id:'synthetic-equipment-ability',kind:'SUPPLEMENTAL_DATASHEET_RULE',parentId:'synthetic-unit',data:{text:'Equipment ability: exact canonical text.'}}
    ],currentness:{currentness:'CURRENT',lastReconciledSource:'Synthetic accepted source'},mfm:{source:{label:'Synthetic'},unitBindings:[],detachmentBindings:[],enhancementBindings:[],paidUpgradeBindings:[],relations:[],eligibilityEvidenceBindings:[]}};
    const records=new Map([['synthetic-cost',{id:'synthetic-cost',recordType:'MFM_PAID_UPGRADE',label:'Same weapon label',value:9}]]);
    const bindings={profileSelections:[{unitId:'synthetic-unit',groupId:'synthetic-group',profileIds:['synthetic-strike','synthetic-sweep'],text:'Choose one listed profile.',source:{sourceId:'synthetic-source',pointer:'/instruction',sha256:'B'.repeat(64)}}],optionCosts:[{unitId:'synthetic-unit',itemId:'synthetic-strike',costRecordId:'synthetic-cost',optionIds:['synthetic-option']}],boundAbilities:[{unitId:'synthetic-unit',itemId:'synthetic-strike',ruleId:'synthetic-ability',fieldPath:'/text'}]};
    bindings.optionCosts.push(structuredClone(bindings.optionCosts[0]));
    bindings.boundAbilities.push({unitId:'synthetic-unit',itemId:'synthetic-option',ruleId:'synthetic-equipment-ability',fieldPath:'/text'});
    const before=JSON.stringify(model),payload=projectArmyBook(model,new Map(),{title:'Synthetic'});
    payload.datasheetPresentation=buildDatasheetPresentation(model,{units:{}},{records,bindings});
    const cards=new Map(payload.cards.map(card=>[card.id,card]));
    const el=(tag,classes='',text)=>{const node=document.createElement(tag);if(classes)node.className=classes;if(text!==undefined)node.textContent=text;return node;};
    const factValue=(tag,field)=>{const node=el(tag,'',String(field.displayValue??field.value));node.dataset.factId=field.id;node.dataset.factValue=JSON.stringify(field.value);return node;};
    const anchor=(label,id)=>{const node=el('a','',label);node.dataset.targetId=id;return node;};
    const presenter=createDatasheetPresenter({document,payload,cards,el,factValue,anchor,showDetail:()=>{},related:()=>el('div'),roster:null,navigateSection:()=>{}});
    const root=presenter.renderDatasheet(cards.get('synthetic-unit'));
    document.body.append(root);
    const output={weapons:root.querySelectorAll('.weapon-row:not(.weapon-head)').length,
      selections:[...root.querySelectorAll('.ds-profile-selection')].map(node=>({text:node.querySelector('p').textContent,targets:[...node.querySelectorAll('[data-target-id]')].map(link=>link.dataset.targetId)})),
      costs:[...root.querySelectorAll('.ds-option-cost')].map(node=>({text:node.textContent,item:node.closest('.weapon-row').dataset.cardId})),
      abilities:[...root.querySelectorAll('.ds-bound-weapon-ability')].map(node=>({text:node.textContent,item:node.closest('li')?.dataset.cardId||node.previousElementSibling?.dataset.cardId,insideAbilities:!!node.closest('[data-datasheet-section="abilities"]')})),
      bases:[...root.querySelectorAll('.profile-base')].map(node=>({section:node.closest('[data-datasheet-section]').dataset.datasheetSection,details:!!node.closest('details')})),
      profileBaseCount:root.querySelectorAll('[data-datasheet-section="profile"] .profile-base').length,immutable:JSON.stringify(model)===before};
    root.remove();return output;
  });
  assert.equal(observed.weapons,3,'Synthetic equal display labels must retain canonical rows');
  assert.deepEqual(observed.selections,[{text:'Choose one listed profile.',targets:['synthetic-strike','synthetic-sweep']}]);
  assert.deepEqual(observed.costs,[{text:'+9 pts',item:'synthetic-strike'}]);
  assert.deepEqual(observed.abilities,[{text:'Bound ability: exact canonical text.',item:'synthetic-strike',insideAbilities:false},{text:'Equipment ability: exact canonical text.',item:'synthetic-option',insideAbilities:false}]);
  assert.deepEqual(observed.bases,[{section:'composition',details:true}]);
  assert.equal(observed.profileBaseCount,0);assert.equal(observed.immutable,true);
}
async function personalSnapshot(page,army,device,old) {
  await page.evaluate(()=>window.ArmyBookAppV2.openRoster());
  await page.getByRole('textbox',{name:'New Recruit text export',exact:true}).fill(imports[army]);
  await page.locator('[data-roster-action="review-import"]').click();
  await page.waitForFunction(()=>window.ArmyBookAppV2.roster.state?.units?.length>=2);
  const state=await page.evaluate(()=>window.ArmyBookAppV2.roster.snapshot());
  assert.equal(state.units.length,army==='death-guard'?4:2,'Fresh source-backed import must resolve without manual selection');
  const attached=await page.evaluate(()=>window.ArmyBookAppV2.roster.attach('parsed-unit-1','parsed-unit-2'));
  assert.notEqual(attached?.ok,false,'Synthetic integration attachment was rejected');
  await page.evaluate(()=>window.ArmyBookAppV2.openPersonalGuide());
  const views=[];
  for(const unit of state.units) {
    await page.evaluate(id=>window.ArmyBookAppV2.openInstance(id),unit.instanceId);await settle(page);
    const snapshot=await page.locator('main .unit-card').evaluate(root=>{
      const normalize=node=>{
        const copy=node.cloneNode(true);
        // Lazy image readiness is browser state, not presentation output.
        copy.querySelectorAll('img').forEach(image=>image.removeAttribute('loading'));
        return copy.outerHTML;
      };
      const rectangle=node=>{const r=node.getBoundingClientRect();return [r.x,r.y,r.width,r.height].map(value=>Math.round(value*10)/10);};
      return {text:root.innerText,dom:normalize(root),geometry:[root,...root.querySelectorAll('.unit-header,.unit-part,.model-profile,.weapon-row,.ds-roster-context,.ds-effect-summary')].map(node=>({key:node.dataset.cardId||node.dataset.datasheetSection||node.className,rect:rectangle(node)})),overflow:document.documentElement.scrollWidth>innerWidth+1};
    });
    assert.equal(snapshot.overflow,false,`${army} ${device} Personal Guide overflow`);
    views.push({instanceId:unit.instanceId,canonicalUnitId:unit.canonicalUnitId,...snapshot});
    if(!old)await page.screenshot({path:path.join(out,`${device}-${army}-${unit.instanceId}-personal.png`),fullPage:true});
  }
  return views;
}

try {
  for(const [device,viewport]of [['desktop',{width:1440,height:1000}],['phone',{width:390,height:844}]]) {
    for(const [army,payload]of payloads) {
      const context=await browser.newContext({viewport,reducedMotion:'reduce'}),page=await openPage(context,army);
      await syntheticDom(page);
      const cards=new Map(payload.cards.map(card=>[card.id,card]));
      const normal=payload.datasheetPresentation.normal;
      assert.ok(normal,'Missing reusable normal-datasheet bindings');
      const units=payload.cards.filter(card=>card.kind==='DATASHEET');
      assert.equal(units.length,army==='death-guard'?36:34);
      for(const unit of units) {
        await page.evaluate(id=>window.ArmyBookAppV2.open(id),unit.id);await settle(page);
        const observed=await page.locator('main .unit-card').evaluate(root=>({
          profiles:[...root.querySelectorAll('.model-profile')].map(node=>node.dataset.cardId),
          weapons:[...root.querySelectorAll('.weapon-row:not(.weapon-head)')].map(node=>node.dataset.cardId),
          selections:[...root.querySelectorAll('.ds-profile-selection')].map(node=>({groupId:node.dataset.profileGroupId,profileIds:JSON.parse(node.dataset.profileIds||'[]'),text:node.querySelector('p')?.textContent,targets:[...node.querySelectorAll('[data-target-id]')].map(link=>link.dataset.targetId)})),
          costs:[...root.querySelectorAll('.ds-option-cost')].map(node=>({recordId:node.dataset.costRecordId,itemId:node.closest('.weapon-row,[data-card-id]')?.dataset.cardId,value:node.querySelector('[data-fact-value]')?.dataset.factValue,text:node.textContent})),
          boundAbilities:[...root.querySelectorAll('.ds-bound-weapon-ability')].map(node=>({ruleId:node.dataset.boundAbilityId,itemId:node.dataset.boundWeaponId,text:node.querySelector('p')?.textContent,previousId:node.closest('li')?.dataset.cardId||node.previousElementSibling?.dataset.cardId,insideAbilities:!!node.closest('[data-datasheet-section="abilities"]')})),
          bases:[...root.querySelectorAll('.profile-base')].map(node=>({id:node.dataset.cardId,composition:node.closest('[data-datasheet-section]')?.dataset.datasheetSection,details:!!node.closest('details')})),
          arsenalBases:root.querySelectorAll('.arsenal-pane .profile-base,.ds-profile-strip .profile-base,[data-datasheet-section="profile"] .profile-base,.ds-base-note').length,
          overflow:document.documentElement.scrollWidth>innerWidth+1
        }));
        const expectedChildren=unit.children.map(id=>cards.get(id));
        assert.deepEqual(observed.profiles.sort(),expectedChildren.filter(card=>card.kind==='PROFILE').map(card=>card.id).sort(),`${army}/${unit.id} MODEL profiles`);
        assert.deepEqual(observed.weapons.sort(),expectedChildren.filter(card=>card.kind==='WEAPON_PROFILE').map(card=>card.id).sort(),`${army}/${unit.id} weapon profiles`);
        const selections=normal.profileSelections.filter(binding=>binding.unitId===unit.id);
        assert.equal(observed.selections.length,selections.length,`${army}/${unit.id} missing or undeclared instruction`);
        for(const expected of selections) {
          const found=observed.selections.filter(item=>item.groupId===expected.groupId);
          assert.equal(found.length,1,'Canonical profile group must render exactly once');
          assert.equal(found[0].text,expected.text);assert.deepEqual(found[0].profileIds,expected.profileIds);assert.deepEqual(found[0].targets,expected.profileIds);
        }
        const costs=normal.optionCosts.filter(binding=>binding.unitId===unit.id);
        assert.equal(observed.costs.length,costs.length,`${army}/${unit.id} paid option duplicate/missing`);
        for(const expected of costs) {
          const found=observed.costs.filter(item=>item.recordId===expected.costRecordId&&item.itemId===expected.itemId);
          assert.equal(found.length,1,'Exact canonical option cost must render once');
          assert.deepEqual(JSON.parse(found[0].value),expected.valueField.value);assert.equal(found[0].text,`+${expected.valueField.value} pts`);
        }
        const abilities=normal.boundAbilities.filter(binding=>binding.unitId===unit.id);
        assert.equal(observed.boundAbilities.length,abilities.length);
        for(const expected of abilities) {
          const found=observed.boundAbilities.filter(item=>item.ruleId===expected.ruleId&&item.itemId===expected.itemId);
          assert.equal(found.length,1);assert.equal(found[0].insideAbilities,false);
          assert.equal(found[0].previousId,expected.itemId,'Bound weapon rule must sit beside its exact canonical weapon');
          assert.equal(found[0].text,cards.get(expected.ruleId).fields.find(field=>field.source.path===expected.fieldPath).value);
        }
        const bases=expectedChildren.filter(card=>card.kind==='PROFILE').flatMap(card=>card.children.map(id=>cards.get(id))).filter(card=>card.kind==='MODEL_BASE');
        assert.deepEqual(observed.bases.map(base=>base.id).sort(),bases.map(base=>base.id).sort());
        assert.ok(observed.bases.every(base=>base.composition==='composition'&&base.details),'Base must be optional composition metadata');
        assert.equal(observed.arsenalBases,0,`${army}/${unit.id} raw Base interrupts Weapons`);
        assert.equal(observed.overflow,false,`${army}/${unit.id} ${device} overflow`);
        if(priority.has(unit.id))await page.screenshot({path:path.join(out,`${device}-${army}-${unit.id}-normal.png`),fullPage:true});
      }
      const current=await personalSnapshot(page,army,device,false);
      const oldContext=await browser.newContext({viewport,reducedMotion:'reduce'}),oldPage=await openPage(oldContext,army,true);
      const previous=await personalSnapshot(oldPage,army,device,true);
      assert.deepEqual(current,previous,`${army} ${device}: Personal Guide text/DOM/geometry changed`);
      personalComparisons.push({army,device,instances:current.length,text:'IDENTICAL',dom:'IDENTICAL',geometry:'IDENTICAL'});
      results.push({army,device,normalDatasheets:units.length,profileGroups:normal.profileSelections.length,optionCosts:normal.optionCosts.length,boundAbilities:normal.boundAbilities.length});
      await oldContext.close();await context.close();
    }
  }
  assert.deepEqual(errors,[],'Uncaught browser errors');
  const report={status:'PASS',baselineHead,results,personalComparisons,pageErrors:errors.length,screenshots:out};
  fs.writeFileSync(path.join(out,'normal-datasheet-browser-report.json'),JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify(report));
} finally {
  await browser.close();await new Promise(resolve=>server.close(resolve));
}

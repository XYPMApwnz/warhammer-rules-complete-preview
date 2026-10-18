/** Real-browser Personal Guide invariants; normal datasheets remain byte-identical. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {buildApp as buildDg} from '../../death-guard/v2/app-build.mjs';
import {buildApp as buildAm} from '../../adeptus-mechanicus/v2/app-build.mjs';
import {effectiveIntegrationFixture} from '../../adeptus-mechanicus/v2/roster-effective-qa.mjs';

const repo=fileURLToPath(new URL('../../../',import.meta.url));
const baselineHead=process.env.PERSONAL_DATASHEET_BASELINE_HEAD||'d087cfbadab574f55a7e525c03303a18adb7ef6b';
const syntheticOnly=process.argv.includes('--synthetic-only');
const equipmentCaptionsOnly=process.argv.includes('--equipment-captions-only');
const out=process.env.ARMY_APP_V2_SCREENSHOTS||'E:/Warhammer/qa-artifacts/effective-datasheet-presentation-d087';
fs.mkdirSync(out,{recursive:true});
const read=file=>JSON.parse(fs.readFileSync(path.join(repo,file),'utf8'));
const payloads=new Map([['death-guard',buildDg()],['adeptus-mechanicus',buildAm()]]);
const books=new Map([['death-guard',read('books/death-guard/v2/generated/rule-contract-effective.json')],['adeptus-mechanicus',read('books/adeptus-mechanicus/v2/generated/roster-runtime.json')]]);
const baseline=new Map(['datasheet-v1.mjs','datasheet-v1.css','datasheet-v1-layout.mjs','personal.mjs','runtime.mjs','styles.css'].map(name=>['/books/shared/army-book-app-v2/'+name,
  execFileSync('git',['show',baselineHead+':books/shared/army-book-app-v2/'+name],{cwd:repo,maxBuffer:8*1024*1024})]));
const mime={'.html':'text/html','.mjs':'text/javascript','.js':'text/javascript','.json':'application/json','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg','.woff2':'font/woff2'};
const server=http.createServer((request,response)=>{
  const requested=decodeURIComponent(new URL(request.url,'http://localhost').pathname),old=requested.startsWith('/baseline/');
  if(requested==='/favicon.ico'){response.writeHead(204);response.end();return;}
  const address=old?requested.slice('/baseline'.length):requested,file=path.resolve(repo,'.'+address);
  if(!file.startsWith(path.resolve(repo)+path.sep)||!fs.existsSync(file)||fs.statSync(file).isDirectory()) {response.writeHead(404);response.end();return;}
  response.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});
  const army=[...payloads.keys()].find(name=>address===`/books/${name}/v2/generated/app-presentation.json`);
  response.end(army&&!equipmentCaptionsOnly?JSON.stringify(payloads.get(army)):old&&baseline.has(address)?baseline.get(address):fs.readFileSync(file));
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const origin=`http://127.0.0.1:${server.address().port}`;
const {chromium}=createRequire(import.meta.url)('playwright');
const installedChrome='C:/Program Files/Google/Chrome/Application/chrome.exe';
const executablePath=process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE||(fs.existsSync(installedChrome)?installedChrome:undefined);
const browser=await chromium.launch({headless:true,...(executablePath?{executablePath}:{})});
const errors=[],normalComparisons=[],personalResults=[],syntheticResults=[];
const priority=new Set(['unit-lord-of-contagion','unit-deathshroud-terminators','unit-great-unclean-one','unit-helbrute','unit-servitor-battleclade','unit-tech-priest-dominus','unit-skitarii-rangers','unit-sicarian-infiltrators']);
const wait=async page=>{await page.waitForFunction(()=>!!window.ArmyBookAppV2?.rosterPanel);await page.evaluate(()=>window.ArmyBookAppV2.rosterPanel.ready);};
const settle=async page=>{await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(image=>image.decode().catch(()=>{})));window.scrollTo({top:0,behavior:'instant'});
  const prefix=location.pathname.startsWith('/baseline/')?'/baseline':'';
  const {flushDatasheetLayouts}=await import(prefix+'/books/shared/army-book-app-v2/datasheet-v1-layout.mjs');flushDatasheetLayouts(document.querySelector('main'));
});await page.waitForTimeout(50);};
async function openPage(context,army,old=false){const page=await context.newPage();page.on('pageerror',error=>errors.push({army,baseline:old,error:error.message}));await page.goto(origin+(old?'/baseline':'')+`/books/${army}/v2/app.html`);await wait(page);return page;}
async function snapshot(page){const instance=await page.evaluate(()=>new URL(location.href).searchParams.get('instance'));
  return page.locator(instance?`main .unit-card[data-roster-instance-id="${instance}"]`:'main .unit-card').evaluate(root=>{
  const copy=root.cloneNode(true);copy.querySelectorAll('img').forEach(image=>{
    image.removeAttribute('loading');const url=new URL(image.getAttribute('src'),location.href);
    // The comparison server mounts the same tree below /baseline. Compare
    // exact asset paths rather than that test-only mount prefix/origin.
    image.setAttribute('src',url.pathname.replace(/^\/baseline\//,'/'));
  });
  // Routing now writes explicit namespace/context URLs. Verify their target
  // identity before comparing the unchanged presentation DOM and geometry.
  const payload=window.ArmyBookAppV2.payload;
  for(const link of root.dataset.rosterInstanceId?[]:copy.querySelectorAll('a[href][data-target-id]')) {
    const url=new URL(link.getAttribute('href'),location.href),id=link.dataset.targetId;
    if(decodeURIComponent(url.hash.slice(1))!==id)throw new Error('Normal link changed canonical target');
    if(url.searchParams.has('v2')) {
      const registry=payload.cards.find(card=>card.id===id)?.domain==='CORE'?'core-rules':payload.book.id;
      if(url.searchParams.get('registry')!==registry||url.searchParams.get('book')!==payload.book.id)throw new Error('Wrong normal reference namespace');
      if(['instance','profile','scope'].some(key=>url.searchParams.has(key)))throw new Error('Effective context leaked into normal book');
    }
    link.setAttribute('href','#'+encodeURIComponent(id));
  }
  const rectangle=node=>{const r=node.getBoundingClientRect();return[r.x,r.y,r.width,r.height].map(value=>Math.round(value*10)/10);};
  return {text:root.innerText,dom:copy.outerHTML,geometry:[root,...root.querySelectorAll('.unit-header,.unit-part,.model-profile,.weapon-row,.ds-roster-context')].map(node=>({key:node.dataset.cardId||node.dataset.datasheetSection||node.className,rect:rectangle(node)})),overflow:document.documentElement.scrollWidth>innerWidth+1};
});}
async function syntheticDom(page,army,device){
  const cases=await page.evaluate(async()=>{
    const {createSyntheticPersonalFixture}=await import('/books/shared/army-book-app-v2/personal-datasheet-qa.mjs');
    const {projectInstanceCards}=await import('/books/shared/army-book-app-v2/personal.mjs');
    const {createDatasheetPresenter}=await import('/books/shared/army-book-app-v2/datasheet-v1.mjs');
    const cases=[];
    for(const nested of [false,true]){
      const f=createSyntheticPersonalFixture(nested?'synthetic-mixed-browser':'synthetic-flat-browser',nested);
      f.payload.datasheetPresentation.rosterEffectSummary=true;
      f.payload.datasheetPresentation.rosterKeywordLabel='Effective unit keywords';
      const secondId=f.id('second-equipment-rule'),second=structuredClone(f.cards.get(f.id('equipment-rule')));second.id=secondId;
      second.fields.forEach(field=>{field.id=field.id.replace(f.id('equipment-rule'),secondId);field.source.entityId=secondId;});
      f.cards.set(secondId,second);f.cards.get(f.id('unit')).children.push(secondId);
      f.payload.datasheetPresentation.normal.boundAbilities.push({unitId:f.id('unit'),itemId:f.id('equipment'),ruleId:secondId,fieldPath:'/text'});
      const el=(tag,classes='',text)=>{const node=document.createElement(tag);if(classes)node.className=classes;if(text!==undefined)node.textContent=text;return node;};
      const factValue=(tag,field)=>{const node=el(tag,'',String(field.displayValue??field.value));node.dataset.factId=field.id;node.dataset.factValue=JSON.stringify(field.value);return node;};
      const anchor=(text,id)=>{const node=el('a','',text);node.dataset.targetId=id;return node;};
      const roster={state:{units:[f.unit,f.duplicate.unit],attachments:[]},effective:id=>id===f.unit.instanceId?f.effective:f.duplicate.effective};
      const presenter=createDatasheetPresenter({document,payload:f.payload,cards:f.cards,el,factValue,anchor,showDetail:()=>{},related:()=>el('div'),roster,navigateSection:()=>{}});
      for(const [unit,effective,present]of [[f.unit,f.effective,true],[f.duplicate.unit,f.duplicate.effective,false]]){
        const variants=projectInstanceCards(f.cards,unit,effective),root=presenter.renderDatasheet(variants.get(unit.canonicalUnitId)[0],{variants,instanceId:unit.instanceId});document.body.append(root);
        const output={nested,present,text:root.innerText,weapons:[...root.querySelectorAll('.weapon-row:not(.weapon-head)')].map(node=>node.dataset.cardId),
          composition:[...root.querySelectorAll('.ds-composition-members > li')].map(node=>node.textContent),
          keywordRows:[...root.querySelectorAll('[data-datasheet-section="keywords"] > p')].map(node=>node.textContent),
          boundRules:[...root.querySelectorAll('.ds-bound-weapon-ability')].map(node=>node.dataset.boundAbilityId),
          equipmentWrappers:root.querySelectorAll('.ds-selected-equipment-rule').length,
          orphanNotes:root.querySelectorAll('.ds-wargear-footnote').length,
          sections:[...root.querySelectorAll('[data-datasheet-section]')].map(node=>node.dataset.datasheetSection)};
        root.remove();cases.push({...output,idPrefix:nested?'synthetic-mixed-browser':'synthetic-flat-browser'});
      }
    }return cases;
  });
  for(const control of cases){
    assert.doesNotMatch(control.text,/Active roster effects|Effective unit keywords|WARGEAR OPTION|Import title must not become inferred ownership/);
    assert.equal(control.orphanNotes,0);assert.ok(control.sections.includes('leader'));assert.ok(control.sections.includes('composition'));
    assert.equal(control.composition.length,control.nested?3:1);assert.equal(control.weapons.length,control.present?1:0);
    assert.deepEqual(control.boundRules.sort(),control.present?[`${control.idPrefix}:equipment-rule`,`${control.idPrefix}:second-equipment-rule`,`${control.idPrefix}:weapon-rule`].sort():[]);
    assert.equal(control.equipmentWrappers,control.present?1:0,'Several rules on one selected canonical equipment item must not duplicate its label');
    assert.equal(new Set(control.keywordRows).size,control.keywordRows.length);
    if(control.nested){assert.ok(control.keywordRows.some(row=>row.includes('Gun models (Combat and Gun models)')));assert.ok(control.keywordRows.some(row=>row.includes('Combat models (Combat and Gun models)')));}
  }
  syntheticResults.push({army,device,cases:cases.length,profileStorageShapes:2});
}
async function effectiveDisplayControls(page,army,device){
  const cases=await page.evaluate(async()=>{
    const {createEffectivePresentationFixtures}=await import('/books/shared/army-book-app-v2/effective-datasheet-presentation-qa.mjs');
    const {projectInstanceCards}=await import('/books/shared/army-book-app-v2/personal.mjs');
    const {createDatasheetPresenter}=await import('/books/shared/army-book-app-v2/datasheet-v1.mjs');
    const {installDatasheetLayout}=await import('/books/shared/army-book-app-v2/datasheet-v1-layout.mjs');
    const cases=[];
    for(const {name,fixture:f,profiles,weapons}of createEffectivePresentationFixtures()){
      const el=(tag,classes='',text)=>{const node=document.createElement(tag);node.className=classes;if(text!==undefined)node.textContent=text;return node;};
      const factValue=(tag,field)=>el(tag,'',String(field.displayValue??field.value));
      const anchor=(text,id)=>{const link=el('a','',text);link.dataset.targetId=id;return link;};
      const roster={state:{units:[f.unit],attachments:[]},effective:()=>f.effective};
      const presenter=createDatasheetPresenter({document,payload:f.payload,cards:f.cards,el,factValue,anchor,related:()=>el('div'),roster});
      const variants=projectInstanceCards(f.cards,f.unit,f.effective),root=presenter.renderDatasheet(variants.get(f.unit.canonicalUnitId)[0],{variants,instanceId:f.unit.instanceId});
      document.querySelector('main').append(root);const layout=installDatasheetLayout(root);await layout.ready();
      const rows=[...root.querySelectorAll('.ds-composition-members > li')].map(line=>({text:line.textContent,items:[...line.querySelectorAll('.ds-selected-loadout > li')].map(item=>item.textContent)}));
      cases.push({name,expectedProfiles:profiles,expectedWeapons:weapons,profiles:root.querySelectorAll('.statline').length,
        weapons:root.querySelectorAll('.weapon-row:not(.weapon-head)').length,rows,
        modelBreakdowns:[...root.querySelectorAll('.model-profile .ds-modifier-breakdown')].map(node=>node.textContent),
        annotations:[...root.querySelectorAll('.ds-effective-metric')].map(node=>({text:node.textContent,shared:!!node.dataset.profileAnnotationIdentity,
          scopes:node.dataset.recipientScopes?JSON.parse(node.dataset.recipientScopes):null})),
        scopeHeadings:[...root.querySelectorAll('.model-profile .ds-composition-scope')].map(node=>node.textContent),
        overflow:document.documentElement.scrollWidth>innerWidth+1});
      layout.destroy();root.remove();
    }
    return cases;
  });
  for(const control of cases){
    assert.equal(control.profiles,control.expectedProfiles,`${army}/${device}/${control.name}: final statline grouping`);
    assert.equal(control.weapons,control.expectedWeapons,`${army}/${device}/${control.name}: effective weapon grouping`);
    assert.equal(control.overflow,false,`${army}/${device}/${control.name}: overflow`);
    if(control.name==='identical'){
      assert.equal(control.rows.length,3);assert.match(control.rows[0].items[0],/^2 × Shared display weapon$/);
      assert.match(control.rows[1].items[0],/^1 × Shared display weapon each$/);
      assert.match(control.rows[2].items[0],/^1 × Shared display weapon each$/);
    }
    if(control.name==='different-loadouts')assert.equal(control.rows.length,4,'Same model role, two explicit loadouts remain separate');
    if(control.name==='equal-final-different-bases')assert.deepEqual(control.modelBreakdowns,['4" + 2','5" + 1'],'Equal final stats must not conflate different scoped base/modifier traces');
    if(control.name.includes('annotation')){
      const uniform=control.name==='uniform-annotations',partial=control.name==='partial-annotation-applicability';
      assert.equal(control.annotations.length,uniform?1:partial?2:3,control.name+' visible annotation count');
      assert.equal(control.annotations.filter(item=>item.shared).length,uniform?1:0,control.name+' shared surface');
      assert.equal(control.scopeHeadings.length,uniform?0:partial?2:3,control.name+' only non-uniform scopes need captions');
      if(uniform)assert.equal(control.annotations[0].scopes.length,3,'Shared annotation retains every exact recipient scope');
      if(control.name==='different-annotation-values')assert.ok(control.annotations.some(item=>item.text.includes('+2"')));
    }
  }
  syntheticResults.push({army,device,effectivePresentationControls:cases});
}
function allUnitFixture(book){
  const index=new Map(book.entities.map(entity=>[entity.id,entity]));
  const units=book.entities.filter(entity=>entity.kind==='DATASHEET').map((owner,i)=>({
    instanceId:`all-unit-${i}`,canonicalUnitId:owner.id,startingStrength:owner.data.profileIds.length,warlord:null,enhancementIds:[],equipmentContextKnown:true,
    modelRows:owner.data.profileIds.map((canonicalProfileId,j)=>({rowId:`row-${i}-${j}`,canonicalProfileId,quantity:1,selections:[],loadouts:[]})),
    selections:owner.data.weaponIds.map((canonicalProfileId,j)=>({selectionKey:`weapon-${i}-${j}`,canonicalProfileIds:[canonicalProfileId],canonicalEquipmentIds:[],physicalQuantity:1}))
  }));
  assert.ok(units.every(unit=>unit.modelRows.every(row=>index.has(row.canonicalProfileId))));
  const detachmentIds=book.entities.filter(entity=>entity.kind==='DETACHMENT').map(entity=>entity.id);
  return {schema:'roster-v2/roster',bookId:book.bookId,rosterId:'all-canonical-presentation-control',units,attachments:[],warlordInstanceId:null,detachmentIds,detachments:detachmentIds.map((canonicalDetachmentId,i)=>({instanceId:`det-${i}`,canonicalDetachmentId}))};
}
const dgImport=`+ FACTION KEYWORD: Chaos - Death Guard
+ DETACHMENT: Paragons of Putrescence, Virulent Vectorium
Char1: 1x Lord of Contagion (135 pts): Manreaper
Enhancement: Furnace of Plagues (+25 pts)
3x Deathshroud Terminators (150 pts)
• 1x Deathshroud Terminator Champion: Manreaper, 2x Plaguespurt gauntlet, Icon of Despair
• 2x Deathshroud Terminator: 2 with Manreaper, Plaguespurt gauntlet
1x Great Unclean One (265 pts): Bilesword, Plague flail, Putrid vomit
1x Great Unclean One (265 pts): Doomsday bell, Plague flail, Putrid vomit
1x Helbrute (120 pts): Plasma cannon, Helbrute fist`;
const amCompositionImport=`+ DETACHMENT: Rad-Zone Corps
10x Skitarii Rangers (100 pts)
• 1x Skitarii Ranger Alpha: Galvanic rifle, Close combat weapon
• 9x Skitarii Ranger: 9 with Galvanic rifle, Close combat weapon
5x Sicarian Infiltrators (70 pts)
• 1x Sicarian Infiltrator Princeps: Flechette blaster, Taser goad
• 4x Sicarian Infiltrator: 4 with Flechette blaster, Taser goad
9x Servitor Battleclade (110 pts)
• 1x Servitor Underseer: Mechanicus pistol, Dataspikes
• 2x Gun Servitor: 2 with Heavy arc rifle, Servo-claw
• 6x Combat Servitor: 6 with Phosphor blaster, Servo-claw`;
async function imported(page,text){
  await page.evaluate(()=>window.ArmyBookAppV2.openRoster());await page.getByRole('textbox',{name:'New Recruit text export',exact:true}).fill(text);
  await page.locator('[data-roster-action="review-import"]').click();
  await page.waitForFunction(()=>window.ArmyBookAppV2.roster.state?.units?.[0]?.instanceId==='parsed-unit-1');
  return page.evaluate(()=>window.ArmyBookAppV2.roster.snapshot());
}
async function verifyState(page,army,device,state,label,{load=true,screenshots=false}={}){
  if(load)await page.evaluate(state=>window.ArmyBookAppV2.roster.load(state),state);
  await page.evaluate(()=>window.ArmyBookAppV2.openPersonalGuide());
  const payload=payloads.get(army),cards=new Map(payload.cards.map(card=>[card.id,card])),captured=new Set();let profiles=0,weapons=0,staticSections=0,compositionRows=0,popupChecks=0;
  for(const unit of state.units){
    await page.evaluate(id=>window.ArmyBookAppV2.openInstance(id),unit.instanceId);await settle(page);
    const effective=await page.evaluate(id=>window.ArmyBookAppV2.roster.effective(id),unit.instanceId);
    const observed=await page.locator(`main .unit-card[data-roster-instance-id="${unit.instanceId}"]`).evaluate(root=>({
      text:root.innerText,instanceId:root.dataset.rosterInstanceId,
      profiles:[...root.querySelectorAll('.ds-effective-profile-group,.model-profile')].filter(node=>node.matches('.ds-effective-profile-group')||!node.closest('.ds-effective-profile-group')).flatMap(node=>node.dataset.profileScopes?JSON.parse(node.dataset.profileScopes).map(([id,scope])=>({id,scope})): [{id:node.dataset.cardId,scope:node.dataset.compositionId||null}]),
      abilityLocations:[...root.querySelectorAll('[data-ability-presentation-identity]')].map(node=>({
        identity:node.dataset.abilityPresentationIdentity,id:node.dataset.canonicalAbilityId,
        parameters:JSON.parse(node.dataset.abilityParameters),subject:node.dataset.recipientSubject,
        scopes:JSON.parse(node.dataset.recipientScopes),text:node.innerText,
        surface:node.closest('.model-profile')?'PROFILE':'CORE',
        profile:node.closest('.model-profile')?.dataset.cardId,
        caption:node.closest('.model-profile')?.querySelector('h5')?.textContent})),
      weapons:[...root.querySelectorAll('.weapon-row:not(.weapon-head)')].map(node=>({id:node.dataset.cardId,scope:node.dataset.compositionId||null,text:node.innerText,members:node.dataset.weaponScopes?JSON.parse(node.dataset.weaponScopes):[[node.dataset.cardId,node.dataset.compositionId||null]]})),
      sections:[...root.querySelectorAll('[data-datasheet-section]')].map(node=>node.dataset.datasheetSection),
      composition:[...root.querySelectorAll('.ds-composition-members > li')].map(node=>node.textContent),
      statlines:root.querySelectorAll('.statline').length,
      keywords:[...root.querySelectorAll('[data-datasheet-section="keywords"] > p')].map(node=>({label:node.querySelector('b')?.textContent||'',text:node.textContent})),
      factValues:[...root.querySelectorAll('[data-fact-id]')].map(node=>({id:node.dataset.factId,value:JSON.parse(node.dataset.factValue),text:node.textContent})),
      bases:[...root.querySelectorAll('.profile-base')].map(node=>({section:node.closest('[data-datasheet-section]')?.dataset.datasheetSection,details:!!node.closest('details')})),
      arsenalBases:root.querySelectorAll('.arsenal-pane .profile-base,.ds-profile-strip .profile-base,[data-datasheet-section="profile"] .profile-base,.ds-base-note').length,
      overflow:document.documentElement.scrollWidth>innerWidth+1
    }));
    const description=`${army}/${device}/${label}/${unit.instanceId}`;
    assert.equal(observed.instanceId,unit.instanceId,description+' wrong physical instance');
    assert.doesNotMatch(observed.text,/Active roster effects|Effective unit keywords|SUPPORT_EXCEPTION|parsed-unit-\d|\bCURRENT\b/,description+' debug content');
    assert.equal(observed.overflow,false,description+' overflow');
    assert.equal(new Set(observed.abilityLocations.map(ability=>ability.identity)).size,observed.abilityLocations.length,description+' duplicate semantic ability');
    const effectiveScopes=new Set(effective.profiles.map(profile=>JSON.stringify([unit.instanceId,profile.id,profile.scopeId||null])));
    for(const ability of observed.abilityLocations){
      if(ability.subject==='MODEL')assert.ok(ability.scopes.every(scope=>effectiveScopes.has(scope)),description+' foreign MODEL recipient');
      else assert.deepEqual(ability.scopes,[JSON.stringify([unit.instanceId,'UNIT'])],description+' foreign UNIT recipient');
      if(ability.surface==='PROFILE'){assert.ok(ability.caption,description+' unlabeled profile-specific ability');assert.equal(ability.scopes.length,1);}
    }
    if(army==='death-guard'&&['unit-chaos-spawn','unit-great-unclean-one','unit-mortarion','unit-poxwalkers','unit-rotigus'].includes(unit.canonicalUnitId)){
      const values=[...new Set(effective.profiles.flatMap(profile=>profile.abilities.filter(ability=>ability.value!==undefined).map(ability=>ability.value)))];
      const rows=observed.abilityLocations.filter(ability=>ability.id==='core-feel-no-pain');
      assert.deepEqual(rows.map(row=>row.parameters.value).sort(),values.sort(),description+' intrinsic FNP duplicated/lost');
      assert.ok(rows.every(row=>row.surface==='CORE'),description+' all-model FNP must use Core');
    }
    if(army==='adeptus-mechanicus'&&unit.canonicalUnitId==='unit-skitarii-rangers'){
      const rows=observed.abilityLocations.filter(ability=>ability.id==='core-scouts'&&ability.parameters.distance===6);
      assert.equal(rows.length,1,description+' Scouts 6 must render once, including identical Enhancement grant');
      assert.equal(rows[0].surface,'CORE');
    }
    assert.equal(observed.arsenalBases,0,description+' Base interrupts Weapons');
    assert.ok(observed.bases.every(base=>base.section==='composition'&&base.details),description+' Base must be optional model metadata');
    const key=record=>JSON.stringify([record.id,record.scopeId||null]);
    assert.deepEqual(observed.weapons.flatMap(row=>row.members.map(member=>JSON.stringify(member))).sort(),effective.weapons.map(key).sort(),description+' exact selected/effective inventory');
    assert.deepEqual(observed.profiles.map(row=>JSON.stringify([row.id,row.scope])).sort(),effective.profiles.map(key).sort(),description+' MODEL profile isolation');
    profiles+=observed.profiles.length;weapons+=observed.weapons.length;
    const root=cards.get(unit.canonicalUnitId);
    for(const id of root.children){const role=payload.datasheetPresentation.sectionRoles[id];if(['leader','attached-unit','transport','composition'].includes(role)){
      assert.ok(observed.sections.includes(role),description+' missing useful static '+role);staticSections++;
    }}
    const known=unit.modelRows.filter(row=>row.presentationLabel);
    for(const row of known){assert.ok(observed.composition.some(text=>text.includes(row.presentationLabel)&&text.includes(String(row.quantity))),description+' missing imported composition '+row.presentationLabel);compositionRows++;}
    assert.equal(new Set(observed.keywords.map(row=>row.text)).size,observed.keywords.length,description+' duplicate keyword rows');
    if(unit.canonicalUnitId==='unit-servitor-battleclade'){
      const keywordText=observed.keywords.map(row=>row.text).join('\n');
      assert.match(keywordText,/Servitor Underseer/,description+' no Underseer keyword scope');
      assert.match(keywordText,/Combat Servitors and Gun Servitors/,description+' missing combined canonical Servitor profile label');
      const modelRows=observed.keywords.filter(row=>/Model keywords/i.test(row.label));
      assert.ok(modelRows.every(row=>row.label.includes('Servitor')),description+' ambiguous model scope');
    }
    for(const field of effective.weapons.flatMap(weapon=>weapon.fields.map(field=>({weapon,field})))){
      const values=observed.factValues.filter(value=>value.id===`${field.weapon.id}::/${field.field.label}`);
      if(values.length&&typeof field.field.value!=='object')assert.ok(values.some(value=>value.value===field.field.value),description+' wrong effective weapon value');
    }
    if(label==='source-import'&&unit.canonicalUnitId==='unit-great-unclean-one'){
      const hasBell=effective.weapons.some(weapon=>weapon.id==='datasheet-great-unclean-one:weapon:6');
      assert.equal(/Reverberating Summons/.test(observed.text),hasBell,description+' unselected bell ability');
    }
    if(label==='source-import'&&unit.canonicalUnitId==='unit-helbrute')assert.equal(await page.locator('main .ds-wargear-footnote').count(),0,description+' orphan construction note');
    if(label==='source-import'&&unit.canonicalUnitId==='unit-lord-of-contagion'){
      assert.match(observed.text,/Feel\s+No\s+Pain\s+4\+/i);assert.match(observed.text,/SUSTAINED HITS 1/i);assert.match(observed.text,/LANCE/);assert.match(observed.text,/DEVASTATING WOUNDS/);
      for(const [id,field,value,breakdown]of [['datasheet-lord-of-contagion:weapon:1','attacks',6,'5 + 1'],['datasheet-lord-of-contagion:weapon:1','strength',10,'9 + 1'],['datasheet-lord-of-contagion:weapon:2','attacks',11,'10 + 1'],['datasheet-lord-of-contagion:weapon:2','strength',7,'6 + 1']]){
        assert.ok(observed.factValues.some(item=>item.id===`${id}::/${field}`&&String(item.value)===String(value)),description+' mega-case numeric');
        assert.ok(observed.weapons.find(row=>row.id===id)?.text.includes(breakdown),description+' modifier breakdown');
      }
    }
    if(label==='source-import'&&unit.canonicalUnitId==='unit-deathshroud-terminators'){
      assert.ok(observed.weapons.every(row=>!/DEVASTATING WOUNDS/.test(row.text)),description+' Furnace owner leakage');
      assert.equal(observed.statlines,1,description+' identical Champion/ordinary stats must render once');
      const annotations=await page.locator('main .ds-effective-profile-group > .ds-effective-metric').allTextContents();
      assert.deepEqual(annotations,['Contagion Range: +3" (maximum 12")'],description+' one uniform metric on the merged profile');
      assert.equal(await page.locator('main .ds-effective-profile-group .model-profile .ds-effective-metric').count(),0,description+' no internal scope annotation duplicates');
      assert.equal(await page.locator('main .ds-effective-profile-group .model-profile .ds-composition-scope').count(),0,description+' no empty internal annotation headings');
      assert.equal(observed.weapons.length,3,description+' one ranged and two distinct melee modes');
      assert.match(observed.composition[0],/2 × Plaguespurt gauntlet/);
      assert.match(observed.composition[0],/1 × Icon of Despair/);
      assert.doesNotMatch(observed.composition[0],/can be equipped/,'Composition uses selected equipment captions, not construction-option prose');
      assert.match(observed.composition[1],/1 × Plaguespurt gauntlet each/);
    }
    if(screenshots&&priority.has(unit.canonicalUnitId)&&(!captured.has(unit.canonicalUnitId)||label==='source-import')){await page.screenshot({path:path.join(out,`${device}-${army}-${label}-${unit.instanceId}.png`),fullPage:true});captured.add(unit.canonicalUnitId);}
    if(label==='source-import'&&effective.weapons.length){
      const weapon=effective.weapons[0];
      // The actual weapon link carries exact physical and composition scope.
      const link=page.locator(`main .weapon-row:not(.weapon-head) [data-target-id="${weapon.id}"]`).first();
      if(await page.locator('dialog[open]').count())await page.keyboard.press('Escape');
      await link.click();await page.waitForSelector('dialog.v2-detail-dialog[open]');
      const popup=await page.locator('dialog.v2-detail-dialog[open]').innerText();assert.ok(popup.includes(cards.get(weapon.id).title),description+' popup identity');
      assert.doesNotMatch(popup,/Active roster effects|Effective unit keywords/);popupChecks++;
      await page.keyboard.press('Escape');
    }
  }
  personalResults.push({army,device,fixture:label,instances:state.units.length,profiles,weapons,staticSections,compositionRows,popupChecks});
}
// Equipment captions are a display of a selected canonical source address, not
// a second equipment resolver. Real-book cases below use normal import/UI actions;
// malformed references are exercised only in disconnected diagnostic fixtures.
async function equipmentCaptionControls() {
  const {aggregateInventoryCases,aggregateInventoryFixture}=await import('../../../v2/aggregate-physical-inventory-qa.mjs');
  const cases=aggregateInventoryCases.map(value=>({...value,name:value.book,text:aggregateInventoryFixture(value)}));
  const drones=cases.find(value=>value.book==='death-guard');
  cases.push({...drones,name:'death-guard-physical-model-equipment',ownerKind:'MODEL',
    text:'+ DETACHMENT: Tallyband Summoners\n3x Plague Drones (100 pts)\n'+
      '• 1x Plaguebringer: Death’s heads, Foul mouthparts, Plaguesword\n'+
      '• 1x Plague Drone: Death’s heads, Foul mouthparts, Plaguesword, Instrument of Chaos\n'+
      '• 1x Plague Drone: Death’s heads, Foul mouthparts, Plaguesword, Daemonic Icon\n'+drones.plain+'\n'});
  const skitarii=cases.find(value=>value.book==='adeptus-mechanicus');
  // Separate valid selections, plus a different physical instance without gear.
  skitarii.extra=', 1x Omnispex';skitarii.equipment=skitarii.equipment.filter(item=>item.name==='Omnispex');
  skitarii.text=aggregateInventoryFixture(skitarii);
  for(const [slug,title,weapon,label,index]of [
    ['skitarii-rangers','Skitarii Rangers','Galvanic rifle','Enhanced data-tether',1],
    ['skitarii-vanguard','Skitarii Vanguard','Radium carbine','Omnispex',2],
    ['skitarii-vanguard','Skitarii Vanguard','Radium carbine','Enhanced data-tether',1]
  ]) {
    const plain=`10x ${title} (85 pts): 10x ${weapon}, 10x Close combat weapon`;
    cases.push({book:'adeptus-mechanicus',name:slug+'-'+index,unit:'unit-'+slug,
      source:`books/adeptus-mechanicus/sources/waha-11e-current-2026-09-25/${title.replaceAll(' ','-')}.html`,
      text:`+ DETACHMENT: Haloscreed Battle Clade\n${plain}, 1x ${label}\n${plain}\n`,
      equipment:[{id:`datasheet-${slug}:section:1`,name:label,quantity:1}]});
  }
  for(const [slug,title,weapons,label,path,points]of [
    ['archaeopter-fusilave','Archaeopter Fusilave','Cognis heavy stubber array, Armoured hull','Chaff Launcher','/blocks/1/text',160],
    ['archaeopter-stratoraptor','Archaeopter Stratoraptor','2x Cognis heavy stubber, 2x Heavy phosphor blaster, Twin cognis lascannon, Armoured hull','Command Uplink','/blocks/2/text',185],
    ['archaeopter-transvector','Archaeopter Transvector','Cognis heavy stubber array, Armoured hull','Command Uplink','/blocks/2/text',145]
  ])cases.push({book:'adeptus-mechanicus',name:slug,unit:'unit-'+slug,
    source:`books/adeptus-mechanicus/sources/waha-11e-current-2026-09-25/${title.replaceAll(' ','-')}.html`,
    text:`+ DETACHMENT: Cohort Cybernetica\n1x ${title} (${points} pts): ${weapons}, ${label}\n1x ${title} (${points} pts): ${weapons}\n`,
    equipment:[{id:`datasheet-${slug}:section:1`,name:label,quantity:1,path}]});
  for(const c of cases) {
    const raw=fs.readFileSync(path.join(repo,c.source),'utf8').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ');
    for(const expected of c.equipment){assert.ok(raw.toLowerCase().includes(expected.name.toLowerCase()),c.name+' accepted source equipment caption');
      if(expected.path)assert.ok(raw.includes(expected.name+':'),c.name+' exact accepted named equipment heading');}
  }
  for(const [device,viewport]of [['desktop',{width:1440,height:900}],['mobile',{width:390,height:844}]]) {
    const context=await browser.newContext({viewport,serviceWorkers:'block'}),page=await context.newPage();
    page.on('pageerror',error=>errors.push(error.message));
    page.on('console',message=>{if(message.type()==='error')errors.push(message.text());});
    const ready=async()=>{await page.waitForFunction(()=>Boolean(window.ArmyBookAppV2?.rosterPanel));
      await page.evaluate(async()=>{await ArmyBookAppV2.ready;await ArmyBookAppV2.rosterPanel.ready;await document.fonts.ready;});};
    const roster=async()=>{await page.getByRole('link',{name:'Roster',exact:true}).click();await ready();};
    for(const c of cases) {
      await page.goto(origin+'/v2/app.html');await page.getByRole('link',{name:'Roster',exact:true}).click();
      await page.locator(`main a[data-v2-book="${c.book}"]`).click();await ready();
      await page.getByRole('textbox',{name:'New Recruit text export',exact:true}).fill(c.text);
      await page.getByRole('button',{name:'Import roster',exact:true}).click();
      await page.waitForFunction(()=>ArmyBookAppV2.roster.state?.units.length===2);await ready();
      const before=await page.evaluate(()=>ArmyBookAppV2.roster.snapshot());
      assert.deepEqual(before.units.map(unit=>unit.canonicalUnitId),[c.unit,c.unit]);
      for(const [ordinal,unit]of before.units.entries())for(const view of ['effective','guide']) {
        await roster();
        if(view==='effective')await page.locator(`[data-roster-instance-id="${unit.instanceId}"]`).getByRole('button',{name:'Effective datasheet',exact:true}).click();
        else {await page.getByRole('button',{name:'Open personal guide',exact:true}).click();
          await page.locator(`main a[data-target-id="roster-unit/${unit.instanceId}"]`).click();}
        await ready();
        const report=await page.locator(`main .unit-card[data-roster-instance-id="${unit.instanceId}"]`).evaluate(root=>({
          items:[...root.querySelectorAll('[data-selected-canonical-ids]')].map(line=>({ids:JSON.parse(line.dataset.selectedCanonicalIds),
            text:line.textContent.replace(/\s+/g,' ').trim(),facts:[...line.querySelectorAll('[data-fact-id]')].map(node=>node.dataset.factId)})),
          overflow:document.documentElement.scrollWidth>innerWidth+1}));
        assert.equal(report.overflow,false,`${c.name}/${device}/${view}: page overflow`);
        const expected=ordinal?[]:c.equipment;
        const actual=report.items.filter(item=>item.ids.some(id=>id.includes(':section:')||id.includes(':wargear:')));
        assert.equal(actual.length,expected.length,c.name+'/'+view+' equipment rows; no duplicates or foreign instance gear');
        for(const equipment of expected) {
          const item=actual.find(item=>item.ids.includes(equipment.id)&&item.text.toLowerCase()===`${equipment.quantity} × ${equipment.name}`.toLowerCase());
          assert.ok(item,`${c.name}/${device}/${view}: missing exact ${equipment.name}; actual=${JSON.stringify(actual)}`);
          assert.ok(item.facts.length,'Equipment caption must retain canonical fact provenance');
          if(equipment.path){assert.equal(item.text,`${equipment.quantity} × ${equipment.name}`);
            assert.deepEqual(item.facts,[equipment.id+'::'+equipment.path],'Specific bound source block supplies caption and provenance');}
        }
        if(c.book==='tyranids')for(const weapon of c.weapons)assert.ok(report.items.some(item=>item.ids.includes(weapon.id)&&
          item.text===`${weapon.quantity} × ${weapon.name}`),'Weapon-only book keeps exact source weapon captions and quantities');
        if(!ordinal&&c.name.startsWith('archaeopter-'))await page.screenshot({path:path.join(out,`${device}-${c.name}-${view}.png`),fullPage:true});
        assert.deepEqual(await page.evaluate(()=>ArmyBookAppV2.roster.snapshot()),before,'Display must preserve identity, quantity and ownership');
        personalResults.push({device,book:c.book,fixture:c.name,instanceId:unit.instanceId,view,equipment:actual,status:'PASS'});
      }
      const selected=before.units[0];
      const selections=[...selected.selections,...selected.modelRows.flatMap(row=>[...row.selections,...row.loadouts.flatMap(loadout=>loadout.selections)])].filter(item=>item.canonicalEquipmentIds.length);
      if(c.ownerKind==='MODEL') {
        assert.ok(selected.selections.every(item=>!item.canonicalEquipmentIds.length),'Physical equipment must not migrate to UNIT inventory');
        assert.deepEqual(selected.modelRows.map(row=>row.selections.filter(item=>item.canonicalEquipmentIds.length).length),[0,1,1],
          'Instrument and Icon retain their distinct declared MODEL bearers');
        for(const item of selections)assert.equal(item.perModelQuantity,1);
      }else{
        for(const item of selections)assert.equal(item.perModelQuantity,null,'Aggregate equipment quantities must not invent MODEL bearer');
        assert.ok(selected.modelRows.every(row=>row.selections.every(item=>!item.canonicalEquipmentIds.length)),'Unknown equipment owner remains UNIT-only');
      }
      await page.reload();await ready();assert.deepEqual(await page.evaluate(()=>ArmyBookAppV2.roster.snapshot()),before,'Reload preserves quantities and unknown ownership');
    }
    // This isolated synthetic document never replaces real application DOM,
    // roster state, outputs or assertions in the real-book acceptance above.
    const diagnostic=await page.evaluate(async()=>{
      const {createSyntheticPersonalFixture}=await import('/books/shared/army-book-app-v2/personal-datasheet-qa.mjs');
      const {createDatasheetPresenter}=await import('/books/shared/army-book-app-v2/datasheet-v1.mjs');
      const {projectInstanceCards}=await import('/books/shared/army-book-app-v2/personal.mjs');
      const results=[];
      for(const variant of ['bound-heading','selected-field-heading','unrelated-headed-reference','explicit-reference','missing-reference','wrong-reference-path','negative-span','empty-span','outside-span','duplicate-reference','absent-caption','same-caption-distinct-identities','mixed-profile-equipment']) {
        const f=createSyntheticPersonalFixture('caption-diagnostic-'+variant),doc=document.implementation.createHTMLDocument('caption diagnostics');
        const target=f.cards.get(f.id('equipment')),base=target.fields[0];target.title='ABILITIES';target.kind='DATASHEET_SECTION';
        target.fields=[{...base,id:target.id+'::/title',value:'ABILITIES',presentation:'heading',label:'title',source:{entityId:target.id,path:'/title'}},
          {...base,id:target.id+'::/blocks/0/text',value:'Diagnostic Lens: An independent source-backed description.',source:{entityId:target.id,path:'/blocks/0/text'}}];
        const selection=f.unit.selections[0];selection.canonicalFieldPaths={[target.id]:['/blocks/0/text']};selection.sourceReferences=[{entityId:target.id,path:'/blocks/0/text'}];
        if(variant==='selected-field-heading')selection.sourceReferences=[];
        if(variant==='unrelated-headed-reference'){
          f.cards.get(f.id('instruction')).fields.find(field=>field.source.path==='/text').value='Unrelated heading: evidence cannot override the selected block';
          selection.sourceReferences.unshift({entityId:f.id('instruction'),path:'/text'});
        }
        if(variant==='mixed-profile-equipment')selection.canonicalProfileIds=[f.id('selected-weapon')];
        if(variant==='absent-caption'){target.fields=target.fields.slice(0,1);selection.sourceReferences=[];selection.canonicalFieldPaths={};}
        if(['explicit-reference','negative-span','empty-span','outside-span'].includes(variant)){
          const field=f.cards.get(f.id('instruction')).fields.find(field=>field.source.path==='/text');field.value='One calibrated lens.';
          selection.sourceReferences.push({entityId:f.id('instruction'),path:'/text',caption:{start:4,end:19}});
          const caption=selection.sourceReferences[1].caption;
          if(variant==='negative-span')caption.start=-1;if(variant==='empty-span')caption.end=caption.start;
          if(variant==='outside-span')caption.end=9999;
        }
        if(variant==='missing-reference')selection.sourceReferences.unshift({entityId:'absent',path:'/text',caption:{start:0,end:4}});
        if(variant==='wrong-reference-path')selection.sourceReferences.unshift({entityId:target.id,path:'/missing',caption:{start:0,end:4}});
        if(variant==='duplicate-reference')selection.sourceReferences.push(structuredClone(selection.sourceReferences[0]));
        if(variant==='same-caption-distinct-identities'){
          const other=structuredClone(target);other.id=f.id('other-equipment');other.fields.forEach(field=>{field.id=field.id.replace(target.id,other.id);field.source.entityId=other.id;});
          f.cards.set(other.id,other);const otherSelection=structuredClone(selection);otherSelection.canonicalEquipmentIds=[other.id];
          otherSelection.canonicalFieldPaths={[other.id]:['/blocks/0/text']};otherSelection.sourceReferences=[{entityId:other.id,path:'/blocks/0/text'}];f.unit.selections.push(otherSelection);
        }
        const saved=JSON.stringify({cards:[...f.cards],unit:f.unit,effective:f.effective});
        const el=(tag,classes='',text)=>{const node=doc.createElement(tag);if(classes)node.className=classes;if(text!==undefined)node.textContent=text;return node;};
        const factValue=(tag,field)=>{const node=el(tag,'',String(field.displayValue??field.value));node.dataset.factId=field.id;return node;};
        const anchor=(label,id)=>{const node=el('a','',label);node.dataset.targetId=id;return node;};
        const roster={state:{units:[f.unit],attachments:[]},effective:()=>f.effective};
        const presenter=createDatasheetPresenter({document:doc,payload:f.payload,cards:f.cards,el,factValue,anchor,related:()=>el('div'),roster});
        const variants=projectInstanceCards(f.cards,f.unit,f.effective),root=presenter.renderDatasheet(variants.get(f.unit.canonicalUnitId)[0],{variants,instanceId:f.unit.instanceId});
        results.push({variant,items:[...root.querySelectorAll('[data-selected-canonical-ids]')].map(line=>({text:line.textContent,ids:JSON.parse(line.dataset.selectedCanonicalIds),
          factId:line.querySelector('[data-fact-id]')?.dataset.factId})),unchanged:saved===JSON.stringify({cards:[...f.cards],unit:f.unit,effective:f.effective})});
      }return results;
    });
    for(const result of diagnostic){assert.equal(result.unchanged,true);assert.equal(result.items.length,result.variant==='same-caption-distinct-identities'?2:1);
      assert.ok(result.items.every(item=>/^1 × \S/.test(item.text)),'Missing/invalid captions must never render blank');
      assert.ok(result.items.every(item=>item.factId),'Fallback captions retain available canonical source provenance');
      if(result.variant==='mixed-profile-equipment')assert.equal(result.items[0].text,'1 × Shared display weapon / Diagnostic Lens','Equipment caption must not replace a selected weapon name');
      else if(result.variant!=='absent-caption')assert.ok(result.items.every(item=>item.text==='1 × '+(result.variant==='explicit-reference'?'calibrated lens':'Diagnostic Lens')),JSON.stringify(result));
      if(result.variant==='bound-heading')assert.ok(result.items[0].factId.endsWith('::/blocks/0/text'));
      if(result.variant==='explicit-reference')assert.ok(result.items[0].factId.endsWith('instruction::/text'));
      if(result.variant==='same-caption-distinct-identities')assert.notDeepEqual(result.items[0].ids,result.items[1].ids);
    }
    syntheticResults.push({device,equipmentCaptionControls:diagnostic,status:'PASS'});await context.close();
  }
}
try{
  await equipmentCaptionControls();
  if(!equipmentCaptionsOnly)for(const [device,viewport]of [['desktop',{width:1440,height:1000}],['phone',{width:390,height:844}]])for(const [army,payload]of payloads){
    console.log(JSON.stringify({phase:'START',army,device}));
    const context=await browser.newContext({viewport,reducedMotion:'reduce'}),page=await openPage(context,army);
    await syntheticDom(page,army,device);
    await effectiveDisplayControls(page,army,device);
    if(syntheticOnly){await context.close();continue;}
    const oldContext=await browser.newContext({viewport,reducedMotion:'reduce'}),oldPage=await openPage(oldContext,army,true);
    const units=payload.cards.filter(card=>card.kind==='DATASHEET');
    for(const unit of units){await page.evaluate(id=>window.ArmyBookAppV2.open(id),unit.id);await oldPage.evaluate(id=>window.ArmyBookAppV2.open(id),unit.id);await Promise.all([settle(page),settle(oldPage)]);
      const current=await snapshot(page),previous=await snapshot(oldPage);assert.deepEqual(current,previous,`${army}/${device}/${unit.id}: normal datasheet changed`);
    }
    normalComparisons.push({army,device,datasheets:units.length,text:'IDENTICAL',domExceptValidatedRouteURLs:'IDENTICAL',geometry:'IDENTICAL'});
    console.log(JSON.stringify({phase:'NORMAL_UNCHANGED',army,device,datasheets:units.length}));
    await oldContext.close();
    await verifyState(page,army,device,allUnitFixture(books.get(army)),'all-canonical-units');
    if(army==='adeptus-mechanicus')await verifyState(page,army,device,effectiveIntegrationFixture(books.get(army)),'complete-effective-integration',{screenshots:true});
    const importedState=await imported(page,army==='death-guard'?dgImport:amCompositionImport);
    if(army==='death-guard')assert.notEqual((await page.evaluate(()=>window.ArmyBookAppV2.roster.attach('parsed-unit-1','parsed-unit-2')))?.ok,false);
    const attachedState=await page.evaluate(()=>window.ArmyBookAppV2.roster.snapshot());
    assert.equal(importedState.units.length,army==='death-guard'?5:3);
    await verifyState(page,army,device,attachedState,'source-import',{load:false,screenshots:true});
    if(army==='death-guard'){
      await page.evaluate(()=>window.ArmyBookAppV2.openInstance('parsed-unit-1'));await settle(page);const before=await snapshot(page);
      await page.evaluate(()=>{window.ArmyBookAppV2.roster.detach('parsed-unit-1');window.ArmyBookAppV2.openInstance('parsed-unit-1');});await settle(page);
      const detached=await page.locator('main .unit-card').evaluate(root=>({abilities:[...root.querySelectorAll('[data-ability-presentation-identity]')].map(node=>node.textContent),tags:[...root.querySelectorAll('.weapon-tags')].map(node=>node.textContent)}));
      assert.ok(detached.abilities.every(text=>!/Feel\s+No\s+Pain\s+4\+/i.test(text)));assert.ok(detached.tags.every(text=>!/SUSTAINED HITS 1|LANCE/.test(text)));
      await page.evaluate(()=>{window.ArmyBookAppV2.roster.attach('parsed-unit-1','parsed-unit-2');window.ArmyBookAppV2.openInstance('parsed-unit-1');});await settle(page);
      assert.deepEqual(await snapshot(page),before,device+' detach/re-attach must restore exact effective presentation');
    }
    await context.close();
  }
  assert.deepEqual(errors,[],'Uncaught browser errors');
  const report={status:'PASS',baselineHead,normalComparisons,personalResults,syntheticResults,pageErrors:errors,screenshots:out};
  fs.writeFileSync(path.join(out,equipmentCaptionsOnly?'equipment-caption-browser-report.json':syntheticOnly?'personal-datasheet-synthetic-browser-report.json':'personal-datasheet-browser-report.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}

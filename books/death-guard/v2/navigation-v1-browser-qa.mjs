import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';

// Permanent browser proof for the actual V1 NavigationController port. V1 is
// loaded only as an independent visual/interaction oracle. The V2 page must
// continue to obtain all identities and rendered facts from its V2 payload.
const {chromium}=createRequire(import.meta.url)('playwright');
const repo=path.resolve(fileURLToPath(new URL('../../../',import.meta.url)));
const v1Path='/books/death-guard/reader.html?view=full#start';
const v2Path='/books/death-guard/v2/app.html#start';
const evidence=process.env.ARMY_APP_V2_SCREENSHOTS||fs.mkdtempSync(path.join(os.tmpdir(),'dg-v1-navigation-browser-qa-'));
fs.mkdirSync(evidence,{recursive:true});

const mime={'.css':'text/css','.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.json':'application/json','.svg':'image/svg+xml','.webmanifest':'application/manifest+json','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg','.woff2':'font/woff2'};
const serverFailures=[];
const server=http.createServer((request,response)=>{
  try{
    const address=new URL(request.url,'http://localhost').pathname;
    let file=path.resolve(repo,'.'+decodeURIComponent(address));
    assert.ok(file===repo||file.startsWith(repo+path.sep),'Request escaped repository root.');
    if(fs.statSync(file).isDirectory())file=path.join(file,'index.html');
    response.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});
    response.end(fs.readFileSync(file));
  }catch(error){serverFailures.push({url:request.url,message:error.message});response.writeHead(404,{'Content-Type':'text/plain'});response.end('Not found');}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const origin=`http://127.0.0.1:${server.address().port}`;
const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE}:{})});

const results=[];
let activePage=null,step='startup';
const observe=page=>{
  const errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  page.on('console',message=>{if(message.type()==='error'&&!/favicon|404/i.test(message.text()))errors.push(message.text());});
  return errors;
};
const readyV1=page=>page.waitForFunction(()=>Boolean(window.DG_APP?.navigation?.byId?.size&&window.WHArmyBookTargetMount?.catalog));
const readyV2=async page=>{
  await page.waitForFunction(()=>Boolean(window.ArmyBookAppV2?.navigation?.byId?.size));
  await page.waitForFunction(()=>getComputedStyle(document.getElementById('tocPanel')).position==='fixed');
  await page.evaluate(()=>document.fonts?.ready);
};
const waitController=page=>page.waitForFunction(()=>window.ArmyBookAppV2.navigation.state.owner==='reader');
const noOverflow=async(page,label)=>assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,label+' horizontal overflow');

const styleSnapshot=page=>page.evaluate(()=>{
  const panel=document.getElementById('tocPanel'),heading=panel.querySelector('.toc-heading'),row=panel.querySelector('.toc-row'),label=panel.querySelector('.toc-label'),toggle=panel.querySelector('.toc-toggle');
  const take=(node,names,pseudo=null)=>{const style=getComputedStyle(node,pseudo);return Object.fromEntries(names.map(name=>[name,style[name]]));};
  return {
    panel:take(panel,['position','top','right','bottom','left','width','padding','overflowX','overflowY','overscrollBehavior','scrollbarColor','backgroundImage','backgroundColor','borderTopWidth','borderTopStyle','borderTopColor','boxShadow','transform','visibility']),
    heading:take(heading,['margin','padding','borderBottomWidth','borderBottomStyle','borderBottomColor','fontFamily','fontSize','fontWeight','letterSpacing']),
    row:take(row,['display','gridTemplateColumns','columnGap','rowGap','margin','minWidth']),
    label:take(label,['minHeight','padding','overflowWrap','textAlign','fontFamily','fontSize','lineHeight','fontWeight','borderRadius']),
    toggle:take(toggle,['minHeight','borderRadius']),
    arrow:take(toggle,['content','color','fontSize','rotate'], '::after'),
    menu:take(document.getElementById('navMenu'),['display','minWidth','minHeight','fontFamily','fontSize','lineHeight']),
    collapse:take(document.getElementById('navCollapse'),['display','minWidth','minHeight','fontFamily','fontSize','lineHeight']),
    // The port owns the fixed-header clearance and navigation-side gutter. The
    // opposite content gutter remains part of each reader's page layout.
    main:take(document.getElementById('main'),['paddingTop','paddingRight','paddingBottom','paddingLeft']),
    header:take(document.getElementById('appHeader'),['position','top','height']),
    panelAriaHidden:panel.getAttribute('aria-hidden'),panelInert:panel.inert,
    breakpoint:window.DG_APP?.navigation?.breakpoint??window.ArmyBookAppV2?.navigation?.breakpoint
  };
});

const activeStyle=async page=>page.evaluate(()=>{
  const controller=window.DG_APP?.navigation||window.ArmyBookAppV2.navigation;
  const item=controller.items.find(candidate=>candidate.button.classList.contains('is-current'))||controller.items[0];
  controller.activate(item.id,{instanceId:item.instanceId,keepVisible:false});
  const current=getComputedStyle(item.button),ancestor=[...controller.activeButtons].find(button=>button!==item.button),ancestorStyle=ancestor&&getComputedStyle(ancestor);
  return {aria:item.button.getAttribute('aria-current'),color:current.color,backgroundImage:current.backgroundImage,boxShadow:current.boxShadow,ancestorColor:ancestorStyle?.color||null};
});

async function contentsFactCensus(page,device){
  step=device+'/full-contents-fact-census';
  const census=await page.evaluate(()=>{
    const expected=window.ArmyBookAppV2.payload.factManifest,observed=[...document.querySelectorAll('main .v1-contents-pages [data-fact-id]')].map(node=>({id:node.dataset.factId,value:JSON.parse(node.dataset.factValue),entityId:node.dataset.entityId,contextId:node.dataset.contextId,text:node.textContent,cardId:node.closest('[data-card-id]')?.dataset.cardId}));
    return{expected,observed,cards:[...document.querySelectorAll('main .v1-contents-pages [data-card-id]')].map(node=>node.dataset.cardId)};
  });
  assert.equal(census.expected.length,3654,device+' canonical fact denominator changed');
  assert.equal(census.observed.length,3654,device+' full Contents DOM fact loss or duplication');
  const actual=new Map(census.observed.map(fact=>[fact.id,fact]));assert.equal(actual.size,3654,device+' full Contents DOM duplicate fact identity');
  for(const fact of census.expected){const observed=actual.get(fact.id);assert.ok(observed,device+' missing full Contents fact '+fact.id);assert.deepEqual(observed.value,fact.value,device+' wrong fact value '+fact.id);assert.equal(observed.entityId,fact.entityId,device+' wrong fact entity '+fact.id);assert.equal(observed.contextId,fact.contextId,device+' wrong fact context '+fact.id);}
  return{facts:actual.size,cards:new Set(census.cards).size};
}

async function stageRecognizableFullBook(page,phone){
  await page.evaluate(()=>{const controller=window.DG_APP?.navigation||window.ArmyBookAppV2.navigation,item=controller.items.find(entry=>entry.button.textContent.trim()==='Plague Marines');if(!item)throw new Error('Plague Marines missing from full Contents');controller.revealPath(item.node,{includeSelf:true});item.button.click();});
  await page.waitForFunction(()=>{const controller=window.DG_APP?.navigation||window.ArmyBookAppV2.navigation;return controller.state.owner==='reader'&&controller.items.some(item=>item.button.textContent.trim()==='Plague Marines'&&item.button.getAttribute('aria-current')==='location');});
  if(phone&&await page.locator('#navMenu').getAttribute('aria-expanded')!=='true')await page.locator('#navMenu').click();
}

async function independentPanelScrollContract(page,device){
  const result=await page.evaluate(()=>{const panel=document.getElementById('tocPanel'),windowY=scrollY;panel.scrollTop=panel.scrollHeight;return{overflow:getComputedStyle(panel).overflowY,beforeWindowY:windowY,afterWindowY:scrollY,scrollTop:panel.scrollTop,scrollable:panel.scrollHeight>panel.clientHeight};});
  assert.equal(result.overflow,'auto');assert.equal(result.scrollable,true,device+' expanded full Contents panel must scroll independently');assert.ok(result.scrollTop>0,device+' Contents panel did not retain independent scroll');assert.equal(result.afterWindowY,result.beforeWindowY,device+' Contents scrolling moved the reader');return result;
}

const rosterConnectorSnapshot=(page,fixture=null)=>page.evaluate(fixture=>{
  let group=document.querySelector('#tocTree .roster-attachment-group'),created=null;
  if(fixture){created=document.createElement('li');created.className='roster-attachment-group';const members=document.createElement('ul');members.className='roster-attachment-members';for(const [role,text] of [['leader',fixture.leaderText],['bodyguard',fixture.bodyText]]){const item=document.createElement('li'),row=document.createElement('div'),label=document.createElement('button');item.dataset.rosterAttachmentRole=role;row.className='toc-row no-toggle';label.className='toc-label';label.type='button';label.textContent=text;row.append(label);item.append(row);members.append(item);}created.append(members);document.getElementById('tocTree').append(created);group=created;}
  const members=group?.querySelector('.roster-attachment-members'),body=group?.querySelector('[data-roster-attachment-role="bodyguard"]'),row=body?.querySelector('.toc-row'),label=body?.querySelector('.toc-label');if(!group||!members||!body||!row||!label)throw new Error('Roster attachment connector missing: '+JSON.stringify({fixture,group:Boolean(group),members:Boolean(members),body:Boolean(body),row:Boolean(row),label:Boolean(label),groups:document.querySelectorAll('#tocTree .roster-attachment-group').length,roles:[...document.querySelectorAll('#tocTree [data-roster-attachment-role]')].map(node=>node.dataset.rosterAttachmentRole)}));
  const take=(node,names,pseudo=null)=>{const style=getComputedStyle(node,pseudo);return Object.fromEntries(names.map(name=>[name,style[name]]));};
  const leader=group.querySelector('[data-roster-attachment-role="leader"] .toc-label');const result={leaderText:leader.textContent,bodyText:label.textContent,group:take(group,['position','margin','padding','listStyleType']),members:take(members,['margin','padding','listStyleType']),body:take(body,['position','paddingTop']),row:take(row,['height','minHeight']),before:take(row,['content','position','zIndex','top','left','width','borderTopWidth','borderTopStyle','borderTopColor','pointerEvents'],'::before'),after:take(row,['content','position','zIndex','top','bottom','left','borderLeftWidth','borderLeftStyle','borderLeftColor','pointerEvents'],'::after'),label:take(label,['paddingLeft','fontSize','lineHeight','fontFamily','fontWeight'])};created?.remove();return result;
},fixture);

async function algorithmContract(page){
  step='algorithm-contract';
  const result=await page.evaluate(async()=>{
    const controller=window.ArmyBookAppV2.navigation,original={items:controller.items,geometry:controller.geometry,activate:controller.activate,state:controller.state,stop:controller.stopControlledScroll,schedule:controller.scheduleRead,refresh:controller.refreshGeometry,raf:window.requestAnimationFrame,now:Date.now};
    const host=document.createElement('ul'),parent=document.createElement('li'),child=document.createElement('li'),next=document.createElement('li'),branch=document.createElement('ul');
    branch.className='toc-branch';parent.append(branch);branch.append(child,next);host.append(parent);
    const parentItem={id:'parent',depth:1,node:parent},childItem={id:'child',depth:2,node:child},nextItem={id:'next',depth:2,node:next};
    const observed={};
    try{
      controller.trackingGap=18;controller.epsilon=1;controller.geometry={headerBottom:72,ranges:[]};
      const target={getBoundingClientRect:()=>({top:200})};window.scrollTo(0,1000);observed.destination=controller.destination(target);
      controller.items=[parentItem,childItem];controller.geometry.ranges=[{item:parentItem,top:0,bottom:500,measurable:true},{item:childItem,top:1120,bottom:1300,measurable:true}];
      observed.beforeChild=controller.pickActive()?.id;
      controller.geometry.ranges[1]={item:childItem,top:1090.5,bottom:1300,measurable:true};observed.epsilonChild=controller.pickActive()?.id;
      controller.items=[parentItem,childItem,nextItem];controller.geometry.ranges=[{item:parentItem,top:1000,bottom:1700,measurable:true},{item:childItem,top:1040,bottom:1080,measurable:true},{item:nextItem,top:1130,bottom:1320,measurable:true}];
      observed.gapRetention=controller.pickActive()?.id;
      let stopped=0,scheduled=0;controller.state={owner:'controller',active:'child',instance:'',drawer:false,collapsed:false,transition:8};controller.stopControlledScroll=()=>{stopped++;};controller.scheduleRead=()=>{scheduled++;};
      controller.cancelTransition({target:document.getElementById('tocPanel')});observed.panelCancellation={owner:controller.state.owner,transition:controller.state.transition,stopped,scheduled};
      controller.cancelTransition({target:document.getElementById('main')});observed.articleCancellation={owner:controller.state.owner,transition:controller.state.transition,stopped,scheduled};

      const queue=[];window.requestAnimationFrame=callback=>{queue.push(callback);return queue.length;};
      controller.state={owner:'controller',active:'',instance:'',drawer:false,collapsed:false,transition:20};let settledAt=0,frames=0;
      controller.waitForSettle(window.scrollY,20,()=>{settledAt=frames;});
      while(queue.length&&frames<5){frames++;queue.shift()();}
      observed.guardBeforeSix={owner:controller.state.owner,settledAt,queued:queue.length};frames++;queue.shift()();
      observed.guardAtSix={owner:controller.state.owner,settledAt};

      let now=0,hardStops=0,hardPositions=0,refreshes=0,hardSettled=0;Date.now=()=>now;queue.length=0;
      controller.state={owner:'controller',active:'',instance:'',drawer:false,collapsed:false,transition:30};controller.stopControlledScroll=()=>{hardStops++;};controller.scrollImmediately=()=>{hardPositions++;};controller.refreshGeometry=()=>{refreshes++;};
      controller.waitForSettle(window.scrollY+100,30,()=>{hardSettled++;});now=2201;queue.shift()();
      observed.timeoutBeforeFinalFrame={owner:controller.state.owner,hardStops,hardPositions,refreshes,hardSettled,queued:queue.length};queue.shift()();
      observed.timeoutAfterFinalFrame={owner:controller.state.owner,hardStops,hardPositions,refreshes,hardSettled};
    }finally{
      window.requestAnimationFrame=original.raf;Date.now=original.now;controller.items=original.items;controller.geometry=original.geometry;controller.activate=original.activate;controller.state=original.state;controller.stopControlledScroll=original.stop;controller.scheduleRead=original.schedule;controller.refreshGeometry=original.refresh;window.scrollTo(0,0);controller.scheduleGeometry();
    }
    return observed;
  });
  assert.equal(result.destination,1110);
  assert.equal(result.beforeChild,'parent');assert.equal(result.epsilonChild,'child');assert.equal(result.gapRetention,'child');
  assert.deepEqual(result.panelCancellation,{owner:'controller',transition:8,stopped:0,scheduled:0});
  assert.deepEqual(result.articleCancellation,{owner:'reader',transition:9,stopped:1,scheduled:1});
  assert.deepEqual(result.guardBeforeSix,{owner:'controller',settledAt:0,queued:1});
  assert.deepEqual(result.guardAtSix,{owner:'reader',settledAt:6});
  assert.deepEqual(result.timeoutBeforeFinalFrame,{owner:'controller',hardStops:1,hardPositions:1,refreshes:0,hardSettled:0,queued:1});
  assert.deepEqual(result.timeoutAfterFinalFrame,{owner:'reader',hardStops:1,hardPositions:1,refreshes:1,hardSettled:1});
  return result;
}

async function accordionContract(page,phone){
  step=(phone?'phone':'desktop')+'/accordion';
  if(phone)await page.locator('#navMenu').click();
  const roots=page.locator('#tocTree > [data-nav-id]');
  const labels=await roots.locator(':scope > .toc-row > [data-nav-target]').allTextContents();
  assert.deepEqual(labels.slice(0,5),['Start','Army Rule','Detachments','Datasheets','Updates']);
  const branches=roots.filter({has:page.locator(':scope > .toc-branch')});
  assert.ok(await branches.count()>=3);
  const first=branches.nth(0),second=branches.nth(1),firstToggle=first.locator(':scope > .toc-row > [data-nav-toggle]'),secondToggle=second.locator(':scope > .toc-row > [data-nav-toggle]');
  const beforeHash=await page.evaluate(()=>location.hash),beforeY=await page.evaluate(()=>scrollY);
  await firstToggle.click();assert.equal(await firstToggle.getAttribute('aria-expanded'),'true');
  assert.equal(await first.locator(':scope > .toc-branch').evaluate(node=>node.hidden),false);
  await secondToggle.click();assert.equal(await secondToggle.getAttribute('aria-expanded'),'true');assert.equal(await firstToggle.getAttribute('aria-expanded'),'false');
  assert.equal(await first.locator(':scope > .toc-branch').evaluate(node=>node.hidden),true);
  assert.equal(await page.evaluate(()=>location.hash),beforeHash);assert.ok(Math.abs((await page.evaluate(()=>scrollY))-beforeY)<=1);
  if(phone){await page.keyboard.press('Escape');assert.equal(await page.locator('#navMenu').getAttribute('aria-expanded'),'false');}
  return labels;
}

async function canonicalNavigationContract(page,phone){
  const device=phone?'phone':'desktop';step=device+'/canonical-navigation';
  const choose=async id=>{
    if(phone&&await page.locator('#navMenu').getAttribute('aria-expanded')!=='true')await page.locator('#navMenu').click();
    await page.evaluate(id=>{const controller=window.ArmyBookAppV2.navigation,item=controller.byId.get(id);controller.revealPath(item.node,{includeSelf:true});item.button.click();},id);
    await page.waitForFunction(id=>decodeURIComponent(location.hash.slice(1))===id&&document.querySelector(`[data-nav-target="${CSS.escape(id)}"]`)?.getAttribute('aria-current')==='location'&&window.ArmyBookAppV2.navigation.state.owner==='reader',id);
  };
  await choose('unit-plague-marines');
  let selected=await page.evaluate(()=>({hash:decodeURIComponent(location.hash.slice(1)),current:[...document.querySelectorAll('#tocTree [aria-current="location"]')].map(node=>node.dataset.navTarget),card:document.querySelector('main [data-card-id="unit-plague-marines"]')?.dataset.cardId,top:document.querySelector('main [data-card-id="unit-plague-marines"]')?.getBoundingClientRect().top,line:document.getElementById('appHeader').getBoundingClientRect().bottom+18,highlight:document.querySelector('main [data-card-id="unit-plague-marines"]')?.classList.contains('v1-navigation-destination')}));
  assert.equal(selected.hash,'unit-plague-marines');assert.deepEqual(selected.current,['unit-plague-marines']);assert.equal(selected.card,'unit-plague-marines');assert.ok(Math.abs(selected.top-selected.line)<3);assert.equal(selected.highlight,true);
  await choose('unit-deathshroud-terminators');
  await page.goBack();await page.waitForFunction(()=>location.hash==='#unit-plague-marines'&&document.querySelector('[data-nav-target="unit-plague-marines"]')?.getAttribute('aria-current')==='location');
  await page.goForward();await page.waitForFunction(()=>location.hash==='#unit-deathshroud-terminators'&&document.querySelector('[data-nav-target="unit-deathshroud-terminators"]')?.getAttribute('aria-current')==='location');
  await page.reload();await readyV2(page);await page.waitForFunction(()=>location.hash==='#unit-deathshroud-terminators'&&document.querySelector('[data-nav-target="unit-deathshroud-terminators"]')?.getAttribute('aria-current')==='location');await waitController(page);

  if(!phone){
    await choose('nav:detachment-virulent-vectorium:DETACHMENT_RULE');
    const section=await page.evaluate(()=>{const target=document.querySelector('[data-contents-target="nav:detachment-virulent-vectorium:DETACHMENT_RULE"]'),heading=target?.matches('h1,h2,h3')?target:target?.querySelector('h1,h2,h3');return{hash:decodeURIComponent(location.hash.slice(1)),tag:heading?.tagName,top:heading?.getBoundingClientRect().top,line:document.getElementById('appHeader').getBoundingClientRect().bottom+18,highlight:heading?.classList.contains('v1-navigation-destination')};});
    assert.equal(section.hash,'nav:detachment-virulent-vectorium:DETACHMENT_RULE');assert.ok(/^H[1-6]$/.test(section.tag));assert.ok(Math.abs(section.top-section.line)<3);assert.equal(section.highlight,true);
  }

  const rapid=['unit-mortarion','unit-plague-marines','unit-typhus'];
  await page.evaluate(ids=>{const c=window.ArmyBookAppV2.navigation;for(const id of ids){const item=c.byId.get(id);c.revealPath(item.node,{includeSelf:true});item.button.click();}},rapid);
  await page.waitForFunction(id=>decodeURIComponent(location.hash.slice(1))===id&&window.ArmyBookAppV2.navigation.state.owner==='reader'&&document.querySelectorAll('#tocTree [aria-current="location"]').length===1&&document.querySelector('#tocTree [aria-current="location"]')?.dataset.navTarget===id,rapid.at(-1));
  assert.equal(await page.evaluate(()=>document.querySelectorAll('.v1-navigation-destination').length),1);
  return selected;
}

async function phoneDrawerContract(page){
  step='phone/drawer';
  const menu=page.locator('#navMenu'),panel=page.locator('#tocPanel'),scrim=page.locator('#tocScrim');
  await menu.click();await page.waitForFunction(()=>document.body.classList.contains('nav-drawer-open'));
  assert.equal(await menu.getAttribute('aria-expanded'),'true');assert.equal(await panel.getAttribute('aria-hidden'),'false');assert.equal(await scrim.getAttribute('aria-hidden'),'false');
  assert.equal(await page.locator('#main').evaluate(node=>node.inert),true);assert.equal(await page.evaluate(()=>[...document.querySelector('#appHeader').children].filter(node=>node.id!=='navMenu').every(node=>node.inert)),true);assert.equal(await menu.evaluate(node=>node.inert),false);
  assert.equal(await page.evaluate(()=>getComputedStyle(document.body).overflow),'hidden');await page.waitForFunction(()=>document.querySelector('#tocPanel').contains(document.activeElement));
  const controls=page.locator('#tocPanel a:visible,#tocPanel button:visible,#tocPanel input:visible,#tocPanel [tabindex]:visible'),first=controls.first(),last=controls.last();
  await first.focus();await page.keyboard.press('Shift+Tab');assert.equal(await page.evaluate(()=>document.activeElement?.id),'navMenu');await page.keyboard.press('Tab');assert.equal(await first.evaluate(node=>document.activeElement===node),true);
  await last.focus();await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement?.id),'navMenu');await page.keyboard.press('Shift+Tab');assert.equal(await last.evaluate(node=>document.activeElement===node),true);
  await page.keyboard.press('Escape');assert.equal(await menu.getAttribute('aria-expanded'),'false');assert.equal(await page.evaluate(()=>document.activeElement?.id),'navMenu');assert.equal(await page.locator('#main').evaluate(node=>node.inert),false);
  await menu.click();await scrim.click({position:{x:380,y:120},force:true});assert.equal(await menu.getAttribute('aria-expanded'),'false');
  await menu.click();await page.setViewportSize({width:1440,height:1000});await page.waitForFunction(()=>!document.body.classList.contains('nav-drawer-open'));
  assert.equal(await page.locator('#main').evaluate(node=>node.inert),false);assert.equal(await panel.getAttribute('aria-hidden'),'false');
  await page.locator('#navCollapse').click();assert.equal(await page.evaluate(()=>document.body.classList.contains('nav-collapsed')),true);
  await page.setViewportSize({width:390,height:844});await page.waitForFunction(()=>getComputedStyle(document.getElementById('navMenu')).display!=='none');
  assert.equal(await page.evaluate(()=>document.body.classList.contains('nav-collapsed')),false);await noOverflow(page,'phone resize cleanup');
}

const rosterFixture=[
  '+ DETACHMENT: Virulent Vectorium','+ WARLORD: Char2: Lord of Contagion',
  'Char1: 1x Biologus Putrifier (50 pts): Plague knives','Char2: 1x Lord of Contagion (100 pts): Warlord',
  '3x Deathshroud Terminators (140 pts)','3x Deathshroud Terminators (140 pts)',
  '5x Plague Marines (90 pts): 4x Boltgun, 1x Meltagun','5x Plague Marines (90 pts): 4x Boltgun, 1x Meltagun'
].join('\n');
async function rosterNavigationContract(page,v1){
  step='desktop/roster-navigation';
  await page.evaluate(()=>window.ArmyBookAppV2.openRoster());
  await page.locator('[data-roster-input="raw-text"]').fill(rosterFixture);await page.locator('[data-roster-action="review-import"]').click();
  await page.waitForFunction(()=>window.ArmyBookAppV2.roster?.state?.units?.length===6&&!document.querySelector('.v2-roster[aria-busy=true]'));
  const attach=async(leader,target)=>{const section=page.locator(`[data-attachment-target-instance-id="${target}"]`),select=section.locator(`[data-attachment-candidate-for="${target}"]`);await select.selectOption(leader);await section.locator('[data-roster-action="attach"]').click();await page.waitForFunction(({leader,target})=>window.ArmyBookAppV2.roster.state.attachments.some(edge=>edge.leaderInstanceId===leader&&edge.bodyguardInstanceId===target)&&JSON.parse(localStorage.getItem(window.ArmyBookAppV2.rosterPanel.storageKey)).attachments.some(edge=>edge.leaderInstanceId===leader&&edge.bodyguardInstanceId===target),{leader,target});};
  await attach('parsed-unit-2','parsed-unit-3');await attach('parsed-unit-1','parsed-unit-5');await page.locator('[data-roster-action="open-personal-guide"]').click();
  await page.waitForFunction(()=>location.hash==='#view-roster-guide'&&document.querySelector('#tocTree')?.dataset.scope==='ROSTER');
  const state=await page.evaluate(()=>({
    instances:[...document.querySelectorAll('#tocTree [data-roster-instance]')].map(node=>({id:node.dataset.rosterInstance,label:node.textContent.trim(),canonical:node.dataset.canonicalId})),
    groups:[...document.querySelectorAll('#tocTree .roster-attachment-group')].map(group=>[...group.querySelectorAll('[data-roster-instance]')].map(node=>({id:node.dataset.rosterInstance,role:node.closest('[data-roster-attachment-role]')?.dataset.rosterAttachmentRole}))),
    toggles:[...document.querySelectorAll('#tocTree [data-nav-toggle]')].filter(toggle=>!toggle.closest('[data-nav-id="nav:army-rules"], [data-nav-id="nav:detachments"]')).length
  }));
  assert.equal(state.instances.length,6);assert.equal(new Set(state.instances.map(item=>item.id)).size,6);assert.equal(state.toggles,0);
  const orderingInput=await page.evaluate(()=>{
    const api=window.ArmyBookAppV2,roster=api.roster.snapshot(),cards=api.payload.cards;
    const catalog={units:cards.filter(card=>card.kind==='DATASHEET').map(card=>({id:card.id,title:card.title,intrinsicKeywords:card.fields.filter(field=>/^\/keywords\/\d+$/.test(field.source?.path||'')).map(field=>field.value)}))};
    const game={units:roster.units.map(unit=>({identity:{instanceId:unit.instanceId,canonicalDatasheetId:unit.canonicalUnitId,canonicalTitle:cards.find(card=>card.id===unit.canonicalUnitId).title},attachments:{leaders:roster.attachments.filter(edge=>edge.bodyguardInstanceId===unit.instanceId).map(edge=>({instanceId:edge.leaderInstanceId,certainty:'current',provenance:{kind:'explicit-roster-attachment'}}))}}))};
    return{game,catalog};
  });
  const v1Order=await v1.evaluate(input=>window.WHArmyRosterNavigation.order(input.game,input.catalog).map(item=>({id:item.instanceId,label:item.label,canonical:item.targetId,attachment:item.navigationAttachment})),orderingInput);
  assert.deepEqual(state.instances,v1Order.map(({id,label,canonical})=>({id,label,canonical})),'V2 physical Contents order differs from the actual V1 source algorithm');
  assert.deepEqual(state.groups,v1Order.filter(item=>item.attachment).reduce((groups,item)=>{let group=groups.find(row=>row.id===item.attachment.groupId);if(!group){group={id:item.attachment.groupId,members:[]};groups.push(group);}group.members.push({id:item.id,role:item.attachment.role});return groups;},[]).map(group=>group.members),'V2 attachment grouping differs from the actual V1 source algorithm');
  assert.deepEqual(state.instances.filter(item=>item.canonical==='unit-deathshroud-terminators').map(item=>item.label),['Deathshroud Terminators #1','Deathshroud Terminators #2']);assert.deepEqual(state.instances.filter(item=>item.canonical==='unit-plague-marines').map(item=>item.label),['Plague Marines #1','Plague Marines #2']);
  const open=async id=>{await page.evaluate(id=>document.querySelector(`[data-roster-instance="${CSS.escape(id)}"]`).click(),id);await page.waitForFunction(id=>decodeURIComponent(location.hash.slice(1))==='roster-unit/'+id&&window.ArmyBookAppV2.navigation.activeInstance===id&&document.querySelector(`main [data-roster-context-instance-id="${CSS.escape(id)}"]`),id);};
  const expectLocation=async(id,label)=>{
    try{await page.waitForFunction(id=>decodeURIComponent(location.hash.slice(1))==='roster-unit/'+id&&window.ArmyBookAppV2.navigation.activeInstance===id&&document.querySelector(`main [data-roster-context-instance-id="${CSS.escape(id)}"]`),id,{timeout:5000});}
    catch(error){const observed=await page.evaluate(()=>{const navigation=window.ArmyBookAppV2.navigation,hash=decodeURIComponent(location.hash.slice(1)),item=navigation.itemFor(hash);return{hash,active:navigation.active,activeInstance:navigation.activeInstance,state:navigation.state,item:item&&{id:item.id,instanceId:item.instanceId},byInstance:[...navigation.byInstance.keys()],current:[...document.querySelectorAll('#tocTree [aria-current="location"]')].map(node=>({target:node.dataset.navTarget,instance:node.dataset.rosterInstance})),rendered:[...document.querySelectorAll('main [data-roster-context-instance-id]')].map(node=>node.dataset.rosterContextInstanceId),historyState:history.state,historyLength:history.length};});throw new Error(`${label} did not restore the physical roster target: ${JSON.stringify(observed)}; ${error.message}`);}
  };
  await open('parsed-unit-5');
  await open('parsed-unit-6');
  step='roster/back';await page.goBack();await expectLocation('parsed-unit-5','Back');
  step='roster/forward';await page.goForward();await expectLocation('parsed-unit-6','Forward');
  step='roster/reload';await page.reload();await readyV2(page);await page.evaluate(()=>window.ArmyBookAppV2.rosterPanel.ready);await expectLocation('parsed-unit-6','Reload');await page.waitForFunction(()=>document.querySelectorAll('#tocTree .roster-attachment-group').length===2);
  return state;
}

try{
  for(const [device,viewport] of [['desktop',{width:1440,height:1000}],['phone',{width:390,height:844}]]){
    const phone=device==='phone';step=device+'/boot';
    const v1Context=await browser.newContext({serviceWorkers:'block',viewport,...(phone?{isMobile:true,hasTouch:true}:{})});
    const v2Context=await browser.newContext({serviceWorkers:'block',viewport,...(phone?{isMobile:true,hasTouch:true}:{})});
    const v1=await v1Context.newPage(),v2=await v2Context.newPage();activePage=v2;v1.setDefaultTimeout(60000);v2.setDefaultTimeout(60000);
    const v1Errors=observe(v1),v2Errors=observe(v2),v2Requests=[];v2.on('request',request=>v2Requests.push(new URL(request.url()).pathname));
    // Full V1 materializes its large target catalog. Boot the two independent
    // oracles serially so parsing V1 cannot starve V2's module evaluation.
    await v1.goto(origin+v1Path,{waitUntil:'domcontentloaded'});
    try{await readyV1(v1);}catch(error){const diagnostic=await v1.evaluate(()=>({href:location.href,ready:document.readyState,dg:Boolean(window.DG_APP),mount:Boolean(window.WHArmyBookTargetMount?.catalog),navigation:Boolean(window.DG_APP?.navigation),size:window.DG_APP?.navigation?.byId?.size||0,bookError:document.documentElement.dataset.bookError||null}));throw new Error(`V1 oracle boot failed: ${JSON.stringify({diagnostic,v1Errors,serverFailures},null,2)}; ${error.message}`);}
    await v2.goto(origin+v2Path,{waitUntil:'domcontentloaded'});await readyV2(v2);
    const [v1Style,v2Style]=await Promise.all([styleSnapshot(v1),styleSnapshot(v2)]);assert.deepEqual(v2Style,v1Style,device+' computed V1 navigation style parity');
    const [v1Active,v2Active]=await Promise.all([activeStyle(v1),activeStyle(v2)]);assert.deepEqual(v2Active,v1Active,device+' active/ancestor style parity');
    const algorithms=device==='desktop'?await algorithmContract(v2):null;
    const labels=await accordionContract(v2,phone);const canonical=await canonicalNavigationContract(v2,phone);
    const factCensus=await contentsFactCensus(v2,device);
    await Promise.all([stageRecognizableFullBook(v1,phone),stageRecognizableFullBook(v2,phone)]);
    await Promise.all([v1.screenshot({path:path.join(evidence,device+'-full-v1-reference.png'),animations:'disabled'}),v2.screenshot({path:path.join(evidence,device+'-full-v2-port.png'),animations:'disabled'})]);
    const panelScroll=await independentPanelScrollContract(v2,device);
    if(phone){await Promise.all([v1.keyboard.press('Escape'),v2.keyboard.press('Escape')]);await phoneDrawerContract(v2);}
    const roster=await rosterNavigationContract(v2,v1);
    const v2Connector=await rosterConnectorSnapshot(v2),v1Connector=await rosterConnectorSnapshot(v1,{leaderText:v2Connector.leaderText,bodyText:v2Connector.bodyText});assert.deepEqual(v2Connector,v1Connector,device+' actual V1 roster connector computed-style parity');
    if(phone&&await v2.locator('#navMenu').getAttribute('aria-expanded')!=='true')await v2.locator('#navMenu').click();
    await v2.screenshot({path:path.join(evidence,device+'-v2-roster.png'),animations:'disabled'});
    await noOverflow(v2,device);
    assert.deepEqual(v1Errors,[],device+' V1 oracle browser errors');assert.deepEqual(v2Errors,[],device+' V2 browser errors');
    const forbidden=v2Requests.filter(request=>/\/books\/death-guard\/(?:reader\.html|scripts\/|content\/|sources\/)|\/books\/shared\/(?:controllers\/|target-mount\.js|navigation-targets\.js)/.test(request));assert.deepEqual(forbidden,[],device+' V2 loaded V1 factual/runtime dependencies');
    results.push({device,viewport,status:'PASS',computedStyleParity:true,activeStyleParity:true,rosterConnectorStyleParity:true,independentPanelScroll:panelScroll,factCensus,labels,algorithms,canonical,roster,forbiddenV1Requests:0});
    await Promise.all([v1Context.close(),v2Context.close()]);
  }
  const report={status:'PASS',scope:'Actual V1 NavigationController port parity',results,evidence};fs.writeFileSync(path.join(evidence,'navigation-v1-browser-report.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
}catch(error){
  if(activePage)await activePage.screenshot({path:path.join(evidence,'navigation-v1-browser-failure.png'),animations:'disabled'}).catch(()=>{});
  fs.writeFileSync(path.join(evidence,'navigation-v1-browser-report.json'),JSON.stringify({status:'FAIL',step,message:error.message,stack:error.stack,results},null,2)+'\n');throw error;
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}

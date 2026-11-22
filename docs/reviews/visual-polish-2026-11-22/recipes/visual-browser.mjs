/** Package-only visual/contrast evidence. No game data or source substitutions. */
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {createResponder} from './runtime-server.mjs';
const arg=name=>process.argv.find(value=>value.startsWith(name+'='))?.slice(name.length+1);
if(arg('--summarize')){writeCompact(arg('--summarize'));process.exit(0);}
const root=path.resolve(arg('--root')||'');assert(fs.existsSync(root+'/PAGES_RUNTIME_MANIFEST.json'),'Explicit package root required');
const phase=arg('--phase');assert(['before','after'].includes(phase));
const source='E:/Warhammer/worktrees/visual-polish-v1',evidence='E:/Warhammer/qa-evidence/visual-polish-v1-2026-11-22';
const attempt=arg('--attempt')||'';assert(!attempt||/^[a-z0-9-]+$/.test(attempt));const label=phase+(attempt?'-'+attempt:'');
const out=evidence+'/'+label,temporary='E:/Warhammer/qa-tmp/visual-polish/'+label+'-profiles';
assert(!fs.existsSync(out),'Evidence output must be new');assert(!fs.existsSync(temporary),'Browser profiles must be new');
fs.mkdirSync(out,{recursive:true});fs.mkdirSync(temporary,{recursive:true});fs.mkdirSync(temporary+'/os-temp');
for(const key of ['TMP','TEMP','TMPDIR'])process.env[key]=temporary+'/os-temp';
const {chromium}=createRequire(source+'/package.json')('playwright');
const axe=fs.readFileSync('E:/Warhammer/qa-tmp/visual-polish/contrast-tools/node_modules/axe-core/axe.min.js','utf8');
function sha(buffer){return createHash('sha256').update(buffer).digest('hex');}
const manifest=JSON.parse(fs.readFileSync(root+'/PAGES_RUNTIME_MANIFEST.json','utf8'));
const owner=JSON.parse(fs.readFileSync(source+'/v2/fixtures/new-recruit-plain-header-v37.25.json','utf8')).owner;
const raw=fs.readFileSync(path.join(source,'v2/fixtures',owner.file));assert.equal(sha(raw),owner.sha256);
const payload=JSON.parse(fs.readFileSync(root+'/books/death-guard/v2/generated/app-presentation.json','utf8'));
const cards=new Map(payload.cards.map(card=>[card.id,card]));
const abilityId='datasheet-deathshroud-terminators:section:1',abilityPath='/blocks/0/text';
const ability=cards.get(abilityId).fields.find(field=>field.source?.path===abilityPath);assert(ability);
const prefix='/warhammer-rules-complete-preview/',records=[];
const responder=createResponder(()=>({root,label:manifest.contentSha256}),{prefix,records});
const server=responder.http();await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
assert(![8765,8443].includes(server.address().port));
const origin=`http://127.0.0.1:${server.address().port}`,entry=origin+prefix+'v2/app.html';
const report={schema:'visual-polish-gallery/v1',status:'RUNNING',phase,root,package:manifest.contentSha256,
  axeVersion:null,fixture:{file:owner.file,sha256:owner.sha256},cases:[],errors:[],privacy:'No raw roster or storage value is written to this evidence.'};
const save=()=>fs.writeFileSync(out+'/RESULTS.json',JSON.stringify(report,null,2)+'\n');save();
let context,page,current;
async function ready(){await page.waitForFunction(()=>!!window.WarhammerAppV2&&!document.querySelector('[data-v2-loading]'));await page.evaluate(()=>WarhammerAppV2.ready);}
async function native(){await page.waitForFunction(()=>window.ArmyBookAppV2?.payload?.book?.id==='death-guard');await page.evaluate(async()=>{await ArmyBookAppV2.rosterPanel?.ready;await document.fonts.ready;});}
async function settle(){await page.evaluate(async()=>{await document.fonts.ready;await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));});}
async function screenshot(name){await settle();const file=current.width+'-'+name+'.jpg';await page.screenshot({path:out+'/'+file,type:'jpeg',quality:82,fullPage:false});return file;}
async function contrast(target=page){
 await target.addScriptTag({content:axe});
 return target.evaluate(async()=>{const r=await axe.run(document,{runOnly:{type:'rule',values:['color-contrast']},resultTypes:['violations','incomplete','passes','inapplicable']});return {version:r.testEngine.version,violations:r.violations,incomplete:r.incomplete,passes:r.passes.map(row=>({id:row.id,nodes:row.nodes.length})),inapplicable:r.inapplicable.map(row=>row.id)};});
}
async function pixelContrast(name,target=page,{offsetX=0,offsetY=0}={}){
 const collected=await target.evaluate(()=>{
  const scope=document.querySelector('dialog[open]')||document.body,runs=[],disabled=[];
  const colorCanvas=document.createElement('canvas');colorCanvas.width=colorCanvas.height=1;const colorContext=colorCanvas.getContext('2d',{willReadFrequently:true}),colors=new Map();
  const rgba=color=>{if(colors.has(color))return colors.get(color);colorContext.clearRect(0,0,1,1);colorContext.fillStyle=color;colorContext.fillRect(0,0,1,1);const value=Array.from(colorContext.getImageData(0,0,1,1).data);colors.set(color,value);return value;};
  const selector=node=>{const parts=[];for(let i=0;node&&i<4;i++,node=node.parentElement){let part=node.tagName.toLowerCase();if(node.id){parts.unshift('#'+CSS.escape(node.id));break;}const key=node.dataset.factId?'data-fact-id':node.dataset.rosterAction?'data-roster-action':node.dataset.targetId?'data-target-id':null;if(key){part+='['+key+'='+JSON.stringify(node.getAttribute(key))+']';parts.unshift(part);break;}const classes=Array.from(node.classList).slice(0,2);if(classes.length)part+='.'+classes.map(value=>CSS.escape(value)).join('.');parts.unshift(part);}return parts.join(' > ');};
  function add(node,text,rectangles,colorOverride=null){
   if(!text.trim()||node.closest('script,style,noscript,[hidden]'))return;
   for(let closed=node.closest('details:not([open])');closed;closed=closed.parentElement?.closest('details:not([open])'))if(!closed.querySelector(':scope > summary')?.contains(node))return;
   let opacity=1;for(let ancestor=node;ancestor;ancestor=ancestor.parentElement){const computed=getComputedStyle(ancestor);if(computed.visibility==='hidden'||computed.display==='none')return;opacity*=Number(computed.opacity);}
   if(opacity===0)return;
   if(node.closest(':disabled,[aria-disabled="true"]')){disabled.push(selector(node));return;}
   const style=getComputedStyle(node),fontSize=parseFloat(style.fontSize),weight=parseInt(style.fontWeight)||400;
   const control=!!node.closest('button,a,input,select,textarea,[role="button"],[role="link"]');
   const rects=rectangles.map(rect=>({left:Math.max(0,rect.left),top:Math.max(0,rect.top),right:Math.min(innerWidth,rect.right),bottom:Math.min(innerHeight,rect.bottom)})).filter(rect=>rect.right-rect.left>1&&rect.bottom-rect.top>1);
   if(!rects.length)return;
   const color=[...rgba(colorOverride||style.color)];color[3]=color[3]/255*opacity;
   const ownerPath=[];for(let current=node;current&&current!==document.documentElement;current=current.parentElement)ownerPath.unshift(Array.from(current.parentElement.children).indexOf(current));
   runs.push({text:text.trim().slice(0,180),selector:selector(node),ownerPath,ownerTag:node.tagName,rects,color,fontSize,fontWeight:weight,control,controlLevel:node.closest('[data-control-level]')?.dataset.controlLevel||null,wcagMinimum:!control&&(fontSize>=24||(weight>=700&&fontSize>=18.66))?3:4.5,requestedMinimum:4.5});
  }
  const walker=document.createTreeWalker(scope,NodeFilter.SHOW_TEXT);
  for(let text; text=walker.nextNode();){const owner=text.parentElement;if(!owner||!text.textContent.trim())continue;const box=owner.getBoundingClientRect();if(box.bottom<0||box.top>innerHeight||box.right<0||box.left>innerWidth||!box.width||!box.height)continue;const range=document.createRange();range.selectNodeContents(text);add(owner,text.textContent,Array.from(range.getClientRects()));}
  for(const input of scope.querySelectorAll('input:not([type="hidden"]),textarea,select')){
   const box=input.getBoundingClientRect();let text=input.tagName==='SELECT'?Array.from(input.selectedOptions).map(option=>option.textContent).join(' '):input.value||input.placeholder||'';
   // The exported roster itself is never captured as contrast evidence.
   if(input.matches('[data-roster-input="raw-text"]')&&input.value)text='[export text omitted]';
   const color=!input.value&&input.placeholder?getComputedStyle(input,'::placeholder').color:null;
   add(input,text,[box],color);
  }
  return {runs,excludedDisabled:disabled.length,viewport:{width:innerWidth,height:innerHeight}};
 });
 const original=await page.screenshot({type:'png',animations:'disabled'});let background,style;
 try{style=await target.addStyleTag({content:'*{-webkit-text-fill-color:transparent!important;text-shadow:none!important;text-decoration-color:transparent!important}'});background=await page.screenshot({type:'png',animations:'disabled'});}
 finally{await style?.evaluate(node=>node.remove());}
 const parentViewport=await page.evaluate(()=>({width:innerWidth,height:innerHeight}));
 const measured=await target.evaluate(async({original,background,collected,offsetX,offsetY,parentViewport})=>{
  async function image(data){const item=new Image();item.src='data:image/png;base64,'+data;await item.decode();const canvas=document.createElement('canvas');canvas.width=item.naturalWidth;canvas.height=item.naturalHeight;const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(item,0,0);return {width:canvas.width,height:canvas.height,pixels:ctx.getImageData(0,0,canvas.width,canvas.height).data};}
  const [a,b]=await Promise.all([image(original),image(background)]),scaleX=a.width/parentViewport.width,scaleY=a.height/parentViewport.height;
  const lum=channels=>channels.map(value=>value/255).map(value=>value<=.04045?value/12.92:Math.pow((value+.055)/1.055,2.4)).reduce((sum,value,index)=>sum+value*[.2126,.7152,.0722][index],0);
  const rows=[];
  for(const run of collected.runs){let minimum=Infinity,witness=null,glyphPixels=0,occludedPixels=0;const owner=run.ownerPath.reduce((node,index)=>node?.children[index],document.documentElement);if(!owner||owner.tagName!==run.ownerTag){rows.push({...run,glyphPixels:0,minimumContrast:null,unmeasuredReason:'Owner DOM changed during measurement',wcagPass:null,requestedPass:null});continue;}
   for(const rect of run.rects){const left=Math.max(0,Math.floor((rect.left+offsetX)*scaleX)),right=Math.min(a.width,Math.ceil((rect.right+offsetX)*scaleX)),top=Math.max(0,Math.floor((rect.top+offsetY)*scaleY)),bottom=Math.min(a.height,Math.ceil((rect.bottom+offsetY)*scaleY));
    for(let y=top;y<bottom;y++)for(let x=left;x<right;x++){
     const at=(y*a.width+x)*4;if(Math.max(Math.abs(a.pixels[at]-b.pixels[at]),Math.abs(a.pixels[at+1]-b.pixels[at+1]),Math.abs(a.pixels[at+2]-b.pixels[at+2]))<=10)continue;
     const hit=document.elementFromPoint((x+.5)/scaleX-offsetX,(y+.5)/scaleY-offsetY);if(!hit||!(owner===hit||owner.contains(hit)||hit.contains(owner))){occludedPixels++;continue;}
     glyphPixels++;const bg=[b.pixels[at],b.pixels[at+1],b.pixels[at+2]],fg=run.color.slice(0,3).map((value,index)=>value*run.color[3]+bg[index]*(1-run.color[3]));
     const l1=lum(fg),l2=lum(bg),ratio=(Math.max(l1,l2)+.05)/(Math.min(l1,l2)+.05);
     if(ratio<minimum){minimum=ratio;witness={x:x/scaleX,y:y/scaleY,foreground:fg,background:bg};}
    }
   }
   const {rects,ownerPath,ownerTag,...data}=run;rows.push({...data,glyphPixels,occludedPixels,...(!glyphPixels?{unmeasuredReason:occludedPixels?'All differing glyph pixels are occluded by another element':'No differing glyph pixels (clipped, non-text paint, or native control)'}:{}),minimumContrast:Number.isFinite(minimum)?minimum:null,witness,wcagPass:Number.isFinite(minimum)?minimum>=run.wcagMinimum:null,requestedPass:Number.isFinite(minimum)?minimum>=run.requestedMinimum:null});
  }
  return {rows,checkedRuns:rows.filter(row=>row.glyphPixels>0).length,unmeasuredRuns:rows.filter(row=>!row.glyphPixels),wcagViolations:rows.filter(row=>row.wcagPass===false),belowRequested45:rows.filter(row=>row.requestedPass===false),excludedDisabled:collected.excludedDisabled,viewport:collected.viewport};
 },{original:original.toString('base64'),background:background.toString('base64'),collected,offsetX,offsetY,parentViewport});
 measured.method='Rendered glyph-background differential: PNG before/after temporary transparent webkit-text-fill; same layout/currentColor backgrounds. Delta >10 identifies glyph pixels. Nominal computed foreground RGBA times ancestor opacity is contrasted against each actual background pixel. Per-glyph elementFromPoint ownership rejects occluded text behind sticky headers/overlays. No application data changes; transparent style removed in finally.';
 measured.originalPngSha256=sha(original);measured.backgroundPngSha256=sha(background);
 if(measured.belowRequested45.length){fs.writeFileSync(out+'/'+current.width+'-'+name+'-contrast-original.png',original);fs.writeFileSync(out+'/'+current.width+'-'+name+'-contrast-background.png',background);}
 return measured;
}
function writeCompact(file){
 const report=JSON.parse(fs.readFileSync(file,'utf8'));
 const axeBrief=audit=>{
  if(!audit)return null;const groups=new Map();
  for(const row of audit.incomplete||[])for(const node of row.nodes||[])for(const check of [...node.any||[],...node.all||[],...node.none||[]]){
   const key=check.data?.messageKey||check.id;let group=groups.get(key);if(!group){group={reason:key,message:check.message,nodes:0,examples:[]};groups.set(key,group);}group.nodes++;if(group.examples.length<4)group.examples.push(node.target);
  }
  return {version:audit.version,notRun:audit.notRun||null,violationNodes:(audit.violations||[]).reduce((n,row)=>n+row.nodes.length,0),violations:(audit.violations||[]).map(row=>({id:row.id,impact:row.impact,nodes:row.nodes.map(node=>({target:node.target,checks:[...node.any||[],...node.all||[],...node.none||[]].map(check=>({id:check.id,data:check.data,message:check.message}))}))})),incompleteNodes:(audit.incomplete||[]).reduce((n,row)=>n+row.nodes.length,0),incompleteReasons:[...groups.values()],passingNodes:(audit.passes||[]).reduce((n,row)=>n+row.nodes,0)};
 };
 const pixelsBrief=value=>value?{method:value.method,checkedRuns:value.checkedRuns,minimumContrast:Math.min(...value.rows.filter(row=>row.minimumContrast!==null).map(row=>row.minimumContrast)),minimumControlContrast:Math.min(...value.rows.filter(row=>row.minimumContrast!==null&&row.control).map(row=>row.minimumContrast)),wcagViolations:value.wcagViolations,belowRequested45:value.belowRequested45,excludedDisabled:value.excludedDisabled,unmeasured:value.unmeasuredRuns.map(row=>({text:row.text,selector:row.selector,reason:row.unmeasuredReason||'No differing glyph pixels; original baseline observer did not distinguish occlusion',occludedPixels:row.occludedPixels||0})),originalPngSha256:value.originalPngSha256,backgroundPngSha256:value.backgroundPngSha256}:null;
 const compact={schema:'visual-polish-compact/v1',sourceFile:path.basename(file),sourceSha256:sha(fs.readFileSync(file)),status:report.status,phase:report.phase,package:report.package,axeVersion:report.axeVersion,errors:report.errors,cases:report.cases.map(item=>({width:item.width,status:item.status,pageErrors:item.pageErrors,screens:item.screens.map(screen=>({name:screen.name,screenshot:screen.screenshot,semanticSha256:screen.semanticSha256,detail:screen.detail,metrics:{card:screen.metrics.card,dialog:screen.metrics.dialog,close:screen.metrics.close,horizontalOverflow:screen.metrics.horizontalOverflow,identities:screen.metrics.identities.slice(0,3),visiblePrimary:screen.metrics.controls.filter(control=>control.level==='primary').map(control=>({text:control.text,rect:control.rect})),controlLevels:screen.metrics.controls.reduce((result,row)=>(result[row.level||'unspecified']=(result[row.level||'unspecified']||0)+1,result),{})},focusProbe:screen.focusProbe||null,axe:axeBrief(screen.contrast),coreAxe:axeBrief(screen.coreContrast),pixels:pixelsBrief(screen.pixelContrast),corePixels:pixelsBrief(screen.corePixelContrast)}))}))};
 const pixelSets=compact.cases.flatMap(row=>row.screens.flatMap(screen=>[screen.pixels,screen.corePixels].filter(Boolean)));const allAxe=compact.cases.flatMap(row=>row.screens.flatMap(screen=>[screen.axe,screen.coreAxe].filter(Boolean)));compact.contrastSummary={axeViolationNodes:allAxe.reduce((n,row)=>n+row.violationNodes,0),axeIncompleteNodes:allAxe.reduce((n,row)=>n+row.incompleteNodes,0),measuredViewportTextRuns:pixelSets.reduce((n,row)=>n+row.checkedRuns,0),minimumRenderedContrast:Math.min(...pixelSets.map(row=>row.minimumContrast)),minimumRenderedControlContrast:Math.min(...pixelSets.map(row=>row.minimumControlContrast)),wcagViolations:pixelSets.reduce((n,row)=>n+row.wcagViolations.length,0),belowRequested45:pixelSets.reduce((n,row)=>n+row.belowRequested45.length,0),unmeasuredRuns:pixelSets.reduce((n,row)=>n+row.unmeasured.length,0)};
 const destination=path.join(path.dirname(file),'COMPACT_SUMMARY.json');fs.writeFileSync(destination,JSON.stringify(compact,null,2)+'\n');console.log(JSON.stringify({compact:destination,bytes:fs.statSync(destination).size}));
}
async function capture(name,{coreFrame=null,detail=null}={}){
 console.log(phase+' '+current.width+' '+name);await settle();
 const file=await screenshot(name);const skipAxe=process.argv.includes('--skip-axe');const audit=skipAxe?{version:null,violations:[],incomplete:[],passes:[],inapplicable:[],notRun:'Rendered-pixel supplement only; retain prior before-complete/RESULTS.json full axe audit'}:await contrast();report.axeVersion=audit.version;
 const metrics=await page.evaluate(()=>{
  const rect=node=>{if(!node)return null;const r=node.getBoundingClientRect();return {top:r.top,bottom:r.bottom,left:r.left,right:r.right,width:r.width,height:r.height};};
  const visible=node=>!!node.getClientRects().length&&getComputedStyle(node).visibility!=='hidden'&&!node.closest('[hidden]');
  const dialog=document.querySelector('dialog[open]'),main=document.querySelector('main'),scope=dialog||main||document.body;
  const fields=[...scope.querySelectorAll('[data-fact-id]')].map(node=>({id:node.dataset.factId,value:node.dataset.factValue??null,text:node.textContent,entity:node.dataset.entityId??null}));
  const paintLayers=node=>{const result=[];for(let current=node;current&&result.length<16;current=current.parentElement){const s=getComputedStyle(current);result.push({tag:current.tagName,className:current.className,color:s.color,backgroundColor:s.backgroundColor,backgroundImage:s.backgroundImage,opacity:s.opacity});}return result;};
  const controls=[...scope.querySelectorAll('button,a,summary')].filter(visible).map(node=>{const style=getComputedStyle(node);return {tag:node.tagName,text:node.getAttribute('aria-label')||node.innerText,className:node.className,level:node.dataset.controlLevel||node.dataset.buttonLevel||null,rect:rect(node),color:style.color,background:style.backgroundColor,borderColor:style.borderColor,borderWidth:style.borderWidth,font:style.font,paintLayers:paintLayers(node)};});
  const card=document.querySelector('main .unit-card[data-roster-instance-id]'),head=card?.querySelector(':scope > .unit-header'),context=card?.querySelector('.ds-roster-context');
  const identities=[...document.querySelectorAll('.v2-roster-identity')].map(node=>{const style=getComputedStyle(node),body=node.nextElementSibling;return {rect:rect(node),marginTop:style.marginTop,marginBottom:style.marginBottom,padding:style.padding,body:body?.classList.contains('v2-roster-body')?{rect:rect(body),children:body.children.length,text:body.textContent.trim().length}:null};});
  const close=dialog?.querySelector('button[aria-label*="Close"]');
  return {fields,controls,card:{rect:rect(card),header:rect(head),context:rect(context),contextVisible:!!context&&visible(context),stats:rect(card?.querySelector('.statline'))},identities,dialog:rect(dialog),close:rect(close),viewport:{width:innerWidth,height:innerHeight},horizontalOverflow:document.documentElement.scrollWidth>innerWidth+1};
 });
 const semanticSha256=sha(Buffer.from(JSON.stringify(metrics.fields)));delete metrics.fields;
 let frameAudit=null;if(coreFrame&&!skipAxe)frameAudit=await contrast(coreFrame);
 const pixelAudit=await pixelContrast(name);
 let corePixels=null;if(coreFrame){const box=await page.locator('iframe.v2-core-reader').boundingBox();corePixels=await pixelContrast(name+'-frame',coreFrame,{offsetX:box.x,offsetY:box.y});}
 const row={name,status:'PASS',screenshot:file,detail,semanticSha256,metrics,contrast:audit,pixelContrast:pixelAudit,...(frameAudit?{coreContrast:frameAudit}:{}),...(corePixels?{corePixelContrast:corePixels}:{})};
 if(detail&&detail.canonicalId){const actual=await page.locator('dialog[open]').getAttribute('data-canonical-id');assert.equal(actual,detail.canonicalId);}
 if(phase==='after'&&detail?.canonicalId){const close=page.locator('dialog[open]').getByRole('button',{name:'Close rule reference',exact:true});await close.focus();await page.keyboard.press('Tab');await page.keyboard.press('Shift+Tab');row.focusProbe=await close.evaluate(node=>{const s=getComputedStyle(node),r=node.getBoundingClientRect();return {keyboardFocusVisible:node===document.activeElement&&node.matches(':focus-visible'),outlineStyle:s.outlineStyle,outlineWidth:parseFloat(s.outlineWidth),outlineColor:s.outlineColor,width:r.width,height:r.height};});assert(row.focusProbe.keyboardFocusVisible&&row.focusProbe.outlineWidth>=2&&row.focusProbe.outlineStyle!=='none','Keyboard focus remains visible');assert(row.focusProbe.width>=44&&row.focusProbe.height>=44,'Close hit area >=44px');}

 current.screens.push(row);save();return row;
}
async function roster(){await page.evaluate(()=>ArmyBookAppV2.openRoster());await page.locator('[data-roster-view]').waitFor();await settle();}
async function openEffective(id){await roster();await page.locator(`.v2-roster-instance[data-roster-instance-id="${id}"] [data-roster-action="show-instance"]`).click();const card=page.locator(`main .unit-card[data-roster-instance-id="${id}"]`);await card.waitFor();await settle();return card;}
async function close(){await page.locator('dialog[open]').getByRole('button',{name:'Close rule reference',exact:true}).click();}
async function glossaryPopup(id,query,field=null){
 await page.evaluate(()=>ArmyBookAppV2.openGlossary());await page.getByRole('searchbox',{name:'Search glossary',exact:true}).fill(query);
 const links=page.locator(`.v2-glossary-result[data-target-id="${id}"]`);await links.first().waitFor();
 let chosen=links.first();if(field){const index=await links.evaluateAll((nodes,field)=>nodes.findIndex(node=>new URL(node.href).searchParams.get('field')===field),field);assert(index>=0,'Exact canonical field link');chosen=links.nth(index);}
 await chosen.click();await page.locator('dialog[open]').waitFor();await settle();
}
try{
 for(const width of [390,1440]){
  current={width,status:'RUNNING',screens:[],pageErrors:[]};report.cases.push(current);
  context=await chromium.launchPersistentContext(temporary+'/'+width,{executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,viewport:{width,height:width===390?844:1000},isMobile:width===390,hasTouch:width===390,serviceWorkers:'allow'});
  page=context.pages()[0]||await context.newPage();page.setDefaultTimeout(30000);page.on('pageerror',error=>current.pageErrors.push(error.message));
  await page.goto(entry+'?v2=ARMY_BOOK&book=death-guard',{waitUntil:'domcontentloaded'});await ready();await native();
  await capture('book-library');
  await roster();const rawInput=page.locator('[data-roster-input="raw-text"]');if(!await rawInput.isVisible())await page.locator('details[data-roster-import] > summary').click();await rawInput.waitFor();await capture('import-empty');
  await rawInput.fill(raw.toString('utf8'));await page.locator('[data-roster-action="review-import"]').click();
  await page.waitForFunction(()=>document.querySelector('.v2-roster-status')?.textContent==='Roster imported.'&&ArmyBookAppV2.roster.state.units.length===8);
  await page.locator('[data-roster-detachments]').scrollIntoViewIfNeeded();await capture('attachment-setup');
  const unit=page.locator('.v2-roster-instance').first();await unit.scrollIntoViewIfNeeded();await capture('attachment-models-points');
  const units=await page.evaluate(()=>ArmyBookAppV2.roster.state.units.map(unit=>({instanceId:unit.instanceId,id:unit.canonicalUnitId})));
  const deathshroud=units.find(unit=>unit.id==='unit-deathshroud-terminators');assert(deathshroud);const card=await openEffective(deathshroud.instanceId);await capture('roster-card',{detail:{instanceId:deathshroud.instanceId}});
  const weapon=card.locator('.weapon-name .weapon-button').first();await weapon.scrollIntoViewIfNeeded();const weaponId=await weapon.getAttribute('data-target-id');assert(weaponId&&cards.get(weaponId)?.kind==='WEAPON_PROFILE');await weapon.click();await page.locator('dialog[open]').waitFor();await capture('weapon-popup',{detail:{canonicalId:weaponId}});await close();
  await glossaryPopup(abilityId,'Silent Bodyguard',abilityPath);
  const dialog=page.locator('dialog[open]');assert.equal(await dialog.locator('[data-rule-field-path]').getAttribute('data-rule-field-path'),abilityPath);assert((await dialog.innerText()).includes(ability.value.slice(ability.value.indexOf(':')+1).trim()));
  await capture('ability-popup',{detail:{canonicalId:abilityId,fieldPath:abilityPath}});await close();
  await glossaryPopup('core-feel-no-pain','Feel No Pain');assert(await page.locator('dialog[open] nav[aria-label="Related references"] a').count()>0);await capture('core-related-popup',{detail:{canonicalId:'core-feel-no-pain'}});await close();
  await page.getByRole('link',{name:'Mega Glossary',exact:true}).click();await ready();await page.getByRole('searchbox',{name:'Search glossary',exact:true}).fill('Blast');await page.locator('.v2-glossary-result').first().waitFor();await capture('global-glossary');
  await page.getByRole('link',{name:'Core Rules',exact:true}).click();await ready();const iframe=page.locator('iframe.v2-core-reader');await iframe.waitFor();const iframeHandle=await iframe.elementHandle();const frame=await iframeHandle.contentFrame();await frame.locator('.sidebar').waitFor({state:'attached'});await capture('core-reader',{coreFrame:frame});
  assert.deepEqual(current.pageErrors,[]);current.status='PASS';await context.close();context=null;save();
 }
 report.status='PASS';
}catch(error){report.status='FAIL';report.error=error.stack;report.errors.push(error.message);process.exitCode=1;console.error(error.stack);await page?.screenshot({path:out+'/FAILURE.jpg',type:'jpeg',quality:82}).catch(()=>{});}
finally{
 await context?.close();responder.close();server.closeAllConnections?.();await new Promise(resolve=>server.close(resolve));
 report.summary={screens:report.cases.reduce((n,row)=>n+row.screens.length,0),contrastViolations:report.cases.flatMap(row=>row.screens.flatMap(screen=>screen.contrast.violations)),contrastIncomplete:report.cases.reduce((n,row)=>n+row.screens.reduce((sum,screen)=>sum+screen.contrast.incomplete.length,0),0)};
 save();writeCompact(out+'/RESULTS.json');console.log(JSON.stringify({status:report.status,out,screens:report.summary.screens,contrastViolations:report.summary.contrastViolations.length}));
}

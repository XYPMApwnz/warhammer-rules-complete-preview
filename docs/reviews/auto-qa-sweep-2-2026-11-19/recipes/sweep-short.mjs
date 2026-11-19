/** Standalone, sequential read-only supplement. External files only.
 * This reuses the first sweep's public native import/attachment method.
 * Raw import receives exact enrolled text and EMPTY binding choices; a fixture
 * whose positive result needs explicit bindings is never presumed READY. */
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import {pathToFileURL,fileURLToPath} from 'node:url';
import {inspectFlowLinksAndShortDuplicates} from './sweep-popups.mjs';
import {compareRosterCard} from './roster-data-comparison-scoped.mjs';
const root='E:/Warhammer/worktrees/import-messages-v1',out='E:/Warhammer/qa-evidence/auto-qa-sweep-2-2026-11-19',temporary='E:/Warhammer/qa-tmp/auto-qa-sweep-2',base='http://localhost:8765/v2/app.html',sha='4060074ae0c7888571367f99f7cb9cc375c167ba';
const books=['death-guard','adeptus-mechanicus','tyranids','tau-empire','emperors-children','chaos-space-marines','space-marines','blood-angels','dark-angels'];
const terms=['Blast','Deep Strike','Leader','Battle-shock','Stealth','Lone Operative','Feel No Pain','Devastating Wounds','Lethal Hits','Sustained Hits','Precision','Scouts','Infiltrators','Fights First','Hazardous','Torrent','Melta','Twin-linked','Ignores Cover','Indirect Fire'];
const routeKinds=new Set(['DATASHEET','DETACHMENT','DETACHMENT_RULE','ENHANCEMENT','STRATAGEM','ARMY_RULE','ARMY_RULE_COMPONENT','BOOK_USAGE_RULES','SOURCE_ERRATUM','ABILITY','DATASHEET_ABILITY','WARGEAR_ABILITY','SUPPLEMENTAL_DATASHEET_RULE','EQUIPMENT_RULE','NAMED_RULE_COMPONENT','DATASHEET_SECTION','RULE_REFERENCE']);
const arg=name=>process.argv.find(value=>value.startsWith(name+'='))?.slice(name.length+1),widths=(arg('--widths')||'390,1440').split(',').map(Number),selected=books.filter(book=>!arg('--book')||book===arg('--book'));
assert(selected.length&&widths.every(width=>[390,1440].includes(width)));
const inputFile=path.join(out,'inventory/ALL_INPUTS.json'),inventory=JSON.parse(fs.readFileSync(inputFile,'utf8')),inputs=inventory.inputs;assert.equal(inputs.length,990,'Use the reviewed complete exact-input union');
const expectations=JSON.parse(fs.readFileSync(path.join(out,'inventory/BINDING_EXPECTATIONS.json'),'utf8')).byInputId||{};
fs.mkdirSync(temporary,{recursive:true});
const append=(name,row)=>fs.appendFileSync(path.join(out,name),JSON.stringify(row)+'\n');
const readRows=name=>fs.existsSync(path.join(out,name))?fs.readFileSync(path.join(out,name),'utf8').split('\n').filter(Boolean).map(JSON.parse):[];
const completed=new Set(readRows('short-screens.jsonl').filter(row=>row.status==='COMPLETE').map(row=>row.key));
const inputDone=new Set(readRows('short-inputs.jsonl').filter(row=>row.status==='COMPLETE').map(row=>row.key));
const summary={schema:'auto-qa-sweep-2-short-paragraph-supplement/v1',sha,status:'PREPARED',started:null,widths,books:selected,inputUnionCount:inputs.length,routeKinds:[...routeKinds],method:'Fresh per-width context, service workers allowed; exact current native import(text,{}, {replaceExisting:true}); every physical unit on actual READY; native first eligible attachment then detach; no invented state or inferred bindings.',screenAttempts:0,screenErrors:0,inputAttempts:0,inputErrors:0,ready:0,notReady:0,attachments:0,paragraphDuplicateGroups:0,inWordLinks:0,markerCandidateLines:0,rosterDataChecks:0,rosterDataMismatches:0,rosterDataCoverageGaps:0,resumedScreens:completed.size,resumedInputs:inputDone.size};
const save=(extra={})=>fs.writeFileSync(path.join(out,'SHORT_PROGRESS.json'),JSON.stringify({...summary,...extra,at:new Date().toISOString()},null,2)+'\n');
const progress=row=>{append('short-progress.jsonl',{...row,at:new Date().toISOString()});save(row);};
const keyOf=(...parts)=>JSON.stringify(parts);
const stopFile=path.join(temporary,'STOP-SHORT');
function stopIfRequested(){if(fs.existsSync(stopFile))throw Object.assign(Error('Short supplement stopped at an owner-requested checkpoint'),{ownerStop:true});}

/** Original <65-character paragraph scope, with richer provenance for review.
 * Do not silently excuse repeated FAQ/weapon text: retain exact ownership. */
export function inspectShortParagraphsAndMarkers({importScope=false}={}){
 const scope=document.querySelector('dialog[open]')||document.querySelector('main.main,main.v2-main,main.global-glossary-main,main')||document.body;
 const visible=node=>{if(!node?.getClientRects().length)return false;for(let current=node;current;current=current.parentElement){const style=getComputedStyle(current);if(current.hidden||style.display==='none'||style.visibility==='hidden'||style.opacity==='0')return false;}return!node.closest('script,style,template,textarea,[aria-hidden="true"],.v2-sr-only,.sr-only');};
 const clean=node=>String(node?.innerText??node?.textContent??'').replace(/\s+/g,' ').trim();
 const domPath=node=>{const parts=[];for(let current=node;current&&current!==scope;current=current.parentElement){let ordinal=1;for(let previous=current.previousElementSibling;previous;previous=previous.previousElementSibling)if(previous.tagName===current.tagName)ordinal++;parts.unshift(current.tagName.toLowerCase()+':nth-of-type('+ordinal+')');}return parts.join(' > ');};
 const describe=node=>{
  const card=node.closest('[data-card-id],[data-roster-instance-id]'),weapon=node.closest('.weapon-row,.weapon-table,.weapon-group,[data-gained-weapon-summary]'),faq=node.closest('[data-faq-id],[data-core-faq-id],[id*="faq"],[data-rule-id*="faq"],[data-card-id*="faq"],.faq,.faq-item,.core-faq'),owner=node.closest('[data-rule-id],[data-source-rule-id],[data-attached-rule-id],[data-detachment-rule-id],[data-executable-detachment-rule-id],[data-fact-id]');
  const chain=[];for(let current=node;current&&current!==scope&&chain.length<12;current=current.parentElement){const data={};for(const[key,value]of Object.entries(current.dataset)){data[key]=value.length>1200?value.slice(0,1200)+' [TRUNCATED]':value;}chain.push({tag:current.tagName,className:typeof current.className==='string'?current.className:'',id:current.id||null,dataset:data,headings:[...current.querySelectorAll(':scope > h2,:scope > h3,:scope > h4,:scope > h5,:scope > summary')].map(clean).slice(0,8)});}
  const question=faq?.querySelector('.faq-question,[data-faq-question],h3,h4,h5,summary,strong,b');
  return{domPath:domPath(node),cardId:card?.dataset.cardId??null,instanceId:node.closest('[data-roster-instance-id]')?.dataset.rosterInstanceId??null,ownerId:owner?.dataset.ruleId||owner?.dataset.sourceRuleId||owner?.dataset.attachedRuleId||owner?.dataset.detachmentRuleId||owner?.dataset.executableDetachmentRuleId||owner?.dataset.factId||null,sourceInstanceId:node.closest('[data-source-instance-id]')?.dataset.sourceInstanceId??null,weaponGroup:weapon?{domPath:domPath(weapon),id:weapon.dataset.cardId||weapon.dataset.weaponId||null,label:weapon.getAttribute('aria-label')||clean(weapon.querySelector(':scope > h3,:scope > h4,:scope > h5,caption')),occurrences:weapon.dataset.weaponOccurrences?JSON.parse(weapon.dataset.weaponOccurrences):null}:null,faq:faq?{id:faq.dataset.faqId||faq.dataset.coreFaqId||faq.dataset.ruleId||faq.dataset.cardId||faq.id||null,question:clean(question)||clean(faq).slice(0,350)}:null,chain};
 };
 const cardSelector='article.unit-card,article.v2-book-record,article.v2-roster-instance,article.rule-reference,article.v1-reference-article',cards=[...scope.querySelectorAll(cardSelector)].filter(visible);if(!cards.length)cards.push(scope);
 const duplicates=[];let shortParagraphs=0;
 for(const card of cards){const seen=new Map();for(const paragraph of card.querySelectorAll('p')){if(!visible(paragraph)||card!==scope&&paragraph.closest(cardSelector)!==card)continue;const text=clean(paragraph);if(!text||text.length>=65)continue;shortParagraphs++;const matches=seen.get(text)||[];matches.push(describe(paragraph));seen.set(text,matches);}for(const[text,owners]of seen)if(owners.length>1)duplicates.push({cardId:card.dataset.cardId||null,instanceId:card.dataset.rosterInstanceId||null,text,count:owners.length,owners});}
 const markers=/\b(?:UNVERIFIED|NOT_IMPLEMENTED|SOURCE_CONFLICT|EXECUTABLE_MISSING|REVIEW_REQUIRED|TEXT_ONLY|CONDITIONAL_POLICY|NO_MATCH|NOT_PROVEN|REFERENCE_ONLY|BATTLE_ONLY|KEEP_HIDDEN|NEEDS_BINDINGS|ROSTER_EXECUTABLE|UNRESOLVED|UNKNOWN|undefined|null|NaN)\b|\[object Object\]|\b(?:parsed-unit|unit|detachment|datasheet|refs|bindings|ability|army-rule|core)-[a-z0-9][a-z0-9:_.\/-]{6,}/g;
 const markerCandidates=[],walker=document.createTreeWalker(scope,NodeFilter.SHOW_TEXT);let node;
 while((node=walker.nextNode()))if(node.textContent.trim()&&visible(node.parentElement)&&!node.parentElement.closest('textarea,input,option')){markers.lastIndex=0;const matches=[...node.textContent.matchAll(markers)];for(const match of matches)markerCandidates.push({kind:'GLOBAL_MARKER_CANDIDATE',token:match[0],text:node.textContent.trim(),...describe(node.parentElement)});}
 // Exact list and flags from import-copy-assertions.mjs are D-only. Keep each
 // pattern's original flags and retain matched text/case, so an earlier broad
 // case-insensitive scanner's "Unknown imported unit" candidate is classifiable.
 const importPatterns=[/\b(?:NOT_PROVEN|REFERENCE_ONLY|UNKNOWN|BATTLE_ONLY|KEEP_HIDDEN)\b/,/\b(?:canonical|physical|bindings?|MFM)\b/i,/\bsource entr(?:y|ies)\b/i,/\b(?:parsed-unit|unit|datasheet|detachment|refs|bindings)-[a-z0-9][a-z0-9:_.\/-]*/i],importCopyCandidates=[];
 const importRoot=importScope?(scope.matches?.('[data-roster-view]')?scope:scope.querySelector('[data-roster-view]')):null;
 const inspectImport=(text,location,element)=>{for(const pattern of importPatterns){const match=text.match(pattern);if(match)importCopyCandidates.push({kind:'IMPORT_COPY_CANDIDATE',token:match[0],text,location,...describe(element)});}};
 if(importRoot){const walker=document.createTreeWalker(importRoot,NodeFilter.SHOW_TEXT);let item;while((item=walker.nextNode()))if(item.textContent.trim()&&visible(item.parentElement)&&!item.parentElement.closest('textarea,input,select,option'))inspectImport(item.textContent.trim(),'visible text',item.parentElement);for(const control of importRoot.querySelectorAll('[aria-label],[placeholder],[title]'))if(visible(control))for(const name of ['aria-label','placeholder','title'])if(control.hasAttribute(name))inspectImport(control.getAttribute(name),control.tagName.toLowerCase()+' '+name,control);for(const select of importRoot.querySelectorAll('select'))if(visible(select))for(const option of select.options)inspectImport(option.textContent,'native select option',select);}
 return{shortParagraphs,duplicates,markerCandidates,importCopyCandidates};
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const {launchChromium}=await import(pathToFileURL(root+'/tests/helpers/browser-launch.mjs'));
 let browser,current={};
 try{
  const response=await fetch('http://localhost:8765/');assert.equal(response.status,200);assert.equal(response.headers.get('x-preview-package'),sha,'Do not audit a different preview package');
  summary.status='RUNNING';summary.started=new Date().toISOString();save();browser=await launchChromium();
  for(const width of widths){
   const context=await browser.newContext({viewport:{width,height:900},serviceWorkers:'allow',...(width===390?{isMobile:true,hasTouch:true}:{})}),page=await context.newPage();page.setDefaultTimeout(18000);let events=[];
   page.on('pageerror',error=>events.push({kind:'pageerror',message:error.stack}));page.on('console',message=>{if(message.type()==='error')events.push({kind:'console',message:message.text()});});page.on('requestfailed',request=>events.push({kind:'requestfailed',url:request.url(),message:request.failure()?.errorText}));page.on('response',response=>{if(response.status()>=400)events.push({kind:'http',url:response.url(),status:response.status()});});
   const frames=()=>page.evaluate(async()=>{await document.fonts.ready;await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));});
   const idle=()=>page.waitForFunction(()=>!document.querySelector('.v2-roster[aria-busy="true"]'));
   const closeDialogs=async()=>{for(let i=0;i<5&&await page.locator('dialog[open]').count();i++){const dialog=page.locator('dialog[open]').last(),close=dialog.getByRole('button',{name:/^Close /}).first();if(await close.count())await close.click();else await page.keyboard.press('Escape');await frames();}};
   const inspect=async(meta,action=null,target=page)=>{
    stopIfRequested();const key=keyOf(width,meta.bookId||'',meta.type,meta.inputId||'',meta.id||'',meta.leader||'',meta.target||'');if(completed.has(key))return{status:'SKIPPED_CHECKPOINT'};
    summary.screenAttempts++;events=[];const started=performance.now();let row={key,width,...meta,status:'ERROR'};
    try{if(action)await action();await frames();row.readyMs=Number.isFinite(meta.measuredReadyMs)?meta.measuredReadyMs:action?performance.now()-started:null;row.readinessMeasurement=row.readyMs===null?'NOT_MEASURED_ACTION_ALREADY_COMPLETED':'ACTION_TO_READY_BEFORE_INSPECTION';const short=await target.evaluate(inspectShortParagraphsAndMarkers,{importScope:meta.importScope===true}),flow=await target.evaluate(inspectFlowLinksAndShortDuplicates);
     if(meta.bookId&&/^(?:expanded-)?(?:ordinary|attached|enhanced)-card$/.test(meta.type)){
      // A formed card shows separately owned components. Certify each currently
      // displayed component after attachment, not just the requested Bodyguard.
      const componentIds=await page.evaluate(()=>[...new Set([...document.querySelectorAll('main article.unit-card[data-roster-instance-id]')].filter(node=>node.getClientRects().length&&!node.closest('[hidden],[aria-hidden="true"]')).map(node=>node.dataset.rosterInstanceId))]);row.rosterData=[];
      for(const instanceId of componentIds){const data=await compareRosterCard(page,meta.bookId,instanceId);append('short-roster-data-checks.jsonl',{key,width,...meta,instanceId,...data});row.rosterData.push({instanceId,checks:data.checks,mismatches:data.mismatches.length,coverageGaps:data.pointsEvidence?.coverageGaps?.length||0});summary.rosterDataChecks+=data.checks;summary.rosterDataMismatches+=data.mismatches.length;summary.rosterDataCoverageGaps+=data.pointsEvidence?.coverageGaps?.length||0;}
     }
     Object.assign(row,{status:'COMPLETE',url:page.url(),short,flow,events:[...events],elapsedMs:performance.now()-started});
     summary.paragraphDuplicateGroups+=short.duplicates.length;summary.inWordLinks+=flow.inWord.length;summary.markerCandidateLines+=short.markerCandidates.length+short.importCopyCandidates.length;append('short-screens.jsonl',row);completed.add(key);
     if(short.duplicates.length||short.markerCandidates.length||short.importCopyCandidates.length||flow.inWord.length||events.length||row.readyMs>5000)append('short-findings.jsonl',row);
     append('short-flow-links.jsonl',{key,width,...meta,termCount:flow.terms.length,terms:flow.terms,inWord:flow.inWord});
    }catch(error){row.error=error.stack;row.events=[...events];row.elapsedMs=performance.now()-started;summary.screenErrors++;append('short-screens.jsonl',row);append('short-errors.jsonl',row);}
    return row;
   };
   const mount=async bookId=>{await page.goto(base+'?book='+encodeURIComponent(bookId));await page.waitForFunction(id=>window.ArmyBookAppV2?.payload.book.id===id,bookId);await page.evaluate(()=>WarhammerAppV2.ready);await frames();};
   for(const bookId of selected){
    current={width,bookId};stopIfRequested();const bookStarted=performance.now();await mount(bookId);await inspect({bookId,type:'library',id:'home',measuredReadyMs:performance.now()-bookStarted});
    const routes=await page.evaluate(kinds=>ArmyBookAppV2.payload.cards.filter(card=>card.domain!=='CORE'&&kinds.includes(card.kind)).map(card=>({id:card.id,kind:card.kind,title:card.title})),[...routeKinds]);
    append('short-route-inventory.jsonl',{...current,routeCount:routes.length,kinds:routes.reduce((counts,route)=>(counts[route.kind]=(counts[route.kind]||0)+1,counts),{}),routes});
    for(const route of routes)await inspect({bookId,type:'authored-'+route.kind,id:route.id,title:route.title},()=>page.evaluate(id=>ArmyBookAppV2.open(id),route.id));
    progress({...current,phase:'authored-routes',routes:routes.length});
    for(const input of inputs.filter(input=>input.bookId===bookId)){
     stopIfRequested();const key=keyOf(width,bookId,input.inputId);if(inputDone.has(key))continue;const screenErrorsBefore=summary.screenErrors,inputErrorsBefore=summary.inputErrors;summary.inputAttempts++;events=[];let row={key,...current,inputId:input.inputId,sha256:input.sha256,status:'ERROR',started:new Date().toISOString()};const started=performance.now();
     try{
      await closeDialogs();const importStarted=performance.now(),result=await page.evaluate(async text=>{const app=ArmyBookAppV2,result=await app.roster.import(text,{}, {replaceExisting:true});app.rosterPanel.refresh();app.openRoster();return{status:result.status,needs:(result.needsBindings||[]).map(need=>({kind:need.kind,reason:need.reason??null,rawLabel:need.rawLabel??null})),errors:result.errors||[]};},input.text);await idle();await frames();row.importReadyMs=performance.now()-importStarted;
      row.rawStatus=result.status;row.rawPasteExpectedStatus=expectations[input.inputId]?.rawPasteExpectedStatus??null;row.expectedRawStatusMatches=row.rawPasteExpectedStatus===null?null:result.status===row.rawPasteExpectedStatus;row.fixtureDeclaredExpectedStatus=input.expectedStatus??null;row.fixtureBindingsProvided=false;row.fixtureBindingDescriptors=input.bindings?.length??0;row.needs=result.needs;row.errors=result.errors;
      await inspect({bookId,type:'import',inputId:input.inputId,id:'result',importScope:true,rawStatus:result.status,measuredReadyMs:row.importReadyMs});
      if(result.status==='READY'){
       summary.ready++;const units=await page.evaluate(()=>ArmyBookAppV2.roster.state.units.map(unit=>({id:unit.instanceId,canonicalId:unit.canonicalUnitId,enhancementIds:unit.enhancementIds||[]})));row.units=units.map(unit=>({id:unit.id,canonicalId:unit.canonicalId,enhancementIds:unit.enhancementIds}));
       // Every physical unit, not just enhanced/attached examples.
       for(const unit of units){await inspect({bookId,type:'ordinary-card',inputId:input.inputId,id:unit.id,canonicalId:unit.canonicalId},()=>page.evaluate(id=>ArmyBookAppV2.openInstance(id),unit.id));await inspect({bookId,type:'expanded-ordinary-card',inputId:input.inputId,id:unit.id,canonicalId:unit.canonicalId},async()=>{await page.evaluate(id=>ArmyBookAppV2.openInstance(id),unit.id);await page.locator('main details').evaluateAll(nodes=>nodes.forEach(node=>node.open=true));});}
       await inspect({bookId,type:'personal-guide',inputId:input.inputId,id:'home'},()=>page.evaluate(()=>ArmyBookAppV2.openPersonalGuide()));
       const attachments=[];
       for(const unit of units){
        const candidates=await page.evaluate(id=>ArmyBookAppV2.roster.candidates(id).map(candidate=>({id:candidate.instanceId,canonicalId:candidate.canonicalUnitId})),unit.id);
        if(!candidates.length){attachments.push({leader:unit.id,outcome:'NO_NATIVE_ELIGIBLE_BODYGUARD'});continue;}
        const target=candidates[0];let attached=false;const action={leader:unit.id,target:target.id,targetCanonicalId:target.canonicalId,outcome:'ERROR'};
        try{const attachStarted=performance.now();await page.evaluate(({leader,target})=>{ArmyBookAppV2.roster.attach(leader,target);ArmyBookAppV2.openInstance(target);},{leader:unit.id,target:target.id});attached=true;await idle();await frames();action.attachReadyMs=performance.now()-attachStarted;summary.attachments++;
         await inspect({bookId,type:'attached-card',inputId:input.inputId,id:target.id,leader:unit.id,target:target.id,measuredReadyMs:action.attachReadyMs});
         await inspect({bookId,type:'expanded-attached-card',inputId:input.inputId,id:target.id,leader:unit.id,target:target.id},()=>page.locator('main details').evaluateAll(nodes=>nodes.forEach(node=>node.open=true)));
         await inspect({bookId,type:'attached-personal-guide',inputId:input.inputId,id:'home',leader:unit.id,target:target.id},()=>page.evaluate(()=>ArmyBookAppV2.openPersonalGuide()));action.outcome='ATTACHED_AND_DETACHED';
        }catch(error){action.error=error.stack;summary.inputErrors++;append('short-attachment-errors.jsonl',{...current,inputId:input.inputId,...action});}
        finally{if(attached){const detachStarted=performance.now();await page.evaluate(id=>{ArmyBookAppV2.roster.detach(id);ArmyBookAppV2.openRoster();},unit.id);await idle();await frames();action.detachReadyMs=performance.now()-detachStarted;await inspect({bookId,type:'detached-setup',inputId:input.inputId,id:unit.id,leader:unit.id,target:target.id,importScope:true,measuredReadyMs:action.detachReadyMs});}}
        attachments.push(action);
       }row.attachments=attachments;
       await page.evaluate(()=>ArmyBookAppV2.openRoster());await idle();
      }else{summary.notReady++;row.physicalCardsNotVisited='Raw import was not READY; no guessed fixture bindings or roster state used';}
      row.status=summary.screenErrors===screenErrorsBefore&&summary.inputErrors===inputErrorsBefore?'COMPLETE':'COMPLETE_WITH_SCREEN_OR_ACTION_ERRORS';row.elapsedMs=performance.now()-started;row.events=[...events];append('short-inputs.jsonl',row);if(row.status==='COMPLETE')inputDone.add(key);
     }catch(error){row.error=error.stack;row.elapsedMs=performance.now()-started;summary.inputErrors++;append('short-inputs.jsonl',row);append('short-errors.jsonl',row);}
     progress({...current,phase:'inputs',inputId:input.inputId,rawStatus:row.rawStatus||null,inputOutcome:row.status,completedInputs:inputDone.size});
     if(summary.inputAttempts%20===0)console.log(JSON.stringify({phase:'short-inputs',...current,attempted:summary.inputAttempts,completed:inputDone.size,ready:summary.ready,errors:summary.screenErrors+summary.inputErrors}));
    }
    console.log(JSON.stringify({phase:'short-book-complete',...current,completedScreens:completed.size,completedInputs:inputDone.size}));
   }
   if(!arg('--book')){
    const html=fs.readFileSync(root+'/books/core-rules/reader/index.html','utf8'),chapters=[...new Set(['index',...[...html.matchAll(/href="([^"#?]+\.html)(?:#[^"]*)?"/g)].map(match=>match[1].split('/').pop().slice(0,-5)).filter(id=>fs.existsSync(root+'/books/core-rules/reader/'+id+'.html'))])];
    for(const chapter of chapters){stopIfRequested();const key=keyOf(width,'','core','',chapter,'','');if(completed.has(key))continue;const chapterStarted=performance.now();await page.goto(base+'?v2=CORE_RULES&registry=core-rules'+(chapter==='index'?'':'&chapter='+encodeURIComponent(chapter)));await page.waitForFunction(()=>Boolean(document.querySelector('iframe.v2-core-reader')?.contentDocument?.querySelector('main.main')));const frame=page.frames().find(frame=>frame.url().includes('/reader/'));assert(frame,'Normal Core iframe exists');await inspect({type:'core',id:chapter,measuredReadyMs:performance.now()-chapterStarted},null,frame);progress({width,phase:'core',chapter});}
    await page.goto(base+'?v2=GLOSSARY');await page.waitForSelector('[data-global-glossary] input[type=search]');
    for(const term of terms){stopIfRequested();await closeDialogs();await inspect({type:'glossary-results',id:term},()=>page.getByRole('searchbox',{name:'Search glossary',exact:true}).fill(term));
     const popupKey=keyOf(width,'','glossary-popup','',term,'','');if(!completed.has(popupKey)){await page.getByRole('searchbox',{name:'Search glossary',exact:true}).fill(term);await frames();const links=page.locator('.v2-glossary-result');assert(await links.count(),'Existing glossary result for '+term);await inspect({type:'glossary-popup',id:term},async()=>{await links.first().click();await page.waitForSelector('dialog[open]');});}progress({width,phase:'glossary',term});}
   }
   await context.close();
  }
  summary.status=summary.screenErrors||summary.inputErrors?'COMPLETE_WITH_ERRORS':'COMPLETE';summary.finished=new Date().toISOString();summary.totalCompletedScreens=completed.size;summary.totalCompletedInputs=inputDone.size;fs.writeFileSync(path.join(out,'SHORT_COVERAGE.json'),JSON.stringify(summary,null,2)+'\n');save();console.log('SHORT_PARAGRAPH_SWEEP_COMPLETE '+JSON.stringify(summary));
 }catch(error){summary.status=error.ownerStop?'STOPPED':'ERROR';summary.error=error.stack;save();throw error;}finally{await browser?.close();}
}

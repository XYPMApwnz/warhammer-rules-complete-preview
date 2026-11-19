import fs from'node:fs';
import{auditNewUi}from'./audit-new-ui.mjs';
import{inspectPlayerDialog}from'file:///E:/Warhammer/worktrees/import-messages-v1/tests/helpers/player-dialog-assertions.mjs';
const out='E:/Warhammer/qa-evidence/auto-qa-sweep-2-2026-11-19';
const append=(file,row)=>fs.appendFileSync(out+'/'+file,JSON.stringify(row)+'\n');
export async function inspectExtended(page,meta){
 const context=await page.evaluate(()=>({selectedDetachmentIds:window.ArmyBookAppV2?.roster?.state?.detachmentIds||[],warlordInstanceId:window.ArmyBookAppV2?.roster?.state?.warlordInstanceId||null}));
 return auditNewUi(page,{...meta,...context});
}
export async function extendReady(page,{bookId,input,width,key,snap,settle,idle,captureGallery}){
 const record=(type,data)=>append('interaction-results.jsonl',{key,bookId,inputId:input.inputId,width,type,...data});
 await page.evaluate(()=>ArmyBookAppV2.openRoster());await idle();
 const warlord=page.locator('[data-roster-warlord-select]');
 if(await warlord.count()){
  const values=await warlord.locator('option').evaluateAll(nodes=>nodes.filter(n=>n.value&&!n.disabled).map(n=>n.value)),before=await warlord.inputValue(),next=values.find(v=>v!==before)||values[0];
  if(next){await warlord.selectOption(next);const apply=page.locator('[data-roster-action="set-warlord"]');if(await apply.isEnabled()){await apply.click();await idle();}const after=await page.evaluate(()=>ArmyBookAppV2.roster.state.warlordInstanceId);record('warlord',{before,selected:next,after,alreadyCurrent:before===next,pass:after===next});}
  else record('warlord',{status:'NO_ELIGIBLE_CHARACTER'});
 }
 // Only offered native choices are used. Opaque values and quantities are never fabricated.
 const choiceKeys=await page.locator('select[data-source-choice-id]').evaluateAll(nodes=>nodes.map(n=>({choiceId:n.dataset.sourceChoiceId,unitId:n.closest('[data-roster-source-choices-for]').dataset.rosterSourceChoicesFor})));
 for(const{choiceId,unitId}of choiceKeys){
  try{const control=page.locator('[data-roster-source-choices-for='+JSON.stringify(unitId)+'] select[data-source-choice-id='+JSON.stringify(choiceId)+']');if(!await control.count())continue;const value=await control.locator('option').evaluateAll(nodes=>nodes.find(n=>n.value&&!n.disabled)?.value??null);if(value===null){record('source-choice',{choiceId,unitId,status:'NO_OFFERED_OPTION'});continue;}await control.selectOption(value);const field=control.locator('xpath=ancestor::div[@data-source-choice-id][1]');await field.locator('[data-roster-action="set-source-choice"]').click();await idle();const status=await page.locator('.v2-roster-status').innerText();record('source-choice',{choiceId,unitId,status,pass:status==='Choice saved.'});await snap({key:key+'|choice|'+unitId+'|'+choiceId,bookId,type:'saved-source-choice',id:input.inputId});}catch(error){record('source-choice',{choiceId,unitId,error:error.stack,pass:false});}
 }
 const units=await page.evaluate(()=>ArmyBookAppV2.roster.state.units.map(u=>({id:u.instanceId,canonical:u.canonicalUnitId,enhancements:u.enhancementIds||[]})));
 for(const unit of units){
  try{const start=performance.now();await page.evaluate(id=>ArmyBookAppV2.openInstance(id),unit.id);await settle();
   await snap({key:key+'|unit|'+unit.id,bookId,type:'roster-unit-card',id:unit.id,readyMs:performance.now()-start,enhancements:unit.enhancements});
   // Opening accepted presentation groups is view-only; native selections remain untouched.
   await page.locator('main details').evaluateAll(nodes=>nodes.forEach(n=>n.open=true));await settle();
   const expanded=await snap({key:key+'|unit-expanded|'+unit.id,bookId,type:'roster-unit-expanded',id:unit.id});
   const compare=await import('./roster-data-comparison.mjs');const data=await compare.compareRosterCard(page,bookId,unit.id);append('roster-data-checks.jsonl',{key,bookId,width,instanceId:unit.id,...data});
   const chips=page.locator('main button.ds-gained-chip');
   for(let i=0;i<await chips.count();i++){const chip=chips.nth(i),label=await chip.innerText();await chip.click();await settle();const tip=await chip.getAttribute('aria-controls'),visible=tip?await page.locator('[id="'+tip+'"]').isVisible():false;record('gained-tooltip',{unit:unit.id,label,tip,visible,pass:visible});await snap({key:key+'|tooltip|'+unit.id+'|'+i,bookId,type:'gained-tooltip',id:unit.id});await page.keyboard.press('Escape');}
  }catch(error){record('roster-unit-card',{unit:unit.id,error:error.stack,pass:false});}
 }
 await page.evaluate(()=>ArmyBookAppV2.openPersonalGuide());await settle();
 const names=await page.evaluate(()=>{const state=ArmyBookAppV2.roster.state,shape=u=>{if(u.modelRows?.length&&u.modelRows.every(r=>r.canonicalProfileId&&Number.isInteger(r.quantity))){const m=new Map();for(const r of u.modelRows)m.set(r.canonicalProfileId,(m.get(r.canonicalProfileId)||0)+r.quantity);return JSON.stringify([...m].sort(([a],[b])=>a.localeCompare(b)));}return Number.isInteger(u.startingStrength)?'n:'+u.startingStrength:null;};return [...document.querySelectorAll('[data-roster-nav-instance-id]')].filter(n=>n.getClientRects().length).map(n=>{const id=n.dataset.rosterNavInstanceId,u=state.units.find(u=>u.instanceId===id),caption=n.innerText,ordinal=caption.match(/#(\d+)\b/),signature=u&&shape(u),peers=signature?state.units.filter(p=>p.canonicalUnitId===u.canonicalUnitId&&shape(p)===signature):[];return{id,caption,hasOrdinal:!!ordinal,sameCompositionPeers:peers.length,compositionKnown:!!signature,pass:!ordinal||!signature||peers.length>1&&Number(ordinal[1])===peers.findIndex(p=>p.instanceId===id)+1};});});
 record('composition-ordinals',{entries:names,pass:names.every(n=>n.pass)});
 await snap({key:key+'|guide',bookId,type:'personal-guide',id:input.inputId});
 if(width===390){const menu=page.locator('#navMenu');try{await menu.click();const opened=await menu.getAttribute('aria-expanded');await page.keyboard.press('Escape');const closed=await menu.getAttribute('aria-expanded');record('units-drawer',{opened,closed,pass:opened==='true'&&closed==='false'});}catch(error){record('units-drawer',{pass:false,error:error.message});}}
}
export{inspectPlayerDialog};

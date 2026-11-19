/** External AM INV coverage supplement: exact existing inputs/actions only.
 * The source fallback is an explicit invulnerableSaveId reference, never an
 * ability-title inference or another implementation of effect execution. */
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import {pathToFileURL,fileURLToPath}from'node:url';
import {parseProducerJSON}from'file:///E:/Warhammer/worktrees/import-messages-v1/books/shared/source-refs-v2/producer-io.mjs';
const root='E:/Warhammer/worktrees/import-messages-v1',out='E:/Warhammer/qa-evidence/auto-qa-sweep-2-2026-11-19',sha='4060074ae0c7888571367f99f7cb9cc375c167ba',bookId='adeptus-mechanicus',base='http://localhost:8765/v2/app.html';
const append=(name,row)=>fs.appendFileSync(path.join(out,name),JSON.stringify(row)+'\n'),readRows=name=>fs.existsSync(path.join(out,name))?fs.readFileSync(path.join(out,name),'utf8').split('\n').filter(Boolean).map(JSON.parse):[];
export function prepareAmInvPlan(){
 const inputs=JSON.parse(fs.readFileSync(path.join(out,'inventory/ALL_INPUTS.json'),'utf8')).inputs,byInput=new Map(inputs.map(input=>[input.inputId,input]));
 const book=parseProducerJSON(fs.readFileSync(path.join(root,'books/adeptus-mechanicus/v2/generated/roster-runtime.json'),'utf8'));
 const profiles=Object.fromEntries(book.entities.filter(entity=>entity.kind==='PROFILE').map(entity=>[entity.id,{id:entity.id,unitId:entity.parentId,referenceId:entity.data.invulnerableSaveId??null}]));
 const references=Object.fromEntries(book.entities.filter(entity=>entity.kind==='INVULNERABLE_SAVE').map(entity=>[entity.id,{id:entity.id,unitId:entity.parentId,profileIds:entity.data.profileIds,value:entity.data.value,factId:entity.id+'::/value'}]));
 const effects=book.entities.flatMap(rule=>(rule.ruleContract?.clauses||[]).flatMap(clause=>(clause.rosterEffects||[]).filter(effect=>effect.field==='INSV').map(effect=>({ruleId:rule.id,clauseId:clause.id,effectId:effect.id,operation:effect.operation,field:effect.field,mode:effect.mode,value:effect.value}))));
 const invAbilityReferences=Object.entries(book.rosterAbilityReferences||{}).filter(([id,reference])=>/invulner/i.test(id+' '+reference.title)).map(([id])=>id);
 const scenarios=new Map(),observations=[];let shortGapCount=0,mainGapCount=0;
 for(const file of ['short-roster-data-checks.jsonl','roster-data-checks.jsonl'])for(const row of readRows(file)){
  if(row.bookId!==bookId)continue;const gaps=(row.pointsEvidence?.coverageGaps||[]).filter(gap=>gap.kind==='NATIVE_PROFILE_FIELD_NOT_EXPOSED'&&gap.field==='INSV');
  // AM always has the six ordinary characteristics. Extra checked native
  // characteristic values identify already observed dynamic-INSV contexts.
  const dynamicCandidate=row.counts?.profileValues>6*(row.counts?.profileScopes||0);
  if(!gaps.length&&!dynamicCandidate)continue;
  let inputId=row.inputId;if(!inputId&&typeof row.key==='string'&&row.key.includes('|'))inputId=row.key.split('|')[2];
  if(!byInput.has(inputId))throw Error('Existing observation does not resolve to one exact fixture input: '+row.key);
  const attached=Boolean(row.leader&&row.target),leader=attached?row.leader:null,target=attached?row.target:null,key=JSON.stringify([row.width,inputId,leader,target]);
  if(!scenarios.has(key))scenarios.set(key,{key,width:row.width,inputId,sha256:byInput.get(inputId).sha256,leader,target,roots:new Set(),observations:[],dynamicCandidate:false});
  const scenario=scenarios.get(key);scenario.roots.add(attached?target:row.instanceId);scenario.dynamicCandidate||=dynamicCandidate;
  for(const gap of gaps){const item={key:JSON.stringify([file,row.key,row.instanceId,gap.profileId,gap.scopeId,gap.factId]),file,screenKey:row.key,width:row.width,inputId,instanceId:row.instanceId,profileId:gap.profileId,scopeId:gap.scopeId??null,factId:gap.factId,scenarioKey:key};scenario.observations.push(item);observations.push(item);if(file.startsWith('short-'))shortGapCount++;else mainGapCount++;}
 }
 const cases=[...scenarios.values()].map(scenario=>({...scenario,roots:[...scenario.roots]}));
 const source={schema:'am-explicit-invulnerable-source/v1',profiles,references,effects,invAbilityReferences};
 const plan={schema:'auto-qa-sweep-2-am-inv-plan/v1',sha,bookId,method:'Replay existing exact input plus recorded first-native-candidate attachment; deduplicate ordinary/expanded observations sharing the same input/attachment/width native context. Current projection/native final INSV wins; absent INSV is read only through the exact canonical invulnerableSaveId with profile membership and no applied INSV change.',counts:{scenarios:cases.length,inputs:new Set(cases.map(s=>s.inputId)).size,shortGapObservations:shortGapCount,mainGapObservations:mainGapCount,originalGapObservations:observations.length,dynamicCandidateScenarios:cases.filter(s=>s.dynamicCandidate).length,sourceProfiles:Object.keys(profiles).length,sourceReferences:Object.keys(references).length,invEffects:effects.length,invAbilityReferences:invAbilityReferences.length},source,cases};
 return{plan,byInput};
}

/** Read-only value/source/target comparison on an already opened physical card. */
export async function verifyAmInv(page,source){return page.evaluate(inspectAmInv,source);}
export function inspectAmInv(source){
 const api=window.ArmyBookAppV2,mismatches=[],gaps=[],rows=[];let checks=0;
 const eq=(actual,expected,kind,detail={})=>{checks++;if(JSON.stringify(actual)!==JSON.stringify(expected))mismatches.push({kind,actual,expected,...detail});};
 if(api?.payload.book.id!=='adeptus-mechanicus'||!api.roster.state)return{checks,mismatches:[{kind:'AM_NATIVE_CONTEXT_MISSING'}],gaps,rows};
 const cards=new Map(api.payload.cards.map(card=>[card.id,card])),projection=api.roster.projection;
 const text=node=>String(node?.textContent??'').replace(/\s+/g,' ').trim(),parse=value=>{try{return JSON.parse(value);}catch{return undefined;}},visible=node=>Boolean(node?.getClientRects().length)&&!node.closest('[hidden],[aria-hidden="true"]')&&getComputedStyle(node).visibility!=='hidden';
 const at=(record,name)=>{const direct=record.fields.find(field=>field.label===name);if(direct)return{present:true,value:direct.value};const stats=record.fields.find(field=>field.label==='stats')?.value;return stats&&Object.hasOwn(stats,name)?{present:true,value:stats[name]}:{present:false};};
 for(const card of document.querySelectorAll('main article.unit-card[data-roster-instance-id]'))if(visible(card)){
  const instanceId=card.dataset.rosterInstanceId,unit=api.roster.state.units.find(unit=>unit.instanceId===instanceId),effective=api.roster.effective(instanceId),projected=projection.units.find(unit=>unit.instanceId===instanceId),seen=new Set();
  for(const line of card.querySelectorAll('.statline'))if(visible(line)&&line.closest('article.unit-card')===card){
   const group=line.closest('[data-profile-scopes]'),profile=line.closest('.model-profile[data-card-id]'),addresses=group?parse(group.dataset.profileScopes):profile?[[profile.dataset.cardId,profile.dataset.compositionId||null]]:[];
   if(!Array.isArray(addresses)||!addresses.length){gaps.push({kind:'INV_STATLINE_SCOPE_MISSING',instanceId});continue;}
   const invStat=[...line.querySelectorAll(':scope > .stat')].find(stat=>text(stat.querySelector('b'))==='INV'),fact=invStat?.querySelector('[data-fact-id]'),prepared=[];
   for(const[profileId,scopeId]of addresses){
    const detail={instanceId,profileId,scopeId:scopeId??null},matches=effective.profiles.filter(profile=>profile.id===profileId&&(profile.scopeId??null)===(scopeId??null)),raw=projected?.profiles.filter(profile=>profile.canonicalProfileId===profileId&&(profile.scopeId??null)===(scopeId??null))||[];
    if(matches.length!==1||raw.length!==1){gaps.push({kind:'INV_NATIVE_PROFILE_NOT_UNIQUE',...detail,effective:matches.length,projection:raw.length});continue;}
    const native=matches[0],current=at(native,'INSV'),accepted=source.profiles[profileId],referenceId=at(native,'invulnerableSaveId').value??null,reference=referenceId?source.references[referenceId]:null;
    if(!accepted){gaps.push({kind:'INV_ACCEPTED_PROFILE_MISSING',...detail});continue;}
    eq(unit.canonicalUnitId,accepted.unitId,'INV_PROFILE_OWNER',detail);eq(referenceId,accepted.referenceId,'INV_NATIVE_REFERENCE_ID',detail);eq(raw[0].profile.invulnerableSaveId??null,accepted.referenceId,'INV_RAW_PROJECTION_REFERENCE_ID',detail);
    const rawPresent=Object.hasOwn(raw[0].profile,'INSV')||Object.hasOwn(raw[0].profile.stats||{},'INSV'),rawValue=raw[0].profile.INSV??raw[0].profile.stats?.INSV;
    eq(current.present,rawPresent,'INV_NATIVE_VS_RAW_PRESENCE',detail);if(rawPresent)eq(current.value,rawValue,'INV_NATIVE_VS_RAW_VALUE',detail);
    if(referenceId){if(!reference||reference.unitId!==unit.canonicalUnitId||!reference.profileIds.includes(profileId)){gaps.push({kind:'INV_REFERENCE_SCOPE_NOT_PROVEN',...detail,referenceId});continue;}
     const published=cards.get(referenceId),value=published?.fields.find(field=>field.source?.path==='/value'),publishedProfile=cards.get(profileId);
     eq(published?.kind,'INVULNERABLE_SAVE','INV_PUBLISHED_REFERENCE_KIND',detail);eq(published?.parentId,reference.unitId,'INV_PUBLISHED_REFERENCE_OWNER',detail);eq(value?.id,reference.factId,'INV_PUBLISHED_SOURCE_FIELD_ID',detail);eq(value?.value,reference.value,'INV_PUBLISHED_SOURCE_FIELD_VALUE',detail);eq(Boolean(publishedProfile?.profileFieldIds?.includes(reference.factId)),true,'INV_EXPLICIT_PROFILE_FIELD_BINDING',detail);
    }
    const traces=(effective.applied||[]).filter(trace=>trace.operation==='MODIFY_STAT'&&trace.field==='INSV'&&trace.targetInstanceId===instanceId&&trace.targetProfileId===profileId&&(trace.targetCompositionId??null)===(scopeId??null));
    let expected,method;
    if(current.present){expected=current.value;method=traces.length?'NATIVE_FINAL_WITH_EXECUTED_INSV_TRACE':'NATIVE_FINAL_EQUAL_TO_EXPLICIT_SOURCE';
     if(!traces.length){if(!reference){gaps.push({kind:'UNSOURCED_NATIVE_INV_WITHOUT_TRACE',...detail});continue;}eq(current.value,reference.value,'INV_UNCHANGED_NATIVE_VALUE_SOURCE',detail);}
     for(const trace of traces){const declaration=source.effects.find(effect=>effect.ruleId===trace.ruleId&&effect.clauseId===trace.clauseId&&effect.effectId===trace.effectId);eq(Boolean(declaration),true,'INV_EXECUTED_EFFECT_SOURCE_ID',detail);if(declaration){eq(trace.operation,declaration.operation,'INV_EXECUTED_OPERATION',detail);eq(trace.field,declaration.field,'INV_EXECUTED_FIELD',detail);}const proof=(effective.statSources||[]).find(proof=>proof.ruleId===trace.ruleId&&proof.clauseId===trace.clauseId&&proof.effectId===trace.effectId&&proof.targetInstanceId===instanceId&&proof.targetProfileId===profileId&&(proof.targetCompositionId??null)===(scopeId??null));eq(Boolean(proof),true,'INV_EXECUTED_SOURCE_PROOF',detail);if(proof)eq(proof.after,trace.after,'INV_SOURCE_PROOF_FINAL',detail);}
     if(traces.length)eq(traces.at(-1).after,current.value,'INV_LAST_NATIVE_TRACE_FINAL',detail);
    }else{if(!reference)continue;expected=reference.value;method='EXPLICIT_CANONICAL_REFERENCE_NO_NATIVE_CHANGE';eq(traces.length,0,'INV_REFERENCE_FALLBACK_HAS_NO_EXECUTED_CHANGE',detail);}
    const expectedFactId=current.present?profileId+'::/INSV':reference.factId,expectedEntityId=referenceId||profileId;prepared.push({...detail,expected,method,referenceId,expectedFactId,expectedEntityId,sourceValue:reference?.value??null,traces:traces.map(trace=>({ruleId:trace.ruleId,clauseId:trace.clauseId,effectId:trace.effectId,targetCompositionId:trace.targetCompositionId,before:trace.before,after:trace.after}))});
   }
   for(const item of prepared){seen.add(JSON.stringify([item.profileId,item.scopeId]));if(!fact){mismatches.push({kind:'INV_VISIBLE_FIELD_MISSING',...item});continue;}
    const provider=prepared.find(provider=>provider.expectedFactId===fact.dataset.factId&&provider.expectedEntityId===fact.dataset.entityId);eq(Boolean(provider),true,'INV_FACT_OWNER_IS_DECLARED_DISPLAY_GROUP_MEMBER',item);eq(parse(fact.dataset.factValue),item.expected,'INV_DISPLAYED_FACT_VALUE',item);eq(text(fact),text({textContent:String(item.expected)}),'INV_VISIBLE_TEXT',item);rows.push({...item,actualFactId:fact.dataset.factId,actualEntityId:fact.dataset.entityId,actualValue:parse(fact.dataset.factValue),actualText:text(fact),displayGroup:addresses});
   }
  }
  for(const profile of effective.profiles)if(profile.quantity>0&&(at(profile,'INSV').present||at(profile,'invulnerableSaveId').value)&&!seen.has(JSON.stringify([profile.id,profile.scopeId??null])))gaps.push({kind:'INV_ACTIVE_PROFILE_NOT_CERTIFIED',instanceId,profileId:profile.id,scopeId:profile.scopeId??null});
 }
 return{checks,mismatches,gaps,rows};
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const{plan,byInput}=prepareAmInvPlan();fs.writeFileSync(path.join(out,'AM_INV_PLAN.json'),JSON.stringify(plan,null,2)+'\n');
 if(process.argv.includes('--plan-only'))console.log(JSON.stringify({status:'STATIC_PLAN_ONLY',...plan.counts}));
 else{
  const{launchChromium}=await import(pathToFileURL(root+'/tests/helpers/browser-launch.mjs'));let browser;
  const prior=readRows('am-inv-results.jsonl'),done=new Set(prior.filter(row=>row.status==='COMPLETE').map(row=>row.key)),budgetArg=process.argv.find(arg=>arg.startsWith('--max-ms=')),maxMs=budgetArg?Number(budgetArg.slice('--max-ms='.length)):900000,deadline=Date.now()+maxMs,progress={schema:'auto-qa-sweep-2-am-inv-verification/v1',sha,status:'RUNNING',started:new Date().toISOString(),maxMs,planCounts:plan.counts,scenarios:0,errors:0,checks:0,mismatches:0,gaps:0,verifiedProfiles:0,resumed:done.size};assert(Number.isFinite(maxMs)&&maxMs>0);const save=extra=>fs.writeFileSync(path.join(out,'AM_INV_PROGRESS.json'),JSON.stringify({...progress,...extra,at:new Date().toISOString()},null,2)+'\n');
  try{const response=await fetch('http://localhost:8765/');assert.equal(response.status,200);assert.equal(response.headers.get('x-preview-package'),sha);browser=await launchChromium();save();
   for(const width of[390,1440]){const context=await browser.newContext({viewport:{width,height:900},serviceWorkers:'allow',...(width===390?{isMobile:true,hasTouch:true}:{})}),page=await context.newPage();page.setDefaultTimeout(18000);await page.goto(base+'?v2=ROSTER&book='+bookId+'#view-roster');await page.waitForFunction(()=>window.ArmyBookAppV2?.payload.book.id==='adeptus-mechanicus');await page.evaluate(()=>WarhammerAppV2.ready);
    const frames=()=>page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
    const groups=new Map();for(const scenario of plan.cases.filter(scenario=>scenario.width===width&&!done.has(scenario.key))){const cases=groups.get(scenario.inputId)||[];cases.push(scenario);groups.set(scenario.inputId,cases);}
    for(const[inputId,cases]of groups){const input=byInput.get(inputId);const result=await page.evaluate(async text=>{const app=ArmyBookAppV2,result=await app.roster.import(text,{}, {replaceExisting:true});app.rosterPanel.refresh();app.openRoster();return result.status;},input.text);
     for(const scenario of cases){if(Date.now()>deadline)throw Object.assign(Error('AM INV bounded verification time budget reached; unresolved scenarios remain explicit'),{timeLimit:true});progress.scenarios++;let row={key:scenario.key,width,inputId,leader:scenario.leader,target:scenario.target,status:'ERROR',observations:scenario.observations,results:[]},attached=false;
      try{assert.equal(result,'READY','Previously observed exact raw input must still be READY');if(scenario.leader){const candidates=await page.evaluate(id=>ArmyBookAppV2.roster.candidates(id).map(candidate=>candidate.instanceId),scenario.leader);assert.equal(candidates[0],scenario.target,'Replay only the previously observed first native candidate');await page.evaluate(({leader,target})=>ArmyBookAppV2.roster.attach(leader,target),scenario);attached=true;}
       for(const id of scenario.roots){await page.evaluate(id=>{if(!ArmyBookAppV2.openInstance(id))throw Error('Original physical unit is unavailable');},id);await frames();const observed=await verifyAmInv(page,plan.source);row.results.push({rootInstanceId:id,...observed});progress.checks+=observed.checks;progress.mismatches+=observed.mismatches.length;progress.gaps+=observed.gaps.length;progress.verifiedProfiles+=observed.rows.length;}
       const verified=new Set(row.results.flatMap(result=>result.rows.map(row=>JSON.stringify([row.instanceId,row.profileId,row.scopeId]))));row.observationCoverage=scenario.observations.map(observation=>({key:observation.key,verified:verified.has(JSON.stringify([observation.instanceId,observation.profileId,observation.scopeId]))}));row.uncoveredOriginalObservations=row.observationCoverage.filter(row=>!row.verified).length;progress.gaps+=row.uncoveredOriginalObservations;row.status='COMPLETE';done.add(scenario.key);
      }catch(error){row.error=error.stack;progress.errors++;}finally{if(attached)await page.evaluate(id=>ArmyBookAppV2.roster.detach(id),scenario.leader);}
      append('am-inv-results.jsonl',row);save({width,inputId,lastScenario:scenario.key});
     }if(progress.scenarios%20===0)console.log(JSON.stringify({phase:'am-inv',width,inputId,scenarios:progress.scenarios,checks:progress.checks,mismatches:progress.mismatches,gaps:progress.gaps,errors:progress.errors}));
    }await context.close();
   }
   const latest=[...new Map(readRows('am-inv-results.jsonl').map(row=>[row.key,row])).values()],coverage=latest.flatMap(row=>row.observationCoverage||[]),all=latest.flatMap(row=>row.results||[]),complete=latest.filter(row=>row.status==='COMPLETE').length,errors=latest.filter(row=>row.status!=='COMPLETE').length,totalMismatches=all.reduce((sum,row)=>sum+row.mismatches.length,0),totalGaps=all.reduce((sum,row)=>sum+row.gaps.length,0)+coverage.filter(row=>!row.verified).length;
   Object.assign(progress,{status:errors||complete!==plan.cases.length?'COMPLETE_WITH_ERRORS':totalMismatches||totalGaps?'COMPLETE_WITH_FINDINGS':'PASS',finished:new Date().toISOString(),completeScenarios:complete,unresolvedScenarios:plan.cases.length-complete,totalChecks:all.reduce((sum,row)=>sum+row.checks,0),totalMismatches,totalGaps,totalVerifiedProfiles:all.reduce((sum,row)=>sum+row.rows.length,0),originalGapObservations:plan.counts.originalGapObservations,verifiedOriginalGapObservations:coverage.filter(row=>row.verified).length,uncoveredOriginalGapObservations:coverage.filter(row=>!row.verified).length});fs.writeFileSync(path.join(out,'AM_INV_COVERAGE.json'),JSON.stringify(progress,null,2)+'\n');save();console.log('AM_INV_VERIFICATION_COMPLETE '+JSON.stringify(progress));
  }catch(error){progress.status=error.timeLimit?'INCOMPLETE_TIME_LIMIT':'ERROR';progress.error=error.stack;save();throw error;}finally{await browser?.close();}
 }
}

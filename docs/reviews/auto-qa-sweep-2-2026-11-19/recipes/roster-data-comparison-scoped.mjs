import fs from 'node:fs';
import path from 'node:path';
import {sourceSnapshot} from 'file:///E:/Warhammer/worktrees/import-messages-v1/books/shared/source-refs-v2/source-refs.mjs';

const repository='E:/Warhammer/worktrees/import-messages-v1';
let mfmInventory;
const pointer=(root,value)=>String(value||'').split('/').slice(1).reduce((item,key)=>item?.[key.replaceAll('~1','/').replaceAll('~0','~')],root);
const stable=value=>JSON.stringify(value);
const exactLocator=unit=>stable([unit.title,unit.sourceGroup,unit.status]);
const readRelative=relative=>{
  const absolute=path.resolve(repository,relative),boundary=path.resolve(repository)+path.sep;
  if(!absolute.startsWith(boundary)||path.extname(absolute)!=='.json')throw Error('Untrusted accepted-source path: '+relative);
  return JSON.parse(fs.readFileSync(absolute,'utf8').replace(/^\uFEFF/,''));
};
function currentMfm(){
  if(mfmInventory)return mfmInventory;
  const current=readRelative('mfm/current.json'),registry=readRelative(current.identityRegistryPath),allowed=[...current.factions,...current.dependencies],captures=new Map(),byRecordId=new Map(),byLocator=new Map();
  for(const source of allowed){const capture=readRelative(source.capturePath),entries=Array.isArray(capture.units)?capture.units.map((unit,index)=>({unit,pointer:'/units/'+index})):capture.unit?[{unit:capture.unit,pointer:'/unit'}]:[];captures.set(source.capturePath,{source,capture,entries});for(const {unit,pointer} of entries){
    const row={sourceId:source.sourceId,capturePath:source.capturePath,sourceLocator:{sourceTitle:unit.title,sourceGroup:unit.sourceGroup,status:unit.status},pointer,unit};
    const key=exactLocator(unit),items=byLocator.get(key)||[];items.push(row);byLocator.set(key,items);
  }}
  const visit=object=>{if(!object||typeof object!=='object')return;if(Array.isArray(object)){object.forEach(visit);return;}
    if((Array.isArray(object.unitBindings)||object.unitPointRecordId)&&typeof object.sourceCapturePath==='string'){
      const bundle=captures.get(object.sourceCapturePath);
      if(bundle&&bundle.source.sourceId===object.sourceId)for(const binding of object.unitBindings||[object]){
        if(!binding.unitPointRecordId)continue;
        const matches=bundle.entries.filter(({unit})=>unit.title===binding.sourceTitle&&unit.sourceGroup===binding.sourceGroup&&unit.status===binding.status);
        if(matches.length!==1)continue;
        const {unit,pointer}=matches[0],row={recordId:binding.unitPointRecordId,sourceId:bundle.source.sourceId,capturePath:object.sourceCapturePath,sourceLocator:{sourceTitle:binding.sourceTitle,sourceGroup:binding.sourceGroup,status:binding.status},pointer,unit};
        const items=byRecordId.get(row.recordId)||[];items.push(row);byRecordId.set(row.recordId,items);
      }
    }Object.values(object).forEach(visit);
  };visit(registry);
  return mfmInventory={current,byRecordId,byLocator};
}
const uniqueRows=rows=>[...new Map(rows.map(row=>[row.capturePath+'#'+row.pointer,row])).values()];
function sourceForPriceCard(card,inventory,bookId){
  const explicit=uniqueRows(inventory.byRecordId.get(card.id)||[]);if(explicit.length===1)return{row:explicit[0],method:'current identity registry / exact point-record ID'};
  // CSM publishes older native point-row IDs. Its exact recorded source pointer
  // supplies the source locator; no UI title/slug/fuzzy identity inference occurs.
  const entries=[];
  let recorded;try{recorded=card.provenance||sourceSnapshot(card)||[];}catch(error){return{row:null,reason:'Recorded source declaration cannot be decoded: '+error.message};}
  if(!Array.isArray(recorded))return{row:null,reason:'Recorded source declaration is not an explicit provenance list'};
  for(const proof of recorded){
    const match=typeof proof.location==='string'&&proof.location.match(/^(\/units\/(?:0|[1-9]\d*))\/pointSchedules\/(\d+)\/entries\/(\d+)$/);
    if(!match||typeof proof.document!=='string'||!proof.document.endsWith('.json'))continue;
    try{const raw=readRelative(proof.document),oldUnit=pointer(raw,match[1]);if(!oldUnit)continue;
      const allowedSourceIds=new Set(inventory.current.factions.filter(source=>source.bookId===bookId).map(source=>source.sourceId));
      const candidates=(inventory.byLocator.get(exactLocator(oldUnit))||[]).filter(row=>allowedSourceIds.has(row.sourceId));
      for(const row of candidates)entries.push({...row,recordId:card.id,legacyPointer:proof.location,legacyDocument:proof.document});
    }catch{/* An unresolvable explicit source pointer is a coverage gap below. */}
  }
  const matches=uniqueRows(entries);return matches.length===1?{row:matches[0],method:'exact recorded source pointer → exact accepted source locator'}:{row:null,reason:matches.length?'Ambiguous exact current MFM source locator':'No exact current MFM record/source-locator binding'};
}

/** Read-only. The native effective projection is queried, never changed. */
export async function compareRosterCard(page,bookId,instanceId){
  const observed=await page.evaluate(inspectRosterCard,{bookId,instanceId});
  const result={checks:observed.checks,mismatches:observed.mismatches,pointsEvidence:{bookId,instanceId,copyOrdinal:observed.copyOrdinal,modelCount:observed.modelCount,mfmVersion:null,checks:0,coverageGaps:[...observed.coverageGaps],selectedRows:[],nativeBasePoints:observed.nativePrice?.basePoints??null,displayedPoints:observed.displayedPoints},counts:observed.counts};
  if(observed.failed)return result;
  const inventory=currentMfm();result.pointsEvidence.mfmVersion=inventory.current.version;
  const fail=(kind,detail)=>result.mismatches.push({kind,bookId,instanceId,...detail});
  const check=(kind,actual,expected,detail={})=>{result.checks++;result.pointsEvidence.checks++;if(stable(actual)!==stable(expected))fail(kind,{actual,expected,...detail});};
  const sources=observed.priceCards.map(card=>({card,...sourceForPriceCard(card,inventory,bookId)}));
  const resolved=uniqueRows(sources.flatMap(item=>item.row?[item.row]:[]));
  if(resolved.length!==1){result.pointsEvidence.coverageGaps.push({kind:'MFM_UNIT_JOIN_NOT_UNIQUE',count:resolved.length,reasons:sources.filter(item=>!item.row).map(item=>({pointRecordId:item.card.id,reason:item.reason}))});return result;}
  const source=resolved[0],selected=[];
  source.unit.pointSchedules.forEach((schedule,scheduleIndex)=>{
    if(observed.copyOrdinal<(schedule.minCopies??1)||observed.copyOrdinal>(schedule.maxCopies??Infinity))return;
    schedule.entries.forEach((entry,entryIndex)=>{if(observed.modelCount>=entry.minModels&&observed.modelCount<=(entry.maxModels??entry.minModels))selected.push({scheduleIndex,entryIndex,sourceLabel:entry.sourceLabel,minModels:entry.minModels,maxModels:entry.maxModels??entry.minModels,minCopies:schedule.minCopies??1,maxCopies:schedule.maxCopies??null,value:entry.value});});
  });
  result.pointsEvidence.source={sourceId:source.sourceId,capturePath:source.capturePath,sourceLocator:source.sourceLocator,pointer:source.pointer};result.pointsEvidence.selectedRows=selected;
  if(selected.length!==1){result.pointsEvidence.coverageGaps.push({kind:'CURRENT_MFM_TIER_NOT_UNIQUE',count:selected.length});return result;}
  const entry=selected[0],published=[];
  for(const {card,row}of sources){if(!row||row.capturePath!==source.capturePath||row.pointer!==source.pointer)continue;
    const at=p=>card.fields.find(field=>field.path===p)?.value;
    for(const field of card.fields.filter(field=>field.path.endsWith('/value'))){
      const prefix=field.path.slice(0,-5),schedule=field.path.split('/entries/')[0],min=at(prefix+'minModels'),max=at(prefix+'maxModels')??min;
      const low=at(schedule+'/minCopies')??card.pointsSchedule?.minCopies??1,high=at(schedule+'/maxCopies')??card.pointsSchedule?.maxCopies??null;
      if(typeof min!=='number'||observed.modelCount<min||observed.modelCount>max||observed.copyOrdinal<low||high!==null&&observed.copyOrdinal>high)continue;
      published.push({pointRecordId:card.id,path:field.path,value:field.value,minModels:min,maxModels:max,minCopies:low,maxCopies:high});
    }
  }
  result.pointsEvidence.publishedSelectedRows=published;
  if(published.length===1){const publishedRow=published[0];check('PUBLISHED_MFM_COPY_TIER_VALUE',publishedRow.value,entry.value,{copyOrdinal:observed.copyOrdinal});check('PUBLISHED_MFM_COPY_BOUNDS',[publishedRow.minCopies,publishedRow.maxCopies],[entry.minCopies,entry.maxCopies]);check('PUBLISHED_MFM_MODEL_BOUNDS',[publishedRow.minModels,publishedRow.maxModels],[entry.minModels,entry.maxModels]);}
  else result.pointsEvidence.coverageGaps.push({kind:'PUBLISHED_PRICE_ROW_NOT_UNIQUE',count:published.length});
  if(Number.isFinite(observed.nativePrice?.basePoints))check('NATIVE_MFM_BASE_VALUE',observed.nativePrice.basePoints,entry.value);
  let expected=null,native=observed.nativePrice;
  if(native?.totalPoints!==undefined&&native.totalPoints!==null)expected=native.totalPoints-(native.enhancementPoints||0);
  else if(native?.total!==undefined&&native.total!==null)expected=native.total-(native.enhancementPoints||0);
  else if(native?.basePoints!==undefined&&native.basePoints!==null)expected=native.basePoints;
  else if(published.length===1)expected=entry.value;
  else result.pointsEvidence.coverageGaps.push({kind:'DISPLAYED_PRICE_EXPECTATION_UNRESOLVED'});
  check('VISIBLE_ROSTER_POINTS',observed.displayedPoints,expected,{priceText:observed.priceText});
  return result;
}

/** Browser-only evaluator: all comparisons use current native effective fields. */
export function inspectRosterCard({bookId,instanceId}){
  const mismatches=[],coverageGaps=[],counts={profileValues:0,weaponValues:0,weaponAbilities:0,weaponQuantities:0,profileScopes:0,weaponOccurrences:0};let checks=0;
  const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b),normal=value=>String(value??'').replace(/\s+/g,' ').trim();
  const mismatch=(kind,detail={})=>mismatches.push({kind,bookId,instanceId,...detail});
  const check=(kind,actual,expected,detail={})=>{checks++;if(!same(actual,expected))mismatch(kind,{actual,expected,...detail});};
  const visible=node=>Boolean(node?.getClientRects().length)&&!node.closest('[hidden],[aria-hidden="true"]')&&getComputedStyle(node).visibility!=='hidden';
  const parse=value=>{try{return JSON.parse(value);}catch{return undefined;}};
  const api=window.ArmyBookAppV2;
  if(!api||api.payload?.book.id!==bookId||!api.roster?.state){mismatch('NATIVE_ROSTER_CONTEXT_MISSING');return{checks,mismatches,coverageGaps,counts,failed:true};}
  const state=api.roster.state,unit=state.units.find(unit=>unit.instanceId===instanceId),card=[...document.querySelectorAll('main article.unit-card[data-roster-instance-id]')].find(card=>card.dataset.rosterInstanceId===instanceId);
  if(!unit||!card){mismatch('PHYSICAL_ROSTER_CARD_MISSING',{nativeUnit:!!unit,renderedCard:!!card});return{checks,mismatches,coverageGaps,counts,failed:true};}
  const effective=api.roster.effective(instanceId),payloadCards=new Map(api.payload.cards.map(card=>[card.id,card]));
  const value=(record,key)=>{const exact=record.fields.find(field=>field.label===key);if(exact)return{found:true,value:exact.value};const stats=record.fields.find(field=>field.label==='stats')?.value;if(stats&&Object.hasOwn(stats,key))return{found:true,value:stats[key]};return{found:false};};
  const seenProfiles=new Set(),seenWeapons=new Set();
  const profileKey=record=>JSON.stringify([record.id,record.scopeId??null]);
  for(const line of card.querySelectorAll('.statline'))if(visible(line)&&line.closest('article.unit-card')===card){
    const grouped=line.closest('[data-profile-scopes]'),profile=line.closest('.model-profile[data-card-id]');
    const addresses=grouped?parse(grouped.dataset.profileScopes):profile?[[profile.dataset.cardId,profile.dataset.compositionId||null]]:null;
    if(!Array.isArray(addresses)||!addresses.length){coverageGaps.push({kind:'PROFILE_STATLINE_IDENTITY_MISSING'});continue;}
    for(const [id,scope]of addresses){const matches=effective.profiles.filter(record=>record.id===id&&(record.scopeId??null)===(scope??null));
      if(matches.length!==1){mismatch('PROFILE_SCOPE_NOT_UNIQUE',{profileId:id,scopeId:scope,count:matches.length});continue;}
      const record=matches[0];seenProfiles.add(profileKey(record));counts.profileScopes++;
      for(const stat of line.querySelectorAll(':scope > .stat')){
        const label=normal(stat.querySelector('b')?.textContent),key=label==='INV'?'INSV':label,fact=stat.querySelector('[data-fact-id]');if(!fact)continue;
        const current=value(record,key);if(!current.found){coverageGaps.push({kind:'NATIVE_PROFILE_FIELD_NOT_EXPOSED',profileId:id,scopeId:scope,field:key,factId:fact.dataset.factId});continue;}
        check('PROFILE_VALUE',parse(fact.dataset.factValue),current.value,{profileId:id,scopeId:scope,field:key,factId:fact.dataset.factId});
        check('PROFILE_VISIBLE_TEXT',normal(fact.textContent),normal(current.value),{profileId:id,scopeId:scope,field:key});counts.profileValues++;
      }
    }
  }
  for(const record of effective.profiles)if(record.quantity>0&&!seenProfiles.has(profileKey(record)))mismatch('NATIVE_PROFILE_NOT_DISPLAYED',{profileId:record.id,scopeId:record.scopeId,quantity:record.quantity});
  const labels={Range:'range',A:'attacks',BS:'skill',WS:'skill',S:'strength',AP:'ap',D:'damage'};
  for(const row of card.querySelectorAll('.weapon-row[data-weapon-occurrences]'))if(visible(row)&&row.closest('article.unit-card')===card){
    const occurrences=parse(row.dataset.weaponOccurrences);if(!Array.isArray(occurrences)||!occurrences.length){mismatch('WEAPON_OCCURRENCES_MISSING',{weaponId:row.dataset.cardId});continue;}
    let expectedQuantity=0,quantityKnown=true;
    for(const occurrence of occurrences){const matches=effective.weapons.filter(record=>record.id===occurrence.id&&(record.scopeId??null)===(occurrence.scopeId??null)&&(record.selectionKey??null)===(occurrence.selectionKey??null));
      if(matches.length!==1){mismatch('WEAPON_OCCURRENCE_NOT_UNIQUE',{occurrence,count:matches.length});continue;}
      const record=matches[0];seenWeapons.add(JSON.stringify([record.id,record.scopeId??null,record.selectionKey??null]));counts.weaponOccurrences++;
      if(Number.isFinite(record.physicalQuantity))expectedQuantity+=record.physicalQuantity;else quantityKnown=false;
      for(const cell of row.querySelectorAll(':scope > [data-label]')){const key=labels[cell.dataset.label],fact=cell.querySelector('[data-fact-id]');if(!key||!fact)continue;const current=value(record,key);
        if(!current.found){coverageGaps.push({kind:'NATIVE_WEAPON_FIELD_NOT_EXPOSED',occurrence,field:key});continue;}
        check('WEAPON_VALUE',parse(fact.dataset.factValue),current.value,{occurrence,field:key,factId:fact.dataset.factId});check('WEAPON_VISIBLE_TEXT',normal(fact.textContent),normal(current.value),{occurrence,field:key});counts.weaponValues++;
      }
      const name=row.querySelector('.weapon-name .weapon-button [data-fact-id]'),nativeName=value(record,'name');if(name&&nativeName.found)check('WEAPON_NAME',normal(name.textContent),normal(nativeName.value),{occurrence});
      const expectedAbilities=value(record,'abilities');
      if(expectedAbilities.found&&Array.isArray(expectedAbilities.value)){const nodes=[...row.querySelectorAll('.weapon-tags [data-fact-id]')],actual=nodes.map(node=>parse(node.dataset.factValue)).flatMap(value=>Array.isArray(value)?value:[value]).filter(value=>value!==undefined);check('WEAPON_ABILITIES',actual.map(String).sort(),expectedAbilities.value.map(String).sort(),{occurrence});for(const node of nodes){const fact=parse(node.dataset.factValue);check('WEAPON_ABILITY_VISIBLE_TEXT',normal(node.textContent),normal(typeof fact==='object'?JSON.stringify(fact):fact),{occurrence,factId:node.dataset.factId});}counts.weaponAbilities++;}
    }
    const quantity=normal(row.querySelector('.ds-weapon-quantity')?.textContent).match(/^×(\d+)$/);
    if(quantityKnown&&quantity){check('WEAPON_PHYSICAL_QUANTITY',Number(quantity[1]),expectedQuantity,{occurrences});counts.weaponQuantities++;}
    else if(quantityKnown)coverageGaps.push({kind:'WEAPON_QUANTITY_NOT_VISIBLE',occurrences,expectedQuantity});
  }
  for(const record of effective.weapons)if(record.physicalQuantity>0&&!seenWeapons.has(JSON.stringify([record.id,record.scopeId??null,record.selectionKey??null])))mismatch('NATIVE_WEAPON_NOT_DISPLAYED',{weaponId:record.id,scopeId:record.scopeId,selectionKey:record.selectionKey,physicalQuantity:record.physicalQuantity});
  const peers=state.units.filter(other=>other.canonicalUnitId===unit.canonicalUnitId),copyOrdinal=peers.findIndex(other=>other.instanceId===instanceId)+1;
  const priceNodes=[...card.querySelectorAll(':scope > .unit-header .ds-instance-price')].filter(visible);check('ROSTER_PRICE_COUNT',priceNodes.length,1);
  const priceText=normal(priceNodes[0]?.textContent),priceMatch=priceText.match(/^(\d+) models? · (?:(-?\d+) pts|(points unresolved))$/),displayedPoints=priceMatch?.[3]?null:priceMatch?Number(priceMatch[2]):undefined;
  if(priceMatch)check('ROSTER_PRICE_MODEL_COUNT',Number(priceMatch[1]),unit.startingStrength);else mismatch('ROSTER_PRICE_TEXT_UNRECOGNIZED',{priceText});
  const nativePrice=api.roster.points?.units?.find(row=>(row.unitInstanceId||row.instanceId)===instanceId)||null;
  const enhancementNodes=[...card.querySelectorAll(':scope > .unit-header .ds-instance-enhancement-price')].filter(visible),enhancements=effective.enhancements||[];check('ENHANCEMENT_PRICE_COUNT',enhancementNodes.length,enhancements.length);
  enhancements.forEach((enhancement,index)=>{const rule=payloadCards.get(enhancement.canonicalId),costs=(rule?.children||[]).map(id=>payloadCards.get(id)).filter(child=>['MFM_ENHANCEMENT_COST','ENHANCEMENT_COST_QUALIFIERS'].includes(child?.kind)),values=costs.flatMap(cost=>cost.fields.filter(field=>field.source?.path==='/value')),amount=values.length===1?values[0].value:enhancements.length===1?nativePrice?.enhancementPoints:undefined;
    if(amount===undefined){coverageGaps.push({kind:'ENHANCEMENT_PRICE_SOURCE_NOT_UNIQUE',enhancementId:enhancement.canonicalId,count:values.length});return;}
    check('ENHANCEMENT_PRICE_VISIBLE_TEXT',normal(enhancementNodes[index]?.textContent),normal(`+ ${amount??'?'} pts · ${rule.title}`),{enhancementId:enhancement.canonicalId,sourceFactId:values[0]?.id??null});
  });
  const priceCards=(payloadCards.get(unit.canonicalUnitId)?.children||[]).map(id=>payloadCards.get(id)).filter(card=>card?.kind==='MFM_UNIT_POINTS').map(card=>({id:card.id,pointsSchedule:card.pointsSchedule??null,...(card.provenance?{provenance:card.provenance}:{}),...(card.sourceRefs?{sourceRefs:card.sourceRefs}:{}),...(card.sourceBindings?{sourceBindings:card.sourceBindings}:{}),...(card.sourceOwnership?{sourceOwnership:card.sourceOwnership}:{}),fields:card.fields.map(field=>({path:field.source?.path,value:field.value}))}));
  return{checks,mismatches,coverageGaps,counts,copyOrdinal,modelCount:unit.startingStrength,displayedPoints,priceText,nativePrice,priceCards};
}

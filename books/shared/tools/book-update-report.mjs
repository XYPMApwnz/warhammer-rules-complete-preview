/** Read-only review of published gameplay values. This is not a factual owner. */
import assert from 'node:assert/strict';

const stable=value=>Array.isArray(value)?value.map(stable):value&&typeof value==='object'?Object.fromEntries(Object.keys(value).sort().map(key=>[key,stable(value[key])])):value;
const equal=(a,b)=>JSON.stringify(stable(a))===JSON.stringify(stable(b));
const plain=value=>String(value??'').replace(/\s+/g,' ').trim();
const sorted=values=>[...new Set(values)].sort((a,b)=>String(a).localeCompare(String(b),'en'));
const valueText=value=>value===undefined?'not present':value===null?'none':Array.isArray(value)?value.map(valueText).join(', '):typeof value==='object'?JSON.stringify(value):String(value);
const escape=value=>valueText(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('|','\\|').replaceAll('\n',' ');
const statLabels=new Map([['Move','M'],['Toughness','T'],['Save','Sv'],['Wounds','W'],['Leadership','Ld'],['Objective Control','OC'],['Invulnerable Save','Invulnerable save'],['Attacks','A'],['Strength','S'],['Damage','D']]);
const metadataSegments=new Set(['provenance','fieldProvenance','sourceAnchor','sourcePublication','sourcePartition','sourceSectionPointer','sourceSection','sourceReferences','sourceWeaponCellText','columnHeaderPointer','sharedColumnHeadersUsed','execution','ownership','profileBindingStatus','recipientBindingStatus','legalityValidationImplemented','sourceEntityId','sourceContentHash','sourceUnitContentHash','sourceOrder','captureSha256','sha256','contentHash','rawHtml']);
const pathParts=field=>(field.source?.path??field.id??'').split('/').filter(Boolean);
const fieldPath=field=>field.source?.path??field.id;
const metadataField=field=>pathParts(field).some(part=>metadataSegments.has(part)||/^(?:source|capture|content).*?(?:Hash|Sha256)$/.test(part));
const textField=field=>field.label==='Rule'||/(?:^|\/)(?:text|rawText|description)$/.test(fieldPath(field)||'');
const genericTitle=card=>plain(card.title).toUpperCase()===plain(card.kind).replaceAll('_',' ').toUpperCase();

/** A bounded changed-word excerpt, retaining nearby unchanged words. */
export function shortWordDiff(before,after,{context=4,maxChangedWords=36}={}){
 const a=plain(before).split(' ').filter(Boolean),b=plain(after).split(' ').filter(Boolean);
 let start=0;while(start<Math.min(a.length,b.length)&&a[start]===b[start])start++;
 let tail=0;while(tail<a.length-start&&tail<b.length-start&&a[a.length-1-tail]===b[b.length-1-tail])tail++;
 const trim=words=>words.length>maxChangedWords?[...words.slice(0,maxChangedWords),'…'].join(' '):words.join(' ');
 const prefix=a.slice(Math.max(0,start-context),start).join(' '),suffix=a.slice(a.length-tail,a.length-tail+context).join(' ');
 const removed=trim(a.slice(start,a.length-tail)),added=trim(b.slice(start,b.length-tail));
 return[(start>context?'… ':'')+prefix,removed?`[-${removed}-]`:'',added?`[+${added}+]`:'',suffix+(tail>context?' …':'')].filter(Boolean).join(' ');
}

function cardsOf(payload){
 assert(payload&&Array.isArray(payload.cards),'Gameplay report requires a decoded app-presentation payload with cards');
 const cards=new Map();for(const card of payload.cards){assert(typeof card.id==='string'&&!cards.has(card.id),'Duplicate or missing presentation card ID: '+card.id);cards.set(card.id,card);}return cards;
}
function titleTrail(card,cards){
 const result=[],seen=new Set();let current=card;
 while(current&&!seen.has(current.id)){
  seen.add(current.id);
  if(current.title&&!genericTitle(current))result.unshift(plain(current.title));
  const next=current.parentId&&current.parentId!==current.id?current.parentId:current.contextId!==current.id?current.contextId:null;
  current=next?cards.get(next):null;
 }
 return result.filter((title,index)=>index===0||title.toUpperCase()!==result[index-1].toUpperCase()).join(' · ')||card.title||card.id;
}
function fieldCategory(card,field){
 if(/keyword/i.test(fieldPath(field)||'')||/keyword/i.test(field.label||''))return'KEYWORDS';
 if(card.kind==='WEAPON_PROFILE')return'WEAPON';
 if(card.kind==='PROFILE')return'DATASHEET';
 if(card.kind.startsWith('MFM_'))return'POINTS';
 if(card.kind==='COMPOSITION_MEMBER'||/composition/i.test(card.title||''))return'COMPOSITION';
 return textField(field)?'RULE_TEXT':'RULE_VALUE';
}
function fieldLabel(card,field,fields){
 const pointer=fieldPath(field)||'',label=statLabels.get(field.label)||field.label||pointer;
 if(card.kind==='MFM_UNIT_POINTS'&&pointer.endsWith('/value')){
  const prefix=pointer.slice(0,-'/value'.length),row=fields.find(f=>fieldPath(f)===prefix+'/sourceLabel')?.value;
  const schedulePrefix=prefix.replace(/\/entries\/\d+$/,''),schedule=fields.find(f=>fieldPath(f)===schedulePrefix+'/sourceLabel')?.value;
  return[schedule&&schedule!=='YOUR UNIT COSTS'?schedule:null,row||'Points'].filter(Boolean).join(' · ');
 }
 // These source blocks carry their own heading before the colon. Read it
 // from this exact block, not from the bounded changed-word excerpt (which
 // can start far later in the rule). Separately named cards keep their title.
 const blockPointer=field.presentationPath||pointer;
 if(card.kind==='DATASHEET_SECTION'&&['ABILITIES','WARGEAR ABILITIES'].includes(card.title)&&field.label==='Rule'&&/^\/blocks\/\d+\/text$/.test(blockPointer)){
  const name=String(field.value).match(/^([\p{L}][^:\r\n]{0,119}):\s*\S/u);
  if(name)return name[1].trim();
 }
 if(textField(field)&&genericTitle(card)){
  const name=plain(field.value).match(/^([^:]{1,80}):/);
  if(name)return name[1];
 }
 return label;
}
function replaceOwnedMfmCard(card,owner,ownedIds){
 if(owner===undefined||!card.kind.startsWith('MFM_'))return false;
 const provenance=Array.isArray(card.provenance)?card.provenance:[card.provenance];
 const owners=new Set(provenance.map(p=>p?.sourceLocator?.factionId).filter(Boolean));
 // An inherited source remains a game value in this publication: its price is
 // absent from the supplied own-faction capture. Explicit foreign ownership
 // therefore takes precedence over caller coverage, including mixed witnesses.
 if(owners.size)return owners.size===1&&owners.has(owner);
 return ownedIds.has(card.id);
}
function recordSnapshot(payload,{mfmOwner,mfmOwnedIds=new Set()}={}){
 const cards=cardsOf(payload),records=new Map(),metadata={...payload,cards:{}};
 for(const card of cards.values()){
  const fields=card.fields||[],primary=fields.find(f=>fieldPath(f)==='/text'),values=new Map();
  const replaceMfm=replaceOwnedMfmCard(card,mfmOwner,mfmOwnedIds);
  const metaCard={...card,fields:{}};delete metaCard.title;
  for(const field of fields){
   const pointer=fieldPath(field);assert(typeof pointer==='string','Presentation field has no stable identity: '+card.id);
   const meta={...field};metaCard.fields[field.id||pointer]=meta;
   if(metadataField(field))continue;
   // Whole accepted text owns its derived list/eligibility copies.
   if(primary&&(pointer.startsWith('/listStructure/')||pointer==='/eligibilityText'&&plain(primary.value)===plain(field.value)))continue;
   if(field.presentation==='heading'||((pointer==='/name'||pointer==='/title'||pointer==='/label')&&plain(field.value)===plain(card.title)))continue;
   if(replaceMfm){delete meta.value;continue;}
   const grouped=field.type==='tokens'||field.type==='reference'&&/\/\d+$/.test(pointer);
   const localKey=grouped?pointer.replace(/\/\d+$/,''):pointer;
   const key=field.source?.entityId&&field.source.entityId!==card.id?field.source.entityId+'::'+localKey:localKey;
   const value=textField(field)?plain(field.value):field.value;
   if(grouped){
    const old=values.get(key);const next=[...(old?.value||[]),value];
    values.set(key,{value:sorted(next),rawValue:[...(old?.rawValue||[]),field.value],label:fieldLabel(card,field,fields),category:fieldCategory(card,field),text:false});
   }else{
    if(values.has(key)){assert(equal(values.get(key).value,value),'Conflicting gameplay field identity: '+card.id+' '+key);delete meta.value;continue;}
    values.set(key,{value,rawValue:field.value,label:fieldLabel(card,field,fields),category:fieldCategory(card,field),text:textField(field)});
   }
   delete meta.value;
  }
  metadata.cards[card.id]=metaCard;
  if(replaceMfm)continue;
  records.set(card.id,{id:card.id,kind:card.kind,parentId:card.parentId,contextId:card.contextId,title:card.title,label:titleTrail(card,cards),values});
 }
 // Compatibility is a visible game selection, not provenance.
 for(const row of payload.relatedRules?.rows||[]){
  const id='compatibility:'+JSON.stringify([row.unitId,row.ruleId,row.detachmentId]);
  const name=id=>cards.get(id)?.title||id;
  records.set(id,{id,kind:'COMPATIBILITY',label:`${name(row.unitId)} · ${name(row.ruleId)}`,values:new Map([
   ['applicability',{value:row.applicability,label:'Compatibility',category:'COMPATIBILITY'}],
   ['selectedDetachment',{value:row.selectedDetachment?.applicability,label:'Selected Detachment compatibility',category:'COMPATIBILITY'}]
  ])});
 }
 if(metadata.relatedRules)metadata.relatedRules={...metadata.relatedRules,rows:(metadata.relatedRules.rows||[]).map(row=>{
  const meta={...row};delete meta.applicability;delete meta.selectedDetachment;delete meta.state;delete meta.roles;return meta;
 })};
 return{records,metadata,cards};
}

function mfmSnapshot(capture){
 assert(capture&&Array.isArray(capture.units)&&Array.isArray(capture.detachments),'MFM report requires a faction capture with units and detachments');
 const records=new Map(),metadata={...capture};delete metadata.units;delete metadata.detachments;
 const put=(id,kind,label,values,parentId)=>{assert(!records.has(id),'Ambiguous MFM source occurrence: '+label);records.set(id,{id,kind,label,parentId,values:new Map(values)});};
 const field=(value,label,category='POINTS')=>({value,label,category,text:false});
 for(const unit of capture.units){
  // Source locators are exact. This report never guesses a rename or Army ID.
  const id='mfm-unit:'+JSON.stringify([unit.sourceGroup,unit.status,unit.title]),values=[];
  for(const schedule of unit.pointSchedules||[])for(const row of schedule.entries||[]){
   const key=JSON.stringify(['price',schedule.sourceLabel,schedule.minCopies??null,schedule.maxCopies??null,row.sourceLabel,row.minModels??null,row.maxModels??null]);
   const label=[schedule.sourceLabel!=='YOUR UNIT COSTS'?schedule.sourceLabel:null,row.sourceLabel||'Points'].filter(Boolean).join(' · ');
   values.push([key,field(row.value,label)]);
  }
  if(unit.relations)for(const [role,targets]of Object.entries(unit.relations))values.push(['relation:'+role,field(sorted(targets),role+' eligibility','RELATIONS')]);
  put(id,'MFM_POSITION',unit.title,values);
  for(const option of unit.paidOptions||[]){const label=option.sourceLabel||option.title;put('mfm-paid:'+JSON.stringify([id,option.sourceGroup,option.title,label]),'MFM_PAID_UPGRADE',`${unit.title} · ${option.title}`,[[label,field(option.value,label)]],id);}
 }
 for(const detachment of capture.detachments){
  const id='mfm-detachment:'+detachment.title;
  put(id,'MFM_DETACHMENT',detachment.title,[['points',field(detachment.detachmentPoints,'Detachment Points')],['forceDispositions',field(sorted(detachment.forceDispositions||[]),'Force Dispositions')],['qualifiers',field(detachment.qualifiers||[],'Qualifiers')]]);
  for(const item of detachment.enhancements||[]){
   put('mfm-enhancement:'+JSON.stringify([id,item.title]),'MFM_ENHANCEMENT_COST',`${detachment.title} · ${item.title}`,[['points',field(item.value,'Points')],['qualifiers',field(item.qualifiers||[],'Qualifiers')]],id);
  }
 }
 return{records,metadata};
}
function leafChanges(before,after){
 if(equal(before,after))return 0;
 if(before&&typeof before==='object'&&after&&typeof after==='object'&&Array.isArray(before)===Array.isArray(after)){
  return[...new Set([...Object.keys(before),...Object.keys(after)])].reduce((sum,key)=>sum+leafChanges(before[key],after[key]),0);
 }
 const leaves=value=>value&&typeof value==='object'?Object.values(value).reduce((sum,child)=>sum+leaves(child),0):1;
 return Math.max(leaves(before),leaves(after));
}
function ancestorChanged(record,records,changed){
 const seen=new Set([record.id]);let id=record.parentId||record.contextId;
 while(id&&!seen.has(id)){if(changed.has(id))return true;seen.add(id);const parent=records.get(id);id=parent?.parentId||parent?.contextId;}return false;
}
function changesBetween(before,after){
 const result=[],added=new Set([...after.keys()].filter(id=>!before.has(id))),removed=new Set([...before.keys()].filter(id=>!after.has(id)));
 for(const id of [...new Set([...before.keys(),...after.keys()])].sort()){
  const old=before.get(id),next=after.get(id),record=next||old;
  if(!old||!next){
   if(ancestorChanged(record,!old?after:before,!old?added:removed))continue;
   result.push({category:'POSITIONS',kind:!old?'ADDED':'REMOVED',entityId:id,label:record.label,before:old?.label,after:next?.label,summary:`${record.label} · ${!old?'added':'removed'}`});continue;
  }
  if(old.title!==next.title&&old.title!==undefined&&next.title!==undefined)result.push({category:'POSITIONS',kind:'CHANGED',entityId:id,field:'title',label:next.label,before:old.title,after:next.title,summary:`${next.label} · Name: ${old.title} → ${next.title}`});
  for(const key of [...new Set([...old.values.keys(),...next.values.keys()])].sort()){
   const a=old.values.get(key),b=next.values.get(key);if(equal(a?.value,b?.value))continue;
   const field=b||a,label=`${next.label} · ${field.label}`,text=field.text&&a&&b;
   result.push({category:field.category,kind:!a?'ADDED':!b?'REMOVED':'CHANGED',entityId:id,field:key,label,before:a?.value,after:b?.value,
    summary:`${label}: ${text?shortWordDiff(a.value,b.value):valueText(a?.value)+' → '+valueText(b?.value)}`});
  }
 }
 return result;
}

function representationChanges(before,after){
 let count=0;
 for(const[id,record]of before){const next=after.get(id);if(!next)continue;
  for(const[key,value]of record.values){const other=next.values.get(key);if(other&&equal(value.value,other.value)&&!equal(value.rawValue,other.rawValue))count++;}
 }
 return count;
}

/** Compare already-decoded snapshots. Optional own-faction MFM captures include
 * reference-only prices. mfmOwnedIds is an array/Set of exact own record IDs
 * from the accepted before/after registries, never names or inferred IDs. Only
 * proven own cards are replaced; foreign and unknown owners remain visible. */
export function compareBookGameplay({bookId,before,after,mfmBefore,mfmAfter,mfmOwnedIds}){
 assert(typeof bookId==='string'&&bookId,'A book ID is required');
 for(const payload of[before,after])if(payload?.book?.id)assert.equal(payload.book.id,bookId,'Gameplay report must not compare different book owners');
 assert((mfmBefore===undefined)===(mfmAfter===undefined),'Both MFM snapshots must be supplied together');
 const hasMfm=mfmBefore!==undefined;
 assert(mfmOwnedIds===undefined||Array.isArray(mfmOwnedIds)||mfmOwnedIds instanceof Set,'Own MFM record coverage must be an array or Set');
 const ownedIds=new Set(mfmOwnedIds||[]);
 assert([...ownedIds].every(id=>typeof id==='string'&&id.length>0),'Own MFM coverage contains an invalid record ID');
 assert(hasMfm||ownedIds.size===0,'Own MFM coverage requires both MFM snapshots');
 for(const capture of[mfmBefore,mfmAfter])if(capture?.factionId)assert.equal(capture.factionId,bookId,'MFM capture must belong to the requested book');
 const replacement={mfmOwner:hasMfm?bookId:undefined,mfmOwnedIds:ownedIds};
 const old=recordSnapshot(before,replacement),next=recordSnapshot(after,replacement);
 let changes=changesBetween(old.records,next.records),metadataChanges=leafChanges(old.metadata,next.metadata)+representationChanges(old.records,next.records);
 if(hasMfm){const a=mfmSnapshot(mfmBefore),b=mfmSnapshot(mfmAfter);changes.push(...changesBetween(a.records,b.records));metadataChanges+=leafChanges(a.metadata,b.metadata);}
 changes.sort((a,b)=>a.label.localeCompare(b.label,'en')||a.entityId.localeCompare(b.entityId,'en')||String(a.field||'').localeCompare(String(b.field||''),'en'));
 return{bookId,bookTitle:after.book?.title||before.book?.title||bookId,gameplayChanges:changes.length,metadataChanges,changes};
}

/** Render one review file. Child logs/error details are supplied by the runner. */
export function renderBookUpdateReport({status='PASS',elapsedMs=0,books=[],generatedChanges=[],fallbackReason,steps=[],error,baseHead,scope}={}){
 const lines=['# Book update report','',`Result: **${status}** · ${(elapsedMs/1000).toFixed(3)} seconds`,...(baseHead?['',`Comparison baseline: ${baseHead}`]:[])];
 if(fallbackReason)lines.push('',`Full plan selected: ${fallbackReason}`);
 if(scope)lines.push('',`Scope: ${scope}`);
 if(error)lines.push('','## Failure','',escape(error));
 for(const book of books){
  lines.push('',`## ${escape(book.bookTitle||book.bookId)}`,'');
  if(!book.changes.length)lines.push('No gameplay values changed.');
  else for(const change of book.changes)lines.push('- '+escape(change.summary));
  lines.push('',`Other publication-field changes (provenance, hashes and derived fields): ${book.metadataChanges}.`);
 }
 lines.push('','## Generated files','');
 if(!generatedChanges.length)lines.push('No generated files changed.');
 else{lines.push('| File | Change |','| --- | --- |');for(const file of generatedChanges)lines.push(`| ${escape(typeof file==='string'?file:file.file)} | ${escape(typeof file==='string'?'changed':file.kind||file.status||'changed')} |`);}
 if(steps.length){lines.push('','## Commands','', '| Book | Command | Result | Seconds |','| --- | --- | --- | --- |');for(const step of steps)lines.push(`| ${escape(step.book||'shared')} | ${escape(step.rebuild||step.command||step.producer||'')} | ${escape(step.status)} | ${((step.elapsedMs||0)/1000).toFixed(3)} |`);}
 return lines.join('\n')+'\n';
}

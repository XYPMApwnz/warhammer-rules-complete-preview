/** One transactional field/record interpreter. No book-specific mutation code. */
import assert from 'node:assert/strict';
export const OFFICIAL_SCHEMA='army-book-official-updates/v1';
export const ACTIONS=Object.freeze(['SET','ADD_FIELD','ADD_UNIQUE','ADD_RECORD','REMOVE_FIELD','REMOVE_RECORD','REPLACE_FRAGMENT','QUALIFY','VERIFY_CURRENT','UNRESOLVED_EVIDENCE']);
const TEXT=['text','description','body','lines','blocks','effect','target','when','duration','restrictions','abilities','rules','sourceText','label'];
const STAT=['M','T','SV','W','LD','OC','INSV','movement','toughness','save','wounds','leadership','objectiveControl','stats','profiles','profile'];
const WEAPON=['range','attacks','skill','bs','ws','strength','ap','damage','abilities','keywords','name','profile','profiles','weapons','A','BS','WS','S','AP','D'];
export const KIND_FIELDS=Object.freeze({DATASHEET_STAT:STAT,WEAPON_PROFILE:WEAPON,ABILITY_TEXT:TEXT,ARMY_RULE_TEXT:TEXT,DETACHMENT_RULE_TEXT:TEXT,ENHANCEMENT_TEXT:TEXT,STRATAGEM_TEXT:[...TEXT,'cp'],KEYWORDS:['keywords','factionKeywords','keywordGroups','categories'],RULE_ADD:['entities','records','rules','abilities','ruleReferences','referenceIds','ruleReferenceIds','abilityIds'],RULE_REMOVE:['entities','records','rules','abilities','ruleReferences','referenceIds','ruleReferenceIds','abilityIds'],FAQ:['entities','records','question','answer','text','lines'],SOURCE_METADATA:['title','sourceTypeLabel','officialEvidence','unresolvedSourceIds','status','suppressionProvenance','unresolvedSources']});
const forbidden=new Set(['__proto__','constructor','prototype']);
const object=value=>!!value&&typeof value==='object'&&!Array.isArray(value);
const copy=value=>structuredClone(value),has=(host,key)=>host!=null&&Object.hasOwn(host,key),isAbsent=value=>object(value)&&Object.keys(value).length===1&&value.$absent===true;
function fail(book,id,message){throw Error(`Official update ${book} · ${id}: ${message}`);}
function keys(value,allowed,required,book,id,label){if(!object(value))fail(book,id,label+': expected object');for(const key of Object.keys(value))if(!allowed.includes(key))fail(book,id,label+'.'+key+': unknown field');for(const key of required)if(!has(value,key))fail(book,id,label+'.'+key+': required field is missing');}
function fieldPath(value,book,id,label,{empty=false}={}){if(!Array.isArray(value)||(!empty&&!value.length)||value.some(k=>!(Number.isSafeInteger(k)&&k>=0||typeof k==='string'&&k&&!forbidden.has(k))))fail(book,id,label+': explicit safe field path required');}
function valueAt(root,path,book,id,label){let value=root;for(const key of path){if(!has(value,key))fail(book,id,label+': unresolved '+path.join('/'));value=value[key];}return value;}
function safeValue(value,book,id){if(value===null||typeof value!=='object')return;if(!Array.isArray(value))for(const key of Object.keys(value))if(forbidden.has(key))fail(book,id,'unsafe object key '+key);for(const child of Object.values(value))safeValue(child,book,id);}
const metadataRoots=new Set(['appliedOverlays','appliedOfficialUpdates','officialUpdates','officialReview','fieldProvenance','qualifications','officialEvidence','sourceAccounting','appliedCorrectionIds','unresolvedSourceIds','officialSupplementalChecks','universalChecks']);
function validateProjection(row,book,id){keys(row,['scope','mode','path','value','when'],['scope','mode','path','value'],book,id,'projection');if(!['root','entity'].includes(row.scope)||!['set','append'].includes(row.mode))fail(book,id,'unknown metadata projection');if(!Array.isArray(row.path)||!metadataRoots.has(row.path[0]))fail(book,id,'unknown metadata output field');if(row.when!==undefined&&row.when!=='*'&&(!Array.isArray(row.when)||row.when.some(x=>!ACTIONS.includes(x))))fail(book,id,'unknown projection action');safeValue(row.value,book,id);}
export function validateOfficialUpdates(document,{bookId=document?.bookId,stage}={}){
 const id='document';keys(document,['schema','bookId','stage','selection','order','initialize','projection','entries'],['schema','bookId','stage','selection','order','entries'],bookId,id,'document');
 if(document.schema!==OFFICIAL_SCHEMA||document.bookId!==bookId)fail(bookId,id,'schema or owner mismatch');if(!['canonical-facts','source-corpus'].includes(document.stage)||stage&&stage!==document.stage)fail(bookId,id,'stage does not match the book passport');
 const s=document.selection;keys(s,['collection','identity','data'],['collection','identity','data'],bookId,id,'selection');fieldPath(s.collection,bookId,id,'selection.collection',{empty:true});fieldPath(s.data,bookId,id,'selection.data',{empty:true});if(typeof s.identity!=='string'||forbidden.has(s.identity)||!s.identity)fail(bookId,id,'invalid identity field');
 if(!['declared','effective-date-id'].includes(document.order))fail(bookId,id,'unknown ordering');if(!Array.isArray(document.entries))fail(bookId,id,'entries must be an array');
 for(const row of document.initialize||[]){keys(row,['path','value'],['path','value'],bookId,id,'initialize');fieldPath(row.path,bookId,id,'initialize.path');if(!metadataRoots.has(row.path[0]))fail(bookId,id,'unknown initialized metadata field');safeValue(row.value,bookId,id);}
 for(const row of document.projection||[])validateProjection(row,bookId,id);
 const ids=new Set();for(const e of document.entries){
  keys(e,['id','source','target','kind','operation','expectedBefore','after','fragment','provenance','annotations','supersedes','projection'],['id','source','target','kind','operation','after'],bookId,e?.id||'entry','entry');if(typeof e.id!=='string'||!e.id||ids.has(e.id))fail(bookId,e.id,'duplicate or missing update id');ids.add(e.id);
  if(!ACTIONS.includes(e.operation))fail(bookId,e.id,'unknown operation '+e.operation);if(!Object.hasOwn(KIND_FIELDS,e.kind))fail(bookId,e.id,'unknown kind '+e.kind);
  if(!['ADD_FIELD','ADD_RECORD'].includes(e.operation)&&!has(e,'expectedBefore'))fail(bookId,e.id,'expectedBefore is required');
  keys(e.source,['id','document','version','page','authority','effectiveFrom','status','supersedes','sha256','locator'],['id','document','version','page','authority'],bookId,e.id,'source');for(const k of['id','document','version'])if(typeof e.source[k]!=='string'||!e.source[k])fail(bookId,e.id,'source.'+k+' is required');if(e.source.authority!=='OFFICIAL_GW')fail(bookId,e.id,'accepted official source required');if(!(e.source.page===null||Number.isSafeInteger(e.source.page)&&e.source.page>0||Array.isArray(e.source.page)&&e.source.page.length&&e.source.page.every(p=>Number.isSafeInteger(p)&&p>0)))fail(bookId,e.id,'invalid source page');
  keys(e.target,['id','sourceLocator','field','guards'],['field'],bookId,e.id,'target');if(Number(has(e.target,'id'))+Number(has(e.target,'sourceLocator'))!==1)fail(bookId,e.id,'exactly one stable target id or sourceLocator required');fieldPath(e.target.field,bookId,e.id,'target.field',{empty:e.operation==='REMOVE_RECORD'});
  if(e.target.id!==undefined&&(typeof e.target.id!=='string'||!e.target.id))fail(bookId,e.id,'invalid target id');
  if(e.target.sourceLocator){const locator=e.target.sourceLocator;keys(locator,['pointer','identityPath','identity','identityPointer'],['pointer','identityPath','identity'],bookId,e.id,'target.sourceLocator');fieldPath(locator.pointer,bookId,e.id,'sourceLocator.pointer',{empty:true});fieldPath(locator.identityPath,bookId,e.id,'sourceLocator.identityPath');if(locator.identityPointer!==undefined){fieldPath(locator.identityPointer,bookId,e.id,'sourceLocator.identityPointer',{empty:true});if(locator.identityPointer.length>locator.pointer.length||locator.identityPointer.some((key,index)=>key!==locator.pointer[index]))fail(bookId,e.id,'source identity must own the target locator');}}
  if(e.target.field.length&&!KIND_FIELDS[e.kind].includes(e.target.field[0]))fail(bookId,e.id,'unknown field '+e.target.field.join('/')+' for '+e.kind);
  if(e.kind==='STRATAGEM_TEXT'&&e.target.field[0]==='cp'&&e.operation!=='VERIFY_CURRENT')fail(bookId,e.id,'CP is verification-only in this update format');
  if(e.target.field.length>1&&typeof e.target.field.at(-1)==='string'&&!KIND_FIELDS[e.kind].includes(e.target.field.at(-1))&&e.target.field.at(-1)!=='value')fail(bookId,e.id,'unknown nested field '+e.target.field.join('/')+' for '+e.kind);
  for(const guard of e.target.guards||[]){keys(guard,['path','expected'],['path','expected'],bookId,e.id,'guard');fieldPath(guard.path,bookId,e.id,'guard.path');}
  if(e.operation==='REPLACE_FRAGMENT'){keys(e.fragment,['before','after'],['before','after'],bookId,e.id,'fragment');if(typeof e.fragment.before!=='string'||!e.fragment.before||typeof e.fragment.after!=='string'||typeof e.after!=='string')fail(bookId,e.id,'exact replacement fragment required');}
  if(['REMOVE_FIELD','REMOVE_RECORD'].includes(e.operation)&&!isAbsent(e.after))fail(bookId,e.id,'removal after must be the explicit absent value');
  for(const row of e.projection||[])validateProjection(row,bookId,e.id);safeValue(e,bookId,e.id);
 }return document;
}
function resolveTemplate(value,context,book,id){
 if(Array.isArray(value))return value.map(v=>resolveTemplate(v,context,book,id));if(!object(value))return copy(value);
 if(has(value,'$ref')){if(Object.keys(value).length!==1||typeof value.$ref!=='string')fail(book,id,'invalid metadata reference');const parts=value.$ref.split('.');if(!['entry','source','entity','before','effective','beforeExists'].includes(parts[0])||parts.some(k=>forbidden.has(k)))fail(book,id,'unknown metadata reference '+value.$ref);return copy(valueAt(context,parts,book,id,'metadata reference'));}
 if(has(value,'$join')){if(Object.keys(value).length!==1)fail(book,id,'invalid metadata join');const parts=resolveTemplate({$ref:value.$join},context,book,id);if(!Array.isArray(parts))fail(book,id,'metadata join expects a field path');return parts.join('/');}
 if(has(value,'$merge')){if(Object.keys(value).length!==1||!Array.isArray(value.$merge))fail(book,id,'invalid metadata merge');const out={};for(const item of value.$merge){const part=resolveTemplate(item,context,book,id);if(!object(part))fail(book,id,'metadata merge expects objects');Object.assign(out,part);}return out;}
 if(has(value,'$map')){if(Object.keys(value).length!==1||!object(value.$map)||!object(value.$map.values))fail(book,id,'invalid metadata map');const key=resolveTemplate(value.$map.value,context,book,id);if(!has(value.$map.values,key))fail(book,id,'unknown metadata map key '+key);return resolveTemplate(value.$map.values[key],context,book,id);}
 const out={};for(const[k,v]of Object.entries(value))out[k]=resolveTemplate(v,context,book,id);return out;
}
function metadata(root,entity,row,context,book,id){
 let host=row.scope==='root'?root:entity;const parts=row.path.map(part=>object(part)?resolveTemplate(part,context,book,id):part);fieldPath(parts,book,id,'metadata.path');
 for(const key of parts.slice(0,-1)){if(!has(host,key))host[key]={};if(!object(host[key])&&!Array.isArray(host[key]))fail(book,id,'metadata path is not an object');host=host[key];}
 const key=parts.at(-1),value=resolveTemplate(row.value,context,book,id);if(row.mode==='append'){if(!has(host,key))host[key]=[];if(!Array.isArray(host[key]))fail(book,id,'metadata append needs an array');host[key].push(value);}else host[key]=value;
}
function resolveTarget(model,selection,e,book){
 if(e.target.id==='@root')return{entity:model,data:model};
 if(e.target.sourceLocator){const l=e.target.sourceLocator,entity=valueAt(model,l.pointer,book,e.id,'target locator'),owner=l.identityPointer===undefined?entity:valueAt(model,l.identityPointer,book,e.id,'source owner');assert.deepEqual(valueAt(owner,l.identityPath,book,e.id,'source identity'),l.identity,`${book} · ${e.id}: source identity changed`);return{entity,data:valueAt(entity,selection.data,book,e.id,'target data')};}
 const list=valueAt(model,selection.collection,book,e.id,'target collection');if(!Array.isArray(list))fail(book,e.id,'target collection is not an array');const matches=list.map((entity,index)=>({entity,index})).filter(x=>x.entity[selection.identity]===e.target.id);if(matches.length!==1)fail(book,e.id,`target ${e.target.id}: expected exactly 1, found ${matches.length}`);const{entity,index}=matches[0];return{entity,data:valueAt(entity,selection.data,book,e.id,'target data'),collection:list,index};
}
export function applyOfficialUpdates(input,document,{bookId=document?.bookId,stage,sources}={}){
 validateOfficialUpdates(document,{bookId,stage});const model=copy(input),applied=[],writes=[];const context={entry:undefined,source:undefined,entity:undefined,before:undefined,effective:undefined,beforeExists:false};
 for(const row of document.initialize||[])metadata(model,model,{scope:'root',mode:'set',...row},context,bookId,'document');
 const entries=[...document.entries];if(document.order==='effective-date-id')entries.sort((a,b)=>(a.source.effectiveFrom||'').localeCompare(b.source.effectiveFrom||'')||a.id.localeCompare(b.id));
 for(const entry of entries){
  const source=sources?(()=>{const matches=sources.filter(s=>s.id===entry.source.id);if(matches.length!==1)fail(bookId,entry.id,'source must have exactly one accepted owner');return matches[0];})():entry.source;
  if(source.authority!=='OFFICIAL_GW')fail(bookId,entry.id,'accepted official source required');if(sources){if(entry.source.document!==(source.path||source.url)||entry.source.version!==source.versionOrDate||entry.source.effectiveFrom!==source.effectiveFrom)fail(bookId,entry.id,'official source identity/version/date changed');}
  const selected=resolveTarget(model,document.selection,entry,bookId),{entity,data}=selected;for(const guard of entry.target.guards||[])assert.deepEqual(valueAt(entity,guard.path,bookId,entry.id,'target guard'),guard.expected,`${bookId} · ${entry.id}: target guard changed (${guard.path.join('/')})`);
  const field=entry.target.field;let host=data;for(const part of field.slice(0,-1)){if(!has(host,part)||host[part]===null||typeof host[part]!=='object')fail(bookId,entry.id,'unresolved field '+field.join('/'));host=host[part];}
  const key=field.at(-1),exists=field.length?has(host,key):true,before=copy(field.length?host[key]:entity);
  if(has(entry,'expectedBefore')){const matches=isAbsent(entry.expectedBefore)?!exists:(()=>{try{assert.deepEqual(before,entry.expectedBefore);return exists;}catch{return false;}})();if(!matches)fail(bookId,entry.id,`GW update no longer matches: ${bookId} · ${entry.target.id||entry.target.sourceLocator.identity} · ${field.join('/')}: expected ${JSON.stringify(entry.expectedBefore)}, found ${exists?JSON.stringify(before):'<absent>'}`);}
  if(!['VERIFY_CURRENT','UNRESOLVED_EVIDENCE'].includes(entry.operation)){
   const writeField=entry.operation==='ADD_RECORD'?[...field,entry.after[document.selection.identity]]:field;
   const previous=writes.filter(p=>p.target===JSON.stringify(entry.target.id??entry.target.sourceLocator.pointer)&&p.field.slice(0,Math.min(p.field.length,writeField.length)).every((x,i)=>String(x)===String(writeField[i])));
   for(const p of previous)if(!entry.supersedes?.includes(p.id)&&!(source.supersedes?.includes(p.sourceId)&&p.sourceStatus==='SUPERSEDED'))fail(bookId,entry.id,'conflicting current updates or ambiguous precedence');writes.push({id:entry.id,target:JSON.stringify(entry.target.id??entry.target.sourceLocator.pointer),field:writeField,sourceId:source.id,sourceStatus:source.status});
  }
  switch(entry.operation){
   case'SET':if(!exists)fail(bookId,entry.id,'replacement target missing');host[key]=copy(entry.after);break;
   case'ADD_FIELD':if(exists)fail(bookId,entry.id,'duplicate independent ownership');host[key]=copy(entry.after);break;
   case'ADD_UNIQUE':if(!exists||!Array.isArray(host[key]))fail(bookId,entry.id,'ADD_UNIQUE requires an existing array');for(const value of Array.isArray(entry.after)?entry.after:[entry.after])if(!host[key].some(item=>{try{assert.deepEqual(item,value);return true;}catch{return false;}}))host[key].push(copy(value));break;
   case'ADD_RECORD':if(!exists||!Array.isArray(host[key])||!object(entry.after)||!entry.after[document.selection.identity])fail(bookId,entry.id,'ADD_RECORD requires an explicit record and collection');if(host[key].some(x=>x[document.selection.identity]===entry.after[document.selection.identity]))fail(bookId,entry.id,'duplicate record identity');host[key].push(copy(entry.after));break;
   case'REMOVE_FIELD':if(!exists)fail(bookId,entry.id,'removal target missing');delete host[key];break;
   case'REMOVE_RECORD':if(!selected.collection)fail(bookId,entry.id,'record removal needs an identity target');selected.collection.splice(selected.index,1);break;
   case'REPLACE_FRAGMENT':if(typeof before!=='string'||before.split(entry.fragment.before).length!==2)fail(bookId,entry.id,'replacement fragment absent or ambiguous');if(before.replace(entry.fragment.before,entry.fragment.after)!==entry.after)fail(bookId,entry.id,'fragment replacement does not produce declared after');host[key]=copy(entry.after);break;
   case'VERIFY_CURRENT':if(!exists)fail(bookId,entry.id,'verified target missing');assert.deepEqual(before,entry.after,`${bookId} · ${entry.id}: VERIFY_CURRENT after contradicts current value`);break;
   case'QUALIFY':case'UNRESOLVED_EVIDENCE':if(!exists)fail(bookId,entry.id,'verified/qualified target missing');break;
  }
  const effective=copy(entry.operation==='REMOVE_RECORD'?undefined:field.length?host[key]:entity);Object.assign(context,{entry,source,entity,before,effective,beforeExists:exists});
  for(const row of[...(document.projection||[]),...(entry.projection||[])])if(row.when===undefined||row.when==='*'||row.when.includes(entry.operation))metadata(model,entity,row,context,bookId,entry.id);
  // A new record has no previous record. Do not turn an audit row into a copy
  // of the entire Army Book merely because the collection owns the addition.
  applied.push({id:entry.id,bookId,kind:entry.kind,operation:entry.operation,source:copy(entry.source),target:copy(entry.target),before:entry.operation==='ADD_RECORD'?undefined:before,after:copy(entry.after),effective:entry.operation==='ADD_RECORD'?copy(entry.after):effective});
 }
 return{model,applied};
}

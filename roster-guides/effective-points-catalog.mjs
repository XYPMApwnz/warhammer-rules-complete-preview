import path from 'node:path';
import {createCanonicalBuildContext} from '../books/shared/tools/canonical-build-contract.mjs';
import {buildCanonicalBook as buildSharedCanonicalBook} from '../books/shared/tools/build-army-book.mjs';
import {assertEffectivePointsProjection} from '../books/shared/tools/effective-points-projection.mjs';
import {pointTierContract} from '../books/shared/tools/point-tier-contract.mjs';

const normalize=value=>String(value||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
export const bookIds=['death-guard','adeptus-mechanicus','tyranids','tau-empire','emperors-children','chaos-space-marines','space-marines','blood-angels','dark-angels'];
const catalogKeys={'death-guard':'death guard','adeptus-mechanicus':'adeptus mechanicus','tyranids':'tyranids','tau-empire':'t au empire','emperors-children':'emperor s children','chaos-space-marines':'chaos space marines','space-marines':'space marines','blood-angels':'blood angels','dark-angels':'dark angels'};

export async function loadEffectivePointsProjection(root,bookId){
  const configPath=path.join(root,'books',bookId,'book.config.json'),context=createCanonicalBuildContext({configPath});
  return assertEffectivePointsProjection((await buildSharedCanonicalBook(context,{projectionOnly:true})).effectivePointsProjection,bookId);
}

const unitRecord=unit=>({...unit.publicationRecord,wargear:unit.paidWargear||[],...(unit.compatibleChapterKeywords?.length?{compatibleChapterKeywords:[...unit.compatibleChapterKeywords]}:{}),...unit.ruleProfile,points:unit.points});
const detachmentRecord=item=>{const source=item.publicationRecord||{};return{id:item.id,title:source.title||item.title,detachmentPoints:item.detachmentPoints,forceDispositions:source.forceDispositions||item.forceDispositions||[source.forceDisposition||source.disposition||item.forceDisposition].filter(Boolean),forceDispositionIds:source.forceDispositionIds||item.forceDispositionIds||[],mfmForceDispositionIds:source.mfmForceDispositionIds||item.mfmForceDispositionIds||[],missionForceDispositionIds:source.missionForceDispositionIds||item.missionForceDispositionIds||[],forceDisposition:source.forceDisposition||source.disposition||item.forceDisposition||''};};
const identityRecord=item=>({...item.publicationRecord,...item.compatibilityIdentity});
const groupedEnhancements=(items,recordOf,aliasesOf=()=>[])=>{
  const groups=new Map();
  for(const item of items){const compatibility=recordOf(item),id=compatibility.id||item.id,canonicalTags=item.tags||[],record={...compatibility,id,detachmentId:item.detachmentId,title:item.title,value:item.value,text:item.text||'',tags:Object.hasOwn(compatibility,'tags')||canonicalTags.length?canonicalTags:undefined,owner:item.owner||undefined,assignment:item.assignment||undefined,...(item.sourceLimited?{sourceLimited:true}:{})},keys=[...new Set([record.title,...aliasesOf(item,record)].map(normalize).filter(Boolean))];for(const key of keys){const group=groups.get(key)||[];group.push(record);groups.set(key,group);}}
  return Object.fromEntries([...groups].map(([key,records])=>[key,records.length===1?records[0]:records]));
};
const upgradeAliases=title=>{const base=String(title||'').replace(/\s*\(Upgrade\)\s*$/i,'').replace(/\s+Upgrade$/i,'');return[...new Set([base,`${base} Upgrade`,`${base} (Upgrade)`])].filter(value=>normalize(value)!==normalize(title));};
const enhancementRecords=(bookId,items)=>{
  if(bookId==='death-guard')return groupedEnhancements(items,item=>item.publicationRecord,item=>item.aliases||item.publicationRecord.aliases||[]);
  if(bookId==='adeptus-mechanicus')return groupedEnhancements(items,item=>item.publicationRecord,(item,record)=>[...(record.title==='Autoclavic Denunciation'?['Autoclavic Denounciation']:[]),...(record.title==='TL-4Ø9'?['TL-409']:[]),...(record.title==='Stealth-screened Cybercanids Upgrade'?['Stealth-screened Cybercanids']:[]),...((record.tags||[]).includes('UPGRADE')?[`${record.title.replace(/\s+Upgrade$/i,'')} (Upgrade)`]:[])]);
  if(['tyranids','tau-empire'].includes(bookId))return groupedEnhancements(items,item=>({...item.publicationRecord,tags:item.tags||[],owner:item.owner||null,assignment:item.assignment||null}),item=>upgradeAliases(item.title));
  if(bookId==='emperors-children')return groupedEnhancements(items,identityRecord,item=>item.aliases||[]);
  return groupedEnhancements(items,identityRecord);
};
const normalizePointUnits=units=>Object.fromEntries(units.map(unit=>[normalize(unit.title),unit.points?.length>1?{...unitRecord(unit),points:pointTierContract.normalizeTiers(unit.points)}:unitRecord(unit)]));
const rawPointUnits=units=>Object.fromEntries(units.map(unit=>[normalize(unit.title),unitRecord(unit)]));
const projectionPointUnits=projection=>[...projection.units,...(projection.alliedUnits||[])];

export function createPointsCatalogFromProjections(projections){
  if(!(projections instanceof Map))throw new Error('effective points projections must be provided as a Map');
  for(const bookId of bookIds)assertEffectivePointsProjection(projections.get(bookId),bookId);
  const rawCatalog=Object.fromEntries(bookIds.map(bookId=>{const projection=projections.get(bookId);return[catalogKeys[bookId],{units:rawPointUnits(projectionPointUnits(projection)),enhancements:enhancementRecords(bookId,projection.enhancements),detachments:Object.fromEntries(projection.detachments.map(item=>[normalize(item.title),detachmentRecord(item)]))}];}));
  const catalog=Object.fromEntries(Object.entries(rawCatalog).map(([book,records])=>[book,{...records,units:normalizePointUnits(projectionPointUnits(projections.get(bookIds.find(id=>catalogKeys[id]===book))))}]));
  return {catalog,rawCatalog,projections};
}

export async function createPointsCatalog(root){
  const projections=new Map();
  for(const bookId of bookIds)projections.set(bookId,await loadEffectivePointsProjection(root,bookId));
  return createPointsCatalogFromProjections(projections);
}

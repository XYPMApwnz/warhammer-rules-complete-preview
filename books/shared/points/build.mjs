import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createPointsCatalog} from './effective-catalog.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../..');

// Retained as the compatibility resolution API used by focused legality QA.
// The points builder itself now receives this identity in the effective projection.
export function resolveEnhancementOwner(enhancement,catalog,contracts={}){
  const normalize=value=>String(value||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
  const identity=(value,detachmentId='')=>{
    let id=String(value||'').toLowerCase().trim().replace(/^enhancement-/,'');
    const detachment=String(detachmentId).toLowerCase().replace(/^detachment-/,'');
    if(detachment&&id.startsWith(detachment+'-'))id=id.slice(detachment.length+1);
    return id.replace(/[^a-z0-9]/g,'');
  };
  const ids=item=>[item.id,item.ruleId,item.sourceId,item.legacyKey].filter(Boolean);
  const detachments=catalog.detachments.filter(item=>enhancement.detachmentId?item.id===enhancement.detachmentId:normalize(item.title)===normalize(enhancement.detachment));
  if(detachments.length!==1||!enhancement.id)return {sourceLimited:true};
  const detachment=detachments[0];
  const matches=(item,detachmentId)=>ids(item).some(id=>identity(id,detachmentId)===identity(enhancement.id,detachmentId));
  const candidates=catalog.enhancements.filter(item=>item.detachmentId===detachment.id&&matches(item,detachment.id));
  if(candidates.length!==1)return {sourceLimited:true};
  const canonical=candidates[0],keys=new Set(ids(canonical).map(id=>identity(id,detachment.id)));
  const exact=Object.entries(contracts).filter(([id])=>ids(canonical).includes(id));
  const related=exact.length?exact:Object.entries(contracts).filter(([id])=>keys.has(identity(id,detachment.id)));
  const contract=related.length===1?related[0][1]:null;
  const owned=canonical.owner||contract?.owner;
  const roles=(contract?.roles||[]).filter(role=>role.side==='friendly'&&['unit','model'].includes(role.subject));
  const owner=owned?.selector?owned:roles.length===1&&roles[0].selector?{subject:roles[0].subject,selector:roles[0].selector}:null;
  const assignment=canonical.assignment||contract?.assignment,tags=canonical.tags||contract?.tags;
  return {
    canonicalEnhancementId:canonical.id,canonicalDetachmentId:detachment.id,
    ...(owner?{owner}:{}),...(assignment?{assignment}:{}),...(tags?{tags}:{}),
    ...(!owner||canonical.sourceLimited||contract?.sourceLimited?{sourceLimited:true}:{})
  };
}

const {catalog,rawCatalog,projections}=await createPointsCatalog(root);
export {catalog,rawCatalog,projections};

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const outputPath=path.join(root,'books/shared/points','points-data.js'),output=`window.WH_POINTS_CATALOG=Object.freeze(${JSON.stringify(catalog)});\n`,check=process.argv.includes('--check');
  if(check){
    if(!fs.existsSync(outputPath)||fs.readFileSync(outputPath,'utf8')!==output)throw new Error('points-data.js is stale');
  }else fs.writeFileSync(outputPath,output);
  const unitCounts=[...projections.values()].map(projection=>`${projection.units.length} ${projection.book.title}`);
  console.log(`Points catalog ${check?'verified':'written'}: ${unitCounts.join(', ')} units.`);
}

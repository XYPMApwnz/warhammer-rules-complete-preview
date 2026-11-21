/** Historical report inputs follow explicit source witnesses, never title guesses. */
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
const git=(root,args)=>execFileSync('git',['-C',root,...args],{encoding:'utf8',maxBuffer:96*1024*1024});
const read=(root,ref,file)=>JSON.parse(git(root,['show',ref+':'+file]));
/** Exact ownership comes from the accepted release registry, including removed rows. */
export function ownedMfmRecordIds({root,head,bookId,passport,version}){
 const pointerFile=passport.mfm.currentRelease;
 const refs=[head,...git(root,['log','--format=%H',head,'--',pointerFile]).trim().split(/\r?\n/).filter(Boolean)];
 for(const ref of new Set(refs)){
  const pointer=read(root,ref,pointerFile);if(pointer.version!==version)continue;
  const registry=read(root,ref,pointer.identityRegistryPath),bindings=registry.factionBindings.filter(b=>b.factionId===bookId);
  assert.equal(bindings.length,1,'No unique MFM ownership declaration: '+bookId+' / '+version);
  const ids=new Set(),visit=value=>{if(typeof value==='string'&&value.startsWith('mfm-'))ids.add(value);else if(Array.isArray(value))value.forEach(visit);else if(value&&typeof value==='object')Object.values(value).forEach(visit);};
  visit(bindings[0]);return [...ids].sort();
 }
 throw Error('No accepted MFM pointer history for report ownership: '+bookId+' / '+version);
}
export function publishedMfmSnapshot({root,head,bookId,passport,payload,sourceRegistryPath}){
 const policy=passport.update.mfmBaseline;
 assert.equal(policy.strategy,'published-source-or-manifest','Unknown MFM report baseline policy');
 const candidates=[...Object.values(payload.bookPresentation?.records||{}).map(r=>r.mfmProvenance),...payload.cards.map(c=>c.provenance)]
  .filter(p=>p?.sourceLocator?.factionId===bookId&&p.sourceCaptureSha256&&p.sourceId);
 let sourceIds,ref=head,method;
 if(candidates.length){
  sourceIds=[...new Set(candidates.map(p=>p.sourceId))];assert.equal(sourceIds.length,1,'Published own MFM witnesses disagree: '+bookId);
  assert.equal(new Set(candidates.map(p=>p.sourceCaptureSha256)).size,1,'Published MFM capture witnesses disagree: '+bookId);method='published-source-witness';
 }else{
  // Some retained projections have no current-MFM provenance. Their source
  // enrollment at the publication's actual Git commit is the explicit fallback.
  ref=git(root,['log','-1','--format=%H',head,'--',passport.update.reportArtifact]).trim();
  assert(ref,'No publication history: '+bookId);
  const manifest=read(root,ref,passport.sources.manifest);
  sourceIds=[...(manifest.layers||[]),...(manifest.sources||[])].filter(s=>s.active!==false&&s.authority===policy.authority).map(s=>s.sourceId||s.id);method='accepted-manifest-at-publication-commit';
 }
 const registry=read(root,ref,sourceRegistryPath),captures=[];
 for(const sourceId of sourceIds){
  const sources=registry.sources.filter(s=>s.sourceId===sourceId&&s.book===bookId);
  assert.equal(sources.length,1,'Historical MFM source is not registered exactly once: '+sourceId);
  for(const artifact of sources[0].artifacts.filter(a=>a.path.endsWith('.json'))){
   const capture=read(root,ref,artifact.path);
   if(capture.factionId===bookId&&Array.isArray(capture.units)&&Array.isArray(capture.detachments)){
    assert.equal(sources[0].authority,policy.authority,'Historical own MFM authority mismatch: '+sourceId);
    captures.push({capture,sourceId,file:artifact.path,ref,method});
   }
  }
 }
 assert.equal(captures.length,1,'No unique accepted MFM capture for publication: '+bookId);
 if(candidates.length)assert(candidates.every(p=>p.sourceCaptureSha256.toLowerCase()===captures[0].capture.captureSha256.toLowerCase()),'Published MFM capture hash mismatch: '+bookId);
 return captures[0];
}

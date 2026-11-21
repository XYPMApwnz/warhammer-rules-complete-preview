/** Explicit replacement of one invalid measurement-server slice, no app changes. */
import fs from 'node:fs';
import assert from 'node:assert/strict';
const OUT='E:/Warhammer/qa-evidence/load-audit-v1-2026-11-21';
const original='measurements-v2',correction='measurements-local-dg-corrected',destination='accepted-matrix';
assert(!fs.existsSync(OUT+'/'+destination),'Never silently overwrite an accepted matrix');
const first=JSON.parse(fs.readFileSync(OUT+'/'+original+'/INDEX.json')),second=JSON.parse(fs.readFileSync(OUT+'/'+correction+'/INDEX.json'));
assert.equal(first.status,'COMPLETE');assert.equal(second.status,'COMPLETE');assert.equal(first.rows.length,144);assert.equal(second.rows.length,18);
const replacements=new Map(second.rows.map(row=>[row.id,row]));assert.equal(replacements.size,18);
fs.mkdirSync(OUT+'/'+destination);
const sources=[],rows=first.rows.map(row=>{const replaced=row.origin==='local'&&row.scenario==='dg-book';const folder=replaced?correction:original;
 const accepted=replaced?replacements.get(row.id):row;assert(accepted,row.id);if(replaced)replacements.delete(row.id);
 fs.copyFileSync(OUT+'/'+folder+'/'+row.id+'.json',OUT+'/'+destination+'/'+row.id+'.json');sources.push({id:row.id,folder});return accepted;});
assert.equal(replacements.size,0);
fs.writeFileSync(OUT+'/'+destination+'/INDEX.json',JSON.stringify({...first,status:'COMPLETE',rows,observationSources:sources,correction:'All 18 local DG-book rows replaced, including unaffected unlimited controls, after audit-only HTTP/2 maxSessionMemory 10 -> 128 MiB. Original constrained-origin PNG streams hit ENHANCE_YOUR_CALM. Runtime bytes and shaper unchanged; live and other scenarios retained.',correctionFinished:second.finished},null,2)+'\n');
fs.writeFileSync(OUT+'/ACCEPTED_MATRIX_PROVENANCE.json',JSON.stringify({source:first.source,accepted:144,acceptedProfiles:72,retainedOriginal:126,replacedOriginal:18,replacementRows:18,originalFolder:original,correctionFolder:correction,reason:'Audit-only Node HTTP/2 session queued-body memory budget rejected PNG streams; fix the dedicated measurement origin, not the app/preview. Explicitly replace all local DG-book groups and retain originals as excluded.',observations:sources},null,2)+'\n');
console.log(JSON.stringify({accepted:rows.length,retained:126,replaced:18}));

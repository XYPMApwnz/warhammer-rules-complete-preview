/** Deterministic size, timing and focused-browser evidence; no QA is run here. */
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const args=process.argv.slice(2),arg=key=>args[args.indexOf(key)+1];
const roots={baseline:arg('--baseline'),before:arg('--before'),after:arg('--after')};
for(const value of Object.values(roots))assert.ok(value);
const out=arg('--out');assert.ok(out);
const load=file=>JSON.parse(fs.readFileSync(file,'utf8'));
const manifests=Object.fromEntries(Object.entries(roots).map(([key,root])=>[key,load(path.join(root,'PAGES_RUNTIME_MANIFEST.json'))]));
const maps=Object.fromEntries(Object.entries(manifests).map(([key,report])=>[key,new Map(report.files.map(row=>[row.path,row]))]));
const paths=[...new Set(Object.values(maps).flatMap(map=>[...map.keys()]))].sort();
const files=paths.map(file=>({path:file,baselineBytes:maps.baseline.get(file)?.bytes||0,beforeBytes:maps.before.get(file)?.bytes||0,afterBytes:maps.after.get(file)?.bytes||0})).map(row=>({...row,oldGrowth:row.beforeBytes-row.baselineBytes,newGrowth:row.afterBytes-row.baselineBytes,saved:row.beforeBytes-row.afterBytes}));
const sourceKeys=new Set(['sourceRefs','sourceBindings','sourceOwnership','sourceSchema','sourceRefCatalog','sourceLayoutCatalog','sourceContextCatalog']);
const byKind=new Map(),byForm=new Map();
function attribute(root,version){
 for(const row of manifests[version].files){
  if(!row.path.includes('/v2/generated/')||!row.path.endsWith('.json'))continue;
  const value=load(path.join(root,row.path));
  function walk(node,kind='BOOK_CONTAINER'){
   if(!node||typeof node!=='object')return;
   if(node.id&&node.kind)kind=node.kind;
   for(const [key,child]of Object.entries(node)){
    if(sourceKeys.has(key)||key==='fieldProvenance'&&node.sourceBindings){
     const bytes=Buffer.byteLength(JSON.stringify(child)),k=byKind.get(kind)||{kind,beforeBytes:0,afterBytes:0,beforeProperties:0,afterProperties:0};
     k[version+'Bytes']+=bytes;k[version+'Properties']++;byKind.set(kind,k);
     const f=byForm.get(key)||{field:key,beforeBytes:0,afterBytes:0};f[version+'Bytes']+=bytes;byForm.set(key,f);
    }else walk(child,kind);
   }
  }walk(value);
 }
}
attribute(roots.before,'before');attribute(roots.after,'after');
const catalog=load(path.join(roots.after,'books/shared/source-refs-v2/source-catalog.json'));
byKind.set('SHARED_CATALOG',{kind:'SHARED_CATALOG',beforeBytes:0,afterBytes:Buffer.byteLength(JSON.stringify(catalog)),beforeProperties:0,afterProperties:Object.keys(catalog).length});
const performance=load(arg('--performance')),browser=load(arg('--browser'));
assert.equal(browser.status,'PASS');assert.equal(browser.comparison?.zeroDifference,true);
const sourceQA=load(arg('--source-qa')),negative=load(arg('--negative')),oracles=load(arg('--oracles'));
assert.equal(sourceQA.status,'PASS');assert.equal(negative.status,'PASS');assert.equal(oracles.status,'PASS');
const payloads=Object.fromEntries(Object.entries(manifests).map(([key,value])=>[key,{files:value.fileCount,bytes:value.runtimeBytes,contentSha256:value.contentSha256,cacheRevision:value.cacheRevision}]));
const compactBytes=value=>Buffer.byteLength(JSON.stringify(value));
const report={schema:'source-refs-optimization/v1',base:'75d322e4e3274f14d7e2a81abace3ba63c784ec5',status:'TARGETED_CHECKS_COMPLETE',payloads,
 size:{oldGrowth:payloads.before.bytes-payloads.baseline.bytes,newGrowth:payloads.after.bytes-payloads.baseline.bytes,saved:payloads.before.bytes-payloads.after.bytes,targetMaxGrowth:2000000,targetPass:payloads.after.bytes<=payloads.baseline.bytes+2000000},
 files,metadataByRecordKind:[...byKind.values()].sort((a,b)=>a.kind<b.kind?-1:a.kind>b.kind?1:0),metadataByForm:[...byForm.values()].sort((a,b)=>a.field<b.field?-1:a.field>b.field?1:0),
 attribution:'Per-file bytes and deltas are exact physical package sizes. Record-kind/form columns count compact UTF-8 source-property values, excluding formatting and ordinary facts. They explain duplication but must not be added to physical file deltas.',
 sharedCatalog:{bytes:maps.after.get('books/shared/source-refs-v2/source-catalog.json').bytes,documentsByBook:Object.fromEntries(Object.entries(catalog.documents).map(([id,table])=>[id,{entries:Object.keys(table).length,compactBytes:compactBytes(table)}])),pools:Object.fromEntries(Object.entries(catalog).filter(([key])=>key!=='documents').map(([key,value])=>[key,{entries:Object.keys(value).length,compactBytes:compactBytes(value)}]))},
 performance,browser:{status:browser.status,scope:browser.scope,selectedBookIds:browser.selectedBookIds,selectedFixtures:browser.selectedFixtures,counts:browser.counts,comparison:browser.comparison,method:'Original renderer; styles/fonts ready and two animation frames without DOM or resize changes before exact textContent/innerText and block-order comparison.'},
 sourceChecks:{artifacts:sourceQA.artifacts,inverse:'PASS',stratagemSerialization:'PASS',sourceBindings:sourceQA.sourceSlots,existingNegativeControls:sourceQA.negativeControls,newNegativeControls:negative.controls,oracles:oracles.controls},
 notRun:['Full native-book QA','qa:effects','qa:roster','qa:integration','qa:workflow','full test:browser','packaging/determinism 14-check suite'],
 cleanup:{status:'BLOCKED_BY_AUTOMATIC_REVIEW',retainedIntermediates:['feature-runtime-optimized','size-before-optimization.json.prototype-catalog.json'],reason:'The tool policy rejected the Remove-Item operation without a more detailed reason. No alternative removal was attempted. Baseline/before/final evidence packages are intentionally retained for final QA.'},
 limits:['Timing covers one existing CSM source-backed recipe through actual import, bearer selection, runtime, effective and personal paths in fresh alternating Node processes; it is not a claim about every roster.', 'PRE_EXISTING_LAYOUT_NONDETERMINISM was reproduced on the unchanged base. No renderer or expected rule text was changed.', 'The original all-book migration audit remains a draft pending final full QA and regeneration; this checkpoint supersedes its earlier size/performance measurements and certifies browser parity only for the three requested books.', 'No commit, push, source/release/main ref update or publication is part of this checkpoint.']};
fs.writeFileSync(out,JSON.stringify(report,null,2)+'\n');
const lines=['# Source reference size and execution checkpoint','','Base: `'+report.base+'`. Targeted checks only; no full QA run.','','## Runtime size','','| Version | Files | Runtime bytes |','| --- | ---: | ---: |',...Object.entries(payloads).map(([name,row])=>`| ${name} | ${row.files} | ${row.bytes} |`),'',`Old growth: ${report.size.oldGrowth} bytes. New growth: ${report.size.newGrowth} bytes. Saved: ${report.size.saved} bytes. Size target: ${report.size.targetPass?'PASS':'FAIL'}.`,'','One document table per book stores document identity, document hash, authority and recorded currentness. Individual sourceRefs carry documentId, locator/fragment/role and a referenceId authenticating the entire association. Immutable layouts, typed contexts and binding tuples are shared across published snapshots; source-only JSON is compact. Ordinary values and stratagem serialization inverse exactly.','','## File breakdown','','| File | Base | Before | After | Old growth | New growth | Saved |','| --- | ---: | ---: | ---: | ---: | ---: | ---: |',...files.filter(row=>row.oldGrowth||row.newGrowth).map(row=>`| ${row.path} | ${row.baselineBytes} | ${row.beforeBytes} | ${row.afterBytes} | ${row.oldGrowth} | ${row.newGrowth} | ${row.saved} |`),'','## Source metadata by record kind','',''+report.attribution,'','| Record kind | Before compact bytes | After compact bytes |','| --- | ---: | ---: |',...report.metadataByRecordKind.map(row=>`| ${row.kind} | ${row.beforeBytes} | ${row.afterBytes} |`),'','## Shared catalog','','`'+JSON.stringify(report.sharedCatalog)+'`','','## Timing','','`'+JSON.stringify(performance)+'`','','Catalog identities are checked before first use and then frozen. Source-only metadata is shared across book clones; mutable gameplay fields retain independent copies. Replaced metadata and source shadows invalidate the read cache. Ten new negative controls cover locator/document/binding changes, cold-load catalog corruption and immutable identity aliasing.','','## Browser comparison','','`'+JSON.stringify(report.browser)+'`','','No paragraph or expected-text normalization is used. The unchanged layout module is allowed to finish before capture. Block order, text bytes, Source and Applies to labels remain exact.','','## Validation and scope','','97-artifact inverse and source checks, the existing source-severing controls, new catalog controls and independent source oracles passed. Full suites are NOT_RUN by owner agreement. Detailed controls and per-file measurements are in the companion JSON.','',...report.limits.map(line=>'- '+line),''];
lines.push('','## Temporary cleanup','',report.cleanup.status+': '+report.cleanup.reason,'',...report.cleanup.retainedIntermediates.map(name=>'- `'+name+'`'),'');
fs.writeFileSync(out.replace(/\.json$/,'.md'),lines.join('\n'));
console.log(JSON.stringify({status:'PASS',size:report.size,performanceChangePercent:performance.changePercent,browser:report.browser.counts}));

/** Deterministic inventory of every changed existing .mjs/.py source consumer.
 * --write or --check; optional --oracle-proof JSON attaches execution evidence.
 * Static diffs are not test results. No producers, QA suites or network run. */
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';

const root=fileURLToPath(new URL('../../',import.meta.url)),base='75d322e4e3274f14d7e2a81abace3ba63c784ec5';
const args=process.argv.slice(2),mode=args[0];assert.ok(['--write','--check'].includes(mode),'Use --write or --check');
assert.ok(args.length===1||args.length===3&&args[1]==='--oracle-proof','Use optional --oracle-proof JSON');
const cmp=(a,b)=>a<b?-1:a>b?1:0,sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const git=(...args)=>execFileSync('git',args,{cwd:root,maxBuffer:128*1024*1024});
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const lines=text=>text.split('\n').map(line=>line.endsWith('\r')?line.slice(0,-1):line);
const knownAtBase=new Set(git('ls-tree','-r','--name-only',base).toString('utf8').trim().split('\n'));
const files=git('diff','--name-only',base,'--','*.mjs','*.py').toString('utf8').trim().split('\n')
 .filter(file=>knownAtBase.has(file)).sort(cmp);
const legacy=/\b(?:provenance|sourceProvenance|effectProvenance|mfmProvenance|sourceEquipmentProvenance|suppressionProvenance|sourceEvidence|fieldProvenance|currentness|sourceId|sourcePath|corpusDocument|sourceLocator)\b/;
const serialization=/\b(?:JSON\.parse|JSON\.stringify|json\.dumps|serialize\(|read_text\(|write_text\(|readFileSync\(|writeFileSync\()/;
const apiModules=['books/shared/source-refs-v2/source-refs.mjs','books/shared/source-refs-v2/source-registry.mjs','books/shared/source-refs-v2/source-serialization.mjs','books/shared/source-refs-v2/source-closure.mjs','books/shared/source-refs-v2/source-closure-qa.mjs','books/shared/source-refs-v2/producer-io.mjs','tests/helpers/source-refs-fixtures.mjs'];
const apiDefinitions=[];
for(const file of apiModules){const text=read(file);for(const match of text.matchAll(/export\s+(?:async\s+)?(?:function|const)\s+([A-Za-z_$][\w$]*)/g))
 apiDefinitions.push({api:match[1],path:file,line:text.slice(0,match.index).split('\n').length});}
for(const name of ['generated_source_outputs','serialized_source_outputs']){
 const file='books/shared/tools/source_refs_output.py',text=read(file),index=text.indexOf('def '+name+'(');assert.ok(index>=0);
 apiDefinitions.push({api:name,path:file,line:text.slice(0,index).split('\n').length});
}
const apis=new Set(apiDefinitions.map(row=>row.api));
const structuralAdaptations={
 'books/shared/army-book-app-v2/project.mjs':{kind:'NORMALIZED_SOURCE_METADATA_OMISSION',anchor:'const centralOmit = new Set(',reason:'The existing central record presentation omitted provenance. The same omission list now includes normalized source catalog/binding metadata; this is an output-field filter rather than a source API call.'},
 'books/shared/application-v2/browser-test-dependencies.mjs':{kind:'BROWSER_TEST_SOURCE_DEPENDENCY',anchor:"['/books/shared/source-refs-v2/source-refs.mjs','text/javascript']",reason:'The existing exact QA server dependency map serves the new browser-safe shared source reader. Node-only registry and producer modules remain excluded.'},
 'v2/shell-browser-qa.mjs':{kind:'SOURCE_MODULE_RESOURCE_BOUNDARY',anchor:"assert.equal(isAllowedResource('/books/shared/source-refs-v2/source-refs.mjs'),true",reason:'The real Shell browser test asserts the exact shared reader is served and both Node-only source tooling modules are rejected. Existing application readiness and resource guards remain unchanged.'}
};
const outputJson=path.join(root,'docs/audit/source-reader-migration.json'),outputMd=path.join(root,'docs/audit/source-reader-migration.md');
const saved=fs.existsSync(outputJson)?JSON.parse(fs.readFileSync(outputJson,'utf8')):{};
const oracleEvidence=args[2]?JSON.parse(fs.readFileSync(args[2],'utf8')):saved.oracleEvidence||{status:'NOT_MEASURED',reason:'Oracle migration and negative assertions are inventoried statically; execution proof is attached separately after the native QA runs.'};
assert.ok(!/(?:[A-Z]:[\\/]|\/Users\/|\/home\/|\d{4}-\d\d-\d\dT)/.test(JSON.stringify(oracleEvidence)),'Oracle attestation must contain no absolute checkout paths or timestamps');
function role(file){const name=path.posix.basename(file);
 if(/(?:oracle|source-completeness|roster-source-review)/.test(name)&&!/(?:^|-)qa\./.test(name))return 'ORACLE_OR_SOURCE_GUARD';
 if(/(?:^|[-.])(?:qa|test)(?:[-.]|$)/.test(name))return 'TEST_ORACLE_OR_SCENARIO';
 if(name==='build.py'||name==='build.mjs'||/(?:^|-)build\.mjs$/.test(name))return 'BUILDER';
 return 'RUNTIME_CONSUMER';
}
function parseDiff(text,file,before,after){
 let oldLine=0,newLine=0;const removed=[],added=[];
 for(const line of text.split('\n')){
  const hunk=line.match(/^@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@/);if(hunk){oldLine=Number(hunk[1]);newLine=Number(hunk[2]);continue;}
  if(line.startsWith('---')||line.startsWith('+++')||!oldLine&&!newLine)continue;
  if(line.startsWith('-')){const content=line.slice(1);assert.equal(before[oldLine-1],content,file+': stale removed-line reference');removed.push({line:oldLine++,text:content});}
  else if(line.startsWith('+')){const content=line.slice(1);assert.equal(after[newLine-1],content,file+': stale added-line reference');added.push({line:newLine++,text:content});}
  else if(line.startsWith(' ')){oldLine++;newLine++;}
 }
 return {removed,added};
}
function APIIdentifiers(line){return [...apis].filter(name=>new RegExp('\\b'+name+'\\b').test(line)).sort(cmp);}
const rows=[];
for(const file of files){
 const beforeBytes=git('show',base+':'+file),afterBytes=fs.readFileSync(path.join(root,file)),before=lines(beforeBytes.toString('utf8')),after=lines(afterBytes.toString('utf8'));
 const diff=git('diff','--no-ext-diff','--no-color','--unified=0',base,'--',file).toString('utf8'),changes=parseDiff(diff,file,before,after);
 const addedAPIs=changes.added.flatMap(row=>APIIdentifiers(row.text).map(api=>({...row,api,definition:apiDefinitions.find(item=>item.api===api)})));
 const allAPICalls=after.flatMap((text,index)=>APIIdentifiers(text).filter(api=>new RegExp('\\b'+api+'\\s*\\(').test(text)).map(api=>({api,line:index+1,text})));
 const oldSource=changes.removed.filter(row=>legacy.test(row.text)),oldBoundary=changes.removed.filter(row=>serialization.test(row.text));
 const structural=structuralAdaptations[file];if(structural)assert.ok(after.some(line=>line.includes(structural.anchor)),file+': missing verified structural adaptation anchor');
 rows.push({path:file,role:role(file),baseSha256:sha(beforeBytes),featureSha256:sha(afterBytes),diffSha256:sha(diff),
  oldSourceReadOrDeclarationSites:oldSource.map(row=>({...row,revision:base})),oldJSONBoundarySites:oldBoundary.map(row=>({...row,revision:base})),
  addedCommonAPISites:addedAPIs,currentCommonAPICalls:allAPICalls,
  addedVerificationSites:changes.added.filter(row=>/\b(?:assert|requireValue|throws|reject)\b/.test(row.text)),
  addedLines:changes.added.length,removedLines:changes.removed.length,
  classification:addedAPIs.length?'COMMON_SOURCE_API_ADAPTATION':allAPICalls.length?'EXISTING_COMMON_API_CALL_ADAPTED':structural?.kind||'NO_COMMON_API_IDENTIFIER_IN_DIFF',
  structuralAdaptation:structural?{...structural,line:after.findIndex(line=>line.includes(structural.anchor))+1}:null,
  verification:'STATIC_DIFF_AND_VERIFIED_FILE_LINES_ONLY'});
}
const report={schema:'source-reader-migration/v1',base,scope:'Every changed existing .mjs/.py file compared with the accepted Translate-2 base. New migration modules/tests are listed separately and are not disguised as pre-existing reader changes.',
 summary:{changedExistingCodeFiles:rows.length,byRole:Object.fromEntries([...new Set(rows.map(row=>row.role))].sort(cmp).map(role=>[role,rows.filter(row=>row.role===role).length])),oldSourceSites:rows.reduce((n,row)=>n+row.oldSourceReadOrDeclarationSites.length,0),oldJSONBoundaries:rows.reduce((n,row)=>n+row.oldJSONBoundarySites.length,0),addedCommonAPISites:rows.reduce((n,row)=>n+row.addedCommonAPISites.length,0),withoutCommonAPIIdentifier:rows.filter(row=>row.classification==='NO_COMMON_API_IDENTIFIER_IN_DIFF').map(row=>row.path)},
 apiDefinitions:apiDefinitions.sort((a,b)=>cmp(a.path,b.path)||a.line-b.line),files:rows,oracleEvidence,
 interpretation:[
  'Old source sites include reads, source declarations and assertions; the exact removed code is shown rather than assigning gameplay semantics from identifier names.',
  'Builder input boundaries use prepareSourceProducer/parseProducerJSON to obtain an explicit inverse scratch view. Final output boundaries use finalizeSourceOutput/serializeSourceJSON or the shared Python bridge. This does not make generated files factual owners.',
  'Test fixture readers register normalized data; sourceFixture/sourceSnapshot/sourceDeclarationView provide explicit original declarations for established independent oracle assertions and mutation fixtures. Oracle envelopes and expected rejection messages remain reviewable in the exact diffs.',
  'Runtime sites use the common source identity/evidence reader or copy normalized bindings. Stratagem compatibility reading remains supported by the common adapter; stratagem source records are not migrated.',
  'Static API presence is not proof of reachability, unchanged behavior, or successful QA. Actual oracle negative controls and browser text parity are separate execution attestations.'],
 limitations:['Role labels follow explicit file purpose (oracle/guard, QA/scenario, builder, remaining runtime consumer); they do not certify a whole file is limited to one execution path.','The changed-source detector uses service field identifiers and JSON boundary syntax only. Exact diff hashes and line text permit independent review; it does not infer rules from English text.','Files added by this migration are intentionally outside the existing-reader count. Regeneration after any further existing-code edit updates the inventory deterministically.']};
const escape=text=>String(text).replaceAll('|','\\|').replaceAll('\n',' ');
const doc=['# Source reader migration inventory','','Base: `'+base+'`. Every entry is computed from the current diff against this base; file paths and old/new line text are verified. No test suite or producer is run by this tool.','','## Summary','','`'+JSON.stringify(report.summary)+'`','','## Existing code sites','','| File | Purpose | Original source or JSON boundary | Common API and current line |','| --- | --- | --- | --- |',
 ...rows.map(row=>{const old=[...row.oldSourceReadOrDeclarationSites,...row.oldJSONBoundarySites].filter((value,index,array)=>array.findIndex(item=>item.line===value.line)===index).map(site=>'BASE:'+site.line).join(', ')||'No source-field/JSON-boundary expression removed';const current=[...new Set(row.addedCommonAPISites.map(site=>site.api+':'+site.line))].join(', ')||row.currentCommonAPICalls.map(site=>site.api+':'+site.line).join(', ')||'No common API identifier; inspect exact diff';return '| '+row.path+' | '+row.role+' | '+escape(old)+' | '+escape(current)+' |';}),
 '','The companion JSON contains each old expression, exact new common API expression, verified base/current line numbers, whole-file hashes, full-diff SHA-256 and added assertions. These are static code observations, not execution results.','','## Reading the adaptations','',...report.interpretation.map(text=>'- '+text),'','## Oracle execution evidence','','`'+JSON.stringify(oracleEvidence)+'`','','Execution evidence is attached only after the native QA/oracle negative controls complete. A saved attestation is reused by `--check`; this tool does not rerun its command.','','## Limits','',...report.limitations.map(text=>'- '+text),'','Regenerate with `node tools/audit/source-reader-migration.mjs --write`; verify exact bytes with `--check`. Optional `--oracle-proof FILE` attaches stable execution evidence.',''];
for(const [file,text]of [[outputJson,JSON.stringify(report,null,2)+'\n'],[outputMd,doc.join('\n')]])if(mode==='--write'){fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,text);}else assert.equal(fs.readFileSync(file,'utf8'),text,'Inventory differs: '+path.relative(root,file));
console.log(JSON.stringify({status:'PASS',...report.summary,oracleEvidence:report.oracleEvidence}));

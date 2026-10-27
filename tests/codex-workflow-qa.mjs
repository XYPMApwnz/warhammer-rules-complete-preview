import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=relative=>fs.readFileSync(path.join(root,relative),'utf8');
const packageJson=JSON.parse(read('package.json')),scripts=packageJson.scripts||{};
const localQa=['qa:sm','qa:da','qa:ba','qa:dg','qa:am','qa:tyranids','qa:tau','qa:ec','qa:csm','qa:effects','qa:points','qa:roster','qa:glossary','qa:publication','qa:sources','qa:architecture','qa:integration','qa:workflow','qa:help'];
const requiredFiles=['AGENTS.md','books/shared/AGENTS.md','books/space-marines/AGENTS.md','books/death-guard/AGENTS.md','books/adeptus-mechanicus/AGENTS.md','glossary/AGENTS.md','docs/codex/REPO_MAP.md','docs/codex/QA_MATRIX.md','docs/codex/WORKFLOW.md','docs/codex/PROMPTS.md','tools/qa-help.mjs'];
const mappedPaths=['books/source-ingestion-contract.json','books/publication-inventory.json','books/shared/tools/canonical-build-contract.mjs','books/shared/tools/canonical-join-contract.mjs','books/shared/tools/effective-book-model.mjs','books/shared/tools/build-effective-book.mjs','books/shared/tools/build-army-book.mjs','books/death-guard/tools/canonical-source-adapter.mjs','books/death-guard/tools/presentation-hook.mjs','books/adeptus-mechanicus/tools/canonical-source-adapter.mjs','books/shared/tools/effect-contract.mjs','books/shared/effect-contract-runtime.js','books/shared/tools/effective-points-projection.mjs','books/shared/points/effective-catalog.mjs','glossary/v2/tools/build-glossary-v2.mjs','books/shared/tools/render-structured-effective-book.mjs','books/shared/tools/publication-inventory.mjs','tools/pages-runtime-package.mjs'];

for(const file of requiredFiles)assert.ok(fs.existsSync(path.join(root,file)),`missing documented workflow path: ${file}`);
for(const file of mappedPaths)assert.ok(fs.existsSync(path.join(root,file)),`repository map references missing path: ${file}`);
for(const name of [...localQa,'qa:release'])assert.equal(typeof scripts[name],'string',`missing npm script ${name}`);
for(const name of [...localQa,'qa:release'])assert.doesNotMatch(scripts[name],/\b(?:test:full|test:release)\b/,`${name} must not hide test:full`);
for(const target of ['qa:sm','qa:integration','publication:check','army-books:sources:check'])assert.match(scripts['qa:release'],new RegExp(`npm run ${target.replace(':','\\:')}`),`qa:release omits ${target}`);

for(const [name,command] of Object.entries(scripts).filter(([name])=>name.startsWith('qa:'))){
  for(const match of command.matchAll(/\bnode\s+([^\s]+)/g))assert.ok(fs.existsSync(path.join(root,match[1])),`${name} references missing ${match[1]}`);
  for(const match of command.matchAll(/\bnpm(?:\.cmd)?\s+run\s+([^\s&]+)/g))assert.equal(typeof scripts[match[1]],'string',`${name} references missing npm script ${match[1]}`);
}

const qaNames=new Set(Object.keys(scripts).filter(name=>name.startsWith('qa:'))),visiting=new Set(),visited=new Set();
const visit=name=>{
  if(visited.has(name))return;
  assert.ok(!visiting.has(name),`circular QA alias at ${name}`);
  visiting.add(name);
  for(const match of scripts[name].matchAll(/\bnpm(?:\.cmd)?\s+run\s+(qa:[^\s&]+)/g))if(qaNames.has(match[1]))visit(match[1]);
  visiting.delete(name);visited.add(name);
};
for(const name of qaNames)visit(name);

const rootLines=read('AGENTS.md').trimEnd().split(/\r?\n/).length;
assert.ok(rootLines>0&&rootLines<=60,`root AGENTS.md should stay concise (at most 60 lines); got ${rootLines}`);
const docs=['docs/codex/REPO_MAP.md','docs/codex/QA_MATRIX.md','docs/codex/WORKFLOW.md','docs/codex/PROMPTS.md'].map(read).join('\n');
for(const name of [...localQa.filter(name=>!['qa:help','qa:workflow'].includes(name)),'qa:release'])assert.ok(docs.includes(name),`Codex docs do not reference ${name}`);

const help=spawnSync(process.execPath,[path.join(root,'tools/qa-help.mjs')],{encoding:'utf8'});
assert.equal(help.status,0,help.stderr);
for(const name of [...localQa.filter(name=>name!=='qa:help'),'qa:release'])assert.ok(help.stdout.includes(name),`qa:help omits ${name}`);

console.log(`Codex workflow QA: PASS (${qaNames.size} QA entrypoints, ${requiredFiles.length} durable guidance files, ${mappedPaths.length} mapped paths, ${rootLines} root AGENTS lines, no test:full aliases or cycles).`);

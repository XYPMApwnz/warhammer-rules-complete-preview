import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
const root='E:/Warhammer/worktrees/fast-first-load-v1',out='E:/Warhammer/qa-evidence/fast-first-load-v1-2026-11-21';
const require=createRequire(root+'/package.json'),{parse}=require('acorn');
const base='8579a7a77c7f5e8dad291afc11b27aab3cd9d73a';
const files=['tests/browser/pwa-bootstrap-update.mjs','tests/browser/pwa-update-flow.mjs','tests/browser/cold-offline.mjs','tools/pages-runtime-package-qa.mjs'];
const canonical=value=>Array.isArray(value)?value.map(canonical):value&&typeof value==='object'?Object.fromEntries(Object.keys(value).filter(k=>!['start','end','loc','raw'].includes(k)).sort().map(k=>[k,canonical(value[k])])):value;
function assertions(source){const result=[];function visit(n){if(!n||typeof n!=='object')return;if(n.type==='CallExpression'&&(n.callee?.name==='assert'||n.callee?.type==='MemberExpression'&&n.callee.object?.name==='assert'))result.push(JSON.stringify(canonical(n)));for(const [k,v]of Object.entries(n))if(!['start','end','loc'].includes(k)){if(Array.isArray(v))v.forEach(visit);else if(v&&typeof v==='object')visit(v);}}visit(parse(source,{ecmaVersion:'latest',sourceType:'module'}));return result;}
const results=[];for(const file of files){const before=execFileSync('git',['show',base+':'+file],{cwd:root,encoding:'utf8'}),after=fs.readFileSync(path.join(root,file),'utf8'),old=assertions(before),current=assertions(after);let at=0;for(const required of old){while(at<current.length&&current[at]!==required)at++;assert(at<current.length,'Original exact assertion removed, changed or reordered in '+file);at++;}results.push({file,oldAssertions:old.length,currentAssertions:current.length,oldAssertionsPreservedInOrder:true,oldAssertionsSha256:createHash('sha256').update(JSON.stringify(old)).digest('hex')});}
const report={status:'PASS',base,boundary:'Independent AST comparison: each old assert call including exact arguments/messages remains an ordered subsequence; new assertions may be added. This does not replace browser behavioral checks.',results};fs.writeFileSync(out+'/ASSERTION_PRESERVATION.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));

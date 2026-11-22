/** CI dependency contract and pure in-memory negative controls. No packaging runs. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {checkPagesRuntimeCiContract,checkPackagingImports,checkWorkflowInstall,packageName} from '../tools/pages-runtime-ci-contract.mjs';

const root=fileURLToPath(new URL('../',import.meta.url));
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const baseline=checkPagesRuntimeCiContract(root);
const workflow=read('.github/workflows/pages-runtime.yml').replace(/\r\n?/g,'\n');
const controls=[];
function reject(name,fn,error){assert.throws(fn,error,name);controls.push({name,status:'REJECTED'});}
function overlay(entries){return file=>{
  if(Object.hasOwn(entries,file))return entries[file];
  return read(file);
};}
const install=/^      - [^\n]*\n(?:        [^\n]*\n)*?        run: npm ci(?: --ignore-scripts)?\n/m;
const installStep=workflow.match(install)?.[0];
assert.ok(installStep,'Reviewed workflow has a standalone named npm ci step');
const withoutInstall=workflow.replace(installStep,'');
reject('missing locked install',()=>checkWorkflowInstall(withoutInstall),/CI_LOCKED_INSTALL_REQUIRED/);
reject('install after packaging',()=>checkWorkflowInstall(withoutInstall.replace('      - uses: actions/upload-pages-artifact',installStep+'      - uses: actions/upload-pages-artifact')),/CI_LOCKED_INSTALL_REQUIRED/);
reject('unlocked npm install',()=>checkWorkflowInstall(workflow.replace(/run: npm ci(?: --ignore-scripts)?/, 'run: npm install')),/CI_LOCKED_INSTALL_REQUIRED/);
reject('dev dependencies omitted',()=>checkWorkflowInstall(workflow.replace(/run: npm ci(?: --ignore-scripts)?/, 'run: npm ci --omit=dev')),/CI_LOCKED_INSTALL_REQUIRED/);
reject('conditional install',()=>checkWorkflowInstall(workflow.replace(installStep,installStep.replace('        run:', '        if: false\n        run:'))),/CI_INSTALL_CONTEXT/);
reject('install in another directory',()=>checkWorkflowInstall(workflow.replace(installStep,installStep.replace('        run:', '        working-directory: tools\n        run:'))),/CI_INSTALL_CONTEXT/);
reject('inherited production environment',()=>checkWorkflowInstall(workflow.replace('    steps:', '    env:\n      NODE_ENV: production\n    steps:')),/CI_INSTALL_ENV/);
reject('undeclared transitive bare import',()=>checkPackagingImports(root,{readText:overlay({
  'tools/runtime-url-stamps.mjs':read('tools/runtime-url-stamps.mjs')+"\nimport 'not-declared-ci-control/subpath';\n"
})}),/CI_UNDECLARED_PACKAGE.*runtime-url-stamps\.mjs.*not-declared-ci-control/);

const synthetic={
  'package.json':JSON.stringify({dependencies:{'@review/scope':'1','fixture-package':'1'},devDependencies:{acorn:'8'}}),
  'tools/pages-runtime-package.mjs':"export * from './ci-guard-fixture.mjs';",
  'tools/pages-runtime-package-qa.mjs':"import './ci-guard-fixture.mjs';",
  'tools/ci-guard-fixture.mjs':"import '@review/scope/subpath'; export {value} from './ci-guard-fixture.cjs'; export const next=()=>import('fixture-package/lazy');",
  'tools/ci-guard-fixture.cjs':"const fs=require('fs/promises'); const value=require('fixture-package/subpath'); exports.value=value;"
};
const fixture=()=>checkPackagingImports(root,{readText:overlay(synthetic)});
const graph=fixture();
assert.deepEqual(graph.packages,['@review/scope','fixture-package']);
assert.ok(graph.imports.some(row=>row.kind==='require'&&row.package==='fixture-package'));
assert.ok(graph.imports.some(row=>row.kind==='dynamic import'&&row.package==='fixture-package'));
assert.ok(graph.imports.some(row=>row.kind==='reexport'&&row.target==='tools/ci-guard-fixture.cjs'));
assert.equal(packageName('@review/scope/subpath'),'@review/scope');
for(const [name,source,error]of [
  ['undeclared scoped subpath',"import '@missing/scope/path';",/CI_UNDECLARED_PACKAGE.*@missing\/scope/],
  ['undeclared reexport',"export * from 'missing-reexport';",/CI_UNDECLARED_PACKAGE.*missing-reexport/],
  ['undeclared literal dynamic import',"const load=()=>import('missing-dynamic');",/CI_UNDECLARED_PACKAGE.*missing-dynamic/],
  ['undeclared require',"const load=require('missing-require');",/CI_UNDECLARED_PACKAGE.*missing-require/],
  ['nonliteral dynamic import',"const load=name=>import(name);",/CI_DYNAMIC_IMPORT/],
  ['nonliteral require',"const load=name=>require(name);",/CI_DYNAMIC_IMPORT/],
  ['unsupported URL import',"import 'https://invalid.example/dependency.mjs';",/CI_IMPORT_SPECIFIER/],
  ['checkout escape',"import '../../outside-checkout.mjs';",/CI_LOCAL_IMPORT/]
]){
  reject(name,()=>checkPackagingImports(root,{readText:overlay({...synthetic,'tools/ci-guard-fixture.mjs':source})}),error);
}
assert.deepEqual(checkWorkflowInstall(workflow.replace(/npm ci --ignore-scripts/g,'npm ci')).packagingCommands,baseline.workflow.packagingCommands);
assert.deepEqual(checkWorkflowInstall(workflow.replace(/npm ci(?: --ignore-scripts)?/g,'npm ci --ignore-scripts')).packagingCommands,baseline.workflow.packagingCommands);
console.log(JSON.stringify({...baseline,negativeControls:controls,syntheticGraphKinds:['import','reexport','dynamic import','require'],
  boundary:'Reads only packaging-tool Node import closure; never imports or evaluates tool/native runtime factories.'},null,2));

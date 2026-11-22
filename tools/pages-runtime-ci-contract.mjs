/** Release packaging dependency boundary. Read sources; never evaluate factories. */
import fs from 'node:fs';
import path from 'node:path';
import {isBuiltin} from 'node:module';
import {fileURLToPath} from 'node:url';
import {parse} from 'acorn';

export const PACKAGING_ROOTS=Object.freeze(['tools/pages-runtime-package.mjs','tools/pages-runtime-package-qa.mjs']);
const workflowFile='.github/workflows/pages-runtime.yml';
const fail=(code,message)=>{throw Error(code+': '+message);};
const normalize=text=>text.replace(/\r\n?/g,'\n');
const packagingCommand=/\btools\/pages-runtime-package[\w-]*\.mjs\b/;

/** Deliberately restricted to the reviewed block-style build job, not a YAML evaluator.
 * A new workflow shape needs review rather than a guess about shell/YAML execution. */
export function checkWorkflowInstall(source){
  const lines=normalize(source).split('\n');
  if(lines.some(line=>/^\s*defaults\s*:/.test(line)||/^\s*<<\s*:/.test(line)))
    fail('CI_WORKFLOW_SHAPE','defaults and YAML merges need explicit dependency-install review');
  const build=lines.findIndex(line=>line==='  build:');
  if(build<0||lines.filter(line=>line==='  build:').length!==1)fail('CI_WORKFLOW_SHAPE','expected one block-style build job');
  const next=lines.findIndex((line,index)=>index>build&&/^  [\w-]+:/.test(line));
  const job=lines.slice(build+1,next<0?undefined:next),stepsAt=job.findIndex(line=>line==='    steps:');
  if(stepsAt<0||job.filter(line=>line==='    steps:').length!==1)fail('CI_WORKFLOW_SHAPE','expected one build steps list');
  // npm ci includes devDependencies only without an inherited production/omit setting.
  if(lines.slice(0,build).some(line=>/^env\s*:/.test(line))||job.slice(0,stepsAt).some(line=>/^    env\s*:/.test(line)))
    fail('CI_INSTALL_ENV','inherited environment requires explicit dependency-install review');
  const steps=[];
  for(let index=stepsAt+1;index<job.length;index++){
    const line=job[index];
    if(!line.trim()||line.trimStart().startsWith('#'))continue;
    if(/^      - /.test(line))steps.push({lines:[line],line:build+index+2});
    else if(/^        \S|^          /.test(line)&&steps.length)steps.at(-1).lines.push(line);
    else fail('CI_WORKFLOW_SHAPE','unsupported build step at line '+(build+index+2));
  }
  const commands=[];
  for(const [stepIndex,step]of steps.entries()){
    const runIndices=step.lines.flatMap((line,index)=>/^(?:      - |        )run:/.test(line)?[index]:[]);
    if(runIndices.length>1)fail('CI_WORKFLOW_SHAPE','duplicate run field at step '+(stepIndex+1));
    if(!runIndices.length)continue;
    const at=runIndices[0],value=step.lines[at].replace(/^(?:      - |        )run:\s*/,'');
    let run;
    if(value==='|'||value==='|-'){
      run=[];
      for(let index=at+1;index<step.lines.length&&/^          /.test(step.lines[index]);index++)run.push(step.lines[index].slice(10));
    }else if(value&&!/^[>|'"&*]/.test(value))run=[value];
    else fail('CI_WORKFLOW_SHAPE','unsupported run field at step '+(stepIndex+1));
    for(const command of run.filter(line=>line.trim()&&!line.trimStart().startsWith('#')))
      commands.push({command:command.trim(),stepIndex,line:step.line,step});
  }
  const firstPackage=commands.findIndex(({command})=>packagingCommand.test(command));
  if(firstPackage<0)fail('CI_PACKAGE_COMMAND','no Pages packaging command found');
  const prior=commands.slice(0,firstPackage);
  const install=prior.find(({command})=>/^npm ci(?: --ignore-scripts)?$/.test(command));
  if(!install)fail('CI_LOCKED_INSTALL_REQUIRED','npm ci (optionally --ignore-scripts) must precede the first Pages packaging command');
  if(install.step.lines.some(line=>/^(?:      - |        )(?:if|env|working-directory|shell):/.test(line)))
    fail('CI_INSTALL_CONTEXT','locked install must be unconditional at the checkout root with the default shell and environment');
  if(install.stepIndex===commands[firstPackage].stepIndex)
    fail('CI_INSTALL_CONTEXT','locked install must be its own step before packaging');
  if(prior.some(({command,stepIndex})=>stepIndex===install.stepIndex&&command!==install.command))
    fail('CI_INSTALL_CONTEXT','locked-install step must contain only npm ci');
  for(const {step,stepIndex,command}of commands.filter(({command})=>packagingCommand.test(command))){
    if(step.lines.some(line=>/^(?:      - |        )working-directory:/.test(line)))
      fail('CI_PACKAGE_CONTEXT','packaging step '+(stepIndex+1)+' must run at the checkout root');
    if(!/^node tools\/pages-runtime-package[\w-]*\.mjs\b/.test(command)||/[;&|\r\n]/.test(command))
      fail('CI_PACKAGE_CONTEXT','packaging command must be one direct Node invocation at the checkout root');
  }
  const packagingCommands=commands.filter(({command})=>packagingCommand.test(command)).map(({command})=>command);
  return {installCommand:install.command,installStep:install.stepIndex+1,firstPackagingStep:commands[firstPackage].stepIndex+1,
    packagingCommands,commands:[install.command,...packagingCommands],
    buildCommands:commands.map(({command,stepIndex})=>({command,step:stepIndex+1}))};
}

const literal=node=>node?.type==='Literal'&&typeof node.value==='string'?node.value:
  node?.type==='TemplateLiteral'&&!node.expressions.length?node.quasis[0].value.cooked:null;
function walk(node,visit){
  if(!node||typeof node!=='object')return;
  if(node.type)visit(node);
  for(const [key,value]of Object.entries(node)){
    if(['start','end','loc','range'].includes(key))continue;
    if(Array.isArray(value))for(const child of value)walk(child,visit);
    else if(value&&typeof value==='object')walk(value,visit);
  }
}
export function packageName(specifier){
  if(specifier.startsWith('@')){
    const parts=specifier.split('/');
    if(parts.length<2||!parts[0].slice(1)||!parts[1])fail('CI_IMPORT_SPECIFIER','invalid scoped package '+specifier);
    return parts.slice(0,2).join('/');
  }
  if(!/^[a-zA-Z0-9][a-zA-Z0-9._-]*(?:\/|$)/.test(specifier))fail('CI_IMPORT_SPECIFIER','unsupported package specifier '+specifier);
  return specifier.split('/')[0];
}

/** Every local dependency is parsed, including reexports and literal CJS/dynamic
 * imports. Browser module source strings and fs-read JSON are data, not edges. */
export function checkPackagingImports(root,{readText=file=>fs.readFileSync(path.join(root,file),'utf8')}={}){
  const manifest=JSON.parse(readText('package.json'));
  const declared=new Set([...Object.keys(manifest.dependencies||{}),...Object.keys(manifest.devDependencies||{})]);
  const pending=[...PACKAGING_ROOTS],visited=new Set(),imports=[],packages=new Set();
  function localFile(owner,specifier,kind){
    if(/[?#]/.test(specifier)||specifier.includes('\\'))fail('CI_LOCAL_IMPORT',owner+' -> '+specifier+' needs explicit Node resolution review');
    const target=path.posix.normalize(path.posix.join(path.posix.dirname(owner),specifier));
    if(target==='..'||target.startsWith('../')||path.posix.isAbsolute(target))fail('CI_LOCAL_IMPORT',owner+' escapes checkout: '+specifier);
    const candidates=[target];
    if(kind==='require'&&!path.posix.extname(target))candidates.push(target+'.js',target+'.json',target+'.node');
    for(const file of candidates){try{readText(file);return file;}catch(error){if(!['ENOENT','EISDIR','ENOTDIR'].includes(error.code))throw error;}}
    fail('CI_LOCAL_IMPORT',owner+' -> '+specifier+' does not resolve to a reviewed local file');
  }
  while(pending.length){
    const owner=pending.shift();if(visited.has(owner))continue;visited.add(owner);
    const source=readText(owner);let ast;
    try{ast=parse(source,{ecmaVersion:'latest',sourceType:owner.endsWith('.cjs')?'script':'module',allowHashBang:true,locations:true});}
    catch(error){fail('CI_IMPORT_SYNTAX',owner+': '+error.message);}
    function inspect(node,specifier,kind){
      if(specifier===null)fail('CI_DYNAMIC_IMPORT',owner+':'+node.loc.start.line+' nonliteral '+kind+' needs explicit dependency review');
      if(isBuiltin(specifier))return;
      if(specifier.startsWith('node:'))fail('CI_IMPORT_SPECIFIER',owner+': unknown Node builtin '+specifier);
      if(specifier.startsWith('.')){
        const target=localFile(owner,specifier,kind);imports.push({owner,specifier,kind,target});
        if(/\.(?:mjs|cjs|js)$/.test(target))pending.push(target);
        else if(!target.endsWith('.json'))fail('CI_LOCAL_IMPORT',owner+' -> '+target+' is not a reviewed JavaScript or JSON module');
      }else{
        const dependency=packageName(specifier);
        if(!declared.has(dependency))fail('CI_UNDECLARED_PACKAGE',owner+':'+node.loc.start.line+' imports '+specifier+'; declare '+dependency+' in package.json dependencies/devDependencies');
        packages.add(dependency);imports.push({owner,specifier,kind,package:dependency});
      }
    }
    walk(ast,node=>{
      if(node.type==='ImportDeclaration')inspect(node,literal(node.source),'import');
      else if((node.type==='ExportAllDeclaration'||node.type==='ExportNamedDeclaration')&&node.source)inspect(node,literal(node.source),'reexport');
      else if(node.type==='ImportExpression')inspect(node,literal(node.source),'dynamic import');
      else if(node.type==='CallExpression'&&node.callee.type==='Identifier'&&node.callee.name==='require'){
        if(node.arguments.length!==1)fail('CI_DYNAMIC_IMPORT',owner+':'+node.loc.start.line+' require must have one literal argument');
        inspect(node,literal(node.arguments[0]),'require');
      }
    });
  }
  return {roots:[...PACKAGING_ROOTS],files:[...visited].sort(),packages:[...packages].sort(),imports};
}

export function checkPagesRuntimeCiContract(root,{readText=file=>fs.readFileSync(path.join(root,file),'utf8')}={}){
  // Presence is part of the install contract; npm ci validates its full contents.
  const lock=JSON.parse(readText('package-lock.json'));
  if(!Number.isInteger(lock.lockfileVersion))fail('CI_LOCKFILE','package-lock.json needs a lockfileVersion');
  return {status:'PASS',schema:'pages-runtime-ci-contract/v1',workflow:checkWorkflowInstall(readText(workflowFile)),
    dependencies:checkPackagingImports(root,{readText})};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const args=process.argv.slice(2),at=args.indexOf('--source');
  const root=at<0?fileURLToPath(new URL('../',import.meta.url)):path.resolve(args[at+1]);
  console.log(JSON.stringify(checkPagesRuntimeCiContract(root),null,2));
}

/** Independent eager-startup graph. Parse modules without linking/evaluating them.
 * Run the CLI with --experimental-vm-modules; no browser/book factories execute.
 * Dynamic imports in book factories and literal data URLs are recorded separately:
 * their presence in source does not make a lazy book or glossary eager. */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';

export function buildStartupGraph(root){
  if(typeof vm.SourceTextModule!=='function')throw Error('Startup graph requires Node --experimental-vm-modules');
  root=path.resolve(root);
  const inventory=JSON.parse(fs.readFileSync(path.join(root,'tools/pages-runtime-manifest.json'),'utf8'));
  const allowed=new Set(inventory.files.map(row=>row.path));
  const origin='https://startup.invalid/',nodes=new Map(),edges=[],deferredCandidates=[];
  function add(owner,request,kind){
    if(!request||request.startsWith('#')||request.startsWith('data:'))return;
    const url=new URL(request,origin+owner);
    if(url.origin!==new URL(origin).origin)throw Error('Non-local startup dependency: '+owner+' -> '+request);
    let relative=decodeURIComponent(url.pathname).slice(1);
    if(!relative||relative.endsWith('/'))relative+='index.html';
    if(!allowed.has(relative))throw Error('Unpublished startup dependency: '+owner+' -> '+relative);
    const absolute=path.resolve(root,...relative.split('/'));
    if(!absolute.startsWith(root+path.sep)||!fs.statSync(absolute).isFile())throw Error('Invalid startup dependency: '+owner+' -> '+relative);
    edges.push({from:owner,to:relative,kind});
    if(nodes.has(relative))return;
    nodes.set(relative,{path:relative,kind,firstOwner:owner});
    visit(relative);
  }
  function moduleImports(source,identifier){
    try{return new vm.SourceTextModule(source,{identifier}).dependencySpecifiers;}
    catch(error){throw Error('Cannot parse startup module '+identifier+': '+error.message);}
  }
  function visit(relative){
    const extension=path.extname(relative),text=['.html','.js','.mjs','.css','.webmanifest'].includes(extension)?fs.readFileSync(path.join(root,relative),'utf8'):null;
    if(extension==='.html'){
      for(const match of text.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)){
        const src=match[1].match(/\bsrc\s*=\s*["']([^"']+)["']/i);
        if(src)add(relative,src[1],'html-script');
        else if(/\btype\s*=\s*["']module["']/i.test(match[1])){
          for(const request of moduleImports(match[2],relative+'#inline'))add(relative,request,'inline-static-import');
          // The entrypoint's literal import is its actual awaited boot boundary.
          // This rule is confined to inline entry scripts, not lazy module methods.
          for(const imported of match[2].matchAll(/\bimport\s*\(\s*["'](\.[^"']+)["']\s*\)/g))add(relative,imported[1],'entry-boot-import');
        }
      }
      for(const match of text.matchAll(/<link\b([^>]+)>/gi)){
        const rel=match[1].match(/\brel\s*=\s*["']([^"']+)["']/i)?.[1];
        const href=match[1].match(/\bhref\s*=\s*["']([^"']+)["']/i)?.[1];
        if(href&&['stylesheet','manifest','icon','apple-touch-icon'].includes(rel))add(relative,href,'html-'+rel);
      }
      return;
    }
    if(extension==='.mjs'||extension==='.js'){
      for(const request of moduleImports(text,relative))add(relative,request,'static-import');
      for(const match of text.matchAll(/new\s+URL\(\s*["'](\.[^"']+)["']\s*,\s*import\.meta\.url\s*\)/g)){
        if(/\.css(?:[?#]|$)/.test(match[1]))add(relative,match[1],'shell-stylesheet');
        else if(/\.json(?:[?#]|$)/.test(match[1]))deferredCandidates.push({from:relative,request:match[1],kind:'literal-data-url-not-an-eager-import'});
      }
      // The classic entry updater resolves its visible startup panel stylesheet
      // against its own script URL, rather than the ESM import.meta URL.
      for(const match of text.matchAll(/new\s+URL\(\s*["'](\.[^"']+\.css(?:[?#][^"']*)?)["']\s*,\s*script\.src\s*\)/g))add(relative,match[1],'classic-shell-stylesheet');
      for(const match of text.matchAll(/\bimport\s*\(\s*["'](\.[^"']+)["']\s*\)/g))deferredCandidates.push({from:relative,request:match[1],kind:'dynamic-module-import'});
      return;
    }
    if(extension==='.css'){
      for(const match of text.matchAll(/@import\s+["']([^"']+)["']/g))add(relative,match[1],'css-import');
      for(const match of text.matchAll(/url\(\s*["']?([^"')\s]+)["']?\s*\)/g))add(relative,match[1],'css-resource');
    }
    if(extension==='.webmanifest')for(const icon of JSON.parse(text).icons||[])add(relative,icon.src,'manifest-icon');
  }
  add('v2/app.html','./app.html','application-entry');
  return {schema:'v2-eager-startup-graph/v1',entry:'v2/app.html',nodes:[...nodes.values()].sort((a,b)=>a.path.localeCompare(b.path,'en')),edges,deferredCandidates,
    boundary:'Entry HTML, its awaited inline boot import, transitive static imports/re-exports (including JSON), and declared shell styles/resources. Book/glossary factory execution and arbitrary data URL evaluation are deferred; browser first-start acceptance separately covers actual rendering.'};
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  try{
    const args=process.argv.slice(2);if(args.length!==2||args[0]!=='--root')throw Error('Usage: node --experimental-vm-modules tests/helpers/startup-graph.mjs --root <checkout>');
    console.log(JSON.stringify(buildStartupGraph(args[1])));
  }catch(error){console.error(error.stack);process.exitCode=1;}
}

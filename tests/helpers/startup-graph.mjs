/** Independent eager-startup graph. Parse modules without linking/evaluating them.
 * Run the CLI with --experimental-vm-modules; no browser/book factories execute.
 * A second phase covers selected-book code without evaluating its factories.
 * Book-owned payload/alias JSON stays deferred; shared static JSON stays required. */
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
  let eagerPaths;
  const isBookModule=relative=>/^books\/(?!shared\/|core-rules\/)[^/]+\/v2\/.+\.(?:mjs|js)$/.test(relative);
  const isBookData=relative=>/^books\/(?!shared\/|core-rules\/)[^/]+\/.+\.json$/.test(relative);
  function resolve(owner,request){
    if(!request||request.startsWith('#')||request.startsWith('data:'))return;
    const url=new URL(request,origin+owner);
    if(url.origin!==new URL(origin).origin)throw Error('Non-local startup dependency: '+owner+' -> '+request);
    let relative=decodeURIComponent(url.pathname).slice(1);
    if(!relative||relative.endsWith('/'))relative+='index.html';
    if(!allowed.has(relative))throw Error('Unpublished startup dependency: '+owner+' -> '+relative);
    const absolute=path.resolve(root,...relative.split('/'));
    if(!absolute.startsWith(root+path.sep)||!fs.statSync(absolute).isFile())throw Error('Invalid startup dependency: '+owner+' -> '+relative);
    return relative;
  }
  function add(owner,request,kind,phase='eager'){
    const relative=resolve(owner,request);if(!relative)return;
    edges.push({from:owner,to:relative,kind,phase});
    if(nodes.has(relative))return;
    nodes.set(relative,{path:relative,kind,firstOwner:owner,phase});
    visit(relative,phase);
  }
  function moduleImports(source,identifier){
    try{return new vm.SourceTextModule(source,{identifier}).dependencySpecifiers;}
    catch(error){throw Error('Cannot parse startup module '+identifier+': '+error.message);}
  }
  function literalDynamicImports(text,relative){
    return [...text.matchAll(/\bimport\s*\(\s*["']([^"']+)["']\s*(?:\)|,)/g)].map(match=>{
      const request=match[1];
      if(!request.startsWith('.')&&!request.startsWith('/'))throw Error('Unsupported bare startup dynamic import: '+relative+' -> '+request);
      return {request,resolved:resolve(relative,request)};
    });
  }
  function visit(relative,phase){
    const extension=path.extname(relative),text=['.html','.js','.mjs','.css','.webmanifest'].includes(extension)?fs.readFileSync(path.join(root,relative),'utf8'):null;
    if(extension==='.html'){
      for(const match of text.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)){
        const src=match[1].match(/\bsrc\s*=\s*["']([^"']+)["']/i);
        if(src)add(relative,src[1],'html-script');
        else if(/\btype\s*=\s*["']module["']/i.test(match[1])){
          for(const request of moduleImports(match[2],relative+'#inline'))add(relative,request,'inline-static-import');
          // The entrypoint's literal import is its actual awaited boot boundary.
          // This rule is confined to inline entry scripts, not lazy module methods.
          for(const imported of literalDynamicImports(match[2],relative))add(relative,imported.request,'entry-boot-import');
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
      for(const request of moduleImports(text,relative)){
        if(!request.startsWith('.')&&!request.startsWith('/'))throw Error('Unsupported bare startup static import: '+relative+' -> '+request);
        const target=resolve(relative,request);
        if(phase==='selected-book'&&isBookData(target)&&!eagerPaths.has(target)){
          deferredCandidates.push({from:relative,request,resolved:target,kind:'selected-book-data-import'});
        }else add(relative,request,'static-import',phase);
      }
      // Direct literal fetches of shared JSON are real resource dependencies.
      // Property calls (e.g. view.fetch in a lazy glossary action) remain deferred.
      for(const match of !isBookModule(relative)?text.matchAll(/(?<![\w$.])fetch\s*\(\s*new\s+URL\(\s*["'](\.[^"']+\.json)["']\s*,\s*import\.meta\.url\s*\)/g):[])
        add(relative,match[1],'direct-literal-json-fetch',phase);
      // The same ordinary transport is awaited by the keyword passport module.
      // Catalog readiness uses a separate URL and remains a lazy candidate.
      for(const match of !isBookModule(relative)?text.matchAll(/(?<![\w$.])loadRuntimeJSON\s*\(\s*new\s+URL\(\s*["'](\.[^"']+\.json)["']\s*,\s*import\.meta\.url\s*\)/g):[])
        add(relative,match[1],'direct-runtime-json-load',phase);
      for(const match of text.matchAll(/new\s+URL\(\s*["'](\.[^"']+)["']\s*,\s*import\.meta\.url\s*\)/g)){
        if(/\.css(?:[?#]|$)/.test(match[1]))add(relative,match[1],'shell-stylesheet',phase);
        else if(/\.json(?:[?#]|$)/.test(match[1]))deferredCandidates.push({from:relative,request:match[1],kind:'literal-data-url-not-an-eager-import'});
      }
      // The classic entry updater resolves its visible startup panel stylesheet
      // against its own script URL, rather than the ESM import.meta URL.
      for(const match of text.matchAll(/new\s+URL\(\s*["'](\.[^"']+\.css(?:[?#][^"']*)?)["']\s*,\s*script\.src\s*\)/g))add(relative,match[1],'classic-shell-stylesheet',phase);
      for(const imported of literalDynamicImports(text,relative)){
        if(phase==='selected-book'&&isBookModule(relative)&&/\.(?:mjs|js)$/.test(imported.resolved))add(relative,imported.request,'selected-book-dynamic-import',phase);
        else deferredCandidates.push({from:relative,...imported,kind:'dynamic-module-import'});
      }
      return;
    }
    if(extension==='.css'){
      for(const match of text.matchAll(/@import\s+["']([^"']+)["']/g))add(relative,match[1],'css-import',phase);
      for(const match of text.matchAll(/url\(\s*["']?([^"')\s]+)["']?\s*\)/g))add(relative,match[1],'css-resource',phase);
    }
    if(extension==='.webmanifest')for(const icon of JSON.parse(text).icons||[])add(relative,icon.src,'manifest-icon',phase);
  }
  add('v2/app.html','./app.html','application-entry');
  eagerPaths=new Set(nodes.keys());
  const registrationModules=[...new Set(edges.filter(edge=>edge.from==='v2/army-books.mjs'&&edge.kind==='static-import'&&/\/v2\/registration\.mjs$/.test(edge.to)).map(edge=>edge.to))].sort();
  const selectedBookRoots=[];
  for(const registration of registrationModules){
    const text=fs.readFileSync(path.join(root,registration),'utf8');
    for(const imported of literalDynamicImports(text,registration)){
      if(!/\.(?:mjs|js)$/.test(imported.resolved))throw Error('Unsupported selected-book factory module: '+registration+' -> '+imported.request);
      selectedBookRoots.push({registration,path:imported.resolved});
      add(registration,imported.request,'selected-book-factory-root','selected-book');
    }
  }
  const stillDeferred=deferredCandidates.filter(row=>!nodes.has(row.resolved||resolve(row.from,row.request)));
  return {schema:'v2-startup-graph/v2',entry:'v2/app.html',nodes:[...nodes.values()].sort((a,b)=>a.path.localeCompare(b.path,'en')),edges,deferredCandidates:stillDeferred,
    eagerNodeCount:eagerPaths.size,selectedBookNodeCount:nodes.size-eagerPaths.size,registrationModules,selectedBookRoots,
    boundary:'Eager entry HTML/awaited boot/static imports (including JSON) and shell resources; then selected-book factory code rooted in actual registry imports. Selected-book code follows static imports and book-owned literal dynamic modules. Already-eager JSON remains required; newly reached book-owned JSON stays deferred. No factory executes and no lazy payload/glossary fetch is promoted.'};
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  try{
    const args=process.argv.slice(2);if(args.length!==2||args[0]!=='--root')throw Error('Usage: node --experimental-vm-modules tests/helpers/startup-graph.mjs --root <checkout>');
    console.log(JSON.stringify(buildStartupGraph(args[1])));
  }catch(error){console.error(error.stack);process.exitCode=1;}
}

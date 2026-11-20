/** Syntax-only release boundary. This never transpiles published bytes. */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {transformSync,version as esbuildVersion} from 'esbuild';

export const BROWSER_SYNTAX_TARGETS=Object.freeze(['safari15','chrome100','firefox102']);
const attributes=/\b(?:with|assert)\s*(?:\/\*[\s\S]*?\*\/\s*)?\{\s*(?:\/\*[\s\S]*?\*\/\s*)?type\s*:/;
const lineAt=(source,index)=>source.slice(0,index).split('\n').length;

export function assertBrowserSource(source,file){
  const found=attributes.exec(source);
  if(found)throw new Error(`BROWSER_JSON_ATTRIBUTES: ${file}:${lineAt(source,found.index)}: use the shared ordinary JSON loader`);
  const options={loader:'js',sourcefile:file,logLevel:'silent',legalComments:'none',charset:'utf8'};
  let native,target;
  try{
    native=transformSync(source,{...options,target:'esnext'});
    target=transformSync(source,{...options,target:BROWSER_SYNTAX_TARGETS});
  }catch(error){throw new Error('BROWSER_SYNTAX: '+file+': '+error.message,{cause:error});}
  const warnings=[...native.warnings,...target.warnings];
  if(warnings.length)throw new Error('BROWSER_SYNTAX: '+file+': '+warnings.map(w=>`${w.location?.line||'?'} ${w.text}`).join('; '));
  // A successful transform alone is insufficient: lowering would conceal an
  // unsupported feature in the original, untransformed publication.
  if(native.code!==target.code)throw new Error('BROWSER_REQUIRES_TRANSFORM: '+file+': published syntax needs lowering for '+BROWSER_SYNTAX_TARGETS.join('/'));
  return true;
}

export function checkBrowserPackage(root){
  root=path.resolve(root);
  const manifest=JSON.parse(fs.readFileSync(path.join(root,'tools/pages-runtime-manifest.json'),'utf8'));
  const modules=manifest.files.filter(row=>/\.(?:mjs|js)$/.test(row.path)).map(row=>row.path);
  const inline=[];
  for(const file of modules)assertBrowserSource(fs.readFileSync(path.join(root,file),'utf8'),file);
  for(const {path:file}of manifest.files.filter(row=>row.path.endsWith('.html'))){
    const html=fs.readFileSync(path.join(root,file),'utf8');let number=0;
    for(const block of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)){
      if(/\bsrc\s*=|\btype\s*=\s*["'](?:application\/ld\+json|application\/json)["']/i.test(block[1])||!block[2].trim())continue;
      const id=file+'#inline-'+(++number);assertBrowserSource(block[2],id);inline.push(id);
    }
  }
  return {status:'PASS',schema:'browser-syntax-qa/v1',targets:BROWSER_SYNTAX_TARGETS,
    esbuildVersion,modules:modules.length,inlineScripts:inline.length,files:modules,inline,
    boundary:'Exact published JavaScript plus inline HTML scripts; no JSON attributes, no warnings and no target lowering. API support and real-engine QA are separate.'};
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const root=fileURLToPath(new URL('../',import.meta.url));
  try{console.log(JSON.stringify(checkBrowserPackage(root)));}
  catch(error){console.error(error.stack);process.exitCode=1;}
}

/** Package-only URL literal edits. Source/Node imports and factual JSON are untouched. */
import {parse} from 'acorn';
import path from 'node:path';
import {createHash} from 'node:crypto';

export const REVISION_PLACEHOLDER='__WH_PWA_REVISION__';
const ORIGIN='https://runtime.invalid/';
const excluded=new Set(['service-worker.js','glossary/generated/cache-revision.js','manifest.webmanifest']);
const factualScriptData=new Set(['glossary/v2/generated/index.en.js']);
const textTypes=new Set(['.mjs','.js','.html','.css']);
export const stampableRuntimePath=relative=>textTypes.has(path.posix.extname(relative))&&!excluded.has(relative)&&!factualScriptData.has(relative);
const jsString=(value,quote)=>{let text=String(value).replaceAll('\\','\\\\').replaceAll(quote,'\\'+quote).replaceAll('\n','\\n').replaceAll('\r','\\r').replaceAll('\u2028','\\u2028').replaceAll('\u2029','\\u2029');if(quote==='`')text=text.replaceAll('${','\\${');return quote+text+quote;};
const decodeAttribute=value=>value.replaceAll('&amp;','&').replaceAll('&#38;','&').replaceAll('&#x26;','&');
const encodeAttribute=value=>value.replaceAll('&','&amp;');
const validRevision=revision=>revision===REVISION_PLACEHOLDER||/^[a-f0-9]{16}$/.test(revision);

/** Add/replace only the publication query key, preserving other query/hash text. */
export function stampResourceUrl(value,owner,allowed,revision,{moduleSpecifier=false}={}){
  if(!validRevision(revision))throw Error('Invalid publication URL revision');
  if(typeof value!=='string'||!value||value.startsWith('#')||value.startsWith('//')||/^[a-z][a-z0-9+.-]*:/i.test(value))return value;
  if(moduleSpecifier&&!value.startsWith('.')&&!value.startsWith('/'))return value;
  let resolved;try{resolved=new URL(value,new URL(owner,ORIGIN));}catch{return value;}
  const relative=decodeURIComponent(resolved.pathname).slice(1);
  if(!allowed.has(relative)||excluded.has(relative)||relative.endsWith('.html')||!relative)return value;
  const hashAt=value.indexOf('#'),body=hashAt<0?value:value.slice(0,hashAt),fragment=hashAt<0?'':value.slice(hashAt);
  const q=body.indexOf('?'),pathname=q<0?body:body.slice(0,q),query=q<0?'':body.slice(q+1);
  const parts=query?query.split('&'):[],kept=parts.filter(part=>decodeURIComponent(part.split('=',1)[0])!=='wh-pwa');
  kept.push('wh-pwa='+revision);
  return pathname+'?'+kept.join('&')+fragment;
}

function applyEdits(source,edits){
  const sorted=edits.filter(edit=>edit.before!==edit.after).sort((a,b)=>a.start-b.start||a.end-b.end),unique=[];
  for(const edit of sorted){
    const previous=unique.at(-1);
    if(previous&&previous.start===edit.start&&previous.end===edit.end){if(previous.after!==edit.after)throw Error('Conflicting runtime URL stamp');continue;}
    if(previous&&previous.end>edit.start)throw Error('Overlapping runtime URL stamps');
    unique.push(edit);
  }
  let result=source;for(const edit of unique.slice().reverse())result=result.slice(0,edit.start)+edit.after+result.slice(edit.end);
  return {text:result,rewrites:unique};
}

function walk(node,visit){
  if(!node||typeof node!=='object')return;
  if(typeof node.type==='string')visit(node);
  for(const [key,value]of Object.entries(node)){
    if(['start','end','loc','range'].includes(key))continue;
    if(Array.isArray(value))for(const child of value)walk(child,visit);
    else if(value&&typeof value==='object')walk(value,visit);
  }
}
const importMetaUrl=node=>node?.type==='MemberExpression'&&!node.computed&&node.property?.name==='url'&&node.object?.type==='MetaProperty'&&node.object.meta?.name==='import'&&node.object.property?.name==='meta';
function javascriptEdits(source,owner,allowed,revision,{offset=0,module=true}={}){
  // Large classic glossary assignments contain factual strings, not module links.
  // With no possible syntactic owner, parsing their multi-megabyte AST is needless.
  if(!/\b(?:import|export)\b|\bnew\s+URL\s*\(/.test(source))return {edits:[],unresolved:[]};
  const ast=parse(source,{ecmaVersion:'latest',sourceType:module?'module':'script',allowHashBang:true}),edits=[],unresolved=[];
  const add=(literal,kind,options)=>{
    const before=literal?.type==='Literal'&&typeof literal.value==='string'?literal.value:literal?.type==='TemplateLiteral'&&!literal.expressions.length?literal.quasis[0].value.cooked:null;
    if(before===null)return false;
    const value=stampResourceUrl(before,owner,allowed,revision,options);
    if(value!==before){const quote=source[literal.start];edits.push({kind,start:offset+literal.start,end:offset+literal.end,before:source.slice(literal.start,literal.end),after:jsString(value,quote)});}
    return true;
  };
  walk(ast,node=>{
    if(['ImportDeclaration','ExportNamedDeclaration','ExportAllDeclaration'].includes(node.type)&&node.source)add(node.source,'esm-specifier',{moduleSpecifier:true});
    if(node.type==='ImportExpression'&&!add(node.source,'esm-dynamic-specifier',{moduleSpecifier:true}))unresolved.push({kind:'dynamic-import-expression',start:offset+node.start,end:offset+node.end});
    if(node.type==='NewExpression'&&node.callee?.type==='Identifier'&&node.callee.name==='URL'&&importMetaUrl(node.arguments[1])){
      if(!add(node.arguments[0],'import-meta-resource'))unresolved.push({kind:'dynamic-import-meta-resource',start:offset+node.start,end:offset+node.end});
    }
  });
  return {edits,unresolved};
}

function quoted(source,start){
  const quote=source[start];let end=start+1;
  for(;end<source.length;end++){if(source[end]==='\\'){end++;continue;}if(source[end]===quote)return {start:start+1,end,value:source.slice(start+1,end),next:end+1};}
  throw Error('Unterminated CSS URL string');
}
function cssEdits(source,owner,allowed,revision,{offset=0}={}){
  const edits=[];let i=0;
  const add=token=>{if(token.value.includes('\\'))return;const value=stampResourceUrl(token.value,owner,allowed,revision);if(value!==token.value)edits.push({kind:'css-resource',start:offset+token.start,end:offset+token.end,before:token.value,after:value});};
  while(i<source.length){
    if(source.startsWith('/*',i)){const end=source.indexOf('*/',i+2);i=end<0?source.length:end+2;continue;}
    if(source[i]==='"'||source[i]==="'"){i=quoted(source,i).next;continue;}
    const rest=source.slice(i),url=/^url\s*\(/i.exec(rest),imported=/^@import\s+/i.exec(rest);
    if(imported){let begin=i+imported[0].length;if(source[begin]==='"'||source[begin]==="'"){const token=quoted(source,begin);add(token);i=token.next;continue;}}
    if(url&&!(i&&/[\w-]/.test(source[i-1]))){
      let begin=i+url[0].length;while(/\s/.test(source[begin]||''))begin++;
      if(source[begin]==='"'||source[begin]==="'"){const token=quoted(source,begin);add(token);i=token.next;continue;}
      const end=source.indexOf(')',begin);if(end<0)throw Error('Unterminated CSS url()');
      let trimmed=end;while(trimmed>begin&&/\s/.test(source[trimmed-1]))trimmed--;
      add({start:begin,end:trimmed,value:source.slice(begin,trimmed)});i=end+1;continue;
    }
    i++;
  }
  return edits;
}

function htmlEdits(source,owner,allowed,revision,helperIntegrity){
  const edits=[],unresolved=[],comments=[...source.matchAll(/<!--[\s\S]*?-->/g)].map(match=>[match.index,match.index+match[0].length]),raw=[...comments];
  for(const match of source.matchAll(/<(script|style)\b([^>]*)>([\s\S]*?)<\/\1\s*>/gi)){
    if(comments.some(([start,end])=>match.index>=start&&match.index<end))continue;
    const contentStart=match.index+match[0].indexOf('>')+1;raw.push([contentStart,contentStart+match[3].length]);
    if(match[1].toLowerCase()==='style'){edits.push(...cssEdits(match[3],owner,allowed,revision,{offset:contentStart}));continue;}
    const type=/\btype\s*=\s*["']([^"']*)["']/i.exec(match[2])?.[1].toLowerCase();
    if(/\bsrc\s*=/.test(match[2])||(type&&!['module','text/javascript','application/javascript'].includes(type)))continue;
    const module=/\btype\s*=\s*["']module["']/i.test(match[2]);
    const parsed=javascriptEdits(match[3],owner,allowed,revision,{offset:contentStart,module});edits.push(...parsed.edits);unresolved.push(...parsed.unresolved);
  }
  for(const match of source.matchAll(/<(script|link|img)\b([^>]*)>/gi)){
    if(raw.some(([start,end])=>match.index>=start&&match.index<end))continue;
    const tag=match[0];
    for(const attribute of tag.matchAll(/(?:^|\s)(src|href)\s*=\s*(["'])(.*?)\2/gi)){
      const value=decodeAttribute(attribute[3]);
      const bootstrapHelper=match[1].toLowerCase()==='script'&&new URL(value,new URL(owner,ORIGIN)).pathname==='/books/shared/offline-status.js';
      // The updater must run even when opening HTML and the active worker have
      // different revisions. Keep its request network-first; HTML's SRI proves
      // the bytes before execution, and the updater then selects the worker.
      const stamped=bootstrapHelper?value.split(/[?#]/,1)[0]+'?v=4':stampResourceUrl(value,owner,allowed,revision);
      const inner=attribute.index+attribute[0].indexOf(attribute[2])+1,start=match.index+inner;
      if(stamped!==value)edits.push({kind:'html-resource',start,end:start+attribute[3].length,before:attribute[3],after:encodeAttribute(stamped)});
      if(bootstrapHelper&&helperIntegrity){
        const sri=/(?:^|\s)integrity\s*=\s*(["'])(.*?)\1/i.exec(tag);
        if(sri){const at=match.index+sri.index+sri[0].indexOf(sri[1])+1;edits.push({kind:'bootstrap-helper-integrity',start:at,end:at+sri[2].length,before:sri[2],after:helperIntegrity});}
        else{const at=match.index+tag.length-1;edits.push({kind:'bootstrap-helper-integrity',start:at,end:at,before:'',after:' integrity="'+helperIntegrity+'"'});}
      }
    }
  }
  return {edits,unresolved};
}

export function helperSri(bytes){return 'sha256-'+createHash('sha256').update(bytes).digest('base64');}
export function stampRuntimeText(source,owner,{allowed,revision,helperIntegrity}={}){
  source=String(source);if(!stampableRuntimePath(owner))return {text:source,rewrites:[],unresolved:[]};
  const extension=path.posix.extname(owner);let edits=[],unresolved=[];
  if(extension==='.mjs'||extension==='.js')({edits,unresolved}=javascriptEdits(source,owner,allowed,revision,{module:extension==='.mjs'}));
  else if(extension==='.css')edits=cssEdits(source,owner,allowed,revision);
  else ({edits,unresolved}=htmlEdits(source,owner,allowed,revision,helperIntegrity));
  if(owner==='v2/app.html')for(const match of source.matchAll(/(WHPwaExpectedRevision\s*=\s*["'])(?:__WH_PWA_REVISION__|[a-f0-9]{16})(["'])/g)){
    const start=match.index+match[1].length,end=match.index+match[0].length-match[2].length;
    edits.push({kind:'bootstrap-expected-revision',start,end,before:source.slice(start,end),after:revision});
  }
  return {...applyEdits(source,edits),unresolved};
}

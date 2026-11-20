// Immutable serialized source metadata, shared by all snapshots of each book.
// Browser readers prepare it at the first book boundary. Node producers retain
// the adjacent full JSON and their synchronous cold/scratch validation path.
const jsonReads=new Map();
const fileSystem=globalThis.process?.getBuiltinModule?.('fs');
function runtimeJSON(input,{fetch=globalThis.fetch}={}) {
 const url=new URL(input,import.meta.url),key=url.href;
 if(jsonReads.has(key))return jsonReads.get(key);
 if(url.protocol==='file:'&&fileSystem){
  const value=JSON.parse(fileSystem.readFileSync(url,'utf8'));
  const record={value,promise:Promise.resolve(value)};jsonReads.set(key,record);return record;
 }
 const record={};
 record.promise=Promise.resolve().then(async()=>{
  if(typeof fetch!=='function')throw new TypeError('Runtime JSON fetch unavailable: '+key);
  const response=await fetch(url);
  if(!response.ok)throw new Error('Runtime JSON unavailable: '+key);
  return response.json();
 }).catch(error=>{if(jsonReads.get(key)===record)jsonReads.delete(key);throw error;});
 jsonReads.set(key,record);return record;
}
/** One ordinary JSON read/parse per URL; failed reads are retryable. */
export function loadRuntimeJSON(url,options) {
 try{return runtimeJSON(url,options).promise;}catch(error){return Promise.reject(error);}
}

const catalogURL=new URL('./source-catalog.json',import.meta.url);
let catalog,catalogPromise,documents=new Map();
const expanded=new Map();
const freeze=value=>{if(value&&typeof value==='object'&&!Object.isFrozen(value)){for(const child of Object.values(value))freeze(child);Object.freeze(value);}return value;};
function installCatalog(value) {
 const nextDocuments=new Map();
 for(const table of Object.values(value.documents))for(const [id,document]of Object.entries(table)){
  if(nextDocuments.has(id)&&JSON.stringify(nextDocuments.get(id))!==JSON.stringify(document))throw Error('Conflicting source document identity');
  nextDocuments.set(id,document);
 }
 for(const table of Object.values(value.documents))Object.freeze(table);
 for(const table of Object.values(value))Object.freeze(table);
 Object.freeze(value);documents=nextDocuments;catalog=value;return value;
}
if(catalogURL.protocol==='file:'&&fileSystem){
 const read=runtimeJSON(catalogURL);installCatalog(read.value);catalogPromise=read.promise;
}
/** The application awaits this before opening the first book/roster. */
export function loadSourceCatalog(options) {
 if(catalogPromise)return catalogPromise;
 const read=loadRuntimeJSON(catalogURL,options);
 const pending=read.then(installCatalog).catch(error=>{
  if(catalogPromise===pending)catalogPromise=undefined;
  if(jsonReads.get(catalogURL.href)?.promise===read)jsonReads.delete(catalogURL.href);
  throw error;
 });
 catalogPromise=pending;return pending;
}
function requireCatalog(){if(!catalog)throw new Error('Source catalog is not loaded');}
export function catalogValue(kind,id){
 requireCatalog();
 if(kind==='documents')return documents.get(id);
 return catalog[kind]?.[id];
}
export function catalogBinding(id){
 requireCatalog();
 if(expanded.has(id))return expanded.get(id);
 const raw=catalog.bindings[id];if(!raw)return undefined;
 const [order,entries]=raw;
 const value=Object.fromEntries(entries.map(([slot,layout,refs,contexts,fields])=>[slot,{layout,refs,contexts,...(fields?{fields}:{})}]));
 value.$schema='source-refs/v1';value.$order=order;freeze(raw);expanded.set(id,value);return value;
}

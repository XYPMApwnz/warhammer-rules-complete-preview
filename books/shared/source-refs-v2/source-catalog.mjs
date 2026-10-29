// Immutable serialized source metadata, shared by all snapshots of each book.
import catalog from './source-catalog.json' with {type:'json'};
const expanded=new Map(),documents=new Map();
const freeze=value=>{if(value&&typeof value==='object'&&!Object.isFrozen(value)){for(const child of Object.values(value))freeze(child);Object.freeze(value);}return value;};
for(const table of Object.values(catalog.documents))for(const [id,value]of Object.entries(table)){
 if(documents.has(id)&&JSON.stringify(documents.get(id))!==JSON.stringify(value))throw Error('Conflicting source document identity');
 documents.set(id,value);
}
for(const table of Object.values(catalog.documents))Object.freeze(table);
for(const table of Object.values(catalog))Object.freeze(table);
Object.freeze(catalog);
export function catalogValue(kind,id){
 if(kind==='documents')return documents.get(id);
 return catalog[kind]?.[id];
}
export function catalogBinding(id){
 if(expanded.has(id))return expanded.get(id);
 const raw=catalog.bindings[id];if(!raw)return undefined;
 const [order,entries]=raw;
 const value=Object.fromEntries(entries.map(([slot,layout,refs,contexts,fields])=>[slot,{layout,refs,contexts,...(fields?{fields}:{})}]));
 value.$schema='source-refs/v1';value.$order=order;freeze(raw);expanded.set(id,value);return value;
}

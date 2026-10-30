/** Test-only access to the exact recorded source declaration. Mutations are
 * republished as canonical source refs before the real production path runs. */
import {compileBookSourceRefs,registerBookSources,sourceDeclarationView,sourceSnapshot,getSourceBindings,copySourceEvidence,mergeSourceEvidence}
  from '../../books/shared/source-refs-v2/source-refs.mjs';

const sourceSlots=new Set(['provenance','sourceProvenance','effectProvenance','fieldProvenance']);
const compilerSlots=new Set(['provenance','sourceProvenance','effectProvenance','mfmProvenance','sourceEvidence','fieldProvenance','currentness','sourceId']);
const clone=value=>Array.isArray(value)?value.map(clone):value&&typeof value==='object'
  ?Object.fromEntries(Object.entries(value).map(([key,item])=>[key,clone(item)])):value;
export function parseSourceFixtureJSON(text){const value=JSON.parse(text);registerBookSources(value);return value;}
export function sourceFixture(record,{book}={}) {
  if(!record||typeof record!=='object')return record;
  registerBookSources(book||record);
  const replace=(slot,value,remove=false)=>{
    const customSlots=Object.keys(getSourceBindings(record)||{}).filter(key=>!key.startsWith('$')&&key!=='recordReference'&&!compilerSlots.has(key));
    const declaration=sourceDeclarationView(record,{book});
    if(remove)delete declaration[slot];else declaration[slot]=clone(value);
    const custom=customSlots.filter(key=>Object.hasOwn(declaration,key)).map(key=>[key,declaration[key]]);
    for(const key of customSlots)delete declaration[key];
    const normalized=compileBookSourceRefs(declaration);
    if(custom.length)Object.assign(normalized,mergeSourceEvidence(normalized,...custom.map(([key,value])=>
      copySourceEvidence(compileBookSourceRefs({provenance:value}),{targetSlot:key}))));
    for(const key of Object.keys(record))delete record[key];
    Object.assign(record,normalized);registerBookSources(record);
  };
  const mutable=(value,commit)=>{
    if(!value||typeof value!=='object')return value;
    return new Proxy(value,{
      get(target,key){return mutable(Reflect.get(target,key),commit);},
      set(target,key,next){Reflect.set(target,key,next);commit();return true;},
      deleteProperty(target,key){Reflect.deleteProperty(target,key);commit();return true;}
    });
  };
  return new Proxy(record,{
    get(target,key){
      if(!sourceSlots.has(key)&&!getSourceBindings(target)?.[key])return Reflect.get(target,key);
      const value=sourceSnapshot(target,{book,slot:key});
      return mutable(value,()=>replace(key,value));
    },
    set(target,key,value){if(sourceSlots.has(key)||getSourceBindings(target)?.[key]){replace(key,value);return true;}return Reflect.set(target,key,value);},
    deleteProperty(target,key){if(sourceSlots.has(key)||getSourceBindings(target)?.[key]){replace(key,undefined,true);return true;}return Reflect.deleteProperty(target,key);}
  });
}

import {createCSMRosterRuntime} from './roster-runtime.mjs';
import {createCSMRosterImport} from './roster-import.mjs';
import {createCSMRosterEffectContext} from './roster-effect-context.mjs';
import {normalizeCSMEffectiveBook} from './roster-presentation.mjs';
import {projectEffectiveInstance} from '../../shared/roster-v2/effective-instance.mjs';
import {projectRosterRelated} from '../../shared/roster-v2/related.mjs';
import {bindImportedEnhancementBearers} from '../../shared/roster-v2/enhancement-bearers.mjs';
import {commitRosterImport} from '../../shared/roster-v2/runtime.mjs';

/** Adapt the existing native roster service to the common UI service contract.
 * Execution, import and attachment legality remain with their existing owners. */
export function createCSMBrowserRoster(book,importBook,bindings) {
  const runtime=createCSMRosterRuntime(book,importBook,bindings);
  const importer=createCSMRosterImport(importBook);
  const viewBook=normalizeCSMEffectiveBook(book);
  const service={
    catalog:book.entities.map(entity=>({id:entity.id,kind:entity.kind,parentId:entity.parentId,
      title:entity.displayName||entity.data.title||entity.data.name||entity.id})),
    get state(){return runtime.state;},get projection(){return runtime.projection;},get groups(){return runtime.groups;},
    draft:runtime.draft,
    import(text,choices={},options){
      const result=importer.import(text,choices);if(result.status!=='READY')return result;
      const bound=bindImportedEnhancementBearers(book,result.roster,createCSMRosterEffectContext(book,result.roster),choices.enhancementBearers);
      if(bound.needsBindings.length)return {...result,status:'NEEDS_BINDINGS',roster:null,needsBindings:bound.needsBindings};
      return commitRosterImport({...result,roster:bound.state},runtime.state,runtime.load,options);
    },
    load:runtime.load,snapshot:runtime.snapshot,
    context:runtime.context,modelScopes:runtime.modelScopes,
    attach:(leaderId,bodyguardId)=>runtime.attach(bodyguardId,leaderId),
    detach:runtime.detach,reattach:(leaderId,bodyguardId)=>runtime.reattach(bodyguardId,leaderId),
    candidates(leaderId){return runtime.state.units.filter(unit=>runtime.candidates(unit.instanceId)
      .some(candidate=>candidate.instanceId===leaderId)).map(unit=>({instanceId:unit.instanceId,canonicalUnitId:unit.canonicalUnitId}));},
    effective:id=>projectEffectiveInstance(viewBook,runtime.projection,id),
    related(instanceId,detachmentId=null){
      const state=runtime.state,projection=runtime.projection;
      const evaluator=createCSMRosterEffectContext(book,state,{abilityProjection:projection});
      return projectRosterRelated({book,state,projection,context:runtime.context,...evaluator},instanceId,detachmentId);
    }
  };
  return service;
}
export async function createBrowserRoster({fetch:read=globalThis.fetch}={}) {
  const inputs=await Promise.all(['./generated/roster-runtime.json','./generated/roster-import.json','./roster-attachment-bindings.json'].map(async path=>{
    const response=await read(new URL(path,import.meta.url));
    if(!response.ok)throw new TypeError('Canonical roster input unavailable');
    return response.json();
  }));
  return createCSMBrowserRoster(...inputs);
}

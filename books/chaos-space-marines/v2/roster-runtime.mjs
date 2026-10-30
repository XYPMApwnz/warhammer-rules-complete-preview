import {createCSMRosterAttachments} from './roster-attachments.mjs';
import {createCSMRosterImport} from './roster-import.mjs';
import {buildCSMAttachmentInputs} from './roster-attachment-build.mjs';
import {evaluateCSMRosterDeclarations} from './roster-effect-context.mjs';
import {changeAttachment,predicateContext} from '../../shared/roster-v2/context.mjs';
import {validateRosterEffects} from '../../shared/roster-v2/effects.mjs';
import {createRuleContractSchema} from '../../shared/rule-contract-v2/schema.mjs';
import {commitRosterImport} from '../../shared/roster-v2/runtime.mjs';
import {cloneSourceBook} from '../../shared/source-refs-v2/source-refs.mjs';

/** Compose native import + attachment state with the existing interpreter.
 * All rebuilds start from immutable canonical inputs. No presentation is mounted. */
export function createCSMRosterRuntime(runtimeBook,importBook,bindings) {
  const book=cloneSourceBook(runtimeBook),attachments=createCSMRosterAttachments(importBook,bindings),importer=createCSMRosterImport(importBook);
  const validationBook=buildCSMAttachmentInputs(importBook,bindings).book;
  const schema=createRuleContractSchema(book.rosterSchema);
  validateRosterEffects(book,schema.validatePredicate,schema.evaluatePredicate);
  let projection=null;
  const service={
    get state(){return attachments.state;},
    get projection(){return projection?structuredClone(projection):null;},
    get groups(){return projection?structuredClone(projection.formedUnits):[];},
    draft:text=>importer.draft(text),
    import(text,choices,options){return commitRosterImport(importer.import(text,choices),service.state,service.load,options);},
    load(snapshot){
      // Validate imported selection fields through their existing boundary as
      // well as the formed graph. Do not derive absent choices or history.
      importer.load({...structuredClone(snapshot),attachments:[]});
      const next=evaluateCSMRosterDeclarations(book,snapshot,{validationBook});
      attachments.load(snapshot);projection=next;return service.state;
    },
    snapshot:()=>attachments.snapshot(),
    candidates:bodyguardId=>attachments.candidates(bodyguardId),
    attach(bodyguardId,participantId){return service.load(changeAttachment(validationBook,service.state,book.rosterAttachmentPolicies,'ATTACH',participantId,bodyguardId));},
    detach(participantId){return service.load(changeAttachment(validationBook,service.state,book.rosterAttachmentPolicies,'DETACH',participantId));},
    reattach(bodyguardId,participantId){return service.load(changeAttachment(validationBook,service.state,book.rosterAttachmentPolicies,'REATTACH',participantId,bodyguardId));},
    context(instanceId,subject='UNIT',modelId){return predicateContext(service.state,projection,instanceId,subject,modelId);},
    modelScopes:instanceId=>attachments.modelScopes(instanceId)
  };
  return service;
}

export async function loadRosterRuntime({fetch:read=globalThis.fetch}={}) {
  const responses=await Promise.all(['./generated/roster-runtime.json','./generated/roster-import.json','./roster-attachment-bindings.json'].map(path=>read(new URL(path,import.meta.url))));
  if(responses.some(response=>!response.ok))throw new TypeError('Unable to load canonical CSM runtime inputs');
  return createCSMRosterRuntime(...await Promise.all(responses.map(response=>response.json())));
}

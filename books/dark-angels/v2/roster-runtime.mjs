/** Native snapshot adapter to the existing shared runtime; no importer or
 * attachment permissions are invented here. Rebind physical conditions on load. */
import {createRosterRuntime} from '../../shared/roster-v2/runtime.mjs';
import {createDarkAngelsRuleSchema} from './rule-contract-schema.mjs';
import {changeAttachment,formRoster} from '../../shared/roster-v2/context.mjs';
const clone=structuredClone;
export function createDarkAngelsRosterRuntime(built){
 const template=clone(built.book||built);let active=null,boundSchema=null;
 if(template.bookId!=='dark-angels')throw new TypeError('Wrong native roster book');
 const ready=()=>{if(!active)throw new TypeError('No physical roster');return active;};
 const service={
  get book(){return clone(template);},get state(){return active?.state||null;},get projection(){return active?.projection||null;},
  get catalog(){return active?.catalog||template.entities.map(entity=>({id:entity.id,kind:entity.kind,parentId:entity.parentId,title:entity.data.title||entity.data.name||entity.id}));},
  load(snapshot){
   const state=clone(snapshot);
   // The former equipment binder formed the roster before chapter validation.
   // Keep that pure preflight order so rejected snapshots retain their diagnostic.
   formRoster(template,state);
   const schema=createDarkAngelsRuleSchema({state,book:template,conditionInputs:[
    {key:'equipmentBearerSatisfied',arguments:{quantityProof:'POSITIVE_SELECTION'},clearUnrequestedEquipment:true}]});
   const next=createRosterRuntime(template,schema);next.load(state);active=next;boundSchema=schema;return active.state;
  },
  snapshot(){return ready().snapshot();},effective(id){return ready().effective(id);},
  context(...args){const runtime=ready();return boundSchema.bindPhysicalContext(runtime.context(...args));},related(...args){return ready().related(...args);},
  candidates(id){return active?.candidates(id)||[];},
  attach(source,target){return service.load(changeAttachment(template,ready().snapshot(),template.rosterAttachmentPolicies,'ATTACH',source,target));},
  detach(source){return service.load(changeAttachment(template,ready().snapshot(),template.rosterAttachmentPolicies,'DETACH',source));},
  reattach(source,target){return service.load(changeAttachment(template,ready().snapshot(),template.rosterAttachmentPolicies,'REATTACH',source,target));},
  chapterContext(instanceId){
   ready();const proof=boundSchema.physicalChapterContexts.find(row=>row.instanceId===instanceId);
   if(!proof)throw new TypeError('Unresolved physical UNIT chapter context');return clone(proof);
  },
  recompute(){const state=this.snapshot();return this.load(state);}
 };return service;
}

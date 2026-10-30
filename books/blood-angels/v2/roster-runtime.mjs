import {cloneSourceBook} from '../../shared/source-refs-v2/source-refs.mjs';
/** Native snapshot adapter to the existing shared runtime; no importer or
 * attachment permissions are invented here. Rebind physical conditions on load. */
import {createRosterRuntime} from '../../shared/roster-v2/runtime.mjs';
import {createBloodAngelsRuleSchema} from './rule-contract-schema.mjs';
import {changeAttachment} from '../../shared/roster-v2/context.mjs';
import {createPhysicalEquipmentConditionContext} from '../../shared/roster-v2/physical-condition-context.mjs';
const clone=structuredClone;
export function createBloodAngelsRosterRuntime(built){
 const template=cloneSourceBook(built.book||built);let active=null,boundSchema=null;
 if(template.bookId!=='blood-angels')throw new TypeError('Wrong native roster book');
 const ready=()=>{if(!active)throw new TypeError('No physical roster');return active;};
 const service={
  get book(){return clone(template);},get state(){return active?.state||null;},get projection(){return active?.projection||null;},
  get catalog(){return active?.catalog||template.entities.map(entity=>({id:entity.id,kind:entity.kind,parentId:entity.parentId,title:entity.data.title||entity.data.name||entity.id}));},
  load(snapshot){
   const state=clone(snapshot),schema=createBloodAngelsRuleSchema({state,book:template,bindContext:createPhysicalEquipmentConditionContext(template,state,{equipmentMode:'UNIFORM_PHYSICAL_GROUP',clearUnrequestedEquipment:true})});
   const next=createRosterRuntime(template,schema);next.load(state);active=next;boundSchema=schema;return active.state;
  },
  snapshot(){return ready().snapshot();},effective(id){return ready().effective(id);},
  context(...args){const runtime=ready();return boundSchema.bindPhysicalContext(runtime.context(...args));},related(...args){return ready().related(...args);},
  candidates(id){return active?.candidates(id)||[];},
  attach(source,target){return service.load(changeAttachment(template,ready().snapshot(),template.rosterAttachmentPolicies,'ATTACH',source,target));},
  detach(source){return service.load(changeAttachment(template,ready().snapshot(),template.rosterAttachmentPolicies,'DETACH',source));},
  reattach(source,target){return service.load(changeAttachment(template,ready().snapshot(),template.rosterAttachmentPolicies,'REATTACH',source,target));},
  recompute(){const state=this.snapshot();return this.load(state);}
 };return service;
}

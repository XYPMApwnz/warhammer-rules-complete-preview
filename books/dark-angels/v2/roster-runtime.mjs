/** Native snapshot adapter to the existing shared runtime; no importer or
 * attachment permissions are invented here. Rebind physical conditions on load. */
import {createRosterRuntime} from '../../shared/roster-v2/runtime.mjs';
import {createDarkAngelsRuleSchema} from './rule-contract-schema.mjs';
import {changeAttachment,formRoster} from '../../shared/roster-v2/context.mjs';
const clone=structuredClone;
function physicalEquipmentContext(book,state){
 const projection=formRoster(book,state),sources=new Set((book.rosterPermanentDoctrineSources||[]).map(row=>row.unitId)),permanent=new Set();
 for(const unit of projection.units.filter(row=>sources.has(row.canonicalUnitId))){
  const group=projection.formedUnits.find(row=>row.formedUnitId===unit.formedUnitId);
  for(const id of group?.memberInstanceIds||[unit.instanceId])permanent.add(id);
 }
 return (context,predicate)=>{
  if(!context)return context;
  const roster={...context.roster,smPhysicalUnitInstanceId:context.instanceId||'',
   smPhysicalModelScopeId:context.subject==='MODEL'?context.modelScopeId||'':'',smPermanentAssaultSource:permanent.has(context.instanceId)};
  delete roster.smEquipmentBearerSatisfied;
  if(predicate?.predicate==='FIELD'&&predicate.arguments.key==='smEquipmentBearerSatisfied'){
   const id=predicate.evidence?.otherEntityId,unit=state.units.find(row=>row.instanceId===context.instanceId);let selected=false;
   if(unit&&context.modelScopeId)for(const row of unit.modelRows){
    const groups=[{key:row.rowId,kind:'PROFILE',selections:row.selections||[]},
     ...(row.loadouts||[]).map(loadout=>({key:loadout.loadoutId,kind:'LOADOUT',selections:[...(row.selections||[]),...(loadout.selections||[])]}))];
    for(const group of groups)if(`${unit.instanceId}/${row.rowId}/${group.kind}/${group.key}`===context.modelScopeId)
     selected=group.selections.some(selection=>selection.physicalQuantity>0&&selection.canonicalEquipmentIds?.includes(id)&&selection.canonicalFieldPaths?.[id]?.includes('/text'));
   }
   roster.smEquipmentBearerSatisfied=selected;
  }
  return {...context,roster};
 };
}
export function createDarkAngelsRosterRuntime(built){
 const template=clone(built.book||built);let active=null,boundSchema=null;
 if(template.bookId!=='dark-angels')throw new TypeError('Wrong native roster book');
 const ready=()=>{if(!active)throw new TypeError('No physical roster');return active;};
 const service={
  get book(){return clone(template);},get state(){return active?.state||null;},get projection(){return active?.projection||null;},
  get catalog(){return active?.catalog||template.entities.map(entity=>({id:entity.id,kind:entity.kind,parentId:entity.parentId,title:entity.data.title||entity.data.name||entity.id}));},
  load(snapshot){
   const state=clone(snapshot),schema=createDarkAngelsRuleSchema({state,book:template,bindContext:physicalEquipmentContext(template,state)});
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

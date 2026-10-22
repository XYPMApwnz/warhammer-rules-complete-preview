/** Native snapshot adapter to the existing shared runtime; no importer or
 * attachment permissions are invented here. Rebind physical conditions on load. */
import {createRosterRuntime} from '../../shared/roster-v2/runtime.mjs';
import {createBloodAngelsRuleSchema} from './rule-contract-schema.mjs';
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
    const allocated=(row.loadouts||[]).reduce((n,loadout)=>n+loadout.quantity,0);
    const groups=[{key:row.rowId,kind:'PROFILE',quantity:row.quantity-allocated,selections:[]},
     ...(row.loadouts||[]).map(loadout=>({key:loadout.loadoutId,kind:'LOADOUT',quantity:loadout.quantity,selections:loadout.selections||[]}))];
    for(const group of groups)if(`${unit.instanceId}/${row.rowId}/${group.kind}/${group.key}`===context.modelScopeId){
     // A partial count in an undifferentiated MODEL row does not identify a
     // bearer. Uniform row equipment covers every group; a loadout selection
     // covers only its own physical group. Contradictory counts never qualify.
     const uniform=(selection,count)=>count>0&&selection.physicalQuantity===count&&
      (selection.perModelQuantity===undefined||selection.perModelQuantity===1)&&
      selection.canonicalEquipmentIds?.includes(id)&&selection.canonicalFieldPaths?.[id]?.includes('/text');
     selected=(row.selections||[]).some(selection=>uniform(selection,row.quantity))||
      group.selections.some(selection=>uniform(selection,group.quantity));
    }
   }
   roster.smEquipmentBearerSatisfied=selected;
  }
  return {...context,roster};
 };
}
export function createBloodAngelsRosterRuntime(built){
 const template=clone(built.book||built);let active=null,boundSchema=null;
 if(template.bookId!=='blood-angels')throw new TypeError('Wrong native roster book');
 const ready=()=>{if(!active)throw new TypeError('No physical roster');return active;};
 const service={
  get book(){return clone(template);},get state(){return active?.state||null;},get projection(){return active?.projection||null;},
  get catalog(){return active?.catalog||template.entities.map(entity=>({id:entity.id,kind:entity.kind,parentId:entity.parentId,title:entity.data.title||entity.data.name||entity.id}));},
  load(snapshot){
   const state=clone(snapshot),schema=createBloodAngelsRuleSchema({state,book:template,bindContext:physicalEquipmentContext(template,state)});
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

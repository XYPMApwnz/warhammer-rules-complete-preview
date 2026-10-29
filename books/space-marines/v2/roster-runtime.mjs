/** Browser-native book bindings around the existing physical roster/runtime.
 * Source readers and MFM producers remain outside the runtime dependency graph.
 */
import {createRosterRuntime} from '../../shared/roster-v2/runtime.mjs';
import {changeAttachment} from '../../shared/roster-v2/context.mjs';
import {createPhysicalEquipmentConditionContext} from '../../shared/roster-v2/physical-condition-context.mjs';
import {buildAttachmentFeasibility} from '../../shared/roster-v2/compatibility-feasibility.mjs';
import {createSpaceMarinesRuleSchema} from './rule-contract-schema.mjs';
import {bindSpaceMarinesStaticModels} from './roster-static-model-bindings.mjs';

const clone=structuredClone;
const requireValue=(value,message)=>{if(!value)throw new TypeError(message);};
export function createSpaceMarinesRosterRuntime(built){
  const template=clone(built.book||built),consumed=built.consumed||template.mfmImportReferences;
  requireValue(template.bookId==='space-marines'&&consumed?.relationDeclarations&&consumed.nativePoints,'Missing native MFM runtime bindings');
  const index=new Map(template.entities.map(entity=>[entity.id,entity]));
  let active=null,boundBook=null;
  const service={
    get book(){return clone(boundBook||template);},
    get state(){return active?.state||null;},get projection(){return active?.projection||null;},
    get catalog(){return active?.catalog||template.entities.map(entity=>({id:entity.id,kind:entity.kind,parentId:entity.parentId,title:entity.data.title||entity.data.name||entity.id}));},
    load(snapshot){
      requireValue(snapshot?.bookId==='space-marines','Wrong physical book');
      let nextBook=clone(template);const ids=snapshot.units.map(unit=>unit.canonicalUnitId);
      // Existing MFM ARMY_UNIT_PRESENT declarations are resolved from the whole
      // physical army, independently of attachments. No faction/name heuristic.
      nextBook.rosterAttachmentPolicies=consumed.relationDeclarations.flatMap(declaration=>{
        const condition=declaration.roleCondition;
        if(condition){
          const trigger=declaration.roleConditionProvenance?.armyRule?.triggerUnitId;
          requireValue(condition.kind==='ARMY_UNIT_PRESENT'&&typeof condition.expectedPresent==='boolean'&&index.get(trigger)?.kind==='DATASHEET','Unresolved conditional MFM role');
          if(ids.includes(trigger)!==condition.expectedPresent)return [];
        }
        return declaration.targets.filter(target=>target.status==='BOUND'&&index.get(target.entityId)?.kind==='DATASHEET').map(target=>({
          sourceId:declaration.sourceId,targetId:target.entityId,role:declaration.role.toUpperCase(),additionalLeaders:0,
          sourceIds:[declaration.sourceDeclarationId],mfmReferenceId:declaration.mfmRecordId}));
      });
      const composition=nextBook.rosterProfileBindings.map(binding=>{
        const unit=index.get(binding.unitId),rows=template.entities.filter(entity=>entity.kind==='COMPOSITION_MEMBER'&&entity.parentId===unit.id&&entity.data.profileBindingStatus==='SOURCE_CONFIRMED'&&entity.data.modelProfileId===binding.profileId);
        const reviewed=template.importBindings?.compositions.filter(row=>row.ownerId===unit.id&&row.profileId===binding.profileId);
        const confirmed=reviewed?.length?reviewed.reduce((n,row)=>n+row.quantity.max,0):rows.reduce((n,row)=>n+row.data.quantity.max,0);
        const sourceUnit=consumed.nativePoints.units.find(row=>row.id===unit.id);
        const unitMaximum=Math.max(...sourceUnit.points.map(row=>row.maxModels));
        // A conservative UNIT maximum is only a feasibility bound. It does not
        // resolve an unproven composition/profile identity.
        return {...binding,maxModels:confirmed||unitMaximum};
      });
      nextBook.compatibilityFeasibility=buildAttachmentFeasibility(nextBook,composition);
      nextBook=bindSpaceMarinesStaticModels(nextBook,snapshot);
      const schema=createSpaceMarinesRuleSchema({bindContext:createPhysicalEquipmentConditionContext(nextBook,snapshot,{equipmentMode:'POSITIVE_SELECTION',clearUnrequestedEquipment:false})});
      const next=createRosterRuntime(nextBook,schema);next.load(snapshot);
      active=next;boundBook=nextBook;return service.state;
    },
    snapshot(){requireValue(active,'No physical roster');return active.snapshot();},
    effective(id){requireValue(active,'No physical roster');return active.effective(id);},
    context(...args){requireValue(active,'No physical roster');return active.context(...args);},
    related(...args){requireValue(active,'No physical roster');return active.related(...args);},
    candidates(id){return active?.candidates(id)||[];},
    attach(source,target){return service.load(changeAttachment(boundBook,active.snapshot(),boundBook.rosterAttachmentPolicies,'ATTACH',source,target));},
    detach(source){return service.load(changeAttachment(boundBook,active.snapshot(),boundBook.rosterAttachmentPolicies,'DETACH',source));},
    reattach(source,target){return service.load(changeAttachment(boundBook,active.snapshot(),boundBook.rosterAttachmentPolicies,'REATTACH',source,target));},
    recompute(){return service.load(service.snapshot());}
  };
  return service;
}

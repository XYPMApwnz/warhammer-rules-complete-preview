/** Native book bindings around the existing physical roster/runtime. Constructed
 * snapshots only in this stage; no New Recruit parser/import adapter is supplied.
 */
import assert from 'node:assert/strict';
import {createRosterRuntime} from '../../shared/roster-v2/runtime.mjs';
import {buildAttachmentFeasibility} from '../../shared/roster-v2/compatibility-feasibility.mjs';
import {createEffectiveMfmArmyProjection} from '../../shared/tools/effective-mfm-army-projection.mjs';
import {buildSpaceMarinesContracts} from './rule-contract-build.mjs';
import {createSpaceMarinesRuleSchema} from './rule-contract-schema.mjs';

const clone=structuredClone;
const hasEquipment=(selection,id)=>selection.physicalQuantity>0&&selection.canonicalEquipmentIds?.includes(id)&&selection.canonicalFieldPaths?.[id]?.includes('/text');
function equipmentContext(state){
  return (context,predicate)=>{
    if(!context)return context;
    const id=predicate?.evidence?.otherEntityId;
    if(predicate?.predicate!=='FIELD'||predicate.arguments.key!=='smEquipmentBearerSatisfied')return context;
    const unit=state.units.find(row=>row.instanceId===context.instanceId);
    let selected=false;
    if(unit&&context.modelScopeId)for(const row of unit.modelRows){
      const groups=[{key:row.rowId,kind:'PROFILE',selections:row.selections||[]},
        ...(row.loadouts||[]).map(loadout=>({key:loadout.loadoutId,kind:'LOADOUT',selections:[...(row.selections||[]),...(loadout.selections||[])]}))];
      for(const group of groups)if(`${unit.instanceId}/${row.rowId}/${group.kind}/${group.key}`===context.modelScopeId)
        selected=group.selections.some(selection=>hasEquipment(selection,id));
    }
    // Aggregate UNIT quantity is inventory evidence, never a MODEL assignment.
    return {...context,roster:{...context.roster,smEquipmentBearerSatisfied:selected}};
  };
}

export function createSpaceMarinesRosterRuntime(built=buildSpaceMarinesContracts()){
  const template=clone(built.book),mfm=createEffectiveMfmArmyProjection('space-marines');
  const index=new Map(template.entities.map(entity=>[entity.id,entity]));
  let active=null,boundBook=null;
  const service={
    get book(){return clone(boundBook||template);},
    get state(){return active?.state||null;},get projection(){return active?.projection||null;},
    load(snapshot){
      assert.equal(snapshot?.bookId,'space-marines','Wrong physical book');
      const nextBook=clone(template),ids=snapshot.units.map(unit=>unit.canonicalUnitId);
      const edges=mfm.relationEdges({effectiveUnitIds:template.entities.filter(entity=>entity.kind==='DATASHEET').map(entity=>entity.id),presentUnitIds:ids});
      nextBook.rosterAttachmentPolicies=edges.map(edge=>{
        const declaration=built.consumed.relationDeclarations.find(row=>row.mfmRecordId===edge.mfmRecordId);
        assert.ok(declaration,'Missing exact MFM attachment declaration');
        return {sourceId:edge.sourceId,targetId:edge.targetId,role:edge.role.toUpperCase(),additionalLeaders:0,
          sourceIds:[declaration.sourceDeclarationId],mfmReferenceId:edge.mfmRecordId};
      });
      const composition=nextBook.rosterProfileBindings.map(binding=>{
        const unit=index.get(binding.unitId),rows=template.entities.filter(entity=>entity.kind==='COMPOSITION_MEMBER'&&entity.parentId===unit.id&&entity.data.profileBindingStatus==='SOURCE_CONFIRMED'&&entity.data.modelProfileId===binding.profileId);
        const confirmed=rows.reduce((n,row)=>n+row.data.quantity.max,0);
        const sourceUnit=built.consumed.nativePoints.units.find(row=>row.id===unit.id);
        const unitMaximum=Math.max(...sourceUnit.points.map(row=>row.maxModels));
        // A conservative UNIT maximum is only a feasibility bound. It does not
        // resolve any of the three unproven composition/profile identities.
        return {...binding,maxModels:confirmed||unitMaximum};
      });
      nextBook.compatibilityFeasibility=buildAttachmentFeasibility(nextBook,composition);
      const schema=createSpaceMarinesRuleSchema({bindContext:equipmentContext(snapshot)});
      const next=createRosterRuntime(nextBook,schema);next.load(snapshot);
      active=next;boundBook=nextBook;return service.state;
    },
    snapshot(){assert.ok(active,'No physical roster');return active.snapshot();},
    effective(id){assert.ok(active);return active.effective(id);},
    context(...args){assert.ok(active);return active.context(...args);},
    attach(source,target){const state=active.snapshot();state.attachments.push({leaderInstanceId:source,bodyguardInstanceId:target});return service.load(state);},
    detach(source){const state=active.snapshot();state.attachments=state.attachments.filter(row=>row.leaderInstanceId!==source);return service.load(state);},
    reattach(source,target){const state=active.snapshot();state.attachments=state.attachments.filter(row=>row.leaderInstanceId!==source);state.attachments.push({leaderInstanceId:source,bodyguardInstanceId:target});return service.load(state);},
    recompute(){return service.load(service.snapshot());}
  };
  return service;
}

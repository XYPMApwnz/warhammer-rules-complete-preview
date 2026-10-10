/** Independent MODEL ownership controls. No army data or imported name joins. */
import {createAbilityRangeFixture,rangeId as id} from './ability-range-fixture.mjs';
import {formRoster} from './context.mjs';

export function enhancementOwnerFixture() {
  const f=createAbilityRangeFixture(),rule=f.book.entities.find(entity=>entity.id===id('enhancement'));
  const selector={predicate:'MODEL_KEYWORD',subject:'MODEL',contextLevel:'STATIC',arguments:{keyword:'ELIGIBLE'},
    evidence:structuredClone(f.effect.evidence)};
  rule.ruleContract.roles[0]={...rule.ruleContract.roles[0],subject:'MODEL',selector};
  rule.ruleContract.assignment.selector=structuredClone(selector);
  Object.assign(f.effect,{operation:'MODIFY_STAT',field:'W',mode:'ADD',value:1,targetBinding:'SOURCE_MODEL',conditions:[]});
  delete f.effect.ability;
  for(const profile of f.book.entities.filter(entity=>entity.kind==='PROFILE'))profile.data.name='Same model caption';
  const scope=(instanceId,profile='eligible')=>formRoster(f.book,f.state).units.find(unit=>unit.instanceId===instanceId)
    .profiles.find(model=>model.canonicalProfileId===id(profile)).scopeId;
  const assign=(instanceId='a',profile='eligible',enhancementId=id('enhancement'))=>{
    const unit=f.state.units.find(unit=>unit.instanceId===instanceId);
    if(!unit.enhancementIds.includes(enhancementId))unit.enhancementIds.push(enhancementId);
    unit.enhancementAssignments=[...(unit.enhancementAssignments||[]).filter(row=>row.enhancementId!==enhancementId),
      {enhancementId,modelScopeId:scope(instanceId,profile)}];
  };
  return {...f,rule,scope,assign};
}

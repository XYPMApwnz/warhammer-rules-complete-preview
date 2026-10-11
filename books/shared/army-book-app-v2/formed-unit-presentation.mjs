import {instanceRoute} from './personal.mjs';

/** Reuse the datasheet surface for each exact physical component. Component
 * boundaries also keep popup context, scoped deduplication and ownership intact. */
export function renderFormedUnit(view,{el,renderComponent}) {
  if(!view.formedUnitId)return renderComponent(view.components[0]);
  const formed=el('section','v2-formed-unit');formed.dataset.formedUnitId=view.formedUnitId;
  formed.setAttribute('aria-label',view.components[0].card.title+' — Attached Unit');
  for(const component of view.components){
    const node=renderComponent(component);node.dataset.formedComponentInstanceId=component.unit.instanceId;
    node.dataset.contentsTarget=instanceRoute(component.unit.instanceId);formed.append(node);
  }
  return formed;
}

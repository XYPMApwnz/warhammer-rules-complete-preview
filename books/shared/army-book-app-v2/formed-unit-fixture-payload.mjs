/** QA-only adapter for CSM's already lowered composition-profile identities.
 * Normal CSM book profiles and runtime composition recipients have different
 * canonical addresses. This fixture projects existing typed records with the
 * shared projector; it does not connect a production CSM Personal Guide. */
import {projectArmyBook} from './project.mjs';
import {abilityParameters} from './ability-presentation.mjs';

/** Supply the shared ability planner's presentation category from canonical
 * occurrence bindings. All executable/effective values and recipients remain
 * untouched. This adapter belongs only to the not-yet-integrated UI fixture. */
export function bindFixtureAbilityPresentation(effective,payload) {
  const groups=new Map();
  const key=ability=>JSON.stringify([ability.canonicalId,abilityParameters(ability)]);
  for(const binding of Object.values(payload.datasheetPresentation?.referenceBindings?.fields||{}).flat()) {
    if(!binding.targetId||!binding.group)continue;
    const identity=key({canonicalId:binding.targetId,parameters:binding.parameters||{}});
    if(groups.has(identity)&&groups.get(identity)!==binding.group)throw new TypeError('Conflicting canonical fixture ability categories');
    groups.set(identity,binding.group);
  }
  const result=structuredClone(effective);
  for(const profile of result.profiles)for(const ability of profile.abilities||[]) {
    const group=groups.get(key(ability));
    if(!group)continue;
    if(ability.group&&ability.group!==group)throw new TypeError('Conflicting effective fixture ability category');
    ability.group=group;
  }
  return result;
}

export function prepareCSMFormedFixturePayload(payload,book) {
  const result=structuredClone(payload);
  const presentation=projectArmyBook({...book,currentness:{currentness:'CURRENT'},
    mfm:{source:{label:''},unitBindings:[],detachmentBindings:[],enhancementBindings:[],paidUpgradeBindings:[],relations:[],eligibilityEvidenceBindings:[]}},
    new Map(),{title:payload.title});
  const typedCards=new Map(presentation.cards.map(card=>[card.id,card]));
  const cards=new Map(result.cards.map(card=>[card.id,card]));
  for(const unit of book.entities.filter(entity=>entity.kind==='DATASHEET')) {
    const root=cards.get(unit.id),profileIds=unit.data.profileIds||[];
    for(const id of profileIds)if(cards.get(id)?.kind==='COMPOSITION_MEMBER') {
      const typed=typedCards.get(id);
      if(typed?.kind!=='PROFILE')throw new TypeError('Missing typed canonical fixture profile');
      const card=structuredClone(typed);
      card.fields=card.fields.filter(field=>field.source?.path==='/name'||field.source?.path.startsWith('/stats/'));
      for(const field of card.fields)if(field.source.path.startsWith('/stats/'))field.presentationPath=field.source.path.slice('/stats'.length);
      cards.set(id,card);
    }
    root.children=root.children.filter(id=>cards.get(id)?.kind!=='PROFILE'||profileIds.includes(id));
    for(const id of profileIds)if(!root.children.includes(id))root.children.push(id);
  }
  result.cards=[...cards.values()];
  return result;
}

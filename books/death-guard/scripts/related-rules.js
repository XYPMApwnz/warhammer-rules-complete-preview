(function(){
  'use strict';

  const exactTargets={
    'stratagem-deaths-heads':['biologus-putrifier'],
    'stratagem-persistent-pests':['nurglings'],
    'stratagem-grip-of-the-walking-pox':['poxwalkers'],
    'stratagem-smeared-with-filth':['poxwalkers'],
    'stratagem-gnawing-hunger':['poxwalkers'],
    'stratagem-hidden-amongst-the-dead':['poxwalkers'],
    'stratagem-signal-pox':['lord-of-virulence'],
    'stratagem-nauseating-paroxysms':['plague-marines'],
    'stratagem-droning-horror':['plague-marines'],
    'stratagem-eye-of-the-swarm':['plague-marines']
  };
  const contagionEngines=new Set(['foetid-bloat-drone','foetid-bloat-drone-with-heavy-blight-launcher','helbrute','myphitic-blight-hauler']);
  const bodyguards=new Set(['plague-marines','blightlord-terminators','deathshroud-terminators','poxwalkers']);
  const namedUnits={
    'MALIGNANT PLAGUECASTER':'malignant-plaguecaster','LORD OF POXES':'lord-of-poxes',
    'GREAT UNCLEAN ONE':'great-unclean-one','BIOLOGUS PUTRIFIER':'biologus-putrifier',
    'PLAGUE SURGEON':'plague-surgeon','NOXIOUS BLIGHTBRINGER':'noxious-blightbringer',
    'LORD OF VIRULENCE':'lord-of-virulence','PLAGUE MARINES':'plague-marines'
  };

  const normalized=node=>(node?.textContent||'').replace(/\s+/g,' ').trim().toUpperCase();
  function profile(unit){
    const keywords=[...unit.querySelectorAll('.unit-part')].find(part=>part.id.endsWith('-keywords'))||unit;
    const keywordLine=keywords.querySelector('.content-block p')||keywords;
    const ids=new Set([...keywordLine.querySelectorAll('[data-term]')].map(node=>node.dataset.term));
    const slug=(unit.id||'').replace(/^unit-/,'');
    return {
      slug,ids,
      has:id=>ids.has(id),
      attached:Boolean(unit.querySelector('[id$="-leader"]'))||bodyguards.has(slug),
      twoCharacters:slug==='plague-marines',
      contagionEngineCandidate:contagionEngines.has(slug),
      deadlyDemise:Boolean(unit.querySelector('[data-term="core-deadly-demise"]'))
    };
  }

  function targetText(card){
    const target=[...card.querySelectorAll('.field')].find(field=>normalized(field.querySelector('b'))==='TARGET');
    return normalized(target);
  }

  function enhancementMatches(card,unit){
    if(unit.has('keyword-epic-hero'))return false;
    const restriction=normalized(card.querySelector('p')).split('.')[0];
    if(restriction.includes('HELBRUTE')&&restriction.includes('MYPHITIC BLIGHT-HAULER'))return unit.slug==='helbrute'||unit.slug==='myphitic-blight-hauler';
    for(const [name,slug] of Object.entries(namedUnits))if(restriction.includes(name))return unit.slug===slug;
    if(restriction.includes('CONTAGION ENGINE'))return unit.contagionEngine;
    if(restriction.includes('TERMINATOR')){
      if(restriction.includes('EXCLUDING'))return unit.has('keyword-infantry')&&!unit.has('keyword-terminator');
      return unit.has('keyword-terminator');
    }
    if(restriction.includes('INFANTRY'))return unit.has('keyword-death-guard')&&unit.has('keyword-infantry');
    return restriction.includes('DEATH GUARD')&&unit.has('keyword-death-guard');
  }

  function stratagemMatches(card,unit){
    const id=card.dataset.ruleId||card.id;
    if(id.startsWith('core-stratagem-')){
      if(id==='core-stratagem-epic-challenge')return unit.has('keyword-character');
      if(id==='core-stratagem-explosives')return unit.has('keyword-explosives')||unit.has('keyword-grenades');
      if(id==='core-stratagem-crushing-impact')return unit.has('keyword-monster')||unit.has('keyword-vehicle');
      if(id==='core-stratagem-rapid-ingress')return !unit.has('keyword-aircraft');
      if(id==='core-stratagem-fire-overwatch')return !unit.has('keyword-titanic');
      if(id==='core-stratagem-smokescreen')return unit.has('keyword-smoke');
      if(id==='core-stratagem-heroic-intervention')return !unit.has('keyword-vehicle')||unit.has('keyword-character')||unit.has('keyword-walker');
      return true;
    }
    if(exactTargets[id])return exactTargets[id].includes(unit.slug);
    const target=targetText(card);
    if(!target)return false;
    if(target.includes('CONTAGION ENGINE'))return unit.contagionEngine;
    if(target.includes('PLAGUE LEGIONS MONSTER'))return unit.has('keyword-plague-legions')&&unit.has('keyword-monster');
    if(target.includes('PLAGUE LEGIONS'))return unit.has('keyword-plague-legions');
    if(target.includes('VEHICLE OR DEATH GUARD MONSTER'))return (unit.has('keyword-vehicle')||unit.has('keyword-monster'))&&(!target.includes('DEADLY DEMISE')||unit.deadlyDemise);
    if(target.includes('DEATH GUARD VEHICLE'))return unit.has('keyword-vehicle');
    if(target.includes('DEATH GUARD INFANTRY'))return unit.has('keyword-infantry');
    if(target.includes('TERMINATOR'))return unit.has('keyword-terminator');
    if(target.includes('ATTACHED UNIT'))return unit.attached;
    if(target.includes('INCLUDES TWO CHARACTER'))return unit.twoCharacters;
    if(target.includes('DEATH GUARD CHARACTER'))return unit.has('keyword-character');
    if(target.includes('WARLORD'))return unit.has('keyword-character');
    return target.includes('DEATH GUARD');
  }

  function matches(card,unitRoot){
    const base=unitRoot.slug?unitRoot:profile(unitRoot);
    const detachment=card.closest('[data-detachment]')?.dataset.detachment||'';
    const unit={...base,contagionEngine:detachment==='contagion-engines'&&base.contagionEngineCandidate};
    return card.classList.contains('enhancement')?enhancementMatches(card,unit):stratagemMatches(card,unit);
  }

  window.DGRelatedRules=Object.freeze({profile,matches});
}());

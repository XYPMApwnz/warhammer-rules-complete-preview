(function(){
  'use strict';

  const detachmentKeywordGrants=Object.freeze([
    {detachment:'shamblerot-vectorium',units:['poxwalkers'],id:'keyword-battleline',title:'BATTLELINE'},
    {detachment:'contagion-engines',units:['foetid-bloat-drone','foetid-bloat-drone-with-heavy-blight-launcher','helbrute','myphitic-blight-hauler'],id:'keyword-contagion-engine',title:'CONTAGION ENGINE'}
  ]);
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
    let candidates=[];
    try{candidates=JSON.parse(unit.dataset.relatedCandidates||'').map(candidate=>({...candidate,keywords:new Set(candidate.keywords.map(normalized))}));}catch{}
    const labels=new Set([...keywordLine.querySelectorAll('[data-term]')].map(node=>normalized(node)));
    return {
      slug,ids,
      unitId:unit.id,keywords:labels,intrinsicKeywords:labels,candidates:candidates.length?candidates:undefined,
      abilities:new Set(unit.querySelector('[data-term="core-deadly-demise"]')?['DEADLY DEMISE']:[]),
      has:id=>ids.has(id),
      attached:unit.hasAttribute('data-roster-attached')?unit.dataset.rosterAttached==='true':null,
      twoCharacters:unit.hasAttribute('data-roster-character-count')?unit.dataset.rosterCharacterCount==='2':null,
      warlord:unit.hasAttribute('data-roster-warlord')?unit.dataset.rosterWarlord==='true':null,
      deadlyDemise:Boolean(unit.querySelector('[data-term="core-deadly-demise"]'))
    };
  }

  const eligibilityByRule={};
  const add=(ids,targets,conditions=[])=>ids.forEach(id=>eligibilityByRule[id]={targets,conditions});
  const unit=(all=[],options={})=>({side:'friendly',count:1,all,...options});
  add(['core-stratagem-command-re-roll','core-stratagem-insane-bravery','core-stratagem-counteroffensive'],[unit()]);
  add(['core-stratagem-fire-overwatch'],[unit([], {none:['TITANIC']})]);
  add(['core-stratagem-heroic-intervention'],[unit([], {alternatives:[{noneKeywords:['VEHICLE']},{allKeywords:['WALKER']}]})]);
  add(['core-stratagem-rapid-ingress'],[unit([], {none:['AIRCRAFT']})]);
  add(['core-stratagem-epic-challenge'],[unit(['CHARACTER'])]);
  add(['core-stratagem-explosives'],[unit([], {any:['EXPLOSIVES','GRENADES']})]);
  add(['core-stratagem-crushing-impact'],[unit([], {any:['MONSTER','VEHICLE']})]);
  add(['core-stratagem-smokescreen'],[unit(['SMOKE'])]);
  add(['stratagem-putrid-detonation'],[unit(['DEATH GUARD'],{subject:'model',any:['VEHICLE','MONSTER'],allAbilities:['DEADLY DEMISE']})]);
  add(['stratagem-disgustingly-resilient','stratagem-leechspore-eruption','stratagem-drawn-to-despair','stratagem-clutching-corruption','stratagem-shock-and-horror'],[unit(['DEATH GUARD'])]);
  add(['stratagem-overwhelming-generosity','stratagem-territorial-infection','stratagem-aggravus-spasms','stratagem-simultaneous-contamination'],[unit(['DEATH GUARD','CHARACTER'])]);
  add(['stratagem-creeping-blight'],[unit(['DEATH GUARD','INFANTRY'])]);
  add(['stratagem-plaguesurge'],[unit(['DEATH GUARD','CHARACTER'],{subject:'model',warlord:true})]);
  add(['stratagem-blighted-land','stratagem-relentless-grind','stratagem-font-of-filth','stratagem-eyestinger-storm','stratagem-stinking-mire'],[unit(['DEATH GUARD','VEHICLE'])]);
  add(['stratagem-blessings-of-filth','stratagem-malignance-magnified','stratagem-grotesque-fortitude'],[unit(['DEATH GUARD'],{attached:true})]);
  add(['stratagem-rabid-infusion'],[unit(['DEATH GUARD'],{minCharacters:2})]);
  add(['stratagem-mobile-vector'],[unit(['DEATH GUARD','CHARACTER'],{attached:false})]);
  add(['stratagem-deaths-heads'],[unit([],{units:['unit-biologus-putrifier']})]);
  add(['stratagem-persistent-pests'],[unit([],{units:['unit-nurglings']})]);
  add(['stratagem-all-is-rot','stratagem-avatars-of-decay','stratagem-mireslick'],[unit(['PLAGUE LEGIONS'])]);
  add(['stratagem-fleshy-avalanche'],[unit(['PLAGUE LEGIONS','MONSTER'])]);
  add(['stratagem-grip-of-the-walking-pox','stratagem-smeared-with-filth','stratagem-gnawing-hunger'],[unit([],{units:['unit-poxwalkers']})]);
  add(['stratagem-hidden-amongst-the-dead'],[unit([],{units:['unit-poxwalkers'],attached:false})]);
  add(['stratagem-shambling-wall'],[unit(['DEATH GUARD']),unit([],{units:['unit-poxwalkers']})]);
  add(['stratagem-blooming-pestilence','stratagem-grim-reapers','stratagem-undying-spite','stratagem-mortarion-s-teachings','stratagem-sickening-impact'],[unit(['TERMINATOR'])]);
  add(['stratagem-signal-pox'],[unit([],{units:['unit-lord-of-virulence']})]);
  add(['stratagem-fresh-vectors','stratagem-bloodrust-deluge','stratagem-soulrot-flux'],[unit(['CONTAGION ENGINE'])]);
  add(['stratagem-nauseating-paroxysms','stratagem-droning-horror','stratagem-eye-of-the-swarm'],[unit([],{units:['unit-plague-marines']})]);

  function grantedKeywords(unitSlug,detachments=[]){
    return detachmentKeywordGrants.filter(grant=>detachments.includes(grant.detachment)&&grant.units.includes(unitSlug));
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
    return restriction.includes('DEATH GUARD')&&unit.has('keyword-death-guard')&&unit.has('keyword-character');
  }

  function stratagemMatches(card,unit){
    const id=card.dataset.ruleId||card.id;
    const eligibility=eligibilityByRule[id];
    return eligibility?window.WHRelatedRules.matches(eligibility,unit):false;
  }

  function matches(card,unitRoot){
    const base=unitRoot.slug?unitRoot:profile(unitRoot);
    const detachment=card.closest('[data-detachment]')?.dataset.detachment||'';
    const grants=grantedKeywords(base.slug,[detachment]),granted=new Set(grants.map(grant=>grant.id)),labels=grants.map(grant=>normalized({textContent:grant.title}));
    const candidates=(base.candidates||[base]).map(candidate=>({...candidate,keywords:new Set([...(candidate.keywords||base.keywords),...labels])}));
    const unit={...base,keywords:candidates[0].keywords,candidates,has:id=>base.has(id)||granted.has(id),contagionEngine:granted.has('keyword-contagion-engine')};
    return card.classList.contains('enhancement')?enhancementMatches(card,unit):stratagemMatches(card,unit);
  }

  window.DGRelatedRules=Object.freeze({profile,matches,grantedKeywords,eligibilityByRule});
}());

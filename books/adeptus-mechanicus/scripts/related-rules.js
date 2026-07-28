(function(root){
  'use strict';
  const normalize=value=>String(value||'').replace(/\s+/g,' ').trim().toUpperCase();
  const profile=card=>({
    slug:card.id.replace(/^unit-/,''),
    keywords:new Set((card.dataset.keywords||'').split('|').map(normalize)),
    abilities:new Set([...card.querySelectorAll('[id$="-abilities"] h5')].map(node=>normalize(node.textContent))),
    epic:(card.dataset.keywords||'').toUpperCase().includes('EPIC HERO')
  });
  const has=(unit,name)=>unit.keywords.has(name)||unit.abilities?.has(name);
  const namedUnits={
    'SKITARII MARSHAL':'skitarii-marshal',
    'SERBERYS RAIDERS':'serberys-raiders',
    'CYBERNETICA DATASMITH':'cybernetica-datasmith',
    'TECH-PRIEST DOMINUS':'tech-priest-dominus',
    'TECH-PRIEST MANIPULUS':'tech-priest-manipulus',
    'SKORPIUS DUNERIDER':'skorpius-dunerider'
  };
  function namedMatch(text,unit){
    const mentioned=Object.entries(namedUnits).filter(([name])=>text.includes(name));
    return mentioned.length?mentioned.some(([,slug])=>unit.slug===slug):null;
  }
  function enhancementMatches(text,unit){
    if(unit.epic)return false;
    if(text.includes('EXCLUDING CYBERNETICA DATASMITH')&&unit.slug==='cybernetica-datasmith')return false;
    const eligibleText=text.replace('EXCLUDING CYBERNETICA DATASMITH','');
    const named=namedMatch(eligibleText,unit);if(named!==null)return named;
    if(text.includes('TECH-PRIEST'))return has(unit,'TECH-PRIEST');
    if(text.includes('SKITARII'))return has(unit,'SKITARII');
    return text.includes('ADEPTUS MECHANICUS');
  }
  function stratagemMatches(text,unit){
    const named=namedMatch(text,unit);if(named!==null)return named;
    if(text.includes('NON-VEHICLE')&&has(unit,'VEHICLE'))return false;
    if(text.includes('EXCLUDING KATAPHRON')&&has(unit,'KATAPHRON'))return false;
    if(text.includes('LEGIO CYBERNETICA OR ADEPTUS MECHANICUS VEHICLE'))return has(unit,'LEGIO CYBERNETICA')||has(unit,'VEHICLE');
    if(text.includes('IRONSTRIDER BALLISTARII')&&text.includes('SICARIAN')&&text.includes('PTERAXII')&&text.includes('SYDONIAN'))return has(unit,'SICARIAN')||has(unit,'PTERAXII')||has(unit,'SYDONIAN')||unit.slug==='ironstrider-ballistarii'||(has(unit,'SKITARII')&&has(unit,'MOUNTED'));
    if(text.includes('INFILTRATORS OR PTERAXII'))return has(unit,'INFILTRATORS')||has(unit,'PTERAXII');
    if(text.includes('SICARIAN, PTERAXII OR SYDONIAN'))return has(unit,'SICARIAN')||has(unit,'PTERAXII')||has(unit,'SYDONIAN');
    if(text.includes('SKITARII INFANTRY OR MOUNTED'))return has(unit,'SKITARII')&&(has(unit,'INFANTRY')||has(unit,'MOUNTED'));
    if(text.includes('RECON AUGURY'))return has(unit,'RECON AUGURY');
    if(text.includes('ADEPTUS MECHANICUS INFANTRY')&&text.includes('TRANSPORT'))return has(unit,'INFANTRY')||has(unit,'TRANSPORT');
    if(text.includes('ADEPTUS MECHANICUS INFANTRY')&&text.includes('SMOKE'))return has(unit,'INFANTRY')||has(unit,'SMOKE');
    if(text.includes('ELECTRO-PRIESTS'))return has(unit,'ELECTRO-PRIESTS');
    if(text.includes('CULT MECHANICUS'))return has(unit,'CULT MECHANICUS');
    if(text.includes('TECH-PRIEST'))return has(unit,'TECH-PRIEST');
    if(text.includes('SKITARII VEHICLE'))return has(unit,'SKITARII')&&has(unit,'VEHICLE');
    if(text.includes('SKITARII INFANTRY'))return has(unit,'SKITARII')&&has(unit,'INFANTRY');
    if(text.includes('SKITARII'))return has(unit,'SKITARII');
    if(text.includes('SICARIAN'))return has(unit,'SICARIAN');
    if(text.includes('INFANTRY'))return has(unit,'INFANTRY');
    if(text.includes('VEHICLE'))return has(unit,'VEHICLE');
    return text.includes('ADEPTUS MECHANICUS')||/^THAT (?:UNIT|DESTROYED)/.test(text)||text.includes('ONE ELIGIBLE');
  }
  function matches(card,unitCard){
    const unit=unitCard.slug?unitCard:profile(unitCard);
    const text=normalize(card.classList.contains('stratagem')?card.dataset.target:card.querySelector('p')?.textContent);
    if(!text)return false;
    if(card.classList.contains('stratagem')&&/\bENEMY\b/.test(text))return false;
    return card.classList.contains('enhancement')?enhancementMatches(text,unit):stratagemMatches(text,unit);
  }
  function install(){
    const layer=document.createElement('div');layer.className='related-rules-layer';layer.hidden=true;layer.innerHTML='<section class="related-rules-dialog" role="dialog" aria-modal="true"><header><div><span>Datasheet tools</span><h2>Stratagems &amp; Enhancements</h2></div><button type="button" class="related-rules-close" aria-label="Close">&times;</button></header><div class="related-rules-body"></div></section>';document.body.append(layer);
    const close=()=>{layer.hidden=true;document.documentElement.classList.remove('related-rules-open');};
    layer.addEventListener('click',event=>{if(event.target===layer||event.target.closest('.related-rules-close'))close();});
    document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!layer.hidden)close();});
    let currentUnit=null;
    function open(unit,state={}){
      if(!unit)return null;currentUnit=unit;
      const body=layer.querySelector('.related-rules-body');body.replaceChildren();
      const active=new Set(root.AM_ROSTER_GUIDE?.detachmentIds||[]);
      const sections=[...document.querySelectorAll('.content-group.detachment')].filter(section=>!active.size||active.has(section.dataset.detachment));
      for(const section of sections){
        const cards=[...section.querySelectorAll('.stratagem,.enhancement')].filter(card=>matches(card,unit));if(!cards.length)continue;
        const group=document.createElement('section');group.className='related-rules-group';const title=document.createElement('h3');title.textContent=section.querySelector(':scope > .category-title')?.textContent||section.dataset.detachment;group.append(title);cards.forEach(card=>{const clone=card.cloneNode(true);clone.dataset.ruleId=clone.id;clone.removeAttribute('id');group.append(clone);});body.append(group);
      }
      if(!body.children.length)body.innerHTML='<p>No eligible Stratagems or Enhancements were found for this datasheet.</p>';
      layer.querySelector('h2').textContent=unit.dataset.unitTitle;layer.hidden=false;document.documentElement.classList.add('related-rules-open');layer.querySelector('.related-rules-close').focus();
      layer.querySelector('.related-rules-dialog').scrollTop=state.scrollTop||0;
      return layer;
    }
    document.addEventListener('click',event=>{
      const button=event.target.closest('.related-rules-trigger');if(!button)return;
      open(button.closest('.unit-card'));
    });
    return{
      layer,close,
      snapshot(origin){
        if(layer.hidden||!layer.contains(origin))return null;
        const card=origin.closest('[data-rule-id]'),termId=origin.dataset.term||'';
        const matches=card&&termId?[...card.querySelectorAll('[data-term="'+CSS.escape(termId)+'"]')]:[];
        return{type:'related-rules',unitId:currentUnit?.id||'',detachment:'',kind:'',scrollTop:layer.querySelector('.related-rules-dialog').scrollTop,ruleId:card?.dataset.ruleId||'',termId,occurrence:Math.max(0,matches.indexOf(origin))};
      },
      async restore(state){
        const unit=document.getElementById(state?.unitId);if(!open(unit,state))return null;
        const card=layer.querySelector('[data-rule-id="'+CSS.escape(state.ruleId||'')+'"]');
        const matches=card&&state.termId?[...card.querySelectorAll('[data-term="'+CSS.escape(state.termId)+'"]')]:[];
        return matches[state.occurrence]||matches[0]||null;
      }
    };
  }
  root.AMRelatedRules=Object.freeze({profile,matches,install});
}(window));

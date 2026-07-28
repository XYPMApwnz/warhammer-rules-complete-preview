(function(root){
  'use strict';
  let templatePromise;
  const normalize=value=>String(value||'').replace(/\s+/g,' ').trim().toUpperCase();
  const profile=card=>({
    id:card.id,
    slug:card.id.replace(/^unit-/,''),
    keywords:new Set((card.dataset.keywords||'').split('|').map(normalize)),
    epic:(card.dataset.keywords||'').toUpperCase().includes('EPIC HERO')
  });
  function targetMatches(target,unit){
    if(target.side!=='friendly')return false;
    const unitId=unit.id||`unit-${unit.slug}`;
    if(target.units?.length&&!target.units.includes(unitId))return false;
    if(target.all?.some(keyword=>!unit.keywords.has(normalize(keyword))))return false;
    if(target.any?.length&&!target.any.some(keyword=>unit.keywords.has(normalize(keyword))))return false;
    if(target.none?.some(keyword=>unit.keywords.has(normalize(keyword))))return false;
    return true;
  }
  function matches(card,unitCard){
    const unit=unitCard.slug?unitCard:profile(unitCard);
    try{return JSON.parse(card.dataset.eligibility||'').targets?.some(target=>targetMatches(target,unit))||false;}
    catch{return false;}
  }
  function getTemplate(){
    if(!templatePromise)templatePromise=fetch('./mobile/related-rules.inc?v=2')
      .then(response=>{if(!response.ok)throw new Error(`HTTP ${response.status}`);return response.text();})
      .then(html=>{const template=document.createElement('template');template.innerHTML=html;return template;})
      .catch(error=>{templatePromise=null;throw error;});
    return templatePromise;
  }
  function install(){
    const layer=document.createElement('div');
    layer.className='related-rules-layer';layer.hidden=true;
    layer.innerHTML='<section class="related-rules-dialog" role="dialog" aria-modal="true" aria-labelledby="relatedRulesTitle"><header><div><span>Datasheet tools</span><h2 id="relatedRulesTitle">Related rules</h2></div><button type="button" class="related-rules-close" aria-label="Close">&times;</button></header><div class="related-rules-body"><p>Loading rules&hellip;</p></div></section>';
    document.body.append(layer);
    const body=layer.querySelector('.related-rules-body'),title=layer.querySelector('h2');
    let unit=null,kind='stratagems',detachment='all',filterMenu,tabs,content,empty,sections=[];
    const filter=()=>{
      if(!content||!unit)return;
      const unitProfile=profile(unit);
      content.querySelectorAll('.stratagem,.enhancement').forEach(card=>card.hidden=!matches(card,unitProfile));
      const hasEnhancements=[...content.querySelectorAll('.enhancement')].some(card=>!card.hidden);
      const enhancementTab=tabs.querySelector('[data-kind="enhancements"]');
      enhancementTab.hidden=!hasEnhancements;
      if(kind==='enhancements'&&!hasEnhancements)kind='stratagems';
      content.querySelectorAll('[data-related-kind]').forEach(group=>{
        group.hidden=group.dataset.relatedKind!==kind||![...group.querySelectorAll('.stratagem,.enhancement')].some(card=>!card.hidden);
      });
      sections.forEach(section=>{
        const selected=section.dataset.detachment==='core'||detachment==='all'||section.dataset.detachment===detachment;
        section.hidden=!selected||![...section.querySelectorAll('[data-related-kind]')].some(group=>!group.hidden);
      });
      tabs.querySelectorAll('button').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.kind===kind)));
      const hasVisible=sections.some(section=>!section.hidden);
      empty.hidden=hasVisible;
      empty.textContent=`No matching ${kind} for this datasheet in the selected Detachments.`;
    };
    const close=()=>{layer.hidden=true;document.documentElement.classList.remove('related-rules-open');};
    layer.addEventListener('click',event=>{
      if(event.target===layer||event.target.closest('.related-rules-close'))close();
      const tab=event.target.closest('[data-kind]');if(tab){kind=tab.dataset.kind;filter();}
    });
    document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!layer.hidden)close();});
    async function open(current,state={}){
      if(!current)return null;
      unit=current;kind=state.kind||'stratagems';title.textContent=current.dataset.unitTitle||current.querySelector('.unit-name,h3')?.textContent.trim()||'Related rules';
      layer.hidden=false;document.documentElement.classList.add('related-rules-open');
      if(!content){
        try{
          const template=await getTemplate(),fragment=template.content.cloneNode(true);
          fragment.querySelectorAll('[id]').forEach(node=>{if(!node.dataset.ruleId)node.dataset.ruleId=node.id;node.removeAttribute('id');});
          sections=[...fragment.querySelectorAll('.related-detachment')];
          const rosterDetachments=new Set(root.AM_ROSTER_GUIDE?.detachmentIds||[]),rosterMode=rosterDetachments.size>0;
          if(rosterMode){
            sections.forEach(section=>{if(section.dataset.detachment!=='core'&&!rosterDetachments.has(section.dataset.detachment))section.remove();});
            sections=sections.filter(section=>section.dataset.detachment==='core'||rosterDetachments.has(section.dataset.detachment));
          }
          const detachmentSections=sections.filter(section=>section.dataset.detachment!=='core');
          const choices=[...(rosterMode&&detachmentSections.length===1?[]:[['all',rosterMode?'All roster detachments':'All detachments']]),...detachmentSections.map(section=>[section.dataset.detachment,section.querySelector('h2').textContent])];
          detachment=choices.length===1?choices[0][0]:'all';
          if(!rosterMode)try{const saved=localStorage.getItem('adeptus-mechanicus-detachment-filter');if(choices.some(([value])=>value===saved))detachment=saved;}catch{}
          filterMenu=document.createElement('details');filterMenu.className='full-related-filter';filterMenu.classList.toggle('is-static',choices.length===1);
          filterMenu.innerHTML='<summary><span>'+choices.find(([value])=>value===detachment)[1]+'</span></summary><div>'+choices.map(([value,label])=>'<button type="button" data-detachment="'+value+'" aria-pressed="'+(value===detachment)+'">'+label+'</button>').join('')+'</div>';
          tabs=document.createElement('div');tabs.className='full-related-tabs';tabs.innerHTML='<button type="button" data-kind="stratagems" aria-pressed="true">Stratagems</button><button type="button" data-kind="enhancements" aria-pressed="false">Enhancements</button>';
          const controls=document.createElement('div');controls.className='full-related-controls';controls.append(filterMenu,tabs);
          content=document.createElement('div');content.className='full-related-content';content.append(fragment);
          empty=document.createElement('p');empty.className='full-related-empty';
          body.replaceChildren(controls,content,empty);
          filterMenu.addEventListener('click',event=>{
            if(choices.length===1){event.preventDefault();return;}
            const button=event.target.closest('[data-detachment]');if(!button)return;
            detachment=button.dataset.detachment;filterMenu.querySelector('summary span').textContent=button.textContent;
            filterMenu.querySelectorAll('button').forEach(item=>item.setAttribute('aria-pressed',String(item===button)));
            filterMenu.open=false;if(!rosterMode)try{localStorage.setItem('adeptus-mechanicus-detachment-filter',detachment);}catch{}filter();
          });
        }catch{
          const message=document.createElement('p');message.textContent='Could not load related rules.';
          const retry=document.createElement('button');retry.type='button';retry.className='related-rules-retry';retry.textContent='Try again';retry.addEventListener('click',()=>open(current));
          body.replaceChildren(message,retry);return null;
        }
      }
      if(state.detachment&&sections.some(section=>section.dataset.detachment===state.detachment))detachment=state.detachment;
      filter();
      if(filterMenu)filterMenu.querySelector('summary span').textContent=filterMenu.querySelector('[data-detachment="'+CSS.escape(detachment)+'"]')?.textContent||filterMenu.querySelector('summary span').textContent;
      layer.querySelector('.related-rules-dialog').scrollTop=state.scrollTop||0;
      layer.querySelector('.related-rules-close').focus();
      return layer;
    }
    for(const current of document.querySelectorAll('.unit-card')){
      const keywords=[...current.querySelectorAll('.unit-part')].find(part=>part.id.endsWith('-keywords'));
      if(!keywords)continue;
      const button=document.createElement('button');button.type='button';button.className='related-rules-trigger';button.textContent='Stratagems & Enhancements';keywords.after(button);
    }
    document.addEventListener('click',event=>{const button=event.target.closest('.related-rules-trigger');if(button)open(button.closest('.unit-card'));});
    return{
      layer,close,
      snapshot(origin){
        if(layer.hidden||!layer.contains(origin))return null;
        const card=origin.closest('[data-rule-id]'),termId=origin.dataset.term||'',found=card&&termId?[...card.querySelectorAll('[data-term="'+CSS.escape(termId)+'"]')]:[];
        return{type:'related-rules',unitId:unit?.id||'',detachment,kind,scrollTop:layer.querySelector('.related-rules-dialog').scrollTop,ruleId:card?.dataset.ruleId||'',termId,occurrence:Math.max(0,found.indexOf(origin))};
      },
      async restore(state){
        const restoredUnit=document.getElementById(state?.unitId);if(!restoredUnit)return null;
        await open(restoredUnit,state);
        const card=layer.querySelector('[data-rule-id="'+CSS.escape(state.ruleId||'')+'"]'),found=card&&state.termId?[...card.querySelectorAll('[data-term="'+CSS.escape(state.termId)+'"]')]:[];
        return found[state.occurrence]||found[0]||null;
      }
    };
  }
  root.AMRelatedRules=Object.freeze({profile,targetMatches,matches,install});
}(window));

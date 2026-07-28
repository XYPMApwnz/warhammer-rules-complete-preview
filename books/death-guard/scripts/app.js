(function(){
  'use strict';
  let relatedRulesTemplate;

  async function getRelatedRulesTemplate(){
    if(!relatedRulesTemplate)relatedRulesTemplate=fetch('./mobile/related-rules.inc?v=2')
      .then(response=>{if(!response.ok)throw new Error('HTTP '+response.status);return response.text();})
      .then(html=>{const template=document.createElement('template');template.innerHTML=html;return template;})
      .catch(error=>{relatedRulesTemplate=null;throw error;});
    return relatedRulesTemplate;
  }

  function initRelatedRules(){
    const layer=document.createElement('div');
    layer.className='related-rules-layer';layer.hidden=true;
    layer.innerHTML='<section class="related-rules-dialog" role="dialog" aria-modal="true" aria-labelledby="relatedRulesTitle"><header><div><span>Datasheet tools</span><h2 id="relatedRulesTitle">Related rules</h2></div><button type="button" class="related-rules-close" aria-label="Close">&times;</button></header><div class="related-rules-body"><p>Loading rules&hellip;</p></div></section>';
    document.body.append(layer);
    const body=layer.querySelector('.related-rules-body'),title=layer.querySelector('h2');
    let unit=null,kind='stratagems',detachment='all',filterMenu,tabs,content,empty,sections;
    const filter=()=>{
      if(!content||!unit)return;
      const unitProfile=window.DGRelatedRules.profile(unit);
      content.querySelectorAll('.stratagem,.enhancement').forEach(card=>card.hidden=!window.DGRelatedRules.matches(card,unitProfile));
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
      const hasVisibleRules=sections.some(section=>!section.hidden);
      empty.hidden=hasVisibleRules;empty.textContent='No matching '+kind+' for this datasheet in the selected roster Detachments.';
    };
    const close=()=>{layer.hidden=true;document.documentElement.classList.remove('related-rules-open');};
    layer.addEventListener('click',event=>{
      if(event.target===layer||event.target.closest('.related-rules-close'))close();
      const button=event.target.closest('[data-kind]');if(button){kind=button.dataset.kind;filter();}
    });
    document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!layer.hidden)close();});
    async function open(current,state={}){
      unit=current;kind=state.kind||'stratagems';title.textContent=current.querySelector('.unit-name')?.textContent.trim()||'Related rules';
      layer.hidden=false;document.documentElement.classList.add('related-rules-open');
      if(!content){
        try{
          const template=await getRelatedRulesTemplate(),fragment=template.content.cloneNode(true);
          fragment.querySelectorAll('[id]').forEach(node=>{node.dataset.ruleId=node.id;node.removeAttribute('id');});
          sections=[...fragment.querySelectorAll('.related-detachment')];
          const rosterDetachments=new Set(window.DG_ROSTER_GUIDE?.detachmentIds||[]),rosterMode=rosterDetachments.size>0;
          if(rosterMode){sections.forEach(section=>{if(section.dataset.detachment!=='core'&&!rosterDetachments.has(section.dataset.detachment))section.remove();});sections=sections.filter(section=>section.dataset.detachment==='core'||rosterDetachments.has(section.dataset.detachment));}
          const detachmentSections=sections.filter(section=>section.dataset.detachment!=='core');
          const choices=[...(rosterMode&&detachmentSections.length===1?[]:[['all',rosterMode?'All roster detachments':'All detachments']]),...detachmentSections.map(section=>[section.dataset.detachment,section.querySelector('h2').textContent])];
          detachment=choices.length===1?choices[0][0]:'all';
          if(!rosterMode)try{const saved=localStorage.getItem('death-guard-detachment-filter');if(choices.some(([value])=>value===saved))detachment=saved;}catch{}
          filterMenu=document.createElement('details');filterMenu.className='full-related-filter';
          filterMenu.classList.toggle('is-static',choices.length===1);
          filterMenu.innerHTML='<summary><span>'+choices.find(([value])=>value===detachment)[1]+'</span></summary><div>'+choices.map(([value,label])=>'<button type="button" data-detachment="'+value+'" aria-pressed="'+(value===detachment)+'">'+label+'</button>').join('')+'</div>';
          tabs=document.createElement('div');tabs.className='full-related-tabs';tabs.innerHTML='<button type="button" data-kind="stratagems" aria-pressed="true">Stratagems</button><button type="button" data-kind="enhancements" aria-pressed="false">Enhancements</button>';
          const controls=document.createElement('div');controls.className='full-related-controls';controls.append(filterMenu,tabs);
          content=document.createElement('div');content.className='full-related-content';content.append(fragment);
          empty=document.createElement('p');empty.className='full-related-empty';
          body.replaceChildren(controls,content,empty);
          filterMenu.addEventListener('click',event=>{if(choices.length===1){event.preventDefault();return;}const button=event.target.closest('[data-detachment]');if(!button)return;detachment=button.dataset.detachment;filterMenu.querySelector('summary span').textContent=button.textContent;filterMenu.querySelectorAll('button').forEach(item=>item.setAttribute('aria-pressed',String(item===button)));filterMenu.open=false;if(!rosterMode)try{localStorage.setItem('death-guard-detachment-filter',detachment);}catch{}filter();});
          content.querySelectorAll('.stratagem').forEach(card=>{const when=[...card.querySelectorAll('.field')].find(field=>field.querySelector('b')?.textContent.trim().toLowerCase()==='when')?.textContent||'';const turn=/opponent|enemy/i.test(when)?'THEIR TURN':/your\b/i.test(when)?'YOUR TURN':'ANY TURN';card.dataset.turn=turn;card.classList.add(turn==='THEIR TURN'?'turn-their':turn==='YOUR TURN'?'turn-yours':'turn-any');});
        }catch{
          const retry=document.createElement('button');retry.type='button';retry.className='related-rules-retry';retry.textContent='Try again';
          retry.addEventListener('click',()=>open(current));
          const message=document.createElement('p');message.textContent='Could not load related rules.';
          body.replaceChildren(message,retry);return;
        }
      }
      if(state.detachment&&sections.some(section=>section.dataset.detachment===state.detachment))detachment=state.detachment;
      filter();
      if(filterMenu)filterMenu.querySelector('summary span').textContent=filterMenu.querySelector('[data-detachment="'+CSS.escape(detachment)+'"]')?.textContent||filterMenu.querySelector('summary span').textContent;
      layer.querySelector('.related-rules-dialog').scrollTop=state.scrollTop||0;
    }
    for(const current of document.querySelectorAll('.unit-card')){
      const keywords=[...current.querySelectorAll('.unit-part')].find(part=>part.id.endsWith('-keywords'));
      if(!keywords)continue;
      const button=document.createElement('button');button.type='button';button.className='related-rules-trigger';button.textContent='Stratagems & Enhancements';
      button.addEventListener('click',()=>open(current));keywords.after(button);
    }
    return{
      layer,close,
      snapshot(origin){
        if(layer.hidden||!layer.contains(origin))return null;
        const card=origin.closest('[data-rule-id]'),termId=origin.dataset.term||'';
        const matches=card&&termId?[...card.querySelectorAll('[data-term="'+CSS.escape(termId)+'"]')]:[];
        return{type:'related-rules',unitId:unit?.id||'',detachment,kind,scrollTop:layer.querySelector('.related-rules-dialog').scrollTop,ruleId:card?.dataset.ruleId||'',termId,occurrence:Math.max(0,matches.indexOf(origin))};
      },
      async restore(state){
        const restoredUnit=document.getElementById(state?.unitId);if(!restoredUnit)return null;
        await open(restoredUnit,state);
        const card=layer.querySelector('[data-rule-id="'+CSS.escape(state.ruleId||'')+'"]');
        const matches=card&&state.termId?[...card.querySelectorAll('[data-term="'+CSS.escape(state.termId)+'"]')]:[];
        return matches[state.occurrence]||matches[0]||null;
      }
    };
  }

  for(const card of document.querySelectorAll('.stratagem')){
    const when=[...card.querySelectorAll('.field')].find(field=>field.querySelector('b')?.textContent.trim().toLowerCase()==='when')?.textContent||'';
    const turn=/opponent|enemy/i.test(when)?'THEIR TURN':/your\b/i.test(when)?'YOUR TURN':'ANY TURN';
    card.dataset.turn=turn;
    card.classList.add(turn==='THEIR TURN'?'turn-their':turn==='YOUR TURN'?'turn-yours':'turn-any');
  }
  const terms=Object.freeze({...window.WH40K_GLOSSARY.forBook('death-guard'),...(window.DG_ROSTER_TERMS||{})});
  const documentRoot=document.querySelector('.document');
  window.WHGlossaryAutolink?.apply(documentRoot,'death-guard');
  window.WHGlossaryAutolink?.validate(documentRoot,terms);
  const navigation=new window.DGNavigation();
  const rosterGuides=document.querySelector('[data-roster-guides-link]');
  const viewSwitch=document.querySelector('[data-view-switch]');
  const params=new URLSearchParams(location.search);
  if(rosterGuides)rosterGuides.hidden=!params.get('roster');
  viewSwitch?.addEventListener('click',()=>{
    const active=navigation.active;
    let route='index.html',anchor='start';
    for(let node=navigation.byId.get(active)?.node;node;node=node.parentElement?.closest('[data-nav-id]')){
      const id=node.dataset.navId;
      if(id==='start'){anchor=active;break;}
      if(id==='updates'){route='updates.html';anchor=active;break;}
      if(id==='core-rules'){route='army-rules.html';anchor=active;break;}
      if(id.startsWith('detachment-')){route=id.slice(11)+'.html';anchor=active;break;}
      if(id.startsWith('unit-')){route=id.slice(5)+'.html';anchor=active;break;}
    }
    const destination=new URL('./mobile/'+route,location.href);
    destination.search=params.toString();
    destination.hash=anchor;
    viewSwitch.href=destination.href;
  });
  const fullEntry=new window.DGFullEntry(window.WH40K_GLOSSARY);
  const popups=new window.DGPopups(terms,fullEntry);
  const relatedRules=initRelatedRules();
  new window.DGJourney(navigation,popups,null,relatedRules);
  new window.DGTheme();
  new window.DGTableAccessibility();
  window.DG_APP=Object.freeze({navigation,popups,fullEntry});
  const returnRecord=window.WHGlossaryReturn?.read();
  if(window.WHGlossaryReturn?.shouldRestoreAutomatically(returnRecord)){
    const scope=document.getElementById(returnRecord.unitId)||document;
    const root=[...scope.querySelectorAll('[data-term]')].find(node=>node.dataset.term===returnRecord.rootTerm)||null;
    requestAnimationFrame(()=>{window.scrollTo(returnRecord.scrollX||0,returnRecord.scrollY||0);requestAnimationFrame(()=>{if(returnRecord.popupIds?.length)popups.restore(returnRecord.popupIds,{root,focus:false});window.WHGlossaryReturn.clear();});});
  }
  if((location.protocol==='http:'||location.protocol==='https:')&&'serviceWorker'in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('../../service-worker.js'));
  if(new URLSearchParams(location.search).get('tapdebug')==='1'){
    const diagnostics=document.createElement('script');diagnostics.src='./scripts/tap-diagnostics.js?v=2';document.body.append(diagnostics);
  }
}());

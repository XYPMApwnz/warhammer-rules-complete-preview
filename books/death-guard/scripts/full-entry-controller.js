(function(){
  'use strict';

  const placeholder=/^(weapon|datasheet) profile\.?$/i;
  const textLength=value=>String(value||'').replace(/\s+/g,' ').trim().length;
  const populatedObject=value=>Boolean(value&&Object.values(value).some(item=>Array.isArray(item)?item.length:item&&typeof item==='object'?Object.keys(item).length:String(item||'').trim()));
  const referenceCount=term=>{
    const references=term?.references||{};
    return (term?.related?.length||0)+['intrinsicRules','referencedByRules','factionTerms'].reduce((total,key)=>total+(references[key]?.length||0),0);
  };

  class FullEntryController{
    constructor(api){
      this.api=api;
      this.current='';
      this.returnFocus=null;
      this.layer=this.createLayer();
      this.bind();
    }

    createLayer(){
      const layer=document.createElement('div');
      layer.className='full-entry-layer';
      layer.hidden=true;
      layer.innerHTML='<article class="full-entry-dialog surface" role="dialog" aria-modal="true" aria-labelledby="fullEntryTitle"><header class="full-entry-header"><div><span class="full-entry-kicker">MEGA GLOSSARY // FULL ENTRY</span><h2 id="fullEntryTitle"></h2></div><button class="full-entry-close" type="button" data-full-entry-close aria-label="Close full glossary entry">×</button></header><div class="full-entry-scroll" data-full-entry-content></div><footer class="full-entry-footer"><a class="popup-action" data-open-mega data-mega-glossary-link>Open Mega Glossary</a><button class="popup-action" type="button" data-full-entry-close>Back to rulebook</button></footer></article>';
      document.body.append(layer);
      this.dialog=layer.querySelector('.full-entry-dialog');
      this.title=layer.querySelector('#fullEntryTitle');
      this.content=layer.querySelector('[data-full-entry-content]');
      this.megaLink=layer.querySelector('[data-open-mega]');
      this.backButton=document.createElement('button');
      this.backButton.className='full-entry-back';this.backButton.type='button';this.backButton.dataset.fullEntryBack='';this.backButton.hidden=true;this.backButton.textContent='← Previous entry';
      this.title.parentElement.prepend(this.backButton);
      this.stack=[];
      return layer;
    }

    bind(){
      document.addEventListener('pointerdown',event=>{
        if(event.pointerType==='touch'&&event.target.closest('[data-full-entry-close]')){
          event.preventDefault();
          this.requestClose();
        }
      });
      document.addEventListener('click',event=>{
        if(event.target.closest('[data-mega-glossary-link]'))this.rememberReturn();
        if(event.target.closest('[data-full-entry-back]')){event.preventDefault();this.backEntry();return;}
        const open=event.target.closest('[data-full-entry]');
        if(open){event.preventDefault();this.open(open.dataset.fullEntry,open);return;}
        if(event.target.closest('[data-full-entry-close]')){event.preventDefault();this.requestClose();return;}
        if(!this.layer.hidden&&event.target===this.layer)this.requestClose();
      });
      document.addEventListener('keydown',event=>{
        if(this.layer.hidden)return;
        if(event.key==='Escape'){event.preventDefault();this.requestClose();return;}
        if(event.key==='Tab')this.trapFocus(event);
      },true);
      window.addEventListener('popstate',()=>{if(!this.layer.hidden)this.close({restoreFocus:true});});
    }

    open(id,trigger){
      const term=this.api.get(id);if(!term)return;
      const first=this.layer.hidden;
      if(first){
        this.returnFocus=trigger||document.activeElement;
        this.layer.hidden=false;
        document.documentElement.classList.add('full-entry-open');
        document.body.classList.add('full-entry-open');
        history.pushState({...history.state,dgFullEntry:term.id},'',location.href);
        this.stack=[term.id];
      }else{
        if(term.id===this.current)return;
        this.stack.push(term.id);
        history.replaceState({...history.state,dgFullEntry:term.id},'',location.href);
      }
      this.current=term.id;
      this.render(term);
      this.content.scrollTop=0;
      (first?this.layer.querySelector('[data-full-entry-close]'):this.backButton)?.focus({preventScroll:true});
    }

    isUseful(id){
      const term=this.api.get(id);if(!term)return false;
      const summary=textLength(term.summary?.en),definition=textLength(term.definition?.en);
      return populatedObject(term.structured)||definition>=summary+120||referenceCount(term)>=2;
    }

    isCompact(term){
      return !populatedObject(term.structured)&&textLength(term.definition?.en)<500&&referenceCount(term)<5;
    }

    backEntry(){
      if(this.stack.length<2)return;
      this.stack.pop();
      const term=this.api.get(this.stack[this.stack.length-1]);if(!term)return;
      this.current=term.id;history.replaceState({...history.state,dgFullEntry:term.id},'',location.href);
      this.render(term);this.content.scrollTop=0;this.backButton.focus({preventScroll:true});
    }

    requestClose(){
      const hasHistory=Boolean(history.state?.dgFullEntry);
      this.close({restoreFocus:true});
      if(hasHistory)history.back();
    }

    close({restoreFocus=false}={}){
      this.layer.hidden=true;
      this.current='';
      this.stack=[];
      document.documentElement.classList.remove('full-entry-open');
      document.body.classList.remove('full-entry-open');
      if(restoreFocus&&this.returnFocus?.isConnected)this.returnFocus.focus({preventScroll:true});
    }

    sectionLabel(text){const label=document.createElement('p');label.className='full-entry-label';label.textContent=text;return label;}

    renderProfile(structured){
      const profile=structured?.weapon||structured?.statline;if(!profile)return null;
      const grid=document.createElement('div');grid.className='full-entry-profile';
      for(const [label,value] of Object.entries(profile)){
        const cell=document.createElement('div'),key=document.createElement('small'),data=document.createElement('strong');
        key.textContent=label;data.textContent=Array.isArray(value)?value.join(', '):String(value);cell.append(key,data);grid.append(cell);
      }
      return grid;
    }

    referenceSection(label,ids,limit=16){
      const terms=[...new Set(ids||[])].map(id=>this.api.get(id)).filter(Boolean);if(!terms.length)return null;
      const section=document.createElement('section'),grid=document.createElement('div');section.className='full-entry-references';grid.className='full-entry-reference-grid';
      for(const term of terms.slice(0,limit)){
        const button=document.createElement('button');button.type='button';button.dataset.fullEntry=term.id;
        const title=document.createElement('strong'),meta=document.createElement('small');title.textContent=term.title.en;meta.textContent=term.kind+' // '+(term.canonicalSource?.locator||term.scope);
        button.append(title,meta);grid.append(button);
      }
      section.append(this.sectionLabel(label+' // '+terms.length),grid);return section;
    }

    render(term){
      const source=term.canonicalSource||{},summary=term.summary?.en||'',definition=term.definition?.en||'';
      this.title.textContent=term.title.en;this.title.dataset.term=term.id;
      this.dialog.classList.toggle('is-compact',this.isCompact(term));
      this.backButton.hidden=this.stack.length<2;
      this.megaLink.href='../../glossary/index.html#'+encodeURIComponent(term.id);
      const nodes=[];
      const kind=document.createElement('p');kind.className='full-entry-kind';kind.textContent=term.kind+' // '+term.edition;nodes.push(kind);
      if(summary&&!placeholder.test(summary)&&summary!==definition){const quick=document.createElement('p');quick.className='full-entry-summary';quick.textContent=summary;nodes.push(this.sectionLabel('Quick reference // popup'),quick);}
      const profile=this.renderProfile(term.structured);if(profile)nodes.push(this.sectionLabel('Structured profile'),profile);
      if(definition&&!placeholder.test(definition)){const full=document.createElement('div');full.className='full-entry-definition';full.textContent=definition;nodes.push(this.sectionLabel('Full rule'),full);}
      const references=term.references||{};
      for(const [label,ids,limit] of [
        ['Rules of this unit type',references.intrinsicRules,16],
        ['Referenced by core rules',references.referencedByRules,16],
        ['Keyword framework',references.commonRules,16],
        ['Faction references',references.factionTerms,12],
        ['Related keywords',references.relatedKeywords,16],
        ['Related entries',term.related,16]
      ]){const section=this.referenceSection(label,ids,limit);if(section)nodes.push(section);}
      const meta=document.createElement('div');meta.className='full-entry-meta';
      for(const [label,value] of [['Scope',term.scope],['Status',term.status],['Canonical source',(source.documentId||'unknown')+' · '+(source.locator||'')]]){
        const cell=document.createElement('div'),key=document.createElement('small'),data=document.createElement('b');key.textContent=label;data.textContent=value;cell.append(key,data);meta.append(cell);
      }
      nodes.push(meta);this.content.replaceChildren(...nodes);
      window.WHGlossaryAutolink?.apply(this.content);
      for(const button of this.content.querySelectorAll('[data-term]')){
        if(button.dataset.term===term.id){button.replaceWith(document.createTextNode(button.textContent));continue;}
        button.dataset.fullEntry=button.dataset.term;delete button.dataset.term;
        button.setAttribute('aria-label','Open full glossary entry: '+button.textContent);
      }
    }

    rememberReturn(){
      const popups=window.DG_APP?.popups,root=popups?.rootElement?.(),unit=root?.closest?.('.unit-card');
      try{sessionStorage.setItem('wh40k-mega-glossary-return',JSON.stringify({url:location.href,path:location.pathname,scrollX:window.scrollX||0,scrollY:window.scrollY||0,popupIds:popups?.snapshot?.()||[],rootTerm:root?.dataset?.term||'',unitId:unit?.id||''}));}catch(error){}
    }

    trapFocus(event){
      const controls=[...this.dialog.querySelectorAll('a,button,[tabindex]')].filter(node=>node.tabIndex>=0);
      if(!controls.length)return;const first=controls[0],last=controls[controls.length-1];
      if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
      else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
    }
  }

  window.DGFullEntry=FullEntryController;
})();

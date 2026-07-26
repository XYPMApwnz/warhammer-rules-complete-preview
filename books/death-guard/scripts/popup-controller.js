(function(){
  'use strict';

  class PopupController{
    constructor(terms,fullEntry){
      this.terms=terms;
      this.fullEntry=fullEntry;
      this.layer=document.getElementById('popupLayer');
      this.ids=[];
      this.origins=[];
      this.originSequence=0;
      this.touchTerm=null;
      this.bind();
    }

    bind(){
      document.addEventListener('pointerdown',event=>{
        if(event.pointerType!=='touch')return;
        const close=event.target.closest('[data-popup-close]');
        if(close&&this.layer.contains(close)){
          event.preventDefault();
          this.closeFrom(Number(close.dataset.popupClose));
          return;
        }
        const trigger=event.target.closest('[data-term]');
        if(!trigger)return;
        this.touchTerm={trigger,pointerId:event.pointerId,x:event.clientX,y:event.clientY,moved:false,until:0};
      });
      document.addEventListener('pointermove',event=>{
        if(event.pointerId!==this.touchTerm?.pointerId)return;
        if(Math.hypot(event.clientX-this.touchTerm.x,event.clientY-this.touchTerm.y)>10)this.touchTerm.moved=true;
      });
      document.addEventListener('pointerup',event=>{
        if(event.pointerId!==this.touchTerm?.pointerId)return;
        event.preventDefault();
        this.touchTerm.until=performance.now()+750;
        if(!this.touchTerm.moved)this.open(this.touchTerm.trigger.dataset.term,this.touchTerm.trigger);
      });
      document.addEventListener('pointercancel',event=>{
        if(event.pointerId!==this.touchTerm?.pointerId)return;
        this.touchTerm=null;
      });
      document.addEventListener('click',event=>{
        const close=event.target.closest('[data-popup-close]');
        if(close&&this.layer.contains(close)){event.preventDefault();this.closeFrom(Number(close.dataset.popupClose));return;}
        const trigger=event.target.closest('[data-term]');
        if(trigger){
          event.preventDefault();
          if(this.touchTerm?.trigger===trigger&&performance.now()<this.touchTerm.until){this.touchTerm=null;return;}
          this.open(trigger.dataset.term,trigger);return;
        }
        if(this.ids.length&&!event.target.closest('.term-popup,.full-entry-layer'))this.closeFrom(0);
      });
      document.addEventListener('keydown',event=>{
        if(event.key==='Escape'&&this.ids.length&&!document.querySelector('.full-entry-layer:not([hidden])')){event.preventDefault();event.stopImmediatePropagation();this.closeFrom(this.ids.length-1);}
      },true);
      window.addEventListener('resize',()=>this.reposition(),{passive:true});
    }

    snapshot(){return this.ids.slice();}
    rootElement(){return this.resolveOrigin(this.origins[0]);}
    captureOrigin(element,termId){
      if(!element)return null;
      const parent=element.closest?.('.term-popup');
      const rect=element.getBoundingClientRect?.();
      if(parent)return{kind:'popup',parentIndex:Number(parent.dataset.popupIndex),termId,rect};
      if(!element.id)element.id='term-origin-'+(++this.originSequence);
      return{kind:'document',elementId:element.id,rect};
    }
    resolveOrigin(reference){
      if(!reference)return null;
      if(reference.kind==='document')return document.getElementById(reference.elementId);
      if(reference.kind==='popup'){
        const parent=this.layer.querySelector('.term-popup[data-popup-index="'+reference.parentIndex+'"]');
        return[...(parent?.querySelectorAll('[data-term]')||[])].find(button=>button.dataset.term===reference.termId)||null;
      }
      return null;
    }

    open(id,trigger){
      if(!this.terms[id])return;
      const nested=Boolean(trigger?.closest?.('.term-popup'));
      if(!nested){
        if(this.ids.length===1&&this.ids[0]===id){this.focusTop();return;}
        this.ids=[];this.origins=[];
      }
      const current=this.ids[this.ids.length-1];
      if(current===id){this.focusTop();return;}
      const previous=this.ids[this.ids.length-2];
      if(previous===id){this.ids.pop();this.origins.pop();this.sync({focus:true});return;}
      this.ids.push(id);this.origins.push(this.captureOrigin(trigger,id));this.sync({focus:true});
    }
    restore(ids,{root=null,focus=true}={}){
      this.ids=ids.filter(id=>this.terms[id]);
      this.origins=this.ids.map((id,index)=>index===0?this.captureOrigin(root,id):{kind:'popup',parentIndex:index-1,termId:id,rect:null});
      this.sync({focus});
    }
    closeFrom(index){
      if(index<0||index>=this.ids.length)return;
      const returnReference=this.origins[index];
      this.ids=this.ids.slice(0,index);this.origins=this.origins.slice(0,index);this.sync({reposition:false});
      const target=this.resolveOrigin(returnReference);
      if(target?.isConnected)target.focus({preventScroll:true});else this.focusTop();
      if(this.ids.length)setTimeout(()=>this.reposition(),0);
    }

    contextualUnit(){return this.rootElement()?.closest?.('.unit-card')||null;}
    actionList(term){
      const unit=this.contextualUnit(),unitId=unit?.id||'';
      const contextualStatline=unit?.querySelector('.unit-part[id$="-profile"]')?.id||'';
      const actions=[];
      if(term.fullRulePath)actions.push({label:'Open full rule',href:window.WHGlossaryReturn.href(term.fullRulePath)});
      if(term.id&&this.fullEntry?.isUseful(term.id))actions.push({label:'Full entry',fullEntry:term.id});
      if(term.id)actions.push({label:'Glossary entry',href:'../../glossary/index.html#'+encodeURIComponent(term.id),megaGlossary:true});
      if(term.rule)actions.push({label:'To rule',target:term.rule,type:'rule'});
      if(unitId||term.datasheet)actions.push({label:'Datasheet & Wargear',target:unitId||term.datasheet,type:'datasheet'});
      if(contextualStatline||term.statline)actions.push({label:'Statline',target:contextualStatline||term.statline,type:'datasheet'});
      return actions.filter(action=>action.href||action.fullEntry||document.getElementById(action.target));
    }
    rememberMegaReturn(){
      const root=this.rootElement(),unit=root?.closest?.('.unit-card');
      window.WHGlossaryReturn?.save({popupIds:this.snapshot(),rootTerm:root?.dataset?.term||'',unitId:unit?.id||''});
    }
    createCard(id,index){
      const term=this.terms[id],card=document.createElement('section'),titleId='term-popup-title-'+index+'-'+id;
      card.className='term-popup surface';card.dataset.popupTerm=id;card.dataset.popupIndex=String(index);card.tabIndex=-1;
      card.setAttribute('role','dialog');card.setAttribute('aria-modal','false');card.setAttribute('aria-labelledby',titleId);

      const close=document.createElement('button');close.className='popup-close';close.dataset.popupClose=String(index);close.setAttribute('aria-label','Close '+term.title+' popup');close.textContent='×';
      const title=document.createElement('h3');title.id=titleId;title.textContent=term.title;
      const content=window.WHPopupContent.render(term,this.terms);
      card.classList.add(...content.classes);
      card.append(close,title,content.node);

      const related=(term.related||[]).filter(relatedId=>relatedId!==id&&this.terms[relatedId]);
      if(related.length){
        const paragraph=document.createElement('p');paragraph.className='popup-related';paragraph.append('Related: ');
        related.forEach((relatedId,relatedIndex)=>{
          if(relatedIndex)paragraph.append(', ');
          const button=document.createElement('button');button.className='term-link';button.dataset.term=relatedId;button.textContent=this.terms[relatedId].title;paragraph.append(button);
        });
        card.append(paragraph);
      }
      const actions=this.actionList(term);
      if(actions.length){
        const group=document.createElement('div');group.className='popup-actions';group.setAttribute('aria-label','Popup destinations');
        actions.forEach((action,actionIndex)=>{
          const button=document.createElement(action.href?'a':'button');button.className='popup-action';button.textContent=action.label;
          if(action.href){button.href=action.href;if(action.megaGlossary)button.addEventListener('click',()=>this.rememberMegaReturn());}
          else if(action.fullEntry){button.type='button';button.dataset.fullEntry=action.fullEntry;}
          else{button.type='button';button.dataset.journeyTarget=action.target;button.dataset.journeyType=action.type;button.dataset.actionKey=index+'-'+actionIndex+'-'+action.type+'-'+action.target;}
          group.append(button);
        });
        card.append(group);
      }
      window.WHGlossaryAutolink?.apply(card);
      return card;
    }

    sync({focus=false,reposition=true}={}){
      const cards=[...this.layer.children];let prefix=0;
      while(prefix<cards.length&&prefix<this.ids.length&&cards[prefix].dataset.popupTerm===this.ids[prefix])prefix++;
      for(let index=cards.length-1;index>=prefix;index--)cards[index].remove();
      for(let index=prefix;index<this.ids.length;index++)this.layer.append(this.createCard(this.ids[index],index));
      if(reposition)this.reposition();if(focus)this.focusTop();
    }
    focusTop(){this.layer.lastElementChild?.focus({preventScroll:true});}

    reposition(){
      const mobile=window.innerWidth<=800,headerBottom=document.getElementById('appHeader').getBoundingClientRect().bottom;
      const cards=[...this.layer.children],visibleStart=Math.max(0,cards.length-3);
      cards.forEach((card,index)=>{
        const previousLeft=card.style.left,previousTop=card.style.top;
        card.style.removeProperty('left');card.style.removeProperty('top');card.style.removeProperty('bottom');
        if(mobile){
          const visibleIndex=Math.max(0,index-visibleStart);
          const margin=14,height=card.offsetHeight;
          const centered=(window.innerHeight-height)/2+visibleIndex*18;
          const top=Math.max(headerBottom+margin,Math.min(centered,window.innerHeight-height-margin));
          card.style.left='14px';card.style.top=Math.round(top)+'px';return;
        }
        const origin=this.resolveOrigin(this.origins[index]),rect=origin?.getBoundingClientRect?.()||this.origins[index]?.rect;
        if(rect&&(rect.bottom<0||rect.top>window.innerHeight)&&previousLeft&&previousTop){card.style.left=previousLeft;card.style.top=previousTop;return;}
        const margin=14,gap=10,width=card.offsetWidth,height=card.offsetHeight;
        let left=rect?rect.left:(window.innerWidth-width)/2;
        left=Math.max(margin,Math.min(left,window.innerWidth-width-margin));
        let top=rect?rect.bottom+gap:(window.innerHeight-height)/2;
        if(rect&&top+height>window.innerHeight-margin)top=rect.top-height-gap;
        top=Math.max(headerBottom+margin,Math.min(top,window.innerHeight-height-margin));
        card.style.left=Math.round(left+(window.scrollX||0))+'px';
        card.style.top=Math.round(top+(window.scrollY||0))+'px';
      });
    }
  }

  window.DGPopups=PopupController;
}());

(function () {
  'use strict';

  class CoreJourney {
    constructor(navigation,popups,glossary){this.navigation=navigation;this.popups=popups;this.glossary=glossary;this.stack=[];this.button=document.getElementById('backButton');this.bind();}
    bind(){document.addEventListener('click',(event)=>{const action=event.target.closest('[data-journey-target]');if(action){event.preventDefault();this.start(action);}});this.button.addEventListener('click',()=>this.back());}
    sync(){this.button.hidden=this.stack.length===0;}
    start(trigger){const target=document.getElementById(trigger.dataset.journeyTarget);if(!target)return;const root=this.popups.rootElement();if(root&&!root.id)root.id=`journey-root-${Date.now()}`;this.stack.push({scrollY:window.scrollY,navId:this.navigation.state.active,popupIds:this.popups.snapshot(),popupRootId:root?.id||'',actionKey:trigger.dataset.actionKey||'',actionTarget:trigger.dataset.journeyTarget,actionType:trigger.dataset.journeyType});if(trigger.dataset.journeyType==='glossary')this.glossary.reveal(target);this.popups.ids=[];this.popups.origins=[];this.popups.sync();const navId=target.closest('[data-track]')?.dataset.track||trigger.dataset.journeyTarget;this.navigation.navigate(navId,target);this.sync();}
    back(){const snapshot=this.stack.pop();if(!snapshot)return;this.navigation.restore(snapshot.navId,snapshot.scrollY,()=>{const root=document.getElementById(snapshot.popupRootId);this.popups.restore(snapshot.popupIds,{root,focus:false});let action=[...document.querySelectorAll('[data-action-key]')].find((item)=>item.dataset.actionKey===snapshot.actionKey);if(!action)action=[...document.querySelectorAll('[data-journey-target]')].find((item)=>item.dataset.journeyTarget===snapshot.actionTarget&&item.dataset.journeyType===snapshot.actionType);if(action){action.focus({preventScroll:true});action.classList.add('return-highlight');setTimeout(()=>action.classList.remove('return-highlight'),1900);}else this.popups.focusTop();});this.sync();}
  }
  window.CoreJourney=CoreJourney;
}());

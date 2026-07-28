(function(root){
  'use strict';

  function install(config){
    const params=new URLSearchParams(location.search);
    const phoneMode=params.get('view')==='mobile';
    if(phoneMode)document.documentElement.dataset.view='mobile';
    else document.documentElement.removeAttribute('data-view');

    const terms={...(root.WH40K_GLOSSARY?.forBook(config.bookId)||{}),...(root.DG_TERMS||{})};
    const documentRoot=document.querySelector('.document');
    root.WHGlossaryAutolink?.apply(documentRoot,config.bookId);
    root.WHGlossaryAutolink?.validate(documentRoot,terms);

    const navigation=new root.DGNavigation({breakpoint:phoneMode?Number.MAX_SAFE_INTEGER:800});
    const fullEntry=new root.DGFullEntry(root.WH40K_GLOSSARY);
    const popups=new root.DGPopups(terms,fullEntry);
    const relatedRules=root.WHArmyRelatedRules?.install({
      storageKey:`${config.bookId}-detachment-filter`,
      rosterGuide:root.WH_ARMY_ROSTER_GUIDE
    });
    const journey=new root.DGJourney(navigation,popups,null,relatedRules);
    new root.DGTheme();
    new root.DGTableAccessibility();

    const rosterGuides=document.querySelector('[data-roster-guides]');
    const viewSwitch=document.querySelector('[data-view-switch]');
    if(rosterGuides)rosterGuides.hidden=!params.get('roster');
    if(viewSwitch){
      const label=viewSwitch.querySelector('b');
      if(label)label.textContent=phoneMode?'Desktop / iPad view':'Phone view';
      viewSwitch.setAttribute('aria-label',phoneMode?'Open desktop or iPad view':'Open phone view');
      const updateViewDestination=()=>{
        const destination=new URL(config.readerPath||'./reader.html',location.href);
        destination.search=location.search;
        destination.searchParams.set('view',phoneMode?'full':'mobile');
        const hashId=decodeURIComponent(location.hash.slice(1));
        destination.hash=hashId&&!navigation.byId?.has(hashId)?location.hash:navigation.active||location.hash;
        viewSwitch.href=destination.href;
      };
      updateViewDestination();
      viewSwitch.addEventListener('click',updateViewDestination);
    }

    root.WH_ARMY_BOOK_APP=Object.freeze({navigation,popups,fullEntry,journey,relatedRules});
    const record=root.WHGlossaryReturn?.read();
    if(root.WHGlossaryReturn?.shouldRestoreAutomatically(record)&&record.popupIds?.length){
      const scope=document.getElementById(record.unitId)||document;
      const trigger=[...scope.querySelectorAll('[data-term]')].find(node=>node.dataset.term===record.rootTerm)||null;
      requestAnimationFrame(()=>{
        root.scrollTo(record.scrollX||0,record.scrollY||0);
        requestAnimationFrame(()=>{
          popups.restore(record.popupIds,{root:trigger,focus:false});
          root.WHGlossaryReturn.clear();
        });
      });
    }else{
      const initialTarget=decodeURIComponent(location.hash.slice(1));
      if(initialTarget&&navigation.byId?.has(initialTarget))requestAnimationFrame(()=>navigation.go(initialTarget));
    }
    if((location.protocol==='http:'||location.protocol==='https:')&&'serviceWorker'in navigator){
      root.addEventListener('load',()=>navigator.serviceWorker.register('../../service-worker.js'));
    }
  }

  root.WHArmyBook=Object.freeze({install});
}(window));

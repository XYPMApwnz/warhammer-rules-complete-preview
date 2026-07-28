(function(){
  'use strict';
  for(const button of document.querySelectorAll('button:not([type])'))button.type='button';
  const terms=window.WH40K_GLOSSARY?.forBook('adeptus-mechanicus')||window.DG_TERMS;
  const documentRoot=document.querySelector('.document');
  window.WHGlossaryAutolink?.apply(documentRoot,'adeptus-mechanicus');
  window.WHGlossaryAutolink?.validate(documentRoot,terms);
  const navigation=new window.DGNavigation();
  const fullEntry=new window.DGFullEntry(window.WH40K_GLOSSARY);
  const popups=new window.DGPopups(terms,fullEntry);
  const relatedRules=window.AMRelatedRules?.install();
  const journey=new window.DGJourney(navigation,popups,null,relatedRules);
  new window.DGTheme();
  new window.DGTableAccessibility();
  new window.AMDoctrina();
  const params=new URLSearchParams(location.search);
  const rosterGuides=document.querySelector('[data-roster-guides]');
  const viewSwitch=document.querySelector('[data-view-switch]');
  if(rosterGuides)rosterGuides.hidden=!params.get('roster');
  viewSwitch?.addEventListener('click',()=>{
    const destination=new URL('./mobile/index.html',location.href);
    destination.search=params.toString();
    destination.hash=navigation.active;
    viewSwitch.href=destination.href;
  });
  window.DG_APP=Object.freeze({navigation,popups,fullEntry,journey});
  const returnRecord=window.WHGlossaryReturn?.read();
  if(window.WHGlossaryReturn?.shouldRestoreAutomatically(returnRecord)&&returnRecord.popupIds?.length){
    const scope=document.getElementById(returnRecord.unitId)||document;
    const root=[...scope.querySelectorAll('[data-term]')].find(node=>node.dataset.term===returnRecord.rootTerm)||null;
    requestAnimationFrame(()=>{window.scrollTo(returnRecord.scrollX||0,returnRecord.scrollY||0);requestAnimationFrame(()=>{popups.restore(returnRecord.popupIds,{root,focus:false});window.WHGlossaryReturn.clear();});});
  }
  if((location.protocol==='http:'||location.protocol==='https:')&&'serviceWorker'in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('../../service-worker.js'));
}());

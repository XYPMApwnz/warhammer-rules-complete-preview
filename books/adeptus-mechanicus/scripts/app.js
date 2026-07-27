(function(){
  'use strict';
  for(const button of document.querySelectorAll('button:not([type])'))button.type='button';
  for(const card of document.querySelectorAll('.stratagem')){
    const when=[...card.querySelectorAll('.field')].find(field=>field.querySelector('b')?.textContent.trim().toLowerCase()==='when')?.textContent||'';
    const turn=/opponent|enemy/i.test(when)?'THEIR TURN':/your\b/i.test(when)?'YOUR TURN':'ANY TURN';
    card.dataset.turn=turn;
    card.classList.add(turn==='THEIR TURN'?'turn-their':turn==='YOUR TURN'?'turn-yours':'turn-any');
  }
  const terms=window.WH40K_GLOSSARY?.forBook('adeptus-mechanicus')||window.DG_TERMS;
  const documentRoot=document.querySelector('.document');
  window.WHGlossaryAutolink?.apply(documentRoot,'adeptus-mechanicus');
  window.WHGlossaryAutolink?.validate(documentRoot,terms);
  const navigation=new window.DGNavigation();
  const popups=new window.DGPopups(terms);
  const glossary=new window.DGGlossarySearch();
  const journey=new window.DGJourney(navigation,popups,glossary);
  new window.DGTheme();
  new window.DGTableAccessibility();
  new window.AMNavigationSearch();
  new window.AMGlobalSearch(navigation,popups,glossary);
  new window.AMDoctrina();
  document.querySelector('[data-header-home]')?.addEventListener('click',event=>{event.preventDefault();navigation.go('start');});
  window.DG_APP=Object.freeze({navigation,popups,glossary,journey});
  const returnRecord=window.WHGlossaryReturn?.read();
  if(window.WHGlossaryReturn?.matchesCurrent(returnRecord)&&returnRecord.popupIds?.length){
    const scope=document.getElementById(returnRecord.unitId)||document;
    const root=[...scope.querySelectorAll('[data-term]')].find(node=>node.dataset.term===returnRecord.rootTerm)||null;
    requestAnimationFrame(()=>{window.scrollTo(returnRecord.scrollX||0,returnRecord.scrollY||0);requestAnimationFrame(()=>{popups.restore(returnRecord.popupIds,{root,focus:false});window.WHGlossaryReturn.clear();});});
  }
  if((location.protocol==='http:'||location.protocol==='https:')&&'serviceWorker'in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('../../service-worker.js'));
}());

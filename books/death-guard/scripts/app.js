(function(){
  'use strict';
  for(const card of document.querySelectorAll('.stratagem')){
    const when=[...card.querySelectorAll('.field')].find(field=>field.querySelector('b')?.textContent.trim().toLowerCase()==='when')?.textContent||'';
    const turn=/opponent|enemy/i.test(when)?'THEIR TURN':/your\b/i.test(when)?'YOUR TURN':'ANY TURN';
    card.dataset.turn=turn;
    card.classList.add(turn==='THEIR TURN'?'turn-their':turn==='YOUR TURN'?'turn-yours':'turn-any');
  }
  const terms=window.WH40K_GLOSSARY?.forBook('death-guard')||window.DG_TERMS;
  const documentRoot=document.querySelector('.document');
  const glossary=new window.DGGlossarySearch();
  window.WHGlossaryAutolink?.apply(documentRoot,'death-guard');
  window.WHGlossaryAutolink?.validate(documentRoot,terms);
  glossary.markReady();
  const navigation=new window.DGNavigation();
  const popups=new window.DGPopups(terms);
  new window.DGJourney(navigation,popups,glossary);
  new window.DGTheme();
  new window.DGTableAccessibility();
  window.DG_APP=Object.freeze({navigation,popups});
  try{
    const record=JSON.parse(sessionStorage.getItem('wh40k-mega-glossary-return')||'null');
    if(record?.path===location.pathname&&record.popupIds?.length){
      const scope=document.getElementById(record.unitId)||document;
      const root=[...scope.querySelectorAll('[data-term]')].find(node=>node.dataset.term===record.rootTerm)||null;
      requestAnimationFrame(()=>{window.scrollTo(record.scrollX||0,record.scrollY||0);popups.restore(record.popupIds,{root,focus:false});sessionStorage.removeItem('wh40k-mega-glossary-return');});
    }
  }catch{}
  if((location.protocol==='http:'||location.protocol==='https:')&&'serviceWorker'in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('../../service-worker.js'));
}());

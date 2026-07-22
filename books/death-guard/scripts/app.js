(function(){
  'use strict';
  const navigation=new window.DGNavigation();
  const terms=window.WH40K_GLOSSARY?.forBook('death-guard')||window.DG_TERMS;
  const popups=new window.DGPopups(terms);
  const glossary=new window.DGGlossarySearch();
  new window.DGJourney(navigation,popups,glossary);
  new window.DGTheme();
  new window.DGTableAccessibility();
  window.DG_APP=Object.freeze({navigation,popups});
  if((location.protocol==='http:'||location.protocol==='https:')&&'serviceWorker'in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('../../service-worker.js'));
}());

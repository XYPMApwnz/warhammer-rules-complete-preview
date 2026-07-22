(function(){
  'use strict';
  for(const button of document.querySelectorAll('button:not([type])'))button.type='button';
  const navigation=new window.DGNavigation();
  const terms=window.WH40K_GLOSSARY?.forBook('adeptus-mechanicus')||window.DG_TERMS;
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
  if((location.protocol==='http:'||location.protocol==='https:')&&'serviceWorker'in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('../../service-worker.js'));
}());

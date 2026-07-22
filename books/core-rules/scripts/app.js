(function () {
  'use strict';
  const navigation=new CoreNavigation();
  const terms=window.WH40K_GLOSSARY?.forBook('core-rules')||window.CORE_RULES.terms;
  const popups=new CorePopups(terms);
  const glossary=new CoreGlossarySearch();
  const journey=new CoreJourney(navigation,popups,glossary);
  new CoreTheme();
  new CoreNavSearch();
  new CoreGlobalSearch(navigation,popups,glossary);
  new CoreTables();
  document.getElementById('readerStatus').textContent='ORIGINAL PDF SOURCE';
  document.querySelector('[data-header-home]').addEventListener('click',(event)=>{event.preventDefault();navigation.setDrawer(false);navigation.controlledScroll('introduction',0);});
  window.CORE_APP=Object.freeze({navigation,popups,glossary,journey});
  if((location.protocol==='http:'||location.protocol==='https:')&&'serviceWorker'in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('../../service-worker.js'));
}());

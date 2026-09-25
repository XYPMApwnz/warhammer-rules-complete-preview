(function(root){
  'use strict';

  function install(config){
    if(!config||typeof config.bookId!=='string'||!config.bookId)throw new TypeError('WHArmyBook requires a bookId.');
    const params=new URLSearchParams(location.search);
    const phoneMode=(root.WHArmyBookView?.resolve?.()||params.get('view'))==='mobile';
    if(phoneMode)document.documentElement.dataset.view='mobile';
    else document.documentElement.removeAttribute('data-view');
    const runtimeContext=Object.freeze({root,config,params,phoneMode});

    const documentRoot=document.querySelector('.document');
    root.WH40K_GLOSSARY?.bindArmyRoot?.(documentRoot,config.bookId);
    const terms=root.WH40K_GLOSSARY?.forBook(config.bookId)||{};
    const fullEntryApi=Object.freeze({get:(id,options={})=>root.WH40K_GLOSSARY.get(id,{...options,bookId:config.bookId})});
    const fullEntry=new root.DGFullEntry(fullEntryApi);
    const popups=new root.DGPopups(terms,fullEntry);
    const relatedConfig=config.relatedRules===false?null:config.relatedRules||{};
    const relatedInstaller=relatedConfig&&(relatedConfig.installer||root.WHArmyRelatedRules);
    const rosterGuide=relatedConfig&&(typeof relatedConfig.rosterGuide==='function'?relatedConfig.rosterGuide(runtimeContext):relatedConfig.rosterGuide||root.WH_ARMY_ROSTER_GUIDE);
    const rosterContextSettings=config.rosterContext===false?null:(config.rosterContext||{});
    const rosterContextAdapter=rosterContextSettings&&typeof rosterContextSettings.provider==='function'?rosterContextSettings.provider(Object.freeze({...runtimeContext,rosterGuide})):rosterGuide?.rosterContext;
    const rosterContext=rosterContextSettings&&root.WHArmyRosterContext?.fromRuntime({...runtimeContext,rosterGuide,adapter:rosterContextAdapter})||null;
    root.WH_ARMY_ROSTER_CONTEXT=rosterContext;
    const navigation=new root.DGNavigation({breakpoint:phoneMode?Number.MAX_SAFE_INTEGER:800});
    const relatedRules=relatedConfig&&!(relatedConfig.requireRosterGuide&&params.has('roster')&&!rosterGuide)?relatedInstaller?.install({
      storageKey:relatedConfig.storageKey===undefined?`${config.bookId}-detachment-filter`:relatedConfig.storageKey,
      ...relatedConfig,
      rosterGuide,
      rosterRequested:params.has('roster')
    }):null;
    const journey=new root.DGJourney(navigation,popups,null,relatedRules);
    const tableAccessibility=new root.DGTableAccessibility(null);
    const extensions=config.extensions==null?[]:Array.isArray(config.extensions)?config.extensions:[config.extensions];
    extensions.forEach(extension=>{if(typeof extension!=='function')throw new TypeError('WHArmyBook extensions must be functions.');});

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

    let app=null;
    const initializeRoot=(mountRoot,initializeOptions={})=>{
      if(!mountRoot)return mountRoot;
      root.WH40K_GLOSSARY?.bindArmyRoot?.(mountRoot,config.bookId);
      root.WHArmyDatasheetLayout?.install(mountRoot);
      root.WHGlossaryAutolink?.apply(mountRoot,config.bookId);
      root.WHGlossaryAutolink?.validate(mountRoot,terms);
      root.WH_ARMY_ROSTER_DECORATOR?.decorate(mountRoot,initializeOptions);
      root.WHArmyRosterGamePresentation?.install(mountRoot,root.WH_ARMY_ROSTER_DECORATOR?.projection||root.WH_ARMY_ROSTER_PROJECTION);
      root.WH40K_GLOSSARY?.bindArmyRoot?.(mountRoot,config.bookId);
      relatedRules?.enhance?.(mountRoot);
      tableAccessibility.apply(mountRoot);
      extensions.forEach(extension=>extension(Object.freeze({...runtimeContext,app,mountRoot})));
      root.WH40K_GLOSSARY?.bindArmyRoot?.(mountRoot,config.bookId);
      root.WHGlossaryAutolink?.validate(mountRoot,root.WH40K_GLOSSARY?.forBook(config.bookId)||terms);
      navigation.scheduleGeometry();
      return mountRoot;
    };
    app=Object.freeze({navigation,popups,fullEntry,journey,relatedRules,rosterContext,initializeRoot,targetMount:root.WHArmyBookTargetMount||null});
    root.WH_ARMY_BOOK_APP=app;
    root.DG_APP=app;
    initializeRoot(documentRoot);
    root.addEventListener('wh-army-target-before-mount',()=>{relatedRules?.close?.();popups.restore([],{focus:false});});
    root.addEventListener('wh-army-target-mounted',event=>initializeRoot(event.detail?.root,{instanceId:event.detail?.instanceId||''}));
    root.WHPageState?.installArmyBook(app);
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
    }
    return app;
  }

  root.WHArmyBook=Object.freeze({install});
}(window));

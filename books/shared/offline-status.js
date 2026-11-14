(function(root){
  'use strict';
  const script=document.currentScript,swUrl=script?.dataset.serviceWorker;
  if(!swUrl||!('serviceWorker' in navigator)||!location.protocol.startsWith('http')){root.WHOfflineStatus=Object.freeze({ready:Promise.resolve()});return;}
  const MESSAGE='WH_OFFLINE_PACKAGE_STATUS',QUERY='WH_OFFLINE_PACKAGE_STATUS_QUERY',VERSION_QUERY='GET_VERSION',ACTIVATE_UPDATE='SKIP_WAITING';
  const v2Bootstrap=script.hasAttribute('data-v2-bootstrap'),expectedRevision=root.WHPwaExpectedRevision;
  let reloadRequired=false;
  let resolveReady;const ready=new Promise(resolve=>{resolveReady=resolve;});if(!v2Bootstrap)resolveReady();
  if(v2Bootstrap&&!document.querySelector('[data-pwa-updater]')){
    const panel=document.createElement('section');panel.className='pwa-update-panel';panel.dataset.pwaUpdater='';panel.dataset.state='idle';panel.setAttribute('aria-label','Offline application updates');
    panel.innerHTML='<div class="pwa-update-copy"><strong data-pwa-update-status role="status" aria-live="polite">Check for updates</strong><span class="pwa-update-versions"><small>Offline version: <code data-pwa-installed-version>checking…</code></small><small data-pwa-available-row hidden>Available version: <code data-pwa-available-version></code></small></span></div><button type="button" data-pwa-update-action>Check for updates</button>';
    document.body.prepend(panel);const style=document.createElement('link');style.rel='stylesheet';style.href=new URL('./styles/offline-status.css',script.src).href;document.head.append(style);
  }
  const draftKey='wh40k:pwa-import-drafts:v1';
  const automaticPrefix='wh40k:pwa-auto-update:'+new URL(swUrl,location.href).pathname+':';
  const automaticKey=revision=>automaticPrefix+revision;
  function pendingAutomaticAttempt(){return Object.keys(sessionStorage).some(key=>key.startsWith(automaticPrefix)&&sessionStorage.getItem(key)==='attempted');}
  let bootstrapReleased=false,bootstrapFinished=!v2Bootstrap,bootstrapFailed=false,bootstrapTimer=0,automaticUpdate=null;
  function workingScreen(){
    const children=document.querySelector('[data-v2-mount-root]')?.children||[];
    return [...children].some(child=>!child.hidden&&!['LINK','STYLE','SCRIPT'].includes(child.tagName));
  }
  function startupScreen(){return v2Bootstrap&&!bootstrapFinished&&!workingScreen()&&Boolean(document.querySelector('[data-v2-loading]'));}
  function startupText(text,state){
    const loading=document.querySelector('[data-v2-loading]');if(loading)loading.textContent=text;
    if(document.body.dataset)document.body.dataset.pwaBootstrapState=state;
  }
  function completeBootstrap(){
    const recovered=bootstrapFailed;
    bootstrapFailed=false;
    bootstrapFinished=true;clearTimeout(bootstrapTimer);
    try{const key=automaticKey(expectedRevision);if(sessionStorage.getItem(key)==='attempted')sessionStorage.setItem(key,'completed');}catch{/* Retaining an attempted marker is safe when storage becomes unavailable. */}
    if(document.body.dataset)delete document.body.dataset.pwaBootstrapState;
    document.querySelector('[data-v2-loading]')?.remove();
    if(recovered)setUpdateState('up_to_date');
  }
  function reportBootstrapFailure(message='The new version could not open. Select Try again to restart. Your saved rosters have not been changed.'){
    if(!v2Bootstrap||bootstrapFinished||workingScreen())return;
    bootstrapFailed=true;clearTimeout(bootstrapTimer);
    startupText(message,'failed');
    setUpdateState('startup_failed');
  }
  function watchAutomaticStartup(){
    clearTimeout(bootstrapTimer);
    bootstrapTimer=setTimeout(()=>{if(workingScreen())completeBootstrap();else reportBootstrapFailure();},30000);
  }
  function releaseBootstrap(){
    if(bootstrapFailed||activationRequested)return;
    bootstrapReleased=true;resolveReady();
  }
  function unsavedStartupInput(){
    for(const input of document.querySelectorAll?.('textarea,select,input:not([type="button"]):not([type="submit"]):not([type="hidden"]),[contenteditable]')||[]){
      if(input.value||input.isContentEditable&&input.textContent)return true;
    }
    const drafts=JSON.parse(sessionStorage.getItem(draftKey)||'{}');
    return Object.values(drafts).some(draft=>Boolean(draft?.value));
  }
  function automaticStartupAllowed(){
    return !bootstrapReleased&&!bootstrapFailed&&!reloaded&&startupScreen()&&!root.WarhammerAppV2&&!document.querySelector('[data-v2-shell]');
  }
  async function automaticallyInstall(worker){
    if(!automaticStartupAllowed()||automaticUpdate||!worker||worker!==registration?.waiting)return false;
    automaticUpdate=(async()=>{
      try{
        const active=registration.active||navigator.serviceWorker.controller;
        if(!active||!/^[a-f0-9]{16}$/.test(expectedRevision)){reportBootstrapFailure();return false;}
        if(await readRevision(active)===expectedRevision)return false;
        const status=await query(worker);
        if(!automaticStartupAllowed())return false;
        if(worker!==registration.waiting){reportBootstrapFailure();return false;}
        if(status.type!==MESSAGE||!/^[a-f0-9]{16}$/.test(status.revision)||status.status!=='ready'||!Number.isSafeInteger(status.total)||status.total<=0||status.completed!==status.total){reportBootstrapFailure();return false;}
        if(unsavedStartupInput()){
          startupText('An update is ready. Save your unfinished input, then select Install and restart.','blocked');setUpdateState('ready');return false;
        }
        // Reserve before requesting activation. Never erase the per-version
        // reservation: a failed activation/reload must require a user action.
        if(sessionStorage.getItem(automaticKey(status.revision))!==null){reportBootstrapFailure();return false;}
        sessionStorage.setItem(automaticKey(status.revision),'attempted');
        if(sessionStorage.getItem(automaticKey(status.revision))!=='attempted')throw new Error('Automatic update reservation unavailable');
        startupText('Updating to the new version…','updating');setUpdateState('startup_updating');watchAutomaticStartup();
        await installUpdate({automatic:true,worker,revision:status.revision});return true;
      }catch(error){console.warn('Automatic startup update could not finish',error);reportBootstrapFailure();return false;}
    })();
    try{return await automaticUpdate;}finally{automaticUpdate=null;}
  }
  function activeBook(){return root.ArmyBookAppV2?.payload?.book?.id;}
  function restoreDraft(){
    const book=activeBook(),input=document.querySelector('[data-roster-input="raw-text"]');if(!book||!input||input.value)return;
    let drafts;try{drafts=JSON.parse(sessionStorage.getItem(draftKey)||'{}');}catch{return;}
    const draft=drafts[book];if(!draft)return;
    input.value=draft.value;input.setSelectionRange(draft.start,draft.end);input.dispatchEvent(new Event('input',{bubbles:true}));
    delete drafts[book];try{sessionStorage.setItem(draftKey,JSON.stringify(drafts));}catch{}
  }
  if(v2Bootstrap)new MutationObserver(restoreDraft).observe(document.body,{childList:true,subtree:true});
  function confirmedReload(){
    if(reloaded)return;
    const book=activeBook(),input=document.querySelector('[data-roster-input="raw-text"]');
    if(book&&input){try{const drafts=JSON.parse(sessionStorage.getItem(draftKey)||'{}');drafts[book]={value:input.value,start:input.selectionStart,end:input.selectionEnd};sessionStorage.setItem(draftKey,JSON.stringify(drafts));}catch{activationRequested=false;setUpdateState('failed');return;}}
    reloaded=true;location.reload();
  }
  const updater=document.querySelector('[data-pwa-updater]'),updateStatus=updater?.querySelector('[data-pwa-update-status]'),updateAction=updater?.querySelector('[data-pwa-update-action]'),installedVersion=updater?.querySelector('[data-pwa-installed-version]'),availableRow=updater?.querySelector('[data-pwa-available-row]'),availableVersion=updater?.querySelector('[data-pwa-available-version]');
  let node,label,meter,bar,announcement,activeSeen=false,readyTimer=0,lastAnnouncement='',failedRevision='',registration,checkPromise=null,autoChecked=false,activationRequested=false,reloaded=false,controlledWorker=navigator.serviceWorker.controller;
  const watchedWorkers=new WeakSet(),workerSequences=new WeakMap();
  const updateStates={
    idle:['Check for updates','Check for updates',false],
    checking:['Checking for updates…','Checking for updates…',true],
    up_to_date:['Up to date','Check again',false],
    downloading:['Downloading update…','Downloading update…',true],
    ready:['Update ready','Install and restart',false],
    failed:['Could not check for updates','Retry',false],
    changed:['Сайт обновился. Перезагрузить?','Перезагрузить',false],
    startup_updating:['Updating to the new version…','Updating…',true],
    startup_failed:['The update could not open. Please try again.','Try again',false]
  };
  function setUpdateState(state){
    if(!updater)return;
    if(document.body.dataset?.pwaBootstrapState==='blocked'&&state==='changed')state='ready';
    if(bootstrapFailed&&state!=='startup_failed')return;
    if(activationRequested&&startupScreen()&&!['startup_failed','startup_updating'].includes(state))return;
    const values=updateStates[state]||updateStates.idle;
    updater.dataset.state=state;updateStatus.textContent=values[0];updateAction.textContent=values[1];updateAction.disabled=values[2];
  }
  function showAvailable(revision){if(!availableRow||!availableVersion)return;availableVersion.textContent=revision||'unknown';availableRow.hidden=false;}
  function mount(){
    if(node)return node;
    const header=document.querySelector('header.app-header, header.topbar, header.v2-primary-header');if(!header)return null;
    header.classList.add('offline-package-host');
    node=document.createElement('div');node.className='offline-package-status';node.dataset.offlinePackageStatus='';node.hidden=true;
    label=document.createElement('span');label.className='offline-package-label';label.setAttribute('aria-hidden','true');
    meter=document.createElement('span');meter.className='offline-package-meter';meter.setAttribute('role','progressbar');meter.setAttribute('aria-label','Offline package download progress');meter.setAttribute('aria-valuemin','0');meter.setAttribute('aria-valuemax','100');
    bar=document.createElement('i');meter.append(bar);
    announcement=document.createElement('span');announcement.className='offline-package-announcement';announcement.setAttribute('role','status');announcement.setAttribute('aria-live','polite');announcement.setAttribute('aria-atomic','true');
    node.append(label,meter,announcement);header.append(node);return node;
  }
  function announce(text,force=false){if(!announcement||(!force&&text===lastAnnouncement))return;lastAnnouncement=text;announcement.textContent=text;}
  function hide(){if(!node)return;node.classList.remove('is-visible');node.hidden=true;}
  function apply(payload,worker){
    if(!payload||payload.type!==MESSAGE)return;
    const sequence=Number(payload.sequence)||0,lastSequence=worker&&workerSequences.get(worker)||0;if(worker&&sequence<lastSequence)return;if(worker)workerSequences.set(worker,sequence);
    if(failedRevision&&payload.revision===failedRevision&&payload.status!=='error'&&payload.status!=='ready')return;
    if(startupScreen()&&!bootstrapFailed&&document.body.dataset?.pwaBootstrapState!=='blocked'&&payload.revision===expectedRevision){
      if(payload.status==='updating')startupText('Updating to the new version…','updating');
      if(payload.status==='error'){reportBootstrapFailure();return;}
    }
    const target=mount();if(!target)return;clearTimeout(readyTimer);
    const total=Math.max(0,Number(payload.total)||0),completed=Math.max(0,Math.min(total,Number(payload.completed)||0)),percent=total?Math.round(completed/total*100):0,state=payload.status;
    target.dataset.state=state;target.dataset.revision=payload.revision||'';target.dataset.completed=String(completed);target.dataset.total=String(total);meter.setAttribute('aria-valuenow',String(percent));bar.style.setProperty('--offline-progress',`${percent}%`);
    if(state==='preparing'||state==='updating'){
      activeSeen=true;const prefix=state==='updating'?'Обновление офлайн':'Подготовка офлайн';label.textContent=`${prefix} · ${percent}%`;target.hidden=false;requestAnimationFrame(()=>target.classList.add('is-visible'));if(percent===0||percent===100||percent%10===0)announce(`${prefix}, ${percent} процентов`);if(state==='updating')setUpdateState('downloading');return;
    }
    if(state==='ready'){
      failedRevision='';
      if(!activeSeen){hide();return;}
      label.textContent='Готово офлайн ✓';meter.setAttribute('aria-valuenow','100');bar.style.setProperty('--offline-progress','100%');target.hidden=false;requestAnimationFrame(()=>target.classList.add('is-visible'));announce('Готово офлайн',true);readyTimer=setTimeout(hide,1400);return;
    }
    if(state==='error'){console.warn('Offline package status error',{revision:payload.revision,completed,total,error:payload.error});failedRevision=payload.revision||failedRevision;activeSeen=true;label.textContent='Офлайн-пакет не готов';target.hidden=false;requestAnimationFrame(()=>target.classList.add('is-visible'));announce('Офлайн-пакет не готов',true);if(registration?.active)setUpdateState('failed');return;}
    hide();
  }
  function request(worker,type,data={}){
    if(!worker)return Promise.reject(new Error('Service worker unavailable'));
    return new Promise((resolve,reject)=>{const channel=new MessageChannel(),timer=setTimeout(()=>{channel.port1.close();reject(new Error('Service worker reply timed out'));},10000);channel.port1.onmessage=event=>{clearTimeout(timer);channel.port1.close();resolve(event.data);};try{worker.postMessage({type,...data},[channel.port2]);}catch(error){reject(error);}});
  }
  async function query(worker){const payload=await request(worker,QUERY);apply(payload,worker);return payload;}
  async function readRevision(worker){const payload=await request(worker,VERSION_QUERY);return payload?.revision||'';}
  async function syncInstalled(){
    const worker=registration?.active||navigator.serviceWorker.controller;if(!worker)return;
    // Each app startup/controller change retries an interrupted data transfer.
    // Never ask an installing/waiting publication to clean the active cache.
    request(worker,'WH_PWA_MIGRATE_V2_DATA').catch(()=>{});
    try{const payload=await query(worker);if(installedVersion&&payload.revision)installedVersion.textContent=payload.revision;if(v2Bootstrap){if(payload.revision===expectedRevision)releaseBootstrap();else {reloadRequired=true;if(startupScreen()&&!bootstrapFailed&&document.body.dataset?.pwaBootstrapState!=='blocked')startupText('Updating to the new version…','updating');setUpdateState('changed');automaticallyInstall(registration?.waiting);}}}catch{}
  }
  async function updateReady(worker){
    if(!worker||!registration?.active)return;
    try{showAvailable(await readRevision(worker));}catch{try{showAvailable((await query(worker)).revision);}catch{showAvailable('unknown');}}
    setUpdateState('ready');
    await automaticallyInstall(worker);
  }
  function watch(worker){
    if(!worker||watchedWorkers.has(worker))return;watchedWorkers.add(worker);if(worker.state!=='installing')query(worker).catch(()=>{});
    const changed=()=>{if(worker.state!=='installing')query(worker).catch(()=>{});if(worker.state==='installing'&&registration?.active)setUpdateState('downloading');if(worker.state==='installed'&&registration?.active)updateReady(worker);};
    worker.addEventListener('statechange',changed);changed();
  }
  function observe(value){
    registration=value;if(!registration)return;
    watch(registration.active);watch(registration.waiting);watch(registration.installing);
    if(registration.waiting)updateReady(registration.waiting);
    registration.addEventListener('updatefound',()=>{const worker=registration.installing;if(registration.active)setUpdateState('downloading');watch(worker);});
    syncInstalled();
  }
  async function checkForUpdate({quiet=false}={}){
    if(checkPromise)return checkPromise;
    checkPromise=(async()=>{
      if(!registration)throw new Error('Service worker registration unavailable');
      if(registration.waiting){await updateReady(registration.waiting);return 'ready';}
      if(!navigator.onLine)throw new Error('Offline');
      failedRevision='';
      if(!quiet)setUpdateState('checking');
      await registration.update();
      if(registration.waiting){await updateReady(registration.waiting);return 'ready';}
      if(registration.installing){setUpdateState('downloading');watch(registration.installing);return 'downloading';}
      if(!quiet)setUpdateState('up_to_date');
      return 'up_to_date';
    })().catch(error=>{if(!quiet)setUpdateState('failed');throw error;}).finally(()=>{checkPromise=null;});
    return checkPromise;
  }
  async function checkRunningVersion(){
    if(!v2Bootstrap)return true;
    if(reloadRequired||reloaded){setUpdateState('changed');return false;}
    let current,offlinePackage;
    if(navigator.onLine){
      try{
        const oracle=new URL('./glossary/generated/cache-revision.js',new URL(swUrl,location.href));
        oracle.searchParams.set('version-check',Date.now().toString(36)+'-'+Math.random().toString(36).slice(2));
        const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),5000);
        try{
          const response=await fetch(oracle,{cache:'no-store',signal:controller.signal});
          if(response.ok)current=(await response.text()).match(/WH40K_CACHE_REVISION\s*=\s*["']([a-f0-9]{16})["']/)?.[1];
        }finally{clearTimeout(timer);}
      }catch{/* Verify the installed publication when the network oracle is unavailable. */}
    }
    if(!current){
      current=undefined;
      const worker=navigator.serviceWorker.controller||registration?.active;
      try{
        offlinePackage=await request(worker,QUERY);
        if(worker===(navigator.serviceWorker.controller||registration?.active)
            &&offlinePackage?.type===MESSAGE&&/^[a-f0-9]{16}$/.test(offlinePackage.revision)){
          current=offlinePackage.revision;
        }
      }catch{/* An unavailable worker cannot prove compatibility. */}
    }
    if(reloadRequired||reloaded){setUpdateState('changed');return false;}
    if(!current){setUpdateState('failed');return false;}
    if(current!==expectedRevision){reloadRequired=true;showAvailable(current);setUpdateState('changed');return false;}
    if(offlinePackage&&(offlinePackage.status!=='ready'||!Number.isSafeInteger(offlinePackage.total)
        ||offlinePackage.total<=0||offlinePackage.completed!==offlinePackage.total)){
      setUpdateState('failed');return false;
    }
    return true;
  }
  async function installUpdate({automatic=false,worker:expectedWorker=null,revision:expectedTarget=null}={}){
    try{
      if(!automatic&&v2Bootstrap&&registration?.active){const active=await readRevision(registration.active);if(active!==expectedRevision&&active===availableVersion?.textContent){confirmedReload();return;}}
      const waiting=registration?.waiting;if(!waiting){if(automatic)throw new Error('Prepared startup update unavailable');setUpdateState('failed');return;}
      if(automatic&&(!automaticStartupAllowed()||waiting!==expectedWorker))throw new Error('Prepared startup update changed');
      activationRequested=true;updateAction.disabled=true;
      const revision=automatic?expectedTarget:availableVersion?.textContent||await readRevision(waiting);
      if(automatic&&await readRevision(waiting)!==revision)throw new Error('Prepared startup update changed');
      if(automatic&&(!automaticStartupAllowed()||waiting!==registration.waiting||unsavedStartupInput()))throw new Error('Startup is no longer safe to restart');
      const reply=await request(waiting,ACTIVATE_UPDATE,{revision});
      if(!reply?.accepted)throw new Error('Waiting worker declined activation');
      if(waiting.state!=='activated')await new Promise((resolve,reject)=>{
        const timer=setTimeout(()=>reject(new Error('Worker activation timed out')),15000);
        const changed=()=>{if(waiting.state==='activated'){clearTimeout(timer);waiting.removeEventListener('statechange',changed);resolve();}};waiting.addEventListener('statechange',changed);changed();
      });
      if(automatic){
        if(bootstrapFailed)return;
        if(!automaticStartupAllowed()||unsavedStartupInput()){
          activationRequested=false;
          if(workingScreen()){completeBootstrap();setUpdateState('changed');}
          else reportBootstrapFailure('The update is ready. Save your unfinished input, then select Try again to restart.');
          return;
        }
      }
      confirmedReload();
    }catch(error){console.warn('Service worker update activation failed',error);activationRequested=false;if(startupScreen())reportBootstrapFailure();else setUpdateState('failed');}
  }
  async function confirmChanged(){
    try{
      // A duplicate waiting registration must not block a version already active.
      if(registration?.active){const active=await readRevision(registration.active);if(active!==expectedRevision&&active===availableVersion?.textContent){confirmedReload();return;}}
      if(registration?.waiting){await installUpdate();return;}
      if(!navigator.onLine){confirmedReload();return;}
      await checkForUpdate({quiet:true});
      if(registration?.waiting){await installUpdate();return;}
      if(registration?.installing){setUpdateState('downloading');return;}
      confirmedReload();
    }catch{if(startupScreen())reportBootstrapFailure();else setUpdateState('failed');}
  }
  async function start(){
    try{
      registration=await navigator.serviceWorker.getRegistration();
      if(v2Bootstrap){
        try{
          const marker=sessionStorage.getItem(automaticKey(expectedRevision)),pending=pendingAutomaticAttempt();
          if(marker!==null||pending){
            if(marker==='attempted'||pending)startupText('Updating to the new version…','updating');
            watchAutomaticStartup();
          }
        }catch{/* A blocked store never grants permission to auto-activate. */}
      }
      if(!registration&&navigator.serviceWorker.controller)registration=await navigator.serviceWorker.ready;
      if(updater&&navigator.onLine&&registration?.updateViaCache!=='none'){registration=await navigator.serviceWorker.register(swUrl,{updateViaCache:'none'});autoChecked=true;}
      else if(!registration)registration=await navigator.serviceWorker.register(swUrl,{updateViaCache:'none'});
      observe(registration);
      if(updater&&registration.active&&navigator.onLine&&!autoChecked){autoChecked=true;checkForUpdate({quiet:true}).catch(()=>{});}
    }catch{
      try{registration=await navigator.serviceWorker.getRegistration();if(registration){observe(registration);return;}}catch{}
      apply({type:MESSAGE,status:'error',completed:0,total:0,revision:''});setUpdateState('failed');
      if(!navigator.serviceWorker.controller&&navigator.onLine){if(v2Bootstrap)updater.dataset.unavailable='true';resolveReady();}
    }
  }
  updateAction?.addEventListener('click',()=>{if(updater.dataset.state==='startup_failed'){bootstrapFailed=false;startupText('Updating to the new version…','updating');setUpdateState('startup_updating');confirmChanged();}else if(updater.dataset.state==='changed')confirmChanged();else if(updater.dataset.state==='ready')installUpdate();else checkForUpdate().catch(()=>{});});
  navigator.serviceWorker.addEventListener('message',event=>{if(event.data?.type==='WH_PWA_DATA_CHANGED'){reloadRequired=true;setUpdateState('changed');return;}apply(event.data,event.source);});
  navigator.serviceWorker.addEventListener('controllerchange',()=>{controlledWorker=navigator.serviceWorker.controller;syncInstalled();});
  if(v2Bootstrap||document.readyState==='complete')start();else addEventListener('load',start,{once:true});
  root.WHOfflineStatus=Object.freeze({ready,completeBootstrap,reportBootstrapFailure,checkRunningVersion,reportLoadFailure:()=>setUpdateState('failed'),query:()=>navigator.serviceWorker.getRegistration().then(value=>value&&query(value.installing||value.waiting||value.active)),check:()=>checkForUpdate()});
})(window);

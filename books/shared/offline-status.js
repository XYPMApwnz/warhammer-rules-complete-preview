(function(root){
  'use strict';
  const script=document.currentScript,swUrl=script?.dataset.serviceWorker;
  let serviceWorker;
  try{serviceWorker=navigator.serviceWorker;}catch{/* Browser policy can deny even reading the optional API. */}
  if(!swUrl||!serviceWorker||!location.protocol.startsWith('http')){root.WHOfflineStatus=Object.freeze({ready:Promise.resolve()});return;}
  const MESSAGE='WH_OFFLINE_PACKAGE_STATUS',QUERY='WH_OFFLINE_PACKAGE_STATUS_QUERY',VERSION_QUERY='GET_VERSION',ACTIVATE_UPDATE='SKIP_WAITING';
  const PREPARE_OFFLINE='WH_PWA_PREPARE_OFFLINE',BOOTSTRAP_COMPLETE='WH_PWA_BOOTSTRAP_COMPLETE';
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
  let bootstrapReleased=false,bootstrapFinished=!v2Bootstrap,bootstrapFailed=false,bootstrapTimer=0,automaticUpdate=null,versionRecoveryStarted=false,fetchMarkerInstalled=false,coreRepairPending=false,registrationUnavailable=false,registrationForbidden=false,starting=false;
  let pendingIndicator=null;
  function preparedCore(payload){
    if(!payload||payload.type!==MESSAGE)return false;
    if(Object.prototype.hasOwnProperty.call(payload,'coreReady'))return payload.coreReady===true
      &&Number.isSafeInteger(payload.coreTotal)&&payload.coreTotal>0&&payload.coreCompleted===payload.coreTotal
      &&/^[a-f0-9]{16}$/.test(payload.cacheBytes||'');
    // Older published workers have no separate core: a complete shell proves it.
    return payload.status==='ready'&&Number.isSafeInteger(payload.total)&&payload.total>0&&payload.completed===payload.total;
  }
  function installFetchMarker(){
    if(fetchMarkerInstalled||!v2Bootstrap||typeof root.fetch!=='function'||!/^[a-f0-9]{16}$/.test(expectedRevision||''))return;
    const original=root.fetch.bind(root),scope=new URL('./',new URL(swUrl,location.href));
    const excluded=new Set([new URL(swUrl,location.href).pathname,new URL('glossary/generated/cache-revision.js',scope).pathname,
      new URL('PAGES_RUNTIME_MANIFEST.json',scope).pathname,new URL('manifest.webmanifest',scope).pathname]);
    root.fetch=function(input,options){
      let marked=input;
      try{
        const isRequest=typeof root.Request==='function'&&input instanceof root.Request;
        const method=String(options?.method||(isRequest?input.method:'GET')).toUpperCase();
        const url=new URL(isRequest?input.url:String(input),location.href);
        if(method==='GET'&&url.origin===scope.origin&&url.pathname.startsWith(scope.pathname)
            &&!excluded.has(url.pathname)&&!url.searchParams.has('wh-pwa')
            &&/\.(?:js|mjs|css|json|png|jpe?g|webp|avif|gif|svg|ico|apng|bmp)$/i.test(url.pathname)){
          url.searchParams.set('wh-pwa',expectedRevision);
          marked=isRequest?new root.Request(url.href,input):url.href;
        }
      }catch{/* Leave unsupported inputs to the browser's original fetch validation. */}
      return original(marked,options);
    };
    fetchMarkerInstalled=true;
  }
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
    if(pendingIndicator)apply(pendingIndicator.payload,pendingIndicator.worker);
    const worker=serviceWorker.controller||registration?.active;
    request(worker,BOOTSTRAP_COMPLETE,{revision:expectedRevision}).then(payload=>apply(payload,worker)).catch(()=>{});
    prepareOffline(worker);
  }
  function reportBootstrapFailure(message='The new version could not open. Select Try again to restart. Your saved rosters have not been changed.',force=false){
    if(!v2Bootstrap||bootstrapFinished||workingScreen())return;
    if(!force&&versionRecoveryStarted&&reloadRequired&&!reloaded&&!activationRequested)return;
    bootstrapFailed=true;clearTimeout(bootstrapTimer);
    startupText(message,'failed');
    setUpdateState('startup_failed');
  }
  function watchAutomaticStartup(){
    clearTimeout(bootstrapTimer);
    bootstrapTimer=setTimeout(()=>{if(workingScreen())completeBootstrap();else reportBootstrapFailure(undefined,true);},30000);
  }
  function releaseBootstrap(){
    if(bootstrapFailed||activationRequested)return;
    installFetchMarker();bootstrapReleased=true;resolveReady();
  }
  function unsavedStartupInput(){
    for(const input of document.querySelectorAll?.('textarea,select,input:not([type="button"]):not([type="submit"]):not([type="hidden"]),[contenteditable]')||[]){
      if(input.value||input.isContentEditable&&input.textContent)return true;
    }
    const drafts=JSON.parse(sessionStorage.getItem(draftKey)||'{}');
    return Object.values(drafts).some(draft=>Boolean(draft?.value));
  }
  function automaticStartupAllowed(){
    return !bootstrapFailed&&!reloaded&&startupScreen();
  }
  function reserveAutomaticRevision(revision){
    if(sessionStorage.getItem(automaticKey(revision))!==null)throw new Error('Automatic update already attempted');
    sessionStorage.setItem(automaticKey(revision),'attempted');
    if(sessionStorage.getItem(automaticKey(revision))!=='attempted')throw new Error('Automatic update reservation unavailable');
  }
  function recoverStartupVersion(){
    // Before module release, registration/waiting-worker observation already
    // owns startup updates. A compatibility query alone must not start one.
    if(!bootstrapReleased||versionRecoveryStarted||!automaticStartupAllowed()||!navigator.onLine)return;
    versionRecoveryStarted=true;startupText('Updating to the new version…','updating');setUpdateState('startup_updating');watchAutomaticStartup();
    checkForUpdate({quiet:true}).catch(()=>reportBootstrapFailure(undefined,true));
  }
  async function automaticallyReloadActive(worker,payload){
    // The in-flight activation owns its eventual reload. A controllerchange
    // during that activation must not reserve the same revision a second time.
    if(activationRequested||automaticUpdate)return false;
    if(!automaticStartupAllowed()||worker!==registration?.active||!preparedCore(payload)||!/^[a-f0-9]{16}$/.test(payload.revision)||payload.revision===expectedRevision)return false;
    try{
      // An active A with opening HTML B is the ordinary update case. Only the
      // fresh oracle can distinguish that from stale HTML A under active B.
      if(!navigator.onLine||await freshServerRevision()!==payload.revision)return false;
      if(!automaticStartupAllowed()||worker!==registration?.active)return false;
      if(unsavedStartupInput()){startupText('An update is ready. Save your unfinished input, then select Install and restart.','blocked');setUpdateState('ready');return false;}
      reserveAutomaticRevision(payload.revision);startupText('Updating to the new version…','updating');setUpdateState('startup_updating');watchAutomaticStartup();confirmedReload();return true;
    }catch{reportBootstrapFailure(undefined,true);return false;}
  }
  async function automaticallyInstall(worker){
    if(automaticUpdate)return automaticUpdate;
    if(!automaticStartupAllowed()||!worker||worker!==registration?.waiting)return false;
    automaticUpdate=(async()=>{
      try{
        const active=registration.active||serviceWorker.controller;
        if(!active||!/^[a-f0-9]{16}$/.test(expectedRevision)){reportBootstrapFailure();return false;}
        const activeRevision=await readRevision(active);
        const status=await query(worker);
        if(!automaticStartupAllowed())return false;
        if(worker!==registration.waiting){reportBootstrapFailure();return false;}
        if(!/^[a-f0-9]{16}$/.test(status.revision)||!preparedCore(status)){reportBootstrapFailure(undefined,true);return false;}
        if(status.revision===activeRevision)return false;
        if(unsavedStartupInput()){
          startupText('An update is ready. Save your unfinished input, then select Install and restart.','blocked');setUpdateState('ready');return false;
        }
        // Reserve before requesting activation. Never erase the per-version
        // reservation: a failed activation/reload must require a user action.
        reserveAutomaticRevision(status.revision);
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
  if(v2Bootstrap)new MutationObserver(()=>{restoreDraft();if(!node&&pendingIndicator)apply(pendingIndicator.payload,pendingIndicator.worker);}).observe(document.body,{childList:true,subtree:true});
  function confirmedReload(){
    if(reloaded)return;
    const book=activeBook(),input=document.querySelector('[data-roster-input="raw-text"]');
    if(book&&input){try{const drafts=JSON.parse(sessionStorage.getItem(draftKey)||'{}');drafts[book]={value:input.value,start:input.selectionStart,end:input.selectionEnd};sessionStorage.setItem(draftKey,JSON.stringify(drafts));}catch{activationRequested=false;setUpdateState('failed');return;}}
    reloaded=true;location.reload();
  }
  const updater=document.querySelector('[data-pwa-updater]'),updateStatus=updater?.querySelector('[data-pwa-update-status]'),updateAction=updater?.querySelector('[data-pwa-update-action]'),installedVersion=updater?.querySelector('[data-pwa-installed-version]'),availableRow=updater?.querySelector('[data-pwa-available-row]'),availableVersion=updater?.querySelector('[data-pwa-available-version]');
  let node,label,meter,bar,announcement,activeSeen=false,readyTimer=0,lastAnnouncement='',registration,checkPromise=null,autoChecked=false,activationRequested=false,reloaded=false,controlledWorker=serviceWorker.controller;
  let offlineRetryTimer=0,offlineRetryCount=0,lastOfflineRetry=0;
  const watchedWorkers=new WeakSet(),workerSequences=new WeakMap(),workerStatuses=new WeakMap(),preparationRequested=new WeakSet();
  const workerInstances=new WeakMap(),instanceRefreshes=new WeakMap(),querySerials=new WeakMap();
  const updateStates={
    idle:['Check for updates','Check for updates',false],
    checking:['Checking for updates…','Checking for updates…',true],
    up_to_date:['Up to date','Check again',false],
    downloading:['Downloading update…','Downloading update…',true],
    ready:['Update ready','Install and restart',false],
    failed:['Could not check for updates','Retry',false],
    changed:['A new version is available. Restart to update.','Install and restart',false],
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
  function scheduleOfflineRetry(worker){
    if(offlineRetryTimer||!navigator.onLine||offlineRetryCount>=2||!worker)return;
    const delay=offlineRetryCount===0?15000:30000;
    offlineRetryTimer=setTimeout(()=>{offlineRetryTimer=0;offlineRetryCount++;prepareOffline(worker,{retry:true});},delay);
  }
  function canPrepareOffline(worker,payload){
    // Only a current worker with the resumable protocol can actually retry.
    return Boolean(worker&&payload&&typeof payload.coreReady==='boolean'&&Number.isSafeInteger(payload.coreTotal)&&payload.coreTotal>0
      &&Number.isSafeInteger(payload.coreCompleted)&&payload.coreCompleted>=0&&payload.coreCompleted<=payload.coreTotal
      &&/^[a-f0-9]{16}$/.test(payload.cacheBytes||'')&&worker.state!=='redundant'
      &&(worker===serviceWorker.controller||worker===registration?.active||worker===registration?.waiting)
      &&(!v2Bootstrap||worker===registration?.waiting||payload.revision===expectedRevision));
  }
  function prepareOffline(worker,{retry=false}={}){
    const payload=worker&&workerStatuses.get(worker);
    // Older workers prepare their package during install, not via this protocol.
    if(!canPrepareOffline(worker,payload))return;
    if(preparationRequested.has(worker)&&!retry)return;
    preparationRequested.add(worker);lastOfflineRetry=Date.now();
    const afterStartup=worker!==registration?.waiting&&!bootstrapFinished&&preparedCore(payload);
    request(worker,PREPARE_OFFLINE,{revision:payload.revision,afterStartup}).then(value=>apply(value,worker)).catch(()=>{
      if(worker===(serviceWorker.controller||registration?.active)){
        apply({...payload,status:'error',error:'Offline preparation could not be contacted.'},worker);scheduleOfflineRetry(worker);
      }
    });
  }
  function refreshStatusInstance(worker,instance,seen=new Set()){
    const pending=instanceRefreshes.get(worker);
    if(pending){if(!pending.seen.has(instance)){pending.seen.add(instance);pending.again=true;}return;}
    const refresh={seen:new Set([...seen,instance]),again:false};instanceRefreshes.set(worker,refresh);
    query(worker).catch(()=>{}).finally(()=>{
      if(instanceRefreshes.get(worker)!==refresh)return;
      instanceRefreshes.delete(worker);
      // A different incarnation observed while this query was in flight needs
      // one fresh query; never adopt a late broadcast as its own proof.
      if(refresh.again)refreshStatusInstance(worker,instance,refresh.seen);
    });
  }
  function apply(payload,worker,{authoritative=false,querySerial=0}={}){
    if(!payload||payload.type!==MESSAGE)return;
    if(authoritative&&querySerial!==querySerials.get(worker))return;
    if(Object.prototype.hasOwnProperty.call(payload,'statusInstance')){
      if(!worker||!/^[a-f0-9]{32}$/.test(payload.statusInstance||''))return;
      if(!authoritative&&instanceRefreshes.has(worker)){refreshStatusInstance(worker,payload.statusInstance);return;}
      if(workerInstances.get(worker)!==payload.statusInstance){
        if(!authoritative){refreshStatusInstance(worker,payload.statusInstance);return;}
        workerInstances.set(worker,payload.statusInstance);workerSequences.set(worker,0);
      }
    }else if(worker&&workerInstances.has(worker))return;
    const sequence=Number(payload.sequence)||0,lastSequence=worker&&workerSequences.get(worker)||0;if(worker&&sequence<lastSequence)return;if(worker)workerSequences.set(worker,sequence);
    const previous=worker&&workerStatuses.get(worker);if(worker)workerStatuses.set(worker,payload);
    const active=registration?.active||serviceWorker.controller;
    if(worker&&(worker.state==='redundant'||active&&worker!==active))return;
    if(v2Bootstrap&&payload.revision&&payload.revision!==expectedRevision){
      clearTimeout(readyTimer);clearTimeout(offlineRetryTimer);offlineRetryTimer=0;pendingIndicator=null;hide();return;
    }
    if(worker&&worker===serviceWorker.controller&&payload.revision===expectedRevision
        &&previous?.coreReady===false&&preparedCore(payload)){
      // Only a proven pre-import core repair may resume a blocked bootstrap.
      // Generic module failures still require the existing explicit retry.
      if(coreRepairPending&&!bootstrapReleased){coreRepairPending=false;bootstrapFailed=false;clearTimeout(bootstrapTimer);startupText('Opening Warhammer 40,000…','opening');setUpdateState('up_to_date');}
      Promise.resolve().then(()=>syncInstalled());
    }
    pendingIndicator={payload,worker};
    if(payload.status==='preparing'||payload.status==='updating'||payload.status==='error')activeSeen=true;
    if(startupScreen()&&!bootstrapFailed&&document.body.dataset?.pwaBootstrapState!=='blocked'&&payload.revision===expectedRevision){
      if(payload.status==='updating')startupText('Updating to the new version…','updating');
      if(payload.status==='error'&&!preparedCore(payload)){reportBootstrapFailure(undefined,true);return;}
    }
    const target=mount();if(!target)return;clearTimeout(readyTimer);
    const total=Math.max(0,Number(payload.total)||0),completed=Math.max(0,Math.min(total,Number(payload.completed)||0)),percent=total?Math.round(completed/total*100):0;
    const state=payload.status==='ready'&&(!Number.isSafeInteger(payload.total)||payload.total<=0||payload.completed!==payload.total)?'error':payload.status;
    target.dataset.state=state;target.dataset.revision=payload.revision||'';target.dataset.completed=String(completed);target.dataset.total=String(total);meter.setAttribute('aria-valuenow',String(percent));bar.style.setProperty('--offline-progress',`${percent}%`);
    if(state==='preparing'||state==='updating'){
      label.textContent='Preparing offline access…';meter.setAttribute('aria-valuetext',`Preparing offline access, ${percent}%`);target.hidden=false;requestAnimationFrame(()=>target.classList.add('is-visible'));announce('Preparing offline access…');return;
    }
    if(state==='ready'){
      clearTimeout(offlineRetryTimer);offlineRetryTimer=0;offlineRetryCount=0;
      if(!activeSeen){hide();return;}
      label.textContent='Ready for offline use';meter.setAttribute('aria-valuenow','100');meter.setAttribute('aria-valuetext','Ready for offline use');bar.style.setProperty('--offline-progress','100%');target.hidden=false;requestAnimationFrame(()=>target.classList.add('is-visible'));announce('Ready for offline use',true);readyTimer=setTimeout(hide,1400);return;
    }
    if(state==='error'){if(!canPrepareOffline(worker,payload)||navigator.onLine&&offlineRetryCount>=2&&!offlineRetryTimer){hide();return;}console.warn('Offline package status error',{revision:payload.revision,completed,total,error:payload.error});label.textContent='Offline access not ready — will retry';meter.setAttribute('aria-valuetext','Offline access not ready — will retry');target.hidden=false;requestAnimationFrame(()=>target.classList.add('is-visible'));announce('Offline access not ready — will retry',true);scheduleOfflineRetry(worker);if(registration?.active&&!preparedCore(payload))setUpdateState('failed');return;}
    hide();
  }
  function request(worker,type,data={}){
    if(!worker)return Promise.reject(new Error('Service worker unavailable'));
    return new Promise((resolve,reject)=>{const channel=new MessageChannel(),timer=setTimeout(()=>{channel.port1.close();reject(new Error('Service worker reply timed out'));},10000);channel.port1.onmessage=event=>{clearTimeout(timer);channel.port1.close();resolve(event.data);};try{worker.postMessage({type,...data},[channel.port2]);}catch(error){reject(error);}});
  }
  async function query(worker){
    const querySerial=(querySerials.get(worker)||0)+1;querySerials.set(worker,querySerial);
    const payload=await request(worker,QUERY);apply(payload,worker,{authoritative:true,querySerial});return payload;
  }
  async function readRevision(worker){const payload=await request(worker,VERSION_QUERY);return payload?.revision||'';}
  async function syncInstalled(){
    const worker=registration?.active||serviceWorker.controller;if(!worker)return;
    // Each app startup/controller change retries an interrupted data transfer.
    // Never ask an installing/waiting publication to clean the active cache.
    request(worker,'WH_PWA_MIGRATE_V2_DATA').catch(()=>{});
    try{
      const payload=await query(worker);if(installedVersion&&payload.revision)installedVersion.textContent=payload.revision;
      if(!v2Bootstrap){prepareOffline(worker);return;}
      if(payload.revision!==expectedRevision){
        reloadRequired=true;if(startupScreen()&&!bootstrapFailed&&document.body.dataset?.pwaBootstrapState!=='blocked')startupText('Updating to the new version…','updating');
        setUpdateState('changed');if(!await automaticallyReloadActive(worker,payload))automaticallyInstall(registration?.waiting);return;
      }
      if(!preparedCore(payload)){
        if(!bootstrapReleased&&startupScreen())coreRepairPending=true;
        prepareOffline(worker);if(payload.status==='error')reportBootstrapFailure(undefined,true);return;
      }
      if(coreRepairPending&&!bootstrapReleased){coreRepairPending=false;bootstrapFailed=false;clearTimeout(bootstrapTimer);startupText('Opening Warhammer 40,000…','opening');setUpdateState('up_to_date');}
      // Cached or delayed A HTML must not open ahead of an already prepared B.
      // Adjudicate that waiting publication before releasing any app module.
      if(automaticUpdate||automaticStartupAllowed())await automaticallyInstall(registration.waiting);
      if(bootstrapFailed||reloaded||activationRequested||document.body.dataset?.pwaBootstrapState==='blocked')return;
      // Registration.active can change before clients.claim finishes. Boot must
      // not import through a previous or missing controller during that gap.
      if(serviceWorker.controller!==worker)return;
      releaseBootstrap();
      prepareOffline(worker);
    }catch{}
  }
  async function updateReady(worker){
    if(!worker||!registration?.active)return;
    try{
      const payload=await query(worker);showAvailable(payload.revision||await readRevision(worker));
      if(!preparedCore(payload)){setUpdateState('downloading');return;}
      prepareOffline(worker);
    }catch{showAvailable('unknown');setUpdateState('failed');return;}
    setUpdateState('ready');
    await automaticallyInstall(worker);
  }
  function watch(worker){
    if(!worker||watchedWorkers.has(worker))return;watchedWorkers.add(worker);if(worker.state!=='installing')query(worker).catch(()=>{});
    let previousState=worker.state;
    const changed=()=>{
      const failedInstall=previousState==='installing'&&worker.state==='redundant';previousState=worker.state;
      if(failedInstall&&registration?.active&&worker!==registration.active
          &&(!registration.installing||registration.installing===worker)&&!registration.waiting){
        // A failed new core must expose Retry without replacing the working
        // revision's offline indicator or treating its intact screen as failed.
        setUpdateState('failed');return;
      }
      if(worker.state==='redundant'&&!registration?.active&&!serviceWorker.controller&&!bootstrapReleased){
        registrationUnavailable=true;coreRepairPending=true;reportBootstrapFailure('The site could not finish opening. Reconnect, then select Try again.',true);return;
      }
      if(worker.state!=='installing')query(worker).catch(()=>{});
      if(worker.state==='installing'&&registration?.active)setUpdateState('downloading');
      if(worker.state==='installed'&&registration?.active)updateReady(worker);
    };
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
      if(!quiet)setUpdateState('checking');
      await registration.update();
      if(registration.waiting){await updateReady(registration.waiting);return 'ready';}
      if(registration.installing){setUpdateState('downloading');watch(registration.installing);return 'downloading';}
      if(!quiet)setUpdateState('up_to_date');
      return 'up_to_date';
    })().catch(error=>{if(!quiet)setUpdateState('failed');throw error;}).finally(()=>{checkPromise=null;});
    return checkPromise;
  }
  async function freshServerRevision(){
    const oracle=new URL('./glossary/generated/cache-revision.js',new URL(swUrl,location.href));
    oracle.searchParams.set('version-check',Date.now().toString(36)+'-'+Math.random().toString(36).slice(2));
    const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),5000);
    try{
      const response=await fetch(oracle,{cache:'no-store',signal:controller.signal});
      if(response.ok)return (await response.text()).match(/WH40K_CACHE_REVISION\s*=\s*["']([a-f0-9]{16})["']/)?.[1];
    }finally{clearTimeout(timer);}
  }
  async function checkRunningVersion(){
    if(!v2Bootstrap)return true;
    if(reloadRequired||reloaded){setUpdateState('changed');return false;}
    let current,offlinePackage;
    if(navigator.onLine){
      try{
        current=await freshServerRevision();
      }catch{/* Verify the installed publication when the network oracle is unavailable. */}
    }
    if(!current){
      current=undefined;
      const worker=serviceWorker.controller||registration?.active;
      try{
        offlinePackage=await request(worker,QUERY);
        if(worker===(serviceWorker.controller||registration?.active)
            &&offlinePackage?.type===MESSAGE&&/^[a-f0-9]{16}$/.test(offlinePackage.revision)){
          current=offlinePackage.revision;
        }
      }catch{/* An unavailable worker cannot prove compatibility. */}
    }
    if(reloadRequired||reloaded){setUpdateState('changed');return false;}
    if(!current){setUpdateState('failed');return false;}
    if(current!==expectedRevision){reloadRequired=true;showAvailable(current);setUpdateState('changed');recoverStartupVersion();return false;}
    if(offlinePackage&&!preparedCore(offlinePackage)){
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
    if(starting)return;starting=true;
    try{
      registration=await serviceWorker.getRegistration();
      if(v2Bootstrap){
        try{
          const marker=sessionStorage.getItem(automaticKey(expectedRevision)),pending=pendingAutomaticAttempt();
          if(marker!==null||pending){
            if(marker==='attempted'||pending)startupText('Updating to the new version…','updating');
            watchAutomaticStartup();
          }
        }catch{/* A blocked store never grants permission to auto-activate. */}
      }
      if(!registration&&serviceWorker.controller)registration=await serviceWorker.ready;
      if(updater&&navigator.onLine&&(registration?.updateViaCache!=='none'||!registration?.active&&!registration?.installing&&!registration?.waiting)){registration=await serviceWorker.register(swUrl,{updateViaCache:'none'});autoChecked=true;}
      else if(!registration)registration=await serviceWorker.register(swUrl,{updateViaCache:'none'});
      observe(registration);
      if(updater&&registration.active&&navigator.onLine&&!autoChecked){autoChecked=true;checkForUpdate({quiet:true}).catch(()=>{});}
    }catch(error){
      try{registration=await serviceWorker.getRegistration();if(registration&&(registration.active||registration.waiting||registration.installing)){observe(registration);return;}}catch{}
      registrationUnavailable=true;registrationForbidden=['SecurityError','NotAllowedError','NotSupportedError'].includes(error?.name);coreRepairPending=!bootstrapReleased;
      // With no worker there is no background preparation to retry. Keep an
      // online-only browser quiet instead of promising an unavailable feature.
      pendingIndicator=null;clearTimeout(readyTimer);clearTimeout(offlineRetryTimer);offlineRetryTimer=0;hide();setUpdateState('failed');
      if(!serviceWorker.controller&&navigator.onLine){if(v2Bootstrap)updater.dataset.unavailable='true';releaseBootstrap();}
      else if(!bootstrapReleased)reportBootstrapFailure('The site could not finish opening. Reconnect, then select Try again.',true);
    }finally{starting=false;}
  }
  function retryUnavailableRegistration(){
    if(!registrationUnavailable||registrationForbidden||bootstrapReleased||starting||!navigator.onLine)return false;
    registrationUnavailable=false;bootstrapFailed=false;coreRepairPending=true;lastOfflineRetry=Date.now();
    if(updater)delete updater.dataset.unavailable;
    startupText('Preparing offline access…','opening');setUpdateState('checking');start();return true;
  }
  updateAction?.addEventListener('click',()=>{
    if(registrationUnavailable&&!bootstrapReleased){if(!retryUnavailableRegistration())reportBootstrapFailure('Reconnect, then select Try again to open the site.',true);return;}
    if(updater.dataset.state==='startup_failed'){bootstrapFailed=false;startupText('Updating to the new version…','updating');setUpdateState('startup_updating');confirmChanged();}
    else if(updater.dataset.state==='changed')confirmChanged();else if(updater.dataset.state==='ready')installUpdate();else checkForUpdate().catch(()=>{});
  });
  serviceWorker.addEventListener('message',event=>{if(event.data?.type==='WH_PWA_DATA_CHANGED'){
    const active=serviceWorker.controller||registration?.active;if(event.source&&active&&event.source!==active)return;
    reloadRequired=true;setUpdateState('changed');recoverStartupVersion();return;
  }apply(event.data,event.source);});
  serviceWorker.addEventListener('controllerchange',()=>{controlledWorker=serviceWorker.controller;syncInstalled();});
  root.addEventListener?.('offline',()=>{clearTimeout(offlineRetryTimer);offlineRetryTimer=0;});
  root.addEventListener?.('online',()=>{
    clearTimeout(offlineRetryTimer);offlineRetryTimer=0;offlineRetryCount=0;
    if(retryUnavailableRegistration())return;
    const worker=serviceWorker.controller||registration?.active;
    if(worker)prepareOffline(worker,{retry:true});
    if(reloadRequired)recoverStartupVersion();
  });
  root.addEventListener?.('focus',()=>{
    if(registrationUnavailable&&Date.now()-lastOfflineRetry>=30000&&retryUnavailableRegistration())return;
    const worker=serviceWorker.controller||registration?.active,payload=worker&&workerStatuses.get(worker);
    if(navigator.onLine&&payload?.status==='error'&&Date.now()-lastOfflineRetry>=30000)prepareOffline(worker,{retry:true});
  });
  if(v2Bootstrap||document.readyState==='complete')start();else addEventListener('load',start,{once:true});
  root.WHOfflineStatus=Object.freeze({ready,completeBootstrap,reportBootstrapFailure,checkRunningVersion,reportLoadFailure:()=>setUpdateState('failed'),query:()=>serviceWorker.getRegistration().then(value=>value&&query(value.installing||value.waiting||value.active)),check:()=>checkForUpdate()});
})(window);

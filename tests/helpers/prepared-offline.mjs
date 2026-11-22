/** An offline test precondition, separate from application interactivity. */
export async function waitForPreparedOffline(page, {waiting = false, timeout = 30000} = {}) {
  await page.evaluate(async ({waiting, timeout}) => {
    const registration = await navigator.serviceWorker.getRegistration();
    const worker = waiting ? registration?.waiting : registration?.active;
    if (!worker) throw new Error('Offline precondition: no selected service worker');
    const ask = message => new Promise((resolve, reject) => {
      const channel = new MessageChannel();
      const timer = setTimeout(() => { channel.port1.close(); reject(new Error('Offline status reply timed out')); }, 3000);
      channel.port1.onmessage = event => { clearTimeout(timer); channel.port1.close(); resolve(event.data); };
      worker.postMessage(message, [channel.port2]);
    });
    const version = await ask({type: 'GET_VERSION'});
    const initial = await ask({type: 'WH_OFFLINE_PACKAGE_STATUS_QUERY'});
    if (initial.revision === version.revision && initial.status === 'ready' && initial.completed === initial.total && initial.total > 0) return;
    await ask({type: 'WH_PWA_PREPARE_OFFLINE', revision: version.revision, afterStartup: false});
    const deadline = Date.now() + timeout;
    while (Date.now() < deadline) {
      const status = await ask({type: 'WH_OFFLINE_PACKAGE_STATUS_QUERY'});
      if (status.revision === version.revision && status.status === 'ready' && status.completed === status.total && status.total > 0) return;
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    throw new Error('Offline precondition: complete verified package not ready for ' + version.revision);
  }, {waiting, timeout});
}

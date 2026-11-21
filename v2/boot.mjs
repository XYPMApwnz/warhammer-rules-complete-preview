import {createBookRegistry} from '../books/shared/application-v2/registry.mjs';
import {createApplication} from '../books/shared/application-v2/runtime.mjs';
import {armyBooks} from './army-books.mjs';

export const registry=createBookRegistry(armyBooks);
const application=createApplication(document,{registry,entryURL:new URL('./app.html',import.meta.url).href});
await application.ready;
if(document.querySelector('[data-v2-mount-root]')?.childElementCount){
  window.WHOfflineStatus?.completeBootstrap?.();
  delete document.body.dataset.pwaBootstrapState;
  document.querySelector('[data-v2-loading]')?.remove();
}else window.WHOfflineStatus?.reportBootstrapFailure?.();

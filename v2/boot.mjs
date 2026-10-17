import {createBookRegistry} from '../books/shared/application-v2/registry.mjs';
import {createApplication} from '../books/shared/application-v2/runtime.mjs';
import {armyBooks} from './army-books.mjs';

export const registry=createBookRegistry(armyBooks);
document.querySelector('[data-v2-loading]')?.remove();
createApplication(document,{registry,entryURL:new URL('./app.html',import.meta.url).href});

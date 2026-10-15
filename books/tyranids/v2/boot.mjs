/** Isolated host of the existing application, with one book-owned registration. */
import {createBookRegistry} from '../../shared/application-v2/registry.mjs';
import {createApplication} from '../../shared/application-v2/runtime.mjs';
import {registration} from './registration.mjs';

createApplication(document,{registry:createBookRegistry([registration]),entryURL:new URL('./app.html',import.meta.url).href});

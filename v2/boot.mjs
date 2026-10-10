import {createBookRegistry} from '../books/shared/application-v2/registry.mjs';
import {createApplication} from '../books/shared/application-v2/runtime.mjs';
import {registration as deathGuard} from '../books/death-guard/v2/registration.mjs';
import {registration as adeptusMechanicus} from '../books/adeptus-mechanicus/v2/registration.mjs';
import {registration as chaosSpaceMarines} from '../books/chaos-space-marines/v2/registration.mjs';

export const registry=createBookRegistry([deathGuard,adeptusMechanicus,chaosSpaceMarines]);
document.querySelector('[data-v2-loading]')?.remove();
createApplication(document,{registry,entryURL:new URL('./app.html',import.meta.url).href});

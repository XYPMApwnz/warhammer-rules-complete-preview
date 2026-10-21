/** Registered Unified V2 books shared by the browser shell and readiness gate. */
import {registration as deathGuard} from '../books/death-guard/v2/registration.mjs';
import {registration as adeptusMechanicus} from '../books/adeptus-mechanicus/v2/registration.mjs';
import {registration as chaosSpaceMarines} from '../books/chaos-space-marines/v2/registration.mjs';
import {registration as emperorsChildren} from '../books/emperors-children/v2/registration.mjs';
import {registration as tyranids} from '../books/tyranids/v2/registration.mjs';
import {registration as tauEmpire} from '../books/tau-empire/v2/registration.mjs';
import {registration as spaceMarines} from '../books/space-marines/v2/registration.mjs';
import {registration as darkAngels} from '../books/dark-angels/v2/registration.mjs';

export const armyBooks=Object.freeze([deathGuard,adeptusMechanicus,chaosSpaceMarines,emperorsChildren,tyranids,tauEmpire,spaceMarines,darkAngels]);

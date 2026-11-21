import {loadImportHeaderContext} from '../../shared/roster-v2/import.mjs';
/** Existing browser-native roster-service entry for the standard V2 application. */
export {createBloodAngelsRosterService} from './roster-import.mjs';
import {createBloodAngelsRosterService} from './roster-import.mjs';
export async function createBrowserRoster({fetch:read=globalThis.fetch,presentation}={}){
 const response=await read(new URL('./generated/roster-import.json',import.meta.url));
 if(!response.ok)throw new Error('Blood Angels native roster input unavailable');
 return createBloodAngelsRosterService(await loadImportHeaderContext(await response.json(),import.meta.url,read,presentation));
}

/** Existing browser-native roster-service entry for the standard V2 application. */
export {createBloodAngelsRosterService} from './roster-import.mjs';
import {createBloodAngelsRosterService} from './roster-import.mjs';
export async function createBrowserRoster({fetch:read=globalThis.fetch}={}){
 const response=await read(new URL('./generated/roster-import.json',import.meta.url));
 if(!response.ok)throw new Error('Blood Angels native roster input unavailable');
 return createBloodAngelsRosterService(await response.json());
}

/** Existing browser-native roster-service entry, without app registration. */
export {createDarkAngelsRosterService} from './roster-import.mjs';
import {createDarkAngelsRosterService} from './roster-import.mjs';
export async function createBrowserRoster({fetch:read=globalThis.fetch}={}){
 const response=await read(new URL('./generated/roster-import.json',import.meta.url));
 if(!response.ok)throw new Error('Dark Angels native roster input unavailable');
 return createDarkAngelsRosterService(await response.json());
}

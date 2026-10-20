/** Existing isolated Army Book roster-service entry point. Registration and
 * navigation remain deferred; no production Home route is added here. */
export {createSpaceMarinesRosterService} from './roster-import.mjs';
import {createSpaceMarinesRosterService} from './roster-import.mjs';
export async function createBrowserRoster({fetch:read=globalThis.fetch}={}){
  const response=await read(new URL('./generated/roster-import.json',import.meta.url));
  if(!response.ok)throw new Error('Space Marines native roster input unavailable');
  return createSpaceMarinesRosterService(await response.json());
}

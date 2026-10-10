import {createRosterImportService} from '../../shared/roster-v2/import-service.mjs';
import {buildImportBindings} from './roster-import-bindings.mjs';

/** Import foundation only. Attachment/effect/guide services are not connected. */
export function createCSMRosterImport(book) {
  return createRosterImportService(book,buildImportBindings(book));
}

/** Browser/Node consumer entry, using the same import-only service as other books. */
export async function loadRosterImport({fetch:read=globalThis.fetch}={}) {
  const response=await read(new URL('./generated/roster-import.json',import.meta.url));
  if(!response.ok)throw new TypeError('Unable to load current canonical CSM import input');
  return createCSMRosterImport(await response.json());
}

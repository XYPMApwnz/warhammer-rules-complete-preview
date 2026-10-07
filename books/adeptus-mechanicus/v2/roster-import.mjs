import {createRosterImportService} from '../../shared/roster-v2/import-service.mjs';

/** Book-owned metadata only; parsing/resolution/state validation are shared. */
export function createAdMechRosterImport(book,metadata) {
  if (metadata?.schema!=='roster-v2/import-aliases') throw new TypeError('Invalid import metadata');
  return createRosterImportService(book,{identityAliases:metadata.aliases,weaponSelections:metadata.weaponSelections});
}

/** Browser/Node entrypoint for import consumers. Intentionally not connected to
 * the attachment/effective-guide UI until that product stage is implemented. */
export async function loadRosterImport({fetch:read=globalThis.fetch}={}) {
  const readJson=async path=>{
    const response=await read(new URL(path,import.meta.url));
    if (!response.ok) throw new TypeError('Unable to load canonical roster import input');
    return response.json();
  };
  const [book,metadata]=await Promise.all([readJson('./generated/effective.json'),readJson('./roster-import-aliases.json')]);
  return createAdMechRosterImport(book,metadata);
}

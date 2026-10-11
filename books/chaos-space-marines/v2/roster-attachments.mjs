import {createRosterAttachmentService} from '../../shared/roster-v2/attachment-service.mjs';
import {createCSMRosterImport} from './roster-import.mjs';
import {buildCSMAttachmentInputs} from './roster-attachment-build.mjs';

/** Import + attachment structure only: no effects, effective datasheet or guide. */
export function createCSMRosterAttachments(book,bindings) {
  const inputs=buildCSMAttachmentInputs(book,bindings);
  return createRosterAttachmentService(inputs.book,{policies:inputs.policies,importService:createCSMRosterImport(book)});
}

export async function loadRosterAttachments({fetch:read=globalThis.fetch}={}) {
  const responses=await Promise.all(['./generated/roster-import.json','./roster-attachment-bindings.json'].map(path=>read(new URL(path,import.meta.url))));
  if(responses.some(response=>!response.ok))throw new TypeError('Unable to load canonical CSM attachment input');
  const [book,bindings]=await Promise.all(responses.map(response=>response.json()));
  return createCSMRosterAttachments(book,bindings);
}

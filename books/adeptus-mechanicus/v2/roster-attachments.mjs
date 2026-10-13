import {createRosterAttachmentService} from '../../shared/roster-v2/attachment-service.mjs';
import {createAdMechRosterImport,withEquipmentCaptionBindings} from './roster-import.mjs';
import {buildRosterAttachmentInputs} from './roster-attachment-build.mjs';

export function createAdMechRosterAttachments(book,importMetadata,attachmentBindings) {
  const inputs=buildRosterAttachmentInputs(book,attachmentBindings);
  return createRosterAttachmentService(withEquipmentCaptionBindings(inputs.book),{policies:inputs.policies,importService:createAdMechRosterImport(book,importMetadata)});
}

export async function loadRosterAttachments({fetch:read=globalThis.fetch}={}) {
  const json=async path=>{const response=await read(new URL(path,import.meta.url));if(!response.ok)throw new TypeError('Unable to load canonical attachment inputs');return response.json();};
  const [book,importMetadata,bindings]=await Promise.all(['./generated/effective.json','./roster-import-aliases.json','./roster-attachment-bindings.json'].map(json));
  return createAdMechRosterAttachments(book,importMetadata,bindings);
}

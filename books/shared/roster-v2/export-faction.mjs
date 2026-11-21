/** Export vocabulary only. Book declarations own names and legacy empty-input
 * policy; this check neither establishes army legality nor assigns a faction. */
import {normalizeImportLabel} from './import.mjs';

export function createExportFactionCheck({factionIdentityLabels,allowNormalizedEmptyFaction=false}={}) {
  if(!Array.isArray(factionIdentityLabels)||!factionIdentityLabels.length||
    factionIdentityLabels.some(label=>typeof label!=='string'||!normalizeImportLabel(label))||
    typeof allowNormalizedEmptyFaction!=='boolean')throw new TypeError('Missing or invalid export faction vocabulary');
  const names=new Set(factionIdentityLabels.map(normalizeImportLabel));
  return value=>{
    if(!value||value==='—')return true;
    const key=normalizeImportLabel(value);
    return names.has(key)||allowNormalizedEmptyFaction&&!key;
  };
}

/** The importer supplies the declared header and the book-owned display name.
 * This explains a rejection without changing faction admission or roster state. */
export function exportFactionError(faction,bookName) {
  if(typeof faction!=='string'||typeof bookName!=='string'||!bookName.trim())
    throw new TypeError('Missing export faction rejection context');
  return {code:'FOREIGN_FACTION_EXPORT',key:'faction',
    message:`This list is ${faction}, but ${bookName} is open.`};
}

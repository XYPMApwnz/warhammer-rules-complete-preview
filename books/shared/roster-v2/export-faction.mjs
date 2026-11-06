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

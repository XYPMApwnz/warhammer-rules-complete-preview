import {appendModelNameAliases} from '../../shared/roster-v2/model-name-aliases.mjs';
import modelNames from './model-name-aliases.json' with {type:'json'};
import {createRosterImportService} from '../../shared/roster-v2/import-service.mjs';
import {getRecordedSourceIdentity} from '../../shared/source-refs-v2/source-refs.mjs';

/** Book title and the catalogue name in sources/bsdata-adeptus-mechanicus-11e.json. */
export const factionIdentityLabels=Object.freeze(['Adeptus Mechanicus','Imperium - Adeptus Mechanicus']);

/** Reviewed presentation link, not an equipment identity or effect declaration.
 * The selected ability block and the option spelling retain their own owners. */
export function withEquipmentCaptionBindings(book) {
  const records=new Map(book.entities.map(entity=>[entity.id,entity]));
  const bindings=[
    ['skitarii-rangers','omnispex',2],
    ['skitarii-rangers','enhanced data-tether',1],
    ['skitarii-vanguard','omnispex',2],
    ['skitarii-vanguard','enhanced data-tether',1]
  ].map(([slug,label,index])=>{
    const ownerId='unit-'+slug,id='datasheet-'+slug+':section:1';
    const optionId='datasheet-'+slug+':wargear:6',path=`/blocks/${index}/text`;
    const selected=records.get(id),option=records.get(optionId);
    if(book.bookId!=='adeptus-mechanicus'||records.get(ownerId)?.kind!=='DATASHEET'||
      selected?.kind!=='DATASHEET_SECTION'||selected.parentId!==ownerId||
      selected.data.blocks?.[index]?.wargearAbility!==true||!getRecordedSourceIdentity(selected,{book})||
      !selected.data.blocks[index].text.toLowerCase().startsWith(label+':')||
      option?.kind!=='WARGEAR_OPTION'||option.parentId!==ownerId||!getRecordedSourceIdentity(option,{book}))
      throw new TypeError('Missing canonical '+label+' caption owner');
    const text=option.data.text,start=text?.indexOf(label);
    if(typeof text!=='string'||start<0||text.indexOf(label,start+label.length)!==-1)
      throw new TypeError('Missing or ambiguous canonical '+label+' caption');
    return {ownerId,label,canonicalEquipmentIds:[id],canonicalFieldPaths:{[id]:[path]},
      evidence:[{entityId:id,path},{entityId:optionId,path:'/text'}],
      sourceReferences:[{entityId:optionId,path:'/text',bookId:book.bookId,caption:{start,end:start+label.length}}]};
  });
  return {...book,rosterEquipmentCaptionBindings:bindings};
}

/** Book-owned metadata only; parsing/resolution/state validation are shared. */
export function createAdMechRosterImport(book,metadata) {
  if (metadata?.schema!=='roster-v2/import-aliases') throw new TypeError('Invalid import metadata');
  const input=withEquipmentCaptionBindings(book);
  return createRosterImportService(input,{identityAliases:appendModelNameAliases([...metadata.aliases],modelNames),weaponSelections:metadata.weaponSelections,
    equipmentSelections:input.rosterEquipmentCaptionBindings,factionIdentityLabels,
    factionDisplayName:factionIdentityLabels[0],gateAllFactionHeaders:true,allowNormalizedEmptyFaction:true});
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

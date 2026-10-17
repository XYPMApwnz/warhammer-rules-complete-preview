import {createRosterImportService} from '../../shared/roster-v2/import-service.mjs';

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
      selected.data.blocks?.[index]?.wargearAbility!==true||!selected.provenance?.sourceId||
      !selected.data.blocks[index].text.toLowerCase().startsWith(label+':')||
      option?.kind!=='WARGEAR_OPTION'||option.parentId!==ownerId||!option.provenance?.sourceId)
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
  return createRosterImportService(input,{identityAliases:metadata.aliases,weaponSelections:metadata.weaponSelections,
    equipmentSelections:input.rosterEquipmentCaptionBindings});
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

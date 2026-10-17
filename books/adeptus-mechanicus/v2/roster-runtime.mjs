import {createRosterRuntime} from '../../shared/roster-v2/runtime.mjs';
import {createRuleContractSchema} from '../../shared/rule-contract-v2/schema.mjs';
import {parse} from '../../shared/roster-v2/parser.mjs';
import {createAdMechRosterImport,withEquipmentCaptionBindings} from './roster-import.mjs';
import {selections} from '../../shared/roster-v2/context.mjs';

/** Composition only: the existing import boundary and the existing shared
 * interpreter operate on the same canonical physical UNIT_INSTANCE snapshot. */
export function createAdMechRosterRuntime(book,metadata,{evaluator=createRuleContractSchema(book.rosterSchema)}={}) {
  book=withEquipmentCaptionBindings(book);
  const runtime=createRosterRuntime(book,{parse,...evaluator});
  const importer=createAdMechRosterImport(book,metadata);
  const load=runtime.load;
  runtime.load=snapshot=>{
    const restored=structuredClone(snapshot);
    for(const unit of restored.units)for(const selection of selections(unit)) {
      if(selection.sourceReferences?.some(reference=>reference.caption))continue;
      const binding=book.rosterEquipmentCaptionBindings.find(binding=>
        binding.ownerId===unit.canonicalUnitId&&selection.canonicalProfileIds.length===0&&
        selection.canonicalEquipmentIds.length===1&&selection.canonicalEquipmentIds[0]===binding.canonicalEquipmentIds[0]&&
        JSON.stringify(selection.canonicalFieldPaths)===JSON.stringify(binding.canonicalFieldPaths));
      if(!binding)continue;
      // Older saved rosters keep their exact selected source identity. Restore
      // only its declared display reference, without resolving a MODEL bearer.
      selection.sourceReferences??=[];
      for(const reference of binding.sourceReferences)if(!selection.sourceReferences.some(existing=>
        existing.entityId===reference.entityId&&existing.path===reference.path))
        selection.sourceReferences.push(structuredClone(reference));
    }
    return load(restored);
  };
  runtime.draft=text=>importer.draft(text);
  runtime.import=(text,bindings)=>{
    const result=importer.import(text,bindings);
    if(result.status==='READY')runtime.load(result.roster);
    return result;
  };
  return runtime;
}
export async function createBrowserRoster({fetch:read=globalThis.fetch}={}) {
  const readJson=async path=>{
    const response=await read(new URL(path,import.meta.url));
    if(!response.ok)throw new TypeError('Canonical roster input unavailable');
    return response.json();
  };
  const [book,metadata]=await Promise.all([readJson('./generated/roster-runtime.json'),readJson('./roster-import-aliases.json')]);
  return createAdMechRosterRuntime(book,metadata);
}

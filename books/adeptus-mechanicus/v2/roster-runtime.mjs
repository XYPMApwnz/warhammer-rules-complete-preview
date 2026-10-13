import {createRosterRuntime} from '../../shared/roster-v2/runtime.mjs';
import {createRuleContractSchema} from '../../shared/rule-contract-v2/schema.mjs';
import {parse} from '../../shared/roster-v2/parser.mjs';
import {createAdMechRosterImport,withEquipmentCaptionBindings} from './roster-import.mjs';

/** Composition only: the existing import boundary and the existing shared
 * interpreter operate on the same canonical physical UNIT_INSTANCE snapshot. */
export function createAdMechRosterRuntime(book,metadata,{evaluator=createRuleContractSchema(book.rosterSchema)}={}) {
  book=withEquipmentCaptionBindings(book);
  const runtime=createRosterRuntime(book,{parse,...evaluator});
  const importer=createAdMechRosterImport(book,metadata);
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

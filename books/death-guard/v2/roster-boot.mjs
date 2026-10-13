import {createRosterRuntime} from '../../shared/roster-v2/runtime.mjs';
import {evaluatePredicate,evaluateRole,validatePredicate,publicResult} from './rule-contract-schema.mjs';
import {parse} from '../../shared/roster-v2/parser.mjs';
import {importNewRecruit} from '../../shared/roster-v2/import.mjs';
import {buildImportBindings} from './roster-import-bindings.mjs';

export function createDGRosterRuntime(book) {
  const runtime=createRosterRuntime(book,{parse,evaluatePredicate,evaluateRole,validatePredicate,publicResult});
  const metadata=buildImportBindings(book);
  // Keep the shared runtime and physical state unchanged; only the import
  // boundary supplies book-owned caption references, as for the CSM importer.
  runtime.import=(text,bindings)=>{
    const result=importNewRecruit(text,{parse,bindings,book,...metadata});
    if(result.status==='READY')runtime.load(result.roster);
    return result;
  };
  return runtime;
}

export async function createBrowserRoster() {
  const response=await fetch(new URL('./generated/rule-contract-effective.json',import.meta.url));
  if(!response.ok)throw new Error('Canonical Rule Contract snapshot unavailable');
  return createDGRosterRuntime(await response.json());
}

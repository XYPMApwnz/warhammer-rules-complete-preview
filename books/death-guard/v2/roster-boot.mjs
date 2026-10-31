import {createRosterRuntime,commitRosterImport} from '../../shared/roster-v2/runtime.mjs';
import {createRosterConditionBinding} from '../../shared/roster-v2/condition-binding.mjs';
import {evaluatePredicate,evaluateRole,validatePredicate,publicResult} from './rule-contract-schema.mjs';
import {parse} from '../../shared/roster-v2/parser.mjs';
import {importNewRecruit} from '../../shared/roster-v2/import.mjs';
import {buildImportBindings} from './roster-import-bindings.mjs';
import {validateRoster} from '../../shared/roster-v2/context.mjs';
import {inspectInstrumentSelections} from './instrument-selections.mjs';

export function createDGRosterRuntime(book) {
  const runtime=createRosterRuntime(book,{parse,...createRosterConditionBinding({book,
    schema:{evaluatePredicate,evaluateRole,validatePredicate,publicResult}})});
  const metadata=buildImportBindings(book);
  const load=runtime.load;
  runtime.load=snapshot=>{
    const verified=validateRoster(book,snapshot,book.rosterAttachmentPolicies),issues=inspectInstrumentSelections(book,verified);
    if(issues.length)throw new TypeError(issues[0].message);
    return load(verified);
  };
  // The book input boundary supplies canonical caption references and checks
  // source equipment restrictions before the shared runtime executes effects.
  runtime.import=(text,bindings,options)=>{
    const result=importNewRecruit(text,{parse,bindings,book,...metadata});
    if(result.status==='READY') {
      const issues=inspectInstrumentSelections(book,result.roster);
      if(issues.length)return {...result,status:issues.some(issue=>!issue.unresolved)?'INVALID':'NEEDS_BINDINGS',
        candidateRoster:result.roster,roster:null,needsBindings:issues.filter(issue=>issue.unresolved),errors:issues.filter(issue=>!issue.unresolved)};
    }
    return commitRosterImport(result,runtime.state,runtime.load,options);
  };
  return runtime;
}

export async function createBrowserRoster() {
  const response=await fetch(new URL('./generated/rule-contract-effective.json',import.meta.url));
  if(!response.ok)throw new Error('Canonical Rule Contract snapshot unavailable');
  return createDGRosterRuntime(await response.json());
}

import {projectEffectiveInstance} from './effective-instance.mjs';
import {lexicalDraft,importNewRecruit} from './import.mjs';
import {validateRoster,changeAttachment,attachmentCheck,predicateContext,withRosterDetachments} from './context.mjs';
import {executeRosterEffects,validateRosterEffects} from './effects.mjs';
import {validateCompatibilityFeasibility} from './compatibility-feasibility.mjs';
import {projectRosterRelated} from './related.mjs';
import {registerBookSources,cloneSourceBook} from '../source-refs-v2/source-refs.mjs';
import {createRosterConditionBinding} from './condition-binding.mjs';
const clone = value=>structuredClone(value);
const ordered=value=>Array.isArray(value)?value.map(ordered):value&&typeof value==='object'
  ?Object.fromEntries(Object.keys(value).sort().map(key=>[key,ordered(value[key])])):value;
/** Import-only candidates stay attachment-free. A runtime import may retain
 * only the CURRENT graph in the same namespace and complete physical state.
 * The owner's ordinary atomic load revalidates the whole graph and effects.
 * Explicit snapshot load/detach are never interpreted as reimport. */
export function commitRosterImport(result,previous,load,{replaceExisting=false}={}) {
  if(typeof replaceExisting!=='boolean')throw new TypeError('Invalid roster replacement confirmation');
  if(result.status!=='READY')return result;
  const candidate=clone(result.roster);
  if(!Array.isArray(candidate?.attachments)||candidate.attachments.length)
    throw new TypeError('A fresh imported candidate cannot contain attachments');
  if(previous){
    const physical=state=>{const copy=clone(state);delete copy.attachments;return JSON.stringify(ordered(copy));};
    const identical=candidate.bookId===previous.bookId&&candidate.rosterId===previous.rosterId&&physical(candidate)===physical(previous);
    if(identical)candidate.attachments=clone(previous.attachments);
    else if(!replaceExisting)return {...result,status:'REPLACEMENT_REQUIRED',roster:null};
  }
  return {...result,roster:load(candidate)};
}

const rosterServices=new WeakSet();
const terminalImport=Symbol('native import rejection');
/** Observable contract membership without adding fields to snapshots or views. */
export const isSharedRosterService=service=>rosterServices.has(service);
/** Preserve native early rejection, including its existing error boundary. */
export function rejectRosterImport(result){
  if(result?.status==='READY')throw new TypeError('READY imports require the canonical commit');
  return {[terminalImport]:result};
}

/** The UI's explicit bearer choices address native MODEL bindings. */
export function rosterImportBindings(choices) {
  const bindings=clone(choices);bindings.modelBearers??={};
  for(const [key,value]of Object.entries(bindings.enhancementBearers||{})){
    const [unit,id]=JSON.parse(key);(bindings.modelBearers[unit]??={})[id]=value;
  }
  delete bindings.enhancementBearers;
  return bindings;
}

/** Retry only the existing physical-input identity proof supplied by the owner. */
export function retainRosterBearerBindings(result,previous,bindings,physicalInput) {
  if(result.status!=='NEEDS_BINDINGS'||!result.candidateRoster||!previous||
    !result.needsBindings.every(need=>need.kind==='ENHANCEMENT_BEARER')||
    physicalInput(result.candidateRoster)!==physicalInput(previous))return false;
  for(const unit of previous.units)if(unit.enhancementAssignments?.length)
    bindings.modelBearers[unit.instanceId]=Object.fromEntries(unit.enhancementAssignments.map(row=>[row.enhancementId,row.modelScopeId]));
  return true;
}

/** Service lifecycle only. Native owners still admit snapshots, prepare source
 * contexts and execute with their existing runtime. A prepared runtime is
 * published only after its owner has completed all validation and calculation.
 * Import proofs are scoped to this call; retained graphs use ordinary load. */
export function createRosterService({runtime,draft=runtime.draft,importCandidate,
  prepareRuntime,loadSnapshot,prepareImport,decorateImport=result=>result,importError,view}) {
  let current=runtime;
  const service={
    get catalog(){return current.catalog;},
    get state(){return current.state;},
    get projection(){return current.projection;},
    get groups(){return 'groups' in current?current.groups:current.projection?.formedUnits||[];},
    draft,
    import(text,choices,options){
      const commit=()=>{
        const result=importCandidate(text,choices,current);
        if(result&&terminalImport in result)return result[terminalImport];
        const prepared=prepareImport?.(result);
        const load=candidate=>{
          const next=prepared?.(candidate);
          if(next){current=next;return service.state;}
          return service.load(candidate);
        };
        return decorateImport(commitRosterImport(result,current.state,load,options),service);
      };
      if(!importError)return commit();
      try{return commit();}catch(error){return importError(error);}
    },
    load(snapshot){
      if(prepareRuntime){const next=prepareRuntime(snapshot);current=next;return service.state;}
      return loadSnapshot?loadSnapshot(snapshot):current.load(snapshot);
    },
    snapshot:()=>current.snapshot(),
    candidates:(...args)=>current.candidates(...args),
    attach:(...args)=>current.attach(...args),
    detach:(...args)=>current.detach(...args),
    reattach:(...args)=>current.reattach(...args),
    context:(...args)=>current.context(...args),
    effective:(...args)=>current.effective(...args),
    related:(...args)=>current.related(...args)
  };
  if(view){
    const descriptors=Object.getOwnPropertyDescriptors(view(()=>current,service));
    if(['state','projection','draft','import','load','snapshot'].some(key=>key in descriptors))
      throw new TypeError('Owner view cannot replace the shared service lifecycle');
    Object.defineProperties(service,descriptors);
  }
  rosterServices.add(service);
  return service;
}
const atoms = (value,path=[]) => value && typeof value==='object' ? Object.entries(value).flatMap(([key,child])=>atoms(child,[...path,key])) : [{path:'/'+path.map(p=>String(p).replaceAll('~','~0').replaceAll('/','~1')).join('/'),label:path.join(' / '),value}];
/** Browser/Node runtime consumes the same canonical snapshot and existing evaluator. */
export function createRosterRuntime(book,{parse,evaluatePredicate,evaluateRole,validatePredicate,publicResult,resolveWeaponSelection,resolveWeaponPartitions,conditionInputs}) {
  if(resolveWeaponSelection!==undefined && typeof resolveWeaponSelection!=='function')throw new TypeError('Invalid physical weapon selection resolver');
  if(resolveWeaponPartitions!==undefined && typeof resolveWeaponPartitions!=='function')throw new TypeError('Invalid projection weapon partition resolver');
  if(conditionInputs!==undefined&&!Array.isArray(conditionInputs))throw new TypeError('Invalid runtime condition inputs');
  const kernel={evaluatePredicate,evaluateRole},inputs=conditionInputs===undefined?undefined:clone(conditionInputs);
  ({evaluatePredicate,evaluateRole}=withRosterDetachments(kernel));
  book=cloneSourceBook(book);
  registerBookSources(book);
  validateRosterEffects(book,validatePredicate,evaluatePredicate);
  const records = new Map(book.entities.map(e=>[e.id,e])), policies = book.rosterAttachmentPolicies;
  validateCompatibilityFeasibility(book);
  if (records.size !== book.entities.length) throw new TypeError('Ambiguous canonical identity');
  if (!Array.isArray(policies)) throw new TypeError('Missing typed attachment policy');
  for (const policy of policies) if (records.get(policy.sourceId)?.kind!=='DATASHEET' || records.get(policy.targetId)?.kind!=='DATASHEET' || !['LEADER','SUPPORT','SUPPORT_EXCEPTION'].includes(policy.role) || ![0,1].includes(policy.additionalLeaders) || !policy.sourceIds?.length) throw new TypeError('Invalid canonical attachment policy');
  let state = null, projection = null;
  const service = {
    catalog:book.entities.map(e=>({id:e.id,kind:e.kind,parentId:e.parentId,title:e.data.title || e.data.name || e.id,
      ...(e.kind==='PROFILE'?{fields:atoms(e.data)}:{}),...(['WARGEAR_OPTION','WARGEAR_FOOTNOTE','DATASHEET_SECTION','SUPPLEMENTAL_DATASHEET_RULE'].includes(e.kind)?{fields:atoms(e.data)}:{})})),
    get state(){ return state ? clone(state) : null; },
    get projection(){ return projection ? clone(projection) : null; },
    draft:text=>lexicalDraft(text,parse),
    import(text,bindings,options) {
      const result=importNewRecruit(text,{parse,bindings,book});
      return commitRosterImport(result,state,service.load,options);
    },
    load(snapshot) {
      const verified=validateRoster(book,snapshot,policies);
      const next=inputs===undefined?{evaluatePredicate,evaluateRole}:withRosterDetachments(createRosterConditionBinding({book,state:verified,schema:kernel,inputs}));
      const derived=executeRosterEffects(book,verified,{evaluatePredicate:next.evaluatePredicate,resolveWeaponSelection,resolveWeaponPartitions});
      // Publish the physical state, context computers and projection together.
      // A failed computer/interpreter leaves the previous generation intact.
      state=verified;projection=derived;({evaluatePredicate,evaluateRole}=next);return service.state;
    },
    snapshot(){ if (!state) throw new TypeError('No roster');return clone(state); },
    attach(leaderId,bodyguardId){ return service.load(changeAttachment(book,state,policies,'ATTACH',leaderId,bodyguardId)); },
    detach(leaderId){ return service.load(changeAttachment(book,state,policies,'DETACH',leaderId)); },
    reattach(leaderId,bodyguardId){ return service.load(changeAttachment(book,state,policies,'REATTACH',leaderId,bodyguardId)); },
    candidates(leaderId){ return state.units.filter(u=>attachmentCheck(book,state,policies,leaderId,u.instanceId).valid).map(u=>({instanceId:u.instanceId,canonicalUnitId:u.canonicalUnitId,title:records.get(u.canonicalUnitId).data.title})); },
    context(instanceId,subject='UNIT',modelId,extra){ return predicateContext(state,projection,instanceId,subject,modelId,extra); },
    effective(instanceId) { return projectEffectiveInstance(book,projection,instanceId,{state,evaluatePredicate}); },
    related(instanceId,detachmentId=null) {
      return projectRosterRelated({book,state,projection,context:service.context,evaluateRole,publicResult},instanceId,detachmentId);
    }
  };
  return service;
}

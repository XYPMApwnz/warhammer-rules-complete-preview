import {createTyranidsRosterImport} from './roster-import.mjs';
import {createRosterRuntime,createRosterService,rosterImportBindings,rejectRosterImport} from '../../shared/roster-v2/runtime.mjs';
import {formRoster} from '../../shared/roster-v2/context.mjs';
import {createTyranidsRuleSchema,tyranidsSourceChoiceInputs,preserveTyranidsSourceChoices,
  setTyranidsSourceChoice,surpriseRuleId,trygonCharacterOptionId} from './roster-source-choices.mjs';

/** Browser adapter for the existing Tyranids import and shared effect owners.
 * The generated input is the same contract-bearing book used by focused QA. */
export function createTyranidsBrowserRoster(book) {
  if(book.bookId!=='tyranids')throw new TypeError('Foreign Tyranids roster input');
  let schema=createTyranidsRuleSchema();
  // Source registration, effect validation and the catalog depend on the book,
  // not on a newly loaded roster. Keep their runtime; delegate only the current
  // physical condition inputs through the source-owned schema.
  const runtime=createRosterRuntime(book,{...schema,
    evaluatePredicate:(...args)=>schema.evaluatePredicate(...args),
    evaluateRole:(...args)=>schema.evaluateRole(...args)});
  const importer=createTyranidsRosterImport(book);
  const records=new Map(book.entities.map(entity=>[entity.id,entity]));
  const service=createRosterService({
    runtime,draft:importer.draft,
    importCandidate(text,choices={}) {
      const bindings=rosterImportBindings(choices);
      const result=importer.import(text,bindings);
      if(result.status==='READY'){
        return {...result,roster:preserveTyranidsSourceChoices(book,result.roster,runtime.state)};
      }
      if(!result.candidateRoster)return rejectRosterImport(result);
      const physical=formRoster(book,result.candidateRoster);
      return rejectRosterImport({...result,needsBindings:result.needsBindings.map(need=>{
        if(need.kind!=='ENHANCEMENT_MODEL_OWNER')return need;
        const unit=physical.units.find(unit=>unit.instanceId===need.key);
        return {...need,kind:'ENHANCEMENT_BEARER',key:JSON.stringify([need.key,need.rawLabel]),
          rawLabel:records.get(need.rawLabel)?.data.title||need.rawLabel,candidates:need.candidateIds.map(id=>{
            const profile=unit.profiles.find(profile=>profile.scopeId===id);
            return {id,title:records.get(profile?.canonicalProfileId)?.data.name||id};})};
      })});
    },
    loadSnapshot(snapshot){
      // Revalidate source-owned import bindings independently of the player's
      // attachment context, then let the existing runtime validate formations.
      const imported=structuredClone(snapshot),attachments=imported.attachments;
      imported.attachments=[];
      const verified=importer.load(imported);verified.attachments=attachments;
      const nextSchema=createTyranidsRuleSchema({book,state:verified,inputs:tyranidsSourceChoiceInputs(book,verified)});
      const previousSchema=schema;schema=nextSchema;
      // The shared runtime publishes state/projection only after validation and
      // execution succeed. Restore its matching condition context on failure.
      try{return runtime.load(verified);}catch(error){schema=previousSchema;throw error;}
    },
    view:()=>({
    context:(...args)=>schema.bindContext(runtime.context(...args)),
    sourceChoices(instanceId){
      const unit=runtime.state?.units.find(u=>u.instanceId===instanceId);
      if(unit?.canonicalUnitId!=='unit-trygon'||!runtime.state.detachmentIds.includes(records.get(surpriseRuleId).parentId))return [];
      return [{id:surpriseRuleId,title:records.get(surpriseRuleId).data.title,
        options:[{id:trygonCharacterOptionId,title:'CHARACTER — selected during Muster Armies'}],
        value:unit.selectedSourceChoiceIds?.[0]||null}];
    },
    setSourceChoice(instanceId,ruleId,optionId){
      return service.load(setTyranidsSourceChoice(book,runtime.snapshot(),instanceId,ruleId,optionId));
    },
    modelScopes(instanceId){
      const unit=runtime.projection?.units.find(unit=>unit.instanceId===instanceId);
      if(!unit)throw new TypeError('Unresolved physical instance');
      return unit.profiles.map(profile=>({scopeId:profile.scopeId,canonicalProfileId:profile.canonicalProfileId,quantity:profile.quantity}));
    },
    related(instanceId,detachmentId=null){
      const rows=runtime.related(instanceId,detachmentId),state=runtime.state;
      const known=new Set(rows.map(row=>row.ruleId));
      // Unlowered rules remain source-owned conditional reading material.
      // No battle predicate or permanent effect is inferred from their prose.
      for(const rule of book.entities.filter(entity=>['ENHANCEMENT','STRATAGEM'].includes(entity.kind)&&
        state.detachmentIds.includes(entity.parentId)&&(!detachmentId||entity.parentId===detachmentId)&&!known.has(entity.id)))
        rows.push({unitId:state.units.find(unit=>unit.instanceId===instanceId).canonicalUnitId,instanceId,
          ruleId:rule.id,detachmentId:rule.parentId,kind:rule.kind,state:'UNKNOWN',applicability:'CONDITIONAL'});
      return rows;
    }
    })
  });
  return service;
}

export async function createBrowserRoster({fetch:read=globalThis.fetch}={}) {
  const response=await read(new URL('./generated/roster-runtime.json',import.meta.url));
  if(!response.ok)throw new Error('Tyranids V2 roster input unavailable');
  return createTyranidsBrowserRoster(await response.json());
}

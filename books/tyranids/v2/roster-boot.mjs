import {createTyranidsRosterImport} from './roster-import.mjs';
import {createRosterRuntime} from '../../shared/roster-v2/runtime.mjs';
import {formRoster} from '../../shared/roster-v2/context.mjs';
import {createTyranidsRuleSchema,tyranidsSourceChoiceContext,preserveTyranidsSourceChoices,
  setTyranidsSourceChoice,surpriseRuleId,trygonCharacterOptionId} from './roster-source-choices.mjs';

/** Browser adapter for the existing Tyranids import and shared effect owners.
 * The generated input is the same contract-bearing book used by focused QA. */
export function createTyranidsBrowserRoster(book) {
  if(book.bookId!=='tyranids')throw new TypeError('Foreign Tyranids roster input');
  let choiceContext=context=>context;
  const schema=createTyranidsRuleSchema({bindContext:context=>choiceContext(context)});
  const runtime=createRosterRuntime(book,schema),importer=createTyranidsRosterImport(book);
  const records=new Map(book.entities.map(entity=>[entity.id,entity]));
  const service={
    catalog:runtime.catalog,
    get state(){return runtime.state;},get projection(){return runtime.projection;},
    get groups(){return runtime.projection?.formedUnits||[];},
    draft:importer.draft,
    import(text,choices={}) {
      const bindings=structuredClone(choices);bindings.modelBearers??={};
      for(const [key,value]of Object.entries(bindings.enhancementBearers||{})) {
        const [unitId,enhancementId]=JSON.parse(key);
        (bindings.modelBearers[unitId]??={})[enhancementId]=value;
      }
      delete bindings.enhancementBearers;
      const result=importer.import(text,bindings);
      if(result.status==='READY'){
        service.load(preserveTyranidsSourceChoices(book,result.roster,runtime.state));
        return {...result,roster:runtime.state};
      }
      if(!result.candidateRoster)return result;
      const physical=formRoster(book,result.candidateRoster);
      return {...result,needsBindings:result.needsBindings.map(need=>{
        if(need.kind!=='ENHANCEMENT_MODEL_OWNER')return need;
        const unit=physical.units.find(unit=>unit.instanceId===need.key);
        return {...need,kind:'ENHANCEMENT_BEARER',key:JSON.stringify([need.key,need.rawLabel]),
          rawLabel:records.get(need.rawLabel)?.data.title||need.rawLabel,candidates:need.candidateIds.map(id=>{
            const profile=unit.profiles.find(profile=>profile.scopeId===id);
            return {id,title:records.get(profile?.canonicalProfileId)?.data.name||id};})};
      })};
    },
    load(snapshot){
      // Revalidate source-owned import bindings independently of the player's
      // attachment context, then let the existing runtime validate formations.
      const imported=structuredClone(snapshot),attachments=imported.attachments;
      imported.attachments=[];
      const verified=importer.load(imported);verified.attachments=attachments;
      const previousContext=choiceContext;
      choiceContext=tyranidsSourceChoiceContext(book,verified);
      try{return runtime.load(verified);}catch(error){choiceContext=previousContext;throw error;}
    },
    snapshot:runtime.snapshot,context:(...args)=>choiceContext(runtime.context(...args)),
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
    attach:runtime.attach,detach:runtime.detach,reattach:runtime.reattach,candidates:runtime.candidates,
    effective:runtime.effective,
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
  };
  return service;
}

export async function createBrowserRoster({fetch:read=globalThis.fetch}={}) {
  const response=await read(new URL('./generated/roster-runtime.json',import.meta.url));
  if(!response.ok)throw new Error('Tyranids V2 roster input unavailable');
  return createTyranidsBrowserRoster(await response.json());
}

import {createTyranidsRosterImport} from './roster-import.mjs';
import {createRosterRuntime} from '../../shared/roster-v2/runtime.mjs';
import {createRuleContractSchema} from '../../shared/rule-contract-v2/schema.mjs';
import {formRoster} from '../../shared/roster-v2/context.mjs';

/** Browser adapter for the existing Tyranids import and shared effect owners.
 * The generated input is the same contract-bearing book used by focused QA. */
export function createTyranidsBrowserRoster(book) {
  if(book.bookId!=='tyranids')throw new TypeError('Foreign Tyranids roster input');
  const schema=createRuleContractSchema({stateFields:{attached:{contextLevel:'ROSTER',valueType:'boolean'},
    battleConditionSatisfied:{contextLevel:'BATTLE',valueType:'boolean'}}});
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
      if(result.status==='READY'){runtime.load(result.roster);return {...result,roster:runtime.state};}
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
      return runtime.load(verified);
    },
    snapshot:runtime.snapshot,context:runtime.context,
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

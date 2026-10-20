import {createECRosterAttachments} from './roster-attachments.mjs';
import {createECRuleSchema,bladeId} from './rule-contract-schema.mjs';
import {createFormationContext} from './rule-contract-formation-context.mjs';
import {projectRosterRelated} from '../../shared/roster-v2/related.mjs';
import {formRoster} from '../../shared/roster-v2/context.mjs';
const clone=structuredClone;
const weaponKey=id=>'ec-weapon-choice/'+id;

/** Adapt existing canonical import binding choices to the common UI controls.
 * This is clarification of an export, never an army/equipment builder. */
export function createECBrowserRoster(book) {
  const schema=createECRuleSchema(),runtime=createECRosterAttachments(book,schema),records=new Map(book.entities.map(e=>[e.id,e]));
  const catalog=book.entities.map(e=>({id:e.id,kind:e.kind,parentId:e.parentId,
    title:e.kind==='UPGRADE_OPTION'?records.get(e.data.weaponProfileId)?.data.name||e.data.text:e.data.title||e.data.name||e.id}));
  const service={
    catalog,get state(){return runtime.state;},get projection(){return runtime.projection;},get groups(){return runtime.groups;},
    get adjudications(){return runtime.adjudications;},draft:runtime.draft,load:runtime.load,snapshot:runtime.snapshot,
    import(text,choices={},options) {
      const bindings=clone(choices);bindings.weaponChoices??={};bindings.modelBearers??={};
      for(const [key,value]of Object.entries(bindings.profiles||{}))if(key.startsWith('ec-weapon-choice/')){
        bindings.weaponChoices[key.slice('ec-weapon-choice/'.length)]=value;delete bindings.profiles[key];}
      for(const [key,value]of Object.entries(bindings.enhancementBearers||{})){
        const [unitId,enhancementId]=JSON.parse(key);(bindings.modelBearers[unitId]??={})[enhancementId]=value;}
      delete bindings.enhancementBearers;
      const result=runtime.import(text,bindings,options),candidate=result.candidateRoster;
      if(result.status!=='NEEDS_BINDINGS'||!candidate)return result;
      const physical=formRoster(book,candidate);
      return {...result,needsBindings:result.needsBindings.map(need=>{
        if(need.kind==='POSSESSED_BLADE_WEAPON'){
          const unit=candidate.units.find(u=>u.instanceId===need.key),assignment=unit.enhancementAssignments.find(a=>a.enhancementId===bladeId);
          const projected=physical.units.find(u=>u.instanceId===need.key),models=projected.profiles.filter(m=>m.scopeId===assignment?.modelScopeId);
          const equipped=new Set([...models.flatMap(m=>m.weapons),...(unit.startingStrength===1?projected.weapons:[])].map(w=>w.canonicalProfileId));
          return {...need,kind:'PROFILE',key:weaponKey(need.key),rawLabel:'Possessed Blade: choose the bearer’s equipped melee weapon',
            candidateIds:need.candidateIds.filter(id=>!assignment||equipped.has(records.get(id)?.data.weaponProfileId))};
        }
        if(need.kind==='ENHANCEMENT_MODEL_OWNER'){
          const unit=physical.units.find(u=>u.instanceId===need.key);
          return {...need,kind:'ENHANCEMENT_BEARER',key:JSON.stringify([need.key,need.rawLabel]),
            rawLabel:records.get(need.rawLabel)?.data.title||need.rawLabel,candidates:need.candidateIds.map(id=>{
              const profile=unit.profiles.find(p=>p.scopeId===id),raw=candidate.units.find(u=>u.instanceId===need.key);
              const row=raw.modelRows.find(r=>id.startsWith(raw.instanceId+'/'+r.rowId+'/'));
              return {id,title:row?.presentationLabel||records.get(profile?.canonicalProfileId)?.data.name||id};})};
        }
        return need;
      })};
    },
    context:runtime.context,modelScopes:runtime.modelScopes,
    attach:(leader,bodyguard)=>runtime.attach(bodyguard,leader),detach:runtime.detach,
    reattach:(leader,bodyguard)=>runtime.reattach(bodyguard,leader),
    candidates(leader){return runtime.state.units.filter(u=>runtime.candidates(u.instanceId).some(c=>c.instanceId===leader))
      .map(u=>({instanceId:u.instanceId,canonicalUnitId:u.canonicalUnitId}));},
    effective(id){const view=runtime.effective(id);
      // Keep the EC owner's nested /stats/* addresses. Do not flatten or
      // re-wrap the existing effective profile; that would lose its values.
      return view;},
    related(instanceId,detachmentId=null){
      const state=runtime.state,projection=runtime.projection,evaluator=createFormationContext(book,state,schema);
      const rows=projectRosterRelated({book,state,projection,context:runtime.context,...evaluator},instanceId,detachmentId);
      const known=new Set(rows.map(r=>r.ruleId));
      // Unlowered canonical rules are readable conditional declarations. No
      // selector, permission, battle state or execution is invented from prose.
      for(const rule of book.entities.filter(e=>['ENHANCEMENT','STRATAGEM'].includes(e.kind)&&state.detachmentIds.includes(e.parentId)&&
        (!detachmentId||e.parentId===detachmentId)&&!known.has(e.id)))rows.push({unitId:state.units.find(u=>u.instanceId===instanceId).canonicalUnitId,
          instanceId,ruleId:rule.id,detachmentId:rule.parentId,kind:rule.kind,state:'UNKNOWN',applicability:'CONDITIONAL'});
      return rows;
    }
  };
  return service;
}
export async function createBrowserRoster({fetch:read=globalThis.fetch}={}) {
  const response=await read(new URL('./generated/roster-attachments.json',import.meta.url));
  if(!response.ok)throw new Error('EC V2 roster input unavailable');return createECBrowserRoster(await response.json());
}

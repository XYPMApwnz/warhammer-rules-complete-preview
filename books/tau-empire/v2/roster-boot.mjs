import {createTauRosterImport,createTauRosterRuntime} from './roster-import.mjs';
import {formRoster,changeAttachment,selections} from '../../shared/roster-v2/context.mjs';
import {preserveTauSourceChoices,validateTauAttachmentSourceConditions,tauStudentRuleId,tauStudentOptionId,tauStudentField} from './roster-source-choices.mjs';
import {tauPrototypeDecisions} from './roster-weapon-choices.mjs';
import {pendingPhysicalBindings} from './rule-contract-declarations.mjs';
import {commitRosterImport} from '../../shared/roster-v2/runtime.mjs';

const clone=structuredClone;
const reference=(unit,weapon)=>({unitInstanceId:unit.instanceId,scopeId:weapon.scopeId??null,
  selectionKey:weapon.selectionKey,canonicalProfileId:weapon.canonicalProfileId});

/** One book-owned adapter over existing import, source choices and runtime.
 * The shared application owns every control, route and persistence action. */
export function createTauBrowserRoster(book){
  if(book.bookId!=='tau-empire')throw new TypeError('Foreign T’au roster input');
  const runtime=createTauRosterRuntime(book),importer=createTauRosterImport(book),records=new Map(book.entities.map(entity=>[entity.id,entity]));
  const title=id=>records.get(id)?.data.title||records.get(id)?.data.name||id;
  const service={
    catalog:runtime.catalog,get state(){return runtime.state;},get projection(){return runtime.projection;},
    get groups(){return runtime.projection?.formedUnits||[];},draft:importer.draft,
    import(text,choices={},options){
      const bindings=clone(choices);bindings.modelBearers??={};
      for(const [key,value]of Object.entries(bindings.enhancementBearers||{})){
        const [unitId,ruleId]=JSON.parse(key);(bindings.modelBearers[unitId]??={})[ruleId]=value;
      }
      delete bindings.enhancementBearers;
      const result=importer.import(text,bindings);
      if(result.status==='READY'){
        return commitRosterImport({...result,roster:preserveTauSourceChoices(book,result.roster,runtime.state)},runtime.state,service.load,options);
      }
      if(!result.candidateRoster)return result;
      const physical=formRoster(book,result.candidateRoster);
      return {...result,needsBindings:result.needsBindings.map(need=>{
        if(need.kind!=='ENHANCEMENT_MODEL_OWNER')return need;
        const unit=physical.units.find(unit=>unit.instanceId===need.key);
        return {...need,kind:'ENHANCEMENT_BEARER',key:JSON.stringify([need.key,need.rawLabel]),rawLabel:title(need.rawLabel),
          candidates:need.candidateIds.map(id=>({id,title:title(unit.profiles.find(model=>model.scopeId===id)?.canonicalProfileId)}))};
      })};
    },
    load:snapshot=>runtime.load(snapshot),snapshot:()=>runtime.snapshot(),context:(...args)=>runtime.context(...args),
    effective:id=>runtime.effective(id),
    candidates(leaderId){
      const state=runtime.state;
      if(!state)return [];
      return state.units.filter(unit=>{
        try{const next=changeAttachment(book,state,book.rosterAttachmentPolicies,'ATTACH',leaderId,unit.instanceId);
          validateTauAttachmentSourceConditions(book,next);return true;}catch{return false;}
      }).map(unit=>({instanceId:unit.instanceId,canonicalUnitId:unit.canonicalUnitId,title:title(unit.canonicalUnitId)}));
    },
    attach:(leader,target)=>runtime.attach(leader,target),detach:leader=>runtime.detach(leader),reattach:(leader,target)=>runtime.reattach(leader,target),
    sourceChoices(instanceId){
      const state=runtime.state,unit=state?.units.find(unit=>unit.instanceId===instanceId);
      if(!unit)return [];
      const projected=formRoster(book,state).units.find(row=>row.instanceId===instanceId),choices=[];
      for(const spec of pendingPhysicalBindings.filter(spec=>unit.enhancementIds.includes(spec.ruleId))){
        const scope=unit.enhancementAssignments.find(row=>row.enhancementId===spec.ruleId)?.modelScopeId;
        const model=projected.profiles.find(row=>row.scopeId===scope);
        if(model?.quantity!==1)continue;
        const weapons=[...model.weapons,...(unit.startingStrength===1?projected.weapons:[])].filter(weapon=>
          spec.eligibleWeaponProfileIds.includes(weapon.canonicalProfileId)&&[1,2].includes(weapon.physicalQuantity));
        const selected=tauPrototypeDecisions(unit).find(row=>row.sourceRuleId===spec.ruleId)?.sourceWeaponReference;
        choices.push({id:spec.ruleId,title:title(spec.ruleId),value:selected?JSON.stringify(reference(unit,{...selected,scopeId:selected.scopeId})):null,
          options:weapons.map(weapon=>({id:JSON.stringify(reference(unit,weapon)),title:title(weapon.canonicalProfileId)+
            (weapon.physicalQuantity===2?' — select one of the two imported weapons':' — imported weapon')+
            (weapons.filter(other=>other.canonicalProfileId===weapon.canonicalProfileId).length>1?' · '+weapon.selectionKey:'')}))});
      }
      if(unit.enhancementIds.includes(tauStudentRuleId)){
        const declaration=records.get(tauStudentOptionId),eligible=state.units.filter(row=>declaration.data.recipientUnitIds.includes(row.canonicalUnitId));
        const options=[];
        // Scalar shared controls can select a confirmed set. Values are source
        // decisions, not invented canonical records or physical model IDs.
        const subsets=(start,ids)=>{
          if(ids.length)options.push({id:JSON.stringify(ids),title:ids.map(id=>{const target=state.units.find(row=>row.instanceId===id);
            return title(target.canonicalUnitId)+' · '+id;}).join(' + ')});
          if(ids.length===declaration.data.maximumRecipients)return;
          for(let i=start;i<eligible.length;i++)subsets(i+1,[...ids,eligible[i].instanceId]);
        };subsets(0,[]);
        const selected=selections(unit).find(row=>row.selectionField===tauStudentField)?.recipientInstanceIds||[];
        choices.push({id:tauStudentRuleId,title:title(tauStudentRuleId),value:selected.length?JSON.stringify(eligible.filter(row=>selected.includes(row.instanceId)).map(row=>row.instanceId)):null,options});
      }
      return choices;
    },
    setSourceChoice(instanceId,ruleId,value){
      const choice=service.sourceChoices(instanceId).find(choice=>choice.id===ruleId);
      if(!choice||value!==null&&!choice.options.some(option=>option.id===value))throw new TypeError('Unconfirmed physical source choice');
      if(ruleId===tauStudentRuleId)return runtime.setStudentChoice(instanceId,value===null?[]:JSON.parse(value));
      return runtime.setPrototypeChoice(instanceId,ruleId,value===null?null:JSON.parse(value));
    },
    related(instanceId,detachmentId=null){
      const rows=runtime.related(instanceId,detachmentId),state=runtime.state,known=new Set(rows.map(row=>row.ruleId));
      for(const rule of book.entities.filter(entity=>['ENHANCEMENT','STRATAGEM'].includes(entity.kind)&&state.detachmentIds.includes(entity.parentId)&&
        (!detachmentId||entity.parentId===detachmentId)&&!known.has(entity.id)))rows.push({unitId:state.units.find(unit=>unit.instanceId===instanceId).canonicalUnitId,
          instanceId,ruleId:rule.id,detachmentId:rule.parentId,kind:rule.kind,state:'UNKNOWN',applicability:'CONDITIONAL'});
      return rows;
    }
  };return service;
}

export async function createBrowserRoster({fetch:read=globalThis.fetch}={}){
  const response=await read(new URL('./generated/roster-import.json',import.meta.url));
  if(!response.ok)throw new Error('T’au V2 roster input unavailable');
  return createTauBrowserRoster(await response.json());
}

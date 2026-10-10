import {lexicalDraft,importNewRecruit} from './import.mjs';
import {validateRoster,changeAttachment,attachmentCheck,predicateContext,withRosterDetachments} from './context.mjs';
import {executeRosterEffects,validateRosterEffects} from './effects.mjs';
import {validateCompatibilityFeasibility,evaluateRequiredRecipients,includeRecipientFeasibility,evaluateCompatibilityRole} from './compatibility-feasibility.mjs';
import {enhancementOwnerContext} from './compatibility-context.mjs';
const clone = value=>structuredClone(value);
const any = values=>values.includes('INVALID')?'INVALID':values.includes('TRUE')?'TRUE':values.includes('UNKNOWN')?'UNKNOWN':'FALSE';
const fields = value => Object.entries(value).map(([label,value])=>({label,value}));
const atoms = (value,path=[]) => value && typeof value==='object' ? Object.entries(value).flatMap(([key,child])=>atoms(child,[...path,key])) : [{path:'/'+path.map(p=>String(p).replaceAll('~','~0').replaceAll('/','~1')).join('/'),label:path.join(' / '),value}];
/** Browser/Node runtime consumes the same canonical snapshot and existing evaluator. */
export function createRosterRuntime(book,{parse,evaluatePredicate,evaluateRole,validatePredicate,publicResult}) {
  ({evaluatePredicate,evaluateRole}=withRosterDetachments({evaluatePredicate,evaluateRole}));
  book=structuredClone(book);
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
    import(text,bindings) {
      const result=importNewRecruit(text,{parse,bindings,book});
      if (result.status==='READY') service.load(result.roster);
      return result;
    },
    load(snapshot) {
      const verified=validateRoster(book,snapshot,policies), derived=executeRosterEffects(book,verified,{evaluatePredicate});
      state=verified;projection=derived;return service.state;
    },
    snapshot(){ if (!state) throw new TypeError('No roster');return clone(state); },
    attach(leaderId,bodyguardId){ return service.load(changeAttachment(book,state,policies,'ATTACH',leaderId,bodyguardId)); },
    detach(leaderId){ return service.load(changeAttachment(book,state,policies,'DETACH',leaderId)); },
    reattach(leaderId,bodyguardId){ return service.load(changeAttachment(book,state,policies,'REATTACH',leaderId,bodyguardId)); },
    candidates(leaderId){ return state.units.filter(u=>attachmentCheck(book,state,policies,leaderId,u.instanceId).valid).map(u=>({instanceId:u.instanceId,canonicalUnitId:u.canonicalUnitId,title:records.get(u.canonicalUnitId).data.title})); },
    context(instanceId,subject='UNIT',modelId,extra){ return predicateContext(state,projection,instanceId,subject,modelId,extra); },
    effective(instanceId) {
      const unit = projection?.units.find(u=>u.instanceId === instanceId);
      if (!unit) throw new TypeError('Unresolved physical instance');
      const canonical=records.get(unit.canonicalUnitId),group=projection.formedUnits.find(g=>g.formedUnitId===unit.formedUnitId);
      const name = id=>records.get(id)?.data.title || records.get(id)?.data.name || id;
      return {instanceId,canonicalUnitId:unit.canonicalUnitId,title:canonical.data.title,startingStrength:unit.startingStrength,
        ...(unit.abilities?{unitAbilities:clone(unit.abilities)}:{}),
        formedUnit:group?clone(group):null,keywords:group?[...group.keywords]:[...unit.keywords],intrinsicKeywords:[...unit.intrinsicKeywords],
        profiles:unit.profiles.map(m=>({id:m.canonicalProfileId,scopeId:m.scopeId,ownerInstanceId:instanceId,quantity:m.quantity,modelInstanceId:m.modelInstanceId,title:canonical.data.title,
          fields:[...fields(m.profile),...book.entities.filter(e=>e.kind==='MODEL_BASE'&&e.parentId===m.canonicalProfileId).map(e=>({label:'Base',value:e.data.text,source:{entityId:e.id}}))],keywords:[...m.keywords],intrinsicKeywords:[...(m.intrinsicKeywords||unit.intrinsicKeywords)],metrics:clone(m.metrics),abilities:clone(m.abilities),
          ...(m.suppressedAbilityIds?{suppressedAbilityIds:[...m.suppressedAbilityIds]}:{})})),
        weapons:[...unit.weapons,...unit.profiles.flatMap(m=>m.weapons.map(w=>({...w,modelInstanceId:m.modelInstanceId})))].map(w=>({id:w.canonicalProfileId,title:w.data.name,ownerInstanceId:instanceId,physicalQuantity:w.physicalQuantity,modelInstanceId:w.modelInstanceId,scopeId:w.scopeId || null,selectionKey:w.selectionKey,fields:fields(w.data)})),
        abilities:[...new Set([...canonical.data.sectionIds,...canonical.data.ruleReferenceIds,...canonical.data.wargearOptionIds,...(canonical.data.rawFactIds||[]),
          ...book.entities.filter(e=>e.parentId===canonical.id&&['SUPPLEMENTAL_DATASHEET_RULE','WEAPON_PROFILE_SELECTION','WARGEAR_FOOTNOTE'].includes(e.kind)).map(e=>e.id)])].filter(id=>{
            const abilityIds=[...(book.rosterReferenceSemantics?.[id]?.abilities||[]).flatMap(ability=>ability.canonicalId?[ability.canonicalId]:[]),
              ...(book.rosterAbilityReferences?.[id]?[id]:[]),...(records.get(id)?.data.armyRuleId?[records.get(id).data.armyRuleId]:[])];
            return !abilityIds.length || !abilityIds.every(abilityId=>unit.profiles.length && unit.profiles.every(model=>model.suppressedAbilityIds?.includes(abilityId)));
          }).map(id=>({id,title:name(id),text:clone(records.get(id).data)})),
        applied:unit.applied.map(row=>({...clone(row),label:name(row.ruleId)})),conditional:unit.conditional.map(row=>({...clone(row),label:name(row.ruleId)}))};
    },
    related(instanceId,detachmentId=null) {
      if (detachmentId && records.get(detachmentId)?.kind!=='DETACHMENT') throw new TypeError('Unresolved filter Detachment');
      const unit = projection.units.find(u=>u.instanceId===instanceId);if (!unit) throw new TypeError('Unresolved physical related context');
      const rows = [];
      for (const rule of book.entities.filter(e=>['STRATAGEM','ENHANCEMENT'].includes(e.ruleContract?.kind))) {
        const contract=rule.ruleContract;
        if (!state.detachmentIds.includes(contract.detachmentId)) continue;
        if (detachmentId && contract.detachmentId!==detachmentId) continue;
        const roleIds=contract.compatibilityRoleIds || [contract.roles[0]?.id];
        const roleContexts=(candidate,role)=>(role.subject==='MODEL'?
          candidate.profiles.map(m=>service.context(candidate.instanceId,'MODEL',m.scopeId)):
          [service.context(candidate.instanceId,role.subject)]).filter(Boolean).map(context=>enhancementOwnerContext(contract,context));
        const states=contract.roles.filter(role=>roleIds.includes(role.id)).map(role=>{
          return any(roleContexts(unit,role).map(context=>evaluateCompatibilityRole(contract,role,context,
            {evaluateRole,contextsForRole:primary=>projection.units.flatMap(candidate=>roleContexts(candidate,primary))})));
        });
        const recipient=evaluateRequiredRecipients(contract,unit.canonicalUnitId,state.units,
          {book,evaluateRole,sourceInstanceId:instanceId,contextFor:(candidate,subject)=>service.context(candidate.instanceId,subject)});
        const result=includeRecipientFeasibility(any(states),recipient);
        if (result==='INVALID') throw new TypeError('Invalid roster-aware rule: '+rule.id);
        rows.push({unitId:unit.canonicalUnitId,instanceId,ruleId:rule.id,detachmentId:contract.detachmentId,kind:contract.kind,state:result,applicability:publicResult[result]});
      }
      return rows;
    }
  };
  return service;
}

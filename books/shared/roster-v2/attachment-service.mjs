import {validateRoster,attachmentCheck,changeAttachment,formRoster,predicateContext} from './context.mjs';

const clone=value=>structuredClone(value);
const requireValue=(condition,message)=>{if(!condition)throw new TypeError(message);};

/** Attachment state/context only. Import stays with the existing import
 * service; no effect interpreter or player datasheet projection participates. */
export function createRosterAttachmentService(book,{importService,policies}) {
  book=clone(book);policies=clone(policies);
  const records=new Map(book.entities.map(entity=>[entity.id,entity]));
  requireValue(records.size===book.entities.length&&Array.isArray(policies),'Invalid attachment domain');
  const edges=new Set();
  for (const policy of policies) {
    const key=policy.sourceId+'/'+policy.targetId;
    requireValue(records.get(policy.sourceId)?.kind==='DATASHEET'&&records.get(policy.targetId)?.kind==='DATASHEET'&&
      ['LEADER','SUPPORT','SUPPORT_EXCEPTION'].includes(policy.role)&&[0,1].includes(policy.additionalLeaders)&&
      Array.isArray(policy.sourceIds)&&policy.sourceIds.length&&policy.sourceIds.every(id=>records.has(id))&&!edges.has(key),'Invalid canonical attachment policy');
    edges.add(key);
  }
  let state=null,formed=null;
  const service={
    get state(){return state?clone(state):null;},
    get groups(){return formed?clone(formed.formedUnits):[];},
    draft:text=>importService.draft(text),
    import(text,bindings){
      const result=importService.import(text,bindings);
      if(result.status==='READY')service.load(result.roster);
      return result;
    },
    load(snapshot){
      const verified=validateRoster(book,snapshot,policies);
      const context=formRoster(book,verified);
      state=verified;formed=context;return service.state;
    },
    snapshot(){requireValue(state,'No imported roster');return clone(state);},
    // Receiving unit first is the public product workflow. Physical candidates
    // remain separate even when they share a canonical datasheet identity.
    candidates(bodyguardId){
      requireValue(state?.units.some(unit=>unit.instanceId===bodyguardId),'Unresolved physical recipient');
      return state.units.flatMap(unit=>{
        const result=attachmentCheck(book,state,policies,unit.instanceId,bodyguardId);
        return result.valid?[{instanceId:unit.instanceId,canonicalUnitId:unit.canonicalUnitId,role:result.role,sourceIds:clone(result.sourceIds)}]:[];
      });
    },
    attach(bodyguardId,participantId){return service.load(changeAttachment(book,state,policies,'ATTACH',participantId,bodyguardId));},
    detach(participantId){return service.load(changeAttachment(book,state,policies,'DETACH',participantId));},
    reattach(bodyguardId,participantId){return service.load(changeAttachment(book,state,policies,'REATTACH',participantId,bodyguardId));},
    context(instanceId,subject='UNIT',profileScopeId){
      requireValue(state,'No imported roster');return predicateContext(state,formed,instanceId,subject,profileScopeId);
    },
    modelScopes(instanceId){
      const unit=formed?.units.find(unit=>unit.instanceId===instanceId);requireValue(unit,'Unresolved physical instance');
      return unit.profiles.map(profile=>({scopeId:profile.scopeId,canonicalProfileId:profile.canonicalProfileId,quantity:profile.quantity}));
    }
  };
  return service;
}

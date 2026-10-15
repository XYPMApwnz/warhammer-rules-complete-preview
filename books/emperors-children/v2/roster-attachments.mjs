import {createRosterAttachmentService} from '../../shared/roster-v2/attachment-service.mjs';
import {validateRoster,changeAttachment,predicateContext} from '../../shared/roster-v2/context.mjs';
import {executeRosterEffects} from '../../shared/roster-v2/effects.mjs';
import {projectEffectiveInstance} from '../../shared/roster-v2/effective-instance.mjs';
import {createECRosterImport} from './roster-import.mjs';
import {createFormationContext} from './rule-contract-formation-context.mjs';
const clone=structuredClone;
const reject=(ok,message)=>{if(!ok)throw new TypeError(message);};

/** EC orchestration only. No army-builder validation or battle-step inference. */
export function createECRosterAttachments(book,schema) {
  book=clone(book);
  reject(book.bookId==='emperors-children'&&typeof schema?.evaluatePredicate==='function','Invalid EC attachment inputs');
  const policies=book.rosterAttachmentPolicies,expected=book.mfmImportReferences.leaderEligibilityBindings.flatMap(b=>
    b.targetUnitIds.map(targetId=>({sourceId:b.sourceUnitId,targetId,role:'LEADER',additionalLeaders:0,sourceIds:[b.sourceEntityId],mfmReferenceId:b.mfmRecordId})));
  reject(JSON.stringify(policies)===JSON.stringify(expected)&&policies.length===8,'Unconfirmed EC attachment relation');
  const freshImport=()=>createECRosterImport(book);
  const attachments=createRosterAttachmentService(book,{policies,importService:freshImport()});
  let projection=null;
  const service={
    get state(){return attachments.state;},get projection(){return projection?clone(projection):null;},
    get groups(){return attachments.groups;},get adjudications(){return clone(book.rosterAttachmentAdjudications);},
    draft:text=>freshImport().draft(text),snapshot:()=>attachments.snapshot(),
    import(text,bindings={}) {
      const result=freshImport().import(text,bindings);
      if(result.status==='READY')service.load(result.roster);
      return {...result,legality:'NOT_ASSESSED',attachmentAdjudications:service.adjudications};
    },
    load(snapshot) {
      // Revalidate canonical import ownership independently of current edges.
      // Never write attachments back into the original import service/state.
      const original=clone(snapshot),imported=freshImport().load({...original,attachments:[]});
      const state=validateRoster(book,{...imported,attachments:original.attachments},policies);
      const context=createFormationContext(book,state,schema),next=executeRosterEffects(book,state,context);
      // Commit only after all validation/recompute succeeds, including any
      // explicitly supplied historical snapshot. Failure preserves prior state.
      attachments.load(state);projection=next;return service.state;
    },
    candidates:bodyguardId=>attachments.candidates(bodyguardId),
    attach:(bodyguardId,participantId)=>service.load(changeAttachment(book,attachments.state,policies,'ATTACH',participantId,bodyguardId)),
    detach:participantId=>service.load(changeAttachment(book,attachments.state,policies,'DETACH',participantId)),
    reattach:(bodyguardId,participantId)=>service.load(changeAttachment(book,attachments.state,policies,'REATTACH',participantId,bodyguardId)),
    context:(instanceId,subject='UNIT',scopeId)=>predicateContext(attachments.state,projection,instanceId,subject,scopeId),
    modelScopes:instanceId=>attachments.modelScopes(instanceId),
    effective:instanceId=>projectEffectiveInstance(book,projection,instanceId)
  };
  return service;
}

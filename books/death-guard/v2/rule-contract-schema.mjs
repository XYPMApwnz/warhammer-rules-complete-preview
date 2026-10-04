/** Bounded, typed applicability predicates. This module never reads source prose. */
import {stateFields} from './rule-contract-state-fields.mjs';
export const subjects = Object.freeze(['MODEL','UNIT','FORMED_ATTACHED_UNIT','ROSTER']);
export const levels = Object.freeze(['STATIC','ROSTER','BATTLE']);
export const publicResult = Object.freeze({TRUE:'MATCH',FALSE:'NO_MATCH',UNKNOWN:'CONDITIONAL',INVALID:'INVALID'});
export const predicateTypes = Object.freeze({
  ALWAYS:{subjects,level:'STATIC'}, MODEL_KEYWORD:{subjects:['MODEL'],level:'STATIC'},
  UNIT_KEYWORD:{subjects:['UNIT','FORMED_ATTACHED_UNIT'],level:'STATIC'},
  MODEL_ABILITY:{subjects:['MODEL'],level:'STATIC'},
  MODEL_ID:{subjects:['MODEL'],level:'STATIC'}, UNIT_ID:{subjects:['UNIT','FORMED_ATTACHED_UNIT'],level:'STATIC'},
  DETACHMENT:{subjects,level:'ROSTER'}, LEADING:{subjects:['MODEL','UNIT'],level:'ROSTER'},
  BODYGUARD_ID:{subjects:['MODEL','UNIT','FORMED_ATTACHED_UNIT'],level:'ROSTER'},
  CHARACTER_MODEL_COUNT:{subjects:['UNIT','FORMED_ATTACHED_UNIT'],level:'ROSTER'},
  FIELD:{subjects,level:'CONTEXTUAL'}
});
const fail = message => { throw new Error(`Rule Contract V2: ${message}`); };
const get = (object, fields) => fields.reduce((value,key)=>value?.[key],object);
const text = value => typeof value==='string'?value:JSON.stringify(value);
export function validatePredicate(node, subject, model, entity, fieldTypes = {}) {
  if (!node || typeof node!=='object') fail('malformed predicate');
  if (node.op) {
    if (!['ALL','ANY','NOT'].includes(node.op)||!Array.isArray(node.args)||!node.args.length||(node.op==='NOT'&&node.args.length!==1)) fail('malformed logical operator');
    for (const child of node.args) validatePredicate(child,subject,model,entity,fieldTypes);
    return;
  }
  const type=predicateTypes[node.predicate];
  if (!type) fail(`unknown predicate ${node.predicate}`);
  if (node.subject!==subject||!type.subjects.includes(subject)) fail(`predicate ${node.predicate} cannot use ${subject}`);
  if (!levels.includes(node.contextLevel)||(type.level!=='CONTEXTUAL'&&node.contextLevel!==type.level)) fail(`incorrect predicate context ${node.predicate}`);
  const args=node.arguments;
  if (!args||typeof args!=='object'||Array.isArray(args)) fail('missing predicate arguments');
  if (node.predicate.endsWith('_KEYWORD')&&(!args.keyword||typeof args.keyword!=='string')) fail('missing keyword');
  if (node.predicate==='MODEL_ABILITY'&&args.ability!=='Deadly Demise') fail('unknown static ability');
  if (node.predicate==='FIELD') {
    if (!args.key||!Object.hasOwn(args,'equals')||node.contextLevel==='STATIC') fail('contextual field misclassified or missing');
    if(!stateFields[args.key]||stateFields[args.key].contextLevel!==node.contextLevel||stateFields[args.key].valueType!==typeof args.equals) fail('unknown field, wrong type or context');
    if (fieldTypes[args.key]&&fieldTypes[args.key]!==node.contextLevel) fail(`field context drift ${args.key}`);
  }
  if (['MODEL_ID','UNIT_ID','BODYGUARD_ID','DETACHMENT'].includes(node.predicate)) {
    const target=model.entities.find(record=>record.id===args.id);
    if (!target) fail(`unresolved canonical ID ${args.id}`);
    const expected=node.predicate==='MODEL_ID'?'PROFILE':node.predicate==='DETACHMENT'?'DETACHMENT':'DATASHEET';
    if (target.kind!==expected) fail(`impossible identity subject ${args.id}`);
  }
  const proof=node.evidence;
  const owner=proof?.otherEntityId?model.entities.find(record=>record.id===proof.otherEntityId):entity;
  if (!owner||!Array.isArray(proof?.field)||!proof.quote||!text(get(owner.data,proof.field))?.includes(proof.quote)) fail(`source atom without exact evidence ${entity.id}/${node.predicate}`);
}
function validateRolePredicate(node,role,model,entity) {
  const checkBinding=value=>{
    if (value?.roleId&&value.roleId!==role.id) fail('predicate bound to a different role');
    if (value?.op) for (const child of value.args||[]) checkBinding(child);
  };
  checkBinding(node);
  validatePredicate(node,role.subject,model,entity);
}
export function validateContracts(model) {
  const seen=new Set();
  for (const entity of model.entities.filter(record=>record.ruleContract)) {
    const contract=entity.ruleContract;
    if (seen.has(contract.ruleId)||contract.ruleId!==entity.id) fail('duplicate independent semantic owner or changed rule ID');
    seen.add(contract.ruleId);
    if (!entity.provenance?.sourceId||contract.sourceId!==entity.provenance.sourceId||contract.ownerId!==(entity.parentId||model.bookId)) fail('source provenance/owner severed');
    if (!levels.includes(contract.contextLevel)||!Array.isArray(contract.roles)) fail('invalid contract shape');
    if(!['ARMY_RULE','DATASHEET_ABILITY','DETACHMENT_RULE','ENHANCEMENT','STRATAGEM','FAQ_ERRATA_RULE','OTHER_RULE'].includes(contract.kind)||!['SOURCE_DIRECTIVE','DATASHEET_DECLARATION','RULE_DECLARATION','DECLARATIVE_APPLICABILITY','BATTLE_ACTION'].includes(contract.executionMode))fail('unknown kind or execution mode');
    if(contract.detachmentId&&(contract.detachmentId!==entity.parentId||model.entities.find(record=>record.id===contract.detachmentId)?.kind!=='DETACHMENT'))fail('invalid Detachment scope');
    if(contract.kind==='STRATAGEM'&&(contract.cp!==entity.data.cp||!contract.timing||!Array.isArray(contract.duration)||!Array.isArray(contract.restrictions)))fail('incomplete Stratagem structure');
    if (!Array.isArray(contract.sourceFields)||!contract.sourceFields.length) fail('missing factual source references');
    for (const path of contract.sourceFields) if (!Array.isArray(path)||get(entity.data,path)===undefined) fail('unresolved source field');
    const roles=new Map();
    const checkRole=role=>{
      if (!role?.id||!subjects.includes(role.subject)||!['FRIENDLY','ENEMY','ANY'].includes(role.allegiance)||roles.has(role.id)) fail('missing subject or malformed role');
      roles.set(role.id,role);
      validateRolePredicate(role.selector,role,model,entity);
      for (const condition of role.conditions||[]) {
        validateRolePredicate(condition,role,model,entity);
      }
    };
    for (const role of contract.roles) checkRole(role);
    for(const id of contract.compatibilityRoleIds||[])if(!roles.has(id))fail('unresolved compatibility role');
    const checkAttackTargetBinding=(role,participants)=>{
      if (role.binding!=='ATTACK_TARGET') return;
      const actor=participants.get(role.actorRoleId);
      if (role.subject!=='UNIT'||role.allegiance!=='ENEMY'||!actor||actor.id===role.id||actor.subject!=='MODEL') fail('invalid attack-target participant binding');
    };
    for (const role of roles.values()) checkAttackTargetBinding(role,roles);
    for (const condition of contract.conditions||[]) {
      if (!subjects.includes(condition.subject)) fail('missing condition subject');
      validatePredicate(condition,condition.subject,model,entity);
    }
    for (const clause of contract.clauses||[]) {
      if (!clause.id||!Array.isArray(clause.sourceFields)||!clause.sourceFields.length) fail('malformed clause');
      const local=new Map();
      for (const role of clause.roles||[]) {
        if (!role.id||local.has(role.id)) fail('missing or duplicate clause role');
        local.set(role.id,role);
        if (!subjects.includes(role.subject)||!['FRIENDLY','ENEMY','ANY'].includes(role.allegiance)) fail('impossible target scope');
        if (roles.has(role.id)&&roles.get(role.id).subject!==role.subject) fail('clause role shadows a different subject');
        validateRolePredicate(role.selector,role,model,entity);
        for (const condition of role.conditions||[]) {
          validateRolePredicate(condition,role,model,entity);
        }
      }
      for (const condition of clause.conditions||[]) {
        const id=condition.roleId||contract.roles[0]?.id;
        const participant=condition.roleId?(local.get(id)||roles.get(id)):roles.get(id);
        if (!participant) fail('unresolved clause condition role');
        validateRolePredicate(condition,participant,model,entity);
      }
      for (const role of local.values()) checkAttackTargetBinding(role,new Map([...roles,...local]));
      for (const path of clause.sourceFields) if (get(entity.data,path)===undefined) fail('unresolved clause source field');
    }
    for (const role of roles.values()) if(role.binding==='ATTACK_TARGET') {
      const effects=(contract.clauses||[]).filter(clause=>clause.operation&&clause.roles.some(actor=>actor.id===role.actorRoleId));
      if(!effects.length||effects.some(clause=>!clause.roles.some(target=>target.id===role.id))) fail('attack-target binding severed from its effect clause');
    }
    if (contract.kind==='STRATAGEM') {
      const clauses=new Map(contract.clauses.map(clause=>[clause.id,clause]));
      if(clauses.size!==contract.clauses.length)fail('duplicate effect clause identity');
      for(const clause of clauses.values()) if(clause.operation) {
        const ids=clause.effectRecipientRoleIds;
        if(!Array.isArray(ids)||new Set(ids).size!==ids.length||ids.some(id=>!clause.roles.some(role=>role.id===id)))fail('invalid effect recipient binding');
        if(ids.some(id=>['ANCHOR','TRIGGER_ACTOR'].includes(roles.get(id)?.purpose)))fail('non-recipient owns an effect lifetime');
        if(clause.lifetimeEvidence&&(!clause.lifetimeEvidence.quote||!text(get(entity.data,clause.lifetimeEvidence.field))?.includes(clause.lifetimeEvidence.quote)))fail('unresolved lifetime scope evidence');
      }
      const durationIds=new Set();
      for(const duration of contract.duration) {
        if(!duration.id||durationIds.has(duration.id))fail('duplicate/missing duration identity');
        durationIds.add(duration.id);
        if(duration.endpoint==='NOT_EXPLICIT') {
          if(duration.inferredExpiry!==false||duration.roleIds||duration.bindings)fail('invented expiry without source');
          continue;
        }
        if(!['START_NEXT_FRIENDLY_COMMAND_PHASE','START_NEXT_FRIENDLY_TURN','END_CURRENT_PHASE','END_CURRENT_TURN','END_BATTLE','AFTER_PRIMARY_ATTACKED','EXPLICIT_SOURCE_BOUNDARY'].includes(duration.endpoint))fail('unknown duration endpoint');
        const proof=duration.evidence,source=text(get(entity.data,proof?.field||[])),occurrence=duration.sourceOccurrence;
        if(!proof?.quote||!Number.isInteger(occurrence?.start)||!Number.isInteger(occurrence?.end)||occurrence.start<0||source?.slice(occurrence.start,occurrence.end)!==proof.quote)fail('unresolved duration occurrence');
        if(!Array.isArray(duration.bindings)||!duration.bindings.length)fail('duration without effect bindings');
        const boundClauses=new Set(),boundRoles=new Set();
        for(const binding of duration.bindings) {
          const clause=clauses.get(binding.clauseId);
          if(!clause?.effectRecipientRoleIds?.length||boundClauses.has(clause.id))fail('duration bound to non-effect/duplicate clause');
          boundClauses.add(clause.id);
          if(JSON.stringify(binding.roleIds)!==JSON.stringify(clause.effectRecipientRoleIds))fail('duration lost/added an effect recipient');
          for(const id of binding.roleIds)boundRoles.add(id);
          if(JSON.stringify(binding.scopeEvidence)!==JSON.stringify(clause.lifetimeEvidence))fail('duration source scope severed');
          if(binding.scopeEvidence) {
            const scope=binding.scopeEvidence,start=source.indexOf(scope.quote);
            if(JSON.stringify(scope.field)!==JSON.stringify(proof.field)||start<0||source.indexOf(scope.quote,start+1)!==-1||occurrence.start<start||occurrence.end>start+scope.quote.length)fail('duration bound outside its source clause');
          }
        }
        if(!Array.isArray(duration.roleIds)||JSON.stringify(duration.roleIds)!==JSON.stringify([...boundRoles]))fail('duration role projection drift');
      }
    }
  }
  return {rules:seen.size,status:'PASS'};
}
const combine = (states,op) => states.includes('INVALID')?'INVALID':op==='ALL'?(states.includes('FALSE')?'FALSE':states.includes('UNKNOWN')?'UNKNOWN':'TRUE'):(states.includes('TRUE')?'TRUE':states.includes('UNKNOWN')?'UNKNOWN':'FALSE');
/** Missing context is UNKNOWN. Bad type/identity/predicate is INVALID. */
export function evaluatePredicate(node, context) {
  if (node?.op) {
    const states=node.args.map(child=>evaluatePredicate(child,context));
    if (node.op==='NOT') return states[0]==='TRUE'?'FALSE':states[0]==='FALSE'?'TRUE':states[0];
    return combine(states,node.op);
  }
  const type=predicateTypes[node?.predicate];
  if (!type||!type.subjects.includes(node.subject)||context.subject!==node.subject||!levels.includes(node.contextLevel)||(type.level!=='CONTEXTUAL'&&node.contextLevel!==type.level)) return 'INVALID';
  const a=node.arguments||{}, truth=value=>value?'TRUE':'FALSE';
  const available=(bag,key,compare)=>!bag||!Object.hasOwn(bag,key)?'UNKNOWN':compare(bag[key]);
  switch(node.predicate) {
    case 'ALWAYS': return 'TRUE';
    case 'MODEL_KEYWORD': case 'UNIT_KEYWORD': return context.keywords instanceof Set?(context.keywords.has(a.keyword)?'TRUE':node.predicate==='UNIT_KEYWORD'&&context.unknownKeywords?.has(a.keyword)?'UNKNOWN':'FALSE'):'INVALID';
    case 'MODEL_ABILITY': return context.abilities instanceof Set?truth(context.abilities.has(a.ability)):'INVALID';
    case 'MODEL_ID': return context.modelId?truth(context.modelId===a.id):'INVALID';
    case 'UNIT_ID': return context.unitId?truth(context.unitId===a.id):'INVALID';
    case 'DETACHMENT': return available(context.roster,'detachmentId',value=>truth(value===a.id));
    case 'LEADING': return available(context.roster,'leading',value=>truth(value===a.value));
    case 'BODYGUARD_ID': return available(context.roster,'bodyguardId',value=>truth(value===a.id));
    case 'CHARACTER_MODEL_COUNT': {
      if(!Object.hasOwn(context.roster||{},'characterModelCount')&&context.capabilities) {
        const maximum=context.capabilities.maxCharacterModels;
        if(!Number.isSafeInteger(maximum)||maximum<0)return 'INVALID';
        if(maximum<(a.min??0))return 'FALSE';
      }
      return available(context.roster,'characterModelCount',value=>truth(value>=(a.min??0)&&value<=(a.max??Infinity)));
    }
    case 'FIELD': {
      const spec=stateFields[a.key];
      if(!spec||spec.contextLevel!==node.contextLevel||spec.valueType!==typeof a.equals)return 'INVALID';
      if(a.key==='attached'&&!Object.hasOwn(context.roster||{},a.key)&&context.capabilities) {
        if(typeof context.capabilities.canBeAttached!=='boolean')return 'INVALID';
        if(!context.capabilities.canBeAttached)return truth(a.equals===false);
      }
      // Static capability belongs to the canonical entry, never to keywords
      // inherited from an Attached Unit. Unknown roster state stays unknown
      // only after this prerequisite has been met.
      if(spec.intrinsicAllKeywords) {
        if(!(context.intrinsicKeywords instanceof Set))return 'INVALID';
        if(!spec.intrinsicAllKeywords.every(keyword=>context.intrinsicKeywords.has(keyword)))return truth(false===a.equals);
      }
      return available(context[node.contextLevel==='BATTLE'?'battle':'roster'],a.key,value=>typeof value!==spec.valueType?'INVALID':truth(value===a.equals));
    }
    default: return 'INVALID';
  }
}
export function evaluateRole(role,conditions,context) {
  if (context.subject!==role.subject) return 'INVALID';
  return combine([evaluatePredicate(role.selector,context),...(role.conditions||[]).map(node=>evaluatePredicate(node,context)),...conditions.map(node=>evaluatePredicate(node,node.subject==='ROSTER'?{...context,subject:'ROSTER'}:context))],'ALL');
}

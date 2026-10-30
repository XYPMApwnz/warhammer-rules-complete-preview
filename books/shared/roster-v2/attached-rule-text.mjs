/** Read-only text propagation through recorded recipient paths in the current
 * physical attachment group. This does not execute an effect or infer a fact. */
import {presentationRecipientLinks,validatePresentationRecipientLink,validateRuleRecipients} from '../rule-contract-v2/recipients.mjs';
import {getRecordedSourceIdentity,copySourceEvidence} from '../source-refs-v2/source-refs.mjs';
import {predicateContext} from './context.mjs';
import {equipmentSatisfied} from './effects.mjs';
import {enhancementOwnerContext} from './compatibility-context.mjs';

const at=(value,path)=>path.reduce((item,key)=>item?.[key],value);
const all=values=>values.includes('FALSE')?'FALSE':values.every(value=>value==='TRUE')?'TRUE':'UNKNOWN';
const any=values=>values.includes('TRUE')?'TRUE':values.every(value=>value==='FALSE')?'FALSE':'UNKNOWN';
const title=rule=>rule?.data?.title||rule?.data?.name||rule?.displayName;
const requireValue=(value,message)=>{if(!value)throw new TypeError(message);};
const leaves=node=>node?.op?(node.args||[]).flatMap(leaves):node?[node]:[];
const battle=Symbol('battle-only text qualification');
const allowed=value=>value===battle||value==='TRUE';

/** Omit BATTLE-only subtrees, preserving the ROSTER Boolean structure.
 * ANY(UNKNOWN, BATTLE) must not acquire a true roster witness. */
function textGate(node,fallback,resolveRole,evaluatePredicate){
  if(!node||typeof node!=='object')return 'INVALID';
  if(node.op){
    if(!['ALL','ANY','NOT'].includes(node.op)||!Array.isArray(node.args)||!node.args.length||node.op==='NOT'&&node.args.length!==1)return 'INVALID';
    const values=node.args.map(child=>textGate(child,fallback,resolveRole,evaluatePredicate)).filter(value=>value!==battle);
    if(!values.length)return battle;
    if(values.includes('INVALID'))return 'INVALID';
    if(node.op==='ALL')return all(values);
    if(node.op==='ANY')return any(values);
    return values[0]==='TRUE'?'FALSE':values[0]==='FALSE'?'TRUE':values[0];
  }
  if(node.contextLevel==='BATTLE')return battle;
  const ctx=node.roleId?resolveRole(node.roleId):fallback;
  if(!ctx)return 'UNKNOWN';
  const actual=node.subject==='ROSTER'?{...ctx,subject:'ROSTER'}:ctx;
  return actual.subject===node.subject?evaluatePredicate(node,actual):'UNKNOWN';
}

/** A source block is the text boundary, never its enclosing ABILITIES section. */
function sourceBlocks(rule,clause,link){
  const result=new Map();
  const proofs=[clause.evidence,link.effect?.evidence,link.policy?.evidence,
    ...leaves(link.recipient.selector).map(node=>node.evidence),
    ...(link.recipient.conditions||[]).flatMap(leaves).map(node=>node.evidence)]
    .filter(proof=>proof?.field&&(!proof.otherEntityId||proof.otherEntityId===rule.id));
  for(const original of clause.sourceFields||[]){
    let path=[...original],value=at(rule.data,path);
    if(path[0]==='blocks'){
      if(!Number.isInteger(path[1]))continue;
      path=path.slice(0,2);value=at(rule.data,path);
    }
    if(value&&typeof value==='object'&&!Array.isArray(value)&&typeof value.text==='string'){
      path=[...path,'text'];value=value.text;
    }
    if(typeof value!=='string'||!value.trim()||['title','name','id'].includes(path.at(-1)))continue;
    if(!proofs.length)continue;
    const block=field=>field[0]==='blocks'?field.slice(0,2):field;
    const proof=proofs.find(proof=>JSON.stringify(block(path))===JSON.stringify(block(proof.field)));
    requireValue(proof,'Unresolved attached rule source block');
    const evidence=at(rule.data,proof.field),text=typeof evidence==='string'?evidence:evidence?.text;
    requireValue(typeof text==='string'&&typeof proof.quote==='string'&&text.includes(proof.quote),'Unresolved attached rule source quote');
    const caption=path[0]==='blocks'?(value.match(/^([^:\n]+):/)?.[1]||title(rule)):title(rule);
    if(!caption)continue;
    result.set(JSON.stringify(path),{sourcePath:path,title:caption,text:value});
  }
  return [...result.values()];
}

function ownerChain(rule,records){
  const chain=[],seen=new Set();let current=rule;
  while(current){
    requireValue(!seen.has(current.id),'Cyclic attached rule owner');seen.add(current.id);
    chain.push({id:current.id,parentId:current.parentId||null});
    if(['DATASHEET','DETACHMENT'].includes(current.kind))return chain;
    current=records.get(current.parentId);
  }
  return null;
}

export function projectAttachedRuleTexts(book,projection,instanceId,{state,evaluatePredicate,records=new Map(book.entities.map(rule=>[rule.id,rule]))}={}){
  // Historical callers without the validated roster cannot prove assignments
  // or initial-attachment conditions. Do not manufacture that state.
  if(!state||typeof evaluatePredicate!=='function')return [];
  const target=projection.units.find(unit=>unit.instanceId===instanceId);
  const group=projection.formedUnits.find(item=>item.formedUnitId===target?.formedUnitId);
  if(!group)return [];
  requireValue(records.size===book.entities.length,'Duplicate attached rule identity');
  const rows=new Map(),chains=new Map();
  const chainFor=rule=>{if(!chains.has(rule.id))chains.set(rule.id,ownerChain(rule,records));return chains.get(rule.id);};
  for(const source of projection.units.filter(unit=>unit.instanceId!==instanceId&&group.memberInstanceIds.includes(unit.instanceId))){
    for(const rule of book.entities.filter(rule=>rule.ruleContract&&rule.kind!=='STRATAGEM'&&rule.ruleContract.kind!=='STRATAGEM'&&
      (rule.kind==='ENHANCEMENT'?source.enhancementIds.includes(rule.id):chainFor(rule)?.at(-1)?.id===source.canonicalUnitId))){
      if(!getRecordedSourceIdentity(rule,{book}))continue;
      if(rule.ruleContract.detachmentId&&!state.detachmentIds.includes(rule.ruleContract.detachmentId))continue;
      validateRuleRecipients(book,rule);
      const assignment=source.enhancementAssignments?.find(item=>item.enhancementId===rule.id);
      const ownerRole=rule.ruleContract.roles?.find(role=>role.id===rule.ruleContract.assignment?.ownerRoleId);
      const ownerModel=assignment?source.profiles.find(model=>model.scopeId===assignment.modelScopeId):
        source.profiles.length===1&&source.profiles[0].quantity===1?source.profiles[0]:null;
      if(rule.kind==='ENHANCEMENT'&&ownerRole?.subject==='MODEL'&&(!ownerModel||ownerModel.quantity!==1))continue;
      const context=(unit,subject,model,extra)=>predicateContext(state,projection,unit.instanceId,subject,model?.scopeId,extra);
      if(rule.kind==='ENHANCEMENT'&&rule.ruleContract.assignment){
        const ctx=context(source,ownerRole?.subject,ownerModel);
        if(!ctx||evaluatePredicate(rule.ruleContract.assignment.selector,enhancementOwnerContext(rule.ruleContract,ctx))!=='TRUE')continue;
      }
      for(const clause of rule.ruleContract.clauses){
        if(clause.recipientStatus!=='RECORDED')continue;
        const roles=new Map([...(rule.ruleContract.roles||[]),...(clause.roles||[])].map(role=>[role.id,role]));
        for(const link of presentationRecipientLinks(rule,clause)){
          validatePresentationRecipientLink(rule,clause,link);
          const recipient=link.recipient;
          const origins=[...(recipient.conditions||[]),...(clause.conditions||[])].flatMap(leaves).filter(node=>
            node.predicate==='FIELD'&&node.contextLevel==='BATTLE'&&node.arguments?.from==='SOURCE_MODEL'&&
            node.arguments.ruleId===rule.id&&Number.isFinite(node.arguments.inches)&&node.arguments.inches>0);
          const rangeOrigin=origins.length>0&&ownerRole?.subject==='MODEL'&&ownerModel?.quantity===1;
          if(!rangeOrigin&&(recipient.side==='ENEMY'||recipient.how==='AURA'||recipient.how==='IN_BATTLE'))continue;
          const eligible=rangeOrigin||recipient.from==='SOURCE_FORMED_MODELS'||
            recipient.from==='LEADERS_OF_SOURCE'&&group.bodyguardInstanceId===source.instanceId&&group.leaderInstanceIds.includes(instanceId)||
            recipient.who==='UNIT'&&recipient.scope==='FORMED'&&(recipient.from==='SOURCE_UNIT'||
              recipient.from===undefined&&link.role?.subject==='FORMED_ATTACHED_UNIT'&&recipient.side==='FRIENDLY');
          if(!eligible||link.referenceBranch==='standalone')continue;
          const candidates=rangeOrigin?[null]:recipient.who==='MODEL'?target.profiles:[null];
          const matched=[];
          for(const model of candidates){
            const targetContext=rangeOrigin?null:context(target,link.role?.subject==='FORMED_ATTACHED_UNIT'?'FORMED_ATTACHED_UNIT':recipient.who,model);
            const resolveRole=(roleId,seen=new Set())=>{
              if(seen.has(roleId))return null;
              seen=new Set([...seen,roleId]);const role=roles.get(roleId);if(!role)return null;
              if(role.id===recipient.roleId)return targetContext;
              if(role.binding==='SOURCE_FORMED_MODELS'&&recipient.from===role.binding&&role.subject==='MODEL')return targetContext;
              if(role.subject==='ROSTER')return context(source,'ROSTER');
              if(role.subject==='FORMED_ATTACHED_UNIT')return context(source,role.subject);
              if(role.binding==='SOURCE_MODEL'||(role.purpose==='OWNER'||role.id===ownerRole?.id)&&role.subject==='MODEL')return ownerModel?enhancementOwnerContext(rule.ruleContract,context(source,'MODEL',ownerModel)):null;
              if(role.binding==='SOURCE_UNIT'||role.purpose==='OWNER'&&role.subject==='UNIT'){
                const ctx=context(source,'UNIT');return {...ctx,unitId:source.canonicalUnitId,keywords:new Set(source.keywords)};
              }
              return null;
            };
            const evaluate=(node,fallback)=>textGate(node,fallback,resolveRole,evaluatePredicate);
            const roleGate=(roleId,seen=new Set())=>{
              if(seen.has(roleId))return false;
              seen=new Set([...seen,roleId]);const role=roles.get(roleId),ctx=resolveRole(roleId);
              if(!role||!ctx||!allowed(evaluate(role.selector,ctx))||!(role.conditions||[]).every(node=>allowed(evaluate(node,ctx))))return false;
              if(!(role.prerequisites||[]).every(id=>typeof id==='string'&&roleGate(id,seen)))return false;
              const identity=context=>context?.subject==='MODEL'?context.modelScopeId:context?.subject==='FORMED_ATTACHED_UNIT'?context.formedUnitId:context?.instanceId;
              if(!(role.distinctFromRoleIds||[]).every(id=>{const other=resolveRole(id);return identity(ctx)&&identity(other)&&identity(ctx)!==identity(other);}))return false;
              return [role.sourceRoleId,role.anchorRoleId].filter(Boolean).every(id=>roleGate(id,seen));
            };
            if(ownerRole&&!roleGate(ownerRole.id))continue;
            if(!rangeOrigin){
              if(recipient.selector&&!allowed(evaluate(recipient.selector,targetContext)))continue;
              if(!(recipient.conditions||[]).every(node=>allowed(evaluate(node,targetContext))))continue;
            }else if([...(recipient.conditions||[]),...(clause.conditions||[])].some(node=>leaves(node).some(leaf=>leaf.contextLevel==='ROSTER'&&leaf.roleId===recipient.roleId)))continue;
            const firstSubject=node=>node.op?firstSubject(node.args[0]):node.subject;
            if(!(rule.ruleContract.conditions||[]).every(node=>allowed(evaluate(node,context(source,firstSubject(node),ownerModel)))))continue;
            if(!(clause.conditions||[]).every(node=>allowed(evaluate(node,context(source,firstSubject(node),ownerModel)))))continue;
            if(link.path==='ROSTER_EFFECT'){
              // This independently recorded effect path carries its own exact
              // source/target gates; an unrelated role is not proof for it.
              const equipment=link.effect.equipmentRequirement?equipmentSatisfied(book,source,link.effect.equipmentRequirement):undefined;
              const extra=equipment===undefined?{}:{equipmentRequirementSatisfied:equipment};
              if(!(link.effect.conditions||[]).every(condition=>{
                const leaves=node=>node.op?node.args.flatMap(leaves):[node];
                const subject=leaves(condition.predicate)[0]?.subject;
                const ctx=context(condition.binding==='SOURCE'?source:target,subject,condition.binding==='SOURCE'?ownerModel:model,condition.binding==='SOURCE'?extra:{});
                return allowed(evaluate(condition.predicate,ctx));
              }))continue;
            }else{
              if(!rangeOrigin&&recipient.roleId&&!roleGate(recipient.roleId))continue;
            }
            matched.push(model?.scopeId||null);
          }
          if(!matched.length)continue;
          for(const block of sourceBlocks(rule,clause,link)){
            // A typed policy is already rendered in full. An ability anchor
            // alone does not prove that its complete source text is visible.
            if((target.conditional||[]).some(row=>row.policy&&row.ruleId===rule.id&&row.sourceInstanceId===source.instanceId&&
              row.recipientInstanceIds?.includes(instanceId)&&row.policy.contextQuote===block.text))continue;
            const key=JSON.stringify([rule.id,source.instanceId,block.sourcePath]);
            let row=rows.get(key);
            if(!row){row={ruleId:rule.id,sourceInstanceId:source.instanceId,sourceUnitId:source.canonicalUnitId,recipientInstanceId:instanceId,
              sourceOwnerChain:chainFor(rule),...block,sourceLabel:title(records.get(source.canonicalUnitId)),
              ...copySourceEvidence(rule,{book,targetSlot:'sourceProvenance'}),proofs:[]};rows.set(key,row);}
            row.proofs.push({clauseId:clause.id,recipientId:recipient.id,path:link.path,
              relation:rangeOrigin?'RANGE_ORIGIN':'EFFECT_RECIPIENT',...(rangeOrigin?{anchorModelScopeId:ownerModel.scopeId}:{}),
              ...(link.effect?.id?{effectId:link.effect.id}:{}),modelScopeIds:matched.filter(Boolean)});
          }
        }
      }
    }
  }
  return [...rows.values()];
}

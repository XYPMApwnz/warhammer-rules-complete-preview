/** Source-declared prerequisites for attached text only. These inputs never
 * enter the effect interpreter or turn a battle event into a roster fact. */
import {translateFieldArguments} from '../rule-contract-v2/conditions.mjs';

const requireValue=(ok,message)=>{if(!ok)throw new TypeError('Text roster fact: '+message);};
const leaves=node=>node?.op?(node.args||[]).flatMap(leaves):node?[node]:[];
const at=(value,field)=>field.reduce((item,key)=>item?.[key],value);
const kinds=new Map([
  ['SOURCE_FORMED_MODEL_KEYWORD',['keyword']],
  ['SOURCE_LEADER_MODEL_KEYWORD',['keyword']],
  ['SOURCE_PROFILE_PRESENT',['profileId']],
  ['MEMBER_OF_SOURCE_UNIT',[]]
]);
const argsFor=(book,node)=>node?.predicate==='FIELD'&&node.contextLevel==='ROSTER'
  ?translateFieldArguments(node.arguments,{book,node}):null;
const matches=(book,node,fact)=>{
  const args=argsFor(book,node);
  return args?.key===fact.key&&typeof args.equals==='boolean'&&node.roleId===fact.roleId&&
    (fact.kind!=='SOURCE_PROFILE_PRESENT'||args.profileId===fact.profileId)&&
    JSON.stringify(node.evidence?.field)===JSON.stringify(fact.evidence.field)&&node.evidence?.quote===fact.evidence.quote;
};

/** Reject unused or ambiguous declarations before a producer writes outputs. */
export function validateClauseTextRosterFacts(book,rule,clause,records=new Map(book.entities.map(entity=>[entity.id,entity]))){
  if(clause.textRosterFacts===undefined)return [];
  const label=rule.id+'/'+clause.id;
  requireValue(clause.rosterClassification==='BATTLE_ONLY'&&!clause.rosterEffects?.length&&!clause.conditionalPolicy,
    label+' must remain a non-executable BATTLE_ONLY clause');
  requireValue(Array.isArray(clause.textRosterFacts)&&clause.textRosterFacts.length,label+' requires a nonempty declaration list');
  const nodes=[...(rule.ruleContract.conditions||[]),...(clause.conditions||[]),
    ...[...(rule.ruleContract.roles||[]),...(clause.roles||[])].flatMap(role=>[role.selector,...(role.conditions||[])])].flatMap(leaves);
  const seen=new Set();
  for(const fact of clause.textRosterFacts){
    const fields=kinds.get(fact?.kind);
    requireValue(fields,label+' has an unknown fact kind');
    const allowed=new Set(['kind','key','roleId','evidence',...fields]);
    requireValue(Object.keys(fact).every(key=>allowed.has(key)),label+' has an unknown fact field');
    requireValue(typeof fact.key==='string'&&fact.key&&fields.every(field=>typeof fact[field]==='string'&&fact[field]),label+' has incomplete fact arguments');
    requireValue(fact.roleId===undefined||typeof fact.roleId==='string'&&fact.roleId,label+' has an invalid role identity');
    requireValue(fact.evidence&&Object.keys(fact.evidence).every(key=>['field','quote'].includes(key))&&
      Array.isArray(fact.evidence.field)&&fact.evidence.field.length&&typeof fact.evidence.quote==='string'&&fact.evidence.quote,
    label+' requires exact local source evidence');
    const text=at(rule.data,fact.evidence.field);
    requireValue(typeof text==='string'&&text.includes(fact.evidence.quote),label+' source quote changed');
    requireValue(clause.sourceFields.some(field=>field.every((part,index)=>fact.evidence.field[index]===part)),label+' evidence is outside its source clause');
    requireValue(nodes.some(node=>matches(book,node,fact)),label+' does not declare the exact roster predicate');
    if(fact.kind==='SOURCE_PROFILE_PRESENT')requireValue(records.get(fact.profileId)?.kind==='PROFILE',label+' has an unknown source profile');
    const key=JSON.stringify([fact.key,fact.roleId??null,fact.profileId??null,fact.evidence.field,fact.evidence.quote]);
    requireValue(!seen.has(key),label+' has duplicate fact declarations');seen.add(key);
  }
  return clause.textRosterFacts;
}

export function validateBookTextRosterFacts(book){
  const records=new Map(book.entities.map(entity=>[entity.id,entity]));
  for(const rule of book.entities)for(const clause of rule.ruleContract?.clauses||[])validateClauseTextRosterFacts(book,rule,clause,records);
  return book;
}

/** The caller supplies the exact source/recipient pair already admitted by the
 * recorded recipient graph. An undeclared field still returns UNKNOWN through
 * the existing evaluator; neither prose nor a same-named field is a proof. */
export function createTextRosterFactEvaluator({book,state,projection,records,rule,clause,source,target,targetContext}){
  const facts=validateClauseTextRosterFacts(book,rule,clause,records);
  return node=>{
    const fact=facts.find(fact=>matches(book,node,fact));
    if(!fact)return undefined;
    const group=projection.formedUnits.find(group=>group.formedUnitId===source.formedUnitId);
    const sourceMembers=group?projection.units.filter(unit=>group.memberInstanceIds.includes(unit.instanceId)):[source];
    const physical=state.units.find(unit=>unit.instanceId===source.instanceId);
    let value;
    switch(fact.kind){
      case 'SOURCE_FORMED_MODEL_KEYWORD':
        value=sourceMembers.some(unit=>unit.profiles.some(profile=>profile.quantity>0&&profile.intrinsicKeywords?.includes(fact.keyword)));
        break;
      case 'SOURCE_LEADER_MODEL_KEYWORD':
        value=state.attachments.some(edge=>edge.bodyguardInstanceId===source.instanceId&&projection.units.find(unit=>
          unit.instanceId===edge.leaderInstanceId)?.profiles.some(profile=>profile.quantity>0&&profile.intrinsicKeywords?.includes(fact.keyword)));
        break;
      case 'SOURCE_PROFILE_PRESENT':
        value=Boolean(physical?.modelRows.some(row=>row.quantity>0&&
          records.get(row.canonicalProfileId)?.data.composition?.modelProfileSourceId===fact.profileId));
        break;
      case 'MEMBER_OF_SOURCE_UNIT':
        value=Boolean(targetContext?.subject==='MODEL'&&targetContext.modelScopeId&&group&&
          target.formedUnitId===group.formedUnitId&&group.memberInstanceIds.includes(target.instanceId)&&
          target.profiles.some(profile=>profile.scopeId===targetContext.modelScopeId&&profile.quantity>0));
        break;
      default:throw new TypeError('Unresolved text roster fact kind');
    }
    return value===argsFor(book,node).equals?'TRUE':'FALSE';
  };
}

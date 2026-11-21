/** Producer-only source review declarations for Space Marines and their Chapters. */
import assert from 'node:assert/strict';

export function recordReviewedTextRecipients(book, declarations) {
  const entities=new Map(book.entities.map(entity=>[entity.id,entity]));
  assert.equal(entities.size,book.entities.length,'Duplicate recipient owner');
  const seen=new Set();
  for(const {ruleId,clauseId,field,quote,subject,binding,scope} of declarations){
    const key=ruleId+'\0'+clauseId;
    assert(!seen.has(key),'Duplicate reviewed recipient: '+key);
    seen.add(key);
    const entity=entities.get(ruleId),contract=entity?.ruleContract;
    assert(contract&&entity.bookId===book.bookId&&entity.kind!=='STRATAGEM'&&contract.kind!=='STRATAGEM',
      'Expected book-owned non-Stratagem recipient: '+key);
    const matches=contract.clauses.filter(clause=>clause.id===clauseId);
    assert.equal(matches.length,1,'Unresolved reviewed recipient clause: '+key);
    const clause=matches[0],value=field.reduce((node,part)=>node?.[part],entity.data);
    assert(typeof value==='string'&&quote&&value.includes(quote),'Reviewed recipient quote changed: '+key);
    assert(clause.sourceFields.some(source=>source.every((part,index)=>field[index]===part)),
      'Reviewed recipient evidence is outside its clause: '+key);
    assert(!clause.rosterEffects?.length&&!clause.conditionalPolicy&&!clause.f1RecipientIds?.length,
      'Reviewed text recipient overlaps an existing execution path: '+key);
    assert(!clause.roles.some(role=>['EFFECT_RECIPIENT','RECIPIENT'].includes(role.purpose)||role.id==='text-recipient'),
      'Reviewed text recipient overlaps an existing role: '+key);
    const evidence={field:structuredClone(field),quote};
    clause.roles.push({id:'text-recipient',subject,allegiance:'FRIENDLY',binding,...(scope?{scope}:{}),
      purpose:'EFFECT_RECIPIENT',selector:{predicate:'ALWAYS',subject,contextLevel:'STATIC',arguments:{},evidence},evidence});
  }
}

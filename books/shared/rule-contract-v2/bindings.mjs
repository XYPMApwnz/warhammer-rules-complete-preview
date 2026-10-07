import assert from 'node:assert/strict';
import {levels} from './schema.mjs';

/** Typed declarations are the input authority. No source grammar lives here. */
export function mergeContractDeclarations(maps) {
  const result=new Map();
  for (const map of maps) for (const [id,declaration] of map) {
    assert.ok(id&&!result.has(id),'Duplicate/missing canonical semantic owner');
    result.set(id,declaration);
  }
  return result;
}

/** Check literal evidence and aggregate already-declared context levels. */
export function inspectDeclarationEvidence(value,index,entity) {
  let level='STATIC';
  function visit(node) {
    if (!node||typeof node!=='object') return;
    if (node.evidence) {
      const proof=node.evidence,source=index.get(proof.otherEntityId||entity.id);
      assert.ok(source&&Array.isArray(proof.field)&&proof.field.length&&proof.quote,
        `${entity.id}: source binding missing`);
      const value=proof.field.reduce((value,key)=>value?.[key],source.data);
      // Canonical evidence may identify a structured source field, as in the
      // shared schema; serializing it checks evidence without interpreting it.
      const text=typeof value==='string'?value:JSON.stringify(value);
      assert.ok(text?.includes(proof.quote),`${entity.id}: literal accepted source evidence missing: ${proof.quote}`);
    }
    if (node.predicate) {
      assert.ok(levels.includes(node.contextLevel),'Explicit predicate context');
      if (levels.indexOf(node.contextLevel)>levels.indexOf(level)) level=node.contextLevel;
    }
    for (const child of Object.values(node)) {
      if (Array.isArray(child)) child.forEach(visit); else visit(child);
    }
  }
  visit(value);
  return level;
}

/** Bind an omitted role to the declared owner, never a same-subject recipient. */
export function bindClauseCondition(condition,ownerRole,participantRoles) {
  let participant;
  if (condition.roleId) {
    participant=participantRoles.find(role=>role.id===condition.roleId)||
      (ownerRole.id===condition.roleId?ownerRole:undefined);
  } else {
    assert.equal(condition.subject,ownerRole.subject,'Non-owner condition requires an explicit participant role');
    participant=ownerRole;
  }
  assert.ok(participant,'Unresolved condition role');
  if (condition.subject!==undefined) assert.equal(condition.subject,participant.subject,'Condition subject differs from its role');
  condition.subject=participant.subject;
  if (condition.roleId||participant.id!==ownerRole.id) condition.roleId=participant.id;
  return condition;
}

export function createContractClause(declaration) {
  assert.ok(declaration.id&&Array.isArray(declaration.roles)&&Array.isArray(declaration.conditions)&&
    Array.isArray(declaration.sourceFields)&&declaration.sourceFields.length,'Malformed typed clause');
  const ids=declaration.roles.map(role=>role.id);
  assert.equal(new Set(ids).size,ids.length,'Duplicate clause role');
  if (declaration.effectRecipientRoleIds) {
    const recipients=declaration.effectRecipientRoleIds;
    assert.ok(Array.isArray(recipients)&&new Set(recipients).size===recipients.length&&
      recipients.every(id=>ids.includes(id)),'Unresolved/duplicate effect recipient');
  }
  // Roles deliberately remain the same participants as the containing contract.
  // Canonical publication below takes an independent snapshot of the result.
  return {...declaration};
}

export function bindDeclarationClauses(declaration) {
  for (const clause of declaration.clauses) {
    createContractClause(clause);
    for (const field of clause.sourceFields) {
      if (!declaration.sourceFields.some(existing=>JSON.stringify(existing)===JSON.stringify(field)))
        declaration.sourceFields.push(field);
    }
    for (const condition of clause.conditions)
      bindClauseCondition(condition,declaration.roles[0],clause.roles);
  }
  return declaration;
}

/** The book explicitly supplies actor, recipient and clause; no identity lookup. */
export function bindAttackTarget({recipient,actor,clause}) {
  assert.ok(recipient&&recipient.subject==='UNIT'&&recipient.allegiance==='ENEMY','Unresolved enemy attack-target participant');
  assert.equal(actor.subject,'MODEL','Attack-target binding requires a MODEL actor');
  assert.ok(clause.roles.some(role=>role.id===actor.id),'Attack actor missing from effect clause');
  assert.ok(!recipient.actorRoleId||recipient.actorRoleId===actor.id,'Conflicting attack-target actor');
  recipient.binding='ATTACK_TARGET';
  recipient.actorRoleId=actor.id;
  assert.ok(!clause.roles.some(role=>role.id===recipient.id),'Duplicate attack-target participant');
  clause.roles.push(recipient);
}

/** Bind locally interpreted lifetime occurrences to their exact effect recipients. */
export function bindDurationRecipients(ruleId,source,declarations,clauses) {
  const seen=new Set();
  return declarations.map(declaration=>{
    assert.ok(declaration.id&&!seen.has(declaration.id),'Duplicate/missing lifetime identity');
    seen.add(declaration.id);
    if (declaration.endpoint==='NOT_EXPLICIT') {
      assert.equal(declaration.inferredExpiry,false,'Invented expiry without source');
      assert.ok(!declaration.roleIds&&!declaration.bindings,'Unspecified lifetime has recipients');
      return structuredClone(declaration);
    }
    const occurrence=declaration.sourceOccurrence,proof=declaration.evidence;
    assert.ok(Number.isInteger(occurrence?.start)&&Number.isInteger(occurrence?.end)&&occurrence.start>=0&&proof?.quote&&
      source.quote.slice(occurrence.start,occurrence.end)===proof.quote&&
      JSON.stringify(source.field)===JSON.stringify(proof.field),`${ruleId}: unresolved lifetime source occurrence`);
    const bindings=[];
    for (const clause of clauses.filter(clause=>clause.effectRecipientRoleIds?.length)) {
      createContractClause(clause);
      const scope=clause.lifetimeEvidence?.quote||source.quote;
      const start=source.quote.indexOf(scope);
      assert.ok(start>=0&&source.quote.indexOf(scope,start+1)===-1,`${ruleId}: ambiguous lifetime source scope`);
      assert.ok(declarations.length<=1||clause.lifetimeEvidence,`${ruleId}: multiple lifetimes require clause-specific source scope`);
      if (clause.lifetimeEvidence) assert.deepEqual(clause.lifetimeEvidence.field,source.field,'Lifetime field scope drift');
      if (occurrence.start<start||occurrence.end>start+scope.length) continue;
      bindings.push({clauseId:clause.id,roleIds:[...clause.effectRecipientRoleIds],
        ...(clause.lifetimeEvidence?{scopeEvidence:clause.lifetimeEvidence}:{})});
    }
    assert.ok(bindings.length,`${ruleId}: source lifetime without an effect recipient`);
    // Property order preserves existing deterministic publication output.
    return {id:declaration.id,endpoint:declaration.endpoint,
      roleIds:[...new Set(bindings.flatMap(binding=>binding.roleIds))],bindings,
      evidence:proof,sourceOccurrence:occurrence,sourceFields:declaration.sourceFields};
  });
}

/** A preservation check against the input declaration, not against source prose. */
export function validateContractBinding({entity,bookId,schema,declaration,currentness},contract) {
  assert.equal(contract.schema,schema,'Contract schema binding severed');
  assert.equal(contract.ruleId,entity.id,'Canonical semantic owner changed');
  assert.equal(contract.ownerId,entity.parentId||bookId,'Canonical owner binding severed');
  assert.ok(entity.provenance?.sourceId,'Canonical source missing');
  assert.equal(contract.sourceId,entity.provenance.sourceId,'Canonical source binding severed');
  if (currentness!==undefined) assert.deepEqual(contract.currentness,currentness,'Source currentness binding severed');
  for (const [key,value] of Object.entries(declaration))
    assert.deepEqual(contract[key],value,`Typed declaration binding changed: ${key}`);
}

export function bindCanonicalContract({entity,bookId,schema,declaration,currentness,index}) {
  for (const key of ['schema','ruleId','ownerId','sourceId','currentness'])
    assert.ok(!Object.hasOwn(declaration,key),`Declaration cannot replace canonical ${key}`);
  inspectDeclarationEvidence(declaration,index,entity);
  const contract={schema,ruleId:entity.id,ownerId:entity.parentId||bookId,
    sourceId:entity.provenance.sourceId,...structuredClone(declaration),currentness:structuredClone(currentness)};
  validateContractBinding({entity,bookId,schema,declaration,currentness},contract);
  return contract;
}

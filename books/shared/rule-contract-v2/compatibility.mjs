import assert from 'node:assert/strict';
import {subjects} from './schema.mjs';
import {staticCapabilities,validateCompatibilityFeasibility,evaluateRequiredRecipients,
  includeRecipientFeasibility,evaluateCompatibilityRole} from '../roster-v2/compatibility-feasibility.mjs';
import {enhancementOwnerContext} from '../roster-v2/compatibility-context.mjs';

const any=states=>states.includes('INVALID')?'INVALID':states.includes('TRUE')?'TRUE':states.includes('UNKNOWN')?'UNKNOWN':'FALSE';
export const summarizeCompatibility=rows=>rows.reduce((out,row)=>{out[row.applicability]++;return out;},
  {MATCH:0,CONDITIONAL:0,NO_MATCH:0,INVALID:0,UNRESOLVED:0});

/** Generated answers are ignored. Authoritative pairwise answers are rejected,
 * including nested canonical-ID maps, regardless of their property name. */
export function rejectPairwiseAuthority(book) {
  const units=new Set(book.entities.filter(e=>e.kind==='DATASHEET').map(e=>e.id));
  const rules=new Set(book.entities.filter(e=>e.ruleContract).map(e=>e.id));
  const seen=new Map(),answers=new Set(['TRUE','FALSE','UNKNOWN','INVALID','MATCH','NO_MATCH','CONDITIONAL']);
  const visit=(value,unitId,ruleId)=>{
    if (unitId&&ruleId&&(typeof value==='boolean'||answers.has(value)))
      throw new TypeError('Manual pairwise compatibility authority is forbidden');
    if (!value||typeof value!=='object') return;
    if (value.authority==='DISPOSABLE_PROJECTION') return;
    unitId=value.unitId||value.canonicalUnitId||unitId;
    ruleId=value.ruleId||value.canonicalRuleId||ruleId;
    if (unitId&&ruleId&&(['state','applicability','match','matches','eligible','result'].some(key=>Object.hasOwn(value,key))||value.authority==='AUTHORITATIVE'))
      throw new TypeError('Manual pairwise compatibility authority is forbidden');
    const context=JSON.stringify([unitId,ruleId]),visited=seen.get(value)||new Set();
    if (visited.has(context)) return;
    visited.add(context);seen.set(value,visited);
    for (const [key,child] of value instanceof Map?value.entries():Object.entries(value))
      visit(child,units.has(key)?key:unitId,rules.has(key)?key:ruleId);
  };
  visit(book);
}

/** Build-only compiler: canonical facts plus explicit profile/reference bindings.
 * Available roster contexts are supplied by their existing owner, not simulated.
 */
export function createCompatibilityCompiler(options) {
  const allowed=new Set(['book','evaluator','profileBindings','referenceSemantics','attachmentRelations']);
  for (const key of Object.keys(options)) assert.ok(allowed.has(key),'Unsupported compiler input: '+key);
  const {book,evaluator,attachmentRelations}=options;
  const bindings=structuredClone(options.profileBindings),references=structuredClone(options.referenceSemantics);
  const {validateContracts,evaluatePredicate,evaluateRole,publicResult}=evaluator;
  rejectPairwiseAuthority({...book,profileBindings:bindings,referenceSemantics:references});
  const records=new Map(book.entities.map(e=>[e.id,e]));
  assert.equal(records.size,book.entities.length,'Duplicate canonical identity');
  const units=book.entities.filter(e=>e.kind==='DATASHEET');
  assert.ok(Array.isArray(bindings)&&references&&Array.isArray(attachmentRelations),'Explicit compiler bindings required');
  const profiles=new Map();
  for (const unit of units) {
    assert.ok(Array.isArray(unit.data.keywords)&&Array.isArray(unit.data.factionKeywords),'Missing canonical keyword context: '+unit.id);
    const rows=bindings.filter(row=>row.unitId===unit.id);
    assert.deepEqual(new Set(rows.map(row=>row.profileId)),new Set(unit.data.profileIds),'Incomplete explicit profile bindings');
    assert.equal(rows.length,unit.data.profileIds.length,'Duplicate profile binding');
    for (const row of rows) {
      assert.ok(records.get(row.profileId)?.kind==='PROFILE'&&records.get(row.profileId).parentId===unit.id,'Unresolved MODEL identity: '+row.profileId);
      assert.ok(Array.isArray(row.intrinsicKeywords)&&row.intrinsicKeywords.every(value=>typeof value==='string'),'Missing intrinsic MODEL keywords');
      if (row.abilities!==undefined) assert.ok(Array.isArray(row.abilities)&&row.abilities.every(value=>typeof value==='string'),'Malformed MODEL abilities');
      else {
        assert.ok(Array.isArray(row.referenceIds),'Explicit MODEL reference bindings required');
        for (const id of row.referenceIds) {
          assert.equal(records.get(id)?.kind,'RULE_REFERENCE','Unresolved MODEL reference binding');
          assert.ok(Object.hasOwn(references,id),'Missing explicit MODEL reference semantics');
        }
      }
    }
    profiles.set(unit.id,rows);
    for (const id of unit.data.ruleReferenceIds) {
      assert.equal(records.get(id)?.kind,'RULE_REFERENCE','Unresolved canonical reference: '+id);
      assert.ok(Object.hasOwn(references,id),'Missing explicit UNIT reference semantics');
    }
  }
  assert.equal(bindings.length,[...profiles.values()].reduce((n,rows)=>n+rows.length,0),'Unknown profile binding owner');
  for (const edge of attachmentRelations) for (const id of [edge.sourceId,edge.targetId])
    assert.equal(records.get(id)?.kind,'DATASHEET','Unresolved attachment relationship identity: '+id);
  for (const [id,names] of Object.entries(references)) {
    assert.equal(records.get(id)?.kind,'RULE_REFERENCE','Unresolved reference semantics');
    assert.ok(Array.isArray(names)&&names.every(name=>typeof name==='string'),'Malformed reference semantics');
  }

  function context(unitId,subject,{mode='BOOK',detachmentId,profileId,instanceId,availableContext,
    modelKeywordProjections=false,unknownDetachmentKeywords=true}={}) {
    assert.ok(subjects.includes(subject),'Unknown semantic subject');
    assert.ok(['BOOK','ROSTER'].includes(mode),'Unknown compatibility context mode');
    const unit=records.get(unitId);
    assert.equal(unit?.kind,'DATASHEET','Unresolved canonical unit');
    if (detachmentId) assert.equal(records.get(detachmentId)?.kind,'DETACHMENT','Invalid canonical Detachment context: '+detachmentId);
    const profile=subject==='MODEL'?profiles.get(unitId).find(row=>row.profileId===profileId):null;
    if (subject==='MODEL') assert.ok(profile,'Explicit MODEL profile required');
    const intrinsicKeywords=new Set(profile?profile.intrinsicKeywords:[...unit.data.keywords,...unit.data.factionKeywords]);
    const keywords=new Set(intrinsicKeywords),unknownKeywords=new Set();
    const abilities=new Set(profile?(profile.abilities??profile.referenceIds.flatMap(id=>references[id]||[])):
      unit.data.ruleReferenceIds.flatMap(id=>references[id]||[]));
    const grants=selected=>{
      const result=new Set(intrinsicKeywords);
      if (subject==='MODEL'&&!modelKeywordProjections) return result;
      for (const rule of book.entities.filter(e=>e.ruleContract?.detachmentId===selected))
        for (const grant of (rule.ruleContract.clauses||[]).map(clause=>clause.keywordProjection).filter(Boolean)) {
          const state=evaluatePredicate(grant.selector,{subject:grant.subject,unitId,keywords:result,roster:{detachmentId:selected}});
          assert.notEqual(state,'INVALID','Invalid keyword projection');
          if (state==='TRUE') result.add(grant.keyword);
        }
      return result;
    };
    for (const keyword of grants(detachmentId??null)) keywords.add(keyword);
    if (['UNIT','FORMED_ATTACHED_UNIT'].includes(subject)) {
      for (const edge of attachmentRelations.filter(edge=>edge.targetId===unitId||edge.sourceId===unitId)) {
        const other=records.get(edge.targetId===unitId?edge.sourceId:edge.targetId);
        for (const keyword of [...other.data.keywords,...other.data.factionKeywords]) if (!keywords.has(keyword)) unknownKeywords.add(keyword);
      }
    }
    const owner={unitId,keywords:new Set(keywords),unknownKeywords:new Set()};
    if (!detachmentId&&unknownDetachmentKeywords&&['UNIT','FORMED_ATTACHED_UNIT'].includes(subject)) {
      for (const detachment of book.entities.filter(e=>e.kind==='DETACHMENT')) for (const keyword of grants(detachment.id)) {
        if (!keywords.has(keyword)) unknownKeywords.add(keyword);
        if (!owner.keywords.has(keyword)) owner.unknownKeywords.add(keyword);
      }
    }
    const base={subject,unitId,...(profile?{modelId:profile.profileId}:{}),intrinsicKeywords,keywords,unknownKeywords,owner,
      abilities,capabilities:staticCapabilities(book,unitId),roster:detachmentId?{detachmentId}:{},battle:{}};
    if (mode==='BOOK') return base;
    assert.ok(instanceId&&typeof availableContext==='function','Explicit physical roster context required');
    const supplied=availableContext({instanceId,canonicalUnitId:unitId,profileId},subject);
    if (supplied===null) return null; // confirmed absence of this semantic subject
    assert.ok(supplied&&supplied.subject===subject,'Invalid available subject context');
    if (subject!=='ROSTER'||supplied.owner) assert.ok(supplied.owner?.unitId===unitId&&
      (!supplied.owner.instanceId||supplied.owner.instanceId===instanceId),'Physical owner identity changed');
    assert.ok(!supplied.instanceId||supplied.instanceId===instanceId,'Physical instance identity changed');
    if (supplied.unitId!==undefined) assert.equal(records.get(supplied.unitId)?.kind,'DATASHEET','Unresolved available UNIT identity');
    if (profile) assert.equal(supplied.modelId,profile.profileId,'Available MODEL profile identity changed');
    // Intrinsic facts always come from canonical profile/unit bindings. Formed
    // keywords never substitute for the exact component's owner keyword bag.
    return {...base,...supplied,instanceId,intrinsicKeywords,owner:{...(supplied.owner||base.owner),instanceId},
      unknownKeywords:supplied.unknownKeywords??(supplied.keywords?new Set():base.unknownKeywords),
      roster:{...(supplied.roster||{}),...(detachmentId?{detachmentId}:{})}};
  }
  function contextsFor(unitId,subject,options={}) {
    if (subject!=='MODEL') return [context(unitId,subject,options)].filter(Boolean);
    const rows=profiles.get(unitId);
    assert.ok(rows?.length,'Unresolved explicit MODEL profiles');
    if (options.profileId) assert.ok(rows.some(row=>row.profileId===options.profileId),'Unresolved explicit MODEL profile');
    return rows.filter(row=>!options.profileId||row.profileId===options.profileId)
      .map(row=>context(unitId,subject,{...options,profileId:row.profileId})).filter(Boolean);
  }
  function evaluateRule(unitId,ruleId,options={}) {
    const rule=records.get(ruleId),contract=rule?.ruleContract;
    assert.ok(contract,'Unresolved canonical rule');
    if (options.detachmentIds!==undefined) {
      assert.ok(Array.isArray(options.detachmentIds)&&new Set(options.detachmentIds).size===options.detachmentIds.length&&
        options.detachmentIds.every(id=>records.get(id)?.kind==='DETACHMENT'),'Invalid explicit Detachment selection');
      options={...options,detachmentId:options.detachmentIds.includes(contract.detachmentId)?contract.detachmentId:null};
    }
    const selected=options.detachmentIds===undefined||!contract.detachmentId||options.detachmentIds.includes(contract.detachmentId);
    const candidates=options.mode==='ROSTER'?options.instances:units.map(unit=>({canonicalUnitId:unit.id}));
    assert.ok(Array.isArray(candidates),'Explicit recipient instances required');
    const roleContext=value=>enhancementOwnerContext(contract,
      options.detachmentIds!==undefined?{...value,roster:{...value.roster,detachmentId:options.detachmentId}}:value);
    const prerequisiteContexts=role=>candidates.flatMap(candidate=>contextsFor(candidate.canonicalUnitId,role.subject,
      {...options,instanceId:candidate.instanceId,profileId:undefined})).map(roleContext);
    const roleIds=contract.compatibilityRoleIds||[contract.roles[0]?.id];
    const roles=contract.roles.filter(role=>roleIds.includes(role.id)).map(role=>{
      const contexts=contextsFor(unitId,role.subject,options);
      const evaluations=contexts.map(value=>({...(role.subject==='MODEL'?{profileId:value.modelId}:{}),
        state:selected?evaluateCompatibilityRole(contract,role,roleContext(value),
          {evaluateRole,contextsForRole:prerequisiteContexts}):'FALSE'}));
      return {roleId:role.id,subject:role.subject,state:any(evaluations.map(row=>row.state)),
        ...(role.subject==='MODEL'?{profileResults:evaluations}:{})};
    });
    assert.ok(roles.length,'Rule has no compatibility role: '+ruleId);
    if (options.mode==='ROSTER') {
      assert.ok(candidates.every(candidate=>candidate.instanceId&&records.get(candidate.canonicalUnitId)?.kind==='DATASHEET')&&
        new Set(candidates.map(candidate=>candidate.instanceId)).size===candidates.length,'Invalid physical recipient identities');
      assert.ok(candidates.some(candidate=>candidate.instanceId===options.instanceId&&candidate.canonicalUnitId===unitId),'Unresolved physical source instance');
    }
    // Profile expansion is evaluation scope, never synthetic physical models.
    const recipients=candidates.flatMap(candidate=>profiles.get(candidate.canonicalUnitId).map(row=>({...candidate,profileId:row.profileId})));
    const recipient=evaluateRequiredRecipients(contract,unitId,recipients,{book,evaluateRole,sourceInstanceId:options.instanceId,
      contextFor:(candidate,subject)=>context(candidate.canonicalUnitId,subject,{...options,instanceId:candidate.instanceId,profileId:candidate.profileId})});
    const state=includeRecipientFeasibility(any(roles.map(role=>role.state)),recipient);
    return {state,applicability:publicResult[state],roles};
  }
  function compileRows({kinds,order='RULE_UNIT',sort=false,instances,contextForRule=()=>({})}={}) {
    rejectPairwiseAuthority(book);
    validateContracts(book);
    validateCompatibilityFeasibility(book);
    assert.ok(Array.isArray(kinds)&&['RULE_UNIT','UNIT_RULE'].includes(order),'Explicit compiler domain required');
    if (instances!==undefined) assert.ok(Array.isArray(instances)&&instances.every(row=>row.instanceId&&records.get(row.canonicalUnitId)?.kind==='DATASHEET')&&
      new Set(instances.map(row=>row.instanceId)).size===instances.length,'Invalid physical compiler domain');
    const domain=instances?instances.map(row=>({...row,id:row.instanceId})):units.map(unit=>({id:unit.id,canonicalUnitId:unit.id}));
    const rules=book.entities.filter(e=>kinds.includes(e.ruleContract?.kind));
    if (sort) for (const rows of [domain,rules]) rows.sort((a,b)=>a.id.localeCompare(b.id,'en'));
    const pairs=order==='RULE_UNIT'?rules.flatMap(rule=>domain.map(unit=>[unit,rule])):domain.flatMap(unit=>rules.map(rule=>[unit,rule]));
    return {authority:'DISPOSABLE_PROJECTION',rows:pairs.map(([unit,rule])=>({unitId:unit.canonicalUnitId,ruleId:rule.id,
      ...(instances?{instanceId:unit.instanceId}:{}),
      ...evaluateRule(unit.canonicalUnitId,rule.id,{...contextForRule(rule),...(instances?{mode:'ROSTER',instances,instanceId:unit.instanceId}:{})})}))};
  }
  return Object.freeze({context,contextsFor,evaluateRule,compileRows});
}

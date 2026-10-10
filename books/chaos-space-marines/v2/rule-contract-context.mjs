import assert from 'node:assert/strict';
import {createCompatibilityCompiler} from '../../shared/rule-contract-v2/compatibility.mjs';
import {buildAttachmentFeasibility} from '../../shared/roster-v2/compatibility-feasibility.mjs';

/** Disposable semantic view, never a replacement factual catalog.
 * A composition member supplies MODEL identity; its explicitly bound statline
 * supplies characteristics. Shared statlines do not widen intrinsic keywords.
 */
export function semanticInputs(facts,identities) {
  const book=structuredClone(facts),index=new Map(book.entities.map(entity=>[entity.id,entity]));
  const sources=new Map(identities.bindings.map(binding=>[binding.id,binding.sourceEntityId]));
  const profileBindings=[],referenceSemantics={},composition=[];
  for(const entity of book.entities) {
    entity.parentId=entity.ownerId===book.bookId?undefined:entity.ownerId;
    entity.provenance={sourceId:sources.get(entity.id),sourceEvidence:entity.provenance};
    assert.ok(entity.provenance.sourceId,'Unbound canonical source identity');
    if(entity.kind==='MODEL_PROFILE')entity.kind='PROFILE';
    if(['CORE_ABILITY_MEMBERSHIP','ARMY_RULE_MEMBERSHIP'].includes(entity.kind)) {
      entity.kind='RULE_REFERENCE';
      referenceSemantics[entity.id]=[entity.data.label];
    }
  }
  for(const unit of book.entities.filter(entity=>entity.kind==='DATASHEET')) {
    const children=unit.data.childIds.map(id=>index.get(id));
    const keywordRows=children.filter(entity=>entity.kind==='KEYWORD_MEMBERSHIP');
    const factionRows=children.filter(entity=>entity.kind==='FACTION_KEYWORD');
    const members=children.filter(entity=>entity.kind==='COMPOSITION_MEMBER');
    assert.ok(members.length&&unit.data.modelGroups.length,'Missing canonical MODEL composition');
    unit.data.profileIds=members.map(member=>member.id);
    unit.data.keywords=[...new Set(keywordRows.map(row=>row.data.keyword))];
    unit.data.factionKeywords=[...new Set(factionRows.map(row=>row.data.keyword))];
    unit.data.ruleReferenceIds=children.filter(entity=>entity.kind==='RULE_REFERENCE').map(entity=>entity.id);
    for(const member of members) {
      const binding=member.data.composition;
      const statline=index.get(binding.modelProfileSourceId);
      assert.equal(statline?.kind,'PROFILE','Unresolved canonical model statline');
      assert.equal(statline.parentId,unit.id,'Foreign canonical model statline');
      const group=unit.data.modelGroups.find(row=>row.modelProfileId===statline.id);
      assert.ok(group?.compositionMemberIds.includes(member.id),'Unbound MODEL/statline scope');
      const intrinsicKeywords=[...new Set([...keywordRows,...factionRows]
        .filter(row=>row.data.compositionMemberSourceIds.includes(member.id)).map(row=>row.data.keyword))];
      member.kind='PROFILE';
      member.data.stats=structuredClone(statline.data.stats);
      profileBindings.push({unitId:unit.id,profileId:member.id,intrinsicKeywords,referenceIds:unit.data.ruleReferenceIds});
      composition.push({unitId:unit.id,profileId:member.id,intrinsicKeywords,maxModels:binding.quantity.max});
    }
  }
  const attachmentRelations=book.entities.filter(entity=>entity.kind==='ATTACHMENT_RELATION')
    .map(entity=>({sourceId:entity.parentId,targetId:entity.data.recipientId,role:entity.data.role,
      sourceEntityId:entity.id}));
  book.rosterAttachmentPolicies=attachmentRelations.map(edge=>({...edge,
    additionalLeaders:edge.role==='support'?1:0,distinctCanonicalLeaders:true}));
  book.compatibilityFeasibility=buildAttachmentFeasibility(book,composition);
  return {book,profileBindings,referenceSemantics,attachmentRelations,composition};
}

/** A declared statline denotes its canonical composition members. No new IDs. */
export function bindModelDenotations(declaration,inputs) {
  const statlines=new Map(inputs.book.entities.filter(entity=>entity.kind==='PROFILE'&&entity.data.composition)
    .map(entity=>[entity.id,entity.data.composition.modelProfileSourceId]));
  function visit(node) {
    if(!node||typeof node!=='object')return node;
    if(node.predicate==='MODEL_ID'&&!statlines.has(node.arguments.id)) {
      const members=[...statlines].filter(([,id])=>id===node.arguments.id).map(([id])=>id);
      assert.ok(members.length,'MODEL reference has no canonical composition denotation');
      const args=members.map(id=>({...structuredClone(node),arguments:{...node.arguments,id}}));
      return args.length===1?args[0]:{op:'ANY',args};
    }
    if(Array.isArray(node))return node.map(visit);
    return Object.fromEntries(Object.entries(node).map(([key,value])=>[key,visit(value)]));
  }
  return visit(declaration);
}

export function createCSMCompatibilityCompiler(inputs,evaluator) {
  const {book,profileBindings,referenceSemantics,attachmentRelations}=inputs;
  return createCompatibilityCompiler({book,profileBindings,referenceSemantics,attachmentRelations,evaluator});
}

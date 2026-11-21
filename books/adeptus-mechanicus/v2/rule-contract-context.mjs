import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createCompatibilityCompiler} from '../../shared/rule-contract-v2/compatibility.mjs';
import {buildAttachmentFeasibility} from '../../shared/roster-v2/compatibility-feasibility.mjs';
import {getRecordedSourceIdentity} from '../../shared/source-refs-v2/source-refs.mjs';

/** Ephemeral shape adapter. Scope IDs come from canonical profile bindings;
 * no first-profile fallback, title matching or legacy catalogs participate. */
export function compilerInputs(book,{abilityReferences}={}) {
  const view=structuredClone(book),index=new Map(view.entities.map(entity=>[entity.id,entity]));
  const profileBindings=[],referenceSemantics={},composition=[];
  const countBindings=JSON.parse(fs.readFileSync(new URL('./contract-composition-bindings.json',import.meta.url),'utf8')).bindings;
  for(const reference of view.entities.filter(entity=>entity.kind==='RULE_REFERENCE')) {
    const labels=reference.data.groups.flatMap(group=>group.entries.map(entry=>entry.label));
    // Parameterized Core memberships have a base ability as well as their exact
    // source label; this is build-time reference syntax, never a definition.
    referenceSemantics[reference.id]=[...new Set(labels.flatMap(label=>
      /^Deadly Demise(?:\s|$)/.test(label)?[label,'Deadly Demise']:[label]))];
  }
  for(const unit of view.entities.filter(entity=>entity.kind==='DATASHEET')) {
    const scopes=index.get(unit.data.keywordScopesId)?.data.scopes;
    assert.ok(scopes?.length,'Missing canonical keyword scopes');
    const scopeById=new Map(scopes.map(scope=>[scope.id,scope]));
    unit.data.keywords=[...new Set(scopes.filter(scope=>scope.label!=='FACTION KEYWORDS').flatMap(scope=>scope.keywords))];
    unit.data.factionKeywords=scopes.filter(scope=>scope.label==='FACTION KEYWORDS').flatMap(scope=>scope.keywords);
    const compositionOwner=unit.data.sectionIds.map(id=>index.get(id)).find(entity=>entity.data.title==='UNIT COMPOSITION');
    assert.ok(compositionOwner,'Missing composition source');
    for(const profileId of unit.data.profileIds) {
      const profile=index.get(profileId),ids=profile.data.keywordScopeIds;
      assert.ok(ids?.length&&ids.every(id=>scopeById.has(id)),'Unresolved MODEL keyword scope');
      const intrinsicKeywords=[...new Set(ids.flatMap(id=>scopeById.get(id).keywords))];
      profileBindings.push({unitId:unit.id,profileId,intrinsicKeywords,referenceIds:unit.data.ruleReferenceIds});
      const rows=countBindings.filter(row=>row.unitId===unit.id&&row.profileId===profileId);
      assert.equal(rows.length,1,'Missing/duplicate explicit profile composition binding');
      const binding=rows[0];
      assert.equal(binding.compositionSourceId,compositionOwner.id);
      assert.equal(binding.sourceId,getRecordedSourceIdentity(compositionOwner,{book:view}));
      const source=binding.field.reduce((value,key)=>value?.[key],compositionOwner.data);
      assert.equal(typeof source,'string');
      const lines=source.split('\n');
      assert.ok(binding.lineIndices.length&&new Set(binding.lineIndices).size===binding.lineIndices.length);
      const maxModels=binding.lineIndices.reduce((sum,line)=>{
        const match=lines[line]?.match(/^- (\d+)(?:-(\d+))? /);
        assert.ok(match,'Unresolved bound composition count');
        return sum+Number(match[2]||match[1]);
      },0);
      composition.push({unitId:unit.id,profileId,intrinsicKeywords,maxModels});
    }
  }
  assert.equal(countBindings.length,composition.length,'Foreign composition binding');
  // The shared roster kernel consumes the same explicit intrinsic MODEL scopes
  // as compatibility; the canonical factual snapshot stays unchanged.
  view.rosterProfileBindings=structuredClone(profileBindings);
  if(abilityReferences)view.rosterAbilityReferences=structuredClone(abilityReferences);
  const attachmentRelations=[];
  for(const declaration of view.entities.filter(entity=>entity.kind==='ATTACHMENT_DECLARATION'&&
      ['LEADER','SUPPORT'].includes(entity.data.roleHeading))) {
    for(const reference of declaration.data.references.filter(reference=>reference.targetId)) {
      assert.equal(index.get(reference.targetId)?.kind,'DATASHEET');
      attachmentRelations.push({sourceId:declaration.parentId,targetId:reference.targetId,
        role:declaration.data.roleHeading,sourceEntityId:declaration.data.sourceSectionId});
    }
  }
  // These policies serve only the existing compatibility feasibility compiler.
  // No attachment runtime/capacity or legality UI is being implemented here.
  view.rosterAttachmentPolicies=attachmentRelations.map(edge=>({...edge,
    additionalLeaders:edge.role==='SUPPORT'?1:0,distinctCanonicalLeaders:true}));
  view.compatibilityFeasibility=buildAttachmentFeasibility(view,composition);
  return {book:view,profileBindings,referenceSemantics,attachmentRelations,composition};
}

export function createAdMechCompatibilityCompiler(book,evaluator) {
  const {composition,...inputs}=compilerInputs(book);
  return createCompatibilityCompiler({...inputs,evaluator});
}

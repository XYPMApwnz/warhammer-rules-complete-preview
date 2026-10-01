import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {parseSourceHtml,sourceNode,sourceNodeText,normalizeSourceText} from './raw-source.mjs';

const sha=bytes=>createHash('sha256').update(bytes).digest('hex').toUpperCase();
const classes=new Set(['GAMEPLAY_FACT','REFERENCE_METADATA','SOURCE_NAVIGATION','PRESENTATION_METADATA','NON_GAMEPLAY']);
const wahaSource='dg-waha-2026-09-25';

/** A bounded source repair: factual source records and an explicit non-gameplay
 * accounting ledger. No executable rule predicates, applicability or UI output.
 */
export function preserveFoundationFacts(base,{ledger,rawSources,profileSelectionEvidence}) {
  const model=structuredClone(base),index=new Map(model.entities.map(entity=>[entity.id,entity]));
  assert.equal(ledger.schema,'dg-v2-foundation-closure/v1');
  assert.equal(new Set(ledger.leaves.map(leaf=>leaf.sourceLeafId)).size,ledger.leaves.length,'Unique audited source leaves');
  const parsed=new Map();
  for (const leaf of ledger.leaves) {
    assert.ok(classes.has(leaf.classification) && leaf.justification,'Explicit source-semantic classification required');
    const bytes=rawSources[leaf.sourceArtifact];
    assert.ok(bytes,'Foundation leaf requires its accepted raw artifact');
    assert.equal(sha(bytes),leaf.sourceSha256,'Foundation source byte identity');
    if (leaf.sourceArtifact.endsWith('.html')) {
      if (!parsed.has(leaf.sourceArtifact)) parsed.set(leaf.sourceArtifact,{html:bytes.toString('utf8'),root:parseSourceHtml(bytes.toString('utf8'))});
      const {html,root}=parsed.get(leaf.sourceArtifact);
      if (leaf.classification!=='GAMEPLAY_FACT') {
        // These are evidence/reference addresses, never gameplay joins. Their
        // parsed DOM locations are independently checked by source-closure QA.
        assert.ok(leaf.factType==='CROSS_REFERENCE_TARGET'?html.includes('href="'+leaf.rawValue+'"'):normalizeSourceText(sourceNodeText(html,root)).includes(normalizeSourceText(leaf.rawValue)),leaf.sourceLeafId+': raw reference evidence');
      } else {
        const path=leaf.sourceLocation.replace(/\/(?:href|label|clause\[\d+\])$/,'');
        const node=sourceNode(root,path),value=normalizeSourceText(sourceNodeText(html,node));
        assert.ok(value.includes(normalizeSourceText(leaf.rawValue)),leaf.sourceLeafId+': exact scoped raw source evidence');
      }
    }
  }
  const add=entity=>{
    assert.ok(entity.id && !index.has(entity.id),'One foundation factual owner: '+entity.id);
    if (entity.parentId) assert.ok(index.has(entity.parentId),'Foundation parent identity');
    model.entities.push(entity);index.set(entity.id,entity);
  };
  const instructions=ledger.leaves.filter(leaf=>leaf.classification==='GAMEPLAY_FACT' && leaf.factType==='BOOK_USAGE_CLAUSE');
  if (instructions.length) {
    const owner=instructions[0].canonicalBinding.entityId;
    assert.ok(instructions.every(leaf=>leaf.canonicalBinding.entityId===owner),'Explicit Introduction owner');
    add({id:owner,kind:'BOOK_USAGE_RULES',data:{clauses:instructions.map(leaf=>({sourceLeafId:leaf.sourceLeafId,text:leaf.rawValue}))},
      provenance:{sourceId:wahaSource,sourceRecordId:owner,sourcePath:instructions[0].sourceArtifact,pointer:'/html/body/div/div[1]/div[3]/div[7]',sha256:instructions[0].sourceSha256}});
  }
  // Directive ownership is explicit. Replacement field identities are pinned
  // source bindings, not resolved from a Stratagem title or prose at runtime.
  const updates=ledger.leaves.filter(leaf=>leaf.classification==='GAMEPLAY_FACT' && leaf.factType==='ERRATUM_DIRECTIVE');
  for (const leaf of updates) {
    const title=ledger.leaves.find(candidate=>candidate.factType==='ERRATUM_IDENTITY' && candidate.canonicalBinding.entityId===leaf.canonicalBinding.entityId);
    assert.ok(title && leaf.updateBindings?.length,'Erratum needs its accepted scope and replacement bindings');
    const {root,html}=parsed.get(leaf.sourceArtifact),node=sourceNode(root,leaf.sourceLocation.replace(/\/clause\[\d+\]$/,''));
    const text=sourceNodeText(html,node).trim();
    for (const binding of leaf.updateBindings) {
      const target=index.get(binding.targetId);
      assert.ok(target && binding.field.every(part=>typeof part==='string'||Number.isSafeInteger(part)),'Exact replacement identity');
      let value=target.data;
      for (const part of binding.field) value=value?.[part];
      assert.ok(typeof value==='string' && normalizeSourceText(text).includes(normalizeSourceText(value)),'Accepted replacement already projected exactly');
      target.data.sourceUpdateIds=[...(target.data.sourceUpdateIds||[]),leaf.canonicalBinding.entityId];
    }
    const targets=[...new Set(leaf.updateBindings.map(binding=>binding.targetId))];
    for (const targetId of targets) index.get(targetId).data.sourceUpdateIds=[...new Set(index.get(targetId).data.sourceUpdateIds)];
    add({id:leaf.canonicalBinding.entityId,kind:'SOURCE_ERRATUM',data:{class:'ERRATA',title:title.rawValue,text,directive:leaf.rawValue,operation:'REPLACE',targetBindings:structuredClone(leaf.updateBindings)},
      provenance:{sourceId:wahaSource,sourceRecordId:leaf.canonicalBinding.entityId,sourcePath:leaf.sourceArtifact,pointer:leaf.sourceLocation,sha256:leaf.sourceSha256}});
  }
  for (const source of profileSelectionEvidence.records) {
    assert.equal(sha(rawSources[source.provenance.documentPath]),source.provenance.sha256,'Profile instruction accepted PDF identity');
    for (const group of source.data.profileGroups) for (const id of group.profileIds) {
      const profile=index.get(id);
      assert.equal(profile?.kind,'WEAPON_PROFILE','Profile selection requires an exact canonical weapon profile');
      assert.equal(profile.parentId,source.parentId,'Profile selection scope cannot cross datasheets');
    }
    add({...structuredClone(source),kind:'WEAPON_PROFILE_SELECTION'});
    index.get(source.parentId).data.rawFactIds.push(source.id);
  }
  model.sourceAccounting={schema:ledger.schema,auditHead:ledger.auditHead,
    deferredApplicability:'966 rule-to-unit applicability ambiguities; Rule Contract V2 not implemented',
    leaves:structuredClone(ledger.leaves)};
  return model;
}

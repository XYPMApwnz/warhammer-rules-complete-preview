import assert from 'node:assert/strict';
import {createEffectiveCoreCatalog} from '../../core-rules/content/effective-core-catalog.mjs';

// Book-owned reference/parameter declarations. Core remains the definition
// owner; these are resolved canonical references, not copied rule text.
export function abilityReferences() {
  const core=createEffectiveCoreCatalog();
  const parameterSpecs={
    'core-fights-first':{},'core-stealth':{},'core-infiltrators':{},
    'core-scouts':{distance:{type:'number',min:0}},
    'core-lone-operative':{distance:{type:'number',min:0}}
  };
  return Object.fromEntries(Object.entries(parameterSpecs).map(([id,parameters])=>{
    const record=core.getById(id);
    assert.equal(record?.id,id,'Unresolved canonical Core ability');
    assert.equal(record.kind,'ability','Canonical reference is not an ability');
    assert.equal(record.state,'FULL_CONTENT','Canonical ability lacks source content');
    return [id,{id,title:record.title,parameters,provenance:structuredClone(record.provenance)}];
  }));
}

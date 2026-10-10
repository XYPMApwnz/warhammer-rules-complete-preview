import assert from 'node:assert/strict';
import {createEffectiveCoreCatalog} from '../content/effective-core-catalog.mjs';
import {bindWahaSourceNodes} from '../content/waha-core-source.mjs';

// Synthetic source ingestion: repeated displayed codes are not record identity.
const code='13.02.01',unitId='synthetic-source-node';
const occurrences=['Definition','Triggered-Procedure'].map((anchor,index)=>({
  stableDomId:anchor,sourceOrder:index+10,title:anchor,
  content:{text:`Payload for ${anchor}.`,contentHash:`synthetic-${anchor}`,lists:[],references:[]}
}));
const unit={id:unitId,code,occurrences};
const bindings=occurrences.map(o=>({sourceUnitId:unitId,sourceCode:code,anchor:o.stableDomId,
  sourceOrder:o.sourceOrder,contentHash:o.content.contentHash,textRange:{start:0,end:o.content.text.length},referenceIndexes:[]}));
const ingest=(source,declarations)=>bindWahaSourceNodes([],declarations,new Map([[unitId,source]]));
const forward=ingest(unit,bindings),reverse=ingest({...unit,occurrences:[...occurrences].reverse()},[...bindings].reverse());
assert.deepEqual(forward,reverse);
assert.equal(forward.length,2);
assert.equal(new Set(forward.map(record=>record.sourceNode.anchor)).size,2);
assert.throws(()=>ingest(unit,[bindings[0],bindings[0]]),/source-node binding/);
assert.throws(()=>ingest(unit,[{...bindings[0],contentHash:'other occurrence'}]),/source-node binding/);
assert.throws(()=>bindWahaSourceNodes([{code,sourceNode:{anchor:'Unbound-Third-Node'}}],bindings,new Map([[unitId,unit]])),/Unbound source node/,'unknown same-code node must not be silently deleted');
assert.throws(()=>ingest({...unit,occurrences:[...occurrences,{...occurrences[0],stableDomId:'Unbound-Third-Node'}]},bindings),/Unbound source node/,'an uncatalogued accepted source node must fail closed');

const catalog=createEffectiveCoreCatalog();
const expected=[['Desperate-Escape-Test',52,'core-rule-09-07-01-desperate-escape-test'],['Desperate-Escape',53,'core-rule-09-07-01-desperate-escape']];
const source=catalog.sourceUnits['waha-core-rule-09-07-01'];
for(const [anchor,order,id] of expected){
  const occurrence=source.occurrences.find(item=>item.stableDomId===anchor);
  const record=catalog.getById(id);
  assert.equal(catalog.getByAnchor(anchor),record);
  assert.equal(record.sourceCode,'09.07.01');
  assert.equal(record.sourceNode.sourceOrder,order);
  assert.equal(record.sourceNode.contentHash,occurrence.content.contentHash);
  assert.deepEqual(record.provenance.sourceNode,record.sourceNode);
  assert.deepEqual(record.sourceContentHashes,[occurrence.content.contentHash]);
  assert.equal(record.state,'FULL_CONTENT');
  assert(!record.semanticContent.includes('Selecting Modes'));
  assert(!record.semanticContent.includes('Modes are mutually exclusive'));
}
assert.equal(catalog.getByCode('09.07.01'),null);
assert.equal(catalog.records.length,371);
assert.equal(catalog.records.filter(record=>record.state!=='FULL_CONTENT').length,0);
const modes=catalog.getById('core-rule-09-02-02-selecting-modes');
assert(modes.semanticContent.includes('Modes are mutually exclusive'));
assert.equal(catalog.mainRules.filter(record=>record.semanticContent.includes('Modes are mutually exclusive')).length,1);
assert.deepEqual(catalog.getByAnchor('Desperate-Escape').sourceStructure.references.map(ref=>ref.label),['stratagem','Desperate Escape','hazard roll','battle-shock roll']);
console.log(JSON.stringify({status:'PASS',genericDuplicateSourceCodeGuard:'PASS',canonicalRecords:catalog.records.length,distinctNodes:2,sourceCollisionLoss:0,unresolvedVisibleFacts:0,selectingModesDuplication:0}));

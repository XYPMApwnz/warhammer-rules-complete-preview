import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import {buildV2} from './build.mjs';
import {compareV1Facts,loadV1ComparisonModel} from './compare-v1.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../..');
const result = await buildV2();
const comparison = result.comparison;
assert.deepEqual(comparison.unresolved,[],'Every factual difference and both inventory directions must close');
assert.equal(comparison.summary.UNRESOLVED_SOURCE_CONFLICT,0);
assert.equal(comparison.summary.V2_DEFECT || 0,0);
for (const row of comparison.inventory) {
  assert.deepEqual(row.missing,[],`${row.domain}: missing comparison target`);
  assert.deepEqual(row.extra,[],`${row.domain}: unclassified extra V1 target`);
}
for (const fact of comparison.facts) {
  assert.ok(['UNCHANGED','EXPECTED_CURRENT_GW_UPDATE','V1_DEFECT','V2_DEFECT','REPRESENTATION_ONLY','SOURCE_EVIDENCE_ONLY'].includes(fact.classification));
  if (fact.status === 'DIFFERENT' || fact.status === 'MISSING_V1') assert.ok(fact.proof,'Semantic differences retain a source adjudication');
}
const v1 = JSON.parse(fs.readFileSync(path.join(root,'books/death-guard/content/death-guard-rules.en.json'),'utf8'));
const v1EffectiveModel = await loadV1ComparisonModel(root);
assert.deepEqual(comparison,compareV1Facts(result.effective,v1,{v1EffectiveModel}),'Comparison is deterministic and read only');
const before = JSON.stringify(result.effective);
let mutations = 0;
const extra = structuredClone(v1);
extra.sections.push({id:'unit-unaccepted-extra',kind:'unit',title:'Unaccepted extra',blocks:[],subsections:[]});
assert.ok(compareV1Facts(result.effective,extra,{v1EffectiveModel}).unresolved.some(row => row.canonicalId === 'unit-unaccepted-extra' || row.id === 'unit-unaccepted-extra'));mutations++;
const changed = structuredClone(v1);
const enhancement = changed.sections.flatMap(section => section.subsections || []).flatMap(part => part.blocks || []).find(block => block.type === 'enhancement');
enhancement.text += ' Unaccepted condition that changes gameplay.';
assert.ok(compareV1Facts(result.effective,changed,{v1EffectiveModel}).unresolved.length,'A new semantic discrepancy cannot reuse a frozen representation adjudication');mutations++;
const extraAbility = structuredClone(v1);
extraAbility.sections.find(section => section.kind === 'unit').subsections[0].blocks.push({id:'unaccepted-extra-ability',type:'ability',text:'Unaccepted rule'});
assert.ok(compareV1Facts(result.effective,extraAbility,{v1EffectiveModel}).unresolved.some(row => row.id === 'unaccepted-extra-ability'),'Extra abilities cannot hide behind unit inventory parity');mutations++;
const wrongProvenance = structuredClone(result.effective);
const operation = wrongProvenance.appliedOverlays[0];
wrongProvenance.entities.find(entity => entity.id === operation.targetId).fieldProvenance[operation.field.join('/')].sourceId = 'unaccepted-owner';
assert.ok(compareV1Facts(wrongProvenance,v1,{v1EffectiveModel}).summary.V2_DEFECT > 0,'Incorrect field ownership must be classified as a V2 defect');mutations++;
const wrongQualification = structuredClone(result.effective);
wrongQualification.entities.find(entity => entity.qualifications?.length).qualifications[0].value = {unacceptedQualification:true};
assert.ok(compareV1Facts(wrongQualification,v1,{v1EffectiveModel}).summary.V2_DEFECT > 0,'Qualification values must match the accepted operation trace');mutations++;
assert.equal(JSON.stringify(result.effective),before,'V1 comparison never changes V2 facts');
console.log(JSON.stringify({status:'PASS',facts:comparison.facts.length,summary:comparison.summary,inventoryDomains:comparison.inventory.length,mutations},null,2));

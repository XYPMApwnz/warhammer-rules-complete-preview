import assert from 'node:assert/strict';
import fs from 'node:fs';
import {consumeMfm,resolveOwnedFact} from './mfm-boundary.mjs';

const read=name=>JSON.parse(fs.readFileSync(new URL(name,import.meta.url),'utf8'));
const effective=read('./generated/effective.json'),bindings=read('./mfm-bindings.json');
const result=consumeMfm(effective.entities);
assert.equal(result.partitions.unitBindings.length,52);
assert.equal(result.partitions.detachmentBindings.length,10);
assert.equal(result.partitions.enhancementBindings.length,34);
assert.equal(result.partitions.paidOptionBindings.length,2);
assert.equal(result.leaderRelations.length,15);
assert.equal(new Set(result.leaderRelations.map(r=>r.sourceId+'\0'+r.targetId)).size,15);
let schedules=0,rows=0;
for(const bridge of bindings.unitBindings){
  const fact=resolveOwnedFact(bridge.mfmRecordId);
  schedules+=fact.pointSchedules.length;
  rows+=fact.pointSchedules.reduce((sum,r)=>sum+r.entries.length,0);
  assert.equal(fact.provenance.effectiveDate,null);
}
assert.equal(schedules,68);assert.equal(rows,94);
assert.deepEqual(bindings.paidOptionBindings.map(r=>resolveOwnedFact(r.mfmRecordId).value).sort((a,b)=>a-b),[10,20]);
for(const sourceId of ['unit-broodlord','unit-old-one-eye','unit-neurotyrant','unit-hyperadapted-raveners'])
  assert.ok(result.leaderRelations.some(row=>row.sourceId===sourceId));
const mutateBinding=mutate=>{const value=structuredClone(bindings);mutate(value);assert.throws(()=>consumeMfm(effective.entities,{bindings:value}));};
mutateBinding(r=>r.leaderBindings[0].targetUnitIds.push('unit-tyrannofex'));
mutateBinding(r=>r.enhancementBindings[0].ownerEntityId='detachment-invasion-fleet');
mutateBinding(r=>r.unitBindings.pop());
const poisoned=structuredClone(effective.entities);poisoned[0].data.points=999;
assert.throws(()=>consumeMfm(poisoned),/Army-owned copy/);
const wrongLeader=structuredClone(effective.entities);
wrongLeader.find(r=>r.id===bindings.leaderBindings[0].sourceEntityId).data.blocks[0].text='This model can lead anything.';
assert.throws(()=>consumeMfm(wrongLeader),/Leader relation mismatch/);
assert.throws(()=>resolveOwnedFact('not-a-tyranids-MFM-fact'));
console.log(JSON.stringify({MFM_V16:'PASS',UNIT_BINDINGS:'52/52',SCHEDULES:schedules,POINT_ROWS:rows,
  ENHANCEMENTS:'34/34',LEADER_RELATIONS:'15/15',PAID_OPTIONS:'2/2',NEGATIVE_CONTROLS:'6/6',VALUES_COPIED:false}));

/** Known UNIT quantities must survive import without inventing MODEL bearers.
 * This verifies import integrity and UNIT effects, not formation legality. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createDGRosterRuntime} from './roster-boot.mjs';
import {parseSourceHtml,sourceNodeText} from './raw-source.mjs';

const book=JSON.parse(fs.readFileSync(new URL('./generated/rule-contract-effective.json',import.meta.url),'utf8'));
const original=structuredClone(book);
let controls=0;
for(const [slug,title,count,file] of [
  ['plague-drones','Plague Drones',3,'Plague-Drones.html'],
  ['plaguebearers','Plaguebearers',10,'Plaguebearers.html']
]) {
  const raw=fs.readFileSync(new URL('./sources/accepted-waha-pages/'+file,import.meta.url),'utf8');
  const source=sourceNodeText(raw,parseSourceHtml(raw)).replace(/\s+/g,' ');
  assert.ok(source.includes('Models in the bearer’s unit have a Leadership characteristic of 6+'));
  assert.ok(source.includes('Add 1 to Charge rolls made for the bearer’s unit.'));
  const weapons=slug==='plague-drones'?'3x Death’s heads, 3x Foul mouthparts, 3x Plaguesword':'10x Plaguesword';
  const header='+ DETACHMENT: Virulent Vectorium\n';
  const bare=`${count}x ${title} (100 pts): ${weapons}`;
  const selected=bare+', 1x Daemonic Icon, 1x Instrument of Chaos';
  const text=header+selected+'\n'+bare;
  const runtime=createDGRosterRuntime(book);
  assert.equal(runtime.import(text).status,'READY','Known quantities cannot require an invented bearer');
  const snapshot=runtime.snapshot(),unit=snapshot.units[0],negative=snapshot.units[1];
  assert.equal(unit.canonicalUnitId,'unit-'+slug);
  assert.notEqual(unit.instanceId,negative.instanceId);
  for(const id of [`datasheet-${slug}:wargear:1`,`datasheet-${slug}:wargear:2`]) {
    const selections=unit.selections.filter(item=>item.canonicalEquipmentIds.includes(id));
    assert.equal(selections.length,1);
    assert.equal(selections[0].physicalQuantity,1);
    assert.equal(selections[0].quantityEvidence.scope,'UNIT');
    assert.equal(selections[0].perModelQuantity,null);
    assert.ok(selections[0].sourceReferences.some(ref=>ref.entityId===id&&ref.path==='/text'));
  }
  assert.ok(unit.modelRows.every(row=>row.selections.length===0&&row.loadouts.length===0),
    'Aggregate equipment must not be assigned to an arbitrary MODEL row');
  const effective=runtime.effective(unit.instanceId),other=runtime.effective(negative.instanceId);
  assert.equal(effective.unitMetrics.chargeRoll.modifier,1);
  assert.ok(effective.profiles.every(profile=>profile.fields.find(field=>field.label==='LD').value==='6+'));
  assert.equal(other.unitMetrics?.chargeRoll,undefined);
  const baseline=createDGRosterRuntime(book);
  assert.equal(baseline.import(header+bare+'\n'+bare).status,'READY');
  assert.deepEqual(other.profiles,baseline.effective(negative.instanceId).profiles.map(profile=>({
    ...profile,modelInstanceId:other.profiles.find(p=>p.scopeId===profile.scopeId).modelInstanceId
  })), 'Equipment must not leak to a separate physical UNIT');
  const restored=createDGRosterRuntime(book);
  restored.load(snapshot);
  assert.deepEqual(restored.projection,runtime.projection);
  assert.equal(runtime.import(header+bare+'\n'+bare).status,'READY');
  assert.equal(runtime.effective(unit.instanceId).unitMetrics?.chargeRoll,undefined);
  assert.equal(runtime.import(text).status,'READY');
  assert.deepEqual(runtime.snapshot(),snapshot,'Reimport must preserve canonical and physical identities');
  controls++;
}
assert.deepEqual(book,original,'Import must not change canonical facts');
console.log(JSON.stringify({status:'PASS',aggregateEquipmentCases:controls,knownQuantities:true,
  modelBearerNotInvented:true,unitRecipients:true,instanceIsolation:true,removeReimportRecompute:true}));

/** Fixed QA oracle: the reviewed 68 BUILT owner identities before d53656ad,
 * plus Mark of the Soul Forges, independently confirmed against accepted raw
 * Wahapedia and critical-hit-source-expectations.json. Never derive this list
 * from the current compiler/runtime, and never regenerate it to accept drift. */
import assert from 'node:assert/strict';

const reviewedBuiltIds=[
  'army-rule-cult-of-the-dark-gods',
  'datasheet-abaddon-the-despoiler:section:3',
  'datasheet-abaddon-the-despoiler:section:4',
  'datasheet-chaos-lord-in-terminator-armour:section:3',
  'datasheet-chaos-lord-with-jump-pack:section:3',
  'datasheet-chaos-lord:section:3',
  'datasheet-cultist-firebrand:section:3',
  'datasheet-dark-apostle:section:3',
  'datasheet-dark-commune:section:1:block:0:text',
  'datasheet-dark-commune:section:3',
  'datasheet-fabius-bile:section:1:block:0:text',
  'datasheet-fabius-bile:section:3',
  'datasheet-haarken-worldclaimer:section:3',
  'datasheet-helbrute:section:1:block:1:text',
  'datasheet-heretic-astartes-daemon-prince-with-wings:section:3',
  'datasheet-heretic-astartes-daemon-prince-with-wings:section:3:option:1',
  'datasheet-heretic-astartes-daemon-prince-with-wings:section:3:option:2',
  'datasheet-heretic-astartes-daemon-prince-with-wings:section:3:option:3',
  'datasheet-heretic-astartes-daemon-prince-with-wings:section:3:option:4',
  'datasheet-heretic-astartes-daemon-prince:section:3',
  'datasheet-heretic-astartes-daemon-prince:section:3:option:1',
  'datasheet-heretic-astartes-daemon-prince:section:3:option:2',
  'datasheet-heretic-astartes-daemon-prince:section:3:option:3',
  'datasheet-heretic-astartes-daemon-prince:section:3:option:4',
  'datasheet-huron-blackheart:section:3',
  'datasheet-kravek-morne:section:3',
  'datasheet-master-of-executions:section:3',
  'datasheet-master-of-possession:section:1:block:0:text',
  'datasheet-master-of-possession:section:3',
  'datasheet-masters-of-the-maelstrom:section:3',
  'datasheet-nemesis-claw:section:3',
  'datasheet-red-corsairs-raiders:section:3',
  'datasheet-red-corsairs-reave-captain:section:3',
  'datasheet-sorcerer-in-terminator-armour:section:3',
  'datasheet-sorcerer:section:3',
  'datasheet-traitor-enforcer:section:1:block:1:text',
  'datasheet-traitor-enforcer:section:3',
  'datasheet-warpsmith:section:3',
  'detachment-cabal-of-chaos:enhancement:1',
  'detachment-cabal-of-chaos:enhancement:2',
  'detachment-chaos-cult:enhancement:4',
  'detachment-chaos-cult:rule',
  'detachment-creations-of-bile:enhancement:1',
  'detachment-creations-of-bile:enhancement:2',
  'detachment-creations-of-bile:enhancement:4',
  'detachment-cult-of-the-arkifane:enhancement:2',
  'detachment-cult-of-the-arkifane:enhancement:3',
  'detachment-cult-of-the-arkifane:enhancement:4',
  'detachment-cult-of-the-arkifane:rule',
  'detachment-deceptors:enhancement:1',
  'detachment-deceptors:enhancement:3',
  'detachment-devotees-of-destruction:rule',
  'detachment-dread-talons:enhancement:2',
  'detachment-fellhammer-siege-host:enhancement:2',
  'detachment-huron-s-marauders:enhancement:4',
  'detachment-murdertalon-raiders:enhancement:1',
  'detachment-murdertalon-raiders:enhancement:2',
  'detachment-nightmare-hunt:enhancement:1',
  'detachment-nightmare-hunt:enhancement:4',
  'detachment-pactbound-zealots:enhancement:2',
  'detachment-pactbound-zealots:enhancement:4',
  'detachment-pactbound-zealots:rule',
  'detachment-renegade-raiders:enhancement:3',
  'detachment-renegade-raiders:rule',
  'detachment-renegade-warband:enhancement:2',
  'detachment-renegade-warband:enhancement:4',
  'detachment-renegade-warband:rule',
  'detachment-soulforged-warpack:enhancement:2',
  'detachment-warpstrike-champions:enhancement:4'
];
function assertOwnerIds(ids) {
  assert.equal(ids.length,69,'Reviewed BUILT owner census changed');
  assert.equal(new Set(ids).size,69,'Duplicate reviewed BUILT owner');
  assert.deepEqual(new Set(ids),new Set(reviewedBuiltIds),'Reviewed BUILT owner identity changed');
}

export function assertReviewedBuiltInventory(built) {
  const ids=[...built.classifications.values()].filter(row=>row.status==='BUILT').map(row=>row.ruleId);
  const verify=(owners,declarations)=>{
    assertOwnerIds(owners);
    for(const id of reviewedBuiltIds)assert.ok(declarations.get(id),'Missing reviewed executable contract: '+id);
  };
  verify(ids,built.declarations);
  // Exercise the same assertions on disposable diagnostic inputs. A stable
  // total alone cannot accept a replacement identity or a missing declaration.
  assert.throws(()=>verify(ids.slice(1),built.declarations),assert.AssertionError);
  assert.throws(()=>verify([...ids.slice(0,-1),ids[0]],built.declarations),assert.AssertionError);
  assert.throws(()=>verify(['qa-unknown-owner',...ids.slice(1)],built.declarations),assert.AssertionError);
  const missing=new Map(built.declarations);
  missing.delete('detachment-cult-of-the-arkifane:enhancement:3');
  assert.throws(()=>verify(ids,missing),assert.AssertionError);
  return {owners:69,exactIdentities:true,missingDuplicateWrongIdentityAndMissingContractRejected:true,mutationsDetected:4};
}

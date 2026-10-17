/** Source-backed New Recruit inputs for the runtime integration census.
 * Canonical fixture planning chooses identities only. No synthetic physical
 * state is returned: every loadout/option below passes through text import.
 */
import assert from 'node:assert/strict';
import {buildCSMContracts} from './rule-contract-build.mjs';
import {buildCSMRosterEffectBook,executableClauses} from './roster-effect-build.mjs';
import {clauseFixture} from './roster-effect-fixture.mjs';
import {buildImportBindings} from './roster-import-bindings.mjs';
import {buildCSMImportBook} from './roster-import-build.mjs';

// Reviewed canonical equipment from each source's Unit Composition. Rows are
// canonical composition members, not flattened statlines. Helbrute's two
// replacement melee weapons are an explicit legal selected option.
const selectedWeapons={
  'unit-dark-apostle':[[1,2],[3]],
  'unit-master-of-possession':[[1,2,3,4]],
  'unit-legionaries':[[2,3,18],[2,3,18]],
  'unit-chaos-lord':[[1,2,5]],
  'unit-chaos-lord-with-jump-pack':[[1,4]],
  'unit-raptors':[[1,9],[1,9]],
  'unit-chaos-lord-in-terminator-armour':[[1,4]],
  'unit-chaos-terminator-squad':[[1,5],[1,5]],
  'unit-traitor-guardsmen-squad':[[2,12],[7,12]],
  'unit-accursed-cultists':[[2],[1]],
  'unit-chaos-rhino':[[1,4]],
  'unit-warpsmith':[[1,2,3,4,5]],
  'unit-heretic-astartes-daemon-prince':[[1,2,3]],
  'unit-heretic-astartes-daemon-prince-with-wings':[[1,2,3]],
  'unit-havocs':[[2,15],[3,5,16]],
  'unit-dark-commune':[[1,6],[2,3,4],[1,4],[5]],
  'unit-traitor-enforcer':[[1,3],[2]],
  'unit-fabius-bile':[[1,2,3],[4]],
  'unit-helbrute':[[10,11,12]]
};

export function buildImportedEffectFixtures(book=buildCSMRosterEffectBook(),built=buildCSMContracts()) {
  const records=new Map(book.entities.map(entity=>[entity.id,entity]));
  const importBindings=buildImportBindings(buildCSMImportBook());
  const weaponNames=(unitId,ordinals)=>{
    const unit=records.get(unitId),ids=ordinals.map(ordinal=>`${unitId.replace(/^unit-/,'datasheet-')}:weapon:${ordinal}`);
    ids.forEach(id=>assert.ok(unit.data.weaponIds.includes(id),'Unknown fixture weapon: '+id));
    const consumed=new Set(),names=[];
    for(const id of ids) {
      if(consumed.has(id))continue;
      const family=importBindings.weaponSelections.find(binding=>binding.ownerId===unitId&&binding.canonicalProfileIds.includes(id));
      if(family){assert.ok(family.canonicalProfileIds.every(profileId=>ids.includes(profileId)),'Partial physical weapon family');
        names.push(family.label);family.canonicalProfileIds.forEach(profileId=>consumed.add(profileId));}
      else {names.push(records.get(id).data.name);consumed.add(id);}
    }
    return names;
  };
  function unitBlock(unitId,{enhancementId,markId,upgradeIds=[]}={}) {
    const unit=records.get(unitId),profiles=unit.data.profileIds.map(id=>records.get(id));
    assert.equal(selectedWeapons[unitId]?.length,profiles.length,'Missing source-backed fixture loadout: '+unitId);
    const quantity=profiles.reduce((sum,profile)=>sum+profile.data.composition.quantity.min,0);
    // Explicit canonical minimum-composition points row for lexical import.
    // Cost/disposition applicability is not an effect execution prerequisite.
    const points=records.get(`${unitId.replace(/^unit-/,'datasheet-')}:mfm:points:0:0`);
    assert.ok(points?.kind==='POINTS_SCHEDULE_ROW'&&quantity===points.data.minModels,'Missing source fixture points row');
    const lines=[`${quantity}x ${unit.displayName} (${points.data.value} pts)`];
    if(enhancementId)lines.push(`Enhancement: ${records.get(enhancementId).displayName}`);
    if(markId)lines.push(`Mark: ${records.get(markId).data.keyword}`);
    for(const upgradeId of upgradeIds){const option=records.get(upgradeId);
      assert.equal(option.kind,'UPGRADE_OPTION');
      // The typed import vocabulary owns this explicit input label.
      const binding=importBindings.optionSelections.find(binding=>binding.canonicalOptionId===upgradeId&&binding.label.startsWith('Daemonic Allegiance:'));
      assert.ok(binding,'Missing canonical option import vocabulary');lines.push(binding.label);
    }
    profiles.forEach((profile,index)=>{
      const count=profile.data.composition.quantity.min;
      let loadout=weaponNames(unitId,selectedWeapons[unitId][index]).join(', ');
      if(unitId==='unit-dark-commune'&&index===2)loadout+=', Chaos icon';
      if(unitId==='unit-havocs'&&index===1)loadout='2 with Havoc autocannon, Close combat weapon\n2 with Havoc lascannon, Close combat weapon';
      lines.push(`• ${count}x ${profile.data.composition.name}: ${loadout}`);
    });
    return lines.join('\n');
  }
  const fixtures=executableClauses(built).map(({rule,clause})=>{
    // Existing canonical fixture is a selector witness only; its synthetic
    // inventories and physical state never become execution input.
    const witness=clauseFixture(book,rule.id,clause.id),source=witness.state.units[0];
    const units=witness.state.units.map((unit,index)=>({canonicalUnitId:unit.canonicalUnitId,
      ordinal:index+1,profileIds:[...records.get(unit.canonicalUnitId).data.profileIds]}));
    const text=['+ FACTION KEYWORD: Chaos - Chaos Space Marines',
      `+ DETACHMENT: ${records.get(witness.state.detachmentIds[0]).displayName}`,
      ...units.map((unit,index)=>unitBlock(unit.canonicalUnitId,index===0?{
        enhancementId:rule.kind==='ENHANCEMENT'?rule.id:undefined,
        markId:source.selectedMarkId,upgradeIds:source.selectedUpgradeIds||[]}:
        source.selectedMarkId?{markId:source.selectedMarkId}:{})),
      'Created with newrecruit.eu'].join('\n\n')+'\n';
    const ordinal=id=>witness.state.units.findIndex(unit=>unit.instanceId===id)+1;
    const attachments=witness.state.attachments.map(edge=>({leaderOrdinal:ordinal(edge.leaderInstanceId),
      bodyguardOrdinal:ordinal(edge.bodyguardInstanceId),role:edge.role}));
    const sourceFields=clause.sourceFields||[];
    return {id:`${rule.id}::${clause.id}`,owner:rule.id,clauseId:clause.id,text,
      sourceCanonicalUnitId:source.canonicalUnitId,sourceOrdinal:1,
      bearerProfileId:witness.profileId,
      sourceEvidence:structuredClone(rule.provenance.sourceEvidence),
      sourceClause:structuredClone(clause.evidence),sourceFields:structuredClone(sourceFields),
      units,attachments,
      ...(source.canonicalUnitId==='unit-fabius-bile'?{initialAttachments:structuredClone(attachments)}:{}),
      expectedOperations:witness.clause.rosterEffects.map(effect=>({operation:effect.operation,
        targetBinding:effect.targetBinding,targetSubject:effect.targetSubject,
        ...(effect.unitScope?{unitScope:effect.unitScope}:{}),
        conditions:structuredClone(effect.conditions),
        ...(effect.recipientSelectors?{recipientSelectors:structuredClone(effect.recipientSelectors)}:{}),
        ...(effect.equipmentRequirement?{equipmentRequirement:structuredClone(effect.equipmentRequirement)}:{}),
        ...(effect.field?{field:effect.field}:{}),
        ...(effect.mode?{mode:effect.mode}:{}),
        ...(effect.value!==undefined?{value:effect.value}:{}),
        ...(effect.ability?{ability:structuredClone(effect.ability)}:{}),
        ...(effect.keyword?{keyword:effect.keyword}:{}),
        ...(effect.weaponProfileIds?{weaponProfileIds:structuredClone(effect.weaponProfileIds)}:{})}))};
  });
  assert.equal(fixtures.length,61);assert.equal(new Set(fixtures.map(fixture=>fixture.id)).size,61);
  return fixtures;
}

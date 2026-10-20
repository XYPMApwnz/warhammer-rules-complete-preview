/** Source-reviewed SM bridges into the existing central MFM owner. Prices are
 * never copied into Army facts. Only resolved physical selections are charged;
 * neither a Datasheet nor a permission to select equipment proves a purchase. */
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {createEffectiveMfmCatalog} from '../../../mfm/content/effective-mfm-catalog.mjs';
import {verifyFrozenSource} from '../../shared/tools/source-ingestion-contract.mjs';

const read=name=>JSON.parse(fs.readFileSync(new URL(name,import.meta.url),'utf8'));
const clone=structuredClone;
// Persistent identities were checked against the accepted source occurrences,
// replacement clauses, equipment FIELDs and weapon tables, not title equality.
export const paidOptionReview=[
 {costRecordId:'mfm-paid-upgrade-1d8e8976d73dd2f9',ownerUnitId:'unit-sm-4fce70f042cc4e5d',
  equipmentIds:['ability-sm-7d0c729bd52143f9'],profileIds:[],permissionIds:['wargear-sm-cd90e4283b8e432b'],
  quote:'Orbital Comms Array: This unit has Scouts 6".',sourceId:'ability-sm-7d0c729bd52143f9',
  permissionQuote:'- 1 Orbital Comms Array'},
 {costRecordId:'mfm-paid-upgrade-2dcc41d973fb7e5a',ownerUnitId:'unit-sm-c50655aacb564e99',
  equipmentIds:[],profileIds:['weapon-sm-c56f6f2721ea428f'],permissionIds:['wargear-sm-00996158d0fb4df9','wargear-sm-a296b61955b24235'],
  quote:'Vengor Launcher',sourceId:'weapon-sm-c56f6f2721ea428f',permissionQuote:'replaced with 1 Vengor Launcher.'},
 {costRecordId:'mfm-paid-upgrade-49288d49d083d7cb',ownerUnitId:'unit-sm-9e163be8d4bb42c1',
  equipmentIds:[],profileIds:['weapon-sm-13e588f9280049e2','weapon-sm-93d22368d6294364'],permissionIds:['wargear-sm-17a70d8a896947a4'],
  quote:'Cyclone Missile Launcher - Krak',sourceId:'weapon-sm-13e588f9280049e2',
  permissionQuote:'- 1 Cyclone Missile Launcher and 1 Storm Bolter (that model’s Storm Bolter cannot be replaced).'},
 {costRecordId:'mfm-paid-upgrade-5acd905379273046',ownerUnitId:'unit-sm-f169827c554c4eee',
  equipmentIds:['ability-sm-c227c53a84a34dc1'],profileIds:[],permissionIds:['section-sm-4334b98b158d4b00'],
  quote:'Banner of Macragge:',sourceId:'ability-sm-c227c53a84a34dc1',
  permissionContentPointer:'/html/body/div/div[1]/div[3]/div[2]/div[28]/div[2]/div[2]/div[6]',
  permissionQuote:'The Chapter Ancient is equipped with: Banner of Macragge; 1 Master-crafted Bolt Carbine; 1 Master-crafted Power Weapon.'},
 {costRecordId:'mfm-paid-upgrade-77bc7dc58d636b7a',ownerUnitId:'unit-sm-56eaa095b0ae4fe4',
  equipmentIds:[],profileIds:['weapon-sm-778f4e36a2544f2a'],permissionIds:['wargear-sm-eb97c781a1294c89'],
  quote:'Multi-melta',sourceId:'weapon-sm-778f4e36a2544f2a',permissionQuote:'replaced with 1 Multi-melta.'},
 {costRecordId:'mfm-paid-upgrade-ccbd208631bacc48',ownerUnitId:'unit-sm-32e5b655a21342f6',
  equipmentIds:[],profileIds:['weapon-sm-5de08c6a8aad4588','weapon-sm-cfc9419c58f749a4'],permissionIds:['wargear-sm-cd58de47865c4207'],
  quote:'Macro Plasma Incinerator - Supercharge',sourceId:'weapon-sm-5de08c6a8aad4588',permissionQuote:'replaced with 1 Macro Plasma Incinerator.'},
 {costRecordId:'mfm-paid-upgrade-f0d7680f02efab10',ownerUnitId:'unit-sm-d0a8c043f5c24b22',
  equipmentIds:[],profileIds:['weapon-sm-f278280d6fb141c7'],permissionIds:['wargear-sm-14e43563c2ca43a2'],
  quote:'Heavy Laser Destroyer',sourceId:'weapon-sm-f278280d6fb141c7',
  permissionQuote:'- This model’s Heavy Laser Destroyer can be replaced with 1 Macro Plasma Incinerator.'},
 {costRecordId:'mfm-paid-upgrade-fe9bdd5878ada46f',ownerUnitId:'unit-sm-5ce71f2f4e5e4ebb',
  equipmentIds:['ability-sm-aa81f0067a3140de'],profileIds:[],permissionIds:['wargear-sm-14b80efc614444a4'],
  quote:'Storm Shield: This model has +1 W.',sourceId:'ability-sm-aa81f0067a3140de',
  permissionQuote:'- Any number of models can each have their Twin Lightning Claws replaced with 1 Storm Shield and 1 Thunder Hammer.'}
];

export function createSpaceMarinesPaidOptionBindings({facts=read('./generated/effective.json'),catalog=createEffectiveMfmCatalog().catalog}={}){
 const entities=new Map(facts.entities.map(row=>[row.id,row])),hashes=new Map();
 const snapshot=catalog.sourceSnapshots.find(row=>row.sourceId==='space-marines-mfm-v1.6');
 assert.ok(snapshot,'Missing accepted MFM source');
 const captureBytes=fs.readFileSync(new URL('../../../'+snapshot.sourcePath,import.meta.url));
 const verification=verifyFrozenSource(snapshot.sourceId,{repoRoot:fileURLToPath(new URL('../../../',import.meta.url))});
 assert.equal(verification.aggregateArtifactHash,snapshot.acceptedArtifactHash,'Accepted MFM capture changed');
 const capture=JSON.parse(captureBytes);
 const factsById=new Map(catalog.paidUpgradeRecords.map(row=>[row.id,row]));
 const actual=catalog.paidUpgradeRecords.filter(row=>row.factionId==='space-marines'&&row.provenance.sourceId==='space-marines-mfm-v1.6');
 assert.deepEqual(actual.map(row=>row.id).sort(),paidOptionReview.map(row=>row.costRecordId).sort(),'Paid option review incomplete');
 const prove=entity=>{
  assert.ok(entity,'Missing canonical paid option proof');
  const proof=entity.provenance;
  assert.equal(proof.sourceId,'space-marines-waha-11e-2026-10-20');
  if(!hashes.has(proof.document))hashes.set(proof.document,createHash('sha256').update(fs.readFileSync(new URL('../../../'+proof.document,import.meta.url))).digest('hex').toUpperCase());
  assert.equal(hashes.get(proof.document),proof.sha256,'Paid option source changed');
  return clone(proof);
 };
 return paidOptionReview.map(review=>{
  const cost=factsById.get(review.costRecordId),unit=entities.get(review.ownerUnitId),source=entities.get(review.sourceId);
  assert.equal(unit?.kind,'DATASHEET');assert.equal(source?.parentId,unit.id);
  assert.ok((source.data.text||source.data.name).includes(review.quote),'Paid option source clause changed');
  const unitReference=catalog.unitReferences.find(row=>row.id===cost.unitReferenceId);
  assert.equal(unitReference?.armyBinding?.bindingStatus,'BOUND');assert.equal(unitReference.armyBinding.armyUnitId,unit.id);
  assert.equal(cost.factionId,'space-marines');assert.equal(cost.provenance.sourceVersion,'v1.6');
  assert.equal(cost.provenance.sourceId,'space-marines-mfm-v1.6');assert.ok(Number.isFinite(cost.value)&&cost.value>=0);
  const locator=cost.provenance.sourceLocator,sourceUnit=capture.units.find(row=>row.title===locator.sourceTitle);
  const sourcePrice=sourceUnit?.paidOptions?.find(row=>row.sourceGroup===locator.sourceGroup&&row.sourceLabel===locator.sourceLabel);
  assert.ok(sourcePrice,'Missing accepted MFM paid option occurrence');assert.equal(cost.value,sourcePrice.value,'Paid price differs from accepted MFM source');
  const permissions=review.permissionIds.map(id=>{const row=entities.get(id);assert.equal(row?.parentId,unit.id);assert.ok(row.data.text.includes(review.permissionQuote));return {id,quote:review.permissionQuote,provenance:prove(row),...(review.permissionContentPointer?{sourceContentPointer:review.permissionContentPointer}:{})};});
  const profiles=review.profileIds.map(id=>{const row=entities.get(id);assert.equal(row?.kind,'WEAPON_PROFILE');assert.equal(row.parentId,unit.id);return {id,provenance:prove(row)};});
  const equipment=review.equipmentIds.map(id=>{const row=entities.get(id);assert.equal(row?.parentId,unit.id);assert.equal(row.data.wargearAbility,true);return {id,fieldPath:'/text',provenance:prove(row)};});
  return {...clone(review),value:cost.value,label:cost.label,provenance:clone(cost.provenance),
   sourceProvenance:prove(source),permissions,profiles,equipment,
   quantityBasis:'PHYSICAL_SELECTION',alternativeProfilesOnePurchase:review.profileIds.length>1,
   exportEvidence:'CONSTRUCTED_ONLY_REAL_NEW_RECRUIT_EXPORT_NOT_PROVEN'};
 });
}

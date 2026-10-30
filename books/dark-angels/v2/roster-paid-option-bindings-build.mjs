import {parseProducerJSON,prepareSourceProducer} from '../../shared/source-refs-v2/producer-io.mjs';
/** Physical purchase bridges; central MFM remains the sole numeric owner. */
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {createEffectiveMfmCatalog} from '../../../mfm/content/effective-mfm-catalog.mjs';
import {verifyFrozenSource} from '../../shared/tools/source-ingestion-contract.mjs';
import {createSpaceMarinesPaidOptionBindings} from '../../space-marines/v2/roster-paid-option-bindings-build.mjs';

const read=name=>parseProducerJSON(fs.readFileSync(new URL(name,import.meta.url),'utf8'));
const clone=structuredClone;
const cyclone={costRecordId:'mfm-paid-upgrade-3c211afc5aea6e89',ownerUnitId:'unit-da-9f8f2ccbdb7d4c72857c',
 equipmentIds:[],profileIds:['weapon-da-9dbed74da29b40e0a872','weapon-da-f42a813127b24522bedd'],
 permissionIds:['wargear-da-84b413422f4243e79aba'],sourceId:'weapon-da-9dbed74da29b40e0a872',
 quote:'Cyclone Missile Launcher - Krak',
 permissionQuote:'1 Storm Bolter and 1 Cyclone Missile Launcher (that model’s Storm Bolter cannot be replaced)'};

export function createDarkAngelsPaidOptionBindings({book=read('./generated/mixed-owner-book.json'),
 facts=read('./generated/effective.json'),catalog=createEffectiveMfmCatalog().catalog}={}){
  book=prepareSourceProducer(book);
 assert.equal(book.bookId,'dark-angels');
 const admitted=new Set(book.entities.filter(row=>row.kind==='DATASHEET').map(row=>row.id));
 const shared=createSpaceMarinesPaidOptionBindings({catalog}).filter(row=>admitted.has(row.ownerUnitId));
 assert.equal(shared.length,7,'Unexpected inherited paid option membership');
 const entities=new Map(facts.entities.map(row=>[row.id,row]));
 const owner=entities.get(cyclone.ownerUnitId),source=entities.get(cyclone.sourceId);
 assert.ok(admitted.has(owner?.id),'Missing DA paid option recipient');
 assert.equal(owner.kind,'DATASHEET');assert.equal(owner.bookId,'dark-angels');
 const prove=row=>{
  assert.ok(row,'Missing DA physical paid option proof');assert.equal(row.bookId,'dark-angels');
  assert.equal(row.provenance.sourceId,'dark-angels-waha-11e-2026-10-21');
  assert.equal(createHash('sha256').update(fs.readFileSync(new URL('../../../'+row.provenance.document,import.meta.url))).digest('hex').toUpperCase(),row.provenance.sha256);
  return clone(row.provenance);
 };
 prove(owner);assert.equal(source?.parentId,owner.id);assert.equal(source.data.name,cyclone.quote);
 const profiles=cyclone.profileIds.map(id=>{
  const row=entities.get(id);assert.equal(row?.kind,'WEAPON_PROFILE');assert.equal(row.parentId,owner.id);
  return {id,provenance:prove(row)};
 });
 assert.equal(entities.get(cyclone.profileIds[1]).data.name,'Cyclone Missile Launcher - Frag');
 const permissions=cyclone.permissionIds.map(id=>{
  const row=entities.get(id);assert.equal(row?.kind,'WARGEAR_OPTION');assert.equal(row.parentId,owner.id);
  assert.ok(row.data.text.includes(cyclone.permissionQuote),'Missing reviewed Cyclone replacement permission');
  return {id,quote:cyclone.permissionQuote,provenance:prove(row)};
 });
 const snapshot=catalog.sourceSnapshots.find(row=>row.sourceId==='dark-angels-mfm-v1.6'&&!row.historical);
 assert.ok(snapshot,'Missing active DA MFM v1.6');
 const verified=verifyFrozenSource(snapshot.sourceId,{repoRoot:fileURLToPath(new URL('../../../',import.meta.url))});
 assert.equal(verified.aggregateArtifactHash,snapshot.acceptedArtifactHash);
 const capture=read('../../../'+snapshot.sourcePath),cost=catalog.paidUpgradeRecords.find(row=>row.id===cyclone.costRecordId);
 assert.equal(cost?.factionId,'dark-angels');assert.equal(cost.provenance.sourceId,snapshot.sourceId);
 assert.equal(cost.provenance.sourceVersion,'v1.6');
 const reference=catalog.unitReferences.find(row=>row.id===cost.unitReferenceId);
 assert.equal(reference?.armyBinding?.bindingStatus,'BOUND');assert.equal(reference.armyBinding.armyUnitId,owner.id);
 const locator=cost.provenance.sourceLocator;
 assert.equal(locator.sourceTitle,'DEATHWING TERMINATOR SQUAD');assert.equal(locator.sourceGroup,'WARGEAR OPTIONS');
 assert.equal(locator.sourceLabel,'per Cyclone Missile Launcher');
 const rawUnit=capture.units.find(row=>row.title===locator.sourceTitle);
 const rawPrice=rawUnit?.paidOptions?.find(row=>row.sourceGroup===locator.sourceGroup&&row.sourceLabel===locator.sourceLabel);
 assert.ok(rawPrice,'Missing official DA Cyclone paid option');assert.equal(cost.value,rawPrice.value,'DA Cyclone price differs from accepted MFM');
 assert.ok(Number.isFinite(cost.value)&&cost.value>=0);
 return [...shared,{...clone(cyclone),value:cost.value,label:cost.label,provenance:clone(cost.provenance),
  sourceProvenance:prove(source),permissions,profiles,equipment:[],quantityBasis:'PHYSICAL_SELECTION',
  alternativeProfilesOnePurchase:true,exportEvidence:'CONSTRUCTED_ONLY_REAL_NEW_RECRUIT_EXPORT_NOT_PROVEN'}];
}

/** Reuse proven central SM purchase identities through closed BA membership.
 * No BA numeric owner, aliases or duplicate MFM records are created. */
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createSpaceMarinesPaidOptionBindings} from '../../space-marines/v2/roster-paid-option-bindings-build.mjs';
export function createBloodAngelsPaidOptionBindings({book=JSON.parse(fs.readFileSync(new URL('./generated/mixed-owner-book.json',import.meta.url),'utf8'))}={}){
 assert.equal(book.bookId,'blood-angels');
 const index=new Map(book.entities.map(e=>[e.id,e]));
 const admitted=new Set(book.entities.filter(e=>e.kind==='DATASHEET').map(e=>e.id));
 const bindings=createSpaceMarinesPaidOptionBindings().filter(row=>admitted.has(row.ownerUnitId));
 assert.equal(bindings.length,7,'Unexpected inherited paid-option membership');
 for(const binding of bindings){
  assert.equal(index.get(binding.ownerUnitId)?.bookId,'space-marines');
  const member=book.canonicalMembership.find(row=>row.id===binding.ownerUnitId);
  assert.equal(member?.bookId,'space-marines');
  for(const id of [...binding.profileIds,...binding.equipmentIds,...binding.permissionIds]){
   const entity=index.get(id);assert.equal(entity?.parentId,binding.ownerUnitId,'Foreign physical purchase proof');
   assert.equal(entity.bookId,'space-marines');
  }
  assert.equal(binding.provenance.sourceId,'space-marines-mfm-v1.6');
 }
 // Opt-in source-reviewed slot proof. Imported omission never selects the
 // default weapon; a positive occurrence of its exclusive alternative proves
 // this paid purchase absent. Other paid bindings retain their existing policy.
 const redemptor=bindings.find(row=>row.costRecordId==='mfm-paid-upgrade-ccbd208631bacc48');
 assert.equal(redemptor?.ownerUnitId,'unit-sm-32e5b655a21342f6');
 const permission=index.get('wargear-sm-cd58de47865c4207'),unpaid=index.get('weapon-sm-4ba707edc43c44f6');
 const quote='This model’s Heavy Onslaught Gatling Cannon can be replaced with 1 Macro Plasma Incinerator.';
 assert.equal(permission?.parentId,redemptor.ownerUnitId);assert.ok(permission.data.text.includes(quote));
 assert.equal(unpaid?.kind,'WEAPON_PROFILE');assert.equal(unpaid.parentId,redemptor.ownerUnitId);
 assert.equal(unpaid.data.name,'Heavy Onslaught Gatling Cannon');
 assert.equal(unpaid.provenance.sha256,permission.provenance.sha256);
 redemptor.selectionResolution={kind:'EXCLUSIVE_PAID_WEAPON_SLOT',unpaidProfileIds:[unpaid.id],
  permissionId:permission.id,quote,sourceProvenance:structuredClone(permission.provenance),
  unpaidSourceProvenance:structuredClone(unpaid.provenance)};
 return structuredClone(bindings);
}

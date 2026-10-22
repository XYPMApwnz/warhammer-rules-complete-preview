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
 return structuredClone(bindings);
}

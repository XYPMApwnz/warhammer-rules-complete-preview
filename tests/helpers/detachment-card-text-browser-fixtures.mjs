/** Public saved-roster fixtures. No runtime or validation bypass. */
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {detachmentBookFiles,detachmentSnapshot} from './detachment-card-text-fixtures.mjs';

const read=async url=>({ok:true,json:async()=>JSON.parse(fs.readFileSync(url,'utf8'))});
export async function createDetachmentBrowserFixture(spec){
  assert(Object.hasOwn(detachmentBookFiles,spec.bookId),'Unknown literal fixture book');
  const book=JSON.parse(fs.readFileSync(new URL(`../../books/${spec.bookId}/v2/generated/${detachmentBookFiles[spec.bookId]}.json`,import.meta.url),'utf8'));
  // Browser actions exercise attaching explicitly; the saved setup is detached.
  const snapshot=detachmentSnapshot(book,{...spec,attachment:undefined});
  for(const expected of spec.units)if(expected.browserModelRows){
    const unit=snapshot.units.find(unit=>unit.instanceId===expected.instanceId);
    assert.equal(expected.browserModelRows.reduce((sum,row)=>sum+row.quantity,0),unit.startingStrength);
    unit.modelRows=expected.browserModelRows.map(row=>{
      const source=book.importBindings.compositions.find(member=>member.id===row.compositionMemberId);
      assert(source&&source.ownerId===unit.canonicalUnitId&&source.profileId===row.canonicalProfileId,
        'Literal browser MODEL must match one accepted composition record');
      assert(row.quantity>=source.quantity.min&&row.quantity<=source.quantity.max,'Literal physical composition quantity');
      return {...structuredClone(row),selections:[],loadouts:[]};
    });
  }
  // DG's public boot reads global fetch; the other adapters accept injection.
  // The fixture setup is deliberately sequential and restores the caller's IO.
  const previousFetch=globalThis.fetch;globalThis.fetch=read;
  try{
    const service=await (await import(`../../books/${spec.bookId}/v2/roster-boot.mjs`)).createBrowserRoster({fetch:read});
    service.load(snapshot);
    const saved=service.snapshot();
    assert.deepEqual(saved.units.map(unit=>[unit.instanceId,unit.canonicalUnitId,unit.startingStrength]),
      spec.units.map(unit=>[unit.instanceId,unit.unitId,unit.quantity]),'Public load preserves literal UNIT identities and quantities');
    // Revalidation is essential: a normalized public snapshot must also reload.
    service.load(saved);assert.deepEqual(service.snapshot(),saved,'Public saved-roster reload is stable');
    return saved;
  }finally{globalThis.fetch=previousFetch;}
}

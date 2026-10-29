import {parseProducerJSON,prepareSourceProducer} from '../../shared/source-refs-v2/producer-io.mjs';
/** Native attachment permissions over admitted BA/SM source records.
 * The join is the source's exact datasheet hyperlink, never its display label.
 * These are Army-source permissions, not resolutions of central MFM references.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';

const read=path=>parseProducerJSON(fs.readFileSync(new URL(path,import.meta.url),'utf8'));
const clone=structuredClone;
const sourceURL='https://wahapedia.ru/wh40k11ed/factions/space-marines/datasheets.html';

export function buildBloodAngelsAttachmentPolicies(book){
  book=prepareSourceProducer(book);
  assert.equal(book.bookId,'blood-angels','Wrong native attachment domain');
  const owners=[read('./generated/effective.json'),read('../../space-marines/v2/generated/effective.json')];
  const factual=new Map(owners.flatMap(owner=>owner.entities).map(entity=>[entity.id,entity]));
  const index=new Map(book.entities.map(entity=>[entity.id,entity]));
  assert.equal(index.size,book.entities.length,'Ambiguous native canonical identity');
  const admitted=new Map(book.canonicalMembership.map(row=>[row.id,row]));
  const units=book.entities.filter(entity=>entity.kind==='DATASHEET');
  const anchors=new Map(),hashes=new Map();
  const verifySource=entity=>{
    const native=factual.get(entity.id),member=admitted.get(entity.id);
    assert.ok(native&&member,'Source record outside reviewed consumer membership');
    assert.equal(entity.bookId,native.bookId,'Changed source owner');
    assert.equal(member.bookId,native.bookId,'Changed membership owner');
    assert.equal(entity.sourceEntityId,native.sourceEntityId,'Changed source occurrence');
    assert.equal(member.sourceEntityId,native.sourceEntityId,'Changed membership occurrence');
    assert.deepEqual(entity.provenance,native.provenance,'Changed native source provenance');
    const path=native.provenance.document;
    if(!hashes.has(path))hashes.set(path,crypto.createHash('sha256')
      .update(fs.readFileSync(new URL('../../../'+path,import.meta.url))).digest('hex').toUpperCase());
    assert.equal(hashes.get(path),native.provenance.sha256.toUpperCase(),'Accepted raw source changed');
    return native;
  };
  for(const unit of units){
    const native=verifySource(unit),anchor=native.data.sourceAnchor;
    assert.equal(unit.data.sourceAnchor,anchor,'Changed source datasheet anchor');
    assert.ok(typeof anchor==='string'&&anchor.length&&!anchors.has(anchor),'Ambiguous source datasheet address');
    anchors.set(anchor,unit);
  }
  const policies=[],inactive=[],declarations=[];
  for(const relation of book.entities.filter(entity=>entity.kind==='SOURCE_RELATION'&&['LEADER','SUPPORT'].includes(entity.data.role))){
    const native=verifySource(relation),source=index.get(relation.parentId);
    assert.equal(source?.kind,'DATASHEET','Unresolved physical attachment source');
    assert.equal(source.bookId,relation.bookId,'Foreign source relation owner');
    assert.deepEqual(relation.data,native.data,'Changed native attachment declaration');
    assert.equal(relation.parentId,native.parentId,'Changed attachment source parent');
    assert.deepEqual(relation.data.targetSourceAnchors,
      relation.data.sourceReferences.map(reference=>reference.sourceAnchor),'Unpaired source target addresses');
    const row={sourceId:source.id,sourceOwner:source.bookId,sourceDeclarationId:relation.id,
      role:relation.data.role,provenance:clone(relation.provenance),targets:[]};
    for(const reference of relation.data.sourceReferences){
      const href=new URL(reference.href);
      assert.equal(href.origin+href.pathname,sourceURL,'Unreviewed source publication hyperlink');
      assert.equal(decodeURIComponent(href.hash.slice(1)),reference.sourceAnchor,'Changed source target hyperlink');
      const target=anchors.get(reference.sourceAnchor);
      if(!target){
        inactive.push({sourceId:source.id,sourceDeclarationId:relation.id,role:relation.data.role,
          sourceReference:clone(reference),reason:'TARGET_OUTSIDE_REVIEWED_BA_MEMBERSHIP'});
        continue;
      }
      const bound={targetId:target.id,targetOwner:target.bookId,sourceReference:clone(reference),
        targetSourceEntityId:target.sourceEntityId,targetProvenance:clone(target.provenance)};
      assert.notEqual(source.id,target.id,'Self attachment');
      row.targets.push(bound);
      policies.push({sourceId:source.id,targetId:target.id,role:relation.data.role,
        additionalLeaders:0,sourceIds:[relation.id]});
    }
    declarations.push(row);
  }
  assert.equal(new Set(policies.map(row=>row.sourceId+'\0'+row.targetId)).size,policies.length,
    'Ambiguous canonical attachment role');
  return {policies,declarations,inactive,
    authority:'ADMITTED_CANONICAL_ARMY_SOURCE_HYPERLINKS',
    centralMfmReferenceActivation:false,
    coverage:{declarations:declarations.length,activeEdges:policies.length,
      baOwnedEdges:policies.filter(row=>index.get(row.sourceId).bookId==='blood-angels').length,
      inheritedSmEdges:policies.filter(row=>index.get(row.sourceId).bookId==='space-marines').length,
      excludedTargetEdges:inactive.filter(row=>row.reason==='TARGET_OUTSIDE_REVIEWED_BA_MEMBERSHIP').length}};
}

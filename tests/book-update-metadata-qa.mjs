/** A metadata migration must retain the full old factual fingerprint proof. */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {reviewedMfmMetadataChange} from '../books/shared/tools/book-update-metadata.mjs';
const hash=v=>createHash('sha256').update(JSON.stringify(v)).digest('hex').toUpperCase();
const operation={inputRole:'currentMfmRelease',metadataField:'mfmBoundary.sourceVersion',reviewField:'factualFingerprint'};
const old={mfmBoundary:{sourceVersion:'v1.6',valuesCopied:false},entities:[{id:'weapon-qa',data:{strength:'9'}}]},review={factualFingerprint:hash(old),clauses:[{id:'retained-clause',classification:'BATTLE_ONLY'}]};
const next=structuredClone(old);next.mfmBoundary.sourceVersion='v1.7';
const args={facts:next,review,beforeVersion:'v1.6',currentVersion:'v1.7',operation},result=reviewedMfmMetadataChange(args);
assert.equal(result.changed,true);assert.equal(result.before,hash(old));assert.equal(result.after,hash(next));
assert.deepEqual(review.clauses,[{id:'retained-clause',classification:'BATTLE_ONLY'}]);
assert.equal(reviewedMfmMetadataChange({...args,facts:old,currentVersion:'v1.6'}).changed,false);
const weapon=structuredClone(next);weapon.entities[0].data.strength='10';assert.throws(()=>reviewedMfmMetadataChange({...args,facts:weapon}),/rule facts or another field changed/);
const other=structuredClone(next);other.mfmBoundary.valuesCopied=true;assert.throws(()=>reviewedMfmMetadataChange({...args,facts:other}),/rule facts or another field changed/);
assert.throws(()=>reviewedMfmMetadataChange({...args,review:{...review,factualFingerprint:'A'.repeat(64)}}),/rule facts or another field changed/);
assert.throws(()=>reviewedMfmMetadataChange({...args,currentVersion:'v1.8'}),/validated pointer/);
assert.throws(()=>reviewedMfmMetadataChange({...args,operation:{...operation,metadataField:'entities.0.data.strength'}}),/Gameplay fields/);
assert.throws(()=>reviewedMfmMetadataChange({...args,operation:{...operation,reviewField:'clauses'}}),/Unknown reviewed fingerprint/);
console.log(JSON.stringify({status:'PASS',metadataOnly:true,unchangedFactsRemainFullyPinned:true,negativeControls:6}));

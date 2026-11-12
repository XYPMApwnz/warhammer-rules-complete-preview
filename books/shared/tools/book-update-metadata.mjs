/** Mechanical MFM metadata migration; every reviewed factual byte stays pinned. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
const hash=(value,encoding)=>{const valueHash=createHash('sha256').update(JSON.stringify(value)).digest('hex');return encoding==='sha256-json-upper'?valueHash.toUpperCase():valueHash;};
export function reviewedMfmMetadataChange({facts,review,beforeVersion,currentVersion,operation}){
 assert.equal(operation.inputRole,'currentMfmRelease','Unknown metadata input role');
 assert.equal(operation.metadataField,'mfmBoundary.sourceVersion','Gameplay fields cannot be metadata-normalized');
 assert.equal(operation.reviewField,'factualFingerprint','Unknown reviewed fingerprint field');
 assert(['sha256-json-upper','sha256-json-lower'].includes(operation.hashEncoding),'Unknown metadata fingerprint encoding');
 assert.equal(facts.mfmBoundary?.sourceVersion,currentVersion,'Factual MFM version must match the validated pointer');
 const before=review[operation.reviewField],after=hash(facts,operation.hashEncoding);
 assert.match(before,operation.hashEncoding==='sha256-json-upper'?/^[A-F0-9]{64}$/:/^[a-f0-9]{64}$/,'Invalid reviewed factual fingerprint');
 if(before===after)return{changed:false,before,after};
 assert(typeof beforeVersion==='string'&&beforeVersion,'Previous factual MFM version is required');
 const normalized=structuredClone(facts);normalized.mfmBoundary.sourceVersion=beforeVersion;
 assert.equal(hash(normalized,operation.hashEncoding),before,'Metadata pin refused: rule facts or another field changed; explicit source review is required');
 return{changed:true,before,after,beforeVersion,currentVersion,metadataField:operation.metadataField};
}
export function writeReviewedMfmMetadata(file,change,operation){
 if(!change.changed)return;
 const before=fs.readFileSync(file,'utf8'),needle=JSON.stringify(operation.reviewField)+': '+JSON.stringify(change.before);
 assert.equal(before.split(needle).length,2,'Reviewed metadata pin must occur exactly once');
 const after=before.replace(needle,JSON.stringify(operation.reviewField)+': '+JSON.stringify(change.after));
 const old=JSON.parse(before),next=JSON.parse(after);next[operation.reviewField]=old[operation.reviewField];
 assert.deepEqual(next,old,'A metadata pin update cannot change clauses or other review fields');
 fs.writeFileSync(file,after);
}

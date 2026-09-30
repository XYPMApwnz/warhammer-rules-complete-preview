import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const books=['death-guard','adeptus-mechanicus','tyranids','tau-empire','emperors-children','chaos-space-marines'];
const read=relative=>fs.readFileSync(path.join(root,relative));
const json=relative=>JSON.parse(read(relative));
const sha=bytes=>crypto.createHash('sha256').update(bytes).digest('hex').toUpperCase();
const stable=value=>Array.isArray(value)?value.map(stable):value&&typeof value==='object'?Object.fromEntries(Object.keys(value).sort().map(key=>[key,stable(value[key])])):value;
const stableHash=value=>sha(Buffer.from(JSON.stringify(stable(value)),'utf8'));
const allowedForceDispositions=new Set(['RECONNAISSANCE','DISRUPTION','PRIORITY ASSETS','PURGE THE FOE','TAKE AND HOLD']);
const recomputeCounts=capture=>({
  currentUnits:capture.units.filter(unit=>unit.status==='CURRENT').length,
  legendsUnits:capture.units.filter(unit=>unit.status==='LEGENDS').length,
  totalPricedUnits:capture.units.length,
  pointSchedules:capture.units.flatMap(unit=>unit.pointSchedules).length,
  pointRows:capture.units.flatMap(unit=>unit.pointSchedules.flatMap(schedule=>schedule.entries)).length,
  paidOptions:capture.units.flatMap(unit=>unit.paidOptions??[]).length,
  leaderRecords:capture.units.filter(unit=>unit.relations?.leader?.length).length,
  leaderEdges:capture.units.flatMap(unit=>unit.relations?.leader??[]).length,
  supportRecords:capture.units.filter(unit=>unit.relations?.support?.length).length,
  supportEdges:capture.units.flatMap(unit=>unit.relations?.support??[]).length,
  detachments:capture.detachments.length,
  enhancements:capture.detachments.flatMap(detachment=>detachment.enhancements).length,
  detachmentQualifierRecords:capture.detachments.flatMap(detachment=>detachment.qualifiers).length,
  enhancementQualifierRecords:capture.detachments.flatMap(detachment=>detachment.enhancements.flatMap(enhancement=>enhancement.qualifiers)).length
});

const currentness=json('books/shared/sources/mfm-v1.5/currentness.json');
assert.equal(currentness.schema,'warhammer-mfm-currentness-capture/v1');
assert.equal(currentness.version,'v1.5');
assert.equal(currentness.sourceUpdatedAt,'2026-09-30');
assert.equal(currentness.currentnessCutoff,'2026-09-30');
assert.equal(currentness.currentness,'CURRENT');
assert(books.every(book=>currentness.factions.some(item=>item.factionId===book)),'scoped currentness observations are incomplete');
const downloads=read('books/shared/sources/mfm-v1.5/warhammer-40000-downloads.html');
assert.equal(downloads.length,currentness.downloads.rawArtifact.bytes);
assert.equal(sha(downloads),currentness.downloads.rawArtifact.sha256);
const currentnessPayload=structuredClone(currentness);delete currentnessPayload.captureSha256;
assert.equal(stableHash(currentnessPayload),currentness.captureSha256);

const totals={units:0,schedules:0,rows:0,paid:0,leaders:0,leaderEdges:0,support:0,supportEdges:0,detachments:0,enhancements:0,qualifiers:0,multiForce:0};
for(const book of books){
  const capture=json(`books/${book}/sources/official-mfm-v1.5.json`);
  assert.equal(capture.schema,'warhammer-mfm-live-capture/v1');
  assert.equal(capture.factionId,book);assert.equal(capture.version,'v1.5');
  assert.equal(capture.sourceUpdatedAt,'2026-09-30');assert.equal(capture.capturedAt,'2026-09-30');
  assert.equal(capture.currentnessCutoff,'2026-09-30');assert.equal(capture.currentness,'CURRENT');
  assert.equal(capture.authority,'OFFICIAL_GAMES_WORKSHOP_LIVE_MFM');
  const payload=structuredClone(capture);delete payload.captureSha256;assert.equal(stableHash(payload),capture.captureSha256,`${book}: normalized payload fingerprint drift`);
  assert.deepEqual(recomputeCounts(capture),capture.counts,`${book}: declared capture counts drift`);
  const unitKeys=capture.units.map(unit=>`${unit.status}\0${unit.sourceGroup}\0${unit.title}`);assert.equal(new Set(unitKeys).size,unitKeys.length,`${book}: duplicate priced unit source identity`);
  for(const unit of capture.units){
    assert(['CURRENT','LEGENDS'].includes(unit.status));assert(unit.title&&unit.sourceGroup&&unit.pointSchedules.length);
    for(const schedule of unit.pointSchedules){assert(schedule.sourceLabel&&schedule.entries.length);for(const row of schedule.entries)assert(row.sourceLabel&&Number.isInteger(row.value)&&row.value>=0&&Number.isInteger(row.minModels)&&Number.isInteger(row.maxModels));}
    for(const option of unit.paidOptions??[])assert(option.sourceLabel&&option.title&&Number.isInteger(option.value));
  }
  assert.equal(new Set(capture.detachments.map(item=>item.title)).size,capture.detachments.length,`${book}: duplicate Detachment source title`);
  for(const detachment of capture.detachments){
    assert(detachment.title&&Number.isInteger(detachment.detachmentPoints)&&detachment.detachmentPoints>=0);
    assert(Array.isArray(detachment.forceDispositions)&&detachment.forceDispositions.length>0);
    assert.equal(new Set(detachment.forceDispositions).size,detachment.forceDispositions.length,`${book}/${detachment.title}: duplicate Force Disposition`);
    assert(detachment.forceDispositions.every(value=>allowedForceDispositions.has(value)),`${book}/${detachment.title}: unknown Force Disposition`);
    if(detachment.forceDispositions.length>1)totals.multiForce++;
    assert.equal(new Set(detachment.enhancements.map(item=>item.title)).size,detachment.enhancements.length,`${book}/${detachment.title}: duplicate Enhancement source title`);
  }
  for(const artifact of capture.rawArtifacts){const bytes=read(`books/${book}/sources/${artifact.path}`);assert.equal(bytes.length,artifact.bytes);assert.equal(sha(bytes),artifact.sha256);}
  totals.units+=capture.units.length;totals.schedules+=capture.counts.pointSchedules;totals.rows+=capture.counts.pointRows;totals.paid+=capture.counts.paidOptions;
  totals.leaders+=capture.counts.leaderRecords;totals.leaderEdges+=capture.counts.leaderEdges;totals.support+=capture.counts.supportRecords;totals.supportEdges+=capture.counts.supportEdges;
  totals.detachments+=capture.counts.detachments;totals.enhancements+=capture.counts.enhancements;totals.qualifiers+=capture.counts.detachmentQualifierRecords+capture.counts.enhancementQualifierRecords;
}
assert.deepEqual(totals,{units:306,schedules:390,rows:500,paid:18,leaders:70,leaderEdges:169,support:6,supportEdges:23,detachments:63,enhancements:217,qualifiers:11,multiForce:12});
console.log('MFM_SOURCE_CAPTURE_COMPLETION_QA=PASS');
console.log('MFM_V1_5_SCOPED_BOOKS=6');
console.log('MFM_V1_5_MULTI_FORCE_DISPOSITIONS=12');

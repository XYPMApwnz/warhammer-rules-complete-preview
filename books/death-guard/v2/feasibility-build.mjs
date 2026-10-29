import {parseProducerJSON,prepareSourceProducer} from '../../shared/source-refs-v2/producer-io.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {buildAttachmentFeasibility} from '../../shared/roster-v2/compatibility-feasibility.mjs';

/** Normalize accepted composition counts during build, never in a consumer.
 * Current DG has one canonical MODEL profile per datasheet. Mixed-profile
 * composition requires explicit profile bindings instead of a name-based join.
 */
export function buildCompatibilityFeasibility(book) {
  book=prepareSourceProducer(book);
  const source=parseProducerJSON(fs.readFileSync(new URL('../sources/waha-11e-current-2026-09-25/corpus.json',import.meta.url),'utf8'));
  const sourceRecords=new Map(source.datasheets.map(sheet=>[sheet.sourceId,sheet]));
  const composition=[];
  for(const unit of book.entities.filter(e=>e.kind==='DATASHEET')) {
    assert.equal(unit.data.profileIds.length,1,'Mixed MODEL composition needs canonical count bindings: '+unit.id);
    const sheet=sourceRecords.get(unit.provenance.sourceRecordId);
    assert.ok(sheet,'Unresolved accepted composition owner: '+unit.id);
    // Source section labels classify accepted source structure during BUILD.
    // Canonical display titles/text never select or join factual identities.
    const sections=sheet.sections.filter(section=>section.title==='UNIT COMPOSITION');
    for(const section of sections)assert.ok(book.entities.some(e=>unit.data.sectionIds.includes(e.id)&&e.provenance.sourceRecordId===section.sourceId),'Unresolved canonical composition source binding: '+section.sourceId);
    const counts=sections.flatMap(section=>(section.blocks||[]).flatMap(block=>
      [...block.text.matchAll(/^\s*-\s+(\d+)(?:[-–](\d+))?\s+/gm)].map(match=>Number(match[2]||match[1]))));
    assert.ok(counts.length&&counts.every(n=>Number.isSafeInteger(n)&&n>0),'Unresolved source composition: '+unit.id);
    composition.push({unitId:unit.id,profileId:unit.data.profileIds[0],maxModels:counts.reduce((n,count)=>n+count,0),
      intrinsicKeywords:[...unit.data.keywords,...unit.data.factionKeywords]});
  }
  return buildAttachmentFeasibility(book,composition);
}

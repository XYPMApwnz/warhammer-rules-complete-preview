import assert from 'node:assert/strict';
import {getCurrentMfmSource,isModernMfmVersion} from '../../../mfm/content/current-mfm-release.mjs';

const clone = value => structuredClone(value);
const forbidden = new Set(['__proto__','prototype','constructor']);

export function validateRegistry(sources) {
  const ids = new Set();
  for (const source of sources) {
    assert.ok(source.id && !ids.has(source.id),`Duplicate independent source ownership: ${source.id}`);
    ids.add(source.id);
    for (const field of ['type','versionOrDate','authority','status']) assert.ok(source[field],`${source.id}: missing ${field}`);
    if(source.type==='CENTRALIZED_MFM_REFERENCE'&&source.authority==='CENTRALIZED_MFM'&&isModernMfmVersion(source.versionOrDate)){
      const selected=getCurrentMfmSource('death-guard');
      if(source.versionOrDate===selected.version){
        assert.equal(source.effectiveDate,selected.effectiveDate,`${source.id}: MFM effective date must match the accepted source`);
        assert.equal(source.verifiedAt,selected.verifiedAt,`${source.id}: MFM verification date must match the accepted source`);
        assert.equal(source.currentnessCutoff,selected.currentnessCutoff,`${source.id}: MFM cutoff must match the accepted source`);
      }else assert.ok(source.effectiveDate===null||/^\d{4}-\d{2}-\d{2}$/.test(source.effectiveDate),`${source.id}: MFM effective date must be explicit or unconfirmed`);
      assert.equal(source.effectiveFrom,undefined,`${source.id}: observation date is not an effective date`);
      assert.match(source.verifiedAt||'',/^\d{4}-\d{2}-\d{2}$/,`${source.id}: verification date required`);
      assert.equal(source.currentnessCutoff,source.verifiedAt,`${source.id}: MFM observation cutoff drift`);
    }else assert.ok(source.effectiveFrom,`${source.id}: missing effectiveFrom`);
    assert.ok(['CURRENT','SUPERSEDED'].includes(source.status),`${source.id}: ambiguous lifecycle`);
    assert.ok(source.url || source.provenance,`${source.id}: provenance required`);
    if (source.path) assert.match(source.sha256,/^[a-f0-9]{64}$/i,`${source.id}: integrity required`);
  }
  return new Map(sources.map(source => [source.id,source]));
}

export function sourceCurrentness(sources,{blockingItems = [],lastReconciledSource = null} = {}) {
  validateRegistry(sources);
  const official = sources.filter(source => source.authority === 'OFFICIAL_GW' && source.status === 'CURRENT' && source.type !== 'OFFICIAL_NEWS')
    .sort((a,b) => b.effectiveFrom.localeCompare(a.effectiveFrom) || a.id.localeCompare(b.id));
  const pending = official.filter(source => source.reconciled !== true);
  return {baseSourceVersion:sources.find(source => source.type === 'WAHA_CAPTURE')?.versionOrDate || null,
    latestApplicableOfficialSource:official[0]?.id || null,lastReconciledSource,
    currentness:blockingItems.length ? 'BLOCKED' : pending.length ? 'STALE' : 'CURRENT',
    pendingSourceIds:pending.map(source => source.id),blockingItems:clone(blockingItems)};
}

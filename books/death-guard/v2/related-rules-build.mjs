import {buildBookRelatedRules} from '../../shared/rule-contract-v2/book-related.mjs';
import {parseProducerJSON,serializeSourceJSON,prepareSourceProducer} from '../../shared/source-refs-v2/producer-io.mjs';
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {createDGCompatibilityCompiler,relatedEvaluation} from './rule-contract-context.mjs';
import {summarizeCompatibility as summarize} from '../../shared/rule-contract-v2/compatibility.mjs';

/** Only canonical facts and explicitly available Army Book context are known.
 * Source-backed keyword grants are evaluated by the existing contract projector
 * during BUILD. No leading, attachment, physical roster or battle state is set.
 */
export function armyBookContext(model,unit,subject,detachmentId,profileId) {
  const contexts=createDGCompatibilityCompiler(model).contextsFor(unit.id,subject,{detachmentId,profileId});
  assert.equal(contexts.length,1,'An explicit MODEL profile is required for a mixed datasheet');
  return contexts[0];
}

export function evaluateRelatedRule(model,unit,rule,detachmentId) {
  return relatedEvaluation(createDGCompatibilityCompiler(model).evaluateRule(unit.id,rule.id,{detachmentId}));
}

/** Disposable Cartesian projection. Canonical IDs alone determine identity;
 * source-card occurrences, V1 outputs and generated caches never choose answers.
 */
export function buildRelatedRules(model) {
  model=prepareSourceProducer(model);
  return buildBookRelatedRules({book:model,compiler:createDGCompatibilityCompiler(model),format:{
    detachmentBeforeKind:true,roleSummary:true,summary:true,queryPurpose:'TARGET_ELIGIBILITY_WITH_REQUIRED_RECIPIENT_FEASIBILITY',
    contextPolicy:{allDetachments:'UNSPECIFIED_DETACHMENT',selectedDetachment:'EXPLICIT_CANONICAL_ID',roster:'UNKNOWN',battle:'UNKNOWN',formation:'UNKNOWN'}}});
}

export function writeRelatedRules({check=false,model}={}) {
  model??=parseProducerJSON(fs.readFileSync(new URL('./generated/rule-contract-effective.json',import.meta.url),'utf8'));
  const projection=buildRelatedRules(model),text=serializeSourceJSON(projection);
  const location=new URL('./generated/related-rules-v2.json',import.meta.url);
  if(check)assert.equal(fs.readFileSync(location,'utf8'),text,'Disposable compatibility output is stale');
  else fs.writeFileSync(location,text);
  return projection;
}
if(process.argv[1]===fileURLToPath(import.meta.url))console.log(JSON.stringify(writeRelatedRules({check:process.argv.includes('--check')}).summary));

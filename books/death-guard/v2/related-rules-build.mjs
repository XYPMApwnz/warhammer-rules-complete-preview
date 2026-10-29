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
  const compiler=createDGCompatibilityCompiler(model),kinds=['STRATAGEM','ENHANCEMENT'];
  const base=compiler.compileRows({kinds,order:'UNIT_RULE',sort:true});
  const selectedRows=compiler.compileRows({kinds,order:'UNIT_RULE',sort:true,contextForRule:rule=>({detachmentId:rule.ruleContract.detachmentId})});
  const selectedById=new Map(selectedRows.rows.map(row=>[`${row.unitId}\0${row.ruleId}`,row]));
  const byId=new Map(model.entities.map(entity=>[entity.id,entity]));
  const units=model.entities.filter(entity=>entity.kind==='DATASHEET');
  const rules=model.entities.filter(entity=>kinds.includes(entity.ruleContract?.kind));
  const rows=base.rows.map(row=>{
    const rule=byId.get(row.ruleId),detachmentId=rule.ruleContract.detachmentId;
    const selected=selectedById.get(`${row.unitId}\0${row.ruleId}`);
    assert.ok(selected,'Missing canonical selected-context projection');
    assert.equal(byId.get(detachmentId)?.kind,'DETACHMENT','Unresolved parent Detachment: '+rule.id);
    return {unitId:row.unitId,ruleId:rule.id,detachmentId,kind:rule.ruleContract.kind,
      ...relatedEvaluation({state:row.state,applicability:row.applicability,roles:row.roles}),
      selectedDetachment:relatedEvaluation({state:selected.state,applicability:selected.applicability,roles:selected.roles})};
  });
  const all=summarize(rows),selected=summarize(rows.map(row=>row.selectedDetachment));
  assert.equal(all.INVALID+selected.INVALID,0,'Invalid applicability contract/context');
  return {schema:'army-book-related-rules/v2',authority:'DISPOSABLE_PROJECTION',queryPurpose:'TARGET_ELIGIBILITY_WITH_REQUIRED_RECIPIENT_FEASIBILITY',
    contextPolicy:{allDetachments:'UNSPECIFIED_DETACHMENT',selectedDetachment:'EXPLICIT_CANONICAL_ID',roster:'UNKNOWN',battle:'UNKNOWN',formation:'UNKNOWN'},
    coreStratagemsStatus:'DEFERRED_NEEDS_CONTRACTS',
    summary:{units:units.length,stratagems:rules.filter(rule=>rule.ruleContract.kind==='STRATAGEM').length,enhancements:rules.filter(rule=>rule.ruleContract.kind==='ENHANCEMENT').length,rows:rows.length,allDetachments:all,selectedDetachment:selected},rows};
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

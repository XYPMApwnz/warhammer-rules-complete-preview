import fs from 'node:fs';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {entityContext} from './rule-contract-build.mjs';
import {evaluateRole,validateContracts,publicResult} from './rule-contract-schema.mjs';

const supportedKinds=new Set(['STRATAGEM','ENHANCEMENT']);
const any=states=>states.includes('INVALID')?'INVALID':states.includes('TRUE')?'TRUE':states.includes('UNKNOWN')?'UNKNOWN':'FALSE';
const summarize=rows=>rows.reduce((out,row)=>{out[row.applicability]++;return out;},{MATCH:0,CONDITIONAL:0,NO_MATCH:0,INVALID:0,UNRESOLVED:0});

/** Only canonical facts and explicitly available Army Book context are known.
 * Source-backed keyword grants are evaluated by the existing contract projector
 * during BUILD. No leading, attachment, physical roster or battle state is set.
 */
export function armyBookContext(model,unit,subject,detachmentId) {
  if(detachmentId)assert.ok(model.entities.some(entity=>entity.id===detachmentId&&entity.kind==='DETACHMENT'),'Invalid canonical Detachment context: '+detachmentId);
  // null is the projector's explicit "no selected Detachment" input; passing
  // undefined would also match factual records without a ruleContract.
  const context=entityContext(model,unit,subject,detachmentId??null);
  if(subject==='MODEL')context.keywords=new Set([...unit.data.keywords,...unit.data.factionKeywords]);
  context.roster=detachmentId?{detachmentId}:{};
  context.battle={};
  if(!detachmentId && ['UNIT','FORMED_ATTACHED_UNIT'].includes(subject)) {
    // An unspecified Detachment cannot establish a granted keyword as either
    // present or absent. Keep each possible source-backed grant unavailable.
    for(const detachment of model.entities.filter(entity=>entity.kind==='DETACHMENT')) {
      const selected=entityContext(model,unit,subject,detachment.id);
      for(const keyword of selected.keywords) if(!context.keywords.has(keyword))context.unknownKeywords.add(keyword);
    }
  }
  return context;
}

export function evaluateRelatedRule(model,unit,rule,detachmentId) {
  const contract=rule.ruleContract;
  const roleIds=contract.compatibilityRoleIds||[contract.roles[0]?.id];
  const roles=contract.roles.filter(role=>roleIds.includes(role.id)).map(role=>({
    roleId:role.id,subject:role.subject,
    state:evaluateRole(role,contract.conditions||[],armyBookContext(model,unit,role.subject,detachmentId))
  }));
  assert.ok(roles.length,'Rule has no compatibility role: '+rule.id);
  const state=any(roles.map(role=>role.state));
  return {state,applicability:publicResult[state],roles};
}

/** Disposable Cartesian projection. Canonical IDs alone determine identity;
 * source-card occurrences, V1 outputs and generated caches never choose answers.
 */
export function buildRelatedRules(model) {
  validateContracts(model);
  const byId=new Map(model.entities.map(entity=>[entity.id,entity]));
  assert.equal(byId.size,model.entities.length,'Duplicate canonical identity');
  const units=model.entities.filter(entity=>entity.kind==='DATASHEET').sort((a,b)=>a.id.localeCompare(b.id,'en'));
  const rules=model.entities.filter(entity=>supportedKinds.has(entity.ruleContract?.kind)).sort((a,b)=>a.id.localeCompare(b.id,'en'));
  for(const unit of units) {
    assert.ok(Array.isArray(unit.data.keywords)&&Array.isArray(unit.data.factionKeywords),'Missing canonical keyword context: '+unit.id);
    for(const id of unit.data.profileIds)assert.equal(byId.get(id)?.kind,'PROFILE','Unresolved MODEL identity: '+id);
    for(const id of unit.data.ruleReferenceIds)assert.equal(byId.get(id)?.kind,'RULE_REFERENCE','Unresolved canonical reference: '+id);
  }
  for(const relation of model.mfm.relations)for(const id of [relation.sourceId,relation.targetId])assert.equal(byId.get(id)?.kind,'DATASHEET','Unresolved attachment relationship identity: '+id);
  const rows=[];
  for(const unit of units)for(const rule of rules) {
    const detachmentId=rule.ruleContract.detachmentId;
    assert.equal(byId.get(detachmentId)?.kind,'DETACHMENT','Unresolved parent Detachment: '+rule.id);
    rows.push({unitId:unit.id,ruleId:rule.id,detachmentId,kind:rule.ruleContract.kind,
      ...evaluateRelatedRule(model,unit,rule),
      selectedDetachment:evaluateRelatedRule(model,unit,rule,detachmentId)});
  }
  const all=summarize(rows),selected=summarize(rows.map(row=>row.selectedDetachment));
  assert.equal(all.INVALID+selected.INVALID,0,'Invalid applicability contract/context');
  return {schema:'army-book-related-rules/v2',authority:'DISPOSABLE_PROJECTION',queryPurpose:'TARGET_ELIGIBILITY',
    contextPolicy:{allDetachments:'UNSPECIFIED_DETACHMENT',selectedDetachment:'EXPLICIT_CANONICAL_ID',roster:'UNKNOWN',battle:'UNKNOWN',formation:'UNKNOWN'},
    coreStratagemsStatus:'DEFERRED_NEEDS_CONTRACTS',
    summary:{units:units.length,stratagems:rules.filter(rule=>rule.ruleContract.kind==='STRATAGEM').length,enhancements:rules.filter(rule=>rule.ruleContract.kind==='ENHANCEMENT').length,rows:rows.length,allDetachments:all,selectedDetachment:selected},rows};
}

export function writeRelatedRules({check=false,model}={}) {
  model??=JSON.parse(fs.readFileSync(new URL('./generated/rule-contract-effective.json',import.meta.url),'utf8'));
  const projection=buildRelatedRules(model),text=JSON.stringify(projection,null,2)+'\n';
  const location=new URL('./generated/related-rules-v2.json',import.meta.url);
  if(check)assert.equal(fs.readFileSync(location,'utf8'),text,'Disposable compatibility output is stale');
  else fs.writeFileSync(location,text);
  return projection;
}
if(process.argv[1]===fileURLToPath(import.meta.url))console.log(JSON.stringify(writeRelatedRules({check:process.argv.includes('--check')}).summary));

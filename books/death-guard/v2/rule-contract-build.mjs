import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {buildFactualV2} from './build.mjs';
import {buildEnhancementContracts,buildDetachmentContracts} from './rule-contract-enhancements.mjs';
import {buildStratagemContracts} from './rule-contract-stratagems.mjs';
import {validateContracts,evaluatePredicate,evaluateRole,publicResult} from './rule-contract-schema.mjs';
import {parseSourceHtml,sourceNode,sourceNodeText,normalizeSourceText} from './raw-source.mjs';
const directory=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(directory,'../../..');
const addresses=JSON.parse(fs.readFileSync(path.join(directory,'rule-source-addresses.json'),'utf8'));
const kinds=new Set(['ARMY_RULE','ARMY_RULE_COMPONENT','DATASHEET_SECTION','SUPPLEMENTAL_DATASHEET_RULE','WARGEAR_OPTION','WARGEAR_FOOTNOTE','WEAPON_PROFILE_SELECTION','SOURCE_ERRATUM','BOOK_USAGE_RULES','STRATAGEM','ENHANCEMENT','DETACHMENT_RULE']);
const ruleKind = entity => ['ARMY_RULE','ARMY_RULE_COMPONENT'].includes(entity.kind)?'ARMY_RULE':entity.kind==='SUPPLEMENTAL_DATASHEET_RULE'||entity.kind==='DATASHEET_SECTION'&&entity.data.title==='ABILITIES'?'DATASHEET_ABILITY':entity.kind==='SOURCE_ERRATUM'?'FAQ_ERRATA_RULE':['STRATAGEM','ENHANCEMENT','DETACHMENT_RULE'].includes(entity.kind)?entity.kind:'OTHER_RULE';
const factFields=entity=>['text','lines','blocks','clauses','instruction','title','componentIds'].filter(key=>Object.hasOwn(entity.data,key)).map(key=>[key]);
function classifySourceClause(clause) {
  if(clause.wargearAbility)return {semanticCategory:'WARGEAR_ABILITY',contextLevel:'ROSTER',executionMode:'CLASSIFICATION_ONLY'};
  const text=clause.text||'';
  if(/\b(leading|attached)\b/i.test(text))return {semanticCategory:'ROSTER_RELATION_CONDITIONAL',contextLevel:'ROSTER',executionMode:'CLASSIFICATION_ONLY'};
  if(/\b(mustering|army roster)\b/i.test(text))return {semanticCategory:'ARMY_SELECTION_CONSTRAINT',contextLevel:'ROSTER',executionMode:'CLASSIFICATION_ONLY'};
  if(/\b(each time|once per|at the start|at the end)\b/i.test(text))return {semanticCategory:'BATTLE_TRIGGER',contextLevel:'BATTLE',executionMode:'CLASSIFICATION_ONLY'};
  if(/\b(while|phase|turn|battle|enemy)\b/i.test(text))return {semanticCategory:'BATTLE_PASSIVE',contextLevel:'BATTLE',executionMode:'CLASSIFICATION_ONLY'};
  return {semanticCategory:'DECLARATIVE_RULE',contextLevel:'STATIC',executionMode:'CLASSIFICATION_ONLY'};
}
function basicContract(entity) {
  const fields=factFields(entity), first=fields[0];
  assert.ok(first,`Rule without source fields: ${entity.id}`);
  const quote=typeof entity.data[first[0]]==='string'?entity.data[first[0]]:JSON.stringify(entity.data[first[0]]);
  const unit=entity.parentId?.startsWith('unit-'), subject=unit?'UNIT':'ROSTER';
  const selector={predicate:unit?'UNIT_ID':'ALWAYS',subject,contextLevel:'STATIC',arguments:unit?{id:entity.parentId}:{},evidence:{field:first,quote}};
  const entries=entity.data.blocks||entity.data.clauses||(entity.data.text?[{text:entity.data.text}]:[]);
  const clauses=entries.map((clause,index)=>({id:`source-clause-${index+1}`,identityRole:'CLAUSE_WITHIN_EXISTING_CANONICAL_OWNER',...classifySourceClause(clause),sourceFields:[entity.data.blocks?['blocks',index]:entity.data.clauses?['clauses',index]:['text']],roles:[],conditions:[]}));
  const contextLevel=clauses.some(clause=>clause.contextLevel==='BATTLE')?'BATTLE':clauses.some(clause=>clause.contextLevel==='ROSTER')?'ROSTER':'STATIC';
  return {kind:ruleKind(entity),contextLevel,executionMode:entity.kind==='SOURCE_ERRATUM'?'SOURCE_DIRECTIVE':unit?'DATASHEET_DECLARATION':'RULE_DECLARATION',category:entity.kind,classificationOnly:true,
    roles:[{id:unit?'datasheet-owner':'army-owner',subject,allegiance:'FRIENDLY',selector}],conditions:[],sourceFields:fields,
    clauses};
}
export function buildRuleContractV2() {
  const {effective}=buildFactualV2();
  const maps=[buildStratagemContracts(effective),buildEnhancementContracts(effective),buildDetachmentContracts(effective)];
  const declared=new Map();
  for(const map of maps) for(const [id,contract] of map) {assert.ok(!declared.has(id),'Duplicate contract producer');declared.set(id,contract);}
  const model=structuredClone(effective);
  for(const entity of model.entities.filter(entity=>kinds.has(entity.kind))) {
    const semantics=declared.get(entity.id)||basicContract(entity);
    entity.ruleContract={schema:'death-guard-rule-contract/v2',ruleId:entity.id,ownerId:entity.parentId||model.bookId,sourceId:entity.provenance.sourceId,...semantics};
    entity.ruleContract.currentness={status:'CURRENT',sourceIds:[...new Set([entity.provenance.sourceId,...Object.values(entity.fieldProvenance||{}).map(proof=>proof.sourceId).filter(Boolean)])]};
    if(entity.kind==='ENHANCEMENT') {
      const binding=model.mfm.enhancementBindings.find(binding=>binding.entityId===entity.id);
      assert.ok(binding,'Missing centralized Enhancement point owner');
      entity.ruleContract.pointOwner={owner:'CENTRALIZED_MFM',recordId:binding.mfmRecordId};
      entity.ruleContract.assignment={ownerRoleId:'eligible-owner',selector:structuredClone(entity.ruleContract.roles[0].selector),contextLevel:'ROSTER',detachmentId:entity.parentId};
    }
    assert.equal(entity.ruleContract.kind,ruleKind(entity),'Canonical kind drift');
  }
  assert.equal(declared.size,effective.entities.filter(e=>['STRATAGEM','ENHANCEMENT','DETACHMENT_RULE'].includes(e.kind)).length,'Structured source rule coverage');
  validateContracts(model);
  model.schema='death-guard-rule-contract-effective/v2';
  return model;
}
/** Explicit projection of a canonical profile, not an interchangeable UNIT/MODEL API. */
export function entityContext(model,unit,subject,detachmentId) {
  const keywords=new Set([...unit.data.keywords,...unit.data.factionKeywords]);
  for(const rule of model.entities.filter(entity=>entity.ruleContract?.detachmentId===detachmentId)) for(const grant of (rule.ruleContract.clauses||[]).map(clause=>clause.keywordProjection).filter(Boolean)) {
    if(evaluatePredicate(grant.selector,{subject:grant.subject,unitId:unit.id,keywords,roster:{detachmentId}})==='TRUE')keywords.add(grant.keyword);
  }
  const abilities=new Set();
  // Normalize an accepted Core reference during BUILD; no rule-title lookup or runtime prose parsing.
  for(const id of unit.data.ruleReferenceIds) {
    const reference=model.entities.find(entity=>entity.id===id);
    if(/\bDeadly Demise\b/.test(reference.data.label.replace(/^CORE ABILITIES/,'')))abilities.add('Deadly Demise');
  }
  const modelId=unit.data.profileIds.length===1?unit.data.profileIds[0]:undefined;
  const unknownKeywords=new Set();
  if(subject==='UNIT'||subject==='FORMED_ATTACHED_UNIT') {
    // Potential Attached Unit membership is unavailable roster context, not a
    // permanent change to a Bodyguard's facts or its individual MODEL keywords.
    for(const edge of model.mfm.relations.filter(edge=>edge.targetId===unit.id||edge.sourceId===unit.id)) {
      const other=model.entities.find(entity=>entity.id===(edge.targetId===unit.id?edge.sourceId:edge.targetId));
      for(const keyword of [...other.data.keywords,...other.data.factionKeywords]) if(!keywords.has(keyword))unknownKeywords.add(keyword);
    }
  }
  return {subject,unitId:unit.id,...(subject==='MODEL'?{modelId}:{}),keywords,unknownKeywords,abilities,roster:{detachmentId}};
}
const any=states=>states.includes('INVALID')?'INVALID':states.includes('TRUE')?'TRUE':states.includes('UNKNOWN')?'UNKNOWN':'FALSE';
export function compileCompatibility(model) {
  validateContracts(model);
  const core=JSON.parse(fs.readFileSync(path.join(root,'books/core-rules/content/core-rules.digital-11e.json'),'utf8'));
  assert.ok(core.records.find(record=>record.code==='02.05.01')?.text.includes('A model only has its own keywords.'),'Accepted MODEL keyword semantics changed; source review required');
  assert.ok(core.records.find(record=>record.code==='19.03')?.text.includes('An attached unit has all of the keywords of all of its component units.'),'Accepted formed UNIT keyword semantics changed; source review required');
  const rows=[];
  for(const rule of model.entities.filter(e=>['STRATAGEM','ENHANCEMENT','DETACHMENT_RULE'].includes(e.ruleContract?.kind))) {
    const contract=rule.ruleContract;
    for(const unit of model.entities.filter(e=>e.kind==='DATASHEET')) {
      const eligibleRoles=contract.roles.filter(role=>(contract.compatibilityRoleIds||[contract.roles[0]?.id]).includes(role.id));
      const evaluations=eligibleRoles.map(role=>({roleId:role.id,state:evaluateRole(role,contract.conditions||[],entityContext(model,unit,role.subject,contract.detachmentId))}));
      const state=any(evaluations.map(result=>result.state));
      rows.push({ruleId:rule.id,unitId:unit.id,state,applicability:publicResult[state],roles:evaluations});
    }
  }
  return {schema:'death-guard-compatibility-projection/v2',authority:'DISPOSABLE_PROJECTION',queryPurpose:'TARGET_ELIGIBILITY',keywordContextPolicy:{model:'OWN_KEYWORDS_ONLY',unit:'COMPONENT_KEYWORD_UNION',unavailableFormation:'UNKNOWN',coreSource:'books/core-rules/content/core-rules.digital-11e.json',coreRuleCodes:['02.05.01','19.03'],coreCorpusFingerprint:core.meta.corpusFingerprint,eligibilityOwner:'mfm.relations'},rows};
}
/** Re-enumerate the previous source-card domain. Cards never determine answers. */
export function previousAmbiguityDomain(model) {
  const byAddress=new Map(addresses.bindings.map(binding=>[binding.publisherReferenceId,binding.ruleId]));
  assert.equal(byAddress.size,addresses.bindings.length,'Duplicate publisher address');
  const rows=[];
  const corpus=JSON.parse(fs.readFileSync(path.join(root,'books/death-guard/sources/waha-11e-current-2026-09-25/corpus.json'),'utf8'));
  for(const binding of addresses.bindings) {
    const entity=model.entities.find(entity=>entity.id===binding.ruleId);
    assert.ok(entity,'Unresolved source binding');
    const html=fs.readFileSync(path.join(root,binding.proof.sourceArtifact),'utf8'),tree=parseSourceHtml(html);
    assert.equal(sourceNode(tree,binding.proof.sourceLocation.domPath).attrs['data-tooltip-content'],'#'+binding.publisherReferenceId,'Accepted reference binding changed');
    const locate=node=>node.attrs?.id===binding.publisherReferenceId?node:node.children.map(locate).find(Boolean);
    const publisherRecord=locate(tree);assert.ok(publisherRecord,'Unresolved publisher rule address');
    // Validate the declared ID/address binding, rather than resolving IDs by title.
    const proofText=normalizeSourceText(sourceNodeText(html,publisherRecord)).toLowerCase();
    assert.ok(proofText.includes(normalizeSourceText(entity.data.title).toLowerCase()),'Explicit publisher identity proof contradicts canonical rule '+entity.id);
  }
  for(const unit of model.entities.filter(entity=>entity.kind==='DATASHEET')) {
    const page=corpus.pages.find(page=>page.url===unit.data.url),html=fs.readFileSync(path.join(directory,'sources/accepted-waha-pages',page.file),'utf8');
    const walk=node=>{
      const address=node.attrs?.['data-tooltip-content']?.slice(1),ruleId=byAddress.get(address);
      if(ruleId) {
        let parent=node.parent,card=false;
        while(parent) {const classes=(parent.attrs?.class||'').split(/\s+/);if(classes.includes('s10Wrap')||classes.includes('s10EnhWrap')){card=true;break;}parent=parent.parent;}
        if(card) rows.push({ruleId,unitId:unit.id,sourceArtifact:'books/death-guard/v2/sources/accepted-waha-pages/'+page.file,publisherReferenceId:address});
      }
      for(const child of node.children)walk(child);
    };
    walk(parseSourceHtml(html));
  }
  const keys=rows.map(row=>`${row.unitId}\0${row.ruleId}`);
  assert.equal(new Set(keys).size,keys.length,'Duplicate source card occurrence');
  return rows;
}
export function summarize(model,projection,domain) {
  const counts={};
  for(const entity of model.entities.filter(e=>e.ruleContract))counts[entity.ruleContract.kind]=(counts[entity.ruleContract.kind]||0)+1;
  const byKey=new Map(projection.rows.map(row=>[`${row.unitId}\0${row.ruleId}`,row]));
  const outcomes={MATCH:0,CONDITIONAL:0,NO_MATCH:0,INVALID:0,UNRESOLVED:0},relations={STRATAGEM:0,DETACHMENT_RULE:0,ENHANCEMENT:0};
  const resolved=domain.map(source=>{
    const row=byKey.get(`${source.unitId}\0${source.ruleId}`);assert.ok(row,'Missing compatibility projection');
    outcomes[row.applicability]++;
    relations[model.entities.find(e=>e.id===source.ruleId).ruleContract.kind]++;
    return {...source,state:row.state,applicability:row.applicability};
  });
  return {schema:'death-guard-rule-contract-closure/v2',rulesTotal:Object.values(counts).reduce((a,b)=>a+b,0),counts,relations,outcomes,previousAmbiguities:resolved,
    titleOrProseFactualJoins:0,manualPairwiseRuleRelations:0,duplicateRuleOwners:0,sourceAmbiguities:[]};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  const model=buildRuleContractV2(),compatibility=compileCompatibility(model),closure=summarize(model,compatibility,previousAmbiguityDomain(model));
  for(const [name,value]of Object.entries({'rule-contract-effective':model,'compatibility-v2':compatibility,'rule-contract-closure':closure})) {
    const file=path.join(directory,'generated',name+'.json'),text=JSON.stringify(value,null,2)+'\n';
    if(process.argv.includes('--check'))assert.equal(fs.readFileSync(file,'utf8'),text,'Deterministic Rule Contract projection drift: '+name);else fs.writeFileSync(file,text);
  }
  console.log(JSON.stringify({rulesTotal:closure.rulesTotal,counts:closure.counts,relations:closure.relations,outcomes:closure.outcomes},null,2));
}

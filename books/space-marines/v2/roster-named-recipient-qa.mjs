/** Three reproduced named-recipient joins, reviewed against accepted source URIs. */
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {enhancementEligibility} from './rule-contract-declarations.mjs';
import {buildSpaceMarinesContracts} from './rule-contract-build.mjs';
const read=name=>JSON.parse(fs.readFileSync(new URL(name,import.meta.url),'utf8'));
const sha=value=>createHash('sha256').update(value).digest('hex').toUpperCase();
const review=read('./roster-named-recipient-review.json'),facts=read('./generated/effective.json');
const index=new Map(facts.entities.map(e=>[e.id,e]));
const expected=new Map([
 ['enhancement-sm-90544ca326d243be',['unit-sm-63a015916b46446a','model-sm-303a4d0a13024600']],
 ['enhancement-sm-b83286afe07645eb',['unit-sm-1d09de3e7281438a','model-sm-26770947c0d14782']],
 ['enhancement-sm-cb0f3a594ea44264',['unit-sm-1d09de3e7281438a','model-sm-26770947c0d14782']]
]);
function validate(candidate,eligibility=enhancementEligibility){
 assert.equal(candidate.schema,'space-marines-v2-named-recipient-review/v1');
 assert.deepEqual(candidate.records.map(r=>r.ruleId).sort(),[...expected.keys()].sort());
 for(const row of candidate.records){
  const [unitId,modelId]=expected.get(row.ruleId),entity=index.get(row.ruleId),unit=index.get(unitId),model=index.get(modelId);
  assert.equal(row.status,'SOURCE_CONFIRMED');assert.equal(row.unitId,unitId);assert.deepEqual(row.modelProfileIds,[modelId]);
  assert.equal(row.ownerDetachmentId,entity.parentId);assert.equal(model.parentId,unitId);
  assert.deepEqual(unit.data.profileIds,[modelId]);assert.equal(row.sourceEligibilityText,entity.data.eligibilityText);
  assert.deepEqual(row.reviewedSelector,{subject:'MODEL',unitIds:[unitId]});
  assert.equal(row.sourceFieldsUnchanged,true);assert.equal(row.nativeKeywordsAdded,false);assert.equal(row.effectLoweringChanged,false);
  assert.equal(row.sourceDispatch.href,new URL(unit.data.url).pathname,'Wrong explicit source URI');
  assert.deepEqual(row.sourceDispatch.nativeIntersectionUnitIds,[unitId]);
  assert.equal(eligibility[row.ruleId].subject,'MODEL');assert.deepEqual(eligibility[row.ruleId].unitIds,[unitId]);
  assert.equal(eligibility[row.ruleId].eligibilityEvidence,entity.data.eligibilityText);
  assert.ok(!eligibility[row.ruleId].keywords?.length,'Named source recipient must not become an invented keyword');
  assert.deepEqual(row.proofs.map(p=>p.entityId),[row.ruleId,unitId,modelId]);
  for(const pin of row.proofs){const factual=index.get(pin.entityId);assert.equal(pin.sourceEntityId,factual.sourceEntityId);
   assert.equal(pin.kind,factual.kind);assert.equal(pin.parentId,factual.parentId??null);assert.deepEqual(pin.source,factual.provenance);
   assert.equal(sha(fs.readFileSync(new URL('../../../'+pin.source.document,import.meta.url))),pin.source.sha256);}
 }
}
validate(review);
// No runtime-derived EXPECTED: source link destinations and source-owned profiles
// are independently extracted before testing the existing compiled predicates.
const python=process.env.CODEX_PYTHON||'C:/Users/denis/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe';
const script=String.raw`
import json,sys,hashlib
from pathlib import Path
from lxml import html
f=json.load(sys.stdin);root=Path(f['root']);docs={};checks=0;dispatches=0
sha=lambda b:hashlib.sha256(b).hexdigest().upper()
norm=lambda s:' '.join(s.split())
for row in f['review']['records']:
 for pin in row['proofs']:
  source=pin['source'];raw=(root/source['document']).read_bytes();assert sha(raw)==source['sha256']
  tree=docs.setdefault(source['document'],html.fromstring(raw).getroottree());nodes=tree.xpath(source['pointer']);assert len(nodes)==1
  assert sha(html.tostring(nodes[0],encoding='unicode').encode())==pin['rawNodeHtmlSha256'];checks+=1
 entity=row['proofs'][0];tree=docs[entity['source']['document']];node=tree.xpath(entity['source']['pointer'])[0]
 paragraphs=node.xpath('./p[not(contains(@class,"legend2"))]');assert len(paragraphs)==1
 assert norm(paragraphs[0].text_content())==row['sourceGameplayParagraph']
 dispatch=row['sourceDispatch'];links=tree.xpath(dispatch['linkPointer']);assert len(links)==1;link=links[0]
 assert link.get('href')==dispatch['href'];assert norm(link.text_content())==dispatch['linkText']
 assert sha(html.tostring(link,encoding='unicode').encode())==dispatch['linkHtmlSha256']
 if dispatch['kind']=='EXPLICIT_SOURCE_DATASHEET_LINK':assert paragraphs[0] in link.iterancestors()
 else:
  triggers=tree.xpath(dispatch['triggerPointer']);assert len(triggers)==1;trigger=triggers[0]
  assert paragraphs[0] in trigger.iterancestors();assert norm(trigger.text_content())=='TECHMARINE'
  assert trigger.get('data-tooltip-content')==dispatch['tooltipId']
  tooltip=tree.xpath(dispatch['tooltipPointer']);assert len(tooltip)==1;tooltip=tooltip[0]
  assert tooltip.get('id')==dispatch['tooltipId'][1:]
  assert sha(html.tostring(tooltip,encoding='unicode').encode())==dispatch['tooltipHtmlSha256']
  assert tooltip in link.iterancestors();assert 'TECHMARINE keyword is used' in norm(tooltip.text_content())
  actual=[{'href':a.get('href'),'label':norm(a.text_content()),'pointer':tree.getpath(a)} for a in tooltip.xpath('.//a[@href]')]
  assert actual==dispatch['allLinkedSourceRecipients']
  uris=f['nativeUris'];native=[uris['https://wahapedia.ru'+a['href']] for a in actual if 'https://wahapedia.ru'+a['href'] in uris]
  assert native==dispatch['nativeIntersectionUnitIds']
  outside=[a for a in actual if 'https://wahapedia.ru'+a['href'] not in uris];assert outside==dispatch['outsideNativeCorpus']
  assert [a['href'] for a in outside]==['/wh40k11ed/factions/space-marines/Iron-Priest']
 dispatches+=1
print(json.dumps({'rawNodePins':checks,'sourceUriDispatches':dispatches,'foreignRecipientsActivated':0}))
`;
const parsed=spawnSync(python,['-X','utf8','-c',script],{input:JSON.stringify({root:fileURLToPath(new URL('../../../',import.meta.url)),review,
 nativeUris:Object.fromEntries(facts.entities.filter(e=>e.kind==='DATASHEET').map(e=>[e.data.url,e.id]))}),encoding:'utf8'});
assert.equal(parsed.status,0,parsed.stderr);const source=JSON.parse(parsed.stdout);
const built=buildSpaceMarinesContracts();let positives=0,negatives=0;
for(const row of review.records){
 const contract=built.artifact.contracts.find(c=>c.ruleId===row.ruleId);assert.ok(contract);
 assert.equal(contract.assignment.selector.subject,'MODEL');assert.equal(contract.assignment.identity,'EXACT_PHYSICAL_INSTANCE_MODEL_PROFILE');
 assert.ok(contract.clauses.every(c=>c.rosterEffects.length===0),'Unknown battle conditions cannot auto-execute');
 for(const role of [contract.roles[0],...contract.clauses.map(c=>c.roles[0])]){
  assert.equal(role.subject,'MODEL');
  for(const instanceId of ['named-source/one','named-source/repeated']){
   const context={subject:'MODEL',modelId:row.modelProfileIds[0],unitId:row.unitId,instanceId,
    keywords:new Set(index.get(row.unitId).data.keywords),abilities:new Set(),roster:{}};
   assert.equal(built.schema.evaluatePredicate(role.selector,context),'TRUE');positives++;
  }
  for(const profile of facts.entities.filter(e=>e.kind==='MODEL_PROFILE'&&!row.modelProfileIds.includes(e.id))){
   assert.equal(built.schema.evaluatePredicate(role.selector,{subject:'MODEL',modelId:profile.id,unitId:profile.parentId,
    keywords:new Set(['APOTHECARY','TECHMARINE','APOTHECARY BIOLOGIS']),abilities:new Set(),roster:{}}),'FALSE');negatives++;
  }
  assert.equal(built.schema.evaluatePredicate(role.selector,{subject:'MODEL',modelId:'foreign/iron-priest',unitId:'foreign/space-wolves',
   keywords:new Set(['TECHMARINE']),abilities:new Set(),roster:{}}),'FALSE');negatives++;
 }
}
let mutations=0;
function reject(mutate){const candidate=structuredClone(review),eligibility=structuredClone(enhancementEligibility);mutate(candidate,eligibility);
 assert.throws(()=>validate(candidate,eligibility));mutations++;}
reject(r=>r.records.pop());
reject(r=>r.records[0].unitId='unit-sm-1d09de3e7281438a');
reject(r=>r.records[1].modelProfileIds=['model-sm-303a4d0a13024600']);
reject(r=>r.records[1].sourceDispatch.href='/wh40k11ed/factions/space-marines/Iron-Priest');
reject(r=>r.records[2].reviewedSelector.subject='UNIT');
reject(r=>r.records[0].sourceEligibilityText+=' changed');
reject(r=>r.records[0].proofs[0].source.sha256='0'.repeat(64));
reject(r=>r.records[1].nativeKeywordsAdded=true);
reject((r,e)=>{e[r.records[0].ruleId].unitIds=['unit-sm-1d09de3e7281438a'];});
reject((r,e)=>{e[r.records[1].ruleId].keywords=['TECHMARINE'];});
console.log(JSON.stringify({status:'PASS',reviewedNamedAssignments:3,...source,compiledSelectorPositiveChecks:positives,
 compiledSelectorNegativeChecks:negatives,mutationControls:mutations,newKeywords:0,newGameplayLowerings:0,realNewRecruitExportTested:false}));

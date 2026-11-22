/** Reviewed decisions certify current native source/binding evidence, never own facts. */
import {inventoryFingerprint} from './native-inventory.mjs';
import {hasOwnerOnlyReason,needsOwnerOnlyIsolation,reviewedPresentationScope,OWNER_ONLY_REASON,ownerOnlyViolations,OWNER_ONLY_CONSUMERS} from './owner-only.mjs';

export const CATEGORIES=Object.freeze(['EXECUTED','RECIPIENTS_ONLY','TEXT_ONLY_INTENDED','GAP','UNKNOWN']);
export const KINDS=Object.freeze(['ARMY_RULE','DETACHMENT_RULE','ENHANCEMENT','STRATAGEM','ABILITY','WARGEAR_ABILITY','CORE_ABILITY']);
// The accepted census debt is historical evidence. Closures are separate records.
export const ACCEPTED_DEBT_FINGERPRINT='7ad2519acc0b7a381a39d092b8918ecceb852f379c58ba248b4f0d703eb1ad19';
export const decisionKey=row=>row.book+'\0'+row.id;
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const nonempty=value=>typeof value==='string'&&value.trim().length>0;
const digest=value=>typeof value==='string'&&/^[a-f0-9]{64}$/.test(value);
const fail=(code,row,message)=>{throw new TypeError(`Markup census ${code}: ${row?.book||'registry'} · ${row?.id||'-'}: ${message}`);};
const requireValue=(value,code,row,message)=>{if(!value)fail(code,row,message);};
const keysOnly=(object,allowed,row,label)=>{
 requireValue(object&&typeof object==='object'&&!Array.isArray(object),'INVALID_SCHEMA',row,label+' must be an object');
 for(const key of Object.keys(object))requireValue(allowed.includes(key),'INVALID_SCHEMA',row,label+' has unknown field '+key);
};
const index=(rows,label)=>{
 requireValue(Array.isArray(rows),'INVALID_SCHEMA',null,label+' must be an array');
 const result=new Map();
 for(const row of rows){
  requireValue(nonempty(row?.book)&&nonempty(row?.id),'INVALID_SCHEMA',row,label+' needs book and id');
  const key=decisionKey(row);requireValue(!result.has(key),'DUPLICATE_ID',row,label+' repeats this physical source occurrence');result.set(key,row);
 }
 return result;
};

/** Every skipped rule-bearing owner and every uncovered source text field needs
 * an exact reviewed exclusion. A known native kind is not a blanket exemption. */
export function sourceAccounting(inventory){
 const exclusions=(inventory.exclusions||[]).filter(row=>row.ambiguous).map(row=>({book:row.book,id:row.id,kind:row.kind,
  sourceFingerprint:row.sourceFingerprint,reason:row.reason}));
 const excluded=new Set(exclusions.map(decisionKey)),fieldExclusions=[];
 const prefix=(a,b)=>a.every((value,i)=>value===b[i]);
 for(const source of inventory.sourceEntities){
  if(excluded.has(decisionKey(source)))continue;
  const owners=inventory.rows.filter(row=>row.book===source.book&&row.sourceEntityId===source.id);
  if(!owners.length)continue;
  const fields=owners.flatMap(row=>row.sourceFields);
  for(const entry of source.fields||[]){
   if(['title','name','label'].includes(entry.field.at(-1)))continue;
   if(fields.some(field=>prefix(field,entry.field)||prefix(entry.field,field)))continue;
   fieldExclusions.push({book:source.book,id:source.id+'#uncovered/'+JSON.stringify(entry.field),sourceEntityId:source.id,
    field:entry.field,sourceFingerprint:entry.valueFingerprint,
    reason:'Exact adjacent source field excluded from the accepted logical-rule denominator; not an implicit exemption for future fields.'});
  }
 }
 const order=(a,b)=>decisionKey(a).localeCompare(decisionKey(b),'en');
 return {exclusions:exclusions.sort(order),fieldExclusions:fieldExclusions.sort(order)};
}

/** A category cannot survive removal of its actual semantic/presentation bindings. */
export function coverageProof(row,computerAvailability=[]){
 return {bindingFingerprint:row.bindingFingerprint,capabilityFingerprint:row.capabilityFingerprint,operations:[...(row.operations||[])].sort(),
  sourceFields:row.sourceFields,clauseIds:row.clauseIds,
  conditions:(row.conditions||[]).filter(condition=>condition.contextLevel==='ROSTER').map(condition=>({
   identity:condition.identity,predicate:condition.predicate,arguments:condition.arguments,
   computation:condition.declaredComputation||null})),
  abilityPresence:Boolean(row.nativeCorePresence?.abilities?.length),attachmentPermission:Boolean(row.attachmentPermission),
  providedWeapon:Boolean(row.equipmentBindings?.some(binding=>binding.providedWeaponProfileIds?.length)),
  physicalComputers:[...new Set((row.conditions||[]).filter(condition=>condition.contextLevel==='ROSTER'&&condition.predicate==='FIELD'&&!condition.declaredComputation?.kind&&condition.spec?.computedBy)
   .map(condition=>'FIELD:'+row.book+':'+condition.arguments.key))].sort().map(kind=>({kind,fingerprint:computerAvailability.find(item=>item.kind===kind)?.fingerprint||null}))};
}
const hasExecution=row=>(row.effects?.length&&row.effects.every(effect=>effect.operationSupported))||
 Boolean(row.nativeCorePresence?.abilities?.length)||Boolean(row.attachmentPermission)||
 Boolean(row.equipmentBindings?.some(binding=>binding.providedWeaponProfileIds?.length))||
 Boolean(row.capabilities?.equipmentReferences?.some(reference=>reference.effects?.length));
const hasRecipient=row=>Boolean(row.presentationChannels?.some(channel=>['MODEL','UNIT'].includes(channel.recipient?.who)))||
 Boolean(row.kind==='CORE_ABILITY')||Boolean(row.compatibilityTargets?.some(role=>role.allegiance==='FRIENDLY')&&row.relatedRuleRows?.length);

export function validateRegistry(registry){
 keysOnly(registry,['schema','sourceReview','records','exclusions','fieldExclusions'],null,'decisions');
 requireValue(registry.schema==='markup-decisions/v1','INVALID_SCHEMA',null,'unknown decision schema');
 requireValue(nonempty(registry.sourceReview),'INVALID_SCHEMA',null,'source review is required');
 const records=index(registry.records,'decisions');
 for(const row of records.values()){
  keysOnly(row,['book','id','sourceEntityId','kind','sourceFields','sourceFingerprint','category','reason','evidence','partial','proof','presentationScope'],row,'decision');
  requireValue(KINDS.includes(row.kind),'INVALID_SCHEMA',row,'unknown kind '+row.kind);
  requireValue(CATEGORIES.includes(row.category),'UNCLASSIFIED',row,'one exact reviewed category is required');
  requireValue(nonempty(row.sourceEntityId)&&Array.isArray(row.sourceFields),'INVALID_SCHEMA',row,'canonical owner and source fields required');
  requireValue(digest(row.sourceFingerprint),'INVALID_SCHEMA',row,'sourceFingerprint must be SHA-256');
  requireValue(nonempty(row.reason),'INVALID_SCHEMA',row,'reviewed reason is required');
  if(hasOwnerOnlyReason(row))requireValue(row.category==='TEXT_ONLY_INTENDED','OWNER_ONLY_CATEGORY',row,'owner-only decisions must remain explicitly text-only');
  if(row.reason===OWNER_ONLY_REASON)requireValue(row.presentationScope===reviewedPresentationScope(row.kind),'OWNER_ONLY_SCOPE',row,'the reviewed scope must match the exact native kind: '+reviewedPresentationScope(row.kind));
  else requireValue(!Object.hasOwn(row,'presentationScope'),'OWNER_ONLY_SCOPE',row,'presentationScope requires the exact reviewed owner decision');
  requireValue(Array.isArray(row.evidence)&&row.evidence.length&&row.evidence.every(nonempty),'INVALID_SCHEMA',row,'review evidence is required');
  requireValue(typeof row.partial==='boolean','INVALID_SCHEMA',row,'partial must be explicit');
  requireValue(row.proof&&digest(row.proof.bindingFingerprint),'INVALID_SCHEMA',row,'native binding proof is required');
 }
 return records;
}

/** Compare exact debt identities, reasons and source fingerprints; no count allowance. */
export function validateDebt({baseline,debt,closures,decisions,verifyEvidence=()=>false}){
 for(const [file,schema]of [[baseline,'markup-debt-baseline/v1'],[debt,'markup-debt/v1'],[closures,'markup-closures/v1']])
  requireValue(file?.schema===schema,'INVALID_SCHEMA',null,'unknown '+schema+' schema');
 const original=index(baseline.records,'debt baseline'),active=index(debt.records,'active debt'),closed=index(closures.records,'closures');
 requireValue(inventoryFingerprint(baseline.records)===ACCEPTED_DEBT_FINGERPRINT,'BASELINE_CHANGED',null,'accepted a854d173 debt identities/reasons cannot be rewritten; record evidenced closures separately');
 for(const [key,row]of original){
  requireValue(['GAP','UNKNOWN'].includes(row.category)&&nonempty(row.reason)&&nonempty(row.nextStep)&&digest(row.sourceFingerprint),
   'INVALID_SCHEMA',row,'debt requires exact category, reason, next step and source fingerprint');
  requireValue(active.has(key)!==closed.has(key),'UNEXPLAINED_DEBT_REMOVAL',row,'baseline debt must remain active or have exactly one evidenced closure');
 }
 for(const [key,row]of active){
  requireValue(original.has(key),'NEW_DEBT',row,'GAP/UNKNOWN is outside the exact reviewed debt baseline');
  requireValue(same(row,original.get(key)),'DEBT_CHANGED',row,'existing debt identity/reason/next step cannot be repinned without reviewed baseline migration');
  const decision=decisions.get(key);
  requireValue(decision&&decision.category===row.category&&decision.sourceFingerprint===row.sourceFingerprint&&decision.reason===row.reason,'DEBT_DECISION_MISMATCH',row,'active debt and decision must agree exactly');
 }
 for(const [key,row]of closed){
  requireValue(original.has(key)&&!active.has(key),'INVALID_CLOSURE',row,'closure must remove an existing named debt item');
  requireValue(row.previousCategory===original.get(key).category&&nonempty(row.reason),'INVALID_CLOSURE',row,'previous category and reviewed closure reason required');
  const decision=decisions.get(key);
  requireValue(decision&&!['GAP','UNKNOWN'].includes(decision.category)&&row.category===decision.category,'INVALID_CLOSURE',row,'closure must establish resolved coverage');
  requireValue(Array.isArray(row.evidence)&&row.evidence.length>=2,'MISSING_CLOSURE_EVIDENCE',row,'a test and source-backed fixture are required');
  requireValue(row.evidence.some(e=>e.kind==='test')&&row.evidence.some(e=>e.kind==='fixture'),'MISSING_CLOSURE_EVIDENCE',row,'both test and fixture evidence are required');
  for(const evidence of row.evidence)requireValue(verifyEvidence(evidence,{...row,sourceEntityId:decision.sourceEntityId,sourceFields:decision.sourceFields,sourceFingerprint:decision.sourceFingerprint,bindingFingerprint:decision.proof.bindingFingerprint,clauseIds:decision.proof.clauseIds,kind:decision.kind,presentationScope:decision.presentationScope}),'MISSING_CLOSURE_EVIDENCE',row,'missing or unrelated closure evidence '+evidence.path);
 }
 for(const [key,row]of decisions)if(['GAP','UNKNOWN'].includes(row.category))
  requireValue(active.has(key),'NEW_DEBT',row,'GAP/UNKNOWN is outside the exact active debt list');
 return {original:original.size,active:active.size,closed:closed.size};
}

export function checkMarkup({inventory,registry,baseline,debt,closures,retirements,verifyEvidence,computerAvailability=[]}){
 requireValue(inventory?.schema==='native-markup-inventory/v1','INVALID_INVENTORY',null,'native inventory is required');
 const decisions=validateRegistry(registry),current=index(inventory.rows,'native denominator');
 const accounting=sourceAccounting(inventory);
 for(const name of ['exclusions','fieldExclusions']){
  const expected=index(registry[name],name),actual=index(accounting[name],name);
  for(const [key,row]of actual){
   requireValue(expected.has(key),'INCOMPLETE_DENOMINATOR',row,'unreviewed rule-bearing exclusion or source field; classify it or explicitly review its structural exclusion');
   requireValue(same(expected.get(key),row),'STALE_EXCLUSION',row,'excluded source changed; its old denominator decision is no longer valid');
  }
  for(const [key,row]of expected)requireValue(actual.has(key),'STALE_EXCLUSION',row,'retired or now-counted source still has a stale denominator exclusion');
 }
 const sources=new Map(inventory.sourceEntities.map(row=>[decisionKey(row),row]));
 requireValue(retirements?.schema==='markup-retirements/v1','INVALID_SCHEMA',null,'retirement registry is required');
 const retired=index(retirements.records,'retirements');
 for(const [key,entry]of retired){
  requireValue(decisions.has(key)&&!current.has(key)&&nonempty(entry.reason),'INVALID_RETIREMENT',entry,'retirement must explain an absent, previously reviewed rule');
  const previous=decisions.get(key);
  requireValue(entry.previousSourceFingerprint===previous.sourceFingerprint,'INVALID_RETIREMENT',entry,'retirement must identify the exact prior source fingerprint');
  requireValue(Array.isArray(entry.evidence)&&entry.evidence.some(evidence=>evidence.kind==='source'),'INVALID_RETIREMENT',entry,'retirement requires a source-bound review record');
  for(const evidence of entry.evidence)requireValue(verifyEvidence?.(evidence,{...entry,sourceEntityId:previous.sourceEntityId,sourceFingerprint:previous.sourceFingerprint}),'INVALID_RETIREMENT',entry,'missing retirement evidence');
 }
 for(const [key,row]of current){
  const decision=decisions.get(key);
  requireValue(decision,'UNCLASSIFIED',row,'new native rule has no reviewed category');
  requireValue(decision.kind===row.kind&&decision.sourceEntityId===row.sourceEntityId,'IDENTITY_CHANGED',row,'kind or factual owner changed');
  const fields=row.sourceSnapshot?.fields||[];
  for(const field of decision.sourceFields){
   const present=fields.find(candidate=>same(candidate.field,field));
   requireValue(present?.present&&present.type!=='undefined','SOURCE_FIELD_LOSS',row,'accepted source field is missing: /'+field.join('/'));
  }
  requireValue(decision.sourceFingerprint===row.sourceFingerprint,'STALE_DECISION',row,'source fingerprint changed; review the exact source before deciding again');
  if(needsOwnerOnlyIsolation(decision)){
   requireValue(same(inventory.ownerOnlyConsumers,OWNER_ONLY_CONSUMERS),'OWNER_ONLY_CONSUMER_CHANGED',row,
    'the attached presentation implementation changed; review owner-only admission before accepting its proof');
   const violations=ownerOnlyViolations(row,inventory);
   requireValue(!violations.length,'OWNER_ONLY_RECIPIENT',row,'owner-only source has an unproved or foreign presentation path: '+violations.join('; '));
  }
  requireValue((row.effects||[]).every(effect=>effect.operationSupported),'EXECUTION_MISSING',row,'declared native effect operation has no supported interpreter operation');
  if(decision.category==='EXECUTED'){
   requireValue(hasExecution(row),'EXECUTION_MISSING',row,'no supported native operation, ability, selected weapon or enforced permission');
   for(const condition of row.conditions||[])if(condition.contextLevel==='ROSTER'&&condition.declaredComputation?.kind){
    const entry=computerAvailability.find(item=>item.kind===condition.declaredComputation.kind);
    requireValue(entry?.available,'MISSING_COMPUTER',row,'declared roster computer is absent: '+condition.declaredComputation.kind);
   }
   for(const requirement of decision.proof.physicalComputers||[]){
    const actual=computerAvailability.find(item=>item.kind===requirement.kind);
    requireValue(actual?.available&&actual.fingerprint===requirement.fingerprint,'MISSING_COMPUTER',row,'physical computer/wiring changed: '+requirement.kind+'; restore it or review the implementation proof');
   }
  }
  requireValue(same(decision.proof,coverageProof(row,computerAvailability)),'STALE_BINDING_PROOF',row,'native operation/recipient/condition binding changed; review its physical scope and coverage');
  if(decision.category==='RECIPIENTS_ONLY')requireValue(hasRecipient(row),'RECIPIENT_CHANNEL_MISSING',row,'no consumed physical/reference/related-target presentation channel');
 }
 for(const [key,decision]of decisions)if(!current.has(key)&&!retired.has(key)){
  const owner=sources.get(decision.book+'\0'+decision.sourceEntityId);
  fail(owner?'SOURCE_FIELD_LOSS':'RULE_DISAPPEARED',decision,'accepted rule/source member vanished without explicit retirement');
 }
 const debtResult=validateDebt({baseline,debt,closures,decisions,verifyEvidence});
 const counts=Object.fromEntries(CATEGORIES.map(category=>[category,0])),summary=[];
 for(const book of [...new Set(inventory.rows.map(row=>row.book))].sort())for(const kind of KINDS){
  const rows=inventory.rows.filter(row=>row.book===book&&row.kind===kind),totals=Object.fromEntries(CATEGORIES.map(category=>[category,0]));
  for(const row of rows){const category=decisions.get(decisionKey(row)).category;totals[category]++;counts[category]++;}
  summary.push({book,kind,N:rows.length,...totals});
 }
 requireValue(Object.values(counts).reduce((n,value)=>n+value,0)===current.size,'INCOMPLETE_DENOMINATOR',null,'each current source occurrence must appear exactly once');
 const resolved=current.size-counts.GAP-counts.UNKNOWN;
 return {schema:'markup-census-report/v1',status:'PASS',N:current.size,counts,partial:[...current.keys()].filter(key=>decisions.get(key).partial).length,
  resolved:{count:resolved,total:current.size,percent:current.size?100*resolved/current.size:0},debt:debtResult,retired:retired.size,summary,
  rows:inventory.rows.map(row=>({book:row.book,id:row.id,name:row.name,kind:row.kind,category:decisions.get(decisionKey(row)).category,
   reason:decisions.get(decisionKey(row)).reason,...(decisions.get(decisionKey(row)).presentationScope?{presentationScope:decisions.get(decisionKey(row)).presentationScope}:{}),partial:decisions.get(decisionKey(row)).partial,sourceFingerprint:row.sourceFingerprint,
   bindingFingerprint:row.bindingFingerprint,sourceEntityId:row.sourceEntityId,sourceFields:row.sourceFields,nativeFactory:row.nativeFactory})),
  inputFingerprint:inventoryFingerprint(inventory.inputs),inputs:inventory.inputs};
}

/** Book-owned DA declarations over the existing closed mixed-owner view.
 * No source parser, physical Chapter inference, importer or shared operation. */
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {buildDarkAngelsMixedBook} from './book-build.mjs';
import {buildSpaceMarinesContracts} from '../../space-marines/v2/rule-contract-build.mjs';
import {declarations,enhancementEligibility,recipientIdentityProofs} from './rule-contract-declarations.mjs';
import {createDarkAngelsRuleSchema} from './rule-contract-schema.mjs';
import {bindDarkAngelsNative} from './native-ability-bindings.mjs';
import {bindCanonicalContract,bindDeclarationClauses} from '../../shared/rule-contract-v2/bindings.mjs';
import {validateRosterEffects} from '../../shared/roster-v2/effects.mjs';
import {createEffectiveCoreCatalog} from '../../core-rules/content/effective-core-catalog.mjs';
const read=name=>JSON.parse(fs.readFileSync(new URL(name,import.meta.url),'utf8'));
const clone=structuredClone,sha=text=>createHash('sha256').update(text).digest('hex').toUpperCase();
const atom=(predicate,subject,args,evidence,contextLevel='STATIC')=>({predicate,subject,arguments:args,contextLevel,evidence:clone(evidence)});
const all=args=>args.length===1?args[0]:{op:'ALL',args};
const any=args=>args.length===1?args[0]:{op:'ANY',args};
export function buildDarkAngelsContracts({inputs=declarations,review=read('./rule-clause-review.json')}={}){
 const native=buildDarkAngelsMixedBook(),book=clone(native.book),index=new Map(book.entities.map(e=>[e.id,e]));
 const facts=read('./generated/effective.json'),original=JSON.stringify(facts);
 assert.equal(sha(original),review.factualFingerprint,'Unreviewed DA factual fields');
 const sm=buildSpaceMarinesContracts(),smIndex=new Map(sm.book.entities.map(e=>[e.id,e]));
 book.rosterReferenceSemantics=Object.fromEntries(Object.entries(sm.book.rosterReferenceSemantics).filter(([id])=>index.has(id)));
 book.rosterAbilityReferences=clone(sm.book.rosterAbilityReferences);
 book.rosterReviewedScopeCorrections=sm.book.rosterReviewedScopeCorrections.filter(row=>index.has(row.entityId||row.id));
 book.rosterPermanentDoctrineSources=sm.book.rosterPermanentDoctrineSources.filter(row=>index.has(row.ruleId));
 const inheritedContracts=[],selectorProjections=[];
 for(const entity of book.entities.filter(e=>e.bookId==='space-marines')){
  const source=smIndex.get(entity.id);
  if(entity.kind==='PROFILE')entity.data=clone(source.data);
  // Root Army rules are source-backed text, with no executable effects in SM.
  // Their canonical owner remains SM; do not rebind them to DA to satisfy a guard.
  if(source.ruleContract&&source.parentId){
   entity.ruleContract=clone(source.ruleContract);
   for(const clause of entity.ruleContract.clauses)for(const effect of clause.rosterEffects){
    if(effect.excludeWeaponIds){
     const originalIds=clone(effect.excludeWeaponIds);
     effect.excludeWeaponIds=effect.excludeWeaponIds.filter(id=>index.has(id));
     if(originalIds.length!==effect.excludeWeaponIds.length)selectorProjections.push({ruleId:entity.id,effectId:effect.id,
      canonicalExclusions:originalIds,consumerExclusions:clone(effect.excludeWeaponIds),reason:'Closed membership intersection only; excluded Chapter weapons cannot occur in this consumer.'});
    }
   }
   inheritedContracts.push(entity.id);
  }
 }
 const nativeBindings=bindDarkAngelsNative(book),core=createEffectiveCoreCatalog();
 for(const proof of recipientIdentityProofs){
  const entity=index.get(proof.canonicalId);assert.equal(entity?.sourceEntityId,proof.sourceEntityId);
  assert.equal(entity.data.sourceAnchor,proof.sourceAnchor);assert.equal(entity.bookId,'space-marines');
  assert.ok(inputs.find(input=>input.ruleId===proof.ruleId&&input.targetUnitIds?.includes(entity.id)));
  assert.equal(sha(fs.readFileSync(new URL('../../../'+proof.sourceDocument,import.meta.url),'utf8')),proof.sourceSha256);
 }
 const stealth=core.getById('core-stealth');assert.equal(stealth?.state,'FULL_CONTENT');
 book.rosterAbilityReferences['core-stealth']={id:stealth.id,title:stealth.title,parameters:{},provenance:clone(stealth.provenance)};
 const grouped=new Map();
 for(const row of review.records){
  const entity=index.get(row.canonicalId),text=row.field.reduce((data,key)=>data?.[key],entity?.data);
  assert.equal(entity?.bookId,'dark-angels');assert.equal(entity.parentId||book.bookId,row.ownerId);
  assert.equal(entity.sourceEntityId,row.sourceEntityId);assert.deepEqual(entity.provenance,row.sourceProvenance);
  assert.equal(sha(text),row.sourceFieldSha256);assert.equal(text.slice(row.sourceOccurrence.start,row.sourceOccurrence.end),row.quote);
  const rows=grouped.get(entity.id)||[];rows.push(row);grouped.set(entity.id,rows);
 }
 assert.deepEqual([...grouped.keys()].sort(),[...review.reviewedSourceIds].sort());
 const classifications={};
 const nativeIds=new Set([...nativeBindings.nativeAbilities.map(row=>row.id),...nativeBindings.nativeProfiles.map(row=>row.id)]);
 for(const row of review.records){
  assert.ok(['EXECUTABLE_PROVEN','TEXT_ONLY_SOURCE_BACKED','NOT_PROVEN'].includes(row.status));
  classifications[row.status]=(classifications[row.status]||0)+1;
  if(row.status==='EXECUTABLE_PROVEN')assert.ok(nativeIds.has(row.canonicalId)||inputs.some(input=>
   !input.partial&&input.ruleId===row.canonicalId&&input.quote.includes(row.quote)),'Unbound executable review claim');
 }
 assert.deepEqual(classifications,review.coverage.classifications);
 assert.equal(review.coverage.clauses,review.records.length);
 const executed=[];
 for(const [id,rows]of grouped){
  const entity=index.get(id);
  if(['RULE_REFERENCE','INVULNERABLE_SAVE'].includes(entity.sourceKind||entity.kind))continue;
  const enhancement=entity.kind==='ENHANCEMENT',detachment=entity.kind==='DETACHMENT_RULE';
  const eligible=enhancement?enhancementEligibility[id]:null;
  if(enhancement)assert.ok(eligible,'Unreviewed eligibility');
  const subject=eligible?.subject||'UNIT',first={field:rows[0].field,quote:rows[0].quote};
  const selector=()=>{
   if(!enhancement)return atom('ALWAYS',subject,{},first);
   const proof={field:['eligibilityText'],quote:entity.data.eligibilityText},nodes=[];
   for(const keyword of eligible.keywords||[])nodes.push(atom(subject+'_KEYWORD',subject,{keyword},proof));
   if(eligible.anyKeywords)nodes.push(any(eligible.anyKeywords.map(keyword=>atom(subject+'_KEYWORD',subject,{keyword},proof))));
   if(eligible.unitIds)nodes.push(any(eligible.unitIds.map(id=>atom('UNIT_ID','UNIT',{id},proof))));
   for(const ability of eligible.abilities||[])nodes.push(atom('MODEL_ABILITY','MODEL',{ability},proof));
   return all(nodes);
  };
  const owner={id:'owner',subject,purpose:'OWNER',allegiance:'FRIENDLY',selector:selector(),conditions:[]};
  const declaration={kind:enhancement?'ENHANCEMENT':detachment?'DETACHMENT_RULE':entity.kind==='STRATAGEM'?'STRATAGEM':entity.kind==='ARMY_RULE'?'ARMY_RULE':entity.sourceKind==='DATASHEET_ABILITY'?'DATASHEET_ABILITY':'OTHER_RULE',
   executionMode:entity.kind==='STRATAGEM'?'BATTLE_ACTION':'DECLARATIVE_APPLICABILITY',contextLevel:'ROSTER',roles:[owner],conditions:[],sourceFields:[],clauses:[]};
  if(enhancement||detachment)declaration.detachmentId=entity.parentId;
  if(enhancement)declaration.assignment={ownerRoleId:'owner',selector:clone(owner.selector),
   identity:subject==='MODEL'?'EXACT_PHYSICAL_INSTANCE_MODEL_PROFILE':'EXACT_PHYSICAL_INSTANCE_UNIT',...(subject==='UNIT'?{classification:'UNIT_UPGRADE'}:{})};
  if(entity.kind==='STRATAGEM')Object.assign(declaration,{cp:entity.data.cp,timing:clone(entity.data.lines.filter(row=>row.label==='WHEN:')),duration:[],restrictions:clone(entity.data.lines.filter(row=>row.label==='RESTRICTIONS:'))});
  const specs=inputs.filter(input=>input.ruleId===id);
  for(const input of specs){
   assert.ok(entity.data.text.includes(input.quote),'Missing literal effect source');
   const proof={field:['text'],quote:input.quote},conditions=[];
   if(input.equipment)conditions.push({binding:'SOURCE',predicate:atom('FIELD','UNIT',{key:'equipmentRequirementSatisfied',equals:true},proof,'ROSTER')});
   if(input.presence)conditions.push({binding:'SOURCE',predicate:atom('FIELD','UNIT',{key:input.presence,equals:true},proof,'ROSTER')});
   if(input.targetKeywords)conditions.push({binding:'TARGET',predicate:all(input.targetKeywords.map(keyword=>atom('UNIT_KEYWORD','UNIT',{keyword},proof)))});
   if(input.targetUnitIds)conditions.push({binding:'TARGET',predicate:any(input.targetUnitIds.map(id=>atom('UNIT_ID','UNIT',{id},proof)))});
   const branches=input.formedOrPhysical?[{binding:'SOURCE_FORMED_MODELS',attached:true},{binding:'SOURCE_UNIT_MODELS',attached:false}]:[{binding:input.targetBinding}];
   const effects=branches.flatMap((branch,n)=>input.effects.map((operation,i)=>{
    const gated=clone(conditions);
    if(branch.attached!==undefined)gated.push({binding:'SOURCE',predicate:atom('FIELD','UNIT',{key:'attached',equals:branch.attached},proof,'ROSTER')});
    const effect={id:`${id}::${input.clauseId}/${n+1}/${i+1}`,...clone(operation),targetBinding:branch.binding,targetSubject:input.targetSubject,
     conditions:gated,evidence:proof,sourceFields:[['text']],lifetime:enhancement?'WHILE_ASSIGNED':detachment?'WHILE_DETACHMENT_SELECTED':input.equipment?'WHILE_EQUIPPED':'WHILE_SOURCE_UNIT_PRESENT',
     provenance:{canonicalRuleId:id,canonicalOwnerId:entity.parentId,canonicalClauseId:input.clauseId,sourceEvidence:clone(entity.provenance)}};
    if(input.equipment)effect.equipmentRequirement={binding:'SOURCE',kind:'EQUIPMENT_PRESENT',equipmentId:id,sourceFieldPath:['text']};
    return effect;
   }));
   declaration.clauses.push({id:input.clauseId,roles:[clone(owner)],conditions:[],sourceFields:[['text']],evidence:proof,sourceText:input.quote,
    rosterClassification:'ROSTER_EXECUTABLE',rosterClassificationNote:{reason:input.partial?'Charge +1 only; Advance/CP remain non-executable source text.':'Source-reviewed static/physical lowering.'},rosterEffects:effects});
   executed.push({ruleId:id,clauseId:input.clauseId,partial:input.partial||false,quote:input.quote,effectIds:effects.map(effect=>effect.id)});
  }
  for(const row of rows){
   if(specs.some(input=>!input.partial&&input.quote.includes(row.quote)))continue;
   declaration.clauses.push({id:row.id,roles:[clone(owner)],conditions:[],sourceFields:[clone(row.field)],evidence:{field:clone(row.field),quote:row.quote},sourceText:row.quote,
    rosterClassification:'DISPLAY_ONLY',rosterClassificationNote:{reason:row.reason,reviewClassification:row.status},rosterEffects:[]});
  }
  const pending=new Map(declaration.clauses.map(clause=>[clause.id,clause.rosterEffects]));
  for(const clause of declaration.clauses)clause.rosterEffects=[];
  entity.ruleContract=bindCanonicalContract({entity,bookId:book.bookId,schema:'rule-contract/v2',index,declaration:bindDeclarationClauses(declaration),currentness:{factualOwner:clone(entity.provenance),chapterContext:'NOT_PROVEN_FOR_INHERITED_PHYSICAL_UNIT'}});
  for(const clause of entity.ruleContract.clauses)clause.rosterEffects=pending.get(clause.id);
 }
 assert.equal(executed.length,inputs.length,'Orphan DA lowering');
 const schema=createDarkAngelsRuleSchema();schema.validateContracts(book);validateRosterEffects(book,schema.validatePredicate,schema.evaluatePredicate);
 assert.equal(JSON.stringify(facts),original);
 const artifact={scope:'STAGE_3A_NATIVE_DA_GAMEPLAY',sourceFingerprint:review.factualFingerprint,reviewFingerprint:sha(JSON.stringify(review)),
  coverage:clone(review.coverage),executed,...nativeBindings,inheritedContracts,selectorProjections,recipientIdentityProofs:clone(recipientIdentityProofs),
  inheritedTypedClauses:book.entities.filter(e=>e.bookId==='space-marines').flatMap(e=>e.ruleContract?.clauses||[]).filter(row=>row.rosterEffects.length).length,
  chapterConditions:26,chapterGrantsActive:0,chapterContext:'NOT_PROVEN_NO_PHYSICAL_SOURCE_BINDER',
  unsupported:['INCOMING_WOUND_ROLL','INCOMING_DAMAGE','REROLLS','QUALIFIED_FNP','UNKNOWN_BATTLE_EVENTS'],
  inheritedPhysicalChoiceBindings:'Existing SM FIELD-gated effects remain conditional until a DA physical binder supplies their proven context; no assumptions.',
  relations:'INACTIVE_SOURCE_DECLARATIONS; LAZARUS_SOURCE_CONFLICT',physicalCycloneCharge:false,realNewRecruitExportTested:false};
 return {book,schema,artifact,native,sm};
}
export function writeDarkAngelsContracts({check=false}={}){
 const result=buildDarkAngelsContracts();
 for(const [name,value]of [['rule-contracts',result.artifact],['roster-runtime',result.book]]){
  const file=new URL('./generated/'+name+'.json',import.meta.url),bytes=JSON.stringify(value,null,2)+'\n';
  if(check)assert.equal(fs.readFileSync(file,'utf8'),bytes,'Stale DA gameplay output '+name);else fs.writeFileSync(file,bytes);
 }
 return result;
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
 const built=writeDarkAngelsContracts({check:process.argv.includes('--check')});
 console.log(JSON.stringify({status:'PASS',coverage:built.artifact.coverage,typed:built.artifact.executed.length,inheritedTyped:built.artifact.inheritedTypedClauses}));
}

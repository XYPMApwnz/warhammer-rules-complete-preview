import {finalizeRecipientBook} from '../../shared/rule-contract-v2/finalize-recipients.mjs';
/** Book-owned typed declarations over native source facts. Shared V2 validators
 * and executor own behaviour. No importer, V1 dependency or source interpreter.
 */
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {buildNativeMfmBook} from './mfm-build.mjs';
import {declarations,enhancementEligibility,pendingPhysicalBindings,weaponQualifierBindings,permanentDoctrineSources} from './rule-contract-declarations.mjs';
import {createSpaceMarinesRuleSchema} from './rule-contract-schema.mjs';
import {bindNativeAbilities,bindNativeBaseProfiles,bindNativeKeywords} from './native-ability-bindings.mjs';
import {physicalStaticBindings} from './roster-static-model-bindings.mjs';
import {readSpaceMarinesRosterCorrections} from './roster-source-review.mjs';
import {createEffectiveCoreCatalog} from '../../core-rules/content/effective-core-catalog.mjs';
import {bindCanonicalContract,bindDeclarationClauses} from '../../shared/rule-contract-v2/bindings.mjs';
import {validateRosterEffects} from '../../shared/roster-v2/effects.mjs';

const read=name=>JSON.parse(fs.readFileSync(new URL(name,import.meta.url),'utf8'));
const sha=value=>createHash('sha256').update(value).digest('hex').toUpperCase();
const clone=structuredClone,at=(data,path)=>path.reduce((value,key)=>value?.[key],data);
const atom=(predicate,subject,args,evidence,contextLevel='STATIC')=>({predicate,subject,arguments:args,contextLevel,evidence:clone(evidence)});
const all=nodes=>nodes.length===1?nodes[0]:{op:'ALL',args:nodes};
const any=nodes=>nodes.length===1?nodes[0]:{op:'ANY',args:nodes};

export function buildSpaceMarinesContracts({facts=read('./generated/effective.json'),base,cross,
  review=read('./rule-clause-review.json'),inputs=declarations}={}){
  const original=JSON.stringify(facts),native=buildNativeMfmBook({facts,base,cross}),book=clone(native.model);
  assert.equal(sha(original),review.factualFingerprint,'Unreviewed factual source');
  const index=new Map(book.entities.map(entity=>[entity.id,entity]));
  const reviewedScopes=new Map(readSpaceMarinesRosterCorrections({facts}).scopeCorrections.map(row=>[row.entityId||row.id,row]));
  book.rosterReviewedScopeCorrections=[...reviewedScopes.values()].map(row=>clone(row));
  book.rosterPermanentDoctrineSources=permanentDoctrineSources.map(source=>{
    const entity=index.get(source.ruleId);assert.equal(entity?.parentId,source.unitId);
    assert.equal(entity.data.text,'Codex Adept: The assault doctrine, devastator doctrine and tactical doctrine are active for this unit.');
    return {...clone(source),quote:entity.data.text,provenance:clone(entity.provenance)};
  });
  assert.equal(index.size,book.entities.length);assert.ok(book.entities.every(entity=>!entity.ruleContract));
  const nativeKeywords=bindNativeKeywords(book);
  // Existing shared equipment selections use canonical section/FIELD sources.
  // This disposable kind alias retains the original ID, sourceKind and text.
  for(const entity of book.entities.filter(entity=>entity.kind==='DATASHEET_ABILITY'&&entity.data.wargearAbility))entity.kind='DATASHEET_SECTION';
  book.rosterProfileBindings=book.entities.filter(entity=>entity.kind==='PROFILE').map(profile=>{
    const unit=index.get(profile.parentId),named=unit.data.modelKeywordDeclarations.filter(row=>row.sourceProfileId===profile.id);
    assert.ok(named.every(row=>row.profileBindingStatus==='SOURCE_CONFIRMED'));
    return {unitId:unit.id,profileId:profile.id,intrinsicKeywords:[...new Set([...unit.data.keywords,...unit.data.factionKeywords,...named.flatMap(row=>row.keywords)])]};
  });
  const nativeAbilities=bindNativeAbilities(book),nativeProfiles=bindNativeBaseProfiles(book);
  const core=createEffectiveCoreCatalog();
  for(const id of ['core-deep-strike','core-scouts','core-stealth','core-fights-first','core-lone-operative','core-infiltrators']){
    const fact=core.getById(id);assert.equal(fact?.state,'FULL_CONTENT');
    book.rosterAbilityReferences[id]={id,title:fact.title,parameters:id==='core-scouts'?{range:{type:'number',min:0}}:{},provenance:clone(fact.provenance)};
  }
  for(const [name,ids]of Object.entries(weaponQualifierBindings)){
    const token=name==='masterForgedPsychicExclusions'?'PSYCHIC':'TORRENT';
    assert.deepEqual([...ids].sort(),book.entities.filter(entity=>entity.kind==='WEAPON_PROFILE'&&entity.data.abilities.some(ability=>ability.toUpperCase()===token)).map(entity=>entity.id).sort(),'Weapon qualifier source changed');
  }
  const reviews=new Map();
  for(const row of review.records){
    const fact=index.get(row.canonicalId);assert.ok(fact&&row.ownerId===(fact.parentId||book.bookId));
    const text=at(fact.data,row.field);assert.equal(sha(text),row.sourceFieldSha256,'Unreviewed rule field');
    assert.equal(text.slice(row.sourceOccurrence.start,row.sourceOccurrence.end),row.quote,'Unreviewed literal clause');
    const rows=reviews.get(fact.id)||[];rows.push(row);reviews.set(fact.id,rows);
  }
  const grouped=new Map();
  for(const input of inputs){
    const fact=index.get(input.ruleId);assert.equal(fact?.parentId,input.ownerId,'Wrong executable owner');
    assert.ok(at(fact.data,input.field).includes(input.quote),'Missing literal executable proof');
    for(const proof of input.sourceDependencies||[]){
      const dependency=index.get(proof.entityId);
      assert.ok(dependency&&at(dependency.data,proof.field)?.includes(proof.quote),'Unproved cross-rule static dependency');
    }
    for(const proof of input.coreDependencies||[]){
      const dependency=core.getById(proof.id);
      assert.ok(dependency?.state==='FULL_CONTENT'&&dependency.text.includes(proof.quote),'Unproved Core static dependency');
    }
    assert.ok(input.effects.length);const rows=grouped.get(input.ruleId)||[];
    assert.ok(!rows.some(row=>row.clauseId===input.clauseId),'Duplicate typed clause');rows.push(input);grouped.set(input.ruleId,rows);
  }
  const contracts=[],executed=[];
  for(const [ruleId,rows]of reviews){
    const entity=index.get(ruleId);
    if(['RULE_REFERENCE','INVULNERABLE_SAVE'].includes(entity.kind))continue;
    const enhancement=entity.kind==='ENHANCEMENT',detachment=entity.kind==='DETACHMENT_RULE';
    const eligible=enhancement?(reviewedScopes.has(ruleId)?{...enhancementEligibility[ruleId],subject:'UNIT',unresolved:false,
      sourceCorrection:clone(reviewedScopes.get(ruleId))}:enhancementEligibility[ruleId]):null;
    if(enhancement)assert.equal(eligible?.eligibilityEvidence,entity.data.eligibilityText,'Unreviewed Enhancement eligibility');
    const subject=eligible?.unresolved?'UNIT':eligible?.subject||'UNIT';
    const first={field:clone(rows[0].field),quote:rows[0].quote};
    const selector=()=>{
      if(!enhancement||eligible.unresolved)return atom('ALWAYS',subject,{},first);
      const proof={field:['eligibilityText'],quote:eligible.eligibilityEvidence},nodes=[];
      if(eligible.unitIds)nodes.push(any(eligible.unitIds.flatMap(id=>subject==='UNIT'?[id]:index.get(id).data.profileIds).map(id=>atom(subject==='UNIT'?'UNIT_ID':'MODEL_ID',subject,{id},proof))));
      for(const keyword of eligible.keywords||[])nodes.push(atom(subject+'_KEYWORD',subject,{keyword},proof));
      if(eligible.anyKeywords)nodes.push(any(eligible.anyKeywords.map(keyword=>atom(subject+'_KEYWORD',subject,{keyword},proof))));
      for(const keyword of eligible.excludeKeywords||[])nodes.push({op:'NOT',args:[atom(subject+'_KEYWORD',subject,{keyword},proof)]});
      assert.ok(nodes.length);return all(nodes);
    };
    const owner={id:'owner',subject,purpose:'OWNER',allegiance:'FRIENDLY',selector:selector(),conditions:[]};
    const declaration={kind:enhancement?'ENHANCEMENT':detachment?'DETACHMENT_RULE':entity.kind==='STRATAGEM'?'STRATAGEM':entity.kind==='ARMY_RULE'?'ARMY_RULE':entity.kind==='DATASHEET_ABILITY'?'DATASHEET_ABILITY':'OTHER_RULE',
      executionMode:entity.kind==='STRATAGEM'?'BATTLE_ACTION':'DECLARATIVE_APPLICABILITY',contextLevel:'ROSTER',roles:[owner],conditions:[],sourceFields:[],clauses:[]};
    if(enhancement||detachment){
      let parent=index.get(entity.parentId);while(parent?.kind==='DETACHMENT_RULE')parent=index.get(parent.parentId);
      assert.equal(parent?.kind,'DETACHMENT');
      // Nested source records remain independent display-only clauses. The
      // existing contract's detachment address applies to direct children only.
      if(index.get(entity.parentId)?.kind==='DETACHMENT')declaration.detachmentId=parent.id;
      else assert.equal((grouped.get(ruleId)||[]).length,0,'Nested executable needs an explicit supported binding');
    }
    if(enhancement&&!eligible.unresolved)declaration.assignment={ownerRoleId:'owner',selector:clone(owner.selector),identity:subject==='MODEL'?'EXACT_PHYSICAL_INSTANCE_MODEL_PROFILE':'EXACT_PHYSICAL_INSTANCE_UNIT',...(subject==='UNIT'?{classification:'UNIT_UPGRADE'}:{})};
    if(entity.kind==='STRATAGEM')Object.assign(declaration,{cp:entity.data.cp,timing:clone(entity.data.lines.filter(line=>line.label==='WHEN:')),duration:[],restrictions:clone(entity.data.lines.filter(line=>line.label==='RESTRICTIONS:'))});
    const specs=grouped.get(ruleId)||[];
    for(const input of specs){
      assert.ok(!eligible?.unresolved,'Unresolved scope cannot execute');
      const proof={field:clone(input.field),quote:input.quote},conditions=[];
      if(input.leading)conditions.push({binding:'SOURCE',predicate:atom('LEADING','UNIT',{value:true},proof,'ROSTER')});
      if(input.equipment)conditions.push({binding:'SOURCE',predicate:atom('FIELD','UNIT',{key:'equipmentRequirementSatisfied',equals:true},proof,'ROSTER')});
      if(input.targetKeywords||input.targetAnyKeywords){
        const nodes=(input.targetKeywords||[]).map(keyword=>atom('UNIT_KEYWORD','UNIT',{keyword},proof));
        if(input.targetAnyKeywords)nodes.push(any(input.targetAnyKeywords.map(keyword=>atom('UNIT_KEYWORD','UNIT',{keyword},proof))));
        conditions.push({binding:'TARGET',predicate:all(nodes)});
      }
      if(input.equipment&&input.targetBinding==='SOURCE_MODEL')conditions.push({binding:'TARGET',predicate:atom('FIELD','MODEL',{key:'smEquipmentBearerSatisfied',equals:true},{...proof,otherEntityId:ruleId},'ROSTER')});
      conditions.push(...clone(input.conditions||[]));
      const expand=input.formedOrPhysicalModels?[{binding:'SOURCE_FORMED_MODELS',attached:true},{binding:'SOURCE_UNIT_MODELS',attached:false}]:[{binding:input.targetBinding}];
      const effects=expand.flatMap((choice,branch)=>input.effects.map((operation,i)=>{
        const gated=clone(conditions);
        if(choice.attached!==undefined)gated.push({binding:'SOURCE',predicate:atom('FIELD','UNIT',{key:'attached',equals:choice.attached},proof,'ROSTER')});
        const effect={id:`${ruleId}::${input.clauseId}/branch-${branch+1}/effect-${i+1}`,...clone(operation),targetBinding:choice.binding,targetSubject:input.targetSubject,
          conditions:gated,evidence:proof,sourceFields:[clone(input.field)],lifetime:enhancement?'WHILE_ASSIGNED':detachment?'WHILE_DETACHMENT_SELECTED':input.equipment?'WHILE_EQUIPPED':'WHILE_SOURCE_UNIT_PRESENT',
          provenance:{canonicalRuleId:ruleId,canonicalOwnerId:input.ownerId,canonicalClauseId:input.clauseId,sourceEvidence:clone(entity.provenance),
            ...(input.sourceDependencies?.length?{sourceDependencies:input.sourceDependencies.map(proof=>({...clone(proof),provenance:clone(index.get(proof.entityId).provenance)}))}:{}),
            ...(input.coreDependencies?.length?{coreDependencies:input.coreDependencies.map(proof=>({...clone(proof),provenance:clone(core.getById(proof.id).provenance),sourceContentHashes:clone(core.getById(proof.id).sourceContentHashes)}))}:{})}};
        if(input.equipment)effect.equipmentRequirement={binding:'SOURCE',kind:'EQUIPMENT_PRESENT',equipmentId:ruleId,sourceFieldPath:clone(input.field)};
        if(input.targetBinding==='ROSTER_MODELS'){
          const nodes=(input.recipientUnitKeywords||[]).map(keyword=>atom('UNIT_KEYWORD','UNIT',{keyword},proof));
          if(input.recipientUnitAnyKeywords)nodes.push(any(input.recipientUnitAnyKeywords.map(keyword=>atom('UNIT_KEYWORD','UNIT',{keyword},proof))));
          effect.containingUnitScope=input.containingUnitScope;
          effect.recipientSelectors={unit:all(nodes),model:atom('ALWAYS','MODEL',{},proof)};
        }
        return effect;
      }));
      declaration.clauses.push({id:input.clauseId,roles:[clone(owner)],conditions:[],sourceFields:[clone(input.field)],evidence:proof,sourceText:input.quote,
        rosterClassification:'ROSTER_EXECUTABLE',rosterClassificationNote:{reason:'Explicit source-reviewed typed lowering; independently exercised on constructed physical rosters.'},rosterEffects:effects});
      executed.push({ruleId,clauseId:input.clauseId,field:clone(input.field),quote:input.quote,effectIds:effects.map(effect=>effect.id)});
    }
    for(const row of rows){
      // Exact source fragments already covered by a complete typed lowering are
      // not duplicated. All other conditions and unsupported clauses stay text.
      if(specs.some(input=>input.quote.includes(row.quote)))continue;
      declaration.clauses.push({id:row.id,roles:[clone(owner)],conditions:[],sourceFields:[clone(row.field)],evidence:{field:clone(row.field),quote:row.quote},sourceText:row.quote,
        rosterClassification:'DISPLAY_ONLY',rosterClassificationNote:{reason:row.explanation,reviewClassification:row.status},rosterEffects:[]});
    }
    const pending=new Map(declaration.clauses.map(clause=>[clause.id,clause.rosterEffects]));
    for(const clause of declaration.clauses)clause.rosterEffects=[];
    entity.ruleContract=bindCanonicalContract({entity,bookId:book.bookId,schema:'rule-contract/v2',index,declaration:bindDeclarationClauses(declaration),currentness:{factualOwner:clone(entity.provenance),nativeMfm:'v1.6'}});
    for(const clause of entity.ruleContract.clauses)clause.rosterEffects=pending.get(clause.id);
    contracts.push(entity.ruleContract);
  }
  assert.equal(executed.length,inputs.length,'Orphan executable declaration');
  book.conditionBindingOptions={...book.conditionBindingOptions,physicalIdentityNamespace:'sm',equipmentBearerMode:'POSITIVE_SELECTION'};
  finalizeRecipientBook(book);
 const schema=createSpaceMarinesRuleSchema();schema.validateContracts(book);validateRosterEffects(book,schema.validatePredicate,schema.evaluatePredicate);
  assert.equal(JSON.stringify(facts),original,'Canonical source mutated');
  const artifact={factualFingerprint:sha(original),contracts,executed,physicalBindingTemplates:clone(physicalStaticBindings),nativeAbilities:nativeAbilities.bindings,nativeProfiles:nativeProfiles.bindings,
    pending:clone(pendingPhysicalBindings.filter(row=>!reviewedScopes.has(row.ruleId))),nativeKeywords,coverage:clone(review.coverage),reviewFingerprint:sha(JSON.stringify(review)),
    physicalImportImplemented:true,realNewRecruitExportTested:false,frontendVerified:false};
  return {book,schema,artifact,native,consumed:native.consumed};
}
export function writeSpaceMarinesContracts({check=false}={}){
  const result=buildSpaceMarinesContracts();
  for(const [name,value]of [['rule-contracts',result.artifact],['roster-runtime',result.book]]){
    const path=new URL('./generated/'+name+'.json',import.meta.url),bytes=JSON.stringify(value,null,2)+'\n';
    if(check)assert.equal(fs.readFileSync(path,'utf8'),bytes,'Stale SM native contract output '+name);else fs.writeFileSync(path,bytes);
  }
  return result;
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
  const {artifact}=writeSpaceMarinesContracts({check:process.argv.includes('--check')});
  console.log(JSON.stringify({status:'PASS',contracts:artifact.contracts.length,typedClauses:artifact.executed.length,nativeAbilities:artifact.nativeAbilities.length,nativeProfileBindings:artifact.nativeProfiles.length}));
}

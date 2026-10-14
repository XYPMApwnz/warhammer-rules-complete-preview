/** EC-owned bounded Rule Contract overlay. No importer, service or UI wiring.
 * The shared engine consumes a disposable view of the existing factual owner. */
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {createRuleContractSchema} from '../../shared/rule-contract-v2/schema.mjs';
import {bindCanonicalContract,bindDeclarationClauses} from '../../shared/rule-contract-v2/bindings.mjs';
import {validateRosterEffects} from '../../shared/roster-v2/effects.mjs';
import {buildAttachmentFeasibility} from '../../shared/roster-v2/compatibility-feasibility.mjs';
import {createEffectiveCoreCatalog} from '../../core-rules/content/effective-core-catalog.mjs';
import {consumeMfm,resolveOwnedFact} from './mfm-boundary.mjs';
import {declarations} from './rule-contract-declarations.mjs';
import {permissionDeclarations,permissionStateFields} from './rule-contract-permission-declarations.mjs';

const directory=path.dirname(fileURLToPath(import.meta.url));
const read=file=>JSON.parse(fs.readFileSync(path.join(directory,file),'utf8'));
const clone=structuredClone;
const sha=bytes=>createHash('sha256').update(bytes).digest('hex').toUpperCase();
const all=args=>args.length===1?args[0]:{op:'ALL',args};
const at=(value,field)=>field.reduce((value,key)=>value?.[key],value);
const subject=binding=>['SOURCE_UNIT','ROSTER_UNITS'].includes(binding)?'UNIT':'MODEL';

export function buildECContracts({facts=read('generated/effective.json'),inputs=declarations,permissionInputs=permissionDeclarations}={}) {
  const before=JSON.stringify(facts),book=clone(facts),index=new Map(book.entities.map(e=>[e.id,e]));
  assert.equal(index.size,book.entities.length,'Duplicate canonical identity');
  assert.equal(inputs.length,10,'Only the reviewed ten-rule scope is implemented');
  assert.equal(new Set(inputs.map(input=>input.ruleId)).size,10,'Duplicate semantic owner');
  assert.ok([0,5].includes(permissionInputs.length),'Only the reviewed five permissions may be added');
  assert.equal(new Set([...inputs,...permissionInputs].map(input=>input.ruleId)).size,10+permissionInputs.length,'Duplicate semantic owner');
  book.ruleContractsStarted=true;
  const mfm=consumeMfm(facts.entities);
  const schema=createRuleContractSchema({stateFields:{meleeAttackTargetsCharacter:{contextLevel:'BATTLE',valueType:'boolean'},...permissionStateFields}});
  // Identity and factual data remain unchanged; PROFILE is the existing shared
  // engine interface for this disposable MODEL_PROFILE view, not a new owner.
  for(const entity of book.entities.filter(e=>e.kind==='MODEL_PROFILE'))entity.kind='PROFILE';
  const core=createEffectiveCoreCatalog(),fightsFirst=core.getById('core-fights-first');
  assert.equal(fightsFirst?.kind,'ability','Unresolved canonical Core ability');
  assert.equal(fightsFirst.state,'FULL_CONTENT','Core ability lacks source content');
  book.rosterAbilityReferences={'core-fights-first':{id:fightsFirst.id,title:fightsFirst.title,parameters:{},
    provenance:clone(fightsFirst.provenance)}};
  book.rosterReferenceSemantics={};
  book.rosterAttachmentPolicies=mfm.leaderEligibilityBindings.flatMap(binding=>binding.targetUnitIds.map(targetId=>({
    sourceId:binding.sourceUnitId,targetId,role:'LEADER',additionalLeaders:0,sourceIds:[binding.sourceEntityId],
    mfmReferenceId:binding.mfmRecordId})));
  const contracts=[];
  for(const input of inputs) {
    const entity=index.get(input.ruleId);
    assert.ok(entity,'Missing source owner '+input.ruleId);
    assert.equal(entity.parentId,input.ownerId,'Source owner changed');
    assert.equal(entity.kind,input.kind==='DATASHEET_ABILITY'?'DATASHEET_SECTION':input.kind,'Wrong source kind');
    assert.equal(at(entity.data,input.field),input.quote,'Reviewed source occurrence changed');
    if(input.kind!=='DATASHEET_ABILITY')assert.equal(entity.data.title,input.name,'Wrong rule identity');
    const evidence={field:clone(input.field),quote:input.quote};
    const predicate=(name,roleSubject,args,quote=input.quote,level='STATIC')=>({predicate:name,subject:roleSubject,
      contextLevel:level,arguments:args,evidence:{field:clone(input.field),quote}});
    const selector=input.profileId?predicate('MODEL_ID','MODEL',{id:input.profileId}):input.kind==='DETACHMENT_RULE'
      ?predicate('UNIT_KEYWORD','UNIT',{keyword:input.keyword})
      :all(input.keywords.map(keyword=>predicate('MODEL_KEYWORD','MODEL',{keyword})));
    if(input.profileId)assert.equal(index.get(input.profileId)?.parentId,input.ownerId,'Foreign MODEL owner');
    const owner={id:'owner',subject:input.kind==='DETACHMENT_RULE'?'UNIT':'MODEL',purpose:'OWNER',allegiance:'FRIENDLY',
      selector,conditions:[]};
    const recipient={id:'recipient',subject:subject(input.targetBinding),purpose:'RECIPIENT',allegiance:'FRIENDLY',
      binding:input.targetBinding,selector:predicate('ALWAYS',subject(input.targetBinding),{}),conditions:[]};
    const conditions=input.leading?[predicate('LEADING','MODEL',{value:true},'leading a unit','ROSTER')]:[];
    const lifetime=input.leading?'WHILE_LEADING':input.kind==='ENHANCEMENT'?'WHILE_ASSIGNED':'WHILE_DETACHMENT_SELECTED';
    const clauseEvidence={...evidence,quote:input.executableQuote||input.quote};
    const clause={id:'roster-known',roles:[clone(owner),clone(recipient)],conditions:clone(conditions),
      sourceFields:[clone(input.field)],evidence:clauseEvidence,rosterClassification:'ROSTER_EXECUTABLE',
      rosterClassificationNote:{reason:'Exact source owner, assignment and formation are roster-known.'},
      rosterEffects:input.effects.map((effect,i)=>({id:`${entity.id}::roster-known/effect-${i+1}`,...clone(effect),
        targetBinding:input.targetBinding,targetSubject:recipient.subject,lifetime,evidence:clone(clauseEvidence),
        sourceFields:[clone(input.field)],conditions:[
          ...(input.kind==='DETACHMENT_RULE'?[{binding:'TARGET',predicate:clone(selector)}]:[]),
          ...conditions.map(predicate=>({binding:'SOURCE',predicate:clone(predicate)}))],
        provenance:{canonicalRuleId:entity.id,canonicalOwnerId:entity.parentId,canonicalClauseId:'roster-known',
          sourceEvidence:clone(entity.provenance),recipientBinding:input.targetBinding}}))};
    // Bind semantic source evidence before adding the disposable executable
    // wrappers, as in the existing books' separate roster lowering stage.
    const effects=clause.rosterEffects;clause.rosterEffects=[];
    const declaration={kind:input.kind,executionMode:input.kind==='DATASHEET_ABILITY'?'DATASHEET_DECLARATION':'DECLARATIVE_APPLICABILITY',
      contextLevel:input.battleQuote?'BATTLE':'ROSTER',sourceFields:[clone(input.field)],roles:[owner,recipient],conditions:[],clauses:[clause]};
    if(input.kind!=='DATASHEET_ABILITY')declaration.detachmentId=entity.parentId;
    if(input.kind==='ENHANCEMENT') {
      declaration.assignment={ownerRoleId:'owner',selector:clone(selector)};
      const binding=mfm.enhancementBindings.find(binding=>binding.entityId===entity.id);
      assert.ok(binding&&binding.scopeOwnerId===entity.parentId,'MFM Enhancement eligibility owner');
      const record=resolveOwnedFact(binding.mfmRecordId);
      const qualifiers=mfm.qualifierBindings.filter(binding=>binding.entityId===entity.id);
      assert.deepEqual(qualifiers.map(binding=>binding.mfmRecordId),record.qualifierIds,'Unconsumed MFM qualifiers');
      declaration.mfmReferences={enhancementId:record.id,detachmentId:record.detachmentId,qualifierIds:clone(record.qualifierIds),
        provenance:clone(record.provenance)};
      if(input.leaderPermission) {
        const permission=input.leaderPermission,qualifier=resolveOwnedFact(permission.qualifierId);
        assert.deepEqual(record.qualifierIds,[permission.qualifierId]);
        assert.equal(qualifier.ownerId,record.id);assert.equal(qualifier.kind,permission.kind);
        assert.deepEqual(qualifier.values,permission.values,'MFM Leader eligibility changed');
        assert.ok(index.get(permission.targetUnitId)?.data.keywords.includes(permission.values[0]));
        assert.ok(index.get(permission.sourceUnitId)?.data.profileIds.some(id=>schema.evaluatePredicate(selector,
          {subject:'MODEL',modelId:id,keywords:new Set([...index.get(permission.sourceUnitId).data.keywords,
            ...index.get(permission.sourceUnitId).data.factionKeywords]),roster:{},battle:{}})==='TRUE'));
        book.rosterAttachmentPolicies.push({sourceId:permission.sourceUnitId,targetId:permission.targetUnitId,
          role:'LEADER',additionalLeaders:0,sourceIds:[entity.id],mfmReferenceId:qualifier.id,
          availability:[{detachmentId:entity.parentId,enhancementId:entity.id}]});
      } else assert.equal(qualifiers.length,0,'Missing qualifier lowering');
    }
    if(input.battleQuote)declaration.clauses.push({id:'character-attack',roles:[clone(owner)],
      conditions:[predicate('FIELD','MODEL',{key:'meleeAttackTargetsCharacter',equals:true},input.battleQuote,'BATTLE')],
      sourceFields:[clone(input.field)],evidence:{...evidence,quote:input.battleQuote},sourceText:input.battleQuote,
      rosterClassification:'BATTLE_ONLY',rosterClassificationNote:{reason:'Requires an actual melee attack targeting a CHARACTER unit; no battle state is simulated.'},rosterEffects:[]});
    entity.ruleContract=bindCanonicalContract({entity,bookId:book.bookId,schema:'rule-contract/v2',
      declaration:bindDeclarationClauses(declaration),index,currentness:{acceptedBaseHead:'9583a5a7521bf6f6002d5a1a76b1c148bcc2a280',
        factualOwner:entity.provenance,currentOfficialSource:'gw-ec-faction-pack-v1.3-2026-09-30'}});
    entity.ruleContract.clauses[0].rosterEffects=effects;
    contracts.push(entity.ruleContract);
  }
  for(const input of permissionInputs) {
    const entity=index.get(input.ruleId),evidence={field:['text'],quote:input.quote};
    assert.equal(entity?.kind,input.kind,'Wrong permission canonical identity');
    assert.equal(entity.parentId,input.ownerId,'Wrong permission owner');
    assert.equal(entity.data.title,input.name);assert.equal(entity.data.text,input.quote,'Permission source changed');
    const atom=(predicate,subject,args,quote=input.quote,contextLevel='STATIC')=>({predicate,subject,contextLevel,
      arguments:args,evidence:{field:['text'],quote}});
    const ownerSubject=input.kind==='ENHANCEMENT'?'MODEL':'UNIT';
    const selector=input.kind==='DETACHMENT_RULE'?atom('UNIT_KEYWORD','UNIT',{keyword:input.keyword}):
      input.keywords.length?all(input.keywords.map(keyword=>atom('MODEL_KEYWORD','MODEL',{keyword}))):atom('ALWAYS','MODEL',{});
    const owner={id:'owner',subject:ownerSubject,purpose:'OWNER',allegiance:'FRIENDLY',
      binding:input.kind==='ENHANCEMENT'?'SOURCE_MODEL':'ROSTER_UNITS',selector,conditions:[]};
    const recipient={id:'recipient',subject:'UNIT',purpose:'RECIPIENT',allegiance:'FRIENDLY',binding:input.targetBinding,
      selector:input.kind==='DETACHMENT_RULE'?clone(selector):atom('ALWAYS','UNIT',{}),conditions:[]};
    const actor=input.event.subject==='MODEL'?{id:'acting-model',subject:'MODEL',purpose:'ACTOR',allegiance:'FRIENDLY',
      binding:'SOURCE_FORMED_MODELS',selector:atom('ALWAYS','MODEL',{}),conditions:[]}:clone(recipient);
    const event=atom('FIELD',input.event.subject,{key:input.event.key,equals:true},input.event.quote,'BATTLE');
    event.roleId=actor.id;
    const source=clone(entity.fieldProvenance?.text||entity.provenance);
    book.rosterAbilityReferences[entity.id]={id:entity.id,title:entity.data.title,parameters:{},
      sourceReference:{bookId:book.bookId,entityId:entity.id,path:'/text'},provenance:source};
    const declaration={kind:input.kind,executionMode:'DECLARATIVE_APPLICABILITY',contextLevel:'BATTLE',detachmentId:entity.parentId,
      sourceFields:[['text']],roles:[owner,recipient],conditions:[],canonicalRuleReferences:[entity.id],
      restrictions:input.restrictions.map(quote=>({field:['text'],quote})),
      clauses:[{id:'permission-reference',roles:[clone(owner),clone(recipient)],conditions:[],sourceFields:[['text']],
        evidence:clone(evidence),rosterClassification:'ROSTER_EXECUTABLE',
        rosterClassificationNote:{reason:'Grant only the canonical passive permission reference; no battle payload is executed.'},rosterEffects:[]},
      {id:input.event.id,roles:[clone(owner),clone(recipient),...(actor.id==='acting-model'?[actor]:[])],conditions:[event],
        sourceFields:[['text']],evidence:clone(evidence),sourceText:entity.data.text,
        effect:{sourceClause:entity.data.text,recipientRoleId:'recipient',parameters:{canonicalRuleReferences:[entity.id]}},
        rosterClassification:'BATTLE_ONLY',rosterClassificationNote:{reason:'Source timing, choices and restrictions require the actual battle event; no roll, movement, modifier cancellation or CP expenditure is executed.'},rosterEffects:[]}]};
    if(input.kind==='ENHANCEMENT') {
      declaration.assignment={ownerRoleId:'owner',selector:clone(selector)};
      const binding=mfm.enhancementBindings.find(binding=>binding.entityId===entity.id),record=resolveOwnedFact(binding?.mfmRecordId);
      assert.equal(binding.scopeOwnerId,entity.parentId,'Wrong MFM Enhancement Detachment');
      assert.deepEqual(record.qualifierIds,[],'Unlowered MFM eligibility qualifier');
      declaration.mfmReferences={enhancementId:record.id,detachmentId:record.detachmentId,qualifierIds:[],provenance:clone(record.provenance)};
    }
    if(input.coreReferenceId) {
      const reference=core.getById(input.coreReferenceId);
      assert.equal(reference?.state,'FULL_CONTENT','Unresolved Core permission dependency');
      declaration.canonicalRuleReferences.push(reference.id);
      declaration.coreReferences=[{id:reference.id,provenance:clone(reference.provenance)}];
    }
    const contract=bindCanonicalContract({entity,bookId:book.bookId,schema:'rule-contract/v2',index,
      declaration:bindDeclarationClauses(declaration),currentness:{acceptedBaseHead:'6d15477e5bfa12ca2a7fe7b75da68a82c685dd5b',
        factualOwner:source,currentOfficialSource:'gw-ec-faction-pack-v1.3-2026-09-30'}});
    contract.clauses[0].rosterEffects=[{id:`${entity.id}::permission-reference/effect-1`,operation:'GRANT_ABILITY',
      ability:{canonicalId:entity.id,parameters:{}},targetSubject:'UNIT',targetBinding:input.targetBinding,unitScope:'FORMED',
      conditions:input.kind==='DETACHMENT_RULE'?[{binding:'TARGET',predicate:clone(selector)}]:[],
      lifetime:input.kind==='DETACHMENT_RULE'?'WHILE_DETACHMENT_SELECTED':'WHILE_ASSIGNED',
      evidence:clone(evidence),sourceFields:[['text']],
      provenance:{canonicalRuleId:entity.id,canonicalOwnerId:entity.parentId,canonicalClauseId:'permission-reference',
        sourceEvidence:source,recipientBinding:input.targetBinding}}];
    entity.ruleContract=contract;contracts.push(contract);
  }
  const composition=book.entities.filter(e=>e.kind==='DATASHEET').flatMap(unit=>unit.data.profileIds.map(profileId=>({
    unitId:unit.id,profileId,intrinsicKeywords:[...unit.data.keywords,...unit.data.factionKeywords],
    maxModels:unit.data.compositionMemberIds.map(id=>index.get(id)).filter(member=>member.data.modelProfileId===profileId)
      .reduce((n,member)=>n+member.data.quantity.max,0)})));
  book.compatibilityFeasibility=buildAttachmentFeasibility(book,composition);
  schema.validateContracts(book);
  validateRosterEffects(book,schema.validatePredicate,schema.evaluatePredicate);
  assert.equal(JSON.stringify(facts),before,'Factual input mutated');
  const scope={implementedRules:10+permissionInputs.length,directReuseRules:10,bindingAdaptationRules:permissionInputs.length,
    remainingLegacyContracts:'NOT_MIGRATED_OR_CLASSIFIED_BY_THIS_BUILD'};
  return {book,schema,contracts,scope,
    artifact:{schema:'ec-v2-rule-contract-foundation/v1',authority:'BOOK_OWNED_DERIVED_CONTRACT_OVERLAY',
      scope,
      sourceFingerprint:sha(JSON.stringify(facts)),declarationFingerprint:sha(fs.readFileSync(new URL('./rule-contract-declarations.mjs',import.meta.url))),
      permissionDeclarationFingerprint:sha(fs.readFileSync(new URL('./rule-contract-permission-declarations.mjs',import.meta.url))),
      contracts,abilityReferences:book.rosterAbilityReferences,attachmentPolicies:book.rosterAttachmentPolicies}};
}

if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href) {
  const {artifact}=buildECContracts(),file=path.join(directory,'generated/rule-contracts.json'),bytes=JSON.stringify(artifact,null,2)+'\n';
  if(process.argv.includes('--check'))assert.equal(fs.readFileSync(file,'utf8'),bytes,'Stale EC Rule Contract output');
  else fs.writeFileSync(file,bytes);
  console.log(JSON.stringify({status:'PASS',contracts:artifact.contracts.length,
    operations:artifact.contracts.flatMap(c=>c.clauses.flatMap(c=>c.rosterEffects)).length,mode:process.argv.includes('--check')?'CHECK':'BUILD'}));
}

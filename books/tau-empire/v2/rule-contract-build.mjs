import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {declarations,enhancementEligibility,pendingPhysicalBindings} from './rule-contract-declarations.mjs';
import {consumeMfm} from './mfm-boundary.mjs';
import {createEffectiveCoreCatalog} from '../../core-rules/content/effective-core-catalog.mjs';
import {createRuleContractSchema} from '../../shared/rule-contract-v2/schema.mjs';
import {bindCanonicalContract,bindDeclarationClauses} from '../../shared/rule-contract-v2/bindings.mjs';
import {validateRosterEffects} from '../../shared/roster-v2/effects.mjs';
import {buildAttachmentFeasibility} from '../../shared/roster-v2/compatibility-feasibility.mjs';

const read=name=>JSON.parse(fs.readFileSync(new URL(name,import.meta.url),'utf8'));
const clone=structuredClone,at=(value,path)=>path.reduce((v,key)=>v?.[key],value);
const sha=value=>createHash('sha256').update(value).digest('hex').toUpperCase();
export function createTauRuleSchema(){
  return createRuleContractSchema({stateFields:{
    attached:{contextLevel:'ROSTER',valueType:'boolean'},
    equipmentRequirementSatisfied:{contextLevel:'ROSTER',valueType:'boolean'},
    battleConditionSatisfied:{contextLevel:'BATTLE',valueType:'boolean'}
  }});
}

/** Disposable contract view, like EC/Tyranids. No parser, importer or execution code. */
export function buildTauContracts({facts=read('./generated/effective.json'),inputs=declarations,
  review=read('./rule-clause-review.json'),pendingInputs=pendingPhysicalBindings}={}){
  const original=JSON.stringify(facts),book=clone(facts),index=new Map(book.entities.map(e=>[e.id,e]));
  assert.equal(book.bookId,'tau-empire');assert.equal(index.size,book.entities.length,'Duplicate canonical owner');
  assert.ok(book.entities.every(e=>!e.ruleContract),'Factual owner must not contain contracts');
  assert.equal(sha(original),review.factualFingerprint,'UNREVIEWED_SOURCE_RULE: factual source changed');
  const mfm=consumeMfm(facts.entities),core=createEffectiveCoreCatalog(),schema=createTauRuleSchema();
  // Adapt the established shared PROFILE interface; do not replace factual IDs/data.
  const modelProfiles=book.entities.filter(e=>e.kind==='MODEL_PROFILE');
  book.rosterProfileBindings=modelProfiles.map(e=>({unitId:e.parentId,profileId:e.id,
    intrinsicKeywords:[...new Set([...index.get(e.parentId).data.keywords,...index.get(e.parentId).data.factionKeywords])]}));
  for(const profile of modelProfiles)profile.kind='PROFILE';
  book.rosterAttachmentPolicies=mfm.leaderRelations.map(row=>({sourceId:row.sourceId,targetId:row.targetId,
    role:'LEADER',additionalLeaders:0,sourceIds:[row.declarationId],mfmReferenceId:row.mfmRecordId}));
  // These are existing ordinary single-Leader relations for executor probes.
  // The Kroot two-Leader/Starting Strength declaration is deliberately not lowered.
  book.rosterAbilityReferences={};
  for(const id of ['core-infiltrators']){
    const fact=core.getById(id);assert.equal(fact?.state,'FULL_CONTENT');assert.equal(fact.kind,'ability');
    book.rosterAbilityReferences[id]={id:fact.id,title:fact.title,parameters:{},provenance:clone(fact.provenance)};
  }
  const reviews=new Map();
  for(const row of review.records){
    assert.ok(row.id&&!reviews.has(row.id),'Duplicate reviewed clause');reviews.set(row.id,row);
    const fact=index.get(row.canonicalId);
    assert.ok(fact&&row.ownerId===(fact.parentId||book.bookId),'Reviewed canonical owner changed');
    const value=at(fact.data,row.field);
    assert.ok(typeof value==='string'&&value.includes(row.quote),'Reviewed clause source changed: '+row.id);
    assert.equal(sha(value),row.sourceFieldSha256,'UNREVIEWED_SOURCE_RULE: source block changed');
    assert.equal(sha(row.quote),row.sourceQuoteSha256,'Reviewed clause fingerprint changed');
    assert.ok(['EXECUTABLE','CONDITIONAL / DISPLAY','CAPABILITY_MISSING','SOURCE_CONFLICT / NOT_PROVEN'].includes(row.classification));
    assert.ok(row.explanation&&row.provenance?.sourceId,'Unexplained source classification');
  }
  assert.equal(review.bookId,book.bookId);
  const gameplayKinds=new Set(['ARMY_RULE_COMPONENT','DETACHMENT_RULE','ENHANCEMENT','RULE_REFERENCE','EQUIPMENT_RULE','STRATAGEM']);
  // Firesight's composition block additionally contains the explicit single-
  // MODEL/sniper-drone convention; ordinary composition counts stay Stage 2.
  const gameplay=book.entities.filter(e=>gameplayKinds.has(e.kind)||e.kind==='DATASHEET_SECTION'&&
    (e.data.title!=='UNIT COMPOSITION'||e.id==='datasheet-firesight-team:section:2'));
  assert.deepEqual([...new Set(review.records.map(r=>r.canonicalId))].sort(),gameplay.map(e=>e.id).sort(),'UNREVIEWED_SOURCE_RULE: source owner coverage');
  for(const entity of gameplay.filter(e=>e.kind==='DATASHEET_SECTION'&&e.data.title==='ABILITIES'))
    entity.data.blocks.forEach((block,i)=>assert.ok(review.records.some(r=>r.canonicalId===entity.id&&JSON.stringify(r.field)===JSON.stringify(['blocks',i,'text'])),'UNREVIEWED_SOURCE_RULE: ability block'));
  const grouped=new Map();
  for(const input of inputs){
    const fact=index.get(input.ruleId);
    assert.equal(fact?.parentId,input.ownerId,'Wrong canonical source owner');
    assert.ok(typeof at(fact.data,input.field)==='string'&&at(fact.data,input.field).includes(input.quote),'Source binding changed');
    assert.ok(input.effects.length,'Missing executable operation');
    const rows=grouped.get(input.ruleId)||[];assert.ok(!rows.some(r=>r.clauseId===input.clauseId),'Duplicate executable clause');
    rows.push(input);grouped.set(input.ruleId,rows);
  }
  book.rosterReferenceSemantics={};
  const native=[];
  for(const ref of book.entities.filter(e=>e.kind==='RULE_REFERENCE')){
    const rows=review.records.filter(r=>r.canonicalId===ref.id);
    assert.equal(rows.length,1,'Unreviewed/duplicate native source occurrence');
    const link=facts.coreReferences[ref.data.label];assert.ok(link,'Unbound native identity');
    if(!link.targetId.startsWith('core-')){
      assert.notEqual(rows[0].classification,'EXECUTABLE','Army reference is not an unconditional attack modifier');continue;
    }
    const owner=index.get(ref.parentId),target=core.getById(link.targetId);
    assert.equal(target?.state,'FULL_CONTENT');assert.equal(target.id,link.targetId);
    assert.equal(rows[0].classification,'EXECUTABLE');
    assert.deepEqual(ref.data.recipient.modelProfileIds,owner.data.profileIds);
    assert.deepEqual(ref.data.recipient.compositionMemberIds,owner.data.compositionMemberIds);
    book.rosterReferenceSemantics[ref.id]={scope:'MODEL',modelProfileIds:clone(ref.data.recipient.modelProfileIds),
      compositionMemberIds:clone(ref.data.recipient.compositionMemberIds),
      abilities:[{canonicalId:target.id,name:ref.data.label,parameters:clone(link.parameters)}],
      sourceFields:[['label']],sourceId:ref.provenance.sourceId,provenance:clone(ref.provenance)};
    native.push({referenceId:ref.id,ownerId:ref.parentId,canonicalAbilityId:target.id,parameters:clone(link.parameters),reviewId:rows[0].id});
  }
  const contracts=[],lowered=new Set();
  for(const [ruleId,rows] of Map.groupBy(review.records.filter(r=>index.get(r.canonicalId).kind!=='RULE_REFERENCE'),r=>r.canonicalId)){
    const entity=index.get(ruleId),specs=grouped.get(ruleId)||[],enhancement=entity.kind==='ENHANCEMENT',detachment=entity.kind==='DETACHMENT_RULE';
    const first=rows[0],defaultProof={field:clone(first.field),quote:first.quote};
    const atom=(predicate,subject,args,proof=defaultProof,level='STATIC')=>({predicate,subject,arguments:args,contextLevel:level,evidence:clone(proof)});
    const all=nodes=>nodes.length===1?nodes[0]:{op:'ALL',args:nodes};
    const any=nodes=>nodes.length===1?nodes[0]:{op:'ANY',args:nodes};
    const eligible=enhancement?enhancementEligibility[ruleId]:null;
    if(enhancement){assert.ok(eligible,'Missing source eligibility');assert.equal(eligible.eligibilityEvidence,entity.data.eligibilityText);}
    const ownerSubject=eligible?.subject||'UNIT';
    const ownerPredicate=()=>{
      if(!enhancement)return atom('ALWAYS',ownerSubject,{});
      const evidence={field:['eligibilityText'],quote:eligible.eligibilityEvidence},nodes=[];
      if(eligible.unitIds){
        const ids=eligible.subject==='UNIT'?eligible.unitIds:eligible.unitIds.flatMap(id=>index.get(id).data.profileIds);
        nodes.push(any(ids.map(id=>atom(eligible.subject==='UNIT'?'UNIT_ID':'MODEL_ID',ownerSubject,{id},evidence))));
      }
      for(const keyword of eligible.keywords||[])nodes.push(atom(ownerSubject+'_KEYWORD',ownerSubject,{keyword},evidence));
      if(eligible.excludeAllKeywords)nodes.push({op:'NOT',args:[all(eligible.excludeAllKeywords.map(keyword=>atom(ownerSubject+'_KEYWORD',ownerSubject,{keyword},evidence)))]});
      return all(nodes);
    };
    const owner={id:'owner',subject:ownerSubject,purpose:'OWNER',allegiance:'FRIENDLY',selector:ownerPredicate(),conditions:[]};
    const declaration={kind:enhancement?'ENHANCEMENT':detachment?'DETACHMENT_RULE':entity.kind==='STRATAGEM'?'STRATAGEM':entity.kind.startsWith('ARMY_RULE')?'ARMY_RULE':entity.kind==='DATASHEET_SECTION'?'DATASHEET_ABILITY':'OTHER_RULE',
      executionMode:entity.kind==='STRATAGEM'?'BATTLE_ACTION':'DECLARATIVE_APPLICABILITY',contextLevel:'ROSTER',
      roles:[owner],conditions:[],sourceFields:[],clauses:[]};
    if(enhancement||detachment)declaration.detachmentId=entity.parentId;
    if(enhancement)declaration.assignment={ownerRoleId:'owner',selector:clone(owner.selector),
      identity:ownerSubject==='MODEL'?'EXACT_PHYSICAL_INSTANCE_MODEL_PROFILE':'EXACT_PHYSICAL_INSTANCE_UNIT',
      ...(ownerSubject==='UNIT'?{classification:'UNIT_UPGRADE'}:{})};
    if(entity.kind==='STRATAGEM')Object.assign(declaration,{cp:entity.data.cp,timing:clone(entity.data.lines.filter(r=>r.label==='WHEN')),
      duration:[],restrictions:clone(entity.data.lines.filter(r=>r.label==='RESTRICTIONS'))});
    for(const row of rows){
      const evidence={field:clone(row.field),quote:row.quote};
      const candidates=specs.filter(input=>JSON.stringify(input.field)===JSON.stringify(row.field)&&
        (input.quote.includes(row.quote)||row.quote.includes(input.quote)));
      if(row.classification==='EXECUTABLE')assert.ok(candidates.length,'EXECUTABLE_MISSING: '+row.id);
      const display=row.classification!=='EXECUTABLE';
      if(display){
        const staticPresentation=entity.kind==='DATASHEET_SECTION'&&['LEADER','TRANSPORT','UNIT COMPOSITION','SUPREME COMMANDER','INDEPENDENT POWER'].includes(entity.data.title);
        const battle=row.classification==='CONDITIONAL / DISPLAY'&&!staticPresentation;
        const condition=battle?atom('FIELD',ownerSubject,{key:'battleConditionSatisfied',equals:true},evidence,'BATTLE'):null;
        declaration.clauses.push({id:row.id,roles:[clone(owner)],conditions:condition?[condition]:[],sourceFields:[clone(row.field)],
          evidence,sourceText:row.quote,rosterClassification:battle?'BATTLE_ONLY':'DISPLAY_ONLY',
          rosterClassificationNote:{reason:row.explanation,reviewClassification:row.classification,dependencies:clone(row.dependencies),
            reviewedRecipient:{scope:row.recipientScope,description:row.recipient,runtimeSelector:false,
              ...(row.sourceRecipientDefinition?{sourceDefinition:clone(row.sourceRecipientDefinition)}:{})},
            activationConditions:row.activationConditions},rosterEffects:[]});
        if(battle)declaration.contextLevel='BATTLE';
        continue;
      }
      for(const input of candidates){
        // A reviewed split rule can share one explicit lowering containing multiple operations.
        if(lowered.has(ruleId+'::'+input.clauseId))continue;
        assert.equal(row.classification,'EXECUTABLE','Non-executable clause cannot gain runtime-authoritative effects');
        lowered.add(ruleId+'::'+input.clauseId);
        const proof={field:clone(input.field),quote:input.quote},conditions=[];
        if(input.leading)conditions.push({binding:'SOURCE',predicate:atom('LEADING',ownerSubject,{value:true},proof,'ROSTER')});
        if(input.equipment)conditions.push({binding:'SOURCE',predicate:atom('FIELD','UNIT',{key:'equipmentRequirementSatisfied',equals:true},proof,'ROSTER')});
        if(input.targetUnitIds||input.targetKeywords){
          const nodes=(input.targetUnitIds||[]).map(id=>atom('UNIT_ID','UNIT',{id},proof));
          const selector=input.targetUnitIds?any(nodes):all(input.targetKeywords.map(keyword=>atom('UNIT_KEYWORD','UNIT',{keyword},proof)));
          conditions.push({binding:'TARGET',predicate:selector});
        }
        const effects=input.effects.map((operation,i)=>({id:`${ruleId}::${input.clauseId}/effect-${i+1}`,...clone(operation),
          targetBinding:input.targetBinding,targetSubject:input.targetSubject,conditions:clone(conditions),evidence:clone(proof),sourceFields:[clone(input.field)],
          lifetime:input.leading?'WHILE_LEADING':enhancement?'WHILE_ASSIGNED':detachment?'WHILE_DETACHMENT_SELECTED':input.equipment?'WHILE_EQUIPPED':'WHILE_SOURCE_UNIT_PRESENT',
          ...(input.equipment?{equipmentRequirement:{binding:'SOURCE',kind:'EQUIPMENT_PRESENT',equipmentId:entity.id,sourceFieldPath:clone(input.field)}}:{}),
          provenance:{canonicalRuleId:ruleId,canonicalOwnerId:input.ownerId,canonicalClauseId:input.clauseId,
            sourceEvidence:clone(entity.provenance),...(entity.fieldProvenance?{fieldProvenance:clone(entity.fieldProvenance)}:{})}}));
        const roles=[clone(owner)];
        // SOURCE equipment gate uses the physical UNIT; it is not Enhancement eligibility.
        if(conditions.some(c=>c.predicate.subject!==ownerSubject))assert.ok(!enhancement,'Mixed source subject needs an explicit participant');
        declaration.clauses.push({id:input.clauseId,roles,conditions:[],sourceFields:[clone(input.field)],evidence:proof,sourceText:input.quote,
          rosterClassification:'ROSTER_EXECUTABLE',rosterClassificationNote:{reason:row.explanation,reviewIds:candidates.flatMap(()=>rows.filter(r=>r.classification==='EXECUTABLE'&&JSON.stringify(r.field)===JSON.stringify(input.field)&&(r.quote.includes(input.quote)||input.quote.includes(r.quote))).map(r=>r.id))},rosterEffects:effects});
      }
    }
    // Match the existing producers: bind semantic roles/evidence first, then
    // attach the separately validated roster-effect participant wrappers.
    const pendingEffects=new Map(declaration.clauses.map(c=>[c.id,c.rosterEffects]));
    for(const clause of declaration.clauses)clause.rosterEffects=[];
    const contract=bindCanonicalContract({entity,bookId:book.bookId,schema:'rule-contract/v2',index,
      declaration:bindDeclarationClauses(declaration),currentness:{acceptedBaseHead:'196f92940394b2cdacbda9bfdd21a2011aafc78f',
        factualOwner:clone(entity.provenance),currentOfficialSource:'tau-empire-faction-pack-v1.1'}});
    for(const clause of contract.clauses)clause.rosterEffects=pendingEffects.get(clause.id);
    entity.ruleContract=contract;contracts.push(contract);
  }
  assert.equal(lowered.size,inputs.length,'Orphan/duplicate executable declaration');
  const pending=pendingInputs.map(input=>{
    const entity=index.get(input.ruleId);assert.equal(entity?.parentId,input.ownerId,'Wrong pending source owner');
    assert.equal(entity?.kind,'ENHANCEMENT');assert.equal(input.status,'NOT_PROVEN');
    assert.equal(input.dependency,'one-physical-weapon-choice');
    assert.ok(entity.ruleContract.clauses.every(c=>c.rosterEffects.length===0),'Unconfirmed physical weapon effect activated');
    assert.ok(input.eligibleWeaponProfileIds.length&&new Set(input.eligibleWeaponProfileIds).size===input.eligibleWeaponProfileIds.length);
    for(const id of input.eligibleWeaponProfileIds){
      const weapon=index.get(id);assert.equal(weapon?.kind,'WEAPON_PROFILE');
      assert.ok(index.get(weapon.parentId).data.keywords.includes('BATTLESUIT'),'Foreign pending weapon bearer');
    }
    return {...clone(input),sourceReference:{bookId:book.bookId,entityId:entity.id,path:'/text'},
      sourceText:at(entity.data,input.field),provenance:clone(entity.provenance),executable:false,
      missingBinding:'Exact physical Enhancement bearer + one physical weapon occurrence. Canonical weapon ID alone does not choose among duplicate weapons.'};
  });
  const composition=book.rosterProfileBindings.map(binding=>({...clone(binding),
    maxModels:facts.entities.filter(e=>e.kind==='COMPOSITION_MEMBER'&&e.data.modelProfileId===binding.profileId).reduce((n,e)=>n+e.data.quantity.max,0)}));
  book.compatibilityFeasibility=buildAttachmentFeasibility(book,composition);
  schema.validateContracts(book);validateRosterEffects(book,schema.validatePredicate,schema.evaluatePredicate);
  assert.equal(JSON.stringify(facts),original,'Stage 2 factual foundation changed');
  const deferred=review.records.filter(r=>r.classification!=='EXECUTABLE').map(row=>({...clone(row),executable:false,
    sourceReference:{bookId:book.bookId,entityId:row.canonicalId,path:'/'+row.field.join('/')}}));
  const artifact={schema:'tau-empire-v2-rule-contracts/v1',authority:'BOOK_OWNED_DERIVED_OVERLAY',
    factualFingerprint:sha(original),declarationFingerprint:sha(fs.readFileSync(new URL('./rule-contract-declarations.mjs',import.meta.url))),
    reviewFingerprint:sha(JSON.stringify(review)),contracts,nativeReferenceSemantics:clone(book.rosterReferenceSemantics),
    nativeBindings:native,pendingPhysicalBindings:pending,deferred,coverage:clone(review.coverage),physicalImportImplemented:false,frontendVerified:false};
  return {book,schema,contracts,deferred,artifact};
}

if(process.argv[1]&&fileURLToPath(import.meta.url)===fs.realpathSync(process.argv[1])){
  const {artifact}=buildTauContracts(),target=new URL('./generated/rule-contracts.json',import.meta.url),bytes=JSON.stringify(artifact,null,2)+'\n';
  if(process.argv.includes('--check'))assert.equal(fs.readFileSync(target,'utf8'),bytes,'Stale T’au rule contracts');
  else fs.writeFileSync(target,bytes);
  console.log(JSON.stringify({status:'PASS',contracts:artifact.contracts.length,nativeBindings:artifact.nativeBindings.length,
    executableClauses:artifact.contracts.flatMap(c=>c.clauses).filter(c=>c.rosterEffects.length).length,deferred:artifact.deferred.length}));
}

import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {buildTyranidsImportBook} from './roster-import-build.mjs';
import {resolveOwnedFact} from './mfm-boundary.mjs';
import {declarations,conditionalCandidates} from './rule-contract-declarations.mjs';
import {createTyranidsRuleSchema} from './roster-source-choices.mjs';
export {createTyranidsRuleSchema} from './roster-source-choices.mjs';
import {bindCanonicalContract,bindDeclarationClauses} from '../../shared/rule-contract-v2/bindings.mjs';
import {validateRosterEffects} from '../../shared/roster-v2/effects.mjs';
import {buildAttachmentFeasibility} from '../../shared/roster-v2/compatibility-feasibility.mjs';
import {createEffectiveCoreCatalog} from '../../core-rules/content/effective-core-catalog.mjs';

const clone=structuredClone,sha=value=>createHash('sha256').update(value).digest('hex').toUpperCase();
const read=name=>JSON.parse(fs.readFileSync(new URL(name,import.meta.url),'utf8'));

/** Book-owned lowering over the existing import/factual owner. No new facts. */
export function buildTyranidsContracts({facts=read('./generated/effective.json'),inputs=declarations}={}){
  const before=JSON.stringify(facts),book=buildTyranidsImportBook(facts),index=new Map(book.entities.map(e=>[e.id,e]));
  assert.equal(inputs.length,19,'Bounded reviewed executable inventory: eighteen owners plus explicit Surprise Assault choice');
  assert.equal(new Set(inputs.map(d=>d.id)).size,19,'Duplicate semantic owner');
  const core=createEffectiveCoreCatalog();
  book.rosterAbilityReferences=Object.fromEntries(['core-stealth','core-deep-strike'].map(id=>{
    const record=core.getById(id);
    assert.equal(record?.kind,'ability');assert.equal(record.state,'FULL_CONTENT');
    return [id,{id:record.id,title:record.title,parameters:{},provenance:clone(record.provenance)}];
  }));
  // Exact accepted psychic profile identities. A PSYKER bearer does not make
  // its other weapons psychic, and matching weapon titles is not a selector.
  const psychicWeaponIds=['datasheet-maleceptor:weapon:1','datasheet-neurotyrant:weapon:1',
    'datasheet-norn-emissary:weapon:1','datasheet-norn-emissary:weapon:2','datasheet-norn-emissary:weapon:3',
    'datasheet-the-swarmlord:weapon:1','datasheet-zoanthropes:weapon:1','datasheet-zoanthropes:weapon:2'];
  assert.deepEqual(book.entities.filter(e=>e.kind==='WEAPON_PROFILE'&&e.data.abilities?.includes('psychic')).map(e=>e.id).sort(),
    [...psychicWeaponIds].sort(),'Reviewed psychic weapon inventory changed');
  for(const id of psychicWeaponIds){
    const weapon=index.get(id),unit=index.get(weapon.parentId);
    assert.ok(unit.data.weaponIds.includes(id)&&unit.data.keywords.includes('PSYKER')&&unit.data.factionKeywords.includes('TYRANIDS'),
      'Psychic weapon identity is not owned by an eligible factual unit');
  }
  const nativeIds=['datasheet-old-one-eye:rule-reference:1','datasheet-psychophage:rule-reference:2'];
  assert.deepEqual(Object.keys(book.rosterReferenceSemantics).sort(),nativeIds.sort(),'Unreviewed native bag');
  for(const id of nativeIds){
    const ref=index.get(id),seed=book.rosterReferenceSemantics[id],owner=index.get(ref?.parentId);
    assert.equal(ref?.kind,'RULE_REFERENCE');assert.equal(ref.data.label,'Feel No Pain 5+');
    assert.ok(owner?.data.ruleReferenceIds.includes(id),'Native reference lost its owner');
    assert.equal(seed.scope,'MODEL');assert.deepEqual(seed.abilities,[{name:'Feel No Pain',value:5}]);
    assert.deepEqual(seed.modelProfileIds,ref.data.recipient.modelProfileIds);
    assert.deepEqual(seed.compositionMemberIds,ref.data.recipient.compositionMemberIds);
    assert.ok(seed.modelProfileIds.every(profileId=>owner.data.profileIds.includes(profileId)),'Foreign native MODEL profile');
    assert.ok(seed.compositionMemberIds.every(memberId=>index.get(memberId)?.parentId===owner.id),'Foreign native composition');
    assert.deepEqual(seed.provenance,ref.provenance);
    assert.ok(seed.provenance?.sourceId,'Missing native provenance');
  }
  const schema=createTyranidsRuleSchema(),contracts=[];
  const currentOfficialSource=read('./sources/enrollment.json').currentOfficialSource.id;
  for(const input of inputs){
    const entity=index.get(input.id),field=clone(input.field);
    assert.equal(entity?.parentId,input.owner,'Wrong canonical owner');
    const enhancement=entity.kind==='ENHANCEMENT',detachmentRule=entity.kind==='DETACHMENT_RULE';
    assert.ok(['ENHANCEMENT','DETACHMENT_RULE','DATASHEET_SECTION'].includes(entity.kind));
    assert.equal(field.reduce((v,k)=>v?.[k],entity.data),input.quote,'Reviewed source wording changed');
    if(enhancement){assert.equal(entity.data.title,input.name);assert.equal(entity.data.scope,input.subject);}
    if(input.profileId)assert.equal(index.get(input.profileId)?.parentId,input.owner,'Foreign MODEL identity');
    for(const profileId of input.profileIds||[])assert.ok(index.get(profileId)?.kind==='PROFILE'&&
      index.get(index.get(profileId).parentId)?.data.profileIds.includes(profileId),'Foreign alternative MODEL identity');
    if(input.unitId)assert.equal(index.get(input.unitId)?.kind,'DATASHEET','Unresolved UNIT identity');
    const evidence={field,quote:input.quote};
    const atom=(predicate,subject,args,quote=input.quote,contextLevel='STATIC')=>({predicate,subject,contextLevel,
      arguments:args,evidence:{field:clone(field),quote}});
    const anyIds=(subject,ids)=>({op:'ANY',args:ids.map(id=>{
      assert.equal(index.get(id)?.kind,subject==='MODEL'?'PROFILE':'DATASHEET','Unresolved exact recipient identity');
      return atom(subject+'_ID',subject,{id});
    })});
    const selector=input.profileId?atom('MODEL_ID','MODEL',{id:input.profileId}):input.profileIds?anyIds('MODEL',input.profileIds):input.unitId?
      atom('UNIT_ID','UNIT',{id:input.unitId}):detachmentRule?atom('ALWAYS','UNIT',{}):{op:'ALL',args:input.keywords.map(keyword=>atom('MODEL_KEYWORD','MODEL',{keyword}))};
    let targetSelector=input.targetUnitIds?anyIds('UNIT',input.targetUnitIds):input.targetKeywords?
      {op:'ALL',args:input.targetKeywords.map(keyword=>atom(input.targetSubject+'_KEYWORD',input.targetSubject,{keyword}))}:null;
    if(input.selectedOptionId)targetSelector={op:'ALL',args:[atom('UNIT_ID','UNIT',{id:input.targetUnitIds[0]}),
      atom('FIELD','UNIT',{key:'selectedSurpriseAssaultChoice',equals:input.selectedOptionId},input.executableQuote,'ROSTER')]};
    const owner={id:'owner',subject:input.subject,purpose:'OWNER',allegiance:'FRIENDLY',selector,conditions:[]};
    const recipient={id:'recipient',subject:input.targetSubject,purpose:'RECIPIENT',allegiance:'FRIENDLY',
      binding:input.targetBinding,selector:targetSelector||atom('ALWAYS',input.targetSubject,{}),conditions:[]};
    const conditions=input.leading?[atom('LEADING',input.subject,{value:true},'leading a unit','ROSTER')]:[];
    const executableEvidence={field:clone(field),quote:input.executableQuote||input.quote};
    const clause={id:'roster-known',roles:[clone(owner),clone(recipient)],conditions:clone(conditions),sourceFields:[clone(field)],
      evidence:clone(executableEvidence),sourceText:input.executableQuote||input.quote,rosterClassification:'ROSTER_EXECUTABLE',
      rosterClassificationNote:{reason:'Exact physical source assignment/formation is known from the roster.'},rosterEffects:[]};
    const declaration={kind:enhancement?'ENHANCEMENT':detachmentRule?'DETACHMENT_RULE':'DATASHEET_ABILITY',executionMode:'DECLARATIVE_APPLICABILITY',
      contextLevel:'ROSTER',sourceFields:[clone(field)],roles:[owner,recipient],conditions:[],clauses:[clause]};
    if(detachmentRule)declaration.detachmentId=entity.parentId;
    if(enhancement){
      declaration.detachmentId=entity.parentId;
      declaration.assignment={ownerRoleId:'owner',selector:clone(selector),
        identity:input.upgrade?'EXACT_PHYSICAL_INSTANCE_UNIT':'EXACT_PHYSICAL_INSTANCE_MODEL_PROFILE',
        ...(input.upgrade?{classification:'UNIT_UPGRADE'}:{})};
      const bridge=book.mfmImportReferences.partitions.enhancementBindings.find(b=>b.entityId===input.id),record=resolveOwnedFact(bridge?.mfmRecordId);
      assert.deepEqual(record.qualifierIds,[],'Unlowered central eligibility qualifier');
      assert.equal(record.provenance.sourceVersion,'v1.6');
      declaration.mfmReferences={enhancementId:record.id,detachmentId:record.detachmentId,qualifierIds:[],provenance:clone(record.provenance)};
    }
    const addConditional=(id,path,quote,reason)=>{
      declaration.contextLevel='BATTLE';
      const event={predicate:'FIELD',subject:input.subject,contextLevel:'BATTLE',arguments:{key:'battleConditionSatisfied',equals:true},
        evidence:{field:clone(path),quote}};
      declaration.clauses.push({id,roles:[clone(owner)],conditions:[event],sourceFields:[clone(path)],evidence:{field:clone(path),quote},
        sourceText:quote,rosterClassification:'BATTLE_ONLY',rosterClassificationNote:{reason},rosterEffects:[]});
    };
    if(input.battleQuote)addConditional('battle-dependent',field,input.battleQuote,'Requires battle timing/state; no automatic activation.');
    if(entity.kind==='DATASHEET_SECTION')entity.data.blocks.forEach((block,i)=>{
      if(i!==field[1])addConditional('conditional-block-'+i,['blocks',i,'text'],block.text,'Preserved sibling ability requires battle timing, distance or player action.');
    });
    // One canonical Detachment rule may contain independent UNIT and MODEL
    // effects. Preserve their separate recipients and source clauses.
    const additional=(input.additionalRosterClauses||[]).map(spec=>{
      assert.ok(input.quote.includes(spec.quote),'Unproven additional executable clause');
      const selectors={unit:anyIds('UNIT',spec.unitIds),model:anyIds('MODEL',spec.profileIds)};
      const role={id:'model-recipient',subject:spec.targetSubject,purpose:'RECIPIENT',allegiance:'FRIENDLY',
        binding:spec.targetBinding,selector:clone(selectors.model),conditions:[]};
      const extra={id:spec.id,roles:[clone(owner),role],conditions:[],sourceFields:[clone(field)],
        evidence:{field:clone(field),quote:spec.quote},sourceText:spec.quote,rosterClassification:'ROSTER_EXECUTABLE',
        rosterClassificationNote:{reason:'Exact source-defined physical MODEL profiles within explicit physical UNIT owners.'},rosterEffects:[]};
      declaration.clauses.push(extra);return {spec,selectors,extra};
    });
    const contract=bindCanonicalContract({entity,bookId:book.bookId,schema:'rule-contract/v2',index,
      declaration:bindDeclarationClauses(declaration),currentness:{acceptedBaseHead:'c0ac0d890973d1dc5a8f9979bbb614ee8ebee7e2',
        factualOwner:clone(entity.provenance),currentOfficialSource}});
    clause.rosterEffects=input.effects.flatMap((spec,i)=>{
      const {psychicWeapons,...operation}=clone(spec);
      const effect={id:`${input.id}::roster-known/effect-${i+1}`,...operation,...(psychicWeapons?{weaponIds:clone(psychicWeaponIds)}:{}),targetSubject:input.targetSubject,
        targetBinding:input.targetBinding,conditions:[...conditions.map(predicate=>({binding:'SOURCE',predicate:clone(predicate)})),
          ...(targetSelector?[{binding:'TARGET',predicate:clone(targetSelector)}]:[])],
        evidence:clone(executableEvidence),sourceFields:[clone(field)],lifetime:input.lifetime||(input.leading?'WHILE_LEADING':enhancement?'WHILE_ASSIGNED':detachmentRule?'WHILE_DETACHMENT_SELECTED':'WHILE_SOURCE_UNIT_PRESENT'),
        provenance:{canonicalRuleId:entity.id,canonicalOwnerId:entity.parentId,canonicalClauseId:'roster-known',sourceEvidence:clone(entity.provenance)}};
      if(!input.formedModels)return [effect];
      effect.conditions.push({binding:'SOURCE',predicate:atom('FIELD',input.subject,{key:'attached',equals:false},input.quote,'ROSTER')});
      const attached=clone(effect);attached.id+='/formed';attached.targetBinding='SOURCE_FORMED_MODELS';
      attached.conditions.at(-1).predicate.arguments.equals=true;
      return [effect,attached];
    });
    contract.clauses[0].rosterEffects=clause.rosterEffects;
    for(const {spec,selectors,extra}of additional)contract.clauses.find(c=>c.id===spec.id).rosterEffects=spec.effects.map((operation,i)=>({
      id:`${input.id}::${spec.id}/effect-${i+1}`,...clone(operation),targetSubject:spec.targetSubject,targetBinding:spec.targetBinding,
      recipientSelectors:clone(selectors),containingUnitScope:spec.containingUnitScope,conditions:[],
      evidence:clone(extra.evidence),sourceFields:[clone(field)],lifetime:'WHILE_DETACHMENT_SELECTED',
      provenance:{canonicalRuleId:entity.id,canonicalOwnerId:entity.parentId,canonicalClauseId:spec.id,sourceEvidence:clone(entity.provenance)}
    }));
    entity.ruleContract=contract;contracts.push(contract);
  }
  const deferred=conditionalCandidates.map(input=>{
    const entity=index.get(input.id);assert.ok(entity?.provenance?.sourceId,'Missing conditional source occurrence');
    const components=(entity.data.componentIds||[]).map(id=>{
      const component=index.get(id);assert.equal(component?.parentId,entity.id,'Foreign conditional component');
      assert.equal(typeof component.data.text,'string','Missing conditional component text');
      return {sourceReference:{bookId:book.bookId,entityId:id,path:'/text'},sourceText:component.data.text,provenance:clone(component.provenance)};
    });
    const sourceText=entity.data.text||entity.data.blocks?.map(b=>b.text).join('\n')||components.map(c=>c.sourceText).join('\n');
    assert.ok(sourceText,'Missing deferred source text');
    return {...clone(input),ownerId:entity.parentId||book.bookId,sourceReference:{bookId:book.bookId,entityId:entity.id},
      sourceText,...(components.length?{sourceComponents:components}:{}),provenance:clone(entity.provenance),executable:false,
      ...(entity.kind==='ENHANCEMENT'?{scope:entity.data.scope,itemKind:entity.data.itemKind}:{})};
  });
  const composition=book.rosterProfileBindings.map(binding=>({...clone(binding),maxModels:book.importBindings.compositions
    .filter(c=>c.profileId===binding.profileId).reduce((sum,c)=>sum+c.quantity.max,0)}));
  book.compatibilityFeasibility=buildAttachmentFeasibility(book,composition);
  schema.validateContracts(book);validateRosterEffects(book,schema.validatePredicate,schema.evaluatePredicate);
  assert.equal(JSON.stringify(facts),before,'Factual input changed');
  const artifact={schema:'tyranids-v2-rule-contracts/v1',authority:'BOOK_OWNED_DERIVED_OVERLAY',
    factualFingerprint:sha(JSON.stringify(facts)),importFingerprint:sha(JSON.stringify(buildTyranidsImportBook(facts))),
    declarationFingerprint:sha(fs.readFileSync(new URL('./rule-contract-declarations.mjs',import.meta.url))),
    currentOfficialSource,contracts,deferred,nativeReferenceSemantics:clone(book.rosterReferenceSemantics),
    attachmentPolicies:clone(book.rosterAttachmentPolicies),compatibilityFeasibility:clone(book.compatibilityFeasibility)};
  return {book,schema,contracts,deferred,artifact};
}

if(process.argv[1]&&fileURLToPath(import.meta.url)===fs.realpathSync(process.argv[1])){
  const {artifact}=buildTyranidsContracts(),target=new URL('./generated/rule-contracts.json',import.meta.url),bytes=JSON.stringify(artifact,null,2)+'\n';
  if(process.argv.includes('--check'))assert.equal(fs.readFileSync(target,'utf8'),bytes,'Stale Tyranids Rule Contracts');
  else fs.writeFileSync(target,bytes);
  console.log(JSON.stringify({status:'PASS',contracts:artifact.contracts.length,deferred:artifact.deferred.length,
    nativeFnpBindings:Object.keys(artifact.nativeReferenceSemantics).length,mode:process.argv.includes('--check')?'CHECK':'BUILD'}));
}

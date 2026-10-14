/** Source-backed decisions/references and static Transport declarations. */
import assert from 'node:assert/strict';
import {bindCanonicalContract,bindDeclarationClauses} from '../../shared/rule-contract-v2/bindings.mjs';
import {resolveOwnedFact} from './mfm-boundary.mjs';
export const bladeId='detachment-carnival-of-excess:enhancement:3';
export const bladeField='selectedUpgrade:'+bladeId;
export const finalStateFields={[bladeField]:{contextLevel:'ROSTER',valueType:'string'},
  possessedBladeFightUse:{contextLevel:'BATTLE',valueType:'boolean'},snapShootingAttack:{contextLevel:'BATTLE',valueType:'boolean'}};
const clone=structuredClone;
const all=args=>args.length===1?args[0]:{op:'ALL',args};
export const finalBindings=[
  {id:bladeId,owner:'detachment-carnival-of-excess',field:['text'],
    quote:'EMPEROR’S CHILDREN model only. At the start of the battle, select one melee weapon equipped by the bearer; add 1 to the Attacks characteristic of that weapon. In addition, each time the bearer is selected to fight, it can use this Enhancement. If it does, while resolving those attacks, add 1 to the Damage characteristic of that weapon and that weapon has the [devastating wounds] and [hazardous] abilities.'},
  {id:'detachment-spectacle-of-slaughter:enhancement:2',owner:'detachment-spectacle-of-slaughter',field:['text'],
    quote:'FLAWLESS BLADES unit only. Enemy units cannot target this unit with snap shooting attacks.'},
  {id:'datasheet-chaos-rhino:section:2',owner:'unit-chaos-rhino',field:['blocks',0,'text'],capacity:12,
    quote:'This model has a transport capacity of 12 EMPEROR’S CHILDREN INFANTRY models (excluding TERMINATOR and FLAWLESS BLADE models).'},
  {id:'datasheet-chaos-land-raider:section:2',owner:'unit-chaos-land-raider',field:['blocks',0,'text'],capacity:14,
    quote:'This model has a transport capacity of 14 EMPEROR’S CHILDREN INFANTRY models. Each TERMINATOR and FLAWLESS BLADE model takes up the space of 2 models.'}
];

export function bindFinalContracts({book,index,mfm,inputs=finalBindings}) {
  assert.ok([0,4].includes(inputs.length));assert.equal(new Set(inputs.map(i=>i.id)).size,inputs.length);
  const contracts=[];book.rosterSelectionOptions??=[];book.rosterContextBindings??={};
  for(const input of inputs) {
    const entity=index.get(input.id),source=clone(entity?.fieldProvenance?.text||entity?.provenance),field=clone(input.field);
    assert.equal(entity?.parentId,input.owner);assert.ok(!entity.ruleContract);
    assert.equal(field.reduce((v,k)=>v?.[k],entity.data),input.quote,'Final binding source changed');
    const evidence={field,quote:input.quote};
    const atom=(predicate,subject,args,proof=evidence,contextLevel='STATIC')=>({predicate,subject,contextLevel,arguments:args,evidence:clone(proof)});
    const role=(id,subject,purpose,selector,binding,allegiance='FRIENDLY')=>({id,subject,purpose,selector,binding,allegiance,conditions:[]});
    const isEnhancement=entity.kind==='ENHANCEMENT',isBlade=input.id===bladeId;
    const selector=input.capacity?atom('MODEL_ID','MODEL',{id:input.id.replace(':section:2',':profile:1')}):
      isBlade?atom('MODEL_KEYWORD','MODEL',{keyword:'EMPEROR’S CHILDREN'}):atom('UNIT_ID','UNIT',{id:'unit-flawless-blades'});
    const owner=role('owner',isEnhancement&&!isBlade?'UNIT':'MODEL','OWNER',selector,isEnhancement&&!isBlade?'SOURCE_UNIT':'SOURCE_MODEL');
    const declaration={kind:isEnhancement?'ENHANCEMENT':'OTHER_RULE',executionMode:isEnhancement?'DECLARATIVE_APPLICABILITY':'DATASHEET_DECLARATION',
      contextLevel:isEnhancement?'BATTLE':'STATIC',sourceFields:[field],roles:[owner],conditions:[],clauses:[]};
    const clause=(id,roles,conditions,classification)=>({id,roles:clone(roles),conditions:clone(conditions),sourceFields:[field],
      evidence:clone(evidence),sourceText:input.quote,rosterClassification:classification,rosterEffects:[],
      rosterClassificationNote:{reason:classification==='NOT_AN_EFFECT'?'Complete source-owned Transport declaration; no embarkation simulation.':
        classification==='BATTLE_ONLY'?'Conditional battle payload remains unexecuted.':'Explicit canonical selection or passive permission reference only.'}});
    const lowered=[];
    if(isEnhancement) {
      declaration.detachmentId=entity.parentId;declaration.assignment={ownerRoleId:'owner',selector:clone(selector),
        identity:isBlade?'EXACT_PHYSICAL_INSTANCE_MODEL_PROFILE':'EXACT_PHYSICAL_INSTANCE_UNIT',...(!isBlade?{classification:'UNIT_UPGRADE'}:{})};
      const bridge=mfm.enhancementBindings.find(b=>b.entityId===entity.id),record=resolveOwnedFact(bridge?.mfmRecordId);
      assert.equal(bridge.scopeOwnerId,entity.parentId);assert.deepEqual(record.qualifierIds,[]);
      if(!isBlade)assert.ok(record.provenance.sourceLocator.sourceTitle.endsWith('(Upgrade)'));
      declaration.mfmReferences={enhancementId:record.id,detachmentId:record.detachmentId,qualifierIds:[],provenance:clone(record.provenance)};
    }
    const effect=(id,values)=>({id:`${entity.id}::${id}`,...values,evidence:clone(evidence),sourceFields:[field],
      lifetime:'WHILE_ASSIGNED',provenance:{canonicalRuleId:entity.id,canonicalOwnerId:entity.parentId,sourceEvidence:source}});
    if(isBlade) {
      const recipient=role('bearer','MODEL','RECIPIENT',clone(selector),'SOURCE_MODEL');declaration.roles.push(recipient);
      const options=[];
      // Each decision references existing factual owners. No new weapon or stat
      // fact, title-derived identity, or default selection is introduced.
      for(const unit of book.entities.filter(e=>e.kind==='DATASHEET'&&e.data.factionKeywords.includes('EMPEROR’S CHILDREN')))
        for(const weaponId of unit.data.weaponIds) {
          const weapon=index.get(weaponId);if(weapon.data.mode!=='melee')continue;
          const id=entity.id+'::choice::'+weapon.id;
          const option={id,kind:'UPGRADE_OPTION',parentId:entity.id,authority:'SOURCE_BACKED_SELECTION_BINDING',
            data:{selectionRuleId:entity.id,unitId:unit.id,weaponProfileId:weapon.id,modelProfileIds:clone(unit.data.profileIds),timing:'START_OF_BATTLE'},
            provenance:{...clone(source),weaponSource:clone(weapon.provenance)}};
          assert.ok(!index.has(id));options.push(option);index.set(id,option);
          for(const profileId of unit.data.profileIds)lowered.push(effect('selected-weapon/'+profileId+'/'+weapon.id,
            {operation:'MODIFY_STAT',targetSubject:'MODEL',targetBinding:'SOURCE_MODEL',weaponMode:'melee',weaponIds:[weapon.id],
              field:'attacks',mode:'ADD',value:1,conditions:[
                {binding:'SOURCE',predicate:atom('MODEL_ID','MODEL',{id:profileId})},
                {binding:'SOURCE',predicate:atom('FIELD','MODEL',{key:bladeField,equals:id},evidence,'ROSTER')}]}));
        }
      book.entities.push(...options);book.rosterSelectionOptions.push(...options);
      book.rosterContextBindings[bladeField]={kind:'SELECTED_OPTION',declarationId:entity.id,selectionField:'selectedUpgradeIds',
        sourceTiming:'START_OF_BATTLE',cardinality:'ONE'};
      declaration.weaponSelection={selectionField:'selectedUpgradeIds',cardinality:'ONE',timing:'At the start of the battle',
        canonicalOptionIds:options.map(o=>o.id),equippedOnly:true,weaponMode:'melee'};
      declaration.clauses.push(clause('selected-weapon',[owner,recipient],[],'ROSTER_EXECUTABLE'));
      const condition=atom('FIELD','MODEL',{key:'possessedBladeFightUse',equals:true},evidence,'BATTLE');
      declaration.clauses.push(clause('optional-fight-use',[owner,recipient],[condition],'BATTLE_ONLY'));
      declaration.clauses[1].effect={sourceClause:input.quote.slice(input.quote.indexOf('In addition,')),recipientRoleId:'bearer'};
    } else if(isEnhancement) {
      const recipient=role('recipient','UNIT','RECIPIENT',atom('ALWAYS','UNIT',{}),'SOURCE_UNIT');declaration.roles.push(recipient);
      book.rosterAbilityReferences[entity.id]={id:entity.id,title:entity.data.title,parameters:{},
        sourceReference:{bookId:book.bookId,entityId:entity.id,path:'/text'},provenance:source};
      lowered.push(effect('permission-reference',{operation:'GRANT_ABILITY',targetSubject:'UNIT',targetBinding:'SOURCE_UNIT',unitScope:'FORMED',
        ability:{canonicalId:entity.id,parameters:{}},conditions:[]}));
      declaration.clauses.push(clause('permission-reference',[owner,recipient],[],'ROSTER_EXECUTABLE'));
      const enemy=role('attacker','UNIT','ACTOR',atom('ALWAYS','UNIT',{}),'INDEPENDENT_ENTITY','ENEMY');
      const condition=atom('FIELD','UNIT',{key:'snapShootingAttack',equals:true},evidence,'BATTLE');condition.roleId='attacker';
      declaration.clauses.push(clause('snap-shooting',[owner,recipient,enemy],[condition],'BATTLE_ONLY'));
      declaration.clauses[1].effect={sourceClause:input.quote,recipientRoleId:'recipient'};
    } else {
      const flawless=atom('MODEL_ID','MODEL',{id:'datasheet-flawless-blades:profile:1'}),terminator=atom('MODEL_KEYWORD','MODEL',{keyword:'TERMINATOR'});
      const permitted=all([atom('MODEL_KEYWORD','MODEL',{keyword:'EMPEROR’S CHILDREN'}),atom('MODEL_KEYWORD','MODEL',{keyword:'INFANTRY'}),
        ...(input.capacity===12?[{op:'NOT',args:[terminator]},{op:'NOT',args:[flawless]}]:[])]);
      const passenger=role('passenger','MODEL','RECIPIENT',permitted,'INDEPENDENT_ENTITY');declaration.roles.push(passenger);
      declaration.declarationType='TRANSPORT_DECLARATION';
      declaration.transport={capacity:input.capacity,defaultSlots:1,sourceText:input.quote,
        modelDenotations:[{sourceLabel:'FLAWLESS BLADE',profileId:'datasheet-flawless-blades:profile:1'}],
        slotRules:input.capacity===14?[{selector:{op:'ANY',args:[terminator,flawless]},slots:2,evidence:clone(evidence)}]:[]};
      declaration.clauses.push(clause('transport-declaration',[owner,passenger],[],'NOT_AN_EFFECT'));
    }
    const contract=bindCanonicalContract({entity,bookId:book.bookId,schema:'rule-contract/v2',index,
      declaration:bindDeclarationClauses(declaration),currentness:{acceptedBaseHead:'f2bff38b382009844403abae2391b8f066d1ddef',factualOwner:source,
        currentOfficialSource:'gw-ec-faction-pack-v1.3-2026-09-30'}});
    if(isEnhancement)contract.clauses[0].rosterEffects=lowered;
    entity.ruleContract=contract;contracts.push(contract);
  }
  return contracts;
}

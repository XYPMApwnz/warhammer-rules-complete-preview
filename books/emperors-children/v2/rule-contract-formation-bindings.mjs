/** Six canonical source owners implement five reviewed rule families. No new
 * facts or operations: UNIT Upgrades retain their original canonical identities. */
import assert from 'node:assert/strict';
import {bindCanonicalContract,bindDeclarationClauses} from '../../shared/rule-contract-v2/bindings.mjs';
import {resolveOwnedFact} from './mfm-boundary.mjs';
const clone=structuredClone;
export const formationStateFields={attached:{contextLevel:'ROSTER',valueType:'boolean'},
  equipmentRequirementSatisfied:{contextLevel:'ROSTER',valueType:'boolean'},
  lordOfHostDeclaredBattleline:{contextLevel:'ROSTER',valueType:'boolean'}};
export const formationBindings=[
  {id:'detachment-elegant-brutes:enhancement:1',family:'Cacophonic Accompaniment',owner:'detachment-elegant-brutes',
    subject:'MODEL',keyword:'LORD KAKOPHONIST',field:['text'],
    quote:'LORD KAKOPHONIST model only.\n▪ This model has Deep Strike.\n▪ This unit’s ranged attacks have [IGNORES COVER].',
    effects:[{operation:'GRANT_ABILITY',targetSubject:'MODEL',targetBinding:'SOURCE_MODEL',ability:{canonicalId:'core-deep-strike',parameters:{}}},
      {operation:'GRANT_WEAPON_ABILITY',targetSubject:'UNIT',targetBinding:'SOURCE_UNIT',weaponMode:'ranged',ability:'IGNORES COVER'}]},
  {id:'detachment-elegant-brutes:enhancement:2',family:'Frenzied Ferocity',owner:'detachment-elegant-brutes',
    subject:'UNIT',unitId:'unit-chaos-terminators',field:['text'],upgrade:true,
    quote:'EMPEROR’S CHILDREN TERMINATOR SQUAD unit only. This unit’s attacks have [SUSTAINED HITS 1].',
    effects:[{operation:'GRANT_WEAPON_ABILITY',targetSubject:'UNIT',targetBinding:'SOURCE_UNIT',ability:'SUSTAINED HITS 1'}]},
  {id:'detachment-spectacle-of-slaughter:enhancement:1',family:'Eager Patrons',owner:'detachment-spectacle-of-slaughter',
    subject:'UNIT',unitId:'unit-flawless-blades',field:['text'],upgrade:true,
    quote:'FLAWLESS BLADES unit only. This unit has +2" M.',
    effects:[{operation:'MODIFY_STAT',targetSubject:'MODEL',targetBinding:'SOURCE_UNIT_MODELS',field:'M',mode:'ADD',value:2,formedModels:true}]},
  ...['daemonettes','seekers'].map(name=>({id:`datasheet-${name}:section:1`,family:'Daemonic Icon',owner:`unit-${name}`,
    subject:'UNIT',unitId:`unit-${name}`,field:['blocks',1,'text'],equipmentId:`datasheet-${name}:wargear:2`,
    quote:'Daemonic Icon: Models in the bearer’s unit have a Leadership characteristic of 6+.',
    effects:[{operation:'MODIFY_STAT',targetSubject:'MODEL',targetBinding:'SOURCE_UNIT_MODELS',field:'LD',mode:'SET',value:6,formedModels:true}]})),
  {id:'datasheet-lord-exultant:section:4',family:'Lord of the Host',owner:'unit-lord-exultant',
    subject:'MODEL',profileId:'datasheet-lord-exultant:profile:1',field:['blocks',0,'text'],initialFormation:true,
    quote:'If this model is attached to an EMPEROR’S CHILDREN BATTLELINE unit during the Declare Battle Formations step, this model has the Infiltrators and Scouts 6" abilities.',
    effects:[{operation:'GRANT_ABILITY',targetSubject:'MODEL',targetBinding:'SOURCE_MODEL',ability:{canonicalId:'core-infiltrators',parameters:{}}},
      {operation:'GRANT_ABILITY',targetSubject:'MODEL',targetBinding:'SOURCE_MODEL',ability:{canonicalId:'core-scouts',parameters:{distance:6}}}]}
];

export function bindFormationContracts({book,index,mfm,core,inputs=formationBindings}) {
  assert.ok([0,6].includes(inputs.length),'Only these five families / six source owners are reviewed');
  assert.equal(new Set(inputs.map(input=>input.id)).size,inputs.length,'Duplicate formation semantic owner');
  const contracts=[];
  for(const input of inputs) {
    const entity=index.get(input.id),field=clone(input.field),source=clone(entity?.fieldProvenance?.text||entity?.provenance);
    assert.equal(entity?.parentId,input.owner,'Wrong formation rule owner');
    assert.ok(!entity.ruleContract,'Formation binding cannot replace an existing semantic owner');
    assert.equal(field.reduce((v,k)=>v?.[k],entity.data),input.quote,'Formation source changed');
    const evidence={field,quote:input.quote};
    const atom=(predicate,subject,args,proof=evidence,contextLevel='STATIC')=>({predicate,subject,contextLevel,arguments:args,evidence:clone(proof)});
    const selector=input.profileId?atom('MODEL_ID','MODEL',{id:input.profileId}):input.unitId?
      atom('UNIT_ID','UNIT',{id:input.unitId}):atom('MODEL_KEYWORD','MODEL',{keyword:input.keyword});
    const owner={id:'owner',subject:input.subject,purpose:'OWNER',allegiance:'FRIENDLY',selector,conditions:[]};
    const declaration={kind:entity.kind==='ENHANCEMENT'?'ENHANCEMENT':'DATASHEET_ABILITY',
      executionMode:'DECLARATIVE_APPLICABILITY',contextLevel:'ROSTER',sourceFields:[field],roles:[owner],conditions:[],clauses:[]};
    if(entity.kind==='ENHANCEMENT') {
      declaration.detachmentId=entity.parentId;
      declaration.assignment={ownerRoleId:'owner',selector:clone(selector),
        identity:input.subject==='UNIT'?'EXACT_PHYSICAL_INSTANCE_UNIT':'EXACT_PHYSICAL_INSTANCE_MODEL_PROFILE',
        ...(input.upgrade?{classification:'UNIT_UPGRADE'}:{})};
      const bridge=mfm.enhancementBindings.find(b=>b.entityId===input.id),record=resolveOwnedFact(bridge?.mfmRecordId);
      assert.equal(bridge.scopeOwnerId,entity.parentId);assert.deepEqual(record.qualifierIds,[]);
      if(input.upgrade)assert.ok(record.provenance.sourceLocator.sourceTitle.endsWith('(Upgrade)'),'MFM UNIT Upgrade identity lost');
      declaration.mfmReferences={enhancementId:record.id,detachmentId:record.detachmentId,qualifierIds:[],provenance:clone(record.provenance)};
    }
    if(input.initialFormation) {
      book.rosterContextBindings??={};
      book.rosterContextBindings.lordOfHostDeclaredBattleline={kind:'INITIAL_ATTACHMENT',sourceId:input.owner,
        profileId:input.profileId,step:'DECLARE_BATTLE_FORMATIONS',bodyguardKeywords:['EMPEROR’S CHILDREN','BATTLELINE'],sourceRuleId:input.id};
      declaration.duration=[{endpoint:'NOT_EXPLICIT',inferredExpiry:false}];
    }
    const lowered=[];
    for(const [i,spec] of input.effects.entries()) {
      const recipient={id:`recipient-${i+1}`,subject:spec.targetSubject,purpose:'RECIPIENT',allegiance:'FRIENDLY',
        binding:spec.targetBinding,selector:atom('ALWAYS',spec.targetSubject,{}),conditions:[]};
      declaration.roles.push(recipient);
      const conditions=[];
      if(input.initialFormation)conditions.push(atom('FIELD','MODEL',{key:'lordOfHostDeclaredBattleline',equals:true},evidence,'ROSTER'));
      if(input.equipmentId) {
        const option=index.get(input.equipmentId);assert.equal(option?.kind,'WARGEAR_OPTION');assert.equal(option.parentId,input.owner);
        conditions.push(atom('FIELD','UNIT',{key:'equipmentRequirementSatisfied',equals:true},
          {otherEntityId:option.id,field:['text'],quote:option.data.text},'ROSTER'));
      }
      const clause={id:`source-effect-${i+1}`,roles:[clone(owner),recipient],conditions:clone(conditions),sourceFields:[field],
        evidence:clone(evidence),sourceText:input.quote,rosterClassification:'ROSTER_EXECUTABLE',rosterEffects:[],
        rosterClassificationNote:{reason:input.initialFormation?'Requires explicit source-valid Declare Battle Formations snapshot; current attachment alone cannot activate.':'Selected physical owner/equipment and existing formation determine recipients.'}};
      declaration.clauses.push(clause);
      const {formedModels,...parameters}=clone(spec);
      const effect={id:`${input.id}::${clause.id}/effect`,...parameters,conditions:conditions.map(predicate=>({binding:'SOURCE',predicate})),
        evidence:clone(evidence),sourceFields:[field],lifetime:input.initialFormation?'SOURCE_DECLARE_BATTLE_FORMATIONS_CONDITION':
          input.equipmentId?'WHILE_EQUIPMENT_SELECTED':'WHILE_ASSIGNED',
        provenance:{canonicalRuleId:input.id,canonicalOwnerId:input.owner,canonicalClauseId:clause.id,sourceEvidence:source}};
      if(input.equipmentId)effect.equipmentRequirement={binding:'SOURCE',kind:'EQUIPMENT_PRESENT',equipmentId:input.equipmentId,sourceFieldPath:['text']};
      if(spec.operation==='GRANT_ABILITY') {
        const id=spec.ability.canonicalId,reference=core.getById(id);assert.equal(reference?.kind,'ability');assert.equal(reference.state,'FULL_CONTENT');
        book.rosterAbilityReferences[id]={id,title:reference.title,parameters:id==='core-scouts'?{distance:{type:'number',min:0}}:{},provenance:clone(reference.provenance)};
      }
      // Existing CSM lowering pattern supplies standalone and attached MODEL
      // recipients without promoting a MODEL bearer or borrowing unit identity.
      if(formedModels) {
        effect.conditions.push({binding:'SOURCE',predicate:atom('FIELD',input.subject,{key:'attached',equals:false},evidence,'ROSTER')});
        const formed=clone(effect);formed.id+='/formed';formed.targetBinding='SOURCE_FORMED_MODELS';formed.conditions.at(-1).predicate.arguments.equals=true;
        lowered.push([effect,formed]);
      } else lowered.push([effect]);
    }
    const contract=bindCanonicalContract({entity,bookId:book.bookId,schema:'rule-contract/v2',index,
      declaration:bindDeclarationClauses(declaration),currentness:{acceptedBaseHead:'05ef00be54d9f876cad262b324e8ba011e6d05d6',
        factualOwner:source,currentOfficialSource:'gw-ec-faction-pack-v1.3-2026-09-30'}});
    contract.clauses.forEach((clause,i)=>clause.rosterEffects=lowered[i]);entity.ruleContract=contract;contracts.push(contract);
  }
  return contracts;
}

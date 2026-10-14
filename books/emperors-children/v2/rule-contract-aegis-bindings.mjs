/** Shining Aegis is selected equipment on the source-owned singleton MODEL. */
import assert from 'node:assert/strict';
import {bindCanonicalContract,bindDeclarationClauses} from '../../shared/rule-contract-v2/bindings.mjs';
const clone=structuredClone;
export const aegisBinding={id:'datasheet-keeper-of-secrets:section:1',owner:'unit-keeper-of-secrets',
  profileId:'datasheet-keeper-of-secrets:profile:1',optionId:'datasheet-keeper-of-secrets:wargear:1',
  field:['blocks',2,'text'],quote:'Shining Aegis: The bearer has a Save characteristic of 3+.',
  optionText:'This model can be equipped with one of the following:\n- living whip\n- ritual knife\n- shining aegis'};

export function bindShiningAegis({book,index,inputs=[aegisBinding]}) {
  assert.ok(inputs.length===0||inputs.length===1,'Only Shining Aegis is in scope');
  return inputs.map(input=>{
    assert.deepEqual(input,aegisBinding,'Unreviewed Shining Aegis source binding');
    const entity=index.get(input.id),profile=index.get(input.profileId),unit=index.get(input.owner),option=index.get(input.optionId);
    assert.equal(entity?.parentId,input.owner);assert.ok(!entity.ruleContract,'Duplicate canonical rule owner');
    assert.equal(input.field.reduce((value,key)=>value?.[key],entity.data),input.quote);
    assert.equal(option?.parentId,input.owner);assert.equal(option.data.text,input.optionText);
    assert.deepEqual(unit.data.profileIds,[input.profileId]);assert.equal(profile?.parentId,input.owner);
    assert.equal(profile.data.stats.SV,'5+');assert.equal(profile.data.stats.INSV,'4+');
    const members=unit.data.compositionMemberIds.map(id=>index.get(id));
    assert.equal(members.length,1);assert.deepEqual(members[0].data.quantity,{min:1,max:1});
    assert.equal(members[0].data.modelProfileId,input.profileId,'Selection must identify the source singleton bearer');
    const evidence={field:clone(input.field),quote:input.quote};
    const atom=(predicate,subject,args,contextLevel='STATIC')=>({predicate,subject,arguments:args,contextLevel,evidence:clone(evidence)});
    const selector=atom('MODEL_ID','MODEL',{id:input.profileId});
    const owner={id:'owner',subject:'MODEL',purpose:'OWNER',binding:'SOURCE_MODEL',allegiance:'FRIENDLY',selector,conditions:[]};
    const recipient={...clone(owner),id:'bearer',purpose:'RECIPIENT'};
    const selected=atom('FIELD','MODEL',{key:'equipmentRequirementSatisfied',equals:true},'ROSTER');
    const source=clone(entity.provenance),field=clone(input.field);
    const declaration={kind:'DATASHEET_ABILITY',executionMode:'DECLARATIVE_APPLICABILITY',contextLevel:'ROSTER',
      roles:[owner,recipient],conditions:[],sourceFields:[field],
      equipmentSelection:{equipmentId:input.id,sourceFieldPath:field,modelProfileId:input.profileId,
        sourceOptionId:input.optionId,cardinality:'ONE',physicalOwner:'SOURCE_SINGLETON_MODEL'},
      clauses:[{id:'shining-aegis',roles:[clone(owner),clone(recipient)],conditions:[selected],sourceFields:[field],
        evidence:clone(evidence),sourceText:input.quote,rosterClassification:'ROSTER_EXECUTABLE',rosterEffects:[],
        rosterClassificationNote:{reason:'Exact selected Shining Aegis occurrence on its singleton MODEL bearer; ordinary Save only.'}}]};
    const contract=bindCanonicalContract({entity,bookId:book.bookId,schema:'rule-contract/v2',index,
      declaration:bindDeclarationClauses(declaration),currentness:{acceptedBaseHead:'9e3284e9481d993f05058fb99ee9f37ec39708b0',
        factualOwner:source,currentOfficialSource:'gw-ec-faction-pack-v1.3-2026-09-30'}});
    contract.clauses[0].rosterEffects=[{id:input.id+'::shining-aegis/SV',operation:'MODIFY_STAT',
      targetSubject:'MODEL',targetBinding:'SOURCE_MODEL',field:'SV',mode:'SET',value:3,
      equipmentRequirement:{binding:'SOURCE',kind:'EQUIPMENT_PRESENT',equipmentId:input.id,sourceFieldPath:field},
      conditions:[{binding:'SOURCE',predicate:selected},{binding:'TARGET',predicate:clone(selector)}],
      evidence:clone(evidence),sourceFields:[field],lifetime:'WHILE_EQUIPMENT_SELECTED',
      provenance:{canonicalRuleId:input.id,canonicalOwnerId:input.owner,canonicalClauseId:contract.clauses[0].id,sourceEvidence:source}}];
    entity.ruleContract=contract;return contract;
  });
}

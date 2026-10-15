/** Two accepted occurrences, appended to their existing canonical section owners. */
import assert from 'node:assert/strict';
import {bindCanonicalContract,bindDeclarationClauses} from '../../shared/rule-contract-v2/bindings.mjs';
const clone=structuredClone;
export const instrumentBindings=['daemonettes','seekers'].map((name,i)=>({id:`datasheet-${name}:section:1`,owner:`unit-${name}`,
  profileId:`datasheet-${name}:profile:1`,eligibleMemberId:`datasheet-${name}:section:2:member:2`,
  equipmentId:`datasheet-${name}:wargear:1`,iconId:`datasheet-${name}:wargear:2`,field:['blocks',2,'text'],
  quote:'Instrument of Chaos: Add 1 to Charge rolls made for the bearer’s unit.',
  instrumentText:`1 ${i?'Seeker':'Daemonette'} that is not equipped with a daemonic icon can be equipped with 1 instrument of Chaos.`,
  iconText:`1 ${i?'Seeker':'Daemonette'} that is not equipped with an instrument of Chaos can be equipped with 1 daemonic icon.`}));

export function bindInstruments({book,index,inputs=instrumentBindings}) {
  assert.ok([0,2].includes(inputs.length));if(inputs.length)assert.deepEqual(inputs,instrumentBindings,'Unreviewed Instrument source binding');
  book.rosterEquipmentRestrictions??=[];
  for(const input of inputs) {
    const entity=index.get(input.id),contract=entity?.ruleContract,field=clone(input.field),source=clone(entity?.provenance);
    assert.equal(entity?.parentId,input.owner);assert.ok(contract,'Instrument must share the existing factual section owner');
    assert.equal(field.reduce((v,k)=>v?.[k],entity.data),input.quote);assert.equal(contract.clauses.length,1);
    for(const [id,text] of [[input.equipmentId,input.instrumentText],[input.iconId,input.iconText]]) {
      const option=index.get(id);assert.equal(option?.kind,'WARGEAR_OPTION');assert.equal(option.parentId,input.owner);assert.equal(option.data.text,text);
    }
    const member=index.get(input.eligibleMemberId);assert.equal(member?.parentId,input.owner);assert.equal(member.data.modelProfileId,input.profileId);
    const evidence={field,quote:input.quote},owner=clone(contract.roles[0]);
    const recipient={id:'instrument-recipient',subject:'UNIT',purpose:'RECIPIENT',allegiance:'FRIENDLY',binding:'SOURCE_UNIT',
      selector:{predicate:'ALWAYS',subject:'UNIT',contextLevel:'STATIC',arguments:{},evidence:clone(evidence)},conditions:[]};
    const selected={predicate:'FIELD',subject:'UNIT',contextLevel:'ROSTER',arguments:{key:'equipmentRequirementSatisfied',equals:true},
      evidence:{otherEntityId:input.equipmentId,field:['text'],quote:input.instrumentText}};
    const declaration={kind:'DATASHEET_ABILITY',executionMode:'DECLARATIVE_APPLICABILITY',contextLevel:'ROSTER',roles:[owner,recipient],
      conditions:[],sourceFields:[field],clauses:[{id:'instrument-of-chaos',roles:[clone(owner),clone(recipient)],conditions:[selected],
        sourceFields:[field],evidence:clone(evidence),sourceText:input.quote,rosterClassification:'ROSTER_EXECUTABLE',rosterEffects:[],
        rosterClassificationNote:{reason:'Selected Instrument supplies a UNIT Charge-roll modifier; no roll or charge is executed.'}}]};
    const added=bindCanonicalContract({entity,bookId:book.bookId,schema:'rule-contract/v2',index,declaration:bindDeclarationClauses(declaration),
      currentness:{acceptedBaseHead:'499d1d92cbb40ce1f6ecbb7c03463bd7f6993b0c',factualOwner:source,currentOfficialSource:'gw-ec-faction-pack-v1.3-2026-09-30'}});
    const clause=added.clauses[0];clause.currentness=clone(added.currentness);
    clause.rosterEffects=[{id:input.id+'::instrument-of-chaos/chargeRoll',operation:'MODIFY_RULE_METRIC',targetSubject:'UNIT',
      targetBinding:'SOURCE_UNIT',unitScope:'FORMED',field:'chargeRoll',mode:'ADD',value:1,
      equipmentRequirement:{binding:'SOURCE',kind:'EQUIPMENT_PRESENT',equipmentId:input.equipmentId,sourceFieldPath:['text']},
      conditions:[{binding:'SOURCE',predicate:clone(selected)}],evidence:clone(evidence),sourceFields:[field],lifetime:'WHILE_EQUIPMENT_SELECTED',
      provenance:{canonicalRuleId:input.id,canonicalOwnerId:input.owner,canonicalClauseId:clause.id,sourceEvidence:source}}];
    contract.roles.push(clone(recipient));contract.sourceFields.push(field);contract.clauses.push(clause);
    book.rosterEquipmentRestrictions.push({ownerId:input.owner,profileId:input.profileId,eligibleMemberId:input.eligibleMemberId,
      instrumentId:input.equipmentId,iconId:input.iconId,scope:'MODEL',maximumEach:1,
      evidence:[{entityId:input.equipmentId,field:['text'],quote:input.instrumentText},{entityId:input.iconId,field:['text'],quote:input.iconText}]});
  }
  return inputs.length;
}

export {validateInstrumentSelections} from './roster-equipment-context.mjs';

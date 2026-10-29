import {parseProducerJSON,serializeSourceJSON} from '../../shared/source-refs-v2/producer-io.mjs';
import {finalizeRecipientBook} from '../../shared/rule-contract-v2/finalize-recipients.mjs';
import {recipientDeclarationView} from '../../shared/rule-contract-v2/recipients.mjs';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';

const directory=path.dirname(fileURLToPath(import.meta.url));
const MODEL='MODEL', UNIT='UNIT';
const declarations=new Map();
const atom=(predicate,subject,contextLevel,arguments_,field,quote,otherEntityId)=>({predicate,subject,contextLevel,arguments:arguments_,evidence:{field,quote,...(otherEntityId?{otherEntityId}:{})}});
const condition=(binding,predicate)=>({binding,predicate});
const leading=field=>condition('SOURCE',atom('LEADING',MODEL,'ROSTER',{value:true},field,'leading a unit'));
const sourceModel=(operation,values)=>({operation,targetBinding:'SOURCE_MODEL',targetSubject:MODEL,...values});
const formedModels=(operation,values)=>({operation,targetBinding:'SOURCE_FORMED_MODELS',targetSubject:MODEL,...values});
const profile=(targetBinding,field,mode,value,conditions=[])=>({operation:'MODIFY_STAT',targetBinding,targetSubject:MODEL,field,mode,value,conditions});
const melee=(operation,values)=>sourceModel(operation,{weaponMode:'melee',...values});
function declare(ruleId,clauseId,field,quote,effects,notes={}) {
  const key=ruleId+'\0'+clauseId;
  assert.ok(!declarations.has(key),'Duplicate source clause '+key);
  declarations.set(key,{ruleId,clauseId,field,quote,effects,notes});
}
const b=index=>['blocks',index,'text'];
const text=['text'];

declare('datasheet-biologus-putrifier:section:1','source-clause-1',b(0),
  'While this model is leading a unit, weapons equipped by models in that unit have the [LETHAL HITS] ability. In addition, each time a model in that unit makes an attack, a Critical Hit is scored on an unmodified Hit roll of 5+, instead of only a 6.',
  [formedModels('GRANT_WEAPON_ABILITY',{ability:'LETHAL HITS',conditions:[leading(b(0))],lifetime:'WHILE_LEADING'}),
    formedModels('MODIFY_RULE_METRIC',{field:'criticalHitThreshold',mode:'SET',value:5,label:'Foul Infusion',conditions:[leading(b(0))],lifetime:'WHILE_LEADING'})]);
declare('detachment-virulent-vectorium:enhancement:1','critical-hit',text,
  'an unmodified Hit roll of 5+',
  [melee('MODIFY_RULE_METRIC',{field:'criticalHitThreshold',mode:'SET',value:5})]);
declare('datasheet-deathshroud-terminators:section:1','source-clause-1',b(0),
  'While a CHARACTER model is leading this unit, that CHARACTER model has the Feel No Pain 4+ ability.',
  [{operation:'GRANT_MODEL_ABILITY',targetBinding:'LEADERS_OF_SOURCE',targetSubject:MODEL,ability:{name:'Feel No Pain',value:4},
    conditions:[condition('TARGET',atom('MODEL_KEYWORD',MODEL,'STATIC',{keyword:'CHARACTER'},b(0),'CHARACTER model')),
      condition('TARGET',atom('LEADING',MODEL,'ROSTER',{value:true},b(0),'leading this unit'))],lifetime:'WHILE_LEADING_SOURCE_UNIT'}]);
declare('datasheet-helbrute:section:1','source-clause-2',b(1),
  'If this model is equipped with two melee weapons in addition to its close combat weapon, add 2 to the Attacks characteristic of those two weapons.',
  [melee('MODIFY_STAT',{field:'attacks',mode:'ADD',value:2,excludeWeaponIds:['datasheet-helbrute:weapon:10'],
    equipmentRequirement:{binding:'SOURCE',kind:'WEAPON_COUNT',weaponMode:'melee',excludeWeaponIds:['datasheet-helbrute:weapon:10'],equals:2},
    conditions:[condition('SOURCE',atom('FIELD',MODEL,'ROSTER',{key:'equipmentRequirementSatisfied',equals:true},b(1),'equipped with two melee weapons in addition to its close combat weapon'))],lifetime:'WHILE_EQUIPMENT_REQUIREMENT_SATISFIED'})]);
declare('datasheet-icon-bearer:section:1','source-clause-1',b(0),
  'While this model is leading a unit, add 1 to the Objective Control characteristic of models in that unit.',
  [profile('SOURCE_FORMED_MODELS','OC','ADD',1,[leading(b(0))])]);
declare('datasheet-lord-of-contagion:section:1','source-clause-1',b(0),
  'While this model is leading a unit, melee weapons equipped by models in that unit have the [SUSTAINED HITS 1] and [LANCE] abilities.',
  ['SUSTAINED HITS 1','LANCE'].map(ability=>formedModels('GRANT_WEAPON_ABILITY',{weaponMode:'melee',ability,conditions:[leading(b(0))],lifetime:'WHILE_LEADING'})));
declare('datasheet-lord-of-poxes:section:1','source-clause-1',b(0),
  'Add 3" to the range of this model’s Contagion Range.',
  [sourceModel('MODIFY_RULE_METRIC',{field:'contagionRange',mode:'ADD',value:3,max:12,maxEvidence:{otherEntityId:'army-rule-nurgles-gift:contagion-range',field:text,quote:'Contagion Range cannot be greater than 12" after modifiers.'},lifetime:'WHILE_SOURCE_MODEL_HAS_RULE'})]);
declare('datasheet-noxious-blightbringer:section:1','source-clause-1',b(0),
  'While this model is leading a unit, add 1" to the Move characteristic of models in that unit',
  [profile('SOURCE_FORMED_MODELS','M','ADD',1,[leading(b(0))])],
  {deferredBattleEffects:['You can re-roll Advance and Charge rolls made for the led unit; roster display may retain the capability without resolving those rolls.']});
for(const unit of ['plague-drones','plaguebearers']) {
  const equipmentId=`datasheet-${unit}:wargear:2`;
  declare(`datasheet-${unit}:section:1`,'source-clause-2',b(1),
    'Models in the bearer’s unit have a Leadership characteristic of 6+.',
    [profile('SOURCE_UNIT_MODELS','LD','SET',6,[condition('SOURCE',atom('FIELD',UNIT,'ROSTER',{key:'equipmentRequirementSatisfied',equals:true},text,'1 daemonic icon.',equipmentId))])]);
  const specification=declarations.get(`datasheet-${unit}:section:1\0source-clause-2`);
  specification.effects[0].equipmentRequirement={binding:'SOURCE',kind:'EQUIPMENT_PRESENT',equipmentId,sourceFieldPath:text};
  specification.effects[0].lifetime='WHILE_DAEMONIC_ICON_BEARER_IS_IN_UNIT';
  const instrumentId=`datasheet-${unit}:wargear:1`;
  declare(`datasheet-${unit}:section:1`,'source-clause-3',b(2),
    'Instrument of Chaos: Add 1 to Charge rolls made for the bearer’s unit.',
    [{operation:'MODIFY_RULE_METRIC',targetBinding:'SOURCE_UNIT',targetSubject:UNIT,unitScope:'FORMED',field:'chargeRoll',mode:'ADD',value:1,
      equipmentRequirement:{binding:'SOURCE',kind:'EQUIPMENT_PRESENT',equipmentId:instrumentId,sourceFieldPath:text},
      conditions:[condition('SOURCE',atom('FIELD',UNIT,'ROSTER',{key:'equipmentRequirementSatisfied',equals:true},text,'can be equipped with 1 instrument of Chaos.',instrumentId))],
      lifetime:'WHILE_INSTRUMENT_BEARER_IS_IN_UNIT'}]);
}
declare('detachment-virulent-vectorium:enhancement:2','weapon-modifiers',text,
  'Add 1 to the Strength and Attacks characteristics of the bearers melee weapons, and the bearer’s melee weapons have the [DEVASTATING WOUNDS] ability.',
  [melee('MODIFY_STAT',{field:'strength',mode:'ADD',value:1}),melee('MODIFY_STAT',{field:'attacks',mode:'ADD',value:1}),melee('GRANT_WEAPON_ABILITY',{ability:'DEVASTATING WOUNDS'})]);
declare('detachment-virulent-vectorium:enhancement:4','feel-no-pain',text,'The bearer has the Feel No Pain 5+ ability.',
  [sourceModel('GRANT_MODEL_ABILITY',{ability:{name:'Feel No Pain',value:5}})]);
const poxLeading=quote=>[
  condition('SOURCE',atom('LEADING',MODEL,'ROSTER',{value:true},text,quote)),
  condition('SOURCE',atom('BODYGUARD_ID',MODEL,'ROSTER',{id:'unit-poxwalkers'},text,'POXWALKERS unit'))
];
declare('detachment-shamblerot-vectorium:enhancement:1','objective-control',text,
  'While the bearer is leading a POXWALKERS unit, add 1 to the Objective Control characteristic of models in that unit',
  [profile('SOURCE_FORMED_MODELS','OC','ADD',1,poxLeading('While the bearer is leading a POXWALKERS unit'))]);
declare('detachment-shamblerot-vectorium:enhancement:3','plague-wind-damage',text,
  'While the bearer is leading a POXWALKERS unit, add 1 to the Damage characteristic of the bearer’s Plague Wind weapon.',
  [sourceModel('MODIFY_STAT',{field:'damage',mode:'ADD',value:1,weaponIds:['datasheet-malignant-plaguecaster:weapon:2','datasheet-malignant-plaguecaster:weapon:3'],conditions:poxLeading('While the bearer is leading a POXWALKERS unit')})]);
declare('detachment-shamblerot-vectorium:enhancement:4','poxwalkers-toughness',text,
  'While the bearer is leading a unit, add 1 to the Toughness characteristic of POXWALKERS models in that unit.',
  [profile('SOURCE_FORMED_MODELS','T','ADD',1,[condition('SOURCE',atom('LEADING',MODEL,'ROSTER',{value:true},text,'While the bearer is leading a unit')),
    condition('TARGET',atom('MODEL_KEYWORD',MODEL,'STATIC',{keyword:'POXWALKERS'},text,'POXWALKERS models'))])]);
declare('detachment-tallyband-summoners:enhancement:2','melee-attacks',text,'Add 2 to the Attacks characteristic of the bearer’s melee weapons.',
  [melee('MODIFY_STAT',{field:'attacks',mode:'ADD',value:2})]);
declare('detachment-death-lords-chosen:enhancement:2','movement',text,
  'While the bearer is leading a unit, add 1" to the Movement characteristic of models in that unit',
  [profile('SOURCE_FORMED_MODELS','M','ADD',1,[condition('SOURCE',atom('LEADING',MODEL,'ROSTER',{value:true},text,'While the bearer is leading a unit'))])]);
declare('detachment-contagion-engines:enhancement:2','mobile',text,'This unit has MOBILE.',
  [{operation:'GRANT_UNIT_KEYWORD',targetBinding:'SOURCE_UNIT',targetSubject:UNIT,keyword:'MOBILE'}]);
declare('detachment-flyblown-host:enhancement:2','detection-range',text,'This unit has -3" detection range.',
  [{operation:'MODIFY_RULE_METRIC',targetBinding:'SOURCE_UNIT',targetSubject:UNIT,field:'detectionRange',mode:'ADD',value:-3}]);
const targetKeyword=(keyword,field=text)=>condition('TARGET',atom('UNIT_KEYWORD',UNIT,'STATIC',{keyword},field,keyword));
declare('detachment-shamblerot-vectorium:rule','battleline',text,'POXWALKERS units from your army gain the BATTLELINE keyword.',
  [{operation:'GRANT_UNIT_KEYWORD',targetBinding:'ROSTER_UNITS',targetSubject:UNIT,keyword:'BATTLELINE',conditions:[targetKeyword('POXWALKERS')]}]);
declare('detachment-paragons-of-putrescence:rule','contagion-range',text,'Friendly DEATH GUARD CHARACTER units have +3" to their Contagion Range (to a maximum of 12").',
  [{operation:'MODIFY_RULE_METRIC',targetBinding:'ROSTER_UNITS',targetSubject:UNIT,field:'contagionRange',mode:'ADD',value:3,max:12,conditions:[targetKeyword('DEATH GUARD'),targetKeyword('CHARACTER')]}]);
declare('detachment-contagion-engines:rule','grant-contagion-engine',text,
  'Friendly FOETID BLOAT-DRONE/FOETID BLOAT-DRONE WITH HEAVY BLIGHT LAUNCHER/HELBRUTE/MYPHITIC BLIGHT-HAULER units have CONTAGION ENGINE.',
  [{operation:'GRANT_UNIT_KEYWORD',targetBinding:'ROSTER_UNITS',targetSubject:UNIT,keyword:'CONTAGION ENGINE',conditions:[condition('TARGET',{op:'ANY',args:['FOETID BLOAT-DRONE','FOETID BLOAT-DRONE WITH HEAVY BLIGHT LAUNCHER','HELBRUTE','MYPHITIC BLIGHT-HAULER'].map(keyword=>atom('UNIT_KEYWORD',UNIT,'STATIC',{keyword},text,keyword))})]}]);
declare('detachment-contagion-engines:rule','ranged-assault',text,'Friendly CONTAGION ENGINE units’ ranged attacks have [ASSAULT].',
  [{operation:'GRANT_WEAPON_ABILITY',targetBinding:'ROSTER_UNITS',targetSubject:UNIT,weaponMode:'ranged',ability:'ASSAULT',conditions:[targetKeyword('CONTAGION ENGINE')]}]);

const operations=new Set(['MODIFY_STAT','GRANT_WEAPON_ABILITY','GRANT_MODEL_ABILITY','GRANT_UNIT_KEYWORD','MODIFY_RULE_METRIC']);
const bindings=new Set(['SOURCE_MODEL','SOURCE_UNIT','SOURCE_UNIT_MODELS','SOURCE_FORMED_MODELS','LEADERS_OF_SOURCE','ROSTER_UNITS']);
const noEffectDetachmentClauses=new Set(['include-plague-legions','warlord-restriction','exclusive-detachment']);
const anchorOperations=new Set(['RANGED_ATTACK_ANCHOR','AFFLICTED_ANCHOR','BATTLE_SHOCK_ANCHOR']);
function sourceValue(entity,field) {let value=entity.data;for(const part of field)value=value?.[part];return value;}
function classify(entity,clause) {
  const contract=entity.ruleContract;
  if(declarations.has(entity.id+'\0'+clause.id))return ['ROSTER_EXECUTABLE','Source recipient and activation are computable from the selected Detachment, assignment, attachment, and explicitly selected equipment.'];
  if(contract.kind==='STRATAGEM')return !clause.operation||anchorOperations.has(clause.operation)?['NOT_AN_EFFECT','Recipient, attacker or initial-trigger selector, or selected battlefield anchor; it contributes no independent characteristic or ability change.']:['BATTLE_ONLY','Stratagem activation, trigger/event state and source lifetime must be supplied; no battle action is executed from a roster.'];
  if(contract.kind==='DETACHMENT_RULE')return noEffectDetachmentClauses.has(clause.id)?['NOT_AN_EFFECT','Army inclusion, Warlord or Detachment-tag legality declaration.']:['BATTLE_ONLY','Requires a battle phase, range, objective, selected pregame unit or another event context.'];
  if(contract.kind==='ENHANCEMENT')return ['BATTLE_ONLY','Requires attack/test resolution, phase/usage availability, battlefield proximity, selected Plague, or a pregame declaration event.'];
  if(contract.kind==='FAQ_ERRATA_RULE')return ['DISPLAY_ONLY','Source directive has already been consumed in the effective book; it is not a second runtime effect.'];
  if(contract.kind==='ARMY_RULE')return entity.id==='army-rule-pact-of-decay'?['NOT_AN_EFFECT','Army Faction selection restriction.']:['BATTLE_ONLY','Enemy Afflicted state, selected Plague and/or current battle-round Contagion Range are required.'];
  if(contract.kind==='DATASHEET_ABILITY')return ['BATTLE_ONLY','Requires battle resolution, a battlefield range or a dynamic state; a classification-only label is not an executable predicate.'];
  if(entity.kind==='BOOK_USAGE_RULES')return ['DISPLAY_ONLY','Book usage instruction; no unit characteristic or ability effect.'];
  if(entity.kind==='DATASHEET_SECTION'&&(['LORD OF THE DEATH GUARD','DEPLOYMENT'].includes(entity.data.title)||entity.data.title.startsWith('DAMAGED:')))return ['BATTLE_ONLY','Requires deployment/movement/attack state, remaining wounds or an activated battle ability.'];
  return ['NOT_AN_EFFECT','Composition, equipment-option/footnote, Leader, transport, Warlord, or per-attack profile-selection declaration.'];
}
export function extendRosterContracts(model) {
  // This function is a producer boundary, including closure regeneration.
  const scratch=model.entities.some(entity=>entity.ruleContract?.clauses?.some(clause=>Array.isArray(clause.recipients)))?recipientDeclarationView(model):model;
  const extended=structuredClone(scratch),index=new Map(extended.entities.map(e=>[e.id,e])),consumed=new Set();
  for(const entity of extended.entities.filter(e=>e.ruleContract))for(const clause of entity.ruleContract.clauses) {
    const [classification,reason]=classify(entity,clause);clause.rosterClassification=classification;clause.rosterClassificationNote={reason};clause.rosterEffects=[];
    const key=entity.id+'\0'+clause.id,declaration=declarations.get(key);if(!declaration)continue;
    consumed.add(key);assert.ok(sourceValue(entity,declaration.field)?.includes(declaration.quote),'Source roster clause changed: '+entity.id+'/'+clause.id);
    clause.rosterClassificationNote={reason,...declaration.notes};
    clause.rosterEffects=declaration.effects.map((effect,number)=>{
      assert.ok(operations.has(effect.operation),'Unknown roster operation');assert.ok(bindings.has(effect.targetBinding),'Unknown roster target binding');
      const result={id:`${clause.id}:roster-effect:${number+1}`,conditions:[],lifetime:entity.kind==='ENHANCEMENT'?'WHILE_ENHANCEMENT_ASSIGNED':entity.kind==='DETACHMENT_RULE'?'WHILE_DETACHMENT_SELECTED':'WHILE_LEADING',...structuredClone(effect),
        sourceFields:[declaration.field],evidence:{field:declaration.field,quote:declaration.quote}};
      for(const id of [...(result.weaponIds||[]),...(result.excludeWeaponIds||[]),...(result.equipmentRequirement?.excludeWeaponIds||[])])assert.equal(index.get(id)?.kind,'WEAPON_PROFILE','Unresolved named source weapon '+id);
      if(result.equipmentRequirement?.equipmentId)assert.equal(index.get(result.equipmentRequirement.equipmentId)?.kind,'WARGEAR_OPTION','Unresolved source equipment');
      return result;
    });
  }
  assert.deepEqual(consumed,new Set(declarations.keys()),'Complete exact source roster clause identities');
  return finalizeRecipientBook(extended);
}
export function summarizeRosterContracts(model) {
  const rows=model.entities.filter(e=>e.ruleContract).flatMap(entity=>entity.ruleContract.clauses.map(clause=>({ruleId:entity.id,clauseId:clause.id,kind:entity.ruleContract.kind,
    classification:clause.rosterClassification,...clause.rosterClassificationNote,sourceFields:clause.sourceFields,effects:clause.rosterEffects})));
  const counts={};for(const row of rows)counts[row.classification]=(counts[row.classification]||0)+1;
  return {schema:'death-guard-roster-contract-closure/v2',authority:'DISPOSABLE_RULE_CONTRACT_PROJECTION',ruleOwners:model.entities.filter(e=>e.ruleContract).length,clauses:rows.length,
    classifications:counts,rosterEffects:rows.reduce((sum,row)=>sum+row.effects.length,0),battleExecution:false,rows};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  const base=parseProducerJSON(fs.readFileSync(path.join(directory,'generated/rule-contract-effective.json'),'utf8'));
  const closure=summarizeRosterContracts(extendRosterContracts(base)),serialized=serializeSourceJSON(closure),file=path.join(directory,'generated/roster-contract-closure.json');
  if(process.argv.includes('--check'))assert.equal(fs.readFileSync(file,'utf8'),serialized,'Deterministic roster contract closure drift');else fs.writeFileSync(file,serialized);
  console.log(JSON.stringify({ruleOwners:closure.ruleOwners,clauses:closure.clauses,classifications:closure.classifications,rosterEffects:closure.rosterEffects}));
}

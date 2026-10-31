/** Book-owned source evidence for text recipients, lowered by the existing finalizer.
 * These declarations add no executable effects, battle state or conditions. */
import assert from 'node:assert/strict';

const declarations=[];
const text=['text'];
const b=index=>['blocks',index,'text'];
const declare=(ruleId,clauseId,field,quote,participant)=>declarations.push({ruleId,clauseId,field,quote,participant,existing:false});
const adopt=(ruleId,clauseId,field,quote,roleId,participant)=>declarations.push({ruleId,clauseId,field,quote,roleId,participant,existing:true});

declare("datasheet-beasts-of-nurgle:section:1","source-clause-1",b(0),
  "Grotesque Regeneration: At the end of each phase, if a Beasts of Nurgle model in this unit has lost any wounds but is not destroyed, that model regains all of its lost wounds.",
  {"id": "text-recipient", "subject": "MODEL", "allegiance": "FRIENDLY", "binding": "SOURCE_UNIT_MODELS"});
declare("datasheet-biologus-putrifier:section:1","source-clause-2",b(1),
  "Extraction of Fresh Disease: The first time this model’s unit destroys an enemy unit as the result of a melee attack, until the end of the battle, add 6 to the Objective Control characteristic of this model.",
  {"id": "text-recipient", "subject": "MODEL", "allegiance": "FRIENDLY", "binding": "SOURCE_MODEL"});
declare("datasheet-chaos-land-raider:section:4","source-clause-1",b(0),
  "While this model has 1-5 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll.",
  {"id": "text-recipient", "subject": "MODEL", "allegiance": "FRIENDLY", "binding": "SOURCE_MODEL"});
declare("datasheet-chaos-predator-annihilator:section:3","source-clause-1",b(0),
  "While this model has 1-4 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll.",
  {"id": "text-recipient", "subject": "MODEL", "allegiance": "FRIENDLY", "binding": "SOURCE_MODEL"});
declare("datasheet-chaos-predator-destructor:section:3","source-clause-1",b(0),
  "While this model has 1-4 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll.",
  {"id": "text-recipient", "subject": "MODEL", "allegiance": "FRIENDLY", "binding": "SOURCE_MODEL"});
declare("datasheet-daemon-prince-of-nurgle:section:1","source-clause-1",b(0),
  "Death Guard Defenders: While this model is within 3\" of one or more friendly DEATH GUARD INFANTRY units, this model has the Lone Operative ability.",
  {"id": "text-recipient", "subject": "MODEL", "allegiance": "FRIENDLY", "binding": "SOURCE_MODEL"});
declare("datasheet-deathshroud-terminators:section:1","source-clause-2",b(1),
  "Death Approaches: In your Movement phase, each time this unit is set up on the battlefield using the Deep Strike ability, it can be set up anywhere on the battlefield that is more than 6\" horizontally away from all Afflicted enemy units, and more than 8\" horizontally away from all other enemy units.",
  {"id": "text-recipient", "subject": "UNIT", "allegiance": "FRIENDLY", "binding": "SOURCE_UNIT", "scope": "FORMED"});
declare("datasheet-defiler:section:1","source-clause-1",b(0),
  "Scuttling Walker: Each time this unit makes a Normal, Advance or Fall Back move, it can move through models (excluding TITANIC models) and terrain features. When doing so, it can move within Engagement Range of enemy models, but cannot end that move within Engagement Range of them, and any Desperate Escape test is automatically passed.",
  {"id": "text-recipient", "subject": "UNIT", "allegiance": "FRIENDLY", "binding": "SOURCE_UNIT", "scope": "FORMED"});
declare("datasheet-defiler:section:3","source-clause-1",b(0),
  "While this model has 1-6 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll.",
  {"id": "text-recipient", "subject": "MODEL", "allegiance": "FRIENDLY", "binding": "SOURCE_MODEL"});
declare("datasheet-foetid-bloat-drone:section:1","source-clause-1",b(0),
  "Hovering Death: This model is eligible to shoot and declare a charge in a turn in which it Fell Back.",
  {"id": "text-recipient", "subject": "MODEL", "allegiance": "FRIENDLY", "binding": "SOURCE_MODEL"});
declare("datasheet-foul-blightspawn:section:1","source-clause-1",b(0),
  "Blinding Spray: In the Fight phase, you can select one model from your army with this ability to use this ability. If you do, until the end of the phase, that model’s unit has the Fights First ability. Each model can only be selected for this ability once per battle.",
  {"id": "text-recipient", "subject": "UNIT", "allegiance": "FRIENDLY", "binding": "SOURCE_UNIT", "scope": "FORMED"});
declare("datasheet-great-unclean-one:section:3","source-clause-1",b(0),
  "While this model has 1-7 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll.",
  {"id": "text-recipient", "subject": "MODEL", "allegiance": "FRIENDLY", "binding": "SOURCE_MODEL"});
declare("datasheet-helbrute:section:1","source-clause-1",b(0),
  "Diseased Malice: Each time this model makes an attack that targets an Afflicted unit, add 1 to the Wound roll.",
  {"id": "text-recipient", "subject": "MODEL", "allegiance": "FRIENDLY", "binding": "SOURCE_MODEL"});
declare("datasheet-lord-of-contagion:section:1","source-clause-2",b(1),
  "Unholy Resilience: The first time a model with this ability is destroyed in a battle round, roll one D6 at the end of the phase. On a 2+, set that model back up on the battlefield, as close as possible to where it was destroyed and not within Engagement Range of any enemy units, with 3 wounds remaining. Each model can only be set up in this way once per battle.",
  {"id": "text-recipient", "subject": "MODEL", "allegiance": "FRIENDLY", "binding": "SOURCE_MODEL"});
declare("datasheet-mortarion:section:5","source-clause-1",b(0),
  "While this model has 1-6 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll.",
  {"id": "text-recipient", "subject": "MODEL", "allegiance": "FRIENDLY", "binding": "SOURCE_MODEL"});
declare("datasheet-myphitic-blight-hauler:section:1","source-clause-1",b(0),
  "Tank Hunters: In your Shooting phase, each time a model in this unit makes an attack that targets a MONSTER or VEHICLE unit, add 1 to the Hit roll and add 1 to the Wound roll.",
  {"id": "text-recipient", "subject": "MODEL", "allegiance": "FRIENDLY", "binding": "SOURCE_FORMED_MODELS"});
declare("datasheet-plague-surgeon:section:1","source-clause-2",b(1),
  "Inflamed Infections: At the start of the Fight phase, select one enemy unit within Engagement Range of this model. Until the end of the phase, each time this model makes an attack that targets that unit, an unmodified Hit roll of 5+ scores a Critical Hit. If that unit is Below Half-strength, an unmodified Hit roll of 4+ scores a Critical Hit instead.",
  {"id": "text-recipient", "subject": "MODEL", "allegiance": "FRIENDLY", "binding": "SOURCE_MODEL"});
declare("datasheet-plagueburst-crawler:section:3","source-clause-1",b(0),
  "While this model has 1-4 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll.",
  {"id": "text-recipient", "subject": "MODEL", "allegiance": "FRIENDLY", "binding": "SOURCE_MODEL"});
declare("datasheet-poxwalkers:section:1","source-clause-1",b(0),
  "Curse of the Walking Pox: Each time a POXWALKER model in this unit makes an attack that destroys an enemy model (excluding MONSTER and VEHICLE models), after this unit has resolved its attacks, you can return one destroyed POXWALKER model to this unit.\nWhile TYPHUS is leading this unit, enemy models destroyed as a result of TYPHUS’ Eater Plague ability count as enemy models destroyed by an attack made by a POXWALKER model in this unit for the purposes of this ability.",
  {"id": "text-recipient", "subject": "UNIT", "allegiance": "FRIENDLY", "binding": "SOURCE_UNIT", "scope": "FORMED"});
declare("datasheet-rotigus:section:3","source-clause-1",b(0),
  "While this model has 1-7 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll.",
  {"id": "text-recipient", "subject": "MODEL", "allegiance": "FRIENDLY", "binding": "SOURCE_MODEL"});
declare("detachment-virulent-vectorium:enhancement:3","attack-reroll",text,
  "DEATH GUARD model only. While the bearer’s unit is within range of an objective marker you control, each time a model in the bearer’s unit makes an attack, you can re-roll the Wound roll.",
  {"id": "text-recipient", "subject": "MODEL", "allegiance": "FRIENDLY", "binding": "SOURCE_FORMED_MODELS"});
adopt("detachment-shamblerot-vectorium:enhancement:1","test-modifier",text,
  "NOXIOUS BLIGHTBRINGER only. While the bearer is leading a POXWALKERS unit, add 1 to the Objective Control characteristic of models in that unit, and each time that unit takes a Battle-shock or Leadership test, add 1 to that test.","affected-unit",
  {"subject": "FORMED_ATTACHED_UNIT"});
adopt("detachment-shamblerot-vectorium:enhancement:2","setup-round",text,
  "DEATH GUARD model only. If the bearer is leading a POXWALKER unit, and is in Strategic Reserves, for the purposes of setting up that unit on the battlefield, treat the current battle round as the third battle round.","affected-unit",
  {"subject": "FORMED_ATTACHED_UNIT"});
adopt("detachment-tallyband-summoners:enhancement:1","deep-strike",text,
  "DEATH GUARD model only. Each time a PLAGUE LEGIONS unit from your army is set up on the battlefield using the Deep Strike ability, if it is set up wholly within 12\" of the bearer, it can be set up anywhere that is more than 6\" horizontally away from all enemy models, instead of more than 8\".","affected-unit",
  {"subject": "UNIT", "binding": "ROSTER_UNITS", "scope": "FORMED"});
adopt("detachment-tallyband-summoners:enhancement:3","battle-shock",text,
  "GREAT UNCLEAN ONE only. In the Battle-shock step of your opponent’s Command phase, each enemy unit within 6\" of the bearer that is below its Starting Strength must take a Battle-shock test, subtracting 1 from that test.","affected-enemy",
  {"subject": "UNIT", "scope": "FORMED"});
adopt("detachment-tallyband-summoners:enhancement:4","test-modifier",text,
  "MALIGNANT PLAGUECASTER only. Each time a PLAGUE LEGIONS unit within 12\" of the bearer takes a Battle-shock test, add 1 to that test and, if that test is passed, one model in that unit regains up to D3 lost wounds (if that unit is a BATTLELINE unit and that test is passed, up to D3 destroyed models can be returned to that unit instead).","affected-unit",
  {"subject": "UNIT", "scope": "FORMED"});
adopt("detachment-tallyband-summoners:enhancement:4","return-models",text,
  "MALIGNANT PLAGUECASTER only. Each time a PLAGUE LEGIONS unit within 12\" of the bearer takes a Battle-shock test, add 1 to that test and, if that test is passed, one model in that unit regains up to D3 lost wounds (if that unit is a BATTLELINE unit and that test is passed, up to D3 destroyed models can be returned to that unit instead).","affected-unit",
  {"subject": "UNIT", "scope": "FORMED"});
adopt("detachment-death-lords-chosen:rule","damage",text,
  "In your opponent’s Command phase, roll 2D6 for each Afflicted enemy unit, subtracting 1 from the result if that unit is Below Half-strength. If the result is 6 or less, that enemy unit suffers D3 mortal wounds.","affected-enemy",
  {"subject": "UNIT", "scope": "FORMED"});
adopt("detachment-death-lords-chosen:enhancement:1","battle-shock",text,
  "TERMINATOR model only. At the start of the Fight phase, each enemy unit within Engagement Range of the bearer’s unit must take a Battle-shock test.","affected-enemy",
  {"subject": "UNIT", "scope": "FORMED"});
adopt("detachment-death-lords-chosen:enhancement:2","advance-reroll",text,
  "TERMINATOR model only. While the bearer is leading a unit, add 1\" to the Movement characteristic of models in that unit and you can re-roll Advance rolls made for that unit.","affected-unit",
  {"subject": "FORMED_ATTACHED_UNIT"});
adopt("detachment-death-lords-chosen:enhancement:3","place-in-reserves",text,
  "TERMINATOR model only. Once per battle, at the end of your opponent’s turn, if the bearer’s unit is not within Engagement Range of one or more enemy units, you can remove it from the battlefield and place it into Strategic Reserves.","affected-unit",
  {"subject": "UNIT", "binding": "SOURCE_UNIT", "scope": "FORMED"});
declare("detachment-death-lords-chosen:enhancement:4","targeting-restriction",text,
  "TERMINATOR model only. While the bearer is leading a unit, models in that unit cannot be targeted by ranged attacks unless the attacking model is within 18\".",
  {"id": "text-recipient", "subject": "MODEL", "allegiance": "FRIENDLY", "binding": "SOURCE_FORMED_MODELS"});
adopt("detachment-mortarions-hammer:rule","selected-enemies",text,
  "At the start of the battle round, select a number of enemy units more than 12\" away from every model from your army that is on the battlefield. Until the end of the battle round, those enemy units are Afflicted. The maximum number of units you can select in this way depends on the battle size, as shown below.\nBATTLE SIZEUNITSIncursion1Strike Force2Onslaught3","affected-enemy",
  {"subject": "UNIT", "scope": "FORMED"});
declare("detachment-mortarions-hammer:enhancement:1","ignores-cover",text,
  "DEATH GUARD model only. Ranged weapons equipped by models in the bearer’s unit have the [ignores cover] ability while targeting an Afflicted enemy unit.",
  {"id": "text-recipient", "subject": "MODEL", "allegiance": "FRIENDLY", "binding": "SOURCE_FORMED_MODELS"});
adopt("detachment-mortarions-hammer:enhancement:2","plague-wind-range",text,
  "MALIGNANT PLAGUECASTER only. At the start of your Shooting phase, until the end of the phase, add 12\" to the Range characteristics of the bearer’s Plague Wind weapon.","affected-model",
  {"subject": "MODEL", "binding": "SOURCE_MODEL"});
adopt("detachment-mortarions-hammer:enhancement:4","lone-operative",text,
  "LORD OF VIRULENCE only. While the bearer is within 3\" of one or more friendly DEATH GUARD VEHICLE units, the bearer has the Lone Operative ability, and each time one of those VEHICLE units makes a ranged attack that targets an enemy unit visible to the bearer, re-roll a Wound roll of 1.","affected-model",
  {"subject": "MODEL", "binding": "SOURCE_MODEL"});
adopt("detachment-mortarions-hammer:enhancement:4","vehicle-wound-reroll",text,
  "LORD OF VIRULENCE only. While the bearer is within 3\" of one or more friendly DEATH GUARD VEHICLE units, the bearer has the Lone Operative ability, and each time one of those VEHICLE units makes a ranged attack that targets an enemy unit visible to the bearer, re-roll a Wound roll of 1.","affected-vehicle",
  {"subject": "UNIT", "binding": "ROSTER_UNITS", "scope": "FORMED"});
adopt("detachment-champions-of-contagion:enhancement:1","additional-plague",text,
  "BIOLOGUS PUTRIFIER only. Once per battle, after the bearers unit has fought, if one or more CHARACTER models were destroyed as a result of those attacks, select one Plague. Until the end of the battle, while an enemy unit is Afflicted, that unit has the effect of the selected Plague in addition to any other.","affected-enemy",
  {"subject": "UNIT", "scope": "FORMED"});
adopt("detachment-champions-of-contagion:enhancement:2","afflicted",text,
  "MALIGNANT PLAGUECASTER only. While an enemy unit is enfeebled by the bearer’s Pestilent Fallout ability, that unit is also Afflicted.","affected-enemy",
  {"subject": "UNIT", "scope": "FORMED"});
adopt("detachment-champions-of-contagion:enhancement:4","additional-plague",text,
  "LORD OF POXES only. In the Declare Battle Formations step select one Plague. Until the end of the battle, while an enemy unit is within Contagion Range of the bearer, that enemy unit has the effect of that Plague in addition to any other.","affected-enemy",
  {"subject": "UNIT", "scope": "FORMED"});
adopt("detachment-paragons-of-putrescence:enhancement:1","wound-roll-modifier",text,
  "DEATH GUARD INFANTRY model only (excluding TERMINATOR models). Attacks that target this unit with a S greater than this unit’s T have -1 to wound rolls.","affected-unit",
  {"subject": "UNIT", "binding": "SOURCE_UNIT", "scope": "FORMED"});
adopt("detachment-paragons-of-putrescence:enhancement:2","additional-plague",text,
  "DEATH GUARD INFANTRY model only. (Once per battle, per army) In your Command phase, you can use this ability. If you do, select one of the Plagues listed in Nurgle’s Gift (see Codex: Death Guard). Enemy units within Contagion Range of this unit also have the effect of that Plague in addition to your army’s chosen Plague until the end of the battle.","affected-enemy",
  {"subject": "UNIT", "scope": "FORMED"});
const valueAt=(entity,field)=>field.reduce((value,key)=>value?.[key],entity.data);

/** Called only on the book-owned declaration scratch, before common finalize. */
export function recordDeathGuardTextRecipients(book){
  assert.equal(book.bookId,'death-guard','Foreign text-recipient book');
  const entities=new Map(book.entities.map(entity=>[entity.id,entity]));
  assert.equal(entities.size,book.entities.length,'Duplicate source recipient owner');
  const seen=new Set();
  for(const declaration of declarations){
    const {ruleId,clauseId,field,quote,participant}=declaration;
    const key=ruleId+'\0'+clauseId;
    assert.ok(!seen.has(key),'Duplicate source text recipient declaration: '+key);seen.add(key);
    const entity=entities.get(ruleId),contract=entity?.ruleContract;
    assert.ok(entity&&contract&&entity.kind!=='STRATAGEM'&&contract.kind!=='STRATAGEM','Unresolved non-Stratagem recipient owner: '+ruleId);
    const clauses=contract.clauses.filter(clause=>clause.id===clauseId);
    assert.equal(clauses.length,1,'Unresolved exact source recipient clause: '+key);
    const clause=clauses[0],source=valueAt(entity,field);
    assert.ok(typeof source==='string'&&source.includes(quote),'Text recipient source quote changed: '+key);
    assert.ok(clause.sourceFields.some(path=>path.every((part,index)=>field[index]===part)),'Text recipient is outside its source clause: '+key);
    assert.ok(Array.isArray(clause.roles),'Missing source participant list: '+key);
    const evidence={field:structuredClone(field),quote};
    if(declaration.existing){
      const matches=clause.roles.filter(role=>role.id===declaration.roleId);
      assert.equal(matches.length,1,'Unresolved source recipient role: '+key);
      const role=matches[0];assert.equal(role.subject,participant.subject,'Source recipient subject changed: '+key);
      assert.ok(role.purpose===undefined||role.purpose==='EFFECT_RECIPIENT','Source actor cannot become a recipient: '+key);
      for(const name of ['binding','scope'])if(Object.hasOwn(participant,name))
        assert.ok(role[name]===undefined||role[name]===participant[name],'Conflicting source recipient '+name+': '+key);
      Object.assign(role,structuredClone(participant),{purpose:'EFFECT_RECIPIENT',evidence});
    }else{
      const role={...structuredClone(participant),purpose:'EFFECT_RECIPIENT',
        selector:{predicate:'ALWAYS',subject:participant.subject,contextLevel:'STATIC',arguments:{},evidence:structuredClone(evidence)},evidence};
      const matches=clause.roles.filter(existing=>existing.id===role.id);
      assert.ok(matches.length<=1,'Duplicate source text participant: '+key);
      if(matches.length)assert.deepEqual(matches[0],role,'Source text participant drift: '+key);
      else clause.roles.push(role);
    }
  }
  return book;
}

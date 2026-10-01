import assert from 'node:assert/strict';

// These source-ID keyed declarations describe applicability and participant
// scope. Gameplay wording and values remain in canonical entity.data; no
// publication, V1 matrix, title lookup or executable battle effect is used.
const field = ['text'];
const characterProof = {otherEntityId:'book-death-guard:introduction',field:['clauses',3,'text'],quote:'CHARACTERS'};
const levels = {STATIC:0,ROSTER:1,BATTLE:2};
const all = (...args) => ({op:'ALL',args});
const any = (...args) => ({op:'ANY',args});
const not = arg => ({op:'NOT',args:[arg]});
const atom = (predicate,subject,contextLevel,arguments_,quote,evidence={}) => ({predicate,subject,contextLevel,arguments:arguments_,evidence:{field,quote,...evidence}});
const modelKeyword = (keyword,quote=keyword) => atom('MODEL_KEYWORD','MODEL','STATIC',{keyword},quote);
const unitKeyword = (keyword,quote=keyword,subject='UNIT') => atom('UNIT_KEYWORD',subject,'STATIC',{keyword},quote);
const modelOwner = (...requirements) => all(atom('MODEL_KEYWORD','MODEL','STATIC',{keyword:'CHARACTER'},'CHARACTERS',characterProof),...requirements);
const modelId = (id,quote) => atom('MODEL_ID','MODEL','STATIC',{id},quote);
const unitId = (id,quote) => atom('UNIT_ID','UNIT','STATIC',{id},quote);
const leading = quote => atom('LEADING','MODEL','ROSTER',{value:true},quote);
const bodyguard = quote => atom('BODYGUARD_ID','MODEL','ROSTER',{id:'unit-poxwalkers'},quote);
const state = (key,quote,subject='MODEL',equals=true) => atom('FIELD',subject,'BATTLE',{key,equals},quote);
const rosterState = (key,quote,subject='MODEL',equals=true) => atom('FIELD',subject,'ROSTER',{key,equals},quote);
const role = (id,subject,selector,allegiance='FRIENDLY') => ({id,subject,allegiance,selector});
const selfUnit = quote => role('affected-unit','UNIT',atom('ALWAYS','UNIT','STATIC',{},quote));
const ledUnit = quote => role('affected-unit','FORMED_ATTACHED_UNIT',atom('ALWAYS','FORMED_ATTACHED_UNIT','STATIC',{},quote));
const selfModel = quote => role('affected-model','MODEL',atom('ALWAYS','MODEL','STATIC',{},quote));
const enemy = quote => role('affected-enemy','UNIT',atom('ALWAYS','UNIT','STATIC',{},quote),'ENEMY');
const clause = (id,roles,conditions=[],sourceFields=[field]) => ({id,roles,conditions,sourceFields});
const dg = () => modelOwner(modelKeyword('DEATH GUARD'));
const named = keyword => modelOwner(modelKeyword(keyword));
const terminator = () => modelOwner(modelKeyword('TERMINATOR'));
const infantry = excludeTerminator => modelOwner(modelKeyword('DEATH GUARD'),modelKeyword('INFANTRY'),...(excludeTerminator?[not(modelKeyword('TERMINATOR','excluding TERMINATOR models'))]:[]));
const owner = (selector,subject='MODEL') => role('eligible-owner',subject,selector);
const specifications = new Map();

function enhancement(id,selector,category,conditions=[],clauses=[],subject='MODEL') {
  specifications.set(id,{kind:'ENHANCEMENT',roles:[owner(selector,subject)],category,conditions,clauses,sourceFields:[field]});
}

enhancement('detachment-virulent-vectorium:enhancement:1',dg(),'MELEE_CRITICAL_HIT',
 [state('bearerMeleeAttack','Each time the bearer makes a melee attack')],
 [clause('critical-hit',[selfModel('the bearer')],[state('unmodifiedHitRollFiveOrMore','an unmodified Hit roll of 5+')])]);
enhancement('detachment-virulent-vectorium:enhancement:2',dg(),'BEARER_MELEE_WEAPON_MODIFIERS',[],
 [clause('weapon-modifiers',[selfModel('the bearers melee weapons')])]);
enhancement('detachment-virulent-vectorium:enhancement:3',dg(),'UNIT_WOUND_REROLL',
 [state('bearerUnitWithinControlledObjective','While the bearer’s unit is within range of an objective marker you control')],
 [clause('attack-reroll',[selfUnit('a model in the bearer’s unit')],[state('bearerUnitModelAttacks','each time a model in the bearer’s unit makes an attack')])]);
enhancement('detachment-virulent-vectorium:enhancement:4',dg(),'BEARER_DEFENSIVE_ABILITY',[],
 [clause('feel-no-pain',[selfModel('The bearer')])]);

enhancement('detachment-shamblerot-vectorium:enhancement:1',named('NOXIOUS BLIGHTBRINGER'),'LEADING_UNIT_CHARACTERISTIC_AND_TEST',
 [leading('While the bearer is leading a POXWALKERS unit'),bodyguard('POXWALKERS unit')],
 [clause('objective-control',[ledUnit('models in that unit')]),clause('test-modifier',[ledUnit('that unit')],[state('unitBattleShockOrLeadershipTest','each time that unit takes a Battle-shock or Leadership test','FORMED_ATTACHED_UNIT')])]);
enhancement('detachment-shamblerot-vectorium:enhancement:2',dg(),'RESERVES_SETUP_ROUND',
 [leading('If the bearer is leading a POXWALKER unit'),bodyguard('POXWALKER unit'),state('inStrategicReserves','is in Strategic Reserves')],
 [clause('setup-round',[ledUnit('setting up that unit on the battlefield')],[state('unitBeingSetUp','for the purposes of setting up that unit on the battlefield','FORMED_ATTACHED_UNIT')])]);
enhancement('detachment-shamblerot-vectorium:enhancement:3',named('MALIGNANT PLAGUECASTER'),'LEADING_WEAPON_AND_BODYGUARD_COST',[],
 [clause('plague-wind-damage',[selfModel('the bearer’s Plague Wind weapon')],[leading('While the bearer is leading a POXWALKERS unit'),bodyguard('POXWALKERS unit')]),
  clause('bodyguard-destruction',[role('affected-bodyguard-model','MODEL',all(rosterState('isBodyguardModel','Bodyguard models'),rosterState('memberOfBearerUnit','from the bearer’s unit')))],
    [state('bearerMadePlagueWindAttacks','Each time the bearer makes one or more attacks with a Plague Wind weapon'),state('bearerUnitFinishedAttacks','after the bearer’s unit has resolved its attacks')])]);
enhancement('detachment-shamblerot-vectorium:enhancement:4',dg(),'LEADING_BODYGUARD_TOUGHNESS',
 [leading('While the bearer is leading a unit')],
 [clause('poxwalkers-toughness',[role('affected-model','MODEL',all(modelKeyword('POXWALKERS','POXWALKERS models in that unit'),rosterState('memberOfBearerUnit','models in that unit')))])]);

enhancement('detachment-tallyband-summoners:enhancement:1',dg(),'FRIENDLY_DEEP_STRIKE_SETUP',[],
 [clause('deep-strike',[role('affected-unit','UNIT',unitKeyword('PLAGUE LEGIONS'))],[state('usingDeepStrikeSetup','is set up on the battlefield using the Deep Strike ability','UNIT'),state('whollyWithinTwelveOfBearer','if it is set up wholly within 12" of the bearer','UNIT')])]);
enhancement('detachment-tallyband-summoners:enhancement:2',dg(),'BEARER_MELEE_ATTACKS',[],
 [clause('melee-attacks',[selfModel('the bearer’s melee weapons')])]);
enhancement('detachment-tallyband-summoners:enhancement:3',named('GREAT UNCLEAN ONE'),'ENEMY_BATTLE_SHOCK',
 [state('opponentCommandBattleShockStep','In the Battle-shock step of your opponent’s Command phase')],
 [clause('battle-shock',[enemy('each enemy unit')],[state('withinSixOfBearer','within 6" of the bearer','UNIT'),state('belowStartingStrength','below its Starting Strength','UNIT')])]);
enhancement('detachment-tallyband-summoners:enhancement:4',named('MALIGNANT PLAGUECASTER'),'PLAGUE_LEGIONS_TEST_AND_RECOVERY',[],
 [clause('test-modifier',[role('affected-unit','UNIT',unitKeyword('PLAGUE LEGIONS'),'ANY')],[state('withinTwelveOfBearer','within 12" of the bearer','UNIT'),state('battleShockTest','takes a Battle-shock test','UNIT')]),
  clause('recover-wounds',[role('affected-unit','UNIT',unitKeyword('PLAGUE LEGIONS'),'ANY')],[state('withinTwelveOfBearer','within 12" of the bearer','UNIT'),state('battleShockTestPassed','if that test is passed','UNIT')]),
  clause('return-models',[role('affected-unit','UNIT',all(unitKeyword('PLAGUE LEGIONS'),unitKeyword('BATTLELINE')),'ANY')],[state('withinTwelveOfBearer','within 12" of the bearer','UNIT'),state('battleShockTestPassed','that test is passed','UNIT')])]);

enhancement('detachment-death-lords-chosen:enhancement:1',terminator(),'ENGAGED_ENEMY_BATTLE_SHOCK',
 [state('fightPhaseStart','At the start of the Fight phase')],
 [clause('battle-shock',[enemy('each enemy unit')],[state('inBearerUnitEngagementRange','within Engagement Range of the bearer’s unit','UNIT')])]);
enhancement('detachment-death-lords-chosen:enhancement:2',terminator(),'LEADING_MOVEMENT_AND_ADVANCE',
 [leading('While the bearer is leading a unit')],
 [clause('movement',[ledUnit('models in that unit')]),clause('advance-reroll',[ledUnit('that unit')],[state('unitAdvanceRoll','Advance rolls made for that unit','FORMED_ATTACHED_UNIT')])]);
enhancement('detachment-death-lords-chosen:enhancement:3',terminator(),'OPTIONAL_UNIT_RESERVES_MOVE',
 [state('oncePerBattleAvailable','Once per battle'),state('opponentTurnEnd','at the end of your opponent’s turn'),state('bearerUnitNotEngaged','if the bearer’s unit is not within Engagement Range of one or more enemy units'),state('optionalAbilityActivated','you can remove it from the battlefield')],
 [clause('place-in-reserves',[selfUnit('the bearer’s unit')])]);
enhancement('detachment-death-lords-chosen:enhancement:4',terminator(),'LEADING_RANGED_TARGETING_RESTRICTION',
 [leading('While the bearer is leading a unit')],
 [clause('targeting-restriction',[ledUnit('models in that unit'),
   {...role('attacking-model','MODEL',atom('ALWAYS','MODEL','STATIC',{},'attacking model'),'ENEMY'),
     conditions:[{...state('attackerWithinEighteen','unless the attacking model is within 18"','MODEL',false),roleId:'attacking-model'}]}],
   [state('rangedTargeting','targeted by ranged attacks','FORMED_ATTACHED_UNIT')])]);

enhancement('detachment-mortarions-hammer:enhancement:1',dg(),'UNIT_RANGED_TARGET_CONDITION',[],
 [clause('ignores-cover',[selfUnit('Ranged weapons equipped by models in the bearer’s unit')],[state('targetingAfflictedEnemy','while targeting an Afflicted enemy unit','UNIT')])]);
enhancement('detachment-mortarions-hammer:enhancement:2',named('MALIGNANT PLAGUECASTER'),'PHASE_BEARER_WEAPON_RANGE',
 [state('ownShootingPhaseStarted','At the start of your Shooting phase')],
 [clause('plague-wind-range',[selfModel('the bearer’s Plague Wind weapon')])]);
enhancement('detachment-mortarions-hammer:enhancement:3',dg(),'UNIT_OVERWATCH_RESOURCE_PERMISSION',
 [state('oncePerBattleRoundAvailable','Once per battle round'),state('fireOverwatchSelected','you can target the bearer’s unit with the Fire Overwatch Stratagem')],
 [clause('fire-overwatch',[selfUnit('the bearer’s unit')])]);
enhancement('detachment-mortarions-hammer:enhancement:4',named('LORD OF VIRULENCE'),'NEARBY_VEHICLE_AND_BEARER',
 [state('nearFriendlyDeathGuardVehicle','While the bearer is within 3" of one or more friendly DEATH GUARD VEHICLE units')],
 [clause('lone-operative',[selfModel('the bearer has the Lone Operative ability')]),
  clause('vehicle-wound-reroll',[role('affected-vehicle','UNIT',all(unitKeyword('DEATH GUARD'),unitKeyword('VEHICLE')))],[state('withinThreeOfBearer','one of those VEHICLE units','UNIT'),state('rangedAttackTargetsBearerVisibleEnemy','makes a ranged attack that targets an enemy unit visible to the bearer','UNIT')])]);

enhancement('detachment-champions-of-contagion:enhancement:1',named('BIOLOGUS PUTRIFIER'),'SELECTED_ADDITIONAL_PLAGUE',
 [state('oncePerBattleAvailable','Once per battle'),state('bearerUnitFinishedFighting','after the bearers unit has fought'),state('characterDestroyedByThoseAttacks','if one or more CHARACTER models were destroyed as a result of those attacks'),state('additionalPlagueSelected','select one Plague')],
 [clause('additional-plague',[enemy('while an enemy unit is Afflicted')],[state('isAfflicted','while an enemy unit is Afflicted','UNIT')])]);
enhancement('detachment-champions-of-contagion:enhancement:2',named('MALIGNANT PLAGUECASTER'),'ABILITY_CAUSED_AFFLICTED',[],
 [clause('afflicted',[enemy('an enemy unit')],[state('enfeebledByBearerPestilentFallout','While an enemy unit is enfeebled by the bearer’s Pestilent Fallout ability','UNIT')])]);
enhancement('detachment-champions-of-contagion:enhancement:3',named('PLAGUE SURGEON'),'BEARER_ABILITY_MODEL_RECOVERY',
 [state('usingTaintedNarthecium','Each time the bearer uses its Tainted Narthecium ability')],
 [clause('return-models',[selfUnit('the bearer’s unit')])]);
enhancement('detachment-champions-of-contagion:enhancement:4',named('LORD OF POXES'),'SELECTED_PLAGUE_AURA',
 [state('plagueSelectedInBattleFormations','In the Declare Battle Formations step select one Plague')],
 [clause('additional-plague',[enemy('an enemy unit')],[state('withinBearerContagionRange','while an enemy unit is within Contagion Range of the bearer','UNIT')])]);

enhancement('detachment-paragons-of-putrescence:enhancement:1',infantry(true),'UNIT_DEFENSIVE_ATTACK_CONDITION',[],
 [clause('wound-roll-modifier',[selfUnit('Attacks that target this unit')],[state('attackStrengthExceedsUnitToughness','with a S greater than this unit’s T','FORMED_ATTACHED_UNIT')])]);
enhancement('detachment-paragons-of-putrescence:enhancement:2',infantry(false),'PER_ARMY_SELECTED_PLAGUE_AURA',
 [state('oncePerBattlePerArmyAvailable','Once per battle, per army'),state('ownCommandPhase','In your Command phase'),state('optionalAbilityActivated','you can use this ability'),state('additionalPlagueSelected','select one of the Plague listed in Nurgle’s Gift')],
 [clause('additional-plague',[enemy('Enemy units')],[state('withinBearerUnitContagionRange','within Contagion Range of this unit','UNIT')])]);

enhancement('detachment-contagion-engines:enhancement:1',unitKeyword('CONTAGION ENGINE'),'UNIT_MODEL_HEALING',[],
 [clause('heal-model',[role('affected-unit','UNIT',unitKeyword('CONTAGION ENGINE'))],[state('unitFinishedFighting','When this unit has fought','UNIT')])],'UNIT');
enhancement('detachment-contagion-engines:enhancement:2',any(unitKeyword('HELBRUTE'),unitKeyword('MYPHITIC BLIGHT-HAULER')),'UNIT_ABILITY',[],
 [clause('mobile',[role('affected-unit','UNIT',any(unitKeyword('HELBRUTE'),unitKeyword('MYPHITIC BLIGHT-HAULER')))])],'UNIT');
enhancement('detachment-flyblown-host:enhancement:1',unitKeyword('PLAGUE MARINES'),'UNIT_ATTACK_TARGET_RANGE',[],
 [clause('wound-reroll',[role('affected-unit','UNIT',unitKeyword('PLAGUE MARINES'))],[state('attackTargetsUnitInFriendlyContagionRange','When this unit’s attacks target a unit within Contagion Range of a friendly unit','UNIT')])],'UNIT');
enhancement('detachment-flyblown-host:enhancement:2',unitKeyword('PLAGUE MARINES'),'UNIT_DETECTION_RANGE',[],
 [clause('detection-range',[role('affected-unit','UNIT',unitKeyword('PLAGUE MARINES'))])],'UNIT');

const detachments = new Map();
function detachment(id,category,roles,conditions,clauses) {
  detachments.set(id,{kind:'DETACHMENT_RULE',category,roles,conditions,clauses,sourceFields:[field]});
}
const army = quote => role('eligible-owner','ROSTER',atom('ALWAYS','ROSTER','STATIC',{},quote));
detachment('detachment-virulent-vectorium:rule','OBJECTIVE_CONTROLLED_AFFLICTION',
 [army('At the end of your Command phase')],[],
 [clause('secure-objective',[role('objective-controller','UNIT',unitKeyword('DEATH GUARD'))],[state('ownCommandPhaseEnd','At the end of your Command phase','ROSTER'),state('controlsObjective','if a friendly DEATH GUARD unit is controlling an objective','UNIT')]),
  clause('objective-affliction',[enemy('an enemy unit')],[state('securedObjectiveStillControlled','Until you lose control of that objective','ROSTER'),state('withinSecuredObjectiveRange','while an enemy unit is within range of that objective','UNIT')])]);
detachment('detachment-shamblerot-vectorium:rule','UNIT_CREATION_AND_STATIC_KEYWORD',
 [army('POXWALKERS units from your army')],[],
 [clause('create-poxwalkers',[role('created-unit','UNIT',unitKeyword('POXWALKERS'))],[state('ownCommandPhase','In your Command phase','ROSTER'),state('sourceTableAllowsCurrentBattleRound','depending on your chosen battle size','ROSTER')],[field,['tables']]),
  clause('battleline',[role('affected-unit','UNIT',unitKeyword('POXWALKERS'))])]);
detachment('detachment-tallyband-summoners:rule','RECIPROCAL_PROXIMITY_AND_ARMY_PERMISSION',
 [army('units from your army')],[],
 [clause('grant-nurgles-gift',[role('affected-unit','UNIT',unitKeyword('PLAGUE LEGIONS'))],[state('withinSevenOfFriendlyDeathGuard','within 7" of one or more DEATH GUARD units from your army','UNIT')]),
  clause('contagion-range',[role('affected-unit','UNIT',unitKeyword('DEATH GUARD'))],[state('withinSevenOfFriendlyPlagueLegions','within 7" of one or more PLAGUE LEGIONS units from your army','UNIT')]),
  clause('include-plague-legions',[role('included-unit','UNIT',unitKeyword('PLAGUE LEGIONS'))]),
  clause('warlord-restriction',[role('restricted-model','MODEL',modelKeyword('PLAGUE LEGIONS'))])]);
detachment('detachment-death-lords-chosen:rule','CONDITIONAL_ENEMY_DAMAGE',
 [army('In your opponent’s Command phase')],[state('opponentCommandPhase','In your opponent’s Command phase','ROSTER')],
 [clause('damage',[enemy('Afflicted enemy unit')],[state('isAfflicted','Afflicted enemy unit','UNIT'),state('rollResultSixOrLess','If the result is 6 or less','UNIT')])]);
detachment('detachment-mortarions-hammer:rule','SELECTED_ENEMY_AFFLICTION',
 [army('every model from your army that is on the battlefield')],[state('battleRoundStart','At the start of the battle round','ROSTER')],
 [clause('selected-enemies',[enemy('select a number of enemy units')],[state('moreThanTwelveFromEveryFriendlyModelOnBattlefield','more than 12" away from every model from your army that is on the battlefield','UNIT'),state('enemySelectedForMiasmicBombardment','select a number of enemy units','UNIT'),state('sourceTableSelectionCapSatisfied','depends on the battle size','ROSTER')],[field,['tables']])]);
detachment('detachment-champions-of-contagion:rule','SELECTED_ARMY_PLAGUE_REPLACEMENT',
 [army('your chosen Plague')],[state('battleRoundStart','At the start of the battle round','ROSTER'),state('optionalPlagueSelected','you can select one of the Plagues listed in Nurgle’s Gift','ROSTER')],
 [clause('replace-plague',[army('your chosen Plague instead of any previously chosen Plague')])]);
detachment('detachment-paragons-of-putrescence:rule','STATIC_CHARACTER_UNIT_CONTAGION_RANGE',
 [role('eligible-owner','UNIT',all(unitKeyword('DEATH GUARD'),unitKeyword('CHARACTER')))],[],
 [clause('contagion-range',[role('affected-unit','UNIT',all(unitKeyword('DEATH GUARD'),unitKeyword('CHARACTER')))])]);
detachment('detachment-contagion-engines:rule','STATIC_KEYWORD_WEAPON_AND_DETACHMENT_EXCLUSIVITY',
 [army('This detachment has the ENGINES tag')],[],
 [clause('grant-contagion-engine',[role('affected-unit','UNIT',any(unitKeyword('FOETID BLOAT-DRONE'),unitKeyword('FOETID BLOAT-DRONE WITH HEAVY BLIGHT LAUNCHER'),unitKeyword('HELBRUTE'),unitKeyword('MYPHITIC BLIGHT-HAULER')))]),
  clause('ranged-assault',[role('affected-unit','UNIT',unitKeyword('CONTAGION ENGINE'))]),
  clause('exclusive-detachment',[army('cannot be taken with another ENGINES detachment')])]);
detachment('detachment-flyblown-host:rule','OPTIONAL_SELECTED_UNIT_AND_DETACHMENT_EXCLUSIVITY',
 [army('In the Declare Battle Formations step')],[],
 [clause('selected-infiltrators',[role('affected-unit','UNIT',unitKeyword('PLAGUE MARINES'))],[state('unitSelectedForVerminousHaze','you can select up to two friendly PLAGUE MARINES units','UNIT'),state('selectedInDeclareBattleFormations','In the Declare Battle Formations step','ROSTER')]),
  clause('exclusive-detachment',[army('cannot be taken with another FLYBLOWN detachment')])]);

// A source-backed keyword contribution lets the generic compiler establish a
// static selected-Detachment keyword context without executing a battle effect.
const engineGrant=detachments.get('detachment-contagion-engines:rule').clauses[0];
engineGrant.keywordProjection={keyword:'CONTAGION ENGINE',roleId:'affected-unit',subject:'UNIT',
  selector:structuredClone(engineGrant.roles[0].selector),
  evidence:{field,quote:'Friendly FOETID BLOAT-DRONE/FOETID BLOAT-DRONE WITH HEAVY BLIGHT LAUNCHER/HELBRUTE/MYPHITIC BLIGHT-HAULER units have CONTAGION ENGINE.'}};
const battlelineGrant=detachments.get('detachment-shamblerot-vectorium:rule').clauses[1];
battlelineGrant.keywordProjection={keyword:'BATTLELINE',roleId:'affected-unit',subject:'UNIT',
  selector:structuredClone(battlelineGrant.roles[0].selector),
  evidence:{field,quote:'POXWALKERS units from your army gain the BATTLELINE keyword.'}};

const phaseDuration={ends:'PHASE_END',evidence:{field,quote:'until the end of the phase'}};
specifications.get('detachment-mortarions-hammer:enhancement:2').duration=phaseDuration;
for (const id of ['detachment-champions-of-contagion:enhancement:1','detachment-champions-of-contagion:enhancement:4']) {
  specifications.get(id).duration={ends:'BATTLE_END',evidence:{field,quote:'Until the end of the battle'}};
}
specifications.get('detachment-paragons-of-putrescence:enhancement:2').duration={ends:'BATTLE_END',evidence:{field,quote:'until the end of the battle'}};
detachments.get('detachment-mortarions-hammer:rule').duration={ends:'BATTLE_ROUND_END',evidence:{field,quote:'Until the end of the battle round'}};
detachments.get('detachment-champions-of-contagion:rule').duration={ends:'BATTLE_END',evidence:{field,quote:'Until the end of the battle'}};

const detachmentClasses={
  'detachment-virulent-vectorium:rule':'BATTLE_STATE_ONLY',
  'detachment-shamblerot-vectorium:rule':'GLOBAL_DETACHMENT_RULE',
  'detachment-tallyband-summoners:rule':'GLOBAL_DETACHMENT_RULE',
  'detachment-death-lords-chosen:rule':'BATTLE_STATE_ONLY',
  'detachment-mortarions-hammer:rule':'BATTLE_STATE_ONLY',
  'detachment-champions-of-contagion:rule':'BATTLE_STATE_ONLY',
  'detachment-paragons-of-putrescence:rule':'STATIC_SELECTOR_RULE',
  'detachment-contagion-engines:rule':'GLOBAL_DETACHMENT_RULE',
  'detachment-flyblown-host:rule':'GLOBAL_DETACHMENT_RULE'
};
for (const [id,classification] of Object.entries(detachmentClasses)) {
  detachments.get(id).applicabilityClass=classification;
}

function sourceValue(entity,path) {
  let value=entity.data;
  for (const part of path) value=value?.[part];
  return value;
}
function verifyAtoms(value,index,entity) {
  let level='STATIC';
  function visit(node) {
    if (!node || typeof node!=='object') return;
    if (node.evidence) {
      const source=index.get(node.evidence.otherEntityId||entity.id);
      const text=sourceValue(source,node.evidence.field);
      assert.equal(typeof text,'string',`${entity.id}: source field missing`);
      assert.ok(text.includes(node.evidence.quote),`${entity.id}: literal accepted source evidence missing: ${node.evidence.quote}`);
    }
    if (node.predicate) {
      assert.ok(Object.hasOwn(levels,node.contextLevel),'Explicit predicate context');
      if (levels[node.contextLevel]>levels[level]) level=node.contextLevel;
    }
    for (const child of Object.values(node)) {
      if (Array.isArray(child)) child.forEach(visit); else visit(child);
    }
  }
  visit(value);return level;
}
function compile(model,declarations,kind) {
  const index=new Map(model.entities.map(entity=>[entity.id,entity]));
  const targets=model.entities.filter(entity=>entity.kind===kind);
  assert.deepEqual(new Set(targets.map(entity=>entity.id)),new Set(declarations.keys()),`${kind}: complete exact source identities`);
  const result=new Map();
  for (const entity of targets) {
    const specification=structuredClone(declarations.get(entity.id));
    specification.detachmentId=entity.parentId;
    specification.compatibilityRoleIds=['eligible-owner'];
    specification.conditions.unshift(atom('DETACHMENT','ROSTER','ROSTER',{id:entity.parentId},entity.data.text));
    for (const sourceClause of specification.clauses) for (const sourceField of sourceClause.sourceFields) {
      if (!specification.sourceFields.some(existing=>JSON.stringify(existing)===JSON.stringify(sourceField))) specification.sourceFields.push(sourceField);
    }
    for (const sourceClause of specification.clauses) for (const condition of sourceClause.conditions) {
      if (!condition.roleId && condition.subject!==specification.roles[0].subject) {
        const participant=sourceClause.roles.find(candidate=>candidate.subject===condition.subject);
        condition.roleId=participant?.id||'eligible-owner';
      }
    }
    specification.executionMode='DECLARATIVE_APPLICABILITY';
    specification.contextLevel=verifyAtoms(specification,index,entity);
    result.set(entity.id,specification);
  }
  return result;
}
export const buildEnhancementContracts=model=>compile(model,specifications,'ENHANCEMENT');
export const buildDetachmentContracts=model=>compile(model,detachments,'DETACHMENT_RULE');

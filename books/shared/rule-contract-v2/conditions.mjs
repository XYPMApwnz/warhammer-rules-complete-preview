/** Shared finite condition vocabulary. Names carry no canonical identities.
 * Producer aliases are accepted only by the explicit translation/inverse APIs. */
const vocabulary={
  "BATTLE/boolean": [
    "aboutToConsolidate",
    "additionalPlagueSelected",
    "advanceOrChargeRoll",
    "advancedOrFellBackThisTurn",
    "afflicted",
    "afterAttackingUnitFinishedAttacks",
    "allocatedAttackAndTurnAllowance",
    "allocatedToModelInPrimaryUnit",
    "analysed",
    "arrivedFromReservesThisTurn",
    "arrivedUsingDeepStrikeThisTurn",
    "atEndOfPhase",
    "atStartOfBattle",
    "atStartOfBattleRound",
    "atStartOfFirstBattleRound",
    "atStartOfPhase",
    "attackAllocated",
    "attackAllocatedToThisModel",
    "attackClosestEligibleEnemy",
    "attackFromTargetUnitAllocatedToModel",
    "attackStrengthExceedsUnitToughness",
    "attackTargetEnemyWithinEngagementRangeOfFriendlyPlagueLegionsUnit",
    "attackTargetsFlyingUnit",
    "attackTargetsUnitInFriendlyContagionRange",
    "attackedPrimaryUnitThisPhase",
    "attackerWithinEighteen",
    "attacksFromSelectedAttackEvent",
    "battleConditionSatisfied",
    "battleEnemyRecipientEligible",
    "battleInProgress",
    "battleRoundInTwoToFive",
    "battleRoundStart",
    "battleSelectedRecipient",
    "battleShockTest",
    "battleShockTestPassed",
    "battleShocked",
    "battleTargetPrerequisitesSatisfied",
    "bearerMadePlagueWindAttacks",
    "bearerMeleeAttack",
    "bearerUnitFinishedAttacks",
    "bearerUnitFinishedFighting",
    "bearerUnitModelAttacks",
    "bearerUnitNotEngaged",
    "bearerUnitWithinControlledObjective",
    "belowStartingStrength",
    "bothArmiesDeployed",
    "characterDestroyedByThoseAttacks",
    "chargeDeclaredEnemyObjectiveWithin12",
    "chargeMoveEndedAndEnemyEngaged",
    "chargeRollMoveAndEngagement",
    "chargedThisTurn",
    "citationInSavageryActive",
    "commandPhaseOncePerBattleChosen",
    "commandPhaseVehicleWithin3",
    "conquerorImperativeActive",
    "controlsObjective",
    "darkPactAndAttackResolution",
    "darkPactLeadershipRoll7Plus",
    "darkPactOncePerBattle",
    "darkPactSelectedOnShootFight",
    "declaredChargeThisPhase",
    "deploymentCompleteSourceOnBattlefield",
    "destroyed",
    "destroyedModelReturnEligible",
    "destroyedThisPhase",
    "diceForPrimaryModelsDestroyedByThoseAttacks",
    "dicePerPrimaryModelWithinEngagementRangeOfSelectedEnemy",
    "disembarkAfterNormalMove",
    "disembarkedFromTransportThisTurn",
    "disembarkedThisTurn",
    "disembarkingFromTargetModel",
    "distinctFromPrimaryTarget",
    "eligibleReplacementUnit",
    "eligibleToFightThisPhase",
    "enemiesWithinEngagementRangeOfPrimary",
    "enemyAttackTargetBelowStartingStrength",
    "enemyAttackTargetWithinHalfRange",
    "enemyCharacterDestroyed",
    "enemyEngagedOnlyFortifications",
    "enemyEngagedWithPrimary",
    "enemyFallBackSelection",
    "enemyInBearerUnitEngagementRange",
    "enemyModelLosesWoundWhileItsUnitEngagedWithPrimary",
    "enemyModelsDestroyedByThisStratagem",
    "enemyMoveEndsWithin8AndNotEngaged",
    "enemyNonVehicleWithin3",
    "enemyRangeStrengthAndCommandShockStep",
    "enemySelectedForMiasmicBombardment",
    "enemyShootingDestroyedSourceModel",
    "enemyShootingFriendlyWithin3",
    "enemyStartingStrengthAttack",
    "enemyStratagemWithin12AndTurnAllowance",
    "enemyTargetInOpponentDeploymentZone",
    "enemyTargetSelectionJustFinished",
    "enemyWithin18TargetsSource",
    "enemyWithin6LeadershipOrShockTest",
    "enfeebledByBearerPestilentFallout",
    "engaged",
    "engagedWithPrimary",
    "equipmentBattleTrigger",
    "everyModelWithin3OfTargetTransport",
    "failedBattleShockTest",
    "failedLeadershipImpliesRemainStationary",
    "fightAfterAttackerFinishesThenRemove",
    "fightAttacksFinishedAndEnemyDestroyed",
    "fightEndDestroyedEnemyAndNotEngaged",
    "fightEndSourceAttackDestroyedEnemy",
    "fightPhaseChosenOncePerBattle",
    "fightPhaseSacrificeRoll",
    "fightPhaseStart",
    "fightStartEnemyEngaged",
    "fireOverwatchSelected",
    "firstEnemyDestroyedAndNotBattleShocked",
    "firstFabiusDestroyedAndPhaseEndRoll",
    "foughtThisPhase",
    "friendlyActionStarted",
    "friendlyAttackSelection",
    "friendlyChargeMoveJustEnded",
    "friendlyCommandEndObjectiveControl",
    "friendlyCommandStart",
    "friendlyDaemonVehicleWithin3",
    "friendlyDaemonVehicleWithin6",
    "friendlyInfantryRangeAndRangedAttackAllocated",
    "friendlyInfantryWithin3",
    "friendlyInfantryWithin6NotBattleShocked",
    "friendlyModelWhollyWithin9",
    "friendlyShootingSelection",
    "friendlyVehicleWithin3",
    "friendlyWithin6DarkPact",
    "garreonOnBattlefieldCommandPhase",
    "hasFought",
    "hasLostWounds",
    "hasNotFoughtThisPhase",
    "hasShot",
    "hasShotThisPhase",
    "hatedFoeBattleSelection",
    "heroicInterventionSelected",
    "hitByTriggerAttack",
    "inBearerUnitEngagementRange",
    "inOpponentDeploymentZone",
    "inReserves",
    "inStrategicReserves",
    "inTriggerUnit",
    "invokedContractWithinRange",
    "isAfflicted",
    "isTriggerUnit",
    "justAllocatedMortalWound",
    "justDeclaredCharge",
    "justDestroyed",
    "justEndedNormalAdvanceOrFallBackMove",
    "justFellBack",
    "justSelectedAttackTargets",
    "justShot",
    "leadershipTest",
    "leadershipTestPassed",
    "ledModelMeleeAttack",
    "ledUnitAttackTargeted",
    "ledUnitChargeMoveEnded",
    "lostModelsToTriggerEnemyUnit",
    "lostWoundsFromTriggerAttack",
    "madeChargeMoveThisTurn",
    "makesAttack",
    "makingAttack",
    "meleeAttack",
    "meleeAttackAfterCharge",
    "meleeAttackEnemyObjectiveState",
    "meleeAttackTargetsCharacter",
    "meleeAttackTargetsUnit",
    "meleeEnemyStartingStrength",
    "modelInUnitMakingAttack",
    "moreThan3FromAllEnemyUnits",
    "moreThanTwelveFromEveryFriendlyModelOnBattlefield",
    "moveAdvanceChargeModifierChoice",
    "movementBeforeReinforcements",
    "movementEndEnemyVehicleWithin12",
    "nearFriendlyDeathGuardVehicle",
    "normalAdvanceFallBackMove",
    "normalAdvanceOrChargeMove",
    "normalMoveEndedOncePerBattle",
    "normalOrAdvanceMoveEndedAndEnemyMovedOver",
    "onBattlefield",
    "oncePerBattleAvailable",
    "oncePerBattlePerArmyAvailable",
    "oncePerBattleRoundAvailable",
    "oncePerBattleRoundUseAvailable",
    "oncePerBattleUseAvailable",
    "oncePerPhaseSelectedShootFight",
    "oncePerPhaseUseAvailable",
    "oncePerTurnUseAvailable",
    "opponentCommandBattleShockStep",
    "opponentCommandPhase",
    "opponentTurnEnd",
    "optionalAbilityActivated",
    "optionalPlagueSelected",
    "originalAttacker",
    "overwatchTurnAllowance",
    "ownCommandPhase",
    "ownCommandPhaseEnd",
    "ownShootingPhaseStarted",
    "panegyricProcessionActive",
    "phaseStartOncePerBattleAndRecipientRange",
    "pileInOrConsolidate",
    "plagueSelectedInBattleFormations",
    "possessedBladeFightUse",
    "primaryMakesNormalAdvanceOrChargeMove",
    "primaryNotDestroyedAfterAttackerFought",
    "protectorImperativeActive",
    "rangedAttackAllocatedMonsterOrVehicle",
    "rangedAttackEngagementContext",
    "rangedAttackHitModifiers",
    "rangedAttackOccludedByFortification",
    "rangedAttackTargetIsAfflictedEnemyUnit",
    "rangedAttackTargetsBearerVisibleEnemy",
    "rangedAttackTargetsInfantry",
    "rangedTargeting",
    "remainingWoundsBandMatched",
    "resolvingFallout",
    "rollResultSixOrLess",
    "ruleActive",
    "sameActionStartedInTrigger",
    "savingThrowFailed",
    "secondBattleRoundOrLater",
    "securedObjectiveStillControlled",
    "selectedAsAttackTarget",
    "selectedAsEnemyAttackTarget",
    "selectedAttackTargetsNow",
    "selectedEnemyDeclaresCharge",
    "selectedInDeclareBattleFormations",
    "selectedObjectiveIsAcquisitionObjective",
    "selectedObjectiveWithin24",
    "selectedOtherDonor",
    "selectedReplacementModel",
    "selectedShootingEvent",
    "selectedToAdvanceNow",
    "selectedToAttackNow",
    "selectedToFallBack",
    "selectedToFallBackNow",
    "selectedToFight",
    "selectedToFightThisPhase",
    "selectedToMakeFallBackMove",
    "selectedToMoveOrChargeThisPhase",
    "selectedToMoveThisPhase",
    "selectedToShoot",
    "selectedToShootNow",
    "selectedToShootOrFightThisPhase",
    "selectedToShootThisPhase",
    "selectsAnchoredEnemyAsRangedAttackTarget",
    "setUpFromReservesWithinBearerExclusion",
    "settingUpAsReinforcements",
    "shieldEligibleTargetForThatAttack",
    "shieldVisibleToAttackingModel",
    "shootFightCompletedPsychicAttackHit",
    "shootOrFightResolution",
    "shootSelectedActivation",
    "shootingCompletedAndEnemyHit",
    "shootingSelectedOncePerBattle",
    "shootingStartEnemyVisibleWithin12",
    "shootingStartPsychicSelectionAndRoll",
    "shootingStartVisibleEnemySelected",
    "snapShootingAttack",
    "sourceBattleApplicability",
    "sourceTableAllowsCurrentBattleRound",
    "sourceTableSelectionCapSatisfied",
    "sourceUnitChargeMoveEnded",
    "sourceWithinObjectiveRangeAndRangedAttack",
    "startingActionNow",
    "stratagemTimingSatisfied",
    "stratagemUseAndRoundAllowance",
    "strategicReservesBattleRoundAndReinforcements",
    "sufferedMortalWoundsFromThisDeadlyDemise",
    "sufficientCapacityForEntireTargetUnit",
    "targetTransportMadeNormalMove",
    "targetedByTriggerEnemyCharge",
    "targetedByTriggerEnemyUnit",
    "targetingAfflictedEnemy",
    "targetsSelectedJustNow",
    "unitAdvanceRoll",
    "unitBattleShockOrLeadershipTest",
    "unitBeingSetUp",
    "unitFinishedFighting",
    "unitSelectedForVerminousHaze",
    "unmodifiedHitRollFiveOrMore",
    "usedPostShootingNormalMove",
    "usedThisStratagemThisBattle",
    "usingDeepStrikeSetup",
    "usingTaintedNarthecium",
    "visibleEnemyAttackTarget",
    "visibleEnemyTarget",
    "visibleEnemyUnit",
    "visibleToAttackingUnit",
    "visibleToBearer",
    "visibleToOneOrMorePrimaryModels",
    "visibleToPrimary",
    "visibleToPrimaryAndAttacker",
    "visibleToPrimaryModel",
    "visibleToPrimaryUnit",
    "visibleToReconUnit",
    "warmasterCommandSelection",
    "whollyWithinTwelveOfBearer",
    "within12OfBearer",
    "within12OfPrimary",
    "within12OfReconAnchor",
    "within12OfReconUnit",
    "within18OfTargetUnit",
    "within24OfPrimary",
    "within2HorizontalOfPrimary",
    "within30OfPrimaryModel",
    "within3OfEnemyUnit",
    "within3OfPrimary",
    "within3OfPrimaryModel",
    "within3OfSelectedTerrain",
    "within5VerticalOfPrimary",
    "within6OfCultMechanicusModelInTargetUnit",
    "within6OfOpponentDeploymentZone",
    "within6OfPrimary",
    "within6OfTargetUnit",
    "within8OfPrimary",
    "within8OfTriggerEnemyUnit",
    "withinAcquisitionObjectiveRange",
    "withinBearerContagionRange",
    "withinBearerUnitContagionRange",
    "withinContagionRangeOfPrimary",
    "withinEnemyEngagementRange",
    "withinEngagementRange",
    "withinEngagementRangeOfEnemy",
    "withinEngagementRangeOfEnemyAttackRecipient",
    "withinEngagementRangeOfPrimary",
    "withinEngagementRangeOfTargetUnit",
    "withinEngagementRangeOfTriggeringEnemy",
    "withinFocusOfHatredEngagementRange",
    "withinFriendlyMechanicusBattleline6",
    "withinFriendlyMechanicusVehicle3",
    "withinFriendlyObjectiveRange",
    "withinHalfWeaponRange",
    "withinOpponentDeploymentZone",
    "withinOtherFriendlyMechanicus3",
    "withinPrimaryTargetRange",
    "withinRange",
    "withinRangeOfAcquisitionObjective",
    "withinRangeOfFriendlyControlledObjectiveWhenDestroyed",
    "withinRangeOfObjective",
    "withinRangeOfSelectedObjective",
    "withinSecuredObjectiveRange",
    "withinSevenOfFriendlyDeathGuard",
    "withinSevenOfFriendlyPlagueLegions",
    "withinSixOfBearer",
    "withinSource12",
    "withinSource3",
    "withinSource6",
    "withinSourceEngagementRange",
    "withinThreeOfBearer",
    "withinTwelveOfBearer"
  ],
  "ROSTER/boolean": [
    "attached",
    "attachedAtBattleStart",
    "attachedToSelectedUnit",
    "attachedUnitsShareSelectedMark",
    "broadSpectrumDataTetherEquipped",
    "canAttachToReferencedUnit",
    "canBeLedByPrimary",
    "characterModelLeadingSource",
    "commandUplinkEquipped",
    "containsTechPriestModel",
    "enhancementAssigned",
    "equipmentBearerSatisfied",
    "equipmentRequirementSatisfied",
    "equipmentSelected",
    "hasAtLeastTwoLeaderUnits",
    "hasCanonicalDarkPacts",
    "hasFriendlyCharacterLeader",
    "identicalToDestroyedPrimaryUnit",
    "inOptionalSupportUnit",
    "inTargetUnit",
    "initialAttachmentBattleline",
    "isBodyguardComponentOfSource",
    "isBodyguardModel",
    "isWarlord",
    "ledBodyguardHasAbility",
    "meleeWeaponEquippedByPrimaryUnitModel",
    "memberOfBearerUnit",
    "memberOfEligibleUnit",
    "memberOfOwnerUnit",
    "memberOfPrimaryAttachedUnit",
    "memberOfPrimaryUnit",
    "memberOfSelectedUnit",
    "memberOfUnitRole",
    "modelFromYourArmy",
    "modelMemberOfPrimaryUnit",
    "needsInvulnerableSave",
    "needsMarkSelection",
    "otherDataPsalmDetachmentSelected",
    "otherFriendlyUnit",
    "permanentDoctrineSourcePresent",
    "physicalProfilePresent",
    "rangedWeaponEquippedByPrimaryUnitModels",
    "reviewedArmyMembershipProven",
    "sameUnitAsOwner",
    "selectedModelMark",
    "selectedUnitMark",
    "sourceEquipmentSelected",
    "sourceProfilePresent",
    "tauStudentRecipient",
    "twoAdditionalMeleeWeaponsEquipped"
  ],
  "BATTLE/string": [
    "attackType",
    "bombardmentChoice",
    "movementStep",
    "phase",
    "phaseBoundary",
    "phaseWindow",
    "remainingWoundsBand",
    "selectedOverrideAbility",
    "selectedWarmasterAbility",
    "turnOwner"
  ],
  "ROSTER/string": [
    "armyFaction",
    "compositionMemberId",
    "daChapterContextStatus",
    "daPhysicalChapter",
    "equipmentBearerLabel",
    "physicalModelScopeId",
    "physicalUnitInstanceId",
    "selectedSourceChoice",
    "selectedUpgrade"
  ]
};
const own=(value,key)=>Object.hasOwn(value,key);
const clone=structuredClone;
const fail=message=>{throw new TypeError('Condition vocabulary: '+message);};
const requireValue=(value,message)=>{if(!value)fail(message);};
const stable=value=>Array.isArray(value)?value.map(stable):value&&typeof value==='object'?Object.fromEntries(Object.keys(value).sort().map(key=>[key,stable(value[key])])):value;
const serialize=value=>JSON.stringify(stable(value));
const rawAliases=Object.freeze({
 smPhysicalUnitInstanceId:'physicalUnitInstanceId',tauPhysicalUnitInstanceId:'physicalUnitInstanceId',
 smPhysicalModelScopeId:'physicalModelScopeId',tauPhysicalModelScopeId:'physicalModelScopeId',
 smEquipmentBearerSatisfied:'equipmentBearerSatisfied',smPermanentAssaultSource:'permanentDoctrineSourcePresent',
 daAncientPresent:'physicalProfilePresent',daChampionPresent:'physicalProfilePresent',
 daArmyMembershipProven:'reviewedArmyMembershipProven',daPhysicalChapter:'physicalChapter',daChapterContextStatus:'chapterContextStatus',
 lordOfHostDeclaredBattleline:'initialAttachmentBattleline',tauMarkerSelected:'sourceEquipmentSelected',
 selectedSurpriseAssaultChoice:'selectedSourceChoice',tauStudentRecipient:'selectedSourceRecipient'
});
const presence=Object.freeze({
 daAncientPresent:{unitId:'unit-da-467009b00bb9402dadee',profileId:'model-da-9bdc9ba0422949849ecc'},
 daChampionPresent:{unitId:'unit-da-467009b00bb9402dadee',profileId:'model-da-d9a85659ae224494b0a7'}
});
const families=Object.freeze({
 attachedToSelectedUnit:'attachedToSelectedUnit',attachedUnitsShareSelectedMark:'attachedUnitsShareSelectedMark',
 battleSelectedRecipient:'battleSelectedRecipient',containsProfile:'sourceProfilePresent',
 destroyedModelReturnEligible:'destroyedModelReturnEligible',eligibleReplacementUnit:'eligibleReplacementUnit',
 enhancementAssigned:'enhancementAssigned',equipmentBattleTrigger:'equipmentBattleTrigger',
 hasCanonicalDarkPacts:'hasCanonicalDarkPacts',invokedContractWithinBearer3:'invokedContractWithinRange',
 ledBodyguardHasScouts6:'ledBodyguardHasAbility',memberOfEligibleUnit:'memberOfEligibleUnit',
 memberOfOwnerUnit:'memberOfOwnerUnit',memberOfSelectedUnit:'memberOfSelectedUnit',memberOfUnitRole:'memberOfUnitRole',
 needsInvulnerableSave:'needsInvulnerableSave',needsMarkSelection:'needsMarkSelection',remainingWoundsBand:'remainingWoundsBandMatched',
 ruleActive:'ruleActive',sameUnitAsOwner:'sameUnitAsOwner',selectedEquipment:'equipmentSelected',
 selectedOtherDonor:'selectedOtherDonor',selectedReplacementModel:'selectedReplacementModel',selectedUpgrade:'selectedUpgrade',
 setUpFromReservesWithinBearerExclusion:'setUpFromReservesWithinBearerExclusion',
 sourceBackedModelMark:'selectedModelMark',sourceBackedUnitMark:'selectedUnitMark',
 sourceBattleApplicability:'sourceBattleApplicability',warmasterRecipientWithin6:'withinRange'
});
const parameterTypes=Object.freeze({ruleId:'string',clauseId:'string',roleId:'string',conditionId:'string',equipmentId:'string',
 profileId:'string',unitId:'string',selectionGroupId:'string',selectionMode:'string',quantityProof:'string',keyword:'string',
 sourceEquipmentIdentity:'string',value:'number',inches:'number',from:'string',rangeContext:'string',canonicalId:'string',parameters:'object'});
const required=Object.freeze({
 physicalProfilePresent:['unitId','profileId'],equipmentBearerSatisfied:['equipmentId','quantityProof'],
 sourceEquipmentSelected:['sourceEquipmentIdentity'],selectedSourceChoice:['ruleId'],sourceProfilePresent:['profileId'],
 selectedUpgrade:['selectionGroupId','selectionMode'],selectedModelMark:['keyword'],selectedUnitMark:['keyword'],needsInvulnerableSave:['value'],
 withinRange:['ruleId','inches','from','rangeContext'],invokedContractWithinRange:['ruleId','inches','from'],
 ledBodyguardHasAbility:['ruleId','canonicalId','parameters'],
 ...Object.fromEntries(Object.values(families).filter(key=>!['sourceProfilePresent','selectedUpgrade','selectedModelMark','selectedUnitMark','needsInvulnerableSave','withinRange','invokedContractWithinRange','ledBodyguardHasAbility','equipmentSelected'].includes(key)).map(key=>[key,['ruleId']])),
 equipmentSelected:['equipmentId']
});
const physicalComputers=Object.freeze({
 physicalUnitInstanceId:'createPhysicalEquipmentConditionContext',physicalModelScopeId:'createPhysicalEquipmentConditionContext',
 equipmentBearerSatisfied:'createPhysicalEquipmentConditionContext',permanentDoctrineSourcePresent:'createPhysicalEquipmentConditionContext',
 physicalProfilePresent:'createVerifiedPhysicalConditionContext',reviewedArmyMembershipProven:'createVerifiedPhysicalConditionContext',
 physicalChapter:'createVerifiedPhysicalConditionContext',chapterContextStatus:'createVerifiedPhysicalConditionContext',
 sourceEquipmentSelected:'createSourceEquipmentConditionContext',selectedSourceChoice:'createSelectedSourceChoiceConditionContext',
 selectedUpgrade:'computeRosterCondition / createEquippedWeaponChoiceConditionContext',initialAttachmentBattleline:'createInitialAttachmentConditionContext',
 attached:'predicateContext',isBodyguardModel:'predicateContext',isWarlord:'predicateContext',
 hasFriendlyCharacterLeader:'predicateContext',hasAtLeastTwoLeaderUnits:'predicateContext',modelFromYourArmy:'predicateContext',
 equipmentRequirementSatisfied:'executeRosterEffects',enhancementAssigned:'computeRosterCondition',sourceProfilePresent:'computeRosterCondition',
 selectedModelMark:'computeRosterCondition',selectedUnitMark:'computeRosterCondition',needsMarkSelection:'computeRosterCondition',
 needsInvulnerableSave:'computeRosterCondition',attachedAtBattleStart:'computeRosterCondition',ledBodyguardHasAbility:'computeRosterCondition'
});
const definitions={};
for(const [kind,keys]of Object.entries(vocabulary)){
 const [level,valueType]=kind.split('/');
 for(const key of keys)if(!own(rawAliases,key)){
  requireValue(!definitions[key],'conflicting condition definition '+key);
  definitions[key]={key,level,contextLevel:level,valueType,arguments:Object.fromEntries((required[key]||[]).map(key=>[key,parameterTypes[key]])),
   computedBy:level==='BATTLE'?null:physicalComputers[key]||null};
 }
}
for(const key of ['physicalChapter','chapterContextStatus'])definitions[key]={key,level:'ROSTER',contextLevel:'ROSTER',valueType:'string',arguments:{},computedBy:physicalComputers[key]};
definitions.selectedSourceRecipient={key:'selectedSourceRecipient',level:'ROSTER',contextLevel:'ROSTER',valueType:'boolean',arguments:{},computedBy:null};
export const conditionDefinitions=Object.freeze(Object.fromEntries(Object.entries(definitions).sort(([a],[b])=>a<b?-1:a>b?1:0).map(([key,value])=>[key,Object.freeze(value)])));
export function conditionSpec(args){return conditionDefinitions[args?.key]||null;}
export const definitionForArguments=conditionSpec;
export function isCanonicalCondition(args){
 const spec=conditionSpec(args);if(!spec||!own(args,'equals')||typeof args.equals!==spec.valueType)return false;
 for(const key of required[args.key]||[])if(!own(args,key)||typeof args[key]!==parameterTypes[key])return false;
 for(const [key,value]of Object.entries(args))if(!['key','equals'].includes(key)){
  if(!own(parameterTypes,key)||typeof value!==parameterTypes[key])return false;
  if(typeof value==='string'&&!value||typeof value==='number'&&!Number.isFinite(value)||typeof value==='object'&&(!value||Array.isArray(value)))return false;
 }
 if(own(args,'quantityProof')&&!['POSITIVE_SELECTION','UNIFORM_PHYSICAL_GROUP'].includes(args.quantityProof))return false;
 if(own(args,'selectionMode')&&!['VALIDATED_CANONICAL_OPTION','VALIDATED_EQUIPPED_WEAPON'].includes(args.selectionMode))return false;
 return !own(args,'inches')||args.inches>0;
}
function entityBoundary(tail,{book,entity}={}){
 const entities=book?.entities||[],ids=[...entities.map(row=>row.id),...(entity?.id?[entity.id]:[])];
 const id=[...new Set(ids)].filter(id=>tail===id||tail.startsWith(id+':')).sort((a,b)=>b.length-a.length||(a<b?-1:1))[0];
 if(!id)return {ruleId:tail};
 const result={ruleId:id},suffix=tail.slice(id.length+1);if(!suffix)return result;
 const rule=entities.find(row=>row.id===id)||entity,contract=rule?.ruleContract;
 if(contract?.clauses?.some(clause=>clause.id===suffix))result.clauseId=suffix;
 else if([...(contract?.roles||[]),...(contract?.clauses||[]).flatMap(clause=>clause.roles||[])].some(role=>role.id===suffix))result.roleId=suffix;
 else result.conditionId=suffix;
 return result;
}
/** Explicit producer translation. No predicate text or selector is interpreted. */
export function translateFieldArguments(input,context={}){
 requireValue(input&&typeof input==='object'&&typeof input.key==='string','missing FIELD arguments');
 const args=clone(input),oldKey=args.key,options=context.book?.conditionBindingOptions||{};
 if(own(rawAliases,oldKey)){
  args.key=rawAliases[oldKey];
  if(oldKey==='smEquipmentBearerSatisfied'){
   args.quantityProof=options.equipmentBearerMode||'POSITIVE_SELECTION';
   if(context.node?.evidence?.otherEntityId)args.equipmentId=context.node.evidence.otherEntityId;
  }
  if(own(presence,oldKey))Object.assign(args,presence[oldKey]);
  if(oldKey==='tauMarkerSelected')args.sourceEquipmentIdentity='drone-marker-drone';
  if(oldKey==='selectedSurpriseAssaultChoice')args.ruleId='detachment-subterranean-assault:rule';
 }else if(oldKey.includes(':')){
  const separator=oldKey.indexOf(':'),family=oldKey.slice(0,separator),tail=oldKey.slice(separator+1);
  requireValue(own(families,family),'unregistered producer FIELD family '+family);args.key=families[family];
  if(family==='selectedEquipment')args.equipmentId=tail;
  else if(family==='containsProfile')args.profileId=tail;
  else if(family==='selectedUpgrade'){args.selectionGroupId=tail;args.selectionMode=options.selectedUpgradeMode||'VALIDATED_CANONICAL_OPTION';}
  else if(['sourceBackedModelMark','sourceBackedUnitMark'].includes(family))args.keyword=tail;
  else if(family==='needsInvulnerableSave'){args.value=Number(tail);requireValue(Number.isFinite(args.value),'invalid save threshold');}
  else{
   Object.assign(args,entityBoundary(tail,context));
   if(family==='warmasterRecipientWithin6')Object.assign(args,{inches:6,from:'SOURCE_MODEL',rangeContext:'RECIPIENT_OF_SOURCE_RULE'});
   if(family==='invokedContractWithinBearer3')Object.assign(args,{inches:3,from:'SOURCE_MODEL'});
   if(family==='ledBodyguardHasScouts6')Object.assign(args,{canonicalId:'core-scouts',parameters:{distance:6}});
  }
 }
 // A mixed-owner view keeps its existing physical input proof mode, even when
 // a parent producer has already translated the same source declaration.
 if(args.key==='equipmentBearerSatisfied'&&options.equipmentBearerMode)args.quantityProof=options.equipmentBearerMode;
 if(args.key==='selectedUpgrade'&&options.selectedUpgradeMode)args.selectionMode=options.selectedUpgradeMode;
 requireValue(conditionSpec(args),'unregistered condition '+args.key);
 return args;
}
/** Temporary producer/schema view only; never called by runtime FIELD lookup. */
export function declarationFieldArguments(input,{book}={}){
 requireValue(conditionSpec(input),'unknown canonical producer condition');
 const args=clone(input),key=args.key,options=book?.conditionBindingOptions||{};
 let oldKey;
 if(key==='physicalUnitInstanceId')oldKey=(options.physicalIdentityNamespace||'sm')+'PhysicalUnitInstanceId';
 else if(key==='physicalModelScopeId')oldKey=(options.physicalIdentityNamespace||'sm')+'PhysicalModelScopeId';
 else if(key==='equipmentBearerSatisfied')oldKey='smEquipmentBearerSatisfied';
 else if(key==='physicalProfilePresent')oldKey=Object.keys(presence).find(name=>presence[name].unitId===args.unitId&&presence[name].profileId===args.profileId);
 else if(key==='sourceEquipmentSelected'&&args.sourceEquipmentIdentity==='drone-marker-drone')oldKey='tauMarkerSelected';
 else if(key==='selectedSourceChoice'&&args.ruleId==='detachment-subterranean-assault:rule')oldKey='selectedSurpriseAssaultChoice';
 else if(key==='selectedUpgrade')oldKey='selectedUpgrade:'+args.selectionGroupId;
 else if(key==='sourceProfilePresent')oldKey='containsProfile:'+args.profileId;
 else if(key==='equipmentSelected')oldKey='selectedEquipment:'+args.equipmentId;
 else if(key==='selectedModelMark'||key==='selectedUnitMark')oldKey=(key==='selectedModelMark'?'sourceBackedModelMark':'sourceBackedUnitMark')+':'+args.keyword;
 else if(key==='needsInvulnerableSave')oldKey='needsInvulnerableSave:'+args.value;
 else{
  const family=Object.keys(families).find(name=>families[name]===key);
  if(family&&args.ruleId)oldKey=family+':'+args.ruleId+(args.clauseId||args.roleId||args.conditionId?':'+(args.clauseId||args.roleId||args.conditionId):'');
  else oldKey=Object.keys(rawAliases).find(name=>rawAliases[name]===key)||key;
 }
 requireValue(typeof oldKey==='string'&&oldKey,'ambiguous producer condition alias');
 args.key=oldKey;for(const field of Object.keys(parameterTypes))delete args[field];return args;
}
const identityPrefix='$condition$';
export function conditionIdentity(args){
 requireValue(conditionSpec(args),'unknown canonical condition identity');
 const parameters=Object.fromEntries(Object.entries(args).filter(([key])=>!['key','equals'].includes(key)));
 return Object.keys(parameters).length?identityPrefix+serialize([args.key,parameters]):args.key;
}
export function clearConditionValues(bag,key){
 for(const identity of Object.keys(bag)){
  if(identity===key){delete bag[identity];continue;}
  if(identity.startsWith(identityPrefix)){
   let value;try{value=JSON.parse(identity.slice(identityPrefix.length));}catch{continue;}
   if(value[0]===key)delete bag[identity];
  }
 }
}
export function setConditionValue(bag,args,value){
 const identity=conditionIdentity(args),spec=conditionSpec(args);
 if(value===undefined){delete bag[identity];return;}
 requireValue(typeof value===spec.valueType,'condition value has wrong type '+args.key);bag[identity]=value;
}
export function findConditionValue(bag,args){
 const identity=conditionIdentity(args);return {present:Boolean(bag&&own(bag,identity)),value:bag?.[identity]};
}

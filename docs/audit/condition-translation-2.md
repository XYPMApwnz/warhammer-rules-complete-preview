# Condition translation 2 audit

Base: `98342d0670117e15dd8fb7871b2132252a128a92`. Native books: nine. Orks and all Stratagem data are excluded.

This report inventories recorded conditions and proves the exact producer inverse. It does not infer a recipient, a battle fact or a missing roster computation.

## Inventory and byte growth

| Book | FIELD occurrences | Old keys | Canonical keys | Original schema declarations | Moved computations | ROSTER occurrences without computer | Data bytes before / after |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| adeptus-mechanicus | 236 | 68 | 68 | 116 | 0 | 12 | 4535636 / 4552846 |
| blood-angels | 30 | 4 | 4 | 7 | 0 | 0 | 5947727 / 5948853 |
| chaos-space-marines | 1166 | 431 | 121 | 457 | 83 | 175 | 8364482 / 8458678 |
| dark-angels | 44 | 7 | 6 | 12 | 0 | 0 | 6172801 / 6174362 |
| death-guard | 80 | 66 | 66 | 163 | 0 | 2 | 2244212 / 2244250 |
| emperors-children | 69 | 11 | 11 | 11 | 2 | 0 | 2993167 / 2998017 |
| space-marines | 30 | 4 | 4 | 7 | 0 | 0 | 6823965 / 6824936 |
| tau-empire | 146 | 3 | 3 | 7 | 0 | 0 | 3380808 / 3381794 |
| tyranids | 15 | 3 | 3 | 3 | 0 | 0 | 2105712 / 2106010 |

Runtime JSON byte growth: **121236 bytes**. All **526** excluded Stratagem entities retain exact serialized bytes. All nine card-presentation artifacts retain exact bytes.

All recipient declarations, effects, durations, source evidence and non-condition facts match the baseline after the explicit inverse. The only additional difference is removal of the two authorized Fabius Bodyguard aliases; their existing Bodyguard selectors remain unchanged.

Package measurements: `{"status":"NOT_MEASURED","reason":"Packaging measurements are supplied after the final package/determinism run."}`.

## Shared dictionary

| Key | Level | Equals type | Parameters | Computed by |
| --- | --- | --- | --- | --- |
| aboutToConsolidate | BATTLE | boolean | {} | — |
| additionalPlagueSelected | BATTLE | boolean | {} | — |
| advanceOrChargeRoll | BATTLE | boolean | {} | — |
| advancedOrFellBackThisTurn | BATTLE | boolean | {} | — |
| afflicted | BATTLE | boolean | {} | — |
| afterAttackingUnitFinishedAttacks | BATTLE | boolean | {} | — |
| allocatedAttackAndTurnAllowance | BATTLE | boolean | {} | — |
| allocatedToModelInPrimaryUnit | BATTLE | boolean | {} | — |
| analysed | BATTLE | boolean | {} | — |
| armyFaction | ROSTER | string | {} | — |
| arrivedFromReservesThisTurn | BATTLE | boolean | {} | — |
| arrivedUsingDeepStrikeThisTurn | BATTLE | boolean | {} | — |
| atEndOfPhase | BATTLE | boolean | {} | — |
| atStartOfBattle | BATTLE | boolean | {} | — |
| atStartOfBattleRound | BATTLE | boolean | {} | — |
| atStartOfFirstBattleRound | BATTLE | boolean | {} | — |
| atStartOfPhase | BATTLE | boolean | {} | — |
| attached | ROSTER | boolean | {} | predicateContext |
| attachedAtBattleStart | ROSTER | boolean | {} | computeRosterCondition |
| attachedToSelectedUnit | ROSTER | boolean | {"ruleId":"string"} | — |
| attachedUnitsShareSelectedMark | ROSTER | boolean | {"ruleId":"string"} | — |
| attackAllocated | BATTLE | boolean | {} | — |
| attackAllocatedToThisModel | BATTLE | boolean | {} | — |
| attackClosestEligibleEnemy | BATTLE | boolean | {} | — |
| attackFromTargetUnitAllocatedToModel | BATTLE | boolean | {} | — |
| attackStrengthExceedsUnitToughness | BATTLE | boolean | {} | — |
| attackTargetEnemyWithinEngagementRangeOfFriendlyPlagueLegionsUnit | BATTLE | boolean | {} | — |
| attackTargetsFlyingUnit | BATTLE | boolean | {} | — |
| attackTargetsUnitInFriendlyContagionRange | BATTLE | boolean | {} | — |
| attackType | BATTLE | string | {} | — |
| attackedPrimaryUnitThisPhase | BATTLE | boolean | {} | — |
| attackerWithinEighteen | BATTLE | boolean | {} | — |
| attacksFromSelectedAttackEvent | BATTLE | boolean | {} | — |
| battleConditionSatisfied | BATTLE | boolean | {} | — |
| battleEnemyRecipientEligible | BATTLE | boolean | {} | — |
| battleInProgress | BATTLE | boolean | {} | — |
| battleRoundInTwoToFive | BATTLE | boolean | {} | — |
| battleRoundStart | BATTLE | boolean | {} | — |
| battleSelectedRecipient | BATTLE | boolean | {"ruleId":"string"} | — |
| battleShockTest | BATTLE | boolean | {} | — |
| battleShockTestPassed | BATTLE | boolean | {} | — |
| battleShocked | BATTLE | boolean | {} | — |
| battleTargetPrerequisitesSatisfied | BATTLE | boolean | {} | — |
| bearerMadePlagueWindAttacks | BATTLE | boolean | {} | — |
| bearerMeleeAttack | BATTLE | boolean | {} | — |
| bearerUnitFinishedAttacks | BATTLE | boolean | {} | — |
| bearerUnitFinishedFighting | BATTLE | boolean | {} | — |
| bearerUnitModelAttacks | BATTLE | boolean | {} | — |
| bearerUnitNotEngaged | BATTLE | boolean | {} | — |
| bearerUnitWithinControlledObjective | BATTLE | boolean | {} | — |
| belowStartingStrength | BATTLE | boolean | {} | — |
| bombardmentChoice | BATTLE | string | {} | — |
| bothArmiesDeployed | BATTLE | boolean | {} | — |
| broadSpectrumDataTetherEquipped | ROSTER | boolean | {} | — |
| canAttachToReferencedUnit | ROSTER | boolean | {} | — |
| canBeLedByPrimary | ROSTER | boolean | {} | — |
| chapterContextStatus | ROSTER | string | {} | createVerifiedPhysicalConditionContext |
| characterDestroyedByThoseAttacks | BATTLE | boolean | {} | — |
| characterModelLeadingSource | ROSTER | boolean | {} | — |
| chargeDeclaredEnemyObjectiveWithin12 | BATTLE | boolean | {} | — |
| chargeMoveEndedAndEnemyEngaged | BATTLE | boolean | {} | — |
| chargeRollMoveAndEngagement | BATTLE | boolean | {} | — |
| chargedThisTurn | BATTLE | boolean | {} | — |
| citationInSavageryActive | BATTLE | boolean | {} | — |
| commandPhaseOncePerBattleChosen | BATTLE | boolean | {} | — |
| commandPhaseVehicleWithin3 | BATTLE | boolean | {} | — |
| commandUplinkEquipped | ROSTER | boolean | {} | — |
| compositionMemberId | ROSTER | string | {} | — |
| conquerorImperativeActive | BATTLE | boolean | {} | — |
| containsTechPriestModel | ROSTER | boolean | {} | — |
| controlsObjective | BATTLE | boolean | {} | — |
| darkPactAndAttackResolution | BATTLE | boolean | {} | — |
| darkPactLeadershipRoll7Plus | BATTLE | boolean | {} | — |
| darkPactOncePerBattle | BATTLE | boolean | {} | — |
| darkPactSelectedOnShootFight | BATTLE | boolean | {} | — |
| declaredChargeThisPhase | BATTLE | boolean | {} | — |
| deploymentCompleteSourceOnBattlefield | BATTLE | boolean | {} | — |
| destroyed | BATTLE | boolean | {} | — |
| destroyedModelReturnEligible | BATTLE | boolean | {"ruleId":"string"} | — |
| destroyedThisPhase | BATTLE | boolean | {} | — |
| diceForPrimaryModelsDestroyedByThoseAttacks | BATTLE | boolean | {} | — |
| dicePerPrimaryModelWithinEngagementRangeOfSelectedEnemy | BATTLE | boolean | {} | — |
| disembarkAfterNormalMove | BATTLE | boolean | {} | — |
| disembarkedFromTransportThisTurn | BATTLE | boolean | {} | — |
| disembarkedThisTurn | BATTLE | boolean | {} | — |
| disembarkingFromTargetModel | BATTLE | boolean | {} | — |
| distinctFromPrimaryTarget | BATTLE | boolean | {} | — |
| eligibleReplacementUnit | BATTLE | boolean | {"ruleId":"string"} | — |
| eligibleToFightThisPhase | BATTLE | boolean | {} | — |
| enemiesWithinEngagementRangeOfPrimary | BATTLE | boolean | {} | — |
| enemyAttackTargetBelowStartingStrength | BATTLE | boolean | {} | — |
| enemyAttackTargetWithinHalfRange | BATTLE | boolean | {} | — |
| enemyCharacterDestroyed | BATTLE | boolean | {} | — |
| enemyEngagedOnlyFortifications | BATTLE | boolean | {} | — |
| enemyEngagedWithPrimary | BATTLE | boolean | {} | — |
| enemyFallBackSelection | BATTLE | boolean | {} | — |
| enemyInBearerUnitEngagementRange | BATTLE | boolean | {} | — |
| enemyModelLosesWoundWhileItsUnitEngagedWithPrimary | BATTLE | boolean | {} | — |
| enemyModelsDestroyedByThisStratagem | BATTLE | boolean | {} | — |
| enemyMoveEndsWithin8AndNotEngaged | BATTLE | boolean | {} | — |
| enemyNonVehicleWithin3 | BATTLE | boolean | {} | — |
| enemyRangeStrengthAndCommandShockStep | BATTLE | boolean | {} | — |
| enemySelectedForMiasmicBombardment | BATTLE | boolean | {} | — |
| enemyShootingDestroyedSourceModel | BATTLE | boolean | {} | — |
| enemyShootingFriendlyWithin3 | BATTLE | boolean | {} | — |
| enemyStartingStrengthAttack | BATTLE | boolean | {} | — |
| enemyStratagemWithin12AndTurnAllowance | BATTLE | boolean | {} | — |
| enemyTargetInOpponentDeploymentZone | BATTLE | boolean | {} | — |
| enemyTargetSelectionJustFinished | BATTLE | boolean | {} | — |
| enemyWithin18TargetsSource | BATTLE | boolean | {} | — |
| enemyWithin6LeadershipOrShockTest | BATTLE | boolean | {} | — |
| enfeebledByBearerPestilentFallout | BATTLE | boolean | {} | — |
| engaged | BATTLE | boolean | {} | — |
| engagedWithPrimary | BATTLE | boolean | {} | — |
| enhancementAssigned | ROSTER | boolean | {"ruleId":"string"} | computeRosterCondition |
| equipmentBattleTrigger | BATTLE | boolean | {"ruleId":"string"} | — |
| equipmentBearerLabel | ROSTER | string | {} | — |
| equipmentBearerSatisfied | ROSTER | boolean | {"equipmentId":"string","quantityProof":"string"} | createPhysicalEquipmentConditionContext |
| equipmentRequirementSatisfied | ROSTER | boolean | {} | executeRosterEffects |
| equipmentSelected | ROSTER | boolean | {"equipmentId":"string"} | — |
| everyModelWithin3OfTargetTransport | BATTLE | boolean | {} | — |
| failedBattleShockTest | BATTLE | boolean | {} | — |
| failedLeadershipImpliesRemainStationary | BATTLE | boolean | {} | — |
| fightAfterAttackerFinishesThenRemove | BATTLE | boolean | {} | — |
| fightAttacksFinishedAndEnemyDestroyed | BATTLE | boolean | {} | — |
| fightEndDestroyedEnemyAndNotEngaged | BATTLE | boolean | {} | — |
| fightEndSourceAttackDestroyedEnemy | BATTLE | boolean | {} | — |
| fightPhaseChosenOncePerBattle | BATTLE | boolean | {} | — |
| fightPhaseSacrificeRoll | BATTLE | boolean | {} | — |
| fightPhaseStart | BATTLE | boolean | {} | — |
| fightStartEnemyEngaged | BATTLE | boolean | {} | — |
| fireOverwatchSelected | BATTLE | boolean | {} | — |
| firstEnemyDestroyedAndNotBattleShocked | BATTLE | boolean | {} | — |
| firstFabiusDestroyedAndPhaseEndRoll | BATTLE | boolean | {} | — |
| foughtThisPhase | BATTLE | boolean | {} | — |
| friendlyActionStarted | BATTLE | boolean | {} | — |
| friendlyAttackSelection | BATTLE | boolean | {} | — |
| friendlyChargeMoveJustEnded | BATTLE | boolean | {} | — |
| friendlyCommandEndObjectiveControl | BATTLE | boolean | {} | — |
| friendlyCommandStart | BATTLE | boolean | {} | — |
| friendlyDaemonVehicleWithin3 | BATTLE | boolean | {} | — |
| friendlyDaemonVehicleWithin6 | BATTLE | boolean | {} | — |
| friendlyInfantryRangeAndRangedAttackAllocated | BATTLE | boolean | {} | — |
| friendlyInfantryWithin3 | BATTLE | boolean | {} | — |
| friendlyInfantryWithin6NotBattleShocked | BATTLE | boolean | {} | — |
| friendlyModelWhollyWithin9 | BATTLE | boolean | {} | — |
| friendlyShootingSelection | BATTLE | boolean | {} | — |
| friendlyVehicleWithin3 | BATTLE | boolean | {} | — |
| friendlyWithin6DarkPact | BATTLE | boolean | {} | — |
| garreonOnBattlefieldCommandPhase | BATTLE | boolean | {} | — |
| hasAtLeastTwoLeaderUnits | ROSTER | boolean | {} | predicateContext |
| hasCanonicalDarkPacts | ROSTER | boolean | {"ruleId":"string"} | — |
| hasFought | BATTLE | boolean | {} | — |
| hasFriendlyCharacterLeader | ROSTER | boolean | {} | predicateContext |
| hasLostWounds | BATTLE | boolean | {} | — |
| hasNotFoughtThisPhase | BATTLE | boolean | {} | — |
| hasShot | BATTLE | boolean | {} | — |
| hasShotThisPhase | BATTLE | boolean | {} | — |
| hatedFoeBattleSelection | BATTLE | boolean | {} | — |
| heroicInterventionSelected | BATTLE | boolean | {} | — |
| hitByTriggerAttack | BATTLE | boolean | {} | — |
| identicalToDestroyedPrimaryUnit | ROSTER | boolean | {} | — |
| inBearerUnitEngagementRange | BATTLE | boolean | {} | — |
| inOpponentDeploymentZone | BATTLE | boolean | {} | — |
| inOptionalSupportUnit | ROSTER | boolean | {} | — |
| inReserves | BATTLE | boolean | {} | — |
| inStrategicReserves | BATTLE | boolean | {} | — |
| inTargetUnit | ROSTER | boolean | {} | — |
| inTriggerUnit | BATTLE | boolean | {} | — |
| initialAttachmentBattleline | ROSTER | boolean | {} | createInitialAttachmentConditionContext |
| invokedContractWithinRange | BATTLE | boolean | {"ruleId":"string","inches":"number","from":"string"} | — |
| isAfflicted | BATTLE | boolean | {} | — |
| isBodyguardComponentOfSource | ROSTER | boolean | {} | — |
| isBodyguardModel | ROSTER | boolean | {} | predicateContext |
| isTriggerUnit | BATTLE | boolean | {} | — |
| isWarlord | ROSTER | boolean | {} | predicateContext |
| justAllocatedMortalWound | BATTLE | boolean | {} | — |
| justDeclaredCharge | BATTLE | boolean | {} | — |
| justDestroyed | BATTLE | boolean | {} | — |
| justEndedNormalAdvanceOrFallBackMove | BATTLE | boolean | {} | — |
| justFellBack | BATTLE | boolean | {} | — |
| justSelectedAttackTargets | BATTLE | boolean | {} | — |
| justShot | BATTLE | boolean | {} | — |
| leadershipTest | BATTLE | boolean | {} | — |
| leadershipTestPassed | BATTLE | boolean | {} | — |
| ledBodyguardHasAbility | ROSTER | boolean | {"ruleId":"string","canonicalId":"string","parameters":"object"} | computeRosterCondition |
| ledModelMeleeAttack | BATTLE | boolean | {} | — |
| ledUnitAttackTargeted | BATTLE | boolean | {} | — |
| ledUnitChargeMoveEnded | BATTLE | boolean | {} | — |
| lostModelsToTriggerEnemyUnit | BATTLE | boolean | {} | — |
| lostWoundsFromTriggerAttack | BATTLE | boolean | {} | — |
| madeChargeMoveThisTurn | BATTLE | boolean | {} | — |
| makesAttack | BATTLE | boolean | {} | — |
| makingAttack | BATTLE | boolean | {} | — |
| meleeAttack | BATTLE | boolean | {} | — |
| meleeAttackAfterCharge | BATTLE | boolean | {} | — |
| meleeAttackEnemyObjectiveState | BATTLE | boolean | {} | — |
| meleeAttackTargetsCharacter | BATTLE | boolean | {} | — |
| meleeAttackTargetsUnit | BATTLE | boolean | {} | — |
| meleeEnemyStartingStrength | BATTLE | boolean | {} | — |
| meleeWeaponEquippedByPrimaryUnitModel | ROSTER | boolean | {} | — |
| memberOfBearerUnit | ROSTER | boolean | {} | — |
| memberOfEligibleUnit | ROSTER | boolean | {"ruleId":"string"} | — |
| memberOfOwnerUnit | ROSTER | boolean | {"ruleId":"string"} | — |
| memberOfPrimaryAttachedUnit | ROSTER | boolean | {} | — |
| memberOfPrimaryUnit | ROSTER | boolean | {} | — |
| memberOfSelectedUnit | ROSTER | boolean | {"ruleId":"string"} | — |
| memberOfUnitRole | ROSTER | boolean | {"ruleId":"string"} | — |
| modelFromYourArmy | ROSTER | boolean | {} | predicateContext |
| modelInUnitMakingAttack | BATTLE | boolean | {} | — |
| modelMemberOfPrimaryUnit | ROSTER | boolean | {} | — |
| moreThan3FromAllEnemyUnits | BATTLE | boolean | {} | — |
| moreThanTwelveFromEveryFriendlyModelOnBattlefield | BATTLE | boolean | {} | — |
| moveAdvanceChargeModifierChoice | BATTLE | boolean | {} | — |
| movementBeforeReinforcements | BATTLE | boolean | {} | — |
| movementEndEnemyVehicleWithin12 | BATTLE | boolean | {} | — |
| movementStep | BATTLE | string | {} | — |
| nearFriendlyDeathGuardVehicle | BATTLE | boolean | {} | — |
| needsInvulnerableSave | ROSTER | boolean | {"value":"number"} | computeRosterCondition |
| needsMarkSelection | ROSTER | boolean | {"ruleId":"string"} | computeRosterCondition |
| normalAdvanceFallBackMove | BATTLE | boolean | {} | — |
| normalAdvanceOrChargeMove | BATTLE | boolean | {} | — |
| normalMoveEndedOncePerBattle | BATTLE | boolean | {} | — |
| normalOrAdvanceMoveEndedAndEnemyMovedOver | BATTLE | boolean | {} | — |
| onBattlefield | BATTLE | boolean | {} | — |
| oncePerBattleAvailable | BATTLE | boolean | {} | — |
| oncePerBattlePerArmyAvailable | BATTLE | boolean | {} | — |
| oncePerBattleRoundAvailable | BATTLE | boolean | {} | — |
| oncePerBattleRoundUseAvailable | BATTLE | boolean | {} | — |
| oncePerBattleUseAvailable | BATTLE | boolean | {} | — |
| oncePerPhaseSelectedShootFight | BATTLE | boolean | {} | — |
| oncePerPhaseUseAvailable | BATTLE | boolean | {} | — |
| oncePerTurnUseAvailable | BATTLE | boolean | {} | — |
| opponentCommandBattleShockStep | BATTLE | boolean | {} | — |
| opponentCommandPhase | BATTLE | boolean | {} | — |
| opponentTurnEnd | BATTLE | boolean | {} | — |
| optionalAbilityActivated | BATTLE | boolean | {} | — |
| optionalPlagueSelected | BATTLE | boolean | {} | — |
| originalAttacker | BATTLE | boolean | {} | — |
| otherDataPsalmDetachmentSelected | ROSTER | boolean | {} | — |
| otherFriendlyUnit | ROSTER | boolean | {} | — |
| overwatchTurnAllowance | BATTLE | boolean | {} | — |
| ownCommandPhase | BATTLE | boolean | {} | — |
| ownCommandPhaseEnd | BATTLE | boolean | {} | — |
| ownShootingPhaseStarted | BATTLE | boolean | {} | — |
| panegyricProcessionActive | BATTLE | boolean | {} | — |
| permanentDoctrineSourcePresent | ROSTER | boolean | {} | createPhysicalEquipmentConditionContext |
| phase | BATTLE | string | {} | — |
| phaseBoundary | BATTLE | string | {} | — |
| phaseStartOncePerBattleAndRecipientRange | BATTLE | boolean | {} | — |
| phaseWindow | BATTLE | string | {} | — |
| physicalChapter | ROSTER | string | {} | createVerifiedPhysicalConditionContext |
| physicalModelScopeId | ROSTER | string | {} | createPhysicalEquipmentConditionContext |
| physicalProfilePresent | ROSTER | boolean | {"unitId":"string","profileId":"string"} | createVerifiedPhysicalConditionContext |
| physicalUnitInstanceId | ROSTER | string | {} | createPhysicalEquipmentConditionContext |
| pileInOrConsolidate | BATTLE | boolean | {} | — |
| plagueSelectedInBattleFormations | BATTLE | boolean | {} | — |
| possessedBladeFightUse | BATTLE | boolean | {} | — |
| primaryMakesNormalAdvanceOrChargeMove | BATTLE | boolean | {} | — |
| primaryNotDestroyedAfterAttackerFought | BATTLE | boolean | {} | — |
| protectorImperativeActive | BATTLE | boolean | {} | — |
| rangedAttackAllocatedMonsterOrVehicle | BATTLE | boolean | {} | — |
| rangedAttackEngagementContext | BATTLE | boolean | {} | — |
| rangedAttackHitModifiers | BATTLE | boolean | {} | — |
| rangedAttackOccludedByFortification | BATTLE | boolean | {} | — |
| rangedAttackTargetIsAfflictedEnemyUnit | BATTLE | boolean | {} | — |
| rangedAttackTargetsBearerVisibleEnemy | BATTLE | boolean | {} | — |
| rangedAttackTargetsInfantry | BATTLE | boolean | {} | — |
| rangedTargeting | BATTLE | boolean | {} | — |
| rangedWeaponEquippedByPrimaryUnitModels | ROSTER | boolean | {} | — |
| remainingWoundsBand | BATTLE | string | {} | — |
| remainingWoundsBandMatched | BATTLE | boolean | {"ruleId":"string"} | — |
| resolvingFallout | BATTLE | boolean | {} | — |
| reviewedArmyMembershipProven | ROSTER | boolean | {} | createVerifiedPhysicalConditionContext |
| rollResultSixOrLess | BATTLE | boolean | {} | — |
| ruleActive | BATTLE | boolean | {"ruleId":"string"} | — |
| sameActionStartedInTrigger | BATTLE | boolean | {} | — |
| sameUnitAsOwner | ROSTER | boolean | {"ruleId":"string"} | — |
| savingThrowFailed | BATTLE | boolean | {} | — |
| secondBattleRoundOrLater | BATTLE | boolean | {} | — |
| securedObjectiveStillControlled | BATTLE | boolean | {} | — |
| selectedAsAttackTarget | BATTLE | boolean | {} | — |
| selectedAsEnemyAttackTarget | BATTLE | boolean | {} | — |
| selectedAttackTargetsNow | BATTLE | boolean | {} | — |
| selectedEnemyDeclaresCharge | BATTLE | boolean | {} | — |
| selectedInDeclareBattleFormations | BATTLE | boolean | {} | — |
| selectedModelMark | ROSTER | boolean | {"keyword":"string"} | computeRosterCondition |
| selectedObjectiveIsAcquisitionObjective | BATTLE | boolean | {} | — |
| selectedObjectiveWithin24 | BATTLE | boolean | {} | — |
| selectedOtherDonor | BATTLE | boolean | {"ruleId":"string"} | — |
| selectedOverrideAbility | BATTLE | string | {} | — |
| selectedReplacementModel | BATTLE | boolean | {"ruleId":"string"} | — |
| selectedShootingEvent | BATTLE | boolean | {} | — |
| selectedSourceChoice | ROSTER | string | {"ruleId":"string"} | createSelectedSourceChoiceConditionContext |
| selectedSourceRecipient | ROSTER | boolean | {} | — |
| selectedToAdvanceNow | BATTLE | boolean | {} | — |
| selectedToAttackNow | BATTLE | boolean | {} | — |
| selectedToFallBack | BATTLE | boolean | {} | — |
| selectedToFallBackNow | BATTLE | boolean | {} | — |
| selectedToFight | BATTLE | boolean | {} | — |
| selectedToFightThisPhase | BATTLE | boolean | {} | — |
| selectedToMakeFallBackMove | BATTLE | boolean | {} | — |
| selectedToMoveOrChargeThisPhase | BATTLE | boolean | {} | — |
| selectedToMoveThisPhase | BATTLE | boolean | {} | — |
| selectedToShoot | BATTLE | boolean | {} | — |
| selectedToShootNow | BATTLE | boolean | {} | — |
| selectedToShootOrFightThisPhase | BATTLE | boolean | {} | — |
| selectedToShootThisPhase | BATTLE | boolean | {} | — |
| selectedUnitMark | ROSTER | boolean | {"keyword":"string"} | computeRosterCondition |
| selectedUpgrade | ROSTER | string | {"selectionGroupId":"string","selectionMode":"string"} | computeRosterCondition / createEquippedWeaponChoiceConditionContext |
| selectedWarmasterAbility | BATTLE | string | {} | — |
| selectsAnchoredEnemyAsRangedAttackTarget | BATTLE | boolean | {} | — |
| setUpFromReservesWithinBearerExclusion | BATTLE | boolean | {"ruleId":"string"} | — |
| settingUpAsReinforcements | BATTLE | boolean | {} | — |
| shieldEligibleTargetForThatAttack | BATTLE | boolean | {} | — |
| shieldVisibleToAttackingModel | BATTLE | boolean | {} | — |
| shootFightCompletedPsychicAttackHit | BATTLE | boolean | {} | — |
| shootOrFightResolution | BATTLE | boolean | {} | — |
| shootSelectedActivation | BATTLE | boolean | {} | — |
| shootingCompletedAndEnemyHit | BATTLE | boolean | {} | — |
| shootingSelectedOncePerBattle | BATTLE | boolean | {} | — |
| shootingStartEnemyVisibleWithin12 | BATTLE | boolean | {} | — |
| shootingStartPsychicSelectionAndRoll | BATTLE | boolean | {} | — |
| shootingStartVisibleEnemySelected | BATTLE | boolean | {} | — |
| snapShootingAttack | BATTLE | boolean | {} | — |
| sourceBattleApplicability | BATTLE | boolean | {"ruleId":"string"} | — |
| sourceEquipmentSelected | ROSTER | boolean | {"sourceEquipmentIdentity":"string"} | createSourceEquipmentConditionContext |
| sourceProfilePresent | ROSTER | boolean | {"profileId":"string"} | computeRosterCondition |
| sourceTableAllowsCurrentBattleRound | BATTLE | boolean | {} | — |
| sourceTableSelectionCapSatisfied | BATTLE | boolean | {} | — |
| sourceUnitChargeMoveEnded | BATTLE | boolean | {} | — |
| sourceWithinObjectiveRangeAndRangedAttack | BATTLE | boolean | {} | — |
| startingActionNow | BATTLE | boolean | {} | — |
| stratagemTimingSatisfied | BATTLE | boolean | {} | — |
| stratagemUseAndRoundAllowance | BATTLE | boolean | {} | — |
| strategicReservesBattleRoundAndReinforcements | BATTLE | boolean | {} | — |
| sufferedMortalWoundsFromThisDeadlyDemise | BATTLE | boolean | {} | — |
| sufficientCapacityForEntireTargetUnit | BATTLE | boolean | {} | — |
| targetTransportMadeNormalMove | BATTLE | boolean | {} | — |
| targetedByTriggerEnemyCharge | BATTLE | boolean | {} | — |
| targetedByTriggerEnemyUnit | BATTLE | boolean | {} | — |
| targetingAfflictedEnemy | BATTLE | boolean | {} | — |
| targetsSelectedJustNow | BATTLE | boolean | {} | — |
| turnOwner | BATTLE | string | {} | — |
| twoAdditionalMeleeWeaponsEquipped | ROSTER | boolean | {} | — |
| unitAdvanceRoll | BATTLE | boolean | {} | — |
| unitBattleShockOrLeadershipTest | BATTLE | boolean | {} | — |
| unitBeingSetUp | BATTLE | boolean | {} | — |
| unitFinishedFighting | BATTLE | boolean | {} | — |
| unitSelectedForVerminousHaze | BATTLE | boolean | {} | — |
| unmodifiedHitRollFiveOrMore | BATTLE | boolean | {} | — |
| usedPostShootingNormalMove | BATTLE | boolean | {} | — |
| usedThisStratagemThisBattle | BATTLE | boolean | {} | — |
| usingDeepStrikeSetup | BATTLE | boolean | {} | — |
| usingTaintedNarthecium | BATTLE | boolean | {} | — |
| visibleEnemyAttackTarget | BATTLE | boolean | {} | — |
| visibleEnemyTarget | BATTLE | boolean | {} | — |
| visibleEnemyUnit | BATTLE | boolean | {} | — |
| visibleToAttackingUnit | BATTLE | boolean | {} | — |
| visibleToBearer | BATTLE | boolean | {} | — |
| visibleToOneOrMorePrimaryModels | BATTLE | boolean | {} | — |
| visibleToPrimary | BATTLE | boolean | {} | — |
| visibleToPrimaryAndAttacker | BATTLE | boolean | {} | — |
| visibleToPrimaryModel | BATTLE | boolean | {} | — |
| visibleToPrimaryUnit | BATTLE | boolean | {} | — |
| visibleToReconUnit | BATTLE | boolean | {} | — |
| warmasterCommandSelection | BATTLE | boolean | {} | — |
| whollyWithinTwelveOfBearer | BATTLE | boolean | {} | — |
| within12OfBearer | BATTLE | boolean | {} | — |
| within12OfPrimary | BATTLE | boolean | {} | — |
| within12OfReconAnchor | BATTLE | boolean | {} | — |
| within12OfReconUnit | BATTLE | boolean | {} | — |
| within18OfTargetUnit | BATTLE | boolean | {} | — |
| within24OfPrimary | BATTLE | boolean | {} | — |
| within2HorizontalOfPrimary | BATTLE | boolean | {} | — |
| within30OfPrimaryModel | BATTLE | boolean | {} | — |
| within3OfEnemyUnit | BATTLE | boolean | {} | — |
| within3OfPrimary | BATTLE | boolean | {} | — |
| within3OfPrimaryModel | BATTLE | boolean | {} | — |
| within3OfSelectedTerrain | BATTLE | boolean | {} | — |
| within5VerticalOfPrimary | BATTLE | boolean | {} | — |
| within6OfCultMechanicusModelInTargetUnit | BATTLE | boolean | {} | — |
| within6OfOpponentDeploymentZone | BATTLE | boolean | {} | — |
| within6OfPrimary | BATTLE | boolean | {} | — |
| within6OfTargetUnit | BATTLE | boolean | {} | — |
| within8OfPrimary | BATTLE | boolean | {} | — |
| within8OfTriggerEnemyUnit | BATTLE | boolean | {} | — |
| withinAcquisitionObjectiveRange | BATTLE | boolean | {} | — |
| withinBearerContagionRange | BATTLE | boolean | {} | — |
| withinBearerUnitContagionRange | BATTLE | boolean | {} | — |
| withinContagionRangeOfPrimary | BATTLE | boolean | {} | — |
| withinEnemyEngagementRange | BATTLE | boolean | {} | — |
| withinEngagementRange | BATTLE | boolean | {} | — |
| withinEngagementRangeOfEnemy | BATTLE | boolean | {} | — |
| withinEngagementRangeOfEnemyAttackRecipient | BATTLE | boolean | {} | — |
| withinEngagementRangeOfPrimary | BATTLE | boolean | {} | — |
| withinEngagementRangeOfTargetUnit | BATTLE | boolean | {} | — |
| withinEngagementRangeOfTriggeringEnemy | BATTLE | boolean | {} | — |
| withinFocusOfHatredEngagementRange | BATTLE | boolean | {} | — |
| withinFriendlyMechanicusBattleline6 | BATTLE | boolean | {} | — |
| withinFriendlyMechanicusVehicle3 | BATTLE | boolean | {} | — |
| withinFriendlyObjectiveRange | BATTLE | boolean | {} | — |
| withinHalfWeaponRange | BATTLE | boolean | {} | — |
| withinOpponentDeploymentZone | BATTLE | boolean | {} | — |
| withinOtherFriendlyMechanicus3 | BATTLE | boolean | {} | — |
| withinPrimaryTargetRange | BATTLE | boolean | {} | — |
| withinRange | BATTLE | boolean | {"ruleId":"string","inches":"number","from":"string","rangeContext":"string"} | — |
| withinRangeOfAcquisitionObjective | BATTLE | boolean | {} | — |
| withinRangeOfFriendlyControlledObjectiveWhenDestroyed | BATTLE | boolean | {} | — |
| withinRangeOfObjective | BATTLE | boolean | {} | — |
| withinRangeOfSelectedObjective | BATTLE | boolean | {} | — |
| withinSecuredObjectiveRange | BATTLE | boolean | {} | — |
| withinSevenOfFriendlyDeathGuard | BATTLE | boolean | {} | — |
| withinSevenOfFriendlyPlagueLegions | BATTLE | boolean | {} | — |
| withinSixOfBearer | BATTLE | boolean | {} | — |
| withinSource12 | BATTLE | boolean | {} | — |
| withinSource3 | BATTLE | boolean | {} | — |
| withinSource6 | BATTLE | boolean | {} | — |
| withinSourceEngagementRange | BATTLE | boolean | {} | — |
| withinThreeOfBearer | BATTLE | boolean | {} | — |
| withinTwelveOfBearer | BATTLE | boolean | {} | — |

## Old key to canonical condition

Rows group identical recorded translations. Individual condition paths, evidence, expected values, subjects and levels remain in the JSON report.

### adeptus-mechanicus

| Old key | Canonical key | Parameters | Level / type | Occurrences |
| --- | --- | --- | --- | ---: |
| analysed | analysed | {} | BATTLE / boolean | 1 |
| atEndOfPhase | atEndOfPhase | {} | BATTLE / boolean | 1 |
| atStartOfBattle | atStartOfBattle | {} | BATTLE / boolean | 1 |
| atStartOfBattleRound | atStartOfBattleRound | {} | BATTLE / boolean | 1 |
| atStartOfFirstBattleRound | atStartOfFirstBattleRound | {} | BATTLE / boolean | 3 |
| atStartOfPhase | atStartOfPhase | {} | BATTLE / boolean | 7 |
| attached | attached | {} | ROSTER / boolean | 5 |
| attackAllocated | attackAllocated | {} | BATTLE / boolean | 1 |
| attackType | attackType | {} | BATTLE / string | 2 |
| battleRoundInTwoToFive | battleRoundInTwoToFive | {} | BATTLE / boolean | 1 |
| battleShocked | battleShocked | {} | BATTLE / boolean | 3 |
| bombardmentChoice | bombardmentChoice | {} | BATTLE / string | 2 |
| bothArmiesDeployed | bothArmiesDeployed | {} | BATTLE / boolean | 1 |
| broadSpectrumDataTetherEquipped | broadSpectrumDataTetherEquipped | {} | ROSTER / boolean | 1 |
| canAttachToReferencedUnit | canAttachToReferencedUnit | {} | ROSTER / boolean | 3 |
| characterModelLeadingSource | characterModelLeadingSource | {} | ROSTER / boolean | 1 |
| citationInSavageryActive | citationInSavageryActive | {} | BATTLE / boolean | 1 |
| commandUplinkEquipped | commandUplinkEquipped | {} | ROSTER / boolean | 3 |
| conquerorImperativeActive | conquerorImperativeActive | {} | BATTLE / boolean | 11 |
| containsTechPriestModel | containsTechPriestModel | {} | ROSTER / boolean | 1 |
| destroyed | destroyed | {} | BATTLE / boolean | 1 |
| equipmentBearerLabel | equipmentBearerLabel | {} | ROSTER / string | 2 |
| equipmentRequirementSatisfied | equipmentRequirementSatisfied | {} | ROSTER / boolean | 12 |
| hasFought | hasFought | {} | BATTLE / boolean | 1 |
| hasShot | hasShot | {} | BATTLE / boolean | 1 |
| hasShotThisPhase | hasShotThisPhase | {} | BATTLE / boolean | 4 |
| leadershipTestPassed | leadershipTestPassed | {} | BATTLE / boolean | 2 |
| madeChargeMoveThisTurn | madeChargeMoveThisTurn | {} | BATTLE / boolean | 1 |
| makingAttack | makingAttack | {} | BATTLE / boolean | 5 |
| meleeAttackTargetsUnit | meleeAttackTargetsUnit | {} | BATTLE / boolean | 3 |
| modelInUnitMakingAttack | modelInUnitMakingAttack | {} | BATTLE / boolean | 3 |
| onBattlefield | onBattlefield | {} | BATTLE / boolean | 1 |
| oncePerBattleRoundUseAvailable | oncePerBattleRoundUseAvailable | {} | BATTLE / boolean | 1 |
| oncePerBattleUseAvailable | oncePerBattleUseAvailable | {} | BATTLE / boolean | 4 |
| oncePerPhaseUseAvailable | oncePerPhaseUseAvailable | {} | BATTLE / boolean | 1 |
| oncePerTurnUseAvailable | oncePerTurnUseAvailable | {} | BATTLE / boolean | 2 |
| otherDataPsalmDetachmentSelected | otherDataPsalmDetachmentSelected | {} | ROSTER / boolean | 1 |
| panegyricProcessionActive | panegyricProcessionActive | {} | BATTLE / boolean | 1 |
| phase | phase | {} | BATTLE / string | 24 |
| phaseBoundary | phaseBoundary | {} | BATTLE / string | 3 |
| protectorImperativeActive | protectorImperativeActive | {} | BATTLE / boolean | 11 |
| remainingWoundsBand | remainingWoundsBand | {} | BATTLE / string | 2 |
| resolvingFallout | resolvingFallout | {} | BATTLE / boolean | 1 |
| savingThrowFailed | savingThrowFailed | {} | BATTLE / boolean | 1 |
| secondBattleRoundOrLater | secondBattleRoundOrLater | {} | BATTLE / boolean | 1 |
| selectedOverrideAbility | selectedOverrideAbility | {} | BATTLE / string | 4 |
| selectedToFight | selectedToFight | {} | BATTLE / boolean | 1 |
| selectedToShoot | selectedToShoot | {} | BATTLE / boolean | 1 |
| settingUpAsReinforcements | settingUpAsReinforcements | {} | BATTLE / boolean | 1 |
| turnOwner | turnOwner | {} | BATTLE / string | 35 |
| usedPostShootingNormalMove | usedPostShootingNormalMove | {} | BATTLE / boolean | 1 |
| visibleToBearer | visibleToBearer | {} | BATTLE / boolean | 1 |
| visibleToReconUnit | visibleToReconUnit | {} | BATTLE / boolean | 1 |
| within12OfBearer | within12OfBearer | {} | BATTLE / boolean | 5 |
| within12OfReconUnit | within12OfReconUnit | {} | BATTLE / boolean | 1 |
| within6OfOpponentDeploymentZone | within6OfOpponentDeploymentZone | {} | BATTLE / boolean | 1 |
| withinAcquisitionObjectiveRange | withinAcquisitionObjectiveRange | {} | BATTLE / boolean | 6 |
| withinEnemyEngagementRange | withinEnemyEngagementRange | {} | BATTLE / boolean | 2 |
| withinEngagementRange | withinEngagementRange | {} | BATTLE / boolean | 1 |
| withinFriendlyMechanicusBattleline6 | withinFriendlyMechanicusBattleline6 | {} | BATTLE / boolean | 6 |
| withinFriendlyMechanicusVehicle3 | withinFriendlyMechanicusVehicle3 | {} | BATTLE / boolean | 1 |
| withinHalfWeaponRange | withinHalfWeaponRange | {} | BATTLE / boolean | 1 |
| withinOpponentDeploymentZone | withinOpponentDeploymentZone | {} | BATTLE / boolean | 2 |
| withinOtherFriendlyMechanicus3 | withinOtherFriendlyMechanicus3 | {} | BATTLE / boolean | 2 |
| withinSource12 | withinSource12 | {} | BATTLE / boolean | 1 |
| withinSource3 | withinSource3 | {} | BATTLE / boolean | 3 |
| withinSource6 | withinSource6 | {} | BATTLE / boolean | 18 |
| withinSourceEngagementRange | withinSourceEngagementRange | {} | BATTLE / boolean | 2 |

### blood-angels

| Old key | Canonical key | Parameters | Level / type | Occurrences |
| --- | --- | --- | --- | ---: |
| attached | attached | {} | ROSTER / boolean | 10 |
| equipmentRequirementSatisfied | equipmentRequirementSatisfied | {} | ROSTER / boolean | 11 |
| smEquipmentBearerSatisfied | equipmentBearerSatisfied | {"quantityProof":"UNIFORM_PHYSICAL_GROUP","equipmentId":"ability-ba-da87d6022de8416d9040"} | ROSTER / boolean | 1 |
| smEquipmentBearerSatisfied | equipmentBearerSatisfied | {"quantityProof":"UNIFORM_PHYSICAL_GROUP","equipmentId":"ability-sm-097567b13c02404d"} | ROSTER / boolean | 1 |
| smEquipmentBearerSatisfied | equipmentBearerSatisfied | {"quantityProof":"UNIFORM_PHYSICAL_GROUP","equipmentId":"ability-sm-431f22d15f7545b4"} | ROSTER / boolean | 1 |
| smEquipmentBearerSatisfied | equipmentBearerSatisfied | {"quantityProof":"UNIFORM_PHYSICAL_GROUP","equipmentId":"ability-sm-63d4ca967fa64b79"} | ROSTER / boolean | 1 |
| smEquipmentBearerSatisfied | equipmentBearerSatisfied | {"quantityProof":"UNIFORM_PHYSICAL_GROUP","equipmentId":"ability-sm-8c9e7e37a8494c1d"} | ROSTER / boolean | 1 |
| smEquipmentBearerSatisfied | equipmentBearerSatisfied | {"quantityProof":"UNIFORM_PHYSICAL_GROUP","equipmentId":"ability-sm-aa81f0067a3140de"} | ROSTER / boolean | 1 |
| smEquipmentBearerSatisfied | equipmentBearerSatisfied | {"quantityProof":"UNIFORM_PHYSICAL_GROUP","equipmentId":"ability-sm-daf87042d20348dd"} | ROSTER / boolean | 1 |
| smPermanentAssaultSource | permanentDoctrineSourcePresent | {} | ROSTER / boolean | 2 |

### chaos-space-marines

| Old key | Canonical key | Parameters | Level / type | Occurrences |
| --- | --- | --- | --- | ---: |
| advanceOrChargeRoll | advanceOrChargeRoll | {} | BATTLE / boolean | 3 |
| advancedOrFellBackThisTurn | advancedOrFellBackThisTurn | {} | BATTLE / boolean | 3 |
| allocatedAttackAndTurnAllowance | allocatedAttackAndTurnAllowance | {} | BATTLE / boolean | 3 |
| armyFaction | armyFaction | {} | ROSTER / string | 9 |
| attached | attached | {} | ROSTER / boolean | 16 |
| attachedAtBattleStart | attachedAtBattleStart | {} | ROSTER / boolean | 7 |
| attachedToSelectedUnit:detachment-deceptors:rule | attachedToSelectedUnit | {"ruleId":"detachment-deceptors:rule"} | ROSTER / boolean | 2 |
| attachedUnitsShareSelectedMark:detachment-pactbound-zealots:rule | attachedUnitsShareSelectedMark | {"ruleId":"detachment-pactbound-zealots:rule"} | ROSTER / boolean | 1 |
| attackAllocated | attackAllocated | {} | BATTLE / boolean | 3 |
| attackClosestEligibleEnemy | attackClosestEligibleEnemy | {} | BATTLE / boolean | 3 |
| attackTargetsFlyingUnit | attackTargetsFlyingUnit | {} | BATTLE / boolean | 3 |
| battleSelectedRecipient:detachment-soulforged-warpack:enhancement:1 | battleSelectedRecipient | {"ruleId":"detachment-soulforged-warpack:enhancement:1"} | BATTLE / boolean | 4 |
| chargeDeclaredEnemyObjectiveWithin12 | chargeDeclaredEnemyObjectiveWithin12 | {} | BATTLE / boolean | 3 |
| chargeMoveEndedAndEnemyEngaged | chargeMoveEndedAndEnemyEngaged | {} | BATTLE / boolean | 3 |
| chargeRollMoveAndEngagement | chargeRollMoveAndEngagement | {} | BATTLE / boolean | 3 |
| commandPhaseOncePerBattleChosen | commandPhaseOncePerBattleChosen | {} | BATTLE / boolean | 4 |
| commandPhaseVehicleWithin3 | commandPhaseVehicleWithin3 | {} | BATTLE / boolean | 5 |
| compositionMemberId | compositionMemberId | {} | ROSTER / string | 4 |
| containsProfile:datasheet-dark-apostle:profile:1 | sourceProfilePresent | {"profileId":"datasheet-dark-apostle:profile:1"} | ROSTER / boolean | 3 |
| containsProfile:datasheet-dark-apostle:profile:2 | sourceProfilePresent | {"profileId":"datasheet-dark-apostle:profile:2"} | ROSTER / boolean | 3 |
| containsProfile:datasheet-dark-commune:profile:1 | sourceProfilePresent | {"profileId":"datasheet-dark-commune:profile:1"} | ROSTER / boolean | 8 |
| containsProfile:datasheet-traitor-enforcer:profile:1 | sourceProfilePresent | {"profileId":"datasheet-traitor-enforcer:profile:1"} | ROSTER / boolean | 3 |
| containsProfile:datasheet-traitor-enforcer:profile:2 | sourceProfilePresent | {"profileId":"datasheet-traitor-enforcer:profile:2"} | ROSTER / boolean | 4 |
| darkPactAndAttackResolution | darkPactAndAttackResolution | {} | BATTLE / boolean | 8 |
| darkPactLeadershipRoll7Plus | darkPactLeadershipRoll7Plus | {} | BATTLE / boolean | 3 |
| darkPactOncePerBattle | darkPactOncePerBattle | {} | BATTLE / boolean | 4 |
| darkPactSelectedOnShootFight | darkPactSelectedOnShootFight | {} | BATTLE / boolean | 6 |
| deploymentCompleteSourceOnBattlefield | deploymentCompleteSourceOnBattlefield | {} | BATTLE / boolean | 3 |
| destroyedModelReturnEligible:detachment-chaos-cult:enhancement:1 | destroyedModelReturnEligible | {"ruleId":"detachment-chaos-cult:enhancement:1"} | BATTLE / boolean | 2 |
| disembarkAfterNormalMove | disembarkAfterNormalMove | {} | BATTLE / boolean | 3 |
| eligibleReplacementUnit:detachment-deceptors:enhancement:2 | eligibleReplacementUnit | {"ruleId":"detachment-deceptors:enhancement:2"} | BATTLE / boolean | 4 |
| enemyCharacterDestroyed | enemyCharacterDestroyed | {} | BATTLE / boolean | 3 |
| enemyEngagedOnlyFortifications | enemyEngagedOnlyFortifications | {} | BATTLE / boolean | 3 |
| enemyInBearerUnitEngagementRange | enemyInBearerUnitEngagementRange | {} | BATTLE / boolean | 2 |
| enemyMoveEndsWithin8AndNotEngaged | enemyMoveEndsWithin8AndNotEngaged | {} | BATTLE / boolean | 3 |
| enemyNonVehicleWithin3 | enemyNonVehicleWithin3 | {} | BATTLE / boolean | 3 |
| enemyRangeStrengthAndCommandShockStep | enemyRangeStrengthAndCommandShockStep | {} | BATTLE / boolean | 3 |
| enemyShootingDestroyedSourceModel | enemyShootingDestroyedSourceModel | {} | BATTLE / boolean | 3 |
| enemyShootingFriendlyWithin3 | enemyShootingFriendlyWithin3 | {} | BATTLE / boolean | 3 |
| enemyStartingStrengthAttack | enemyStartingStrengthAttack | {} | BATTLE / boolean | 3 |
| enemyStratagemWithin12AndTurnAllowance | enemyStratagemWithin12AndTurnAllowance | {} | BATTLE / boolean | 3 |
| enemyWithin18TargetsSource | enemyWithin18TargetsSource | {} | BATTLE / boolean | 5 |
| enemyWithin6LeadershipOrShockTest | enemyWithin6LeadershipOrShockTest | {} | BATTLE / boolean | 3 |
| enhancementAssigned:detachment-cabal-of-chaos:enhancement:1 | enhancementAssigned | {"ruleId":"detachment-cabal-of-chaos:enhancement:1"} | ROSTER / boolean | 8 |
| enhancementAssigned:detachment-cabal-of-chaos:enhancement:2 | enhancementAssigned | {"ruleId":"detachment-cabal-of-chaos:enhancement:2"} | ROSTER / boolean | 5 |
| enhancementAssigned:detachment-chaos-cult:enhancement:1 | enhancementAssigned | {"ruleId":"detachment-chaos-cult:enhancement:1"} | ROSTER / boolean | 3 |
| enhancementAssigned:detachment-chaos-cult:enhancement:2 | enhancementAssigned | {"ruleId":"detachment-chaos-cult:enhancement:2"} | ROSTER / boolean | 3 |
| enhancementAssigned:detachment-chaos-cult:enhancement:3 | enhancementAssigned | {"ruleId":"detachment-chaos-cult:enhancement:3"} | ROSTER / boolean | 3 |
| enhancementAssigned:detachment-chaos-cult:enhancement:4 | enhancementAssigned | {"ruleId":"detachment-chaos-cult:enhancement:4"} | ROSTER / boolean | 3 |
| enhancementAssigned:detachment-creations-of-bile:enhancement:1 | enhancementAssigned | {"ruleId":"detachment-creations-of-bile:enhancement:1"} | ROSTER / boolean | 5 |
| enhancementAssigned:detachment-creations-of-bile:enhancement:2 | enhancementAssigned | {"ruleId":"detachment-creations-of-bile:enhancement:2"} | ROSTER / boolean | 8 |
| enhancementAssigned:detachment-creations-of-bile:enhancement:3 | enhancementAssigned | {"ruleId":"detachment-creations-of-bile:enhancement:3"} | ROSTER / boolean | 3 |
| enhancementAssigned:detachment-creations-of-bile:enhancement:4 | enhancementAssigned | {"ruleId":"detachment-creations-of-bile:enhancement:4"} | ROSTER / boolean | 7 |
| enhancementAssigned:detachment-cult-of-the-arkifane:enhancement:1 | enhancementAssigned | {"ruleId":"detachment-cult-of-the-arkifane:enhancement:1"} | ROSTER / boolean | 3 |
| enhancementAssigned:detachment-cult-of-the-arkifane:enhancement:2 | enhancementAssigned | {"ruleId":"detachment-cult-of-the-arkifane:enhancement:2"} | ROSTER / boolean | 3 |
| enhancementAssigned:detachment-cult-of-the-arkifane:enhancement:3 | enhancementAssigned | {"ruleId":"detachment-cult-of-the-arkifane:enhancement:3"} | ROSTER / boolean | 5 |
| enhancementAssigned:detachment-cult-of-the-arkifane:enhancement:4 | enhancementAssigned | {"ruleId":"detachment-cult-of-the-arkifane:enhancement:4"} | ROSTER / boolean | 11 |
| enhancementAssigned:detachment-deceptors:enhancement:1 | enhancementAssigned | {"ruleId":"detachment-deceptors:enhancement:1"} | ROSTER / boolean | 6 |
| enhancementAssigned:detachment-deceptors:enhancement:2 | enhancementAssigned | {"ruleId":"detachment-deceptors:enhancement:2"} | ROSTER / boolean | 10 |
| enhancementAssigned:detachment-deceptors:enhancement:3 | enhancementAssigned | {"ruleId":"detachment-deceptors:enhancement:3"} | ROSTER / boolean | 6 |
| enhancementAssigned:detachment-deceptors:enhancement:4 | enhancementAssigned | {"ruleId":"detachment-deceptors:enhancement:4"} | ROSTER / boolean | 5 |
| enhancementAssigned:detachment-devotees-of-destruction:enhancement:1 | enhancementAssigned | {"ruleId":"detachment-devotees-of-destruction:enhancement:1"} | ROSTER / boolean | 4 |
| enhancementAssigned:detachment-devotees-of-destruction:enhancement:2 | enhancementAssigned | {"ruleId":"detachment-devotees-of-destruction:enhancement:2"} | ROSTER / boolean | 4 |
| enhancementAssigned:detachment-dread-talons:enhancement:1 | enhancementAssigned | {"ruleId":"detachment-dread-talons:enhancement:1"} | ROSTER / boolean | 3 |
| enhancementAssigned:detachment-dread-talons:enhancement:2 | enhancementAssigned | {"ruleId":"detachment-dread-talons:enhancement:2"} | ROSTER / boolean | 3 |
| enhancementAssigned:detachment-dread-talons:enhancement:3 | enhancementAssigned | {"ruleId":"detachment-dread-talons:enhancement:3"} | ROSTER / boolean | 3 |
| enhancementAssigned:detachment-dread-talons:enhancement:4 | enhancementAssigned | {"ruleId":"detachment-dread-talons:enhancement:4"} | ROSTER / boolean | 4 |
| enhancementAssigned:detachment-fellhammer-siege-host:enhancement:1 | enhancementAssigned | {"ruleId":"detachment-fellhammer-siege-host:enhancement:1"} | ROSTER / boolean | 3 |
| enhancementAssigned:detachment-fellhammer-siege-host:enhancement:2 | enhancementAssigned | {"ruleId":"detachment-fellhammer-siege-host:enhancement:2"} | ROSTER / boolean | 6 |
| enhancementAssigned:detachment-fellhammer-siege-host:enhancement:3 | enhancementAssigned | {"ruleId":"detachment-fellhammer-siege-host:enhancement:3"} | ROSTER / boolean | 4 |
| enhancementAssigned:detachment-fellhammer-siege-host:enhancement:4 | enhancementAssigned | {"ruleId":"detachment-fellhammer-siege-host:enhancement:4"} | ROSTER / boolean | 4 |
| enhancementAssigned:detachment-huron-s-marauders:enhancement:1 | enhancementAssigned | {"ruleId":"detachment-huron-s-marauders:enhancement:1"} | ROSTER / boolean | 3 |
| enhancementAssigned:detachment-huron-s-marauders:enhancement:2 | enhancementAssigned | {"ruleId":"detachment-huron-s-marauders:enhancement:2"} | ROSTER / boolean | 3 |
| enhancementAssigned:detachment-huron-s-marauders:enhancement:3 | enhancementAssigned | {"ruleId":"detachment-huron-s-marauders:enhancement:3"} | ROSTER / boolean | 3 |
| enhancementAssigned:detachment-huron-s-marauders:enhancement:4 | enhancementAssigned | {"ruleId":"detachment-huron-s-marauders:enhancement:4"} | ROSTER / boolean | 5 |
| enhancementAssigned:detachment-murdertalon-raiders:enhancement:1 | enhancementAssigned | {"ruleId":"detachment-murdertalon-raiders:enhancement:1"} | ROSTER / boolean | 3 |
| enhancementAssigned:detachment-murdertalon-raiders:enhancement:2 | enhancementAssigned | {"ruleId":"detachment-murdertalon-raiders:enhancement:2"} | ROSTER / boolean | 10 |
| enhancementAssigned:detachment-nightmare-hunt:enhancement:1 | enhancementAssigned | {"ruleId":"detachment-nightmare-hunt:enhancement:1"} | ROSTER / boolean | 4 |
| enhancementAssigned:detachment-nightmare-hunt:enhancement:2 | enhancementAssigned | {"ruleId":"detachment-nightmare-hunt:enhancement:2"} | ROSTER / boolean | 3 |
| enhancementAssigned:detachment-nightmare-hunt:enhancement:3 | enhancementAssigned | {"ruleId":"detachment-nightmare-hunt:enhancement:3"} | ROSTER / boolean | 3 |
| enhancementAssigned:detachment-nightmare-hunt:enhancement:4 | enhancementAssigned | {"ruleId":"detachment-nightmare-hunt:enhancement:4"} | ROSTER / boolean | 5 |
| enhancementAssigned:detachment-pactbound-zealots:enhancement:1 | enhancementAssigned | {"ruleId":"detachment-pactbound-zealots:enhancement:1"} | ROSTER / boolean | 3 |
| enhancementAssigned:detachment-pactbound-zealots:enhancement:2 | enhancementAssigned | {"ruleId":"detachment-pactbound-zealots:enhancement:2"} | ROSTER / boolean | 6 |
| enhancementAssigned:detachment-pactbound-zealots:enhancement:3 | enhancementAssigned | {"ruleId":"detachment-pactbound-zealots:enhancement:3"} | ROSTER / boolean | 3 |
| enhancementAssigned:detachment-pactbound-zealots:enhancement:4 | enhancementAssigned | {"ruleId":"detachment-pactbound-zealots:enhancement:4"} | ROSTER / boolean | 8 |
| enhancementAssigned:detachment-renegade-raiders:enhancement:1 | enhancementAssigned | {"ruleId":"detachment-renegade-raiders:enhancement:1"} | ROSTER / boolean | 3 |
| enhancementAssigned:detachment-renegade-raiders:enhancement:2 | enhancementAssigned | {"ruleId":"detachment-renegade-raiders:enhancement:2"} | ROSTER / boolean | 4 |
| enhancementAssigned:detachment-renegade-raiders:enhancement:3 | enhancementAssigned | {"ruleId":"detachment-renegade-raiders:enhancement:3"} | ROSTER / boolean | 3 |
| enhancementAssigned:detachment-renegade-raiders:enhancement:4 | enhancementAssigned | {"ruleId":"detachment-renegade-raiders:enhancement:4"} | ROSTER / boolean | 3 |
| enhancementAssigned:detachment-renegade-warband:enhancement:1 | enhancementAssigned | {"ruleId":"detachment-renegade-warband:enhancement:1"} | ROSTER / boolean | 4 |
| enhancementAssigned:detachment-renegade-warband:enhancement:2 | enhancementAssigned | {"ruleId":"detachment-renegade-warband:enhancement:2"} | ROSTER / boolean | 3 |
| enhancementAssigned:detachment-renegade-warband:enhancement:3 | enhancementAssigned | {"ruleId":"detachment-renegade-warband:enhancement:3"} | ROSTER / boolean | 3 |
| enhancementAssigned:detachment-renegade-warband:enhancement:4 | enhancementAssigned | {"ruleId":"detachment-renegade-warband:enhancement:4"} | ROSTER / boolean | 4 |
| enhancementAssigned:detachment-soulforged-warpack:enhancement:1 | enhancementAssigned | {"ruleId":"detachment-soulforged-warpack:enhancement:1"} | ROSTER / boolean | 4 |
| enhancementAssigned:detachment-soulforged-warpack:enhancement:2 | enhancementAssigned | {"ruleId":"detachment-soulforged-warpack:enhancement:2"} | ROSTER / boolean | 5 |
| enhancementAssigned:detachment-soulforged-warpack:enhancement:3 | enhancementAssigned | {"ruleId":"detachment-soulforged-warpack:enhancement:3"} | ROSTER / boolean | 5 |
| enhancementAssigned:detachment-soulforged-warpack:enhancement:4 | enhancementAssigned | {"ruleId":"detachment-soulforged-warpack:enhancement:4"} | ROSTER / boolean | 3 |
| enhancementAssigned:detachment-veterans-of-the-long-war:enhancement:1 | enhancementAssigned | {"ruleId":"detachment-veterans-of-the-long-war:enhancement:1"} | ROSTER / boolean | 4 |
| enhancementAssigned:detachment-veterans-of-the-long-war:enhancement:2 | enhancementAssigned | {"ruleId":"detachment-veterans-of-the-long-war:enhancement:2"} | ROSTER / boolean | 3 |
| enhancementAssigned:detachment-veterans-of-the-long-war:enhancement:3 | enhancementAssigned | {"ruleId":"detachment-veterans-of-the-long-war:enhancement:3"} | ROSTER / boolean | 4 |
| enhancementAssigned:detachment-veterans-of-the-long-war:enhancement:4 | enhancementAssigned | {"ruleId":"detachment-veterans-of-the-long-war:enhancement:4"} | ROSTER / boolean | 4 |
| enhancementAssigned:detachment-warpstrike-champions:enhancement:1 | enhancementAssigned | {"ruleId":"detachment-warpstrike-champions:enhancement:1"} | ROSTER / boolean | 3 |
| enhancementAssigned:detachment-warpstrike-champions:enhancement:2 | enhancementAssigned | {"ruleId":"detachment-warpstrike-champions:enhancement:2"} | ROSTER / boolean | 3 |
| enhancementAssigned:detachment-warpstrike-champions:enhancement:3 | enhancementAssigned | {"ruleId":"detachment-warpstrike-champions:enhancement:3"} | ROSTER / boolean | 3 |
| enhancementAssigned:detachment-warpstrike-champions:enhancement:4 | enhancementAssigned | {"ruleId":"detachment-warpstrike-champions:enhancement:4"} | ROSTER / boolean | 9 |
| equipmentBattleTrigger:datasheet-chaos-bikers:section:1:block:1:text | equipmentBattleTrigger | {"ruleId":"datasheet-chaos-bikers:section:1:block:1:text"} | BATTLE / boolean | 3 |
| equipmentBattleTrigger:datasheet-chosen:section:1:block:1:text | equipmentBattleTrigger | {"ruleId":"datasheet-chosen:section:1:block:1:text"} | BATTLE / boolean | 3 |
| equipmentBattleTrigger:datasheet-dark-commune:section:1:block:2:text | equipmentBattleTrigger | {"ruleId":"datasheet-dark-commune:section:1:block:2:text"} | BATTLE / boolean | 3 |
| equipmentBattleTrigger:datasheet-legionaries:section:1:block:1:text | equipmentBattleTrigger | {"ruleId":"datasheet-legionaries:section:1:block:1:text"} | BATTLE / boolean | 3 |
| equipmentBattleTrigger:datasheet-nemesis-claw:section:1:block:1:text | equipmentBattleTrigger | {"ruleId":"datasheet-nemesis-claw:section:1:block:1:text"} | BATTLE / boolean | 3 |
| equipmentBattleTrigger:datasheet-possessed:section:1:block:1:text | equipmentBattleTrigger | {"ruleId":"datasheet-possessed:section:1:block:1:text"} | BATTLE / boolean | 3 |
| equipmentBattleTrigger:datasheet-sorcerer-in-terminator-armour:section:1:block:2:text | equipmentBattleTrigger | {"ruleId":"datasheet-sorcerer-in-terminator-armour:section:1:block:2:text"} | BATTLE / boolean | 3 |
| equipmentRequirementSatisfied | equipmentRequirementSatisfied | {} | ROSTER / boolean | 1 |
| fightAttacksFinishedAndEnemyDestroyed | fightAttacksFinishedAndEnemyDestroyed | {} | BATTLE / boolean | 3 |
| fightEndDestroyedEnemyAndNotEngaged | fightEndDestroyedEnemyAndNotEngaged | {} | BATTLE / boolean | 3 |
| fightEndSourceAttackDestroyedEnemy | fightEndSourceAttackDestroyedEnemy | {} | BATTLE / boolean | 4 |
| fightPhaseChosenOncePerBattle | fightPhaseChosenOncePerBattle | {} | BATTLE / boolean | 4 |
| fightPhaseSacrificeRoll | fightPhaseSacrificeRoll | {} | BATTLE / boolean | 3 |
| fightStartEnemyEngaged | fightStartEnemyEngaged | {} | BATTLE / boolean | 3 |
| firstEnemyDestroyedAndNotBattleShocked | firstEnemyDestroyedAndNotBattleShocked | {} | BATTLE / boolean | 4 |
| firstFabiusDestroyedAndPhaseEndRoll | firstFabiusDestroyedAndPhaseEndRoll | {} | BATTLE / boolean | 3 |
| friendlyCommandEndObjectiveControl | friendlyCommandEndObjectiveControl | {} | BATTLE / boolean | 3 |
| friendlyCommandStart | friendlyCommandStart | {} | BATTLE / boolean | 3 |
| friendlyDaemonVehicleWithin3 | friendlyDaemonVehicleWithin3 | {} | BATTLE / boolean | 3 |
| friendlyDaemonVehicleWithin6 | friendlyDaemonVehicleWithin6 | {} | BATTLE / boolean | 3 |
| friendlyInfantryRangeAndRangedAttackAllocated | friendlyInfantryRangeAndRangedAttackAllocated | {} | BATTLE / boolean | 3 |
| friendlyInfantryWithin3 | friendlyInfantryWithin3 | {} | BATTLE / boolean | 3 |
| friendlyInfantryWithin6NotBattleShocked | friendlyInfantryWithin6NotBattleShocked | {} | BATTLE / boolean | 3 |
| friendlyModelWhollyWithin9 | friendlyModelWhollyWithin9 | {} | BATTLE / boolean | 3 |
| friendlyVehicleWithin3 | friendlyVehicleWithin3 | {} | BATTLE / boolean | 3 |
| friendlyWithin6DarkPact | friendlyWithin6DarkPact | {} | BATTLE / boolean | 3 |
| garreonOnBattlefieldCommandPhase | garreonOnBattlefieldCommandPhase | {} | BATTLE / boolean | 3 |
| hasCanonicalDarkPacts:detachment-chaos-cult:rule | hasCanonicalDarkPacts | {"ruleId":"detachment-chaos-cult:rule"} | ROSTER / boolean | 1 |
| hatedFoeBattleSelection | hatedFoeBattleSelection | {} | BATTLE / boolean | 3 |
| invokedContractWithinBearer3:detachment-soulforged-warpack:enhancement:3 | invokedContractWithinRange | {"ruleId":"detachment-soulforged-warpack:enhancement:3","inches":3,"from":"SOURCE_MODEL"} | BATTLE / boolean | 5 |
| isBodyguardComponentOfSource | isBodyguardComponentOfSource | {} | ROSTER / boolean | 5 |
| isBodyguardModel | isBodyguardModel | {} | ROSTER / boolean | 2 |
| leadershipTest | leadershipTest | {} | BATTLE / boolean | 3 |
| ledBodyguardHasScouts6:detachment-chaos-cult:enhancement:4 | ledBodyguardHasAbility | {"ruleId":"detachment-chaos-cult:enhancement:4","canonicalId":"core-scouts","parameters":{"distance":6}} | ROSTER / boolean | 3 |
| ledModelMeleeAttack | ledModelMeleeAttack | {} | BATTLE / boolean | 3 |
| ledUnitAttackTargeted | ledUnitAttackTargeted | {} | BATTLE / boolean | 3 |
| ledUnitChargeMoveEnded | ledUnitChargeMoveEnded | {} | BATTLE / boolean | 3 |
| meleeAttackAfterCharge | meleeAttackAfterCharge | {} | BATTLE / boolean | 3 |
| meleeAttackEnemyObjectiveState | meleeAttackEnemyObjectiveState | {} | BATTLE / boolean | 3 |
| meleeEnemyStartingStrength | meleeEnemyStartingStrength | {} | BATTLE / boolean | 3 |
| memberOfEligibleUnit:detachment-cabal-of-chaos:rule:battle-branch-1 | memberOfEligibleUnit | {"ruleId":"detachment-cabal-of-chaos:rule","clauseId":"battle-branch-1"} | ROSTER / boolean | 2 |
| memberOfEligibleUnit:detachment-cabal-of-chaos:rule:battle-branch-2 | memberOfEligibleUnit | {"ruleId":"detachment-cabal-of-chaos:rule","clauseId":"battle-branch-2"} | ROSTER / boolean | 2 |
| memberOfEligibleUnit:detachment-chaos-cult:rule | memberOfEligibleUnit | {"ruleId":"detachment-chaos-cult:rule"} | ROSTER / boolean | 2 |
| memberOfEligibleUnit:detachment-huron-s-marauders:rule:table-2-row-1 | memberOfEligibleUnit | {"ruleId":"detachment-huron-s-marauders:rule","clauseId":"table-2-row-1"} | ROSTER / boolean | 2 |
| memberOfEligibleUnit:detachment-murdertalon-raiders:rule:source-clause-1-1 | memberOfEligibleUnit | {"ruleId":"detachment-murdertalon-raiders:rule","clauseId":"source-clause-1-1"} | ROSTER / boolean | 2 |
| memberOfEligibleUnit:detachment-pactbound-zealots:rule:source-clause-1-3 | memberOfEligibleUnit | {"ruleId":"detachment-pactbound-zealots:rule","clauseId":"source-clause-1-3"} | ROSTER / boolean | 2 |
| memberOfEligibleUnit:detachment-pactbound-zealots:rule:source-clause-1-4 | memberOfEligibleUnit | {"ruleId":"detachment-pactbound-zealots:rule","clauseId":"source-clause-1-4"} | ROSTER / boolean | 2 |
| memberOfEligibleUnit:detachment-pactbound-zealots:rule:source-clause-1-5 | memberOfEligibleUnit | {"ruleId":"detachment-pactbound-zealots:rule","clauseId":"source-clause-1-5"} | ROSTER / boolean | 2 |
| memberOfEligibleUnit:detachment-pactbound-zealots:rule:source-clause-1-7 | memberOfEligibleUnit | {"ruleId":"detachment-pactbound-zealots:rule","clauseId":"source-clause-1-7"} | ROSTER / boolean | 2 |
| memberOfEligibleUnit:detachment-pactbound-zealots:rule:source-clause-1-8 | memberOfEligibleUnit | {"ruleId":"detachment-pactbound-zealots:rule","clauseId":"source-clause-1-8"} | ROSTER / boolean | 2 |
| memberOfEligibleUnit:detachment-pactbound-zealots:rule:source-clause-1-9 | memberOfEligibleUnit | {"ruleId":"detachment-pactbound-zealots:rule","clauseId":"source-clause-1-9"} | ROSTER / boolean | 2 |
| memberOfEligibleUnit:detachment-soulforged-warpack:rule:source-clause-1-2 | memberOfEligibleUnit | {"ruleId":"detachment-soulforged-warpack:rule","clauseId":"source-clause-1-2"} | ROSTER / boolean | 2 |
| memberOfEligibleUnit:detachment-soulforged-warpack:rule:source-clause-1-3 | memberOfEligibleUnit | {"ruleId":"detachment-soulforged-warpack:rule","clauseId":"source-clause-1-3"} | ROSTER / boolean | 2 |
| memberOfOwnerUnit:detachment-chaos-cult:enhancement:4 | memberOfOwnerUnit | {"ruleId":"detachment-chaos-cult:enhancement:4"} | ROSTER / boolean | 4 |
| memberOfOwnerUnit:detachment-cult-of-the-arkifane:enhancement:2 | memberOfOwnerUnit | {"ruleId":"detachment-cult-of-the-arkifane:enhancement:2"} | ROSTER / boolean | 4 |
| memberOfOwnerUnit:detachment-dread-talons:enhancement:2 | memberOfOwnerUnit | {"ruleId":"detachment-dread-talons:enhancement:2"} | ROSTER / boolean | 4 |
| memberOfOwnerUnit:detachment-nightmare-hunt:enhancement:1 | memberOfOwnerUnit | {"ruleId":"detachment-nightmare-hunt:enhancement:1"} | ROSTER / boolean | 4 |
| memberOfOwnerUnit:detachment-nightmare-hunt:enhancement:4 | memberOfOwnerUnit | {"ruleId":"detachment-nightmare-hunt:enhancement:4"} | ROSTER / boolean | 4 |
| memberOfOwnerUnit:detachment-renegade-raiders:enhancement:3 | memberOfOwnerUnit | {"ruleId":"detachment-renegade-raiders:enhancement:3"} | ROSTER / boolean | 4 |
| memberOfOwnerUnit:detachment-renegade-warband:enhancement:2 | memberOfOwnerUnit | {"ruleId":"detachment-renegade-warband:enhancement:2"} | ROSTER / boolean | 4 |
| memberOfSelectedUnit:detachment-cult-of-the-arkifane:rule | memberOfSelectedUnit | {"ruleId":"detachment-cult-of-the-arkifane:rule"} | ROSTER / boolean | 3 |
| memberOfSelectedUnit:detachment-murdertalon-raiders:enhancement:1 | memberOfSelectedUnit | {"ruleId":"detachment-murdertalon-raiders:enhancement:1"} | ROSTER / boolean | 4 |
| memberOfUnitRole:detachment-chaos-cult:enhancement:1:bearer-unit | memberOfUnitRole | {"ruleId":"detachment-chaos-cult:enhancement:1","roleId":"bearer-unit"} | ROSTER / boolean | 2 |
| memberOfUnitRole:detachment-chaos-cult:enhancement:3:bearer-unit | memberOfUnitRole | {"ruleId":"detachment-chaos-cult:enhancement:3","roleId":"bearer-unit"} | ROSTER / boolean | 2 |
| memberOfUnitRole:detachment-renegade-warband:enhancement:3:bearer-unit | memberOfUnitRole | {"ruleId":"detachment-renegade-warband:enhancement:3","roleId":"bearer-unit"} | ROSTER / boolean | 2 |
| memberOfUnitRole:detachment-soulforged-warpack:enhancement:3:nearby-contract-unit | memberOfUnitRole | {"ruleId":"detachment-soulforged-warpack:enhancement:3","roleId":"nearby-contract-unit"} | ROSTER / boolean | 2 |
| memberOfUnitRole:detachment-veterans-of-the-long-war:enhancement:1:bearer-unit | memberOfUnitRole | {"ruleId":"detachment-veterans-of-the-long-war:enhancement:1","roleId":"bearer-unit"} | ROSTER / boolean | 2 |
| moveAdvanceChargeModifierChoice | moveAdvanceChargeModifierChoice | {} | BATTLE / boolean | 3 |
| movementEndEnemyVehicleWithin12 | movementEndEnemyVehicleWithin12 | {} | BATTLE / boolean | 3 |
| needsInvulnerableSave:5 | needsInvulnerableSave | {"value":5} | ROSTER / boolean | 4 |
| needsMarkSelection:detachment-pactbound-zealots:rule | needsMarkSelection | {"ruleId":"detachment-pactbound-zealots:rule"} | ROSTER / boolean | 6 |
| normalAdvanceFallBackMove | normalAdvanceFallBackMove | {} | BATTLE / boolean | 3 |
| normalMoveEndedOncePerBattle | normalMoveEndedOncePerBattle | {} | BATTLE / boolean | 3 |
| normalOrAdvanceMoveEndedAndEnemyMovedOver | normalOrAdvanceMoveEndedAndEnemyMovedOver | {} | BATTLE / boolean | 3 |
| oncePerPhaseSelectedShootFight | oncePerPhaseSelectedShootFight | {} | BATTLE / boolean | 6 |
| overwatchTurnAllowance | overwatchTurnAllowance | {} | BATTLE / boolean | 3 |
| phaseStartOncePerBattleAndRecipientRange | phaseStartOncePerBattleAndRecipientRange | {} | BATTLE / boolean | 3 |
| pileInOrConsolidate | pileInOrConsolidate | {} | BATTLE / boolean | 3 |
| rangedAttackAllocatedMonsterOrVehicle | rangedAttackAllocatedMonsterOrVehicle | {} | BATTLE / boolean | 3 |
| rangedAttackEngagementContext | rangedAttackEngagementContext | {} | BATTLE / boolean | 3 |
| rangedAttackHitModifiers | rangedAttackHitModifiers | {} | BATTLE / boolean | 3 |
| rangedAttackOccludedByFortification | rangedAttackOccludedByFortification | {} | BATTLE / boolean | 3 |
| rangedAttackTargetsInfantry | rangedAttackTargetsInfantry | {} | BATTLE / boolean | 3 |
| remainingWoundsBand:datasheet-chaos-land-raider:section:4 | remainingWoundsBandMatched | {"ruleId":"datasheet-chaos-land-raider:section:4"} | BATTLE / boolean | 3 |
| remainingWoundsBand:datasheet-chaos-predator-annihilator:section:3 | remainingWoundsBandMatched | {"ruleId":"datasheet-chaos-predator-annihilator:section:3"} | BATTLE / boolean | 3 |
| remainingWoundsBand:datasheet-chaos-predator-destructor:section:3 | remainingWoundsBandMatched | {"ruleId":"datasheet-chaos-predator-destructor:section:3"} | BATTLE / boolean | 3 |
| remainingWoundsBand:datasheet-chaos-vindicator:section:3 | remainingWoundsBandMatched | {"ruleId":"datasheet-chaos-vindicator:section:3"} | BATTLE / boolean | 3 |
| remainingWoundsBand:datasheet-defiler:section:3 | remainingWoundsBandMatched | {"ruleId":"datasheet-defiler:section:3"} | BATTLE / boolean | 3 |
| remainingWoundsBand:datasheet-forgefiend:section:3 | remainingWoundsBandMatched | {"ruleId":"datasheet-forgefiend:section:3"} | BATTLE / boolean | 3 |
| remainingWoundsBand:datasheet-heldrake:section:3 | remainingWoundsBandMatched | {"ruleId":"datasheet-heldrake:section:3"} | BATTLE / boolean | 3 |
| remainingWoundsBand:datasheet-khorne-lord-of-skulls:section:3 | remainingWoundsBandMatched | {"ruleId":"datasheet-khorne-lord-of-skulls:section:3"} | BATTLE / boolean | 3 |
| remainingWoundsBand:datasheet-maulerfiend:section:3 | remainingWoundsBandMatched | {"ruleId":"datasheet-maulerfiend:section:3"} | BATTLE / boolean | 3 |
| remainingWoundsBand:datasheet-vashtorr-the-arkifane:section:3 | remainingWoundsBandMatched | {"ruleId":"datasheet-vashtorr-the-arkifane:section:3"} | BATTLE / boolean | 3 |
| ruleActive:detachment-cabal-of-chaos:rule | ruleActive | {"ruleId":"detachment-cabal-of-chaos:rule"} | BATTLE / boolean | 1 |
| ruleActive:detachment-cabal-of-chaos:rule:1 | ruleActive | {"ruleId":"detachment-cabal-of-chaos:rule","conditionId":"1"} | BATTLE / boolean | 1 |
| ruleActive:detachment-cabal-of-chaos:rule:2 | ruleActive | {"ruleId":"detachment-cabal-of-chaos:rule","conditionId":"2"} | BATTLE / boolean | 1 |
| ruleActive:detachment-chaos-cult:enhancement:1 | ruleActive | {"ruleId":"detachment-chaos-cult:enhancement:1"} | BATTLE / boolean | 1 |
| ruleActive:detachment-chaos-cult:enhancement:1:battle-clause-1 | ruleActive | {"ruleId":"detachment-chaos-cult:enhancement:1","clauseId":"battle-clause-1"} | BATTLE / boolean | 1 |
| ruleActive:detachment-chaos-cult:enhancement:2 | ruleActive | {"ruleId":"detachment-chaos-cult:enhancement:2"} | BATTLE / boolean | 1 |
| ruleActive:detachment-chaos-cult:enhancement:2:battle-clause-1 | ruleActive | {"ruleId":"detachment-chaos-cult:enhancement:2","clauseId":"battle-clause-1"} | BATTLE / boolean | 1 |
| ruleActive:detachment-chaos-cult:enhancement:3 | ruleActive | {"ruleId":"detachment-chaos-cult:enhancement:3"} | BATTLE / boolean | 1 |
| ruleActive:detachment-chaos-cult:enhancement:3:battle-clause-1 | ruleActive | {"ruleId":"detachment-chaos-cult:enhancement:3","clauseId":"battle-clause-1"} | BATTLE / boolean | 1 |
| ruleActive:detachment-chaos-cult:rule:source-clause-1-1 | ruleActive | {"ruleId":"detachment-chaos-cult:rule","clauseId":"source-clause-1-1"} | BATTLE / boolean | 1 |
| ruleActive:detachment-chaos-cult:rule:source-clause-1-3 | ruleActive | {"ruleId":"detachment-chaos-cult:rule","clauseId":"source-clause-1-3"} | BATTLE / boolean | 1 |
| ruleActive:detachment-creations-of-bile:enhancement:3 | ruleActive | {"ruleId":"detachment-creations-of-bile:enhancement:3"} | BATTLE / boolean | 1 |
| ruleActive:detachment-creations-of-bile:enhancement:3:battle-clause-1 | ruleActive | {"ruleId":"detachment-creations-of-bile:enhancement:3","clauseId":"battle-clause-1"} | BATTLE / boolean | 1 |
| ruleActive:detachment-creations-of-bile:enhancement:4:battle-clause-1 | ruleActive | {"ruleId":"detachment-creations-of-bile:enhancement:4","clauseId":"battle-clause-1"} | BATTLE / boolean | 1 |
| ruleActive:detachment-creations-of-bile:rule | ruleActive | {"ruleId":"detachment-creations-of-bile:rule"} | BATTLE / boolean | 1 |
| ruleActive:detachment-creations-of-bile:rule:source-clause-1-1 | ruleActive | {"ruleId":"detachment-creations-of-bile:rule","clauseId":"source-clause-1-1"} | BATTLE / boolean | 1 |
| ruleActive:detachment-creations-of-bile:rule:table-2-row-1 | ruleActive | {"ruleId":"detachment-creations-of-bile:rule","clauseId":"table-2-row-1"} | BATTLE / boolean | 1 |
| ruleActive:detachment-creations-of-bile:rule:table-2-row-2 | ruleActive | {"ruleId":"detachment-creations-of-bile:rule","clauseId":"table-2-row-2"} | BATTLE / boolean | 1 |
| ruleActive:detachment-creations-of-bile:rule:table-2-row-3 | ruleActive | {"ruleId":"detachment-creations-of-bile:rule","clauseId":"table-2-row-3"} | BATTLE / boolean | 1 |
| ruleActive:detachment-creations-of-bile:rule:table-2-row-4 | ruleActive | {"ruleId":"detachment-creations-of-bile:rule","clauseId":"table-2-row-4"} | BATTLE / boolean | 1 |
| ruleActive:detachment-creations-of-bile:rule:table-2-row-5 | ruleActive | {"ruleId":"detachment-creations-of-bile:rule","clauseId":"table-2-row-5"} | BATTLE / boolean | 1 |
| ruleActive:detachment-creations-of-bile:rule:table-2-row-6 | ruleActive | {"ruleId":"detachment-creations-of-bile:rule","clauseId":"table-2-row-6"} | BATTLE / boolean | 1 |
| ruleActive:detachment-cult-of-the-arkifane:enhancement:1 | ruleActive | {"ruleId":"detachment-cult-of-the-arkifane:enhancement:1"} | BATTLE / boolean | 1 |
| ruleActive:detachment-cult-of-the-arkifane:enhancement:1:battle-clause-1 | ruleActive | {"ruleId":"detachment-cult-of-the-arkifane:enhancement:1","clauseId":"battle-clause-1"} | BATTLE / boolean | 1 |
| ruleActive:detachment-deceptors:enhancement:2 | ruleActive | {"ruleId":"detachment-deceptors:enhancement:2"} | BATTLE / boolean | 1 |
| ruleActive:detachment-deceptors:enhancement:2:battle-clause-1 | ruleActive | {"ruleId":"detachment-deceptors:enhancement:2","clauseId":"battle-clause-1"} | BATTLE / boolean | 1 |
| ruleActive:detachment-deceptors:enhancement:2:battle-clause-2 | ruleActive | {"ruleId":"detachment-deceptors:enhancement:2","clauseId":"battle-clause-2"} | BATTLE / boolean | 1 |
| ruleActive:detachment-deceptors:enhancement:2:battle-clause-3 | ruleActive | {"ruleId":"detachment-deceptors:enhancement:2","conditionId":"battle-clause-3"} | BATTLE / boolean | 2 |
| ruleActive:detachment-deceptors:enhancement:2:battle-clause-4 | ruleActive | {"ruleId":"detachment-deceptors:enhancement:2","clauseId":"battle-clause-4"} | BATTLE / boolean | 1 |
| ruleActive:detachment-deceptors:enhancement:4 | ruleActive | {"ruleId":"detachment-deceptors:enhancement:4"} | BATTLE / boolean | 1 |
| ruleActive:detachment-deceptors:enhancement:4:battle-clause-1 | ruleActive | {"ruleId":"detachment-deceptors:enhancement:4","clauseId":"battle-clause-1"} | BATTLE / boolean | 1 |
| ruleActive:detachment-deceptors:enhancement:4:battle-clause-2 | ruleActive | {"ruleId":"detachment-deceptors:enhancement:4","clauseId":"battle-clause-2"} | BATTLE / boolean | 1 |
| ruleActive:detachment-deceptors:rule | ruleActive | {"ruleId":"detachment-deceptors:rule"} | BATTLE / boolean | 1 |
| ruleActive:detachment-deceptors:rule:source-clause-1-1 | ruleActive | {"ruleId":"detachment-deceptors:rule","clauseId":"source-clause-1-1"} | BATTLE / boolean | 1 |
| ruleActive:detachment-deceptors:rule:source-clause-1-2 | ruleActive | {"ruleId":"detachment-deceptors:rule","clauseId":"source-clause-1-2"} | BATTLE / boolean | 1 |
| ruleActive:detachment-deceptors:rule:table-2-row-1 | ruleActive | {"ruleId":"detachment-deceptors:rule","clauseId":"table-2-row-1"} | BATTLE / boolean | 1 |
| ruleActive:detachment-deceptors:rule:table-2-row-2 | ruleActive | {"ruleId":"detachment-deceptors:rule","clauseId":"table-2-row-2"} | BATTLE / boolean | 1 |
| ruleActive:detachment-deceptors:rule:table-2-row-3 | ruleActive | {"ruleId":"detachment-deceptors:rule","clauseId":"table-2-row-3"} | BATTLE / boolean | 1 |
| ruleActive:detachment-deceptors:rule:table-2-row-4 | ruleActive | {"ruleId":"detachment-deceptors:rule","clauseId":"table-2-row-4"} | BATTLE / boolean | 1 |
| ruleActive:detachment-deceptors:rule:table-2-row-5 | ruleActive | {"ruleId":"detachment-deceptors:rule","clauseId":"table-2-row-5"} | BATTLE / boolean | 1 |
| ruleActive:detachment-devotees-of-destruction:enhancement:1 | ruleActive | {"ruleId":"detachment-devotees-of-destruction:enhancement:1"} | BATTLE / boolean | 1 |
| ruleActive:detachment-devotees-of-destruction:enhancement:1:battle-clause-1 | ruleActive | {"ruleId":"detachment-devotees-of-destruction:enhancement:1","clauseId":"battle-clause-1"} | BATTLE / boolean | 1 |
| ruleActive:detachment-devotees-of-destruction:enhancement:1:battle-clause-2 | ruleActive | {"ruleId":"detachment-devotees-of-destruction:enhancement:1","clauseId":"battle-clause-2"} | BATTLE / boolean | 1 |
| ruleActive:detachment-devotees-of-destruction:enhancement:2 | ruleActive | {"ruleId":"detachment-devotees-of-destruction:enhancement:2"} | BATTLE / boolean | 1 |
| ruleActive:detachment-devotees-of-destruction:enhancement:2:battle-clause-1 | ruleActive | {"ruleId":"detachment-devotees-of-destruction:enhancement:2","clauseId":"battle-clause-1"} | BATTLE / boolean | 1 |
| ruleActive:detachment-devotees-of-destruction:enhancement:2:battle-clause-2 | ruleActive | {"ruleId":"detachment-devotees-of-destruction:enhancement:2","clauseId":"battle-clause-2"} | BATTLE / boolean | 1 |
| ruleActive:detachment-dread-talons:enhancement:1 | ruleActive | {"ruleId":"detachment-dread-talons:enhancement:1"} | BATTLE / boolean | 1 |
| ruleActive:detachment-dread-talons:enhancement:1:battle-clause-1 | ruleActive | {"ruleId":"detachment-dread-talons:enhancement:1","clauseId":"battle-clause-1"} | BATTLE / boolean | 1 |
| ruleActive:detachment-dread-talons:enhancement:3 | ruleActive | {"ruleId":"detachment-dread-talons:enhancement:3"} | BATTLE / boolean | 1 |
| ruleActive:detachment-dread-talons:enhancement:3:battle-clause-1 | ruleActive | {"ruleId":"detachment-dread-talons:enhancement:3","clauseId":"battle-clause-1"} | BATTLE / boolean | 1 |
| ruleActive:detachment-dread-talons:enhancement:4 | ruleActive | {"ruleId":"detachment-dread-talons:enhancement:4"} | BATTLE / boolean | 1 |
| ruleActive:detachment-dread-talons:enhancement:4:battle-clause-1 | ruleActive | {"ruleId":"detachment-dread-talons:enhancement:4","clauseId":"battle-clause-1"} | BATTLE / boolean | 1 |
| ruleActive:detachment-dread-talons:enhancement:4:battle-clause-2 | ruleActive | {"ruleId":"detachment-dread-talons:enhancement:4","clauseId":"battle-clause-2"} | BATTLE / boolean | 1 |
| ruleActive:detachment-dread-talons:rule | ruleActive | {"ruleId":"detachment-dread-talons:rule"} | BATTLE / boolean | 1 |
| ruleActive:detachment-dread-talons:rule:source-clause-1-1 | ruleActive | {"ruleId":"detachment-dread-talons:rule","clauseId":"source-clause-1-1"} | BATTLE / boolean | 1 |
| ruleActive:detachment-dread-talons:rule:source-clause-1-2 | ruleActive | {"ruleId":"detachment-dread-talons:rule","clauseId":"source-clause-1-2"} | BATTLE / boolean | 1 |
| ruleActive:detachment-dread-talons:rule:source-clause-1-3 | ruleActive | {"ruleId":"detachment-dread-talons:rule","clauseId":"source-clause-1-3"} | BATTLE / boolean | 1 |
| ruleActive:detachment-fellhammer-siege-host:enhancement:1 | ruleActive | {"ruleId":"detachment-fellhammer-siege-host:enhancement:1"} | BATTLE / boolean | 1 |
| ruleActive:detachment-fellhammer-siege-host:enhancement:1:battle-clause-1 | ruleActive | {"ruleId":"detachment-fellhammer-siege-host:enhancement:1","clauseId":"battle-clause-1"} | BATTLE / boolean | 1 |
| ruleActive:detachment-fellhammer-siege-host:enhancement:3 | ruleActive | {"ruleId":"detachment-fellhammer-siege-host:enhancement:3"} | BATTLE / boolean | 1 |
| ruleActive:detachment-fellhammer-siege-host:enhancement:3:battle-clause-1 | ruleActive | {"ruleId":"detachment-fellhammer-siege-host:enhancement:3","clauseId":"battle-clause-1"} | BATTLE / boolean | 1 |
| ruleActive:detachment-fellhammer-siege-host:enhancement:4 | ruleActive | {"ruleId":"detachment-fellhammer-siege-host:enhancement:4"} | BATTLE / boolean | 1 |
| ruleActive:detachment-fellhammer-siege-host:enhancement:4:battle-clause-1 | ruleActive | {"ruleId":"detachment-fellhammer-siege-host:enhancement:4","clauseId":"battle-clause-1"} | BATTLE / boolean | 1 |
| ruleActive:detachment-fellhammer-siege-host:enhancement:4:battle-clause-2 | ruleActive | {"ruleId":"detachment-fellhammer-siege-host:enhancement:4","clauseId":"battle-clause-2"} | BATTLE / boolean | 1 |
| ruleActive:detachment-fellhammer-siege-host:rule | ruleActive | {"ruleId":"detachment-fellhammer-siege-host:rule"} | BATTLE / boolean | 1 |
| ruleActive:detachment-fellhammer-siege-host:rule:source-clause-1-1 | ruleActive | {"ruleId":"detachment-fellhammer-siege-host:rule","clauseId":"source-clause-1-1"} | BATTLE / boolean | 1 |
| ruleActive:detachment-huron-s-marauders:enhancement:1 | ruleActive | {"ruleId":"detachment-huron-s-marauders:enhancement:1"} | BATTLE / boolean | 1 |
| ruleActive:detachment-huron-s-marauders:enhancement:2 | ruleActive | {"ruleId":"detachment-huron-s-marauders:enhancement:2"} | BATTLE / boolean | 1 |
| ruleActive:detachment-huron-s-marauders:enhancement:2:battle-clause-1 | ruleActive | {"ruleId":"detachment-huron-s-marauders:enhancement:2","clauseId":"battle-clause-1"} | BATTLE / boolean | 1 |
| ruleActive:detachment-huron-s-marauders:enhancement:3 | ruleActive | {"ruleId":"detachment-huron-s-marauders:enhancement:3"} | BATTLE / boolean | 1 |
| ruleActive:detachment-huron-s-marauders:enhancement:3:battle-clause-1 | ruleActive | {"ruleId":"detachment-huron-s-marauders:enhancement:3","clauseId":"battle-clause-1"} | BATTLE / boolean | 1 |
| ruleActive:detachment-huron-s-marauders:rule | ruleActive | {"ruleId":"detachment-huron-s-marauders:rule"} | BATTLE / boolean | 1 |
| ruleActive:detachment-huron-s-marauders:rule:source-clause-1-1 | ruleActive | {"ruleId":"detachment-huron-s-marauders:rule","clauseId":"source-clause-1-1"} | BATTLE / boolean | 1 |
| ruleActive:detachment-huron-s-marauders:rule:table-2-row-1 | ruleActive | {"ruleId":"detachment-huron-s-marauders:rule","clauseId":"table-2-row-1"} | BATTLE / boolean | 1 |
| ruleActive:detachment-huron-s-marauders:rule:table-3-row-1 | ruleActive | {"ruleId":"detachment-huron-s-marauders:rule","clauseId":"table-3-row-1"} | BATTLE / boolean | 1 |
| ruleActive:detachment-murdertalon-raiders:rule | ruleActive | {"ruleId":"detachment-murdertalon-raiders:rule"} | BATTLE / boolean | 1 |
| ruleActive:detachment-murdertalon-raiders:rule:source-clause-1-1 | ruleActive | {"ruleId":"detachment-murdertalon-raiders:rule","clauseId":"source-clause-1-1"} | BATTLE / boolean | 1 |
| ruleActive:detachment-murdertalon-raiders:rule:source-clause-1-2 | ruleActive | {"ruleId":"detachment-murdertalon-raiders:rule","clauseId":"source-clause-1-2"} | BATTLE / boolean | 1 |
| ruleActive:detachment-nightmare-hunt:enhancement:1:battle-clause-1 | ruleActive | {"ruleId":"detachment-nightmare-hunt:enhancement:1","clauseId":"battle-clause-1"} | BATTLE / boolean | 1 |
| ruleActive:detachment-nightmare-hunt:enhancement:2 | ruleActive | {"ruleId":"detachment-nightmare-hunt:enhancement:2"} | BATTLE / boolean | 1 |
| ruleActive:detachment-nightmare-hunt:enhancement:2:battle-clause-1 | ruleActive | {"ruleId":"detachment-nightmare-hunt:enhancement:2","clauseId":"battle-clause-1"} | BATTLE / boolean | 1 |
| ruleActive:detachment-nightmare-hunt:enhancement:3 | ruleActive | {"ruleId":"detachment-nightmare-hunt:enhancement:3"} | BATTLE / boolean | 1 |
| ruleActive:detachment-nightmare-hunt:enhancement:3:battle-clause-1 | ruleActive | {"ruleId":"detachment-nightmare-hunt:enhancement:3","clauseId":"battle-clause-1"} | BATTLE / boolean | 1 |
| ruleActive:detachment-nightmare-hunt:rule | ruleActive | {"ruleId":"detachment-nightmare-hunt:rule"} | BATTLE / boolean | 1 |
| ruleActive:detachment-nightmare-hunt:rule:source-clause-1-1 | ruleActive | {"ruleId":"detachment-nightmare-hunt:rule","clauseId":"source-clause-1-1"} | BATTLE / boolean | 1 |
| ruleActive:detachment-nightmare-hunt:rule:source-clause-1-2 | ruleActive | {"ruleId":"detachment-nightmare-hunt:rule","clauseId":"source-clause-1-2"} | BATTLE / boolean | 1 |
| ruleActive:detachment-nightmare-hunt:rule:source-clause-1-3 | ruleActive | {"ruleId":"detachment-nightmare-hunt:rule","clauseId":"source-clause-1-3"} | BATTLE / boolean | 1 |
| ruleActive:detachment-nightmare-hunt:rule:source-clause-1-4 | ruleActive | {"ruleId":"detachment-nightmare-hunt:rule","clauseId":"source-clause-1-4"} | BATTLE / boolean | 1 |
| ruleActive:detachment-pactbound-zealots:enhancement:1 | ruleActive | {"ruleId":"detachment-pactbound-zealots:enhancement:1"} | BATTLE / boolean | 1 |
| ruleActive:detachment-pactbound-zealots:enhancement:1:battle-clause-1 | ruleActive | {"ruleId":"detachment-pactbound-zealots:enhancement:1","clauseId":"battle-clause-1"} | BATTLE / boolean | 1 |
| ruleActive:detachment-pactbound-zealots:enhancement:2:battle-clause-1 | ruleActive | {"ruleId":"detachment-pactbound-zealots:enhancement:2","clauseId":"battle-clause-1"} | BATTLE / boolean | 1 |
| ruleActive:detachment-pactbound-zealots:enhancement:3 | ruleActive | {"ruleId":"detachment-pactbound-zealots:enhancement:3"} | BATTLE / boolean | 1 |
| ruleActive:detachment-pactbound-zealots:enhancement:3:battle-clause-1 | ruleActive | {"ruleId":"detachment-pactbound-zealots:enhancement:3","clauseId":"battle-clause-1"} | BATTLE / boolean | 1 |
| ruleActive:detachment-pactbound-zealots:enhancement:4:battle-clause-1 | ruleActive | {"ruleId":"detachment-pactbound-zealots:enhancement:4","clauseId":"battle-clause-1"} | BATTLE / boolean | 1 |
| ruleActive:detachment-pactbound-zealots:rule:dark-pact | ruleActive | {"ruleId":"detachment-pactbound-zealots:rule","conditionId":"dark-pact"} | BATTLE / boolean | 1 |
| ruleActive:detachment-pactbound-zealots:rule:source-clause-1-13 | ruleActive | {"ruleId":"detachment-pactbound-zealots:rule","clauseId":"source-clause-1-13"} | BATTLE / boolean | 1 |
| ruleActive:detachment-pactbound-zealots:rule:source-clause-1-3 | ruleActive | {"ruleId":"detachment-pactbound-zealots:rule","clauseId":"source-clause-1-3"} | BATTLE / boolean | 1 |
| ruleActive:detachment-pactbound-zealots:rule:source-clause-1-4 | ruleActive | {"ruleId":"detachment-pactbound-zealots:rule","clauseId":"source-clause-1-4"} | BATTLE / boolean | 1 |
| ruleActive:detachment-pactbound-zealots:rule:source-clause-1-5 | ruleActive | {"ruleId":"detachment-pactbound-zealots:rule","clauseId":"source-clause-1-5"} | BATTLE / boolean | 1 |
| ruleActive:detachment-pactbound-zealots:rule:source-clause-1-7 | ruleActive | {"ruleId":"detachment-pactbound-zealots:rule","clauseId":"source-clause-1-7"} | BATTLE / boolean | 1 |
| ruleActive:detachment-pactbound-zealots:rule:source-clause-1-8 | ruleActive | {"ruleId":"detachment-pactbound-zealots:rule","clauseId":"source-clause-1-8"} | BATTLE / boolean | 1 |
| ruleActive:detachment-pactbound-zealots:rule:source-clause-1-9 | ruleActive | {"ruleId":"detachment-pactbound-zealots:rule","clauseId":"source-clause-1-9"} | BATTLE / boolean | 1 |
| ruleActive:detachment-renegade-raiders:enhancement:1 | ruleActive | {"ruleId":"detachment-renegade-raiders:enhancement:1"} | BATTLE / boolean | 1 |
| ruleActive:detachment-renegade-raiders:enhancement:1:battle-clause-1 | ruleActive | {"ruleId":"detachment-renegade-raiders:enhancement:1","clauseId":"battle-clause-1"} | BATTLE / boolean | 1 |
| ruleActive:detachment-renegade-raiders:enhancement:2 | ruleActive | {"ruleId":"detachment-renegade-raiders:enhancement:2"} | BATTLE / boolean | 1 |
| ruleActive:detachment-renegade-raiders:enhancement:2:battle-clause-1 | ruleActive | {"ruleId":"detachment-renegade-raiders:enhancement:2","clauseId":"battle-clause-1"} | BATTLE / boolean | 1 |
| ruleActive:detachment-renegade-raiders:enhancement:4 | ruleActive | {"ruleId":"detachment-renegade-raiders:enhancement:4"} | BATTLE / boolean | 1 |
| ruleActive:detachment-renegade-raiders:enhancement:4:battle-clause-1 | ruleActive | {"ruleId":"detachment-renegade-raiders:enhancement:4","clauseId":"battle-clause-1"} | BATTLE / boolean | 1 |
| ruleActive:detachment-renegade-raiders:rule:source-clause-1-1 | ruleActive | {"ruleId":"detachment-renegade-raiders:rule","clauseId":"source-clause-1-1"} | BATTLE / boolean | 1 |
| ruleActive:detachment-renegade-warband:enhancement:1 | ruleActive | {"ruleId":"detachment-renegade-warband:enhancement:1"} | BATTLE / boolean | 1 |
| ruleActive:detachment-renegade-warband:enhancement:1:battle-clause-1 | ruleActive | {"ruleId":"detachment-renegade-warband:enhancement:1","clauseId":"battle-clause-1"} | BATTLE / boolean | 1 |
| ruleActive:detachment-renegade-warband:enhancement:1:battle-clause-2 | ruleActive | {"ruleId":"detachment-renegade-warband:enhancement:1","clauseId":"battle-clause-2"} | BATTLE / boolean | 1 |
| ruleActive:detachment-renegade-warband:enhancement:3 | ruleActive | {"ruleId":"detachment-renegade-warband:enhancement:3"} | BATTLE / boolean | 1 |
| ruleActive:detachment-renegade-warband:enhancement:3:battle-clause-1 | ruleActive | {"ruleId":"detachment-renegade-warband:enhancement:3","clauseId":"battle-clause-1"} | BATTLE / boolean | 1 |
| ruleActive:detachment-renegade-warband:rule:battle-clause-1 | ruleActive | {"ruleId":"detachment-renegade-warband:rule","clauseId":"battle-clause-1"} | BATTLE / boolean | 1 |
| ruleActive:detachment-renegade-warband:rule:battle-clause-2 | ruleActive | {"ruleId":"detachment-renegade-warband:rule","clauseId":"battle-clause-2"} | BATTLE / boolean | 1 |
| ruleActive:detachment-soulforged-warpack:enhancement:1 | ruleActive | {"ruleId":"detachment-soulforged-warpack:enhancement:1"} | BATTLE / boolean | 1 |
| ruleActive:detachment-soulforged-warpack:enhancement:1:battle-clause-1 | ruleActive | {"ruleId":"detachment-soulforged-warpack:enhancement:1","clauseId":"battle-clause-1"} | BATTLE / boolean | 1 |
| ruleActive:detachment-soulforged-warpack:enhancement:1:battle-clause-2 | ruleActive | {"ruleId":"detachment-soulforged-warpack:enhancement:1","clauseId":"battle-clause-2"} | BATTLE / boolean | 1 |
| ruleActive:detachment-soulforged-warpack:enhancement:3 | ruleActive | {"ruleId":"detachment-soulforged-warpack:enhancement:3"} | BATTLE / boolean | 1 |
| ruleActive:detachment-soulforged-warpack:enhancement:3:battle-clause-1 | ruleActive | {"ruleId":"detachment-soulforged-warpack:enhancement:3","clauseId":"battle-clause-1"} | BATTLE / boolean | 1 |
| ruleActive:detachment-soulforged-warpack:enhancement:3:battle-clause-2 | ruleActive | {"ruleId":"detachment-soulforged-warpack:enhancement:3","clauseId":"battle-clause-2"} | BATTLE / boolean | 1 |
| ruleActive:detachment-soulforged-warpack:enhancement:3:battle-clause-3 | ruleActive | {"ruleId":"detachment-soulforged-warpack:enhancement:3","clauseId":"battle-clause-3"} | BATTLE / boolean | 1 |
| ruleActive:detachment-soulforged-warpack:enhancement:4 | ruleActive | {"ruleId":"detachment-soulforged-warpack:enhancement:4"} | BATTLE / boolean | 1 |
| ruleActive:detachment-soulforged-warpack:enhancement:4:battle-clause-1 | ruleActive | {"ruleId":"detachment-soulforged-warpack:enhancement:4","clauseId":"battle-clause-1"} | BATTLE / boolean | 1 |
| ruleActive:detachment-soulforged-warpack:rule | ruleActive | {"ruleId":"detachment-soulforged-warpack:rule"} | BATTLE / boolean | 1 |
| ruleActive:detachment-soulforged-warpack:rule:source-clause-1-1 | ruleActive | {"ruleId":"detachment-soulforged-warpack:rule","clauseId":"source-clause-1-1"} | BATTLE / boolean | 1 |
| ruleActive:detachment-soulforged-warpack:rule:source-clause-1-2 | ruleActive | {"ruleId":"detachment-soulforged-warpack:rule","clauseId":"source-clause-1-2"} | BATTLE / boolean | 1 |
| ruleActive:detachment-soulforged-warpack:rule:source-clause-1-3 | ruleActive | {"ruleId":"detachment-soulforged-warpack:rule","clauseId":"source-clause-1-3"} | BATTLE / boolean | 1 |
| ruleActive:detachment-veterans-of-the-long-war:enhancement:1 | ruleActive | {"ruleId":"detachment-veterans-of-the-long-war:enhancement:1"} | BATTLE / boolean | 1 |
| ruleActive:detachment-veterans-of-the-long-war:enhancement:1:battle-clause-1 | ruleActive | {"ruleId":"detachment-veterans-of-the-long-war:enhancement:1","clauseId":"battle-clause-1"} | BATTLE / boolean | 1 |
| ruleActive:detachment-veterans-of-the-long-war:enhancement:1:battle-clause-2 | ruleActive | {"ruleId":"detachment-veterans-of-the-long-war:enhancement:1","clauseId":"battle-clause-2"} | BATTLE / boolean | 1 |
| ruleActive:detachment-veterans-of-the-long-war:enhancement:2 | ruleActive | {"ruleId":"detachment-veterans-of-the-long-war:enhancement:2"} | BATTLE / boolean | 1 |
| ruleActive:detachment-veterans-of-the-long-war:enhancement:2:battle-clause-1 | ruleActive | {"ruleId":"detachment-veterans-of-the-long-war:enhancement:2","clauseId":"battle-clause-1"} | BATTLE / boolean | 1 |
| ruleActive:detachment-veterans-of-the-long-war:enhancement:3 | ruleActive | {"ruleId":"detachment-veterans-of-the-long-war:enhancement:3"} | BATTLE / boolean | 1 |
| ruleActive:detachment-veterans-of-the-long-war:enhancement:3:battle-clause-1 | ruleActive | {"ruleId":"detachment-veterans-of-the-long-war:enhancement:3","clauseId":"battle-clause-1"} | BATTLE / boolean | 1 |
| ruleActive:detachment-veterans-of-the-long-war:enhancement:4 | ruleActive | {"ruleId":"detachment-veterans-of-the-long-war:enhancement:4"} | BATTLE / boolean | 1 |
| ruleActive:detachment-veterans-of-the-long-war:enhancement:4:battle-clause-1 | ruleActive | {"ruleId":"detachment-veterans-of-the-long-war:enhancement:4","clauseId":"battle-clause-1"} | BATTLE / boolean | 1 |
| ruleActive:detachment-veterans-of-the-long-war:rule | ruleActive | {"ruleId":"detachment-veterans-of-the-long-war:rule"} | BATTLE / boolean | 1 |
| ruleActive:detachment-veterans-of-the-long-war:rule:source-clause-1-1 | ruleActive | {"ruleId":"detachment-veterans-of-the-long-war:rule","clauseId":"source-clause-1-1"} | BATTLE / boolean | 1 |
| ruleActive:detachment-warpstrike-champions:enhancement:1 | ruleActive | {"ruleId":"detachment-warpstrike-champions:enhancement:1"} | BATTLE / boolean | 1 |
| ruleActive:detachment-warpstrike-champions:enhancement:1:battle-clause-1 | ruleActive | {"ruleId":"detachment-warpstrike-champions:enhancement:1","clauseId":"battle-clause-1"} | BATTLE / boolean | 1 |
| ruleActive:detachment-warpstrike-champions:enhancement:2 | ruleActive | {"ruleId":"detachment-warpstrike-champions:enhancement:2"} | BATTLE / boolean | 1 |
| ruleActive:detachment-warpstrike-champions:enhancement:2:battle-clause-2 | ruleActive | {"ruleId":"detachment-warpstrike-champions:enhancement:2","clauseId":"battle-clause-2"} | BATTLE / boolean | 1 |
| ruleActive:detachment-warpstrike-champions:enhancement:3 | ruleActive | {"ruleId":"detachment-warpstrike-champions:enhancement:3"} | BATTLE / boolean | 1 |
| ruleActive:detachment-warpstrike-champions:enhancement:3:battle-clause-2 | ruleActive | {"ruleId":"detachment-warpstrike-champions:enhancement:3","clauseId":"battle-clause-2"} | BATTLE / boolean | 1 |
| ruleActive:detachment-warpstrike-champions:enhancement:4:battle-clause-2 | ruleActive | {"ruleId":"detachment-warpstrike-champions:enhancement:4","clauseId":"battle-clause-2"} | BATTLE / boolean | 1 |
| ruleActive:detachment-warpstrike-champions:rule | ruleActive | {"ruleId":"detachment-warpstrike-champions:rule"} | BATTLE / boolean | 1 |
| ruleActive:detachment-warpstrike-champions:rule:source-clause-1-1 | ruleActive | {"ruleId":"detachment-warpstrike-champions:rule","clauseId":"source-clause-1-1"} | BATTLE / boolean | 1 |
| ruleActive:detachment-warpstrike-champions:rule:source-clause-3-1 | ruleActive | {"ruleId":"detachment-warpstrike-champions:rule","clauseId":"source-clause-3-1"} | BATTLE / boolean | 1 |
| ruleActive:detachment-warpstrike-champions:rule:table-2-row-1 | ruleActive | {"ruleId":"detachment-warpstrike-champions:rule","clauseId":"table-2-row-1"} | BATTLE / boolean | 1 |
| ruleActive:detachment-warpstrike-champions:rule:table-2-row-2 | ruleActive | {"ruleId":"detachment-warpstrike-champions:rule","clauseId":"table-2-row-2"} | BATTLE / boolean | 1 |
| ruleActive:detachment-warpstrike-champions:rule:table-2-row-3 | ruleActive | {"ruleId":"detachment-warpstrike-champions:rule","clauseId":"table-2-row-3"} | BATTLE / boolean | 1 |
| ruleActive:detachment-warpstrike-champions:rule:table-2-row-4 | ruleActive | {"ruleId":"detachment-warpstrike-champions:rule","clauseId":"table-2-row-4"} | BATTLE / boolean | 1 |
| sameUnitAsOwner:detachment-chaos-cult:enhancement:1 | sameUnitAsOwner | {"ruleId":"detachment-chaos-cult:enhancement:1"} | ROSTER / boolean | 1 |
| sameUnitAsOwner:detachment-chaos-cult:enhancement:2 | sameUnitAsOwner | {"ruleId":"detachment-chaos-cult:enhancement:2"} | ROSTER / boolean | 2 |
| sameUnitAsOwner:detachment-chaos-cult:enhancement:3 | sameUnitAsOwner | {"ruleId":"detachment-chaos-cult:enhancement:3"} | ROSTER / boolean | 1 |
| sameUnitAsOwner:detachment-devotees-of-destruction:enhancement:1 | sameUnitAsOwner | {"ruleId":"detachment-devotees-of-destruction:enhancement:1"} | ROSTER / boolean | 4 |
| sameUnitAsOwner:detachment-devotees-of-destruction:enhancement:2 | sameUnitAsOwner | {"ruleId":"detachment-devotees-of-destruction:enhancement:2"} | ROSTER / boolean | 2 |
| sameUnitAsOwner:detachment-dread-talons:enhancement:3 | sameUnitAsOwner | {"ruleId":"detachment-dread-talons:enhancement:3"} | ROSTER / boolean | 2 |
| sameUnitAsOwner:detachment-fellhammer-siege-host:enhancement:1 | sameUnitAsOwner | {"ruleId":"detachment-fellhammer-siege-host:enhancement:1"} | ROSTER / boolean | 2 |
| sameUnitAsOwner:detachment-huron-s-marauders:enhancement:1 | sameUnitAsOwner | {"ruleId":"detachment-huron-s-marauders:enhancement:1"} | ROSTER / boolean | 2 |
| sameUnitAsOwner:detachment-huron-s-marauders:enhancement:2 | sameUnitAsOwner | {"ruleId":"detachment-huron-s-marauders:enhancement:2"} | ROSTER / boolean | 2 |
| sameUnitAsOwner:detachment-huron-s-marauders:enhancement:3 | sameUnitAsOwner | {"ruleId":"detachment-huron-s-marauders:enhancement:3"} | ROSTER / boolean | 2 |
| sameUnitAsOwner:detachment-murdertalon-raiders:enhancement:1 | sameUnitAsOwner | {"ruleId":"detachment-murdertalon-raiders:enhancement:1"} | ROSTER / boolean | 2 |
| sameUnitAsOwner:detachment-nightmare-hunt:enhancement:1 | sameUnitAsOwner | {"ruleId":"detachment-nightmare-hunt:enhancement:1"} | ROSTER / boolean | 2 |
| sameUnitAsOwner:detachment-nightmare-hunt:enhancement:2 | sameUnitAsOwner | {"ruleId":"detachment-nightmare-hunt:enhancement:2"} | ROSTER / boolean | 2 |
| sameUnitAsOwner:detachment-nightmare-hunt:enhancement:3 | sameUnitAsOwner | {"ruleId":"detachment-nightmare-hunt:enhancement:3"} | ROSTER / boolean | 2 |
| sameUnitAsOwner:detachment-pactbound-zealots:enhancement:1 | sameUnitAsOwner | {"ruleId":"detachment-pactbound-zealots:enhancement:1"} | ROSTER / boolean | 1 |
| sameUnitAsOwner:detachment-pactbound-zealots:enhancement:2 | sameUnitAsOwner | {"ruleId":"detachment-pactbound-zealots:enhancement:2"} | ROSTER / boolean | 2 |
| sameUnitAsOwner:detachment-pactbound-zealots:enhancement:3 | sameUnitAsOwner | {"ruleId":"detachment-pactbound-zealots:enhancement:3"} | ROSTER / boolean | 2 |
| sameUnitAsOwner:detachment-pactbound-zealots:enhancement:4 | sameUnitAsOwner | {"ruleId":"detachment-pactbound-zealots:enhancement:4"} | ROSTER / boolean | 1 |
| sameUnitAsOwner:detachment-renegade-raiders:enhancement:4 | sameUnitAsOwner | {"ruleId":"detachment-renegade-raiders:enhancement:4"} | ROSTER / boolean | 2 |
| sameUnitAsOwner:detachment-renegade-warband:enhancement:3 | sameUnitAsOwner | {"ruleId":"detachment-renegade-warband:enhancement:3"} | ROSTER / boolean | 1 |
| sameUnitAsOwner:detachment-veterans-of-the-long-war:enhancement:1 | sameUnitAsOwner | {"ruleId":"detachment-veterans-of-the-long-war:enhancement:1"} | ROSTER / boolean | 4 |
| sameUnitAsOwner:detachment-warpstrike-champions:enhancement:1 | sameUnitAsOwner | {"ruleId":"detachment-warpstrike-champions:enhancement:1"} | ROSTER / boolean | 2 |
| sameUnitAsOwner:detachment-warpstrike-champions:enhancement:2 | sameUnitAsOwner | {"ruleId":"detachment-warpstrike-champions:enhancement:2"} | ROSTER / boolean | 2 |
| sameUnitAsOwner:detachment-warpstrike-champions:enhancement:3 | sameUnitAsOwner | {"ruleId":"detachment-warpstrike-champions:enhancement:3"} | ROSTER / boolean | 2 |
| sameUnitAsOwner:detachment-warpstrike-champions:enhancement:4 | sameUnitAsOwner | {"ruleId":"detachment-warpstrike-champions:enhancement:4"} | ROSTER / boolean | 1 |
| selectedEquipment:datasheet-chaos-bikers:wargear:4 | equipmentSelected | {"equipmentId":"datasheet-chaos-bikers:wargear:4"} | ROSTER / boolean | 3 |
| selectedEquipment:datasheet-chosen:wargear:5 | equipmentSelected | {"equipmentId":"datasheet-chosen:wargear:5"} | ROSTER / boolean | 3 |
| selectedEquipment:datasheet-dark-commune:section:2 | equipmentSelected | {"equipmentId":"datasheet-dark-commune:section:2"} | ROSTER / boolean | 3 |
| selectedEquipment:datasheet-legionaries:wargear:3 | equipmentSelected | {"equipmentId":"datasheet-legionaries:wargear:3"} | ROSTER / boolean | 3 |
| selectedEquipment:datasheet-nemesis-claw:wargear:6 | equipmentSelected | {"equipmentId":"datasheet-nemesis-claw:wargear:6"} | ROSTER / boolean | 3 |
| selectedEquipment:datasheet-possessed:wargear:1 | equipmentSelected | {"equipmentId":"datasheet-possessed:wargear:1"} | ROSTER / boolean | 3 |
| selectedEquipment:datasheet-sorcerer-in-terminator-armour:wargear:2 | equipmentSelected | {"equipmentId":"datasheet-sorcerer-in-terminator-armour:wargear:2"} | ROSTER / boolean | 3 |
| selectedOtherDonor:detachment-deceptors:enhancement:4 | selectedOtherDonor | {"ruleId":"detachment-deceptors:enhancement:4"} | BATTLE / boolean | 3 |
| selectedReplacementModel:detachment-deceptors:enhancement:2 | selectedReplacementModel | {"ruleId":"detachment-deceptors:enhancement:2"} | BATTLE / boolean | 6 |
| selectedUpgrade:datasheet-heretic-astartes-daemon-prince-with-wings:section:3 | selectedUpgrade | {"selectionGroupId":"datasheet-heretic-astartes-daemon-prince-with-wings:section:3","selectionMode":"VALIDATED_CANONICAL_OPTION"} | ROSTER / string | 36 |
| selectedUpgrade:datasheet-heretic-astartes-daemon-prince:section:3 | selectedUpgrade | {"selectionGroupId":"datasheet-heretic-astartes-daemon-prince:section:3","selectionMode":"VALIDATED_CANONICAL_OPTION"} | ROSTER / string | 36 |
| selectedWarmasterAbility | selectedWarmasterAbility | {} | BATTLE / string | 9 |
| setUpFromReservesWithinBearerExclusion:detachment-creations-of-bile:enhancement:3 | setUpFromReservesWithinBearerExclusion | {"ruleId":"detachment-creations-of-bile:enhancement:3"} | BATTLE / boolean | 2 |
| shootFightCompletedPsychicAttackHit | shootFightCompletedPsychicAttackHit | {} | BATTLE / boolean | 3 |
| shootOrFightResolution | shootOrFightResolution | {} | BATTLE / boolean | 3 |
| shootSelectedActivation | shootSelectedActivation | {} | BATTLE / boolean | 4 |
| shootingCompletedAndEnemyHit | shootingCompletedAndEnemyHit | {} | BATTLE / boolean | 3 |
| shootingSelectedOncePerBattle | shootingSelectedOncePerBattle | {} | BATTLE / boolean | 3 |
| shootingStartEnemyVisibleWithin12 | shootingStartEnemyVisibleWithin12 | {} | BATTLE / boolean | 3 |
| shootingStartPsychicSelectionAndRoll | shootingStartPsychicSelectionAndRoll | {} | BATTLE / boolean | 5 |
| shootingStartVisibleEnemySelected | shootingStartVisibleEnemySelected | {} | BATTLE / boolean | 3 |
| sourceBackedModelMark:KHORNE | selectedModelMark | {"keyword":"KHORNE"} | ROSTER / boolean | 8 |
| sourceBackedModelMark:NURGLE | selectedModelMark | {"keyword":"NURGLE"} | ROSTER / boolean | 3 |
| sourceBackedModelMark:SLAANESH | selectedModelMark | {"keyword":"SLAANESH"} | ROSTER / boolean | 6 |
| sourceBackedModelMark:TZEENTCH | selectedModelMark | {"keyword":"TZEENTCH"} | ROSTER / boolean | 3 |
| sourceBackedUnitMark:CHAOS UNDIVIDED | selectedUnitMark | {"keyword":"CHAOS UNDIVIDED"} | ROSTER / boolean | 3 |
| sourceBackedUnitMark:KHORNE | selectedUnitMark | {"keyword":"KHORNE"} | ROSTER / boolean | 2 |
| sourceBackedUnitMark:NURGLE | selectedUnitMark | {"keyword":"NURGLE"} | ROSTER / boolean | 2 |
| sourceBackedUnitMark:SLAANESH | selectedUnitMark | {"keyword":"SLAANESH"} | ROSTER / boolean | 2 |
| sourceBackedUnitMark:TZEENTCH | selectedUnitMark | {"keyword":"TZEENTCH"} | ROSTER / boolean | 2 |
| sourceBattleApplicability:datasheet-abaddon-the-despoiler:section:5:block:0:text | sourceBattleApplicability | {"ruleId":"datasheet-abaddon-the-despoiler:section:5:block:0:text"} | BATTLE / boolean | 2 |
| sourceBattleApplicability:datasheet-abaddon-the-despoiler:section:5:block:1:text | sourceBattleApplicability | {"ruleId":"datasheet-abaddon-the-despoiler:section:5:block:1:text"} | BATTLE / boolean | 2 |
| sourceBattleApplicability:datasheet-abaddon-the-despoiler:section:5:block:2:text | sourceBattleApplicability | {"ruleId":"datasheet-abaddon-the-despoiler:section:5:block:2:text"} | BATTLE / boolean | 2 |
| sourceBattleApplicability:datasheet-dark-apostle:section:1:block:1:text | sourceBattleApplicability | {"ruleId":"datasheet-dark-apostle:section:1:block:1:text"} | BATTLE / boolean | 2 |
| sourceBattleApplicability:datasheet-helbrute:section:1:block:0:text | sourceBattleApplicability | {"ruleId":"datasheet-helbrute:section:1:block:0:text"} | BATTLE / boolean | 3 |
| sourceBattleApplicability:datasheet-heretic-astartes-daemon-prince:section:1:block:0:text | sourceBattleApplicability | {"ruleId":"datasheet-heretic-astartes-daemon-prince:section:1:block:0:text"} | BATTLE / boolean | 2 |
| sourceBattleApplicability:datasheet-heretic-astartes-daemon-prince:section:1:block:2:text | sourceBattleApplicability | {"ruleId":"datasheet-heretic-astartes-daemon-prince:section:1:block:2:text"} | BATTLE / boolean | 2 |
| sourceBattleApplicability:datasheet-huron-blackheart:section:1:block:0:text | sourceBattleApplicability | {"ruleId":"datasheet-huron-blackheart:section:1:block:0:text"} | BATTLE / boolean | 2 |
| sourceBattleApplicability:datasheet-lord-discordant-on-helstalker:section:1:block:1:text | sourceBattleApplicability | {"ruleId":"datasheet-lord-discordant-on-helstalker:section:1:block:1:text"} | BATTLE / boolean | 3 |
| sourceBattleApplicability:datasheet-masters-of-the-maelstrom:section:1:block:1:text | sourceBattleApplicability | {"ruleId":"datasheet-masters-of-the-maelstrom:section:1:block:1:text"} | BATTLE / boolean | 2 |
| sourceBattleApplicability:datasheet-noctilith-crown:section:1:block:0:text | sourceBattleApplicability | {"ruleId":"datasheet-noctilith-crown:section:1:block:0:text"} | BATTLE / boolean | 2 |
| sourceBattleApplicability:datasheet-vashtorr-the-arkifane:section:1:block:0:text | sourceBattleApplicability | {"ruleId":"datasheet-vashtorr-the-arkifane:section:1:block:0:text"} | BATTLE / boolean | 2 |
| sourceBattleApplicability:datasheet-vashtorr-the-arkifane:section:1:block:2:text | sourceBattleApplicability | {"ruleId":"datasheet-vashtorr-the-arkifane:section:1:block:2:text"} | BATTLE / boolean | 2 |
| sourceBattleApplicability:datasheet-warpsmith:section:1:block:0:text | sourceBattleApplicability | {"ruleId":"datasheet-warpsmith:section:1:block:0:text"} | BATTLE / boolean | 2 |
| sourceBattleApplicability:datasheet-warpsmith:section:1:block:1:text | sourceBattleApplicability | {"ruleId":"datasheet-warpsmith:section:1:block:1:text"} | BATTLE / boolean | 4 |
| sourceUnitChargeMoveEnded | sourceUnitChargeMoveEnded | {} | BATTLE / boolean | 4 |
| sourceWithinObjectiveRangeAndRangedAttack | sourceWithinObjectiveRangeAndRangedAttack | {} | BATTLE / boolean | 3 |
| stratagemUseAndRoundAllowance | stratagemUseAndRoundAllowance | {} | BATTLE / boolean | 9 |
| strategicReservesBattleRoundAndReinforcements | strategicReservesBattleRoundAndReinforcements | {} | BATTLE / boolean | 3 |
| twoAdditionalMeleeWeaponsEquipped | twoAdditionalMeleeWeaponsEquipped | {} | ROSTER / boolean | 4 |
| warmasterCommandSelection | warmasterCommandSelection | {} | BATTLE / boolean | 4 |
| warmasterRecipientWithin6:datasheet-abaddon-the-despoiler:section:5:block:0:text | withinRange | {"ruleId":"datasheet-abaddon-the-despoiler:section:5:block:0:text","inches":6,"from":"SOURCE_MODEL","rangeContext":"RECIPIENT_OF_SOURCE_RULE"} | BATTLE / boolean | 3 |
| warmasterRecipientWithin6:datasheet-abaddon-the-despoiler:section:5:block:1:text | withinRange | {"ruleId":"datasheet-abaddon-the-despoiler:section:5:block:1:text","inches":6,"from":"SOURCE_MODEL","rangeContext":"RECIPIENT_OF_SOURCE_RULE"} | BATTLE / boolean | 3 |
| warmasterRecipientWithin6:datasheet-abaddon-the-despoiler:section:5:block:2:text | withinRange | {"ruleId":"datasheet-abaddon-the-despoiler:section:5:block:2:text","inches":6,"from":"SOURCE_MODEL","rangeContext":"RECIPIENT_OF_SOURCE_RULE"} | BATTLE / boolean | 3 |

### dark-angels

| Old key | Canonical key | Parameters | Level / type | Occurrences |
| --- | --- | --- | --- | ---: |
| attached | attached | {} | ROSTER / boolean | 14 |
| daAncientPresent | physicalProfilePresent | {"unitId":"unit-da-467009b00bb9402dadee","profileId":"model-da-9bdc9ba0422949849ecc"} | ROSTER / boolean | 2 |
| daArmyMembershipProven | reviewedArmyMembershipProven | {} | ROSTER / boolean | 6 |
| daChampionPresent | physicalProfilePresent | {"unitId":"unit-da-467009b00bb9402dadee","profileId":"model-da-d9a85659ae224494b0a7"} | ROSTER / boolean | 2 |
| equipmentRequirementSatisfied | equipmentRequirementSatisfied | {} | ROSTER / boolean | 12 |
| smEquipmentBearerSatisfied | equipmentBearerSatisfied | {"quantityProof":"POSITIVE_SELECTION","equipmentId":"ability-sm-097567b13c02404d"} | ROSTER / boolean | 1 |
| smEquipmentBearerSatisfied | equipmentBearerSatisfied | {"quantityProof":"POSITIVE_SELECTION","equipmentId":"ability-sm-431f22d15f7545b4"} | ROSTER / boolean | 1 |
| smEquipmentBearerSatisfied | equipmentBearerSatisfied | {"quantityProof":"POSITIVE_SELECTION","equipmentId":"ability-sm-63d4ca967fa64b79"} | ROSTER / boolean | 1 |
| smEquipmentBearerSatisfied | equipmentBearerSatisfied | {"quantityProof":"POSITIVE_SELECTION","equipmentId":"ability-sm-8c9e7e37a8494c1d"} | ROSTER / boolean | 1 |
| smEquipmentBearerSatisfied | equipmentBearerSatisfied | {"quantityProof":"POSITIVE_SELECTION","equipmentId":"ability-sm-aa81f0067a3140de"} | ROSTER / boolean | 1 |
| smEquipmentBearerSatisfied | equipmentBearerSatisfied | {"quantityProof":"POSITIVE_SELECTION","equipmentId":"ability-sm-daf87042d20348dd"} | ROSTER / boolean | 1 |
| smPermanentAssaultSource | permanentDoctrineSourcePresent | {} | ROSTER / boolean | 2 |

### death-guard

| Old key | Canonical key | Parameters | Level / type | Occurrences |
| --- | --- | --- | --- | ---: |
| additionalPlagueSelected | additionalPlagueSelected | {} | BATTLE / boolean | 2 |
| attackStrengthExceedsUnitToughness | attackStrengthExceedsUnitToughness | {} | BATTLE / boolean | 1 |
| attackTargetsUnitInFriendlyContagionRange | attackTargetsUnitInFriendlyContagionRange | {} | BATTLE / boolean | 1 |
| attackerWithinEighteen | attackerWithinEighteen | {} | BATTLE / boolean | 1 |
| battleRoundStart | battleRoundStart | {} | BATTLE / boolean | 2 |
| battleShockTest | battleShockTest | {} | BATTLE / boolean | 1 |
| battleShockTestPassed | battleShockTestPassed | {} | BATTLE / boolean | 2 |
| bearerMadePlagueWindAttacks | bearerMadePlagueWindAttacks | {} | BATTLE / boolean | 1 |
| bearerMeleeAttack | bearerMeleeAttack | {} | BATTLE / boolean | 1 |
| bearerUnitFinishedAttacks | bearerUnitFinishedAttacks | {} | BATTLE / boolean | 1 |
| bearerUnitFinishedFighting | bearerUnitFinishedFighting | {} | BATTLE / boolean | 1 |
| bearerUnitModelAttacks | bearerUnitModelAttacks | {} | BATTLE / boolean | 1 |
| bearerUnitNotEngaged | bearerUnitNotEngaged | {} | BATTLE / boolean | 1 |
| bearerUnitWithinControlledObjective | bearerUnitWithinControlledObjective | {} | BATTLE / boolean | 1 |
| belowStartingStrength | belowStartingStrength | {} | BATTLE / boolean | 1 |
| characterDestroyedByThoseAttacks | characterDestroyedByThoseAttacks | {} | BATTLE / boolean | 1 |
| controlsObjective | controlsObjective | {} | BATTLE / boolean | 1 |
| enemySelectedForMiasmicBombardment | enemySelectedForMiasmicBombardment | {} | BATTLE / boolean | 1 |
| enfeebledByBearerPestilentFallout | enfeebledByBearerPestilentFallout | {} | BATTLE / boolean | 1 |
| equipmentRequirementSatisfied | equipmentRequirementSatisfied | {} | ROSTER / boolean | 5 |
| fightPhaseStart | fightPhaseStart | {} | BATTLE / boolean | 1 |
| fireOverwatchSelected | fireOverwatchSelected | {} | BATTLE / boolean | 1 |
| inBearerUnitEngagementRange | inBearerUnitEngagementRange | {} | BATTLE / boolean | 1 |
| inStrategicReserves | inStrategicReserves | {} | BATTLE / boolean | 1 |
| isAfflicted | isAfflicted | {} | BATTLE / boolean | 2 |
| isBodyguardModel | isBodyguardModel | {} | ROSTER / boolean | 1 |
| memberOfBearerUnit | memberOfBearerUnit | {} | ROSTER / boolean | 2 |
| moreThanTwelveFromEveryFriendlyModelOnBattlefield | moreThanTwelveFromEveryFriendlyModelOnBattlefield | {} | BATTLE / boolean | 1 |
| nearFriendlyDeathGuardVehicle | nearFriendlyDeathGuardVehicle | {} | BATTLE / boolean | 1 |
| oncePerBattleAvailable | oncePerBattleAvailable | {} | BATTLE / boolean | 2 |
| oncePerBattlePerArmyAvailable | oncePerBattlePerArmyAvailable | {} | BATTLE / boolean | 1 |
| oncePerBattleRoundAvailable | oncePerBattleRoundAvailable | {} | BATTLE / boolean | 1 |
| opponentCommandBattleShockStep | opponentCommandBattleShockStep | {} | BATTLE / boolean | 1 |
| opponentCommandPhase | opponentCommandPhase | {} | BATTLE / boolean | 1 |
| opponentTurnEnd | opponentTurnEnd | {} | BATTLE / boolean | 1 |
| optionalAbilityActivated | optionalAbilityActivated | {} | BATTLE / boolean | 2 |
| optionalPlagueSelected | optionalPlagueSelected | {} | BATTLE / boolean | 1 |
| ownCommandPhase | ownCommandPhase | {} | BATTLE / boolean | 2 |
| ownCommandPhaseEnd | ownCommandPhaseEnd | {} | BATTLE / boolean | 1 |
| ownShootingPhaseStarted | ownShootingPhaseStarted | {} | BATTLE / boolean | 1 |
| plagueSelectedInBattleFormations | plagueSelectedInBattleFormations | {} | BATTLE / boolean | 1 |
| rangedAttackTargetsBearerVisibleEnemy | rangedAttackTargetsBearerVisibleEnemy | {} | BATTLE / boolean | 1 |
| rangedTargeting | rangedTargeting | {} | BATTLE / boolean | 1 |
| rollResultSixOrLess | rollResultSixOrLess | {} | BATTLE / boolean | 1 |
| securedObjectiveStillControlled | securedObjectiveStillControlled | {} | BATTLE / boolean | 1 |
| selectedInDeclareBattleFormations | selectedInDeclareBattleFormations | {} | BATTLE / boolean | 1 |
| sourceTableAllowsCurrentBattleRound | sourceTableAllowsCurrentBattleRound | {} | BATTLE / boolean | 1 |
| sourceTableSelectionCapSatisfied | sourceTableSelectionCapSatisfied | {} | BATTLE / boolean | 1 |
| targetingAfflictedEnemy | targetingAfflictedEnemy | {} | BATTLE / boolean | 1 |
| unitAdvanceRoll | unitAdvanceRoll | {} | BATTLE / boolean | 1 |
| unitBattleShockOrLeadershipTest | unitBattleShockOrLeadershipTest | {} | BATTLE / boolean | 1 |
| unitBeingSetUp | unitBeingSetUp | {} | BATTLE / boolean | 1 |
| unitFinishedFighting | unitFinishedFighting | {} | BATTLE / boolean | 1 |
| unitSelectedForVerminousHaze | unitSelectedForVerminousHaze | {} | BATTLE / boolean | 1 |
| unmodifiedHitRollFiveOrMore | unmodifiedHitRollFiveOrMore | {} | BATTLE / boolean | 1 |
| usingDeepStrikeSetup | usingDeepStrikeSetup | {} | BATTLE / boolean | 1 |
| usingTaintedNarthecium | usingTaintedNarthecium | {} | BATTLE / boolean | 1 |
| whollyWithinTwelveOfBearer | whollyWithinTwelveOfBearer | {} | BATTLE / boolean | 1 |
| withinBearerContagionRange | withinBearerContagionRange | {} | BATTLE / boolean | 1 |
| withinBearerUnitContagionRange | withinBearerUnitContagionRange | {} | BATTLE / boolean | 1 |
| withinSecuredObjectiveRange | withinSecuredObjectiveRange | {} | BATTLE / boolean | 1 |
| withinSevenOfFriendlyDeathGuard | withinSevenOfFriendlyDeathGuard | {} | BATTLE / boolean | 1 |
| withinSevenOfFriendlyPlagueLegions | withinSevenOfFriendlyPlagueLegions | {} | BATTLE / boolean | 1 |
| withinSixOfBearer | withinSixOfBearer | {} | BATTLE / boolean | 1 |
| withinThreeOfBearer | withinThreeOfBearer | {} | BATTLE / boolean | 1 |
| withinTwelveOfBearer | withinTwelveOfBearer | {} | BATTLE / boolean | 3 |

### emperors-children

| Old key | Canonical key | Parameters | Level / type | Occurrences |
| --- | --- | --- | --- | ---: |
| attached | attached | {} | ROSTER / boolean | 6 |
| equipmentRequirementSatisfied | equipmentRequirementSatisfied | {} | ROSTER / boolean | 12 |
| heroicInterventionSelected | heroicInterventionSelected | {} | BATTLE / boolean | 2 |
| lordOfHostDeclaredBattleline | initialAttachmentBattleline | {} | ROSTER / boolean | 4 |
| meleeAttack | meleeAttack | {} | BATTLE / boolean | 1 |
| meleeAttackTargetsCharacter | meleeAttackTargetsCharacter | {} | BATTLE / boolean | 1 |
| normalAdvanceFallBackMove | normalAdvanceFallBackMove | {} | BATTLE / boolean | 1 |
| possessedBladeFightUse | possessedBladeFightUse | {} | BATTLE / boolean | 1 |
| selectedUpgrade:detachment-carnival-of-excess:enhancement:3 | selectedUpgrade | {"selectionGroupId":"detachment-carnival-of-excess:enhancement:3","selectionMode":"VALIDATED_EQUIPPED_WEAPON"} | ROSTER / string | 39 |
| snapShootingAttack | snapShootingAttack | {} | BATTLE / boolean | 1 |
| unitAdvanceRoll | unitAdvanceRoll | {} | BATTLE / boolean | 1 |

### space-marines

| Old key | Canonical key | Parameters | Level / type | Occurrences |
| --- | --- | --- | --- | ---: |
| attached | attached | {} | ROSTER / boolean | 10 |
| equipmentRequirementSatisfied | equipmentRequirementSatisfied | {} | ROSTER / boolean | 10 |
| smEquipmentBearerSatisfied | equipmentBearerSatisfied | {"quantityProof":"POSITIVE_SELECTION","equipmentId":"ability-sm-097567b13c02404d"} | ROSTER / boolean | 1 |
| smEquipmentBearerSatisfied | equipmentBearerSatisfied | {"quantityProof":"POSITIVE_SELECTION","equipmentId":"ability-sm-431f22d15f7545b4"} | ROSTER / boolean | 1 |
| smEquipmentBearerSatisfied | equipmentBearerSatisfied | {"quantityProof":"POSITIVE_SELECTION","equipmentId":"ability-sm-63d4ca967fa64b79"} | ROSTER / boolean | 1 |
| smEquipmentBearerSatisfied | equipmentBearerSatisfied | {"quantityProof":"POSITIVE_SELECTION","equipmentId":"ability-sm-8c9e7e37a8494c1d"} | ROSTER / boolean | 1 |
| smEquipmentBearerSatisfied | equipmentBearerSatisfied | {"quantityProof":"POSITIVE_SELECTION","equipmentId":"ability-sm-aa81f0067a3140de"} | ROSTER / boolean | 1 |
| smEquipmentBearerSatisfied | equipmentBearerSatisfied | {"quantityProof":"POSITIVE_SELECTION","equipmentId":"ability-sm-daf87042d20348dd"} | ROSTER / boolean | 1 |
| smPermanentAssaultSource | permanentDoctrineSourcePresent | {} | ROSTER / boolean | 4 |

### tau-empire

| Old key | Canonical key | Parameters | Level / type | Occurrences |
| --- | --- | --- | --- | ---: |
| battleConditionSatisfied | battleConditionSatisfied | {} | BATTLE / boolean | 124 |
| equipmentRequirementSatisfied | equipmentRequirementSatisfied | {} | ROSTER / boolean | 10 |
| tauMarkerSelected | sourceEquipmentSelected | {"sourceEquipmentIdentity":"drone-marker-drone"} | ROSTER / boolean | 12 |

### tyranids

| Old key | Canonical key | Parameters | Level / type | Occurrences |
| --- | --- | --- | --- | ---: |
| attached | attached | {} | ROSTER / boolean | 2 |
| battleConditionSatisfied | battleConditionSatisfied | {} | BATTLE / boolean | 9 |
| selectedSurpriseAssaultChoice | selectedSourceChoice | {"ruleId":"detachment-subterranean-assault:rule"} | ROSTER / string | 4 |

## Existing roster conditions without a computer

This list is based on the exact parameterized plan and production adapter invocation, not the dictionary label alone. Explicit supplied context can still be known; absence must remain UNKNOWN.

| Book | Rule | Old key | Canonical key | Location |
| --- | --- | --- | --- | --- |
| adeptus-mechanicus | datasheet-archaeopter-fusilave:section:1 | commandUplinkEquipped | commandUplinkEquipped | /ruleContract/clauses/2/conditions/0 |
| adeptus-mechanicus | datasheet-archaeopter-stratoraptor:section:1 | commandUplinkEquipped | commandUplinkEquipped | /ruleContract/clauses/2/conditions/0 |
| adeptus-mechanicus | datasheet-archaeopter-transvector:section:1 | commandUplinkEquipped | commandUplinkEquipped | /ruleContract/clauses/2/conditions/0 |
| adeptus-mechanicus | datasheet-fulgurite-electro-priests:section:1 | characterModelLeadingSource | characterModelLeadingSource | /ruleContract/clauses/0/conditions/0 |
| adeptus-mechanicus | datasheet-hastarii-exterminators:section:3 | canAttachToReferencedUnit | canAttachToReferencedUnit | /ruleContract/clauses/0/roles/2/conditions/0 |
| adeptus-mechanicus | datasheet-hastarii-fusiliers:section:3 | canAttachToReferencedUnit | canAttachToReferencedUnit | /ruleContract/clauses/0/roles/2/conditions/0 |
| adeptus-mechanicus | datasheet-onager-dunecrawler:section:1 | broadSpectrumDataTetherEquipped | broadSpectrumDataTetherEquipped | /ruleContract/clauses/3/conditions/0 |
| adeptus-mechanicus | datasheet-servitor-battleclade:section:1 | containsTechPriestModel | containsTechPriestModel | /ruleContract/clauses/0/conditions/0 |
| adeptus-mechanicus | datasheet-servitor-battleclade:section:3 | canAttachToReferencedUnit | canAttachToReferencedUnit | /ruleContract/clauses/0/roles/2/conditions/0 |
| adeptus-mechanicus | datasheet-servitor-battleclade:wargear:1 | equipmentBearerLabel | equipmentBearerLabel | /ruleContract/clauses/0/conditions/0 |
| adeptus-mechanicus | datasheet-servitor-battleclade:wargear:2 | equipmentBearerLabel | equipmentBearerLabel | /ruleContract/clauses/0/conditions/0 |
| adeptus-mechanicus | detachment-luminen-auto-choir:rule | otherDataPsalmDetachmentSelected | otherDataPsalmDetachmentSelected | /ruleContract/clauses/2/conditions/0 |
| chaos-space-marines | army-rule-cult-of-the-dark-gods | armyFaction | armyFaction | /ruleContract/clauses/0/conditions/0 |
| chaos-space-marines | army-rule-cult-of-the-dark-gods | armyFaction | armyFaction | /ruleContract/clauses/0/roles/0/conditions/0 |
| chaos-space-marines | army-rule-cult-of-the-dark-gods | armyFaction | armyFaction | /ruleContract/roles/0/conditions/0 |
| chaos-space-marines | army-rule-dark-pacts | armyFaction | armyFaction | /ruleContract/clauses/0/conditions/1 |
| chaos-space-marines | army-rule-dark-pacts | armyFaction | armyFaction | /ruleContract/clauses/0/roles/0/conditions/1 |
| chaos-space-marines | army-rule-dark-pacts | armyFaction | armyFaction | /ruleContract/clauses/1/conditions/1 |
| chaos-space-marines | army-rule-dark-pacts | armyFaction | armyFaction | /ruleContract/clauses/1/recipients/0/conditions/1 |
| chaos-space-marines | army-rule-dark-pacts | armyFaction | armyFaction | /ruleContract/clauses/1/roles/0/conditions/1 |
| chaos-space-marines | army-rule-dark-pacts | armyFaction | armyFaction | /ruleContract/roles/0/conditions/1 |
| chaos-space-marines | datasheet-chaos-bikers:section:1:block:1:text | selectedEquipment:datasheet-chaos-bikers:wargear:4 | equipmentSelected | /ruleContract/clauses/0/conditions/0 |
| chaos-space-marines | datasheet-chaos-bikers:section:1:block:1:text | selectedEquipment:datasheet-chaos-bikers:wargear:4 | equipmentSelected | /ruleContract/clauses/0/roles/0/conditions/0 |
| chaos-space-marines | datasheet-chaos-bikers:section:1:block:1:text | selectedEquipment:datasheet-chaos-bikers:wargear:4 | equipmentSelected | /ruleContract/roles/0/conditions/0 |
| chaos-space-marines | datasheet-chosen:section:1:block:1:text | selectedEquipment:datasheet-chosen:wargear:5 | equipmentSelected | /ruleContract/clauses/0/conditions/0 |
| chaos-space-marines | datasheet-chosen:section:1:block:1:text | selectedEquipment:datasheet-chosen:wargear:5 | equipmentSelected | /ruleContract/clauses/0/roles/0/conditions/0 |
| chaos-space-marines | datasheet-chosen:section:1:block:1:text | selectedEquipment:datasheet-chosen:wargear:5 | equipmentSelected | /ruleContract/roles/0/conditions/0 |
| chaos-space-marines | datasheet-dark-apostle:section:1:block:0:text | containsProfile:datasheet-dark-apostle:profile:1 | sourceProfilePresent | /ruleContract/clauses/0/conditions/2 |
| chaos-space-marines | datasheet-dark-apostle:section:1:block:0:text | containsProfile:datasheet-dark-apostle:profile:1 | sourceProfilePresent | /ruleContract/clauses/0/roles/0/conditions/2 |
| chaos-space-marines | datasheet-dark-apostle:section:1:block:0:text | containsProfile:datasheet-dark-apostle:profile:1 | sourceProfilePresent | /ruleContract/roles/0/conditions/2 |
| chaos-space-marines | datasheet-dark-apostle:section:1:block:2:text | containsProfile:datasheet-dark-apostle:profile:2 | sourceProfilePresent | /ruleContract/clauses/0/conditions/1 |
| chaos-space-marines | datasheet-dark-apostle:section:1:block:2:text | containsProfile:datasheet-dark-apostle:profile:2 | sourceProfilePresent | /ruleContract/clauses/0/roles/0/conditions/1 |
| chaos-space-marines | datasheet-dark-apostle:section:1:block:2:text | containsProfile:datasheet-dark-apostle:profile:2 | sourceProfilePresent | /ruleContract/roles/0/conditions/1 |
| chaos-space-marines | datasheet-dark-commune:section:1:block:2:text | selectedEquipment:datasheet-dark-commune:section:2 | equipmentSelected | /ruleContract/clauses/0/conditions/0 |
| chaos-space-marines | datasheet-dark-commune:section:1:block:2:text | selectedEquipment:datasheet-dark-commune:section:2 | equipmentSelected | /ruleContract/clauses/0/roles/0/conditions/0 |
| chaos-space-marines | datasheet-dark-commune:section:1:block:2:text | compositionMemberId | compositionMemberId | /ruleContract/clauses/0/roles/0/conditions/2 |
| chaos-space-marines | datasheet-dark-commune:section:1:block:2:text | selectedEquipment:datasheet-dark-commune:section:2 | equipmentSelected | /ruleContract/roles/0/conditions/0 |
| chaos-space-marines | datasheet-dark-commune:section:1:block:2:text | compositionMemberId | compositionMemberId | /ruleContract/roles/0/conditions/2 |
| chaos-space-marines | datasheet-fabius-bile:section:1:block:0:text | isBodyguardComponentOfSource | isBodyguardComponentOfSource | /ruleContract/clauses/0/recipients/1/conditions/0 |
| chaos-space-marines | datasheet-fabius-bile:section:1:block:0:text | isBodyguardComponentOfSource | isBodyguardComponentOfSource | /ruleContract/clauses/0/roles/1/conditions/0 |
| chaos-space-marines | datasheet-fabius-bile:section:1:block:0:text | isBodyguardComponentOfSource | isBodyguardComponentOfSource | /ruleContract/clauses/1/recipients/1/conditions/0 |
| chaos-space-marines | datasheet-fabius-bile:section:1:block:0:text | isBodyguardComponentOfSource | isBodyguardComponentOfSource | /ruleContract/clauses/1/roles/1/conditions/0 |
| chaos-space-marines | datasheet-fabius-bile:section:1:block:0:text | isBodyguardComponentOfSource | isBodyguardComponentOfSource | /ruleContract/roles/1/conditions/0 |
| chaos-space-marines | datasheet-helbrute:section:1:block:1:text | twoAdditionalMeleeWeaponsEquipped | twoAdditionalMeleeWeaponsEquipped | /ruleContract/clauses/0/conditions/0 |
| chaos-space-marines | datasheet-helbrute:section:1:block:1:text | twoAdditionalMeleeWeaponsEquipped | twoAdditionalMeleeWeaponsEquipped | /ruleContract/clauses/0/recipients/1/conditions/0 |
| chaos-space-marines | datasheet-helbrute:section:1:block:1:text | twoAdditionalMeleeWeaponsEquipped | twoAdditionalMeleeWeaponsEquipped | /ruleContract/clauses/0/roles/0/conditions/0 |
| chaos-space-marines | datasheet-helbrute:section:1:block:1:text | twoAdditionalMeleeWeaponsEquipped | twoAdditionalMeleeWeaponsEquipped | /ruleContract/roles/0/conditions/0 |
| chaos-space-marines | datasheet-legionaries:section:1:block:1:text | selectedEquipment:datasheet-legionaries:wargear:3 | equipmentSelected | /ruleContract/clauses/0/conditions/0 |
| chaos-space-marines | datasheet-legionaries:section:1:block:1:text | selectedEquipment:datasheet-legionaries:wargear:3 | equipmentSelected | /ruleContract/clauses/0/roles/0/conditions/0 |
| chaos-space-marines | datasheet-legionaries:section:1:block:1:text | selectedEquipment:datasheet-legionaries:wargear:3 | equipmentSelected | /ruleContract/roles/0/conditions/0 |
| chaos-space-marines | datasheet-masters-of-the-maelstrom:section:1:block:0:text | compositionMemberId | compositionMemberId | /ruleContract/clauses/0/roles/1/conditions/0 |
| chaos-space-marines | datasheet-masters-of-the-maelstrom:section:1:block:0:text | compositionMemberId | compositionMemberId | /ruleContract/roles/1/conditions/0 |
| chaos-space-marines | datasheet-nemesis-claw:section:1:block:1:text | selectedEquipment:datasheet-nemesis-claw:wargear:6 | equipmentSelected | /ruleContract/clauses/0/conditions/0 |
| chaos-space-marines | datasheet-nemesis-claw:section:1:block:1:text | selectedEquipment:datasheet-nemesis-claw:wargear:6 | equipmentSelected | /ruleContract/clauses/0/roles/0/conditions/0 |
| chaos-space-marines | datasheet-nemesis-claw:section:1:block:1:text | selectedEquipment:datasheet-nemesis-claw:wargear:6 | equipmentSelected | /ruleContract/roles/0/conditions/0 |
| chaos-space-marines | datasheet-possessed:section:1:block:1:text | selectedEquipment:datasheet-possessed:wargear:1 | equipmentSelected | /ruleContract/clauses/0/conditions/0 |
| chaos-space-marines | datasheet-possessed:section:1:block:1:text | selectedEquipment:datasheet-possessed:wargear:1 | equipmentSelected | /ruleContract/clauses/0/roles/0/conditions/0 |
| chaos-space-marines | datasheet-possessed:section:1:block:1:text | selectedEquipment:datasheet-possessed:wargear:1 | equipmentSelected | /ruleContract/roles/0/conditions/0 |
| chaos-space-marines | datasheet-sorcerer-in-terminator-armour:section:1:block:2:text | selectedEquipment:datasheet-sorcerer-in-terminator-armour:wargear:2 | equipmentSelected | /ruleContract/clauses/0/conditions/0 |
| chaos-space-marines | datasheet-sorcerer-in-terminator-armour:section:1:block:2:text | selectedEquipment:datasheet-sorcerer-in-terminator-armour:wargear:2 | equipmentSelected | /ruleContract/clauses/0/roles/0/conditions/0 |
| chaos-space-marines | datasheet-sorcerer-in-terminator-armour:section:1:block:2:text | selectedEquipment:datasheet-sorcerer-in-terminator-armour:wargear:2 | equipmentSelected | /ruleContract/roles/0/conditions/0 |
| chaos-space-marines | datasheet-traitor-enforcer:section:1:block:0:text | containsProfile:datasheet-traitor-enforcer:profile:1 | sourceProfilePresent | /ruleContract/clauses/0/conditions/2 |
| chaos-space-marines | datasheet-traitor-enforcer:section:1:block:0:text | containsProfile:datasheet-traitor-enforcer:profile:1 | sourceProfilePresent | /ruleContract/clauses/0/roles/0/conditions/2 |
| chaos-space-marines | datasheet-traitor-enforcer:section:1:block:0:text | containsProfile:datasheet-traitor-enforcer:profile:1 | sourceProfilePresent | /ruleContract/roles/0/conditions/2 |
| chaos-space-marines | detachment-cabal-of-chaos:rule | memberOfEligibleUnit:detachment-cabal-of-chaos:rule:battle-branch-1 | memberOfEligibleUnit | /ruleContract/clauses/0/recipients/0/selector |
| chaos-space-marines | detachment-cabal-of-chaos:rule | memberOfEligibleUnit:detachment-cabal-of-chaos:rule:battle-branch-1 | memberOfEligibleUnit | /ruleContract/clauses/0/roles/1/selector |
| chaos-space-marines | detachment-cabal-of-chaos:rule | memberOfEligibleUnit:detachment-cabal-of-chaos:rule:battle-branch-2 | memberOfEligibleUnit | /ruleContract/clauses/1/recipients/0/selector |
| chaos-space-marines | detachment-cabal-of-chaos:rule | memberOfEligibleUnit:detachment-cabal-of-chaos:rule:battle-branch-2 | memberOfEligibleUnit | /ruleContract/clauses/1/roles/1/selector |
| chaos-space-marines | detachment-chaos-cult:enhancement:1 | memberOfUnitRole:detachment-chaos-cult:enhancement:1:bearer-unit | memberOfUnitRole | /ruleContract/clauses/0/recipients/0/selector/args/0/args/0 |
| chaos-space-marines | detachment-chaos-cult:enhancement:1 | sameUnitAsOwner:detachment-chaos-cult:enhancement:1 | sameUnitAsOwner | /ruleContract/clauses/0/roles/1/selector |
| chaos-space-marines | detachment-chaos-cult:enhancement:1 | memberOfUnitRole:detachment-chaos-cult:enhancement:1:bearer-unit | memberOfUnitRole | /ruleContract/clauses/0/roles/2/selector/args/0/args/0 |
| chaos-space-marines | detachment-chaos-cult:enhancement:2 | sameUnitAsOwner:detachment-chaos-cult:enhancement:2 | sameUnitAsOwner | /ruleContract/clauses/0/recipients/0/selector |
| chaos-space-marines | detachment-chaos-cult:enhancement:2 | sameUnitAsOwner:detachment-chaos-cult:enhancement:2 | sameUnitAsOwner | /ruleContract/clauses/0/roles/1/selector |
| chaos-space-marines | detachment-chaos-cult:enhancement:3 | memberOfUnitRole:detachment-chaos-cult:enhancement:3:bearer-unit | memberOfUnitRole | /ruleContract/clauses/0/recipients/0/selector/args/0 |
| chaos-space-marines | detachment-chaos-cult:enhancement:3 | sameUnitAsOwner:detachment-chaos-cult:enhancement:3 | sameUnitAsOwner | /ruleContract/clauses/0/roles/1/selector |
| chaos-space-marines | detachment-chaos-cult:enhancement:3 | memberOfUnitRole:detachment-chaos-cult:enhancement:3:bearer-unit | memberOfUnitRole | /ruleContract/clauses/0/roles/2/selector/args/0 |
| chaos-space-marines | detachment-chaos-cult:enhancement:4 | memberOfOwnerUnit:detachment-chaos-cult:enhancement:4 | memberOfOwnerUnit | /ruleContract/clauses/0/recipients/2/selector |
| chaos-space-marines | detachment-chaos-cult:enhancement:4 | memberOfOwnerUnit:detachment-chaos-cult:enhancement:4 | memberOfOwnerUnit | /ruleContract/clauses/0/roles/1/selector |
| chaos-space-marines | detachment-chaos-cult:enhancement:4 | memberOfOwnerUnit:detachment-chaos-cult:enhancement:4 | memberOfOwnerUnit | /ruleContract/clauses/0/rosterEffects/0/provenance/recipientSelector |
| chaos-space-marines | detachment-chaos-cult:enhancement:4 | memberOfOwnerUnit:detachment-chaos-cult:enhancement:4 | memberOfOwnerUnit | /ruleContract/clauses/0/rosterEffects/1/provenance/recipientSelector |
| chaos-space-marines | detachment-chaos-cult:rule | hasCanonicalDarkPacts:detachment-chaos-cult:rule | hasCanonicalDarkPacts | /ruleContract/clauses/1/conditions/1 |
| chaos-space-marines | detachment-chaos-cult:rule | memberOfEligibleUnit:detachment-chaos-cult:rule | memberOfEligibleUnit | /ruleContract/clauses/1/recipients/0/selector |
| chaos-space-marines | detachment-chaos-cult:rule | memberOfEligibleUnit:detachment-chaos-cult:rule | memberOfEligibleUnit | /ruleContract/clauses/1/roles/1/selector |
| chaos-space-marines | detachment-cult-of-the-arkifane:enhancement:2 | memberOfOwnerUnit:detachment-cult-of-the-arkifane:enhancement:2 | memberOfOwnerUnit | /ruleContract/clauses/0/recipients/2/selector |
| chaos-space-marines | detachment-cult-of-the-arkifane:enhancement:2 | memberOfOwnerUnit:detachment-cult-of-the-arkifane:enhancement:2 | memberOfOwnerUnit | /ruleContract/clauses/0/roles/1/selector |
| chaos-space-marines | detachment-cult-of-the-arkifane:enhancement:2 | memberOfOwnerUnit:detachment-cult-of-the-arkifane:enhancement:2 | memberOfOwnerUnit | /ruleContract/clauses/0/rosterEffects/0/provenance/recipientSelector |
| chaos-space-marines | detachment-cult-of-the-arkifane:enhancement:2 | memberOfOwnerUnit:detachment-cult-of-the-arkifane:enhancement:2 | memberOfOwnerUnit | /ruleContract/clauses/0/rosterEffects/1/provenance/recipientSelector |
| chaos-space-marines | detachment-cult-of-the-arkifane:rule | memberOfSelectedUnit:detachment-cult-of-the-arkifane:rule | memberOfSelectedUnit | /ruleContract/clauses/2/recipients/1/selector |
| chaos-space-marines | detachment-cult-of-the-arkifane:rule | memberOfSelectedUnit:detachment-cult-of-the-arkifane:rule | memberOfSelectedUnit | /ruleContract/clauses/2/roles/1/selector |
| chaos-space-marines | detachment-cult-of-the-arkifane:rule | memberOfSelectedUnit:detachment-cult-of-the-arkifane:rule | memberOfSelectedUnit | /ruleContract/clauses/2/rosterEffects/0/provenance/recipientSelector |
| chaos-space-marines | detachment-deceptors:rule | attachedToSelectedUnit:detachment-deceptors:rule | attachedToSelectedUnit | /ruleContract/clauses/1/recipients/1/conditions/0 |
| chaos-space-marines | detachment-deceptors:rule | attachedToSelectedUnit:detachment-deceptors:rule | attachedToSelectedUnit | /ruleContract/clauses/1/roles/1/conditions/0 |
| chaos-space-marines | detachment-devotees-of-destruction:enhancement:1 | sameUnitAsOwner:detachment-devotees-of-destruction:enhancement:1 | sameUnitAsOwner | /ruleContract/clauses/0/recipients/0/selector |
| chaos-space-marines | detachment-devotees-of-destruction:enhancement:1 | sameUnitAsOwner:detachment-devotees-of-destruction:enhancement:1 | sameUnitAsOwner | /ruleContract/clauses/0/roles/1/selector |
| chaos-space-marines | detachment-devotees-of-destruction:enhancement:1 | sameUnitAsOwner:detachment-devotees-of-destruction:enhancement:1 | sameUnitAsOwner | /ruleContract/clauses/1/recipients/0/selector |
| chaos-space-marines | detachment-devotees-of-destruction:enhancement:1 | sameUnitAsOwner:detachment-devotees-of-destruction:enhancement:1 | sameUnitAsOwner | /ruleContract/clauses/1/roles/1/selector |
| chaos-space-marines | detachment-devotees-of-destruction:enhancement:2 | sameUnitAsOwner:detachment-devotees-of-destruction:enhancement:2 | sameUnitAsOwner | /ruleContract/clauses/0/roles/1/selector |
| chaos-space-marines | detachment-devotees-of-destruction:enhancement:2 | sameUnitAsOwner:detachment-devotees-of-destruction:enhancement:2 | sameUnitAsOwner | /ruleContract/clauses/1/roles/1/selector |
| chaos-space-marines | detachment-dread-talons:enhancement:2 | memberOfOwnerUnit:detachment-dread-talons:enhancement:2 | memberOfOwnerUnit | /ruleContract/clauses/0/recipients/2/selector |
| chaos-space-marines | detachment-dread-talons:enhancement:2 | memberOfOwnerUnit:detachment-dread-talons:enhancement:2 | memberOfOwnerUnit | /ruleContract/clauses/0/roles/1/selector |
| chaos-space-marines | detachment-dread-talons:enhancement:2 | memberOfOwnerUnit:detachment-dread-talons:enhancement:2 | memberOfOwnerUnit | /ruleContract/clauses/0/rosterEffects/0/provenance/recipientSelector |
| chaos-space-marines | detachment-dread-talons:enhancement:2 | memberOfOwnerUnit:detachment-dread-talons:enhancement:2 | memberOfOwnerUnit | /ruleContract/clauses/0/rosterEffects/1/provenance/recipientSelector |
| chaos-space-marines | detachment-dread-talons:enhancement:3 | sameUnitAsOwner:detachment-dread-talons:enhancement:3 | sameUnitAsOwner | /ruleContract/clauses/0/recipients/0/selector |
| chaos-space-marines | detachment-dread-talons:enhancement:3 | sameUnitAsOwner:detachment-dread-talons:enhancement:3 | sameUnitAsOwner | /ruleContract/clauses/0/roles/1/selector |
| chaos-space-marines | detachment-fellhammer-siege-host:enhancement:1 | sameUnitAsOwner:detachment-fellhammer-siege-host:enhancement:1 | sameUnitAsOwner | /ruleContract/clauses/0/recipients/0/selector |
| chaos-space-marines | detachment-fellhammer-siege-host:enhancement:1 | sameUnitAsOwner:detachment-fellhammer-siege-host:enhancement:1 | sameUnitAsOwner | /ruleContract/clauses/0/roles/1/selector |
| chaos-space-marines | detachment-huron-s-marauders:enhancement:1 | sameUnitAsOwner:detachment-huron-s-marauders:enhancement:1 | sameUnitAsOwner | /ruleContract/clauses/0/recipients/0/selector |
| chaos-space-marines | detachment-huron-s-marauders:enhancement:1 | sameUnitAsOwner:detachment-huron-s-marauders:enhancement:1 | sameUnitAsOwner | /ruleContract/clauses/0/roles/1/selector |
| chaos-space-marines | detachment-huron-s-marauders:enhancement:2 | sameUnitAsOwner:detachment-huron-s-marauders:enhancement:2 | sameUnitAsOwner | /ruleContract/clauses/0/recipients/0/selector |
| chaos-space-marines | detachment-huron-s-marauders:enhancement:2 | sameUnitAsOwner:detachment-huron-s-marauders:enhancement:2 | sameUnitAsOwner | /ruleContract/clauses/0/roles/1/selector |
| chaos-space-marines | detachment-huron-s-marauders:enhancement:3 | sameUnitAsOwner:detachment-huron-s-marauders:enhancement:3 | sameUnitAsOwner | /ruleContract/clauses/0/recipients/1/selector |
| chaos-space-marines | detachment-huron-s-marauders:enhancement:3 | sameUnitAsOwner:detachment-huron-s-marauders:enhancement:3 | sameUnitAsOwner | /ruleContract/clauses/0/roles/1/selector |
| chaos-space-marines | detachment-huron-s-marauders:rule | memberOfEligibleUnit:detachment-huron-s-marauders:rule:table-2-row-1 | memberOfEligibleUnit | /ruleContract/clauses/1/recipients/0/selector |
| chaos-space-marines | detachment-huron-s-marauders:rule | memberOfEligibleUnit:detachment-huron-s-marauders:rule:table-2-row-1 | memberOfEligibleUnit | /ruleContract/clauses/1/roles/1/selector |
| chaos-space-marines | detachment-murdertalon-raiders:enhancement:1 | memberOfSelectedUnit:detachment-murdertalon-raiders:enhancement:1 | memberOfSelectedUnit | /ruleContract/clauses/0/recipients/2/selector |
| chaos-space-marines | detachment-murdertalon-raiders:enhancement:1 | sameUnitAsOwner:detachment-murdertalon-raiders:enhancement:1 | sameUnitAsOwner | /ruleContract/clauses/0/recipients/3/selector |
| chaos-space-marines | detachment-murdertalon-raiders:enhancement:1 | sameUnitAsOwner:detachment-murdertalon-raiders:enhancement:1 | sameUnitAsOwner | /ruleContract/clauses/0/roles/1/selector |
| chaos-space-marines | detachment-murdertalon-raiders:enhancement:1 | memberOfSelectedUnit:detachment-murdertalon-raiders:enhancement:1 | memberOfSelectedUnit | /ruleContract/clauses/0/roles/2/selector |
| chaos-space-marines | detachment-murdertalon-raiders:enhancement:1 | memberOfSelectedUnit:detachment-murdertalon-raiders:enhancement:1 | memberOfSelectedUnit | /ruleContract/clauses/0/rosterEffects/0/provenance/recipientSelector |
| chaos-space-marines | detachment-murdertalon-raiders:enhancement:1 | memberOfSelectedUnit:detachment-murdertalon-raiders:enhancement:1 | memberOfSelectedUnit | /ruleContract/clauses/0/rosterEffects/1/provenance/recipientSelector |
| chaos-space-marines | detachment-murdertalon-raiders:rule | memberOfEligibleUnit:detachment-murdertalon-raiders:rule:source-clause-1-1 | memberOfEligibleUnit | /ruleContract/clauses/0/recipients/0/selector |
| chaos-space-marines | detachment-murdertalon-raiders:rule | memberOfEligibleUnit:detachment-murdertalon-raiders:rule:source-clause-1-1 | memberOfEligibleUnit | /ruleContract/clauses/0/roles/1/selector |
| chaos-space-marines | detachment-nightmare-hunt:enhancement:1 | memberOfOwnerUnit:detachment-nightmare-hunt:enhancement:1 | memberOfOwnerUnit | /ruleContract/clauses/0/recipients/2/selector |
| chaos-space-marines | detachment-nightmare-hunt:enhancement:1 | memberOfOwnerUnit:detachment-nightmare-hunt:enhancement:1 | memberOfOwnerUnit | /ruleContract/clauses/0/roles/1/selector |
| chaos-space-marines | detachment-nightmare-hunt:enhancement:1 | memberOfOwnerUnit:detachment-nightmare-hunt:enhancement:1 | memberOfOwnerUnit | /ruleContract/clauses/0/rosterEffects/0/provenance/recipientSelector |
| chaos-space-marines | detachment-nightmare-hunt:enhancement:1 | memberOfOwnerUnit:detachment-nightmare-hunt:enhancement:1 | memberOfOwnerUnit | /ruleContract/clauses/0/rosterEffects/1/provenance/recipientSelector |
| chaos-space-marines | detachment-nightmare-hunt:enhancement:1 | sameUnitAsOwner:detachment-nightmare-hunt:enhancement:1 | sameUnitAsOwner | /ruleContract/clauses/1/recipients/0/selector |
| chaos-space-marines | detachment-nightmare-hunt:enhancement:1 | sameUnitAsOwner:detachment-nightmare-hunt:enhancement:1 | sameUnitAsOwner | /ruleContract/clauses/1/roles/1/selector |
| chaos-space-marines | detachment-nightmare-hunt:enhancement:2 | sameUnitAsOwner:detachment-nightmare-hunt:enhancement:2 | sameUnitAsOwner | /ruleContract/clauses/0/recipients/0/selector |
| chaos-space-marines | detachment-nightmare-hunt:enhancement:2 | sameUnitAsOwner:detachment-nightmare-hunt:enhancement:2 | sameUnitAsOwner | /ruleContract/clauses/0/roles/1/selector |
| chaos-space-marines | detachment-nightmare-hunt:enhancement:3 | sameUnitAsOwner:detachment-nightmare-hunt:enhancement:3 | sameUnitAsOwner | /ruleContract/clauses/0/recipients/1/selector |
| chaos-space-marines | detachment-nightmare-hunt:enhancement:3 | sameUnitAsOwner:detachment-nightmare-hunt:enhancement:3 | sameUnitAsOwner | /ruleContract/clauses/0/roles/1/selector |
| chaos-space-marines | detachment-nightmare-hunt:enhancement:4 | memberOfOwnerUnit:detachment-nightmare-hunt:enhancement:4 | memberOfOwnerUnit | /ruleContract/clauses/0/recipients/2/selector |
| chaos-space-marines | detachment-nightmare-hunt:enhancement:4 | memberOfOwnerUnit:detachment-nightmare-hunt:enhancement:4 | memberOfOwnerUnit | /ruleContract/clauses/0/roles/1/selector |
| chaos-space-marines | detachment-nightmare-hunt:enhancement:4 | memberOfOwnerUnit:detachment-nightmare-hunt:enhancement:4 | memberOfOwnerUnit | /ruleContract/clauses/0/rosterEffects/0/provenance/recipientSelector |
| chaos-space-marines | detachment-nightmare-hunt:enhancement:4 | memberOfOwnerUnit:detachment-nightmare-hunt:enhancement:4 | memberOfOwnerUnit | /ruleContract/clauses/0/rosterEffects/1/provenance/recipientSelector |
| chaos-space-marines | detachment-pactbound-zealots:enhancement:1 | sameUnitAsOwner:detachment-pactbound-zealots:enhancement:1 | sameUnitAsOwner | /ruleContract/clauses/0/roles/1/selector |
| chaos-space-marines | detachment-pactbound-zealots:enhancement:2 | sameUnitAsOwner:detachment-pactbound-zealots:enhancement:2 | sameUnitAsOwner | /ruleContract/clauses/1/recipients/1/selector |
| chaos-space-marines | detachment-pactbound-zealots:enhancement:2 | sameUnitAsOwner:detachment-pactbound-zealots:enhancement:2 | sameUnitAsOwner | /ruleContract/clauses/1/roles/1/selector |
| chaos-space-marines | detachment-pactbound-zealots:enhancement:3 | sameUnitAsOwner:detachment-pactbound-zealots:enhancement:3 | sameUnitAsOwner | /ruleContract/clauses/0/recipients/1/selector |
| chaos-space-marines | detachment-pactbound-zealots:enhancement:3 | sameUnitAsOwner:detachment-pactbound-zealots:enhancement:3 | sameUnitAsOwner | /ruleContract/clauses/0/roles/1/selector |
| chaos-space-marines | detachment-pactbound-zealots:enhancement:4 | sameUnitAsOwner:detachment-pactbound-zealots:enhancement:4 | sameUnitAsOwner | /ruleContract/clauses/1/roles/1/selector |
| chaos-space-marines | detachment-pactbound-zealots:rule | attachedUnitsShareSelectedMark:detachment-pactbound-zealots:rule | attachedUnitsShareSelectedMark | /ruleContract/clauses/12/conditions/0 |
| chaos-space-marines | detachment-pactbound-zealots:rule | memberOfEligibleUnit:detachment-pactbound-zealots:rule:source-clause-1-3 | memberOfEligibleUnit | /ruleContract/clauses/3/recipients/0/selector |
| chaos-space-marines | detachment-pactbound-zealots:rule | memberOfEligibleUnit:detachment-pactbound-zealots:rule:source-clause-1-3 | memberOfEligibleUnit | /ruleContract/clauses/3/roles/1/selector |
| chaos-space-marines | detachment-pactbound-zealots:rule | memberOfEligibleUnit:detachment-pactbound-zealots:rule:source-clause-1-4 | memberOfEligibleUnit | /ruleContract/clauses/4/recipients/0/selector |
| chaos-space-marines | detachment-pactbound-zealots:rule | memberOfEligibleUnit:detachment-pactbound-zealots:rule:source-clause-1-4 | memberOfEligibleUnit | /ruleContract/clauses/4/roles/1/selector |
| chaos-space-marines | detachment-pactbound-zealots:rule | memberOfEligibleUnit:detachment-pactbound-zealots:rule:source-clause-1-5 | memberOfEligibleUnit | /ruleContract/clauses/5/recipients/0/selector |
| chaos-space-marines | detachment-pactbound-zealots:rule | memberOfEligibleUnit:detachment-pactbound-zealots:rule:source-clause-1-5 | memberOfEligibleUnit | /ruleContract/clauses/5/roles/1/selector |
| chaos-space-marines | detachment-pactbound-zealots:rule | memberOfEligibleUnit:detachment-pactbound-zealots:rule:source-clause-1-7 | memberOfEligibleUnit | /ruleContract/clauses/7/recipients/0/selector |
| chaos-space-marines | detachment-pactbound-zealots:rule | memberOfEligibleUnit:detachment-pactbound-zealots:rule:source-clause-1-7 | memberOfEligibleUnit | /ruleContract/clauses/7/roles/1/selector |
| chaos-space-marines | detachment-pactbound-zealots:rule | memberOfEligibleUnit:detachment-pactbound-zealots:rule:source-clause-1-8 | memberOfEligibleUnit | /ruleContract/clauses/8/recipients/0/selector |
| chaos-space-marines | detachment-pactbound-zealots:rule | memberOfEligibleUnit:detachment-pactbound-zealots:rule:source-clause-1-8 | memberOfEligibleUnit | /ruleContract/clauses/8/roles/1/selector |
| chaos-space-marines | detachment-pactbound-zealots:rule | memberOfEligibleUnit:detachment-pactbound-zealots:rule:source-clause-1-9 | memberOfEligibleUnit | /ruleContract/clauses/9/recipients/0/selector |
| chaos-space-marines | detachment-pactbound-zealots:rule | memberOfEligibleUnit:detachment-pactbound-zealots:rule:source-clause-1-9 | memberOfEligibleUnit | /ruleContract/clauses/9/roles/1/selector |
| chaos-space-marines | detachment-renegade-raiders:enhancement:3 | memberOfOwnerUnit:detachment-renegade-raiders:enhancement:3 | memberOfOwnerUnit | /ruleContract/clauses/0/recipients/2/selector |
| chaos-space-marines | detachment-renegade-raiders:enhancement:3 | memberOfOwnerUnit:detachment-renegade-raiders:enhancement:3 | memberOfOwnerUnit | /ruleContract/clauses/0/roles/1/selector |
| chaos-space-marines | detachment-renegade-raiders:enhancement:3 | memberOfOwnerUnit:detachment-renegade-raiders:enhancement:3 | memberOfOwnerUnit | /ruleContract/clauses/0/rosterEffects/0/provenance/recipientSelector |
| chaos-space-marines | detachment-renegade-raiders:enhancement:3 | memberOfOwnerUnit:detachment-renegade-raiders:enhancement:3 | memberOfOwnerUnit | /ruleContract/clauses/0/rosterEffects/1/provenance/recipientSelector |
| chaos-space-marines | detachment-renegade-raiders:enhancement:4 | sameUnitAsOwner:detachment-renegade-raiders:enhancement:4 | sameUnitAsOwner | /ruleContract/clauses/0/recipients/0/selector |
| chaos-space-marines | detachment-renegade-raiders:enhancement:4 | sameUnitAsOwner:detachment-renegade-raiders:enhancement:4 | sameUnitAsOwner | /ruleContract/clauses/0/roles/1/selector |
| chaos-space-marines | detachment-renegade-warband:enhancement:2 | memberOfOwnerUnit:detachment-renegade-warband:enhancement:2 | memberOfOwnerUnit | /ruleContract/clauses/0/recipients/2/selector |
| chaos-space-marines | detachment-renegade-warband:enhancement:2 | memberOfOwnerUnit:detachment-renegade-warband:enhancement:2 | memberOfOwnerUnit | /ruleContract/clauses/0/roles/1/selector |
| chaos-space-marines | detachment-renegade-warband:enhancement:2 | memberOfOwnerUnit:detachment-renegade-warband:enhancement:2 | memberOfOwnerUnit | /ruleContract/clauses/0/rosterEffects/0/provenance/recipientSelector |
| chaos-space-marines | detachment-renegade-warband:enhancement:2 | memberOfOwnerUnit:detachment-renegade-warband:enhancement:2 | memberOfOwnerUnit | /ruleContract/clauses/0/rosterEffects/1/provenance/recipientSelector |
| chaos-space-marines | detachment-renegade-warband:enhancement:3 | memberOfUnitRole:detachment-renegade-warband:enhancement:3:bearer-unit | memberOfUnitRole | /ruleContract/clauses/0/recipients/0/selector |
| chaos-space-marines | detachment-renegade-warband:enhancement:3 | sameUnitAsOwner:detachment-renegade-warband:enhancement:3 | sameUnitAsOwner | /ruleContract/clauses/0/roles/1/selector |
| chaos-space-marines | detachment-renegade-warband:enhancement:3 | memberOfUnitRole:detachment-renegade-warband:enhancement:3:bearer-unit | memberOfUnitRole | /ruleContract/clauses/0/roles/2/selector |
| chaos-space-marines | detachment-soulforged-warpack:enhancement:3 | memberOfUnitRole:detachment-soulforged-warpack:enhancement:3:nearby-contract-unit | memberOfUnitRole | /ruleContract/clauses/2/recipients/0/selector |
| chaos-space-marines | detachment-soulforged-warpack:enhancement:3 | memberOfUnitRole:detachment-soulforged-warpack:enhancement:3:nearby-contract-unit | memberOfUnitRole | /ruleContract/clauses/2/roles/2/selector |
| chaos-space-marines | detachment-soulforged-warpack:rule | memberOfEligibleUnit:detachment-soulforged-warpack:rule:source-clause-1-2 | memberOfEligibleUnit | /ruleContract/clauses/1/recipients/0/selector |
| chaos-space-marines | detachment-soulforged-warpack:rule | memberOfEligibleUnit:detachment-soulforged-warpack:rule:source-clause-1-2 | memberOfEligibleUnit | /ruleContract/clauses/1/roles/1/selector |
| chaos-space-marines | detachment-soulforged-warpack:rule | memberOfEligibleUnit:detachment-soulforged-warpack:rule:source-clause-1-3 | memberOfEligibleUnit | /ruleContract/clauses/2/recipients/0/selector |
| chaos-space-marines | detachment-soulforged-warpack:rule | memberOfEligibleUnit:detachment-soulforged-warpack:rule:source-clause-1-3 | memberOfEligibleUnit | /ruleContract/clauses/2/roles/1/selector |
| chaos-space-marines | detachment-veterans-of-the-long-war:enhancement:1 | sameUnitAsOwner:detachment-veterans-of-the-long-war:enhancement:1 | sameUnitAsOwner | /ruleContract/clauses/0/recipients/0/selector |
| chaos-space-marines | detachment-veterans-of-the-long-war:enhancement:1 | sameUnitAsOwner:detachment-veterans-of-the-long-war:enhancement:1 | sameUnitAsOwner | /ruleContract/clauses/0/roles/1/selector |
| chaos-space-marines | detachment-veterans-of-the-long-war:enhancement:1 | memberOfUnitRole:detachment-veterans-of-the-long-war:enhancement:1:bearer-unit | memberOfUnitRole | /ruleContract/clauses/1/recipients/0/selector |
| chaos-space-marines | detachment-veterans-of-the-long-war:enhancement:1 | sameUnitAsOwner:detachment-veterans-of-the-long-war:enhancement:1 | sameUnitAsOwner | /ruleContract/clauses/1/recipients/1/selector |
| chaos-space-marines | detachment-veterans-of-the-long-war:enhancement:1 | memberOfUnitRole:detachment-veterans-of-the-long-war:enhancement:1:bearer-unit | memberOfUnitRole | /ruleContract/clauses/1/roles/1/selector |
| chaos-space-marines | detachment-veterans-of-the-long-war:enhancement:1 | sameUnitAsOwner:detachment-veterans-of-the-long-war:enhancement:1 | sameUnitAsOwner | /ruleContract/clauses/1/roles/2/selector |
| chaos-space-marines | detachment-warpstrike-champions:enhancement:1 | sameUnitAsOwner:detachment-warpstrike-champions:enhancement:1 | sameUnitAsOwner | /ruleContract/clauses/0/recipients/0/selector |
| chaos-space-marines | detachment-warpstrike-champions:enhancement:1 | sameUnitAsOwner:detachment-warpstrike-champions:enhancement:1 | sameUnitAsOwner | /ruleContract/clauses/0/roles/1/selector |
| chaos-space-marines | detachment-warpstrike-champions:enhancement:2 | sameUnitAsOwner:detachment-warpstrike-champions:enhancement:2 | sameUnitAsOwner | /ruleContract/clauses/0/recipients/0/selector |
| chaos-space-marines | detachment-warpstrike-champions:enhancement:2 | sameUnitAsOwner:detachment-warpstrike-champions:enhancement:2 | sameUnitAsOwner | /ruleContract/clauses/0/roles/1/selector |
| chaos-space-marines | detachment-warpstrike-champions:enhancement:3 | sameUnitAsOwner:detachment-warpstrike-champions:enhancement:3 | sameUnitAsOwner | /ruleContract/clauses/0/recipients/0/selector |
| chaos-space-marines | detachment-warpstrike-champions:enhancement:3 | sameUnitAsOwner:detachment-warpstrike-champions:enhancement:3 | sameUnitAsOwner | /ruleContract/clauses/0/roles/1/selector |
| chaos-space-marines | detachment-warpstrike-champions:enhancement:4 | sameUnitAsOwner:detachment-warpstrike-champions:enhancement:4 | sameUnitAsOwner | /ruleContract/clauses/1/roles/1/selector |
| death-guard | detachment-shamblerot-vectorium:enhancement:3 | memberOfBearerUnit | memberOfBearerUnit | /ruleContract/clauses/1/roles/0/selector/args/1 |
| death-guard | detachment-shamblerot-vectorium:enhancement:4 | memberOfBearerUnit | memberOfBearerUnit | /ruleContract/clauses/0/roles/0/selector/args/1 |

## Actual scenario trace measurements

These external measurements come from separate before/after execution captures. They are distinct from the static data translation and exact producer-inverse assertions above. Counts, observation coverage, hashes and zero-difference results are recorded only when supplied by that execution harness.

```json
{
  "status": "NOT_MEASURED",
  "reason": "Actual before/after scenario trace measurements have not been attached. Static translation and the producer inverse do not establish scenario parity."
}
```

## Computation ownership and Stratagem boundary

Existing computation kinds and parameters move to the shared plan without inventing availability. The CSM two-pass ability dependency sequence remains an execution requirement; its actual scenario results are separate QA evidence.

Every retained Stratagem key and affected Stratagem identity is listed per book in the JSON report. Legacy source declarations and the temporary inverse are not a runtime fallback for migrated rules.

## Evidence and limitations

- [books/blood-angels/v2/roster-runtime.mjs:6](../../books/blood-angels/v2/roster-runtime.mjs#L6): `createPhysicalEquipmentConditionContext`.
- [books/dark-angels/v2/roster-runtime.mjs:6](../../books/dark-angels/v2/roster-runtime.mjs#L6): `createPhysicalEquipmentConditionContext`.
- [books/dark-angels/v2/rule-contract-schema.mjs:6](../../books/dark-angels/v2/rule-contract-schema.mjs#L6): `createVerifiedPhysicalConditionContext`.
- [books/emperors-children/v2/rule-contract-choice-context.mjs:2](../../books/emperors-children/v2/rule-contract-choice-context.mjs#L2): `createEquippedWeaponChoiceConditionContext`.
- [books/emperors-children/v2/rule-contract-formation-context.mjs:3](../../books/emperors-children/v2/rule-contract-formation-context.mjs#L3): `createInitialAttachmentConditionContext`.
- [books/shared/roster-v2/condition-context.mjs:26](../../books/shared/roster-v2/condition-context.mjs#L26): `export function computeRosterCondition`.
- [books/shared/roster-v2/context.mjs:296](../../books/shared/roster-v2/context.mjs#L296): `export function predicateContext`.
- [books/shared/roster-v2/effects.mjs:370](../../books/shared/roster-v2/effects.mjs#L370): `equipmentRequirementSatisfied`.
- [books/shared/rule-contract-v2/conditions-build.mjs:63](../../books/shared/rule-contract-v2/conditions-build.mjs#L63): `export function compileBookConditions`.
- [books/shared/rule-contract-v2/conditions-build.mjs:86](../../books/shared/rule-contract-v2/conditions-build.mjs#L86): `export function conditionDeclarationView`.
- [books/shared/rule-contract-v2/conditions.mjs:504](../../books/shared/rule-contract-v2/conditions.mjs#L504): `export const conditionDefinitions`.
- [books/shared/rule-contract-v2/conditions.mjs:530](../../books/shared/rule-contract-v2/conditions.mjs#L530): `export function translateFieldArguments`.
- [books/space-marines/v2/roster-runtime.mjs:6](../../books/space-marines/v2/roster-runtime.mjs#L6): `createPhysicalEquipmentConditionContext`.
- [books/tau-empire/v2/roster-source-choices.mjs:6](../../books/tau-empire/v2/roster-source-choices.mjs#L6): `createSourceEquipmentConditionContext`.
- [books/tyranids/v2/roster-source-choices.mjs:3](../../books/tyranids/v2/roster-source-choices.mjs#L3): `createSelectedSourceChoiceConditionContext`.

- A computer can exist while a particular physical or historical context is unavailable. That remains UNKNOWN.
- A dictionary computedBy label alone is not evidence of an existing parameterized computation plan.
- Source-effect equipment checks are available only through their existing source execution context.
- Conditions inside immutable evidence values are source material, not a second executable condition vocabulary.
- Unused schema declarations mean unused in the frozen artifact; dynamic physical bindings can instantiate additional conditions later.
- Scenario truth parity, browser behavior and package certification are separate evidence; this inventory does not claim those tests passed.

Regenerate with `node tools/audit/condition-translation-report.mjs --write`; verify exact bytes with `--check`. Optional `--package FILE` and `--parity FILE` attach stable external measurements. Saved external measurements are reused when their options are omitted, including during `--check`; all repository inputs and static parity assertions are recomputed. A saved external measurement is an attestation, not a new execution of its harness.

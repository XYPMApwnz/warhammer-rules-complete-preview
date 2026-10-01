// Finite context vocabulary for the source-adjudicated DG foundation.
// Adding a field requires source review; unknown fields are INVALID, never UNKNOWN.
export const stateFields = Object.freeze({
  "withinEngagementRangeOfTriggeringEnemy": {
    "contextLevel": "BATTLE",
    "valueType": "boolean"
  },
  "additionalPlagueSelected": {
    "contextLevel": "BATTLE",
    "valueType": "boolean"
  },
  "afflicted": {
    "contextLevel": "BATTLE",
    "valueType": "boolean"
  },
  "afterAttackingUnitFinishedAttacks": {
    "contextLevel": "BATTLE",
    "valueType": "boolean"
  },
  "allocatedToModelInPrimaryUnit": {
    "contextLevel": "BATTLE",
    "valueType": "boolean"
  },
  "attached": {
    "contextLevel": "ROSTER",
    "valueType": "boolean"
  },
  "attackAllocatedToThisModel": {
    "contextLevel": "BATTLE",
    "valueType": "boolean"
  },
  "attackedPrimaryUnitThisPhase": {
    "contextLevel": "BATTLE",
    "valueType": "boolean"
  },
  "attackerWithinEighteen": {
    "contextLevel": "BATTLE",
    "valueType": "boolean"
  },
  "attacksFromSelectedAttackEvent": {
    "contextLevel": "BATTLE",
    "valueType": "boolean"
  },
  "attackStrengthExceedsUnitToughness": {
    "contextLevel": "BATTLE",
    "valueType": "boolean"
  },
  "attackTargetEnemyWithinEngagementRangeOfFriendlyPlagueLegionsUnit": {
    "contextLevel": "BATTLE",
    "valueType": "boolean"
  },
  "attackTargetsUnitInFriendlyContagionRange": {
    "contextLevel": "BATTLE",
    "valueType": "boolean"
  },
  "battleRoundStart": {
    "contextLevel": "BATTLE",
    "valueType": "boolean"
  },
  "battleShocked": {
    "contextLevel": "BATTLE",
    "valueType": "boolean"
  },
  "battleShockTest": {
    "contextLevel": "BATTLE",
    "valueType": "boolean"
  },
  "battleShockTestPassed": {
    "contextLevel": "BATTLE",
    "valueType": "boolean"
  },
  "bearerMadePlagueWindAttacks": {
    "contextLevel": "BATTLE",
    "valueType": "boolean"
  },
  "bearerMeleeAttack": {
    "contextLevel": "BATTLE",
    "valueType": "boolean"
  },
  "bearerUnitFinishedAttacks": {
    "contextLevel": "BATTLE",
    "valueType": "boolean"
  },
  "bearerUnitFinishedFighting": {
    "contextLevel": "BATTLE",
    "valueType": "boolean"
  },
  "bearerUnitModelAttacks": {
    "contextLevel": "BATTLE",
    "valueType": "boolean"
  },
  "bearerUnitNotEngaged": {
    "contextLevel": "BATTLE",
    "valueType": "boolean"
  },
  "bearerUnitWithinControlledObjective": {
    "contextLevel": "BATTLE",
    "valueType": "boolean"
  },
  "belowStartingStrength": {
    "contextLevel": "BATTLE",
    "valueType": "boolean"
  },
  "canBeLedByPrimary": {
    "contextLevel": "ROSTER",
    "valueType": "boolean"
  },
  "characterDestroyedByThoseAttacks": {
    "contextLevel": "BATTLE",
    "valueType": "boolean"
  },
  "controlsObjective": {
    "contextLevel": "BATTLE",
    "valueType": "boolean"
  },
  "destroyedThisPhase": {
    "contextLevel": "BATTLE",
    "valueType": "boolean"
  },
  "diceForPrimaryModelsDestroyedByThoseAttacks": {
    "contextLevel": "BATTLE",
    "valueType": "boolean"
  },
  "dicePerPrimaryModelWithinEngagementRangeOfSelectedEnemy": {
    "contextLevel": "BATTLE",
    "valueType": "boolean"
  },
  "enemiesWithinEngagementRangeOfPrimary": {
    "contextLevel": "BATTLE",
    "valueType": "boolean"
  },
  "enemyAttackTargetBelowStartingStrength": {
    "contextLevel": "BATTLE",
    "valueType": "boolean"
  },
  "enemyAttackTargetExcludesMonsterAndVehicle": {
    "contextLevel": "BATTLE",
    "valueType": "boolean"
  },
  "enemyAttackTargetWithinHalfRange": {
    "contextLevel": "BATTLE",
    "valueType": "boolean"
  },
  "enemyEngagedWithPrimary": {
    "contextLevel": "BATTLE",
    "valueType": "boolean"
  },
  "enemyFallBackSelection": {
    "contextLevel": "BATTLE",
    "valueType": "boolean"
  },
  "enemyModelLosesWoundWhileItsUnitEngagedWithPrimary": {
    "contextLevel": "BATTLE",
    "valueType": "boolean"
  },
  "enemyModelsDestroyedByThisStratagem": {
    "contextLevel": "BATTLE",
    "valueType": "boolean"
  },
  "enemySelectedForMiasmicBombardment": {
    "contextLevel": "BATTLE",
    "valueType": "boolean"
  },
  "enemyTargetExcludesAircraft": {
    "contextLevel": "BATTLE",
    "valueType": "boolean"
  },
  "enemyTargetInOpponentDeploymentZone": {
    "contextLevel": "BATTLE",
    "valueType": "boolean"
  },
  "enemyTargetSelectionJustFinished": {
    "contextLevel": "BATTLE",
    "valueType": "boolean"
  },
  "enfeebledByBearerPestilentFallout": {
    "contextLevel": "BATTLE",
    "valueType": "boolean"
  },
  "engaged": {
    "contextLevel": "BATTLE",
    "valueType": "boolean"
  },
  "engagedWithPrimary": {
    "contextLevel": "BATTLE",
    "valueType": "boolean"
  },
  "excludesVehicles": {
    "contextLevel": "BATTLE",
    "valueType": "boolean"
  },
  "failedLeadershipImpliesRemainStationary": {
    "contextLevel": "BATTLE",
    "valueType": "boolean"
  },
  "fightAfterAttackerFinishesThenRemove": {
    "contextLevel": "BATTLE",
    "valueType": "boolean"
  },
  "fightPhaseStart": {
    "contextLevel": "BATTLE",
    "valueType": "boolean"
  },
  "fireOverwatchSelected": {
    "contextLevel": "BATTLE",
    "valueType": "boolean"
  },
  "friendlyActionStarted": {
    "contextLevel": "BATTLE",
    "valueType": "boolean"
  },
  "friendlyAttackSelection": {
    "contextLevel": "BATTLE",
    "valueType": "boolean"
  },
  "friendlyChargeMoveJustEnded": {
    "contextLevel": "BATTLE",
    "valueType": "boolean"
  },
  "friendlyShootingSelection": {
    "contextLevel": "BATTLE",
    "valueType": "boolean"
  },
  "hasAtLeastTwoLeaderUnits": {
    "contextLevel": "ROSTER",
    "valueType": "boolean"
  },
  "hasFriendlyCharacterLeader": {
    "contextLevel": "ROSTER",
    "valueType": "boolean"
  },
  "hasLostWounds": {
    "contextLevel": "BATTLE",
    "valueType": "boolean"
  },
  "hasNotFoughtThisPhase": {
    "contextLevel": "BATTLE",
    "valueType": "boolean"
  },
  "identicalToDestroyedPrimaryUnit": {
    "contextLevel": "ROSTER",
    "valueType": "boolean"
  },
  "inBearerUnitEngagementRange": {
    "contextLevel": "BATTLE",
    "valueType": "boolean"
  },
  "inOpponentDeploymentZone": {
    "contextLevel": "BATTLE",
    "valueType": "boolean"
  },
  "inStrategicReserves": {
    "contextLevel": "BATTLE",
    "valueType": "boolean"
  },
  "isAfflicted": {
    "contextLevel": "BATTLE",
    "valueType": "boolean"
  },
  "isBodyguardModel": {
    "contextLevel": "ROSTER",
    "valueType": "boolean"
  },
  "isTriggerUnit": {
    "contextLevel": "BATTLE",
    "valueType": "boolean"
  },
  "isWarlord": {
    "contextLevel": "ROSTER",
    "valueType": "boolean"
  },
  "justDestroyed": {
    "contextLevel": "BATTLE",
    "valueType": "boolean"
  },
  "makesAttack": {
    "contextLevel": "BATTLE",
    "valueType": "boolean"
  },
  "meleeWeaponEquippedByPrimaryUnitModel": {
    "contextLevel": "ROSTER",
    "valueType": "boolean"
  },
  "memberOfBearerUnit": {
    "contextLevel": "ROSTER",
    "valueType": "boolean"
  },
  "memberOfPrimaryAttachedUnit": {
    "contextLevel": "ROSTER",
    "valueType": "boolean"
  },
  "memberOfPrimaryUnit": {
    "contextLevel": "ROSTER",
    "valueType": "boolean"
  },
  "modelFromYourArmy": {
    "contextLevel": "ROSTER",
    "valueType": "boolean"
  },
  "modelMemberOfPrimaryUnit": {
    "contextLevel": "ROSTER",
    "valueType": "boolean"
  },
  "moreThanTwelveFromEveryFriendlyModelOnBattlefield": {
    "contextLevel": "BATTLE",
    "valueType": "boolean"
  },
  "movementBeforeReinforcements": {
    "contextLevel": "BATTLE",
    "valueType": "boolean"
  },
  "movementStep": {
    "contextLevel": "BATTLE",
    "valueType": "string"
  },
  "nearFriendlyDeathGuardVehicle": {
    "contextLevel": "BATTLE",
    "valueType": "boolean"
  },
  "normalAdvanceOrChargeMove": {
    "contextLevel": "BATTLE",
    "valueType": "boolean"
  },
  "onBattlefield": {
    "contextLevel": "BATTLE",
    "valueType": "boolean"
  },
  "oncePerBattleAvailable": {
    "contextLevel": "BATTLE",
    "valueType": "boolean"
  },
  "oncePerBattlePerArmyAvailable": {
    "contextLevel": "BATTLE",
    "valueType": "boolean"
  },
  "oncePerBattleRoundAvailable": {
    "contextLevel": "BATTLE",
    "valueType": "boolean"
  },
  "opponentCommandBattleShockStep": {
    "contextLevel": "BATTLE",
    "valueType": "boolean"
  },
  "opponentCommandPhase": {
    "contextLevel": "BATTLE",
    "valueType": "boolean"
  },
  "opponentTurnEnd": {
    "contextLevel": "BATTLE",
    "valueType": "boolean"
  },
  "optionalAbilityActivated": {
    "contextLevel": "BATTLE",
    "valueType": "boolean"
  },
  "optionalPlagueSelected": {
    "contextLevel": "BATTLE",
    "valueType": "boolean"
  },
  "originalAttacker": {
    "contextLevel": "BATTLE",
    "valueType": "boolean"
  },
  "otherFriendlyUnit": {
    "contextLevel": "ROSTER",
    "valueType": "boolean"
  },
  "ownCommandPhase": {
    "contextLevel": "BATTLE",
    "valueType": "boolean"
  },
  "ownCommandPhaseEnd": {
    "contextLevel": "BATTLE",
    "valueType": "boolean"
  },
  "ownShootingPhaseStarted": {
    "contextLevel": "BATTLE",
    "valueType": "boolean"
  },
  "phase": {
    "contextLevel": "BATTLE",
    "valueType": "string"
  },
  "phaseWindow": {
    "contextLevel": "BATTLE",
    "valueType": "string"
  },
  "plagueSelectedInBattleFormations": {
    "contextLevel": "BATTLE",
    "valueType": "boolean"
  },
  "primaryMakesNormalAdvanceOrChargeMove": {
    "contextLevel": "BATTLE",
    "valueType": "boolean"
  },
  "primaryNotDestroyedAfterAttackerFought": {
    "contextLevel": "BATTLE",
    "valueType": "boolean"
  },
  "rangedAttackTargetIsAfflictedEnemyUnit": {
    "contextLevel": "BATTLE",
    "valueType": "boolean"
  },
  "rangedAttackTargetsBearerVisibleEnemy": {
    "contextLevel": "BATTLE",
    "valueType": "boolean"
  },
  "rangedTargeting": {
    "contextLevel": "BATTLE",
    "valueType": "boolean"
  },
  "rangedWeaponEquippedByPrimaryUnitModels": {
    "contextLevel": "ROSTER",
    "valueType": "boolean"
  },
  "rollResultSixOrLess": {
    "contextLevel": "BATTLE",
    "valueType": "boolean"
  },
  "sameActionStartedInTrigger": {
    "contextLevel": "BATTLE",
    "valueType": "boolean"
  },
  "securedObjectiveStillControlled": {
    "contextLevel": "BATTLE",
    "valueType": "boolean"
  },
  "selectedAsEnemyAttackTarget": {
    "contextLevel": "BATTLE",
    "valueType": "boolean"
  },
  "selectedEnemyDeclaresCharge": {
    "contextLevel": "BATTLE",
    "valueType": "boolean"
  },
  "selectedInDeclareBattleFormations": {
    "contextLevel": "BATTLE",
    "valueType": "boolean"
  },
  "selectedShootingEvent": {
    "contextLevel": "BATTLE",
    "valueType": "boolean"
  },
  "selectedToFallBack": {
    "contextLevel": "BATTLE",
    "valueType": "boolean"
  },
  "selectedToFightThisPhase": {
    "contextLevel": "BATTLE",
    "valueType": "boolean"
  },
  "selectedToMakeFallBackMove": {
    "contextLevel": "BATTLE",
    "valueType": "boolean"
  },
  "selectedToMoveOrChargeThisPhase": {
    "contextLevel": "BATTLE",
    "valueType": "boolean"
  },
  "selectedToShootOrFightThisPhase": {
    "contextLevel": "BATTLE",
    "valueType": "boolean"
  },
  "selectedToShootThisPhase": {
    "contextLevel": "BATTLE",
    "valueType": "boolean"
  },
  "selectsAnchoredEnemyAsRangedAttackTarget": {
    "contextLevel": "BATTLE",
    "valueType": "boolean"
  },
  "shieldEligibleTargetForThatAttack": {
    "contextLevel": "BATTLE",
    "valueType": "boolean"
  },
  "shieldVisibleToAttackingModel": {
    "contextLevel": "BATTLE",
    "valueType": "boolean"
  },
  "sourceTableAllowsCurrentBattleRound": {
    "contextLevel": "BATTLE",
    "valueType": "boolean"
  },
  "sourceTableSelectionCapSatisfied": {
    "contextLevel": "BATTLE",
    "valueType": "boolean"
  },
  "sufferedMortalWoundsFromThisDeadlyDemise": {
    "contextLevel": "BATTLE",
    "valueType": "boolean"
  },
  "targetingAfflictedEnemy": {
    "contextLevel": "BATTLE",
    "valueType": "boolean"
  },
  "targetsSelectedJustNow": {
    "contextLevel": "BATTLE",
    "valueType": "boolean"
  },
  "turnOwner": {
    "contextLevel": "BATTLE",
    "valueType": "string"
  },
  "unitAdvanceRoll": {
    "contextLevel": "BATTLE",
    "valueType": "boolean"
  },
  "unitBattleShockOrLeadershipTest": {
    "contextLevel": "BATTLE",
    "valueType": "boolean"
  },
  "unitBeingSetUp": {
    "contextLevel": "BATTLE",
    "valueType": "boolean"
  },
  "unitFinishedFighting": {
    "contextLevel": "BATTLE",
    "valueType": "boolean"
  },
  "unitSelectedForVerminousHaze": {
    "contextLevel": "BATTLE",
    "valueType": "boolean"
  },
  "unmodifiedHitRollFiveOrMore": {
    "contextLevel": "BATTLE",
    "valueType": "boolean"
  },
  "usedThisStratagemThisBattle": {
    "contextLevel": "BATTLE",
    "valueType": "boolean"
  },
  "usingDeepStrikeSetup": {
    "contextLevel": "BATTLE",
    "valueType": "boolean"
  },
  "usingTaintedNarthecium": {
    "contextLevel": "BATTLE",
    "valueType": "boolean"
  },
  "visibleEnemyAttackTarget": {
    "contextLevel": "BATTLE",
    "valueType": "boolean"
  },
  "visibleEnemyUnit": {
    "contextLevel": "BATTLE",
    "valueType": "boolean"
  },
  "visibleToAttackingUnit": {
    "contextLevel": "BATTLE",
    "valueType": "boolean"
  },
  "visibleToOneOrMorePrimaryModels": {
    "contextLevel": "BATTLE",
    "valueType": "boolean"
  },
  "visibleToPrimary": {
    "contextLevel": "BATTLE",
    "valueType": "boolean"
  },
  "visibleToPrimaryModel": {
    "contextLevel": "BATTLE",
    "valueType": "boolean"
  },
  "visibleToPrimaryUnit": {
    "contextLevel": "BATTLE",
    "valueType": "boolean"
  },
  "whollyWithinTwelveOfBearer": {
    "contextLevel": "BATTLE",
    "valueType": "boolean"
  },
  "within12OfPrimary": {
    "contextLevel": "BATTLE",
    "valueType": "boolean"
  },
  "within24OfPrimary": {
    "contextLevel": "BATTLE",
    "valueType": "boolean"
  },
  "within2HorizontalOfPrimary": {
    "contextLevel": "BATTLE",
    "valueType": "boolean"
  },
  "within30OfPrimaryModel": {
    "contextLevel": "BATTLE",
    "valueType": "boolean"
  },
  "within3OfPrimary": {
    "contextLevel": "BATTLE",
    "valueType": "boolean"
  },
  "within3OfPrimaryModel": {
    "contextLevel": "BATTLE",
    "valueType": "boolean"
  },
  "within3OfSelectedTerrain": {
    "contextLevel": "BATTLE",
    "valueType": "boolean"
  },
  "within5VerticalOfPrimary": {
    "contextLevel": "BATTLE",
    "valueType": "boolean"
  },
  "within6OfPrimary": {
    "contextLevel": "BATTLE",
    "valueType": "boolean"
  },
  "within8OfPrimary": {
    "contextLevel": "BATTLE",
    "valueType": "boolean"
  },
  "withinBearerContagionRange": {
    "contextLevel": "BATTLE",
    "valueType": "boolean"
  },
  "withinBearerUnitContagionRange": {
    "contextLevel": "BATTLE",
    "valueType": "boolean"
  },
  "withinContagionRangeOfPrimary": {
    "contextLevel": "BATTLE",
    "valueType": "boolean"
  },
  "withinEnemyEngagementRange": {
    "contextLevel": "BATTLE",
    "valueType": "boolean"
  },
  "withinEngagementRangeOfEnemyAttackRecipient": {
    "contextLevel": "BATTLE",
    "valueType": "boolean"
  },
  "withinEngagementRangeOfPrimary": {
    "contextLevel": "BATTLE",
    "valueType": "boolean"
  },
  "withinRangeOfSelectedObjective": {
    "contextLevel": "BATTLE",
    "valueType": "boolean"
  },
  "withinSecuredObjectiveRange": {
    "contextLevel": "BATTLE",
    "valueType": "boolean"
  },
  "withinSevenOfFriendlyDeathGuard": {
    "contextLevel": "BATTLE",
    "valueType": "boolean"
  },
  "withinSevenOfFriendlyPlagueLegions": {
    "contextLevel": "BATTLE",
    "valueType": "boolean"
  },
  "withinSixOfBearer": {
    "contextLevel": "BATTLE",
    "valueType": "boolean"
  },
  "withinThreeOfBearer": {
    "contextLevel": "BATTLE",
    "valueType": "boolean"
  },
  "withinTwelveOfBearer": {
    "contextLevel": "BATTLE",
    "valueType": "boolean"
  }
});

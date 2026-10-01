window.WH_BOOK_ROSTER_CATALOG=Object.freeze({
  "schema": "wh40k-army-roster-catalog/v1",
  "book": {
    "id": "tau-empire",
    "title": "T'au Empire",
    "factionKeyword": "T'AU EMPIRE",
    "parentBookId": null,
    "dependencies": []
  },
  "compositionConstraints": true,
  "statProfiles": true,
  "preserveMultipartStatProfiles": true,
  "units": [
    {
      "id": "unit-breacher-team",
      "title": "Breacher Team",
      "sourceBookId": "tau-empire",
      "sourceLayer": "codex",
      "intrinsicKeywords": [
        "Infantry",
        "Battleline",
        "Grenades",
        "Markerlight",
        "Fire Warrior",
        "Breacher Team",
        "T'au Empire"
      ],
      "relations": {
        "canLead": [],
        "canSupport": [],
        "canBeLedBy": [
          {
            "unitId": "unit-cadre-fireblade",
            "maxCharacters": 1
          },
          {
            "unitId": "unit-ethereal",
            "maxCharacters": 1
          }
        ],
        "canBeSupportedBy": []
      },
      "ruleFacts": {
        "relations": {
          "canLead": [],
          "canSupport": [],
          "canBeLedBy": [
            {
              "unitId": "unit-cadre-fireblade",
              "maxCharacters": 1
            },
            {
              "unitId": "unit-ethereal",
              "maxCharacters": 1
            }
          ],
          "canBeSupportedBy": []
        }
      },
      "gameSelections": {
        "stats": {
          "M": "6\"",
          "T": "3",
          "Sv": "4+",
          "W": "1",
          "Ld": "7+",
          "OC": "2",
          "Invulnerable": ""
        },
        "statProfiles": [
          {
            "id": "unit-breacher-team-stat-profile-931f3d2339",
            "title": "Breacher Fire Warrior",
            "stats": {
              "M": "6\"",
              "T": "3",
              "Sv": "4+",
              "W": "1",
              "Ld": "7+",
              "OC": "2",
              "Invulnerable": ""
            },
            "legacyIds": [
              "unit-breacher-team-stat-profile-breacher-fire-warrior"
            ]
          },
          {
            "id": "unit-breacher-team-stat-profile-083d18e754",
            "title": "Breacher Fire Warrior Shas'ui",
            "stats": {
              "M": "6\"",
              "T": "3",
              "Sv": "4+",
              "W": "1",
              "Ld": "7+",
              "OC": "2",
              "Invulnerable": ""
            },
            "legacyIds": [
              "unit-breacher-team-stat-profile-breacher-fire-warrior-shasui"
            ]
          }
        ],
        "abilities": [
          {
            "id": "tau-empire-ability-breach-and-clear",
            "sectionId": "tau-empire-ability-breach-and-clear",
            "title": "Breach and Clear",
            "text": "Each time a model in this unit makes a ranged attack that targets an enemy unit within range of an objective marker, you can re-roll the Wound roll.",
            "sourceUnitId": "unit-breacher-team"
          },
          {
            "id": "tau-empire-ability-ds8-support-turret",
            "sectionId": "tau-empire-ability-ds8-support-turret",
            "title": "DS8 Support Turret",
            "text": "In your Movement phase, if this unit Remains Stationary, until the start of your next Movement phase, its Fire Warrior Shas’ui model is equipped with the support turret missile system weapon.\nDesigner’s Note: Place a Support Turret token next to this unit to remind you.",
            "sourceUnitId": "unit-breacher-team"
          },
          {
            "id": "tau-empire-ability-for-the-greater-good",
            "sectionId": "tau-empire-ability-for-the-greater-good",
            "title": "For The Greater Good",
            "text": "If your Army Faction is T’AU EMPIRE, at the start of your Shooting phase you can select units from your army with this ability to become Observer units.\n\nDuring your Shooting phase, for each Observer unit from your army that has not been selected to shoot this phase and is eligible to shoot (excluding FORTIFICATION and Battle-shocked units) select one enemy unit that is visible to be marked as their Spotted unit until the end of the phase. Each enemy unit can only be marked as a Spotted unit once per phase.\n\nUnits from your army with the For the Greater Good ability (excluding Observer units) are Guided units while targeting one or more Spotted units.\n\nUntil the end of the phase, each time a model from your army in a Guided unit makes an attack that targets a Spotted unit, improve the Ballistic Skill characteristic of that attack by 1 and, if the Spotted unit was marked by an Observer unit that has the Markerlight keyword, that attack has the [IGNORES COVER] ability.",
            "sourceUnitId": "unit-breacher-team"
          }
        ],
        "models": [
          {
            "id": "unit-breacher-team-model-be956c5206",
            "title": "Breacher Fire Warriors",
            "aliases": [
              "Breacher Fire Warriors"
            ],
            "min": 9,
            "max": 9,
            "legacyIds": [
              "unit-breacher-team-model-breacher-fire-warriors"
            ]
          },
          {
            "id": "unit-breacher-team-model-a7a3087a51",
            "title": "Breacher Fire Warrior Shas'ui",
            "aliases": [
              "Breacher Fire Warrior Shas'ui"
            ],
            "min": 1,
            "max": 1,
            "legacyIds": [
              "unit-breacher-team-model-breacher-fire-warrior-shasui-2"
            ]
          }
        ],
        "compositionRules": [],
        "selections": [
          {
            "id": "unit-breacher-team-selection-pulse-pistol",
            "title": "Pulse pistol",
            "aliases": [
              "Pulse pistol"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-breacher-team-profile-648e20bb74"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-breacher-team-selection-close-combat-weapon",
            "title": "Close combat weapon",
            "aliases": [
              "Close combat weapon"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-breacher-team-profile-bfd73cc3f4"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-breacher-team-selection-pulse-blaster",
            "title": "Pulse blaster",
            "aliases": [
              "Pulse blaster"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-breacher-team-profile-0e727e6995"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-breacher-team-selection-support-turret",
            "title": "Support turret",
            "aliases": [
              "Support turret"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-breacher-team-profile-bee91b4558"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-breacher-team-selection-twin-pulse-carbine",
            "title": "Twin pulse carbine",
            "aliases": [
              "Twin pulse carbine"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-breacher-team-profile-f98da3d20a"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-breacher-team-selection-missile-pod",
            "title": "Missile pod",
            "aliases": [
              "Missile pod"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-breacher-team-profile-e5f2491af6"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-breacher-team-selection-marker-drone",
            "title": "Marker Drone",
            "aliases": [
              "Marker Drone"
            ],
            "kind": "wargear",
            "profileIds": [],
            "wargearAbilityIds": [
              "unit-breacher-team-wargear-ability-054fa4f2b6"
            ]
          },
          {
            "id": "unit-breacher-team-selection-shield-drone",
            "title": "Shield Drone",
            "aliases": [
              "Shield Drone"
            ],
            "kind": "wargear",
            "profileIds": [],
            "wargearAbilityIds": [
              "unit-breacher-team-wargear-ability-bc6aabc321"
            ]
          },
          {
            "id": "unit-breacher-team-selection-guardian-drone",
            "title": "Guardian Drone",
            "aliases": [
              "Guardian Drone"
            ],
            "kind": "wargear",
            "profileIds": [],
            "wargearAbilityIds": [
              "unit-breacher-team-wargear-ability-24a672615e"
            ]
          }
        ],
        "weaponFamilies": [],
        "weaponProfiles": [
          {
            "id": "unit-breacher-team-profile-648e20bb74",
            "legacyIds": [
              "unit-breacher-team-profile-pulse-pistol-ranged"
            ],
            "title": "Pulse pistol",
            "mode": "ranged",
            "range": "12\"",
            "a": "1",
            "skill": "4+",
            "s": "5",
            "ap": "0",
            "d": "1",
            "abilities": "Pistol",
            "sourceSelectionIds": [
              "unit-breacher-team-selection-pulse-pistol"
            ]
          },
          {
            "id": "unit-breacher-team-profile-bfd73cc3f4",
            "legacyIds": [
              "unit-breacher-team-profile-close-combat-weapon-melee-2"
            ],
            "title": "Close combat weapon",
            "mode": "melee",
            "range": "Melee",
            "a": "1",
            "skill": "5+",
            "s": "3",
            "ap": "0",
            "d": "1",
            "abilities": "",
            "sourceSelectionIds": [
              "unit-breacher-team-selection-close-combat-weapon"
            ]
          },
          {
            "id": "unit-breacher-team-profile-0e727e6995",
            "legacyIds": [
              "unit-breacher-team-profile-pulse-blaster-ranged-3"
            ],
            "title": "Pulse blaster",
            "mode": "ranged",
            "range": "10\"",
            "a": "2",
            "skill": "3+",
            "s": "6",
            "ap": "-1",
            "d": "1",
            "abilities": "Assault",
            "sourceSelectionIds": [
              "unit-breacher-team-selection-pulse-blaster"
            ]
          },
          {
            "id": "unit-breacher-team-profile-bee91b4558",
            "legacyIds": [
              "unit-breacher-team-profile-support-turret-ranged-4"
            ],
            "title": "Support turret",
            "mode": "ranged",
            "range": "30\"",
            "a": "2",
            "skill": "5+",
            "s": "5",
            "ap": "0",
            "d": "1",
            "abilities": "Indirect Fire, Twin-linked",
            "sourceSelectionIds": [
              "unit-breacher-team-selection-support-turret"
            ]
          },
          {
            "id": "unit-breacher-team-profile-f98da3d20a",
            "legacyIds": [
              "unit-breacher-team-profile-twin-pulse-carbine-ranged-5"
            ],
            "title": "Twin pulse carbine",
            "mode": "ranged",
            "range": "20\"",
            "a": "2",
            "skill": "5+",
            "s": "5",
            "ap": "0",
            "d": "1",
            "abilities": "Assault, Twin-linked",
            "sourceSelectionIds": [
              "unit-breacher-team-selection-twin-pulse-carbine"
            ]
          },
          {
            "id": "unit-breacher-team-profile-e5f2491af6",
            "legacyIds": [
              "unit-breacher-team-profile-missile-pod-ranged-6"
            ],
            "title": "Missile pod",
            "mode": "ranged",
            "range": "30\"",
            "a": "2",
            "skill": "5+",
            "s": "7",
            "ap": "-1",
            "d": "2",
            "abilities": "",
            "sourceSelectionIds": [
              "unit-breacher-team-selection-missile-pod"
            ]
          }
        ],
        "wargearAbilities": [
          {
            "id": "unit-breacher-team-wargear-ability-054fa4f2b6",
            "sectionId": "unit-breacher-team-wargear-ability-054fa4f2b6",
            "title": "Marker Drone",
            "text": "The bearer’s unit has the Markerlight keyword and can act as an Observer unit for another unit even if it Advanced this turn.",
            "sourceUnitId": "unit-breacher-team",
            "legacyIds": [
              "unit-breacher-team-wargear-ability-marker-drone"
            ],
            "requiredSelectionIds": [
              "unit-breacher-team-selection-marker-drone"
            ]
          },
          {
            "id": "unit-breacher-team-wargear-ability-bc6aabc321",
            "sectionId": "unit-breacher-team-wargear-ability-bc6aabc321",
            "title": "Shield Drone",
            "text": "Add 1 to the bearer’s Wounds characteristic.",
            "sourceUnitId": "unit-breacher-team",
            "legacyIds": [
              "unit-breacher-team-wargear-ability-shield-drone-2"
            ],
            "requiredSelectionIds": [
              "unit-breacher-team-selection-shield-drone"
            ]
          },
          {
            "id": "unit-breacher-team-wargear-ability-24a672615e",
            "sectionId": "unit-breacher-team-wargear-ability-24a672615e",
            "title": "Guardian Drone",
            "text": "Each time a model makes a ranged attack that targets the bearer’s unit, subtract 1 from the Wound roll.",
            "sourceUnitId": "unit-breacher-team",
            "legacyIds": [
              "unit-breacher-team-wargear-ability-guardian-drone-3"
            ],
            "requiredSelectionIds": [
              "unit-breacher-team-selection-guardian-drone"
            ]
          }
        ],
        "wargearDefaults": [
          {
            "modelId": "unit-breacher-team-model-be956c5206",
            "selections": [
              {
                "selectionId": "unit-breacher-team-selection-pulse-blaster",
                "quantity": 1
              },
              {
                "selectionId": "unit-breacher-team-selection-pulse-pistol",
                "quantity": 1
              },
              {
                "selectionId": "unit-breacher-team-selection-close-combat-weapon",
                "quantity": 1
              }
            ]
          },
          {
            "modelId": "unit-breacher-team-model-a7a3087a51",
            "selections": [
              {
                "selectionId": "unit-breacher-team-selection-pulse-blaster",
                "quantity": 1
              },
              {
                "selectionId": "unit-breacher-team-selection-pulse-pistol",
                "quantity": 1
              },
              {
                "selectionId": "unit-breacher-team-selection-close-combat-weapon",
                "quantity": 1
              }
            ]
          }
        ],
        "wargearOptionContracts": [
          {
            "sourceId": "datasheet-breacher-team:wargear:1",
            "eligibleModelIds": [
              "unit-breacher-team-model-a7a3087a51"
            ],
            "limit": {
              "perModel": 2
            },
            "choices": [
              {
                "remove": [],
                "add": [
                  {
                    "selectionId": "unit-breacher-team-selection-guardian-drone",
                    "quantity": 1
                  }
                ],
                "requiresFinal": [],
                "forbidsFinal": [],
                "sharedUses": [
                  "datasheet-breacher-team:wargear:1:guardian"
                ]
              },
              {
                "remove": [],
                "add": [
                  {
                    "selectionId": "unit-breacher-team-selection-twin-pulse-carbine",
                    "quantity": 1
                  }
                ],
                "requiresFinal": [],
                "forbidsFinal": [],
                "sharedUses": []
              },
              {
                "remove": [],
                "add": [
                  {
                    "selectionId": "unit-breacher-team-selection-marker-drone",
                    "quantity": 1
                  }
                ],
                "requiresFinal": [],
                "forbidsFinal": [],
                "sharedUses": []
              },
              {
                "remove": [],
                "add": [
                  {
                    "selectionId": "unit-breacher-team-selection-shield-drone",
                    "quantity": 1
                  }
                ],
                "requiresFinal": [],
                "forbidsFinal": [],
                "sharedUses": []
              }
            ]
          }
        ],
        "wargearSharedCaps": [
          {
            "id": "datasheet-breacher-team:wargear:1:guardian",
            "max": 1,
            "scope": "model"
          }
        ]
      }
    },
    {
      "id": "unit-strike-team",
      "title": "Strike Team",
      "sourceBookId": "tau-empire",
      "sourceLayer": "codex",
      "intrinsicKeywords": [
        "Infantry",
        "Battleline",
        "Grenades",
        "Markerlight",
        "Fire Warrior",
        "Strike Team",
        "T'au Empire"
      ],
      "relations": {
        "canLead": [],
        "canSupport": [],
        "canBeLedBy": [
          {
            "unitId": "unit-cadre-fireblade",
            "maxCharacters": 1
          },
          {
            "unitId": "unit-ethereal",
            "maxCharacters": 1
          }
        ],
        "canBeSupportedBy": []
      },
      "ruleFacts": {
        "relations": {
          "canLead": [],
          "canSupport": [],
          "canBeLedBy": [
            {
              "unitId": "unit-cadre-fireblade",
              "maxCharacters": 1
            },
            {
              "unitId": "unit-ethereal",
              "maxCharacters": 1
            }
          ],
          "canBeSupportedBy": []
        }
      },
      "gameSelections": {
        "stats": {
          "M": "6\"",
          "T": "3",
          "Sv": "4+",
          "W": "1",
          "Ld": "7+",
          "OC": "2",
          "Invulnerable": ""
        },
        "statProfiles": [
          {
            "id": "unit-strike-team-stat-profile-e525885a36",
            "title": "Strike Team",
            "stats": {
              "M": "6\"",
              "T": "3",
              "Sv": "4+",
              "W": "1",
              "Ld": "7+",
              "OC": "2",
              "Invulnerable": ""
            },
            "legacyIds": [
              "unit-strike-team-stat-profile-strike-team"
            ]
          },
          {
            "id": "unit-strike-team-stat-profile-f3ae893d84",
            "title": "Fire Warrior Shas'ui",
            "stats": {
              "M": "6\"",
              "T": "3",
              "Sv": "4+",
              "W": "1",
              "Ld": "7+",
              "OC": "2",
              "Invulnerable": ""
            },
            "legacyIds": [
              "unit-strike-team-stat-profile-fire-warrior-shasui"
            ]
          }
        ],
        "abilities": [
          {
            "id": "tau-empire-ability-suppression-volley",
            "sectionId": "tau-empire-ability-suppression-volley",
            "title": "Suppression Volley",
            "text": "In your Shooting phase, after this unit has shot, select one enemy INFANTRY unit hit by one or more of those attacks. Until the start of your next turn, while this unit is on the battlefield, that enemy unit is suppressed. While a unit is suppressed, each time a model in that unit makes an attack, subtract 1 from the Hit roll.",
            "sourceUnitId": "unit-strike-team"
          },
          {
            "id": "tau-empire-ability-ds8-support-turret",
            "sectionId": "tau-empire-ability-ds8-support-turret",
            "title": "DS8 Support Turret",
            "text": "In your Movement phase, if this unit Remains Stationary, until the start of your next Movement phase, its Fire Warrior Shas’ui model is equipped with the support turret missile system weapon.\nDesigner’s Note: Place a Support Turret token next to this unit to remind you.",
            "sourceUnitId": "unit-strike-team"
          },
          {
            "id": "tau-empire-ability-for-the-greater-good",
            "sectionId": "tau-empire-ability-for-the-greater-good",
            "title": "For The Greater Good",
            "text": "If your Army Faction is T’AU EMPIRE, at the start of your Shooting phase you can select units from your army with this ability to become Observer units.\n\nDuring your Shooting phase, for each Observer unit from your army that has not been selected to shoot this phase and is eligible to shoot (excluding FORTIFICATION and Battle-shocked units) select one enemy unit that is visible to be marked as their Spotted unit until the end of the phase. Each enemy unit can only be marked as a Spotted unit once per phase.\n\nUnits from your army with the For the Greater Good ability (excluding Observer units) are Guided units while targeting one or more Spotted units.\n\nUntil the end of the phase, each time a model from your army in a Guided unit makes an attack that targets a Spotted unit, improve the Ballistic Skill characteristic of that attack by 1 and, if the Spotted unit was marked by an Observer unit that has the Markerlight keyword, that attack has the [IGNORES COVER] ability.",
            "sourceUnitId": "unit-strike-team"
          }
        ],
        "models": [
          {
            "id": "unit-strike-team-model-f9647357a8",
            "title": "Fire Warriors",
            "aliases": [
              "Fire Warriors",
              "Fire Warrior w/ pulse carbine",
              "Fire Warrior w/ pulse rifle"
            ],
            "min": 9,
            "max": 9,
            "legacyIds": [
              "unit-strike-team-model-fire-warriors"
            ]
          },
          {
            "id": "unit-strike-team-model-eb1dbfb325",
            "title": "Fire Warrior Shas'ui",
            "aliases": [
              "Fire Warrior Shas'ui"
            ],
            "min": 1,
            "max": 1,
            "legacyIds": [
              "unit-strike-team-model-fire-warrior-shasui-2"
            ]
          }
        ],
        "compositionRules": [],
        "selections": [
          {
            "id": "unit-strike-team-selection-pulse-carbine",
            "title": "Pulse carbine",
            "aliases": [
              "Pulse carbine"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-strike-team-profile-baa2397d8c"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-strike-team-selection-pulse-pistol",
            "title": "Pulse pistol",
            "aliases": [
              "Pulse pistol"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-strike-team-profile-648e20bb74"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-strike-team-selection-close-combat-weapon",
            "title": "Close combat weapon",
            "aliases": [
              "Close combat weapon"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-strike-team-profile-bfd73cc3f4"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-strike-team-selection-pulse-rifle",
            "title": "Pulse rifle",
            "aliases": [
              "Pulse rifle"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-strike-team-profile-21caa4d4d3"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-strike-team-selection-support-turret",
            "title": "Support turret",
            "aliases": [
              "Support turret"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-strike-team-profile-bee91b4558"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-strike-team-selection-twin-pulse-carbine",
            "title": "Twin pulse carbine",
            "aliases": [
              "Twin pulse carbine"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-strike-team-profile-f98da3d20a"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-strike-team-selection-missile-pod",
            "title": "Missile pod",
            "aliases": [
              "Missile pod"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-strike-team-profile-e5f2491af6"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-strike-team-selection-marker-drone",
            "title": "Marker Drone",
            "aliases": [
              "Marker Drone"
            ],
            "kind": "wargear",
            "profileIds": [],
            "wargearAbilityIds": [
              "unit-strike-team-wargear-ability-054fa4f2b6"
            ]
          },
          {
            "id": "unit-strike-team-selection-shield-drone",
            "title": "Shield Drone",
            "aliases": [
              "Shield Drone"
            ],
            "kind": "wargear",
            "profileIds": [],
            "wargearAbilityIds": [
              "unit-strike-team-wargear-ability-bc6aabc321"
            ]
          },
          {
            "id": "unit-strike-team-selection-guardian-drone",
            "title": "Guardian Drone",
            "aliases": [
              "Guardian Drone"
            ],
            "kind": "wargear",
            "profileIds": [],
            "wargearAbilityIds": [
              "unit-strike-team-wargear-ability-24a672615e"
            ]
          }
        ],
        "weaponFamilies": [],
        "weaponProfiles": [
          {
            "id": "unit-strike-team-profile-baa2397d8c",
            "legacyIds": [
              "unit-strike-team-profile-pulse-carbine-ranged"
            ],
            "title": "Pulse carbine",
            "mode": "ranged",
            "range": "20\"",
            "a": "2",
            "skill": "4+",
            "s": "5",
            "ap": "0",
            "d": "1",
            "abilities": "",
            "sourceSelectionIds": [
              "unit-strike-team-selection-pulse-carbine"
            ]
          },
          {
            "id": "unit-strike-team-profile-648e20bb74",
            "legacyIds": [
              "unit-strike-team-profile-pulse-pistol-ranged-2"
            ],
            "title": "Pulse pistol",
            "mode": "ranged",
            "range": "12\"",
            "a": "1",
            "skill": "4+",
            "s": "5",
            "ap": "0",
            "d": "1",
            "abilities": "Pistol",
            "sourceSelectionIds": [
              "unit-strike-team-selection-pulse-pistol"
            ]
          },
          {
            "id": "unit-strike-team-profile-bfd73cc3f4",
            "legacyIds": [
              "unit-strike-team-profile-close-combat-weapon-melee-3"
            ],
            "title": "Close combat weapon",
            "mode": "melee",
            "range": "Melee",
            "a": "1",
            "skill": "5+",
            "s": "3",
            "ap": "0",
            "d": "1",
            "abilities": "",
            "sourceSelectionIds": [
              "unit-strike-team-selection-close-combat-weapon"
            ]
          },
          {
            "id": "unit-strike-team-profile-21caa4d4d3",
            "legacyIds": [
              "unit-strike-team-profile-pulse-rifle-ranged-4"
            ],
            "title": "Pulse rifle",
            "mode": "ranged",
            "range": "30\"",
            "a": "1",
            "skill": "4+",
            "s": "5",
            "ap": "0",
            "d": "1",
            "abilities": "Rapid Fire 1",
            "sourceSelectionIds": [
              "unit-strike-team-selection-pulse-rifle"
            ]
          },
          {
            "id": "unit-strike-team-profile-bee91b4558",
            "legacyIds": [
              "unit-strike-team-profile-support-turret-ranged-5"
            ],
            "title": "Support turret",
            "mode": "ranged",
            "range": "30\"",
            "a": "2",
            "skill": "5+",
            "s": "5",
            "ap": "0",
            "d": "1",
            "abilities": "Indirect Fire, Twin-linked",
            "sourceSelectionIds": [
              "unit-strike-team-selection-support-turret"
            ]
          },
          {
            "id": "unit-strike-team-profile-f98da3d20a",
            "legacyIds": [
              "unit-strike-team-profile-twin-pulse-carbine-ranged-6"
            ],
            "title": "Twin pulse carbine",
            "mode": "ranged",
            "range": "20\"",
            "a": "2",
            "skill": "5+",
            "s": "5",
            "ap": "0",
            "d": "1",
            "abilities": "Assault, Twin-linked",
            "sourceSelectionIds": [
              "unit-strike-team-selection-twin-pulse-carbine"
            ]
          },
          {
            "id": "unit-strike-team-profile-e5f2491af6",
            "legacyIds": [
              "unit-strike-team-profile-missile-pod-ranged-7"
            ],
            "title": "Missile pod",
            "mode": "ranged",
            "range": "30\"",
            "a": "2",
            "skill": "5+",
            "s": "7",
            "ap": "-1",
            "d": "2",
            "abilities": "",
            "sourceSelectionIds": [
              "unit-strike-team-selection-missile-pod"
            ]
          }
        ],
        "wargearAbilities": [
          {
            "id": "unit-strike-team-wargear-ability-054fa4f2b6",
            "sectionId": "unit-strike-team-wargear-ability-054fa4f2b6",
            "title": "Marker Drone",
            "text": "The bearer’s unit has the Markerlight keyword and can act as an Observer unit for another unit even if it Advanced this turn.",
            "sourceUnitId": "unit-strike-team",
            "legacyIds": [
              "unit-strike-team-wargear-ability-marker-drone"
            ],
            "requiredSelectionIds": [
              "unit-strike-team-selection-marker-drone"
            ]
          },
          {
            "id": "unit-strike-team-wargear-ability-bc6aabc321",
            "sectionId": "unit-strike-team-wargear-ability-bc6aabc321",
            "title": "Shield Drone",
            "text": "Add 1 to the bearer’s Wounds characteristic.",
            "sourceUnitId": "unit-strike-team",
            "legacyIds": [
              "unit-strike-team-wargear-ability-shield-drone-2"
            ],
            "requiredSelectionIds": [
              "unit-strike-team-selection-shield-drone"
            ]
          },
          {
            "id": "unit-strike-team-wargear-ability-24a672615e",
            "sectionId": "unit-strike-team-wargear-ability-24a672615e",
            "title": "Guardian Drone",
            "text": "Each time a model makes a ranged attack that targets the bearer’s unit, subtract 1 from the Wound roll.",
            "sourceUnitId": "unit-strike-team",
            "legacyIds": [
              "unit-strike-team-wargear-ability-guardian-drone-3"
            ],
            "requiredSelectionIds": [
              "unit-strike-team-selection-guardian-drone"
            ]
          }
        ],
        "wargearDefaults": [
          {
            "modelId": "unit-strike-team-model-f9647357a8",
            "selections": [
              {
                "selectionId": "unit-strike-team-selection-pulse-pistol",
                "quantity": 1
              },
              {
                "selectionId": "unit-strike-team-selection-pulse-rifle",
                "quantity": 1
              },
              {
                "selectionId": "unit-strike-team-selection-close-combat-weapon",
                "quantity": 1
              }
            ]
          },
          {
            "modelId": "unit-strike-team-model-eb1dbfb325",
            "selections": [
              {
                "selectionId": "unit-strike-team-selection-pulse-pistol",
                "quantity": 1
              },
              {
                "selectionId": "unit-strike-team-selection-pulse-rifle",
                "quantity": 1
              },
              {
                "selectionId": "unit-strike-team-selection-close-combat-weapon",
                "quantity": 1
              }
            ]
          }
        ],
        "wargearOptionContracts": [
          {
            "sourceId": "datasheet-strike-team:wargear:1",
            "eligibleModelIds": [
              "unit-strike-team-model-eb1dbfb325"
            ],
            "limit": {
              "perModel": 2
            },
            "choices": [
              {
                "remove": [],
                "add": [
                  {
                    "selectionId": "unit-strike-team-selection-guardian-drone",
                    "quantity": 1
                  }
                ],
                "requiresFinal": [],
                "forbidsFinal": [],
                "sharedUses": [
                  "datasheet-strike-team:wargear:1:guardian"
                ]
              },
              {
                "remove": [],
                "add": [
                  {
                    "selectionId": "unit-strike-team-selection-twin-pulse-carbine",
                    "quantity": 1
                  }
                ],
                "requiresFinal": [],
                "forbidsFinal": [],
                "sharedUses": []
              },
              {
                "remove": [],
                "add": [
                  {
                    "selectionId": "unit-strike-team-selection-marker-drone",
                    "quantity": 1
                  }
                ],
                "requiresFinal": [],
                "forbidsFinal": [],
                "sharedUses": []
              },
              {
                "remove": [],
                "add": [
                  {
                    "selectionId": "unit-strike-team-selection-shield-drone",
                    "quantity": 1
                  }
                ],
                "requiresFinal": [],
                "forbidsFinal": [],
                "sharedUses": []
              }
            ]
          },
          {
            "sourceId": "datasheet-strike-team:wargear:2",
            "eligibleModelIds": [
              "unit-strike-team-model-f9647357a8"
            ],
            "limit": {
              "perModel": 1
            },
            "choices": [
              {
                "remove": [
                  {
                    "selectionId": "unit-strike-team-selection-pulse-rifle",
                    "quantity": 1
                  }
                ],
                "add": [
                  {
                    "selectionId": "unit-strike-team-selection-pulse-carbine",
                    "quantity": 1
                  }
                ],
                "requiresFinal": [],
                "forbidsFinal": [],
                "sharedUses": []
              }
            ]
          }
        ],
        "wargearSharedCaps": [
          {
            "id": "datasheet-strike-team:wargear:1:guardian",
            "max": 1,
            "scope": "model"
          }
        ]
      }
    },
    {
      "id": "unit-cadre-fireblade",
      "title": "Cadre Fireblade",
      "sourceBookId": "tau-empire",
      "sourceLayer": "codex",
      "intrinsicKeywords": [
        "Infantry",
        "Character",
        "Grenades",
        "Cadre Fireblade",
        "T'au Empire"
      ],
      "relations": {
        "canLead": [
          {
            "unitId": "unit-breacher-team",
            "maxCharacters": 1
          },
          {
            "unitId": "unit-strike-team",
            "maxCharacters": 1
          }
        ],
        "canSupport": [],
        "canBeLedBy": [],
        "canBeSupportedBy": []
      },
      "ruleFacts": {
        "relations": {
          "canLead": [
            {
              "unitId": "unit-breacher-team",
              "maxCharacters": 1
            },
            {
              "unitId": "unit-strike-team",
              "maxCharacters": 1
            }
          ],
          "canSupport": [],
          "canBeLedBy": [],
          "canBeSupportedBy": []
        }
      },
      "gameSelections": {
        "stats": {
          "M": "6\"",
          "T": "3",
          "Sv": "4+",
          "W": "3",
          "Ld": "7+",
          "OC": "1",
          "Invulnerable": ""
        },
        "statProfiles": [],
        "abilities": [
          {
            "id": "tau-empire-ability-volley-fire",
            "sectionId": "tau-empire-ability-volley-fire",
            "title": "Volley Fire",
            "text": "While this model is leading a unit, add 1 to the Attacks characteristic of ranged weapons equipped by models in that unit.",
            "sourceUnitId": "unit-cadre-fireblade"
          },
          {
            "id": "tau-empire-ability-crack-shot",
            "sectionId": "tau-empire-ability-crack-shot",
            "title": "Crack Shot",
            "text": "Each time this model makes a ranged attack, on a Critical Wound, that attack has an Armour Penetration characteristic of -3.",
            "sourceUnitId": "unit-cadre-fireblade"
          },
          {
            "id": "tau-empire-ability-for-the-greater-good",
            "sectionId": "tau-empire-ability-for-the-greater-good",
            "title": "For The Greater Good",
            "text": "If your Army Faction is T’AU EMPIRE, at the start of your Shooting phase you can select units from your army with this ability to become Observer units.\n\nDuring your Shooting phase, for each Observer unit from your army that has not been selected to shoot this phase and is eligible to shoot (excluding FORTIFICATION and Battle-shocked units) select one enemy unit that is visible to be marked as their Spotted unit until the end of the phase. Each enemy unit can only be marked as a Spotted unit once per phase.\n\nUnits from your army with the For the Greater Good ability (excluding Observer units) are Guided units while targeting one or more Spotted units.\n\nUntil the end of the phase, each time a model from your army in a Guided unit makes an attack that targets a Spotted unit, improve the Ballistic Skill characteristic of that attack by 1 and, if the Spotted unit was marked by an Observer unit that has the Markerlight keyword, that attack has the [IGNORES COVER] ability.",
            "sourceUnitId": "unit-cadre-fireblade"
          },
          {
            "id": "core-leader",
            "sectionId": "core-leader",
            "title": "Leader",
            "text": "While a Bodyguard unit contains a Leader, it is known as an Attached unit and, with the exception of rules that are triggered when units are destroyed (pg 12), it is treated as a single unit for all rules purposes. Each time an attack targets an Attached unit, until the attacking unit has resolved all of its attacks, you must use the Toughness characteristic of the Bodyguard models in that unit, even if a Leader in that unit has a different Toughness characteristic. Each time an attack successfully wounds an Attached unit, that attack cannot be allocated to a Character model in that unit, even if that Character model has lost one or more wounds or has already had attacks allocated to it this phase. As soon as the last Bodyguard model in an Attached unit has been destroyed, any attacks made against that unit that have yet to be allocated can then be allocated to Character models in that unit.\n\nEach time the last model in a Bodyguard unit is destroyed, each CHARACTER unit that is part of that Attached unit becomes a separate unit, with its original Starting Strength. If this happens as the result of an attack, they become separate units after the attacking unit has resolved all of its attacks. \n\nEach time the last model in a CHARACTER unit that is attached to a Bodyguard unit is destroyed and there is not another CHARACTER unit attached, that Attached unit’s Bodyguard unit becomes a separate unit, with its original Starting Strength. If this happens as the result of an attack, they become separate units after the attacking unit has resolved all of its attacks. \n\nEach time a unit that is part of an Attached unit is destroyed, it does not have the keywords of any other units that make up that Attached unit (unless it has those keywords on its own datasheet) for the purposes of any rules that would be triggered when that unit is destroyed.",
            "sourceUnitId": "unit-cadre-fireblade"
          }
        ],
        "models": [
          {
            "id": "unit-cadre-fireblade-model-0b31b1a8c3",
            "title": "Cadre Fireblade",
            "aliases": [
              "Cadre Fireblade"
            ],
            "min": 1,
            "max": 1,
            "legacyIds": [
              "unit-cadre-fireblade-model-cadre-fireblade"
            ]
          }
        ],
        "compositionRules": [],
        "selections": [
          {
            "id": "unit-cadre-fireblade-selection-fireblade-pulse-rifle",
            "title": "Fireblade pulse rifle",
            "aliases": [
              "Fireblade pulse rifle"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-cadre-fireblade-profile-a051b421bc"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-cadre-fireblade-selection-close-combat-weapon",
            "title": "Close combat weapon",
            "aliases": [
              "Close combat weapon"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-cadre-fireblade-profile-3734343fba"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-cadre-fireblade-selection-twin-pulse-carbine",
            "title": "Twin pulse carbine",
            "aliases": [
              "Twin pulse carbine"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-cadre-fireblade-profile-f98da3d20a"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-cadre-fireblade-selection-missile-pod",
            "title": "Missile pod",
            "aliases": [
              "Missile pod"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-cadre-fireblade-profile-e5f2491af6"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-cadre-fireblade-selection-marker-drone",
            "title": "Marker Drone",
            "aliases": [
              "Marker Drone"
            ],
            "kind": "wargear",
            "profileIds": [],
            "wargearAbilityIds": [
              "unit-cadre-fireblade-wargear-ability-054fa4f2b6"
            ]
          },
          {
            "id": "unit-cadre-fireblade-selection-shield-drone",
            "title": "Shield Drone",
            "aliases": [
              "Shield Drone"
            ],
            "kind": "wargear",
            "profileIds": [],
            "wargearAbilityIds": [
              "unit-cadre-fireblade-wargear-ability-bc6aabc321"
            ]
          },
          {
            "id": "unit-cadre-fireblade-selection-guardian-drone",
            "title": "Guardian Drone",
            "aliases": [
              "Guardian Drone"
            ],
            "kind": "wargear",
            "profileIds": [],
            "wargearAbilityIds": [
              "unit-cadre-fireblade-wargear-ability-24a672615e"
            ]
          }
        ],
        "weaponFamilies": [],
        "weaponProfiles": [
          {
            "id": "unit-cadre-fireblade-profile-a051b421bc",
            "legacyIds": [
              "unit-cadre-fireblade-profile-fireblade-pulse-rifle-ranged"
            ],
            "title": "Fireblade pulse rifle",
            "mode": "ranged",
            "range": "30\"",
            "a": "1",
            "skill": "3+",
            "s": "5",
            "ap": "0",
            "d": "2",
            "abilities": "Rapid Fire 1",
            "sourceSelectionIds": [
              "unit-cadre-fireblade-selection-fireblade-pulse-rifle"
            ]
          },
          {
            "id": "unit-cadre-fireblade-profile-3734343fba",
            "legacyIds": [
              "unit-cadre-fireblade-profile-close-combat-weapon-melee-2"
            ],
            "title": "Close combat weapon",
            "mode": "melee",
            "range": "Melee",
            "a": "3",
            "skill": "4+",
            "s": "3",
            "ap": "0",
            "d": "1",
            "abilities": "",
            "sourceSelectionIds": [
              "unit-cadre-fireblade-selection-close-combat-weapon"
            ]
          },
          {
            "id": "unit-cadre-fireblade-profile-f98da3d20a",
            "legacyIds": [
              "unit-cadre-fireblade-profile-twin-pulse-carbine-ranged-3"
            ],
            "title": "Twin pulse carbine",
            "mode": "ranged",
            "range": "20\"",
            "a": "2",
            "skill": "5+",
            "s": "5",
            "ap": "0",
            "d": "1",
            "abilities": "Assault, Twin-linked",
            "sourceSelectionIds": [
              "unit-cadre-fireblade-selection-twin-pulse-carbine"
            ]
          },
          {
            "id": "unit-cadre-fireblade-profile-e5f2491af6",
            "legacyIds": [
              "unit-cadre-fireblade-profile-missile-pod-ranged-4"
            ],
            "title": "Missile pod",
            "mode": "ranged",
            "range": "30\"",
            "a": "2",
            "skill": "5+",
            "s": "7",
            "ap": "-1",
            "d": "2",
            "abilities": "",
            "sourceSelectionIds": [
              "unit-cadre-fireblade-selection-missile-pod"
            ]
          }
        ],
        "wargearAbilities": [
          {
            "id": "unit-cadre-fireblade-wargear-ability-054fa4f2b6",
            "sectionId": "unit-cadre-fireblade-wargear-ability-054fa4f2b6",
            "title": "Marker Drone",
            "text": "The bearer’s unit has the Markerlight keyword and can act as an Observer unit for another unit even if it Advanced this turn.",
            "sourceUnitId": "unit-cadre-fireblade",
            "legacyIds": [
              "unit-cadre-fireblade-wargear-ability-marker-drone"
            ],
            "requiredSelectionIds": [
              "unit-cadre-fireblade-selection-marker-drone"
            ]
          },
          {
            "id": "unit-cadre-fireblade-wargear-ability-bc6aabc321",
            "sectionId": "unit-cadre-fireblade-wargear-ability-bc6aabc321",
            "title": "Shield Drone",
            "text": "Add 1 to the bearer’s Wounds characteristic.",
            "sourceUnitId": "unit-cadre-fireblade",
            "legacyIds": [
              "unit-cadre-fireblade-wargear-ability-shield-drone-2"
            ],
            "requiredSelectionIds": [
              "unit-cadre-fireblade-selection-shield-drone"
            ]
          },
          {
            "id": "unit-cadre-fireblade-wargear-ability-24a672615e",
            "sectionId": "unit-cadre-fireblade-wargear-ability-24a672615e",
            "title": "Guardian Drone",
            "text": "Each time a model makes a ranged attack that targets the bearer’s unit, subtract 1 from the Wound roll.",
            "sourceUnitId": "unit-cadre-fireblade",
            "legacyIds": [
              "unit-cadre-fireblade-wargear-ability-guardian-drone-3"
            ],
            "requiredSelectionIds": [
              "unit-cadre-fireblade-selection-guardian-drone"
            ]
          }
        ],
        "wargearDefaults": [
          {
            "modelId": "unit-cadre-fireblade-model-0b31b1a8c3",
            "selections": [
              {
                "selectionId": "unit-cadre-fireblade-selection-fireblade-pulse-rifle",
                "quantity": 1
              },
              {
                "selectionId": "unit-cadre-fireblade-selection-close-combat-weapon",
                "quantity": 1
              }
            ]
          }
        ],
        "wargearOptionContracts": [
          {
            "sourceId": "datasheet-cadre-fireblade:wargear:1",
            "eligibleModelIds": [
              "unit-cadre-fireblade-model-0b31b1a8c3"
            ],
            "limit": {
              "perModel": 2
            },
            "choices": [
              {
                "remove": [],
                "add": [
                  {
                    "selectionId": "unit-cadre-fireblade-selection-twin-pulse-carbine",
                    "quantity": 1
                  }
                ],
                "requiresFinal": [],
                "forbidsFinal": [],
                "sharedUses": []
              },
              {
                "remove": [],
                "add": [
                  {
                    "selectionId": "unit-cadre-fireblade-selection-marker-drone",
                    "quantity": 1
                  }
                ],
                "requiresFinal": [],
                "forbidsFinal": [],
                "sharedUses": []
              },
              {
                "remove": [],
                "add": [
                  {
                    "selectionId": "unit-cadre-fireblade-selection-shield-drone",
                    "quantity": 1
                  }
                ],
                "requiresFinal": [],
                "forbidsFinal": [],
                "sharedUses": []
              }
            ]
          }
        ],
        "wargearSharedCaps": []
      }
    },
    {
      "id": "unit-commander-in-coldstar-battlesuit",
      "title": "Commander in Coldstar Battlesuit",
      "sourceBookId": "tau-empire",
      "sourceLayer": "codex",
      "intrinsicKeywords": [
        "Vehicle",
        "Walker",
        "Fly",
        "Character",
        "Battlesuit",
        "Commander In Coldstar Battlesuit",
        "T'au Empire"
      ],
      "relations": {
        "canLead": [
          {
            "unitId": "unit-crisis-fireknife-battlesuits",
            "maxCharacters": 1
          },
          {
            "unitId": "unit-crisis-starscythe-battlesuits",
            "maxCharacters": 1
          },
          {
            "unitId": "unit-crisis-sunforge-battlesuits",
            "maxCharacters": 1
          }
        ],
        "canSupport": [],
        "canBeLedBy": [],
        "canBeSupportedBy": []
      },
      "ruleFacts": {
        "relations": {
          "canLead": [
            {
              "unitId": "unit-crisis-fireknife-battlesuits",
              "maxCharacters": 1
            },
            {
              "unitId": "unit-crisis-starscythe-battlesuits",
              "maxCharacters": 1
            },
            {
              "unitId": "unit-crisis-sunforge-battlesuits",
              "maxCharacters": 1
            }
          ],
          "canSupport": [],
          "canBeLedBy": [],
          "canBeSupportedBy": []
        }
      },
      "gameSelections": {
        "stats": {
          "M": "12\"",
          "T": "5",
          "Sv": "3+",
          "W": "6",
          "Ld": "7+",
          "OC": "2",
          "Invulnerable": ""
        },
        "statProfiles": [],
        "abilities": [
          {
            "id": "tau-empire-ability-coldstar-commander",
            "sectionId": "tau-empire-ability-coldstar-commander",
            "title": "Coldstar Commander",
            "text": "While this model is leading a unit, models in that unit have a Move characteristic of 12\" and ranged weapons equipped by models in that unit have the [ASSAULT] ability.",
            "sourceUnitId": "unit-commander-in-coldstar-battlesuit"
          },
          {
            "id": "core-deep-strike",
            "sectionId": "core-deep-strike",
            "title": "Deep Strike",
            "text": "Each time this unit makes an ingress move (20.04), if every model in this unit has this ability, it can be set up anywhere on the battlefield that is more than 8\" horizontally from all enemy units, even if that is within your opponent’s deployment zone.",
            "sourceUnitId": "unit-commander-in-coldstar-battlesuit"
          },
          {
            "id": "tau-empire-ability-for-the-greater-good",
            "sectionId": "tau-empire-ability-for-the-greater-good",
            "title": "For The Greater Good",
            "text": "If your Army Faction is T’AU EMPIRE, at the start of your Shooting phase you can select units from your army with this ability to become Observer units.\n\nDuring your Shooting phase, for each Observer unit from your army that has not been selected to shoot this phase and is eligible to shoot (excluding FORTIFICATION and Battle-shocked units) select one enemy unit that is visible to be marked as their Spotted unit until the end of the phase. Each enemy unit can only be marked as a Spotted unit once per phase.\n\nUnits from your army with the For the Greater Good ability (excluding Observer units) are Guided units while targeting one or more Spotted units.\n\nUntil the end of the phase, each time a model from your army in a Guided unit makes an attack that targets a Spotted unit, improve the Ballistic Skill characteristic of that attack by 1 and, if the Spotted unit was marked by an Observer unit that has the Markerlight keyword, that attack has the [IGNORES COVER] ability.",
            "sourceUnitId": "unit-commander-in-coldstar-battlesuit"
          },
          {
            "id": "core-leader",
            "sectionId": "core-leader",
            "title": "Leader",
            "text": "While a Bodyguard unit contains a Leader, it is known as an Attached unit and, with the exception of rules that are triggered when units are destroyed (pg 12), it is treated as a single unit for all rules purposes. Each time an attack targets an Attached unit, until the attacking unit has resolved all of its attacks, you must use the Toughness characteristic of the Bodyguard models in that unit, even if a Leader in that unit has a different Toughness characteristic. Each time an attack successfully wounds an Attached unit, that attack cannot be allocated to a Character model in that unit, even if that Character model has lost one or more wounds or has already had attacks allocated to it this phase. As soon as the last Bodyguard model in an Attached unit has been destroyed, any attacks made against that unit that have yet to be allocated can then be allocated to Character models in that unit.\n\nEach time the last model in a Bodyguard unit is destroyed, each CHARACTER unit that is part of that Attached unit becomes a separate unit, with its original Starting Strength. If this happens as the result of an attack, they become separate units after the attacking unit has resolved all of its attacks. \n\nEach time the last model in a CHARACTER unit that is attached to a Bodyguard unit is destroyed and there is not another CHARACTER unit attached, that Attached unit’s Bodyguard unit becomes a separate unit, with its original Starting Strength. If this happens as the result of an attack, they become separate units after the attacking unit has resolved all of its attacks. \n\nEach time a unit that is part of an Attached unit is destroyed, it does not have the keywords of any other units that make up that Attached unit (unless it has those keywords on its own datasheet) for the purposes of any rules that would be triggered when that unit is destroyed.",
            "sourceUnitId": "unit-commander-in-coldstar-battlesuit"
          },
          {
            "id": "core-assault",
            "sectionId": "core-assault",
            "title": "Assault",
            "text": "Units containing one or more models with an [ASSAULT] weapon can shoot using assault shooting (10.05).",
            "sourceUnitId": "unit-commander-in-coldstar-battlesuit"
          }
        ],
        "models": [
          {
            "id": "unit-commander-in-coldstar-battlesuit-model-0644315d8a",
            "title": "Commander in Coldstar Battlesuit",
            "aliases": [
              "Commander in Coldstar Battlesuit"
            ],
            "min": 1,
            "max": 1,
            "legacyIds": [
              "unit-commander-in-coldstar-battlesuit-model-commander-in-coldstar-battlesuit"
            ]
          }
        ],
        "compositionRules": [],
        "selections": [
          {
            "id": "unit-commander-in-coldstar-battlesuit-selection-high-output-burst-cannon",
            "title": "High-output burst cannon",
            "aliases": [
              "High-output burst cannon"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-commander-in-coldstar-battlesuit-profile-b283388e7a"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-commander-in-coldstar-battlesuit-selection-missile-pod",
            "title": "Missile pod",
            "aliases": [
              "Missile pod"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-commander-in-coldstar-battlesuit-profile-597bf2ba9b",
              "unit-commander-in-coldstar-battlesuit-profile-e5f2491af6"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-commander-in-coldstar-battlesuit-selection-burst-cannon",
            "title": "Burst cannon",
            "aliases": [
              "Burst cannon"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-commander-in-coldstar-battlesuit-profile-c445894447"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-commander-in-coldstar-battlesuit-selection-airbursting-fragmentation-projector",
            "title": "Airbursting fragmentation projector",
            "aliases": [
              "Airbursting fragmentation projector"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-commander-in-coldstar-battlesuit-profile-609e473bca"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-commander-in-coldstar-battlesuit-selection-cyclic-ion-blaster-standard",
            "title": "➤ Cyclic ion blaster - standard",
            "aliases": [
              "➤ Cyclic ion blaster - standard"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-commander-in-coldstar-battlesuit-profile-1e43d3b17b"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-commander-in-coldstar-battlesuit-selection-cyclic-ion-blaster-overcharge",
            "title": "➤ Cyclic ion blaster - overcharge",
            "aliases": [
              "➤ Cyclic ion blaster - overcharge"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-commander-in-coldstar-battlesuit-profile-6d0a685a7a"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-commander-in-coldstar-battlesuit-selection-tau-flamer",
            "title": "T'au flamer",
            "aliases": [
              "T'au flamer"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-commander-in-coldstar-battlesuit-profile-8f7f392529"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-commander-in-coldstar-battlesuit-selection-fusion-blaster",
            "title": "Fusion blaster",
            "aliases": [
              "Fusion blaster"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-commander-in-coldstar-battlesuit-profile-dfe87cda1e"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-commander-in-coldstar-battlesuit-selection-plasma-rifle",
            "title": "Plasma rifle",
            "aliases": [
              "Plasma rifle"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-commander-in-coldstar-battlesuit-profile-5b8442099b"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-commander-in-coldstar-battlesuit-selection-battlesuit-fists",
            "title": "Battlesuit fists",
            "aliases": [
              "Battlesuit fists"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-commander-in-coldstar-battlesuit-profile-fc3c180c6b"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-commander-in-coldstar-battlesuit-selection-twin-pulse-carbine",
            "title": "Twin pulse carbine",
            "aliases": [
              "Twin pulse carbine"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-commander-in-coldstar-battlesuit-profile-f98da3d20a"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-commander-in-coldstar-battlesuit-weapon-family-cyclic-ion-blaster-selection",
            "title": "➤ Cyclic ion blaster",
            "aliases": [
              "➤ Cyclic ion blaster"
            ],
            "kind": "weapon",
            "familyId": "unit-commander-in-coldstar-battlesuit-weapon-family-cyclic-ion-blaster",
            "profileIds": [
              "unit-commander-in-coldstar-battlesuit-profile-1e43d3b17b",
              "unit-commander-in-coldstar-battlesuit-profile-6d0a685a7a"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-commander-in-coldstar-battlesuit-selection-battlesuit-support-system",
            "title": "Battlesuit Support System",
            "aliases": [
              "Battlesuit Support System"
            ],
            "kind": "wargear",
            "profileIds": [],
            "wargearAbilityIds": [
              "unit-commander-in-coldstar-battlesuit-wargear-ability-abab11a127"
            ]
          },
          {
            "id": "unit-commander-in-coldstar-battlesuit-selection-shield-generator",
            "title": "Shield Generator",
            "aliases": [
              "Shield Generator"
            ],
            "kind": "wargear",
            "profileIds": [],
            "wargearAbilityIds": [
              "unit-commander-in-coldstar-battlesuit-wargear-ability-bf1c946221"
            ]
          },
          {
            "id": "unit-commander-in-coldstar-battlesuit-selection-weapon-support-system",
            "title": "Weapon Support System",
            "aliases": [
              "Weapon Support System"
            ],
            "kind": "wargear",
            "profileIds": [],
            "wargearAbilityIds": [
              "unit-commander-in-coldstar-battlesuit-wargear-ability-7ca2aa8ecc"
            ]
          },
          {
            "id": "unit-commander-in-coldstar-battlesuit-selection-marker-drone",
            "title": "Marker Drone",
            "aliases": [
              "Marker Drone"
            ],
            "kind": "wargear",
            "profileIds": [],
            "wargearAbilityIds": [
              "unit-commander-in-coldstar-battlesuit-wargear-ability-054fa4f2b6"
            ]
          },
          {
            "id": "unit-commander-in-coldstar-battlesuit-selection-shield-drone",
            "title": "Shield Drone",
            "aliases": [
              "Shield Drone"
            ],
            "kind": "wargear",
            "profileIds": [],
            "wargearAbilityIds": [
              "unit-commander-in-coldstar-battlesuit-wargear-ability-bc6aabc321"
            ]
          },
          {
            "id": "unit-commander-in-coldstar-battlesuit-selection-guardian-drone",
            "title": "Guardian Drone",
            "aliases": [
              "Guardian Drone"
            ],
            "kind": "wargear",
            "profileIds": [],
            "wargearAbilityIds": [
              "unit-commander-in-coldstar-battlesuit-wargear-ability-24a672615e"
            ]
          }
        ],
        "weaponFamilies": [
          {
            "id": "unit-commander-in-coldstar-battlesuit-weapon-family-cyclic-ion-blaster",
            "title": "➤ Cyclic ion blaster",
            "aliases": [
              "➤ Cyclic ion blaster"
            ],
            "profileIds": [
              "unit-commander-in-coldstar-battlesuit-profile-1e43d3b17b",
              "unit-commander-in-coldstar-battlesuit-profile-6d0a685a7a"
            ],
            "ambiguousAlias": false
          }
        ],
        "weaponProfiles": [
          {
            "id": "unit-commander-in-coldstar-battlesuit-profile-b283388e7a",
            "legacyIds": [
              "unit-commander-in-coldstar-battlesuit-profile-high-output-burst-cannon-ranged"
            ],
            "title": "High-output burst cannon",
            "mode": "ranged",
            "range": "18\"",
            "a": "8",
            "skill": "3+",
            "s": "5",
            "ap": "0",
            "d": "1",
            "abilities": "",
            "sourceSelectionIds": [
              "unit-commander-in-coldstar-battlesuit-selection-high-output-burst-cannon"
            ]
          },
          {
            "id": "unit-commander-in-coldstar-battlesuit-profile-597bf2ba9b",
            "legacyIds": [
              "unit-commander-in-coldstar-battlesuit-profile-missile-pod-ranged-2"
            ],
            "title": "Missile pod",
            "mode": "ranged",
            "range": "30\"",
            "a": "2",
            "skill": "3+",
            "s": "7",
            "ap": "-1",
            "d": "2",
            "abilities": "",
            "sourceSelectionIds": [
              "unit-commander-in-coldstar-battlesuit-selection-missile-pod"
            ]
          },
          {
            "id": "unit-commander-in-coldstar-battlesuit-profile-c445894447",
            "legacyIds": [
              "unit-commander-in-coldstar-battlesuit-profile-burst-cannon-ranged-3"
            ],
            "title": "Burst cannon",
            "mode": "ranged",
            "range": "18\"",
            "a": "4",
            "skill": "3+",
            "s": "5",
            "ap": "0",
            "d": "1",
            "abilities": "",
            "sourceSelectionIds": [
              "unit-commander-in-coldstar-battlesuit-selection-burst-cannon"
            ]
          },
          {
            "id": "unit-commander-in-coldstar-battlesuit-profile-609e473bca",
            "legacyIds": [
              "unit-commander-in-coldstar-battlesuit-profile-airbursting-fragmentation-projector-ranged-4"
            ],
            "title": "Airbursting fragmentation projector",
            "mode": "ranged",
            "range": "24\"",
            "a": "D6",
            "skill": "3+",
            "s": "3",
            "ap": "0",
            "d": "1",
            "abilities": "Blast, Indirect Fire",
            "sourceSelectionIds": [
              "unit-commander-in-coldstar-battlesuit-selection-airbursting-fragmentation-projector"
            ]
          },
          {
            "id": "unit-commander-in-coldstar-battlesuit-profile-1e43d3b17b",
            "legacyIds": [
              "unit-commander-in-coldstar-battlesuit-profile-cyclic-ion-blaster-standard-ranged-5"
            ],
            "title": "➤ Cyclic ion blaster - standard",
            "mode": "ranged",
            "range": "18\"",
            "a": "3",
            "skill": "3+",
            "s": "7",
            "ap": "-1",
            "d": "1",
            "abilities": "",
            "sourceSelectionIds": [
              "unit-commander-in-coldstar-battlesuit-selection-cyclic-ion-blaster-standard",
              "unit-commander-in-coldstar-battlesuit-weapon-family-cyclic-ion-blaster-selection"
            ]
          },
          {
            "id": "unit-commander-in-coldstar-battlesuit-profile-6d0a685a7a",
            "legacyIds": [
              "unit-commander-in-coldstar-battlesuit-profile-cyclic-ion-blaster-overcharge-ranged-6"
            ],
            "title": "➤ Cyclic ion blaster - overcharge",
            "mode": "ranged",
            "range": "18\"",
            "a": "3",
            "skill": "3+",
            "s": "8",
            "ap": "-2",
            "d": "2",
            "abilities": "Hazardous",
            "sourceSelectionIds": [
              "unit-commander-in-coldstar-battlesuit-selection-cyclic-ion-blaster-overcharge",
              "unit-commander-in-coldstar-battlesuit-weapon-family-cyclic-ion-blaster-selection"
            ]
          },
          {
            "id": "unit-commander-in-coldstar-battlesuit-profile-8f7f392529",
            "legacyIds": [
              "unit-commander-in-coldstar-battlesuit-profile-tau-flamer-ranged-7"
            ],
            "title": "T'au flamer",
            "mode": "ranged",
            "range": "12\"",
            "a": "D6",
            "skill": "N/A",
            "s": "4",
            "ap": "0",
            "d": "1",
            "abilities": "Ignores Cover, Torrent",
            "sourceSelectionIds": [
              "unit-commander-in-coldstar-battlesuit-selection-tau-flamer"
            ]
          },
          {
            "id": "unit-commander-in-coldstar-battlesuit-profile-dfe87cda1e",
            "legacyIds": [
              "unit-commander-in-coldstar-battlesuit-profile-fusion-blaster-ranged-8"
            ],
            "title": "Fusion blaster",
            "mode": "ranged",
            "range": "12\"",
            "a": "1",
            "skill": "3+",
            "s": "9",
            "ap": "-4",
            "d": "D6",
            "abilities": "Melta 2",
            "sourceSelectionIds": [
              "unit-commander-in-coldstar-battlesuit-selection-fusion-blaster"
            ]
          },
          {
            "id": "unit-commander-in-coldstar-battlesuit-profile-5b8442099b",
            "legacyIds": [
              "unit-commander-in-coldstar-battlesuit-profile-plasma-rifle-ranged-9"
            ],
            "title": "Plasma rifle",
            "mode": "ranged",
            "range": "18\"",
            "a": "1",
            "skill": "3+",
            "s": "8",
            "ap": "-3",
            "d": "3",
            "abilities": "",
            "sourceSelectionIds": [
              "unit-commander-in-coldstar-battlesuit-selection-plasma-rifle"
            ]
          },
          {
            "id": "unit-commander-in-coldstar-battlesuit-profile-fc3c180c6b",
            "legacyIds": [
              "unit-commander-in-coldstar-battlesuit-profile-battlesuit-fists-melee-10"
            ],
            "title": "Battlesuit fists",
            "mode": "melee",
            "range": "Melee",
            "a": "3",
            "skill": "4+",
            "s": "5",
            "ap": "0",
            "d": "1",
            "abilities": "",
            "sourceSelectionIds": [
              "unit-commander-in-coldstar-battlesuit-selection-battlesuit-fists"
            ]
          },
          {
            "id": "unit-commander-in-coldstar-battlesuit-profile-f98da3d20a",
            "legacyIds": [
              "unit-commander-in-coldstar-battlesuit-profile-twin-pulse-carbine-ranged-11"
            ],
            "title": "Twin pulse carbine",
            "mode": "ranged",
            "range": "20\"",
            "a": "2",
            "skill": "5+",
            "s": "5",
            "ap": "0",
            "d": "1",
            "abilities": "Assault, Twin-linked",
            "sourceSelectionIds": [
              "unit-commander-in-coldstar-battlesuit-selection-twin-pulse-carbine"
            ]
          },
          {
            "id": "unit-commander-in-coldstar-battlesuit-profile-e5f2491af6",
            "legacyIds": [
              "unit-commander-in-coldstar-battlesuit-profile-missile-pod-ranged-12"
            ],
            "title": "Missile pod",
            "mode": "ranged",
            "range": "30\"",
            "a": "2",
            "skill": "5+",
            "s": "7",
            "ap": "-1",
            "d": "2",
            "abilities": "",
            "sourceSelectionIds": [
              "unit-commander-in-coldstar-battlesuit-selection-missile-pod"
            ]
          }
        ],
        "wargearAbilities": [
          {
            "id": "unit-commander-in-coldstar-battlesuit-wargear-ability-abab11a127",
            "sectionId": "unit-commander-in-coldstar-battlesuit-wargear-ability-abab11a127",
            "title": "Battlesuit Support System",
            "text": "The bearer’s unit is eligible to shoot in a turn in which it Fell Back, but when doing so only models equipped with this wargear can make ranged attacks.",
            "sourceUnitId": "unit-commander-in-coldstar-battlesuit",
            "legacyIds": [
              "unit-commander-in-coldstar-battlesuit-wargear-ability-battlesuit-support-system"
            ],
            "requiredSelectionIds": [
              "unit-commander-in-coldstar-battlesuit-selection-battlesuit-support-system"
            ]
          },
          {
            "id": "unit-commander-in-coldstar-battlesuit-wargear-ability-bf1c946221",
            "sectionId": "unit-commander-in-coldstar-battlesuit-wargear-ability-bf1c946221",
            "title": "Shield Generator",
            "text": "The bearer has a 4+ invulnerable save.",
            "sourceUnitId": "unit-commander-in-coldstar-battlesuit",
            "legacyIds": [
              "unit-commander-in-coldstar-battlesuit-wargear-ability-shield-generator-2"
            ],
            "requiredSelectionIds": [
              "unit-commander-in-coldstar-battlesuit-selection-shield-generator"
            ]
          },
          {
            "id": "unit-commander-in-coldstar-battlesuit-wargear-ability-7ca2aa8ecc",
            "sectionId": "unit-commander-in-coldstar-battlesuit-wargear-ability-7ca2aa8ecc",
            "title": "Weapon Support System",
            "text": "Each time the bearer makes a ranged attack, you can ignore any or all modifiers to the Hit roll.",
            "sourceUnitId": "unit-commander-in-coldstar-battlesuit",
            "legacyIds": [
              "unit-commander-in-coldstar-battlesuit-wargear-ability-weapon-support-system-3"
            ],
            "requiredSelectionIds": [
              "unit-commander-in-coldstar-battlesuit-selection-weapon-support-system"
            ]
          },
          {
            "id": "unit-commander-in-coldstar-battlesuit-wargear-ability-054fa4f2b6",
            "sectionId": "unit-commander-in-coldstar-battlesuit-wargear-ability-054fa4f2b6",
            "title": "Marker Drone",
            "text": "The bearer’s unit has the Markerlight keyword and can act as an Observer unit for another unit even if it Advanced this turn.",
            "sourceUnitId": "unit-commander-in-coldstar-battlesuit",
            "legacyIds": [
              "unit-commander-in-coldstar-battlesuit-wargear-ability-marker-drone-4"
            ],
            "requiredSelectionIds": [
              "unit-commander-in-coldstar-battlesuit-selection-marker-drone"
            ]
          },
          {
            "id": "unit-commander-in-coldstar-battlesuit-wargear-ability-bc6aabc321",
            "sectionId": "unit-commander-in-coldstar-battlesuit-wargear-ability-bc6aabc321",
            "title": "Shield Drone",
            "text": "Add 1 to the bearer’s Wounds characteristic.",
            "sourceUnitId": "unit-commander-in-coldstar-battlesuit",
            "legacyIds": [
              "unit-commander-in-coldstar-battlesuit-wargear-ability-shield-drone-5"
            ],
            "requiredSelectionIds": [
              "unit-commander-in-coldstar-battlesuit-selection-shield-drone"
            ]
          },
          {
            "id": "unit-commander-in-coldstar-battlesuit-wargear-ability-24a672615e",
            "sectionId": "unit-commander-in-coldstar-battlesuit-wargear-ability-24a672615e",
            "title": "Guardian Drone",
            "text": "Each time a model makes a ranged attack that targets the bearer’s unit, subtract 1 from the Wound roll.",
            "sourceUnitId": "unit-commander-in-coldstar-battlesuit",
            "legacyIds": [
              "unit-commander-in-coldstar-battlesuit-wargear-ability-guardian-drone-6"
            ],
            "requiredSelectionIds": [
              "unit-commander-in-coldstar-battlesuit-selection-guardian-drone"
            ]
          }
        ],
        "wargearDefaults": [
          {
            "modelId": "unit-commander-in-coldstar-battlesuit-model-0644315d8a",
            "selections": [
              {
                "selectionId": "unit-commander-in-coldstar-battlesuit-selection-high-output-burst-cannon",
                "quantity": 1
              },
              {
                "selectionId": "unit-commander-in-coldstar-battlesuit-selection-battlesuit-fists",
                "quantity": 1
              }
            ]
          }
        ],
        "wargearOptionContracts": [
          {
            "sourceId": "datasheet-commander-in-coldstar-battlesuit:wargear:1",
            "eligibleModelIds": [
              "unit-commander-in-coldstar-battlesuit-model-0644315d8a"
            ],
            "limit": {
              "perModel": 1
            },
            "choices": [
              {
                "remove": [
                  {
                    "selectionId": "unit-commander-in-coldstar-battlesuit-selection-high-output-burst-cannon",
                    "quantity": 1
                  }
                ],
                "add": [
                  {
                    "selectionId": "unit-commander-in-coldstar-battlesuit-selection-airbursting-fragmentation-projector",
                    "quantity": 1
                  }
                ],
                "requiresFinal": [],
                "forbidsFinal": [],
                "sharedUses": [
                  "datasheet-commander-in-coldstar-battlesuit:wargear:4:airbursting-fragmentation-projector"
                ]
              },
              {
                "remove": [
                  {
                    "selectionId": "unit-commander-in-coldstar-battlesuit-selection-high-output-burst-cannon",
                    "quantity": 1
                  }
                ],
                "add": [
                  {
                    "selectionId": "unit-commander-in-coldstar-battlesuit-selection-battlesuit-support-system",
                    "quantity": 1
                  }
                ],
                "requiresFinal": [],
                "forbidsFinal": [],
                "sharedUses": [
                  "datasheet-commander-in-coldstar-battlesuit:wargear:4:battlesuit-support-system"
                ]
              },
              {
                "remove": [
                  {
                    "selectionId": "unit-commander-in-coldstar-battlesuit-selection-high-output-burst-cannon",
                    "quantity": 1
                  }
                ],
                "add": [
                  {
                    "selectionId": "unit-commander-in-coldstar-battlesuit-selection-burst-cannon",
                    "quantity": 1
                  }
                ],
                "requiresFinal": [],
                "forbidsFinal": [],
                "sharedUses": []
              },
              {
                "remove": [
                  {
                    "selectionId": "unit-commander-in-coldstar-battlesuit-selection-high-output-burst-cannon",
                    "quantity": 1
                  }
                ],
                "add": [
                  {
                    "selectionId": "unit-commander-in-coldstar-battlesuit-weapon-family-cyclic-ion-blaster-selection",
                    "quantity": 1
                  }
                ],
                "requiresFinal": [],
                "forbidsFinal": [],
                "sharedUses": [
                  "datasheet-commander-in-coldstar-battlesuit:wargear:4:cyclic-ion-blaster"
                ]
              },
              {
                "remove": [
                  {
                    "selectionId": "unit-commander-in-coldstar-battlesuit-selection-high-output-burst-cannon",
                    "quantity": 1
                  }
                ],
                "add": [
                  {
                    "selectionId": "unit-commander-in-coldstar-battlesuit-selection-fusion-blaster",
                    "quantity": 1
                  }
                ],
                "requiresFinal": [],
                "forbidsFinal": [],
                "sharedUses": []
              },
              {
                "remove": [
                  {
                    "selectionId": "unit-commander-in-coldstar-battlesuit-selection-high-output-burst-cannon",
                    "quantity": 1
                  }
                ],
                "add": [
                  {
                    "selectionId": "unit-commander-in-coldstar-battlesuit-selection-missile-pod",
                    "quantity": 1
                  }
                ],
                "requiresFinal": [],
                "forbidsFinal": [],
                "sharedUses": []
              },
              {
                "remove": [
                  {
                    "selectionId": "unit-commander-in-coldstar-battlesuit-selection-high-output-burst-cannon",
                    "quantity": 1
                  }
                ],
                "add": [
                  {
                    "selectionId": "unit-commander-in-coldstar-battlesuit-selection-plasma-rifle",
                    "quantity": 1
                  }
                ],
                "requiresFinal": [],
                "forbidsFinal": [],
                "sharedUses": []
              },
              {
                "remove": [
                  {
                    "selectionId": "unit-commander-in-coldstar-battlesuit-selection-high-output-burst-cannon",
                    "quantity": 1
                  }
                ],
                "add": [
                  {
                    "selectionId": "unit-commander-in-coldstar-battlesuit-selection-shield-generator",
                    "quantity": 1
                  }
                ],
                "requiresFinal": [],
                "forbidsFinal": [],
                "sharedUses": [
                  "datasheet-commander-in-coldstar-battlesuit:wargear:4:shield-generator"
                ]
              },
              {
                "remove": [
                  {
                    "selectionId": "unit-commander-in-coldstar-battlesuit-selection-high-output-burst-cannon",
                    "quantity": 1
                  }
                ],
                "add": [
                  {
                    "selectionId": "unit-commander-in-coldstar-battlesuit-selection-tau-flamer",
                    "quantity": 1
                  }
                ],
                "requiresFinal": [],
                "forbidsFinal": [],
                "sharedUses": []
              },
              {
                "remove": [
                  {
                    "selectionId": "unit-commander-in-coldstar-battlesuit-selection-high-output-burst-cannon",
                    "quantity": 1
                  }
                ],
                "add": [
                  {
                    "selectionId": "unit-commander-in-coldstar-battlesuit-selection-weapon-support-system",
                    "quantity": 1
                  }
                ],
                "requiresFinal": [],
                "forbidsFinal": [],
                "sharedUses": [
                  "datasheet-commander-in-coldstar-battlesuit:wargear:4:weapon-support-system"
                ]
              }
            ]
          },
          {
            "sourceId": "datasheet-commander-in-coldstar-battlesuit:wargear:2",
            "eligibleModelIds": [
              "unit-commander-in-coldstar-battlesuit-model-0644315d8a"
            ],
            "limit": {
              "perModel": 2
            },
            "choices": [
              {
                "remove": [],
                "add": [
                  {
                    "selectionId": "unit-commander-in-coldstar-battlesuit-selection-twin-pulse-carbine",
                    "quantity": 1
                  }
                ],
                "requiresFinal": [],
                "forbidsFinal": [],
                "sharedUses": []
              },
              {
                "remove": [],
                "add": [
                  {
                    "selectionId": "unit-commander-in-coldstar-battlesuit-selection-marker-drone",
                    "quantity": 1
                  }
                ],
                "requiresFinal": [],
                "forbidsFinal": [],
                "sharedUses": []
              },
              {
                "remove": [],
                "add": [
                  {
                    "selectionId": "unit-commander-in-coldstar-battlesuit-selection-shield-drone",
                    "quantity": 1
                  }
                ],
                "requiresFinal": [],
                "forbidsFinal": [],
                "sharedUses": []
              }
            ]
          },
          {
            "sourceId": "datasheet-commander-in-coldstar-battlesuit:wargear:3",
            "eligibleModelIds": [
              "unit-commander-in-coldstar-battlesuit-model-0644315d8a"
            ],
            "limit": {
              "perModel": 3
            },
            "choices": [
              {
                "remove": [],
                "add": [
                  {
                    "selectionId": "unit-commander-in-coldstar-battlesuit-selection-airbursting-fragmentation-projector",
                    "quantity": 1
                  }
                ],
                "requiresFinal": [],
                "forbidsFinal": [],
                "sharedUses": [
                  "datasheet-commander-in-coldstar-battlesuit:wargear:4:airbursting-fragmentation-projector"
                ]
              },
              {
                "remove": [],
                "add": [
                  {
                    "selectionId": "unit-commander-in-coldstar-battlesuit-selection-battlesuit-support-system",
                    "quantity": 1
                  }
                ],
                "requiresFinal": [],
                "forbidsFinal": [],
                "sharedUses": [
                  "datasheet-commander-in-coldstar-battlesuit:wargear:4:battlesuit-support-system"
                ]
              },
              {
                "remove": [],
                "add": [
                  {
                    "selectionId": "unit-commander-in-coldstar-battlesuit-selection-burst-cannon",
                    "quantity": 1
                  }
                ],
                "requiresFinal": [],
                "forbidsFinal": [],
                "sharedUses": []
              },
              {
                "remove": [],
                "add": [
                  {
                    "selectionId": "unit-commander-in-coldstar-battlesuit-weapon-family-cyclic-ion-blaster-selection",
                    "quantity": 1
                  }
                ],
                "requiresFinal": [],
                "forbidsFinal": [],
                "sharedUses": [
                  "datasheet-commander-in-coldstar-battlesuit:wargear:4:cyclic-ion-blaster"
                ]
              },
              {
                "remove": [],
                "add": [
                  {
                    "selectionId": "unit-commander-in-coldstar-battlesuit-selection-fusion-blaster",
                    "quantity": 1
                  }
                ],
                "requiresFinal": [],
                "forbidsFinal": [],
                "sharedUses": []
              },
              {
                "remove": [],
                "add": [
                  {
                    "selectionId": "unit-commander-in-coldstar-battlesuit-selection-missile-pod",
                    "quantity": 1
                  }
                ],
                "requiresFinal": [],
                "forbidsFinal": [],
                "sharedUses": []
              },
              {
                "remove": [],
                "add": [
                  {
                    "selectionId": "unit-commander-in-coldstar-battlesuit-selection-plasma-rifle",
                    "quantity": 1
                  }
                ],
                "requiresFinal": [],
                "forbidsFinal": [],
                "sharedUses": []
              },
              {
                "remove": [],
                "add": [
                  {
                    "selectionId": "unit-commander-in-coldstar-battlesuit-selection-shield-generator",
                    "quantity": 1
                  }
                ],
                "requiresFinal": [],
                "forbidsFinal": [],
                "sharedUses": [
                  "datasheet-commander-in-coldstar-battlesuit:wargear:4:shield-generator"
                ]
              },
              {
                "remove": [],
                "add": [
                  {
                    "selectionId": "unit-commander-in-coldstar-battlesuit-selection-tau-flamer",
                    "quantity": 1
                  }
                ],
                "requiresFinal": [],
                "forbidsFinal": [],
                "sharedUses": []
              },
              {
                "remove": [],
                "add": [
                  {
                    "selectionId": "unit-commander-in-coldstar-battlesuit-selection-weapon-support-system",
                    "quantity": 1
                  }
                ],
                "requiresFinal": [],
                "forbidsFinal": [],
                "sharedUses": [
                  "datasheet-commander-in-coldstar-battlesuit:wargear:4:weapon-support-system"
                ]
              }
            ]
          }
        ],
        "wargearSharedCaps": [
          {
            "id": "datasheet-commander-in-coldstar-battlesuit:wargear:4:airbursting-fragmentation-projector",
            "max": 1,
            "scope": "model",
            "sourceIds": [
              "datasheet-commander-in-coldstar-battlesuit:wargear:4"
            ]
          },
          {
            "id": "datasheet-commander-in-coldstar-battlesuit:wargear:4:battlesuit-support-system",
            "max": 1,
            "scope": "model",
            "sourceIds": [
              "datasheet-commander-in-coldstar-battlesuit:wargear:4"
            ]
          },
          {
            "id": "datasheet-commander-in-coldstar-battlesuit:wargear:4:cyclic-ion-blaster",
            "max": 1,
            "scope": "model",
            "sourceIds": [
              "datasheet-commander-in-coldstar-battlesuit:wargear:4"
            ]
          },
          {
            "id": "datasheet-commander-in-coldstar-battlesuit:wargear:4:shield-generator",
            "max": 1,
            "scope": "model",
            "sourceIds": [
              "datasheet-commander-in-coldstar-battlesuit:wargear:4"
            ]
          },
          {
            "id": "datasheet-commander-in-coldstar-battlesuit:wargear:4:weapon-support-system",
            "max": 1,
            "scope": "model",
            "sourceIds": [
              "datasheet-commander-in-coldstar-battlesuit:wargear:4"
            ]
          }
        ]
      }
    },
    {
      "id": "unit-commander-in-enforcer-battlesuit",
      "title": "Commander in Enforcer Battlesuit",
      "sourceBookId": "tau-empire",
      "sourceLayer": "codex",
      "intrinsicKeywords": [
        "Vehicle",
        "Walker",
        "Fly",
        "Character",
        "Battlesuit",
        "Commander In Enforcer Battlesuit",
        "T'au Empire"
      ],
      "relations": {
        "canLead": [
          {
            "unitId": "unit-crisis-fireknife-battlesuits",
            "maxCharacters": 1
          },
          {
            "unitId": "unit-crisis-starscythe-battlesuits",
            "maxCharacters": 1
          },
          {
            "unitId": "unit-crisis-sunforge-battlesuits",
            "maxCharacters": 1
          }
        ],
        "canSupport": [],
        "canBeLedBy": [],
        "canBeSupportedBy": []
      },
      "ruleFacts": {
        "relations": {
          "canLead": [
            {
              "unitId": "unit-crisis-fireknife-battlesuits",
              "maxCharacters": 1
            },
            {
              "unitId": "unit-crisis-starscythe-battlesuits",
              "maxCharacters": 1
            },
            {
              "unitId": "unit-crisis-sunforge-battlesuits",
              "maxCharacters": 1
            }
          ],
          "canSupport": [],
          "canBeLedBy": [],
          "canBeSupportedBy": []
        }
      },
      "gameSelections": {
        "stats": {
          "M": "8\"",
          "T": "5",
          "Sv": "2+",
          "W": "6",
          "Ld": "7+",
          "OC": "2",
          "Invulnerable": ""
        },
        "statProfiles": [],
        "abilities": [
          {
            "id": "tau-empire-ability-enforcer-commander",
            "sectionId": "tau-empire-ability-enforcer-commander",
            "title": "Enforcer Commander",
            "text": "While this model is leading a unit, each time a ranged attack targets that unit, worsen the Armour Penetration characteristic of that attack by 1.",
            "sourceUnitId": "unit-commander-in-enforcer-battlesuit"
          },
          {
            "id": "core-deep-strike",
            "sectionId": "core-deep-strike",
            "title": "Deep Strike",
            "text": "Each time this unit makes an ingress move (20.04), if every model in this unit has this ability, it can be set up anywhere on the battlefield that is more than 8\" horizontally from all enemy units, even if that is within your opponent’s deployment zone.",
            "sourceUnitId": "unit-commander-in-enforcer-battlesuit"
          },
          {
            "id": "tau-empire-ability-for-the-greater-good",
            "sectionId": "tau-empire-ability-for-the-greater-good",
            "title": "For The Greater Good",
            "text": "If your Army Faction is T’AU EMPIRE, at the start of your Shooting phase you can select units from your army with this ability to become Observer units.\n\nDuring your Shooting phase, for each Observer unit from your army that has not been selected to shoot this phase and is eligible to shoot (excluding FORTIFICATION and Battle-shocked units) select one enemy unit that is visible to be marked as their Spotted unit until the end of the phase. Each enemy unit can only be marked as a Spotted unit once per phase.\n\nUnits from your army with the For the Greater Good ability (excluding Observer units) are Guided units while targeting one or more Spotted units.\n\nUntil the end of the phase, each time a model from your army in a Guided unit makes an attack that targets a Spotted unit, improve the Ballistic Skill characteristic of that attack by 1 and, if the Spotted unit was marked by an Observer unit that has the Markerlight keyword, that attack has the [IGNORES COVER] ability.",
            "sourceUnitId": "unit-commander-in-enforcer-battlesuit"
          },
          {
            "id": "core-leader",
            "sectionId": "core-leader",
            "title": "Leader",
            "text": "While a Bodyguard unit contains a Leader, it is known as an Attached unit and, with the exception of rules that are triggered when units are destroyed (pg 12), it is treated as a single unit for all rules purposes. Each time an attack targets an Attached unit, until the attacking unit has resolved all of its attacks, you must use the Toughness characteristic of the Bodyguard models in that unit, even if a Leader in that unit has a different Toughness characteristic. Each time an attack successfully wounds an Attached unit, that attack cannot be allocated to a Character model in that unit, even if that Character model has lost one or more wounds or has already had attacks allocated to it this phase. As soon as the last Bodyguard model in an Attached unit has been destroyed, any attacks made against that unit that have yet to be allocated can then be allocated to Character models in that unit.\n\nEach time the last model in a Bodyguard unit is destroyed, each CHARACTER unit that is part of that Attached unit becomes a separate unit, with its original Starting Strength. If this happens as the result of an attack, they become separate units after the attacking unit has resolved all of its attacks. \n\nEach time the last model in a CHARACTER unit that is attached to a Bodyguard unit is destroyed and there is not another CHARACTER unit attached, that Attached unit’s Bodyguard unit becomes a separate unit, with its original Starting Strength. If this happens as the result of an attack, they become separate units after the attacking unit has resolved all of its attacks. \n\nEach time a unit that is part of an Attached unit is destroyed, it does not have the keywords of any other units that make up that Attached unit (unless it has those keywords on its own datasheet) for the purposes of any rules that would be triggered when that unit is destroyed.",
            "sourceUnitId": "unit-commander-in-enforcer-battlesuit"
          }
        ],
        "models": [
          {
            "id": "unit-commander-in-enforcer-battlesuit-model-a2db67bad0",
            "title": "Commander in Enforcer Battlesuit",
            "aliases": [
              "Commander in Enforcer Battlesuit"
            ],
            "min": 1,
            "max": 1,
            "legacyIds": [
              "unit-commander-in-enforcer-battlesuit-model-commander-in-enforcer-battlesuit"
            ]
          }
        ],
        "compositionRules": [],
        "selections": [
          {
            "id": "unit-commander-in-enforcer-battlesuit-selection-missile-pod",
            "title": "Missile pod",
            "aliases": [
              "Missile pod"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-commander-in-enforcer-battlesuit-profile-597bf2ba9b",
              "unit-commander-in-enforcer-battlesuit-profile-e5f2491af6"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-commander-in-enforcer-battlesuit-selection-burst-cannon",
            "title": "Burst cannon",
            "aliases": [
              "Burst cannon"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-commander-in-enforcer-battlesuit-profile-c445894447"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-commander-in-enforcer-battlesuit-selection-airbursting-fragmentation-projector",
            "title": "Airbursting fragmentation projector",
            "aliases": [
              "Airbursting fragmentation projector"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-commander-in-enforcer-battlesuit-profile-609e473bca"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-commander-in-enforcer-battlesuit-selection-cyclic-ion-blaster-standard",
            "title": "➤ Cyclic ion blaster - standard",
            "aliases": [
              "➤ Cyclic ion blaster - standard"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-commander-in-enforcer-battlesuit-profile-1e43d3b17b"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-commander-in-enforcer-battlesuit-selection-cyclic-ion-blaster-overcharge",
            "title": "➤ Cyclic ion blaster - overcharge",
            "aliases": [
              "➤ Cyclic ion blaster - overcharge"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-commander-in-enforcer-battlesuit-profile-6d0a685a7a"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-commander-in-enforcer-battlesuit-selection-tau-flamer",
            "title": "T'au flamer",
            "aliases": [
              "T'au flamer"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-commander-in-enforcer-battlesuit-profile-8f7f392529"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-commander-in-enforcer-battlesuit-selection-fusion-blaster",
            "title": "Fusion blaster",
            "aliases": [
              "Fusion blaster"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-commander-in-enforcer-battlesuit-profile-dfe87cda1e"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-commander-in-enforcer-battlesuit-selection-plasma-rifle",
            "title": "Plasma rifle",
            "aliases": [
              "Plasma rifle"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-commander-in-enforcer-battlesuit-profile-5b8442099b"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-commander-in-enforcer-battlesuit-selection-battlesuit-fists",
            "title": "Battlesuit fists",
            "aliases": [
              "Battlesuit fists"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-commander-in-enforcer-battlesuit-profile-fc3c180c6b"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-commander-in-enforcer-battlesuit-selection-twin-pulse-carbine",
            "title": "Twin pulse carbine",
            "aliases": [
              "Twin pulse carbine"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-commander-in-enforcer-battlesuit-profile-f98da3d20a"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-commander-in-enforcer-battlesuit-weapon-family-cyclic-ion-blaster-selection",
            "title": "➤ Cyclic ion blaster",
            "aliases": [
              "➤ Cyclic ion blaster"
            ],
            "kind": "weapon",
            "familyId": "unit-commander-in-enforcer-battlesuit-weapon-family-cyclic-ion-blaster",
            "profileIds": [
              "unit-commander-in-enforcer-battlesuit-profile-1e43d3b17b",
              "unit-commander-in-enforcer-battlesuit-profile-6d0a685a7a"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-commander-in-enforcer-battlesuit-selection-battlesuit-support-system",
            "title": "Battlesuit Support System",
            "aliases": [
              "Battlesuit Support System"
            ],
            "kind": "wargear",
            "profileIds": [],
            "wargearAbilityIds": [
              "unit-commander-in-enforcer-battlesuit-wargear-ability-abab11a127"
            ]
          },
          {
            "id": "unit-commander-in-enforcer-battlesuit-selection-shield-generator",
            "title": "Shield Generator",
            "aliases": [
              "Shield Generator"
            ],
            "kind": "wargear",
            "profileIds": [],
            "wargearAbilityIds": [
              "unit-commander-in-enforcer-battlesuit-wargear-ability-bf1c946221"
            ]
          },
          {
            "id": "unit-commander-in-enforcer-battlesuit-selection-weapon-support-system",
            "title": "Weapon Support System",
            "aliases": [
              "Weapon Support System"
            ],
            "kind": "wargear",
            "profileIds": [],
            "wargearAbilityIds": [
              "unit-commander-in-enforcer-battlesuit-wargear-ability-7ca2aa8ecc"
            ]
          },
          {
            "id": "unit-commander-in-enforcer-battlesuit-selection-marker-drone",
            "title": "Marker Drone",
            "aliases": [
              "Marker Drone"
            ],
            "kind": "wargear",
            "profileIds": [],
            "wargearAbilityIds": [
              "unit-commander-in-enforcer-battlesuit-wargear-ability-054fa4f2b6"
            ]
          },
          {
            "id": "unit-commander-in-enforcer-battlesuit-selection-shield-drone",
            "title": "Shield Drone",
            "aliases": [
              "Shield Drone"
            ],
            "kind": "wargear",
            "profileIds": [],
            "wargearAbilityIds": [
              "unit-commander-in-enforcer-battlesuit-wargear-ability-bc6aabc321"
            ]
          },
          {
            "id": "unit-commander-in-enforcer-battlesuit-selection-guardian-drone",
            "title": "Guardian Drone",
            "aliases": [
              "Guardian Drone"
            ],
            "kind": "wargear",
            "profileIds": [],
            "wargearAbilityIds": [
              "unit-commander-in-enforcer-battlesuit-wargear-ability-24a672615e"
            ]
          }
        ],
        "weaponFamilies": [
          {
            "id": "unit-commander-in-enforcer-battlesuit-weapon-family-cyclic-ion-blaster",
            "title": "➤ Cyclic ion blaster",
            "aliases": [
              "➤ Cyclic ion blaster"
            ],
            "profileIds": [
              "unit-commander-in-enforcer-battlesuit-profile-1e43d3b17b",
              "unit-commander-in-enforcer-battlesuit-profile-6d0a685a7a"
            ],
            "ambiguousAlias": false
          }
        ],
        "weaponProfiles": [
          {
            "id": "unit-commander-in-enforcer-battlesuit-profile-597bf2ba9b",
            "legacyIds": [
              "unit-commander-in-enforcer-battlesuit-profile-missile-pod-ranged"
            ],
            "title": "Missile pod",
            "mode": "ranged",
            "range": "30\"",
            "a": "2",
            "skill": "3+",
            "s": "7",
            "ap": "-1",
            "d": "2",
            "abilities": "",
            "sourceSelectionIds": [
              "unit-commander-in-enforcer-battlesuit-selection-missile-pod"
            ]
          },
          {
            "id": "unit-commander-in-enforcer-battlesuit-profile-c445894447",
            "legacyIds": [
              "unit-commander-in-enforcer-battlesuit-profile-burst-cannon-ranged-2"
            ],
            "title": "Burst cannon",
            "mode": "ranged",
            "range": "18\"",
            "a": "4",
            "skill": "3+",
            "s": "5",
            "ap": "0",
            "d": "1",
            "abilities": "",
            "sourceSelectionIds": [
              "unit-commander-in-enforcer-battlesuit-selection-burst-cannon"
            ]
          },
          {
            "id": "unit-commander-in-enforcer-battlesuit-profile-609e473bca",
            "legacyIds": [
              "unit-commander-in-enforcer-battlesuit-profile-airbursting-fragmentation-projector-ranged-3"
            ],
            "title": "Airbursting fragmentation projector",
            "mode": "ranged",
            "range": "24\"",
            "a": "D6",
            "skill": "3+",
            "s": "3",
            "ap": "0",
            "d": "1",
            "abilities": "Blast, Indirect Fire",
            "sourceSelectionIds": [
              "unit-commander-in-enforcer-battlesuit-selection-airbursting-fragmentation-projector"
            ]
          },
          {
            "id": "unit-commander-in-enforcer-battlesuit-profile-1e43d3b17b",
            "legacyIds": [
              "unit-commander-in-enforcer-battlesuit-profile-cyclic-ion-blaster-standard-ranged-4"
            ],
            "title": "➤ Cyclic ion blaster - standard",
            "mode": "ranged",
            "range": "18\"",
            "a": "3",
            "skill": "3+",
            "s": "7",
            "ap": "-1",
            "d": "1",
            "abilities": "",
            "sourceSelectionIds": [
              "unit-commander-in-enforcer-battlesuit-selection-cyclic-ion-blaster-standard",
              "unit-commander-in-enforcer-battlesuit-weapon-family-cyclic-ion-blaster-selection"
            ]
          },
          {
            "id": "unit-commander-in-enforcer-battlesuit-profile-6d0a685a7a",
            "legacyIds": [
              "unit-commander-in-enforcer-battlesuit-profile-cyclic-ion-blaster-overcharge-ranged-5"
            ],
            "title": "➤ Cyclic ion blaster - overcharge",
            "mode": "ranged",
            "range": "18\"",
            "a": "3",
            "skill": "3+",
            "s": "8",
            "ap": "-2",
            "d": "2",
            "abilities": "Hazardous",
            "sourceSelectionIds": [
              "unit-commander-in-enforcer-battlesuit-selection-cyclic-ion-blaster-overcharge",
              "unit-commander-in-enforcer-battlesuit-weapon-family-cyclic-ion-blaster-selection"
            ]
          },
          {
            "id": "unit-commander-in-enforcer-battlesuit-profile-8f7f392529",
            "legacyIds": [
              "unit-commander-in-enforcer-battlesuit-profile-tau-flamer-ranged-6"
            ],
            "title": "T'au flamer",
            "mode": "ranged",
            "range": "12\"",
            "a": "D6",
            "skill": "N/A",
            "s": "4",
            "ap": "0",
            "d": "1",
            "abilities": "Ignores Cover, Torrent",
            "sourceSelectionIds": [
              "unit-commander-in-enforcer-battlesuit-selection-tau-flamer"
            ]
          },
          {
            "id": "unit-commander-in-enforcer-battlesuit-profile-dfe87cda1e",
            "legacyIds": [
              "unit-commander-in-enforcer-battlesuit-profile-fusion-blaster-ranged-7"
            ],
            "title": "Fusion blaster",
            "mode": "ranged",
            "range": "12\"",
            "a": "1",
            "skill": "3+",
            "s": "9",
            "ap": "-4",
            "d": "D6",
            "abilities": "Melta 2",
            "sourceSelectionIds": [
              "unit-commander-in-enforcer-battlesuit-selection-fusion-blaster"
            ]
          },
          {
            "id": "unit-commander-in-enforcer-battlesuit-profile-5b8442099b",
            "legacyIds": [
              "unit-commander-in-enforcer-battlesuit-profile-plasma-rifle-ranged-8"
            ],
            "title": "Plasma rifle",
            "mode": "ranged",
            "range": "18\"",
            "a": "1",
            "skill": "3+",
            "s": "8",
            "ap": "-3",
            "d": "3",
            "abilities": "",
            "sourceSelectionIds": [
              "unit-commander-in-enforcer-battlesuit-selection-plasma-rifle"
            ]
          },
          {
            "id": "unit-commander-in-enforcer-battlesuit-profile-fc3c180c6b",
            "legacyIds": [
              "unit-commander-in-enforcer-battlesuit-profile-battlesuit-fists-melee-9"
            ],
            "title": "Battlesuit fists",
            "mode": "melee",
            "range": "Melee",
            "a": "3",
            "skill": "4+",
            "s": "5",
            "ap": "0",
            "d": "1",
            "abilities": "",
            "sourceSelectionIds": [
              "unit-commander-in-enforcer-battlesuit-selection-battlesuit-fists"
            ]
          },
          {
            "id": "unit-commander-in-enforcer-battlesuit-profile-f98da3d20a",
            "legacyIds": [
              "unit-commander-in-enforcer-battlesuit-profile-twin-pulse-carbine-ranged-10"
            ],
            "title": "Twin pulse carbine",
            "mode": "ranged",
            "range": "20\"",
            "a": "2",
            "skill": "5+",
            "s": "5",
            "ap": "0",
            "d": "1",
            "abilities": "Assault, Twin-linked",
            "sourceSelectionIds": [
              "unit-commander-in-enforcer-battlesuit-selection-twin-pulse-carbine"
            ]
          },
          {
            "id": "unit-commander-in-enforcer-battlesuit-profile-e5f2491af6",
            "legacyIds": [
              "unit-commander-in-enforcer-battlesuit-profile-missile-pod-ranged-11"
            ],
            "title": "Missile pod",
            "mode": "ranged",
            "range": "30\"",
            "a": "2",
            "skill": "5+",
            "s": "7",
            "ap": "-1",
            "d": "2",
            "abilities": "",
            "sourceSelectionIds": [
              "unit-commander-in-enforcer-battlesuit-selection-missile-pod"
            ]
          }
        ],
        "wargearAbilities": [
          {
            "id": "unit-commander-in-enforcer-battlesuit-wargear-ability-abab11a127",
            "sectionId": "unit-commander-in-enforcer-battlesuit-wargear-ability-abab11a127",
            "title": "Battlesuit Support System",
            "text": "The bearer’s unit is eligible to shoot in a turn in which it Fell Back, but when doing so only models equipped with this wargear can make ranged attacks.",
            "sourceUnitId": "unit-commander-in-enforcer-battlesuit",
            "legacyIds": [
              "unit-commander-in-enforcer-battlesuit-wargear-ability-battlesuit-support-system"
            ],
            "requiredSelectionIds": [
              "unit-commander-in-enforcer-battlesuit-selection-battlesuit-support-system"
            ]
          },
          {
            "id": "unit-commander-in-enforcer-battlesuit-wargear-ability-bf1c946221",
            "sectionId": "unit-commander-in-enforcer-battlesuit-wargear-ability-bf1c946221",
            "title": "Shield Generator",
            "text": "The bearer has a 4+ invulnerable save.",
            "sourceUnitId": "unit-commander-in-enforcer-battlesuit",
            "legacyIds": [
              "unit-commander-in-enforcer-battlesuit-wargear-ability-shield-generator-2"
            ],
            "requiredSelectionIds": [
              "unit-commander-in-enforcer-battlesuit-selection-shield-generator"
            ]
          },
          {
            "id": "unit-commander-in-enforcer-battlesuit-wargear-ability-7ca2aa8ecc",
            "sectionId": "unit-commander-in-enforcer-battlesuit-wargear-ability-7ca2aa8ecc",
            "title": "Weapon Support System",
            "text": "Each time the bearer makes a ranged attack, you can ignore any or all modifiers to the Hit roll.",
            "sourceUnitId": "unit-commander-in-enforcer-battlesuit",
            "legacyIds": [
              "unit-commander-in-enforcer-battlesuit-wargear-ability-weapon-support-system-3"
            ],
            "requiredSelectionIds": [
              "unit-commander-in-enforcer-battlesuit-selection-weapon-support-system"
            ]
          },
          {
            "id": "unit-commander-in-enforcer-battlesuit-wargear-ability-054fa4f2b6",
            "sectionId": "unit-commander-in-enforcer-battlesuit-wargear-ability-054fa4f2b6",
            "title": "Marker Drone",
            "text": "The bearer’s unit has the Markerlight keyword and can act as an Observer unit for another unit even if it Advanced this turn.",
            "sourceUnitId": "unit-commander-in-enforcer-battlesuit",
            "legacyIds": [
              "unit-commander-in-enforcer-battlesuit-wargear-ability-marker-drone-4"
            ],
            "requiredSelectionIds": [
              "unit-commander-in-enforcer-battlesuit-selection-marker-drone"
            ]
          },
          {
            "id": "unit-commander-in-enforcer-battlesuit-wargear-ability-bc6aabc321",
            "sectionId": "unit-commander-in-enforcer-battlesuit-wargear-ability-bc6aabc321",
            "title": "Shield Drone",
            "text": "Add 1 to the bearer’s Wounds characteristic.",
            "sourceUnitId": "unit-commander-in-enforcer-battlesuit",
            "legacyIds": [
              "unit-commander-in-enforcer-battlesuit-wargear-ability-shield-drone-5"
            ],
            "requiredSelectionIds": [
              "unit-commander-in-enforcer-battlesuit-selection-shield-drone"
            ]
          },
          {
            "id": "unit-commander-in-enforcer-battlesuit-wargear-ability-24a672615e",
            "sectionId": "unit-commander-in-enforcer-battlesuit-wargear-ability-24a672615e",
            "title": "Guardian Drone",
            "text": "Each time a model makes a ranged attack that targets the bearer’s unit, subtract 1 from the Wound roll.",
            "sourceUnitId": "unit-commander-in-enforcer-battlesuit",
            "legacyIds": [
              "unit-commander-in-enforcer-battlesuit-wargear-ability-guardian-drone-6"
            ],
            "requiredSelectionIds": [
              "unit-commander-in-enforcer-battlesuit-selection-guardian-drone"
            ]
          }
        ],
        "wargearDefaults": [
          {
            "modelId": "unit-commander-in-enforcer-battlesuit-model-a2db67bad0",
            "selections": [
              {
                "selectionId": "unit-commander-in-enforcer-battlesuit-selection-burst-cannon",
                "quantity": 1
              },
              {
                "selectionId": "unit-commander-in-enforcer-battlesuit-selection-battlesuit-fists",
                "quantity": 1
              }
            ]
          }
        ],
        "wargearOptionContracts": [
          {
            "sourceId": "datasheet-commander-in-enforcer-battlesuit:wargear:1",
            "eligibleModelIds": [
              "unit-commander-in-enforcer-battlesuit-model-a2db67bad0"
            ],
            "limit": {
              "perModel": 1
            },
            "choices": [
              {
                "remove": [
                  {
                    "selectionId": "unit-commander-in-enforcer-battlesuit-selection-burst-cannon",
                    "quantity": 1
                  }
                ],
                "add": [
                  {
                    "selectionId": "unit-commander-in-enforcer-battlesuit-selection-airbursting-fragmentation-projector",
                    "quantity": 1
                  }
                ],
                "requiresFinal": [],
                "forbidsFinal": [],
                "sharedUses": [
                  "datasheet-commander-in-enforcer-battlesuit:wargear:4:airbursting-fragmentation-projector"
                ]
              },
              {
                "remove": [
                  {
                    "selectionId": "unit-commander-in-enforcer-battlesuit-selection-burst-cannon",
                    "quantity": 1
                  }
                ],
                "add": [
                  {
                    "selectionId": "unit-commander-in-enforcer-battlesuit-selection-battlesuit-support-system",
                    "quantity": 1
                  }
                ],
                "requiresFinal": [],
                "forbidsFinal": [],
                "sharedUses": [
                  "datasheet-commander-in-enforcer-battlesuit:wargear:4:battlesuit-support-system"
                ]
              },
              {
                "remove": [
                  {
                    "selectionId": "unit-commander-in-enforcer-battlesuit-selection-burst-cannon",
                    "quantity": 1
                  }
                ],
                "add": [
                  {
                    "selectionId": "unit-commander-in-enforcer-battlesuit-weapon-family-cyclic-ion-blaster-selection",
                    "quantity": 1
                  }
                ],
                "requiresFinal": [],
                "forbidsFinal": [],
                "sharedUses": [
                  "datasheet-commander-in-enforcer-battlesuit:wargear:4:cyclic-ion-blaster"
                ]
              },
              {
                "remove": [
                  {
                    "selectionId": "unit-commander-in-enforcer-battlesuit-selection-burst-cannon",
                    "quantity": 1
                  }
                ],
                "add": [
                  {
                    "selectionId": "unit-commander-in-enforcer-battlesuit-selection-fusion-blaster",
                    "quantity": 1
                  }
                ],
                "requiresFinal": [],
                "forbidsFinal": [],
                "sharedUses": []
              },
              {
                "remove": [
                  {
                    "selectionId": "unit-commander-in-enforcer-battlesuit-selection-burst-cannon",
                    "quantity": 1
                  }
                ],
                "add": [
                  {
                    "selectionId": "unit-commander-in-enforcer-battlesuit-selection-missile-pod",
                    "quantity": 1
                  }
                ],
                "requiresFinal": [],
                "forbidsFinal": [],
                "sharedUses": []
              },
              {
                "remove": [
                  {
                    "selectionId": "unit-commander-in-enforcer-battlesuit-selection-burst-cannon",
                    "quantity": 1
                  }
                ],
                "add": [
                  {
                    "selectionId": "unit-commander-in-enforcer-battlesuit-selection-plasma-rifle",
                    "quantity": 1
                  }
                ],
                "requiresFinal": [],
                "forbidsFinal": [],
                "sharedUses": []
              },
              {
                "remove": [
                  {
                    "selectionId": "unit-commander-in-enforcer-battlesuit-selection-burst-cannon",
                    "quantity": 1
                  }
                ],
                "add": [
                  {
                    "selectionId": "unit-commander-in-enforcer-battlesuit-selection-shield-generator",
                    "quantity": 1
                  }
                ],
                "requiresFinal": [],
                "forbidsFinal": [],
                "sharedUses": [
                  "datasheet-commander-in-enforcer-battlesuit:wargear:4:shield-generator"
                ]
              },
              {
                "remove": [
                  {
                    "selectionId": "unit-commander-in-enforcer-battlesuit-selection-burst-cannon",
                    "quantity": 1
                  }
                ],
                "add": [
                  {
                    "selectionId": "unit-commander-in-enforcer-battlesuit-selection-tau-flamer",
                    "quantity": 1
                  }
                ],
                "requiresFinal": [],
                "forbidsFinal": [],
                "sharedUses": []
              },
              {
                "remove": [
                  {
                    "selectionId": "unit-commander-in-enforcer-battlesuit-selection-burst-cannon",
                    "quantity": 1
                  }
                ],
                "add": [
                  {
                    "selectionId": "unit-commander-in-enforcer-battlesuit-selection-weapon-support-system",
                    "quantity": 1
                  }
                ],
                "requiresFinal": [],
                "forbidsFinal": [],
                "sharedUses": [
                  "datasheet-commander-in-enforcer-battlesuit:wargear:4:weapon-support-system"
                ]
              }
            ]
          },
          {
            "sourceId": "datasheet-commander-in-enforcer-battlesuit:wargear:2",
            "eligibleModelIds": [
              "unit-commander-in-enforcer-battlesuit-model-a2db67bad0"
            ],
            "limit": {
              "perModel": 2
            },
            "choices": [
              {
                "remove": [],
                "add": [
                  {
                    "selectionId": "unit-commander-in-enforcer-battlesuit-selection-twin-pulse-carbine",
                    "quantity": 1
                  }
                ],
                "requiresFinal": [],
                "forbidsFinal": [],
                "sharedUses": []
              },
              {
                "remove": [],
                "add": [
                  {
                    "selectionId": "unit-commander-in-enforcer-battlesuit-selection-marker-drone",
                    "quantity": 1
                  }
                ],
                "requiresFinal": [],
                "forbidsFinal": [],
                "sharedUses": []
              },
              {
                "remove": [],
                "add": [
                  {
                    "selectionId": "unit-commander-in-enforcer-battlesuit-selection-shield-drone",
                    "quantity": 1
                  }
                ],
                "requiresFinal": [],
                "forbidsFinal": [],
                "sharedUses": []
              }
            ]
          },
          {
            "sourceId": "datasheet-commander-in-enforcer-battlesuit:wargear:3",
            "eligibleModelIds": [
              "unit-commander-in-enforcer-battlesuit-model-a2db67bad0"
            ],
            "limit": {
              "perModel": 3
            },
            "choices": [
              {
                "remove": [],
                "add": [
                  {
                    "selectionId": "unit-commander-in-enforcer-battlesuit-selection-airbursting-fragmentation-projector",
                    "quantity": 1
                  }
                ],
                "requiresFinal": [],
                "forbidsFinal": [],
                "sharedUses": [
                  "datasheet-commander-in-enforcer-battlesuit:wargear:4:airbursting-fragmentation-projector"
                ]
              },
              {
                "remove": [],
                "add": [
                  {
                    "selectionId": "unit-commander-in-enforcer-battlesuit-selection-battlesuit-support-system",
                    "quantity": 1
                  }
                ],
                "requiresFinal": [],
                "forbidsFinal": [],
                "sharedUses": [
                  "datasheet-commander-in-enforcer-battlesuit:wargear:4:battlesuit-support-system"
                ]
              },
              {
                "remove": [],
                "add": [
                  {
                    "selectionId": "unit-commander-in-enforcer-battlesuit-selection-burst-cannon",
                    "quantity": 1
                  }
                ],
                "requiresFinal": [],
                "forbidsFinal": [],
                "sharedUses": []
              },
              {
                "remove": [],
                "add": [
                  {
                    "selectionId": "unit-commander-in-enforcer-battlesuit-weapon-family-cyclic-ion-blaster-selection",
                    "quantity": 1
                  }
                ],
                "requiresFinal": [],
                "forbidsFinal": [],
                "sharedUses": [
                  "datasheet-commander-in-enforcer-battlesuit:wargear:4:cyclic-ion-blaster"
                ]
              },
              {
                "remove": [],
                "add": [
                  {
                    "selectionId": "unit-commander-in-enforcer-battlesuit-selection-fusion-blaster",
                    "quantity": 1
                  }
                ],
                "requiresFinal": [],
                "forbidsFinal": [],
                "sharedUses": []
              },
              {
                "remove": [],
                "add": [
                  {
                    "selectionId": "unit-commander-in-enforcer-battlesuit-selection-missile-pod",
                    "quantity": 1
                  }
                ],
                "requiresFinal": [],
                "forbidsFinal": [],
                "sharedUses": []
              },
              {
                "remove": [],
                "add": [
                  {
                    "selectionId": "unit-commander-in-enforcer-battlesuit-selection-plasma-rifle",
                    "quantity": 1
                  }
                ],
                "requiresFinal": [],
                "forbidsFinal": [],
                "sharedUses": []
              },
              {
                "remove": [],
                "add": [
                  {
                    "selectionId": "unit-commander-in-enforcer-battlesuit-selection-shield-generator",
                    "quantity": 1
                  }
                ],
                "requiresFinal": [],
                "forbidsFinal": [],
                "sharedUses": [
                  "datasheet-commander-in-enforcer-battlesuit:wargear:4:shield-generator"
                ]
              },
              {
                "remove": [],
                "add": [
                  {
                    "selectionId": "unit-commander-in-enforcer-battlesuit-selection-tau-flamer",
                    "quantity": 1
                  }
                ],
                "requiresFinal": [],
                "forbidsFinal": [],
                "sharedUses": []
              },
              {
                "remove": [],
                "add": [
                  {
                    "selectionId": "unit-commander-in-enforcer-battlesuit-selection-weapon-support-system",
                    "quantity": 1
                  }
                ],
                "requiresFinal": [],
                "forbidsFinal": [],
                "sharedUses": [
                  "datasheet-commander-in-enforcer-battlesuit:wargear:4:weapon-support-system"
                ]
              }
            ]
          }
        ],
        "wargearSharedCaps": [
          {
            "id": "datasheet-commander-in-enforcer-battlesuit:wargear:4:airbursting-fragmentation-projector",
            "max": 1,
            "scope": "model",
            "sourceIds": [
              "datasheet-commander-in-enforcer-battlesuit:wargear:4"
            ]
          },
          {
            "id": "datasheet-commander-in-enforcer-battlesuit:wargear:4:battlesuit-support-system",
            "max": 1,
            "scope": "model",
            "sourceIds": [
              "datasheet-commander-in-enforcer-battlesuit:wargear:4"
            ]
          },
          {
            "id": "datasheet-commander-in-enforcer-battlesuit:wargear:4:cyclic-ion-blaster",
            "max": 1,
            "scope": "model",
            "sourceIds": [
              "datasheet-commander-in-enforcer-battlesuit:wargear:4"
            ]
          },
          {
            "id": "datasheet-commander-in-enforcer-battlesuit:wargear:4:shield-generator",
            "max": 1,
            "scope": "model",
            "sourceIds": [
              "datasheet-commander-in-enforcer-battlesuit:wargear:4"
            ]
          },
          {
            "id": "datasheet-commander-in-enforcer-battlesuit:wargear:4:weapon-support-system",
            "max": 1,
            "scope": "model",
            "sourceIds": [
              "datasheet-commander-in-enforcer-battlesuit:wargear:4"
            ]
          }
        ]
      }
    },
    {
      "id": "unit-ethereal",
      "title": "Ethereal",
      "sourceBookId": "tau-empire",
      "sourceLayer": "codex",
      "intrinsicKeywords": [
        "Infantry",
        "Character",
        "Ethereal",
        "T'au Empire"
      ],
      "relations": {
        "canLead": [
          {
            "unitId": "unit-breacher-team",
            "maxCharacters": 1
          },
          {
            "unitId": "unit-strike-team",
            "maxCharacters": 1
          }
        ],
        "canSupport": [],
        "canBeLedBy": [],
        "canBeSupportedBy": []
      },
      "ruleFacts": {
        "relations": {
          "canLead": [
            {
              "unitId": "unit-breacher-team",
              "maxCharacters": 1
            },
            {
              "unitId": "unit-strike-team",
              "maxCharacters": 1
            }
          ],
          "canSupport": [],
          "canBeLedBy": [],
          "canBeSupportedBy": []
        }
      },
      "gameSelections": {
        "stats": {
          "M": "6\"",
          "T": "3",
          "Sv": "5+",
          "W": "3",
          "Ld": "6+",
          "OC": "1",
          "Invulnerable": "5+"
        },
        "statProfiles": [],
        "abilities": [
          {
            "id": "tau-empire-ability-coordinated-leadership",
            "sectionId": "tau-empire-ability-coordinated-leadership",
            "title": "Coordinated Leadership",
            "text": "At the end of your Command phase, roll one D6: on a 4+, you gain 1CP.",
            "sourceUnitId": "unit-ethereal"
          },
          {
            "id": "tau-empire-ability-failure-is-not-an-option",
            "sectionId": "tau-empire-ability-failure-is-not-an-option",
            "title": "Failure Is Not an Option",
            "text": "While this model is leading a unit, models in that unit have the Feel No Pain 5+ ability.",
            "sourceUnitId": "unit-ethereal"
          },
          {
            "id": "tau-empire-ability-for-the-greater-good",
            "sectionId": "tau-empire-ability-for-the-greater-good",
            "title": "For The Greater Good",
            "text": "If your Army Faction is T’AU EMPIRE, at the start of your Shooting phase you can select units from your army with this ability to become Observer units.\n\nDuring your Shooting phase, for each Observer unit from your army that has not been selected to shoot this phase and is eligible to shoot (excluding FORTIFICATION and Battle-shocked units) select one enemy unit that is visible to be marked as their Spotted unit until the end of the phase. Each enemy unit can only be marked as a Spotted unit once per phase.\n\nUnits from your army with the For the Greater Good ability (excluding Observer units) are Guided units while targeting one or more Spotted units.\n\nUntil the end of the phase, each time a model from your army in a Guided unit makes an attack that targets a Spotted unit, improve the Ballistic Skill characteristic of that attack by 1 and, if the Spotted unit was marked by an Observer unit that has the Markerlight keyword, that attack has the [IGNORES COVER] ability.",
            "sourceUnitId": "unit-ethereal"
          },
          {
            "id": "core-leader",
            "sectionId": "core-leader",
            "title": "Leader",
            "text": "While a Bodyguard unit contains a Leader, it is known as an Attached unit and, with the exception of rules that are triggered when units are destroyed (pg 12), it is treated as a single unit for all rules purposes. Each time an attack targets an Attached unit, until the attacking unit has resolved all of its attacks, you must use the Toughness characteristic of the Bodyguard models in that unit, even if a Leader in that unit has a different Toughness characteristic. Each time an attack successfully wounds an Attached unit, that attack cannot be allocated to a Character model in that unit, even if that Character model has lost one or more wounds or has already had attacks allocated to it this phase. As soon as the last Bodyguard model in an Attached unit has been destroyed, any attacks made against that unit that have yet to be allocated can then be allocated to Character models in that unit.\n\nEach time the last model in a Bodyguard unit is destroyed, each CHARACTER unit that is part of that Attached unit becomes a separate unit, with its original Starting Strength. If this happens as the result of an attack, they become separate units after the attacking unit has resolved all of its attacks. \n\nEach time the last model in a CHARACTER unit that is attached to a Bodyguard unit is destroyed and there is not another CHARACTER unit attached, that Attached unit’s Bodyguard unit becomes a separate unit, with its original Starting Strength. If this happens as the result of an attack, they become separate units after the attacking unit has resolved all of its attacks. \n\nEach time a unit that is part of an Attached unit is destroyed, it does not have the keywords of any other units that make up that Attached unit (unless it has those keywords on its own datasheet) for the purposes of any rules that would be triggered when that unit is destroyed.",
            "sourceUnitId": "unit-ethereal"
          },
          {
            "id": "core-feel-no-pain",
            "sectionId": "core-feel-no-pain",
            "title": "Feel No Pain",
            "text": "This ability always takes the form Feel No Pain X+. Each time a model with this ability would lose a wound, roll one D6: on an X+, that wound is not lost.",
            "sourceUnitId": "unit-ethereal"
          }
        ],
        "models": [
          {
            "id": "unit-ethereal-model-97561d5dc9",
            "title": "Ethereal",
            "aliases": [
              "Ethereal"
            ],
            "min": 1,
            "max": 1,
            "legacyIds": [
              "unit-ethereal-model-ethereal"
            ]
          }
        ],
        "compositionRules": [],
        "selections": [
          {
            "id": "unit-ethereal-selection-honour-stave",
            "title": "Honour stave",
            "aliases": [
              "Honour stave"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-ethereal-profile-7639554f3f"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-ethereal-selection-twin-pulse-carbine",
            "title": "Twin pulse carbine",
            "aliases": [
              "Twin pulse carbine"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-ethereal-profile-f98da3d20a"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-ethereal-selection-missile-pod",
            "title": "Missile pod",
            "aliases": [
              "Missile pod"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-ethereal-profile-e5f2491af6"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-ethereal-selection-hover-drone",
            "title": "Hover Drone",
            "aliases": [
              "Hover Drone"
            ],
            "kind": "wargear",
            "profileIds": [],
            "wargearAbilityIds": [
              "unit-ethereal-wargear-ability-66ef7c251c"
            ]
          },
          {
            "id": "unit-ethereal-selection-marker-drone",
            "title": "Marker Drone",
            "aliases": [
              "Marker Drone"
            ],
            "kind": "wargear",
            "profileIds": [],
            "wargearAbilityIds": [
              "unit-ethereal-wargear-ability-054fa4f2b6"
            ]
          },
          {
            "id": "unit-ethereal-selection-shield-drone",
            "title": "Shield Drone",
            "aliases": [
              "Shield Drone"
            ],
            "kind": "wargear",
            "profileIds": [],
            "wargearAbilityIds": [
              "unit-ethereal-wargear-ability-bc6aabc321"
            ]
          },
          {
            "id": "unit-ethereal-selection-guardian-drone",
            "title": "Guardian Drone",
            "aliases": [
              "Guardian Drone"
            ],
            "kind": "wargear",
            "profileIds": [],
            "wargearAbilityIds": [
              "unit-ethereal-wargear-ability-24a672615e"
            ]
          }
        ],
        "weaponFamilies": [],
        "weaponProfiles": [
          {
            "id": "unit-ethereal-profile-7639554f3f",
            "legacyIds": [
              "unit-ethereal-profile-honour-stave-melee"
            ],
            "title": "Honour stave",
            "mode": "melee",
            "range": "Melee",
            "a": "2",
            "skill": "4+",
            "s": "5",
            "ap": "0",
            "d": "1",
            "abilities": "",
            "sourceSelectionIds": [
              "unit-ethereal-selection-honour-stave"
            ]
          },
          {
            "id": "unit-ethereal-profile-f98da3d20a",
            "legacyIds": [
              "unit-ethereal-profile-twin-pulse-carbine-ranged-2"
            ],
            "title": "Twin pulse carbine",
            "mode": "ranged",
            "range": "20\"",
            "a": "2",
            "skill": "5+",
            "s": "5",
            "ap": "0",
            "d": "1",
            "abilities": "Assault, Twin-linked",
            "sourceSelectionIds": [
              "unit-ethereal-selection-twin-pulse-carbine"
            ]
          },
          {
            "id": "unit-ethereal-profile-e5f2491af6",
            "legacyIds": [
              "unit-ethereal-profile-missile-pod-ranged-3"
            ],
            "title": "Missile pod",
            "mode": "ranged",
            "range": "30\"",
            "a": "2",
            "skill": "5+",
            "s": "7",
            "ap": "-1",
            "d": "2",
            "abilities": "",
            "sourceSelectionIds": [
              "unit-ethereal-selection-missile-pod"
            ]
          }
        ],
        "wargearAbilities": [
          {
            "id": "unit-ethereal-wargear-ability-66ef7c251c",
            "sectionId": "unit-ethereal-wargear-ability-66ef7c251c",
            "title": "Hover Drone",
            "text": "The bearer can FLY and has a Move characteristic of 10\".",
            "sourceUnitId": "unit-ethereal",
            "legacyIds": [
              "unit-ethereal-wargear-ability-hover-drone"
            ],
            "requiredSelectionIds": [
              "unit-ethereal-selection-hover-drone"
            ]
          },
          {
            "id": "unit-ethereal-wargear-ability-054fa4f2b6",
            "sectionId": "unit-ethereal-wargear-ability-054fa4f2b6",
            "title": "Marker Drone",
            "text": "The bearer’s unit has the Markerlight keyword and can act as an Observer unit for another unit even if it Advanced this turn.",
            "sourceUnitId": "unit-ethereal",
            "legacyIds": [
              "unit-ethereal-wargear-ability-marker-drone-2"
            ],
            "requiredSelectionIds": [
              "unit-ethereal-selection-marker-drone"
            ]
          },
          {
            "id": "unit-ethereal-wargear-ability-bc6aabc321",
            "sectionId": "unit-ethereal-wargear-ability-bc6aabc321",
            "title": "Shield Drone",
            "text": "Add 1 to the bearer’s Wounds characteristic.",
            "sourceUnitId": "unit-ethereal",
            "legacyIds": [
              "unit-ethereal-wargear-ability-shield-drone-3"
            ],
            "requiredSelectionIds": [
              "unit-ethereal-selection-shield-drone"
            ]
          },
          {
            "id": "unit-ethereal-wargear-ability-24a672615e",
            "sectionId": "unit-ethereal-wargear-ability-24a672615e",
            "title": "Guardian Drone",
            "text": "Each time a model makes a ranged attack that targets the bearer’s unit, subtract 1 from the Wound roll.",
            "sourceUnitId": "unit-ethereal",
            "legacyIds": [
              "unit-ethereal-wargear-ability-guardian-drone-4"
            ],
            "requiredSelectionIds": [
              "unit-ethereal-selection-guardian-drone"
            ]
          }
        ],
        "wargearDefaults": [
          {
            "modelId": "unit-ethereal-model-97561d5dc9",
            "selections": [
              {
                "selectionId": "unit-ethereal-selection-honour-stave",
                "quantity": 1
              }
            ]
          }
        ],
        "wargearOptionContracts": [
          {
            "sourceId": "datasheet-ethereal:wargear:1",
            "eligibleModelIds": [
              "unit-ethereal-model-97561d5dc9"
            ],
            "limit": {
              "perModel": 1
            },
            "choices": [
              {
                "remove": [],
                "add": [
                  {
                    "selectionId": "unit-ethereal-selection-hover-drone",
                    "quantity": 1
                  }
                ],
                "requiresFinal": [],
                "forbidsFinal": [],
                "sharedUses": []
              }
            ]
          },
          {
            "sourceId": "datasheet-ethereal:wargear:2",
            "eligibleModelIds": [
              "unit-ethereal-model-97561d5dc9"
            ],
            "limit": {
              "perModel": 2
            },
            "choices": [
              {
                "remove": [],
                "add": [
                  {
                    "selectionId": "unit-ethereal-selection-twin-pulse-carbine",
                    "quantity": 1
                  }
                ],
                "requiresFinal": [],
                "forbidsFinal": [],
                "sharedUses": []
              },
              {
                "remove": [],
                "add": [
                  {
                    "selectionId": "unit-ethereal-selection-marker-drone",
                    "quantity": 1
                  }
                ],
                "requiresFinal": [],
                "forbidsFinal": [],
                "sharedUses": []
              },
              {
                "remove": [],
                "add": [
                  {
                    "selectionId": "unit-ethereal-selection-shield-drone",
                    "quantity": 1
                  }
                ],
                "requiresFinal": [],
                "forbidsFinal": [],
                "sharedUses": []
              }
            ]
          }
        ],
        "wargearSharedCaps": []
      }
    },
    {
      "id": "unit-firesight-team",
      "title": "Firesight Team",
      "sourceBookId": "tau-empire",
      "sourceLayer": "codex",
      "intrinsicKeywords": [
        "Infantry",
        "Character",
        "Markerlight",
        "Firesight Team",
        "T'au Empire"
      ],
      "relations": {
        "canLead": [],
        "canSupport": [],
        "canBeLedBy": [],
        "canBeSupportedBy": []
      },
      "ruleFacts": {
        "relations": {
          "canLead": [],
          "canSupport": [],
          "canBeLedBy": [],
          "canBeSupportedBy": []
        }
      },
      "gameSelections": {
        "stats": {
          "M": "6\"",
          "T": "3",
          "Sv": "4+",
          "W": "4",
          "Ld": "7+",
          "OC": "3",
          "Invulnerable": ""
        },
        "statProfiles": [],
        "abilities": [
          {
            "id": "tau-empire-ability-precise-targeting",
            "sectionId": "tau-empire-ability-precise-targeting",
            "title": "Precise Targeting",
            "text": "Each time a model in this unit makes an attack that targets a Spotted unit, you can re-roll the Hit roll.",
            "sourceUnitId": "unit-firesight-team"
          },
          {
            "id": "core-infiltrators",
            "sectionId": "core-infiltrators",
            "title": "Infiltrators",
            "text": "During deployment, if every model in a unit has this ability, it can be set up anywhere on the battlefield that is more than 8\" horizontally from your opponent’s deployment zone and all enemy units.",
            "sourceUnitId": "unit-firesight-team"
          },
          {
            "id": "core-lone-operative",
            "sectionId": "core-lone-operative",
            "title": "Lone Operative",
            "text": "Unless part of an attached unit, this unit is not visible to enemy models unless they are within 12\" of this unit, and it cannot be targeted by [INDIRECT FIRE] weapons unless the attacking model is within 12\" of this unit. \nIf this ability takes the form Lone Operative X\", unless part of an attached unit, this unit is not visible to enemy models unless they are within X\" of this unit, and it cannot be targeted by [INDIRECT FIRE] weapons unless the attacking model is within X\" of this unit.",
            "sourceUnitId": "unit-firesight-team"
          },
          {
            "id": "core-stealth",
            "sectionId": "core-stealth",
            "title": "Stealth",
            "text": "If every model in a unit has this ability, each time a ranged attack targets that unit, that unit has the benefit of cover against that attack (13.08).",
            "sourceUnitId": "unit-firesight-team"
          },
          {
            "id": "tau-empire-ability-for-the-greater-good",
            "sectionId": "tau-empire-ability-for-the-greater-good",
            "title": "For The Greater Good",
            "text": "If your Army Faction is T’AU EMPIRE, at the start of your Shooting phase you can select units from your army with this ability to become Observer units.\n\nDuring your Shooting phase, for each Observer unit from your army that has not been selected to shoot this phase and is eligible to shoot (excluding FORTIFICATION and Battle-shocked units) select one enemy unit that is visible to be marked as their Spotted unit until the end of the phase. Each enemy unit can only be marked as a Spotted unit once per phase.\n\nUnits from your army with the For the Greater Good ability (excluding Observer units) are Guided units while targeting one or more Spotted units.\n\nUntil the end of the phase, each time a model from your army in a Guided unit makes an attack that targets a Spotted unit, improve the Ballistic Skill characteristic of that attack by 1 and, if the Spotted unit was marked by an Observer unit that has the Markerlight keyword, that attack has the [IGNORES COVER] ability.",
            "sourceUnitId": "unit-firesight-team"
          }
        ],
        "models": [
          {
            "id": "unit-firesight-team-model-fdb47ef6e5",
            "title": "Firesight Team",
            "aliases": [
              "Firesight Team"
            ],
            "min": 1,
            "max": 1,
            "legacyIds": [
              "unit-firesight-team-model-firesight-team"
            ]
          }
        ],
        "compositionRules": [],
        "selections": [
          {
            "id": "unit-firesight-team-selection-close-combat-weapons",
            "title": "Close combat weapons",
            "aliases": [
              "Close combat weapons"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-firesight-team-profile-2b5085d765"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-firesight-team-selection-longshot-pulse-rifles",
            "title": "Longshot pulse rifles",
            "aliases": [
              "Longshot pulse rifles"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-firesight-team-profile-27e22e1406"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-firesight-team-selection-pulse-pistol",
            "title": "Pulse pistol",
            "aliases": [
              "Pulse pistol"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-firesight-team-profile-3722574bac"
            ],
            "wargearAbilityIds": []
          }
        ],
        "weaponFamilies": [],
        "weaponProfiles": [
          {
            "id": "unit-firesight-team-profile-2b5085d765",
            "legacyIds": [
              "unit-firesight-team-profile-close-combat-weapons-melee"
            ],
            "title": "Close combat weapons",
            "mode": "melee",
            "range": "Melee",
            "a": "4",
            "skill": "5+",
            "s": "3",
            "ap": "0",
            "d": "1",
            "abilities": "",
            "sourceSelectionIds": [
              "unit-firesight-team-selection-close-combat-weapons"
            ]
          },
          {
            "id": "unit-firesight-team-profile-27e22e1406",
            "legacyIds": [
              "unit-firesight-team-profile-longshot-pulse-rifles-ranged-2"
            ],
            "title": "Longshot pulse rifles",
            "mode": "ranged",
            "range": "36\"",
            "a": "3",
            "skill": "4+",
            "s": "5",
            "ap": "-1",
            "d": "2",
            "abilities": "Heavy, Precision",
            "sourceSelectionIds": [
              "unit-firesight-team-selection-longshot-pulse-rifles"
            ]
          },
          {
            "id": "unit-firesight-team-profile-3722574bac",
            "legacyIds": [
              "unit-firesight-team-profile-pulse-pistol-ranged-3"
            ],
            "title": "Pulse pistol",
            "mode": "ranged",
            "range": "12\"",
            "a": "1",
            "skill": "3+",
            "s": "5",
            "ap": "0",
            "d": "1",
            "abilities": "Pistol",
            "sourceSelectionIds": [
              "unit-firesight-team-selection-pulse-pistol"
            ]
          }
        ],
        "wargearAbilities": [],
        "wargearDefaults": [
          {
            "modelId": "unit-firesight-team-model-fdb47ef6e5",
            "selections": [
              {
                "selectionId": "unit-firesight-team-selection-longshot-pulse-rifles",
                "quantity": 1
              },
              {
                "selectionId": "unit-firesight-team-selection-pulse-pistol",
                "quantity": 1
              },
              {
                "selectionId": "unit-firesight-team-selection-close-combat-weapons",
                "quantity": 1
              }
            ]
          }
        ],
        "wargearOptionContracts": [],
        "wargearSharedCaps": [],
        "wargearDeclarations": [
          {
            "sourceRuleId": "datasheet-firesight-team:wargear:1",
            "kind": "NO_SELECTABLE_OPTION"
          }
        ]
      }
    },
    {
      "id": "unit-kroot-flesh-shaper",
      "title": "Kroot Flesh Shaper",
      "sourceBookId": "tau-empire",
      "sourceLayer": "codex",
      "intrinsicKeywords": [
        "Infantry",
        "Character",
        "Kroot",
        "Shaper",
        "Flesh Shaper",
        "T'au Empire"
      ],
      "relations": {
        "canLead": [
          {
            "unitId": "unit-kroot-carnivores",
            "maxCharacters": 1,
            "attachmentGroupConstraint": {
              "id": "attachment-group-kroot-carnivores-bodyguard",
              "targetUnitId": "unit-kroot-carnivores",
              "sourceUnitIds": [
                "unit-kroot-flesh-shaper",
                "unit-kroot-trail-shaper",
                "unit-kroot-war-shaper"
              ],
              "role": "leader",
              "totalCapacity": 2,
              "perRoleCapacity": 2,
              "sameCanonicalLimit": 1,
              "bodyguardPredicate": {
                "kind": "STARTING_STRENGTH_EQUALS",
                "value": 20
              },
              "mandatoryParticipant": false,
              "source": {
                "kind": "accepted-army-ability",
                "sourceId": "tau-codex-transcription",
                "sourceUnitId": "unit-kroot-carnivores",
                "sourceAbilityId": "d0e7-bbff-a4f8-1b2d"
              },
              "provenance": {
                "sourceId": "tau-codex-transcription",
                "sourceRevision": "2",
                "sourceCommit": "fa30730fca11fbfe87be90684d481d50e0efaf66",
                "currentness": "CURRENT",
                "verifiedAt": "2026-09-22"
              }
            }
          },
          {
            "unitId": "unit-kroot-farstalkers",
            "maxCharacters": 1
          }
        ],
        "canSupport": [],
        "canBeLedBy": [],
        "canBeSupportedBy": []
      },
      "ruleFacts": {
        "relations": {
          "canLead": [
            {
              "unitId": "unit-kroot-carnivores",
              "maxCharacters": 1,
              "attachmentGroupConstraint": {
                "id": "attachment-group-kroot-carnivores-bodyguard",
                "targetUnitId": "unit-kroot-carnivores",
                "sourceUnitIds": [
                  "unit-kroot-flesh-shaper",
                  "unit-kroot-trail-shaper",
                  "unit-kroot-war-shaper"
                ],
                "role": "leader",
                "totalCapacity": 2,
                "perRoleCapacity": 2,
                "sameCanonicalLimit": 1,
                "bodyguardPredicate": {
                  "kind": "STARTING_STRENGTH_EQUALS",
                  "value": 20
                },
                "mandatoryParticipant": false,
                "source": {
                  "kind": "accepted-army-ability",
                  "sourceId": "tau-codex-transcription",
                  "sourceUnitId": "unit-kroot-carnivores",
                  "sourceAbilityId": "d0e7-bbff-a4f8-1b2d"
                },
                "provenance": {
                  "sourceId": "tau-codex-transcription",
                  "sourceRevision": "2",
                  "sourceCommit": "fa30730fca11fbfe87be90684d481d50e0efaf66",
                  "currentness": "CURRENT",
                  "verifiedAt": "2026-09-22"
                }
              }
            },
            {
              "unitId": "unit-kroot-farstalkers",
              "maxCharacters": 1
            }
          ],
          "canSupport": [],
          "canBeLedBy": [],
          "canBeSupportedBy": []
        }
      },
      "gameSelections": {
        "stats": {
          "M": "7\"",
          "T": "3",
          "Sv": "6+",
          "W": "3",
          "Ld": "7+",
          "OC": "1",
          "Invulnerable": ""
        },
        "statProfiles": [],
        "abilities": [
          {
            "id": "tau-empire-ability-rites-of-feasting",
            "sectionId": "tau-empire-ability-rites-of-feasting",
            "title": "Rites of Feasting",
            "text": "While this model is leading a unit, models in that unit have the Feel No Pain 6+ ability. If that unit destroys one or more enemy units in the Fight phase, until the end of the battle, models in that unit have the Feel No Pain 5+ ability instead.",
            "sourceUnitId": "unit-kroot-flesh-shaper"
          },
          {
            "id": "tau-empire-ability-ritual-butchery",
            "sectionId": "tau-empire-ability-ritual-butchery",
            "title": "Ritual Butchery",
            "text": "While this model is leading a unit, melee weapons equipped by models in that unit have the [SUSTAINED HITS 1] ability.",
            "sourceUnitId": "unit-kroot-flesh-shaper"
          },
          {
            "id": "core-infiltrators",
            "sectionId": "core-infiltrators",
            "title": "Infiltrators",
            "text": "During deployment, if every model in a unit has this ability, it can be set up anywhere on the battlefield that is more than 8\" horizontally from your opponent’s deployment zone and all enemy units.",
            "sourceUnitId": "unit-kroot-flesh-shaper"
          },
          {
            "id": "core-scouts",
            "sectionId": "core-scouts",
            "title": "Scouts 7\"",
            "text": "This ability always takes the form Scouts X\". In the Resolve Pre-battle Abilities step, if every model in a unit has this ability, you can do one of the following: \n- If that unit is in strategic reserves, you can set up that unit anywhere that is wholly within your deployment zone. \n- If that unit is wholly within your deployment zone, it can make a scout move. \n- If that unit is embarked within a DEDICATED TRANSPORT that is wholly within your deployment zone, and if every model embarked within that DEDICATED TRANSPORT has the Scouts ability, that DEDICATED TRANSPORT can make a scout move.",
            "sourceUnitId": "unit-kroot-flesh-shaper"
          },
          {
            "id": "core-stealth",
            "sectionId": "core-stealth",
            "title": "Stealth",
            "text": "If every model in a unit has this ability, each time a ranged attack targets that unit, that unit has the benefit of cover against that attack (13.08).",
            "sourceUnitId": "unit-kroot-flesh-shaper"
          },
          {
            "id": "core-leader",
            "sectionId": "core-leader",
            "title": "Leader",
            "text": "While a Bodyguard unit contains a Leader, it is known as an Attached unit and, with the exception of rules that are triggered when units are destroyed (pg 12), it is treated as a single unit for all rules purposes. Each time an attack targets an Attached unit, until the attacking unit has resolved all of its attacks, you must use the Toughness characteristic of the Bodyguard models in that unit, even if a Leader in that unit has a different Toughness characteristic. Each time an attack successfully wounds an Attached unit, that attack cannot be allocated to a Character model in that unit, even if that Character model has lost one or more wounds or has already had attacks allocated to it this phase. As soon as the last Bodyguard model in an Attached unit has been destroyed, any attacks made against that unit that have yet to be allocated can then be allocated to Character models in that unit.\n\nEach time the last model in a Bodyguard unit is destroyed, each CHARACTER unit that is part of that Attached unit becomes a separate unit, with its original Starting Strength. If this happens as the result of an attack, they become separate units after the attacking unit has resolved all of its attacks. \n\nEach time the last model in a CHARACTER unit that is attached to a Bodyguard unit is destroyed and there is not another CHARACTER unit attached, that Attached unit’s Bodyguard unit becomes a separate unit, with its original Starting Strength. If this happens as the result of an attack, they become separate units after the attacking unit has resolved all of its attacks. \n\nEach time a unit that is part of an Attached unit is destroyed, it does not have the keywords of any other units that make up that Attached unit (unless it has those keywords on its own datasheet) for the purposes of any rules that would be triggered when that unit is destroyed.",
            "sourceUnitId": "unit-kroot-flesh-shaper"
          },
          {
            "id": "core-feel-no-pain",
            "sectionId": "core-feel-no-pain",
            "title": "Feel No Pain",
            "text": "This ability always takes the form Feel No Pain X+. Each time a model with this ability would lose a wound, roll one D6: on an X+, that wound is not lost.",
            "sourceUnitId": "unit-kroot-flesh-shaper"
          },
          {
            "id": "core-sustained-hits",
            "sectionId": "core-sustained-hits",
            "title": "Sustained Hits",
            "text": "This ability always takes the form [SUSTAINED HITS X]. Each time an attack made with a [SUSTAINED HITS] weapon results in a critical hit, that attack results in a number of additional hits on the target as denoted by X.\n *Example: An attack made with a [SUSTAINED HITS 2] weapon results in a critical hit. That attack therefore hits the target three times (once from the critical hit, and twice more from the [SUSTAINED HITS 2] ability).",
            "sourceUnitId": "unit-kroot-flesh-shaper"
          }
        ],
        "models": [
          {
            "id": "unit-kroot-flesh-shaper-model-db790cdbf5",
            "title": "Kroot Flesh Shaper",
            "aliases": [
              "Kroot Flesh Shaper"
            ],
            "min": 1,
            "max": 1,
            "legacyIds": [
              "unit-kroot-flesh-shaper-model-kroot-flesh-shaper"
            ]
          }
        ],
        "compositionRules": [],
        "selections": [
          {
            "id": "unit-kroot-flesh-shaper-selection-twin-ritualistic-blades",
            "title": "Twin ritualistic blades",
            "aliases": [
              "Twin ritualistic blades"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-kroot-flesh-shaper-profile-29fae58543"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-kroot-flesh-shaper-selection-kroot-scattergun",
            "title": "Kroot scattergun",
            "aliases": [
              "Kroot scattergun"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-kroot-flesh-shaper-profile-0bfccfee56"
            ],
            "wargearAbilityIds": []
          }
        ],
        "weaponFamilies": [],
        "weaponProfiles": [
          {
            "id": "unit-kroot-flesh-shaper-profile-29fae58543",
            "legacyIds": [
              "unit-kroot-flesh-shaper-profile-twin-ritualistic-blades-melee"
            ],
            "title": "Twin ritualistic blades",
            "mode": "melee",
            "range": "Melee",
            "a": "4",
            "skill": "2+",
            "s": "5",
            "ap": "-1",
            "d": "1",
            "abilities": "Twin-linked",
            "sourceSelectionIds": [
              "unit-kroot-flesh-shaper-selection-twin-ritualistic-blades"
            ]
          },
          {
            "id": "unit-kroot-flesh-shaper-profile-0bfccfee56",
            "legacyIds": [
              "unit-kroot-flesh-shaper-profile-kroot-scattergun-ranged-2"
            ],
            "title": "Kroot scattergun",
            "mode": "ranged",
            "range": "12\"",
            "a": "2",
            "skill": "4+",
            "s": "4",
            "ap": "0",
            "d": "1",
            "abilities": "Assault",
            "sourceSelectionIds": [
              "unit-kroot-flesh-shaper-selection-kroot-scattergun"
            ]
          }
        ],
        "wargearAbilities": [],
        "wargearDefaults": [],
        "wargearOptionContracts": [],
        "wargearSharedCaps": []
      }
    },
    {
      "id": "unit-kroot-lone-spear",
      "title": "Kroot Lone-spear",
      "sourceBookId": "tau-empire",
      "sourceLayer": "codex",
      "intrinsicKeywords": [
        "Mounted",
        "Character",
        "Kroot",
        "Lone-Spear",
        "T'au Empire"
      ],
      "relations": {
        "canLead": [],
        "canSupport": [],
        "canBeLedBy": [],
        "canBeSupportedBy": []
      },
      "ruleFacts": {
        "relations": {
          "canLead": [],
          "canSupport": [],
          "canBeLedBy": [],
          "canBeSupportedBy": []
        }
      },
      "gameSelections": {
        "stats": {
          "M": "12\"",
          "T": "5",
          "Sv": "5+",
          "W": "6",
          "Ld": "7+",
          "OC": "2",
          "Invulnerable": ""
        },
        "statProfiles": [],
        "abilities": [
          {
            "id": "tau-empire-ability-fire-and-fade",
            "sectionId": "tau-empire-ability-fire-and-fade",
            "title": "Fire and Fade",
            "text": "In your Shooting phase, after this model has shot, if it is not within Engagement Range of one or more enemy units, it can make a Normal move of up to 6\". If it does, until the end of the turn, this model is not eligible to declare a charge.",
            "sourceUnitId": "unit-kroot-lone-spear"
          },
          {
            "id": "tau-empire-ability-advanced-scouting",
            "sectionId": "tau-empire-ability-advanced-scouting",
            "title": "Advanced Scouting",
            "text": "Each time this model makes a ranged attack that hits an enemy unit, until the end of the turn, each time another KROOT model from your army makes an attack that targets that enemy unit, you can re-roll the Hit roll.",
            "sourceUnitId": "unit-kroot-lone-spear"
          },
          {
            "id": "core-stealth",
            "sectionId": "core-stealth",
            "title": "Stealth",
            "text": "If every model in a unit has this ability, each time a ranged attack targets that unit, that unit has the benefit of cover against that attack (13.08).",
            "sourceUnitId": "unit-kroot-lone-spear"
          },
          {
            "id": "core-lone-operative",
            "sectionId": "core-lone-operative",
            "title": "Lone Operative",
            "text": "Unless part of an attached unit, this unit is not visible to enemy models unless they are within 12\" of this unit, and it cannot be targeted by [INDIRECT FIRE] weapons unless the attacking model is within 12\" of this unit. \nIf this ability takes the form Lone Operative X\", unless part of an attached unit, this unit is not visible to enemy models unless they are within X\" of this unit, and it cannot be targeted by [INDIRECT FIRE] weapons unless the attacking model is within X\" of this unit.",
            "sourceUnitId": "unit-kroot-lone-spear"
          },
          {
            "id": "core-scouts",
            "sectionId": "core-scouts",
            "title": "Scouts 7\"",
            "text": "This ability always takes the form Scouts X\". In the Resolve Pre-battle Abilities step, if every model in a unit has this ability, you can do one of the following: \n- If that unit is in strategic reserves, you can set up that unit anywhere that is wholly within your deployment zone. \n- If that unit is wholly within your deployment zone, it can make a scout move. \n- If that unit is embarked within a DEDICATED TRANSPORT that is wholly within your deployment zone, and if every model embarked within that DEDICATED TRANSPORT has the Scouts ability, that DEDICATED TRANSPORT can make a scout move.",
            "sourceUnitId": "unit-kroot-lone-spear"
          }
        ],
        "models": [
          {
            "id": "unit-kroot-lone-spear-model-f4fab8b4b7",
            "title": "Kroot Lone-spear",
            "aliases": [
              "Kroot Lone-spear"
            ],
            "min": 1,
            "max": 1,
            "legacyIds": [
              "unit-kroot-lone-spear-model-kroot-lone-spear"
            ]
          }
        ],
        "compositionRules": [],
        "selections": [
          {
            "id": "unit-kroot-lone-spear-selection-close-combat-weapon",
            "title": "Close combat weapon",
            "aliases": [
              "Close combat weapon"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-kroot-lone-spear-profile-38edd622b4"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-kroot-lone-spear-selection-hunting-javelin",
            "title": "Hunting javelin",
            "aliases": [
              "Hunting javelin"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-kroot-lone-spear-profile-4d6a018dc6"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-kroot-lone-spear-selection-blast-javelin",
            "title": "Blast javelin",
            "aliases": [
              "Blast javelin"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-kroot-lone-spear-profile-7cf8530434"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-kroot-lone-spear-selection-kroot-long-gun",
            "title": "Kroot long gun",
            "aliases": [
              "Kroot long gun"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-kroot-lone-spear-profile-6f5a875a58"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-kroot-lone-spear-selection-kalamandras-bite",
            "title": "Kalamandra's bite",
            "aliases": [
              "Kalamandra's bite"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-kroot-lone-spear-profile-46fdc91c1b"
            ],
            "wargearAbilityIds": []
          }
        ],
        "weaponFamilies": [],
        "weaponProfiles": [
          {
            "id": "unit-kroot-lone-spear-profile-38edd622b4",
            "legacyIds": [
              "unit-kroot-lone-spear-profile-close-combat-weapon-melee"
            ],
            "title": "Close combat weapon",
            "mode": "melee",
            "range": "Melee",
            "a": "3",
            "skill": "3+",
            "s": "4",
            "ap": "0",
            "d": "1",
            "abilities": "",
            "sourceSelectionIds": [
              "unit-kroot-lone-spear-selection-close-combat-weapon"
            ]
          },
          {
            "id": "unit-kroot-lone-spear-profile-4d6a018dc6",
            "legacyIds": [
              "unit-kroot-lone-spear-profile-hunting-javelin-melee-2"
            ],
            "title": "Hunting javelin",
            "mode": "melee",
            "range": "Melee",
            "a": "3",
            "skill": "3+",
            "s": "4",
            "ap": "-1",
            "d": "1",
            "abilities": "Lance",
            "sourceSelectionIds": [
              "unit-kroot-lone-spear-selection-hunting-javelin"
            ]
          },
          {
            "id": "unit-kroot-lone-spear-profile-7cf8530434",
            "legacyIds": [
              "unit-kroot-lone-spear-profile-blast-javelin-ranged-3"
            ],
            "title": "Blast javelin",
            "mode": "ranged",
            "range": "18\"",
            "a": "D6",
            "skill": "4+",
            "s": "10",
            "ap": "-2",
            "d": "2",
            "abilities": "Assault, Blast",
            "sourceSelectionIds": [
              "unit-kroot-lone-spear-selection-blast-javelin"
            ]
          },
          {
            "id": "unit-kroot-lone-spear-profile-6f5a875a58",
            "legacyIds": [
              "unit-kroot-lone-spear-profile-kroot-long-gun-ranged-4"
            ],
            "title": "Kroot long gun",
            "mode": "ranged",
            "range": "36\"",
            "a": "1",
            "skill": "3+",
            "s": "6",
            "ap": "-2",
            "d": "3",
            "abilities": "Heavy, Precision",
            "sourceSelectionIds": [
              "unit-kroot-lone-spear-selection-kroot-long-gun"
            ]
          },
          {
            "id": "unit-kroot-lone-spear-profile-46fdc91c1b",
            "legacyIds": [
              "unit-kroot-lone-spear-profile-kalamandras-bite-melee-5"
            ],
            "title": "Kalamandra's bite",
            "mode": "melee",
            "range": "Melee",
            "a": "4",
            "skill": "4+",
            "s": "5",
            "ap": "-1",
            "d": "1",
            "abilities": "Extra Attacks",
            "sourceSelectionIds": [
              "unit-kroot-lone-spear-selection-kalamandras-bite"
            ]
          }
        ],
        "wargearAbilities": [],
        "wargearDefaults": [
          {
            "modelId": "unit-kroot-lone-spear-model-f4fab8b4b7",
            "selections": [
              {
                "selectionId": "unit-kroot-lone-spear-selection-kroot-long-gun",
                "quantity": 1
              },
              {
                "selectionId": "unit-kroot-lone-spear-selection-close-combat-weapon",
                "quantity": 1
              },
              {
                "selectionId": "unit-kroot-lone-spear-selection-kalamandras-bite",
                "quantity": 1
              }
            ]
          }
        ],
        "wargearOptionContracts": [
          {
            "sourceId": "datasheet-kroot-lone-spear:wargear:1",
            "eligibleModelIds": [
              "unit-kroot-lone-spear-model-f4fab8b4b7"
            ],
            "limit": {
              "perModel": 1
            },
            "choices": [
              {
                "remove": [
                  {
                    "selectionId": "unit-kroot-lone-spear-selection-kroot-long-gun",
                    "quantity": 1
                  }
                ],
                "add": [
                  {
                    "selectionId": "unit-kroot-lone-spear-selection-blast-javelin",
                    "quantity": 1
                  },
                  {
                    "selectionId": "unit-kroot-lone-spear-selection-hunting-javelin",
                    "quantity": 1
                  }
                ],
                "requiresFinal": [],
                "forbidsFinal": [],
                "sharedUses": []
              }
            ]
          }
        ],
        "wargearSharedCaps": []
      }
    },
    {
      "id": "unit-kroot-trail-shaper",
      "title": "Kroot Trail Shaper",
      "sourceBookId": "tau-empire",
      "sourceLayer": "codex",
      "intrinsicKeywords": [
        "Infantry",
        "Character",
        "Kroot",
        "Shaper",
        "Trail Shaper",
        "T'au Empire"
      ],
      "relations": {
        "canLead": [
          {
            "unitId": "unit-kroot-carnivores",
            "maxCharacters": 1,
            "attachmentGroupConstraint": {
              "id": "attachment-group-kroot-carnivores-bodyguard",
              "targetUnitId": "unit-kroot-carnivores",
              "sourceUnitIds": [
                "unit-kroot-flesh-shaper",
                "unit-kroot-trail-shaper",
                "unit-kroot-war-shaper"
              ],
              "role": "leader",
              "totalCapacity": 2,
              "perRoleCapacity": 2,
              "sameCanonicalLimit": 1,
              "bodyguardPredicate": {
                "kind": "STARTING_STRENGTH_EQUALS",
                "value": 20
              },
              "mandatoryParticipant": false,
              "source": {
                "kind": "accepted-army-ability",
                "sourceId": "tau-codex-transcription",
                "sourceUnitId": "unit-kroot-carnivores",
                "sourceAbilityId": "d0e7-bbff-a4f8-1b2d"
              },
              "provenance": {
                "sourceId": "tau-codex-transcription",
                "sourceRevision": "2",
                "sourceCommit": "fa30730fca11fbfe87be90684d481d50e0efaf66",
                "currentness": "CURRENT",
                "verifiedAt": "2026-09-22"
              }
            }
          },
          {
            "unitId": "unit-kroot-farstalkers",
            "maxCharacters": 1
          }
        ],
        "canSupport": [],
        "canBeLedBy": [],
        "canBeSupportedBy": []
      },
      "ruleFacts": {
        "relations": {
          "canLead": [
            {
              "unitId": "unit-kroot-carnivores",
              "maxCharacters": 1,
              "attachmentGroupConstraint": {
                "id": "attachment-group-kroot-carnivores-bodyguard",
                "targetUnitId": "unit-kroot-carnivores",
                "sourceUnitIds": [
                  "unit-kroot-flesh-shaper",
                  "unit-kroot-trail-shaper",
                  "unit-kroot-war-shaper"
                ],
                "role": "leader",
                "totalCapacity": 2,
                "perRoleCapacity": 2,
                "sameCanonicalLimit": 1,
                "bodyguardPredicate": {
                  "kind": "STARTING_STRENGTH_EQUALS",
                  "value": 20
                },
                "mandatoryParticipant": false,
                "source": {
                  "kind": "accepted-army-ability",
                  "sourceId": "tau-codex-transcription",
                  "sourceUnitId": "unit-kroot-carnivores",
                  "sourceAbilityId": "d0e7-bbff-a4f8-1b2d"
                },
                "provenance": {
                  "sourceId": "tau-codex-transcription",
                  "sourceRevision": "2",
                  "sourceCommit": "fa30730fca11fbfe87be90684d481d50e0efaf66",
                  "currentness": "CURRENT",
                  "verifiedAt": "2026-09-22"
                }
              }
            },
            {
              "unitId": "unit-kroot-farstalkers",
              "maxCharacters": 1
            }
          ],
          "canSupport": [],
          "canBeLedBy": [],
          "canBeSupportedBy": []
        }
      },
      "gameSelections": {
        "stats": {
          "M": "7\"",
          "T": "3",
          "Sv": "6+",
          "W": "3",
          "Ld": "7+",
          "OC": "1",
          "Invulnerable": ""
        },
        "statProfiles": [],
        "abilities": [
          {
            "id": "tau-empire-ability-kroot-ambush",
            "sectionId": "tau-empire-ability-kroot-ambush",
            "title": "Kroot Ambush",
            "text": "After both players have deployed their armies, you can redeploy this model’s unit and one other friendly KROOT unit. When doing so, any of those units can be placed into Strategic Reserves, regardless of how many units are already in Strategic Reserves.",
            "sourceUnitId": "unit-kroot-trail-shaper"
          },
          {
            "id": "tau-empire-ability-trail-finding",
            "sectionId": "tau-empire-ability-trail-finding",
            "title": "Trail Finding",
            "text": "In your opponent’s Movement phase, if an enemy unit ends a move within 8\" of this unit, if this unit is not within Engagement Range of one or more enemy units, this unit can make a Normal move of up to D6\".",
            "sourceUnitId": "unit-kroot-trail-shaper"
          },
          {
            "id": "core-infiltrators",
            "sectionId": "core-infiltrators",
            "title": "Infiltrators",
            "text": "During deployment, if every model in a unit has this ability, it can be set up anywhere on the battlefield that is more than 8\" horizontally from your opponent’s deployment zone and all enemy units.",
            "sourceUnitId": "unit-kroot-trail-shaper"
          },
          {
            "id": "core-scouts",
            "sectionId": "core-scouts",
            "title": "Scouts 7\"",
            "text": "This ability always takes the form Scouts X\". In the Resolve Pre-battle Abilities step, if every model in a unit has this ability, you can do one of the following: \n- If that unit is in strategic reserves, you can set up that unit anywhere that is wholly within your deployment zone. \n- If that unit is wholly within your deployment zone, it can make a scout move. \n- If that unit is embarked within a DEDICATED TRANSPORT that is wholly within your deployment zone, and if every model embarked within that DEDICATED TRANSPORT has the Scouts ability, that DEDICATED TRANSPORT can make a scout move.",
            "sourceUnitId": "unit-kroot-trail-shaper"
          },
          {
            "id": "core-stealth",
            "sectionId": "core-stealth",
            "title": "Stealth",
            "text": "If every model in a unit has this ability, each time a ranged attack targets that unit, that unit has the benefit of cover against that attack (13.08).",
            "sourceUnitId": "unit-kroot-trail-shaper"
          },
          {
            "id": "core-leader",
            "sectionId": "core-leader",
            "title": "Leader",
            "text": "While a Bodyguard unit contains a Leader, it is known as an Attached unit and, with the exception of rules that are triggered when units are destroyed (pg 12), it is treated as a single unit for all rules purposes. Each time an attack targets an Attached unit, until the attacking unit has resolved all of its attacks, you must use the Toughness characteristic of the Bodyguard models in that unit, even if a Leader in that unit has a different Toughness characteristic. Each time an attack successfully wounds an Attached unit, that attack cannot be allocated to a Character model in that unit, even if that Character model has lost one or more wounds or has already had attacks allocated to it this phase. As soon as the last Bodyguard model in an Attached unit has been destroyed, any attacks made against that unit that have yet to be allocated can then be allocated to Character models in that unit.\n\nEach time the last model in a Bodyguard unit is destroyed, each CHARACTER unit that is part of that Attached unit becomes a separate unit, with its original Starting Strength. If this happens as the result of an attack, they become separate units after the attacking unit has resolved all of its attacks. \n\nEach time the last model in a CHARACTER unit that is attached to a Bodyguard unit is destroyed and there is not another CHARACTER unit attached, that Attached unit’s Bodyguard unit becomes a separate unit, with its original Starting Strength. If this happens as the result of an attack, they become separate units after the attacking unit has resolved all of its attacks. \n\nEach time a unit that is part of an Attached unit is destroyed, it does not have the keywords of any other units that make up that Attached unit (unless it has those keywords on its own datasheet) for the purposes of any rules that would be triggered when that unit is destroyed.",
            "sourceUnitId": "unit-kroot-trail-shaper"
          }
        ],
        "models": [
          {
            "id": "unit-kroot-trail-shaper-model-76c9c0d470",
            "title": "Kroot Trail Shaper",
            "aliases": [
              "Kroot Trail Shaper"
            ],
            "min": 1,
            "max": 1,
            "legacyIds": [
              "unit-kroot-trail-shaper-model-kroot-trail-shaper"
            ]
          }
        ],
        "compositionRules": [],
        "selections": [
          {
            "id": "unit-kroot-trail-shaper-selection-kroot-rifle",
            "title": "Kroot rifle",
            "aliases": [
              "Kroot rifle"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-kroot-trail-shaper-profile-f6d8cdfc0b"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-kroot-trail-shaper-selection-shapers-blade",
            "title": "Shaper's blade",
            "aliases": [
              "Shaper's blade"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-kroot-trail-shaper-profile-531f92c900"
            ],
            "wargearAbilityIds": []
          }
        ],
        "weaponFamilies": [],
        "weaponProfiles": [
          {
            "id": "unit-kroot-trail-shaper-profile-f6d8cdfc0b",
            "legacyIds": [
              "unit-kroot-trail-shaper-profile-kroot-rifle-ranged"
            ],
            "title": "Kroot rifle",
            "mode": "ranged",
            "range": "24\"",
            "a": "1",
            "skill": "4+",
            "s": "4",
            "ap": "0",
            "d": "1",
            "abilities": "Rapid Fire 1",
            "sourceSelectionIds": [
              "unit-kroot-trail-shaper-selection-kroot-rifle"
            ]
          },
          {
            "id": "unit-kroot-trail-shaper-profile-531f92c900",
            "legacyIds": [
              "unit-kroot-trail-shaper-profile-shapers-blade-melee-2"
            ],
            "title": "Shaper's blade",
            "mode": "melee",
            "range": "Melee",
            "a": "4",
            "skill": "2+",
            "s": "5",
            "ap": "0",
            "d": "1",
            "abilities": "",
            "sourceSelectionIds": [
              "unit-kroot-trail-shaper-selection-shapers-blade"
            ]
          }
        ],
        "wargearAbilities": [],
        "wargearDefaults": [],
        "wargearOptionContracts": [],
        "wargearSharedCaps": []
      }
    },
    {
      "id": "unit-kroot-war-shaper",
      "title": "Kroot War Shaper",
      "sourceBookId": "tau-empire",
      "sourceLayer": "codex",
      "intrinsicKeywords": [
        "Infantry",
        "Character",
        "Kroot",
        "Shaper",
        "War Shaper",
        "T'au Empire"
      ],
      "relations": {
        "canLead": [
          {
            "unitId": "unit-kroot-carnivores",
            "maxCharacters": 1,
            "attachmentGroupConstraint": {
              "id": "attachment-group-kroot-carnivores-bodyguard",
              "targetUnitId": "unit-kroot-carnivores",
              "sourceUnitIds": [
                "unit-kroot-flesh-shaper",
                "unit-kroot-trail-shaper",
                "unit-kroot-war-shaper"
              ],
              "role": "leader",
              "totalCapacity": 2,
              "perRoleCapacity": 2,
              "sameCanonicalLimit": 1,
              "bodyguardPredicate": {
                "kind": "STARTING_STRENGTH_EQUALS",
                "value": 20
              },
              "mandatoryParticipant": false,
              "source": {
                "kind": "accepted-army-ability",
                "sourceId": "tau-codex-transcription",
                "sourceUnitId": "unit-kroot-carnivores",
                "sourceAbilityId": "d0e7-bbff-a4f8-1b2d"
              },
              "provenance": {
                "sourceId": "tau-codex-transcription",
                "sourceRevision": "2",
                "sourceCommit": "fa30730fca11fbfe87be90684d481d50e0efaf66",
                "currentness": "CURRENT",
                "verifiedAt": "2026-09-22"
              }
            }
          },
          {
            "unitId": "unit-kroot-farstalkers",
            "maxCharacters": 1
          }
        ],
        "canSupport": [],
        "canBeLedBy": [],
        "canBeSupportedBy": []
      },
      "ruleFacts": {
        "relations": {
          "canLead": [
            {
              "unitId": "unit-kroot-carnivores",
              "maxCharacters": 1,
              "attachmentGroupConstraint": {
                "id": "attachment-group-kroot-carnivores-bodyguard",
                "targetUnitId": "unit-kroot-carnivores",
                "sourceUnitIds": [
                  "unit-kroot-flesh-shaper",
                  "unit-kroot-trail-shaper",
                  "unit-kroot-war-shaper"
                ],
                "role": "leader",
                "totalCapacity": 2,
                "perRoleCapacity": 2,
                "sameCanonicalLimit": 1,
                "bodyguardPredicate": {
                  "kind": "STARTING_STRENGTH_EQUALS",
                  "value": 20
                },
                "mandatoryParticipant": false,
                "source": {
                  "kind": "accepted-army-ability",
                  "sourceId": "tau-codex-transcription",
                  "sourceUnitId": "unit-kroot-carnivores",
                  "sourceAbilityId": "d0e7-bbff-a4f8-1b2d"
                },
                "provenance": {
                  "sourceId": "tau-codex-transcription",
                  "sourceRevision": "2",
                  "sourceCommit": "fa30730fca11fbfe87be90684d481d50e0efaf66",
                  "currentness": "CURRENT",
                  "verifiedAt": "2026-09-22"
                }
              }
            },
            {
              "unitId": "unit-kroot-farstalkers",
              "maxCharacters": 1
            }
          ],
          "canSupport": [],
          "canBeLedBy": [],
          "canBeSupportedBy": []
        }
      },
      "gameSelections": {
        "stats": {
          "M": "7\"",
          "T": "3",
          "Sv": "6+",
          "W": "3",
          "Ld": "7+",
          "OC": "1",
          "Invulnerable": ""
        },
        "statProfiles": [],
        "abilities": [
          {
            "id": "tau-empire-ability-root-of-honour",
            "sectionId": "tau-empire-ability-root-of-honour",
            "title": "Root of Honour",
            "text": "Once per battle, at the start of any phase, you can select one friendly KROOT unit that is Battle-shocked and within 12\" of this model. That unit is no longer Battle-shocked.",
            "sourceUnitId": "unit-kroot-war-shaper"
          },
          {
            "id": "tau-empire-ability-war-leader",
            "sectionId": "tau-empire-ability-war-leader",
            "title": "War Leader",
            "text": "Once per battle round, one unit from your army with this ability can use it when its unit is targeted with a Stratagem. If it does, reduce the CP cost of that use of that Stratagem by 1CP.",
            "sourceUnitId": "unit-kroot-war-shaper"
          },
          {
            "id": "core-infiltrators",
            "sectionId": "core-infiltrators",
            "title": "Infiltrators",
            "text": "During deployment, if every model in a unit has this ability, it can be set up anywhere on the battlefield that is more than 8\" horizontally from your opponent’s deployment zone and all enemy units.",
            "sourceUnitId": "unit-kroot-war-shaper"
          },
          {
            "id": "core-scouts",
            "sectionId": "core-scouts",
            "title": "Scouts 7\"",
            "text": "This ability always takes the form Scouts X\". In the Resolve Pre-battle Abilities step, if every model in a unit has this ability, you can do one of the following: \n- If that unit is in strategic reserves, you can set up that unit anywhere that is wholly within your deployment zone. \n- If that unit is wholly within your deployment zone, it can make a scout move. \n- If that unit is embarked within a DEDICATED TRANSPORT that is wholly within your deployment zone, and if every model embarked within that DEDICATED TRANSPORT has the Scouts ability, that DEDICATED TRANSPORT can make a scout move.",
            "sourceUnitId": "unit-kroot-war-shaper"
          },
          {
            "id": "core-stealth",
            "sectionId": "core-stealth",
            "title": "Stealth",
            "text": "If every model in a unit has this ability, each time a ranged attack targets that unit, that unit has the benefit of cover against that attack (13.08).",
            "sourceUnitId": "unit-kroot-war-shaper"
          },
          {
            "id": "core-leader",
            "sectionId": "core-leader",
            "title": "Leader",
            "text": "While a Bodyguard unit contains a Leader, it is known as an Attached unit and, with the exception of rules that are triggered when units are destroyed (pg 12), it is treated as a single unit for all rules purposes. Each time an attack targets an Attached unit, until the attacking unit has resolved all of its attacks, you must use the Toughness characteristic of the Bodyguard models in that unit, even if a Leader in that unit has a different Toughness characteristic. Each time an attack successfully wounds an Attached unit, that attack cannot be allocated to a Character model in that unit, even if that Character model has lost one or more wounds or has already had attacks allocated to it this phase. As soon as the last Bodyguard model in an Attached unit has been destroyed, any attacks made against that unit that have yet to be allocated can then be allocated to Character models in that unit.\n\nEach time the last model in a Bodyguard unit is destroyed, each CHARACTER unit that is part of that Attached unit becomes a separate unit, with its original Starting Strength. If this happens as the result of an attack, they become separate units after the attacking unit has resolved all of its attacks. \n\nEach time the last model in a CHARACTER unit that is attached to a Bodyguard unit is destroyed and there is not another CHARACTER unit attached, that Attached unit’s Bodyguard unit becomes a separate unit, with its original Starting Strength. If this happens as the result of an attack, they become separate units after the attacking unit has resolved all of its attacks. \n\nEach time a unit that is part of an Attached unit is destroyed, it does not have the keywords of any other units that make up that Attached unit (unless it has those keywords on its own datasheet) for the purposes of any rules that would be triggered when that unit is destroyed.",
            "sourceUnitId": "unit-kroot-war-shaper"
          }
        ],
        "models": [
          {
            "id": "unit-kroot-war-shaper-model-cbd58f2987",
            "title": "Kroot War Shaper",
            "aliases": [
              "Kroot War Shaper"
            ],
            "min": 1,
            "max": 1,
            "legacyIds": [
              "unit-kroot-war-shaper-model-kroot-war-shaper"
            ]
          }
        ],
        "compositionRules": [],
        "selections": [
          {
            "id": "unit-kroot-war-shaper-selection-bladestave-and-prey-hook",
            "title": "Bladestave and prey-hook",
            "aliases": [
              "Bladestave and prey-hook"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-kroot-war-shaper-profile-be3b539df2"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-kroot-war-shaper-selection-dart-bow-and-tri-blade",
            "title": "Dart-bow and tri-blade",
            "aliases": [
              "Dart-bow and tri-blade"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-kroot-war-shaper-profile-d733395f5e"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-kroot-war-shaper-selection-shapers-blade",
            "title": "Shaper's blade",
            "aliases": [
              "Shaper's blade"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-kroot-war-shaper-profile-531f92c900"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-kroot-war-shaper-selection-kroot-pistol",
            "title": "Kroot pistol",
            "aliases": [
              "Kroot pistol"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-kroot-war-shaper-profile-7d0b14e526"
            ],
            "wargearAbilityIds": []
          }
        ],
        "weaponFamilies": [],
        "weaponProfiles": [
          {
            "id": "unit-kroot-war-shaper-profile-be3b539df2",
            "legacyIds": [
              "unit-kroot-war-shaper-profile-bladestave-and-prey-hook-melee"
            ],
            "title": "Bladestave and prey-hook",
            "mode": "melee",
            "range": "Melee",
            "a": "4",
            "skill": "2+",
            "s": "5",
            "ap": "-1",
            "d": "2",
            "abilities": "Lethal Hits",
            "sourceSelectionIds": [
              "unit-kroot-war-shaper-selection-bladestave-and-prey-hook"
            ]
          },
          {
            "id": "unit-kroot-war-shaper-profile-d733395f5e",
            "legacyIds": [
              "unit-kroot-war-shaper-profile-dart-bow-and-tri-blade-ranged-2"
            ],
            "title": "Dart-bow and tri-blade",
            "mode": "ranged",
            "range": "24\"",
            "a": "D3+1",
            "skill": "4+",
            "s": "4",
            "ap": "0",
            "d": "2",
            "abilities": "Anti-Infantry 3+, Assault, Heavy",
            "sourceSelectionIds": [
              "unit-kroot-war-shaper-selection-dart-bow-and-tri-blade"
            ]
          },
          {
            "id": "unit-kroot-war-shaper-profile-531f92c900",
            "legacyIds": [
              "unit-kroot-war-shaper-profile-shapers-blade-melee-3"
            ],
            "title": "Shaper's blade",
            "mode": "melee",
            "range": "Melee",
            "a": "4",
            "skill": "2+",
            "s": "5",
            "ap": "0",
            "d": "1",
            "abilities": "",
            "sourceSelectionIds": [
              "unit-kroot-war-shaper-selection-shapers-blade"
            ]
          },
          {
            "id": "unit-kroot-war-shaper-profile-7d0b14e526",
            "legacyIds": [
              "unit-kroot-war-shaper-profile-kroot-pistol-ranged-4"
            ],
            "title": "Kroot pistol",
            "mode": "ranged",
            "range": "12\"",
            "a": "1",
            "skill": "4+",
            "s": "4",
            "ap": "0",
            "d": "1",
            "abilities": "Pistol",
            "sourceSelectionIds": [
              "unit-kroot-war-shaper-selection-kroot-pistol"
            ]
          }
        ],
        "wargearAbilities": [],
        "wargearDefaults": [
          {
            "modelId": "unit-kroot-war-shaper-model-cbd58f2987",
            "selections": [
              {
                "selectionId": "unit-kroot-war-shaper-selection-dart-bow-and-tri-blade",
                "quantity": 1
              },
              {
                "selectionId": "unit-kroot-war-shaper-selection-kroot-pistol",
                "quantity": 1
              },
              {
                "selectionId": "unit-kroot-war-shaper-selection-shapers-blade",
                "quantity": 1
              }
            ]
          }
        ],
        "wargearOptionContracts": [
          {
            "sourceId": "datasheet-kroot-war-shaper:wargear:1",
            "eligibleModelIds": [
              "unit-kroot-war-shaper-model-cbd58f2987"
            ],
            "limit": {
              "perModel": 1
            },
            "choices": [
              {
                "remove": [
                  {
                    "selectionId": "unit-kroot-war-shaper-selection-dart-bow-and-tri-blade",
                    "quantity": 1
                  }
                ],
                "add": [
                  {
                    "selectionId": "unit-kroot-war-shaper-selection-bladestave-and-prey-hook",
                    "quantity": 1
                  }
                ],
                "requiresFinal": [],
                "forbidsFinal": [],
                "sharedUses": []
              }
            ]
          }
        ],
        "wargearSharedCaps": []
      }
    },
    {
      "id": "unit-devilfish",
      "title": "Devilfish",
      "sourceBookId": "tau-empire",
      "sourceLayer": "codex",
      "intrinsicKeywords": [
        "Vehicle",
        "Fly",
        "Frame",
        "Transport",
        "Dedicated Transport",
        "Devilfish",
        "T'au Empire"
      ],
      "relations": {
        "canLead": [],
        "canSupport": [],
        "canBeLedBy": [],
        "canBeSupportedBy": []
      },
      "ruleFacts": {
        "relations": {
          "canLead": [],
          "canSupport": [],
          "canBeLedBy": [],
          "canBeSupportedBy": []
        }
      },
      "gameSelections": {
        "stats": {
          "M": "12\"",
          "T": "9",
          "Sv": "3+",
          "W": "13",
          "Ld": "7+",
          "OC": "2",
          "Invulnerable": ""
        },
        "statProfiles": [],
        "abilities": [
          {
            "id": "tau-empire-ability-rapid-deployment",
            "sectionId": "tau-empire-ability-rapid-deployment",
            "title": "Rapid Deployment",
            "text": "Units can disembark from this TRANSPORT after it has Advanced. Units that do so make a shock disembark move (Core Rules, 18.07) for that disembarkation.",
            "sourceUnitId": "unit-devilfish"
          },
          {
            "id": "core-deadly-demise",
            "sectionId": "core-deadly-demise",
            "title": "Deadly Demise D3",
            "text": "This ability always takes the form Deadly Demise X. Each time a model in this unit is destroyed, after the units embarked within it (if any) have made their emergency disembark moves, roll one D6. On a 6, that model suffers a deadly demise; each unit within 6\" of that model suffers a number of mortal wounds denoted by X (if this is a random number, roll separately for each unit within 6\"). \n *Example: An Impulsor with a unit of Intercessors embarked within it is destroyed by ranged attacks. First, any unresolved attacks made by the attacking unit are resolved. Then the Intercessors make an emergency disembark move. Then the roll is made for the Deadly Demise ability, and on a 6, that ability is resolved. Finally, the Impulsor is removed from the battlefield.*",
            "sourceUnitId": "unit-devilfish"
          },
          {
            "id": "tau-empire-ability-for-the-greater-good",
            "sectionId": "tau-empire-ability-for-the-greater-good",
            "title": "For The Greater Good",
            "text": "If your Army Faction is T’AU EMPIRE, at the start of your Shooting phase you can select units from your army with this ability to become Observer units.\n\nDuring your Shooting phase, for each Observer unit from your army that has not been selected to shoot this phase and is eligible to shoot (excluding FORTIFICATION and Battle-shocked units) select one enemy unit that is visible to be marked as their Spotted unit until the end of the phase. Each enemy unit can only be marked as a Spotted unit once per phase.\n\nUnits from your army with the For the Greater Good ability (excluding Observer units) are Guided units while targeting one or more Spotted units.\n\nUntil the end of the phase, each time a model from your army in a Guided unit makes an attack that targets a Spotted unit, improve the Ballistic Skill characteristic of that attack by 1 and, if the Spotted unit was marked by an Observer unit that has the Markerlight keyword, that attack has the [IGNORES COVER] ability.",
            "sourceUnitId": "unit-devilfish"
          }
        ],
        "models": [
          {
            "id": "unit-devilfish-model-d1b65eff1a",
            "title": "Devilfish",
            "aliases": [
              "Devilfish"
            ],
            "min": 1,
            "max": 1,
            "legacyIds": [
              "unit-devilfish-model-devilfish"
            ]
          }
        ],
        "compositionRules": [],
        "selections": [
          {
            "id": "unit-devilfish-selection-twin-pulse-carbine",
            "title": "Twin pulse carbine",
            "aliases": [
              "Twin pulse carbine"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-devilfish-profile-dfd910195f"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-devilfish-selection-smart-missile-system",
            "title": "Smart missile system",
            "aliases": [
              "Smart missile system"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-devilfish-profile-506187484b"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-devilfish-selection-seeker-missile",
            "title": "Seeker missile",
            "aliases": [
              "Seeker missile"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-devilfish-profile-351bd7e3c7"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-devilfish-selection-accelerator-burst-cannon",
            "title": "Accelerator burst cannon",
            "aliases": [
              "Accelerator burst cannon"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-devilfish-profile-6fde1ef259"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-devilfish-selection-armoured-hull",
            "title": "Armoured hull",
            "aliases": [
              "Armoured hull"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-devilfish-profile-3f6402479f"
            ],
            "wargearAbilityIds": []
          }
        ],
        "weaponFamilies": [],
        "weaponProfiles": [
          {
            "id": "unit-devilfish-profile-dfd910195f",
            "legacyIds": [
              "unit-devilfish-profile-twin-pulse-carbine-ranged"
            ],
            "title": "Twin pulse carbine",
            "mode": "ranged",
            "range": "20\"",
            "a": "2",
            "skill": "4+",
            "s": "5",
            "ap": "0",
            "d": "1",
            "abilities": "Twin-linked, Assault",
            "sourceSelectionIds": [
              "unit-devilfish-selection-twin-pulse-carbine"
            ]
          },
          {
            "id": "unit-devilfish-profile-506187484b",
            "legacyIds": [
              "unit-devilfish-profile-smart-missile-system-ranged-2"
            ],
            "title": "Smart missile system",
            "mode": "ranged",
            "range": "30\"",
            "a": "3",
            "skill": "4+",
            "s": "5",
            "ap": "0",
            "d": "1",
            "abilities": "Indirect Fire",
            "sourceSelectionIds": [
              "unit-devilfish-selection-smart-missile-system"
            ]
          },
          {
            "id": "unit-devilfish-profile-351bd7e3c7",
            "legacyIds": [
              "unit-devilfish-profile-seeker-missile-ranged-3"
            ],
            "title": "Seeker missile",
            "mode": "ranged",
            "range": "48\"",
            "a": "1",
            "skill": "4+",
            "s": "14",
            "ap": "-3",
            "d": "D6+1",
            "abilities": "One Shot",
            "sourceSelectionIds": [
              "unit-devilfish-selection-seeker-missile"
            ]
          },
          {
            "id": "unit-devilfish-profile-6fde1ef259",
            "legacyIds": [
              "unit-devilfish-profile-accelerator-burst-cannon-ranged-4"
            ],
            "title": "Accelerator burst cannon",
            "mode": "ranged",
            "range": "18\"",
            "a": "4",
            "skill": "4+",
            "s": "6",
            "ap": "-1",
            "d": "1",
            "abilities": "",
            "sourceSelectionIds": [
              "unit-devilfish-selection-accelerator-burst-cannon"
            ]
          },
          {
            "id": "unit-devilfish-profile-3f6402479f",
            "legacyIds": [
              "unit-devilfish-profile-armoured-hull-melee-5"
            ],
            "title": "Armoured hull",
            "mode": "melee",
            "range": "Melee",
            "a": "3",
            "skill": "5+",
            "s": "6",
            "ap": "0",
            "d": "1",
            "abilities": "",
            "sourceSelectionIds": [
              "unit-devilfish-selection-armoured-hull"
            ]
          }
        ],
        "wargearAbilities": [],
        "wargearDefaults": [
          {
            "modelId": "unit-devilfish-model-d1b65eff1a",
            "selections": [
              {
                "selectionId": "unit-devilfish-selection-accelerator-burst-cannon",
                "quantity": 1
              },
              {
                "selectionId": "unit-devilfish-selection-twin-pulse-carbine",
                "quantity": 2
              },
              {
                "selectionId": "unit-devilfish-selection-armoured-hull",
                "quantity": 1
              }
            ]
          }
        ],
        "wargearOptionContracts": [
          {
            "sourceId": "datasheet-devilfish:wargear:1",
            "eligibleModelIds": [
              "unit-devilfish-model-d1b65eff1a"
            ],
            "limit": {
              "perModel": 1
            },
            "choices": [
              {
                "remove": [
                  {
                    "selectionId": "unit-devilfish-selection-twin-pulse-carbine",
                    "quantity": 2
                  }
                ],
                "add": [
                  {
                    "selectionId": "unit-devilfish-selection-smart-missile-system",
                    "quantity": 2
                  }
                ],
                "requiresFinal": [],
                "forbidsFinal": [],
                "sharedUses": []
              }
            ]
          },
          {
            "sourceId": "datasheet-devilfish:wargear:2",
            "eligibleModelIds": [
              "unit-devilfish-model-d1b65eff1a"
            ],
            "limit": {
              "perModel": 2
            },
            "choices": [
              {
                "remove": [],
                "add": [
                  {
                    "selectionId": "unit-devilfish-selection-seeker-missile",
                    "quantity": 1
                  }
                ],
                "requiresFinal": [],
                "forbidsFinal": [],
                "sharedUses": []
              }
            ]
          }
        ],
        "wargearSharedCaps": []
      }
    },
    {
      "id": "unit-commander-farsight",
      "title": "Commander Farsight",
      "sourceBookId": "tau-empire",
      "sourceLayer": "codex",
      "intrinsicKeywords": [
        "Vehicle",
        "Walker",
        "Fly",
        "Character",
        "Epic Hero",
        "Battlesuit",
        "Commander Farsight",
        "T'au Empire"
      ],
      "relations": {
        "canLead": [
          {
            "unitId": "unit-crisis-fireknife-battlesuits",
            "maxCharacters": 1
          },
          {
            "unitId": "unit-crisis-starscythe-battlesuits",
            "maxCharacters": 1
          },
          {
            "unitId": "unit-crisis-sunforge-battlesuits",
            "maxCharacters": 1
          }
        ],
        "canSupport": [],
        "canBeLedBy": [],
        "canBeSupportedBy": []
      },
      "ruleFacts": {
        "relations": {
          "canLead": [
            {
              "unitId": "unit-crisis-fireknife-battlesuits",
              "maxCharacters": 1
            },
            {
              "unitId": "unit-crisis-starscythe-battlesuits",
              "maxCharacters": 1
            },
            {
              "unitId": "unit-crisis-sunforge-battlesuits",
              "maxCharacters": 1
            }
          ],
          "canSupport": [],
          "canBeLedBy": [],
          "canBeSupportedBy": []
        }
      },
      "gameSelections": {
        "stats": {
          "M": "10\"",
          "T": "5",
          "Sv": "2+",
          "W": "8",
          "Ld": "6+",
          "OC": "2",
          "Invulnerable": "4+"
        },
        "statProfiles": [],
        "abilities": [
          {
            "id": "tau-empire-ability-way-of-the-short-blade",
            "sectionId": "tau-empire-ability-way-of-the-short-blade",
            "title": "Way of the Short Blade",
            "text": "While this model is leading a unit, each time a model in that unit makes an attack that targets an enemy unit within 9\", add 1 to the Wound roll.",
            "sourceUnitId": "unit-commander-farsight"
          },
          {
            "id": "tau-empire-ability-puretides-teachings",
            "sectionId": "tau-empire-ability-puretides-teachings",
            "title": "Puretide's Teachings",
            "text": "Once per battle round, you can target this model’s unit with a Stratagem. If it does, reduce the CP cost of that use of that Stratagem by 1CP.",
            "sourceUnitId": "unit-commander-farsight"
          },
          {
            "id": "core-deep-strike",
            "sectionId": "core-deep-strike",
            "title": "Deep Strike",
            "text": "Each time this unit makes an ingress move (20.04), if every model in this unit has this ability, it can be set up anywhere on the battlefield that is more than 8\" horizontally from all enemy units, even if that is within your opponent’s deployment zone.",
            "sourceUnitId": "unit-commander-farsight"
          },
          {
            "id": "tau-empire-ability-for-the-greater-good",
            "sectionId": "tau-empire-ability-for-the-greater-good",
            "title": "For The Greater Good",
            "text": "If your Army Faction is T’AU EMPIRE, at the start of your Shooting phase you can select units from your army with this ability to become Observer units.\n\nDuring your Shooting phase, for each Observer unit from your army that has not been selected to shoot this phase and is eligible to shoot (excluding FORTIFICATION and Battle-shocked units) select one enemy unit that is visible to be marked as their Spotted unit until the end of the phase. Each enemy unit can only be marked as a Spotted unit once per phase.\n\nUnits from your army with the For the Greater Good ability (excluding Observer units) are Guided units while targeting one or more Spotted units.\n\nUntil the end of the phase, each time a model from your army in a Guided unit makes an attack that targets a Spotted unit, improve the Ballistic Skill characteristic of that attack by 1 and, if the Spotted unit was marked by an Observer unit that has the Markerlight keyword, that attack has the [IGNORES COVER] ability.",
            "sourceUnitId": "unit-commander-farsight"
          },
          {
            "id": "core-leader",
            "sectionId": "core-leader",
            "title": "Leader",
            "text": "While a Bodyguard unit contains a Leader, it is known as an Attached unit and, with the exception of rules that are triggered when units are destroyed (pg 12), it is treated as a single unit for all rules purposes. Each time an attack targets an Attached unit, until the attacking unit has resolved all of its attacks, you must use the Toughness characteristic of the Bodyguard models in that unit, even if a Leader in that unit has a different Toughness characteristic. Each time an attack successfully wounds an Attached unit, that attack cannot be allocated to a Character model in that unit, even if that Character model has lost one or more wounds or has already had attacks allocated to it this phase. As soon as the last Bodyguard model in an Attached unit has been destroyed, any attacks made against that unit that have yet to be allocated can then be allocated to Character models in that unit.\n\nEach time the last model in a Bodyguard unit is destroyed, each CHARACTER unit that is part of that Attached unit becomes a separate unit, with its original Starting Strength. If this happens as the result of an attack, they become separate units after the attacking unit has resolved all of its attacks. \n\nEach time the last model in a CHARACTER unit that is attached to a Bodyguard unit is destroyed and there is not another CHARACTER unit attached, that Attached unit’s Bodyguard unit becomes a separate unit, with its original Starting Strength. If this happens as the result of an attack, they become separate units after the attacking unit has resolved all of its attacks. \n\nEach time a unit that is part of an Attached unit is destroyed, it does not have the keywords of any other units that make up that Attached unit (unless it has those keywords on its own datasheet) for the purposes of any rules that would be triggered when that unit is destroyed.",
            "sourceUnitId": "unit-commander-farsight"
          }
        ],
        "models": [
          {
            "id": "unit-commander-farsight-model-713b801b30",
            "title": "Commander Farsight",
            "aliases": [
              "Commander Farsight"
            ],
            "min": 1,
            "max": 1,
            "legacyIds": [
              "unit-commander-farsight-model-commander-farsight"
            ]
          }
        ],
        "compositionRules": [],
        "selections": [
          {
            "id": "unit-commander-farsight-selection-high-intensity-plasma-rifle",
            "title": "High-intensity plasma rifle",
            "aliases": [
              "High-intensity plasma rifle"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-commander-farsight-profile-c430b866a5"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-commander-farsight-selection-dawn-blade-strike",
            "title": "➤ Dawn Blade - strike",
            "aliases": [
              "➤ Dawn Blade - strike"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-commander-farsight-profile-b5074ab17a"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-commander-farsight-selection-dawn-blade-sweep",
            "title": "➤ Dawn Blade - sweep",
            "aliases": [
              "➤ Dawn Blade - sweep"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-commander-farsight-profile-fcc6eed77b"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-commander-farsight-weapon-family-dawn-blade-selection",
            "title": "➤ Dawn Blade",
            "aliases": [
              "➤ Dawn Blade"
            ],
            "kind": "weapon",
            "familyId": "unit-commander-farsight-weapon-family-dawn-blade",
            "profileIds": [
              "unit-commander-farsight-profile-b5074ab17a",
              "unit-commander-farsight-profile-fcc6eed77b"
            ],
            "wargearAbilityIds": []
          }
        ],
        "weaponFamilies": [
          {
            "id": "unit-commander-farsight-weapon-family-dawn-blade",
            "title": "➤ Dawn Blade",
            "aliases": [
              "➤ Dawn Blade"
            ],
            "profileIds": [
              "unit-commander-farsight-profile-b5074ab17a",
              "unit-commander-farsight-profile-fcc6eed77b"
            ],
            "ambiguousAlias": false
          }
        ],
        "weaponProfiles": [
          {
            "id": "unit-commander-farsight-profile-c430b866a5",
            "legacyIds": [
              "unit-commander-farsight-profile-high-intensity-plasma-rifle-ranged"
            ],
            "title": "High-intensity plasma rifle",
            "mode": "ranged",
            "range": "24\"",
            "a": "2",
            "skill": "2+",
            "s": "8",
            "ap": "-3",
            "d": "3",
            "abilities": "",
            "sourceSelectionIds": [
              "unit-commander-farsight-selection-high-intensity-plasma-rifle"
            ]
          },
          {
            "id": "unit-commander-farsight-profile-b5074ab17a",
            "legacyIds": [
              "unit-commander-farsight-profile-dawn-blade-strike-melee-2"
            ],
            "title": "➤ Dawn Blade - strike",
            "mode": "melee",
            "range": "Melee",
            "a": "4",
            "skill": "2+",
            "s": "10",
            "ap": "-2",
            "d": "3",
            "abilities": "",
            "sourceSelectionIds": [
              "unit-commander-farsight-selection-dawn-blade-strike",
              "unit-commander-farsight-weapon-family-dawn-blade-selection"
            ]
          },
          {
            "id": "unit-commander-farsight-profile-fcc6eed77b",
            "legacyIds": [
              "unit-commander-farsight-profile-dawn-blade-sweep-melee-3"
            ],
            "title": "➤ Dawn Blade - sweep",
            "mode": "melee",
            "range": "Melee",
            "a": "8",
            "skill": "2+",
            "s": "6",
            "ap": "-1",
            "d": "1",
            "abilities": "",
            "sourceSelectionIds": [
              "unit-commander-farsight-selection-dawn-blade-sweep",
              "unit-commander-farsight-weapon-family-dawn-blade-selection"
            ]
          }
        ],
        "wargearAbilities": [],
        "wargearDefaults": [],
        "wargearOptionContracts": [],
        "wargearSharedCaps": []
      }
    },
    {
      "id": "unit-commander-shadowsun",
      "title": "Commander Shadowsun",
      "sourceBookId": "tau-empire",
      "sourceLayer": "codex",
      "intrinsicKeywords": [
        "Infantry",
        "Fly",
        "Character",
        "Epic Hero",
        "Battlesuit",
        "Commander Shadowsun",
        "T'au Empire"
      ],
      "relations": {
        "canLead": [],
        "canSupport": [],
        "canBeLedBy": [],
        "canBeSupportedBy": []
      },
      "ruleFacts": {
        "relations": {
          "canLead": [],
          "canSupport": [],
          "canBeLedBy": [],
          "canBeSupportedBy": []
        }
      },
      "gameSelections": {
        "stats": {
          "M": "10\"",
          "T": "4",
          "Sv": "3+",
          "W": "6",
          "Ld": "6+",
          "OC": "1",
          "Invulnerable": "5+"
        },
        "statProfiles": [],
        "abilities": [
          {
            "id": "tau-empire-ability-agile-combatant",
            "sectionId": "tau-empire-ability-agile-combatant",
            "title": "Agile Combatant",
            "text": "This model is eligible to shoot in a turn in which it Fell Back.",
            "sourceUnitId": "unit-commander-shadowsun"
          },
          {
            "id": "tau-empire-ability-hero-of-the-empire-aura",
            "sectionId": "tau-empire-ability-hero-of-the-empire-aura",
            "title": "Hero of the Empire (Aura)",
            "text": "While a friendly T’AU EMPIRE unit is within 6\" of this model, each time a model in that unit makes a ranged attack, re-roll a Hit roll of 1.",
            "sourceUnitId": "unit-commander-shadowsun"
          },
          {
            "id": "tau-empire-ability-supreme-commander",
            "sectionId": "tau-empire-ability-supreme-commander",
            "title": "Supreme Commander",
            "text": "If this model is in your army, it must be your Warlord.",
            "sourceUnitId": "unit-commander-shadowsun"
          },
          {
            "id": "core-infiltrators",
            "sectionId": "core-infiltrators",
            "title": "Infiltrators",
            "text": "During deployment, if every model in a unit has this ability, it can be set up anywhere on the battlefield that is more than 8\" horizontally from your opponent’s deployment zone and all enemy units.",
            "sourceUnitId": "unit-commander-shadowsun"
          },
          {
            "id": "core-lone-operative",
            "sectionId": "core-lone-operative",
            "title": "Lone Operative",
            "text": "Unless part of an attached unit, this unit is not visible to enemy models unless they are within 12\" of this unit, and it cannot be targeted by [INDIRECT FIRE] weapons unless the attacking model is within 12\" of this unit. \nIf this ability takes the form Lone Operative X\", unless part of an attached unit, this unit is not visible to enemy models unless they are within X\" of this unit, and it cannot be targeted by [INDIRECT FIRE] weapons unless the attacking model is within X\" of this unit.",
            "sourceUnitId": "unit-commander-shadowsun"
          },
          {
            "id": "core-stealth",
            "sectionId": "core-stealth",
            "title": "Stealth",
            "text": "If every model in a unit has this ability, each time a ranged attack targets that unit, that unit has the benefit of cover against that attack (13.08).",
            "sourceUnitId": "unit-commander-shadowsun"
          },
          {
            "id": "tau-empire-ability-for-the-greater-good",
            "sectionId": "tau-empire-ability-for-the-greater-good",
            "title": "For The Greater Good",
            "text": "If your Army Faction is T’AU EMPIRE, at the start of your Shooting phase you can select units from your army with this ability to become Observer units.\n\nDuring your Shooting phase, for each Observer unit from your army that has not been selected to shoot this phase and is eligible to shoot (excluding FORTIFICATION and Battle-shocked units) select one enemy unit that is visible to be marked as their Spotted unit until the end of the phase. Each enemy unit can only be marked as a Spotted unit once per phase.\n\nUnits from your army with the For the Greater Good ability (excluding Observer units) are Guided units while targeting one or more Spotted units.\n\nUntil the end of the phase, each time a model from your army in a Guided unit makes an attack that targets a Spotted unit, improve the Ballistic Skill characteristic of that attack by 1 and, if the Spotted unit was marked by an Observer unit that has the Markerlight keyword, that attack has the [IGNORES COVER] ability.",
            "sourceUnitId": "unit-commander-shadowsun"
          }
        ],
        "models": [
          {
            "id": "unit-commander-shadowsun-model-1204d229c6",
            "title": "Commander Shadowsun",
            "aliases": [
              "Commander Shadowsun"
            ],
            "min": 1,
            "max": 1,
            "legacyIds": [
              "unit-commander-shadowsun-model-commander-shadowsun"
            ]
          }
        ],
        "compositionRules": [],
        "selections": [
          {
            "id": "unit-commander-shadowsun-selection-light-missile-pod",
            "title": "Light missile pod",
            "aliases": [
              "Light missile pod"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-commander-shadowsun-profile-62c9071001"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-commander-shadowsun-selection-high-energy-fusion-blaster",
            "title": "High-energy fusion blaster",
            "aliases": [
              "High-energy fusion blaster"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-commander-shadowsun-profile-33ea8bff8c"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-commander-shadowsun-selection-flechette-launcher",
            "title": "Flechette launcher",
            "aliases": [
              "Flechette launcher"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-commander-shadowsun-profile-9b90c577ff"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-commander-shadowsun-selection-battlesuit-fists",
            "title": "Battlesuit fists",
            "aliases": [
              "Battlesuit fists"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-commander-shadowsun-profile-fc3c180c6b"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-commander-shadowsun-selection-pulse-pistol",
            "title": "Pulse pistol",
            "aliases": [
              "Pulse pistol"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-commander-shadowsun-profile-3722574bac"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-commander-shadowsun-selection-advanced-guardian-drone",
            "title": "Advanced Guardian Drone",
            "aliases": [
              "Advanced Guardian Drone"
            ],
            "kind": "wargear",
            "profileIds": [],
            "wargearAbilityIds": [
              "unit-commander-shadowsun-wargear-ability-56048e29f0"
            ]
          },
          {
            "id": "unit-commander-shadowsun-selection-command-link-drone-aura",
            "title": "Command-link Drone (Aura)",
            "aliases": [
              "Command-link Drone (Aura)"
            ],
            "kind": "wargear",
            "profileIds": [],
            "wargearAbilityIds": [
              "unit-commander-shadowsun-wargear-ability-ceea2651db"
            ]
          }
        ],
        "weaponFamilies": [],
        "weaponProfiles": [
          {
            "id": "unit-commander-shadowsun-profile-62c9071001",
            "legacyIds": [
              "unit-commander-shadowsun-profile-light-missile-pod-ranged"
            ],
            "title": "Light missile pod",
            "mode": "ranged",
            "range": "24\"",
            "a": "2",
            "skill": "2+",
            "s": "7",
            "ap": "0",
            "d": "2",
            "abilities": "",
            "sourceSelectionIds": [
              "unit-commander-shadowsun-selection-light-missile-pod"
            ]
          },
          {
            "id": "unit-commander-shadowsun-profile-33ea8bff8c",
            "legacyIds": [
              "unit-commander-shadowsun-profile-high-energy-fusion-blaster-ranged-2"
            ],
            "title": "High-energy fusion blaster",
            "mode": "ranged",
            "range": "18\"",
            "a": "1",
            "skill": "2+",
            "s": "10",
            "ap": "-4",
            "d": "D6",
            "abilities": "Melta 2",
            "sourceSelectionIds": [
              "unit-commander-shadowsun-selection-high-energy-fusion-blaster"
            ]
          },
          {
            "id": "unit-commander-shadowsun-profile-9b90c577ff",
            "legacyIds": [
              "unit-commander-shadowsun-profile-flechette-launcher-ranged-3"
            ],
            "title": "Flechette launcher",
            "mode": "ranged",
            "range": "18\"",
            "a": "5",
            "skill": "2+",
            "s": "3",
            "ap": "0",
            "d": "1",
            "abilities": "",
            "sourceSelectionIds": [
              "unit-commander-shadowsun-selection-flechette-launcher"
            ]
          },
          {
            "id": "unit-commander-shadowsun-profile-fc3c180c6b",
            "legacyIds": [
              "unit-commander-shadowsun-profile-battlesuit-fists-melee-4"
            ],
            "title": "Battlesuit fists",
            "mode": "melee",
            "range": "Melee",
            "a": "3",
            "skill": "4+",
            "s": "5",
            "ap": "0",
            "d": "1",
            "abilities": "",
            "sourceSelectionIds": [
              "unit-commander-shadowsun-selection-battlesuit-fists"
            ]
          },
          {
            "id": "unit-commander-shadowsun-profile-3722574bac",
            "legacyIds": [
              "unit-commander-shadowsun-profile-pulse-pistol-ranged-5"
            ],
            "title": "Pulse pistol",
            "mode": "ranged",
            "range": "12\"",
            "a": "1",
            "skill": "3+",
            "s": "5",
            "ap": "0",
            "d": "1",
            "abilities": "Pistol",
            "sourceSelectionIds": [
              "unit-commander-shadowsun-selection-pulse-pistol"
            ]
          }
        ],
        "wargearAbilities": [
          {
            "id": "unit-commander-shadowsun-wargear-ability-56048e29f0",
            "sectionId": "unit-commander-shadowsun-wargear-ability-56048e29f0",
            "title": "Advanced Guardian Drone",
            "text": "Each time a ranged attack targets the bearer, subtract 1 from the Wound roll.",
            "sourceUnitId": "unit-commander-shadowsun",
            "legacyIds": [
              "unit-commander-shadowsun-wargear-ability-advanced-guardian-drone"
            ],
            "requiredSelectionIds": [
              "unit-commander-shadowsun-selection-advanced-guardian-drone"
            ]
          },
          {
            "id": "unit-commander-shadowsun-wargear-ability-ceea2651db",
            "sectionId": "unit-commander-shadowsun-wargear-ability-ceea2651db",
            "title": "Command-link Drone (Aura)",
            "text": "While a friendly T’AU EMPIRE unit is within 6\" of the bearer, each time you select that unit as the target of a Stratagem, roll one D6: on a 5+, you gain 1CP.",
            "sourceUnitId": "unit-commander-shadowsun",
            "legacyIds": [
              "unit-commander-shadowsun-wargear-ability-command-link-drone-aura-2"
            ],
            "requiredSelectionIds": [
              "unit-commander-shadowsun-selection-command-link-drone-aura"
            ]
          }
        ],
        "wargearDefaults": [],
        "wargearOptionContracts": [],
        "wargearSharedCaps": []
      }
    },
    {
      "id": "unit-darkstrider",
      "title": "Darkstrider",
      "sourceBookId": "tau-empire",
      "sourceLayer": "codex",
      "intrinsicKeywords": [
        "Infantry",
        "Character",
        "Epic Hero",
        "Markerlight",
        "Darkstrider",
        "T'au Empire"
      ],
      "relations": {
        "canLead": [
          {
            "unitId": "unit-pathfinder-team",
            "maxCharacters": 1
          }
        ],
        "canSupport": [],
        "canBeLedBy": [],
        "canBeSupportedBy": []
      },
      "ruleFacts": {
        "relations": {
          "canLead": [
            {
              "unitId": "unit-pathfinder-team",
              "maxCharacters": 1
            }
          ],
          "canSupport": [],
          "canBeLedBy": [],
          "canBeSupportedBy": []
        }
      },
      "gameSelections": {
        "stats": {
          "M": "7\"",
          "T": "3",
          "Sv": "4+",
          "W": "3",
          "Ld": "7+",
          "OC": "1",
          "Invulnerable": ""
        },
        "statProfiles": [],
        "abilities": [
          {
            "id": "tau-empire-ability-structural-analyser",
            "sectionId": "tau-empire-ability-structural-analyser",
            "title": "Structural Analyser",
            "text": "While this model is leading a unit, each time a model in that unit makes a ranged attack, add 1 to the Wound roll.",
            "sourceUnitId": "unit-darkstrider"
          },
          {
            "id": "tau-empire-ability-jammer-array",
            "sectionId": "tau-empire-ability-jammer-array",
            "title": "Jammer Array",
            "text": "Enemy units that are set up on the battlefield from Reserves cannot be set up within 12\" of this model.",
            "sourceUnitId": "unit-darkstrider"
          },
          {
            "id": "core-infiltrators",
            "sectionId": "core-infiltrators",
            "title": "Infiltrators",
            "text": "During deployment, if every model in a unit has this ability, it can be set up anywhere on the battlefield that is more than 8\" horizontally from your opponent’s deployment zone and all enemy units.",
            "sourceUnitId": "unit-darkstrider"
          },
          {
            "id": "core-scouts",
            "sectionId": "core-scouts",
            "title": "Scouts 7\"",
            "text": "This ability always takes the form Scouts X\". In the Resolve Pre-battle Abilities step, if every model in a unit has this ability, you can do one of the following: \n- If that unit is in strategic reserves, you can set up that unit anywhere that is wholly within your deployment zone. \n- If that unit is wholly within your deployment zone, it can make a scout move. \n- If that unit is embarked within a DEDICATED TRANSPORT that is wholly within your deployment zone, and if every model embarked within that DEDICATED TRANSPORT has the Scouts ability, that DEDICATED TRANSPORT can make a scout move.",
            "sourceUnitId": "unit-darkstrider"
          },
          {
            "id": "tau-empire-ability-for-the-greater-good",
            "sectionId": "tau-empire-ability-for-the-greater-good",
            "title": "For The Greater Good",
            "text": "If your Army Faction is T’AU EMPIRE, at the start of your Shooting phase you can select units from your army with this ability to become Observer units.\n\nDuring your Shooting phase, for each Observer unit from your army that has not been selected to shoot this phase and is eligible to shoot (excluding FORTIFICATION and Battle-shocked units) select one enemy unit that is visible to be marked as their Spotted unit until the end of the phase. Each enemy unit can only be marked as a Spotted unit once per phase.\n\nUnits from your army with the For the Greater Good ability (excluding Observer units) are Guided units while targeting one or more Spotted units.\n\nUntil the end of the phase, each time a model from your army in a Guided unit makes an attack that targets a Spotted unit, improve the Ballistic Skill characteristic of that attack by 1 and, if the Spotted unit was marked by an Observer unit that has the Markerlight keyword, that attack has the [IGNORES COVER] ability.",
            "sourceUnitId": "unit-darkstrider"
          },
          {
            "id": "core-leader",
            "sectionId": "core-leader",
            "title": "Leader",
            "text": "While a Bodyguard unit contains a Leader, it is known as an Attached unit and, with the exception of rules that are triggered when units are destroyed (pg 12), it is treated as a single unit for all rules purposes. Each time an attack targets an Attached unit, until the attacking unit has resolved all of its attacks, you must use the Toughness characteristic of the Bodyguard models in that unit, even if a Leader in that unit has a different Toughness characteristic. Each time an attack successfully wounds an Attached unit, that attack cannot be allocated to a Character model in that unit, even if that Character model has lost one or more wounds or has already had attacks allocated to it this phase. As soon as the last Bodyguard model in an Attached unit has been destroyed, any attacks made against that unit that have yet to be allocated can then be allocated to Character models in that unit.\n\nEach time the last model in a Bodyguard unit is destroyed, each CHARACTER unit that is part of that Attached unit becomes a separate unit, with its original Starting Strength. If this happens as the result of an attack, they become separate units after the attacking unit has resolved all of its attacks. \n\nEach time the last model in a CHARACTER unit that is attached to a Bodyguard unit is destroyed and there is not another CHARACTER unit attached, that Attached unit’s Bodyguard unit becomes a separate unit, with its original Starting Strength. If this happens as the result of an attack, they become separate units after the attacking unit has resolved all of its attacks. \n\nEach time a unit that is part of an Attached unit is destroyed, it does not have the keywords of any other units that make up that Attached unit (unless it has those keywords on its own datasheet) for the purposes of any rules that would be triggered when that unit is destroyed.",
            "sourceUnitId": "unit-darkstrider"
          }
        ],
        "models": [
          {
            "id": "unit-darkstrider-model-28010c56f8",
            "title": "Darkstrider",
            "aliases": [
              "Darkstrider"
            ],
            "min": 1,
            "max": 1,
            "legacyIds": [
              "unit-darkstrider-model-darkstrider"
            ]
          }
        ],
        "compositionRules": [],
        "selections": [
          {
            "id": "unit-darkstrider-selection-shade",
            "title": "Shade",
            "aliases": [
              "Shade"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-darkstrider-profile-7e4fe48b98"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-darkstrider-selection-close-combat-weapon",
            "title": "Close combat weapon",
            "aliases": [
              "Close combat weapon"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-darkstrider-profile-3734343fba"
            ],
            "wargearAbilityIds": []
          }
        ],
        "weaponFamilies": [],
        "weaponProfiles": [
          {
            "id": "unit-darkstrider-profile-7e4fe48b98",
            "legacyIds": [
              "unit-darkstrider-profile-shade-ranged"
            ],
            "title": "Shade",
            "mode": "ranged",
            "range": "18\"",
            "a": "2",
            "skill": "2+",
            "s": "5",
            "ap": "0",
            "d": "2",
            "abilities": "Assault",
            "sourceSelectionIds": [
              "unit-darkstrider-selection-shade"
            ]
          },
          {
            "id": "unit-darkstrider-profile-3734343fba",
            "legacyIds": [
              "unit-darkstrider-profile-close-combat-weapon-melee-2"
            ],
            "title": "Close combat weapon",
            "mode": "melee",
            "range": "Melee",
            "a": "3",
            "skill": "4+",
            "s": "3",
            "ap": "0",
            "d": "1",
            "abilities": "",
            "sourceSelectionIds": [
              "unit-darkstrider-selection-close-combat-weapon"
            ]
          }
        ],
        "wargearAbilities": [],
        "wargearDefaults": [],
        "wargearOptionContracts": [],
        "wargearSharedCaps": []
      }
    },
    {
      "id": "unit-the-twin-lance",
      "title": "The Twin Lance",
      "sourceBookId": "tau-empire",
      "sourceLayer": "faction-pack",
      "intrinsicKeywords": [
        "Vehicle",
        "Walker",
        "Fly",
        "Character",
        "Epic Hero",
        "Battlesuit",
        "The Twin Lance",
        "T'au Empire"
      ],
      "relations": {
        "canLead": [],
        "canSupport": [],
        "canBeLedBy": [],
        "canBeSupportedBy": []
      },
      "ruleFacts": {
        "relations": {
          "canLead": [],
          "canSupport": [],
          "canBeLedBy": [],
          "canBeSupportedBy": []
        }
      },
      "gameSelections": {
        "stats": {
          "M": "10\"",
          "T": "6",
          "Sv": "2+",
          "W": "8",
          "Ld": "6+",
          "OC": "2",
          "Invulnerable": "4+"
        },
        "statProfiles": [
          {
            "id": "unit-the-twin-lance-stat-profile-ff96172cdb",
            "title": "The Twin Lance",
            "stats": {
              "M": "10\"",
              "T": "6",
              "Sv": "2+",
              "W": "8",
              "Ld": "6+",
              "OC": "2",
              "Invulnerable": "4+"
            },
            "legacyIds": [
              "unit-the-twin-lance-stat-profile-the-twin-lance"
            ]
          }
        ],
        "abilities": [
          {
            "id": "tau-empire-ability-neocapacitor-shields",
            "sectionId": "tau-empire-ability-neocapacitor-shields",
            "title": "Neocapacitor Shields",
            "text": "At the start of your opponent’s Charge phase, you can select one visible enemy unit (excluding MONSTER and VEHICLE units) within 12\" of this unit. That unit must take a Battle-shock test and, until the end of the turn, subtract 1 from Charge rolls made for that unit.",
            "sourceUnitId": "unit-the-twin-lance"
          },
          {
            "id": "tau-empire-ability-exemplars-of-montka",
            "sectionId": "tau-empire-ability-exemplars-of-montka",
            "title": "Exemplars of Mont’ka",
            "text": "Each time a model in this unit makes a ranged attack that targets the closest eligible target, that attack has the [SUSTAINED HITS 1] and [IGNORES COVER] abilities.",
            "sourceUnitId": "unit-the-twin-lance"
          },
          {
            "id": "tau-empire-ability-retro-thrusters",
            "sectionId": "tau-empire-ability-retro-thrusters",
            "title": "Retro-thrusters",
            "text": "At the end of the Fight phase, if this unit was eligible to fight this phase, this unit can either make a Normal move of up to 6\" or a Fall Back move.",
            "sourceUnitId": "unit-the-twin-lance"
          },
          {
            "id": "core-sustained-hits",
            "sectionId": "core-sustained-hits",
            "title": "Sustained Hits",
            "text": "This ability always takes the form [SUSTAINED HITS X]. Each time an attack made with a [SUSTAINED HITS] weapon results in a critical hit, that attack results in a number of additional hits on the target as denoted by X.\n *Example: An attack made with a [SUSTAINED HITS 2] weapon results in a critical hit. That attack therefore hits the target three times (once from the critical hit, and twice more from the [SUSTAINED HITS 2] ability).",
            "sourceUnitId": "unit-the-twin-lance"
          },
          {
            "id": "tau-empire-ability-for-the-greater-good",
            "sectionId": "tau-empire-ability-for-the-greater-good",
            "title": "For The Greater Good",
            "text": "If your Army Faction is T’AU EMPIRE, at the start of your Shooting phase you can select units from your army with this ability to become Observer units.\n\nDuring your Shooting phase, for each Observer unit from your army that has not been selected to shoot this phase and is eligible to shoot (excluding FORTIFICATION and Battle-shocked units) select one enemy unit that is visible to be marked as their Spotted unit until the end of the phase. Each enemy unit can only be marked as a Spotted unit once per phase.\n\nUnits from your army with the For the Greater Good ability (excluding Observer units) are Guided units while targeting one or more Spotted units.\n\nUntil the end of the phase, each time a model from your army in a Guided unit makes an attack that targets a Spotted unit, improve the Ballistic Skill characteristic of that attack by 1 and, if the Spotted unit was marked by an Observer unit that has the Markerlight keyword, that attack has the [IGNORES COVER] ability.",
            "sourceUnitId": "unit-the-twin-lance"
          },
          {
            "id": "core-scouts",
            "sectionId": "core-scouts",
            "title": "Scouts 8\"",
            "text": "This ability always takes the form Scouts X\". In the Resolve Pre-battle Abilities step, if every model in a unit has this ability, you can do one of the following: \n- If that unit is in strategic reserves, you can set up that unit anywhere that is wholly within your deployment zone. \n- If that unit is wholly within your deployment zone, it can make a scout move. \n- If that unit is embarked within a DEDICATED TRANSPORT that is wholly within your deployment zone, and if every model embarked within that DEDICATED TRANSPORT has the Scouts ability, that DEDICATED TRANSPORT can make a scout move.",
            "sourceUnitId": "unit-the-twin-lance"
          },
          {
            "id": "core-ignores-cover",
            "sectionId": "core-ignores-cover",
            "title": "Ignores Cover",
            "text": "Each time an attack is made with an [IGNORES COVER] weapon, the target cannot have the benefit of cover against that attack (13.08), including from rules that give a model or unit the benefit of cover (e.g. Stealth ).",
            "sourceUnitId": "unit-the-twin-lance"
          },
          {
            "id": "core-deep-strike",
            "sectionId": "core-deep-strike",
            "title": "Deep Strike",
            "text": "Each time this unit makes an ingress move (20.04), if every model in this unit has this ability, it can be set up anywhere on the battlefield that is more than 8\" horizontally from all enemy units, even if that is within your opponent’s deployment zone.",
            "sourceUnitId": "unit-the-twin-lance"
          }
        ],
        "models": [
          {
            "id": "unit-the-twin-lance-model-c4bd8a932a",
            "title": "Ri'Lantar",
            "aliases": [
              "Ri'Lantar"
            ],
            "min": 1,
            "max": 1,
            "legacyIds": [
              "unit-the-twin-lance-model-rilantar"
            ]
          },
          {
            "id": "unit-the-twin-lance-model-94f0dc62e7",
            "title": "Ri'Locai",
            "aliases": [
              "Ri'Locai"
            ],
            "min": 1,
            "max": 1,
            "legacyIds": [
              "unit-the-twin-lance-model-rilocai-2"
            ]
          }
        ],
        "compositionRules": [],
        "selections": [
          {
            "id": "unit-the-twin-lance-selection-fusion-eliminator",
            "title": "Fusion eliminator",
            "aliases": [
              "Fusion eliminator"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-the-twin-lance-profile-c8bc7f40b1",
              "unit-the-twin-lance-profile-dc18f6afc0"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-the-twin-lance-selection-shardstorm-burst-system",
            "title": "Shardstorm burst system",
            "aliases": [
              "Shardstorm burst system"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-the-twin-lance-profile-01ce68053e"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-the-twin-lance-selection-twin-pulse-blaster",
            "title": "Twin pulse blaster",
            "aliases": [
              "Twin pulse blaster"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-the-twin-lance-profile-df5c6e42e9"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-the-twin-lance-selection-xv-pulse-pistol",
            "title": "XV pulse pistol",
            "aliases": [
              "XV pulse pistol"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-the-twin-lance-profile-fcb1c9ac50",
              "unit-the-twin-lance-profile-78f7f02ec3"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-the-twin-lance-selection-ion-scattercannon-overcharge",
            "title": "➤ Ion scattercannon - overcharge",
            "aliases": [
              "➤ Ion scattercannon - overcharge"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-the-twin-lance-profile-92219cf667"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-the-twin-lance-selection-ion-scattercannon",
            "title": "Ion scattercannon",
            "aliases": [
              "Ion scattercannon"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-the-twin-lance-profile-f52587716e"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-the-twin-lance-selection-ion-scattercannon-standard",
            "title": "➤ Ion scattercannon - standard",
            "aliases": [
              "➤ Ion scattercannon - standard"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-the-twin-lance-profile-b5dfffc9ea"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-the-twin-lance-weapon-family-ion-scattercannon-selection",
            "title": "➤ Ion scattercannon",
            "aliases": [
              "➤ Ion scattercannon"
            ],
            "kind": "weapon",
            "familyId": "unit-the-twin-lance-weapon-family-ion-scattercannon",
            "profileIds": [
              "unit-the-twin-lance-profile-92219cf667",
              "unit-the-twin-lance-profile-b5dfffc9ea"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-the-twin-lance-selection-mv15-gun-drone",
            "title": "MV15 Gun Drone",
            "aliases": [
              "MV15 Gun Drone"
            ],
            "kind": "wargear",
            "profileIds": [],
            "wargearAbilityIds": [
              "unit-the-twin-lance-wargear-ability-1668782923"
            ]
          }
        ],
        "weaponFamilies": [
          {
            "id": "unit-the-twin-lance-weapon-family-ion-scattercannon",
            "title": "➤ Ion scattercannon",
            "aliases": [
              "➤ Ion scattercannon"
            ],
            "profileIds": [
              "unit-the-twin-lance-profile-92219cf667",
              "unit-the-twin-lance-profile-b5dfffc9ea"
            ],
            "ambiguousAlias": true
          }
        ],
        "weaponProfiles": [
          {
            "id": "unit-the-twin-lance-profile-c8bc7f40b1",
            "legacyIds": [
              "unit-the-twin-lance-profile-fusion-eliminator-ranged"
            ],
            "title": "Fusion eliminator",
            "mode": "ranged",
            "range": "18\"",
            "a": "2",
            "skill": "2+",
            "s": "10",
            "ap": "-4",
            "d": "D6",
            "abilities": "Melta 2",
            "sourceSelectionIds": [
              "unit-the-twin-lance-selection-fusion-eliminator"
            ]
          },
          {
            "id": "unit-the-twin-lance-profile-dc18f6afc0",
            "legacyIds": [
              "unit-the-twin-lance-profile-fusion-eliminator-melee-2"
            ],
            "title": "Fusion eliminator",
            "mode": "melee",
            "range": "Melee",
            "a": "1",
            "skill": "4+",
            "s": "10",
            "ap": "-4",
            "d": "D6+2",
            "abilities": "Extra Attacks",
            "sourceSelectionIds": [
              "unit-the-twin-lance-selection-fusion-eliminator"
            ]
          },
          {
            "id": "unit-the-twin-lance-profile-01ce68053e",
            "legacyIds": [
              "unit-the-twin-lance-profile-shardstorm-burst-system-ranged-3"
            ],
            "title": "Shardstorm burst system",
            "mode": "ranged",
            "range": "18\"",
            "a": "D6",
            "skill": "2+",
            "s": "5",
            "ap": "0",
            "d": "1",
            "abilities": "Pistol",
            "sourceSelectionIds": [
              "unit-the-twin-lance-selection-shardstorm-burst-system"
            ]
          },
          {
            "id": "unit-the-twin-lance-profile-df5c6e42e9",
            "legacyIds": [
              "unit-the-twin-lance-profile-twin-pulse-blaster-ranged-4"
            ],
            "title": "Twin pulse blaster",
            "mode": "ranged",
            "range": "10\"",
            "a": "2",
            "skill": "5+",
            "s": "6",
            "ap": "-1",
            "d": "1",
            "abilities": "Assault, Twin-linked",
            "sourceSelectionIds": [
              "unit-the-twin-lance-selection-twin-pulse-blaster"
            ]
          },
          {
            "id": "unit-the-twin-lance-profile-fcb1c9ac50",
            "legacyIds": [
              "unit-the-twin-lance-profile-xv-pulse-pistol-ranged-5"
            ],
            "title": "XV pulse pistol",
            "mode": "ranged",
            "range": "12\"",
            "a": "2",
            "skill": "2+",
            "s": "6",
            "ap": "-1",
            "d": "2",
            "abilities": "Rapid Fire 2",
            "sourceSelectionIds": [
              "unit-the-twin-lance-selection-xv-pulse-pistol"
            ]
          },
          {
            "id": "unit-the-twin-lance-profile-78f7f02ec3",
            "legacyIds": [
              "unit-the-twin-lance-profile-xv-pulse-pistol-melee-6"
            ],
            "title": "XV pulse pistol",
            "mode": "melee",
            "range": "Melee",
            "a": "4",
            "skill": "3+",
            "s": "6",
            "ap": "-1",
            "d": "2",
            "abilities": "",
            "sourceSelectionIds": [
              "unit-the-twin-lance-selection-xv-pulse-pistol"
            ]
          },
          {
            "id": "unit-the-twin-lance-profile-92219cf667",
            "legacyIds": [
              "unit-the-twin-lance-profile-ion-scattercannon-overcharge-ranged-7"
            ],
            "title": "➤ Ion scattercannon - overcharge",
            "mode": "ranged",
            "range": "18\"",
            "a": "4",
            "skill": "2+",
            "s": "8",
            "ap": "-3",
            "d": "3",
            "abilities": "Hazardous, Rapid Fire 2",
            "sourceSelectionIds": [
              "unit-the-twin-lance-selection-ion-scattercannon-overcharge",
              "unit-the-twin-lance-weapon-family-ion-scattercannon-selection"
            ]
          },
          {
            "id": "unit-the-twin-lance-profile-f52587716e",
            "legacyIds": [
              "unit-the-twin-lance-profile-ion-scattercannon-melee-8"
            ],
            "title": "Ion scattercannon",
            "mode": "melee",
            "range": "Melee",
            "a": "3",
            "skill": "4+",
            "s": "7",
            "ap": "-2",
            "d": "2",
            "abilities": "Extra Attacks",
            "sourceSelectionIds": [
              "unit-the-twin-lance-selection-ion-scattercannon"
            ]
          },
          {
            "id": "unit-the-twin-lance-profile-b5dfffc9ea",
            "legacyIds": [
              "unit-the-twin-lance-profile-ion-scattercannon-standard-ranged-9"
            ],
            "title": "➤ Ion scattercannon - standard",
            "mode": "ranged",
            "range": "18\"",
            "a": "4",
            "skill": "2+",
            "s": "7",
            "ap": "-2",
            "d": "2",
            "abilities": "Rapid Fire 2",
            "sourceSelectionIds": [
              "unit-the-twin-lance-selection-ion-scattercannon-standard",
              "unit-the-twin-lance-weapon-family-ion-scattercannon-selection"
            ]
          }
        ],
        "wargearAbilities": [
          {
            "id": "unit-the-twin-lance-wargear-ability-1668782923",
            "sectionId": "unit-the-twin-lance-wargear-ability-1668782923",
            "title": "MV15 Gun Drone",
            "text": "The bearer is equipped with 1 twin pulse blaster.",
            "sourceUnitId": "unit-the-twin-lance",
            "legacyIds": [
              "unit-the-twin-lance-wargear-ability-mv15-gun-drone"
            ],
            "requiredSelectionIds": [
              "unit-the-twin-lance-selection-mv15-gun-drone"
            ]
          }
        ],
        "wargearDefaults": [
          {
            "modelId": "unit-the-twin-lance-model-c4bd8a932a",
            "selections": [
              {
                "selectionId": "unit-the-twin-lance-selection-fusion-eliminator",
                "quantity": 1
              },
              {
                "selectionId": "unit-the-twin-lance-selection-xv-pulse-pistol",
                "quantity": 1
              },
              {
                "selectionId": "unit-the-twin-lance-selection-shardstorm-burst-system",
                "quantity": 1
              },
              {
                "selectionId": "unit-the-twin-lance-selection-mv15-gun-drone",
                "quantity": 1
              }
            ]
          },
          {
            "modelId": "unit-the-twin-lance-model-94f0dc62e7",
            "selections": [
              {
                "selectionId": "unit-the-twin-lance-weapon-family-ion-scattercannon-selection",
                "quantity": 1
              },
              {
                "selectionId": "unit-the-twin-lance-selection-xv-pulse-pistol",
                "quantity": 1
              },
              {
                "selectionId": "unit-the-twin-lance-selection-shardstorm-burst-system",
                "quantity": 1
              },
              {
                "selectionId": "unit-the-twin-lance-selection-mv15-gun-drone",
                "quantity": 1
              }
            ]
          }
        ],
        "wargearOptionContracts": [],
        "wargearSharedCaps": [],
        "wargearDeclarations": [
          {
            "sourceRuleId": "datasheet-the-twin-lance:wargear:1",
            "kind": "NO_SELECTABLE_OPTION"
          }
        ]
      }
    },
    {
      "id": "unit-kroot-carnivores",
      "title": "Kroot Carnivores",
      "sourceBookId": "tau-empire",
      "sourceLayer": "codex",
      "intrinsicKeywords": [
        "Infantry",
        "Grenades",
        "Kroot",
        "Carnivores",
        "T'au Empire"
      ],
      "relations": {
        "canLead": [],
        "canSupport": [],
        "canBeLedBy": [
          {
            "unitId": "unit-kroot-flesh-shaper",
            "maxCharacters": 1,
            "attachmentGroupConstraint": {
              "id": "attachment-group-kroot-carnivores-bodyguard",
              "targetUnitId": "unit-kroot-carnivores",
              "sourceUnitIds": [
                "unit-kroot-flesh-shaper",
                "unit-kroot-trail-shaper",
                "unit-kroot-war-shaper"
              ],
              "role": "leader",
              "totalCapacity": 2,
              "perRoleCapacity": 2,
              "sameCanonicalLimit": 1,
              "bodyguardPredicate": {
                "kind": "STARTING_STRENGTH_EQUALS",
                "value": 20
              },
              "mandatoryParticipant": false,
              "source": {
                "kind": "accepted-army-ability",
                "sourceId": "tau-codex-transcription",
                "sourceUnitId": "unit-kroot-carnivores",
                "sourceAbilityId": "d0e7-bbff-a4f8-1b2d"
              },
              "provenance": {
                "sourceId": "tau-codex-transcription",
                "sourceRevision": "2",
                "sourceCommit": "fa30730fca11fbfe87be90684d481d50e0efaf66",
                "currentness": "CURRENT",
                "verifiedAt": "2026-09-22"
              }
            }
          },
          {
            "unitId": "unit-kroot-trail-shaper",
            "maxCharacters": 1,
            "attachmentGroupConstraint": {
              "id": "attachment-group-kroot-carnivores-bodyguard",
              "targetUnitId": "unit-kroot-carnivores",
              "sourceUnitIds": [
                "unit-kroot-flesh-shaper",
                "unit-kroot-trail-shaper",
                "unit-kroot-war-shaper"
              ],
              "role": "leader",
              "totalCapacity": 2,
              "perRoleCapacity": 2,
              "sameCanonicalLimit": 1,
              "bodyguardPredicate": {
                "kind": "STARTING_STRENGTH_EQUALS",
                "value": 20
              },
              "mandatoryParticipant": false,
              "source": {
                "kind": "accepted-army-ability",
                "sourceId": "tau-codex-transcription",
                "sourceUnitId": "unit-kroot-carnivores",
                "sourceAbilityId": "d0e7-bbff-a4f8-1b2d"
              },
              "provenance": {
                "sourceId": "tau-codex-transcription",
                "sourceRevision": "2",
                "sourceCommit": "fa30730fca11fbfe87be90684d481d50e0efaf66",
                "currentness": "CURRENT",
                "verifiedAt": "2026-09-22"
              }
            }
          },
          {
            "unitId": "unit-kroot-war-shaper",
            "maxCharacters": 1,
            "attachmentGroupConstraint": {
              "id": "attachment-group-kroot-carnivores-bodyguard",
              "targetUnitId": "unit-kroot-carnivores",
              "sourceUnitIds": [
                "unit-kroot-flesh-shaper",
                "unit-kroot-trail-shaper",
                "unit-kroot-war-shaper"
              ],
              "role": "leader",
              "totalCapacity": 2,
              "perRoleCapacity": 2,
              "sameCanonicalLimit": 1,
              "bodyguardPredicate": {
                "kind": "STARTING_STRENGTH_EQUALS",
                "value": 20
              },
              "mandatoryParticipant": false,
              "source": {
                "kind": "accepted-army-ability",
                "sourceId": "tau-codex-transcription",
                "sourceUnitId": "unit-kroot-carnivores",
                "sourceAbilityId": "d0e7-bbff-a4f8-1b2d"
              },
              "provenance": {
                "sourceId": "tau-codex-transcription",
                "sourceRevision": "2",
                "sourceCommit": "fa30730fca11fbfe87be90684d481d50e0efaf66",
                "currentness": "CURRENT",
                "verifiedAt": "2026-09-22"
              }
            }
          }
        ],
        "canBeSupportedBy": []
      },
      "ruleFacts": {
        "relations": {
          "canLead": [],
          "canSupport": [],
          "canBeLedBy": [
            {
              "unitId": "unit-kroot-flesh-shaper",
              "maxCharacters": 1,
              "attachmentGroupConstraint": {
                "id": "attachment-group-kroot-carnivores-bodyguard",
                "targetUnitId": "unit-kroot-carnivores",
                "sourceUnitIds": [
                  "unit-kroot-flesh-shaper",
                  "unit-kroot-trail-shaper",
                  "unit-kroot-war-shaper"
                ],
                "role": "leader",
                "totalCapacity": 2,
                "perRoleCapacity": 2,
                "sameCanonicalLimit": 1,
                "bodyguardPredicate": {
                  "kind": "STARTING_STRENGTH_EQUALS",
                  "value": 20
                },
                "mandatoryParticipant": false,
                "source": {
                  "kind": "accepted-army-ability",
                  "sourceId": "tau-codex-transcription",
                  "sourceUnitId": "unit-kroot-carnivores",
                  "sourceAbilityId": "d0e7-bbff-a4f8-1b2d"
                },
                "provenance": {
                  "sourceId": "tau-codex-transcription",
                  "sourceRevision": "2",
                  "sourceCommit": "fa30730fca11fbfe87be90684d481d50e0efaf66",
                  "currentness": "CURRENT",
                  "verifiedAt": "2026-09-22"
                }
              }
            },
            {
              "unitId": "unit-kroot-trail-shaper",
              "maxCharacters": 1,
              "attachmentGroupConstraint": {
                "id": "attachment-group-kroot-carnivores-bodyguard",
                "targetUnitId": "unit-kroot-carnivores",
                "sourceUnitIds": [
                  "unit-kroot-flesh-shaper",
                  "unit-kroot-trail-shaper",
                  "unit-kroot-war-shaper"
                ],
                "role": "leader",
                "totalCapacity": 2,
                "perRoleCapacity": 2,
                "sameCanonicalLimit": 1,
                "bodyguardPredicate": {
                  "kind": "STARTING_STRENGTH_EQUALS",
                  "value": 20
                },
                "mandatoryParticipant": false,
                "source": {
                  "kind": "accepted-army-ability",
                  "sourceId": "tau-codex-transcription",
                  "sourceUnitId": "unit-kroot-carnivores",
                  "sourceAbilityId": "d0e7-bbff-a4f8-1b2d"
                },
                "provenance": {
                  "sourceId": "tau-codex-transcription",
                  "sourceRevision": "2",
                  "sourceCommit": "fa30730fca11fbfe87be90684d481d50e0efaf66",
                  "currentness": "CURRENT",
                  "verifiedAt": "2026-09-22"
                }
              }
            },
            {
              "unitId": "unit-kroot-war-shaper",
              "maxCharacters": 1,
              "attachmentGroupConstraint": {
                "id": "attachment-group-kroot-carnivores-bodyguard",
                "targetUnitId": "unit-kroot-carnivores",
                "sourceUnitIds": [
                  "unit-kroot-flesh-shaper",
                  "unit-kroot-trail-shaper",
                  "unit-kroot-war-shaper"
                ],
                "role": "leader",
                "totalCapacity": 2,
                "perRoleCapacity": 2,
                "sameCanonicalLimit": 1,
                "bodyguardPredicate": {
                  "kind": "STARTING_STRENGTH_EQUALS",
                  "value": 20
                },
                "mandatoryParticipant": false,
                "source": {
                  "kind": "accepted-army-ability",
                  "sourceId": "tau-codex-transcription",
                  "sourceUnitId": "unit-kroot-carnivores",
                  "sourceAbilityId": "d0e7-bbff-a4f8-1b2d"
                },
                "provenance": {
                  "sourceId": "tau-codex-transcription",
                  "sourceRevision": "2",
                  "sourceCommit": "fa30730fca11fbfe87be90684d481d50e0efaf66",
                  "currentness": "CURRENT",
                  "verifiedAt": "2026-09-22"
                }
              }
            }
          ],
          "canBeSupportedBy": []
        }
      },
      "gameSelections": {
        "stats": {
          "M": "7\"",
          "T": "3",
          "Sv": "6+",
          "W": "1",
          "Ld": "7+",
          "OC": "2",
          "Invulnerable": ""
        },
        "statProfiles": [
          {
            "id": "unit-kroot-carnivores-stat-profile-b34ac4e066",
            "title": "Kroot Carnivores",
            "stats": {
              "M": "7\"",
              "T": "3",
              "Sv": "6+",
              "W": "1",
              "Ld": "7+",
              "OC": "2",
              "Invulnerable": ""
            },
            "legacyIds": [
              "unit-kroot-carnivores-stat-profile-kroot-carnivores"
            ]
          }
        ],
        "abilities": [
          {
            "id": "tau-empire-ability-fieldcraft",
            "sectionId": "tau-empire-ability-fieldcraft",
            "title": "Fieldcraft",
            "text": "At the end of your Command phase, if this unit is within range of an objective marker you control, that objective marker remains under your control, even if you have no models within range of it, until your opponent controls it at the start or end of any turn.",
            "sourceUnitId": "unit-kroot-carnivores"
          },
          {
            "id": "core-bodyguard",
            "sectionId": "core-bodyguard",
            "title": "Bodyguard",
            "text": "If this unit has a Starting Strength of 20, you can attach up to two Leader units to it instead of one, provided those Leaders are not duplicates (e.g. you cannot attach two WAR SHAPERS to this unit). If you do, and this unit is destroyed, the Leader units attached to it become separate units with their original Starting Strengths.",
            "sourceUnitId": "unit-kroot-carnivores"
          },
          {
            "id": "core-scouts",
            "sectionId": "core-scouts",
            "title": "Scouts 7\"",
            "text": "This ability always takes the form Scouts X\". In the Resolve Pre-battle Abilities step, if every model in a unit has this ability, you can do one of the following: \n- If that unit is in strategic reserves, you can set up that unit anywhere that is wholly within your deployment zone. \n- If that unit is wholly within your deployment zone, it can make a scout move. \n- If that unit is embarked within a DEDICATED TRANSPORT that is wholly within your deployment zone, and if every model embarked within that DEDICATED TRANSPORT has the Scouts ability, that DEDICATED TRANSPORT can make a scout move.",
            "sourceUnitId": "unit-kroot-carnivores"
          },
          {
            "id": "core-stealth",
            "sectionId": "core-stealth",
            "title": "Stealth",
            "text": "If every model in a unit has this ability, each time a ranged attack targets that unit, that unit has the benefit of cover against that attack (13.08).",
            "sourceUnitId": "unit-kroot-carnivores"
          }
        ],
        "models": [
          {
            "id": "unit-kroot-carnivores-model-40a87f1ad7",
            "title": "9-19 Kroot Carnivores",
            "aliases": [
              "9-19 Kroot Carnivores",
              "Kroot Carnivores",
              "Kroot Carnivore w/ tanglebomb launcher"
            ],
            "min": 9,
            "max": 19,
            "legacyIds": [
              "unit-kroot-carnivores-model-9-19-kroot-carnivores"
            ]
          },
          {
            "id": "unit-kroot-carnivores-model-a87487f2e0",
            "title": "Long-quill",
            "aliases": [
              "Long-quill"
            ],
            "min": 1,
            "max": 1,
            "legacyIds": [
              "unit-kroot-carnivores-model-long-quill-2"
            ]
          }
        ],
        "compositionRules": [],
        "selections": [
          {
            "id": "unit-kroot-carnivores-selection-close-combat-weapon",
            "title": "Close combat weapon",
            "aliases": [
              "Close combat weapon"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-kroot-carnivores-profile-a24599bb66"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-kroot-carnivores-selection-kroot-rifle",
            "title": "Kroot rifle",
            "aliases": [
              "Kroot rifle"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-kroot-carnivores-profile-f6d8cdfc0b"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-kroot-carnivores-selection-tanglebomb-launcher",
            "title": "Tanglebomb launcher",
            "aliases": [
              "Tanglebomb launcher"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-kroot-carnivores-profile-83eeee25ab"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-kroot-carnivores-selection-kroot-carbine",
            "title": "Kroot carbine",
            "aliases": [
              "Kroot carbine"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-kroot-carnivores-profile-14dc097147"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-kroot-carnivores-selection-kroot-pistol",
            "title": "Kroot pistol",
            "aliases": [
              "Kroot pistol"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-kroot-carnivores-profile-7d0b14e526"
            ],
            "wargearAbilityIds": []
          }
        ],
        "weaponFamilies": [],
        "weaponProfiles": [
          {
            "id": "unit-kroot-carnivores-profile-a24599bb66",
            "legacyIds": [
              "unit-kroot-carnivores-profile-close-combat-weapon-melee"
            ],
            "title": "Close combat weapon",
            "mode": "melee",
            "range": "Melee",
            "a": "2",
            "skill": "3+",
            "s": "4",
            "ap": "0",
            "d": "1",
            "abilities": "",
            "sourceSelectionIds": [
              "unit-kroot-carnivores-selection-close-combat-weapon"
            ]
          },
          {
            "id": "unit-kroot-carnivores-profile-f6d8cdfc0b",
            "legacyIds": [
              "unit-kroot-carnivores-profile-kroot-rifle-ranged-2"
            ],
            "title": "Kroot rifle",
            "mode": "ranged",
            "range": "24\"",
            "a": "1",
            "skill": "4+",
            "s": "4",
            "ap": "0",
            "d": "1",
            "abilities": "Rapid Fire 1",
            "sourceSelectionIds": [
              "unit-kroot-carnivores-selection-kroot-rifle"
            ]
          },
          {
            "id": "unit-kroot-carnivores-profile-83eeee25ab",
            "legacyIds": [
              "unit-kroot-carnivores-profile-tanglebomb-launcher-ranged-3"
            ],
            "title": "Tanglebomb launcher",
            "mode": "ranged",
            "range": "24\"",
            "a": "D3",
            "skill": "4+",
            "s": "5",
            "ap": "0",
            "d": "1",
            "abilities": "Blast",
            "sourceSelectionIds": [
              "unit-kroot-carnivores-selection-tanglebomb-launcher"
            ]
          },
          {
            "id": "unit-kroot-carnivores-profile-14dc097147",
            "legacyIds": [
              "unit-kroot-carnivores-profile-kroot-carbine-ranged-4"
            ],
            "title": "Kroot carbine",
            "mode": "ranged",
            "range": "18\"",
            "a": "1",
            "skill": "4+",
            "s": "4",
            "ap": "0",
            "d": "2",
            "abilities": "",
            "sourceSelectionIds": [
              "unit-kroot-carnivores-selection-kroot-carbine"
            ]
          },
          {
            "id": "unit-kroot-carnivores-profile-7d0b14e526",
            "legacyIds": [
              "unit-kroot-carnivores-profile-kroot-pistol-ranged-5"
            ],
            "title": "Kroot pistol",
            "mode": "ranged",
            "range": "12\"",
            "a": "1",
            "skill": "4+",
            "s": "4",
            "ap": "0",
            "d": "1",
            "abilities": "Pistol",
            "sourceSelectionIds": [
              "unit-kroot-carnivores-selection-kroot-pistol"
            ]
          }
        ],
        "wargearAbilities": [],
        "wargearDefaults": [
          {
            "modelId": "unit-kroot-carnivores-model-40a87f1ad7",
            "selections": [
              {
                "selectionId": "unit-kroot-carnivores-selection-kroot-rifle",
                "quantity": 1
              },
              {
                "selectionId": "unit-kroot-carnivores-selection-close-combat-weapon",
                "quantity": 1
              }
            ]
          },
          {
            "modelId": "unit-kroot-carnivores-model-a87487f2e0",
            "selections": [
              {
                "selectionId": "unit-kroot-carnivores-selection-kroot-pistol",
                "quantity": 1
              },
              {
                "selectionId": "unit-kroot-carnivores-selection-kroot-rifle",
                "quantity": 1
              },
              {
                "selectionId": "unit-kroot-carnivores-selection-close-combat-weapon",
                "quantity": 1
              }
            ]
          }
        ],
        "wargearOptionContracts": [
          {
            "sourceId": "datasheet-kroot-carnivores:wargear:1",
            "eligibleModelIds": [
              "unit-kroot-carnivores-model-a87487f2e0"
            ],
            "limit": {
              "perModel": 1
            },
            "choices": [
              {
                "remove": [
                  {
                    "selectionId": "unit-kroot-carnivores-selection-kroot-rifle",
                    "quantity": 1
                  }
                ],
                "add": [
                  {
                    "selectionId": "unit-kroot-carnivores-selection-kroot-carbine",
                    "quantity": 1
                  }
                ],
                "requiresFinal": [],
                "forbidsFinal": [],
                "sharedUses": []
              }
            ]
          },
          {
            "sourceId": "datasheet-kroot-carnivores:wargear:2",
            "eligibleModelIds": [
              "unit-kroot-carnivores-model-40a87f1ad7"
            ],
            "limit": {
              "perModel": 1,
              "perModels": {
                "models": 10,
                "uses": 1
              }
            },
            "choices": [
              {
                "remove": [
                  {
                    "selectionId": "unit-kroot-carnivores-selection-kroot-rifle",
                    "quantity": 1
                  }
                ],
                "add": [
                  {
                    "selectionId": "unit-kroot-carnivores-selection-tanglebomb-launcher",
                    "quantity": 1
                  }
                ],
                "requiresFinal": [],
                "forbidsFinal": [],
                "sharedUses": []
              }
            ]
          }
        ],
        "wargearSharedCaps": []
      }
    },
    {
      "id": "unit-kroot-farstalkers",
      "title": "Kroot Farstalkers",
      "sourceBookId": "tau-empire",
      "sourceLayer": "codex",
      "intrinsicKeywords": [
        "Infantry",
        "Kroot",
        "Grenades",
        "Farstalkers",
        "T'au Empire"
      ],
      "relations": {
        "canLead": [],
        "canSupport": [],
        "canBeLedBy": [
          {
            "unitId": "unit-kroot-flesh-shaper",
            "maxCharacters": 1
          },
          {
            "unitId": "unit-kroot-trail-shaper",
            "maxCharacters": 1
          },
          {
            "unitId": "unit-kroot-war-shaper",
            "maxCharacters": 1
          }
        ],
        "canBeSupportedBy": []
      },
      "ruleFacts": {
        "relations": {
          "canLead": [],
          "canSupport": [],
          "canBeLedBy": [
            {
              "unitId": "unit-kroot-flesh-shaper",
              "maxCharacters": 1
            },
            {
              "unitId": "unit-kroot-trail-shaper",
              "maxCharacters": 1
            },
            {
              "unitId": "unit-kroot-war-shaper",
              "maxCharacters": 1
            }
          ],
          "canBeSupportedBy": []
        }
      },
      "gameSelections": {
        "stats": {
          "T": "3",
          "Sv": "6+",
          "W": "1",
          "Ld": "7+",
          "Invulnerable": ""
        },
        "statProfiles": [
          {
            "id": "unit-kroot-farstalkers-stat-profile-a71c6dfd89",
            "title": "Farstalkers & Kill-broker",
            "stats": {
              "M": "7\"",
              "T": "3",
              "Sv": "6+",
              "W": "1",
              "Ld": "7+",
              "OC": "1",
              "Invulnerable": ""
            },
            "legacyIds": [
              "unit-kroot-farstalkers-stat-profile-farstalkers-kill-broker"
            ]
          },
          {
            "id": "unit-kroot-farstalkers-stat-profile-eaf059bd13",
            "title": "Kroot Hounds",
            "stats": {
              "M": "12\"",
              "T": "3",
              "Sv": "6+",
              "W": "1",
              "Ld": "7+",
              "OC": "0",
              "Invulnerable": ""
            },
            "legacyIds": [
              "unit-kroot-farstalkers-stat-profile-kroot-hounds"
            ]
          }
        ],
        "abilities": [
          {
            "id": "core-infiltrators",
            "sectionId": "core-infiltrators",
            "title": "Infiltrators",
            "text": "During deployment, if every model in a unit has this ability, it can be set up anywhere on the battlefield that is more than 8\" horizontally from your opponent’s deployment zone and all enemy units.",
            "sourceUnitId": "unit-kroot-farstalkers"
          },
          {
            "id": "core-stealth",
            "sectionId": "core-stealth",
            "title": "Stealth",
            "text": "If every model in a unit has this ability, each time a ranged attack targets that unit, that unit has the benefit of cover against that attack (13.08).",
            "sourceUnitId": "unit-kroot-farstalkers"
          },
          {
            "id": "tau-empire-ability-bounty-hunters",
            "sectionId": "tau-empire-ability-bounty-hunters",
            "title": "Bounty Hunters",
            "text": "At the start of the battle, select one unit from your opponent’s army. Each time a model in this unit makes an attack that targets that unit, that attack has the [LETHAL HITS] and [PRECISION] abilities.",
            "sourceUnitId": "unit-kroot-farstalkers"
          }
        ],
        "models": [
          {
            "id": "unit-kroot-farstalkers-model-c4809a50b5",
            "title": "Kroot Hounds",
            "aliases": [
              "Kroot Hounds"
            ],
            "min": 2,
            "max": 2,
            "legacyIds": [
              "unit-kroot-farstalkers-model-kroot-hounds"
            ]
          },
          {
            "id": "unit-kroot-farstalkers-model-9335775812",
            "title": "Kroot Farstalkers",
            "aliases": [
              "Kroot Farstalkers",
              "Kroot Farstalker",
              "Kroot Farstalker w/ Farstalker firearm and Pech'ra"
            ],
            "min": 9,
            "max": 9,
            "legacyIds": [
              "unit-kroot-farstalkers-model-kroot-farstalkers-2"
            ]
          },
          {
            "id": "unit-kroot-farstalkers-model-9bd01ceb35",
            "title": "Kroot Kill-broker",
            "aliases": [
              "Kroot Kill-broker"
            ],
            "min": 1,
            "max": 1,
            "legacyIds": [
              "unit-kroot-farstalkers-model-kroot-kill-broker-3"
            ]
          }
        ],
        "compositionRules": [],
        "selections": [
          {
            "id": "unit-kroot-farstalkers-selection-ripping-fangs",
            "title": "Ripping fangs",
            "aliases": [
              "Ripping fangs"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-kroot-farstalkers-profile-288af2d7e0"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-kroot-farstalkers-selection-farstalker-firearm",
            "title": "Farstalker firearm",
            "aliases": [
              "Farstalker firearm"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-kroot-farstalkers-profile-8abe2c2f95"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-kroot-farstalkers-selection-kroot-pistol",
            "title": "Kroot pistol",
            "aliases": [
              "Kroot pistol"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-kroot-farstalkers-profile-7d0b14e526"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-kroot-farstalkers-selection-close-combat-weapon",
            "title": "Close combat weapon",
            "aliases": [
              "Close combat weapon"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-kroot-farstalkers-profile-a24599bb66"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-kroot-farstalkers-selection-dvorgite-skinner",
            "title": "Dvorgite skinner",
            "aliases": [
              "Dvorgite skinner"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-kroot-farstalkers-profile-46c4488f6f"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-kroot-farstalkers-selection-londaxi-tribalest",
            "title": "Londaxi tribalest",
            "aliases": [
              "Londaxi tribalest"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-kroot-farstalkers-profile-680dbc2089"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-kroot-farstalkers-selection-ritual-blade",
            "title": "Ritual blade",
            "aliases": [
              "Ritual blade"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-kroot-farstalkers-profile-94b188a008"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-kroot-farstalkers-selection-tau-tech-rifle",
            "title": "T’au-tech rifle",
            "aliases": [
              "T’au-tech rifle"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-kroot-farstalkers-profile-72172572e7"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-kroot-farstalkers-selection-pechra",
            "title": "Pech’ra",
            "aliases": [
              "Pech’ra"
            ],
            "kind": "wargear",
            "profileIds": [],
            "wargearAbilityIds": [
              "unit-kroot-farstalkers-wargear-ability-bc9d7dbfd0"
            ]
          }
        ],
        "weaponFamilies": [],
        "weaponProfiles": [
          {
            "id": "unit-kroot-farstalkers-profile-288af2d7e0",
            "legacyIds": [
              "unit-kroot-farstalkers-profile-ripping-fangs-melee"
            ],
            "title": "Ripping fangs",
            "mode": "melee",
            "range": "Melee",
            "a": "3",
            "skill": "3+",
            "s": "3",
            "ap": "0",
            "d": "1",
            "abilities": "",
            "sourceSelectionIds": [
              "unit-kroot-farstalkers-selection-ripping-fangs"
            ]
          },
          {
            "id": "unit-kroot-farstalkers-profile-8abe2c2f95",
            "legacyIds": [
              "unit-kroot-farstalkers-profile-farstalker-firearm-ranged-2"
            ],
            "title": "Farstalker firearm",
            "mode": "ranged",
            "range": "24\"",
            "a": "1",
            "skill": "4+",
            "s": "4",
            "ap": "0",
            "d": "1",
            "abilities": "Rapid Fire 1",
            "sourceSelectionIds": [
              "unit-kroot-farstalkers-selection-farstalker-firearm"
            ]
          },
          {
            "id": "unit-kroot-farstalkers-profile-7d0b14e526",
            "legacyIds": [
              "unit-kroot-farstalkers-profile-kroot-pistol-ranged-3"
            ],
            "title": "Kroot pistol",
            "mode": "ranged",
            "range": "12\"",
            "a": "1",
            "skill": "4+",
            "s": "4",
            "ap": "0",
            "d": "1",
            "abilities": "Pistol",
            "sourceSelectionIds": [
              "unit-kroot-farstalkers-selection-kroot-pistol"
            ]
          },
          {
            "id": "unit-kroot-farstalkers-profile-a24599bb66",
            "legacyIds": [
              "unit-kroot-farstalkers-profile-close-combat-weapon-melee-4"
            ],
            "title": "Close combat weapon",
            "mode": "melee",
            "range": "Melee",
            "a": "2",
            "skill": "3+",
            "s": "4",
            "ap": "0",
            "d": "1",
            "abilities": "",
            "sourceSelectionIds": [
              "unit-kroot-farstalkers-selection-close-combat-weapon"
            ]
          },
          {
            "id": "unit-kroot-farstalkers-profile-46c4488f6f",
            "legacyIds": [
              "unit-kroot-farstalkers-profile-dvorgite-skinner-ranged-5"
            ],
            "title": "Dvorgite skinner",
            "mode": "ranged",
            "range": "12\"",
            "a": "D6",
            "skill": "N/A",
            "s": "4",
            "ap": "-1",
            "d": "1",
            "abilities": "Ignores Cover, Torrent",
            "sourceSelectionIds": [
              "unit-kroot-farstalkers-selection-dvorgite-skinner"
            ]
          },
          {
            "id": "unit-kroot-farstalkers-profile-680dbc2089",
            "legacyIds": [
              "unit-kroot-farstalkers-profile-londaxi-tribalest-ranged-6"
            ],
            "title": "Londaxi tribalest",
            "mode": "ranged",
            "range": "18\"",
            "a": "3",
            "skill": "5+",
            "s": "7",
            "ap": "-1",
            "d": "1",
            "abilities": "Anti-Vehicle 4+, Devastating Wounds, Heavy",
            "sourceSelectionIds": [
              "unit-kroot-farstalkers-selection-londaxi-tribalest"
            ]
          },
          {
            "id": "unit-kroot-farstalkers-profile-94b188a008",
            "legacyIds": [
              "unit-kroot-farstalkers-profile-ritual-blade-melee-7"
            ],
            "title": "Ritual blade",
            "mode": "melee",
            "range": "Melee",
            "a": "3",
            "skill": "3+",
            "s": "5",
            "ap": "0",
            "d": "1",
            "abilities": "",
            "sourceSelectionIds": [
              "unit-kroot-farstalkers-selection-ritual-blade"
            ]
          },
          {
            "id": "unit-kroot-farstalkers-profile-72172572e7",
            "legacyIds": [
              "unit-kroot-farstalkers-profile-tau-tech-rifle-ranged-8"
            ],
            "title": "T’au-tech rifle",
            "mode": "ranged",
            "range": "30\"",
            "a": "1",
            "skill": "4+",
            "s": "5",
            "ap": "0",
            "d": "1",
            "abilities": "Rapid Fire 1",
            "sourceSelectionIds": [
              "unit-kroot-farstalkers-selection-tau-tech-rifle"
            ]
          }
        ],
        "wargearAbilities": [
          {
            "id": "unit-kroot-farstalkers-wargear-ability-bc9d7dbfd0",
            "sectionId": "unit-kroot-farstalkers-wargear-ability-bc9d7dbfd0",
            "title": "Pech’ra",
            "text": "Ranged weapons equipped by the bearer’s unit have the [IGNORES COVER] ability.",
            "sourceUnitId": "unit-kroot-farstalkers",
            "legacyIds": [
              "unit-kroot-farstalkers-wargear-ability-pechra"
            ],
            "requiredSelectionIds": [
              "unit-kroot-farstalkers-selection-pechra"
            ]
          }
        ],
        "wargearDefaults": [
          {
            "modelId": "unit-kroot-farstalkers-model-c4809a50b5",
            "selections": [
              {
                "selectionId": "unit-kroot-farstalkers-selection-ripping-fangs",
                "quantity": 1
              }
            ]
          },
          {
            "modelId": "unit-kroot-farstalkers-model-9335775812",
            "selections": [
              {
                "selectionId": "unit-kroot-farstalkers-selection-farstalker-firearm",
                "quantity": 1
              },
              {
                "selectionId": "unit-kroot-farstalkers-selection-kroot-pistol",
                "quantity": 1
              },
              {
                "selectionId": "unit-kroot-farstalkers-selection-close-combat-weapon",
                "quantity": 1
              }
            ]
          },
          {
            "modelId": "unit-kroot-farstalkers-model-9bd01ceb35",
            "selections": [
              {
                "selectionId": "unit-kroot-farstalkers-selection-farstalker-firearm",
                "quantity": 1
              },
              {
                "selectionId": "unit-kroot-farstalkers-selection-kroot-pistol",
                "quantity": 1
              },
              {
                "selectionId": "unit-kroot-farstalkers-selection-ritual-blade",
                "quantity": 1
              }
            ]
          }
        ],
        "wargearOptionContracts": [
          {
            "sourceId": "datasheet-kroot-farstalkers:wargear:1",
            "eligibleModelIds": [
              "unit-kroot-farstalkers-model-9bd01ceb35"
            ],
            "limit": {
              "perModel": 1
            },
            "choices": [
              {
                "remove": [
                  {
                    "selectionId": "unit-kroot-farstalkers-selection-farstalker-firearm",
                    "quantity": 1
                  }
                ],
                "add": [
                  {
                    "selectionId": "unit-kroot-farstalkers-selection-tau-tech-rifle",
                    "quantity": 1
                  }
                ],
                "requiresFinal": [],
                "forbidsFinal": [],
                "sharedUses": []
              }
            ]
          },
          {
            "sourceId": "datasheet-kroot-farstalkers:wargear:2",
            "eligibleModelIds": [
              "unit-kroot-farstalkers-model-9335775812"
            ],
            "limit": {
              "perModel": 1
            },
            "choices": [
              {
                "remove": [
                  {
                    "selectionId": "unit-kroot-farstalkers-selection-farstalker-firearm",
                    "quantity": 1
                  }
                ],
                "add": [
                  {
                    "selectionId": "unit-kroot-farstalkers-selection-dvorgite-skinner",
                    "quantity": 1
                  }
                ],
                "requiresFinal": [],
                "forbidsFinal": [],
                "sharedUses": []
              },
              {
                "remove": [
                  {
                    "selectionId": "unit-kroot-farstalkers-selection-farstalker-firearm",
                    "quantity": 1
                  }
                ],
                "add": [
                  {
                    "selectionId": "unit-kroot-farstalkers-selection-londaxi-tribalest",
                    "quantity": 1
                  }
                ],
                "requiresFinal": [],
                "forbidsFinal": [],
                "sharedUses": []
              }
            ]
          },
          {
            "sourceId": "datasheet-kroot-farstalkers:wargear:3",
            "eligibleModelIds": [
              "unit-kroot-farstalkers-model-9335775812"
            ],
            "limit": {
              "perModel": 1,
              "perUnit": 1
            },
            "choices": [
              {
                "remove": [],
                "add": [
                  {
                    "selectionId": "unit-kroot-farstalkers-selection-pechra",
                    "quantity": 1
                  }
                ],
                "requiresFinal": [],
                "forbidsFinal": [],
                "sharedUses": []
              }
            ]
          }
        ],
        "wargearSharedCaps": []
      }
    },
    {
      "id": "unit-pathfinder-team",
      "title": "Pathfinder Team",
      "sourceBookId": "tau-empire",
      "sourceLayer": "codex",
      "intrinsicKeywords": [
        "Infantry",
        "Grenades",
        "Markerlight",
        "Pathfinder Team",
        "T'au Empire"
      ],
      "relations": {
        "canLead": [],
        "canSupport": [],
        "canBeLedBy": [
          {
            "unitId": "unit-darkstrider",
            "maxCharacters": 1
          }
        ],
        "canBeSupportedBy": []
      },
      "ruleFacts": {
        "relations": {
          "canLead": [],
          "canSupport": [],
          "canBeLedBy": [
            {
              "unitId": "unit-darkstrider",
              "maxCharacters": 1
            }
          ],
          "canBeSupportedBy": []
        }
      },
      "gameSelections": {
        "stats": {
          "M": "7\"",
          "T": "3",
          "Sv": "4+",
          "W": "1",
          "Ld": "7+",
          "OC": "1",
          "Invulnerable": ""
        },
        "statProfiles": [
          {
            "id": "unit-pathfinder-team-stat-profile-3c409aa70e",
            "title": "Pathfinder Team",
            "stats": {
              "M": "7\"",
              "T": "3",
              "Sv": "4+",
              "W": "1",
              "Ld": "7+",
              "OC": "1",
              "Invulnerable": ""
            },
            "legacyIds": [
              "unit-pathfinder-team-stat-profile-pathfinder-team"
            ]
          },
          {
            "id": "unit-pathfinder-team-stat-profile-0cb3bf9364",
            "title": "Pathfinder Shas'ui",
            "stats": {
              "M": "7\"",
              "T": "3",
              "Sv": "4+",
              "W": "1",
              "Ld": "7+",
              "OC": "1",
              "Invulnerable": ""
            },
            "legacyIds": [
              "unit-pathfinder-team-stat-profile-pathfinder-shasui"
            ]
          }
        ],
        "abilities": [
          {
            "id": "tau-empire-ability-target-uploaded",
            "sectionId": "tau-empire-ability-target-uploaded",
            "title": "Target Uploaded",
            "text": "Each time a model in this unit makes an attack that targets their Spotted unit, improve the Ballistic Skill characteristic of that attack by 1 and that attack has the [IGNORES COVER] ability.",
            "sourceUnitId": "unit-pathfinder-team"
          },
          {
            "id": "core-scouts",
            "sectionId": "core-scouts",
            "title": "Scouts 7\"",
            "text": "This ability always takes the form Scouts X\". In the Resolve Pre-battle Abilities step, if every model in a unit has this ability, you can do one of the following: \n- If that unit is in strategic reserves, you can set up that unit anywhere that is wholly within your deployment zone. \n- If that unit is wholly within your deployment zone, it can make a scout move. \n- If that unit is embarked within a DEDICATED TRANSPORT that is wholly within your deployment zone, and if every model embarked within that DEDICATED TRANSPORT has the Scouts ability, that DEDICATED TRANSPORT can make a scout move.",
            "sourceUnitId": "unit-pathfinder-team"
          },
          {
            "id": "tau-empire-ability-for-the-greater-good",
            "sectionId": "tau-empire-ability-for-the-greater-good",
            "title": "For The Greater Good",
            "text": "If your Army Faction is T’AU EMPIRE, at the start of your Shooting phase you can select units from your army with this ability to become Observer units.\n\nDuring your Shooting phase, for each Observer unit from your army that has not been selected to shoot this phase and is eligible to shoot (excluding FORTIFICATION and Battle-shocked units) select one enemy unit that is visible to be marked as their Spotted unit until the end of the phase. Each enemy unit can only be marked as a Spotted unit once per phase.\n\nUnits from your army with the For the Greater Good ability (excluding Observer units) are Guided units while targeting one or more Spotted units.\n\nUntil the end of the phase, each time a model from your army in a Guided unit makes an attack that targets a Spotted unit, improve the Ballistic Skill characteristic of that attack by 1 and, if the Spotted unit was marked by an Observer unit that has the Markerlight keyword, that attack has the [IGNORES COVER] ability.",
            "sourceUnitId": "unit-pathfinder-team"
          },
          {
            "id": "core-infiltrators",
            "sectionId": "core-infiltrators",
            "title": "Infiltrators",
            "text": "During deployment, if every model in a unit has this ability, it can be set up anywhere on the battlefield that is more than 8\" horizontally from your opponent’s deployment zone and all enemy units.",
            "sourceUnitId": "unit-pathfinder-team"
          },
          {
            "id": "core-ignores-cover",
            "sectionId": "core-ignores-cover",
            "title": "Ignores Cover",
            "text": "Each time an attack is made with an [IGNORES COVER] weapon, the target cannot have the benefit of cover against that attack (13.08), including from rules that give a model or unit the benefit of cover (e.g. Stealth ).",
            "sourceUnitId": "unit-pathfinder-team"
          }
        ],
        "models": [
          {
            "id": "unit-pathfinder-team-model-dc12074b37",
            "title": "Pathfinders",
            "aliases": [
              "Pathfinders",
              "Pathfinders w/ pulse carbine",
              "Pathfinders w/ pulse carbine and grenade launcher"
            ],
            "min": 9,
            "max": 9,
            "legacyIds": [
              "unit-pathfinder-team-model-pathfinders"
            ]
          },
          {
            "id": "unit-pathfinder-team-model-ec8a3938e5",
            "title": "Pathfinder Shas'ui",
            "aliases": [
              "Pathfinder Shas'ui"
            ],
            "min": 1,
            "max": 1,
            "legacyIds": [
              "unit-pathfinder-team-model-pathfinder-shasui-2"
            ]
          }
        ],
        "compositionRules": [],
        "selections": [
          {
            "id": "unit-pathfinder-team-selection-pulse-carbine",
            "title": "Pulse carbine",
            "aliases": [
              "Pulse carbine"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-pathfinder-team-profile-baa2397d8c"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-pathfinder-team-selection-pulse-pistol",
            "title": "Pulse pistol",
            "aliases": [
              "Pulse pistol"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-pathfinder-team-profile-648e20bb74"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-pathfinder-team-selection-close-combat-weapon",
            "title": "Close combat weapon",
            "aliases": [
              "Close combat weapon"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-pathfinder-team-profile-bfd73cc3f4"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-pathfinder-team-selection-semi-automatic-grenade-launcher-emp",
            "title": "➤ Semi-automatic grenade launcher - EMP",
            "aliases": [
              "➤ Semi-automatic grenade launcher - EMP"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-pathfinder-team-profile-6d79b2c760"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-pathfinder-team-selection-semi-automatic-grenade-launcher-fusion",
            "title": "➤ Semi-automatic grenade launcher - fusion",
            "aliases": [
              "➤ Semi-automatic grenade launcher - fusion"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-pathfinder-team-profile-64cdeae9f3"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-pathfinder-team-selection-ion-rifle-standard",
            "title": "➤ Ion rifle - standard",
            "aliases": [
              "➤ Ion rifle - standard"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-pathfinder-team-profile-960421984e"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-pathfinder-team-selection-ion-rifle-overcharge",
            "title": "➤ Ion rifle - overcharge",
            "aliases": [
              "➤ Ion rifle - overcharge"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-pathfinder-team-profile-6497a4cb34"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-pathfinder-team-selection-rail-rifle",
            "title": "Rail rifle",
            "aliases": [
              "Rail rifle"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-pathfinder-team-profile-cbe5e48a12"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-pathfinder-team-selection-drone-burst-cannon",
            "title": "Drone burst cannon",
            "aliases": [
              "Drone burst cannon"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-pathfinder-team-profile-dde20391e8"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-pathfinder-team-selection-twin-pulse-carbine",
            "title": "Twin pulse carbine",
            "aliases": [
              "Twin pulse carbine"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-pathfinder-team-profile-f98da3d20a"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-pathfinder-team-selection-missile-pod",
            "title": "Missile pod",
            "aliases": [
              "Missile pod"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-pathfinder-team-profile-e5f2491af6"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-pathfinder-team-weapon-family-semi-automatic-grenade-launcher-selection",
            "title": "➤ Semi-automatic grenade launcher",
            "aliases": [
              "➤ Semi-automatic grenade launcher"
            ],
            "kind": "weapon",
            "familyId": "unit-pathfinder-team-weapon-family-semi-automatic-grenade-launcher",
            "profileIds": [
              "unit-pathfinder-team-profile-6d79b2c760",
              "unit-pathfinder-team-profile-64cdeae9f3"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-pathfinder-team-weapon-family-ion-rifle-selection",
            "title": "➤ Ion rifle",
            "aliases": [
              "➤ Ion rifle"
            ],
            "kind": "weapon",
            "familyId": "unit-pathfinder-team-weapon-family-ion-rifle",
            "profileIds": [
              "unit-pathfinder-team-profile-960421984e",
              "unit-pathfinder-team-profile-6497a4cb34"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-pathfinder-team-selection-grav-inhibitor-drone",
            "title": "Grav-inhibitor Drone",
            "aliases": [
              "Grav-inhibitor Drone"
            ],
            "kind": "wargear",
            "profileIds": [],
            "wargearAbilityIds": [
              "unit-pathfinder-team-wargear-ability-661c0b0cc2"
            ]
          },
          {
            "id": "unit-pathfinder-team-selection-pulse-accelerator-drone",
            "title": "Pulse Accelerator Drone",
            "aliases": [
              "Pulse Accelerator Drone"
            ],
            "kind": "wargear",
            "profileIds": [],
            "wargearAbilityIds": [
              "unit-pathfinder-team-wargear-ability-6169f4c0aa"
            ]
          },
          {
            "id": "unit-pathfinder-team-selection-recon-drone",
            "title": "Recon Drone",
            "aliases": [
              "Recon Drone"
            ],
            "kind": "wargear",
            "profileIds": [],
            "wargearAbilityIds": [
              "unit-pathfinder-team-wargear-ability-5c4f55de99"
            ]
          },
          {
            "id": "unit-pathfinder-team-selection-marker-drone",
            "title": "Marker Drone",
            "aliases": [
              "Marker Drone"
            ],
            "kind": "wargear",
            "profileIds": [],
            "wargearAbilityIds": [
              "unit-pathfinder-team-wargear-ability-054fa4f2b6"
            ]
          },
          {
            "id": "unit-pathfinder-team-selection-shield-drone",
            "title": "Shield Drone",
            "aliases": [
              "Shield Drone"
            ],
            "kind": "wargear",
            "profileIds": [],
            "wargearAbilityIds": [
              "unit-pathfinder-team-wargear-ability-bc6aabc321"
            ]
          },
          {
            "id": "unit-pathfinder-team-selection-guardian-drone",
            "title": "Guardian Drone",
            "aliases": [
              "Guardian Drone"
            ],
            "kind": "wargear",
            "profileIds": [],
            "wargearAbilityIds": [
              "unit-pathfinder-team-wargear-ability-24a672615e"
            ]
          }
        ],
        "weaponFamilies": [
          {
            "id": "unit-pathfinder-team-weapon-family-semi-automatic-grenade-launcher",
            "title": "➤ Semi-automatic grenade launcher",
            "aliases": [
              "➤ Semi-automatic grenade launcher"
            ],
            "profileIds": [
              "unit-pathfinder-team-profile-6d79b2c760",
              "unit-pathfinder-team-profile-64cdeae9f3"
            ],
            "ambiguousAlias": false
          },
          {
            "id": "unit-pathfinder-team-weapon-family-ion-rifle",
            "title": "➤ Ion rifle",
            "aliases": [
              "➤ Ion rifle"
            ],
            "profileIds": [
              "unit-pathfinder-team-profile-960421984e",
              "unit-pathfinder-team-profile-6497a4cb34"
            ],
            "ambiguousAlias": false
          }
        ],
        "weaponProfiles": [
          {
            "id": "unit-pathfinder-team-profile-baa2397d8c",
            "legacyIds": [
              "unit-pathfinder-team-profile-pulse-carbine-ranged"
            ],
            "title": "Pulse carbine",
            "mode": "ranged",
            "range": "20\"",
            "a": "2",
            "skill": "4+",
            "s": "5",
            "ap": "0",
            "d": "1",
            "abilities": "",
            "sourceSelectionIds": [
              "unit-pathfinder-team-selection-pulse-carbine"
            ]
          },
          {
            "id": "unit-pathfinder-team-profile-648e20bb74",
            "legacyIds": [
              "unit-pathfinder-team-profile-pulse-pistol-ranged-2"
            ],
            "title": "Pulse pistol",
            "mode": "ranged",
            "range": "12\"",
            "a": "1",
            "skill": "4+",
            "s": "5",
            "ap": "0",
            "d": "1",
            "abilities": "Pistol",
            "sourceSelectionIds": [
              "unit-pathfinder-team-selection-pulse-pistol"
            ]
          },
          {
            "id": "unit-pathfinder-team-profile-bfd73cc3f4",
            "legacyIds": [
              "unit-pathfinder-team-profile-close-combat-weapon-melee-3"
            ],
            "title": "Close combat weapon",
            "mode": "melee",
            "range": "Melee",
            "a": "1",
            "skill": "5+",
            "s": "3",
            "ap": "0",
            "d": "1",
            "abilities": "",
            "sourceSelectionIds": [
              "unit-pathfinder-team-selection-close-combat-weapon"
            ]
          },
          {
            "id": "unit-pathfinder-team-profile-6d79b2c760",
            "legacyIds": [
              "unit-pathfinder-team-profile-semi-automatic-grenade-launcher-emp-ranged-4"
            ],
            "title": "➤ Semi-automatic grenade launcher - EMP",
            "mode": "ranged",
            "range": "18\"",
            "a": "1",
            "skill": "4+",
            "s": "3",
            "ap": "0",
            "d": "1",
            "abilities": "Anti-Vehicle 4+, Devastating Wounds",
            "sourceSelectionIds": [
              "unit-pathfinder-team-selection-semi-automatic-grenade-launcher-emp",
              "unit-pathfinder-team-weapon-family-semi-automatic-grenade-launcher-selection"
            ]
          },
          {
            "id": "unit-pathfinder-team-profile-64cdeae9f3",
            "legacyIds": [
              "unit-pathfinder-team-profile-semi-automatic-grenade-launcher-fusion-ranged-5"
            ],
            "title": "➤ Semi-automatic grenade launcher - fusion",
            "mode": "ranged",
            "range": "18\"",
            "a": "1",
            "skill": "4+",
            "s": "6",
            "ap": "-1",
            "d": "3",
            "abilities": "",
            "sourceSelectionIds": [
              "unit-pathfinder-team-selection-semi-automatic-grenade-launcher-fusion",
              "unit-pathfinder-team-weapon-family-semi-automatic-grenade-launcher-selection"
            ]
          },
          {
            "id": "unit-pathfinder-team-profile-960421984e",
            "legacyIds": [
              "unit-pathfinder-team-profile-ion-rifle-standard-ranged-6"
            ],
            "title": "➤ Ion rifle - standard",
            "mode": "ranged",
            "range": "30\"",
            "a": "3",
            "skill": "5+",
            "s": "7",
            "ap": "-1",
            "d": "1",
            "abilities": "Heavy",
            "sourceSelectionIds": [
              "unit-pathfinder-team-selection-ion-rifle-standard",
              "unit-pathfinder-team-weapon-family-ion-rifle-selection"
            ]
          },
          {
            "id": "unit-pathfinder-team-profile-6497a4cb34",
            "legacyIds": [
              "unit-pathfinder-team-profile-ion-rifle-overcharge-ranged-7"
            ],
            "title": "➤ Ion rifle - overcharge",
            "mode": "ranged",
            "range": "30\"",
            "a": "3",
            "skill": "5+",
            "s": "8",
            "ap": "-2",
            "d": "2",
            "abilities": "Hazardous, Heavy",
            "sourceSelectionIds": [
              "unit-pathfinder-team-selection-ion-rifle-overcharge",
              "unit-pathfinder-team-weapon-family-ion-rifle-selection"
            ]
          },
          {
            "id": "unit-pathfinder-team-profile-cbe5e48a12",
            "legacyIds": [
              "unit-pathfinder-team-profile-rail-rifle-ranged-8"
            ],
            "title": "Rail rifle",
            "mode": "ranged",
            "range": "30\"",
            "a": "1",
            "skill": "5+",
            "s": "10",
            "ap": "-4",
            "d": "3",
            "abilities": "Devastating Wounds, Heavy",
            "sourceSelectionIds": [
              "unit-pathfinder-team-selection-rail-rifle"
            ]
          },
          {
            "id": "unit-pathfinder-team-profile-dde20391e8",
            "legacyIds": [
              "unit-pathfinder-team-profile-drone-burst-cannon-ranged-9"
            ],
            "title": "Drone burst cannon",
            "mode": "ranged",
            "range": "18\"",
            "a": "4",
            "skill": "5+",
            "s": "5",
            "ap": "0",
            "d": "1",
            "abilities": "",
            "sourceSelectionIds": [
              "unit-pathfinder-team-selection-drone-burst-cannon"
            ]
          },
          {
            "id": "unit-pathfinder-team-profile-f98da3d20a",
            "legacyIds": [
              "unit-pathfinder-team-profile-twin-pulse-carbine-ranged-10"
            ],
            "title": "Twin pulse carbine",
            "mode": "ranged",
            "range": "20\"",
            "a": "2",
            "skill": "5+",
            "s": "5",
            "ap": "0",
            "d": "1",
            "abilities": "Assault, Twin-linked",
            "sourceSelectionIds": [
              "unit-pathfinder-team-selection-twin-pulse-carbine"
            ]
          },
          {
            "id": "unit-pathfinder-team-profile-e5f2491af6",
            "legacyIds": [
              "unit-pathfinder-team-profile-missile-pod-ranged-11"
            ],
            "title": "Missile pod",
            "mode": "ranged",
            "range": "30\"",
            "a": "2",
            "skill": "5+",
            "s": "7",
            "ap": "-1",
            "d": "2",
            "abilities": "",
            "sourceSelectionIds": [
              "unit-pathfinder-team-selection-missile-pod"
            ]
          }
        ],
        "wargearAbilities": [
          {
            "id": "unit-pathfinder-team-wargear-ability-661c0b0cc2",
            "sectionId": "unit-pathfinder-team-wargear-ability-661c0b0cc2",
            "title": "Grav-inhibitor Drone",
            "text": "Subtract 2 from Charge rolls made for any enemy unit that declares a charge against the bearer’s unit (this is not cumulative with any other reductions to that Charge roll).",
            "sourceUnitId": "unit-pathfinder-team",
            "legacyIds": [
              "unit-pathfinder-team-wargear-ability-grav-inhibitor-drone"
            ],
            "requiredSelectionIds": [
              "unit-pathfinder-team-selection-grav-inhibitor-drone"
            ]
          },
          {
            "id": "unit-pathfinder-team-wargear-ability-6169f4c0aa",
            "sectionId": "unit-pathfinder-team-wargear-ability-6169f4c0aa",
            "title": "Pulse Accelerator Drone",
            "text": "Add 6\" to the Range characteristic of pulse carbines equipped by models in the bearer’s unit.",
            "sourceUnitId": "unit-pathfinder-team",
            "legacyIds": [
              "unit-pathfinder-team-wargear-ability-pulse-accelerator-drone-2"
            ],
            "requiredSelectionIds": [
              "unit-pathfinder-team-selection-pulse-accelerator-drone"
            ]
          },
          {
            "id": "unit-pathfinder-team-wargear-ability-5c4f55de99",
            "sectionId": "unit-pathfinder-team-wargear-ability-5c4f55de99",
            "title": "Recon Drone",
            "text": "The bearer is equipped with 1 drone burst cannon and the bearer’s unit has the Infiltrators ability.",
            "sourceUnitId": "unit-pathfinder-team",
            "legacyIds": [
              "unit-pathfinder-team-wargear-ability-recon-drone-3"
            ],
            "requiredSelectionIds": [
              "unit-pathfinder-team-selection-recon-drone"
            ]
          },
          {
            "id": "unit-pathfinder-team-wargear-ability-054fa4f2b6",
            "sectionId": "unit-pathfinder-team-wargear-ability-054fa4f2b6",
            "title": "Marker Drone",
            "text": "The bearer’s unit has the Markerlight keyword and can act as an Observer unit for another unit even if it Advanced this turn.",
            "sourceUnitId": "unit-pathfinder-team",
            "legacyIds": [
              "unit-pathfinder-team-wargear-ability-marker-drone-4"
            ],
            "requiredSelectionIds": [
              "unit-pathfinder-team-selection-marker-drone"
            ]
          },
          {
            "id": "unit-pathfinder-team-wargear-ability-bc6aabc321",
            "sectionId": "unit-pathfinder-team-wargear-ability-bc6aabc321",
            "title": "Shield Drone",
            "text": "Add 1 to the bearer’s Wounds characteristic.",
            "sourceUnitId": "unit-pathfinder-team",
            "legacyIds": [
              "unit-pathfinder-team-wargear-ability-shield-drone-5"
            ],
            "requiredSelectionIds": [
              "unit-pathfinder-team-selection-shield-drone"
            ]
          },
          {
            "id": "unit-pathfinder-team-wargear-ability-24a672615e",
            "sectionId": "unit-pathfinder-team-wargear-ability-24a672615e",
            "title": "Guardian Drone",
            "text": "Each time a model makes a ranged attack that targets the bearer’s unit, subtract 1 from the Wound roll.",
            "sourceUnitId": "unit-pathfinder-team",
            "legacyIds": [
              "unit-pathfinder-team-wargear-ability-guardian-drone-6"
            ],
            "requiredSelectionIds": [
              "unit-pathfinder-team-selection-guardian-drone"
            ]
          }
        ],
        "wargearDefaults": [
          {
            "modelId": "unit-pathfinder-team-model-dc12074b37",
            "selections": [
              {
                "selectionId": "unit-pathfinder-team-selection-pulse-carbine",
                "quantity": 1
              },
              {
                "selectionId": "unit-pathfinder-team-selection-pulse-pistol",
                "quantity": 1
              },
              {
                "selectionId": "unit-pathfinder-team-selection-close-combat-weapon",
                "quantity": 1
              }
            ]
          },
          {
            "modelId": "unit-pathfinder-team-model-ec8a3938e5",
            "selections": [
              {
                "selectionId": "unit-pathfinder-team-selection-pulse-carbine",
                "quantity": 1
              },
              {
                "selectionId": "unit-pathfinder-team-selection-pulse-pistol",
                "quantity": 1
              },
              {
                "selectionId": "unit-pathfinder-team-selection-close-combat-weapon",
                "quantity": 1
              }
            ]
          }
        ],
        "wargearOptionContracts": [
          {
            "sourceId": "datasheet-pathfinder-team:wargear:1",
            "eligibleModelIds": [
              "unit-pathfinder-team-model-ec8a3938e5"
            ],
            "limit": {
              "perModel": 1
            },
            "choices": [
              {
                "remove": [],
                "add": [
                  {
                    "selectionId": "unit-pathfinder-team-selection-grav-inhibitor-drone",
                    "quantity": 1
                  }
                ],
                "requiresFinal": [],
                "forbidsFinal": [],
                "sharedUses": []
              },
              {
                "remove": [],
                "add": [
                  {
                    "selectionId": "unit-pathfinder-team-selection-pulse-accelerator-drone",
                    "quantity": 1
                  }
                ],
                "requiresFinal": [],
                "forbidsFinal": [],
                "sharedUses": []
              },
              {
                "remove": [],
                "add": [
                  {
                    "selectionId": "unit-pathfinder-team-selection-recon-drone",
                    "quantity": 1
                  }
                ],
                "requiresFinal": [],
                "forbidsFinal": [],
                "sharedUses": []
              }
            ]
          },
          {
            "sourceId": "datasheet-pathfinder-team:wargear:2",
            "eligibleModelIds": [
              "unit-pathfinder-team-model-ec8a3938e5"
            ],
            "limit": {
              "perModel": 2
            },
            "choices": [
              {
                "remove": [],
                "add": [
                  {
                    "selectionId": "unit-pathfinder-team-selection-twin-pulse-carbine",
                    "quantity": 1
                  }
                ],
                "requiresFinal": [],
                "forbidsFinal": [],
                "sharedUses": []
              },
              {
                "remove": [],
                "add": [
                  {
                    "selectionId": "unit-pathfinder-team-selection-marker-drone",
                    "quantity": 1
                  }
                ],
                "requiresFinal": [],
                "forbidsFinal": [],
                "sharedUses": []
              },
              {
                "remove": [],
                "add": [
                  {
                    "selectionId": "unit-pathfinder-team-selection-shield-drone",
                    "quantity": 1
                  }
                ],
                "requiresFinal": [],
                "forbidsFinal": [],
                "sharedUses": []
              }
            ]
          },
          {
            "sourceId": "datasheet-pathfinder-team:wargear:3",
            "eligibleModelIds": [
              "unit-pathfinder-team-model-dc12074b37"
            ],
            "limit": {
              "perModel": 1,
              "perUnit": 3
            },
            "choices": [
              {
                "remove": [
                  {
                    "selectionId": "unit-pathfinder-team-selection-pulse-carbine",
                    "quantity": 1
                  }
                ],
                "add": [
                  {
                    "selectionId": "unit-pathfinder-team-weapon-family-ion-rifle-selection",
                    "quantity": 1
                  }
                ],
                "requiresFinal": [],
                "forbidsFinal": [],
                "sharedUses": []
              },
              {
                "remove": [
                  {
                    "selectionId": "unit-pathfinder-team-selection-pulse-carbine",
                    "quantity": 1
                  }
                ],
                "add": [
                  {
                    "selectionId": "unit-pathfinder-team-selection-rail-rifle",
                    "quantity": 1
                  }
                ],
                "requiresFinal": [],
                "forbidsFinal": [],
                "sharedUses": []
              }
            ]
          },
          {
            "sourceId": "datasheet-pathfinder-team:wargear:4",
            "eligibleModelIds": [
              "unit-pathfinder-team-model-dc12074b37",
              "unit-pathfinder-team-model-ec8a3938e5"
            ],
            "limit": {
              "perModel": 1,
              "perUnit": 1
            },
            "choices": [
              {
                "remove": [],
                "add": [
                  {
                    "selectionId": "unit-pathfinder-team-weapon-family-semi-automatic-grenade-launcher-selection",
                    "quantity": 1
                  }
                ],
                "requiresFinal": [
                  "unit-pathfinder-team-selection-pulse-carbine"
                ],
                "forbidsFinal": [],
                "sharedUses": []
              }
            ]
          }
        ],
        "wargearSharedCaps": []
      }
    },
    {
      "id": "unit-stealth-battlesuits",
      "title": "Stealth Battlesuits",
      "sourceBookId": "tau-empire",
      "sourceLayer": "faction-pack",
      "intrinsicKeywords": [
        "Infantry",
        "Fly",
        "Battlesuit",
        "Grenades",
        "Markerlight",
        "Stealth",
        "T'au Empire"
      ],
      "relations": {
        "canLead": [],
        "canSupport": [],
        "canBeLedBy": [],
        "canBeSupportedBy": []
      },
      "ruleFacts": {
        "relations": {
          "canLead": [],
          "canSupport": [],
          "canBeLedBy": [],
          "canBeSupportedBy": []
        }
      },
      "gameSelections": {
        "stats": {
          "M": "8\"",
          "T": "4",
          "Sv": "3+",
          "W": "2",
          "Ld": "7+",
          "OC": "1",
          "Invulnerable": ""
        },
        "statProfiles": [
          {
            "id": "unit-stealth-battlesuits-stat-profile-2ef2829fdb",
            "title": "Stealth Shas'ui",
            "stats": {
              "M": "8\"",
              "T": "4",
              "Sv": "3+",
              "W": "2",
              "Ld": "7+",
              "OC": "1",
              "Invulnerable": ""
            },
            "legacyIds": [
              "unit-stealth-battlesuits-stat-profile-stealth-shasui"
            ]
          },
          {
            "id": "unit-stealth-battlesuits-stat-profile-adcdd75562",
            "title": "Stealth Shas'vre",
            "stats": {
              "M": "8\"",
              "T": "4",
              "Sv": "3+",
              "W": "2",
              "Ld": "7+",
              "OC": "1",
              "Invulnerable": ""
            },
            "legacyIds": [
              "unit-stealth-battlesuits-stat-profile-stealth-shasvre"
            ]
          }
        ],
        "abilities": [
          {
            "id": "tau-empire-ability-forward-observers",
            "sectionId": "tau-empire-ability-forward-observers",
            "title": "Forward Observers",
            "text": "Each time this unit is an Observer unit, until the end of the phase, each time a ranged attack is made by a model in a Guided unit that targets their Spotted unit, re-roll a Hit roll of 1 and re-roll a Wound roll of 1.",
            "sourceUnitId": "unit-stealth-battlesuits"
          },
          {
            "id": "core-infiltrators",
            "sectionId": "core-infiltrators",
            "title": "Infiltrators",
            "text": "During deployment, if every model in a unit has this ability, it can be set up anywhere on the battlefield that is more than 8\" horizontally from your opponent’s deployment zone and all enemy units.",
            "sourceUnitId": "unit-stealth-battlesuits"
          },
          {
            "id": "core-stealth",
            "sectionId": "core-stealth",
            "title": "Stealth",
            "text": "If every model in a unit has this ability, each time a ranged attack targets that unit, that unit has the benefit of cover against that attack (13.08).",
            "sourceUnitId": "unit-stealth-battlesuits"
          },
          {
            "id": "tau-empire-ability-for-the-greater-good",
            "sectionId": "tau-empire-ability-for-the-greater-good",
            "title": "For The Greater Good",
            "text": "If your Army Faction is T’AU EMPIRE, at the start of your Shooting phase you can select units from your army with this ability to become Observer units.\n\nDuring your Shooting phase, for each Observer unit from your army that has not been selected to shoot this phase and is eligible to shoot (excluding FORTIFICATION and Battle-shocked units) select one enemy unit that is visible to be marked as their Spotted unit until the end of the phase. Each enemy unit can only be marked as a Spotted unit once per phase.\n\nUnits from your army with the For the Greater Good ability (excluding Observer units) are Guided units while targeting one or more Spotted units.\n\nUntil the end of the phase, each time a model from your army in a Guided unit makes an attack that targets a Spotted unit, improve the Ballistic Skill characteristic of that attack by 1 and, if the Spotted unit was marked by an Observer unit that has the Markerlight keyword, that attack has the [IGNORES COVER] ability.",
            "sourceUnitId": "unit-stealth-battlesuits"
          }
        ],
        "models": [
          {
            "id": "unit-stealth-battlesuits-model-09e8cea44f",
            "title": "4 Stealth Shas'ui",
            "aliases": [
              "4 Stealth Shas'ui",
              "Stealth Shas'ui w/ burst cannon",
              "Stealth Shas'ui w/ fusion blaster"
            ],
            "min": 4,
            "max": 4,
            "legacyIds": [
              "unit-stealth-battlesuits-model-4-stealth-shasui"
            ]
          },
          {
            "id": "unit-stealth-battlesuits-model-fff9bd801a",
            "title": "Stealth Shas'vre",
            "aliases": [
              "Stealth Shas'vre"
            ],
            "min": 1,
            "max": 1,
            "legacyIds": [
              "unit-stealth-battlesuits-model-stealth-shasvre-2"
            ]
          }
        ],
        "compositionRules": [],
        "selections": [
          {
            "id": "unit-stealth-battlesuits-selection-battlesuit-fists",
            "title": "Battlesuit fists",
            "aliases": [
              "Battlesuit fists"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-stealth-battlesuits-profile-4b1ce2613c"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-stealth-battlesuits-selection-burst-cannon",
            "title": "Burst cannon",
            "aliases": [
              "Burst cannon"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-stealth-battlesuits-profile-d19f6a34f8"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-stealth-battlesuits-selection-fusion-blaster",
            "title": "Fusion blaster",
            "aliases": [
              "Fusion blaster"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-stealth-battlesuits-profile-1259920c65"
            ],
            "wargearAbilityIds": [],
            "maxTotalQuantity": 2
          },
          {
            "id": "unit-stealth-battlesuits-selection-twin-pulse-carbine",
            "title": "Twin pulse carbine",
            "aliases": [
              "Twin pulse carbine"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-stealth-battlesuits-profile-f98da3d20a"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-stealth-battlesuits-selection-pulse-pistol",
            "title": "Pulse pistol",
            "aliases": [
              "Pulse pistol"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-stealth-battlesuits-profile-648e20bb74"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-stealth-battlesuits-selection-homing-beacon",
            "title": "Homing Beacon",
            "aliases": [
              "Homing Beacon"
            ],
            "kind": "wargear",
            "profileIds": [],
            "wargearAbilityIds": [
              "unit-stealth-battlesuits-wargear-ability-8d6e7fb215"
            ]
          },
          {
            "id": "unit-stealth-battlesuits-selection-marker-drone",
            "title": "Marker Drone",
            "aliases": [
              "Marker Drone"
            ],
            "kind": "wargear",
            "profileIds": [],
            "wargearAbilityIds": [
              "unit-stealth-battlesuits-wargear-ability-054fa4f2b6"
            ]
          },
          {
            "id": "unit-stealth-battlesuits-selection-gun-drone",
            "title": "Gun Drone",
            "aliases": [
              "Gun Drone"
            ],
            "kind": "wargear",
            "profileIds": [
              "unit-stealth-battlesuits-profile-f98da3d20a"
            ],
            "wargearAbilityIds": []
          }
        ],
        "weaponFamilies": [],
        "weaponProfiles": [
          {
            "id": "unit-stealth-battlesuits-profile-4b1ce2613c",
            "legacyIds": [
              "unit-stealth-battlesuits-profile-battlesuit-fists-melee"
            ],
            "title": "Battlesuit fists",
            "mode": "melee",
            "range": "Melee",
            "a": "2",
            "skill": "5+",
            "s": "4",
            "ap": "0",
            "d": "1",
            "abilities": "",
            "sourceSelectionIds": [
              "unit-stealth-battlesuits-selection-battlesuit-fists"
            ]
          },
          {
            "id": "unit-stealth-battlesuits-profile-d19f6a34f8",
            "legacyIds": [
              "unit-stealth-battlesuits-profile-burst-cannon-ranged-2"
            ],
            "title": "Burst cannon",
            "mode": "ranged",
            "range": "18\"",
            "a": "4",
            "skill": "4+",
            "s": "5",
            "ap": "0",
            "d": "1",
            "abilities": "",
            "sourceSelectionIds": [
              "unit-stealth-battlesuits-selection-burst-cannon"
            ]
          },
          {
            "id": "unit-stealth-battlesuits-profile-1259920c65",
            "legacyIds": [
              "unit-stealth-battlesuits-profile-fusion-blaster-ranged-3"
            ],
            "title": "Fusion blaster",
            "mode": "ranged",
            "range": "12\"",
            "a": "1",
            "skill": "4+",
            "s": "9",
            "ap": "-4",
            "d": "D6",
            "abilities": "Melta 2",
            "sourceSelectionIds": [
              "unit-stealth-battlesuits-selection-fusion-blaster"
            ]
          },
          {
            "id": "unit-stealth-battlesuits-profile-f98da3d20a",
            "legacyIds": [
              "unit-stealth-battlesuits-profile-twin-pulse-carbine-ranged-4"
            ],
            "title": "Twin pulse carbine",
            "mode": "ranged",
            "range": "20\"",
            "a": "2",
            "skill": "5+",
            "s": "5",
            "ap": "0",
            "d": "1",
            "abilities": "Assault, Twin-linked",
            "sourceSelectionIds": [
              "unit-stealth-battlesuits-selection-twin-pulse-carbine",
              "unit-stealth-battlesuits-selection-gun-drone"
            ]
          },
          {
            "id": "unit-stealth-battlesuits-profile-648e20bb74",
            "legacyIds": [
              "unit-stealth-battlesuits-profile-pulse-pistol-ranged-5"
            ],
            "title": "Pulse pistol",
            "mode": "ranged",
            "range": "12\"",
            "a": "1",
            "skill": "4+",
            "s": "5",
            "ap": "0",
            "d": "1",
            "abilities": "Pistol",
            "sourceSelectionIds": [
              "unit-stealth-battlesuits-selection-pulse-pistol"
            ]
          }
        ],
        "wargearAbilities": [
          {
            "id": "unit-stealth-battlesuits-wargear-ability-8d6e7fb215",
            "sectionId": "unit-stealth-battlesuits-wargear-ability-8d6e7fb215",
            "title": "Homing Beacon",
            "text": "Once per battle, you can use the Rapid Ingress Stratagem for 0CP. The target must be set up within 3\" of the bearer’s unit and more than 8\" away from all enemy units.\nDesigner’s Note: Place a Homing Beacon token next to this unit, removing it once this ability is used.",
            "sourceUnitId": "unit-stealth-battlesuits",
            "legacyIds": [
              "unit-stealth-battlesuits-wargear-ability-homing-beacon"
            ],
            "requiredSelectionIds": [
              "unit-stealth-battlesuits-selection-homing-beacon"
            ]
          },
          {
            "id": "unit-stealth-battlesuits-wargear-ability-054fa4f2b6",
            "sectionId": "unit-stealth-battlesuits-wargear-ability-054fa4f2b6",
            "title": "Marker Drone",
            "text": "The bearer’s unit has the Markerlight keyword and can act as an Observer unit for another unit even if it Advanced this turn.",
            "sourceUnitId": "unit-stealth-battlesuits",
            "legacyIds": [
              "unit-stealth-battlesuits-wargear-ability-marker-drone-2"
            ],
            "requiredSelectionIds": [
              "unit-stealth-battlesuits-selection-marker-drone"
            ]
          }
        ],
        "wargearDefaults": [
          {
            "modelId": "unit-stealth-battlesuits-model-09e8cea44f",
            "aliases": [
              "Stealth Shas'ui 1",
              "Stealth Shas'ui 2",
              "Stealth Shas'ui 3",
              "Stealth Shas'ui 4"
            ],
            "selections": [
              {
                "selectionId": "unit-stealth-battlesuits-selection-burst-cannon",
                "quantity": 1
              },
              {
                "selectionId": "unit-stealth-battlesuits-selection-battlesuit-fists",
                "quantity": 1
              }
            ]
          },
          {
            "modelId": "unit-stealth-battlesuits-model-fff9bd801a",
            "selections": [
              {
                "selectionId": "unit-stealth-battlesuits-selection-burst-cannon",
                "quantity": 1
              },
              {
                "selectionId": "unit-stealth-battlesuits-selection-battlesuit-fists",
                "quantity": 1
              }
            ]
          }
        ],
        "wargearOptionContracts": [
          {
            "sourceId": "datasheet-stealth-battlesuits:wargear:1",
            "eligibleModelIds": [
              "unit-stealth-battlesuits-model-fff9bd801a"
            ],
            "limit": {
              "perModel": 1
            },
            "choices": [
              {
                "remove": [],
                "add": [
                  {
                    "selectionId": "unit-stealth-battlesuits-selection-gun-drone",
                    "quantity": 1
                  }
                ],
                "requiresFinal": [],
                "forbidsFinal": [],
                "sharedUses": []
              }
            ]
          },
          {
            "sourceId": "datasheet-stealth-battlesuits:wargear:2",
            "eligibleModelIds": [
              "unit-stealth-battlesuits-model-fff9bd801a"
            ],
            "limit": {
              "perModel": 1
            },
            "choices": [
              {
                "remove": [],
                "add": [
                  {
                    "selectionId": "unit-stealth-battlesuits-selection-marker-drone",
                    "quantity": 1
                  }
                ],
                "requiresFinal": [],
                "forbidsFinal": [],
                "sharedUses": []
              }
            ]
          },
          {
            "sourceId": "datasheet-stealth-battlesuits:wargear:3",
            "eligibleModelIds": [
              "unit-stealth-battlesuits-model-fff9bd801a"
            ],
            "limit": {
              "perModel": 1
            },
            "choices": [
              {
                "remove": [],
                "add": [
                  {
                    "selectionId": "unit-stealth-battlesuits-selection-pulse-pistol",
                    "quantity": 1
                  }
                ],
                "requiresFinal": [],
                "forbidsFinal": [],
                "sharedUses": []
              }
            ]
          },
          {
            "sourceId": "datasheet-stealth-battlesuits:wargear:4",
            "eligibleModelIds": [
              "unit-stealth-battlesuits-model-09e8cea44f"
            ],
            "limit": {
              "perModel": 1,
              "perUnit": 1
            },
            "choices": [
              {
                "remove": [],
                "add": [
                  {
                    "selectionId": "unit-stealth-battlesuits-selection-homing-beacon",
                    "quantity": 1
                  }
                ],
                "requiresFinal": [],
                "forbidsFinal": [],
                "sharedUses": []
              }
            ]
          },
          {
            "sourceId": "datasheet-stealth-battlesuits:wargear:5",
            "eligibleModelIds": [
              "unit-stealth-battlesuits-model-09e8cea44f",
              "unit-stealth-battlesuits-model-fff9bd801a"
            ],
            "limit": {
              "perModel": 1,
              "perUnit": 2
            },
            "choices": [
              {
                "remove": [
                  {
                    "selectionId": "unit-stealth-battlesuits-selection-burst-cannon",
                    "quantity": 1
                  }
                ],
                "add": [
                  {
                    "selectionId": "unit-stealth-battlesuits-selection-fusion-blaster",
                    "quantity": 1
                  }
                ],
                "requiresFinal": [],
                "forbidsFinal": [],
                "sharedUses": []
              }
            ]
          }
        ],
        "wargearSharedCaps": []
      }
    },
    {
      "id": "unit-vespid-stingwings",
      "title": "Vespid Stingwings",
      "sourceBookId": "tau-empire",
      "sourceLayer": "faction-pack",
      "intrinsicKeywords": [
        "Infantry",
        "Fly",
        "Vespid Stingwings",
        "T'au Empire"
      ],
      "relations": {
        "canLead": [],
        "canSupport": [],
        "canBeLedBy": [],
        "canBeSupportedBy": []
      },
      "ruleFacts": {
        "relations": {
          "canLead": [],
          "canSupport": [],
          "canBeLedBy": [],
          "canBeSupportedBy": []
        }
      },
      "gameSelections": {
        "stats": {
          "M": "12\"",
          "T": "4",
          "Sv": "4+",
          "W": "1",
          "Ld": "7+",
          "OC": "1",
          "Invulnerable": ""
        },
        "statProfiles": [
          {
            "id": "unit-vespid-stingwings-stat-profile-c0dbf637b9",
            "title": "Vespid Stingwings",
            "stats": {
              "M": "12\"",
              "T": "4",
              "Sv": "4+",
              "W": "1",
              "Ld": "7+",
              "OC": "1",
              "Invulnerable": ""
            },
            "legacyIds": [
              "unit-vespid-stingwings-stat-profile-vespid-stingwings"
            ]
          }
        ],
        "abilities": [
          {
            "id": "tau-empire-ability-airborne-agility",
            "sectionId": "tau-empire-ability-airborne-agility",
            "title": "Airborne Agility",
            "text": "At the end of your opponent’s turn, if this unit is not within Engagement Range of one or more enemy units, you can remove it from the battlefield and place it into Strategic Reserves.",
            "sourceUnitId": "unit-vespid-stingwings"
          },
          {
            "id": "core-deep-strike",
            "sectionId": "core-deep-strike",
            "title": "Deep Strike",
            "text": "Each time this unit makes an ingress move (20.04), if every model in this unit has this ability, it can be set up anywhere on the battlefield that is more than 8\" horizontally from all enemy units, even if that is within your opponent’s deployment zone.",
            "sourceUnitId": "unit-vespid-stingwings"
          }
        ],
        "models": [
          {
            "id": "unit-vespid-stingwings-model-a599725791",
            "title": "Vespid Strain Leader",
            "aliases": [
              "Vespid Strain Leader"
            ],
            "min": 1,
            "max": 1,
            "legacyIds": [
              "unit-vespid-stingwings-model-vespid-strain-leader"
            ]
          },
          {
            "id": "unit-vespid-stingwings-model-d198e33d6f",
            "title": "4-9 Vespid Stingwings",
            "aliases": [
              "4-9 Vespid Stingwings",
              "Vespid Stingwings w/ Neutron Blaster",
              "Vespid Stingwings w/ T'au Flamer",
              "Vespid Stingwings w/ Neutron Grenade Launcher",
              "Vespid Stingwings w/ Neutron Rail Rifle"
            ],
            "min": 4,
            "max": 9,
            "legacyIds": [
              "unit-vespid-stingwings-model-4-9-vespid-stingwings-2"
            ]
          }
        ],
        "compositionRules": [],
        "selections": [
          {
            "id": "unit-vespid-stingwings-selection-stingwing-claws",
            "title": "Stingwing claws",
            "aliases": [
              "Stingwing claws"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-vespid-stingwings-profile-551f377f96"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-vespid-stingwings-selection-neutron-blaster",
            "title": "Neutron blaster",
            "aliases": [
              "Neutron blaster"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-vespid-stingwings-profile-d5d9a39d36"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-vespid-stingwings-selection-tau-flamer",
            "title": "T'au flamer",
            "aliases": [
              "T'au flamer"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-vespid-stingwings-profile-8f7f392529"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-vespid-stingwings-selection-neutron-grenade-launcher",
            "title": "Neutron grenade launcher",
            "aliases": [
              "Neutron grenade launcher"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-vespid-stingwings-profile-9b125fdadf"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-vespid-stingwings-selection-neutron-rail-rifle",
            "title": "Neutron rail rifle",
            "aliases": [
              "Neutron rail rifle"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-vespid-stingwings-profile-243dad918d"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-vespid-stingwings-selection-oversight-drone",
            "title": "Oversight Drone",
            "aliases": [
              "Oversight Drone"
            ],
            "kind": "wargear",
            "profileIds": [],
            "wargearAbilityIds": [
              "unit-vespid-stingwings-wargear-ability-08190dc56a"
            ]
          }
        ],
        "weaponFamilies": [],
        "weaponProfiles": [
          {
            "id": "unit-vespid-stingwings-profile-551f377f96",
            "legacyIds": [
              "unit-vespid-stingwings-profile-stingwing-claws-melee"
            ],
            "title": "Stingwing claws",
            "mode": "melee",
            "range": "Melee",
            "a": "1",
            "skill": "4+",
            "s": "4",
            "ap": "-1",
            "d": "1",
            "abilities": "",
            "sourceSelectionIds": [
              "unit-vespid-stingwings-selection-stingwing-claws"
            ]
          },
          {
            "id": "unit-vespid-stingwings-profile-d5d9a39d36",
            "legacyIds": [
              "unit-vespid-stingwings-profile-neutron-blaster-ranged-2"
            ],
            "title": "Neutron blaster",
            "mode": "ranged",
            "range": "18\"",
            "a": "2",
            "skill": "4+",
            "s": "5",
            "ap": "-2",
            "d": "2",
            "abilities": "Assault",
            "sourceSelectionIds": [
              "unit-vespid-stingwings-selection-neutron-blaster"
            ]
          },
          {
            "id": "unit-vespid-stingwings-profile-8f7f392529",
            "legacyIds": [
              "unit-vespid-stingwings-profile-tau-flamer-ranged-3"
            ],
            "title": "T'au flamer",
            "mode": "ranged",
            "range": "12\"",
            "a": "D6",
            "skill": "N/A",
            "s": "4",
            "ap": "0",
            "d": "1",
            "abilities": "Ignores Cover, Torrent",
            "sourceSelectionIds": [
              "unit-vespid-stingwings-selection-tau-flamer"
            ]
          },
          {
            "id": "unit-vespid-stingwings-profile-9b125fdadf",
            "legacyIds": [
              "unit-vespid-stingwings-profile-neutron-grenade-launcher-ranged-4"
            ],
            "title": "Neutron grenade launcher",
            "mode": "ranged",
            "range": "18\"",
            "a": "D6",
            "skill": "4+",
            "s": "4",
            "ap": "-1",
            "d": "2",
            "abilities": "Anti-Infantry 3+, Blast",
            "sourceSelectionIds": [
              "unit-vespid-stingwings-selection-neutron-grenade-launcher"
            ]
          },
          {
            "id": "unit-vespid-stingwings-profile-243dad918d",
            "legacyIds": [
              "unit-vespid-stingwings-profile-neutron-rail-rifle-ranged-5"
            ],
            "title": "Neutron rail rifle",
            "mode": "ranged",
            "range": "30\"",
            "a": "1",
            "skill": "4+",
            "s": "10",
            "ap": "-4",
            "d": "3",
            "abilities": "Devastating Wounds",
            "sourceSelectionIds": [
              "unit-vespid-stingwings-selection-neutron-rail-rifle"
            ]
          }
        ],
        "wargearAbilities": [
          {
            "id": "unit-vespid-stingwings-wargear-ability-08190dc56a",
            "sectionId": "unit-vespid-stingwings-wargear-ability-08190dc56a",
            "title": "Oversight Drone",
            "text": "Once per battle, when the bearer’s unit is selected to shoot, until the end of the phase, ranged weapons equipped by models in this unit have the [IGNORES COVER] ability.\nDesigner’s Note: Place an Oversight Drone token next to the bearer, removing it once this ability has been used.",
            "sourceUnitId": "unit-vespid-stingwings",
            "legacyIds": [
              "unit-vespid-stingwings-wargear-ability-oversight-drone"
            ],
            "requiredSelectionIds": [
              "unit-vespid-stingwings-selection-oversight-drone"
            ]
          }
        ],
        "wargearDefaults": [
          {
            "modelId": "unit-vespid-stingwings-model-a599725791",
            "selections": [
              {
                "selectionId": "unit-vespid-stingwings-selection-neutron-blaster",
                "quantity": 1
              },
              {
                "selectionId": "unit-vespid-stingwings-selection-stingwing-claws",
                "quantity": 1
              }
            ]
          },
          {
            "modelId": "unit-vespid-stingwings-model-d198e33d6f",
            "selections": [
              {
                "selectionId": "unit-vespid-stingwings-selection-neutron-blaster",
                "quantity": 1
              },
              {
                "selectionId": "unit-vespid-stingwings-selection-stingwing-claws",
                "quantity": 1
              }
            ]
          }
        ],
        "wargearOptionContracts": [
          {
            "sourceId": "datasheet-vespid-stingwings:wargear:1",
            "eligibleModelIds": [
              "unit-vespid-stingwings-model-a599725791",
              "unit-vespid-stingwings-model-d198e33d6f"
            ],
            "when": {
              "unitModelCountEquals": 10
            },
            "limit": {
              "perModel": 1
            },
            "choices": [
              {
                "remove": [],
                "add": [
                  {
                    "selectionId": "unit-vespid-stingwings-selection-oversight-drone",
                    "quantity": 1
                  }
                ],
                "requiresFinal": [],
                "forbidsFinal": [],
                "sharedUses": [
                  "datasheet-vespid-stingwings:wargear:1:choice:1"
                ],
                "eligibleModelIds": [
                  "unit-vespid-stingwings-model-a599725791"
                ]
              },
              {
                "remove": [
                  {
                    "selectionId": "unit-vespid-stingwings-selection-neutron-blaster",
                    "quantity": 1
                  }
                ],
                "add": [
                  {
                    "selectionId": "unit-vespid-stingwings-selection-tau-flamer",
                    "quantity": 1
                  }
                ],
                "requiresFinal": [],
                "forbidsFinal": [],
                "sharedUses": [
                  "datasheet-vespid-stingwings:wargear:1:choice:2"
                ],
                "eligibleModelIds": [
                  "unit-vespid-stingwings-model-d198e33d6f"
                ]
              },
              {
                "remove": [
                  {
                    "selectionId": "unit-vespid-stingwings-selection-neutron-blaster",
                    "quantity": 1
                  }
                ],
                "add": [
                  {
                    "selectionId": "unit-vespid-stingwings-selection-neutron-grenade-launcher",
                    "quantity": 1
                  }
                ],
                "requiresFinal": [],
                "forbidsFinal": [],
                "sharedUses": [
                  "datasheet-vespid-stingwings:wargear:1:choice:3"
                ],
                "eligibleModelIds": [
                  "unit-vespid-stingwings-model-d198e33d6f"
                ]
              },
              {
                "remove": [
                  {
                    "selectionId": "unit-vespid-stingwings-selection-neutron-blaster",
                    "quantity": 1
                  }
                ],
                "add": [
                  {
                    "selectionId": "unit-vespid-stingwings-selection-neutron-rail-rifle",
                    "quantity": 1
                  }
                ],
                "requiresFinal": [],
                "forbidsFinal": [],
                "sharedUses": [
                  "datasheet-vespid-stingwings:wargear:1:choice:4"
                ],
                "eligibleModelIds": [
                  "unit-vespid-stingwings-model-d198e33d6f"
                ]
              }
            ]
          }
        ],
        "wargearSharedCaps": [
          {
            "id": "datasheet-vespid-stingwings:wargear:1:choice:1",
            "max": 1
          },
          {
            "id": "datasheet-vespid-stingwings:wargear:1:choice:2",
            "max": 1
          },
          {
            "id": "datasheet-vespid-stingwings:wargear:1:choice:3",
            "max": 1
          },
          {
            "id": "datasheet-vespid-stingwings:wargear:1:choice:4",
            "max": 1
          }
        ]
      }
    },
    {
      "id": "unit-broadside-battlesuits",
      "title": "Broadside Battlesuits",
      "sourceBookId": "tau-empire",
      "sourceLayer": "codex",
      "intrinsicKeywords": [
        "Vehicle",
        "Walker",
        "Battlesuit",
        "Broadside",
        "T'au Empire"
      ],
      "relations": {
        "canLead": [],
        "canSupport": [],
        "canBeLedBy": [],
        "canBeSupportedBy": []
      },
      "ruleFacts": {
        "relations": {
          "canLead": [],
          "canSupport": [],
          "canBeLedBy": [],
          "canBeSupportedBy": []
        }
      },
      "gameSelections": {
        "stats": {
          "M": "5\"",
          "T": "6",
          "Sv": "2+",
          "W": "8",
          "Ld": "7+",
          "OC": "2",
          "Invulnerable": ""
        },
        "statProfiles": [
          {
            "id": "unit-broadside-battlesuits-stat-profile-4b93854ddd",
            "title": "Broadside Shas’ui",
            "stats": {
              "M": "5\"",
              "T": "6",
              "Sv": "2+",
              "W": "8",
              "Ld": "7+",
              "OC": "2",
              "Invulnerable": ""
            },
            "legacyIds": [
              "unit-broadside-battlesuits-stat-profile-broadside-shasui"
            ]
          },
          {
            "id": "unit-broadside-battlesuits-stat-profile-47a23866d2",
            "title": "Broadside Shas’vre",
            "stats": {
              "M": "5\"",
              "T": "6",
              "Sv": "2+",
              "W": "8",
              "Ld": "7+",
              "OC": "2",
              "Invulnerable": ""
            },
            "legacyIds": [
              "unit-broadside-battlesuits-stat-profile-broadside-shasvre"
            ]
          }
        ],
        "abilities": [
          {
            "id": "tau-empire-ability-advanced-armour",
            "sectionId": "tau-empire-ability-advanced-armour",
            "title": "Advanced Armour",
            "text": "Models in this unit have the Feel No Pain 4+ ability against mortal wounds.",
            "sourceUnitId": "unit-broadside-battlesuits"
          },
          {
            "id": "tau-empire-ability-for-the-greater-good",
            "sectionId": "tau-empire-ability-for-the-greater-good",
            "title": "For The Greater Good",
            "text": "If your Army Faction is T’AU EMPIRE, at the start of your Shooting phase you can select units from your army with this ability to become Observer units.\n\nDuring your Shooting phase, for each Observer unit from your army that has not been selected to shoot this phase and is eligible to shoot (excluding FORTIFICATION and Battle-shocked units) select one enemy unit that is visible to be marked as their Spotted unit until the end of the phase. Each enemy unit can only be marked as a Spotted unit once per phase.\n\nUnits from your army with the For the Greater Good ability (excluding Observer units) are Guided units while targeting one or more Spotted units.\n\nUntil the end of the phase, each time a model from your army in a Guided unit makes an attack that targets a Spotted unit, improve the Ballistic Skill characteristic of that attack by 1 and, if the Spotted unit was marked by an Observer unit that has the Markerlight keyword, that attack has the [IGNORES COVER] ability.",
            "sourceUnitId": "unit-broadside-battlesuits"
          },
          {
            "id": "core-feel-no-pain",
            "sectionId": "core-feel-no-pain",
            "title": "Feel No Pain",
            "text": "This ability always takes the form Feel No Pain X+. Each time a model with this ability would lose a wound, roll one D6: on an X+, that wound is not lost.",
            "sourceUnitId": "unit-broadside-battlesuits"
          }
        ],
        "models": [
          {
            "id": "unit-broadside-battlesuits-model-0f703d9afd",
            "title": "Broadside Shas’ui (0-2)",
            "aliases": [
              "Broadside Shas’ui (0-2)",
              "Broadside Shas’ui"
            ],
            "min": 0,
            "max": 2,
            "legacyIds": [
              "unit-broadside-battlesuits-model-broadside-shasui-0-2"
            ]
          },
          {
            "id": "unit-broadside-battlesuits-model-ebe683fa53",
            "title": "Broadside Shas’vre",
            "aliases": [
              "Broadside Shas’vre"
            ],
            "min": 1,
            "max": 1,
            "legacyIds": [
              "unit-broadside-battlesuits-model-broadside-shasvre-2"
            ]
          }
        ],
        "compositionRules": [],
        "selections": [
          {
            "id": "unit-broadside-battlesuits-selection-heavy-rail-rifle",
            "title": "Heavy rail rifle",
            "aliases": [
              "Heavy rail rifle"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-broadside-battlesuits-profile-6d30e44565"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-broadside-battlesuits-selection-high-yield-missile-pods",
            "title": "High-yield missile pods",
            "aliases": [
              "High-yield missile pods"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-broadside-battlesuits-profile-0b94d53b12"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-broadside-battlesuits-selection-twin-plasma-rifle",
            "title": "Twin plasma rifle",
            "aliases": [
              "Twin plasma rifle"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-broadside-battlesuits-profile-679b3cbf7c"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-broadside-battlesuits-selection-twin-smart-missile-system",
            "title": "Twin smart missile system",
            "aliases": [
              "Twin smart missile system"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-broadside-battlesuits-profile-1d483248c1"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-broadside-battlesuits-selection-seeker-missile",
            "title": "Seeker missile",
            "aliases": [
              "Seeker missile"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-broadside-battlesuits-profile-351bd7e3c7"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-broadside-battlesuits-selection-twin-pulse-carbine",
            "title": "Twin pulse carbine",
            "aliases": [
              "Twin pulse carbine"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-broadside-battlesuits-profile-f98da3d20a"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-broadside-battlesuits-selection-missile-pod",
            "title": "Missile pod",
            "aliases": [
              "Missile pod"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-broadside-battlesuits-profile-e5f2491af6"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-broadside-battlesuits-selection-crushing-bulk",
            "title": "Crushing bulk",
            "aliases": [
              "Crushing bulk"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-broadside-battlesuits-profile-fe330b0bf9"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-broadside-battlesuits-selection-weapon-support-system",
            "title": "Weapon Support System",
            "aliases": [
              "Weapon Support System"
            ],
            "kind": "wargear",
            "profileIds": [],
            "wargearAbilityIds": [
              "unit-broadside-battlesuits-wargear-ability-7ca2aa8ecc"
            ]
          },
          {
            "id": "unit-broadside-battlesuits-selection-marker-drone",
            "title": "Marker Drone",
            "aliases": [
              "Marker Drone"
            ],
            "kind": "wargear",
            "profileIds": [],
            "wargearAbilityIds": [
              "unit-broadside-battlesuits-wargear-ability-054fa4f2b6"
            ]
          },
          {
            "id": "unit-broadside-battlesuits-selection-shield-drone",
            "title": "Shield Drone",
            "aliases": [
              "Shield Drone"
            ],
            "kind": "wargear",
            "profileIds": [],
            "wargearAbilityIds": [
              "unit-broadside-battlesuits-wargear-ability-bc6aabc321"
            ]
          },
          {
            "id": "unit-broadside-battlesuits-selection-guardian-drone",
            "title": "Guardian Drone",
            "aliases": [
              "Guardian Drone"
            ],
            "kind": "wargear",
            "profileIds": [],
            "wargearAbilityIds": [
              "unit-broadside-battlesuits-wargear-ability-24a672615e"
            ]
          }
        ],
        "weaponFamilies": [],
        "weaponProfiles": [
          {
            "id": "unit-broadside-battlesuits-profile-6d30e44565",
            "legacyIds": [
              "unit-broadside-battlesuits-profile-heavy-rail-rifle-ranged"
            ],
            "title": "Heavy rail rifle",
            "mode": "ranged",
            "range": "60\"",
            "a": "2",
            "skill": "4+",
            "s": "12",
            "ap": "-4",
            "d": "D6+1",
            "abilities": "Heavy, Devastating Wounds",
            "sourceSelectionIds": [
              "unit-broadside-battlesuits-selection-heavy-rail-rifle"
            ]
          },
          {
            "id": "unit-broadside-battlesuits-profile-0b94d53b12",
            "legacyIds": [
              "unit-broadside-battlesuits-profile-high-yield-missile-pods-ranged-2"
            ],
            "title": "High-yield missile pods",
            "mode": "ranged",
            "range": "30\"",
            "a": "6",
            "skill": "4+",
            "s": "7",
            "ap": "-1",
            "d": "2",
            "abilities": "Twin-linked",
            "sourceSelectionIds": [
              "unit-broadside-battlesuits-selection-high-yield-missile-pods"
            ]
          },
          {
            "id": "unit-broadside-battlesuits-profile-679b3cbf7c",
            "legacyIds": [
              "unit-broadside-battlesuits-profile-twin-plasma-rifle-ranged-3"
            ],
            "title": "Twin plasma rifle",
            "mode": "ranged",
            "range": "18\"",
            "a": "1",
            "skill": "4+",
            "s": "8",
            "ap": "-3",
            "d": "3",
            "abilities": "Twin-linked",
            "sourceSelectionIds": [
              "unit-broadside-battlesuits-selection-twin-plasma-rifle"
            ]
          },
          {
            "id": "unit-broadside-battlesuits-profile-1d483248c1",
            "legacyIds": [
              "unit-broadside-battlesuits-profile-twin-smart-missile-system-ranged-4"
            ],
            "title": "Twin smart missile system",
            "mode": "ranged",
            "range": "30\"",
            "a": "4",
            "skill": "4+",
            "s": "5",
            "ap": "0",
            "d": "1",
            "abilities": "Indirect Fire, Twin-linked",
            "sourceSelectionIds": [
              "unit-broadside-battlesuits-selection-twin-smart-missile-system"
            ]
          },
          {
            "id": "unit-broadside-battlesuits-profile-351bd7e3c7",
            "legacyIds": [
              "unit-broadside-battlesuits-profile-seeker-missile-ranged-5"
            ],
            "title": "Seeker missile",
            "mode": "ranged",
            "range": "48\"",
            "a": "1",
            "skill": "4+",
            "s": "14",
            "ap": "-3",
            "d": "D6+1",
            "abilities": "One Shot",
            "sourceSelectionIds": [
              "unit-broadside-battlesuits-selection-seeker-missile"
            ]
          },
          {
            "id": "unit-broadside-battlesuits-profile-f98da3d20a",
            "legacyIds": [
              "unit-broadside-battlesuits-profile-twin-pulse-carbine-ranged-6"
            ],
            "title": "Twin pulse carbine",
            "mode": "ranged",
            "range": "20\"",
            "a": "2",
            "skill": "5+",
            "s": "5",
            "ap": "0",
            "d": "1",
            "abilities": "Assault, Twin-linked",
            "sourceSelectionIds": [
              "unit-broadside-battlesuits-selection-twin-pulse-carbine"
            ]
          },
          {
            "id": "unit-broadside-battlesuits-profile-e5f2491af6",
            "legacyIds": [
              "unit-broadside-battlesuits-profile-missile-pod-ranged-7"
            ],
            "title": "Missile pod",
            "mode": "ranged",
            "range": "30\"",
            "a": "2",
            "skill": "5+",
            "s": "7",
            "ap": "-1",
            "d": "2",
            "abilities": "",
            "sourceSelectionIds": [
              "unit-broadside-battlesuits-selection-missile-pod"
            ]
          },
          {
            "id": "unit-broadside-battlesuits-profile-fe330b0bf9",
            "legacyIds": [
              "unit-broadside-battlesuits-profile-crushing-bulk-melee-8"
            ],
            "title": "Crushing bulk",
            "mode": "melee",
            "range": "Melee",
            "a": "3",
            "skill": "5+",
            "s": "6",
            "ap": "0",
            "d": "1",
            "abilities": "",
            "sourceSelectionIds": [
              "unit-broadside-battlesuits-selection-crushing-bulk"
            ]
          }
        ],
        "wargearAbilities": [
          {
            "id": "unit-broadside-battlesuits-wargear-ability-7ca2aa8ecc",
            "sectionId": "unit-broadside-battlesuits-wargear-ability-7ca2aa8ecc",
            "title": "Weapon Support System",
            "text": "Each time the bearer makes a ranged attack, you can ignore any or all modifiers to the Hit roll.",
            "sourceUnitId": "unit-broadside-battlesuits",
            "legacyIds": [
              "unit-broadside-battlesuits-wargear-ability-weapon-support-system"
            ],
            "requiredSelectionIds": [
              "unit-broadside-battlesuits-selection-weapon-support-system"
            ]
          },
          {
            "id": "unit-broadside-battlesuits-wargear-ability-054fa4f2b6",
            "sectionId": "unit-broadside-battlesuits-wargear-ability-054fa4f2b6",
            "title": "Marker Drone",
            "text": "The bearer’s unit has the Markerlight keyword and can act as an Observer unit for another unit even if it Advanced this turn.",
            "sourceUnitId": "unit-broadside-battlesuits",
            "legacyIds": [
              "unit-broadside-battlesuits-wargear-ability-marker-drone-2"
            ],
            "requiredSelectionIds": [
              "unit-broadside-battlesuits-selection-marker-drone"
            ]
          },
          {
            "id": "unit-broadside-battlesuits-wargear-ability-bc6aabc321",
            "sectionId": "unit-broadside-battlesuits-wargear-ability-bc6aabc321",
            "title": "Shield Drone",
            "text": "Add 1 to the bearer’s Wounds characteristic.",
            "sourceUnitId": "unit-broadside-battlesuits",
            "legacyIds": [
              "unit-broadside-battlesuits-wargear-ability-shield-drone-3"
            ],
            "requiredSelectionIds": [
              "unit-broadside-battlesuits-selection-shield-drone"
            ]
          },
          {
            "id": "unit-broadside-battlesuits-wargear-ability-24a672615e",
            "sectionId": "unit-broadside-battlesuits-wargear-ability-24a672615e",
            "title": "Guardian Drone",
            "text": "Each time a model makes a ranged attack that targets the bearer’s unit, subtract 1 from the Wound roll.",
            "sourceUnitId": "unit-broadside-battlesuits",
            "legacyIds": [
              "unit-broadside-battlesuits-wargear-ability-guardian-drone-4"
            ],
            "requiredSelectionIds": [
              "unit-broadside-battlesuits-selection-guardian-drone"
            ]
          }
        ],
        "wargearDefaults": [
          {
            "modelId": "unit-broadside-battlesuits-model-0f703d9afd",
            "selections": [
              {
                "selectionId": "unit-broadside-battlesuits-selection-heavy-rail-rifle",
                "quantity": 1
              },
              {
                "selectionId": "unit-broadside-battlesuits-selection-crushing-bulk",
                "quantity": 1
              }
            ]
          },
          {
            "modelId": "unit-broadside-battlesuits-model-ebe683fa53",
            "selections": [
              {
                "selectionId": "unit-broadside-battlesuits-selection-heavy-rail-rifle",
                "quantity": 1
              },
              {
                "selectionId": "unit-broadside-battlesuits-selection-crushing-bulk",
                "quantity": 1
              }
            ]
          }
        ],
        "wargearOptionContracts": [
          {
            "sourceId": "datasheet-broadside-battlesuits:wargear:1",
            "eligibleModelIds": [
              "unit-broadside-battlesuits-model-0f703d9afd",
              "unit-broadside-battlesuits-model-ebe683fa53"
            ],
            "limit": {
              "perModel": 1
            },
            "choices": [
              {
                "remove": [
                  {
                    "selectionId": "unit-broadside-battlesuits-selection-heavy-rail-rifle",
                    "quantity": 1
                  }
                ],
                "add": [
                  {
                    "selectionId": "unit-broadside-battlesuits-selection-high-yield-missile-pods",
                    "quantity": 1
                  }
                ],
                "requiresFinal": [],
                "forbidsFinal": [],
                "sharedUses": []
              }
            ]
          },
          {
            "sourceId": "datasheet-broadside-battlesuits:wargear:2",
            "eligibleModelIds": [
              "unit-broadside-battlesuits-model-0f703d9afd",
              "unit-broadside-battlesuits-model-ebe683fa53"
            ],
            "limit": {
              "perModel": 2
            },
            "choices": [
              {
                "remove": [],
                "add": [
                  {
                    "selectionId": "unit-broadside-battlesuits-selection-seeker-missile",
                    "quantity": 1
                  }
                ],
                "requiresFinal": [],
                "forbidsFinal": [],
                "sharedUses": [
                  "datasheet-broadside-battlesuits:wargear:2:choice:1"
                ]
              },
              {
                "remove": [],
                "add": [
                  {
                    "selectionId": "unit-broadside-battlesuits-selection-twin-plasma-rifle",
                    "quantity": 1
                  }
                ],
                "requiresFinal": [],
                "forbidsFinal": [],
                "sharedUses": [
                  "datasheet-broadside-battlesuits:wargear:2:choice:2",
                  "datasheet-broadside-battlesuits:wargear:4:mutual-exclusion"
                ]
              },
              {
                "remove": [],
                "add": [
                  {
                    "selectionId": "unit-broadside-battlesuits-selection-twin-smart-missile-system",
                    "quantity": 1
                  }
                ],
                "requiresFinal": [],
                "forbidsFinal": [],
                "sharedUses": [
                  "datasheet-broadside-battlesuits:wargear:2:choice:3",
                  "datasheet-broadside-battlesuits:wargear:4:mutual-exclusion"
                ]
              },
              {
                "remove": [],
                "add": [
                  {
                    "selectionId": "unit-broadside-battlesuits-selection-weapon-support-system",
                    "quantity": 1
                  }
                ],
                "requiresFinal": [],
                "forbidsFinal": [],
                "sharedUses": [
                  "datasheet-broadside-battlesuits:wargear:2:choice:4"
                ]
              }
            ]
          },
          {
            "sourceId": "datasheet-broadside-battlesuits:wargear:3",
            "eligibleModelIds": [
              "unit-broadside-battlesuits-model-0f703d9afd",
              "unit-broadside-battlesuits-model-ebe683fa53"
            ],
            "limit": {
              "perModel": 2
            },
            "choices": [
              {
                "remove": [],
                "add": [
                  {
                    "selectionId": "unit-broadside-battlesuits-selection-twin-pulse-carbine",
                    "quantity": 1
                  }
                ],
                "requiresFinal": [],
                "forbidsFinal": [],
                "sharedUses": []
              },
              {
                "remove": [],
                "add": [
                  {
                    "selectionId": "unit-broadside-battlesuits-selection-marker-drone",
                    "quantity": 1
                  }
                ],
                "requiresFinal": [],
                "forbidsFinal": [],
                "sharedUses": []
              },
              {
                "remove": [],
                "add": [
                  {
                    "selectionId": "unit-broadside-battlesuits-selection-missile-pod",
                    "quantity": 1
                  }
                ],
                "requiresFinal": [],
                "forbidsFinal": [],
                "sharedUses": []
              },
              {
                "remove": [],
                "add": [
                  {
                    "selectionId": "unit-broadside-battlesuits-selection-shield-drone",
                    "quantity": 1
                  }
                ],
                "requiresFinal": [],
                "forbidsFinal": [],
                "sharedUses": []
              }
            ]
          }
        ],
        "wargearSharedCaps": [
          {
            "id": "datasheet-broadside-battlesuits:wargear:2:choice:1",
            "max": 1,
            "scope": "model"
          },
          {
            "id": "datasheet-broadside-battlesuits:wargear:2:choice:2",
            "max": 1,
            "scope": "model"
          },
          {
            "id": "datasheet-broadside-battlesuits:wargear:2:choice:3",
            "max": 1,
            "scope": "model"
          },
          {
            "id": "datasheet-broadside-battlesuits:wargear:2:choice:4",
            "max": 1,
            "scope": "model"
          },
          {
            "id": "datasheet-broadside-battlesuits:wargear:4:mutual-exclusion",
            "max": 1,
            "scope": "model",
            "sourceIds": [
              "datasheet-broadside-battlesuits:wargear:4"
            ]
          }
        ]
      }
    },
    {
      "id": "unit-crisis-fireknife-battlesuits",
      "title": "Crisis Fireknife Battlesuits",
      "sourceBookId": "tau-empire",
      "sourceLayer": "codex",
      "intrinsicKeywords": [
        "Vehicle",
        "Walker",
        "Fly",
        "Battlesuit",
        "Crisis",
        "Fireknife",
        "T'au Empire"
      ],
      "relations": {
        "canLead": [],
        "canSupport": [],
        "canBeLedBy": [
          {
            "unitId": "unit-commander-farsight",
            "maxCharacters": 1
          },
          {
            "unitId": "unit-commander-in-coldstar-battlesuit",
            "maxCharacters": 1
          },
          {
            "unitId": "unit-commander-in-enforcer-battlesuit",
            "maxCharacters": 1
          }
        ],
        "canBeSupportedBy": []
      },
      "ruleFacts": {
        "relations": {
          "canLead": [],
          "canSupport": [],
          "canBeLedBy": [
            {
              "unitId": "unit-commander-farsight",
              "maxCharacters": 1
            },
            {
              "unitId": "unit-commander-in-coldstar-battlesuit",
              "maxCharacters": 1
            },
            {
              "unitId": "unit-commander-in-enforcer-battlesuit",
              "maxCharacters": 1
            }
          ],
          "canBeSupportedBy": []
        }
      },
      "gameSelections": {
        "stats": {
          "M": "10\"",
          "T": "5",
          "Sv": "3+",
          "W": "4",
          "Ld": "7+",
          "OC": "2",
          "Invulnerable": ""
        },
        "statProfiles": [
          {
            "id": "unit-crisis-fireknife-battlesuits-stat-profile-e8201e85a7",
            "title": "Crisis Fireknife Shas’ui",
            "stats": {
              "M": "10\"",
              "T": "5",
              "Sv": "3+",
              "W": "4",
              "Ld": "7+",
              "OC": "2",
              "Invulnerable": ""
            },
            "legacyIds": [
              "unit-crisis-fireknife-battlesuits-stat-profile-crisis-fireknife-shasui"
            ]
          },
          {
            "id": "unit-crisis-fireknife-battlesuits-stat-profile-cdb4b0025c",
            "title": "Crisis Fireknife Shas’vre",
            "stats": {
              "M": "10\"",
              "T": "5",
              "Sv": "3+",
              "W": "4",
              "Ld": "7+",
              "OC": "2",
              "Invulnerable": ""
            },
            "legacyIds": [
              "unit-crisis-fireknife-battlesuits-stat-profile-crisis-fireknife-shasvre"
            ]
          }
        ],
        "abilities": [
          {
            "id": "tau-empire-ability-fireknife",
            "sectionId": "tau-empire-ability-fireknife",
            "title": "Fireknife",
            "text": "Each time a model in this unit makes a ranged attack, re-roll a Hit roll of 1. If that attack targets a unit that is at its Starting Strength, you can re-roll the Hit roll instead.",
            "sourceUnitId": "unit-crisis-fireknife-battlesuits"
          },
          {
            "id": "tau-empire-ability-weapon-support-system-2",
            "sectionId": "tau-empire-ability-weapon-support-system-2",
            "title": "Weapon Support System",
            "text": "Each time a model in this unit makes a ranged attack, you can ignore any or all modifiers to the Hit roll.",
            "sourceUnitId": "unit-crisis-fireknife-battlesuits"
          },
          {
            "id": "core-deep-strike",
            "sectionId": "core-deep-strike",
            "title": "Deep Strike",
            "text": "Each time this unit makes an ingress move (20.04), if every model in this unit has this ability, it can be set up anywhere on the battlefield that is more than 8\" horizontally from all enemy units, even if that is within your opponent’s deployment zone.",
            "sourceUnitId": "unit-crisis-fireknife-battlesuits"
          },
          {
            "id": "tau-empire-ability-for-the-greater-good",
            "sectionId": "tau-empire-ability-for-the-greater-good",
            "title": "For The Greater Good",
            "text": "If your Army Faction is T’AU EMPIRE, at the start of your Shooting phase you can select units from your army with this ability to become Observer units.\n\nDuring your Shooting phase, for each Observer unit from your army that has not been selected to shoot this phase and is eligible to shoot (excluding FORTIFICATION and Battle-shocked units) select one enemy unit that is visible to be marked as their Spotted unit until the end of the phase. Each enemy unit can only be marked as a Spotted unit once per phase.\n\nUnits from your army with the For the Greater Good ability (excluding Observer units) are Guided units while targeting one or more Spotted units.\n\nUntil the end of the phase, each time a model from your army in a Guided unit makes an attack that targets a Spotted unit, improve the Ballistic Skill characteristic of that attack by 1 and, if the Spotted unit was marked by an Observer unit that has the Markerlight keyword, that attack has the [IGNORES COVER] ability.",
            "sourceUnitId": "unit-crisis-fireknife-battlesuits"
          }
        ],
        "models": [
          {
            "id": "unit-crisis-fireknife-battlesuits-model-b4425cd84a",
            "title": "Crisis Fireknife Shas’ui",
            "aliases": [
              "Crisis Fireknife Shas’ui"
            ],
            "min": 2,
            "max": 2,
            "legacyIds": [
              "unit-crisis-fireknife-battlesuits-model-crisis-fireknife-shasui"
            ]
          },
          {
            "id": "unit-crisis-fireknife-battlesuits-model-fa4f0b73fd",
            "title": "Crisis Fireknife Shas’vre",
            "aliases": [
              "Crisis Fireknife Shas’vre"
            ],
            "min": 1,
            "max": 1,
            "legacyIds": [
              "unit-crisis-fireknife-battlesuits-model-crisis-fireknife-shasvre-2"
            ]
          }
        ],
        "compositionRules": [],
        "selections": [
          {
            "id": "unit-crisis-fireknife-battlesuits-selection-plasma-rifle",
            "title": "Plasma rifle",
            "aliases": [
              "Plasma rifle"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-crisis-fireknife-battlesuits-profile-df38c70857"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-crisis-fireknife-battlesuits-selection-missile-pod",
            "title": "Missile pod",
            "aliases": [
              "Missile pod"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-crisis-fireknife-battlesuits-profile-fdcca74aab",
              "unit-crisis-fireknife-battlesuits-profile-e5f2491af6"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-crisis-fireknife-battlesuits-selection-twin-pulse-carbine",
            "title": "Twin pulse carbine",
            "aliases": [
              "Twin pulse carbine"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-crisis-fireknife-battlesuits-profile-f98da3d20a"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-crisis-fireknife-battlesuits-selection-battlesuit-fists",
            "title": "Battlesuit fists",
            "aliases": [
              "Battlesuit fists"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-crisis-fireknife-battlesuits-profile-ee722ada6a"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-crisis-fireknife-battlesuits-selection-marker-drone",
            "title": "Marker Drone",
            "aliases": [
              "Marker Drone"
            ],
            "kind": "wargear",
            "profileIds": [],
            "wargearAbilityIds": [
              "unit-crisis-fireknife-battlesuits-wargear-ability-054fa4f2b6"
            ]
          },
          {
            "id": "unit-crisis-fireknife-battlesuits-selection-shield-drone",
            "title": "Shield Drone",
            "aliases": [
              "Shield Drone"
            ],
            "kind": "wargear",
            "profileIds": [],
            "wargearAbilityIds": [
              "unit-crisis-fireknife-battlesuits-wargear-ability-bc6aabc321"
            ]
          },
          {
            "id": "unit-crisis-fireknife-battlesuits-selection-guardian-drone",
            "title": "Guardian Drone",
            "aliases": [
              "Guardian Drone"
            ],
            "kind": "wargear",
            "profileIds": [],
            "wargearAbilityIds": [
              "unit-crisis-fireknife-battlesuits-wargear-ability-24a672615e"
            ]
          }
        ],
        "weaponFamilies": [],
        "weaponProfiles": [
          {
            "id": "unit-crisis-fireknife-battlesuits-profile-df38c70857",
            "legacyIds": [
              "unit-crisis-fireknife-battlesuits-profile-plasma-rifle-ranged"
            ],
            "title": "Plasma rifle",
            "mode": "ranged",
            "range": "18\"",
            "a": "1",
            "skill": "4+",
            "s": "8",
            "ap": "-3",
            "d": "3",
            "abilities": "",
            "sourceSelectionIds": [
              "unit-crisis-fireknife-battlesuits-selection-plasma-rifle"
            ]
          },
          {
            "id": "unit-crisis-fireknife-battlesuits-profile-fdcca74aab",
            "legacyIds": [
              "unit-crisis-fireknife-battlesuits-profile-missile-pod-ranged-2"
            ],
            "title": "Missile pod",
            "mode": "ranged",
            "range": "30\"",
            "a": "2",
            "skill": "4+",
            "s": "7",
            "ap": "-1",
            "d": "2",
            "abilities": "",
            "sourceSelectionIds": [
              "unit-crisis-fireknife-battlesuits-selection-missile-pod"
            ]
          },
          {
            "id": "unit-crisis-fireknife-battlesuits-profile-f98da3d20a",
            "legacyIds": [
              "unit-crisis-fireknife-battlesuits-profile-twin-pulse-carbine-ranged-3"
            ],
            "title": "Twin pulse carbine",
            "mode": "ranged",
            "range": "20\"",
            "a": "2",
            "skill": "5+",
            "s": "5",
            "ap": "0",
            "d": "1",
            "abilities": "Assault, Twin-linked",
            "sourceSelectionIds": [
              "unit-crisis-fireknife-battlesuits-selection-twin-pulse-carbine"
            ]
          },
          {
            "id": "unit-crisis-fireknife-battlesuits-profile-e5f2491af6",
            "legacyIds": [
              "unit-crisis-fireknife-battlesuits-profile-missile-pod-ranged-4"
            ],
            "title": "Missile pod",
            "mode": "ranged",
            "range": "30\"",
            "a": "2",
            "skill": "5+",
            "s": "7",
            "ap": "-1",
            "d": "2",
            "abilities": "",
            "sourceSelectionIds": [
              "unit-crisis-fireknife-battlesuits-selection-missile-pod"
            ]
          },
          {
            "id": "unit-crisis-fireknife-battlesuits-profile-ee722ada6a",
            "legacyIds": [
              "unit-crisis-fireknife-battlesuits-profile-battlesuit-fists-melee-5"
            ],
            "title": "Battlesuit fists",
            "mode": "melee",
            "range": "Melee",
            "a": "3",
            "skill": "5+",
            "s": "5",
            "ap": "0",
            "d": "1",
            "abilities": "",
            "sourceSelectionIds": [
              "unit-crisis-fireknife-battlesuits-selection-battlesuit-fists"
            ]
          }
        ],
        "wargearAbilities": [
          {
            "id": "unit-crisis-fireknife-battlesuits-wargear-ability-054fa4f2b6",
            "sectionId": "unit-crisis-fireknife-battlesuits-wargear-ability-054fa4f2b6",
            "title": "Marker Drone",
            "text": "The bearer’s unit has the Markerlight keyword and can act as an Observer unit for another unit even if it Advanced this turn.",
            "sourceUnitId": "unit-crisis-fireknife-battlesuits",
            "legacyIds": [
              "unit-crisis-fireknife-battlesuits-wargear-ability-marker-drone"
            ],
            "requiredSelectionIds": [
              "unit-crisis-fireknife-battlesuits-selection-marker-drone"
            ]
          },
          {
            "id": "unit-crisis-fireknife-battlesuits-wargear-ability-bc6aabc321",
            "sectionId": "unit-crisis-fireknife-battlesuits-wargear-ability-bc6aabc321",
            "title": "Shield Drone",
            "text": "Add 1 to the bearer’s Wounds characteristic.",
            "sourceUnitId": "unit-crisis-fireknife-battlesuits",
            "legacyIds": [
              "unit-crisis-fireknife-battlesuits-wargear-ability-shield-drone-2"
            ],
            "requiredSelectionIds": [
              "unit-crisis-fireknife-battlesuits-selection-shield-drone"
            ]
          },
          {
            "id": "unit-crisis-fireknife-battlesuits-wargear-ability-24a672615e",
            "sectionId": "unit-crisis-fireknife-battlesuits-wargear-ability-24a672615e",
            "title": "Guardian Drone",
            "text": "Each time a model makes a ranged attack that targets the bearer’s unit, subtract 1 from the Wound roll.",
            "sourceUnitId": "unit-crisis-fireknife-battlesuits",
            "legacyIds": [
              "unit-crisis-fireknife-battlesuits-wargear-ability-guardian-drone-3"
            ],
            "requiredSelectionIds": [
              "unit-crisis-fireknife-battlesuits-selection-guardian-drone"
            ]
          }
        ],
        "wargearDefaults": [
          {
            "modelId": "unit-crisis-fireknife-battlesuits-model-b4425cd84a",
            "selections": [
              {
                "selectionId": "unit-crisis-fireknife-battlesuits-selection-plasma-rifle",
                "quantity": 1
              },
              {
                "selectionId": "unit-crisis-fireknife-battlesuits-selection-missile-pod",
                "quantity": 1
              },
              {
                "selectionId": "unit-crisis-fireknife-battlesuits-selection-battlesuit-fists",
                "quantity": 1
              }
            ]
          },
          {
            "modelId": "unit-crisis-fireknife-battlesuits-model-fa4f0b73fd",
            "selections": [
              {
                "selectionId": "unit-crisis-fireknife-battlesuits-selection-plasma-rifle",
                "quantity": 1
              },
              {
                "selectionId": "unit-crisis-fireknife-battlesuits-selection-missile-pod",
                "quantity": 1
              },
              {
                "selectionId": "unit-crisis-fireknife-battlesuits-selection-battlesuit-fists",
                "quantity": 1
              }
            ]
          }
        ],
        "wargearOptionContracts": [
          {
            "sourceId": "datasheet-crisis-fireknife-battlesuits:wargear:1",
            "eligibleModelIds": [
              "unit-crisis-fireknife-battlesuits-model-b4425cd84a",
              "unit-crisis-fireknife-battlesuits-model-fa4f0b73fd"
            ],
            "limit": {
              "perModel": 1
            },
            "choices": [
              {
                "remove": [
                  {
                    "selectionId": "unit-crisis-fireknife-battlesuits-selection-plasma-rifle",
                    "quantity": 1
                  }
                ],
                "add": [
                  {
                    "selectionId": "unit-crisis-fireknife-battlesuits-selection-missile-pod",
                    "quantity": 1
                  }
                ],
                "requiresFinal": [],
                "forbidsFinal": [],
                "sharedUses": []
              }
            ]
          },
          {
            "sourceId": "datasheet-crisis-fireknife-battlesuits:wargear:2",
            "eligibleModelIds": [
              "unit-crisis-fireknife-battlesuits-model-b4425cd84a",
              "unit-crisis-fireknife-battlesuits-model-fa4f0b73fd"
            ],
            "limit": {
              "perModel": 1
            },
            "choices": [
              {
                "remove": [
                  {
                    "selectionId": "unit-crisis-fireknife-battlesuits-selection-missile-pod",
                    "quantity": 1
                  }
                ],
                "add": [
                  {
                    "selectionId": "unit-crisis-fireknife-battlesuits-selection-plasma-rifle",
                    "quantity": 1
                  }
                ],
                "requiresFinal": [],
                "forbidsFinal": [],
                "sharedUses": []
              }
            ]
          },
          {
            "sourceId": "datasheet-crisis-fireknife-battlesuits:wargear:3",
            "eligibleModelIds": [
              "unit-crisis-fireknife-battlesuits-model-b4425cd84a",
              "unit-crisis-fireknife-battlesuits-model-fa4f0b73fd"
            ],
            "limit": {
              "perModel": 2
            },
            "choices": [
              {
                "remove": [],
                "add": [
                  {
                    "selectionId": "unit-crisis-fireknife-battlesuits-selection-twin-pulse-carbine",
                    "quantity": 1
                  }
                ],
                "requiresFinal": [],
                "forbidsFinal": [],
                "sharedUses": [
                  "datasheet-crisis-fireknife-battlesuits:wargear:3:choice:1"
                ]
              },
              {
                "remove": [],
                "add": [
                  {
                    "selectionId": "unit-crisis-fireknife-battlesuits-selection-marker-drone",
                    "quantity": 1
                  }
                ],
                "requiresFinal": [],
                "forbidsFinal": [],
                "sharedUses": [
                  "datasheet-crisis-fireknife-battlesuits:wargear:3:choice:2"
                ]
              },
              {
                "remove": [],
                "add": [
                  {
                    "selectionId": "unit-crisis-fireknife-battlesuits-selection-shield-drone",
                    "quantity": 1
                  }
                ],
                "requiresFinal": [],
                "forbidsFinal": [],
                "sharedUses": [
                  "datasheet-crisis-fireknife-battlesuits:wargear:3:choice:3"
                ]
              }
            ]
          }
        ],
        "wargearSharedCaps": [
          {
            "id": "datasheet-crisis-fireknife-battlesuits:wargear:3:choice:1",
            "max": 1,
            "scope": "model"
          },
          {
            "id": "datasheet-crisis-fireknife-battlesuits:wargear:3:choice:2",
            "max": 1,
            "scope": "model"
          },
          {
            "id": "datasheet-crisis-fireknife-battlesuits:wargear:3:choice:3",
            "max": 1,
            "scope": "model"
          }
        ]
      }
    },
    {
      "id": "unit-crisis-starscythe-battlesuits",
      "title": "Crisis Starscythe Battlesuits",
      "sourceBookId": "tau-empire",
      "sourceLayer": "codex",
      "intrinsicKeywords": [
        "Vehicle",
        "Walker",
        "Fly",
        "Battlesuit",
        "Crisis",
        "Starscythe",
        "T'au Empire"
      ],
      "relations": {
        "canLead": [],
        "canSupport": [],
        "canBeLedBy": [
          {
            "unitId": "unit-commander-farsight",
            "maxCharacters": 1
          },
          {
            "unitId": "unit-commander-in-coldstar-battlesuit",
            "maxCharacters": 1
          },
          {
            "unitId": "unit-commander-in-enforcer-battlesuit",
            "maxCharacters": 1
          }
        ],
        "canBeSupportedBy": []
      },
      "ruleFacts": {
        "relations": {
          "canLead": [],
          "canSupport": [],
          "canBeLedBy": [
            {
              "unitId": "unit-commander-farsight",
              "maxCharacters": 1
            },
            {
              "unitId": "unit-commander-in-coldstar-battlesuit",
              "maxCharacters": 1
            },
            {
              "unitId": "unit-commander-in-enforcer-battlesuit",
              "maxCharacters": 1
            }
          ],
          "canBeSupportedBy": []
        }
      },
      "gameSelections": {
        "stats": {
          "M": "10\"",
          "T": "5",
          "Sv": "3+",
          "W": "4",
          "Ld": "7+",
          "OC": "2",
          "Invulnerable": ""
        },
        "statProfiles": [
          {
            "id": "unit-crisis-starscythe-battlesuits-stat-profile-7eba053fbb",
            "title": "Crisis Starscythe Shas’ui",
            "stats": {
              "M": "10\"",
              "T": "5",
              "Sv": "3+",
              "W": "4",
              "Ld": "7+",
              "OC": "2",
              "Invulnerable": ""
            },
            "legacyIds": [
              "unit-crisis-starscythe-battlesuits-stat-profile-crisis-starscythe-shasui"
            ]
          },
          {
            "id": "unit-crisis-starscythe-battlesuits-stat-profile-3452ddf1d6",
            "title": "Crisis Starscythe Shas’vre",
            "stats": {
              "M": "10\"",
              "T": "5",
              "Sv": "3+",
              "W": "4",
              "Ld": "7+",
              "OC": "2",
              "Invulnerable": ""
            },
            "legacyIds": [
              "unit-crisis-starscythe-battlesuits-stat-profile-crisis-starscythe-shasvre"
            ]
          }
        ],
        "abilities": [
          {
            "id": "tau-empire-ability-starscythe",
            "sectionId": "tau-empire-ability-starscythe",
            "title": "Starscythe",
            "text": "Each time a model in this unit makes a ranged attack (excluding attacks that target MONSTERS and VEHICLES), improve the Armour Penetration characteristic of that attack by 1.",
            "sourceUnitId": "unit-crisis-starscythe-battlesuits"
          },
          {
            "id": "tau-empire-ability-battlesuit-support-system-2",
            "sectionId": "tau-empire-ability-battlesuit-support-system-2",
            "title": "Battlesuit Support System",
            "text": "This unit is eligible to shoot in a turn in which it Fell Back.",
            "sourceUnitId": "unit-crisis-starscythe-battlesuits"
          },
          {
            "id": "core-deep-strike",
            "sectionId": "core-deep-strike",
            "title": "Deep Strike",
            "text": "Each time this unit makes an ingress move (20.04), if every model in this unit has this ability, it can be set up anywhere on the battlefield that is more than 8\" horizontally from all enemy units, even if that is within your opponent’s deployment zone.",
            "sourceUnitId": "unit-crisis-starscythe-battlesuits"
          },
          {
            "id": "tau-empire-ability-for-the-greater-good",
            "sectionId": "tau-empire-ability-for-the-greater-good",
            "title": "For The Greater Good",
            "text": "If your Army Faction is T’AU EMPIRE, at the start of your Shooting phase you can select units from your army with this ability to become Observer units.\n\nDuring your Shooting phase, for each Observer unit from your army that has not been selected to shoot this phase and is eligible to shoot (excluding FORTIFICATION and Battle-shocked units) select one enemy unit that is visible to be marked as their Spotted unit until the end of the phase. Each enemy unit can only be marked as a Spotted unit once per phase.\n\nUnits from your army with the For the Greater Good ability (excluding Observer units) are Guided units while targeting one or more Spotted units.\n\nUntil the end of the phase, each time a model from your army in a Guided unit makes an attack that targets a Spotted unit, improve the Ballistic Skill characteristic of that attack by 1 and, if the Spotted unit was marked by an Observer unit that has the Markerlight keyword, that attack has the [IGNORES COVER] ability.",
            "sourceUnitId": "unit-crisis-starscythe-battlesuits"
          }
        ],
        "models": [
          {
            "id": "unit-crisis-starscythe-battlesuits-model-0239836895",
            "title": "Crisis Starscythe Shas’ui",
            "aliases": [
              "Crisis Starscythe Shas’ui"
            ],
            "min": 2,
            "max": 2,
            "legacyIds": [
              "unit-crisis-starscythe-battlesuits-model-crisis-starscythe-shasui"
            ]
          },
          {
            "id": "unit-crisis-starscythe-battlesuits-model-1a13af313d",
            "title": "Crisis Starscythe Shas’vre",
            "aliases": [
              "Crisis Starscythe Shas’vre"
            ],
            "min": 1,
            "max": 1,
            "legacyIds": [
              "unit-crisis-starscythe-battlesuits-model-crisis-starscythe-shasvre-2"
            ]
          }
        ],
        "compositionRules": [],
        "selections": [
          {
            "id": "unit-crisis-starscythe-battlesuits-selection-burst-cannon",
            "title": "Burst cannon",
            "aliases": [
              "Burst cannon"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-crisis-starscythe-battlesuits-profile-d19f6a34f8"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-crisis-starscythe-battlesuits-selection-tau-flamer",
            "title": "T'au flamer",
            "aliases": [
              "T'au flamer"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-crisis-starscythe-battlesuits-profile-8f7f392529"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-crisis-starscythe-battlesuits-selection-twin-pulse-carbine",
            "title": "Twin pulse carbine",
            "aliases": [
              "Twin pulse carbine"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-crisis-starscythe-battlesuits-profile-f98da3d20a"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-crisis-starscythe-battlesuits-selection-missile-pod",
            "title": "Missile pod",
            "aliases": [
              "Missile pod"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-crisis-starscythe-battlesuits-profile-e5f2491af6"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-crisis-starscythe-battlesuits-selection-battlesuit-fists",
            "title": "Battlesuit fists",
            "aliases": [
              "Battlesuit fists"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-crisis-starscythe-battlesuits-profile-ee722ada6a"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-crisis-starscythe-battlesuits-selection-marker-drone",
            "title": "Marker Drone",
            "aliases": [
              "Marker Drone"
            ],
            "kind": "wargear",
            "profileIds": [],
            "wargearAbilityIds": [
              "unit-crisis-starscythe-battlesuits-wargear-ability-054fa4f2b6"
            ]
          },
          {
            "id": "unit-crisis-starscythe-battlesuits-selection-shield-drone",
            "title": "Shield Drone",
            "aliases": [
              "Shield Drone"
            ],
            "kind": "wargear",
            "profileIds": [],
            "wargearAbilityIds": [
              "unit-crisis-starscythe-battlesuits-wargear-ability-bc6aabc321"
            ]
          },
          {
            "id": "unit-crisis-starscythe-battlesuits-selection-guardian-drone",
            "title": "Guardian Drone",
            "aliases": [
              "Guardian Drone"
            ],
            "kind": "wargear",
            "profileIds": [],
            "wargearAbilityIds": [
              "unit-crisis-starscythe-battlesuits-wargear-ability-24a672615e"
            ]
          }
        ],
        "weaponFamilies": [],
        "weaponProfiles": [
          {
            "id": "unit-crisis-starscythe-battlesuits-profile-d19f6a34f8",
            "legacyIds": [
              "unit-crisis-starscythe-battlesuits-profile-burst-cannon-ranged"
            ],
            "title": "Burst cannon",
            "mode": "ranged",
            "range": "18\"",
            "a": "4",
            "skill": "4+",
            "s": "5",
            "ap": "0",
            "d": "1",
            "abilities": "",
            "sourceSelectionIds": [
              "unit-crisis-starscythe-battlesuits-selection-burst-cannon"
            ]
          },
          {
            "id": "unit-crisis-starscythe-battlesuits-profile-8f7f392529",
            "legacyIds": [
              "unit-crisis-starscythe-battlesuits-profile-tau-flamer-ranged-2"
            ],
            "title": "T'au flamer",
            "mode": "ranged",
            "range": "12\"",
            "a": "D6",
            "skill": "N/A",
            "s": "4",
            "ap": "0",
            "d": "1",
            "abilities": "Ignores Cover, Torrent",
            "sourceSelectionIds": [
              "unit-crisis-starscythe-battlesuits-selection-tau-flamer"
            ]
          },
          {
            "id": "unit-crisis-starscythe-battlesuits-profile-f98da3d20a",
            "legacyIds": [
              "unit-crisis-starscythe-battlesuits-profile-twin-pulse-carbine-ranged-3"
            ],
            "title": "Twin pulse carbine",
            "mode": "ranged",
            "range": "20\"",
            "a": "2",
            "skill": "5+",
            "s": "5",
            "ap": "0",
            "d": "1",
            "abilities": "Assault, Twin-linked",
            "sourceSelectionIds": [
              "unit-crisis-starscythe-battlesuits-selection-twin-pulse-carbine"
            ]
          },
          {
            "id": "unit-crisis-starscythe-battlesuits-profile-e5f2491af6",
            "legacyIds": [
              "unit-crisis-starscythe-battlesuits-profile-missile-pod-ranged-4"
            ],
            "title": "Missile pod",
            "mode": "ranged",
            "range": "30\"",
            "a": "2",
            "skill": "5+",
            "s": "7",
            "ap": "-1",
            "d": "2",
            "abilities": "",
            "sourceSelectionIds": [
              "unit-crisis-starscythe-battlesuits-selection-missile-pod"
            ]
          },
          {
            "id": "unit-crisis-starscythe-battlesuits-profile-ee722ada6a",
            "legacyIds": [
              "unit-crisis-starscythe-battlesuits-profile-battlesuit-fists-melee-5"
            ],
            "title": "Battlesuit fists",
            "mode": "melee",
            "range": "Melee",
            "a": "3",
            "skill": "5+",
            "s": "5",
            "ap": "0",
            "d": "1",
            "abilities": "",
            "sourceSelectionIds": [
              "unit-crisis-starscythe-battlesuits-selection-battlesuit-fists"
            ]
          }
        ],
        "wargearAbilities": [
          {
            "id": "unit-crisis-starscythe-battlesuits-wargear-ability-054fa4f2b6",
            "sectionId": "unit-crisis-starscythe-battlesuits-wargear-ability-054fa4f2b6",
            "title": "Marker Drone",
            "text": "The bearer’s unit has the Markerlight keyword and can act as an Observer unit for another unit even if it Advanced this turn.",
            "sourceUnitId": "unit-crisis-starscythe-battlesuits",
            "legacyIds": [
              "unit-crisis-starscythe-battlesuits-wargear-ability-marker-drone"
            ],
            "requiredSelectionIds": [
              "unit-crisis-starscythe-battlesuits-selection-marker-drone"
            ]
          },
          {
            "id": "unit-crisis-starscythe-battlesuits-wargear-ability-bc6aabc321",
            "sectionId": "unit-crisis-starscythe-battlesuits-wargear-ability-bc6aabc321",
            "title": "Shield Drone",
            "text": "Add 1 to the bearer’s Wounds characteristic.",
            "sourceUnitId": "unit-crisis-starscythe-battlesuits",
            "legacyIds": [
              "unit-crisis-starscythe-battlesuits-wargear-ability-shield-drone-2"
            ],
            "requiredSelectionIds": [
              "unit-crisis-starscythe-battlesuits-selection-shield-drone"
            ]
          },
          {
            "id": "unit-crisis-starscythe-battlesuits-wargear-ability-24a672615e",
            "sectionId": "unit-crisis-starscythe-battlesuits-wargear-ability-24a672615e",
            "title": "Guardian Drone",
            "text": "Each time a model makes a ranged attack that targets the bearer’s unit, subtract 1 from the Wound roll.",
            "sourceUnitId": "unit-crisis-starscythe-battlesuits",
            "legacyIds": [
              "unit-crisis-starscythe-battlesuits-wargear-ability-guardian-drone-3"
            ],
            "requiredSelectionIds": [
              "unit-crisis-starscythe-battlesuits-selection-guardian-drone"
            ]
          }
        ],
        "wargearDefaults": [
          {
            "modelId": "unit-crisis-starscythe-battlesuits-model-0239836895",
            "selections": [
              {
                "selectionId": "unit-crisis-starscythe-battlesuits-selection-burst-cannon",
                "quantity": 1
              },
              {
                "selectionId": "unit-crisis-starscythe-battlesuits-selection-tau-flamer",
                "quantity": 1
              },
              {
                "selectionId": "unit-crisis-starscythe-battlesuits-selection-battlesuit-fists",
                "quantity": 1
              }
            ]
          },
          {
            "modelId": "unit-crisis-starscythe-battlesuits-model-1a13af313d",
            "selections": [
              {
                "selectionId": "unit-crisis-starscythe-battlesuits-selection-burst-cannon",
                "quantity": 1
              },
              {
                "selectionId": "unit-crisis-starscythe-battlesuits-selection-tau-flamer",
                "quantity": 1
              },
              {
                "selectionId": "unit-crisis-starscythe-battlesuits-selection-battlesuit-fists",
                "quantity": 1
              }
            ]
          }
        ],
        "wargearOptionContracts": [
          {
            "sourceId": "datasheet-crisis-starscythe-battlesuits:wargear:1",
            "eligibleModelIds": [
              "unit-crisis-starscythe-battlesuits-model-0239836895",
              "unit-crisis-starscythe-battlesuits-model-1a13af313d"
            ],
            "limit": {
              "perModel": 1
            },
            "choices": [
              {
                "remove": [
                  {
                    "selectionId": "unit-crisis-starscythe-battlesuits-selection-burst-cannon",
                    "quantity": 1
                  }
                ],
                "add": [
                  {
                    "selectionId": "unit-crisis-starscythe-battlesuits-selection-tau-flamer",
                    "quantity": 1
                  }
                ],
                "requiresFinal": [],
                "forbidsFinal": [],
                "sharedUses": []
              }
            ]
          },
          {
            "sourceId": "datasheet-crisis-starscythe-battlesuits:wargear:2",
            "eligibleModelIds": [
              "unit-crisis-starscythe-battlesuits-model-0239836895",
              "unit-crisis-starscythe-battlesuits-model-1a13af313d"
            ],
            "limit": {
              "perModel": 1
            },
            "choices": [
              {
                "remove": [
                  {
                    "selectionId": "unit-crisis-starscythe-battlesuits-selection-tau-flamer",
                    "quantity": 1
                  }
                ],
                "add": [
                  {
                    "selectionId": "unit-crisis-starscythe-battlesuits-selection-burst-cannon",
                    "quantity": 1
                  }
                ],
                "requiresFinal": [],
                "forbidsFinal": [],
                "sharedUses": []
              }
            ]
          },
          {
            "sourceId": "datasheet-crisis-starscythe-battlesuits:wargear:3",
            "eligibleModelIds": [
              "unit-crisis-starscythe-battlesuits-model-0239836895",
              "unit-crisis-starscythe-battlesuits-model-1a13af313d"
            ],
            "limit": {
              "perModel": 2
            },
            "choices": [
              {
                "remove": [],
                "add": [
                  {
                    "selectionId": "unit-crisis-starscythe-battlesuits-selection-twin-pulse-carbine",
                    "quantity": 1
                  }
                ],
                "requiresFinal": [],
                "forbidsFinal": [],
                "sharedUses": [
                  "datasheet-crisis-starscythe-battlesuits:wargear:3:choice:1"
                ]
              },
              {
                "remove": [],
                "add": [
                  {
                    "selectionId": "unit-crisis-starscythe-battlesuits-selection-marker-drone",
                    "quantity": 1
                  }
                ],
                "requiresFinal": [],
                "forbidsFinal": [],
                "sharedUses": [
                  "datasheet-crisis-starscythe-battlesuits:wargear:3:choice:2"
                ]
              },
              {
                "remove": [],
                "add": [
                  {
                    "selectionId": "unit-crisis-starscythe-battlesuits-selection-shield-drone",
                    "quantity": 1
                  }
                ],
                "requiresFinal": [],
                "forbidsFinal": [],
                "sharedUses": [
                  "datasheet-crisis-starscythe-battlesuits:wargear:3:choice:3"
                ]
              }
            ]
          }
        ],
        "wargearSharedCaps": [
          {
            "id": "datasheet-crisis-starscythe-battlesuits:wargear:3:choice:1",
            "max": 1,
            "scope": "model"
          },
          {
            "id": "datasheet-crisis-starscythe-battlesuits:wargear:3:choice:2",
            "max": 1,
            "scope": "model"
          },
          {
            "id": "datasheet-crisis-starscythe-battlesuits:wargear:3:choice:3",
            "max": 1,
            "scope": "model"
          }
        ]
      }
    },
    {
      "id": "unit-crisis-sunforge-battlesuits",
      "title": "Crisis Sunforge Battlesuits",
      "sourceBookId": "tau-empire",
      "sourceLayer": "codex",
      "intrinsicKeywords": [
        "Vehicle",
        "Walker",
        "Fly",
        "Battlesuit",
        "Crisis",
        "Sunforge",
        "T'au Empire"
      ],
      "relations": {
        "canLead": [],
        "canSupport": [],
        "canBeLedBy": [
          {
            "unitId": "unit-commander-farsight",
            "maxCharacters": 1
          },
          {
            "unitId": "unit-commander-in-coldstar-battlesuit",
            "maxCharacters": 1
          },
          {
            "unitId": "unit-commander-in-enforcer-battlesuit",
            "maxCharacters": 1
          }
        ],
        "canBeSupportedBy": []
      },
      "ruleFacts": {
        "relations": {
          "canLead": [],
          "canSupport": [],
          "canBeLedBy": [
            {
              "unitId": "unit-commander-farsight",
              "maxCharacters": 1
            },
            {
              "unitId": "unit-commander-in-coldstar-battlesuit",
              "maxCharacters": 1
            },
            {
              "unitId": "unit-commander-in-enforcer-battlesuit",
              "maxCharacters": 1
            }
          ],
          "canBeSupportedBy": []
        }
      },
      "gameSelections": {
        "stats": {
          "M": "10\"",
          "T": "5",
          "Sv": "3+",
          "W": "4",
          "Ld": "7+",
          "OC": "2",
          "Invulnerable": "4+"
        },
        "statProfiles": [
          {
            "id": "unit-crisis-sunforge-battlesuits-stat-profile-9fc5cf089e",
            "title": "Crisis Sunforge Shas’ui",
            "stats": {
              "M": "10\"",
              "T": "5",
              "Sv": "3+",
              "W": "4",
              "Ld": "7+",
              "OC": "2",
              "Invulnerable": "4+"
            },
            "legacyIds": [
              "unit-crisis-sunforge-battlesuits-stat-profile-crisis-sunforge-shasui"
            ]
          }
        ],
        "abilities": [
          {
            "id": "tau-empire-ability-sunforge",
            "sectionId": "tau-empire-ability-sunforge",
            "title": "Sunforge",
            "text": "Each time a model in this unit makes a ranged attack that targets a MONSTER or VEHICLE unit, you can re-roll the Wound roll and you can re-roll the Damage roll.",
            "sourceUnitId": "unit-crisis-sunforge-battlesuits"
          },
          {
            "id": "core-deep-strike",
            "sectionId": "core-deep-strike",
            "title": "Deep Strike",
            "text": "Each time this unit makes an ingress move (20.04), if every model in this unit has this ability, it can be set up anywhere on the battlefield that is more than 8\" horizontally from all enemy units, even if that is within your opponent’s deployment zone.",
            "sourceUnitId": "unit-crisis-sunforge-battlesuits"
          },
          {
            "id": "tau-empire-ability-for-the-greater-good",
            "sectionId": "tau-empire-ability-for-the-greater-good",
            "title": "For The Greater Good",
            "text": "If your Army Faction is T’AU EMPIRE, at the start of your Shooting phase you can select units from your army with this ability to become Observer units.\n\nDuring your Shooting phase, for each Observer unit from your army that has not been selected to shoot this phase and is eligible to shoot (excluding FORTIFICATION and Battle-shocked units) select one enemy unit that is visible to be marked as their Spotted unit until the end of the phase. Each enemy unit can only be marked as a Spotted unit once per phase.\n\nUnits from your army with the For the Greater Good ability (excluding Observer units) are Guided units while targeting one or more Spotted units.\n\nUntil the end of the phase, each time a model from your army in a Guided unit makes an attack that targets a Spotted unit, improve the Ballistic Skill characteristic of that attack by 1 and, if the Spotted unit was marked by an Observer unit that has the Markerlight keyword, that attack has the [IGNORES COVER] ability.",
            "sourceUnitId": "unit-crisis-sunforge-battlesuits"
          }
        ],
        "models": [
          {
            "id": "unit-crisis-sunforge-battlesuits-model-90f7a72c26",
            "title": "Crisis Sunforge Shas’ui",
            "aliases": [
              "Crisis Sunforge Shas’ui"
            ],
            "min": 2,
            "max": 2,
            "legacyIds": [
              "unit-crisis-sunforge-battlesuits-model-crisis-sunforge-shasui"
            ]
          },
          {
            "id": "unit-crisis-sunforge-battlesuits-model-23c0c86995",
            "title": "Crisis Sunforge Shas’vre",
            "aliases": [
              "Crisis Sunforge Shas’vre"
            ],
            "min": 1,
            "max": 1,
            "legacyIds": [
              "unit-crisis-sunforge-battlesuits-model-crisis-sunforge-shasvre-2"
            ]
          }
        ],
        "compositionRules": [],
        "selections": [
          {
            "id": "unit-crisis-sunforge-battlesuits-selection-twin-pulse-carbine",
            "title": "Twin pulse carbine",
            "aliases": [
              "Twin pulse carbine"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-crisis-sunforge-battlesuits-profile-f98da3d20a"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-crisis-sunforge-battlesuits-selection-missile-pod",
            "title": "Missile pod",
            "aliases": [
              "Missile pod"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-crisis-sunforge-battlesuits-profile-e5f2491af6"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-crisis-sunforge-battlesuits-selection-battlesuit-fists",
            "title": "Battlesuit fists",
            "aliases": [
              "Battlesuit fists"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-crisis-sunforge-battlesuits-profile-ee722ada6a"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-crisis-sunforge-battlesuits-selection-fusion-blaster",
            "title": "Fusion blaster",
            "aliases": [
              "Fusion blaster"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-crisis-sunforge-battlesuits-profile-1259920c65"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-crisis-sunforge-battlesuits-selection-marker-drone",
            "title": "Marker Drone",
            "aliases": [
              "Marker Drone"
            ],
            "kind": "wargear",
            "profileIds": [],
            "wargearAbilityIds": [
              "unit-crisis-sunforge-battlesuits-wargear-ability-054fa4f2b6"
            ]
          },
          {
            "id": "unit-crisis-sunforge-battlesuits-selection-shield-drone",
            "title": "Shield Drone",
            "aliases": [
              "Shield Drone"
            ],
            "kind": "wargear",
            "profileIds": [],
            "wargearAbilityIds": [
              "unit-crisis-sunforge-battlesuits-wargear-ability-bc6aabc321"
            ]
          },
          {
            "id": "unit-crisis-sunforge-battlesuits-selection-guardian-drone",
            "title": "Guardian Drone",
            "aliases": [
              "Guardian Drone"
            ],
            "kind": "wargear",
            "profileIds": [],
            "wargearAbilityIds": [
              "unit-crisis-sunforge-battlesuits-wargear-ability-24a672615e"
            ]
          }
        ],
        "weaponFamilies": [],
        "weaponProfiles": [
          {
            "id": "unit-crisis-sunforge-battlesuits-profile-f98da3d20a",
            "legacyIds": [
              "unit-crisis-sunforge-battlesuits-profile-twin-pulse-carbine-ranged"
            ],
            "title": "Twin pulse carbine",
            "mode": "ranged",
            "range": "20\"",
            "a": "2",
            "skill": "5+",
            "s": "5",
            "ap": "0",
            "d": "1",
            "abilities": "Assault, Twin-linked",
            "sourceSelectionIds": [
              "unit-crisis-sunforge-battlesuits-selection-twin-pulse-carbine"
            ]
          },
          {
            "id": "unit-crisis-sunforge-battlesuits-profile-e5f2491af6",
            "legacyIds": [
              "unit-crisis-sunforge-battlesuits-profile-missile-pod-ranged-2"
            ],
            "title": "Missile pod",
            "mode": "ranged",
            "range": "30\"",
            "a": "2",
            "skill": "5+",
            "s": "7",
            "ap": "-1",
            "d": "2",
            "abilities": "",
            "sourceSelectionIds": [
              "unit-crisis-sunforge-battlesuits-selection-missile-pod"
            ]
          },
          {
            "id": "unit-crisis-sunforge-battlesuits-profile-ee722ada6a",
            "legacyIds": [
              "unit-crisis-sunforge-battlesuits-profile-battlesuit-fists-melee-3"
            ],
            "title": "Battlesuit fists",
            "mode": "melee",
            "range": "Melee",
            "a": "3",
            "skill": "5+",
            "s": "5",
            "ap": "0",
            "d": "1",
            "abilities": "",
            "sourceSelectionIds": [
              "unit-crisis-sunforge-battlesuits-selection-battlesuit-fists"
            ]
          },
          {
            "id": "unit-crisis-sunforge-battlesuits-profile-1259920c65",
            "legacyIds": [
              "unit-crisis-sunforge-battlesuits-profile-fusion-blaster-ranged-4"
            ],
            "title": "Fusion blaster",
            "mode": "ranged",
            "range": "12\"",
            "a": "1",
            "skill": "4+",
            "s": "9",
            "ap": "-4",
            "d": "D6",
            "abilities": "Melta 2",
            "sourceSelectionIds": [
              "unit-crisis-sunforge-battlesuits-selection-fusion-blaster"
            ]
          }
        ],
        "wargearAbilities": [
          {
            "id": "unit-crisis-sunforge-battlesuits-wargear-ability-054fa4f2b6",
            "sectionId": "unit-crisis-sunforge-battlesuits-wargear-ability-054fa4f2b6",
            "title": "Marker Drone",
            "text": "The bearer’s unit has the Markerlight keyword and can act as an Observer unit for another unit even if it Advanced this turn.",
            "sourceUnitId": "unit-crisis-sunforge-battlesuits",
            "legacyIds": [
              "unit-crisis-sunforge-battlesuits-wargear-ability-marker-drone"
            ],
            "requiredSelectionIds": [
              "unit-crisis-sunforge-battlesuits-selection-marker-drone"
            ]
          },
          {
            "id": "unit-crisis-sunforge-battlesuits-wargear-ability-bc6aabc321",
            "sectionId": "unit-crisis-sunforge-battlesuits-wargear-ability-bc6aabc321",
            "title": "Shield Drone",
            "text": "Add 1 to the bearer’s Wounds characteristic.",
            "sourceUnitId": "unit-crisis-sunforge-battlesuits",
            "legacyIds": [
              "unit-crisis-sunforge-battlesuits-wargear-ability-shield-drone-2"
            ],
            "requiredSelectionIds": [
              "unit-crisis-sunforge-battlesuits-selection-shield-drone"
            ]
          },
          {
            "id": "unit-crisis-sunforge-battlesuits-wargear-ability-24a672615e",
            "sectionId": "unit-crisis-sunforge-battlesuits-wargear-ability-24a672615e",
            "title": "Guardian Drone",
            "text": "Each time a model makes a ranged attack that targets the bearer’s unit, subtract 1 from the Wound roll.",
            "sourceUnitId": "unit-crisis-sunforge-battlesuits",
            "legacyIds": [
              "unit-crisis-sunforge-battlesuits-wargear-ability-guardian-drone-3"
            ],
            "requiredSelectionIds": [
              "unit-crisis-sunforge-battlesuits-selection-guardian-drone"
            ]
          }
        ],
        "wargearDefaults": [
          {
            "modelId": "unit-crisis-sunforge-battlesuits-model-90f7a72c26",
            "selections": [
              {
                "selectionId": "unit-crisis-sunforge-battlesuits-selection-fusion-blaster",
                "quantity": 2
              },
              {
                "selectionId": "unit-crisis-sunforge-battlesuits-selection-battlesuit-fists",
                "quantity": 1
              }
            ]
          },
          {
            "modelId": "unit-crisis-sunforge-battlesuits-model-23c0c86995",
            "selections": [
              {
                "selectionId": "unit-crisis-sunforge-battlesuits-selection-fusion-blaster",
                "quantity": 2
              },
              {
                "selectionId": "unit-crisis-sunforge-battlesuits-selection-battlesuit-fists",
                "quantity": 1
              }
            ]
          }
        ],
        "wargearOptionContracts": [
          {
            "sourceId": "datasheet-crisis-sunforge-battlesuits:wargear:1",
            "eligibleModelIds": [
              "unit-crisis-sunforge-battlesuits-model-90f7a72c26",
              "unit-crisis-sunforge-battlesuits-model-23c0c86995"
            ],
            "limit": {
              "perModel": 2
            },
            "choices": [
              {
                "remove": [],
                "add": [
                  {
                    "selectionId": "unit-crisis-sunforge-battlesuits-selection-twin-pulse-carbine",
                    "quantity": 1
                  }
                ],
                "requiresFinal": [],
                "forbidsFinal": [],
                "sharedUses": [
                  "datasheet-crisis-sunforge-battlesuits:wargear:1:choice:1"
                ]
              },
              {
                "remove": [],
                "add": [
                  {
                    "selectionId": "unit-crisis-sunforge-battlesuits-selection-marker-drone",
                    "quantity": 1
                  }
                ],
                "requiresFinal": [],
                "forbidsFinal": [],
                "sharedUses": [
                  "datasheet-crisis-sunforge-battlesuits:wargear:1:choice:2"
                ]
              },
              {
                "remove": [],
                "add": [
                  {
                    "selectionId": "unit-crisis-sunforge-battlesuits-selection-shield-drone",
                    "quantity": 1
                  }
                ],
                "requiresFinal": [],
                "forbidsFinal": [],
                "sharedUses": [
                  "datasheet-crisis-sunforge-battlesuits:wargear:1:choice:3"
                ]
              }
            ]
          }
        ],
        "wargearSharedCaps": [
          {
            "id": "datasheet-crisis-sunforge-battlesuits:wargear:1:choice:1",
            "max": 1,
            "scope": "model"
          },
          {
            "id": "datasheet-crisis-sunforge-battlesuits:wargear:1:choice:2",
            "max": 1,
            "scope": "model"
          },
          {
            "id": "datasheet-crisis-sunforge-battlesuits:wargear:1:choice:3",
            "max": 1,
            "scope": "model"
          }
        ]
      }
    },
    {
      "id": "unit-ghostkeel-battlesuit",
      "title": "Ghostkeel Battlesuit",
      "sourceBookId": "tau-empire",
      "sourceLayer": "codex",
      "intrinsicKeywords": [
        "Vehicle",
        "Walker",
        "Fly",
        "Smoke",
        "Battlesuit",
        "Ghostkeel",
        "T'au Empire"
      ],
      "relations": {
        "canLead": [],
        "canSupport": [],
        "canBeLedBy": [],
        "canBeSupportedBy": []
      },
      "ruleFacts": {
        "relations": {
          "canLead": [],
          "canSupport": [],
          "canBeLedBy": [],
          "canBeSupportedBy": []
        }
      },
      "gameSelections": {
        "stats": {
          "M": "10\"",
          "T": "8",
          "Sv": "2+",
          "W": "12",
          "Ld": "7+",
          "OC": "3",
          "Invulnerable": ""
        },
        "statProfiles": [],
        "abilities": [
          {
            "id": "tau-empire-ability-stealth-drones",
            "sectionId": "tau-empire-ability-stealth-drones",
            "title": "Stealth Drones",
            "text": "Twice per battle, after an attack has been allocated to this model, you can change the Damage characteristic of that attack to 0.\nDesigner’s Note: Place two Stealth Drone tokens next to the unit, removing one each time this ability has been used.",
            "sourceUnitId": "unit-ghostkeel-battlesuit"
          },
          {
            "id": "tau-empire-ability-damaged-1-4-wounds-remaining",
            "sectionId": "tau-empire-ability-damaged-1-4-wounds-remaining",
            "title": "Damaged: 1-4 WOUNDS REMAINING",
            "text": "While this model has 1-4 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll.",
            "sourceUnitId": "unit-ghostkeel-battlesuit"
          },
          {
            "id": "core-deadly-demise",
            "sectionId": "core-deadly-demise",
            "title": "Deadly Demise D3",
            "text": "This ability always takes the form Deadly Demise X. Each time a model in this unit is destroyed, after the units embarked within it (if any) have made their emergency disembark moves, roll one D6. On a 6, that model suffers a deadly demise; each unit within 6\" of that model suffers a number of mortal wounds denoted by X (if this is a random number, roll separately for each unit within 6\"). \n *Example: An Impulsor with a unit of Intercessors embarked within it is destroyed by ranged attacks. First, any unresolved attacks made by the attacking unit are resolved. Then the Intercessors make an emergency disembark move. Then the roll is made for the Deadly Demise ability, and on a 6, that ability is resolved. Finally, the Impulsor is removed from the battlefield.*",
            "sourceUnitId": "unit-ghostkeel-battlesuit"
          },
          {
            "id": "core-infiltrators",
            "sectionId": "core-infiltrators",
            "title": "Infiltrators",
            "text": "During deployment, if every model in a unit has this ability, it can be set up anywhere on the battlefield that is more than 8\" horizontally from your opponent’s deployment zone and all enemy units.",
            "sourceUnitId": "unit-ghostkeel-battlesuit"
          },
          {
            "id": "core-lone-operative",
            "sectionId": "core-lone-operative",
            "title": "Lone Operative",
            "text": "Unless part of an attached unit, this unit is not visible to enemy models unless they are within 12\" of this unit, and it cannot be targeted by [INDIRECT FIRE] weapons unless the attacking model is within 12\" of this unit. \nIf this ability takes the form Lone Operative X\", unless part of an attached unit, this unit is not visible to enemy models unless they are within X\" of this unit, and it cannot be targeted by [INDIRECT FIRE] weapons unless the attacking model is within X\" of this unit.",
            "sourceUnitId": "unit-ghostkeel-battlesuit"
          },
          {
            "id": "core-stealth",
            "sectionId": "core-stealth",
            "title": "Stealth",
            "text": "If every model in a unit has this ability, each time a ranged attack targets that unit, that unit has the benefit of cover against that attack (13.08).",
            "sourceUnitId": "unit-ghostkeel-battlesuit"
          },
          {
            "id": "tau-empire-ability-for-the-greater-good",
            "sectionId": "tau-empire-ability-for-the-greater-good",
            "title": "For The Greater Good",
            "text": "If your Army Faction is T’AU EMPIRE, at the start of your Shooting phase you can select units from your army with this ability to become Observer units.\n\nDuring your Shooting phase, for each Observer unit from your army that has not been selected to shoot this phase and is eligible to shoot (excluding FORTIFICATION and Battle-shocked units) select one enemy unit that is visible to be marked as their Spotted unit until the end of the phase. Each enemy unit can only be marked as a Spotted unit once per phase.\n\nUnits from your army with the For the Greater Good ability (excluding Observer units) are Guided units while targeting one or more Spotted units.\n\nUntil the end of the phase, each time a model from your army in a Guided unit makes an attack that targets a Spotted unit, improve the Ballistic Skill characteristic of that attack by 1 and, if the Spotted unit was marked by an Observer unit that has the Markerlight keyword, that attack has the [IGNORES COVER] ability.",
            "sourceUnitId": "unit-ghostkeel-battlesuit"
          }
        ],
        "models": [
          {
            "id": "unit-ghostkeel-battlesuit-model-4ef7f11eef",
            "title": "Ghostkeel Battlesuit",
            "aliases": [
              "Ghostkeel Battlesuit"
            ],
            "min": 1,
            "max": 1,
            "legacyIds": [
              "unit-ghostkeel-battlesuit-model-ghostkeel-battlesuit"
            ]
          }
        ],
        "compositionRules": [],
        "selections": [
          {
            "id": "unit-ghostkeel-battlesuit-selection-ghostkeel-fists",
            "title": "Ghostkeel fists",
            "aliases": [
              "Ghostkeel fists"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-ghostkeel-battlesuit-profile-7fa109b3c9"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-ghostkeel-battlesuit-selection-twin-burst-cannon",
            "title": "Twin burst cannon",
            "aliases": [
              "Twin burst cannon"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-ghostkeel-battlesuit-profile-1e6082747c"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-ghostkeel-battlesuit-selection-twin-tau-flamer",
            "title": "Twin T'au flamer",
            "aliases": [
              "Twin T'au flamer"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-ghostkeel-battlesuit-profile-208f5b8c90"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-ghostkeel-battlesuit-selection-twin-fusion-blaster",
            "title": "Twin fusion blaster",
            "aliases": [
              "Twin fusion blaster"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-ghostkeel-battlesuit-profile-7bc91a126d"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-ghostkeel-battlesuit-selection-fusion-collider",
            "title": "Fusion collider",
            "aliases": [
              "Fusion collider"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-ghostkeel-battlesuit-profile-e159a50795"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-ghostkeel-battlesuit-selection-cyclic-ion-raker-standard",
            "title": "➤ Cyclic ion raker - standard",
            "aliases": [
              "➤ Cyclic ion raker - standard"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-ghostkeel-battlesuit-profile-a6ac1da3a6"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-ghostkeel-battlesuit-selection-cyclic-ion-raker-overcharge",
            "title": "➤ Cyclic ion raker - overcharge",
            "aliases": [
              "➤ Cyclic ion raker - overcharge"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-ghostkeel-battlesuit-profile-edb7f7ee45"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-ghostkeel-battlesuit-weapon-family-cyclic-ion-raker-selection",
            "title": "➤ Cyclic ion raker",
            "aliases": [
              "➤ Cyclic ion raker"
            ],
            "kind": "weapon",
            "familyId": "unit-ghostkeel-battlesuit-weapon-family-cyclic-ion-raker",
            "profileIds": [
              "unit-ghostkeel-battlesuit-profile-a6ac1da3a6",
              "unit-ghostkeel-battlesuit-profile-edb7f7ee45"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-ghostkeel-battlesuit-selection-battlesuit-support-system",
            "title": "Battlesuit Support System",
            "aliases": [
              "Battlesuit Support System"
            ],
            "kind": "wargear",
            "profileIds": [],
            "wargearAbilityIds": [
              "unit-ghostkeel-battlesuit-wargear-ability-956b6fd913"
            ]
          }
        ],
        "weaponFamilies": [
          {
            "id": "unit-ghostkeel-battlesuit-weapon-family-cyclic-ion-raker",
            "title": "➤ Cyclic ion raker",
            "aliases": [
              "➤ Cyclic ion raker"
            ],
            "profileIds": [
              "unit-ghostkeel-battlesuit-profile-a6ac1da3a6",
              "unit-ghostkeel-battlesuit-profile-edb7f7ee45"
            ],
            "ambiguousAlias": false
          }
        ],
        "weaponProfiles": [
          {
            "id": "unit-ghostkeel-battlesuit-profile-7fa109b3c9",
            "legacyIds": [
              "unit-ghostkeel-battlesuit-profile-ghostkeel-fists-melee"
            ],
            "title": "Ghostkeel fists",
            "mode": "melee",
            "range": "Melee",
            "a": "3",
            "skill": "5+",
            "s": "6",
            "ap": "0",
            "d": "2",
            "abilities": "",
            "sourceSelectionIds": [
              "unit-ghostkeel-battlesuit-selection-ghostkeel-fists"
            ]
          },
          {
            "id": "unit-ghostkeel-battlesuit-profile-1e6082747c",
            "legacyIds": [
              "unit-ghostkeel-battlesuit-profile-twin-burst-cannon-ranged-2"
            ],
            "title": "Twin burst cannon",
            "mode": "ranged",
            "range": "18\"",
            "a": "4",
            "skill": "4+",
            "s": "5",
            "ap": "0",
            "d": "1",
            "abilities": "Twin-linked",
            "sourceSelectionIds": [
              "unit-ghostkeel-battlesuit-selection-twin-burst-cannon"
            ]
          },
          {
            "id": "unit-ghostkeel-battlesuit-profile-208f5b8c90",
            "legacyIds": [
              "unit-ghostkeel-battlesuit-profile-twin-tau-flamer-ranged-3"
            ],
            "title": "Twin T'au flamer",
            "mode": "ranged",
            "range": "12\"",
            "a": "D6",
            "skill": "N/A",
            "s": "4",
            "ap": "0",
            "d": "1",
            "abilities": "Ignores Cover, Torrent, Twin-linked",
            "sourceSelectionIds": [
              "unit-ghostkeel-battlesuit-selection-twin-tau-flamer"
            ]
          },
          {
            "id": "unit-ghostkeel-battlesuit-profile-7bc91a126d",
            "legacyIds": [
              "unit-ghostkeel-battlesuit-profile-twin-fusion-blaster-ranged-4"
            ],
            "title": "Twin fusion blaster",
            "mode": "ranged",
            "range": "12\"",
            "a": "1",
            "skill": "4+",
            "s": "9",
            "ap": "-4",
            "d": "D6",
            "abilities": "Melta 2, Twin-linked",
            "sourceSelectionIds": [
              "unit-ghostkeel-battlesuit-selection-twin-fusion-blaster"
            ]
          },
          {
            "id": "unit-ghostkeel-battlesuit-profile-e159a50795",
            "legacyIds": [
              "unit-ghostkeel-battlesuit-profile-fusion-collider-ranged-5"
            ],
            "title": "Fusion collider",
            "mode": "ranged",
            "range": "18\"",
            "a": "2",
            "skill": "4+",
            "s": "12",
            "ap": "-4",
            "d": "D6",
            "abilities": "Melta 2",
            "sourceSelectionIds": [
              "unit-ghostkeel-battlesuit-selection-fusion-collider"
            ]
          },
          {
            "id": "unit-ghostkeel-battlesuit-profile-a6ac1da3a6",
            "legacyIds": [
              "unit-ghostkeel-battlesuit-profile-cyclic-ion-raker-standard-ranged-6"
            ],
            "title": "➤ Cyclic ion raker - standard",
            "mode": "ranged",
            "range": "36\"",
            "a": "6",
            "skill": "4+",
            "s": "7",
            "ap": "-1",
            "d": "2",
            "abilities": "",
            "sourceSelectionIds": [
              "unit-ghostkeel-battlesuit-selection-cyclic-ion-raker-standard",
              "unit-ghostkeel-battlesuit-weapon-family-cyclic-ion-raker-selection"
            ]
          },
          {
            "id": "unit-ghostkeel-battlesuit-profile-edb7f7ee45",
            "legacyIds": [
              "unit-ghostkeel-battlesuit-profile-cyclic-ion-raker-overcharge-ranged-7"
            ],
            "title": "➤ Cyclic ion raker - overcharge",
            "mode": "ranged",
            "range": "36\"",
            "a": "6",
            "skill": "4+",
            "s": "8",
            "ap": "-2",
            "d": "3",
            "abilities": "Hazardous",
            "sourceSelectionIds": [
              "unit-ghostkeel-battlesuit-selection-cyclic-ion-raker-overcharge",
              "unit-ghostkeel-battlesuit-weapon-family-cyclic-ion-raker-selection"
            ]
          }
        ],
        "wargearAbilities": [
          {
            "id": "unit-ghostkeel-battlesuit-wargear-ability-956b6fd913",
            "sectionId": "unit-ghostkeel-battlesuit-wargear-ability-956b6fd913",
            "title": "Battlesuit Support System",
            "text": "The bearer is eligible to shoot in a turn in which it Fell Back but it loses the SMOKE keyword.",
            "sourceUnitId": "unit-ghostkeel-battlesuit",
            "legacyIds": [
              "unit-ghostkeel-battlesuit-wargear-ability-battlesuit-support-system"
            ],
            "requiredSelectionIds": [
              "unit-ghostkeel-battlesuit-selection-battlesuit-support-system"
            ]
          }
        ],
        "wargearDefaults": [
          {
            "modelId": "unit-ghostkeel-battlesuit-model-4ef7f11eef",
            "selections": [
              {
                "selectionId": "unit-ghostkeel-battlesuit-selection-fusion-collider",
                "quantity": 1
              },
              {
                "selectionId": "unit-ghostkeel-battlesuit-selection-twin-tau-flamer",
                "quantity": 1
              },
              {
                "selectionId": "unit-ghostkeel-battlesuit-selection-ghostkeel-fists",
                "quantity": 1
              }
            ]
          }
        ],
        "wargearOptionContracts": [
          {
            "sourceId": "datasheet-ghostkeel-battlesuit:wargear:1",
            "eligibleModelIds": [
              "unit-ghostkeel-battlesuit-model-4ef7f11eef"
            ],
            "limit": {
              "perModel": 1
            },
            "choices": [
              {
                "remove": [
                  {
                    "selectionId": "unit-ghostkeel-battlesuit-selection-fusion-collider",
                    "quantity": 1
                  }
                ],
                "add": [
                  {
                    "selectionId": "unit-ghostkeel-battlesuit-weapon-family-cyclic-ion-raker-selection",
                    "quantity": 1
                  }
                ],
                "requiresFinal": [],
                "forbidsFinal": [],
                "sharedUses": []
              }
            ]
          },
          {
            "sourceId": "datasheet-ghostkeel-battlesuit:wargear:2",
            "eligibleModelIds": [
              "unit-ghostkeel-battlesuit-model-4ef7f11eef"
            ],
            "limit": {
              "perModel": 1
            },
            "choices": [
              {
                "remove": [
                  {
                    "selectionId": "unit-ghostkeel-battlesuit-selection-twin-tau-flamer",
                    "quantity": 1
                  }
                ],
                "add": [
                  {
                    "selectionId": "unit-ghostkeel-battlesuit-selection-twin-fusion-blaster",
                    "quantity": 1
                  }
                ],
                "requiresFinal": [],
                "forbidsFinal": [],
                "sharedUses": []
              },
              {
                "remove": [
                  {
                    "selectionId": "unit-ghostkeel-battlesuit-selection-twin-tau-flamer",
                    "quantity": 1
                  }
                ],
                "add": [
                  {
                    "selectionId": "unit-ghostkeel-battlesuit-selection-twin-burst-cannon",
                    "quantity": 1
                  }
                ],
                "requiresFinal": [],
                "forbidsFinal": [],
                "sharedUses": []
              }
            ]
          },
          {
            "sourceId": "datasheet-ghostkeel-battlesuit:wargear:3",
            "eligibleModelIds": [
              "unit-ghostkeel-battlesuit-model-4ef7f11eef"
            ],
            "limit": {
              "perModel": 1
            },
            "choices": [
              {
                "remove": [],
                "add": [
                  {
                    "selectionId": "unit-ghostkeel-battlesuit-selection-battlesuit-support-system",
                    "quantity": 1
                  }
                ],
                "requiresFinal": [],
                "forbidsFinal": [],
                "sharedUses": []
              }
            ]
          }
        ],
        "wargearSharedCaps": []
      }
    },
    {
      "id": "unit-hammerhead-gunship",
      "title": "Hammerhead Gunship",
      "sourceBookId": "tau-empire",
      "sourceLayer": "codex",
      "intrinsicKeywords": [
        "Vehicle",
        "Fly",
        "Frame",
        "Hammerhead Gunship",
        "T'au Empire"
      ],
      "relations": {
        "canLead": [],
        "canSupport": [],
        "canBeLedBy": [],
        "canBeSupportedBy": []
      },
      "ruleFacts": {
        "relations": {
          "canLead": [],
          "canSupport": [],
          "canBeLedBy": [],
          "canBeSupportedBy": []
        }
      },
      "gameSelections": {
        "stats": {
          "M": "10\"",
          "T": "10",
          "Sv": "3+",
          "W": "14",
          "Ld": "7+",
          "OC": "3",
          "Invulnerable": ""
        },
        "statProfiles": [],
        "abilities": [
          {
            "id": "tau-empire-ability-armour-hunter",
            "sectionId": "tau-empire-ability-armour-hunter",
            "title": "Armour Hunter",
            "text": "Each time this model makes an attack that targets a MONSTER or VEHICLE, add 1 to the Hit roll.",
            "sourceUnitId": "unit-hammerhead-gunship"
          },
          {
            "id": "tau-empire-ability-damaged-1-5-wounds-remaining",
            "sectionId": "tau-empire-ability-damaged-1-5-wounds-remaining",
            "title": "Damaged: 1-5 WOUNDS REMAINING",
            "text": "While this model has 1-5 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll.",
            "sourceUnitId": "unit-hammerhead-gunship"
          },
          {
            "id": "tau-empire-ability-targeting-array",
            "sectionId": "tau-empire-ability-targeting-array",
            "title": "Targeting Array",
            "text": "Each time this model is selected to shoot, you can re-roll one Hit roll or you can re-roll one Wound roll when resolving those attacks.",
            "sourceUnitId": "unit-hammerhead-gunship"
          },
          {
            "id": "core-deadly-demise",
            "sectionId": "core-deadly-demise",
            "title": "Deadly Demise D3",
            "text": "This ability always takes the form Deadly Demise X. Each time a model in this unit is destroyed, after the units embarked within it (if any) have made their emergency disembark moves, roll one D6. On a 6, that model suffers a deadly demise; each unit within 6\" of that model suffers a number of mortal wounds denoted by X (if this is a random number, roll separately for each unit within 6\"). \n *Example: An Impulsor with a unit of Intercessors embarked within it is destroyed by ranged attacks. First, any unresolved attacks made by the attacking unit are resolved. Then the Intercessors make an emergency disembark move. Then the roll is made for the Deadly Demise ability, and on a 6, that ability is resolved. Finally, the Impulsor is removed from the battlefield.*",
            "sourceUnitId": "unit-hammerhead-gunship"
          },
          {
            "id": "tau-empire-ability-for-the-greater-good",
            "sectionId": "tau-empire-ability-for-the-greater-good",
            "title": "For The Greater Good",
            "text": "If your Army Faction is T’AU EMPIRE, at the start of your Shooting phase you can select units from your army with this ability to become Observer units.\n\nDuring your Shooting phase, for each Observer unit from your army that has not been selected to shoot this phase and is eligible to shoot (excluding FORTIFICATION and Battle-shocked units) select one enemy unit that is visible to be marked as their Spotted unit until the end of the phase. Each enemy unit can only be marked as a Spotted unit once per phase.\n\nUnits from your army with the For the Greater Good ability (excluding Observer units) are Guided units while targeting one or more Spotted units.\n\nUntil the end of the phase, each time a model from your army in a Guided unit makes an attack that targets a Spotted unit, improve the Ballistic Skill characteristic of that attack by 1 and, if the Spotted unit was marked by an Observer unit that has the Markerlight keyword, that attack has the [IGNORES COVER] ability.",
            "sourceUnitId": "unit-hammerhead-gunship"
          }
        ],
        "models": [
          {
            "id": "unit-hammerhead-gunship-model-2ba81052be",
            "title": "Hammerhead Gunship",
            "aliases": [
              "Hammerhead Gunship"
            ],
            "min": 1,
            "max": 1,
            "legacyIds": [
              "unit-hammerhead-gunship-model-hammerhead-gunship"
            ]
          }
        ],
        "compositionRules": [],
        "selections": [
          {
            "id": "unit-hammerhead-gunship-selection-railgun",
            "title": "Railgun",
            "aliases": [
              "Railgun"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-hammerhead-gunship-profile-6668d65060"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-hammerhead-gunship-selection-ion-cannon-standard",
            "title": "➤ Ion cannon - standard",
            "aliases": [
              "➤ Ion cannon - standard"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-hammerhead-gunship-profile-9ee14c3bc6"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-hammerhead-gunship-selection-ion-cannon-overcharge",
            "title": "➤ Ion cannon - overcharge",
            "aliases": [
              "➤ Ion cannon - overcharge"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-hammerhead-gunship-profile-485490feb4"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-hammerhead-gunship-selection-seeker-missile",
            "title": "Seeker missile",
            "aliases": [
              "Seeker missile"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-hammerhead-gunship-profile-351bd7e3c7"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-hammerhead-gunship-selection-accelerator-burst-cannon",
            "title": "Accelerator burst cannon",
            "aliases": [
              "Accelerator burst cannon"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-hammerhead-gunship-profile-6fde1ef259"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-hammerhead-gunship-selection-twin-pulse-carbine",
            "title": "Twin pulse carbine",
            "aliases": [
              "Twin pulse carbine"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-hammerhead-gunship-profile-ffd068b0d6"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-hammerhead-gunship-selection-smart-missile-system",
            "title": "Smart missile system",
            "aliases": [
              "Smart missile system"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-hammerhead-gunship-profile-506187484b"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-hammerhead-gunship-selection-armoured-hull",
            "title": "Armoured hull",
            "aliases": [
              "Armoured hull"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-hammerhead-gunship-profile-3f6402479f"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-hammerhead-gunship-weapon-family-ion-cannon-selection",
            "title": "➤ Ion cannon",
            "aliases": [
              "➤ Ion cannon"
            ],
            "kind": "weapon",
            "familyId": "unit-hammerhead-gunship-weapon-family-ion-cannon",
            "profileIds": [
              "unit-hammerhead-gunship-profile-9ee14c3bc6",
              "unit-hammerhead-gunship-profile-485490feb4"
            ],
            "wargearAbilityIds": []
          }
        ],
        "weaponFamilies": [
          {
            "id": "unit-hammerhead-gunship-weapon-family-ion-cannon",
            "title": "➤ Ion cannon",
            "aliases": [
              "➤ Ion cannon"
            ],
            "profileIds": [
              "unit-hammerhead-gunship-profile-9ee14c3bc6",
              "unit-hammerhead-gunship-profile-485490feb4"
            ],
            "ambiguousAlias": false
          }
        ],
        "weaponProfiles": [
          {
            "id": "unit-hammerhead-gunship-profile-6668d65060",
            "legacyIds": [
              "unit-hammerhead-gunship-profile-railgun-ranged"
            ],
            "title": "Railgun",
            "mode": "ranged",
            "range": "72\"",
            "a": "1",
            "skill": "4+",
            "s": "20",
            "ap": "-5",
            "d": "D6+6",
            "abilities": "Heavy, Devastating Wounds",
            "sourceSelectionIds": [
              "unit-hammerhead-gunship-selection-railgun"
            ]
          },
          {
            "id": "unit-hammerhead-gunship-profile-9ee14c3bc6",
            "legacyIds": [
              "unit-hammerhead-gunship-profile-ion-cannon-standard-ranged-2"
            ],
            "title": "➤ Ion cannon - standard",
            "mode": "ranged",
            "range": "60\"",
            "a": "D6+3",
            "skill": "4+",
            "s": "7",
            "ap": "-1",
            "d": "2",
            "abilities": "Blast",
            "sourceSelectionIds": [
              "unit-hammerhead-gunship-selection-ion-cannon-standard",
              "unit-hammerhead-gunship-weapon-family-ion-cannon-selection"
            ]
          },
          {
            "id": "unit-hammerhead-gunship-profile-485490feb4",
            "legacyIds": [
              "unit-hammerhead-gunship-profile-ion-cannon-overcharge-ranged-3"
            ],
            "title": "➤ Ion cannon - overcharge",
            "mode": "ranged",
            "range": "60\"",
            "a": "D6+3",
            "skill": "4+",
            "s": "8",
            "ap": "-2",
            "d": "3",
            "abilities": "Blast, Hazardous",
            "sourceSelectionIds": [
              "unit-hammerhead-gunship-selection-ion-cannon-overcharge",
              "unit-hammerhead-gunship-weapon-family-ion-cannon-selection"
            ]
          },
          {
            "id": "unit-hammerhead-gunship-profile-351bd7e3c7",
            "legacyIds": [
              "unit-hammerhead-gunship-profile-seeker-missile-ranged-4"
            ],
            "title": "Seeker missile",
            "mode": "ranged",
            "range": "48\"",
            "a": "1",
            "skill": "4+",
            "s": "14",
            "ap": "-3",
            "d": "D6+1",
            "abilities": "One Shot",
            "sourceSelectionIds": [
              "unit-hammerhead-gunship-selection-seeker-missile"
            ]
          },
          {
            "id": "unit-hammerhead-gunship-profile-6fde1ef259",
            "legacyIds": [
              "unit-hammerhead-gunship-profile-accelerator-burst-cannon-ranged-5"
            ],
            "title": "Accelerator burst cannon",
            "mode": "ranged",
            "range": "18\"",
            "a": "4",
            "skill": "4+",
            "s": "6",
            "ap": "-1",
            "d": "1",
            "abilities": "",
            "sourceSelectionIds": [
              "unit-hammerhead-gunship-selection-accelerator-burst-cannon"
            ]
          },
          {
            "id": "unit-hammerhead-gunship-profile-ffd068b0d6",
            "legacyIds": [
              "unit-hammerhead-gunship-profile-twin-pulse-carbine-ranged-6"
            ],
            "title": "Twin pulse carbine",
            "mode": "ranged",
            "range": "20\"",
            "a": "2",
            "skill": "4+",
            "s": "5",
            "ap": "0",
            "d": "1",
            "abilities": "Twin-linked",
            "sourceSelectionIds": [
              "unit-hammerhead-gunship-selection-twin-pulse-carbine"
            ]
          },
          {
            "id": "unit-hammerhead-gunship-profile-506187484b",
            "legacyIds": [
              "unit-hammerhead-gunship-profile-smart-missile-system-ranged-7"
            ],
            "title": "Smart missile system",
            "mode": "ranged",
            "range": "30\"",
            "a": "3",
            "skill": "4+",
            "s": "5",
            "ap": "0",
            "d": "1",
            "abilities": "Indirect Fire",
            "sourceSelectionIds": [
              "unit-hammerhead-gunship-selection-smart-missile-system"
            ]
          },
          {
            "id": "unit-hammerhead-gunship-profile-3f6402479f",
            "legacyIds": [
              "unit-hammerhead-gunship-profile-armoured-hull-melee-8"
            ],
            "title": "Armoured hull",
            "mode": "melee",
            "range": "Melee",
            "a": "3",
            "skill": "5+",
            "s": "6",
            "ap": "0",
            "d": "1",
            "abilities": "",
            "sourceSelectionIds": [
              "unit-hammerhead-gunship-selection-armoured-hull"
            ]
          }
        ],
        "wargearAbilities": [],
        "wargearDefaults": [
          {
            "modelId": "unit-hammerhead-gunship-model-2ba81052be",
            "selections": [
              {
                "selectionId": "unit-hammerhead-gunship-selection-railgun",
                "quantity": 1
              },
              {
                "selectionId": "unit-hammerhead-gunship-selection-twin-pulse-carbine",
                "quantity": 2
              },
              {
                "selectionId": "unit-hammerhead-gunship-selection-armoured-hull",
                "quantity": 1
              }
            ]
          }
        ],
        "wargearOptionContracts": [
          {
            "sourceId": "datasheet-hammerhead-gunship:wargear:1",
            "eligibleModelIds": [
              "unit-hammerhead-gunship-model-2ba81052be"
            ],
            "limit": {
              "perModel": 1
            },
            "choices": [
              {
                "remove": [
                  {
                    "selectionId": "unit-hammerhead-gunship-selection-railgun",
                    "quantity": 1
                  }
                ],
                "add": [
                  {
                    "selectionId": "unit-hammerhead-gunship-weapon-family-ion-cannon-selection",
                    "quantity": 1
                  }
                ],
                "requiresFinal": [],
                "forbidsFinal": [],
                "sharedUses": []
              }
            ]
          },
          {
            "sourceId": "datasheet-hammerhead-gunship:wargear:2",
            "eligibleModelIds": [
              "unit-hammerhead-gunship-model-2ba81052be"
            ],
            "limit": {
              "perModel": 1
            },
            "choices": [
              {
                "remove": [
                  {
                    "selectionId": "unit-hammerhead-gunship-selection-twin-pulse-carbine",
                    "quantity": 2
                  }
                ],
                "add": [
                  {
                    "selectionId": "unit-hammerhead-gunship-selection-accelerator-burst-cannon",
                    "quantity": 2
                  }
                ],
                "requiresFinal": [],
                "forbidsFinal": [],
                "sharedUses": []
              },
              {
                "remove": [
                  {
                    "selectionId": "unit-hammerhead-gunship-selection-twin-pulse-carbine",
                    "quantity": 2
                  }
                ],
                "add": [
                  {
                    "selectionId": "unit-hammerhead-gunship-selection-smart-missile-system",
                    "quantity": 2
                  }
                ],
                "requiresFinal": [],
                "forbidsFinal": [],
                "sharedUses": []
              }
            ]
          },
          {
            "sourceId": "datasheet-hammerhead-gunship:wargear:3",
            "eligibleModelIds": [
              "unit-hammerhead-gunship-model-2ba81052be"
            ],
            "limit": {
              "perModel": 2
            },
            "choices": [
              {
                "remove": [],
                "add": [
                  {
                    "selectionId": "unit-hammerhead-gunship-selection-seeker-missile",
                    "quantity": 1
                  }
                ],
                "requiresFinal": [],
                "forbidsFinal": [],
                "sharedUses": []
              }
            ]
          }
        ],
        "wargearSharedCaps": []
      }
    },
    {
      "id": "unit-kroot-hounds",
      "title": "Kroot Hounds",
      "sourceBookId": "tau-empire",
      "sourceLayer": "codex",
      "intrinsicKeywords": [
        "Beasts",
        "Kroot",
        "Hounds",
        "T'au Empire"
      ],
      "relations": {
        "canLead": [],
        "canSupport": [],
        "canBeLedBy": [],
        "canBeSupportedBy": []
      },
      "ruleFacts": {
        "relations": {
          "canLead": [],
          "canSupport": [],
          "canBeLedBy": [],
          "canBeSupportedBy": []
        }
      },
      "gameSelections": {
        "stats": {
          "M": "12\"",
          "T": "3",
          "Sv": "6+",
          "W": "1",
          "Ld": "8+",
          "OC": "0",
          "Invulnerable": ""
        },
        "statProfiles": [],
        "abilities": [
          {
            "id": "tau-empire-ability-loping-pounce",
            "sectionId": "tau-empire-ability-loping-pounce",
            "title": "Loping Pounce",
            "text": "At the start of your Command phase, if this unit is within 6\" of one or more friendly KROOT INFANTRY units, then until the end of the turn, this unit is eligible to declare a charge in a turn in which it Advanced.",
            "sourceUnitId": "unit-kroot-hounds"
          },
          {
            "id": "tau-empire-ability-hunting-hounds",
            "sectionId": "tau-empire-ability-hunting-hounds",
            "title": "Hunting Hounds",
            "text": "While this unit is within 12\" of one or more friendly KROOT CHARACTER models, the Objective Control characteristic of models in this unit is 1.",
            "sourceUnitId": "unit-kroot-hounds"
          },
          {
            "id": "core-scouts",
            "sectionId": "core-scouts",
            "title": "Scouts 7\"",
            "text": "This ability always takes the form Scouts X\". In the Resolve Pre-battle Abilities step, if every model in a unit has this ability, you can do one of the following: \n- If that unit is in strategic reserves, you can set up that unit anywhere that is wholly within your deployment zone. \n- If that unit is wholly within your deployment zone, it can make a scout move. \n- If that unit is embarked within a DEDICATED TRANSPORT that is wholly within your deployment zone, and if every model embarked within that DEDICATED TRANSPORT has the Scouts ability, that DEDICATED TRANSPORT can make a scout move.",
            "sourceUnitId": "unit-kroot-hounds"
          },
          {
            "id": "core-stealth",
            "sectionId": "core-stealth",
            "title": "Stealth",
            "text": "If every model in a unit has this ability, each time a ranged attack targets that unit, that unit has the benefit of cover against that attack (13.08).",
            "sourceUnitId": "unit-kroot-hounds"
          }
        ],
        "models": [
          {
            "id": "unit-kroot-hounds-model-796ce1192c",
            "title": "5-10 Kroot Hounds",
            "aliases": [
              "5-10 Kroot Hounds",
              "Kroot Hounds"
            ],
            "min": 5,
            "max": 10,
            "legacyIds": [
              "unit-kroot-hounds-model-5-10-kroot-hounds"
            ]
          }
        ],
        "compositionRules": [],
        "selections": [
          {
            "id": "unit-kroot-hounds-selection-ripping-fangs",
            "title": "Ripping fangs",
            "aliases": [
              "Ripping fangs"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-kroot-hounds-profile-288af2d7e0"
            ],
            "wargearAbilityIds": []
          }
        ],
        "weaponFamilies": [],
        "weaponProfiles": [
          {
            "id": "unit-kroot-hounds-profile-288af2d7e0",
            "legacyIds": [
              "unit-kroot-hounds-profile-ripping-fangs-melee"
            ],
            "title": "Ripping fangs",
            "mode": "melee",
            "range": "Melee",
            "a": "3",
            "skill": "3+",
            "s": "3",
            "ap": "0",
            "d": "1",
            "abilities": "",
            "sourceSelectionIds": [
              "unit-kroot-hounds-selection-ripping-fangs"
            ]
          }
        ],
        "wargearAbilities": [],
        "wargearDefaults": [],
        "wargearOptionContracts": [],
        "wargearSharedCaps": []
      }
    },
    {
      "id": "unit-krootox-rampagers",
      "title": "Krootox Rampagers",
      "sourceBookId": "tau-empire",
      "sourceLayer": "codex",
      "intrinsicKeywords": [
        "Mounted",
        "Grenades",
        "Kroot",
        "Krootox Rampagers",
        "T'au Empire"
      ],
      "relations": {
        "canLead": [],
        "canSupport": [],
        "canBeLedBy": [],
        "canBeSupportedBy": []
      },
      "ruleFacts": {
        "relations": {
          "canLead": [],
          "canSupport": [],
          "canBeLedBy": [],
          "canBeSupportedBy": []
        }
      },
      "gameSelections": {
        "stats": {
          "M": "7\"",
          "T": "6",
          "Sv": "5+",
          "W": "5",
          "Ld": "7+",
          "OC": "2",
          "Invulnerable": ""
        },
        "statProfiles": [],
        "abilities": [
          {
            "id": "tau-empire-ability-kroot-linebreakers",
            "sectionId": "tau-empire-ability-kroot-linebreakers",
            "title": "Kroot Linebreakers",
            "text": "Each time this unit ends a Charge move, select one enemy unit within Engagement Range of it, then roll one D6 for each model in this unit that is within Engagement Range of that enemy unit: for each 4+, that enemy unit suffers D3 mortal wounds. If one or more enemy models are destroyed as a result of these mortal wounds, that enemy unit must take a Battle-shock test.",
            "sourceUnitId": "unit-krootox-rampagers"
          },
          {
            "id": "core-scouts",
            "sectionId": "core-scouts",
            "title": "Scouts 7\"",
            "text": "This ability always takes the form Scouts X\". In the Resolve Pre-battle Abilities step, if every model in a unit has this ability, you can do one of the following: \n- If that unit is in strategic reserves, you can set up that unit anywhere that is wholly within your deployment zone. \n- If that unit is wholly within your deployment zone, it can make a scout move. \n- If that unit is embarked within a DEDICATED TRANSPORT that is wholly within your deployment zone, and if every model embarked within that DEDICATED TRANSPORT has the Scouts ability, that DEDICATED TRANSPORT can make a scout move.",
            "sourceUnitId": "unit-krootox-rampagers"
          }
        ],
        "models": [
          {
            "id": "unit-krootox-rampagers-model-31c937ff7c",
            "title": "Krootox Rampagers",
            "aliases": [
              "Krootox Rampagers"
            ],
            "min": 3,
            "max": 6,
            "legacyIds": [
              "unit-krootox-rampagers-model-krootox-rampagers"
            ]
          }
        ],
        "compositionRules": [],
        "selections": [
          {
            "id": "unit-krootox-rampagers-selection-close-combat-weapon",
            "title": "Close combat weapon",
            "aliases": [
              "Close combat weapon"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-krootox-rampagers-profile-8f3dc48155"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-krootox-rampagers-selection-kroot-pistol-and-hunting-javelins",
            "title": "Kroot pistol and hunting javelins",
            "aliases": [
              "Kroot pistol and hunting javelins"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-krootox-rampagers-profile-31e21b6bf7"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-krootox-rampagers-selection-krootox-fists",
            "title": "Krootox fists",
            "aliases": [
              "Krootox fists"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-krootox-rampagers-profile-3d37622c9d"
            ],
            "wargearAbilityIds": []
          }
        ],
        "weaponFamilies": [],
        "weaponProfiles": [
          {
            "id": "unit-krootox-rampagers-profile-8f3dc48155",
            "legacyIds": [
              "unit-krootox-rampagers-profile-close-combat-weapon-melee"
            ],
            "title": "Close combat weapon",
            "mode": "melee",
            "range": "Melee",
            "a": "3",
            "skill": "3+",
            "s": "4",
            "ap": "-1",
            "d": "1",
            "abilities": "Lance",
            "sourceSelectionIds": [
              "unit-krootox-rampagers-selection-close-combat-weapon"
            ]
          },
          {
            "id": "unit-krootox-rampagers-profile-31e21b6bf7",
            "legacyIds": [
              "unit-krootox-rampagers-profile-kroot-pistol-and-hunting-javelins-ranged-2"
            ],
            "title": "Kroot pistol and hunting javelins",
            "mode": "ranged",
            "range": "12\"",
            "a": "2",
            "skill": "4+",
            "s": "4",
            "ap": "0",
            "d": "1",
            "abilities": "Assault, Pistol",
            "sourceSelectionIds": [
              "unit-krootox-rampagers-selection-kroot-pistol-and-hunting-javelins"
            ]
          },
          {
            "id": "unit-krootox-rampagers-profile-3d37622c9d",
            "legacyIds": [
              "unit-krootox-rampagers-profile-krootox-fists-melee-3"
            ],
            "title": "Krootox fists",
            "mode": "melee",
            "range": "Melee",
            "a": "4",
            "skill": "3+",
            "s": "6",
            "ap": "-1",
            "d": "2",
            "abilities": "Extra Attacks, Sustained Hits 1",
            "sourceSelectionIds": [
              "unit-krootox-rampagers-selection-krootox-fists"
            ]
          }
        ],
        "wargearAbilities": [],
        "wargearDefaults": [],
        "wargearOptionContracts": [],
        "wargearSharedCaps": []
      }
    },
    {
      "id": "unit-krootox-riders",
      "title": "Krootox Riders",
      "sourceBookId": "tau-empire",
      "sourceLayer": "codex",
      "intrinsicKeywords": [
        "Mounted",
        "Grenades",
        "Kroot",
        "Krootox Riders",
        "T'au Empire"
      ],
      "relations": {
        "canLead": [],
        "canSupport": [],
        "canBeLedBy": [],
        "canBeSupportedBy": []
      },
      "ruleFacts": {
        "relations": {
          "canLead": [],
          "canSupport": [],
          "canBeLedBy": [],
          "canBeSupportedBy": []
        }
      },
      "gameSelections": {
        "stats": {
          "M": "7\"",
          "T": "6",
          "Sv": "5+",
          "W": "5",
          "Ld": "7+",
          "OC": "2",
          "Invulnerable": ""
        },
        "statProfiles": [],
        "abilities": [
          {
            "id": "tau-empire-ability-kroot-packmates",
            "sectionId": "tau-empire-ability-kroot-packmates",
            "title": "Kroot Packmates",
            "text": "Once per turn, in your opponent’s Shooting phase, when a friendly KROOT INFANTRY unit within 6\" of this unit is selected as the target of an attack, one unit from your army with this ability can use it. If it does, after that enemy unit has finished making its attacks, that unit with this ability can shoot as if it were your Shooting phase, but when resolving those attacks it can only target that enemy unit (and only if it is an eligible target).",
            "sourceUnitId": "unit-krootox-riders"
          },
          {
            "id": "core-scouts",
            "sectionId": "core-scouts",
            "title": "Scouts 7\"",
            "text": "This ability always takes the form Scouts X\". In the Resolve Pre-battle Abilities step, if every model in a unit has this ability, you can do one of the following: \n- If that unit is in strategic reserves, you can set up that unit anywhere that is wholly within your deployment zone. \n- If that unit is wholly within your deployment zone, it can make a scout move. \n- If that unit is embarked within a DEDICATED TRANSPORT that is wholly within your deployment zone, and if every model embarked within that DEDICATED TRANSPORT has the Scouts ability, that DEDICATED TRANSPORT can make a scout move.",
            "sourceUnitId": "unit-krootox-riders"
          }
        ],
        "models": [
          {
            "id": "unit-krootox-riders-model-bf51317272",
            "title": "Krootox Riders",
            "aliases": [
              "Krootox Riders",
              "Krootox Rider w/ repeater cannon",
              "Krootox Rider w/ tanglecannon"
            ],
            "min": 1,
            "max": 3,
            "legacyIds": [
              "unit-krootox-riders-model-krootox-riders"
            ]
          }
        ],
        "compositionRules": [],
        "selections": [
          {
            "id": "unit-krootox-riders-selection-krootox-fists",
            "title": "Krootox fists",
            "aliases": [
              "Krootox fists"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-krootox-riders-profile-2248450b08"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-krootox-riders-selection-repeater-cannon",
            "title": "Repeater cannon",
            "aliases": [
              "Repeater cannon"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-krootox-riders-profile-cd20ba4c78"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-krootox-riders-selection-close-combat-weapon",
            "title": "Close combat weapon",
            "aliases": [
              "Close combat weapon"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-krootox-riders-profile-a24599bb66"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-krootox-riders-selection-tanglecannon",
            "title": "Tanglecannon",
            "aliases": [
              "Tanglecannon"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-krootox-riders-profile-f995850320"
            ],
            "wargearAbilityIds": []
          }
        ],
        "weaponFamilies": [],
        "weaponProfiles": [
          {
            "id": "unit-krootox-riders-profile-2248450b08",
            "legacyIds": [
              "unit-krootox-riders-profile-krootox-fists-melee"
            ],
            "title": "Krootox fists",
            "mode": "melee",
            "range": "Melee",
            "a": "4",
            "skill": "3+",
            "s": "6",
            "ap": "-1",
            "d": "2",
            "abilities": "Extra Attacks",
            "sourceSelectionIds": [
              "unit-krootox-riders-selection-krootox-fists"
            ]
          },
          {
            "id": "unit-krootox-riders-profile-cd20ba4c78",
            "legacyIds": [
              "unit-krootox-riders-profile-repeater-cannon-ranged-2"
            ],
            "title": "Repeater cannon",
            "mode": "ranged",
            "range": "36\"",
            "a": "2",
            "skill": "4+",
            "s": "7",
            "ap": "-1",
            "d": "2",
            "abilities": "Rapid Fire 2",
            "sourceSelectionIds": [
              "unit-krootox-riders-selection-repeater-cannon"
            ]
          },
          {
            "id": "unit-krootox-riders-profile-a24599bb66",
            "legacyIds": [
              "unit-krootox-riders-profile-close-combat-weapon-melee-3"
            ],
            "title": "Close combat weapon",
            "mode": "melee",
            "range": "Melee",
            "a": "2",
            "skill": "3+",
            "s": "4",
            "ap": "0",
            "d": "1",
            "abilities": "",
            "sourceSelectionIds": [
              "unit-krootox-riders-selection-close-combat-weapon"
            ]
          },
          {
            "id": "unit-krootox-riders-profile-f995850320",
            "legacyIds": [
              "unit-krootox-riders-profile-tanglecannon-ranged-4"
            ],
            "title": "Tanglecannon",
            "mode": "ranged",
            "range": "36\"",
            "a": "D6+1",
            "skill": "4+",
            "s": "6",
            "ap": "0",
            "d": "1",
            "abilities": "Blast, Heavy",
            "sourceSelectionIds": [
              "unit-krootox-riders-selection-tanglecannon"
            ]
          }
        ],
        "wargearAbilities": [],
        "wargearDefaults": [
          {
            "modelId": "unit-krootox-riders-model-bf51317272",
            "selections": [
              {
                "selectionId": "unit-krootox-riders-selection-repeater-cannon",
                "quantity": 1
              },
              {
                "selectionId": "unit-krootox-riders-selection-close-combat-weapon",
                "quantity": 1
              },
              {
                "selectionId": "unit-krootox-riders-selection-krootox-fists",
                "quantity": 1
              }
            ]
          }
        ],
        "wargearOptionContracts": [
          {
            "sourceId": "datasheet-krootox-riders:wargear:1",
            "eligibleModelIds": [
              "unit-krootox-riders-model-bf51317272"
            ],
            "limit": {
              "perModel": 1
            },
            "choices": [
              {
                "remove": [
                  {
                    "selectionId": "unit-krootox-riders-selection-repeater-cannon",
                    "quantity": 1
                  }
                ],
                "add": [
                  {
                    "selectionId": "unit-krootox-riders-selection-tanglecannon",
                    "quantity": 1
                  }
                ],
                "requiresFinal": [],
                "forbidsFinal": [],
                "sharedUses": []
              }
            ]
          }
        ],
        "wargearSharedCaps": []
      }
    },
    {
      "id": "unit-piranhas",
      "title": "Piranhas",
      "sourceBookId": "tau-empire",
      "sourceLayer": "codex",
      "intrinsicKeywords": [
        "Vehicle",
        "Fly",
        "Frame",
        "Piranhas",
        "T'au Empire"
      ],
      "relations": {
        "canLead": [],
        "canSupport": [],
        "canBeLedBy": [],
        "canBeSupportedBy": []
      },
      "ruleFacts": {
        "relations": {
          "canLead": [],
          "canSupport": [],
          "canBeLedBy": [],
          "canBeSupportedBy": []
        }
      },
      "gameSelections": {
        "stats": {
          "M": "14\"",
          "T": "7",
          "Sv": "4+",
          "W": "7",
          "Ld": "7+",
          "OC": "2",
          "Invulnerable": ""
        },
        "statProfiles": [],
        "abilities": [
          {
            "id": "tau-empire-ability-drone-harassment-tactics",
            "sectionId": "tau-empire-ability-drone-harassment-tactics",
            "title": "Drone Harassment Tactics",
            "text": "At the end of your Movement phase, select one enemy unit within 12\" of this unit; that enemy unit must take a Battle-shock test.",
            "sourceUnitId": "unit-piranhas"
          },
          {
            "id": "core-deadly-demise",
            "sectionId": "core-deadly-demise",
            "title": "Deadly Demise 1",
            "text": "This ability always takes the form Deadly Demise X. Each time a model in this unit is destroyed, after the units embarked within it (if any) have made their emergency disembark moves, roll one D6. On a 6, that model suffers a deadly demise; each unit within 6\" of that model suffers a number of mortal wounds denoted by X (if this is a random number, roll separately for each unit within 6\"). \n *Example: An Impulsor with a unit of Intercessors embarked within it is destroyed by ranged attacks. First, any unresolved attacks made by the attacking unit are resolved. Then the Intercessors make an emergency disembark move. Then the roll is made for the Deadly Demise ability, and on a 6, that ability is resolved. Finally, the Impulsor is removed from the battlefield.*",
            "sourceUnitId": "unit-piranhas"
          },
          {
            "id": "core-scouts",
            "sectionId": "core-scouts",
            "title": "Scouts 9\"",
            "text": "This ability always takes the form Scouts X\". In the Resolve Pre-battle Abilities step, if every model in a unit has this ability, you can do one of the following: \n- If that unit is in strategic reserves, you can set up that unit anywhere that is wholly within your deployment zone. \n- If that unit is wholly within your deployment zone, it can make a scout move. \n- If that unit is embarked within a DEDICATED TRANSPORT that is wholly within your deployment zone, and if every model embarked within that DEDICATED TRANSPORT has the Scouts ability, that DEDICATED TRANSPORT can make a scout move.",
            "sourceUnitId": "unit-piranhas"
          },
          {
            "id": "tau-empire-ability-for-the-greater-good",
            "sectionId": "tau-empire-ability-for-the-greater-good",
            "title": "For The Greater Good",
            "text": "If your Army Faction is T’AU EMPIRE, at the start of your Shooting phase you can select units from your army with this ability to become Observer units.\n\nDuring your Shooting phase, for each Observer unit from your army that has not been selected to shoot this phase and is eligible to shoot (excluding FORTIFICATION and Battle-shocked units) select one enemy unit that is visible to be marked as their Spotted unit until the end of the phase. Each enemy unit can only be marked as a Spotted unit once per phase.\n\nUnits from your army with the For the Greater Good ability (excluding Observer units) are Guided units while targeting one or more Spotted units.\n\nUntil the end of the phase, each time a model from your army in a Guided unit makes an attack that targets a Spotted unit, improve the Ballistic Skill characteristic of that attack by 1 and, if the Spotted unit was marked by an Observer unit that has the Markerlight keyword, that attack has the [IGNORES COVER] ability.",
            "sourceUnitId": "unit-piranhas"
          }
        ],
        "models": [
          {
            "id": "unit-piranhas-model-05f0890c53",
            "title": "Piranhas",
            "aliases": [
              "Piranhas"
            ],
            "min": 1,
            "max": 3,
            "legacyIds": [
              "unit-piranhas-model-piranhas"
            ]
          }
        ],
        "compositionRules": [],
        "selections": [
          {
            "id": "unit-piranhas-selection-piranha-burst-cannon",
            "title": "Piranha burst cannon",
            "aliases": [
              "Piranha burst cannon"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-piranhas-profile-0b869244e8"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-piranhas-selection-piranha-fusion-blaster",
            "title": "Piranha fusion blaster",
            "aliases": [
              "Piranha fusion blaster"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-piranhas-profile-ab3c136c0f"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-piranhas-selection-seeker-missile",
            "title": "Seeker missile",
            "aliases": [
              "Seeker missile"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-piranhas-profile-351bd7e3c7"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-piranhas-selection-armoured-hull",
            "title": "Armoured hull",
            "aliases": [
              "Armoured hull"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-piranhas-profile-3b23de47af"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-piranhas-selection-twin-pulse-carbine",
            "title": "Twin pulse carbine",
            "aliases": [
              "Twin pulse carbine"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-piranhas-profile-dfd910195f"
            ],
            "wargearAbilityIds": []
          }
        ],
        "weaponFamilies": [],
        "weaponProfiles": [
          {
            "id": "unit-piranhas-profile-0b869244e8",
            "legacyIds": [
              "unit-piranhas-profile-piranha-burst-cannon-ranged"
            ],
            "title": "Piranha burst cannon",
            "mode": "ranged",
            "range": "18\"",
            "a": "4",
            "skill": "4+",
            "s": "6",
            "ap": "-1",
            "d": "1",
            "abilities": "",
            "sourceSelectionIds": [
              "unit-piranhas-selection-piranha-burst-cannon"
            ]
          },
          {
            "id": "unit-piranhas-profile-ab3c136c0f",
            "legacyIds": [
              "unit-piranhas-profile-piranha-fusion-blaster-ranged-2"
            ],
            "title": "Piranha fusion blaster",
            "mode": "ranged",
            "range": "12\"",
            "a": "1",
            "skill": "4+",
            "s": "9",
            "ap": "-4",
            "d": "D6",
            "abilities": "Melta 4",
            "sourceSelectionIds": [
              "unit-piranhas-selection-piranha-fusion-blaster"
            ]
          },
          {
            "id": "unit-piranhas-profile-351bd7e3c7",
            "legacyIds": [
              "unit-piranhas-profile-seeker-missile-ranged-3"
            ],
            "title": "Seeker missile",
            "mode": "ranged",
            "range": "48\"",
            "a": "1",
            "skill": "4+",
            "s": "14",
            "ap": "-3",
            "d": "D6+1",
            "abilities": "One Shot",
            "sourceSelectionIds": [
              "unit-piranhas-selection-seeker-missile"
            ]
          },
          {
            "id": "unit-piranhas-profile-3b23de47af",
            "legacyIds": [
              "unit-piranhas-profile-armoured-hull-melee-4"
            ],
            "title": "Armoured hull",
            "mode": "melee",
            "range": "Melee",
            "a": "2",
            "skill": "5+",
            "s": "4",
            "ap": "0",
            "d": "1",
            "abilities": "",
            "sourceSelectionIds": [
              "unit-piranhas-selection-armoured-hull"
            ]
          },
          {
            "id": "unit-piranhas-profile-dfd910195f",
            "legacyIds": [
              "unit-piranhas-profile-twin-pulse-carbine-ranged-5"
            ],
            "title": "Twin pulse carbine",
            "mode": "ranged",
            "range": "20\"",
            "a": "2",
            "skill": "4+",
            "s": "5",
            "ap": "0",
            "d": "1",
            "abilities": "Twin-linked, Assault",
            "sourceSelectionIds": [
              "unit-piranhas-selection-twin-pulse-carbine"
            ]
          }
        ],
        "wargearAbilities": [],
        "wargearDefaults": [
          {
            "modelId": "unit-piranhas-model-05f0890c53",
            "selections": [
              {
                "selectionId": "unit-piranhas-selection-piranha-burst-cannon",
                "quantity": 1
              },
              {
                "selectionId": "unit-piranhas-selection-twin-pulse-carbine",
                "quantity": 2
              },
              {
                "selectionId": "unit-piranhas-selection-armoured-hull",
                "quantity": 1
              }
            ]
          }
        ],
        "wargearOptionContracts": [
          {
            "sourceId": "datasheet-piranhas:wargear:1",
            "eligibleModelIds": [
              "unit-piranhas-model-05f0890c53"
            ],
            "limit": {
              "perModel": 1
            },
            "choices": [
              {
                "remove": [
                  {
                    "selectionId": "unit-piranhas-selection-piranha-burst-cannon",
                    "quantity": 1
                  }
                ],
                "add": [
                  {
                    "selectionId": "unit-piranhas-selection-piranha-fusion-blaster",
                    "quantity": 1
                  }
                ],
                "requiresFinal": [],
                "forbidsFinal": [],
                "sharedUses": []
              }
            ]
          },
          {
            "sourceId": "datasheet-piranhas:wargear:2",
            "eligibleModelIds": [
              "unit-piranhas-model-05f0890c53"
            ],
            "limit": {
              "perModel": 2
            },
            "choices": [
              {
                "remove": [],
                "add": [
                  {
                    "selectionId": "unit-piranhas-selection-seeker-missile",
                    "quantity": 1
                  }
                ],
                "requiresFinal": [],
                "forbidsFinal": [],
                "sharedUses": []
              }
            ]
          }
        ],
        "wargearSharedCaps": []
      }
    },
    {
      "id": "unit-razorshark-strike-fighter",
      "title": "Razorshark Strike Fighter",
      "sourceBookId": "tau-empire",
      "sourceLayer": "codex",
      "intrinsicKeywords": [
        "Vehicle",
        "Aircraft",
        "Fly",
        "Frame",
        "Razorshark Strike Fighter",
        "T'au Empire"
      ],
      "relations": {
        "canLead": [],
        "canSupport": [],
        "canBeLedBy": [],
        "canBeSupportedBy": []
      },
      "ruleFacts": {
        "relations": {
          "canLead": [],
          "canSupport": [],
          "canBeLedBy": [],
          "canBeSupportedBy": []
        }
      },
      "gameSelections": {
        "stats": {
          "M": "-",
          "T": "10",
          "Sv": "3+",
          "W": "12",
          "Ld": "7+",
          "OC": "-",
          "Invulnerable": ""
        },
        "statProfiles": [],
        "abilities": [
          {
            "id": "tau-empire-ability-ground-strike-fighter",
            "sectionId": "tau-empire-ability-ground-strike-fighter",
            "title": "Ground Strike Fighter",
            "text": "Each time this model makes a ranged attack that targets an enemy unit that cannot FLY, add 1 to the Hit roll.",
            "sourceUnitId": "unit-razorshark-strike-fighter"
          },
          {
            "id": "tau-empire-ability-damaged-1-4-wounds-remaining",
            "sectionId": "tau-empire-ability-damaged-1-4-wounds-remaining",
            "title": "Damaged: 1-4 WOUNDS REMAINING",
            "text": "While this model has 1-4 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll.",
            "sourceUnitId": "unit-razorshark-strike-fighter"
          },
          {
            "id": "core-deadly-demise",
            "sectionId": "core-deadly-demise",
            "title": "Deadly Demise D3",
            "text": "This ability always takes the form Deadly Demise X. Each time a model in this unit is destroyed, after the units embarked within it (if any) have made their emergency disembark moves, roll one D6. On a 6, that model suffers a deadly demise; each unit within 6\" of that model suffers a number of mortal wounds denoted by X (if this is a random number, roll separately for each unit within 6\"). \n *Example: An Impulsor with a unit of Intercessors embarked within it is destroyed by ranged attacks. First, any unresolved attacks made by the attacking unit are resolved. Then the Intercessors make an emergency disembark move. Then the roll is made for the Deadly Demise ability, and on a 6, that ability is resolved. Finally, the Impulsor is removed from the battlefield.*",
            "sourceUnitId": "unit-razorshark-strike-fighter"
          },
          {
            "id": "tau-empire-ability-for-the-greater-good",
            "sectionId": "tau-empire-ability-for-the-greater-good",
            "title": "For The Greater Good",
            "text": "If your Army Faction is T’AU EMPIRE, at the start of your Shooting phase you can select units from your army with this ability to become Observer units.\n\nDuring your Shooting phase, for each Observer unit from your army that has not been selected to shoot this phase and is eligible to shoot (excluding FORTIFICATION and Battle-shocked units) select one enemy unit that is visible to be marked as their Spotted unit until the end of the phase. Each enemy unit can only be marked as a Spotted unit once per phase.\n\nUnits from your army with the For the Greater Good ability (excluding Observer units) are Guided units while targeting one or more Spotted units.\n\nUntil the end of the phase, each time a model from your army in a Guided unit makes an attack that targets a Spotted unit, improve the Ballistic Skill characteristic of that attack by 1 and, if the Spotted unit was marked by an Observer unit that has the Markerlight keyword, that attack has the [IGNORES COVER] ability.",
            "sourceUnitId": "unit-razorshark-strike-fighter"
          }
        ],
        "models": [
          {
            "id": "unit-razorshark-strike-fighter-model-280f1bb87e",
            "title": "Razorshark Strike Fighter",
            "aliases": [
              "Razorshark Strike Fighter"
            ],
            "min": 1,
            "max": 1,
            "legacyIds": [
              "unit-razorshark-strike-fighter-model-razorshark-strike-fighter"
            ]
          }
        ],
        "compositionRules": [],
        "selections": [
          {
            "id": "unit-razorshark-strike-fighter-selection-quad-ion-turret-standard",
            "title": "➤ Quad ion turret - standard",
            "aliases": [
              "➤ Quad ion turret - standard"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-razorshark-strike-fighter-profile-845bf02ea4"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-razorshark-strike-fighter-selection-quad-ion-turret-overcharge",
            "title": "➤ Quad ion turret - overcharge",
            "aliases": [
              "➤ Quad ion turret - overcharge"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-razorshark-strike-fighter-profile-b2f900a25b"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-razorshark-strike-fighter-selection-missile-pod",
            "title": "Missile pod",
            "aliases": [
              "Missile pod"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-razorshark-strike-fighter-profile-fdcca74aab"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-razorshark-strike-fighter-selection-accelerator-burst-cannon",
            "title": "Accelerator burst cannon",
            "aliases": [
              "Accelerator burst cannon"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-razorshark-strike-fighter-profile-6fde1ef259"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-razorshark-strike-fighter-selection-seeker-missile",
            "title": "Seeker missile",
            "aliases": [
              "Seeker missile"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-razorshark-strike-fighter-profile-351bd7e3c7"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-razorshark-strike-fighter-selection-armoured-hull",
            "title": "Armoured hull",
            "aliases": [
              "Armoured hull"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-razorshark-strike-fighter-profile-3f6402479f"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-razorshark-strike-fighter-weapon-family-quad-ion-turret-selection",
            "title": "➤ Quad ion turret",
            "aliases": [
              "➤ Quad ion turret"
            ],
            "kind": "weapon",
            "familyId": "unit-razorshark-strike-fighter-weapon-family-quad-ion-turret",
            "profileIds": [
              "unit-razorshark-strike-fighter-profile-845bf02ea4",
              "unit-razorshark-strike-fighter-profile-b2f900a25b"
            ],
            "wargearAbilityIds": []
          }
        ],
        "weaponFamilies": [
          {
            "id": "unit-razorshark-strike-fighter-weapon-family-quad-ion-turret",
            "title": "➤ Quad ion turret",
            "aliases": [
              "➤ Quad ion turret"
            ],
            "profileIds": [
              "unit-razorshark-strike-fighter-profile-845bf02ea4",
              "unit-razorshark-strike-fighter-profile-b2f900a25b"
            ],
            "ambiguousAlias": false
          }
        ],
        "weaponProfiles": [
          {
            "id": "unit-razorshark-strike-fighter-profile-845bf02ea4",
            "legacyIds": [
              "unit-razorshark-strike-fighter-profile-quad-ion-turret-standard-ranged"
            ],
            "title": "➤ Quad ion turret - standard",
            "mode": "ranged",
            "range": "30\"",
            "a": "8",
            "skill": "4+",
            "s": "7",
            "ap": "-1",
            "d": "1",
            "abilities": "Twin-linked",
            "sourceSelectionIds": [
              "unit-razorshark-strike-fighter-selection-quad-ion-turret-standard",
              "unit-razorshark-strike-fighter-weapon-family-quad-ion-turret-selection"
            ]
          },
          {
            "id": "unit-razorshark-strike-fighter-profile-b2f900a25b",
            "legacyIds": [
              "unit-razorshark-strike-fighter-profile-quad-ion-turret-overcharge-ranged-2"
            ],
            "title": "➤ Quad ion turret - overcharge",
            "mode": "ranged",
            "range": "30\"",
            "a": "8",
            "skill": "4+",
            "s": "8",
            "ap": "-2",
            "d": "2",
            "abilities": "Hazardous, Twin-linked",
            "sourceSelectionIds": [
              "unit-razorshark-strike-fighter-selection-quad-ion-turret-overcharge",
              "unit-razorshark-strike-fighter-weapon-family-quad-ion-turret-selection"
            ]
          },
          {
            "id": "unit-razorshark-strike-fighter-profile-fdcca74aab",
            "legacyIds": [
              "unit-razorshark-strike-fighter-profile-missile-pod-ranged-3"
            ],
            "title": "Missile pod",
            "mode": "ranged",
            "range": "30\"",
            "a": "2",
            "skill": "4+",
            "s": "7",
            "ap": "-1",
            "d": "2",
            "abilities": "",
            "sourceSelectionIds": [
              "unit-razorshark-strike-fighter-selection-missile-pod"
            ]
          },
          {
            "id": "unit-razorshark-strike-fighter-profile-6fde1ef259",
            "legacyIds": [
              "unit-razorshark-strike-fighter-profile-accelerator-burst-cannon-ranged-4"
            ],
            "title": "Accelerator burst cannon",
            "mode": "ranged",
            "range": "18\"",
            "a": "4",
            "skill": "4+",
            "s": "6",
            "ap": "-1",
            "d": "1",
            "abilities": "",
            "sourceSelectionIds": [
              "unit-razorshark-strike-fighter-selection-accelerator-burst-cannon"
            ]
          },
          {
            "id": "unit-razorshark-strike-fighter-profile-351bd7e3c7",
            "legacyIds": [
              "unit-razorshark-strike-fighter-profile-seeker-missile-ranged-5"
            ],
            "title": "Seeker missile",
            "mode": "ranged",
            "range": "48\"",
            "a": "1",
            "skill": "4+",
            "s": "14",
            "ap": "-3",
            "d": "D6+1",
            "abilities": "One Shot",
            "sourceSelectionIds": [
              "unit-razorshark-strike-fighter-selection-seeker-missile"
            ]
          },
          {
            "id": "unit-razorshark-strike-fighter-profile-3f6402479f",
            "legacyIds": [
              "unit-razorshark-strike-fighter-profile-armoured-hull-melee-6"
            ],
            "title": "Armoured hull",
            "mode": "melee",
            "range": "Melee",
            "a": "3",
            "skill": "5+",
            "s": "6",
            "ap": "0",
            "d": "1",
            "abilities": "",
            "sourceSelectionIds": [
              "unit-razorshark-strike-fighter-selection-armoured-hull"
            ]
          }
        ],
        "wargearAbilities": [],
        "wargearDefaults": [
          {
            "modelId": "unit-razorshark-strike-fighter-model-280f1bb87e",
            "selections": [
              {
                "selectionId": "unit-razorshark-strike-fighter-selection-accelerator-burst-cannon",
                "quantity": 1
              },
              {
                "selectionId": "unit-razorshark-strike-fighter-weapon-family-quad-ion-turret-selection",
                "quantity": 1
              },
              {
                "selectionId": "unit-razorshark-strike-fighter-selection-seeker-missile",
                "quantity": 2
              },
              {
                "selectionId": "unit-razorshark-strike-fighter-selection-armoured-hull",
                "quantity": 1
              }
            ]
          }
        ],
        "wargearOptionContracts": [
          {
            "sourceId": "datasheet-razorshark-strike-fighter:wargear:1",
            "eligibleModelIds": [
              "unit-razorshark-strike-fighter-model-280f1bb87e"
            ],
            "limit": {
              "perModel": 1
            },
            "choices": [
              {
                "remove": [
                  {
                    "selectionId": "unit-razorshark-strike-fighter-selection-accelerator-burst-cannon",
                    "quantity": 1
                  }
                ],
                "add": [
                  {
                    "selectionId": "unit-razorshark-strike-fighter-selection-missile-pod",
                    "quantity": 1
                  }
                ],
                "requiresFinal": [],
                "forbidsFinal": [],
                "sharedUses": []
              }
            ]
          }
        ],
        "wargearSharedCaps": []
      }
    },
    {
      "id": "unit-riptide-battlesuit",
      "title": "Riptide Battlesuit",
      "sourceBookId": "tau-empire",
      "sourceLayer": "codex",
      "intrinsicKeywords": [
        "Vehicle",
        "Walker",
        "Fly",
        "Battlesuit",
        "Riptide",
        "T'au Empire"
      ],
      "relations": {
        "canLead": [],
        "canSupport": [],
        "canBeLedBy": [],
        "canBeSupportedBy": []
      },
      "ruleFacts": {
        "relations": {
          "canLead": [],
          "canSupport": [],
          "canBeLedBy": [],
          "canBeSupportedBy": []
        }
      },
      "gameSelections": {
        "stats": {
          "M": "10\"",
          "T": "9",
          "Sv": "2+",
          "W": "14",
          "Ld": "7+",
          "OC": "4",
          "Invulnerable": "4+"
        },
        "statProfiles": [],
        "abilities": [
          {
            "id": "tau-empire-ability-nova-charge",
            "sectionId": "tau-empire-ability-nova-charge",
            "title": "Nova Charge",
            "text": "Once per battle, when this unit is selected to shoot in your Shooting phase, select one ranged weapon equipped by this model. Until the end of the phase, that weapon has the [DEVASTATING WOUNDS] ability.",
            "sourceUnitId": "unit-riptide-battlesuit"
          },
          {
            "id": "tau-empire-ability-damaged-1-4-wounds-remaining",
            "sectionId": "tau-empire-ability-damaged-1-4-wounds-remaining",
            "title": "Damaged: 1-4 WOUNDS REMAINING",
            "text": "While this model has 1-4 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll.",
            "sourceUnitId": "unit-riptide-battlesuit"
          },
          {
            "id": "tau-empire-ability-battlesuit-support-system-4",
            "sectionId": "tau-empire-ability-battlesuit-support-system-4",
            "title": "Battlesuit Support System",
            "text": "The bearer is eligible to shoot in a turn in which it Fell Back.",
            "sourceUnitId": "unit-riptide-battlesuit"
          },
          {
            "id": "tau-empire-ability-weapon-support-system",
            "sectionId": "tau-empire-ability-weapon-support-system",
            "title": "Weapon Support System",
            "text": "Each time the bearer makes a ranged attack, you can ignore any or all modifiers to the Hit roll.",
            "sourceUnitId": "unit-riptide-battlesuit"
          },
          {
            "id": "core-deadly-demise",
            "sectionId": "core-deadly-demise",
            "title": "Deadly Demise D6",
            "text": "This ability always takes the form Deadly Demise X. Each time a model in this unit is destroyed, after the units embarked within it (if any) have made their emergency disembark moves, roll one D6. On a 6, that model suffers a deadly demise; each unit within 6\" of that model suffers a number of mortal wounds denoted by X (if this is a random number, roll separately for each unit within 6\"). \n *Example: An Impulsor with a unit of Intercessors embarked within it is destroyed by ranged attacks. First, any unresolved attacks made by the attacking unit are resolved. Then the Intercessors make an emergency disembark move. Then the roll is made for the Deadly Demise ability, and on a 6, that ability is resolved. Finally, the Impulsor is removed from the battlefield.*",
            "sourceUnitId": "unit-riptide-battlesuit"
          },
          {
            "id": "tau-empire-ability-for-the-greater-good",
            "sectionId": "tau-empire-ability-for-the-greater-good",
            "title": "For The Greater Good",
            "text": "If your Army Faction is T’AU EMPIRE, at the start of your Shooting phase you can select units from your army with this ability to become Observer units.\n\nDuring your Shooting phase, for each Observer unit from your army that has not been selected to shoot this phase and is eligible to shoot (excluding FORTIFICATION and Battle-shocked units) select one enemy unit that is visible to be marked as their Spotted unit until the end of the phase. Each enemy unit can only be marked as a Spotted unit once per phase.\n\nUnits from your army with the For the Greater Good ability (excluding Observer units) are Guided units while targeting one or more Spotted units.\n\nUntil the end of the phase, each time a model from your army in a Guided unit makes an attack that targets a Spotted unit, improve the Ballistic Skill characteristic of that attack by 1 and, if the Spotted unit was marked by an Observer unit that has the Markerlight keyword, that attack has the [IGNORES COVER] ability.",
            "sourceUnitId": "unit-riptide-battlesuit"
          },
          {
            "id": "core-devastating-wounds",
            "sectionId": "core-devastating-wounds",
            "title": "Devastating Wounds",
            "text": "Each time an attack made with a [DEVASTATING WOUNDS] weapon results in a critical wound, the attack sequence for that attack ends and the target unit suffers a number of mortal wounds equal to the D characteristic of that weapon. These are inflicted after resolving any normal damage inflicted by those attacks. \n Mortal wounds inflicted by [DEVASTATING WOUNDS] weapons can damage a maximum of one model for each critical wound; any remaining mortal wounds inflicted by that attack are lost. \n Example: An attack made with a [DEVASTATING WOUNDS] weapon with a D characteristic of 3 results in a critical wound against an Intercessor Squad, so inflicts 3 mortal wounds. The first 2 mortal wounds are sufficient to destroy 1 Intercessor model, so the remaining mortal wound is lost.*",
            "sourceUnitId": "unit-riptide-battlesuit"
          }
        ],
        "models": [
          {
            "id": "unit-riptide-battlesuit-model-8c6dc96806",
            "title": "Riptide Battlesuit",
            "aliases": [
              "Riptide Battlesuit"
            ],
            "min": 1,
            "max": 1,
            "legacyIds": [
              "unit-riptide-battlesuit-model-riptide-battlesuit"
            ]
          }
        ],
        "compositionRules": [],
        "selections": [
          {
            "id": "unit-riptide-battlesuit-selection-riptide-fists",
            "title": "Riptide fists",
            "aliases": [
              "Riptide fists"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-riptide-battlesuit-profile-a83a9ab60e"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-riptide-battlesuit-selection-heavy-burst-cannon",
            "title": "Heavy burst cannon",
            "aliases": [
              "Heavy burst cannon"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-riptide-battlesuit-profile-817603a538"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-riptide-battlesuit-selection-ion-accelerator-standard",
            "title": "➤ Ion accelerator - standard",
            "aliases": [
              "➤ Ion accelerator - standard"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-riptide-battlesuit-profile-f853a279dc"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-riptide-battlesuit-selection-ion-accelerator-supercharge",
            "title": "➤ Ion accelerator - supercharge",
            "aliases": [
              "➤ Ion accelerator - supercharge"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-riptide-battlesuit-profile-49eb2f34dc"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-riptide-battlesuit-selection-missile-pod",
            "title": "Missile pod",
            "aliases": [
              "Missile pod"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-riptide-battlesuit-profile-e5f2491af6"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-riptide-battlesuit-selection-twin-smart-missile-system",
            "title": "Twin smart missile system",
            "aliases": [
              "Twin smart missile system"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-riptide-battlesuit-profile-2c64a06069"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-riptide-battlesuit-selection-twin-fusion-blaster",
            "title": "Twin fusion blaster",
            "aliases": [
              "Twin fusion blaster"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-riptide-battlesuit-profile-7bc91a126d"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-riptide-battlesuit-selection-twin-plasma-rifle",
            "title": "Twin plasma rifle",
            "aliases": [
              "Twin plasma rifle"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-riptide-battlesuit-profile-679b3cbf7c"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-riptide-battlesuit-weapon-family-ion-accelerator-selection",
            "title": "➤ Ion accelerator",
            "aliases": [
              "➤ Ion accelerator"
            ],
            "kind": "weapon",
            "familyId": "unit-riptide-battlesuit-weapon-family-ion-accelerator",
            "profileIds": [
              "unit-riptide-battlesuit-profile-f853a279dc",
              "unit-riptide-battlesuit-profile-49eb2f34dc"
            ],
            "wargearAbilityIds": []
          }
        ],
        "weaponFamilies": [
          {
            "id": "unit-riptide-battlesuit-weapon-family-ion-accelerator",
            "title": "➤ Ion accelerator",
            "aliases": [
              "➤ Ion accelerator"
            ],
            "profileIds": [
              "unit-riptide-battlesuit-profile-f853a279dc",
              "unit-riptide-battlesuit-profile-49eb2f34dc"
            ],
            "ambiguousAlias": false
          }
        ],
        "weaponProfiles": [
          {
            "id": "unit-riptide-battlesuit-profile-a83a9ab60e",
            "legacyIds": [
              "unit-riptide-battlesuit-profile-riptide-fists-melee"
            ],
            "title": "Riptide fists",
            "mode": "melee",
            "range": "Melee",
            "a": "6",
            "skill": "5+",
            "s": "6",
            "ap": "0",
            "d": "2",
            "abilities": "",
            "sourceSelectionIds": [
              "unit-riptide-battlesuit-selection-riptide-fists"
            ]
          },
          {
            "id": "unit-riptide-battlesuit-profile-817603a538",
            "legacyIds": [
              "unit-riptide-battlesuit-profile-heavy-burst-cannon-ranged-2"
            ],
            "title": "Heavy burst cannon",
            "mode": "ranged",
            "range": "36\"",
            "a": "12",
            "skill": "4+",
            "s": "6",
            "ap": "-1",
            "d": "2",
            "abilities": "",
            "sourceSelectionIds": [
              "unit-riptide-battlesuit-selection-heavy-burst-cannon"
            ]
          },
          {
            "id": "unit-riptide-battlesuit-profile-f853a279dc",
            "legacyIds": [
              "unit-riptide-battlesuit-profile-ion-accelerator-standard-ranged-3"
            ],
            "title": "➤ Ion accelerator - standard",
            "mode": "ranged",
            "range": "72\"",
            "a": "6",
            "skill": "4+",
            "s": "9",
            "ap": "-2",
            "d": "3",
            "abilities": "",
            "sourceSelectionIds": [
              "unit-riptide-battlesuit-selection-ion-accelerator-standard",
              "unit-riptide-battlesuit-weapon-family-ion-accelerator-selection"
            ]
          },
          {
            "id": "unit-riptide-battlesuit-profile-49eb2f34dc",
            "legacyIds": [
              "unit-riptide-battlesuit-profile-ion-accelerator-supercharge-ranged-4"
            ],
            "title": "➤ Ion accelerator - supercharge",
            "mode": "ranged",
            "range": "72\"",
            "a": "6",
            "skill": "4+",
            "s": "10",
            "ap": "-3",
            "d": "4",
            "abilities": "Hazardous",
            "sourceSelectionIds": [
              "unit-riptide-battlesuit-selection-ion-accelerator-supercharge",
              "unit-riptide-battlesuit-weapon-family-ion-accelerator-selection"
            ]
          },
          {
            "id": "unit-riptide-battlesuit-profile-e5f2491af6",
            "legacyIds": [
              "unit-riptide-battlesuit-profile-missile-pod-ranged-5"
            ],
            "title": "Missile pod",
            "mode": "ranged",
            "range": "30\"",
            "a": "2",
            "skill": "5+",
            "s": "7",
            "ap": "-1",
            "d": "2",
            "abilities": "",
            "sourceSelectionIds": [
              "unit-riptide-battlesuit-selection-missile-pod"
            ]
          },
          {
            "id": "unit-riptide-battlesuit-profile-2c64a06069",
            "legacyIds": [
              "unit-riptide-battlesuit-profile-twin-smart-missile-system-ranged-6"
            ],
            "title": "Twin smart missile system",
            "mode": "ranged",
            "range": "30\"",
            "a": "3",
            "skill": "4+",
            "s": "5",
            "ap": "0",
            "d": "1",
            "abilities": "Indirect Fire, Twin-linked",
            "sourceSelectionIds": [
              "unit-riptide-battlesuit-selection-twin-smart-missile-system"
            ]
          },
          {
            "id": "unit-riptide-battlesuit-profile-7bc91a126d",
            "legacyIds": [
              "unit-riptide-battlesuit-profile-twin-fusion-blaster-ranged-7"
            ],
            "title": "Twin fusion blaster",
            "mode": "ranged",
            "range": "12\"",
            "a": "1",
            "skill": "4+",
            "s": "9",
            "ap": "-4",
            "d": "D6",
            "abilities": "Melta 2, Twin-linked",
            "sourceSelectionIds": [
              "unit-riptide-battlesuit-selection-twin-fusion-blaster"
            ]
          },
          {
            "id": "unit-riptide-battlesuit-profile-679b3cbf7c",
            "legacyIds": [
              "unit-riptide-battlesuit-profile-twin-plasma-rifle-ranged-8"
            ],
            "title": "Twin plasma rifle",
            "mode": "ranged",
            "range": "18\"",
            "a": "1",
            "skill": "4+",
            "s": "8",
            "ap": "-3",
            "d": "3",
            "abilities": "Twin-linked",
            "sourceSelectionIds": [
              "unit-riptide-battlesuit-selection-twin-plasma-rifle"
            ]
          }
        ],
        "wargearAbilities": [],
        "wargearDefaults": [
          {
            "modelId": "unit-riptide-battlesuit-model-8c6dc96806",
            "selections": [
              {
                "selectionId": "unit-riptide-battlesuit-selection-heavy-burst-cannon",
                "quantity": 1
              },
              {
                "selectionId": "unit-riptide-battlesuit-selection-twin-plasma-rifle",
                "quantity": 1
              },
              {
                "selectionId": "unit-riptide-battlesuit-selection-riptide-fists",
                "quantity": 1
              }
            ]
          }
        ],
        "wargearOptionContracts": [
          {
            "sourceId": "datasheet-riptide-battlesuit:wargear:1",
            "eligibleModelIds": [
              "unit-riptide-battlesuit-model-8c6dc96806"
            ],
            "limit": {
              "perModel": 1
            },
            "choices": [
              {
                "remove": [
                  {
                    "selectionId": "unit-riptide-battlesuit-selection-heavy-burst-cannon",
                    "quantity": 1
                  }
                ],
                "add": [
                  {
                    "selectionId": "unit-riptide-battlesuit-weapon-family-ion-accelerator-selection",
                    "quantity": 1
                  }
                ],
                "requiresFinal": [],
                "forbidsFinal": [],
                "sharedUses": []
              }
            ]
          },
          {
            "sourceId": "datasheet-riptide-battlesuit:wargear:2",
            "eligibleModelIds": [
              "unit-riptide-battlesuit-model-8c6dc96806"
            ],
            "limit": {
              "perModel": 1
            },
            "choices": [
              {
                "remove": [
                  {
                    "selectionId": "unit-riptide-battlesuit-selection-twin-plasma-rifle",
                    "quantity": 1
                  }
                ],
                "add": [
                  {
                    "selectionId": "unit-riptide-battlesuit-selection-twin-fusion-blaster",
                    "quantity": 1
                  }
                ],
                "requiresFinal": [],
                "forbidsFinal": [],
                "sharedUses": []
              },
              {
                "remove": [
                  {
                    "selectionId": "unit-riptide-battlesuit-selection-twin-plasma-rifle",
                    "quantity": 1
                  }
                ],
                "add": [
                  {
                    "selectionId": "unit-riptide-battlesuit-selection-twin-smart-missile-system",
                    "quantity": 1
                  }
                ],
                "requiresFinal": [],
                "forbidsFinal": [],
                "sharedUses": []
              }
            ]
          },
          {
            "sourceId": "datasheet-riptide-battlesuit:wargear:3",
            "eligibleModelIds": [
              "unit-riptide-battlesuit-model-8c6dc96806"
            ],
            "limit": {
              "perModel": 2
            },
            "choices": [
              {
                "remove": [],
                "add": [
                  {
                    "selectionId": "unit-riptide-battlesuit-selection-missile-pod",
                    "quantity": 1
                  }
                ],
                "requiresFinal": [],
                "forbidsFinal": [],
                "sharedUses": []
              }
            ]
          }
        ],
        "wargearSharedCaps": []
      }
    },
    {
      "id": "unit-sky-ray-gunship",
      "title": "Sky Ray Gunship",
      "sourceBookId": "tau-empire",
      "sourceLayer": "codex",
      "intrinsicKeywords": [
        "Vehicle",
        "Fly",
        "Frame",
        "Markerlight",
        "Sky Ray Gunship",
        "T'au Empire"
      ],
      "relations": {
        "canLead": [],
        "canSupport": [],
        "canBeLedBy": [],
        "canBeSupportedBy": []
      },
      "ruleFacts": {
        "relations": {
          "canLead": [],
          "canSupport": [],
          "canBeLedBy": [],
          "canBeSupportedBy": []
        }
      },
      "gameSelections": {
        "stats": {
          "M": "10\"",
          "T": "10",
          "Sv": "3+",
          "W": "14",
          "Ld": "7+",
          "OC": "3",
          "Invulnerable": ""
        },
        "statProfiles": [],
        "abilities": [
          {
            "id": "tau-empire-ability-velocity-tracker",
            "sectionId": "tau-empire-ability-velocity-tracker",
            "title": "Velocity Tracker",
            "text": "Each time this model makes a ranged attack that targets a unit that can FLY, you can re-roll the Hit roll.",
            "sourceUnitId": "unit-sky-ray-gunship"
          },
          {
            "id": "tau-empire-ability-damaged-1-5-wounds-remaining",
            "sectionId": "tau-empire-ability-damaged-1-5-wounds-remaining",
            "title": "Damaged: 1-5 WOUNDS REMAINING",
            "text": "While this model has 1-5 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll.",
            "sourceUnitId": "unit-sky-ray-gunship"
          },
          {
            "id": "tau-empire-ability-targeting-array-2",
            "sectionId": "tau-empire-ability-targeting-array-2",
            "title": "Targeting Array",
            "text": "Each time this unit is selected to shoot, you can re-roll one Hit roll or you can re-roll one Wound roll when resolving those attacks.",
            "sourceUnitId": "unit-sky-ray-gunship"
          },
          {
            "id": "core-deadly-demise",
            "sectionId": "core-deadly-demise",
            "title": "Deadly Demise D3",
            "text": "This ability always takes the form Deadly Demise X. Each time a model in this unit is destroyed, after the units embarked within it (if any) have made their emergency disembark moves, roll one D6. On a 6, that model suffers a deadly demise; each unit within 6\" of that model suffers a number of mortal wounds denoted by X (if this is a random number, roll separately for each unit within 6\"). \n *Example: An Impulsor with a unit of Intercessors embarked within it is destroyed by ranged attacks. First, any unresolved attacks made by the attacking unit are resolved. Then the Intercessors make an emergency disembark move. Then the roll is made for the Deadly Demise ability, and on a 6, that ability is resolved. Finally, the Impulsor is removed from the battlefield.*",
            "sourceUnitId": "unit-sky-ray-gunship"
          },
          {
            "id": "tau-empire-ability-for-the-greater-good",
            "sectionId": "tau-empire-ability-for-the-greater-good",
            "title": "For The Greater Good",
            "text": "If your Army Faction is T’AU EMPIRE, at the start of your Shooting phase you can select units from your army with this ability to become Observer units.\n\nDuring your Shooting phase, for each Observer unit from your army that has not been selected to shoot this phase and is eligible to shoot (excluding FORTIFICATION and Battle-shocked units) select one enemy unit that is visible to be marked as their Spotted unit until the end of the phase. Each enemy unit can only be marked as a Spotted unit once per phase.\n\nUnits from your army with the For the Greater Good ability (excluding Observer units) are Guided units while targeting one or more Spotted units.\n\nUntil the end of the phase, each time a model from your army in a Guided unit makes an attack that targets a Spotted unit, improve the Ballistic Skill characteristic of that attack by 1 and, if the Spotted unit was marked by an Observer unit that has the Markerlight keyword, that attack has the [IGNORES COVER] ability.",
            "sourceUnitId": "unit-sky-ray-gunship"
          }
        ],
        "models": [
          {
            "id": "unit-sky-ray-gunship-model-f1d0e2106a",
            "title": "Sky Ray Gunship",
            "aliases": [
              "Sky Ray Gunship"
            ],
            "min": 1,
            "max": 1,
            "legacyIds": [
              "unit-sky-ray-gunship-model-sky-ray-gunship"
            ]
          }
        ],
        "compositionRules": [],
        "selections": [
          {
            "id": "unit-sky-ray-gunship-selection-seeker-missile-rack",
            "title": "Seeker missile rack",
            "aliases": [
              "Seeker missile rack"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-sky-ray-gunship-profile-5a781c0615"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-sky-ray-gunship-selection-accelerator-burst-cannon",
            "title": "Accelerator burst cannon",
            "aliases": [
              "Accelerator burst cannon"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-sky-ray-gunship-profile-6fde1ef259"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-sky-ray-gunship-selection-twin-pulse-carbine",
            "title": "Twin pulse carbine",
            "aliases": [
              "Twin pulse carbine"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-sky-ray-gunship-profile-dfd910195f"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-sky-ray-gunship-selection-smart-missile-system",
            "title": "Smart missile system",
            "aliases": [
              "Smart missile system"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-sky-ray-gunship-profile-506187484b"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-sky-ray-gunship-selection-armoured-hull",
            "title": "Armoured hull",
            "aliases": [
              "Armoured hull"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-sky-ray-gunship-profile-3f6402479f"
            ],
            "wargearAbilityIds": []
          }
        ],
        "weaponFamilies": [],
        "weaponProfiles": [
          {
            "id": "unit-sky-ray-gunship-profile-5a781c0615",
            "legacyIds": [
              "unit-sky-ray-gunship-profile-seeker-missile-rack-ranged"
            ],
            "title": "Seeker missile rack",
            "mode": "ranged",
            "range": "48\"",
            "a": "3",
            "skill": "4+",
            "s": "14",
            "ap": "-3",
            "d": "D6+1",
            "abilities": "Twin-linked",
            "sourceSelectionIds": [
              "unit-sky-ray-gunship-selection-seeker-missile-rack"
            ]
          },
          {
            "id": "unit-sky-ray-gunship-profile-6fde1ef259",
            "legacyIds": [
              "unit-sky-ray-gunship-profile-accelerator-burst-cannon-ranged-2"
            ],
            "title": "Accelerator burst cannon",
            "mode": "ranged",
            "range": "18\"",
            "a": "4",
            "skill": "4+",
            "s": "6",
            "ap": "-1",
            "d": "1",
            "abilities": "",
            "sourceSelectionIds": [
              "unit-sky-ray-gunship-selection-accelerator-burst-cannon"
            ]
          },
          {
            "id": "unit-sky-ray-gunship-profile-dfd910195f",
            "legacyIds": [
              "unit-sky-ray-gunship-profile-twin-pulse-carbine-ranged-3"
            ],
            "title": "Twin pulse carbine",
            "mode": "ranged",
            "range": "20\"",
            "a": "2",
            "skill": "4+",
            "s": "5",
            "ap": "0",
            "d": "1",
            "abilities": "Twin-linked, Assault",
            "sourceSelectionIds": [
              "unit-sky-ray-gunship-selection-twin-pulse-carbine"
            ]
          },
          {
            "id": "unit-sky-ray-gunship-profile-506187484b",
            "legacyIds": [
              "unit-sky-ray-gunship-profile-smart-missile-system-ranged-4"
            ],
            "title": "Smart missile system",
            "mode": "ranged",
            "range": "30\"",
            "a": "3",
            "skill": "4+",
            "s": "5",
            "ap": "0",
            "d": "1",
            "abilities": "Indirect Fire",
            "sourceSelectionIds": [
              "unit-sky-ray-gunship-selection-smart-missile-system"
            ]
          },
          {
            "id": "unit-sky-ray-gunship-profile-3f6402479f",
            "legacyIds": [
              "unit-sky-ray-gunship-profile-armoured-hull-melee-5"
            ],
            "title": "Armoured hull",
            "mode": "melee",
            "range": "Melee",
            "a": "3",
            "skill": "5+",
            "s": "6",
            "ap": "0",
            "d": "1",
            "abilities": "",
            "sourceSelectionIds": [
              "unit-sky-ray-gunship-selection-armoured-hull"
            ]
          }
        ],
        "wargearAbilities": [],
        "wargearDefaults": [
          {
            "modelId": "unit-sky-ray-gunship-model-f1d0e2106a",
            "selections": [
              {
                "selectionId": "unit-sky-ray-gunship-selection-seeker-missile-rack",
                "quantity": 1
              },
              {
                "selectionId": "unit-sky-ray-gunship-selection-twin-pulse-carbine",
                "quantity": 2
              },
              {
                "selectionId": "unit-sky-ray-gunship-selection-armoured-hull",
                "quantity": 1
              }
            ]
          }
        ],
        "wargearOptionContracts": [
          {
            "sourceId": "datasheet-sky-ray-gunship:wargear:1",
            "eligibleModelIds": [
              "unit-sky-ray-gunship-model-f1d0e2106a"
            ],
            "limit": {
              "perModel": 1
            },
            "choices": [
              {
                "remove": [
                  {
                    "selectionId": "unit-sky-ray-gunship-selection-twin-pulse-carbine",
                    "quantity": 2
                  }
                ],
                "add": [
                  {
                    "selectionId": "unit-sky-ray-gunship-selection-accelerator-burst-cannon",
                    "quantity": 2
                  }
                ],
                "requiresFinal": [],
                "forbidsFinal": [],
                "sharedUses": []
              },
              {
                "remove": [
                  {
                    "selectionId": "unit-sky-ray-gunship-selection-twin-pulse-carbine",
                    "quantity": 2
                  }
                ],
                "add": [
                  {
                    "selectionId": "unit-sky-ray-gunship-selection-smart-missile-system",
                    "quantity": 2
                  }
                ],
                "requiresFinal": [],
                "forbidsFinal": [],
                "sharedUses": []
              }
            ]
          }
        ],
        "wargearSharedCaps": []
      }
    },
    {
      "id": "unit-stormsurge",
      "title": "Stormsurge",
      "sourceBookId": "tau-empire",
      "sourceLayer": "codex",
      "intrinsicKeywords": [
        "Vehicle",
        "Walker",
        "Titanic",
        "Towering",
        "Stormsurge",
        "T'au Empire"
      ],
      "relations": {
        "canLead": [],
        "canSupport": [],
        "canBeLedBy": [],
        "canBeSupportedBy": []
      },
      "ruleFacts": {
        "relations": {
          "canLead": [],
          "canSupport": [],
          "canBeLedBy": [],
          "canBeSupportedBy": []
        }
      },
      "gameSelections": {
        "stats": {
          "M": "8\"",
          "T": "11",
          "Sv": "2+",
          "W": "20",
          "Ld": "7+",
          "OC": "6",
          "Invulnerable": "4+"
        },
        "statProfiles": [],
        "abilities": [
          {
            "id": "tau-empire-ability-damaged-1-5-wounds-remaining-2",
            "sectionId": "tau-empire-ability-damaged-1-5-wounds-remaining-2",
            "title": "Damaged: 1-5 WOUNDS REMAINING",
            "text": "While this model has 1-5 wounds remaining, subtract 3 from this model’s Objective Control characteristic, and each time this model makes an attack, subtract 1 from the Hit roll.",
            "sourceUnitId": "unit-stormsurge"
          },
          {
            "id": "tau-empire-ability-heavy-walker",
            "sectionId": "tau-empire-ability-heavy-walker",
            "title": "Heavy Walker",
            "text": "Each time this model makes a Normal, Advance or Fall Back move, it can move over models (excluding TITANIC models) and terrain features that are 4\" or less in height as if they were not there.",
            "sourceUnitId": "unit-stormsurge"
          },
          {
            "id": "tau-empire-ability-support-system",
            "sectionId": "tau-empire-ability-support-system",
            "title": "Support System",
            "text": "Each time this model makes a ranged attack, you can ignore any or all modifiers to the Hit roll.",
            "sourceUnitId": "unit-stormsurge"
          },
          {
            "id": "tau-empire-ability-titan-killer",
            "sectionId": "tau-empire-ability-titan-killer",
            "title": "Titan-killer",
            "text": "Each time this model makes a ranged attack that targets a TITANIC or TOWERING unit, you can re-roll the Hit roll.",
            "sourceUnitId": "unit-stormsurge"
          },
          {
            "id": "core-deadly-demise",
            "sectionId": "core-deadly-demise",
            "title": "Deadly Demise D6+2",
            "text": "This ability always takes the form Deadly Demise X. Each time a model in this unit is destroyed, after the units embarked within it (if any) have made their emergency disembark moves, roll one D6. On a 6, that model suffers a deadly demise; each unit within 6\" of that model suffers a number of mortal wounds denoted by X (if this is a random number, roll separately for each unit within 6\"). \n *Example: An Impulsor with a unit of Intercessors embarked within it is destroyed by ranged attacks. First, any unresolved attacks made by the attacking unit are resolved. Then the Intercessors make an emergency disembark move. Then the roll is made for the Deadly Demise ability, and on a 6, that ability is resolved. Finally, the Impulsor is removed from the battlefield.*",
            "sourceUnitId": "unit-stormsurge"
          },
          {
            "id": "tau-empire-ability-for-the-greater-good",
            "sectionId": "tau-empire-ability-for-the-greater-good",
            "title": "For The Greater Good",
            "text": "If your Army Faction is T’AU EMPIRE, at the start of your Shooting phase you can select units from your army with this ability to become Observer units.\n\nDuring your Shooting phase, for each Observer unit from your army that has not been selected to shoot this phase and is eligible to shoot (excluding FORTIFICATION and Battle-shocked units) select one enemy unit that is visible to be marked as their Spotted unit until the end of the phase. Each enemy unit can only be marked as a Spotted unit once per phase.\n\nUnits from your army with the For the Greater Good ability (excluding Observer units) are Guided units while targeting one or more Spotted units.\n\nUntil the end of the phase, each time a model from your army in a Guided unit makes an attack that targets a Spotted unit, improve the Ballistic Skill characteristic of that attack by 1 and, if the Spotted unit was marked by an Observer unit that has the Markerlight keyword, that attack has the [IGNORES COVER] ability.",
            "sourceUnitId": "unit-stormsurge"
          }
        ],
        "models": [
          {
            "id": "unit-stormsurge-model-18acb9068a",
            "title": "Stormsurge",
            "aliases": [
              "Stormsurge"
            ],
            "min": 1,
            "max": 1,
            "legacyIds": [
              "unit-stormsurge-model-stormsurge"
            ]
          }
        ],
        "compositionRules": [],
        "selections": [
          {
            "id": "unit-stormsurge-selection-cluster-rocket-system",
            "title": "Cluster rocket system",
            "aliases": [
              "Cluster rocket system"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-stormsurge-profile-251a96e811"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-stormsurge-selection-destroyer-missiles",
            "title": "Destroyer missiles",
            "aliases": [
              "Destroyer missiles"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-stormsurge-profile-12eb58e87c"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-stormsurge-selection-thunderous-footfalls",
            "title": "Thunderous footfalls",
            "aliases": [
              "Thunderous footfalls"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-stormsurge-profile-022a887ee2"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-stormsurge-selection-twin-smart-missile-system",
            "title": "Twin smart missile system",
            "aliases": [
              "Twin smart missile system"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-stormsurge-profile-c6e8da3de3"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-stormsurge-selection-pulse-driver-cannon",
            "title": "Pulse Driver Cannon",
            "aliases": [
              "Pulse Driver Cannon"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-stormsurge-profile-0107eec64d"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-stormsurge-selection-pulse-blast-cannon-focused",
            "title": "➤ Pulse blast cannon - focused",
            "aliases": [
              "➤ Pulse blast cannon - focused"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-stormsurge-profile-38db323280"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-stormsurge-selection-pulse-blast-cannon-dispersed",
            "title": "➤ Pulse blast cannon - dispersed",
            "aliases": [
              "➤ Pulse blast cannon - dispersed"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-stormsurge-profile-6e2617936f"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-stormsurge-selection-twin-airbursting-fragmentation-projector",
            "title": "Twin airbursting fragmentation projector",
            "aliases": [
              "Twin airbursting fragmentation projector"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-stormsurge-profile-d13c7c9583"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-stormsurge-selection-twin-burst-cannon",
            "title": "Twin burst cannon",
            "aliases": [
              "Twin burst cannon"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-stormsurge-profile-e4390c00d2"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-stormsurge-selection-twin-tau-flamer",
            "title": "Twin T'au flamer",
            "aliases": [
              "Twin T'au flamer"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-stormsurge-profile-208f5b8c90"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-stormsurge-weapon-family-pulse-blast-cannon-selection",
            "title": "➤ Pulse blast cannon",
            "aliases": [
              "➤ Pulse blast cannon"
            ],
            "kind": "weapon",
            "familyId": "unit-stormsurge-weapon-family-pulse-blast-cannon",
            "profileIds": [
              "unit-stormsurge-profile-38db323280",
              "unit-stormsurge-profile-6e2617936f"
            ],
            "wargearAbilityIds": []
          }
        ],
        "weaponFamilies": [
          {
            "id": "unit-stormsurge-weapon-family-pulse-blast-cannon",
            "title": "➤ Pulse blast cannon",
            "aliases": [
              "➤ Pulse blast cannon"
            ],
            "profileIds": [
              "unit-stormsurge-profile-38db323280",
              "unit-stormsurge-profile-6e2617936f"
            ],
            "ambiguousAlias": false
          }
        ],
        "weaponProfiles": [
          {
            "id": "unit-stormsurge-profile-251a96e811",
            "legacyIds": [
              "unit-stormsurge-profile-cluster-rocket-system-ranged"
            ],
            "title": "Cluster rocket system",
            "mode": "ranged",
            "range": "48\"",
            "a": "4D6",
            "skill": "4+",
            "s": "5",
            "ap": "0",
            "d": "1",
            "abilities": "Blast, Heavy",
            "sourceSelectionIds": [
              "unit-stormsurge-selection-cluster-rocket-system"
            ]
          },
          {
            "id": "unit-stormsurge-profile-12eb58e87c",
            "legacyIds": [
              "unit-stormsurge-profile-destroyer-missiles-ranged-2"
            ],
            "title": "Destroyer missiles",
            "mode": "ranged",
            "range": "72\"",
            "a": "1",
            "skill": "4+",
            "s": "16",
            "ap": "-4",
            "d": "D6+2",
            "abilities": "Heavy",
            "sourceSelectionIds": [
              "unit-stormsurge-selection-destroyer-missiles"
            ]
          },
          {
            "id": "unit-stormsurge-profile-022a887ee2",
            "legacyIds": [
              "unit-stormsurge-profile-thunderous-footfalls-melee-3"
            ],
            "title": "Thunderous footfalls",
            "mode": "melee",
            "range": "Melee",
            "a": "3",
            "skill": "5+",
            "s": "8",
            "ap": "-1",
            "d": "2",
            "abilities": "",
            "sourceSelectionIds": [
              "unit-stormsurge-selection-thunderous-footfalls"
            ]
          },
          {
            "id": "unit-stormsurge-profile-c6e8da3de3",
            "legacyIds": [
              "unit-stormsurge-profile-twin-smart-missile-system-ranged-4"
            ],
            "title": "Twin smart missile system",
            "mode": "ranged",
            "range": "30\"",
            "a": "3",
            "skill": "4+",
            "s": "5",
            "ap": "0",
            "d": "1",
            "abilities": "Heavy, Indirect Fire, Twin-Linked",
            "sourceSelectionIds": [
              "unit-stormsurge-selection-twin-smart-missile-system"
            ]
          },
          {
            "id": "unit-stormsurge-profile-0107eec64d",
            "legacyIds": [
              "unit-stormsurge-profile-pulse-driver-cannon-ranged-5"
            ],
            "title": "Pulse Driver Cannon",
            "mode": "ranged",
            "range": "72\"",
            "a": "D6+3",
            "skill": "4+",
            "s": "12",
            "ap": "-3",
            "d": "3",
            "abilities": "Blast, Heavy",
            "sourceSelectionIds": [
              "unit-stormsurge-selection-pulse-driver-cannon"
            ]
          },
          {
            "id": "unit-stormsurge-profile-38db323280",
            "legacyIds": [
              "unit-stormsurge-profile-pulse-blast-cannon-focused-ranged-6"
            ],
            "title": "➤ Pulse blast cannon - focused",
            "mode": "ranged",
            "range": "24\"",
            "a": "2",
            "skill": "4+",
            "s": "24",
            "ap": "-6",
            "d": "12",
            "abilities": "Heavy",
            "sourceSelectionIds": [
              "unit-stormsurge-selection-pulse-blast-cannon-focused",
              "unit-stormsurge-weapon-family-pulse-blast-cannon-selection"
            ]
          },
          {
            "id": "unit-stormsurge-profile-6e2617936f",
            "legacyIds": [
              "unit-stormsurge-profile-pulse-blast-cannon-dispersed-ranged-7"
            ],
            "title": "➤ Pulse blast cannon - dispersed",
            "mode": "ranged",
            "range": "48\"",
            "a": "6",
            "skill": "4+",
            "s": "10",
            "ap": "-2",
            "d": "4",
            "abilities": "Heavy",
            "sourceSelectionIds": [
              "unit-stormsurge-selection-pulse-blast-cannon-dispersed",
              "unit-stormsurge-weapon-family-pulse-blast-cannon-selection"
            ]
          },
          {
            "id": "unit-stormsurge-profile-d13c7c9583",
            "legacyIds": [
              "unit-stormsurge-profile-twin-airbursting-fragmentation-projector-ranged-8"
            ],
            "title": "Twin airbursting fragmentation projector",
            "mode": "ranged",
            "range": "24\"",
            "a": "D6",
            "skill": "4+",
            "s": "3",
            "ap": "0",
            "d": "1",
            "abilities": "Blast, Heavy, Indirect Fire, Twin-linked",
            "sourceSelectionIds": [
              "unit-stormsurge-selection-twin-airbursting-fragmentation-projector"
            ]
          },
          {
            "id": "unit-stormsurge-profile-e4390c00d2",
            "legacyIds": [
              "unit-stormsurge-profile-twin-burst-cannon-ranged-9"
            ],
            "title": "Twin burst cannon",
            "mode": "ranged",
            "range": "18\"",
            "a": "4",
            "skill": "4+",
            "s": "5",
            "ap": "0",
            "d": "1",
            "abilities": "Heavy, Twin-linked",
            "sourceSelectionIds": [
              "unit-stormsurge-selection-twin-burst-cannon"
            ]
          },
          {
            "id": "unit-stormsurge-profile-208f5b8c90",
            "legacyIds": [
              "unit-stormsurge-profile-twin-tau-flamer-ranged-10"
            ],
            "title": "Twin T'au flamer",
            "mode": "ranged",
            "range": "12\"",
            "a": "D6",
            "skill": "N/A",
            "s": "4",
            "ap": "0",
            "d": "1",
            "abilities": "Ignores Cover, Torrent, Twin-linked",
            "sourceSelectionIds": [
              "unit-stormsurge-selection-twin-tau-flamer"
            ]
          }
        ],
        "wargearAbilities": [],
        "wargearDefaults": [
          {
            "modelId": "unit-stormsurge-model-18acb9068a",
            "selections": [
              {
                "selectionId": "unit-stormsurge-selection-cluster-rocket-system",
                "quantity": 1
              },
              {
                "selectionId": "unit-stormsurge-selection-destroyer-missiles",
                "quantity": 1
              },
              {
                "selectionId": "unit-stormsurge-selection-pulse-driver-cannon",
                "quantity": 1
              },
              {
                "selectionId": "unit-stormsurge-selection-twin-smart-missile-system",
                "quantity": 2
              },
              {
                "selectionId": "unit-stormsurge-selection-twin-tau-flamer",
                "quantity": 1
              },
              {
                "selectionId": "unit-stormsurge-selection-thunderous-footfalls",
                "quantity": 1
              }
            ]
          }
        ],
        "wargearOptionContracts": [
          {
            "sourceId": "datasheet-stormsurge:wargear:1",
            "eligibleModelIds": [
              "unit-stormsurge-model-18acb9068a"
            ],
            "limit": {
              "perModel": 1
            },
            "choices": [
              {
                "remove": [
                  {
                    "selectionId": "unit-stormsurge-selection-pulse-driver-cannon",
                    "quantity": 1
                  }
                ],
                "add": [
                  {
                    "selectionId": "unit-stormsurge-weapon-family-pulse-blast-cannon-selection",
                    "quantity": 1
                  }
                ],
                "requiresFinal": [],
                "forbidsFinal": [],
                "sharedUses": []
              }
            ]
          },
          {
            "sourceId": "datasheet-stormsurge:wargear:2",
            "eligibleModelIds": [
              "unit-stormsurge-model-18acb9068a"
            ],
            "limit": {
              "perModel": 1
            },
            "choices": [
              {
                "remove": [
                  {
                    "selectionId": "unit-stormsurge-selection-twin-tau-flamer",
                    "quantity": 1
                  }
                ],
                "add": [
                  {
                    "selectionId": "unit-stormsurge-selection-twin-airbursting-fragmentation-projector",
                    "quantity": 1
                  }
                ],
                "requiresFinal": [],
                "forbidsFinal": [],
                "sharedUses": []
              },
              {
                "remove": [
                  {
                    "selectionId": "unit-stormsurge-selection-twin-tau-flamer",
                    "quantity": 1
                  }
                ],
                "add": [
                  {
                    "selectionId": "unit-stormsurge-selection-twin-burst-cannon",
                    "quantity": 1
                  }
                ],
                "requiresFinal": [],
                "forbidsFinal": [],
                "sharedUses": []
              }
            ]
          }
        ],
        "wargearSharedCaps": []
      }
    },
    {
      "id": "unit-sun-shark-bomber",
      "title": "Sun Shark Bomber",
      "sourceBookId": "tau-empire",
      "sourceLayer": "codex",
      "intrinsicKeywords": [
        "Vehicle",
        "Aircraft",
        "Fly",
        "Frame",
        "Sun Shark Bomber",
        "T'au Empire"
      ],
      "relations": {
        "canLead": [],
        "canSupport": [],
        "canBeLedBy": [],
        "canBeSupportedBy": []
      },
      "ruleFacts": {
        "relations": {
          "canLead": [],
          "canSupport": [],
          "canBeLedBy": [],
          "canBeSupportedBy": []
        }
      },
      "gameSelections": {
        "stats": {
          "M": "-",
          "T": "9",
          "Sv": "3+",
          "W": "12",
          "Ld": "7+",
          "OC": "-",
          "Invulnerable": ""
        },
        "statProfiles": [],
        "abilities": [
          {
            "id": "tau-empire-ability-pulse-bombs",
            "sectionId": "tau-empire-ability-pulse-bombs",
            "title": "Pulse Bombs",
            "text": "At the end of your opponent’s Fight phase, select one visible enemy unit (excluding Lone Operative units) within 24\" of this unit, and roll six D6 for that unit: For each 4+, that unit suffers 1 mortal wound.",
            "sourceUnitId": "unit-sun-shark-bomber"
          },
          {
            "id": "tau-empire-ability-damaged-1-4-wounds-remaining",
            "sectionId": "tau-empire-ability-damaged-1-4-wounds-remaining",
            "title": "Damaged: 1-4 WOUNDS REMAINING",
            "text": "While this model has 1-4 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll.",
            "sourceUnitId": "unit-sun-shark-bomber"
          },
          {
            "id": "core-deadly-demise",
            "sectionId": "core-deadly-demise",
            "title": "Deadly Demise D3",
            "text": "This ability always takes the form Deadly Demise X. Each time a model in this unit is destroyed, after the units embarked within it (if any) have made their emergency disembark moves, roll one D6. On a 6, that model suffers a deadly demise; each unit within 6\" of that model suffers a number of mortal wounds denoted by X (if this is a random number, roll separately for each unit within 6\"). \n *Example: An Impulsor with a unit of Intercessors embarked within it is destroyed by ranged attacks. First, any unresolved attacks made by the attacking unit are resolved. Then the Intercessors make an emergency disembark move. Then the roll is made for the Deadly Demise ability, and on a 6, that ability is resolved. Finally, the Impulsor is removed from the battlefield.*",
            "sourceUnitId": "unit-sun-shark-bomber"
          },
          {
            "id": "tau-empire-ability-for-the-greater-good",
            "sectionId": "tau-empire-ability-for-the-greater-good",
            "title": "For The Greater Good",
            "text": "If your Army Faction is T’AU EMPIRE, at the start of your Shooting phase you can select units from your army with this ability to become Observer units.\n\nDuring your Shooting phase, for each Observer unit from your army that has not been selected to shoot this phase and is eligible to shoot (excluding FORTIFICATION and Battle-shocked units) select one enemy unit that is visible to be marked as their Spotted unit until the end of the phase. Each enemy unit can only be marked as a Spotted unit once per phase.\n\nUnits from your army with the For the Greater Good ability (excluding Observer units) are Guided units while targeting one or more Spotted units.\n\nUntil the end of the phase, each time a model from your army in a Guided unit makes an attack that targets a Spotted unit, improve the Ballistic Skill characteristic of that attack by 1 and, if the Spotted unit was marked by an Observer unit that has the Markerlight keyword, that attack has the [IGNORES COVER] ability.",
            "sourceUnitId": "unit-sun-shark-bomber"
          }
        ],
        "models": [
          {
            "id": "unit-sun-shark-bomber-model-8fb4d071ff",
            "title": "Sun Shark Bomber",
            "aliases": [
              "Sun Shark Bomber"
            ],
            "min": 1,
            "max": 1,
            "legacyIds": [
              "unit-sun-shark-bomber-model-sun-shark-bomber"
            ]
          }
        ],
        "compositionRules": [],
        "selections": [
          {
            "id": "unit-sun-shark-bomber-selection-twin-ion-rifle-standard",
            "title": "➤ Twin ion rifle - standard",
            "aliases": [
              "➤ Twin ion rifle - standard"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-sun-shark-bomber-profile-a2fefbb1af"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-sun-shark-bomber-selection-twin-ion-rifle-overcharge",
            "title": "➤ Twin ion rifle - overcharge",
            "aliases": [
              "➤ Twin ion rifle - overcharge"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-sun-shark-bomber-profile-87aee6027c"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-sun-shark-bomber-selection-twin-missile-pod",
            "title": "Twin missile pod",
            "aliases": [
              "Twin missile pod"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-sun-shark-bomber-profile-6651223cd5"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-sun-shark-bomber-selection-missile-pod",
            "title": "Missile pod",
            "aliases": [
              "Missile pod"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-sun-shark-bomber-profile-fdcca74aab"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-sun-shark-bomber-selection-seeker-missile",
            "title": "Seeker missile",
            "aliases": [
              "Seeker missile"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-sun-shark-bomber-profile-351bd7e3c7"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-sun-shark-bomber-selection-armoured-hull",
            "title": "Armoured hull",
            "aliases": [
              "Armoured hull"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-sun-shark-bomber-profile-3f6402479f"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-sun-shark-bomber-weapon-family-twin-ion-rifle-selection",
            "title": "➤ Twin ion rifle",
            "aliases": [
              "➤ Twin ion rifle"
            ],
            "kind": "weapon",
            "familyId": "unit-sun-shark-bomber-weapon-family-twin-ion-rifle",
            "profileIds": [
              "unit-sun-shark-bomber-profile-a2fefbb1af",
              "unit-sun-shark-bomber-profile-87aee6027c"
            ],
            "wargearAbilityIds": []
          }
        ],
        "weaponFamilies": [
          {
            "id": "unit-sun-shark-bomber-weapon-family-twin-ion-rifle",
            "title": "➤ Twin ion rifle",
            "aliases": [
              "➤ Twin ion rifle"
            ],
            "profileIds": [
              "unit-sun-shark-bomber-profile-a2fefbb1af",
              "unit-sun-shark-bomber-profile-87aee6027c"
            ],
            "ambiguousAlias": false
          }
        ],
        "weaponProfiles": [
          {
            "id": "unit-sun-shark-bomber-profile-a2fefbb1af",
            "legacyIds": [
              "unit-sun-shark-bomber-profile-twin-ion-rifle-standard-ranged"
            ],
            "title": "➤ Twin ion rifle - standard",
            "mode": "ranged",
            "range": "30\"",
            "a": "3",
            "skill": "4+",
            "s": "7",
            "ap": "-1",
            "d": "1",
            "abilities": "Twin-linked",
            "sourceSelectionIds": [
              "unit-sun-shark-bomber-selection-twin-ion-rifle-standard",
              "unit-sun-shark-bomber-weapon-family-twin-ion-rifle-selection"
            ]
          },
          {
            "id": "unit-sun-shark-bomber-profile-87aee6027c",
            "legacyIds": [
              "unit-sun-shark-bomber-profile-twin-ion-rifle-overcharge-ranged-2"
            ],
            "title": "➤ Twin ion rifle - overcharge",
            "mode": "ranged",
            "range": "30\"",
            "a": "3",
            "skill": "4+",
            "s": "8",
            "ap": "-2",
            "d": "2",
            "abilities": "Hazardous, Twin-linked",
            "sourceSelectionIds": [
              "unit-sun-shark-bomber-selection-twin-ion-rifle-overcharge",
              "unit-sun-shark-bomber-weapon-family-twin-ion-rifle-selection"
            ]
          },
          {
            "id": "unit-sun-shark-bomber-profile-6651223cd5",
            "legacyIds": [
              "unit-sun-shark-bomber-profile-twin-missile-pod-ranged-3"
            ],
            "title": "Twin missile pod",
            "mode": "ranged",
            "range": "30\"",
            "a": "2",
            "skill": "4+",
            "s": "7",
            "ap": "-1",
            "d": "2",
            "abilities": "Twin-linked",
            "sourceSelectionIds": [
              "unit-sun-shark-bomber-selection-twin-missile-pod"
            ]
          },
          {
            "id": "unit-sun-shark-bomber-profile-fdcca74aab",
            "legacyIds": [
              "unit-sun-shark-bomber-profile-missile-pod-ranged-4"
            ],
            "title": "Missile pod",
            "mode": "ranged",
            "range": "30\"",
            "a": "2",
            "skill": "4+",
            "s": "7",
            "ap": "-1",
            "d": "2",
            "abilities": "",
            "sourceSelectionIds": [
              "unit-sun-shark-bomber-selection-missile-pod"
            ]
          },
          {
            "id": "unit-sun-shark-bomber-profile-351bd7e3c7",
            "legacyIds": [
              "unit-sun-shark-bomber-profile-seeker-missile-ranged-5"
            ],
            "title": "Seeker missile",
            "mode": "ranged",
            "range": "48\"",
            "a": "1",
            "skill": "4+",
            "s": "14",
            "ap": "-3",
            "d": "D6+1",
            "abilities": "One Shot",
            "sourceSelectionIds": [
              "unit-sun-shark-bomber-selection-seeker-missile"
            ]
          },
          {
            "id": "unit-sun-shark-bomber-profile-3f6402479f",
            "legacyIds": [
              "unit-sun-shark-bomber-profile-armoured-hull-melee-6"
            ],
            "title": "Armoured hull",
            "mode": "melee",
            "range": "Melee",
            "a": "3",
            "skill": "5+",
            "s": "6",
            "ap": "0",
            "d": "1",
            "abilities": "",
            "sourceSelectionIds": [
              "unit-sun-shark-bomber-selection-armoured-hull"
            ]
          }
        ],
        "wargearAbilities": [],
        "wargearDefaults": [
          {
            "modelId": "unit-sun-shark-bomber-model-8fb4d071ff",
            "selections": [
              {
                "selectionId": "unit-sun-shark-bomber-selection-missile-pod",
                "quantity": 1
              },
              {
                "selectionId": "unit-sun-shark-bomber-selection-seeker-missile",
                "quantity": 2
              },
              {
                "selectionId": "unit-sun-shark-bomber-weapon-family-twin-ion-rifle-selection",
                "quantity": 2
              },
              {
                "selectionId": "unit-sun-shark-bomber-selection-armoured-hull",
                "quantity": 1
              }
            ]
          }
        ],
        "wargearOptionContracts": [
          {
            "sourceId": "datasheet-sun-shark-bomber:wargear:1",
            "eligibleModelIds": [
              "unit-sun-shark-bomber-model-8fb4d071ff"
            ],
            "limit": {
              "perModel": 1
            },
            "choices": [
              {
                "remove": [
                  {
                    "selectionId": "unit-sun-shark-bomber-selection-missile-pod",
                    "quantity": 1
                  }
                ],
                "add": [
                  {
                    "selectionId": "unit-sun-shark-bomber-selection-twin-missile-pod",
                    "quantity": 1
                  }
                ],
                "requiresFinal": [],
                "forbidsFinal": [],
                "sharedUses": []
              }
            ]
          }
        ],
        "wargearSharedCaps": []
      }
    },
    {
      "id": "unit-tidewall-droneport",
      "title": "Tidewall Droneport",
      "sourceBookId": "tau-empire",
      "sourceLayer": "codex",
      "intrinsicKeywords": [
        "Fortification",
        "Vehicle",
        "Transport",
        "Fly",
        "Frame",
        "Tidewall Droneport",
        "T'au Empire"
      ],
      "relations": {
        "canLead": [],
        "canSupport": [],
        "canBeLedBy": [],
        "canBeSupportedBy": []
      },
      "ruleFacts": {
        "relations": {
          "canLead": [],
          "canSupport": [],
          "canBeLedBy": [],
          "canBeSupportedBy": []
        }
      },
      "gameSelections": {
        "stats": {
          "M": "4\"",
          "T": "8",
          "Sv": "3+",
          "W": "10",
          "Ld": "7+",
          "OC": "0",
          "Invulnerable": ""
        },
        "statProfiles": [],
        "abilities": [
          {
            "id": "tau-empire-ability-droneport",
            "sectionId": "tau-empire-ability-droneport",
            "title": "Droneport",
            "text": "Each time this FORTIFICATION is selected to shoot, its drone defender’s weapon will target and resolve attacks against every enemy unit that is an eligible target to this FORTIFICATION.",
            "sourceUnitId": "unit-tidewall-droneport"
          },
          {
            "id": "tau-empire-ability-fortification",
            "sectionId": "tau-empire-ability-fortification",
            "title": "Fortification",
            "text": "While an enemy unit is only within Engagement Range of one or more FORTIFICATIONS from your army:\n- That unit can still be selected as the target of ranged attacks, but each time such an attack is made, unless it is made with a Pistol, subtract 1 from the Hit roll.\n- Models in that unit do not need to take Desperate Escape tests due to Falling Back while Battle-shocked, except for those that will move over enemy models when doing so.",
            "sourceUnitId": "unit-tidewall-droneport"
          },
          {
            "id": "tau-empire-ability-tidewall-cover",
            "sectionId": "tau-empire-ability-tidewall-cover",
            "title": "Tidewall Cover",
            "text": "Each time a ranged attack is allocated to a model, if that model is not fully visible to every model in the attacking unit because of this Fortification, that model has the Benefit of Cover against that attack.",
            "sourceUnitId": "unit-tidewall-droneport"
          },
          {
            "id": "core-deadly-demise",
            "sectionId": "core-deadly-demise",
            "title": "Deadly Demise D3",
            "text": "This ability always takes the form Deadly Demise X. Each time a model in this unit is destroyed, after the units embarked within it (if any) have made their emergency disembark moves, roll one D6. On a 6, that model suffers a deadly demise; each unit within 6\" of that model suffers a number of mortal wounds denoted by X (if this is a random number, roll separately for each unit within 6\"). \n *Example: An Impulsor with a unit of Intercessors embarked within it is destroyed by ranged attacks. First, any unresolved attacks made by the attacking unit are resolved. Then the Intercessors make an emergency disembark move. Then the roll is made for the Deadly Demise ability, and on a 6, that ability is resolved. Finally, the Impulsor is removed from the battlefield.*",
            "sourceUnitId": "unit-tidewall-droneport"
          },
          {
            "id": "core-firing-deck",
            "sectionId": "core-firing-deck",
            "title": "Firing Deck 11",
            "text": "This ability always takes the form Firing Deck X. In your Shooting phase, each time this TRANSPORT is selected to shoot, if one or more units are embarked within it, resolve the following sequence: \n1. Select up to X models embarked within this TRANSPORT (excluding models whose units have already been selected to shoot this phase). \n2. For each selected model, select one of its ranged weapons (excluding [ONE SHOT] weapons). \n3. Until this TRANSPORT has resolved all of its attacks, it has all of those selected weapons in addition to its other weapons. \n4. Until the end of the turn, units embarked within this TRANSPORT are not eligible to shoot.",
            "sourceUnitId": "unit-tidewall-droneport"
          }
        ],
        "models": [
          {
            "id": "unit-tidewall-droneport-model-0ea2f0d98c",
            "title": "Tidewall Droneport",
            "aliases": [
              "Tidewall Droneport"
            ],
            "min": 1,
            "max": 1,
            "legacyIds": [
              "unit-tidewall-droneport-model-tidewall-droneport"
            ]
          }
        ],
        "compositionRules": [],
        "selections": [
          {
            "id": "unit-tidewall-droneport-selection-drone-defenders",
            "title": "Drone defenders",
            "aliases": [
              "Drone defenders"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-tidewall-droneport-profile-fd6f063090"
            ],
            "wargearAbilityIds": []
          }
        ],
        "weaponFamilies": [],
        "weaponProfiles": [
          {
            "id": "unit-tidewall-droneport-profile-fd6f063090",
            "legacyIds": [
              "unit-tidewall-droneport-profile-drone-defenders-ranged"
            ],
            "title": "Drone defenders",
            "mode": "ranged",
            "range": "20\"",
            "a": "8",
            "skill": "5+",
            "s": "5",
            "ap": "0",
            "d": "1",
            "abilities": "Assault, Twin-linked",
            "sourceSelectionIds": [
              "unit-tidewall-droneport-selection-drone-defenders"
            ]
          }
        ],
        "wargearAbilities": [],
        "wargearDefaults": [
          {
            "modelId": "unit-tidewall-droneport-model-0ea2f0d98c",
            "selections": [
              {
                "selectionId": "unit-tidewall-droneport-selection-drone-defenders",
                "quantity": 1
              }
            ]
          }
        ],
        "wargearOptionContracts": [],
        "wargearSharedCaps": [],
        "wargearDeclarations": [
          {
            "sourceRuleId": "datasheet-tidewall-droneport:wargear:1",
            "kind": "NO_SELECTABLE_OPTION"
          }
        ]
      }
    },
    {
      "id": "unit-tidewall-gunrig",
      "title": "Tidewall Gunrig",
      "sourceBookId": "tau-empire",
      "sourceLayer": "codex",
      "intrinsicKeywords": [
        "Fortification",
        "Vehicle",
        "Transport",
        "Fly",
        "Frame",
        "Tidewall Gunrig",
        "T'au Empire"
      ],
      "relations": {
        "canLead": [],
        "canSupport": [],
        "canBeLedBy": [],
        "canBeSupportedBy": []
      },
      "ruleFacts": {
        "relations": {
          "canLead": [],
          "canSupport": [],
          "canBeLedBy": [],
          "canBeSupportedBy": []
        }
      },
      "gameSelections": {
        "stats": {
          "M": "4\"",
          "T": "8",
          "Sv": "3+",
          "W": "14",
          "Ld": "7+",
          "OC": "0",
          "Invulnerable": ""
        },
        "statProfiles": [],
        "abilities": [
          {
            "id": "tau-empire-ability-fortification",
            "sectionId": "tau-empire-ability-fortification",
            "title": "Fortification",
            "text": "While an enemy unit is only within Engagement Range of one or more FORTIFICATIONS from your army:\n- That unit can still be selected as the target of ranged attacks, but each time such an attack is made, unless it is made with a Pistol, subtract 1 from the Hit roll.\n- Models in that unit do not need to take Desperate Escape tests due to Falling Back while Battle-shocked, except for those that will move over enemy models when doing so.",
            "sourceUnitId": "unit-tidewall-gunrig"
          },
          {
            "id": "tau-empire-ability-tidewall-cover-2",
            "sectionId": "tau-empire-ability-tidewall-cover-2",
            "title": "Tidewall Cover",
            "text": "Each time a ranged attack is allocated to a model, if that model is not fully visible to every model in the attacking unit because of this FORTIFICATION, that model has the Benefit of Cover against that attack.",
            "sourceUnitId": "unit-tidewall-gunrig"
          },
          {
            "id": "core-firing-deck",
            "sectionId": "core-firing-deck",
            "title": "Firing Deck 11",
            "text": "This ability always takes the form Firing Deck X. In your Shooting phase, each time this TRANSPORT is selected to shoot, if one or more units are embarked within it, resolve the following sequence: \n1. Select up to X models embarked within this TRANSPORT (excluding models whose units have already been selected to shoot this phase). \n2. For each selected model, select one of its ranged weapons (excluding [ONE SHOT] weapons). \n3. Until this TRANSPORT has resolved all of its attacks, it has all of those selected weapons in addition to its other weapons. \n4. Until the end of the turn, units embarked within this TRANSPORT are not eligible to shoot.",
            "sourceUnitId": "unit-tidewall-gunrig"
          },
          {
            "id": "core-deadly-demise",
            "sectionId": "core-deadly-demise",
            "title": "Deadly Demise D3",
            "text": "This ability always takes the form Deadly Demise X. Each time a model in this unit is destroyed, after the units embarked within it (if any) have made their emergency disembark moves, roll one D6. On a 6, that model suffers a deadly demise; each unit within 6\" of that model suffers a number of mortal wounds denoted by X (if this is a random number, roll separately for each unit within 6\"). \n *Example: An Impulsor with a unit of Intercessors embarked within it is destroyed by ranged attacks. First, any unresolved attacks made by the attacking unit are resolved. Then the Intercessors make an emergency disembark move. Then the roll is made for the Deadly Demise ability, and on a 6, that ability is resolved. Finally, the Impulsor is removed from the battlefield.*",
            "sourceUnitId": "unit-tidewall-gunrig"
          }
        ],
        "models": [
          {
            "id": "unit-tidewall-gunrig-model-59c91f2d46",
            "title": "Tidewall Gunrig",
            "aliases": [
              "Tidewall Gunrig"
            ],
            "min": 1,
            "max": 1,
            "legacyIds": [
              "unit-tidewall-gunrig-model-tidewall-gunrig"
            ]
          }
        ],
        "compositionRules": [],
        "selections": [
          {
            "id": "unit-tidewall-gunrig-selection-supremacy-railgun",
            "title": "Supremacy railgun",
            "aliases": [
              "Supremacy railgun"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-tidewall-gunrig-profile-5bcb938cb6"
            ],
            "wargearAbilityIds": []
          }
        ],
        "weaponFamilies": [],
        "weaponProfiles": [
          {
            "id": "unit-tidewall-gunrig-profile-5bcb938cb6",
            "legacyIds": [
              "unit-tidewall-gunrig-profile-supremacy-railgun-ranged"
            ],
            "title": "Supremacy railgun",
            "mode": "ranged",
            "range": "72\"",
            "a": "1",
            "skill": "5+",
            "s": "20",
            "ap": "-5",
            "d": "D6+6",
            "abilities": "Devastating Wounds, Twin-linked",
            "sourceSelectionIds": [
              "unit-tidewall-gunrig-selection-supremacy-railgun"
            ]
          }
        ],
        "wargearAbilities": [],
        "wargearDefaults": [
          {
            "modelId": "unit-tidewall-gunrig-model-59c91f2d46",
            "selections": [
              {
                "selectionId": "unit-tidewall-gunrig-selection-supremacy-railgun",
                "quantity": 1
              }
            ]
          }
        ],
        "wargearOptionContracts": [],
        "wargearSharedCaps": [],
        "wargearDeclarations": [
          {
            "sourceRuleId": "datasheet-tidewall-gunrig:wargear:1",
            "kind": "NO_SELECTABLE_OPTION"
          }
        ]
      }
    },
    {
      "id": "unit-tidewall-shieldline",
      "title": "Tidewall Shieldline",
      "sourceBookId": "tau-empire",
      "sourceLayer": "codex",
      "intrinsicKeywords": [
        "Fortification",
        "Vehicle",
        "Transport",
        "Frame",
        "Fly",
        "Tidewall Shieldline",
        "T'au Empire"
      ],
      "relations": {
        "canLead": [],
        "canSupport": [],
        "canBeLedBy": [],
        "canBeSupportedBy": []
      },
      "ruleFacts": {
        "relations": {
          "canLead": [],
          "canSupport": [],
          "canBeLedBy": [],
          "canBeSupportedBy": []
        }
      },
      "gameSelections": {
        "stats": {
          "M": "4\"",
          "T": "8",
          "Sv": "3+",
          "W": "10",
          "Ld": "7+",
          "OC": "0",
          "Invulnerable": "5+"
        },
        "statProfiles": [],
        "abilities": [
          {
            "id": "tau-empire-ability-fortification",
            "sectionId": "tau-empire-ability-fortification",
            "title": "Fortification",
            "text": "While an enemy unit is only within Engagement Range of one or more FORTIFICATIONS from your army:\n- That unit can still be selected as the target of ranged attacks, but each time such an attack is made, unless it is made with a Pistol, subtract 1 from the Hit roll.\n- Models in that unit do not need to take Desperate Escape tests due to Falling Back while Battle-shocked, except for those that will move over enemy models when doing so.",
            "sourceUnitId": "unit-tidewall-shieldline"
          },
          {
            "id": "tau-empire-ability-tidewall-cover-2",
            "sectionId": "tau-empire-ability-tidewall-cover-2",
            "title": "Tidewall Cover",
            "text": "Each time a ranged attack is allocated to a model, if that model is not fully visible to every model in the attacking unit because of this FORTIFICATION, that model has the Benefit of Cover against that attack.",
            "sourceUnitId": "unit-tidewall-shieldline"
          },
          {
            "id": "core-deadly-demise",
            "sectionId": "core-deadly-demise",
            "title": "Deadly Demise D3",
            "text": "This ability always takes the form Deadly Demise X. Each time a model in this unit is destroyed, after the units embarked within it (if any) have made their emergency disembark moves, roll one D6. On a 6, that model suffers a deadly demise; each unit within 6\" of that model suffers a number of mortal wounds denoted by X (if this is a random number, roll separately for each unit within 6\"). \n *Example: An Impulsor with a unit of Intercessors embarked within it is destroyed by ranged attacks. First, any unresolved attacks made by the attacking unit are resolved. Then the Intercessors make an emergency disembark move. Then the roll is made for the Deadly Demise ability, and on a 6, that ability is resolved. Finally, the Impulsor is removed from the battlefield.*",
            "sourceUnitId": "unit-tidewall-shieldline"
          },
          {
            "id": "core-firing-deck",
            "sectionId": "core-firing-deck",
            "title": "Firing Deck 20",
            "text": "This ability always takes the form Firing Deck X. In your Shooting phase, each time this TRANSPORT is selected to shoot, if one or more units are embarked within it, resolve the following sequence: \n1. Select up to X models embarked within this TRANSPORT (excluding models whose units have already been selected to shoot this phase). \n2. For each selected model, select one of its ranged weapons (excluding [ONE SHOT] weapons). \n3. Until this TRANSPORT has resolved all of its attacks, it has all of those selected weapons in addition to its other weapons. \n4. Until the end of the turn, units embarked within this TRANSPORT are not eligible to shoot.",
            "sourceUnitId": "unit-tidewall-shieldline"
          }
        ],
        "models": [
          {
            "id": "unit-tidewall-shieldline-model-171f4bf463",
            "title": "Tidewall Shieldline",
            "aliases": [
              "Tidewall Shieldline"
            ],
            "min": 1,
            "max": 1,
            "legacyIds": [
              "unit-tidewall-shieldline-model-tidewall-shieldline"
            ]
          }
        ],
        "compositionRules": [],
        "selections": [
          {
            "id": "unit-tidewall-shieldline-selection-tidewall-defence-platform",
            "title": "Tidewall Defence Platform",
            "aliases": [
              "Tidewall Defence Platform"
            ],
            "kind": "wargear",
            "profileIds": [],
            "wargearAbilityIds": [
              "unit-tidewall-shieldline-wargear-ability-44f6788bd4"
            ]
          }
        ],
        "weaponFamilies": [],
        "weaponProfiles": [],
        "wargearAbilities": [
          {
            "id": "unit-tidewall-shieldline-wargear-ability-44f6788bd4",
            "sectionId": "unit-tidewall-shieldline-wargear-ability-44f6788bd4",
            "title": "Tidewall Defence Platform",
            "text": "If equipped with a Tidewall defence platform, this FORTIFICATION has a Wounds characteristic of 15.",
            "sourceUnitId": "unit-tidewall-shieldline",
            "legacyIds": [
              "unit-tidewall-shieldline-wargear-ability-tidewall-defence-platform"
            ],
            "requiredSelectionIds": [
              "unit-tidewall-shieldline-selection-tidewall-defence-platform"
            ]
          }
        ],
        "wargearDefaults": [
          {
            "modelId": "unit-tidewall-shieldline-model-171f4bf463",
            "selections": []
          }
        ],
        "wargearOptionContracts": [
          {
            "sourceId": "datasheet-tidewall-shieldline:wargear:1",
            "eligibleModelIds": [
              "unit-tidewall-shieldline-model-171f4bf463"
            ],
            "limit": {
              "perModel": 1
            },
            "choices": [
              {
                "remove": [],
                "add": [
                  {
                    "selectionId": "unit-tidewall-shieldline-selection-tidewall-defence-platform",
                    "quantity": 1
                  }
                ],
                "requiresFinal": [],
                "forbidsFinal": [],
                "sharedUses": []
              }
            ]
          }
        ],
        "wargearSharedCaps": []
      }
    },
    {
      "id": "unit-ax-1-0-tiger-shark",
      "title": "AX-1-0 Tiger Shark",
      "sourceBookId": "tau-empire",
      "sourceLayer": "imperial-armour",
      "intrinsicKeywords": [
        "Vehicle",
        "Aircraft",
        "Fly",
        "Ax-1-0 Tiger Shark",
        "T'au Empire"
      ],
      "relations": {
        "canLead": [],
        "canSupport": [],
        "canBeLedBy": [],
        "canBeSupportedBy": []
      },
      "ruleFacts": {
        "relations": {
          "canLead": [],
          "canSupport": [],
          "canBeLedBy": [],
          "canBeSupportedBy": []
        }
      },
      "gameSelections": {
        "stats": {
          "M": "-",
          "T": "11",
          "Sv": "3+",
          "W": "18",
          "Ld": "7+",
          "OC": "-",
          "Invulnerable": "5+"
        },
        "statProfiles": [],
        "abilities": [
          {
            "id": "tau-empire-ability-titan-hunter",
            "sectionId": "tau-empire-ability-titan-hunter",
            "title": "Titan Hunter",
            "text": "This model’s twin heavy rail cannon and seeker missiles have the [ANTI-TITANIC 3+] ability while targeting a unit within half range.",
            "sourceUnitId": "unit-ax-1-0-tiger-shark"
          },
          {
            "id": "tau-empire-ability-damaged-1-6-wounds-remaining",
            "sectionId": "tau-empire-ability-damaged-1-6-wounds-remaining",
            "title": "Damaged: 1-6 WOUNDS REMAINING",
            "text": "While this model has 1-6 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll.",
            "sourceUnitId": "unit-ax-1-0-tiger-shark"
          },
          {
            "id": "core-deadly-demise",
            "sectionId": "core-deadly-demise",
            "title": "Deadly Demise D6+2",
            "text": "This ability always takes the form Deadly Demise X. Each time a model in this unit is destroyed, after the units embarked within it (if any) have made their emergency disembark moves, roll one D6. On a 6, that model suffers a deadly demise; each unit within 6\" of that model suffers a number of mortal wounds denoted by X (if this is a random number, roll separately for each unit within 6\"). \n *Example: An Impulsor with a unit of Intercessors embarked within it is destroyed by ranged attacks. First, any unresolved attacks made by the attacking unit are resolved. Then the Intercessors make an emergency disembark move. Then the roll is made for the Deadly Demise ability, and on a 6, that ability is resolved. Finally, the Impulsor is removed from the battlefield.*",
            "sourceUnitId": "unit-ax-1-0-tiger-shark"
          },
          {
            "id": "tau-empire-ability-for-the-greater-good",
            "sectionId": "tau-empire-ability-for-the-greater-good",
            "title": "For The Greater Good",
            "text": "If your Army Faction is T’AU EMPIRE, at the start of your Shooting phase you can select units from your army with this ability to become Observer units.\n\nDuring your Shooting phase, for each Observer unit from your army that has not been selected to shoot this phase and is eligible to shoot (excluding FORTIFICATION and Battle-shocked units) select one enemy unit that is visible to be marked as their Spotted unit until the end of the phase. Each enemy unit can only be marked as a Spotted unit once per phase.\n\nUnits from your army with the For the Greater Good ability (excluding Observer units) are Guided units while targeting one or more Spotted units.\n\nUntil the end of the phase, each time a model from your army in a Guided unit makes an attack that targets a Spotted unit, improve the Ballistic Skill characteristic of that attack by 1 and, if the Spotted unit was marked by an Observer unit that has the Markerlight keyword, that attack has the [IGNORES COVER] ability.",
            "sourceUnitId": "unit-ax-1-0-tiger-shark"
          }
        ],
        "models": [
          {
            "id": "unit-ax-1-0-tiger-shark-model-552ec001af",
            "title": "AX-1-0 Tiger Shark",
            "aliases": [
              "AX-1-0 Tiger Shark"
            ],
            "min": 1,
            "max": 1,
            "legacyIds": [
              "unit-ax-1-0-tiger-shark-model-ax-1-0-tiger-shark"
            ]
          }
        ],
        "compositionRules": [],
        "selections": [
          {
            "id": "unit-ax-1-0-tiger-shark-selection-burst-cannon",
            "title": "Burst cannon",
            "aliases": [
              "Burst cannon"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-ax-1-0-tiger-shark-profile-d19f6a34f8"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-ax-1-0-tiger-shark-selection-cyclic-ion-blaster-standard",
            "title": "Cyclic ion blaster – standard",
            "aliases": [
              "Cyclic ion blaster – standard"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-ax-1-0-tiger-shark-profile-624c989b1b"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-ax-1-0-tiger-shark-selection-cyclic-ion-blaster-overcharge",
            "title": "Cyclic ion blaster – overcharge",
            "aliases": [
              "Cyclic ion blaster – overcharge"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-ax-1-0-tiger-shark-profile-e64cd12032"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-ax-1-0-tiger-shark-selection-missile-pod",
            "title": "Missile pod",
            "aliases": [
              "Missile pod"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-ax-1-0-tiger-shark-profile-fdcca74aab"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-ax-1-0-tiger-shark-selection-seeker-missile",
            "title": "Seeker missile",
            "aliases": [
              "Seeker missile"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-ax-1-0-tiger-shark-profile-351bd7e3c7"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-ax-1-0-tiger-shark-selection-twin-heavy-rail-cannon",
            "title": "Twin heavy rail cannon",
            "aliases": [
              "Twin heavy rail cannon"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-ax-1-0-tiger-shark-profile-f0813020e7"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-ax-1-0-tiger-shark-selection-armoured-hull",
            "title": "Armoured hull",
            "aliases": [
              "Armoured hull"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-ax-1-0-tiger-shark-profile-3f6402479f"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-ax-1-0-tiger-shark-weapon-family-cyclic-ion-blaster-selection",
            "title": "Cyclic ion blaster",
            "aliases": [
              "Cyclic ion blaster"
            ],
            "kind": "weapon",
            "familyId": "unit-ax-1-0-tiger-shark-weapon-family-cyclic-ion-blaster",
            "profileIds": [
              "unit-ax-1-0-tiger-shark-profile-624c989b1b",
              "unit-ax-1-0-tiger-shark-profile-e64cd12032"
            ],
            "wargearAbilityIds": []
          }
        ],
        "weaponFamilies": [
          {
            "id": "unit-ax-1-0-tiger-shark-weapon-family-cyclic-ion-blaster",
            "title": "Cyclic ion blaster",
            "aliases": [
              "Cyclic ion blaster"
            ],
            "profileIds": [
              "unit-ax-1-0-tiger-shark-profile-624c989b1b",
              "unit-ax-1-0-tiger-shark-profile-e64cd12032"
            ],
            "ambiguousAlias": false
          }
        ],
        "weaponProfiles": [
          {
            "id": "unit-ax-1-0-tiger-shark-profile-d19f6a34f8",
            "legacyIds": [
              "unit-ax-1-0-tiger-shark-profile-burst-cannon-ranged"
            ],
            "title": "Burst cannon",
            "mode": "ranged",
            "range": "18\"",
            "a": "4",
            "skill": "4+",
            "s": "5",
            "ap": "0",
            "d": "1",
            "abilities": "",
            "sourceSelectionIds": [
              "unit-ax-1-0-tiger-shark-selection-burst-cannon"
            ]
          },
          {
            "id": "unit-ax-1-0-tiger-shark-profile-624c989b1b",
            "legacyIds": [
              "unit-ax-1-0-tiger-shark-profile-cyclic-ion-blaster-standard-ranged-2"
            ],
            "title": "Cyclic ion blaster – standard",
            "mode": "ranged",
            "range": "18\"",
            "a": "3",
            "skill": "4+",
            "s": "7",
            "ap": "-1",
            "d": "1",
            "abilities": "",
            "sourceSelectionIds": [
              "unit-ax-1-0-tiger-shark-selection-cyclic-ion-blaster-standard",
              "unit-ax-1-0-tiger-shark-weapon-family-cyclic-ion-blaster-selection"
            ]
          },
          {
            "id": "unit-ax-1-0-tiger-shark-profile-e64cd12032",
            "legacyIds": [
              "unit-ax-1-0-tiger-shark-profile-cyclic-ion-blaster-overcharge-ranged-3"
            ],
            "title": "Cyclic ion blaster – overcharge",
            "mode": "ranged",
            "range": "18\"",
            "a": "3",
            "skill": "4+",
            "s": "8",
            "ap": "-2",
            "d": "2",
            "abilities": "Hazardous",
            "sourceSelectionIds": [
              "unit-ax-1-0-tiger-shark-selection-cyclic-ion-blaster-overcharge",
              "unit-ax-1-0-tiger-shark-weapon-family-cyclic-ion-blaster-selection"
            ]
          },
          {
            "id": "unit-ax-1-0-tiger-shark-profile-fdcca74aab",
            "legacyIds": [
              "unit-ax-1-0-tiger-shark-profile-missile-pod-ranged-4"
            ],
            "title": "Missile pod",
            "mode": "ranged",
            "range": "30\"",
            "a": "2",
            "skill": "4+",
            "s": "7",
            "ap": "-1",
            "d": "2",
            "abilities": "",
            "sourceSelectionIds": [
              "unit-ax-1-0-tiger-shark-selection-missile-pod"
            ]
          },
          {
            "id": "unit-ax-1-0-tiger-shark-profile-351bd7e3c7",
            "legacyIds": [
              "unit-ax-1-0-tiger-shark-profile-seeker-missile-ranged-5"
            ],
            "title": "Seeker missile",
            "mode": "ranged",
            "range": "48\"",
            "a": "1",
            "skill": "4+",
            "s": "14",
            "ap": "-3",
            "d": "D6+1",
            "abilities": "One Shot",
            "sourceSelectionIds": [
              "unit-ax-1-0-tiger-shark-selection-seeker-missile"
            ]
          },
          {
            "id": "unit-ax-1-0-tiger-shark-profile-f0813020e7",
            "legacyIds": [
              "unit-ax-1-0-tiger-shark-profile-twin-heavy-rail-cannon-ranged-6"
            ],
            "title": "Twin heavy rail cannon",
            "mode": "ranged",
            "range": "120\"",
            "a": "1",
            "skill": "4+",
            "s": "26",
            "ap": "-5",
            "d": "12",
            "abilities": "Devastating Wounds, Twin-Linked",
            "sourceSelectionIds": [
              "unit-ax-1-0-tiger-shark-selection-twin-heavy-rail-cannon"
            ]
          },
          {
            "id": "unit-ax-1-0-tiger-shark-profile-3f6402479f",
            "legacyIds": [
              "unit-ax-1-0-tiger-shark-profile-armoured-hull-melee-7"
            ],
            "title": "Armoured hull",
            "mode": "melee",
            "range": "Melee",
            "a": "3",
            "skill": "5+",
            "s": "6",
            "ap": "0",
            "d": "1",
            "abilities": "",
            "sourceSelectionIds": [
              "unit-ax-1-0-tiger-shark-selection-armoured-hull"
            ]
          }
        ],
        "wargearAbilities": [],
        "wargearDefaults": [
          {
            "modelId": "unit-ax-1-0-tiger-shark-model-552ec001af",
            "selections": [
              {
                "selectionId": "unit-ax-1-0-tiger-shark-selection-burst-cannon",
                "quantity": 2
              },
              {
                "selectionId": "unit-ax-1-0-tiger-shark-selection-missile-pod",
                "quantity": 2
              },
              {
                "selectionId": "unit-ax-1-0-tiger-shark-selection-twin-heavy-rail-cannon",
                "quantity": 1
              },
              {
                "selectionId": "unit-ax-1-0-tiger-shark-selection-armoured-hull",
                "quantity": 1
              }
            ]
          }
        ],
        "wargearOptionContracts": [
          {
            "sourceId": "datasheet-ax-1-0-tiger-shark:wargear:1",
            "eligibleModelIds": [
              "unit-ax-1-0-tiger-shark-model-552ec001af"
            ],
            "limit": {
              "perModel": 6
            },
            "choices": [
              {
                "remove": [],
                "add": [
                  {
                    "selectionId": "unit-ax-1-0-tiger-shark-selection-seeker-missile",
                    "quantity": 1
                  }
                ],
                "requiresFinal": [],
                "forbidsFinal": [],
                "sharedUses": []
              }
            ]
          },
          {
            "sourceId": "datasheet-ax-1-0-tiger-shark:wargear:2",
            "eligibleModelIds": [
              "unit-ax-1-0-tiger-shark-model-552ec001af"
            ],
            "limit": {
              "perModel": 1
            },
            "choices": [
              {
                "remove": [
                  {
                    "selectionId": "unit-ax-1-0-tiger-shark-selection-burst-cannon",
                    "quantity": 2
                  }
                ],
                "add": [
                  {
                    "selectionId": "unit-ax-1-0-tiger-shark-weapon-family-cyclic-ion-blaster-selection",
                    "quantity": 2
                  }
                ],
                "requiresFinal": [],
                "forbidsFinal": [],
                "sharedUses": []
              }
            ]
          }
        ],
        "wargearSharedCaps": []
      }
    },
    {
      "id": "unit-manta",
      "title": "Manta",
      "sourceBookId": "tau-empire",
      "sourceLayer": "imperial-armour",
      "intrinsicKeywords": [
        "Vehicle",
        "Aircraft",
        "Fly",
        "Frame",
        "Titanic",
        "Transport",
        "Markerlight",
        "Manta",
        "T'au Empire"
      ],
      "relations": {
        "canLead": [],
        "canSupport": [],
        "canBeLedBy": [],
        "canBeSupportedBy": []
      },
      "ruleFacts": {
        "relations": {
          "canLead": [],
          "canSupport": [],
          "canBeLedBy": [],
          "canBeSupportedBy": []
        }
      },
      "gameSelections": {
        "stats": {
          "M": "40\"",
          "T": "14",
          "Sv": "2+",
          "W": "60",
          "Ld": "7+",
          "OC": "-",
          "Invulnerable": "5+"
        },
        "statProfiles": [],
        "abilities": [
          {
            "id": "tau-empire-ability-aggressive-deployment",
            "sectionId": "tau-empire-ability-aggressive-deployment",
            "title": "Aggressive Deployment",
            "text": "In your Shooting phase, after this model has shot, select one enemy unit hit by one or more of those attacks. Until the end of the phase, each time a friendly model that disembarked from this TRANSPORT this turn makes an attack that targets that enemy unit, you can re-roll the Wound roll.",
            "sourceUnitId": "unit-manta"
          },
          {
            "id": "tau-empire-ability-air-caste-colossus",
            "sectionId": "tau-empire-ability-air-caste-colossus",
            "title": "Air Caste Colossus",
            "text": "Each time you target this model with a Stratagem, you must spend three times that Stratagem’s stated CP cost to do so.",
            "sourceUnitId": "unit-manta"
          },
          {
            "id": "tau-empire-ability-damaged-1-20-wounds-remaining",
            "sectionId": "tau-empire-ability-damaged-1-20-wounds-remaining",
            "title": "Damaged: 1-20 WOUNDS REMAINING",
            "text": "While this model has 1-20 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll.",
            "sourceUnitId": "unit-manta"
          },
          {
            "id": "core-deadly-demise",
            "sectionId": "core-deadly-demise",
            "title": "Deadly Demise 3D6",
            "text": "This ability always takes the form Deadly Demise X. Each time a model in this unit is destroyed, after the units embarked within it (if any) have made their emergency disembark moves, roll one D6. On a 6, that model suffers a deadly demise; each unit within 6\" of that model suffers a number of mortal wounds denoted by X (if this is a random number, roll separately for each unit within 6\"). \n *Example: An Impulsor with a unit of Intercessors embarked within it is destroyed by ranged attacks. First, any unresolved attacks made by the attacking unit are resolved. Then the Intercessors make an emergency disembark move. Then the roll is made for the Deadly Demise ability, and on a 6, that ability is resolved. Finally, the Impulsor is removed from the battlefield.*",
            "sourceUnitId": "unit-manta"
          },
          {
            "id": "tau-empire-ability-for-the-greater-good",
            "sectionId": "tau-empire-ability-for-the-greater-good",
            "title": "For The Greater Good",
            "text": "If your Army Faction is T’AU EMPIRE, at the start of your Shooting phase you can select units from your army with this ability to become Observer units.\n\nDuring your Shooting phase, for each Observer unit from your army that has not been selected to shoot this phase and is eligible to shoot (excluding FORTIFICATION and Battle-shocked units) select one enemy unit that is visible to be marked as their Spotted unit until the end of the phase. Each enemy unit can only be marked as a Spotted unit once per phase.\n\nUnits from your army with the For the Greater Good ability (excluding Observer units) are Guided units while targeting one or more Spotted units.\n\nUntil the end of the phase, each time a model from your army in a Guided unit makes an attack that targets a Spotted unit, improve the Ballistic Skill characteristic of that attack by 1 and, if the Spotted unit was marked by an Observer unit that has the Markerlight keyword, that attack has the [IGNORES COVER] ability.",
            "sourceUnitId": "unit-manta"
          }
        ],
        "models": [
          {
            "id": "unit-manta-model-7a4496b738",
            "title": "Manta",
            "aliases": [
              "Manta"
            ],
            "min": 1,
            "max": 1,
            "legacyIds": [
              "unit-manta-model-manta"
            ]
          }
        ],
        "compositionRules": [],
        "selections": [
          {
            "id": "unit-manta-selection-heavy-rail-cannon",
            "title": "Heavy rail cannon",
            "aliases": [
              "Heavy rail cannon"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-manta-profile-4a413657dc"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-manta-selection-ion-cannon-standard",
            "title": "Ion cannon – standard",
            "aliases": [
              "Ion cannon – standard"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-manta-profile-8417a11e43"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-manta-selection-ion-cannon-overcharge",
            "title": "Ion cannon – overcharge",
            "aliases": [
              "Ion cannon – overcharge"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-manta-profile-05ced86e06"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-manta-selection-long-barrelled-burst-cannon-array",
            "title": "Long-barrelled burst cannon array",
            "aliases": [
              "Long-barrelled burst cannon array"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-manta-profile-1ede0ea920"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-manta-selection-missile-pod",
            "title": "Missile pod",
            "aliases": [
              "Missile pod"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-manta-profile-fdcca74aab"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-manta-selection-seeker-missile",
            "title": "Seeker missile",
            "aliases": [
              "Seeker missile"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-manta-profile-351bd7e3c7"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-manta-selection-armoured-hull",
            "title": "Armoured hull",
            "aliases": [
              "Armoured hull"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-manta-profile-5caf5bbf40"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-manta-weapon-family-ion-cannon-selection",
            "title": "Ion cannon",
            "aliases": [
              "Ion cannon"
            ],
            "kind": "weapon",
            "familyId": "unit-manta-weapon-family-ion-cannon",
            "profileIds": [
              "unit-manta-profile-8417a11e43",
              "unit-manta-profile-05ced86e06"
            ],
            "wargearAbilityIds": []
          }
        ],
        "weaponFamilies": [
          {
            "id": "unit-manta-weapon-family-ion-cannon",
            "title": "Ion cannon",
            "aliases": [
              "Ion cannon"
            ],
            "profileIds": [
              "unit-manta-profile-8417a11e43",
              "unit-manta-profile-05ced86e06"
            ],
            "ambiguousAlias": false
          }
        ],
        "weaponProfiles": [
          {
            "id": "unit-manta-profile-4a413657dc",
            "legacyIds": [
              "unit-manta-profile-heavy-rail-cannon-ranged"
            ],
            "title": "Heavy rail cannon",
            "mode": "ranged",
            "range": "120\"",
            "a": "1",
            "skill": "4+",
            "s": "26",
            "ap": "-5",
            "d": "12",
            "abilities": "Devastating Wounds",
            "sourceSelectionIds": [
              "unit-manta-selection-heavy-rail-cannon"
            ]
          },
          {
            "id": "unit-manta-profile-8417a11e43",
            "legacyIds": [
              "unit-manta-profile-ion-cannon-standard-ranged-2"
            ],
            "title": "Ion cannon – standard",
            "mode": "ranged",
            "range": "60\"",
            "a": "D6+3",
            "skill": "4+",
            "s": "7",
            "ap": "-1",
            "d": "2",
            "abilities": "Blast",
            "sourceSelectionIds": [
              "unit-manta-selection-ion-cannon-standard",
              "unit-manta-weapon-family-ion-cannon-selection"
            ]
          },
          {
            "id": "unit-manta-profile-05ced86e06",
            "legacyIds": [
              "unit-manta-profile-ion-cannon-overcharge-ranged-3"
            ],
            "title": "Ion cannon – overcharge",
            "mode": "ranged",
            "range": "60\"",
            "a": "D6+3",
            "skill": "4+",
            "s": "8",
            "ap": "-2",
            "d": "3",
            "abilities": "Blast, Hazardous",
            "sourceSelectionIds": [
              "unit-manta-selection-ion-cannon-overcharge",
              "unit-manta-weapon-family-ion-cannon-selection"
            ]
          },
          {
            "id": "unit-manta-profile-1ede0ea920",
            "legacyIds": [
              "unit-manta-profile-long-barrelled-burst-cannon-array-ranged-4"
            ],
            "title": "Long-barrelled burst cannon array",
            "mode": "ranged",
            "range": "24\"",
            "a": "32",
            "skill": "4+",
            "s": "6",
            "ap": "-1",
            "d": "1",
            "abilities": "",
            "sourceSelectionIds": [
              "unit-manta-selection-long-barrelled-burst-cannon-array"
            ]
          },
          {
            "id": "unit-manta-profile-fdcca74aab",
            "legacyIds": [
              "unit-manta-profile-missile-pod-ranged-5"
            ],
            "title": "Missile pod",
            "mode": "ranged",
            "range": "30\"",
            "a": "2",
            "skill": "4+",
            "s": "7",
            "ap": "-1",
            "d": "2",
            "abilities": "",
            "sourceSelectionIds": [
              "unit-manta-selection-missile-pod"
            ]
          },
          {
            "id": "unit-manta-profile-351bd7e3c7",
            "legacyIds": [
              "unit-manta-profile-seeker-missile-ranged-6"
            ],
            "title": "Seeker missile",
            "mode": "ranged",
            "range": "48\"",
            "a": "1",
            "skill": "4+",
            "s": "14",
            "ap": "-3",
            "d": "D6+1",
            "abilities": "One Shot",
            "sourceSelectionIds": [
              "unit-manta-selection-seeker-missile"
            ]
          },
          {
            "id": "unit-manta-profile-5caf5bbf40",
            "legacyIds": [
              "unit-manta-profile-armoured-hull-melee-7"
            ],
            "title": "Armoured hull",
            "mode": "melee",
            "range": "Melee",
            "a": "8",
            "skill": "5+",
            "s": "6",
            "ap": "0",
            "d": "1",
            "abilities": "",
            "sourceSelectionIds": [
              "unit-manta-selection-armoured-hull"
            ]
          }
        ],
        "wargearAbilities": [],
        "wargearDefaults": [],
        "wargearOptionContracts": [],
        "wargearSharedCaps": []
      }
    },
    {
      "id": "unit-tiger-shark",
      "title": "Tiger Shark",
      "sourceBookId": "tau-empire",
      "sourceLayer": "imperial-armour",
      "intrinsicKeywords": [
        "Vehicle",
        "Aircraft",
        "Fly",
        "Tiger Shark",
        "T'au Empire"
      ],
      "relations": {
        "canLead": [],
        "canSupport": [],
        "canBeLedBy": [],
        "canBeSupportedBy": []
      },
      "ruleFacts": {
        "relations": {
          "canLead": [],
          "canSupport": [],
          "canBeLedBy": [],
          "canBeSupportedBy": []
        }
      },
      "gameSelections": {
        "stats": {
          "M": "-",
          "T": "11",
          "Sv": "3+",
          "W": "18",
          "Ld": "7+",
          "OC": "-",
          "Invulnerable": "5+"
        },
        "statProfiles": [],
        "abilities": [
          {
            "id": "tau-empire-ability-strafing-run",
            "sectionId": "tau-empire-ability-strafing-run",
            "title": "Strafing Run",
            "text": "In your Shooting phase, after this model has shot, select one enemy unit hit by one or more of those attacks that cannot FLY. That enemy unit must take a Battle-shock test.",
            "sourceUnitId": "unit-tiger-shark"
          },
          {
            "id": "tau-empire-ability-damaged-1-6-wounds-remaining",
            "sectionId": "tau-empire-ability-damaged-1-6-wounds-remaining",
            "title": "Damaged: 1-6 WOUNDS REMAINING",
            "text": "While this model has 1-6 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll.",
            "sourceUnitId": "unit-tiger-shark"
          },
          {
            "id": "core-deadly-demise",
            "sectionId": "core-deadly-demise",
            "title": "Deadly Demise D6+2",
            "text": "This ability always takes the form Deadly Demise X. Each time a model in this unit is destroyed, after the units embarked within it (if any) have made their emergency disembark moves, roll one D6. On a 6, that model suffers a deadly demise; each unit within 6\" of that model suffers a number of mortal wounds denoted by X (if this is a random number, roll separately for each unit within 6\"). \n *Example: An Impulsor with a unit of Intercessors embarked within it is destroyed by ranged attacks. First, any unresolved attacks made by the attacking unit are resolved. Then the Intercessors make an emergency disembark move. Then the roll is made for the Deadly Demise ability, and on a 6, that ability is resolved. Finally, the Impulsor is removed from the battlefield.*",
            "sourceUnitId": "unit-tiger-shark"
          },
          {
            "id": "tau-empire-ability-for-the-greater-good",
            "sectionId": "tau-empire-ability-for-the-greater-good",
            "title": "For The Greater Good",
            "text": "If your Army Faction is T’AU EMPIRE, at the start of your Shooting phase you can select units from your army with this ability to become Observer units.\n\nDuring your Shooting phase, for each Observer unit from your army that has not been selected to shoot this phase and is eligible to shoot (excluding FORTIFICATION and Battle-shocked units) select one enemy unit that is visible to be marked as their Spotted unit until the end of the phase. Each enemy unit can only be marked as a Spotted unit once per phase.\n\nUnits from your army with the For the Greater Good ability (excluding Observer units) are Guided units while targeting one or more Spotted units.\n\nUntil the end of the phase, each time a model from your army in a Guided unit makes an attack that targets a Spotted unit, improve the Ballistic Skill characteristic of that attack by 1 and, if the Spotted unit was marked by an Observer unit that has the Markerlight keyword, that attack has the [IGNORES COVER] ability.",
            "sourceUnitId": "unit-tiger-shark"
          }
        ],
        "models": [
          {
            "id": "unit-tiger-shark-model-2385549d21",
            "title": "Tiger Shark",
            "aliases": [
              "Tiger Shark"
            ],
            "min": 1,
            "max": 1,
            "legacyIds": [
              "unit-tiger-shark-model-tiger-shark"
            ]
          }
        ],
        "compositionRules": [],
        "selections": [
          {
            "id": "unit-tiger-shark-selection-burst-cannon",
            "title": "Burst cannon",
            "aliases": [
              "Burst cannon"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-tiger-shark-profile-d19f6a34f8"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-tiger-shark-selection-cyclic-ion-blaster-standard",
            "title": "Cyclic ion blaster – standard",
            "aliases": [
              "Cyclic ion blaster – standard"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-tiger-shark-profile-624c989b1b"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-tiger-shark-selection-cyclic-ion-blaster-overcharge",
            "title": "Cyclic ion blaster – overcharge",
            "aliases": [
              "Cyclic ion blaster – overcharge"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-tiger-shark-profile-e64cd12032"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-tiger-shark-selection-ion-cannon-standard",
            "title": "Ion cannon – standard",
            "aliases": [
              "Ion cannon – standard"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-tiger-shark-profile-8417a11e43"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-tiger-shark-selection-ion-cannon-overcharge",
            "title": "Ion cannon – overcharge",
            "aliases": [
              "Ion cannon – overcharge"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-tiger-shark-profile-05ced86e06"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-tiger-shark-selection-missile-pod",
            "title": "Missile pod",
            "aliases": [
              "Missile pod"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-tiger-shark-profile-fdcca74aab"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-tiger-shark-selection-seeker-missile",
            "title": "Seeker missile",
            "aliases": [
              "Seeker missile"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-tiger-shark-profile-351bd7e3c7"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-tiger-shark-selection-skyspear-missile-rack",
            "title": "Skyspear missile rack",
            "aliases": [
              "Skyspear missile rack"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-tiger-shark-profile-2226d50bb4"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-tiger-shark-selection-swiftstrike-burst-cannon",
            "title": "Swiftstrike burst cannon",
            "aliases": [
              "Swiftstrike burst cannon"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-tiger-shark-profile-b0fcb96d8e"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-tiger-shark-selection-swiftstrike-railgun",
            "title": "Swiftstrike railgun",
            "aliases": [
              "Swiftstrike railgun"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-tiger-shark-profile-e323a55d0a"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-tiger-shark-selection-armoured-hull",
            "title": "Armoured hull",
            "aliases": [
              "Armoured hull"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-tiger-shark-profile-3f6402479f"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-tiger-shark-weapon-family-cyclic-ion-blaster-selection",
            "title": "Cyclic ion blaster",
            "aliases": [
              "Cyclic ion blaster"
            ],
            "kind": "weapon",
            "familyId": "unit-tiger-shark-weapon-family-cyclic-ion-blaster",
            "profileIds": [
              "unit-tiger-shark-profile-624c989b1b",
              "unit-tiger-shark-profile-e64cd12032"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-tiger-shark-weapon-family-ion-cannon-selection",
            "title": "Ion cannon",
            "aliases": [
              "Ion cannon"
            ],
            "kind": "weapon",
            "familyId": "unit-tiger-shark-weapon-family-ion-cannon",
            "profileIds": [
              "unit-tiger-shark-profile-8417a11e43",
              "unit-tiger-shark-profile-05ced86e06"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-tiger-shark-selection-transport-bay",
            "title": "Transport Bay",
            "aliases": [
              "Transport Bay"
            ],
            "kind": "wargear",
            "profileIds": [],
            "wargearAbilityIds": [
              "unit-tiger-shark-wargear-ability-5971dd9eb6"
            ]
          }
        ],
        "weaponFamilies": [
          {
            "id": "unit-tiger-shark-weapon-family-cyclic-ion-blaster",
            "title": "Cyclic ion blaster",
            "aliases": [
              "Cyclic ion blaster"
            ],
            "profileIds": [
              "unit-tiger-shark-profile-624c989b1b",
              "unit-tiger-shark-profile-e64cd12032"
            ],
            "ambiguousAlias": false
          },
          {
            "id": "unit-tiger-shark-weapon-family-ion-cannon",
            "title": "Ion cannon",
            "aliases": [
              "Ion cannon"
            ],
            "profileIds": [
              "unit-tiger-shark-profile-8417a11e43",
              "unit-tiger-shark-profile-05ced86e06"
            ],
            "ambiguousAlias": false
          }
        ],
        "weaponProfiles": [
          {
            "id": "unit-tiger-shark-profile-d19f6a34f8",
            "legacyIds": [
              "unit-tiger-shark-profile-burst-cannon-ranged"
            ],
            "title": "Burst cannon",
            "mode": "ranged",
            "range": "18\"",
            "a": "4",
            "skill": "4+",
            "s": "5",
            "ap": "0",
            "d": "1",
            "abilities": "",
            "sourceSelectionIds": [
              "unit-tiger-shark-selection-burst-cannon"
            ]
          },
          {
            "id": "unit-tiger-shark-profile-624c989b1b",
            "legacyIds": [
              "unit-tiger-shark-profile-cyclic-ion-blaster-standard-ranged-2"
            ],
            "title": "Cyclic ion blaster – standard",
            "mode": "ranged",
            "range": "18\"",
            "a": "3",
            "skill": "4+",
            "s": "7",
            "ap": "-1",
            "d": "1",
            "abilities": "",
            "sourceSelectionIds": [
              "unit-tiger-shark-selection-cyclic-ion-blaster-standard",
              "unit-tiger-shark-weapon-family-cyclic-ion-blaster-selection"
            ]
          },
          {
            "id": "unit-tiger-shark-profile-e64cd12032",
            "legacyIds": [
              "unit-tiger-shark-profile-cyclic-ion-blaster-overcharge-ranged-3"
            ],
            "title": "Cyclic ion blaster – overcharge",
            "mode": "ranged",
            "range": "18\"",
            "a": "3",
            "skill": "4+",
            "s": "8",
            "ap": "-2",
            "d": "2",
            "abilities": "Hazardous",
            "sourceSelectionIds": [
              "unit-tiger-shark-selection-cyclic-ion-blaster-overcharge",
              "unit-tiger-shark-weapon-family-cyclic-ion-blaster-selection"
            ]
          },
          {
            "id": "unit-tiger-shark-profile-8417a11e43",
            "legacyIds": [
              "unit-tiger-shark-profile-ion-cannon-standard-ranged-4"
            ],
            "title": "Ion cannon – standard",
            "mode": "ranged",
            "range": "60\"",
            "a": "D6+3",
            "skill": "4+",
            "s": "7",
            "ap": "-1",
            "d": "2",
            "abilities": "Blast",
            "sourceSelectionIds": [
              "unit-tiger-shark-selection-ion-cannon-standard",
              "unit-tiger-shark-weapon-family-ion-cannon-selection"
            ]
          },
          {
            "id": "unit-tiger-shark-profile-05ced86e06",
            "legacyIds": [
              "unit-tiger-shark-profile-ion-cannon-overcharge-ranged-5"
            ],
            "title": "Ion cannon – overcharge",
            "mode": "ranged",
            "range": "60\"",
            "a": "D6+3",
            "skill": "4+",
            "s": "8",
            "ap": "-2",
            "d": "3",
            "abilities": "Blast, Hazardous",
            "sourceSelectionIds": [
              "unit-tiger-shark-selection-ion-cannon-overcharge",
              "unit-tiger-shark-weapon-family-ion-cannon-selection"
            ]
          },
          {
            "id": "unit-tiger-shark-profile-fdcca74aab",
            "legacyIds": [
              "unit-tiger-shark-profile-missile-pod-ranged-6"
            ],
            "title": "Missile pod",
            "mode": "ranged",
            "range": "30\"",
            "a": "2",
            "skill": "4+",
            "s": "7",
            "ap": "-1",
            "d": "2",
            "abilities": "",
            "sourceSelectionIds": [
              "unit-tiger-shark-selection-missile-pod"
            ]
          },
          {
            "id": "unit-tiger-shark-profile-351bd7e3c7",
            "legacyIds": [
              "unit-tiger-shark-profile-seeker-missile-ranged-7"
            ],
            "title": "Seeker missile",
            "mode": "ranged",
            "range": "48\"",
            "a": "1",
            "skill": "4+",
            "s": "14",
            "ap": "-3",
            "d": "D6+1",
            "abilities": "One Shot",
            "sourceSelectionIds": [
              "unit-tiger-shark-selection-seeker-missile"
            ]
          },
          {
            "id": "unit-tiger-shark-profile-2226d50bb4",
            "legacyIds": [
              "unit-tiger-shark-profile-skyspear-missile-rack-ranged-8"
            ],
            "title": "Skyspear missile rack",
            "mode": "ranged",
            "range": "72\"",
            "a": "D6+1",
            "skill": "4+",
            "s": "6",
            "ap": "-1",
            "d": "1",
            "abilities": "Anti-Fly 3+, Blast",
            "sourceSelectionIds": [
              "unit-tiger-shark-selection-skyspear-missile-rack"
            ]
          },
          {
            "id": "unit-tiger-shark-profile-b0fcb96d8e",
            "legacyIds": [
              "unit-tiger-shark-profile-swiftstrike-burst-cannon-ranged-9"
            ],
            "title": "Swiftstrike burst cannon",
            "mode": "ranged",
            "range": "36\"",
            "a": "16",
            "skill": "4+",
            "s": "6",
            "ap": "-1",
            "d": "1",
            "abilities": "",
            "sourceSelectionIds": [
              "unit-tiger-shark-selection-swiftstrike-burst-cannon"
            ]
          },
          {
            "id": "unit-tiger-shark-profile-e323a55d0a",
            "legacyIds": [
              "unit-tiger-shark-profile-swiftstrike-railgun-ranged-10"
            ],
            "title": "Swiftstrike railgun",
            "mode": "ranged",
            "range": "72\"",
            "a": "1",
            "skill": "4+",
            "s": "20",
            "ap": "-5",
            "d": "D6+6",
            "abilities": "Devastating Wounds",
            "sourceSelectionIds": [
              "unit-tiger-shark-selection-swiftstrike-railgun"
            ]
          },
          {
            "id": "unit-tiger-shark-profile-3f6402479f",
            "legacyIds": [
              "unit-tiger-shark-profile-armoured-hull-melee-11"
            ],
            "title": "Armoured hull",
            "mode": "melee",
            "range": "Melee",
            "a": "3",
            "skill": "5+",
            "s": "6",
            "ap": "0",
            "d": "1",
            "abilities": "",
            "sourceSelectionIds": [
              "unit-tiger-shark-selection-armoured-hull"
            ]
          }
        ],
        "wargearAbilities": [
          {
            "id": "unit-tiger-shark-wargear-ability-5971dd9eb6",
            "sectionId": "unit-tiger-shark-wargear-ability-5971dd9eb6",
            "title": "Transport Bay",
            "text": "The bearer has the TRANSPORT keyword and has a transport capacity of 12 TACTICAL DRONES models.",
            "sourceUnitId": "unit-tiger-shark",
            "legacyIds": [
              "unit-tiger-shark-wargear-ability-transport-bay"
            ],
            "requiredSelectionIds": [
              "unit-tiger-shark-selection-transport-bay"
            ]
          }
        ],
        "wargearDefaults": [
          {
            "modelId": "unit-tiger-shark-model-2385549d21",
            "selections": [
              {
                "selectionId": "unit-tiger-shark-selection-burst-cannon",
                "quantity": 2
              },
              {
                "selectionId": "unit-tiger-shark-weapon-family-ion-cannon-selection",
                "quantity": 2
              },
              {
                "selectionId": "unit-tiger-shark-selection-missile-pod",
                "quantity": 2
              },
              {
                "selectionId": "unit-tiger-shark-selection-armoured-hull",
                "quantity": 1
              },
              {
                "selectionId": "unit-tiger-shark-selection-transport-bay",
                "quantity": 1
              }
            ]
          }
        ],
        "wargearOptionContracts": [
          {
            "sourceId": "datasheet-tiger-shark:wargear:1",
            "eligibleModelIds": [
              "unit-tiger-shark-model-2385549d21"
            ],
            "limit": {
              "perModel": 1
            },
            "choices": [
              {
                "remove": [
                  {
                    "selectionId": "unit-tiger-shark-selection-burst-cannon",
                    "quantity": 2
                  }
                ],
                "add": [
                  {
                    "selectionId": "unit-tiger-shark-weapon-family-cyclic-ion-blaster-selection",
                    "quantity": 2
                  }
                ],
                "requiresFinal": [],
                "forbidsFinal": [],
                "sharedUses": []
              }
            ]
          },
          {
            "sourceId": "datasheet-tiger-shark:wargear:2",
            "eligibleModelIds": [
              "unit-tiger-shark-model-2385549d21"
            ],
            "limit": {
              "perModel": 1
            },
            "choices": [
              {
                "remove": [
                  {
                    "selectionId": "unit-tiger-shark-weapon-family-ion-cannon-selection",
                    "quantity": 2
                  }
                ],
                "add": [
                  {
                    "selectionId": "unit-tiger-shark-selection-swiftstrike-burst-cannon",
                    "quantity": 2
                  }
                ],
                "requiresFinal": [],
                "forbidsFinal": [],
                "sharedUses": []
              },
              {
                "remove": [
                  {
                    "selectionId": "unit-tiger-shark-weapon-family-ion-cannon-selection",
                    "quantity": 2
                  }
                ],
                "add": [
                  {
                    "selectionId": "unit-tiger-shark-selection-swiftstrike-railgun",
                    "quantity": 2
                  }
                ],
                "requiresFinal": [],
                "forbidsFinal": [],
                "sharedUses": []
              }
            ]
          },
          {
            "sourceId": "datasheet-tiger-shark:wargear:3",
            "eligibleModelIds": [
              "unit-tiger-shark-model-2385549d21"
            ],
            "limit": {
              "perModel": 6
            },
            "choices": [
              {
                "remove": [],
                "add": [
                  {
                    "selectionId": "unit-tiger-shark-selection-seeker-missile",
                    "quantity": 1
                  }
                ],
                "requiresFinal": [],
                "forbidsFinal": [],
                "sharedUses": []
              }
            ]
          },
          {
            "sourceId": "datasheet-tiger-shark:wargear:4",
            "eligibleModelIds": [
              "unit-tiger-shark-model-2385549d21"
            ],
            "limit": {
              "perModel": 1
            },
            "choices": [
              {
                "remove": [
                  {
                    "selectionId": "unit-tiger-shark-selection-transport-bay",
                    "quantity": 1
                  }
                ],
                "add": [
                  {
                    "selectionId": "unit-tiger-shark-selection-skyspear-missile-rack",
                    "quantity": 2
                  }
                ],
                "requiresFinal": [],
                "forbidsFinal": [],
                "sharedUses": []
              }
            ]
          }
        ],
        "wargearSharedCaps": []
      }
    },
    {
      "id": "unit-taunar-supremacy-armour",
      "title": "Ta’unar Supremacy Armour",
      "sourceBookId": "tau-empire",
      "sourceLayer": "imperial-armour",
      "intrinsicKeywords": [
        "Vehicle",
        "Walker",
        "Titanic",
        "Towering",
        "Frame",
        "Ta’unar Supremacy Armour",
        "T'au Empire"
      ],
      "relations": {
        "canLead": [],
        "canSupport": [],
        "canBeLedBy": [],
        "canBeSupportedBy": []
      },
      "ruleFacts": {
        "relations": {
          "canLead": [],
          "canSupport": [],
          "canBeLedBy": [],
          "canBeSupportedBy": []
        }
      },
      "gameSelections": {
        "stats": {
          "M": "8\"",
          "T": "13",
          "Sv": "2+",
          "W": "30",
          "Ld": "7+",
          "OC": "10",
          "Invulnerable": "5+"
        },
        "statProfiles": [],
        "abilities": [
          {
            "id": "tau-empire-ability-coordinated-strike",
            "sectionId": "tau-empire-ability-coordinated-strike",
            "title": "Coordinated Strike",
            "text": "While this model is a Guided unit, each time it makes an attack that targets its Spotted unit, re-roll a Hit roll of 1.",
            "sourceUnitId": "unit-taunar-supremacy-armour"
          },
          {
            "id": "tau-empire-ability-damaged-1-10-wounds-remaining",
            "sectionId": "tau-empire-ability-damaged-1-10-wounds-remaining",
            "title": "Damaged: 1-10 WOUNDS REMAINING",
            "text": "While this model has 1-10 wounds remaining, subtract 5 from this model’s Objective Control characteristic and each time this model makes an attack, subtract 1 from the Hit roll.",
            "sourceUnitId": "unit-taunar-supremacy-armour"
          },
          {
            "id": "core-deadly-demise",
            "sectionId": "core-deadly-demise",
            "title": "Deadly Demise D6+3",
            "text": "This ability always takes the form Deadly Demise X. Each time a model in this unit is destroyed, after the units embarked within it (if any) have made their emergency disembark moves, roll one D6. On a 6, that model suffers a deadly demise; each unit within 6\" of that model suffers a number of mortal wounds denoted by X (if this is a random number, roll separately for each unit within 6\"). \n *Example: An Impulsor with a unit of Intercessors embarked within it is destroyed by ranged attacks. First, any unresolved attacks made by the attacking unit are resolved. Then the Intercessors make an emergency disembark move. Then the roll is made for the Deadly Demise ability, and on a 6, that ability is resolved. Finally, the Impulsor is removed from the battlefield.*",
            "sourceUnitId": "unit-taunar-supremacy-armour"
          },
          {
            "id": "tau-empire-ability-for-the-greater-good",
            "sectionId": "tau-empire-ability-for-the-greater-good",
            "title": "For The Greater Good",
            "text": "If your Army Faction is T’AU EMPIRE, at the start of your Shooting phase you can select units from your army with this ability to become Observer units.\n\nDuring your Shooting phase, for each Observer unit from your army that has not been selected to shoot this phase and is eligible to shoot (excluding FORTIFICATION and Battle-shocked units) select one enemy unit that is visible to be marked as their Spotted unit until the end of the phase. Each enemy unit can only be marked as a Spotted unit once per phase.\n\nUnits from your army with the For the Greater Good ability (excluding Observer units) are Guided units while targeting one or more Spotted units.\n\nUntil the end of the phase, each time a model from your army in a Guided unit makes an attack that targets a Spotted unit, improve the Ballistic Skill characteristic of that attack by 1 and, if the Spotted unit was marked by an Observer unit that has the Markerlight keyword, that attack has the [IGNORES COVER] ability.",
            "sourceUnitId": "unit-taunar-supremacy-armour"
          }
        ],
        "models": [
          {
            "id": "unit-taunar-supremacy-armour-model-7c80d081ad",
            "title": "Ta’unar Supremacy Armour",
            "aliases": [
              "Ta’unar Supremacy Armour"
            ],
            "min": 1,
            "max": 1,
            "legacyIds": [
              "unit-taunar-supremacy-armour-model-taunar-supremacy-armour"
            ]
          }
        ],
        "compositionRules": [],
        "selections": [
          {
            "id": "unit-taunar-supremacy-armour-selection-burst-cannon",
            "title": "Burst cannon",
            "aliases": [
              "Burst cannon"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-taunar-supremacy-armour-profile-d19f6a34f8"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-taunar-supremacy-armour-selection-fragmentation-cluster-shell-launcher",
            "title": "Fragmentation cluster shell launcher",
            "aliases": [
              "Fragmentation cluster shell launcher"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-taunar-supremacy-armour-profile-35f63dcff7"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-taunar-supremacy-armour-selection-fusion-eradicator",
            "title": "Fusion eradicator",
            "aliases": [
              "Fusion eradicator"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-taunar-supremacy-armour-profile-291494c427"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-taunar-supremacy-armour-selection-heavy-rail-cannon-array",
            "title": "Heavy rail cannon array",
            "aliases": [
              "Heavy rail cannon array"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-taunar-supremacy-armour-profile-0081027c72"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-taunar-supremacy-armour-selection-nexus-missile-launcher",
            "title": "Nexus missile launcher",
            "aliases": [
              "Nexus missile launcher"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-taunar-supremacy-armour-profile-cf6bb5ce13"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-taunar-supremacy-armour-selection-pulse-ordnance-driver",
            "title": "Pulse ordnance driver",
            "aliases": [
              "Pulse ordnance driver"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-taunar-supremacy-armour-profile-a70e880658"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-taunar-supremacy-armour-selection-smart-missile-system",
            "title": "Smart missile system",
            "aliases": [
              "Smart missile system"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-taunar-supremacy-armour-profile-506187484b"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-taunar-supremacy-armour-selection-tri-axis-ion-cannon-standard",
            "title": "Tri-axis ion cannon – standard",
            "aliases": [
              "Tri-axis ion cannon – standard"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-taunar-supremacy-armour-profile-9a186996c3"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-taunar-supremacy-armour-selection-tri-axis-ion-cannon-supercharge",
            "title": "Tri-axis ion cannon – supercharge",
            "aliases": [
              "Tri-axis ion cannon – supercharge"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-taunar-supremacy-armour-profile-53773f8856"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-taunar-supremacy-armour-selection-crushing-feet",
            "title": "Crushing feet",
            "aliases": [
              "Crushing feet"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-taunar-supremacy-armour-profile-a2381d865b"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-taunar-supremacy-armour-weapon-family-tri-axis-ion-cannon-selection",
            "title": "Tri-axis ion cannon",
            "aliases": [
              "Tri-axis ion cannon"
            ],
            "kind": "weapon",
            "familyId": "unit-taunar-supremacy-armour-weapon-family-tri-axis-ion-cannon",
            "profileIds": [
              "unit-taunar-supremacy-armour-profile-9a186996c3",
              "unit-taunar-supremacy-armour-profile-53773f8856"
            ],
            "wargearAbilityIds": []
          }
        ],
        "weaponFamilies": [
          {
            "id": "unit-taunar-supremacy-armour-weapon-family-tri-axis-ion-cannon",
            "title": "Tri-axis ion cannon",
            "aliases": [
              "Tri-axis ion cannon"
            ],
            "profileIds": [
              "unit-taunar-supremacy-armour-profile-9a186996c3",
              "unit-taunar-supremacy-armour-profile-53773f8856"
            ],
            "ambiguousAlias": false
          }
        ],
        "weaponProfiles": [
          {
            "id": "unit-taunar-supremacy-armour-profile-d19f6a34f8",
            "legacyIds": [
              "unit-taunar-supremacy-armour-profile-burst-cannon-ranged"
            ],
            "title": "Burst cannon",
            "mode": "ranged",
            "range": "18\"",
            "a": "4",
            "skill": "4+",
            "s": "5",
            "ap": "0",
            "d": "1",
            "abilities": "",
            "sourceSelectionIds": [
              "unit-taunar-supremacy-armour-selection-burst-cannon"
            ]
          },
          {
            "id": "unit-taunar-supremacy-armour-profile-35f63dcff7",
            "legacyIds": [
              "unit-taunar-supremacy-armour-profile-fragmentation-cluster-shell-launcher-ranged-2"
            ],
            "title": "Fragmentation cluster shell launcher",
            "mode": "ranged",
            "range": "24\"",
            "a": "2D6+6",
            "skill": "4+",
            "s": "6",
            "ap": "-1",
            "d": "1",
            "abilities": "Blast",
            "sourceSelectionIds": [
              "unit-taunar-supremacy-armour-selection-fragmentation-cluster-shell-launcher"
            ]
          },
          {
            "id": "unit-taunar-supremacy-armour-profile-291494c427",
            "legacyIds": [
              "unit-taunar-supremacy-armour-profile-fusion-eradicator-ranged-3"
            ],
            "title": "Fusion eradicator",
            "mode": "ranged",
            "range": "24\"",
            "a": "5",
            "skill": "4+",
            "s": "10",
            "ap": "-4",
            "d": "D6",
            "abilities": "Melta 3",
            "sourceSelectionIds": [
              "unit-taunar-supremacy-armour-selection-fusion-eradicator"
            ]
          },
          {
            "id": "unit-taunar-supremacy-armour-profile-0081027c72",
            "legacyIds": [
              "unit-taunar-supremacy-armour-profile-heavy-rail-cannon-array-ranged-4"
            ],
            "title": "Heavy rail cannon array",
            "mode": "ranged",
            "range": "120\"",
            "a": "2",
            "skill": "4+",
            "s": "26",
            "ap": "-5",
            "d": "16",
            "abilities": "Devastating Wounds, Heavy",
            "sourceSelectionIds": [
              "unit-taunar-supremacy-armour-selection-heavy-rail-cannon-array"
            ]
          },
          {
            "id": "unit-taunar-supremacy-armour-profile-cf6bb5ce13",
            "legacyIds": [
              "unit-taunar-supremacy-armour-profile-nexus-missile-launcher-ranged-5"
            ],
            "title": "Nexus missile launcher",
            "mode": "ranged",
            "range": "36\"",
            "a": "8",
            "skill": "4+",
            "s": "8",
            "ap": "-3",
            "d": "2",
            "abilities": "",
            "sourceSelectionIds": [
              "unit-taunar-supremacy-armour-selection-nexus-missile-launcher"
            ]
          },
          {
            "id": "unit-taunar-supremacy-armour-profile-a70e880658",
            "legacyIds": [
              "unit-taunar-supremacy-armour-profile-pulse-ordnance-driver-ranged-6"
            ],
            "title": "Pulse ordnance driver",
            "mode": "ranged",
            "range": "60\"",
            "a": "8",
            "skill": "4+",
            "s": "5",
            "ap": "-1",
            "d": "3",
            "abilities": "Anti-Infantry 2+",
            "sourceSelectionIds": [
              "unit-taunar-supremacy-armour-selection-pulse-ordnance-driver"
            ]
          },
          {
            "id": "unit-taunar-supremacy-armour-profile-506187484b",
            "legacyIds": [
              "unit-taunar-supremacy-armour-profile-smart-missile-system-ranged-7"
            ],
            "title": "Smart missile system",
            "mode": "ranged",
            "range": "30\"",
            "a": "3",
            "skill": "4+",
            "s": "5",
            "ap": "0",
            "d": "1",
            "abilities": "Indirect Fire",
            "sourceSelectionIds": [
              "unit-taunar-supremacy-armour-selection-smart-missile-system"
            ]
          },
          {
            "id": "unit-taunar-supremacy-armour-profile-9a186996c3",
            "legacyIds": [
              "unit-taunar-supremacy-armour-profile-tri-axis-ion-cannon-standard-ranged-8"
            ],
            "title": "Tri-axis ion cannon – standard",
            "mode": "ranged",
            "range": "36\"",
            "a": "D6+3",
            "skill": "4+",
            "s": "8",
            "ap": "-2",
            "d": "2",
            "abilities": "Blast",
            "sourceSelectionIds": [
              "unit-taunar-supremacy-armour-selection-tri-axis-ion-cannon-standard",
              "unit-taunar-supremacy-armour-weapon-family-tri-axis-ion-cannon-selection"
            ]
          },
          {
            "id": "unit-taunar-supremacy-armour-profile-53773f8856",
            "legacyIds": [
              "unit-taunar-supremacy-armour-profile-tri-axis-ion-cannon-supercharge-ranged-9"
            ],
            "title": "Tri-axis ion cannon – supercharge",
            "mode": "ranged",
            "range": "36\"",
            "a": "D6+3",
            "skill": "4+",
            "s": "9",
            "ap": "-3",
            "d": "3",
            "abilities": "Blast, Hazardous",
            "sourceSelectionIds": [
              "unit-taunar-supremacy-armour-selection-tri-axis-ion-cannon-supercharge",
              "unit-taunar-supremacy-armour-weapon-family-tri-axis-ion-cannon-selection"
            ]
          },
          {
            "id": "unit-taunar-supremacy-armour-profile-a2381d865b",
            "legacyIds": [
              "unit-taunar-supremacy-armour-profile-crushing-feet-melee-10"
            ],
            "title": "Crushing feet",
            "mode": "melee",
            "range": "Melee",
            "a": "6",
            "skill": "5+",
            "s": "8",
            "ap": "-1",
            "d": "2",
            "abilities": "",
            "sourceSelectionIds": [
              "unit-taunar-supremacy-armour-selection-crushing-feet"
            ]
          }
        ],
        "wargearAbilities": [],
        "wargearDefaults": [
          {
            "modelId": "unit-taunar-supremacy-armour-model-7c80d081ad",
            "selections": [
              {
                "selectionId": "unit-taunar-supremacy-armour-selection-burst-cannon",
                "quantity": 4
              },
              {
                "selectionId": "unit-taunar-supremacy-armour-selection-fusion-eradicator",
                "quantity": 1
              },
              {
                "selectionId": "unit-taunar-supremacy-armour-selection-pulse-ordnance-driver",
                "quantity": 3
              },
              {
                "selectionId": "unit-taunar-supremacy-armour-selection-smart-missile-system",
                "quantity": 4
              },
              {
                "selectionId": "unit-taunar-supremacy-armour-weapon-family-tri-axis-ion-cannon-selection",
                "quantity": 1
              },
              {
                "selectionId": "unit-taunar-supremacy-armour-selection-crushing-feet",
                "quantity": 1
              }
            ]
          }
        ],
        "wargearOptionContracts": [
          {
            "sourceId": "datasheet-taunar-supremacy-armour:wargear:1",
            "eligibleModelIds": [
              "unit-taunar-supremacy-armour-model-7c80d081ad"
            ],
            "limit": {
              "perModel": 1
            },
            "choices": [
              {
                "remove": [
                  {
                    "selectionId": "unit-taunar-supremacy-armour-weapon-family-tri-axis-ion-cannon-selection",
                    "quantity": 1
                  }
                ],
                "add": [
                  {
                    "selectionId": "unit-taunar-supremacy-armour-selection-fusion-eradicator",
                    "quantity": 1
                  }
                ],
                "requiresFinal": [],
                "forbidsFinal": [],
                "sharedUses": []
              }
            ]
          },
          {
            "sourceId": "datasheet-taunar-supremacy-armour:wargear:2",
            "eligibleModelIds": [
              "unit-taunar-supremacy-armour-model-7c80d081ad"
            ],
            "limit": {
              "perModel": 1
            },
            "choices": [
              {
                "remove": [
                  {
                    "selectionId": "unit-taunar-supremacy-armour-selection-fusion-eradicator",
                    "quantity": 1
                  }
                ],
                "add": [
                  {
                    "selectionId": "unit-taunar-supremacy-armour-weapon-family-tri-axis-ion-cannon-selection",
                    "quantity": 1
                  }
                ],
                "requiresFinal": [],
                "forbidsFinal": [],
                "sharedUses": []
              }
            ]
          },
          {
            "sourceId": "datasheet-taunar-supremacy-armour:wargear:3",
            "eligibleModelIds": [
              "unit-taunar-supremacy-armour-model-7c80d081ad"
            ],
            "limit": {
              "perModel": 1
            },
            "choices": [
              {
                "remove": [
                  {
                    "selectionId": "unit-taunar-supremacy-armour-selection-pulse-ordnance-driver",
                    "quantity": 3
                  }
                ],
                "add": [
                  {
                    "selectionId": "unit-taunar-supremacy-armour-selection-nexus-missile-launcher",
                    "quantity": 2
                  }
                ],
                "requiresFinal": [],
                "forbidsFinal": [],
                "sharedUses": []
              },
              {
                "remove": [
                  {
                    "selectionId": "unit-taunar-supremacy-armour-selection-pulse-ordnance-driver",
                    "quantity": 3
                  }
                ],
                "add": [
                  {
                    "selectionId": "unit-taunar-supremacy-armour-selection-heavy-rail-cannon-array",
                    "quantity": 1
                  },
                  {
                    "selectionId": "unit-taunar-supremacy-armour-selection-fragmentation-cluster-shell-launcher",
                    "quantity": 1
                  }
                ],
                "requiresFinal": [],
                "forbidsFinal": [],
                "sharedUses": []
              }
            ]
          }
        ],
        "wargearSharedCaps": []
      }
    }
  ],
  "detachments": [
    {
      "id": "kauyon",
      "title": "KAUYON",
      "sourceBookId": "tau-empire",
      "chapterRestriction": null,
      "keywordGrants": [],
      "detachmentRuleIds": [
        "tau-empire-detachment-rule-patient-hunter"
      ]
    },
    {
      "id": "experimental-prototype-cadre",
      "title": "EXPERIMENTAL PROTOTYPE CADRE",
      "sourceBookId": "tau-empire",
      "chapterRestriction": null,
      "keywordGrants": [],
      "detachmentRuleIds": [
        "tau-empire-detachment-rule-superior-craftsmanship"
      ]
    },
    {
      "id": "advanced-acquisition-cadre",
      "title": "ADVANCED ACQUISITION CADRE",
      "sourceBookId": "tau-empire",
      "chapterRestriction": null,
      "keywordGrants": [],
      "detachmentRuleIds": [
        "tau-empire-detachment-rule-expert-fieldcraft"
      ]
    },
    {
      "id": "retaliation-cadre",
      "title": "RETALIATION CADRE",
      "sourceBookId": "tau-empire",
      "chapterRestriction": null,
      "keywordGrants": [],
      "detachmentRuleIds": [
        "tau-empire-detachment-rule-bonded-heroes"
      ]
    },
    {
      "id": "montka",
      "title": "MONT’KA",
      "sourceBookId": "tau-empire",
      "chapterRestriction": null,
      "keywordGrants": [],
      "detachmentRuleIds": [
        "tau-empire-detachment-rule-killing-blow"
      ]
    },
    {
      "id": "kroot-hunting-pack",
      "title": "KROOT HUNTING PACK",
      "sourceBookId": "tau-empire",
      "chapterRestriction": null,
      "keywordGrants": [],
      "detachmentRuleIds": [
        "tau-empire-detachment-rule-hunters-instincts-skirmish-fighters"
      ]
    },
    {
      "id": "auxiliary-cadre",
      "title": "AUXILIARY CADRE",
      "sourceBookId": "tau-empire",
      "chapterRestriction": null,
      "keywordGrants": [],
      "detachmentRuleIds": [
        "tau-empire-detachment-rule-integrated-command-structure"
      ]
    }
  ],
  "detachmentRules": [
    {
      "id": "tau-empire-detachment-rule-patient-hunter",
      "title": "Patient Hunter",
      "text": "During the third, fourth and fifth battle rounds, ranged weapons equipped by T’AU EMPIRE models from your army have the [SUSTAINED HITS 1] ability. During the third, fourth and fifth battle rounds, while a unit is a Guided unit (see For the Greater Good), each time a ranged attack is made by a model in that unit that targets a Spotted unit, you can ignore any or all modifiers to that attack’s Ballistic skill characteristics and/or all modifiers to the Hit roll.",
      "sectionId": "kauyon-rule",
      "detachmentId": "kauyon",
      "detachmentTitle": "KAUYON",
      "sourceBookId": "tau-empire"
    },
    {
      "id": "tau-empire-detachment-rule-superior-craftsmanship",
      "title": "Superior Craftsmanship",
      "text": "Friendly BATTLESUIT CHARACTER units’ ranged attacks have +6\" R. This detachment has the BATTLESUIT tag and cannot be taken with another BATTLESUIT detachment.",
      "sectionId": "experimental-prototype-cadre-rule",
      "detachmentId": "experimental-prototype-cadre",
      "detachmentTitle": "EXPERIMENTAL PROTOTYPE CADRE",
      "sourceBookId": "tau-empire"
    },
    {
      "id": "tau-empire-detachment-rule-expert-fieldcraft",
      "title": "Expert Fieldcraft",
      "text": "In your Shooting phase, when a friendly PATHFINDER TEAM/STEALTH BATTLESUITS unit is selected to shoot, those ranged attacks do not prevent your unit from being hidden.",
      "sectionId": "advanced-acquisition-cadre-rule",
      "detachmentId": "advanced-acquisition-cadre",
      "detachmentTitle": "ADVANCED ACQUISITION CADRE",
      "sourceBookId": "tau-empire"
    },
    {
      "id": "tau-empire-detachment-rule-bonded-heroes",
      "title": "Bonded Heroes",
      "text": "Each time a T’AU EMPIRE BATTLESUIT model from your army makes a ranged attack that targets a unit within 12\", improve the Strength characteristic of that attack by 1. If that attack targets a unit within 8\", improve the Armour Penetration characteristic of that attack by 1 as well.",
      "sectionId": "retaliation-cadre-rule",
      "detachmentId": "retaliation-cadre",
      "detachmentTitle": "RETALIATION CADRE",
      "sourceBookId": "tau-empire"
    },
    {
      "id": "tau-empire-detachment-rule-killing-blow",
      "title": "Killing Blow",
      "text": "During the first, second and third battle rounds, ranged weapons equipped by T’AU EMPIRE models from your army have the [ASSAULT] ability. During the first, second and third battle rounds, while a unit is a Guided unit (see For the Greater Good), its ranged weapons have the [LETHAL HITS] ability.",
      "sectionId": "montka-rule",
      "detachmentId": "montka",
      "detachmentTitle": "MONT’KA",
      "sourceBookId": "tau-empire"
    },
    {
      "id": "tau-empire-detachment-rule-hunters-instincts-skirmish-fighters",
      "title": "Hunter's Instincts & Skirmish Fighters",
      "text": "Each time a KROOT model from your army makes an attack, add 1 to the Hit roll if the target of that attack is below its Starting Strength, and add 1 to the Wound roll as well if the target of that attack is Below Half-strength.\n\nKROOT models from your army have a 6+ invulnerable save against melee attacks and a 5+ invulnerable save against ranged attacks.",
      "sectionId": "kroot-hunting-pack-rule",
      "detachmentId": "kroot-hunting-pack",
      "detachmentTitle": "KROOT HUNTING PACK",
      "sourceBookId": "tau-empire"
    },
    {
      "id": "tau-empire-detachment-rule-integrated-command-structure",
      "title": "Integrated Command Structure",
      "text": "Friendly KROOT/VESPID STINGWINGS units have the following ability: Harnessed Alien Instincts: In your Shooting phase, this unit can select one visible enemy unit within 12\". That enemy unit is prey-marked. While a unit is prey-marked, that unit has +3\" detection range. Friendly GHOSTKEEL BATTLESUIT/STEALTH BATTLESUITS units have the following ability: Localised Stealth Projectors (Aura): When a friendly KROOT/VESPID STINGWINGS unit within 6\" of this unit has shot, those attacks do not prevent that unit from being hidden. This detachment has the AUXILIARIES tag and cannot be taken with another AUXILIARIES detachment.",
      "sectionId": "auxiliary-cadre-rule",
      "detachmentId": "auxiliary-cadre",
      "detachmentTitle": "AUXILIARY CADRE",
      "sourceBookId": "tau-empire"
    }
  ],
  "enhancements": [
    {
      "id": "enhancement-exemplar-of-the-kauyon",
      "title": "Exemplar of the Kauyon",
      "value": 20,
      "text": "T’AU EMPIRE model only (excluding KROOT SHAPER models). While the bearer is leading a unit, the Patient Hunter Detachment rule applies to that unit from the second battle round onwards instead of from the third.",
      "termId": "tau-empire-enhancement-exemplar-of-the-kauyon",
      "detachmentId": "kauyon",
      "sourceBookId": "tau-empire",
      "legacyKey": "enhancement-exemplar-of-the-kauyon",
      "canonicalEnhancementId": "enhancement-exemplar-of-the-kauyon",
      "canonicalDetachmentId": "kauyon",
      "tags": [],
      "owner": {
        "subject": "model",
        "selector": {
          "unitIds": [
            "unit-cadre-fireblade",
            "unit-commander-in-coldstar-battlesuit",
            "unit-commander-in-enforcer-battlesuit",
            "unit-ethereal",
            "unit-firesight-team",
            "unit-kroot-lone-spear",
            "unit-commander-in-crisis-battlesuit"
          ],
          "noneKeywords": [
            "EPIC HERO"
          ]
        }
      },
      "assignment": {
        "maxOwners": 1,
        "enhancementChoices": 1,
        "payPointsPerOwner": true
      }
    },
    {
      "id": "enhancement-precision-of-the-patient-hunter",
      "title": "Precision of the Patient Hunter",
      "value": 15,
      "text": "T’AU EMPIRE model only. Each time the bearer makes a ranged attack, add 1 to the Hit roll. From the third battle round onwards, add 1 to the Wound roll as well.",
      "termId": "tau-empire-enhancement-precision-of-the-patient-hunter",
      "detachmentId": "kauyon",
      "sourceBookId": "tau-empire",
      "legacyKey": "enhancement-precision-of-the-patient-hunter",
      "canonicalEnhancementId": "enhancement-precision-of-the-patient-hunter",
      "canonicalDetachmentId": "kauyon",
      "tags": [],
      "owner": {
        "subject": "model",
        "selector": {
          "unitIds": [
            "unit-cadre-fireblade",
            "unit-commander-in-coldstar-battlesuit",
            "unit-commander-in-enforcer-battlesuit",
            "unit-ethereal",
            "unit-firesight-team",
            "unit-kroot-flesh-shaper",
            "unit-kroot-lone-spear",
            "unit-kroot-trail-shaper",
            "unit-kroot-war-shaper",
            "unit-commander-in-crisis-battlesuit"
          ],
          "noneKeywords": [
            "EPIC HERO"
          ]
        }
      },
      "assignment": {
        "maxOwners": 1,
        "enhancementChoices": 1,
        "payPointsPerOwner": true
      }
    },
    {
      "id": "enhancement-solid-image-projection-unit",
      "title": "Solid-image Projection Unit",
      "value": 20,
      "text": "T’AU EMPIRE model only. After both players have deployed their armies, select up to three T’AU EMPIRE units from your army and redeploy them. When doing so, you can set those units up in Strategic Reserves if you wish, regardless of how many units are already in Strategic Reserves.",
      "termId": "tau-empire-enhancement-solid-image-projection-unit",
      "detachmentId": "kauyon",
      "sourceBookId": "tau-empire",
      "legacyKey": "enhancement-solid-image-projection-unit",
      "canonicalEnhancementId": "enhancement-solid-image-projection-unit",
      "canonicalDetachmentId": "kauyon",
      "tags": [],
      "owner": {
        "subject": "model",
        "selector": {
          "unitIds": [
            "unit-cadre-fireblade",
            "unit-commander-in-coldstar-battlesuit",
            "unit-commander-in-enforcer-battlesuit",
            "unit-ethereal",
            "unit-firesight-team",
            "unit-kroot-flesh-shaper",
            "unit-kroot-lone-spear",
            "unit-kroot-trail-shaper",
            "unit-kroot-war-shaper",
            "unit-commander-in-crisis-battlesuit"
          ],
          "noneKeywords": [
            "EPIC HERO"
          ]
        }
      },
      "assignment": {
        "maxOwners": 1,
        "enhancementChoices": 1,
        "payPointsPerOwner": true
      }
    },
    {
      "id": "enhancement-through-unity-devastation",
      "title": "Through Unity, Devastation",
      "value": 30,
      "text": "T’AU EMPIRE model only (excluding KROOT SHAPER models). While the bearer is leading a unit, each time that unit is an Observer unit, until the end of the phase, ranged weapons equipped by models in a Guided unit have the [LETHAL HITS] ability while targeting their Spotted unit.",
      "termId": "tau-empire-enhancement-through-unity-devastation",
      "detachmentId": "kauyon",
      "sourceBookId": "tau-empire",
      "legacyKey": "enhancement-through-unity-devastation",
      "canonicalEnhancementId": "enhancement-through-unity-devastation",
      "canonicalDetachmentId": "kauyon",
      "tags": [],
      "owner": {
        "subject": "model",
        "selector": {
          "unitIds": [
            "unit-cadre-fireblade",
            "unit-commander-in-coldstar-battlesuit",
            "unit-commander-in-enforcer-battlesuit",
            "unit-ethereal",
            "unit-firesight-team",
            "unit-kroot-lone-spear",
            "unit-commander-in-crisis-battlesuit"
          ],
          "noneKeywords": [
            "EPIC HERO"
          ]
        }
      },
      "assignment": {
        "maxOwners": 1,
        "enhancementChoices": 1,
        "payPointsPerOwner": true
      }
    },
    {
      "id": "thermoneutronic-projector",
      "title": "Thermoneutronic Projector",
      "text": "BATTLESUIT model only. In the Declare Battle Formations step, select one of this model’s T’au Flamer weapons. That weapon’s attacks have: +2 S; +1 AP and D.",
      "sourcePages": [
        4
      ],
      "provenance": {
        "sourceId": "tau-empire-faction-pack-v1.1",
        "sourcePages": [
          4
        ]
      },
      "tags": [],
      "value": 15,
      "termId": "tau-empire-enhancement-thermoneutronic-projector",
      "detachmentId": "experimental-prototype-cadre",
      "sourceBookId": "tau-empire",
      "legacyKey": "thermoneutronic-projector",
      "canonicalEnhancementId": "thermoneutronic-projector",
      "canonicalDetachmentId": "experimental-prototype-cadre",
      "owner": {
        "subject": "model",
        "selector": {
          "unitIds": [
            "unit-commander-in-coldstar-battlesuit",
            "unit-commander-in-enforcer-battlesuit",
            "unit-commander-in-crisis-battlesuit"
          ],
          "noneKeywords": [
            "EPIC HERO"
          ]
        }
      },
      "assignment": {
        "maxOwners": 1,
        "enhancementChoices": 1,
        "payPointsPerOwner": true
      }
    },
    {
      "id": "plasma-accelerator-rifle",
      "title": "Plasma Accelerator Rifle",
      "text": "BATTLESUIT model only. In the Declare Battle Formations step, select one of this model’s Plasma Rifle weapons. That weapon’s attacks have: +2 S; +1 A, AP and D.",
      "sourcePages": [
        4
      ],
      "provenance": {
        "sourceId": "tau-empire-faction-pack-v1.1",
        "sourcePages": [
          4
        ]
      },
      "tags": [],
      "value": 20,
      "termId": "tau-empire-enhancement-plasma-accelerator-rifle",
      "detachmentId": "experimental-prototype-cadre",
      "sourceBookId": "tau-empire",
      "legacyKey": "plasma-accelerator-rifle",
      "canonicalEnhancementId": "plasma-accelerator-rifle",
      "canonicalDetachmentId": "experimental-prototype-cadre",
      "owner": {
        "subject": "model",
        "selector": {
          "unitIds": [
            "unit-commander-in-coldstar-battlesuit",
            "unit-commander-in-enforcer-battlesuit",
            "unit-commander-in-crisis-battlesuit"
          ],
          "noneKeywords": [
            "EPIC HERO"
          ]
        }
      },
      "assignment": {
        "maxOwners": 1,
        "enhancementChoices": 1,
        "payPointsPerOwner": true
      }
    },
    {
      "id": "supernova-launcher",
      "title": "Supernova Launcher",
      "text": "BATTLESUIT model only. In the Declare Battle Formations step, select one of this model’s Airbursting Fragmentation Projector weapons. That weapon’s attacks have: +3 S; +1 AP and D.",
      "sourcePages": [
        4
      ],
      "provenance": {
        "sourceId": "tau-empire-faction-pack-v1.1",
        "sourcePages": [
          4
        ]
      },
      "tags": [],
      "value": 15,
      "termId": "tau-empire-enhancement-supernova-launcher",
      "detachmentId": "experimental-prototype-cadre",
      "sourceBookId": "tau-empire",
      "legacyKey": "supernova-launcher",
      "canonicalEnhancementId": "supernova-launcher",
      "canonicalDetachmentId": "experimental-prototype-cadre",
      "owner": {
        "subject": "model",
        "selector": {
          "unitIds": [
            "unit-commander-in-coldstar-battlesuit",
            "unit-commander-in-enforcer-battlesuit",
            "unit-commander-in-crisis-battlesuit"
          ],
          "noneKeywords": [
            "EPIC HERO"
          ]
        }
      },
      "assignment": {
        "maxOwners": 1,
        "enhancementChoices": 1,
        "payPointsPerOwner": true
      }
    },
    {
      "id": "negation-emitters-upgrade",
      "title": "Negation Emitters",
      "text": "STEALTH BATTLESUITS unit only. This unit has -3\" detection range.",
      "sourcePages": [
        2
      ],
      "provenance": {
        "sourceId": "tau-empire-faction-pack-v1.1",
        "sourcePages": [
          2
        ]
      },
      "tags": [
        "UPGRADE"
      ],
      "value": 15,
      "termId": "tau-empire-enhancement-negation-emitters",
      "detachmentId": "advanced-acquisition-cadre",
      "sourceBookId": "tau-empire",
      "legacyKey": "negation-emitters-upgrade",
      "canonicalEnhancementId": "negation-emitters-upgrade",
      "canonicalDetachmentId": "advanced-acquisition-cadre",
      "owner": {
        "subject": "unit",
        "selector": {
          "unitIds": [
            "unit-stealth-battlesuits"
          ],
          "noneKeywords": [
            "EPIC HERO"
          ]
        }
      },
      "assignment": {
        "maxOwners": 3,
        "enhancementChoices": 1,
        "payPointsPerOwner": true
      }
    },
    {
      "id": "unmasking-suite-upgrade",
      "title": "Unmasking Suite",
      "text": "GHOSTKEEL BATTLESUIT/PATHFINDER TEAM/STEALTH BATTLESUITS unit only. When this unit is selected to shoot, you can select one enemy unit within 24\" of this unit. That enemy unit has +9\" detection range until this unit has shot.",
      "sourcePages": [
        2
      ],
      "provenance": {
        "sourceId": "tau-empire-faction-pack-v1.1",
        "sourcePages": [
          2
        ]
      },
      "tags": [
        "UPGRADE"
      ],
      "value": 15,
      "termId": "tau-empire-enhancement-unmasking-suite",
      "detachmentId": "advanced-acquisition-cadre",
      "sourceBookId": "tau-empire",
      "legacyKey": "unmasking-suite-upgrade",
      "canonicalEnhancementId": "unmasking-suite-upgrade",
      "canonicalDetachmentId": "advanced-acquisition-cadre",
      "owner": {
        "subject": "unit",
        "selector": {
          "unitIds": [
            "unit-pathfinder-team",
            "unit-stealth-battlesuits",
            "unit-ghostkeel-battlesuit"
          ],
          "noneKeywords": [
            "EPIC HERO"
          ]
        }
      },
      "assignment": {
        "maxOwners": 3,
        "enhancementChoices": 1,
        "payPointsPerOwner": true
      }
    },
    {
      "id": "enhancement-internal-grenade-racks",
      "title": "Internal Grenade Racks",
      "value": 20,
      "text": "T’AU EMPIRE BATTLESUIT model only. The bearer has the GRENADES keyword, and each time the bearer ends a Normal move, you can select one enemy unit that it moved over during that move. If you do, roll six D6: for each 4+, that enemy unit suffers 1 mortal wound.",
      "termId": "tau-empire-enhancement-internal-grenade-racks",
      "detachmentId": "retaliation-cadre",
      "sourceBookId": "tau-empire",
      "legacyKey": "enhancement-internal-grenade-racks",
      "canonicalEnhancementId": "enhancement-internal-grenade-racks",
      "canonicalDetachmentId": "retaliation-cadre",
      "tags": [],
      "owner": {
        "subject": "model",
        "selector": {
          "unitIds": [
            "unit-commander-in-coldstar-battlesuit",
            "unit-commander-in-enforcer-battlesuit",
            "unit-commander-in-crisis-battlesuit"
          ],
          "noneKeywords": [
            "EPIC HERO"
          ]
        }
      },
      "assignment": {
        "maxOwners": 1,
        "enhancementChoices": 1,
        "payPointsPerOwner": true
      }
    },
    {
      "id": "enhancement-prototype-weapon-system",
      "title": "Prototype Weapon System",
      "value": 15,
      "text": "T’AU EMPIRE BATTLESUIT model only. Each time the bearer is selected to shoot, select either the [LETHAL HITS] or [SUSTAINED HITS 1] ability. Until those attacks are resolved, ranged weapons equipped by the bearer have the selected ability.",
      "termId": "tau-empire-enhancement-prototype-weapon-system",
      "detachmentId": "retaliation-cadre",
      "sourceBookId": "tau-empire",
      "legacyKey": "enhancement-prototype-weapon-system",
      "canonicalEnhancementId": "enhancement-prototype-weapon-system",
      "canonicalDetachmentId": "retaliation-cadre",
      "tags": [],
      "owner": {
        "subject": "model",
        "selector": {
          "unitIds": [
            "unit-commander-in-coldstar-battlesuit",
            "unit-commander-in-enforcer-battlesuit",
            "unit-commander-in-crisis-battlesuit"
          ],
          "noneKeywords": [
            "EPIC HERO"
          ]
        }
      },
      "assignment": {
        "maxOwners": 1,
        "enhancementChoices": 1,
        "payPointsPerOwner": true
      }
    },
    {
      "id": "enhancement-puretide-engram-neurochip",
      "title": "Puretide Engram Neurochip",
      "value": 15,
      "text": "T’AU EMPIRE BATTLESUIT model only. Each time you target the bearer’s unit with a Stratagem, roll one D6: on a 4+, you gain 1CP.",
      "termId": "tau-empire-enhancement-puretide-engram-neurochip",
      "detachmentId": "retaliation-cadre",
      "sourceBookId": "tau-empire",
      "legacyKey": "enhancement-puretide-engram-neurochip",
      "canonicalEnhancementId": "enhancement-puretide-engram-neurochip",
      "canonicalDetachmentId": "retaliation-cadre",
      "tags": [],
      "owner": {
        "subject": "model",
        "selector": {
          "unitIds": [
            "unit-commander-in-coldstar-battlesuit",
            "unit-commander-in-enforcer-battlesuit",
            "unit-commander-in-crisis-battlesuit"
          ],
          "noneKeywords": [
            "EPIC HERO"
          ]
        }
      },
      "assignment": {
        "maxOwners": 1,
        "enhancementChoices": 1,
        "payPointsPerOwner": true
      }
    },
    {
      "id": "enhancement-starflare-ignition-system",
      "title": "Starflare Ignition System",
      "value": 20,
      "text": "T’AU EMPIRE BATTLESUIT model only. At the end of your opponent’s turn, if the bearer’s unit is not within Engagement Range of one or more enemy units, you can remove that unit from the battlefield and place it into Strategic Reserves.",
      "termId": "tau-empire-enhancement-starflare-ignition-system",
      "detachmentId": "retaliation-cadre",
      "sourceBookId": "tau-empire",
      "legacyKey": "enhancement-starflare-ignition-system",
      "canonicalEnhancementId": "enhancement-starflare-ignition-system",
      "canonicalDetachmentId": "retaliation-cadre",
      "tags": [],
      "owner": {
        "subject": "model",
        "selector": {
          "unitIds": [
            "unit-commander-in-coldstar-battlesuit",
            "unit-commander-in-enforcer-battlesuit",
            "unit-commander-in-crisis-battlesuit"
          ],
          "noneKeywords": [
            "EPIC HERO"
          ]
        }
      },
      "assignment": {
        "maxOwners": 1,
        "enhancementChoices": 1,
        "payPointsPerOwner": true
      }
    },
    {
      "id": "enhancement-coordinated-exploitation",
      "title": "Coordinated Exploitation",
      "value": 30,
      "text": "T’AU EMPIRE model only (excluding KROOT SHAPER models). While the bearer is leading a unit, each time that unit is an Observer unit, until the end of the phase, ranged weapons equipped by models in a Guided unit have the [SUSTAINED HITS 1] ability while targeting their Spotted unit.",
      "termId": "tau-empire-enhancement-coordinated-exploitation",
      "detachmentId": "montka",
      "sourceBookId": "tau-empire",
      "legacyKey": "enhancement-coordinated-exploitation",
      "canonicalEnhancementId": "enhancement-coordinated-exploitation",
      "canonicalDetachmentId": "montka",
      "tags": [],
      "owner": {
        "subject": "model",
        "selector": {
          "unitIds": [
            "unit-cadre-fireblade",
            "unit-commander-in-coldstar-battlesuit",
            "unit-commander-in-enforcer-battlesuit",
            "unit-ethereal",
            "unit-firesight-team",
            "unit-kroot-lone-spear",
            "unit-commander-in-crisis-battlesuit"
          ],
          "noneKeywords": [
            "EPIC HERO"
          ]
        }
      },
      "assignment": {
        "maxOwners": 1,
        "enhancementChoices": 1,
        "payPointsPerOwner": true
      }
    },
    {
      "id": "enhancement-exemplar-of-the-montka",
      "title": "Exemplar of the Mont’ka",
      "value": 10,
      "text": "T’AU EMPIRE model only (excluding KROOT SHAPER models). While the bearer is leading a unit, the Killing Blow Detachment rule applies to that unit during the fourth battle round as well.",
      "termId": "tau-empire-enhancement-exemplar-of-the-montka",
      "detachmentId": "montka",
      "sourceBookId": "tau-empire",
      "legacyKey": "enhancement-exemplar-of-the-montka",
      "canonicalEnhancementId": "enhancement-exemplar-of-the-montka",
      "canonicalDetachmentId": "montka",
      "tags": [],
      "owner": {
        "subject": "model",
        "selector": {
          "unitIds": [
            "unit-cadre-fireblade",
            "unit-commander-in-coldstar-battlesuit",
            "unit-commander-in-enforcer-battlesuit",
            "unit-ethereal",
            "unit-firesight-team",
            "unit-kroot-lone-spear",
            "unit-commander-in-crisis-battlesuit"
          ],
          "noneKeywords": [
            "EPIC HERO"
          ]
        }
      },
      "assignment": {
        "maxOwners": 1,
        "enhancementChoices": 1,
        "payPointsPerOwner": true
      }
    },
    {
      "id": "enhancement-strategic-conqueror",
      "title": "Strategic Conqueror",
      "value": 15,
      "text": "T’AU EMPIRE model only. At the start of the first battle round, before the first turn begins, select one objective marker on the battlefield. While a friendly T’AU EMPIRE model is within range of that objective marker and the bearer is on the battlefield, add 1 to that friendly model’s Objective Control characteristic.",
      "termId": "tau-empire-enhancement-strategic-conqueror",
      "detachmentId": "montka",
      "sourceBookId": "tau-empire",
      "legacyKey": "enhancement-strategic-conqueror",
      "canonicalEnhancementId": "enhancement-strategic-conqueror",
      "canonicalDetachmentId": "montka",
      "tags": [],
      "owner": {
        "subject": "model",
        "selector": {
          "unitIds": [
            "unit-cadre-fireblade",
            "unit-commander-in-coldstar-battlesuit",
            "unit-commander-in-enforcer-battlesuit",
            "unit-ethereal",
            "unit-firesight-team",
            "unit-kroot-flesh-shaper",
            "unit-kroot-lone-spear",
            "unit-kroot-trail-shaper",
            "unit-kroot-war-shaper",
            "unit-commander-in-crisis-battlesuit"
          ],
          "noneKeywords": [
            "EPIC HERO"
          ]
        }
      },
      "assignment": {
        "maxOwners": 1,
        "enhancementChoices": 1,
        "payPointsPerOwner": true
      }
    },
    {
      "id": "enhancement-strike-swiftly",
      "title": "Strike Swiftly",
      "value": 45,
      "text": "T’AU EMPIRE model only. In the Resolve Pre-battle Abilities step, you can select up to two friendly T’AU EMPIRE units within 6\" of this model that do not have the Scouts ability. Until the end of the battle, all models in the selected units have the Scouts 6\" ability.",
      "termId": "tau-empire-enhancement-strike-swiftly",
      "detachmentId": "montka",
      "sourceBookId": "tau-empire",
      "legacyKey": "enhancement-strike-swiftly",
      "canonicalEnhancementId": "enhancement-strike-swiftly",
      "canonicalDetachmentId": "montka",
      "tags": [],
      "owner": {
        "subject": "model",
        "selector": {
          "unitIds": [
            "unit-cadre-fireblade",
            "unit-commander-in-coldstar-battlesuit",
            "unit-commander-in-enforcer-battlesuit",
            "unit-ethereal",
            "unit-firesight-team",
            "unit-kroot-flesh-shaper",
            "unit-kroot-lone-spear",
            "unit-kroot-trail-shaper",
            "unit-kroot-war-shaper",
            "unit-commander-in-crisis-battlesuit"
          ],
          "noneKeywords": [
            "EPIC HERO"
          ]
        }
      },
      "assignment": {
        "maxOwners": 1,
        "enhancementChoices": 1,
        "payPointsPerOwner": true
      }
    },
    {
      "id": "enhancement-borthrod-gland",
      "title": "Borthrod Gland",
      "value": 15,
      "text": "Kroot Flesh Shaper only. While the bearer is leading a unit, each time a model in that unit makes a melee attack, an unmodified Hit roll of 5+ scores a Critical Hit.",
      "termId": "tau-empire-enhancement-borthrod-gland",
      "detachmentId": "kroot-hunting-pack",
      "sourceBookId": "tau-empire",
      "legacyKey": "enhancement-borthrod-gland",
      "canonicalEnhancementId": "enhancement-borthrod-gland",
      "canonicalDetachmentId": "kroot-hunting-pack",
      "tags": [],
      "owner": {
        "subject": "model",
        "selector": {
          "unitIds": [
            "unit-kroot-flesh-shaper"
          ],
          "noneKeywords": [
            "EPIC HERO"
          ]
        }
      },
      "assignment": {
        "maxOwners": 1,
        "enhancementChoices": 1,
        "payPointsPerOwner": true
      }
    },
    {
      "id": "enhancement-kroothawk-flock",
      "title": "Kroothawk Flock",
      "value": 10,
      "text": "KROOT model only. Ranged weapons equipped by models in the bearer’s unit have the [IGNORES COVER] ability, and enemy units that are set up on the battlefield as Reinforcements cannot be set up within 12\" horizontally of the bearer.",
      "termId": "tau-empire-enhancement-kroothawk-flock",
      "detachmentId": "kroot-hunting-pack",
      "sourceBookId": "tau-empire",
      "legacyKey": "enhancement-kroothawk-flock",
      "canonicalEnhancementId": "enhancement-kroothawk-flock",
      "canonicalDetachmentId": "kroot-hunting-pack",
      "tags": [],
      "owner": {
        "subject": "model",
        "selector": {
          "unitIds": [
            "unit-kroot-flesh-shaper",
            "unit-kroot-lone-spear",
            "unit-kroot-trail-shaper",
            "unit-kroot-war-shaper"
          ],
          "noneKeywords": [
            "EPIC HERO"
          ]
        }
      },
      "assignment": {
        "maxOwners": 1,
        "enhancementChoices": 1,
        "payPointsPerOwner": true
      }
    },
    {
      "id": "enhancement-nomadic-hunter",
      "title": "Nomadic Hunter",
      "value": 20,
      "text": "KROOT TRAIL SHAPER model only. While the bearer is leading a unit, add 3\" to the Move characteristic of models in that unit and ranged weapons equipped by models in that unit have the [ASSAULT] ability.",
      "termId": "tau-empire-enhancement-nomadic-hunter",
      "detachmentId": "kroot-hunting-pack",
      "sourceBookId": "tau-empire",
      "legacyKey": "enhancement-nomadic-hunter",
      "canonicalEnhancementId": "enhancement-nomadic-hunter",
      "canonicalDetachmentId": "kroot-hunting-pack",
      "tags": [],
      "owner": {
        "subject": "model",
        "selector": {
          "unitIds": [
            "unit-kroot-trail-shaper"
          ],
          "noneKeywords": [
            "EPIC HERO"
          ]
        }
      },
      "assignment": {
        "maxOwners": 1,
        "enhancementChoices": 1,
        "payPointsPerOwner": true
      }
    },
    {
      "id": "enhancement-root-carved-weapons",
      "title": "Root-carved Weapons",
      "value": 10,
      "text": "Kroot War Shaper model only. All weapons equipped by the bearer have the [PRECISION] and [DEVASTATING WOUNDS] abilities.",
      "termId": "tau-empire-enhancement-root-carved-weapons",
      "detachmentId": "kroot-hunting-pack",
      "sourceBookId": "tau-empire",
      "legacyKey": "enhancement-root-carved-weapons",
      "canonicalEnhancementId": "enhancement-root-carved-weapons",
      "canonicalDetachmentId": "kroot-hunting-pack",
      "tags": [],
      "owner": {
        "subject": "model",
        "selector": {
          "unitIds": [
            "unit-kroot-war-shaper"
          ],
          "noneKeywords": [
            "EPIC HERO"
          ]
        }
      },
      "assignment": {
        "maxOwners": 1,
        "enhancementChoices": 1,
        "payPointsPerOwner": true
      }
    },
    {
      "id": "student-of-kauyon",
      "title": "Student of Kauyon",
      "text": "KROOT SHAPER model only. In the Declare Battle Formations step, you can select up to three friendly KROOT CARNIVORES/FARSTALKERS units. Those units have Deep Strike.",
      "sourcePages": [
        3
      ],
      "provenance": {
        "sourceId": "tau-empire-faction-pack-v1.1",
        "sourcePages": [
          3
        ]
      },
      "tags": [],
      "value": 20,
      "termId": "tau-empire-enhancement-student-of-kauyon",
      "detachmentId": "auxiliary-cadre",
      "sourceBookId": "tau-empire",
      "legacyKey": "student-of-kauyon",
      "canonicalEnhancementId": "student-of-kauyon",
      "canonicalDetachmentId": "auxiliary-cadre",
      "owner": {
        "subject": "model",
        "selector": {
          "unitIds": [
            "unit-kroot-flesh-shaper",
            "unit-kroot-trail-shaper",
            "unit-kroot-war-shaper"
          ],
          "noneKeywords": [
            "EPIC HERO"
          ]
        }
      },
      "assignment": {
        "maxOwners": 1,
        "enhancementChoices": 1,
        "payPointsPerOwner": true
      }
    },
    {
      "id": "admired-leader",
      "title": "Admired Leader",
      "text": "T’AU EMPIRE model only (excluding KROOT models). In your Command phase, you can select one KROOT/VESPID STINGWINGS unit within 12\" of this model. If you do, that unit has +1 Ld and OC until the start of your next Command phase.",
      "sourcePages": [
        3
      ],
      "provenance": {
        "sourceId": "tau-empire-faction-pack-v1.1",
        "sourcePages": [
          3
        ]
      },
      "tags": [],
      "value": 20,
      "termId": "tau-empire-enhancement-admired-leader",
      "detachmentId": "auxiliary-cadre",
      "sourceBookId": "tau-empire",
      "legacyKey": "admired-leader",
      "canonicalEnhancementId": "admired-leader",
      "canonicalDetachmentId": "auxiliary-cadre",
      "owner": {
        "subject": "model",
        "selector": {
          "unitIds": [
            "unit-cadre-fireblade",
            "unit-commander-in-coldstar-battlesuit",
            "unit-commander-in-enforcer-battlesuit",
            "unit-ethereal",
            "unit-firesight-team",
            "unit-commander-in-crisis-battlesuit"
          ],
          "noneKeywords": [
            "EPIC HERO"
          ]
        }
      },
      "assignment": {
        "maxOwners": 1,
        "enhancementChoices": 1,
        "payPointsPerOwner": true
      }
    }
  ],
  "effectContracts": [
    {
      "canonicalRecordId": "tau-empire-ability-coldstar-commander",
      "sourceKind": "ability",
      "sourceBookId": "tau-empire",
      "effectiveBookIds": [
        "tau-empire"
      ],
      "sourceUnitId": "unit-commander-in-coldstar-battlesuit",
      "scope": "attached-group",
      "selector": {
        "unitIds": [
          "unit-commander-in-coldstar-battlesuit"
        ]
      },
      "clauses": [
        {
          "selector": {},
          "conditions": [
            {
              "selector": {
                "on": "source",
                "sourceUnitIds": [
                  "unit-commander-in-coldstar-battlesuit"
                ],
                "requiresLeading": true
              }
            }
          ],
          "operations": [
            {
              "id": "coldstar-move",
              "canonicalTarget": "M",
              "parameters": {
                "to": "12\""
              },
              "type": "CHARACTERISTIC_SET"
            },
            {
              "id": "coldstar-assault",
              "canonicalTarget": "ranged",
              "parameters": {
                "tag": "ASSAULT",
                "termId": "core-assault"
              },
              "type": "WEAPON_TAG_GRANT"
            }
          ]
        }
      ],
      "timingState": {
        "kind": "CURRENT_ROSTER_STATE"
      },
      "stackingPolicy": "dedupe-effect-id",
      "source": {
        "sourceId": "tau-codex-transcription",
        "locator": "books/tau-empire/content/tau-empire-codex-parity.en.json#tau-empire-ability-coldstar-commander"
      },
      "confidence": "SOURCE_LIMITED"
    },
    {
      "canonicalRecordId": "tau-empire-ability-enforcer-commander",
      "sourceKind": "ability",
      "sourceBookId": "tau-empire",
      "effectiveBookIds": [
        "tau-empire"
      ],
      "sourceUnitId": "unit-commander-in-enforcer-battlesuit",
      "scope": "bodyguard",
      "selector": {
        "unitIds": [
          "unit-commander-in-enforcer-battlesuit"
        ]
      },
      "clauses": [
        {
          "selector": {},
          "conditions": [
            {
              "selector": {
                "on": "source",
                "sourceUnitIds": [
                  "unit-commander-in-enforcer-battlesuit"
                ],
                "requiresLeading": true
              }
            }
          ],
          "operations": [
            {
              "id": "canonical-tau-empire-ability-enforcer-commander",
              "canonicalTarget": "tau-empire-ability-enforcer-commander",
              "parameters": {
                "referenceKind": "ability"
              },
              "type": "CANONICAL_REFERENCE"
            }
          ]
        }
      ],
      "timingState": {
        "kind": "CURRENT_ROSTER_STATE"
      },
      "stackingPolicy": "dedupe-effect-id",
      "source": {
        "sourceId": "tau-codex-transcription",
        "locator": "books/tau-empire/content/tau-empire-codex-parity.en.json#tau-empire-ability-enforcer-commander"
      },
      "confidence": "SOURCE_LIMITED"
    },
    {
      "canonicalRecordId": "tau-empire-ability-failure-is-not-an-option",
      "sourceKind": "ability",
      "sourceBookId": "tau-empire",
      "effectiveBookIds": [
        "tau-empire"
      ],
      "sourceUnitId": "unit-ethereal",
      "scope": "attached-group",
      "selector": {
        "unitIds": [
          "unit-ethereal"
        ]
      },
      "clauses": [
        {
          "selector": {},
          "conditions": [
            {
              "selector": {
                "on": "source",
                "sourceUnitIds": [
                  "unit-ethereal"
                ],
                "requiresLeading": true
              }
            }
          ],
          "operations": [
            {
              "id": "ethereal-fnp",
              "canonicalTarget": "core-feel-no-pain",
              "parameters": {
                "title": "Feel No Pain 5+"
              },
              "type": "ABILITY_GRANT"
            }
          ]
        }
      ],
      "timingState": {
        "kind": "CURRENT_ROSTER_STATE"
      },
      "stackingPolicy": "dedupe-effect-id",
      "source": {
        "sourceId": "tau-codex-transcription",
        "locator": "books/tau-empire/content/tau-empire-codex-parity.en.json#tau-empire-ability-failure-is-not-an-option"
      },
      "confidence": "SOURCE_LIMITED"
    },
    {
      "canonicalRecordId": "tau-empire-ability-kroot-ambush",
      "sourceKind": "ability",
      "sourceBookId": "tau-empire",
      "effectiveBookIds": [
        "tau-empire"
      ],
      "sourceUnitId": "unit-kroot-trail-shaper",
      "scope": "bodyguard",
      "selector": {
        "unitIds": [
          "unit-kroot-trail-shaper"
        ]
      },
      "clauses": [
        {
          "selector": {},
          "conditions": [
            {
              "selector": {
                "on": "source",
                "sourceUnitIds": [
                  "unit-kroot-trail-shaper"
                ],
                "requiresLeading": true
              }
            }
          ],
          "operations": [
            {
              "id": "canonical-tau-empire-ability-kroot-ambush",
              "canonicalTarget": "tau-empire-ability-kroot-ambush",
              "parameters": {
                "referenceKind": "ability"
              },
              "type": "CANONICAL_REFERENCE"
            }
          ]
        }
      ],
      "timingState": {
        "kind": "CURRENT_ROSTER_STATE"
      },
      "stackingPolicy": "dedupe-effect-id",
      "source": {
        "sourceId": "tau-codex-transcription",
        "locator": "books/tau-empire/content/tau-empire-codex-parity.en.json#tau-empire-ability-kroot-ambush"
      },
      "confidence": "SOURCE_LIMITED"
    },
    {
      "canonicalRecordId": "tau-empire-ability-puretides-teachings",
      "sourceKind": "ability",
      "sourceBookId": "tau-empire",
      "effectiveBookIds": [
        "tau-empire"
      ],
      "sourceUnitId": "unit-commander-farsight",
      "scope": "bodyguard",
      "selector": {
        "unitIds": [
          "unit-commander-farsight"
        ]
      },
      "clauses": [
        {
          "selector": {},
          "conditions": [
            {
              "selector": {
                "on": "source",
                "sourceUnitIds": [
                  "unit-commander-farsight"
                ],
                "requiresLeading": true
              }
            }
          ],
          "operations": [
            {
              "id": "canonical-tau-empire-ability-puretides-teachings",
              "canonicalTarget": "tau-empire-ability-puretides-teachings",
              "parameters": {
                "referenceKind": "ability"
              },
              "type": "CANONICAL_REFERENCE"
            }
          ]
        }
      ],
      "timingState": {
        "kind": "CURRENT_ROSTER_STATE"
      },
      "stackingPolicy": "dedupe-effect-id",
      "source": {
        "sourceId": "tau-codex-transcription",
        "locator": "books/tau-empire/content/tau-empire-codex-parity.en.json#tau-empire-ability-puretides-teachings"
      },
      "confidence": "SOURCE_LIMITED"
    },
    {
      "canonicalRecordId": "tau-empire-ability-rites-of-feasting",
      "sourceKind": "ability",
      "sourceBookId": "tau-empire",
      "effectiveBookIds": [
        "tau-empire"
      ],
      "sourceUnitId": "unit-kroot-flesh-shaper",
      "scope": "attached-group",
      "selector": {
        "unitIds": [
          "unit-kroot-flesh-shaper"
        ]
      },
      "clauses": [
        {
          "selector": {},
          "conditions": [
            {
              "selector": {
                "on": "source",
                "sourceUnitIds": [
                  "unit-kroot-flesh-shaper"
                ],
                "requiresLeading": true
              }
            }
          ],
          "operations": [
            {
              "id": "rites-fnp",
              "canonicalTarget": "core-feel-no-pain",
              "parameters": {
                "title": "Feel No Pain 6+"
              },
              "type": "ABILITY_GRANT"
            },
            {
              "id": "canonical-tau-empire-ability-rites-of-feasting",
              "canonicalTarget": "tau-empire-ability-rites-of-feasting",
              "parameters": {
                "referenceKind": "ability"
              },
              "type": "CANONICAL_REFERENCE"
            }
          ]
        }
      ],
      "timingState": {
        "kind": "CURRENT_ROSTER_STATE"
      },
      "stackingPolicy": "dedupe-effect-id",
      "source": {
        "sourceId": "tau-codex-transcription",
        "locator": "books/tau-empire/content/tau-empire-codex-parity.en.json#tau-empire-ability-rites-of-feasting"
      },
      "confidence": "SOURCE_LIMITED"
    },
    {
      "canonicalRecordId": "tau-empire-ability-ritual-butchery",
      "sourceKind": "ability",
      "sourceBookId": "tau-empire",
      "effectiveBookIds": [
        "tau-empire"
      ],
      "sourceUnitId": "unit-kroot-flesh-shaper",
      "scope": "attached-group",
      "selector": {
        "unitIds": [
          "unit-kroot-flesh-shaper"
        ]
      },
      "clauses": [
        {
          "selector": {},
          "conditions": [
            {
              "selector": {
                "on": "source",
                "sourceUnitIds": [
                  "unit-kroot-flesh-shaper"
                ],
                "requiresLeading": true
              }
            }
          ],
          "operations": [
            {
              "id": "ritual-butchery",
              "canonicalTarget": "melee",
              "parameters": {
                "tag": "SUSTAINED HITS 1",
                "termId": "core-sustained-hits"
              },
              "type": "WEAPON_TAG_GRANT"
            }
          ]
        }
      ],
      "timingState": {
        "kind": "CURRENT_ROSTER_STATE"
      },
      "stackingPolicy": "dedupe-effect-id",
      "source": {
        "sourceId": "tau-codex-transcription",
        "locator": "books/tau-empire/content/tau-empire-codex-parity.en.json#tau-empire-ability-ritual-butchery"
      },
      "confidence": "SOURCE_LIMITED"
    },
    {
      "canonicalRecordId": "tau-empire-ability-structural-analyser",
      "sourceKind": "ability",
      "sourceBookId": "tau-empire",
      "effectiveBookIds": [
        "tau-empire"
      ],
      "sourceUnitId": "unit-darkstrider",
      "scope": "bodyguard",
      "selector": {
        "unitIds": [
          "unit-darkstrider"
        ]
      },
      "clauses": [
        {
          "selector": {},
          "conditions": [
            {
              "selector": {
                "on": "source",
                "sourceUnitIds": [
                  "unit-darkstrider"
                ],
                "requiresLeading": true
              }
            }
          ],
          "operations": [
            {
              "id": "canonical-tau-empire-ability-structural-analyser",
              "canonicalTarget": "tau-empire-ability-structural-analyser",
              "parameters": {
                "referenceKind": "ability"
              },
              "type": "CANONICAL_REFERENCE"
            }
          ]
        }
      ],
      "timingState": {
        "kind": "CURRENT_ROSTER_STATE"
      },
      "stackingPolicy": "dedupe-effect-id",
      "source": {
        "sourceId": "tau-codex-transcription",
        "locator": "books/tau-empire/content/tau-empire-codex-parity.en.json#tau-empire-ability-structural-analyser"
      },
      "confidence": "SOURCE_LIMITED"
    },
    {
      "canonicalRecordId": "tau-empire-ability-trail-finding",
      "sourceKind": "ability",
      "sourceBookId": "tau-empire",
      "effectiveBookIds": [
        "tau-empire"
      ],
      "sourceUnitId": "unit-kroot-trail-shaper",
      "scope": "bodyguard",
      "selector": {
        "unitIds": [
          "unit-kroot-trail-shaper"
        ]
      },
      "clauses": [
        {
          "selector": {},
          "conditions": [
            {
              "selector": {
                "on": "source",
                "sourceUnitIds": [
                  "unit-kroot-trail-shaper"
                ],
                "requiresLeading": true
              }
            }
          ],
          "operations": [
            {
              "id": "canonical-tau-empire-ability-trail-finding",
              "canonicalTarget": "tau-empire-ability-trail-finding",
              "parameters": {
                "referenceKind": "ability"
              },
              "type": "CANONICAL_REFERENCE"
            }
          ]
        }
      ],
      "timingState": {
        "kind": "CURRENT_ROSTER_STATE"
      },
      "stackingPolicy": "dedupe-effect-id",
      "source": {
        "sourceId": "tau-codex-transcription",
        "locator": "books/tau-empire/content/tau-empire-codex-parity.en.json#tau-empire-ability-trail-finding"
      },
      "confidence": "SOURCE_LIMITED"
    },
    {
      "canonicalRecordId": "tau-empire-ability-volley-fire",
      "sourceKind": "ability",
      "sourceBookId": "tau-empire",
      "effectiveBookIds": [
        "tau-empire"
      ],
      "sourceUnitId": "unit-cadre-fireblade",
      "scope": "attached-group",
      "selector": {
        "unitIds": [
          "unit-cadre-fireblade"
        ]
      },
      "clauses": [
        {
          "selector": {},
          "conditions": [
            {
              "selector": {
                "on": "source",
                "sourceUnitIds": [
                  "unit-cadre-fireblade"
                ],
                "requiresLeading": true
              }
            }
          ],
          "operations": [
            {
              "id": "volley-fire",
              "canonicalTarget": "ranged",
              "parameters": {
                "delta": 1,
                "stat": "A"
              },
              "type": "WEAPON_CHARACTERISTIC_ADD"
            }
          ]
        }
      ],
      "timingState": {
        "kind": "CURRENT_ROSTER_STATE"
      },
      "stackingPolicy": "dedupe-effect-id",
      "source": {
        "sourceId": "tau-codex-transcription",
        "locator": "books/tau-empire/content/tau-empire-codex-parity.en.json#tau-empire-ability-volley-fire"
      },
      "confidence": "SOURCE_LIMITED"
    },
    {
      "canonicalRecordId": "tau-empire-ability-war-leader",
      "sourceKind": "ability",
      "sourceBookId": "tau-empire",
      "effectiveBookIds": [
        "tau-empire"
      ],
      "sourceUnitId": "unit-kroot-war-shaper",
      "scope": "bodyguard",
      "selector": {
        "unitIds": [
          "unit-kroot-war-shaper"
        ]
      },
      "clauses": [
        {
          "selector": {},
          "conditions": [
            {
              "selector": {
                "on": "source",
                "sourceUnitIds": [
                  "unit-kroot-war-shaper"
                ],
                "requiresLeading": true
              }
            }
          ],
          "operations": [
            {
              "id": "canonical-tau-empire-ability-war-leader",
              "canonicalTarget": "tau-empire-ability-war-leader",
              "parameters": {
                "referenceKind": "ability"
              },
              "type": "CANONICAL_REFERENCE"
            }
          ]
        }
      ],
      "timingState": {
        "kind": "CURRENT_ROSTER_STATE"
      },
      "stackingPolicy": "dedupe-effect-id",
      "source": {
        "sourceId": "tau-codex-transcription",
        "locator": "books/tau-empire/content/tau-empire-codex-parity.en.json#tau-empire-ability-war-leader"
      },
      "confidence": "SOURCE_LIMITED"
    },
    {
      "canonicalRecordId": "tau-empire-ability-way-of-the-short-blade",
      "sourceKind": "ability",
      "sourceBookId": "tau-empire",
      "effectiveBookIds": [
        "tau-empire"
      ],
      "sourceUnitId": "unit-commander-farsight",
      "scope": "bodyguard",
      "selector": {
        "unitIds": [
          "unit-commander-farsight"
        ]
      },
      "clauses": [
        {
          "selector": {},
          "conditions": [
            {
              "selector": {
                "on": "source",
                "sourceUnitIds": [
                  "unit-commander-farsight"
                ],
                "requiresLeading": true
              }
            }
          ],
          "operations": [
            {
              "id": "canonical-tau-empire-ability-way-of-the-short-blade",
              "canonicalTarget": "tau-empire-ability-way-of-the-short-blade",
              "parameters": {
                "referenceKind": "ability"
              },
              "type": "CANONICAL_REFERENCE"
            }
          ]
        }
      ],
      "timingState": {
        "kind": "CURRENT_ROSTER_STATE"
      },
      "stackingPolicy": "dedupe-effect-id",
      "source": {
        "sourceId": "tau-codex-transcription",
        "locator": "books/tau-empire/content/tau-empire-codex-parity.en.json#tau-empire-ability-way-of-the-short-blade"
      },
      "confidence": "SOURCE_LIMITED"
    },
    {
      "canonicalRecordId": "tau-empire-detachment-rule-bonded-heroes",
      "sourceKind": "detachment-rule",
      "sourceBookId": "tau-empire",
      "effectiveBookIds": [
        "tau-empire"
      ],
      "detachmentId": "retaliation-cadre",
      "scope": "unit",
      "selector": {
        "allKeywords": [
          "BATTLESUIT"
        ]
      },
      "clauses": [
        {
          "selector": {},
          "conditions": [],
          "operations": [
            {
              "id": "canonical-tau-empire-detachment-rule-bonded-heroes",
              "canonicalTarget": "tau-empire-detachment-rule-bonded-heroes",
              "parameters": {
                "referenceKind": "detachment-rule"
              },
              "type": "CANONICAL_REFERENCE"
            }
          ]
        }
      ],
      "timingState": {
        "kind": "CURRENT_ROSTER_STATE"
      },
      "stackingPolicy": "dedupe-effect-id",
      "source": {
        "sourceId": "tau-codex-transcription",
        "locator": "books/tau-empire/content/tau-empire-codex-parity.en.json#tau-empire-detachment-rule-bonded-heroes"
      },
      "confidence": "SOURCE_LIMITED"
    },
    {
      "canonicalRecordId": "tau-empire-detachment-rule-expert-fieldcraft",
      "sourceKind": "detachment-rule",
      "sourceBookId": "tau-empire",
      "effectiveBookIds": [
        "tau-empire"
      ],
      "detachmentId": "advanced-acquisition-cadre",
      "scope": "unit",
      "selector": {
        "unitIds": [
          "unit-pathfinder-team",
          "unit-stealth-battlesuits"
        ]
      },
      "clauses": [
        {
          "selector": {},
          "conditions": [],
          "operations": [
            {
              "id": "canonical-tau-empire-detachment-rule-expert-fieldcraft",
              "canonicalTarget": "tau-empire-detachment-rule-expert-fieldcraft",
              "parameters": {
                "referenceKind": "detachment-rule"
              },
              "type": "CANONICAL_REFERENCE"
            }
          ]
        }
      ],
      "timingState": {
        "kind": "CURRENT_ROSTER_STATE"
      },
      "stackingPolicy": "dedupe-effect-id",
      "source": {
        "sourceId": "tau-codex-transcription",
        "locator": "books/tau-empire/content/tau-empire-codex-parity.en.json#tau-empire-detachment-rule-expert-fieldcraft"
      },
      "confidence": "SOURCE_LIMITED"
    },
    {
      "canonicalRecordId": "tau-empire-detachment-rule-hunters-instincts-skirmish-fighters",
      "sourceKind": "detachment-rule",
      "sourceBookId": "tau-empire",
      "effectiveBookIds": [
        "tau-empire"
      ],
      "detachmentId": "kroot-hunting-pack",
      "scope": "unit",
      "selector": {
        "allKeywords": [
          "KROOT"
        ]
      },
      "clauses": [
        {
          "selector": {},
          "conditions": [],
          "operations": [
            {
              "id": "canonical-tau-empire-detachment-rule-hunters-instincts-skirmish-fighters",
              "canonicalTarget": "tau-empire-detachment-rule-hunters-instincts-skirmish-fighters",
              "parameters": {
                "referenceKind": "detachment-rule"
              },
              "type": "CANONICAL_REFERENCE"
            }
          ]
        }
      ],
      "timingState": {
        "kind": "CURRENT_ROSTER_STATE"
      },
      "stackingPolicy": "dedupe-effect-id",
      "source": {
        "sourceId": "tau-codex-transcription",
        "locator": "books/tau-empire/content/tau-empire-codex-parity.en.json#tau-empire-detachment-rule-hunters-instincts-skirmish-fighters"
      },
      "confidence": "SOURCE_LIMITED"
    },
    {
      "canonicalRecordId": "tau-empire-detachment-rule-integrated-command-structure",
      "sourceKind": "detachment-rule",
      "sourceBookId": "tau-empire",
      "effectiveBookIds": [
        "tau-empire"
      ],
      "detachmentId": "auxiliary-cadre",
      "scope": "unit",
      "selector": {
        "any": [
          {
            "allKeywords": [
              "KROOT"
            ]
          },
          {
            "unitIds": [
              "unit-vespid-stingwings",
              "unit-ghostkeel-battlesuit",
              "unit-stealth-battlesuits"
            ]
          }
        ]
      },
      "clauses": [
        {
          "selector": {},
          "conditions": [],
          "operations": [
            {
              "id": "canonical-tau-empire-detachment-rule-integrated-command-structure",
              "canonicalTarget": "tau-empire-detachment-rule-integrated-command-structure",
              "parameters": {
                "referenceKind": "detachment-rule"
              },
              "type": "CANONICAL_REFERENCE"
            }
          ]
        }
      ],
      "timingState": {
        "kind": "CURRENT_ROSTER_STATE"
      },
      "stackingPolicy": "dedupe-effect-id",
      "source": {
        "sourceId": "tau-codex-transcription",
        "locator": "books/tau-empire/content/tau-empire-codex-parity.en.json#tau-empire-detachment-rule-integrated-command-structure"
      },
      "confidence": "SOURCE_LIMITED"
    },
    {
      "canonicalRecordId": "tau-empire-detachment-rule-killing-blow",
      "sourceKind": "detachment-rule",
      "sourceBookId": "tau-empire",
      "effectiveBookIds": [
        "tau-empire"
      ],
      "detachmentId": "montka",
      "scope": "unit",
      "selector": {
        "allKeywords": [
          "T'AU EMPIRE"
        ]
      },
      "clauses": [
        {
          "selector": {},
          "conditions": [],
          "operations": [
            {
              "id": "canonical-tau-empire-detachment-rule-killing-blow",
              "canonicalTarget": "tau-empire-detachment-rule-killing-blow",
              "parameters": {
                "referenceKind": "detachment-rule"
              },
              "type": "CANONICAL_REFERENCE"
            }
          ]
        }
      ],
      "timingState": {
        "kind": "CURRENT_ROSTER_STATE"
      },
      "stackingPolicy": "dedupe-effect-id",
      "source": {
        "sourceId": "tau-codex-transcription",
        "locator": "books/tau-empire/content/tau-empire-codex-parity.en.json#tau-empire-detachment-rule-killing-blow"
      },
      "confidence": "SOURCE_LIMITED"
    },
    {
      "canonicalRecordId": "tau-empire-detachment-rule-patient-hunter",
      "sourceKind": "detachment-rule",
      "sourceBookId": "tau-empire",
      "effectiveBookIds": [
        "tau-empire"
      ],
      "detachmentId": "kauyon",
      "scope": "unit",
      "selector": {
        "allKeywords": [
          "T'AU EMPIRE"
        ]
      },
      "clauses": [
        {
          "selector": {},
          "conditions": [],
          "operations": [
            {
              "id": "canonical-tau-empire-detachment-rule-patient-hunter",
              "canonicalTarget": "tau-empire-detachment-rule-patient-hunter",
              "parameters": {
                "referenceKind": "detachment-rule"
              },
              "type": "CANONICAL_REFERENCE"
            }
          ]
        }
      ],
      "timingState": {
        "kind": "CURRENT_ROSTER_STATE"
      },
      "stackingPolicy": "dedupe-effect-id",
      "source": {
        "sourceId": "tau-codex-transcription",
        "locator": "books/tau-empire/content/tau-empire-codex-parity.en.json#tau-empire-detachment-rule-patient-hunter"
      },
      "confidence": "SOURCE_LIMITED"
    },
    {
      "canonicalRecordId": "tau-empire-detachment-rule-superior-craftsmanship",
      "sourceKind": "detachment-rule",
      "sourceBookId": "tau-empire",
      "effectiveBookIds": [
        "tau-empire"
      ],
      "detachmentId": "experimental-prototype-cadre",
      "scope": "unit",
      "selector": {
        "allKeywords": [
          "BATTLESUIT",
          "CHARACTER"
        ]
      },
      "clauses": [
        {
          "selector": {},
          "conditions": [],
          "operations": [
            {
              "id": "superior-craftsmanship",
              "canonicalTarget": "ranged",
              "parameters": {
                "delta": 6,
                "stat": "Range"
              },
              "type": "WEAPON_CHARACTERISTIC_ADD"
            }
          ]
        }
      ],
      "timingState": {
        "kind": "CURRENT_ROSTER_STATE"
      },
      "stackingPolicy": "dedupe-effect-id",
      "source": {
        "sourceId": "tau-codex-transcription",
        "locator": "books/tau-empire/content/tau-empire-codex-parity.en.json#tau-empire-detachment-rule-superior-craftsmanship"
      },
      "confidence": "SOURCE_LIMITED"
    },
    {
      "canonicalRecordId": "enhancement-borthrod-gland",
      "sourceKind": "enhancement",
      "sourceBookId": "tau-empire",
      "effectiveBookIds": [
        "tau-empire"
      ],
      "detachmentId": "kroot-hunting-pack",
      "scope": "attached-group",
      "selector": {},
      "clauses": [
        {
          "selector": {},
          "conditions": [],
          "operations": [
            {
              "id": "borthrod-critical",
              "canonicalTarget": "melee",
              "parameters": {
                "tag": "CRITICAL HITS 5+"
              },
              "type": "WEAPON_TAG_GRANT"
            }
          ]
        }
      ],
      "timingState": {
        "kind": "CURRENT_ROSTER_STATE"
      },
      "stackingPolicy": "dedupe-effect-id",
      "source": {
        "sourceId": "tau-codex-transcription",
        "locator": "books/tau-empire/content/tau-empire-codex-parity.en.json#enhancement-borthrod-gland"
      },
      "confidence": "SOURCE_LIMITED"
    },
    {
      "canonicalRecordId": "enhancement-coordinated-exploitation",
      "sourceKind": "enhancement",
      "sourceBookId": "tau-empire",
      "effectiveBookIds": [
        "tau-empire"
      ],
      "detachmentId": "montka",
      "scope": "bodyguard",
      "selector": {},
      "clauses": [
        {
          "selector": {},
          "conditions": [],
          "operations": [
            {
              "id": "canonical-enhancement-coordinated-exploitation",
              "canonicalTarget": "enhancement-coordinated-exploitation",
              "parameters": {
                "referenceKind": "enhancement"
              },
              "type": "CANONICAL_REFERENCE"
            }
          ]
        }
      ],
      "timingState": {
        "kind": "CURRENT_ROSTER_STATE"
      },
      "stackingPolicy": "dedupe-effect-id",
      "source": {
        "sourceId": "tau-codex-transcription",
        "locator": "books/tau-empire/content/tau-empire-codex-parity.en.json#enhancement-coordinated-exploitation"
      },
      "confidence": "SOURCE_LIMITED"
    },
    {
      "canonicalRecordId": "enhancement-exemplar-of-the-kauyon",
      "sourceKind": "enhancement",
      "sourceBookId": "tau-empire",
      "effectiveBookIds": [
        "tau-empire"
      ],
      "detachmentId": "kauyon",
      "scope": "bodyguard",
      "selector": {},
      "clauses": [
        {
          "selector": {},
          "conditions": [],
          "operations": [
            {
              "id": "canonical-enhancement-exemplar-of-the-kauyon",
              "canonicalTarget": "enhancement-exemplar-of-the-kauyon",
              "parameters": {
                "referenceKind": "enhancement"
              },
              "type": "CANONICAL_REFERENCE"
            }
          ]
        }
      ],
      "timingState": {
        "kind": "CURRENT_ROSTER_STATE"
      },
      "stackingPolicy": "dedupe-effect-id",
      "source": {
        "sourceId": "tau-codex-transcription",
        "locator": "books/tau-empire/content/tau-empire-codex-parity.en.json#enhancement-exemplar-of-the-kauyon"
      },
      "confidence": "SOURCE_LIMITED"
    },
    {
      "canonicalRecordId": "enhancement-exemplar-of-the-montka",
      "sourceKind": "enhancement",
      "sourceBookId": "tau-empire",
      "effectiveBookIds": [
        "tau-empire"
      ],
      "detachmentId": "montka",
      "scope": "bodyguard",
      "selector": {},
      "clauses": [
        {
          "selector": {},
          "conditions": [],
          "operations": [
            {
              "id": "canonical-enhancement-exemplar-of-the-montka",
              "canonicalTarget": "enhancement-exemplar-of-the-montka",
              "parameters": {
                "referenceKind": "enhancement"
              },
              "type": "CANONICAL_REFERENCE"
            }
          ]
        }
      ],
      "timingState": {
        "kind": "CURRENT_ROSTER_STATE"
      },
      "stackingPolicy": "dedupe-effect-id",
      "source": {
        "sourceId": "tau-codex-transcription",
        "locator": "books/tau-empire/content/tau-empire-codex-parity.en.json#enhancement-exemplar-of-the-montka"
      },
      "confidence": "SOURCE_LIMITED"
    },
    {
      "canonicalRecordId": "enhancement-internal-grenade-racks",
      "sourceKind": "enhancement",
      "sourceBookId": "tau-empire",
      "effectiveBookIds": [
        "tau-empire"
      ],
      "detachmentId": "retaliation-cadre",
      "scope": "owner",
      "selector": {},
      "clauses": [
        {
          "selector": {},
          "conditions": [],
          "operations": [
            {
              "id": "internal-grenade-keyword",
              "canonicalTarget": "GRENADES",
              "parameters": {
                "keyword": "GRENADES"
              },
              "type": "KEYWORD_GRANT"
            },
            {
              "id": "canonical-enhancement-internal-grenade-racks",
              "canonicalTarget": "enhancement-internal-grenade-racks",
              "parameters": {
                "referenceKind": "enhancement"
              },
              "type": "CANONICAL_REFERENCE"
            }
          ]
        }
      ],
      "timingState": {
        "kind": "CURRENT_ROSTER_STATE"
      },
      "stackingPolicy": "dedupe-effect-id",
      "source": {
        "sourceId": "tau-codex-transcription",
        "locator": "books/tau-empire/content/tau-empire-codex-parity.en.json#enhancement-internal-grenade-racks"
      },
      "confidence": "SOURCE_LIMITED"
    },
    {
      "canonicalRecordId": "enhancement-kroothawk-flock",
      "sourceKind": "enhancement",
      "sourceBookId": "tau-empire",
      "effectiveBookIds": [
        "tau-empire"
      ],
      "detachmentId": "kroot-hunting-pack",
      "scope": "attached-group",
      "selector": {},
      "clauses": [
        {
          "selector": {},
          "conditions": [],
          "operations": [
            {
              "id": "kroothawk-cover",
              "canonicalTarget": "ranged",
              "parameters": {
                "tag": "IGNORES COVER",
                "termId": "core-ignores-cover"
              },
              "type": "WEAPON_TAG_GRANT"
            },
            {
              "id": "canonical-enhancement-kroothawk-flock",
              "canonicalTarget": "enhancement-kroothawk-flock",
              "parameters": {
                "referenceKind": "enhancement"
              },
              "type": "CANONICAL_REFERENCE"
            }
          ]
        }
      ],
      "timingState": {
        "kind": "CURRENT_ROSTER_STATE"
      },
      "stackingPolicy": "dedupe-effect-id",
      "source": {
        "sourceId": "tau-codex-transcription",
        "locator": "books/tau-empire/content/tau-empire-codex-parity.en.json#enhancement-kroothawk-flock"
      },
      "confidence": "SOURCE_LIMITED"
    },
    {
      "canonicalRecordId": "enhancement-nomadic-hunter",
      "sourceKind": "enhancement",
      "sourceBookId": "tau-empire",
      "effectiveBookIds": [
        "tau-empire"
      ],
      "detachmentId": "kroot-hunting-pack",
      "scope": "attached-group",
      "selector": {},
      "clauses": [
        {
          "selector": {},
          "conditions": [],
          "operations": [
            {
              "id": "nomadic-move",
              "canonicalTarget": "M",
              "parameters": {
                "delta": 3
              },
              "type": "CHARACTERISTIC_ADD"
            },
            {
              "id": "nomadic-assault",
              "canonicalTarget": "ranged",
              "parameters": {
                "tag": "ASSAULT",
                "termId": "core-assault"
              },
              "type": "WEAPON_TAG_GRANT"
            }
          ]
        }
      ],
      "timingState": {
        "kind": "CURRENT_ROSTER_STATE"
      },
      "stackingPolicy": "dedupe-effect-id",
      "source": {
        "sourceId": "tau-codex-transcription",
        "locator": "books/tau-empire/content/tau-empire-codex-parity.en.json#enhancement-nomadic-hunter"
      },
      "confidence": "SOURCE_LIMITED"
    },
    {
      "canonicalRecordId": "enhancement-precision-of-the-patient-hunter",
      "sourceKind": "enhancement",
      "sourceBookId": "tau-empire",
      "effectiveBookIds": [
        "tau-empire"
      ],
      "detachmentId": "kauyon",
      "scope": "owner",
      "selector": {},
      "clauses": [
        {
          "selector": {},
          "conditions": [],
          "operations": [
            {
              "id": "canonical-enhancement-precision-of-the-patient-hunter",
              "canonicalTarget": "enhancement-precision-of-the-patient-hunter",
              "parameters": {
                "referenceKind": "enhancement"
              },
              "type": "CANONICAL_REFERENCE"
            }
          ]
        }
      ],
      "timingState": {
        "kind": "CURRENT_ROSTER_STATE"
      },
      "stackingPolicy": "dedupe-effect-id",
      "source": {
        "sourceId": "tau-codex-transcription",
        "locator": "books/tau-empire/content/tau-empire-codex-parity.en.json#enhancement-precision-of-the-patient-hunter"
      },
      "confidence": "SOURCE_LIMITED"
    },
    {
      "canonicalRecordId": "enhancement-root-carved-weapons",
      "sourceKind": "enhancement",
      "sourceBookId": "tau-empire",
      "effectiveBookIds": [
        "tau-empire"
      ],
      "detachmentId": "kroot-hunting-pack",
      "scope": "owner",
      "selector": {},
      "clauses": [
        {
          "selector": {},
          "conditions": [],
          "operations": [
            {
              "id": "root-carved-precision",
              "canonicalTarget": "all",
              "parameters": {
                "tag": "PRECISION",
                "termId": "core-precision"
              },
              "type": "WEAPON_TAG_GRANT"
            },
            {
              "id": "root-carved-devastating",
              "canonicalTarget": "all",
              "parameters": {
                "tag": "DEVASTATING WOUNDS",
                "termId": "core-devastating-wounds"
              },
              "type": "WEAPON_TAG_GRANT"
            }
          ]
        }
      ],
      "timingState": {
        "kind": "CURRENT_ROSTER_STATE"
      },
      "stackingPolicy": "dedupe-effect-id",
      "source": {
        "sourceId": "tau-codex-transcription",
        "locator": "books/tau-empire/content/tau-empire-codex-parity.en.json#enhancement-root-carved-weapons"
      },
      "confidence": "SOURCE_LIMITED"
    },
    {
      "canonicalRecordId": "enhancement-through-unity-devastation",
      "sourceKind": "enhancement",
      "sourceBookId": "tau-empire",
      "effectiveBookIds": [
        "tau-empire"
      ],
      "detachmentId": "kauyon",
      "scope": "bodyguard",
      "selector": {},
      "clauses": [
        {
          "selector": {},
          "conditions": [],
          "operations": [
            {
              "id": "canonical-enhancement-through-unity-devastation",
              "canonicalTarget": "enhancement-through-unity-devastation",
              "parameters": {
                "referenceKind": "enhancement"
              },
              "type": "CANONICAL_REFERENCE"
            }
          ]
        }
      ],
      "timingState": {
        "kind": "CURRENT_ROSTER_STATE"
      },
      "stackingPolicy": "dedupe-effect-id",
      "source": {
        "sourceId": "tau-codex-transcription",
        "locator": "books/tau-empire/content/tau-empire-codex-parity.en.json#enhancement-through-unity-devastation"
      },
      "confidence": "SOURCE_LIMITED"
    },
    {
      "canonicalRecordId": "tau-empire-equipment-hover-drone",
      "sourceKind": "selected-wargear",
      "sourceBookId": "tau-empire",
      "effectiveBookIds": [
        "tau-empire"
      ],
      "scope": "owner",
      "selector": {
        "selectedWargearAbilityIds": [
          "unit-ethereal-wargear-ability-66ef7c251c"
        ],
        "equipmentFamilyId": "tau-empire-equipment-family-hover-drone"
      },
      "clauses": [
        {
          "selector": {},
          "conditions": [],
          "operations": [
            {
              "id": "hover-drone-move",
              "canonicalTarget": "M",
              "parameters": {
                "to": "10\""
              },
              "type": "CHARACTERISTIC_SET"
            },
            {
              "id": "hover-drone-fly",
              "canonicalTarget": "FLY",
              "parameters": {
                "keyword": "FLY"
              },
              "type": "KEYWORD_GRANT"
            }
          ]
        }
      ],
      "timingState": {
        "kind": "CURRENT_ROSTER_STATE"
      },
      "stackingPolicy": "dedupe-effect-id",
      "source": {
        "sourceId": "tau-codex-transcription",
        "locator": "books/tau-empire/content/tau-empire-codex-parity.en.json#tau-empire-equipment-hover-drone"
      },
      "confidence": "SOURCE_LIMITED"
    },
    {
      "canonicalRecordId": "tau-empire-equipment-marker-drone",
      "sourceKind": "selected-wargear",
      "sourceBookId": "tau-empire",
      "effectiveBookIds": [
        "tau-empire"
      ],
      "scope": "attached-group",
      "selector": {
        "selectedWargearAbilityIds": [
          "unit-breacher-team-wargear-ability-054fa4f2b6",
          "unit-broadside-battlesuits-wargear-ability-054fa4f2b6",
          "unit-cadre-fireblade-wargear-ability-054fa4f2b6",
          "unit-commander-in-coldstar-battlesuit-wargear-ability-054fa4f2b6",
          "unit-commander-in-enforcer-battlesuit-wargear-ability-054fa4f2b6",
          "unit-crisis-fireknife-battlesuits-wargear-ability-054fa4f2b6",
          "unit-crisis-starscythe-battlesuits-wargear-ability-054fa4f2b6",
          "unit-crisis-sunforge-battlesuits-wargear-ability-054fa4f2b6",
          "unit-ethereal-wargear-ability-054fa4f2b6",
          "unit-pathfinder-team-wargear-ability-054fa4f2b6",
          "unit-stealth-battlesuits-wargear-ability-054fa4f2b6",
          "unit-strike-team-wargear-ability-054fa4f2b6"
        ],
        "equipmentFamilyId": "tau-empire-equipment-family-marker-drone"
      },
      "clauses": [
        {
          "selector": {},
          "conditions": [],
          "operations": [
            {
              "id": "marker-drone-keyword",
              "canonicalTarget": "MARKERLIGHT",
              "parameters": {
                "keyword": "MARKERLIGHT"
              },
              "type": "KEYWORD_GRANT"
            }
          ]
        }
      ],
      "timingState": {
        "kind": "CURRENT_ROSTER_STATE"
      },
      "stackingPolicy": "dedupe-effect-id",
      "source": {
        "sourceId": "tau-codex-transcription",
        "locator": "books/tau-empire/content/tau-empire-codex-parity.en.json#tau-empire-equipment-marker-drone"
      },
      "confidence": "SOURCE_LIMITED"
    },
    {
      "canonicalRecordId": "tau-empire-equipment-mv15-gun-drone",
      "sourceKind": "selected-wargear",
      "sourceBookId": "tau-empire",
      "effectiveBookIds": [
        "tau-empire"
      ],
      "scope": "owner",
      "selector": {
        "selectedWargearAbilityIds": [
          "unit-the-twin-lance-wargear-ability-1668782923"
        ],
        "equipmentFamilyId": "tau-empire-equipment-family-mv15-gun-drone"
      },
      "clauses": [
        {
          "selector": {},
          "conditions": [],
          "operations": [
            {
              "id": "mv15-gun-drone-profile",
              "canonicalTarget": "profile-family:twin-pulse-blaster",
              "parameters": {
                "profileIds": [
                  "unit-the-twin-lance-profile-df5c6e42e9"
                ]
              },
              "type": "WEAPON_PROFILE_GRANT"
            }
          ]
        }
      ],
      "timingState": {
        "kind": "CURRENT_ROSTER_STATE"
      },
      "stackingPolicy": "dedupe-effect-id",
      "source": {
        "sourceId": "tau-codex-transcription",
        "locator": "books/tau-empire/content/tau-empire-codex-parity.en.json#tau-empire-equipment-mv15-gun-drone"
      },
      "confidence": "SOURCE_LIMITED"
    },
    {
      "canonicalRecordId": "tau-empire-equipment-pulse-accelerator-drone",
      "sourceKind": "selected-wargear",
      "sourceBookId": "tau-empire",
      "effectiveBookIds": [
        "tau-empire"
      ],
      "scope": "owner",
      "selector": {
        "selectedWargearAbilityIds": [
          "unit-pathfinder-team-wargear-ability-6169f4c0aa"
        ],
        "equipmentFamilyId": "tau-empire-equipment-family-pulse-accelerator-drone"
      },
      "clauses": [
        {
          "selector": {},
          "conditions": [],
          "operations": [
            {
              "id": "pulse-accelerator-range",
              "canonicalTarget": "profile-family:pulse-carbine",
              "parameters": {
                "delta": 6,
                "stat": "Range"
              },
              "type": "WEAPON_CHARACTERISTIC_ADD"
            }
          ]
        }
      ],
      "timingState": {
        "kind": "CURRENT_ROSTER_STATE"
      },
      "stackingPolicy": "dedupe-effect-id",
      "source": {
        "sourceId": "tau-codex-transcription",
        "locator": "books/tau-empire/content/tau-empire-codex-parity.en.json#tau-empire-equipment-pulse-accelerator-drone"
      },
      "confidence": "SOURCE_LIMITED"
    },
    {
      "canonicalRecordId": "tau-empire-equipment-recon-drone",
      "sourceKind": "selected-wargear",
      "sourceBookId": "tau-empire",
      "effectiveBookIds": [
        "tau-empire"
      ],
      "scope": "owner",
      "selector": {
        "selectedWargearAbilityIds": [
          "unit-pathfinder-team-wargear-ability-5c4f55de99"
        ],
        "equipmentFamilyId": "tau-empire-equipment-family-recon-drone"
      },
      "clauses": [
        {
          "selector": {},
          "conditions": [],
          "operations": [
            {
              "id": "recon-drone-infiltrators",
              "canonicalTarget": "core-infiltrators",
              "parameters": {
                "title": "Infiltrators"
              },
              "type": "ABILITY_GRANT"
            },
            {
              "id": "recon-drone-profile",
              "canonicalTarget": "profile-family:drone-burst-cannon",
              "parameters": {
                "profileIds": [
                  "unit-pathfinder-team-profile-dde20391e8"
                ]
              },
              "type": "WEAPON_PROFILE_GRANT"
            }
          ]
        }
      ],
      "timingState": {
        "kind": "CURRENT_ROSTER_STATE"
      },
      "stackingPolicy": "dedupe-effect-id",
      "source": {
        "sourceId": "tau-codex-transcription",
        "locator": "books/tau-empire/content/tau-empire-codex-parity.en.json#tau-empire-equipment-recon-drone"
      },
      "confidence": "SOURCE_LIMITED"
    },
    {
      "canonicalRecordId": "tau-empire-equipment-shield-drone",
      "sourceKind": "selected-wargear",
      "sourceBookId": "tau-empire",
      "effectiveBookIds": [
        "tau-empire"
      ],
      "scope": "owner",
      "selector": {
        "selectedWargearAbilityIds": [
          "unit-cadre-fireblade-wargear-ability-bc6aabc321",
          "unit-commander-in-coldstar-battlesuit-wargear-ability-bc6aabc321",
          "unit-commander-in-enforcer-battlesuit-wargear-ability-bc6aabc321",
          "unit-ethereal-wargear-ability-bc6aabc321"
        ],
        "equipmentFamilyId": "tau-empire-equipment-family-shield-drone"
      },
      "clauses": [
        {
          "selector": {},
          "conditions": [
            {
              "selector": {
                "modelCount": {
                  "operator": "eq",
                  "value": 1
                }
              }
            }
          ],
          "operations": [
            {
              "id": "shield-drone-wounds",
              "canonicalTarget": "W",
              "parameters": {
                "delta": 1
              },
              "type": "CHARACTERISTIC_ADD"
            }
          ]
        }
      ],
      "timingState": {
        "kind": "CURRENT_ROSTER_STATE"
      },
      "stackingPolicy": "dedupe-effect-id",
      "source": {
        "sourceId": "tau-codex-transcription",
        "locator": "books/tau-empire/content/tau-empire-codex-parity.en.json#tau-empire-equipment-shield-drone"
      },
      "confidence": "SOURCE_LIMITED"
    },
    {
      "canonicalRecordId": "tau-empire-equipment-shield-drone-physical-bearer",
      "sourceKind": "selected-wargear",
      "sourceBookId": "tau-empire",
      "effectiveBookIds": [
        "tau-empire"
      ],
      "sourceUnitIds": [
        "unit-breacher-team",
        "unit-broadside-battlesuits",
        "unit-crisis-fireknife-battlesuits",
        "unit-crisis-starscythe-battlesuits",
        "unit-crisis-sunforge-battlesuits",
        "unit-pathfinder-team",
        "unit-strike-team"
      ],
      "scope": "selected-physical-loadout",
      "selector": {
        "selectedWargearAbilityIds": [
          "unit-breacher-team-wargear-ability-bc6aabc321",
          "unit-broadside-battlesuits-wargear-ability-bc6aabc321",
          "unit-crisis-fireknife-battlesuits-wargear-ability-bc6aabc321",
          "unit-crisis-starscythe-battlesuits-wargear-ability-bc6aabc321",
          "unit-crisis-sunforge-battlesuits-wargear-ability-bc6aabc321",
          "unit-pathfinder-team-wargear-ability-bc6aabc321",
          "unit-strike-team-wargear-ability-bc6aabc321"
        ],
        "equipmentFamilyId": "tau-empire-equipment-family-shield-drone",
        "equippedBy": "selected-physical-loadout"
      },
      "clauses": [
        {
          "selector": {},
          "conditions": [],
          "operations": [
            {
              "id": "shield-drone-physical-bearer-wounds",
              "canonicalTarget": "W",
              "parameters": {
                "delta": 1,
                "physicalBearer": {
                  "modelProfileBindings": [
                    {
                      "modelId": "unit-breacher-team-model-a7a3087a51",
                      "statProfileId": "unit-breacher-team-stat-profile-083d18e754"
                    },
                    {
                      "modelId": "unit-strike-team-model-eb1dbfb325",
                      "statProfileId": "unit-strike-team-stat-profile-f3ae893d84"
                    },
                    {
                      "modelId": "unit-pathfinder-team-model-ec8a3938e5",
                      "statProfileId": "unit-pathfinder-team-stat-profile-0cb3bf9364"
                    },
                    {
                      "modelId": "unit-broadside-battlesuits-model-0f703d9afd",
                      "statProfileId": "unit-broadside-battlesuits-stat-profile-4b93854ddd"
                    },
                    {
                      "modelId": "unit-broadside-battlesuits-model-ebe683fa53",
                      "statProfileId": "unit-broadside-battlesuits-stat-profile-47a23866d2"
                    },
                    {
                      "modelId": "unit-crisis-fireknife-battlesuits-model-b4425cd84a",
                      "statProfileId": "unit-crisis-fireknife-battlesuits-stat-profile-e8201e85a7"
                    },
                    {
                      "modelId": "unit-crisis-fireknife-battlesuits-model-fa4f0b73fd",
                      "statProfileId": "unit-crisis-fireknife-battlesuits-stat-profile-cdb4b0025c"
                    },
                    {
                      "modelId": "unit-crisis-starscythe-battlesuits-model-0239836895",
                      "statProfileId": "unit-crisis-starscythe-battlesuits-stat-profile-7eba053fbb"
                    },
                    {
                      "modelId": "unit-crisis-starscythe-battlesuits-model-1a13af313d",
                      "statProfileId": "unit-crisis-starscythe-battlesuits-stat-profile-3452ddf1d6"
                    },
                    {
                      "modelId": "unit-crisis-sunforge-battlesuits-model-90f7a72c26",
                      "statProfileId": "unit-crisis-sunforge-battlesuits-stat-profile-9fc5cf089e"
                    },
                    {
                      "modelId": "unit-crisis-sunforge-battlesuits-model-23c0c86995",
                      "statProfileId": "unit-crisis-sunforge-battlesuits-stat-profile-9fc5cf089e"
                    }
                  ]
                }
              },
              "type": "CHARACTERISTIC_ADD"
            }
          ]
        }
      ],
      "timingState": {
        "kind": "CURRENT_ROSTER_STATE"
      },
      "stackingPolicy": "apply-once-per-source",
      "source": {
        "sourceId": "tau-empire-waha-11e-current-2026-09-28",
        "locator": "books/tau-empire/content/tau-empire-codex-datasheets.en.json#shield-drone"
      },
      "confidence": "VERIFIED_CURRENT"
    },
    {
      "canonicalRecordId": "tau-empire-equipment-shield-generator",
      "sourceKind": "selected-wargear",
      "sourceBookId": "tau-empire",
      "effectiveBookIds": [
        "tau-empire"
      ],
      "scope": "owner",
      "selector": {
        "selectedWargearAbilityIds": [
          "unit-commander-in-coldstar-battlesuit-wargear-ability-bf1c946221",
          "unit-commander-in-enforcer-battlesuit-wargear-ability-bf1c946221"
        ],
        "equipmentFamilyId": "tau-empire-equipment-family-shield-generator"
      },
      "clauses": [
        {
          "selector": {},
          "conditions": [],
          "operations": [
            {
              "id": "shield-generator-invulnerable",
              "canonicalTarget": "core-invulnerable-save",
              "parameters": {
                "title": "Invulnerable Save 4+"
              },
              "type": "ABILITY_GRANT"
            }
          ]
        }
      ],
      "timingState": {
        "kind": "CURRENT_ROSTER_STATE"
      },
      "stackingPolicy": "dedupe-effect-id",
      "source": {
        "sourceId": "tau-codex-transcription",
        "locator": "books/tau-empire/content/tau-empire-codex-parity.en.json#tau-empire-equipment-shield-generator"
      },
      "confidence": "SOURCE_LIMITED"
    },
    {
      "canonicalRecordId": "tau-empire-equipment-tidewall-defence-platform",
      "sourceKind": "selected-wargear",
      "sourceBookId": "tau-empire",
      "effectiveBookIds": [
        "tau-empire"
      ],
      "scope": "owner",
      "selector": {
        "selectedWargearAbilityIds": [
          "unit-tidewall-shieldline-wargear-ability-44f6788bd4"
        ],
        "equipmentFamilyId": "tau-empire-equipment-family-tidewall-defence-platform"
      },
      "clauses": [
        {
          "selector": {},
          "conditions": [],
          "operations": [
            {
              "id": "defence-platform-wounds",
              "canonicalTarget": "W",
              "parameters": {
                "to": "15"
              },
              "type": "CHARACTERISTIC_SET"
            }
          ]
        }
      ],
      "timingState": {
        "kind": "CURRENT_ROSTER_STATE"
      },
      "stackingPolicy": "dedupe-effect-id",
      "source": {
        "sourceId": "tau-codex-transcription",
        "locator": "books/tau-empire/content/tau-empire-codex-parity.en.json#tau-empire-equipment-tidewall-defence-platform"
      },
      "confidence": "SOURCE_LIMITED"
    },
    {
      "canonicalRecordId": "unit-kroot-farstalkers-wargear-ability-bc9d7dbfd0",
      "sourceKind": "selected-wargear",
      "sourceBookId": "tau-empire",
      "effectiveBookIds": [
        "tau-empire"
      ],
      "sourceUnitId": "unit-kroot-farstalkers",
      "scope": "owner-or-attached-group",
      "selector": {
        "kind": "selected-canonical-wargear-ability",
        "sourceUnitIds": [
          "unit-kroot-farstalkers"
        ],
        "selectedWargearAbilityIds": [
          "unit-kroot-farstalkers-wargear-ability-bc9d7dbfd0"
        ]
      },
      "clauses": [
        {
          "selector": {
            "subject": "unit",
            "weaponMode": "ranged"
          },
          "conditions": [],
          "operations": [
            {
              "id": "kroot-farstalkers-pechra-ignores-cover",
              "type": "WEAPON_TAG_GRANT",
              "canonicalTarget": "ranged",
              "parameters": {
                "tag": "IGNORES COVER",
                "termId": "core-ignores-cover"
              }
            }
          ]
        }
      ],
      "timingState": {
        "kind": "while-selected"
      },
      "stackingPolicy": "apply-once-per-source",
      "source": {
        "sourceId": "tau-empire-waha-11e-current-2026-09-28",
        "locator": "books/tau-empire/content/tau-empire-codex-datasheets.en.json#unit-kroot-farstalkers#datasheet-kroot-farstalkers:section:1"
      },
      "confidence": "VERIFIED_CURRENT"
    },
    {
      "canonicalRecordId": "unit-tiger-shark-wargear-ability-5971dd9eb6",
      "sourceKind": "selected-wargear",
      "sourceBookId": "tau-empire",
      "effectiveBookIds": [
        "tau-empire"
      ],
      "sourceUnitId": "unit-tiger-shark",
      "scope": "selected-physical-loadout",
      "selector": {
        "kind": "selected-canonical-wargear-ability",
        "sourceUnitIds": [
          "unit-tiger-shark"
        ],
        "selectedWargearAbilityIds": [
          "unit-tiger-shark-wargear-ability-5971dd9eb6"
        ]
      },
      "clauses": [
        {
          "selector": {},
          "conditions": [],
          "operations": [
            {
              "id": "tiger-shark-transport-bay-keyword",
              "type": "KEYWORD_GRANT",
              "canonicalTarget": "TRANSPORT",
              "parameters": {
                "keyword": "TRANSPORT"
              }
            },
            {
              "id": "tiger-shark-transport-bay-capacity",
              "type": "TRANSPORT_CAPACITY_SET",
              "canonicalTarget": "transport-capacity",
              "parameters": {
                "capacity": 12,
                "restriction": {
                  "allKeywords": [
                    "TACTICAL DRONES"
                  ],
                  "subject": "models"
                }
              }
            }
          ]
        }
      ],
      "timingState": {
        "kind": "while-selected"
      },
      "stackingPolicy": "apply-once-per-source",
      "source": {
        "sourceId": "tau-empire-waha-11e-current-2026-09-28",
        "locator": "books/tau-empire/content/tau-empire-codex-datasheets.en.json#unit-tiger-shark#datasheet-tiger-shark:section:1"
      },
      "confidence": "VERIFIED_CURRENT"
    }
  ]
});
window.WH_BOOK_ROSTER_ENHANCEMENTS=Object.freeze({
  "exemplar of the kauyon": {
    "title": "Exemplar of the Kauyon",
    "text": "T’AU EMPIRE model only (excluding KROOT SHAPER models). While the bearer is leading a unit, the Patient Hunter Detachment rule applies to that unit from the second battle round onwards instead of from the third.",
    "value": 20,
    "detachment": "KAUYON",
    "tags": [],
    "owner": {
      "subject": "model",
      "selector": {
        "unitIds": [
          "unit-cadre-fireblade",
          "unit-commander-in-coldstar-battlesuit",
          "unit-commander-in-enforcer-battlesuit",
          "unit-ethereal",
          "unit-firesight-team",
          "unit-kroot-lone-spear",
          "unit-commander-in-crisis-battlesuit"
        ],
        "noneKeywords": [
          "EPIC HERO"
        ]
      }
    },
    "assignment": {
      "maxOwners": 1,
      "enhancementChoices": 1,
      "payPointsPerOwner": true
    }
  },
  "precision of the patient hunter": {
    "title": "Precision of the Patient Hunter",
    "text": "T’AU EMPIRE model only. Each time the bearer makes a ranged attack, add 1 to the Hit roll. From the third battle round onwards, add 1 to the Wound roll as well.",
    "value": 15,
    "detachment": "KAUYON",
    "tags": [],
    "owner": {
      "subject": "model",
      "selector": {
        "unitIds": [
          "unit-cadre-fireblade",
          "unit-commander-in-coldstar-battlesuit",
          "unit-commander-in-enforcer-battlesuit",
          "unit-ethereal",
          "unit-firesight-team",
          "unit-kroot-flesh-shaper",
          "unit-kroot-lone-spear",
          "unit-kroot-trail-shaper",
          "unit-kroot-war-shaper",
          "unit-commander-in-crisis-battlesuit"
        ],
        "noneKeywords": [
          "EPIC HERO"
        ]
      }
    },
    "assignment": {
      "maxOwners": 1,
      "enhancementChoices": 1,
      "payPointsPerOwner": true
    }
  },
  "solid image projection unit": {
    "title": "Solid-image Projection Unit",
    "text": "T’AU EMPIRE model only. After both players have deployed their armies, select up to three T’AU EMPIRE units from your army and redeploy them. When doing so, you can set those units up in Strategic Reserves if you wish, regardless of how many units are already in Strategic Reserves.",
    "value": 20,
    "detachment": "KAUYON",
    "tags": [],
    "owner": {
      "subject": "model",
      "selector": {
        "unitIds": [
          "unit-cadre-fireblade",
          "unit-commander-in-coldstar-battlesuit",
          "unit-commander-in-enforcer-battlesuit",
          "unit-ethereal",
          "unit-firesight-team",
          "unit-kroot-flesh-shaper",
          "unit-kroot-lone-spear",
          "unit-kroot-trail-shaper",
          "unit-kroot-war-shaper",
          "unit-commander-in-crisis-battlesuit"
        ],
        "noneKeywords": [
          "EPIC HERO"
        ]
      }
    },
    "assignment": {
      "maxOwners": 1,
      "enhancementChoices": 1,
      "payPointsPerOwner": true
    }
  },
  "through unity devastation": {
    "title": "Through Unity, Devastation",
    "text": "T’AU EMPIRE model only (excluding KROOT SHAPER models). While the bearer is leading a unit, each time that unit is an Observer unit, until the end of the phase, ranged weapons equipped by models in a Guided unit have the [LETHAL HITS] ability while targeting their Spotted unit.",
    "value": 30,
    "detachment": "KAUYON",
    "tags": [],
    "owner": {
      "subject": "model",
      "selector": {
        "unitIds": [
          "unit-cadre-fireblade",
          "unit-commander-in-coldstar-battlesuit",
          "unit-commander-in-enforcer-battlesuit",
          "unit-ethereal",
          "unit-firesight-team",
          "unit-kroot-lone-spear",
          "unit-commander-in-crisis-battlesuit"
        ],
        "noneKeywords": [
          "EPIC HERO"
        ]
      }
    },
    "assignment": {
      "maxOwners": 1,
      "enhancementChoices": 1,
      "payPointsPerOwner": true
    }
  },
  "thermoneutronic projector": {
    "title": "Thermoneutronic Projector",
    "text": "BATTLESUIT model only. In the Declare Battle Formations step, select one of this model’s T’au Flamer weapons. That weapon’s attacks have: +2 S; +1 AP and D.",
    "value": 15,
    "detachment": "EXPERIMENTAL PROTOTYPE CADRE",
    "tags": [],
    "owner": {
      "subject": "model",
      "selector": {
        "unitIds": [
          "unit-commander-in-coldstar-battlesuit",
          "unit-commander-in-enforcer-battlesuit",
          "unit-commander-in-crisis-battlesuit"
        ],
        "noneKeywords": [
          "EPIC HERO"
        ]
      }
    },
    "assignment": {
      "maxOwners": 1,
      "enhancementChoices": 1,
      "payPointsPerOwner": true
    }
  },
  "plasma accelerator rifle": {
    "title": "Plasma Accelerator Rifle",
    "text": "BATTLESUIT model only. In the Declare Battle Formations step, select one of this model’s Plasma Rifle weapons. That weapon’s attacks have: +2 S; +1 A, AP and D.",
    "value": 20,
    "detachment": "EXPERIMENTAL PROTOTYPE CADRE",
    "tags": [],
    "owner": {
      "subject": "model",
      "selector": {
        "unitIds": [
          "unit-commander-in-coldstar-battlesuit",
          "unit-commander-in-enforcer-battlesuit",
          "unit-commander-in-crisis-battlesuit"
        ],
        "noneKeywords": [
          "EPIC HERO"
        ]
      }
    },
    "assignment": {
      "maxOwners": 1,
      "enhancementChoices": 1,
      "payPointsPerOwner": true
    }
  },
  "supernova launcher": {
    "title": "Supernova Launcher",
    "text": "BATTLESUIT model only. In the Declare Battle Formations step, select one of this model’s Airbursting Fragmentation Projector weapons. That weapon’s attacks have: +3 S; +1 AP and D.",
    "value": 15,
    "detachment": "EXPERIMENTAL PROTOTYPE CADRE",
    "tags": [],
    "owner": {
      "subject": "model",
      "selector": {
        "unitIds": [
          "unit-commander-in-coldstar-battlesuit",
          "unit-commander-in-enforcer-battlesuit",
          "unit-commander-in-crisis-battlesuit"
        ],
        "noneKeywords": [
          "EPIC HERO"
        ]
      }
    },
    "assignment": {
      "maxOwners": 1,
      "enhancementChoices": 1,
      "payPointsPerOwner": true
    }
  },
  "negation emitters": {
    "title": "Negation Emitters",
    "text": "STEALTH BATTLESUITS unit only. This unit has -3\" detection range.",
    "value": 15,
    "detachment": "ADVANCED ACQUISITION CADRE",
    "tags": [
      "UPGRADE"
    ],
    "owner": {
      "subject": "unit",
      "selector": {
        "unitIds": [
          "unit-stealth-battlesuits"
        ],
        "noneKeywords": [
          "EPIC HERO"
        ]
      }
    },
    "assignment": {
      "maxOwners": 3,
      "enhancementChoices": 1,
      "payPointsPerOwner": true
    }
  },
  "unmasking suite": {
    "title": "Unmasking Suite",
    "text": "GHOSTKEEL BATTLESUIT/PATHFINDER TEAM/STEALTH BATTLESUITS unit only. When this unit is selected to shoot, you can select one enemy unit within 24\" of this unit. That enemy unit has +9\" detection range until this unit has shot.",
    "value": 15,
    "detachment": "ADVANCED ACQUISITION CADRE",
    "tags": [
      "UPGRADE"
    ],
    "owner": {
      "subject": "unit",
      "selector": {
        "unitIds": [
          "unit-pathfinder-team",
          "unit-stealth-battlesuits",
          "unit-ghostkeel-battlesuit"
        ],
        "noneKeywords": [
          "EPIC HERO"
        ]
      }
    },
    "assignment": {
      "maxOwners": 3,
      "enhancementChoices": 1,
      "payPointsPerOwner": true
    }
  },
  "internal grenade racks": {
    "title": "Internal Grenade Racks",
    "text": "T’AU EMPIRE BATTLESUIT model only. The bearer has the GRENADES keyword, and each time the bearer ends a Normal move, you can select one enemy unit that it moved over during that move. If you do, roll six D6: for each 4+, that enemy unit suffers 1 mortal wound.",
    "value": 20,
    "detachment": "RETALIATION CADRE",
    "tags": [],
    "owner": {
      "subject": "model",
      "selector": {
        "unitIds": [
          "unit-commander-in-coldstar-battlesuit",
          "unit-commander-in-enforcer-battlesuit",
          "unit-commander-in-crisis-battlesuit"
        ],
        "noneKeywords": [
          "EPIC HERO"
        ]
      }
    },
    "assignment": {
      "maxOwners": 1,
      "enhancementChoices": 1,
      "payPointsPerOwner": true
    }
  },
  "prototype weapon system": {
    "title": "Prototype Weapon System",
    "text": "T’AU EMPIRE BATTLESUIT model only. Each time the bearer is selected to shoot, select either the [LETHAL HITS] or [SUSTAINED HITS 1] ability. Until those attacks are resolved, ranged weapons equipped by the bearer have the selected ability.",
    "value": 15,
    "detachment": "RETALIATION CADRE",
    "tags": [],
    "owner": {
      "subject": "model",
      "selector": {
        "unitIds": [
          "unit-commander-in-coldstar-battlesuit",
          "unit-commander-in-enforcer-battlesuit",
          "unit-commander-in-crisis-battlesuit"
        ],
        "noneKeywords": [
          "EPIC HERO"
        ]
      }
    },
    "assignment": {
      "maxOwners": 1,
      "enhancementChoices": 1,
      "payPointsPerOwner": true
    }
  },
  "puretide engram neurochip": {
    "title": "Puretide Engram Neurochip",
    "text": "T’AU EMPIRE BATTLESUIT model only. Each time you target the bearer’s unit with a Stratagem, roll one D6: on a 4+, you gain 1CP.",
    "value": 15,
    "detachment": "RETALIATION CADRE",
    "tags": [],
    "owner": {
      "subject": "model",
      "selector": {
        "unitIds": [
          "unit-commander-in-coldstar-battlesuit",
          "unit-commander-in-enforcer-battlesuit",
          "unit-commander-in-crisis-battlesuit"
        ],
        "noneKeywords": [
          "EPIC HERO"
        ]
      }
    },
    "assignment": {
      "maxOwners": 1,
      "enhancementChoices": 1,
      "payPointsPerOwner": true
    }
  },
  "starflare ignition system": {
    "title": "Starflare Ignition System",
    "text": "T’AU EMPIRE BATTLESUIT model only. At the end of your opponent’s turn, if the bearer’s unit is not within Engagement Range of one or more enemy units, you can remove that unit from the battlefield and place it into Strategic Reserves.",
    "value": 20,
    "detachment": "RETALIATION CADRE",
    "tags": [],
    "owner": {
      "subject": "model",
      "selector": {
        "unitIds": [
          "unit-commander-in-coldstar-battlesuit",
          "unit-commander-in-enforcer-battlesuit",
          "unit-commander-in-crisis-battlesuit"
        ],
        "noneKeywords": [
          "EPIC HERO"
        ]
      }
    },
    "assignment": {
      "maxOwners": 1,
      "enhancementChoices": 1,
      "payPointsPerOwner": true
    }
  },
  "coordinated exploitation": {
    "title": "Coordinated Exploitation",
    "text": "T’AU EMPIRE model only (excluding KROOT SHAPER models). While the bearer is leading a unit, each time that unit is an Observer unit, until the end of the phase, ranged weapons equipped by models in a Guided unit have the [SUSTAINED HITS 1] ability while targeting their Spotted unit.",
    "value": 30,
    "detachment": "MONT’KA",
    "tags": [],
    "owner": {
      "subject": "model",
      "selector": {
        "unitIds": [
          "unit-cadre-fireblade",
          "unit-commander-in-coldstar-battlesuit",
          "unit-commander-in-enforcer-battlesuit",
          "unit-ethereal",
          "unit-firesight-team",
          "unit-kroot-lone-spear",
          "unit-commander-in-crisis-battlesuit"
        ],
        "noneKeywords": [
          "EPIC HERO"
        ]
      }
    },
    "assignment": {
      "maxOwners": 1,
      "enhancementChoices": 1,
      "payPointsPerOwner": true
    }
  },
  "exemplar of the mont ka": {
    "title": "Exemplar of the Mont’ka",
    "text": "T’AU EMPIRE model only (excluding KROOT SHAPER models). While the bearer is leading a unit, the Killing Blow Detachment rule applies to that unit during the fourth battle round as well.",
    "value": 10,
    "detachment": "MONT’KA",
    "tags": [],
    "owner": {
      "subject": "model",
      "selector": {
        "unitIds": [
          "unit-cadre-fireblade",
          "unit-commander-in-coldstar-battlesuit",
          "unit-commander-in-enforcer-battlesuit",
          "unit-ethereal",
          "unit-firesight-team",
          "unit-kroot-lone-spear",
          "unit-commander-in-crisis-battlesuit"
        ],
        "noneKeywords": [
          "EPIC HERO"
        ]
      }
    },
    "assignment": {
      "maxOwners": 1,
      "enhancementChoices": 1,
      "payPointsPerOwner": true
    }
  },
  "strategic conqueror": {
    "title": "Strategic Conqueror",
    "text": "T’AU EMPIRE model only. At the start of the first battle round, before the first turn begins, select one objective marker on the battlefield. While a friendly T’AU EMPIRE model is within range of that objective marker and the bearer is on the battlefield, add 1 to that friendly model’s Objective Control characteristic.",
    "value": 15,
    "detachment": "MONT’KA",
    "tags": [],
    "owner": {
      "subject": "model",
      "selector": {
        "unitIds": [
          "unit-cadre-fireblade",
          "unit-commander-in-coldstar-battlesuit",
          "unit-commander-in-enforcer-battlesuit",
          "unit-ethereal",
          "unit-firesight-team",
          "unit-kroot-flesh-shaper",
          "unit-kroot-lone-spear",
          "unit-kroot-trail-shaper",
          "unit-kroot-war-shaper",
          "unit-commander-in-crisis-battlesuit"
        ],
        "noneKeywords": [
          "EPIC HERO"
        ]
      }
    },
    "assignment": {
      "maxOwners": 1,
      "enhancementChoices": 1,
      "payPointsPerOwner": true
    }
  },
  "strike swiftly": {
    "title": "Strike Swiftly",
    "text": "T’AU EMPIRE model only. In the Resolve Pre-battle Abilities step, you can select up to two friendly T’AU EMPIRE units within 6\" of this model that do not have the Scouts ability. Until the end of the battle, all models in the selected units have the Scouts 6\" ability.",
    "value": 45,
    "detachment": "MONT’KA",
    "tags": [],
    "owner": {
      "subject": "model",
      "selector": {
        "unitIds": [
          "unit-cadre-fireblade",
          "unit-commander-in-coldstar-battlesuit",
          "unit-commander-in-enforcer-battlesuit",
          "unit-ethereal",
          "unit-firesight-team",
          "unit-kroot-flesh-shaper",
          "unit-kroot-lone-spear",
          "unit-kroot-trail-shaper",
          "unit-kroot-war-shaper",
          "unit-commander-in-crisis-battlesuit"
        ],
        "noneKeywords": [
          "EPIC HERO"
        ]
      }
    },
    "assignment": {
      "maxOwners": 1,
      "enhancementChoices": 1,
      "payPointsPerOwner": true
    }
  },
  "borthrod gland": {
    "title": "Borthrod Gland",
    "text": "Kroot Flesh Shaper only. While the bearer is leading a unit, each time a model in that unit makes a melee attack, an unmodified Hit roll of 5+ scores a Critical Hit.",
    "value": 15,
    "detachment": "KROOT HUNTING PACK",
    "tags": [],
    "owner": {
      "subject": "model",
      "selector": {
        "unitIds": [
          "unit-kroot-flesh-shaper"
        ],
        "noneKeywords": [
          "EPIC HERO"
        ]
      }
    },
    "assignment": {
      "maxOwners": 1,
      "enhancementChoices": 1,
      "payPointsPerOwner": true
    }
  },
  "kroothawk flock": {
    "title": "Kroothawk Flock",
    "text": "KROOT model only. Ranged weapons equipped by models in the bearer’s unit have the [IGNORES COVER] ability, and enemy units that are set up on the battlefield as Reinforcements cannot be set up within 12\" horizontally of the bearer.",
    "value": 10,
    "detachment": "KROOT HUNTING PACK",
    "tags": [],
    "owner": {
      "subject": "model",
      "selector": {
        "unitIds": [
          "unit-kroot-flesh-shaper",
          "unit-kroot-lone-spear",
          "unit-kroot-trail-shaper",
          "unit-kroot-war-shaper"
        ],
        "noneKeywords": [
          "EPIC HERO"
        ]
      }
    },
    "assignment": {
      "maxOwners": 1,
      "enhancementChoices": 1,
      "payPointsPerOwner": true
    }
  },
  "nomadic hunter": {
    "title": "Nomadic Hunter",
    "text": "KROOT TRAIL SHAPER model only. While the bearer is leading a unit, add 3\" to the Move characteristic of models in that unit and ranged weapons equipped by models in that unit have the [ASSAULT] ability.",
    "value": 20,
    "detachment": "KROOT HUNTING PACK",
    "tags": [],
    "owner": {
      "subject": "model",
      "selector": {
        "unitIds": [
          "unit-kroot-trail-shaper"
        ],
        "noneKeywords": [
          "EPIC HERO"
        ]
      }
    },
    "assignment": {
      "maxOwners": 1,
      "enhancementChoices": 1,
      "payPointsPerOwner": true
    }
  },
  "root carved weapons": {
    "title": "Root-carved Weapons",
    "text": "Kroot War Shaper model only. All weapons equipped by the bearer have the [PRECISION] and [DEVASTATING WOUNDS] abilities.",
    "value": 10,
    "detachment": "KROOT HUNTING PACK",
    "tags": [],
    "owner": {
      "subject": "model",
      "selector": {
        "unitIds": [
          "unit-kroot-war-shaper"
        ],
        "noneKeywords": [
          "EPIC HERO"
        ]
      }
    },
    "assignment": {
      "maxOwners": 1,
      "enhancementChoices": 1,
      "payPointsPerOwner": true
    }
  },
  "student of kauyon": {
    "title": "Student of Kauyon",
    "text": "KROOT SHAPER model only. In the Declare Battle Formations step, you can select up to three friendly KROOT CARNIVORES/FARSTALKERS units. Those units have Deep Strike.",
    "value": 20,
    "detachment": "AUXILIARY CADRE",
    "tags": [],
    "owner": {
      "subject": "model",
      "selector": {
        "unitIds": [
          "unit-kroot-flesh-shaper",
          "unit-kroot-trail-shaper",
          "unit-kroot-war-shaper"
        ],
        "noneKeywords": [
          "EPIC HERO"
        ]
      }
    },
    "assignment": {
      "maxOwners": 1,
      "enhancementChoices": 1,
      "payPointsPerOwner": true
    }
  },
  "admired leader": {
    "title": "Admired Leader",
    "text": "T’AU EMPIRE model only (excluding KROOT models). In your Command phase, you can select one KROOT/VESPID STINGWINGS unit within 12\" of this model. If you do, that unit has +1 Ld and OC until the start of your next Command phase.",
    "value": 20,
    "detachment": "AUXILIARY CADRE",
    "tags": [],
    "owner": {
      "subject": "model",
      "selector": {
        "unitIds": [
          "unit-cadre-fireblade",
          "unit-commander-in-coldstar-battlesuit",
          "unit-commander-in-enforcer-battlesuit",
          "unit-ethereal",
          "unit-firesight-team",
          "unit-commander-in-crisis-battlesuit"
        ],
        "noneKeywords": [
          "EPIC HERO"
        ]
      }
    },
    "assignment": {
      "maxOwners": 1,
      "enhancementChoices": 1,
      "payPointsPerOwner": true
    }
  }
});

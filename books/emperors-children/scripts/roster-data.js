window.WH_BOOK_ROSTER_CATALOG=Object.freeze({
  "schema": "wh40k-army-roster-catalog/v1",
  "book": {
    "id": "emperors-children",
    "title": "Emperor's Children",
    "factionKeyword": "EMPEROR'S CHILDREN",
    "parentBookId": null,
    "dependencies": []
  },
  "compositionConstraints": true,
  "statProfiles": true,
  "preserveMultipartStatProfiles": true,
  "units": [
    {
      "id": "unit-daemonettes",
      "title": "Daemonettes",
      "sourceBookId": "emperors-children",
      "sourceLayer": "codex",
      "intrinsicKeywords": [
        "INFANTRY",
        "BATTLELINE",
        "CHAOS",
        "DAEMON",
        "SUMMONED",
        "SLAANESH",
        "DAEMONETTES",
        "LEGIONS OF EXCESS"
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
          "M": "9\"",
          "T": "3",
          "Sv": "7+",
          "W": "1",
          "Ld": "7+",
          "OC": "1",
          "Invulnerable": "5+"
        },
        "statProfiles": [
          {
            "id": "unit-daemonettes-stat-profile-bc58d76d1d",
            "title": "Daemonettes",
            "stats": {
              "M": "9\"",
              "T": "3",
              "Sv": "7+",
              "W": "1",
              "Ld": "7+",
              "OC": "1",
              "Invulnerable": "5+"
            },
            "legacyIds": [
              "unit-daemonettes-stat-profile-daemonettes"
            ]
          }
        ],
        "abilities": [
          {
            "id": "emperors-children-ability-horrifying-beauty",
            "sectionId": "emperors-children-ability-horrifying-beauty",
            "title": "Horrifying Beauty",
            "text": "At the start of the Fight phase, each enemy unit within Engagement Range of one or more units from your army with this ability must take a Battle-shock test, subtracting 1 from the result if that enemy unit is Below Half-strength.",
            "sourceUnitId": "unit-daemonettes"
          },
          {
            "id": "core-deep-strike",
            "sectionId": "core-deep-strike",
            "title": "Deep Strike",
            "text": "Each time this unit makes an ingress move (20.04), if every model in this unit has this ability, it can be set up anywhere on the battlefield that is more than 8\" horizontally from all enemy units, even if that is within your opponent’s deployment zone.",
            "sourceUnitId": "unit-daemonettes"
          },
          {
            "id": "core-fights-first",
            "sectionId": "core-fights-first",
            "title": "Fights First",
            "text": "While every model in a unit has this ability, that unit is a Fights First unit. \nSee the Resolve Fights First Combats step in the Fight phase (12.04).",
            "sourceUnitId": "unit-daemonettes"
          },
          {
            "id": "emperors-children-ability-pact-of-excess",
            "sectionId": "emperors-children-ability-pact-of-excess",
            "title": "Pact of Excess",
            "text": "When mustering your army, unless specifically stated otherwise, you cannot select LEGIONS OF EXCESS as your Army Faction.",
            "sourceUnitId": "unit-daemonettes"
          }
        ],
        "models": [
          {
            "id": "unit-daemonettes-model-381178c0cf",
            "title": "Daemonette",
            "aliases": [
              "Daemonette"
            ],
            "min": 9,
            "max": 9,
            "legacyIds": [
              "unit-daemonettes-model-daemonette"
            ]
          },
          {
            "id": "unit-daemonettes-model-6f896f5f0d",
            "title": "Alluress",
            "aliases": [
              "Alluress"
            ],
            "min": 1,
            "max": 1,
            "legacyIds": [
              "unit-daemonettes-model-alluress-2"
            ]
          }
        ],
        "compositionRules": [],
        "selections": [
          {
            "id": "unit-daemonettes-selection-slashing-claws",
            "title": "Slashing claws",
            "aliases": [
              "Slashing claws"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-daemonettes-profile-bc06a66b66"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-daemonettes-selection-daemonic-icon",
            "title": "Daemonic Icon",
            "aliases": [
              "Daemonic Icon"
            ],
            "kind": "wargear",
            "profileIds": [],
            "wargearAbilityIds": [
              "unit-daemonettes-wargear-ability-b3dad0463e"
            ]
          },
          {
            "id": "unit-daemonettes-selection-instrument-of-chaos",
            "title": "Instrument of Chaos",
            "aliases": [
              "Instrument of Chaos"
            ],
            "kind": "wargear",
            "profileIds": [],
            "wargearAbilityIds": [
              "unit-daemonettes-wargear-ability-6721ceb7d6"
            ]
          }
        ],
        "weaponFamilies": [],
        "weaponProfiles": [
          {
            "id": "unit-daemonettes-profile-bc06a66b66",
            "legacyIds": [
              "unit-daemonettes-profile-slashing-claws-melee"
            ],
            "title": "Slashing claws",
            "mode": "melee",
            "range": "Melee",
            "a": "3",
            "skill": "3+",
            "s": "4",
            "ap": "-1",
            "d": "1",
            "abilities": "Devastating Wounds",
            "sourceSelectionIds": [
              "unit-daemonettes-selection-slashing-claws"
            ]
          }
        ],
        "wargearAbilities": [
          {
            "id": "unit-daemonettes-wargear-ability-b3dad0463e",
            "sectionId": "unit-daemonettes-wargear-ability-b3dad0463e",
            "title": "Daemonic Icon",
            "text": "Models in the bearer’s unit have a Leadership characteristic of 6+.",
            "sourceUnitId": "unit-daemonettes",
            "legacyIds": [
              "unit-daemonettes-wargear-ability-daemonic-icon"
            ],
            "requiredSelectionIds": [
              "unit-daemonettes-selection-daemonic-icon"
            ]
          },
          {
            "id": "unit-daemonettes-wargear-ability-6721ceb7d6",
            "sectionId": "unit-daemonettes-wargear-ability-6721ceb7d6",
            "title": "Instrument of Chaos",
            "text": "Add 1 to Charge rolls made for the bearer’s unit.",
            "sourceUnitId": "unit-daemonettes",
            "legacyIds": [
              "unit-daemonettes-wargear-ability-instrument-of-chaos-2"
            ],
            "requiredSelectionIds": [
              "unit-daemonettes-selection-instrument-of-chaos"
            ]
          }
        ],
        "wargearDefaults": [
          {
            "modelId": "unit-daemonettes-model-381178c0cf",
            "selections": [
              {
                "selectionId": "unit-daemonettes-selection-slashing-claws",
                "quantity": 1
              }
            ]
          },
          {
            "modelId": "unit-daemonettes-model-6f896f5f0d",
            "selections": [
              {
                "selectionId": "unit-daemonettes-selection-slashing-claws",
                "quantity": 1
              }
            ]
          }
        ],
        "wargearOptionContracts": [
          {
            "sourceId": "datasheet-daemonettes:wargear:1",
            "eligibleModelIds": [
              "unit-daemonettes-model-381178c0cf"
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
                    "selectionId": "unit-daemonettes-selection-instrument-of-chaos",
                    "quantity": 1
                  }
                ],
                "requiresFinal": [],
                "forbidsFinal": [
                  "unit-daemonettes-selection-daemonic-icon"
                ],
                "sharedUses": []
              }
            ]
          },
          {
            "sourceId": "datasheet-daemonettes:wargear:2",
            "eligibleModelIds": [
              "unit-daemonettes-model-381178c0cf"
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
                    "selectionId": "unit-daemonettes-selection-daemonic-icon",
                    "quantity": 1
                  }
                ],
                "requiresFinal": [],
                "forbidsFinal": [
                  "unit-daemonettes-selection-instrument-of-chaos"
                ],
                "sharedUses": []
              }
            ]
          }
        ],
        "wargearSharedCaps": []
      }
    },
    {
      "id": "unit-infractors",
      "title": "Infractors",
      "sourceBookId": "emperors-children",
      "sourceLayer": "codex",
      "intrinsicKeywords": [
        "INFANTRY",
        "BATTLELINE",
        "GRENADES",
        "CHAOS",
        "SLAANESH",
        "INFRACTORS",
        "EMPEROR’S CHILDREN"
      ],
      "relations": {
        "canLead": [],
        "canSupport": [],
        "canBeLedBy": [
          {
            "unitId": "unit-lord-exultant",
            "maxCharacters": 1
          },
          {
            "unitId": "unit-sorcerer",
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
              "unitId": "unit-lord-exultant",
              "maxCharacters": 1
            },
            {
              "unitId": "unit-sorcerer",
              "maxCharacters": 1
            }
          ],
          "canBeSupportedBy": []
        }
      },
      "gameSelections": {
        "stats": {
          "M": "7\"",
          "T": "4",
          "Sv": "3+",
          "W": "2",
          "Ld": "6+",
          "OC": "2",
          "Invulnerable": ""
        },
        "statProfiles": [
          {
            "id": "unit-infractors-stat-profile-ea18aad704",
            "title": "Infractors",
            "stats": {
              "M": "7\"",
              "T": "4",
              "Sv": "3+",
              "W": "2",
              "Ld": "6+",
              "OC": "2",
              "Invulnerable": ""
            },
            "legacyIds": [
              "unit-infractors-stat-profile-infractors"
            ]
          }
        ],
        "abilities": [
          {
            "id": "emperors-children-ability-excessive-assault",
            "sectionId": "emperors-children-ability-excessive-assault",
            "title": "Excessive Assault",
            "text": "Each time a model in this unit targets an enemy unit with a melee attack, re-roll a Wound roll of 1. If that enemy unit is within range of an objective marker, you can re-roll the Wound roll instead.",
            "sourceUnitId": "unit-infractors"
          },
          {
            "id": "emperors-children-ability-thrill-seekers",
            "sectionId": "emperors-children-ability-thrill-seekers",
            "title": "Thrill Seekers",
            "text": "If your Army Faction is Emperor's Children, this unit is eligible to shoot and declare a charge in a turn in which it Advanced or Fell Back, but when doing so:\n- It cannot target a unit it was within Engagement Range of at the start of the turn\n- It cannot target a unit that was the target of another unit's charge or attack this phase.",
            "sourceUnitId": "unit-infractors"
          },
          {
            "id": "core-scouts",
            "sectionId": "core-scouts",
            "title": "Scouts 6\"",
            "text": "This ability always takes the form Scouts X\". In the Resolve Pre-battle Abilities step, if every model in a unit has this ability, you can do one of the following: \n- If that unit is in strategic reserves, you can set up that unit anywhere that is wholly within your deployment zone. \n- If that unit is wholly within your deployment zone, it can make a scout move. \n- If that unit is embarked within a DEDICATED TRANSPORT that is wholly within your deployment zone, and if every model embarked within that DEDICATED TRANSPORT has the Scouts ability, that DEDICATED TRANSPORT can make a scout move.",
            "sourceUnitId": "unit-infractors"
          }
        ],
        "models": [
          {
            "id": "unit-infractors-model-897249bc89",
            "title": "Obsessionist",
            "aliases": [
              "Obsessionist"
            ],
            "min": 1,
            "max": 1,
            "legacyIds": [
              "unit-infractors-model-obsessionist"
            ]
          },
          {
            "id": "unit-infractors-model-273cdc19c8",
            "title": "Infractors",
            "aliases": [
              "Infractors",
              "Infractor"
            ],
            "min": 4,
            "max": 9,
            "legacyIds": [
              "unit-infractors-model-infractors-2"
            ]
          }
        ],
        "compositionRules": [],
        "selections": [
          {
            "id": "unit-infractors-selection-bolt-pistol",
            "title": "Bolt pistol",
            "aliases": [
              "Bolt pistol"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-infractors-profile-a16d0444b0"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-infractors-selection-plasma-pistol-standard",
            "title": "➤ Plasma pistol - standard",
            "aliases": [
              "➤ Plasma pistol - standard"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-infractors-profile-d02e622c84"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-infractors-selection-plasma-pistol-supercharge",
            "title": "➤ Plasma pistol - supercharge",
            "aliases": [
              "➤ Plasma pistol - supercharge"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-infractors-profile-08f1080123"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-infractors-selection-rapture-lash",
            "title": "Rapture lash",
            "aliases": [
              "Rapture lash"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-infractors-profile-0519034968"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-infractors-selection-power-sword",
            "title": "Power sword",
            "aliases": [
              "Power sword"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-infractors-profile-ca0e686e44"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-infractors-selection-duelling-sabre",
            "title": "Duelling sabre",
            "aliases": [
              "Duelling sabre"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-infractors-profile-dc8377d607"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-infractors-weapon-family-plasma-pistol-selection",
            "title": "➤ Plasma pistol",
            "aliases": [
              "➤ Plasma pistol"
            ],
            "kind": "weapon",
            "familyId": "unit-infractors-weapon-family-plasma-pistol",
            "profileIds": [
              "unit-infractors-profile-d02e622c84",
              "unit-infractors-profile-08f1080123"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-infractors-selection-icon-of-excess",
            "title": "Icon of Excess",
            "aliases": [
              "Icon of Excess"
            ],
            "kind": "wargear",
            "profileIds": [],
            "wargearAbilityIds": [
              "unit-infractors-wargear-ability-464d30bdad"
            ]
          }
        ],
        "weaponFamilies": [
          {
            "id": "unit-infractors-weapon-family-plasma-pistol",
            "title": "➤ Plasma pistol",
            "aliases": [
              "➤ Plasma pistol"
            ],
            "profileIds": [
              "unit-infractors-profile-d02e622c84",
              "unit-infractors-profile-08f1080123"
            ],
            "ambiguousAlias": false
          }
        ],
        "weaponProfiles": [
          {
            "id": "unit-infractors-profile-a16d0444b0",
            "legacyIds": [
              "unit-infractors-profile-bolt-pistol-ranged"
            ],
            "title": "Bolt pistol",
            "mode": "ranged",
            "range": "12\"",
            "a": "1",
            "skill": "3+",
            "s": "4",
            "ap": "0",
            "d": "1",
            "abilities": "Pistol",
            "sourceSelectionIds": [
              "unit-infractors-selection-bolt-pistol"
            ]
          },
          {
            "id": "unit-infractors-profile-d02e622c84",
            "legacyIds": [
              "unit-infractors-profile-plasma-pistol-standard-ranged-2"
            ],
            "title": "➤ Plasma pistol - standard",
            "mode": "ranged",
            "range": "12\"",
            "a": "1",
            "skill": "3+",
            "s": "7",
            "ap": "-2",
            "d": "1",
            "abilities": "Pistol",
            "sourceSelectionIds": [
              "unit-infractors-selection-plasma-pistol-standard",
              "unit-infractors-weapon-family-plasma-pistol-selection"
            ]
          },
          {
            "id": "unit-infractors-profile-08f1080123",
            "legacyIds": [
              "unit-infractors-profile-plasma-pistol-supercharge-ranged-3"
            ],
            "title": "➤ Plasma pistol - supercharge",
            "mode": "ranged",
            "range": "12\"",
            "a": "1",
            "skill": "3+",
            "s": "8",
            "ap": "-3",
            "d": "2",
            "abilities": "Hazardous, Pistol",
            "sourceSelectionIds": [
              "unit-infractors-selection-plasma-pistol-supercharge",
              "unit-infractors-weapon-family-plasma-pistol-selection"
            ]
          },
          {
            "id": "unit-infractors-profile-0519034968",
            "legacyIds": [
              "unit-infractors-profile-rapture-lash-melee-4"
            ],
            "title": "Rapture lash",
            "mode": "melee",
            "range": "Melee",
            "a": "6",
            "skill": "3+",
            "s": "4",
            "ap": "-1",
            "d": "1",
            "abilities": "Precision",
            "sourceSelectionIds": [
              "unit-infractors-selection-rapture-lash"
            ]
          },
          {
            "id": "unit-infractors-profile-ca0e686e44",
            "legacyIds": [
              "unit-infractors-profile-power-sword-melee-5"
            ],
            "title": "Power sword",
            "mode": "melee",
            "range": "Melee",
            "a": "4",
            "skill": "3+",
            "s": "5",
            "ap": "-2",
            "d": "1",
            "abilities": "Precision",
            "sourceSelectionIds": [
              "unit-infractors-selection-power-sword"
            ]
          },
          {
            "id": "unit-infractors-profile-dc8377d607",
            "legacyIds": [
              "unit-infractors-profile-duelling-sabre-melee-6"
            ],
            "title": "Duelling sabre",
            "mode": "melee",
            "range": "Melee",
            "a": "4",
            "skill": "3+",
            "s": "4",
            "ap": "-1",
            "d": "1",
            "abilities": "Precision",
            "sourceSelectionIds": [
              "unit-infractors-selection-duelling-sabre"
            ]
          }
        ],
        "wargearAbilities": [
          {
            "id": "unit-infractors-wargear-ability-464d30bdad",
            "sectionId": "unit-infractors-wargear-ability-464d30bdad",
            "title": "Icon of Excess",
            "text": "At the end of your Shooting phase or the Fight phase, if the bearer’s unit destroyed one or more enemy units that phase, the bearer’s unit takes a Leadership test. If that test is passed, you gain 1CP.",
            "sourceUnitId": "unit-infractors",
            "legacyIds": [
              "unit-infractors-wargear-ability-icon-of-excess"
            ],
            "requiredSelectionIds": [
              "unit-infractors-selection-icon-of-excess"
            ]
          }
        ],
        "wargearDefaults": [
          {
            "modelId": "unit-infractors-model-897249bc89",
            "selections": [
              {
                "selectionId": "unit-infractors-selection-bolt-pistol",
                "quantity": 1
              },
              {
                "selectionId": "unit-infractors-selection-power-sword",
                "quantity": 1
              }
            ]
          },
          {
            "modelId": "unit-infractors-model-273cdc19c8",
            "selections": [
              {
                "selectionId": "unit-infractors-selection-bolt-pistol",
                "quantity": 1
              },
              {
                "selectionId": "unit-infractors-selection-duelling-sabre",
                "quantity": 1
              }
            ]
          }
        ],
        "wargearOptionContracts": [
          {
            "sourceId": "datasheet-infractors:wargear:1",
            "eligibleModelIds": [
              "unit-infractors-model-897249bc89"
            ],
            "limit": {
              "perModel": 1,
              "perUnit": 1
            },
            "choices": [
              {
                "remove": [
                  {
                    "selectionId": "unit-infractors-selection-bolt-pistol",
                    "quantity": 1
                  }
                ],
                "add": [
                  {
                    "selectionId": "unit-infractors-weapon-family-plasma-pistol-selection",
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
            "sourceId": "datasheet-infractors:wargear:2",
            "eligibleModelIds": [
              "unit-infractors-model-897249bc89"
            ],
            "limit": {
              "perModel": 1,
              "perUnit": 1
            },
            "choices": [
              {
                "remove": [
                  {
                    "selectionId": "unit-infractors-selection-power-sword",
                    "quantity": 1
                  }
                ],
                "add": [
                  {
                    "selectionId": "unit-infractors-selection-rapture-lash",
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
            "sourceId": "datasheet-infractors:wargear:3",
            "eligibleModelIds": [
              "unit-infractors-model-273cdc19c8"
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
                    "selectionId": "unit-infractors-selection-icon-of-excess",
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
      "id": "unit-tormentors",
      "title": "Tormentors",
      "sourceBookId": "emperors-children",
      "sourceLayer": "codex",
      "intrinsicKeywords": [
        "INFANTRY",
        "BATTLELINE",
        "GRENADES",
        "CHAOS",
        "SLAANESH",
        "TORMENTORS",
        "EMPEROR’S CHILDREN"
      ],
      "relations": {
        "canLead": [],
        "canSupport": [],
        "canBeLedBy": [
          {
            "unitId": "unit-lord-exultant",
            "maxCharacters": 1
          },
          {
            "unitId": "unit-sorcerer",
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
              "unitId": "unit-lord-exultant",
              "maxCharacters": 1
            },
            {
              "unitId": "unit-sorcerer",
              "maxCharacters": 1
            }
          ],
          "canBeSupportedBy": []
        }
      },
      "gameSelections": {
        "stats": {
          "M": "7\"",
          "T": "4",
          "Sv": "3+",
          "W": "2",
          "Ld": "6+",
          "OC": "2",
          "Invulnerable": ""
        },
        "statProfiles": [
          {
            "id": "unit-tormentors-stat-profile-d12ff16047",
            "title": "Tormentors",
            "stats": {
              "M": "7\"",
              "T": "4",
              "Sv": "3+",
              "W": "2",
              "Ld": "6+",
              "OC": "2",
              "Invulnerable": ""
            },
            "legacyIds": [
              "unit-tormentors-stat-profile-tormentors"
            ]
          }
        ],
        "abilities": [
          {
            "id": "emperors-children-ability-objective-defiled",
            "sectionId": "emperors-children-ability-objective-defiled",
            "title": "Objective Defiled",
            "text": "At the end of your Command phase, if this unit is within range of an objective marker you control, that objective marker remains under your control until your opponent’s Level of Control over that objective marker is greater than yours at the end of a phase.",
            "sourceUnitId": "unit-tormentors"
          },
          {
            "id": "core-infiltrators",
            "sectionId": "core-infiltrators",
            "title": "Infiltrators",
            "text": "During deployment, if every model in a unit has this ability, it can be set up anywhere on the battlefield that is more than 8\" horizontally from your opponent’s deployment zone and all enemy units.",
            "sourceUnitId": "unit-tormentors"
          },
          {
            "id": "emperors-children-ability-thrill-seekers",
            "sectionId": "emperors-children-ability-thrill-seekers",
            "title": "Thrill Seekers",
            "text": "If your Army Faction is Emperor's Children, this unit is eligible to shoot and declare a charge in a turn in which it Advanced or Fell Back, but when doing so:\n- It cannot target a unit it was within Engagement Range of at the start of the turn\n- It cannot target a unit that was the target of another unit's charge or attack this phase.",
            "sourceUnitId": "unit-tormentors"
          }
        ],
        "models": [
          {
            "id": "unit-tormentors-model-897249bc89",
            "title": "Obsessionist",
            "aliases": [
              "Obsessionist"
            ],
            "min": 1,
            "max": 1,
            "legacyIds": [
              "unit-tormentors-model-obsessionist"
            ]
          },
          {
            "id": "unit-tormentors-model-205e960003",
            "title": "Tormentors",
            "aliases": [
              "Tormentors",
              "Tormentor",
              "Tormentor w/ plasma gun",
              "Tormentor w/ meltagun"
            ],
            "min": 4,
            "max": 9,
            "legacyIds": [
              "unit-tormentors-model-tormentors-2"
            ]
          }
        ],
        "compositionRules": [],
        "selections": [
          {
            "id": "unit-tormentors-selection-bolt-pistol",
            "title": "Bolt pistol",
            "aliases": [
              "Bolt pistol"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-tormentors-profile-c7fd584746"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-tormentors-selection-plasma-pistol-standard",
            "title": "➤ Plasma pistol - standard",
            "aliases": [
              "➤ Plasma pistol - standard"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-tormentors-profile-5e8cf8a6f1"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-tormentors-selection-plasma-pistol-supercharge",
            "title": "➤ Plasma pistol - supercharge",
            "aliases": [
              "➤ Plasma pistol - supercharge"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-tormentors-profile-9b78ec6e49"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-tormentors-selection-rapture-lash",
            "title": "Rapture lash",
            "aliases": [
              "Rapture lash"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-tormentors-profile-c2c5795df5"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-tormentors-selection-power-sword",
            "title": "Power sword",
            "aliases": [
              "Power sword"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-tormentors-profile-9f1035c6f5"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-tormentors-selection-boltgun",
            "title": "Boltgun",
            "aliases": [
              "Boltgun"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-tormentors-profile-22803f2b76"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-tormentors-selection-close-combat-weapon",
            "title": "Close combat weapon",
            "aliases": [
              "Close combat weapon"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-tormentors-profile-38edd622b4"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-tormentors-selection-plasma-gun-standard",
            "title": "➤ Plasma gun - standard",
            "aliases": [
              "➤ Plasma gun - standard"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-tormentors-profile-29a1b3563e"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-tormentors-selection-plasma-gun-supercharge",
            "title": "➤ Plasma gun - supercharge",
            "aliases": [
              "➤ Plasma gun - supercharge"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-tormentors-profile-df61bd09a6"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-tormentors-selection-meltagun",
            "title": "Meltagun",
            "aliases": [
              "Meltagun"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-tormentors-profile-c1dc7b107e"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-tormentors-weapon-family-plasma-pistol-selection",
            "title": "➤ Plasma pistol",
            "aliases": [
              "➤ Plasma pistol"
            ],
            "kind": "weapon",
            "familyId": "unit-tormentors-weapon-family-plasma-pistol",
            "profileIds": [
              "unit-tormentors-profile-5e8cf8a6f1",
              "unit-tormentors-profile-9b78ec6e49"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-tormentors-weapon-family-plasma-gun-selection",
            "title": "➤ Plasma gun",
            "aliases": [
              "➤ Plasma gun"
            ],
            "kind": "weapon",
            "familyId": "unit-tormentors-weapon-family-plasma-gun",
            "profileIds": [
              "unit-tormentors-profile-29a1b3563e",
              "unit-tormentors-profile-df61bd09a6"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-tormentors-selection-icon-of-excess",
            "title": "Icon of Excess",
            "aliases": [
              "Icon of Excess"
            ],
            "kind": "wargear",
            "profileIds": [],
            "wargearAbilityIds": [
              "unit-tormentors-wargear-ability-464d30bdad"
            ]
          }
        ],
        "weaponFamilies": [
          {
            "id": "unit-tormentors-weapon-family-plasma-pistol",
            "title": "➤ Plasma pistol",
            "aliases": [
              "➤ Plasma pistol"
            ],
            "profileIds": [
              "unit-tormentors-profile-5e8cf8a6f1",
              "unit-tormentors-profile-9b78ec6e49"
            ],
            "ambiguousAlias": false
          },
          {
            "id": "unit-tormentors-weapon-family-plasma-gun",
            "title": "➤ Plasma gun",
            "aliases": [
              "➤ Plasma gun"
            ],
            "profileIds": [
              "unit-tormentors-profile-29a1b3563e",
              "unit-tormentors-profile-df61bd09a6"
            ],
            "ambiguousAlias": false
          }
        ],
        "weaponProfiles": [
          {
            "id": "unit-tormentors-profile-c7fd584746",
            "legacyIds": [
              "unit-tormentors-profile-bolt-pistol-ranged"
            ],
            "title": "Bolt pistol",
            "mode": "ranged",
            "range": "12\"",
            "a": "1",
            "skill": "3+",
            "s": "4",
            "ap": "0",
            "d": "1",
            "abilities": "Pistol, Precision",
            "sourceSelectionIds": [
              "unit-tormentors-selection-bolt-pistol"
            ]
          },
          {
            "id": "unit-tormentors-profile-5e8cf8a6f1",
            "legacyIds": [
              "unit-tormentors-profile-plasma-pistol-standard-ranged-2"
            ],
            "title": "➤ Plasma pistol - standard",
            "mode": "ranged",
            "range": "12\"",
            "a": "1",
            "skill": "3+",
            "s": "7",
            "ap": "-2",
            "d": "1",
            "abilities": "Pistol, Precision",
            "sourceSelectionIds": [
              "unit-tormentors-selection-plasma-pistol-standard",
              "unit-tormentors-weapon-family-plasma-pistol-selection"
            ]
          },
          {
            "id": "unit-tormentors-profile-9b78ec6e49",
            "legacyIds": [
              "unit-tormentors-profile-plasma-pistol-supercharge-ranged-3"
            ],
            "title": "➤ Plasma pistol - supercharge",
            "mode": "ranged",
            "range": "12\"",
            "a": "1",
            "skill": "3+",
            "s": "8",
            "ap": "-3",
            "d": "2",
            "abilities": "Hazardous, Pistol, Precision",
            "sourceSelectionIds": [
              "unit-tormentors-selection-plasma-pistol-supercharge",
              "unit-tormentors-weapon-family-plasma-pistol-selection"
            ]
          },
          {
            "id": "unit-tormentors-profile-c2c5795df5",
            "legacyIds": [
              "unit-tormentors-profile-rapture-lash-melee-4"
            ],
            "title": "Rapture lash",
            "mode": "melee",
            "range": "Melee",
            "a": "6",
            "skill": "3+",
            "s": "4",
            "ap": "-1",
            "d": "1",
            "abilities": "",
            "sourceSelectionIds": [
              "unit-tormentors-selection-rapture-lash"
            ]
          },
          {
            "id": "unit-tormentors-profile-9f1035c6f5",
            "legacyIds": [
              "unit-tormentors-profile-power-sword-melee-5"
            ],
            "title": "Power sword",
            "mode": "melee",
            "range": "Melee",
            "a": "4",
            "skill": "3+",
            "s": "5",
            "ap": "-2",
            "d": "1",
            "abilities": "",
            "sourceSelectionIds": [
              "unit-tormentors-selection-power-sword"
            ]
          },
          {
            "id": "unit-tormentors-profile-22803f2b76",
            "legacyIds": [
              "unit-tormentors-profile-boltgun-ranged-6"
            ],
            "title": "Boltgun",
            "mode": "ranged",
            "range": "24\"",
            "a": "2",
            "skill": "3+",
            "s": "4",
            "ap": "0",
            "d": "1",
            "abilities": "Precision",
            "sourceSelectionIds": [
              "unit-tormentors-selection-boltgun"
            ]
          },
          {
            "id": "unit-tormentors-profile-38edd622b4",
            "legacyIds": [
              "unit-tormentors-profile-close-combat-weapon-melee-7"
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
              "unit-tormentors-selection-close-combat-weapon"
            ]
          },
          {
            "id": "unit-tormentors-profile-29a1b3563e",
            "legacyIds": [
              "unit-tormentors-profile-plasma-gun-standard-ranged-8"
            ],
            "title": "➤ Plasma gun - standard",
            "mode": "ranged",
            "range": "24\"",
            "a": "1",
            "skill": "3+",
            "s": "7",
            "ap": "-2",
            "d": "1",
            "abilities": "Precision, Rapid Fire 1",
            "sourceSelectionIds": [
              "unit-tormentors-selection-plasma-gun-standard",
              "unit-tormentors-weapon-family-plasma-gun-selection"
            ]
          },
          {
            "id": "unit-tormentors-profile-df61bd09a6",
            "legacyIds": [
              "unit-tormentors-profile-plasma-gun-supercharge-ranged-9"
            ],
            "title": "➤ Plasma gun - supercharge",
            "mode": "ranged",
            "range": "24\"",
            "a": "1",
            "skill": "3+",
            "s": "8",
            "ap": "-3",
            "d": "2",
            "abilities": "Hazardous, Precision, Rapid Fire 1",
            "sourceSelectionIds": [
              "unit-tormentors-selection-plasma-gun-supercharge",
              "unit-tormentors-weapon-family-plasma-gun-selection"
            ]
          },
          {
            "id": "unit-tormentors-profile-c1dc7b107e",
            "legacyIds": [
              "unit-tormentors-profile-meltagun-ranged-10"
            ],
            "title": "Meltagun",
            "mode": "ranged",
            "range": "12\"",
            "a": "1",
            "skill": "3+",
            "s": "9",
            "ap": "-4",
            "d": "D6",
            "abilities": "Melta 2, Precision",
            "sourceSelectionIds": [
              "unit-tormentors-selection-meltagun"
            ]
          }
        ],
        "wargearAbilities": [
          {
            "id": "unit-tormentors-wargear-ability-464d30bdad",
            "sectionId": "unit-tormentors-wargear-ability-464d30bdad",
            "title": "Icon of Excess",
            "text": "At the end of your Shooting phase or the Fight phase, if the bearer’s unit destroyed one or more enemy units that phase, the bearer’s unit takes a Leadership test. If that test is passed, you gain 1CP.",
            "sourceUnitId": "unit-tormentors",
            "legacyIds": [
              "unit-tormentors-wargear-ability-icon-of-excess"
            ],
            "requiredSelectionIds": [
              "unit-tormentors-selection-icon-of-excess"
            ]
          }
        ],
        "wargearDefaults": [
          {
            "modelId": "unit-tormentors-model-897249bc89",
            "selections": [
              {
                "selectionId": "unit-tormentors-selection-bolt-pistol",
                "quantity": 1
              },
              {
                "selectionId": "unit-tormentors-selection-power-sword",
                "quantity": 1
              }
            ]
          },
          {
            "modelId": "unit-tormentors-model-205e960003",
            "selections": [
              {
                "selectionId": "unit-tormentors-selection-boltgun",
                "quantity": 1
              },
              {
                "selectionId": "unit-tormentors-selection-close-combat-weapon",
                "quantity": 1
              }
            ]
          }
        ],
        "wargearOptionContracts": [
          {
            "sourceId": "datasheet-tormentors:wargear:1",
            "eligibleModelIds": [
              "unit-tormentors-model-897249bc89"
            ],
            "limit": {
              "perModel": 1,
              "perUnit": 1
            },
            "choices": [
              {
                "remove": [
                  {
                    "selectionId": "unit-tormentors-selection-bolt-pistol",
                    "quantity": 1
                  }
                ],
                "add": [
                  {
                    "selectionId": "unit-tormentors-weapon-family-plasma-pistol-selection",
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
            "sourceId": "datasheet-tormentors:wargear:2",
            "eligibleModelIds": [
              "unit-tormentors-model-897249bc89"
            ],
            "limit": {
              "perModel": 1,
              "perUnit": 1
            },
            "choices": [
              {
                "remove": [
                  {
                    "selectionId": "unit-tormentors-selection-power-sword",
                    "quantity": 1
                  }
                ],
                "add": [
                  {
                    "selectionId": "unit-tormentors-selection-rapture-lash",
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
            "sourceId": "datasheet-tormentors:wargear:3",
            "eligibleModelIds": [
              "unit-tormentors-model-205e960003"
            ],
            "limit": {
              "perModel": 1,
              "perModels": {
                "models": 5,
                "uses": 1
              }
            },
            "choices": [
              {
                "remove": [
                  {
                    "selectionId": "unit-tormentors-selection-boltgun",
                    "quantity": 1
                  }
                ],
                "add": [
                  {
                    "selectionId": "unit-tormentors-selection-meltagun",
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
            "sourceId": "datasheet-tormentors:wargear:4",
            "eligibleModelIds": [
              "unit-tormentors-model-205e960003"
            ],
            "limit": {
              "perModel": 1,
              "perModels": {
                "models": 5,
                "uses": 1
              }
            },
            "choices": [
              {
                "remove": [
                  {
                    "selectionId": "unit-tormentors-selection-boltgun",
                    "quantity": 1
                  }
                ],
                "add": [
                  {
                    "selectionId": "unit-tormentors-weapon-family-plasma-gun-selection",
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
            "sourceId": "datasheet-tormentors:wargear:5",
            "eligibleModelIds": [
              "unit-tormentors-model-205e960003"
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
                    "selectionId": "unit-tormentors-selection-icon-of-excess",
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
      "id": "unit-daemon-prince-of-slaanesh",
      "title": "Daemon Prince of Slaanesh",
      "sourceBookId": "emperors-children",
      "sourceLayer": "codex",
      "intrinsicKeywords": [
        "MONSTER",
        "CHARACTER",
        "CHAOS",
        "DAEMON",
        "SLAANESH",
        "DAEMON PRINCE",
        "EMPEROR’S CHILDREN"
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
          "Sv": "2+",
          "W": "10",
          "Ld": "6+",
          "OC": "3",
          "Invulnerable": "4+"
        },
        "statProfiles": [],
        "abilities": [
          {
            "id": "emperors-children-ability-lord-of-excess",
            "sectionId": "emperors-children-ability-lord-of-excess",
            "title": "Lord of Excess",
            "text": "While this model is within 3\" of one or more friendly SLAANESH INFANTRY units, this model has the Lone Operative ability.",
            "sourceUnitId": "unit-daemon-prince-of-slaanesh"
          },
          {
            "id": "emperors-children-ability-excessive-vigour-aura",
            "sectionId": "emperors-children-ability-excessive-vigour-aura",
            "title": "Excessive Vigour (Aura)",
            "text": "While a friendly SLAANESH unit is within 6\" of this model, if that unit made a Charge move this turn, improve the Armour Penetration characteristic of melee weapons equipped by models in that unit by 1.",
            "sourceUnitId": "unit-daemon-prince-of-slaanesh"
          },
          {
            "id": "emperors-children-ability-ecstatic-death",
            "sectionId": "emperors-children-ability-ecstatic-death",
            "title": "Ecstatic Death",
            "text": "If this model is destroyed by a melee attack, if it has not fought this phase, roll one D6: on a 2+, do not remove it from play. This model can fight after the attacking unit has finished making its attacks, and is then removed from play.",
            "sourceUnitId": "unit-daemon-prince-of-slaanesh"
          },
          {
            "id": "core-deadly-demise",
            "sectionId": "core-deadly-demise",
            "title": "Deadly Demise D3",
            "text": "This ability always takes the form Deadly Demise X. Each time a model in this unit is destroyed, after the units embarked within it (if any) have made their emergency disembark moves, roll one D6. On a 6, that model suffers a deadly demise; each unit within 6\" of that model suffers a number of mortal wounds denoted by X (if this is a random number, roll separately for each unit within 6\"). \n *Example: An Impulsor with a unit of Intercessors embarked within it is destroyed by ranged attacks. First, any unresolved attacks made by the attacking unit are resolved. Then the Intercessors make an emergency disembark move. Then the roll is made for the Deadly Demise ability, and on a 6, that ability is resolved. Finally, the Impulsor is removed from the battlefield.*",
            "sourceUnitId": "unit-daemon-prince-of-slaanesh"
          },
          {
            "id": "emperors-children-ability-thrill-seekers",
            "sectionId": "emperors-children-ability-thrill-seekers",
            "title": "Thrill Seekers",
            "text": "If your Army Faction is Emperor's Children, this unit is eligible to shoot and declare a charge in a turn in which it Advanced or Fell Back, but when doing so:\n- It cannot target a unit it was within Engagement Range of at the start of the turn\n- It cannot target a unit that was the target of another unit's charge or attack this phase.",
            "sourceUnitId": "unit-daemon-prince-of-slaanesh"
          }
        ],
        "models": [
          {
            "id": "unit-daemon-prince-of-slaanesh-model-ab2a7817c2",
            "title": "Daemon Prince of Slaanesh",
            "aliases": [
              "Daemon Prince of Slaanesh"
            ],
            "min": 1,
            "max": 1,
            "legacyIds": [
              "unit-daemon-prince-of-slaanesh-model-daemon-prince-of-slaanesh"
            ]
          }
        ],
        "compositionRules": [],
        "selections": [
          {
            "id": "unit-daemon-prince-of-slaanesh-selection-hellforged-weapons-strike",
            "title": "➤ Hellforged weapons - strike",
            "aliases": [
              "➤ Hellforged weapons - strike"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-daemon-prince-of-slaanesh-profile-c3e5b71d09"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-daemon-prince-of-slaanesh-selection-hellforged-weapons-sweep",
            "title": "➤ Hellforged weapons - sweep",
            "aliases": [
              "➤ Hellforged weapons - sweep"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-daemon-prince-of-slaanesh-profile-ca66158213"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-daemon-prince-of-slaanesh-selection-infernal-cannon",
            "title": "Infernal cannon",
            "aliases": [
              "Infernal cannon"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-daemon-prince-of-slaanesh-profile-4c4589e7bd"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-daemon-prince-of-slaanesh-weapon-family-hellforged-weapons-selection",
            "title": "➤ Hellforged weapons",
            "aliases": [
              "➤ Hellforged weapons"
            ],
            "kind": "weapon",
            "familyId": "unit-daemon-prince-of-slaanesh-weapon-family-hellforged-weapons",
            "profileIds": [
              "unit-daemon-prince-of-slaanesh-profile-c3e5b71d09",
              "unit-daemon-prince-of-slaanesh-profile-ca66158213"
            ],
            "wargearAbilityIds": []
          }
        ],
        "weaponFamilies": [
          {
            "id": "unit-daemon-prince-of-slaanesh-weapon-family-hellforged-weapons",
            "title": "➤ Hellforged weapons",
            "aliases": [
              "➤ Hellforged weapons"
            ],
            "profileIds": [
              "unit-daemon-prince-of-slaanesh-profile-c3e5b71d09",
              "unit-daemon-prince-of-slaanesh-profile-ca66158213"
            ],
            "ambiguousAlias": false
          }
        ],
        "weaponProfiles": [
          {
            "id": "unit-daemon-prince-of-slaanesh-profile-c3e5b71d09",
            "legacyIds": [
              "unit-daemon-prince-of-slaanesh-profile-hellforged-weapons-strike-melee"
            ],
            "title": "➤ Hellforged weapons - strike",
            "mode": "melee",
            "range": "Melee",
            "a": "6",
            "skill": "2+",
            "s": "8",
            "ap": "-2",
            "d": "3",
            "abilities": "",
            "sourceSelectionIds": [
              "unit-daemon-prince-of-slaanesh-selection-hellforged-weapons-strike",
              "unit-daemon-prince-of-slaanesh-weapon-family-hellforged-weapons-selection"
            ]
          },
          {
            "id": "unit-daemon-prince-of-slaanesh-profile-ca66158213",
            "legacyIds": [
              "unit-daemon-prince-of-slaanesh-profile-hellforged-weapons-sweep-melee-2"
            ],
            "title": "➤ Hellforged weapons - sweep",
            "mode": "melee",
            "range": "Melee",
            "a": "14",
            "skill": "2+",
            "s": "6",
            "ap": "0",
            "d": "1",
            "abilities": "",
            "sourceSelectionIds": [
              "unit-daemon-prince-of-slaanesh-selection-hellforged-weapons-sweep",
              "unit-daemon-prince-of-slaanesh-weapon-family-hellforged-weapons-selection"
            ]
          },
          {
            "id": "unit-daemon-prince-of-slaanesh-profile-4c4589e7bd",
            "legacyIds": [
              "unit-daemon-prince-of-slaanesh-profile-infernal-cannon-ranged-3"
            ],
            "title": "Infernal cannon",
            "mode": "ranged",
            "range": "24\"",
            "a": "3",
            "skill": "2+",
            "s": "5",
            "ap": "-1",
            "d": "2",
            "abilities": "",
            "sourceSelectionIds": [
              "unit-daemon-prince-of-slaanesh-selection-infernal-cannon"
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
      "id": "unit-daemon-prince-of-slaanesh-with-wings",
      "title": "Daemon Prince of Slaanesh with Wings",
      "sourceBookId": "emperors-children",
      "sourceLayer": "codex",
      "intrinsicKeywords": [
        "MONSTER",
        "FLY",
        "CHARACTER",
        "CHAOS",
        "DAEMON",
        "SLAANESH",
        "DAEMON PRINCE WITH WINGS",
        "EMPEROR’S CHILDREN"
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
          "T": "9",
          "Sv": "2+",
          "W": "10",
          "Ld": "6+",
          "OC": "3",
          "Invulnerable": "4+"
        },
        "statProfiles": [],
        "abilities": [
          {
            "id": "emperors-children-ability-daemonic-destruction",
            "sectionId": "emperors-children-ability-daemonic-destruction",
            "title": "Daemonic Destruction",
            "text": "Each time this model ends a Charge move, select one enemy unit within Engagement Range of it and roll one D6 for each of this model’s remaining wounds: for each 4+, that enemy unit suffers 1 mortal wound (to a maximum of 6 mortal wounds).",
            "sourceUnitId": "unit-daemon-prince-of-slaanesh-with-wings"
          },
          {
            "id": "emperors-children-ability-stimulated-by-pain",
            "sectionId": "emperors-children-ability-stimulated-by-pain",
            "title": "Stimulated by Pain",
            "text": "Each time an attack is allocated to this model, subtract 1 from the Damage characteristic of that attack.",
            "sourceUnitId": "unit-daemon-prince-of-slaanesh-with-wings"
          },
          {
            "id": "core-deadly-demise",
            "sectionId": "core-deadly-demise",
            "title": "Deadly Demise D3",
            "text": "This ability always takes the form Deadly Demise X. Each time a model in this unit is destroyed, after the units embarked within it (if any) have made their emergency disembark moves, roll one D6. On a 6, that model suffers a deadly demise; each unit within 6\" of that model suffers a number of mortal wounds denoted by X (if this is a random number, roll separately for each unit within 6\"). \n *Example: An Impulsor with a unit of Intercessors embarked within it is destroyed by ranged attacks. First, any unresolved attacks made by the attacking unit are resolved. Then the Intercessors make an emergency disembark move. Then the roll is made for the Deadly Demise ability, and on a 6, that ability is resolved. Finally, the Impulsor is removed from the battlefield.*",
            "sourceUnitId": "unit-daemon-prince-of-slaanesh-with-wings"
          },
          {
            "id": "emperors-children-ability-thrill-seekers",
            "sectionId": "emperors-children-ability-thrill-seekers",
            "title": "Thrill Seekers",
            "text": "If your Army Faction is Emperor's Children, this unit is eligible to shoot and declare a charge in a turn in which it Advanced or Fell Back, but when doing so:\n- It cannot target a unit it was within Engagement Range of at the start of the turn\n- It cannot target a unit that was the target of another unit's charge or attack this phase.",
            "sourceUnitId": "unit-daemon-prince-of-slaanesh-with-wings"
          },
          {
            "id": "core-deep-strike",
            "sectionId": "core-deep-strike",
            "title": "Deep Strike",
            "text": "Each time this unit makes an ingress move (20.04), if every model in this unit has this ability, it can be set up anywhere on the battlefield that is more than 8\" horizontally from all enemy units, even if that is within your opponent’s deployment zone.",
            "sourceUnitId": "unit-daemon-prince-of-slaanesh-with-wings"
          }
        ],
        "models": [
          {
            "id": "unit-daemon-prince-of-slaanesh-with-wings-model-18e296893e",
            "title": "Daemon Prince of Slaanesh with Wings",
            "aliases": [
              "Daemon Prince of Slaanesh with Wings"
            ],
            "min": 1,
            "max": 1,
            "legacyIds": [
              "unit-daemon-prince-of-slaanesh-with-wings-model-daemon-prince-of-slaanesh-with-wings"
            ]
          }
        ],
        "compositionRules": [],
        "selections": [
          {
            "id": "unit-daemon-prince-of-slaanesh-with-wings-selection-hellforged-weapons-strike",
            "title": "➤ Hellforged weapons - strike",
            "aliases": [
              "➤ Hellforged weapons - strike"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-daemon-prince-of-slaanesh-with-wings-profile-c3e5b71d09"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-daemon-prince-of-slaanesh-with-wings-selection-hellforged-weapons-sweep",
            "title": "➤ Hellforged weapons - sweep",
            "aliases": [
              "➤ Hellforged weapons - sweep"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-daemon-prince-of-slaanesh-with-wings-profile-ca66158213"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-daemon-prince-of-slaanesh-with-wings-selection-infernal-cannon",
            "title": "Infernal cannon",
            "aliases": [
              "Infernal cannon"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-daemon-prince-of-slaanesh-with-wings-profile-4c4589e7bd"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-daemon-prince-of-slaanesh-with-wings-weapon-family-hellforged-weapons-selection",
            "title": "➤ Hellforged weapons",
            "aliases": [
              "➤ Hellforged weapons"
            ],
            "kind": "weapon",
            "familyId": "unit-daemon-prince-of-slaanesh-with-wings-weapon-family-hellforged-weapons",
            "profileIds": [
              "unit-daemon-prince-of-slaanesh-with-wings-profile-c3e5b71d09",
              "unit-daemon-prince-of-slaanesh-with-wings-profile-ca66158213"
            ],
            "wargearAbilityIds": []
          }
        ],
        "weaponFamilies": [
          {
            "id": "unit-daemon-prince-of-slaanesh-with-wings-weapon-family-hellforged-weapons",
            "title": "➤ Hellforged weapons",
            "aliases": [
              "➤ Hellforged weapons"
            ],
            "profileIds": [
              "unit-daemon-prince-of-slaanesh-with-wings-profile-c3e5b71d09",
              "unit-daemon-prince-of-slaanesh-with-wings-profile-ca66158213"
            ],
            "ambiguousAlias": false
          }
        ],
        "weaponProfiles": [
          {
            "id": "unit-daemon-prince-of-slaanesh-with-wings-profile-c3e5b71d09",
            "legacyIds": [
              "unit-daemon-prince-of-slaanesh-with-wings-profile-hellforged-weapons-strike-melee"
            ],
            "title": "➤ Hellforged weapons - strike",
            "mode": "melee",
            "range": "Melee",
            "a": "6",
            "skill": "2+",
            "s": "8",
            "ap": "-2",
            "d": "3",
            "abilities": "",
            "sourceSelectionIds": [
              "unit-daemon-prince-of-slaanesh-with-wings-selection-hellforged-weapons-strike",
              "unit-daemon-prince-of-slaanesh-with-wings-weapon-family-hellforged-weapons-selection"
            ]
          },
          {
            "id": "unit-daemon-prince-of-slaanesh-with-wings-profile-ca66158213",
            "legacyIds": [
              "unit-daemon-prince-of-slaanesh-with-wings-profile-hellforged-weapons-sweep-melee-2"
            ],
            "title": "➤ Hellforged weapons - sweep",
            "mode": "melee",
            "range": "Melee",
            "a": "14",
            "skill": "2+",
            "s": "6",
            "ap": "0",
            "d": "1",
            "abilities": "",
            "sourceSelectionIds": [
              "unit-daemon-prince-of-slaanesh-with-wings-selection-hellforged-weapons-sweep",
              "unit-daemon-prince-of-slaanesh-with-wings-weapon-family-hellforged-weapons-selection"
            ]
          },
          {
            "id": "unit-daemon-prince-of-slaanesh-with-wings-profile-4c4589e7bd",
            "legacyIds": [
              "unit-daemon-prince-of-slaanesh-with-wings-profile-infernal-cannon-ranged-3"
            ],
            "title": "Infernal cannon",
            "mode": "ranged",
            "range": "24\"",
            "a": "3",
            "skill": "2+",
            "s": "5",
            "ap": "-1",
            "d": "2",
            "abilities": "",
            "sourceSelectionIds": [
              "unit-daemon-prince-of-slaanesh-with-wings-selection-infernal-cannon"
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
      "id": "unit-keeper-of-secrets",
      "title": "Keeper of Secrets",
      "sourceBookId": "emperors-children",
      "sourceLayer": "codex",
      "intrinsicKeywords": [
        "MONSTER",
        "CHARACTER",
        "PSYKER",
        "CHAOS",
        "DAEMON",
        "SUMMONED",
        "SLAANESH",
        "KEEPER OF SECRETS",
        "LEGIONS OF EXCESS"
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
          "T": "10",
          "Sv": "5+",
          "W": "18",
          "Ld": "6+",
          "OC": "5",
          "Invulnerable": "4+"
        },
        "statProfiles": [],
        "abilities": [
          {
            "id": "emperors-children-ability-daemon-lord-of-slaanesh-aura",
            "sectionId": "emperors-children-ability-daemon-lord-of-slaanesh-aura",
            "title": "Daemon Lord of Slaanesh (Aura)",
            "text": "While a friendly LEGIONS OF EXCESS unit is within 6\" of this model, improve the Armour Penetration characteristic of melee weapons equipped by models in that unit by 1.",
            "sourceUnitId": "unit-keeper-of-secrets"
          },
          {
            "id": "emperors-children-ability-mesmerising-form",
            "sectionId": "emperors-children-ability-mesmerising-form",
            "title": "Mesmerising Form",
            "text": "Each time an attack targets this model, subtract 1 from the Hit roll.",
            "sourceUnitId": "unit-keeper-of-secrets"
          },
          {
            "id": "emperors-children-ability-damaged-1-6-wounds-remaining",
            "sectionId": "emperors-children-ability-damaged-1-6-wounds-remaining",
            "title": "Damaged: 1-6 wounds remaining",
            "text": "While this model has 1-6 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll.",
            "sourceUnitId": "unit-keeper-of-secrets"
          },
          {
            "id": "core-deadly-demise",
            "sectionId": "core-deadly-demise",
            "title": "Deadly Demise D6",
            "text": "This ability always takes the form Deadly Demise X. Each time a model in this unit is destroyed, after the units embarked within it (if any) have made their emergency disembark moves, roll one D6. On a 6, that model suffers a deadly demise; each unit within 6\" of that model suffers a number of mortal wounds denoted by X (if this is a random number, roll separately for each unit within 6\"). \n *Example: An Impulsor with a unit of Intercessors embarked within it is destroyed by ranged attacks. First, any unresolved attacks made by the attacking unit are resolved. Then the Intercessors make an emergency disembark move. Then the roll is made for the Deadly Demise ability, and on a 6, that ability is resolved. Finally, the Impulsor is removed from the battlefield.*",
            "sourceUnitId": "unit-keeper-of-secrets"
          },
          {
            "id": "core-deep-strike",
            "sectionId": "core-deep-strike",
            "title": "Deep Strike",
            "text": "Each time this unit makes an ingress move (20.04), if every model in this unit has this ability, it can be set up anywhere on the battlefield that is more than 8\" horizontally from all enemy units, even if that is within your opponent’s deployment zone.",
            "sourceUnitId": "unit-keeper-of-secrets"
          },
          {
            "id": "emperors-children-ability-pact-of-excess",
            "sectionId": "emperors-children-ability-pact-of-excess",
            "title": "Pact of Excess",
            "text": "When mustering your army, unless specifically stated otherwise, you cannot select LEGIONS OF EXCESS as your Army Faction.",
            "sourceUnitId": "unit-keeper-of-secrets"
          }
        ],
        "models": [
          {
            "id": "unit-keeper-of-secrets-model-0463e49756",
            "title": "Keeper of Secrets",
            "aliases": [
              "Keeper of Secrets"
            ],
            "min": 1,
            "max": 1,
            "legacyIds": [
              "unit-keeper-of-secrets-model-keeper-of-secrets"
            ]
          }
        ],
        "compositionRules": [],
        "selections": [
          {
            "id": "unit-keeper-of-secrets-selection-phantasmagoria-witchfire",
            "title": "➤ Phantasmagoria - witchfire",
            "aliases": [
              "➤ Phantasmagoria - witchfire"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-keeper-of-secrets-profile-1e3274604b"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-keeper-of-secrets-selection-phantasmagoria-focused-witchfire",
            "title": "➤ Phantasmagoria - focused witchfire",
            "aliases": [
              "➤ Phantasmagoria - focused witchfire"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-keeper-of-secrets-profile-d1c48a59c6"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-keeper-of-secrets-selection-snapping-claws",
            "title": "Snapping claws",
            "aliases": [
              "Snapping claws"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-keeper-of-secrets-profile-18e13e0d13"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-keeper-of-secrets-selection-witstealer-sword",
            "title": "Witstealer sword",
            "aliases": [
              "Witstealer sword"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-keeper-of-secrets-profile-baa12b9e69"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-keeper-of-secrets-selection-living-whip",
            "title": "Living whip",
            "aliases": [
              "Living whip"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-keeper-of-secrets-profile-729db60bbb"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-keeper-of-secrets-selection-ritual-knife",
            "title": "Ritual knife",
            "aliases": [
              "Ritual knife"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-keeper-of-secrets-profile-7439de4698"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-keeper-of-secrets-weapon-family-phantasmagoria-selection",
            "title": "➤ Phantasmagoria",
            "aliases": [
              "➤ Phantasmagoria"
            ],
            "kind": "weapon",
            "familyId": "unit-keeper-of-secrets-weapon-family-phantasmagoria",
            "profileIds": [
              "unit-keeper-of-secrets-profile-1e3274604b",
              "unit-keeper-of-secrets-profile-d1c48a59c6"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-keeper-of-secrets-selection-shining-aegis",
            "title": "Shining aegis",
            "aliases": [
              "Shining aegis"
            ],
            "kind": "wargear",
            "profileIds": [],
            "wargearAbilityIds": [
              "unit-keeper-of-secrets-wargear-ability-8c94fe64e9"
            ]
          }
        ],
        "weaponFamilies": [
          {
            "id": "unit-keeper-of-secrets-weapon-family-phantasmagoria",
            "title": "➤ Phantasmagoria",
            "aliases": [
              "➤ Phantasmagoria"
            ],
            "profileIds": [
              "unit-keeper-of-secrets-profile-1e3274604b",
              "unit-keeper-of-secrets-profile-d1c48a59c6"
            ],
            "ambiguousAlias": false
          }
        ],
        "weaponProfiles": [
          {
            "id": "unit-keeper-of-secrets-profile-1e3274604b",
            "legacyIds": [
              "unit-keeper-of-secrets-profile-phantasmagoria-witchfire-ranged"
            ],
            "title": "➤ Phantasmagoria - witchfire",
            "mode": "ranged",
            "range": "18\"",
            "a": "6",
            "skill": "2+",
            "s": "6",
            "ap": "-2",
            "d": "1",
            "abilities": "Devastating Wounds, Psychic",
            "sourceSelectionIds": [
              "unit-keeper-of-secrets-selection-phantasmagoria-witchfire",
              "unit-keeper-of-secrets-weapon-family-phantasmagoria-selection"
            ]
          },
          {
            "id": "unit-keeper-of-secrets-profile-d1c48a59c6",
            "legacyIds": [
              "unit-keeper-of-secrets-profile-phantasmagoria-focused-witchfire-ranged-2"
            ],
            "title": "➤ Phantasmagoria - focused witchfire",
            "mode": "ranged",
            "range": "18\"",
            "a": "9",
            "skill": "2+",
            "s": "6",
            "ap": "-2",
            "d": "1",
            "abilities": "Devastating Wounds, Hazardous, Psychic",
            "sourceSelectionIds": [
              "unit-keeper-of-secrets-selection-phantasmagoria-focused-witchfire",
              "unit-keeper-of-secrets-weapon-family-phantasmagoria-selection"
            ]
          },
          {
            "id": "unit-keeper-of-secrets-profile-18e13e0d13",
            "legacyIds": [
              "unit-keeper-of-secrets-profile-snapping-claws-melee-3"
            ],
            "title": "Snapping claws",
            "mode": "melee",
            "range": "Melee",
            "a": "4",
            "skill": "2+",
            "s": "6",
            "ap": "-2",
            "d": "3",
            "abilities": "Devastating Wounds, Extra Attacks",
            "sourceSelectionIds": [
              "unit-keeper-of-secrets-selection-snapping-claws"
            ]
          },
          {
            "id": "unit-keeper-of-secrets-profile-baa12b9e69",
            "legacyIds": [
              "unit-keeper-of-secrets-profile-witstealer-sword-melee-4"
            ],
            "title": "Witstealer sword",
            "mode": "melee",
            "range": "Melee",
            "a": "6",
            "skill": "2+",
            "s": "8",
            "ap": "-2",
            "d": "3",
            "abilities": "",
            "sourceSelectionIds": [
              "unit-keeper-of-secrets-selection-witstealer-sword"
            ]
          },
          {
            "id": "unit-keeper-of-secrets-profile-729db60bbb",
            "legacyIds": [
              "unit-keeper-of-secrets-profile-living-whip-ranged-5"
            ],
            "title": "Living whip",
            "mode": "ranged",
            "range": "12\"",
            "a": "6",
            "skill": "2+",
            "s": "6",
            "ap": "-1",
            "d": "2",
            "abilities": "Assault",
            "sourceSelectionIds": [
              "unit-keeper-of-secrets-selection-living-whip"
            ]
          },
          {
            "id": "unit-keeper-of-secrets-profile-7439de4698",
            "legacyIds": [
              "unit-keeper-of-secrets-profile-ritual-knife-melee-6"
            ],
            "title": "Ritual knife",
            "mode": "melee",
            "range": "Melee",
            "a": "3",
            "skill": "2+",
            "s": "6",
            "ap": "-2",
            "d": "2",
            "abilities": "Extra Attacks",
            "sourceSelectionIds": [
              "unit-keeper-of-secrets-selection-ritual-knife"
            ]
          }
        ],
        "wargearAbilities": [
          {
            "id": "unit-keeper-of-secrets-wargear-ability-8c94fe64e9",
            "sectionId": "unit-keeper-of-secrets-wargear-ability-8c94fe64e9",
            "title": "Shining aegis",
            "text": "The bearer has a Save characteristic of 3+.",
            "sourceUnitId": "unit-keeper-of-secrets",
            "legacyIds": [
              "unit-keeper-of-secrets-wargear-ability-shining-aegis"
            ],
            "requiredSelectionIds": [
              "unit-keeper-of-secrets-selection-shining-aegis"
            ]
          }
        ],
        "wargearDefaults": [
          {
            "modelId": "unit-keeper-of-secrets-model-0463e49756",
            "selections": [
              {
                "selectionId": "unit-keeper-of-secrets-weapon-family-phantasmagoria-selection",
                "quantity": 1
              },
              {
                "selectionId": "unit-keeper-of-secrets-selection-snapping-claws",
                "quantity": 1
              },
              {
                "selectionId": "unit-keeper-of-secrets-selection-witstealer-sword",
                "quantity": 1
              }
            ]
          }
        ],
        "wargearOptionContracts": [
          {
            "sourceId": "datasheet-keeper-of-secrets:wargear:1",
            "eligibleModelIds": [
              "unit-keeper-of-secrets-model-0463e49756"
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
                    "selectionId": "unit-keeper-of-secrets-selection-living-whip",
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
                    "selectionId": "unit-keeper-of-secrets-selection-ritual-knife",
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
                    "selectionId": "unit-keeper-of-secrets-selection-shining-aegis",
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
      "id": "unit-lord-exultant",
      "title": "Lord Exultant",
      "sourceBookId": "emperors-children",
      "sourceLayer": "codex",
      "intrinsicKeywords": [
        "INFANTRY",
        "CHARACTER",
        "GRENADES",
        "CHAOS",
        "SLAANESH",
        "LORD EXULTANT",
        "EMPEROR’S CHILDREN"
      ],
      "relations": {
        "canLead": [
          {
            "unitId": "unit-infractors",
            "maxCharacters": 1
          },
          {
            "unitId": "unit-tormentors",
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
              "unitId": "unit-infractors",
              "maxCharacters": 1
            },
            {
              "unitId": "unit-tormentors",
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
          "T": "4",
          "Sv": "3+",
          "W": "5",
          "Ld": "6+",
          "OC": "1",
          "Invulnerable": "4+"
        },
        "statProfiles": [],
        "abilities": [
          {
            "id": "emperors-children-ability-perfectionists",
            "sectionId": "emperors-children-ability-perfectionists",
            "title": "Perfectionists",
            "text": "While this model is leading a unit, weapons equipped by models in that unit have the [LETHAL HITS] ability.",
            "sourceUnitId": "unit-lord-exultant"
          },
          {
            "id": "emperors-children-ability-euphoric-strikes",
            "sectionId": "emperors-children-ability-euphoric-strikes",
            "title": "Euphoric Strikes",
            "text": "Once per battle, at the start of the Fight phase, this model can use this ability. If it does, until the end of the phase, add 3 to the Attacks characteristic of melee weapons equipped by this model and improve the Armour Penetration characteristic of those weapons by 1.",
            "sourceUnitId": "unit-lord-exultant"
          },
          {
            "id": "emperors-children-ability-lord-of-the-host",
            "sectionId": "emperors-children-ability-lord-of-the-host",
            "title": "Lord of the Host",
            "text": "If this model is attached to an EMPEROR’S CHILDREN BATTLELINE unit during the Declare Battle Formations step, this model has the Infiltrators and Scouts 6\" abilities.",
            "sourceUnitId": "unit-lord-exultant"
          },
          {
            "id": "core-leader",
            "sectionId": "core-leader",
            "title": "Leader",
            "text": "This model can be attached to the following units: INFRACTORS, TORMENTORS.",
            "sourceUnitId": "unit-lord-exultant"
          },
          {
            "id": "emperors-children-ability-thrill-seekers",
            "sectionId": "emperors-children-ability-thrill-seekers",
            "title": "Thrill Seekers",
            "text": "If your Army Faction is Emperor's Children, this unit is eligible to shoot and declare a charge in a turn in which it Advanced or Fell Back, but when doing so:\n- It cannot target a unit it was within Engagement Range of at the start of the turn\n- It cannot target a unit that was the target of another unit's charge or attack this phase.",
            "sourceUnitId": "unit-lord-exultant"
          }
        ],
        "models": [
          {
            "id": "unit-lord-exultant-model-fad99158fd",
            "title": "Lord Exultant",
            "aliases": [
              "Lord Exultant"
            ],
            "min": 1,
            "max": 1,
            "legacyIds": [
              "unit-lord-exultant-model-lord-exultant"
            ]
          }
        ],
        "compositionRules": [],
        "selections": [
          {
            "id": "unit-lord-exultant-selection-close-combat-weapon",
            "title": "Close combat weapon",
            "aliases": [
              "Close combat weapon"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-lord-exultant-profile-8dd496396b"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-lord-exultant-selection-rapture-lash",
            "title": "Rapture lash",
            "aliases": [
              "Rapture lash"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-lord-exultant-profile-4c2c7fea59"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-lord-exultant-selection-plasma-pistol-standard",
            "title": "➤ Plasma pistol - standard",
            "aliases": [
              "➤ Plasma pistol - standard"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-lord-exultant-profile-d55ca3e187"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-lord-exultant-selection-plasma-pistol-supercharge",
            "title": "➤ Plasma pistol - supercharge",
            "aliases": [
              "➤ Plasma pistol - supercharge"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-lord-exultant-profile-efe950ff19"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-lord-exultant-selection-power-fist",
            "title": "Power fist",
            "aliases": [
              "Power fist"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-lord-exultant-profile-079648680a"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-lord-exultant-selection-phoenix-power-spear",
            "title": "Phoenix power spear",
            "aliases": [
              "Phoenix power spear"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-lord-exultant-profile-20739776bf"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-lord-exultant-selection-master-crafted-power-sword",
            "title": "Master-crafted power sword",
            "aliases": [
              "Master-crafted power sword"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-lord-exultant-profile-1f62a6185d"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-lord-exultant-selection-screamer-pistol",
            "title": "Screamer pistol",
            "aliases": [
              "Screamer pistol"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-lord-exultant-profile-e99a763788"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-lord-exultant-selection-bolt-pistol",
            "title": "Bolt pistol",
            "aliases": [
              "Bolt pistol"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-lord-exultant-profile-6b166e96e4"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-lord-exultant-weapon-family-plasma-pistol-selection",
            "title": "➤ Plasma pistol",
            "aliases": [
              "➤ Plasma pistol"
            ],
            "kind": "weapon",
            "familyId": "unit-lord-exultant-weapon-family-plasma-pistol",
            "profileIds": [
              "unit-lord-exultant-profile-d55ca3e187",
              "unit-lord-exultant-profile-efe950ff19"
            ],
            "wargearAbilityIds": []
          }
        ],
        "weaponFamilies": [
          {
            "id": "unit-lord-exultant-weapon-family-plasma-pistol",
            "title": "➤ Plasma pistol",
            "aliases": [
              "➤ Plasma pistol"
            ],
            "profileIds": [
              "unit-lord-exultant-profile-d55ca3e187",
              "unit-lord-exultant-profile-efe950ff19"
            ],
            "ambiguousAlias": false
          }
        ],
        "weaponProfiles": [
          {
            "id": "unit-lord-exultant-profile-8dd496396b",
            "legacyIds": [
              "unit-lord-exultant-profile-close-combat-weapon-melee"
            ],
            "title": "Close combat weapon",
            "mode": "melee",
            "range": "Melee",
            "a": "6",
            "skill": "2+",
            "s": "4",
            "ap": "0",
            "d": "1",
            "abilities": "",
            "sourceSelectionIds": [
              "unit-lord-exultant-selection-close-combat-weapon"
            ]
          },
          {
            "id": "unit-lord-exultant-profile-4c2c7fea59",
            "legacyIds": [
              "unit-lord-exultant-profile-rapture-lash-melee-2"
            ],
            "title": "Rapture lash",
            "mode": "melee",
            "range": "Melee",
            "a": "4",
            "skill": "2+",
            "s": "4",
            "ap": "-1",
            "d": "1",
            "abilities": "Extra Attacks",
            "sourceSelectionIds": [
              "unit-lord-exultant-selection-rapture-lash"
            ]
          },
          {
            "id": "unit-lord-exultant-profile-d55ca3e187",
            "legacyIds": [
              "unit-lord-exultant-profile-plasma-pistol-standard-ranged-3"
            ],
            "title": "➤ Plasma pistol - standard",
            "mode": "ranged",
            "range": "12\"",
            "a": "1",
            "skill": "2+",
            "s": "7",
            "ap": "-2",
            "d": "1",
            "abilities": "Pistol",
            "sourceSelectionIds": [
              "unit-lord-exultant-selection-plasma-pistol-standard",
              "unit-lord-exultant-weapon-family-plasma-pistol-selection"
            ]
          },
          {
            "id": "unit-lord-exultant-profile-efe950ff19",
            "legacyIds": [
              "unit-lord-exultant-profile-plasma-pistol-supercharge-ranged-4"
            ],
            "title": "➤ Plasma pistol - supercharge",
            "mode": "ranged",
            "range": "12\"",
            "a": "1",
            "skill": "2+",
            "s": "8",
            "ap": "-3",
            "d": "2",
            "abilities": "Hazardous, Pistol",
            "sourceSelectionIds": [
              "unit-lord-exultant-selection-plasma-pistol-supercharge",
              "unit-lord-exultant-weapon-family-plasma-pistol-selection"
            ]
          },
          {
            "id": "unit-lord-exultant-profile-079648680a",
            "legacyIds": [
              "unit-lord-exultant-profile-power-fist-melee-5"
            ],
            "title": "Power fist",
            "mode": "melee",
            "range": "Melee",
            "a": "5",
            "skill": "2+",
            "s": "8",
            "ap": "-2",
            "d": "2",
            "abilities": "",
            "sourceSelectionIds": [
              "unit-lord-exultant-selection-power-fist"
            ]
          },
          {
            "id": "unit-lord-exultant-profile-20739776bf",
            "legacyIds": [
              "unit-lord-exultant-profile-phoenix-power-spear-melee-6"
            ],
            "title": "Phoenix power spear",
            "mode": "melee",
            "range": "Melee",
            "a": "5",
            "skill": "2+",
            "s": "7",
            "ap": "-2",
            "d": "2",
            "abilities": "Lance",
            "sourceSelectionIds": [
              "unit-lord-exultant-selection-phoenix-power-spear"
            ]
          },
          {
            "id": "unit-lord-exultant-profile-1f62a6185d",
            "legacyIds": [
              "unit-lord-exultant-profile-master-crafted-power-sword-melee-7"
            ],
            "title": "Master-crafted power sword",
            "mode": "melee",
            "range": "Melee",
            "a": "5",
            "skill": "2+",
            "s": "5",
            "ap": "-2",
            "d": "2",
            "abilities": "Precision",
            "sourceSelectionIds": [
              "unit-lord-exultant-selection-master-crafted-power-sword"
            ]
          },
          {
            "id": "unit-lord-exultant-profile-e99a763788",
            "legacyIds": [
              "unit-lord-exultant-profile-screamer-pistol-ranged-8"
            ],
            "title": "Screamer pistol",
            "mode": "ranged",
            "range": "12\"",
            "a": "3",
            "skill": "2+",
            "s": "5",
            "ap": "-1",
            "d": "2",
            "abilities": "Ignores Cover, Pistol",
            "sourceSelectionIds": [
              "unit-lord-exultant-selection-screamer-pistol"
            ]
          },
          {
            "id": "unit-lord-exultant-profile-6b166e96e4",
            "legacyIds": [
              "unit-lord-exultant-profile-bolt-pistol-ranged-9"
            ],
            "title": "Bolt pistol",
            "mode": "ranged",
            "range": "12\"",
            "a": "1",
            "skill": "2+",
            "s": "4",
            "ap": "0",
            "d": "1",
            "abilities": "Pistol",
            "sourceSelectionIds": [
              "unit-lord-exultant-selection-bolt-pistol"
            ]
          }
        ],
        "wargearAbilities": [],
        "wargearDefaults": [
          {
            "modelId": "unit-lord-exultant-model-fad99158fd",
            "selections": [
              {
                "selectionId": "unit-lord-exultant-selection-bolt-pistol",
                "quantity": 1
              },
              {
                "selectionId": "unit-lord-exultant-weapon-family-plasma-pistol-selection",
                "quantity": 1
              },
              {
                "selectionId": "unit-lord-exultant-selection-phoenix-power-spear",
                "quantity": 1
              },
              {
                "selectionId": "unit-lord-exultant-selection-close-combat-weapon",
                "quantity": 1
              }
            ]
          }
        ],
        "wargearOptionContracts": [
          {
            "sourceId": "datasheet-lord-exultant:wargear:1",
            "eligibleModelIds": [
              "unit-lord-exultant-model-fad99158fd"
            ],
            "limit": {
              "perModel": 1,
              "perUnit": 1
            },
            "choices": [
              {
                "remove": [
                  {
                    "selectionId": "unit-lord-exultant-weapon-family-plasma-pistol-selection",
                    "quantity": 1
                  }
                ],
                "add": [
                  {
                    "selectionId": "unit-lord-exultant-selection-power-fist",
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
                    "selectionId": "unit-lord-exultant-weapon-family-plasma-pistol-selection",
                    "quantity": 1
                  }
                ],
                "add": [
                  {
                    "selectionId": "unit-lord-exultant-selection-rapture-lash",
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
            "sourceId": "datasheet-lord-exultant:wargear:2",
            "eligibleModelIds": [
              "unit-lord-exultant-model-fad99158fd"
            ],
            "limit": {
              "perModel": 1,
              "perUnit": 1
            },
            "choices": [
              {
                "remove": [
                  {
                    "selectionId": "unit-lord-exultant-selection-phoenix-power-spear",
                    "quantity": 1
                  }
                ],
                "add": [
                  {
                    "selectionId": "unit-lord-exultant-selection-master-crafted-power-sword",
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
                    "selectionId": "unit-lord-exultant-selection-phoenix-power-spear",
                    "quantity": 1
                  }
                ],
                "add": [
                  {
                    "selectionId": "unit-lord-exultant-selection-screamer-pistol",
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
      "id": "unit-lord-kakophonist",
      "title": "Lord Kakophonist",
      "sourceBookId": "emperors-children",
      "sourceLayer": "codex",
      "intrinsicKeywords": [
        "INFANTRY",
        "CHARACTER",
        "GRENADES",
        "CHAOS",
        "SLAANESH",
        "LORD KAKOPHONIST",
        "EMPEROR’S CHILDREN"
      ],
      "relations": {
        "canLead": [
          {
            "unitId": "unit-chaos-terminators",
            "maxCharacters": 1
          },
          {
            "unitId": "unit-noise-marines",
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
              "unitId": "unit-chaos-terminators",
              "maxCharacters": 1
            },
            {
              "unitId": "unit-noise-marines",
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
          "T": "5",
          "Sv": "2+",
          "W": "6",
          "Ld": "6+",
          "OC": "1",
          "Invulnerable": "4+"
        },
        "statProfiles": [],
        "abilities": [
          {
            "id": "core-leader",
            "sectionId": "core-leader",
            "title": "Leader",
            "text": "This model can be attached to the following units: CHAOS TERMINATORS, NOISE MARINES.",
            "sourceUnitId": "unit-lord-kakophonist"
          },
          {
            "id": "emperors-children-ability-obsessive-annunciation",
            "sectionId": "emperors-children-ability-obsessive-annunciation",
            "title": "Obsessive Annunciation",
            "text": "While this model is leading a unit, ranged weapons equipped by models in that unit have the [SUSTAINED HITS 1] ability.",
            "sourceUnitId": "unit-lord-kakophonist"
          },
          {
            "id": "emperors-children-ability-doom-siren",
            "sectionId": "emperors-children-ability-doom-siren",
            "title": "Doom Siren",
            "text": "In your Shooting phase, after this model’s unit has shot, select one enemy INFANTRY unit hit by one or more of those attacks and roll three D6: for each 4+, that enemy unit suffers 1 mortal wound. If an enemy unit suffers one or more mortal wounds as a result of this ability, it must take a Battle-shock test.",
            "sourceUnitId": "unit-lord-kakophonist"
          },
          {
            "id": "emperors-children-ability-thrill-seekers",
            "sectionId": "emperors-children-ability-thrill-seekers",
            "title": "Thrill Seekers",
            "text": "If your Army Faction is Emperor's Children, this unit is eligible to shoot and declare a charge in a turn in which it Advanced or Fell Back, but when doing so:\n- It cannot target a unit it was within Engagement Range of at the start of the turn\n- It cannot target a unit that was the target of another unit's charge or attack this phase.",
            "sourceUnitId": "unit-lord-kakophonist"
          }
        ],
        "models": [
          {
            "id": "unit-lord-kakophonist-model-74bbb1ff16",
            "title": "Lord Kakophonist",
            "aliases": [
              "Lord Kakophonist"
            ],
            "min": 1,
            "max": 1,
            "legacyIds": [
              "unit-lord-kakophonist-model-lord-kakophonist"
            ]
          }
        ],
        "compositionRules": [],
        "selections": [
          {
            "id": "unit-lord-kakophonist-selection-power-sword",
            "title": "Power sword",
            "aliases": [
              "Power sword"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-lord-kakophonist-profile-a918f5cd1e"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-lord-kakophonist-selection-close-combat-weapon",
            "title": "Close combat weapon",
            "aliases": [
              "Close combat weapon"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-lord-kakophonist-profile-8dd496396b"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-lord-kakophonist-selection-screamer-pistol",
            "title": "Screamer pistol",
            "aliases": [
              "Screamer pistol"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-lord-kakophonist-profile-e99a763788"
            ],
            "wargearAbilityIds": []
          }
        ],
        "weaponFamilies": [],
        "weaponProfiles": [
          {
            "id": "unit-lord-kakophonist-profile-a918f5cd1e",
            "legacyIds": [
              "unit-lord-kakophonist-profile-power-sword-melee"
            ],
            "title": "Power sword",
            "mode": "melee",
            "range": "Melee",
            "a": "6",
            "skill": "2+",
            "s": "5",
            "ap": "-2",
            "d": "1",
            "abilities": "",
            "sourceSelectionIds": [
              "unit-lord-kakophonist-selection-power-sword"
            ]
          },
          {
            "id": "unit-lord-kakophonist-profile-8dd496396b",
            "legacyIds": [
              "unit-lord-kakophonist-profile-close-combat-weapon-melee-2"
            ],
            "title": "Close combat weapon",
            "mode": "melee",
            "range": "Melee",
            "a": "6",
            "skill": "2+",
            "s": "4",
            "ap": "0",
            "d": "1",
            "abilities": "",
            "sourceSelectionIds": [
              "unit-lord-kakophonist-selection-close-combat-weapon"
            ]
          },
          {
            "id": "unit-lord-kakophonist-profile-e99a763788",
            "legacyIds": [
              "unit-lord-kakophonist-profile-screamer-pistol-ranged-3"
            ],
            "title": "Screamer pistol",
            "mode": "ranged",
            "range": "12\"",
            "a": "3",
            "skill": "2+",
            "s": "5",
            "ap": "-1",
            "d": "2",
            "abilities": "Ignores Cover, Pistol",
            "sourceSelectionIds": [
              "unit-lord-kakophonist-selection-screamer-pistol"
            ]
          }
        ],
        "wargearAbilities": [],
        "wargearDefaults": [
          {
            "modelId": "unit-lord-kakophonist-model-74bbb1ff16",
            "selections": [
              {
                "selectionId": "unit-lord-kakophonist-selection-screamer-pistol",
                "quantity": 1
              },
              {
                "selectionId": "unit-lord-kakophonist-selection-power-sword",
                "quantity": 1
              }
            ]
          }
        ],
        "wargearOptionContracts": [
          {
            "sourceId": "datasheet-lord-kakophonist:wargear:1",
            "eligibleModelIds": [
              "unit-lord-kakophonist-model-74bbb1ff16"
            ],
            "limit": {
              "perModel": 1,
              "perUnit": 1
            },
            "choices": [
              {
                "remove": [
                  {
                    "selectionId": "unit-lord-kakophonist-selection-power-sword",
                    "quantity": 1
                  }
                ],
                "add": [
                  {
                    "selectionId": "unit-lord-kakophonist-selection-screamer-pistol",
                    "quantity": 1
                  },
                  {
                    "selectionId": "unit-lord-kakophonist-selection-close-combat-weapon",
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
      "id": "unit-sorcerer",
      "title": "Sorcerer",
      "sourceBookId": "emperors-children",
      "sourceLayer": "codex",
      "intrinsicKeywords": [
        "INFANTRY",
        "CHARACTER",
        "PSYKER",
        "GRENADES",
        "CHAOS",
        "SLAANESH",
        "SORCERER",
        "EMPEROR’S CHILDREN"
      ],
      "relations": {
        "canLead": [
          {
            "unitId": "unit-infractors",
            "maxCharacters": 1
          },
          {
            "unitId": "unit-noise-marines",
            "maxCharacters": 1
          },
          {
            "unitId": "unit-tormentors",
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
              "unitId": "unit-infractors",
              "maxCharacters": 1
            },
            {
              "unitId": "unit-noise-marines",
              "maxCharacters": 1
            },
            {
              "unitId": "unit-tormentors",
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
          "T": "4",
          "Sv": "3+",
          "W": "4",
          "Ld": "6+",
          "OC": "1",
          "Invulnerable": ""
        },
        "statProfiles": [],
        "abilities": [
          {
            "id": "core-leader",
            "sectionId": "core-leader",
            "title": "Leader",
            "text": "This model can be attached to the following units: INFRACTORS, NOISE MARINES, TORMENTORS.",
            "sourceUnitId": "unit-sorcerer"
          },
          {
            "id": "emperors-children-ability-warped-interference-psychic",
            "sectionId": "emperors-children-ability-warped-interference-psychic",
            "title": "Warped Interference (Psychic)",
            "text": "While this model is leading a unit, each time a ranged attack targets that unit, models in it have the Benefit of Cover against that attack.",
            "sourceUnitId": "unit-sorcerer"
          },
          {
            "id": "emperors-children-ability-wracking-agonies-psychic",
            "sectionId": "emperors-children-ability-wracking-agonies-psychic",
            "title": "Wracking Agonies (Psychic)",
            "text": "In your Shooting phase, after this model has shot, select one INFANTRY unit hit by one or more of those attacks made with its Agonising Energies. Until the start of your next turn, that unit is wracked with agonies. While a unit is wracked with agonies, subtract 2\" from its Move characteristic and subtract 2 from Charge rolls made for it.",
            "sourceUnitId": "unit-sorcerer"
          },
          {
            "id": "emperors-children-ability-thrill-seekers",
            "sectionId": "emperors-children-ability-thrill-seekers",
            "title": "Thrill Seekers",
            "text": "If your Army Faction is Emperor's Children, this unit is eligible to shoot and declare a charge in a turn in which it Advanced or Fell Back, but when doing so:\n- It cannot target a unit it was within Engagement Range of at the start of the turn\n- It cannot target a unit that was the target of another unit's charge or attack this phase.",
            "sourceUnitId": "unit-sorcerer"
          }
        ],
        "models": [
          {
            "id": "unit-sorcerer-model-93418ea12f",
            "title": "Sorcerer",
            "aliases": [
              "Sorcerer"
            ],
            "min": 1,
            "max": 1,
            "legacyIds": [
              "unit-sorcerer-model-sorcerer"
            ]
          }
        ],
        "compositionRules": [],
        "selections": [
          {
            "id": "unit-sorcerer-selection-agonising-energies-witchfire",
            "title": "Agonising Energies - witchfire",
            "aliases": [
              "Agonising Energies - witchfire"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-sorcerer-profile-97b422cdff"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-sorcerer-selection-agonising-energies-focused-witchfire",
            "title": "Agonising Energies - focused witchfire",
            "aliases": [
              "Agonising Energies - focused witchfire"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-sorcerer-profile-4da4955b23"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-sorcerer-selection-force-weapon",
            "title": "Force weapon",
            "aliases": [
              "Force weapon"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-sorcerer-profile-99b234094f"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-sorcerer-selection-bolt-pistol",
            "title": "Bolt pistol",
            "aliases": [
              "Bolt pistol"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-sorcerer-profile-a16d0444b0"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-sorcerer-weapon-family-agonising-energies-selection",
            "title": "Agonising Energies",
            "aliases": [
              "Agonising Energies"
            ],
            "kind": "weapon",
            "familyId": "unit-sorcerer-weapon-family-agonising-energies",
            "profileIds": [
              "unit-sorcerer-profile-97b422cdff",
              "unit-sorcerer-profile-4da4955b23"
            ],
            "wargearAbilityIds": []
          }
        ],
        "weaponFamilies": [
          {
            "id": "unit-sorcerer-weapon-family-agonising-energies",
            "title": "Agonising Energies",
            "aliases": [
              "Agonising Energies"
            ],
            "profileIds": [
              "unit-sorcerer-profile-97b422cdff",
              "unit-sorcerer-profile-4da4955b23"
            ],
            "ambiguousAlias": false
          }
        ],
        "weaponProfiles": [
          {
            "id": "unit-sorcerer-profile-97b422cdff",
            "legacyIds": [
              "unit-sorcerer-profile-agonising-energies-witchfire-ranged"
            ],
            "title": "Agonising Energies - witchfire",
            "mode": "ranged",
            "range": "18\"",
            "a": "D6",
            "skill": "3+",
            "s": "5",
            "ap": "-1",
            "d": "D3",
            "abilities": "Psychic",
            "sourceSelectionIds": [
              "unit-sorcerer-selection-agonising-energies-witchfire",
              "unit-sorcerer-weapon-family-agonising-energies-selection"
            ]
          },
          {
            "id": "unit-sorcerer-profile-4da4955b23",
            "legacyIds": [
              "unit-sorcerer-profile-agonising-energies-focused-witchfire-ranged-2"
            ],
            "title": "Agonising Energies - focused witchfire",
            "mode": "ranged",
            "range": "18\"",
            "a": "D6",
            "skill": "3+",
            "s": "6",
            "ap": "-2",
            "d": "D3",
            "abilities": "Devastating Wounds, Hazardous, Psychic",
            "sourceSelectionIds": [
              "unit-sorcerer-selection-agonising-energies-focused-witchfire",
              "unit-sorcerer-weapon-family-agonising-energies-selection"
            ]
          },
          {
            "id": "unit-sorcerer-profile-99b234094f",
            "legacyIds": [
              "unit-sorcerer-profile-force-weapon-melee-3"
            ],
            "title": "Force weapon",
            "mode": "melee",
            "range": "Melee",
            "a": "4",
            "skill": "3+",
            "s": "6",
            "ap": "-2",
            "d": "D3",
            "abilities": "Psychic",
            "sourceSelectionIds": [
              "unit-sorcerer-selection-force-weapon"
            ]
          },
          {
            "id": "unit-sorcerer-profile-a16d0444b0",
            "legacyIds": [
              "unit-sorcerer-profile-bolt-pistol-ranged-4"
            ],
            "title": "Bolt pistol",
            "mode": "ranged",
            "range": "12\"",
            "a": "1",
            "skill": "3+",
            "s": "4",
            "ap": "0",
            "d": "1",
            "abilities": "Pistol",
            "sourceSelectionIds": [
              "unit-sorcerer-selection-bolt-pistol"
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
      "id": "unit-chaos-rhino",
      "title": "Chaos Rhino",
      "sourceBookId": "emperors-children",
      "sourceLayer": "codex",
      "intrinsicKeywords": [
        "VEHICLE",
        "TRANSPORT",
        "FRAME",
        "DEDICATED TRANSPORT",
        "SMOKE",
        "CHAOS",
        "SLAANESH",
        "RHINO",
        "EMPEROR’S CHILDREN"
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
          "W": "10",
          "Ld": "6+",
          "OC": "2",
          "Invulnerable": ""
        },
        "statProfiles": [],
        "abilities": [
          {
            "id": "emperors-children-ability-assault-vehicle",
            "sectionId": "emperors-children-ability-assault-vehicle",
            "title": "Assault Vehicle",
            "text": "Units can disembark from this TRANSPORT after it has Advanced. Units that do so make a shock disembark move (Core Rules, 18.07) for that disembarkation.",
            "sourceUnitId": "unit-chaos-rhino"
          },
          {
            "id": "core-deadly-demise",
            "sectionId": "core-deadly-demise",
            "title": "Deadly Demise D3",
            "text": "This ability always takes the form Deadly Demise X. Each time a model in this unit is destroyed, after the units embarked within it (if any) have made their emergency disembark moves, roll one D6. On a 6, that model suffers a deadly demise; each unit within 6\" of that model suffers a number of mortal wounds denoted by X (if this is a random number, roll separately for each unit within 6\"). \n *Example: An Impulsor with a unit of Intercessors embarked within it is destroyed by ranged attacks. First, any unresolved attacks made by the attacking unit are resolved. Then the Intercessors make an emergency disembark move. Then the roll is made for the Deadly Demise ability, and on a 6, that ability is resolved. Finally, the Impulsor is removed from the battlefield.*",
            "sourceUnitId": "unit-chaos-rhino"
          },
          {
            "id": "emperors-children-ability-thrill-seekers",
            "sectionId": "emperors-children-ability-thrill-seekers",
            "title": "Thrill Seekers",
            "text": "If your Army Faction is Emperor's Children, this unit is eligible to shoot and declare a charge in a turn in which it Advanced or Fell Back, but when doing so:\n- It cannot target a unit it was within Engagement Range of at the start of the turn\n- It cannot target a unit that was the target of another unit's charge or attack this phase.",
            "sourceUnitId": "unit-chaos-rhino"
          },
          {
            "id": "core-firing-deck",
            "sectionId": "core-firing-deck",
            "title": "Firing Deck 2",
            "text": "This ability always takes the form Firing Deck X. In your Shooting phase, each time this TRANSPORT is selected to shoot, if one or more units are embarked within it, resolve the following sequence: \n1. Select up to X models embarked within this TRANSPORT (excluding models whose units have already been selected to shoot this phase). \n2. For each selected model, select one of its ranged weapons (excluding [ONE SHOT] weapons). \n3. Until this TRANSPORT has resolved all of its attacks, it has all of those selected weapons in addition to its other weapons. \n4. Until the end of the turn, units embarked within this TRANSPORT are not eligible to shoot.",
            "sourceUnitId": "unit-chaos-rhino"
          }
        ],
        "models": [
          {
            "id": "unit-chaos-rhino-model-74ad18f164",
            "title": "Chaos Rhino",
            "aliases": [
              "Chaos Rhino"
            ],
            "min": 1,
            "max": 1,
            "legacyIds": [
              "unit-chaos-rhino-model-chaos-rhino"
            ]
          }
        ],
        "compositionRules": [],
        "selections": [
          {
            "id": "unit-chaos-rhino-selection-armoured-tracks",
            "title": "Armoured tracks",
            "aliases": [
              "Armoured tracks"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-chaos-rhino-profile-370d5ddd9f"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-chaos-rhino-selection-combi-bolter",
            "title": "Combi-bolter",
            "aliases": [
              "Combi-bolter"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-chaos-rhino-profile-fccf7bd10d"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-chaos-rhino-selection-combi-weapon",
            "title": "Combi-weapon",
            "aliases": [
              "Combi-weapon"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-chaos-rhino-profile-42bcc6f259"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-chaos-rhino-selection-havoc-launcher",
            "title": "Havoc launcher",
            "aliases": [
              "Havoc launcher"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-chaos-rhino-profile-b45d52231c"
            ],
            "wargearAbilityIds": []
          }
        ],
        "weaponFamilies": [],
        "weaponProfiles": [
          {
            "id": "unit-chaos-rhino-profile-370d5ddd9f",
            "legacyIds": [
              "unit-chaos-rhino-profile-armoured-tracks-melee"
            ],
            "title": "Armoured tracks",
            "mode": "melee",
            "range": "Melee",
            "a": "3",
            "skill": "4+",
            "s": "6",
            "ap": "0",
            "d": "1",
            "abilities": "",
            "sourceSelectionIds": [
              "unit-chaos-rhino-selection-armoured-tracks"
            ]
          },
          {
            "id": "unit-chaos-rhino-profile-fccf7bd10d",
            "legacyIds": [
              "unit-chaos-rhino-profile-combi-bolter-ranged-2"
            ],
            "title": "Combi-bolter",
            "mode": "ranged",
            "range": "24\"",
            "a": "2",
            "skill": "3+",
            "s": "4",
            "ap": "0",
            "d": "1",
            "abilities": "Rapid Fire 2",
            "sourceSelectionIds": [
              "unit-chaos-rhino-selection-combi-bolter"
            ]
          },
          {
            "id": "unit-chaos-rhino-profile-42bcc6f259",
            "legacyIds": [
              "unit-chaos-rhino-profile-combi-weapon-ranged-3"
            ],
            "title": "Combi-weapon",
            "mode": "ranged",
            "range": "24\"",
            "a": "1",
            "skill": "4+",
            "s": "4",
            "ap": "0",
            "d": "1",
            "abilities": "Anti-Infantry 4+, Devastating Wounds, Rapid Fire 1",
            "sourceSelectionIds": [
              "unit-chaos-rhino-selection-combi-weapon"
            ]
          },
          {
            "id": "unit-chaos-rhino-profile-b45d52231c",
            "legacyIds": [
              "unit-chaos-rhino-profile-havoc-launcher-ranged-4"
            ],
            "title": "Havoc launcher",
            "mode": "ranged",
            "range": "48\"",
            "a": "D6",
            "skill": "3+",
            "s": "5",
            "ap": "0",
            "d": "1",
            "abilities": "Blast",
            "sourceSelectionIds": [
              "unit-chaos-rhino-selection-havoc-launcher"
            ]
          }
        ],
        "wargearAbilities": [],
        "wargearDefaults": [
          {
            "modelId": "unit-chaos-rhino-model-74ad18f164",
            "selections": [
              {
                "selectionId": "unit-chaos-rhino-selection-combi-bolter",
                "quantity": 1
              },
              {
                "selectionId": "unit-chaos-rhino-selection-armoured-tracks",
                "quantity": 1
              }
            ]
          }
        ],
        "wargearOptionContracts": [
          {
            "sourceId": "datasheet-chaos-rhino:wargear:1",
            "eligibleModelIds": [
              "unit-chaos-rhino-model-74ad18f164"
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
                    "selectionId": "unit-chaos-rhino-selection-combi-bolter",
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
                    "selectionId": "unit-chaos-rhino-selection-combi-weapon",
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
            "sourceId": "datasheet-chaos-rhino:wargear:2",
            "eligibleModelIds": [
              "unit-chaos-rhino-model-74ad18f164"
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
                    "selectionId": "unit-chaos-rhino-selection-havoc-launcher",
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
                    "selectionId": "unit-chaos-rhino-selection-combi-bolter",
                    "quantity": 1
                  }
                ],
                "add": [
                  {
                    "selectionId": "unit-chaos-rhino-selection-havoc-launcher",
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
      "id": "unit-fulgrim",
      "title": "Fulgrim",
      "sourceBookId": "emperors-children",
      "sourceLayer": "codex",
      "intrinsicKeywords": [
        "MONSTER",
        "MOBILE",
        "FLY",
        "CHARACTER",
        "EPIC HERO",
        "DAEMON",
        "CHAOS",
        "SLAANESH",
        "PRIMARCH",
        "FULGRIM",
        "EMPEROR’S CHILDREN"
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
          "M": "16\"",
          "T": "11",
          "Sv": "2+",
          "W": "16",
          "Ld": "5+",
          "OC": "6",
          "Invulnerable": "4+"
        },
        "statProfiles": [],
        "abilities": [
          {
            "id": "emperors-children-ability-daemonic-poisons",
            "sectionId": "emperors-children-ability-daemonic-poisons",
            "title": "Daemonic Poisons",
            "text": "In your Shooting phase and the Fight phase, after this model has finished making its attacks, select one enemy unit hit by one or more of those attacks. Until the end of the battle, that enemy unit is poisoned. At the start of each player’s Command phase, roll one D6 for each poisoned enemy unit on the battlefield: on a 4+,that enemy unit suffers D3 mortal wounds.",
            "sourceUnitId": "unit-fulgrim"
          },
          {
            "id": "emperors-children-ability-daemon-primarch-of-slaanesh",
            "sectionId": "emperors-children-ability-daemon-primarch-of-slaanesh",
            "title": "Daemon Primarch of Slaanesh",
            "text": "At the start of your opponent’s Command phase, select one of the abilities in the Daemon Primarch of Slaanesh section. Until the start of your opponent’s next Command phase, this model has that ability.",
            "sourceUnitId": "unit-fulgrim"
          },
          {
            "id": "emperors-children-ability-beguiling-form",
            "sectionId": "emperors-children-ability-beguiling-form",
            "title": "Beguiling Form",
            "text": "Each time a model makes an attack that targets this model, subtract 1 from the Hit roll.",
            "sourceUnitId": "unit-fulgrim"
          },
          {
            "id": "emperors-children-ability-daemonic-speed",
            "sectionId": "emperors-children-ability-daemonic-speed",
            "title": "Daemonic Speed",
            "text": "This model has the Fights First ability.",
            "sourceUnitId": "unit-fulgrim"
          },
          {
            "id": "emperors-children-ability-enthralling-hypnosis-aura",
            "sectionId": "emperors-children-ability-enthralling-hypnosis-aura",
            "title": "Enthralling Hypnosis (Aura)",
            "text": "While an enemy unit is within 6\" of this model, each time that unit is selected to Fall Back, it must take a Leadership test. If that test is failed, that unit must Remain Stationary this phase instead.",
            "sourceUnitId": "unit-fulgrim"
          },
          {
            "id": "emperors-children-ability-damaged-1-6-wounds-remaining",
            "sectionId": "emperors-children-ability-damaged-1-6-wounds-remaining",
            "title": "Damaged: 1-6 Wounds Remaining",
            "text": "While this model has 1-6 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll.",
            "sourceUnitId": "unit-fulgrim"
          },
          {
            "id": "emperors-children-ability-supreme-commander",
            "sectionId": "emperors-children-ability-supreme-commander",
            "title": "Supreme Commander",
            "text": "If this model is in your army, it must be your WARLORD.",
            "sourceUnitId": "unit-fulgrim"
          },
          {
            "id": "emperors-children-ability-thrill-seekers",
            "sectionId": "emperors-children-ability-thrill-seekers",
            "title": "Thrill Seekers",
            "text": "If your Army Faction is Emperor's Children, this unit is eligible to shoot and declare a charge in a turn in which it Advanced or Fell Back, but when doing so:\n- It cannot target a unit it was within Engagement Range of at the start of the turn\n- It cannot target a unit that was the target of another unit's charge or attack this phase.",
            "sourceUnitId": "unit-fulgrim"
          },
          {
            "id": "core-deep-strike",
            "sectionId": "core-deep-strike",
            "title": "Deep Strike",
            "text": "Each time this unit makes an ingress move (20.04), if every model in this unit has this ability, it can be set up anywhere on the battlefield that is more than 8\" horizontally from all enemy units, even if that is within your opponent’s deployment zone.",
            "sourceUnitId": "unit-fulgrim"
          },
          {
            "id": "core-deadly-demise",
            "sectionId": "core-deadly-demise",
            "title": "Deadly Demise D6",
            "text": "This ability always takes the form Deadly Demise X. Each time a model in this unit is destroyed, after the units embarked within it (if any) have made their emergency disembark moves, roll one D6. On a 6, that model suffers a deadly demise; each unit within 6\" of that model suffers a number of mortal wounds denoted by X (if this is a random number, roll separately for each unit within 6\"). \n *Example: An Impulsor with a unit of Intercessors embarked within it is destroyed by ranged attacks. First, any unresolved attacks made by the attacking unit are resolved. Then the Intercessors make an emergency disembark move. Then the roll is made for the Deadly Demise ability, and on a 6, that ability is resolved. Finally, the Impulsor is removed from the battlefield.*",
            "sourceUnitId": "unit-fulgrim"
          }
        ],
        "models": [
          {
            "id": "unit-fulgrim-model-118a4ba90d",
            "title": "Fulgrim",
            "aliases": [
              "Fulgrim"
            ],
            "min": 1,
            "max": 1,
            "legacyIds": [
              "unit-fulgrim-model-fulgrim"
            ]
          }
        ],
        "compositionRules": [],
        "selections": [
          {
            "id": "unit-fulgrim-selection-malefic-lash",
            "title": "Malefic lash",
            "aliases": [
              "Malefic lash"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-fulgrim-profile-012605781d"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-fulgrim-selection-serpentine-tail",
            "title": "Serpentine tail",
            "aliases": [
              "Serpentine tail"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-fulgrim-profile-2c3eaf558e"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-fulgrim-selection-daemonic-blades-strike",
            "title": "➤ Daemonic blades - strike",
            "aliases": [
              "➤ Daemonic blades - strike"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-fulgrim-profile-8ca768add0"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-fulgrim-selection-daemonic-blades-sweep",
            "title": "➤ Daemonic blades - sweep",
            "aliases": [
              "➤ Daemonic blades - sweep"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-fulgrim-profile-84d9a73686"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-fulgrim-weapon-family-daemonic-blades-selection",
            "title": "➤ Daemonic blades",
            "aliases": [
              "➤ Daemonic blades"
            ],
            "kind": "weapon",
            "familyId": "unit-fulgrim-weapon-family-daemonic-blades",
            "profileIds": [
              "unit-fulgrim-profile-8ca768add0",
              "unit-fulgrim-profile-84d9a73686"
            ],
            "wargearAbilityIds": []
          }
        ],
        "weaponFamilies": [
          {
            "id": "unit-fulgrim-weapon-family-daemonic-blades",
            "title": "➤ Daemonic blades",
            "aliases": [
              "➤ Daemonic blades"
            ],
            "profileIds": [
              "unit-fulgrim-profile-8ca768add0",
              "unit-fulgrim-profile-84d9a73686"
            ],
            "ambiguousAlias": false
          }
        ],
        "weaponProfiles": [
          {
            "id": "unit-fulgrim-profile-012605781d",
            "legacyIds": [
              "unit-fulgrim-profile-malefic-lash-ranged"
            ],
            "title": "Malefic lash",
            "mode": "ranged",
            "range": "12\"",
            "a": "6",
            "skill": "2+",
            "s": "8",
            "ap": "-2",
            "d": "2",
            "abilities": "Sustained Hits 1",
            "sourceSelectionIds": [
              "unit-fulgrim-selection-malefic-lash"
            ]
          },
          {
            "id": "unit-fulgrim-profile-2c3eaf558e",
            "legacyIds": [
              "unit-fulgrim-profile-serpentine-tail-melee-2"
            ],
            "title": "Serpentine tail",
            "mode": "melee",
            "range": "Melee",
            "a": "6",
            "skill": "2+",
            "s": "6",
            "ap": "-1",
            "d": "1",
            "abilities": "Extra Attacks",
            "sourceSelectionIds": [
              "unit-fulgrim-selection-serpentine-tail"
            ]
          },
          {
            "id": "unit-fulgrim-profile-8ca768add0",
            "legacyIds": [
              "unit-fulgrim-profile-daemonic-blades-strike-melee-3"
            ],
            "title": "➤ Daemonic blades - strike",
            "mode": "melee",
            "range": "Melee",
            "a": "6",
            "skill": "2+",
            "s": "14",
            "ap": "-3",
            "d": "D6+1",
            "abilities": "Sustained Hits 1",
            "sourceSelectionIds": [
              "unit-fulgrim-selection-daemonic-blades-strike",
              "unit-fulgrim-weapon-family-daemonic-blades-selection"
            ]
          },
          {
            "id": "unit-fulgrim-profile-84d9a73686",
            "legacyIds": [
              "unit-fulgrim-profile-daemonic-blades-sweep-melee-4"
            ],
            "title": "➤ Daemonic blades - sweep",
            "mode": "melee",
            "range": "Melee",
            "a": "12",
            "skill": "2+",
            "s": "8",
            "ap": "-2",
            "d": "2",
            "abilities": "Sustained Hits 1",
            "sourceSelectionIds": [
              "unit-fulgrim-selection-daemonic-blades-sweep",
              "unit-fulgrim-weapon-family-daemonic-blades-selection"
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
      "id": "unit-lucius-the-eternal",
      "title": "Lucius the Eternal",
      "sourceBookId": "emperors-children",
      "sourceLayer": "codex",
      "intrinsicKeywords": [
        "INFANTRY",
        "CHARACTER",
        "EPIC HERO",
        "CHAOS",
        "SLAANESH",
        "LUCIUS THE ETERNAL",
        "EMPEROR’S CHILDREN"
      ],
      "relations": {
        "canLead": [
          {
            "unitId": "unit-flawless-blades",
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
              "unitId": "unit-flawless-blades",
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
          "Ld": "6+",
          "OC": "1",
          "Invulnerable": "4+"
        },
        "statProfiles": [],
        "abilities": [
          {
            "id": "core-leader",
            "sectionId": "core-leader",
            "title": "Leader",
            "text": "This model can be attached to the following units: FLAWLESS BLADES.",
            "sourceUnitId": "unit-lucius-the-eternal"
          },
          {
            "id": "emperors-children-ability-duellists-hubris",
            "sectionId": "emperors-children-ability-duellists-hubris",
            "title": "Duellist’s Hubris",
            "text": "At the start of the Fight phase; if this model is not leading a unit, until the end of the phase, it has the Fights First ability.",
            "sourceUnitId": "unit-lucius-the-eternal"
          },
          {
            "id": "emperors-children-ability-a-challenge-worthy-of-skill",
            "sectionId": "emperors-children-ability-a-challenge-worthy-of-skill",
            "title": "A Challenge Worthy of Skill",
            "text": "Each time this model makes an attack that targets a CHARACTER, MONSTER or WALKER unit, you can re-roll the Hit roll and you can re-roll the Wound roll.",
            "sourceUnitId": "unit-lucius-the-eternal"
          },
          {
            "id": "emperors-children-ability-thrill-seekers",
            "sectionId": "emperors-children-ability-thrill-seekers",
            "title": "Thrill Seekers",
            "text": "If your Army Faction is Emperor's Children, this unit is eligible to shoot and declare a charge in a turn in which it Advanced or Fell Back, but when doing so:\n- It cannot target a unit it was within Engagement Range of at the start of the turn\n- It cannot target a unit that was the target of another unit's charge or attack this phase.",
            "sourceUnitId": "unit-lucius-the-eternal"
          },
          {
            "id": "core-feel-no-pain",
            "sectionId": "core-feel-no-pain",
            "title": "Feel No Pain 5+",
            "text": "This ability always takes the form Feel No Pain X+. Each time a model with this ability would lose a wound, roll one D6: on an X+, that wound is not lost.",
            "sourceUnitId": "unit-lucius-the-eternal"
          },
          {
            "id": "core-lone-operative",
            "sectionId": "core-lone-operative",
            "title": "Lone Operative",
            "text": "Unless part of an attached unit, this unit is not visible to enemy models unless they are within 12\" of this unit, and it cannot be targeted by [INDIRECT FIRE] weapons unless the attacking model is within 12\" of this unit. \nIf this ability takes the form Lone Operative X\", unless part of an attached unit, this unit is not visible to enemy models unless they are within X\" of this unit, and it cannot be targeted by [INDIRECT FIRE] weapons unless the attacking model is within X\" of this unit.",
            "sourceUnitId": "unit-lucius-the-eternal"
          }
        ],
        "models": [
          {
            "id": "unit-lucius-the-eternal-model-e109e0d103",
            "title": "Lucius the Eternal",
            "aliases": [
              "Lucius the Eternal"
            ],
            "min": 1,
            "max": 1,
            "legacyIds": [
              "unit-lucius-the-eternal-model-lucius-the-eternal"
            ]
          }
        ],
        "compositionRules": [],
        "selections": [
          {
            "id": "unit-lucius-the-eternal-selection-blade-of-the-laer",
            "title": "Blade of the Laer",
            "aliases": [
              "Blade of the Laer"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-lucius-the-eternal-profile-9ddaf6e49f"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-lucius-the-eternal-selection-lash-of-torment",
            "title": "Lash of Torment",
            "aliases": [
              "Lash of Torment"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-lucius-the-eternal-profile-a824baed74"
            ],
            "wargearAbilityIds": []
          }
        ],
        "weaponFamilies": [],
        "weaponProfiles": [
          {
            "id": "unit-lucius-the-eternal-profile-9ddaf6e49f",
            "legacyIds": [
              "unit-lucius-the-eternal-profile-blade-of-the-laer-melee"
            ],
            "title": "Blade of the Laer",
            "mode": "melee",
            "range": "Melee",
            "a": "6",
            "skill": "2+",
            "s": "8",
            "ap": "-3",
            "d": "3",
            "abilities": "Precision",
            "sourceSelectionIds": [
              "unit-lucius-the-eternal-selection-blade-of-the-laer"
            ]
          },
          {
            "id": "unit-lucius-the-eternal-profile-a824baed74",
            "legacyIds": [
              "unit-lucius-the-eternal-profile-lash-of-torment-melee-2"
            ],
            "title": "Lash of Torment",
            "mode": "melee",
            "range": "Melee",
            "a": "10",
            "skill": "2+",
            "s": "4",
            "ap": "-1",
            "d": "1",
            "abilities": "Sustained Hits 1",
            "sourceSelectionIds": [
              "unit-lucius-the-eternal-selection-lash-of-torment"
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
      "id": "unit-shalaxi-helbane",
      "title": "Shalaxi Helbane",
      "sourceBookId": "emperors-children",
      "sourceLayer": "codex",
      "intrinsicKeywords": [
        "MONSTER",
        "CHARACTER",
        "EPIC HERO",
        "PSYKER",
        "CHAOS",
        "DAEMON",
        "SUMMONED",
        "SLAANESH",
        "SHALAXI HELBANE",
        "LEGIONS OF EXCESS"
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
          "T": "10",
          "Sv": "3+",
          "W": "20",
          "Ld": "6+",
          "OC": "5",
          "Invulnerable": "4+"
        },
        "statProfiles": [],
        "abilities": [
          {
            "id": "emperors-children-ability-no-prey-can-evade",
            "sectionId": "emperors-children-ability-no-prey-can-evade",
            "title": "No Prey Can Evade",
            "text": "You can re-roll Advance and Charge rolls made for this model.",
            "sourceUnitId": "unit-shalaxi-helbane"
          },
          {
            "id": "emperors-children-ability-monarch-of-the-hunt",
            "sectionId": "emperors-children-ability-monarch-of-the-hunt",
            "title": "Monarch of the Hunt",
            "text": "At the start of the first battle round, select one enemy unit to be this model’s quarry. Each time this model makes a melee attack that targets its quarry, you can re-roll the Hit roll and you can re-roll the Wound roll. Each time this model’s quarry is destroyed, select one new enemy unit to be this model’s quarry.",
            "sourceUnitId": "unit-shalaxi-helbane"
          },
          {
            "id": "emperors-children-ability-damaged-1-7-wounds-remaining",
            "sectionId": "emperors-children-ability-damaged-1-7-wounds-remaining",
            "title": "Damaged: 1-7 wounds remaining",
            "text": "While this model has 1-7 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll.",
            "sourceUnitId": "unit-shalaxi-helbane"
          },
          {
            "id": "core-deadly-demise",
            "sectionId": "core-deadly-demise",
            "title": "Deadly Demise D6",
            "text": "This ability always takes the form Deadly Demise X. Each time a model in this unit is destroyed, after the units embarked within it (if any) have made their emergency disembark moves, roll one D6. On a 6, that model suffers a deadly demise; each unit within 6\" of that model suffers a number of mortal wounds denoted by X (if this is a random number, roll separately for each unit within 6\"). \n *Example: An Impulsor with a unit of Intercessors embarked within it is destroyed by ranged attacks. First, any unresolved attacks made by the attacking unit are resolved. Then the Intercessors make an emergency disembark move. Then the roll is made for the Deadly Demise ability, and on a 6, that ability is resolved. Finally, the Impulsor is removed from the battlefield.*",
            "sourceUnitId": "unit-shalaxi-helbane"
          },
          {
            "id": "core-deep-strike",
            "sectionId": "core-deep-strike",
            "title": "Deep Strike",
            "text": "Each time this unit makes an ingress move (20.04), if every model in this unit has this ability, it can be set up anywhere on the battlefield that is more than 8\" horizontally from all enemy units, even if that is within your opponent’s deployment zone.",
            "sourceUnitId": "unit-shalaxi-helbane"
          },
          {
            "id": "emperors-children-ability-pact-of-excess",
            "sectionId": "emperors-children-ability-pact-of-excess",
            "title": "Pact of Excess",
            "text": "When mustering your army, unless specifically stated otherwise, you cannot select LEGIONS OF EXCESS as your Army Faction.",
            "sourceUnitId": "unit-shalaxi-helbane"
          }
        ],
        "models": [
          {
            "id": "unit-shalaxi-helbane-model-4cfce2c22f",
            "title": "Shalaxi Helbane",
            "aliases": [
              "Shalaxi Helbane"
            ],
            "min": 1,
            "max": 1,
            "legacyIds": [
              "unit-shalaxi-helbane-model-shalaxi-helbane"
            ]
          }
        ],
        "compositionRules": [],
        "selections": [
          {
            "id": "unit-shalaxi-helbane-selection-lash-of-slaanesh",
            "title": "Lash of Slaanesh",
            "aliases": [
              "Lash of Slaanesh"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-shalaxi-helbane-profile-321867fac2"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-shalaxi-helbane-selection-pavane-of-slaanesh-witchfire",
            "title": "➤ Pavane of Slaanesh - witchfire",
            "aliases": [
              "➤ Pavane of Slaanesh - witchfire"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-shalaxi-helbane-profile-965880ad13"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-shalaxi-helbane-selection-pavane-of-slaanesh-focused-witchfire",
            "title": "➤ Pavane of Slaanesh - focused witchfire",
            "aliases": [
              "➤ Pavane of Slaanesh - focused witchfire"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-shalaxi-helbane-profile-0bb4720afd"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-shalaxi-helbane-selection-snapping-claws",
            "title": "Snapping claws",
            "aliases": [
              "Snapping claws"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-shalaxi-helbane-profile-18e13e0d13"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-shalaxi-helbane-selection-soulpiercer",
            "title": "Soulpiercer",
            "aliases": [
              "Soulpiercer"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-shalaxi-helbane-profile-4bb8fed09c"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-shalaxi-helbane-weapon-family-pavane-of-slaanesh-selection",
            "title": "➤ Pavane of Slaanesh",
            "aliases": [
              "➤ Pavane of Slaanesh"
            ],
            "kind": "weapon",
            "familyId": "unit-shalaxi-helbane-weapon-family-pavane-of-slaanesh",
            "profileIds": [
              "unit-shalaxi-helbane-profile-965880ad13",
              "unit-shalaxi-helbane-profile-0bb4720afd"
            ],
            "wargearAbilityIds": []
          }
        ],
        "weaponFamilies": [
          {
            "id": "unit-shalaxi-helbane-weapon-family-pavane-of-slaanesh",
            "title": "➤ Pavane of Slaanesh",
            "aliases": [
              "➤ Pavane of Slaanesh"
            ],
            "profileIds": [
              "unit-shalaxi-helbane-profile-965880ad13",
              "unit-shalaxi-helbane-profile-0bb4720afd"
            ],
            "ambiguousAlias": false
          }
        ],
        "weaponProfiles": [
          {
            "id": "unit-shalaxi-helbane-profile-321867fac2",
            "legacyIds": [
              "unit-shalaxi-helbane-profile-lash-of-slaanesh-ranged"
            ],
            "title": "Lash of Slaanesh",
            "mode": "ranged",
            "range": "12\"",
            "a": "6",
            "skill": "2+",
            "s": "6",
            "ap": "-1",
            "d": "2",
            "abilities": "Assault",
            "sourceSelectionIds": [
              "unit-shalaxi-helbane-selection-lash-of-slaanesh"
            ]
          },
          {
            "id": "unit-shalaxi-helbane-profile-965880ad13",
            "legacyIds": [
              "unit-shalaxi-helbane-profile-pavane-of-slaanesh-witchfire-ranged-2"
            ],
            "title": "➤ Pavane of Slaanesh - witchfire",
            "mode": "ranged",
            "range": "18\"",
            "a": "D6",
            "skill": "2+",
            "s": "9",
            "ap": "-1",
            "d": "D3",
            "abilities": "Devastating Wounds, Psychic",
            "sourceSelectionIds": [
              "unit-shalaxi-helbane-selection-pavane-of-slaanesh-witchfire",
              "unit-shalaxi-helbane-weapon-family-pavane-of-slaanesh-selection"
            ]
          },
          {
            "id": "unit-shalaxi-helbane-profile-0bb4720afd",
            "legacyIds": [
              "unit-shalaxi-helbane-profile-pavane-of-slaanesh-focused-witchfire-ranged-3"
            ],
            "title": "➤ Pavane of Slaanesh - focused witchfire",
            "mode": "ranged",
            "range": "18\"",
            "a": "D6",
            "skill": "2+",
            "s": "9",
            "ap": "-2",
            "d": "D3",
            "abilities": "Hazardous, Devastating Wounds, Psychic, Sustained Hits 3",
            "sourceSelectionIds": [
              "unit-shalaxi-helbane-selection-pavane-of-slaanesh-focused-witchfire",
              "unit-shalaxi-helbane-weapon-family-pavane-of-slaanesh-selection"
            ]
          },
          {
            "id": "unit-shalaxi-helbane-profile-18e13e0d13",
            "legacyIds": [
              "unit-shalaxi-helbane-profile-snapping-claws-melee-4"
            ],
            "title": "Snapping claws",
            "mode": "melee",
            "range": "Melee",
            "a": "4",
            "skill": "2+",
            "s": "6",
            "ap": "-2",
            "d": "3",
            "abilities": "Devastating Wounds, Extra Attacks",
            "sourceSelectionIds": [
              "unit-shalaxi-helbane-selection-snapping-claws"
            ]
          },
          {
            "id": "unit-shalaxi-helbane-profile-4bb8fed09c",
            "legacyIds": [
              "unit-shalaxi-helbane-profile-soulpiercer-melee-5"
            ],
            "title": "Soulpiercer",
            "mode": "melee",
            "range": "Melee",
            "a": "6",
            "skill": "2+",
            "s": "12",
            "ap": "-3",
            "d": "D6+2",
            "abilities": "Precision",
            "sourceSelectionIds": [
              "unit-shalaxi-helbane-selection-soulpiercer"
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
      "id": "unit-chaos-terminators",
      "title": "Chaos Terminators",
      "sourceBookId": "emperors-children",
      "sourceLayer": "codex",
      "intrinsicKeywords": [
        "INFANTRY",
        "CHAOS",
        "SLAANESH",
        "TERMINATOR",
        "TERMINATOR SQUAD",
        "EMPEROR’S CHILDREN"
      ],
      "relations": {
        "canLead": [],
        "canSupport": [],
        "canBeLedBy": [
          {
            "unitId": "unit-lord-kakophonist",
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
              "unitId": "unit-lord-kakophonist",
              "maxCharacters": 1
            }
          ],
          "canBeSupportedBy": []
        }
      },
      "gameSelections": {
        "stats": {
          "M": "6\"",
          "T": "5",
          "Sv": "2+",
          "W": "3",
          "Ld": "6+",
          "OC": "1",
          "Invulnerable": "4+"
        },
        "statProfiles": [
          {
            "id": "unit-chaos-terminators-stat-profile-ab6a34f2e4",
            "title": "Chaos Terminators",
            "stats": {
              "M": "6\"",
              "T": "5",
              "Sv": "2+",
              "W": "3",
              "Ld": "6+",
              "OC": "1",
              "Invulnerable": "4+"
            },
            "legacyIds": [
              "unit-chaos-terminators-stat-profile-chaos-terminators"
            ]
          }
        ],
        "abilities": [
          {
            "id": "emperors-children-ability-lethal-obsession",
            "sectionId": "emperors-children-ability-lethal-obsession",
            "title": "Lethal Obsession",
            "text": "In your Shooting phase, after this unit has shot, you can use this ability. If you do, select one enemy unit hit by those ranged attacks. Until the end of the turn, when this unit declares a charge:\n- This unit can re-roll that charge roll.\n- This unit must end that charge move engaged with that enemy unit.",
            "sourceUnitId": "unit-chaos-terminators"
          },
          {
            "id": "core-deep-strike",
            "sectionId": "core-deep-strike",
            "title": "Deep Strike",
            "text": "Each time this unit makes an ingress move (20.04), if every model in this unit has this ability, it can be set up anywhere on the battlefield that is more than 8\" horizontally from all enemy units, even if that is within your opponent’s deployment zone.",
            "sourceUnitId": "unit-chaos-terminators"
          },
          {
            "id": "emperors-children-ability-thrill-seekers",
            "sectionId": "emperors-children-ability-thrill-seekers",
            "title": "Thrill Seekers",
            "text": "If your Army Faction is Emperor's Children, this unit is eligible to shoot and declare a charge in a turn in which it Advanced or Fell Back, but when doing so:\n- It cannot target a unit it was within Engagement Range of at the start of the turn\n- It cannot target a unit that was the target of another unit's charge or attack this phase.",
            "sourceUnitId": "unit-chaos-terminators"
          }
        ],
        "models": [
          {
            "id": "unit-chaos-terminators-model-094033026c",
            "title": "Terminator Champion",
            "aliases": [
              "Terminator Champion"
            ],
            "min": 1,
            "max": 1,
            "legacyIds": [
              "unit-chaos-terminators-model-terminator-champion"
            ]
          },
          {
            "id": "unit-chaos-terminators-model-1538ad2e04",
            "title": "Terminators",
            "aliases": [
              "Terminators",
              "Accursed weapon and combi-bolter",
              "Accursed weapon and combi-weapon",
              "Power fist and combi-weapon",
              "Chainfist and combi-bolter",
              "Heavy weapon",
              "Power fist and combi-bolter",
              "Chainfist and combi-weapon",
              "Paired accursed weapons"
            ],
            "min": 4,
            "max": 4,
            "legacyIds": [
              "unit-chaos-terminators-model-terminators-2"
            ]
          }
        ],
        "compositionRules": [],
        "selections": [
          {
            "id": "unit-chaos-terminators-selection-combi-bolter",
            "title": "Combi-bolter",
            "aliases": [
              "Combi-bolter"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-chaos-terminators-profile-fccf7bd10d"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-chaos-terminators-selection-accursed-weapon",
            "title": "Accursed weapon",
            "aliases": [
              "Accursed weapon"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-chaos-terminators-profile-40815771a3"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-chaos-terminators-selection-combi-weapon",
            "title": "Combi-weapon",
            "aliases": [
              "Combi-weapon"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-chaos-terminators-profile-42bcc6f259"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-chaos-terminators-selection-chainfist",
            "title": "Chainfist",
            "aliases": [
              "Chainfist"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-chaos-terminators-profile-2f36a3a7ab"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-chaos-terminators-selection-power-fist",
            "title": "Power fist",
            "aliases": [
              "Power fist"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-chaos-terminators-profile-524161d40c"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-chaos-terminators-selection-paired-accursed-weapons",
            "title": "Paired accursed weapons",
            "aliases": [
              "Paired accursed weapons"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-chaos-terminators-profile-3fc4e1417d"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-chaos-terminators-selection-heavy-flamer",
            "title": "Heavy flamer",
            "aliases": [
              "Heavy flamer"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-chaos-terminators-profile-c3d47deaa1"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-chaos-terminators-selection-reaper-autocannon",
            "title": "Reaper autocannon",
            "aliases": [
              "Reaper autocannon"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-chaos-terminators-profile-a191168b7a"
            ],
            "wargearAbilityIds": []
          }
        ],
        "weaponFamilies": [],
        "weaponProfiles": [
          {
            "id": "unit-chaos-terminators-profile-fccf7bd10d",
            "legacyIds": [
              "unit-chaos-terminators-profile-combi-bolter-ranged"
            ],
            "title": "Combi-bolter",
            "mode": "ranged",
            "range": "24\"",
            "a": "2",
            "skill": "3+",
            "s": "4",
            "ap": "0",
            "d": "1",
            "abilities": "Rapid Fire 2",
            "sourceSelectionIds": [
              "unit-chaos-terminators-selection-combi-bolter"
            ]
          },
          {
            "id": "unit-chaos-terminators-profile-40815771a3",
            "legacyIds": [
              "unit-chaos-terminators-profile-accursed-weapon-melee-2"
            ],
            "title": "Accursed weapon",
            "mode": "melee",
            "range": "Melee",
            "a": "4",
            "skill": "3+",
            "s": "5",
            "ap": "-2",
            "d": "1",
            "abilities": "",
            "sourceSelectionIds": [
              "unit-chaos-terminators-selection-accursed-weapon"
            ]
          },
          {
            "id": "unit-chaos-terminators-profile-42bcc6f259",
            "legacyIds": [
              "unit-chaos-terminators-profile-combi-weapon-ranged-3"
            ],
            "title": "Combi-weapon",
            "mode": "ranged",
            "range": "24\"",
            "a": "1",
            "skill": "4+",
            "s": "4",
            "ap": "0",
            "d": "1",
            "abilities": "Anti-Infantry 4+, Devastating Wounds, Rapid Fire 1",
            "sourceSelectionIds": [
              "unit-chaos-terminators-selection-combi-weapon"
            ]
          },
          {
            "id": "unit-chaos-terminators-profile-2f36a3a7ab",
            "legacyIds": [
              "unit-chaos-terminators-profile-chainfist-melee-4"
            ],
            "title": "Chainfist",
            "mode": "melee",
            "range": "Melee",
            "a": "3",
            "skill": "4+",
            "s": "8",
            "ap": "-2",
            "d": "2",
            "abilities": "Anti-Vehicle 3+",
            "sourceSelectionIds": [
              "unit-chaos-terminators-selection-chainfist"
            ]
          },
          {
            "id": "unit-chaos-terminators-profile-524161d40c",
            "legacyIds": [
              "unit-chaos-terminators-profile-power-fist-melee-5"
            ],
            "title": "Power fist",
            "mode": "melee",
            "range": "Melee",
            "a": "3",
            "skill": "3+",
            "s": "8",
            "ap": "-2",
            "d": "2",
            "abilities": "",
            "sourceSelectionIds": [
              "unit-chaos-terminators-selection-power-fist"
            ]
          },
          {
            "id": "unit-chaos-terminators-profile-3fc4e1417d",
            "legacyIds": [
              "unit-chaos-terminators-profile-paired-accursed-weapons-melee-6"
            ],
            "title": "Paired accursed weapons",
            "mode": "melee",
            "range": "Melee",
            "a": "5",
            "skill": "3+",
            "s": "5",
            "ap": "-2",
            "d": "1",
            "abilities": "Twin-Linked",
            "sourceSelectionIds": [
              "unit-chaos-terminators-selection-paired-accursed-weapons"
            ]
          },
          {
            "id": "unit-chaos-terminators-profile-c3d47deaa1",
            "legacyIds": [
              "unit-chaos-terminators-profile-heavy-flamer-ranged-7"
            ],
            "title": "Heavy flamer",
            "mode": "ranged",
            "range": "12\"",
            "a": "D6",
            "skill": "N/A",
            "s": "5",
            "ap": "-1",
            "d": "1",
            "abilities": "Ignores Cover, Torrent",
            "sourceSelectionIds": [
              "unit-chaos-terminators-selection-heavy-flamer"
            ]
          },
          {
            "id": "unit-chaos-terminators-profile-a191168b7a",
            "legacyIds": [
              "unit-chaos-terminators-profile-reaper-autocannon-ranged-8"
            ],
            "title": "Reaper autocannon",
            "mode": "ranged",
            "range": "36\"",
            "a": "4",
            "skill": "3+",
            "s": "7",
            "ap": "-1",
            "d": "1",
            "abilities": "Devastating Wounds, Sustained Hits 1",
            "sourceSelectionIds": [
              "unit-chaos-terminators-selection-reaper-autocannon"
            ]
          }
        ],
        "wargearAbilities": [],
        "wargearDefaults": [
          {
            "modelId": "unit-chaos-terminators-model-094033026c",
            "selections": [
              {
                "selectionId": "unit-chaos-terminators-selection-combi-bolter",
                "quantity": 1
              },
              {
                "selectionId": "unit-chaos-terminators-selection-accursed-weapon",
                "quantity": 1
              }
            ]
          },
          {
            "modelId": "unit-chaos-terminators-model-1538ad2e04",
            "selections": [
              {
                "selectionId": "unit-chaos-terminators-selection-combi-bolter",
                "quantity": 1
              },
              {
                "selectionId": "unit-chaos-terminators-selection-accursed-weapon",
                "quantity": 1
              }
            ]
          }
        ],
        "wargearOptionContracts": [
          {
            "sourceId": "datasheet-chaos-terminators:wargear:1",
            "eligibleModelIds": [
              "unit-chaos-terminators-model-1538ad2e04"
            ],
            "limit": {
              "perModel": 1,
              "perUnit": 1
            },
            "choices": [
              {
                "remove": [
                  {
                    "selectionId": "unit-chaos-terminators-selection-combi-bolter",
                    "quantity": 1
                  }
                ],
                "add": [
                  {
                    "selectionId": "unit-chaos-terminators-selection-heavy-flamer",
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
                    "selectionId": "unit-chaos-terminators-selection-combi-bolter",
                    "quantity": 1
                  }
                ],
                "add": [
                  {
                    "selectionId": "unit-chaos-terminators-selection-reaper-autocannon",
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
            "sourceId": "datasheet-chaos-terminators:wargear:2",
            "eligibleModelIds": [
              "unit-chaos-terminators-model-094033026c",
              "unit-chaos-terminators-model-1538ad2e04"
            ],
            "limit": {
              "perModel": 1
            },
            "choices": [
              {
                "remove": [
                  {
                    "selectionId": "unit-chaos-terminators-selection-combi-bolter",
                    "quantity": 1
                  }
                ],
                "add": [
                  {
                    "selectionId": "unit-chaos-terminators-selection-combi-weapon",
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
            "sourceId": "datasheet-chaos-terminators:wargear:3",
            "eligibleModelIds": [
              "unit-chaos-terminators-model-094033026c",
              "unit-chaos-terminators-model-1538ad2e04"
            ],
            "limit": {
              "perModel": 1,
              "perUnit": 1
            },
            "choices": [
              {
                "remove": [
                  {
                    "selectionId": "unit-chaos-terminators-selection-combi-bolter",
                    "quantity": 1
                  },
                  {
                    "selectionId": "unit-chaos-terminators-selection-accursed-weapon",
                    "quantity": 1
                  }
                ],
                "add": [
                  {
                    "selectionId": "unit-chaos-terminators-selection-paired-accursed-weapons",
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
            "sourceId": "datasheet-chaos-terminators:wargear:4",
            "eligibleModelIds": [
              "unit-chaos-terminators-model-094033026c",
              "unit-chaos-terminators-model-1538ad2e04"
            ],
            "limit": {
              "perModel": 1,
              "perUnit": 3
            },
            "choices": [
              {
                "remove": [
                  {
                    "selectionId": "unit-chaos-terminators-selection-accursed-weapon",
                    "quantity": 1
                  }
                ],
                "add": [
                  {
                    "selectionId": "unit-chaos-terminators-selection-power-fist",
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
            "sourceId": "datasheet-chaos-terminators:wargear:5",
            "eligibleModelIds": [
              "unit-chaos-terminators-model-094033026c",
              "unit-chaos-terminators-model-1538ad2e04"
            ],
            "limit": {
              "perModel": 1,
              "perUnit": 1
            },
            "choices": [
              {
                "remove": [
                  {
                    "selectionId": "unit-chaos-terminators-selection-accursed-weapon",
                    "quantity": 1
                  }
                ],
                "add": [
                  {
                    "selectionId": "unit-chaos-terminators-selection-chainfist",
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
      "id": "unit-flawless-blades",
      "title": "Flawless Blades",
      "sourceBookId": "emperors-children",
      "sourceLayer": "codex",
      "intrinsicKeywords": [
        "INFANTRY",
        "GRENADES",
        "CHAOS",
        "SLAANESH",
        "FLAWLESS BLADES",
        "EMPEROR’S CHILDREN"
      ],
      "relations": {
        "canLead": [],
        "canSupport": [],
        "canBeLedBy": [
          {
            "unitId": "unit-lucius-the-eternal",
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
              "unitId": "unit-lucius-the-eternal",
              "maxCharacters": 1
            }
          ],
          "canBeSupportedBy": []
        }
      },
      "gameSelections": {
        "stats": {
          "M": "8\"",
          "T": "5",
          "Sv": "3+",
          "W": "3",
          "Ld": "6+",
          "OC": "1",
          "Invulnerable": "5+"
        },
        "statProfiles": [],
        "abilities": [
          {
            "id": "emperors-children-ability-daemonic-patrons",
            "sectionId": "emperors-children-ability-daemonic-patrons",
            "title": "Daemonic Patrons",
            "text": "Each time this unit is selected to fight, it can call upon daemonic patrons. If it does, until the end of the phase, each time a model in this unit makes an attack, an unmodified Wound roll of 3+ scores a Critical Wound. At the end of the Fight phase, if this unit called upon daemonic patrons this phase and no enemy models were destroyed by attacks made by models in this unit this phase, one model in this unit is destroyed.",
            "sourceUnitId": "unit-flawless-blades"
          },
          {
            "id": "emperors-children-ability-thrill-seekers",
            "sectionId": "emperors-children-ability-thrill-seekers",
            "title": "Thrill Seekers",
            "text": "If your Army Faction is Emperor's Children, this unit is eligible to shoot and declare a charge in a turn in which it Advanced or Fell Back, but when doing so:\n- It cannot target a unit it was within Engagement Range of at the start of the turn\n- It cannot target a unit that was the target of another unit's charge or attack this phase.",
            "sourceUnitId": "unit-flawless-blades"
          }
        ],
        "models": [
          {
            "id": "unit-flawless-blades-model-f0959f7865",
            "title": "Flawless Blade",
            "aliases": [
              "Flawless Blade"
            ],
            "min": 3,
            "max": 6,
            "legacyIds": [
              "unit-flawless-blades-model-flawless-blade"
            ]
          }
        ],
        "compositionRules": [],
        "selections": [
          {
            "id": "unit-flawless-blades-selection-blissblade",
            "title": "Blissblade",
            "aliases": [
              "Blissblade"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-flawless-blades-profile-38b210a32f"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-flawless-blades-selection-bolt-pistol",
            "title": "Bolt pistol",
            "aliases": [
              "Bolt pistol"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-flawless-blades-profile-a16d0444b0"
            ],
            "wargearAbilityIds": []
          }
        ],
        "weaponFamilies": [],
        "weaponProfiles": [
          {
            "id": "unit-flawless-blades-profile-38b210a32f",
            "legacyIds": [
              "unit-flawless-blades-profile-blissblade-melee"
            ],
            "title": "Blissblade",
            "mode": "melee",
            "range": "Melee",
            "a": "4",
            "skill": "2+",
            "s": "6",
            "ap": "-3",
            "d": "2",
            "abilities": "",
            "sourceSelectionIds": [
              "unit-flawless-blades-selection-blissblade"
            ]
          },
          {
            "id": "unit-flawless-blades-profile-a16d0444b0",
            "legacyIds": [
              "unit-flawless-blades-profile-bolt-pistol-ranged-2"
            ],
            "title": "Bolt pistol",
            "mode": "ranged",
            "range": "12\"",
            "a": "1",
            "skill": "3+",
            "s": "4",
            "ap": "0",
            "d": "1",
            "abilities": "Pistol",
            "sourceSelectionIds": [
              "unit-flawless-blades-selection-bolt-pistol"
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
      "id": "unit-noise-marines",
      "title": "Noise Marines",
      "sourceBookId": "emperors-children",
      "sourceLayer": "codex",
      "intrinsicKeywords": [
        "INFANTRY",
        "CHAOS",
        "SLAANESH",
        "NOISE MARINES",
        "EMPEROR’S CHILDREN"
      ],
      "relations": {
        "canLead": [],
        "canSupport": [],
        "canBeLedBy": [
          {
            "unitId": "unit-lord-kakophonist",
            "maxCharacters": 1
          },
          {
            "unitId": "unit-sorcerer",
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
              "unitId": "unit-lord-kakophonist",
              "maxCharacters": 1
            },
            {
              "unitId": "unit-sorcerer",
              "maxCharacters": 1
            }
          ],
          "canBeSupportedBy": []
        }
      },
      "gameSelections": {
        "stats": {
          "M": "6\"",
          "T": "5",
          "Sv": "3+",
          "W": "2",
          "Ld": "6+",
          "OC": "1",
          "Invulnerable": ""
        },
        "statProfiles": [
          {
            "id": "unit-noise-marines-stat-profile-7e1cad94ec",
            "title": "Disharmonist",
            "stats": {
              "M": "6\"",
              "T": "5",
              "Sv": "3+",
              "W": "2",
              "Ld": "6+",
              "OC": "1",
              "Invulnerable": ""
            },
            "legacyIds": [
              "unit-noise-marines-stat-profile-disharmonist"
            ]
          },
          {
            "id": "unit-noise-marines-stat-profile-7e4458bb20",
            "title": "Noise Marines",
            "stats": {
              "M": "6\"",
              "T": "5",
              "Sv": "3+",
              "W": "2",
              "Ld": "6+",
              "OC": "1",
              "Invulnerable": ""
            },
            "legacyIds": [
              "unit-noise-marines-stat-profile-noise-marines"
            ]
          }
        ],
        "abilities": [
          {
            "id": "emperors-children-ability-terrifying-crescendo",
            "sectionId": "emperors-children-ability-terrifying-crescendo",
            "title": "Terrifying Crescendo",
            "text": "In your Shooting phase, after this unit has shot, select one enemy unit hit by one or more of those attacks. Until the start of your next Shooting phase, each time a Battle-shock or Leadership test is taken for that enemy unit, subtract 1 from that test.",
            "sourceUnitId": "unit-noise-marines"
          },
          {
            "id": "emperors-children-ability-thrill-seekers",
            "sectionId": "emperors-children-ability-thrill-seekers",
            "title": "Thrill Seekers",
            "text": "If your Army Faction is Emperor's Children, this unit is eligible to shoot and declare a charge in a turn in which it Advanced or Fell Back, but when doing so:\n- It cannot target a unit it was within Engagement Range of at the start of the turn\n- It cannot target a unit that was the target of another unit's charge or attack this phase.",
            "sourceUnitId": "unit-noise-marines"
          }
        ],
        "models": [
          {
            "id": "unit-noise-marines-model-053c3f7ac2",
            "title": "Disharmonist",
            "aliases": [
              "Disharmonist"
            ],
            "min": 1,
            "max": 1,
            "legacyIds": [
              "unit-noise-marines-model-disharmonist"
            ]
          },
          {
            "id": "unit-noise-marines-model-6a223b9b75",
            "title": "Noise Marines",
            "aliases": [
              "Noise Marines",
              "Noise Marine w/ sonic blaster",
              "Noise Marine w/ blastmaster"
            ],
            "min": 5,
            "max": 5,
            "legacyIds": [
              "unit-noise-marines-model-noise-marines-2"
            ]
          }
        ],
        "compositionRules": [],
        "selections": [
          {
            "id": "unit-noise-marines-selection-power-sword",
            "title": "Power sword",
            "aliases": [
              "Power sword"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-noise-marines-profile-9f1035c6f5"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-noise-marines-selection-screamer-pistol",
            "title": "Screamer pistol",
            "aliases": [
              "Screamer pistol"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-noise-marines-profile-705f300dbd"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-noise-marines-selection-sonic-blaster",
            "title": "Sonic blaster",
            "aliases": [
              "Sonic blaster"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-noise-marines-profile-09bc5ae2b7"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-noise-marines-selection-close-combat-weapon",
            "title": "Close combat weapon",
            "aliases": [
              "Close combat weapon"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-noise-marines-profile-38edd622b4"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-noise-marines-selection-blastmaster-varied-frequency",
            "title": "➤ Blastmaster - varied frequency",
            "aliases": [
              "➤ Blastmaster - varied frequency"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-noise-marines-profile-3ca062064f"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-noise-marines-selection-blastmaster-single-frequency",
            "title": "➤ Blastmaster - single frequency",
            "aliases": [
              "➤ Blastmaster - single frequency"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-noise-marines-profile-77f330bf8f"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-noise-marines-weapon-family-blastmaster-selection",
            "title": "➤ Blastmaster",
            "aliases": [
              "➤ Blastmaster"
            ],
            "kind": "weapon",
            "familyId": "unit-noise-marines-weapon-family-blastmaster",
            "profileIds": [
              "unit-noise-marines-profile-3ca062064f",
              "unit-noise-marines-profile-77f330bf8f"
            ],
            "wargearAbilityIds": []
          }
        ],
        "weaponFamilies": [
          {
            "id": "unit-noise-marines-weapon-family-blastmaster",
            "title": "➤ Blastmaster",
            "aliases": [
              "➤ Blastmaster"
            ],
            "profileIds": [
              "unit-noise-marines-profile-3ca062064f",
              "unit-noise-marines-profile-77f330bf8f"
            ],
            "ambiguousAlias": false
          }
        ],
        "weaponProfiles": [
          {
            "id": "unit-noise-marines-profile-9f1035c6f5",
            "legacyIds": [
              "unit-noise-marines-profile-power-sword-melee"
            ],
            "title": "Power sword",
            "mode": "melee",
            "range": "Melee",
            "a": "4",
            "skill": "3+",
            "s": "5",
            "ap": "-2",
            "d": "1",
            "abilities": "",
            "sourceSelectionIds": [
              "unit-noise-marines-selection-power-sword"
            ]
          },
          {
            "id": "unit-noise-marines-profile-705f300dbd",
            "legacyIds": [
              "unit-noise-marines-profile-screamer-pistol-ranged-2"
            ],
            "title": "Screamer pistol",
            "mode": "ranged",
            "range": "12\"",
            "a": "3",
            "skill": "3+",
            "s": "5",
            "ap": "-1",
            "d": "2",
            "abilities": "Ignores Cover, Pistol",
            "sourceSelectionIds": [
              "unit-noise-marines-selection-screamer-pistol"
            ]
          },
          {
            "id": "unit-noise-marines-profile-09bc5ae2b7",
            "legacyIds": [
              "unit-noise-marines-profile-sonic-blaster-ranged-3"
            ],
            "title": "Sonic blaster",
            "mode": "ranged",
            "range": "18\"",
            "a": "3",
            "skill": "3+",
            "s": "5",
            "ap": "-1",
            "d": "2",
            "abilities": "Ignores Cover",
            "sourceSelectionIds": [
              "unit-noise-marines-selection-sonic-blaster"
            ]
          },
          {
            "id": "unit-noise-marines-profile-38edd622b4",
            "legacyIds": [
              "unit-noise-marines-profile-close-combat-weapon-melee-4"
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
              "unit-noise-marines-selection-close-combat-weapon"
            ]
          },
          {
            "id": "unit-noise-marines-profile-3ca062064f",
            "legacyIds": [
              "unit-noise-marines-profile-blastmaster-varied-frequency-ranged-5"
            ],
            "title": "➤ Blastmaster - varied frequency",
            "mode": "ranged",
            "range": "18\"",
            "a": "6",
            "skill": "3+",
            "s": "6",
            "ap": "-2",
            "d": "1",
            "abilities": "Ignores Cover",
            "sourceSelectionIds": [
              "unit-noise-marines-selection-blastmaster-varied-frequency",
              "unit-noise-marines-weapon-family-blastmaster-selection"
            ]
          },
          {
            "id": "unit-noise-marines-profile-77f330bf8f",
            "legacyIds": [
              "unit-noise-marines-profile-blastmaster-single-frequency-ranged-6"
            ],
            "title": "➤ Blastmaster - single frequency",
            "mode": "ranged",
            "range": "18\"",
            "a": "3",
            "skill": "3+",
            "s": "10",
            "ap": "-2",
            "d": "3",
            "abilities": "Ignores Cover",
            "sourceSelectionIds": [
              "unit-noise-marines-selection-blastmaster-single-frequency",
              "unit-noise-marines-weapon-family-blastmaster-selection"
            ]
          }
        ],
        "wargearAbilities": [],
        "wargearDefaults": [
          {
            "modelId": "unit-noise-marines-model-053c3f7ac2",
            "selections": [
              {
                "selectionId": "unit-noise-marines-selection-sonic-blaster",
                "quantity": 1
              },
              {
                "selectionId": "unit-noise-marines-selection-close-combat-weapon",
                "quantity": 1
              }
            ]
          },
          {
            "modelId": "unit-noise-marines-model-6a223b9b75",
            "selections": [
              {
                "selectionId": "unit-noise-marines-selection-sonic-blaster",
                "quantity": 1
              },
              {
                "selectionId": "unit-noise-marines-selection-close-combat-weapon",
                "quantity": 1
              }
            ]
          }
        ],
        "wargearOptionContracts": [
          {
            "sourceId": "datasheet-noise-marines:wargear:1",
            "eligibleModelIds": [
              "unit-noise-marines-model-053c3f7ac2"
            ],
            "limit": {
              "perModel": 1,
              "perUnit": 1
            },
            "choices": [
              {
                "remove": [
                  {
                    "selectionId": "unit-noise-marines-selection-sonic-blaster",
                    "quantity": 1
                  }
                ],
                "add": [
                  {
                    "selectionId": "unit-noise-marines-selection-screamer-pistol",
                    "quantity": 1
                  },
                  {
                    "selectionId": "unit-noise-marines-selection-power-sword",
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
            "sourceId": "datasheet-noise-marines:wargear:2",
            "eligibleModelIds": [
              "unit-noise-marines-model-6a223b9b75"
            ],
            "limit": {
              "perModel": 1,
              "perUnit": 2
            },
            "choices": [
              {
                "remove": [
                  {
                    "selectionId": "unit-noise-marines-selection-sonic-blaster",
                    "quantity": 1
                  }
                ],
                "add": [
                  {
                    "selectionId": "unit-noise-marines-weapon-family-blastmaster-selection",
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
      "id": "unit-chaos-land-raider",
      "title": "Chaos Land Raider",
      "sourceBookId": "emperors-children",
      "sourceLayer": "codex",
      "intrinsicKeywords": [
        "VEHICLE",
        "TRANSPORT",
        "FRAME",
        "SMOKE",
        "CHAOS",
        "SLAANESH",
        "LAND RAIDER",
        "EMPEROR’S CHILDREN"
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
          "T": "12",
          "Sv": "2+",
          "W": "16",
          "Ld": "6+",
          "OC": "5",
          "Invulnerable": ""
        },
        "statProfiles": [],
        "abilities": [
          {
            "id": "emperors-children-ability-assault-ramp",
            "sectionId": "emperors-children-ability-assault-ramp",
            "title": "Assault Ramp",
            "text": "Each time a unit disembarks from this model after it has made a Normal move, that unit makes an assault disembark move (Core Rules, 18.06) for that disembarkation.",
            "sourceUnitId": "unit-chaos-land-raider"
          },
          {
            "id": "emperors-children-ability-damaged-1-5-wounds-remaining",
            "sectionId": "emperors-children-ability-damaged-1-5-wounds-remaining",
            "title": "Damaged: 1-5 wounds remaining",
            "text": "While this model has 1-5 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll.",
            "sourceUnitId": "unit-chaos-land-raider"
          },
          {
            "id": "core-deadly-demise",
            "sectionId": "core-deadly-demise",
            "title": "Deadly Demise D6",
            "text": "This ability always takes the form Deadly Demise X. Each time a model in this unit is destroyed, after the units embarked within it (if any) have made their emergency disembark moves, roll one D6. On a 6, that model suffers a deadly demise; each unit within 6\" of that model suffers a number of mortal wounds denoted by X (if this is a random number, roll separately for each unit within 6\"). \n *Example: An Impulsor with a unit of Intercessors embarked within it is destroyed by ranged attacks. First, any unresolved attacks made by the attacking unit are resolved. Then the Intercessors make an emergency disembark move. Then the roll is made for the Deadly Demise ability, and on a 6, that ability is resolved. Finally, the Impulsor is removed from the battlefield.*",
            "sourceUnitId": "unit-chaos-land-raider"
          },
          {
            "id": "emperors-children-ability-thrill-seekers",
            "sectionId": "emperors-children-ability-thrill-seekers",
            "title": "Thrill Seekers",
            "text": "If your Army Faction is Emperor's Children, this unit is eligible to shoot and declare a charge in a turn in which it Advanced or Fell Back, but when doing so:\n- It cannot target a unit it was within Engagement Range of at the start of the turn\n- It cannot target a unit that was the target of another unit's charge or attack this phase.",
            "sourceUnitId": "unit-chaos-land-raider"
          }
        ],
        "models": [
          {
            "id": "unit-chaos-land-raider-model-8a15b8b0db",
            "title": "Chaos Land Raider",
            "aliases": [
              "Chaos Land Raider"
            ],
            "min": 1,
            "max": 1,
            "legacyIds": [
              "unit-chaos-land-raider-model-chaos-land-raider"
            ]
          }
        ],
        "compositionRules": [],
        "selections": [
          {
            "id": "unit-chaos-land-raider-selection-armoured-tracks",
            "title": "Armoured tracks",
            "aliases": [
              "Armoured tracks"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-chaos-land-raider-profile-778f1a9f48"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-chaos-land-raider-selection-soulshatter-lascannon",
            "title": "Soulshatter lascannon",
            "aliases": [
              "Soulshatter lascannon"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-chaos-land-raider-profile-34cb44dd98"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-chaos-land-raider-selection-combi-bolter",
            "title": "Combi-bolter",
            "aliases": [
              "Combi-bolter"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-chaos-land-raider-profile-fccf7bd10d"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-chaos-land-raider-selection-combi-weapon",
            "title": "Combi-weapon",
            "aliases": [
              "Combi-weapon"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-chaos-land-raider-profile-42bcc6f259"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-chaos-land-raider-selection-havoc-launcher",
            "title": "Havoc launcher",
            "aliases": [
              "Havoc launcher"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-chaos-land-raider-profile-b45d52231c"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-chaos-land-raider-selection-twin-heavy-bolter",
            "title": "Twin heavy bolter",
            "aliases": [
              "Twin heavy bolter"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-chaos-land-raider-profile-3dd886aad0"
            ],
            "wargearAbilityIds": []
          }
        ],
        "weaponFamilies": [],
        "weaponProfiles": [
          {
            "id": "unit-chaos-land-raider-profile-778f1a9f48",
            "legacyIds": [
              "unit-chaos-land-raider-profile-armoured-tracks-melee"
            ],
            "title": "Armoured tracks",
            "mode": "melee",
            "range": "Melee",
            "a": "6",
            "skill": "4+",
            "s": "8",
            "ap": "0",
            "d": "1",
            "abilities": "",
            "sourceSelectionIds": [
              "unit-chaos-land-raider-selection-armoured-tracks"
            ]
          },
          {
            "id": "unit-chaos-land-raider-profile-34cb44dd98",
            "legacyIds": [
              "unit-chaos-land-raider-profile-soulshatter-lascannon-ranged-2"
            ],
            "title": "Soulshatter lascannon",
            "mode": "ranged",
            "range": "48\"",
            "a": "2",
            "skill": "3+",
            "s": "12",
            "ap": "-3",
            "d": "D6+1",
            "abilities": "",
            "sourceSelectionIds": [
              "unit-chaos-land-raider-selection-soulshatter-lascannon"
            ]
          },
          {
            "id": "unit-chaos-land-raider-profile-fccf7bd10d",
            "legacyIds": [
              "unit-chaos-land-raider-profile-combi-bolter-ranged-3"
            ],
            "title": "Combi-bolter",
            "mode": "ranged",
            "range": "24\"",
            "a": "2",
            "skill": "3+",
            "s": "4",
            "ap": "0",
            "d": "1",
            "abilities": "Rapid Fire 2",
            "sourceSelectionIds": [
              "unit-chaos-land-raider-selection-combi-bolter"
            ]
          },
          {
            "id": "unit-chaos-land-raider-profile-42bcc6f259",
            "legacyIds": [
              "unit-chaos-land-raider-profile-combi-weapon-ranged-4"
            ],
            "title": "Combi-weapon",
            "mode": "ranged",
            "range": "24\"",
            "a": "1",
            "skill": "4+",
            "s": "4",
            "ap": "0",
            "d": "1",
            "abilities": "Anti-Infantry 4+, Devastating Wounds, Rapid Fire 1",
            "sourceSelectionIds": [
              "unit-chaos-land-raider-selection-combi-weapon"
            ]
          },
          {
            "id": "unit-chaos-land-raider-profile-b45d52231c",
            "legacyIds": [
              "unit-chaos-land-raider-profile-havoc-launcher-ranged-5"
            ],
            "title": "Havoc launcher",
            "mode": "ranged",
            "range": "48\"",
            "a": "D6",
            "skill": "3+",
            "s": "5",
            "ap": "0",
            "d": "1",
            "abilities": "Blast",
            "sourceSelectionIds": [
              "unit-chaos-land-raider-selection-havoc-launcher"
            ]
          },
          {
            "id": "unit-chaos-land-raider-profile-3dd886aad0",
            "legacyIds": [
              "unit-chaos-land-raider-profile-twin-heavy-bolter-ranged-6"
            ],
            "title": "Twin heavy bolter",
            "mode": "ranged",
            "range": "36\"",
            "a": "3",
            "skill": "3+",
            "s": "5",
            "ap": "-1",
            "d": "2",
            "abilities": "Sustained Hits 1, Twin-Linked",
            "sourceSelectionIds": [
              "unit-chaos-land-raider-selection-twin-heavy-bolter"
            ]
          }
        ],
        "wargearAbilities": [],
        "wargearDefaults": [
          {
            "modelId": "unit-chaos-land-raider-model-8a15b8b0db",
            "selections": [
              {
                "selectionId": "unit-chaos-land-raider-selection-soulshatter-lascannon",
                "quantity": 2
              },
              {
                "selectionId": "unit-chaos-land-raider-selection-twin-heavy-bolter",
                "quantity": 1
              },
              {
                "selectionId": "unit-chaos-land-raider-selection-armoured-tracks",
                "quantity": 1
              }
            ]
          }
        ],
        "wargearOptionContracts": [
          {
            "sourceId": "datasheet-chaos-land-raider:wargear:1",
            "eligibleModelIds": [
              "unit-chaos-land-raider-model-8a15b8b0db"
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
                    "selectionId": "unit-chaos-land-raider-selection-combi-bolter",
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
                    "selectionId": "unit-chaos-land-raider-selection-combi-weapon",
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
            "sourceId": "datasheet-chaos-land-raider:wargear:2",
            "eligibleModelIds": [
              "unit-chaos-land-raider-model-8a15b8b0db"
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
                    "selectionId": "unit-chaos-land-raider-selection-havoc-launcher",
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
      "id": "unit-chaos-spawn",
      "title": "Chaos Spawn",
      "sourceBookId": "emperors-children",
      "sourceLayer": "codex",
      "intrinsicKeywords": [
        "BEAST",
        "CHAOS",
        "SLAANESH",
        "CHAOS SPAWN",
        "EMPEROR’S CHILDREN"
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
          "T": "5",
          "Sv": "4+",
          "W": "4",
          "Ld": "7+",
          "OC": "1",
          "Invulnerable": ""
        },
        "statProfiles": [],
        "abilities": [
          {
            "id": "emperors-children-ability-scuttling-horrors",
            "sectionId": "emperors-children-ability-scuttling-horrors",
            "title": "Scuttling Horrors",
            "text": "In your opponent's Movement phase, if an enemy unit ends a move within 8\" of this unit, if this unit is not within Engagement Range of one or more enemy units, this unit can make a Normal move of up to 6\".",
            "sourceUnitId": "unit-chaos-spawn"
          },
          {
            "id": "core-feel-no-pain",
            "sectionId": "core-feel-no-pain",
            "title": "Feel No Pain 5+",
            "text": "This ability always takes the form Feel No Pain X+. Each time a model with this ability would lose a wound, roll one D6: on an X+, that wound is not lost.",
            "sourceUnitId": "unit-chaos-spawn"
          },
          {
            "id": "emperors-children-ability-thrill-seekers",
            "sectionId": "emperors-children-ability-thrill-seekers",
            "title": "Thrill Seekers",
            "text": "If your Army Faction is Emperor's Children, this unit is eligible to shoot and declare a charge in a turn in which it Advanced or Fell Back, but when doing so:\n- It cannot target a unit it was within Engagement Range of at the start of the turn\n- It cannot target a unit that was the target of another unit's charge or attack this phase.",
            "sourceUnitId": "unit-chaos-spawn"
          }
        ],
        "models": [
          {
            "id": "unit-chaos-spawn-model-be65517d2e",
            "title": "Chaos Spawn",
            "aliases": [
              "Chaos Spawn"
            ],
            "min": 2,
            "max": 2,
            "legacyIds": [
              "unit-chaos-spawn-model-chaos-spawn"
            ]
          }
        ],
        "compositionRules": [],
        "selections": [
          {
            "id": "unit-chaos-spawn-selection-hideous-mutations",
            "title": "Hideous Mutations",
            "aliases": [
              "Hideous Mutations"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-chaos-spawn-profile-7c026ed22f"
            ],
            "wargearAbilityIds": []
          }
        ],
        "weaponFamilies": [],
        "weaponProfiles": [
          {
            "id": "unit-chaos-spawn-profile-7c026ed22f",
            "legacyIds": [
              "unit-chaos-spawn-profile-hideous-mutations-melee"
            ],
            "title": "Hideous Mutations",
            "mode": "melee",
            "range": "Melee",
            "a": "D6+2",
            "skill": "4+",
            "s": "5",
            "ap": "-1",
            "d": "2",
            "abilities": "",
            "sourceSelectionIds": [
              "unit-chaos-spawn-selection-hideous-mutations"
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
      "id": "unit-defiler",
      "title": "Defiler",
      "sourceBookId": "emperors-children",
      "sourceLayer": "faction-pack",
      "intrinsicKeywords": [
        "VEHICLE",
        "WALKER",
        "CHAOS",
        "SLAANESH",
        "DAEMON",
        "DEFILER",
        "EMPEROR’S CHILDREN"
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
          "T": "11",
          "Sv": "3+",
          "W": "18",
          "Ld": "6+",
          "OC": "5",
          "Invulnerable": "5+"
        },
        "statProfiles": [],
        "abilities": [
          {
            "id": "emperors-children-ability-scuttling-walker",
            "sectionId": "emperors-children-ability-scuttling-walker",
            "title": "Scuttling Walker",
            "text": "Each time this unit makes a Normal, Advance or Fall Back move, it can move through models (excluding TITANIC models) and terrain features. When doing so, it can move within Engagement Range of enemy models, but cannot end that move within Engagement Range of them, and any Desperate Escape test is automatically passed.",
            "sourceUnitId": "unit-defiler"
          },
          {
            "id": "emperors-children-ability-revel-in-desecration",
            "sectionId": "emperors-children-ability-revel-in-desecration",
            "title": "Revel in Desecration",
            "text": "Each time this model makes an attack that targets an enemy unit that is not below Half-strength, add 1 to the Hit roll.",
            "sourceUnitId": "unit-defiler"
          },
          {
            "id": "core-deadly-demise",
            "sectionId": "core-deadly-demise",
            "title": "Deadly Demise D6",
            "text": "This ability always takes the form Deadly Demise X. Each time a model in this unit is destroyed, after the units embarked within it (if any) have made their emergency disembark moves, roll one D6. On a 6, that model suffers a deadly demise; each unit within 6\" of that model suffers a number of mortal wounds denoted by X (if this is a random number, roll separately for each unit within 6\"). \n *Example: An Impulsor with a unit of Intercessors embarked within it is destroyed by ranged attacks. First, any unresolved attacks made by the attacking unit are resolved. Then the Intercessors make an emergency disembark move. Then the roll is made for the Deadly Demise ability, and on a 6, that ability is resolved. Finally, the Impulsor is removed from the battlefield.*",
            "sourceUnitId": "unit-defiler"
          },
          {
            "id": "emperors-children-ability-thrill-seekers",
            "sectionId": "emperors-children-ability-thrill-seekers",
            "title": "Thrill Seekers",
            "text": "If your Army Faction is Emperor's Children, this unit is eligible to shoot and declare a charge in a turn in which it Advanced or Fell Back, but when doing so:\n- It cannot target a unit it was within Engagement Range of at the start of the turn\n- It cannot target a unit that was the target of another unit's charge or attack this phase.",
            "sourceUnitId": "unit-defiler"
          },
          {
            "id": "emperors-children-ability-damaged-1-6-wounds-remaining",
            "sectionId": "emperors-children-ability-damaged-1-6-wounds-remaining",
            "title": "Damaged: 1-6 Wounds Remaining",
            "text": "While this model has 1-6 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll.",
            "sourceUnitId": "unit-defiler"
          }
        ],
        "models": [
          {
            "id": "unit-defiler-model-5f9d1a0197",
            "title": "Defiler",
            "aliases": [
              "Defiler"
            ],
            "min": 1,
            "max": 1,
            "legacyIds": [
              "unit-defiler-model-defiler"
            ]
          }
        ],
        "compositionRules": [],
        "selections": [
          {
            "id": "unit-defiler-selection-shearing-claws-strike",
            "title": "Shearing claws - strike",
            "aliases": [
              "Shearing claws - strike"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-defiler-profile-c7b0f52a9b"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-defiler-selection-shearing-claws-sweep",
            "title": "Shearing claws - sweep",
            "aliases": [
              "Shearing claws - sweep"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-defiler-profile-53464fa0b6"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-defiler-selection-heavy-missile-launcher-frag",
            "title": "➤ Heavy missile launcher - frag",
            "aliases": [
              "➤ Heavy missile launcher - frag"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-defiler-profile-f6b8def2c9"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-defiler-selection-heavy-missile-launcher-krak",
            "title": "➤ Heavy missile launcher - krak",
            "aliases": [
              "➤ Heavy missile launcher - krak"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-defiler-profile-c15a9e7fe9"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-defiler-selection-electroscourge",
            "title": "Electroscourge",
            "aliases": [
              "Electroscourge"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-defiler-profile-3ab686d883"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-defiler-selection-hades-lascannon",
            "title": "Hades lascannon",
            "aliases": [
              "Hades lascannon"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-defiler-profile-af071f9f24"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-defiler-selection-heavy-reaper-autocannon",
            "title": "Heavy reaper autocannon",
            "aliases": [
              "Heavy reaper autocannon"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-defiler-profile-011a333a82"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-defiler-selection-hades-battle-cannon",
            "title": "Hades battle cannon",
            "aliases": [
              "Hades battle cannon"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-defiler-profile-0929e60bc3"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-defiler-selection-ectoplasma-destructor",
            "title": "Ectoplasma destructor",
            "aliases": [
              "Ectoplasma destructor"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-defiler-profile-3039b5edd8"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-defiler-selection-heavy-baleflamer",
            "title": "Heavy baleflamer",
            "aliases": [
              "Heavy baleflamer"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-defiler-profile-cffb437a63"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-defiler-selection-excruciator-cannon",
            "title": "Excruciator cannon",
            "aliases": [
              "Excruciator cannon"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-defiler-profile-f28bc6ebad"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-defiler-selection-magma-cutters",
            "title": "Magma cutters",
            "aliases": [
              "Magma cutters"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-defiler-profile-81793266f1"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-defiler-weapon-family-shearing-claws-selection",
            "title": "Shearing claws",
            "aliases": [
              "Shearing claws"
            ],
            "kind": "weapon",
            "familyId": "unit-defiler-weapon-family-shearing-claws",
            "profileIds": [
              "unit-defiler-profile-c7b0f52a9b",
              "unit-defiler-profile-53464fa0b6"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-defiler-weapon-family-heavy-missile-launcher-selection",
            "title": "➤ Heavy missile launcher",
            "aliases": [
              "➤ Heavy missile launcher"
            ],
            "kind": "weapon",
            "familyId": "unit-defiler-weapon-family-heavy-missile-launcher",
            "profileIds": [
              "unit-defiler-profile-f6b8def2c9",
              "unit-defiler-profile-c15a9e7fe9"
            ],
            "wargearAbilityIds": []
          }
        ],
        "weaponFamilies": [
          {
            "id": "unit-defiler-weapon-family-shearing-claws",
            "title": "Shearing claws",
            "aliases": [
              "Shearing claws"
            ],
            "profileIds": [
              "unit-defiler-profile-c7b0f52a9b",
              "unit-defiler-profile-53464fa0b6"
            ],
            "ambiguousAlias": false
          },
          {
            "id": "unit-defiler-weapon-family-heavy-missile-launcher",
            "title": "➤ Heavy missile launcher",
            "aliases": [
              "➤ Heavy missile launcher"
            ],
            "profileIds": [
              "unit-defiler-profile-f6b8def2c9",
              "unit-defiler-profile-c15a9e7fe9"
            ],
            "ambiguousAlias": false
          }
        ],
        "weaponProfiles": [
          {
            "id": "unit-defiler-profile-c7b0f52a9b",
            "legacyIds": [
              "unit-defiler-profile-shearing-claws-strike-melee"
            ],
            "title": "Shearing claws - strike",
            "mode": "melee",
            "range": "Melee",
            "a": "5",
            "skill": "3+",
            "s": "16",
            "ap": "-3",
            "d": "D6+1",
            "abilities": "Precision",
            "sourceSelectionIds": [
              "unit-defiler-selection-shearing-claws-strike",
              "unit-defiler-weapon-family-shearing-claws-selection"
            ]
          },
          {
            "id": "unit-defiler-profile-53464fa0b6",
            "legacyIds": [
              "unit-defiler-profile-shearing-claws-sweep-melee-2"
            ],
            "title": "Shearing claws - sweep",
            "mode": "melee",
            "range": "Melee",
            "a": "10",
            "skill": "3+",
            "s": "6",
            "ap": "-2",
            "d": "1",
            "abilities": "",
            "sourceSelectionIds": [
              "unit-defiler-selection-shearing-claws-sweep",
              "unit-defiler-weapon-family-shearing-claws-selection"
            ]
          },
          {
            "id": "unit-defiler-profile-f6b8def2c9",
            "legacyIds": [
              "unit-defiler-profile-heavy-missile-launcher-frag-ranged-3"
            ],
            "title": "➤ Heavy missile launcher - frag",
            "mode": "ranged",
            "range": "48\"",
            "a": "2D6",
            "skill": "3+",
            "s": "5",
            "ap": "-1",
            "d": "1",
            "abilities": "Blast",
            "sourceSelectionIds": [
              "unit-defiler-selection-heavy-missile-launcher-frag",
              "unit-defiler-weapon-family-heavy-missile-launcher-selection"
            ]
          },
          {
            "id": "unit-defiler-profile-c15a9e7fe9",
            "legacyIds": [
              "unit-defiler-profile-heavy-missile-launcher-krak-ranged-4"
            ],
            "title": "➤ Heavy missile launcher - krak",
            "mode": "ranged",
            "range": "48\"",
            "a": "2",
            "skill": "3+",
            "s": "10",
            "ap": "-2",
            "d": "D6+1",
            "abilities": "",
            "sourceSelectionIds": [
              "unit-defiler-selection-heavy-missile-launcher-krak",
              "unit-defiler-weapon-family-heavy-missile-launcher-selection"
            ]
          },
          {
            "id": "unit-defiler-profile-3ab686d883",
            "legacyIds": [
              "unit-defiler-profile-electroscourge-melee-5"
            ],
            "title": "Electroscourge",
            "mode": "melee",
            "range": "Melee",
            "a": "5",
            "skill": "3+",
            "s": "12",
            "ap": "-2",
            "d": "2",
            "abilities": "Extra Attacks, Sustained Hits 2",
            "sourceSelectionIds": [
              "unit-defiler-selection-electroscourge"
            ]
          },
          {
            "id": "unit-defiler-profile-af071f9f24",
            "legacyIds": [
              "unit-defiler-profile-hades-lascannon-ranged-6"
            ],
            "title": "Hades lascannon",
            "mode": "ranged",
            "range": "48\"",
            "a": "2",
            "skill": "3+",
            "s": "12",
            "ap": "-3",
            "d": "D6+1",
            "abilities": "",
            "sourceSelectionIds": [
              "unit-defiler-selection-hades-lascannon"
            ]
          },
          {
            "id": "unit-defiler-profile-011a333a82",
            "legacyIds": [
              "unit-defiler-profile-heavy-reaper-autocannon-ranged-7"
            ],
            "title": "Heavy reaper autocannon",
            "mode": "ranged",
            "range": "48\"",
            "a": "4",
            "skill": "3+",
            "s": "9",
            "ap": "-1",
            "d": "3",
            "abilities": "Devastating Wounds, Sustained Hits 1",
            "sourceSelectionIds": [
              "unit-defiler-selection-heavy-reaper-autocannon"
            ]
          },
          {
            "id": "unit-defiler-profile-0929e60bc3",
            "legacyIds": [
              "unit-defiler-profile-hades-battle-cannon-ranged-8"
            ],
            "title": "Hades battle cannon",
            "mode": "ranged",
            "range": "48\"",
            "a": "D6+3",
            "skill": "3+",
            "s": "10",
            "ap": "-1",
            "d": "3",
            "abilities": "Blast",
            "sourceSelectionIds": [
              "unit-defiler-selection-hades-battle-cannon"
            ]
          },
          {
            "id": "unit-defiler-profile-3039b5edd8",
            "legacyIds": [
              "unit-defiler-profile-ectoplasma-destructor-ranged-9"
            ],
            "title": "Ectoplasma destructor",
            "mode": "ranged",
            "range": "36\"",
            "a": "D6",
            "skill": "3+",
            "s": "12",
            "ap": "-3",
            "d": "3",
            "abilities": "Blast",
            "sourceSelectionIds": [
              "unit-defiler-selection-ectoplasma-destructor"
            ]
          },
          {
            "id": "unit-defiler-profile-cffb437a63",
            "legacyIds": [
              "unit-defiler-profile-heavy-baleflamer-ranged-10"
            ],
            "title": "Heavy baleflamer",
            "mode": "ranged",
            "range": "12\"",
            "a": "D6+3",
            "skill": "N/A",
            "s": "7",
            "ap": "-2",
            "d": "2",
            "abilities": "Ignores Cover, Torrent",
            "sourceSelectionIds": [
              "unit-defiler-selection-heavy-baleflamer"
            ]
          },
          {
            "id": "unit-defiler-profile-f28bc6ebad",
            "legacyIds": [
              "unit-defiler-profile-excruciator-cannon-ranged-11"
            ],
            "title": "Excruciator cannon",
            "mode": "ranged",
            "range": "36\"",
            "a": "6",
            "skill": "3+",
            "s": "6",
            "ap": "-1",
            "d": "2",
            "abilities": "",
            "sourceSelectionIds": [
              "unit-defiler-selection-excruciator-cannon"
            ]
          },
          {
            "id": "unit-defiler-profile-81793266f1",
            "legacyIds": [
              "unit-defiler-profile-magma-cutters-ranged-12"
            ],
            "title": "Magma cutters",
            "mode": "ranged",
            "range": "12\"",
            "a": "2",
            "skill": "3+",
            "s": "9",
            "ap": "-4",
            "d": "D6",
            "abilities": "Melta 2",
            "sourceSelectionIds": [
              "unit-defiler-selection-magma-cutters"
            ]
          }
        ],
        "wargearAbilities": [],
        "wargearDefaults": [
          {
            "modelId": "unit-defiler-model-5f9d1a0197",
            "selections": [
              {
                "selectionId": "unit-defiler-selection-hades-battle-cannon",
                "quantity": 1
              },
              {
                "selectionId": "unit-defiler-selection-excruciator-cannon",
                "quantity": 2
              },
              {
                "selectionId": "unit-defiler-weapon-family-heavy-missile-launcher-selection",
                "quantity": 1
              },
              {
                "selectionId": "unit-defiler-selection-heavy-baleflamer",
                "quantity": 1
              },
              {
                "selectionId": "unit-defiler-weapon-family-shearing-claws-selection",
                "quantity": 1
              }
            ]
          }
        ],
        "wargearOptionContracts": [
          {
            "sourceId": "datasheet-defiler:wargear:1",
            "eligibleModelIds": [
              "unit-defiler-model-5f9d1a0197"
            ],
            "limit": {
              "perModel": 1,
              "perUnit": 1
            },
            "choices": [
              {
                "remove": [
                  {
                    "selectionId": "unit-defiler-selection-hades-battle-cannon",
                    "quantity": 1
                  }
                ],
                "add": [
                  {
                    "selectionId": "unit-defiler-selection-ectoplasma-destructor",
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
            "sourceId": "datasheet-defiler:wargear:2",
            "eligibleModelIds": [
              "unit-defiler-model-5f9d1a0197"
            ],
            "limit": {
              "perModel": 1,
              "perUnit": 1
            },
            "choices": [
              {
                "remove": [
                  {
                    "selectionId": "unit-defiler-selection-excruciator-cannon",
                    "quantity": 2
                  }
                ],
                "add": [
                  {
                    "selectionId": "unit-defiler-selection-magma-cutters",
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
            "sourceId": "datasheet-defiler:wargear:3",
            "eligibleModelIds": [
              "unit-defiler-model-5f9d1a0197"
            ],
            "limit": {
              "perModel": 1,
              "perUnit": 1
            },
            "choices": [
              {
                "remove": [
                  {
                    "selectionId": "unit-defiler-selection-heavy-baleflamer",
                    "quantity": 1
                  }
                ],
                "add": [
                  {
                    "selectionId": "unit-defiler-selection-hades-lascannon",
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
                    "selectionId": "unit-defiler-selection-heavy-baleflamer",
                    "quantity": 1
                  }
                ],
                "add": [
                  {
                    "selectionId": "unit-defiler-selection-heavy-reaper-autocannon",
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
                    "selectionId": "unit-defiler-selection-heavy-baleflamer",
                    "quantity": 1
                  }
                ],
                "add": [
                  {
                    "selectionId": "unit-defiler-selection-electroscourge",
                    "quantity": 1
                  }
                ],
                "requiresFinal": [],
                "forbidsFinal": [],
                "sharedUses": [
                  "datasheet-defiler:wargear:electroscourge-cap"
                ]
              }
            ]
          },
          {
            "sourceId": "datasheet-defiler:wargear:4",
            "eligibleModelIds": [
              "unit-defiler-model-5f9d1a0197"
            ],
            "limit": {
              "perModel": 1,
              "perUnit": 1
            },
            "choices": [
              {
                "remove": [
                  {
                    "selectionId": "unit-defiler-weapon-family-heavy-missile-launcher-selection",
                    "quantity": 1
                  }
                ],
                "add": [
                  {
                    "selectionId": "unit-defiler-selection-hades-lascannon",
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
                    "selectionId": "unit-defiler-weapon-family-heavy-missile-launcher-selection",
                    "quantity": 1
                  }
                ],
                "add": [
                  {
                    "selectionId": "unit-defiler-selection-heavy-reaper-autocannon",
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
                    "selectionId": "unit-defiler-weapon-family-heavy-missile-launcher-selection",
                    "quantity": 1
                  }
                ],
                "add": [
                  {
                    "selectionId": "unit-defiler-selection-electroscourge",
                    "quantity": 1
                  }
                ],
                "requiresFinal": [],
                "forbidsFinal": [],
                "sharedUses": [
                  "datasheet-defiler:wargear:electroscourge-cap"
                ]
              }
            ]
          }
        ],
        "wargearSharedCaps": [
          {
            "id": "datasheet-defiler:wargear:electroscourge-cap",
            "max": 1,
            "scope": "model",
            "sourceIds": [
              "datasheet-defiler:wargear:3",
              "datasheet-defiler:wargear:4"
            ]
          }
        ]
      }
    },
    {
      "id": "unit-fiends",
      "title": "Fiends",
      "sourceBookId": "emperors-children",
      "sourceLayer": "codex",
      "intrinsicKeywords": [
        "BEAST",
        "CHAOS",
        "DAEMON",
        "SUMMONED",
        "SLAANESH",
        "FIENDS",
        "LEGIONS OF EXCESS"
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
          "Sv": "7+",
          "W": "4",
          "Ld": "7+",
          "OC": "2",
          "Invulnerable": "5+"
        },
        "statProfiles": [
          {
            "id": "unit-fiends-stat-profile-ca0b7a8ab7",
            "title": "Fiends",
            "stats": {
              "M": "12\"",
              "T": "5",
              "Sv": "7+",
              "W": "4",
              "Ld": "7+",
              "OC": "2",
              "Invulnerable": "5+"
            },
            "legacyIds": [
              "unit-fiends-stat-profile-fiends"
            ]
          }
        ],
        "abilities": [
          {
            "id": "emperors-children-ability-soporific-musk",
            "sectionId": "emperors-children-ability-soporific-musk",
            "title": "Soporific Musk",
            "text": "Each time an enemy unit (excluding MONSTERS and VEHICLES) within Engagement Range of one or more units from your army with this ability Falls Back, models in that enemy unit must take Desperate Escape tests. When doing so, if that enemy unit is also Battle-shocked, subtract 1 from each of those Desperate Escape tests.",
            "sourceUnitId": "unit-fiends"
          },
          {
            "id": "core-deep-strike",
            "sectionId": "core-deep-strike",
            "title": "Deep Strike",
            "text": "Each time this unit makes an ingress move (20.04), if every model in this unit has this ability, it can be set up anywhere on the battlefield that is more than 8\" horizontally from all enemy units, even if that is within your opponent’s deployment zone.",
            "sourceUnitId": "unit-fiends"
          },
          {
            "id": "emperors-children-ability-pact-of-excess",
            "sectionId": "emperors-children-ability-pact-of-excess",
            "title": "Pact of Excess",
            "text": "When mustering your army, unless specifically stated otherwise, you cannot select LEGIONS OF EXCESS as your Army Faction.",
            "sourceUnitId": "unit-fiends"
          }
        ],
        "models": [
          {
            "id": "unit-fiends-model-26b605f1bb",
            "title": "Fiends",
            "aliases": [
              "Fiends"
            ],
            "min": 2,
            "max": 5,
            "legacyIds": [
              "unit-fiends-model-fiends"
            ]
          },
          {
            "id": "unit-fiends-model-4c8405de97",
            "title": "Blissbringer",
            "aliases": [
              "Blissbringer"
            ],
            "min": 1,
            "max": 1,
            "legacyIds": [
              "unit-fiends-model-blissbringer-2"
            ]
          }
        ],
        "compositionRules": [],
        "selections": [
          {
            "id": "unit-fiends-selection-barbed-tail-and-dissecting-claws",
            "title": "Barbed tail and dissecting claws",
            "aliases": [
              "Barbed tail and dissecting claws"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-fiends-profile-3f82357b96"
            ],
            "wargearAbilityIds": []
          }
        ],
        "weaponFamilies": [],
        "weaponProfiles": [
          {
            "id": "unit-fiends-profile-3f82357b96",
            "legacyIds": [
              "unit-fiends-profile-barbed-tail-and-dissecting-claws-melee"
            ],
            "title": "Barbed tail and dissecting claws",
            "mode": "melee",
            "range": "Melee",
            "a": "5",
            "skill": "3+",
            "s": "5",
            "ap": "-2",
            "d": "2",
            "abilities": "Devastating Wounds",
            "sourceSelectionIds": [
              "unit-fiends-selection-barbed-tail-and-dissecting-claws"
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
      "id": "unit-heldrake",
      "title": "Heldrake",
      "sourceBookId": "emperors-children",
      "sourceLayer": "codex",
      "intrinsicKeywords": [
        "VEHICLE",
        "FLY",
        "CHAOS",
        "DAEMON",
        "SLAANESH",
        "HELDRAKE",
        "EMPEROR’S CHILDREN"
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
          "T": "10",
          "Sv": "3+",
          "W": "14",
          "Ld": "7+",
          "OC": "0",
          "Invulnerable": "5+"
        },
        "statProfiles": [],
        "abilities": [
          {
            "id": "emperors-children-ability-airborne-predator",
            "sectionId": "emperors-children-ability-airborne-predator",
            "title": "Airborne Predator",
            "text": "Each time this model ends a Normal move, you can select one enemy unit that it moved over during that move and roll two D6, adding 1 to each result if that enemy unit can FLY: for each 4+, that enemy unit suffers D3 mortal wounds.",
            "sourceUnitId": "unit-heldrake"
          },
          {
            "id": "core-deadly-demise",
            "sectionId": "core-deadly-demise",
            "title": "Deadly Demise D3",
            "text": "This ability always takes the form Deadly Demise X. Each time a model in this unit is destroyed, after the units embarked within it (if any) have made their emergency disembark moves, roll one D6. On a 6, that model suffers a deadly demise; each unit within 6\" of that model suffers a number of mortal wounds denoted by X (if this is a random number, roll separately for each unit within 6\"). \n *Example: An Impulsor with a unit of Intercessors embarked within it is destroyed by ranged attacks. First, any unresolved attacks made by the attacking unit are resolved. Then the Intercessors make an emergency disembark move. Then the roll is made for the Deadly Demise ability, and on a 6, that ability is resolved. Finally, the Impulsor is removed from the battlefield.*",
            "sourceUnitId": "unit-heldrake"
          },
          {
            "id": "core-hover",
            "sectionId": "core-hover",
            "title": "Hover",
            "text": "Each time this unit takes to the skies (21.03), do not subtract 2\" from the maximum distance.",
            "sourceUnitId": "unit-heldrake"
          },
          {
            "id": "emperors-children-ability-thrill-seekers",
            "sectionId": "emperors-children-ability-thrill-seekers",
            "title": "Thrill Seekers",
            "text": "If your Army Faction is Emperor's Children, this unit is eligible to shoot and declare a charge in a turn in which it Advanced or Fell Back, but when doing so:\n- It cannot target a unit it was within Engagement Range of at the start of the turn\n- It cannot target a unit that was the target of another unit's charge or attack this phase.",
            "sourceUnitId": "unit-heldrake"
          },
          {
            "id": "emperors-children-ability-damaged-1-4-wounds-remaining",
            "sectionId": "emperors-children-ability-damaged-1-4-wounds-remaining",
            "title": "Damaged: 1-4 Wounds Remaining",
            "text": "While this model has 1-4 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll.",
            "sourceUnitId": "unit-heldrake"
          }
        ],
        "models": [
          {
            "id": "unit-heldrake-model-56f5db078f",
            "title": "Heldrake",
            "aliases": [
              "Heldrake"
            ],
            "min": 1,
            "max": 1,
            "legacyIds": [
              "unit-heldrake-model-heldrake"
            ]
          }
        ],
        "compositionRules": [],
        "selections": [
          {
            "id": "unit-heldrake-selection-heldrake-claws",
            "title": "Heldrake claws",
            "aliases": [
              "Heldrake claws"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-heldrake-profile-cabe001943"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-heldrake-selection-baleflamer",
            "title": "Baleflamer",
            "aliases": [
              "Baleflamer"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-heldrake-profile-170a5aedf7"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-heldrake-selection-hades-autocannon",
            "title": "Hades autocannon",
            "aliases": [
              "Hades autocannon"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-heldrake-profile-96e029084d"
            ],
            "wargearAbilityIds": []
          }
        ],
        "weaponFamilies": [],
        "weaponProfiles": [
          {
            "id": "unit-heldrake-profile-cabe001943",
            "legacyIds": [
              "unit-heldrake-profile-heldrake-claws-melee"
            ],
            "title": "Heldrake claws",
            "mode": "melee",
            "range": "Melee",
            "a": "5",
            "skill": "3+",
            "s": "7",
            "ap": "-1",
            "d": "2",
            "abilities": "Anti-Fly 2+, Devastating Wounds",
            "sourceSelectionIds": [
              "unit-heldrake-selection-heldrake-claws"
            ]
          },
          {
            "id": "unit-heldrake-profile-170a5aedf7",
            "legacyIds": [
              "unit-heldrake-profile-baleflamer-ranged-2"
            ],
            "title": "Baleflamer",
            "mode": "ranged",
            "range": "12\"",
            "a": "D6+3",
            "skill": "N/A",
            "s": "6",
            "ap": "-1",
            "d": "2",
            "abilities": "Ignores Cover, Torrent",
            "sourceSelectionIds": [
              "unit-heldrake-selection-baleflamer"
            ]
          },
          {
            "id": "unit-heldrake-profile-96e029084d",
            "legacyIds": [
              "unit-heldrake-profile-hades-autocannon-ranged-3"
            ],
            "title": "Hades autocannon",
            "mode": "ranged",
            "range": "36\"",
            "a": "6",
            "skill": "3+",
            "s": "8",
            "ap": "-1",
            "d": "2",
            "abilities": "",
            "sourceSelectionIds": [
              "unit-heldrake-selection-hades-autocannon"
            ]
          }
        ],
        "wargearAbilities": [],
        "wargearDefaults": [
          {
            "modelId": "unit-heldrake-model-56f5db078f",
            "selections": [
              {
                "selectionId": "unit-heldrake-selection-hades-autocannon",
                "quantity": 1
              },
              {
                "selectionId": "unit-heldrake-selection-heldrake-claws",
                "quantity": 1
              }
            ]
          }
        ],
        "wargearOptionContracts": [
          {
            "sourceId": "datasheet-heldrake:wargear:1",
            "eligibleModelIds": [
              "unit-heldrake-model-56f5db078f"
            ],
            "limit": {
              "perModel": 1,
              "perUnit": 1
            },
            "choices": [
              {
                "remove": [
                  {
                    "selectionId": "unit-heldrake-selection-hades-autocannon",
                    "quantity": 1
                  }
                ],
                "add": [
                  {
                    "selectionId": "unit-heldrake-selection-baleflamer",
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
      "id": "unit-maulerfiend",
      "title": "Maulerfiend",
      "sourceBookId": "emperors-children",
      "sourceLayer": "codex",
      "intrinsicKeywords": [
        "VEHICLE",
        "WALKER",
        "CHAOS",
        "DAEMON",
        "SLAANESH",
        "MAULERFIEND",
        "EMPEROR’S CHILDREN"
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
          "W": "12",
          "Ld": "6+",
          "OC": "3",
          "Invulnerable": "5+"
        },
        "statProfiles": [],
        "abilities": [
          {
            "id": "emperors-children-ability-glutton-for-punishment",
            "sectionId": "emperors-children-ability-glutton-for-punishment",
            "title": "Glutton for Punishment",
            "text": "Each time this model makes an attack, if it is below its Starting Strength, add 1 to the Hit roll. If this model is also Below Half-strength, add 1 to the Wound roll as well.",
            "sourceUnitId": "unit-maulerfiend"
          },
          {
            "id": "core-deadly-demise",
            "sectionId": "core-deadly-demise",
            "title": "Deadly Demise D3",
            "text": "This ability always takes the form Deadly Demise X. Each time a model in this unit is destroyed, after the units embarked within it (if any) have made their emergency disembark moves, roll one D6. On a 6, that model suffers a deadly demise; each unit within 6\" of that model suffers a number of mortal wounds denoted by X (if this is a random number, roll separately for each unit within 6\"). \n *Example: An Impulsor with a unit of Intercessors embarked within it is destroyed by ranged attacks. First, any unresolved attacks made by the attacking unit are resolved. Then the Intercessors make an emergency disembark move. Then the roll is made for the Deadly Demise ability, and on a 6, that ability is resolved. Finally, the Impulsor is removed from the battlefield.*",
            "sourceUnitId": "unit-maulerfiend"
          },
          {
            "id": "emperors-children-ability-thrill-seekers",
            "sectionId": "emperors-children-ability-thrill-seekers",
            "title": "Thrill Seekers",
            "text": "If your Army Faction is Emperor's Children, this unit is eligible to shoot and declare a charge in a turn in which it Advanced or Fell Back, but when doing so:\n- It cannot target a unit it was within Engagement Range of at the start of the turn\n- It cannot target a unit that was the target of another unit's charge or attack this phase.",
            "sourceUnitId": "unit-maulerfiend"
          },
          {
            "id": "emperors-children-ability-damaged-1-4-wounds-remaining",
            "sectionId": "emperors-children-ability-damaged-1-4-wounds-remaining",
            "title": "Damaged: 1-4 Wounds Remaining",
            "text": "While this model has 1-4 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll.",
            "sourceUnitId": "unit-maulerfiend"
          }
        ],
        "models": [
          {
            "id": "unit-maulerfiend-model-df15c61bbe",
            "title": "Maulerfiend",
            "aliases": [
              "Maulerfiend"
            ],
            "min": 1,
            "max": 1,
            "legacyIds": [
              "unit-maulerfiend-model-maulerfiend"
            ]
          }
        ],
        "compositionRules": [],
        "selections": [
          {
            "id": "unit-maulerfiend-selection-maulerfiend-fists",
            "title": "Maulerfiend fists",
            "aliases": [
              "Maulerfiend fists"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-maulerfiend-profile-b27be1b537"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-maulerfiend-selection-magma-cutters",
            "title": "Magma cutters",
            "aliases": [
              "Magma cutters"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-maulerfiend-profile-97d891f70c"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-maulerfiend-selection-lasher-tendrils",
            "title": "Lasher tendrils",
            "aliases": [
              "Lasher tendrils"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-maulerfiend-profile-dd6a44c758"
            ],
            "wargearAbilityIds": []
          }
        ],
        "weaponFamilies": [],
        "weaponProfiles": [
          {
            "id": "unit-maulerfiend-profile-b27be1b537",
            "legacyIds": [
              "unit-maulerfiend-profile-maulerfiend-fists-melee"
            ],
            "title": "Maulerfiend fists",
            "mode": "melee",
            "range": "Melee",
            "a": "6",
            "skill": "3+",
            "s": "14",
            "ap": "-2",
            "d": "D6+1",
            "abilities": "",
            "sourceSelectionIds": [
              "unit-maulerfiend-selection-maulerfiend-fists"
            ]
          },
          {
            "id": "unit-maulerfiend-profile-97d891f70c",
            "legacyIds": [
              "unit-maulerfiend-profile-magma-cutters-ranged-2"
            ],
            "title": "Magma cutters",
            "mode": "ranged",
            "range": "6\"",
            "a": "2",
            "skill": "3+",
            "s": "9",
            "ap": "-4",
            "d": "D6",
            "abilities": "Melta 2",
            "sourceSelectionIds": [
              "unit-maulerfiend-selection-magma-cutters"
            ]
          },
          {
            "id": "unit-maulerfiend-profile-dd6a44c758",
            "legacyIds": [
              "unit-maulerfiend-profile-lasher-tendrils-melee-3"
            ],
            "title": "Lasher tendrils",
            "mode": "melee",
            "range": "Melee",
            "a": "6",
            "skill": "3+",
            "s": "7",
            "ap": "-1",
            "d": "1",
            "abilities": "Extra Attacks",
            "sourceSelectionIds": [
              "unit-maulerfiend-selection-lasher-tendrils"
            ]
          }
        ],
        "wargearAbilities": [],
        "wargearDefaults": [
          {
            "modelId": "unit-maulerfiend-model-df15c61bbe",
            "selections": [
              {
                "selectionId": "unit-maulerfiend-selection-lasher-tendrils",
                "quantity": 1
              },
              {
                "selectionId": "unit-maulerfiend-selection-maulerfiend-fists",
                "quantity": 1
              }
            ]
          }
        ],
        "wargearOptionContracts": [
          {
            "sourceId": "datasheet-maulerfiend:wargear:1",
            "eligibleModelIds": [
              "unit-maulerfiend-model-df15c61bbe"
            ],
            "limit": {
              "perModel": 1,
              "perUnit": 1
            },
            "choices": [
              {
                "remove": [
                  {
                    "selectionId": "unit-maulerfiend-selection-lasher-tendrils",
                    "quantity": 1
                  }
                ],
                "add": [
                  {
                    "selectionId": "unit-maulerfiend-selection-magma-cutters",
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
      "id": "unit-seekers",
      "title": "Seekers",
      "sourceBookId": "emperors-children",
      "sourceLayer": "codex",
      "intrinsicKeywords": [
        "MOUNTED",
        "CHAOS",
        "DAEMON",
        "SUMMONED",
        "SLAANESH",
        "SEEKERS",
        "LEGIONS OF EXCESS"
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
          "T": "4",
          "Sv": "7+",
          "W": "2",
          "Ld": "7+",
          "OC": "1",
          "Invulnerable": "5+"
        },
        "statProfiles": [
          {
            "id": "unit-seekers-stat-profile-89a119056c",
            "title": "Seeker",
            "stats": {
              "M": "14\"",
              "T": "4",
              "Sv": "7+",
              "W": "2",
              "Ld": "7+",
              "OC": "1",
              "Invulnerable": "5+"
            },
            "legacyIds": [
              "unit-seekers-stat-profile-seeker"
            ]
          },
          {
            "id": "unit-seekers-stat-profile-e8ce92717f",
            "title": "Heartseeker",
            "stats": {
              "M": "14\"",
              "T": "4",
              "Sv": "7+",
              "W": "2",
              "Ld": "7+",
              "OC": "1",
              "Invulnerable": "5+"
            },
            "legacyIds": [
              "unit-seekers-stat-profile-heartseeker"
            ]
          }
        ],
        "abilities": [
          {
            "id": "emperors-children-ability-unholy-speed",
            "sectionId": "emperors-children-ability-unholy-speed",
            "title": "Unholy Speed",
            "text": "You can re-roll Advance and Charge rolls made for this unit.",
            "sourceUnitId": "unit-seekers"
          },
          {
            "id": "core-deep-strike",
            "sectionId": "core-deep-strike",
            "title": "Deep Strike",
            "text": "Each time this unit makes an ingress move (20.04), if every model in this unit has this ability, it can be set up anywhere on the battlefield that is more than 8\" horizontally from all enemy units, even if that is within your opponent’s deployment zone.",
            "sourceUnitId": "unit-seekers"
          },
          {
            "id": "core-scouts",
            "sectionId": "core-scouts",
            "title": "Scouts 9\"",
            "text": "This ability always takes the form Scouts X\". In the Resolve Pre-battle Abilities step, if every model in a unit has this ability, you can do one of the following: \n- If that unit is in strategic reserves, you can set up that unit anywhere that is wholly within your deployment zone. \n- If that unit is wholly within your deployment zone, it can make a scout move. \n- If that unit is embarked within a DEDICATED TRANSPORT that is wholly within your deployment zone, and if every model embarked within that DEDICATED TRANSPORT has the Scouts ability, that DEDICATED TRANSPORT can make a scout move.",
            "sourceUnitId": "unit-seekers"
          },
          {
            "id": "emperors-children-ability-pact-of-excess",
            "sectionId": "emperors-children-ability-pact-of-excess",
            "title": "Pact of Excess",
            "text": "When mustering your army, unless specifically stated otherwise, you cannot select LEGIONS OF EXCESS as your Army Faction.",
            "sourceUnitId": "unit-seekers"
          }
        ],
        "models": [
          {
            "id": "unit-seekers-model-61c845eb3e",
            "title": "Seeker",
            "aliases": [
              "Seeker"
            ],
            "min": 4,
            "max": 9,
            "legacyIds": [
              "unit-seekers-model-seeker"
            ]
          },
          {
            "id": "unit-seekers-model-edaf52afdb",
            "title": "Heartseeker",
            "aliases": [
              "Heartseeker"
            ],
            "min": 1,
            "max": 1,
            "legacyIds": [
              "unit-seekers-model-heartseeker-2"
            ]
          }
        ],
        "compositionRules": [],
        "selections": [
          {
            "id": "unit-seekers-selection-lashing-tongue",
            "title": "Lashing tongue",
            "aliases": [
              "Lashing tongue"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-seekers-profile-4558276cee"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-seekers-selection-slashing-claws",
            "title": "Slashing claws",
            "aliases": [
              "Slashing claws"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-seekers-profile-bc06a66b66"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-seekers-selection-daemonic-icon",
            "title": "Daemonic Icon",
            "aliases": [
              "Daemonic Icon"
            ],
            "kind": "wargear",
            "profileIds": [],
            "wargearAbilityIds": [
              "unit-seekers-wargear-ability-b3dad0463e"
            ]
          },
          {
            "id": "unit-seekers-selection-instrument-of-chaos",
            "title": "Instrument of Chaos",
            "aliases": [
              "Instrument of Chaos"
            ],
            "kind": "wargear",
            "profileIds": [],
            "wargearAbilityIds": [
              "unit-seekers-wargear-ability-6721ceb7d6"
            ]
          }
        ],
        "weaponFamilies": [],
        "weaponProfiles": [
          {
            "id": "unit-seekers-profile-4558276cee",
            "legacyIds": [
              "unit-seekers-profile-lashing-tongue-melee"
            ],
            "title": "Lashing tongue",
            "mode": "melee",
            "range": "Melee",
            "a": "2",
            "skill": "4+",
            "s": "4",
            "ap": "0",
            "d": "1",
            "abilities": "Extra Attacks, Lethal Hits",
            "sourceSelectionIds": [
              "unit-seekers-selection-lashing-tongue"
            ]
          },
          {
            "id": "unit-seekers-profile-bc06a66b66",
            "legacyIds": [
              "unit-seekers-profile-slashing-claws-melee-2"
            ],
            "title": "Slashing claws",
            "mode": "melee",
            "range": "Melee",
            "a": "3",
            "skill": "3+",
            "s": "4",
            "ap": "-1",
            "d": "1",
            "abilities": "Devastating Wounds",
            "sourceSelectionIds": [
              "unit-seekers-selection-slashing-claws"
            ]
          }
        ],
        "wargearAbilities": [
          {
            "id": "unit-seekers-wargear-ability-b3dad0463e",
            "sectionId": "unit-seekers-wargear-ability-b3dad0463e",
            "title": "Daemonic Icon",
            "text": "Models in the bearer’s unit have a Leadership characteristic of 6+.",
            "sourceUnitId": "unit-seekers",
            "legacyIds": [
              "unit-seekers-wargear-ability-daemonic-icon"
            ],
            "requiredSelectionIds": [
              "unit-seekers-selection-daemonic-icon"
            ]
          },
          {
            "id": "unit-seekers-wargear-ability-6721ceb7d6",
            "sectionId": "unit-seekers-wargear-ability-6721ceb7d6",
            "title": "Instrument of Chaos",
            "text": "Add 1 to Charge rolls made for the bearer’s unit.",
            "sourceUnitId": "unit-seekers",
            "legacyIds": [
              "unit-seekers-wargear-ability-instrument-of-chaos-2"
            ],
            "requiredSelectionIds": [
              "unit-seekers-selection-instrument-of-chaos"
            ]
          }
        ],
        "wargearDefaults": [
          {
            "modelId": "unit-seekers-model-61c845eb3e",
            "selections": [
              {
                "selectionId": "unit-seekers-selection-lashing-tongue",
                "quantity": 1
              },
              {
                "selectionId": "unit-seekers-selection-slashing-claws",
                "quantity": 1
              }
            ]
          },
          {
            "modelId": "unit-seekers-model-edaf52afdb",
            "selections": [
              {
                "selectionId": "unit-seekers-selection-lashing-tongue",
                "quantity": 1
              },
              {
                "selectionId": "unit-seekers-selection-slashing-claws",
                "quantity": 1
              }
            ]
          }
        ],
        "wargearOptionContracts": [
          {
            "sourceId": "datasheet-seekers:wargear:1",
            "eligibleModelIds": [
              "unit-seekers-model-61c845eb3e"
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
                    "selectionId": "unit-seekers-selection-instrument-of-chaos",
                    "quantity": 1
                  }
                ],
                "requiresFinal": [],
                "forbidsFinal": [
                  "unit-seekers-selection-daemonic-icon"
                ],
                "sharedUses": []
              }
            ]
          },
          {
            "sourceId": "datasheet-seekers:wargear:2",
            "eligibleModelIds": [
              "unit-seekers-model-61c845eb3e"
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
                    "selectionId": "unit-seekers-selection-daemonic-icon",
                    "quantity": 1
                  }
                ],
                "requiresFinal": [],
                "forbidsFinal": [
                  "unit-seekers-selection-instrument-of-chaos"
                ],
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
      "id": "carnival-of-excess",
      "title": "CARNIVAL OF EXCESS",
      "sourceBookId": "emperors-children",
      "chapterRestriction": null,
      "keywordGrants": [],
      "detachmentRuleIds": [
        "emperors-children-detachment-rule-daemonic-empowerment"
      ]
    },
    {
      "id": "coterie-of-the-conceited",
      "title": "COTERIE OF THE CONCEITED",
      "sourceBookId": "emperors-children",
      "chapterRestriction": null,
      "keywordGrants": [],
      "detachmentRuleIds": [
        "emperors-children-detachment-rule-pledges-to-the-dark-prince"
      ]
    },
    {
      "id": "mercurial-host",
      "title": "MERCURIAL HOST",
      "sourceBookId": "emperors-children",
      "chapterRestriction": null,
      "keywordGrants": [],
      "detachmentRuleIds": [
        "emperors-children-detachment-rule-quicksilver-grace"
      ]
    },
    {
      "id": "peerless-bladesmen",
      "title": "PEERLESS BLADESMEN",
      "sourceBookId": "emperors-children",
      "chapterRestriction": null,
      "keywordGrants": [],
      "detachmentRuleIds": [
        "emperors-children-detachment-rule-exquisite-swordsmanship"
      ]
    },
    {
      "id": "slaaneshs-chosen",
      "title": "SLAANESH’S CHOSEN",
      "sourceBookId": "emperors-children",
      "chapterRestriction": null,
      "keywordGrants": [],
      "detachmentRuleIds": [
        "emperors-children-detachment-rule-internal-rivalries"
      ]
    },
    {
      "id": "rapid-evisceration",
      "title": "RAPID EVISCERATION",
      "sourceBookId": "emperors-children",
      "chapterRestriction": null,
      "keywordGrants": [],
      "detachmentRuleIds": [
        "emperors-children-detachment-rule-mechanised-murder"
      ]
    },
    {
      "id": "frenzied-host",
      "title": "FRENZIED HOST",
      "sourceBookId": "emperors-children",
      "chapterRestriction": null,
      "keywordGrants": [],
      "detachmentRuleIds": [
        "emperors-children-detachment-rule-frantic-focus"
      ]
    },
    {
      "id": "court-of-the-phoenician",
      "title": "COURT OF THE PHOENICIAN",
      "sourceBookId": "emperors-children",
      "chapterRestriction": null,
      "keywordGrants": [],
      "detachmentRuleIds": [
        "emperors-children-detachment-rule-sensational-performance",
        "emperors-children-detachment-rule-master-of-the-pageant"
      ]
    },
    {
      "id": "spectacle-of-slaughter",
      "title": "SPECTACLE OF SLAUGHTER",
      "sourceBookId": "emperors-children",
      "chapterRestriction": null,
      "keywordGrants": [],
      "detachmentRuleIds": [
        "emperors-children-detachment-rule-entitled-to-victory"
      ]
    },
    {
      "id": "elegant-brutes",
      "title": "ELEGANT BRUTES",
      "sourceBookId": "emperors-children",
      "chapterRestriction": null,
      "keywordGrants": [],
      "detachmentRuleIds": [
        "emperors-children-detachment-rule-eager-to-kill"
      ]
    }
  ],
  "detachmentRules": [
    {
      "id": "emperors-children-detachment-rule-daemonic-empowerment",
      "title": "Daemonic Empowerment",
      "text": "While an EMPEROR’S CHILDREN unit from your army is within 6\" of one or more friendly LEGIONS OF EXCESS units, it is Empowered.While a LEGIONS OF EXCESS unit from your army is within 6\" of one or more friendly EMPEROR’S CHILDREN units, it is Empowered.While a unit from your army is Empowered, weapons equipped by models in that unit have the [sustained hits 1] ability. If such a weapon already has that ability, each time an attack is made with that weapon, an unmodified Hit roll of 5+ scores a Critical Hit.LEGIONS OF EXCESSYou can include LEGIONS OF EXCESS units in your army, even though they do not have the EMPEROR’S CHILDREN Faction keyword. The combined points cost of such units you can include in your army is:Incursion: Up to 500 ptsStrike Force: Up to 1000 ptsOnslaught: Up to 1500 ptsNo LEGIONS OF EXCESS models from your army can be your WARLORD.",
      "sectionId": "carnival-of-excess-rule",
      "detachmentId": "carnival-of-excess",
      "detachmentTitle": "CARNIVAL OF EXCESS",
      "sourceBookId": "emperors-children"
    },
    {
      "id": "emperors-children-detachment-rule-pledges-to-the-dark-prince",
      "title": "Pledges to the Dark Prince",
      "text": "At the start of the battle round, if your WARLORD is on the battlefield, you must pledge a number to Slaanesh representing how many enemy units will be destroyed this battle round. At the end of the battle round, if the number of enemy units destroyed this battle round is greater than or equal to your pledge, you gain a number of Pact points equal to your pledge. Otherwise, you do not gain any Pact points this battle round and your WARLORD model suffers D3 mortal wounds.EMPEROR’S CHILDREN units from your army gain a bonus depending on how many Pact points you have gained during the battle, as shown below (these are all cumulative).PACT POINTSBONUS1+Each time a model in this unit makes an attack, re-roll a Hit roll of 1.3+Each time a model in this unit makes an attack, re-roll a Wound roll of 1.5+Melee weapons equipped by models in this unit have the [LETHAL HITS] and [SUSTAINED HITS 1] abilities.7+Each time a model in this unit makes an attack, a Critical Hit is scored on an unmodified Hit roll of 5+.",
      "sectionId": "coterie-of-the-conceited-rule",
      "detachmentId": "coterie-of-the-conceited",
      "detachmentTitle": "COTERIE OF THE CONCEITED",
      "sourceBookId": "emperors-children"
    },
    {
      "id": "emperors-children-detachment-rule-quicksilver-grace",
      "title": "Quicksilver Grace",
      "text": "You can re-roll Advance rolls made for EMPEROR’S CHILDREN units from your army.",
      "sectionId": "mercurial-host-rule",
      "detachmentId": "mercurial-host",
      "detachmentTitle": "MERCURIAL HOST",
      "sourceBookId": "emperors-children"
    },
    {
      "id": "emperors-children-detachment-rule-exquisite-swordsmanship",
      "title": "Exquisite Swordsmanship",
      "text": "Each time an EMPEROR’S CHILDREN unit from your army is selected to fight, if it made a Charge move this turn, select one of the abilities below. While resolving those attacks, melee weapons equipped by models in that unit have that ability:[LETHAL HITS][SUSTAINED HITS 1]",
      "sectionId": "peerless-bladesmen-rule",
      "detachmentId": "peerless-bladesmen",
      "detachmentTitle": "PEERLESS BLADESMEN",
      "sourceBookId": "emperors-children"
    },
    {
      "id": "emperors-children-detachment-rule-internal-rivalries",
      "title": "Internal Rivalries",
      "text": "EMPEROR’S CHILDREN CHARACTER units from your army can ignore any or all modifiers to their Move characteristic and any or all modifiers to Advance and Charge rolls made for them.At the start of the battle, your WARLORD’s unit is your army’s Favoured Champions. The first time in each player’s turn that an EMPEROR’S CHILDREN CHARACTER unit from your army destroys an enemy unit, after resolving all of its attacks, that CHARACTER unit becomes your army’s new Favoured Champions, replacing the old one.Each time a model in your army’s Favoured Champions unit makes an attack, you can re-roll the Wound roll.",
      "sectionId": "slaaneshs-chosen-rule",
      "detachmentId": "slaaneshs-chosen",
      "detachmentTitle": "SLAANESH’S CHOSEN",
      "sourceBookId": "emperors-children"
    },
    {
      "id": "emperors-children-detachment-rule-mechanised-murder",
      "title": "Mechanised Murder",
      "text": "Each time an EMPEROR’S CHILDREN model from your army makes an attack, if it is a TRANSPORT model or disembarked from a TRANSPORT this turn, re-roll a Hit roll of 1 and re-roll a Wound roll of 1.",
      "sectionId": "rapid-evisceration-rule",
      "detachmentId": "rapid-evisceration",
      "detachmentTitle": "RAPID EVISCERATION",
      "sourceBookId": "emperors-children"
    },
    {
      "id": "emperors-children-detachment-rule-frantic-focus",
      "title": "Frantic Focus",
      "text": "When a friendly EMPEROR’S CHILDREN BATTLELINE unit is selected to make an advance/fall-back move, that unit’s attacks have +1 S until the end of the turn.",
      "sectionId": "frenzied-host-rule",
      "detachmentId": "frenzied-host",
      "detachmentTitle": "FRENZIED HOST",
      "sourceBookId": "emperors-children"
    },
    {
      "id": "emperors-children-detachment-rule-sensational-performance",
      "title": "Sensational Performance",
      "text": "EMPEROR’S CHILDREN units from your army have the following ability: Sensational Performance: Each time this unit is selected to fight, if this unit made a Charge move this turn, it can use this ability. If it does, until the end of the phase: This unit cannot target a unit it was within Engagement Range of at the start of the turn. This unit cannot target a unit that was the target of another unit’s attack this phase. Improve the Strength and Armour Penetration characteristics of this unit’s melee weapons by 1.",
      "sectionId": "court-of-the-phoenician-rule",
      "detachmentId": "court-of-the-phoenician",
      "detachmentTitle": "COURT OF THE PHOENICIAN",
      "sourceBookId": "emperors-children"
    },
    {
      "id": "emperors-children-detachment-rule-master-of-the-pageant",
      "title": "Master of the Pageant",
      "text": "Once per battle round, when you target a FULGRIM unit from your army with the Sinuous Breach or Prideful Superiority Stratagem, you can reduce the CP cost of that use of that Stratagem by 1CP.",
      "sectionId": "court-of-the-phoenician-rule",
      "detachmentId": "court-of-the-phoenician",
      "detachmentTitle": "COURT OF THE PHOENICIAN",
      "sourceBookId": "emperors-children"
    },
    {
      "id": "emperors-children-detachment-rule-entitled-to-victory",
      "title": "Entitled to Victory",
      "text": "Friendly FLAWLESS BLADES units have Fights First.",
      "sectionId": "spectacle-of-slaughter-rule",
      "detachmentId": "spectacle-of-slaughter",
      "detachmentTitle": "SPECTACLE OF SLAUGHTER",
      "sourceBookId": "emperors-children"
    },
    {
      "id": "emperors-children-detachment-rule-eager-to-kill",
      "title": "Eager to Kill",
      "text": "When a friendly EMPEROR’S CHILDREN TERMINATOR unit is set up, that unit has +1 to charge rolls until the end of the turn.",
      "sectionId": "elegant-brutes-rule",
      "detachmentId": "elegant-brutes",
      "detachmentTitle": "ELEGANT BRUTES",
      "sourceBookId": "emperors-children"
    }
  ],
  "enhancements": [
    {
      "title": "Empyric Suffusion",
      "text": "EMPEROR’S CHILDREN model only. When you target this unit with the Heroic Intervention stratagem, that use is -1 CP.",
      "value": 15,
      "detachment": "CARNIVAL OF EXCESS",
      "tags": [],
      "owner": {
        "subject": "model",
        "selector": {
          "unitIds": [
            "unit-daemon-prince-of-slaanesh",
            "unit-daemon-prince-of-slaanesh-with-wings",
            "unit-lord-exultant",
            "unit-lord-kakophonist",
            "unit-sorcerer"
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
      },
      "id": "enhancement-empyric-suffusion",
      "termId": "emperors-children-enhancement-empyric-suffusion",
      "ruleId": "enhancement-empyric-suffusion",
      "detachmentId": "carnival-of-excess",
      "sourceBookId": "emperors-children",
      "legacyKey": "enhancement-empyric-suffusion",
      "canonicalEnhancementId": "enhancement-empyric-suffusion",
      "canonicalDetachmentId": "carnival-of-excess"
    },
    {
      "title": "Dark Blessings",
      "text": "EMPEROR’S CHILDREN INFANTRY model only. Once per battle, just after an enemy unit has selected its targets, the bearer can use this Enhancement. If it does, until the end of the phase, the bearer has a 3+ invulnerable save.",
      "value": 10,
      "detachment": "CARNIVAL OF EXCESS",
      "tags": [],
      "owner": {
        "subject": "model",
        "selector": {
          "unitIds": [
            "unit-daemon-prince-of-slaanesh",
            "unit-daemon-prince-of-slaanesh-with-wings",
            "unit-lord-exultant",
            "unit-lord-kakophonist",
            "unit-sorcerer"
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
      },
      "id": "enhancement-dark-blessings",
      "termId": "emperors-children-enhancement-dark-blessings",
      "ruleId": "enhancement-dark-blessings",
      "detachmentId": "carnival-of-excess",
      "sourceBookId": "emperors-children",
      "legacyKey": "enhancement-dark-blessings",
      "canonicalEnhancementId": "enhancement-dark-blessings",
      "canonicalDetachmentId": "carnival-of-excess"
    },
    {
      "title": "Possessed Blade",
      "text": "EMPEROR’S CHILDREN model only. At the start of the battle, select one melee weapon equipped by the bearer; add 1 to the Attacks characteristic of that weapon. In addition, each time the bearer is selected to fight, it can use this Enhancement. If it does, while resolving those attacks, add 1 to the Damage characteristic of that weapon and that weapon has the [devastating wounds] and [hazardous] abilities.",
      "value": 35,
      "detachment": "CARNIVAL OF EXCESS",
      "tags": [],
      "owner": {
        "subject": "model",
        "selector": {
          "unitIds": [
            "unit-daemon-prince-of-slaanesh",
            "unit-daemon-prince-of-slaanesh-with-wings",
            "unit-lord-exultant",
            "unit-lord-kakophonist",
            "unit-sorcerer"
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
      },
      "id": "enhancement-possessed-blade",
      "termId": "emperors-children-enhancement-possessed-blade",
      "ruleId": "enhancement-possessed-blade",
      "detachmentId": "carnival-of-excess",
      "sourceBookId": "emperors-children",
      "legacyKey": "enhancement-possessed-blade",
      "canonicalEnhancementId": "enhancement-possessed-blade",
      "canonicalDetachmentId": "carnival-of-excess"
    },
    {
      "title": "Warp Walker",
      "text": "EMPEROR’S CHILDREN or KEEPER OF SECRETS model only. Each time the bearer’s unit Advances, do not make an Advance roll . Instead, until the end of the phase, add 6\" to the Move characteristic of models in that unit. Each time a model in the bearer’s unit makes a Normal , Advance or Fall Back move , it can move through enemy models. When doing so, it can move within Engagement Range of such models but cannot end that move within Engagement Range of them, and any Desperate Escape test is automatically passed.",
      "value": 35,
      "detachment": "CARNIVAL OF EXCESS",
      "tags": [],
      "owner": {
        "subject": "model",
        "selector": {
          "unitIds": [
            "unit-daemon-prince-of-slaanesh",
            "unit-daemon-prince-of-slaanesh-with-wings",
            "unit-lord-exultant",
            "unit-lord-kakophonist",
            "unit-sorcerer"
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
      },
      "id": "enhancement-warp-walker",
      "termId": "emperors-children-enhancement-warp-walker",
      "ruleId": "enhancement-warp-walker",
      "detachmentId": "carnival-of-excess",
      "sourceBookId": "emperors-children",
      "legacyKey": "enhancement-warp-walker",
      "canonicalEnhancementId": "enhancement-warp-walker",
      "canonicalDetachmentId": "carnival-of-excess"
    },
    {
      "title": "Pledge of Eternal Servitude",
      "text": "EMPEROR’S CHILDREN model only. The first time the bearer is destroyed, take a Leadership test for the bearer at the end of the phase. If that test is passed, set the bearer back up on the battlefield, as close as possible to where it was destroyed and not within Engagement Range of one or more enemy units, with D6 wounds remaining (up to its Wounds characteristic).",
      "value": 25,
      "detachment": "COTERIE OF THE CONCEITED",
      "tags": [],
      "owner": {
        "subject": "model",
        "selector": {
          "unitIds": [
            "unit-daemon-prince-of-slaanesh",
            "unit-daemon-prince-of-slaanesh-with-wings",
            "unit-lord-exultant",
            "unit-lord-kakophonist",
            "unit-sorcerer"
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
      },
      "id": "enhancement-pledge-of-eternal-servitude",
      "termId": "emperors-children-enhancement-pledge-of-eternal-servitude",
      "ruleId": "enhancement-pledge-of-eternal-servitude",
      "detachmentId": "coterie-of-the-conceited",
      "sourceBookId": "emperors-children",
      "legacyKey": "enhancement-pledge-of-eternal-servitude",
      "canonicalEnhancementId": "enhancement-pledge-of-eternal-servitude",
      "canonicalDetachmentId": "coterie-of-the-conceited"
    },
    {
      "title": "Pledge of Dark Glory",
      "text": "EMPEROR’S CHILDREN model only. While the bearer is leading a unit, improve the Leadership and Objective Control characteristics of models in that unit by 1.",
      "value": 25,
      "detachment": "COTERIE OF THE CONCEITED",
      "tags": [],
      "owner": {
        "subject": "model",
        "selector": {
          "unitIds": [
            "unit-daemon-prince-of-slaanesh",
            "unit-daemon-prince-of-slaanesh-with-wings",
            "unit-lord-exultant",
            "unit-lord-kakophonist",
            "unit-sorcerer"
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
      },
      "id": "enhancement-pledge-of-dark-glory",
      "termId": "emperors-children-enhancement-pledge-of-dark-glory",
      "ruleId": "enhancement-pledge-of-dark-glory",
      "detachmentId": "coterie-of-the-conceited",
      "sourceBookId": "emperors-children",
      "legacyKey": "enhancement-pledge-of-dark-glory",
      "canonicalEnhancementId": "enhancement-pledge-of-dark-glory",
      "canonicalDetachmentId": "coterie-of-the-conceited"
    },
    {
      "title": "Pledge of Mortal Pain",
      "text": "EMPEROR’S CHILDREN model only. At the start of your Shooting phase , select one enemy unit within 12\" of and visible to the bearer. That unit must take a Leadership test , subtracting 2 from the result if it is Battle-shocked : if failed, that enemy unit suffers 3 mortal wounds .",
      "value": 15,
      "detachment": "COTERIE OF THE CONCEITED",
      "tags": [],
      "owner": {
        "subject": "model",
        "selector": {
          "unitIds": [
            "unit-daemon-prince-of-slaanesh",
            "unit-daemon-prince-of-slaanesh-with-wings",
            "unit-lord-exultant",
            "unit-lord-kakophonist",
            "unit-sorcerer"
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
      },
      "id": "enhancement-pledge-of-mortal-pain",
      "termId": "emperors-children-enhancement-pledge-of-mortal-pain",
      "ruleId": "enhancement-pledge-of-mortal-pain",
      "detachmentId": "coterie-of-the-conceited",
      "sourceBookId": "emperors-children",
      "legacyKey": "enhancement-pledge-of-mortal-pain",
      "canonicalEnhancementId": "enhancement-pledge-of-mortal-pain",
      "canonicalDetachmentId": "coterie-of-the-conceited"
    },
    {
      "title": "Pledge of Unholy Fortune",
      "text": "EMPEROR’S CHILDREN model only. Once per turn, just after making a Hit roll , a Wound roll or a saving throw for a model in the bearer’s unit, if the bearer is not Battle-shocked , it can use this Enhancement. If it does, treat the result as an unmodified roll of 6 instead.",
      "value": 30,
      "detachment": "COTERIE OF THE CONCEITED",
      "tags": [],
      "owner": {
        "subject": "model",
        "selector": {
          "unitIds": [
            "unit-daemon-prince-of-slaanesh",
            "unit-daemon-prince-of-slaanesh-with-wings",
            "unit-lord-exultant",
            "unit-lord-kakophonist",
            "unit-sorcerer"
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
      },
      "id": "enhancement-pledge-of-unholy-fortune",
      "termId": "emperors-children-enhancement-pledge-of-unholy-fortune",
      "ruleId": "enhancement-pledge-of-unholy-fortune",
      "detachmentId": "coterie-of-the-conceited",
      "sourceBookId": "emperors-children",
      "legacyKey": "enhancement-pledge-of-unholy-fortune",
      "canonicalEnhancementId": "enhancement-pledge-of-unholy-fortune",
      "canonicalDetachmentId": "coterie-of-the-conceited"
    },
    {
      "title": "Steeped in Suffering",
      "text": "EMPEROR’S CHILDREN model only. Each time a model in the bearer’s unit makes an attack that targets an enemy unit below its Starting Strength , add 1 to the Hit roll . If that target is also Below Half-strength , add 1 to the Wound roll as well.",
      "value": 20,
      "detachment": "MERCURIAL HOST",
      "tags": [],
      "owner": {
        "subject": "model",
        "selector": {
          "unitIds": [
            "unit-daemon-prince-of-slaanesh",
            "unit-daemon-prince-of-slaanesh-with-wings",
            "unit-lord-exultant",
            "unit-lord-kakophonist",
            "unit-sorcerer"
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
      },
      "id": "enhancement-steeped-in-suffering",
      "termId": "emperors-children-enhancement-steeped-in-suffering",
      "ruleId": "enhancement-steeped-in-suffering",
      "detachmentId": "mercurial-host",
      "sourceBookId": "emperors-children",
      "legacyKey": "enhancement-steeped-in-suffering",
      "canonicalEnhancementId": "enhancement-steeped-in-suffering",
      "canonicalDetachmentId": "mercurial-host"
    },
    {
      "title": "Intoxicating Musk",
      "text": "EMPEROR’S CHILDREN model only. Each time a melee attack targets the bearer’s unit, if the Strength characteristic of that attack is greater than the Toughness characteristic of that unit, subtract 1 from the Wound roll .",
      "value": 20,
      "detachment": "MERCURIAL HOST",
      "tags": [],
      "owner": {
        "subject": "model",
        "selector": {
          "unitIds": [
            "unit-daemon-prince-of-slaanesh",
            "unit-daemon-prince-of-slaanesh-with-wings",
            "unit-lord-exultant",
            "unit-lord-kakophonist",
            "unit-sorcerer"
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
      },
      "id": "enhancement-intoxicating-musk",
      "termId": "emperors-children-enhancement-intoxicating-musk",
      "ruleId": "enhancement-intoxicating-musk",
      "detachmentId": "mercurial-host",
      "sourceBookId": "emperors-children",
      "legacyKey": "enhancement-intoxicating-musk",
      "canonicalEnhancementId": "enhancement-intoxicating-musk",
      "canonicalDetachmentId": "mercurial-host"
    },
    {
      "title": "Tactical Perfection",
      "text": "EMPEROR’S CHILDREN model only. After both players have deployed their armies, select up to two EMPEROR’S CHILDREN units from your army and redeploy them. When doing so, you can set those units up in Strategic Reserves if you wish, regardless of how many units are already in Strategic Reserves.",
      "value": 15,
      "detachment": "MERCURIAL HOST",
      "tags": [],
      "owner": {
        "subject": "model",
        "selector": {
          "unitIds": [
            "unit-daemon-prince-of-slaanesh",
            "unit-daemon-prince-of-slaanesh-with-wings",
            "unit-lord-exultant",
            "unit-lord-kakophonist",
            "unit-sorcerer"
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
      },
      "id": "enhancement-tactical-perfection",
      "termId": "emperors-children-enhancement-tactical-perfection",
      "ruleId": "enhancement-tactical-perfection",
      "detachmentId": "mercurial-host",
      "sourceBookId": "emperors-children",
      "legacyKey": "enhancement-tactical-perfection",
      "canonicalEnhancementId": "enhancement-tactical-perfection",
      "canonicalDetachmentId": "mercurial-host"
    },
    {
      "title": "Loathsome Dexterity",
      "text": "EMPEROR’S CHILDREN model only. Each time a model in the bearer’s unit makes a Normal , Advance or Fall Back move , it can move through enemy models. When doing so, it can move within Engagement Range of such models but cannot end that move within Engagement Range of them, and any Desperate Escape test is automatically passed.",
      "value": 10,
      "detachment": "MERCURIAL HOST",
      "tags": [],
      "owner": {
        "subject": "model",
        "selector": {
          "unitIds": [
            "unit-daemon-prince-of-slaanesh",
            "unit-daemon-prince-of-slaanesh-with-wings",
            "unit-lord-exultant",
            "unit-lord-kakophonist",
            "unit-sorcerer"
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
      },
      "id": "enhancement-loathsome-dexterity",
      "termId": "emperors-children-enhancement-loathsome-dexterity",
      "ruleId": "enhancement-loathsome-dexterity",
      "detachmentId": "mercurial-host",
      "sourceBookId": "emperors-children",
      "legacyKey": "enhancement-loathsome-dexterity",
      "canonicalEnhancementId": "enhancement-loathsome-dexterity",
      "canonicalDetachmentId": "mercurial-host"
    },
    {
      "title": "Faultless Opportunist",
      "text": "EMPEROR’S CHILDREN model only. You can target this unit with the Heroic Intervention stratagem, regardless of any other uses of that stratagem this phase. If you do: That use is -1 CP. That use does not prevent any uses of that stratagem on other units this phase.",
      "value": 15,
      "detachment": "PEERLESS BLADESMEN",
      "tags": [],
      "owner": {
        "subject": "model",
        "selector": {
          "unitIds": [
            "unit-daemon-prince-of-slaanesh",
            "unit-daemon-prince-of-slaanesh-with-wings",
            "unit-lord-exultant",
            "unit-lord-kakophonist",
            "unit-sorcerer"
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
      },
      "id": "enhancement-faultless-opportunist",
      "termId": "emperors-children-enhancement-faultless-opportunist",
      "ruleId": "enhancement-faultless-opportunist",
      "detachmentId": "peerless-bladesmen",
      "sourceBookId": "emperors-children",
      "legacyKey": "enhancement-faultless-opportunist",
      "canonicalEnhancementId": "enhancement-faultless-opportunist",
      "canonicalDetachmentId": "peerless-bladesmen"
    },
    {
      "title": "Blinding Speed",
      "text": "EMPEROR’S CHILDREN model only. Once per battle, at the start of the Fight phase , the bearer can use this Enhancement. If it does, until the end of the phase, models in the bearer’s unit have the Fights First ability.",
      "value": 25,
      "detachment": "PEERLESS BLADESMEN",
      "tags": [],
      "owner": {
        "subject": "model",
        "selector": {
          "unitIds": [
            "unit-daemon-prince-of-slaanesh",
            "unit-daemon-prince-of-slaanesh-with-wings",
            "unit-lord-exultant",
            "unit-lord-kakophonist",
            "unit-sorcerer"
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
      },
      "id": "enhancement-blinding-speed",
      "termId": "emperors-children-enhancement-blinding-speed",
      "ruleId": "enhancement-blinding-speed",
      "detachmentId": "peerless-bladesmen",
      "sourceBookId": "emperors-children",
      "legacyKey": "enhancement-blinding-speed",
      "canonicalEnhancementId": "enhancement-blinding-speed",
      "canonicalDetachmentId": "peerless-bladesmen"
    },
    {
      "title": "Distortion",
      "text": "EMPEROR’S CHILDREN model only. Add 1 to the Attacks and Damage characteristics of melee weapons equipped by the bearer.",
      "value": 25,
      "detachment": "PEERLESS BLADESMEN",
      "tags": [],
      "owner": {
        "subject": "model",
        "selector": {
          "unitIds": [
            "unit-daemon-prince-of-slaanesh",
            "unit-daemon-prince-of-slaanesh-with-wings",
            "unit-lord-exultant",
            "unit-lord-kakophonist",
            "unit-sorcerer"
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
      },
      "id": "enhancement-distortion",
      "termId": "emperors-children-enhancement-distortion",
      "ruleId": "enhancement-distortion",
      "detachmentId": "peerless-bladesmen",
      "sourceBookId": "emperors-children",
      "legacyKey": "enhancement-distortion",
      "canonicalEnhancementId": "enhancement-distortion",
      "canonicalDetachmentId": "peerless-bladesmen"
    },
    {
      "title": "Rise to the Challenge",
      "text": "EMPEROR’S CHILDREN INFANTRY model only. Once per battle, at the end of the Fight phase , if the bearer is within Engagement Range of three or more enemy models, it can use this Enhancement. If it does, the bearer can fight one additional time. When doing so, you can select one ability using the Exquisite Swordsmanship Detachment rule to apply to those attacks.",
      "value": 30,
      "detachment": "PEERLESS BLADESMEN",
      "tags": [],
      "owner": {
        "subject": "model",
        "selector": {
          "unitIds": [
            "unit-daemon-prince-of-slaanesh",
            "unit-daemon-prince-of-slaanesh-with-wings",
            "unit-lord-exultant",
            "unit-lord-kakophonist",
            "unit-sorcerer"
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
      },
      "id": "enhancement-rise-to-the-challenge",
      "termId": "emperors-children-enhancement-rise-to-the-challenge",
      "ruleId": "enhancement-rise-to-the-challenge",
      "detachmentId": "peerless-bladesmen",
      "sourceBookId": "emperors-children",
      "legacyKey": "enhancement-rise-to-the-challenge",
      "canonicalEnhancementId": "enhancement-rise-to-the-challenge",
      "canonicalDetachmentId": "peerless-bladesmen"
    },
    {
      "title": "Eager to Prove",
      "text": "EMPEROR’S CHILDREN model only. You can re-roll Charge rolls made for the bearer’s unit. While the bearer’s unit is your army’s Favoured Champions , add 2\" to the Move characteristic of models in that unit.",
      "value": 15,
      "detachment": "SLAANESH’S CHOSEN",
      "tags": [],
      "owner": {
        "subject": "model",
        "selector": {
          "unitIds": [
            "unit-daemon-prince-of-slaanesh",
            "unit-daemon-prince-of-slaanesh-with-wings",
            "unit-lord-exultant",
            "unit-lord-kakophonist",
            "unit-sorcerer"
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
      },
      "id": "enhancement-eager-to-prove",
      "termId": "emperors-children-enhancement-eager-to-prove",
      "ruleId": "enhancement-eager-to-prove",
      "detachmentId": "slaaneshs-chosen",
      "sourceBookId": "emperors-children",
      "legacyKey": "enhancement-eager-to-prove",
      "canonicalEnhancementId": "enhancement-eager-to-prove",
      "canonicalDetachmentId": "slaaneshs-chosen"
    },
    {
      "title": "Repulsed by Weakness",
      "text": "EMPEROR’S CHILDREN model only. Each time an enemy unit (excluding MONSTERS and VEHICLES ) within Engagement Range of the bearer’s unit Falls Back , models in that enemy unit must take Desperate Escape tests . When doing so, if the bearer’s unit is your army’s Favoured Champions , subtract 1 from each of those Desperate Escape tests.",
      "value": 25,
      "detachment": "SLAANESH’S CHOSEN",
      "tags": [],
      "owner": {
        "subject": "model",
        "selector": {
          "unitIds": [
            "unit-daemon-prince-of-slaanesh",
            "unit-daemon-prince-of-slaanesh-with-wings",
            "unit-lord-exultant",
            "unit-lord-kakophonist",
            "unit-sorcerer"
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
      },
      "id": "enhancement-repulsed-by-weakness",
      "termId": "emperors-children-enhancement-repulsed-by-weakness",
      "ruleId": "enhancement-repulsed-by-weakness",
      "detachmentId": "slaaneshs-chosen",
      "sourceBookId": "emperors-children",
      "legacyKey": "enhancement-repulsed-by-weakness",
      "canonicalEnhancementId": "enhancement-repulsed-by-weakness",
      "canonicalDetachmentId": "slaaneshs-chosen"
    },
    {
      "title": "Proud and Vainglorious",
      "text": "EMPEROR’S CHILDREN model only. You can re-roll Battle-shock and Leadership tests taken for the bearer’s unit. While the bearer’s unit is your army’s Favoured Champions , add 1 to the Objective Control characteristic of models in that unit.",
      "value": 20,
      "detachment": "SLAANESH’S CHOSEN",
      "tags": [],
      "owner": {
        "subject": "model",
        "selector": {
          "unitIds": [
            "unit-daemon-prince-of-slaanesh",
            "unit-daemon-prince-of-slaanesh-with-wings",
            "unit-lord-exultant",
            "unit-lord-kakophonist",
            "unit-sorcerer"
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
      },
      "id": "enhancement-proud-and-vainglorious",
      "termId": "emperors-children-enhancement-proud-and-vainglorious",
      "ruleId": "enhancement-proud-and-vainglorious",
      "detachmentId": "slaaneshs-chosen",
      "sourceBookId": "emperors-children",
      "legacyKey": "enhancement-proud-and-vainglorious",
      "canonicalEnhancementId": "enhancement-proud-and-vainglorious",
      "canonicalDetachmentId": "slaaneshs-chosen"
    },
    {
      "title": "Slayer of Champions",
      "text": "EMPEROR’S CHILDREN model only. The bearer’s melee weapons have the [PRECISION] ability, and each time the bearer makes a melee attack that targets a CHARACTER unit, improve the Strength and Armour Penetration characteristics of that attack by 1.",
      "value": 15,
      "detachment": "SLAANESH’S CHOSEN",
      "tags": [],
      "owner": {
        "subject": "model",
        "selector": {
          "unitIds": [
            "unit-daemon-prince-of-slaanesh",
            "unit-daemon-prince-of-slaanesh-with-wings",
            "unit-lord-exultant",
            "unit-lord-kakophonist",
            "unit-sorcerer"
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
      },
      "id": "enhancement-slayer-of-champions",
      "termId": "emperors-children-enhancement-slayer-of-champions",
      "ruleId": "enhancement-slayer-of-champions",
      "detachmentId": "slaaneshs-chosen",
      "sourceBookId": "emperors-children",
      "legacyKey": "enhancement-slayer-of-champions",
      "canonicalEnhancementId": "enhancement-slayer-of-champions",
      "canonicalDetachmentId": "slaaneshs-chosen"
    },
    {
      "title": "Sublime Prescience",
      "text": "EMPEROR’S CHILDREN INFANTRY model only. Once per turn, in your Movement phase , the bearer can use this Enhancement. If it does, select one friendly EMPEROR’S CHILDREN TRANSPORT that is in Strategic Reserves . Until the end of the phase, for the purposes of setting up that TRANSPORT on the battlefield, treat the current battle round number as being one higher than it actually is.",
      "value": 25,
      "detachment": "RAPID EVISCERATION",
      "tags": [],
      "owner": {
        "subject": "model",
        "selector": {
          "unitIds": [
            "unit-daemon-prince-of-slaanesh",
            "unit-daemon-prince-of-slaanesh-with-wings",
            "unit-lord-exultant",
            "unit-lord-kakophonist",
            "unit-sorcerer"
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
      },
      "id": "enhancement-sublime-prescience",
      "termId": "emperors-children-enhancement-sublime-prescience",
      "ruleId": "enhancement-sublime-prescience",
      "detachmentId": "rapid-evisceration",
      "sourceBookId": "emperors-children",
      "legacyKey": "enhancement-sublime-prescience",
      "canonicalEnhancementId": "enhancement-sublime-prescience",
      "canonicalDetachmentId": "rapid-evisceration"
    },
    {
      "title": "Spearhead Striker",
      "text": "EMPEROR’S CHILDREN INFANTRY model only. Each time the bearer disembarks from a TRANSPORT , until the end of the turn, you can re-roll Charge rolls made for the bearer’s unit and enemy units cannot use the Fire Overwatch Stratagem to shoot at the bearer’s unit.",
      "value": 20,
      "detachment": "RAPID EVISCERATION",
      "tags": [],
      "owner": {
        "subject": "model",
        "selector": {
          "unitIds": [
            "unit-daemon-prince-of-slaanesh",
            "unit-daemon-prince-of-slaanesh-with-wings",
            "unit-lord-exultant",
            "unit-lord-kakophonist",
            "unit-sorcerer"
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
      },
      "id": "enhancement-spearhead-striker",
      "termId": "emperors-children-enhancement-spearhead-striker",
      "ruleId": "enhancement-spearhead-striker",
      "detachmentId": "rapid-evisceration",
      "sourceBookId": "emperors-children",
      "legacyKey": "enhancement-spearhead-striker",
      "canonicalEnhancementId": "enhancement-spearhead-striker",
      "canonicalDetachmentId": "rapid-evisceration"
    },
    {
      "title": "Accomplished Tactician",
      "text": "EMPEROR’S CHILDREN INFANTRY model only. Once per turn, in your opponent’s Shooting phase , just after an enemy unit has shot, you can select one friendly EMPEROR’S CHILDREN unit within 9\" of the bearer that was hit by one or more of those attacks, then select one friendly TRANSPORT that unit is wholly within 6\" of and is able to embark within. That EMPEROR’S CHILDREN unit can embark within that Transport.",
      "value": 35,
      "detachment": "RAPID EVISCERATION",
      "tags": [],
      "owner": {
        "subject": "model",
        "selector": {
          "unitIds": [
            "unit-daemon-prince-of-slaanesh",
            "unit-daemon-prince-of-slaanesh-with-wings",
            "unit-lord-exultant",
            "unit-lord-kakophonist",
            "unit-sorcerer"
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
      },
      "id": "enhancement-accomplished-tactician",
      "termId": "emperors-children-enhancement-accomplished-tactician",
      "ruleId": "enhancement-accomplished-tactician",
      "detachmentId": "rapid-evisceration",
      "sourceBookId": "emperors-children",
      "legacyKey": "enhancement-accomplished-tactician",
      "canonicalEnhancementId": "enhancement-accomplished-tactician",
      "canonicalDetachmentId": "rapid-evisceration"
    },
    {
      "title": "Heretek Adept",
      "text": "EMPEROR’S CHILDREN INFANTRY model only. Once per battle round , when a saving throw is failed for a friendly EMPEROR’S CHILDREN VEHICLE model within 6\" of the bearer, you can change the Damage characteristic of that attack to 0.",
      "value": 35,
      "detachment": "RAPID EVISCERATION",
      "tags": [],
      "owner": {
        "subject": "model",
        "selector": {
          "unitIds": [
            "unit-daemon-prince-of-slaanesh",
            "unit-daemon-prince-of-slaanesh-with-wings",
            "unit-lord-exultant",
            "unit-lord-kakophonist",
            "unit-sorcerer"
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
      },
      "id": "enhancement-heretek-adept",
      "termId": "emperors-children-enhancement-heretek-adept",
      "ruleId": "enhancement-heretek-adept",
      "detachmentId": "rapid-evisceration",
      "sourceBookId": "emperors-children",
      "legacyKey": "enhancement-heretek-adept",
      "canonicalEnhancementId": "enhancement-heretek-adept",
      "canonicalDetachmentId": "rapid-evisceration"
    },
    {
      "title": "Euphoric Crown",
      "text": "LORD EXULTANT model only. This model’s melee attacks have +1 S.",
      "value": 20,
      "detachment": "FRENZIED HOST",
      "tags": [],
      "owner": {
        "subject": "model",
        "selector": {
          "unitIds": [
            "unit-lord-exultant"
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
      },
      "id": "enhancement-euphoric-crown",
      "sourcePages": [
        3
      ],
      "provenance": {
        "sourceId": "emperors-children-faction-pack-v1.1",
        "sourcePages": [
          3
        ]
      },
      "termId": "emperors-children-enhancement-euphoric-crown",
      "ruleId": "enhancement-euphoric-crown",
      "detachmentId": "frenzied-host",
      "sourceBookId": "emperors-children",
      "legacyKey": "enhancement-euphoric-crown",
      "canonicalEnhancementId": "enhancement-euphoric-crown",
      "canonicalDetachmentId": "frenzied-host"
    },
    {
      "title": "Howling Plate",
      "text": "LORD EXULTANT model only. This unit’s ranged attacks have +1 AP.",
      "value": 20,
      "detachment": "FRENZIED HOST",
      "tags": [],
      "owner": {
        "subject": "model",
        "selector": {
          "unitIds": [
            "unit-lord-exultant"
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
      },
      "id": "enhancement-howling-plate",
      "sourcePages": [
        3
      ],
      "provenance": {
        "sourceId": "emperors-children-faction-pack-v1.1",
        "sourcePages": [
          3
        ]
      },
      "termId": "emperors-children-enhancement-howling-plate",
      "ruleId": "enhancement-howling-plate",
      "detachmentId": "frenzied-host",
      "sourceBookId": "emperors-children",
      "legacyKey": "enhancement-howling-plate",
      "canonicalEnhancementId": "enhancement-howling-plate",
      "canonicalDetachmentId": "frenzied-host"
    },
    {
      "title": "Tears of the Phoenix",
      "text": "EMPEROR’S CHILDREN model only. Each time a model in the bearer’s unit makes a melee attack, you can ignore any or all modifiers to that attack’s Weapon Skill characteristic and any or all modifiers to the Hit roll and Wound roll.",
      "value": 25,
      "detachment": "COURT OF THE PHOENICIAN",
      "tags": [],
      "owner": {
        "subject": "model",
        "selector": {
          "unitIds": [
            "unit-daemon-prince-of-slaanesh",
            "unit-daemon-prince-of-slaanesh-with-wings",
            "unit-lord-exultant",
            "unit-lord-kakophonist",
            "unit-sorcerer"
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
      },
      "id": "enhancement-tears-of-the-phoenix",
      "sourcePages": [
        5
      ],
      "provenance": {
        "sourceId": "emperors-children-faction-pack-v1.1",
        "sourcePages": [
          5
        ]
      },
      "termId": "emperors-children-enhancement-tears-of-the-phoenix",
      "ruleId": "enhancement-tears-of-the-phoenix",
      "detachmentId": "court-of-the-phoenician",
      "sourceBookId": "emperors-children",
      "legacyKey": "enhancement-tears-of-the-phoenix",
      "canonicalEnhancementId": "enhancement-tears-of-the-phoenix",
      "canonicalDetachmentId": "court-of-the-phoenician"
    },
    {
      "title": "Exalted Patron",
      "text": "LORD EXULTANT model only. Add 1\" to the Move characteristic of the bearer.",
      "value": 15,
      "detachment": "COURT OF THE PHOENICIAN",
      "tags": [],
      "owner": {
        "subject": "model",
        "selector": {
          "unitIds": [
            "unit-lord-exultant"
          ],
          "noneKeywords": [
            "EPIC HERO"
          ],
          "leadingUnitIds": [
            "unit-flawless-blades"
          ]
        }
      },
      "assignment": {
        "maxOwners": 1,
        "enhancementChoices": 1,
        "payPointsPerOwner": true
      },
      "id": "enhancement-exalted-patron",
      "sourcePages": [
        5
      ],
      "provenance": {
        "sourceId": "emperors-children-faction-pack-v1.1",
        "sourcePages": [
          5
        ]
      },
      "termId": "emperors-children-enhancement-exalted-patron",
      "ruleId": "enhancement-exalted-patron",
      "detachmentId": "court-of-the-phoenician",
      "sourceBookId": "emperors-children",
      "legacyKey": "enhancement-exalted-patron",
      "mfmQualifiers": [
        {
          "id": "mfm-qualifier-2c135ed536a65870",
          "label": "LEADER: FLAWLESS BLADES",
          "recordType": "MFM_QUALIFIER",
          "aliases": [],
          "references": [
            "mfm-enhancement-c96e91c539b4419f"
          ],
          "provenance": {
            "sourceId": "emperors-children-mfm-v1.4",
            "sourceVersion": "v1.4",
            "currentness": "CURRENT",
            "currentnessCutoff": "2026-09-22",
            "sourceCaptureSha256": "C25ED3C996914E2AB9FCDC5A35A01BF89149A8AA4E1F39A2E42CA48AA2103D8B",
            "authority": "OFFICIAL_GAMES_WORKSHOP_LIVE_MFM",
            "sourceLocator": {
              "partition": "detachments.enhancements.qualifiers",
              "factionId": "emperors-children",
              "detachmentSourceTitle": "COURT OF THE PHOENICIAN",
              "sourceTitle": "Exalted Patron",
              "kind": "LEADER",
              "values": [
                "FLAWLESS BLADES"
              ]
            }
          },
          "factionId": "emperors-children",
          "ownerKind": "ENHANCEMENT",
          "ownerId": "mfm-enhancement-c96e91c539b4419f",
          "armyBookId": "emperors-children",
          "armyOwnerId": "enhancement-exalted-patron",
          "kind": "LEADER",
          "values": [
            "FLAWLESS BLADES"
          ]
        }
      ],
      "canonicalEnhancementId": "enhancement-exalted-patron",
      "canonicalDetachmentId": "court-of-the-phoenician"
    },
    {
      "title": "Soulstain Made Manifest",
      "text": "EMPEROR’S CHILDREN model only. At the start of the Fight phase, you can select one enemy unit within Engagement Range of the bearer; that unit must take a Battle-shock test, subtracting 1 from the result.",
      "value": 15,
      "detachment": "COURT OF THE PHOENICIAN",
      "tags": [],
      "owner": {
        "subject": "model",
        "selector": {
          "unitIds": [
            "unit-daemon-prince-of-slaanesh",
            "unit-daemon-prince-of-slaanesh-with-wings",
            "unit-lord-exultant",
            "unit-lord-kakophonist",
            "unit-sorcerer"
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
      },
      "id": "enhancement-soulstain-made-manifest",
      "sourcePages": [
        5
      ],
      "provenance": {
        "sourceId": "emperors-children-faction-pack-v1.1",
        "sourcePages": [
          5
        ]
      },
      "termId": "emperors-children-enhancement-soulstain-made-manifest",
      "ruleId": "enhancement-soulstain-made-manifest",
      "detachmentId": "court-of-the-phoenician",
      "sourceBookId": "emperors-children",
      "legacyKey": "enhancement-soulstain-made-manifest",
      "canonicalEnhancementId": "enhancement-soulstain-made-manifest",
      "canonicalDetachmentId": "court-of-the-phoenician"
    },
    {
      "title": "Spiritsliver",
      "text": "EMPEROR’S CHILDREN DAEMON PRINCE model only. Add 1 to the Strength and Attacks characteristics of the bearer’s melee weapons.",
      "value": 20,
      "detachment": "COURT OF THE PHOENICIAN",
      "tags": [],
      "owner": {
        "subject": "model",
        "selector": {
          "unitIds": [
            "unit-daemon-prince-of-slaanesh"
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
      },
      "id": "enhancement-spiritsliver",
      "sourcePages": [
        5
      ],
      "provenance": {
        "sourceId": "emperors-children-faction-pack-v1.1",
        "sourcePages": [
          5
        ]
      },
      "termId": "emperors-children-enhancement-spiritsliver",
      "ruleId": "enhancement-spiritsliver",
      "detachmentId": "court-of-the-phoenician",
      "sourceBookId": "emperors-children",
      "legacyKey": "enhancement-spiritsliver",
      "canonicalEnhancementId": "enhancement-spiritsliver",
      "canonicalDetachmentId": "court-of-the-phoenician"
    },
    {
      "title": "Eager Patrons",
      "text": "FLAWLESS BLADES unit only. This unit has +2\" M.",
      "value": 20,
      "detachment": "SPECTACLE OF SLAUGHTER",
      "tags": [
        "UPGRADE"
      ],
      "owner": {
        "subject": "unit",
        "selector": {
          "unitIds": [
            "unit-flawless-blades"
          ],
          "noneKeywords": []
        }
      },
      "assignment": {
        "maxOwners": 3,
        "enhancementChoices": 1,
        "payPointsPerOwner": true
      },
      "id": "enhancement-eager-patrons",
      "kind": "upgrade",
      "sourcePages": [
        4
      ],
      "provenance": {
        "sourceId": "emperors-children-faction-pack-v1.1",
        "sourcePages": [
          4
        ]
      },
      "termId": "emperors-children-enhancement-eager-patrons",
      "ruleId": "enhancement-eager-patrons",
      "detachmentId": "spectacle-of-slaughter",
      "sourceBookId": "emperors-children",
      "legacyKey": "enhancement-eager-patrons",
      "canonicalEnhancementId": "enhancement-eager-patrons",
      "canonicalDetachmentId": "spectacle-of-slaughter"
    },
    {
      "title": "Beguiling Grotesquerie",
      "text": "FLAWLESS BLADES unit only. Enemy units cannot target this unit with snap shooting attacks.",
      "value": 15,
      "detachment": "SPECTACLE OF SLAUGHTER",
      "tags": [
        "UPGRADE"
      ],
      "owner": {
        "subject": "unit",
        "selector": {
          "unitIds": [
            "unit-flawless-blades"
          ],
          "noneKeywords": []
        }
      },
      "assignment": {
        "maxOwners": 3,
        "enhancementChoices": 1,
        "payPointsPerOwner": true
      },
      "id": "enhancement-beguiling-grotesquerie",
      "kind": "upgrade",
      "sourcePages": [
        4
      ],
      "provenance": {
        "sourceId": "emperors-children-faction-pack-v1.1",
        "sourcePages": [
          4
        ]
      },
      "termId": "emperors-children-enhancement-beguiling-grotesquerie",
      "ruleId": "enhancement-beguiling-grotesquerie",
      "detachmentId": "spectacle-of-slaughter",
      "sourceBookId": "emperors-children",
      "legacyKey": "enhancement-beguiling-grotesquerie",
      "canonicalEnhancementId": "enhancement-beguiling-grotesquerie",
      "canonicalDetachmentId": "spectacle-of-slaughter"
    },
    {
      "title": "Cacophonic Accompaniment",
      "text": "LORD KAKOPHONIST model only. This model has Deep Strike. This unit’s ranged attacks have [IGNORES COVER].",
      "value": 20,
      "detachment": "ELEGANT BRUTES",
      "tags": [],
      "owner": {
        "subject": "model",
        "selector": {
          "unitIds": [
            "unit-lord-kakophonist"
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
      },
      "id": "enhancement-cacophonic-accompaniment",
      "sourcePages": [
        2
      ],
      "provenance": {
        "sourceId": "emperors-children-faction-pack-v1.1",
        "sourcePages": [
          2
        ]
      },
      "termId": "emperors-children-enhancement-cacophonic-accompaniment",
      "ruleId": "enhancement-cacophonic-accompaniment",
      "detachmentId": "elegant-brutes",
      "sourceBookId": "emperors-children",
      "legacyKey": "enhancement-cacophonic-accompaniment",
      "canonicalEnhancementId": "enhancement-cacophonic-accompaniment",
      "canonicalDetachmentId": "elegant-brutes"
    },
    {
      "title": "Frenzied Ferocity",
      "text": "EMPEROR’S CHILDREN TERMINATOR SQUAD unit only. This unit’s attacks have [SUSTAINED HITS 1].",
      "value": 15,
      "detachment": "ELEGANT BRUTES",
      "tags": [
        "UPGRADE"
      ],
      "owner": {
        "subject": "unit",
        "selector": {
          "unitIds": [
            "unit-chaos-terminators"
          ],
          "noneKeywords": []
        }
      },
      "assignment": {
        "maxOwners": 3,
        "enhancementChoices": 1,
        "payPointsPerOwner": true
      },
      "id": "enhancement-frenzied-ferocity",
      "kind": "upgrade",
      "sourcePages": [
        2
      ],
      "provenance": {
        "sourceId": "emperors-children-faction-pack-v1.1",
        "sourcePages": [
          2
        ]
      },
      "termId": "emperors-children-enhancement-frenzied-ferocity",
      "ruleId": "enhancement-frenzied-ferocity",
      "detachmentId": "elegant-brutes",
      "sourceBookId": "emperors-children",
      "legacyKey": "enhancement-frenzied-ferocity",
      "canonicalEnhancementId": "enhancement-frenzied-ferocity",
      "canonicalDetachmentId": "elegant-brutes"
    }
  ],
  "effectContracts": [
    {
      "canonicalRecordId": "emperors-children-ability-lord-of-the-host",
      "sourceKind": "ability",
      "sourceBookId": "emperors-children",
      "effectiveBookIds": [
        "emperors-children"
      ],
      "sourceUnitId": "unit-lord-exultant",
      "scope": "source",
      "selector": {
        "unitIds": [
          "unit-lord-exultant"
        ]
      },
      "clauses": [
        {
          "selector": {
            "on": "bodyguard",
            "allKeywords": [
              "BATTLELINE"
            ]
          },
          "conditions": [
            {
              "selector": {
                "on": "source",
                "sourceUnitIds": [
                  "unit-lord-exultant"
                ],
                "requiresLeading": true
              }
            }
          ],
          "operations": [
            {
              "id": "lord-host-infiltrators",
              "canonicalTarget": "core-infiltrators",
              "parameters": {
                "title": "Infiltrators"
              },
              "type": "ABILITY_GRANT"
            },
            {
              "id": "lord-host-scouts",
              "canonicalTarget": "core-scouts",
              "parameters": {
                "title": "Scouts 6\""
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
        "sourceId": "emperors-children-codex-transcription",
        "locator": "books/emperors-children/content/emperors-children-codex-parity.en.json#emperors-children-ability-lord-of-the-host"
      },
      "confidence": "SOURCE_LIMITED"
    },
    {
      "canonicalRecordId": "emperors-children-ability-obsessive-annunciation",
      "sourceKind": "ability",
      "sourceBookId": "emperors-children",
      "effectiveBookIds": [
        "emperors-children"
      ],
      "sourceUnitId": "unit-lord-kakophonist",
      "scope": "attached-group",
      "selector": {
        "unitIds": [
          "unit-lord-kakophonist"
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
                  "unit-lord-kakophonist"
                ],
                "requiresLeading": true
              }
            }
          ],
          "operations": [
            {
              "id": "obsessive-annunciation",
              "canonicalTarget": "ranged",
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
        "sourceId": "emperors-children-codex-transcription",
        "locator": "books/emperors-children/content/emperors-children-codex-parity.en.json#emperors-children-ability-obsessive-annunciation"
      },
      "confidence": "SOURCE_LIMITED"
    },
    {
      "canonicalRecordId": "emperors-children-ability-perfectionists",
      "sourceKind": "ability",
      "sourceBookId": "emperors-children",
      "effectiveBookIds": [
        "emperors-children"
      ],
      "sourceUnitId": "unit-lord-exultant",
      "scope": "attached-group",
      "selector": {
        "unitIds": [
          "unit-lord-exultant"
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
                  "unit-lord-exultant"
                ],
                "requiresLeading": true
              }
            }
          ],
          "operations": [
            {
              "id": "perfectionists-weapons",
              "canonicalTarget": "all",
              "parameters": {
                "tag": "LETHAL HITS",
                "termId": "core-lethal-hits"
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
        "sourceId": "emperors-children-codex-transcription",
        "locator": "books/emperors-children/content/emperors-children-codex-parity.en.json#emperors-children-ability-perfectionists"
      },
      "confidence": "SOURCE_LIMITED"
    },
    {
      "canonicalRecordId": "emperors-children-ability-warped-interference-psychic",
      "sourceKind": "ability",
      "sourceBookId": "emperors-children",
      "effectiveBookIds": [
        "emperors-children"
      ],
      "sourceUnitId": "unit-sorcerer",
      "scope": "bodyguard",
      "selector": {
        "unitIds": [
          "unit-sorcerer"
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
                  "unit-sorcerer"
                ],
                "requiresLeading": true
              }
            }
          ],
          "operations": [
            {
              "id": "canonical-emperors-children-ability-warped-interference-psychic",
              "canonicalTarget": "emperors-children-ability-warped-interference-psychic",
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
        "sourceId": "emperors-children-codex-transcription",
        "locator": "books/emperors-children/content/emperors-children-codex-parity.en.json#emperors-children-ability-warped-interference-psychic"
      },
      "confidence": "SOURCE_LIMITED"
    },
    {
      "canonicalRecordId": "emperors-children-detachment-rule-daemonic-empowerment",
      "sourceKind": "detachment-rule",
      "sourceBookId": "emperors-children",
      "effectiveBookIds": [
        "emperors-children"
      ],
      "detachmentId": "carnival-of-excess",
      "scope": "unit",
      "selector": {
        "any": [
          {
            "allKeywords": [
              "EMPEROR'S CHILDREN"
            ]
          },
          {
            "allKeywords": [
              "LEGIONS OF EXCESS"
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
              "id": "canonical-emperors-children-detachment-rule-daemonic-empowerment",
              "canonicalTarget": "emperors-children-detachment-rule-daemonic-empowerment",
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
        "sourceId": "emperors-children-codex-transcription",
        "locator": "books/emperors-children/content/emperors-children-codex-parity.en.json#emperors-children-detachment-rule-daemonic-empowerment"
      },
      "confidence": "SOURCE_LIMITED"
    },
    {
      "canonicalRecordId": "emperors-children-detachment-rule-eager-to-kill",
      "sourceKind": "detachment-rule",
      "sourceBookId": "emperors-children",
      "effectiveBookIds": [
        "emperors-children"
      ],
      "detachmentId": "elegant-brutes",
      "scope": "unit",
      "selector": {
        "unitIds": [
          "unit-chaos-terminators"
        ]
      },
      "clauses": [
        {
          "selector": {},
          "conditions": [],
          "operations": [
            {
              "id": "canonical-emperors-children-detachment-rule-eager-to-kill",
              "canonicalTarget": "emperors-children-detachment-rule-eager-to-kill",
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
        "sourceId": "emperors-children-codex-transcription",
        "locator": "books/emperors-children/content/emperors-children-codex-parity.en.json#emperors-children-detachment-rule-eager-to-kill"
      },
      "confidence": "SOURCE_LIMITED"
    },
    {
      "canonicalRecordId": "emperors-children-detachment-rule-entitled-to-victory",
      "sourceKind": "detachment-rule",
      "sourceBookId": "emperors-children",
      "effectiveBookIds": [
        "emperors-children"
      ],
      "detachmentId": "spectacle-of-slaughter",
      "scope": "unit",
      "selector": {
        "unitIds": [
          "unit-flawless-blades"
        ]
      },
      "clauses": [
        {
          "selector": {},
          "conditions": [],
          "operations": [
            {
              "id": "canonical-emperors-children-detachment-rule-entitled-to-victory",
              "canonicalTarget": "emperors-children-detachment-rule-entitled-to-victory",
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
        "sourceId": "emperors-children-codex-transcription",
        "locator": "books/emperors-children/content/emperors-children-codex-parity.en.json#emperors-children-detachment-rule-entitled-to-victory"
      },
      "confidence": "SOURCE_LIMITED"
    },
    {
      "canonicalRecordId": "emperors-children-detachment-rule-exquisite-swordsmanship",
      "sourceKind": "detachment-rule",
      "sourceBookId": "emperors-children",
      "effectiveBookIds": [
        "emperors-children"
      ],
      "detachmentId": "peerless-bladesmen",
      "scope": "unit",
      "selector": {
        "allKeywords": [
          "EMPEROR'S CHILDREN"
        ]
      },
      "clauses": [
        {
          "selector": {},
          "conditions": [],
          "operations": [
            {
              "id": "canonical-emperors-children-detachment-rule-exquisite-swordsmanship",
              "canonicalTarget": "emperors-children-detachment-rule-exquisite-swordsmanship",
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
        "sourceId": "emperors-children-codex-transcription",
        "locator": "books/emperors-children/content/emperors-children-codex-parity.en.json#emperors-children-detachment-rule-exquisite-swordsmanship"
      },
      "confidence": "SOURCE_LIMITED"
    },
    {
      "canonicalRecordId": "emperors-children-detachment-rule-frantic-focus",
      "sourceKind": "detachment-rule",
      "sourceBookId": "emperors-children",
      "effectiveBookIds": [
        "emperors-children"
      ],
      "detachmentId": "frenzied-host",
      "scope": "unit",
      "selector": {
        "allKeywords": [
          "BATTLELINE"
        ]
      },
      "clauses": [
        {
          "selector": {},
          "conditions": [],
          "operations": [
            {
              "id": "canonical-emperors-children-detachment-rule-frantic-focus",
              "canonicalTarget": "emperors-children-detachment-rule-frantic-focus",
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
        "sourceId": "emperors-children-codex-transcription",
        "locator": "books/emperors-children/content/emperors-children-codex-parity.en.json#emperors-children-detachment-rule-frantic-focus"
      },
      "confidence": "SOURCE_LIMITED"
    },
    {
      "canonicalRecordId": "emperors-children-detachment-rule-internal-rivalries",
      "sourceKind": "detachment-rule",
      "sourceBookId": "emperors-children",
      "effectiveBookIds": [
        "emperors-children"
      ],
      "detachmentId": "slaaneshs-chosen",
      "scope": "unit",
      "selector": {
        "all": [
          {
            "allKeywords": [
              "EMPEROR'S CHILDREN"
            ]
          },
          {
            "any": [
              {
                "allKeywords": [
                  "CHARACTER"
                ]
              },
              {
                "attachmentState": "leading"
              },
              {
                "attachmentState": "being-led"
              }
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
              "id": "canonical-emperors-children-detachment-rule-internal-rivalries",
              "canonicalTarget": "emperors-children-detachment-rule-internal-rivalries",
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
        "sourceId": "emperors-children-codex-transcription",
        "locator": "books/emperors-children/content/emperors-children-codex-parity.en.json#emperors-children-detachment-rule-internal-rivalries"
      },
      "confidence": "SOURCE_LIMITED"
    },
    {
      "canonicalRecordId": "emperors-children-detachment-rule-master-of-the-pageant",
      "sourceKind": "detachment-rule",
      "sourceBookId": "emperors-children",
      "effectiveBookIds": [
        "emperors-children"
      ],
      "detachmentId": "court-of-the-phoenician",
      "scope": "unit",
      "selector": {
        "unitIds": [
          "unit-fulgrim"
        ]
      },
      "clauses": [
        {
          "selector": {},
          "conditions": [],
          "operations": [
            {
              "id": "canonical-emperors-children-detachment-rule-master-of-the-pageant",
              "canonicalTarget": "emperors-children-detachment-rule-master-of-the-pageant",
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
        "sourceId": "emperors-children-faction-pack-v1.2",
        "locator": "books/emperors-children/content/emperors-children-faction-pack.en.json#emperors-children-detachment-rule-master-of-the-pageant"
      },
      "confidence": "VERIFIED_FROZEN"
    },
    {
      "canonicalRecordId": "emperors-children-detachment-rule-mechanised-murder",
      "sourceKind": "detachment-rule",
      "sourceBookId": "emperors-children",
      "effectiveBookIds": [
        "emperors-children"
      ],
      "detachmentId": "rapid-evisceration",
      "scope": "unit",
      "selector": {
        "allKeywords": [
          "EMPEROR'S CHILDREN"
        ]
      },
      "clauses": [
        {
          "selector": {},
          "conditions": [],
          "operations": [
            {
              "id": "canonical-emperors-children-detachment-rule-mechanised-murder",
              "canonicalTarget": "emperors-children-detachment-rule-mechanised-murder",
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
        "sourceId": "emperors-children-codex-transcription",
        "locator": "books/emperors-children/content/emperors-children-codex-parity.en.json#emperors-children-detachment-rule-mechanised-murder"
      },
      "confidence": "SOURCE_LIMITED"
    },
    {
      "canonicalRecordId": "emperors-children-detachment-rule-pledges-to-the-dark-prince",
      "sourceKind": "detachment-rule",
      "sourceBookId": "emperors-children",
      "effectiveBookIds": [
        "emperors-children"
      ],
      "detachmentId": "coterie-of-the-conceited",
      "scope": "unit",
      "selector": {
        "allKeywords": [
          "EMPEROR'S CHILDREN"
        ]
      },
      "clauses": [
        {
          "selector": {},
          "conditions": [],
          "operations": [
            {
              "id": "canonical-emperors-children-detachment-rule-pledges-to-the-dark-prince",
              "canonicalTarget": "emperors-children-detachment-rule-pledges-to-the-dark-prince",
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
        "sourceId": "emperors-children-codex-transcription",
        "locator": "books/emperors-children/content/emperors-children-codex-parity.en.json#emperors-children-detachment-rule-pledges-to-the-dark-prince"
      },
      "confidence": "SOURCE_LIMITED"
    },
    {
      "canonicalRecordId": "emperors-children-detachment-rule-quicksilver-grace",
      "sourceKind": "detachment-rule",
      "sourceBookId": "emperors-children",
      "effectiveBookIds": [
        "emperors-children"
      ],
      "detachmentId": "mercurial-host",
      "scope": "unit",
      "selector": {
        "allKeywords": [
          "EMPEROR'S CHILDREN"
        ]
      },
      "clauses": [
        {
          "selector": {},
          "conditions": [],
          "operations": [
            {
              "id": "canonical-emperors-children-detachment-rule-quicksilver-grace",
              "canonicalTarget": "emperors-children-detachment-rule-quicksilver-grace",
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
        "sourceId": "emperors-children-codex-transcription",
        "locator": "books/emperors-children/content/emperors-children-codex-parity.en.json#emperors-children-detachment-rule-quicksilver-grace"
      },
      "confidence": "SOURCE_LIMITED"
    },
    {
      "canonicalRecordId": "emperors-children-detachment-rule-sensational-performance",
      "sourceKind": "detachment-rule",
      "sourceBookId": "emperors-children",
      "effectiveBookIds": [
        "emperors-children"
      ],
      "detachmentId": "court-of-the-phoenician",
      "scope": "unit",
      "selector": {
        "allKeywords": [
          "EMPEROR'S CHILDREN"
        ]
      },
      "clauses": [
        {
          "selector": {},
          "conditions": [],
          "operations": [
            {
              "id": "canonical-emperors-children-detachment-rule-sensational-performance",
              "canonicalTarget": "emperors-children-detachment-rule-sensational-performance",
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
        "sourceId": "emperors-children-codex-transcription",
        "locator": "books/emperors-children/content/emperors-children-codex-parity.en.json#emperors-children-detachment-rule-sensational-performance"
      },
      "confidence": "SOURCE_LIMITED"
    },
    {
      "canonicalRecordId": "enhancement-blinding-speed",
      "sourceKind": "enhancement",
      "sourceBookId": "emperors-children",
      "effectiveBookIds": [
        "emperors-children"
      ],
      "detachmentId": "peerless-bladesmen",
      "scope": "bodyguard",
      "selector": {},
      "clauses": [
        {
          "selector": {},
          "conditions": [],
          "operations": [
            {
              "id": "canonical-enhancement-blinding-speed",
              "canonicalTarget": "enhancement-blinding-speed",
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
        "sourceId": "emperors-children-codex-transcription",
        "locator": "books/emperors-children/content/emperors-children-codex-parity.en.json#enhancement-blinding-speed"
      },
      "confidence": "SOURCE_LIMITED"
    },
    {
      "canonicalRecordId": "enhancement-cacophonic-accompaniment",
      "sourceKind": "enhancement",
      "sourceBookId": "emperors-children",
      "effectiveBookIds": [
        "emperors-children"
      ],
      "detachmentId": "elegant-brutes",
      "scope": "owner-or-attached-group",
      "selector": {},
      "clauses": [
        {
          "selector": {
            "targetRelation": "owner"
          },
          "conditions": [],
          "operations": [
            {
              "id": "cacophonic-deep-strike",
              "canonicalTarget": "core-deep-strike",
              "parameters": {
                "title": "Deep Strike"
              },
              "type": "ABILITY_GRANT"
            }
          ]
        },
        {
          "selector": {},
          "conditions": [],
          "operations": [
            {
              "id": "cacophonic-ignores-cover",
              "canonicalTarget": "ranged",
              "parameters": {
                "tag": "IGNORES COVER",
                "termId": "core-ignores-cover"
              },
              "type": "WEAPON_TAG_GRANT"
            }
          ]
        },
        {
          "selector": {
            "targetRelation": "bodyguard"
          },
          "conditions": [],
          "operations": [
            {
              "id": "canonical-enhancement-cacophonic-accompaniment",
              "canonicalTarget": "enhancement-cacophonic-accompaniment",
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
        "sourceId": "emperors-children-faction-pack-v1.2",
        "locator": "books/emperors-children/content/emperors-children-faction-pack.en.json#enhancement-cacophonic-accompaniment"
      },
      "confidence": "VERIFIED_FROZEN"
    },
    {
      "canonicalRecordId": "enhancement-distortion",
      "sourceKind": "enhancement",
      "sourceBookId": "emperors-children",
      "effectiveBookIds": [
        "emperors-children"
      ],
      "detachmentId": "peerless-bladesmen",
      "scope": "owner",
      "selector": {},
      "clauses": [
        {
          "selector": {},
          "conditions": [],
          "operations": [
            {
              "id": "distortion-attacks",
              "canonicalTarget": "melee",
              "parameters": {
                "delta": 1,
                "stat": "A"
              },
              "type": "WEAPON_CHARACTERISTIC_ADD"
            },
            {
              "id": "distortion-damage",
              "canonicalTarget": "melee",
              "parameters": {
                "delta": 1,
                "stat": "D"
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
        "sourceId": "emperors-children-codex-transcription",
        "locator": "books/emperors-children/content/emperors-children-codex-parity.en.json#enhancement-distortion"
      },
      "confidence": "SOURCE_LIMITED"
    },
    {
      "canonicalRecordId": "enhancement-eager-patrons",
      "sourceKind": "enhancement",
      "sourceBookId": "emperors-children",
      "effectiveBookIds": [
        "emperors-children"
      ],
      "detachmentId": "spectacle-of-slaughter",
      "scope": "owner",
      "selector": {},
      "clauses": [
        {
          "selector": {},
          "conditions": [],
          "operations": [
            {
              "id": "eager-patrons-move",
              "canonicalTarget": "M",
              "parameters": {
                "delta": 2
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
        "sourceId": "emperors-children-faction-pack-v1.2",
        "locator": "books/emperors-children/content/emperors-children-faction-pack.en.json#enhancement-eager-patrons"
      },
      "confidence": "VERIFIED_FROZEN"
    },
    {
      "canonicalRecordId": "enhancement-eager-to-prove",
      "sourceKind": "enhancement",
      "sourceBookId": "emperors-children",
      "effectiveBookIds": [
        "emperors-children"
      ],
      "detachmentId": "slaaneshs-chosen",
      "scope": "bodyguard",
      "selector": {},
      "clauses": [
        {
          "selector": {},
          "conditions": [],
          "operations": [
            {
              "id": "canonical-enhancement-eager-to-prove",
              "canonicalTarget": "enhancement-eager-to-prove",
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
        "sourceId": "emperors-children-codex-transcription",
        "locator": "books/emperors-children/content/emperors-children-codex-parity.en.json#enhancement-eager-to-prove"
      },
      "confidence": "SOURCE_LIMITED"
    },
    {
      "canonicalRecordId": "enhancement-empyric-suffusion",
      "sourceKind": "enhancement",
      "sourceBookId": "emperors-children",
      "effectiveBookIds": [
        "emperors-children"
      ],
      "detachmentId": "carnival-of-excess",
      "scope": "bodyguard",
      "selector": {},
      "clauses": [
        {
          "selector": {},
          "conditions": [],
          "operations": [
            {
              "id": "canonical-enhancement-empyric-suffusion",
              "canonicalTarget": "enhancement-empyric-suffusion",
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
        "sourceId": "emperors-children-codex-transcription",
        "locator": "books/emperors-children/content/emperors-children-codex-parity.en.json#enhancement-empyric-suffusion"
      },
      "confidence": "SOURCE_LIMITED"
    },
    {
      "canonicalRecordId": "enhancement-euphoric-crown",
      "sourceKind": "enhancement",
      "sourceBookId": "emperors-children",
      "effectiveBookIds": [
        "emperors-children"
      ],
      "detachmentId": "frenzied-host",
      "scope": "owner",
      "selector": {},
      "clauses": [
        {
          "selector": {},
          "conditions": [],
          "operations": [
            {
              "id": "euphoric-crown",
              "canonicalTarget": "melee",
              "parameters": {
                "delta": 1,
                "stat": "S"
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
        "sourceId": "emperors-children-faction-pack-v1.2",
        "locator": "books/emperors-children/content/emperors-children-faction-pack.en.json#enhancement-euphoric-crown"
      },
      "confidence": "VERIFIED_FROZEN"
    },
    {
      "canonicalRecordId": "enhancement-exalted-patron",
      "sourceKind": "enhancement",
      "sourceBookId": "emperors-children",
      "effectiveBookIds": [
        "emperors-children"
      ],
      "detachmentId": "court-of-the-phoenician",
      "scope": "owner",
      "selector": {},
      "clauses": [
        {
          "selector": {},
          "conditions": [],
          "operations": [
            {
              "id": "exalted-patron-move",
              "canonicalTarget": "M",
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
        "sourceId": "emperors-children-faction-pack-v1.2",
        "locator": "books/emperors-children/content/emperors-children-faction-pack.en.json#enhancement-exalted-patron"
      },
      "confidence": "VERIFIED_FROZEN"
    },
    {
      "canonicalRecordId": "enhancement-faultless-opportunist",
      "sourceKind": "enhancement",
      "sourceBookId": "emperors-children",
      "effectiveBookIds": [
        "emperors-children"
      ],
      "detachmentId": "peerless-bladesmen",
      "scope": "bodyguard",
      "selector": {},
      "clauses": [
        {
          "selector": {},
          "conditions": [],
          "operations": [
            {
              "id": "canonical-enhancement-faultless-opportunist",
              "canonicalTarget": "enhancement-faultless-opportunist",
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
        "sourceId": "emperors-children-codex-transcription",
        "locator": "books/emperors-children/content/emperors-children-codex-parity.en.json#enhancement-faultless-opportunist"
      },
      "confidence": "SOURCE_LIMITED"
    },
    {
      "canonicalRecordId": "enhancement-frenzied-ferocity",
      "sourceKind": "enhancement",
      "sourceBookId": "emperors-children",
      "effectiveBookIds": [
        "emperors-children"
      ],
      "detachmentId": "elegant-brutes",
      "scope": "owner",
      "selector": {},
      "clauses": [
        {
          "selector": {},
          "conditions": [],
          "operations": [
            {
              "id": "frenzied-ferocity",
              "canonicalTarget": "all",
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
        "sourceId": "emperors-children-faction-pack-v1.2",
        "locator": "books/emperors-children/content/emperors-children-faction-pack.en.json#enhancement-frenzied-ferocity"
      },
      "confidence": "VERIFIED_FROZEN"
    },
    {
      "canonicalRecordId": "enhancement-howling-plate",
      "sourceKind": "enhancement",
      "sourceBookId": "emperors-children",
      "effectiveBookIds": [
        "emperors-children"
      ],
      "detachmentId": "frenzied-host",
      "scope": "owner-or-attached-group",
      "selector": {},
      "clauses": [
        {
          "selector": {},
          "conditions": [],
          "operations": [
            {
              "id": "howling-plate",
              "canonicalTarget": "ranged",
              "parameters": {
                "delta": -1,
                "stat": "AP"
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
        "sourceId": "emperors-children-faction-pack-v1.2",
        "locator": "books/emperors-children/content/emperors-children-faction-pack.en.json#enhancement-howling-plate"
      },
      "confidence": "VERIFIED_FROZEN"
    },
    {
      "canonicalRecordId": "enhancement-intoxicating-musk",
      "sourceKind": "enhancement",
      "sourceBookId": "emperors-children",
      "effectiveBookIds": [
        "emperors-children"
      ],
      "detachmentId": "mercurial-host",
      "scope": "bodyguard",
      "selector": {},
      "clauses": [
        {
          "selector": {},
          "conditions": [],
          "operations": [
            {
              "id": "canonical-enhancement-intoxicating-musk",
              "canonicalTarget": "enhancement-intoxicating-musk",
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
        "sourceId": "emperors-children-codex-transcription",
        "locator": "books/emperors-children/content/emperors-children-codex-parity.en.json#enhancement-intoxicating-musk"
      },
      "confidence": "SOURCE_LIMITED"
    },
    {
      "canonicalRecordId": "enhancement-loathsome-dexterity",
      "sourceKind": "enhancement",
      "sourceBookId": "emperors-children",
      "effectiveBookIds": [
        "emperors-children"
      ],
      "detachmentId": "mercurial-host",
      "scope": "bodyguard",
      "selector": {},
      "clauses": [
        {
          "selector": {},
          "conditions": [],
          "operations": [
            {
              "id": "canonical-enhancement-loathsome-dexterity",
              "canonicalTarget": "enhancement-loathsome-dexterity",
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
        "sourceId": "emperors-children-codex-transcription",
        "locator": "books/emperors-children/content/emperors-children-codex-parity.en.json#enhancement-loathsome-dexterity"
      },
      "confidence": "SOURCE_LIMITED"
    },
    {
      "canonicalRecordId": "enhancement-pledge-of-dark-glory",
      "sourceKind": "enhancement",
      "sourceBookId": "emperors-children",
      "effectiveBookIds": [
        "emperors-children"
      ],
      "detachmentId": "coterie-of-the-conceited",
      "scope": "attached-group",
      "selector": {},
      "clauses": [
        {
          "selector": {},
          "conditions": [
            {
              "selector": {
                "detachmentIds": [
                  "coterie-of-the-conceited"
                ]
              }
            },
            {
              "selector": {
                "on": "owner",
                "requiresLeading": true
              }
            }
          ],
          "operations": [
            {
              "id": "pledge-dark-glory-leadership",
              "canonicalTarget": "Ld",
              "parameters": {
                "delta": -1
              },
              "type": "CHARACTERISTIC_ADD"
            },
            {
              "id": "pledge-dark-glory-objective-control",
              "canonicalTarget": "OC",
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
        "sourceId": "emperors-children-codex-transcription",
        "locator": "books/emperors-children/content/emperors-children-codex-parity.en.json#enhancement-pledge-of-dark-glory"
      },
      "confidence": "SOURCE_LIMITED"
    },
    {
      "canonicalRecordId": "enhancement-pledge-of-unholy-fortune",
      "sourceKind": "enhancement",
      "sourceBookId": "emperors-children",
      "effectiveBookIds": [
        "emperors-children"
      ],
      "detachmentId": "coterie-of-the-conceited",
      "scope": "bodyguard",
      "selector": {},
      "clauses": [
        {
          "selector": {},
          "conditions": [],
          "operations": [
            {
              "id": "canonical-enhancement-pledge-of-unholy-fortune",
              "canonicalTarget": "enhancement-pledge-of-unholy-fortune",
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
        "sourceId": "emperors-children-codex-transcription",
        "locator": "books/emperors-children/content/emperors-children-codex-parity.en.json#enhancement-pledge-of-unholy-fortune"
      },
      "confidence": "SOURCE_LIMITED"
    },
    {
      "canonicalRecordId": "enhancement-proud-and-vainglorious",
      "sourceKind": "enhancement",
      "sourceBookId": "emperors-children",
      "effectiveBookIds": [
        "emperors-children"
      ],
      "detachmentId": "slaaneshs-chosen",
      "scope": "bodyguard",
      "selector": {},
      "clauses": [
        {
          "selector": {},
          "conditions": [],
          "operations": [
            {
              "id": "canonical-enhancement-proud-and-vainglorious",
              "canonicalTarget": "enhancement-proud-and-vainglorious",
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
        "sourceId": "emperors-children-codex-transcription",
        "locator": "books/emperors-children/content/emperors-children-codex-parity.en.json#enhancement-proud-and-vainglorious"
      },
      "confidence": "SOURCE_LIMITED"
    },
    {
      "canonicalRecordId": "enhancement-repulsed-by-weakness",
      "sourceKind": "enhancement",
      "sourceBookId": "emperors-children",
      "effectiveBookIds": [
        "emperors-children"
      ],
      "detachmentId": "slaaneshs-chosen",
      "scope": "bodyguard",
      "selector": {},
      "clauses": [
        {
          "selector": {},
          "conditions": [],
          "operations": [
            {
              "id": "canonical-enhancement-repulsed-by-weakness",
              "canonicalTarget": "enhancement-repulsed-by-weakness",
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
        "sourceId": "emperors-children-codex-transcription",
        "locator": "books/emperors-children/content/emperors-children-codex-parity.en.json#enhancement-repulsed-by-weakness"
      },
      "confidence": "SOURCE_LIMITED"
    },
    {
      "canonicalRecordId": "enhancement-slayer-of-champions",
      "sourceKind": "enhancement",
      "sourceBookId": "emperors-children",
      "effectiveBookIds": [
        "emperors-children"
      ],
      "detachmentId": "slaaneshs-chosen",
      "scope": "owner",
      "selector": {},
      "clauses": [
        {
          "selector": {},
          "conditions": [],
          "operations": [
            {
              "id": "slayer-of-champions-precision",
              "canonicalTarget": "melee",
              "parameters": {
                "tag": "PRECISION",
                "termId": "core-precision"
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
        "sourceId": "emperors-children-codex-transcription",
        "locator": "books/emperors-children/content/emperors-children-codex-parity.en.json#enhancement-slayer-of-champions"
      },
      "confidence": "SOURCE_LIMITED"
    },
    {
      "canonicalRecordId": "enhancement-spearhead-striker",
      "sourceKind": "enhancement",
      "sourceBookId": "emperors-children",
      "effectiveBookIds": [
        "emperors-children"
      ],
      "detachmentId": "rapid-evisceration",
      "scope": "bodyguard",
      "selector": {},
      "clauses": [
        {
          "selector": {},
          "conditions": [],
          "operations": [
            {
              "id": "canonical-enhancement-spearhead-striker",
              "canonicalTarget": "enhancement-spearhead-striker",
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
        "sourceId": "emperors-children-codex-transcription",
        "locator": "books/emperors-children/content/emperors-children-codex-parity.en.json#enhancement-spearhead-striker"
      },
      "confidence": "SOURCE_LIMITED"
    },
    {
      "canonicalRecordId": "enhancement-spiritsliver",
      "sourceKind": "enhancement",
      "sourceBookId": "emperors-children",
      "effectiveBookIds": [
        "emperors-children"
      ],
      "detachmentId": "court-of-the-phoenician",
      "scope": "owner",
      "selector": {},
      "clauses": [
        {
          "selector": {},
          "conditions": [],
          "operations": [
            {
              "id": "spiritsliver-strength",
              "canonicalTarget": "melee",
              "parameters": {
                "delta": 1,
                "stat": "S"
              },
              "type": "WEAPON_CHARACTERISTIC_ADD"
            },
            {
              "id": "spiritsliver-attacks",
              "canonicalTarget": "melee",
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
        "sourceId": "emperors-children-faction-pack-v1.2",
        "locator": "books/emperors-children/content/emperors-children-faction-pack.en.json#enhancement-spiritsliver"
      },
      "confidence": "VERIFIED_FROZEN"
    },
    {
      "canonicalRecordId": "enhancement-steeped-in-suffering",
      "sourceKind": "enhancement",
      "sourceBookId": "emperors-children",
      "effectiveBookIds": [
        "emperors-children"
      ],
      "detachmentId": "mercurial-host",
      "scope": "bodyguard",
      "selector": {},
      "clauses": [
        {
          "selector": {},
          "conditions": [],
          "operations": [
            {
              "id": "canonical-enhancement-steeped-in-suffering",
              "canonicalTarget": "enhancement-steeped-in-suffering",
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
        "sourceId": "emperors-children-codex-transcription",
        "locator": "books/emperors-children/content/emperors-children-codex-parity.en.json#enhancement-steeped-in-suffering"
      },
      "confidence": "SOURCE_LIMITED"
    },
    {
      "canonicalRecordId": "enhancement-tears-of-the-phoenix",
      "sourceKind": "enhancement",
      "sourceBookId": "emperors-children",
      "effectiveBookIds": [
        "emperors-children"
      ],
      "detachmentId": "court-of-the-phoenician",
      "scope": "bodyguard",
      "selector": {},
      "clauses": [
        {
          "selector": {},
          "conditions": [],
          "operations": [
            {
              "id": "canonical-enhancement-tears-of-the-phoenix",
              "canonicalTarget": "enhancement-tears-of-the-phoenix",
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
        "sourceId": "emperors-children-faction-pack-v1.2",
        "locator": "books/emperors-children/content/emperors-children-faction-pack.en.json#enhancement-tears-of-the-phoenix"
      },
      "confidence": "VERIFIED_FROZEN"
    },
    {
      "canonicalRecordId": "enhancement-warp-walker",
      "sourceKind": "enhancement",
      "sourceBookId": "emperors-children",
      "effectiveBookIds": [
        "emperors-children"
      ],
      "detachmentId": "carnival-of-excess",
      "scope": "bodyguard",
      "selector": {},
      "clauses": [
        {
          "selector": {},
          "conditions": [],
          "operations": [
            {
              "id": "canonical-enhancement-warp-walker",
              "canonicalTarget": "enhancement-warp-walker",
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
        "sourceId": "emperors-children-codex-transcription",
        "locator": "books/emperors-children/content/emperors-children-codex-parity.en.json#enhancement-warp-walker"
      },
      "confidence": "SOURCE_LIMITED"
    },
    {
      "canonicalRecordId": "emperors-children-equipment-daemonic-icon",
      "sourceKind": "selected-wargear",
      "sourceBookId": "emperors-children",
      "effectiveBookIds": [
        "emperors-children"
      ],
      "scope": "owner",
      "selector": {
        "selectedWargearAbilityIds": [
          "unit-daemonettes-wargear-ability-b3dad0463e",
          "unit-seekers-wargear-ability-b3dad0463e"
        ],
        "equipmentFamilyId": "emperors-children-equipment-family-daemonic-icon"
      },
      "clauses": [
        {
          "selector": {},
          "conditions": [],
          "operations": [
            {
              "id": "daemonic-icon-leadership",
              "canonicalTarget": "Ld",
              "parameters": {
                "to": "6+"
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
        "sourceId": "emperors-children-codex-transcription",
        "locator": "books/emperors-children/content/emperors-children-codex-parity.en.json#emperors-children-equipment-daemonic-icon"
      },
      "confidence": "SOURCE_LIMITED"
    },
    {
      "canonicalRecordId": "emperors-children-equipment-shining-aegis",
      "sourceKind": "selected-wargear",
      "sourceBookId": "emperors-children",
      "effectiveBookIds": [
        "emperors-children"
      ],
      "scope": "owner",
      "selector": {
        "selectedWargearAbilityIds": [
          "unit-keeper-of-secrets-wargear-ability-8c94fe64e9"
        ],
        "equipmentFamilyId": "emperors-children-equipment-family-shining-aegis"
      },
      "clauses": [
        {
          "selector": {},
          "conditions": [],
          "operations": [
            {
              "id": "shining-aegis-save",
              "canonicalTarget": "Sv",
              "parameters": {
                "to": "3+"
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
        "sourceId": "emperors-children-codex-transcription",
        "locator": "books/emperors-children/content/emperors-children-codex-parity.en.json#emperors-children-equipment-shining-aegis"
      },
      "confidence": "SOURCE_LIMITED"
    }
  ],
  "rosterLegality": {
    "schema": "wh40k-roster-legality-contracts/v1",
    "bookId": "emperors-children",
    "enhancementQualifiers": [
      {
        "id": "exalted-patron-leading-flawless-blades",
        "sourceRuleId": "enhancement-exalted-patron",
        "enhancementId": "enhancement-exalted-patron",
        "qualifier": {
          "kind": "LEADER",
          "values": [
            "FLAWLESS BLADES"
          ]
        },
        "targetUnitIds": [
          "unit-flawless-blades"
        ]
      }
    ],
    "mandatoryWarlords": [
      {
        "id": "fulgrim-supreme-commander",
        "sourceRuleId": "emperors-children-ability-supreme-commander",
        "unitIds": [
          "unit-fulgrim"
        ]
      }
    ],
    "pointCaps": [
      {
        "id": "daemonic-empowerment-legions-of-excess-cap",
        "sourceRuleId": "emperors-children-detachment-rule-daemonic-empowerment",
        "detachmentIds": [
          "carnival-of-excess"
        ],
        "selector": {
          "allKeywords": [
            "LEGIONS OF EXCESS"
          ]
        },
        "limits": [
          {
            "pointsLimit": 1000,
            "maxPoints": 500
          },
          {
            "pointsLimit": 2000,
            "maxPoints": 1000
          },
          {
            "pointsLimit": 3000,
            "maxPoints": 1500
          }
        ]
      }
    ],
    "warlordProhibitions": [
      {
        "id": "daemonic-empowerment-legions-of-excess-warlord",
        "sourceRuleId": "emperors-children-detachment-rule-daemonic-empowerment",
        "detachmentIds": [
          "carnival-of-excess"
        ],
        "selector": {
          "allKeywords": [
            "LEGIONS OF EXCESS"
          ]
        }
      }
    ]
  }
});
window.WH_BOOK_ROSTER_ENHANCEMENTS=Object.freeze({
  "empyric suffusion": {
    "title": "Empyric Suffusion",
    "text": "EMPEROR’S CHILDREN model only. When you target this unit with the Heroic Intervention stratagem, that use is -1 CP.",
    "value": 15,
    "detachment": "CARNIVAL OF EXCESS",
    "tags": [],
    "owner": {
      "subject": "model",
      "selector": {
        "unitIds": [
          "unit-daemon-prince-of-slaanesh",
          "unit-daemon-prince-of-slaanesh-with-wings",
          "unit-lord-exultant",
          "unit-lord-kakophonist",
          "unit-sorcerer"
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
    },
    "ruleId": "enhancement-empyric-suffusion",
    "detachmentId": "carnival-of-excess"
  },
  "dark blessings": {
    "title": "Dark Blessings",
    "text": "EMPEROR’S CHILDREN INFANTRY model only. Once per battle, just after an enemy unit has selected its targets, the bearer can use this Enhancement. If it does, until the end of the phase, the bearer has a 3+ invulnerable save.",
    "value": 10,
    "detachment": "CARNIVAL OF EXCESS",
    "tags": [],
    "owner": {
      "subject": "model",
      "selector": {
        "unitIds": [
          "unit-daemon-prince-of-slaanesh",
          "unit-daemon-prince-of-slaanesh-with-wings",
          "unit-lord-exultant",
          "unit-lord-kakophonist",
          "unit-sorcerer"
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
    },
    "ruleId": "enhancement-dark-blessings",
    "detachmentId": "carnival-of-excess"
  },
  "possessed blade": {
    "title": "Possessed Blade",
    "text": "EMPEROR’S CHILDREN model only. At the start of the battle, select one melee weapon equipped by the bearer; add 1 to the Attacks characteristic of that weapon. In addition, each time the bearer is selected to fight, it can use this Enhancement. If it does, while resolving those attacks, add 1 to the Damage characteristic of that weapon and that weapon has the [devastating wounds] and [hazardous] abilities.",
    "value": 35,
    "detachment": "CARNIVAL OF EXCESS",
    "tags": [],
    "owner": {
      "subject": "model",
      "selector": {
        "unitIds": [
          "unit-daemon-prince-of-slaanesh",
          "unit-daemon-prince-of-slaanesh-with-wings",
          "unit-lord-exultant",
          "unit-lord-kakophonist",
          "unit-sorcerer"
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
    },
    "ruleId": "enhancement-possessed-blade",
    "detachmentId": "carnival-of-excess"
  },
  "warp walker": {
    "title": "Warp Walker",
    "text": "EMPEROR’S CHILDREN or KEEPER OF SECRETS model only. Each time the bearer’s unit Advances, do not make an Advance roll . Instead, until the end of the phase, add 6\" to the Move characteristic of models in that unit. Each time a model in the bearer’s unit makes a Normal , Advance or Fall Back move , it can move through enemy models. When doing so, it can move within Engagement Range of such models but cannot end that move within Engagement Range of them, and any Desperate Escape test is automatically passed.",
    "value": 35,
    "detachment": "CARNIVAL OF EXCESS",
    "tags": [],
    "owner": {
      "subject": "model",
      "selector": {
        "unitIds": [
          "unit-daemon-prince-of-slaanesh",
          "unit-daemon-prince-of-slaanesh-with-wings",
          "unit-lord-exultant",
          "unit-lord-kakophonist",
          "unit-sorcerer"
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
    },
    "ruleId": "enhancement-warp-walker",
    "detachmentId": "carnival-of-excess"
  },
  "pledge of eternal servitude": {
    "title": "Pledge of Eternal Servitude",
    "text": "EMPEROR’S CHILDREN model only. The first time the bearer is destroyed, take a Leadership test for the bearer at the end of the phase. If that test is passed, set the bearer back up on the battlefield, as close as possible to where it was destroyed and not within Engagement Range of one or more enemy units, with D6 wounds remaining (up to its Wounds characteristic).",
    "value": 25,
    "detachment": "COTERIE OF THE CONCEITED",
    "tags": [],
    "owner": {
      "subject": "model",
      "selector": {
        "unitIds": [
          "unit-daemon-prince-of-slaanesh",
          "unit-daemon-prince-of-slaanesh-with-wings",
          "unit-lord-exultant",
          "unit-lord-kakophonist",
          "unit-sorcerer"
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
    },
    "ruleId": "enhancement-pledge-of-eternal-servitude",
    "detachmentId": "coterie-of-the-conceited"
  },
  "pledge of dark glory": {
    "title": "Pledge of Dark Glory",
    "text": "EMPEROR’S CHILDREN model only. While the bearer is leading a unit, improve the Leadership and Objective Control characteristics of models in that unit by 1.",
    "value": 25,
    "detachment": "COTERIE OF THE CONCEITED",
    "tags": [],
    "owner": {
      "subject": "model",
      "selector": {
        "unitIds": [
          "unit-daemon-prince-of-slaanesh",
          "unit-daemon-prince-of-slaanesh-with-wings",
          "unit-lord-exultant",
          "unit-lord-kakophonist",
          "unit-sorcerer"
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
    },
    "ruleId": "enhancement-pledge-of-dark-glory",
    "detachmentId": "coterie-of-the-conceited"
  },
  "pledge of mortal pain": {
    "title": "Pledge of Mortal Pain",
    "text": "EMPEROR’S CHILDREN model only. At the start of your Shooting phase , select one enemy unit within 12\" of and visible to the bearer. That unit must take a Leadership test , subtracting 2 from the result if it is Battle-shocked : if failed, that enemy unit suffers 3 mortal wounds .",
    "value": 15,
    "detachment": "COTERIE OF THE CONCEITED",
    "tags": [],
    "owner": {
      "subject": "model",
      "selector": {
        "unitIds": [
          "unit-daemon-prince-of-slaanesh",
          "unit-daemon-prince-of-slaanesh-with-wings",
          "unit-lord-exultant",
          "unit-lord-kakophonist",
          "unit-sorcerer"
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
    },
    "ruleId": "enhancement-pledge-of-mortal-pain",
    "detachmentId": "coterie-of-the-conceited"
  },
  "pledge of unholy fortune": {
    "title": "Pledge of Unholy Fortune",
    "text": "EMPEROR’S CHILDREN model only. Once per turn, just after making a Hit roll , a Wound roll or a saving throw for a model in the bearer’s unit, if the bearer is not Battle-shocked , it can use this Enhancement. If it does, treat the result as an unmodified roll of 6 instead.",
    "value": 30,
    "detachment": "COTERIE OF THE CONCEITED",
    "tags": [],
    "owner": {
      "subject": "model",
      "selector": {
        "unitIds": [
          "unit-daemon-prince-of-slaanesh",
          "unit-daemon-prince-of-slaanesh-with-wings",
          "unit-lord-exultant",
          "unit-lord-kakophonist",
          "unit-sorcerer"
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
    },
    "ruleId": "enhancement-pledge-of-unholy-fortune",
    "detachmentId": "coterie-of-the-conceited"
  },
  "steeped in suffering": {
    "title": "Steeped in Suffering",
    "text": "EMPEROR’S CHILDREN model only. Each time a model in the bearer’s unit makes an attack that targets an enemy unit below its Starting Strength , add 1 to the Hit roll . If that target is also Below Half-strength , add 1 to the Wound roll as well.",
    "value": 20,
    "detachment": "MERCURIAL HOST",
    "tags": [],
    "owner": {
      "subject": "model",
      "selector": {
        "unitIds": [
          "unit-daemon-prince-of-slaanesh",
          "unit-daemon-prince-of-slaanesh-with-wings",
          "unit-lord-exultant",
          "unit-lord-kakophonist",
          "unit-sorcerer"
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
    },
    "ruleId": "enhancement-steeped-in-suffering",
    "detachmentId": "mercurial-host"
  },
  "intoxicating musk": {
    "title": "Intoxicating Musk",
    "text": "EMPEROR’S CHILDREN model only. Each time a melee attack targets the bearer’s unit, if the Strength characteristic of that attack is greater than the Toughness characteristic of that unit, subtract 1 from the Wound roll .",
    "value": 20,
    "detachment": "MERCURIAL HOST",
    "tags": [],
    "owner": {
      "subject": "model",
      "selector": {
        "unitIds": [
          "unit-daemon-prince-of-slaanesh",
          "unit-daemon-prince-of-slaanesh-with-wings",
          "unit-lord-exultant",
          "unit-lord-kakophonist",
          "unit-sorcerer"
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
    },
    "ruleId": "enhancement-intoxicating-musk",
    "detachmentId": "mercurial-host"
  },
  "tactical perfection": {
    "title": "Tactical Perfection",
    "text": "EMPEROR’S CHILDREN model only. After both players have deployed their armies, select up to two EMPEROR’S CHILDREN units from your army and redeploy them. When doing so, you can set those units up in Strategic Reserves if you wish, regardless of how many units are already in Strategic Reserves.",
    "value": 15,
    "detachment": "MERCURIAL HOST",
    "tags": [],
    "owner": {
      "subject": "model",
      "selector": {
        "unitIds": [
          "unit-daemon-prince-of-slaanesh",
          "unit-daemon-prince-of-slaanesh-with-wings",
          "unit-lord-exultant",
          "unit-lord-kakophonist",
          "unit-sorcerer"
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
    },
    "ruleId": "enhancement-tactical-perfection",
    "detachmentId": "mercurial-host"
  },
  "loathsome dexterity": {
    "title": "Loathsome Dexterity",
    "text": "EMPEROR’S CHILDREN model only. Each time a model in the bearer’s unit makes a Normal , Advance or Fall Back move , it can move through enemy models. When doing so, it can move within Engagement Range of such models but cannot end that move within Engagement Range of them, and any Desperate Escape test is automatically passed.",
    "value": 10,
    "detachment": "MERCURIAL HOST",
    "tags": [],
    "owner": {
      "subject": "model",
      "selector": {
        "unitIds": [
          "unit-daemon-prince-of-slaanesh",
          "unit-daemon-prince-of-slaanesh-with-wings",
          "unit-lord-exultant",
          "unit-lord-kakophonist",
          "unit-sorcerer"
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
    },
    "ruleId": "enhancement-loathsome-dexterity",
    "detachmentId": "mercurial-host"
  },
  "faultless opportunist": {
    "title": "Faultless Opportunist",
    "text": "EMPEROR’S CHILDREN model only. You can target this unit with the Heroic Intervention stratagem, regardless of any other uses of that stratagem this phase. If you do: That use is -1 CP. That use does not prevent any uses of that stratagem on other units this phase.",
    "value": 15,
    "detachment": "PEERLESS BLADESMEN",
    "tags": [],
    "owner": {
      "subject": "model",
      "selector": {
        "unitIds": [
          "unit-daemon-prince-of-slaanesh",
          "unit-daemon-prince-of-slaanesh-with-wings",
          "unit-lord-exultant",
          "unit-lord-kakophonist",
          "unit-sorcerer"
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
    },
    "ruleId": "enhancement-faultless-opportunist",
    "detachmentId": "peerless-bladesmen"
  },
  "blinding speed": {
    "title": "Blinding Speed",
    "text": "EMPEROR’S CHILDREN model only. Once per battle, at the start of the Fight phase , the bearer can use this Enhancement. If it does, until the end of the phase, models in the bearer’s unit have the Fights First ability.",
    "value": 25,
    "detachment": "PEERLESS BLADESMEN",
    "tags": [],
    "owner": {
      "subject": "model",
      "selector": {
        "unitIds": [
          "unit-daemon-prince-of-slaanesh",
          "unit-daemon-prince-of-slaanesh-with-wings",
          "unit-lord-exultant",
          "unit-lord-kakophonist",
          "unit-sorcerer"
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
    },
    "ruleId": "enhancement-blinding-speed",
    "detachmentId": "peerless-bladesmen"
  },
  "distortion": {
    "title": "Distortion",
    "text": "EMPEROR’S CHILDREN model only. Add 1 to the Attacks and Damage characteristics of melee weapons equipped by the bearer.",
    "value": 25,
    "detachment": "PEERLESS BLADESMEN",
    "tags": [],
    "owner": {
      "subject": "model",
      "selector": {
        "unitIds": [
          "unit-daemon-prince-of-slaanesh",
          "unit-daemon-prince-of-slaanesh-with-wings",
          "unit-lord-exultant",
          "unit-lord-kakophonist",
          "unit-sorcerer"
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
    },
    "ruleId": "enhancement-distortion",
    "detachmentId": "peerless-bladesmen"
  },
  "rise to the challenge": {
    "title": "Rise to the Challenge",
    "text": "EMPEROR’S CHILDREN INFANTRY model only. Once per battle, at the end of the Fight phase , if the bearer is within Engagement Range of three or more enemy models, it can use this Enhancement. If it does, the bearer can fight one additional time. When doing so, you can select one ability using the Exquisite Swordsmanship Detachment rule to apply to those attacks.",
    "value": 30,
    "detachment": "PEERLESS BLADESMEN",
    "tags": [],
    "owner": {
      "subject": "model",
      "selector": {
        "unitIds": [
          "unit-daemon-prince-of-slaanesh",
          "unit-daemon-prince-of-slaanesh-with-wings",
          "unit-lord-exultant",
          "unit-lord-kakophonist",
          "unit-sorcerer"
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
    },
    "ruleId": "enhancement-rise-to-the-challenge",
    "detachmentId": "peerless-bladesmen"
  },
  "eager to prove": {
    "title": "Eager to Prove",
    "text": "EMPEROR’S CHILDREN model only. You can re-roll Charge rolls made for the bearer’s unit. While the bearer’s unit is your army’s Favoured Champions , add 2\" to the Move characteristic of models in that unit.",
    "value": 15,
    "detachment": "SLAANESH’S CHOSEN",
    "tags": [],
    "owner": {
      "subject": "model",
      "selector": {
        "unitIds": [
          "unit-daemon-prince-of-slaanesh",
          "unit-daemon-prince-of-slaanesh-with-wings",
          "unit-lord-exultant",
          "unit-lord-kakophonist",
          "unit-sorcerer"
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
    },
    "ruleId": "enhancement-eager-to-prove",
    "detachmentId": "slaaneshs-chosen"
  },
  "repulsed by weakness": {
    "title": "Repulsed by Weakness",
    "text": "EMPEROR’S CHILDREN model only. Each time an enemy unit (excluding MONSTERS and VEHICLES ) within Engagement Range of the bearer’s unit Falls Back , models in that enemy unit must take Desperate Escape tests . When doing so, if the bearer’s unit is your army’s Favoured Champions , subtract 1 from each of those Desperate Escape tests.",
    "value": 25,
    "detachment": "SLAANESH’S CHOSEN",
    "tags": [],
    "owner": {
      "subject": "model",
      "selector": {
        "unitIds": [
          "unit-daemon-prince-of-slaanesh",
          "unit-daemon-prince-of-slaanesh-with-wings",
          "unit-lord-exultant",
          "unit-lord-kakophonist",
          "unit-sorcerer"
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
    },
    "ruleId": "enhancement-repulsed-by-weakness",
    "detachmentId": "slaaneshs-chosen"
  },
  "proud and vainglorious": {
    "title": "Proud and Vainglorious",
    "text": "EMPEROR’S CHILDREN model only. You can re-roll Battle-shock and Leadership tests taken for the bearer’s unit. While the bearer’s unit is your army’s Favoured Champions , add 1 to the Objective Control characteristic of models in that unit.",
    "value": 20,
    "detachment": "SLAANESH’S CHOSEN",
    "tags": [],
    "owner": {
      "subject": "model",
      "selector": {
        "unitIds": [
          "unit-daemon-prince-of-slaanesh",
          "unit-daemon-prince-of-slaanesh-with-wings",
          "unit-lord-exultant",
          "unit-lord-kakophonist",
          "unit-sorcerer"
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
    },
    "ruleId": "enhancement-proud-and-vainglorious",
    "detachmentId": "slaaneshs-chosen"
  },
  "slayer of champions": {
    "title": "Slayer of Champions",
    "text": "EMPEROR’S CHILDREN model only. The bearer’s melee weapons have the [PRECISION] ability, and each time the bearer makes a melee attack that targets a CHARACTER unit, improve the Strength and Armour Penetration characteristics of that attack by 1.",
    "value": 15,
    "detachment": "SLAANESH’S CHOSEN",
    "tags": [],
    "owner": {
      "subject": "model",
      "selector": {
        "unitIds": [
          "unit-daemon-prince-of-slaanesh",
          "unit-daemon-prince-of-slaanesh-with-wings",
          "unit-lord-exultant",
          "unit-lord-kakophonist",
          "unit-sorcerer"
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
    },
    "ruleId": "enhancement-slayer-of-champions",
    "detachmentId": "slaaneshs-chosen"
  },
  "sublime prescience": {
    "title": "Sublime Prescience",
    "text": "EMPEROR’S CHILDREN INFANTRY model only. Once per turn, in your Movement phase , the bearer can use this Enhancement. If it does, select one friendly EMPEROR’S CHILDREN TRANSPORT that is in Strategic Reserves . Until the end of the phase, for the purposes of setting up that TRANSPORT on the battlefield, treat the current battle round number as being one higher than it actually is.",
    "value": 25,
    "detachment": "RAPID EVISCERATION",
    "tags": [],
    "owner": {
      "subject": "model",
      "selector": {
        "unitIds": [
          "unit-daemon-prince-of-slaanesh",
          "unit-daemon-prince-of-slaanesh-with-wings",
          "unit-lord-exultant",
          "unit-lord-kakophonist",
          "unit-sorcerer"
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
    },
    "ruleId": "enhancement-sublime-prescience",
    "detachmentId": "rapid-evisceration"
  },
  "spearhead striker": {
    "title": "Spearhead Striker",
    "text": "EMPEROR’S CHILDREN INFANTRY model only. Each time the bearer disembarks from a TRANSPORT , until the end of the turn, you can re-roll Charge rolls made for the bearer’s unit and enemy units cannot use the Fire Overwatch Stratagem to shoot at the bearer’s unit.",
    "value": 20,
    "detachment": "RAPID EVISCERATION",
    "tags": [],
    "owner": {
      "subject": "model",
      "selector": {
        "unitIds": [
          "unit-daemon-prince-of-slaanesh",
          "unit-daemon-prince-of-slaanesh-with-wings",
          "unit-lord-exultant",
          "unit-lord-kakophonist",
          "unit-sorcerer"
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
    },
    "ruleId": "enhancement-spearhead-striker",
    "detachmentId": "rapid-evisceration"
  },
  "accomplished tactician": {
    "title": "Accomplished Tactician",
    "text": "EMPEROR’S CHILDREN INFANTRY model only. Once per turn, in your opponent’s Shooting phase , just after an enemy unit has shot, you can select one friendly EMPEROR’S CHILDREN unit within 9\" of the bearer that was hit by one or more of those attacks, then select one friendly TRANSPORT that unit is wholly within 6\" of and is able to embark within. That EMPEROR’S CHILDREN unit can embark within that Transport.",
    "value": 35,
    "detachment": "RAPID EVISCERATION",
    "tags": [],
    "owner": {
      "subject": "model",
      "selector": {
        "unitIds": [
          "unit-daemon-prince-of-slaanesh",
          "unit-daemon-prince-of-slaanesh-with-wings",
          "unit-lord-exultant",
          "unit-lord-kakophonist",
          "unit-sorcerer"
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
    },
    "ruleId": "enhancement-accomplished-tactician",
    "detachmentId": "rapid-evisceration"
  },
  "heretek adept": {
    "title": "Heretek Adept",
    "text": "EMPEROR’S CHILDREN INFANTRY model only. Once per battle round , when a saving throw is failed for a friendly EMPEROR’S CHILDREN VEHICLE model within 6\" of the bearer, you can change the Damage characteristic of that attack to 0.",
    "value": 35,
    "detachment": "RAPID EVISCERATION",
    "tags": [],
    "owner": {
      "subject": "model",
      "selector": {
        "unitIds": [
          "unit-daemon-prince-of-slaanesh",
          "unit-daemon-prince-of-slaanesh-with-wings",
          "unit-lord-exultant",
          "unit-lord-kakophonist",
          "unit-sorcerer"
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
    },
    "ruleId": "enhancement-heretek-adept",
    "detachmentId": "rapid-evisceration"
  },
  "euphoric crown": {
    "title": "Euphoric Crown",
    "text": "LORD EXULTANT model only. This model’s melee attacks have +1 S.",
    "value": 20,
    "detachment": "FRENZIED HOST",
    "tags": [],
    "owner": {
      "subject": "model",
      "selector": {
        "unitIds": [
          "unit-lord-exultant"
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
    },
    "ruleId": "enhancement-euphoric-crown",
    "detachmentId": "frenzied-host"
  },
  "howling plate": {
    "title": "Howling Plate",
    "text": "LORD EXULTANT model only. This unit’s ranged attacks have +1 AP.",
    "value": 20,
    "detachment": "FRENZIED HOST",
    "tags": [],
    "owner": {
      "subject": "model",
      "selector": {
        "unitIds": [
          "unit-lord-exultant"
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
    },
    "ruleId": "enhancement-howling-plate",
    "detachmentId": "frenzied-host"
  },
  "tears of the phoenix": {
    "title": "Tears of the Phoenix",
    "text": "EMPEROR’S CHILDREN model only. Each time a model in the bearer’s unit makes a melee attack, you can ignore any or all modifiers to that attack’s Weapon Skill characteristic and any or all modifiers to the Hit roll and Wound roll.",
    "value": 25,
    "detachment": "COURT OF THE PHOENICIAN",
    "tags": [],
    "owner": {
      "subject": "model",
      "selector": {
        "unitIds": [
          "unit-daemon-prince-of-slaanesh",
          "unit-daemon-prince-of-slaanesh-with-wings",
          "unit-lord-exultant",
          "unit-lord-kakophonist",
          "unit-sorcerer"
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
    },
    "ruleId": "enhancement-tears-of-the-phoenix",
    "detachmentId": "court-of-the-phoenician"
  },
  "exalted patron": {
    "title": "Exalted Patron",
    "text": "LORD EXULTANT model only. Add 1\" to the Move characteristic of the bearer.",
    "value": 15,
    "detachment": "COURT OF THE PHOENICIAN",
    "tags": [],
    "owner": {
      "subject": "model",
      "selector": {
        "unitIds": [
          "unit-lord-exultant"
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
    },
    "ruleId": "enhancement-exalted-patron",
    "detachmentId": "court-of-the-phoenician"
  },
  "soulstain made manifest": {
    "title": "Soulstain Made Manifest",
    "text": "EMPEROR’S CHILDREN model only. At the start of the Fight phase, you can select one enemy unit within Engagement Range of the bearer; that unit must take a Battle-shock test, subtracting 1 from the result.",
    "value": 15,
    "detachment": "COURT OF THE PHOENICIAN",
    "tags": [],
    "owner": {
      "subject": "model",
      "selector": {
        "unitIds": [
          "unit-daemon-prince-of-slaanesh",
          "unit-daemon-prince-of-slaanesh-with-wings",
          "unit-lord-exultant",
          "unit-lord-kakophonist",
          "unit-sorcerer"
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
    },
    "ruleId": "enhancement-soulstain-made-manifest",
    "detachmentId": "court-of-the-phoenician"
  },
  "spiritsliver": {
    "title": "Spiritsliver",
    "text": "EMPEROR’S CHILDREN DAEMON PRINCE model only. Add 1 to the Strength and Attacks characteristics of the bearer’s melee weapons.",
    "value": 20,
    "detachment": "COURT OF THE PHOENICIAN",
    "tags": [],
    "owner": {
      "subject": "model",
      "selector": {
        "unitIds": [
          "unit-daemon-prince-of-slaanesh"
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
    },
    "ruleId": "enhancement-spiritsliver",
    "detachmentId": "court-of-the-phoenician"
  },
  "eager patrons": {
    "title": "Eager Patrons",
    "text": "FLAWLESS BLADES unit only. This unit has +2\" M.",
    "value": null,
    "detachment": "SPECTACLE OF SLAUGHTER",
    "tags": [
      "UPGRADE"
    ],
    "owner": {
      "subject": "unit",
      "selector": {
        "unitIds": [
          "unit-flawless-blades"
        ],
        "noneKeywords": []
      }
    },
    "assignment": {
      "maxOwners": 3,
      "enhancementChoices": 1,
      "payPointsPerOwner": true
    },
    "ruleId": "enhancement-eager-patrons",
    "detachmentId": "spectacle-of-slaughter"
  },
  "beguiling grotesquerie": {
    "title": "Beguiling Grotesquerie",
    "text": "FLAWLESS BLADES unit only. Enemy units cannot target this unit with snap shooting attacks.",
    "value": null,
    "detachment": "SPECTACLE OF SLAUGHTER",
    "tags": [
      "UPGRADE"
    ],
    "owner": {
      "subject": "unit",
      "selector": {
        "unitIds": [
          "unit-flawless-blades"
        ],
        "noneKeywords": []
      }
    },
    "assignment": {
      "maxOwners": 3,
      "enhancementChoices": 1,
      "payPointsPerOwner": true
    },
    "ruleId": "enhancement-beguiling-grotesquerie",
    "detachmentId": "spectacle-of-slaughter"
  },
  "cacophonic accompaniment": {
    "title": "Cacophonic Accompaniment",
    "text": "LORD KAKOPHONIST model only. This model has Deep Strike. This unit’s ranged attacks have [IGNORES COVER].",
    "value": 20,
    "detachment": "ELEGANT BRUTES",
    "tags": [],
    "owner": {
      "subject": "model",
      "selector": {
        "unitIds": [
          "unit-lord-kakophonist"
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
    },
    "ruleId": "enhancement-cacophonic-accompaniment",
    "detachmentId": "elegant-brutes"
  },
  "frenzied ferocity": {
    "title": "Frenzied Ferocity",
    "text": "EMPEROR’S CHILDREN TERMINATOR SQUAD unit only. This unit’s attacks have [SUSTAINED HITS 1].",
    "value": null,
    "detachment": "ELEGANT BRUTES",
    "tags": [
      "UPGRADE"
    ],
    "owner": {
      "subject": "unit",
      "selector": {
        "unitIds": [
          "unit-chaos-terminators"
        ],
        "noneKeywords": []
      }
    },
    "assignment": {
      "maxOwners": 3,
      "enhancementChoices": 1,
      "payPointsPerOwner": true
    },
    "ruleId": "enhancement-frenzied-ferocity",
    "detachmentId": "elegant-brutes"
  }
});

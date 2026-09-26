window.WH_BOOK_ROSTER_CATALOG=Object.freeze({
  "schema": "wh40k-army-roster-catalog/v1",
  "book": {
    "id": "adeptus-mechanicus",
    "title": "Adeptus Mechanicus",
    "factionKeyword": "ADEPTUS MECHANICUS",
    "parentBookId": null,
    "dependencies": []
  },
  "units": [
    {
      "id": "unit-skitarii-rangers",
      "title": "Skitarii Rangers",
      "sourceBookId": "adeptus-mechanicus",
      "sourceLayer": "Codex transcription",
      "intrinsicKeywords": [
        "Rangers",
        "Imperium",
        "Adeptus Mechanicus",
        "Infantry",
        "Skitarii",
        "Battleline"
      ],
      "relations": {
        "canLead": [],
        "canSupport": [],
        "canBeLedBy": [
          {
            "unitId": "unit-tech-priest-dominus",
            "maxCharacters": 2
          },
          {
            "unitId": "unit-tech-priest-enginseer",
            "maxCharacters": 2
          },
          {
            "unitId": "unit-tech-priest-manipulus",
            "maxCharacters": 2
          }
        ],
        "canBeSupportedBy": [
          {
            "unitId": "unit-skitarii-marshal",
            "maxCharacters": 2
          },
          {
            "unitId": "unit-technoarcheologist",
            "maxCharacters": 2
          }
        ]
      },
      "ruleFacts": {
        "relations": {
          "canLead": [],
          "canSupport": [],
          "canBeLedBy": [
            {
              "unitId": "unit-tech-priest-dominus",
              "maxCharacters": 2
            },
            {
              "unitId": "unit-tech-priest-enginseer",
              "maxCharacters": 2
            },
            {
              "unitId": "unit-tech-priest-manipulus",
              "maxCharacters": 2
            }
          ],
          "canBeSupportedBy": [
            {
              "unitId": "unit-skitarii-marshal",
              "maxCharacters": 2
            },
            {
              "unitId": "unit-technoarcheologist",
              "maxCharacters": 2
            }
          ]
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
          "Invulnerable": "5+"
        },
        "abilities": [
          {
            "id": "datasheet-objective-scouted",
            "sectionId": "datasheet-objective-scouted",
            "title": "Objective Scouted",
            "text": "At the end of your Command phase, if this unit is within range of an objective marker you control, that objective marker remains under your control, even if you have no models within range of it, until your opponent controls it at the start or end of any turn.",
            "sourceUnitId": "unit-skitarii-rangers"
          },
          {
            "id": "core-scouts",
            "sectionId": "core-scouts",
            "title": "Scouts 6\"",
            "text": "",
            "sourceUnitId": "unit-skitarii-rangers"
          },
          {
            "id": "doctrina-imperatives",
            "sectionId": "doctrina-imperatives",
            "title": "Doctrina Imperatives",
            "text": "At the start of the battle round, you can select one of the Doctrina Imperatives below. Until the end of the battle round, that Doctrina Imperative is active for your army, and all units from your army that have the Doctrina Imperatives ability gain the relevant abilities shown below.\n\nPROTECTOR IMPERATIVE\n■ Ranged weapons equipped by models in this unit have the [HEAVY] ability.\n■ Improve the Ballistic Skill characteristic of ranged weapons equipped by models in this unit by 1.\n■ Each time a melee attack targets this unit, if this unit has the Battleline keyword and/or it is within 6\" of one or more friendly Adeptus Mechanicus Battleline units, subtract 1 from the Hit roll.\n\nCONQUEROR IMPERATIVE\n■ Ranged weapons equipped by models in this unit have the [ASSAULT] ability.\n■ Improve the Weapon Skill characteristic of melee weapons equipped by models in this unit by 1.\n■ Each time a model in this unit makes an attack, if this unit has the Battleline keyword and/or it is within 6\" of one or more friendly Adeptus Mechanicus Battleline units, improve the Armour Penetration characteristic of that attack by 1.",
            "sourceUnitId": "unit-skitarii-rangers"
          }
        ],
        "models": [
          {
            "id": "unit-skitarii-rangers-model-9be412b31a",
            "title": "Skitarii Ranger Alpha",
            "aliases": [
              "Skitarii Ranger Alpha"
            ],
            "legacyIds": [
              "unit-skitarii-rangers-model-skitarii-ranger-alpha"
            ]
          },
          {
            "id": "unit-skitarii-rangers-model-9c3ba13355",
            "title": "Skitarii Ranger",
            "aliases": [
              "Skitarii Ranger",
              "Skitarii Rangers"
            ],
            "legacyIds": [
              "unit-skitarii-rangers-model-skitarii-ranger-2"
            ]
          }
        ],
        "selections": [
          {
            "id": "unit-skitarii-rangers-selection-alpha-combat-weapon",
            "title": "Alpha combat weapon",
            "aliases": [
              "Alpha combat weapon"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-skitarii-rangers-profile-f4fa54e843"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-skitarii-rangers-selection-galvanic-rifle",
            "title": "Galvanic rifle",
            "aliases": [
              "Galvanic rifle"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-skitarii-rangers-profile-f99b94b080"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-skitarii-rangers-selection-mechanicus-pistol",
            "title": "Mechanicus pistol",
            "aliases": [
              "Mechanicus pistol"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-skitarii-rangers-profile-8a7f265f02"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-skitarii-rangers-selection-close-combat-weapon",
            "title": "Close combat weapon",
            "aliases": [
              "Close combat weapon"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-skitarii-rangers-profile-a3d11c7b0e"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-skitarii-rangers-selection-transuranic-arquebus",
            "title": "Transuranic arquebus",
            "aliases": [
              "Transuranic arquebus"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-skitarii-rangers-profile-e39782ff83"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-skitarii-rangers-selection-arc-rifle",
            "title": "Arc rifle",
            "aliases": [
              "Arc rifle"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-skitarii-rangers-profile-2a957ff0ca"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-skitarii-rangers-selection-plasma-caliver-supercharge",
            "title": "➤ Plasma caliver - supercharge",
            "aliases": [
              "➤ Plasma caliver - supercharge"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-skitarii-rangers-profile-502ab08010"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-skitarii-rangers-selection-plasma-caliver-standard",
            "title": "➤ Plasma caliver - standard",
            "aliases": [
              "➤ Plasma caliver - standard"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-skitarii-rangers-profile-d8be5b4fc3"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-skitarii-rangers-weapon-family-plasma-caliver-selection",
            "title": "➤ Plasma caliver",
            "aliases": [
              "➤ Plasma caliver"
            ],
            "kind": "weapon",
            "familyId": "unit-skitarii-rangers-weapon-family-plasma-caliver",
            "profileIds": [
              "unit-skitarii-rangers-profile-502ab08010",
              "unit-skitarii-rangers-profile-d8be5b4fc3"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-skitarii-rangers-selection-enhanced-data-tether",
            "title": "Enhanced data-tether",
            "aliases": [
              "Enhanced data-tether"
            ],
            "kind": "wargear",
            "profileIds": [],
            "wargearAbilityIds": [
              "unit-skitarii-rangers-wargear-ability-893f3b727c"
            ]
          },
          {
            "id": "unit-skitarii-rangers-selection-omnispex",
            "title": "Omnispex",
            "aliases": [
              "Omnispex"
            ],
            "kind": "wargear",
            "profileIds": [],
            "wargearAbilityIds": [
              "unit-skitarii-rangers-wargear-ability-2e4de9ef20"
            ]
          }
        ],
        "weaponFamilies": [
          {
            "id": "unit-skitarii-rangers-weapon-family-plasma-caliver",
            "title": "➤ Plasma caliver",
            "aliases": [
              "➤ Plasma caliver"
            ],
            "profileIds": [
              "unit-skitarii-rangers-profile-502ab08010",
              "unit-skitarii-rangers-profile-d8be5b4fc3"
            ],
            "ambiguousAlias": false
          }
        ],
        "weaponProfiles": [
          {
            "id": "unit-skitarii-rangers-profile-f4fa54e843",
            "legacyIds": [
              "unit-skitarii-rangers-profile-alpha-combat-weapon-melee"
            ],
            "title": "Alpha combat weapon",
            "mode": "melee",
            "range": "Melee",
            "a": "2",
            "skill": "4+",
            "s": "5",
            "ap": "-1",
            "d": "1",
            "abilities": "",
            "sourceSelectionIds": [
              "unit-skitarii-rangers-selection-alpha-combat-weapon"
            ]
          },
          {
            "id": "unit-skitarii-rangers-profile-f99b94b080",
            "legacyIds": [
              "unit-skitarii-rangers-profile-galvanic-rifle-ranged-2"
            ],
            "title": "Galvanic rifle",
            "mode": "ranged",
            "range": "30\"",
            "a": "2",
            "skill": "4+",
            "s": "4",
            "ap": "0",
            "d": "1",
            "abilities": "",
            "sourceSelectionIds": [
              "unit-skitarii-rangers-selection-galvanic-rifle"
            ]
          },
          {
            "id": "unit-skitarii-rangers-profile-8a7f265f02",
            "legacyIds": [
              "unit-skitarii-rangers-profile-mechanicus-pistol-ranged-3"
            ],
            "title": "Mechanicus pistol",
            "mode": "ranged",
            "range": "12\"",
            "a": "1",
            "skill": "4+",
            "s": "6",
            "ap": "-1",
            "d": "1",
            "abilities": "Devastating Wounds, Pistol",
            "sourceSelectionIds": [
              "unit-skitarii-rangers-selection-mechanicus-pistol"
            ]
          },
          {
            "id": "unit-skitarii-rangers-profile-a3d11c7b0e",
            "legacyIds": [
              "unit-skitarii-rangers-profile-close-combat-weapon-melee-4"
            ],
            "title": "Close combat weapon",
            "mode": "melee",
            "range": "Melee",
            "a": "1",
            "skill": "4+",
            "s": "3",
            "ap": "0",
            "d": "1",
            "abilities": "",
            "sourceSelectionIds": [
              "unit-skitarii-rangers-selection-close-combat-weapon"
            ]
          },
          {
            "id": "unit-skitarii-rangers-profile-e39782ff83",
            "legacyIds": [
              "unit-skitarii-rangers-profile-transuranic-arquebus-ranged-5"
            ],
            "title": "Transuranic arquebus",
            "mode": "ranged",
            "range": "36\"",
            "a": "1",
            "skill": "4+",
            "s": "7",
            "ap": "-2",
            "d": "D3",
            "abilities": "Heavy, Precision",
            "sourceSelectionIds": [
              "unit-skitarii-rangers-selection-transuranic-arquebus"
            ]
          },
          {
            "id": "unit-skitarii-rangers-profile-2a957ff0ca",
            "legacyIds": [
              "unit-skitarii-rangers-profile-arc-rifle-ranged-6"
            ],
            "title": "Arc rifle",
            "mode": "ranged",
            "range": "30\"",
            "a": "1",
            "skill": "4+",
            "s": "8",
            "ap": "-1",
            "d": "D3",
            "abilities": "Anti-Vehicle 4+, Devastating Wounds, Rapid Fire 1",
            "sourceSelectionIds": [
              "unit-skitarii-rangers-selection-arc-rifle"
            ]
          },
          {
            "id": "unit-skitarii-rangers-profile-502ab08010",
            "legacyIds": [
              "unit-skitarii-rangers-profile-plasma-caliver-supercharge-ranged-7"
            ],
            "title": "➤ Plasma caliver - supercharge",
            "mode": "ranged",
            "range": "30\"",
            "a": "2",
            "skill": "4+",
            "s": "8",
            "ap": "-3",
            "d": "2",
            "abilities": "Hazardous",
            "sourceSelectionIds": [
              "unit-skitarii-rangers-selection-plasma-caliver-supercharge",
              "unit-skitarii-rangers-weapon-family-plasma-caliver-selection"
            ]
          },
          {
            "id": "unit-skitarii-rangers-profile-d8be5b4fc3",
            "legacyIds": [
              "unit-skitarii-rangers-profile-plasma-caliver-standard-ranged-8"
            ],
            "title": "➤ Plasma caliver - standard",
            "mode": "ranged",
            "range": "30\"",
            "a": "2",
            "skill": "4+",
            "s": "7",
            "ap": "-2",
            "d": "1",
            "abilities": "",
            "sourceSelectionIds": [
              "unit-skitarii-rangers-selection-plasma-caliver-standard",
              "unit-skitarii-rangers-weapon-family-plasma-caliver-selection"
            ]
          }
        ],
        "wargearAbilities": [
          {
            "id": "unit-skitarii-rangers-wargear-ability-893f3b727c",
            "sectionId": "unit-skitarii-rangers-wargear-ability-893f3b727c",
            "title": "Enhanced data-tether",
            "text": "Each time you select the bearer’s unit\nas the target of a Stratagem, roll one D6: on a 5+, you gain 1CP.",
            "sourceUnitId": "unit-skitarii-rangers",
            "legacyIds": [
              "unit-skitarii-rangers-wargear-ability-enhanced-data-tether"
            ],
            "requiredSelectionIds": [
              "unit-skitarii-rangers-selection-enhanced-data-tether"
            ]
          },
          {
            "id": "unit-skitarii-rangers-wargear-ability-2e4de9ef20",
            "sectionId": "unit-skitarii-rangers-wargear-ability-2e4de9ef20",
            "title": "Omnispex",
            "text": "Ranged weapons equipped by models in the bearer’s unit have the IGNORES COVER ability.",
            "sourceUnitId": "unit-skitarii-rangers",
            "legacyIds": [
              "unit-skitarii-rangers-wargear-ability-omnispex-2"
            ],
            "requiredSelectionIds": [
              "unit-skitarii-rangers-selection-omnispex"
            ]
          }
        ]
      }
    },
    {
      "id": "unit-skitarii-vanguard",
      "title": "Skitarii Vanguard",
      "sourceBookId": "adeptus-mechanicus",
      "sourceLayer": "Codex transcription",
      "intrinsicKeywords": [
        "Vanguard",
        "Imperium",
        "Adeptus Mechanicus",
        "Infantry",
        "Skitarii",
        "Battleline"
      ],
      "relations": {
        "canLead": [],
        "canSupport": [],
        "canBeLedBy": [
          {
            "unitId": "unit-tech-priest-dominus",
            "maxCharacters": 2
          },
          {
            "unitId": "unit-tech-priest-enginseer",
            "maxCharacters": 2
          },
          {
            "unitId": "unit-tech-priest-manipulus",
            "maxCharacters": 2
          }
        ],
        "canBeSupportedBy": [
          {
            "unitId": "unit-skitarii-marshal",
            "maxCharacters": 2
          },
          {
            "unitId": "unit-technoarcheologist",
            "maxCharacters": 2
          }
        ]
      },
      "ruleFacts": {
        "relations": {
          "canLead": [],
          "canSupport": [],
          "canBeLedBy": [
            {
              "unitId": "unit-tech-priest-dominus",
              "maxCharacters": 2
            },
            {
              "unitId": "unit-tech-priest-enginseer",
              "maxCharacters": 2
            },
            {
              "unitId": "unit-tech-priest-manipulus",
              "maxCharacters": 2
            }
          ],
          "canBeSupportedBy": [
            {
              "unitId": "unit-skitarii-marshal",
              "maxCharacters": 2
            },
            {
              "unitId": "unit-technoarcheologist",
              "maxCharacters": 2
            }
          ]
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
          "Invulnerable": "5+"
        },
        "abilities": [
          {
            "id": "datasheet-rad-saturation-aura",
            "sectionId": "datasheet-rad-saturation-aura",
            "title": "Rad-saturation (Aura)",
            "text": "While an enemy unit (excluding Vehicle units) is within 3\" of this unit, subtract 1 from the Objective Control characteristic of models in that unit.",
            "sourceUnitId": "unit-skitarii-vanguard"
          },
          {
            "id": "doctrina-imperatives",
            "sectionId": "doctrina-imperatives",
            "title": "Doctrina Imperatives",
            "text": "At the start of the battle round, you can select one of the Doctrina Imperatives below. Until the end of the battle round, that Doctrina Imperative is active for your army, and all units from your army that have the Doctrina Imperatives ability gain the relevant abilities shown below.\n\nPROTECTOR IMPERATIVE\n■ Ranged weapons equipped by models in this unit have the [HEAVY] ability.\n■ Improve the Ballistic Skill characteristic of ranged weapons equipped by models in this unit by 1.\n■ Each time a melee attack targets this unit, if this unit has the Battleline keyword and/or it is within 6\" of one or more friendly Adeptus Mechanicus Battleline units, subtract 1 from the Hit roll.\n\nCONQUEROR IMPERATIVE\n■ Ranged weapons equipped by models in this unit have the [ASSAULT] ability.\n■ Improve the Weapon Skill characteristic of melee weapons equipped by models in this unit by 1.\n■ Each time a model in this unit makes an attack, if this unit has the Battleline keyword and/or it is within 6\" of one or more friendly Adeptus Mechanicus Battleline units, improve the Armour Penetration characteristic of that attack by 1.",
            "sourceUnitId": "unit-skitarii-vanguard"
          }
        ],
        "models": [
          {
            "id": "unit-skitarii-vanguard-model-2156948b48",
            "title": "Skitarii Vanguard Alpha",
            "aliases": [
              "Skitarii Vanguard Alpha"
            ],
            "legacyIds": [
              "unit-skitarii-vanguard-model-skitarii-vanguard-alpha"
            ]
          },
          {
            "id": "unit-skitarii-vanguard-model-03abab7285",
            "title": "Skitarii Vanguard",
            "aliases": [
              "Skitarii Vanguard"
            ],
            "legacyIds": [
              "unit-skitarii-vanguard-model-skitarii-vanguard-2"
            ]
          }
        ],
        "selections": [
          {
            "id": "unit-skitarii-vanguard-selection-alpha-combat-weapon",
            "title": "Alpha combat weapon",
            "aliases": [
              "Alpha combat weapon"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-skitarii-vanguard-profile-f4fa54e843"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-skitarii-vanguard-selection-radium-carbine",
            "title": "Radium carbine",
            "aliases": [
              "Radium carbine"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-skitarii-vanguard-profile-c1982b3bbe"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-skitarii-vanguard-selection-mechanicus-pistol",
            "title": "Mechanicus pistol",
            "aliases": [
              "Mechanicus pistol"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-skitarii-vanguard-profile-8a7f265f02"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-skitarii-vanguard-selection-close-combat-weapon",
            "title": "Close combat weapon",
            "aliases": [
              "Close combat weapon"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-skitarii-vanguard-profile-a3d11c7b0e"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-skitarii-vanguard-selection-transuranic-arquebus",
            "title": "Transuranic arquebus",
            "aliases": [
              "Transuranic arquebus"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-skitarii-vanguard-profile-e39782ff83"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-skitarii-vanguard-selection-arc-rifle",
            "title": "Arc rifle",
            "aliases": [
              "Arc rifle"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-skitarii-vanguard-profile-2a957ff0ca"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-skitarii-vanguard-selection-plasma-caliver-supercharge",
            "title": "➤ Plasma caliver - supercharge",
            "aliases": [
              "➤ Plasma caliver - supercharge"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-skitarii-vanguard-profile-502ab08010"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-skitarii-vanguard-selection-plasma-caliver-standard",
            "title": "➤ Plasma caliver - standard",
            "aliases": [
              "➤ Plasma caliver - standard"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-skitarii-vanguard-profile-d8be5b4fc3"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-skitarii-vanguard-weapon-family-plasma-caliver-selection",
            "title": "➤ Plasma caliver",
            "aliases": [
              "➤ Plasma caliver"
            ],
            "kind": "weapon",
            "familyId": "unit-skitarii-vanguard-weapon-family-plasma-caliver",
            "profileIds": [
              "unit-skitarii-vanguard-profile-502ab08010",
              "unit-skitarii-vanguard-profile-d8be5b4fc3"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-skitarii-vanguard-selection-enhanced-data-tether",
            "title": "Enhanced data-tether",
            "aliases": [
              "Enhanced data-tether"
            ],
            "kind": "wargear",
            "profileIds": [],
            "wargearAbilityIds": [
              "unit-skitarii-vanguard-wargear-ability-86cd99761f"
            ]
          },
          {
            "id": "unit-skitarii-vanguard-selection-omnispex",
            "title": "Omnispex",
            "aliases": [
              "Omnispex"
            ],
            "kind": "wargear",
            "profileIds": [],
            "wargearAbilityIds": [
              "unit-skitarii-vanguard-wargear-ability-2e4de9ef20"
            ]
          }
        ],
        "weaponFamilies": [
          {
            "id": "unit-skitarii-vanguard-weapon-family-plasma-caliver",
            "title": "➤ Plasma caliver",
            "aliases": [
              "➤ Plasma caliver"
            ],
            "profileIds": [
              "unit-skitarii-vanguard-profile-502ab08010",
              "unit-skitarii-vanguard-profile-d8be5b4fc3"
            ],
            "ambiguousAlias": false
          }
        ],
        "weaponProfiles": [
          {
            "id": "unit-skitarii-vanguard-profile-f4fa54e843",
            "legacyIds": [
              "unit-skitarii-vanguard-profile-alpha-combat-weapon-melee"
            ],
            "title": "Alpha combat weapon",
            "mode": "melee",
            "range": "Melee",
            "a": "2",
            "skill": "4+",
            "s": "5",
            "ap": "-1",
            "d": "1",
            "abilities": "",
            "sourceSelectionIds": [
              "unit-skitarii-vanguard-selection-alpha-combat-weapon"
            ]
          },
          {
            "id": "unit-skitarii-vanguard-profile-c1982b3bbe",
            "legacyIds": [
              "unit-skitarii-vanguard-profile-radium-carbine-ranged-2"
            ],
            "title": "Radium carbine",
            "mode": "ranged",
            "range": "18\"",
            "a": "3",
            "skill": "4+",
            "s": "3",
            "ap": "0",
            "d": "1",
            "abilities": "Anti-Infantry 4+",
            "sourceSelectionIds": [
              "unit-skitarii-vanguard-selection-radium-carbine"
            ]
          },
          {
            "id": "unit-skitarii-vanguard-profile-8a7f265f02",
            "legacyIds": [
              "unit-skitarii-vanguard-profile-mechanicus-pistol-ranged-3"
            ],
            "title": "Mechanicus pistol",
            "mode": "ranged",
            "range": "12\"",
            "a": "1",
            "skill": "4+",
            "s": "6",
            "ap": "-1",
            "d": "1",
            "abilities": "Devastating Wounds, Pistol",
            "sourceSelectionIds": [
              "unit-skitarii-vanguard-selection-mechanicus-pistol"
            ]
          },
          {
            "id": "unit-skitarii-vanguard-profile-a3d11c7b0e",
            "legacyIds": [
              "unit-skitarii-vanguard-profile-close-combat-weapon-melee-4"
            ],
            "title": "Close combat weapon",
            "mode": "melee",
            "range": "Melee",
            "a": "1",
            "skill": "4+",
            "s": "3",
            "ap": "0",
            "d": "1",
            "abilities": "",
            "sourceSelectionIds": [
              "unit-skitarii-vanguard-selection-close-combat-weapon"
            ]
          },
          {
            "id": "unit-skitarii-vanguard-profile-e39782ff83",
            "legacyIds": [
              "unit-skitarii-vanguard-profile-transuranic-arquebus-ranged-5"
            ],
            "title": "Transuranic arquebus",
            "mode": "ranged",
            "range": "36\"",
            "a": "1",
            "skill": "4+",
            "s": "7",
            "ap": "-2",
            "d": "D3",
            "abilities": "Heavy, Precision",
            "sourceSelectionIds": [
              "unit-skitarii-vanguard-selection-transuranic-arquebus"
            ]
          },
          {
            "id": "unit-skitarii-vanguard-profile-2a957ff0ca",
            "legacyIds": [
              "unit-skitarii-vanguard-profile-arc-rifle-ranged-6"
            ],
            "title": "Arc rifle",
            "mode": "ranged",
            "range": "30\"",
            "a": "1",
            "skill": "4+",
            "s": "8",
            "ap": "-1",
            "d": "D3",
            "abilities": "Anti-Vehicle 4+, Devastating Wounds, Rapid Fire 1",
            "sourceSelectionIds": [
              "unit-skitarii-vanguard-selection-arc-rifle"
            ]
          },
          {
            "id": "unit-skitarii-vanguard-profile-502ab08010",
            "legacyIds": [
              "unit-skitarii-vanguard-profile-plasma-caliver-supercharge-ranged-7"
            ],
            "title": "➤ Plasma caliver - supercharge",
            "mode": "ranged",
            "range": "30\"",
            "a": "2",
            "skill": "4+",
            "s": "8",
            "ap": "-3",
            "d": "2",
            "abilities": "Hazardous",
            "sourceSelectionIds": [
              "unit-skitarii-vanguard-selection-plasma-caliver-supercharge",
              "unit-skitarii-vanguard-weapon-family-plasma-caliver-selection"
            ]
          },
          {
            "id": "unit-skitarii-vanguard-profile-d8be5b4fc3",
            "legacyIds": [
              "unit-skitarii-vanguard-profile-plasma-caliver-standard-ranged-8"
            ],
            "title": "➤ Plasma caliver - standard",
            "mode": "ranged",
            "range": "30\"",
            "a": "2",
            "skill": "4+",
            "s": "7",
            "ap": "-2",
            "d": "1",
            "abilities": "",
            "sourceSelectionIds": [
              "unit-skitarii-vanguard-selection-plasma-caliver-standard",
              "unit-skitarii-vanguard-weapon-family-plasma-caliver-selection"
            ]
          }
        ],
        "wargearAbilities": [
          {
            "id": "unit-skitarii-vanguard-wargear-ability-86cd99761f",
            "sectionId": "unit-skitarii-vanguard-wargear-ability-86cd99761f",
            "title": "Enhanced data-tether",
            "text": "Each time you select the bearer’s unit as the target of a Stratagem, roll one D6: on a 5+, you gain 1CP.",
            "sourceUnitId": "unit-skitarii-vanguard",
            "legacyIds": [
              "unit-skitarii-vanguard-wargear-ability-enhanced-data-tether"
            ],
            "requiredSelectionIds": [
              "unit-skitarii-vanguard-selection-enhanced-data-tether"
            ]
          },
          {
            "id": "unit-skitarii-vanguard-wargear-ability-2e4de9ef20",
            "sectionId": "unit-skitarii-vanguard-wargear-ability-2e4de9ef20",
            "title": "Omnispex",
            "text": "Ranged weapons equipped by models in the bearer’s unit have the IGNORES COVER ability.",
            "sourceUnitId": "unit-skitarii-vanguard",
            "legacyIds": [
              "unit-skitarii-vanguard-wargear-ability-omnispex-2"
            ],
            "requiredSelectionIds": [
              "unit-skitarii-vanguard-selection-omnispex"
            ]
          }
        ]
      }
    },
    {
      "id": "unit-cybernetica-datasmith",
      "title": "Cybernetica Datasmith",
      "sourceBookId": "adeptus-mechanicus",
      "sourceLayer": "Codex transcription",
      "intrinsicKeywords": [
        "Cybernetica Datasmith",
        "Tech-Priest",
        "Vehicle",
        "Character",
        "Imperium",
        "Adeptus Mechanicus",
        "Legio Cybernetica"
      ],
      "relations": {
        "canLead": [],
        "canSupport": [
          {
            "unitId": "unit-kastelan-robots",
            "maxCharacters": 1,
            "mandatory": true,
            "removeKeywords": [
              "INFANTRY"
            ],
            "attachmentGroupConstraint": {
              "id": "attachment-group-cybernetica-datasmith-kastelan-robots",
              "targetUnitId": "unit-kastelan-robots",
              "sourceUnitIds": [
                "unit-cybernetica-datasmith"
              ],
              "role": "support",
              "totalCapacity": "UNBOUNDED",
              "perRoleCapacity": "UNBOUNDED",
              "sameCanonicalLimit": "UNBOUNDED",
              "mandatoryParticipant": true,
              "noValidTargetConsequence": {
                "deployment": "CANNOT_DEPLOY",
                "destroyedTiming": "FIRST_BATTLE_ROUND"
              },
              "source": {
                "kind": "accepted-army-ability",
                "sourceId": "adeptus-mechanicus-bsdata-codex",
                "sourceUnitId": "unit-cybernetica-datasmith",
                "sourceAbilityId": "dba5-946a-cd1c-0845"
              },
              "provenance": {
                "sourceId": "adeptus-mechanicus-bsdata-codex",
                "sourceRevision": "7",
                "sourceCommit": "fa30730fca11fbfe87be90684d481d50e0efaf66",
                "currentness": "CURRENT",
                "verifiedAt": "2026-09-22"
              }
            }
          }
        ],
        "canBeLedBy": [],
        "canBeSupportedBy": []
      },
      "ruleFacts": {
        "relations": {
          "canLead": [],
          "canSupport": [
            {
              "unitId": "unit-kastelan-robots",
              "maxCharacters": 1,
              "mandatory": true,
              "removeKeywords": [
                "INFANTRY"
              ],
              "attachmentGroupConstraint": {
                "id": "attachment-group-cybernetica-datasmith-kastelan-robots",
                "targetUnitId": "unit-kastelan-robots",
                "sourceUnitIds": [
                  "unit-cybernetica-datasmith"
                ],
                "role": "support",
                "totalCapacity": "UNBOUNDED",
                "perRoleCapacity": "UNBOUNDED",
                "sameCanonicalLimit": "UNBOUNDED",
                "mandatoryParticipant": true,
                "noValidTargetConsequence": {
                  "deployment": "CANNOT_DEPLOY",
                  "destroyedTiming": "FIRST_BATTLE_ROUND"
                },
                "source": {
                  "kind": "accepted-army-ability",
                  "sourceId": "adeptus-mechanicus-bsdata-codex",
                  "sourceUnitId": "unit-cybernetica-datasmith",
                  "sourceAbilityId": "dba5-946a-cd1c-0845"
                },
                "provenance": {
                  "sourceId": "adeptus-mechanicus-bsdata-codex",
                  "sourceRevision": "7",
                  "sourceCommit": "fa30730fca11fbfe87be90684d481d50e0efaf66",
                  "currentness": "CURRENT",
                  "verifiedAt": "2026-09-22"
                }
              }
            }
          ],
          "canBeLedBy": [],
          "canBeSupportedBy": []
        }
      },
      "gameSelections": {
        "stats": {
          "M": "6\"",
          "T": "4",
          "Sv": "2+",
          "W": "3",
          "Ld": "7+",
          "OC": "1",
          "Invulnerable": "5+"
        },
        "abilities": [
          {
            "id": "core-support",
            "sectionId": "core-support",
            "title": "Support",
            "text": "This model must be attached to the following unit:\n■ Kastelan Robots\n\nYou must attach this model to a Kastelan Robots unit, even if one or more other Cybernetica Datasmith models have already been attached to it. In such cases, if that bodyguard unit is destroyed, the Leader units attached to it become separate units with their original Starting Strengths. If you cannot attach this model to a Kastelan Robots unit, this model cannot be deployed and counts as having been destroyed during the first battle round. While attached to a Kastelan Robots unit, this model loses the INFANTRY keyword.",
            "sourceUnitId": "unit-cybernetica-datasmith"
          },
          {
            "id": "datasheet-battle-protocols",
            "sectionId": "datasheet-battle-protocols",
            "title": "Battle Protocols",
            "text": "At the start of the battle, if this model is leading a Kastelan Robots unit, that unit enters Aegis Protocols (see below). In your Command phase, if this model is leading a Kastelan Robots unit, you can select one protocol from those listed below for that unit to enter. Once a unit enters a protocol, it remains in that protocol until it enters a different one\n- Protector Protocol: Add 2 to the Attacks characteristic of ranged weapons equipped by Kastelan Robot models in that unit.\n- Conqueror Protocol: Add 2 to the Attacks characteristic of melee weapons equipped by Kastelan Robot models in that unit.\n- Aegis Protocol: Add 1 to the Toughness characteristic of Kastelan Robot models in that unit.",
            "sourceUnitId": "unit-cybernetica-datasmith"
          },
          {
            "id": "datasheet-data-severed",
            "sectionId": "datasheet-data-severed",
            "title": "Data-severed",
            "text": "If there are no KASTELAN ROBOT models in this unit:\n- This unit loses VEHICLE.\n- This unit has INFANTRY.",
            "sourceUnitId": "unit-cybernetica-datasmith"
          },
          {
            "id": "doctrina-imperatives",
            "sectionId": "doctrina-imperatives",
            "title": "Doctrina Imperatives",
            "text": "At the start of the battle round, you can select one of the Doctrina Imperatives below. Until the end of the battle round, that Doctrina Imperative is active for your army, and all units from your army that have the Doctrina Imperatives ability gain the relevant abilities shown below.\n\nPROTECTOR IMPERATIVE\n■ Ranged weapons equipped by models in this unit have the [HEAVY] ability.\n■ Improve the Ballistic Skill characteristic of ranged weapons equipped by models in this unit by 1.\n■ Each time a melee attack targets this unit, if this unit has the Battleline keyword and/or it is within 6\" of one or more friendly Adeptus Mechanicus Battleline units, subtract 1 from the Hit roll.\n\nCONQUEROR IMPERATIVE\n■ Ranged weapons equipped by models in this unit have the [ASSAULT] ability.\n■ Improve the Weapon Skill characteristic of melee weapons equipped by models in this unit by 1.\n■ Each time a model in this unit makes an attack, if this unit has the Battleline keyword and/or it is within 6\" of one or more friendly Adeptus Mechanicus Battleline units, improve the Armour Penetration characteristic of that attack by 1.",
            "sourceUnitId": "unit-cybernetica-datasmith"
          },
          {
            "id": "core-feel-no-pain",
            "sectionId": "core-feel-no-pain",
            "title": "Feel No Pain 5+",
            "text": "",
            "sourceUnitId": "unit-cybernetica-datasmith"
          }
        ],
        "models": [
          {
            "id": "unit-cybernetica-datasmith-model-418c307135",
            "title": "Cybernetica Datasmith",
            "aliases": [
              "Cybernetica Datasmith"
            ],
            "legacyIds": [
              "unit-cybernetica-datasmith-model-cybernetica-datasmith"
            ]
          }
        ],
        "selections": [
          {
            "id": "unit-cybernetica-datasmith-selection-power-fist",
            "title": "Power fist",
            "aliases": [
              "Power fist"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-cybernetica-datasmith-profile-9c2ab1e5d9"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-cybernetica-datasmith-selection-mechanicus-pistol",
            "title": "Mechanicus pistol",
            "aliases": [
              "Mechanicus pistol"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-cybernetica-datasmith-profile-3afd508261"
            ],
            "wargearAbilityIds": []
          }
        ],
        "weaponFamilies": [],
        "weaponProfiles": [
          {
            "id": "unit-cybernetica-datasmith-profile-9c2ab1e5d9",
            "legacyIds": [
              "unit-cybernetica-datasmith-profile-power-fist-melee"
            ],
            "title": "Power fist",
            "mode": "melee",
            "range": "Melee",
            "a": "2",
            "skill": "3+",
            "s": "8",
            "ap": "-2",
            "d": "2",
            "abilities": "",
            "sourceSelectionIds": [
              "unit-cybernetica-datasmith-selection-power-fist"
            ]
          },
          {
            "id": "unit-cybernetica-datasmith-profile-3afd508261",
            "legacyIds": [
              "unit-cybernetica-datasmith-profile-mechanicus-pistol-ranged-2"
            ],
            "title": "Mechanicus pistol",
            "mode": "ranged",
            "range": "12\"",
            "a": "1",
            "skill": "3+",
            "s": "6",
            "ap": "-1",
            "d": "1",
            "abilities": "Devastating Wounds, Pistol",
            "sourceSelectionIds": [
              "unit-cybernetica-datasmith-selection-mechanicus-pistol"
            ]
          }
        ],
        "wargearAbilities": []
      }
    },
    {
      "id": "unit-skitarii-marshal",
      "title": "Skitarii Marshal",
      "sourceBookId": "adeptus-mechanicus",
      "sourceLayer": "Codex transcription",
      "intrinsicKeywords": [
        "Marshal",
        "Imperium",
        "Adeptus Mechanicus",
        "Skitarii",
        "Character",
        "Infantry"
      ],
      "relations": {
        "canLead": [],
        "canSupport": [
          {
            "unitId": "unit-hastarii-exterminators",
            "maxCharacters": 2
          },
          {
            "unitId": "unit-hastarii-fusiliers",
            "maxCharacters": 2
          },
          {
            "unitId": "unit-skitarii-rangers",
            "maxCharacters": 2
          },
          {
            "unitId": "unit-skitarii-vanguard",
            "maxCharacters": 2
          }
        ],
        "canBeLedBy": [],
        "canBeSupportedBy": []
      },
      "ruleFacts": {
        "relations": {
          "canLead": [],
          "canSupport": [
            {
              "unitId": "unit-hastarii-exterminators",
              "maxCharacters": 2
            },
            {
              "unitId": "unit-hastarii-fusiliers",
              "maxCharacters": 2
            },
            {
              "unitId": "unit-skitarii-rangers",
              "maxCharacters": 2
            },
            {
              "unitId": "unit-skitarii-vanguard",
              "maxCharacters": 2
            }
          ],
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
          "Ld": "6+",
          "OC": "1",
          "Invulnerable": "5+"
        },
        "abilities": [
          {
            "id": "core-support",
            "sectionId": "core-support",
            "title": "Support",
            "text": "This model can be attached to the following units:\n■ Hastarii Exterminators\n■ Hastarii Fusiliers\n■ Skitarii Rangers\n■ Skitarii Vanguard",
            "sourceUnitId": "unit-skitarii-marshal"
          },
          {
            "id": "datasheet-control-edict",
            "sectionId": "datasheet-control-edict",
            "title": "Control Edict",
            "text": "While this model is leading a unit, each time a model in that unit makes an attack, you can re-roll the Hit roll.",
            "sourceUnitId": "unit-skitarii-marshal"
          },
          {
            "id": "datasheet-servo-skull-uplink",
            "sectionId": "datasheet-servo-skull-uplink",
            "title": "Servo-skull Uplink",
            "text": "Once per battle, at the start of any phase, you can select one friendly Skitarii unit that is Battle-shocked and within 6\" of this model. That unit is no longer Battle-shocked.",
            "sourceUnitId": "unit-skitarii-marshal"
          },
          {
            "id": "doctrina-imperatives",
            "sectionId": "doctrina-imperatives",
            "title": "Doctrina Imperatives",
            "text": "At the start of the battle round, you can select one of the Doctrina Imperatives below. Until the end of the battle round, that Doctrina Imperative is active for your army, and all units from your army that have the Doctrina Imperatives ability gain the relevant abilities shown below.\n\nPROTECTOR IMPERATIVE\n■ Ranged weapons equipped by models in this unit have the [HEAVY] ability.\n■ Improve the Ballistic Skill characteristic of ranged weapons equipped by models in this unit by 1.\n■ Each time a melee attack targets this unit, if this unit has the Battleline keyword and/or it is within 6\" of one or more friendly Adeptus Mechanicus Battleline units, subtract 1 from the Hit roll.\n\nCONQUEROR IMPERATIVE\n■ Ranged weapons equipped by models in this unit have the [ASSAULT] ability.\n■ Improve the Weapon Skill characteristic of melee weapons equipped by models in this unit by 1.\n■ Each time a model in this unit makes an attack, if this unit has the Battleline keyword and/or it is within 6\" of one or more friendly Adeptus Mechanicus Battleline units, improve the Armour Penetration characteristic of that attack by 1.",
            "sourceUnitId": "unit-skitarii-marshal"
          }
        ],
        "models": [
          {
            "id": "unit-skitarii-marshal-model-1e5a158896",
            "title": "Skitarii Marshal",
            "aliases": [
              "Skitarii Marshal"
            ],
            "legacyIds": [
              "unit-skitarii-marshal-model-skitarii-marshal"
            ]
          }
        ],
        "selections": [
          {
            "id": "unit-skitarii-marshal-selection-control-stave",
            "title": "Control stave",
            "aliases": [
              "Control stave"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-skitarii-marshal-profile-43922c96ca"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-skitarii-marshal-selection-mechanicus-pistol",
            "title": "Mechanicus pistol",
            "aliases": [
              "Mechanicus pistol"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-skitarii-marshal-profile-3afd508261"
            ],
            "wargearAbilityIds": []
          }
        ],
        "weaponFamilies": [],
        "weaponProfiles": [
          {
            "id": "unit-skitarii-marshal-profile-43922c96ca",
            "legacyIds": [
              "unit-skitarii-marshal-profile-control-stave-melee"
            ],
            "title": "Control stave",
            "mode": "melee",
            "range": "Melee",
            "a": "4",
            "skill": "3+",
            "s": "6",
            "ap": "-1",
            "d": "1",
            "abilities": "",
            "sourceSelectionIds": [
              "unit-skitarii-marshal-selection-control-stave"
            ]
          },
          {
            "id": "unit-skitarii-marshal-profile-3afd508261",
            "legacyIds": [
              "unit-skitarii-marshal-profile-mechanicus-pistol-ranged-2"
            ],
            "title": "Mechanicus pistol",
            "mode": "ranged",
            "range": "12\"",
            "a": "1",
            "skill": "3+",
            "s": "6",
            "ap": "-1",
            "d": "1",
            "abilities": "Devastating Wounds, Pistol",
            "sourceSelectionIds": [
              "unit-skitarii-marshal-selection-mechanicus-pistol"
            ]
          }
        ],
        "wargearAbilities": []
      }
    },
    {
      "id": "unit-sydonian-skatros",
      "title": "Sydonian Skatros",
      "sourceBookId": "adeptus-mechanicus",
      "sourceLayer": "Codex transcription",
      "intrinsicKeywords": [
        "Infantry",
        "Imperium",
        "Skitarii",
        "Sydonian",
        "Adeptus Mechanicus",
        "Character",
        "Skatros"
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
          "Sv": "4+",
          "W": "4",
          "Ld": "7+",
          "OC": "1",
          "Invulnerable": "5+"
        },
        "abilities": [
          {
            "id": "datasheet-dread-snipers",
            "sectionId": "datasheet-dread-snipers",
            "title": "Dread Snipers",
            "text": "In your Shooting phase, after this model has shot, select one enemy unit hit by one or more of those attacks. That unit must take a Battle-shock test.",
            "sourceUnitId": "unit-sydonian-skatros"
          },
          {
            "id": "datasheet-sydonian-sentinel",
            "sectionId": "datasheet-sydonian-sentinel",
            "title": "Sydonian Sentinel",
            "text": "This model cannot be your Warlord.",
            "sourceUnitId": "unit-sydonian-skatros"
          },
          {
            "id": "datasheet-achillan-eye",
            "sectionId": "datasheet-achillan-eye",
            "title": "Achillan Eye",
            "text": "Each time this model makes an attack with a radium jezzail that targets an Infantry unit, you can re-roll the Wound roll. Each time this model makes an attack with a Skatros transuranic arquebus that targets a Monster or Vehicle unit, you can re-roll the Wound roll.",
            "sourceUnitId": "unit-sydonian-skatros"
          },
          {
            "id": "doctrina-imperatives",
            "sectionId": "doctrina-imperatives",
            "title": "Doctrina Imperatives",
            "text": "At the start of the battle round, you can select one of the Doctrina Imperatives below. Until the end of the battle round, that Doctrina Imperative is active for your army, and all units from your army that have the Doctrina Imperatives ability gain the relevant abilities shown below.\n\nPROTECTOR IMPERATIVE\n■ Ranged weapons equipped by models in this unit have the [HEAVY] ability.\n■ Improve the Ballistic Skill characteristic of ranged weapons equipped by models in this unit by 1.\n■ Each time a melee attack targets this unit, if this unit has the Battleline keyword and/or it is within 6\" of one or more friendly Adeptus Mechanicus Battleline units, subtract 1 from the Hit roll.\n\nCONQUEROR IMPERATIVE\n■ Ranged weapons equipped by models in this unit have the [ASSAULT] ability.\n■ Improve the Weapon Skill characteristic of melee weapons equipped by models in this unit by 1.\n■ Each time a model in this unit makes an attack, if this unit has the Battleline keyword and/or it is within 6\" of one or more friendly Adeptus Mechanicus Battleline units, improve the Armour Penetration characteristic of that attack by 1.",
            "sourceUnitId": "unit-sydonian-skatros"
          },
          {
            "id": "core-stealth",
            "sectionId": "core-stealth",
            "title": "Stealth",
            "text": "",
            "sourceUnitId": "unit-sydonian-skatros"
          },
          {
            "id": "core-lone-operative",
            "sectionId": "core-lone-operative",
            "title": "Lone Operative",
            "text": "",
            "sourceUnitId": "unit-sydonian-skatros"
          }
        ],
        "models": [
          {
            "id": "unit-sydonian-skatros-model-0b7f5e8420",
            "title": "Sydonian Skatros",
            "aliases": [
              "Sydonian Skatros"
            ],
            "legacyIds": [
              "unit-sydonian-skatros-model-sydonian-skatros"
            ]
          }
        ],
        "selections": [
          {
            "id": "unit-sydonian-skatros-selection-sydonian-feet",
            "title": "Sydonian Feet",
            "aliases": [
              "Sydonian Feet"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-sydonian-skatros-profile-1e66bb8385"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-sydonian-skatros-selection-radium-jezzail",
            "title": "Radium Jezzail",
            "aliases": [
              "Radium Jezzail"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-sydonian-skatros-profile-3bc8e05cc1"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-sydonian-skatros-selection-skatros-transuranic-arquebus",
            "title": "Skatros transuranic arquebus",
            "aliases": [
              "Skatros transuranic arquebus"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-sydonian-skatros-profile-b2baeaef2e"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-sydonian-skatros-selection-mechanicus-pistol",
            "title": "Mechanicus pistol",
            "aliases": [
              "Mechanicus pistol"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-sydonian-skatros-profile-3afd508261"
            ],
            "wargearAbilityIds": []
          }
        ],
        "weaponFamilies": [],
        "weaponProfiles": [
          {
            "id": "unit-sydonian-skatros-profile-1e66bb8385",
            "legacyIds": [
              "unit-sydonian-skatros-profile-sydonian-feet-melee"
            ],
            "title": "Sydonian Feet",
            "mode": "melee",
            "range": "Melee",
            "a": "3",
            "skill": "4+",
            "s": "3",
            "ap": "0",
            "d": "1",
            "abilities": "",
            "sourceSelectionIds": [
              "unit-sydonian-skatros-selection-sydonian-feet"
            ]
          },
          {
            "id": "unit-sydonian-skatros-profile-3bc8e05cc1",
            "legacyIds": [
              "unit-sydonian-skatros-profile-radium-jezzail-ranged-2"
            ],
            "title": "Radium Jezzail",
            "mode": "ranged",
            "range": "36\"",
            "a": "1",
            "skill": "3+",
            "s": "5",
            "ap": "-2",
            "d": "3",
            "abilities": "Heavy, Precision, Anti-Infantry 3+",
            "sourceSelectionIds": [
              "unit-sydonian-skatros-selection-radium-jezzail"
            ]
          },
          {
            "id": "unit-sydonian-skatros-profile-b2baeaef2e",
            "legacyIds": [
              "unit-sydonian-skatros-profile-skatros-transuranic-arquebus-ranged-3"
            ],
            "title": "Skatros transuranic arquebus",
            "mode": "ranged",
            "range": "36\"",
            "a": "1",
            "skill": "3+",
            "s": "7",
            "ap": "-2",
            "d": "D3",
            "abilities": "Heavy, Precision, Anti-Monster 4+, Anti-Vehicle 4+",
            "sourceSelectionIds": [
              "unit-sydonian-skatros-selection-skatros-transuranic-arquebus"
            ]
          },
          {
            "id": "unit-sydonian-skatros-profile-3afd508261",
            "legacyIds": [
              "unit-sydonian-skatros-profile-mechanicus-pistol-ranged-4"
            ],
            "title": "Mechanicus pistol",
            "mode": "ranged",
            "range": "12\"",
            "a": "1",
            "skill": "3+",
            "s": "6",
            "ap": "-1",
            "d": "1",
            "abilities": "Devastating Wounds, Pistol",
            "sourceSelectionIds": [
              "unit-sydonian-skatros-selection-mechanicus-pistol"
            ]
          }
        ],
        "wargearAbilities": []
      }
    },
    {
      "id": "unit-tech-priest-dominus",
      "title": "Tech-Priest Dominus",
      "sourceBookId": "adeptus-mechanicus",
      "sourceLayer": "Codex transcription",
      "intrinsicKeywords": [
        "Dominus",
        "Imperium",
        "Adeptus Mechanicus",
        "Tech-Priest",
        "Character",
        "Infantry",
        "Cult Mechanicus"
      ],
      "relations": {
        "canLead": [
          {
            "unitId": "unit-corpuscarii-electro-priests",
            "maxCharacters": 2
          },
          {
            "unitId": "unit-fulgurite-electro-priests",
            "maxCharacters": 2
          },
          {
            "unitId": "unit-hastarii-exterminators",
            "maxCharacters": 2
          },
          {
            "unitId": "unit-hastarii-fusiliers",
            "maxCharacters": 2
          },
          {
            "unitId": "unit-kataphron-breachers",
            "maxCharacters": 2
          },
          {
            "unitId": "unit-kataphron-destroyers",
            "maxCharacters": 2
          },
          {
            "unitId": "unit-servitor-battleclade",
            "maxCharacters": 2
          },
          {
            "unitId": "unit-skitarii-rangers",
            "maxCharacters": 2
          },
          {
            "unitId": "unit-skitarii-vanguard",
            "maxCharacters": 2
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
              "unitId": "unit-corpuscarii-electro-priests",
              "maxCharacters": 2
            },
            {
              "unitId": "unit-fulgurite-electro-priests",
              "maxCharacters": 2
            },
            {
              "unitId": "unit-hastarii-exterminators",
              "maxCharacters": 2
            },
            {
              "unitId": "unit-hastarii-fusiliers",
              "maxCharacters": 2
            },
            {
              "unitId": "unit-kataphron-breachers",
              "maxCharacters": 2
            },
            {
              "unitId": "unit-kataphron-destroyers",
              "maxCharacters": 2
            },
            {
              "unitId": "unit-servitor-battleclade",
              "maxCharacters": 2
            },
            {
              "unitId": "unit-skitarii-rangers",
              "maxCharacters": 2
            },
            {
              "unitId": "unit-skitarii-vanguard",
              "maxCharacters": 2
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
          "T": "4",
          "Sv": "2+",
          "W": "4",
          "Ld": "7+",
          "OC": "1",
          "Invulnerable": "5+"
        },
        "abilities": [
          {
            "id": "core-leader",
            "sectionId": "core-leader",
            "title": "Leader",
            "text": "This model can be attached to the following units:\n■ Corpuscarii Electro-Priests\n■ Fulgurite Electro-Priests\n■ Hastarii Exterminators\n■ Hastarii Fusiliers\n■ Kataphron Breachers\n■ Kataphron Destroyers\n■ Servitor Battleclade\n■ Skitarii Rangers\n■ Skitarii Vanguard",
            "sourceUnitId": "unit-tech-priest-dominus"
          },
          {
            "id": "datasheet-lord-of-the-machine-cult",
            "sectionId": "datasheet-lord-of-the-machine-cult",
            "title": "Lord of the Machine Cult",
            "text": "While this model is leading a unit, models in that unit have the Feel No Pain 5+ ability. If that unit has the Electro-Priests keyword, models in that unit have the Feel No Pain 4+ ability instead",
            "sourceUnitId": "unit-tech-priest-dominus"
          },
          {
            "id": "datasheet-data-spike",
            "sectionId": "datasheet-data-spike",
            "title": "Data-spike",
            "text": "At the start of the Fight phase, you can select one enemy Vehicle unit within Engagement Range of this model’s unit and roll one D6: on a 4+, that enemy unit suffers D6 mortal wounds and, until the end of the phase, the Weapon Skill characteristic of melee weapons equipped by that enemy unit is worsened by 1.",
            "sourceUnitId": "unit-tech-priest-dominus"
          },
          {
            "id": "doctrina-imperatives",
            "sectionId": "doctrina-imperatives",
            "title": "Doctrina Imperatives",
            "text": "At the start of the battle round, you can select one of the Doctrina Imperatives below. Until the end of the battle round, that Doctrina Imperative is active for your army, and all units from your army that have the Doctrina Imperatives ability gain the relevant abilities shown below.\n\nPROTECTOR IMPERATIVE\n■ Ranged weapons equipped by models in this unit have the [HEAVY] ability.\n■ Improve the Ballistic Skill characteristic of ranged weapons equipped by models in this unit by 1.\n■ Each time a melee attack targets this unit, if this unit has the Battleline keyword and/or it is within 6\" of one or more friendly Adeptus Mechanicus Battleline units, subtract 1 from the Hit roll.\n\nCONQUEROR IMPERATIVE\n■ Ranged weapons equipped by models in this unit have the [ASSAULT] ability.\n■ Improve the Weapon Skill characteristic of melee weapons equipped by models in this unit by 1.\n■ Each time a model in this unit makes an attack, if this unit has the Battleline keyword and/or it is within 6\" of one or more friendly Adeptus Mechanicus Battleline units, improve the Armour Penetration characteristic of that attack by 1.",
            "sourceUnitId": "unit-tech-priest-dominus"
          },
          {
            "id": "core-feel-no-pain",
            "sectionId": "core-feel-no-pain",
            "title": "Feel No Pain 5+",
            "text": "",
            "sourceUnitId": "unit-tech-priest-dominus"
          }
        ],
        "models": [
          {
            "id": "unit-tech-priest-dominus-model-c72dc63d16",
            "title": "Tech-Priest Dominus",
            "aliases": [
              "Tech-Priest Dominus"
            ],
            "legacyIds": [
              "unit-tech-priest-dominus-model-tech-priest-dominus"
            ]
          }
        ],
        "selections": [
          {
            "id": "unit-tech-priest-dominus-selection-omnissian-axe",
            "title": "Omnissian axe",
            "aliases": [
              "Omnissian axe"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-tech-priest-dominus-profile-5a117e1aa5"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-tech-priest-dominus-selection-macrostubber",
            "title": "Macrostubber",
            "aliases": [
              "Macrostubber"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-tech-priest-dominus-profile-806922726e"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-tech-priest-dominus-selection-phosphor-serpenta",
            "title": "Phosphor serpenta",
            "aliases": [
              "Phosphor serpenta"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-tech-priest-dominus-profile-0938583a1d"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-tech-priest-dominus-selection-eradication-ray-dissipated",
            "title": "➤ Eradication ray - dissipated",
            "aliases": [
              "➤ Eradication ray - dissipated"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-tech-priest-dominus-profile-6e74157b74"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-tech-priest-dominus-selection-eradication-ray-focused",
            "title": "➤ Eradication ray - focused",
            "aliases": [
              "➤ Eradication ray - focused"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-tech-priest-dominus-profile-2a1160a3c4"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-tech-priest-dominus-selection-volkite-blaster",
            "title": "Volkite blaster",
            "aliases": [
              "Volkite blaster"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-tech-priest-dominus-profile-6ac132a896"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-tech-priest-dominus-weapon-family-eradication-ray-selection",
            "title": "➤ Eradication ray",
            "aliases": [
              "➤ Eradication ray"
            ],
            "kind": "weapon",
            "familyId": "unit-tech-priest-dominus-weapon-family-eradication-ray",
            "profileIds": [
              "unit-tech-priest-dominus-profile-6e74157b74",
              "unit-tech-priest-dominus-profile-2a1160a3c4"
            ],
            "wargearAbilityIds": []
          }
        ],
        "weaponFamilies": [
          {
            "id": "unit-tech-priest-dominus-weapon-family-eradication-ray",
            "title": "➤ Eradication ray",
            "aliases": [
              "➤ Eradication ray"
            ],
            "profileIds": [
              "unit-tech-priest-dominus-profile-6e74157b74",
              "unit-tech-priest-dominus-profile-2a1160a3c4"
            ],
            "ambiguousAlias": false
          }
        ],
        "weaponProfiles": [
          {
            "id": "unit-tech-priest-dominus-profile-5a117e1aa5",
            "legacyIds": [
              "unit-tech-priest-dominus-profile-omnissian-axe-melee"
            ],
            "title": "Omnissian axe",
            "mode": "melee",
            "range": "Melee",
            "a": "4",
            "skill": "3+",
            "s": "6",
            "ap": "-2",
            "d": "2",
            "abilities": "",
            "sourceSelectionIds": [
              "unit-tech-priest-dominus-selection-omnissian-axe"
            ]
          },
          {
            "id": "unit-tech-priest-dominus-profile-806922726e",
            "legacyIds": [
              "unit-tech-priest-dominus-profile-macrostubber-ranged-2"
            ],
            "title": "Macrostubber",
            "mode": "ranged",
            "range": "12\"",
            "a": "5",
            "skill": "3+",
            "s": "4",
            "ap": "0",
            "d": "1",
            "abilities": "Pistol",
            "sourceSelectionIds": [
              "unit-tech-priest-dominus-selection-macrostubber"
            ]
          },
          {
            "id": "unit-tech-priest-dominus-profile-0938583a1d",
            "legacyIds": [
              "unit-tech-priest-dominus-profile-phosphor-serpenta-ranged-3"
            ],
            "title": "Phosphor serpenta",
            "mode": "ranged",
            "range": "18\"",
            "a": "1",
            "skill": "3+",
            "s": "5",
            "ap": "-1",
            "d": "2",
            "abilities": "Ignores Cover, Pistol",
            "sourceSelectionIds": [
              "unit-tech-priest-dominus-selection-phosphor-serpenta"
            ]
          },
          {
            "id": "unit-tech-priest-dominus-profile-6e74157b74",
            "legacyIds": [
              "unit-tech-priest-dominus-profile-eradication-ray-dissipated-ranged-4"
            ],
            "title": "➤ Eradication ray - dissipated",
            "mode": "ranged",
            "range": "24\"",
            "a": "D3",
            "skill": "3+",
            "s": "6",
            "ap": "-1",
            "d": "1",
            "abilities": "",
            "sourceSelectionIds": [
              "unit-tech-priest-dominus-selection-eradication-ray-dissipated",
              "unit-tech-priest-dominus-weapon-family-eradication-ray-selection"
            ]
          },
          {
            "id": "unit-tech-priest-dominus-profile-2a1160a3c4",
            "legacyIds": [
              "unit-tech-priest-dominus-profile-eradication-ray-focused-ranged-5"
            ],
            "title": "➤ Eradication ray - focused",
            "mode": "ranged",
            "range": "12\"",
            "a": "D3",
            "skill": "3+",
            "s": "6",
            "ap": "-2",
            "d": "2",
            "abilities": "",
            "sourceSelectionIds": [
              "unit-tech-priest-dominus-selection-eradication-ray-focused",
              "unit-tech-priest-dominus-weapon-family-eradication-ray-selection"
            ]
          },
          {
            "id": "unit-tech-priest-dominus-profile-6ac132a896",
            "legacyIds": [
              "unit-tech-priest-dominus-profile-volkite-blaster-ranged-6"
            ],
            "title": "Volkite blaster",
            "mode": "ranged",
            "range": "24\"",
            "a": "3",
            "skill": "3+",
            "s": "5",
            "ap": "0",
            "d": "2",
            "abilities": "Devastating Wounds",
            "sourceSelectionIds": [
              "unit-tech-priest-dominus-selection-volkite-blaster"
            ]
          }
        ],
        "wargearAbilities": []
      }
    },
    {
      "id": "unit-tech-priest-enginseer",
      "title": "Tech-Priest Enginseer",
      "sourceBookId": "adeptus-mechanicus",
      "sourceLayer": "Codex transcription",
      "intrinsicKeywords": [
        "Enginseer",
        "Imperium",
        "Adeptus Mechanicus",
        "Tech-Priest",
        "Character",
        "Infantry",
        "Cult Mechanicus"
      ],
      "relations": {
        "canLead": [
          {
            "unitId": "unit-corpuscarii-electro-priests",
            "maxCharacters": 2
          },
          {
            "unitId": "unit-fulgurite-electro-priests",
            "maxCharacters": 2
          },
          {
            "unitId": "unit-hastarii-exterminators",
            "maxCharacters": 2
          },
          {
            "unitId": "unit-hastarii-fusiliers",
            "maxCharacters": 2
          },
          {
            "unitId": "unit-kataphron-breachers",
            "maxCharacters": 2
          },
          {
            "unitId": "unit-kataphron-destroyers",
            "maxCharacters": 2
          },
          {
            "unitId": "unit-servitor-battleclade",
            "maxCharacters": 2
          },
          {
            "unitId": "unit-skitarii-rangers",
            "maxCharacters": 2
          },
          {
            "unitId": "unit-skitarii-vanguard",
            "maxCharacters": 2
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
              "unitId": "unit-corpuscarii-electro-priests",
              "maxCharacters": 2
            },
            {
              "unitId": "unit-fulgurite-electro-priests",
              "maxCharacters": 2
            },
            {
              "unitId": "unit-hastarii-exterminators",
              "maxCharacters": 2
            },
            {
              "unitId": "unit-hastarii-fusiliers",
              "maxCharacters": 2
            },
            {
              "unitId": "unit-kataphron-breachers",
              "maxCharacters": 2
            },
            {
              "unitId": "unit-kataphron-destroyers",
              "maxCharacters": 2
            },
            {
              "unitId": "unit-servitor-battleclade",
              "maxCharacters": 2
            },
            {
              "unitId": "unit-skitarii-rangers",
              "maxCharacters": 2
            },
            {
              "unitId": "unit-skitarii-vanguard",
              "maxCharacters": 2
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
          "T": "4",
          "Sv": "3+",
          "W": "3",
          "Ld": "7+",
          "OC": "1",
          "Invulnerable": "5+"
        },
        "abilities": [
          {
            "id": "datasheet-enginseer",
            "sectionId": "datasheet-enginseer",
            "title": "Enginseer",
            "text": "While this model is within 3\" of one or more friendly Adeptus Mechanicus Vehicle units, unless it is leading a unit, this model has the Lone Operative ability.",
            "sourceUnitId": "unit-tech-priest-enginseer"
          },
          {
            "id": "datasheet-omnissiahs-blessing",
            "sectionId": "datasheet-omnissiahs-blessing",
            "title": "Omnissiah's Blessing",
            "text": "In your Command phase, select one friendly Adeptus Mechanicus model within 3\" of this model. That model regains up to D3 lost wounds and, if it is a Vehicle model, until the start of your next Command phase, that model has the Feel No Pain 5+ ability. Each model can only be selected for this ability once per Command phase",
            "sourceUnitId": "unit-tech-priest-enginseer"
          },
          {
            "id": "datasheet-vengeance-for-the-omnissiah",
            "sectionId": "datasheet-vengeance-for-the-omnissiah",
            "title": "Vengeance for the Omnissiah",
            "text": "If a friendly Adeptus Mechanicus Vehicle model is destroyed within 12\" of this model, until the end of the battle, this model’s Omnissian axe has an Attacks characteristic of 6.",
            "sourceUnitId": "unit-tech-priest-enginseer"
          },
          {
            "id": "core-leader",
            "sectionId": "core-leader",
            "title": "Leader",
            "text": "This model can be attached to the following units:\n■ Corpuscarii Electro-Priests\n■ Fulgurite Electro-Priests\n■ Kataphron Breachers\n■ Kataphron Destroyers\n■ Skitarii Rangers\n■ Skitarii Vanguard",
            "sourceUnitId": "unit-tech-priest-enginseer"
          },
          {
            "id": "doctrina-imperatives",
            "sectionId": "doctrina-imperatives",
            "title": "Doctrina Imperatives",
            "text": "At the start of the battle round, you can select one of the Doctrina Imperatives below. Until the end of the battle round, that Doctrina Imperative is active for your army, and all units from your army that have the Doctrina Imperatives ability gain the relevant abilities shown below.\n\nPROTECTOR IMPERATIVE\n■ Ranged weapons equipped by models in this unit have the [HEAVY] ability.\n■ Improve the Ballistic Skill characteristic of ranged weapons equipped by models in this unit by 1.\n■ Each time a melee attack targets this unit, if this unit has the Battleline keyword and/or it is within 6\" of one or more friendly Adeptus Mechanicus Battleline units, subtract 1 from the Hit roll.\n\nCONQUEROR IMPERATIVE\n■ Ranged weapons equipped by models in this unit have the [ASSAULT] ability.\n■ Improve the Weapon Skill characteristic of melee weapons equipped by models in this unit by 1.\n■ Each time a model in this unit makes an attack, if this unit has the Battleline keyword and/or it is within 6\" of one or more friendly Adeptus Mechanicus Battleline units, improve the Armour Penetration characteristic of that attack by 1.",
            "sourceUnitId": "unit-tech-priest-enginseer"
          },
          {
            "id": "core-feel-no-pain",
            "sectionId": "core-feel-no-pain",
            "title": "Feel No Pain 5+",
            "text": "",
            "sourceUnitId": "unit-tech-priest-enginseer"
          }
        ],
        "models": [
          {
            "id": "unit-tech-priest-enginseer-model-3952182cb5",
            "title": "Tech-Priest Enginseer",
            "aliases": [
              "Tech-Priest Enginseer"
            ],
            "legacyIds": [
              "unit-tech-priest-enginseer-model-tech-priest-enginseer"
            ]
          }
        ],
        "selections": [
          {
            "id": "unit-tech-priest-enginseer-selection-servo-arm",
            "title": "Servo arm",
            "aliases": [
              "Servo arm"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-tech-priest-enginseer-profile-f39deea3d1"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-tech-priest-enginseer-selection-omnissian-axe",
            "title": "Omnissian axe",
            "aliases": [
              "Omnissian axe"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-tech-priest-enginseer-profile-26771c1737"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-tech-priest-enginseer-selection-mechanicus-pistol",
            "title": "Mechanicus pistol",
            "aliases": [
              "Mechanicus pistol"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-tech-priest-enginseer-profile-3afd508261"
            ],
            "wargearAbilityIds": []
          }
        ],
        "weaponFamilies": [],
        "weaponProfiles": [
          {
            "id": "unit-tech-priest-enginseer-profile-f39deea3d1",
            "legacyIds": [
              "unit-tech-priest-enginseer-profile-servo-arm-melee"
            ],
            "title": "Servo arm",
            "mode": "melee",
            "range": "Melee",
            "a": "1",
            "skill": "4+",
            "s": "6",
            "ap": "-2",
            "d": "2",
            "abilities": "Extra Attacks",
            "sourceSelectionIds": [
              "unit-tech-priest-enginseer-selection-servo-arm"
            ]
          },
          {
            "id": "unit-tech-priest-enginseer-profile-26771c1737",
            "legacyIds": [
              "unit-tech-priest-enginseer-profile-omnissian-axe-melee-2"
            ],
            "title": "Omnissian axe",
            "mode": "melee",
            "range": "Melee",
            "a": "3",
            "skill": "4+",
            "s": "6",
            "ap": "-2",
            "d": "2",
            "abilities": "",
            "sourceSelectionIds": [
              "unit-tech-priest-enginseer-selection-omnissian-axe"
            ]
          },
          {
            "id": "unit-tech-priest-enginseer-profile-3afd508261",
            "legacyIds": [
              "unit-tech-priest-enginseer-profile-mechanicus-pistol-ranged-3"
            ],
            "title": "Mechanicus pistol",
            "mode": "ranged",
            "range": "12\"",
            "a": "1",
            "skill": "3+",
            "s": "6",
            "ap": "-1",
            "d": "1",
            "abilities": "Devastating Wounds, Pistol",
            "sourceSelectionIds": [
              "unit-tech-priest-enginseer-selection-mechanicus-pistol"
            ]
          }
        ],
        "wargearAbilities": []
      }
    },
    {
      "id": "unit-tech-priest-manipulus",
      "title": "Tech-Priest Manipulus",
      "sourceBookId": "adeptus-mechanicus",
      "sourceLayer": "Codex transcription",
      "intrinsicKeywords": [
        "Manipulus",
        "Imperium",
        "Adeptus Mechanicus",
        "Tech-Priest",
        "Character",
        "Infantry",
        "Cult Mechanicus"
      ],
      "relations": {
        "canLead": [
          {
            "unitId": "unit-corpuscarii-electro-priests",
            "maxCharacters": 2
          },
          {
            "unitId": "unit-fulgurite-electro-priests",
            "maxCharacters": 2
          },
          {
            "unitId": "unit-hastarii-exterminators",
            "maxCharacters": 2
          },
          {
            "unitId": "unit-hastarii-fusiliers",
            "maxCharacters": 2
          },
          {
            "unitId": "unit-kataphron-breachers",
            "maxCharacters": 2
          },
          {
            "unitId": "unit-kataphron-destroyers",
            "maxCharacters": 2
          },
          {
            "unitId": "unit-servitor-battleclade",
            "maxCharacters": 2
          },
          {
            "unitId": "unit-skitarii-rangers",
            "maxCharacters": 2
          },
          {
            "unitId": "unit-skitarii-vanguard",
            "maxCharacters": 2
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
              "unitId": "unit-corpuscarii-electro-priests",
              "maxCharacters": 2
            },
            {
              "unitId": "unit-fulgurite-electro-priests",
              "maxCharacters": 2
            },
            {
              "unitId": "unit-hastarii-exterminators",
              "maxCharacters": 2
            },
            {
              "unitId": "unit-hastarii-fusiliers",
              "maxCharacters": 2
            },
            {
              "unitId": "unit-kataphron-breachers",
              "maxCharacters": 2
            },
            {
              "unitId": "unit-kataphron-destroyers",
              "maxCharacters": 2
            },
            {
              "unitId": "unit-servitor-battleclade",
              "maxCharacters": 2
            },
            {
              "unitId": "unit-skitarii-rangers",
              "maxCharacters": 2
            },
            {
              "unitId": "unit-skitarii-vanguard",
              "maxCharacters": 2
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
          "T": "4",
          "Sv": "2+",
          "W": "4",
          "Ld": "7+",
          "OC": "1",
          "Invulnerable": "5+"
        },
        "abilities": [
          {
            "id": "core-leader",
            "sectionId": "core-leader",
            "title": "Leader",
            "text": "This model can be attached to the following units:\n■ Corpuscarii Electro-Priests\n■ Fulgurite Electro-Priests\n■ Hastarii Exterminators\n■ Hastarii Fusiliers\n■ Kataphron Breachers\n■ Kataphron Destroyers\n■ Servitor Battleclade\n■ Skitarii Rangers\n■ Skitarii Vanguard",
            "sourceUnitId": "unit-tech-priest-manipulus"
          },
          {
            "id": "datasheet-galvanic-field",
            "sectionId": "datasheet-galvanic-field",
            "title": "Galvanic Field",
            "text": "While this model is leading a unit, weapons equipped by models in that unit have the [Lethal Hits] ability.",
            "sourceUnitId": "unit-tech-priest-manipulus"
          },
          {
            "id": "datasheet-defend-the-divine-work",
            "sectionId": "datasheet-defend-the-divine-work",
            "title": "Defend the Divine Work",
            "text": "Once per battle, at the start of any phase, this model can use this ability. If it does, until the end of the phase, all models in this model’s unit have a 4+ invulnerable save.",
            "sourceUnitId": "unit-tech-priest-manipulus"
          },
          {
            "id": "doctrina-imperatives",
            "sectionId": "doctrina-imperatives",
            "title": "Doctrina Imperatives",
            "text": "At the start of the battle round, you can select one of the Doctrina Imperatives below. Until the end of the battle round, that Doctrina Imperative is active for your army, and all units from your army that have the Doctrina Imperatives ability gain the relevant abilities shown below.\n\nPROTECTOR IMPERATIVE\n■ Ranged weapons equipped by models in this unit have the [HEAVY] ability.\n■ Improve the Ballistic Skill characteristic of ranged weapons equipped by models in this unit by 1.\n■ Each time a melee attack targets this unit, if this unit has the Battleline keyword and/or it is within 6\" of one or more friendly Adeptus Mechanicus Battleline units, subtract 1 from the Hit roll.\n\nCONQUEROR IMPERATIVE\n■ Ranged weapons equipped by models in this unit have the [ASSAULT] ability.\n■ Improve the Weapon Skill characteristic of melee weapons equipped by models in this unit by 1.\n■ Each time a model in this unit makes an attack, if this unit has the Battleline keyword and/or it is within 6\" of one or more friendly Adeptus Mechanicus Battleline units, improve the Armour Penetration characteristic of that attack by 1.",
            "sourceUnitId": "unit-tech-priest-manipulus"
          },
          {
            "id": "core-feel-no-pain",
            "sectionId": "core-feel-no-pain",
            "title": "Feel No Pain 5+",
            "text": "",
            "sourceUnitId": "unit-tech-priest-manipulus"
          }
        ],
        "models": [
          {
            "id": "unit-tech-priest-manipulus-model-644ccb0bae",
            "title": "Tech-Priest Manipulus",
            "aliases": [
              "Tech-Priest Manipulus"
            ],
            "legacyIds": [
              "unit-tech-priest-manipulus-model-tech-priest-manipulus"
            ]
          }
        ],
        "selections": [
          {
            "id": "unit-tech-priest-manipulus-selection-omnissian-staff",
            "title": "Omnissian staff",
            "aliases": [
              "Omnissian staff"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-tech-priest-manipulus-profile-f87e9bc505"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-tech-priest-manipulus-selection-magnarail-lance",
            "title": "Magnarail lance",
            "aliases": [
              "Magnarail lance"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-tech-priest-manipulus-profile-394f6240eb"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-tech-priest-manipulus-selection-transonic-cannon",
            "title": "Transonic cannon",
            "aliases": [
              "Transonic cannon"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-tech-priest-manipulus-profile-33abafe5c4"
            ],
            "wargearAbilityIds": []
          }
        ],
        "weaponFamilies": [],
        "weaponProfiles": [
          {
            "id": "unit-tech-priest-manipulus-profile-f87e9bc505",
            "legacyIds": [
              "unit-tech-priest-manipulus-profile-omnissian-staff-melee"
            ],
            "title": "Omnissian staff",
            "mode": "melee",
            "range": "Melee",
            "a": "4",
            "skill": "3+",
            "s": "6",
            "ap": "-1",
            "d": "2",
            "abilities": "",
            "sourceSelectionIds": [
              "unit-tech-priest-manipulus-selection-omnissian-staff"
            ]
          },
          {
            "id": "unit-tech-priest-manipulus-profile-394f6240eb",
            "legacyIds": [
              "unit-tech-priest-manipulus-profile-magnarail-lance-ranged-2"
            ],
            "title": "Magnarail lance",
            "mode": "ranged",
            "range": "36\"",
            "a": "1",
            "skill": "3+",
            "s": "7",
            "ap": "-2",
            "d": "3",
            "abilities": "Heavy",
            "sourceSelectionIds": [
              "unit-tech-priest-manipulus-selection-magnarail-lance"
            ]
          },
          {
            "id": "unit-tech-priest-manipulus-profile-33abafe5c4",
            "legacyIds": [
              "unit-tech-priest-manipulus-profile-transonic-cannon-ranged-3"
            ],
            "title": "Transonic cannon",
            "mode": "ranged",
            "range": "12\"",
            "a": "D6",
            "skill": "N/A",
            "s": "4",
            "ap": "0",
            "d": "2",
            "abilities": "Devastating Wounds, Torrent",
            "sourceSelectionIds": [
              "unit-tech-priest-manipulus-selection-transonic-cannon"
            ]
          }
        ],
        "wargearAbilities": []
      }
    },
    {
      "id": "unit-technoarcheologist",
      "title": "Technoarcheologist",
      "sourceBookId": "adeptus-mechanicus",
      "sourceLayer": "Codex transcription",
      "intrinsicKeywords": [
        "Technoarcheologist",
        "Imperium",
        "Adeptus Mechanicus",
        "Tech-Priest",
        "Character",
        "Infantry",
        "Cult Mechanicus"
      ],
      "relations": {
        "canLead": [],
        "canSupport": [
          {
            "unitId": "unit-corpuscarii-electro-priests",
            "maxCharacters": 2
          },
          {
            "unitId": "unit-fulgurite-electro-priests",
            "maxCharacters": 2
          },
          {
            "unitId": "unit-hastarii-exterminators",
            "maxCharacters": 2
          },
          {
            "unitId": "unit-hastarii-fusiliers",
            "maxCharacters": 2
          },
          {
            "unitId": "unit-kataphron-breachers",
            "maxCharacters": 2
          },
          {
            "unitId": "unit-kataphron-destroyers",
            "maxCharacters": 2
          },
          {
            "unitId": "unit-servitor-battleclade",
            "maxCharacters": 2
          },
          {
            "unitId": "unit-skitarii-rangers",
            "maxCharacters": 2
          },
          {
            "unitId": "unit-skitarii-vanguard",
            "maxCharacters": 2
          }
        ],
        "canBeLedBy": [],
        "canBeSupportedBy": []
      },
      "ruleFacts": {
        "relations": {
          "canLead": [],
          "canSupport": [
            {
              "unitId": "unit-corpuscarii-electro-priests",
              "maxCharacters": 2
            },
            {
              "unitId": "unit-fulgurite-electro-priests",
              "maxCharacters": 2
            },
            {
              "unitId": "unit-hastarii-exterminators",
              "maxCharacters": 2
            },
            {
              "unitId": "unit-hastarii-fusiliers",
              "maxCharacters": 2
            },
            {
              "unitId": "unit-kataphron-breachers",
              "maxCharacters": 2
            },
            {
              "unitId": "unit-kataphron-destroyers",
              "maxCharacters": 2
            },
            {
              "unitId": "unit-servitor-battleclade",
              "maxCharacters": 2
            },
            {
              "unitId": "unit-skitarii-rangers",
              "maxCharacters": 2
            },
            {
              "unitId": "unit-skitarii-vanguard",
              "maxCharacters": 2
            }
          ],
          "canBeLedBy": [],
          "canBeSupportedBy": []
        }
      },
      "gameSelections": {
        "stats": {
          "M": "6\"",
          "T": "4",
          "Sv": "3+",
          "W": "3",
          "Ld": "7+",
          "OC": "1",
          "Invulnerable": "5+"
        },
        "abilities": [
          {
            "id": "datasheet-seekers-of-divine-arcana",
            "sectionId": "datasheet-seekers-of-divine-arcana",
            "title": "Seekers of Divine Arcana",
            "text": "While this model is leading a unit, add 1 to the Objective Control characteristic of models in that unit.",
            "sourceUnitId": "unit-technoarcheologist"
          },
          {
            "id": "datasheet-cogitative-instincts",
            "sectionId": "datasheet-cogitative-instincts",
            "title": "Cogitative Instincts",
            "text": "Enemy units that are set up on the battlefield as Reinforcements cannot be set up within 12\" horizontally of this model.",
            "sourceUnitId": "unit-technoarcheologist"
          },
          {
            "id": "core-support",
            "sectionId": "core-support",
            "title": "Support",
            "text": "This model can be attached to the following units:\n■ Corpuscarii Electro-Priests\n■ Fulgurite Electro-Priests\n■ Hastarii Exterminators\n■ Hastarii Fusiliers\n■ Kataphron Breachers\n■ Kataphron Destroyers\n■ Servitor Battleclade\n■ Skitarii Rangers\n■ Skitarii Vanguard",
            "sourceUnitId": "unit-technoarcheologist"
          },
          {
            "id": "doctrina-imperatives",
            "sectionId": "doctrina-imperatives",
            "title": "Doctrina Imperatives",
            "text": "At the start of the battle round, you can select one of the Doctrina Imperatives below. Until the end of the battle round, that Doctrina Imperative is active for your army, and all units from your army that have the Doctrina Imperatives ability gain the relevant abilities shown below.\n\nPROTECTOR IMPERATIVE\n■ Ranged weapons equipped by models in this unit have the [HEAVY] ability.\n■ Improve the Ballistic Skill characteristic of ranged weapons equipped by models in this unit by 1.\n■ Each time a melee attack targets this unit, if this unit has the Battleline keyword and/or it is within 6\" of one or more friendly Adeptus Mechanicus Battleline units, subtract 1 from the Hit roll.\n\nCONQUEROR IMPERATIVE\n■ Ranged weapons equipped by models in this unit have the [ASSAULT] ability.\n■ Improve the Weapon Skill characteristic of melee weapons equipped by models in this unit by 1.\n■ Each time a model in this unit makes an attack, if this unit has the Battleline keyword and/or it is within 6\" of one or more friendly Adeptus Mechanicus Battleline units, improve the Armour Penetration characteristic of that attack by 1.",
            "sourceUnitId": "unit-technoarcheologist"
          },
          {
            "id": "core-feel-no-pain",
            "sectionId": "core-feel-no-pain",
            "title": "Feel No Pain 5+",
            "text": "",
            "sourceUnitId": "unit-technoarcheologist"
          }
        ],
        "models": [
          {
            "id": "unit-technoarcheologist-model-12d5a023ca",
            "title": "Technoarcheologist",
            "aliases": [
              "Technoarcheologist"
            ],
            "legacyIds": [
              "unit-technoarcheologist-model-technoarcheologist"
            ]
          }
        ],
        "selections": [
          {
            "id": "unit-technoarcheologist-selection-servo-arc-claw",
            "title": "Servo-arc claw",
            "aliases": [
              "Servo-arc claw"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-technoarcheologist-profile-65f081aa32"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-technoarcheologist-selection-mechanicus-pistol",
            "title": "Mechanicus pistol",
            "aliases": [
              "Mechanicus pistol"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-technoarcheologist-profile-3afd508261"
            ],
            "wargearAbilityIds": []
          }
        ],
        "weaponFamilies": [],
        "weaponProfiles": [
          {
            "id": "unit-technoarcheologist-profile-65f081aa32",
            "legacyIds": [
              "unit-technoarcheologist-profile-servo-arc-claw-melee"
            ],
            "title": "Servo-arc claw",
            "mode": "melee",
            "range": "Melee",
            "a": "3",
            "skill": "4+",
            "s": "8",
            "ap": "-2",
            "d": "2",
            "abilities": "Anti-Vehicle 4+, Devastating Wounds",
            "sourceSelectionIds": [
              "unit-technoarcheologist-selection-servo-arc-claw"
            ]
          },
          {
            "id": "unit-technoarcheologist-profile-3afd508261",
            "legacyIds": [
              "unit-technoarcheologist-profile-mechanicus-pistol-ranged-2"
            ],
            "title": "Mechanicus pistol",
            "mode": "ranged",
            "range": "12\"",
            "a": "1",
            "skill": "3+",
            "s": "6",
            "ap": "-1",
            "d": "1",
            "abilities": "Devastating Wounds, Pistol",
            "sourceSelectionIds": [
              "unit-technoarcheologist-selection-mechanicus-pistol"
            ]
          }
        ],
        "wargearAbilities": []
      }
    },
    {
      "id": "unit-skorpius-dunerider",
      "title": "Skorpius Dunerider",
      "sourceBookId": "adeptus-mechanicus",
      "sourceLayer": "Codex transcription",
      "intrinsicKeywords": [
        "Skorpius Dunerider",
        "Imperium",
        "Adeptus Mechanicus",
        "Vehicle",
        "Dedicated Transport",
        "Transport",
        "Skitarii",
        "Smoke",
        "Frame"
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
          "W": "11",
          "Ld": "7+",
          "OC": "2"
        },
        "abilities": [
          {
            "id": "datasheet-broad-spectrum-data-tether",
            "sectionId": "datasheet-broad-spectrum-data-tether",
            "title": "Broad spectrum data-tether",
            "text": "Each time you target this unit with a Stratagem, roll one D6: on a 5+, you gain 1CP.",
            "sourceUnitId": "unit-skorpius-dunerider"
          },
          {
            "id": "datasheet-fire-support",
            "sectionId": "datasheet-fire-support",
            "title": "Fire Support",
            "text": "In your Shooting phase, after this model has shot, select one enemy unit it scored one or more hits against this phase. Until the end of the phase, each time a friendly model that disembarked from this Transport this turn makes an attack that targets that enemy unit, you can re-roll the Wound roll.",
            "sourceUnitId": "unit-skorpius-dunerider"
          },
          {
            "id": "core-deadly-demise",
            "sectionId": "core-deadly-demise",
            "title": "Deadly Demise D3",
            "text": "",
            "sourceUnitId": "unit-skorpius-dunerider"
          },
          {
            "id": "doctrina-imperatives",
            "sectionId": "doctrina-imperatives",
            "title": "Doctrina Imperatives",
            "text": "At the start of the battle round, you can select one of the Doctrina Imperatives below. Until the end of the battle round, that Doctrina Imperative is active for your army, and all units from your army that have the Doctrina Imperatives ability gain the relevant abilities shown below.\n\nPROTECTOR IMPERATIVE\n■ Ranged weapons equipped by models in this unit have the [HEAVY] ability.\n■ Improve the Ballistic Skill characteristic of ranged weapons equipped by models in this unit by 1.\n■ Each time a melee attack targets this unit, if this unit has the Battleline keyword and/or it is within 6\" of one or more friendly Adeptus Mechanicus Battleline units, subtract 1 from the Hit roll.\n\nCONQUEROR IMPERATIVE\n■ Ranged weapons equipped by models in this unit have the [ASSAULT] ability.\n■ Improve the Weapon Skill characteristic of melee weapons equipped by models in this unit by 1.\n■ Each time a model in this unit makes an attack, if this unit has the Battleline keyword and/or it is within 6\" of one or more friendly Adeptus Mechanicus Battleline units, improve the Armour Penetration characteristic of that attack by 1.",
            "sourceUnitId": "unit-skorpius-dunerider"
          },
          {
            "id": "core-firing-deck",
            "sectionId": "core-firing-deck",
            "title": "Firing Deck 2",
            "text": "",
            "sourceUnitId": "unit-skorpius-dunerider"
          }
        ],
        "models": [
          {
            "id": "unit-skorpius-dunerider-model-214150d8aa",
            "title": "Skorpius Dunerider",
            "aliases": [
              "Skorpius Dunerider"
            ],
            "legacyIds": [
              "unit-skorpius-dunerider-model-skorpius-dunerider"
            ]
          }
        ],
        "selections": [
          {
            "id": "unit-skorpius-dunerider-selection-armoured-hull",
            "title": "Armoured hull",
            "aliases": [
              "Armoured hull"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-skorpius-dunerider-profile-7809a5e4d6"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-skorpius-dunerider-selection-cognis-heavy-stubber-array",
            "title": "Cognis heavy stubber array",
            "aliases": [
              "Cognis heavy stubber array"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-skorpius-dunerider-profile-d60783ae2b"
            ],
            "wargearAbilityIds": []
          }
        ],
        "weaponFamilies": [],
        "weaponProfiles": [
          {
            "id": "unit-skorpius-dunerider-profile-7809a5e4d6",
            "legacyIds": [
              "unit-skorpius-dunerider-profile-armoured-hull-melee"
            ],
            "title": "Armoured hull",
            "mode": "melee",
            "range": "Melee",
            "a": "3",
            "skill": "4+",
            "s": "6",
            "ap": "0",
            "d": "1",
            "abilities": "",
            "sourceSelectionIds": [
              "unit-skorpius-dunerider-selection-armoured-hull"
            ]
          },
          {
            "id": "unit-skorpius-dunerider-profile-d60783ae2b",
            "legacyIds": [
              "unit-skorpius-dunerider-profile-cognis-heavy-stubber-array-ranged-2"
            ],
            "title": "Cognis heavy stubber array",
            "mode": "ranged",
            "range": "36\"",
            "a": "9",
            "skill": "4+",
            "s": "4",
            "ap": "0",
            "d": "1",
            "abilities": "Rapid Fire 9, Sustained Hits 1, Twin-linked",
            "sourceSelectionIds": [
              "unit-skorpius-dunerider-selection-cognis-heavy-stubber-array"
            ]
          }
        ],
        "wargearAbilities": []
      }
    },
    {
      "id": "unit-belisarius-cawl",
      "title": "Belisarius Cawl",
      "sourceBookId": "adeptus-mechanicus",
      "sourceLayer": "Codex transcription",
      "intrinsicKeywords": [
        "Belisarius Cawl",
        "Epic Hero",
        "Monster",
        "Character",
        "Tech-Priest",
        "Adeptus Mechanicus",
        "Imperium",
        "Cult Mechanicus",
        "Mobile"
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
          "T": "8",
          "Sv": "2+",
          "W": "10",
          "Ld": "6+",
          "OC": "3",
          "Invulnerable": "4+"
        },
        "abilities": [
          {
            "id": "datasheet-canticles-of-the-omnissiah",
            "sectionId": "datasheet-canticles-of-the-omnissiah",
            "title": "Canticles of the Omnissiah",
            "text": "",
            "sourceUnitId": "unit-belisarius-cawl"
          },
          {
            "id": "datasheet-mechanicus-bodyguard",
            "sectionId": "datasheet-mechanicus-bodyguard",
            "title": "Mechanicus Bodyguard",
            "text": "While this model is within 3\" of one or more other friendly Adeptus Mechanicus units, this model has the Lone Operative ability.",
            "sourceUnitId": "unit-belisarius-cawl"
          },
          {
            "id": "datasheet-self-repair-mechanisms",
            "sectionId": "datasheet-self-repair-mechanisms",
            "title": "Self-repair Mechanisms",
            "text": "At the start of your Command phase, this model regains up to D3 lost wounds.",
            "sourceUnitId": "unit-belisarius-cawl"
          },
          {
            "id": "datasheet-supreme-commander",
            "sectionId": "datasheet-supreme-commander",
            "title": "Supreme Commander",
            "text": "If this model is in your army, it must be your Warlord.",
            "sourceUnitId": "unit-belisarius-cawl"
          },
          {
            "id": "doctrina-imperatives",
            "sectionId": "doctrina-imperatives",
            "title": "Doctrina Imperatives",
            "text": "At the start of the battle round, you can select one of the Doctrina Imperatives below. Until the end of the battle round, that Doctrina Imperative is active for your army, and all units from your army that have the Doctrina Imperatives ability gain the relevant abilities shown below.\n\nPROTECTOR IMPERATIVE\n■ Ranged weapons equipped by models in this unit have the [HEAVY] ability.\n■ Improve the Ballistic Skill characteristic of ranged weapons equipped by models in this unit by 1.\n■ Each time a melee attack targets this unit, if this unit has the Battleline keyword and/or it is within 6\" of one or more friendly Adeptus Mechanicus Battleline units, subtract 1 from the Hit roll.\n\nCONQUEROR IMPERATIVE\n■ Ranged weapons equipped by models in this unit have the [ASSAULT] ability.\n■ Improve the Weapon Skill characteristic of melee weapons equipped by models in this unit by 1.\n■ Each time a model in this unit makes an attack, if this unit has the Battleline keyword and/or it is within 6\" of one or more friendly Adeptus Mechanicus Battleline units, improve the Armour Penetration characteristic of that attack by 1.",
            "sourceUnitId": "unit-belisarius-cawl"
          },
          {
            "id": "core-feel-no-pain",
            "sectionId": "core-feel-no-pain",
            "title": "Feel No Pain 5+",
            "text": "",
            "sourceUnitId": "unit-belisarius-cawl"
          }
        ],
        "models": [
          {
            "id": "unit-belisarius-cawl-model-4f263c7145",
            "title": "Belisarius Cawl",
            "aliases": [
              "Belisarius Cawl",
              "Belisarius Cawl – EPIC HERO"
            ],
            "legacyIds": [
              "unit-belisarius-cawl-model-belisarius-cawl"
            ]
          }
        ],
        "selections": [
          {
            "id": "unit-belisarius-cawl-selection-arc-scourge",
            "title": "Arc Scourge",
            "aliases": [
              "Arc Scourge"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-belisarius-cawl-profile-c56e9d1cbb"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-belisarius-cawl-selection-cawls-omnissian-axe",
            "title": "Cawl's Omnissian axe",
            "aliases": [
              "Cawl's Omnissian axe"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-belisarius-cawl-profile-c53d9922ab"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-belisarius-cawl-selection-mechadendrite-hive",
            "title": "Mechadendrite hive",
            "aliases": [
              "Mechadendrite hive"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-belisarius-cawl-profile-959110435e"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-belisarius-cawl-selection-solar-atomiser",
            "title": "Solar atomiser",
            "aliases": [
              "Solar atomiser"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-belisarius-cawl-profile-98f1721c9f"
            ],
            "wargearAbilityIds": []
          }
        ],
        "weaponFamilies": [],
        "weaponProfiles": [
          {
            "id": "unit-belisarius-cawl-profile-c56e9d1cbb",
            "legacyIds": [
              "unit-belisarius-cawl-profile-arc-scourge-melee"
            ],
            "title": "Arc Scourge",
            "mode": "melee",
            "range": "Melee",
            "a": "4",
            "skill": "2+",
            "s": "5",
            "ap": "-1",
            "d": "1",
            "abilities": "Anti-Vehicle 4+, Devastating Wounds, Extra Attacks",
            "sourceSelectionIds": [
              "unit-belisarius-cawl-selection-arc-scourge"
            ]
          },
          {
            "id": "unit-belisarius-cawl-profile-c53d9922ab",
            "legacyIds": [
              "unit-belisarius-cawl-profile-cawls-omnissian-axe-melee-2"
            ],
            "title": "Cawl's Omnissian axe",
            "mode": "melee",
            "range": "Melee",
            "a": "4",
            "skill": "2+",
            "s": "8",
            "ap": "-2",
            "d": "2",
            "abilities": "",
            "sourceSelectionIds": [
              "unit-belisarius-cawl-selection-cawls-omnissian-axe"
            ]
          },
          {
            "id": "unit-belisarius-cawl-profile-959110435e",
            "legacyIds": [
              "unit-belisarius-cawl-profile-mechadendrite-hive-melee-3"
            ],
            "title": "Mechadendrite hive",
            "mode": "melee",
            "range": "Melee",
            "a": "2D6",
            "skill": "3+",
            "s": "4",
            "ap": "0",
            "d": "1",
            "abilities": "Extra Attacks",
            "sourceSelectionIds": [
              "unit-belisarius-cawl-selection-mechadendrite-hive"
            ]
          },
          {
            "id": "unit-belisarius-cawl-profile-98f1721c9f",
            "legacyIds": [
              "unit-belisarius-cawl-profile-solar-atomiser-ranged-4"
            ],
            "title": "Solar atomiser",
            "mode": "ranged",
            "range": "18\"",
            "a": "3",
            "skill": "2+",
            "s": "14",
            "ap": "-4",
            "d": "D6",
            "abilities": "Melta 3",
            "sourceSelectionIds": [
              "unit-belisarius-cawl-selection-solar-atomiser"
            ]
          }
        ],
        "wargearAbilities": []
      }
    },
    {
      "id": "unit-thulia-ghuld",
      "title": "Thulia Ghuld",
      "sourceBookId": "adeptus-mechanicus",
      "sourceLayer": "Faction Pack",
      "intrinsicKeywords": [
        "MONSTER",
        "CHARACTER",
        "MOBILE",
        "EPIC HERO",
        "IMPERIUM",
        "CULT MECHANICUS",
        "TECH-PRIEST",
        "THULIA GHULD",
        "ADEPTUS MECHANICUS"
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
          "T": "8",
          "SV": "2+",
          "W": "10",
          "LD": "6+",
          "OC": "3",
          "Invulnerable": "4+"
        },
        "abilities": [
          {
            "id": "doctrina-imperatives",
            "sectionId": "doctrina-imperatives",
            "title": "Doctrina Imperatives",
            "text": "This unit has the Doctrina Imperatives Faction ability.",
            "sourceUnitId": "unit-thulia-ghuld"
          },
          {
            "id": "datasheet-rod-of-the-war-forge",
            "sectionId": "datasheet-rod-of-the-war-forge",
            "title": "Rod of the War Forge",
            "text": "In your Command phase, select one of the abilities in the Icon of War section (see next page). Until the start of your next Command phase, this model has that ability.",
            "sourceUnitId": "unit-thulia-ghuld"
          },
          {
            "id": "datasheet-mechanicus-bodyguard",
            "sectionId": "datasheet-mechanicus-bodyguard",
            "title": "Mechanicus Bodyguard",
            "text": "While this model is within 3\" of one or more other friendly ADEPTUS MECHANICUS units, this model has the Lone Operative ability.",
            "sourceUnitId": "unit-thulia-ghuld"
          },
          {
            "id": "datasheet-secutor-of-olympus",
            "sectionId": "datasheet-secutor-of-olympus",
            "title": "Secutor of Olympus",
            "text": "At the start of your Shooting phase, select one enemy VEHICLE unit within 12\" of this model and roll one D6: on a 2+, that enemy unit suffers D3+1 mortal wounds.",
            "sourceUnitId": "unit-thulia-ghuld"
          },
          {
            "id": "datasheet-supreme-commander",
            "sectionId": "datasheet-supreme-commander",
            "title": "Supreme Commander",
            "text": "If this model is in your army, it must be your Warlord.",
            "sourceUnitId": "unit-thulia-ghuld"
          },
          {
            "id": "datasheet-icon-of-war",
            "sectionId": "datasheet-icon-of-war",
            "title": "Icon of War",
            "text": "",
            "sourceUnitId": "unit-thulia-ghuld"
          }
        ],
        "models": [
          {
            "id": "unit-thulia-ghuld-model-263b6b505e",
            "title": "Archmagos Terminus Thulia Ghuld",
            "aliases": [
              "Archmagos Terminus Thulia Ghuld",
              "Archmagos Terminus Thulia Ghuld – EPIC HERO"
            ],
            "legacyIds": [
              "unit-thulia-ghuld-model-archmagos-terminus-thulia-ghuld"
            ]
          }
        ],
        "selections": [
          {
            "id": "unit-thulia-ghuld-selection-jericho-class-conversion-resonator-titanic-impact",
            "title": "Jericho-class conversion resonator - titanic impact",
            "aliases": [
              "Jericho-class conversion resonator - titanic impact"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-thulia-ghuld-profile-53b49dbc46"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-thulia-ghuld-selection-jericho-class-conversion-resonator-shockwave",
            "title": "Jericho-class conversion resonator - shockwave",
            "aliases": [
              "Jericho-class conversion resonator - shockwave"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-thulia-ghuld-profile-3b06e93bc0"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-thulia-ghuld-selection-rod-of-the-war-forge-strike",
            "title": "Rod of the War Forge - strike",
            "aliases": [
              "Rod of the War Forge - strike"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-thulia-ghuld-profile-f4b45aad05"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-thulia-ghuld-selection-rod-of-the-war-forge-sweep",
            "title": "Rod of the War Forge - sweep",
            "aliases": [
              "Rod of the War Forge - sweep"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-thulia-ghuld-profile-c466e338e6"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-thulia-ghuld-weapon-family-jericho-class-conversion-resonator-selection",
            "title": "Jericho-class conversion resonator",
            "aliases": [
              "Jericho-class conversion resonator"
            ],
            "kind": "weapon",
            "familyId": "unit-thulia-ghuld-weapon-family-jericho-class-conversion-resonator",
            "profileIds": [
              "unit-thulia-ghuld-profile-53b49dbc46",
              "unit-thulia-ghuld-profile-3b06e93bc0"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-thulia-ghuld-weapon-family-rod-of-the-war-forge-selection",
            "title": "Rod of the War Forge",
            "aliases": [
              "Rod of the War Forge"
            ],
            "kind": "weapon",
            "familyId": "unit-thulia-ghuld-weapon-family-rod-of-the-war-forge",
            "profileIds": [
              "unit-thulia-ghuld-profile-f4b45aad05",
              "unit-thulia-ghuld-profile-c466e338e6"
            ],
            "wargearAbilityIds": []
          }
        ],
        "weaponFamilies": [
          {
            "id": "unit-thulia-ghuld-weapon-family-jericho-class-conversion-resonator",
            "title": "Jericho-class conversion resonator",
            "aliases": [
              "Jericho-class conversion resonator"
            ],
            "profileIds": [
              "unit-thulia-ghuld-profile-53b49dbc46",
              "unit-thulia-ghuld-profile-3b06e93bc0"
            ],
            "ambiguousAlias": false
          },
          {
            "id": "unit-thulia-ghuld-weapon-family-rod-of-the-war-forge",
            "title": "Rod of the War Forge",
            "aliases": [
              "Rod of the War Forge"
            ],
            "profileIds": [
              "unit-thulia-ghuld-profile-f4b45aad05",
              "unit-thulia-ghuld-profile-c466e338e6"
            ],
            "ambiguousAlias": false
          }
        ],
        "weaponProfiles": [
          {
            "id": "unit-thulia-ghuld-profile-53b49dbc46",
            "legacyIds": [
              "unit-thulia-ghuld-profile-jericho-class-conversion-resonator-titanic-impact-ranged"
            ],
            "title": "Jericho-class conversion resonator - titanic impact",
            "mode": "ranged",
            "range": "24\"",
            "a": "2",
            "skill": "2+",
            "s": "12",
            "ap": "-3",
            "d": "D6+2",
            "abilities": "Devastating Wounds",
            "sourceSelectionIds": [
              "unit-thulia-ghuld-selection-jericho-class-conversion-resonator-titanic-impact",
              "unit-thulia-ghuld-weapon-family-jericho-class-conversion-resonator-selection"
            ]
          },
          {
            "id": "unit-thulia-ghuld-profile-3b06e93bc0",
            "legacyIds": [
              "unit-thulia-ghuld-profile-jericho-class-conversion-resonator-shockwave-ranged-2"
            ],
            "title": "Jericho-class conversion resonator - shockwave",
            "mode": "ranged",
            "range": "24\"",
            "a": "D6+2",
            "skill": "2+",
            "s": "6",
            "ap": "-2",
            "d": "1",
            "abilities": "Blast, Sustained Hits 1",
            "sourceSelectionIds": [
              "unit-thulia-ghuld-selection-jericho-class-conversion-resonator-shockwave",
              "unit-thulia-ghuld-weapon-family-jericho-class-conversion-resonator-selection"
            ]
          },
          {
            "id": "unit-thulia-ghuld-profile-f4b45aad05",
            "legacyIds": [
              "unit-thulia-ghuld-profile-rod-of-the-war-forge-strike-melee-3"
            ],
            "title": "Rod of the War Forge - strike",
            "mode": "melee",
            "range": "Melee",
            "a": "6",
            "skill": "2+",
            "s": "10",
            "ap": "-2",
            "d": "3",
            "abilities": "",
            "sourceSelectionIds": [
              "unit-thulia-ghuld-selection-rod-of-the-war-forge-strike",
              "unit-thulia-ghuld-weapon-family-rod-of-the-war-forge-selection"
            ]
          },
          {
            "id": "unit-thulia-ghuld-profile-c466e338e6",
            "legacyIds": [
              "unit-thulia-ghuld-profile-rod-of-the-war-forge-sweep-melee-4"
            ],
            "title": "Rod of the War Forge - sweep",
            "mode": "melee",
            "range": "Melee",
            "a": "12",
            "skill": "2+",
            "s": "6",
            "ap": "-1",
            "d": "1",
            "abilities": "",
            "sourceSelectionIds": [
              "unit-thulia-ghuld-selection-rod-of-the-war-forge-sweep",
              "unit-thulia-ghuld-weapon-family-rod-of-the-war-forge-selection"
            ]
          }
        ],
        "wargearAbilities": []
      }
    },
    {
      "id": "unit-corpuscarii-electro-priests",
      "title": "Corpuscarii Electro-Priests",
      "sourceBookId": "adeptus-mechanicus",
      "sourceLayer": "Codex transcription",
      "intrinsicKeywords": [
        "Electro-Priests",
        "Corpuscarii",
        "Imperium",
        "Infantry",
        "Adeptus Mechanicus",
        "Cult Mechanicus"
      ],
      "relations": {
        "canLead": [],
        "canSupport": [],
        "canBeLedBy": [
          {
            "unitId": "unit-tech-priest-dominus",
            "maxCharacters": 2
          },
          {
            "unitId": "unit-tech-priest-enginseer",
            "maxCharacters": 2
          },
          {
            "unitId": "unit-tech-priest-manipulus",
            "maxCharacters": 2
          }
        ],
        "canBeSupportedBy": [
          {
            "unitId": "unit-technoarcheologist",
            "maxCharacters": 2
          }
        ]
      },
      "ruleFacts": {
        "relations": {
          "canLead": [],
          "canSupport": [],
          "canBeLedBy": [
            {
              "unitId": "unit-tech-priest-dominus",
              "maxCharacters": 2
            },
            {
              "unitId": "unit-tech-priest-enginseer",
              "maxCharacters": 2
            },
            {
              "unitId": "unit-tech-priest-manipulus",
              "maxCharacters": 2
            }
          ],
          "canBeSupportedBy": [
            {
              "unitId": "unit-technoarcheologist",
              "maxCharacters": 2
            }
          ]
        }
      },
      "gameSelections": {
        "stats": {
          "M": "6\"",
          "T": "3",
          "Sv": "7+",
          "W": "1",
          "Ld": "7+",
          "OC": "1",
          "Invulnerable": "5+"
        },
        "abilities": [
          {
            "id": "datasheet-electro-shock",
            "sectionId": "datasheet-electro-shock",
            "title": "Electro-shock",
            "text": "In your Shooting phase, after this unit has shot, select one enemy unit (excluding Monsters and Vehicles) hit by one or more of those attacks. Until the end of your opponent’s next turn, that enemy unit is shocked. While a unit is shocked, subtract 2\" from its Move characteristic and subtract 2 from Advance and Charge rolls made for it.",
            "sourceUnitId": "unit-corpuscarii-electro-priests"
          },
          {
            "id": "core-feel-no-pain",
            "sectionId": "core-feel-no-pain",
            "title": "Feel No Pain 5+",
            "text": "",
            "sourceUnitId": "unit-corpuscarii-electro-priests"
          },
          {
            "id": "doctrina-imperatives",
            "sectionId": "doctrina-imperatives",
            "title": "Doctrina Imperatives",
            "text": "At the start of the battle round, you can select one of the Doctrina Imperatives below. Until the end of the battle round, that Doctrina Imperative is active for your army, and all units from your army that have the Doctrina Imperatives ability gain the relevant abilities shown below.\n\nPROTECTOR IMPERATIVE\n■ Ranged weapons equipped by models in this unit have the [HEAVY] ability.\n■ Improve the Ballistic Skill characteristic of ranged weapons equipped by models in this unit by 1.\n■ Each time a melee attack targets this unit, if this unit has the Battleline keyword and/or it is within 6\" of one or more friendly Adeptus Mechanicus Battleline units, subtract 1 from the Hit roll.\n\nCONQUEROR IMPERATIVE\n■ Ranged weapons equipped by models in this unit have the [ASSAULT] ability.\n■ Improve the Weapon Skill characteristic of melee weapons equipped by models in this unit by 1.\n■ Each time a model in this unit makes an attack, if this unit has the Battleline keyword and/or it is within 6\" of one or more friendly Adeptus Mechanicus Battleline units, improve the Armour Penetration characteristic of that attack by 1.",
            "sourceUnitId": "unit-corpuscarii-electro-priests"
          }
        ],
        "models": [
          {
            "id": "unit-corpuscarii-electro-priests-model-2987d8d562",
            "title": "Corpuscarii Electro-Priest",
            "aliases": [
              "Corpuscarii Electro-Priest",
              "Corpuscarii Electro-Priests"
            ],
            "legacyIds": [
              "unit-corpuscarii-electro-priests-model-corpuscarii-electro-priest"
            ]
          }
        ],
        "selections": [
          {
            "id": "unit-corpuscarii-electro-priests-selection-electrostatic-gauntlets",
            "title": "Electrostatic gauntlets",
            "aliases": [
              "Electrostatic gauntlets"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-corpuscarii-electro-priests-profile-6a2f5652f2",
              "unit-corpuscarii-electro-priests-profile-a11221f038"
            ],
            "wargearAbilityIds": []
          }
        ],
        "weaponFamilies": [],
        "weaponProfiles": [
          {
            "id": "unit-corpuscarii-electro-priests-profile-6a2f5652f2",
            "legacyIds": [
              "unit-corpuscarii-electro-priests-profile-electrostatic-gauntlets-ranged"
            ],
            "title": "Electrostatic gauntlets",
            "mode": "ranged",
            "range": "12\"",
            "a": "3",
            "skill": "3+",
            "s": "5",
            "ap": "0",
            "d": "1",
            "abilities": "Pistol, Sustained Hits 2",
            "sourceSelectionIds": [
              "unit-corpuscarii-electro-priests-selection-electrostatic-gauntlets"
            ]
          },
          {
            "id": "unit-corpuscarii-electro-priests-profile-a11221f038",
            "legacyIds": [
              "unit-corpuscarii-electro-priests-profile-electrostatic-gauntlets-melee-2"
            ],
            "title": "Electrostatic gauntlets",
            "mode": "melee",
            "range": "Melee",
            "a": "3",
            "skill": "4+",
            "s": "5",
            "ap": "0",
            "d": "1",
            "abilities": "Sustained Hits 2",
            "sourceSelectionIds": [
              "unit-corpuscarii-electro-priests-selection-electrostatic-gauntlets"
            ]
          }
        ],
        "wargearAbilities": []
      }
    },
    {
      "id": "unit-fulgurite-electro-priests",
      "title": "Fulgurite Electro-Priests",
      "sourceBookId": "adeptus-mechanicus",
      "sourceLayer": "Codex transcription",
      "intrinsicKeywords": [
        "Electro-Priests",
        "Fulgurite",
        "Infantry",
        "Imperium",
        "Adeptus Mechanicus",
        "Cult Mechanicus"
      ],
      "relations": {
        "canLead": [],
        "canSupport": [],
        "canBeLedBy": [
          {
            "unitId": "unit-tech-priest-dominus",
            "maxCharacters": 2
          },
          {
            "unitId": "unit-tech-priest-enginseer",
            "maxCharacters": 2
          },
          {
            "unitId": "unit-tech-priest-manipulus",
            "maxCharacters": 2
          }
        ],
        "canBeSupportedBy": [
          {
            "unitId": "unit-technoarcheologist",
            "maxCharacters": 2
          }
        ]
      },
      "ruleFacts": {
        "relations": {
          "canLead": [],
          "canSupport": [],
          "canBeLedBy": [
            {
              "unitId": "unit-tech-priest-dominus",
              "maxCharacters": 2
            },
            {
              "unitId": "unit-tech-priest-enginseer",
              "maxCharacters": 2
            },
            {
              "unitId": "unit-tech-priest-manipulus",
              "maxCharacters": 2
            }
          ],
          "canBeSupportedBy": [
            {
              "unitId": "unit-technoarcheologist",
              "maxCharacters": 2
            }
          ]
        }
      },
      "gameSelections": {
        "stats": {
          "M": "6\"",
          "T": "3",
          "Sv": "7+",
          "W": "1",
          "Ld": "7+",
          "OC": "1",
          "Invulnerable": "5+"
        },
        "abilities": [
          {
            "id": "datasheet-electro-infusion",
            "sectionId": "datasheet-electro-infusion",
            "title": "Electro-Infusion",
            "text": "While a Character model is leading this unit, each time an attack targets this unit, subtract 1 from the Wound roll.",
            "sourceUnitId": "unit-fulgurite-electro-priests"
          },
          {
            "id": "doctrina-imperatives",
            "sectionId": "doctrina-imperatives",
            "title": "Doctrina Imperatives",
            "text": "At the start of the battle round, you can select one of the Doctrina Imperatives below. Until the end of the battle round, that Doctrina Imperative is active for your army, and all units from your army that have the Doctrina Imperatives ability gain the relevant abilities shown below.\n\nPROTECTOR IMPERATIVE\n■ Ranged weapons equipped by models in this unit have the [HEAVY] ability.\n■ Improve the Ballistic Skill characteristic of ranged weapons equipped by models in this unit by 1.\n■ Each time a melee attack targets this unit, if this unit has the Battleline keyword and/or it is within 6\" of one or more friendly Adeptus Mechanicus Battleline units, subtract 1 from the Hit roll.\n\nCONQUEROR IMPERATIVE\n■ Ranged weapons equipped by models in this unit have the [ASSAULT] ability.\n■ Improve the Weapon Skill characteristic of melee weapons equipped by models in this unit by 1.\n■ Each time a model in this unit makes an attack, if this unit has the Battleline keyword and/or it is within 6\" of one or more friendly Adeptus Mechanicus Battleline units, improve the Armour Penetration characteristic of that attack by 1.",
            "sourceUnitId": "unit-fulgurite-electro-priests"
          },
          {
            "id": "core-feel-no-pain",
            "sectionId": "core-feel-no-pain",
            "title": "Feel No Pain 5+",
            "text": "",
            "sourceUnitId": "unit-fulgurite-electro-priests"
          }
        ],
        "models": [
          {
            "id": "unit-fulgurite-electro-priests-model-c83171f21e",
            "title": "Fulgurite Electro-Priest",
            "aliases": [
              "Fulgurite Electro-Priest",
              "Fulgurite Electro-Priests"
            ],
            "legacyIds": [
              "unit-fulgurite-electro-priests-model-fulgurite-electro-priest"
            ]
          }
        ],
        "selections": [
          {
            "id": "unit-fulgurite-electro-priests-selection-electroleech-stave",
            "title": "Electroleech stave",
            "aliases": [
              "Electroleech stave"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-fulgurite-electro-priests-profile-cf7718ae6f"
            ],
            "wargearAbilityIds": []
          }
        ],
        "weaponFamilies": [],
        "weaponProfiles": [
          {
            "id": "unit-fulgurite-electro-priests-profile-cf7718ae6f",
            "legacyIds": [
              "unit-fulgurite-electro-priests-profile-electroleech-stave-melee"
            ],
            "title": "Electroleech stave",
            "mode": "melee",
            "range": "Melee",
            "a": "2",
            "skill": "3+",
            "s": "6",
            "ap": "-1",
            "d": "2",
            "abilities": "Devastating Wounds",
            "sourceSelectionIds": [
              "unit-fulgurite-electro-priests-selection-electroleech-stave"
            ]
          }
        ],
        "wargearAbilities": []
      }
    },
    {
      "id": "unit-hastarii-exterminators",
      "title": "Hastarii Exterminators",
      "sourceBookId": "adeptus-mechanicus",
      "sourceLayer": "Faction Pack",
      "intrinsicKeywords": [
        "INFANTRY",
        "IMPERIUM",
        "SKITARII",
        "HASTARII",
        "EXTERMINATORS",
        "ADEPTUS MECHANICUS"
      ],
      "relations": {
        "canLead": [],
        "canSupport": [],
        "canBeLedBy": [
          {
            "unitId": "unit-tech-priest-dominus",
            "maxCharacters": 2
          },
          {
            "unitId": "unit-tech-priest-enginseer",
            "maxCharacters": 2
          },
          {
            "unitId": "unit-tech-priest-manipulus",
            "maxCharacters": 2
          }
        ],
        "canBeSupportedBy": [
          {
            "unitId": "unit-skitarii-marshal",
            "maxCharacters": 2
          },
          {
            "unitId": "unit-technoarcheologist",
            "maxCharacters": 2
          }
        ]
      },
      "ruleFacts": {
        "relations": {
          "canLead": [],
          "canSupport": [],
          "canBeLedBy": [
            {
              "unitId": "unit-tech-priest-dominus",
              "maxCharacters": 2
            },
            {
              "unitId": "unit-tech-priest-enginseer",
              "maxCharacters": 2
            },
            {
              "unitId": "unit-tech-priest-manipulus",
              "maxCharacters": 2
            }
          ],
          "canBeSupportedBy": [
            {
              "unitId": "unit-skitarii-marshal",
              "maxCharacters": 2
            },
            {
              "unitId": "unit-technoarcheologist",
              "maxCharacters": 2
            }
          ]
        }
      },
      "gameSelections": {
        "stats": {
          "M": "5\"",
          "T": "4",
          "SV": "3+",
          "W": "2",
          "LD": "7+",
          "OC": "1",
          "Invulnerable": "5+"
        },
        "abilities": [
          {
            "id": "doctrina-imperatives",
            "sectionId": "doctrina-imperatives",
            "title": "Doctrina Imperatives",
            "text": "This unit has the Doctrina Imperatives Faction ability.",
            "sourceUnitId": "unit-hastarii-exterminators"
          },
          {
            "id": "datasheet-broad-spectrum-targeting-augurs",
            "sectionId": "datasheet-broad-spectrum-targeting-augurs",
            "title": "Broad-spectrum Targeting Augurs",
            "text": "Each time a model in this unit makes an attack with an eradication caster that targets a unit (excluding MONSTER and VEHICLE units), that attack has the [SUSTAINED HITS 1] ability.",
            "sourceUnitId": "unit-hastarii-exterminators"
          },
          {
            "id": "datasheet-attached-unit",
            "sectionId": "datasheet-attached-unit",
            "title": "Attached Unit",
            "text": "If a CHARACTER unit from your army can be attached to a SKITARII RANGERS unit, it can be attached to this unit instead",
            "sourceUnitId": "unit-hastarii-exterminators"
          }
        ],
        "models": [
          {
            "id": "unit-hastarii-exterminators-model-0474657a77",
            "title": "Hastarii Exterminator Alpha",
            "aliases": [
              "Hastarii Exterminator Alpha"
            ],
            "legacyIds": [
              "unit-hastarii-exterminators-model-hastarii-exterminator-alpha"
            ]
          },
          {
            "id": "unit-hastarii-exterminators-model-f608737ee3",
            "title": "Hastarii Exterminator",
            "aliases": [
              "Hastarii Exterminator",
              "Hastarii Exterminators"
            ],
            "legacyIds": [
              "unit-hastarii-exterminators-model-hastarii-exterminator-2"
            ]
          }
        ],
        "selections": [
          {
            "id": "unit-hastarii-exterminators-selection-hastarii-arc-blaster",
            "title": "Hastarii arc blaster",
            "aliases": [
              "Hastarii arc blaster"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-hastarii-exterminators-profile-2e7a681394"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-hastarii-exterminators-selection-eradication-caster-dissipated",
            "title": "Eradication caster - dissipated",
            "aliases": [
              "Eradication caster - dissipated"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-hastarii-exterminators-profile-1c6ca76b13"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-hastarii-exterminators-selection-eradication-caster-focused",
            "title": "Eradication caster - focused",
            "aliases": [
              "Eradication caster - focused"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-hastarii-exterminators-profile-5717c27202"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-hastarii-exterminators-selection-close-combat-weapon",
            "title": "Close-combat weapon",
            "aliases": [
              "Close-combat weapon"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-hastarii-exterminators-profile-26b89e7ead"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-hastarii-exterminators-selection-power-weapon",
            "title": "Power weapon",
            "aliases": [
              "Power weapon"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-hastarii-exterminators-profile-ac5b526e9c"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-hastarii-exterminators-weapon-family-eradication-caster-selection",
            "title": "Eradication caster",
            "aliases": [
              "Eradication caster"
            ],
            "kind": "weapon",
            "familyId": "unit-hastarii-exterminators-weapon-family-eradication-caster",
            "profileIds": [
              "unit-hastarii-exterminators-profile-1c6ca76b13",
              "unit-hastarii-exterminators-profile-5717c27202"
            ],
            "wargearAbilityIds": []
          }
        ],
        "weaponFamilies": [
          {
            "id": "unit-hastarii-exterminators-weapon-family-eradication-caster",
            "title": "Eradication caster",
            "aliases": [
              "Eradication caster"
            ],
            "profileIds": [
              "unit-hastarii-exterminators-profile-1c6ca76b13",
              "unit-hastarii-exterminators-profile-5717c27202"
            ],
            "ambiguousAlias": false
          }
        ],
        "weaponProfiles": [
          {
            "id": "unit-hastarii-exterminators-profile-2e7a681394",
            "legacyIds": [
              "unit-hastarii-exterminators-profile-hastarii-arc-blaster-ranged"
            ],
            "title": "Hastarii arc blaster",
            "mode": "ranged",
            "range": "18\"",
            "a": "1",
            "skill": "4+",
            "s": "6",
            "ap": "-1",
            "d": "2",
            "abilities": "Anti-Vehicle 4+, Devastating Wounds",
            "sourceSelectionIds": [
              "unit-hastarii-exterminators-selection-hastarii-arc-blaster"
            ]
          },
          {
            "id": "unit-hastarii-exterminators-profile-1c6ca76b13",
            "legacyIds": [
              "unit-hastarii-exterminators-profile-eradication-caster-dissipated-ranged-2"
            ],
            "title": "Eradication caster - dissipated",
            "mode": "ranged",
            "range": "30\"",
            "a": "2",
            "skill": "4+",
            "s": "5",
            "ap": "-1",
            "d": "2",
            "abilities": "Anti-Infantry 4+",
            "sourceSelectionIds": [
              "unit-hastarii-exterminators-selection-eradication-caster-dissipated",
              "unit-hastarii-exterminators-weapon-family-eradication-caster-selection"
            ]
          },
          {
            "id": "unit-hastarii-exterminators-profile-5717c27202",
            "legacyIds": [
              "unit-hastarii-exterminators-profile-eradication-caster-focused-ranged-3"
            ],
            "title": "Eradication caster - focused",
            "mode": "ranged",
            "range": "15\"",
            "a": "2",
            "skill": "4+",
            "s": "5",
            "ap": "-2",
            "d": "2",
            "abilities": "Anti-Infantry 4+",
            "sourceSelectionIds": [
              "unit-hastarii-exterminators-selection-eradication-caster-focused",
              "unit-hastarii-exterminators-weapon-family-eradication-caster-selection"
            ]
          },
          {
            "id": "unit-hastarii-exterminators-profile-26b89e7ead",
            "legacyIds": [
              "unit-hastarii-exterminators-profile-close-combat-weapon-melee-4"
            ],
            "title": "Close-combat weapon",
            "mode": "melee",
            "range": "Melee",
            "a": "1",
            "skill": "4+",
            "s": "4",
            "ap": "0",
            "d": "1",
            "abilities": "",
            "sourceSelectionIds": [
              "unit-hastarii-exterminators-selection-close-combat-weapon"
            ]
          },
          {
            "id": "unit-hastarii-exterminators-profile-ac5b526e9c",
            "legacyIds": [
              "unit-hastarii-exterminators-profile-power-weapon-melee-5"
            ],
            "title": "Power weapon",
            "mode": "melee",
            "range": "Melee",
            "a": "2",
            "skill": "4+",
            "s": "5",
            "ap": "-2",
            "d": "1",
            "abilities": "",
            "sourceSelectionIds": [
              "unit-hastarii-exterminators-selection-power-weapon"
            ]
          }
        ],
        "wargearAbilities": []
      }
    },
    {
      "id": "unit-hastarii-fusiliers",
      "title": "Hastarii Fusiliers",
      "sourceBookId": "adeptus-mechanicus",
      "sourceLayer": "Faction Pack",
      "intrinsicKeywords": [
        "INFANTRY",
        "IMPERIUM",
        "SKITARII",
        "HASTARII",
        "FUSILIERS",
        "ADEPTUS MECHANICUS"
      ],
      "relations": {
        "canLead": [],
        "canSupport": [],
        "canBeLedBy": [
          {
            "unitId": "unit-tech-priest-dominus",
            "maxCharacters": 2
          },
          {
            "unitId": "unit-tech-priest-enginseer",
            "maxCharacters": 2
          },
          {
            "unitId": "unit-tech-priest-manipulus",
            "maxCharacters": 2
          }
        ],
        "canBeSupportedBy": [
          {
            "unitId": "unit-skitarii-marshal",
            "maxCharacters": 2
          },
          {
            "unitId": "unit-technoarcheologist",
            "maxCharacters": 2
          }
        ]
      },
      "ruleFacts": {
        "relations": {
          "canLead": [],
          "canSupport": [],
          "canBeLedBy": [
            {
              "unitId": "unit-tech-priest-dominus",
              "maxCharacters": 2
            },
            {
              "unitId": "unit-tech-priest-enginseer",
              "maxCharacters": 2
            },
            {
              "unitId": "unit-tech-priest-manipulus",
              "maxCharacters": 2
            }
          ],
          "canBeSupportedBy": [
            {
              "unitId": "unit-skitarii-marshal",
              "maxCharacters": 2
            },
            {
              "unitId": "unit-technoarcheologist",
              "maxCharacters": 2
            }
          ]
        }
      },
      "gameSelections": {
        "stats": {
          "M": "5\"",
          "T": "4",
          "SV": "3+",
          "W": "2",
          "LD": "7+",
          "OC": "1",
          "Invulnerable": "5+"
        },
        "abilities": [
          {
            "id": "doctrina-imperatives",
            "sectionId": "doctrina-imperatives",
            "title": "Doctrina Imperatives",
            "text": "This unit has the Doctrina Imperatives Faction ability.",
            "sourceUnitId": "unit-hastarii-fusiliers"
          },
          {
            "id": "datasheet-monocular-targeting-helms",
            "sectionId": "datasheet-monocular-targeting-helms",
            "title": "Monocular Targeting Helms",
            "text": "Each time a model in this unit makes an attack with a neutron fusil against a MONSTER or VEHICLE unit, that attack has the [IGNORES COVER] ability.",
            "sourceUnitId": "unit-hastarii-fusiliers"
          },
          {
            "id": "datasheet-attached-unit",
            "sectionId": "datasheet-attached-unit",
            "title": "Attached Unit",
            "text": "If a CHARACTER unit from your army can be attached to a SKITARII RANGERS unit, it can be attached to this unit instead",
            "sourceUnitId": "unit-hastarii-fusiliers"
          }
        ],
        "models": [
          {
            "id": "unit-hastarii-fusiliers-model-2600ea4edd",
            "title": "Hastarii Fusilier Alpha",
            "aliases": [
              "Hastarii Fusilier Alpha"
            ],
            "legacyIds": [
              "unit-hastarii-fusiliers-model-hastarii-fusilier-alpha"
            ]
          },
          {
            "id": "unit-hastarii-fusiliers-model-aa21de4b7c",
            "title": "Hastarii Fusilier",
            "aliases": [
              "Hastarii Fusilier",
              "Hastarii Fusiliers"
            ],
            "legacyIds": [
              "unit-hastarii-fusiliers-model-hastarii-fusilier-2"
            ]
          }
        ],
        "selections": [
          {
            "id": "unit-hastarii-fusiliers-selection-neutron-fusil",
            "title": "Neutron fusil",
            "aliases": [
              "Neutron fusil"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-hastarii-fusiliers-profile-212c3ca231"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-hastarii-fusiliers-selection-hastarii-phosphor-blaster",
            "title": "Hastarii phosphor blaster",
            "aliases": [
              "Hastarii phosphor blaster"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-hastarii-fusiliers-profile-f21dddfd67"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-hastarii-fusiliers-selection-close-combat-weapon",
            "title": "Close-combat weapon",
            "aliases": [
              "Close-combat weapon"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-hastarii-fusiliers-profile-26b89e7ead"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-hastarii-fusiliers-selection-power-weapon",
            "title": "Power weapon",
            "aliases": [
              "Power weapon"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-hastarii-fusiliers-profile-ac5b526e9c"
            ],
            "wargearAbilityIds": []
          }
        ],
        "weaponFamilies": [],
        "weaponProfiles": [
          {
            "id": "unit-hastarii-fusiliers-profile-212c3ca231",
            "legacyIds": [
              "unit-hastarii-fusiliers-profile-neutron-fusil-ranged"
            ],
            "title": "Neutron fusil",
            "mode": "ranged",
            "range": "24\"",
            "a": "1",
            "skill": "4+",
            "s": "12",
            "ap": "-3",
            "d": "D6+1",
            "abilities": "",
            "sourceSelectionIds": [
              "unit-hastarii-fusiliers-selection-neutron-fusil"
            ]
          },
          {
            "id": "unit-hastarii-fusiliers-profile-f21dddfd67",
            "legacyIds": [
              "unit-hastarii-fusiliers-profile-hastarii-phosphor-blaster-ranged-2"
            ],
            "title": "Hastarii phosphor blaster",
            "mode": "ranged",
            "range": "18\"",
            "a": "2",
            "skill": "4+",
            "s": "5",
            "ap": "0",
            "d": "1",
            "abilities": "Ignores Cover",
            "sourceSelectionIds": [
              "unit-hastarii-fusiliers-selection-hastarii-phosphor-blaster"
            ]
          },
          {
            "id": "unit-hastarii-fusiliers-profile-26b89e7ead",
            "legacyIds": [
              "unit-hastarii-fusiliers-profile-close-combat-weapon-melee-3"
            ],
            "title": "Close-combat weapon",
            "mode": "melee",
            "range": "Melee",
            "a": "1",
            "skill": "4+",
            "s": "4",
            "ap": "0",
            "d": "1",
            "abilities": "",
            "sourceSelectionIds": [
              "unit-hastarii-fusiliers-selection-close-combat-weapon"
            ]
          },
          {
            "id": "unit-hastarii-fusiliers-profile-ac5b526e9c",
            "legacyIds": [
              "unit-hastarii-fusiliers-profile-power-weapon-melee-4"
            ],
            "title": "Power weapon",
            "mode": "melee",
            "range": "Melee",
            "a": "2",
            "skill": "4+",
            "s": "5",
            "ap": "-2",
            "d": "1",
            "abilities": "",
            "sourceSelectionIds": [
              "unit-hastarii-fusiliers-selection-power-weapon"
            ]
          }
        ],
        "wargearAbilities": []
      }
    },
    {
      "id": "unit-kataphron-breachers",
      "title": "Kataphron Breachers",
      "sourceBookId": "adeptus-mechanicus",
      "sourceLayer": "Codex transcription",
      "intrinsicKeywords": [
        "Breachers",
        "Kataphron",
        "Infantry",
        "Adeptus Mechanicus",
        "Imperium",
        "Cult Mechanicus"
      ],
      "relations": {
        "canLead": [],
        "canSupport": [],
        "canBeLedBy": [
          {
            "unitId": "unit-tech-priest-dominus",
            "maxCharacters": 2
          },
          {
            "unitId": "unit-tech-priest-enginseer",
            "maxCharacters": 2
          },
          {
            "unitId": "unit-tech-priest-manipulus",
            "maxCharacters": 2
          }
        ],
        "canBeSupportedBy": [
          {
            "unitId": "unit-technoarcheologist",
            "maxCharacters": 2
          }
        ]
      },
      "ruleFacts": {
        "relations": {
          "canLead": [],
          "canSupport": [],
          "canBeLedBy": [
            {
              "unitId": "unit-tech-priest-dominus",
              "maxCharacters": 2
            },
            {
              "unitId": "unit-tech-priest-enginseer",
              "maxCharacters": 2
            },
            {
              "unitId": "unit-tech-priest-manipulus",
              "maxCharacters": 2
            }
          ],
          "canBeSupportedBy": [
            {
              "unitId": "unit-technoarcheologist",
              "maxCharacters": 2
            }
          ]
        }
      },
      "gameSelections": {
        "stats": {
          "M": "5\"",
          "T": "7",
          "Sv": "3+",
          "W": "3",
          "Ld": "7+",
          "OC": "1",
          "Invulnerable": "6+"
        },
        "abilities": [
          {
            "id": "datasheet-breaching-command",
            "sectionId": "datasheet-breaching-command",
            "title": "Breaching Command",
            "text": "Each time a model in this unit makes an attack, re-roll a Hit roll of 1. While this unit is within 6” of one or more friendly Adeptus Mechanicus Battleline units, you can re-roll the Hit roll instead.",
            "sourceUnitId": "unit-kataphron-breachers"
          },
          {
            "id": "doctrina-imperatives",
            "sectionId": "doctrina-imperatives",
            "title": "Doctrina Imperatives",
            "text": "At the start of the battle round, you can select one of the Doctrina Imperatives below. Until the end of the battle round, that Doctrina Imperative is active for your army, and all units from your army that have the Doctrina Imperatives ability gain the relevant abilities shown below.\n\nPROTECTOR IMPERATIVE\n■ Ranged weapons equipped by models in this unit have the [HEAVY] ability.\n■ Improve the Ballistic Skill characteristic of ranged weapons equipped by models in this unit by 1.\n■ Each time a melee attack targets this unit, if this unit has the Battleline keyword and/or it is within 6\" of one or more friendly Adeptus Mechanicus Battleline units, subtract 1 from the Hit roll.\n\nCONQUEROR IMPERATIVE\n■ Ranged weapons equipped by models in this unit have the [ASSAULT] ability.\n■ Improve the Weapon Skill characteristic of melee weapons equipped by models in this unit by 1.\n■ Each time a model in this unit makes an attack, if this unit has the Battleline keyword and/or it is within 6\" of one or more friendly Adeptus Mechanicus Battleline units, improve the Armour Penetration characteristic of that attack by 1.",
            "sourceUnitId": "unit-kataphron-breachers"
          }
        ],
        "models": [
          {
            "id": "unit-kataphron-breachers-model-199b80a4d7",
            "title": "Kataphron Breacher",
            "aliases": [
              "Kataphron Breacher",
              "Kataphron Breachers"
            ],
            "legacyIds": [
              "unit-kataphron-breachers-model-kataphron-breacher"
            ]
          }
        ],
        "selections": [
          {
            "id": "unit-kataphron-breachers-selection-arc-claw",
            "title": "Arc claw",
            "aliases": [
              "Arc claw"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-kataphron-breachers-profile-0a48041ca3"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-kataphron-breachers-selection-heavy-arc-rifle",
            "title": "Heavy arc rifle",
            "aliases": [
              "Heavy arc rifle"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-kataphron-breachers-profile-94f82de00c"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-kataphron-breachers-selection-hydraulic-claw",
            "title": "Hydraulic claw",
            "aliases": [
              "Hydraulic claw"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-kataphron-breachers-profile-a2821e369c"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-kataphron-breachers-selection-torsion-cannon",
            "title": "Torsion cannon",
            "aliases": [
              "Torsion cannon"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-kataphron-breachers-profile-50697bf734"
            ],
            "wargearAbilityIds": []
          }
        ],
        "weaponFamilies": [],
        "weaponProfiles": [
          {
            "id": "unit-kataphron-breachers-profile-0a48041ca3",
            "legacyIds": [
              "unit-kataphron-breachers-profile-arc-claw-melee"
            ],
            "title": "Arc claw",
            "mode": "melee",
            "range": "Melee",
            "a": "4",
            "skill": "4+",
            "s": "5",
            "ap": "-1",
            "d": "1",
            "abilities": "Anti-Vehicle 4+",
            "sourceSelectionIds": [
              "unit-kataphron-breachers-selection-arc-claw"
            ]
          },
          {
            "id": "unit-kataphron-breachers-profile-94f82de00c",
            "legacyIds": [
              "unit-kataphron-breachers-profile-heavy-arc-rifle-ranged-2"
            ],
            "title": "Heavy arc rifle",
            "mode": "ranged",
            "range": "30\"",
            "a": "2",
            "skill": "4+",
            "s": "8",
            "ap": "-2",
            "d": "3",
            "abilities": "Anti-Vehicle 4+, Rapid Fire 2",
            "sourceSelectionIds": [
              "unit-kataphron-breachers-selection-heavy-arc-rifle"
            ]
          },
          {
            "id": "unit-kataphron-breachers-profile-a2821e369c",
            "legacyIds": [
              "unit-kataphron-breachers-profile-hydraulic-claw-melee-3"
            ],
            "title": "Hydraulic claw",
            "mode": "melee",
            "range": "Melee",
            "a": "2",
            "skill": "4+",
            "s": "8",
            "ap": "-2",
            "d": "3",
            "abilities": "",
            "sourceSelectionIds": [
              "unit-kataphron-breachers-selection-hydraulic-claw"
            ]
          },
          {
            "id": "unit-kataphron-breachers-profile-50697bf734",
            "legacyIds": [
              "unit-kataphron-breachers-profile-torsion-cannon-ranged-4"
            ],
            "title": "Torsion cannon",
            "mode": "ranged",
            "range": "36\"",
            "a": "D3",
            "skill": "4+",
            "s": "6",
            "ap": "-2",
            "d": "2",
            "abilities": "Anti-Infantry 2+, Blast",
            "sourceSelectionIds": [
              "unit-kataphron-breachers-selection-torsion-cannon"
            ]
          }
        ],
        "wargearAbilities": []
      }
    },
    {
      "id": "unit-kataphron-destroyers",
      "title": "Kataphron Destroyers",
      "sourceBookId": "adeptus-mechanicus",
      "sourceLayer": "Codex transcription",
      "intrinsicKeywords": [
        "Destroyers",
        "Kataphron",
        "Infantry",
        "Adeptus Mechanicus",
        "Imperium",
        "Cult Mechanicus"
      ],
      "relations": {
        "canLead": [],
        "canSupport": [],
        "canBeLedBy": [
          {
            "unitId": "unit-tech-priest-dominus",
            "maxCharacters": 2
          },
          {
            "unitId": "unit-tech-priest-enginseer",
            "maxCharacters": 2
          },
          {
            "unitId": "unit-tech-priest-manipulus",
            "maxCharacters": 2
          }
        ],
        "canBeSupportedBy": [
          {
            "unitId": "unit-technoarcheologist",
            "maxCharacters": 2
          }
        ]
      },
      "ruleFacts": {
        "relations": {
          "canLead": [],
          "canSupport": [],
          "canBeLedBy": [
            {
              "unitId": "unit-tech-priest-dominus",
              "maxCharacters": 2
            },
            {
              "unitId": "unit-tech-priest-enginseer",
              "maxCharacters": 2
            },
            {
              "unitId": "unit-tech-priest-manipulus",
              "maxCharacters": 2
            }
          ],
          "canBeSupportedBy": [
            {
              "unitId": "unit-technoarcheologist",
              "maxCharacters": 2
            }
          ]
        }
      },
      "gameSelections": {
        "stats": {
          "M": "5\"",
          "T": "6",
          "Sv": "3+",
          "W": "3",
          "Ld": "7+",
          "OC": "1",
          "Invulnerable": "6+"
        },
        "abilities": [
          {
            "id": "datasheet-sentinel-directive",
            "sectionId": "datasheet-sentinel-directive",
            "title": "Sentinel Directive",
            "text": "Each time you target this unit with the Fire Overwatch Stratagem, hits are scored on unmodified Hit rolls of 5+ when resolving that Stratagem.",
            "sourceUnitId": "unit-kataphron-destroyers"
          },
          {
            "id": "doctrina-imperatives",
            "sectionId": "doctrina-imperatives",
            "title": "Doctrina Imperatives",
            "text": "At the start of the battle round, you can select one of the Doctrina Imperatives below. Until the end of the battle round, that Doctrina Imperative is active for your army, and all units from your army that have the Doctrina Imperatives ability gain the relevant abilities shown below.\n\nPROTECTOR IMPERATIVE\n■ Ranged weapons equipped by models in this unit have the [HEAVY] ability.\n■ Improve the Ballistic Skill characteristic of ranged weapons equipped by models in this unit by 1.\n■ Each time a melee attack targets this unit, if this unit has the Battleline keyword and/or it is within 6\" of one or more friendly Adeptus Mechanicus Battleline units, subtract 1 from the Hit roll.\n\nCONQUEROR IMPERATIVE\n■ Ranged weapons equipped by models in this unit have the [ASSAULT] ability.\n■ Improve the Weapon Skill characteristic of melee weapons equipped by models in this unit by 1.\n■ Each time a model in this unit makes an attack, if this unit has the Battleline keyword and/or it is within 6\" of one or more friendly Adeptus Mechanicus Battleline units, improve the Armour Penetration characteristic of that attack by 1.",
            "sourceUnitId": "unit-kataphron-destroyers"
          }
        ],
        "models": [
          {
            "id": "unit-kataphron-destroyers-model-811b07395a",
            "title": "Kataphron Destroyer",
            "aliases": [
              "Kataphron Destroyer",
              "Kataphron Destroyers"
            ],
            "legacyIds": [
              "unit-kataphron-destroyers-model-kataphron-destroyer"
            ]
          }
        ],
        "selections": [
          {
            "id": "unit-kataphron-destroyers-selection-heavy-grav-cannon",
            "title": "Heavy grav-cannon",
            "aliases": [
              "Heavy grav-cannon"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-kataphron-destroyers-profile-f47cf110c0"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-kataphron-destroyers-selection-cognis-flamer",
            "title": "Cognis flamer",
            "aliases": [
              "Cognis flamer"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-kataphron-destroyers-profile-32a59f36ac"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-kataphron-destroyers-selection-close-combat-weapon",
            "title": "Close combat weapon",
            "aliases": [
              "Close combat weapon"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-kataphron-destroyers-profile-3d5020cc1a"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-kataphron-destroyers-selection-phosphor-blaster",
            "title": "Phosphor blaster",
            "aliases": [
              "Phosphor blaster"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-kataphron-destroyers-profile-b9ef700d2f"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-kataphron-destroyers-selection-kataphron-plasma-culverin-standard",
            "title": "➤ Kataphron plasma culverin - standard",
            "aliases": [
              "➤ Kataphron plasma culverin - standard"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-kataphron-destroyers-profile-f8c0c8ca90"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-kataphron-destroyers-selection-kataphron-plasma-culverin-supercharge",
            "title": "➤ Kataphron plasma culverin - supercharge",
            "aliases": [
              "➤ Kataphron plasma culverin - supercharge"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-kataphron-destroyers-profile-c04639e5a4"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-kataphron-destroyers-weapon-family-kataphron-plasma-culverin-selection",
            "title": "➤ Kataphron plasma culverin",
            "aliases": [
              "➤ Kataphron plasma culverin"
            ],
            "kind": "weapon",
            "familyId": "unit-kataphron-destroyers-weapon-family-kataphron-plasma-culverin",
            "profileIds": [
              "unit-kataphron-destroyers-profile-f8c0c8ca90",
              "unit-kataphron-destroyers-profile-c04639e5a4"
            ],
            "wargearAbilityIds": []
          }
        ],
        "weaponFamilies": [
          {
            "id": "unit-kataphron-destroyers-weapon-family-kataphron-plasma-culverin",
            "title": "➤ Kataphron plasma culverin",
            "aliases": [
              "➤ Kataphron plasma culverin"
            ],
            "profileIds": [
              "unit-kataphron-destroyers-profile-f8c0c8ca90",
              "unit-kataphron-destroyers-profile-c04639e5a4"
            ],
            "ambiguousAlias": false
          }
        ],
        "weaponProfiles": [
          {
            "id": "unit-kataphron-destroyers-profile-f47cf110c0",
            "legacyIds": [
              "unit-kataphron-destroyers-profile-heavy-grav-cannon-ranged"
            ],
            "title": "Heavy grav-cannon",
            "mode": "ranged",
            "range": "30\"",
            "a": "4",
            "skill": "4+",
            "s": "6",
            "ap": "-1",
            "d": "2",
            "abilities": "Anti-Vehicle 2+",
            "sourceSelectionIds": [
              "unit-kataphron-destroyers-selection-heavy-grav-cannon"
            ]
          },
          {
            "id": "unit-kataphron-destroyers-profile-32a59f36ac",
            "legacyIds": [
              "unit-kataphron-destroyers-profile-cognis-flamer-ranged-2"
            ],
            "title": "Cognis flamer",
            "mode": "ranged",
            "range": "12\"",
            "a": "D6",
            "skill": "N/A",
            "s": "4",
            "ap": "0",
            "d": "1",
            "abilities": "Ignores Cover, Torrent",
            "sourceSelectionIds": [
              "unit-kataphron-destroyers-selection-cognis-flamer"
            ]
          },
          {
            "id": "unit-kataphron-destroyers-profile-3d5020cc1a",
            "legacyIds": [
              "unit-kataphron-destroyers-profile-close-combat-weapon-melee-3"
            ],
            "title": "Close combat weapon",
            "mode": "melee",
            "range": "Melee",
            "a": "2",
            "skill": "4+",
            "s": "5",
            "ap": "0",
            "d": "1",
            "abilities": "",
            "sourceSelectionIds": [
              "unit-kataphron-destroyers-selection-close-combat-weapon"
            ]
          },
          {
            "id": "unit-kataphron-destroyers-profile-b9ef700d2f",
            "legacyIds": [
              "unit-kataphron-destroyers-profile-phosphor-blaster-ranged-4"
            ],
            "title": "Phosphor blaster",
            "mode": "ranged",
            "range": "24\"",
            "a": "1",
            "skill": "4+",
            "s": "5",
            "ap": "0",
            "d": "1",
            "abilities": "Ignores Cover, Rapid Fire 1",
            "sourceSelectionIds": [
              "unit-kataphron-destroyers-selection-phosphor-blaster"
            ]
          },
          {
            "id": "unit-kataphron-destroyers-profile-f8c0c8ca90",
            "legacyIds": [
              "unit-kataphron-destroyers-profile-kataphron-plasma-culverin-standard-ranged-5"
            ],
            "title": "➤ Kataphron plasma culverin - standard",
            "mode": "ranged",
            "range": "36\"",
            "a": "4",
            "skill": "4+",
            "s": "7",
            "ap": "-2",
            "d": "1",
            "abilities": "",
            "sourceSelectionIds": [
              "unit-kataphron-destroyers-selection-kataphron-plasma-culverin-standard",
              "unit-kataphron-destroyers-weapon-family-kataphron-plasma-culverin-selection"
            ]
          },
          {
            "id": "unit-kataphron-destroyers-profile-c04639e5a4",
            "legacyIds": [
              "unit-kataphron-destroyers-profile-kataphron-plasma-culverin-supercharge-ranged-6"
            ],
            "title": "➤ Kataphron plasma culverin - supercharge",
            "mode": "ranged",
            "range": "36\"",
            "a": "4",
            "skill": "4+",
            "s": "8",
            "ap": "-3",
            "d": "2",
            "abilities": "Hazardous",
            "sourceSelectionIds": [
              "unit-kataphron-destroyers-selection-kataphron-plasma-culverin-supercharge",
              "unit-kataphron-destroyers-weapon-family-kataphron-plasma-culverin-selection"
            ]
          }
        ],
        "wargearAbilities": []
      }
    },
    {
      "id": "unit-pteraxii-skystalkers",
      "title": "Pteraxii Skystalkers",
      "sourceBookId": "adeptus-mechanicus",
      "sourceLayer": "Codex transcription",
      "intrinsicKeywords": [
        "Skystalkers",
        "Imperium",
        "Adeptus Mechanicus",
        "Infantry",
        "Fly",
        "Jump Pack",
        "Grenades",
        "Skitarii",
        "Pteraxii"
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
          "W": "2",
          "Ld": "7+",
          "OC": "1",
          "Invulnerable": "5+"
        },
        "abilities": [
          {
            "id": "datasheet-ride-the-thermals",
            "sectionId": "datasheet-ride-the-thermals",
            "title": "Ride the Thermals",
            "text": "In your Shooting phase, after this unit has shot, if it is not within Engagement Range of one or more enemy units, it can do one of the following:\n- Make a Normal move of up to 6\".\n- Make a Normal move of up to 12\", provided every model in this unit ends that move wholly within 6\" of one or more friendly Adeptus Mechanicus Battleline units.\n\nIn either case, if it does, until the end of the turn, this unit is not eligible to declare a charge.",
            "sourceUnitId": "unit-pteraxii-skystalkers"
          },
          {
            "id": "core-deep-strike",
            "sectionId": "core-deep-strike",
            "title": "Deep Strike",
            "text": "",
            "sourceUnitId": "unit-pteraxii-skystalkers"
          },
          {
            "id": "doctrina-imperatives",
            "sectionId": "doctrina-imperatives",
            "title": "Doctrina Imperatives",
            "text": "At the start of the battle round, you can select one of the Doctrina Imperatives below. Until the end of the battle round, that Doctrina Imperative is active for your army, and all units from your army that have the Doctrina Imperatives ability gain the relevant abilities shown below.\n\nPROTECTOR IMPERATIVE\n■ Ranged weapons equipped by models in this unit have the [HEAVY] ability.\n■ Improve the Ballistic Skill characteristic of ranged weapons equipped by models in this unit by 1.\n■ Each time a melee attack targets this unit, if this unit has the Battleline keyword and/or it is within 6\" of one or more friendly Adeptus Mechanicus Battleline units, subtract 1 from the Hit roll.\n\nCONQUEROR IMPERATIVE\n■ Ranged weapons equipped by models in this unit have the [ASSAULT] ability.\n■ Improve the Weapon Skill characteristic of melee weapons equipped by models in this unit by 1.\n■ Each time a model in this unit makes an attack, if this unit has the Battleline keyword and/or it is within 6\" of one or more friendly Adeptus Mechanicus Battleline units, improve the Armour Penetration characteristic of that attack by 1.",
            "sourceUnitId": "unit-pteraxii-skystalkers"
          }
        ],
        "models": [
          {
            "id": "unit-pteraxii-skystalkers-model-8f1d0f1bb9",
            "title": "Pteraxii Skystalker Alpha",
            "aliases": [
              "Pteraxii Skystalker Alpha"
            ],
            "legacyIds": [
              "unit-pteraxii-skystalkers-model-pteraxii-skystalker-alpha"
            ]
          },
          {
            "id": "unit-pteraxii-skystalkers-model-3cf02decad",
            "title": "Pteraxii Skystalker",
            "aliases": [
              "Pteraxii Skystalker",
              "Pteraxii Skystalkers"
            ],
            "legacyIds": [
              "unit-pteraxii-skystalkers-model-pteraxii-skystalker-2"
            ]
          }
        ],
        "selections": [
          {
            "id": "unit-pteraxii-skystalkers-selection-flechette-blaster",
            "title": "Flechette blaster",
            "aliases": [
              "Flechette blaster"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-pteraxii-skystalkers-profile-6b1071c6bc"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-pteraxii-skystalkers-selection-taser-goad",
            "title": "Taser goad",
            "aliases": [
              "Taser goad"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-pteraxii-skystalkers-profile-03a79cd425"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-pteraxii-skystalkers-selection-close-combat-weapon",
            "title": "Close combat weapon",
            "aliases": [
              "Close combat weapon"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-pteraxii-skystalkers-profile-ace9e4828a"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-pteraxii-skystalkers-selection-flechette-carbine",
            "title": "Flechette carbine",
            "aliases": [
              "Flechette carbine"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-pteraxii-skystalkers-profile-d308c8dd74"
            ],
            "wargearAbilityIds": []
          }
        ],
        "weaponFamilies": [],
        "weaponProfiles": [
          {
            "id": "unit-pteraxii-skystalkers-profile-6b1071c6bc",
            "legacyIds": [
              "unit-pteraxii-skystalkers-profile-flechette-blaster-ranged"
            ],
            "title": "Flechette blaster",
            "mode": "ranged",
            "range": "12\"",
            "a": "5",
            "skill": "4+",
            "s": "3",
            "ap": "0",
            "d": "1",
            "abilities": "Pistol",
            "sourceSelectionIds": [
              "unit-pteraxii-skystalkers-selection-flechette-blaster"
            ]
          },
          {
            "id": "unit-pteraxii-skystalkers-profile-03a79cd425",
            "legacyIds": [
              "unit-pteraxii-skystalkers-profile-taser-goad-melee-2"
            ],
            "title": "Taser goad",
            "mode": "melee",
            "range": "Melee",
            "a": "3",
            "skill": "4+",
            "s": "6",
            "ap": "0",
            "d": "1",
            "abilities": "Sustained Hits 2",
            "sourceSelectionIds": [
              "unit-pteraxii-skystalkers-selection-taser-goad"
            ]
          },
          {
            "id": "unit-pteraxii-skystalkers-profile-ace9e4828a",
            "legacyIds": [
              "unit-pteraxii-skystalkers-profile-close-combat-weapon-melee-3"
            ],
            "title": "Close combat weapon",
            "mode": "melee",
            "range": "Melee",
            "a": "2",
            "skill": "4+",
            "s": "3",
            "ap": "0",
            "d": "1",
            "abilities": "",
            "sourceSelectionIds": [
              "unit-pteraxii-skystalkers-selection-close-combat-weapon"
            ]
          },
          {
            "id": "unit-pteraxii-skystalkers-profile-d308c8dd74",
            "legacyIds": [
              "unit-pteraxii-skystalkers-profile-flechette-carbine-ranged-4"
            ],
            "title": "Flechette carbine",
            "mode": "ranged",
            "range": "18\"",
            "a": "6",
            "skill": "4+",
            "s": "3",
            "ap": "0",
            "d": "1",
            "abilities": "",
            "sourceSelectionIds": [
              "unit-pteraxii-skystalkers-selection-flechette-carbine"
            ]
          }
        ],
        "wargearAbilities": []
      }
    },
    {
      "id": "unit-pteraxii-sterylizors",
      "title": "Pteraxii Sterylizors",
      "sourceBookId": "adeptus-mechanicus",
      "sourceLayer": "Codex transcription",
      "intrinsicKeywords": [
        "Sterylizors",
        "Imperium",
        "Infantry",
        "Fly",
        "Jump Pack",
        "Skitarii",
        "Adeptus Mechanicus",
        "Pteraxii"
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
          "W": "2",
          "Ld": "7+",
          "OC": "1",
          "Invulnerable": "5+"
        },
        "abilities": [
          {
            "id": "datasheet-searing-conflagration",
            "sectionId": "datasheet-searing-conflagration",
            "title": "Searing Conflagration",
            "text": "Each time a model in this unit makes an attack with a phosphor torch that targets an enemy unit within range of an objective marker, re-roll a Wound roll of 1. If this unit is also within 6\" of one or more friendly Adeptus Mechanicus Battleline units, each time such an attack targets such a unit, you can re-roll the Wound roll instead.",
            "sourceUnitId": "unit-pteraxii-sterylizors"
          },
          {
            "id": "core-deep-strike",
            "sectionId": "core-deep-strike",
            "title": "Deep Strike",
            "text": "",
            "sourceUnitId": "unit-pteraxii-sterylizors"
          },
          {
            "id": "doctrina-imperatives",
            "sectionId": "doctrina-imperatives",
            "title": "Doctrina Imperatives",
            "text": "At the start of the battle round, you can select one of the Doctrina Imperatives below. Until the end of the battle round, that Doctrina Imperative is active for your army, and all units from your army that have the Doctrina Imperatives ability gain the relevant abilities shown below.\n\nPROTECTOR IMPERATIVE\n■ Ranged weapons equipped by models in this unit have the [HEAVY] ability.\n■ Improve the Ballistic Skill characteristic of ranged weapons equipped by models in this unit by 1.\n■ Each time a melee attack targets this unit, if this unit has the Battleline keyword and/or it is within 6\" of one or more friendly Adeptus Mechanicus Battleline units, subtract 1 from the Hit roll.\n\nCONQUEROR IMPERATIVE\n■ Ranged weapons equipped by models in this unit have the [ASSAULT] ability.\n■ Improve the Weapon Skill characteristic of melee weapons equipped by models in this unit by 1.\n■ Each time a model in this unit makes an attack, if this unit has the Battleline keyword and/or it is within 6\" of one or more friendly Adeptus Mechanicus Battleline units, improve the Armour Penetration characteristic of that attack by 1.",
            "sourceUnitId": "unit-pteraxii-sterylizors"
          }
        ],
        "models": [
          {
            "id": "unit-pteraxii-sterylizors-model-038f173130",
            "title": "Pteraxii Sterylizor Alpha",
            "aliases": [
              "Pteraxii Sterylizor Alpha"
            ],
            "legacyIds": [
              "unit-pteraxii-sterylizors-model-pteraxii-sterylizor-alpha"
            ]
          },
          {
            "id": "unit-pteraxii-sterylizors-model-4c6b25c7e6",
            "title": "Pteraxii Sterylizor",
            "aliases": [
              "Pteraxii Sterylizor",
              "Pteraxii Sterylizors"
            ],
            "legacyIds": [
              "unit-pteraxii-sterylizors-model-pteraxii-sterylizor-2"
            ]
          }
        ],
        "selections": [
          {
            "id": "unit-pteraxii-sterylizors-selection-flechette-blaster",
            "title": "Flechette blaster",
            "aliases": [
              "Flechette blaster"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-pteraxii-sterylizors-profile-6b1071c6bc"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-pteraxii-sterylizors-selection-taser-goad",
            "title": "Taser goad",
            "aliases": [
              "Taser goad"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-pteraxii-sterylizors-profile-03a79cd425"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-pteraxii-sterylizors-selection-pteraxii-talons",
            "title": "Pteraxii talons",
            "aliases": [
              "Pteraxii talons"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-pteraxii-sterylizors-profile-ceb42372e6"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-pteraxii-sterylizors-selection-phosphor-torch",
            "title": "Phosphor torch",
            "aliases": [
              "Phosphor torch"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-pteraxii-sterylizors-profile-6b6481f920"
            ],
            "wargearAbilityIds": []
          }
        ],
        "weaponFamilies": [],
        "weaponProfiles": [
          {
            "id": "unit-pteraxii-sterylizors-profile-6b1071c6bc",
            "legacyIds": [
              "unit-pteraxii-sterylizors-profile-flechette-blaster-ranged"
            ],
            "title": "Flechette blaster",
            "mode": "ranged",
            "range": "12\"",
            "a": "5",
            "skill": "4+",
            "s": "3",
            "ap": "0",
            "d": "1",
            "abilities": "Pistol",
            "sourceSelectionIds": [
              "unit-pteraxii-sterylizors-selection-flechette-blaster"
            ]
          },
          {
            "id": "unit-pteraxii-sterylizors-profile-03a79cd425",
            "legacyIds": [
              "unit-pteraxii-sterylizors-profile-taser-goad-melee-2"
            ],
            "title": "Taser goad",
            "mode": "melee",
            "range": "Melee",
            "a": "3",
            "skill": "4+",
            "s": "6",
            "ap": "0",
            "d": "1",
            "abilities": "Sustained Hits 2",
            "sourceSelectionIds": [
              "unit-pteraxii-sterylizors-selection-taser-goad"
            ]
          },
          {
            "id": "unit-pteraxii-sterylizors-profile-ceb42372e6",
            "legacyIds": [
              "unit-pteraxii-sterylizors-profile-pteraxii-talons-melee-3"
            ],
            "title": "Pteraxii talons",
            "mode": "melee",
            "range": "Melee",
            "a": "2",
            "skill": "4+",
            "s": "4",
            "ap": "0",
            "d": "1",
            "abilities": "",
            "sourceSelectionIds": [
              "unit-pteraxii-sterylizors-selection-pteraxii-talons"
            ]
          },
          {
            "id": "unit-pteraxii-sterylizors-profile-6b6481f920",
            "legacyIds": [
              "unit-pteraxii-sterylizors-profile-phosphor-torch-ranged-4"
            ],
            "title": "Phosphor torch",
            "mode": "ranged",
            "range": "12\"",
            "a": "D6",
            "skill": "N/A",
            "s": "4",
            "ap": "0",
            "d": "1",
            "abilities": "Ignores Cover, Torrent",
            "sourceSelectionIds": [
              "unit-pteraxii-sterylizors-selection-phosphor-torch"
            ]
          }
        ],
        "wargearAbilities": []
      }
    },
    {
      "id": "unit-servitor-battleclade",
      "title": "Servitor Battleclade",
      "sourceBookId": "adeptus-mechanicus",
      "sourceLayer": "Faction Pack",
      "intrinsicKeywords": [
        "INFANTRY",
        "IMPERIUM",
        "CULT MECHANICUS",
        "SERVITOR BATTLECLADE",
        "ADEPTUS MECHANICUS"
      ],
      "relations": {
        "canLead": [],
        "canSupport": [],
        "canBeLedBy": [
          {
            "unitId": "unit-tech-priest-dominus",
            "maxCharacters": 2
          },
          {
            "unitId": "unit-tech-priest-enginseer",
            "maxCharacters": 2
          },
          {
            "unitId": "unit-tech-priest-manipulus",
            "maxCharacters": 2
          }
        ],
        "canBeSupportedBy": [
          {
            "unitId": "unit-technoarcheologist",
            "maxCharacters": 2
          }
        ]
      },
      "ruleFacts": {
        "relations": {
          "canLead": [],
          "canSupport": [],
          "canBeLedBy": [
            {
              "unitId": "unit-tech-priest-dominus",
              "maxCharacters": 2
            },
            {
              "unitId": "unit-tech-priest-enginseer",
              "maxCharacters": 2
            },
            {
              "unitId": "unit-tech-priest-manipulus",
              "maxCharacters": 2
            }
          ],
          "canBeSupportedBy": [
            {
              "unitId": "unit-technoarcheologist",
              "maxCharacters": 2
            }
          ]
        }
      },
      "gameSelections": {
        "stats": {
          "M": "6\"",
          "T": "4",
          "SV": "4+",
          "W": "2",
          "LD": "7+",
          "OC": "1",
          "Invulnerable": "6+"
        },
        "abilities": [
          {
            "id": "doctrina-imperatives",
            "sectionId": "doctrina-imperatives",
            "title": "Doctrina Imperatives",
            "text": "This unit has the Doctrina Imperatives Faction ability.",
            "sourceUnitId": "unit-servitor-battleclade"
          },
          {
            "id": "datasheet-network-override",
            "sectionId": "datasheet-network-override",
            "title": "Network Override",
            "text": "While this unit contains one or more Tech-Priest models, this unit is:\n- Eligible to perform an Action in a turn in which it Advanced.\n- Eligible to shoot in a turn in which it started an Action.",
            "sourceUnitId": "unit-servitor-battleclade"
          },
          {
            "id": "datasheet-attached-unit",
            "sectionId": "datasheet-attached-unit",
            "title": "Attached Unit",
            "text": "If a CHARACTER unit from your army with the Leader ability can be attached to a KATAPHRON BREACHERS unit, it can be attached to this unit instead.",
            "sourceUnitId": "unit-servitor-battleclade"
          }
        ],
        "models": [
          {
            "id": "unit-servitor-battleclade-model-eb1729a0ef",
            "title": "Servitor Underseer",
            "aliases": [
              "Servitor Underseer"
            ],
            "legacyIds": [
              "unit-servitor-battleclade-model-servitor-underseer"
            ],
            "intrinsicKeywords": [
              "TECH-PRIEST"
            ]
          },
          {
            "id": "unit-servitor-battleclade-model-da83529346",
            "title": "Gun Servitor",
            "aliases": [
              "Gun Servitor"
            ],
            "legacyIds": [
              "unit-servitor-battleclade-model-gun-servitor-2"
            ]
          },
          {
            "id": "unit-servitor-battleclade-model-c9982dc7f0",
            "title": "Combat Servitor",
            "aliases": [
              "Combat Servitor"
            ],
            "legacyIds": [
              "unit-servitor-battleclade-model-combat-servitor-3"
            ]
          }
        ],
        "selections": [
          {
            "id": "unit-servitor-battleclade-selection-heavy-arc-rifle",
            "title": "Heavy arc rifle",
            "aliases": [
              "Heavy arc rifle"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-servitor-battleclade-profile-6346e93635"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-servitor-battleclade-selection-heavy-bolter",
            "title": "Heavy bolter",
            "aliases": [
              "Heavy bolter"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-servitor-battleclade-profile-6ef672a5ca"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-servitor-battleclade-selection-incendine-igniter",
            "title": "Incendine igniter",
            "aliases": [
              "Incendine igniter"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-servitor-battleclade-profile-e3bb484d5d"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-servitor-battleclade-selection-mechanicus-pistol",
            "title": "Mechanicus pistol",
            "aliases": [
              "Mechanicus pistol"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-servitor-battleclade-profile-8a7f265f02"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-servitor-battleclade-selection-meltagun",
            "title": "Meltagun",
            "aliases": [
              "Meltagun"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-servitor-battleclade-profile-7baf145482"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-servitor-battleclade-selection-phosphor-blaster",
            "title": "Phosphor blaster",
            "aliases": [
              "Phosphor blaster"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-servitor-battleclade-profile-4cc1197e8d"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-servitor-battleclade-selection-dataspikes",
            "title": "Dataspikes",
            "aliases": [
              "Dataspikes"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-servitor-battleclade-profile-8e3105c436"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-servitor-battleclade-selection-servo-claw",
            "title": "Servo-claw",
            "aliases": [
              "Servo-claw"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-servitor-battleclade-profile-47f566871a"
            ],
            "wargearAbilityIds": []
          }
        ],
        "weaponFamilies": [],
        "weaponProfiles": [
          {
            "id": "unit-servitor-battleclade-profile-6346e93635",
            "legacyIds": [
              "unit-servitor-battleclade-profile-heavy-arc-rifle-ranged"
            ],
            "title": "Heavy arc rifle",
            "mode": "ranged",
            "range": "30\"",
            "a": "1",
            "skill": "4+",
            "s": "8",
            "ap": "-2",
            "d": "3",
            "abilities": "Anti-Vehicle 4+, Rapid Fire 1",
            "sourceSelectionIds": [
              "unit-servitor-battleclade-selection-heavy-arc-rifle"
            ]
          },
          {
            "id": "unit-servitor-battleclade-profile-6ef672a5ca",
            "legacyIds": [
              "unit-servitor-battleclade-profile-heavy-bolter-ranged-2"
            ],
            "title": "Heavy bolter",
            "mode": "ranged",
            "range": "36\"",
            "a": "3",
            "skill": "4+",
            "s": "5",
            "ap": "-1",
            "d": "2",
            "abilities": "Heavy, Sustained Hits 1",
            "sourceSelectionIds": [
              "unit-servitor-battleclade-selection-heavy-bolter"
            ]
          },
          {
            "id": "unit-servitor-battleclade-profile-e3bb484d5d",
            "legacyIds": [
              "unit-servitor-battleclade-profile-incendine-igniter-ranged-3"
            ],
            "title": "Incendine igniter",
            "mode": "ranged",
            "range": "12\"",
            "a": "D6",
            "skill": "N/A",
            "s": "3",
            "ap": "0",
            "d": "1",
            "abilities": "Ignores Cover, Torrent",
            "sourceSelectionIds": [
              "unit-servitor-battleclade-selection-incendine-igniter"
            ]
          },
          {
            "id": "unit-servitor-battleclade-profile-8a7f265f02",
            "legacyIds": [
              "unit-servitor-battleclade-profile-mechanicus-pistol-ranged-4"
            ],
            "title": "Mechanicus pistol",
            "mode": "ranged",
            "range": "12\"",
            "a": "1",
            "skill": "4+",
            "s": "6",
            "ap": "-1",
            "d": "1",
            "abilities": "Devastating Wounds, Pistol",
            "sourceSelectionIds": [
              "unit-servitor-battleclade-selection-mechanicus-pistol"
            ]
          },
          {
            "id": "unit-servitor-battleclade-profile-7baf145482",
            "legacyIds": [
              "unit-servitor-battleclade-profile-meltagun-ranged-5"
            ],
            "title": "Meltagun",
            "mode": "ranged",
            "range": "12\"",
            "a": "1",
            "skill": "4+",
            "s": "9",
            "ap": "-4",
            "d": "D6",
            "abilities": "Melta 2",
            "sourceSelectionIds": [
              "unit-servitor-battleclade-selection-meltagun"
            ]
          },
          {
            "id": "unit-servitor-battleclade-profile-4cc1197e8d",
            "legacyIds": [
              "unit-servitor-battleclade-profile-phosphor-blaster-ranged-6"
            ],
            "title": "Phosphor blaster",
            "mode": "ranged",
            "range": "24\"",
            "a": "1",
            "skill": "4+",
            "s": "4",
            "ap": "0",
            "d": "1",
            "abilities": "Ignores Cover, Rapid Fire 1",
            "sourceSelectionIds": [
              "unit-servitor-battleclade-selection-phosphor-blaster"
            ]
          },
          {
            "id": "unit-servitor-battleclade-profile-8e3105c436",
            "legacyIds": [
              "unit-servitor-battleclade-profile-dataspikes-melee-7"
            ],
            "title": "Dataspikes",
            "mode": "melee",
            "range": "Melee",
            "a": "4",
            "skill": "4+",
            "s": "4",
            "ap": "0",
            "d": "1",
            "abilities": "",
            "sourceSelectionIds": [
              "unit-servitor-battleclade-selection-dataspikes"
            ]
          },
          {
            "id": "unit-servitor-battleclade-profile-47f566871a",
            "legacyIds": [
              "unit-servitor-battleclade-profile-servo-claw-melee-8"
            ],
            "title": "Servo-claw",
            "mode": "melee",
            "range": "Melee",
            "a": "2",
            "skill": "4+",
            "s": "4",
            "ap": "0",
            "d": "1",
            "abilities": "",
            "sourceSelectionIds": [
              "unit-servitor-battleclade-selection-servo-claw"
            ]
          }
        ],
        "wargearAbilities": []
      }
    },
    {
      "id": "unit-sicarian-infiltrators",
      "title": "Sicarian Infiltrators",
      "sourceBookId": "adeptus-mechanicus",
      "sourceLayer": "Codex transcription",
      "intrinsicKeywords": [
        "Imperium",
        "Adeptus Mechanicus",
        "Skitarii",
        "Infantry",
        "Sicarian",
        "Infiltrators"
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
          "Sv": "4+",
          "W": "2",
          "Ld": "7+",
          "OC": "1",
          "Invulnerable": "5+"
        },
        "abilities": [
          {
            "id": "datasheet-neurostatic-interference-aura",
            "sectionId": "datasheet-neurostatic-interference-aura",
            "title": "Neurostatic Interference (Aura)",
            "text": "While an enemy unit is within 6\" of this unit, each time a Battle-shock or Leadership test is taken for that unit, subtract 1 from that test. While this unit is within 6\" of one or more friendly Adeptus Mechanicus Battleline units, subtract 2 from that test instead.",
            "sourceUnitId": "unit-sicarian-infiltrators"
          },
          {
            "id": "core-infiltrators",
            "sectionId": "core-infiltrators",
            "title": "Infiltrators",
            "text": "",
            "sourceUnitId": "unit-sicarian-infiltrators"
          },
          {
            "id": "core-stealth",
            "sectionId": "core-stealth",
            "title": "Stealth",
            "text": "",
            "sourceUnitId": "unit-sicarian-infiltrators"
          },
          {
            "id": "doctrina-imperatives",
            "sectionId": "doctrina-imperatives",
            "title": "Doctrina Imperatives",
            "text": "At the start of the battle round, you can select one of the Doctrina Imperatives below. Until the end of the battle round, that Doctrina Imperative is active for your army, and all units from your army that have the Doctrina Imperatives ability gain the relevant abilities shown below.\n\nPROTECTOR IMPERATIVE\n■ Ranged weapons equipped by models in this unit have the [HEAVY] ability.\n■ Improve the Ballistic Skill characteristic of ranged weapons equipped by models in this unit by 1.\n■ Each time a melee attack targets this unit, if this unit has the Battleline keyword and/or it is within 6\" of one or more friendly Adeptus Mechanicus Battleline units, subtract 1 from the Hit roll.\n\nCONQUEROR IMPERATIVE\n■ Ranged weapons equipped by models in this unit have the [ASSAULT] ability.\n■ Improve the Weapon Skill characteristic of melee weapons equipped by models in this unit by 1.\n■ Each time a model in this unit makes an attack, if this unit has the Battleline keyword and/or it is within 6\" of one or more friendly Adeptus Mechanicus Battleline units, improve the Armour Penetration characteristic of that attack by 1.",
            "sourceUnitId": "unit-sicarian-infiltrators"
          }
        ],
        "models": [
          {
            "id": "unit-sicarian-infiltrators-model-586163f72e",
            "title": "Sicarian Infiltrator Princeps",
            "aliases": [
              "Sicarian Infiltrator Princeps"
            ],
            "legacyIds": [
              "unit-sicarian-infiltrators-model-sicarian-infiltrator-princeps"
            ]
          },
          {
            "id": "unit-sicarian-infiltrators-model-8a866b0500",
            "title": "Sicarian Infiltrator",
            "aliases": [
              "Sicarian Infiltrator",
              "Sicarian Infiltrators"
            ],
            "legacyIds": [
              "unit-sicarian-infiltrators-model-sicarian-infiltrator-2"
            ]
          }
        ],
        "selections": [
          {
            "id": "unit-sicarian-infiltrators-selection-power-weapon",
            "title": "Power weapon",
            "aliases": [
              "Power weapon"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-sicarian-infiltrators-profile-ff6096bbdd"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-sicarian-infiltrators-selection-stubcarbine",
            "title": "Stubcarbine",
            "aliases": [
              "Stubcarbine"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-sicarian-infiltrators-profile-732aa763cc"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-sicarian-infiltrators-selection-flechette-blaster",
            "title": "Flechette blaster",
            "aliases": [
              "Flechette blaster"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-sicarian-infiltrators-profile-6b1071c6bc"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-sicarian-infiltrators-selection-taser-goad",
            "title": "Taser goad",
            "aliases": [
              "Taser goad"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-sicarian-infiltrators-profile-62e9bee21a"
            ],
            "wargearAbilityIds": []
          }
        ],
        "weaponFamilies": [],
        "weaponProfiles": [
          {
            "id": "unit-sicarian-infiltrators-profile-ff6096bbdd",
            "legacyIds": [
              "unit-sicarian-infiltrators-profile-power-weapon-melee"
            ],
            "title": "Power weapon",
            "mode": "melee",
            "range": "Melee",
            "a": "4",
            "skill": "4+",
            "s": "4",
            "ap": "-2",
            "d": "1",
            "abilities": "",
            "sourceSelectionIds": [
              "unit-sicarian-infiltrators-selection-power-weapon"
            ]
          },
          {
            "id": "unit-sicarian-infiltrators-profile-732aa763cc",
            "legacyIds": [
              "unit-sicarian-infiltrators-profile-stubcarbine-ranged-2"
            ],
            "title": "Stubcarbine",
            "mode": "ranged",
            "range": "12\"",
            "a": "3",
            "skill": "4+",
            "s": "4",
            "ap": "0",
            "d": "1",
            "abilities": "Pistol",
            "sourceSelectionIds": [
              "unit-sicarian-infiltrators-selection-stubcarbine"
            ]
          },
          {
            "id": "unit-sicarian-infiltrators-profile-6b1071c6bc",
            "legacyIds": [
              "unit-sicarian-infiltrators-profile-flechette-blaster-ranged-3"
            ],
            "title": "Flechette blaster",
            "mode": "ranged",
            "range": "12\"",
            "a": "5",
            "skill": "4+",
            "s": "3",
            "ap": "0",
            "d": "1",
            "abilities": "Pistol",
            "sourceSelectionIds": [
              "unit-sicarian-infiltrators-selection-flechette-blaster"
            ]
          },
          {
            "id": "unit-sicarian-infiltrators-profile-62e9bee21a",
            "legacyIds": [
              "unit-sicarian-infiltrators-profile-taser-goad-melee-4"
            ],
            "title": "Taser goad",
            "mode": "melee",
            "range": "Melee",
            "a": "3",
            "skill": "4+",
            "s": "6",
            "ap": "-1",
            "d": "1",
            "abilities": "Sustained Hits 2",
            "sourceSelectionIds": [
              "unit-sicarian-infiltrators-selection-taser-goad"
            ]
          }
        ],
        "wargearAbilities": []
      }
    },
    {
      "id": "unit-sicarian-ruststalkers",
      "title": "Sicarian Ruststalkers",
      "sourceBookId": "adeptus-mechanicus",
      "sourceLayer": "Codex transcription",
      "intrinsicKeywords": [
        "Ruststalkers",
        "Imperium",
        "Adeptus Mechanicus",
        "Infantry",
        "Skitarii",
        "Sicarian"
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
          "Sv": "4+",
          "W": "2",
          "Ld": "7+",
          "OC": "1",
          "Invulnerable": "5+"
        },
        "abilities": [
          {
            "id": "datasheet-optimised-gait",
            "sectionId": "datasheet-optimised-gait",
            "title": "Optimised Gait",
            "text": "Add 1 to Advance and Charge rolls made for this unit. While this unit is within 6\" of one or more friendly Adeptus Mechanicus Battleline units, add 2 to Advance and Charge rolls made for this unit instead.",
            "sourceUnitId": "unit-sicarian-ruststalkers"
          },
          {
            "id": "core-stealth",
            "sectionId": "core-stealth",
            "title": "Stealth",
            "text": "",
            "sourceUnitId": "unit-sicarian-ruststalkers"
          },
          {
            "id": "doctrina-imperatives",
            "sectionId": "doctrina-imperatives",
            "title": "Doctrina Imperatives",
            "text": "At the start of the battle round, you can select one of the Doctrina Imperatives below. Until the end of the battle round, that Doctrina Imperative is active for your army, and all units from your army that have the Doctrina Imperatives ability gain the relevant abilities shown below.\n\nPROTECTOR IMPERATIVE\n■ Ranged weapons equipped by models in this unit have the [HEAVY] ability.\n■ Improve the Ballistic Skill characteristic of ranged weapons equipped by models in this unit by 1.\n■ Each time a melee attack targets this unit, if this unit has the Battleline keyword and/or it is within 6\" of one or more friendly Adeptus Mechanicus Battleline units, subtract 1 from the Hit roll.\n\nCONQUEROR IMPERATIVE\n■ Ranged weapons equipped by models in this unit have the [ASSAULT] ability.\n■ Improve the Weapon Skill characteristic of melee weapons equipped by models in this unit by 1.\n■ Each time a model in this unit makes an attack, if this unit has the Battleline keyword and/or it is within 6\" of one or more friendly Adeptus Mechanicus Battleline units, improve the Armour Penetration characteristic of that attack by 1.",
            "sourceUnitId": "unit-sicarian-ruststalkers"
          }
        ],
        "models": [
          {
            "id": "unit-sicarian-ruststalkers-model-878f533098",
            "title": "Sicarian Ruststalker Princeps",
            "aliases": [
              "Sicarian Ruststalker Princeps"
            ],
            "legacyIds": [
              "unit-sicarian-ruststalkers-model-sicarian-ruststalker-princeps"
            ]
          },
          {
            "id": "unit-sicarian-ruststalkers-model-7350654f59",
            "title": "Sicarian Ruststalker",
            "aliases": [
              "Sicarian Ruststalker",
              "Sicarian Ruststalkers"
            ],
            "legacyIds": [
              "unit-sicarian-ruststalkers-model-sicarian-ruststalker-2"
            ]
          }
        ],
        "selections": [
          {
            "id": "unit-sicarian-ruststalkers-selection-transonic-razor-chordclaw",
            "title": "Transonic razor & chordclaw",
            "aliases": [
              "Transonic razor & chordclaw"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-sicarian-ruststalkers-profile-cf63eb1d4b"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-sicarian-ruststalkers-selection-transonic-blades",
            "title": "Transonic blades",
            "aliases": [
              "Transonic blades"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-sicarian-ruststalkers-profile-90e1acf784"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-sicarian-ruststalkers-selection-transonic-blades-chordclaw",
            "title": "Transonic blades & chordclaw",
            "aliases": [
              "Transonic blades & chordclaw"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-sicarian-ruststalkers-profile-3b17d7ad21"
            ],
            "wargearAbilityIds": []
          }
        ],
        "weaponFamilies": [],
        "weaponProfiles": [
          {
            "id": "unit-sicarian-ruststalkers-profile-cf63eb1d4b",
            "legacyIds": [
              "unit-sicarian-ruststalkers-profile-transonic-razor-chordclaw-melee"
            ],
            "title": "Transonic razor & chordclaw",
            "mode": "melee",
            "range": "Melee",
            "a": "3",
            "skill": "4+",
            "s": "5",
            "ap": "-2",
            "d": "2",
            "abilities": "Anti-Infantry 3+, Precision",
            "sourceSelectionIds": [
              "unit-sicarian-ruststalkers-selection-transonic-razor-chordclaw"
            ]
          },
          {
            "id": "unit-sicarian-ruststalkers-profile-90e1acf784",
            "legacyIds": [
              "unit-sicarian-ruststalkers-profile-transonic-blades-melee-2"
            ],
            "title": "Transonic blades",
            "mode": "melee",
            "range": "Melee",
            "a": "5",
            "skill": "4+",
            "s": "5",
            "ap": "-1",
            "d": "1",
            "abilities": "Devastating Wounds, Precision",
            "sourceSelectionIds": [
              "unit-sicarian-ruststalkers-selection-transonic-blades"
            ]
          },
          {
            "id": "unit-sicarian-ruststalkers-profile-3b17d7ad21",
            "legacyIds": [
              "unit-sicarian-ruststalkers-profile-transonic-blades-chordclaw-melee-3"
            ],
            "title": "Transonic blades & chordclaw",
            "mode": "melee",
            "range": "Melee",
            "a": "5",
            "skill": "4+",
            "s": "5",
            "ap": "-2",
            "d": "1",
            "abilities": "Anti-Infantry 3+, Devastating Wounds, Precision",
            "sourceSelectionIds": [
              "unit-sicarian-ruststalkers-selection-transonic-blades-chordclaw"
            ]
          }
        ],
        "wargearAbilities": []
      }
    },
    {
      "id": "unit-serberys-raiders",
      "title": "Serberys Raiders",
      "sourceBookId": "adeptus-mechanicus",
      "sourceLayer": "Codex transcription",
      "intrinsicKeywords": [
        "Serberys Raiders",
        "Imperium",
        "Adeptus Mechanicus",
        "Skitarii",
        "Mounted"
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
          "W": "2",
          "Ld": "7+",
          "OC": "2",
          "Invulnerable": "5+"
        },
        "abilities": [
          {
            "id": "datasheet-tactica-obliqua",
            "sectionId": "datasheet-tactica-obliqua",
            "title": "Tactica Obliqua",
            "text": "In your opponent's Movement phase, if an enemy unit ends a move within 8” of this unit, if this unit is not within Engagement Range of one or more enemy units, it can do one of the following:\n- Make a Normal move of up to D6\".\n- Make a Normal move of up to 6\", provided every model in this unit ends that move wholly within 6\" of one or more friendly Adeptus Mechanicus Battleline units.",
            "sourceUnitId": "unit-serberys-raiders"
          },
          {
            "id": "core-scouts",
            "sectionId": "core-scouts",
            "title": "Scouts 9\"",
            "text": "",
            "sourceUnitId": "unit-serberys-raiders"
          },
          {
            "id": "doctrina-imperatives",
            "sectionId": "doctrina-imperatives",
            "title": "Doctrina Imperatives",
            "text": "At the start of the battle round, you can select one of the Doctrina Imperatives below. Until the end of the battle round, that Doctrina Imperative is active for your army, and all units from your army that have the Doctrina Imperatives ability gain the relevant abilities shown below.\n\nPROTECTOR IMPERATIVE\n■ Ranged weapons equipped by models in this unit have the [HEAVY] ability.\n■ Improve the Ballistic Skill characteristic of ranged weapons equipped by models in this unit by 1.\n■ Each time a melee attack targets this unit, if this unit has the Battleline keyword and/or it is within 6\" of one or more friendly Adeptus Mechanicus Battleline units, subtract 1 from the Hit roll.\n\nCONQUEROR IMPERATIVE\n■ Ranged weapons equipped by models in this unit have the [ASSAULT] ability.\n■ Improve the Weapon Skill characteristic of melee weapons equipped by models in this unit by 1.\n■ Each time a model in this unit makes an attack, if this unit has the Battleline keyword and/or it is within 6\" of one or more friendly Adeptus Mechanicus Battleline units, improve the Armour Penetration characteristic of that attack by 1.",
            "sourceUnitId": "unit-serberys-raiders"
          }
        ],
        "models": [
          {
            "id": "unit-serberys-raiders-model-69da2842bc",
            "title": "Serberys Raider Alpha",
            "aliases": [
              "Serberys Raider Alpha"
            ],
            "legacyIds": [
              "unit-serberys-raiders-model-serberys-raider-alpha"
            ]
          },
          {
            "id": "unit-serberys-raiders-model-498375f1e9",
            "title": "Serberys Raider",
            "aliases": [
              "Serberys Raider",
              "Serberys Raiders"
            ],
            "legacyIds": [
              "unit-serberys-raiders-model-serberys-raider-2"
            ]
          }
        ],
        "selections": [
          {
            "id": "unit-serberys-raiders-selection-galvanic-carbine",
            "title": "Galvanic carbine",
            "aliases": [
              "Galvanic carbine"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-serberys-raiders-profile-e6b6b0e489"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-serberys-raiders-selection-cavalry-sabre-clawed-limbs",
            "title": "Cavalry sabre & clawed limbs",
            "aliases": [
              "Cavalry sabre & clawed limbs"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-serberys-raiders-profile-34f33545b8"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-serberys-raiders-selection-mechanicus-pistol",
            "title": "Mechanicus pistol",
            "aliases": [
              "Mechanicus pistol"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-serberys-raiders-profile-8a7f265f02"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-serberys-raiders-selection-enhanced-data-tether",
            "title": "Enhanced data-tether",
            "aliases": [
              "Enhanced data-tether"
            ],
            "kind": "wargear",
            "profileIds": [],
            "wargearAbilityIds": [
              "unit-serberys-raiders-wargear-ability-86cd99761f"
            ]
          }
        ],
        "weaponFamilies": [],
        "weaponProfiles": [
          {
            "id": "unit-serberys-raiders-profile-e6b6b0e489",
            "legacyIds": [
              "unit-serberys-raiders-profile-galvanic-carbine-ranged"
            ],
            "title": "Galvanic carbine",
            "mode": "ranged",
            "range": "18\"",
            "a": "3",
            "skill": "4+",
            "s": "4",
            "ap": "0",
            "d": "1",
            "abilities": "Devastating Wounds",
            "sourceSelectionIds": [
              "unit-serberys-raiders-selection-galvanic-carbine"
            ]
          },
          {
            "id": "unit-serberys-raiders-profile-34f33545b8",
            "legacyIds": [
              "unit-serberys-raiders-profile-cavalry-sabre-clawed-limbs-melee-2"
            ],
            "title": "Cavalry sabre & clawed limbs",
            "mode": "melee",
            "range": "Melee",
            "a": "4",
            "skill": "4+",
            "s": "4",
            "ap": "-1",
            "d": "1",
            "abilities": "",
            "sourceSelectionIds": [
              "unit-serberys-raiders-selection-cavalry-sabre-clawed-limbs"
            ]
          },
          {
            "id": "unit-serberys-raiders-profile-8a7f265f02",
            "legacyIds": [
              "unit-serberys-raiders-profile-mechanicus-pistol-ranged-3"
            ],
            "title": "Mechanicus pistol",
            "mode": "ranged",
            "range": "12\"",
            "a": "1",
            "skill": "4+",
            "s": "6",
            "ap": "-1",
            "d": "1",
            "abilities": "Devastating Wounds, Pistol",
            "sourceSelectionIds": [
              "unit-serberys-raiders-selection-mechanicus-pistol"
            ]
          }
        ],
        "wargearAbilities": [
          {
            "id": "unit-serberys-raiders-wargear-ability-86cd99761f",
            "sectionId": "unit-serberys-raiders-wargear-ability-86cd99761f",
            "title": "Enhanced data-tether",
            "text": "Each time you select the bearer’s unit as the target of a Stratagem, roll one D6: on a 5+, you gain 1CP.",
            "sourceUnitId": "unit-serberys-raiders",
            "legacyIds": [
              "unit-serberys-raiders-wargear-ability-enhanced-data-tether"
            ],
            "requiredSelectionIds": [
              "unit-serberys-raiders-selection-enhanced-data-tether"
            ]
          }
        ]
      }
    },
    {
      "id": "unit-serberys-sulphurhounds",
      "title": "Serberys Sulphurhounds",
      "sourceBookId": "adeptus-mechanicus",
      "sourceLayer": "Codex transcription",
      "intrinsicKeywords": [
        "Serberys Sulphurhounds",
        "Imperium",
        "Adeptus Mechanicus",
        "Skitarii",
        "Mounted"
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
          "W": "2",
          "Ld": "7+",
          "OC": "2",
          "Invulnerable": "5+"
        },
        "abilities": [
          {
            "id": "datasheet-line-breakers",
            "sectionId": "datasheet-line-breakers",
            "title": "Line-breakers",
            "text": "Each time this unit ends a Charge move, select one enemy unit within Engagement Range of it and roll one D6 for each model in this unit that is within Engagement Range of that enemy unit, adding 2 to the result if this unit started its Charge move within 6\" of one or more friendly Adeptus Mechanicus Battleline units. For each 4+, that enemy unit suffers 1 mortal wound.",
            "sourceUnitId": "unit-serberys-sulphurhounds"
          },
          {
            "id": "doctrina-imperatives",
            "sectionId": "doctrina-imperatives",
            "title": "Doctrina Imperatives",
            "text": "At the start of the battle round, you can select one of the Doctrina Imperatives below. Until the end of the battle round, that Doctrina Imperative is active for your army, and all units from your army that have the Doctrina Imperatives ability gain the relevant abilities shown below.\n\nPROTECTOR IMPERATIVE\n■ Ranged weapons equipped by models in this unit have the [HEAVY] ability.\n■ Improve the Ballistic Skill characteristic of ranged weapons equipped by models in this unit by 1.\n■ Each time a melee attack targets this unit, if this unit has the Battleline keyword and/or it is within 6\" of one or more friendly Adeptus Mechanicus Battleline units, subtract 1 from the Hit roll.\n\nCONQUEROR IMPERATIVE\n■ Ranged weapons equipped by models in this unit have the [ASSAULT] ability.\n■ Improve the Weapon Skill characteristic of melee weapons equipped by models in this unit by 1.\n■ Each time a model in this unit makes an attack, if this unit has the Battleline keyword and/or it is within 6\" of one or more friendly Adeptus Mechanicus Battleline units, improve the Armour Penetration characteristic of that attack by 1.",
            "sourceUnitId": "unit-serberys-sulphurhounds"
          }
        ],
        "models": [
          {
            "id": "unit-serberys-sulphurhounds-model-58e4f93be9",
            "title": "Serberys Sulphurhound Alpha",
            "aliases": [
              "Serberys Sulphurhound Alpha"
            ],
            "legacyIds": [
              "unit-serberys-sulphurhounds-model-serberys-sulphurhound-alpha"
            ]
          },
          {
            "id": "unit-serberys-sulphurhounds-model-46586c65d4",
            "title": "Serberys Sulphurhound",
            "aliases": [
              "Serberys Sulphurhound",
              "Serberys Sulphurhounds"
            ],
            "legacyIds": [
              "unit-serberys-sulphurhounds-model-serberys-sulphurhound-2"
            ]
          }
        ],
        "selections": [
          {
            "id": "unit-serberys-sulphurhounds-selection-cavalry-arc-maul",
            "title": "Cavalry arc maul",
            "aliases": [
              "Cavalry arc maul"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-serberys-sulphurhounds-profile-7364bde76b"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-serberys-sulphurhounds-selection-clawed-limbs",
            "title": "Clawed limbs",
            "aliases": [
              "Clawed limbs"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-serberys-sulphurhounds-profile-c9b8d02f80"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-serberys-sulphurhounds-selection-mechanicus-pistol",
            "title": "Mechanicus pistol",
            "aliases": [
              "Mechanicus pistol"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-serberys-sulphurhounds-profile-8a7f265f02"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-serberys-sulphurhounds-selection-sulphur-breath",
            "title": "Sulphur breath",
            "aliases": [
              "Sulphur breath"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-serberys-sulphurhounds-profile-d376e8e883"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-serberys-sulphurhounds-selection-phosphor-pistol",
            "title": "Phosphor pistol",
            "aliases": [
              "Phosphor pistol"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-serberys-sulphurhounds-profile-6aceb79c72"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-serberys-sulphurhounds-selection-phosphor-blast-carbine",
            "title": "Phosphor blast carbine",
            "aliases": [
              "Phosphor blast carbine"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-serberys-sulphurhounds-profile-6380197a39"
            ],
            "wargearAbilityIds": []
          }
        ],
        "weaponFamilies": [],
        "weaponProfiles": [
          {
            "id": "unit-serberys-sulphurhounds-profile-7364bde76b",
            "legacyIds": [
              "unit-serberys-sulphurhounds-profile-cavalry-arc-maul-melee"
            ],
            "title": "Cavalry arc maul",
            "mode": "melee",
            "range": "Melee",
            "a": "1",
            "skill": "4+",
            "s": "5",
            "ap": "-1",
            "d": "1",
            "abilities": "Anti-Vehicle 4+, Devastating Wounds, Extra Attacks",
            "sourceSelectionIds": [
              "unit-serberys-sulphurhounds-selection-cavalry-arc-maul"
            ]
          },
          {
            "id": "unit-serberys-sulphurhounds-profile-c9b8d02f80",
            "legacyIds": [
              "unit-serberys-sulphurhounds-profile-clawed-limbs-melee-2"
            ],
            "title": "Clawed limbs",
            "mode": "melee",
            "range": "Melee",
            "a": "4",
            "skill": "4+",
            "s": "4",
            "ap": "0",
            "d": "1",
            "abilities": "",
            "sourceSelectionIds": [
              "unit-serberys-sulphurhounds-selection-clawed-limbs"
            ]
          },
          {
            "id": "unit-serberys-sulphurhounds-profile-8a7f265f02",
            "legacyIds": [
              "unit-serberys-sulphurhounds-profile-mechanicus-pistol-ranged-3"
            ],
            "title": "Mechanicus pistol",
            "mode": "ranged",
            "range": "12\"",
            "a": "1",
            "skill": "4+",
            "s": "6",
            "ap": "-1",
            "d": "1",
            "abilities": "Devastating Wounds, Pistol",
            "sourceSelectionIds": [
              "unit-serberys-sulphurhounds-selection-mechanicus-pistol"
            ]
          },
          {
            "id": "unit-serberys-sulphurhounds-profile-d376e8e883",
            "legacyIds": [
              "unit-serberys-sulphurhounds-profile-sulphur-breath-ranged-4"
            ],
            "title": "Sulphur breath",
            "mode": "ranged",
            "range": "9\"",
            "a": "D6",
            "skill": "N/A",
            "s": "3",
            "ap": "-1",
            "d": "1",
            "abilities": "Ignores Cover, Pistol, Torrent",
            "sourceSelectionIds": [
              "unit-serberys-sulphurhounds-selection-sulphur-breath"
            ]
          },
          {
            "id": "unit-serberys-sulphurhounds-profile-6aceb79c72",
            "legacyIds": [
              "unit-serberys-sulphurhounds-profile-phosphor-pistol-ranged-5"
            ],
            "title": "Phosphor pistol",
            "mode": "ranged",
            "range": "12\"",
            "a": "1",
            "skill": "4+",
            "s": "4",
            "ap": "0",
            "d": "1",
            "abilities": "Ignores Cover, Pistol",
            "sourceSelectionIds": [
              "unit-serberys-sulphurhounds-selection-phosphor-pistol"
            ]
          },
          {
            "id": "unit-serberys-sulphurhounds-profile-6380197a39",
            "legacyIds": [
              "unit-serberys-sulphurhounds-profile-phosphor-blast-carbine-ranged-6"
            ],
            "title": "Phosphor blast carbine",
            "mode": "ranged",
            "range": "18\"",
            "a": "D6",
            "skill": "4+",
            "s": "6",
            "ap": "0",
            "d": "1",
            "abilities": "Blast, Ignores cover",
            "sourceSelectionIds": [
              "unit-serberys-sulphurhounds-selection-phosphor-blast-carbine"
            ]
          }
        ],
        "wargearAbilities": []
      }
    },
    {
      "id": "unit-archaeopter-fusilave",
      "title": "Archaeopter Fusilave",
      "sourceBookId": "adeptus-mechanicus",
      "sourceLayer": "Codex transcription",
      "intrinsicKeywords": [
        "Archaeopter Fusilave",
        "Vehicle",
        "Aircraft",
        "Fly",
        "Imperium",
        "Adeptus Mechanicus",
        "Skitarii"
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
          "W": "10",
          "Ld": "7+",
          "OC": "-"
        },
        "abilities": [
          {
            "id": "datasheet-bomb-rack",
            "sectionId": "datasheet-bomb-rack",
            "title": "Bomb Rack",
            "text": "At the end of your opponent’s Fight phase, select one visible enemy unit (excluding Lone Operative units) within 24\" of this unit, and roll six D6 for that unit: for each 4+, that unit suffers 1 mortal wound.",
            "sourceUnitId": "unit-archaeopter-fusilave"
          },
          {
            "id": "core-deadly-demise",
            "sectionId": "core-deadly-demise",
            "title": "Deadly Demise D3",
            "text": "",
            "sourceUnitId": "unit-archaeopter-fusilave"
          },
          {
            "id": "doctrina-imperatives",
            "sectionId": "doctrina-imperatives",
            "title": "Doctrina Imperatives",
            "text": "At the start of the battle round, you can select one of the Doctrina Imperatives below. Until the end of the battle round, that Doctrina Imperative is active for your army, and all units from your army that have the Doctrina Imperatives ability gain the relevant abilities shown below.\n\nPROTECTOR IMPERATIVE\n■ Ranged weapons equipped by models in this unit have the [HEAVY] ability.\n■ Improve the Ballistic Skill characteristic of ranged weapons equipped by models in this unit by 1.\n■ Each time a melee attack targets this unit, if this unit has the Battleline keyword and/or it is within 6\" of one or more friendly Adeptus Mechanicus Battleline units, subtract 1 from the Hit roll.\n\nCONQUEROR IMPERATIVE\n■ Ranged weapons equipped by models in this unit have the [ASSAULT] ability.\n■ Improve the Weapon Skill characteristic of melee weapons equipped by models in this unit by 1.\n■ Each time a model in this unit makes an attack, if this unit has the Battleline keyword and/or it is within 6\" of one or more friendly Adeptus Mechanicus Battleline units, improve the Armour Penetration characteristic of that attack by 1.",
            "sourceUnitId": "unit-archaeopter-fusilave"
          }
        ],
        "models": [
          {
            "id": "unit-archaeopter-fusilave-model-a88be19f55",
            "title": "Archaeopter Fusilave",
            "aliases": [
              "Archaeopter Fusilave"
            ],
            "legacyIds": [
              "unit-archaeopter-fusilave-model-archaeopter-fusilave"
            ]
          }
        ],
        "selections": [
          {
            "id": "unit-archaeopter-fusilave-selection-armoured-hull",
            "title": "Armoured hull",
            "aliases": [
              "Armoured hull"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-archaeopter-fusilave-profile-7809a5e4d6"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-archaeopter-fusilave-selection-cognis-heavy-stubber-array",
            "title": "Cognis heavy stubber array",
            "aliases": [
              "Cognis heavy stubber array"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-archaeopter-fusilave-profile-d60783ae2b"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-archaeopter-fusilave-selection-chaff-launcher",
            "title": "Chaff Launcher",
            "aliases": [
              "Chaff Launcher"
            ],
            "kind": "wargear",
            "profileIds": [],
            "wargearAbilityIds": [
              "unit-archaeopter-fusilave-wargear-ability-12711a645a"
            ]
          },
          {
            "id": "unit-archaeopter-fusilave-selection-command-uplink",
            "title": "Command Uplink",
            "aliases": [
              "Command Uplink"
            ],
            "kind": "wargear",
            "profileIds": [],
            "wargearAbilityIds": [
              "unit-archaeopter-fusilave-wargear-ability-b314938f56"
            ]
          }
        ],
        "weaponFamilies": [],
        "weaponProfiles": [
          {
            "id": "unit-archaeopter-fusilave-profile-7809a5e4d6",
            "legacyIds": [
              "unit-archaeopter-fusilave-profile-armoured-hull-melee"
            ],
            "title": "Armoured hull",
            "mode": "melee",
            "range": "Melee",
            "a": "3",
            "skill": "4+",
            "s": "6",
            "ap": "0",
            "d": "1",
            "abilities": "",
            "sourceSelectionIds": [
              "unit-archaeopter-fusilave-selection-armoured-hull"
            ]
          },
          {
            "id": "unit-archaeopter-fusilave-profile-d60783ae2b",
            "legacyIds": [
              "unit-archaeopter-fusilave-profile-cognis-heavy-stubber-array-ranged-2"
            ],
            "title": "Cognis heavy stubber array",
            "mode": "ranged",
            "range": "36\"",
            "a": "9",
            "skill": "4+",
            "s": "4",
            "ap": "0",
            "d": "1",
            "abilities": "Rapid Fire 9, Sustained Hits 1, Twin-linked",
            "sourceSelectionIds": [
              "unit-archaeopter-fusilave-selection-cognis-heavy-stubber-array"
            ]
          }
        ],
        "wargearAbilities": [
          {
            "id": "unit-archaeopter-fusilave-wargear-ability-12711a645a",
            "sectionId": "unit-archaeopter-fusilave-wargear-ability-12711a645a",
            "title": "Chaff Launcher",
            "text": "The bearer has the Smoke keyword.",
            "sourceUnitId": "unit-archaeopter-fusilave",
            "legacyIds": [
              "unit-archaeopter-fusilave-wargear-ability-chaff-launcher"
            ],
            "requiredSelectionIds": [
              "unit-archaeopter-fusilave-selection-chaff-launcher"
            ]
          },
          {
            "id": "unit-archaeopter-fusilave-wargear-ability-b314938f56",
            "sectionId": "unit-archaeopter-fusilave-wargear-ability-b314938f56",
            "title": "Command Uplink",
            "text": "Each time you select the bearer’s unit as the target of a Stratagem, roll one D6: on a 5+, you gain 1CP.",
            "sourceUnitId": "unit-archaeopter-fusilave",
            "legacyIds": [
              "unit-archaeopter-fusilave-wargear-ability-command-uplink-2"
            ],
            "requiredSelectionIds": [
              "unit-archaeopter-fusilave-selection-command-uplink"
            ]
          }
        ]
      }
    },
    {
      "id": "unit-archaeopter-stratoraptor",
      "title": "Archaeopter Stratoraptor",
      "sourceBookId": "adeptus-mechanicus",
      "sourceLayer": "Codex transcription",
      "intrinsicKeywords": [
        "Archaeopter Stratoraptor",
        "Skitarii",
        "Vehicle",
        "Aircraft",
        "Fly",
        "Imperium",
        "Adeptus Mechanicus"
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
          "W": "10",
          "Ld": "7+",
          "OC": "-"
        },
        "abilities": [
          {
            "id": "datasheet-strafing-run",
            "sectionId": "datasheet-strafing-run",
            "title": "Strafing Run",
            "text": "Each time this model makes a ranged attack that targets an enemy unit (excluding units that can Fly), add 1 to the Hit roll.",
            "sourceUnitId": "unit-archaeopter-stratoraptor"
          },
          {
            "id": "core-deadly-demise",
            "sectionId": "core-deadly-demise",
            "title": "Deadly Demise D3",
            "text": "",
            "sourceUnitId": "unit-archaeopter-stratoraptor"
          },
          {
            "id": "doctrina-imperatives",
            "sectionId": "doctrina-imperatives",
            "title": "Doctrina Imperatives",
            "text": "At the start of the battle round, you can select one of the Doctrina Imperatives below. Until the end of the battle round, that Doctrina Imperative is active for your army, and all units from your army that have the Doctrina Imperatives ability gain the relevant abilities shown below.\n\nPROTECTOR IMPERATIVE\n■ Ranged weapons equipped by models in this unit have the [HEAVY] ability.\n■ Improve the Ballistic Skill characteristic of ranged weapons equipped by models in this unit by 1.\n■ Each time a melee attack targets this unit, if this unit has the Battleline keyword and/or it is within 6\" of one or more friendly Adeptus Mechanicus Battleline units, subtract 1 from the Hit roll.\n\nCONQUEROR IMPERATIVE\n■ Ranged weapons equipped by models in this unit have the [ASSAULT] ability.\n■ Improve the Weapon Skill characteristic of melee weapons equipped by models in this unit by 1.\n■ Each time a model in this unit makes an attack, if this unit has the Battleline keyword and/or it is within 6\" of one or more friendly Adeptus Mechanicus Battleline units, improve the Armour Penetration characteristic of that attack by 1.",
            "sourceUnitId": "unit-archaeopter-stratoraptor"
          }
        ],
        "models": [
          {
            "id": "unit-archaeopter-stratoraptor-model-66d3ff3786",
            "title": "Archaeopter Stratoraptor",
            "aliases": [
              "Archaeopter Stratoraptor"
            ],
            "legacyIds": [
              "unit-archaeopter-stratoraptor-model-archaeopter-stratoraptor"
            ]
          }
        ],
        "selections": [
          {
            "id": "unit-archaeopter-stratoraptor-selection-cognis-heavy-stubber",
            "title": "Cognis heavy stubber",
            "aliases": [
              "Cognis heavy stubber"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-archaeopter-stratoraptor-profile-c9ef020652"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-archaeopter-stratoraptor-selection-heavy-phosphor-blaster",
            "title": "Heavy phosphor blaster",
            "aliases": [
              "Heavy phosphor blaster"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-archaeopter-stratoraptor-profile-f4fa84c61d"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-archaeopter-stratoraptor-selection-twin-cognis-lascannon",
            "title": "Twin cognis lascannon",
            "aliases": [
              "Twin cognis lascannon"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-archaeopter-stratoraptor-profile-041a74e806"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-archaeopter-stratoraptor-selection-armoured-hull",
            "title": "Armoured hull",
            "aliases": [
              "Armoured hull"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-archaeopter-stratoraptor-profile-7809a5e4d6"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-archaeopter-stratoraptor-selection-chaff-launcher",
            "title": "Chaff Launcher",
            "aliases": [
              "Chaff Launcher"
            ],
            "kind": "wargear",
            "profileIds": [],
            "wargearAbilityIds": [
              "unit-archaeopter-stratoraptor-wargear-ability-12711a645a"
            ]
          },
          {
            "id": "unit-archaeopter-stratoraptor-selection-command-uplink",
            "title": "Command Uplink",
            "aliases": [
              "Command Uplink"
            ],
            "kind": "wargear",
            "profileIds": [],
            "wargearAbilityIds": [
              "unit-archaeopter-stratoraptor-wargear-ability-b314938f56"
            ]
          }
        ],
        "weaponFamilies": [],
        "weaponProfiles": [
          {
            "id": "unit-archaeopter-stratoraptor-profile-c9ef020652",
            "legacyIds": [
              "unit-archaeopter-stratoraptor-profile-cognis-heavy-stubber-ranged"
            ],
            "title": "Cognis heavy stubber",
            "mode": "ranged",
            "range": "36\"",
            "a": "3",
            "skill": "4+",
            "s": "4",
            "ap": "0",
            "d": "1",
            "abilities": "Rapid Fire 3, Sustained Hits 1",
            "sourceSelectionIds": [
              "unit-archaeopter-stratoraptor-selection-cognis-heavy-stubber"
            ]
          },
          {
            "id": "unit-archaeopter-stratoraptor-profile-f4fa84c61d",
            "legacyIds": [
              "unit-archaeopter-stratoraptor-profile-heavy-phosphor-blaster-ranged-2"
            ],
            "title": "Heavy phosphor blaster",
            "mode": "ranged",
            "range": "36\"",
            "a": "3",
            "skill": "4+",
            "s": "6",
            "ap": "-1",
            "d": "2",
            "abilities": "Ignores Cover",
            "sourceSelectionIds": [
              "unit-archaeopter-stratoraptor-selection-heavy-phosphor-blaster"
            ]
          },
          {
            "id": "unit-archaeopter-stratoraptor-profile-041a74e806",
            "legacyIds": [
              "unit-archaeopter-stratoraptor-profile-twin-cognis-lascannon-ranged-3"
            ],
            "title": "Twin cognis lascannon",
            "mode": "ranged",
            "range": "48\"",
            "a": "1",
            "skill": "4+",
            "s": "12",
            "ap": "-3",
            "d": "D6+1",
            "abilities": "Sustained hits 1, Twin-linked",
            "sourceSelectionIds": [
              "unit-archaeopter-stratoraptor-selection-twin-cognis-lascannon"
            ]
          },
          {
            "id": "unit-archaeopter-stratoraptor-profile-7809a5e4d6",
            "legacyIds": [
              "unit-archaeopter-stratoraptor-profile-armoured-hull-melee-4"
            ],
            "title": "Armoured hull",
            "mode": "melee",
            "range": "Melee",
            "a": "3",
            "skill": "4+",
            "s": "6",
            "ap": "0",
            "d": "1",
            "abilities": "",
            "sourceSelectionIds": [
              "unit-archaeopter-stratoraptor-selection-armoured-hull"
            ]
          }
        ],
        "wargearAbilities": [
          {
            "id": "unit-archaeopter-stratoraptor-wargear-ability-12711a645a",
            "sectionId": "unit-archaeopter-stratoraptor-wargear-ability-12711a645a",
            "title": "Chaff Launcher",
            "text": "The bearer has the Smoke keyword.",
            "sourceUnitId": "unit-archaeopter-stratoraptor",
            "legacyIds": [
              "unit-archaeopter-stratoraptor-wargear-ability-chaff-launcher"
            ],
            "requiredSelectionIds": [
              "unit-archaeopter-stratoraptor-selection-chaff-launcher"
            ]
          },
          {
            "id": "unit-archaeopter-stratoraptor-wargear-ability-b314938f56",
            "sectionId": "unit-archaeopter-stratoraptor-wargear-ability-b314938f56",
            "title": "Command Uplink",
            "text": "Each time you select the bearer’s unit as the target of a Stratagem, roll one D6: on a 5+, you gain 1CP.",
            "sourceUnitId": "unit-archaeopter-stratoraptor",
            "legacyIds": [
              "unit-archaeopter-stratoraptor-wargear-ability-command-uplink-2"
            ],
            "requiredSelectionIds": [
              "unit-archaeopter-stratoraptor-selection-command-uplink"
            ]
          }
        ]
      }
    },
    {
      "id": "unit-archaeopter-transvector",
      "title": "Archaeopter Transvector",
      "sourceBookId": "adeptus-mechanicus",
      "sourceLayer": "Codex transcription",
      "intrinsicKeywords": [
        "Archaeopter Transvector",
        "Adeptus Mechanicus",
        "Vehicle",
        "Fly",
        "Imperium",
        "Skitarii",
        "Transport"
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
          "Sv": "3+",
          "W": "10",
          "Ld": "7+",
          "OC": "0"
        },
        "abilities": [
          {
            "id": "datasheet-aerial-deployment",
            "sectionId": "datasheet-aerial-deployment",
            "title": "Aerial Deployment",
            "text": "In your first Movement phase, this unit can make an ingress move.",
            "sourceUnitId": "unit-archaeopter-transvector"
          },
          {
            "id": "core-hover",
            "sectionId": "core-hover",
            "title": "Hover",
            "text": "",
            "sourceUnitId": "unit-archaeopter-transvector"
          },
          {
            "id": "core-deep-strike",
            "sectionId": "core-deep-strike",
            "title": "Deep Strike",
            "text": "",
            "sourceUnitId": "unit-archaeopter-transvector"
          },
          {
            "id": "core-deadly-demise",
            "sectionId": "core-deadly-demise",
            "title": "Deadly Demise D3",
            "text": "",
            "sourceUnitId": "unit-archaeopter-transvector"
          },
          {
            "id": "doctrina-imperatives",
            "sectionId": "doctrina-imperatives",
            "title": "Doctrina Imperatives",
            "text": "At the start of the battle round, you can select one of the Doctrina Imperatives below. Until the end of the battle round, that Doctrina Imperative is active for your army, and all units from your army that have the Doctrina Imperatives ability gain the relevant abilities shown below.\n\nPROTECTOR IMPERATIVE\n■ Ranged weapons equipped by models in this unit have the [HEAVY] ability.\n■ Improve the Ballistic Skill characteristic of ranged weapons equipped by models in this unit by 1.\n■ Each time a melee attack targets this unit, if this unit has the Battleline keyword and/or it is within 6\" of one or more friendly Adeptus Mechanicus Battleline units, subtract 1 from the Hit roll.\n\nCONQUEROR IMPERATIVE\n■ Ranged weapons equipped by models in this unit have the [ASSAULT] ability.\n■ Improve the Weapon Skill characteristic of melee weapons equipped by models in this unit by 1.\n■ Each time a model in this unit makes an attack, if this unit has the Battleline keyword and/or it is within 6\" of one or more friendly Adeptus Mechanicus Battleline units, improve the Armour Penetration characteristic of that attack by 1.",
            "sourceUnitId": "unit-archaeopter-transvector"
          }
        ],
        "models": [
          {
            "id": "unit-archaeopter-transvector-model-f7b2e1e1b1",
            "title": "Archaeopter Transvector",
            "aliases": [
              "Archaeopter Transvector"
            ],
            "legacyIds": [
              "unit-archaeopter-transvector-model-archaeopter-transvector"
            ]
          }
        ],
        "selections": [
          {
            "id": "unit-archaeopter-transvector-selection-armoured-hull",
            "title": "Armoured hull",
            "aliases": [
              "Armoured hull"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-archaeopter-transvector-profile-7809a5e4d6"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-archaeopter-transvector-selection-cognis-heavy-stubber-array",
            "title": "Cognis heavy stubber array",
            "aliases": [
              "Cognis heavy stubber array"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-archaeopter-transvector-profile-d60783ae2b"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-archaeopter-transvector-selection-chaff-launcher",
            "title": "Chaff Launcher",
            "aliases": [
              "Chaff Launcher"
            ],
            "kind": "wargear",
            "profileIds": [],
            "wargearAbilityIds": [
              "unit-archaeopter-transvector-wargear-ability-12711a645a"
            ]
          },
          {
            "id": "unit-archaeopter-transvector-selection-command-uplink",
            "title": "Command Uplink",
            "aliases": [
              "Command Uplink"
            ],
            "kind": "wargear",
            "profileIds": [],
            "wargearAbilityIds": [
              "unit-archaeopter-transvector-wargear-ability-b314938f56"
            ]
          }
        ],
        "weaponFamilies": [],
        "weaponProfiles": [
          {
            "id": "unit-archaeopter-transvector-profile-7809a5e4d6",
            "legacyIds": [
              "unit-archaeopter-transvector-profile-armoured-hull-melee"
            ],
            "title": "Armoured hull",
            "mode": "melee",
            "range": "Melee",
            "a": "3",
            "skill": "4+",
            "s": "6",
            "ap": "0",
            "d": "1",
            "abilities": "",
            "sourceSelectionIds": [
              "unit-archaeopter-transvector-selection-armoured-hull"
            ]
          },
          {
            "id": "unit-archaeopter-transvector-profile-d60783ae2b",
            "legacyIds": [
              "unit-archaeopter-transvector-profile-cognis-heavy-stubber-array-ranged-2"
            ],
            "title": "Cognis heavy stubber array",
            "mode": "ranged",
            "range": "36\"",
            "a": "9",
            "skill": "4+",
            "s": "4",
            "ap": "0",
            "d": "1",
            "abilities": "Rapid Fire 9, Sustained Hits 1, Twin-linked",
            "sourceSelectionIds": [
              "unit-archaeopter-transvector-selection-cognis-heavy-stubber-array"
            ]
          }
        ],
        "wargearAbilities": [
          {
            "id": "unit-archaeopter-transvector-wargear-ability-12711a645a",
            "sectionId": "unit-archaeopter-transvector-wargear-ability-12711a645a",
            "title": "Chaff Launcher",
            "text": "The bearer has the Smoke keyword.",
            "sourceUnitId": "unit-archaeopter-transvector",
            "legacyIds": [
              "unit-archaeopter-transvector-wargear-ability-chaff-launcher"
            ],
            "requiredSelectionIds": [
              "unit-archaeopter-transvector-selection-chaff-launcher"
            ]
          },
          {
            "id": "unit-archaeopter-transvector-wargear-ability-b314938f56",
            "sectionId": "unit-archaeopter-transvector-wargear-ability-b314938f56",
            "title": "Command Uplink",
            "text": "Each time you select the bearer’s unit as the target of a Stratagem, roll one D6: on a 5+, you gain 1CP.",
            "sourceUnitId": "unit-archaeopter-transvector",
            "legacyIds": [
              "unit-archaeopter-transvector-wargear-ability-command-uplink-2"
            ],
            "requiredSelectionIds": [
              "unit-archaeopter-transvector-selection-command-uplink"
            ]
          }
        ]
      }
    },
    {
      "id": "unit-ironstrider-ballistarii",
      "title": "Ironstrider Ballistarii",
      "sourceBookId": "adeptus-mechanicus",
      "sourceLayer": "Codex transcription",
      "intrinsicKeywords": [
        "Ironstrider Ballistarii",
        "Vehicle",
        "Smoke",
        "Skitarii",
        "Adeptus Mechanicus",
        "Walker",
        "Imperium"
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
          "T": "7",
          "Sv": "3+",
          "W": "7",
          "Ld": "7+",
          "OC": "2",
          "Invulnerable": "5+"
        },
        "abilities": [
          {
            "id": "datasheet-elevated-strider",
            "sectionId": "datasheet-elevated-strider",
            "title": "Elevated Strider",
            "text": "This unit is eligible to shoot in a turn in which it Fell Back or Advanced, and you can re-roll Desperate Escape tests taken for models in this unit.",
            "sourceUnitId": "unit-ironstrider-ballistarii"
          },
          {
            "id": "datasheet-broad-spectrum-data-tether",
            "sectionId": "datasheet-broad-spectrum-data-tether",
            "title": "Broad Spectrum Data-tether",
            "text": "Each time you target this unit with a Stratagem, roll one D6: on a 5+, you gain 1CP.",
            "sourceUnitId": "unit-ironstrider-ballistarii"
          },
          {
            "id": "core-deadly-demise",
            "sectionId": "core-deadly-demise",
            "title": "Deadly Demise 1",
            "text": "",
            "sourceUnitId": "unit-ironstrider-ballistarii"
          },
          {
            "id": "doctrina-imperatives",
            "sectionId": "doctrina-imperatives",
            "title": "Doctrina Imperatives",
            "text": "At the start of the battle round, you can select one of the Doctrina Imperatives below. Until the end of the battle round, that Doctrina Imperative is active for your army, and all units from your army that have the Doctrina Imperatives ability gain the relevant abilities shown below.\n\nPROTECTOR IMPERATIVE\n■ Ranged weapons equipped by models in this unit have the [HEAVY] ability.\n■ Improve the Ballistic Skill characteristic of ranged weapons equipped by models in this unit by 1.\n■ Each time a melee attack targets this unit, if this unit has the Battleline keyword and/or it is within 6\" of one or more friendly Adeptus Mechanicus Battleline units, subtract 1 from the Hit roll.\n\nCONQUEROR IMPERATIVE\n■ Ranged weapons equipped by models in this unit have the [ASSAULT] ability.\n■ Improve the Weapon Skill characteristic of melee weapons equipped by models in this unit by 1.\n■ Each time a model in this unit makes an attack, if this unit has the Battleline keyword and/or it is within 6\" of one or more friendly Adeptus Mechanicus Battleline units, improve the Armour Penetration characteristic of that attack by 1.",
            "sourceUnitId": "unit-ironstrider-ballistarii"
          }
        ],
        "models": [
          {
            "id": "unit-ironstrider-ballistarii-model-ba104582c3",
            "title": "Ironstrider Ballistarii",
            "aliases": [
              "Ironstrider Ballistarii"
            ],
            "legacyIds": [
              "unit-ironstrider-ballistarii-model-ironstrider-ballistarii"
            ]
          }
        ],
        "selections": [
          {
            "id": "unit-ironstrider-ballistarii-selection-twin-cognis-autocannon",
            "title": "Twin cognis autocannon",
            "aliases": [
              "Twin cognis autocannon"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-ironstrider-ballistarii-profile-c9e59c239d"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-ironstrider-ballistarii-selection-ironstrider-feet",
            "title": "Ironstrider feet",
            "aliases": [
              "Ironstrider feet"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-ironstrider-ballistarii-profile-2661cdde1f"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-ironstrider-ballistarii-selection-twin-cognis-lascannon",
            "title": "Twin cognis lascannon",
            "aliases": [
              "Twin cognis lascannon"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-ironstrider-ballistarii-profile-fa6f633b27"
            ],
            "wargearAbilityIds": []
          }
        ],
        "weaponFamilies": [],
        "weaponProfiles": [
          {
            "id": "unit-ironstrider-ballistarii-profile-c9e59c239d",
            "legacyIds": [
              "unit-ironstrider-ballistarii-profile-twin-cognis-autocannon-ranged"
            ],
            "title": "Twin cognis autocannon",
            "mode": "ranged",
            "range": "48\"",
            "a": "4",
            "skill": "4+",
            "s": "9",
            "ap": "-1",
            "d": "3",
            "abilities": "Sustained Hits 1, Twin-linked",
            "sourceSelectionIds": [
              "unit-ironstrider-ballistarii-selection-twin-cognis-autocannon"
            ]
          },
          {
            "id": "unit-ironstrider-ballistarii-profile-2661cdde1f",
            "legacyIds": [
              "unit-ironstrider-ballistarii-profile-ironstrider-feet-melee-2"
            ],
            "title": "Ironstrider feet",
            "mode": "melee",
            "range": "Melee",
            "a": "3",
            "skill": "4+",
            "s": "5",
            "ap": "0",
            "d": "1",
            "abilities": "",
            "sourceSelectionIds": [
              "unit-ironstrider-ballistarii-selection-ironstrider-feet"
            ]
          },
          {
            "id": "unit-ironstrider-ballistarii-profile-fa6f633b27",
            "legacyIds": [
              "unit-ironstrider-ballistarii-profile-twin-cognis-lascannon-ranged-3"
            ],
            "title": "Twin cognis lascannon",
            "mode": "ranged",
            "range": "48\"",
            "a": "2",
            "skill": "4+",
            "s": "12",
            "ap": "-3",
            "d": "D6+1",
            "abilities": "Sustained Hits 1, Twin-linked",
            "sourceSelectionIds": [
              "unit-ironstrider-ballistarii-selection-twin-cognis-lascannon"
            ]
          }
        ],
        "wargearAbilities": []
      }
    },
    {
      "id": "unit-kastelan-robots",
      "title": "Kastelan Robots",
      "sourceBookId": "adeptus-mechanicus",
      "sourceLayer": "Codex transcription",
      "intrinsicKeywords": [
        "Kastelan Robots",
        "Adeptus Mechanicus",
        "Imperium",
        "Vehicle",
        "Walker",
        "Legio Cybernetica"
      ],
      "relations": {
        "canLead": [],
        "canSupport": [],
        "canBeLedBy": [],
        "canBeSupportedBy": [
          {
            "unitId": "unit-cybernetica-datasmith",
            "maxCharacters": 1,
            "removeKeywords": [
              "INFANTRY"
            ],
            "attachmentGroupConstraint": {
              "id": "attachment-group-cybernetica-datasmith-kastelan-robots",
              "targetUnitId": "unit-kastelan-robots",
              "sourceUnitIds": [
                "unit-cybernetica-datasmith"
              ],
              "role": "support",
              "totalCapacity": "UNBOUNDED",
              "perRoleCapacity": "UNBOUNDED",
              "sameCanonicalLimit": "UNBOUNDED",
              "mandatoryParticipant": true,
              "noValidTargetConsequence": {
                "deployment": "CANNOT_DEPLOY",
                "destroyedTiming": "FIRST_BATTLE_ROUND"
              },
              "source": {
                "kind": "accepted-army-ability",
                "sourceId": "adeptus-mechanicus-bsdata-codex",
                "sourceUnitId": "unit-cybernetica-datasmith",
                "sourceAbilityId": "dba5-946a-cd1c-0845"
              },
              "provenance": {
                "sourceId": "adeptus-mechanicus-bsdata-codex",
                "sourceRevision": "7",
                "sourceCommit": "fa30730fca11fbfe87be90684d481d50e0efaf66",
                "currentness": "CURRENT",
                "verifiedAt": "2026-09-22"
              }
            }
          }
        ]
      },
      "ruleFacts": {
        "relations": {
          "canLead": [],
          "canSupport": [],
          "canBeLedBy": [],
          "canBeSupportedBy": [
            {
              "unitId": "unit-cybernetica-datasmith",
              "maxCharacters": 1,
              "removeKeywords": [
                "INFANTRY"
              ],
              "attachmentGroupConstraint": {
                "id": "attachment-group-cybernetica-datasmith-kastelan-robots",
                "targetUnitId": "unit-kastelan-robots",
                "sourceUnitIds": [
                  "unit-cybernetica-datasmith"
                ],
                "role": "support",
                "totalCapacity": "UNBOUNDED",
                "perRoleCapacity": "UNBOUNDED",
                "sameCanonicalLimit": "UNBOUNDED",
                "mandatoryParticipant": true,
                "noValidTargetConsequence": {
                  "deployment": "CANNOT_DEPLOY",
                  "destroyedTiming": "FIRST_BATTLE_ROUND"
                },
                "source": {
                  "kind": "accepted-army-ability",
                  "sourceId": "adeptus-mechanicus-bsdata-codex",
                  "sourceUnitId": "unit-cybernetica-datasmith",
                  "sourceAbilityId": "dba5-946a-cd1c-0845"
                },
                "provenance": {
                  "sourceId": "adeptus-mechanicus-bsdata-codex",
                  "sourceRevision": "7",
                  "sourceCommit": "fa30730fca11fbfe87be90684d481d50e0efaf66",
                  "currentness": "CURRENT",
                  "verifiedAt": "2026-09-22"
                }
              }
            }
          ]
        }
      },
      "gameSelections": {
        "stats": {
          "M": "6\"",
          "T": "9",
          "Sv": "2+",
          "W": "7",
          "Ld": "7+",
          "OC": "2",
          "Invulnerable": "5+"
        },
        "abilities": [
          {
            "id": "datasheet-robotic-bodyguard",
            "sectionId": "datasheet-robotic-bodyguard",
            "title": "Robotic Bodyguard",
            "text": "While a Cybernetica Datasmith model is leading this unit, that model has the Feel No Pain 4+ ability.",
            "sourceUnitId": "unit-kastelan-robots"
          },
          {
            "id": "datasheet-repulsor-grid",
            "sectionId": "datasheet-repulsor-grid",
            "title": "Repulsor Grid",
            "text": "When an enemy unit targets this unit with ranged attacks, until that enemy unit has shot, when this unit makes a save roll: \n- On an unmodified 6, that enemy unit suffers 1 mortal wound after that enemy unit has shot.",
            "sourceUnitId": "unit-kastelan-robots"
          },
          {
            "id": "core-deadly-demise",
            "sectionId": "core-deadly-demise",
            "title": "Deadly Demise 1",
            "text": "",
            "sourceUnitId": "unit-kastelan-robots"
          },
          {
            "id": "doctrina-imperatives",
            "sectionId": "doctrina-imperatives",
            "title": "Doctrina Imperatives",
            "text": "At the start of the battle round, you can select one of the Doctrina Imperatives below. Until the end of the battle round, that Doctrina Imperative is active for your army, and all units from your army that have the Doctrina Imperatives ability gain the relevant abilities shown below.\n\nPROTECTOR IMPERATIVE\n■ Ranged weapons equipped by models in this unit have the [HEAVY] ability.\n■ Improve the Ballistic Skill characteristic of ranged weapons equipped by models in this unit by 1.\n■ Each time a melee attack targets this unit, if this unit has the Battleline keyword and/or it is within 6\" of one or more friendly Adeptus Mechanicus Battleline units, subtract 1 from the Hit roll.\n\nCONQUEROR IMPERATIVE\n■ Ranged weapons equipped by models in this unit have the [ASSAULT] ability.\n■ Improve the Weapon Skill characteristic of melee weapons equipped by models in this unit by 1.\n■ Each time a model in this unit makes an attack, if this unit has the Battleline keyword and/or it is within 6\" of one or more friendly Adeptus Mechanicus Battleline units, improve the Armour Penetration characteristic of that attack by 1.",
            "sourceUnitId": "unit-kastelan-robots"
          }
        ],
        "models": [
          {
            "id": "unit-kastelan-robots-model-e34f8a203b",
            "title": "Kastelan Robot",
            "aliases": [
              "Kastelan Robot",
              "Kastelan Robots"
            ],
            "legacyIds": [
              "unit-kastelan-robots-model-kastelan-robot"
            ]
          }
        ],
        "selections": [
          {
            "id": "unit-kastelan-robots-selection-close-combat-weapon",
            "title": "Close combat weapon",
            "aliases": [
              "Close combat weapon"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-kastelan-robots-profile-ec5fe9cde7"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-kastelan-robots-selection-twin-kastelan-phosphor-blaster",
            "title": "Twin Kastelan phosphor blaster",
            "aliases": [
              "Twin Kastelan phosphor blaster"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-kastelan-robots-profile-dd33851a8b"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-kastelan-robots-selection-twin-kastelan-fist",
            "title": "Twin Kastelan fist",
            "aliases": [
              "Twin Kastelan fist"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-kastelan-robots-profile-883d27ea6d"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-kastelan-robots-selection-kastelan-fist",
            "title": "Kastelan fist",
            "aliases": [
              "Kastelan fist"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-kastelan-robots-profile-4ede1124f0"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-kastelan-robots-selection-kastelan-phosphor-blaster",
            "title": "Kastelan phosphor blaster",
            "aliases": [
              "Kastelan phosphor blaster"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-kastelan-robots-profile-8d6729e652"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-kastelan-robots-selection-incendine-combustor",
            "title": "Incendine combustor",
            "aliases": [
              "Incendine combustor"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-kastelan-robots-profile-ad692f2d00"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-kastelan-robots-selection-heavy-phosphor-blaster",
            "title": "Heavy phosphor blaster",
            "aliases": [
              "Heavy phosphor blaster"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-kastelan-robots-profile-f4fa84c61d"
            ],
            "wargearAbilityIds": []
          }
        ],
        "weaponFamilies": [],
        "weaponProfiles": [
          {
            "id": "unit-kastelan-robots-profile-ec5fe9cde7",
            "legacyIds": [
              "unit-kastelan-robots-profile-close-combat-weapon-melee"
            ],
            "title": "Close combat weapon",
            "mode": "melee",
            "range": "Melee",
            "a": "3",
            "skill": "4+",
            "s": "6",
            "ap": "0",
            "d": "1",
            "abilities": "",
            "sourceSelectionIds": [
              "unit-kastelan-robots-selection-close-combat-weapon"
            ]
          },
          {
            "id": "unit-kastelan-robots-profile-dd33851a8b",
            "legacyIds": [
              "unit-kastelan-robots-profile-twin-kastelan-phosphor-blaster-ranged-2"
            ],
            "title": "Twin Kastelan phosphor blaster",
            "mode": "ranged",
            "range": "24\"",
            "a": "3",
            "skill": "4+",
            "s": "6",
            "ap": "-1",
            "d": "1",
            "abilities": "Ignores Cover, Twin-linked",
            "sourceSelectionIds": [
              "unit-kastelan-robots-selection-twin-kastelan-phosphor-blaster"
            ]
          },
          {
            "id": "unit-kastelan-robots-profile-883d27ea6d",
            "legacyIds": [
              "unit-kastelan-robots-profile-twin-kastelan-fist-melee-3"
            ],
            "title": "Twin Kastelan fist",
            "mode": "melee",
            "range": "Melee",
            "a": "4",
            "skill": "4+",
            "s": "12",
            "ap": "-2",
            "d": "3",
            "abilities": "Twin-linked",
            "sourceSelectionIds": [
              "unit-kastelan-robots-selection-twin-kastelan-fist"
            ]
          },
          {
            "id": "unit-kastelan-robots-profile-4ede1124f0",
            "legacyIds": [
              "unit-kastelan-robots-profile-kastelan-fist-melee-4"
            ],
            "title": "Kastelan fist",
            "mode": "melee",
            "range": "Melee",
            "a": "4",
            "skill": "4+",
            "s": "12",
            "ap": "-2",
            "d": "3",
            "abilities": "",
            "sourceSelectionIds": [
              "unit-kastelan-robots-selection-kastelan-fist"
            ]
          },
          {
            "id": "unit-kastelan-robots-profile-8d6729e652",
            "legacyIds": [
              "unit-kastelan-robots-profile-kastelan-phosphor-blaster-ranged-5"
            ],
            "title": "Kastelan phosphor blaster",
            "mode": "ranged",
            "range": "24\"",
            "a": "3",
            "skill": "4+",
            "s": "6",
            "ap": "-1",
            "d": "1",
            "abilities": "Ignores Cover",
            "sourceSelectionIds": [
              "unit-kastelan-robots-selection-kastelan-phosphor-blaster"
            ]
          },
          {
            "id": "unit-kastelan-robots-profile-ad692f2d00",
            "legacyIds": [
              "unit-kastelan-robots-profile-incendine-combustor-ranged-6"
            ],
            "title": "Incendine combustor",
            "mode": "ranged",
            "range": "12\"",
            "a": "D6",
            "skill": "N/A",
            "s": "6",
            "ap": "-1",
            "d": "1",
            "abilities": "Ignores Cover, Torrent",
            "sourceSelectionIds": [
              "unit-kastelan-robots-selection-incendine-combustor"
            ]
          },
          {
            "id": "unit-kastelan-robots-profile-f4fa84c61d",
            "legacyIds": [
              "unit-kastelan-robots-profile-heavy-phosphor-blaster-ranged-7"
            ],
            "title": "Heavy phosphor blaster",
            "mode": "ranged",
            "range": "36\"",
            "a": "3",
            "skill": "4+",
            "s": "6",
            "ap": "-1",
            "d": "2",
            "abilities": "Ignores Cover",
            "sourceSelectionIds": [
              "unit-kastelan-robots-selection-heavy-phosphor-blaster"
            ]
          }
        ],
        "wargearAbilities": []
      }
    },
    {
      "id": "unit-onager-dunecrawler",
      "title": "Onager Dunecrawler",
      "sourceBookId": "adeptus-mechanicus",
      "sourceLayer": "Codex transcription",
      "intrinsicKeywords": [
        "Onager Dunecrawler",
        "Imperium",
        "Vehicle",
        "Walker",
        "Skitarii",
        "Adeptus Mechanicus",
        "Smoke"
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
          "T": "10",
          "Sv": "2+",
          "W": "11",
          "Ld": "7+",
          "OC": "3",
          "Invulnerable": "4+"
        },
        "abilities": [
          {
            "id": "datasheet-emanatus-forcefield-aura",
            "sectionId": "datasheet-emanatus-forcefield-aura",
            "title": "Emanatus Forcefield (Aura)",
            "text": "While a friendly Adeptus Mechanicus Battleline model is wholly within 6\" of this model, that Battleline model has a 4+ invulnerable save against ranged attacks.",
            "sourceUnitId": "unit-onager-dunecrawler"
          },
          {
            "id": "datasheet-damaged-1-4-wounds-remaining",
            "sectionId": "datasheet-damaged-1-4-wounds-remaining",
            "title": "Damaged: 1-4 wounds remaining",
            "text": "While this model has 1-4 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll.",
            "sourceUnitId": "unit-onager-dunecrawler"
          },
          {
            "id": "datasheet-scuttling-walker",
            "sectionId": "datasheet-scuttling-walker",
            "title": "Scuttling Walker",
            "text": "Each time this model makes a Normal, Advance or Fall Back move, it can move through friendly Monster and Vehicle models and sections of terrain features that are 4\" or less in height.",
            "sourceUnitId": "unit-onager-dunecrawler"
          },
          {
            "id": "core-deadly-demise",
            "sectionId": "core-deadly-demise",
            "title": "Deadly Demise D3",
            "text": "",
            "sourceUnitId": "unit-onager-dunecrawler"
          },
          {
            "id": "doctrina-imperatives",
            "sectionId": "doctrina-imperatives",
            "title": "Doctrina Imperatives",
            "text": "At the start of the battle round, you can select one of the Doctrina Imperatives below. Until the end of the battle round, that Doctrina Imperative is active for your army, and all units from your army that have the Doctrina Imperatives ability gain the relevant abilities shown below.\n\nPROTECTOR IMPERATIVE\n■ Ranged weapons equipped by models in this unit have the [HEAVY] ability.\n■ Improve the Ballistic Skill characteristic of ranged weapons equipped by models in this unit by 1.\n■ Each time a melee attack targets this unit, if this unit has the Battleline keyword and/or it is within 6\" of one or more friendly Adeptus Mechanicus Battleline units, subtract 1 from the Hit roll.\n\nCONQUEROR IMPERATIVE\n■ Ranged weapons equipped by models in this unit have the [ASSAULT] ability.\n■ Improve the Weapon Skill characteristic of melee weapons equipped by models in this unit by 1.\n■ Each time a model in this unit makes an attack, if this unit has the Battleline keyword and/or it is within 6\" of one or more friendly Adeptus Mechanicus Battleline units, improve the Armour Penetration characteristic of that attack by 1.",
            "sourceUnitId": "unit-onager-dunecrawler"
          }
        ],
        "models": [
          {
            "id": "unit-onager-dunecrawler-model-51387d3bda",
            "title": "Onager Dunecrawler",
            "aliases": [
              "Onager Dunecrawler"
            ],
            "legacyIds": [
              "unit-onager-dunecrawler-model-onager-dunecrawler"
            ]
          }
        ],
        "selections": [
          {
            "id": "unit-onager-dunecrawler-selection-cognis-heavy-stubber",
            "title": "Cognis heavy stubber",
            "aliases": [
              "Cognis heavy stubber"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-onager-dunecrawler-profile-c9ef020652"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-onager-dunecrawler-selection-dunecrawler-legs",
            "title": "Dunecrawler legs",
            "aliases": [
              "Dunecrawler legs"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-onager-dunecrawler-profile-acb57be0d9"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-onager-dunecrawler-selection-eradication-beamer-dissipated",
            "title": "➤ Eradication beamer - dissipated",
            "aliases": [
              "➤ Eradication beamer - dissipated"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-onager-dunecrawler-profile-3025b7862a"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-onager-dunecrawler-selection-eradication-beamer-focused",
            "title": "➤ Eradication beamer - focused",
            "aliases": [
              "➤ Eradication beamer - focused"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-onager-dunecrawler-profile-eb26a963bd"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-onager-dunecrawler-selection-daedalus-missile-launcher",
            "title": "Daedalus missile launcher",
            "aliases": [
              "Daedalus missile launcher"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-onager-dunecrawler-profile-63b2f93249"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-onager-dunecrawler-selection-icarus-array",
            "title": "Icarus array",
            "aliases": [
              "Icarus array"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-onager-dunecrawler-profile-19560be51c"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-onager-dunecrawler-selection-neutron-laser",
            "title": "Neutron laser",
            "aliases": [
              "Neutron laser"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-onager-dunecrawler-profile-d1b920b4a0"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-onager-dunecrawler-selection-twin-onager-heavy-phosphor-blaster",
            "title": "Twin Onager heavy phosphor blaster",
            "aliases": [
              "Twin Onager heavy phosphor blaster"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-onager-dunecrawler-profile-77adda6652"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-onager-dunecrawler-weapon-family-eradication-beamer-selection",
            "title": "➤ Eradication beamer",
            "aliases": [
              "➤ Eradication beamer"
            ],
            "kind": "weapon",
            "familyId": "unit-onager-dunecrawler-weapon-family-eradication-beamer",
            "profileIds": [
              "unit-onager-dunecrawler-profile-3025b7862a",
              "unit-onager-dunecrawler-profile-eb26a963bd"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-onager-dunecrawler-selection-broad-spectrum-data-tether",
            "title": "Broad spectrum data-tether",
            "aliases": [
              "Broad spectrum data-tether"
            ],
            "kind": "wargear",
            "profileIds": [],
            "wargearAbilityIds": [
              "unit-onager-dunecrawler-wargear-ability-7c2b04fe30"
            ]
          }
        ],
        "weaponFamilies": [
          {
            "id": "unit-onager-dunecrawler-weapon-family-eradication-beamer",
            "title": "➤ Eradication beamer",
            "aliases": [
              "➤ Eradication beamer"
            ],
            "profileIds": [
              "unit-onager-dunecrawler-profile-3025b7862a",
              "unit-onager-dunecrawler-profile-eb26a963bd"
            ],
            "ambiguousAlias": false
          }
        ],
        "weaponProfiles": [
          {
            "id": "unit-onager-dunecrawler-profile-c9ef020652",
            "legacyIds": [
              "unit-onager-dunecrawler-profile-cognis-heavy-stubber-ranged"
            ],
            "title": "Cognis heavy stubber",
            "mode": "ranged",
            "range": "36\"",
            "a": "3",
            "skill": "4+",
            "s": "4",
            "ap": "0",
            "d": "1",
            "abilities": "Rapid Fire 3, Sustained Hits 1",
            "sourceSelectionIds": [
              "unit-onager-dunecrawler-selection-cognis-heavy-stubber"
            ]
          },
          {
            "id": "unit-onager-dunecrawler-profile-acb57be0d9",
            "legacyIds": [
              "unit-onager-dunecrawler-profile-dunecrawler-legs-melee-2"
            ],
            "title": "Dunecrawler legs",
            "mode": "melee",
            "range": "Melee",
            "a": "3",
            "skill": "4+",
            "s": "6",
            "ap": "0",
            "d": "1",
            "abilities": "",
            "sourceSelectionIds": [
              "unit-onager-dunecrawler-selection-dunecrawler-legs"
            ]
          },
          {
            "id": "unit-onager-dunecrawler-profile-3025b7862a",
            "legacyIds": [
              "unit-onager-dunecrawler-profile-eradication-beamer-dissipated-ranged-3"
            ],
            "title": "➤ Eradication beamer - dissipated",
            "mode": "ranged",
            "range": "36\"",
            "a": "3D3",
            "skill": "4+",
            "s": "9",
            "ap": "-2",
            "d": "2",
            "abilities": "Blast, Sustained Hits 1",
            "sourceSelectionIds": [
              "unit-onager-dunecrawler-selection-eradication-beamer-dissipated",
              "unit-onager-dunecrawler-weapon-family-eradication-beamer-selection"
            ]
          },
          {
            "id": "unit-onager-dunecrawler-profile-eb26a963bd",
            "legacyIds": [
              "unit-onager-dunecrawler-profile-eradication-beamer-focused-ranged-4"
            ],
            "title": "➤ Eradication beamer - focused",
            "mode": "ranged",
            "range": "18\"",
            "a": "3D3",
            "skill": "4+",
            "s": "10",
            "ap": "-3",
            "d": "3",
            "abilities": "Blast, Sustained Hits 1",
            "sourceSelectionIds": [
              "unit-onager-dunecrawler-selection-eradication-beamer-focused",
              "unit-onager-dunecrawler-weapon-family-eradication-beamer-selection"
            ]
          },
          {
            "id": "unit-onager-dunecrawler-profile-63b2f93249",
            "legacyIds": [
              "unit-onager-dunecrawler-profile-daedalus-missile-launcher-ranged-5"
            ],
            "title": "Daedalus missile launcher",
            "mode": "ranged",
            "range": "48\"",
            "a": "2",
            "skill": "4+",
            "s": "10",
            "ap": "-2",
            "d": "D6+1",
            "abilities": "Anti-Fly 2+",
            "sourceSelectionIds": [
              "unit-onager-dunecrawler-selection-daedalus-missile-launcher"
            ]
          },
          {
            "id": "unit-onager-dunecrawler-profile-19560be51c",
            "legacyIds": [
              "unit-onager-dunecrawler-profile-icarus-array-ranged-6"
            ],
            "title": "Icarus array",
            "mode": "ranged",
            "range": "48\"",
            "a": "6",
            "skill": "4+",
            "s": "8",
            "ap": "-1",
            "d": "2",
            "abilities": "Anti-Fly 4+, Twin-linked",
            "sourceSelectionIds": [
              "unit-onager-dunecrawler-selection-icarus-array"
            ]
          },
          {
            "id": "unit-onager-dunecrawler-profile-d1b920b4a0",
            "legacyIds": [
              "unit-onager-dunecrawler-profile-neutron-laser-ranged-7"
            ],
            "title": "Neutron laser",
            "mode": "ranged",
            "range": "48\"",
            "a": "3",
            "skill": "4+",
            "s": "16",
            "ap": "-4",
            "d": "D6+2",
            "abilities": "Heavy",
            "sourceSelectionIds": [
              "unit-onager-dunecrawler-selection-neutron-laser"
            ]
          },
          {
            "id": "unit-onager-dunecrawler-profile-77adda6652",
            "legacyIds": [
              "unit-onager-dunecrawler-profile-twin-onager-heavy-phosphor-blaster-ranged-8"
            ],
            "title": "Twin Onager heavy phosphor blaster",
            "mode": "ranged",
            "range": "36\"",
            "a": "12",
            "skill": "4+",
            "s": "6",
            "ap": "-1",
            "d": "2",
            "abilities": "Ignores Cover, Twin-linked",
            "sourceSelectionIds": [
              "unit-onager-dunecrawler-selection-twin-onager-heavy-phosphor-blaster"
            ]
          }
        ],
        "wargearAbilities": [
          {
            "id": "unit-onager-dunecrawler-wargear-ability-7c2b04fe30",
            "sectionId": "unit-onager-dunecrawler-wargear-ability-7c2b04fe30",
            "title": "Broad spectrum data-tether",
            "text": "The bearer loses the SMOKE keyword, but each time you target the bearer with a Stratagem, roll one D6: on a 5+, you gain 1CP.",
            "sourceUnitId": "unit-onager-dunecrawler",
            "legacyIds": [
              "unit-onager-dunecrawler-wargear-ability-broad-spectrum-data-tether"
            ],
            "requiredSelectionIds": [
              "unit-onager-dunecrawler-selection-broad-spectrum-data-tether"
            ]
          }
        ]
      }
    },
    {
      "id": "unit-skorpius-disintegrator",
      "title": "Skorpius Disintegrator",
      "sourceBookId": "adeptus-mechanicus",
      "sourceLayer": "Codex transcription",
      "intrinsicKeywords": [
        "Skorpius Disintegrator",
        "Imperium",
        "Adeptus Mechanicus",
        "Skitarii",
        "Vehicle",
        "Smoke",
        "Frame"
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
          "W": "12",
          "Ld": "7+",
          "OC": "3"
        },
        "abilities": [
          {
            "id": "datasheet-broad-spectrum-data-tether",
            "sectionId": "datasheet-broad-spectrum-data-tether",
            "title": "Broad spectrum data-tether",
            "text": "Each time you target this unit with a Stratagem, roll one D6: on a 5+, you gain 1CP.",
            "sourceUnitId": "unit-skorpius-disintegrator"
          },
          {
            "id": "datasheet-blistering-salvoes",
            "sectionId": "datasheet-blistering-salvoes",
            "title": "Blistering Salvoes",
            "text": "Each time this model makes an attack with a belleros energy cannon that targets an Infantry unit, add 1 to the Hit roll. Each time this model makes an attack with a ferrumite cannon that targets a Monster or Vehicle unit, add 1 to the Hit roll.",
            "sourceUnitId": "unit-skorpius-disintegrator"
          },
          {
            "id": "datasheet-damaged-1-4-wounds-remaining",
            "sectionId": "datasheet-damaged-1-4-wounds-remaining",
            "title": "Damaged: 1-4 wounds remaining",
            "text": "While this model has 1-4 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll.",
            "sourceUnitId": "unit-skorpius-disintegrator"
          },
          {
            "id": "core-deadly-demise",
            "sectionId": "core-deadly-demise",
            "title": "Deadly Demise D3",
            "text": "",
            "sourceUnitId": "unit-skorpius-disintegrator"
          },
          {
            "id": "doctrina-imperatives",
            "sectionId": "doctrina-imperatives",
            "title": "Doctrina Imperatives",
            "text": "At the start of the battle round, you can select one of the Doctrina Imperatives below. Until the end of the battle round, that Doctrina Imperative is active for your army, and all units from your army that have the Doctrina Imperatives ability gain the relevant abilities shown below.\n\nPROTECTOR IMPERATIVE\n■ Ranged weapons equipped by models in this unit have the [HEAVY] ability.\n■ Improve the Ballistic Skill characteristic of ranged weapons equipped by models in this unit by 1.\n■ Each time a melee attack targets this unit, if this unit has the Battleline keyword and/or it is within 6\" of one or more friendly Adeptus Mechanicus Battleline units, subtract 1 from the Hit roll.\n\nCONQUEROR IMPERATIVE\n■ Ranged weapons equipped by models in this unit have the [ASSAULT] ability.\n■ Improve the Weapon Skill characteristic of melee weapons equipped by models in this unit by 1.\n■ Each time a model in this unit makes an attack, if this unit has the Battleline keyword and/or it is within 6\" of one or more friendly Adeptus Mechanicus Battleline units, improve the Armour Penetration characteristic of that attack by 1.",
            "sourceUnitId": "unit-skorpius-disintegrator"
          }
        ],
        "models": [
          {
            "id": "unit-skorpius-disintegrator-model-13ac76b395",
            "title": "Skorpius Disintegrator",
            "aliases": [
              "Skorpius Disintegrator"
            ],
            "legacyIds": [
              "unit-skorpius-disintegrator-model-skorpius-disintegrator"
            ]
          }
        ],
        "selections": [
          {
            "id": "unit-skorpius-disintegrator-selection-cognis-heavy-stubber",
            "title": "Cognis heavy stubber",
            "aliases": [
              "Cognis heavy stubber"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-skorpius-disintegrator-profile-c9ef020652"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-skorpius-disintegrator-selection-disruptor-missile-launcher",
            "title": "Disruptor missile launcher",
            "aliases": [
              "Disruptor missile launcher"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-skorpius-disintegrator-profile-9b9325ffa7"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-skorpius-disintegrator-selection-belleros-energy-cannon",
            "title": "Belleros energy cannon",
            "aliases": [
              "Belleros energy cannon"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-skorpius-disintegrator-profile-635b4eede1"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-skorpius-disintegrator-selection-ferrumite-cannon",
            "title": "Ferrumite cannon",
            "aliases": [
              "Ferrumite cannon"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-skorpius-disintegrator-profile-dbbcb28f09"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-skorpius-disintegrator-selection-armoured-hull",
            "title": "Armoured hull",
            "aliases": [
              "Armoured hull"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-skorpius-disintegrator-profile-7809a5e4d6"
            ],
            "wargearAbilityIds": []
          }
        ],
        "weaponFamilies": [],
        "weaponProfiles": [
          {
            "id": "unit-skorpius-disintegrator-profile-c9ef020652",
            "legacyIds": [
              "unit-skorpius-disintegrator-profile-cognis-heavy-stubber-ranged"
            ],
            "title": "Cognis heavy stubber",
            "mode": "ranged",
            "range": "36\"",
            "a": "3",
            "skill": "4+",
            "s": "4",
            "ap": "0",
            "d": "1",
            "abilities": "Rapid Fire 3, Sustained Hits 1",
            "sourceSelectionIds": [
              "unit-skorpius-disintegrator-selection-cognis-heavy-stubber"
            ]
          },
          {
            "id": "unit-skorpius-disintegrator-profile-9b9325ffa7",
            "legacyIds": [
              "unit-skorpius-disintegrator-profile-disruptor-missile-launcher-ranged-2"
            ],
            "title": "Disruptor missile launcher",
            "mode": "ranged",
            "range": "36\"",
            "a": "3",
            "skill": "4+",
            "s": "9",
            "ap": "-2",
            "d": "D6",
            "abilities": "Twin-linked",
            "sourceSelectionIds": [
              "unit-skorpius-disintegrator-selection-disruptor-missile-launcher"
            ]
          },
          {
            "id": "unit-skorpius-disintegrator-profile-635b4eede1",
            "legacyIds": [
              "unit-skorpius-disintegrator-profile-belleros-energy-cannon-ranged-3"
            ],
            "title": "Belleros energy cannon",
            "mode": "ranged",
            "range": "36\"",
            "a": "2D6",
            "skill": "4+",
            "s": "7",
            "ap": "-2",
            "d": "1",
            "abilities": "Blast, Indirect Fire",
            "sourceSelectionIds": [
              "unit-skorpius-disintegrator-selection-belleros-energy-cannon"
            ]
          },
          {
            "id": "unit-skorpius-disintegrator-profile-dbbcb28f09",
            "legacyIds": [
              "unit-skorpius-disintegrator-profile-ferrumite-cannon-ranged-4"
            ],
            "title": "Ferrumite cannon",
            "mode": "ranged",
            "range": "48\"",
            "a": "3",
            "skill": "4+",
            "s": "12",
            "ap": "-3",
            "d": "D6+1",
            "abilities": "",
            "sourceSelectionIds": [
              "unit-skorpius-disintegrator-selection-ferrumite-cannon"
            ]
          },
          {
            "id": "unit-skorpius-disintegrator-profile-7809a5e4d6",
            "legacyIds": [
              "unit-skorpius-disintegrator-profile-armoured-hull-melee-5"
            ],
            "title": "Armoured hull",
            "mode": "melee",
            "range": "Melee",
            "a": "3",
            "skill": "4+",
            "s": "6",
            "ap": "0",
            "d": "1",
            "abilities": "",
            "sourceSelectionIds": [
              "unit-skorpius-disintegrator-selection-armoured-hull"
            ]
          }
        ],
        "wargearAbilities": []
      }
    },
    {
      "id": "unit-sydonian-dragoons-with-radium-jezzails",
      "title": "Sydonian Dragoons with radium jezzails",
      "sourceBookId": "adeptus-mechanicus",
      "sourceLayer": "Codex transcription",
      "intrinsicKeywords": [
        "Imperium",
        "Adeptus Mechanicus",
        "Skitarii",
        "Vehicle",
        "Walker",
        "Sydonian",
        "Dragoons with Radium Jezzails",
        "Smoke"
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
          "T": "7",
          "Sv": "3+",
          "W": "7",
          "Ld": "7+",
          "OC": "2",
          "Invulnerable": "5+"
        },
        "abilities": [
          {
            "id": "datasheet-focused-hunters",
            "sectionId": "datasheet-focused-hunters",
            "title": "Focused Hunters",
            "text": "At the start of the battle, select one unit from your opponent’s army. Until the end of the battle, each time a model in this unit makes an attack that targets that unit, you can re-roll the Hit roll.",
            "sourceUnitId": "unit-sydonian-dragoons-with-radium-jezzails"
          },
          {
            "id": "datasheet-broad-spectrum-data-tether",
            "sectionId": "datasheet-broad-spectrum-data-tether",
            "title": "Broad Spectrum Data-tether",
            "text": "Each time you target this unit with a Stratagem, roll one D6: on a 5+, you gain 1CP.",
            "sourceUnitId": "unit-sydonian-dragoons-with-radium-jezzails"
          },
          {
            "id": "core-deadly-demise",
            "sectionId": "core-deadly-demise",
            "title": "Deadly Demise 1",
            "text": "",
            "sourceUnitId": "unit-sydonian-dragoons-with-radium-jezzails"
          },
          {
            "id": "core-stealth",
            "sectionId": "core-stealth",
            "title": "Stealth",
            "text": "",
            "sourceUnitId": "unit-sydonian-dragoons-with-radium-jezzails"
          },
          {
            "id": "doctrina-imperatives",
            "sectionId": "doctrina-imperatives",
            "title": "Doctrina Imperatives",
            "text": "At the start of the battle round, you can select one of the Doctrina Imperatives below. Until the end of the battle round, that Doctrina Imperative is active for your army, and all units from your army that have the Doctrina Imperatives ability gain the relevant abilities shown below.\n\nPROTECTOR IMPERATIVE\n■ Ranged weapons equipped by models in this unit have the [HEAVY] ability.\n■ Improve the Ballistic Skill characteristic of ranged weapons equipped by models in this unit by 1.\n■ Each time a melee attack targets this unit, if this unit has the Battleline keyword and/or it is within 6\" of one or more friendly Adeptus Mechanicus Battleline units, subtract 1 from the Hit roll.\n\nCONQUEROR IMPERATIVE\n■ Ranged weapons equipped by models in this unit have the [ASSAULT] ability.\n■ Improve the Weapon Skill characteristic of melee weapons equipped by models in this unit by 1.\n■ Each time a model in this unit makes an attack, if this unit has the Battleline keyword and/or it is within 6\" of one or more friendly Adeptus Mechanicus Battleline units, improve the Armour Penetration characteristic of that attack by 1.",
            "sourceUnitId": "unit-sydonian-dragoons-with-radium-jezzails"
          }
        ],
        "models": [
          {
            "id": "unit-sydonian-dragoons-with-radium-jezzails-model-763f36de8e",
            "title": "Sydonian Dragoon",
            "aliases": [
              "Sydonian Dragoon",
              "Sydonian Dragoons"
            ],
            "legacyIds": [
              "unit-sydonian-dragoons-with-radium-jezzails-model-sydonian-dragoon"
            ]
          }
        ],
        "selections": [
          {
            "id": "unit-sydonian-dragoons-with-radium-jezzails-selection-phosphor-serpenta",
            "title": "Phosphor serpenta",
            "aliases": [
              "Phosphor serpenta"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-sydonian-dragoons-with-radium-jezzails-profile-0d605a2efb"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-sydonian-dragoons-with-radium-jezzails-selection-radium-jezzail",
            "title": "Radium jezzail",
            "aliases": [
              "Radium jezzail"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-sydonian-dragoons-with-radium-jezzails-profile-5d3df3263f"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-sydonian-dragoons-with-radium-jezzails-selection-ironstrider-feet",
            "title": "Ironstrider feet",
            "aliases": [
              "Ironstrider feet"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-sydonian-dragoons-with-radium-jezzails-profile-2661cdde1f"
            ],
            "wargearAbilityIds": []
          }
        ],
        "weaponFamilies": [],
        "weaponProfiles": [
          {
            "id": "unit-sydonian-dragoons-with-radium-jezzails-profile-0d605a2efb",
            "legacyIds": [
              "unit-sydonian-dragoons-with-radium-jezzails-profile-phosphor-serpenta-ranged"
            ],
            "title": "Phosphor serpenta",
            "mode": "ranged",
            "range": "18\"",
            "a": "1",
            "skill": "4+",
            "s": "5",
            "ap": "-1",
            "d": "2",
            "abilities": "Ignores Cover, Pistol",
            "sourceSelectionIds": [
              "unit-sydonian-dragoons-with-radium-jezzails-selection-phosphor-serpenta"
            ]
          },
          {
            "id": "unit-sydonian-dragoons-with-radium-jezzails-profile-5d3df3263f",
            "legacyIds": [
              "unit-sydonian-dragoons-with-radium-jezzails-profile-radium-jezzail-ranged-2"
            ],
            "title": "Radium jezzail",
            "mode": "ranged",
            "range": "36\"",
            "a": "1",
            "skill": "4+",
            "s": "5",
            "ap": "-2",
            "d": "3",
            "abilities": "Anti-Infantry 3+, Heavy, Precision",
            "sourceSelectionIds": [
              "unit-sydonian-dragoons-with-radium-jezzails-selection-radium-jezzail"
            ]
          },
          {
            "id": "unit-sydonian-dragoons-with-radium-jezzails-profile-2661cdde1f",
            "legacyIds": [
              "unit-sydonian-dragoons-with-radium-jezzails-profile-ironstrider-feet-melee-3"
            ],
            "title": "Ironstrider feet",
            "mode": "melee",
            "range": "Melee",
            "a": "3",
            "skill": "4+",
            "s": "5",
            "ap": "0",
            "d": "1",
            "abilities": "",
            "sourceSelectionIds": [
              "unit-sydonian-dragoons-with-radium-jezzails-selection-ironstrider-feet"
            ]
          }
        ],
        "wargearAbilities": []
      }
    },
    {
      "id": "unit-sydonian-dragoons-with-taser-lances",
      "title": "Sydonian Dragoons with taser lances",
      "sourceBookId": "adeptus-mechanicus",
      "sourceLayer": "Codex transcription",
      "intrinsicKeywords": [
        "Imperium",
        "Adeptus Mechanicus",
        "Skitarii",
        "Vehicle",
        "Walker",
        "Sydonian",
        "Dragoons with Taser Lances",
        "Smoke"
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
          "T": "7",
          "Sv": "3+",
          "W": "7",
          "Ld": "7+",
          "OC": "2",
          "Invulnerable": "5+"
        },
        "abilities": [
          {
            "id": "datasheet-dynamic-efficiency",
            "sectionId": "datasheet-dynamic-efficiency",
            "title": "Dynamic Efficiency",
            "text": "This unit is eligible to declare a charge in a turn in which it Advanced or Fell Back, and you can re-roll Desperate Escape tests taken for models in this unit.",
            "sourceUnitId": "unit-sydonian-dragoons-with-taser-lances"
          },
          {
            "id": "datasheet-broad-spectrum-data-tether",
            "sectionId": "datasheet-broad-spectrum-data-tether",
            "title": "Broad Spectrum Data-tether",
            "text": "Each time you target this unit with a Stratagem, roll one D6: on a 5+, you gain 1CP.",
            "sourceUnitId": "unit-sydonian-dragoons-with-taser-lances"
          },
          {
            "id": "core-deadly-demise",
            "sectionId": "core-deadly-demise",
            "title": "Deadly Demise 1",
            "text": "",
            "sourceUnitId": "unit-sydonian-dragoons-with-taser-lances"
          },
          {
            "id": "core-stealth",
            "sectionId": "core-stealth",
            "title": "Stealth",
            "text": "",
            "sourceUnitId": "unit-sydonian-dragoons-with-taser-lances"
          },
          {
            "id": "doctrina-imperatives",
            "sectionId": "doctrina-imperatives",
            "title": "Doctrina Imperatives",
            "text": "At the start of the battle round, you can select one of the Doctrina Imperatives below. Until the end of the battle round, that Doctrina Imperative is active for your army, and all units from your army that have the Doctrina Imperatives ability gain the relevant abilities shown below.\n\nPROTECTOR IMPERATIVE\n■ Ranged weapons equipped by models in this unit have the [HEAVY] ability.\n■ Improve the Ballistic Skill characteristic of ranged weapons equipped by models in this unit by 1.\n■ Each time a melee attack targets this unit, if this unit has the Battleline keyword and/or it is within 6\" of one or more friendly Adeptus Mechanicus Battleline units, subtract 1 from the Hit roll.\n\nCONQUEROR IMPERATIVE\n■ Ranged weapons equipped by models in this unit have the [ASSAULT] ability.\n■ Improve the Weapon Skill characteristic of melee weapons equipped by models in this unit by 1.\n■ Each time a model in this unit makes an attack, if this unit has the Battleline keyword and/or it is within 6\" of one or more friendly Adeptus Mechanicus Battleline units, improve the Armour Penetration characteristic of that attack by 1.",
            "sourceUnitId": "unit-sydonian-dragoons-with-taser-lances"
          }
        ],
        "models": [
          {
            "id": "unit-sydonian-dragoons-with-taser-lances-model-763f36de8e",
            "title": "Sydonian Dragoon",
            "aliases": [
              "Sydonian Dragoon",
              "Sydonian Dragoons"
            ],
            "legacyIds": [
              "unit-sydonian-dragoons-with-taser-lances-model-sydonian-dragoon"
            ]
          }
        ],
        "selections": [
          {
            "id": "unit-sydonian-dragoons-with-taser-lances-selection-phosphor-serpenta",
            "title": "Phosphor serpenta",
            "aliases": [
              "Phosphor serpenta"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-sydonian-dragoons-with-taser-lances-profile-0d605a2efb"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-sydonian-dragoons-with-taser-lances-selection-taser-lance",
            "title": "Taser lance",
            "aliases": [
              "Taser lance"
            ],
            "kind": "weapon",
            "profileIds": [
              "unit-sydonian-dragoons-with-taser-lances-profile-49737331a5"
            ],
            "wargearAbilityIds": []
          }
        ],
        "weaponFamilies": [],
        "weaponProfiles": [
          {
            "id": "unit-sydonian-dragoons-with-taser-lances-profile-0d605a2efb",
            "legacyIds": [
              "unit-sydonian-dragoons-with-taser-lances-profile-phosphor-serpenta-ranged"
            ],
            "title": "Phosphor serpenta",
            "mode": "ranged",
            "range": "18\"",
            "a": "1",
            "skill": "4+",
            "s": "5",
            "ap": "-1",
            "d": "2",
            "abilities": "Ignores Cover, Pistol",
            "sourceSelectionIds": [
              "unit-sydonian-dragoons-with-taser-lances-selection-phosphor-serpenta"
            ]
          },
          {
            "id": "unit-sydonian-dragoons-with-taser-lances-profile-49737331a5",
            "legacyIds": [
              "unit-sydonian-dragoons-with-taser-lances-profile-taser-lance-melee-2"
            ],
            "title": "Taser lance",
            "mode": "melee",
            "range": "Melee",
            "a": "4",
            "skill": "4+",
            "s": "7",
            "ap": "-2",
            "d": "2",
            "abilities": "Anti-Walker 2+, Lance, Sustained Hits 2",
            "sourceSelectionIds": [
              "unit-sydonian-dragoons-with-taser-lances-selection-taser-lance"
            ]
          }
        ],
        "wargearAbilities": []
      }
    }
  ],
  "detachments": [
    {
      "id": "detachment-cohort-acquisitus",
      "title": "Cohort Acquisitus",
      "sourceBookId": "adeptus-mechanicus",
      "chapterRestriction": null,
      "keywordGrants": [],
      "detachmentRuleIds": [
        "cohort-acquisitus-rule"
      ]
    },
    {
      "id": "detachment-lords-of-the-forge",
      "title": "Lords of the Forge",
      "sourceBookId": "adeptus-mechanicus",
      "chapterRestriction": null,
      "keywordGrants": [],
      "detachmentRuleIds": [
        "lords-of-the-forge-rule"
      ]
    },
    {
      "id": "detachment-luminen-auto-choir",
      "title": "Luminen Auto-choir",
      "sourceBookId": "adeptus-mechanicus",
      "chapterRestriction": null,
      "keywordGrants": [],
      "detachmentRuleIds": [
        "luminen-auto-choir-rule"
      ]
    },
    {
      "id": "detachment-cohort-cybernetica",
      "title": "Cohort Cybernetica",
      "sourceBookId": "adeptus-mechanicus",
      "chapterRestriction": null,
      "keywordGrants": [],
      "detachmentRuleIds": [
        "cohort-cybernetica-rule"
      ]
    },
    {
      "id": "detachment-data-psalm-conclave",
      "title": "Data-psalm Conclave",
      "sourceBookId": "adeptus-mechanicus",
      "chapterRestriction": null,
      "keywordGrants": [],
      "detachmentRuleIds": [
        "data-psalm-conclave-rule"
      ]
    },
    {
      "id": "detachment-eradication-cohort",
      "title": "Eradication Cohort",
      "sourceBookId": "adeptus-mechanicus",
      "chapterRestriction": null,
      "keywordGrants": [],
      "detachmentRuleIds": [
        "eradication-cohort-rule"
      ]
    },
    {
      "id": "detachment-explorator-maniple",
      "title": "Explorator Maniple",
      "sourceBookId": "adeptus-mechanicus",
      "chapterRestriction": null,
      "keywordGrants": [],
      "detachmentRuleIds": [
        "explorator-maniple-rule"
      ]
    },
    {
      "id": "detachment-haloscreed-battle-clade",
      "title": "Haloscreed Battle Clade",
      "sourceBookId": "adeptus-mechanicus",
      "chapterRestriction": null,
      "keywordGrants": [],
      "detachmentRuleIds": [
        "haloscreed-battle-clade-rule"
      ]
    },
    {
      "id": "detachment-rad-zone-corps",
      "title": "Rad-zone Corps",
      "sourceBookId": "adeptus-mechanicus",
      "chapterRestriction": null,
      "keywordGrants": [],
      "detachmentRuleIds": [
        "rad-zone-corps-rule"
      ]
    },
    {
      "id": "detachment-skitarii-hunter-cohort",
      "title": "Skitarii Hunter Cohort",
      "sourceBookId": "adeptus-mechanicus",
      "chapterRestriction": null,
      "keywordGrants": [],
      "detachmentRuleIds": [
        "skitarii-hunter-cohort-rule"
      ]
    }
  ],
  "detachmentRules": [
    {
      "id": "cohort-acquisitus-rule",
      "title": "Noospheric Recon",
      "text": "- Friendly PTERAXII/INFILTRATORS/RANGERS/SERBERYS RAIDERS/ SERBERYS SULPHURHOUNDS units have RECON AUGURY.\n- Friendly RECON AUGURY units have the following ability:\nEnhanced Augurs: In your Shooting phase, this unit can select one visible enemy unit within 12\". That enemy unit is analysed:\n- While a unit is analysed, that unit has +3\" detection range.",
      "sectionId": "cohort-acquisitus-rule",
      "detachmentId": "detachment-cohort-acquisitus",
      "detachmentTitle": "Cohort Acquisitus",
      "sourceBookId": "adeptus-mechanicus"
    },
    {
      "id": "lords-of-the-forge-rule",
      "title": "War-form Mantles",
      "text": "Friendly TECH-PRIEST models have:\n- 4+ InSv.\n- Feel No Pain 5+.\nFriendly TECH-PRIEST models have the following ability:\nBaffling Data Screed: In your Shooting phase, when this unit is selected to shoot, if this unit is not battle-shocked, you can use this ability. If you do, roll one D6:\n- On a 2+, select one enemy VEHICLE unit within 12\" of this unit. That enemy unit makes a battle-shock roll, with -1 to that battle-shock roll. A unit cannot be selected for this ability more than once per turn.\n- Or: On 2+, those ranged attacks do not prevent this unit from being hidden.",
      "sectionId": "lords-of-the-forge-rule",
      "detachmentId": "detachment-lords-of-the-forge",
      "detachmentTitle": "Lords of the Forge",
      "sourceBookId": "adeptus-mechanicus"
    },
    {
      "id": "luminen-auto-choir-rule",
      "title": "Cyber-static Canticles",
      "text": "- Friendly CORPUSCARII units’ ranged attacks have [LETHAL HITS].\n- When a friendly FULGURITE unit has fought, that unit heals D3 wounds.\nThis detachment has the DATA-PSALM tag and cannot be taken with another DATA-PSALM detachment.",
      "sectionId": "luminen-auto-choir-rule",
      "detachmentId": "detachment-luminen-auto-choir",
      "detachmentTitle": "Luminen Auto-choir",
      "sourceBookId": "adeptus-mechanicus"
    },
    {
      "id": "cohort-cybernetica-rule",
      "title": "Cyber-psalm Programming",
      "text": "Add 2\" to the Move characteristic of models in LEGIO CYBERNETICA units from your army. In addition, unless that unit is Battle-shocked, add 1 to the Objective Control characteristic of models in that unit.",
      "sectionId": "cohort-cybernetica-rule",
      "detachmentId": "detachment-cohort-cybernetica",
      "detachmentTitle": "Cohort Cybernetica",
      "sourceBookId": "adeptus-mechanicus"
    },
    {
      "id": "data-psalm-conclave-rule",
      "title": "Benedictions of the Omnissiah",
      "text": "At the start of the first battle round, select one of the following Benedictions of the Omnissiah to be active for CULT MECHANICUS units from your army until the end of the battle:Panegyric ProcessionEach time a CULT MECHANICUS model from your army makes a ranged attack that targets a unit within half range, improve the Armour Penetration characteristic of that attack by 1.Citation in SavageryEach time a CULT MECHANICUS unit from your army is selected to fight, if that unit made a Charge move this turn, until the end of the phase, add 1 to the Strength and Attacks characteristics of melee weapons equipped by models in that unit.",
      "sectionId": "data-psalm-conclave-rule",
      "detachmentId": "detachment-data-psalm-conclave",
      "detachmentTitle": "Data-psalm Conclave",
      "sourceBookId": "adeptus-mechanicus"
    },
    {
      "id": "eradication-cohort-rule",
      "title": "Murderous Imperative",
      "text": "Each time a model in a SKITARII unit from your army makes an attack:\n- If the Protector Imperative is active for that unit, re-roll a Hit roll of 1.\n- If the Conqueror Imperative is active for that unit, re-roll a Wound roll of 1.",
      "sectionId": "eradication-cohort-rule",
      "detachmentId": "detachment-eradication-cohort",
      "detachmentTitle": "Eradication Cohort",
      "sourceBookId": "adeptus-mechanicus"
    },
    {
      "id": "explorator-maniple-rule",
      "title": "Acquisition At Any Cost",
      "text": "At the start of your Command phase, select one objective marker. Until the start of your next Command phase, that objective marker is your Acquisition objective marker. Each time an ADEPTUS MECHANICUS model from your army makes an attack, if that model’s unit is within range of your Acquisition objective marker, or if the target of that attack is within range of your Acquisition objective marker, re-roll a Wound roll of 1.",
      "sectionId": "explorator-maniple-rule",
      "detachmentId": "detachment-explorator-maniple",
      "detachmentTitle": "Explorator Maniple",
      "sourceBookId": "adeptus-mechanicus"
    },
    {
      "id": "haloscreed-battle-clade-rule",
      "title": "Noospheric Transference",
      "text": "In your Command phase, select one or more ADEPTUS MECHANICUS units from your army (including units that are embarked within TRANSPORTS). The maximum number of units you can select depends on the battle size, as follows:\nINCURSION:1 UNITSTRIKE FORCE2 UNITSONSLAUGHT3 UNITS\nUntil the start of your next Command phase, those units gain the HALO OVERRIDE keyword. Then, select one of the Override abilities below. Until the start of your next Command phase, units from your army with the HALO OVERRIDE keyword have the selected Override ability:\nElectromotive Energisation\nAdd 2\" to the Move characteristic of models in this unit.\nMicroactuator Bracing\nAdd 1 to the Toughness characteristic of models in this unit.\nPredation Protocols\nThis unit is eligible to declare a charge in a turn in which it Advanced.\nMuted Servomotors\nModels in this unit have the Stealth ability.",
      "sectionId": "haloscreed-battle-clade-rule",
      "detachmentId": "detachment-haloscreed-battle-clade",
      "detachmentTitle": "Haloscreed Battle Clade",
      "sourceBookId": "adeptus-mechanicus"
    },
    {
      "id": "rad-zone-corps-rule",
      "title": "Rad-bombardment",
      "text": "BATTLE ROUND1BOMBARDMENTAt the start of the first battle round, for each enemy unit within your opponent’s deployment zone, your opponent must decide whether that unit will take cover or stand firm. You then roll one D6 for each of those enemy units and apply the relevant result below:Unit Standing Firm: On a 3+, that unit suffers D3 mortal wounds.Unit Taking Cover: That unit is battle-shocked. On a 5+, that unit suffers D3 mortal woundsBATTLE ROUND2    ONWARDSFALLOUTAt the start of your Command phase during the second, third, fourth and fifth battle rounds, roll one D6 for each enemy unit within your opponent’s deployment zone. On a 3+, that unit suffers 1 mortal wound and must take a Battle-shock test.",
      "sectionId": "rad-zone-corps-rule",
      "detachmentId": "detachment-rad-zone-corps",
      "detachmentTitle": "Rad-zone Corps",
      "sourceBookId": "adeptus-mechanicus"
    },
    {
      "id": "skitarii-hunter-cohort-rule",
      "title": "Stealth Optimisation",
      "text": "Friendly SKITARII INFANTRY, SKITARII MOUNTED and IRONSTRIDER BALLISTARII units have Stealth.",
      "sectionId": "skitarii-hunter-cohort-rule",
      "detachmentId": "detachment-skitarii-hunter-cohort",
      "detachmentTitle": "Skitarii Hunter Cohort",
      "sourceBookId": "adeptus-mechanicus"
    }
  ],
  "enhancements": [
    {
      "title": "Explorator Dispensation",
      "text": "SKITARII MARSHAL model only. This unit has Infiltrators",
      "id": "enhancement-explorator-dispensation",
      "eligibility": {
        "v": 1,
        "tags": [],
        "owner": {
          "subject": "model",
          "selector": {
            "unitIds": [
              "unit-skitarii-marshal"
            ],
            "allKeywords": [],
            "anyKeywords": [],
            "noneKeywords": [],
            "alternatives": []
          }
        },
        "assignment": {
          "maxOwners": 1,
          "enhancementChoices": 1,
          "payPointsPerOwner": true
        }
      },
      "tags": [],
      "assignment": {
        "maxOwners": 1,
        "enhancementChoices": 1,
        "payPointsPerOwner": true
      },
      "detachmentId": "detachment-cohort-acquisitus",
      "sourceBookId": "adeptus-mechanicus",
      "legacyKey": "enhancement-explorator-dispensation",
      "canonicalEnhancementId": "enhancement-explorator-dispensation",
      "canonicalDetachmentId": "detachment-cohort-acquisitus"
    },
    {
      "title": "Stealth-screened Cybercanids Upgrade",
      "text": "SERBERYS RAIDERS unit only. This unit has Lone Operative 15\".",
      "id": "enhancement-stealth-screened-cybercanids-upgrade",
      "eligibility": {
        "v": 1,
        "tags": [
          "UPGRADE"
        ],
        "owner": {
          "subject": "unit",
          "selector": {
            "unitIds": [
              "unit-serberys-raiders"
            ],
            "allKeywords": [],
            "anyKeywords": [],
            "noneKeywords": [],
            "alternatives": []
          }
        },
        "assignment": {
          "maxOwners": 3,
          "enhancementChoices": 1,
          "payPointsPerOwner": true
        }
      },
      "tags": [
        "UPGRADE"
      ],
      "assignment": {
        "maxOwners": 3,
        "enhancementChoices": 1,
        "payPointsPerOwner": true
      },
      "detachmentId": "detachment-cohort-acquisitus",
      "sourceBookId": "adeptus-mechanicus",
      "legacyKey": "enhancement-stealth-screened-cybercanids-upgrade",
      "canonicalEnhancementId": "enhancement-stealth-screened-cybercanids-upgrade",
      "canonicalDetachmentId": "detachment-cohort-acquisitus"
    },
    {
      "title": "Vingh's Wafers of Dynamism",
      "text": "CYBERNETICA DATASMITH model only. At the start of the first battle round, if this unit is an attached unit, this unit has MOBILE until the end of the battle.",
      "id": "enhancement-vinghs-wafers-of-dynamism",
      "eligibility": {
        "v": 1,
        "tags": [],
        "owner": {
          "subject": "model",
          "selector": {
            "unitIds": [
              "unit-cybernetica-datasmith"
            ],
            "allKeywords": [],
            "anyKeywords": [],
            "noneKeywords": [],
            "alternatives": []
          }
        },
        "assignment": {
          "maxOwners": 1,
          "enhancementChoices": 1,
          "payPointsPerOwner": true
        }
      },
      "tags": [],
      "assignment": {
        "maxOwners": 1,
        "enhancementChoices": 1,
        "payPointsPerOwner": true
      },
      "detachmentId": "detachment-lords-of-the-forge",
      "sourceBookId": "adeptus-mechanicus",
      "legacyKey": "enhancement-vinghs-wafers-of-dynamism",
      "canonicalEnhancementId": "enhancement-vinghs-wafers-of-dynamism",
      "canonicalDetachmentId": "detachment-lords-of-the-forge"
    },
    {
      "title": "TL-4Ø9",
      "text": "TECH-PRIEST model only. The bearer gains TL-4Ø9: Range 24\", A 3, BS 2+, S 11, AP -2, D D3+2, [DEVASTATING WOUNDS, HAZARDOUS].",
      "id": "enhancement-tl-4-9",
      "eligibility": {
        "v": 1,
        "tags": [],
        "owner": {
          "subject": "model",
          "selector": {
            "unitIds": [],
            "allKeywords": [
              "CHARACTER",
              "TECH-PRIEST"
            ],
            "anyKeywords": [],
            "noneKeywords": [
              "EPIC HERO"
            ],
            "alternatives": []
          }
        },
        "assignment": {
          "maxOwners": 1,
          "enhancementChoices": 1,
          "payPointsPerOwner": true
        }
      },
      "tags": [],
      "assignment": {
        "maxOwners": 1,
        "enhancementChoices": 1,
        "payPointsPerOwner": true
      },
      "detachmentId": "detachment-lords-of-the-forge",
      "sourceBookId": "adeptus-mechanicus",
      "legacyKey": "enhancement-tl-4-9",
      "canonicalEnhancementId": "enhancement-tl-4-9",
      "canonicalDetachmentId": "detachment-lords-of-the-forge"
    },
    {
      "title": "Voltagheist Reliquary",
      "text": "TECH-PRIEST model only. Enemy units cannot target this unit with snap shooting attacks",
      "id": "enhancement-voltagheist-reliquary",
      "eligibility": {
        "v": 1,
        "tags": [],
        "owner": {
          "subject": "model",
          "selector": {
            "unitIds": [],
            "allKeywords": [
              "CHARACTER",
              "TECH-PRIEST"
            ],
            "anyKeywords": [],
            "noneKeywords": [
              "EPIC HERO"
            ],
            "alternatives": []
          }
        },
        "assignment": {
          "maxOwners": 1,
          "enhancementChoices": 1,
          "payPointsPerOwner": true
        }
      },
      "tags": [],
      "assignment": {
        "maxOwners": 1,
        "enhancementChoices": 1,
        "payPointsPerOwner": true
      },
      "detachmentId": "detachment-luminen-auto-choir",
      "sourceBookId": "adeptus-mechanicus",
      "legacyKey": "enhancement-voltagheist-reliquary",
      "canonicalEnhancementId": "enhancement-voltagheist-reliquary",
      "canonicalDetachmentId": "detachment-luminen-auto-choir"
    },
    {
      "title": "Electromiasmic Brazier",
      "text": "TECH-PRIEST model only. This unit has Stealth.",
      "id": "enhancement-electromiasmic-brazier",
      "eligibility": {
        "v": 1,
        "tags": [],
        "owner": {
          "subject": "model",
          "selector": {
            "unitIds": [],
            "allKeywords": [
              "CHARACTER",
              "TECH-PRIEST"
            ],
            "anyKeywords": [],
            "noneKeywords": [
              "EPIC HERO"
            ],
            "alternatives": []
          }
        },
        "assignment": {
          "maxOwners": 1,
          "enhancementChoices": 1,
          "payPointsPerOwner": true
        }
      },
      "tags": [],
      "assignment": {
        "maxOwners": 1,
        "enhancementChoices": 1,
        "payPointsPerOwner": true
      },
      "detachmentId": "detachment-luminen-auto-choir",
      "sourceBookId": "adeptus-mechanicus",
      "legacyKey": "enhancement-electromiasmic-brazier",
      "canonicalEnhancementId": "enhancement-electromiasmic-brazier",
      "canonicalDetachmentId": "detachment-luminen-auto-choir"
    },
    {
      "title": "Necromechanic",
      "text": "TECH-PRIEST model only. Once per battle round, when a saving throw made for a friendly LEGIO CYBERNETICA or ADEPTUS MECHANICUS VEHICLE model within 12\" of the bearer is failed, the bearer can use this Enhancement. If they do, change the Damage characteristic of that attack to 0.",
      "id": "enhancement-necromechanic",
      "eligibility": {
        "v": 1,
        "tags": [],
        "owner": {
          "subject": "model",
          "selector": {
            "unitIds": [],
            "allKeywords": [
              "CHARACTER",
              "TECH-PRIEST"
            ],
            "anyKeywords": [],
            "noneKeywords": [
              "EPIC HERO"
            ],
            "alternatives": []
          }
        },
        "assignment": {
          "maxOwners": 1,
          "enhancementChoices": 1,
          "payPointsPerOwner": true
        }
      },
      "tags": [],
      "assignment": {
        "maxOwners": 1,
        "enhancementChoices": 1,
        "payPointsPerOwner": true
      },
      "detachmentId": "detachment-cohort-cybernetica",
      "sourceBookId": "adeptus-mechanicus",
      "legacyKey": "enhancement-necromechanic",
      "canonicalEnhancementId": "enhancement-necromechanic",
      "canonicalDetachmentId": "detachment-cohort-cybernetica"
    },
    {
      "title": "Lord of Machines",
      "text": "TECH-PRIEST model only. Once per turn, at the start of your opponent’s Shooting phase, select one enemy VEHICLE unit within 12\" of and visible to the bearer. That unit must take a Leadership test: if that test is passed, until the end of the phase, each time a model in that unit makes an attack, subtract 1 from the Hit roll; if that test is failed, that unit is not eligible to shoot this phase.",
      "id": "enhancement-lord-of-machines",
      "eligibility": {
        "v": 1,
        "tags": [],
        "owner": {
          "subject": "model",
          "selector": {
            "unitIds": [],
            "allKeywords": [
              "CHARACTER",
              "TECH-PRIEST"
            ],
            "anyKeywords": [],
            "noneKeywords": [
              "EPIC HERO"
            ],
            "alternatives": []
          }
        },
        "assignment": {
          "maxOwners": 1,
          "enhancementChoices": 1,
          "payPointsPerOwner": true
        }
      },
      "tags": [],
      "assignment": {
        "maxOwners": 1,
        "enhancementChoices": 1,
        "payPointsPerOwner": true
      },
      "detachmentId": "detachment-cohort-cybernetica",
      "sourceBookId": "adeptus-mechanicus",
      "legacyKey": "enhancement-lord-of-machines",
      "canonicalEnhancementId": "enhancement-lord-of-machines",
      "canonicalDetachmentId": "detachment-cohort-cybernetica"
    },
    {
      "title": "Emotionless Clarity",
      "text": "TECH-PRIEST model only. Once per turn, when a friendly LEGIO CYBERNETICA or ADEPTUS MECHANICUS VEHICLE model with the Deadly Demise ability that is within 12\" of the bearer is destroyed, the bearer can use this Enhancement. If it does, do not roll to determine whether any mortal wounds are inflicted as a result of that model’s Deadly Demise ability. Instead, mortal wounds are automatically inflicted.",
      "id": "enhancement-emotionless-clarity",
      "eligibility": {
        "v": 1,
        "tags": [],
        "owner": {
          "subject": "model",
          "selector": {
            "unitIds": [],
            "allKeywords": [
              "CHARACTER",
              "TECH-PRIEST"
            ],
            "anyKeywords": [],
            "noneKeywords": [
              "EPIC HERO"
            ],
            "alternatives": []
          }
        },
        "assignment": {
          "maxOwners": 1,
          "enhancementChoices": 1,
          "payPointsPerOwner": true
        }
      },
      "tags": [],
      "assignment": {
        "maxOwners": 1,
        "enhancementChoices": 1,
        "payPointsPerOwner": true
      },
      "detachmentId": "detachment-cohort-cybernetica",
      "sourceBookId": "adeptus-mechanicus",
      "legacyKey": "enhancement-emotionless-clarity",
      "canonicalEnhancementId": "enhancement-emotionless-clarity",
      "canonicalDetachmentId": "detachment-cohort-cybernetica"
    },
    {
      "title": "Arch-negator",
      "text": "TECH-PRIEST model only. Ranged weapons equipped by the bearer have the [ANTI-VEHICLE 4+] ability.",
      "id": "enhancement-arch-negator",
      "eligibility": {
        "v": 1,
        "tags": [],
        "owner": {
          "subject": "model",
          "selector": {
            "unitIds": [],
            "allKeywords": [
              "CHARACTER",
              "TECH-PRIEST"
            ],
            "anyKeywords": [],
            "noneKeywords": [
              "EPIC HERO"
            ],
            "alternatives": []
          }
        },
        "assignment": {
          "maxOwners": 1,
          "enhancementChoices": 1,
          "payPointsPerOwner": true
        }
      },
      "tags": [],
      "assignment": {
        "maxOwners": 1,
        "enhancementChoices": 1,
        "payPointsPerOwner": true
      },
      "detachmentId": "detachment-cohort-cybernetica",
      "sourceBookId": "adeptus-mechanicus",
      "legacyKey": "enhancement-arch-negator",
      "canonicalEnhancementId": "enhancement-arch-negator",
      "canonicalDetachmentId": "detachment-cohort-cybernetica"
    },
    {
      "title": "Mechanicus Locum",
      "text": "TECH-PRIEST model only. The bearer has a Leadership characteristic of 6+ and, once per battle, at the start of any phase, you can select one friendly CULT MECHANICUS unit that is Battle-shocked and within 12\" of the bearer. That unit is no longer Battle-shocked.",
      "id": "enhancement-mechanicus-locum",
      "eligibility": {
        "v": 1,
        "tags": [],
        "owner": {
          "subject": "model",
          "selector": {
            "unitIds": [],
            "allKeywords": [
              "CHARACTER",
              "TECH-PRIEST"
            ],
            "anyKeywords": [],
            "noneKeywords": [
              "EPIC HERO"
            ],
            "alternatives": []
          }
        },
        "assignment": {
          "maxOwners": 1,
          "enhancementChoices": 1,
          "payPointsPerOwner": true
        }
      },
      "tags": [],
      "assignment": {
        "maxOwners": 1,
        "enhancementChoices": 1,
        "payPointsPerOwner": true
      },
      "detachmentId": "detachment-data-psalm-conclave",
      "sourceBookId": "adeptus-mechanicus",
      "legacyKey": "enhancement-mechanicus-locum",
      "canonicalEnhancementId": "enhancement-mechanicus-locum",
      "canonicalDetachmentId": "detachment-data-psalm-conclave"
    },
    {
      "title": "Mantle of the Gnosticarch",
      "text": "TECH-PRIEST model only. Each time an attack is allocated to the bearer, change the Damage characteristic of that attack to 1.",
      "id": "enhancement-mantle-of-the-gnosticarch",
      "eligibility": {
        "v": 1,
        "tags": [],
        "owner": {
          "subject": "model",
          "selector": {
            "unitIds": [],
            "allKeywords": [
              "CHARACTER",
              "TECH-PRIEST"
            ],
            "anyKeywords": [],
            "noneKeywords": [
              "EPIC HERO"
            ],
            "alternatives": []
          }
        },
        "assignment": {
          "maxOwners": 1,
          "enhancementChoices": 1,
          "payPointsPerOwner": true
        }
      },
      "tags": [],
      "assignment": {
        "maxOwners": 1,
        "enhancementChoices": 1,
        "payPointsPerOwner": true
      },
      "detachmentId": "detachment-data-psalm-conclave",
      "sourceBookId": "adeptus-mechanicus",
      "legacyKey": "enhancement-mantle-of-the-gnosticarch",
      "canonicalEnhancementId": "enhancement-mantle-of-the-gnosticarch",
      "canonicalDetachmentId": "detachment-data-psalm-conclave"
    },
    {
      "title": "Data-blessed Autosermon",
      "text": "TECH-PRIEST model only. Once per battle, at the start of your Command phase, you can select the Benediction of the Omnissiah you did not select at the start of the first battle round. Until the start of your next Command phase, that Benediction of the Omnissiah is active for the bearer’s unit in addition to the one that is currently active for your army.",
      "id": "enhancement-data-blessed-autosermon",
      "eligibility": {
        "v": 1,
        "tags": [],
        "owner": {
          "subject": "model",
          "selector": {
            "unitIds": [],
            "allKeywords": [
              "CHARACTER",
              "TECH-PRIEST"
            ],
            "anyKeywords": [],
            "noneKeywords": [
              "EPIC HERO"
            ],
            "alternatives": []
          }
        },
        "assignment": {
          "maxOwners": 1,
          "enhancementChoices": 1,
          "payPointsPerOwner": true
        }
      },
      "tags": [],
      "assignment": {
        "maxOwners": 1,
        "enhancementChoices": 1,
        "payPointsPerOwner": true
      },
      "detachmentId": "detachment-data-psalm-conclave",
      "sourceBookId": "adeptus-mechanicus",
      "legacyKey": "enhancement-data-blessed-autosermon",
      "canonicalEnhancementId": "enhancement-data-blessed-autosermon",
      "canonicalDetachmentId": "detachment-data-psalm-conclave"
    },
    {
      "title": "Temporcopia",
      "text": "TECH-PRIEST model only. The bearer’s unit has the Fights First ability.",
      "id": "enhancement-temporcopia",
      "eligibility": {
        "v": 1,
        "tags": [],
        "owner": {
          "subject": "model",
          "selector": {
            "unitIds": [],
            "allKeywords": [
              "CHARACTER",
              "TECH-PRIEST"
            ],
            "anyKeywords": [],
            "noneKeywords": [
              "EPIC HERO"
            ],
            "alternatives": []
          }
        },
        "assignment": {
          "maxOwners": 1,
          "enhancementChoices": 1,
          "payPointsPerOwner": true
        }
      },
      "tags": [],
      "assignment": {
        "maxOwners": 1,
        "enhancementChoices": 1,
        "payPointsPerOwner": true
      },
      "detachmentId": "detachment-data-psalm-conclave",
      "sourceBookId": "adeptus-mechanicus",
      "legacyKey": "enhancement-temporcopia",
      "canonicalEnhancementId": "enhancement-temporcopia",
      "canonicalDetachmentId": "detachment-data-psalm-conclave"
    },
    {
      "title": "Omnicogitator",
      "text": "SKITARII MARSHAL model only. The Conqueror Imperative and Protector Imperative are both active for the bearer’s unit.",
      "id": "enhancement-omnicogitator",
      "eligibility": {
        "v": 1,
        "tags": [],
        "owner": {
          "subject": "model",
          "selector": {
            "unitIds": [
              "unit-skitarii-marshal"
            ],
            "allKeywords": [],
            "anyKeywords": [],
            "noneKeywords": [],
            "alternatives": []
          }
        },
        "assignment": {
          "maxOwners": 1,
          "enhancementChoices": 1,
          "payPointsPerOwner": true
        }
      },
      "tags": [],
      "assignment": {
        "maxOwners": 1,
        "enhancementChoices": 1,
        "payPointsPerOwner": true
      },
      "detachmentId": "detachment-eradication-cohort",
      "sourceBookId": "adeptus-mechanicus",
      "legacyKey": "enhancement-omnicogitator",
      "canonicalEnhancementId": "enhancement-omnicogitator",
      "canonicalDetachmentId": "detachment-eradication-cohort"
    },
    {
      "title": "Martial Signatum Amplificator",
      "text": "TECH-PRIEST model only. Models in the bearer’s unit have the SKITARII keyword.",
      "id": "enhancement-martial-signatum-amplificator",
      "eligibility": {
        "v": 1,
        "tags": [],
        "owner": {
          "subject": "model",
          "selector": {
            "unitIds": [],
            "allKeywords": [
              "CHARACTER",
              "TECH-PRIEST"
            ],
            "anyKeywords": [],
            "noneKeywords": [
              "EPIC HERO"
            ],
            "alternatives": []
          }
        },
        "assignment": {
          "maxOwners": 1,
          "enhancementChoices": 1,
          "payPointsPerOwner": true
        }
      },
      "tags": [],
      "assignment": {
        "maxOwners": 1,
        "enhancementChoices": 1,
        "payPointsPerOwner": true
      },
      "detachmentId": "detachment-eradication-cohort",
      "sourceBookId": "adeptus-mechanicus",
      "legacyKey": "enhancement-martial-signatum-amplificator",
      "canonicalEnhancementId": "enhancement-martial-signatum-amplificator",
      "canonicalDetachmentId": "detachment-eradication-cohort"
    },
    {
      "title": "Belicosa-class Capacitor Vanes",
      "text": "ADEPTUS MECHANICUS model only. Add 6\" to the Range characteristic of ranged weapons equipped by models in the bearer’s unit, and add 1 to the Strength characteristic of those weapons.",
      "id": "enhancement-belicosa-class-capacitor-vanes",
      "eligibility": {
        "v": 1,
        "tags": [],
        "owner": {
          "subject": "model",
          "selector": {
            "unitIds": [],
            "allKeywords": [
              "CHARACTER",
              "ADEPTUS MECHANICUS"
            ],
            "anyKeywords": [],
            "noneKeywords": [
              "EPIC HERO"
            ],
            "alternatives": []
          }
        },
        "assignment": {
          "maxOwners": 1,
          "enhancementChoices": 1,
          "payPointsPerOwner": true
        }
      },
      "tags": [],
      "assignment": {
        "maxOwners": 1,
        "enhancementChoices": 1,
        "payPointsPerOwner": true
      },
      "detachmentId": "detachment-eradication-cohort",
      "sourceBookId": "adeptus-mechanicus",
      "legacyKey": "enhancement-belicosa-class-capacitor-vanes",
      "canonicalEnhancementId": "enhancement-belicosa-class-capacitor-vanes",
      "canonicalDetachmentId": "detachment-eradication-cohort"
    },
    {
      "title": "Omnissiah's Fury",
      "text": "SKITARII MARSHAL model only. Add 2 to the Attacks characteristic of melee weapons equipped by the bearer, and improve the Armour Penetration and Damage characteristics of those weapons by 1.",
      "id": "enhancement-omnissiahs-fury",
      "eligibility": {
        "v": 1,
        "tags": [],
        "owner": {
          "subject": "model",
          "selector": {
            "unitIds": [
              "unit-skitarii-marshal"
            ],
            "allKeywords": [],
            "anyKeywords": [],
            "noneKeywords": [],
            "alternatives": []
          }
        },
        "assignment": {
          "maxOwners": 1,
          "enhancementChoices": 1,
          "payPointsPerOwner": true
        }
      },
      "tags": [],
      "assignment": {
        "maxOwners": 1,
        "enhancementChoices": 1,
        "payPointsPerOwner": true
      },
      "detachmentId": "detachment-eradication-cohort",
      "sourceBookId": "adeptus-mechanicus",
      "legacyKey": "enhancement-omnissiahs-fury",
      "canonicalEnhancementId": "enhancement-omnissiahs-fury",
      "canonicalDetachmentId": "detachment-eradication-cohort"
    },
    {
      "title": "Artisan",
      "text": "TECH-PRIEST model only. While the bearer is leading a unit that is within range of your Acquisition objective marker, once per phase, you can change the result of one Hit roll, one Wound roll or one saving throw made for that unit to an unmodified 6.",
      "id": "enhancement-artisan",
      "eligibility": {
        "v": 1,
        "tags": [],
        "owner": {
          "subject": "model",
          "selector": {
            "unitIds": [],
            "allKeywords": [
              "CHARACTER",
              "TECH-PRIEST"
            ],
            "anyKeywords": [],
            "noneKeywords": [
              "EPIC HERO"
            ],
            "alternatives": []
          }
        },
        "assignment": {
          "maxOwners": 1,
          "enhancementChoices": 1,
          "payPointsPerOwner": true
        }
      },
      "tags": [],
      "assignment": {
        "maxOwners": 1,
        "enhancementChoices": 1,
        "payPointsPerOwner": true
      },
      "detachmentId": "detachment-explorator-maniple",
      "sourceBookId": "adeptus-mechanicus",
      "legacyKey": "enhancement-artisan",
      "canonicalEnhancementId": "enhancement-artisan",
      "canonicalDetachmentId": "detachment-explorator-maniple"
    },
    {
      "title": "Magos",
      "text": "TECH-PRIEST model only. At the end of your Command phase, if the bearer is within range of your Acquisition objective marker, roll one D6: on a 4+, you gain 1CP.",
      "id": "enhancement-magos",
      "eligibility": {
        "v": 1,
        "tags": [],
        "owner": {
          "subject": "model",
          "selector": {
            "unitIds": [],
            "allKeywords": [
              "CHARACTER",
              "TECH-PRIEST"
            ],
            "anyKeywords": [],
            "noneKeywords": [
              "EPIC HERO"
            ],
            "alternatives": []
          }
        },
        "assignment": {
          "maxOwners": 1,
          "enhancementChoices": 1,
          "payPointsPerOwner": true
        }
      },
      "tags": [],
      "assignment": {
        "maxOwners": 1,
        "enhancementChoices": 1,
        "payPointsPerOwner": true
      },
      "detachmentId": "detachment-explorator-maniple",
      "sourceBookId": "adeptus-mechanicus",
      "legacyKey": "enhancement-magos",
      "canonicalEnhancementId": "enhancement-magos",
      "canonicalDetachmentId": "detachment-explorator-maniple"
    },
    {
      "title": "Logis",
      "text": "TECH-PRIEST model only. While the bearer is leading a unit, each time a model in that unit makes an attack that targets a unit within range of your Acquisition objective marker, add 1 to the Hit roll.",
      "id": "enhancement-logis",
      "eligibility": {
        "v": 1,
        "tags": [],
        "owner": {
          "subject": "model",
          "selector": {
            "unitIds": [],
            "allKeywords": [
              "CHARACTER",
              "TECH-PRIEST"
            ],
            "anyKeywords": [],
            "noneKeywords": [
              "EPIC HERO"
            ],
            "alternatives": []
          }
        },
        "assignment": {
          "maxOwners": 1,
          "enhancementChoices": 1,
          "payPointsPerOwner": true
        }
      },
      "tags": [],
      "assignment": {
        "maxOwners": 1,
        "enhancementChoices": 1,
        "payPointsPerOwner": true
      },
      "detachmentId": "detachment-explorator-maniple",
      "sourceBookId": "adeptus-mechanicus",
      "legacyKey": "enhancement-logis",
      "canonicalEnhancementId": "enhancement-logis",
      "canonicalDetachmentId": "detachment-explorator-maniple"
    },
    {
      "title": "Genetor",
      "text": "TECH-PRIEST model only. While the bearer is leading a unit that is within range of your Acquisition objective marker, models in that unit have a 4+ invulnerable save.",
      "id": "enhancement-genetor",
      "eligibility": {
        "v": 1,
        "tags": [],
        "owner": {
          "subject": "model",
          "selector": {
            "unitIds": [],
            "allKeywords": [
              "CHARACTER",
              "TECH-PRIEST"
            ],
            "anyKeywords": [],
            "noneKeywords": [
              "EPIC HERO"
            ],
            "alternatives": []
          }
        },
        "assignment": {
          "maxOwners": 1,
          "enhancementChoices": 1,
          "payPointsPerOwner": true
        }
      },
      "tags": [],
      "assignment": {
        "maxOwners": 1,
        "enhancementChoices": 1,
        "payPointsPerOwner": true
      },
      "detachmentId": "detachment-explorator-maniple",
      "sourceBookId": "adeptus-mechanicus",
      "legacyKey": "enhancement-genetor",
      "canonicalEnhancementId": "enhancement-genetor",
      "canonicalDetachmentId": "detachment-explorator-maniple"
    },
    {
      "title": "Transoracular Dyad Wafers",
      "text": "CYBERNETICA DATASMITH model only. When the bearer is attached to a KASTELAN ROBOTS unit, until the end of the battle, models in that unit gain the HALO OVERRIDE keyword. That unit cannot be selected when selecting units as part of the Noospheric Transference Detachment rule.",
      "id": "enhancement-transoracular-dyad-wafers",
      "eligibility": {
        "v": 1,
        "tags": [],
        "owner": {
          "subject": "model",
          "selector": {
            "unitIds": [
              "unit-cybernetica-datasmith"
            ],
            "allKeywords": [],
            "anyKeywords": [],
            "noneKeywords": [],
            "alternatives": []
          }
        },
        "assignment": {
          "maxOwners": 1,
          "enhancementChoices": 1,
          "payPointsPerOwner": true
        }
      },
      "tags": [],
      "assignment": {
        "maxOwners": 1,
        "enhancementChoices": 1,
        "payPointsPerOwner": true
      },
      "detachmentId": "detachment-haloscreed-battle-clade",
      "sourceBookId": "adeptus-mechanicus",
      "legacyKey": "enhancement-transoracular-dyad-wafers",
      "canonicalEnhancementId": "enhancement-transoracular-dyad-wafers",
      "canonicalDetachmentId": "detachment-haloscreed-battle-clade"
    },
    {
      "title": "Cognitive Reinforcement",
      "text": "ADEPTUS MECHANICUS model only (excluding CYBERNETICA DATASMITH models). The Conqueror Imperative and Protector Imperative are both active for the bearer’s unit.",
      "id": "enhancement-cognitive-reinforcement",
      "eligibility": {
        "v": 1,
        "tags": [],
        "owner": {
          "subject": "model",
          "selector": {
            "unitIds": [],
            "allKeywords": [
              "CHARACTER",
              "ADEPTUS MECHANICUS"
            ],
            "anyKeywords": [],
            "noneKeywords": [
              "EPIC HERO",
              "CYBERNETICA DATASMITH"
            ],
            "alternatives": []
          }
        },
        "assignment": {
          "maxOwners": 1,
          "enhancementChoices": 1,
          "payPointsPerOwner": true
        }
      },
      "tags": [],
      "assignment": {
        "maxOwners": 1,
        "enhancementChoices": 1,
        "payPointsPerOwner": true
      },
      "detachmentId": "detachment-haloscreed-battle-clade",
      "sourceBookId": "adeptus-mechanicus",
      "legacyKey": "enhancement-cognitive-reinforcement",
      "canonicalEnhancementId": "enhancement-cognitive-reinforcement",
      "canonicalDetachmentId": "detachment-haloscreed-battle-clade"
    },
    {
      "title": "Sanctified Ordnance",
      "text": "ADEPTUS MECHANICUS model only. Add 6\" to the range characteristic of ranged weapons equipped by models in the bearer’s unit and, each time a Hazardous test is taken for that unit, you can re-roll the result.",
      "id": "enhancement-sanctified-ordnance",
      "eligibility": {
        "v": 1,
        "tags": [],
        "owner": {
          "subject": "model",
          "selector": {
            "unitIds": [],
            "allKeywords": [
              "CHARACTER",
              "ADEPTUS MECHANICUS"
            ],
            "anyKeywords": [],
            "noneKeywords": [
              "EPIC HERO"
            ],
            "alternatives": []
          }
        },
        "assignment": {
          "maxOwners": 1,
          "enhancementChoices": 1,
          "payPointsPerOwner": true
        }
      },
      "tags": [],
      "assignment": {
        "maxOwners": 1,
        "enhancementChoices": 1,
        "payPointsPerOwner": true
      },
      "detachmentId": "detachment-haloscreed-battle-clade",
      "sourceBookId": "adeptus-mechanicus",
      "legacyKey": "enhancement-sanctified-ordnance",
      "canonicalEnhancementId": "enhancement-sanctified-ordnance",
      "canonicalDetachmentId": "detachment-haloscreed-battle-clade"
    },
    {
      "title": "Inloaded Lethality",
      "text": "TECH-PRIEST DOMINUS or TECH-PRIEST MANIPULUS model only. Add 3 to the Attacks characteristic of the bearer’s melee weapons and add 1 to the Damage characteristic of the bearer’s melee weapons.",
      "id": "enhancement-inloaded-lethality",
      "eligibility": {
        "v": 1,
        "tags": [],
        "owner": {
          "subject": "model",
          "selector": {
            "unitIds": [
              "unit-tech-priest-dominus",
              "unit-tech-priest-manipulus"
            ],
            "allKeywords": [
              "CHARACTER"
            ],
            "anyKeywords": [],
            "noneKeywords": [
              "EPIC HERO"
            ],
            "alternatives": []
          }
        },
        "assignment": {
          "maxOwners": 1,
          "enhancementChoices": 1,
          "payPointsPerOwner": true
        }
      },
      "tags": [],
      "assignment": {
        "maxOwners": 1,
        "enhancementChoices": 1,
        "payPointsPerOwner": true
      },
      "detachmentId": "detachment-haloscreed-battle-clade",
      "sourceBookId": "adeptus-mechanicus",
      "legacyKey": "enhancement-inloaded-lethality",
      "canonicalEnhancementId": "enhancement-inloaded-lethality",
      "canonicalDetachmentId": "detachment-haloscreed-battle-clade"
    },
    {
      "title": "Autoclavic Denunciation",
      "text": "ADEPTUS MECHANICUS model only. Ranged weapons equipped by the bearer have the [ANTI-INFANTRY 2+] and [ANTI-MONSTER 4+] abilities.",
      "id": "enhancement-autoclavic-denunciation",
      "eligibility": {
        "v": 1,
        "tags": [],
        "owner": {
          "subject": "model",
          "selector": {
            "unitIds": [],
            "allKeywords": [
              "CHARACTER",
              "ADEPTUS MECHANICUS"
            ],
            "anyKeywords": [],
            "noneKeywords": [
              "EPIC HERO"
            ],
            "alternatives": []
          }
        },
        "assignment": {
          "maxOwners": 1,
          "enhancementChoices": 1,
          "payPointsPerOwner": true
        }
      },
      "tags": [],
      "assignment": {
        "maxOwners": 1,
        "enhancementChoices": 1,
        "payPointsPerOwner": true
      },
      "detachmentId": "detachment-rad-zone-corps",
      "sourceBookId": "adeptus-mechanicus",
      "legacyKey": "enhancement-autoclavic-denunciation",
      "canonicalEnhancementId": "enhancement-autoclavic-denunciation",
      "canonicalDetachmentId": "detachment-rad-zone-corps"
    },
    {
      "title": "Malphonic Susurrus",
      "text": "ADEPTUS MECHANICUS model only. While the bearer is leading a unit, models in that unit have the Stealth ability.",
      "id": "enhancement-malphonic-susurrus",
      "eligibility": {
        "v": 1,
        "tags": [],
        "owner": {
          "subject": "model",
          "selector": {
            "unitIds": [],
            "allKeywords": [
              "CHARACTER",
              "ADEPTUS MECHANICUS"
            ],
            "anyKeywords": [],
            "noneKeywords": [
              "EPIC HERO"
            ],
            "alternatives": []
          }
        },
        "assignment": {
          "maxOwners": 1,
          "enhancementChoices": 1,
          "payPointsPerOwner": true
        }
      },
      "tags": [],
      "assignment": {
        "maxOwners": 1,
        "enhancementChoices": 1,
        "payPointsPerOwner": true
      },
      "detachmentId": "detachment-rad-zone-corps",
      "sourceBookId": "adeptus-mechanicus",
      "legacyKey": "enhancement-malphonic-susurrus",
      "canonicalEnhancementId": "enhancement-malphonic-susurrus",
      "canonicalDetachmentId": "detachment-rad-zone-corps"
    },
    {
      "title": "Peerless Eradicator",
      "text": "ADEPTUS MECHANICUS model only. While the bearer is leading a unit, ranged weapons equipped by models in that unit have the [SUSTAINED HITS 1] ability.",
      "id": "enhancement-peerless-eradicator",
      "eligibility": {
        "v": 1,
        "tags": [],
        "owner": {
          "subject": "model",
          "selector": {
            "unitIds": [],
            "allKeywords": [
              "CHARACTER",
              "ADEPTUS MECHANICUS"
            ],
            "anyKeywords": [],
            "noneKeywords": [
              "EPIC HERO"
            ],
            "alternatives": []
          }
        },
        "assignment": {
          "maxOwners": 1,
          "enhancementChoices": 1,
          "payPointsPerOwner": true
        }
      },
      "tags": [],
      "assignment": {
        "maxOwners": 1,
        "enhancementChoices": 1,
        "payPointsPerOwner": true
      },
      "detachmentId": "detachment-rad-zone-corps",
      "sourceBookId": "adeptus-mechanicus",
      "legacyKey": "enhancement-peerless-eradicator",
      "canonicalEnhancementId": "enhancement-peerless-eradicator",
      "canonicalDetachmentId": "detachment-rad-zone-corps"
    },
    {
      "title": "Radial Suffusion",
      "text": "ADEPTUS MECHANICUS model only. From the second battle round onwards, when resolving the Fallout effect of the Rad-bombardment Detachment rule, if the bearer is on the battlefield, roll one D6 for each enemy unit within 6\" of your opponent’s deployment zone, in addition to those that are within your opponent’s deployment zone.",
      "id": "enhancement-radial-suffusion",
      "eligibility": {
        "v": 1,
        "tags": [],
        "owner": {
          "subject": "model",
          "selector": {
            "unitIds": [],
            "allKeywords": [
              "CHARACTER",
              "ADEPTUS MECHANICUS"
            ],
            "anyKeywords": [],
            "noneKeywords": [
              "EPIC HERO"
            ],
            "alternatives": []
          }
        },
        "assignment": {
          "maxOwners": 1,
          "enhancementChoices": 1,
          "payPointsPerOwner": true
        }
      },
      "tags": [],
      "assignment": {
        "maxOwners": 1,
        "enhancementChoices": 1,
        "payPointsPerOwner": true
      },
      "detachmentId": "detachment-rad-zone-corps",
      "sourceBookId": "adeptus-mechanicus",
      "legacyKey": "enhancement-radial-suffusion",
      "canonicalEnhancementId": "enhancement-radial-suffusion",
      "canonicalDetachmentId": "detachment-rad-zone-corps"
    },
    {
      "title": "Veiled Hunter",
      "text": "SKITARII MARSHAL model only. After both players have deployed their armies, you can select up to three SKITARII INFANTRY units from your army and redeploy all of those units. When doing so, any of those units can be placed into Strategic Reserves, regardless of how many units are already in Strategic Reserves.",
      "id": "enhancement-veiled-hunter",
      "eligibility": {
        "v": 1,
        "tags": [],
        "owner": {
          "subject": "model",
          "selector": {
            "unitIds": [
              "unit-skitarii-marshal"
            ],
            "allKeywords": [],
            "anyKeywords": [],
            "noneKeywords": [],
            "alternatives": []
          }
        },
        "assignment": {
          "maxOwners": 1,
          "enhancementChoices": 1,
          "payPointsPerOwner": true
        }
      },
      "tags": [],
      "assignment": {
        "maxOwners": 1,
        "enhancementChoices": 1,
        "payPointsPerOwner": true
      },
      "detachmentId": "detachment-skitarii-hunter-cohort",
      "sourceBookId": "adeptus-mechanicus",
      "legacyKey": "enhancement-veiled-hunter",
      "canonicalEnhancementId": "enhancement-veiled-hunter",
      "canonicalDetachmentId": "detachment-skitarii-hunter-cohort"
    },
    {
      "title": "Clandestine Infiltrator",
      "text": "SKITARII model only. The bearer, and models in any unit they are leading, have the Infiltrators and Scouts 6\" abilities.",
      "id": "enhancement-clandestine-infiltrator",
      "eligibility": {
        "v": 1,
        "tags": [],
        "owner": {
          "subject": "model",
          "selector": {
            "unitIds": [],
            "allKeywords": [
              "CHARACTER",
              "SKITARII"
            ],
            "anyKeywords": [],
            "noneKeywords": [
              "EPIC HERO"
            ],
            "alternatives": []
          }
        },
        "assignment": {
          "maxOwners": 1,
          "enhancementChoices": 1,
          "payPointsPerOwner": true
        }
      },
      "tags": [],
      "assignment": {
        "maxOwners": 1,
        "enhancementChoices": 1,
        "payPointsPerOwner": true
      },
      "detachmentId": "detachment-skitarii-hunter-cohort",
      "sourceBookId": "adeptus-mechanicus",
      "legacyKey": "enhancement-clandestine-infiltrator",
      "canonicalEnhancementId": "enhancement-clandestine-infiltrator",
      "canonicalDetachmentId": "detachment-skitarii-hunter-cohort"
    },
    {
      "title": "Cantic Thrallnet",
      "text": "SKITARII MARSHAL model only. At the start of the battle round, you can select one friendly SKITARII unit within 12\" of the bearer. Until the start of the next battle round, the Protector Imperative and the Conqueror Imperative are both active for that unit.",
      "id": "enhancement-cantic-thrallnet",
      "eligibility": {
        "v": 1,
        "tags": [],
        "owner": {
          "subject": "model",
          "selector": {
            "unitIds": [
              "unit-skitarii-marshal"
            ],
            "allKeywords": [],
            "anyKeywords": [],
            "noneKeywords": [],
            "alternatives": []
          }
        },
        "assignment": {
          "maxOwners": 1,
          "enhancementChoices": 1,
          "payPointsPerOwner": true
        }
      },
      "tags": [],
      "assignment": {
        "maxOwners": 1,
        "enhancementChoices": 1,
        "payPointsPerOwner": true
      },
      "detachmentId": "detachment-skitarii-hunter-cohort",
      "sourceBookId": "adeptus-mechanicus",
      "legacyKey": "enhancement-cantic-thrallnet",
      "canonicalEnhancementId": "enhancement-cantic-thrallnet",
      "canonicalDetachmentId": "detachment-skitarii-hunter-cohort"
    },
    {
      "title": "Battle-sphere Uplink",
      "text": "SKITARII model only. In your Shooting phase, after the bearer’s unit has shot, if it is not within Engagement Range of one or more enemy units, that unit can make a Normal move of up to 6\". If it does, until the end of the turn, that unit is not eligible to declare a charge.",
      "id": "enhancement-battle-sphere-uplink",
      "eligibility": {
        "v": 1,
        "tags": [],
        "owner": {
          "subject": "model",
          "selector": {
            "unitIds": [],
            "allKeywords": [
              "CHARACTER",
              "SKITARII"
            ],
            "anyKeywords": [],
            "noneKeywords": [
              "EPIC HERO"
            ],
            "alternatives": []
          }
        },
        "assignment": {
          "maxOwners": 1,
          "enhancementChoices": 1,
          "payPointsPerOwner": true
        }
      },
      "tags": [],
      "assignment": {
        "maxOwners": 1,
        "enhancementChoices": 1,
        "payPointsPerOwner": true
      },
      "detachmentId": "detachment-skitarii-hunter-cohort",
      "sourceBookId": "adeptus-mechanicus",
      "legacyKey": "enhancement-battle-sphere-uplink",
      "canonicalEnhancementId": "enhancement-battle-sphere-uplink",
      "canonicalDetachmentId": "detachment-skitarii-hunter-cohort"
    }
  ],
  "effectContracts": [
    {
      "canonicalRecordId": "datasheet-battle-protocols",
      "sourceKind": "datasheet-ability",
      "sourceBookId": "adeptus-mechanicus",
      "effectiveBookIds": [
        "adeptus-mechanicus"
      ],
      "sourceUnitId": "unit-cybernetica-datasmith",
      "scope": "attachment-group",
      "selector": {
        "kind": "attachment-group",
        "allUnitIds": [
          "unit-kastelan-robots",
          "unit-cybernetica-datasmith"
        ]
      },
      "clauses": [
        {
          "selector": {
            "subject": "unit",
            "unitIds": [
              "unit-kastelan-robots"
            ]
          },
          "conditions": [
            {
              "kind": "attachment-group-contains",
              "unitId": "unit-cybernetica-datasmith"
            },
            {
              "kind": "battle-protocol",
              "requiredValue": "aegis",
              "state": "unknown"
            }
          ],
          "operations": [
            {
              "id": "aegis-protocol-toughness",
              "type": "CHARACTERISTIC_ADD",
              "canonicalTarget": "T",
              "parameters": {
                "value": 1
              }
            },
            {
              "id": "battle-protocols-reference",
              "type": "CANONICAL_REFERENCE",
              "canonicalTarget": "datasheet-battle-protocols",
              "parameters": {
                "referenceKind": "ability"
              }
            }
          ]
        }
      ],
      "timingState": {
        "kind": "conditional",
        "state": "unknown"
      },
      "stackingPolicy": "apply-once-per-source",
      "source": {
        "sourceId": "adeptus-mechanicus-bsdata-codex",
        "locator": "content/adeptus-mechanicus-codex-datasheets.en.json#unit-cybernetica-datasmith#datasheet-battle-protocols"
      },
      "confidence": "SOURCE_LIMITED"
    },
    {
      "canonicalRecordId": "datasheet-control-edict",
      "sourceKind": "datasheet-ability",
      "sourceBookId": "adeptus-mechanicus",
      "effectiveBookIds": [
        "adeptus-mechanicus"
      ],
      "sourceUnitId": "unit-skitarii-marshal",
      "scope": "attached-unit",
      "selector": {
        "kind": "attached-source-unit",
        "sourceUnitId": "unit-skitarii-marshal"
      },
      "clauses": [
        {
          "selector": {
            "subject": "bodyguard",
            "excludeSourceUnit": true
          },
          "conditions": [],
          "operations": [
            {
              "id": "control-edict-reference",
              "type": "CANONICAL_REFERENCE",
              "canonicalTarget": "datasheet-control-edict",
              "parameters": {
                "referenceKind": "ability"
              }
            }
          ]
        }
      ],
      "timingState": {
        "kind": "while-attached"
      },
      "stackingPolicy": "apply-once-per-source",
      "source": {
        "sourceId": "adeptus-mechanicus-bsdata-codex",
        "locator": "content/adeptus-mechanicus-codex-datasheets.en.json#unit-skitarii-marshal#datasheet-control-edict"
      },
      "confidence": "SOURCE_LIMITED"
    },
    {
      "canonicalRecordId": "datasheet-data-severed",
      "sourceKind": "datasheet-ability",
      "sourceBookId": "adeptus-mechanicus",
      "effectiveBookIds": [
        "adeptus-mechanicus"
      ],
      "sourceUnitId": "unit-cybernetica-datasmith",
      "scope": "physical-support-composition",
      "selector": {
        "kind": "canonical-unit",
        "unitIds": [
          "unit-cybernetica-datasmith"
        ]
      },
      "clauses": [
        {
          "selector": {
            "subject": "unit",
            "unitIds": [
              "unit-cybernetica-datasmith"
            ]
          },
          "conditions": [
            {
              "kind": "attachment-group-excludes",
              "unitId": "unit-kastelan-robots"
            }
          ],
          "operations": [
            {
              "id": "data-severed-remove-vehicle",
              "type": "KEYWORD_REMOVE",
              "canonicalTarget": "VEHICLE",
              "parameters": {}
            },
            {
              "id": "data-severed-grant-infantry",
              "type": "KEYWORD_GRANT",
              "canonicalTarget": "INFANTRY",
              "parameters": {}
            }
          ]
        }
      ],
      "timingState": {
        "kind": "always"
      },
      "stackingPolicy": "apply-once-per-source",
      "source": {
        "sourceId": "adeptus-mechanicus-bsdata-codex",
        "locator": "content/adeptus-mechanicus-codex-datasheets.en.json#unit-cybernetica-datasmith#datasheet-data-severed"
      },
      "confidence": "SOURCE_LIMITED"
    },
    {
      "canonicalRecordId": "datasheet-electro-infusion",
      "sourceKind": "datasheet-ability",
      "sourceBookId": "adeptus-mechanicus",
      "effectiveBookIds": [
        "adeptus-mechanicus"
      ],
      "sourceUnitId": "unit-fulgurite-electro-priests",
      "scope": "attached-unit",
      "selector": {
        "kind": "attached-source-unit",
        "sourceUnitId": "unit-fulgurite-electro-priests"
      },
      "clauses": [
        {
          "selector": {
            "subject": "attached-character"
          },
          "conditions": [
            {
              "kind": "attachment-state",
              "value": "attached"
            },
            {
              "kind": "source-unit-present",
              "unitId": "unit-fulgurite-electro-priests"
            }
          ],
          "operations": [
            {
              "id": "electro-infusion-reference",
              "type": "CANONICAL_REFERENCE",
              "canonicalTarget": "datasheet-electro-infusion",
              "parameters": {
                "referenceKind": "ability"
              }
            }
          ]
        }
      ],
      "timingState": {
        "kind": "while-attached"
      },
      "stackingPolicy": "apply-once-per-source",
      "source": {
        "sourceId": "adeptus-mechanicus-bsdata-codex",
        "locator": "content/adeptus-mechanicus-codex-datasheets.en.json#unit-fulgurite-electro-priests#datasheet-electro-infusion"
      },
      "confidence": "SOURCE_LIMITED"
    },
    {
      "canonicalRecordId": "datasheet-galvanic-field",
      "sourceKind": "datasheet-ability",
      "sourceBookId": "adeptus-mechanicus",
      "effectiveBookIds": [
        "adeptus-mechanicus"
      ],
      "sourceUnitId": "unit-tech-priest-manipulus",
      "scope": "attached-unit",
      "selector": {
        "kind": "attached-source-unit",
        "sourceUnitId": "unit-tech-priest-manipulus"
      },
      "clauses": [
        {
          "selector": {
            "subject": "attached-unit",
            "weaponMode": "all"
          },
          "conditions": [
            {
              "kind": "attachment-state",
              "value": "attached"
            }
          ],
          "operations": [
            {
              "id": "galvanic-field",
              "type": "WEAPON_TAG_GRANT",
              "canonicalTarget": "all",
              "parameters": {
                "tag": "LETHAL HITS",
                "termId": "core-lethal-hits"
              }
            }
          ]
        }
      ],
      "timingState": {
        "kind": "while-attached"
      },
      "stackingPolicy": "apply-once-per-source",
      "source": {
        "sourceId": "adeptus-mechanicus-bsdata-codex",
        "locator": "content/adeptus-mechanicus-codex-datasheets.en.json#unit-tech-priest-manipulus#datasheet-galvanic-field"
      },
      "confidence": "SOURCE_LIMITED"
    },
    {
      "canonicalRecordId": "datasheet-lord-of-the-machine-cult",
      "sourceKind": "datasheet-ability",
      "sourceBookId": "adeptus-mechanicus",
      "effectiveBookIds": [
        "adeptus-mechanicus"
      ],
      "sourceUnitId": "unit-tech-priest-dominus",
      "scope": "attached-unit",
      "selector": {
        "kind": "attached-source-unit",
        "sourceUnitId": "unit-tech-priest-dominus"
      },
      "clauses": [
        {
          "selector": {
            "subject": "attached-unit",
            "allKeywords": [
              "ELECTRO-PRIESTS"
            ]
          },
          "conditions": [
            {
              "kind": "attachment-state",
              "value": "attached"
            }
          ],
          "operations": [
            {
              "id": "machine-cult-fnp-electro-priests",
              "type": "ABILITY_GRANT",
              "canonicalTarget": "core-feel-no-pain",
              "parameters": {
                "value": "4+"
              }
            }
          ]
        },
        {
          "selector": {
            "subject": "attached-unit"
          },
          "conditions": [
            {
              "kind": "attachment-state",
              "value": "attached"
            },
            {
              "kind": "unit-keyword-absent",
              "keyword": "ELECTRO-PRIESTS"
            }
          ],
          "operations": [
            {
              "id": "machine-cult-fnp-other",
              "type": "ABILITY_GRANT",
              "canonicalTarget": "core-feel-no-pain",
              "parameters": {
                "value": "5+"
              }
            }
          ]
        }
      ],
      "timingState": {
        "kind": "while-attached"
      },
      "stackingPolicy": "best-value",
      "source": {
        "sourceId": "adeptus-mechanicus-bsdata-codex",
        "locator": "content/adeptus-mechanicus-codex-datasheets.en.json#unit-tech-priest-dominus#datasheet-lord-of-the-machine-cult"
      },
      "confidence": "SOURCE_LIMITED"
    },
    {
      "canonicalRecordId": "datasheet-robotic-bodyguard",
      "sourceKind": "datasheet-ability",
      "sourceBookId": "adeptus-mechanicus",
      "effectiveBookIds": [
        "adeptus-mechanicus"
      ],
      "sourceUnitId": "unit-kastelan-robots",
      "scope": "attachment-group",
      "selector": {
        "kind": "attachment-group",
        "allUnitIds": [
          "unit-kastelan-robots",
          "unit-cybernetica-datasmith"
        ]
      },
      "clauses": [
        {
          "selector": {
            "subject": "unit",
            "unitIds": [
              "unit-cybernetica-datasmith"
            ]
          },
          "conditions": [
            {
              "kind": "attachment-group-contains",
              "unitId": "unit-kastelan-robots"
            }
          ],
          "operations": [
            {
              "id": "robotic-bodyguard-fnp",
              "type": "ABILITY_GRANT",
              "canonicalTarget": "core-feel-no-pain",
              "parameters": {
                "value": "4+"
              }
            }
          ]
        }
      ],
      "timingState": {
        "kind": "while-attached"
      },
      "stackingPolicy": "apply-once-per-source",
      "source": {
        "sourceId": "adeptus-mechanicus-bsdata-codex",
        "locator": "content/adeptus-mechanicus-codex-datasheets.en.json#unit-kastelan-robots#datasheet-robotic-bodyguard"
      },
      "confidence": "SOURCE_LIMITED"
    },
    {
      "canonicalRecordId": "datasheet-seekers-of-divine-arcana",
      "sourceKind": "datasheet-ability",
      "sourceBookId": "adeptus-mechanicus",
      "effectiveBookIds": [
        "adeptus-mechanicus"
      ],
      "sourceUnitId": "unit-technoarcheologist",
      "scope": "attached-unit",
      "selector": {
        "kind": "attached-source-unit",
        "sourceUnitId": "unit-technoarcheologist"
      },
      "clauses": [
        {
          "selector": {
            "subject": "attached-unit"
          },
          "conditions": [
            {
              "kind": "attachment-state",
              "value": "attached"
            }
          ],
          "operations": [
            {
              "id": "technoarcheologist-oc",
              "type": "CHARACTERISTIC_ADD",
              "canonicalTarget": "OC",
              "parameters": {
                "value": 1
              }
            }
          ]
        }
      ],
      "timingState": {
        "kind": "while-attached"
      },
      "stackingPolicy": "apply-once-per-source",
      "source": {
        "sourceId": "adeptus-mechanicus-bsdata-codex",
        "locator": "content/adeptus-mechanicus-codex-datasheets.en.json#unit-technoarcheologist#datasheet-seekers-of-divine-arcana"
      },
      "confidence": "SOURCE_LIMITED"
    },
    {
      "canonicalRecordId": "cohort-acquisitus-rule",
      "sourceKind": "detachment-rule",
      "sourceBookId": "adeptus-mechanicus",
      "effectiveBookIds": [
        "adeptus-mechanicus"
      ],
      "detachmentId": "detachment-cohort-acquisitus",
      "scope": "selected-detachment",
      "selector": {
        "kind": "selected-detachment",
        "detachmentId": "detachment-cohort-acquisitus"
      },
      "clauses": [
        {
          "selector": {
            "subject": "unit",
            "anyKeywords": [
              "PTERAXII",
              "INFILTRATORS",
              "RANGERS",
              "SERBERYS RAIDERS",
              "SERBERYS SULPHURHOUNDS"
            ]
          },
          "conditions": [],
          "operations": [
            {
              "id": "recon-augury",
              "type": "KEYWORD_GRANT",
              "canonicalTarget": "RECON AUGURY",
              "parameters": {}
            },
            {
              "id": "cohort-acquisitus-reference",
              "type": "CANONICAL_REFERENCE",
              "canonicalTarget": "cohort-acquisitus-rule",
              "parameters": {
                "referenceKind": "detachment-rule"
              }
            }
          ]
        }
      ],
      "timingState": {
        "kind": "always"
      },
      "stackingPolicy": "apply-once-per-source",
      "source": {
        "sourceId": "adeptus-mechanicus-faction-pack-v1.2",
        "locator": "content/adeptus-mechanicus-rules.en.json#cohort-acquisitus-rule"
      },
      "confidence": "VERIFIED_FROZEN"
    },
    {
      "canonicalRecordId": "cohort-cybernetica-rule",
      "sourceKind": "detachment-rule",
      "sourceBookId": "adeptus-mechanicus",
      "effectiveBookIds": [
        "adeptus-mechanicus"
      ],
      "detachmentId": "detachment-cohort-cybernetica",
      "scope": "selected-detachment",
      "selector": {
        "kind": "selected-detachment",
        "detachmentId": "detachment-cohort-cybernetica"
      },
      "clauses": [
        {
          "selector": {
            "subject": "unit",
            "allKeywords": [
              "LEGIO CYBERNETICA"
            ]
          },
          "conditions": [],
          "operations": [
            {
              "id": "cybernetica-move",
              "type": "CHARACTERISTIC_ADD",
              "canonicalTarget": "M",
              "parameters": {
                "value": 2
              }
            }
          ]
        },
        {
          "selector": {
            "subject": "unit",
            "allKeywords": [
              "LEGIO CYBERNETICA"
            ]
          },
          "conditions": [
            {
              "kind": "battle-shock",
              "requiredState": "not-battle-shocked",
              "state": "unknown"
            }
          ],
          "operations": [
            {
              "id": "cybernetica-oc",
              "type": "CHARACTERISTIC_ADD",
              "canonicalTarget": "OC",
              "parameters": {
                "value": 1
              }
            },
            {
              "id": "cybernetica-reference",
              "type": "CANONICAL_REFERENCE",
              "canonicalTarget": "cohort-cybernetica-rule",
              "parameters": {
                "referenceKind": "detachment-rule"
              }
            }
          ]
        }
      ],
      "timingState": {
        "kind": "mixed"
      },
      "stackingPolicy": "apply-once-per-source",
      "source": {
        "sourceId": "adeptus-mechanicus-codex-carry-forward",
        "locator": "content/adeptus-mechanicus-codex-detachments.en.json#cohort-cybernetica-rule"
      },
      "confidence": "SOURCE_LIMITED"
    },
    {
      "canonicalRecordId": "data-psalm-conclave-rule",
      "sourceKind": "detachment-rule",
      "sourceBookId": "adeptus-mechanicus",
      "effectiveBookIds": [
        "adeptus-mechanicus"
      ],
      "detachmentId": "detachment-data-psalm-conclave",
      "scope": "selected-detachment",
      "selector": {
        "kind": "selected-detachment",
        "detachmentId": "detachment-data-psalm-conclave"
      },
      "clauses": [
        {
          "selector": {
            "subject": "unit",
            "allKeywords": [
              "CULT MECHANICUS"
            ]
          },
          "conditions": [
            {
              "kind": "battle-selection",
              "state": "unknown"
            }
          ],
          "operations": [
            {
              "id": "data-psalm-reference",
              "type": "CANONICAL_REFERENCE",
              "canonicalTarget": "data-psalm-conclave-rule",
              "parameters": {
                "referenceKind": "detachment-rule"
              }
            }
          ]
        }
      ],
      "timingState": {
        "kind": "battle-setup",
        "state": "unknown"
      },
      "stackingPolicy": "apply-once-per-source",
      "source": {
        "sourceId": "adeptus-mechanicus-codex-carry-forward",
        "locator": "content/adeptus-mechanicus-codex-detachments.en.json#data-psalm-conclave-rule"
      },
      "confidence": "SOURCE_LIMITED"
    },
    {
      "canonicalRecordId": "eradication-cohort-rule",
      "sourceKind": "detachment-rule",
      "sourceBookId": "adeptus-mechanicus",
      "effectiveBookIds": [
        "adeptus-mechanicus"
      ],
      "detachmentId": "detachment-eradication-cohort",
      "scope": "selected-detachment",
      "selector": {
        "kind": "selected-detachment",
        "detachmentId": "detachment-eradication-cohort"
      },
      "clauses": [
        {
          "selector": {
            "subject": "unit",
            "allKeywords": [
              "SKITARII"
            ]
          },
          "conditions": [
            {
              "kind": "battle-imperative",
              "state": "unknown"
            }
          ],
          "operations": [
            {
              "id": "eradication-reference",
              "type": "CANONICAL_REFERENCE",
              "canonicalTarget": "eradication-cohort-rule",
              "parameters": {
                "referenceKind": "detachment-rule"
              }
            }
          ]
        }
      ],
      "timingState": {
        "kind": "conditional",
        "state": "unknown"
      },
      "stackingPolicy": "apply-once-per-source",
      "source": {
        "sourceId": "adeptus-mechanicus-faction-pack-v1.2",
        "locator": "content/adeptus-mechanicus-rules.en.json#eradication-cohort-rule"
      },
      "confidence": "VERIFIED_FROZEN"
    },
    {
      "canonicalRecordId": "explorator-maniple-rule",
      "sourceKind": "detachment-rule",
      "sourceBookId": "adeptus-mechanicus",
      "effectiveBookIds": [
        "adeptus-mechanicus"
      ],
      "detachmentId": "detachment-explorator-maniple",
      "scope": "selected-detachment",
      "selector": {
        "kind": "selected-detachment",
        "detachmentId": "detachment-explorator-maniple"
      },
      "clauses": [
        {
          "selector": {
            "subject": "unit",
            "allKeywords": [
              "ADEPTUS MECHANICUS"
            ]
          },
          "conditions": [
            {
              "kind": "acquisition-objective-state",
              "state": "unknown"
            }
          ],
          "operations": [
            {
              "id": "explorator-maniple-reference",
              "type": "CANONICAL_REFERENCE",
              "canonicalTarget": "explorator-maniple-rule",
              "parameters": {
                "referenceKind": "detachment-rule"
              }
            }
          ]
        }
      ],
      "timingState": {
        "kind": "conditional",
        "state": "unknown"
      },
      "stackingPolicy": "apply-once-per-source",
      "source": {
        "sourceId": "adeptus-mechanicus-codex-carry-forward",
        "locator": "content/adeptus-mechanicus-codex-detachments.en.json#explorator-maniple-rule"
      },
      "confidence": "SOURCE_LIMITED"
    },
    {
      "canonicalRecordId": "lords-of-the-forge-rule",
      "sourceKind": "detachment-rule",
      "sourceBookId": "adeptus-mechanicus",
      "effectiveBookIds": [
        "adeptus-mechanicus"
      ],
      "detachmentId": "detachment-lords-of-the-forge",
      "scope": "selected-detachment",
      "selector": {
        "kind": "selected-detachment",
        "detachmentId": "detachment-lords-of-the-forge"
      },
      "clauses": [
        {
          "selector": {
            "subject": "model",
            "allKeywords": [
              "TECH-PRIEST"
            ]
          },
          "conditions": [],
          "operations": [
            {
              "id": "lords-invulnerable",
              "type": "CHARACTERISTIC_SET",
              "canonicalTarget": "Invulnerable",
              "parameters": {
                "value": "4+"
              }
            },
            {
              "id": "lords-feel-no-pain",
              "type": "ABILITY_GRANT",
              "canonicalTarget": "core-feel-no-pain",
              "parameters": {
                "value": "5+"
              }
            },
            {
              "id": "lords-reference",
              "type": "CANONICAL_REFERENCE",
              "canonicalTarget": "lords-of-the-forge-rule",
              "parameters": {
                "referenceKind": "detachment-rule"
              }
            }
          ]
        }
      ],
      "timingState": {
        "kind": "always"
      },
      "stackingPolicy": "best-value",
      "source": {
        "sourceId": "adeptus-mechanicus-faction-pack-v1.2",
        "locator": "content/adeptus-mechanicus-rules.en.json#lords-of-the-forge-rule"
      },
      "confidence": "VERIFIED_FROZEN"
    },
    {
      "canonicalRecordId": "luminen-auto-choir-rule",
      "sourceKind": "detachment-rule",
      "sourceBookId": "adeptus-mechanicus",
      "effectiveBookIds": [
        "adeptus-mechanicus"
      ],
      "detachmentId": "detachment-luminen-auto-choir",
      "scope": "selected-detachment",
      "selector": {
        "kind": "selected-detachment",
        "detachmentId": "detachment-luminen-auto-choir"
      },
      "clauses": [
        {
          "selector": {
            "subject": "unit",
            "allKeywords": [
              "CORPUSCARII"
            ],
            "weaponMode": "ranged"
          },
          "conditions": [],
          "operations": [
            {
              "id": "luminen-lethal-hits",
              "type": "WEAPON_TAG_GRANT",
              "canonicalTarget": "ranged",
              "parameters": {
                "tag": "LETHAL HITS",
                "termId": "core-lethal-hits"
              }
            },
            {
              "id": "luminen-reference-corpuscarii",
              "type": "CANONICAL_REFERENCE",
              "canonicalTarget": "luminen-auto-choir-rule",
              "parameters": {
                "referenceKind": "detachment-rule"
              }
            }
          ]
        },
        {
          "selector": {
            "subject": "unit",
            "allKeywords": [
              "FULGURITE"
            ]
          },
          "conditions": [
            {
              "kind": "after-fight",
              "state": "unknown"
            }
          ],
          "operations": [
            {
              "id": "luminen-reference-fulgurite",
              "type": "CANONICAL_REFERENCE",
              "canonicalTarget": "luminen-auto-choir-rule",
              "parameters": {
                "referenceKind": "detachment-rule"
              }
            }
          ]
        }
      ],
      "timingState": {
        "kind": "mixed",
        "state": "unknown"
      },
      "stackingPolicy": "apply-once-per-source",
      "source": {
        "sourceId": "adeptus-mechanicus-faction-pack-v1.2",
        "locator": "content/adeptus-mechanicus-rules.en.json#luminen-auto-choir-rule"
      },
      "confidence": "VERIFIED_FROZEN"
    },
    {
      "canonicalRecordId": "skitarii-hunter-cohort-rule",
      "sourceKind": "detachment-rule",
      "sourceBookId": "adeptus-mechanicus",
      "effectiveBookIds": [
        "adeptus-mechanicus"
      ],
      "detachmentId": "detachment-skitarii-hunter-cohort",
      "scope": "selected-detachment",
      "selector": {
        "kind": "selected-detachment",
        "detachmentId": "detachment-skitarii-hunter-cohort"
      },
      "clauses": [
        {
          "selector": {
            "subject": "unit",
            "anyOf": [
              {
                "allKeywords": [
                  "SKITARII",
                  "INFANTRY"
                ]
              },
              {
                "allKeywords": [
                  "SKITARII",
                  "MOUNTED"
                ]
              },
              {
                "allKeywords": [
                  "IRONSTRIDER BALLISTARII"
                ]
              }
            ]
          },
          "conditions": [],
          "operations": [
            {
              "id": "skitarii-hunter-stealth",
              "type": "ABILITY_GRANT",
              "canonicalTarget": "core-stealth",
              "parameters": {}
            }
          ]
        }
      ],
      "timingState": {
        "kind": "always"
      },
      "stackingPolicy": "apply-once-per-source",
      "source": {
        "sourceId": "adeptus-mechanicus-codex-carry-forward",
        "locator": "content/adeptus-mechanicus-codex-detachments.en.json#skitarii-hunter-cohort-rule"
      },
      "confidence": "SOURCE_LIMITED"
    },
    {
      "canonicalRecordId": "enhancement-arch-negator",
      "sourceKind": "enhancement",
      "sourceBookId": "adeptus-mechanicus",
      "effectiveBookIds": [
        "adeptus-mechanicus"
      ],
      "detachmentId": "detachment-cohort-cybernetica",
      "scope": "bearer",
      "selector": {
        "kind": "assigned-enhancement",
        "canonicalRecordId": "enhancement-arch-negator"
      },
      "clauses": [
        {
          "selector": {
            "subject": "bearer",
            "weaponMode": "ranged"
          },
          "conditions": [],
          "operations": [
            {
              "id": "arch-negator-anti-vehicle",
              "type": "WEAPON_TAG_GRANT",
              "canonicalTarget": "ranged",
              "parameters": {
                "tag": "ANTI-VEHICLE 4+",
                "termId": "core-anti"
              }
            }
          ]
        }
      ],
      "timingState": {
        "kind": "always"
      },
      "stackingPolicy": "apply-once-per-source",
      "source": {
        "sourceId": "adeptus-mechanicus-codex-carry-forward",
        "locator": "content/adeptus-mechanicus-codex-detachments.en.json#enhancement-arch-negator"
      },
      "confidence": "SOURCE_LIMITED"
    },
    {
      "canonicalRecordId": "enhancement-artisan",
      "sourceKind": "enhancement",
      "sourceBookId": "adeptus-mechanicus",
      "effectiveBookIds": [
        "adeptus-mechanicus"
      ],
      "detachmentId": "detachment-explorator-maniple",
      "scope": "attached-unit",
      "selector": {
        "kind": "assigned-enhancement",
        "canonicalRecordId": "enhancement-artisan"
      },
      "clauses": [
        {
          "selector": {
            "subject": "attached-unit"
          },
          "conditions": [
            {
              "kind": "attachment-state",
              "value": "attached"
            },
            {
              "kind": "manual-resolution",
              "state": "unknown"
            }
          ],
          "operations": [
            {
              "id": "enhancement-artisan-reference",
              "type": "CANONICAL_REFERENCE",
              "canonicalTarget": "enhancement-artisan",
              "parameters": {
                "referenceKind": "enhancement"
              }
            }
          ]
        }
      ],
      "timingState": {
        "kind": "conditional",
        "state": "unknown"
      },
      "stackingPolicy": "apply-once-per-source",
      "source": {
        "sourceId": "adeptus-mechanicus-codex-carry-forward",
        "locator": "content/adeptus-mechanicus-codex-detachments.en.json#enhancement-artisan"
      },
      "confidence": "SOURCE_LIMITED"
    },
    {
      "canonicalRecordId": "enhancement-autoclavic-denunciation",
      "sourceKind": "enhancement",
      "sourceBookId": "adeptus-mechanicus",
      "effectiveBookIds": [
        "adeptus-mechanicus"
      ],
      "detachmentId": "detachment-rad-zone-corps",
      "scope": "bearer",
      "selector": {
        "kind": "assigned-enhancement",
        "canonicalRecordId": "enhancement-autoclavic-denunciation"
      },
      "clauses": [
        {
          "selector": {
            "subject": "bearer",
            "weaponMode": "ranged"
          },
          "conditions": [],
          "operations": [
            {
              "id": "autoclavic-anti-infantry",
              "type": "WEAPON_TAG_GRANT",
              "canonicalTarget": "ranged",
              "parameters": {
                "tag": "ANTI-INFANTRY 2+",
                "termId": "core-anti"
              }
            },
            {
              "id": "autoclavic-anti-monster",
              "type": "WEAPON_TAG_GRANT",
              "canonicalTarget": "ranged",
              "parameters": {
                "tag": "ANTI-MONSTER 4+",
                "termId": "core-anti"
              }
            }
          ]
        }
      ],
      "timingState": {
        "kind": "always"
      },
      "stackingPolicy": "apply-once-per-source",
      "source": {
        "sourceId": "adeptus-mechanicus-codex-carry-forward",
        "locator": "content/adeptus-mechanicus-codex-detachments.en.json#enhancement-autoclavic-denunciation"
      },
      "confidence": "SOURCE_LIMITED"
    },
    {
      "canonicalRecordId": "enhancement-battle-sphere-uplink",
      "sourceKind": "enhancement",
      "sourceBookId": "adeptus-mechanicus",
      "effectiveBookIds": [
        "adeptus-mechanicus"
      ],
      "detachmentId": "detachment-skitarii-hunter-cohort",
      "scope": "attached-unit",
      "selector": {
        "kind": "assigned-enhancement",
        "canonicalRecordId": "enhancement-battle-sphere-uplink"
      },
      "clauses": [
        {
          "selector": {
            "subject": "attached-unit"
          },
          "conditions": [
            {
              "kind": "attachment-state",
              "value": "attached"
            },
            {
              "kind": "manual-resolution",
              "state": "unknown"
            }
          ],
          "operations": [
            {
              "id": "enhancement-battle-sphere-uplink-reference",
              "type": "CANONICAL_REFERENCE",
              "canonicalTarget": "enhancement-battle-sphere-uplink",
              "parameters": {
                "referenceKind": "enhancement"
              }
            }
          ]
        }
      ],
      "timingState": {
        "kind": "conditional",
        "state": "unknown"
      },
      "stackingPolicy": "apply-once-per-source",
      "source": {
        "sourceId": "adeptus-mechanicus-codex-carry-forward",
        "locator": "content/adeptus-mechanicus-codex-detachments.en.json#enhancement-battle-sphere-uplink"
      },
      "confidence": "SOURCE_LIMITED"
    },
    {
      "canonicalRecordId": "enhancement-belicosa-class-capacitor-vanes",
      "sourceKind": "enhancement",
      "sourceBookId": "adeptus-mechanicus",
      "effectiveBookIds": [
        "adeptus-mechanicus"
      ],
      "detachmentId": "detachment-eradication-cohort",
      "scope": "owner-or-attached-group",
      "selector": {
        "kind": "assigned-enhancement",
        "canonicalRecordId": "enhancement-belicosa-class-capacitor-vanes"
      },
      "clauses": [
        {
          "selector": {
            "scope": "owner-or-attached-group",
            "weaponMode": "ranged"
          },
          "conditions": [],
          "operations": [
            {
              "id": "belicosa-range",
              "type": "WEAPON_CHARACTERISTIC_ADD",
              "canonicalTarget": "ranged",
              "parameters": {
                "characteristic": "Range",
                "value": 6
              }
            },
            {
              "id": "belicosa-strength",
              "type": "WEAPON_CHARACTERISTIC_ADD",
              "canonicalTarget": "ranged",
              "parameters": {
                "characteristic": "S",
                "value": 1
              }
            }
          ]
        }
      ],
      "timingState": {
        "kind": "always"
      },
      "stackingPolicy": "apply-once-per-source",
      "source": {
        "sourceId": "adeptus-mechanicus-faction-pack-v1.2",
        "locator": "content/adeptus-mechanicus-rules.en.json#enhancement-belicosa-class-capacitor-vanes"
      },
      "confidence": "VERIFIED_FROZEN"
    },
    {
      "canonicalRecordId": "enhancement-clandestine-infiltrator",
      "sourceKind": "enhancement",
      "sourceBookId": "adeptus-mechanicus",
      "effectiveBookIds": [
        "adeptus-mechanicus"
      ],
      "detachmentId": "detachment-skitarii-hunter-cohort",
      "scope": "bearer",
      "selector": {
        "kind": "assigned-enhancement",
        "canonicalRecordId": "enhancement-clandestine-infiltrator"
      },
      "clauses": [
        {
          "selector": {
            "subject": "bearer"
          },
          "conditions": [],
          "operations": [
            {
              "id": "clandestine-infiltrators",
              "type": "ABILITY_GRANT",
              "canonicalTarget": "core-infiltrators",
              "parameters": {}
            },
            {
              "id": "clandestine-scouts",
              "type": "ABILITY_GRANT",
              "canonicalTarget": "core-scouts",
              "parameters": {
                "distance": 6
              }
            }
          ]
        }
      ],
      "timingState": {
        "kind": "always"
      },
      "stackingPolicy": "apply-once-per-source",
      "source": {
        "sourceId": "adeptus-mechanicus-codex-carry-forward",
        "locator": "content/adeptus-mechanicus-codex-detachments.en.json#enhancement-clandestine-infiltrator"
      },
      "confidence": "SOURCE_LIMITED"
    },
    {
      "canonicalRecordId": "enhancement-cognitive-reinforcement",
      "sourceKind": "enhancement",
      "sourceBookId": "adeptus-mechanicus",
      "effectiveBookIds": [
        "adeptus-mechanicus"
      ],
      "detachmentId": "detachment-haloscreed-battle-clade",
      "scope": "attached-unit",
      "selector": {
        "kind": "assigned-enhancement",
        "canonicalRecordId": "enhancement-cognitive-reinforcement"
      },
      "clauses": [
        {
          "selector": {
            "subject": "attached-unit"
          },
          "conditions": [
            {
              "kind": "attachment-state",
              "value": "attached"
            }
          ],
          "operations": [
            {
              "id": "cognitive-heavy",
              "type": "WEAPON_TAG_GRANT",
              "canonicalTarget": "ranged",
              "parameters": {
                "tag": "HEAVY",
                "termId": "core-heavy"
              }
            },
            {
              "id": "cognitive-assault",
              "type": "WEAPON_TAG_GRANT",
              "canonicalTarget": "ranged",
              "parameters": {
                "tag": "ASSAULT",
                "termId": "core-assault"
              }
            },
            {
              "id": "cognitive-bs",
              "type": "WEAPON_CHARACTERISTIC_ADD",
              "canonicalTarget": "ranged",
              "parameters": {
                "characteristic": "BS",
                "value": -1
              }
            },
            {
              "id": "cognitive-ws",
              "type": "WEAPON_CHARACTERISTIC_ADD",
              "canonicalTarget": "melee",
              "parameters": {
                "characteristic": "WS",
                "value": -1
              }
            }
          ]
        },
        {
          "selector": {
            "subject": "attached-unit"
          },
          "conditions": [
            {
              "kind": "attachment-state",
              "value": "attached"
            },
            {
              "kind": "unit-keyword",
              "keyword": "BATTLELINE"
            }
          ],
          "operations": [
            {
              "id": "cognitive-ap-ranged",
              "type": "WEAPON_CHARACTERISTIC_ADD",
              "canonicalTarget": "ranged",
              "parameters": {
                "characteristic": "AP",
                "value": -1
              }
            },
            {
              "id": "cognitive-ap-melee",
              "type": "WEAPON_CHARACTERISTIC_ADD",
              "canonicalTarget": "melee",
              "parameters": {
                "characteristic": "AP",
                "value": -1
              }
            }
          ]
        }
      ],
      "timingState": {
        "kind": "while-attached"
      },
      "stackingPolicy": "apply-once-per-source",
      "source": {
        "sourceId": "adeptus-mechanicus-faction-pack-v1.2",
        "locator": "content/adeptus-mechanicus-rules.en.json#enhancement-cognitive-reinforcement"
      },
      "confidence": "VERIFIED_FROZEN"
    },
    {
      "canonicalRecordId": "enhancement-data-blessed-autosermon",
      "sourceKind": "enhancement",
      "sourceBookId": "adeptus-mechanicus",
      "effectiveBookIds": [
        "adeptus-mechanicus"
      ],
      "detachmentId": "detachment-data-psalm-conclave",
      "scope": "attached-unit",
      "selector": {
        "kind": "assigned-enhancement",
        "canonicalRecordId": "enhancement-data-blessed-autosermon"
      },
      "clauses": [
        {
          "selector": {
            "subject": "attached-unit"
          },
          "conditions": [
            {
              "kind": "attachment-state",
              "value": "attached"
            },
            {
              "kind": "manual-resolution",
              "state": "unknown"
            }
          ],
          "operations": [
            {
              "id": "enhancement-data-blessed-autosermon-reference",
              "type": "CANONICAL_REFERENCE",
              "canonicalTarget": "enhancement-data-blessed-autosermon",
              "parameters": {
                "referenceKind": "enhancement"
              }
            }
          ]
        }
      ],
      "timingState": {
        "kind": "conditional",
        "state": "unknown"
      },
      "stackingPolicy": "apply-once-per-source",
      "source": {
        "sourceId": "adeptus-mechanicus-codex-carry-forward",
        "locator": "content/adeptus-mechanicus-codex-detachments.en.json#enhancement-data-blessed-autosermon"
      },
      "confidence": "SOURCE_LIMITED"
    },
    {
      "canonicalRecordId": "enhancement-electromiasmic-brazier",
      "sourceKind": "enhancement",
      "sourceBookId": "adeptus-mechanicus",
      "effectiveBookIds": [
        "adeptus-mechanicus"
      ],
      "detachmentId": "detachment-luminen-auto-choir",
      "scope": "attached-unit",
      "selector": {
        "kind": "assigned-enhancement",
        "canonicalRecordId": "enhancement-electromiasmic-brazier"
      },
      "clauses": [
        {
          "selector": {
            "subject": "attached-unit"
          },
          "conditions": [
            {
              "kind": "attachment-state",
              "value": "attached"
            }
          ],
          "operations": [
            {
              "id": "electromiasmic-stealth",
              "type": "ABILITY_GRANT",
              "canonicalTarget": "core-stealth",
              "parameters": {}
            }
          ]
        }
      ],
      "timingState": {
        "kind": "while-attached"
      },
      "stackingPolicy": "apply-once-per-source",
      "source": {
        "sourceId": "adeptus-mechanicus-faction-pack-v1.2",
        "locator": "content/adeptus-mechanicus-rules.en.json#enhancement-electromiasmic-brazier"
      },
      "confidence": "VERIFIED_FROZEN"
    },
    {
      "canonicalRecordId": "enhancement-explorator-dispensation",
      "sourceKind": "enhancement",
      "sourceBookId": "adeptus-mechanicus",
      "effectiveBookIds": [
        "adeptus-mechanicus"
      ],
      "detachmentId": "detachment-cohort-acquisitus",
      "scope": "bearer",
      "selector": {
        "kind": "assigned-enhancement",
        "canonicalRecordId": "enhancement-explorator-dispensation"
      },
      "clauses": [
        {
          "selector": {
            "subject": "bearer"
          },
          "conditions": [],
          "operations": [
            {
              "id": "explorator-infiltrators",
              "type": "ABILITY_GRANT",
              "canonicalTarget": "core-infiltrators",
              "parameters": {}
            }
          ]
        }
      ],
      "timingState": {
        "kind": "always"
      },
      "stackingPolicy": "apply-once-per-source",
      "source": {
        "sourceId": "adeptus-mechanicus-faction-pack-v1.2",
        "locator": "content/adeptus-mechanicus-rules.en.json#enhancement-explorator-dispensation"
      },
      "confidence": "VERIFIED_FROZEN"
    },
    {
      "canonicalRecordId": "enhancement-genetor",
      "sourceKind": "enhancement",
      "sourceBookId": "adeptus-mechanicus",
      "effectiveBookIds": [
        "adeptus-mechanicus"
      ],
      "detachmentId": "detachment-explorator-maniple",
      "scope": "attached-unit",
      "selector": {
        "kind": "assigned-enhancement",
        "canonicalRecordId": "enhancement-genetor"
      },
      "clauses": [
        {
          "selector": {
            "subject": "attached-unit"
          },
          "conditions": [
            {
              "kind": "attachment-state",
              "value": "attached"
            },
            {
              "kind": "manual-resolution",
              "state": "unknown"
            }
          ],
          "operations": [
            {
              "id": "enhancement-genetor-reference",
              "type": "CANONICAL_REFERENCE",
              "canonicalTarget": "enhancement-genetor",
              "parameters": {
                "referenceKind": "enhancement"
              }
            }
          ]
        }
      ],
      "timingState": {
        "kind": "conditional",
        "state": "unknown"
      },
      "stackingPolicy": "apply-once-per-source",
      "source": {
        "sourceId": "adeptus-mechanicus-codex-carry-forward",
        "locator": "content/adeptus-mechanicus-codex-detachments.en.json#enhancement-genetor"
      },
      "confidence": "SOURCE_LIMITED"
    },
    {
      "canonicalRecordId": "enhancement-inloaded-lethality",
      "sourceKind": "enhancement",
      "sourceBookId": "adeptus-mechanicus",
      "effectiveBookIds": [
        "adeptus-mechanicus"
      ],
      "detachmentId": "detachment-haloscreed-battle-clade",
      "scope": "bearer",
      "selector": {
        "kind": "assigned-enhancement",
        "canonicalRecordId": "enhancement-inloaded-lethality"
      },
      "clauses": [
        {
          "selector": {
            "subject": "bearer",
            "weaponMode": "melee"
          },
          "conditions": [],
          "operations": [
            {
              "id": "inloaded-attacks",
              "type": "WEAPON_CHARACTERISTIC_ADD",
              "canonicalTarget": "melee",
              "parameters": {
                "characteristic": "A",
                "value": 3
              }
            },
            {
              "id": "inloaded-damage",
              "type": "WEAPON_CHARACTERISTIC_ADD",
              "canonicalTarget": "melee",
              "parameters": {
                "characteristic": "D",
                "value": 1
              }
            }
          ]
        }
      ],
      "timingState": {
        "kind": "always"
      },
      "stackingPolicy": "apply-once-per-source",
      "source": {
        "sourceId": "adeptus-mechanicus-faction-pack-v1.2",
        "locator": "content/adeptus-mechanicus-rules.en.json#enhancement-inloaded-lethality"
      },
      "confidence": "VERIFIED_FROZEN"
    },
    {
      "canonicalRecordId": "enhancement-logis",
      "sourceKind": "enhancement",
      "sourceBookId": "adeptus-mechanicus",
      "effectiveBookIds": [
        "adeptus-mechanicus"
      ],
      "detachmentId": "detachment-explorator-maniple",
      "scope": "attached-unit",
      "selector": {
        "kind": "assigned-enhancement",
        "canonicalRecordId": "enhancement-logis"
      },
      "clauses": [
        {
          "selector": {
            "subject": "attached-unit"
          },
          "conditions": [
            {
              "kind": "attachment-state",
              "value": "attached"
            },
            {
              "kind": "manual-resolution",
              "state": "unknown"
            }
          ],
          "operations": [
            {
              "id": "enhancement-logis-reference",
              "type": "CANONICAL_REFERENCE",
              "canonicalTarget": "enhancement-logis",
              "parameters": {
                "referenceKind": "enhancement"
              }
            }
          ]
        }
      ],
      "timingState": {
        "kind": "conditional",
        "state": "unknown"
      },
      "stackingPolicy": "apply-once-per-source",
      "source": {
        "sourceId": "adeptus-mechanicus-codex-carry-forward",
        "locator": "content/adeptus-mechanicus-codex-detachments.en.json#enhancement-logis"
      },
      "confidence": "SOURCE_LIMITED"
    },
    {
      "canonicalRecordId": "enhancement-malphonic-susurrus",
      "sourceKind": "enhancement",
      "sourceBookId": "adeptus-mechanicus",
      "effectiveBookIds": [
        "adeptus-mechanicus"
      ],
      "detachmentId": "detachment-rad-zone-corps",
      "scope": "attached-unit",
      "selector": {
        "kind": "assigned-enhancement",
        "canonicalRecordId": "enhancement-malphonic-susurrus"
      },
      "clauses": [
        {
          "selector": {
            "subject": "attached-unit"
          },
          "conditions": [
            {
              "kind": "attachment-state",
              "value": "attached"
            }
          ],
          "operations": [
            {
              "id": "malphonic-stealth",
              "type": "ABILITY_GRANT",
              "canonicalTarget": "core-stealth",
              "parameters": {}
            }
          ]
        }
      ],
      "timingState": {
        "kind": "while-attached"
      },
      "stackingPolicy": "apply-once-per-source",
      "source": {
        "sourceId": "adeptus-mechanicus-codex-carry-forward",
        "locator": "content/adeptus-mechanicus-codex-detachments.en.json#enhancement-malphonic-susurrus"
      },
      "confidence": "SOURCE_LIMITED"
    },
    {
      "canonicalRecordId": "enhancement-martial-signatum-amplificator",
      "sourceKind": "enhancement",
      "sourceBookId": "adeptus-mechanicus",
      "effectiveBookIds": [
        "adeptus-mechanicus"
      ],
      "detachmentId": "detachment-eradication-cohort",
      "scope": "bearer",
      "selector": {
        "kind": "assigned-enhancement",
        "canonicalRecordId": "enhancement-martial-signatum-amplificator"
      },
      "clauses": [
        {
          "selector": {
            "subject": "bearer"
          },
          "conditions": [],
          "operations": [
            {
              "id": "martial-skitarii",
              "type": "KEYWORD_GRANT",
              "canonicalTarget": "SKITARII",
              "parameters": {}
            }
          ]
        }
      ],
      "timingState": {
        "kind": "always"
      },
      "stackingPolicy": "apply-once-per-source",
      "source": {
        "sourceId": "adeptus-mechanicus-faction-pack-v1.2",
        "locator": "content/adeptus-mechanicus-rules.en.json#enhancement-martial-signatum-amplificator"
      },
      "confidence": "VERIFIED_FROZEN"
    },
    {
      "canonicalRecordId": "enhancement-mechanicus-locum",
      "sourceKind": "enhancement",
      "sourceBookId": "adeptus-mechanicus",
      "effectiveBookIds": [
        "adeptus-mechanicus"
      ],
      "detachmentId": "detachment-data-psalm-conclave",
      "scope": "bearer",
      "selector": {
        "kind": "assigned-enhancement",
        "canonicalRecordId": "enhancement-mechanicus-locum"
      },
      "clauses": [
        {
          "selector": {
            "subject": "bearer"
          },
          "conditions": [],
          "operations": [
            {
              "id": "mechanicus-locum-leadership",
              "type": "CHARACTERISTIC_SET",
              "canonicalTarget": "Ld",
              "parameters": {
                "value": "6+"
              }
            }
          ]
        }
      ],
      "timingState": {
        "kind": "always"
      },
      "stackingPolicy": "apply-once-per-source",
      "source": {
        "sourceId": "adeptus-mechanicus-codex-carry-forward",
        "locator": "content/adeptus-mechanicus-codex-detachments.en.json#enhancement-mechanicus-locum"
      },
      "confidence": "SOURCE_LIMITED"
    },
    {
      "canonicalRecordId": "enhancement-omnicogitator",
      "sourceKind": "enhancement",
      "sourceBookId": "adeptus-mechanicus",
      "effectiveBookIds": [
        "adeptus-mechanicus"
      ],
      "detachmentId": "detachment-eradication-cohort",
      "scope": "attached-unit",
      "selector": {
        "kind": "assigned-enhancement",
        "canonicalRecordId": "enhancement-omnicogitator"
      },
      "clauses": [
        {
          "selector": {
            "subject": "attached-unit"
          },
          "conditions": [
            {
              "kind": "attachment-state",
              "value": "attached"
            }
          ],
          "operations": [
            {
              "id": "omnicogitator-heavy",
              "type": "WEAPON_TAG_GRANT",
              "canonicalTarget": "ranged",
              "parameters": {
                "tag": "HEAVY",
                "termId": "core-heavy"
              }
            },
            {
              "id": "omnicogitator-assault",
              "type": "WEAPON_TAG_GRANT",
              "canonicalTarget": "ranged",
              "parameters": {
                "tag": "ASSAULT",
                "termId": "core-assault"
              }
            },
            {
              "id": "omnicogitator-bs",
              "type": "WEAPON_CHARACTERISTIC_ADD",
              "canonicalTarget": "ranged",
              "parameters": {
                "characteristic": "BS",
                "value": -1
              }
            },
            {
              "id": "omnicogitator-ws",
              "type": "WEAPON_CHARACTERISTIC_ADD",
              "canonicalTarget": "melee",
              "parameters": {
                "characteristic": "WS",
                "value": -1
              }
            }
          ]
        },
        {
          "selector": {
            "subject": "attached-unit"
          },
          "conditions": [
            {
              "kind": "attachment-state",
              "value": "attached"
            },
            {
              "kind": "unit-keyword",
              "keyword": "BATTLELINE"
            }
          ],
          "operations": [
            {
              "id": "omnicogitator-ap-ranged",
              "type": "WEAPON_CHARACTERISTIC_ADD",
              "canonicalTarget": "ranged",
              "parameters": {
                "characteristic": "AP",
                "value": -1
              }
            },
            {
              "id": "omnicogitator-ap-melee",
              "type": "WEAPON_CHARACTERISTIC_ADD",
              "canonicalTarget": "melee",
              "parameters": {
                "characteristic": "AP",
                "value": -1
              }
            }
          ]
        }
      ],
      "timingState": {
        "kind": "while-attached"
      },
      "stackingPolicy": "apply-once-per-source",
      "source": {
        "sourceId": "adeptus-mechanicus-faction-pack-v1.2",
        "locator": "content/adeptus-mechanicus-rules.en.json#enhancement-omnicogitator"
      },
      "confidence": "VERIFIED_FROZEN"
    },
    {
      "canonicalRecordId": "enhancement-omnissiahs-fury",
      "sourceKind": "enhancement",
      "sourceBookId": "adeptus-mechanicus",
      "effectiveBookIds": [
        "adeptus-mechanicus"
      ],
      "detachmentId": "detachment-eradication-cohort",
      "scope": "bearer",
      "selector": {
        "kind": "assigned-enhancement",
        "canonicalRecordId": "enhancement-omnissiahs-fury"
      },
      "clauses": [
        {
          "selector": {
            "subject": "bearer",
            "weaponMode": "melee"
          },
          "conditions": [],
          "operations": [
            {
              "id": "omnissiahs-attacks",
              "type": "WEAPON_CHARACTERISTIC_ADD",
              "canonicalTarget": "melee",
              "parameters": {
                "characteristic": "A",
                "value": 2
              }
            },
            {
              "id": "omnissiahs-ap",
              "type": "WEAPON_CHARACTERISTIC_ADD",
              "canonicalTarget": "melee",
              "parameters": {
                "characteristic": "AP",
                "value": -1
              }
            },
            {
              "id": "omnissiahs-damage",
              "type": "WEAPON_CHARACTERISTIC_ADD",
              "canonicalTarget": "melee",
              "parameters": {
                "characteristic": "D",
                "value": 1
              }
            }
          ]
        }
      ],
      "timingState": {
        "kind": "always"
      },
      "stackingPolicy": "apply-once-per-source",
      "source": {
        "sourceId": "adeptus-mechanicus-faction-pack-v1.2",
        "locator": "content/adeptus-mechanicus-rules.en.json#enhancement-omnissiahs-fury"
      },
      "confidence": "VERIFIED_FROZEN"
    },
    {
      "canonicalRecordId": "enhancement-peerless-eradicator",
      "sourceKind": "enhancement",
      "sourceBookId": "adeptus-mechanicus",
      "effectiveBookIds": [
        "adeptus-mechanicus"
      ],
      "detachmentId": "detachment-rad-zone-corps",
      "scope": "attached-unit",
      "selector": {
        "kind": "assigned-enhancement",
        "canonicalRecordId": "enhancement-peerless-eradicator"
      },
      "clauses": [
        {
          "selector": {
            "subject": "attached-unit",
            "weaponMode": "ranged"
          },
          "conditions": [
            {
              "kind": "attachment-state",
              "value": "attached"
            }
          ],
          "operations": [
            {
              "id": "peerless-sustained-hits",
              "type": "WEAPON_TAG_GRANT",
              "canonicalTarget": "ranged",
              "parameters": {
                "tag": "SUSTAINED HITS 1",
                "termId": "core-sustained-hits"
              }
            }
          ]
        }
      ],
      "timingState": {
        "kind": "while-attached"
      },
      "stackingPolicy": "apply-once-per-source",
      "source": {
        "sourceId": "adeptus-mechanicus-codex-carry-forward",
        "locator": "content/adeptus-mechanicus-codex-detachments.en.json#enhancement-peerless-eradicator"
      },
      "confidence": "SOURCE_LIMITED"
    },
    {
      "canonicalRecordId": "enhancement-sanctified-ordnance",
      "sourceKind": "enhancement",
      "sourceBookId": "adeptus-mechanicus",
      "effectiveBookIds": [
        "adeptus-mechanicus"
      ],
      "detachmentId": "detachment-haloscreed-battle-clade",
      "scope": "attached-unit",
      "selector": {
        "kind": "assigned-enhancement",
        "canonicalRecordId": "enhancement-sanctified-ordnance"
      },
      "clauses": [
        {
          "selector": {
            "subject": "attached-unit",
            "weaponMode": "ranged"
          },
          "conditions": [
            {
              "kind": "attachment-state",
              "value": "attached"
            }
          ],
          "operations": [
            {
              "id": "sanctified-range",
              "type": "WEAPON_CHARACTERISTIC_ADD",
              "canonicalTarget": "ranged",
              "parameters": {
                "characteristic": "Range",
                "value": 6
              }
            },
            {
              "id": "sanctified-reference",
              "type": "CANONICAL_REFERENCE",
              "canonicalTarget": "enhancement-sanctified-ordnance",
              "parameters": {
                "referenceKind": "enhancement"
              }
            }
          ]
        }
      ],
      "timingState": {
        "kind": "while-attached"
      },
      "stackingPolicy": "apply-once-per-source",
      "source": {
        "sourceId": "adeptus-mechanicus-faction-pack-v1.2",
        "locator": "content/adeptus-mechanicus-rules.en.json#enhancement-sanctified-ordnance"
      },
      "confidence": "VERIFIED_FROZEN"
    },
    {
      "canonicalRecordId": "enhancement-stealth-screened-cybercanids-upgrade",
      "sourceKind": "enhancement",
      "sourceBookId": "adeptus-mechanicus",
      "effectiveBookIds": [
        "adeptus-mechanicus"
      ],
      "detachmentId": "detachment-cohort-acquisitus",
      "scope": "upgraded-unit",
      "selector": {
        "kind": "assigned-enhancement",
        "canonicalRecordId": "enhancement-stealth-screened-cybercanids-upgrade"
      },
      "clauses": [
        {
          "selector": {
            "subject": "upgraded-unit"
          },
          "conditions": [],
          "operations": [
            {
              "id": "cybercanids-lone-operative",
              "type": "ABILITY_GRANT",
              "canonicalTarget": "core-lone-operative",
              "parameters": {
                "distance": 15
              }
            }
          ]
        }
      ],
      "timingState": {
        "kind": "always"
      },
      "stackingPolicy": "apply-once-per-source",
      "source": {
        "sourceId": "adeptus-mechanicus-faction-pack-v1.2",
        "locator": "content/adeptus-mechanicus-rules.en.json#enhancement-stealth-screened-cybercanids-upgrade"
      },
      "confidence": "VERIFIED_FROZEN"
    },
    {
      "canonicalRecordId": "enhancement-temporcopia",
      "sourceKind": "enhancement",
      "sourceBookId": "adeptus-mechanicus",
      "effectiveBookIds": [
        "adeptus-mechanicus"
      ],
      "detachmentId": "detachment-data-psalm-conclave",
      "scope": "attached-unit",
      "selector": {
        "kind": "assigned-enhancement",
        "canonicalRecordId": "enhancement-temporcopia"
      },
      "clauses": [
        {
          "selector": {
            "subject": "attached-unit"
          },
          "conditions": [
            {
              "kind": "attachment-state",
              "value": "attached"
            }
          ],
          "operations": [
            {
              "id": "temporcopia-fights-first",
              "type": "ABILITY_GRANT",
              "canonicalTarget": "core-fights-first",
              "parameters": {}
            }
          ]
        }
      ],
      "timingState": {
        "kind": "while-attached"
      },
      "stackingPolicy": "apply-once-per-source",
      "source": {
        "sourceId": "adeptus-mechanicus-codex-carry-forward",
        "locator": "content/adeptus-mechanicus-codex-detachments.en.json#enhancement-temporcopia"
      },
      "confidence": "SOURCE_LIMITED"
    },
    {
      "canonicalRecordId": "enhancement-tl-4-9",
      "sourceKind": "enhancement",
      "sourceBookId": "adeptus-mechanicus",
      "effectiveBookIds": [
        "adeptus-mechanicus"
      ],
      "detachmentId": "detachment-lords-of-the-forge",
      "scope": "bearer",
      "selector": {
        "kind": "assigned-enhancement",
        "canonicalRecordId": "enhancement-tl-4-9"
      },
      "clauses": [
        {
          "selector": {
            "subject": "bearer"
          },
          "conditions": [],
          "operations": [
            {
              "id": "tl-4-9-profile",
              "type": "WEAPON_PROFILE_GRANT",
              "canonicalTarget": "enhancement-tl-4-9-profile",
              "parameters": {
                "profileSource": "canonical-record",
                "profile": {
                  "name": "TL-409",
                  "mode": "ranged",
                  "range": "24\"",
                  "a": "3",
                  "skill": "2+",
                  "s": "11",
                  "ap": "-2",
                  "d": "D3+2",
                  "abilities": "Devastating Wounds, Hazardous"
                }
              }
            }
          ]
        }
      ],
      "timingState": {
        "kind": "always"
      },
      "stackingPolicy": "apply-once-per-source",
      "source": {
        "sourceId": "adeptus-mechanicus-faction-pack-v1.2",
        "locator": "content/adeptus-mechanicus-rules.en.json#enhancement-tl-4-9"
      },
      "confidence": "VERIFIED_FROZEN"
    },
    {
      "canonicalRecordId": "enhancement-transoracular-dyad-wafers",
      "sourceKind": "enhancement",
      "sourceBookId": "adeptus-mechanicus",
      "effectiveBookIds": [
        "adeptus-mechanicus"
      ],
      "detachmentId": "detachment-haloscreed-battle-clade",
      "scope": "attached-unit",
      "selector": {
        "kind": "assigned-enhancement",
        "canonicalRecordId": "enhancement-transoracular-dyad-wafers"
      },
      "clauses": [
        {
          "selector": {
            "subject": "attached-unit",
            "attachmentGroup": {
              "allUnitIds": [
                "unit-cybernetica-datasmith",
                "unit-kastelan-robots"
              ]
            }
          },
          "conditions": [
            {
              "kind": "attachment-state",
              "value": "attached"
            }
          ],
          "operations": [
            {
              "id": "transoracular-halo-override",
              "type": "KEYWORD_GRANT",
              "canonicalTarget": "HALO OVERRIDE",
              "parameters": {}
            },
            {
              "id": "transoracular-reference",
              "type": "CANONICAL_REFERENCE",
              "canonicalTarget": "enhancement-transoracular-dyad-wafers",
              "parameters": {
                "referenceKind": "enhancement"
              }
            }
          ]
        }
      ],
      "timingState": {
        "kind": "while-attached"
      },
      "stackingPolicy": "apply-once-per-source",
      "source": {
        "sourceId": "adeptus-mechanicus-faction-pack-v1.2",
        "locator": "content/adeptus-mechanicus-rules.en.json#enhancement-transoracular-dyad-wafers"
      },
      "confidence": "VERIFIED_FROZEN"
    },
    {
      "canonicalRecordId": "enhancement-vinghs-wafers-of-dynamism",
      "sourceKind": "enhancement",
      "sourceBookId": "adeptus-mechanicus",
      "effectiveBookIds": [
        "adeptus-mechanicus"
      ],
      "detachmentId": "detachment-lords-of-the-forge",
      "scope": "attached-unit",
      "selector": {
        "kind": "assigned-enhancement",
        "canonicalRecordId": "enhancement-vinghs-wafers-of-dynamism"
      },
      "clauses": [
        {
          "selector": {
            "subject": "attached-unit"
          },
          "conditions": [
            {
              "kind": "attachment-state",
              "value": "attached"
            }
          ],
          "operations": [
            {
              "id": "vinghs-mobile",
              "type": "KEYWORD_GRANT",
              "canonicalTarget": "MOBILE",
              "parameters": {}
            }
          ]
        }
      ],
      "timingState": {
        "kind": "while-attached"
      },
      "stackingPolicy": "apply-once-per-source",
      "source": {
        "sourceId": "adeptus-mechanicus-faction-pack-v1.2",
        "locator": "content/adeptus-mechanicus-rules.en.json#enhancement-vinghs-wafers-of-dynamism"
      },
      "confidence": "VERIFIED_FROZEN"
    },
    {
      "canonicalRecordId": "enhancement-voltagheist-reliquary",
      "sourceKind": "enhancement",
      "sourceBookId": "adeptus-mechanicus",
      "effectiveBookIds": [
        "adeptus-mechanicus"
      ],
      "detachmentId": "detachment-luminen-auto-choir",
      "scope": "attached-unit",
      "selector": {
        "kind": "assigned-enhancement",
        "canonicalRecordId": "enhancement-voltagheist-reliquary"
      },
      "clauses": [
        {
          "selector": {
            "subject": "attached-unit"
          },
          "conditions": [
            {
              "kind": "attachment-state",
              "value": "attached"
            },
            {
              "kind": "manual-resolution",
              "state": "unknown"
            }
          ],
          "operations": [
            {
              "id": "voltagheist-reference",
              "type": "CANONICAL_REFERENCE",
              "canonicalTarget": "enhancement-voltagheist-reliquary",
              "parameters": {
                "referenceKind": "enhancement"
              }
            }
          ]
        }
      ],
      "timingState": {
        "kind": "conditional",
        "state": "unknown"
      },
      "stackingPolicy": "apply-once-per-source",
      "source": {
        "sourceId": "adeptus-mechanicus-faction-pack-v1.2",
        "locator": "content/adeptus-mechanicus-rules.en.json#enhancement-voltagheist-reliquary"
      },
      "confidence": "VERIFIED_FROZEN"
    }
  ]
});
window.WH_BOOK_ROSTER_ENHANCEMENTS=Object.freeze({});

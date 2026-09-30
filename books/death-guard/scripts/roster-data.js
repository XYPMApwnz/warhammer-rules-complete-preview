window.WH_BOOK_ROSTER_CATALOG=Object.freeze({
  "schema": "wh40k-army-roster-catalog/v1",
  "book": {
    "id": "death-guard",
    "title": "Death Guard",
    "factionKeyword": "DEATH GUARD",
    "parentBookId": null,
    "dependencies": []
  },
  "compositionConstraints": true,
  "units": [
    {
      "id": "unit-mortarion",
      "title": "Mortarion",
      "sourceBookId": "death-guard",
      "sourceLayer": "current",
      "intrinsicKeywords": [
        "MONSTER",
        "CHARACTER",
        "PSYKER",
        "FLY",
        "EPIC HERO",
        "GRENADES",
        "CHAOS",
        "NURGLE",
        "DAEMON",
        "PRIMARCH",
        "MORTARION",
        "DEATH GUARD"
      ],
      "relations": {
        "canLead": [],
        "canSupport": [],
        "canBeLedBy": [],
        "canBeSupportedBy": []
      },
      "ruleFacts": {
        "id": "unit-mortarion",
        "unitId": "unit-mortarion",
        "slug": "mortarion",
        "keywords": [
          "MONSTER",
          "CHARACTER",
          "PSYKER",
          "FLY",
          "EPIC HERO",
          "GRENADES",
          "CHAOS",
          "NURGLE",
          "DAEMON",
          "PRIMARCH",
          "MORTARION",
          "DEATH GUARD"
        ],
        "intrinsicKeywords": [
          "MONSTER",
          "CHARACTER",
          "PSYKER",
          "FLY",
          "EPIC HERO",
          "GRENADES",
          "CHAOS",
          "NURGLE",
          "DAEMON",
          "PRIMARCH",
          "MORTARION",
          "DEATH GUARD"
        ],
        "abilities": [
          "DEADLY DEMISE",
          "Deep Strike",
          "Feel No Pain 5+",
          "Nurgle’s Gift (Aura)",
          "Lord of the Death Guard",
          "Host of Plagues",
          "Supreme Commander"
        ],
        "termIds": [
          "keyword-monster",
          "keyword-character",
          "keyword-psyker",
          "keyword-fly",
          "keyword-epic-hero",
          "keyword-grenades",
          "keyword-chaos",
          "keyword-nurgle",
          "keyword-daemon",
          "keyword-primarch",
          "keyword-mortarion",
          "keyword-death-guard",
          "ability-lord-of-the-death-guard-90db1c4",
          "ability-host-of-plagues-2f9d0aa",
          "weapon-lantern-c3a2ca6",
          "weapon-rotwind-6399c60",
          "weapon-silence-strike-11078ae",
          "weapon-silence-sweep-280acf3"
        ],
        "epic": true,
        "deadlyDemise": true,
        "attached": false,
        "attachmentKnown": true,
        "characterCount": 1,
        "twoCharacters": null,
        "warlord": null,
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
          "Ld": "5+",
          "OC": "6",
          "Inv": "4+"
        },
        "abilities": [
          {
            "id": "mortarion-ability-core",
            "sectionId": "mortarion-ability-core",
            "title": "CORE",
            "text": "Deadly Demise D6, Deep Strike, Feel No Pain 5+",
            "sourceUnitId": "unit-mortarion"
          },
          {
            "id": "mortarion-ability-faction",
            "sectionId": "mortarion-ability-faction",
            "title": "FACTION",
            "text": "Nurgle’s Gift (Aura)",
            "sourceUnitId": "unit-mortarion"
          },
          {
            "id": "mortarion-ability-lord-of-the-death-guard",
            "sectionId": "mortarion-ability-lord-of-the-death-guard",
            "title": "Lord of the Death Guard",
            "text": "Once per turn, this model can use one of the following abilities. Diseased Influence: Just after an enemy unit ends a Normal, Advance or Fall Back move within 8\" of a friendly DEATH GUARD unit that is within 6\" of this model, if that DEATH GUARD unit is not within Engagement Range of one or more enemy units, it can make a Normal move of up to 5\". Boon of Death: In the Fight phase, when a friendly DEATH GUARD unit within 6\" of this model is selected as the target of an attack, this model can use this ability. Until the end of the phase, each time a model in that unit is destroyed by a melee attack, if it has not fought this phase, roll one D6. On a 2+, do not remove it from play; it can fight after the attacking unit has finished its attacks, then it is removed from play. Inflamed Reprisal: In your opponent’s Shooting phase, when a friendly DEATH GUARD unit within 6\" of this model is selected as the target of an attack, this model can use this ability. If it does, after the attacking unit has finished making its attacks, that DEATH GUARD unit can shoot as if it were your Shooting phase, but when resolving those attacks, worsen the BS characteristic of that attack by 1 and it can only target that enemy unit (and only if it is an eligible target).",
            "sourceUnitId": "unit-mortarion"
          },
          {
            "id": "mortarion-ability-host-of-plagues",
            "sectionId": "mortarion-ability-host-of-plagues",
            "title": "Host of Plagues",
            "text": "At the end of your Movement phase, roll one D6 for each enemy unit within 6\" of this model, adding 1 to the result if that enemy unit is Afflicted: on a 3+, that enemy unit suffers D3 mortal wounds.",
            "sourceUnitId": "unit-mortarion"
          },
          {
            "id": "mortarion-ability-supreme-commander",
            "sectionId": "mortarion-ability-supreme-commander",
            "title": "Supreme Commander",
            "text": "If this model is in your army, it must be your WARLORD.",
            "sourceUnitId": "unit-mortarion"
          }
        ],
        "models": [
          {
            "id": "unit-mortarion-model-99470e12a7",
            "title": "Mortarion",
            "aliases": [
              "Mortarion",
              "Mortarion – EPIC HERO"
            ],
            "min": 1,
            "max": 1,
            "legacyIds": [
              "unit-mortarion-model-mortarion"
            ]
          }
        ],
        "compositionRules": [],
        "selections": [
          {
            "id": "unit-mortarion-selection-lantern",
            "title": "Lantern",
            "aliases": [
              "Lantern"
            ],
            "kind": "weapon",
            "profileIds": [
              "mortarion-weapon-lantern"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-mortarion-selection-rotwind",
            "title": "Rotwind",
            "aliases": [
              "Rotwind"
            ],
            "kind": "weapon",
            "profileIds": [
              "mortarion-weapon-rotwind"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-mortarion-selection-silence-strike",
            "title": "Silence – strike",
            "aliases": [
              "Silence – strike"
            ],
            "kind": "weapon",
            "profileIds": [
              "mortarion-weapon-silence-strike"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-mortarion-selection-silence-sweep",
            "title": "Silence – sweep",
            "aliases": [
              "Silence – sweep"
            ],
            "kind": "weapon",
            "profileIds": [
              "mortarion-weapon-silence-sweep"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-mortarion-weapon-family-silence-selection",
            "title": "Silence",
            "aliases": [
              "Silence"
            ],
            "kind": "weapon",
            "familyId": "unit-mortarion-weapon-family-silence",
            "profileIds": [
              "mortarion-weapon-silence-strike",
              "mortarion-weapon-silence-sweep"
            ],
            "wargearAbilityIds": []
          }
        ],
        "weaponFamilies": [
          {
            "id": "unit-mortarion-weapon-family-silence",
            "title": "Silence",
            "aliases": [
              "Silence"
            ],
            "profileIds": [
              "mortarion-weapon-silence-strike",
              "mortarion-weapon-silence-sweep"
            ],
            "ambiguousAlias": false
          }
        ],
        "weaponProfiles": [
          {
            "id": "mortarion-weapon-lantern",
            "title": "Lantern",
            "mode": "ranged",
            "range": "24\"",
            "a": "1",
            "skill": "2+",
            "s": "10",
            "ap": "-3",
            "d": "3",
            "abilities": "PISTOL, SUSTAINED HITS D3",
            "sourceSelectionIds": [
              "unit-mortarion-selection-lantern"
            ]
          },
          {
            "id": "mortarion-weapon-rotwind",
            "title": "Rotwind",
            "mode": "ranged",
            "range": "24\"",
            "a": "D6+3",
            "skill": "2+",
            "s": "7",
            "ap": "-2",
            "d": "1",
            "abilities": "BLAST, DEVASTATING WOUNDS, LETHAL HITS, PSYCHIC",
            "sourceSelectionIds": [
              "unit-mortarion-selection-rotwind"
            ]
          },
          {
            "id": "mortarion-weapon-silence-strike",
            "title": "Silence – strike",
            "mode": "melee",
            "range": "Melee",
            "a": "5",
            "skill": "2+",
            "s": "14",
            "ap": "-3",
            "d": "D6+1",
            "abilities": "DEVASTATING WOUNDS, LETHAL HITS",
            "sourceSelectionIds": [
              "unit-mortarion-selection-silence-strike",
              "unit-mortarion-weapon-family-silence-selection"
            ]
          },
          {
            "id": "mortarion-weapon-silence-sweep",
            "title": "Silence – sweep",
            "mode": "melee",
            "range": "Melee",
            "a": "15",
            "skill": "2+",
            "s": "8",
            "ap": "-2",
            "d": "2",
            "abilities": "LETHAL HITS, SUSTAINED HITS 1",
            "sourceSelectionIds": [
              "unit-mortarion-selection-silence-sweep",
              "unit-mortarion-weapon-family-silence-selection"
            ]
          }
        ],
        "wargearAbilities": []
      }
    },
    {
      "id": "unit-typhus",
      "title": "Typhus",
      "sourceBookId": "death-guard",
      "sourceLayer": "current",
      "intrinsicKeywords": [
        "INFANTRY",
        "CHARACTER",
        "PSYKER",
        "EPIC HERO",
        "CHAOS",
        "NURGLE",
        "TERMINATOR",
        "TYPHUS",
        "DEATH GUARD"
      ],
      "relations": {
        "canLead": [
          {
            "unitId": "unit-blightlord-terminators",
            "maxCharacters": 1
          },
          {
            "unitId": "unit-deathshroud-terminators",
            "maxCharacters": 1
          },
          {
            "unitId": "unit-poxwalkers",
            "maxCharacters": 2
          }
        ],
        "canSupport": [],
        "canBeLedBy": [],
        "canBeSupportedBy": []
      },
      "ruleFacts": {
        "id": "unit-typhus",
        "unitId": "unit-typhus",
        "slug": "typhus",
        "keywords": [
          "INFANTRY",
          "CHARACTER",
          "PSYKER",
          "EPIC HERO",
          "CHAOS",
          "NURGLE",
          "TERMINATOR",
          "TYPHUS",
          "DEATH GUARD"
        ],
        "intrinsicKeywords": [
          "INFANTRY",
          "CHARACTER",
          "PSYKER",
          "EPIC HERO",
          "CHAOS",
          "NURGLE",
          "TERMINATOR",
          "TYPHUS",
          "DEATH GUARD"
        ],
        "abilities": [
          "Deep Strike",
          "Leader",
          "Nurgle’s Gift (Aura)",
          "The Destroyer Hive",
          "Eater Plague (Psychic)"
        ],
        "termIds": [
          "keyword-infantry",
          "keyword-character",
          "keyword-psyker",
          "keyword-epic-hero",
          "keyword-chaos",
          "keyword-nurgle",
          "keyword-terminator",
          "keyword-typhus",
          "keyword-death-guard",
          "ability-the-destroyer-hive-70f0cc1",
          "ability-eater-plague-psychic-2c7cc41",
          "weapon-lakrimae-strike-99d1d4f",
          "weapon-lakrimae-sweep-b7827b0"
        ],
        "epic": true,
        "deadlyDemise": false,
        "attached": null,
        "attachmentKnown": false,
        "characterCount": 1,
        "twoCharacters": null,
        "warlord": null,
        "relations": {
          "canLead": [
            {
              "unitId": "unit-blightlord-terminators",
              "maxCharacters": 1
            },
            {
              "unitId": "unit-deathshroud-terminators",
              "maxCharacters": 1
            },
            {
              "unitId": "unit-poxwalkers",
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
          "M": "5\"",
          "T": "7",
          "Sv": "2+",
          "W": "6",
          "Ld": "6+",
          "OC": "1",
          "Inv": "4+"
        },
        "abilities": [
          {
            "id": "typhus-ability-core",
            "sectionId": "typhus-ability-core",
            "title": "CORE",
            "text": "Deep Strike, Leader",
            "sourceUnitId": "unit-typhus"
          },
          {
            "id": "typhus-ability-faction",
            "sectionId": "typhus-ability-faction",
            "title": "FACTION",
            "text": "Nurgle’s Gift (Aura)",
            "sourceUnitId": "unit-typhus"
          },
          {
            "id": "typhus-ability-the-destroyer-hive",
            "sectionId": "typhus-ability-the-destroyer-hive",
            "title": "The Destroyer Hive",
            "text": "While this model is leading a unit, each time a melee attack targets that unit, subtract 1 from the Hit roll.",
            "sourceUnitId": "unit-typhus"
          },
          {
            "id": "typhus-ability-eater-plague-psychic",
            "sectionId": "typhus-ability-eater-plague-psychic",
            "title": "Eater Plague (Psychic)",
            "text": "In your Shooting phase, you can select one enemy unit within 18\" of and visible to this PSYKER (excluding units with the Lone Operative ability that are not part of an Attached unit and are not within 12\" of this PSYKER) and roll one D6: on a 1, this PSYKER’s unit suffers D3 mortal wounds; on a 2-5, that enemy unit suffers D6 mortal wounds; on a 6, that enemy unit suffers D3+3 mortal wounds.",
            "sourceUnitId": "unit-typhus"
          }
        ],
        "models": [
          {
            "id": "unit-typhus-model-bb04325648",
            "title": "Typhus",
            "aliases": [
              "Typhus",
              "Typhus – EPIC HERO"
            ],
            "min": 1,
            "max": 1,
            "legacyIds": [
              "unit-typhus-model-typhus"
            ]
          }
        ],
        "compositionRules": [],
        "selections": [
          {
            "id": "unit-typhus-selection-lakrimae-strike",
            "title": "Lakrimae – strike",
            "aliases": [
              "Lakrimae – strike"
            ],
            "kind": "weapon",
            "profileIds": [
              "typhus-weapon-lakrimae-strike"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-typhus-selection-lakrimae-sweep",
            "title": "Lakrimae – sweep",
            "aliases": [
              "Lakrimae – sweep"
            ],
            "kind": "weapon",
            "profileIds": [
              "typhus-weapon-lakrimae-sweep"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-typhus-weapon-family-lakrimae-selection",
            "title": "Lakrimae",
            "aliases": [
              "Lakrimae"
            ],
            "kind": "weapon",
            "familyId": "unit-typhus-weapon-family-lakrimae",
            "profileIds": [
              "typhus-weapon-lakrimae-strike",
              "typhus-weapon-lakrimae-sweep"
            ],
            "wargearAbilityIds": []
          }
        ],
        "weaponFamilies": [
          {
            "id": "unit-typhus-weapon-family-lakrimae",
            "title": "Lakrimae",
            "aliases": [
              "Lakrimae"
            ],
            "profileIds": [
              "typhus-weapon-lakrimae-strike",
              "typhus-weapon-lakrimae-sweep"
            ],
            "ambiguousAlias": false
          }
        ],
        "weaponProfiles": [
          {
            "id": "typhus-weapon-lakrimae-strike",
            "title": "Lakrimae – strike",
            "mode": "melee",
            "range": "Melee",
            "a": "6",
            "skill": "2+",
            "s": "9",
            "ap": "-2",
            "d": "3",
            "abilities": "LETHAL HITS",
            "sourceSelectionIds": [
              "unit-typhus-selection-lakrimae-strike",
              "unit-typhus-weapon-family-lakrimae-selection"
            ]
          },
          {
            "id": "typhus-weapon-lakrimae-sweep",
            "title": "Lakrimae – sweep",
            "mode": "melee",
            "range": "Melee",
            "a": "12",
            "skill": "2+",
            "s": "6",
            "ap": "-1",
            "d": "1",
            "abilities": "LETHAL HITS",
            "sourceSelectionIds": [
              "unit-typhus-selection-lakrimae-sweep",
              "unit-typhus-weapon-family-lakrimae-selection"
            ]
          }
        ],
        "wargearAbilities": []
      }
    },
    {
      "id": "unit-biologus-putrifier",
      "title": "Biologus Putrifier",
      "sourceBookId": "death-guard",
      "sourceLayer": "current",
      "intrinsicKeywords": [
        "INFANTRY",
        "CHARACTER",
        "GRENADES",
        "CHAOS",
        "NURGLE",
        "BIOLOGUS PUTRIFIER",
        "DEATH GUARD"
      ],
      "relations": {
        "canLead": [
          {
            "unitId": "unit-plague-marines",
            "maxCharacters": 2
          }
        ],
        "canSupport": [
          {
            "unitId": "unit-plague-marines",
            "maxCharacters": 2
          }
        ],
        "canBeLedBy": [],
        "canBeSupportedBy": []
      },
      "ruleFacts": {
        "id": "unit-biologus-putrifier",
        "unitId": "unit-biologus-putrifier",
        "slug": "biologus-putrifier",
        "keywords": [
          "INFANTRY",
          "CHARACTER",
          "GRENADES",
          "CHAOS",
          "NURGLE",
          "BIOLOGUS PUTRIFIER",
          "DEATH GUARD"
        ],
        "intrinsicKeywords": [
          "INFANTRY",
          "CHARACTER",
          "GRENADES",
          "CHAOS",
          "NURGLE",
          "BIOLOGUS PUTRIFIER",
          "DEATH GUARD"
        ],
        "abilities": [
          "DEADLY DEMISE",
          "Leader",
          "Nurgle’s Gift (Aura)",
          "Foul Infusion",
          "Extraction of Fresh Disease"
        ],
        "termIds": [
          "keyword-infantry",
          "keyword-character",
          "keyword-grenades",
          "keyword-chaos",
          "keyword-nurgle",
          "keyword-biologus-putrifier",
          "keyword-death-guard",
          "ability-foul-infusion-490467e",
          "ability-extraction-of-fresh-disease-b14e246",
          "weapon-hyper-blight-grenades-0322c28",
          "weapon-injector-pistol-25d0119",
          "weapon-plague-knives-1a37c6a"
        ],
        "epic": false,
        "deadlyDemise": true,
        "attached": null,
        "attachmentKnown": false,
        "characterCount": 1,
        "twoCharacters": null,
        "warlord": null,
        "relations": {
          "canLead": [
            {
              "unitId": "unit-plague-marines",
              "maxCharacters": 2
            }
          ],
          "canSupport": [
            {
              "unitId": "unit-plague-marines",
              "maxCharacters": 2
            }
          ],
          "canBeLedBy": [],
          "canBeSupportedBy": []
        }
      },
      "gameSelections": {
        "stats": {
          "M": "5\"",
          "T": "6",
          "Sv": "3+",
          "W": "4",
          "Ld": "6+",
          "OC": "1"
        },
        "abilities": [
          {
            "id": "biologus-putrifier-ability-core",
            "sectionId": "biologus-putrifier-ability-core",
            "title": "CORE",
            "text": "Deadly Demise 1, Leader",
            "sourceUnitId": "unit-biologus-putrifier"
          },
          {
            "id": "biologus-putrifier-ability-faction",
            "sectionId": "biologus-putrifier-ability-faction",
            "title": "FACTION",
            "text": "Nurgle’s Gift (Aura)",
            "sourceUnitId": "unit-biologus-putrifier"
          },
          {
            "id": "biologus-putrifier-ability-foul-infusion",
            "sectionId": "biologus-putrifier-ability-foul-infusion",
            "title": "Foul Infusion",
            "text": "While this model is leading a unit, weapons equipped by models in that unit have the [LETHAL HITS] ability. In addition, each time a model in that unit makes an attack, a Critical Hit is scored on an unmodified Hit roll of 5+, instead of only a 6.",
            "sourceUnitId": "unit-biologus-putrifier"
          },
          {
            "id": "biologus-putrifier-ability-extraction-of-fresh-disease",
            "sectionId": "biologus-putrifier-ability-extraction-of-fresh-disease",
            "title": "Extraction of Fresh Disease",
            "text": "The first time this model’s unit destroys an enemy unit as the result of a melee attack, until the end of the battle, add 6 to the Objective Control characteristic of this model.",
            "sourceUnitId": "unit-biologus-putrifier"
          }
        ],
        "models": [
          {
            "id": "unit-biologus-putrifier-model-adb2a76bb1",
            "title": "Biologus Putrifier",
            "aliases": [
              "Biologus Putrifier"
            ],
            "min": 1,
            "max": 1,
            "legacyIds": [
              "unit-biologus-putrifier-model-biologus-putrifier"
            ]
          }
        ],
        "compositionRules": [],
        "selections": [
          {
            "id": "unit-biologus-putrifier-selection-hyper-blight-grenades",
            "title": "Hyper blight grenades",
            "aliases": [
              "Hyper blight grenades"
            ],
            "kind": "weapon",
            "profileIds": [
              "biologus-putrifier-weapon-hyper-blight-grenades"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-biologus-putrifier-selection-injector-pistol",
            "title": "Injector pistol",
            "aliases": [
              "Injector pistol"
            ],
            "kind": "weapon",
            "profileIds": [
              "biologus-putrifier-weapon-injector-pistol"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-biologus-putrifier-selection-plague-knives",
            "title": "Plague knives",
            "aliases": [
              "Plague knives"
            ],
            "kind": "weapon",
            "profileIds": [
              "biologus-putrifier-weapon-plague-knives"
            ],
            "wargearAbilityIds": []
          }
        ],
        "weaponFamilies": [],
        "weaponProfiles": [
          {
            "id": "biologus-putrifier-weapon-hyper-blight-grenades",
            "title": "Hyper blight grenades",
            "mode": "ranged",
            "range": "12\"",
            "a": "D6",
            "skill": "3+",
            "s": "7",
            "ap": "-1",
            "d": "2",
            "abilities": "ASSAULT, BLAST, LETHAL HITS",
            "sourceSelectionIds": [
              "unit-biologus-putrifier-selection-hyper-blight-grenades"
            ]
          },
          {
            "id": "biologus-putrifier-weapon-injector-pistol",
            "title": "Injector pistol",
            "mode": "ranged",
            "range": "3\"",
            "a": "1",
            "skill": "3+",
            "s": "4",
            "ap": "-1",
            "d": "3",
            "abilities": "ANTI-INFANTRY 2+, PISTOL, PRECISION",
            "sourceSelectionIds": [
              "unit-biologus-putrifier-selection-injector-pistol"
            ]
          },
          {
            "id": "biologus-putrifier-weapon-plague-knives",
            "title": "Plague knives",
            "mode": "melee",
            "range": "Melee",
            "a": "4",
            "skill": "3+",
            "s": "4",
            "ap": "0",
            "d": "1",
            "abilities": "LETHAL HITS",
            "sourceSelectionIds": [
              "unit-biologus-putrifier-selection-plague-knives"
            ]
          }
        ],
        "wargearAbilities": []
      }
    },
    {
      "id": "unit-daemon-prince-of-nurgle",
      "title": "Daemon Prince of Nurgle",
      "sourceBookId": "death-guard",
      "sourceLayer": "current",
      "intrinsicKeywords": [
        "MONSTER",
        "CHARACTER",
        "CHAOS",
        "NURGLE",
        "DAEMON",
        "DAEMON PRINCE",
        "DEATH GUARD"
      ],
      "relations": {
        "canLead": [],
        "canSupport": [],
        "canBeLedBy": [],
        "canBeSupportedBy": []
      },
      "ruleFacts": {
        "id": "unit-daemon-prince-of-nurgle",
        "unitId": "unit-daemon-prince-of-nurgle",
        "slug": "daemon-prince-of-nurgle",
        "keywords": [
          "MONSTER",
          "CHARACTER",
          "CHAOS",
          "NURGLE",
          "DAEMON",
          "DAEMON PRINCE",
          "DEATH GUARD"
        ],
        "intrinsicKeywords": [
          "MONSTER",
          "CHARACTER",
          "CHAOS",
          "NURGLE",
          "DAEMON",
          "DAEMON PRINCE",
          "DEATH GUARD"
        ],
        "abilities": [
          "DEADLY DEMISE",
          "Nurgle’s Gift (Aura)",
          "Death Guard Defenders",
          "Fevered Strategist",
          "Miasma of Pestilence (Aura)"
        ],
        "termIds": [
          "keyword-monster",
          "keyword-character",
          "keyword-chaos",
          "keyword-nurgle",
          "keyword-daemon",
          "keyword-daemon-prince",
          "keyword-death-guard",
          "ability-death-guard-defenders-c306937",
          "ability-fevered-strategist-9a8ed87",
          "ability-miasma-of-pestilence-aura-92fd75f",
          "weapon-infernal-cannon-1e13e5b",
          "weapon-hellforged-weapons-strike-edc19f1",
          "weapon-hellforged-weapons-sweep-5c45030"
        ],
        "epic": false,
        "deadlyDemise": true,
        "attached": false,
        "attachmentKnown": true,
        "characterCount": 1,
        "twoCharacters": null,
        "warlord": null,
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
          "T": "12",
          "Sv": "2+",
          "W": "10",
          "Ld": "6+",
          "OC": "3",
          "Inv": "4+"
        },
        "abilities": [
          {
            "id": "daemon-prince-of-nurgle-ability-core",
            "sectionId": "daemon-prince-of-nurgle-ability-core",
            "title": "CORE",
            "text": "Deadly Demise D3",
            "sourceUnitId": "unit-daemon-prince-of-nurgle"
          },
          {
            "id": "daemon-prince-of-nurgle-ability-faction",
            "sectionId": "daemon-prince-of-nurgle-ability-faction",
            "title": "FACTION",
            "text": "Nurgle’s Gift (Aura)",
            "sourceUnitId": "unit-daemon-prince-of-nurgle"
          },
          {
            "id": "daemon-prince-of-nurgle-ability-death-guard-defenders",
            "sectionId": "daemon-prince-of-nurgle-ability-death-guard-defenders",
            "title": "Death Guard Defenders",
            "text": "While this model is within 3\" of one or more friendly DEATH GUARD INFANTRY units, this model has the Lone Operative ability.",
            "sourceUnitId": "unit-daemon-prince-of-nurgle"
          },
          {
            "id": "daemon-prince-of-nurgle-ability-fevered-strategist",
            "sectionId": "daemon-prince-of-nurgle-ability-fevered-strategist",
            "title": "Fevered Strategist",
            "text": "Once per battle round, one model from your army with this ability can use it when a friendly DEATH GUARD unit within 12\" of that model is targeted with a Stratagem. If it does, reduce the CP cost of that usage of that Stratagem by 1CP.",
            "sourceUnitId": "unit-daemon-prince-of-nurgle"
          },
          {
            "id": "daemon-prince-of-nurgle-ability-miasma-of-pestilence-aura",
            "sectionId": "daemon-prince-of-nurgle-ability-miasma-of-pestilence-aura",
            "title": "Miasma of Pestilence (Aura)",
            "text": "While a friendly DEATH GUARD unit is within 6\" of this model, each time a ranged attack targets that unit, models in that unit have the Benefit of Cover against that attack.",
            "sourceUnitId": "unit-daemon-prince-of-nurgle"
          }
        ],
        "models": [
          {
            "id": "unit-daemon-prince-of-nurgle-model-62296483f7",
            "title": "Daemon Prince of Nurgle",
            "aliases": [
              "Daemon Prince of Nurgle"
            ],
            "min": 1,
            "max": 1,
            "legacyIds": [
              "unit-daemon-prince-of-nurgle-model-daemon-prince-of-nurgle"
            ]
          }
        ],
        "compositionRules": [],
        "selections": [
          {
            "id": "unit-daemon-prince-of-nurgle-selection-infernal-cannon",
            "title": "Infernal cannon",
            "aliases": [
              "Infernal cannon"
            ],
            "kind": "weapon",
            "profileIds": [
              "daemon-prince-of-nurgle-weapon-infernal-cannon"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-daemon-prince-of-nurgle-selection-hellforged-weapons-strike",
            "title": "Hellforged weapons – strike",
            "aliases": [
              "Hellforged weapons – strike"
            ],
            "kind": "weapon",
            "profileIds": [
              "daemon-prince-of-nurgle-weapon-hellforged-weapons-strike"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-daemon-prince-of-nurgle-selection-hellforged-weapons-sweep",
            "title": "Hellforged weapons – sweep",
            "aliases": [
              "Hellforged weapons – sweep"
            ],
            "kind": "weapon",
            "profileIds": [
              "daemon-prince-of-nurgle-weapon-hellforged-weapons-sweep"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-daemon-prince-of-nurgle-weapon-family-hellforged-weapons-selection",
            "title": "Hellforged weapons",
            "aliases": [
              "Hellforged weapons"
            ],
            "kind": "weapon",
            "familyId": "unit-daemon-prince-of-nurgle-weapon-family-hellforged-weapons",
            "profileIds": [
              "daemon-prince-of-nurgle-weapon-hellforged-weapons-strike",
              "daemon-prince-of-nurgle-weapon-hellforged-weapons-sweep"
            ],
            "wargearAbilityIds": []
          }
        ],
        "weaponFamilies": [
          {
            "id": "unit-daemon-prince-of-nurgle-weapon-family-hellforged-weapons",
            "title": "Hellforged weapons",
            "aliases": [
              "Hellforged weapons"
            ],
            "profileIds": [
              "daemon-prince-of-nurgle-weapon-hellforged-weapons-strike",
              "daemon-prince-of-nurgle-weapon-hellforged-weapons-sweep"
            ],
            "ambiguousAlias": false
          }
        ],
        "weaponProfiles": [
          {
            "id": "daemon-prince-of-nurgle-weapon-infernal-cannon",
            "title": "Infernal cannon",
            "mode": "ranged",
            "range": "24\"",
            "a": "3",
            "skill": "2+",
            "s": "5",
            "ap": "-1",
            "d": "2",
            "abilities": "LETHAL HITS",
            "sourceSelectionIds": [
              "unit-daemon-prince-of-nurgle-selection-infernal-cannon"
            ]
          },
          {
            "id": "daemon-prince-of-nurgle-weapon-hellforged-weapons-strike",
            "title": "Hellforged weapons – strike",
            "mode": "melee",
            "range": "Melee",
            "a": "7",
            "skill": "2+",
            "s": "8",
            "ap": "-2",
            "d": "3",
            "abilities": "LETHAL HITS",
            "sourceSelectionIds": [
              "unit-daemon-prince-of-nurgle-selection-hellforged-weapons-strike",
              "unit-daemon-prince-of-nurgle-weapon-family-hellforged-weapons-selection"
            ]
          },
          {
            "id": "daemon-prince-of-nurgle-weapon-hellforged-weapons-sweep",
            "title": "Hellforged weapons – sweep",
            "mode": "melee",
            "range": "Melee",
            "a": "14",
            "skill": "2+",
            "s": "6",
            "ap": "-1",
            "d": "1",
            "abilities": "LETHAL HITS",
            "sourceSelectionIds": [
              "unit-daemon-prince-of-nurgle-selection-hellforged-weapons-sweep",
              "unit-daemon-prince-of-nurgle-weapon-family-hellforged-weapons-selection"
            ]
          }
        ],
        "wargearAbilities": []
      }
    },
    {
      "id": "unit-daemon-prince-of-nurgle-with-wings",
      "title": "Daemon Prince of Nurgle with Wings",
      "sourceBookId": "death-guard",
      "sourceLayer": "current",
      "intrinsicKeywords": [
        "MONSTER",
        "CHARACTER",
        "FLY",
        "CHAOS",
        "NURGLE",
        "DAEMON",
        "DAEMON PRINCE WITH WINGS",
        "DEATH GUARD"
      ],
      "relations": {
        "canLead": [],
        "canSupport": [],
        "canBeLedBy": [],
        "canBeSupportedBy": []
      },
      "ruleFacts": {
        "id": "unit-daemon-prince-of-nurgle-with-wings",
        "unitId": "unit-daemon-prince-of-nurgle-with-wings",
        "slug": "daemon-prince-of-nurgle-with-wings",
        "keywords": [
          "MONSTER",
          "CHARACTER",
          "FLY",
          "CHAOS",
          "NURGLE",
          "DAEMON",
          "DAEMON PRINCE WITH WINGS",
          "DEATH GUARD"
        ],
        "intrinsicKeywords": [
          "MONSTER",
          "CHARACTER",
          "FLY",
          "CHAOS",
          "NURGLE",
          "DAEMON",
          "DAEMON PRINCE WITH WINGS",
          "DEATH GUARD"
        ],
        "abilities": [
          "DEADLY DEMISE",
          "Deep Strike",
          "Nurgle’s Gift (Aura)",
          "Horrifying Visage",
          "Enfeebling Miasma (Aura)"
        ],
        "termIds": [
          "keyword-monster",
          "keyword-character",
          "keyword-fly",
          "keyword-chaos",
          "keyword-nurgle",
          "keyword-daemon",
          "keyword-daemon-prince-with-wings",
          "keyword-death-guard",
          "ability-horrifying-visage-bfdb06a",
          "ability-enfeebling-miasma-aura-dba0eef",
          "weapon-infernal-cannon-09a5d9c",
          "weapon-hellforged-weapons-strike-edc19f1",
          "weapon-hellforged-weapons-sweep-5c45030"
        ],
        "epic": false,
        "deadlyDemise": true,
        "attached": false,
        "attachmentKnown": true,
        "characterCount": 1,
        "twoCharacters": null,
        "warlord": null,
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
          "Sv": "2+",
          "W": "10",
          "Ld": "6+",
          "OC": "3",
          "Inv": "4+"
        },
        "abilities": [
          {
            "id": "daemon-prince-of-nurgle-with-wings-ability-core",
            "sectionId": "daemon-prince-of-nurgle-with-wings-ability-core",
            "title": "CORE",
            "text": "Deadly Demise D3, Deep Strike",
            "sourceUnitId": "unit-daemon-prince-of-nurgle-with-wings"
          },
          {
            "id": "daemon-prince-of-nurgle-with-wings-ability-faction",
            "sectionId": "daemon-prince-of-nurgle-with-wings-ability-faction",
            "title": "FACTION",
            "text": "Nurgle’s Gift (Aura)",
            "sourceUnitId": "unit-daemon-prince-of-nurgle-with-wings"
          },
          {
            "id": "daemon-prince-of-nurgle-with-wings-ability-horrifying-visage",
            "sectionId": "daemon-prince-of-nurgle-with-wings-ability-horrifying-visage",
            "title": "Horrifying Visage",
            "text": "Each time this model ends a Charge move, select one enemy unit within Engagement Range of it. That unit must take a Battle-shock test, subtracting 1 from that test.",
            "sourceUnitId": "unit-daemon-prince-of-nurgle-with-wings"
          },
          {
            "id": "daemon-prince-of-nurgle-with-wings-ability-enfeebling-miasma-aura",
            "sectionId": "daemon-prince-of-nurgle-with-wings-ability-enfeebling-miasma-aura",
            "title": "Enfeebling Miasma (Aura)",
            "text": "While an enemy unit (excluding MONSTERS and VEHICLES) is within 6\" of this model, each time that unit is selected to Fall Back, models in that enemy unit must take Desperate Escape tests. When doing so, if that enemy unit is Battle-shocked, subtract 1 from each of those Desperate Escape tests.",
            "sourceUnitId": "unit-daemon-prince-of-nurgle-with-wings"
          }
        ],
        "models": [
          {
            "id": "unit-daemon-prince-of-nurgle-with-wings-model-4d080ad381",
            "title": "Daemon Prince of Nurgle with Wings",
            "aliases": [
              "Daemon Prince of Nurgle with Wings"
            ],
            "min": 1,
            "max": 1,
            "legacyIds": [
              "unit-daemon-prince-of-nurgle-with-wings-model-daemon-prince-of-nurgle-with-wings"
            ]
          }
        ],
        "compositionRules": [],
        "selections": [
          {
            "id": "unit-daemon-prince-of-nurgle-with-wings-selection-infernal-cannon",
            "title": "Infernal cannon",
            "aliases": [
              "Infernal cannon"
            ],
            "kind": "weapon",
            "profileIds": [
              "daemon-prince-of-nurgle-with-wings-weapon-infernal-cannon"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-daemon-prince-of-nurgle-with-wings-selection-hellforged-weapons-strike",
            "title": "Hellforged weapons – strike",
            "aliases": [
              "Hellforged weapons – strike"
            ],
            "kind": "weapon",
            "profileIds": [
              "daemon-prince-of-nurgle-with-wings-weapon-hellforged-weapons-strike"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-daemon-prince-of-nurgle-with-wings-selection-hellforged-weapons-sweep",
            "title": "Hellforged weapons – sweep",
            "aliases": [
              "Hellforged weapons – sweep"
            ],
            "kind": "weapon",
            "profileIds": [
              "daemon-prince-of-nurgle-with-wings-weapon-hellforged-weapons-sweep"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-daemon-prince-of-nurgle-with-wings-weapon-family-hellforged-weapons-selection",
            "title": "Hellforged weapons",
            "aliases": [
              "Hellforged weapons"
            ],
            "kind": "weapon",
            "familyId": "unit-daemon-prince-of-nurgle-with-wings-weapon-family-hellforged-weapons",
            "profileIds": [
              "daemon-prince-of-nurgle-with-wings-weapon-hellforged-weapons-strike",
              "daemon-prince-of-nurgle-with-wings-weapon-hellforged-weapons-sweep"
            ],
            "wargearAbilityIds": []
          }
        ],
        "weaponFamilies": [
          {
            "id": "unit-daemon-prince-of-nurgle-with-wings-weapon-family-hellforged-weapons",
            "title": "Hellforged weapons",
            "aliases": [
              "Hellforged weapons"
            ],
            "profileIds": [
              "daemon-prince-of-nurgle-with-wings-weapon-hellforged-weapons-strike",
              "daemon-prince-of-nurgle-with-wings-weapon-hellforged-weapons-sweep"
            ],
            "ambiguousAlias": false
          }
        ],
        "weaponProfiles": [
          {
            "id": "daemon-prince-of-nurgle-with-wings-weapon-infernal-cannon",
            "title": "Infernal cannon",
            "mode": "ranged",
            "range": "24\"",
            "a": "3",
            "skill": "2+",
            "s": "7",
            "ap": "-1",
            "d": "2",
            "abilities": "LETHAL HITS",
            "sourceSelectionIds": [
              "unit-daemon-prince-of-nurgle-with-wings-selection-infernal-cannon"
            ]
          },
          {
            "id": "daemon-prince-of-nurgle-with-wings-weapon-hellforged-weapons-strike",
            "title": "Hellforged weapons – strike",
            "mode": "melee",
            "range": "Melee",
            "a": "7",
            "skill": "2+",
            "s": "8",
            "ap": "-2",
            "d": "3",
            "abilities": "LETHAL HITS",
            "sourceSelectionIds": [
              "unit-daemon-prince-of-nurgle-with-wings-selection-hellforged-weapons-strike",
              "unit-daemon-prince-of-nurgle-with-wings-weapon-family-hellforged-weapons-selection"
            ]
          },
          {
            "id": "daemon-prince-of-nurgle-with-wings-weapon-hellforged-weapons-sweep",
            "title": "Hellforged weapons – sweep",
            "mode": "melee",
            "range": "Melee",
            "a": "14",
            "skill": "2+",
            "s": "6",
            "ap": "-1",
            "d": "1",
            "abilities": "LETHAL HITS",
            "sourceSelectionIds": [
              "unit-daemon-prince-of-nurgle-with-wings-selection-hellforged-weapons-sweep",
              "unit-daemon-prince-of-nurgle-with-wings-weapon-family-hellforged-weapons-selection"
            ]
          }
        ],
        "wargearAbilities": []
      }
    },
    {
      "id": "unit-foul-blightspawn",
      "title": "Foul Blightspawn",
      "sourceBookId": "death-guard",
      "sourceLayer": "current",
      "intrinsicKeywords": [
        "INFANTRY",
        "CHARACTER",
        "GRENADES",
        "CHAOS",
        "NURGLE",
        "FOUL BLIGHTSPAWN",
        "DEATH GUARD"
      ],
      "relations": {
        "canLead": [
          {
            "unitId": "unit-plague-marines",
            "maxCharacters": 2
          }
        ],
        "canSupport": [
          {
            "unitId": "unit-plague-marines",
            "maxCharacters": 2
          }
        ],
        "canBeLedBy": [],
        "canBeSupportedBy": []
      },
      "ruleFacts": {
        "id": "unit-foul-blightspawn",
        "unitId": "unit-foul-blightspawn",
        "slug": "foul-blightspawn",
        "keywords": [
          "INFANTRY",
          "CHARACTER",
          "GRENADES",
          "CHAOS",
          "NURGLE",
          "FOUL BLIGHTSPAWN",
          "DEATH GUARD"
        ],
        "intrinsicKeywords": [
          "INFANTRY",
          "CHARACTER",
          "GRENADES",
          "CHAOS",
          "NURGLE",
          "FOUL BLIGHTSPAWN",
          "DEATH GUARD"
        ],
        "abilities": [
          "Leader",
          "Nurgle’s Gift (Aura)",
          "Blinding Spray",
          "Putrefying Stink"
        ],
        "termIds": [
          "keyword-infantry",
          "keyword-character",
          "keyword-grenades",
          "keyword-chaos",
          "keyword-nurgle",
          "keyword-foul-blightspawn",
          "keyword-death-guard",
          "ability-blinding-spray-7d189f5",
          "ability-putrefying-stink-4f5145b",
          "weapon-plague-sprayer-01c1e61",
          "weapon-close-combat-weapon-bc414e3"
        ],
        "epic": false,
        "deadlyDemise": false,
        "attached": null,
        "attachmentKnown": false,
        "characterCount": 1,
        "twoCharacters": null,
        "warlord": null,
        "relations": {
          "canLead": [
            {
              "unitId": "unit-plague-marines",
              "maxCharacters": 2
            }
          ],
          "canSupport": [
            {
              "unitId": "unit-plague-marines",
              "maxCharacters": 2
            }
          ],
          "canBeLedBy": [],
          "canBeSupportedBy": []
        }
      },
      "gameSelections": {
        "stats": {
          "M": "5\"",
          "T": "6",
          "Sv": "3+",
          "W": "4",
          "Ld": "6+",
          "OC": "1"
        },
        "abilities": [
          {
            "id": "foul-blightspawn-ability-core",
            "sectionId": "foul-blightspawn-ability-core",
            "title": "CORE",
            "text": "Leader",
            "sourceUnitId": "unit-foul-blightspawn"
          },
          {
            "id": "foul-blightspawn-ability-faction",
            "sectionId": "foul-blightspawn-ability-faction",
            "title": "FACTION",
            "text": "Nurgle’s Gift (Aura)",
            "sourceUnitId": "unit-foul-blightspawn"
          },
          {
            "id": "foul-blightspawn-ability-blinding-spray",
            "sectionId": "foul-blightspawn-ability-blinding-spray",
            "title": "Blinding Spray",
            "text": "In the Fight phase, you can select one model from your army with this ability to use this ability. If you do, until the end of the phase, that model’s unit has the Fights First ability. Each model can only be selected for this ability once per battle.",
            "sourceUnitId": "unit-foul-blightspawn"
          },
          {
            "id": "foul-blightspawn-ability-putrefying-stink",
            "sectionId": "foul-blightspawn-ability-putrefying-stink",
            "title": "Putrefying Stink",
            "text": "Enemy models cannot start or end an Advance move within 9\" of this model.",
            "sourceUnitId": "unit-foul-blightspawn"
          }
        ],
        "models": [
          {
            "id": "unit-foul-blightspawn-model-403c7b78f2",
            "title": "Foul Blightspawn",
            "aliases": [
              "Foul Blightspawn"
            ],
            "min": 1,
            "max": 1,
            "legacyIds": [
              "unit-foul-blightspawn-model-foul-blightspawn"
            ]
          }
        ],
        "compositionRules": [],
        "selections": [
          {
            "id": "unit-foul-blightspawn-selection-plague-sprayer",
            "title": "Plague sprayer",
            "aliases": [
              "Plague sprayer"
            ],
            "kind": "weapon",
            "profileIds": [
              "foul-blightspawn-weapon-plague-sprayer"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-foul-blightspawn-selection-close-combat-weapon",
            "title": "Close combat weapon",
            "aliases": [
              "Close combat weapon"
            ],
            "kind": "weapon",
            "profileIds": [
              "foul-blightspawn-weapon-close-combat-weapon"
            ],
            "wargearAbilityIds": []
          }
        ],
        "weaponFamilies": [],
        "weaponProfiles": [
          {
            "id": "foul-blightspawn-weapon-plague-sprayer",
            "title": "Plague sprayer",
            "mode": "ranged",
            "range": "12\"",
            "a": "D6",
            "skill": "N/A",
            "s": "7",
            "ap": "-2",
            "d": "2",
            "abilities": "ANTI-INFANTRY 2+, IGNORES COVER, TORRENT",
            "sourceSelectionIds": [
              "unit-foul-blightspawn-selection-plague-sprayer"
            ]
          },
          {
            "id": "foul-blightspawn-weapon-close-combat-weapon",
            "title": "Close combat weapon",
            "mode": "melee",
            "range": "Melee",
            "a": "4",
            "skill": "3+",
            "s": "4",
            "ap": "0",
            "d": "1",
            "abilities": "-",
            "sourceSelectionIds": [
              "unit-foul-blightspawn-selection-close-combat-weapon"
            ]
          }
        ],
        "wargearAbilities": []
      }
    },
    {
      "id": "unit-icon-bearer",
      "title": "Icon Bearer",
      "sourceBookId": "death-guard",
      "sourceLayer": "current",
      "intrinsicKeywords": [
        "INFANTRY",
        "CHARACTER",
        "GRENADES",
        "CHAOS",
        "NURGLE",
        "ICON BEARER",
        "DEATH GUARD"
      ],
      "relations": {
        "canLead": [
          {
            "unitId": "unit-plague-marines",
            "maxCharacters": 2
          }
        ],
        "canSupport": [
          {
            "unitId": "unit-plague-marines",
            "maxCharacters": 2
          }
        ],
        "canBeLedBy": [],
        "canBeSupportedBy": []
      },
      "ruleFacts": {
        "id": "unit-icon-bearer",
        "unitId": "unit-icon-bearer",
        "slug": "icon-bearer",
        "keywords": [
          "INFANTRY",
          "CHARACTER",
          "GRENADES",
          "CHAOS",
          "NURGLE",
          "ICON BEARER",
          "DEATH GUARD"
        ],
        "intrinsicKeywords": [
          "INFANTRY",
          "CHARACTER",
          "GRENADES",
          "CHAOS",
          "NURGLE",
          "ICON BEARER",
          "DEATH GUARD"
        ],
        "abilities": [
          "Leader",
          "Nurgle’s Gift (Aura)",
          "Unclean Icon",
          "Blessed Icon of Disease"
        ],
        "termIds": [
          "keyword-infantry",
          "keyword-character",
          "keyword-grenades",
          "keyword-chaos",
          "keyword-nurgle",
          "keyword-icon-bearer",
          "keyword-death-guard",
          "ability-unclean-icon-5dadb9e",
          "ability-blessed-icon-of-disease-e331a6c",
          "weapon-boltgun-ac624b6",
          "weapon-plague-knife-e275d62"
        ],
        "epic": false,
        "deadlyDemise": false,
        "attached": null,
        "attachmentKnown": false,
        "characterCount": 1,
        "twoCharacters": null,
        "warlord": null,
        "relations": {
          "canLead": [
            {
              "unitId": "unit-plague-marines",
              "maxCharacters": 2
            }
          ],
          "canSupport": [
            {
              "unitId": "unit-plague-marines",
              "maxCharacters": 2
            }
          ],
          "canBeLedBy": [],
          "canBeSupportedBy": []
        }
      },
      "gameSelections": {
        "stats": {
          "M": "5\"",
          "T": "6",
          "Sv": "3+",
          "W": "4",
          "Ld": "5+",
          "OC": "1"
        },
        "abilities": [
          {
            "id": "icon-bearer-ability-core",
            "sectionId": "icon-bearer-ability-core",
            "title": "CORE",
            "text": "Leader",
            "sourceUnitId": "unit-icon-bearer"
          },
          {
            "id": "icon-bearer-ability-faction",
            "sectionId": "icon-bearer-ability-faction",
            "title": "FACTION",
            "text": "Nurgle’s Gift (Aura)",
            "sourceUnitId": "unit-icon-bearer"
          },
          {
            "id": "icon-bearer-ability-unclean-icon",
            "sectionId": "icon-bearer-ability-unclean-icon",
            "title": "Unclean Icon",
            "text": "While this model is leading a unit, add 1 to the Objective Control characteristic of models in that unit.",
            "sourceUnitId": "unit-icon-bearer"
          },
          {
            "id": "icon-bearer-ability-blessed-icon-of-disease",
            "sectionId": "icon-bearer-ability-blessed-icon-of-disease",
            "title": "Blessed Icon of Disease",
            "text": "Once per battle, at the start of any phase, you can select one friendly DEATH GUARD unit that is Battle-shocked and within 12\" of this model. That unit is no longer Battle-shocked.",
            "sourceUnitId": "unit-icon-bearer"
          }
        ],
        "models": [
          {
            "id": "unit-icon-bearer-model-7d76658327",
            "title": "Icon Bearer",
            "aliases": [
              "Icon Bearer"
            ],
            "min": 1,
            "max": 1,
            "legacyIds": [
              "unit-icon-bearer-model-icon-bearer"
            ]
          }
        ],
        "compositionRules": [],
        "selections": [
          {
            "id": "unit-icon-bearer-selection-boltgun",
            "title": "Boltgun",
            "aliases": [
              "Boltgun"
            ],
            "kind": "weapon",
            "profileIds": [
              "icon-bearer-weapon-boltgun"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-icon-bearer-selection-plague-knife",
            "title": "Plague knife",
            "aliases": [
              "Plague knife"
            ],
            "kind": "weapon",
            "profileIds": [
              "icon-bearer-weapon-plague-knife"
            ],
            "wargearAbilityIds": []
          }
        ],
        "weaponFamilies": [],
        "weaponProfiles": [
          {
            "id": "icon-bearer-weapon-boltgun",
            "title": "Boltgun",
            "mode": "ranged",
            "range": "24\"",
            "a": "2",
            "skill": "3+",
            "s": "4",
            "ap": "0",
            "d": "1",
            "abilities": "LETHAL HITS",
            "sourceSelectionIds": [
              "unit-icon-bearer-selection-boltgun"
            ]
          },
          {
            "id": "icon-bearer-weapon-plague-knife",
            "title": "Plague knife",
            "mode": "melee",
            "range": "Melee",
            "a": "4",
            "skill": "3+",
            "s": "4",
            "ap": "0",
            "d": "1",
            "abilities": "LETHAL HITS",
            "sourceSelectionIds": [
              "unit-icon-bearer-selection-plague-knife"
            ]
          }
        ],
        "wargearAbilities": []
      }
    },
    {
      "id": "unit-lord-of-contagion",
      "title": "Lord of Contagion",
      "sourceBookId": "death-guard",
      "sourceLayer": "current",
      "intrinsicKeywords": [
        "INFANTRY",
        "CHARACTER",
        "GRENADES",
        "CHAOS",
        "NURGLE",
        "TERMINATOR",
        "LORD OF CONTAGION",
        "DEATH GUARD"
      ],
      "relations": {
        "canLead": [
          {
            "unitId": "unit-blightlord-terminators",
            "maxCharacters": 1
          },
          {
            "unitId": "unit-deathshroud-terminators",
            "maxCharacters": 1
          }
        ],
        "canSupport": [],
        "canBeLedBy": [],
        "canBeSupportedBy": []
      },
      "ruleFacts": {
        "id": "unit-lord-of-contagion",
        "unitId": "unit-lord-of-contagion",
        "slug": "lord-of-contagion",
        "keywords": [
          "INFANTRY",
          "CHARACTER",
          "GRENADES",
          "CHAOS",
          "NURGLE",
          "TERMINATOR",
          "LORD OF CONTAGION",
          "DEATH GUARD"
        ],
        "intrinsicKeywords": [
          "INFANTRY",
          "CHARACTER",
          "GRENADES",
          "CHAOS",
          "NURGLE",
          "TERMINATOR",
          "LORD OF CONTAGION",
          "DEATH GUARD"
        ],
        "abilities": [
          "Deep Strike",
          "Leader",
          "Nurgle’s Gift (Aura)",
          "Vector of Disease",
          "Unholy Resilience"
        ],
        "termIds": [
          "keyword-infantry",
          "keyword-character",
          "keyword-grenades",
          "keyword-chaos",
          "keyword-nurgle",
          "keyword-terminator",
          "keyword-lord-of-contagion",
          "keyword-death-guard",
          "ability-vector-of-disease-2498580",
          "ability-unholy-resilience-745069e",
          "weapon-manreaper-strike-cbe183b",
          "weapon-manreaper-sweep-b4c76ef"
        ],
        "epic": false,
        "deadlyDemise": false,
        "attached": null,
        "attachmentKnown": false,
        "characterCount": 1,
        "twoCharacters": null,
        "warlord": null,
        "relations": {
          "canLead": [
            {
              "unitId": "unit-blightlord-terminators",
              "maxCharacters": 1
            },
            {
              "unitId": "unit-deathshroud-terminators",
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
          "M": "5\"",
          "T": "7",
          "Sv": "2+",
          "W": "6",
          "Ld": "6+",
          "OC": "1",
          "Inv": "4+"
        },
        "abilities": [
          {
            "id": "lord-of-contagion-ability-core",
            "sectionId": "lord-of-contagion-ability-core",
            "title": "CORE",
            "text": "Deep Strike, Leader",
            "sourceUnitId": "unit-lord-of-contagion"
          },
          {
            "id": "lord-of-contagion-ability-faction",
            "sectionId": "lord-of-contagion-ability-faction",
            "title": "FACTION",
            "text": "Nurgle’s Gift (Aura)",
            "sourceUnitId": "unit-lord-of-contagion"
          },
          {
            "id": "lord-of-contagion-ability-vector-of-disease",
            "sectionId": "lord-of-contagion-ability-vector-of-disease",
            "title": "Vector of Disease",
            "text": "While this model is leading a unit, melee weapons equipped by models in that unit have the [SUSTAINED HITS 1] and [LANCE] abilities.",
            "sourceUnitId": "unit-lord-of-contagion"
          },
          {
            "id": "lord-of-contagion-ability-unholy-resilience",
            "sectionId": "lord-of-contagion-ability-unholy-resilience",
            "title": "Unholy Resilience",
            "text": "The first time a model with this ability is destroyed in a battle round, roll one D6 at the end of the phase. On a 2+, set that model back up on the battlefield, as close as possible to where it was destroyed and not within Engagement Range of any enemy units, with 3 wounds remaining. Each model can only be set up in this way once per battle.",
            "sourceUnitId": "unit-lord-of-contagion"
          }
        ],
        "models": [
          {
            "id": "unit-lord-of-contagion-model-54be47c1a3",
            "title": "Lord of Contagion",
            "aliases": [
              "Lord of Contagion"
            ],
            "min": 1,
            "max": 1,
            "legacyIds": [
              "unit-lord-of-contagion-model-lord-of-contagion"
            ]
          }
        ],
        "compositionRules": [],
        "selections": [
          {
            "id": "unit-lord-of-contagion-selection-manreaper-strike",
            "title": "Manreaper – strike",
            "aliases": [
              "Manreaper – strike"
            ],
            "kind": "weapon",
            "profileIds": [
              "lord-of-contagion-weapon-manreaper-strike"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-lord-of-contagion-selection-manreaper-sweep",
            "title": "Manreaper – sweep",
            "aliases": [
              "Manreaper – sweep"
            ],
            "kind": "weapon",
            "profileIds": [
              "lord-of-contagion-weapon-manreaper-sweep"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-lord-of-contagion-weapon-family-manreaper-selection",
            "title": "Manreaper",
            "aliases": [
              "Manreaper"
            ],
            "kind": "weapon",
            "familyId": "unit-lord-of-contagion-weapon-family-manreaper",
            "profileIds": [
              "lord-of-contagion-weapon-manreaper-strike",
              "lord-of-contagion-weapon-manreaper-sweep"
            ],
            "wargearAbilityIds": []
          }
        ],
        "weaponFamilies": [
          {
            "id": "unit-lord-of-contagion-weapon-family-manreaper",
            "title": "Manreaper",
            "aliases": [
              "Manreaper"
            ],
            "profileIds": [
              "lord-of-contagion-weapon-manreaper-strike",
              "lord-of-contagion-weapon-manreaper-sweep"
            ],
            "ambiguousAlias": false
          }
        ],
        "weaponProfiles": [
          {
            "id": "lord-of-contagion-weapon-manreaper-strike",
            "title": "Manreaper – strike",
            "mode": "melee",
            "range": "Melee",
            "a": "5",
            "skill": "2+",
            "s": "9",
            "ap": "-2",
            "d": "3",
            "abilities": "LETHAL HITS",
            "sourceSelectionIds": [
              "unit-lord-of-contagion-selection-manreaper-strike",
              "unit-lord-of-contagion-weapon-family-manreaper-selection"
            ]
          },
          {
            "id": "lord-of-contagion-weapon-manreaper-sweep",
            "title": "Manreaper – sweep",
            "mode": "melee",
            "range": "Melee",
            "a": "10",
            "skill": "2+",
            "s": "6",
            "ap": "-1",
            "d": "1",
            "abilities": "LETHAL HITS",
            "sourceSelectionIds": [
              "unit-lord-of-contagion-selection-manreaper-sweep",
              "unit-lord-of-contagion-weapon-family-manreaper-selection"
            ]
          }
        ],
        "wargearAbilities": []
      }
    },
    {
      "id": "unit-lord-of-poxes",
      "title": "Lord of Poxes",
      "sourceBookId": "death-guard",
      "sourceLayer": "current",
      "intrinsicKeywords": [
        "INFANTRY",
        "CHARACTER",
        "GRENADES",
        "CHAOS",
        "NURGLE",
        "LORD OF POXES",
        "DEATH GUARD"
      ],
      "relations": {
        "canLead": [
          {
            "unitId": "unit-plague-marines",
            "maxCharacters": 2
          }
        ],
        "canSupport": [],
        "canBeLedBy": [],
        "canBeSupportedBy": []
      },
      "ruleFacts": {
        "id": "unit-lord-of-poxes",
        "unitId": "unit-lord-of-poxes",
        "slug": "lord-of-poxes",
        "keywords": [
          "INFANTRY",
          "CHARACTER",
          "GRENADES",
          "CHAOS",
          "NURGLE",
          "LORD OF POXES",
          "DEATH GUARD"
        ],
        "intrinsicKeywords": [
          "INFANTRY",
          "CHARACTER",
          "GRENADES",
          "CHAOS",
          "NURGLE",
          "LORD OF POXES",
          "DEATH GUARD"
        ],
        "abilities": [
          "Leader",
          "Nurgle’s Gift (Aura)",
          "Gift of Poxes",
          "Shroud of Disease"
        ],
        "termIds": [
          "keyword-infantry",
          "keyword-character",
          "keyword-grenades",
          "keyword-chaos",
          "keyword-nurgle",
          "keyword-lord-of-poxes",
          "keyword-death-guard",
          "ability-gift-of-poxes-29d6059",
          "ability-shroud-of-disease-90475da",
          "weapon-plasma-pistol-standard-95a88d7",
          "weapon-plasma-pistol-supercharge-f0893d1",
          "weapon-great-plague-blade-7db21af"
        ],
        "epic": false,
        "deadlyDemise": false,
        "attached": null,
        "attachmentKnown": false,
        "characterCount": 1,
        "twoCharacters": null,
        "warlord": null,
        "relations": {
          "canLead": [
            {
              "unitId": "unit-plague-marines",
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
          "M": "5\"",
          "T": "6",
          "Sv": "3+",
          "W": "5",
          "Ld": "6+",
          "OC": "1",
          "Inv": "4+"
        },
        "abilities": [
          {
            "id": "lord-of-poxes-ability-core",
            "sectionId": "lord-of-poxes-ability-core",
            "title": "CORE",
            "text": "Leader",
            "sourceUnitId": "unit-lord-of-poxes"
          },
          {
            "id": "lord-of-poxes-ability-faction",
            "sectionId": "lord-of-poxes-ability-faction",
            "title": "FACTION",
            "text": "Nurgle’s Gift (Aura)",
            "sourceUnitId": "unit-lord-of-poxes"
          },
          {
            "id": "lord-of-poxes-ability-gift-of-poxes",
            "sectionId": "lord-of-poxes-ability-gift-of-poxes",
            "title": "Gift of Poxes",
            "text": "Add 3\" to the range of this model’s Contagion Range.",
            "sourceUnitId": "unit-lord-of-poxes"
          },
          {
            "id": "lord-of-poxes-ability-shroud-of-disease",
            "sectionId": "lord-of-poxes-ability-shroud-of-disease",
            "title": "Shroud of Disease",
            "text": "While this model is leading a unit, that unit cannot be targeted by ranged attacks unless the attacking model is within 18\".",
            "sourceUnitId": "unit-lord-of-poxes"
          }
        ],
        "models": [
          {
            "id": "unit-lord-of-poxes-model-9e391e4d49",
            "title": "Lord of Poxes",
            "aliases": [
              "Lord of Poxes"
            ],
            "min": 1,
            "max": 1,
            "legacyIds": [
              "unit-lord-of-poxes-model-lord-of-poxes"
            ]
          }
        ],
        "compositionRules": [],
        "selections": [
          {
            "id": "unit-lord-of-poxes-selection-plasma-pistol-standard",
            "title": "Plasma pistol – standard",
            "aliases": [
              "Plasma pistol – standard"
            ],
            "kind": "weapon",
            "profileIds": [
              "lord-of-poxes-weapon-plasma-pistol-standard"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-lord-of-poxes-selection-plasma-pistol-supercharge",
            "title": "Plasma pistol – supercharge",
            "aliases": [
              "Plasma pistol – supercharge"
            ],
            "kind": "weapon",
            "profileIds": [
              "lord-of-poxes-weapon-plasma-pistol-supercharge"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-lord-of-poxes-selection-great-plague-blade",
            "title": "Great plague blade",
            "aliases": [
              "Great plague blade"
            ],
            "kind": "weapon",
            "profileIds": [
              "lord-of-poxes-weapon-great-plague-blade"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-lord-of-poxes-weapon-family-plasma-pistol-selection",
            "title": "Plasma pistol",
            "aliases": [
              "Plasma pistol"
            ],
            "kind": "weapon",
            "familyId": "unit-lord-of-poxes-weapon-family-plasma-pistol",
            "profileIds": [
              "lord-of-poxes-weapon-plasma-pistol-standard",
              "lord-of-poxes-weapon-plasma-pistol-supercharge"
            ],
            "wargearAbilityIds": []
          }
        ],
        "weaponFamilies": [
          {
            "id": "unit-lord-of-poxes-weapon-family-plasma-pistol",
            "title": "Plasma pistol",
            "aliases": [
              "Plasma pistol"
            ],
            "profileIds": [
              "lord-of-poxes-weapon-plasma-pistol-standard",
              "lord-of-poxes-weapon-plasma-pistol-supercharge"
            ],
            "ambiguousAlias": false
          }
        ],
        "weaponProfiles": [
          {
            "id": "lord-of-poxes-weapon-plasma-pistol-standard",
            "title": "Plasma pistol – standard",
            "mode": "ranged",
            "range": "12\"",
            "a": "1",
            "skill": "2+",
            "s": "7",
            "ap": "-2",
            "d": "1",
            "abilities": "PISTOL",
            "sourceSelectionIds": [
              "unit-lord-of-poxes-selection-plasma-pistol-standard",
              "unit-lord-of-poxes-weapon-family-plasma-pistol-selection"
            ]
          },
          {
            "id": "lord-of-poxes-weapon-plasma-pistol-supercharge",
            "title": "Plasma pistol – supercharge",
            "mode": "ranged",
            "range": "12\"",
            "a": "1",
            "skill": "2+",
            "s": "8",
            "ap": "-3",
            "d": "2",
            "abilities": "HAZARDOUS, PISTOL",
            "sourceSelectionIds": [
              "unit-lord-of-poxes-selection-plasma-pistol-supercharge",
              "unit-lord-of-poxes-weapon-family-plasma-pistol-selection"
            ]
          },
          {
            "id": "lord-of-poxes-weapon-great-plague-blade",
            "title": "Great plague blade",
            "mode": "melee",
            "range": "Melee",
            "a": "6",
            "skill": "2+",
            "s": "8",
            "ap": "-2",
            "d": "2",
            "abilities": "DEVASTATING WOUNDS, LETHAL HITS",
            "sourceSelectionIds": [
              "unit-lord-of-poxes-selection-great-plague-blade"
            ]
          }
        ],
        "wargearAbilities": []
      }
    },
    {
      "id": "unit-lord-of-virulence",
      "title": "Lord of Virulence",
      "sourceBookId": "death-guard",
      "sourceLayer": "current",
      "intrinsicKeywords": [
        "INFANTRY",
        "CHARACTER",
        "CHAOS",
        "NURGLE",
        "TERMINATOR",
        "LORD OF VIRULENCE",
        "DEATH GUARD"
      ],
      "relations": {
        "canLead": [
          {
            "unitId": "unit-blightlord-terminators",
            "maxCharacters": 1
          },
          {
            "unitId": "unit-deathshroud-terminators",
            "maxCharacters": 1
          }
        ],
        "canSupport": [],
        "canBeLedBy": [],
        "canBeSupportedBy": []
      },
      "ruleFacts": {
        "id": "unit-lord-of-virulence",
        "unitId": "unit-lord-of-virulence",
        "slug": "lord-of-virulence",
        "keywords": [
          "INFANTRY",
          "CHARACTER",
          "CHAOS",
          "NURGLE",
          "TERMINATOR",
          "LORD OF VIRULENCE",
          "DEATH GUARD"
        ],
        "intrinsicKeywords": [
          "INFANTRY",
          "CHARACTER",
          "CHAOS",
          "NURGLE",
          "TERMINATOR",
          "LORD OF VIRULENCE",
          "DEATH GUARD"
        ],
        "abilities": [
          "Deep Strike",
          "Leader",
          "Nurgle’s Gift (Aura)",
          "Virulent Aura",
          "Blight Bombardment"
        ],
        "termIds": [
          "keyword-infantry",
          "keyword-character",
          "keyword-chaos",
          "keyword-nurgle",
          "keyword-terminator",
          "keyword-lord-of-virulence",
          "keyword-death-guard",
          "ability-virulent-aura-c28aa51",
          "ability-blight-bombardment-74bfb5b",
          "weapon-twin-plague-spewer-4c289ca",
          "weapon-power-fist-5e121c4"
        ],
        "epic": false,
        "deadlyDemise": false,
        "attached": null,
        "attachmentKnown": false,
        "characterCount": 1,
        "twoCharacters": null,
        "warlord": null,
        "relations": {
          "canLead": [
            {
              "unitId": "unit-blightlord-terminators",
              "maxCharacters": 1
            },
            {
              "unitId": "unit-deathshroud-terminators",
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
          "M": "5\"",
          "T": "7",
          "Sv": "2+",
          "W": "6",
          "Ld": "6+",
          "OC": "1",
          "Inv": "4+"
        },
        "abilities": [
          {
            "id": "lord-of-virulence-ability-core",
            "sectionId": "lord-of-virulence-ability-core",
            "title": "CORE",
            "text": "Deep Strike, Leader",
            "sourceUnitId": "unit-lord-of-virulence"
          },
          {
            "id": "lord-of-virulence-ability-faction",
            "sectionId": "lord-of-virulence-ability-faction",
            "title": "FACTION",
            "text": "Nurgle’s Gift (Aura)",
            "sourceUnitId": "unit-lord-of-virulence"
          },
          {
            "id": "lord-of-virulence-ability-virulent-aura",
            "sectionId": "lord-of-virulence-ability-virulent-aura",
            "title": "Virulent Aura",
            "text": "While this model is leading a unit, each time a model in that unit makes a ranged attack, you can re-roll the Wound roll.",
            "sourceUnitId": "unit-lord-of-virulence"
          },
          {
            "id": "lord-of-virulence-ability-blight-bombardment",
            "sectionId": "lord-of-virulence-ability-blight-bombardment",
            "title": "Blight Bombardment",
            "text": "At the start of your Shooting phase, select one enemy unit within 30\" of and visible to this model. Until the end of the phase, each time a friendly DEATH GUARD model makes a ranged attack that targets that unit, re-roll a Hit roll of 1 (if that attack is made with a Blast weapon, you can re-roll the Hit roll instead).",
            "sourceUnitId": "unit-lord-of-virulence"
          }
        ],
        "models": [
          {
            "id": "unit-lord-of-virulence-model-588d1c6b39",
            "title": "Lord of Virulence",
            "aliases": [
              "Lord of Virulence"
            ],
            "min": 1,
            "max": 1,
            "legacyIds": [
              "unit-lord-of-virulence-model-lord-of-virulence"
            ]
          }
        ],
        "compositionRules": [],
        "selections": [
          {
            "id": "unit-lord-of-virulence-selection-twin-plague-spewer",
            "title": "Twin plague spewer",
            "aliases": [
              "Twin plague spewer"
            ],
            "kind": "weapon",
            "profileIds": [
              "lord-of-virulence-weapon-twin-plague-spewer"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-lord-of-virulence-selection-power-fist",
            "title": "Power fist",
            "aliases": [
              "Power fist"
            ],
            "kind": "weapon",
            "profileIds": [
              "lord-of-virulence-weapon-power-fist"
            ],
            "wargearAbilityIds": []
          }
        ],
        "weaponFamilies": [],
        "weaponProfiles": [
          {
            "id": "lord-of-virulence-weapon-twin-plague-spewer",
            "title": "Twin plague spewer",
            "mode": "ranged",
            "range": "12\"",
            "a": "D6",
            "skill": "N/A",
            "s": "5",
            "ap": "-1",
            "d": "1",
            "abilities": "ANTI-INFANTRY 2+, IGNORES COVER, TORRENT, TWIN-LINKED",
            "sourceSelectionIds": [
              "unit-lord-of-virulence-selection-twin-plague-spewer"
            ]
          },
          {
            "id": "lord-of-virulence-weapon-power-fist",
            "title": "Power fist",
            "mode": "melee",
            "range": "Melee",
            "a": "5",
            "skill": "2+",
            "s": "8",
            "ap": "-2",
            "d": "2",
            "abilities": "LETHAL HITS",
            "sourceSelectionIds": [
              "unit-lord-of-virulence-selection-power-fist"
            ]
          }
        ],
        "wargearAbilities": []
      }
    },
    {
      "id": "unit-malignant-plaguecaster",
      "title": "Malignant Plaguecaster",
      "sourceBookId": "death-guard",
      "sourceLayer": "current",
      "intrinsicKeywords": [
        "INFANTRY",
        "CHARACTER",
        "PSYKER",
        "CHAOS",
        "NURGLE",
        "MALIGNANT PLAGUECASTER",
        "DEATH GUARD"
      ],
      "relations": {
        "canLead": [
          {
            "unitId": "unit-plague-marines",
            "maxCharacters": 2
          },
          {
            "unitId": "unit-poxwalkers",
            "maxCharacters": 2
          }
        ],
        "canSupport": [],
        "canBeLedBy": [],
        "canBeSupportedBy": []
      },
      "ruleFacts": {
        "id": "unit-malignant-plaguecaster",
        "unitId": "unit-malignant-plaguecaster",
        "slug": "malignant-plaguecaster",
        "keywords": [
          "INFANTRY",
          "CHARACTER",
          "PSYKER",
          "CHAOS",
          "NURGLE",
          "MALIGNANT PLAGUECASTER",
          "DEATH GUARD"
        ],
        "intrinsicKeywords": [
          "INFANTRY",
          "CHARACTER",
          "PSYKER",
          "CHAOS",
          "NURGLE",
          "MALIGNANT PLAGUECASTER",
          "DEATH GUARD"
        ],
        "abilities": [
          "Leader",
          "Nurgle’s Gift (Aura)",
          "Gift of Contagion (Psychic)",
          "Pestilent Fallout (Psychic)"
        ],
        "termIds": [
          "keyword-infantry",
          "keyword-character",
          "keyword-psyker",
          "keyword-chaos",
          "keyword-nurgle",
          "keyword-malignant-plaguecaster",
          "keyword-death-guard",
          "ability-gift-of-contagion-psychic-4fea300",
          "ability-pestilent-fallout-psychic-399986c",
          "weapon-bolt-pistol-4457cbc",
          "weapon-plague-wind-witchfire-9c986c4",
          "weapon-plague-wind-focused-witchfire-6ca78d4",
          "weapon-corrupted-staff-4829d29"
        ],
        "epic": false,
        "deadlyDemise": false,
        "attached": null,
        "attachmentKnown": false,
        "characterCount": 1,
        "twoCharacters": null,
        "warlord": null,
        "relations": {
          "canLead": [
            {
              "unitId": "unit-plague-marines",
              "maxCharacters": 2
            },
            {
              "unitId": "unit-poxwalkers",
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
          "M": "5\"",
          "T": "6",
          "Sv": "3+",
          "W": "4",
          "Ld": "6+",
          "OC": "1"
        },
        "abilities": [
          {
            "id": "malignant-plaguecaster-ability-core",
            "sectionId": "malignant-plaguecaster-ability-core",
            "title": "CORE",
            "text": "Leader",
            "sourceUnitId": "unit-malignant-plaguecaster"
          },
          {
            "id": "malignant-plaguecaster-ability-faction",
            "sectionId": "malignant-plaguecaster-ability-faction",
            "title": "FACTION",
            "text": "Nurgle’s Gift (Aura)",
            "sourceUnitId": "unit-malignant-plaguecaster"
          },
          {
            "id": "malignant-plaguecaster-ability-gift-of-contagion-psychic",
            "sectionId": "malignant-plaguecaster-ability-gift-of-contagion-psychic",
            "title": "Gift of Contagion (Psychic)",
            "text": "While this model is leading a unit, each time a model in that unit makes an attack that targets a unit that is Afflicted, that attack has the [SUSTAINED HITS 1] ability.",
            "sourceUnitId": "unit-malignant-plaguecaster"
          },
          {
            "id": "malignant-plaguecaster-ability-pestilent-fallout-psychic",
            "sectionId": "malignant-plaguecaster-ability-pestilent-fallout-psychic",
            "title": "Pestilent Fallout (Psychic)",
            "text": "In your Shooting phase, after this model has shot, select one enemy INFANTRY unit hit by one or more of those attacks made with its Plague Wind. Until the end of your opponent’s next turn, that unit is enfeebled. While a unit is enfeebled, subtract 2\" from the Move characteristic of models in that unit.",
            "sourceUnitId": "unit-malignant-plaguecaster"
          }
        ],
        "models": [
          {
            "id": "unit-malignant-plaguecaster-model-bce1443944",
            "title": "Malignant Plaguecaster",
            "aliases": [
              "Malignant Plaguecaster"
            ],
            "min": 1,
            "max": 1,
            "legacyIds": [
              "unit-malignant-plaguecaster-model-malignant-plaguecaster"
            ]
          }
        ],
        "compositionRules": [],
        "selections": [
          {
            "id": "unit-malignant-plaguecaster-selection-bolt-pistol",
            "title": "Bolt pistol",
            "aliases": [
              "Bolt pistol"
            ],
            "kind": "weapon",
            "profileIds": [
              "malignant-plaguecaster-weapon-bolt-pistol"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-malignant-plaguecaster-selection-plague-wind-witchfire",
            "title": "Plague Wind – witchfire",
            "aliases": [
              "Plague Wind – witchfire"
            ],
            "kind": "weapon",
            "profileIds": [
              "malignant-plaguecaster-weapon-plague-wind-witchfire"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-malignant-plaguecaster-selection-plague-wind-focused-witchfire",
            "title": "Plague Wind – focused witchfire",
            "aliases": [
              "Plague Wind – focused witchfire"
            ],
            "kind": "weapon",
            "profileIds": [
              "malignant-plaguecaster-weapon-plague-wind-focused-witchfire"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-malignant-plaguecaster-selection-corrupted-staff",
            "title": "Corrupted staff",
            "aliases": [
              "Corrupted staff"
            ],
            "kind": "weapon",
            "profileIds": [
              "malignant-plaguecaster-weapon-corrupted-staff"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-malignant-plaguecaster-weapon-family-plague-wind-selection",
            "title": "Plague Wind",
            "aliases": [
              "Plague Wind"
            ],
            "kind": "weapon",
            "familyId": "unit-malignant-plaguecaster-weapon-family-plague-wind",
            "profileIds": [
              "malignant-plaguecaster-weapon-plague-wind-witchfire",
              "malignant-plaguecaster-weapon-plague-wind-focused-witchfire"
            ],
            "wargearAbilityIds": []
          }
        ],
        "weaponFamilies": [
          {
            "id": "unit-malignant-plaguecaster-weapon-family-plague-wind",
            "title": "Plague Wind",
            "aliases": [
              "Plague Wind"
            ],
            "profileIds": [
              "malignant-plaguecaster-weapon-plague-wind-witchfire",
              "malignant-plaguecaster-weapon-plague-wind-focused-witchfire"
            ],
            "ambiguousAlias": false
          }
        ],
        "weaponProfiles": [
          {
            "id": "malignant-plaguecaster-weapon-bolt-pistol",
            "title": "Bolt pistol",
            "mode": "ranged",
            "range": "12\"",
            "a": "1",
            "skill": "3+",
            "s": "4",
            "ap": "0",
            "d": "1",
            "abilities": "LETHAL HITS, PISTOL",
            "sourceSelectionIds": [
              "unit-malignant-plaguecaster-selection-bolt-pistol"
            ]
          },
          {
            "id": "malignant-plaguecaster-weapon-plague-wind-witchfire",
            "title": "Plague Wind – witchfire",
            "mode": "ranged",
            "range": "12\"",
            "a": "D6",
            "skill": "N/A",
            "s": "4",
            "ap": "-1",
            "d": "D3",
            "abilities": "PSYCHIC, TORRENT",
            "sourceSelectionIds": [
              "unit-malignant-plaguecaster-selection-plague-wind-witchfire",
              "unit-malignant-plaguecaster-weapon-family-plague-wind-selection"
            ]
          },
          {
            "id": "malignant-plaguecaster-weapon-plague-wind-focused-witchfire",
            "title": "Plague Wind – focused witchfire",
            "mode": "ranged",
            "range": "12\"",
            "a": "D6+3",
            "skill": "N/A",
            "s": "6",
            "ap": "-2",
            "d": "D3",
            "abilities": "HAZARDOUS, PSYCHIC, TORRENT",
            "sourceSelectionIds": [
              "unit-malignant-plaguecaster-selection-plague-wind-focused-witchfire",
              "unit-malignant-plaguecaster-weapon-family-plague-wind-selection"
            ]
          },
          {
            "id": "malignant-plaguecaster-weapon-corrupted-staff",
            "title": "Corrupted staff",
            "mode": "melee",
            "range": "Melee",
            "a": "4",
            "skill": "3+",
            "s": "6",
            "ap": "-1",
            "d": "D3",
            "abilities": "LETHAL HITS, PSYCHIC",
            "sourceSelectionIds": [
              "unit-malignant-plaguecaster-selection-corrupted-staff"
            ]
          }
        ],
        "wargearAbilities": []
      }
    },
    {
      "id": "unit-noxious-blightbringer",
      "title": "Noxious Blightbringer",
      "sourceBookId": "death-guard",
      "sourceLayer": "current",
      "intrinsicKeywords": [
        "INFANTRY",
        "CHARACTER",
        "CHAOS",
        "NURGLE",
        "NOXIOUS BLIGHTBRINGER",
        "DEATH GUARD"
      ],
      "relations": {
        "canLead": [
          {
            "unitId": "unit-plague-marines",
            "maxCharacters": 2
          },
          {
            "unitId": "unit-poxwalkers",
            "maxCharacters": 2
          }
        ],
        "canSupport": [
          {
            "unitId": "unit-plague-marines",
            "maxCharacters": 2
          },
          {
            "unitId": "unit-poxwalkers",
            "maxCharacters": 2
          }
        ],
        "canBeLedBy": [],
        "canBeSupportedBy": []
      },
      "ruleFacts": {
        "id": "unit-noxious-blightbringer",
        "unitId": "unit-noxious-blightbringer",
        "slug": "noxious-blightbringer",
        "keywords": [
          "INFANTRY",
          "CHARACTER",
          "CHAOS",
          "NURGLE",
          "NOXIOUS BLIGHTBRINGER",
          "DEATH GUARD"
        ],
        "intrinsicKeywords": [
          "INFANTRY",
          "CHARACTER",
          "CHAOS",
          "NURGLE",
          "NOXIOUS BLIGHTBRINGER",
          "DEATH GUARD"
        ],
        "abilities": [
          "Leader",
          "Nurgle’s Gift (Aura)",
          "Sickening Vitality",
          "Tocsin of Misery (Aura)"
        ],
        "termIds": [
          "keyword-infantry",
          "keyword-character",
          "keyword-chaos",
          "keyword-nurgle",
          "keyword-noxious-blightbringer",
          "keyword-death-guard",
          "ability-sickening-vitality-89bb5ff",
          "ability-tocsin-of-misery-aura-7f2edfb",
          "weapon-plasma-pistol-standard-4eac6a8",
          "weapon-plasma-pistol-supercharge-16a6bac",
          "weapon-cursed-plague-bell-f7341e3"
        ],
        "epic": false,
        "deadlyDemise": false,
        "attached": null,
        "attachmentKnown": false,
        "characterCount": 1,
        "twoCharacters": null,
        "warlord": null,
        "relations": {
          "canLead": [
            {
              "unitId": "unit-plague-marines",
              "maxCharacters": 2
            },
            {
              "unitId": "unit-poxwalkers",
              "maxCharacters": 2
            }
          ],
          "canSupport": [
            {
              "unitId": "unit-plague-marines",
              "maxCharacters": 2
            },
            {
              "unitId": "unit-poxwalkers",
              "maxCharacters": 2
            }
          ],
          "canBeLedBy": [],
          "canBeSupportedBy": []
        }
      },
      "gameSelections": {
        "stats": {
          "M": "5\"",
          "T": "6",
          "Sv": "3+",
          "W": "4",
          "Ld": "6+",
          "OC": "1"
        },
        "abilities": [
          {
            "id": "noxious-blightbringer-ability-core",
            "sectionId": "noxious-blightbringer-ability-core",
            "title": "CORE",
            "text": "Leader",
            "sourceUnitId": "unit-noxious-blightbringer"
          },
          {
            "id": "noxious-blightbringer-ability-faction",
            "sectionId": "noxious-blightbringer-ability-faction",
            "title": "FACTION",
            "text": "Nurgle’s Gift (Aura)",
            "sourceUnitId": "unit-noxious-blightbringer"
          },
          {
            "id": "noxious-blightbringer-ability-sickening-vitality",
            "sectionId": "noxious-blightbringer-ability-sickening-vitality",
            "title": "Sickening Vitality",
            "text": "While this model is leading a unit, add 1\" to the Move characteristic of models in that unit and you can re-roll Advance and Charge rolls made for that unit.",
            "sourceUnitId": "unit-noxious-blightbringer"
          },
          {
            "id": "noxious-blightbringer-ability-tocsin-of-misery-aura",
            "sectionId": "noxious-blightbringer-ability-tocsin-of-misery-aura",
            "title": "Tocsin of Misery (Aura)",
            "text": "In the Battle-shock step of your opponent’s Command phase, if an enemy unit that is below its Starting Strength is within 9\" of this model, that enemy unit must take a Battle-shock test, subtracting 1 from that test if it is a PSYKER unit.",
            "sourceUnitId": "unit-noxious-blightbringer"
          }
        ],
        "models": [
          {
            "id": "unit-noxious-blightbringer-model-0afa893a75",
            "title": "Noxious Blightbringer",
            "aliases": [
              "Noxious Blightbringer"
            ],
            "min": 1,
            "max": 1,
            "legacyIds": [
              "unit-noxious-blightbringer-model-noxious-blightbringer"
            ]
          }
        ],
        "compositionRules": [],
        "selections": [
          {
            "id": "unit-noxious-blightbringer-selection-plasma-pistol-standard",
            "title": "Plasma pistol – standard",
            "aliases": [
              "Plasma pistol – standard"
            ],
            "kind": "weapon",
            "profileIds": [
              "noxious-blightbringer-weapon-plasma-pistol-standard"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-noxious-blightbringer-selection-plasma-pistol-supercharge",
            "title": "Plasma pistol – supercharge",
            "aliases": [
              "Plasma pistol – supercharge"
            ],
            "kind": "weapon",
            "profileIds": [
              "noxious-blightbringer-weapon-plasma-pistol-supercharge"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-noxious-blightbringer-selection-cursed-plague-bell",
            "title": "Cursed plague bell",
            "aliases": [
              "Cursed plague bell"
            ],
            "kind": "weapon",
            "profileIds": [
              "noxious-blightbringer-weapon-cursed-plague-bell"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-noxious-blightbringer-weapon-family-plasma-pistol-selection",
            "title": "Plasma pistol",
            "aliases": [
              "Plasma pistol"
            ],
            "kind": "weapon",
            "familyId": "unit-noxious-blightbringer-weapon-family-plasma-pistol",
            "profileIds": [
              "noxious-blightbringer-weapon-plasma-pistol-standard",
              "noxious-blightbringer-weapon-plasma-pistol-supercharge"
            ],
            "wargearAbilityIds": []
          }
        ],
        "weaponFamilies": [
          {
            "id": "unit-noxious-blightbringer-weapon-family-plasma-pistol",
            "title": "Plasma pistol",
            "aliases": [
              "Plasma pistol"
            ],
            "profileIds": [
              "noxious-blightbringer-weapon-plasma-pistol-standard",
              "noxious-blightbringer-weapon-plasma-pistol-supercharge"
            ],
            "ambiguousAlias": false
          }
        ],
        "weaponProfiles": [
          {
            "id": "noxious-blightbringer-weapon-plasma-pistol-standard",
            "title": "Plasma pistol – standard",
            "mode": "ranged",
            "range": "12\"",
            "a": "1",
            "skill": "3+",
            "s": "7",
            "ap": "-2",
            "d": "1",
            "abilities": "PISTOL",
            "sourceSelectionIds": [
              "unit-noxious-blightbringer-selection-plasma-pistol-standard",
              "unit-noxious-blightbringer-weapon-family-plasma-pistol-selection"
            ]
          },
          {
            "id": "noxious-blightbringer-weapon-plasma-pistol-supercharge",
            "title": "Plasma pistol – supercharge",
            "mode": "ranged",
            "range": "12\"",
            "a": "1",
            "skill": "3+",
            "s": "8",
            "ap": "-3",
            "d": "2",
            "abilities": "PISTOL, HAZARDOUS",
            "sourceSelectionIds": [
              "unit-noxious-blightbringer-selection-plasma-pistol-supercharge",
              "unit-noxious-blightbringer-weapon-family-plasma-pistol-selection"
            ]
          },
          {
            "id": "noxious-blightbringer-weapon-cursed-plague-bell",
            "title": "Cursed plague bell",
            "mode": "melee",
            "range": "Melee",
            "a": "5",
            "skill": "3+",
            "s": "4",
            "ap": "0",
            "d": "2",
            "abilities": "ANTI-PSYKER 2+, LETHAL HITS",
            "sourceSelectionIds": [
              "unit-noxious-blightbringer-selection-cursed-plague-bell"
            ]
          }
        ],
        "wargearAbilities": []
      }
    },
    {
      "id": "unit-plague-surgeon",
      "title": "Plague Surgeon",
      "sourceBookId": "death-guard",
      "sourceLayer": "current",
      "intrinsicKeywords": [
        "INFANTRY",
        "CHARACTER",
        "CHAOS",
        "NURGLE",
        "PLAGUE SURGEON",
        "DEATH GUARD"
      ],
      "relations": {
        "canLead": [
          {
            "unitId": "unit-plague-marines",
            "maxCharacters": 2
          }
        ],
        "canSupport": [
          {
            "unitId": "unit-plague-marines",
            "maxCharacters": 2
          }
        ],
        "canBeLedBy": [],
        "canBeSupportedBy": []
      },
      "ruleFacts": {
        "id": "unit-plague-surgeon",
        "unitId": "unit-plague-surgeon",
        "slug": "plague-surgeon",
        "keywords": [
          "INFANTRY",
          "CHARACTER",
          "CHAOS",
          "NURGLE",
          "PLAGUE SURGEON",
          "DEATH GUARD"
        ],
        "intrinsicKeywords": [
          "INFANTRY",
          "CHARACTER",
          "CHAOS",
          "NURGLE",
          "PLAGUE SURGEON",
          "DEATH GUARD"
        ],
        "abilities": [
          "Leader",
          "Nurgle’s Gift (Aura)",
          "Tainted Narthecium",
          "Inflamed Infections"
        ],
        "termIds": [
          "keyword-infantry",
          "keyword-character",
          "keyword-chaos",
          "keyword-nurgle",
          "keyword-plague-surgeon",
          "keyword-death-guard",
          "ability-tainted-narthecium-01ba1bd",
          "ability-inflamed-infections-ca01e1a",
          "weapon-bolt-pistol-4457cbc",
          "weapon-balesword-682b3cf"
        ],
        "epic": false,
        "deadlyDemise": false,
        "attached": null,
        "attachmentKnown": false,
        "characterCount": 1,
        "twoCharacters": null,
        "warlord": null,
        "relations": {
          "canLead": [
            {
              "unitId": "unit-plague-marines",
              "maxCharacters": 2
            }
          ],
          "canSupport": [
            {
              "unitId": "unit-plague-marines",
              "maxCharacters": 2
            }
          ],
          "canBeLedBy": [],
          "canBeSupportedBy": []
        }
      },
      "gameSelections": {
        "stats": {
          "M": "5\"",
          "T": "6",
          "Sv": "3+",
          "W": "4",
          "Ld": "6+",
          "OC": "1"
        },
        "abilities": [
          {
            "id": "plague-surgeon-ability-core",
            "sectionId": "plague-surgeon-ability-core",
            "title": "CORE",
            "text": "Leader",
            "sourceUnitId": "unit-plague-surgeon"
          },
          {
            "id": "plague-surgeon-ability-faction",
            "sectionId": "plague-surgeon-ability-faction",
            "title": "FACTION",
            "text": "Nurgle’s Gift (Aura)",
            "sourceUnitId": "unit-plague-surgeon"
          },
          {
            "id": "plague-surgeon-ability-tainted-narthecium",
            "sectionId": "plague-surgeon-ability-tainted-narthecium",
            "title": "Tainted Narthecium",
            "text": "While this model is leading a unit, in your Command phase, you can return 1 destroyed Bodyguard model to that unit.",
            "sourceUnitId": "unit-plague-surgeon"
          },
          {
            "id": "plague-surgeon-ability-inflamed-infections",
            "sectionId": "plague-surgeon-ability-inflamed-infections",
            "title": "Inflamed Infections",
            "text": "At the start of the Fight phase, select one enemy unit within Engagement Range of this model. Until the end of the phase, each time this model makes an attack that targets that unit, an unmodified Hit roll of 5+ scores a Critical Hit. If that unit is Below Half-strength, an unmodified Hit roll of 4+ scores a Critical Hit instead.",
            "sourceUnitId": "unit-plague-surgeon"
          }
        ],
        "models": [
          {
            "id": "unit-plague-surgeon-model-33dcf9e18f",
            "title": "Plague Surgeon",
            "aliases": [
              "Plague Surgeon"
            ],
            "min": 1,
            "max": 1,
            "legacyIds": [
              "unit-plague-surgeon-model-plague-surgeon"
            ]
          }
        ],
        "compositionRules": [],
        "selections": [
          {
            "id": "unit-plague-surgeon-selection-bolt-pistol",
            "title": "Bolt pistol",
            "aliases": [
              "Bolt pistol"
            ],
            "kind": "weapon",
            "profileIds": [
              "plague-surgeon-weapon-bolt-pistol"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-plague-surgeon-selection-balesword",
            "title": "Balesword",
            "aliases": [
              "Balesword"
            ],
            "kind": "weapon",
            "profileIds": [
              "plague-surgeon-weapon-balesword"
            ],
            "wargearAbilityIds": []
          }
        ],
        "weaponFamilies": [],
        "weaponProfiles": [
          {
            "id": "plague-surgeon-weapon-bolt-pistol",
            "title": "Bolt pistol",
            "mode": "ranged",
            "range": "12\"",
            "a": "1",
            "skill": "3+",
            "s": "4",
            "ap": "0",
            "d": "1",
            "abilities": "LETHAL HITS, PISTOL",
            "sourceSelectionIds": [
              "unit-plague-surgeon-selection-bolt-pistol"
            ]
          },
          {
            "id": "plague-surgeon-weapon-balesword",
            "title": "Balesword",
            "mode": "melee",
            "range": "Melee",
            "a": "4",
            "skill": "3+",
            "s": "5",
            "ap": "-2",
            "d": "2",
            "abilities": "LETHAL HITS",
            "sourceSelectionIds": [
              "unit-plague-surgeon-selection-balesword"
            ]
          }
        ],
        "wargearAbilities": []
      }
    },
    {
      "id": "unit-tallyman",
      "title": "Tallyman",
      "sourceBookId": "death-guard",
      "sourceLayer": "current",
      "intrinsicKeywords": [
        "INFANTRY",
        "CHARACTER",
        "CHAOS",
        "NURGLE",
        "TALLYMAN",
        "DEATH GUARD"
      ],
      "relations": {
        "canLead": [
          {
            "unitId": "unit-plague-marines",
            "maxCharacters": 2
          }
        ],
        "canSupport": [
          {
            "unitId": "unit-plague-marines",
            "maxCharacters": 2
          }
        ],
        "canBeLedBy": [],
        "canBeSupportedBy": []
      },
      "ruleFacts": {
        "id": "unit-tallyman",
        "unitId": "unit-tallyman",
        "slug": "tallyman",
        "keywords": [
          "INFANTRY",
          "CHARACTER",
          "CHAOS",
          "NURGLE",
          "TALLYMAN",
          "DEATH GUARD"
        ],
        "intrinsicKeywords": [
          "INFANTRY",
          "CHARACTER",
          "CHAOS",
          "NURGLE",
          "TALLYMAN",
          "DEATH GUARD"
        ],
        "abilities": [
          "Leader",
          "Nurgle’s Gift (Aura)",
          "Malicious Calculations",
          "Sevenfold Chant"
        ],
        "termIds": [
          "keyword-infantry",
          "keyword-character",
          "keyword-chaos",
          "keyword-nurgle",
          "keyword-tallyman",
          "keyword-death-guard",
          "ability-malicious-calculations-8505f03",
          "ability-sevenfold-chant-15ec601",
          "weapon-plasma-pistol-standard-4eac6a8",
          "weapon-plasma-pistol-supercharge-950c822",
          "weapon-close-combat-weapon-bc414e3"
        ],
        "epic": false,
        "deadlyDemise": false,
        "attached": null,
        "attachmentKnown": false,
        "characterCount": 1,
        "twoCharacters": null,
        "warlord": null,
        "relations": {
          "canLead": [
            {
              "unitId": "unit-plague-marines",
              "maxCharacters": 2
            }
          ],
          "canSupport": [
            {
              "unitId": "unit-plague-marines",
              "maxCharacters": 2
            }
          ],
          "canBeLedBy": [],
          "canBeSupportedBy": []
        }
      },
      "gameSelections": {
        "stats": {
          "M": "5\"",
          "T": "6",
          "Sv": "3+",
          "W": "4",
          "Ld": "6+",
          "OC": "1"
        },
        "abilities": [
          {
            "id": "tallyman-ability-core",
            "sectionId": "tallyman-ability-core",
            "title": "CORE",
            "text": "Leader",
            "sourceUnitId": "unit-tallyman"
          },
          {
            "id": "tallyman-ability-faction",
            "sectionId": "tallyman-ability-faction",
            "title": "FACTION",
            "text": "Nurgle’s Gift (Aura)",
            "sourceUnitId": "unit-tallyman"
          },
          {
            "id": "tallyman-ability-malicious-calculations",
            "sectionId": "tallyman-ability-malicious-calculations",
            "title": "Malicious Calculations",
            "text": "While this model is leading a unit, each time a model in that unit makes an attack, you can ignore any or all modifiers to that attack’s Ballistic Skill or Weapon Skill characteristics and/or any or all modifiers to the Hit roll.",
            "sourceUnitId": "unit-tallyman"
          },
          {
            "id": "tallyman-ability-sevenfold-chant",
            "sectionId": "tallyman-ability-sevenfold-chant",
            "title": "Sevenfold Chant",
            "text": "In your Command phase, if this model is on the battlefield, roll 2D6: on a 7+, you gain 1CP.",
            "sourceUnitId": "unit-tallyman"
          }
        ],
        "models": [
          {
            "id": "unit-tallyman-model-70198867ea",
            "title": "Tallyman",
            "aliases": [
              "Tallyman"
            ],
            "min": 1,
            "max": 1,
            "legacyIds": [
              "unit-tallyman-model-tallyman"
            ]
          }
        ],
        "compositionRules": [],
        "selections": [
          {
            "id": "unit-tallyman-selection-plasma-pistol-standard",
            "title": "Plasma pistol – standard",
            "aliases": [
              "Plasma pistol – standard"
            ],
            "kind": "weapon",
            "profileIds": [
              "tallyman-weapon-plasma-pistol-standard"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-tallyman-selection-plasma-pistol-supercharge",
            "title": "Plasma pistol – supercharge",
            "aliases": [
              "Plasma pistol – supercharge"
            ],
            "kind": "weapon",
            "profileIds": [
              "tallyman-weapon-plasma-pistol-supercharge"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-tallyman-selection-close-combat-weapon",
            "title": "Close combat weapon",
            "aliases": [
              "Close combat weapon"
            ],
            "kind": "weapon",
            "profileIds": [
              "tallyman-weapon-close-combat-weapon"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-tallyman-weapon-family-plasma-pistol-selection",
            "title": "Plasma pistol",
            "aliases": [
              "Plasma pistol"
            ],
            "kind": "weapon",
            "familyId": "unit-tallyman-weapon-family-plasma-pistol",
            "profileIds": [
              "tallyman-weapon-plasma-pistol-standard",
              "tallyman-weapon-plasma-pistol-supercharge"
            ],
            "wargearAbilityIds": []
          }
        ],
        "weaponFamilies": [
          {
            "id": "unit-tallyman-weapon-family-plasma-pistol",
            "title": "Plasma pistol",
            "aliases": [
              "Plasma pistol"
            ],
            "profileIds": [
              "tallyman-weapon-plasma-pistol-standard",
              "tallyman-weapon-plasma-pistol-supercharge"
            ],
            "ambiguousAlias": false
          }
        ],
        "weaponProfiles": [
          {
            "id": "tallyman-weapon-plasma-pistol-standard",
            "title": "Plasma pistol – standard",
            "mode": "ranged",
            "range": "12\"",
            "a": "1",
            "skill": "3+",
            "s": "7",
            "ap": "-2",
            "d": "1",
            "abilities": "PISTOL",
            "sourceSelectionIds": [
              "unit-tallyman-selection-plasma-pistol-standard",
              "unit-tallyman-weapon-family-plasma-pistol-selection"
            ]
          },
          {
            "id": "tallyman-weapon-plasma-pistol-supercharge",
            "title": "Plasma pistol – supercharge",
            "mode": "ranged",
            "range": "12\"",
            "a": "1",
            "skill": "3+",
            "s": "8",
            "ap": "-3",
            "d": "2",
            "abilities": "HAZARDOUS, PISTOL",
            "sourceSelectionIds": [
              "unit-tallyman-selection-plasma-pistol-supercharge",
              "unit-tallyman-weapon-family-plasma-pistol-selection"
            ]
          },
          {
            "id": "tallyman-weapon-close-combat-weapon",
            "title": "Close combat weapon",
            "mode": "melee",
            "range": "Melee",
            "a": "4",
            "skill": "3+",
            "s": "4",
            "ap": "0",
            "d": "1",
            "abilities": "-",
            "sourceSelectionIds": [
              "unit-tallyman-selection-close-combat-weapon"
            ]
          }
        ],
        "wargearAbilities": []
      }
    },
    {
      "id": "unit-plague-marines",
      "title": "Plague Marines",
      "sourceBookId": "death-guard",
      "sourceLayer": "current",
      "intrinsicKeywords": [
        "INFANTRY",
        "BATTLELINE",
        "GRENADES",
        "CHAOS",
        "NURGLE",
        "PLAGUE MARINES",
        "DEATH GUARD"
      ],
      "relations": {
        "canLead": [],
        "canSupport": [],
        "canBeLedBy": [
          {
            "unitId": "unit-biologus-putrifier",
            "maxCharacters": 2
          },
          {
            "unitId": "unit-foul-blightspawn",
            "maxCharacters": 2
          },
          {
            "unitId": "unit-icon-bearer",
            "maxCharacters": 2
          },
          {
            "unitId": "unit-lord-of-poxes",
            "maxCharacters": 2
          },
          {
            "unitId": "unit-malignant-plaguecaster",
            "maxCharacters": 2
          },
          {
            "unitId": "unit-noxious-blightbringer",
            "maxCharacters": 2
          },
          {
            "unitId": "unit-plague-surgeon",
            "maxCharacters": 2
          },
          {
            "unitId": "unit-tallyman",
            "maxCharacters": 2
          }
        ],
        "canBeSupportedBy": [
          {
            "unitId": "unit-biologus-putrifier",
            "maxCharacters": 2
          },
          {
            "unitId": "unit-foul-blightspawn",
            "maxCharacters": 2
          },
          {
            "unitId": "unit-icon-bearer",
            "maxCharacters": 2
          },
          {
            "unitId": "unit-noxious-blightbringer",
            "maxCharacters": 2
          },
          {
            "unitId": "unit-plague-surgeon",
            "maxCharacters": 2
          },
          {
            "unitId": "unit-tallyman",
            "maxCharacters": 2
          }
        ]
      },
      "ruleFacts": {
        "id": "unit-plague-marines",
        "unitId": "unit-plague-marines",
        "slug": "plague-marines",
        "keywords": [
          "INFANTRY",
          "BATTLELINE",
          "GRENADES",
          "CHAOS",
          "NURGLE",
          "PLAGUE MARINES",
          "DEATH GUARD"
        ],
        "intrinsicKeywords": [
          "INFANTRY",
          "BATTLELINE",
          "GRENADES",
          "CHAOS",
          "NURGLE",
          "PLAGUE MARINES",
          "DEATH GUARD"
        ],
        "abilities": [
          "Nurgle’s Gift (Aura)",
          "Infused with the Blessings of Nurgle"
        ],
        "termIds": [
          "keyword-infantry",
          "keyword-battleline",
          "keyword-grenades",
          "keyword-chaos",
          "keyword-nurgle",
          "keyword-plague-marines",
          "keyword-death-guard",
          "ability-infused-with-the-blessings-of-nurgle-577c42e",
          "weapon-blight-launcher-6d713e8",
          "weapon-boltgun-ac624b6",
          "weapon-bolt-pistol-4457cbc",
          "weapon-meltagun-e6c3ed9",
          "weapon-plague-belcher-2667b3d",
          "weapon-plague-spewer-3ffad7c",
          "weapon-plasma-gun-standard-991cca1",
          "weapon-plasma-gun-supercharge-e705c11",
          "weapon-plasma-pistol-standard-4eac6a8",
          "weapon-plasma-pistol-supercharge-950c822",
          "weapon-bubotic-weapons-479658b",
          "weapon-heavy-plague-weapon-b16b375",
          "weapon-plague-knives-d66e964",
          "weapon-power-fist-d333c11"
        ],
        "epic": false,
        "deadlyDemise": false,
        "attached": null,
        "attachmentKnown": false,
        "characterCount": 0,
        "twoCharacters": null,
        "warlord": null,
        "relations": {
          "canLead": [],
          "canSupport": [],
          "canBeLedBy": [
            {
              "unitId": "unit-biologus-putrifier",
              "maxCharacters": 2
            },
            {
              "unitId": "unit-foul-blightspawn",
              "maxCharacters": 2
            },
            {
              "unitId": "unit-icon-bearer",
              "maxCharacters": 2
            },
            {
              "unitId": "unit-lord-of-poxes",
              "maxCharacters": 2
            },
            {
              "unitId": "unit-malignant-plaguecaster",
              "maxCharacters": 2
            },
            {
              "unitId": "unit-noxious-blightbringer",
              "maxCharacters": 2
            },
            {
              "unitId": "unit-plague-surgeon",
              "maxCharacters": 2
            },
            {
              "unitId": "unit-tallyman",
              "maxCharacters": 2
            }
          ],
          "canBeSupportedBy": [
            {
              "unitId": "unit-biologus-putrifier",
              "maxCharacters": 2
            },
            {
              "unitId": "unit-foul-blightspawn",
              "maxCharacters": 2
            },
            {
              "unitId": "unit-icon-bearer",
              "maxCharacters": 2
            },
            {
              "unitId": "unit-noxious-blightbringer",
              "maxCharacters": 2
            },
            {
              "unitId": "unit-plague-surgeon",
              "maxCharacters": 2
            },
            {
              "unitId": "unit-tallyman",
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
          "W": "2",
          "Ld": "6+",
          "OC": "2"
        },
        "abilities": [
          {
            "id": "plague-marines-ability-faction",
            "sectionId": "plague-marines-ability-faction",
            "title": "FACTION",
            "text": "Nurgle’s Gift (Aura)",
            "sourceUnitId": "unit-plague-marines"
          },
          {
            "id": "plague-marines-ability-infused-with-the-blessings-of-nurgle",
            "sectionId": "plague-marines-ability-infused-with-the-blessings-of-nurgle",
            "title": "Infused with the Blessings of Nurgle",
            "text": "In your Shooting phase, each time this unit is selected to shoot, after this unit has shot, select one enemy unit hit by one or more of those attacks. Until the start of your next turn, that enemy unit is Afflicted.",
            "sourceUnitId": "unit-plague-marines"
          }
        ],
        "models": [
          {
            "id": "unit-plague-marines-model-436dbe8b2e",
            "title": "Plague Champion",
            "aliases": [
              "Plague Champion"
            ],
            "min": 1,
            "max": 1,
            "legacyIds": [
              "unit-plague-marines-model-plague-champion"
            ]
          },
          {
            "id": "unit-plague-marines-model-9c3a7a113e",
            "title": "Plague Marine",
            "aliases": [
              "Plague Marine",
              "Plague Marines"
            ],
            "min": 4,
            "max": 9,
            "legacyIds": [
              "unit-plague-marines-model-plague-marine-2"
            ]
          }
        ],
        "compositionRules": [],
        "selections": [
          {
            "id": "unit-plague-marines-selection-blight-launcher",
            "title": "Blight launcher",
            "aliases": [
              "Blight launcher"
            ],
            "kind": "weapon",
            "profileIds": [
              "plague-marines-weapon-blight-launcher"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-plague-marines-selection-boltgun",
            "title": "Boltgun",
            "aliases": [
              "Boltgun"
            ],
            "kind": "weapon",
            "profileIds": [
              "plague-marines-weapon-boltgun"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-plague-marines-selection-bolt-pistol",
            "title": "Bolt pistol",
            "aliases": [
              "Bolt pistol"
            ],
            "kind": "weapon",
            "profileIds": [
              "plague-marines-weapon-bolt-pistol"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-plague-marines-selection-meltagun",
            "title": "Meltagun",
            "aliases": [
              "Meltagun"
            ],
            "kind": "weapon",
            "profileIds": [
              "plague-marines-weapon-meltagun"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-plague-marines-selection-plague-belcher",
            "title": "Plague belcher",
            "aliases": [
              "Plague belcher"
            ],
            "kind": "weapon",
            "profileIds": [
              "plague-marines-weapon-plague-belcher"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-plague-marines-selection-plague-spewer",
            "title": "Plague spewer",
            "aliases": [
              "Plague spewer"
            ],
            "kind": "weapon",
            "profileIds": [
              "plague-marines-weapon-plague-spewer"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-plague-marines-selection-plasma-gun-standard",
            "title": "Plasma gun – standard",
            "aliases": [
              "Plasma gun – standard"
            ],
            "kind": "weapon",
            "profileIds": [
              "plague-marines-weapon-plasma-gun-standard"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-plague-marines-selection-plasma-gun-supercharge",
            "title": "Plasma gun – supercharge",
            "aliases": [
              "Plasma gun – supercharge"
            ],
            "kind": "weapon",
            "profileIds": [
              "plague-marines-weapon-plasma-gun-supercharge"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-plague-marines-selection-plasma-pistol-standard",
            "title": "Plasma pistol – standard",
            "aliases": [
              "Plasma pistol – standard"
            ],
            "kind": "weapon",
            "profileIds": [
              "plague-marines-weapon-plasma-pistol-standard"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-plague-marines-selection-plasma-pistol-supercharge",
            "title": "Plasma pistol – supercharge",
            "aliases": [
              "Plasma pistol – supercharge"
            ],
            "kind": "weapon",
            "profileIds": [
              "plague-marines-weapon-plasma-pistol-supercharge"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-plague-marines-selection-bubotic-weapons",
            "title": "Bubotic weapons",
            "aliases": [
              "Bubotic weapons"
            ],
            "kind": "weapon",
            "profileIds": [
              "plague-marines-weapon-bubotic-weapons"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-plague-marines-selection-heavy-plague-weapon",
            "title": "Heavy plague weapon",
            "aliases": [
              "Heavy plague weapon"
            ],
            "kind": "weapon",
            "profileIds": [
              "plague-marines-weapon-heavy-plague-weapon"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-plague-marines-selection-plague-knives",
            "title": "Plague knives",
            "aliases": [
              "Plague knives"
            ],
            "kind": "weapon",
            "profileIds": [
              "plague-marines-weapon-plague-knives"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-plague-marines-selection-power-fist",
            "title": "Power fist",
            "aliases": [
              "Power fist"
            ],
            "kind": "weapon",
            "profileIds": [
              "plague-marines-weapon-power-fist"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-plague-marines-weapon-family-plasma-gun-selection",
            "title": "Plasma gun",
            "aliases": [
              "Plasma gun"
            ],
            "kind": "weapon",
            "familyId": "unit-plague-marines-weapon-family-plasma-gun",
            "profileIds": [
              "plague-marines-weapon-plasma-gun-standard",
              "plague-marines-weapon-plasma-gun-supercharge"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-plague-marines-weapon-family-plasma-pistol-selection",
            "title": "Plasma pistol",
            "aliases": [
              "Plasma pistol"
            ],
            "kind": "weapon",
            "familyId": "unit-plague-marines-weapon-family-plasma-pistol",
            "profileIds": [
              "plague-marines-weapon-plasma-pistol-standard",
              "plague-marines-weapon-plasma-pistol-supercharge"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-plague-marines-selection-icon-of-despair",
            "title": "Icon of Despair",
            "aliases": [
              "Icon of Despair"
            ],
            "kind": "wargear",
            "profileIds": [],
            "wargearAbilityIds": [
              "plague-marines-ability-icon-of-despair-aura"
            ],
            "maxTotalQuantity": 1
          }
        ],
        "weaponFamilies": [
          {
            "id": "unit-plague-marines-weapon-family-plasma-gun",
            "title": "Plasma gun",
            "aliases": [
              "Plasma gun"
            ],
            "profileIds": [
              "plague-marines-weapon-plasma-gun-standard",
              "plague-marines-weapon-plasma-gun-supercharge"
            ],
            "ambiguousAlias": false
          },
          {
            "id": "unit-plague-marines-weapon-family-plasma-pistol",
            "title": "Plasma pistol",
            "aliases": [
              "Plasma pistol"
            ],
            "profileIds": [
              "plague-marines-weapon-plasma-pistol-standard",
              "plague-marines-weapon-plasma-pistol-supercharge"
            ],
            "ambiguousAlias": false
          }
        ],
        "weaponProfiles": [
          {
            "id": "plague-marines-weapon-blight-launcher",
            "title": "Blight launcher",
            "mode": "ranged",
            "range": "24\"",
            "a": "D3",
            "skill": "3+",
            "s": "6",
            "ap": "-1",
            "d": "2",
            "abilities": "BLAST, LETHAL HITS",
            "sourceSelectionIds": [
              "unit-plague-marines-selection-blight-launcher"
            ]
          },
          {
            "id": "plague-marines-weapon-boltgun",
            "title": "Boltgun",
            "mode": "ranged",
            "range": "24\"",
            "a": "2",
            "skill": "3+",
            "s": "4",
            "ap": "0",
            "d": "1",
            "abilities": "LETHAL HITS",
            "sourceSelectionIds": [
              "unit-plague-marines-selection-boltgun"
            ]
          },
          {
            "id": "plague-marines-weapon-bolt-pistol",
            "title": "Bolt pistol",
            "mode": "ranged",
            "range": "12\"",
            "a": "1",
            "skill": "3+",
            "s": "4",
            "ap": "0",
            "d": "1",
            "abilities": "LETHAL HITS, PISTOL",
            "sourceSelectionIds": [
              "unit-plague-marines-selection-bolt-pistol"
            ]
          },
          {
            "id": "plague-marines-weapon-meltagun",
            "title": "Meltagun",
            "mode": "ranged",
            "range": "12\"",
            "a": "1",
            "skill": "3+",
            "s": "9",
            "ap": "-4",
            "d": "D6",
            "abilities": "MELTA 2",
            "sourceSelectionIds": [
              "unit-plague-marines-selection-meltagun"
            ]
          },
          {
            "id": "plague-marines-weapon-plague-belcher",
            "title": "Plague belcher",
            "mode": "ranged",
            "range": "12\"",
            "a": "D6",
            "skill": "N/A",
            "s": "4",
            "ap": "0",
            "d": "1",
            "abilities": "ANTI-INFANTRY 4+, IGNORES COVER, TORRENT",
            "sourceSelectionIds": [
              "unit-plague-marines-selection-plague-belcher"
            ]
          },
          {
            "id": "plague-marines-weapon-plague-spewer",
            "title": "Plague spewer",
            "mode": "ranged",
            "range": "12\"",
            "a": "D6",
            "skill": "N/A",
            "s": "5",
            "ap": "-1",
            "d": "1",
            "abilities": "ANTI-INFANTRY 2+, IGNORES COVER, TORRENT",
            "sourceSelectionIds": [
              "unit-plague-marines-selection-plague-spewer"
            ]
          },
          {
            "id": "plague-marines-weapon-plasma-gun-standard",
            "title": "Plasma gun – standard",
            "mode": "ranged",
            "range": "24\"",
            "a": "1",
            "skill": "3+",
            "s": "7",
            "ap": "-2",
            "d": "1",
            "abilities": "RAPID FIRE 1",
            "sourceSelectionIds": [
              "unit-plague-marines-selection-plasma-gun-standard",
              "unit-plague-marines-weapon-family-plasma-gun-selection"
            ]
          },
          {
            "id": "plague-marines-weapon-plasma-gun-supercharge",
            "title": "Plasma gun – supercharge",
            "mode": "ranged",
            "range": "24\"",
            "a": "1",
            "skill": "3+",
            "s": "8",
            "ap": "-3",
            "d": "2",
            "abilities": "HAZARDOUS, RAPID FIRE 1",
            "sourceSelectionIds": [
              "unit-plague-marines-selection-plasma-gun-supercharge",
              "unit-plague-marines-weapon-family-plasma-gun-selection"
            ]
          },
          {
            "id": "plague-marines-weapon-plasma-pistol-standard",
            "title": "Plasma pistol – standard",
            "mode": "ranged",
            "range": "12\"",
            "a": "1",
            "skill": "3+",
            "s": "7",
            "ap": "-2",
            "d": "1",
            "abilities": "PISTOL",
            "sourceSelectionIds": [
              "unit-plague-marines-selection-plasma-pistol-standard",
              "unit-plague-marines-weapon-family-plasma-pistol-selection"
            ]
          },
          {
            "id": "plague-marines-weapon-plasma-pistol-supercharge",
            "title": "Plasma pistol – supercharge",
            "mode": "ranged",
            "range": "12\"",
            "a": "1",
            "skill": "3+",
            "s": "8",
            "ap": "-3",
            "d": "2",
            "abilities": "HAZARDOUS, PISTOL",
            "sourceSelectionIds": [
              "unit-plague-marines-selection-plasma-pistol-supercharge",
              "unit-plague-marines-weapon-family-plasma-pistol-selection"
            ]
          },
          {
            "id": "plague-marines-weapon-bubotic-weapons",
            "title": "Bubotic weapons",
            "mode": "melee",
            "range": "Melee",
            "a": "4",
            "skill": "3+",
            "s": "5",
            "ap": "-2",
            "d": "1",
            "abilities": "LETHAL HITS",
            "sourceSelectionIds": [
              "unit-plague-marines-selection-bubotic-weapons"
            ]
          },
          {
            "id": "plague-marines-weapon-heavy-plague-weapon",
            "title": "Heavy plague weapon",
            "mode": "melee",
            "range": "Melee",
            "a": "3",
            "skill": "4+",
            "s": "8",
            "ap": "-2",
            "d": "2",
            "abilities": "LETHAL HITS",
            "sourceSelectionIds": [
              "unit-plague-marines-selection-heavy-plague-weapon"
            ]
          },
          {
            "id": "plague-marines-weapon-plague-knives",
            "title": "Plague knives",
            "mode": "melee",
            "range": "Melee",
            "a": "3",
            "skill": "3+",
            "s": "4",
            "ap": "0",
            "d": "1",
            "abilities": "LETHAL HITS",
            "sourceSelectionIds": [
              "unit-plague-marines-selection-plague-knives"
            ]
          },
          {
            "id": "plague-marines-weapon-power-fist",
            "title": "Power fist",
            "mode": "melee",
            "range": "Melee",
            "a": "3",
            "skill": "3+",
            "s": "8",
            "ap": "-2",
            "d": "2",
            "abilities": "LETHAL HITS",
            "sourceSelectionIds": [
              "unit-plague-marines-selection-power-fist"
            ]
          }
        ],
        "wargearAbilities": [
          {
            "id": "plague-marines-ability-icon-of-despair-aura",
            "sectionId": "plague-marines-ability-icon-of-despair-aura",
            "title": "Icon of Despair (Aura)",
            "text": "While an enemy unit is within 6\" of the bearer, worsen the Leadership characteristic of models in that unit by 1.",
            "sourceUnitId": "unit-plague-marines",
            "requiredSelectionIds": [
              "unit-plague-marines-selection-icon-of-despair"
            ]
          }
        ],
        "wargearDefaults": [
          {
            "modelId": "unit-plague-marines-model-436dbe8b2e",
            "selections": [
              {
                "selectionId": "unit-plague-marines-selection-boltgun",
                "quantity": 1
              },
              {
                "selectionId": "unit-plague-marines-selection-plague-knives",
                "quantity": 1
              }
            ]
          },
          {
            "modelId": "unit-plague-marines-model-9c3a7a113e",
            "selections": [
              {
                "selectionId": "unit-plague-marines-selection-boltgun",
                "quantity": 1
              },
              {
                "selectionId": "unit-plague-marines-selection-plague-knives",
                "quantity": 1
              }
            ]
          }
        ],
        "wargearOptionContracts": [
          {
            "sourceId": "datasheet-plague-marines:wargear:1",
            "eligibleModelIds": [
              "unit-plague-marines-model-436dbe8b2e"
            ],
            "limit": {
              "perModel": 1,
              "perUnit": 1
            },
            "choices": [
              {
                "remove": [
                  {
                    "selectionId": "unit-plague-marines-selection-boltgun",
                    "quantity": 1
                  }
                ],
                "add": [
                  {
                    "selectionId": "unit-plague-marines-selection-bolt-pistol",
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
                    "selectionId": "unit-plague-marines-selection-boltgun",
                    "quantity": 1
                  }
                ],
                "add": [
                  {
                    "selectionId": "unit-plague-marines-weapon-family-plasma-gun-selection",
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
                    "selectionId": "unit-plague-marines-selection-boltgun",
                    "quantity": 1
                  }
                ],
                "add": [
                  {
                    "selectionId": "unit-plague-marines-weapon-family-plasma-pistol-selection",
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
            "sourceId": "datasheet-plague-marines:wargear:2",
            "eligibleModelIds": [
              "unit-plague-marines-model-436dbe8b2e"
            ],
            "limit": {
              "perModel": 1,
              "perUnit": 1
            },
            "choices": [
              {
                "remove": [
                  {
                    "selectionId": "unit-plague-marines-selection-plague-knives",
                    "quantity": 1
                  }
                ],
                "add": [
                  {
                    "selectionId": "unit-plague-marines-selection-bubotic-weapons",
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
                    "selectionId": "unit-plague-marines-selection-plague-knives",
                    "quantity": 1
                  }
                ],
                "add": [
                  {
                    "selectionId": "unit-plague-marines-selection-power-fist",
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
            "sourceId": "datasheet-plague-marines:wargear:3",
            "eligibleModelIds": [
              "unit-plague-marines-model-9c3a7a113e"
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
                    "selectionId": "unit-plague-marines-selection-boltgun",
                    "quantity": 1
                  }
                ],
                "add": [
                  {
                    "selectionId": "unit-plague-marines-selection-blight-launcher",
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
            "sourceId": "datasheet-plague-marines:wargear:4",
            "eligibleModelIds": [
              "unit-plague-marines-model-9c3a7a113e"
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
                    "selectionId": "unit-plague-marines-selection-boltgun",
                    "quantity": 1
                  }
                ],
                "add": [
                  {
                    "selectionId": "unit-plague-marines-selection-plague-spewer",
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
            "sourceId": "datasheet-plague-marines:wargear:5",
            "eligibleModelIds": [
              "unit-plague-marines-model-9c3a7a113e"
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
                    "selectionId": "unit-plague-marines-selection-boltgun",
                    "quantity": 1
                  }
                ],
                "add": [
                  {
                    "selectionId": "unit-plague-marines-selection-meltagun",
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
                    "selectionId": "unit-plague-marines-selection-boltgun",
                    "quantity": 1
                  }
                ],
                "add": [
                  {
                    "selectionId": "unit-plague-marines-selection-plague-belcher",
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
                    "selectionId": "unit-plague-marines-selection-boltgun",
                    "quantity": 1
                  }
                ],
                "add": [
                  {
                    "selectionId": "unit-plague-marines-weapon-family-plasma-gun-selection",
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
            "sourceId": "datasheet-plague-marines:wargear:6",
            "eligibleModelIds": [
              "unit-plague-marines-model-9c3a7a113e"
            ],
            "limit": {
              "perModel": 1,
              "perModels": {
                "models": 5,
                "uses": 2
              }
            },
            "choices": [
              {
                "remove": [
                  {
                    "selectionId": "unit-plague-marines-selection-boltgun",
                    "quantity": 1
                  }
                ],
                "add": [
                  {
                    "selectionId": "unit-plague-marines-selection-bubotic-weapons",
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
            "sourceId": "datasheet-plague-marines:wargear:7",
            "eligibleModelIds": [
              "unit-plague-marines-model-9c3a7a113e"
            ],
            "limit": {
              "perModel": 1,
              "perModels": {
                "models": 5,
                "uses": 2
              }
            },
            "choices": [
              {
                "remove": [
                  {
                    "selectionId": "unit-plague-marines-selection-boltgun",
                    "quantity": 1
                  }
                ],
                "add": [
                  {
                    "selectionId": "unit-plague-marines-selection-heavy-plague-weapon",
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
            "sourceId": "datasheet-plague-marines:wargear:8",
            "eligibleModelIds": [
              "unit-plague-marines-model-9c3a7a113e"
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
                    "selectionId": "unit-plague-marines-selection-icon-of-despair",
                    "quantity": 1
                  }
                ],
                "requiresFinal": [
                  "unit-plague-marines-selection-boltgun"
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
      "id": "unit-blightlord-terminators",
      "title": "Blightlord Terminators",
      "sourceBookId": "death-guard",
      "sourceLayer": "current",
      "intrinsicKeywords": [
        "INFANTRY",
        "CHAOS",
        "NURGLE",
        "TERMINATOR",
        "BLIGHTLORD TERMINATORS",
        "DEATH GUARD"
      ],
      "relations": {
        "canLead": [],
        "canSupport": [],
        "canBeLedBy": [
          {
            "unitId": "unit-lord-of-contagion",
            "maxCharacters": 1
          },
          {
            "unitId": "unit-lord-of-virulence",
            "maxCharacters": 1
          },
          {
            "unitId": "unit-typhus",
            "maxCharacters": 1
          }
        ],
        "canBeSupportedBy": []
      },
      "ruleFacts": {
        "id": "unit-blightlord-terminators",
        "unitId": "unit-blightlord-terminators",
        "slug": "blightlord-terminators",
        "keywords": [
          "INFANTRY",
          "CHAOS",
          "NURGLE",
          "TERMINATOR",
          "BLIGHTLORD TERMINATORS",
          "DEATH GUARD"
        ],
        "intrinsicKeywords": [
          "INFANTRY",
          "CHAOS",
          "NURGLE",
          "TERMINATOR",
          "BLIGHTLORD TERMINATORS",
          "DEATH GUARD"
        ],
        "abilities": [
          "Deep Strike",
          "Nurgle’s Gift (Aura)",
          "Blistering Fusillade"
        ],
        "termIds": [
          "keyword-infantry",
          "keyword-chaos",
          "keyword-nurgle",
          "keyword-terminator",
          "keyword-blightlord-terminators",
          "keyword-death-guard",
          "ability-blistering-fusillade-01dcc5c",
          "weapon-blight-launcher-6d713e8",
          "weapon-combi-bolter-5d7d99e",
          "weapon-combi-weapon-b2eeb14",
          "weapon-plague-spewer-3ffad7c",
          "weapon-reaper-autocannon-1a3732e",
          "weapon-bubotic-blade-4f09d5f",
          "weapon-close-combat-weapon-55bc2e9",
          "weapon-flail-of-corruption-f6b2430"
        ],
        "epic": false,
        "deadlyDemise": false,
        "attached": null,
        "attachmentKnown": false,
        "characterCount": 0,
        "twoCharacters": null,
        "warlord": null,
        "relations": {
          "canLead": [],
          "canSupport": [],
          "canBeLedBy": [
            {
              "unitId": "unit-lord-of-contagion",
              "maxCharacters": 1
            },
            {
              "unitId": "unit-lord-of-virulence",
              "maxCharacters": 1
            },
            {
              "unitId": "unit-typhus",
              "maxCharacters": 1
            }
          ],
          "canBeSupportedBy": []
        }
      },
      "gameSelections": {
        "stats": {
          "M": "5\"",
          "T": "7",
          "Sv": "2+",
          "W": "3",
          "Ld": "6+",
          "OC": "1",
          "Inv": "4+"
        },
        "abilities": [
          {
            "id": "blightlord-terminators-ability-core",
            "sectionId": "blightlord-terminators-ability-core",
            "title": "CORE",
            "text": "Deep Strike",
            "sourceUnitId": "unit-blightlord-terminators"
          },
          {
            "id": "blightlord-terminators-ability-faction",
            "sectionId": "blightlord-terminators-ability-faction",
            "title": "FACTION",
            "text": "Nurgle’s Gift (Aura)",
            "sourceUnitId": "unit-blightlord-terminators"
          },
          {
            "id": "blightlord-terminators-ability-blistering-fusillade",
            "sectionId": "blightlord-terminators-ability-blistering-fusillade",
            "title": "Blistering Fusillade",
            "text": "If this unit has a Starting Strength of 5 or more, or if a CHARACTER is leading this unit, then each time a model in this unit makes a ranged attack that targets an Afflicted unit, improve the Strength and Armour Penetration characteristics of that attack by 1.",
            "sourceUnitId": "unit-blightlord-terminators"
          }
        ],
        "models": [
          {
            "id": "unit-blightlord-terminators-model-eba248135a",
            "title": "Blightlord Champion",
            "aliases": [
              "Blightlord Champion"
            ],
            "min": 1,
            "max": 1,
            "legacyIds": [
              "unit-blightlord-terminators-model-blightlord-champion"
            ]
          },
          {
            "id": "unit-blightlord-terminators-model-d1d8690192",
            "title": "Blightlord Terminator",
            "aliases": [
              "Blightlord Terminator",
              "Blightlord Terminators"
            ],
            "min": 2,
            "max": 9,
            "legacyIds": [
              "unit-blightlord-terminators-model-blightlord-terminator-2"
            ]
          }
        ],
        "compositionRules": [],
        "selections": [
          {
            "id": "unit-blightlord-terminators-selection-blight-launcher",
            "title": "Blight launcher",
            "aliases": [
              "Blight launcher"
            ],
            "kind": "weapon",
            "profileIds": [
              "blightlord-terminators-weapon-blight-launcher"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-blightlord-terminators-selection-combi-bolter",
            "title": "Combi-bolter",
            "aliases": [
              "Combi-bolter"
            ],
            "kind": "weapon",
            "profileIds": [
              "blightlord-terminators-weapon-combi-bolter"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-blightlord-terminators-selection-combi-weapon",
            "title": "Combi-weapon",
            "aliases": [
              "Combi-weapon"
            ],
            "kind": "weapon",
            "profileIds": [
              "blightlord-terminators-weapon-combi-weapon"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-blightlord-terminators-selection-plague-spewer",
            "title": "Plague spewer",
            "aliases": [
              "Plague spewer"
            ],
            "kind": "weapon",
            "profileIds": [
              "blightlord-terminators-weapon-plague-spewer"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-blightlord-terminators-selection-reaper-autocannon",
            "title": "Reaper autocannon",
            "aliases": [
              "Reaper autocannon"
            ],
            "kind": "weapon",
            "profileIds": [
              "blightlord-terminators-weapon-reaper-autocannon"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-blightlord-terminators-selection-bubotic-blade",
            "title": "Bubotic blade",
            "aliases": [
              "Bubotic blade"
            ],
            "kind": "weapon",
            "profileIds": [
              "blightlord-terminators-weapon-bubotic-blade"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-blightlord-terminators-selection-close-combat-weapon",
            "title": "Close combat weapon",
            "aliases": [
              "Close combat weapon"
            ],
            "kind": "weapon",
            "profileIds": [
              "blightlord-terminators-weapon-close-combat-weapon"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-blightlord-terminators-selection-flail-of-corruption",
            "title": "Flail of corruption",
            "aliases": [
              "Flail of corruption"
            ],
            "kind": "weapon",
            "profileIds": [
              "blightlord-terminators-weapon-flail-of-corruption"
            ],
            "wargearAbilityIds": []
          }
        ],
        "weaponFamilies": [],
        "weaponProfiles": [
          {
            "id": "blightlord-terminators-weapon-blight-launcher",
            "title": "Blight launcher",
            "mode": "ranged",
            "range": "24\"",
            "a": "D3",
            "skill": "3+",
            "s": "6",
            "ap": "-1",
            "d": "2",
            "abilities": "BLAST, LETHAL HITS",
            "sourceSelectionIds": [
              "unit-blightlord-terminators-selection-blight-launcher"
            ]
          },
          {
            "id": "blightlord-terminators-weapon-combi-bolter",
            "title": "Combi-bolter",
            "mode": "ranged",
            "range": "24\"",
            "a": "2",
            "skill": "3+",
            "s": "4",
            "ap": "0",
            "d": "1",
            "abilities": "LETHAL HITS, RAPID FIRE 2",
            "sourceSelectionIds": [
              "unit-blightlord-terminators-selection-combi-bolter"
            ]
          },
          {
            "id": "blightlord-terminators-weapon-combi-weapon",
            "title": "Combi-weapon",
            "mode": "ranged",
            "range": "24\"",
            "a": "1",
            "skill": "4+",
            "s": "4",
            "ap": "0",
            "d": "1",
            "abilities": "ANTI-INFANTRY 4+, DEVASTATING WOUNDS, RAPID FIRE 1",
            "sourceSelectionIds": [
              "unit-blightlord-terminators-selection-combi-weapon"
            ]
          },
          {
            "id": "blightlord-terminators-weapon-plague-spewer",
            "title": "Plague spewer",
            "mode": "ranged",
            "range": "12\"",
            "a": "D6",
            "skill": "N/A",
            "s": "5",
            "ap": "-1",
            "d": "1",
            "abilities": "ANTI-INFANTRY 2+, IGNORES COVER, TORRENT",
            "sourceSelectionIds": [
              "unit-blightlord-terminators-selection-plague-spewer"
            ]
          },
          {
            "id": "blightlord-terminators-weapon-reaper-autocannon",
            "title": "Reaper autocannon",
            "mode": "ranged",
            "range": "36\"",
            "a": "4",
            "skill": "3+",
            "s": "7",
            "ap": "-1",
            "d": "1",
            "abilities": "DEVASTATING WOUNDS, SUSTAINED HITS 1",
            "sourceSelectionIds": [
              "unit-blightlord-terminators-selection-reaper-autocannon"
            ]
          },
          {
            "id": "blightlord-terminators-weapon-bubotic-blade",
            "title": "Bubotic blade",
            "mode": "melee",
            "range": "Melee",
            "a": "3",
            "skill": "3+",
            "s": "5",
            "ap": "-2",
            "d": "2",
            "abilities": "LETHAL HITS",
            "sourceSelectionIds": [
              "unit-blightlord-terminators-selection-bubotic-blade"
            ]
          },
          {
            "id": "blightlord-terminators-weapon-close-combat-weapon",
            "title": "Close combat weapon",
            "mode": "melee",
            "range": "Melee",
            "a": "3",
            "skill": "3+",
            "s": "4",
            "ap": "0",
            "d": "1",
            "abilities": "-",
            "sourceSelectionIds": [
              "unit-blightlord-terminators-selection-close-combat-weapon"
            ]
          },
          {
            "id": "blightlord-terminators-weapon-flail-of-corruption",
            "title": "Flail of corruption",
            "mode": "melee",
            "range": "Melee",
            "a": "6",
            "skill": "3+",
            "s": "5",
            "ap": "-1",
            "d": "2",
            "abilities": "LETHAL HITS",
            "sourceSelectionIds": [
              "unit-blightlord-terminators-selection-flail-of-corruption"
            ]
          }
        ],
        "wargearAbilities": [],
        "wargearDefaults": [
          {
            "modelId": "unit-blightlord-terminators-model-eba248135a",
            "selections": [
              {
                "selectionId": "unit-blightlord-terminators-selection-combi-bolter",
                "quantity": 1
              },
              {
                "selectionId": "unit-blightlord-terminators-selection-bubotic-blade",
                "quantity": 1
              }
            ]
          },
          {
            "modelId": "unit-blightlord-terminators-model-d1d8690192",
            "selections": [
              {
                "selectionId": "unit-blightlord-terminators-selection-combi-bolter",
                "quantity": 1
              },
              {
                "selectionId": "unit-blightlord-terminators-selection-bubotic-blade",
                "quantity": 1
              }
            ]
          }
        ],
        "wargearOptionContracts": [
          {
            "sourceId": "datasheet-blightlord-terminators:wargear:1",
            "eligibleModelIds": [
              "unit-blightlord-terminators-model-eba248135a",
              "unit-blightlord-terminators-model-d1d8690192"
            ],
            "limit": {
              "perModel": 1,
              "perModels": {
                "models": 5,
                "uses": 3
              }
            },
            "choices": [
              {
                "remove": [
                  {
                    "selectionId": "unit-blightlord-terminators-selection-combi-bolter",
                    "quantity": 1
                  }
                ],
                "add": [
                  {
                    "selectionId": "unit-blightlord-terminators-selection-combi-weapon",
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
            "sourceId": "datasheet-blightlord-terminators:wargear:2",
            "eligibleModelIds": [
              "unit-blightlord-terminators-model-d1d8690192"
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
                    "selectionId": "unit-blightlord-terminators-selection-combi-bolter",
                    "quantity": 1
                  },
                  {
                    "selectionId": "unit-blightlord-terminators-selection-bubotic-blade",
                    "quantity": 1
                  }
                ],
                "add": [
                  {
                    "selectionId": "unit-blightlord-terminators-selection-flail-of-corruption",
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
            "sourceId": "datasheet-blightlord-terminators:wargear:3",
            "eligibleModelIds": [
              "unit-blightlord-terminators-model-d1d8690192"
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
                    "selectionId": "unit-blightlord-terminators-selection-combi-bolter",
                    "quantity": 1
                  }
                ],
                "add": [
                  {
                    "selectionId": "unit-blightlord-terminators-selection-blight-launcher",
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
            "sourceId": "datasheet-blightlord-terminators:wargear:4",
            "eligibleModelIds": [
              "unit-blightlord-terminators-model-d1d8690192"
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
                    "selectionId": "unit-blightlord-terminators-selection-combi-bolter",
                    "quantity": 1
                  }
                ],
                "add": [
                  {
                    "selectionId": "unit-blightlord-terminators-selection-reaper-autocannon",
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
            "sourceId": "datasheet-blightlord-terminators:wargear:5",
            "eligibleModelIds": [
              "unit-blightlord-terminators-model-d1d8690192"
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
                    "selectionId": "unit-blightlord-terminators-selection-combi-bolter",
                    "quantity": 1
                  }
                ],
                "add": [
                  {
                    "selectionId": "unit-blightlord-terminators-selection-plague-spewer",
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
            "sourceId": "datasheet-blightlord-terminators:wargear:6",
            "eligibleModelIds": [
              "unit-blightlord-terminators-model-d1d8690192"
            ],
            "when": {
              "unitModelCountEquals": 3
            },
            "limit": {
              "perModel": 1,
              "perUnit": 1
            },
            "choices": [
              {
                "remove": [
                  {
                    "selectionId": "unit-blightlord-terminators-selection-combi-bolter",
                    "quantity": 1
                  },
                  {
                    "selectionId": "unit-blightlord-terminators-selection-bubotic-blade",
                    "quantity": 1
                  }
                ],
                "add": [
                  {
                    "selectionId": "unit-blightlord-terminators-selection-plague-spewer",
                    "quantity": 1
                  },
                  {
                    "selectionId": "unit-blightlord-terminators-selection-close-combat-weapon",
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
      "id": "unit-deathshroud-terminators",
      "title": "Deathshroud Terminators",
      "sourceBookId": "death-guard",
      "sourceLayer": "current",
      "intrinsicKeywords": [
        "INFANTRY",
        "CHAOS",
        "NURGLE",
        "TERMINATOR",
        "DEATHSHROUD TERMINATORS",
        "DEATH GUARD"
      ],
      "relations": {
        "canLead": [],
        "canSupport": [],
        "canBeLedBy": [
          {
            "unitId": "unit-lord-of-contagion",
            "maxCharacters": 1
          },
          {
            "unitId": "unit-lord-of-virulence",
            "maxCharacters": 1
          },
          {
            "unitId": "unit-typhus",
            "maxCharacters": 1
          }
        ],
        "canBeSupportedBy": []
      },
      "ruleFacts": {
        "id": "unit-deathshroud-terminators",
        "unitId": "unit-deathshroud-terminators",
        "slug": "deathshroud-terminators",
        "keywords": [
          "INFANTRY",
          "CHAOS",
          "NURGLE",
          "TERMINATOR",
          "DEATHSHROUD TERMINATORS",
          "DEATH GUARD"
        ],
        "intrinsicKeywords": [
          "INFANTRY",
          "CHAOS",
          "NURGLE",
          "TERMINATOR",
          "DEATHSHROUD TERMINATORS",
          "DEATH GUARD"
        ],
        "abilities": [
          "Deep Strike",
          "Nurgle’s Gift (Aura)",
          "Silent Bodyguard",
          "Death Approaches"
        ],
        "termIds": [
          "keyword-infantry",
          "keyword-chaos",
          "keyword-nurgle",
          "keyword-terminator",
          "keyword-deathshroud-terminators",
          "keyword-death-guard",
          "ability-silent-bodyguard-03a0a1b",
          "ability-death-approaches-3347016",
          "weapon-plaguespurt-gauntlet-5d2f8e8",
          "weapon-manreaper-strike-6cc8ecd",
          "weapon-manreaper-sweep-22f036f"
        ],
        "epic": false,
        "deadlyDemise": false,
        "attached": null,
        "attachmentKnown": false,
        "characterCount": 0,
        "twoCharacters": null,
        "warlord": null,
        "relations": {
          "canLead": [],
          "canSupport": [],
          "canBeLedBy": [
            {
              "unitId": "unit-lord-of-contagion",
              "maxCharacters": 1
            },
            {
              "unitId": "unit-lord-of-virulence",
              "maxCharacters": 1
            },
            {
              "unitId": "unit-typhus",
              "maxCharacters": 1
            }
          ],
          "canBeSupportedBy": []
        }
      },
      "gameSelections": {
        "stats": {
          "M": "5\"",
          "T": "7",
          "Sv": "2+",
          "W": "4",
          "Ld": "6+",
          "OC": "1",
          "Inv": "4+"
        },
        "abilities": [
          {
            "id": "deathshroud-terminators-ability-core",
            "sectionId": "deathshroud-terminators-ability-core",
            "title": "CORE",
            "text": "Deep Strike",
            "sourceUnitId": "unit-deathshroud-terminators"
          },
          {
            "id": "deathshroud-terminators-ability-faction",
            "sectionId": "deathshroud-terminators-ability-faction",
            "title": "FACTION",
            "text": "Nurgle’s Gift (Aura)",
            "sourceUnitId": "unit-deathshroud-terminators"
          },
          {
            "id": "deathshroud-terminators-ability-silent-bodyguard",
            "sectionId": "deathshroud-terminators-ability-silent-bodyguard",
            "title": "Silent Bodyguard",
            "text": "While a CHARACTER model is leading this unit, that CHARACTER model has the Feel No Pain 4+ ability.",
            "sourceUnitId": "unit-deathshroud-terminators"
          },
          {
            "id": "deathshroud-terminators-ability-death-approaches",
            "sectionId": "deathshroud-terminators-ability-death-approaches",
            "title": "Death Approaches",
            "text": "In your Movement phase, each time this unit is set up on the battlefield using the Deep Strike ability, it can be set up anywhere on the battlefield that is more than 6\" horizontally away from all Afflicted enemy units, and more than 8\" horizontally away from all other enemy units.",
            "sourceUnitId": "unit-deathshroud-terminators"
          }
        ],
        "models": [
          {
            "id": "unit-deathshroud-terminators-model-bbfb38a9d8",
            "title": "Deathshroud Champion",
            "aliases": [
              "Deathshroud Champion"
            ],
            "min": 1,
            "max": 1,
            "legacyIds": [
              "unit-deathshroud-terminators-model-deathshroud-champion"
            ]
          },
          {
            "id": "unit-deathshroud-terminators-model-eaf728af78",
            "title": "Deathshroud Terminator",
            "aliases": [
              "Deathshroud Terminator",
              "Deathshroud Terminators"
            ],
            "min": 2,
            "max": 5,
            "legacyIds": [
              "unit-deathshroud-terminators-model-deathshroud-terminator-2"
            ]
          }
        ],
        "compositionRules": [],
        "selections": [
          {
            "id": "unit-deathshroud-terminators-selection-plaguespurt-gauntlet",
            "title": "Plaguespurt gauntlet",
            "aliases": [
              "Plaguespurt gauntlet"
            ],
            "kind": "weapon",
            "profileIds": [
              "deathshroud-terminators-weapon-plaguespurt-gauntlet"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-deathshroud-terminators-selection-manreaper-strike",
            "title": "Manreaper – strike",
            "aliases": [
              "Manreaper – strike"
            ],
            "kind": "weapon",
            "profileIds": [
              "deathshroud-terminators-weapon-manreaper-strike"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-deathshroud-terminators-selection-manreaper-sweep",
            "title": "Manreaper – sweep",
            "aliases": [
              "Manreaper – sweep"
            ],
            "kind": "weapon",
            "profileIds": [
              "deathshroud-terminators-weapon-manreaper-sweep"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-deathshroud-terminators-weapon-family-manreaper-selection",
            "title": "Manreaper",
            "aliases": [
              "Manreaper"
            ],
            "kind": "weapon",
            "familyId": "unit-deathshroud-terminators-weapon-family-manreaper",
            "profileIds": [
              "deathshroud-terminators-weapon-manreaper-strike",
              "deathshroud-terminators-weapon-manreaper-sweep"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-deathshroud-terminators-selection-icon-of-despair",
            "title": "Icon of Despair",
            "aliases": [
              "Icon of Despair"
            ],
            "kind": "wargear",
            "profileIds": [],
            "wargearAbilityIds": [
              "deathshroud-terminators-ability-icon-of-despair-aura"
            ]
          }
        ],
        "weaponFamilies": [
          {
            "id": "unit-deathshroud-terminators-weapon-family-manreaper",
            "title": "Manreaper",
            "aliases": [
              "Manreaper"
            ],
            "profileIds": [
              "deathshroud-terminators-weapon-manreaper-strike",
              "deathshroud-terminators-weapon-manreaper-sweep"
            ],
            "ambiguousAlias": false
          }
        ],
        "weaponProfiles": [
          {
            "id": "deathshroud-terminators-weapon-plaguespurt-gauntlet",
            "title": "Plaguespurt gauntlet",
            "mode": "ranged",
            "range": "12\"",
            "a": "D6",
            "skill": "N/A",
            "s": "3",
            "ap": "0",
            "d": "1",
            "abilities": "ANTI-INFANTRY 4+, IGNORES COVER, PISTOL, TORRENT",
            "sourceSelectionIds": [
              "unit-deathshroud-terminators-selection-plaguespurt-gauntlet"
            ]
          },
          {
            "id": "deathshroud-terminators-weapon-manreaper-strike",
            "title": "Manreaper – strike",
            "mode": "melee",
            "range": "Melee",
            "a": "4",
            "skill": "2+",
            "s": "8",
            "ap": "-2",
            "d": "2",
            "abilities": "LETHAL HITS",
            "sourceSelectionIds": [
              "unit-deathshroud-terminators-selection-manreaper-strike",
              "unit-deathshroud-terminators-weapon-family-manreaper-selection"
            ]
          },
          {
            "id": "deathshroud-terminators-weapon-manreaper-sweep",
            "title": "Manreaper – sweep",
            "mode": "melee",
            "range": "Melee",
            "a": "8",
            "skill": "3+",
            "s": "4",
            "ap": "-1",
            "d": "1",
            "abilities": "LETHAL HITS",
            "sourceSelectionIds": [
              "unit-deathshroud-terminators-selection-manreaper-sweep",
              "unit-deathshroud-terminators-weapon-family-manreaper-selection"
            ]
          }
        ],
        "wargearAbilities": [
          {
            "id": "deathshroud-terminators-ability-icon-of-despair-aura",
            "sectionId": "deathshroud-terminators-ability-icon-of-despair-aura",
            "title": "Icon of Despair (Aura)",
            "text": "While an enemy unit is within 6\" of the bearer, worsen the Leadership characteristic of models in that unit by 1.",
            "sourceUnitId": "unit-deathshroud-terminators",
            "requiredSelectionIds": [
              "unit-deathshroud-terminators-selection-icon-of-despair"
            ]
          }
        ],
        "wargearDefaults": [
          {
            "modelId": "unit-deathshroud-terminators-model-bbfb38a9d8",
            "aliases": [
              "Deathshroud Terminator Champion"
            ],
            "selections": [
              {
                "selectionId": "unit-deathshroud-terminators-selection-plaguespurt-gauntlet",
                "quantity": 1
              },
              {
                "selectionId": "unit-deathshroud-terminators-weapon-family-manreaper-selection",
                "quantity": 1
              }
            ]
          },
          {
            "modelId": "unit-deathshroud-terminators-model-eaf728af78",
            "selections": [
              {
                "selectionId": "unit-deathshroud-terminators-selection-plaguespurt-gauntlet",
                "quantity": 1
              },
              {
                "selectionId": "unit-deathshroud-terminators-weapon-family-manreaper-selection",
                "quantity": 1
              }
            ]
          }
        ],
        "wargearOptionContracts": [
          {
            "sourceId": "datasheet-deathshroud-terminators:wargear:1",
            "eligibleModelIds": [
              "unit-deathshroud-terminators-model-bbfb38a9d8"
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
                    "selectionId": "unit-deathshroud-terminators-selection-plaguespurt-gauntlet",
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
            "sourceId": "datasheet-deathshroud-terminators:wargear:2",
            "eligibleModelIds": [
              "unit-deathshroud-terminators-model-bbfb38a9d8"
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
                    "selectionId": "unit-deathshroud-terminators-selection-icon-of-despair",
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
      "id": "unit-poxwalkers",
      "title": "Poxwalkers",
      "sourceBookId": "death-guard",
      "sourceLayer": "current",
      "intrinsicKeywords": [
        "INFANTRY",
        "CHAOS",
        "NURGLE",
        "POXWALKERS",
        "DEATH GUARD"
      ],
      "relations": {
        "canLead": [],
        "canSupport": [],
        "canBeLedBy": [
          {
            "unitId": "unit-malignant-plaguecaster",
            "maxCharacters": 2
          },
          {
            "unitId": "unit-noxious-blightbringer",
            "maxCharacters": 2
          },
          {
            "unitId": "unit-typhus",
            "maxCharacters": 2
          }
        ],
        "canBeSupportedBy": [
          {
            "unitId": "unit-noxious-blightbringer",
            "maxCharacters": 2
          }
        ]
      },
      "ruleFacts": {
        "id": "unit-poxwalkers",
        "unitId": "unit-poxwalkers",
        "slug": "poxwalkers",
        "keywords": [
          "INFANTRY",
          "CHAOS",
          "NURGLE",
          "POXWALKERS",
          "DEATH GUARD"
        ],
        "intrinsicKeywords": [
          "INFANTRY",
          "CHAOS",
          "NURGLE",
          "POXWALKERS",
          "DEATH GUARD"
        ],
        "abilities": [
          "Infiltrators",
          "Feel No Pain 5+",
          "Nurgle’s Gift (Aura)",
          "Curse of the Walking Pox"
        ],
        "termIds": [
          "keyword-infantry",
          "keyword-chaos",
          "keyword-nurgle",
          "keyword-poxwalkers",
          "keyword-death-guard",
          "ability-curse-of-the-walking-pox-6a9093e",
          "weapon-improvised-weapon-46cfc5f"
        ],
        "epic": false,
        "deadlyDemise": false,
        "attached": null,
        "attachmentKnown": false,
        "characterCount": 0,
        "twoCharacters": null,
        "warlord": null,
        "relations": {
          "canLead": [],
          "canSupport": [],
          "canBeLedBy": [
            {
              "unitId": "unit-malignant-plaguecaster",
              "maxCharacters": 2
            },
            {
              "unitId": "unit-noxious-blightbringer",
              "maxCharacters": 2
            },
            {
              "unitId": "unit-typhus",
              "maxCharacters": 2
            }
          ],
          "canBeSupportedBy": [
            {
              "unitId": "unit-noxious-blightbringer",
              "maxCharacters": 2
            }
          ]
        }
      },
      "gameSelections": {
        "stats": {
          "M": "5\"",
          "T": "4",
          "Sv": "7+",
          "W": "1",
          "Ld": "8+",
          "OC": "1"
        },
        "abilities": [
          {
            "id": "poxwalkers-ability-core",
            "sectionId": "poxwalkers-ability-core",
            "title": "CORE",
            "text": "Infiltrators, Feel No Pain 5+",
            "sourceUnitId": "unit-poxwalkers"
          },
          {
            "id": "poxwalkers-ability-faction",
            "sectionId": "poxwalkers-ability-faction",
            "title": "FACTION",
            "text": "Nurgle’s Gift (Aura)",
            "sourceUnitId": "unit-poxwalkers"
          },
          {
            "id": "poxwalkers-ability-curse-of-the-walking-pox",
            "sectionId": "poxwalkers-ability-curse-of-the-walking-pox",
            "title": "Curse of the Walking Pox",
            "text": "Each time a POXWALKER model in this unit makes an attack that destroys an enemy model (excluding MONSTER and VEHICLE models), after this unit has resolved its attacks, you can return one destroyed POXWALKER model to this unit. While TYPHUS is leading this unit, enemy models destroyed as a result of TYPHUS’ Eater Plague ability count as enemy models destroyed by an attack made by a POXWALKER model in this unit for the purposes of this ability.",
            "sourceUnitId": "unit-poxwalkers"
          }
        ],
        "models": [
          {
            "id": "unit-poxwalkers-model-4d2be0ca56",
            "title": "Poxwalker",
            "aliases": [
              "Poxwalker",
              "Poxwalkers"
            ],
            "min": 10,
            "max": 20,
            "legacyIds": [
              "unit-poxwalkers-model-poxwalker"
            ]
          }
        ],
        "compositionRules": [],
        "selections": [
          {
            "id": "unit-poxwalkers-selection-improvised-weapon",
            "title": "Improvised weapon",
            "aliases": [
              "Improvised weapon"
            ],
            "kind": "weapon",
            "profileIds": [
              "poxwalkers-weapon-improvised-weapon"
            ],
            "wargearAbilityIds": []
          }
        ],
        "weaponFamilies": [],
        "weaponProfiles": [
          {
            "id": "poxwalkers-weapon-improvised-weapon",
            "title": "Improvised weapon",
            "mode": "melee",
            "range": "Melee",
            "a": "2",
            "skill": "5+",
            "s": "3",
            "ap": "0",
            "d": "1",
            "abilities": "LETHAL HITS",
            "sourceSelectionIds": [
              "unit-poxwalkers-selection-improvised-weapon"
            ]
          }
        ],
        "wargearAbilities": []
      }
    },
    {
      "id": "unit-chaos-spawn",
      "title": "Chaos Spawn",
      "sourceBookId": "death-guard",
      "sourceLayer": "current",
      "intrinsicKeywords": [
        "BEAST",
        "CHAOS",
        "NURGLE",
        "CHAOS SPAWN",
        "DEATH GUARD"
      ],
      "relations": {
        "canLead": [],
        "canSupport": [],
        "canBeLedBy": [],
        "canBeSupportedBy": []
      },
      "ruleFacts": {
        "id": "unit-chaos-spawn",
        "unitId": "unit-chaos-spawn",
        "slug": "chaos-spawn",
        "keywords": [
          "BEAST",
          "CHAOS",
          "NURGLE",
          "CHAOS SPAWN",
          "DEATH GUARD"
        ],
        "intrinsicKeywords": [
          "BEAST",
          "CHAOS",
          "NURGLE",
          "CHAOS SPAWN",
          "DEATH GUARD"
        ],
        "abilities": [
          "DEADLY DEMISE",
          "Feel No Pain 5+",
          "Scouts 6\"",
          "Nurgle’s Gift (Aura)",
          "Lethal Ichor"
        ],
        "termIds": [
          "keyword-beast",
          "keyword-chaos",
          "keyword-nurgle",
          "keyword-chaos-spawn",
          "keyword-death-guard",
          "ability-lethal-ichor-6824af1",
          "weapon-hideous-mutations-5a8e226"
        ],
        "epic": false,
        "deadlyDemise": true,
        "attached": false,
        "attachmentKnown": true,
        "characterCount": 0,
        "twoCharacters": null,
        "warlord": null,
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
          "T": "7",
          "Sv": "4+",
          "W": "4",
          "Ld": "7+",
          "OC": "1"
        },
        "abilities": [
          {
            "id": "chaos-spawn-ability-core",
            "sectionId": "chaos-spawn-ability-core",
            "title": "CORE",
            "text": "Deadly Demise 1, Feel No Pain 5+, Scouts 6\"",
            "sourceUnitId": "unit-chaos-spawn"
          },
          {
            "id": "chaos-spawn-ability-faction",
            "sectionId": "chaos-spawn-ability-faction",
            "title": "FACTION",
            "text": "Nurgle’s Gift (Aura)",
            "sourceUnitId": "unit-chaos-spawn"
          },
          {
            "id": "chaos-spawn-ability-lethal-ichor",
            "sectionId": "chaos-spawn-ability-lethal-ichor",
            "title": "Lethal Ichor",
            "text": "Each time a melee attack is allocated to a model in this unit, after the attacking unit has finished making its attacks, roll one D6 (to a maximum of six D6 per attacking unit): for each 4+, the attacking unit suffers 1 mortal wound.",
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
            "title": "Hideous mutations",
            "aliases": [
              "Hideous mutations"
            ],
            "kind": "weapon",
            "profileIds": [
              "chaos-spawn-weapon-hideous-mutations"
            ],
            "wargearAbilityIds": []
          }
        ],
        "weaponFamilies": [],
        "weaponProfiles": [
          {
            "id": "chaos-spawn-weapon-hideous-mutations",
            "title": "Hideous mutations",
            "mode": "melee",
            "range": "Melee",
            "a": "D6+2",
            "skill": "4+",
            "s": "5",
            "ap": "-1",
            "d": "2",
            "abilities": "-",
            "sourceSelectionIds": [
              "unit-chaos-spawn-selection-hideous-mutations"
            ]
          }
        ],
        "wargearAbilities": []
      }
    },
    {
      "id": "unit-chaos-land-raider",
      "title": "Chaos Land Raider",
      "sourceBookId": "death-guard",
      "sourceLayer": "current",
      "intrinsicKeywords": [
        "VEHICLE",
        "TRANSPORT",
        "SMOKE",
        "CHAOS",
        "NURGLE",
        "LAND RAIDER",
        "FRAME",
        "DEATH GUARD"
      ],
      "relations": {
        "canLead": [],
        "canSupport": [],
        "canBeLedBy": [],
        "canBeSupportedBy": []
      },
      "ruleFacts": {
        "id": "unit-chaos-land-raider",
        "unitId": "unit-chaos-land-raider",
        "slug": "chaos-land-raider",
        "keywords": [
          "VEHICLE",
          "TRANSPORT",
          "SMOKE",
          "CHAOS",
          "NURGLE",
          "LAND RAIDER",
          "FRAME",
          "DEATH GUARD"
        ],
        "intrinsicKeywords": [
          "VEHICLE",
          "TRANSPORT",
          "SMOKE",
          "CHAOS",
          "NURGLE",
          "LAND RAIDER",
          "FRAME",
          "DEATH GUARD"
        ],
        "abilities": [
          "DEADLY DEMISE",
          "Nurgle’s Gift (Aura)",
          "Assault Ramp"
        ],
        "termIds": [
          "keyword-vehicle",
          "keyword-transport",
          "keyword-smoke",
          "keyword-chaos",
          "keyword-nurgle",
          "keyword-land-raider",
          "keyword-frame",
          "keyword-death-guard",
          "ability-assault-ramp-e5223e4",
          "weapon-combi-bolter-5d7d99e",
          "weapon-combi-weapon-b2eeb14",
          "weapon-havoc-launcher-cf26557",
          "weapon-soulshatter-lascannon-e64b490",
          "weapon-twin-heavy-bolter-b1e2633",
          "weapon-armoured-tracks-ddf575f"
        ],
        "epic": false,
        "deadlyDemise": true,
        "attached": false,
        "attachmentKnown": true,
        "characterCount": 0,
        "twoCharacters": null,
        "warlord": null,
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
          "OC": "5"
        },
        "abilities": [
          {
            "id": "chaos-land-raider-ability-core",
            "sectionId": "chaos-land-raider-ability-core",
            "title": "CORE",
            "text": "Deadly Demise D6",
            "sourceUnitId": "unit-chaos-land-raider"
          },
          {
            "id": "chaos-land-raider-ability-faction",
            "sectionId": "chaos-land-raider-ability-faction",
            "title": "FACTION",
            "text": "Nurgle’s Gift (Aura)",
            "sourceUnitId": "unit-chaos-land-raider"
          },
          {
            "id": "chaos-land-raider-ability-assault-ramp",
            "sectionId": "chaos-land-raider-ability-assault-ramp",
            "title": "Assault Ramp",
            "text": "Each time a unit disembarks from this model after it has made a Normal move, that unit makes an assault disembark move (Core Rules, 18.06) for that disembarkation.",
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
            "id": "unit-chaos-land-raider-selection-combi-bolter",
            "title": "Combi-bolter",
            "aliases": [
              "Combi-bolter"
            ],
            "kind": "weapon",
            "profileIds": [
              "chaos-land-raider-weapon-combi-bolter"
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
              "chaos-land-raider-weapon-combi-weapon"
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
              "chaos-land-raider-weapon-havoc-launcher"
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
              "chaos-land-raider-weapon-soulshatter-lascannon"
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
              "chaos-land-raider-weapon-twin-heavy-bolter"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-chaos-land-raider-selection-armoured-tracks",
            "title": "Armoured tracks",
            "aliases": [
              "Armoured tracks"
            ],
            "kind": "weapon",
            "profileIds": [
              "chaos-land-raider-weapon-armoured-tracks"
            ],
            "wargearAbilityIds": []
          }
        ],
        "weaponFamilies": [],
        "weaponProfiles": [
          {
            "id": "chaos-land-raider-weapon-combi-bolter",
            "title": "Combi-bolter",
            "mode": "ranged",
            "range": "24\"",
            "a": "2",
            "skill": "3+",
            "s": "4",
            "ap": "0",
            "d": "1",
            "abilities": "LETHAL HITS, RAPID FIRE 2",
            "sourceSelectionIds": [
              "unit-chaos-land-raider-selection-combi-bolter"
            ]
          },
          {
            "id": "chaos-land-raider-weapon-combi-weapon",
            "title": "Combi-weapon",
            "mode": "ranged",
            "range": "24\"",
            "a": "1",
            "skill": "4+",
            "s": "4",
            "ap": "0",
            "d": "1",
            "abilities": "ANTI-INFANTRY 4+, DEVASTATING WOUNDS, RAPID FIRE 1",
            "sourceSelectionIds": [
              "unit-chaos-land-raider-selection-combi-weapon"
            ]
          },
          {
            "id": "chaos-land-raider-weapon-havoc-launcher",
            "title": "Havoc launcher",
            "mode": "ranged",
            "range": "48\"",
            "a": "D6",
            "skill": "3+",
            "s": "5",
            "ap": "0",
            "d": "1",
            "abilities": "BLAST",
            "sourceSelectionIds": [
              "unit-chaos-land-raider-selection-havoc-launcher"
            ]
          },
          {
            "id": "chaos-land-raider-weapon-soulshatter-lascannon",
            "title": "Soulshatter lascannon",
            "mode": "ranged",
            "range": "48\"",
            "a": "2",
            "skill": "3+",
            "s": "12",
            "ap": "-3",
            "d": "D6+1",
            "abilities": "-",
            "sourceSelectionIds": [
              "unit-chaos-land-raider-selection-soulshatter-lascannon"
            ]
          },
          {
            "id": "chaos-land-raider-weapon-twin-heavy-bolter",
            "title": "Twin heavy bolter",
            "mode": "ranged",
            "range": "36\"",
            "a": "3",
            "skill": "3+",
            "s": "5",
            "ap": "-1",
            "d": "2",
            "abilities": "LETHAL HITS, SUSTAINED HITS 1, TWIN-LINKED",
            "sourceSelectionIds": [
              "unit-chaos-land-raider-selection-twin-heavy-bolter"
            ]
          },
          {
            "id": "chaos-land-raider-weapon-armoured-tracks",
            "title": "Armoured tracks",
            "mode": "melee",
            "range": "Melee",
            "a": "6",
            "skill": "4+",
            "s": "8",
            "ap": "0",
            "d": "1",
            "abilities": "-",
            "sourceSelectionIds": [
              "unit-chaos-land-raider-selection-armoured-tracks"
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
      "id": "unit-chaos-predator-annihilator",
      "title": "Chaos Predator Annihilator",
      "sourceBookId": "death-guard",
      "sourceLayer": "current",
      "intrinsicKeywords": [
        "VEHICLE",
        "SMOKE",
        "CHAOS",
        "NURGLE",
        "PREDATOR ANNIHILATOR",
        "FRAME",
        "DEATH GUARD"
      ],
      "relations": {
        "canLead": [],
        "canSupport": [],
        "canBeLedBy": [],
        "canBeSupportedBy": []
      },
      "ruleFacts": {
        "id": "unit-chaos-predator-annihilator",
        "unitId": "unit-chaos-predator-annihilator",
        "slug": "chaos-predator-annihilator",
        "keywords": [
          "VEHICLE",
          "SMOKE",
          "CHAOS",
          "NURGLE",
          "PREDATOR ANNIHILATOR",
          "FRAME",
          "DEATH GUARD"
        ],
        "intrinsicKeywords": [
          "VEHICLE",
          "SMOKE",
          "CHAOS",
          "NURGLE",
          "PREDATOR ANNIHILATOR",
          "FRAME",
          "DEATH GUARD"
        ],
        "abilities": [
          "DEADLY DEMISE",
          "Nurgle’s Gift (Aura)",
          "Metalophagic Infection"
        ],
        "termIds": [
          "keyword-vehicle",
          "keyword-smoke",
          "keyword-chaos",
          "keyword-nurgle",
          "keyword-predator-annihilator",
          "keyword-frame",
          "keyword-death-guard",
          "ability-metalophagic-infection-7a47e75",
          "weapon-combi-bolter-5d7d99e",
          "weapon-combi-weapon-b2eeb14",
          "weapon-heavy-bolter-f39583a",
          "weapon-havoc-launcher-cf26557",
          "weapon-lascannon-bfd40c1",
          "weapon-predator-twin-lascannon-92dd066",
          "weapon-armoured-tracks-a6a4ba9"
        ],
        "epic": false,
        "deadlyDemise": true,
        "attached": false,
        "attachmentKnown": true,
        "characterCount": 0,
        "twoCharacters": null,
        "warlord": null,
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
          "W": "11",
          "Ld": "6+",
          "OC": "3"
        },
        "abilities": [
          {
            "id": "chaos-predator-annihilator-ability-core",
            "sectionId": "chaos-predator-annihilator-ability-core",
            "title": "CORE",
            "text": "Deadly Demise D3",
            "sourceUnitId": "unit-chaos-predator-annihilator"
          },
          {
            "id": "chaos-predator-annihilator-ability-faction",
            "sectionId": "chaos-predator-annihilator-ability-faction",
            "title": "FACTION",
            "text": "Nurgle’s Gift (Aura)",
            "sourceUnitId": "unit-chaos-predator-annihilator"
          },
          {
            "id": "chaos-predator-annihilator-ability-metalophagic-infection",
            "sectionId": "chaos-predator-annihilator-ability-metalophagic-infection",
            "title": "Metalophagic Infection",
            "text": "In your Shooting phase, after this model has shot, select one enemy MONSTER or VEHICLE unit hit by one or more of those attacks. Roll one D6, adding 1 to the result if that unit is Afflicted; on a 5+, that unit suffers D3 mortal wounds.",
            "sourceUnitId": "unit-chaos-predator-annihilator"
          }
        ],
        "models": [
          {
            "id": "unit-chaos-predator-annihilator-model-82546cc94c",
            "title": "Chaos Predator Annihilator",
            "aliases": [
              "Chaos Predator Annihilator"
            ],
            "min": 1,
            "max": 1,
            "legacyIds": [
              "unit-chaos-predator-annihilator-model-chaos-predator-annihilator"
            ]
          }
        ],
        "compositionRules": [],
        "selections": [
          {
            "id": "unit-chaos-predator-annihilator-selection-combi-bolter",
            "title": "Combi-bolter",
            "aliases": [
              "Combi-bolter"
            ],
            "kind": "weapon",
            "profileIds": [
              "chaos-predator-annihilator-weapon-combi-bolter"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-chaos-predator-annihilator-selection-combi-weapon",
            "title": "Combi-weapon",
            "aliases": [
              "Combi-weapon"
            ],
            "kind": "weapon",
            "profileIds": [
              "chaos-predator-annihilator-weapon-combi-weapon"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-chaos-predator-annihilator-selection-heavy-bolter",
            "title": "Heavy bolter",
            "aliases": [
              "Heavy bolter"
            ],
            "kind": "weapon",
            "profileIds": [
              "chaos-predator-annihilator-weapon-heavy-bolter"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-chaos-predator-annihilator-selection-havoc-launcher",
            "title": "Havoc launcher",
            "aliases": [
              "Havoc launcher"
            ],
            "kind": "weapon",
            "profileIds": [
              "chaos-predator-annihilator-weapon-havoc-launcher"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-chaos-predator-annihilator-selection-lascannon",
            "title": "Lascannon",
            "aliases": [
              "Lascannon"
            ],
            "kind": "weapon",
            "profileIds": [
              "chaos-predator-annihilator-weapon-lascannon"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-chaos-predator-annihilator-selection-predator-twin-lascannon",
            "title": "Predator twin lascannon",
            "aliases": [
              "Predator twin lascannon"
            ],
            "kind": "weapon",
            "profileIds": [
              "chaos-predator-annihilator-weapon-predator-twin-lascannon"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-chaos-predator-annihilator-selection-armoured-tracks",
            "title": "Armoured tracks",
            "aliases": [
              "Armoured tracks"
            ],
            "kind": "weapon",
            "profileIds": [
              "chaos-predator-annihilator-weapon-armoured-tracks"
            ],
            "wargearAbilityIds": []
          }
        ],
        "weaponFamilies": [],
        "weaponProfiles": [
          {
            "id": "chaos-predator-annihilator-weapon-combi-bolter",
            "title": "Combi-bolter",
            "mode": "ranged",
            "range": "24\"",
            "a": "2",
            "skill": "3+",
            "s": "4",
            "ap": "0",
            "d": "1",
            "abilities": "LETHAL HITS, RAPID FIRE 2",
            "sourceSelectionIds": [
              "unit-chaos-predator-annihilator-selection-combi-bolter"
            ]
          },
          {
            "id": "chaos-predator-annihilator-weapon-combi-weapon",
            "title": "Combi-weapon",
            "mode": "ranged",
            "range": "24\"",
            "a": "1",
            "skill": "4+",
            "s": "4",
            "ap": "0",
            "d": "1",
            "abilities": "ANTI-INFANTRY 4+, DEVASTATING WOUNDS, RAPID FIRE 1",
            "sourceSelectionIds": [
              "unit-chaos-predator-annihilator-selection-combi-weapon"
            ]
          },
          {
            "id": "chaos-predator-annihilator-weapon-heavy-bolter",
            "title": "Heavy bolter",
            "mode": "ranged",
            "range": "36\"",
            "a": "3",
            "skill": "3+",
            "s": "5",
            "ap": "-1",
            "d": "2",
            "abilities": "LETHAL HITS, SUSTAINED HITS 1",
            "sourceSelectionIds": [
              "unit-chaos-predator-annihilator-selection-heavy-bolter"
            ]
          },
          {
            "id": "chaos-predator-annihilator-weapon-havoc-launcher",
            "title": "Havoc launcher",
            "mode": "ranged",
            "range": "48\"",
            "a": "D6",
            "skill": "3+",
            "s": "5",
            "ap": "0",
            "d": "1",
            "abilities": "BLAST",
            "sourceSelectionIds": [
              "unit-chaos-predator-annihilator-selection-havoc-launcher"
            ]
          },
          {
            "id": "chaos-predator-annihilator-weapon-lascannon",
            "title": "Lascannon",
            "mode": "ranged",
            "range": "48\"",
            "a": "1",
            "skill": "3+",
            "s": "12",
            "ap": "-3",
            "d": "D6+1",
            "abilities": "-",
            "sourceSelectionIds": [
              "unit-chaos-predator-annihilator-selection-lascannon"
            ]
          },
          {
            "id": "chaos-predator-annihilator-weapon-predator-twin-lascannon",
            "title": "Predator twin lascannon",
            "mode": "ranged",
            "range": "48\"",
            "a": "1",
            "skill": "3+",
            "s": "14",
            "ap": "-3",
            "d": "D6+1",
            "abilities": "TWIN-LINKED",
            "sourceSelectionIds": [
              "unit-chaos-predator-annihilator-selection-predator-twin-lascannon"
            ]
          },
          {
            "id": "chaos-predator-annihilator-weapon-armoured-tracks",
            "title": "Armoured tracks",
            "mode": "melee",
            "range": "Melee",
            "a": "3",
            "skill": "4+",
            "s": "6",
            "ap": "0",
            "d": "1",
            "abilities": "-",
            "sourceSelectionIds": [
              "unit-chaos-predator-annihilator-selection-armoured-tracks"
            ]
          }
        ],
        "wargearAbilities": [],
        "wargearDefaults": [
          {
            "modelId": "unit-chaos-predator-annihilator-model-82546cc94c",
            "selections": [
              {
                "selectionId": "unit-chaos-predator-annihilator-selection-predator-twin-lascannon",
                "quantity": 1
              },
              {
                "selectionId": "unit-chaos-predator-annihilator-selection-armoured-tracks",
                "quantity": 1
              }
            ]
          }
        ],
        "wargearOptionContracts": [
          {
            "sourceId": "datasheet-chaos-predator-annihilator:wargear:1",
            "eligibleModelIds": [
              "unit-chaos-predator-annihilator-model-82546cc94c"
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
                    "selectionId": "unit-chaos-predator-annihilator-selection-lascannon",
                    "quantity": 2
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
                    "selectionId": "unit-chaos-predator-annihilator-selection-heavy-bolter",
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
            "sourceId": "datasheet-chaos-predator-annihilator:wargear:2",
            "eligibleModelIds": [
              "unit-chaos-predator-annihilator-model-82546cc94c"
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
                    "selectionId": "unit-chaos-predator-annihilator-selection-combi-weapon",
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
                    "selectionId": "unit-chaos-predator-annihilator-selection-combi-bolter",
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
            "sourceId": "datasheet-chaos-predator-annihilator:wargear:3",
            "eligibleModelIds": [
              "unit-chaos-predator-annihilator-model-82546cc94c"
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
                    "selectionId": "unit-chaos-predator-annihilator-selection-havoc-launcher",
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
      "id": "unit-chaos-predator-destructor",
      "title": "Chaos Predator Destructor",
      "sourceBookId": "death-guard",
      "sourceLayer": "current",
      "intrinsicKeywords": [
        "VEHICLE",
        "SMOKE",
        "CHAOS",
        "NURGLE",
        "PREDATOR DESTRUCTOR",
        "FRAME",
        "DEATH GUARD"
      ],
      "relations": {
        "canLead": [],
        "canSupport": [],
        "canBeLedBy": [],
        "canBeSupportedBy": []
      },
      "ruleFacts": {
        "id": "unit-chaos-predator-destructor",
        "unitId": "unit-chaos-predator-destructor",
        "slug": "chaos-predator-destructor",
        "keywords": [
          "VEHICLE",
          "SMOKE",
          "CHAOS",
          "NURGLE",
          "PREDATOR DESTRUCTOR",
          "FRAME",
          "DEATH GUARD"
        ],
        "intrinsicKeywords": [
          "VEHICLE",
          "SMOKE",
          "CHAOS",
          "NURGLE",
          "PREDATOR DESTRUCTOR",
          "FRAME",
          "DEATH GUARD"
        ],
        "abilities": [
          "DEADLY DEMISE",
          "Nurgle’s Gift (Aura)",
          "Hail of Corrosive Disease"
        ],
        "termIds": [
          "keyword-vehicle",
          "keyword-smoke",
          "keyword-chaos",
          "keyword-nurgle",
          "keyword-predator-destructor",
          "keyword-frame",
          "keyword-death-guard",
          "ability-hail-of-corrosive-disease-0f6451f",
          "weapon-combi-bolter-5d7d99e",
          "weapon-combi-weapon-b2eeb14",
          "weapon-havoc-launcher-cf26557",
          "weapon-heavy-bolter-f39583a",
          "weapon-lascannon-bfd40c1",
          "weapon-predator-autocannon-c571572",
          "weapon-armoured-tracks-a6a4ba9"
        ],
        "epic": false,
        "deadlyDemise": true,
        "attached": false,
        "attachmentKnown": true,
        "characterCount": 0,
        "twoCharacters": null,
        "warlord": null,
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
          "W": "11",
          "Ld": "6+",
          "OC": "3"
        },
        "abilities": [
          {
            "id": "chaos-predator-destructor-ability-core",
            "sectionId": "chaos-predator-destructor-ability-core",
            "title": "CORE",
            "text": "Deadly Demise D3",
            "sourceUnitId": "unit-chaos-predator-destructor"
          },
          {
            "id": "chaos-predator-destructor-ability-faction",
            "sectionId": "chaos-predator-destructor-ability-faction",
            "title": "FACTION",
            "text": "Nurgle’s Gift (Aura)",
            "sourceUnitId": "unit-chaos-predator-destructor"
          },
          {
            "id": "chaos-predator-destructor-ability-hail-of-corrosive-disease",
            "sectionId": "chaos-predator-destructor-ability-hail-of-corrosive-disease",
            "title": "Hail of Corrosive Disease",
            "text": "In your Shooting phase, after this model has shot, select one enemy unit (excluding MONSTERS and VEHICLES) hit by one or more of those attacks. Until the end of the phase, each time a friendly DEATH GUARD unit makes a ranged attack that targets that enemy unit, improve the Armour Penetration characteristic of that attack by 1. The same enemy unit can only be affected by this ability once per phase.",
            "sourceUnitId": "unit-chaos-predator-destructor"
          }
        ],
        "models": [
          {
            "id": "unit-chaos-predator-destructor-model-c17bde4f31",
            "title": "Chaos Predator Destructor",
            "aliases": [
              "Chaos Predator Destructor"
            ],
            "min": 1,
            "max": 1,
            "legacyIds": [
              "unit-chaos-predator-destructor-model-chaos-predator-destructor"
            ]
          }
        ],
        "compositionRules": [],
        "selections": [
          {
            "id": "unit-chaos-predator-destructor-selection-combi-bolter",
            "title": "Combi-bolter",
            "aliases": [
              "Combi-bolter"
            ],
            "kind": "weapon",
            "profileIds": [
              "chaos-predator-destructor-weapon-combi-bolter"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-chaos-predator-destructor-selection-combi-weapon",
            "title": "Combi-weapon",
            "aliases": [
              "Combi-weapon"
            ],
            "kind": "weapon",
            "profileIds": [
              "chaos-predator-destructor-weapon-combi-weapon"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-chaos-predator-destructor-selection-havoc-launcher",
            "title": "Havoc launcher",
            "aliases": [
              "Havoc launcher"
            ],
            "kind": "weapon",
            "profileIds": [
              "chaos-predator-destructor-weapon-havoc-launcher"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-chaos-predator-destructor-selection-heavy-bolter",
            "title": "Heavy bolter",
            "aliases": [
              "Heavy bolter"
            ],
            "kind": "weapon",
            "profileIds": [
              "chaos-predator-destructor-weapon-heavy-bolter"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-chaos-predator-destructor-selection-lascannon",
            "title": "Lascannon",
            "aliases": [
              "Lascannon"
            ],
            "kind": "weapon",
            "profileIds": [
              "chaos-predator-destructor-weapon-lascannon"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-chaos-predator-destructor-selection-predator-autocannon",
            "title": "Predator autocannon",
            "aliases": [
              "Predator autocannon"
            ],
            "kind": "weapon",
            "profileIds": [
              "chaos-predator-destructor-weapon-predator-autocannon"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-chaos-predator-destructor-selection-armoured-tracks",
            "title": "Armoured tracks",
            "aliases": [
              "Armoured tracks"
            ],
            "kind": "weapon",
            "profileIds": [
              "chaos-predator-destructor-weapon-armoured-tracks"
            ],
            "wargearAbilityIds": []
          }
        ],
        "weaponFamilies": [],
        "weaponProfiles": [
          {
            "id": "chaos-predator-destructor-weapon-combi-bolter",
            "title": "Combi-bolter",
            "mode": "ranged",
            "range": "24\"",
            "a": "2",
            "skill": "3+",
            "s": "4",
            "ap": "0",
            "d": "1",
            "abilities": "LETHAL HITS, RAPID FIRE 2",
            "sourceSelectionIds": [
              "unit-chaos-predator-destructor-selection-combi-bolter"
            ]
          },
          {
            "id": "chaos-predator-destructor-weapon-combi-weapon",
            "title": "Combi-weapon",
            "mode": "ranged",
            "range": "24\"",
            "a": "1",
            "skill": "4+",
            "s": "4",
            "ap": "0",
            "d": "1",
            "abilities": "ANTI-INFANTRY 4+, DEVASTATING WOUNDS, RAPID FIRE 1",
            "sourceSelectionIds": [
              "unit-chaos-predator-destructor-selection-combi-weapon"
            ]
          },
          {
            "id": "chaos-predator-destructor-weapon-havoc-launcher",
            "title": "Havoc launcher",
            "mode": "ranged",
            "range": "48\"",
            "a": "D6",
            "skill": "3+",
            "s": "5",
            "ap": "0",
            "d": "1",
            "abilities": "BLAST",
            "sourceSelectionIds": [
              "unit-chaos-predator-destructor-selection-havoc-launcher"
            ]
          },
          {
            "id": "chaos-predator-destructor-weapon-heavy-bolter",
            "title": "Heavy bolter",
            "mode": "ranged",
            "range": "36\"",
            "a": "3",
            "skill": "3+",
            "s": "5",
            "ap": "-1",
            "d": "2",
            "abilities": "LETHAL HITS, SUSTAINED HITS 1",
            "sourceSelectionIds": [
              "unit-chaos-predator-destructor-selection-heavy-bolter"
            ]
          },
          {
            "id": "chaos-predator-destructor-weapon-lascannon",
            "title": "Lascannon",
            "mode": "ranged",
            "range": "48\"",
            "a": "1",
            "skill": "3+",
            "s": "12",
            "ap": "-3",
            "d": "D6+1",
            "abilities": "-",
            "sourceSelectionIds": [
              "unit-chaos-predator-destructor-selection-lascannon"
            ]
          },
          {
            "id": "chaos-predator-destructor-weapon-predator-autocannon",
            "title": "Predator autocannon",
            "mode": "ranged",
            "range": "48\"",
            "a": "4",
            "skill": "3+",
            "s": "9",
            "ap": "-1",
            "d": "3",
            "abilities": "LETHAL HITS, RAPID FIRE 2",
            "sourceSelectionIds": [
              "unit-chaos-predator-destructor-selection-predator-autocannon"
            ]
          },
          {
            "id": "chaos-predator-destructor-weapon-armoured-tracks",
            "title": "Armoured tracks",
            "mode": "melee",
            "range": "Melee",
            "a": "3",
            "skill": "4+",
            "s": "6",
            "ap": "0",
            "d": "1",
            "abilities": "-",
            "sourceSelectionIds": [
              "unit-chaos-predator-destructor-selection-armoured-tracks"
            ]
          }
        ],
        "wargearAbilities": [],
        "wargearDefaults": [
          {
            "modelId": "unit-chaos-predator-destructor-model-c17bde4f31",
            "selections": [
              {
                "selectionId": "unit-chaos-predator-destructor-selection-predator-autocannon",
                "quantity": 1
              },
              {
                "selectionId": "unit-chaos-predator-destructor-selection-armoured-tracks",
                "quantity": 1
              }
            ]
          }
        ],
        "wargearOptionContracts": [
          {
            "sourceId": "datasheet-chaos-predator-destructor:wargear:1",
            "eligibleModelIds": [
              "unit-chaos-predator-destructor-model-c17bde4f31"
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
                    "selectionId": "unit-chaos-predator-destructor-selection-heavy-bolter",
                    "quantity": 2
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
                    "selectionId": "unit-chaos-predator-destructor-selection-lascannon",
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
            "sourceId": "datasheet-chaos-predator-destructor:wargear:2",
            "eligibleModelIds": [
              "unit-chaos-predator-destructor-model-c17bde4f31"
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
                    "selectionId": "unit-chaos-predator-destructor-selection-combi-bolter",
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
                    "selectionId": "unit-chaos-predator-destructor-selection-combi-weapon",
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
            "sourceId": "datasheet-chaos-predator-destructor:wargear:3",
            "eligibleModelIds": [
              "unit-chaos-predator-destructor-model-c17bde4f31"
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
                    "selectionId": "unit-chaos-predator-destructor-selection-havoc-launcher",
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
      "id": "unit-defiler",
      "title": "Defiler",
      "sourceBookId": "death-guard",
      "sourceLayer": "current",
      "intrinsicKeywords": [
        "VEHICLE",
        "WALKER",
        "CHAOS",
        "NURGLE",
        "DAEMON",
        "DEFILER",
        "DEATH GUARD"
      ],
      "relations": {
        "canLead": [],
        "canSupport": [],
        "canBeLedBy": [],
        "canBeSupportedBy": []
      },
      "ruleFacts": {
        "id": "unit-defiler",
        "unitId": "unit-defiler",
        "slug": "defiler",
        "keywords": [
          "VEHICLE",
          "WALKER",
          "CHAOS",
          "NURGLE",
          "DAEMON",
          "DEFILER",
          "DEATH GUARD"
        ],
        "intrinsicKeywords": [
          "VEHICLE",
          "WALKER",
          "CHAOS",
          "NURGLE",
          "DAEMON",
          "DEFILER",
          "DEATH GUARD"
        ],
        "abilities": [
          "DEADLY DEMISE",
          "Nurgle’s Gift (Aura)",
          "Scuttling Walker",
          "Barrage of Filth"
        ],
        "termIds": [
          "keyword-vehicle",
          "keyword-walker",
          "keyword-chaos",
          "keyword-nurgle",
          "keyword-daemon",
          "keyword-defiler",
          "keyword-death-guard",
          "ability-scuttling-walker-cb4a0c4",
          "ability-barrage-of-filth-f33e996",
          "weapon-ectoplasma-destructor-e0da30e",
          "weapon-excruciator-cannon-f11eadc",
          "weapon-hades-battle-cannon-1f93c08",
          "weapon-hades-lascannon-19b7d63",
          "weapon-heavy-baleflamer-2c0f38e",
          "weapon-heavy-missile-launcher-krak-d745166",
          "weapon-heavy-missile-launcher-frag-2d0854e",
          "weapon-heavy-reaper-autocannon-ca7d571",
          "weapon-magma-cutters-4ae88f3",
          "weapon-electroscourge-e76631b",
          "weapon-shearing-claws-strike-f6ebe2b",
          "weapon-shearing-claws-sweep-8074872"
        ],
        "epic": false,
        "deadlyDemise": true,
        "attached": false,
        "attachmentKnown": true,
        "characterCount": 0,
        "twoCharacters": null,
        "warlord": null,
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
          "Inv": "5+"
        },
        "abilities": [
          {
            "id": "defiler-ability-core",
            "sectionId": "defiler-ability-core",
            "title": "CORE",
            "text": "Deadly Demise D6",
            "sourceUnitId": "unit-defiler"
          },
          {
            "id": "defiler-ability-faction",
            "sectionId": "defiler-ability-faction",
            "title": "FACTION",
            "text": "Nurgle’s Gift (Aura)",
            "sourceUnitId": "unit-defiler"
          },
          {
            "id": "defiler-ability-scuttling-walker",
            "sectionId": "defiler-ability-scuttling-walker",
            "title": "Scuttling Walker",
            "text": "Each time this unit makes a Normal, Advance or Fall Back move, it can move through models (excluding TITANIC models) and terrain features. When doing so, it can move within Engagement Range of enemy models, but cannot end that move within Engagement Range of them, and any Desperate Escape test is automatically passed.",
            "sourceUnitId": "unit-defiler"
          },
          {
            "id": "defiler-ability-barrage-of-filth",
            "sectionId": "defiler-ability-barrage-of-filth",
            "title": "Barrage of Filth",
            "text": "In your Shooting phase, after this model has shot, select one enemy unit hit by one or more of those attacks. Until the end of the phase, that unit cannot have the Benefit of Cover.",
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
            "id": "unit-defiler-selection-ectoplasma-destructor",
            "title": "Ectoplasma destructor",
            "aliases": [
              "Ectoplasma destructor"
            ],
            "kind": "weapon",
            "profileIds": [
              "defiler-weapon-ectoplasma-destructor"
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
              "defiler-weapon-excruciator-cannon"
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
              "defiler-weapon-hades-battle-cannon"
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
              "defiler-weapon-hades-lascannon"
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
              "defiler-weapon-heavy-baleflamer"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-defiler-selection-heavy-missile-launcher-krak",
            "title": "Heavy missile launcher - krak",
            "aliases": [
              "Heavy missile launcher - krak"
            ],
            "kind": "weapon",
            "profileIds": [
              "defiler-weapon-heavy-missile-launcher-krak"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-defiler-selection-heavy-missile-launcher-frag",
            "title": "Heavy missile launcher - frag",
            "aliases": [
              "Heavy missile launcher - frag"
            ],
            "kind": "weapon",
            "profileIds": [
              "defiler-weapon-heavy-missile-launcher-frag"
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
              "defiler-weapon-heavy-reaper-autocannon"
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
              "defiler-weapon-magma-cutters"
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
              "defiler-weapon-electroscourge"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-defiler-selection-shearing-claws-strike",
            "title": "Shearing claws - strike",
            "aliases": [
              "Shearing claws - strike"
            ],
            "kind": "weapon",
            "profileIds": [
              "defiler-weapon-shearing-claws-strike"
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
              "defiler-weapon-shearing-claws-sweep"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-defiler-weapon-family-heavy-missile-launcher-selection",
            "title": "Heavy missile launcher",
            "aliases": [
              "Heavy missile launcher"
            ],
            "kind": "weapon",
            "familyId": "unit-defiler-weapon-family-heavy-missile-launcher",
            "profileIds": [
              "defiler-weapon-heavy-missile-launcher-krak",
              "defiler-weapon-heavy-missile-launcher-frag"
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
              "defiler-weapon-shearing-claws-strike",
              "defiler-weapon-shearing-claws-sweep"
            ],
            "wargearAbilityIds": []
          }
        ],
        "weaponFamilies": [
          {
            "id": "unit-defiler-weapon-family-heavy-missile-launcher",
            "title": "Heavy missile launcher",
            "aliases": [
              "Heavy missile launcher"
            ],
            "profileIds": [
              "defiler-weapon-heavy-missile-launcher-krak",
              "defiler-weapon-heavy-missile-launcher-frag"
            ],
            "ambiguousAlias": false
          },
          {
            "id": "unit-defiler-weapon-family-shearing-claws",
            "title": "Shearing claws",
            "aliases": [
              "Shearing claws"
            ],
            "profileIds": [
              "defiler-weapon-shearing-claws-strike",
              "defiler-weapon-shearing-claws-sweep"
            ],
            "ambiguousAlias": false
          }
        ],
        "weaponProfiles": [
          {
            "id": "defiler-weapon-ectoplasma-destructor",
            "title": "Ectoplasma destructor",
            "mode": "ranged",
            "range": "36\"",
            "a": "D6",
            "skill": "3+",
            "s": "12",
            "ap": "-3",
            "d": "3",
            "abilities": "BLAST, LETHAL HITS",
            "sourceSelectionIds": [
              "unit-defiler-selection-ectoplasma-destructor"
            ]
          },
          {
            "id": "defiler-weapon-excruciator-cannon",
            "title": "Excruciator cannon",
            "mode": "ranged",
            "range": "36\"",
            "a": "6",
            "skill": "3+",
            "s": "6",
            "ap": "-1",
            "d": "2",
            "abilities": "LETHAL HITS",
            "sourceSelectionIds": [
              "unit-defiler-selection-excruciator-cannon"
            ]
          },
          {
            "id": "defiler-weapon-hades-battle-cannon",
            "title": "Hades battle cannon",
            "mode": "ranged",
            "range": "48\"",
            "a": "D6+3",
            "skill": "3+",
            "s": "10",
            "ap": "-1",
            "d": "3",
            "abilities": "BLAST, LETHAL HITS",
            "sourceSelectionIds": [
              "unit-defiler-selection-hades-battle-cannon"
            ]
          },
          {
            "id": "defiler-weapon-hades-lascannon",
            "title": "Hades lascannon",
            "mode": "ranged",
            "range": "48\"",
            "a": "2",
            "skill": "3+",
            "s": "12",
            "ap": "-3",
            "d": "D6+1",
            "abilities": "LETHAL HITS",
            "sourceSelectionIds": [
              "unit-defiler-selection-hades-lascannon"
            ]
          },
          {
            "id": "defiler-weapon-heavy-baleflamer",
            "title": "Heavy baleflamer",
            "mode": "ranged",
            "range": "12\"",
            "a": "D6+3",
            "skill": "N/A",
            "s": "7",
            "ap": "-2",
            "d": "2",
            "abilities": "IGNORES COVER, TORRENT",
            "sourceSelectionIds": [
              "unit-defiler-selection-heavy-baleflamer"
            ]
          },
          {
            "id": "defiler-weapon-heavy-missile-launcher-krak",
            "title": "Heavy missile launcher - krak",
            "mode": "ranged",
            "range": "48\"",
            "a": "2",
            "skill": "3+",
            "s": "10",
            "ap": "-2",
            "d": "D6+1",
            "abilities": "LETHAL HITS",
            "sourceSelectionIds": [
              "unit-defiler-selection-heavy-missile-launcher-krak",
              "unit-defiler-weapon-family-heavy-missile-launcher-selection"
            ]
          },
          {
            "id": "defiler-weapon-heavy-missile-launcher-frag",
            "title": "Heavy missile launcher - frag",
            "mode": "ranged",
            "range": "48\"",
            "a": "2D6",
            "skill": "3+",
            "s": "5",
            "ap": "-1",
            "d": "1",
            "abilities": "BLAST, LETHAL HITS",
            "sourceSelectionIds": [
              "unit-defiler-selection-heavy-missile-launcher-frag",
              "unit-defiler-weapon-family-heavy-missile-launcher-selection"
            ]
          },
          {
            "id": "defiler-weapon-heavy-reaper-autocannon",
            "title": "Heavy reaper autocannon",
            "mode": "ranged",
            "range": "48\"",
            "a": "4",
            "skill": "3+",
            "s": "9",
            "ap": "-1",
            "d": "3",
            "abilities": "DEVASTATING WOUNDS, LETHAL HITS, SUSTAINED HITS 1",
            "sourceSelectionIds": [
              "unit-defiler-selection-heavy-reaper-autocannon"
            ]
          },
          {
            "id": "defiler-weapon-magma-cutters",
            "title": "Magma cutters",
            "mode": "ranged",
            "range": "12\"",
            "a": "2",
            "skill": "3+",
            "s": "9",
            "ap": "-4",
            "d": "D6",
            "abilities": "LETHAL HITS, MELTA 2",
            "sourceSelectionIds": [
              "unit-defiler-selection-magma-cutters"
            ]
          },
          {
            "id": "defiler-weapon-electroscourge",
            "title": "Electroscourge",
            "mode": "melee",
            "range": "Melee",
            "a": "5",
            "skill": "3+",
            "s": "12",
            "ap": "-2",
            "d": "2",
            "abilities": "EXTRA ATTACKS, SUSTAINED HITS 2",
            "sourceSelectionIds": [
              "unit-defiler-selection-electroscourge"
            ]
          },
          {
            "id": "defiler-weapon-shearing-claws-strike",
            "title": "Shearing claws - strike",
            "mode": "melee",
            "range": "Melee",
            "a": "5",
            "skill": "3+",
            "s": "16",
            "ap": "-3",
            "d": "D6+1",
            "abilities": "LETHAL HITS",
            "sourceSelectionIds": [
              "unit-defiler-selection-shearing-claws-strike",
              "unit-defiler-weapon-family-shearing-claws-selection"
            ]
          },
          {
            "id": "defiler-weapon-shearing-claws-sweep",
            "title": "Shearing claws - sweep",
            "mode": "melee",
            "range": "Melee",
            "a": "10",
            "skill": "3+",
            "s": "6",
            "ap": "-2",
            "d": "1",
            "abilities": "LETHAL HITS",
            "sourceSelectionIds": [
              "unit-defiler-selection-shearing-claws-sweep",
              "unit-defiler-weapon-family-shearing-claws-selection"
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
                  "electroscourge"
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
                  "electroscourge"
                ]
              }
            ]
          }
        ],
        "wargearSharedCaps": [
          {
            "id": "electroscourge",
            "max": 1
          }
        ]
      }
    },
    {
      "id": "unit-foetid-bloat-drone",
      "title": "Foetid Bloat-drone",
      "sourceBookId": "death-guard",
      "sourceLayer": "current",
      "intrinsicKeywords": [
        "VEHICLE",
        "FLY",
        "CHAOS",
        "NURGLE",
        "DAEMON",
        "FOETID BLOAT-DRONE",
        "DEATH GUARD"
      ],
      "relations": {
        "canLead": [],
        "canSupport": [],
        "canBeLedBy": [],
        "canBeSupportedBy": []
      },
      "ruleFacts": {
        "id": "unit-foetid-bloat-drone",
        "unitId": "unit-foetid-bloat-drone",
        "slug": "foetid-bloat-drone",
        "keywords": [
          "VEHICLE",
          "FLY",
          "CHAOS",
          "NURGLE",
          "DAEMON",
          "FOETID BLOAT-DRONE",
          "DEATH GUARD"
        ],
        "intrinsicKeywords": [
          "VEHICLE",
          "FLY",
          "CHAOS",
          "NURGLE",
          "DAEMON",
          "FOETID BLOAT-DRONE",
          "DEATH GUARD"
        ],
        "abilities": [
          "DEADLY DEMISE",
          "Nurgle’s Gift (Aura)",
          "Hovering Death"
        ],
        "termIds": [
          "keyword-vehicle",
          "keyword-fly",
          "keyword-chaos",
          "keyword-nurgle",
          "keyword-daemon",
          "keyword-foetid-bloat-drone",
          "keyword-death-guard",
          "ability-hovering-death-805d057",
          "weapon-plaguespitter-e03b003",
          "weapon-fleshmower-0333b70",
          "weapon-plague-probe-994d32e"
        ],
        "epic": false,
        "deadlyDemise": true,
        "attached": false,
        "attachmentKnown": true,
        "characterCount": 0,
        "twoCharacters": null,
        "warlord": null,
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
          "Sv": "3+",
          "W": "10",
          "Ld": "6+",
          "OC": "3",
          "Inv": "5+"
        },
        "abilities": [
          {
            "id": "foetid-bloat-drone-ability-core",
            "sectionId": "foetid-bloat-drone-ability-core",
            "title": "CORE",
            "text": "Deadly Demise D3",
            "sourceUnitId": "unit-foetid-bloat-drone"
          },
          {
            "id": "foetid-bloat-drone-ability-faction",
            "sectionId": "foetid-bloat-drone-ability-faction",
            "title": "FACTION",
            "text": "Nurgle’s Gift (Aura)",
            "sourceUnitId": "unit-foetid-bloat-drone"
          },
          {
            "id": "foetid-bloat-drone-ability-hovering-death",
            "sectionId": "foetid-bloat-drone-ability-hovering-death",
            "title": "Hovering Death",
            "text": "This model is eligible to shoot and declare a charge in a turn in which it Fell Back.",
            "sourceUnitId": "unit-foetid-bloat-drone"
          }
        ],
        "models": [
          {
            "id": "unit-foetid-bloat-drone-model-78a1e84ebc",
            "title": "Foetid Bloat-drone",
            "aliases": [
              "Foetid Bloat-drone"
            ],
            "min": 1,
            "max": 1,
            "legacyIds": [
              "unit-foetid-bloat-drone-model-foetid-bloat-drone"
            ]
          }
        ],
        "compositionRules": [],
        "selections": [
          {
            "id": "unit-foetid-bloat-drone-selection-plaguespitter",
            "title": "Plaguespitter",
            "aliases": [
              "Plaguespitter"
            ],
            "kind": "weapon",
            "profileIds": [
              "foetid-bloat-drone-weapon-plaguespitter"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-foetid-bloat-drone-selection-fleshmower",
            "title": "Fleshmower",
            "aliases": [
              "Fleshmower"
            ],
            "kind": "weapon",
            "profileIds": [
              "foetid-bloat-drone-weapon-fleshmower"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-foetid-bloat-drone-selection-plague-probe",
            "title": "Plague probe",
            "aliases": [
              "Plague probe"
            ],
            "kind": "weapon",
            "profileIds": [
              "foetid-bloat-drone-weapon-plague-probe"
            ],
            "wargearAbilityIds": []
          }
        ],
        "weaponFamilies": [],
        "weaponProfiles": [
          {
            "id": "foetid-bloat-drone-weapon-plaguespitter",
            "title": "Plaguespitter",
            "mode": "ranged",
            "range": "12\"",
            "a": "D6",
            "skill": "N/A",
            "s": "6",
            "ap": "-1",
            "d": "1",
            "abilities": "ANTI-INFANTRY 2+, IGNORES COVER, TORRENT",
            "sourceSelectionIds": [
              "unit-foetid-bloat-drone-selection-plaguespitter"
            ]
          },
          {
            "id": "foetid-bloat-drone-weapon-fleshmower",
            "title": "Fleshmower",
            "mode": "melee",
            "range": "Melee",
            "a": "10",
            "skill": "3+",
            "s": "7",
            "ap": "-1",
            "d": "2",
            "abilities": "LETHAL HITS",
            "sourceSelectionIds": [
              "unit-foetid-bloat-drone-selection-fleshmower"
            ]
          },
          {
            "id": "foetid-bloat-drone-weapon-plague-probe",
            "title": "Plague probe",
            "mode": "melee",
            "range": "Melee",
            "a": "3",
            "skill": "3+",
            "s": "6",
            "ap": "-1",
            "d": "1",
            "abilities": "LETHAL HITS",
            "sourceSelectionIds": [
              "unit-foetid-bloat-drone-selection-plague-probe"
            ]
          }
        ],
        "wargearAbilities": [],
        "wargearDefaults": [
          {
            "modelId": "unit-foetid-bloat-drone-model-78a1e84ebc",
            "selections": [
              {
                "selectionId": "unit-foetid-bloat-drone-selection-fleshmower",
                "quantity": 1
              },
              {
                "selectionId": "unit-foetid-bloat-drone-selection-plague-probe",
                "quantity": 1
              }
            ]
          }
        ],
        "wargearOptionContracts": [
          {
            "sourceId": "datasheet-foetid-bloat-drone:wargear:1",
            "eligibleModelIds": [
              "unit-foetid-bloat-drone-model-78a1e84ebc"
            ],
            "limit": {
              "perModel": 1,
              "perUnit": 1
            },
            "choices": [
              {
                "remove": [
                  {
                    "selectionId": "unit-foetid-bloat-drone-selection-fleshmower",
                    "quantity": 1
                  }
                ],
                "add": [
                  {
                    "selectionId": "unit-foetid-bloat-drone-selection-plaguespitter",
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
      "id": "unit-foetid-bloat-drone-with-heavy-blight-launcher",
      "title": "Foetid Bloat-drone with Heavy Blight Launcher",
      "sourceBookId": "death-guard",
      "sourceLayer": "current",
      "intrinsicKeywords": [
        "VEHICLE",
        "FLY",
        "CHAOS",
        "NURGLE",
        "DAEMON",
        "FOETID BLOAT-DRONE WITH HEAVY BLIGHT LAUNCHER",
        "DEATH GUARD"
      ],
      "relations": {
        "canLead": [],
        "canSupport": [],
        "canBeLedBy": [],
        "canBeSupportedBy": []
      },
      "ruleFacts": {
        "id": "unit-foetid-bloat-drone-with-heavy-blight-launcher",
        "unitId": "unit-foetid-bloat-drone-with-heavy-blight-launcher",
        "slug": "foetid-bloat-drone-with-heavy-blight-launcher",
        "keywords": [
          "VEHICLE",
          "FLY",
          "CHAOS",
          "NURGLE",
          "DAEMON",
          "FOETID BLOAT-DRONE WITH HEAVY BLIGHT LAUNCHER",
          "DEATH GUARD"
        ],
        "intrinsicKeywords": [
          "VEHICLE",
          "FLY",
          "CHAOS",
          "NURGLE",
          "DAEMON",
          "FOETID BLOAT-DRONE WITH HEAVY BLIGHT LAUNCHER",
          "DEATH GUARD"
        ],
        "abilities": [
          "DEADLY DEMISE",
          "Nurgle’s Gift (Aura)",
          "Explosive Blight"
        ],
        "termIds": [
          "keyword-vehicle",
          "keyword-fly",
          "keyword-chaos",
          "keyword-nurgle",
          "keyword-daemon",
          "keyword-foetid-bloat-drone-with-heavy-blight-launcher",
          "keyword-death-guard",
          "ability-explosive-blight-4fe2f2d",
          "weapon-heavy-blight-launcher-989ddb7",
          "weapon-plague-probe-994d32e"
        ],
        "epic": false,
        "deadlyDemise": true,
        "attached": false,
        "attachmentKnown": true,
        "characterCount": 0,
        "twoCharacters": null,
        "warlord": null,
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
          "Sv": "3+",
          "W": "10",
          "Ld": "6+",
          "OC": "3",
          "Inv": "5+"
        },
        "abilities": [
          {
            "id": "foetid-bloat-drone-with-heavy-blight-launcher-ability-core",
            "sectionId": "foetid-bloat-drone-with-heavy-blight-launcher-ability-core",
            "title": "CORE",
            "text": "Deadly Demise D3",
            "sourceUnitId": "unit-foetid-bloat-drone-with-heavy-blight-launcher"
          },
          {
            "id": "foetid-bloat-drone-with-heavy-blight-launcher-ability-faction",
            "sectionId": "foetid-bloat-drone-with-heavy-blight-launcher-ability-faction",
            "title": "FACTION",
            "text": "Nurgle’s Gift (Aura)",
            "sourceUnitId": "unit-foetid-bloat-drone-with-heavy-blight-launcher"
          },
          {
            "id": "foetid-bloat-drone-with-heavy-blight-launcher-ability-explosive-blight",
            "sectionId": "foetid-bloat-drone-with-heavy-blight-launcher-ability-explosive-blight",
            "title": "Explosive Blight",
            "text": "In your Shooting phase, each time this model makes an attack that destroys an enemy unit, before removing the last model in that unit from play, roll a D6, adding 1 to the result if that unit is Afflicted: on a 5+, each enemy unit within 6\" of that model is Afflicted until the start of your next turn.",
            "sourceUnitId": "unit-foetid-bloat-drone-with-heavy-blight-launcher"
          }
        ],
        "models": [
          {
            "id": "unit-foetid-bloat-drone-with-heavy-blight-launcher-model-78a1e84ebc",
            "title": "Foetid Bloat-drone",
            "aliases": [
              "Foetid Bloat-drone"
            ],
            "min": 1,
            "max": 1,
            "legacyIds": [
              "unit-foetid-bloat-drone-with-heavy-blight-launcher-model-foetid-bloat-drone"
            ]
          }
        ],
        "compositionRules": [],
        "selections": [
          {
            "id": "unit-foetid-bloat-drone-with-heavy-blight-launcher-selection-heavy-blight-launcher",
            "title": "Heavy blight launcher",
            "aliases": [
              "Heavy blight launcher"
            ],
            "kind": "weapon",
            "profileIds": [
              "foetid-bloat-drone-with-heavy-blight-launcher-weapon-heavy-blight-launcher"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-foetid-bloat-drone-with-heavy-blight-launcher-selection-plague-probe",
            "title": "Plague probe",
            "aliases": [
              "Plague probe"
            ],
            "kind": "weapon",
            "profileIds": [
              "foetid-bloat-drone-with-heavy-blight-launcher-weapon-plague-probe"
            ],
            "wargearAbilityIds": []
          }
        ],
        "weaponFamilies": [],
        "weaponProfiles": [
          {
            "id": "foetid-bloat-drone-with-heavy-blight-launcher-weapon-heavy-blight-launcher",
            "title": "Heavy blight launcher",
            "mode": "ranged",
            "range": "36\"",
            "a": "D6+2",
            "skill": "3+",
            "s": "10",
            "ap": "-2",
            "d": "3",
            "abilities": "BLAST, LETHAL HITS",
            "sourceSelectionIds": [
              "unit-foetid-bloat-drone-with-heavy-blight-launcher-selection-heavy-blight-launcher"
            ]
          },
          {
            "id": "foetid-bloat-drone-with-heavy-blight-launcher-weapon-plague-probe",
            "title": "Plague probe",
            "mode": "melee",
            "range": "Melee",
            "a": "3",
            "skill": "3+",
            "s": "6",
            "ap": "-1",
            "d": "1",
            "abilities": "LETHAL HITS",
            "sourceSelectionIds": [
              "unit-foetid-bloat-drone-with-heavy-blight-launcher-selection-plague-probe"
            ]
          }
        ],
        "wargearAbilities": []
      }
    },
    {
      "id": "unit-helbrute",
      "title": "Helbrute",
      "sourceBookId": "death-guard",
      "sourceLayer": "current",
      "intrinsicKeywords": [
        "VEHICLE",
        "WALKER",
        "CHAOS",
        "NURGLE",
        "HELBRUTE",
        "DEATH GUARD"
      ],
      "relations": {
        "canLead": [],
        "canSupport": [],
        "canBeLedBy": [],
        "canBeSupportedBy": []
      },
      "ruleFacts": {
        "id": "unit-helbrute",
        "unitId": "unit-helbrute",
        "slug": "helbrute",
        "keywords": [
          "VEHICLE",
          "WALKER",
          "CHAOS",
          "NURGLE",
          "HELBRUTE",
          "DEATH GUARD"
        ],
        "intrinsicKeywords": [
          "VEHICLE",
          "WALKER",
          "CHAOS",
          "NURGLE",
          "HELBRUTE",
          "DEATH GUARD"
        ],
        "abilities": [
          "DEADLY DEMISE",
          "Nurgle’s Gift (Aura)",
          "Diseased Malice",
          "Froth-spattered Frenzy"
        ],
        "termIds": [
          "keyword-vehicle",
          "keyword-walker",
          "keyword-chaos",
          "keyword-nurgle",
          "keyword-helbrute",
          "keyword-death-guard",
          "ability-diseased-malice-caa33aa",
          "ability-froth-spattered-frenzy-9a139e5",
          "weapon-combi-bolter-5d7d99e",
          "weapon-heavy-flamer-8e6845a",
          "weapon-missile-launcher-frag-929c5f9",
          "weapon-missile-launcher-krak-3cfbee3",
          "weapon-multi-melta-6f250da",
          "weapon-plasma-cannon-c68bff5",
          "weapon-twin-autocannon-76385f7",
          "weapon-twin-heavy-bolter-b1e2633",
          "weapon-twin-lascannon-8f8b5f4",
          "weapon-close-combat-weapon-f69dc30",
          "weapon-helbrute-fist-02e7ba7",
          "weapon-helbrute-hammer-97d2de3",
          "weapon-power-scourge-92cea25"
        ],
        "epic": false,
        "deadlyDemise": true,
        "attached": false,
        "attachmentKnown": true,
        "characterCount": 0,
        "twoCharacters": null,
        "warlord": null,
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
          "T": "9",
          "Sv": "2+",
          "W": "8",
          "Ld": "6+",
          "OC": "3"
        },
        "abilities": [
          {
            "id": "helbrute-ability-core",
            "sectionId": "helbrute-ability-core",
            "title": "CORE",
            "text": "Deadly Demise 1",
            "sourceUnitId": "unit-helbrute"
          },
          {
            "id": "helbrute-ability-faction",
            "sectionId": "helbrute-ability-faction",
            "title": "FACTION",
            "text": "Nurgle’s Gift (Aura)",
            "sourceUnitId": "unit-helbrute"
          },
          {
            "id": "helbrute-ability-diseased-malice",
            "sectionId": "helbrute-ability-diseased-malice",
            "title": "Diseased Malice",
            "text": "Each time this model makes an attack that targets an Afflicted unit, add 1 to the Wound roll.",
            "sourceUnitId": "unit-helbrute"
          },
          {
            "id": "helbrute-ability-froth-spattered-frenzy",
            "sectionId": "helbrute-ability-froth-spattered-frenzy",
            "title": "Froth-spattered Frenzy",
            "text": "If this model is equipped with two melee weapons in addition to its close combat weapon, add 2 to the Attacks characteristic of those two weapons.",
            "sourceUnitId": "unit-helbrute"
          }
        ],
        "models": [
          {
            "id": "unit-helbrute-model-34b32f3d20",
            "title": "Helbrute",
            "aliases": [
              "Helbrute"
            ],
            "min": 1,
            "max": 1,
            "legacyIds": [
              "unit-helbrute-model-helbrute"
            ]
          }
        ],
        "compositionRules": [],
        "selections": [
          {
            "id": "unit-helbrute-selection-combi-bolter",
            "title": "Combi-bolter",
            "aliases": [
              "Combi-bolter"
            ],
            "kind": "weapon",
            "profileIds": [
              "helbrute-weapon-combi-bolter"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-helbrute-selection-heavy-flamer",
            "title": "Heavy flamer",
            "aliases": [
              "Heavy flamer"
            ],
            "kind": "weapon",
            "profileIds": [
              "helbrute-weapon-heavy-flamer"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-helbrute-selection-missile-launcher-frag",
            "title": "Missile launcher – frag",
            "aliases": [
              "Missile launcher – frag"
            ],
            "kind": "weapon",
            "profileIds": [
              "helbrute-weapon-missile-launcher-frag"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-helbrute-selection-missile-launcher-krak",
            "title": "Missile launcher – krak",
            "aliases": [
              "Missile launcher – krak"
            ],
            "kind": "weapon",
            "profileIds": [
              "helbrute-weapon-missile-launcher-krak"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-helbrute-selection-multi-melta",
            "title": "Multi-melta",
            "aliases": [
              "Multi-melta"
            ],
            "kind": "weapon",
            "profileIds": [
              "helbrute-weapon-multi-melta"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-helbrute-selection-plasma-cannon",
            "title": "Plasma cannon",
            "aliases": [
              "Plasma cannon"
            ],
            "kind": "weapon",
            "profileIds": [
              "helbrute-weapon-plasma-cannon"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-helbrute-selection-twin-autocannon",
            "title": "Twin autocannon",
            "aliases": [
              "Twin autocannon"
            ],
            "kind": "weapon",
            "profileIds": [
              "helbrute-weapon-twin-autocannon"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-helbrute-selection-twin-heavy-bolter",
            "title": "Twin heavy bolter",
            "aliases": [
              "Twin heavy bolter"
            ],
            "kind": "weapon",
            "profileIds": [
              "helbrute-weapon-twin-heavy-bolter"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-helbrute-selection-twin-lascannon",
            "title": "Twin lascannon",
            "aliases": [
              "Twin lascannon"
            ],
            "kind": "weapon",
            "profileIds": [
              "helbrute-weapon-twin-lascannon"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-helbrute-selection-close-combat-weapon",
            "title": "Close combat weapon",
            "aliases": [
              "Close combat weapon"
            ],
            "kind": "weapon",
            "profileIds": [
              "helbrute-weapon-close-combat-weapon"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-helbrute-selection-helbrute-fist",
            "title": "Helbrute fist",
            "aliases": [
              "Helbrute fist"
            ],
            "kind": "weapon",
            "profileIds": [
              "helbrute-weapon-helbrute-fist"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-helbrute-selection-helbrute-hammer",
            "title": "Helbrute hammer",
            "aliases": [
              "Helbrute hammer"
            ],
            "kind": "weapon",
            "profileIds": [
              "helbrute-weapon-helbrute-hammer"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-helbrute-selection-power-scourge",
            "title": "Power scourge",
            "aliases": [
              "Power scourge"
            ],
            "kind": "weapon",
            "profileIds": [
              "helbrute-weapon-power-scourge"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-helbrute-weapon-family-missile-launcher-selection",
            "title": "Missile launcher",
            "aliases": [
              "Missile launcher"
            ],
            "kind": "weapon",
            "familyId": "unit-helbrute-weapon-family-missile-launcher",
            "profileIds": [
              "helbrute-weapon-missile-launcher-frag",
              "helbrute-weapon-missile-launcher-krak"
            ],
            "wargearAbilityIds": []
          }
        ],
        "weaponFamilies": [
          {
            "id": "unit-helbrute-weapon-family-missile-launcher",
            "title": "Missile launcher",
            "aliases": [
              "Missile launcher"
            ],
            "profileIds": [
              "helbrute-weapon-missile-launcher-frag",
              "helbrute-weapon-missile-launcher-krak"
            ],
            "ambiguousAlias": false
          }
        ],
        "weaponProfiles": [
          {
            "id": "helbrute-weapon-combi-bolter",
            "title": "Combi-bolter",
            "mode": "ranged",
            "range": "24\"",
            "a": "2",
            "skill": "3+",
            "s": "4",
            "ap": "0",
            "d": "1",
            "abilities": "LETHAL HITS, RAPID FIRE 2",
            "sourceSelectionIds": [
              "unit-helbrute-selection-combi-bolter"
            ]
          },
          {
            "id": "helbrute-weapon-heavy-flamer",
            "title": "Heavy flamer",
            "mode": "ranged",
            "range": "12\"",
            "a": "D6",
            "skill": "N/A",
            "s": "5",
            "ap": "-1",
            "d": "1",
            "abilities": "IGNORES COVER, TORRENT",
            "sourceSelectionIds": [
              "unit-helbrute-selection-heavy-flamer"
            ]
          },
          {
            "id": "helbrute-weapon-missile-launcher-frag",
            "title": "Missile launcher – frag",
            "mode": "ranged",
            "range": "48\"",
            "a": "D6",
            "skill": "3+",
            "s": "4",
            "ap": "0",
            "d": "1",
            "abilities": "BLAST",
            "sourceSelectionIds": [
              "unit-helbrute-selection-missile-launcher-frag",
              "unit-helbrute-weapon-family-missile-launcher-selection"
            ]
          },
          {
            "id": "helbrute-weapon-missile-launcher-krak",
            "title": "Missile launcher – krak",
            "mode": "ranged",
            "range": "48\"",
            "a": "1",
            "skill": "3+",
            "s": "9",
            "ap": "-2",
            "d": "D6",
            "abilities": "-",
            "sourceSelectionIds": [
              "unit-helbrute-selection-missile-launcher-krak",
              "unit-helbrute-weapon-family-missile-launcher-selection"
            ]
          },
          {
            "id": "helbrute-weapon-multi-melta",
            "title": "Multi-melta",
            "mode": "ranged",
            "range": "18\"",
            "a": "2",
            "skill": "3+",
            "s": "9",
            "ap": "-4",
            "d": "D6",
            "abilities": "MELTA 2, LETHAL HITS",
            "sourceSelectionIds": [
              "unit-helbrute-selection-multi-melta"
            ]
          },
          {
            "id": "helbrute-weapon-plasma-cannon",
            "title": "Plasma cannon",
            "mode": "ranged",
            "range": "36\"",
            "a": "D3",
            "skill": "3+",
            "s": "8",
            "ap": "-3",
            "d": "3",
            "abilities": "BLAST, HAZARDOUS, LETHAL HITS",
            "sourceSelectionIds": [
              "unit-helbrute-selection-plasma-cannon"
            ]
          },
          {
            "id": "helbrute-weapon-twin-autocannon",
            "title": "Twin autocannon",
            "mode": "ranged",
            "range": "48\"",
            "a": "2",
            "skill": "3+",
            "s": "10",
            "ap": "-1",
            "d": "3",
            "abilities": "TWIN-LINKED, LETHAL HITS",
            "sourceSelectionIds": [
              "unit-helbrute-selection-twin-autocannon"
            ]
          },
          {
            "id": "helbrute-weapon-twin-heavy-bolter",
            "title": "Twin heavy bolter",
            "mode": "ranged",
            "range": "36\"",
            "a": "3",
            "skill": "3+",
            "s": "5",
            "ap": "-1",
            "d": "2",
            "abilities": "LETHAL HITS, SUSTAINED HITS 1, TWIN-LINKED",
            "sourceSelectionIds": [
              "unit-helbrute-selection-twin-heavy-bolter"
            ]
          },
          {
            "id": "helbrute-weapon-twin-lascannon",
            "title": "Twin lascannon",
            "mode": "ranged",
            "range": "48\"",
            "a": "1",
            "skill": "3+",
            "s": "12",
            "ap": "-3",
            "d": "D6+1",
            "abilities": "TWIN-LINKED",
            "sourceSelectionIds": [
              "unit-helbrute-selection-twin-lascannon"
            ]
          },
          {
            "id": "helbrute-weapon-close-combat-weapon",
            "title": "Close combat weapon",
            "mode": "melee",
            "range": "Melee",
            "a": "5",
            "skill": "3+",
            "s": "6",
            "ap": "0",
            "d": "1",
            "abilities": "-",
            "sourceSelectionIds": [
              "unit-helbrute-selection-close-combat-weapon"
            ]
          },
          {
            "id": "helbrute-weapon-helbrute-fist",
            "title": "Helbrute fist",
            "mode": "melee",
            "range": "Melee",
            "a": "5",
            "skill": "3+",
            "s": "12",
            "ap": "-2",
            "d": "3",
            "abilities": "-",
            "sourceSelectionIds": [
              "unit-helbrute-selection-helbrute-fist"
            ]
          },
          {
            "id": "helbrute-weapon-helbrute-hammer",
            "title": "Helbrute hammer",
            "mode": "melee",
            "range": "Melee",
            "a": "4",
            "skill": "3+",
            "s": "14",
            "ap": "-3",
            "d": "D6+1",
            "abilities": "-",
            "sourceSelectionIds": [
              "unit-helbrute-selection-helbrute-hammer"
            ]
          },
          {
            "id": "helbrute-weapon-power-scourge",
            "title": "Power scourge",
            "mode": "melee",
            "range": "Melee",
            "a": "8",
            "skill": "3+",
            "s": "7",
            "ap": "-1",
            "d": "2",
            "abilities": "-",
            "sourceSelectionIds": [
              "unit-helbrute-selection-power-scourge"
            ]
          }
        ],
        "wargearAbilities": [],
        "wargearDefaults": [
          {
            "modelId": "unit-helbrute-model-34b32f3d20",
            "selections": [
              {
                "selectionId": "unit-helbrute-selection-multi-melta",
                "quantity": 1
              },
              {
                "selectionId": "unit-helbrute-selection-helbrute-fist",
                "quantity": 1
              },
              {
                "selectionId": "unit-helbrute-selection-close-combat-weapon",
                "quantity": 1
              }
            ]
          }
        ],
        "wargearOptionContracts": [
          {
            "sourceId": "datasheet-helbrute:wargear:1",
            "eligibleModelIds": [
              "unit-helbrute-model-34b32f3d20"
            ],
            "limit": {
              "perModel": 1,
              "perUnit": 1
            },
            "choices": [
              {
                "remove": [
                  {
                    "selectionId": "unit-helbrute-selection-multi-melta",
                    "quantity": 1
                  }
                ],
                "add": [
                  {
                    "selectionId": "unit-helbrute-selection-plasma-cannon",
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
                    "selectionId": "unit-helbrute-selection-multi-melta",
                    "quantity": 1
                  }
                ],
                "add": [
                  {
                    "selectionId": "unit-helbrute-selection-twin-autocannon",
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
                    "selectionId": "unit-helbrute-selection-multi-melta",
                    "quantity": 1
                  }
                ],
                "add": [
                  {
                    "selectionId": "unit-helbrute-selection-twin-lascannon",
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
                    "selectionId": "unit-helbrute-selection-multi-melta",
                    "quantity": 1
                  }
                ],
                "add": [
                  {
                    "selectionId": "unit-helbrute-selection-twin-heavy-bolter",
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
                    "selectionId": "unit-helbrute-selection-multi-melta",
                    "quantity": 1
                  }
                ],
                "add": [
                  {
                    "selectionId": "unit-helbrute-selection-helbrute-fist",
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
            "sourceId": "datasheet-helbrute:wargear:2",
            "eligibleModelIds": [
              "unit-helbrute-model-34b32f3d20"
            ],
            "limit": {
              "perModel": 1,
              "perUnit": 1
            },
            "choices": [
              {
                "remove": [
                  {
                    "selectionId": "unit-helbrute-selection-helbrute-fist",
                    "quantity": 1
                  }
                ],
                "add": [
                  {
                    "selectionId": "unit-helbrute-weapon-family-missile-launcher-selection",
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
            "sourceId": "datasheet-helbrute:wargear:3",
            "eligibleModelIds": [
              "unit-helbrute-model-34b32f3d20"
            ],
            "limit": {
              "perModel": 1,
              "perUnit": 1
            },
            "choices": [
              {
                "remove": [
                  {
                    "selectionId": "unit-helbrute-selection-helbrute-fist",
                    "quantity": 1
                  }
                ],
                "add": [
                  {
                    "selectionId": "unit-helbrute-selection-helbrute-hammer",
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
                    "selectionId": "unit-helbrute-selection-helbrute-fist",
                    "quantity": 1
                  }
                ],
                "add": [
                  {
                    "selectionId": "unit-helbrute-selection-power-scourge",
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
            "sourceId": "datasheet-helbrute:wargear:4",
            "eligibleModelIds": [
              "unit-helbrute-model-34b32f3d20"
            ],
            "limit": {
              "capacitySelectionId": "unit-helbrute-selection-helbrute-fist"
            },
            "choices": [
              {
                "remove": [],
                "add": [
                  {
                    "selectionId": "unit-helbrute-selection-combi-bolter",
                    "quantity": 1
                  }
                ],
                "requiresFinal": [
                  "unit-helbrute-selection-helbrute-fist"
                ],
                "forbidsFinal": [],
                "sharedUses": []
              },
              {
                "remove": [],
                "add": [
                  {
                    "selectionId": "unit-helbrute-selection-heavy-flamer",
                    "quantity": 1
                  }
                ],
                "requiresFinal": [
                  "unit-helbrute-selection-helbrute-fist"
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
      "id": "unit-myphitic-blight-hauler",
      "title": "Myphitic Blight-hauler",
      "sourceBookId": "death-guard",
      "sourceLayer": "current",
      "intrinsicKeywords": [
        "VEHICLE",
        "SMOKE",
        "CHAOS",
        "NURGLE",
        "DAEMON",
        "MYPHITIC BLIGHT-HAULER",
        "DEATH GUARD"
      ],
      "relations": {
        "canLead": [],
        "canSupport": [],
        "canBeLedBy": [],
        "canBeSupportedBy": []
      },
      "ruleFacts": {
        "id": "unit-myphitic-blight-hauler",
        "unitId": "unit-myphitic-blight-hauler",
        "slug": "myphitic-blight-hauler",
        "keywords": [
          "VEHICLE",
          "SMOKE",
          "CHAOS",
          "NURGLE",
          "DAEMON",
          "MYPHITIC BLIGHT-HAULER",
          "DEATH GUARD"
        ],
        "intrinsicKeywords": [
          "VEHICLE",
          "SMOKE",
          "CHAOS",
          "NURGLE",
          "DAEMON",
          "MYPHITIC BLIGHT-HAULER",
          "DEATH GUARD"
        ],
        "abilities": [
          "DEADLY DEMISE",
          "Nurgle’s Gift (Aura)",
          "Tank Hunters"
        ],
        "termIds": [
          "keyword-vehicle",
          "keyword-smoke",
          "keyword-chaos",
          "keyword-nurgle",
          "keyword-daemon",
          "keyword-myphitic-blight-hauler",
          "keyword-death-guard",
          "ability-tank-hunters-8831aae",
          "weapon-bile-spurt-507565f",
          "weapon-missile-launcher-frag-929c5f9",
          "weapon-missile-launcher-krak-3cfbee3",
          "weapon-multi-melta-6f250da",
          "weapon-gnashing-maw-f34ed82"
        ],
        "epic": false,
        "deadlyDemise": true,
        "attached": false,
        "attachmentKnown": true,
        "characterCount": 0,
        "twoCharacters": null,
        "warlord": null,
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
          "Sv": "3+",
          "W": "10",
          "Ld": "6+",
          "OC": "3",
          "Inv": "5+"
        },
        "abilities": [
          {
            "id": "myphitic-blight-hauler-ability-core",
            "sectionId": "myphitic-blight-hauler-ability-core",
            "title": "CORE",
            "text": "Deadly Demise D3",
            "sourceUnitId": "unit-myphitic-blight-hauler"
          },
          {
            "id": "myphitic-blight-hauler-ability-faction",
            "sectionId": "myphitic-blight-hauler-ability-faction",
            "title": "FACTION",
            "text": "Nurgle’s Gift (Aura)",
            "sourceUnitId": "unit-myphitic-blight-hauler"
          },
          {
            "id": "myphitic-blight-hauler-ability-tank-hunters",
            "sectionId": "myphitic-blight-hauler-ability-tank-hunters",
            "title": "Tank Hunters",
            "text": "In your Shooting phase, each time a model in this unit makes an attack that targets a MONSTER or VEHICLE unit, add 1 to the Hit roll and add 1 to the Wound roll.",
            "sourceUnitId": "unit-myphitic-blight-hauler"
          }
        ],
        "models": [
          {
            "id": "unit-myphitic-blight-hauler-model-231cefd49f",
            "title": "Myphitic Blight-hauler",
            "aliases": [
              "Myphitic Blight-hauler",
              "Myphitic Blight-haulers"
            ],
            "min": 1,
            "max": 2,
            "legacyIds": [
              "unit-myphitic-blight-hauler-model-myphitic-blight-hauler"
            ]
          }
        ],
        "compositionRules": [],
        "selections": [
          {
            "id": "unit-myphitic-blight-hauler-selection-bile-spurt",
            "title": "Bile spurt",
            "aliases": [
              "Bile spurt"
            ],
            "kind": "weapon",
            "profileIds": [
              "myphitic-blight-hauler-weapon-bile-spurt"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-myphitic-blight-hauler-selection-missile-launcher-frag",
            "title": "Missile launcher – frag",
            "aliases": [
              "Missile launcher – frag"
            ],
            "kind": "weapon",
            "profileIds": [
              "myphitic-blight-hauler-weapon-missile-launcher-frag"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-myphitic-blight-hauler-selection-missile-launcher-krak",
            "title": "Missile launcher – krak",
            "aliases": [
              "Missile launcher – krak"
            ],
            "kind": "weapon",
            "profileIds": [
              "myphitic-blight-hauler-weapon-missile-launcher-krak"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-myphitic-blight-hauler-selection-multi-melta",
            "title": "Multi-melta",
            "aliases": [
              "Multi-melta"
            ],
            "kind": "weapon",
            "profileIds": [
              "myphitic-blight-hauler-weapon-multi-melta"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-myphitic-blight-hauler-selection-gnashing-maw",
            "title": "Gnashing maw",
            "aliases": [
              "Gnashing maw"
            ],
            "kind": "weapon",
            "profileIds": [
              "myphitic-blight-hauler-weapon-gnashing-maw"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-myphitic-blight-hauler-weapon-family-missile-launcher-selection",
            "title": "Missile launcher",
            "aliases": [
              "Missile launcher"
            ],
            "kind": "weapon",
            "familyId": "unit-myphitic-blight-hauler-weapon-family-missile-launcher",
            "profileIds": [
              "myphitic-blight-hauler-weapon-missile-launcher-frag",
              "myphitic-blight-hauler-weapon-missile-launcher-krak"
            ],
            "wargearAbilityIds": []
          }
        ],
        "weaponFamilies": [
          {
            "id": "unit-myphitic-blight-hauler-weapon-family-missile-launcher",
            "title": "Missile launcher",
            "aliases": [
              "Missile launcher"
            ],
            "profileIds": [
              "myphitic-blight-hauler-weapon-missile-launcher-frag",
              "myphitic-blight-hauler-weapon-missile-launcher-krak"
            ],
            "ambiguousAlias": false
          }
        ],
        "weaponProfiles": [
          {
            "id": "myphitic-blight-hauler-weapon-bile-spurt",
            "title": "Bile spurt",
            "mode": "ranged",
            "range": "12\"",
            "a": "3",
            "skill": "3+",
            "s": "5",
            "ap": "0",
            "d": "1",
            "abilities": "LETHAL HITS",
            "sourceSelectionIds": [
              "unit-myphitic-blight-hauler-selection-bile-spurt"
            ]
          },
          {
            "id": "myphitic-blight-hauler-weapon-missile-launcher-frag",
            "title": "Missile launcher – frag",
            "mode": "ranged",
            "range": "48\"",
            "a": "D6",
            "skill": "3+",
            "s": "4",
            "ap": "0",
            "d": "1",
            "abilities": "BLAST",
            "sourceSelectionIds": [
              "unit-myphitic-blight-hauler-selection-missile-launcher-frag",
              "unit-myphitic-blight-hauler-weapon-family-missile-launcher-selection"
            ]
          },
          {
            "id": "myphitic-blight-hauler-weapon-missile-launcher-krak",
            "title": "Missile launcher – krak",
            "mode": "ranged",
            "range": "48\"",
            "a": "1",
            "skill": "3+",
            "s": "9",
            "ap": "-2",
            "d": "D6",
            "abilities": "-",
            "sourceSelectionIds": [
              "unit-myphitic-blight-hauler-selection-missile-launcher-krak",
              "unit-myphitic-blight-hauler-weapon-family-missile-launcher-selection"
            ]
          },
          {
            "id": "myphitic-blight-hauler-weapon-multi-melta",
            "title": "Multi-melta",
            "mode": "ranged",
            "range": "18\"",
            "a": "2",
            "skill": "3+",
            "s": "9",
            "ap": "-4",
            "d": "D6",
            "abilities": "MELTA 2, LETHAL HITS",
            "sourceSelectionIds": [
              "unit-myphitic-blight-hauler-selection-multi-melta"
            ]
          },
          {
            "id": "myphitic-blight-hauler-weapon-gnashing-maw",
            "title": "Gnashing maw",
            "mode": "melee",
            "range": "Melee",
            "a": "4",
            "skill": "3+",
            "s": "6",
            "ap": "-1",
            "d": "1",
            "abilities": "LETHAL HITS",
            "sourceSelectionIds": [
              "unit-myphitic-blight-hauler-selection-gnashing-maw"
            ]
          }
        ],
        "wargearAbilities": []
      }
    },
    {
      "id": "unit-plagueburst-crawler",
      "title": "Plagueburst Crawler",
      "sourceBookId": "death-guard",
      "sourceLayer": "current",
      "intrinsicKeywords": [
        "VEHICLE",
        "CHAOS",
        "NURGLE",
        "DAEMON",
        "PLAGUEBURST CRAWLER",
        "FRAME",
        "DEATH GUARD"
      ],
      "relations": {
        "canLead": [],
        "canSupport": [],
        "canBeLedBy": [],
        "canBeSupportedBy": []
      },
      "ruleFacts": {
        "id": "unit-plagueburst-crawler",
        "unitId": "unit-plagueburst-crawler",
        "slug": "plagueburst-crawler",
        "keywords": [
          "VEHICLE",
          "CHAOS",
          "NURGLE",
          "DAEMON",
          "PLAGUEBURST CRAWLER",
          "FRAME",
          "DEATH GUARD"
        ],
        "intrinsicKeywords": [
          "VEHICLE",
          "CHAOS",
          "NURGLE",
          "DAEMON",
          "PLAGUEBURST CRAWLER",
          "FRAME",
          "DEATH GUARD"
        ],
        "abilities": [
          "DEADLY DEMISE",
          "Nurgle’s Gift (Aura)",
          "Spore-laced Shock Waves"
        ],
        "termIds": [
          "keyword-vehicle",
          "keyword-chaos",
          "keyword-nurgle",
          "keyword-daemon",
          "keyword-plagueburst-crawler",
          "keyword-frame",
          "keyword-death-guard",
          "ability-spore-laced-shock-waves-bc0251b",
          "weapon-entropy-cannon-2ed707e",
          "weapon-heavy-slugger-f2c1c85",
          "weapon-plagueburst-mortar-fef92be",
          "weapon-plaguespitter-e03b003",
          "weapon-rothail-volley-gun-e8d55b7",
          "weapon-armoured-tracks-a6a4ba9"
        ],
        "epic": false,
        "deadlyDemise": true,
        "attached": false,
        "attachmentKnown": true,
        "characterCount": 0,
        "twoCharacters": null,
        "warlord": null,
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
          "Ld": "6+",
          "OC": "3",
          "Inv": "5+"
        },
        "abilities": [
          {
            "id": "plagueburst-crawler-ability-core",
            "sectionId": "plagueburst-crawler-ability-core",
            "title": "CORE",
            "text": "Deadly Demise D3",
            "sourceUnitId": "unit-plagueburst-crawler"
          },
          {
            "id": "plagueburst-crawler-ability-faction",
            "sectionId": "plagueburst-crawler-ability-faction",
            "title": "FACTION",
            "text": "Nurgle’s Gift (Aura)",
            "sourceUnitId": "unit-plagueburst-crawler"
          },
          {
            "id": "plagueburst-crawler-ability-spore-laced-shock-waves",
            "sectionId": "plagueburst-crawler-ability-spore-laced-shock-waves",
            "title": "Spore-laced Shock Waves",
            "text": "In your Shooting phase, each time you select a target for this model’s Plagueburst mortar, roll one D6 for the target unit and every other enemy unit within 3\" of the target unit, adding 1 to that roll if the unit being rolled for is Afflicted. On a 6+, the unit being rolled for is struck by spores; after resolving all of this model’s attacks against the target unit, each unit struck by spores suffers D3 mortal wounds.",
            "sourceUnitId": "unit-plagueburst-crawler"
          }
        ],
        "models": [
          {
            "id": "unit-plagueburst-crawler-model-c8e49602ea",
            "title": "Plagueburst Crawler",
            "aliases": [
              "Plagueburst Crawler"
            ],
            "min": 1,
            "max": 1,
            "legacyIds": [
              "unit-plagueburst-crawler-model-plagueburst-crawler"
            ]
          }
        ],
        "compositionRules": [],
        "selections": [
          {
            "id": "unit-plagueburst-crawler-selection-entropy-cannon",
            "title": "Entropy cannon",
            "aliases": [
              "Entropy cannon"
            ],
            "kind": "weapon",
            "profileIds": [
              "plagueburst-crawler-weapon-entropy-cannon"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-plagueburst-crawler-selection-heavy-slugger",
            "title": "Heavy slugger",
            "aliases": [
              "Heavy slugger"
            ],
            "kind": "weapon",
            "profileIds": [
              "plagueburst-crawler-weapon-heavy-slugger"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-plagueburst-crawler-selection-plagueburst-mortar",
            "title": "Plagueburst mortar",
            "aliases": [
              "Plagueburst mortar"
            ],
            "kind": "weapon",
            "profileIds": [
              "plagueburst-crawler-weapon-plagueburst-mortar"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-plagueburst-crawler-selection-plaguespitter",
            "title": "Plaguespitter",
            "aliases": [
              "Plaguespitter"
            ],
            "kind": "weapon",
            "profileIds": [
              "plagueburst-crawler-weapon-plaguespitter"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-plagueburst-crawler-selection-rothail-volley-gun",
            "title": "Rothail volley gun",
            "aliases": [
              "Rothail volley gun"
            ],
            "kind": "weapon",
            "profileIds": [
              "plagueburst-crawler-weapon-rothail-volley-gun"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-plagueburst-crawler-selection-armoured-tracks",
            "title": "Armoured tracks",
            "aliases": [
              "Armoured tracks"
            ],
            "kind": "weapon",
            "profileIds": [
              "plagueburst-crawler-weapon-armoured-tracks"
            ],
            "wargearAbilityIds": []
          }
        ],
        "weaponFamilies": [],
        "weaponProfiles": [
          {
            "id": "plagueburst-crawler-weapon-entropy-cannon",
            "title": "Entropy cannon",
            "mode": "ranged",
            "range": "36\"",
            "a": "1",
            "skill": "3+",
            "s": "10",
            "ap": "-3",
            "d": "D6+1",
            "abilities": "LETHAL HITS",
            "sourceSelectionIds": [
              "unit-plagueburst-crawler-selection-entropy-cannon"
            ]
          },
          {
            "id": "plagueburst-crawler-weapon-heavy-slugger",
            "title": "Heavy slugger",
            "mode": "ranged",
            "range": "36\"",
            "a": "4",
            "skill": "3+",
            "s": "5",
            "ap": "-1",
            "d": "1",
            "abilities": "LETHAL HITS",
            "sourceSelectionIds": [
              "unit-plagueburst-crawler-selection-heavy-slugger"
            ]
          },
          {
            "id": "plagueburst-crawler-weapon-plagueburst-mortar",
            "title": "Plagueburst mortar",
            "mode": "ranged",
            "range": "48\"",
            "a": "D6+3",
            "skill": "3+",
            "s": "8",
            "ap": "-1",
            "d": "2",
            "abilities": "BLAST, INDIRECT FIRE, LETHAL HITS",
            "sourceSelectionIds": [
              "unit-plagueburst-crawler-selection-plagueburst-mortar"
            ]
          },
          {
            "id": "plagueburst-crawler-weapon-plaguespitter",
            "title": "Plaguespitter",
            "mode": "ranged",
            "range": "12\"",
            "a": "D6",
            "skill": "N/A",
            "s": "6",
            "ap": "-1",
            "d": "1",
            "abilities": "ANTI-INFANTRY 2+, IGNORES COVER, TORRENT",
            "sourceSelectionIds": [
              "unit-plagueburst-crawler-selection-plaguespitter"
            ]
          },
          {
            "id": "plagueburst-crawler-weapon-rothail-volley-gun",
            "title": "Rothail volley gun",
            "mode": "ranged",
            "range": "36\"",
            "a": "3",
            "skill": "3+",
            "s": "5",
            "ap": "0",
            "d": "1",
            "abilities": "LETHAL HITS, RAPID FIRE 3",
            "sourceSelectionIds": [
              "unit-plagueburst-crawler-selection-rothail-volley-gun"
            ]
          },
          {
            "id": "plagueburst-crawler-weapon-armoured-tracks",
            "title": "Armoured tracks",
            "mode": "melee",
            "range": "Melee",
            "a": "3",
            "skill": "4+",
            "s": "6",
            "ap": "0",
            "d": "1",
            "abilities": "-",
            "sourceSelectionIds": [
              "unit-plagueburst-crawler-selection-armoured-tracks"
            ]
          }
        ],
        "wargearAbilities": [],
        "wargearDefaults": [
          {
            "modelId": "unit-plagueburst-crawler-model-c8e49602ea",
            "selections": [
              {
                "selectionId": "unit-plagueburst-crawler-selection-entropy-cannon",
                "quantity": 2
              },
              {
                "selectionId": "unit-plagueburst-crawler-selection-heavy-slugger",
                "quantity": 1
              },
              {
                "selectionId": "unit-plagueburst-crawler-selection-plagueburst-mortar",
                "quantity": 1
              },
              {
                "selectionId": "unit-plagueburst-crawler-selection-armoured-tracks",
                "quantity": 1
              }
            ]
          }
        ],
        "wargearOptionContracts": [
          {
            "sourceId": "datasheet-plagueburst-crawler:wargear:1",
            "eligibleModelIds": [
              "unit-plagueburst-crawler-model-c8e49602ea"
            ],
            "limit": {
              "perModel": 1,
              "perUnit": 1
            },
            "choices": [
              {
                "remove": [
                  {
                    "selectionId": "unit-plagueburst-crawler-selection-entropy-cannon",
                    "quantity": 2
                  }
                ],
                "add": [
                  {
                    "selectionId": "unit-plagueburst-crawler-selection-plaguespitter",
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
            "sourceId": "datasheet-plagueburst-crawler:wargear:2",
            "eligibleModelIds": [
              "unit-plagueburst-crawler-model-c8e49602ea"
            ],
            "limit": {
              "perModel": 1,
              "perUnit": 1
            },
            "choices": [
              {
                "remove": [
                  {
                    "selectionId": "unit-plagueburst-crawler-selection-heavy-slugger",
                    "quantity": 1
                  }
                ],
                "add": [
                  {
                    "selectionId": "unit-plagueburst-crawler-selection-rothail-volley-gun",
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
      "id": "unit-chaos-rhino",
      "title": "Chaos Rhino",
      "sourceBookId": "death-guard",
      "sourceLayer": "current",
      "intrinsicKeywords": [
        "VEHICLE",
        "SMOKE",
        "CHAOS",
        "NURGLE",
        "TRANSPORT",
        "DEDICATED TRANSPORT",
        "RHINO",
        "FRAME",
        "DEATH GUARD"
      ],
      "relations": {
        "canLead": [],
        "canSupport": [],
        "canBeLedBy": [],
        "canBeSupportedBy": []
      },
      "ruleFacts": {
        "id": "unit-chaos-rhino",
        "unitId": "unit-chaos-rhino",
        "slug": "chaos-rhino",
        "keywords": [
          "VEHICLE",
          "SMOKE",
          "CHAOS",
          "NURGLE",
          "TRANSPORT",
          "DEDICATED TRANSPORT",
          "RHINO",
          "FRAME",
          "DEATH GUARD"
        ],
        "intrinsicKeywords": [
          "VEHICLE",
          "SMOKE",
          "CHAOS",
          "NURGLE",
          "TRANSPORT",
          "DEDICATED TRANSPORT",
          "RHINO",
          "FRAME",
          "DEATH GUARD"
        ],
        "abilities": [
          "DEADLY DEMISE",
          "Firing Deck 2",
          "Nurgle’s Gift (Aura)",
          "Fire Support"
        ],
        "termIds": [
          "keyword-vehicle",
          "keyword-smoke",
          "keyword-chaos",
          "keyword-nurgle",
          "keyword-transport",
          "keyword-dedicated-transport",
          "keyword-rhino",
          "keyword-frame",
          "keyword-death-guard",
          "ability-fire-support-b0918db",
          "weapon-combi-bolter-5d7d99e",
          "weapon-combi-weapon-b2eeb14",
          "weapon-havoc-launcher-cf26557",
          "weapon-armoured-tracks-a6a4ba9"
        ],
        "epic": false,
        "deadlyDemise": true,
        "attached": false,
        "attachmentKnown": true,
        "characterCount": 0,
        "twoCharacters": null,
        "warlord": null,
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
          "OC": "2"
        },
        "abilities": [
          {
            "id": "chaos-rhino-ability-core",
            "sectionId": "chaos-rhino-ability-core",
            "title": "CORE",
            "text": "Deadly Demise D3, Firing Deck 2",
            "sourceUnitId": "unit-chaos-rhino"
          },
          {
            "id": "chaos-rhino-ability-faction",
            "sectionId": "chaos-rhino-ability-faction",
            "title": "FACTION",
            "text": "Nurgle’s Gift (Aura)",
            "sourceUnitId": "unit-chaos-rhino"
          },
          {
            "id": "chaos-rhino-ability-fire-support",
            "sectionId": "chaos-rhino-ability-fire-support",
            "title": "Fire Support",
            "text": "In your Shooting phase, after this model has shot, select one enemy unit hit by one or more of those attacks. Until the end of the phase, each time a friendly model that disembarked from this TRANSPORT this turn makes an attack that targets that enemy unit, you can re-roll the Wound roll.",
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
            "id": "unit-chaos-rhino-selection-combi-bolter",
            "title": "Combi-bolter",
            "aliases": [
              "Combi-bolter"
            ],
            "kind": "weapon",
            "profileIds": [
              "chaos-rhino-weapon-combi-bolter"
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
              "chaos-rhino-weapon-combi-weapon"
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
              "chaos-rhino-weapon-havoc-launcher"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-chaos-rhino-selection-armoured-tracks",
            "title": "Armoured tracks",
            "aliases": [
              "Armoured tracks"
            ],
            "kind": "weapon",
            "profileIds": [
              "chaos-rhino-weapon-armoured-tracks"
            ],
            "wargearAbilityIds": []
          }
        ],
        "weaponFamilies": [],
        "weaponProfiles": [
          {
            "id": "chaos-rhino-weapon-combi-bolter",
            "title": "Combi-bolter",
            "mode": "ranged",
            "range": "24\"",
            "a": "2",
            "skill": "3+",
            "s": "4",
            "ap": "0",
            "d": "1",
            "abilities": "LETHAL HITS, RAPID FIRE 2",
            "sourceSelectionIds": [
              "unit-chaos-rhino-selection-combi-bolter"
            ]
          },
          {
            "id": "chaos-rhino-weapon-combi-weapon",
            "title": "Combi-weapon",
            "mode": "ranged",
            "range": "24\"",
            "a": "1",
            "skill": "4+",
            "s": "4",
            "ap": "0",
            "d": "1",
            "abilities": "ANTI-INFANTRY 4+, DEVASTATING WOUNDS, RAPID FIRE 1",
            "sourceSelectionIds": [
              "unit-chaos-rhino-selection-combi-weapon"
            ]
          },
          {
            "id": "chaos-rhino-weapon-havoc-launcher",
            "title": "Havoc launcher",
            "mode": "ranged",
            "range": "48\"",
            "a": "D6",
            "skill": "3+",
            "s": "5",
            "ap": "0",
            "d": "1",
            "abilities": "BLAST",
            "sourceSelectionIds": [
              "unit-chaos-rhino-selection-havoc-launcher"
            ]
          },
          {
            "id": "chaos-rhino-weapon-armoured-tracks",
            "title": "Armoured tracks",
            "mode": "melee",
            "range": "Melee",
            "a": "3",
            "skill": "4+",
            "s": "6",
            "ap": "0",
            "d": "1",
            "abilities": "-",
            "sourceSelectionIds": [
              "unit-chaos-rhino-selection-armoured-tracks"
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
      "id": "unit-miasmic-malignifier",
      "title": "Miasmic Malignifier",
      "sourceBookId": "death-guard",
      "sourceLayer": "current",
      "intrinsicKeywords": [
        "FORTIFICATION",
        "CHAOS",
        "NURGLE",
        "MIASMIC MALIGNIFIER",
        "FRAME",
        "DEATH GUARD"
      ],
      "relations": {
        "canLead": [],
        "canSupport": [],
        "canBeLedBy": [],
        "canBeSupportedBy": []
      },
      "ruleFacts": {
        "id": "unit-miasmic-malignifier",
        "unitId": "unit-miasmic-malignifier",
        "slug": "miasmic-malignifier",
        "keywords": [
          "FORTIFICATION",
          "CHAOS",
          "NURGLE",
          "MIASMIC MALIGNIFIER",
          "FRAME",
          "DEATH GUARD"
        ],
        "intrinsicKeywords": [
          "FORTIFICATION",
          "CHAOS",
          "NURGLE",
          "MIASMIC MALIGNIFIER",
          "FRAME",
          "DEATH GUARD"
        ],
        "abilities": [
          "DEADLY DEMISE",
          "Nurgle’s Gift (Aura)",
          "Putrescent Fog (Aura)",
          "Diseased Cover",
          "Fortification",
          "Deployment"
        ],
        "termIds": [
          "keyword-fortification",
          "keyword-chaos",
          "keyword-nurgle",
          "keyword-miasmic-malignifier",
          "keyword-frame",
          "keyword-death-guard",
          "ability-putrescent-fog-aura-afeaa21",
          "ability-diseased-cover-8d71e30",
          "ability-fortification-e581151",
          "weapon-miasmic-gouts-7cba9ce"
        ],
        "epic": false,
        "deadlyDemise": true,
        "attached": false,
        "attachmentKnown": true,
        "characterCount": 0,
        "twoCharacters": null,
        "warlord": null,
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
          "Ld": "6+",
          "OC": "0"
        },
        "abilities": [
          {
            "id": "miasmic-malignifier-ability-core",
            "sectionId": "miasmic-malignifier-ability-core",
            "title": "CORE",
            "text": "Deadly Demise D3",
            "sourceUnitId": "unit-miasmic-malignifier"
          },
          {
            "id": "miasmic-malignifier-ability-faction",
            "sectionId": "miasmic-malignifier-ability-faction",
            "title": "FACTION",
            "text": "Nurgle’s Gift (Aura)",
            "sourceUnitId": "unit-miasmic-malignifier"
          },
          {
            "id": "miasmic-malignifier-ability-putrescent-fog-aura",
            "sectionId": "miasmic-malignifier-ability-putrescent-fog-aura",
            "title": "Putrescent Fog (Aura)",
            "text": "Enemy units that are set up on the battlefield as Reinforcements cannot be set up within 12\" of this model.",
            "sourceUnitId": "unit-miasmic-malignifier"
          },
          {
            "id": "miasmic-malignifier-ability-diseased-cover",
            "sectionId": "miasmic-malignifier-ability-diseased-cover",
            "title": "Diseased Cover",
            "text": "Each time a ranged attack is allocated to a model, if that model is not fully visible to the attacking unit because of this Fortification, that model has the Benefit of Cover against that attack.",
            "sourceUnitId": "unit-miasmic-malignifier"
          },
          {
            "id": "miasmic-malignifier-ability-fortification",
            "sectionId": "miasmic-malignifier-ability-fortification",
            "title": "Fortification",
            "text": "While an enemy unit is only within Engagement Range of one or more FORTIFICATIONS from your army:\n• That unit can still be selected as the target of ranged attacks, but each time such an attack is made, unless it is made with a Pistol, subtract 1 from the Hit roll.\n• Models in that unit do not need to take Desperate Escape tests due to Falling Back while Battle-shocked, except for those that will move over enemy models when doing so.",
            "sourceUnitId": "unit-miasmic-malignifier"
          },
          {
            "id": "miasmic-malignifier-ability-fortification-setup",
            "sectionId": "miasmic-malignifier-ability-fortification-setup",
            "title": "Deployment",
            "text": "Both parts of this FORTIFICATION must be set up within 1\" of each other. Both parts are then treated as a single model for all rules purposes.",
            "sourceUnitId": "unit-miasmic-malignifier"
          }
        ],
        "models": [
          {
            "id": "unit-miasmic-malignifier-model-5622cb2341",
            "title": "Miasmic Malignifier",
            "aliases": [
              "Miasmic Malignifier"
            ],
            "min": 1,
            "max": 1,
            "legacyIds": [
              "unit-miasmic-malignifier-model-miasmic-malignifier"
            ]
          }
        ],
        "compositionRules": [],
        "selections": [
          {
            "id": "unit-miasmic-malignifier-selection-miasmic-gouts",
            "title": "Miasmic gouts",
            "aliases": [
              "Miasmic gouts"
            ],
            "kind": "weapon",
            "profileIds": [
              "miasmic-malignifier-weapon-miasmic-gouts"
            ],
            "wargearAbilityIds": []
          }
        ],
        "weaponFamilies": [],
        "weaponProfiles": [
          {
            "id": "miasmic-malignifier-weapon-miasmic-gouts",
            "title": "Miasmic gouts",
            "mode": "ranged",
            "range": "9\"",
            "a": "2D6",
            "skill": "N/A",
            "s": "3",
            "ap": "0",
            "d": "1",
            "abilities": "IGNORES COVER, TORRENT",
            "sourceSelectionIds": [
              "unit-miasmic-malignifier-selection-miasmic-gouts"
            ]
          }
        ],
        "wargearAbilities": []
      }
    },
    {
      "id": "unit-beasts-of-nurgle",
      "title": "Beasts of Nurgle",
      "sourceBookId": "death-guard",
      "sourceLayer": "current",
      "intrinsicKeywords": [
        "BEAST",
        "CHAOS",
        "NURGLE",
        "DAEMON",
        "SUMMONED",
        "BEASTS OF NURGLE",
        "PLAGUE LEGIONS"
      ],
      "relations": {
        "canLead": [],
        "canSupport": [],
        "canBeLedBy": [],
        "canBeSupportedBy": []
      },
      "ruleFacts": {
        "id": "unit-beasts-of-nurgle",
        "unitId": "unit-beasts-of-nurgle",
        "slug": "beasts-of-nurgle",
        "keywords": [
          "BEAST",
          "CHAOS",
          "NURGLE",
          "DAEMON",
          "SUMMONED",
          "BEASTS OF NURGLE",
          "PLAGUE LEGIONS"
        ],
        "intrinsicKeywords": [
          "BEAST",
          "CHAOS",
          "NURGLE",
          "DAEMON",
          "SUMMONED",
          "BEASTS OF NURGLE",
          "PLAGUE LEGIONS"
        ],
        "abilities": [
          "DEADLY DEMISE",
          "Deep Strike",
          "Scouts 6\"",
          "Pact of Decay",
          "Grotesque Regeneration"
        ],
        "termIds": [
          "keyword-beast",
          "keyword-chaos",
          "keyword-nurgle",
          "keyword-daemon",
          "keyword-summoned",
          "keyword-beasts-of-nurgle",
          "keyword-plague-legions",
          "ability-grotesque-regeneration-60c7e2a",
          "weapon-putrid-appendages-7640acd"
        ],
        "epic": false,
        "deadlyDemise": true,
        "attached": false,
        "attachmentKnown": true,
        "characterCount": 0,
        "twoCharacters": null,
        "warlord": null,
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
          "T": "9",
          "Sv": "6+",
          "W": "7",
          "Ld": "7+",
          "OC": "3",
          "Inv": "5+"
        },
        "abilities": [
          {
            "id": "beasts-of-nurgle-ability-core",
            "sectionId": "beasts-of-nurgle-ability-core",
            "title": "CORE",
            "text": "Deadly Demise 1, Deep Strike, Scouts 6\"",
            "sourceUnitId": "unit-beasts-of-nurgle"
          },
          {
            "id": "beasts-of-nurgle-ability-faction",
            "sectionId": "beasts-of-nurgle-ability-faction",
            "title": "FACTION",
            "text": "Pact of Decay",
            "sourceUnitId": "unit-beasts-of-nurgle"
          },
          {
            "id": "beasts-of-nurgle-ability-grotesque-regeneration",
            "sectionId": "beasts-of-nurgle-ability-grotesque-regeneration",
            "title": "Grotesque Regeneration",
            "text": "At the end of each phase, if a Beasts of Nurgle model in this unit has lost any wounds but is not destroyed, that model regains all of its lost wounds.",
            "sourceUnitId": "unit-beasts-of-nurgle"
          }
        ],
        "models": [
          {
            "id": "unit-beasts-of-nurgle-model-bc67da4a7a",
            "title": "Beasts of Nurgle",
            "aliases": [
              "Beasts of Nurgle"
            ],
            "min": 1,
            "max": 2,
            "legacyIds": [
              "unit-beasts-of-nurgle-model-beasts-of-nurgle"
            ]
          }
        ],
        "compositionRules": [],
        "selections": [
          {
            "id": "unit-beasts-of-nurgle-selection-putrid-appendages",
            "title": "Putrid appendages",
            "aliases": [
              "Putrid appendages"
            ],
            "kind": "weapon",
            "profileIds": [
              "beasts-of-nurgle-weapon-putrid-appendages"
            ],
            "wargearAbilityIds": []
          }
        ],
        "weaponFamilies": [],
        "weaponProfiles": [
          {
            "id": "beasts-of-nurgle-weapon-putrid-appendages",
            "title": "Putrid appendages",
            "mode": "melee",
            "range": "Melee",
            "a": "6",
            "skill": "4+",
            "s": "6",
            "ap": "-1",
            "d": "2",
            "abilities": "DEVASTATING WOUNDS",
            "sourceSelectionIds": [
              "unit-beasts-of-nurgle-selection-putrid-appendages"
            ]
          }
        ],
        "wargearAbilities": []
      }
    },
    {
      "id": "unit-great-unclean-one",
      "title": "Great Unclean One",
      "sourceBookId": "death-guard",
      "sourceLayer": "current",
      "intrinsicKeywords": [
        "MONSTER",
        "CHARACTER",
        "PSYKER",
        "CHAOS",
        "NURGLE",
        "DAEMON",
        "SUMMONED",
        "GREAT UNCLEAN ONE",
        "PLAGUE LEGIONS"
      ],
      "relations": {
        "canLead": [],
        "canSupport": [],
        "canBeLedBy": [],
        "canBeSupportedBy": []
      },
      "ruleFacts": {
        "id": "unit-great-unclean-one",
        "unitId": "unit-great-unclean-one",
        "slug": "great-unclean-one",
        "keywords": [
          "MONSTER",
          "CHARACTER",
          "PSYKER",
          "CHAOS",
          "NURGLE",
          "DAEMON",
          "SUMMONED",
          "GREAT UNCLEAN ONE",
          "PLAGUE LEGIONS"
        ],
        "intrinsicKeywords": [
          "MONSTER",
          "CHARACTER",
          "PSYKER",
          "CHAOS",
          "NURGLE",
          "DAEMON",
          "SUMMONED",
          "GREAT UNCLEAN ONE",
          "PLAGUE LEGIONS"
        ],
        "abilities": [
          "DEADLY DEMISE",
          "Deep Strike",
          "Feel No Pain 6+",
          "Pact of Decay",
          "Daemon Lord of Nurgle (Aura)",
          "Nurgle’s Rot (Psychic)",
          "Reverberating Summons"
        ],
        "termIds": [
          "keyword-monster",
          "keyword-character",
          "keyword-psyker",
          "keyword-chaos",
          "keyword-nurgle",
          "keyword-daemon",
          "keyword-summoned",
          "keyword-great-unclean-one",
          "keyword-plague-legions",
          "ability-daemon-lord-of-nurgle-aura-d613df7",
          "ability-nurgles-rot-psychic-80d4e3f",
          "weapon-plague-flail-719d81e",
          "weapon-putrid-vomit-e5055fe",
          "weapon-bileblade-3708417",
          "weapon-bilesword-strike-de60c8c",
          "weapon-bilesword-sweep-d4bee74",
          "weapon-doomsday-bell-bf3de2c"
        ],
        "epic": false,
        "deadlyDemise": true,
        "attached": false,
        "attachmentKnown": true,
        "characterCount": 1,
        "twoCharacters": null,
        "warlord": null,
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
          "T": "12",
          "Sv": "5+",
          "W": "20",
          "Ld": "6+",
          "OC": "5",
          "Inv": "4+"
        },
        "abilities": [
          {
            "id": "great-unclean-one-ability-core",
            "sectionId": "great-unclean-one-ability-core",
            "title": "CORE",
            "text": "Deadly Demise D6, Deep Strike, Feel No Pain 6+",
            "sourceUnitId": "unit-great-unclean-one"
          },
          {
            "id": "great-unclean-one-ability-faction",
            "sectionId": "great-unclean-one-ability-faction",
            "title": "FACTION",
            "text": "Pact of Decay",
            "sourceUnitId": "unit-great-unclean-one"
          },
          {
            "id": "great-unclean-one-ability-daemon-lord-of-nurgle-aura",
            "sectionId": "great-unclean-one-ability-daemon-lord-of-nurgle-aura",
            "title": "Daemon Lord of Nurgle (Aura)",
            "text": "While a friendly PLAGUE LEGIONS unit is within 6\" of this model, add 1 to the Toughness characteristic of models in that unit.",
            "sourceUnitId": "unit-great-unclean-one"
          },
          {
            "id": "great-unclean-one-ability-nurgles-rot-psychic",
            "sectionId": "great-unclean-one-ability-nurgles-rot-psychic",
            "title": "Nurgle’s Rot (Psychic)",
            "text": "At the end of your Movement phase, you can select one enemy unit within 12\" of this model. Until the start of your next Movement phase, that unit is rotted. While a unit is rotted, subtract 1 from the Toughness characteristic of models in that unit.",
            "sourceUnitId": "unit-great-unclean-one"
          },
          {
            "id": "great-unclean-one-ability-reverberating-summons",
            "sectionId": "great-unclean-one-ability-reverberating-summons",
            "title": "Reverberating Summons",
            "text": "Each time a model is destroyed by this weapon, you can select one friendly PLAGUEBEARERS unit within 12\" of the bearer and return 1 destroyed Plaguebearer model to that unit.",
            "sourceUnitId": "unit-great-unclean-one"
          }
        ],
        "models": [
          {
            "id": "unit-great-unclean-one-model-76eb32cfe2",
            "title": "Great Unclean One",
            "aliases": [
              "Great Unclean One"
            ],
            "min": 1,
            "max": 1,
            "legacyIds": [
              "unit-great-unclean-one-model-great-unclean-one"
            ]
          }
        ],
        "compositionRules": [],
        "selections": [
          {
            "id": "unit-great-unclean-one-selection-plague-flail",
            "title": "Plague flail",
            "aliases": [
              "Plague flail"
            ],
            "kind": "weapon",
            "profileIds": [
              "great-unclean-one-weapon-plague-flail"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-great-unclean-one-selection-putrid-vomit",
            "title": "Putrid vomit",
            "aliases": [
              "Putrid vomit"
            ],
            "kind": "weapon",
            "profileIds": [
              "great-unclean-one-weapon-putrid-vomit"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-great-unclean-one-selection-bileblade",
            "title": "Bileblade",
            "aliases": [
              "Bileblade"
            ],
            "kind": "weapon",
            "profileIds": [
              "great-unclean-one-weapon-bileblade"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-great-unclean-one-selection-bilesword-strike",
            "title": "Bilesword – strike",
            "aliases": [
              "Bilesword – strike"
            ],
            "kind": "weapon",
            "profileIds": [
              "great-unclean-one-weapon-bilesword-strike"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-great-unclean-one-selection-bilesword-sweep",
            "title": "Bilesword – sweep",
            "aliases": [
              "Bilesword – sweep"
            ],
            "kind": "weapon",
            "profileIds": [
              "great-unclean-one-weapon-bilesword-sweep"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-great-unclean-one-selection-doomsday-bell",
            "title": "Doomsday bell",
            "aliases": [
              "Doomsday bell"
            ],
            "kind": "weapon",
            "profileIds": [
              "great-unclean-one-weapon-doomsday-bell"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-great-unclean-one-weapon-family-bilesword-selection",
            "title": "Bilesword",
            "aliases": [
              "Bilesword"
            ],
            "kind": "weapon",
            "familyId": "unit-great-unclean-one-weapon-family-bilesword",
            "profileIds": [
              "great-unclean-one-weapon-bilesword-strike",
              "great-unclean-one-weapon-bilesword-sweep"
            ],
            "wargearAbilityIds": []
          }
        ],
        "weaponFamilies": [
          {
            "id": "unit-great-unclean-one-weapon-family-bilesword",
            "title": "Bilesword",
            "aliases": [
              "Bilesword"
            ],
            "profileIds": [
              "great-unclean-one-weapon-bilesword-strike",
              "great-unclean-one-weapon-bilesword-sweep"
            ],
            "ambiguousAlias": false
          }
        ],
        "weaponProfiles": [
          {
            "id": "great-unclean-one-weapon-plague-flail",
            "title": "Plague flail",
            "mode": "ranged",
            "range": "6\"",
            "a": "D6+1",
            "skill": "3+",
            "s": "7",
            "ap": "-2",
            "d": "2",
            "abilities": "-",
            "sourceSelectionIds": [
              "unit-great-unclean-one-selection-plague-flail"
            ]
          },
          {
            "id": "great-unclean-one-weapon-putrid-vomit",
            "title": "Putrid vomit",
            "mode": "ranged",
            "range": "12\"",
            "a": "D6+3",
            "skill": "N/A",
            "s": "5",
            "ap": "-2",
            "d": "1",
            "abilities": "IGNORES COVER, TORRENT",
            "sourceSelectionIds": [
              "unit-great-unclean-one-selection-putrid-vomit"
            ]
          },
          {
            "id": "great-unclean-one-weapon-bileblade",
            "title": "Bileblade",
            "mode": "melee",
            "range": "Melee",
            "a": "3",
            "skill": "2+",
            "s": "6",
            "ap": "-2",
            "d": "2",
            "abilities": "EXTRA ATTACKS, LETHAL HITS",
            "sourceSelectionIds": [
              "unit-great-unclean-one-selection-bileblade"
            ]
          },
          {
            "id": "great-unclean-one-weapon-bilesword-strike",
            "title": "Bilesword – strike",
            "mode": "melee",
            "range": "Melee",
            "a": "6",
            "skill": "2+",
            "s": "10",
            "ap": "-2",
            "d": "D6+1",
            "abilities": "LETHAL HITS",
            "sourceSelectionIds": [
              "unit-great-unclean-one-selection-bilesword-strike",
              "unit-great-unclean-one-weapon-family-bilesword-selection"
            ]
          },
          {
            "id": "great-unclean-one-weapon-bilesword-sweep",
            "title": "Bilesword – sweep",
            "mode": "melee",
            "range": "Melee",
            "a": "12",
            "skill": "2+",
            "s": "7",
            "ap": "-1",
            "d": "1",
            "abilities": "LETHAL HITS",
            "sourceSelectionIds": [
              "unit-great-unclean-one-selection-bilesword-sweep",
              "unit-great-unclean-one-weapon-family-bilesword-selection"
            ]
          },
          {
            "id": "great-unclean-one-weapon-doomsday-bell",
            "title": "Doomsday bell",
            "mode": "melee",
            "range": "Melee",
            "a": "6",
            "skill": "2+",
            "s": "7",
            "ap": "-1",
            "d": "2",
            "abilities": "LETHAL HITS, REVERBERATING SUMMONS",
            "sourceSelectionIds": [
              "unit-great-unclean-one-selection-doomsday-bell"
            ]
          }
        ],
        "wargearAbilities": [],
        "wargearDefaults": [
          {
            "modelId": "unit-great-unclean-one-model-76eb32cfe2",
            "selections": [
              {
                "selectionId": "unit-great-unclean-one-selection-plague-flail",
                "quantity": 1
              },
              {
                "selectionId": "unit-great-unclean-one-selection-putrid-vomit",
                "quantity": 1
              },
              {
                "selectionId": "unit-great-unclean-one-weapon-family-bilesword-selection",
                "quantity": 1
              }
            ]
          }
        ],
        "wargearOptionContracts": [
          {
            "sourceId": "datasheet-great-unclean-one:wargear:1",
            "eligibleModelIds": [
              "unit-great-unclean-one-model-76eb32cfe2"
            ],
            "limit": {
              "perModel": 1,
              "perUnit": 1
            },
            "choices": [
              {
                "remove": [
                  {
                    "selectionId": "unit-great-unclean-one-selection-plague-flail",
                    "quantity": 1
                  }
                ],
                "add": [
                  {
                    "selectionId": "unit-great-unclean-one-selection-bileblade",
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
            "sourceId": "datasheet-great-unclean-one:wargear:2",
            "eligibleModelIds": [
              "unit-great-unclean-one-model-76eb32cfe2"
            ],
            "limit": {
              "perModel": 1,
              "perUnit": 1
            },
            "choices": [
              {
                "remove": [
                  {
                    "selectionId": "unit-great-unclean-one-weapon-family-bilesword-selection",
                    "quantity": 1
                  }
                ],
                "add": [
                  {
                    "selectionId": "unit-great-unclean-one-selection-doomsday-bell",
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
      "id": "unit-nurglings",
      "title": "Nurglings",
      "sourceBookId": "death-guard",
      "sourceLayer": "current",
      "intrinsicKeywords": [
        "SWARM",
        "CHAOS",
        "NURGLE",
        "DAEMON",
        "SUMMONED",
        "NURGLINGS",
        "PLAGUE LEGIONS"
      ],
      "relations": {
        "canLead": [],
        "canSupport": [],
        "canBeLedBy": [],
        "canBeSupportedBy": []
      },
      "ruleFacts": {
        "id": "unit-nurglings",
        "unitId": "unit-nurglings",
        "slug": "nurglings",
        "keywords": [
          "SWARM",
          "CHAOS",
          "NURGLE",
          "DAEMON",
          "SUMMONED",
          "NURGLINGS",
          "PLAGUE LEGIONS"
        ],
        "intrinsicKeywords": [
          "SWARM",
          "CHAOS",
          "NURGLE",
          "DAEMON",
          "SUMMONED",
          "NURGLINGS",
          "PLAGUE LEGIONS"
        ],
        "abilities": [
          "Deep Strike",
          "Infiltrators",
          "Pact of Decay",
          "Mischief Makers"
        ],
        "termIds": [
          "keyword-swarm",
          "keyword-chaos",
          "keyword-nurgle",
          "keyword-daemon",
          "keyword-summoned",
          "keyword-nurglings",
          "keyword-plague-legions",
          "ability-mischief-makers-6a686e9",
          "weapon-diseased-claws-and-teeth-0b6d472"
        ],
        "epic": false,
        "deadlyDemise": false,
        "attached": false,
        "attachmentKnown": true,
        "characterCount": 0,
        "twoCharacters": null,
        "warlord": null,
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
          "T": "3",
          "Sv": "7+",
          "W": "4",
          "Ld": "8+",
          "OC": "0",
          "Inv": "5+"
        },
        "abilities": [
          {
            "id": "nurglings-ability-core",
            "sectionId": "nurglings-ability-core",
            "title": "CORE",
            "text": "Deep Strike, Infiltrators",
            "sourceUnitId": "unit-nurglings"
          },
          {
            "id": "nurglings-ability-faction",
            "sectionId": "nurglings-ability-faction",
            "title": "FACTION",
            "text": "Pact of Decay",
            "sourceUnitId": "unit-nurglings"
          },
          {
            "id": "nurglings-ability-mischief-makers",
            "sectionId": "nurglings-ability-mischief-makers",
            "title": "Mischief Makers",
            "text": "Each time an enemy unit (excluding TITAN units) within Engagement Range of one or more units with this ability is selected to fight, until the end of the phase, each time a model in that enemy unit makes a melee attack, subtract 1 from the Hit roll.",
            "sourceUnitId": "unit-nurglings"
          }
        ],
        "models": [
          {
            "id": "unit-nurglings-model-7a0a3a372b",
            "title": "Nurgling Swarm",
            "aliases": [
              "Nurgling Swarm",
              "Nurgling Swarms"
            ],
            "min": 3,
            "max": 6,
            "legacyIds": [
              "unit-nurglings-model-nurgling-swarm"
            ]
          }
        ],
        "compositionRules": [],
        "selections": [
          {
            "id": "unit-nurglings-selection-diseased-claws-and-teeth",
            "title": "Diseased claws and teeth",
            "aliases": [
              "Diseased claws and teeth"
            ],
            "kind": "weapon",
            "profileIds": [
              "nurglings-weapon-diseased-claws-and-teeth"
            ],
            "wargearAbilityIds": []
          }
        ],
        "weaponFamilies": [],
        "weaponProfiles": [
          {
            "id": "nurglings-weapon-diseased-claws-and-teeth",
            "title": "Diseased claws and teeth",
            "mode": "melee",
            "range": "Melee",
            "a": "4",
            "skill": "5+",
            "s": "2",
            "ap": "0",
            "d": "1",
            "abilities": "LETHAL HITS",
            "sourceSelectionIds": [
              "unit-nurglings-selection-diseased-claws-and-teeth"
            ]
          }
        ],
        "wargearAbilities": []
      }
    },
    {
      "id": "unit-plague-drones",
      "title": "Plague Drones",
      "sourceBookId": "death-guard",
      "sourceLayer": "current",
      "intrinsicKeywords": [
        "MOUNTED",
        "FLY",
        "CHAOS",
        "NURGLE",
        "DAEMON",
        "SUMMONED",
        "PLAGUE DRONES",
        "PLAGUE LEGIONS"
      ],
      "relations": {
        "canLead": [],
        "canSupport": [],
        "canBeLedBy": [],
        "canBeSupportedBy": []
      },
      "ruleFacts": {
        "id": "unit-plague-drones",
        "unitId": "unit-plague-drones",
        "slug": "plague-drones",
        "keywords": [
          "MOUNTED",
          "FLY",
          "CHAOS",
          "NURGLE",
          "DAEMON",
          "SUMMONED",
          "PLAGUE DRONES",
          "PLAGUE LEGIONS"
        ],
        "intrinsicKeywords": [
          "MOUNTED",
          "FLY",
          "CHAOS",
          "NURGLE",
          "DAEMON",
          "SUMMONED",
          "PLAGUE DRONES",
          "PLAGUE LEGIONS"
        ],
        "abilities": [
          "Deep Strike",
          "Pact of Decay",
          "Death’s Heads"
        ],
        "termIds": [
          "keyword-mounted",
          "keyword-fly",
          "keyword-chaos",
          "keyword-nurgle",
          "keyword-daemon",
          "keyword-summoned",
          "keyword-plague-drones",
          "keyword-plague-legions",
          "ability-deaths-heads-546f077",
          "weapon-deaths-heads-3415dda",
          "weapon-foul-mouthparts-8025b79",
          "weapon-plaguesword-ff1305d"
        ],
        "epic": false,
        "deadlyDemise": false,
        "attached": false,
        "attachmentKnown": true,
        "characterCount": 0,
        "twoCharacters": null,
        "warlord": null,
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
          "Sv": "6+",
          "W": "5",
          "Ld": "7+",
          "OC": "2",
          "Inv": "5+"
        },
        "abilities": [
          {
            "id": "plague-drones-ability-core",
            "sectionId": "plague-drones-ability-core",
            "title": "CORE",
            "text": "Deep Strike",
            "sourceUnitId": "unit-plague-drones"
          },
          {
            "id": "plague-drones-ability-faction",
            "sectionId": "plague-drones-ability-faction",
            "title": "FACTION",
            "text": "Pact of Decay",
            "sourceUnitId": "unit-plague-drones"
          },
          {
            "id": "plague-drones-ability-deaths-heads",
            "sectionId": "plague-drones-ability-deaths-heads",
            "title": "Death’s Heads",
            "text": "In your Shooting phase, after this unit has shot, select one enemy unit hit by one or more of those attacks. Until the end of the turn, each time a friendly PLAGUE LEGIONS unit makes an attack that targets that unit, you can re-roll the Wound roll.",
            "sourceUnitId": "unit-plague-drones"
          }
        ],
        "models": [
          {
            "id": "unit-plague-drones-model-3d58b8dae0",
            "title": "Plaguebringer",
            "aliases": [
              "Plaguebringer"
            ],
            "min": 1,
            "max": 1,
            "legacyIds": [
              "unit-plague-drones-model-plaguebringer"
            ]
          },
          {
            "id": "unit-plague-drones-model-f1979e9e47",
            "title": "Plague Drone",
            "aliases": [
              "Plague Drone",
              "Plague Drones"
            ],
            "min": 2,
            "max": 5,
            "legacyIds": [
              "unit-plague-drones-model-plague-drone-2"
            ]
          }
        ],
        "compositionRules": [],
        "selections": [
          {
            "id": "unit-plague-drones-selection-deaths-heads",
            "title": "Death’s heads",
            "aliases": [
              "Death’s heads"
            ],
            "kind": "weapon",
            "profileIds": [
              "plague-drones-weapon-deaths-heads"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-plague-drones-selection-foul-mouthparts",
            "title": "Foul mouthparts",
            "aliases": [
              "Foul mouthparts"
            ],
            "kind": "weapon",
            "profileIds": [
              "plague-drones-weapon-foul-mouthparts"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-plague-drones-selection-plaguesword",
            "title": "Plaguesword",
            "aliases": [
              "Plaguesword"
            ],
            "kind": "weapon",
            "profileIds": [
              "plague-drones-weapon-plaguesword"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-plague-drones-selection-daemonic-icon",
            "title": "Daemonic Icon",
            "aliases": [
              "Daemonic Icon"
            ],
            "kind": "wargear",
            "profileIds": [],
            "wargearAbilityIds": [
              "plague-drones-ability-daemonic-icon"
            ],
            "maxTotalQuantity": 1
          },
          {
            "id": "unit-plague-drones-selection-instrument-of-chaos",
            "title": "Instrument of Chaos",
            "aliases": [
              "Instrument of Chaos"
            ],
            "kind": "wargear",
            "profileIds": [],
            "wargearAbilityIds": [
              "plague-drones-ability-instrument-of-chaos"
            ],
            "maxTotalQuantity": 1
          }
        ],
        "weaponFamilies": [],
        "weaponProfiles": [
          {
            "id": "plague-drones-weapon-deaths-heads",
            "title": "Death’s heads",
            "mode": "ranged",
            "range": "12\"",
            "a": "D3",
            "skill": "4+",
            "s": "4",
            "ap": "0",
            "d": "1",
            "abilities": "BLAST, LETHAL HITS",
            "sourceSelectionIds": [
              "unit-plague-drones-selection-deaths-heads"
            ]
          },
          {
            "id": "plague-drones-weapon-foul-mouthparts",
            "title": "Foul mouthparts",
            "mode": "melee",
            "range": "Melee",
            "a": "2",
            "skill": "4+",
            "s": "5",
            "ap": "-1",
            "d": "2",
            "abilities": "EXTRA ATTACKS, LETHAL HITS",
            "sourceSelectionIds": [
              "unit-plague-drones-selection-foul-mouthparts"
            ]
          },
          {
            "id": "plague-drones-weapon-plaguesword",
            "title": "Plaguesword",
            "mode": "melee",
            "range": "Melee",
            "a": "2",
            "skill": "3+",
            "s": "4",
            "ap": "-1",
            "d": "1",
            "abilities": "LETHAL HITS",
            "sourceSelectionIds": [
              "unit-plague-drones-selection-plaguesword"
            ]
          }
        ],
        "wargearAbilities": [
          {
            "id": "plague-drones-ability-daemonic-icon",
            "sectionId": "plague-drones-ability-daemonic-icon",
            "title": "Daemonic Icon",
            "text": "Models in the bearer’s unit have a Leadership characteristic of 6+.",
            "sourceUnitId": "unit-plague-drones",
            "requiredSelectionIds": [
              "unit-plague-drones-selection-daemonic-icon"
            ]
          },
          {
            "id": "plague-drones-ability-instrument-of-chaos",
            "sectionId": "plague-drones-ability-instrument-of-chaos",
            "title": "Instrument of Chaos",
            "text": "Add 1 to Charge rolls made for the bearer’s unit.",
            "sourceUnitId": "unit-plague-drones",
            "requiredSelectionIds": [
              "unit-plague-drones-selection-instrument-of-chaos"
            ]
          }
        ],
        "wargearDefaults": [
          {
            "modelId": "unit-plague-drones-model-3d58b8dae0",
            "selections": [
              {
                "selectionId": "unit-plague-drones-selection-deaths-heads",
                "quantity": 1
              },
              {
                "selectionId": "unit-plague-drones-selection-foul-mouthparts",
                "quantity": 1
              },
              {
                "selectionId": "unit-plague-drones-selection-plaguesword",
                "quantity": 1
              }
            ]
          },
          {
            "modelId": "unit-plague-drones-model-f1979e9e47",
            "selections": [
              {
                "selectionId": "unit-plague-drones-selection-deaths-heads",
                "quantity": 1
              },
              {
                "selectionId": "unit-plague-drones-selection-foul-mouthparts",
                "quantity": 1
              },
              {
                "selectionId": "unit-plague-drones-selection-plaguesword",
                "quantity": 1
              }
            ]
          }
        ],
        "wargearOptionContracts": [
          {
            "sourceId": "datasheet-plague-drones:wargear:1",
            "eligibleModelIds": [
              "unit-plague-drones-model-f1979e9e47"
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
                    "selectionId": "unit-plague-drones-selection-instrument-of-chaos",
                    "quantity": 1
                  }
                ],
                "requiresFinal": [],
                "forbidsFinal": [
                  "unit-plague-drones-selection-daemonic-icon"
                ],
                "sharedUses": []
              }
            ]
          },
          {
            "sourceId": "datasheet-plague-drones:wargear:2",
            "eligibleModelIds": [
              "unit-plague-drones-model-f1979e9e47"
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
                    "selectionId": "unit-plague-drones-selection-daemonic-icon",
                    "quantity": 1
                  }
                ],
                "requiresFinal": [],
                "forbidsFinal": [
                  "unit-plague-drones-selection-instrument-of-chaos"
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
      "id": "unit-plaguebearers",
      "title": "Plaguebearers",
      "sourceBookId": "death-guard",
      "sourceLayer": "current",
      "intrinsicKeywords": [
        "INFANTRY",
        "BATTLELINE",
        "CHAOS",
        "NURGLE",
        "DAEMON",
        "SUMMONED",
        "PLAGUEBEARERS",
        "PLAGUE LEGIONS"
      ],
      "relations": {
        "canLead": [],
        "canSupport": [],
        "canBeLedBy": [],
        "canBeSupportedBy": []
      },
      "ruleFacts": {
        "id": "unit-plaguebearers",
        "unitId": "unit-plaguebearers",
        "slug": "plaguebearers",
        "keywords": [
          "INFANTRY",
          "BATTLELINE",
          "CHAOS",
          "NURGLE",
          "DAEMON",
          "SUMMONED",
          "PLAGUEBEARERS",
          "PLAGUE LEGIONS"
        ],
        "intrinsicKeywords": [
          "INFANTRY",
          "BATTLELINE",
          "CHAOS",
          "NURGLE",
          "DAEMON",
          "SUMMONED",
          "PLAGUEBEARERS",
          "PLAGUE LEGIONS"
        ],
        "abilities": [
          "Deep Strike",
          "Pact of Decay",
          "Infected Outbreak"
        ],
        "termIds": [
          "keyword-infantry",
          "keyword-battleline",
          "keyword-chaos",
          "keyword-nurgle",
          "keyword-daemon",
          "keyword-summoned",
          "keyword-plaguebearers",
          "keyword-plague-legions",
          "ability-infected-outbreak-faaf2d1",
          "weapon-plaguesword-ff1305d"
        ],
        "epic": false,
        "deadlyDemise": false,
        "attached": false,
        "attachmentKnown": true,
        "characterCount": 0,
        "twoCharacters": null,
        "warlord": null,
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
          "T": "5",
          "Sv": "7+",
          "W": "2",
          "Ld": "7+",
          "OC": "2",
          "Inv": "5+"
        },
        "abilities": [
          {
            "id": "plaguebearers-ability-core",
            "sectionId": "plaguebearers-ability-core",
            "title": "CORE",
            "text": "Deep Strike",
            "sourceUnitId": "unit-plaguebearers"
          },
          {
            "id": "plaguebearers-ability-faction",
            "sectionId": "plaguebearers-ability-faction",
            "title": "FACTION",
            "text": "Pact of Decay",
            "sourceUnitId": "unit-plaguebearers"
          },
          {
            "id": "plaguebearers-ability-infected-outbreak",
            "sectionId": "plaguebearers-ability-infected-outbreak",
            "title": "Infected Outbreak",
            "text": "At the end of your Command phase, if this unit is within range of an objective marker you control, that objective marker remains under your control until your opponent’s Level of Control over that objective marker is greater than yours at the end of a phase.",
            "sourceUnitId": "unit-plaguebearers"
          }
        ],
        "models": [
          {
            "id": "unit-plaguebearers-model-d21114f2db",
            "title": "Plagueridden",
            "aliases": [
              "Plagueridden"
            ],
            "min": 1,
            "max": 1,
            "legacyIds": [
              "unit-plaguebearers-model-plagueridden"
            ]
          },
          {
            "id": "unit-plaguebearers-model-55fc8e4fdf",
            "title": "Plaguebearer",
            "aliases": [
              "Plaguebearer",
              "Plaguebearers"
            ],
            "min": 9,
            "max": 9,
            "legacyIds": [
              "unit-plaguebearers-model-plaguebearer-2"
            ]
          }
        ],
        "compositionRules": [],
        "selections": [
          {
            "id": "unit-plaguebearers-selection-plaguesword",
            "title": "Plaguesword",
            "aliases": [
              "Plaguesword"
            ],
            "kind": "weapon",
            "profileIds": [
              "plaguebearers-weapon-plaguesword"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-plaguebearers-selection-daemonic-icon",
            "title": "Daemonic Icon",
            "aliases": [
              "Daemonic Icon"
            ],
            "kind": "wargear",
            "profileIds": [],
            "wargearAbilityIds": [
              "plaguebearers-ability-daemonic-icon"
            ],
            "maxTotalQuantity": 1
          },
          {
            "id": "unit-plaguebearers-selection-instrument-of-chaos",
            "title": "Instrument of Chaos",
            "aliases": [
              "Instrument of Chaos"
            ],
            "kind": "wargear",
            "profileIds": [],
            "wargearAbilityIds": [
              "plaguebearers-ability-instrument-of-chaos"
            ],
            "maxTotalQuantity": 1
          }
        ],
        "weaponFamilies": [],
        "weaponProfiles": [
          {
            "id": "plaguebearers-weapon-plaguesword",
            "title": "Plaguesword",
            "mode": "melee",
            "range": "Melee",
            "a": "2",
            "skill": "3+",
            "s": "4",
            "ap": "-1",
            "d": "1",
            "abilities": "LETHAL HITS",
            "sourceSelectionIds": [
              "unit-plaguebearers-selection-plaguesword"
            ]
          }
        ],
        "wargearAbilities": [
          {
            "id": "plaguebearers-ability-daemonic-icon",
            "sectionId": "plaguebearers-ability-daemonic-icon",
            "title": "Daemonic Icon",
            "text": "Models in the bearer’s unit have a Leadership characteristic of 6+.",
            "sourceUnitId": "unit-plaguebearers",
            "requiredSelectionIds": [
              "unit-plaguebearers-selection-daemonic-icon"
            ]
          },
          {
            "id": "plaguebearers-ability-instrument-of-chaos",
            "sectionId": "plaguebearers-ability-instrument-of-chaos",
            "title": "Instrument of Chaos",
            "text": "Add 1 to Charge rolls made for the bearer’s unit.",
            "sourceUnitId": "unit-plaguebearers",
            "requiredSelectionIds": [
              "unit-plaguebearers-selection-instrument-of-chaos"
            ]
          }
        ],
        "wargearDefaults": [
          {
            "modelId": "unit-plaguebearers-model-d21114f2db",
            "selections": [
              {
                "selectionId": "unit-plaguebearers-selection-plaguesword",
                "quantity": 1
              }
            ]
          },
          {
            "modelId": "unit-plaguebearers-model-55fc8e4fdf",
            "selections": [
              {
                "selectionId": "unit-plaguebearers-selection-plaguesword",
                "quantity": 1
              }
            ]
          }
        ],
        "wargearOptionContracts": [
          {
            "sourceId": "datasheet-plaguebearers:wargear:1",
            "eligibleModelIds": [
              "unit-plaguebearers-model-55fc8e4fdf"
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
                    "selectionId": "unit-plaguebearers-selection-instrument-of-chaos",
                    "quantity": 1
                  }
                ],
                "requiresFinal": [],
                "forbidsFinal": [
                  "unit-plaguebearers-selection-daemonic-icon"
                ],
                "sharedUses": []
              }
            ]
          },
          {
            "sourceId": "datasheet-plaguebearers:wargear:2",
            "eligibleModelIds": [
              "unit-plaguebearers-model-55fc8e4fdf"
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
                    "selectionId": "unit-plaguebearers-selection-daemonic-icon",
                    "quantity": 1
                  }
                ],
                "requiresFinal": [],
                "forbidsFinal": [
                  "unit-plaguebearers-selection-instrument-of-chaos"
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
      "id": "unit-rotigus",
      "title": "Rotigus",
      "sourceBookId": "death-guard",
      "sourceLayer": "current",
      "intrinsicKeywords": [
        "MONSTER",
        "CHARACTER",
        "EPIC HERO",
        "PSYKER",
        "CHAOS",
        "NURGLE",
        "DAEMON",
        "SUMMONED",
        "ROTIGUS",
        "PLAGUE LEGIONS"
      ],
      "relations": {
        "canLead": [],
        "canSupport": [],
        "canBeLedBy": [],
        "canBeSupportedBy": []
      },
      "ruleFacts": {
        "id": "unit-rotigus",
        "unitId": "unit-rotigus",
        "slug": "rotigus",
        "keywords": [
          "MONSTER",
          "CHARACTER",
          "EPIC HERO",
          "PSYKER",
          "CHAOS",
          "NURGLE",
          "DAEMON",
          "SUMMONED",
          "ROTIGUS",
          "PLAGUE LEGIONS"
        ],
        "intrinsicKeywords": [
          "MONSTER",
          "CHARACTER",
          "EPIC HERO",
          "PSYKER",
          "CHAOS",
          "NURGLE",
          "DAEMON",
          "SUMMONED",
          "ROTIGUS",
          "PLAGUE LEGIONS"
        ],
        "abilities": [
          "DEADLY DEMISE",
          "Deep Strike",
          "Feel No Pain 6+",
          "Pact of Decay",
          "Virulent Blessing (Psychic)",
          "Deluge of Nurgle (Aura)"
        ],
        "termIds": [
          "keyword-monster",
          "keyword-character",
          "keyword-epic-hero",
          "keyword-psyker",
          "keyword-chaos",
          "keyword-nurgle",
          "keyword-daemon",
          "keyword-summoned",
          "keyword-rotigus",
          "keyword-plague-legions",
          "ability-virulent-blessing-psychic-62e7cae",
          "ability-deluge-of-nurgle-aura-49f7690",
          "weapon-streams-of-brackish-filth-de31740",
          "weapon-gnarlrod-strike-1acf103",
          "weapon-gnarlrod-sweep-e6644f6"
        ],
        "epic": true,
        "deadlyDemise": true,
        "attached": false,
        "attachmentKnown": true,
        "characterCount": 1,
        "twoCharacters": null,
        "warlord": null,
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
          "T": "12",
          "Sv": "5+",
          "W": "22",
          "Ld": "6+",
          "OC": "5",
          "Inv": "4+"
        },
        "abilities": [
          {
            "id": "rotigus-ability-core",
            "sectionId": "rotigus-ability-core",
            "title": "CORE",
            "text": "Deadly Demise D6, Deep Strike, Feel No Pain 6+",
            "sourceUnitId": "unit-rotigus"
          },
          {
            "id": "rotigus-ability-faction",
            "sectionId": "rotigus-ability-faction",
            "title": "FACTION",
            "text": "Pact of Decay",
            "sourceUnitId": "unit-rotigus"
          },
          {
            "id": "rotigus-ability-virulent-blessing-psychic",
            "sectionId": "rotigus-ability-virulent-blessing-psychic",
            "title": "Virulent Blessing (Psychic)",
            "text": "At the start of the Fight phase, you can select one enemy unit within 24\" and visible to this model. Until the end of the phase, each time an attack made by a PLAGUE LEGIONS model is allocated to a model in that unit, add 1 to the Damage characteristic of that attack.",
            "sourceUnitId": "unit-rotigus"
          },
          {
            "id": "rotigus-ability-deluge-of-nurgle-aura",
            "sectionId": "rotigus-ability-deluge-of-nurgle-aura",
            "title": "Deluge of Nurgle (Aura)",
            "text": "While an enemy unit is within 6\" of this model, subtract 2 from the Move characteristic and subtract 1 from the Objective Control characteristic of models in that unit.",
            "sourceUnitId": "unit-rotigus"
          }
        ],
        "models": [
          {
            "id": "unit-rotigus-model-5bc0f85d70",
            "title": "Rotigus",
            "aliases": [
              "Rotigus",
              "Rotigus – EPIC HERO"
            ],
            "min": 1,
            "max": 1,
            "legacyIds": [
              "unit-rotigus-model-rotigus"
            ]
          }
        ],
        "compositionRules": [],
        "selections": [
          {
            "id": "unit-rotigus-selection-streams-of-brackish-filth",
            "title": "Streams of brackish filth",
            "aliases": [
              "Streams of brackish filth"
            ],
            "kind": "weapon",
            "profileIds": [
              "rotigus-weapon-streams-of-brackish-filth"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-rotigus-selection-gnarlrod-strike",
            "title": "Gnarlrod – strike",
            "aliases": [
              "Gnarlrod – strike"
            ],
            "kind": "weapon",
            "profileIds": [
              "rotigus-weapon-gnarlrod-strike"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-rotigus-selection-gnarlrod-sweep",
            "title": "Gnarlrod – sweep",
            "aliases": [
              "Gnarlrod – sweep"
            ],
            "kind": "weapon",
            "profileIds": [
              "rotigus-weapon-gnarlrod-sweep"
            ],
            "wargearAbilityIds": []
          },
          {
            "id": "unit-rotigus-weapon-family-gnarlrod-selection",
            "title": "Gnarlrod",
            "aliases": [
              "Gnarlrod"
            ],
            "kind": "weapon",
            "familyId": "unit-rotigus-weapon-family-gnarlrod",
            "profileIds": [
              "rotigus-weapon-gnarlrod-strike",
              "rotigus-weapon-gnarlrod-sweep"
            ],
            "wargearAbilityIds": []
          }
        ],
        "weaponFamilies": [
          {
            "id": "unit-rotigus-weapon-family-gnarlrod",
            "title": "Gnarlrod",
            "aliases": [
              "Gnarlrod"
            ],
            "profileIds": [
              "rotigus-weapon-gnarlrod-strike",
              "rotigus-weapon-gnarlrod-sweep"
            ],
            "ambiguousAlias": false
          }
        ],
        "weaponProfiles": [
          {
            "id": "rotigus-weapon-streams-of-brackish-filth",
            "title": "Streams of brackish filth",
            "mode": "ranged",
            "range": "12\"",
            "a": "2D6",
            "skill": "N/A",
            "s": "8",
            "ap": "-2",
            "d": "1",
            "abilities": "DEVASTATING WOUNDS, IGNORES COVER, TORRENT",
            "sourceSelectionIds": [
              "unit-rotigus-selection-streams-of-brackish-filth"
            ]
          },
          {
            "id": "rotigus-weapon-gnarlrod-strike",
            "title": "Gnarlrod – strike",
            "mode": "melee",
            "range": "Melee",
            "a": "7",
            "skill": "2+",
            "s": "10",
            "ap": "-3",
            "d": "3",
            "abilities": "LETHAL HITS, PSYCHIC",
            "sourceSelectionIds": [
              "unit-rotigus-selection-gnarlrod-strike",
              "unit-rotigus-weapon-family-gnarlrod-selection"
            ]
          },
          {
            "id": "rotigus-weapon-gnarlrod-sweep",
            "title": "Gnarlrod – sweep",
            "mode": "melee",
            "range": "Melee",
            "a": "14",
            "skill": "2+",
            "s": "8",
            "ap": "-1",
            "d": "1",
            "abilities": "LETHAL HITS, PSYCHIC",
            "sourceSelectionIds": [
              "unit-rotigus-selection-gnarlrod-sweep",
              "unit-rotigus-weapon-family-gnarlrod-selection"
            ]
          }
        ],
        "wargearAbilities": []
      }
    }
  ],
  "detachments": [
    {
      "id": "detachment-virulent-vectorium",
      "title": "Virulent Vectorium",
      "sourceBookId": "death-guard",
      "chapterRestriction": null,
      "keywordGrants": [],
      "detachmentRuleIds": [
        "detachment-rule-worldblight"
      ]
    },
    {
      "id": "detachment-mortarions-hammer",
      "title": "Mortarion’s Hammer",
      "sourceBookId": "death-guard",
      "chapterRestriction": null,
      "keywordGrants": [],
      "detachmentRuleIds": [
        "detachment-rule-miasmic-bombardment"
      ]
    },
    {
      "id": "detachment-champions-of-contagion",
      "title": "Champions of Contagion",
      "sourceBookId": "death-guard",
      "chapterRestriction": null,
      "keywordGrants": [],
      "detachmentRuleIds": [
        "detachment-rule-manifold-maladies"
      ]
    },
    {
      "id": "detachment-tallyband-summoners",
      "title": "Tallyband Summoners",
      "sourceBookId": "death-guard",
      "chapterRestriction": null,
      "keywordGrants": [],
      "detachmentRuleIds": [
        "detachment-rule-reverberant-rancidity"
      ]
    },
    {
      "id": "detachment-shamblerot-vectorium",
      "title": "Shamblerot Vectorium",
      "sourceBookId": "death-guard",
      "chapterRestriction": null,
      "keywordGrants": [],
      "detachmentRuleIds": [
        "detachment-rule-numberless-horde"
      ]
    },
    {
      "id": "detachment-death-lords-chosen",
      "title": "Death Lord’s Chosen",
      "sourceBookId": "death-guard",
      "chapterRestriction": null,
      "keywordGrants": [],
      "detachmentRuleIds": [
        "detachment-rule-deadly-vectors"
      ]
    },
    {
      "id": "detachment-contagion-engines",
      "title": "Contagion Engines",
      "sourceBookId": "death-guard",
      "chapterRestriction": null,
      "keywordGrants": [],
      "detachmentRuleIds": [
        "detachment-rule-warped-and-rusted-animus"
      ]
    },
    {
      "id": "detachment-flyblown-host",
      "title": "Flyblown Host",
      "sourceBookId": "death-guard",
      "chapterRestriction": null,
      "keywordGrants": [],
      "detachmentRuleIds": [
        "detachment-rule-verminous-haze"
      ]
    },
    {
      "id": "detachment-paragons-of-putrescence",
      "title": "Paragons of Putrescence",
      "sourceBookId": "death-guard",
      "chapterRestriction": null,
      "keywordGrants": [],
      "detachmentRuleIds": [
        "detachment-rule-hypervirulent-strains"
      ]
    }
  ],
  "detachmentRules": [
    {
      "id": "detachment-rule-worldblight",
      "title": "Worldblight",
      "text": "At the end of your Command phase, if a friendly DEATH GUARD unit is controlling an objective, that objective is secured. Until you lose control of that objective, while an enemy unit is within range of that objective, that enemy unit is Afflicted.",
      "sectionId": "rule-worldblight",
      "detachmentId": "detachment-virulent-vectorium",
      "detachmentTitle": "Virulent Vectorium",
      "sourceBookId": "death-guard"
    },
    {
      "id": "detachment-rule-miasmic-bombardment",
      "title": "Miasmic Bombardment",
      "text": "At the start of the battle round, select a number of enemy units more than 12\" away from every model from your army that is on the battlefield. Until the end of the battle round, those enemy units are Afflicted. The maximum number of units you can select in this way depends on the battle size, as shown below.",
      "sectionId": "rule-miasmic-bombardment",
      "detachmentId": "detachment-mortarions-hammer",
      "detachmentTitle": "Mortarion’s Hammer",
      "sourceBookId": "death-guard"
    },
    {
      "id": "detachment-rule-manifold-maladies",
      "title": "Manifold Maladies",
      "text": "At the start of the battle round, you can select one of the Plagues listed in Nurgle’s Gift. Until the end of the battle, that is your chosen Plague instead of any previously chosen Plague.",
      "sectionId": "rule-manifold-maladies",
      "detachmentId": "detachment-champions-of-contagion",
      "detachmentTitle": "Champions of Contagion",
      "sourceBookId": "death-guard"
    },
    {
      "id": "detachment-rule-reverberant-rancidity",
      "title": "Reverberant Rancidity",
      "text": "While a PLAGUE LEGIONS unit from your army is within 7\" of one or more DEATH GUARD units from your army, that PLAGUE LEGIONS unit has the Nurgle’s Gift ability. While a DEATH GUARD unit from your army is within 7\" of one or more PLAGUE LEGIONS units from your army, add 3\" to that DEATH GUARD unit’s Contagion Range.",
      "sectionId": "rule-reverberant-rancidity",
      "detachmentId": "detachment-tallyband-summoners",
      "detachmentTitle": "Tallyband Summoners",
      "sourceBookId": "death-guard"
    },
    {
      "id": "detachment-rule-numberless-horde",
      "title": "Numberless Horde",
      "text": "In your Command phase in each of the following battle rounds, depending on your chosen battle size, add a new POXWALKERS unit with a Starting Strength of 10 to your army, in Strategic Reserves.",
      "sectionId": "rule-numberless-horde",
      "detachmentId": "detachment-shamblerot-vectorium",
      "detachmentTitle": "Shamblerot Vectorium",
      "sourceBookId": "death-guard"
    },
    {
      "id": "detachment-rule-deadly-vectors",
      "title": "Deadly Vectors",
      "text": "In your opponent’s Command phase, roll 2D6 for each Afflicted enemy unit, subtracting 1 from the result if that unit is Below Half-strength. If the result is 6 or less, that enemy unit suffers D3 mortal wounds.",
      "sectionId": "rule-deadly-vectors",
      "detachmentId": "detachment-death-lords-chosen",
      "detachmentTitle": "Death Lord’s Chosen",
      "sourceBookId": "death-guard"
    },
    {
      "id": "detachment-rule-warped-and-rusted-animus",
      "title": "Warped and Rusted Animus",
      "text": "Friendly FOETID BLOAT-DRONE/FOETID BLOAT-DRONE WITH HEAVY BLIGHT LAUNCHER/HELBRUTE/MYPHITIC BLIGHT-HAULER units have CONTAGION ENGINE. Friendly CONTAGION ENGINE units’ ranged attacks have [ASSAULT]. This detachment has the ENGINES tag and cannot be taken with another ENGINES detachment.",
      "sectionId": "rule-warped-and-rusted-animus",
      "detachmentId": "detachment-contagion-engines",
      "detachmentTitle": "Contagion Engines",
      "sourceBookId": "death-guard"
    },
    {
      "id": "detachment-rule-verminous-haze",
      "title": "Verminous Haze",
      "text": "In the Declare Battle Formations step, you can select up to two friendly PLAGUE MARINES units. Those units have Infiltrators. This detachment has the FLYBLOWN tag and cannot be taken with another FLYBLOWN detachment.",
      "sectionId": "rule-verminous-haze",
      "detachmentId": "detachment-flyblown-host",
      "detachmentTitle": "Flyblown Host",
      "sourceBookId": "death-guard"
    },
    {
      "id": "detachment-rule-hypervirulent-strains",
      "title": "Hypervirulent Strains",
      "text": "Friendly DEATH GUARD CHARACTER units have +3\" to their Contagion Range (to a maximum of 12\").",
      "sectionId": "rule-hypervirulent-strains",
      "detachmentId": "detachment-paragons-of-putrescence",
      "detachmentTitle": "Paragons of Putrescence",
      "sourceBookId": "death-guard"
    }
  ],
  "enhancements": [
    {
      "type": "enhancement",
      "id": "enhancement-daemon-weapon-of-nurgle",
      "title": "Daemon Weapon of Nurgle - 10 pts",
      "text": "DEATH GUARD model only. Each time the bearer makes a melee attack, an unmodified Hit roll of 5+ scores a Critical Hit.",
      "tags": [],
      "assignment": {
        "maxOwners": 1,
        "enhancementChoices": 1,
        "payPointsPerOwner": true
      },
      "owner": {
        "subject": "model",
        "selector": {
          "allKeywords": [
            "CHARACTER",
            "DEATH GUARD"
          ],
          "noneKeywords": [
            "EPIC HERO"
          ]
        }
      },
      "detachmentId": "detachment-virulent-vectorium",
      "sourceBookId": "death-guard",
      "legacyKey": "enhancement-daemon-weapon-of-nurgle",
      "canonicalEnhancementId": "enhancement-daemon-weapon-of-nurgle",
      "canonicalDetachmentId": "detachment-virulent-vectorium"
    },
    {
      "type": "enhancement",
      "id": "enhancement-furnace-of-plagues",
      "title": "Furnace of Plagues - 25 pts",
      "text": "DEATH GUARD model only. Add 1 to the Strength and Attacks characteristics of the bearers melee weapons, and the bearer’s melee weapons have the [DEVASTATING WOUNDS] ability.",
      "tags": [],
      "assignment": {
        "maxOwners": 1,
        "enhancementChoices": 1,
        "payPointsPerOwner": true
      },
      "owner": {
        "subject": "model",
        "selector": {
          "allKeywords": [
            "CHARACTER",
            "DEATH GUARD"
          ],
          "noneKeywords": [
            "EPIC HERO"
          ]
        }
      },
      "detachmentId": "detachment-virulent-vectorium",
      "sourceBookId": "death-guard",
      "legacyKey": "enhancement-furnace-of-plagues",
      "canonicalEnhancementId": "enhancement-furnace-of-plagues",
      "canonicalDetachmentId": "detachment-virulent-vectorium"
    },
    {
      "type": "enhancement",
      "id": "enhancement-arch-contaminator",
      "title": "Arch Contaminator - 25 pts",
      "text": "DEATH GUARD model only. While the bearer’s unit is within range of an objective marker you control, each time a model in the bearer’s unit makes an attack, you can re-roll the Wound roll.",
      "tags": [],
      "assignment": {
        "maxOwners": 1,
        "enhancementChoices": 1,
        "payPointsPerOwner": true
      },
      "owner": {
        "subject": "model",
        "selector": {
          "allKeywords": [
            "CHARACTER",
            "DEATH GUARD"
          ],
          "noneKeywords": [
            "EPIC HERO"
          ]
        }
      },
      "detachmentId": "detachment-virulent-vectorium",
      "sourceBookId": "death-guard",
      "legacyKey": "enhancement-arch-contaminator",
      "canonicalEnhancementId": "enhancement-arch-contaminator",
      "canonicalDetachmentId": "detachment-virulent-vectorium"
    },
    {
      "type": "enhancement",
      "id": "enhancement-revolting-regeneration",
      "title": "Revolting Regeneration - 30 pts",
      "text": "DEATH GUARD model only. The bearer has the Feel No Pain 5+ ability.",
      "tags": [],
      "assignment": {
        "maxOwners": 1,
        "enhancementChoices": 1,
        "payPointsPerOwner": true
      },
      "owner": {
        "subject": "model",
        "selector": {
          "allKeywords": [
            "CHARACTER",
            "DEATH GUARD"
          ],
          "noneKeywords": [
            "EPIC HERO"
          ]
        }
      },
      "detachmentId": "detachment-virulent-vectorium",
      "sourceBookId": "death-guard",
      "legacyKey": "enhancement-revolting-regeneration",
      "canonicalEnhancementId": "enhancement-revolting-regeneration",
      "canonicalDetachmentId": "detachment-virulent-vectorium"
    },
    {
      "type": "enhancement",
      "id": "enhancement-eye-of-affliction",
      "title": "Eye of Affliction - 20 pts",
      "text": "DEATH GUARD model only. Ranged weapons equipped by models in the bearer’s unit have the [ignores cover] ability while targeting an Afflicted enemy unit.",
      "tags": [],
      "assignment": {
        "maxOwners": 1,
        "enhancementChoices": 1,
        "payPointsPerOwner": true
      },
      "owner": {
        "subject": "model",
        "selector": {
          "allKeywords": [
            "CHARACTER",
            "DEATH GUARD"
          ],
          "noneKeywords": [
            "EPIC HERO"
          ]
        }
      },
      "detachmentId": "detachment-mortarions-hammer",
      "sourceBookId": "death-guard",
      "legacyKey": "enhancement-eye-of-affliction",
      "canonicalEnhancementId": "enhancement-eye-of-affliction",
      "canonicalDetachmentId": "detachment-mortarions-hammer"
    },
    {
      "type": "enhancement",
      "id": "enhancement-bilemaw-blight",
      "title": "Bilemaw Blight - 10 pts",
      "text": "MALIGNANT PLAGUECASTER only. At the start of your Shooting phase, until the end of the phase, add 12\" to the Range characteristics of the bearer’s Plague Wind weapon.",
      "tags": [],
      "assignment": {
        "maxOwners": 1,
        "enhancementChoices": 1,
        "payPointsPerOwner": true
      },
      "owner": {
        "subject": "model",
        "selector": {
          "unitIds": [
            "unit-malignant-plaguecaster"
          ],
          "noneKeywords": [
            "EPIC HERO"
          ]
        }
      },
      "detachmentId": "detachment-mortarions-hammer",
      "sourceBookId": "death-guard",
      "legacyKey": "enhancement-bilemaw-blight",
      "canonicalEnhancementId": "enhancement-bilemaw-blight",
      "canonicalDetachmentId": "detachment-mortarions-hammer"
    },
    {
      "type": "enhancement",
      "id": "enhancement-shriekworm-familiar",
      "title": "Shriekworm Familiar - 15 pts",
      "text": "DEATH GUARD model only. Once per battle round, you can target the bearer’s unit with the Fire Overwatch Stratagem for 0CP.",
      "tags": [],
      "assignment": {
        "maxOwners": 1,
        "enhancementChoices": 1,
        "payPointsPerOwner": true
      },
      "owner": {
        "subject": "model",
        "selector": {
          "allKeywords": [
            "CHARACTER",
            "DEATH GUARD"
          ],
          "noneKeywords": [
            "EPIC HERO"
          ]
        }
      },
      "detachmentId": "detachment-mortarions-hammer",
      "sourceBookId": "death-guard",
      "legacyKey": "enhancement-shriekworm-familiar",
      "canonicalEnhancementId": "enhancement-shriekworm-familiar",
      "canonicalDetachmentId": "detachment-mortarions-hammer"
    },
    {
      "type": "enhancement",
      "id": "enhancement-tendrilous-emissions",
      "title": "Tendrilous Emissions - 30 pts",
      "text": "LORD OF VIRULENCE only. While the bearer is within 3\" of one or more friendly DEATH GUARD VEHICLE units, the bearer has the Lone Operative ability, and each time one of those VEHICLE units makes a ranged attack that targets an enemy unit visible to the bearer, re-roll a Wound roll of 1.",
      "tags": [],
      "assignment": {
        "maxOwners": 1,
        "enhancementChoices": 1,
        "payPointsPerOwner": true
      },
      "owner": {
        "subject": "model",
        "selector": {
          "unitIds": [
            "unit-lord-of-virulence"
          ],
          "noneKeywords": [
            "EPIC HERO"
          ]
        }
      },
      "detachmentId": "detachment-mortarions-hammer",
      "sourceBookId": "death-guard",
      "legacyKey": "enhancement-tendrilous-emissions",
      "canonicalEnhancementId": "enhancement-tendrilous-emissions",
      "canonicalDetachmentId": "detachment-mortarions-hammer"
    },
    {
      "type": "enhancement",
      "id": "enhancement-final-ingredient",
      "title": "Final Ingredient - 20 pts",
      "text": "BIOLOGUS PUTRIFIER only. Once per battle, after the bearers unit has fought, if one or more CHARACTER models were destroyed as a result of those attacks, select one Plague. Until the end of the battle, while an enemy unit is Afflicted, that unit has the effect of the selected Plague in addition to any other.",
      "tags": [],
      "assignment": {
        "maxOwners": 1,
        "enhancementChoices": 1,
        "payPointsPerOwner": true
      },
      "owner": {
        "subject": "model",
        "selector": {
          "unitIds": [
            "unit-biologus-putrifier"
          ],
          "noneKeywords": [
            "EPIC HERO"
          ]
        }
      },
      "detachmentId": "detachment-champions-of-contagion",
      "sourceBookId": "death-guard",
      "legacyKey": "enhancement-final-ingredient",
      "canonicalEnhancementId": "enhancement-final-ingredient",
      "canonicalDetachmentId": "detachment-champions-of-contagion"
    },
    {
      "type": "enhancement",
      "id": "enhancement-visions-of-virulence",
      "title": "Visions of Virulence - 15 pts",
      "text": "MALIGNANT PLAGUECASTER only. While an enemy unit is enfeebled by the bearer’s Pestilent Fallout ability, that unit is also Afflicted.",
      "tags": [],
      "assignment": {
        "maxOwners": 1,
        "enhancementChoices": 1,
        "payPointsPerOwner": true
      },
      "owner": {
        "subject": "model",
        "selector": {
          "unitIds": [
            "unit-malignant-plaguecaster"
          ],
          "noneKeywords": [
            "EPIC HERO"
          ]
        }
      },
      "detachmentId": "detachment-champions-of-contagion",
      "sourceBookId": "death-guard",
      "legacyKey": "enhancement-visions-of-virulence",
      "canonicalEnhancementId": "enhancement-visions-of-virulence",
      "canonicalDetachmentId": "detachment-champions-of-contagion"
    },
    {
      "type": "enhancement",
      "id": "enhancement-needle-of-nurgle",
      "title": "Needle of Nurgle - 25 pts",
      "text": "PLAGUE SURGEON only. Each time the bearer uses its Tainted Narthecium ability, you can return up to D3 destroyed models to the bearer’s unit (instead of 1).",
      "tags": [],
      "assignment": {
        "maxOwners": 1,
        "enhancementChoices": 1,
        "payPointsPerOwner": true
      },
      "owner": {
        "subject": "model",
        "selector": {
          "unitIds": [
            "unit-plague-surgeon"
          ],
          "noneKeywords": [
            "EPIC HERO"
          ]
        }
      },
      "detachmentId": "detachment-champions-of-contagion",
      "sourceBookId": "death-guard",
      "legacyKey": "enhancement-needle-of-nurgle",
      "canonicalEnhancementId": "enhancement-needle-of-nurgle",
      "canonicalDetachmentId": "detachment-champions-of-contagion"
    },
    {
      "type": "enhancement",
      "id": "enhancement-cornucophagus",
      "title": "Cornucophagus - 35 pts",
      "text": "LORD OF POXES only. In the Declare Battle Formations step select one Plague. Until the end of the battle, while an enemy unit is within Contagion Range of the bearer, that enemy unit has the effect of that Plague in addition to any other.",
      "tags": [],
      "assignment": {
        "maxOwners": 1,
        "enhancementChoices": 1,
        "payPointsPerOwner": true
      },
      "owner": {
        "subject": "model",
        "selector": {
          "unitIds": [
            "unit-lord-of-poxes"
          ],
          "noneKeywords": [
            "EPIC HERO"
          ]
        }
      },
      "detachmentId": "detachment-champions-of-contagion",
      "sourceBookId": "death-guard",
      "legacyKey": "enhancement-cornucophagus",
      "canonicalEnhancementId": "enhancement-cornucophagus",
      "canonicalDetachmentId": "detachment-champions-of-contagion"
    },
    {
      "type": "enhancement",
      "id": "enhancement-beckoning-blight",
      "title": "Beckoning Blight - 20 pts",
      "text": "DEATH GUARD model only. Each time a PLAGUE LEGIONS unit from your army is set up on the battlefield using the Deep Strike ability, if it is set up wholly within 12\" of the bearer, it can be set up anywhere that is more than 6\" horizontally away from all enemy models, instead of more than 8\".",
      "tags": [],
      "assignment": {
        "maxOwners": 1,
        "enhancementChoices": 1,
        "payPointsPerOwner": true
      },
      "owner": {
        "subject": "model",
        "selector": {
          "allKeywords": [
            "CHARACTER",
            "DEATH GUARD"
          ],
          "noneKeywords": [
            "EPIC HERO"
          ]
        }
      },
      "detachmentId": "detachment-tallyband-summoners",
      "sourceBookId": "death-guard",
      "legacyKey": "enhancement-beckoning-blight",
      "canonicalEnhancementId": "enhancement-beckoning-blight",
      "canonicalDetachmentId": "detachment-tallyband-summoners"
    },
    {
      "type": "enhancement",
      "id": "enhancement-fell-harvester",
      "title": "Fell Harvester - 10 pts",
      "text": "DEATH GUARD model only. Add 2 to the Attacks characteristic of the bearer’s melee weapons.",
      "tags": [],
      "assignment": {
        "maxOwners": 1,
        "enhancementChoices": 1,
        "payPointsPerOwner": true
      },
      "owner": {
        "subject": "model",
        "selector": {
          "allKeywords": [
            "CHARACTER",
            "DEATH GUARD"
          ],
          "noneKeywords": [
            "EPIC HERO"
          ]
        }
      },
      "detachmentId": "detachment-tallyband-summoners",
      "sourceBookId": "death-guard",
      "legacyKey": "enhancement-fell-harvester",
      "canonicalEnhancementId": "enhancement-fell-harvester",
      "canonicalDetachmentId": "detachment-tallyband-summoners"
    },
    {
      "type": "enhancement",
      "id": "enhancement-entropic-knell",
      "title": "Entropic Knell - 15 pts",
      "text": "GREAT UNCLEAN ONE only. In the Battle-shock step of your opponent’s Command phase, each enemy unit within 6\" of the bearer that is below its Starting Strength must take a Battle-shock test, subtracting 1 from that test.",
      "tags": [],
      "assignment": {
        "maxOwners": 1,
        "enhancementChoices": 1,
        "payPointsPerOwner": true
      },
      "owner": {
        "subject": "model",
        "selector": {
          "unitIds": [
            "unit-great-unclean-one"
          ],
          "noneKeywords": [
            "EPIC HERO"
          ]
        }
      },
      "detachmentId": "detachment-tallyband-summoners",
      "sourceBookId": "death-guard",
      "legacyKey": "enhancement-entropic-knell",
      "canonicalEnhancementId": "enhancement-entropic-knell",
      "canonicalDetachmentId": "detachment-tallyband-summoners"
    },
    {
      "type": "enhancement",
      "id": "enhancement-tome-of-bounteous-blessings",
      "title": "Tome of Bounteous Blessings - 20 pts",
      "text": "MALIGNANT PLAGUECASTER only. Each time a PLAGUE LEGIONS unit within 12\" of the bearer takes a Battle-shock test, add 1 to that test and, if that test is passed, one model in that unit regains up to D3 lost wounds (if that unit is a BATTLELINE unit and that test is passed, up to D3 destroyed models can be returned to that unit instead).",
      "tags": [],
      "assignment": {
        "maxOwners": 1,
        "enhancementChoices": 1,
        "payPointsPerOwner": true
      },
      "owner": {
        "subject": "model",
        "selector": {
          "unitIds": [
            "unit-malignant-plaguecaster"
          ],
          "noneKeywords": [
            "EPIC HERO"
          ]
        }
      },
      "detachmentId": "detachment-tallyband-summoners",
      "sourceBookId": "death-guard",
      "legacyKey": "enhancement-tome-of-bounteous-blessings",
      "canonicalEnhancementId": "enhancement-tome-of-bounteous-blessings",
      "canonicalDetachmentId": "detachment-tallyband-summoners"
    },
    {
      "type": "enhancement",
      "id": "enhancement-witherbone-pipes",
      "title": "Witherbone Pipes - 25 pts",
      "text": "NOXIOUS BLIGHTBRINGER only. While the bearer is leading a POXWALKERS unit, add 1 to the Objective Control characteristic of models in that unit, and each time that unit takes a Battle-shock or Leadership test, add 1 to that test.",
      "tags": [],
      "assignment": {
        "maxOwners": 1,
        "enhancementChoices": 1,
        "payPointsPerOwner": true
      },
      "owner": {
        "subject": "model",
        "selector": {
          "unitIds": [
            "unit-noxious-blightbringer"
          ],
          "noneKeywords": [
            "EPIC HERO"
          ]
        }
      },
      "detachmentId": "detachment-shamblerot-vectorium",
      "sourceBookId": "death-guard",
      "legacyKey": "enhancement-witherbone-pipes",
      "canonicalEnhancementId": "enhancement-witherbone-pipes",
      "canonicalDetachmentId": "detachment-shamblerot-vectorium"
    },
    {
      "type": "enhancement",
      "id": "enhancement-lord-of-the-walking-pox",
      "title": "Lord of the Walking Pox - 15 pts",
      "text": "DEATH GUARD model only. If the bearer is leading a POXWALKER unit, and is in Strategic Reserves, for the purposes of setting up that unit on the battlefield, treat the current battle round as the third battle round.",
      "tags": [],
      "assignment": {
        "maxOwners": 1,
        "enhancementChoices": 1,
        "payPointsPerOwner": true
      },
      "owner": {
        "subject": "model",
        "selector": {
          "allKeywords": [
            "CHARACTER",
            "DEATH GUARD"
          ],
          "noneKeywords": [
            "EPIC HERO"
          ]
        }
      },
      "detachmentId": "detachment-shamblerot-vectorium",
      "sourceBookId": "death-guard",
      "legacyKey": "enhancement-lord-of-the-walking-pox",
      "canonicalEnhancementId": "enhancement-lord-of-the-walking-pox",
      "canonicalDetachmentId": "detachment-shamblerot-vectorium"
    },
    {
      "type": "enhancement",
      "id": "enhancement-sorrowsyphon",
      "title": "Sorrowsyphon - 10 pts",
      "text": "MALIGNANT PLAGUECASTER only. While the bearer is leading a POXWALKERS unit, add 1 to the Damage characteristic of the bearer’s Plague Wind weapon. Each time the bearer makes one or more attacks with a Plague Wind weapon, after the bearer’s unit has resolved its attacks, D3 Bodyguard models from the bearer’s unit are destroyed.",
      "tags": [],
      "assignment": {
        "maxOwners": 1,
        "enhancementChoices": 1,
        "payPointsPerOwner": true
      },
      "owner": {
        "subject": "model",
        "selector": {
          "unitIds": [
            "unit-malignant-plaguecaster"
          ],
          "noneKeywords": [
            "EPIC HERO"
          ]
        }
      },
      "detachmentId": "detachment-shamblerot-vectorium",
      "sourceBookId": "death-guard",
      "legacyKey": "enhancement-sorrowsyphon",
      "canonicalEnhancementId": "enhancement-sorrowsyphon",
      "canonicalDetachmentId": "detachment-shamblerot-vectorium"
    },
    {
      "type": "enhancement",
      "id": "enhancement-talisman-of-burgeoning",
      "title": "Talisman of Burgeoning - 25 pts",
      "text": "DEATH GUARD model only. While the bearer is leading a unit, add 1 to the Toughness characteristic of POXWALKERS models in that unit.",
      "tags": [],
      "assignment": {
        "maxOwners": 1,
        "enhancementChoices": 1,
        "payPointsPerOwner": true
      },
      "owner": {
        "subject": "model",
        "selector": {
          "allKeywords": [
            "CHARACTER",
            "DEATH GUARD"
          ],
          "noneKeywords": [
            "EPIC HERO"
          ]
        }
      },
      "detachmentId": "detachment-shamblerot-vectorium",
      "sourceBookId": "death-guard",
      "legacyKey": "enhancement-talisman-of-burgeoning",
      "canonicalEnhancementId": "enhancement-talisman-of-burgeoning",
      "canonicalDetachmentId": "detachment-shamblerot-vectorium"
    },
    {
      "type": "enhancement",
      "id": "enhancement-face-of-death",
      "title": "Face of Death - 10 pts",
      "text": "TERMINATOR model only. At the start of the Fight phase, each enemy unit within Engagement Range of the bearer’s unit must take a Battle-shock test.",
      "tags": [],
      "assignment": {
        "maxOwners": 1,
        "enhancementChoices": 1,
        "payPointsPerOwner": true
      },
      "owner": {
        "subject": "model",
        "selector": {
          "allKeywords": [
            "CHARACTER",
            "TERMINATOR"
          ],
          "noneKeywords": [
            "EPIC HERO"
          ]
        }
      },
      "detachmentId": "detachment-death-lords-chosen",
      "sourceBookId": "death-guard",
      "legacyKey": "enhancement-face-of-death",
      "canonicalEnhancementId": "enhancement-face-of-death",
      "canonicalDetachmentId": "detachment-death-lords-chosen"
    },
    {
      "type": "enhancement",
      "id": "enhancement-vile-vigour",
      "title": "Vile Vigour - 15 pts",
      "text": "TERMINATOR model only. While the bearer is leading a unit, add 1\" to the Movement characteristic of models in that unit and you can re-roll Advance rolls made for that unit.",
      "tags": [],
      "assignment": {
        "maxOwners": 1,
        "enhancementChoices": 1,
        "payPointsPerOwner": true
      },
      "owner": {
        "subject": "model",
        "selector": {
          "allKeywords": [
            "CHARACTER",
            "TERMINATOR"
          ],
          "noneKeywords": [
            "EPIC HERO"
          ]
        }
      },
      "detachmentId": "detachment-death-lords-chosen",
      "sourceBookId": "death-guard",
      "legacyKey": "enhancement-vile-vigour",
      "canonicalEnhancementId": "enhancement-vile-vigour",
      "canonicalDetachmentId": "detachment-death-lords-chosen"
    },
    {
      "type": "enhancement",
      "id": "enhancement-warprot-talisman",
      "title": "Warprot Talisman - 30 pts",
      "text": "TERMINATOR model only. Once per battle, at the end of your opponent’s turn, if the bearer’s unit is not within Engagement Range of one or more enemy units, you can remove it from the battlefield and place it into Strategic Reserves.",
      "tags": [],
      "assignment": {
        "maxOwners": 1,
        "enhancementChoices": 1,
        "payPointsPerOwner": true
      },
      "owner": {
        "subject": "model",
        "selector": {
          "allKeywords": [
            "CHARACTER",
            "TERMINATOR"
          ],
          "noneKeywords": [
            "EPIC HERO"
          ]
        }
      },
      "detachmentId": "detachment-death-lords-chosen",
      "sourceBookId": "death-guard",
      "legacyKey": "enhancement-warprot-talisman",
      "canonicalEnhancementId": "enhancement-warprot-talisman",
      "canonicalDetachmentId": "detachment-death-lords-chosen"
    },
    {
      "type": "enhancement",
      "id": "enhancement-helm-of-the-fly-king",
      "title": "Helm of the Fly King - 20 pts",
      "text": "TERMINATOR model only. While the bearer is leading a unit, models in that unit cannot be targeted by ranged attacks unless the attacking model is within 18\".",
      "tags": [],
      "assignment": {
        "maxOwners": 1,
        "enhancementChoices": 1,
        "payPointsPerOwner": true
      },
      "owner": {
        "subject": "model",
        "selector": {
          "allKeywords": [
            "CHARACTER",
            "TERMINATOR"
          ],
          "noneKeywords": [
            "EPIC HERO"
          ]
        }
      },
      "detachmentId": "detachment-death-lords-chosen",
      "sourceBookId": "death-guard",
      "legacyKey": "enhancement-helm-of-the-fly-king",
      "canonicalEnhancementId": "enhancement-helm-of-the-fly-king",
      "canonicalDetachmentId": "detachment-death-lords-chosen"
    },
    {
      "type": "enhancement",
      "id": "enhancement-parasitic-woe-reaper",
      "title": "Parasitic Woe-Reaper - 15 pts",
      "text": "CONTAGION ENGINE unit only. When this unit has fought, one model in this unit heals D3 wounds.",
      "tags": [
        "UPGRADE"
      ],
      "assignment": {
        "maxOwners": 3,
        "enhancementChoices": 1,
        "payPointsPerOwner": true
      },
      "owner": {
        "subject": "unit",
        "selector": {
          "allKeywords": [
            "CONTAGION ENGINE"
          ]
        }
      },
      "detachmentId": "detachment-contagion-engines",
      "sourceBookId": "death-guard",
      "legacyKey": "enhancement-parasitic-woe-reaper",
      "canonicalEnhancementId": "enhancement-parasitic-woe-reaper",
      "canonicalDetachmentId": "detachment-contagion-engines"
    },
    {
      "type": "enhancement",
      "id": "enhancement-lancet-of-the-worldsore",
      "title": "Lancet of the Worldsore - 15 pts",
      "text": "Friendly HELBRUTE/MYPHITIC BLIGHT-HAULER unit only. This unit has MOBILE.",
      "tags": [
        "UPGRADE"
      ],
      "assignment": {
        "maxOwners": 3,
        "enhancementChoices": 1,
        "payPointsPerOwner": true
      },
      "owner": {
        "subject": "unit",
        "selector": {
          "unitIds": [
            "unit-helbrute",
            "unit-myphitic-blight-hauler"
          ]
        }
      },
      "detachmentId": "detachment-contagion-engines",
      "sourceBookId": "death-guard",
      "legacyKey": "enhancement-lancet-of-the-worldsore",
      "canonicalEnhancementId": "enhancement-lancet-of-the-worldsore",
      "canonicalDetachmentId": "detachment-contagion-engines"
    },
    {
      "type": "enhancement",
      "id": "enhancement-insectile-murmuration",
      "title": "Insectile Murmuration - 15 pts",
      "text": "PLAGUE MARINES unit only. When this unit’s attacks target a unit within Contagion Range of a friendly unit, those attacks can re-roll wound rolls of 1.",
      "tags": [
        "UPGRADE"
      ],
      "assignment": {
        "maxOwners": 3,
        "enhancementChoices": 1,
        "payPointsPerOwner": true
      },
      "owner": {
        "subject": "unit",
        "selector": {
          "unitIds": [
            "unit-plague-marines"
          ]
        }
      },
      "detachmentId": "detachment-flyblown-host",
      "sourceBookId": "death-guard",
      "legacyKey": "enhancement-insectile-murmuration",
      "canonicalEnhancementId": "enhancement-insectile-murmuration",
      "canonicalDetachmentId": "detachment-flyblown-host"
    },
    {
      "type": "enhancement",
      "id": "enhancement-plagueveil",
      "title": "Plagueveil - 15 pts",
      "text": "PLAGUE MARINES unit only. This unit has -3\" detection range.",
      "tags": [
        "UPGRADE"
      ],
      "assignment": {
        "maxOwners": 3,
        "enhancementChoices": 1,
        "payPointsPerOwner": true
      },
      "owner": {
        "subject": "unit",
        "selector": {
          "unitIds": [
            "unit-plague-marines"
          ]
        }
      },
      "detachmentId": "detachment-flyblown-host",
      "sourceBookId": "death-guard",
      "legacyKey": "enhancement-plagueveil",
      "canonicalEnhancementId": "enhancement-plagueveil",
      "canonicalDetachmentId": "detachment-flyblown-host"
    },
    {
      "type": "enhancement",
      "id": "enhancement-rejuvenating-swarm",
      "title": "Rejuvenating Swarm - 20 pts",
      "text": "DEATH GUARD INFANTRY model only (excluding TERMINATOR models). Attacks that target this unit with a S greater than this unit’s T have -1 to wound rolls.",
      "tags": [],
      "assignment": {
        "maxOwners": 1,
        "enhancementChoices": 1,
        "payPointsPerOwner": true
      },
      "owner": {
        "subject": "model",
        "selector": {
          "allKeywords": [
            "CHARACTER",
            "DEATH GUARD",
            "INFANTRY"
          ],
          "noneKeywords": [
            "EPIC HERO",
            "TERMINATOR"
          ]
        }
      },
      "detachmentId": "detachment-paragons-of-putrescence",
      "sourceBookId": "death-guard",
      "legacyKey": "enhancement-rejuvenating-swarm",
      "canonicalEnhancementId": "enhancement-rejuvenating-swarm",
      "canonicalDetachmentId": "detachment-paragons-of-putrescence"
    },
    {
      "type": "enhancement",
      "id": "enhancement-host-of-the-hybridised-pox",
      "title": "Host of the Hybridised Pox - 40 pts",
      "text": "DEATH GUARD INFANTRY model only. (Once per battle, per army) In your Command phase, you can use this ability. If you do, select one of the Plagues listed in Nurgle’s Gift. Enemy units within Contagion Range of this unit also have the effect of that Plague in addition to your army’s chosen Plague until the end of the battle.",
      "tags": [],
      "assignment": {
        "maxOwners": 1,
        "enhancementChoices": 1,
        "payPointsPerOwner": true
      },
      "owner": {
        "subject": "model",
        "selector": {
          "allKeywords": [
            "CHARACTER",
            "DEATH GUARD",
            "INFANTRY"
          ],
          "noneKeywords": [
            "EPIC HERO"
          ]
        }
      },
      "detachmentId": "detachment-paragons-of-putrescence",
      "sourceBookId": "death-guard",
      "legacyKey": "enhancement-host-of-the-hybridised-pox",
      "canonicalEnhancementId": "enhancement-host-of-the-hybridised-pox",
      "canonicalDetachmentId": "detachment-paragons-of-putrescence"
    }
  ],
  "effectContracts": [
    {
      "canonicalRecordId": "biologus-putrifier-ability-foul-infusion",
      "sourceKind": "datasheet-ability",
      "sourceBookId": "death-guard",
      "effectiveBookIds": [
        "death-guard"
      ],
      "sourceUnitId": "unit-biologus-putrifier",
      "scope": "attached-unit",
      "selector": {
        "kind": "attached-source-unit",
        "sourceUnitId": "unit-biologus-putrifier"
      },
      "clauses": [
        {
          "selector": {
            "subject": "attached-unit",
            "weaponMode": "all"
          },
          "conditions": [],
          "operations": [
            {
              "id": "foul-infusion-weapons",
              "type": "WEAPON_TAG_GRANT",
              "canonicalTarget": "all",
              "parameters": {
                "tag": "LETHAL HITS",
                "termId": "core-lethal-hits"
              }
            },
            {
              "id": "canonical-ability-foul-infusion-490467e",
              "type": "CANONICAL_REFERENCE",
              "canonicalTarget": "biologus-putrifier-ability-foul-infusion",
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
        "sourceId": "death-guard-codex-transcription",
        "locator": "content/death-guard-rules.en.json#biologus-putrifier-ability-foul-infusion"
      },
      "confidence": "SOURCE_LIMITED"
    },
    {
      "canonicalRecordId": "deathshroud-terminators-ability-silent-bodyguard",
      "sourceKind": "datasheet-ability",
      "sourceBookId": "death-guard",
      "effectiveBookIds": [
        "death-guard"
      ],
      "sourceUnitId": "unit-deathshroud-terminators",
      "scope": "attached-leaders",
      "selector": {
        "kind": "bodyguard-unit",
        "unitIds": [
          "unit-deathshroud-terminators"
        ]
      },
      "clauses": [
        {
          "selector": {
            "subject": "attached-leader",
            "excludeSourceUnit": true
          },
          "conditions": [],
          "operations": [
            {
              "id": "silent-bodyguard",
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
      "stackingPolicy": "best-value",
      "source": {
        "sourceId": "death-guard-codex-transcription",
        "locator": "content/death-guard-rules.en.json#deathshroud-terminators-ability-silent-bodyguard"
      },
      "confidence": "SOURCE_LIMITED"
    },
    {
      "canonicalRecordId": "foul-blightspawn-ability-blinding-spray",
      "sourceKind": "datasheet-ability",
      "sourceBookId": "death-guard",
      "effectiveBookIds": [
        "death-guard"
      ],
      "sourceUnitId": "unit-foul-blightspawn",
      "scope": "attached-unit",
      "selector": {
        "kind": "attached-source-unit",
        "sourceUnitId": "unit-foul-blightspawn"
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
              "id": "canonical-ability-blinding-spray-7d189f5",
              "type": "CANONICAL_REFERENCE",
              "canonicalTarget": "foul-blightspawn-ability-blinding-spray",
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
        "sourceId": "death-guard-codex-transcription",
        "locator": "content/death-guard-rules.en.json#foul-blightspawn-ability-blinding-spray"
      },
      "confidence": "SOURCE_LIMITED"
    },
    {
      "canonicalRecordId": "helbrute-ability-froth-spattered-frenzy",
      "sourceKind": "datasheet-ability",
      "sourceBookId": "death-guard",
      "effectiveBookIds": [
        "death-guard"
      ],
      "sourceUnitId": "unit-helbrute",
      "scope": "selected-physical-loadout",
      "selector": {
        "kind": "canonical-unit",
        "unitIds": [
          "unit-helbrute"
        ]
      },
      "clauses": [
        {
          "selector": {
            "subject": "unit",
            "modelCount": {
              "equals": 1,
              "requiredState": "resolved"
            },
            "physicalEquipment": {
              "kind": "weapon-family-cardinality",
              "weaponMode": "melee",
              "excludeProfileIds": [
                "helbrute-weapon-close-combat-weapon"
              ],
              "equals": 2,
              "requireResolvedLoadout": true,
              "requireDistinctPhysicalItems": true,
              "target": "selected-profile-ids"
            }
          },
          "conditions": [],
          "operations": [
            {
              "id": "froth-spattered-frenzy",
              "type": "WEAPON_CHARACTERISTIC_ADD",
              "canonicalTarget": "selected-physical-melee-profiles",
              "parameters": {
                "characteristic": "A",
                "value": 2
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
        "sourceId": "death-guard-codex-transcription",
        "locator": "content/death-guard-rules.en.json#helbrute-ability-froth-spattered-frenzy"
      },
      "confidence": "SOURCE_LIMITED"
    },
    {
      "canonicalRecordId": "icon-bearer-ability-unclean-icon",
      "sourceKind": "datasheet-ability",
      "sourceBookId": "death-guard",
      "effectiveBookIds": [
        "death-guard"
      ],
      "sourceUnitId": "unit-icon-bearer",
      "scope": "attached-unit",
      "selector": {
        "kind": "attached-source-unit",
        "sourceUnitId": "unit-icon-bearer"
      },
      "clauses": [
        {
          "selector": {
            "subject": "attached-unit"
          },
          "conditions": [],
          "operations": [
            {
              "id": "unclean-icon",
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
        "sourceId": "death-guard-codex-transcription",
        "locator": "content/death-guard-rules.en.json#icon-bearer-ability-unclean-icon"
      },
      "confidence": "SOURCE_LIMITED"
    },
    {
      "canonicalRecordId": "lord-of-contagion-ability-vector-of-disease",
      "sourceKind": "datasheet-ability",
      "sourceBookId": "death-guard",
      "effectiveBookIds": [
        "death-guard"
      ],
      "sourceUnitId": "unit-lord-of-contagion",
      "scope": "attached-unit",
      "selector": {
        "kind": "attached-source-unit",
        "sourceUnitId": "unit-lord-of-contagion"
      },
      "clauses": [
        {
          "selector": {
            "subject": "attached-unit",
            "weaponMode": "melee"
          },
          "conditions": [],
          "operations": [
            {
              "id": "vector-sustained",
              "type": "WEAPON_TAG_GRANT",
              "canonicalTarget": "melee",
              "parameters": {
                "tag": "SUSTAINED HITS 1",
                "termId": "core-sustained-hits"
              }
            },
            {
              "id": "vector-lance",
              "type": "WEAPON_TAG_GRANT",
              "canonicalTarget": "melee",
              "parameters": {
                "tag": "LANCE",
                "termId": "core-lance"
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
        "sourceId": "death-guard-codex-transcription",
        "locator": "content/death-guard-rules.en.json#lord-of-contagion-ability-vector-of-disease"
      },
      "confidence": "SOURCE_LIMITED"
    },
    {
      "canonicalRecordId": "lord-of-poxes-ability-gift-of-poxes",
      "sourceKind": "datasheet-ability",
      "sourceBookId": "death-guard",
      "effectiveBookIds": [
        "death-guard"
      ],
      "sourceUnitId": "unit-lord-of-poxes",
      "scope": "source-model",
      "selector": {
        "kind": "source-datasheet-ability",
        "sourceUnitId": "unit-lord-of-poxes"
      },
      "clauses": [
        {
          "selector": {},
          "conditions": [],
          "operations": [
            {
              "id": "gift-of-poxes-contagion-range",
              "type": "CHARACTERISTIC_ADD",
              "canonicalTarget": "Contagion Range",
              "parameters": {
                "value": 3,
                "maximum": 12,
                "modifierOnly": true
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
        "sourceId": "death-guard-waha-11e-current-2026-09-25",
        "locator": "sources/waha-11e-current-2026-09-25/corpus.json#lord-of-poxes-ability-gift-of-poxes"
      },
      "confidence": "VERIFIED_FROZEN"
    },
    {
      "canonicalRecordId": "lord-of-poxes-ability-shroud-of-disease",
      "sourceKind": "datasheet-ability",
      "sourceBookId": "death-guard",
      "effectiveBookIds": [
        "death-guard"
      ],
      "sourceUnitId": "unit-lord-of-poxes",
      "scope": "attached-unit",
      "selector": {
        "kind": "attached-source-unit",
        "sourceUnitId": "unit-lord-of-poxes"
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
              "id": "canonical-ability-shroud-of-disease-90475da",
              "type": "CANONICAL_REFERENCE",
              "canonicalTarget": "lord-of-poxes-ability-shroud-of-disease",
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
        "sourceId": "death-guard-codex-transcription",
        "locator": "content/death-guard-rules.en.json#lord-of-poxes-ability-shroud-of-disease"
      },
      "confidence": "SOURCE_LIMITED"
    },
    {
      "canonicalRecordId": "lord-of-virulence-ability-virulent-aura",
      "sourceKind": "datasheet-ability",
      "sourceBookId": "death-guard",
      "effectiveBookIds": [
        "death-guard"
      ],
      "sourceUnitId": "unit-lord-of-virulence",
      "scope": "attached-unit",
      "selector": {
        "kind": "attached-source-unit",
        "sourceUnitId": "unit-lord-of-virulence"
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
              "id": "canonical-ability-virulent-aura-c28aa51",
              "type": "CANONICAL_REFERENCE",
              "canonicalTarget": "lord-of-virulence-ability-virulent-aura",
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
        "sourceId": "death-guard-codex-transcription",
        "locator": "content/death-guard-rules.en.json#lord-of-virulence-ability-virulent-aura"
      },
      "confidence": "SOURCE_LIMITED"
    },
    {
      "canonicalRecordId": "malignant-plaguecaster-ability-gift-of-contagion-psychic",
      "sourceKind": "datasheet-ability",
      "sourceBookId": "death-guard",
      "effectiveBookIds": [
        "death-guard"
      ],
      "sourceUnitId": "unit-malignant-plaguecaster",
      "scope": "attached-unit",
      "selector": {
        "kind": "attached-source-unit",
        "sourceUnitId": "unit-malignant-plaguecaster"
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
              "id": "canonical-ability-gift-of-contagion-psychic-4fea300",
              "type": "CANONICAL_REFERENCE",
              "canonicalTarget": "malignant-plaguecaster-ability-gift-of-contagion-psychic",
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
        "sourceId": "death-guard-codex-transcription",
        "locator": "content/death-guard-rules.en.json#malignant-plaguecaster-ability-gift-of-contagion-psychic"
      },
      "confidence": "SOURCE_LIMITED"
    },
    {
      "canonicalRecordId": "noxious-blightbringer-ability-sickening-vitality",
      "sourceKind": "datasheet-ability",
      "sourceBookId": "death-guard",
      "effectiveBookIds": [
        "death-guard"
      ],
      "sourceUnitId": "unit-noxious-blightbringer",
      "scope": "attached-unit",
      "selector": {
        "kind": "attached-source-unit",
        "sourceUnitId": "unit-noxious-blightbringer"
      },
      "clauses": [
        {
          "selector": {
            "subject": "attached-unit"
          },
          "conditions": [],
          "operations": [
            {
              "id": "sickening-vitality-move",
              "type": "CHARACTERISTIC_ADD",
              "canonicalTarget": "M",
              "parameters": {
                "value": 1
              }
            },
            {
              "id": "canonical-ability-sickening-vitality-89bb5ff",
              "type": "CANONICAL_REFERENCE",
              "canonicalTarget": "noxious-blightbringer-ability-sickening-vitality",
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
        "sourceId": "death-guard-codex-transcription",
        "locator": "content/death-guard-rules.en.json#noxious-blightbringer-ability-sickening-vitality"
      },
      "confidence": "SOURCE_LIMITED"
    },
    {
      "canonicalRecordId": "plague-surgeon-ability-tainted-narthecium",
      "sourceKind": "datasheet-ability",
      "sourceBookId": "death-guard",
      "effectiveBookIds": [
        "death-guard"
      ],
      "sourceUnitId": "unit-plague-surgeon",
      "scope": "attached-unit",
      "selector": {
        "kind": "attached-source-unit",
        "sourceUnitId": "unit-plague-surgeon"
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
              "id": "canonical-ability-tainted-narthecium-01ba1bd",
              "type": "CANONICAL_REFERENCE",
              "canonicalTarget": "plague-surgeon-ability-tainted-narthecium",
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
        "sourceId": "death-guard-codex-transcription",
        "locator": "content/death-guard-rules.en.json#plague-surgeon-ability-tainted-narthecium"
      },
      "confidence": "SOURCE_LIMITED"
    },
    {
      "canonicalRecordId": "tallyman-ability-malicious-calculations",
      "sourceKind": "datasheet-ability",
      "sourceBookId": "death-guard",
      "effectiveBookIds": [
        "death-guard"
      ],
      "sourceUnitId": "unit-tallyman",
      "scope": "attached-unit",
      "selector": {
        "kind": "attached-source-unit",
        "sourceUnitId": "unit-tallyman"
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
              "id": "canonical-ability-malicious-calculations-8505f03",
              "type": "CANONICAL_REFERENCE",
              "canonicalTarget": "tallyman-ability-malicious-calculations",
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
        "sourceId": "death-guard-codex-transcription",
        "locator": "content/death-guard-rules.en.json#tallyman-ability-malicious-calculations"
      },
      "confidence": "SOURCE_LIMITED"
    },
    {
      "canonicalRecordId": "typhus-ability-the-destroyer-hive",
      "sourceKind": "datasheet-ability",
      "sourceBookId": "death-guard",
      "effectiveBookIds": [
        "death-guard"
      ],
      "sourceUnitId": "unit-typhus",
      "scope": "attached-unit",
      "selector": {
        "kind": "attached-source-unit",
        "sourceUnitId": "unit-typhus"
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
              "id": "canonical-ability-the-destroyer-hive-70f0cc1",
              "type": "CANONICAL_REFERENCE",
              "canonicalTarget": "typhus-ability-the-destroyer-hive",
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
        "sourceId": "death-guard-codex-transcription",
        "locator": "content/death-guard-rules.en.json#typhus-ability-the-destroyer-hive"
      },
      "confidence": "SOURCE_LIMITED"
    },
    {
      "canonicalRecordId": "detachment-rule-hypervirulent-strains",
      "sourceKind": "detachment-rule",
      "sourceBookId": "death-guard",
      "effectiveBookIds": [
        "death-guard"
      ],
      "detachmentId": "detachment-paragons-of-putrescence",
      "scope": "selected-detachment",
      "selector": {
        "kind": "selected-detachment",
        "detachmentId": "detachment-paragons-of-putrescence"
      },
      "clauses": [
        {
          "selector": {
            "subject": "unit",
            "allKeywords": [
              "DEATH GUARD",
              "CHARACTER"
            ]
          },
          "conditions": [],
          "operations": [
            {
              "id": "hypervirulent-strains-contagion-range",
              "type": "CHARACTERISTIC_ADD",
              "canonicalTarget": "Contagion Range",
              "parameters": {
                "value": 3,
                "maximum": 12,
                "modifierOnly": true
              }
            },
            {
              "id": "canonical-detachment-rule-hypervirulent-strains",
              "type": "CANONICAL_REFERENCE",
              "canonicalTarget": "detachment-rule-hypervirulent-strains",
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
        "sourceId": "death-guard-faction-pack-v1.2",
        "locator": "sources/death-guard-faction-pack-v1.2.pdf#page=4"
      },
      "confidence": "VERIFIED_FROZEN"
    },
    {
      "canonicalRecordId": "detachment-rule-numberless-horde",
      "sourceKind": "detachment-rule",
      "sourceBookId": "death-guard",
      "effectiveBookIds": [
        "death-guard"
      ],
      "detachmentId": "detachment-shamblerot-vectorium",
      "scope": "selected-detachment",
      "selector": {
        "kind": "selected-detachment",
        "detachmentId": "detachment-shamblerot-vectorium"
      },
      "clauses": [
        {
          "selector": {
            "subject": "unit",
            "unitIds": [
              "unit-poxwalkers"
            ]
          },
          "conditions": [],
          "operations": [
            {
              "id": "shamblerot-battleline",
              "type": "KEYWORD_GRANT",
              "canonicalTarget": "BATTLELINE",
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
        "sourceId": "death-guard-codex-transcription",
        "locator": "content/death-guard-rules.en.json#shamblerot-vectorium-rule"
      },
      "confidence": "SOURCE_LIMITED"
    },
    {
      "canonicalRecordId": "detachment-rule-warped-and-rusted-animus",
      "sourceKind": "detachment-rule",
      "sourceBookId": "death-guard",
      "effectiveBookIds": [
        "death-guard"
      ],
      "detachmentId": "detachment-contagion-engines",
      "scope": "selected-detachment",
      "selector": {
        "kind": "selected-detachment",
        "detachmentId": "detachment-contagion-engines"
      },
      "clauses": [
        {
          "selector": {
            "subject": "unit",
            "unitIds": [
              "unit-foetid-bloat-drone",
              "unit-foetid-bloat-drone-with-heavy-blight-launcher",
              "unit-helbrute",
              "unit-myphitic-blight-hauler"
            ]
          },
          "conditions": [],
          "operations": [
            {
              "id": "contagion-engine-keyword",
              "type": "KEYWORD_GRANT",
              "canonicalTarget": "CONTAGION ENGINE",
              "parameters": {}
            },
            {
              "id": "warped-and-rusted-animus",
              "type": "WEAPON_TAG_GRANT",
              "canonicalTarget": "ranged",
              "parameters": {
                "tag": "ASSAULT",
                "termId": "core-assault"
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
        "sourceId": "death-guard-faction-pack-v1.2",
        "locator": "sources/death-guard-faction-pack-v1.2.pdf#page=2"
      },
      "confidence": "VERIFIED_FROZEN"
    },
    {
      "canonicalRecordId": "enhancement-arch-contaminator",
      "sourceKind": "enhancement",
      "sourceBookId": "death-guard",
      "effectiveBookIds": [
        "death-guard"
      ],
      "detachmentId": "detachment-virulent-vectorium",
      "scope": "attached-unit",
      "selector": {
        "kind": "assigned-enhancement",
        "canonicalRecordId": "enhancement-arch-contaminator"
      },
      "clauses": [
        {
          "selector": {
            "subject": "attached-unit"
          },
          "conditions": [
            {
              "kind": "objective-controlled-by-owner",
              "state": "unknown"
            }
          ],
          "operations": [
            {
              "id": "canonical-enhancement-arch-contaminator",
              "type": "CANONICAL_REFERENCE",
              "canonicalTarget": "enhancement-arch-contaminator",
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
        "sourceId": "death-guard-codex-transcription",
        "locator": "content/death-guard-rules.en.json#enhancement-arch-contaminator"
      },
      "confidence": "SOURCE_LIMITED"
    },
    {
      "canonicalRecordId": "enhancement-beckoning-blight",
      "sourceKind": "enhancement",
      "sourceBookId": "death-guard",
      "effectiveBookIds": [
        "death-guard"
      ],
      "detachmentId": "detachment-tallyband-summoners",
      "scope": "bearer-aura",
      "selector": {
        "kind": "assigned-enhancement",
        "canonicalRecordId": "enhancement-beckoning-blight"
      },
      "clauses": [
        {
          "selector": {
            "subject": "nearby-friendly-unit",
            "allKeywords": [
              "PLAGUE LEGIONS"
            ],
            "distance": 12
          },
          "conditions": [
            {
              "kind": "setup-from-reserves",
              "state": "unknown"
            }
          ],
          "operations": [
            {
              "id": "canonical-enhancement-beckoning-blight",
              "type": "CANONICAL_REFERENCE",
              "canonicalTarget": "enhancement-beckoning-blight",
              "parameters": {
                "referenceKind": "enhancement"
              }
            }
          ]
        }
      ],
      "timingState": {
        "kind": "setup",
        "state": "unknown"
      },
      "stackingPolicy": "apply-once-per-source",
      "source": {
        "sourceId": "death-guard-codex-transcription",
        "locator": "content/death-guard-rules.en.json#enhancement-beckoning-blight"
      },
      "confidence": "SOURCE_LIMITED"
    },
    {
      "canonicalRecordId": "enhancement-bilemaw-blight",
      "sourceKind": "enhancement",
      "sourceBookId": "death-guard",
      "effectiveBookIds": [
        "death-guard"
      ],
      "detachmentId": "detachment-mortarions-hammer",
      "scope": "bearer",
      "selector": {
        "kind": "assigned-enhancement",
        "canonicalRecordId": "enhancement-bilemaw-blight"
      },
      "clauses": [
        {
          "selector": {
            "subject": "bearer",
            "weaponFamilyId": "unit-malignant-plaguecaster-weapon-family-plague-wind"
          },
          "conditions": [
            {
              "kind": "phase",
              "owner": "friendly",
              "value": "shooting",
              "state": "unknown"
            }
          ],
          "operations": [
            {
              "id": "plague-wind-range",
              "type": "WEAPON_CHARACTERISTIC_ADD",
              "canonicalTarget": {
                "kind": "weapon-family",
                "id": "unit-malignant-plaguecaster-weapon-family-plague-wind"
              },
              "parameters": {
                "characteristic": "Range",
                "value": 12
              }
            }
          ]
        }
      ],
      "timingState": {
        "kind": "phase",
        "owner": "friendly",
        "value": "shooting",
        "state": "unknown"
      },
      "stackingPolicy": "apply-once-per-source",
      "source": {
        "sourceId": "death-guard-codex-transcription",
        "locator": "content/death-guard-rules.en.json#enhancement-bilemaw-blight"
      },
      "confidence": "SOURCE_LIMITED"
    },
    {
      "canonicalRecordId": "enhancement-cornucophagus",
      "sourceKind": "enhancement",
      "sourceBookId": "death-guard",
      "effectiveBookIds": [
        "death-guard"
      ],
      "detachmentId": "detachment-champions-of-contagion",
      "scope": "bearer",
      "selector": {
        "kind": "assigned-enhancement",
        "canonicalRecordId": "enhancement-cornucophagus"
      },
      "clauses": [
        {
          "selector": {
            "subject": "bearer"
          },
          "conditions": [
            {
              "kind": "battle-formation-selection",
              "state": "unknown"
            }
          ],
          "operations": [
            {
              "id": "canonical-enhancement-cornucophagus",
              "type": "CANONICAL_REFERENCE",
              "canonicalTarget": "enhancement-cornucophagus",
              "parameters": {
                "referenceKind": "enhancement"
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
        "sourceId": "death-guard-codex-transcription",
        "locator": "content/death-guard-rules.en.json#enhancement-cornucophagus"
      },
      "confidence": "SOURCE_LIMITED"
    },
    {
      "canonicalRecordId": "enhancement-daemon-weapon-of-nurgle",
      "sourceKind": "enhancement",
      "sourceBookId": "death-guard",
      "effectiveBookIds": [
        "death-guard"
      ],
      "detachmentId": "detachment-virulent-vectorium",
      "scope": "bearer",
      "selector": {
        "kind": "assigned-enhancement",
        "canonicalRecordId": "enhancement-daemon-weapon-of-nurgle"
      },
      "clauses": [
        {
          "selector": {
            "weaponMode": "melee",
            "equippedBy": "bearer"
          },
          "conditions": [],
          "operations": [
            {
              "id": "critical-hit-5",
              "type": "WEAPON_TAG_GRANT",
              "canonicalTarget": "selected-melee",
              "parameters": {
                "tag": "CRITICAL HITS 5+"
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
        "sourceId": "death-guard-codex-transcription",
        "locator": "content/death-guard-rules.en.json#enhancement-daemon-weapon-of-nurgle"
      },
      "confidence": "SOURCE_LIMITED"
    },
    {
      "canonicalRecordId": "enhancement-entropic-knell",
      "sourceKind": "enhancement",
      "sourceBookId": "death-guard",
      "effectiveBookIds": [
        "death-guard"
      ],
      "detachmentId": "detachment-tallyband-summoners",
      "scope": "bearer-aura",
      "selector": {
        "kind": "assigned-enhancement",
        "canonicalRecordId": "enhancement-entropic-knell"
      },
      "clauses": [
        {
          "selector": {
            "subject": "enemy-unit",
            "distance": 6
          },
          "conditions": [
            {
              "kind": "below-starting-strength",
              "state": "unknown"
            },
            {
              "kind": "battle-shock-step",
              "owner": "opponent",
              "state": "unknown"
            }
          ],
          "operations": [
            {
              "id": "canonical-enhancement-entropic-knell",
              "type": "CANONICAL_REFERENCE",
              "canonicalTarget": "enhancement-entropic-knell",
              "parameters": {
                "referenceKind": "enhancement"
              }
            }
          ]
        }
      ],
      "timingState": {
        "kind": "battle-shock-step",
        "owner": "opponent",
        "state": "unknown"
      },
      "stackingPolicy": "apply-once-per-source",
      "source": {
        "sourceId": "death-guard-codex-transcription",
        "locator": "content/death-guard-rules.en.json#enhancement-entropic-knell"
      },
      "confidence": "SOURCE_LIMITED"
    },
    {
      "canonicalRecordId": "enhancement-eye-of-affliction",
      "sourceKind": "enhancement",
      "sourceBookId": "death-guard",
      "effectiveBookIds": [
        "death-guard"
      ],
      "detachmentId": "detachment-mortarions-hammer",
      "scope": "attached-unit",
      "selector": {
        "kind": "assigned-enhancement",
        "canonicalRecordId": "enhancement-eye-of-affliction"
      },
      "clauses": [
        {
          "selector": {
            "subject": "attached-unit",
            "weaponMode": "ranged"
          },
          "conditions": [
            {
              "kind": "target-status",
              "canonicalTarget": "afflicted",
              "state": "unknown"
            }
          ],
          "operations": [
            {
              "id": "canonical-enhancement-eye-of-affliction",
              "type": "CANONICAL_REFERENCE",
              "canonicalTarget": "enhancement-eye-of-affliction",
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
        "sourceId": "death-guard-codex-transcription",
        "locator": "content/death-guard-rules.en.json#enhancement-eye-of-affliction"
      },
      "confidence": "SOURCE_LIMITED"
    },
    {
      "canonicalRecordId": "enhancement-face-of-death",
      "sourceKind": "enhancement",
      "sourceBookId": "death-guard",
      "effectiveBookIds": [
        "death-guard"
      ],
      "detachmentId": "detachment-death-lords-chosen",
      "scope": "attached-unit",
      "selector": {
        "kind": "assigned-enhancement",
        "canonicalRecordId": "enhancement-face-of-death"
      },
      "clauses": [
        {
          "selector": {
            "subject": "enemy-unit",
            "relationship": "engagement-range"
          },
          "conditions": [
            {
              "kind": "phase-start",
              "value": "fight",
              "state": "unknown"
            }
          ],
          "operations": [
            {
              "id": "canonical-enhancement-face-of-death",
              "type": "CANONICAL_REFERENCE",
              "canonicalTarget": "enhancement-face-of-death",
              "parameters": {
                "referenceKind": "enhancement"
              }
            }
          ]
        }
      ],
      "timingState": {
        "kind": "phase-start",
        "value": "fight",
        "state": "unknown"
      },
      "stackingPolicy": "apply-once-per-source",
      "source": {
        "sourceId": "death-guard-codex-transcription",
        "locator": "content/death-guard-rules.en.json#enhancement-face-of-death"
      },
      "confidence": "SOURCE_LIMITED"
    },
    {
      "canonicalRecordId": "enhancement-fell-harvester",
      "sourceKind": "enhancement",
      "sourceBookId": "death-guard",
      "effectiveBookIds": [
        "death-guard"
      ],
      "detachmentId": "detachment-tallyband-summoners",
      "scope": "bearer",
      "selector": {
        "kind": "assigned-enhancement",
        "canonicalRecordId": "enhancement-fell-harvester"
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
              "id": "melee-a-2",
              "type": "WEAPON_CHARACTERISTIC_ADD",
              "canonicalTarget": "melee",
              "parameters": {
                "characteristic": "A",
                "value": 2
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
        "sourceId": "death-guard-codex-transcription",
        "locator": "content/death-guard-rules.en.json#enhancement-fell-harvester"
      },
      "confidence": "SOURCE_LIMITED"
    },
    {
      "canonicalRecordId": "enhancement-final-ingredient",
      "sourceKind": "enhancement",
      "sourceBookId": "death-guard",
      "effectiveBookIds": [
        "death-guard"
      ],
      "detachmentId": "detachment-champions-of-contagion",
      "scope": "attached-unit",
      "selector": {
        "kind": "assigned-enhancement",
        "canonicalRecordId": "enhancement-final-ingredient"
      },
      "clauses": [
        {
          "selector": {
            "subject": "attached-unit"
          },
          "conditions": [
            {
              "kind": "once-per-battle",
              "state": "unknown"
            },
            {
              "kind": "destroyed-target-keyword",
              "keyword": "CHARACTER",
              "state": "unknown"
            }
          ],
          "operations": [
            {
              "id": "canonical-enhancement-final-ingredient",
              "type": "CANONICAL_REFERENCE",
              "canonicalTarget": "enhancement-final-ingredient",
              "parameters": {
                "referenceKind": "enhancement"
              }
            }
          ]
        }
      ],
      "timingState": {
        "kind": "after-fight",
        "state": "unknown"
      },
      "stackingPolicy": "apply-once-per-source",
      "source": {
        "sourceId": "death-guard-codex-transcription",
        "locator": "content/death-guard-rules.en.json#enhancement-final-ingredient"
      },
      "confidence": "SOURCE_LIMITED"
    },
    {
      "canonicalRecordId": "enhancement-furnace-of-plagues",
      "sourceKind": "enhancement",
      "sourceBookId": "death-guard",
      "effectiveBookIds": [
        "death-guard"
      ],
      "detachmentId": "detachment-virulent-vectorium",
      "scope": "bearer",
      "selector": {
        "kind": "assigned-enhancement",
        "canonicalRecordId": "enhancement-furnace-of-plagues"
      },
      "clauses": [
        {
          "selector": {
            "weaponMode": "melee",
            "equippedBy": "bearer"
          },
          "conditions": [],
          "operations": [
            {
              "id": "furnace-attacks",
              "type": "WEAPON_CHARACTERISTIC_ADD",
              "canonicalTarget": "melee",
              "parameters": {
                "characteristic": "A",
                "value": 1
              }
            },
            {
              "id": "furnace-strength",
              "type": "WEAPON_CHARACTERISTIC_ADD",
              "canonicalTarget": "melee",
              "parameters": {
                "characteristic": "S",
                "value": 1
              }
            },
            {
              "id": "furnace-devastating",
              "type": "WEAPON_TAG_GRANT",
              "canonicalTarget": "melee",
              "parameters": {
                "tag": "DEVASTATING WOUNDS",
                "termId": "core-devastating-wounds"
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
        "sourceId": "death-guard-codex-transcription",
        "locator": "content/death-guard-rules.en.json#enhancement-furnace-of-plagues"
      },
      "confidence": "SOURCE_LIMITED"
    },
    {
      "canonicalRecordId": "enhancement-helm-of-the-fly-king",
      "sourceKind": "enhancement",
      "sourceBookId": "death-guard",
      "effectiveBookIds": [
        "death-guard"
      ],
      "detachmentId": "detachment-death-lords-chosen",
      "scope": "attached-unit",
      "selector": {
        "kind": "assigned-enhancement",
        "canonicalRecordId": "enhancement-helm-of-the-fly-king"
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
              "id": "canonical-enhancement-helm-of-the-fly-king",
              "type": "CANONICAL_REFERENCE",
              "canonicalTarget": "enhancement-helm-of-the-fly-king",
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
        "sourceId": "death-guard-codex-transcription",
        "locator": "content/death-guard-rules.en.json#enhancement-helm-of-the-fly-king"
      },
      "confidence": "SOURCE_LIMITED"
    },
    {
      "canonicalRecordId": "enhancement-host-of-the-hybridised-pox",
      "sourceKind": "enhancement",
      "sourceBookId": "death-guard",
      "effectiveBookIds": [
        "death-guard"
      ],
      "detachmentId": "detachment-paragons-of-putrescence",
      "scope": "attached-unit",
      "selector": {
        "kind": "assigned-enhancement",
        "canonicalRecordId": "enhancement-host-of-the-hybridised-pox"
      },
      "clauses": [
        {
          "selector": {
            "subject": "attached-unit"
          },
          "conditions": [
            {
              "kind": "once-per-battle-per-army",
              "state": "unknown"
            },
            {
              "kind": "phase",
              "owner": "friendly",
              "value": "command",
              "state": "unknown"
            }
          ],
          "operations": [
            {
              "id": "canonical-enhancement-host-of-the-hybridised-pox",
              "type": "CANONICAL_REFERENCE",
              "canonicalTarget": "enhancement-host-of-the-hybridised-pox",
              "parameters": {
                "referenceKind": "enhancement"
              }
            }
          ]
        }
      ],
      "timingState": {
        "kind": "phase",
        "owner": "friendly",
        "value": "command",
        "state": "unknown"
      },
      "stackingPolicy": "apply-once-per-source",
      "source": {
        "sourceId": "death-guard-faction-pack-v1.2",
        "locator": "sources/death-guard-faction-pack-v1.2.pdf#page=4"
      },
      "confidence": "VERIFIED_FROZEN"
    },
    {
      "canonicalRecordId": "enhancement-insectile-murmuration",
      "sourceKind": "enhancement",
      "sourceBookId": "death-guard",
      "effectiveBookIds": [
        "death-guard"
      ],
      "detachmentId": "detachment-flyblown-host",
      "scope": "unit-upgrade",
      "selector": {
        "kind": "assigned-enhancement",
        "canonicalRecordId": "enhancement-insectile-murmuration"
      },
      "clauses": [
        {
          "selector": {
            "subject": "upgraded-unit",
            "unitIds": [
              "unit-plague-marines"
            ]
          },
          "conditions": [
            {
              "kind": "target-within-friendly-contagion-range",
              "state": "unknown"
            }
          ],
          "operations": [
            {
              "id": "canonical-enhancement-insectile-murmuration",
              "type": "CANONICAL_REFERENCE",
              "canonicalTarget": "enhancement-insectile-murmuration",
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
        "sourceId": "death-guard-faction-pack-v1.2",
        "locator": "sources/death-guard-faction-pack-v1.2.pdf#page=3"
      },
      "confidence": "VERIFIED_FROZEN"
    },
    {
      "canonicalRecordId": "enhancement-lancet-of-the-worldsore",
      "sourceKind": "enhancement",
      "sourceBookId": "death-guard",
      "effectiveBookIds": [
        "death-guard"
      ],
      "detachmentId": "detachment-contagion-engines",
      "scope": "unit-upgrade",
      "selector": {
        "kind": "assigned-enhancement",
        "canonicalRecordId": "enhancement-lancet-of-the-worldsore"
      },
      "clauses": [
        {
          "selector": {
            "subject": "upgraded-unit",
            "unitIds": [
              "unit-helbrute",
              "unit-myphitic-blight-hauler"
            ]
          },
          "conditions": [],
          "operations": [
            {
              "id": "mobile-keyword",
              "type": "KEYWORD_GRANT",
              "canonicalTarget": "MOBILE",
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
        "sourceId": "death-guard-faction-pack-v1.2",
        "locator": "sources/death-guard-faction-pack-v1.2.pdf#page=2"
      },
      "confidence": "VERIFIED_FROZEN"
    },
    {
      "canonicalRecordId": "enhancement-lord-of-the-walking-pox",
      "sourceKind": "enhancement",
      "sourceBookId": "death-guard",
      "effectiveBookIds": [
        "death-guard"
      ],
      "detachmentId": "detachment-shamblerot-vectorium",
      "scope": "attached-unit",
      "selector": {
        "kind": "assigned-enhancement",
        "canonicalRecordId": "enhancement-lord-of-the-walking-pox"
      },
      "clauses": [
        {
          "selector": {
            "subject": "attached-unit",
            "bodyguardUnitIds": [
              "unit-poxwalkers"
            ]
          },
          "conditions": [
            {
              "kind": "reserve-state",
              "value": "strategic-reserves",
              "state": "unknown"
            }
          ],
          "operations": [
            {
              "id": "canonical-enhancement-lord-of-the-walking-pox",
              "type": "CANONICAL_REFERENCE",
              "canonicalTarget": "enhancement-lord-of-the-walking-pox",
              "parameters": {
                "referenceKind": "enhancement"
              }
            }
          ]
        }
      ],
      "timingState": {
        "kind": "setup",
        "state": "unknown"
      },
      "stackingPolicy": "apply-once-per-source",
      "source": {
        "sourceId": "death-guard-codex-transcription",
        "locator": "content/death-guard-rules.en.json#enhancement-lord-of-the-walking-pox"
      },
      "confidence": "SOURCE_LIMITED"
    },
    {
      "canonicalRecordId": "enhancement-needle-of-nurgle",
      "sourceKind": "enhancement",
      "sourceBookId": "death-guard",
      "effectiveBookIds": [
        "death-guard"
      ],
      "detachmentId": "detachment-champions-of-contagion",
      "scope": "attached-unit",
      "selector": {
        "kind": "assigned-enhancement",
        "canonicalRecordId": "enhancement-needle-of-nurgle"
      },
      "clauses": [
        {
          "selector": {
            "subject": "attached-unit"
          },
          "conditions": [
            {
              "kind": "ability-use",
              "canonicalTarget": "ability-tainted-narthecium-01ba1bd",
              "state": "unknown"
            }
          ],
          "operations": [
            {
              "id": "canonical-enhancement-needle-of-nurgle",
              "type": "CANONICAL_REFERENCE",
              "canonicalTarget": "enhancement-needle-of-nurgle",
              "parameters": {
                "referenceKind": "enhancement"
              }
            }
          ]
        }
      ],
      "timingState": {
        "kind": "ability-use",
        "state": "unknown"
      },
      "stackingPolicy": "apply-once-per-source",
      "source": {
        "sourceId": "death-guard-codex-transcription",
        "locator": "content/death-guard-rules.en.json#enhancement-needle-of-nurgle"
      },
      "confidence": "SOURCE_LIMITED"
    },
    {
      "canonicalRecordId": "enhancement-parasitic-woe-reaper",
      "sourceKind": "enhancement",
      "sourceBookId": "death-guard",
      "effectiveBookIds": [
        "death-guard"
      ],
      "detachmentId": "detachment-contagion-engines",
      "scope": "unit-upgrade",
      "selector": {
        "kind": "assigned-enhancement",
        "canonicalRecordId": "enhancement-parasitic-woe-reaper"
      },
      "clauses": [
        {
          "selector": {
            "subject": "upgraded-unit"
          },
          "conditions": [
            {
              "kind": "after-fight",
              "state": "unknown"
            }
          ],
          "operations": [
            {
              "id": "canonical-enhancement-parasitic-woe-reaper",
              "type": "CANONICAL_REFERENCE",
              "canonicalTarget": "enhancement-parasitic-woe-reaper",
              "parameters": {
                "referenceKind": "enhancement"
              }
            }
          ]
        }
      ],
      "timingState": {
        "kind": "after-fight",
        "state": "unknown"
      },
      "stackingPolicy": "apply-once-per-source",
      "source": {
        "sourceId": "death-guard-faction-pack-v1.2",
        "locator": "sources/death-guard-faction-pack-v1.2.pdf#page=2"
      },
      "confidence": "VERIFIED_FROZEN"
    },
    {
      "canonicalRecordId": "enhancement-plagueveil",
      "sourceKind": "enhancement",
      "sourceBookId": "death-guard",
      "effectiveBookIds": [
        "death-guard"
      ],
      "detachmentId": "detachment-flyblown-host",
      "scope": "owner-or-attached-group",
      "selector": {
        "kind": "assigned-enhancement",
        "canonicalRecordId": "enhancement-plagueveil",
        "unitIds": [
          "unit-plague-marines"
        ]
      },
      "clauses": [
        {
          "selector": {},
          "conditions": [],
          "operations": [
            {
              "id": "plagueveil-detection-range",
              "type": "CHARACTERISTIC_ADD",
              "canonicalTarget": "Detection Range",
              "parameters": {
                "value": -3,
                "modifierOnly": true
              }
            },
            {
              "id": "canonical-enhancement-plagueveil",
              "type": "CANONICAL_REFERENCE",
              "canonicalTarget": "enhancement-plagueveil",
              "parameters": {
                "referenceKind": "enhancement"
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
        "sourceId": "death-guard-faction-pack-v1.2",
        "locator": "sources/death-guard-faction-pack-v1.2.pdf#page=3"
      },
      "confidence": "VERIFIED_FROZEN"
    },
    {
      "canonicalRecordId": "enhancement-rejuvenating-swarm",
      "sourceKind": "enhancement",
      "sourceBookId": "death-guard",
      "effectiveBookIds": [
        "death-guard"
      ],
      "detachmentId": "detachment-paragons-of-putrescence",
      "scope": "attached-unit",
      "selector": {
        "kind": "assigned-enhancement",
        "canonicalRecordId": "enhancement-rejuvenating-swarm"
      },
      "clauses": [
        {
          "selector": {
            "subject": "attached-unit"
          },
          "conditions": [
            {
              "kind": "incoming-attack-strength-greater-than-toughness",
              "state": "unknown"
            }
          ],
          "operations": [
            {
              "id": "canonical-enhancement-rejuvenating-swarm",
              "type": "CANONICAL_REFERENCE",
              "canonicalTarget": "enhancement-rejuvenating-swarm",
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
        "sourceId": "death-guard-faction-pack-v1.2",
        "locator": "sources/death-guard-faction-pack-v1.2.pdf#page=4"
      },
      "confidence": "VERIFIED_FROZEN"
    },
    {
      "canonicalRecordId": "enhancement-revolting-regeneration",
      "sourceKind": "enhancement",
      "sourceBookId": "death-guard",
      "effectiveBookIds": [
        "death-guard"
      ],
      "detachmentId": "detachment-virulent-vectorium",
      "scope": "bearer",
      "selector": {
        "kind": "assigned-enhancement",
        "canonicalRecordId": "enhancement-revolting-regeneration"
      },
      "clauses": [
        {
          "selector": {
            "subject": "bearer"
          },
          "conditions": [],
          "operations": [
            {
              "id": "revolting-regeneration",
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
        "kind": "always"
      },
      "stackingPolicy": "best-value",
      "source": {
        "sourceId": "death-guard-codex-transcription",
        "locator": "content/death-guard-rules.en.json#enhancement-revolting-regeneration"
      },
      "confidence": "SOURCE_LIMITED"
    },
    {
      "canonicalRecordId": "enhancement-shriekworm-familiar",
      "sourceKind": "enhancement",
      "sourceBookId": "death-guard",
      "effectiveBookIds": [
        "death-guard"
      ],
      "detachmentId": "detachment-mortarions-hammer",
      "scope": "attached-unit",
      "selector": {
        "kind": "assigned-enhancement",
        "canonicalRecordId": "enhancement-shriekworm-familiar"
      },
      "clauses": [
        {
          "selector": {
            "subject": "attached-unit"
          },
          "conditions": [
            {
              "kind": "once-per-battle-round",
              "state": "unknown"
            }
          ],
          "operations": [
            {
              "id": "canonical-enhancement-shriekworm-familiar",
              "type": "CANONICAL_REFERENCE",
              "canonicalTarget": "enhancement-shriekworm-familiar",
              "parameters": {
                "referenceKind": "enhancement"
              }
            }
          ]
        }
      ],
      "timingState": {
        "kind": "once-per-battle-round",
        "state": "unknown"
      },
      "stackingPolicy": "apply-once-per-source",
      "source": {
        "sourceId": "death-guard-codex-transcription",
        "locator": "content/death-guard-rules.en.json#enhancement-shriekworm-familiar"
      },
      "confidence": "SOURCE_LIMITED"
    },
    {
      "canonicalRecordId": "enhancement-sorrowsyphon",
      "sourceKind": "enhancement",
      "sourceBookId": "death-guard",
      "effectiveBookIds": [
        "death-guard"
      ],
      "detachmentId": "detachment-shamblerot-vectorium",
      "scope": "attachment-group",
      "selector": {
        "kind": "assigned-enhancement",
        "canonicalRecordId": "enhancement-sorrowsyphon"
      },
      "clauses": [
        {
          "selector": {
            "subject": "bearer",
            "bodyguardUnitIds": [
              "unit-poxwalkers"
            ],
            "weaponFamilyId": "unit-malignant-plaguecaster-weapon-family-plague-wind"
          },
          "conditions": [
            {
              "kind": "attachment-state",
              "value": "attached"
            }
          ],
          "operations": [
            {
              "id": "sorrowsyphon",
              "type": "WEAPON_CHARACTERISTIC_ADD",
              "canonicalTarget": {
                "kind": "weapon-family",
                "id": "unit-malignant-plaguecaster-weapon-family-plague-wind"
              },
              "parameters": {
                "characteristic": "D",
                "value": 1
              }
            }
          ]
        },
        {
          "selector": {
            "subject": "bodyguard",
            "unitIds": [
              "unit-poxwalkers"
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
              "id": "canonical-enhancement-sorrowsyphon",
              "type": "CANONICAL_REFERENCE",
              "canonicalTarget": "enhancement-sorrowsyphon",
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
        "sourceId": "death-guard-codex-transcription",
        "locator": "content/death-guard-rules.en.json#enhancement-sorrowsyphon"
      },
      "confidence": "SOURCE_LIMITED"
    },
    {
      "canonicalRecordId": "enhancement-talisman-of-burgeoning",
      "sourceKind": "enhancement",
      "sourceBookId": "death-guard",
      "effectiveBookIds": [
        "death-guard"
      ],
      "detachmentId": "detachment-shamblerot-vectorium",
      "scope": "attached-bodyguard",
      "selector": {
        "kind": "assigned-enhancement",
        "canonicalRecordId": "enhancement-talisman-of-burgeoning"
      },
      "clauses": [
        {
          "selector": {
            "subject": "bodyguard",
            "unitIds": [
              "unit-poxwalkers"
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
              "id": "talisman-of-burgeoning",
              "type": "CHARACTERISTIC_ADD",
              "canonicalTarget": "T",
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
        "sourceId": "death-guard-codex-transcription",
        "locator": "content/death-guard-rules.en.json#enhancement-talisman-of-burgeoning"
      },
      "confidence": "SOURCE_LIMITED"
    },
    {
      "canonicalRecordId": "enhancement-tendrilous-emissions",
      "sourceKind": "enhancement",
      "sourceBookId": "death-guard",
      "effectiveBookIds": [
        "death-guard"
      ],
      "detachmentId": "detachment-mortarions-hammer",
      "scope": "bearer",
      "selector": {
        "kind": "assigned-enhancement",
        "canonicalRecordId": "enhancement-tendrilous-emissions"
      },
      "clauses": [
        {
          "selector": {
            "subject": "bearer"
          },
          "conditions": [
            {
              "kind": "nearby-friendly-unit",
              "allKeywords": [
                "DEATH GUARD",
                "VEHICLE"
              ],
              "distance": 3,
              "state": "unknown"
            }
          ],
          "operations": [
            {
              "id": "canonical-enhancement-tendrilous-emissions",
              "type": "CANONICAL_REFERENCE",
              "canonicalTarget": "enhancement-tendrilous-emissions",
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
        "sourceId": "death-guard-codex-transcription",
        "locator": "content/death-guard-rules.en.json#enhancement-tendrilous-emissions"
      },
      "confidence": "SOURCE_LIMITED"
    },
    {
      "canonicalRecordId": "enhancement-tome-of-bounteous-blessings",
      "sourceKind": "enhancement",
      "sourceBookId": "death-guard",
      "effectiveBookIds": [
        "death-guard"
      ],
      "detachmentId": "detachment-tallyband-summoners",
      "scope": "bearer-aura",
      "selector": {
        "kind": "assigned-enhancement",
        "canonicalRecordId": "enhancement-tome-of-bounteous-blessings"
      },
      "clauses": [
        {
          "selector": {
            "subject": "nearby-friendly-unit",
            "allKeywords": [
              "PLAGUE LEGIONS"
            ],
            "distance": 12
          },
          "conditions": [
            {
              "kind": "battle-shock-test",
              "state": "unknown"
            }
          ],
          "operations": [
            {
              "id": "canonical-enhancement-tome-of-bounteous-blessings",
              "type": "CANONICAL_REFERENCE",
              "canonicalTarget": "enhancement-tome-of-bounteous-blessings",
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
        "sourceId": "death-guard-codex-transcription",
        "locator": "content/death-guard-rules.en.json#enhancement-tome-of-bounteous-blessings"
      },
      "confidence": "SOURCE_LIMITED"
    },
    {
      "canonicalRecordId": "enhancement-vile-vigour",
      "sourceKind": "enhancement",
      "sourceBookId": "death-guard",
      "effectiveBookIds": [
        "death-guard"
      ],
      "detachmentId": "detachment-death-lords-chosen",
      "scope": "attached-unit",
      "selector": {
        "kind": "assigned-enhancement",
        "canonicalRecordId": "enhancement-vile-vigour"
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
              "id": "vile-vigour-move",
              "type": "CHARACTERISTIC_ADD",
              "canonicalTarget": "M",
              "parameters": {
                "value": 1
              }
            },
            {
              "id": "canonical-enhancement-vile-vigour",
              "type": "CANONICAL_REFERENCE",
              "canonicalTarget": "enhancement-vile-vigour",
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
        "sourceId": "death-guard-codex-transcription",
        "locator": "content/death-guard-rules.en.json#enhancement-vile-vigour"
      },
      "confidence": "SOURCE_LIMITED"
    },
    {
      "canonicalRecordId": "enhancement-visions-of-virulence",
      "sourceKind": "enhancement",
      "sourceBookId": "death-guard",
      "effectiveBookIds": [
        "death-guard"
      ],
      "detachmentId": "detachment-champions-of-contagion",
      "scope": "bearer",
      "selector": {
        "kind": "assigned-enhancement",
        "canonicalRecordId": "enhancement-visions-of-virulence"
      },
      "clauses": [
        {
          "selector": {
            "subject": "bearer"
          },
          "conditions": [
            {
              "kind": "target-status",
              "canonicalTarget": "enfeebled",
              "state": "unknown"
            }
          ],
          "operations": [
            {
              "id": "canonical-enhancement-visions-of-virulence",
              "type": "CANONICAL_REFERENCE",
              "canonicalTarget": "enhancement-visions-of-virulence",
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
        "sourceId": "death-guard-codex-transcription",
        "locator": "content/death-guard-rules.en.json#enhancement-visions-of-virulence"
      },
      "confidence": "SOURCE_LIMITED"
    },
    {
      "canonicalRecordId": "enhancement-warprot-talisman",
      "sourceKind": "enhancement",
      "sourceBookId": "death-guard",
      "effectiveBookIds": [
        "death-guard"
      ],
      "detachmentId": "detachment-death-lords-chosen",
      "scope": "attached-unit",
      "selector": {
        "kind": "assigned-enhancement",
        "canonicalRecordId": "enhancement-warprot-talisman"
      },
      "clauses": [
        {
          "selector": {
            "subject": "attached-unit"
          },
          "conditions": [
            {
              "kind": "once-per-battle",
              "state": "unknown"
            },
            {
              "kind": "not-in-engagement-range",
              "state": "unknown"
            }
          ],
          "operations": [
            {
              "id": "canonical-enhancement-warprot-talisman",
              "type": "CANONICAL_REFERENCE",
              "canonicalTarget": "enhancement-warprot-talisman",
              "parameters": {
                "referenceKind": "enhancement"
              }
            }
          ]
        }
      ],
      "timingState": {
        "kind": "turn-end",
        "owner": "opponent",
        "state": "unknown"
      },
      "stackingPolicy": "apply-once-per-source",
      "source": {
        "sourceId": "death-guard-codex-transcription",
        "locator": "content/death-guard-rules.en.json#enhancement-warprot-talisman"
      },
      "confidence": "SOURCE_LIMITED"
    },
    {
      "canonicalRecordId": "enhancement-witherbone-pipes",
      "sourceKind": "enhancement",
      "sourceBookId": "death-guard",
      "effectiveBookIds": [
        "death-guard"
      ],
      "detachmentId": "detachment-shamblerot-vectorium",
      "scope": "attached-unit",
      "selector": {
        "kind": "assigned-enhancement",
        "canonicalRecordId": "enhancement-witherbone-pipes"
      },
      "clauses": [
        {
          "selector": {
            "subject": "attached-unit",
            "bodyguardUnitIds": [
              "unit-poxwalkers"
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
              "id": "witherbone-pipes-oc",
              "type": "CHARACTERISTIC_ADD",
              "canonicalTarget": "OC",
              "parameters": {
                "value": 1
              }
            },
            {
              "id": "canonical-enhancement-witherbone-pipes",
              "type": "CANONICAL_REFERENCE",
              "canonicalTarget": "enhancement-witherbone-pipes",
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
        "sourceId": "death-guard-codex-transcription",
        "locator": "content/death-guard-rules.en.json#enhancement-witherbone-pipes"
      },
      "confidence": "SOURCE_LIMITED"
    },
    {
      "canonicalRecordId": "plague-drones-ability-instrument-of-chaos",
      "sourceKind": "wargear-ability",
      "sourceBookId": "death-guard",
      "effectiveBookIds": [
        "death-guard"
      ],
      "sourceUnitId": "unit-plague-drones",
      "scope": "selected-wargear",
      "selector": {
        "kind": "selected-canonical-wargear-ability",
        "canonicalTargetIds": [
          "plague-drones-ability-instrument-of-chaos"
        ]
      },
      "clauses": [
        {
          "selector": {
            "subject": "unit"
          },
          "conditions": [],
          "operations": [
            {
              "id": "canonical-plague-drones-ability-instrument-of-chaos",
              "type": "CANONICAL_REFERENCE",
              "canonicalTarget": "plague-drones-ability-instrument-of-chaos",
              "parameters": {
                "referenceKind": "ability"
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
        "sourceId": "death-guard-codex-transcription",
        "locator": "content/death-guard-rules.en.json#plague-drones-ability-instrument-of-chaos"
      },
      "confidence": "SOURCE_LIMITED"
    },
    {
      "canonicalRecordId": "plaguebearers-ability-instrument-of-chaos",
      "sourceKind": "wargear-ability",
      "sourceBookId": "death-guard",
      "effectiveBookIds": [
        "death-guard"
      ],
      "sourceUnitId": "unit-plaguebearers",
      "scope": "selected-wargear",
      "selector": {
        "kind": "selected-canonical-wargear-ability",
        "canonicalTargetIds": [
          "plaguebearers-ability-instrument-of-chaos"
        ]
      },
      "clauses": [
        {
          "selector": {
            "subject": "unit"
          },
          "conditions": [],
          "operations": [
            {
              "id": "canonical-plaguebearers-ability-instrument-of-chaos",
              "type": "CANONICAL_REFERENCE",
              "canonicalTarget": "plaguebearers-ability-instrument-of-chaos",
              "parameters": {
                "referenceKind": "ability"
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
        "sourceId": "death-guard-codex-transcription",
        "locator": "content/death-guard-rules.en.json#plaguebearers-ability-instrument-of-chaos"
      },
      "confidence": "SOURCE_LIMITED"
    },
    {
      "canonicalRecordId": "wargear-ability-daemonic-icon",
      "sourceKind": "wargear-ability",
      "sourceBookId": "death-guard",
      "effectiveBookIds": [
        "death-guard"
      ],
      "scope": "selected-wargear",
      "selector": {
        "kind": "selected-canonical-wargear-ability",
        "canonicalTargetIds": [
          "plague-drones-ability-daemonic-icon",
          "plaguebearers-ability-daemonic-icon"
        ],
        "sourceUnitIds": [
          "unit-plague-drones",
          "unit-plaguebearers"
        ]
      },
      "clauses": [
        {
          "selector": {
            "subject": "unit"
          },
          "conditions": [],
          "operations": [
            {
              "id": "daemonic-icon",
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
        "kind": "while-selected"
      },
      "stackingPolicy": "set-exact",
      "source": {
        "sourceId": "death-guard-codex-transcription",
        "locator": "content/death-guard-rules.en.json#daemonic-icon"
      },
      "confidence": "SOURCE_LIMITED"
    }
  ]
});
window.WH_BOOK_ROSTER_ENHANCEMENTS=Object.freeze({});

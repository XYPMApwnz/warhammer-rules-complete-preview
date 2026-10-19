/** Reviewed book-owned lowering only. Facts remain in generated/effective.json. */
// Typed numeric parts are ready, but are not executable without a confirmed
// selection of ONE physical weapon on the exact Enhancement bearer.
export const pendingPhysicalBindings=[
  {ruleId:'detachment-experimental-prototype-cadre:enhancement:1',ownerId:'detachment-experimental-prototype-cadre',
    field:['text'],dependency:'one-physical-weapon-choice',status:'NOT_PROVEN',
    eligibleWeaponProfileIds:['datasheet-commander-in-coldstar-battlesuit:weapon:9','datasheet-commander-in-enforcer-battlesuit:weapon:8','datasheet-crisis-starscythe-battlesuits:weapon:2'],
    operationSpecs:[{operation:'MODIFY_STAT',field:'strength',mode:'ADD',value:2},{operation:'MODIFY_STAT',field:'ap',mode:'ADD',value:-1},{operation:'MODIFY_STAT',field:'damage',mode:'ADD',value:1}]},
  {ruleId:'detachment-experimental-prototype-cadre:enhancement:2',ownerId:'detachment-experimental-prototype-cadre',
    field:['text'],dependency:'one-physical-weapon-choice',status:'NOT_PROVEN',
    eligibleWeaponProfileIds:['datasheet-commander-in-coldstar-battlesuit:weapon:8','datasheet-commander-in-enforcer-battlesuit:weapon:7','datasheet-crisis-fireknife-battlesuits:weapon:2'],
    operationSpecs:[{operation:'MODIFY_STAT',field:'strength',mode:'ADD',value:2},{operation:'MODIFY_STAT',field:'attacks',mode:'ADD',value:1},{operation:'MODIFY_STAT',field:'ap',mode:'ADD',value:-1},{operation:'MODIFY_STAT',field:'damage',mode:'ADD',value:1}]},
  {ruleId:'detachment-experimental-prototype-cadre:enhancement:3',ownerId:'detachment-experimental-prototype-cadre',
    field:['text'],dependency:'one-physical-weapon-choice',status:'NOT_PROVEN',
    eligibleWeaponProfileIds:['datasheet-commander-in-coldstar-battlesuit:weapon:1','datasheet-commander-in-enforcer-battlesuit:weapon:1'],
    operationSpecs:[{operation:'MODIFY_STAT',field:'strength',mode:'ADD',value:3},{operation:'MODIFY_STAT',field:'ap',mode:'ADD',value:-1},{operation:'MODIFY_STAT',field:'damage',mode:'ADD',value:1}]}
];
export const declarations=[
  {
    "ruleId": "datasheet-cadre-fireblade:section:1",
    "clauseId": "volley-fire",
    "ownerId": "unit-cadre-fireblade",
    "field": [
      "blocks",
      0,
      "text"
    ],
    "quote": "Volley Fire: While this model is leading a unit, add 1 to the Attacks characteristic of ranged weapons equipped by models in that unit.",
    "targetBinding": "SOURCE_UNIT",
    "targetSubject": "UNIT",
    "effects": [
      {
        "operation": "MODIFY_STAT",
        "field": "attacks",
        "mode": "ADD",
        "value": 1,
        "weaponMode": "ranged"
      }
    ],
    "leading": true
  },
  {
    "ruleId": "datasheet-commander-in-coldstar-battlesuit:section:1",
    "clauseId": "coldstar-commander",
    "ownerId": "unit-commander-in-coldstar-battlesuit",
    "field": [
      "blocks",
      0,
      "text"
    ],
    "quote": "Coldstar Commander: While this model is leading a unit, models in that unit have a Move characteristic of 12\" and ranged weapons equipped by models in that unit have the [ASSAULT] ability.",
    "targetBinding": "SOURCE_FORMED_MODELS",
    "targetSubject": "MODEL",
    "effects": [
      {
        "operation": "MODIFY_STAT",
        "field": "M",
        "mode": "SET",
        "value": 12
      },
      {
        "operation": "GRANT_WEAPON_ABILITY",
        "ability": "ASSAULT",
        "weaponMode": "ranged"
      }
    ],
    "leading": true
  },
  {
    "ruleId": "datasheet-ethereal:section:1",
    "clauseId": "failure-is-not-an-option",
    "ownerId": "unit-ethereal",
    "field": [
      "blocks",
      0,
      "text"
    ],
    "quote": "Failure Is Not an Option: While this model is leading a unit, models in that unit have the Feel No Pain 5+ ability.",
    "targetBinding": "SOURCE_FORMED_MODELS",
    "targetSubject": "MODEL",
    "effects": [
      {
        "operation": "GRANT_MODEL_ABILITY",
        "ability": {
          "name": "Feel No Pain",
          "value": 5
        }
      }
    ],
    "leading": true
  },
  {
    "ruleId": "datasheet-kroot-flesh-shaper:section:1",
    "clauseId": "ritual-butchery",
    "ownerId": "unit-kroot-flesh-shaper",
    "field": [
      "blocks",
      0,
      "text"
    ],
    "quote": "Ritual Butchery: While this model is leading a unit, melee weapons equipped by models in that unit have the [SUSTAINED HITS 1] ability.",
    "targetBinding": "SOURCE_UNIT",
    "targetSubject": "UNIT",
    "effects": [
      {
        "operation": "GRANT_WEAPON_ABILITY",
        "ability": "SUSTAINED HITS 1",
        "weaponMode": "melee"
      }
    ],
    "leading": true
  },
  {
    "ruleId": "datasheet-kroot-flesh-shaper:section:1",
    "clauseId": "rites-of-feasting-baseline",
    "ownerId": "unit-kroot-flesh-shaper",
    "field": [
      "blocks",
      1,
      "text"
    ],
    "quote": "Rites of Feasting: While this model is leading a unit, models in that unit have the Feel No Pain 6+ ability.",
    "targetBinding": "SOURCE_FORMED_MODELS",
    "targetSubject": "MODEL",
    "effects": [
      {
        "operation": "GRANT_MODEL_ABILITY",
        "ability": {
          "name": "Feel No Pain",
          "value": 6
        }
      }
    ],
    "leading": true
  },
  {
    "ruleId": "datasheet-commander-in-coldstar-battlesuit:section:1",
    "clauseId": "shield-generator",
    "ownerId": "unit-commander-in-coldstar-battlesuit",
    "field": [
      "blocks",
      2,
      "text"
    ],
    "quote": "Shield Generator: The bearer has a 4+ invulnerable save.",
    "targetBinding": "SOURCE_MODEL",
    "targetSubject": "MODEL",
    "effects": [
      {
        "operation": "MODIFY_STAT",
        "field": "INSV",
        "mode": "SET",
        "value": 4
      }
    ],
    "equipment": true
  },
  {
    "ruleId": "datasheet-commander-in-enforcer-battlesuit:section:1",
    "clauseId": "shield-generator",
    "ownerId": "unit-commander-in-enforcer-battlesuit",
    "field": [
      "blocks",
      2,
      "text"
    ],
    "quote": "Shield Generator: The bearer has a 4+ invulnerable save.",
    "targetBinding": "SOURCE_MODEL",
    "targetSubject": "MODEL",
    "effects": [
      {
        "operation": "MODIFY_STAT",
        "field": "INSV",
        "mode": "SET",
        "value": 4
      }
    ],
    "equipment": true
  },
  {
    "ruleId": "datasheet-ethereal:section:1",
    "clauseId": "hover-drone",
    "ownerId": "unit-ethereal",
    "field": [
      "blocks",
      2,
      "text"
    ],
    "quote": "Hover Drone: The bearer can FLY and has a Move characteristic of 10\".",
    "targetBinding": "SOURCE_MODEL",
    "targetSubject": "MODEL",
    "effects": [
      {
        "operation": "GRANT_MODEL_KEYWORD",
        "keyword": "FLY"
      },
      {
        "operation": "MODIFY_STAT",
        "field": "M",
        "mode": "SET",
        "value": 10
      }
    ],
    "equipment": true
  },
  {
    "ruleId": "datasheet-kroot-farstalkers:section:1",
    "clauseId": "pechra",
    "ownerId": "unit-kroot-farstalkers",
    "field": [
      "blocks",
      1,
      "text"
    ],
    "quote": "Pech’ra: Ranged weapons equipped by the bearer’s unit have the [IGNORES COVER] ability.",
    "targetBinding": "SOURCE_UNIT",
    "targetSubject": "UNIT",
    "effects": [
      {
        "operation": "GRANT_WEAPON_ABILITY",
        "ability": "IGNORES COVER",
        "weaponMode": "ranged"
      }
    ],
    "equipment": true
  },
  {
    "ruleId": "datasheet-pathfinder-team:section:1",
    "clauseId": "pulse-accelerator-drone",
    "ownerId": "unit-pathfinder-team",
    "field": [
      "blocks",
      2,
      "text"
    ],
    "quote": "Pulse Accelerator Drone: Add 6\" to the Range characteristic of pulse carbines equipped by models in the bearer’s unit.",
    "targetBinding": "SOURCE_UNIT",
    "targetSubject": "UNIT",
    "effects": [
      {
        "operation": "MODIFY_STAT",
        "field": "range",
        "mode": "ADD",
        "value": 6,
        "weaponMode": "ranged",
        "weaponIds": [
          "datasheet-pathfinder-team:weapon:4"
        ]
      }
    ],
    "equipment": true
  },
  {
    "ruleId": "datasheet-pathfinder-team:section:1",
    "clauseId": "recon-drone-infiltrators",
    "ownerId": "unit-pathfinder-team",
    "field": [
      "blocks",
      3,
      "text"
    ],
    "quote": "Recon Drone: The bearer is equipped with 1 drone burst cannon and the bearer’s unit has the Infiltrators ability.",
    "targetBinding": "SOURCE_UNIT",
    "targetSubject": "UNIT",
    "effects": [
      {
        "operation": "GRANT_ABILITY",
        "ability": {
          "canonicalId": "core-infiltrators",
          "parameters": {}
        },
        "unitScope": "FORMED"
      }
    ],
    "equipment": true
  },
  {
    "ruleId": "datasheet-tidewall-shieldline:section:1",
    "clauseId": "tidewall-defence-platform",
    "ownerId": "unit-tidewall-shieldline",
    "field": [
      "blocks",
      2,
      "text"
    ],
    "quote": "Tidewall Defence Platform: If equipped with a Tidewall defence platform, this FORTIFICATION has a Wounds characteristic of 15.",
    "targetBinding": "SOURCE_MODEL",
    "targetSubject": "MODEL",
    "effects": [
      {
        "operation": "MODIFY_STAT",
        "field": "W",
        "mode": "SET",
        "value": 15
      }
    ],
    "equipment": true
  },
  {
    "ruleId": "datasheet-ghostkeel-battlesuit:section:1",
    "clauseId": "support-system-remove-smoke",
    "ownerId": "unit-ghostkeel-battlesuit",
    "field": [
      "blocks",
      1,
      "text"
    ],
    "quote": "it loses the SMOKE keyword.",
    "targetBinding": "SOURCE_MODEL",
    "targetSubject": "MODEL",
    "effects": [
      {
        "operation": "REMOVE_KEYWORD",
        "keyword": "SMOKE"
      }
    ],
    "equipment": true
  },
  {
    "ruleId": "datasheet-tiger-shark:section:1",
    "clauseId": "transport-bay",
    "ownerId": "unit-tiger-shark",
    "field": [
      "blocks",
      1,
      "text"
    ],
    "quote": "Transport Bay: The bearer has the TRANSPORT keyword and has a transport capacity of 12 TACTICAL DRONES models.",
    "targetBinding": "SOURCE_MODEL",
    "targetSubject": "MODEL",
    "effects": [
      {
        "operation": "GRANT_MODEL_KEYWORD",
        "keyword": "TRANSPORT"
      }
    ],
    "equipment": true
  },
  {
    "ruleId": "detachment-kroot-hunting-pack:keywords",
    "clauseId": "battleline",
    "ownerId": "detachment-kroot-hunting-pack",
    "field": [
      "text"
    ],
    "quote": "If you select this Detachment, KROOT CARNIVORE units from your army have the Battleline keyword.",
    "targetBinding": "ROSTER_UNITS",
    "targetSubject": "UNIT",
    "effects": [
      {
        "operation": "GRANT_UNIT_KEYWORD",
        "keyword": "BATTLELINE",
        "unitScope": "PHYSICAL"
      }
    ],
    "targetUnitIds": [
      "unit-kroot-carnivores"
    ]
  },
  {
    "ruleId": "detachment-experimental-prototype-cadre:rule",
    "clauseId": "superior-craftsmanship",
    "ownerId": "detachment-experimental-prototype-cadre",
    "field": [
      "text"
    ],
    "quote": "Friendly BATTLESUIT CHARACTER units’ ranged attacks have +6\" R.",
    "targetBinding": "ROSTER_UNITS",
    "targetSubject": "UNIT",
    "effects": [
      {
        "operation": "MODIFY_STAT",
        "field": "range",
        "mode": "ADD",
        "value": 6,
        "weaponMode": "ranged"
      }
    ],
    "targetKeywords": [
      "BATTLESUIT",
      "CHARACTER"
    ]
  },
  {
    "ruleId": "detachment-retaliation-cadre:enhancement:1",
    "clauseId": "internal-grenade-racks",
    "ownerId": "detachment-retaliation-cadre",
    "field": [
      "text"
    ],
    "quote": "The bearer has the GRENADES keyword",
    "targetBinding": "SOURCE_MODEL",
    "targetSubject": "MODEL",
    "effects": [
      {
        "operation": "GRANT_MODEL_KEYWORD",
        "keyword": "GRENADES"
      }
    ]
  },
  {
    "ruleId": "detachment-kroot-hunting-pack:enhancement:1",
    "clauseId": "borthrod-gland",
    "ownerId": "detachment-kroot-hunting-pack",
    "field": [
      "text"
    ],
    "quote": "Kroot Flesh Shaper only. While the bearer is leading a unit, each time a model in that unit makes a melee attack, an unmodified Hit roll of 5+ scores a Critical Hit.",
    "targetBinding": "SOURCE_UNIT",
    "targetSubject": "UNIT",
    "effects": [
      {
        "operation": "MODIFY_RULE_METRIC",
        "field": "criticalHitThreshold",
        "mode": "SET",
        "value": 5,
        "weaponMode": "melee",
        "unitScope": "FORMED"
      }
    ],
    "leading": true
  },
  {
    "ruleId": "detachment-kroot-hunting-pack:enhancement:2",
    "clauseId": "kroothawk-flock",
    "ownerId": "detachment-kroot-hunting-pack",
    "field": [
      "text"
    ],
    "quote": "Ranged weapons equipped by models in the bearer’s unit have the [IGNORES COVER] ability",
    "targetBinding": "SOURCE_UNIT",
    "targetSubject": "UNIT",
    "effects": [
      {
        "operation": "GRANT_WEAPON_ABILITY",
        "ability": "IGNORES COVER",
        "weaponMode": "ranged"
      }
    ]
  },
  {
    "ruleId": "detachment-kroot-hunting-pack:enhancement:3",
    "clauseId": "nomadic-hunter",
    "ownerId": "detachment-kroot-hunting-pack",
    "field": [
      "text"
    ],
    "quote": "KROOT TRAIL SHAPER model only. While the bearer is leading a unit, add 3\" to the Move characteristic of models in that unit and ranged weapons equipped by models in that unit have the [ASSAULT] ability.",
    "targetBinding": "SOURCE_FORMED_MODELS",
    "targetSubject": "MODEL",
    "effects": [
      {
        "operation": "MODIFY_STAT",
        "field": "M",
        "mode": "ADD",
        "value": 3
      },
      {
        "operation": "GRANT_WEAPON_ABILITY",
        "ability": "ASSAULT",
        "weaponMode": "ranged"
      }
    ],
    "leading": true
  },
  {
    "ruleId": "detachment-kroot-hunting-pack:enhancement:4",
    "clauseId": "root-carved-weapons",
    "ownerId": "detachment-kroot-hunting-pack",
    "field": [
      "text"
    ],
    "quote": "Kroot War Shaper model only. All weapons equipped by the bearer have the [PRECISION] and [DEVASTATING WOUNDS] abilities.",
    "targetBinding": "SOURCE_MODEL",
    "targetSubject": "MODEL",
    "effects": [
      {
        "operation": "GRANT_WEAPON_ABILITY",
        "ability": "PRECISION"
      },
      {
        "operation": "GRANT_WEAPON_ABILITY",
        "ability": "DEVASTATING WOUNDS"
      }
    ]
  },
  {
    "ruleId": "detachment-advanced-acquisition-cadre:enhancement:1",
    "clauseId": "negation-emitters",
    "ownerId": "detachment-advanced-acquisition-cadre",
    "field": [
      "text"
    ],
    "quote": "STEALTH BATTLESUITS unit only. This unit has -3\" detection range.",
    "targetBinding": "SOURCE_UNIT",
    "targetSubject": "UNIT",
    "effects": [
      {
        "operation": "MODIFY_RULE_METRIC",
        "field": "detectionRange",
        "mode": "ADD",
        "value": -3
      }
    ]
  }
];

export const enhancementEligibility={
  "detachment-montka:enhancement:1": {
    "subject": "MODEL",
    "keywords": [
      "T’AU EMPIRE"
    ],
    "excludeAllKeywords": [
      "KROOT",
      "SHAPER"
    ],
    "eligibilityEvidence": "T’AU EMPIRE model only (excluding KROOT SHAPER models)."
  },
  "detachment-montka:enhancement:2": {
    "subject": "MODEL",
    "keywords": [
      "T’AU EMPIRE"
    ],
    "excludeAllKeywords": [
      "KROOT",
      "SHAPER"
    ],
    "eligibilityEvidence": "T’AU EMPIRE model only (excluding KROOT SHAPER models)."
  },
  "detachment-montka:enhancement:3": {
    "subject": "MODEL",
    "keywords": [
      "T’AU EMPIRE"
    ],
    "eligibilityEvidence": "T’AU EMPIRE model only."
  },
  "detachment-montka:enhancement:4": {
    "subject": "MODEL",
    "keywords": [
      "T’AU EMPIRE"
    ],
    "eligibilityEvidence": "T’AU EMPIRE model only."
  },
  "detachment-kauyon:enhancement:1": {
    "subject": "MODEL",
    "keywords": [
      "T’AU EMPIRE"
    ],
    "excludeAllKeywords": [
      "KROOT",
      "SHAPER"
    ],
    "eligibilityEvidence": "T’AU EMPIRE model only (excluding KROOT SHAPER models)."
  },
  "detachment-kauyon:enhancement:2": {
    "subject": "MODEL",
    "keywords": [
      "T’AU EMPIRE"
    ],
    "eligibilityEvidence": "T’AU EMPIRE model only."
  },
  "detachment-kauyon:enhancement:3": {
    "subject": "MODEL",
    "keywords": [
      "T’AU EMPIRE"
    ],
    "eligibilityEvidence": "T’AU EMPIRE model only."
  },
  "detachment-kauyon:enhancement:4": {
    "subject": "MODEL",
    "keywords": [
      "T’AU EMPIRE"
    ],
    "excludeAllKeywords": [
      "KROOT",
      "SHAPER"
    ],
    "eligibilityEvidence": "T’AU EMPIRE model only (excluding KROOT SHAPER models)."
  },
  "detachment-retaliation-cadre:enhancement:1": {
    "subject": "MODEL",
    "keywords": [
      "T’AU EMPIRE",
      "BATTLESUIT"
    ],
    "eligibilityEvidence": "T’AU EMPIRE BATTLESUIT model only."
  },
  "detachment-retaliation-cadre:enhancement:2": {
    "subject": "MODEL",
    "keywords": [
      "T’AU EMPIRE",
      "BATTLESUIT"
    ],
    "eligibilityEvidence": "T’AU EMPIRE BATTLESUIT model only."
  },
  "detachment-retaliation-cadre:enhancement:3": {
    "subject": "MODEL",
    "keywords": [
      "T’AU EMPIRE",
      "BATTLESUIT"
    ],
    "eligibilityEvidence": "T’AU EMPIRE BATTLESUIT model only."
  },
  "detachment-retaliation-cadre:enhancement:4": {
    "subject": "MODEL",
    "keywords": [
      "T’AU EMPIRE",
      "BATTLESUIT"
    ],
    "eligibilityEvidence": "T’AU EMPIRE BATTLESUIT model only."
  },
  "detachment-kroot-hunting-pack:enhancement:1": {
    "subject": "MODEL",
    "keywords": [
      "KROOT"
    ],
    "unitIds": [
      "unit-kroot-flesh-shaper"
    ],
    "eligibilityEvidence": "Kroot Flesh Shaper only."
  },
  "detachment-kroot-hunting-pack:enhancement:2": {
    "subject": "MODEL",
    "keywords": [
      "KROOT"
    ],
    "eligibilityEvidence": "KROOT model only."
  },
  "detachment-kroot-hunting-pack:enhancement:3": {
    "subject": "MODEL",
    "keywords": [
      "KROOT"
    ],
    "unitIds": [
      "unit-kroot-trail-shaper"
    ],
    "eligibilityEvidence": "KROOT TRAIL SHAPER model only."
  },
  "detachment-kroot-hunting-pack:enhancement:4": {
    "subject": "MODEL",
    "keywords": [
      "KROOT"
    ],
    "unitIds": [
      "unit-kroot-war-shaper"
    ],
    "eligibilityEvidence": "Kroot War Shaper model only."
  },
  "detachment-auxiliary-cadre:enhancement:1": {
    "subject": "MODEL",
    "keywords": [
      "KROOT",
      "SHAPER"
    ],
    "eligibilityEvidence": "KROOT SHAPER model only."
  },
  "detachment-auxiliary-cadre:enhancement:2": {
    "subject": "MODEL",
    "keywords": [
      "T’AU EMPIRE"
    ],
    "excludeAllKeywords": [
      "KROOT"
    ],
    "eligibilityEvidence": "T’AU EMPIRE model only (excluding KROOT models)."
  },
  "detachment-experimental-prototype-cadre:enhancement:1": {
    "subject": "MODEL",
    "keywords": [
      "BATTLESUIT"
    ],
    "eligibilityEvidence": "BATTLESUIT model only."
  },
  "detachment-experimental-prototype-cadre:enhancement:2": {
    "subject": "MODEL",
    "keywords": [
      "BATTLESUIT"
    ],
    "eligibilityEvidence": "BATTLESUIT model only."
  },
  "detachment-experimental-prototype-cadre:enhancement:3": {
    "subject": "MODEL",
    "keywords": [
      "BATTLESUIT"
    ],
    "eligibilityEvidence": "BATTLESUIT model only."
  },
  "detachment-advanced-acquisition-cadre:enhancement:1": {
    "subject": "UNIT",
    "unitIds": [
      "unit-stealth-battlesuits"
    ],
    "eligibilityEvidence": "STEALTH BATTLESUITS unit only."
  },
  "detachment-advanced-acquisition-cadre:enhancement:2": {
    "subject": "UNIT",
    "unitIds": [
      "unit-ghostkeel-battlesuit",
      "unit-pathfinder-team",
      "unit-stealth-battlesuits"
    ],
    "eligibilityEvidence": "GHOSTKEEL BATTLESUIT/PATHFINDER TEAM/STEALTH BATTLESUITS unit only."
  }
};

import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {normalizeTargetConditions} from './stratagem-target-conditions.mjs';
import {staticExclusionForOperation} from './stratagem-static-selectors.mjs';

// Source-ID declarations independently adjudicated from all 45 accepted raw
// Stratagem records. No datasheet-by-rule pair matrix or V1 correction ledger.
// A changed accepted clause requires explicit re-adjudication, rather than a
// silent reinterpretation of its selector/scope. The canonical prose stays in
// entity.data; contracts retain exact evidence quotes and field references.
// TARGET prerequisites are normalized from accepted clauses at build time;
// declarations own static selectors/effect adjudication, not a second state list.
const declarations = [
  {
    "id": "detachment-virulent-vectorium:stratagem:1",
    "sourceFingerprint": "0e458ee1983562a3eafbb4ed0409a67fcc491754ae641f89e1ec519ea1990698",
    "primary": {
      "subject": "MODEL",
      "relation": "FRIENDLY",
      "allKeywords": [
        "DEATH GUARD"
      ],
      "anyKeywordGroups": [
        [
          "VEHICLE",
          "MONSTER"
        ]
      ]
    },
    "effects": [
      {
        "roleId": "primary",
        "operation": "DEADLY_DEMISE_AUTO_ACTIVATION",
        "recipient": {
          "subject": "MODEL",
          "allKeywords": [],
          "relation": "FRIENDLY"
        },
        "conditions": []
      },
      {
        "roleId": "enemy-affected",
        "operation": "AFFLICTED",
        "recipient": {
          "subject": "UNIT",
          "allKeywords": [],
          "relation": "ENEMY"
        },
        "conditions": [
          {
            "op": "SUFFERED_MORTAL_WOUNDS_FROM_THIS_DEADLY_DEMISE",
            "context": "BATTLE_STATE_OR_TRIGGER_EVENT"
          }
        ]
      }
    ],
    "detachmentId": "detachment-virulent-vectorium",
    "cp": "1CP"
  },
  {
    "id": "detachment-virulent-vectorium:stratagem:2",
    "sourceFingerprint": "8f33577905379dcbe194326b784b19693faa89fbe16ab3196b59495c4b833606",
    "primary": {
      "subject": "UNIT",
      "relation": "FRIENDLY",
      "allKeywords": [
        "DEATH GUARD"
      ],
      "anyKeywordGroups": []
    },
    "effects": [
      {
        "roleId": "primary-models",
        "operation": "DAMAGE_REDUCTION_ON_ALLOCATED_ATTACK",
        "recipient": {
          "subject": "MODEL",
          "allKeywords": [],
          "relation": "FRIENDLY"
        },
        "conditions": [
          {
            "op": "MEMBER_OF_PRIMARY_UNIT",
            "context": "ROSTER_KNOWN"
          },
          {
            "op": "ATTACK_ALLOCATED_TO_THIS_MODEL",
            "context": "BATTLE_STATE_OR_TRIGGER_EVENT"
          }
        ]
      }
    ],
    "detachmentId": "detachment-virulent-vectorium",
    "cp": "2CP"
  },
  {
    "id": "detachment-virulent-vectorium:stratagem:3",
    "sourceFingerprint": "6b0f783fb22f2507f5a77503ffa085a2709e302b7a5b116e080d83d732bab13b",
    "primary": {
      "subject": "MODEL",
      "relation": "FRIENDLY",
      "allKeywords": [
        "DEATH GUARD",
        "WARLORD"
      ],
      "anyKeywordGroups": []
    },
    "effects": [
      {
        "roleId": "friendly-army-models",
        "operation": "CONTAGION_RANGE_PLUS_3",
        "recipient": {
          "subject": "MODEL",
          "allKeywords": [],
          "relation": "FRIENDLY"
        },
        "conditions": [
          {
            "op": "MODEL_FROM_YOUR_ARMY",
            "context": "ROSTER_KNOWN"
          }
        ]
      }
    ],
    "detachmentId": "detachment-virulent-vectorium",
    "cp": "2CP"
  },
  {
    "id": "detachment-virulent-vectorium:stratagem:4",
    "sourceFingerprint": "fa10c0fce98dad01c71922b2eccf52ffa5de68f869f58ef15b3123fe109dadee",
    "primary": {
      "subject": "MODEL",
      "relation": "FRIENDLY",
      "allKeywords": [
        "DEATH GUARD"
      ],
      "anyKeywordGroups": []
    },
    "effects": [
      {
        "roleId": "selected-enemy",
        "operation": "MORTAL_WOUNDS_BY_LOST_WOUND_DICE",
        "recipient": {
          "subject": "UNIT",
          "allKeywords": [],
          "relation": "ENEMY"
        },
        "conditions": [
          {
            "op": "WITHIN_3_OF_PRIMARY_MODEL",
            "context": "BATTLE_STATE_OR_TRIGGER_EVENT"
          }
        ]
      },
      {
        "roleId": "primary",
        "operation": "REGAIN_WOUNDS_FROM_SUCCESSFUL_DICE",
        "recipient": {
          "subject": "MODEL",
          "allKeywords": [],
          "relation": "FRIENDLY"
        },
        "conditions": []
      }
    ],
    "detachmentId": "detachment-virulent-vectorium",
    "cp": "1CP"
  },
  {
    "id": "detachment-virulent-vectorium:stratagem:5",
    "sourceFingerprint": "e9867bf2192918cbc23fad074af4e12ea5ca7b69949147fd899e3de2adbb1580",
    "primary": {
      "subject": "UNIT",
      "relation": "FRIENDLY",
      "allKeywords": [
        "DEATH GUARD",
        "CHARACTER"
      ],
      "anyKeywordGroups": []
    },
    "effects": [
      {
        "roleId": "selected-enemy",
        "operation": "RANGED_ATTACK_ANCHOR",
        "recipient": {
          "subject": "UNIT",
          "allKeywords": [],
          "relation": "ENEMY"
        },
        "conditions": [
          {
            "op": "VISIBLE_TO_PRIMARY_UNIT",
            "context": "BATTLE_STATE_OR_TRIGGER_EVENT"
          }
        ]
      },
      {
        "roleId": "friendly-beneficiary",
        "operation": "REROLL_RANDOM_WEAPON_ATTACK_COUNT",
        "recipient": {
          "subject": "UNIT",
          "allKeywords": [
            "DEATH GUARD"
          ],
          "relation": "FRIENDLY"
        },
        "conditions": [
          {
            "op": "SELECTS_ANCHORED_ENEMY_AS_RANGED_ATTACK_TARGET",
            "context": "BATTLE_STATE_OR_TRIGGER_EVENT"
          }
        ]
      }
    ],
    "detachmentId": "detachment-virulent-vectorium",
    "cp": "1CP"
  },
  {
    "id": "detachment-virulent-vectorium:stratagem:6",
    "sourceFingerprint": "b20ee0f1eecfb28a56aa1dfea4d880125e694eba1e3d45179da708bdf853896e",
    "primary": {
      "subject": "UNIT",
      "relation": "FRIENDLY",
      "allKeywords": [
        "DEATH GUARD",
        "INFANTRY"
      ],
      "anyKeywordGroups": []
    },
    "effects": [
      {
        "roleId": "primary-model-attacks",
        "operation": "REROLL_HIT_AND_WOUND",
        "recipient": {
          "subject": "MODEL",
          "allKeywords": [],
          "relation": "FRIENDLY"
        },
        "conditions": [
          {
            "op": "MODEL_MEMBER_OF_PRIMARY_UNIT",
            "context": "BATTLE_STATE_OR_TRIGGER_EVENT"
          },
          {
            "op": "RANGED_ATTACK_TARGET_IS_AFFLICTED_ENEMY_UNIT",
            "context": "BATTLE_STATE_OR_TRIGGER_EVENT"
          }
        ]
      }
    ],
    "detachmentId": "detachment-virulent-vectorium",
    "cp": "1CP"
  },
  {
    "id": "detachment-mortarions-hammer:stratagem:1",
    "sourceFingerprint": "ec316d86f45daa4fe6abc07caddcc44927c0145af9aa54ded398e26e7da6d4fc",
    "primary": {
      "subject": "UNIT",
      "relation": "FRIENDLY",
      "allKeywords": [
        "DEATH GUARD",
        "VEHICLE"
      ],
      "anyKeywordGroups": []
    },
    "effects": [
      {
        "roleId": "selected-terrain",
        "operation": "AFFLICTED_ANCHOR",
        "recipient": {
          "subject": "TERRAIN_FEATURE",
          "allKeywords": [],
          "relation": "NEUTRAL_ANCHOR"
        },
        "conditions": [
          {
            "op": "WITHIN_24_OF_PRIMARY",
            "context": "BATTLE_STATE_OR_TRIGGER_EVENT"
          },
          {
            "op": "VISIBLE_TO_PRIMARY",
            "context": "BATTLE_STATE_OR_TRIGGER_EVENT"
          }
        ]
      },
      {
        "roleId": "enemy-affected",
        "operation": "AFFLICTED",
        "recipient": {
          "subject": "UNIT",
          "allKeywords": [],
          "relation": "ENEMY"
        },
        "conditions": [
          {
            "op": "WITHIN_3_OF_SELECTED_TERRAIN",
            "context": "BATTLE_STATE_OR_TRIGGER_EVENT"
          }
        ]
      }
    ],
    "detachmentId": "detachment-mortarions-hammer",
    "cp": "2CP"
  },
  {
    "id": "detachment-mortarions-hammer:stratagem:2",
    "sourceFingerprint": "af61ef896bd007269d21f061c37aeb6da8d088bb0276e2c7128e820c14c9231e",
    "primary": {
      "subject": "UNIT",
      "relation": "FRIENDLY",
      "allKeywords": [
        "DEATH GUARD",
        "VEHICLE"
      ],
      "anyKeywordGroups": []
    },
    "effects": [
      {
        "roleId": "primary",
        "operation": "MOVE_HORIZONTALLY_THROUGH_TERRAIN",
        "recipient": {
          "subject": "UNIT",
          "allKeywords": [],
          "relation": "FRIENDLY"
        },
        "conditions": [
          {
            "op": "NORMAL_ADVANCE_OR_CHARGE_MOVE",
            "context": "BATTLE_STATE_OR_TRIGGER_EVENT"
          }
        ]
      }
    ],
    "detachmentId": "detachment-mortarions-hammer",
    "cp": "1CP"
  },
  {
    "id": "detachment-mortarions-hammer:stratagem:3",
    "sourceFingerprint": "510026203de0afc2a887979f85e849c1ab81f01365e2ffc416bf2ee48d3d6f11",
    "primary": {
      "subject": "UNIT",
      "relation": "FRIENDLY",
      "allKeywords": [
        "DEATH GUARD"
      ],
      "anyKeywordGroups": []
    },
    "effects": [
      {
        "roleId": "primary-model-attacks",
        "operation": "REROLL_HIT",
        "recipient": {
          "subject": "MODEL",
          "allKeywords": [],
          "relation": "FRIENDLY"
        },
        "conditions": [
          {
            "op": "MEMBER_OF_PRIMARY_UNIT",
            "context": "ROSTER_KNOWN"
          },
          {
            "op": "VISIBLE_ENEMY_ATTACK_TARGET",
            "context": "BATTLE_STATE_OR_TRIGGER_EVENT"
          },
          {
            "op": "ENEMY_TARGET_EXCLUDES_AIRCRAFT",
            "context": "STATIC_IDENTITY"
          },
          {
            "op": "ENEMY_TARGET_IN_OPPONENT_DEPLOYMENT_ZONE",
            "context": "BATTLE_STATE_OR_TRIGGER_EVENT"
          }
        ]
      }
    ],
    "detachmentId": "detachment-mortarions-hammer",
    "cp": "1CP"
  },
  {
    "id": "detachment-mortarions-hammer:stratagem:4",
    "sourceFingerprint": "a931e9ce1af573c6f8a23586f06a79da6523cffe800ad1507eedd41706b11db5",
    "primary": {
      "subject": "UNIT",
      "relation": "FRIENDLY",
      "allKeywords": [
        "DEATH GUARD",
        "VEHICLE"
      ],
      "anyKeywordGroups": []
    },
    "effects": [
      {
        "roleId": "primary-ranged-weapons",
        "operation": "ASSAULT",
        "recipient": {
          "subject": "WEAPON",
          "allKeywords": [],
          "relation": "FRIENDLY"
        },
        "conditions": [
          {
            "op": "RANGED_WEAPON_EQUIPPED_BY_PRIMARY_UNIT_MODELS",
            "context": "BATTLE_STATE_OR_TRIGGER_EVENT"
          }
        ]
      }
    ],
    "detachmentId": "detachment-mortarions-hammer",
    "cp": "1CP"
  },
  {
    "id": "detachment-mortarions-hammer:stratagem:5",
    "sourceFingerprint": "649a643778957dcbe6712ad3d07e6e32909a59cbeedbc593cac220ff079162bc",
    "primary": {
      "subject": "UNIT",
      "relation": "FRIENDLY",
      "allKeywords": [
        "DEATH GUARD",
        "VEHICLE"
      ],
      "anyKeywordGroups": []
    },
    "effects": [
      {
        "roleId": "selected-objective",
        "operation": "BATTLE_SHOCK_ANCHOR",
        "recipient": {
          "subject": "OBJECTIVE_MARKER",
          "allKeywords": [],
          "relation": "NEUTRAL_ANCHOR"
        },
        "conditions": [
          {
            "op": "VISIBLE_TO_ONE_OR_MORE_PRIMARY_MODELS",
            "context": "BATTLE_STATE_OR_TRIGGER_EVENT"
          }
        ]
      },
      {
        "roleId": "enemy-affected",
        "operation": "BATTLE_SHOCK_AND_NO_FURTHER_PHASE_BATTLE_SHOCK",
        "recipient": {
          "subject": "UNIT",
          "allKeywords": [],
          "relation": "ENEMY"
        },
        "conditions": [
          {
            "op": "AFFLICTED",
            "context": "BATTLE_STATE_OR_TRIGGER_EVENT"
          },
          {
            "op": "WITHIN_RANGE_OF_SELECTED_OBJECTIVE",
            "context": "BATTLE_STATE_OR_TRIGGER_EVENT"
          }
        ]
      }
    ],
    "detachmentId": "detachment-mortarions-hammer",
    "cp": "1CP"
  },
  {
    "id": "detachment-mortarions-hammer:stratagem:6",
    "sourceFingerprint": "eebc9fd394f9714d7bcb2443978598f831c859c3e7a95e966353d6c6ecab095d",
    "primary": {
      "subject": "UNIT",
      "relation": "FRIENDLY",
      "allKeywords": [
        "DEATH GUARD",
        "VEHICLE"
      ],
      "anyKeywordGroups": []
    },
    "effects": [
      {
        "roleId": "selected-enemy",
        "operation": "CHARGE_ROLL_MINUS_1_ON_CHARGE_DECLARATION",
        "recipient": {
          "subject": "UNIT",
          "allKeywords": [],
          "relation": "ENEMY"
        },
        "conditions": [
          {
            "op": "VISIBLE_TO_PRIMARY",
            "context": "BATTLE_STATE_OR_TRIGGER_EVENT"
          },
          {
            "op": "WITHIN_12_OF_PRIMARY",
            "context": "BATTLE_STATE_OR_TRIGGER_EVENT"
          },
          {
            "op": "SELECTED_ENEMY_DECLARES_CHARGE",
            "context": "BATTLE_STATE_OR_TRIGGER_EVENT"
          }
        ]
      }
    ],
    "detachmentId": "detachment-mortarions-hammer",
    "cp": "1CP"
  },
  {
    "id": "detachment-champions-of-contagion:stratagem:1",
    "sourceFingerprint": "3ed00a8d5a44731b5ad60b260db5cb3a5b06a0f0d940af46940c385f2aeab557",
    "primary": {
      "subject": "FORMED_ATTACHED_UNIT",
      "relation": "FRIENDLY",
      "allKeywords": [
        "DEATH GUARD"
      ],
      "anyKeywordGroups": []
    },
    "effects": [
      {
        "roleId": "primary-model-attacks",
        "operation": "CRITICAL_HIT_ON_UNMODIFIED_5_PLUS",
        "recipient": {
          "subject": "MODEL",
          "allKeywords": [],
          "relation": "FRIENDLY"
        },
        "conditions": [
          {
            "op": "MEMBER_OF_PRIMARY_ATTACHED_UNIT",
            "context": "ROSTER_KNOWN"
          },
          {
            "op": "MAKES_ATTACK",
            "context": "BATTLE_STATE_OR_TRIGGER_EVENT"
          }
        ]
      }
    ],
    "detachmentId": "detachment-champions-of-contagion",
    "cp": "1CP"
  },
  {
    "id": "detachment-champions-of-contagion:stratagem:2",
    "sourceFingerprint": "61b3312e224172fb087793b3da70178ff4de0de319de8edc85d6871b53fd5b5a",
    "primary": {
      "subject": "FORMED_ATTACHED_UNIT",
      "relation": "FRIENDLY",
      "allKeywords": [
        "DEATH GUARD"
      ],
      "anyKeywordGroups": []
    },
    "effects": [
      {
        "roleId": "primary-model-attacks",
        "operation": "REROLL_HIT_AND_WOUND",
        "recipient": {
          "subject": "MODEL",
          "allKeywords": [],
          "relation": "FRIENDLY"
        },
        "conditions": [
          {
            "op": "MEMBER_OF_PRIMARY_ATTACHED_UNIT",
            "context": "ROSTER_KNOWN"
          },
          {
            "op": "ENEMY_ATTACK_TARGET_BELOW_STARTING_STRENGTH",
            "context": "BATTLE_STATE_OR_TRIGGER_EVENT"
          }
        ]
      }
    ],
    "detachmentId": "detachment-champions-of-contagion",
    "cp": "2CP"
  },
  {
    "id": "detachment-champions-of-contagion:stratagem:3",
    "sourceFingerprint": "478fe1c3d81a427e4fde0854f18f1b1189aba15c7716e10ca40667ef836e04f8",
    "primary": {
      "subject": "FORMED_ATTACHED_UNIT",
      "relation": "FRIENDLY",
      "allKeywords": [
        "DEATH GUARD"
      ],
      "anyKeywordGroups": []
    },
    "effects": [
      {
        "roleId": "primary-models",
        "operation": "TOUGHNESS_PLUS_2",
        "recipient": {
          "subject": "MODEL",
          "allKeywords": [],
          "relation": "FRIENDLY"
        },
        "conditions": [
          {
            "op": "MEMBER_OF_PRIMARY_ATTACHED_UNIT",
            "context": "ROSTER_KNOWN"
          }
        ]
      }
    ],
    "detachmentId": "detachment-champions-of-contagion",
    "cp": "1CP"
  },
  {
    "id": "detachment-champions-of-contagion:stratagem:4",
    "sourceFingerprint": "3211f62b8545a11c67558620fc84406f4cc7f25dd202854ba101bf6f3a10543f",
    "primary": {
      "subject": "UNIT",
      "relation": "FRIENDLY",
      "allKeywords": [
        "DEATH GUARD"
      ],
      "anyKeywordGroups": []
    },
    "effects": [
      {
        "roleId": "primary",
        "operation": "FIGHTS_FIRST",
        "recipient": {
          "subject": "UNIT",
          "allKeywords": [],
          "relation": "FRIENDLY"
        },
        "conditions": []
      }
    ],
    "detachmentId": "detachment-champions-of-contagion",
    "cp": "1CP"
  },
  {
    "id": "detachment-champions-of-contagion:stratagem:5",
    "sourceFingerprint": "d7878ba331717bd56c719b3a5e68f2811907e5545528d0d01a27aa5be48557b5",
    "primary": {
      "subject": "UNIT",
      "relation": "FRIENDLY",
      "allKeywords": [
        "DEATH GUARD",
        "CHARACTER"
      ],
      "anyKeywordGroups": []
    },
    "effects": [
      {
        "roleId": "recipient-unit",
        "operation": "ATTACH_PRIMARY_AS_LEADER_AND_RECOMPUTE_STARTING_STRENGTH",
        "recipient": {
          "subject": "UNIT",
          "allKeywords": [
            "DEATH GUARD"
          ],
          "relation": "FRIENDLY"
        },
        "conditions": [
          {
            "op": "OTHER_FRIENDLY_UNIT",
            "context": "BATTLE_STATE_OR_TRIGGER_EVENT"
          },
          {
            "op": "EXCLUDES_BATTLE_SHOCKED",
            "context": "BATTLE_STATE_OR_TRIGGER_EVENT"
          },
          {
            "op": "EXCLUDES_ATTACHED_UNITS_WITH_TWO_LEADERS_OR_ONE_OF_YOUR_CHARACTER_UNITS_LEADING",
            "context": "ROSTER_KNOWN"
          },
          {
            "op": "WITHIN_2_HORIZONTAL_AND_5_VERTICAL",
            "context": "BATTLE_STATE_OR_TRIGGER_EVENT"
          },
          {
            "op": "PRIMARY_CAN_LEAD_RECIPIENT_USING_ACCEPTED_LEADER_IDENTITY",
            "context": "ROSTER_KNOWN"
          }
        ]
      }
    ],
    "detachmentId": "detachment-champions-of-contagion",
    "cp": "1CP"
  },
  {
    "id": "detachment-champions-of-contagion:stratagem:6",
    "sourceFingerprint": "0593a209ee4fe59f27ca9179107eea8a0a2447f72b1b52da23e04497538e4f78",
    "primary": {
      "subject": "UNIT",
      "relation": "FRIENDLY",
      "allKeywords": [
        "BIOLOGUS PUTRIFIER"
      ],
      "anyKeywordGroups": []
    },
    "effects": [
      {
        "roleId": "selected-enemy",
        "operation": "ALL_PLAGUE_EFFECTS",
        "recipient": {
          "subject": "UNIT",
          "allKeywords": [],
          "relation": "ENEMY"
        },
        "conditions": [
          {
            "op": "EXCLUDES_VEHICLES",
            "context": "STATIC_IDENTITY"
          },
          {
            "op": "WITHIN_8_OF_PRIMARY",
            "context": "BATTLE_STATE_OR_TRIGGER_EVENT"
          },
          {
            "op": "VISIBLE_TO_PRIMARY",
            "context": "BATTLE_STATE_OR_TRIGGER_EVENT"
          }
        ]
      }
    ],
    "detachmentId": "detachment-champions-of-contagion",
    "cp": "1CP"
  },
  {
    "id": "detachment-tallyband-summoners:stratagem:1",
    "sourceFingerprint": "c0d0fa996764f29774767e48b421f4fb985cd5e4d4fdfcab2fac324178969791",
    "primary": {
      "subject": "UNIT",
      "relation": "FRIENDLY",
      "allKeywords": [
        "NURGLINGS"
      ],
      "anyKeywordGroups": []
    },
    "effects": [
      {
        "roleId": "new-unit",
        "operation": "ADD_IDENTICAL_UNIT_FULL_STRENGTH_AND_WOUNDS_IN_STRATEGIC_RESERVES",
        "recipient": {
          "subject": "UNIT",
          "allKeywords": [
            "NURGLINGS"
          ],
          "relation": "FRIENDLY"
        },
        "conditions": [
          {
            "op": "IDENTICAL_TO_DESTROYED_PRIMARY_UNIT",
            "context": "BATTLE_STATE_OR_TRIGGER_EVENT"
          }
        ]
      }
    ],
    "detachmentId": "detachment-tallyband-summoners",
    "cp": "1CP"
  },
  {
    "id": "detachment-tallyband-summoners:stratagem:2",
    "sourceFingerprint": "abd6649ea52f81b0dc295269bca985bfdbb0fbde78c2f2f698d4d82a8f3e08f3",
    "primary": {
      "subject": "UNIT",
      "relation": "FRIENDLY",
      "allKeywords": [
        "DEATH GUARD"
      ],
      "anyKeywordGroups": []
    },
    "effects": [
      {
        "roleId": "primary-model-attacks",
        "operation": "REROLL_HIT",
        "recipient": {
          "subject": "MODEL",
          "allKeywords": [],
          "relation": "FRIENDLY"
        },
        "conditions": [
          {
            "op": "MODEL_MEMBER_OF_PRIMARY_UNIT",
            "context": "BATTLE_STATE_OR_TRIGGER_EVENT"
          },
          {
            "op": "ATTACK_TARGET_ENEMY_WITHIN_ENGAGEMENT_RANGE_OF_FRIENDLY_PLAGUE_LEGIONS_UNIT",
            "context": "BATTLE_STATE_OR_TRIGGER_EVENT"
          }
        ]
      }
    ],
    "detachmentId": "detachment-tallyband-summoners",
    "cp": "1CP"
  },
  {
    "id": "detachment-tallyband-summoners:stratagem:3",
    "sourceFingerprint": "6d62cf1f503d641d6727e2bcc8bfc20326e17e98b538a862ded9a65117d7043b",
    "primary": {
      "subject": "UNIT",
      "relation": "FRIENDLY",
      "allKeywords": [
        "PLAGUE LEGIONS"
      ],
      "anyKeywordGroups": []
    },
    "effects": [
      {
        "roleId": "primary",
        "operation": "IGNORE_ENGAGEMENT_FOR_RANGED_TARGET_SELECTION",
        "recipient": {
          "subject": "UNIT",
          "allKeywords": [],
          "relation": "FRIENDLY"
        },
        "conditions": [
          {
            "op": "ENEMIES_WITHIN_ENGAGEMENT_RANGE_OF_PRIMARY",
            "context": "BATTLE_STATE_OR_TRIGGER_EVENT"
          }
        ]
      },
      {
        "roleId": "primary",
        "operation": "MORTAL_WOUND_BACKLASH_ON_5_PLUS",
        "recipient": {
          "subject": "UNIT",
          "allKeywords": [],
          "relation": "FRIENDLY"
        },
        "conditions": [
          {
            "op": "ENEMY_MODEL_LOSES_WOUND_WHILE_ITS_UNIT_ENGAGED_WITH_PRIMARY",
            "context": "BATTLE_STATE_OR_TRIGGER_EVENT"
          },
          {
            "op": "AFTER_ATTACKING_UNIT_FINISHED_ATTACKS",
            "context": "BATTLE_STATE_OR_TRIGGER_EVENT"
          }
        ]
      }
    ],
    "detachmentId": "detachment-tallyband-summoners",
    "cp": "1CP"
  },
  {
    "id": "detachment-tallyband-summoners:stratagem:4",
    "sourceFingerprint": "6cb4d80080c7f4fa75470ab4ca8e8249dc06e1b33a428112353d77b3510faf91",
    "primary": {
      "subject": "UNIT",
      "relation": "FRIENDLY",
      "allKeywords": [
        "PLAGUE LEGIONS",
        "MONSTER"
      ],
      "anyKeywordGroups": []
    },
    "effects": [
      {
        "roleId": "primary",
        "operation": "MOVE_HORIZONTALLY_THROUGH_TERRAIN",
        "recipient": {
          "subject": "UNIT",
          "allKeywords": [],
          "relation": "FRIENDLY"
        },
        "conditions": [
          {
            "op": "PRIMARY_MAKES_NORMAL_ADVANCE_OR_CHARGE_MOVE",
            "context": "BATTLE_STATE_OR_TRIGGER_EVENT"
          }
        ]
      }
    ],
    "detachmentId": "detachment-tallyband-summoners",
    "cp": "1CP"
  },
  {
    "id": "detachment-tallyband-summoners:stratagem:5",
    "sourceFingerprint": "2ee52184600b14d3f84e87e24c03db81c0375ca046dc0bcf3c2d934283d20ca5",
    "primary": {
      "subject": "UNIT",
      "relation": "FRIENDLY",
      "allKeywords": [
        "PLAGUE LEGIONS"
      ],
      "anyKeywordGroups": []
    },
    "effects": [
      {
        "roleId": "enemy-affected",
        "operation": "AFFLICTED",
        "recipient": {
          "subject": "UNIT",
          "allKeywords": [],
          "relation": "ENEMY"
        },
        "conditions": [
          {
            "op": "WITHIN_6_OF_PRIMARY",
            "context": "BATTLE_STATE_OR_TRIGGER_EVENT"
          }
        ]
      }
    ],
    "detachmentId": "detachment-tallyband-summoners",
    "cp": "1CP"
  },
  {
    "id": "detachment-tallyband-summoners:stratagem:6",
    "sourceFingerprint": "522dcc97d602c08a6a1bd3ca449161e5c7c69c5bee130ec6c3066a931c1ee5b4",
    "primary": {
      "subject": "UNIT",
      "relation": "FRIENDLY",
      "allKeywords": [
        "PLAGUE LEGIONS"
      ],
      "anyKeywordGroups": []
    },
    "effects": [
      {
        "roleId": "enemy-affected",
        "operation": "LEADERSHIP_TEST_ON_FALL_BACK_OR_REMAIN_STATIONARY",
        "recipient": {
          "subject": "UNIT",
          "allKeywords": [],
          "relation": "ENEMY"
        },
        "conditions": [
          {
            "op": "WITHIN_ENGAGEMENT_RANGE_OF_PRIMARY",
            "context": "BATTLE_STATE_OR_TRIGGER_EVENT"
          },
          {
            "op": "SELECTED_TO_FALL_BACK",
            "context": "BATTLE_STATE_OR_TRIGGER_EVENT"
          },
          {
            "op": "FAILED_LEADERSHIP_IMPLIES_REMAIN_STATIONARY",
            "context": "BATTLE_STATE_OR_TRIGGER_EVENT"
          }
        ]
      }
    ],
    "detachmentId": "detachment-tallyband-summoners",
    "cp": "1CP"
  },
  {
    "id": "detachment-shamblerot-vectorium:stratagem:1",
    "sourceFingerprint": "a31af5fe21d33bd992f191aad21ebcdaac6ffe52ff058be59ff1d5cabc7fb359",
    "primary": {
      "subject": "UNIT",
      "relation": "FRIENDLY",
      "allKeywords": [
        "POXWALKERS"
      ],
      "anyKeywordGroups": []
    },
    "effects": [
      {
        "roleId": "attacking-enemy",
        "operation": "MORTAL_WOUNDS_AFTER_FIGHT",
        "recipient": {
          "subject": "UNIT",
          "allKeywords": [],
          "relation": "ENEMY"
        },
        "conditions": [
          {
            "op": "ORIGINAL_ATTACKER",
            "context": "BATTLE_STATE_OR_TRIGGER_EVENT"
          },
          {
            "op": "DICE_FOR_PRIMARY_MODELS_DESTROYED_BY_THOSE_ATTACKS",
            "context": "BATTLE_STATE_OR_TRIGGER_EVENT"
          }
        ]
      },
      {
        "roleId": "primary",
        "operation": "CURSE_OF_WALKING_POX_KILL_COUNT",
        "recipient": {
          "subject": "UNIT",
          "allKeywords": [],
          "relation": "FRIENDLY"
        },
        "conditions": [
          {
            "op": "PRIMARY_NOT_DESTROYED_AFTER_ATTACKER_FOUGHT",
            "context": "BATTLE_STATE_OR_TRIGGER_EVENT"
          },
          {
            "op": "ENEMY_MODELS_DESTROYED_BY_THIS_STRATAGEM",
            "context": "BATTLE_STATE_OR_TRIGGER_EVENT"
          }
        ]
      }
    ],
    "detachmentId": "detachment-shamblerot-vectorium",
    "cp": "1CP"
  },
  {
    "id": "detachment-shamblerot-vectorium:stratagem:2",
    "sourceFingerprint": "2e2edc43a9f03d418c7f077d4f14c1abea1cbed8e121e5306d450bfb27c7e031",
    "primary": {
      "subject": "UNIT",
      "relation": "FRIENDLY",
      "allKeywords": [
        "POXWALKERS"
      ],
      "anyKeywordGroups": []
    },
    "effects": [
      {
        "roleId": "selected-enemy",
        "operation": "AFFLICTED",
        "recipient": {
          "subject": "UNIT",
          "allKeywords": [],
          "relation": "ENEMY"
        },
        "conditions": [
          {
            "op": "ATTACKED_PRIMARY_UNIT_THIS_PHASE",
            "context": "BATTLE_STATE_OR_TRIGGER_EVENT"
          }
        ]
      }
    ],
    "detachmentId": "detachment-shamblerot-vectorium",
    "cp": "1CP"
  },
  {
    "id": "detachment-shamblerot-vectorium:stratagem:3",
    "sourceFingerprint": "360f2b52a01a31966756ee00be40120d42f1f7bda193337461a16f2e7e2163c2",
    "primary": {
      "subject": "UNIT",
      "relation": "FRIENDLY",
      "allKeywords": [
        "POXWALKERS"
      ],
      "anyKeywordGroups": []
    },
    "effects": [
      {
        "roleId": "primary-models",
        "operation": "MOVE_PLUS_1",
        "recipient": {
          "subject": "MODEL",
          "allKeywords": [],
          "relation": "FRIENDLY"
        },
        "conditions": [
          {
            "op": "MEMBER_OF_PRIMARY_UNIT",
            "context": "ROSTER_KNOWN"
          }
        ]
      },
      {
        "roleId": "primary-melee-weapons",
        "operation": "ATTACKS_AND_STRENGTH_PLUS_1",
        "recipient": {
          "subject": "WEAPON",
          "allKeywords": [],
          "relation": "FRIENDLY"
        },
        "conditions": [
          {
            "op": "MELEE_WEAPON_EQUIPPED_BY_PRIMARY_UNIT_MODEL",
            "context": "BATTLE_STATE_OR_TRIGGER_EVENT"
          }
        ]
      }
    ],
    "detachmentId": "detachment-shamblerot-vectorium",
    "cp": "1CP"
  },
  {
    "id": "detachment-shamblerot-vectorium:stratagem:4",
    "sourceFingerprint": "07387a7ac6fdba28f121b1aff22744b90f264c5a15da0e044a2caa585f2f8431",
    "primary": {
      "subject": "UNIT",
      "relation": "FRIENDLY",
      "allKeywords": [
        "POXWALKERS"
      ],
      "anyKeywordGroups": []
    },
    "effects": [
      {
        "roleId": "primary-models",
        "operation": "DEEP_STRIKE",
        "recipient": {
          "subject": "MODEL",
          "allKeywords": [],
          "relation": "FRIENDLY"
        },
        "conditions": [
          {
            "op": "MEMBER_OF_PRIMARY_UNIT",
            "context": "ROSTER_KNOWN"
          }
        ]
      }
    ],
    "detachmentId": "detachment-shamblerot-vectorium",
    "cp": "1CP"
  },
  {
    "id": "detachment-shamblerot-vectorium:stratagem:5",
    "sourceFingerprint": "1551046b29d524a5d04a6044c18ef58decc853b18cc6722bee514d8fe20e7014",
    "primary": {
      "subject": "UNIT",
      "relation": "FRIENDLY",
      "allKeywords": [
        "DEATH GUARD"
      ],
      "anyKeywordGroups": []
    },
    "effects": [
      {
        "roleId": "enemy-affected",
        "operation": "BATTLE_SHOCK_MINUS_1",
        "recipient": {
          "subject": "UNIT",
          "allKeywords": [],
          "relation": "ENEMY"
        },
        "conditions": [
          {
            "op": "WITHIN_ENGAGEMENT_RANGE_OF_PRIMARY",
            "context": "BATTLE_STATE_OR_TRIGGER_EVENT"
          }
        ]
      }
    ],
    "detachmentId": "detachment-shamblerot-vectorium",
    "cp": "1CP"
  },
  {
    "id": "detachment-shamblerot-vectorium:stratagem:6",
    "sourceFingerprint": "e60e5dd3a8e7d964dc319577deaf5d2d07b42aa9d407c38f419b628689bea8e4",
    "primary": {
      "subject": "UNIT",
      "relation": "FRIENDLY",
      "allKeywords": [
        "DEATH GUARD"
      ],
      "anyKeywordGroups": []
    },
    "effects": [
      {
        "roleId": "primary-model-attack",
        "operation": "REDIRECT_DAMAGE_TO_POXWALKERS_NO_SAVE",
        "recipient": {
          "subject": "ATTACK",
          "allKeywords": [],
          "relation": "FRIENDLY"
        },
        "conditions": [
          {
            "op": "ALLOCATED_TO_MODEL_IN_PRIMARY_UNIT",
            "context": "BATTLE_STATE_OR_TRIGGER_EVENT"
          },
          {
            "op": "SHIELD_VISIBLE_TO_ATTACKING_MODEL",
            "context": "BATTLE_STATE_OR_TRIGGER_EVENT"
          },
          {
            "op": "SHIELD_ELIGIBLE_TARGET_FOR_THAT_ATTACK",
            "context": "BATTLE_STATE_OR_TRIGGER_EVENT"
          }
        ]
      },
      {
        "roleId": "shield-unit",
        "operation": "DESTROY_MODELS_EQUAL_TO_ATTACK_DAMAGE",
        "recipient": {
          "subject": "UNIT",
          "allKeywords": [
            "POXWALKERS"
          ],
          "relation": "FRIENDLY"
        },
        "conditions": [
          {
            "op": "WITHIN_3_OF_PRIMARY",
            "context": "BATTLE_STATE_OR_TRIGGER_EVENT"
          },
          {
            "op": "VISIBLE_TO_PRIMARY_AND_ATTACKING_UNIT",
            "context": "BATTLE_STATE_OR_TRIGGER_EVENT"
          }
        ]
      }
    ],
    "detachmentId": "detachment-shamblerot-vectorium",
    "cp": "1CP"
  },
  {
    "id": "detachment-death-lords-chosen:stratagem:1",
    "sourceFingerprint": "bfeaac7f14458d48cfb84cd4b15490f967eeb8abb7e450a6e0c41cfdab2b807e",
    "primary": {
      "subject": "UNIT",
      "relation": "FRIENDLY",
      "allKeywords": [
        "TERMINATOR"
      ],
      "anyKeywordGroups": []
    },
    "effects": [
      {
        "roleId": "primary-models",
        "operation": "CONTAGION_RANGE_PLUS_3",
        "recipient": {
          "subject": "MODEL",
          "allKeywords": [],
          "relation": "FRIENDLY"
        },
        "conditions": [
          {
            "op": "MEMBER_OF_PRIMARY_UNIT",
            "context": "ROSTER_KNOWN"
          }
        ]
      }
    ],
    "detachmentId": "detachment-death-lords-chosen",
    "cp": "1CP"
  },
  {
    "id": "detachment-death-lords-chosen:stratagem:2",
    "sourceFingerprint": "99080953000353effdf0a39f43178d5ce40928080a6dedd057d7a4fd4bce5877",
    "primary": {
      "subject": "UNIT",
      "relation": "FRIENDLY",
      "allKeywords": [
        "TERMINATOR"
      ],
      "anyKeywordGroups": []
    },
    "effects": [
      {
        "roleId": "primary-model-attacks",
        "operation": "REROLL_HIT",
        "recipient": {
          "subject": "MODEL",
          "allKeywords": [],
          "relation": "FRIENDLY"
        },
        "conditions": [
          {
            "op": "MODEL_MEMBER_OF_PRIMARY_UNIT",
            "context": "BATTLE_STATE_OR_TRIGGER_EVENT"
          },
          {
            "op": "ENEMY_ATTACK_TARGET_EXCLUDES_MONSTER_AND_VEHICLE",
            "context": "STATIC_IDENTITY"
          }
        ]
      }
    ],
    "detachmentId": "detachment-death-lords-chosen",
    "cp": "1CP"
  },
  {
    "id": "detachment-death-lords-chosen:stratagem:3",
    "sourceFingerprint": "fd3dddedd514877cf65a6f7629804e96c3c00e51f59b264e98ed6e14ff7908d1",
    "primary": {
      "subject": "UNIT",
      "relation": "FRIENDLY",
      "allKeywords": [
        "TERMINATOR"
      ],
      "anyKeywordGroups": []
    },
    "effects": [
      {
        "roleId": "primary-destroyed-model",
        "operation": "FIGHT_ON_DEATH_ON_4_PLUS",
        "recipient": {
          "subject": "MODEL",
          "allKeywords": [],
          "relation": "FRIENDLY"
        },
        "conditions": [
          {
            "op": "MEMBER_OF_PRIMARY_UNIT",
            "context": "ROSTER_KNOWN"
          },
          {
            "op": "DESTROYED_THIS_PHASE",
            "context": "BATTLE_STATE_OR_TRIGGER_EVENT"
          },
          {
            "op": "HAS_NOT_FOUGHT_THIS_PHASE",
            "context": "BATTLE_STATE_OR_TRIGGER_EVENT"
          },
          {
            "op": "FIGHT_AFTER_ATTACKER_FINISHES_THEN_REMOVE",
            "context": "BATTLE_STATE_OR_TRIGGER_EVENT"
          }
        ]
      }
    ],
    "detachmentId": "detachment-death-lords-chosen",
    "cp": "1CP"
  },
  {
    "id": "detachment-death-lords-chosen:stratagem:4",
    "sourceFingerprint": "8503d515c022d60e51141035eae5d73836fd360fbca2947fa4cd7efbec420fe9",
    "primary": {
      "subject": "MODEL",
      "relation": "FRIENDLY",
      "allKeywords": [
        "LORD OF VIRULENCE"
      ],
      "anyKeywordGroups": []
    },
    "effects": [
      {
        "roleId": "selected-objective",
        "operation": "AFFLICTED_ANCHOR",
        "recipient": {
          "subject": "OBJECTIVE_MARKER",
          "allKeywords": [],
          "relation": "NEUTRAL_ANCHOR"
        },
        "conditions": [
          {
            "op": "WITHIN_30_OF_PRIMARY_MODEL",
            "context": "BATTLE_STATE_OR_TRIGGER_EVENT"
          },
          {
            "op": "VISIBLE_TO_PRIMARY_MODEL",
            "context": "BATTLE_STATE_OR_TRIGGER_EVENT"
          }
        ]
      },
      {
        "roleId": "enemy-affected",
        "operation": "AFFLICTED",
        "recipient": {
          "subject": "UNIT",
          "allKeywords": [],
          "relation": "ENEMY"
        },
        "conditions": [
          {
            "op": "WITHIN_RANGE_OF_SELECTED_OBJECTIVE",
            "context": "BATTLE_STATE_OR_TRIGGER_EVENT"
          }
        ]
      }
    ],
    "detachmentId": "detachment-death-lords-chosen",
    "cp": "1CP"
  },
  {
    "id": "detachment-death-lords-chosen:stratagem:5",
    "sourceFingerprint": "ce2b3509afb8fe54a377d88cd50618627e885a8431d6559333184e8064d53da5",
    "primary": {
      "subject": "UNIT",
      "relation": "FRIENDLY",
      "allKeywords": [
        "TERMINATOR"
      ],
      "anyKeywordGroups": []
    },
    "effects": [
      {
        "roleId": "primary-ranged-weapons",
        "operation": "ASSAULT_AND_HEAVY",
        "recipient": {
          "subject": "WEAPON",
          "allKeywords": [],
          "relation": "FRIENDLY"
        },
        "conditions": [
          {
            "op": "RANGED_WEAPON_EQUIPPED_BY_PRIMARY_UNIT_MODELS",
            "context": "BATTLE_STATE_OR_TRIGGER_EVENT"
          }
        ]
      }
    ],
    "detachmentId": "detachment-death-lords-chosen",
    "cp": "1CP"
  },
  {
    "id": "detachment-death-lords-chosen:stratagem:6",
    "sourceFingerprint": "faaf960ef211d8ba89db7c08a87db29276ecbd4feabd284813f2f4247f9c141f",
    "primary": {
      "subject": "UNIT",
      "relation": "FRIENDLY",
      "allKeywords": [
        "TERMINATOR"
      ],
      "anyKeywordGroups": []
    },
    "effects": [
      {
        "roleId": "selected-enemy",
        "operation": "MORTAL_WOUNDS_ON_2_PLUS_MAX_6",
        "recipient": {
          "subject": "UNIT",
          "allKeywords": [],
          "relation": "ENEMY"
        },
        "conditions": [
          {
            "op": "WITHIN_ENGAGEMENT_RANGE_OF_PRIMARY",
            "context": "BATTLE_STATE_OR_TRIGGER_EVENT"
          },
          {
            "op": "DICE_PER_PRIMARY_MODEL_WITHIN_ENGAGEMENT_RANGE_OF_SELECTED_ENEMY",
            "context": "BATTLE_STATE_OR_TRIGGER_EVENT"
          }
        ]
      }
    ],
    "detachmentId": "detachment-death-lords-chosen",
    "cp": "1CP"
  },
  {
    "id": "detachment-contagion-engines:stratagem:1",
    "sourceFingerprint": "e459ca1805d344735f7a9639a173624d17ef6df32b664a3e6e98646ab791cc66",
    "primary": {
      "subject": "UNIT",
      "relation": "FRIENDLY",
      "allKeywords": [
        "CONTAGION ENGINE"
      ],
      "anyKeywordGroups": []
    },
    "effects": [
      {
        "roleId": "primary-attacks",
        "operation": "REROLL_WOUND_1",
        "recipient": {
          "subject": "UNIT",
          "allKeywords": [],
          "relation": "FRIENDLY"
        },
        "conditions": [
          {
            "op": "ATTACKS_FROM_SELECTED_ATTACK_EVENT",
            "context": "BATTLE_STATE_OR_TRIGGER_EVENT"
          }
        ]
      }
    ],
    "detachmentId": "detachment-contagion-engines",
    "cp": "1CP"
  },
  {
    "id": "detachment-contagion-engines:stratagem:2",
    "sourceFingerprint": "204cdd2531c0aa86c1dfde73ef8e8e21f9f1f90961ec2ff8293ed4fd1bc48302",
    "primary": {
      "subject": "UNIT",
      "relation": "FRIENDLY",
      "allKeywords": [
        "CONTAGION ENGINE"
      ],
      "anyKeywordGroups": []
    },
    "effects": [
      {
        "roleId": "selected-enemy",
        "operation": "AFFLICTED",
        "recipient": {
          "subject": "UNIT",
          "allKeywords": [],
          "relation": "ENEMY"
        },
        "conditions": [
          {
            "op": "VISIBLE_ENEMY_UNIT",
            "context": "BATTLE_STATE_OR_TRIGGER_EVENT"
          }
        ]
      }
    ],
    "detachmentId": "detachment-contagion-engines",
    "cp": "1CP"
  },
  {
    "id": "detachment-contagion-engines:stratagem:3",
    "sourceFingerprint": "8df4db2551461d3e9b80da20fc57289c2e89ec3658285818cdf4264b47110060",
    "primary": {
      "subject": "UNIT",
      "relation": "FRIENDLY",
      "allKeywords": [
        "CONTAGION ENGINE"
      ],
      "anyKeywordGroups": []
    },
    "effects": [
      {
        "roleId": "triggering-enemy",
        "operation": "D6_DEPENDENT_MORTAL_WOUNDS",
        "recipient": {
          "subject": "UNIT",
          "allKeywords": [],
          "relation": "ENEMY"
        },
        "conditions": [
          {
            "op": "ENEMY_ENGAGED_WITH_PRIMARY",
            "context": "BATTLE_STATE_OR_TRIGGER_EVENT"
          },
          {
            "op": "SELECTED_TO_MAKE_FALL_BACK_MOVE",
            "context": "BATTLE_STATE_OR_TRIGGER_EVENT"
          }
        ]
      }
    ],
    "detachmentId": "detachment-contagion-engines",
    "cp": "1CP"
  },
  {
    "id": "detachment-flyblown-host:stratagem:1",
    "sourceFingerprint": "d0390763110a3c78b08cac9291ce4d2d6c9a63e99d96eee1959cd1925f2e3ad7",
    "primary": {
      "subject": "UNIT",
      "relation": "FRIENDLY",
      "allKeywords": [
        "PLAGUE MARINES"
      ],
      "anyKeywordGroups": []
    },
    "effects": [
      {
        "roleId": "selected-enemy",
        "operation": "BATTLE_SHOCK_MINUS_1",
        "recipient": {
          "subject": "UNIT",
          "allKeywords": [],
          "relation": "ENEMY"
        },
        "conditions": [
          {
            "op": "ENGAGED_WITH_PRIMARY",
            "context": "BATTLE_STATE_OR_TRIGGER_EVENT"
          }
        ]
      }
    ],
    "detachmentId": "detachment-flyblown-host",
    "cp": "1CP"
  },
  {
    "id": "detachment-flyblown-host:stratagem:2",
    "sourceFingerprint": "788ee82dbaab96be7b5e733c8d72604a3cb2bbe34437c343ca5e0d981792d9f0",
    "primary": {
      "subject": "UNIT",
      "relation": "FRIENDLY",
      "allKeywords": [
        "PLAGUE MARINES"
      ],
      "anyKeywordGroups": []
    },
    "effects": [
      {
        "roleId": "primary-ranged-attacks",
        "operation": "REROLL_HIT_1",
        "recipient": {
          "subject": "UNIT",
          "allKeywords": [],
          "relation": "FRIENDLY"
        },
        "conditions": [
          {
            "op": "SELECTED_SHOOTING_EVENT",
            "context": "BATTLE_STATE_OR_TRIGGER_EVENT"
          }
        ]
      },
      {
        "roleId": "primary-ranged-attacks",
        "operation": "REROLL_WOUND_1",
        "recipient": {
          "subject": "UNIT",
          "allKeywords": [],
          "relation": "FRIENDLY"
        },
        "conditions": [
          {
            "op": "SELECTED_SHOOTING_EVENT",
            "context": "BATTLE_STATE_OR_TRIGGER_EVENT"
          },
          {
            "op": "ENEMY_ATTACK_TARGET_WITHIN_HALF_RANGE",
            "context": "BATTLE_STATE_OR_TRIGGER_EVENT"
          }
        ]
      }
    ],
    "detachmentId": "detachment-flyblown-host",
    "cp": "1CP"
  },
  {
    "id": "detachment-flyblown-host:stratagem:3",
    "sourceFingerprint": "f00b67c5cd0c9d196b3489d5465983feb52ba068081dba412c87e9ab70c086f9",
    "primary": {
      "subject": "UNIT",
      "relation": "FRIENDLY",
      "allKeywords": [
        "PLAGUE MARINES"
      ],
      "anyKeywordGroups": []
    },
    "effects": [
      {
        "roleId": "primary-ranged-attacks",
        "operation": "CLOSE_QUARTERS",
        "recipient": {
          "subject": "UNIT",
          "allKeywords": [],
          "relation": "FRIENDLY"
        },
        "conditions": [
          {
            "op": "SELECTED_SHOOTING_EVENT",
            "context": "BATTLE_STATE_OR_TRIGGER_EVENT"
          }
        ]
      }
    ],
    "detachmentId": "detachment-flyblown-host",
    "cp": "1CP"
  },
  {
    "id": "detachment-paragons-of-putrescence:stratagem:1",
    "sourceFingerprint": "26c5f2fde7159db74d62aa52e2aee5b6e30b163bbecaa61dd5bbb90c80ec7d71",
    "primary": {
      "subject": "UNIT",
      "relation": "FRIENDLY",
      "allKeywords": [
        "DEATH GUARD",
        "CHARACTER"
      ],
      "anyKeywordGroups": []
    },
    "effects": [
      {
        "roleId": "primary",
        "operation": "OBJECTIVE_CONTROL_PLUS_1",
        "recipient": {
          "subject": "UNIT",
          "allKeywords": [],
          "relation": "FRIENDLY"
        },
        "conditions": []
      }
    ],
    "detachmentId": "detachment-paragons-of-putrescence",
    "cp": "1CP"
  },
  {
    "id": "detachment-paragons-of-putrescence:stratagem:2",
    "sourceFingerprint": "8020a526f40718ba4ff18dca898c9d02baa524f4d296b1aa131051af4f7bce76",
    "primary": {
      "subject": "UNIT",
      "relation": "FRIENDLY",
      "allKeywords": [
        "DEATH GUARD",
        "CHARACTER"
      ],
      "anyKeywordGroups": []
    },
    "effects": [
      {
        "roleId": "selected-enemy",
        "operation": "DETECTION_RANGE_PLUS_6",
        "recipient": {
          "subject": "UNIT",
          "allKeywords": [],
          "relation": "ENEMY"
        },
        "conditions": [
          {
            "op": "VISIBLE_TO_PRIMARY",
            "context": "BATTLE_STATE_OR_TRIGGER_EVENT"
          },
          {
            "op": "WITHIN_CONTAGION_RANGE_OF_PRIMARY",
            "context": "BATTLE_STATE_OR_TRIGGER_EVENT"
          }
        ]
      }
    ],
    "detachmentId": "detachment-paragons-of-putrescence",
    "cp": "1CP"
  },
  {
    "id": "detachment-paragons-of-putrescence:stratagem:3",
    "sourceFingerprint": "f7bb1ca697a62a52a9a39ed58895212678a36ed6dcbae28125b79dc18afe6405",
    "primary": {
      "subject": "UNIT",
      "relation": "FRIENDLY",
      "allKeywords": [
        "DEATH GUARD",
        "CHARACTER"
      ],
      "anyKeywordGroups": []
    },
    "effects": [
      {
        "roleId": "primary",
        "operation": "ACTION_DOES_NOT_PREVENT_SHOOTING_ELIGIBILITY",
        "recipient": {
          "subject": "UNIT",
          "allKeywords": [],
          "relation": "FRIENDLY"
        },
        "conditions": [
          {
            "op": "SAME_ACTION_STARTED_IN_TRIGGER",
            "context": "BATTLE_STATE_OR_TRIGGER_EVENT"
          }
        ]
      }
    ],
    "detachmentId": "detachment-paragons-of-putrescence",
    "cp": "1CP"
  }
];

const all = nodes => nodes.length === 1 ? nodes[0] : {op:'ALL', subject:nodes[0].subject, args:nodes};
const any = nodes => nodes.length === 1 ? nodes[0] : {op:'ANY', subject:nodes[0].subject, args:nodes};
const not = node => ({op:'NOT', subject:node.subject, args:[node]});
const fieldKey = op => op.toLowerCase().replace(/_([a-z0-9])/g, (_, c) => c.toUpperCase());

function compile(entity, spec) {
  const lines = entity.data.lines;
  assert.equal(entity.parentId, spec.detachmentId, `${entity.id}: source Detachment scope changed`);
  assert.equal(entity.data.cp, spec.cp, `${entity.id}: accepted Stratagem CP changed`);
  assert.equal(createHash('sha256').update(JSON.stringify(lines)).digest('hex'), spec.sourceFingerprint, `${entity.id}: source clauses changed; adjudication required`);
  const locate = label => {
    const index = lines.findIndex(line => line.label === label);
    assert.ok(index >= 0, `${entity.id}: missing accepted ${label}`);
    return {field:['lines', index, 'text'], quote:lines[index].text};
  };
  const target = locate('TARGET'), when = locate('WHEN'), effect = locate('EFFECT');
  const evidence = (proof, quote) => {
    assert.ok(!quote || proof.quote.includes(quote), `${entity.id}: source atom without exact evidence`);
    return {field:proof.field, quote:quote || proof.quote};
  };
  const atom = (subject, predicate, contextLevel, args, proof, quote) => ({predicate, subject, contextLevel, arguments:args, evidence:evidence(proof, quote)});
  const always = (subject, proof) => atom(subject, 'ALWAYS', 'STATIC', {}, proof);
  const contextual = (subject, key, level, value, proof) => atom(subject, 'FIELD', level, {key, equals:value}, proof);
  const keyword = (subject, value, proof) => {
    const explicit = proof.quote.includes(value) ? proof : target.quote.includes(value) ? target : when;
    assert.ok(explicit.quote.includes(value), `${entity.id}: keyword selector must have its own accepted clause evidence`);
    return atom(subject, subject === 'MODEL' ? 'MODEL_KEYWORD' : 'UNIT_KEYWORD', 'STATIC', {keyword:value}, explicit, value);
  };
  const selector = (subject, keywords, alternatives, proof) => {
    const nodes = keywords.filter(value => value !== 'WARLORD').map(value => keyword(subject, value, proof));
    for (const group of alternatives || []) nodes.push(any(group.map(value => keyword(subject, value, proof))));
    return nodes.length ? all(nodes) : always(subject, proof);
  };
  const primary = {id:'primary', subject:spec.primary.subject, allegiance:'FRIENDLY', binding:'PRIMARY_ACTOR', purpose:'PRIMARY_TARGET', selector:selector(spec.primary.subject, spec.primary.allKeywords, spec.primary.anyKeywordGroups, target), conditions:[]};
  const sourceFields = [['cp'], ['category'], ...lines.map((_, index) => ['lines', index, 'text'])];
  primary.conditions=normalizeTargetConditions({target,when,subject:primary.subject});
  const timingAtoms = [], text = when.quote;
  // Ownership is attached to each phase alternative. 'Your opponent's Shooting
  // phase or the Fight phase' permits Fight in either player's turn; a global
  // opponent-turn predicate would incorrectly narrow the second alternative.
  const phaseAlternatives = [...text.matchAll(/\b(?:(Your opponent[’']s|your|the)\s+)?(Command|Movement|Shooting|Charge|Fight) phase/gi)].map(match => {
    const nodes = [contextual('ROSTER', 'phase', 'BATTLE', match[2].toUpperCase(), when)];
    if (/opponent/i.test(match[1] || '')) nodes.push(contextual('ROSTER', 'turnOwner', 'BATTLE', 'OPPONENT', when));
    else if (/^your$/i.test(match[1] || '')) nodes.push(contextual('ROSTER', 'turnOwner', 'BATTLE', 'YOU', when));
    return all(nodes);
  });
  if (phaseAlternatives.length) timingAtoms.push(any(phaseAlternatives));
  if (/^(?:Start|At the start)\b/i.test(text)) timingAtoms.push(contextual('ROSTER', 'phaseWindow', 'BATTLE', 'START', when));
  if (/^End\b/i.test(text)) timingAtoms.push(contextual('ROSTER', 'phaseWindow', 'BATTLE', 'END', when));
  if (/just after an enemy unit has selected its targets/i.test(text)) timingAtoms.push(contextual('ROSTER', 'enemyTargetSelectionJustFinished', 'BATTLE', true, when));
  if (/ends a Charge move/i.test(text)) timingAtoms.push(contextual('ROSTER', 'friendlyChargeMoveJustEnded', 'BATTLE', true, when));
  if (/before the Reinforcements step/i.test(text)) timingAtoms.push(contextual('ROSTER', 'movementBeforeReinforcements', 'BATTLE', true, when));
  else if (/The Reinforcements step/i.test(text)) timingAtoms.push(contextual('ROSTER', 'movementStep', 'BATTLE', 'REINFORCEMENTS', when));
  if (/when.*selected to (?:make a )?(?:Fall Back|fall-back move)/i.test(text)) timingAtoms.push(contextual('ROSTER', 'enemyFallBackSelection', 'BATTLE', true, when));
  if (/selected to attack/i.test(text)) timingAtoms.push(contextual('ROSTER', 'friendlyAttackSelection', 'BATTLE', true, when));
  if (/selected to shoot/i.test(text)) timingAtoms.push(contextual('ROSTER', 'friendlyShootingSelection', 'BATTLE', true, when));
  if (/starts an action/i.test(text)) timingAtoms.push(contextual('ROSTER', 'friendlyActionStarted', 'BATTLE', true, when));

  const detachmentProof = {field:['category'], quote:entity.data.category};
  const globalConditions = [atom('ROSTER', 'DETACHMENT', 'ROSTER', {id:entity.parentId}, detachmentProof), ...timingAtoms];
  const roles = [primary], clauses = [];
  const attackTargetExclusions=[];
  const roleCopies = new Map();
  for (const [index, declaration] of spec.effects.entries()) {
    const original = declaration.recipient.subject;
    // Weapons/attacks are factual effect scope of source models/unit actors,
    // not invented authoritative MODEL/UNIT identities for a weapon/attack.
    const subject = ['MODEL','UNIT'].includes(original) ? original : original === 'WEAPON' ? 'MODEL' : 'ROSTER';
    let id = declaration.roleId;
    if (id === 'primary') id = 'primary-effect-' + (index + 1);
    const occurrence = (roleCopies.get(id) || 0) + 1; roleCopies.set(id, occurrence);
    if (occurrence > 1) id += '-' + occurrence;
    const belongsToPrimary = declaration.roleId === 'primary' || declaration.roleId.startsWith('primary-');
    const binding = belongsToPrimary ? subject === 'MODEL' && primary.subject !== 'MODEL' ? 'PRIMARY_MEMBERS' : 'PRIMARY_ACTOR' : 'INDEPENDENT_ENTITY';
    const secondaryTarget = entity.id === 'detachment-shamblerot-vectorium:stratagem:6' && declaration.roleId === 'shield-unit';
    const purpose = secondaryTarget ? 'SECONDARY_TARGET' : declaration.roleId === 'new-unit' ? 'CREATED_OUTPUT' : original === 'OBJECTIVE_MARKER' || original === 'TERRAIN_FEATURE' || declaration.operation.endsWith('_ANCHOR') ? 'ANCHOR' : 'EFFECT_RECIPIENT';
    const role = {id, subject, allegiance:declaration.recipient.relation === 'FRIENDLY' ? 'FRIENDLY' : declaration.recipient.relation === 'ENEMY' ? 'ENEMY' : 'ANY', binding, purpose, selector:selector(subject, declaration.recipient.allKeywords, [], effect), conditions:[]};
    const conditions = [];
    for (const condition of declaration.conditions) {
      const op = condition.op;
      const proof = secondaryTarget && ['WITHIN_3_OF_PRIMARY','VISIBLE_TO_PRIMARY_AND_ATTACKING_UNIT'].includes(op) ? target : effect;
      const intrinsic=staticExclusionForOperation(op);
      if (intrinsic) {
        assert.equal(condition.context,'STATIC_IDENTITY',`${entity.id}: intrinsic exclusion cannot be a context flag`);
        if (intrinsic.participant==='RECIPIENT') {
          const exclusion=all(intrinsic.keywords.map(value=>not(keyword(subject,value,proof))));
          role.selector=role.selector.predicate==='ALWAYS'?exclusion:all([role.selector,exclusion]);
        } else attackTargetExclusions.push({actorRole:role,clauseIndex:index,keywords:intrinsic.keywords,proof});
        continue;
      }
      assert.notEqual(condition.context,'STATIC_IDENTITY',`${entity.id}: unnormalized intrinsic condition ${op}`);
      const roster = ['MEMBER_OF_PRIMARY_UNIT','MODEL_MEMBER_OF_PRIMARY_UNIT','MODEL_FROM_YOUR_ARMY','MEMBER_OF_PRIMARY_ATTACHED_UNIT','MELEE_WEAPON_EQUIPPED_BY_PRIMARY_UNIT_MODEL','RANGED_WEAPON_EQUIPPED_BY_PRIMARY_UNIT_MODELS','OTHER_FRIENDLY_UNIT','IDENTICAL_TO_DESTROYED_PRIMARY_UNIT'].includes(op);
      // Complex logical scope is atomized below, rather than one opaque flag.
      if (op === 'EXCLUDES_ATTACHED_UNITS_WITH_TWO_LEADERS_OR_ONE_OF_YOUR_CHARACTER_UNITS_LEADING') {
        conditions.push(not(all([contextual(subject, 'attached', 'ROSTER', true, effect), any([contextual(subject, 'hasAtLeastTwoLeaderUnits', 'ROSTER', true, effect), contextual(subject, 'hasFriendlyCharacterLeader', 'ROSTER', true, effect)])])));
      } else if (op === 'PRIMARY_CAN_LEAD_RECIPIENT_USING_ACCEPTED_LEADER_IDENTITY') conditions.push(contextual(subject, 'canBeLedByPrimary', 'ROSTER', true, effect));
      else if (op === 'WITHIN_2_HORIZONTAL_AND_5_VERTICAL') {
        conditions.push(contextual(subject, 'within2HorizontalOfPrimary', 'BATTLE', true, effect), contextual(subject, 'within5VerticalOfPrimary', 'BATTLE', true, effect));
      } else if (op === 'VISIBLE_TO_PRIMARY_AND_ATTACKING_UNIT') {
        conditions.push(contextual(subject, 'visibleToPrimary', 'BATTLE', true, proof), contextual(subject, 'visibleToAttackingUnit', 'BATTLE', true, proof));
      } else if (op === 'EXCLUDES_BATTLE_SHOCKED') conditions.push(contextual(subject, 'battleShocked', 'BATTLE', false, effect));
      else conditions.push(contextual(subject, fieldKey(op), roster ? 'ROSTER' : 'BATTLE', true, proof));
    }
    role.conditions = secondaryTarget ? normalizeTargetConditions({target,when,subject,purpose:'SECONDARY_TARGET'}) : conditions;
    roles.push(role);
    clauses.push({id:entity.id + ':effect-clause:' + (index + 1), roles:[role], conditions:[], sourceFields:secondaryTarget ? [target.field, effect.field] : [effect.field], effectScope:original, operation:declaration.operation});
  }
  // Recipient exclusions are UNIT predicates on the enemy, never primary
  // actor keyword predicates. Initial Mireslick trigger and general recipients
  // also remain separate semantic roles.
  const additionalEnemyRoles = {
    'detachment-virulent-vectorium:stratagem:6':{key:'afflicted', except:[]},
    'detachment-death-lords-chosen:stratagem:2':{except:['MONSTER','VEHICLE']},
    'detachment-mortarions-hammer:stratagem:3':{except:['AIRCRAFT'], fields:['visibleToPrimary','inOpponentDeploymentZone']},
    'detachment-champions-of-contagion:stratagem:2':{except:[], fields:['belowStartingStrength']},
    'detachment-champions-of-contagion:stratagem:6':{except:['VEHICLE'], fields:['visibleToPrimary','within8OfPrimary']}
  };
  const extra = additionalEnemyRoles[entity.id];
  if (extra) {
    const nodes = (extra.except || []).map(value => not(keyword('UNIT', value, effect)));
    const role = {id:'enemy-effect-recipient', subject:'UNIT', allegiance:'ENEMY', binding:'INDEPENDENT_ENTITY', purpose:'EFFECT_RECIPIENT', selector:nodes.length ? all(nodes) : always('UNIT', effect), conditions:[...(extra.fields || []).map(value => contextual('UNIT', value, 'BATTLE', true, effect)), ...(extra.key ? [contextual('UNIT', extra.key, 'BATTLE', true, effect)] : [])]};
    roles.push(role); clauses.push({id:entity.id + ':recipient-selector', roles:[role], conditions:[], sourceFields:[effect.field]});
  }
  if (entity.id === 'detachment-tallyband-summoners:stratagem:6') {
    const role = {id:'initial-enemy-trigger', subject:'UNIT', allegiance:'ENEMY', binding:'INDEPENDENT_ENTITY', purpose:'TRIGGER_ACTOR', selector:all([not(keyword('UNIT', 'MONSTER', when)), not(keyword('UNIT', 'VEHICLE', when))]), conditions:[contextual('UNIT', 'selectedToFallBack', 'BATTLE', true, when)]};
    roles.push(role); clauses.push({id:entity.id + ':initial-trigger', roles:[role], conditions:[], sourceFields:[when.field]});
  }
  if (entity.id === 'detachment-tallyband-summoners:stratagem:2') {
    const role = {id:'friendly-plague-legions-anchor', subject:'UNIT', allegiance:'FRIENDLY', binding:'INDEPENDENT_ENTITY', purpose:'ANCHOR', selector:keyword('UNIT', 'PLAGUE LEGIONS', effect), conditions:[contextual('UNIT', 'withinEngagementRangeOfEnemyAttackRecipient', 'BATTLE', true, effect)]};
    roles.push(role); clauses.push({id:entity.id + ':anchor-selector', roles:[role], conditions:[], sourceFields:[effect.field]});
  }
  if (entity.id === 'detachment-shamblerot-vectorium:stratagem:6') {
    const role = {id:'attacking-enemy', subject:'UNIT', allegiance:'ENEMY', binding:'INDEPENDENT_ENTITY', purpose:'TRIGGER_ACTOR', selector:always('UNIT', when), conditions:[contextual('UNIT', 'targetsSelectedJustNow', 'BATTLE', true, when)]};
    roles.push(role); clauses.push({id:entity.id + ':attacker', roles:[role], conditions:[], sourceFields:[when.field]});
  }
  for (const exclusion of attackTargetExclusions) {
    const recipient=roles.find(role=>role.id==='enemy-effect-recipient');
    assert.ok(recipient&&recipient.subject==='UNIT'&&recipient.allegiance==='ENEMY',`${entity.id}: unresolved enemy attack-target participant`);
    assert.equal(exclusion.actorRole.subject,'MODEL','Attack-target exclusion requires a MODEL actor');
    assert.ok(!recipient.actorRoleId||recipient.actorRoleId===exclusion.actorRole.id,'Conflicting attack-target actor');
    recipient.binding='ATTACK_TARGET';
    recipient.actorRoleId=exclusion.actorRole.id;
    recipient.selector=all(exclusion.keywords.map(value=>not(keyword('UNIT',value,exclusion.proof))));
    // The same participant record governs this attack's recipient. It cannot
    // be replaced by an unrelated otherwise-eligible enemy elsewhere.
    clauses[exclusion.clauseIndex].roles.push(recipient);
  }
  const restrictions = lines.flatMap((line, index) => line.label.startsWith('RESTRICTION') ? [{id:entity.id + ':restriction:' + index, conditions:[contextual('ROSTER', 'usedThisStratagemThisBattle', 'BATTLE', false, {field:['lines',index,'text'], quote:line.text})], sourceFields:[['lines',index,'text']]}] : []);
  const duration = [...effect.quote.matchAll(/\buntil (?:the )?[^.,:;]+/gi)].map((match, index) => {
    const quote = match[0], endpoint = /start of your next Command phase/i.test(quote) ? 'START_NEXT_FRIENDLY_COMMAND_PHASE' : /start of your next turn/i.test(quote) ? 'START_NEXT_FRIENDLY_TURN' : /end of the phase/i.test(quote) ? 'END_CURRENT_PHASE' : /end of the turn/i.test(quote) ? 'END_CURRENT_TURN' : /end of the battle/i.test(quote) ? 'END_BATTLE' : /your unit has attacked/i.test(quote) ? 'AFTER_PRIMARY_ATTACKED' : 'EXPLICIT_SOURCE_BOUNDARY';
    const relevant = entity.id === 'detachment-virulent-vectorium:stratagem:1' ? roles.filter(role => role.id === 'enemy-affected') : roles.filter(role => role.id !== 'primary' && !['ROSTER'].includes(role.subject));
    return {id:entity.id + ':duration:' + (index + 1), endpoint, roleIds:relevant.map(role => role.id), evidence:evidence(effect, quote), sourceFields:[effect.field]};
  });
  if (!duration.length) duration.push({id:entity.id + ':duration:source-unspecified', endpoint:'NOT_EXPLICIT', inferredExpiry:false, sourceFields:[effect.field]});
  const compatibilityRoleIds = roles.filter(role => ['PRIMARY_TARGET','SECONDARY_TARGET'].includes(role.purpose)).map(role => role.id);
  return {kind:'STRATAGEM', contextLevel:'BATTLE', executionMode:'BATTLE_ACTION', detachmentId:entity.parentId, cp:entity.data.cp,
    queryPurpose:'TARGET_ELIGIBILITY', compatibilityRoleIds,
    timing:{conditions:timingAtoms, sourceFields:[when.field]}, roles, conditions:globalConditions, restrictions, clauses, duration, sourceFields};
}

export function buildStratagemContracts(model) {
  const index = new Map(model.entities.map(entity => [entity.id, entity]));
  const accepted = model.entities.filter(entity => entity.kind === 'STRATAGEM');
  assert.deepEqual(accepted.map(entity => entity.id).sort(), declarations.map(row => row.id).sort(), 'Every current accepted Stratagem requires one independently adjudicated contract');
  return new Map(declarations.map(spec => {
    const entity = index.get(spec.id);
    assert.equal(entity.kind, 'STRATAGEM');
    assert.equal(index.get(entity.parentId)?.kind, 'DETACHMENT', 'Stratagem scope resolves by exact canonical detachment ID');
    return [entity.id, compile(entity, spec)];
  }));
}

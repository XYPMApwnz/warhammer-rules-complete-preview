/** Source-owned native Core ability bindings. Explicit occurrence identities were
 * reviewed against the accepted source spans, not joined by captions at runtime.
 * This does not simulate combat, resolve Army choices or create attachment roles.
 */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {createEffectiveCoreCatalog} from '../../core-rules/content/effective-core-catalog.mjs';
const clone=structuredClone,sha=value=>createHash('sha256').update(value).digest('hex').toUpperCase();
export const nativeAbilityReview=Object.freeze([
  {
    "id": "reference-sm-0050e7232bef43fc",
    "ownerId": "unit-sm-bc4486ac79ec477f",
    "sourceEntityId": "sm-source-367dd739a3f7467c",
    "quote": "Infiltrators",
    "sourceFieldSha256": "6B1564D0CAD2F0738872C3C952E04F811F7221AE14F7EA1B3E11B8A2E20A07CC",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[10]/div[34]/div[2]/div[2]/table/tbody/tr[1]/td[2]/b/span[2]",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00096",
    "modelProfileIds": [
      "model-sm-d4e935e883504d63"
    ],
    "canonicalAbilityId": "core-infiltrators",
    "parameters": {},
    "status": "EXECUTABLE_PROVEN",
    "reason": "Native MODEL ability presence and source parameters; battle events are not simulated."
  },
  {
    "id": "reference-sm-02b1501897ce4ef3",
    "ownerId": "unit-sm-8ef63e7da6444869",
    "sourceEntityId": "sm-source-16f9dafcb1804853",
    "quote": "Combat Doctrines",
    "sourceFieldSha256": "C7D35224BD3207AB80A296EDBD6B104C33DC5046C450CAAB7832588C740B3989",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[24]/div[24]/div[2]/div[2]/table/tbody/tr[2]/td[2]/b/span",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00021",
    "modelProfileIds": [
      "model-sm-e07390486bc64bf2",
      "model-sm-5888f610a0b24edf"
    ],
    "canonicalAbilityId": null,
    "parameters": {},
    "status": "TEXT_ONLY_SOURCE_BACKED",
    "reason": "Army reference does not unconditionally execute the referenced Army Rule."
  },
  {
    "id": "reference-sm-0319a37d74e04a4d",
    "ownerId": "unit-sm-99eb03d4f2d448e2",
    "sourceEntityId": "sm-source-277d4bcb13f4489c",
    "quote": "Leader",
    "sourceFieldSha256": "3F53871B0838BDF343A3A0CDBCFCBC28EF7E30A4FC8E032C3376431DE4D2F7DB",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[10]/div[12]/div[2]/div[2]/table/tbody/tr[1]/td[2]/b/span",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00264",
    "modelProfileIds": [
      "model-sm-6b73ec4e731b4220"
    ],
    "canonicalAbilityId": null,
    "parameters": {},
    "status": "TEXT_ONLY_SOURCE_BACKED",
    "reason": "Leader/Support role is resolved by conditional central MFM relations, not an unconditional native ability."
  },
  {
    "id": "reference-sm-04b602610fde416a",
    "ownerId": "unit-sm-ff2af9c56daa4536",
    "sourceEntityId": "sm-source-8a178e316e6b4053",
    "quote": "Leader",
    "sourceFieldSha256": "3F53871B0838BDF343A3A0CDBCFCBC28EF7E30A4FC8E032C3376431DE4D2F7DB",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[10]/div[26]/div[2]/div[2]/table/tbody/tr[1]/td[2]/b/span[2]",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00264",
    "modelProfileIds": [
      "model-sm-26c519e8e2254dc5"
    ],
    "canonicalAbilityId": null,
    "parameters": {},
    "status": "TEXT_ONLY_SOURCE_BACKED",
    "reason": "Leader/Support role is resolved by conditional central MFM relations, not an unconditional native ability."
  },
  {
    "id": "reference-sm-051757396f5041c9",
    "ownerId": "unit-sm-7ee313f201ab42cf",
    "sourceEntityId": "sm-source-9f9dd9c5b3114e3d",
    "quote": "Transhuman Strategist",
    "sourceFieldSha256": "069C48F23FB8A287AFDFFB14DBE8DEB12F57374BAE9FAF3CCF0FFDAD0B24383B",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[2]/div[12]/div[2]/div[2]/table/tbody/tr[2]/td[2]/b/span[3]",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00266",
    "modelProfileIds": [
      "model-sm-06a690ddf76a4822"
    ],
    "canonicalAbilityId": null,
    "parameters": {},
    "status": "TEXT_ONLY_SOURCE_BACKED",
    "reason": "Army reference does not unconditionally execute the referenced Army Rule."
  },
  {
    "id": "reference-sm-062d5e11b7924d4b",
    "ownerId": "unit-sm-1af70808102d4286",
    "sourceEntityId": "sm-source-6f4305dfb7974ded",
    "quote": "Combat Doctrines",
    "sourceFieldSha256": "C7D35224BD3207AB80A296EDBD6B104C33DC5046C450CAAB7832588C740B3989",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[2]/div[24]/div[2]/div[2]/table/tbody/tr[2]/td[2]/b/span[1]",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00021",
    "modelProfileIds": [
      "model-sm-8f32fb102ead4603"
    ],
    "canonicalAbilityId": null,
    "parameters": {},
    "status": "TEXT_ONLY_SOURCE_BACKED",
    "reason": "Army reference does not unconditionally execute the referenced Army Rule."
  },
  {
    "id": "reference-sm-0706b239bc03474c",
    "ownerId": "unit-sm-bc409233f3fe4dc1",
    "sourceEntityId": "sm-source-84d891ff32a048d0",
    "quote": "Combat Doctrines",
    "sourceFieldSha256": "C7D35224BD3207AB80A296EDBD6B104C33DC5046C450CAAB7832588C740B3989",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[30]/div[2]/div[2]/div[2]/table/tbody/tr[2]/td[2]/b/span",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00021",
    "modelProfileIds": [
      "model-sm-2bc3fdd06d734c1e"
    ],
    "canonicalAbilityId": null,
    "parameters": {},
    "status": "TEXT_ONLY_SOURCE_BACKED",
    "reason": "Army reference does not unconditionally execute the referenced Army Rule."
  },
  {
    "id": "reference-sm-0804a4a1dac2472f",
    "ownerId": "unit-sm-e75d543e81cf49f3",
    "sourceEntityId": "sm-source-cbb1221cf1fa439b",
    "quote": "Deadly Demise D6",
    "sourceFieldSha256": "29F11E92385545A97FA5A00DF9DFAE33FECE0DFF1516C93E1A532B3B19862FEF",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[30]/div[8]/div[2]/div[2]/table/tbody/tr[1]/td[2]/b/span[2]",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00089",
    "modelProfileIds": [
      "model-sm-e1db677cfd3d4af6"
    ],
    "canonicalAbilityId": "core-deadly-demise",
    "parameters": {
      "value": "D6"
    },
    "status": "EXECUTABLE_PROVEN",
    "reason": "Native MODEL ability presence and source parameters; battle events are not simulated."
  },
  {
    "id": "reference-sm-0851869b0cc64b9d",
    "ownerId": "unit-sm-ff2af9c56daa4536",
    "sourceEntityId": "sm-source-cfde6d4d06384dab",
    "quote": "Combat Doctrines",
    "sourceFieldSha256": "C7D35224BD3207AB80A296EDBD6B104C33DC5046C450CAAB7832588C740B3989",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[10]/div[26]/div[2]/div[2]/table/tbody/tr[2]/td[2]/b/span",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00021",
    "modelProfileIds": [
      "model-sm-26c519e8e2254dc5"
    ],
    "canonicalAbilityId": null,
    "parameters": {},
    "status": "TEXT_ONLY_SOURCE_BACKED",
    "reason": "Army reference does not unconditionally execute the referenced Army Rule."
  },
  {
    "id": "reference-sm-08edb8a758d84f47",
    "ownerId": "unit-sm-96f12b073f4649c7",
    "sourceEntityId": "sm-source-d6ff8e3125a74feb",
    "quote": "Infiltrators",
    "sourceFieldSha256": "6B1564D0CAD2F0738872C3C952E04F811F7221AE14F7EA1B3E11B8A2E20A07CC",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[10]/div[42]/div[2]/div[2]/table/tbody/tr[1]/td[2]/b/span[2]",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00096",
    "modelProfileIds": [
      "model-sm-1c11eb57409a4d9b"
    ],
    "canonicalAbilityId": "core-infiltrators",
    "parameters": {},
    "status": "EXECUTABLE_PROVEN",
    "reason": "Native MODEL ability presence and source parameters; battle events are not simulated."
  },
  {
    "id": "reference-sm-09fe652eed9041a7",
    "ownerId": "unit-sm-a5c08f428c2648bb",
    "sourceEntityId": "sm-source-8a8be879e39a43b8",
    "quote": "Combat Doctrines",
    "sourceFieldSha256": "C7D35224BD3207AB80A296EDBD6B104C33DC5046C450CAAB7832588C740B3989",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[24]/div[22]/div[2]/div[2]/table/tbody/tr/td[2]/b/span",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00021",
    "modelProfileIds": [
      "model-sm-7ea7660b527f4c7d",
      "model-sm-a55bdb8d97494a7f"
    ],
    "canonicalAbilityId": null,
    "parameters": {},
    "status": "TEXT_ONLY_SOURCE_BACKED",
    "reason": "Army reference does not unconditionally execute the referenced Army Rule."
  },
  {
    "id": "reference-sm-0a77ccbd9e2045dc",
    "ownerId": "unit-sm-8ef63e7da6444869",
    "sourceEntityId": "sm-source-373ac6cc47c04442",
    "quote": "Infiltrators",
    "sourceFieldSha256": "6B1564D0CAD2F0738872C3C952E04F811F7221AE14F7EA1B3E11B8A2E20A07CC",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[24]/div[24]/div[2]/div[2]/table/tbody/tr[1]/td[2]/b/span",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00096",
    "modelProfileIds": [
      "model-sm-e07390486bc64bf2",
      "model-sm-5888f610a0b24edf"
    ],
    "canonicalAbilityId": "core-infiltrators",
    "parameters": {},
    "status": "EXECUTABLE_PROVEN",
    "reason": "Native MODEL ability presence and source parameters; battle events are not simulated."
  },
  {
    "id": "reference-sm-0b03fd74356b410e",
    "ownerId": "unit-sm-7ebc58da33c34c58",
    "sourceEntityId": "sm-source-7903958ae071486e",
    "quote": "Combat Doctrines",
    "sourceFieldSha256": "C7D35224BD3207AB80A296EDBD6B104C33DC5046C450CAAB7832588C740B3989",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[16]/div[6]/div[2]/div[2]/table/tbody/tr[2]/td[2]/b/span",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00021",
    "modelProfileIds": [
      "model-sm-11cda2d354e54922"
    ],
    "canonicalAbilityId": null,
    "parameters": {},
    "status": "TEXT_ONLY_SOURCE_BACKED",
    "reason": "Army reference does not unconditionally execute the referenced Army Rule."
  },
  {
    "id": "reference-sm-0bb52cb9b2e64e45",
    "ownerId": "unit-sm-ac0e865c5ab94c9b",
    "sourceEntityId": "sm-source-664ad22a05244ac0",
    "quote": "Combat Doctrines",
    "sourceFieldSha256": "C7D35224BD3207AB80A296EDBD6B104C33DC5046C450CAAB7832588C740B3989",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[2]/div[6]/div[2]/div[2]/table/tbody/tr[2]/td[2]/b/span[1]",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00021",
    "modelProfileIds": [
      "model-sm-9c0eeeac90f44de9"
    ],
    "canonicalAbilityId": null,
    "parameters": {},
    "status": "TEXT_ONLY_SOURCE_BACKED",
    "reason": "Army reference does not unconditionally execute the referenced Army Rule."
  },
  {
    "id": "reference-sm-0d184e5aa27f4799",
    "ownerId": "unit-sm-ff2af9c56daa4536",
    "sourceEntityId": "sm-source-cacf4389cfb04cd6",
    "quote": "Deep Strike",
    "sourceFieldSha256": "3C428E37084730EF0C7FCB3A4DF90E292C881C1AD3F31EF93B951D71C10C4AD0",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[10]/div[26]/div[2]/div[2]/table/tbody/tr[1]/td[2]/b/span[1]",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00113",
    "modelProfileIds": [
      "model-sm-26c519e8e2254dc5"
    ],
    "canonicalAbilityId": "core-deep-strike",
    "parameters": {},
    "status": "EXECUTABLE_PROVEN",
    "reason": "Native MODEL ability presence and source parameters; battle events are not simulated."
  },
  {
    "id": "reference-sm-0d7ed9db19614608",
    "ownerId": "unit-sm-7ee313f201ab42cf",
    "sourceEntityId": "sm-source-eaad2fba0d7a451f",
    "quote": "Combat Doctrines",
    "sourceFieldSha256": "C7D35224BD3207AB80A296EDBD6B104C33DC5046C450CAAB7832588C740B3989",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[2]/div[12]/div[2]/div[2]/table/tbody/tr[2]/td[2]/b/span[1]",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00021",
    "modelProfileIds": [
      "model-sm-06a690ddf76a4822"
    ],
    "canonicalAbilityId": null,
    "parameters": {},
    "status": "TEXT_ONLY_SOURCE_BACKED",
    "reason": "Army reference does not unconditionally execute the referenced Army Rule."
  },
  {
    "id": "reference-sm-0f93e45d70234674",
    "ownerId": "unit-sm-65c7cc53e3fc4fc8",
    "sourceEntityId": "sm-source-70e6e9f58cf04f98",
    "quote": "Damaged 6",
    "sourceFieldSha256": "DE458EDA4905A7A939808C01FC175C3F670D113A5EE194827BB5211FD159CFEE",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[30]/div[6]/div[2]/div[2]/table/tbody/tr[1]/td[2]/b/span[1]",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00128",
    "modelProfileIds": [
      "model-sm-fd036e3c68304306"
    ],
    "canonicalAbilityId": null,
    "parameters": {},
    "status": "TEXT_ONLY_SOURCE_BACKED",
    "reason": "Damaged requires current remaining wounds and battle-state hit roll evaluation."
  },
  {
    "id": "reference-sm-0f9d68793c544557",
    "ownerId": "unit-sm-d0a8c043f5c24b22",
    "sourceEntityId": "sm-source-7021af4001d94f4a",
    "quote": "Deadly Demise D6",
    "sourceFieldSha256": "29F11E92385545A97FA5A00DF9DFAE33FECE0DFF1516C93E1A532B3B19862FEF",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[30]/div[10]/div[2]/div[2]/table/tbody/tr[1]/td[2]/b/span[2]",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00089",
    "modelProfileIds": [
      "model-sm-ba05e600c5ff45f3"
    ],
    "canonicalAbilityId": "core-deadly-demise",
    "parameters": {
      "value": "D6"
    },
    "status": "EXECUTABLE_PROVEN",
    "reason": "Native MODEL ability presence and source parameters; battle events are not simulated."
  },
  {
    "id": "reference-sm-0fc7245f876d440a",
    "ownerId": "unit-sm-a2a8db8a9f124a7f",
    "sourceEntityId": "sm-source-0eff7c0bb85c4304",
    "quote": "Fights First",
    "sourceFieldSha256": "DCAB3EC1A646B28E2CF3ACAC4B4CA3C3AD40225EAB94A4BEC6D2BD83298BEE98",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[10]/div[30]/div[2]/div[2]/table/tbody/tr[1]/td[2]/b/span[1]",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00052",
    "modelProfileIds": [
      "model-sm-4677647e191b44dc"
    ],
    "canonicalAbilityId": "core-fights-first",
    "parameters": {},
    "status": "EXECUTABLE_PROVEN",
    "reason": "Native MODEL ability presence and source parameters; battle events are not simulated."
  },
  {
    "id": "reference-sm-104a9fc9286e4bef",
    "ownerId": "unit-sm-f92faa31422041f5",
    "sourceEntityId": "sm-source-077a2d70daf34da4",
    "quote": "Combat Doctrines",
    "sourceFieldSha256": "C7D35224BD3207AB80A296EDBD6B104C33DC5046C450CAAB7832588C740B3989",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[32]/div[10]/div[2]/div[2]/table/tbody/tr[2]/td[2]/b/span",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00021",
    "modelProfileIds": [
      "model-sm-d6ed8cb50b144291"
    ],
    "canonicalAbilityId": null,
    "parameters": {},
    "status": "TEXT_ONLY_SOURCE_BACKED",
    "reason": "Army reference does not unconditionally execute the referenced Army Rule."
  },
  {
    "id": "reference-sm-107707b280fa46aa",
    "ownerId": "unit-sm-0b0b22ecffa74125",
    "sourceEntityId": "sm-source-bd9a02ba33924f7e",
    "quote": "Combat Doctrines",
    "sourceFieldSha256": "C7D35224BD3207AB80A296EDBD6B104C33DC5046C450CAAB7832588C740B3989",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[10]/div[10]/div[2]/div[2]/table/tbody/tr[2]/td[2]/b/span",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00021",
    "modelProfileIds": [
      "model-sm-c279f7ee39b9485b"
    ],
    "canonicalAbilityId": null,
    "parameters": {},
    "status": "TEXT_ONLY_SOURCE_BACKED",
    "reason": "Army reference does not unconditionally execute the referenced Army Rule."
  },
  {
    "id": "reference-sm-12bf63a885e74b6f",
    "ownerId": "unit-sm-a8f0770187044cbb",
    "sourceEntityId": "sm-source-1bb3ddf4fb964dce",
    "quote": "Deadly Demise D3",
    "sourceFieldSha256": "D265C9B278EBD2413359FD63CD7DC32E7106EA9AC45DC46DDC393F7CE65FB7FF",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[32]/div[6]/div[2]/div[2]/table/tbody/tr[1]/td[2]/b/span[2]",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00089",
    "modelProfileIds": [
      "model-sm-d0247ef5d2a54ab3"
    ],
    "canonicalAbilityId": "core-deadly-demise",
    "parameters": {
      "value": "D3"
    },
    "status": "EXECUTABLE_PROVEN",
    "reason": "Native MODEL ability presence and source parameters; battle events are not simulated."
  },
  {
    "id": "reference-sm-1618b3e8caee4628",
    "ownerId": "unit-sm-e43fc0c6d8b14ad8",
    "sourceEntityId": "sm-source-fa5b56bafe3c47a8",
    "quote": "Combat Doctrines",
    "sourceFieldSha256": "C7D35224BD3207AB80A296EDBD6B104C33DC5046C450CAAB7832588C740B3989",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[10]/div[28]/div[2]/div[2]/table/tbody/tr/td[2]/b/span",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00021",
    "modelProfileIds": [
      "model-sm-40b0ebad52ac454a",
      "model-sm-58664b5f9e9544e8",
      "model-sm-afb2bc9f2e86494b",
      "model-sm-bc24e416aca24714"
    ],
    "canonicalAbilityId": null,
    "parameters": {},
    "status": "TEXT_ONLY_SOURCE_BACKED",
    "reason": "Army reference does not unconditionally execute the referenced Army Rule."
  },
  {
    "id": "reference-sm-16c1318c343c4282",
    "ownerId": "unit-sm-9f9c66dce3814cc5",
    "sourceEntityId": "sm-source-7b1ddfd39d624cd9",
    "quote": "Transhuman Strategist",
    "sourceFieldSha256": "069C48F23FB8A287AFDFFB14DBE8DEB12F57374BAE9FAF3CCF0FFDAD0B24383B",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[2]/div[26]/div[2]/div[2]/table/tbody/tr[2]/td[2]/b/span[2]",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00266",
    "modelProfileIds": [
      "model-sm-bc58a7069dd24cac"
    ],
    "canonicalAbilityId": null,
    "parameters": {},
    "status": "TEXT_ONLY_SOURCE_BACKED",
    "reason": "Army reference does not unconditionally execute the referenced Army Rule."
  },
  {
    "id": "reference-sm-1a700dc648844776",
    "ownerId": "unit-sm-f92faa31422041f5",
    "sourceEntityId": "sm-source-578994ad171944c9",
    "quote": "Deadly Demise D3",
    "sourceFieldSha256": "D265C9B278EBD2413359FD63CD7DC32E7106EA9AC45DC46DDC393F7CE65FB7FF",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[32]/div[10]/div[2]/div[2]/table/tbody/tr[1]/td[2]/b/span[1]",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00089",
    "modelProfileIds": [
      "model-sm-d6ed8cb50b144291"
    ],
    "canonicalAbilityId": "core-deadly-demise",
    "parameters": {
      "value": "D3"
    },
    "status": "EXECUTABLE_PROVEN",
    "reason": "Native MODEL ability presence and source parameters; battle events are not simulated."
  },
  {
    "id": "reference-sm-1aec9d71bde34098",
    "ownerId": "unit-sm-7a3f4debefdb4c95",
    "sourceEntityId": "sm-source-b8195734ecde4fce",
    "quote": "Scouts 6\"",
    "sourceFieldSha256": "5C83784955DE6C8879C40A37717633723B88859C178B1B3CFD7EE672FD0A7747",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[24]/div[20]/div[2]/div[2]/table/tbody/tr[1]/td[2]/b/span",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00050",
    "modelProfileIds": [
      "model-sm-4f27448438634709",
      "model-sm-178d4e23b9ba4562"
    ],
    "canonicalAbilityId": "core-scouts",
    "parameters": {
      "range": 6
    },
    "status": "EXECUTABLE_PROVEN",
    "reason": "Native MODEL ability presence and source parameters; battle events are not simulated."
  },
  {
    "id": "reference-sm-1c9f4a25abcd4ff5",
    "ownerId": "unit-sm-611995a1ac614acb",
    "sourceEntityId": "sm-source-18190f1400a94339",
    "quote": "Transhuman Strategist",
    "sourceFieldSha256": "069C48F23FB8A287AFDFFB14DBE8DEB12F57374BAE9FAF3CCF0FFDAD0B24383B",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[2]/div[2]/div[2]/div[2]/table/tbody/tr[2]/td[2]/b/span[2]",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00266",
    "modelProfileIds": [
      "model-sm-7390bc75a44140c4"
    ],
    "canonicalAbilityId": null,
    "parameters": {},
    "status": "TEXT_ONLY_SOURCE_BACKED",
    "reason": "Army reference does not unconditionally execute the referenced Army Rule."
  },
  {
    "id": "reference-sm-1d358f9318904c78",
    "ownerId": "unit-sm-55f195878fab446f",
    "sourceEntityId": "sm-source-7b6217dfbff74403",
    "quote": "Deep Strike",
    "sourceFieldSha256": "3C428E37084730EF0C7FCB3A4DF90E292C881C1AD3F31EF93B951D71C10C4AD0",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[2]/div[20]/div[2]/div[2]/table/tbody/tr[1]/td[2]/b/span[1]",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00113",
    "modelProfileIds": [
      "model-sm-c30e0bfd59a24622"
    ],
    "canonicalAbilityId": "core-deep-strike",
    "parameters": {},
    "status": "EXECUTABLE_PROVEN",
    "reason": "Native MODEL ability presence and source parameters; battle events are not simulated."
  },
  {
    "id": "reference-sm-1dc8defbb3f64b34",
    "ownerId": "unit-sm-4660f547cc3744b0",
    "sourceEntityId": "sm-source-470619c2c37c4179",
    "quote": "Combat Doctrines",
    "sourceFieldSha256": "C7D35224BD3207AB80A296EDBD6B104C33DC5046C450CAAB7832588C740B3989",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[10]/div[38]/div[2]/div[2]/table/tbody/tr[2]/td[2]/b/span",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00021",
    "modelProfileIds": [
      "model-sm-43839b5104fe4791"
    ],
    "canonicalAbilityId": null,
    "parameters": {},
    "status": "TEXT_ONLY_SOURCE_BACKED",
    "reason": "Army reference does not unconditionally execute the referenced Army Rule."
  },
  {
    "id": "reference-sm-20c4e109dbf444f3",
    "ownerId": "unit-sm-63a015916b46446a",
    "sourceEntityId": "sm-source-83a96d9a97994af8",
    "quote": "Combat Doctrines",
    "sourceFieldSha256": "C7D35224BD3207AB80A296EDBD6B104C33DC5046C450CAAB7832588C740B3989",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[10]/div[8]/div[2]/div[2]/table/tbody/tr[2]/td[2]/b/span",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00021",
    "modelProfileIds": [
      "model-sm-303a4d0a13024600"
    ],
    "canonicalAbilityId": null,
    "parameters": {},
    "status": "TEXT_ONLY_SOURCE_BACKED",
    "reason": "Army reference does not unconditionally execute the referenced Army Rule."
  },
  {
    "id": "reference-sm-21f9992f7bdb4bcb",
    "ownerId": "unit-sm-bc4486ac79ec477f",
    "sourceEntityId": "sm-source-12a0f041d6814113",
    "quote": "Deep Strike",
    "sourceFieldSha256": "3C428E37084730EF0C7FCB3A4DF90E292C881C1AD3F31EF93B951D71C10C4AD0",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[10]/div[34]/div[2]/div[2]/table/tbody/tr[1]/td[2]/b/span[1]",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00113",
    "modelProfileIds": [
      "model-sm-d4e935e883504d63"
    ],
    "canonicalAbilityId": "core-deep-strike",
    "parameters": {},
    "status": "EXECUTABLE_PROVEN",
    "reason": "Native MODEL ability presence and source parameters; battle events are not simulated."
  },
  {
    "id": "reference-sm-22baf6283f55476c",
    "ownerId": "unit-sm-10396cd2726045a8",
    "sourceEntityId": "sm-source-232d70e8adda488c",
    "quote": "Leader",
    "sourceFieldSha256": "3F53871B0838BDF343A3A0CDBCFCBC28EF7E30A4FC8E032C3376431DE4D2F7DB",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[2]/div[8]/div[2]/div[2]/table/tbody/tr[1]/td[2]/b/span[2]",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00264",
    "modelProfileIds": [
      "model-sm-d3448e055f4442b8"
    ],
    "canonicalAbilityId": null,
    "parameters": {},
    "status": "TEXT_ONLY_SOURCE_BACKED",
    "reason": "Leader/Support role is resolved by conditional central MFM relations, not an unconditional native ability."
  },
  {
    "id": "reference-sm-2430affa72b74265",
    "ownerId": "unit-sm-02d5dee4717544ad",
    "sourceEntityId": "sm-source-1e91cf82ed0c4212",
    "quote": "Transhuman Strategist",
    "sourceFieldSha256": "069C48F23FB8A287AFDFFB14DBE8DEB12F57374BAE9FAF3CCF0FFDAD0B24383B",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[2]/div[10]/div[2]/div[2]/table/tbody/tr[2]/td[2]/b/span[2]",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00266",
    "modelProfileIds": [
      "model-sm-d659e880bdc74ce3"
    ],
    "canonicalAbilityId": null,
    "parameters": {},
    "status": "TEXT_ONLY_SOURCE_BACKED",
    "reason": "Army reference does not unconditionally execute the referenced Army Rule."
  },
  {
    "id": "reference-sm-2584ed2a5dbd4bd4",
    "ownerId": "unit-sm-1330b7672f934fd8",
    "sourceEntityId": "sm-source-dfc4d63b39dc4354",
    "quote": "Leader",
    "sourceFieldSha256": "3F53871B0838BDF343A3A0CDBCFCBC28EF7E30A4FC8E032C3376431DE4D2F7DB",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[10]/div[36]/div[2]/div[2]/table/tbody/tr[1]/td[2]/b/span[2]",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00264",
    "modelProfileIds": [
      "model-sm-b02318906963426a"
    ],
    "canonicalAbilityId": null,
    "parameters": {},
    "status": "TEXT_ONLY_SOURCE_BACKED",
    "reason": "Leader/Support role is resolved by conditional central MFM relations, not an unconditional native ability."
  },
  {
    "id": "reference-sm-25cdbd996b144feb",
    "ownerId": "unit-sm-80ac1421ce0f4de3",
    "sourceEntityId": "sm-source-94f6f934adb44814",
    "quote": "Combat Doctrines",
    "sourceFieldSha256": "C7D35224BD3207AB80A296EDBD6B104C33DC5046C450CAAB7832588C740B3989",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[32]/div[8]/div[2]/div[2]/table/tbody/tr[2]/td[2]/b/span",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00021",
    "modelProfileIds": [
      "model-sm-6d882ea434844ab7"
    ],
    "canonicalAbilityId": null,
    "parameters": {},
    "status": "TEXT_ONLY_SOURCE_BACKED",
    "reason": "Army reference does not unconditionally execute the referenced Army Rule."
  },
  {
    "id": "reference-sm-279a0dffa7fe4171",
    "ownerId": "unit-sm-bc4486ac79ec477f",
    "sourceEntityId": "sm-source-d512087ae0fe4de0",
    "quote": "Stealth",
    "sourceFieldSha256": "526A40A447DDD7AA52D34BB62DBF1DA04DC4ABA8403769D239ADE80893FFEF7A",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[10]/div[34]/div[2]/div[2]/table/tbody/tr[1]/td[2]/b/span[5]",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00032",
    "modelProfileIds": [
      "model-sm-d4e935e883504d63"
    ],
    "canonicalAbilityId": "core-stealth",
    "parameters": {},
    "status": "EXECUTABLE_PROVEN",
    "reason": "Native MODEL ability presence and source parameters; battle events are not simulated."
  },
  {
    "id": "reference-sm-27a64331808546f1",
    "ownerId": "unit-sm-5d6184dd92154615",
    "sourceEntityId": "sm-source-9dc68f3c15574ac8",
    "quote": "Combat Doctrines",
    "sourceFieldSha256": "C7D35224BD3207AB80A296EDBD6B104C33DC5046C450CAAB7832588C740B3989",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[24]/div[26]/div[2]/div[2]/table/tbody/tr[2]/td[2]/b/span",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00021",
    "modelProfileIds": [
      "model-sm-8e85ff318de74b46",
      "model-sm-012361875ac94504"
    ],
    "canonicalAbilityId": null,
    "parameters": {},
    "status": "TEXT_ONLY_SOURCE_BACKED",
    "reason": "Army reference does not unconditionally execute the referenced Army Rule."
  },
  {
    "id": "reference-sm-27ae14c184014242",
    "ownerId": "unit-sm-4f6baee09b3248a6",
    "sourceEntityId": "sm-source-4dc2397eb1534134",
    "quote": "Deadly Demise D3",
    "sourceFieldSha256": "D265C9B278EBD2413359FD63CD7DC32E7106EA9AC45DC46DDC393F7CE65FB7FF",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[34]/div[2]/div[2]/div[2]/table/tbody/tr[1]/td[2]/b/span[2]",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00089",
    "modelProfileIds": [
      "model-sm-4d06dc05dfea42ef"
    ],
    "canonicalAbilityId": "core-deadly-demise",
    "parameters": {
      "value": "D3"
    },
    "status": "EXECUTABLE_PROVEN",
    "reason": "Native MODEL ability presence and source parameters; battle events are not simulated."
  },
  {
    "id": "reference-sm-2b3c0f79991d445f",
    "ownerId": "unit-sm-e595c56eab2f493b",
    "sourceEntityId": "sm-source-d01963a729d843ee",
    "quote": "Leader",
    "sourceFieldSha256": "3F53871B0838BDF343A3A0CDBCFCBC28EF7E30A4FC8E032C3376431DE4D2F7DB",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[10]/div[20]/div[2]/div[2]/table/tbody/tr[1]/td[2]/b/span[2]",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00264",
    "modelProfileIds": [
      "model-sm-787b279449d1493a"
    ],
    "canonicalAbilityId": null,
    "parameters": {},
    "status": "TEXT_ONLY_SOURCE_BACKED",
    "reason": "Leader/Support role is resolved by conditional central MFM relations, not an unconditional native ability."
  },
  {
    "id": "reference-sm-2e4dfab904454d56",
    "ownerId": "unit-sm-ad36b4f4c8f14a97",
    "sourceEntityId": "sm-source-0733b8312ee643ff",
    "quote": "Deep Strike",
    "sourceFieldSha256": "3C428E37084730EF0C7FCB3A4DF90E292C881C1AD3F31EF93B951D71C10C4AD0",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[2]/div[14]/div[2]/div[2]/table/tbody/tr[1]/td[2]/b/span[1]",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00113",
    "modelProfileIds": [
      "model-sm-7fe144bba1d44cf5"
    ],
    "canonicalAbilityId": "core-deep-strike",
    "parameters": {},
    "status": "EXECUTABLE_PROVEN",
    "reason": "Native MODEL ability presence and source parameters; battle events are not simulated."
  },
  {
    "id": "reference-sm-3271f09d51a84681",
    "ownerId": "unit-sm-9e163be8d4bb42c1",
    "sourceEntityId": "sm-source-eb2b56a56290403b",
    "quote": "Combat Doctrines",
    "sourceFieldSha256": "C7D35224BD3207AB80A296EDBD6B104C33DC5046C450CAAB7832588C740B3989",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[24]/div[34]/div[2]/div[2]/table/tbody/tr[2]/td[2]/b/span",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00021",
    "modelProfileIds": [
      "model-sm-0fcf83855af74d94",
      "model-sm-eb6a88440ae64725"
    ],
    "canonicalAbilityId": null,
    "parameters": {},
    "status": "TEXT_ONLY_SOURCE_BACKED",
    "reason": "Army reference does not unconditionally execute the referenced Army Rule."
  },
  {
    "id": "reference-sm-32b6f16a97a14bf2",
    "ownerId": "unit-sm-3816678809d047d2",
    "sourceEntityId": "sm-source-8d876c69f90e40ac",
    "quote": "Deep Strike",
    "sourceFieldSha256": "3C428E37084730EF0C7FCB3A4DF90E292C881C1AD3F31EF93B951D71C10C4AD0",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[24]/div[18]/div[2]/div[2]/table/tbody/tr[1]/td[2]/b/span",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00113",
    "modelProfileIds": [
      "model-sm-625c28904c2e4f1d",
      "model-sm-ccba7ed5c0a74702"
    ],
    "canonicalAbilityId": "core-deep-strike",
    "parameters": {},
    "status": "EXECUTABLE_PROVEN",
    "reason": "Native MODEL ability presence and source parameters; battle events are not simulated."
  },
  {
    "id": "reference-sm-33c58630e0a0421c",
    "ownerId": "unit-sm-ad36b4f4c8f14a97",
    "sourceEntityId": "sm-source-bcdcdd39d3d34eaa",
    "quote": "Combat Doctrines",
    "sourceFieldSha256": "C7D35224BD3207AB80A296EDBD6B104C33DC5046C450CAAB7832588C740B3989",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[2]/div[14]/div[2]/div[2]/table/tbody/tr[2]/td[2]/b/span[1]",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00021",
    "modelProfileIds": [
      "model-sm-7fe144bba1d44cf5"
    ],
    "canonicalAbilityId": null,
    "parameters": {},
    "status": "TEXT_ONLY_SOURCE_BACKED",
    "reason": "Army reference does not unconditionally execute the referenced Army Rule."
  },
  {
    "id": "reference-sm-35d22e4e9a304cc9",
    "ownerId": "unit-sm-4fce70f042cc4e5d",
    "sourceEntityId": "sm-source-0f507ef8570d4d31",
    "quote": "Deadly Demise D3",
    "sourceFieldSha256": "D265C9B278EBD2413359FD63CD7DC32E7106EA9AC45DC46DDC393F7CE65FB7FF",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[16]/div[4]/div[2]/div[2]/table/tbody/tr[1]/td[2]/b/span[1]",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00089",
    "modelProfileIds": [
      "model-sm-4e527c6e24c144f4"
    ],
    "canonicalAbilityId": "core-deadly-demise",
    "parameters": {
      "value": "D3"
    },
    "status": "EXECUTABLE_PROVEN",
    "reason": "Native MODEL ability presence and source parameters; battle events are not simulated."
  },
  {
    "id": "reference-sm-35dcbc631cfb49db",
    "ownerId": "unit-sm-ddda2ee77e3342c5",
    "sourceEntityId": "sm-source-dbfb27aa0cfb4948",
    "quote": "Combat Doctrines",
    "sourceFieldSha256": "C7D35224BD3207AB80A296EDBD6B104C33DC5046C450CAAB7832588C740B3989",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[24]/div[14]/div[2]/div[2]/table/tbody/tr/td[2]/b/span",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00021",
    "modelProfileIds": [
      "model-sm-c867e0d4c69b43bd",
      "model-sm-fe97045b54684c76"
    ],
    "canonicalAbilityId": null,
    "parameters": {},
    "status": "TEXT_ONLY_SOURCE_BACKED",
    "reason": "Army reference does not unconditionally execute the referenced Army Rule."
  },
  {
    "id": "reference-sm-3669dbbf7e2348b2",
    "ownerId": "unit-sm-70b477e461b5487a",
    "sourceEntityId": "sm-source-e04119d6e6234189",
    "quote": "Transhuman Strategist",
    "sourceFieldSha256": "069C48F23FB8A287AFDFFB14DBE8DEB12F57374BAE9FAF3CCF0FFDAD0B24383B",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[6]/div[2]/div[2]/div[2]/table/tbody/tr[2]/td[2]/b/span[2]",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00266",
    "modelProfileIds": [
      "model-sm-39a9e28bbe2946fc"
    ],
    "canonicalAbilityId": null,
    "parameters": {},
    "status": "TEXT_ONLY_SOURCE_BACKED",
    "reason": "Army reference does not unconditionally execute the referenced Army Rule."
  },
  {
    "id": "reference-sm-37bfb6df7a6c412f",
    "ownerId": "unit-sm-4a2efa64a7c34868",
    "sourceEntityId": "sm-source-41f3596fb1c34fe7",
    "quote": "Scouts 6\"",
    "sourceFieldSha256": "5C83784955DE6C8879C40A37717633723B88859C178B1B3CFD7EE672FD0A7747",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[10]/div[40]/div[2]/div[2]/table/tbody/tr[1]/td[2]/b/span[3]",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00050",
    "modelProfileIds": [
      "model-sm-bac20d38c951432f"
    ],
    "canonicalAbilityId": "core-scouts",
    "parameters": {
      "range": 6
    },
    "status": "EXECUTABLE_PROVEN",
    "reason": "Native MODEL ability presence and source parameters; battle events are not simulated."
  },
  {
    "id": "reference-sm-38df360c44da4079",
    "ownerId": "unit-sm-c9c30c70c3394fb6",
    "sourceEntityId": "sm-source-01225607e1ee427d",
    "quote": "Damaged 4",
    "sourceFieldSha256": "8C4C45FC7CC2CAD154C4ECA6B08E50B8B57B5185BC8CFC9F6F9DA2598B2EAD8E",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[32]/div[2]/div[2]/div[2]/table/tbody/tr[1]/td[2]/b/span[1]",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00128",
    "modelProfileIds": [
      "model-sm-206b3106ed5644b1"
    ],
    "canonicalAbilityId": null,
    "parameters": {},
    "status": "TEXT_ONLY_SOURCE_BACKED",
    "reason": "Damaged requires current remaining wounds and battle-state hit roll evaluation."
  },
  {
    "id": "reference-sm-395678b7613242b5",
    "ownerId": "unit-sm-4cd4bf89720c4fa0",
    "sourceEntityId": "sm-source-38956e87a9174e5b",
    "quote": "Combat Doctrines",
    "sourceFieldSha256": "C7D35224BD3207AB80A296EDBD6B104C33DC5046C450CAAB7832588C740B3989",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[12]/div[4]/div[2]/div[2]/table/tbody/tr[2]/td[2]/b/span",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00021",
    "modelProfileIds": [
      "model-sm-8a17f615197f4701"
    ],
    "canonicalAbilityId": null,
    "parameters": {},
    "status": "TEXT_ONLY_SOURCE_BACKED",
    "reason": "Army reference does not unconditionally execute the referenced Army Rule."
  },
  {
    "id": "reference-sm-397c3b6e0d9d4e61",
    "ownerId": "unit-sm-c60b9f00ff7a42b0",
    "sourceEntityId": "sm-source-7a7b15e0920f451f",
    "quote": "Librarius",
    "sourceFieldSha256": "2382D655AC455E45F736CCF4436CC8E7460F4095F9E2AF2EE244737FEE7B5218",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[10]/div[32]/div[2]/div[2]/table/tbody/tr[2]/td[2]/b/span[2]",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00265",
    "modelProfileIds": [
      "model-sm-59d08205b88c43e9"
    ],
    "canonicalAbilityId": null,
    "parameters": {},
    "status": "TEXT_ONLY_SOURCE_BACKED",
    "reason": "Army reference does not unconditionally execute the referenced Army Rule."
  },
  {
    "id": "reference-sm-39efc1dba0a84a2e",
    "ownerId": "unit-sm-e62a5d7c19b24d57",
    "sourceEntityId": "sm-source-2f1fc99d8afc4c20",
    "quote": "Stealth",
    "sourceFieldSha256": "526A40A447DDD7AA52D34BB62DBF1DA04DC4ABA8403769D239ADE80893FFEF7A",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[10]/div[16]/div[2]/div[2]/table/tbody/tr[1]/td[2]/b/span[5]",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00032",
    "modelProfileIds": [
      "model-sm-10bbe7774ccf491d"
    ],
    "canonicalAbilityId": "core-stealth",
    "parameters": {},
    "status": "EXECUTABLE_PROVEN",
    "reason": "Native MODEL ability presence and source parameters; battle events are not simulated."
  },
  {
    "id": "reference-sm-39f15039873040d4",
    "ownerId": "unit-sm-3815e40077e44702",
    "sourceEntityId": "sm-source-c5eb6ccc4ed24625",
    "quote": "Scouts 6\"",
    "sourceFieldSha256": "5C83784955DE6C8879C40A37717633723B88859C178B1B3CFD7EE672FD0A7747",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[24]/div[28]/div[2]/div[2]/table/tbody/tr[1]/td[2]/b/span[2]",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00050",
    "modelProfileIds": [
      "model-sm-d7046e99a5a6435d",
      "model-sm-baefdeccd0c84ffa"
    ],
    "canonicalAbilityId": "core-scouts",
    "parameters": {
      "range": 6
    },
    "status": "EXECUTABLE_PROVEN",
    "reason": "Native MODEL ability presence and source parameters; battle events are not simulated."
  },
  {
    "id": "reference-sm-3aa40eb494134477",
    "ownerId": "unit-sm-96f12b073f4649c7",
    "sourceEntityId": "sm-source-5e1dcc39c8844d1b",
    "quote": "Combat Doctrines",
    "sourceFieldSha256": "C7D35224BD3207AB80A296EDBD6B104C33DC5046C450CAAB7832588C740B3989",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[10]/div[42]/div[2]/div[2]/table/tbody/tr[2]/td[2]/b/span",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00021",
    "modelProfileIds": [
      "model-sm-1c11eb57409a4d9b"
    ],
    "canonicalAbilityId": null,
    "parameters": {},
    "status": "TEXT_ONLY_SOURCE_BACKED",
    "reason": "Army reference does not unconditionally execute the referenced Army Rule."
  },
  {
    "id": "reference-sm-3bfac738ce604226",
    "ownerId": "unit-sm-e62a5d7c19b24d57",
    "sourceEntityId": "sm-source-bbf58f5d44b24ec7",
    "quote": "Leader",
    "sourceFieldSha256": "3F53871B0838BDF343A3A0CDBCFCBC28EF7E30A4FC8E032C3376431DE4D2F7DB",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[10]/div[16]/div[2]/div[2]/table/tbody/tr[1]/td[2]/b/span[3]",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00264",
    "modelProfileIds": [
      "model-sm-10bbe7774ccf491d"
    ],
    "canonicalAbilityId": null,
    "parameters": {},
    "status": "TEXT_ONLY_SOURCE_BACKED",
    "reason": "Leader/Support role is resolved by conditional central MFM relations, not an unconditional native ability."
  },
  {
    "id": "reference-sm-3ecac399cbba4ab0",
    "ownerId": "unit-sm-1330b7672f934fd8",
    "sourceEntityId": "sm-source-fd1e4a9ea60d448f",
    "quote": "Combat Doctrines",
    "sourceFieldSha256": "C7D35224BD3207AB80A296EDBD6B104C33DC5046C450CAAB7832588C740B3989",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[10]/div[36]/div[2]/div[2]/table/tbody/tr[2]/td[2]/b/span[1]",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00021",
    "modelProfileIds": [
      "model-sm-b02318906963426a"
    ],
    "canonicalAbilityId": null,
    "parameters": {},
    "status": "TEXT_ONLY_SOURCE_BACKED",
    "reason": "Army reference does not unconditionally execute the referenced Army Rule."
  },
  {
    "id": "reference-sm-3f8f95e9148c49bc",
    "ownerId": "unit-sm-b994e641eaea4060",
    "sourceEntityId": "sm-source-ce25afa854bf405b",
    "quote": "Leader",
    "sourceFieldSha256": "3F53871B0838BDF343A3A0CDBCFCBC28EF7E30A4FC8E032C3376431DE4D2F7DB",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[10]/div[24]/div[2]/div[2]/table/tbody/tr[1]/td[2]/b/span[2]",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00264",
    "modelProfileIds": [
      "model-sm-8ec7500054ae49f0"
    ],
    "canonicalAbilityId": null,
    "parameters": {},
    "status": "TEXT_ONLY_SOURCE_BACKED",
    "reason": "Leader/Support role is resolved by conditional central MFM relations, not an unconditional native ability."
  },
  {
    "id": "reference-sm-4046476319d74487",
    "ownerId": "unit-sm-5ce71f2f4e5e4ebb",
    "sourceEntityId": "sm-source-e8bbb0253ada47f6",
    "quote": "Combat Doctrines",
    "sourceFieldSha256": "C7D35224BD3207AB80A296EDBD6B104C33DC5046C450CAAB7832588C740B3989",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[24]/div[32]/div[2]/div[2]/table/tbody/tr[2]/td[2]/b/span",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00021",
    "modelProfileIds": [
      "model-sm-9229dcfcb0d4472d",
      "model-sm-41730e5a9b8540d9"
    ],
    "canonicalAbilityId": null,
    "parameters": {},
    "status": "TEXT_ONLY_SOURCE_BACKED",
    "reason": "Army reference does not unconditionally execute the referenced Army Rule."
  },
  {
    "id": "reference-sm-418e766cf3ff42c1",
    "ownerId": "unit-sm-4f6baee09b3248a6",
    "sourceEntityId": "sm-source-1b81df35f73b4692",
    "quote": "Damaged 4",
    "sourceFieldSha256": "8C4C45FC7CC2CAD154C4ECA6B08E50B8B57B5185BC8CFC9F6F9DA2598B2EAD8E",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[34]/div[2]/div[2]/div[2]/table/tbody/tr[1]/td[2]/b/span[1]",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00128",
    "modelProfileIds": [
      "model-sm-4d06dc05dfea42ef"
    ],
    "canonicalAbilityId": null,
    "parameters": {},
    "status": "TEXT_ONLY_SOURCE_BACKED",
    "reason": "Damaged requires current remaining wounds and battle-state hit roll evaluation."
  },
  {
    "id": "reference-sm-432319cda1cc4035",
    "ownerId": "unit-sm-70b477e461b5487a",
    "sourceEntityId": "sm-source-2099d559b9a2472b",
    "quote": "Leader",
    "sourceFieldSha256": "3F53871B0838BDF343A3A0CDBCFCBC28EF7E30A4FC8E032C3376431DE4D2F7DB",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[6]/div[2]/div[2]/div[2]/table/tbody/tr[1]/td[2]/b/span",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00264",
    "modelProfileIds": [
      "model-sm-39a9e28bbe2946fc"
    ],
    "canonicalAbilityId": null,
    "parameters": {},
    "status": "TEXT_ONLY_SOURCE_BACKED",
    "reason": "Leader/Support role is resolved by conditional central MFM relations, not an unconditional native ability."
  },
  {
    "id": "reference-sm-43754f9fd27a4741",
    "ownerId": "unit-sm-70b477e461b5487a",
    "sourceEntityId": "sm-source-b7cddf3c7b134b5a",
    "quote": "Combat Doctrines",
    "sourceFieldSha256": "C7D35224BD3207AB80A296EDBD6B104C33DC5046C450CAAB7832588C740B3989",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[6]/div[2]/div[2]/div[2]/table/tbody/tr[2]/td[2]/b/span[1]",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00021",
    "modelProfileIds": [
      "model-sm-39a9e28bbe2946fc"
    ],
    "canonicalAbilityId": null,
    "parameters": {},
    "status": "TEXT_ONLY_SOURCE_BACKED",
    "reason": "Army reference does not unconditionally execute the referenced Army Rule."
  },
  {
    "id": "reference-sm-4478ae4b8a554b78",
    "ownerId": "unit-sm-bc4486ac79ec477f",
    "sourceEntityId": "sm-source-c61e366d47704e02",
    "quote": "Scouts 6\"",
    "sourceFieldSha256": "5C83784955DE6C8879C40A37717633723B88859C178B1B3CFD7EE672FD0A7747",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[10]/div[34]/div[2]/div[2]/table/tbody/tr[1]/td[2]/b/span[4]",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00050",
    "modelProfileIds": [
      "model-sm-d4e935e883504d63"
    ],
    "canonicalAbilityId": "core-scouts",
    "parameters": {
      "range": 6
    },
    "status": "EXECUTABLE_PROVEN",
    "reason": "Native MODEL ability presence and source parameters; battle events are not simulated."
  },
  {
    "id": "reference-sm-4595527fc04045e2",
    "ownerId": "unit-sm-02d5dee4717544ad",
    "sourceEntityId": "sm-source-d1a6450c1b5f4d6d",
    "quote": "Combat Doctrines",
    "sourceFieldSha256": "C7D35224BD3207AB80A296EDBD6B104C33DC5046C450CAAB7832588C740B3989",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[2]/div[10]/div[2]/div[2]/table/tbody/tr[2]/td[2]/b/span[1]",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00021",
    "modelProfileIds": [
      "model-sm-d659e880bdc74ce3"
    ],
    "canonicalAbilityId": null,
    "parameters": {},
    "status": "TEXT_ONLY_SOURCE_BACKED",
    "reason": "Army reference does not unconditionally execute the referenced Army Rule."
  },
  {
    "id": "reference-sm-459da3063da24c70",
    "ownerId": "unit-sm-3815e40077e44702",
    "sourceEntityId": "sm-source-c20d11260f1242b4",
    "quote": "Combat Doctrines",
    "sourceFieldSha256": "C7D35224BD3207AB80A296EDBD6B104C33DC5046C450CAAB7832588C740B3989",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[24]/div[28]/div[2]/div[2]/table/tbody/tr[2]/td[2]/b/span",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00021",
    "modelProfileIds": [
      "model-sm-d7046e99a5a6435d",
      "model-sm-baefdeccd0c84ffa"
    ],
    "canonicalAbilityId": null,
    "parameters": {},
    "status": "TEXT_ONLY_SOURCE_BACKED",
    "reason": "Army reference does not unconditionally execute the referenced Army Rule."
  },
  {
    "id": "reference-sm-46498ff536c741fa",
    "ownerId": "unit-sm-bc1a331111b142d9",
    "sourceEntityId": "sm-source-302b98a6f7af41da",
    "quote": "Combat Doctrines",
    "sourceFieldSha256": "C7D35224BD3207AB80A296EDBD6B104C33DC5046C450CAAB7832588C740B3989",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[24]/div[4]/div[2]/div[2]/table/tbody/tr[2]/td[2]/b/span",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00021",
    "modelProfileIds": [
      "model-sm-27b12c6f365c4055",
      "model-sm-83f995776bf94667"
    ],
    "canonicalAbilityId": null,
    "parameters": {},
    "status": "TEXT_ONLY_SOURCE_BACKED",
    "reason": "Army reference does not unconditionally execute the referenced Army Rule."
  },
  {
    "id": "reference-sm-4d801df19b0c4284",
    "ownerId": "unit-sm-984b95cebb2f47d9",
    "sourceEntityId": "sm-source-995b9d4e5a3b4b6a",
    "quote": "Combat Doctrines",
    "sourceFieldSha256": "C7D35224BD3207AB80A296EDBD6B104C33DC5046C450CAAB7832588C740B3989",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[14]/div[4]/div[2]/div[2]/table/tbody/tr/td[2]/b/span",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00021",
    "modelProfileIds": [
      "model-sm-cbb67795cccc4c9c",
      "model-sm-84a9ed1d75af4b31"
    ],
    "canonicalAbilityId": null,
    "parameters": {},
    "status": "TEXT_ONLY_SOURCE_BACKED",
    "reason": "Army reference does not unconditionally execute the referenced Army Rule."
  },
  {
    "id": "reference-sm-4db78d0646434392",
    "ownerId": "unit-sm-59162946fee84360",
    "sourceEntityId": "sm-source-a1debfa048744ec1",
    "quote": "Combat Doctrines",
    "sourceFieldSha256": "C7D35224BD3207AB80A296EDBD6B104C33DC5046C450CAAB7832588C740B3989",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[14]/div[6]/div[2]/div[2]/table/tbody/tr/td[2]/b/span",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00021",
    "modelProfileIds": [
      "model-sm-767e354c54c84193",
      "model-sm-d8eb66e101ca497b"
    ],
    "canonicalAbilityId": null,
    "parameters": {},
    "status": "TEXT_ONLY_SOURCE_BACKED",
    "reason": "Army reference does not unconditionally execute the referenced Army Rule."
  },
  {
    "id": "reference-sm-4de37c58f2814811",
    "ownerId": "unit-sm-d0a8c043f5c24b22",
    "sourceEntityId": "sm-source-d7acc07a5cf340bf",
    "quote": "Damaged 6",
    "sourceFieldSha256": "DE458EDA4905A7A939808C01FC175C3F670D113A5EE194827BB5211FD159CFEE",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[30]/div[10]/div[2]/div[2]/table/tbody/tr[1]/td[2]/b/span[1]",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00128",
    "modelProfileIds": [
      "model-sm-ba05e600c5ff45f3"
    ],
    "canonicalAbilityId": null,
    "parameters": {},
    "status": "TEXT_ONLY_SOURCE_BACKED",
    "reason": "Damaged requires current remaining wounds and battle-state hit roll evaluation."
  },
  {
    "id": "reference-sm-4f175dd4667542af",
    "ownerId": "unit-sm-ad36b4f4c8f14a97",
    "sourceEntityId": "sm-source-5215002cc7874dfb",
    "quote": "Transhuman Strategist",
    "sourceFieldSha256": "069C48F23FB8A287AFDFFB14DBE8DEB12F57374BAE9FAF3CCF0FFDAD0B24383B",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[2]/div[14]/div[2]/div[2]/table/tbody/tr[2]/td[2]/b/span[2]",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00266",
    "modelProfileIds": [
      "model-sm-7fe144bba1d44cf5"
    ],
    "canonicalAbilityId": null,
    "parameters": {},
    "status": "TEXT_ONLY_SOURCE_BACKED",
    "reason": "Army reference does not unconditionally execute the referenced Army Rule."
  },
  {
    "id": "reference-sm-4ff722c339b542af",
    "ownerId": "unit-sm-ac0e865c5ab94c9b",
    "sourceEntityId": "sm-source-17e57f32dfcb462f",
    "quote": "Feel No Pain 5+",
    "sourceFieldSha256": "F40249EF06CDF1CDDC339040E0D4703E1814443BA055186E12DE951372E8F455",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[2]/div[6]/div[2]/div[2]/table/tbody/tr[1]/td[2]/b/span[2]",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00022",
    "modelProfileIds": [
      "model-sm-9c0eeeac90f44de9"
    ],
    "canonicalAbilityId": "core-feel-no-pain",
    "parameters": {
      "value": 5
    },
    "status": "EXECUTABLE_PROVEN",
    "reason": "Native MODEL ability presence and source parameters; battle events are not simulated."
  },
  {
    "id": "reference-sm-506b9d484fbf4fdf",
    "ownerId": "unit-sm-f4717a6371254e73",
    "sourceEntityId": "sm-source-5587f9cf265f4b82",
    "quote": "Combat Doctrines",
    "sourceFieldSha256": "C7D35224BD3207AB80A296EDBD6B104C33DC5046C450CAAB7832588C740B3989",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[32]/div[14]/div[2]/div[2]/table/tbody/tr[2]/td[2]/b/span",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00021",
    "modelProfileIds": [
      "model-sm-bbae71c1fb584a16"
    ],
    "canonicalAbilityId": null,
    "parameters": {},
    "status": "TEXT_ONLY_SOURCE_BACKED",
    "reason": "Army reference does not unconditionally execute the referenced Army Rule."
  },
  {
    "id": "reference-sm-51edad4111cc4d76",
    "ownerId": "unit-sm-004d28cd5dca4a1e",
    "sourceEntityId": "sm-source-2806370608924d3d",
    "quote": "Deadly Demise D3",
    "sourceFieldSha256": "D265C9B278EBD2413359FD63CD7DC32E7106EA9AC45DC46DDC393F7CE65FB7FF",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[34]/div[6]/div[2]/div[2]/table/tbody/tr[1]/td[2]/b/span[2]",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00089",
    "modelProfileIds": [
      "model-sm-16efbc04606b44da"
    ],
    "canonicalAbilityId": "core-deadly-demise",
    "parameters": {
      "value": "D3"
    },
    "status": "EXECUTABLE_PROVEN",
    "reason": "Native MODEL ability presence and source parameters; battle events are not simulated."
  },
  {
    "id": "reference-sm-523505d237e64595",
    "ownerId": "unit-sm-004d28cd5dca4a1e",
    "sourceEntityId": "sm-source-52f6de10d63c4e4d",
    "quote": "Combat Doctrines",
    "sourceFieldSha256": "C7D35224BD3207AB80A296EDBD6B104C33DC5046C450CAAB7832588C740B3989",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[34]/div[6]/div[2]/div[2]/table/tbody/tr[2]/td[2]/b/span",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00021",
    "modelProfileIds": [
      "model-sm-16efbc04606b44da"
    ],
    "canonicalAbilityId": null,
    "parameters": {},
    "status": "TEXT_ONLY_SOURCE_BACKED",
    "reason": "Army reference does not unconditionally execute the referenced Army Rule."
  },
  {
    "id": "reference-sm-534c12389e124609",
    "ownerId": "unit-sm-3d29619313c24850",
    "sourceEntityId": "sm-source-01b12a7296274fb9",
    "quote": "Lone Operative",
    "sourceFieldSha256": "A3B8522CFC6E5A6C88305E79231704A1774509150CBCCD41DF6BAE3055FD3EAF",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[2]/div[4]/div[2]/div[2]/table/tbody/tr[1]/td[2]/b/span[2]",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00097",
    "modelProfileIds": [
      "model-sm-2d677528799548ba"
    ],
    "canonicalAbilityId": "core-lone-operative",
    "parameters": {},
    "status": "EXECUTABLE_PROVEN",
    "reason": "Native MODEL ability presence and source parameters; battle events are not simulated."
  },
  {
    "id": "reference-sm-548c884963c3407d",
    "ownerId": "unit-sm-d44763a8089742c3",
    "sourceEntityId": "sm-source-275f0f7c5fe94138",
    "quote": "Combat Doctrines",
    "sourceFieldSha256": "C7D35224BD3207AB80A296EDBD6B104C33DC5046C450CAAB7832588C740B3989",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[32]/div[12]/div[2]/div[2]/table/tbody/tr[2]/td[2]/b/span",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00021",
    "modelProfileIds": [
      "model-sm-1f9fe91940c340cf"
    ],
    "canonicalAbilityId": null,
    "parameters": {},
    "status": "TEXT_ONLY_SOURCE_BACKED",
    "reason": "Army reference does not unconditionally execute the referenced Army Rule."
  },
  {
    "id": "reference-sm-559fc2eba9de46e1",
    "ownerId": "unit-sm-ac0e865c5ab94c9b",
    "sourceEntityId": "sm-source-4f34a100e579496e",
    "quote": "Leader",
    "sourceFieldSha256": "3F53871B0838BDF343A3A0CDBCFCBC28EF7E30A4FC8E032C3376431DE4D2F7DB",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[2]/div[6]/div[2]/div[2]/table/tbody/tr[1]/td[2]/b/span[3]",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00264",
    "modelProfileIds": [
      "model-sm-9c0eeeac90f44de9"
    ],
    "canonicalAbilityId": null,
    "parameters": {},
    "status": "TEXT_ONLY_SOURCE_BACKED",
    "reason": "Leader/Support role is resolved by conditional central MFM relations, not an unconditional native ability."
  },
  {
    "id": "reference-sm-55f97f95c9664847",
    "ownerId": "unit-sm-bc4486ac79ec477f",
    "sourceEntityId": "sm-source-60111fb774c54693",
    "quote": "Librarius",
    "sourceFieldSha256": "2382D655AC455E45F736CCF4436CC8E7460F4095F9E2AF2EE244737FEE7B5218",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[10]/div[34]/div[2]/div[2]/table/tbody/tr[2]/td[2]/b/span[2]",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00265",
    "modelProfileIds": [
      "model-sm-d4e935e883504d63"
    ],
    "canonicalAbilityId": null,
    "parameters": {},
    "status": "TEXT_ONLY_SOURCE_BACKED",
    "reason": "Army reference does not unconditionally execute the referenced Army Rule."
  },
  {
    "id": "reference-sm-57c9dac7e8fb4ec6",
    "ownerId": "unit-sm-d101fa171b7a40c4",
    "sourceEntityId": "sm-source-2aad62591c424b83",
    "quote": "Deep Strike",
    "sourceFieldSha256": "3C428E37084730EF0C7FCB3A4DF90E292C881C1AD3F31EF93B951D71C10C4AD0",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[10]/div[18]/div[2]/div[2]/table/tbody/tr[1]/td[2]/b/span[1]",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00113",
    "modelProfileIds": [
      "model-sm-bf9fe78a1fa747b5"
    ],
    "canonicalAbilityId": "core-deep-strike",
    "parameters": {},
    "status": "EXECUTABLE_PROVEN",
    "reason": "Native MODEL ability presence and source parameters; battle events are not simulated."
  },
  {
    "id": "reference-sm-57d7e82d9c8d4492",
    "ownerId": "unit-sm-fee1a559233f4cbb",
    "sourceEntityId": "sm-source-9c17420010c04495",
    "quote": "Damaged 4",
    "sourceFieldSha256": "8C4C45FC7CC2CAD154C4ECA6B08E50B8B57B5185BC8CFC9F6F9DA2598B2EAD8E",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[34]/div[4]/div[2]/div[2]/table/tbody/tr[1]/td[2]/b/span[1]",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00128",
    "modelProfileIds": [
      "model-sm-60423b86ef164deb"
    ],
    "canonicalAbilityId": null,
    "parameters": {},
    "status": "TEXT_ONLY_SOURCE_BACKED",
    "reason": "Damaged requires current remaining wounds and battle-state hit roll evaluation."
  },
  {
    "id": "reference-sm-5852abf3a9714a28",
    "ownerId": "unit-sm-4a2efa64a7c34868",
    "sourceEntityId": "sm-source-5b7ecc00a4494eba",
    "quote": "Support",
    "sourceFieldSha256": "BE91940B79F469101DF9A50544B6873AA5509A12F1F93F1CB5E3BE3990D344B3",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[10]/div[40]/div[2]/div[2]/table/tbody/tr[1]/td[2]/b/span[4]",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00277",
    "modelProfileIds": [
      "model-sm-bac20d38c951432f"
    ],
    "canonicalAbilityId": null,
    "parameters": {},
    "status": "TEXT_ONLY_SOURCE_BACKED",
    "reason": "Leader/Support role is resolved by conditional central MFM relations, not an unconditional native ability."
  },
  {
    "id": "reference-sm-5910c88c58104aee",
    "ownerId": "unit-sm-e62a5d7c19b24d57",
    "sourceEntityId": "sm-source-8b14c40cdf814f2e",
    "quote": "Transhuman Strategist",
    "sourceFieldSha256": "069C48F23FB8A287AFDFFB14DBE8DEB12F57374BAE9FAF3CCF0FFDAD0B24383B",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[10]/div[16]/div[2]/div[2]/table/tbody/tr[2]/td[2]/b/span[2]",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00266",
    "modelProfileIds": [
      "model-sm-10bbe7774ccf491d"
    ],
    "canonicalAbilityId": null,
    "parameters": {},
    "status": "TEXT_ONLY_SOURCE_BACKED",
    "reason": "Army reference does not unconditionally execute the referenced Army Rule."
  },
  {
    "id": "reference-sm-59b7b0574bb24ccb",
    "ownerId": "unit-sm-047d5023f1a940ed",
    "sourceEntityId": "sm-source-d0cc9b5fd2b54cec",
    "quote": "Combat Doctrines",
    "sourceFieldSha256": "C7D35224BD3207AB80A296EDBD6B104C33DC5046C450CAAB7832588C740B3989",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[20]/div[2]/div[2]/div[2]/table/tbody/tr/td[2]/b/span",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00021",
    "modelProfileIds": [
      "model-sm-d3ab78e570de4e06"
    ],
    "canonicalAbilityId": null,
    "parameters": {},
    "status": "TEXT_ONLY_SOURCE_BACKED",
    "reason": "Army reference does not unconditionally execute the referenced Army Rule."
  },
  {
    "id": "reference-sm-59f7002e29be4fe1",
    "ownerId": "unit-sm-3ce46dddf62b45f1",
    "sourceEntityId": "sm-source-72be2cb46faa48c3",
    "quote": "Combat Doctrines",
    "sourceFieldSha256": "C7D35224BD3207AB80A296EDBD6B104C33DC5046C450CAAB7832588C740B3989",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[24]/div[16]/div[2]/div[2]/table/tbody/tr/td[2]/b/span",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00021",
    "modelProfileIds": [
      "model-sm-43295c1d094a46c1",
      "model-sm-50117f645aa44c8d"
    ],
    "canonicalAbilityId": null,
    "parameters": {},
    "status": "TEXT_ONLY_SOURCE_BACKED",
    "reason": "Army reference does not unconditionally execute the referenced Army Rule."
  },
  {
    "id": "reference-sm-5a30e9bf8e934d2d",
    "ownerId": "unit-sm-a2a8db8a9f124a7f",
    "sourceEntityId": "sm-source-93c6d2fd33e34547",
    "quote": "Support",
    "sourceFieldSha256": "BE91940B79F469101DF9A50544B6873AA5509A12F1F93F1CB5E3BE3990D344B3",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[10]/div[30]/div[2]/div[2]/table/tbody/tr[1]/td[2]/b/span[2]",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00277",
    "modelProfileIds": [
      "model-sm-4677647e191b44dc"
    ],
    "canonicalAbilityId": null,
    "parameters": {},
    "status": "TEXT_ONLY_SOURCE_BACKED",
    "reason": "Leader/Support role is resolved by conditional central MFM relations, not an unconditional native ability."
  },
  {
    "id": "reference-sm-5e74ddae41104ad7",
    "ownerId": "unit-sm-db3ce647d7024b24",
    "sourceEntityId": "sm-source-d2f04625d27e4c6f",
    "quote": "Combat Doctrines",
    "sourceFieldSha256": "C7D35224BD3207AB80A296EDBD6B104C33DC5046C450CAAB7832588C740B3989",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[10]/div[4]/div[2]/div[2]/table/tbody/tr[2]/td[2]/b/span",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00021",
    "modelProfileIds": [
      "model-sm-ffb187aea23b4d91"
    ],
    "canonicalAbilityId": null,
    "parameters": {},
    "status": "TEXT_ONLY_SOURCE_BACKED",
    "reason": "Army reference does not unconditionally execute the referenced Army Rule."
  },
  {
    "id": "reference-sm-60ed604d1094411e",
    "ownerId": "unit-sm-f3366b4701174e71",
    "sourceEntityId": "sm-source-117664322701449c",
    "quote": "Combat Doctrines",
    "sourceFieldSha256": "C7D35224BD3207AB80A296EDBD6B104C33DC5046C450CAAB7832588C740B3989",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[10]/div[6]/div[2]/div[2]/table/tbody/tr[2]/td[2]/b/span",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00021",
    "modelProfileIds": [
      "model-sm-9f593b3aca2f44de"
    ],
    "canonicalAbilityId": null,
    "parameters": {},
    "status": "TEXT_ONLY_SOURCE_BACKED",
    "reason": "Army reference does not unconditionally execute the referenced Army Rule."
  },
  {
    "id": "reference-sm-61dba19276a64688",
    "ownerId": "unit-sm-eb2d6ede583e4473",
    "sourceEntityId": "sm-source-20e447fb8a7e4b5a",
    "quote": "Combat Doctrines",
    "sourceFieldSha256": "C7D35224BD3207AB80A296EDBD6B104C33DC5046C450CAAB7832588C740B3989",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[10]/div[2]/div[2]/div[2]/table/tbody/tr[2]/td[2]/b/span",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00021",
    "modelProfileIds": [
      "model-sm-5daa8f249b234d5e"
    ],
    "canonicalAbilityId": null,
    "parameters": {},
    "status": "TEXT_ONLY_SOURCE_BACKED",
    "reason": "Army reference does not unconditionally execute the referenced Army Rule."
  },
  {
    "id": "reference-sm-62b431737b024880",
    "ownerId": "unit-sm-f169827c554c4eee",
    "sourceEntityId": "sm-source-a54e20cd38394237",
    "quote": "Combat Doctrines",
    "sourceFieldSha256": "C7D35224BD3207AB80A296EDBD6B104C33DC5046C450CAAB7832588C740B3989",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[2]/div[28]/div[2]/div[2]/table/tbody/tr/td[2]/b/span",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00021",
    "modelProfileIds": [
      "model-sm-0e744f442661486e",
      "model-sm-232907bdb18846a8",
      "model-sm-28ca787bfb32419d"
    ],
    "canonicalAbilityId": null,
    "parameters": {},
    "status": "TEXT_ONLY_SOURCE_BACKED",
    "reason": "Army reference does not unconditionally execute the referenced Army Rule."
  },
  {
    "id": "reference-sm-6394ed3026c44597",
    "ownerId": "unit-sm-3d29619313c24850",
    "sourceEntityId": "sm-source-d30df56714374cd1",
    "quote": "Deep Strike",
    "sourceFieldSha256": "3C428E37084730EF0C7FCB3A4DF90E292C881C1AD3F31EF93B951D71C10C4AD0",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[2]/div[4]/div[2]/div[2]/table/tbody/tr[1]/td[2]/b/span[1]",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00113",
    "modelProfileIds": [
      "model-sm-2d677528799548ba"
    ],
    "canonicalAbilityId": "core-deep-strike",
    "parameters": {},
    "status": "EXECUTABLE_PROVEN",
    "reason": "Native MODEL ability presence and source parameters; battle events are not simulated."
  },
  {
    "id": "reference-sm-63a840004c6b4603",
    "ownerId": "unit-sm-d0a8c043f5c24b22",
    "sourceEntityId": "sm-source-f43496e2dc444ce6",
    "quote": "Combat Doctrines",
    "sourceFieldSha256": "C7D35224BD3207AB80A296EDBD6B104C33DC5046C450CAAB7832588C740B3989",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[30]/div[10]/div[2]/div[2]/table/tbody/tr[2]/td[2]/b/span",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00021",
    "modelProfileIds": [
      "model-sm-ba05e600c5ff45f3"
    ],
    "canonicalAbilityId": null,
    "parameters": {},
    "status": "TEXT_ONLY_SOURCE_BACKED",
    "reason": "Army reference does not unconditionally execute the referenced Army Rule."
  },
  {
    "id": "reference-sm-66420691b4724635",
    "ownerId": "unit-sm-c7226873c51d43c0",
    "sourceEntityId": "sm-source-27226374328745db",
    "quote": "Combat Doctrines",
    "sourceFieldSha256": "C7D35224BD3207AB80A296EDBD6B104C33DC5046C450CAAB7832588C740B3989",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[2]/div[32]/div[2]/div[2]/table/tbody/tr[2]/td[2]/b/span",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00021",
    "modelProfileIds": [
      "model-sm-3b16612be262433d",
      "model-sm-c8cf0383f7ad4a77",
      "model-sm-5e6df789f1434020",
      "model-sm-1e6ba64c42ba4d79",
      "model-sm-4d02fb9f504a444d",
      "model-sm-915fe837347f46fb"
    ],
    "canonicalAbilityId": null,
    "parameters": {},
    "status": "TEXT_ONLY_SOURCE_BACKED",
    "reason": "Army reference does not unconditionally execute the referenced Army Rule."
  },
  {
    "id": "reference-sm-682dd1e81c9d4a2b",
    "ownerId": "unit-sm-4ff82a9b79db48da",
    "sourceEntityId": "sm-source-c3bfe2c3cb4446f0",
    "quote": "Stealth",
    "sourceFieldSha256": "526A40A447DDD7AA52D34BB62DBF1DA04DC4ABA8403769D239ADE80893FFEF7A",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[24]/div[10]/div[2]/div[2]/table/tbody/tr[1]/td[2]/b/span[2]",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00032",
    "modelProfileIds": [
      "model-sm-9ca19496ef0543c0",
      "model-sm-ca97b61da4fa490f"
    ],
    "canonicalAbilityId": "core-stealth",
    "parameters": {},
    "status": "EXECUTABLE_PROVEN",
    "reason": "Native MODEL ability presence and source parameters; battle events are not simulated."
  },
  {
    "id": "reference-sm-691e51b26cf541b6",
    "ownerId": "unit-sm-bc9aa3cbedb2415c",
    "sourceEntityId": "sm-source-629172375a0b4011",
    "quote": "Transhuman Strategist",
    "sourceFieldSha256": "069C48F23FB8A287AFDFFB14DBE8DEB12F57374BAE9FAF3CCF0FFDAD0B24383B",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[10]/div[14]/div[2]/div[2]/table/tbody/tr[2]/td[2]/b/span[2]",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00266",
    "modelProfileIds": [
      "model-sm-68dfa445ba8842bb"
    ],
    "canonicalAbilityId": null,
    "parameters": {},
    "status": "TEXT_ONLY_SOURCE_BACKED",
    "reason": "Army reference does not unconditionally execute the referenced Army Rule."
  },
  {
    "id": "reference-sm-6b74a2ef7e7c431c",
    "ownerId": "unit-sm-bc409233f3fe4dc1",
    "sourceEntityId": "sm-source-95608f3117ad4018",
    "quote": "Deadly Demise D6",
    "sourceFieldSha256": "29F11E92385545A97FA5A00DF9DFAE33FECE0DFF1516C93E1A532B3B19862FEF",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[30]/div[2]/div[2]/div[2]/table/tbody/tr[1]/td[2]/b/span[2]",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00089",
    "modelProfileIds": [
      "model-sm-2bc3fdd06d734c1e"
    ],
    "canonicalAbilityId": "core-deadly-demise",
    "parameters": {
      "value": "D6"
    },
    "status": "EXECUTABLE_PROVEN",
    "reason": "Native MODEL ability presence and source parameters; battle events are not simulated."
  },
  {
    "id": "reference-sm-6bbca24007a84ba9",
    "ownerId": "unit-sm-f8bea3d5b0fa44a6",
    "sourceEntityId": "sm-source-c867df3affc2445e",
    "quote": "Transhuman Strategist",
    "sourceFieldSha256": "069C48F23FB8A287AFDFFB14DBE8DEB12F57374BAE9FAF3CCF0FFDAD0B24383B",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[2]/div[16]/div[2]/div[2]/table/tbody/tr[2]/td[2]/b/span[2]",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00266",
    "modelProfileIds": [
      "model-sm-a077d914c99648a8"
    ],
    "canonicalAbilityId": null,
    "parameters": {},
    "status": "TEXT_ONLY_SOURCE_BACKED",
    "reason": "Army reference does not unconditionally execute the referenced Army Rule."
  },
  {
    "id": "reference-sm-6be3c83d083a41c1",
    "ownerId": "unit-sm-46fb0fe9443c4e95",
    "sourceEntityId": "sm-source-fbacf851fbf84653",
    "quote": "Deadly Demise D6",
    "sourceFieldSha256": "29F11E92385545A97FA5A00DF9DFAE33FECE0DFF1516C93E1A532B3B19862FEF",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[30]/div[4]/div[2]/div[2]/table/tbody/tr[1]/td[2]/b/span[2]",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00089",
    "modelProfileIds": [
      "model-sm-af1ec6fca9c84e2c"
    ],
    "canonicalAbilityId": "core-deadly-demise",
    "parameters": {
      "value": "D6"
    },
    "status": "EXECUTABLE_PROVEN",
    "reason": "Native MODEL ability presence and source parameters; battle events are not simulated."
  },
  {
    "id": "reference-sm-6d89922ab5c945d2",
    "ownerId": "unit-sm-4cd4bf89720c4fa0",
    "sourceEntityId": "sm-source-42ba0c0c5c0147f5",
    "quote": "Leader",
    "sourceFieldSha256": "3F53871B0838BDF343A3A0CDBCFCBC28EF7E30A4FC8E032C3376431DE4D2F7DB",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[12]/div[4]/div[2]/div[2]/table/tbody/tr[1]/td[2]/b/span",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00264",
    "modelProfileIds": [
      "model-sm-8a17f615197f4701"
    ],
    "canonicalAbilityId": null,
    "parameters": {},
    "status": "TEXT_ONLY_SOURCE_BACKED",
    "reason": "Leader/Support role is resolved by conditional central MFM relations, not an unconditional native ability."
  },
  {
    "id": "reference-sm-6e2d033313ea4ea8",
    "ownerId": "unit-sm-1330b7672f934fd8",
    "sourceEntityId": "sm-source-7a8d348584824953",
    "quote": "Deep Strike",
    "sourceFieldSha256": "3C428E37084730EF0C7FCB3A4DF90E292C881C1AD3F31EF93B951D71C10C4AD0",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[10]/div[36]/div[2]/div[2]/table/tbody/tr[1]/td[2]/b/span[1]",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00113",
    "modelProfileIds": [
      "model-sm-b02318906963426a"
    ],
    "canonicalAbilityId": "core-deep-strike",
    "parameters": {},
    "status": "EXECUTABLE_PROVEN",
    "reason": "Native MODEL ability presence and source parameters; battle events are not simulated."
  },
  {
    "id": "reference-sm-6f42cf5dca7446b9",
    "ownerId": "unit-sm-65c7cc53e3fc4fc8",
    "sourceEntityId": "sm-source-bc1fc3f84b8d4d6c",
    "quote": "Deadly Demise D6",
    "sourceFieldSha256": "29F11E92385545A97FA5A00DF9DFAE33FECE0DFF1516C93E1A532B3B19862FEF",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[30]/div[6]/div[2]/div[2]/table/tbody/tr[1]/td[2]/b/span[2]",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00089",
    "modelProfileIds": [
      "model-sm-fd036e3c68304306"
    ],
    "canonicalAbilityId": "core-deadly-demise",
    "parameters": {
      "value": "D6"
    },
    "status": "EXECUTABLE_PROVEN",
    "reason": "Native MODEL ability presence and source parameters; battle events are not simulated."
  },
  {
    "id": "reference-sm-6f59b8015967486f",
    "ownerId": "unit-sm-2e0979af1d9040af",
    "sourceEntityId": "sm-source-283c6be6f66745c1",
    "quote": "Transhuman Strategist",
    "sourceFieldSha256": "069C48F23FB8A287AFDFFB14DBE8DEB12F57374BAE9FAF3CCF0FFDAD0B24383B",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[4]/div[2]/div[2]/div[2]/table/tbody/tr[2]/td[2]/b/span[2]",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00266",
    "modelProfileIds": [
      "model-sm-650756a527544afa"
    ],
    "canonicalAbilityId": null,
    "parameters": {},
    "status": "TEXT_ONLY_SOURCE_BACKED",
    "reason": "Army reference does not unconditionally execute the referenced Army Rule."
  },
  {
    "id": "reference-sm-6faffb4f49374b8e",
    "ownerId": "unit-sm-f3366b4701174e71",
    "sourceEntityId": "sm-source-bbaa85570bba4487",
    "quote": "Support",
    "sourceFieldSha256": "BE91940B79F469101DF9A50544B6873AA5509A12F1F93F1CB5E3BE3990D344B3",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[10]/div[6]/div[2]/div[2]/table/tbody/tr[1]/td[2]/b/span",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00277",
    "modelProfileIds": [
      "model-sm-9f593b3aca2f44de"
    ],
    "canonicalAbilityId": null,
    "parameters": {},
    "status": "TEXT_ONLY_SOURCE_BACKED",
    "reason": "Leader/Support role is resolved by conditional central MFM relations, not an unconditional native ability."
  },
  {
    "id": "reference-sm-714c51fc729c4f32",
    "ownerId": "unit-sm-536d38b5ac7645dc",
    "sourceEntityId": "sm-source-50aa6797c3784e3d",
    "quote": "Combat Doctrines",
    "sourceFieldSha256": "C7D35224BD3207AB80A296EDBD6B104C33DC5046C450CAAB7832588C740B3989",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[10]/div[22]/div[2]/div[2]/table/tbody/tr[2]/td[2]/b/span",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00021",
    "modelProfileIds": [
      "model-sm-75a49570c8e74e4d"
    ],
    "canonicalAbilityId": null,
    "parameters": {},
    "status": "TEXT_ONLY_SOURCE_BACKED",
    "reason": "Army reference does not unconditionally execute the referenced Army Rule."
  },
  {
    "id": "reference-sm-718a94e87805473a",
    "ownerId": "unit-sm-f92faa31422041f5",
    "sourceEntityId": "sm-source-cb30b9c82c0d4cfb",
    "quote": "Deep Strike",
    "sourceFieldSha256": "3C428E37084730EF0C7FCB3A4DF90E292C881C1AD3F31EF93B951D71C10C4AD0",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[32]/div[10]/div[2]/div[2]/table/tbody/tr[1]/td[2]/b/span[2]",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00113",
    "modelProfileIds": [
      "model-sm-d6ed8cb50b144291"
    ],
    "canonicalAbilityId": "core-deep-strike",
    "parameters": {},
    "status": "EXECUTABLE_PROVEN",
    "reason": "Native MODEL ability presence and source parameters; battle events are not simulated."
  },
  {
    "id": "reference-sm-71f4b6c28c864fd7",
    "ownerId": "unit-sm-a2a8db8a9f124a7f",
    "sourceEntityId": "sm-source-b0cce1b94df44596",
    "quote": "Combat Doctrines",
    "sourceFieldSha256": "C7D35224BD3207AB80A296EDBD6B104C33DC5046C450CAAB7832588C740B3989",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[10]/div[30]/div[2]/div[2]/table/tbody/tr[2]/td[2]/b/span",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00021",
    "modelProfileIds": [
      "model-sm-4677647e191b44dc"
    ],
    "canonicalAbilityId": null,
    "parameters": {},
    "status": "TEXT_ONLY_SOURCE_BACKED",
    "reason": "Army reference does not unconditionally execute the referenced Army Rule."
  },
  {
    "id": "reference-sm-75b62da9440d42e1",
    "ownerId": "unit-sm-e62a5d7c19b24d57",
    "sourceEntityId": "sm-source-ed760862f3364115",
    "quote": "Combat Doctrines",
    "sourceFieldSha256": "C7D35224BD3207AB80A296EDBD6B104C33DC5046C450CAAB7832588C740B3989",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[10]/div[16]/div[2]/div[2]/table/tbody/tr[2]/td[2]/b/span[1]",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00021",
    "modelProfileIds": [
      "model-sm-10bbe7774ccf491d"
    ],
    "canonicalAbilityId": null,
    "parameters": {},
    "status": "TEXT_ONLY_SOURCE_BACKED",
    "reason": "Army reference does not unconditionally execute the referenced Army Rule."
  },
  {
    "id": "reference-sm-7ae25e21c8f8401c",
    "ownerId": "unit-sm-7ebc58da33c34c58",
    "sourceEntityId": "sm-source-44ad27e5177240b2",
    "quote": "Deadly Demise D3",
    "sourceFieldSha256": "D265C9B278EBD2413359FD63CD7DC32E7106EA9AC45DC46DDC393F7CE65FB7FF",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[16]/div[6]/div[2]/div[2]/table/tbody/tr[1]/td[2]/b/span[1]",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00089",
    "modelProfileIds": [
      "model-sm-11cda2d354e54922"
    ],
    "canonicalAbilityId": "core-deadly-demise",
    "parameters": {
      "value": "D3"
    },
    "status": "EXECUTABLE_PROVEN",
    "reason": "Native MODEL ability presence and source parameters; battle events are not simulated."
  },
  {
    "id": "reference-sm-7b09e50898e749db",
    "ownerId": "unit-sm-6da1ff60a2ff4591",
    "sourceEntityId": "sm-source-75132a6e61c34fa3",
    "quote": "Deadly Demise D3",
    "sourceFieldSha256": "D265C9B278EBD2413359FD63CD7DC32E7106EA9AC45DC46DDC393F7CE65FB7FF",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[32]/div[4]/div[2]/div[2]/table/tbody/tr[1]/td[2]/b/span[1]",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00089",
    "modelProfileIds": [
      "model-sm-ed4194e637664db5"
    ],
    "canonicalAbilityId": "core-deadly-demise",
    "parameters": {
      "value": "D3"
    },
    "status": "EXECUTABLE_PROVEN",
    "reason": "Native MODEL ability presence and source parameters; battle events are not simulated."
  },
  {
    "id": "reference-sm-7c177140984840f4",
    "ownerId": "unit-sm-e75d543e81cf49f3",
    "sourceEntityId": "sm-source-a201041251504605",
    "quote": "Damaged 6",
    "sourceFieldSha256": "DE458EDA4905A7A939808C01FC175C3F670D113A5EE194827BB5211FD159CFEE",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[30]/div[8]/div[2]/div[2]/table/tbody/tr[1]/td[2]/b/span[1]",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00128",
    "modelProfileIds": [
      "model-sm-e1db677cfd3d4af6"
    ],
    "canonicalAbilityId": null,
    "parameters": {},
    "status": "TEXT_ONLY_SOURCE_BACKED",
    "reason": "Damaged requires current remaining wounds and battle-state hit roll evaluation."
  },
  {
    "id": "reference-sm-7e66c00226794e3e",
    "ownerId": "unit-sm-74c53544aa694147",
    "sourceEntityId": "sm-source-0bf334b63cf645e8",
    "quote": "Deep Strike",
    "sourceFieldSha256": "3C428E37084730EF0C7FCB3A4DF90E292C881C1AD3F31EF93B951D71C10C4AD0",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[24]/div[36]/div[2]/div[2]/table/tbody/tr[1]/td[2]/b/span",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00113",
    "modelProfileIds": [
      "model-sm-55bf1242f2bb4dae",
      "model-sm-eaba389795c342e3"
    ],
    "canonicalAbilityId": "core-deep-strike",
    "parameters": {},
    "status": "EXECUTABLE_PROVEN",
    "reason": "Native MODEL ability presence and source parameters; battle events are not simulated."
  },
  {
    "id": "reference-sm-80246d730ad447a5",
    "ownerId": "unit-sm-3d29619313c24850",
    "sourceEntityId": "sm-source-f479dccbc5c7454b",
    "quote": "Stealth",
    "sourceFieldSha256": "526A40A447DDD7AA52D34BB62DBF1DA04DC4ABA8403769D239ADE80893FFEF7A",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[2]/div[4]/div[2]/div[2]/table/tbody/tr[1]/td[2]/b/span[3]",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00032",
    "modelProfileIds": [
      "model-sm-2d677528799548ba"
    ],
    "canonicalAbilityId": "core-stealth",
    "parameters": {},
    "status": "EXECUTABLE_PROVEN",
    "reason": "Native MODEL ability presence and source parameters; battle events are not simulated."
  },
  {
    "id": "reference-sm-826eaa6b4e304c9d",
    "ownerId": "unit-sm-e62a5d7c19b24d57",
    "sourceEntityId": "sm-source-236b9a8bceea4909",
    "quote": "Scouts 6\"",
    "sourceFieldSha256": "5C83784955DE6C8879C40A37717633723B88859C178B1B3CFD7EE672FD0A7747",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[10]/div[16]/div[2]/div[2]/table/tbody/tr[1]/td[2]/b/span[4]",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00050",
    "modelProfileIds": [
      "model-sm-10bbe7774ccf491d"
    ],
    "canonicalAbilityId": "core-scouts",
    "parameters": {
      "range": 6
    },
    "status": "EXECUTABLE_PROVEN",
    "reason": "Native MODEL ability presence and source parameters; battle events are not simulated."
  },
  {
    "id": "reference-sm-83708dbd3c00425b",
    "ownerId": "unit-sm-9e163be8d4bb42c1",
    "sourceEntityId": "sm-source-d9d4f8669ee94256",
    "quote": "Deep Strike",
    "sourceFieldSha256": "3C428E37084730EF0C7FCB3A4DF90E292C881C1AD3F31EF93B951D71C10C4AD0",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[24]/div[34]/div[2]/div[2]/table/tbody/tr[1]/td[2]/b/span",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00113",
    "modelProfileIds": [
      "model-sm-0fcf83855af74d94",
      "model-sm-eb6a88440ae64725"
    ],
    "canonicalAbilityId": "core-deep-strike",
    "parameters": {},
    "status": "EXECUTABLE_PROVEN",
    "reason": "Native MODEL ability presence and source parameters; battle events are not simulated."
  },
  {
    "id": "reference-sm-8381288e2b034afc",
    "ownerId": "unit-sm-1d09de3e7281438a",
    "sourceEntityId": "sm-source-ca637b8f45a8446a",
    "quote": "Combat Doctrines",
    "sourceFieldSha256": "C7D35224BD3207AB80A296EDBD6B104C33DC5046C450CAAB7832588C740B3989",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[10]/div[44]/div[2]/div[2]/table/tbody/tr[2]/td[2]/b/span",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00021",
    "modelProfileIds": [
      "model-sm-26770947c0d14782"
    ],
    "canonicalAbilityId": null,
    "parameters": {},
    "status": "TEXT_ONLY_SOURCE_BACKED",
    "reason": "Army reference does not unconditionally execute the referenced Army Rule."
  },
  {
    "id": "reference-sm-8544ced8f0be491a",
    "ownerId": "unit-sm-1af70808102d4286",
    "sourceEntityId": "sm-source-afc40aa2316845c6",
    "quote": "Deep Strike",
    "sourceFieldSha256": "3C428E37084730EF0C7FCB3A4DF90E292C881C1AD3F31EF93B951D71C10C4AD0",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[2]/div[24]/div[2]/div[2]/table/tbody/tr[1]/td[2]/b/span[1]",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00113",
    "modelProfileIds": [
      "model-sm-8f32fb102ead4603"
    ],
    "canonicalAbilityId": "core-deep-strike",
    "parameters": {},
    "status": "EXECUTABLE_PROVEN",
    "reason": "Native MODEL ability presence and source parameters; battle events are not simulated."
  },
  {
    "id": "reference-sm-859ed8c7a5dc4efd",
    "ownerId": "unit-sm-32e5b655a21342f6",
    "sourceEntityId": "sm-source-f34c231dec8045d0",
    "quote": "Deadly Demise D3",
    "sourceFieldSha256": "D265C9B278EBD2413359FD63CD7DC32E7106EA9AC45DC46DDC393F7CE65FB7FF",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[34]/div[8]/div[2]/div[2]/table/tbody/tr[1]/td[2]/b/span[2]",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00089",
    "modelProfileIds": [
      "model-sm-00a645a59aad47b3"
    ],
    "canonicalAbilityId": "core-deadly-demise",
    "parameters": {
      "value": "D3"
    },
    "status": "EXECUTABLE_PROVEN",
    "reason": "Native MODEL ability presence and source parameters; battle events are not simulated."
  },
  {
    "id": "reference-sm-85e327f9c44a4c7b",
    "ownerId": "unit-sm-4ff82a9b79db48da",
    "sourceEntityId": "sm-source-48bb1f98aa164ee6",
    "quote": "Infiltrators",
    "sourceFieldSha256": "6B1564D0CAD2F0738872C3C952E04F811F7221AE14F7EA1B3E11B8A2E20A07CC",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[24]/div[10]/div[2]/div[2]/table/tbody/tr[1]/td[2]/b/span[1]",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00096",
    "modelProfileIds": [
      "model-sm-9ca19496ef0543c0",
      "model-sm-ca97b61da4fa490f"
    ],
    "canonicalAbilityId": "core-infiltrators",
    "parameters": {},
    "status": "EXECUTABLE_PROVEN",
    "reason": "Native MODEL ability presence and source parameters; battle events are not simulated."
  },
  {
    "id": "reference-sm-8676fc49759b4e9a",
    "ownerId": "unit-sm-65c7cc53e3fc4fc8",
    "sourceEntityId": "sm-source-8d7d8b70b51b4665",
    "quote": "Combat Doctrines",
    "sourceFieldSha256": "C7D35224BD3207AB80A296EDBD6B104C33DC5046C450CAAB7832588C740B3989",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[30]/div[6]/div[2]/div[2]/table/tbody/tr[2]/td[2]/b/span",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00021",
    "modelProfileIds": [
      "model-sm-fd036e3c68304306"
    ],
    "canonicalAbilityId": null,
    "parameters": {},
    "status": "TEXT_ONLY_SOURCE_BACKED",
    "reason": "Army reference does not unconditionally execute the referenced Army Rule."
  },
  {
    "id": "reference-sm-8700beea767845d8",
    "ownerId": "unit-sm-7ebc58da33c34c58",
    "sourceEntityId": "sm-source-14144f8f9b35420f",
    "quote": "Firing Deck 2",
    "sourceFieldSha256": "E0FE395116596DF8BE1DA5B1E2A3CE30FF3BE0BF60669B3E84EEA8A2D72EB4BF",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[16]/div[6]/div[2]/div[2]/table/tbody/tr[1]/td[2]/b/span[2]",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00063",
    "modelProfileIds": [
      "model-sm-11cda2d354e54922"
    ],
    "canonicalAbilityId": "core-firing-deck",
    "parameters": {
      "value": 2
    },
    "status": "EXECUTABLE_PROVEN",
    "reason": "Native MODEL ability presence and source parameters; battle events are not simulated."
  },
  {
    "id": "reference-sm-89db2ad35c8a4fb6",
    "ownerId": "unit-sm-ad36b4f4c8f14a97",
    "sourceEntityId": "sm-source-66be0478f9f748b3",
    "quote": "Leader",
    "sourceFieldSha256": "3F53871B0838BDF343A3A0CDBCFCBC28EF7E30A4FC8E032C3376431DE4D2F7DB",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[2]/div[14]/div[2]/div[2]/table/tbody/tr[1]/td[2]/b/span[2]",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00264",
    "modelProfileIds": [
      "model-sm-7fe144bba1d44cf5"
    ],
    "canonicalAbilityId": null,
    "parameters": {},
    "status": "TEXT_ONLY_SOURCE_BACKED",
    "reason": "Leader/Support role is resolved by conditional central MFM relations, not an unconditional native ability."
  },
  {
    "id": "reference-sm-8bcc994a79874eb7",
    "ownerId": "unit-sm-30663bda6074455f",
    "sourceEntityId": "sm-source-46f78ab14aae4b3f",
    "quote": "Deadly Demise 1",
    "sourceFieldSha256": "7B62E97995837C3FA36BAE0AC8DC773BED3B614EED0FE0D29573EC4C6F2DBA92",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[16]/div[2]/div[2]/div[2]/table/tbody/tr[1]/td[2]/b/span[1]",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00089",
    "modelProfileIds": [
      "model-sm-d81fc4cbf3c0472c"
    ],
    "canonicalAbilityId": "core-deadly-demise",
    "parameters": {
      "value": 1
    },
    "status": "EXECUTABLE_PROVEN",
    "reason": "Native MODEL ability presence and source parameters; battle events are not simulated."
  },
  {
    "id": "reference-sm-8e920603b49146cf",
    "ownerId": "unit-sm-ac0e865c5ab94c9b",
    "sourceEntityId": "sm-source-76181522bf464402",
    "quote": "Transhuman Strategist",
    "sourceFieldSha256": "069C48F23FB8A287AFDFFB14DBE8DEB12F57374BAE9FAF3CCF0FFDAD0B24383B",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[2]/div[6]/div[2]/div[2]/table/tbody/tr[2]/td[2]/b/span[2]",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00266",
    "modelProfileIds": [
      "model-sm-9c0eeeac90f44de9"
    ],
    "canonicalAbilityId": null,
    "parameters": {},
    "status": "TEXT_ONLY_SOURCE_BACKED",
    "reason": "Army reference does not unconditionally execute the referenced Army Rule."
  },
  {
    "id": "reference-sm-8fa9bf8ebaf244fd",
    "ownerId": "unit-sm-7ee313f201ab42cf",
    "sourceEntityId": "sm-source-d943e747eca0405e",
    "quote": "Leader",
    "sourceFieldSha256": "3F53871B0838BDF343A3A0CDBCFCBC28EF7E30A4FC8E032C3376431DE4D2F7DB",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[2]/div[12]/div[2]/div[2]/table/tbody/tr[1]/td[2]/b/span",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00264",
    "modelProfileIds": [
      "model-sm-06a690ddf76a4822"
    ],
    "canonicalAbilityId": null,
    "parameters": {},
    "status": "TEXT_ONLY_SOURCE_BACKED",
    "reason": "Leader/Support role is resolved by conditional central MFM relations, not an unconditional native ability."
  },
  {
    "id": "reference-sm-903e28a002bb47f3",
    "ownerId": "unit-sm-004d28cd5dca4a1e",
    "sourceEntityId": "sm-source-316b2d41f3ef4d03",
    "quote": "Scouts 8\"",
    "sourceFieldSha256": "D8D4AD96378A20C379EEE0A37826DAC85EDB7C66F9675AF0CEFBEC92D5447D26",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[34]/div[6]/div[2]/div[2]/table/tbody/tr[1]/td[2]/b/span[3]",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00050",
    "modelProfileIds": [
      "model-sm-16efbc04606b44da"
    ],
    "canonicalAbilityId": "core-scouts",
    "parameters": {
      "range": 8
    },
    "status": "EXECUTABLE_PROVEN",
    "reason": "Native MODEL ability presence and source parameters; battle events are not simulated."
  },
  {
    "id": "reference-sm-9061a5c63fdf41b3",
    "ownerId": "unit-sm-2e0979af1d9040af",
    "sourceEntityId": "sm-source-8b0f2aef80264cf8",
    "quote": "Feel No Pain 5+",
    "sourceFieldSha256": "F40249EF06CDF1CDDC339040E0D4703E1814443BA055186E12DE951372E8F455",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[4]/div[2]/div[2]/div[2]/table/tbody/tr[1]/td[2]/b/span",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00022",
    "modelProfileIds": [
      "model-sm-650756a527544afa"
    ],
    "canonicalAbilityId": "core-feel-no-pain",
    "parameters": {
      "value": 5
    },
    "status": "EXECUTABLE_PROVEN",
    "reason": "Native MODEL ability presence and source parameters; battle events are not simulated."
  },
  {
    "id": "reference-sm-93a743b4a024442d",
    "ownerId": "unit-sm-bc4486ac79ec477f",
    "sourceEntityId": "sm-source-9b3c7d88b62f4b5f",
    "quote": "Leader",
    "sourceFieldSha256": "3F53871B0838BDF343A3A0CDBCFCBC28EF7E30A4FC8E032C3376431DE4D2F7DB",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[10]/div[34]/div[2]/div[2]/table/tbody/tr[1]/td[2]/b/span[3]",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00264",
    "modelProfileIds": [
      "model-sm-d4e935e883504d63"
    ],
    "canonicalAbilityId": null,
    "parameters": {},
    "status": "TEXT_ONLY_SOURCE_BACKED",
    "reason": "Leader/Support role is resolved by conditional central MFM relations, not an unconditional native ability."
  },
  {
    "id": "reference-sm-93b632da81e34431",
    "ownerId": "unit-sm-74c53544aa694147",
    "sourceEntityId": "sm-source-4f77749cea57496d",
    "quote": "Combat Doctrines",
    "sourceFieldSha256": "C7D35224BD3207AB80A296EDBD6B104C33DC5046C450CAAB7832588C740B3989",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[24]/div[36]/div[2]/div[2]/table/tbody/tr[2]/td[2]/b/span",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00021",
    "modelProfileIds": [
      "model-sm-55bf1242f2bb4dae",
      "model-sm-eaba389795c342e3"
    ],
    "canonicalAbilityId": null,
    "parameters": {},
    "status": "TEXT_ONLY_SOURCE_BACKED",
    "reason": "Army reference does not unconditionally execute the referenced Army Rule."
  },
  {
    "id": "reference-sm-95801d7a10534228",
    "ownerId": "unit-sm-f8bea3d5b0fa44a6",
    "sourceEntityId": "sm-source-3ddb6cb1668b4a5d",
    "quote": "Combat Doctrines",
    "sourceFieldSha256": "C7D35224BD3207AB80A296EDBD6B104C33DC5046C450CAAB7832588C740B3989",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[2]/div[16]/div[2]/div[2]/table/tbody/tr[2]/td[2]/b/span[1]",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00021",
    "modelProfileIds": [
      "model-sm-a077d914c99648a8"
    ],
    "canonicalAbilityId": null,
    "parameters": {},
    "status": "TEXT_ONLY_SOURCE_BACKED",
    "reason": "Army reference does not unconditionally execute the referenced Army Rule."
  },
  {
    "id": "reference-sm-95ae69700a3e4757",
    "ownerId": "unit-sm-f4717a6371254e73",
    "sourceEntityId": "sm-source-551dfda0f4fb4454",
    "quote": "Deep Strike",
    "sourceFieldSha256": "3C428E37084730EF0C7FCB3A4DF90E292C881C1AD3F31EF93B951D71C10C4AD0",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[32]/div[14]/div[2]/div[2]/table/tbody/tr[1]/td[2]/b/span[2]",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00113",
    "modelProfileIds": [
      "model-sm-bbae71c1fb584a16"
    ],
    "canonicalAbilityId": "core-deep-strike",
    "parameters": {},
    "status": "EXECUTABLE_PROVEN",
    "reason": "Native MODEL ability presence and source parameters; battle events are not simulated."
  },
  {
    "id": "reference-sm-967d6c3af93a44ec",
    "ownerId": "unit-sm-5c28c46911224d25",
    "sourceEntityId": "sm-source-41a76d1f268441b1",
    "quote": "Combat Doctrines",
    "sourceFieldSha256": "C7D35224BD3207AB80A296EDBD6B104C33DC5046C450CAAB7832588C740B3989",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[24]/div[2]/div[2]/div[2]/table/tbody/tr/td[2]/b/span",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00021",
    "modelProfileIds": [
      "model-sm-da3b0bc4856c4ad0",
      "model-sm-569a444e4a684cd9"
    ],
    "canonicalAbilityId": null,
    "parameters": {},
    "status": "TEXT_ONLY_SOURCE_BACKED",
    "reason": "Army reference does not unconditionally execute the referenced Army Rule."
  },
  {
    "id": "reference-sm-9862f961533b46f5",
    "ownerId": "unit-sm-e75d543e81cf49f3",
    "sourceEntityId": "sm-source-e53d9df802524409",
    "quote": "Combat Doctrines",
    "sourceFieldSha256": "C7D35224BD3207AB80A296EDBD6B104C33DC5046C450CAAB7832588C740B3989",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[30]/div[8]/div[2]/div[2]/table/tbody/tr[2]/td[2]/b/span",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00021",
    "modelProfileIds": [
      "model-sm-e1db677cfd3d4af6"
    ],
    "canonicalAbilityId": null,
    "parameters": {},
    "status": "TEXT_ONLY_SOURCE_BACKED",
    "reason": "Army reference does not unconditionally execute the referenced Army Rule."
  },
  {
    "id": "reference-sm-9917706de9824e29",
    "ownerId": "unit-sm-4a2efa64a7c34868",
    "sourceEntityId": "sm-source-63cd64e9b16e4ea3",
    "quote": "Infiltrators",
    "sourceFieldSha256": "6B1564D0CAD2F0738872C3C952E04F811F7221AE14F7EA1B3E11B8A2E20A07CC",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[10]/div[40]/div[2]/div[2]/table/tbody/tr[1]/td[2]/b/span[2]",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00096",
    "modelProfileIds": [
      "model-sm-bac20d38c951432f"
    ],
    "canonicalAbilityId": "core-infiltrators",
    "parameters": {},
    "status": "EXECUTABLE_PROVEN",
    "reason": "Native MODEL ability presence and source parameters; battle events are not simulated."
  },
  {
    "id": "reference-sm-996980b0b2c64e2f",
    "ownerId": "unit-sm-bc1a331111b142d9",
    "sourceEntityId": "sm-source-0a02e3f11e93420b",
    "quote": "Deep Strike",
    "sourceFieldSha256": "3C428E37084730EF0C7FCB3A4DF90E292C881C1AD3F31EF93B951D71C10C4AD0",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[24]/div[4]/div[2]/div[2]/table/tbody/tr[1]/td[2]/b/span",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00113",
    "modelProfileIds": [
      "model-sm-27b12c6f365c4055",
      "model-sm-83f995776bf94667"
    ],
    "canonicalAbilityId": "core-deep-strike",
    "parameters": {},
    "status": "EXECUTABLE_PROVEN",
    "reason": "Native MODEL ability presence and source parameters; battle events are not simulated."
  },
  {
    "id": "reference-sm-9986ccc998624789",
    "ownerId": "unit-sm-4660f547cc3744b0",
    "sourceEntityId": "sm-source-22bc59a901084bdf",
    "quote": "Support",
    "sourceFieldSha256": "BE91940B79F469101DF9A50544B6873AA5509A12F1F93F1CB5E3BE3990D344B3",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[10]/div[38]/div[2]/div[2]/table/tbody/tr[1]/td[2]/b/span",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00277",
    "modelProfileIds": [
      "model-sm-43839b5104fe4791"
    ],
    "canonicalAbilityId": null,
    "parameters": {},
    "status": "TEXT_ONLY_SOURCE_BACKED",
    "reason": "Leader/Support role is resolved by conditional central MFM relations, not an unconditional native ability."
  },
  {
    "id": "reference-sm-99ffbdd9a66e4b15",
    "ownerId": "unit-sm-e595c56eab2f493b",
    "sourceEntityId": "sm-source-336f2ca9f6e54e7f",
    "quote": "Combat Doctrines",
    "sourceFieldSha256": "C7D35224BD3207AB80A296EDBD6B104C33DC5046C450CAAB7832588C740B3989",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[10]/div[20]/div[2]/div[2]/table/tbody/tr[2]/td[2]/b/span[1]",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00021",
    "modelProfileIds": [
      "model-sm-787b279449d1493a"
    ],
    "canonicalAbilityId": null,
    "parameters": {},
    "status": "TEXT_ONLY_SOURCE_BACKED",
    "reason": "Army reference does not unconditionally execute the referenced Army Rule."
  },
  {
    "id": "reference-sm-9a5183e79f364609",
    "ownerId": "unit-sm-611995a1ac614acb",
    "sourceEntityId": "sm-source-da733f3bbdb740a8",
    "quote": "Leader",
    "sourceFieldSha256": "3F53871B0838BDF343A3A0CDBCFCBC28EF7E30A4FC8E032C3376431DE4D2F7DB",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[2]/div[2]/div[2]/div[2]/table/tbody/tr[1]/td[2]/b/span",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00264",
    "modelProfileIds": [
      "model-sm-7390bc75a44140c4"
    ],
    "canonicalAbilityId": null,
    "parameters": {},
    "status": "TEXT_ONLY_SOURCE_BACKED",
    "reason": "Leader/Support role is resolved by conditional central MFM relations, not an unconditional native ability."
  },
  {
    "id": "reference-sm-9ae2484d4f564805",
    "ownerId": "unit-sm-e595c56eab2f493b",
    "sourceEntityId": "sm-source-9f2cf45fabb5479a",
    "quote": "Transhuman Strategist",
    "sourceFieldSha256": "069C48F23FB8A287AFDFFB14DBE8DEB12F57374BAE9FAF3CCF0FFDAD0B24383B",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[10]/div[20]/div[2]/div[2]/table/tbody/tr[2]/td[2]/b/span[2]",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00266",
    "modelProfileIds": [
      "model-sm-787b279449d1493a"
    ],
    "canonicalAbilityId": null,
    "parameters": {},
    "status": "TEXT_ONLY_SOURCE_BACKED",
    "reason": "Army reference does not unconditionally execute the referenced Army Rule."
  },
  {
    "id": "reference-sm-9b55dd5dfee34602",
    "ownerId": "unit-sm-bc9aa3cbedb2415c",
    "sourceEntityId": "sm-source-ec8fbf7f933f4dea",
    "quote": "Combat Doctrines",
    "sourceFieldSha256": "C7D35224BD3207AB80A296EDBD6B104C33DC5046C450CAAB7832588C740B3989",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[10]/div[14]/div[2]/div[2]/table/tbody/tr[2]/td[2]/b/span[1]",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00021",
    "modelProfileIds": [
      "model-sm-68dfa445ba8842bb"
    ],
    "canonicalAbilityId": null,
    "parameters": {},
    "status": "TEXT_ONLY_SOURCE_BACKED",
    "reason": "Army reference does not unconditionally execute the referenced Army Rule."
  },
  {
    "id": "reference-sm-9ba20b5f84254a19",
    "ownerId": "unit-sm-bdf36a7ab1d64d50",
    "sourceEntityId": "sm-source-3eea027c04164323",
    "quote": "Leader",
    "sourceFieldSha256": "3F53871B0838BDF343A3A0CDBCFCBC28EF7E30A4FC8E032C3376431DE4D2F7DB",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[2]/div[30]/div[2]/div[2]/table/tbody/tr[1]/td[2]/b/span[2]",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00264",
    "modelProfileIds": [
      "model-sm-19564c3ae075499c"
    ],
    "canonicalAbilityId": null,
    "parameters": {},
    "status": "TEXT_ONLY_SOURCE_BACKED",
    "reason": "Leader/Support role is resolved by conditional central MFM relations, not an unconditional native ability."
  },
  {
    "id": "reference-sm-9babc3e9899c435c",
    "ownerId": "unit-sm-5ce71f2f4e5e4ebb",
    "sourceEntityId": "sm-source-d5eee02a4a7342c7",
    "quote": "Deep Strike",
    "sourceFieldSha256": "3C428E37084730EF0C7FCB3A4DF90E292C881C1AD3F31EF93B951D71C10C4AD0",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[24]/div[32]/div[2]/div[2]/table/tbody/tr[1]/td[2]/b/span",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00113",
    "modelProfileIds": [
      "model-sm-9229dcfcb0d4472d",
      "model-sm-41730e5a9b8540d9"
    ],
    "canonicalAbilityId": "core-deep-strike",
    "parameters": {},
    "status": "EXECUTABLE_PROVEN",
    "reason": "Native MODEL ability presence and source parameters; battle events are not simulated."
  },
  {
    "id": "reference-sm-a24dc8b0036b429b",
    "ownerId": "unit-sm-4fce70f042cc4e5d",
    "sourceEntityId": "sm-source-a597d39789b04cf7",
    "quote": "Combat Doctrines",
    "sourceFieldSha256": "C7D35224BD3207AB80A296EDBD6B104C33DC5046C450CAAB7832588C740B3989",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[16]/div[4]/div[2]/div[2]/table/tbody/tr[2]/td[2]/b/span",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00021",
    "modelProfileIds": [
      "model-sm-4e527c6e24c144f4"
    ],
    "canonicalAbilityId": null,
    "parameters": {},
    "status": "TEXT_ONLY_SOURCE_BACKED",
    "reason": "Army reference does not unconditionally execute the referenced Army Rule."
  },
  {
    "id": "reference-sm-a3683e956ba74f75",
    "ownerId": "unit-sm-1d09de3e7281438a",
    "sourceEntityId": "sm-source-6b00e6ae0b424e89",
    "quote": "Leader",
    "sourceFieldSha256": "3F53871B0838BDF343A3A0CDBCFCBC28EF7E30A4FC8E032C3376431DE4D2F7DB",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[10]/div[44]/div[2]/div[2]/table/tbody/tr[1]/td[2]/b/span",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00264",
    "modelProfileIds": [
      "model-sm-26770947c0d14782"
    ],
    "canonicalAbilityId": null,
    "parameters": {},
    "status": "TEXT_ONLY_SOURCE_BACKED",
    "reason": "Leader/Support role is resolved by conditional central MFM relations, not an unconditional native ability."
  },
  {
    "id": "reference-sm-a4b8e75ea987461e",
    "ownerId": "unit-sm-e595c56eab2f493b",
    "sourceEntityId": "sm-source-1699889761ec4fb1",
    "quote": "Deep Strike",
    "sourceFieldSha256": "3C428E37084730EF0C7FCB3A4DF90E292C881C1AD3F31EF93B951D71C10C4AD0",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[10]/div[20]/div[2]/div[2]/table/tbody/tr[1]/td[2]/b/span[1]",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00113",
    "modelProfileIds": [
      "model-sm-787b279449d1493a"
    ],
    "canonicalAbilityId": "core-deep-strike",
    "parameters": {},
    "status": "EXECUTABLE_PROVEN",
    "reason": "Native MODEL ability presence and source parameters; battle events are not simulated."
  },
  {
    "id": "reference-sm-a544486621604dfc",
    "ownerId": "unit-sm-4f6baee09b3248a6",
    "sourceEntityId": "sm-source-46675bbd3621494d",
    "quote": "Combat Doctrines",
    "sourceFieldSha256": "C7D35224BD3207AB80A296EDBD6B104C33DC5046C450CAAB7832588C740B3989",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[34]/div[2]/div[2]/div[2]/table/tbody/tr[2]/td[2]/b/span",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00021",
    "modelProfileIds": [
      "model-sm-4d06dc05dfea42ef"
    ],
    "canonicalAbilityId": null,
    "parameters": {},
    "status": "TEXT_ONLY_SOURCE_BACKED",
    "reason": "Army reference does not unconditionally execute the referenced Army Rule."
  },
  {
    "id": "reference-sm-a5c6b0ca1d7940a9",
    "ownerId": "unit-sm-9f9e7c18b7354927",
    "sourceEntityId": "sm-source-0f1bcdf6e6ea409a",
    "quote": "Leader",
    "sourceFieldSha256": "3F53871B0838BDF343A3A0CDBCFCBC28EF7E30A4FC8E032C3376431DE4D2F7DB",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[12]/div[2]/div[2]/div[2]/table/tbody/tr[1]/td[2]/b/span",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00264",
    "modelProfileIds": [
      "model-sm-b3f300c033ed47f9"
    ],
    "canonicalAbilityId": null,
    "parameters": {},
    "status": "TEXT_ONLY_SOURCE_BACKED",
    "reason": "Leader/Support role is resolved by conditional central MFM relations, not an unconditional native ability."
  },
  {
    "id": "reference-sm-a648201c7b2b4bc9",
    "ownerId": "unit-sm-30663bda6074455f",
    "sourceEntityId": "sm-source-b44ed9ee6b9a4292",
    "quote": "Combat Doctrines",
    "sourceFieldSha256": "C7D35224BD3207AB80A296EDBD6B104C33DC5046C450CAAB7832588C740B3989",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[16]/div[2]/div[2]/div[2]/table/tbody/tr[2]/td[2]/b/span",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00021",
    "modelProfileIds": [
      "model-sm-d81fc4cbf3c0472c"
    ],
    "canonicalAbilityId": null,
    "parameters": {},
    "status": "TEXT_ONLY_SOURCE_BACKED",
    "reason": "Army reference does not unconditionally execute the referenced Army Rule."
  },
  {
    "id": "reference-sm-a847b4013e4f460f",
    "ownerId": "unit-sm-4a2efa64a7c34868",
    "sourceEntityId": "sm-source-0f26cbcc14c14aa4",
    "quote": "Combat Doctrines",
    "sourceFieldSha256": "C7D35224BD3207AB80A296EDBD6B104C33DC5046C450CAAB7832588C740B3989",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[10]/div[40]/div[2]/div[2]/table/tbody/tr[2]/td[2]/b/span",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00021",
    "modelProfileIds": [
      "model-sm-bac20d38c951432f"
    ],
    "canonicalAbilityId": null,
    "parameters": {},
    "status": "TEXT_ONLY_SOURCE_BACKED",
    "reason": "Army reference does not unconditionally execute the referenced Army Rule."
  },
  {
    "id": "reference-sm-a976aae5c84c48a5",
    "ownerId": "unit-sm-63a015916b46446a",
    "sourceEntityId": "sm-source-95f67b91c77b4fc9",
    "quote": "Support",
    "sourceFieldSha256": "BE91940B79F469101DF9A50544B6873AA5509A12F1F93F1CB5E3BE3990D344B3",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[10]/div[8]/div[2]/div[2]/table/tbody/tr[1]/td[2]/b/span",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00277",
    "modelProfileIds": [
      "model-sm-303a4d0a13024600"
    ],
    "canonicalAbilityId": null,
    "parameters": {},
    "status": "TEXT_ONLY_SOURCE_BACKED",
    "reason": "Leader/Support role is resolved by conditional central MFM relations, not an unconditional native ability."
  },
  {
    "id": "reference-sm-ad23b8903af74fe2",
    "ownerId": "unit-sm-3d29619313c24850",
    "sourceEntityId": "sm-source-e400aeaf65314aa4",
    "quote": "Transhuman Strategist",
    "sourceFieldSha256": "069C48F23FB8A287AFDFFB14DBE8DEB12F57374BAE9FAF3CCF0FFDAD0B24383B",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[2]/div[4]/div[2]/div[2]/table/tbody/tr[2]/td[2]/b/span[2]",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00266",
    "modelProfileIds": [
      "model-sm-2d677528799548ba"
    ],
    "canonicalAbilityId": null,
    "parameters": {},
    "status": "TEXT_ONLY_SOURCE_BACKED",
    "reason": "Army reference does not unconditionally execute the referenced Army Rule."
  },
  {
    "id": "reference-sm-b19d214a7d56419b",
    "ownerId": "unit-sm-55f195878fab446f",
    "sourceEntityId": "sm-source-55b84dbbb4e64c81",
    "quote": "Leader",
    "sourceFieldSha256": "3F53871B0838BDF343A3A0CDBCFCBC28EF7E30A4FC8E032C3376431DE4D2F7DB",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[2]/div[20]/div[2]/div[2]/table/tbody/tr[1]/td[2]/b/span[2]",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00264",
    "modelProfileIds": [
      "model-sm-c30e0bfd59a24622"
    ],
    "canonicalAbilityId": null,
    "parameters": {},
    "status": "TEXT_ONLY_SOURCE_BACKED",
    "reason": "Leader/Support role is resolved by conditional central MFM relations, not an unconditional native ability."
  },
  {
    "id": "reference-sm-b1ab86061f3b4bfe",
    "ownerId": "unit-sm-bc409233f3fe4dc1",
    "sourceEntityId": "sm-source-d826fdef95844510",
    "quote": "Damaged 6",
    "sourceFieldSha256": "DE458EDA4905A7A939808C01FC175C3F670D113A5EE194827BB5211FD159CFEE",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[30]/div[2]/div[2]/div[2]/table/tbody/tr[1]/td[2]/b/span[1]",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00128",
    "modelProfileIds": [
      "model-sm-2bc3fdd06d734c1e"
    ],
    "canonicalAbilityId": null,
    "parameters": {},
    "status": "TEXT_ONLY_SOURCE_BACKED",
    "reason": "Damaged requires current remaining wounds and battle-state hit roll evaluation."
  },
  {
    "id": "reference-sm-b25962bc37914a78",
    "ownerId": "unit-sm-1330b7672f934fd8",
    "sourceEntityId": "sm-source-0c5c6128aeb64a3f",
    "quote": "Librarius",
    "sourceFieldSha256": "2382D655AC455E45F736CCF4436CC8E7460F4095F9E2AF2EE244737FEE7B5218",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[10]/div[36]/div[2]/div[2]/table/tbody/tr[2]/td[2]/b/span[2]",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00265",
    "modelProfileIds": [
      "model-sm-b02318906963426a"
    ],
    "canonicalAbilityId": null,
    "parameters": {},
    "status": "TEXT_ONLY_SOURCE_BACKED",
    "reason": "Army reference does not unconditionally execute the referenced Army Rule."
  },
  {
    "id": "reference-sm-b286c0b946054630",
    "ownerId": "unit-sm-f9d22ec2aff840de",
    "sourceEntityId": "sm-source-3b6c3779bcf94b84",
    "quote": "Combat Doctrines",
    "sourceFieldSha256": "C7D35224BD3207AB80A296EDBD6B104C33DC5046C450CAAB7832588C740B3989",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[2]/div[22]/div[2]/div[2]/table/tbody/tr[2]/td[2]/b/span[1]",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00021",
    "modelProfileIds": [
      "model-sm-427242355ffe4bd4"
    ],
    "canonicalAbilityId": null,
    "parameters": {},
    "status": "TEXT_ONLY_SOURCE_BACKED",
    "reason": "Army reference does not unconditionally execute the referenced Army Rule."
  },
  {
    "id": "reference-sm-b497fedbc39942ff",
    "ownerId": "unit-sm-bdf36a7ab1d64d50",
    "sourceEntityId": "sm-source-f7f001bae5ef4f93",
    "quote": "Combat Doctrines",
    "sourceFieldSha256": "C7D35224BD3207AB80A296EDBD6B104C33DC5046C450CAAB7832588C740B3989",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[2]/div[30]/div[2]/div[2]/table/tbody/tr[2]/td[2]/b/span[1]",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00021",
    "modelProfileIds": [
      "model-sm-19564c3ae075499c"
    ],
    "canonicalAbilityId": null,
    "parameters": {},
    "status": "TEXT_ONLY_SOURCE_BACKED",
    "reason": "Army reference does not unconditionally execute the referenced Army Rule."
  },
  {
    "id": "reference-sm-b4aeb37cf0df4ca3",
    "ownerId": "unit-sm-db3ce647d7024b24",
    "sourceEntityId": "sm-source-50aa4b85fdb641cd",
    "quote": "Deep Strike",
    "sourceFieldSha256": "3C428E37084730EF0C7FCB3A4DF90E292C881C1AD3F31EF93B951D71C10C4AD0",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[10]/div[4]/div[2]/div[2]/table/tbody/tr[1]/td[2]/b/span[1]",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00113",
    "modelProfileIds": [
      "model-sm-ffb187aea23b4d91"
    ],
    "canonicalAbilityId": "core-deep-strike",
    "parameters": {},
    "status": "EXECUTABLE_PROVEN",
    "reason": "Native MODEL ability presence and source parameters; battle events are not simulated."
  },
  {
    "id": "reference-sm-b4b430fe04234348",
    "ownerId": "unit-sm-4a2efa64a7c34868",
    "sourceEntityId": "sm-source-c5f5fce37e204041",
    "quote": "Deep Strike",
    "sourceFieldSha256": "3C428E37084730EF0C7FCB3A4DF90E292C881C1AD3F31EF93B951D71C10C4AD0",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[10]/div[40]/div[2]/div[2]/table/tbody/tr[1]/td[2]/b/span[1]",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00113",
    "modelProfileIds": [
      "model-sm-bac20d38c951432f"
    ],
    "canonicalAbilityId": "core-deep-strike",
    "parameters": {},
    "status": "EXECUTABLE_PROVEN",
    "reason": "Native MODEL ability presence and source parameters; battle events are not simulated."
  },
  {
    "id": "reference-sm-b52b3a499eec4a58",
    "ownerId": "unit-sm-c7226873c51d43c0",
    "sourceEntityId": "sm-source-8d0d611e8a5b4c82",
    "quote": "Support",
    "sourceFieldSha256": "BE91940B79F469101DF9A50544B6873AA5509A12F1F93F1CB5E3BE3990D344B3",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[2]/div[32]/div[2]/div[2]/table/tbody/tr[1]/td[2]/b/span",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00277",
    "modelProfileIds": [
      "model-sm-3b16612be262433d",
      "model-sm-c8cf0383f7ad4a77",
      "model-sm-5e6df789f1434020",
      "model-sm-1e6ba64c42ba4d79",
      "model-sm-4d02fb9f504a444d",
      "model-sm-915fe837347f46fb"
    ],
    "canonicalAbilityId": null,
    "parameters": {},
    "status": "TEXT_ONLY_SOURCE_BACKED",
    "reason": "Leader/Support role is resolved by conditional central MFM relations, not an unconditional native ability."
  },
  {
    "id": "reference-sm-b5b83a3a3243474d",
    "ownerId": "unit-sm-611995a1ac614acb",
    "sourceEntityId": "sm-source-2f1ccb525c704215",
    "quote": "Combat Doctrines",
    "sourceFieldSha256": "C7D35224BD3207AB80A296EDBD6B104C33DC5046C450CAAB7832588C740B3989",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[2]/div[2]/div[2]/div[2]/table/tbody/tr[2]/td[2]/b/span[1]",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00021",
    "modelProfileIds": [
      "model-sm-7390bc75a44140c4"
    ],
    "canonicalAbilityId": null,
    "parameters": {},
    "status": "TEXT_ONLY_SOURCE_BACKED",
    "reason": "Army reference does not unconditionally execute the referenced Army Rule."
  },
  {
    "id": "reference-sm-b69d7bcc28ac4fa8",
    "ownerId": "unit-sm-0dd92e6d8ad54ee6",
    "sourceEntityId": "sm-source-e83f011c74964bae",
    "quote": "Combat Doctrines",
    "sourceFieldSha256": "C7D35224BD3207AB80A296EDBD6B104C33DC5046C450CAAB7832588C740B3989",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[26]/div[4]/div[2]/div[2]/table/tbody/tr/td[2]/b/span",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00021",
    "modelProfileIds": [
      "model-sm-f40b09aa936641fc",
      "model-sm-a491315678334d4f"
    ],
    "canonicalAbilityId": null,
    "parameters": {},
    "status": "TEXT_ONLY_SOURCE_BACKED",
    "reason": "Army reference does not unconditionally execute the referenced Army Rule."
  },
  {
    "id": "reference-sm-b6b6c3c951364e0c",
    "ownerId": "unit-sm-9f9c66dce3814cc5",
    "sourceEntityId": "sm-source-098e42706498459d",
    "quote": "Combat Doctrines",
    "sourceFieldSha256": "C7D35224BD3207AB80A296EDBD6B104C33DC5046C450CAAB7832588C740B3989",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[2]/div[26]/div[2]/div[2]/table/tbody/tr[2]/td[2]/b/span[1]",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00021",
    "modelProfileIds": [
      "model-sm-bc58a7069dd24cac"
    ],
    "canonicalAbilityId": null,
    "parameters": {},
    "status": "TEXT_ONLY_SOURCE_BACKED",
    "reason": "Army reference does not unconditionally execute the referenced Army Rule."
  },
  {
    "id": "reference-sm-b70dfa2edd1f41ba",
    "ownerId": "unit-sm-99eb03d4f2d448e2",
    "sourceEntityId": "sm-source-636454b01fe946c1",
    "quote": "Combat Doctrines",
    "sourceFieldSha256": "C7D35224BD3207AB80A296EDBD6B104C33DC5046C450CAAB7832588C740B3989",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[10]/div[12]/div[2]/div[2]/table/tbody/tr[2]/td[2]/b/span[1]",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00021",
    "modelProfileIds": [
      "model-sm-6b73ec4e731b4220"
    ],
    "canonicalAbilityId": null,
    "parameters": {},
    "status": "TEXT_ONLY_SOURCE_BACKED",
    "reason": "Army reference does not unconditionally execute the referenced Army Rule."
  },
  {
    "id": "reference-sm-b8db76cd3ee24609",
    "ownerId": "unit-sm-96f12b073f4649c7",
    "sourceEntityId": "sm-source-0b040acfd5ef49b0",
    "quote": "Feel No Pain 5+",
    "sourceFieldSha256": "F40249EF06CDF1CDDC339040E0D4703E1814443BA055186E12DE951372E8F455",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[10]/div[42]/div[2]/div[2]/table/tbody/tr[1]/td[2]/b/span[1]",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00022",
    "modelProfileIds": [
      "model-sm-1c11eb57409a4d9b"
    ],
    "canonicalAbilityId": "core-feel-no-pain",
    "parameters": {
      "value": 5
    },
    "status": "EXECUTABLE_PROVEN",
    "reason": "Native MODEL ability presence and source parameters; battle events are not simulated."
  },
  {
    "id": "reference-sm-b8ef17ba95f84f7c",
    "ownerId": "unit-sm-3d29619313c24850",
    "sourceEntityId": "sm-source-15130acd1af049be",
    "quote": "Combat Doctrines",
    "sourceFieldSha256": "C7D35224BD3207AB80A296EDBD6B104C33DC5046C450CAAB7832588C740B3989",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[2]/div[4]/div[2]/div[2]/table/tbody/tr[2]/td[2]/b/span[1]",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00021",
    "modelProfileIds": [
      "model-sm-2d677528799548ba"
    ],
    "canonicalAbilityId": null,
    "parameters": {},
    "status": "TEXT_ONLY_SOURCE_BACKED",
    "reason": "Army reference does not unconditionally execute the referenced Army Rule."
  },
  {
    "id": "reference-sm-b96886e6d79e45b4",
    "ownerId": "unit-sm-536d38b5ac7645dc",
    "sourceEntityId": "sm-source-fc388e456972497d",
    "quote": "Leader",
    "sourceFieldSha256": "3F53871B0838BDF343A3A0CDBCFCBC28EF7E30A4FC8E032C3376431DE4D2F7DB",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[10]/div[22]/div[2]/div[2]/table/tbody/tr[1]/td[2]/b/span",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00264",
    "modelProfileIds": [
      "model-sm-75a49570c8e74e4d"
    ],
    "canonicalAbilityId": null,
    "parameters": {},
    "status": "TEXT_ONLY_SOURCE_BACKED",
    "reason": "Leader/Support role is resolved by conditional central MFM relations, not an unconditional native ability."
  },
  {
    "id": "reference-sm-bb1bddbc064145e0",
    "ownerId": "unit-sm-3816678809d047d2",
    "sourceEntityId": "sm-source-6503468c49cb418e",
    "quote": "Combat Doctrines",
    "sourceFieldSha256": "C7D35224BD3207AB80A296EDBD6B104C33DC5046C450CAAB7832588C740B3989",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[24]/div[18]/div[2]/div[2]/table/tbody/tr[2]/td[2]/b/span",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00021",
    "modelProfileIds": [
      "model-sm-625c28904c2e4f1d",
      "model-sm-ccba7ed5c0a74702"
    ],
    "canonicalAbilityId": null,
    "parameters": {},
    "status": "TEXT_ONLY_SOURCE_BACKED",
    "reason": "Army reference does not unconditionally execute the referenced Army Rule."
  },
  {
    "id": "reference-sm-bc6e837ec3634b8b",
    "ownerId": "unit-sm-3815e40077e44702",
    "sourceEntityId": "sm-source-7bd9127113e449c4",
    "quote": "Infiltrators",
    "sourceFieldSha256": "6B1564D0CAD2F0738872C3C952E04F811F7221AE14F7EA1B3E11B8A2E20A07CC",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[24]/div[28]/div[2]/div[2]/table/tbody/tr[1]/td[2]/b/span[1]",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00096",
    "modelProfileIds": [
      "model-sm-d7046e99a5a6435d",
      "model-sm-baefdeccd0c84ffa"
    ],
    "canonicalAbilityId": "core-infiltrators",
    "parameters": {},
    "status": "EXECUTABLE_PROVEN",
    "reason": "Native MODEL ability presence and source parameters; battle events are not simulated."
  },
  {
    "id": "reference-sm-bc7c72cb34844838",
    "ownerId": "unit-sm-9f9e7c18b7354927",
    "sourceEntityId": "sm-source-d814f55bc1b845f9",
    "quote": "Combat Doctrines",
    "sourceFieldSha256": "C7D35224BD3207AB80A296EDBD6B104C33DC5046C450CAAB7832588C740B3989",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[12]/div[2]/div[2]/div[2]/table/tbody/tr[2]/td[2]/b/span[1]",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00021",
    "modelProfileIds": [
      "model-sm-b3f300c033ed47f9"
    ],
    "canonicalAbilityId": null,
    "parameters": {},
    "status": "TEXT_ONLY_SOURCE_BACKED",
    "reason": "Army reference does not unconditionally execute the referenced Army Rule."
  },
  {
    "id": "reference-sm-bdfed465e3d947ec",
    "ownerId": "unit-sm-99eb03d4f2d448e2",
    "sourceEntityId": "sm-source-910806d62cc14122",
    "quote": "Transhuman Strategist",
    "sourceFieldSha256": "069C48F23FB8A287AFDFFB14DBE8DEB12F57374BAE9FAF3CCF0FFDAD0B24383B",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[10]/div[12]/div[2]/div[2]/table/tbody/tr[2]/td[2]/b/span[2]",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00266",
    "modelProfileIds": [
      "model-sm-6b73ec4e731b4220"
    ],
    "canonicalAbilityId": null,
    "parameters": {},
    "status": "TEXT_ONLY_SOURCE_BACKED",
    "reason": "Army reference does not unconditionally execute the referenced Army Rule."
  },
  {
    "id": "reference-sm-bea4e76a928e4b43",
    "ownerId": "unit-sm-bdf36a7ab1d64d50",
    "sourceEntityId": "sm-source-e1cba23394494607",
    "quote": "Feel No Pain 6+",
    "sourceFieldSha256": "D939BFA69DC95B40F2F70C838E04F66F2ABD01F0CA2BEFB0411CF3C86ECF44CC",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[2]/div[30]/div[2]/div[2]/table/tbody/tr[1]/td[2]/b/span[1]",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00022",
    "modelProfileIds": [
      "model-sm-19564c3ae075499c"
    ],
    "canonicalAbilityId": "core-feel-no-pain",
    "parameters": {
      "value": 6
    },
    "status": "EXECUTABLE_PROVEN",
    "reason": "Native MODEL ability presence and source parameters; battle events are not simulated."
  },
  {
    "id": "reference-sm-bf1782ba35e7487f",
    "ownerId": "unit-sm-c60b9f00ff7a42b0",
    "sourceEntityId": "sm-source-72f4ba4719544722",
    "quote": "Combat Doctrines",
    "sourceFieldSha256": "C7D35224BD3207AB80A296EDBD6B104C33DC5046C450CAAB7832588C740B3989",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[10]/div[32]/div[2]/div[2]/table/tbody/tr[2]/td[2]/b/span[1]",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00021",
    "modelProfileIds": [
      "model-sm-59d08205b88c43e9"
    ],
    "canonicalAbilityId": null,
    "parameters": {},
    "status": "TEXT_ONLY_SOURCE_BACKED",
    "reason": "Army reference does not unconditionally execute the referenced Army Rule."
  },
  {
    "id": "reference-sm-bf443b63401e4fc7",
    "ownerId": "unit-sm-717dd0d07e764a70",
    "sourceEntityId": "sm-source-a135f30a85494a23",
    "quote": "Combat Doctrines",
    "sourceFieldSha256": "C7D35224BD3207AB80A296EDBD6B104C33DC5046C450CAAB7832588C740B3989",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[14]/div[2]/div[2]/div[2]/table/tbody/tr/td[2]/b/span",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00021",
    "modelProfileIds": [
      "model-sm-f08e8030b80346ad",
      "model-sm-9694b8a3bd9142cc"
    ],
    "canonicalAbilityId": null,
    "parameters": {},
    "status": "TEXT_ONLY_SOURCE_BACKED",
    "reason": "Army reference does not unconditionally execute the referenced Army Rule."
  },
  {
    "id": "reference-sm-c0a448d793084ee8",
    "ownerId": "unit-sm-f8bea3d5b0fa44a6",
    "sourceEntityId": "sm-source-17fc35e3f445473d",
    "quote": "Leader",
    "sourceFieldSha256": "3F53871B0838BDF343A3A0CDBCFCBC28EF7E30A4FC8E032C3376431DE4D2F7DB",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[2]/div[16]/div[2]/div[2]/table/tbody/tr[1]/td[2]/b/span[2]",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00264",
    "modelProfileIds": [
      "model-sm-a077d914c99648a8"
    ],
    "canonicalAbilityId": null,
    "parameters": {},
    "status": "TEXT_ONLY_SOURCE_BACKED",
    "reason": "Leader/Support role is resolved by conditional central MFM relations, not an unconditional native ability."
  },
  {
    "id": "reference-sm-c1ef46634c8746bc",
    "ownerId": "unit-sm-d44763a8089742c3",
    "sourceEntityId": "sm-source-4512dd1b671543e0",
    "quote": "Deadly Demise D3",
    "sourceFieldSha256": "D265C9B278EBD2413359FD63CD7DC32E7106EA9AC45DC46DDC393F7CE65FB7FF",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[32]/div[12]/div[2]/div[2]/table/tbody/tr[1]/td[2]/b/span[1]",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00089",
    "modelProfileIds": [
      "model-sm-1f9fe91940c340cf"
    ],
    "canonicalAbilityId": "core-deadly-demise",
    "parameters": {
      "value": "D3"
    },
    "status": "EXECUTABLE_PROVEN",
    "reason": "Native MODEL ability presence and source parameters; battle events are not simulated."
  },
  {
    "id": "reference-sm-c29ffab3b8964a5c",
    "ownerId": "unit-sm-a8f0770187044cbb",
    "sourceEntityId": "sm-source-496f5c4311f041f1",
    "quote": "Damaged 4",
    "sourceFieldSha256": "8C4C45FC7CC2CAD154C4ECA6B08E50B8B57B5185BC8CFC9F6F9DA2598B2EAD8E",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[32]/div[6]/div[2]/div[2]/table/tbody/tr[1]/td[2]/b/span[1]",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00128",
    "modelProfileIds": [
      "model-sm-d0247ef5d2a54ab3"
    ],
    "canonicalAbilityId": null,
    "parameters": {},
    "status": "TEXT_ONLY_SOURCE_BACKED",
    "reason": "Damaged requires current remaining wounds and battle-state hit roll evaluation."
  },
  {
    "id": "reference-sm-c414161b50ab4e22",
    "ownerId": "unit-sm-d44763a8089742c3",
    "sourceEntityId": "sm-source-5f8726546b044b25",
    "quote": "Deep Strike",
    "sourceFieldSha256": "3C428E37084730EF0C7FCB3A4DF90E292C881C1AD3F31EF93B951D71C10C4AD0",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[32]/div[12]/div[2]/div[2]/table/tbody/tr[1]/td[2]/b/span[2]",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00113",
    "modelProfileIds": [
      "model-sm-1f9fe91940c340cf"
    ],
    "canonicalAbilityId": "core-deep-strike",
    "parameters": {},
    "status": "EXECUTABLE_PROVEN",
    "reason": "Native MODEL ability presence and source parameters; battle events are not simulated."
  },
  {
    "id": "reference-sm-c42b8aea4b324adc",
    "ownerId": "unit-sm-7a3f4debefdb4c95",
    "sourceEntityId": "sm-source-b427aa87254e4ea9",
    "quote": "Combat Doctrines",
    "sourceFieldSha256": "C7D35224BD3207AB80A296EDBD6B104C33DC5046C450CAAB7832588C740B3989",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[24]/div[20]/div[2]/div[2]/table/tbody/tr[2]/td[2]/b/span",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00021",
    "modelProfileIds": [
      "model-sm-4f27448438634709",
      "model-sm-178d4e23b9ba4562"
    ],
    "canonicalAbilityId": null,
    "parameters": {},
    "status": "TEXT_ONLY_SOURCE_BACKED",
    "reason": "Army reference does not unconditionally execute the referenced Army Rule."
  },
  {
    "id": "reference-sm-c515ed2c5c9a4bb2",
    "ownerId": "unit-sm-55f195878fab446f",
    "sourceEntityId": "sm-source-623dabe06f884cd5",
    "quote": "Transhuman Strategist",
    "sourceFieldSha256": "069C48F23FB8A287AFDFFB14DBE8DEB12F57374BAE9FAF3CCF0FFDAD0B24383B",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[2]/div[20]/div[2]/div[2]/table/tbody/tr[2]/td[2]/b/span[2]",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00266",
    "modelProfileIds": [
      "model-sm-c30e0bfd59a24622"
    ],
    "canonicalAbilityId": null,
    "parameters": {},
    "status": "TEXT_ONLY_SOURCE_BACKED",
    "reason": "Army reference does not unconditionally execute the referenced Army Rule."
  },
  {
    "id": "reference-sm-c71810b73ae24b62",
    "ownerId": "unit-sm-10396cd2726045a8",
    "sourceEntityId": "sm-source-e68a47602db64175",
    "quote": "Combat Doctrines",
    "sourceFieldSha256": "C7D35224BD3207AB80A296EDBD6B104C33DC5046C450CAAB7832588C740B3989",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[2]/div[8]/div[2]/div[2]/table/tbody/tr[2]/td[2]/b/span[2]",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00021",
    "modelProfileIds": [
      "model-sm-d3448e055f4442b8"
    ],
    "canonicalAbilityId": null,
    "parameters": {},
    "status": "TEXT_ONLY_SOURCE_BACKED",
    "reason": "Army reference does not unconditionally execute the referenced Army Rule."
  },
  {
    "id": "reference-sm-c7ce233f32824c49",
    "ownerId": "unit-sm-fee1a559233f4cbb",
    "sourceEntityId": "sm-source-b5fe4895515747e1",
    "quote": "Deadly Demise D3",
    "sourceFieldSha256": "D265C9B278EBD2413359FD63CD7DC32E7106EA9AC45DC46DDC393F7CE65FB7FF",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[34]/div[4]/div[2]/div[2]/table/tbody/tr[1]/td[2]/b/span[2]",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00089",
    "modelProfileIds": [
      "model-sm-60423b86ef164deb"
    ],
    "canonicalAbilityId": "core-deadly-demise",
    "parameters": {
      "value": "D3"
    },
    "status": "EXECUTABLE_PROVEN",
    "reason": "Native MODEL ability presence and source parameters; battle events are not simulated."
  },
  {
    "id": "reference-sm-c833a8e414e1484c",
    "ownerId": "unit-sm-9f9c66dce3814cc5",
    "sourceEntityId": "sm-source-4c9ce6880c094b9e",
    "quote": "Leader",
    "sourceFieldSha256": "3F53871B0838BDF343A3A0CDBCFCBC28EF7E30A4FC8E032C3376431DE4D2F7DB",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[2]/div[26]/div[2]/div[2]/table/tbody/tr[1]/td[2]/b/span",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00264",
    "modelProfileIds": [
      "model-sm-bc58a7069dd24cac"
    ],
    "canonicalAbilityId": null,
    "parameters": {},
    "status": "TEXT_ONLY_SOURCE_BACKED",
    "reason": "Leader/Support role is resolved by conditional central MFM relations, not an unconditional native ability."
  },
  {
    "id": "reference-sm-c84b73702b0f4d06",
    "ownerId": "unit-sm-f8bea3d5b0fa44a6",
    "sourceEntityId": "sm-source-6e542188679f457c",
    "quote": "Feel No Pain 5+",
    "sourceFieldSha256": "F40249EF06CDF1CDDC339040E0D4703E1814443BA055186E12DE951372E8F455",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[2]/div[16]/div[2]/div[2]/table/tbody/tr[1]/td[2]/b/span[1]",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00022",
    "modelProfileIds": [
      "model-sm-a077d914c99648a8"
    ],
    "canonicalAbilityId": "core-feel-no-pain",
    "parameters": {
      "value": 5
    },
    "status": "EXECUTABLE_PROVEN",
    "reason": "Native MODEL ability presence and source parameters; battle events are not simulated."
  },
  {
    "id": "reference-sm-c9cb37e984f34feb",
    "ownerId": "unit-sm-c60b9f00ff7a42b0",
    "sourceEntityId": "sm-source-2596ebd1adf54799",
    "quote": "Leader",
    "sourceFieldSha256": "3F53871B0838BDF343A3A0CDBCFCBC28EF7E30A4FC8E032C3376431DE4D2F7DB",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[10]/div[32]/div[2]/div[2]/table/tbody/tr[1]/td[2]/b/span",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00264",
    "modelProfileIds": [
      "model-sm-59d08205b88c43e9"
    ],
    "canonicalAbilityId": null,
    "parameters": {},
    "status": "TEXT_ONLY_SOURCE_BACKED",
    "reason": "Leader/Support role is resolved by conditional central MFM relations, not an unconditional native ability."
  },
  {
    "id": "reference-sm-cb794e1b8cb74647",
    "ownerId": "unit-sm-32e5b655a21342f6",
    "sourceEntityId": "sm-source-c87fee9ea4c4471c",
    "quote": "Combat Doctrines",
    "sourceFieldSha256": "C7D35224BD3207AB80A296EDBD6B104C33DC5046C450CAAB7832588C740B3989",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[34]/div[8]/div[2]/div[2]/table/tbody/tr[2]/td[2]/b/span",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00021",
    "modelProfileIds": [
      "model-sm-00a645a59aad47b3"
    ],
    "canonicalAbilityId": null,
    "parameters": {},
    "status": "TEXT_ONLY_SOURCE_BACKED",
    "reason": "Army reference does not unconditionally execute the referenced Army Rule."
  },
  {
    "id": "reference-sm-cc6381d9d5f4413e",
    "ownerId": "unit-sm-d101fa171b7a40c4",
    "sourceEntityId": "sm-source-233c77e70a974774",
    "quote": "Leader",
    "sourceFieldSha256": "3F53871B0838BDF343A3A0CDBCFCBC28EF7E30A4FC8E032C3376431DE4D2F7DB",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[10]/div[18]/div[2]/div[2]/table/tbody/tr[1]/td[2]/b/span[2]",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00264",
    "modelProfileIds": [
      "model-sm-bf9fe78a1fa747b5"
    ],
    "canonicalAbilityId": null,
    "parameters": {},
    "status": "TEXT_ONLY_SOURCE_BACKED",
    "reason": "Leader/Support role is resolved by conditional central MFM relations, not an unconditional native ability."
  },
  {
    "id": "reference-sm-ccf70036b49947be",
    "ownerId": "unit-sm-6da1ff60a2ff4591",
    "sourceEntityId": "sm-source-bcff6d87a08d4a20",
    "quote": "Combat Doctrines",
    "sourceFieldSha256": "C7D35224BD3207AB80A296EDBD6B104C33DC5046C450CAAB7832588C740B3989",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[32]/div[4]/div[2]/div[2]/table/tbody/tr[2]/td[2]/b/span",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00021",
    "modelProfileIds": [
      "model-sm-ed4194e637664db5"
    ],
    "canonicalAbilityId": null,
    "parameters": {},
    "status": "TEXT_ONLY_SOURCE_BACKED",
    "reason": "Army reference does not unconditionally execute the referenced Army Rule."
  },
  {
    "id": "reference-sm-cd0ac23d2dca42a0",
    "ownerId": "unit-sm-55f195878fab446f",
    "sourceEntityId": "sm-source-546beff9def14bca",
    "quote": "Combat Doctrines",
    "sourceFieldSha256": "C7D35224BD3207AB80A296EDBD6B104C33DC5046C450CAAB7832588C740B3989",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[2]/div[20]/div[2]/div[2]/table/tbody/tr[2]/td[2]/b/span[1]",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00021",
    "modelProfileIds": [
      "model-sm-c30e0bfd59a24622"
    ],
    "canonicalAbilityId": null,
    "parameters": {},
    "status": "TEXT_ONLY_SOURCE_BACKED",
    "reason": "Army reference does not unconditionally execute the referenced Army Rule."
  },
  {
    "id": "reference-sm-cfd24bfff4a74c38",
    "ownerId": "unit-sm-c50655aacb564e99",
    "sourceEntityId": "sm-source-58a805f0a94248eb",
    "quote": "Combat Doctrines",
    "sourceFieldSha256": "C7D35224BD3207AB80A296EDBD6B104C33DC5046C450CAAB7832588C740B3989",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[24]/div[8]/div[2]/div[2]/table/tbody/tr/td[2]/b/span",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00021",
    "modelProfileIds": [
      "model-sm-1eb8d9bcffb1480b",
      "model-sm-d25332e5354e4676"
    ],
    "canonicalAbilityId": null,
    "parameters": {},
    "status": "TEXT_ONLY_SOURCE_BACKED",
    "reason": "Army reference does not unconditionally execute the referenced Army Rule."
  },
  {
    "id": "reference-sm-d06757fcae5d4fab",
    "ownerId": "unit-sm-fee1a559233f4cbb",
    "sourceEntityId": "sm-source-e92312a491694197",
    "quote": "Combat Doctrines",
    "sourceFieldSha256": "C7D35224BD3207AB80A296EDBD6B104C33DC5046C450CAAB7832588C740B3989",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[34]/div[4]/div[2]/div[2]/table/tbody/tr[2]/td[2]/b/span",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00021",
    "modelProfileIds": [
      "model-sm-60423b86ef164deb"
    ],
    "canonicalAbilityId": null,
    "parameters": {},
    "status": "TEXT_ONLY_SOURCE_BACKED",
    "reason": "Army reference does not unconditionally execute the referenced Army Rule."
  },
  {
    "id": "reference-sm-d0e236ef62ca47d6",
    "ownerId": "unit-sm-b994e641eaea4060",
    "sourceEntityId": "sm-source-3edc6e4a6ed4486f",
    "quote": "Deep Strike",
    "sourceFieldSha256": "3C428E37084730EF0C7FCB3A4DF90E292C881C1AD3F31EF93B951D71C10C4AD0",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[10]/div[24]/div[2]/div[2]/table/tbody/tr[1]/td[2]/b/span[1]",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00113",
    "modelProfileIds": [
      "model-sm-8ec7500054ae49f0"
    ],
    "canonicalAbilityId": "core-deep-strike",
    "parameters": {},
    "status": "EXECUTABLE_PROVEN",
    "reason": "Native MODEL ability presence and source parameters; battle events are not simulated."
  },
  {
    "id": "reference-sm-d11b3ea1e4294012",
    "ownerId": "unit-sm-bc9aa3cbedb2415c",
    "sourceEntityId": "sm-source-1835ab3438dd416c",
    "quote": "Leader",
    "sourceFieldSha256": "3F53871B0838BDF343A3A0CDBCFCBC28EF7E30A4FC8E032C3376431DE4D2F7DB",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[10]/div[14]/div[2]/div[2]/table/tbody/tr[1]/td[2]/b/span",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00264",
    "modelProfileIds": [
      "model-sm-68dfa445ba8842bb"
    ],
    "canonicalAbilityId": null,
    "parameters": {},
    "status": "TEXT_ONLY_SOURCE_BACKED",
    "reason": "Leader/Support role is resolved by conditional central MFM relations, not an unconditional native ability."
  },
  {
    "id": "reference-sm-d2f71421acd148bc",
    "ownerId": "unit-sm-c9c30c70c3394fb6",
    "sourceEntityId": "sm-source-1f9ed52fd7ec4678",
    "quote": "Combat Doctrines",
    "sourceFieldSha256": "C7D35224BD3207AB80A296EDBD6B104C33DC5046C450CAAB7832588C740B3989",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[32]/div[2]/div[2]/div[2]/table/tbody/tr[2]/td[2]/b/span",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00021",
    "modelProfileIds": [
      "model-sm-206b3106ed5644b1"
    ],
    "canonicalAbilityId": null,
    "parameters": {},
    "status": "TEXT_ONLY_SOURCE_BACKED",
    "reason": "Army reference does not unconditionally execute the referenced Army Rule."
  },
  {
    "id": "reference-sm-d3764403c67a4b68",
    "ownerId": "unit-sm-1af70808102d4286",
    "sourceEntityId": "sm-source-b9704613fc1c466a",
    "quote": "Leader",
    "sourceFieldSha256": "3F53871B0838BDF343A3A0CDBCFCBC28EF7E30A4FC8E032C3376431DE4D2F7DB",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[2]/div[24]/div[2]/div[2]/table/tbody/tr[1]/td[2]/b/span[2]",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00264",
    "modelProfileIds": [
      "model-sm-8f32fb102ead4603"
    ],
    "canonicalAbilityId": null,
    "parameters": {},
    "status": "TEXT_ONLY_SOURCE_BACKED",
    "reason": "Leader/Support role is resolved by conditional central MFM relations, not an unconditional native ability."
  },
  {
    "id": "reference-sm-d3b538b46bf34b41",
    "ownerId": "unit-sm-3460439c3a774c66",
    "sourceEntityId": "sm-source-01dda8618b184fa6",
    "quote": "Support",
    "sourceFieldSha256": "BE91940B79F469101DF9A50544B6873AA5509A12F1F93F1CB5E3BE3990D344B3",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[2]/div[18]/div[2]/div[2]/table/tbody/tr[1]/td[2]/b/span",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00277",
    "modelProfileIds": [
      "model-sm-574846fb8e3e4e77"
    ],
    "canonicalAbilityId": null,
    "parameters": {},
    "status": "TEXT_ONLY_SOURCE_BACKED",
    "reason": "Leader/Support role is resolved by conditional central MFM relations, not an unconditional native ability."
  },
  {
    "id": "reference-sm-d3d4f6bb5d7a486f",
    "ownerId": "unit-sm-24b4709c45ef4b2d",
    "sourceEntityId": "sm-source-512c96acc85244ff",
    "quote": "Combat Doctrines",
    "sourceFieldSha256": "C7D35224BD3207AB80A296EDBD6B104C33DC5046C450CAAB7832588C740B3989",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[24]/div[30]/div[2]/div[2]/table/tbody/tr/td[2]/b/span",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00021",
    "modelProfileIds": [
      "model-sm-5d5ef640648542fa",
      "model-sm-4715f94bacc64dcc"
    ],
    "canonicalAbilityId": null,
    "parameters": {},
    "status": "TEXT_ONLY_SOURCE_BACKED",
    "reason": "Army reference does not unconditionally execute the referenced Army Rule."
  },
  {
    "id": "reference-sm-d49fa4466f7d4fb5",
    "ownerId": "unit-sm-7ee313f201ab42cf",
    "sourceEntityId": "sm-source-825b631afa5f4f42",
    "quote": "Librarius",
    "sourceFieldSha256": "2382D655AC455E45F736CCF4436CC8E7460F4095F9E2AF2EE244737FEE7B5218",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[2]/div[12]/div[2]/div[2]/table/tbody/tr[2]/td[2]/b/span[2]",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00265",
    "modelProfileIds": [
      "model-sm-06a690ddf76a4822"
    ],
    "canonicalAbilityId": null,
    "parameters": {},
    "status": "TEXT_ONLY_SOURCE_BACKED",
    "reason": "Army reference does not unconditionally execute the referenced Army Rule."
  },
  {
    "id": "reference-sm-d778d0a1f47e4ee2",
    "ownerId": "unit-sm-4fce70f042cc4e5d",
    "sourceEntityId": "sm-source-587a6a8e5c294d8c",
    "quote": "Firing Deck 7",
    "sourceFieldSha256": "EBA52C0FF7AFC7A2A83E5503A2231E6817C3AD6CE99708EE3D6A84943CC9D27D",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[16]/div[4]/div[2]/div[2]/table/tbody/tr[1]/td[2]/b/span[2]",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00063",
    "modelProfileIds": [
      "model-sm-4e527c6e24c144f4"
    ],
    "canonicalAbilityId": "core-firing-deck",
    "parameters": {
      "value": 7
    },
    "status": "EXECUTABLE_PROVEN",
    "reason": "Native MODEL ability presence and source parameters; battle events are not simulated."
  },
  {
    "id": "reference-sm-d85d892e7fa5457a",
    "ownerId": "unit-sm-55f195878fab446f",
    "sourceEntityId": "sm-source-02f548ef4d7e4a00",
    "quote": "Lone Operative",
    "sourceFieldSha256": "A3B8522CFC6E5A6C88305E79231704A1774509150CBCCD41DF6BAE3055FD3EAF",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[2]/div[20]/div[2]/div[2]/table/tbody/tr[1]/td[2]/b/span[3]",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00097",
    "modelProfileIds": [
      "model-sm-c30e0bfd59a24622"
    ],
    "canonicalAbilityId": "core-lone-operative",
    "parameters": {},
    "status": "EXECUTABLE_PROVEN",
    "reason": "Native MODEL ability presence and source parameters; battle events are not simulated."
  },
  {
    "id": "reference-sm-d91c791b237840a0",
    "ownerId": "unit-sm-96f12b073f4649c7",
    "sourceEntityId": "sm-source-1a4b15878da24185",
    "quote": "Stealth",
    "sourceFieldSha256": "526A40A447DDD7AA52D34BB62DBF1DA04DC4ABA8403769D239ADE80893FFEF7A",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[10]/div[42]/div[2]/div[2]/table/tbody/tr[1]/td[2]/b/span[4]",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00032",
    "modelProfileIds": [
      "model-sm-1c11eb57409a4d9b"
    ],
    "canonicalAbilityId": "core-stealth",
    "parameters": {},
    "status": "EXECUTABLE_PROVEN",
    "reason": "Native MODEL ability presence and source parameters; battle events are not simulated."
  },
  {
    "id": "reference-sm-dac513948f4c4165",
    "ownerId": "unit-sm-6da1ff60a2ff4591",
    "sourceEntityId": "sm-source-7d4d47f92b5542fc",
    "quote": "Damaged 4",
    "sourceFieldSha256": "8C4C45FC7CC2CAD154C4ECA6B08E50B8B57B5185BC8CFC9F6F9DA2598B2EAD8E",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[32]/div[4]/div[2]/div[2]/table/tbody/tr[1]/td[2]/b/span[2]",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00128",
    "modelProfileIds": [
      "model-sm-ed4194e637664db5"
    ],
    "canonicalAbilityId": null,
    "parameters": {},
    "status": "TEXT_ONLY_SOURCE_BACKED",
    "reason": "Damaged requires current remaining wounds and battle-state hit roll evaluation."
  },
  {
    "id": "reference-sm-dbd7a6b4856b4dd3",
    "ownerId": "unit-sm-eb2d6ede583e4473",
    "sourceEntityId": "sm-source-86004f1014e84592",
    "quote": "Support",
    "sourceFieldSha256": "BE91940B79F469101DF9A50544B6873AA5509A12F1F93F1CB5E3BE3990D344B3",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[10]/div[2]/div[2]/div[2]/table/tbody/tr[1]/td[2]/b/span",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00277",
    "modelProfileIds": [
      "model-sm-5daa8f249b234d5e"
    ],
    "canonicalAbilityId": null,
    "parameters": {},
    "status": "TEXT_ONLY_SOURCE_BACKED",
    "reason": "Leader/Support role is resolved by conditional central MFM relations, not an unconditional native ability."
  },
  {
    "id": "reference-sm-dc906a70259f4826",
    "ownerId": "unit-sm-b994e641eaea4060",
    "sourceEntityId": "sm-source-7bc3d398b64d498d",
    "quote": "Combat Doctrines",
    "sourceFieldSha256": "C7D35224BD3207AB80A296EDBD6B104C33DC5046C450CAAB7832588C740B3989",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[10]/div[24]/div[2]/div[2]/table/tbody/tr[2]/td[2]/b/span",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00021",
    "modelProfileIds": [
      "model-sm-8ec7500054ae49f0"
    ],
    "canonicalAbilityId": null,
    "parameters": {},
    "status": "TEXT_ONLY_SOURCE_BACKED",
    "reason": "Army reference does not unconditionally execute the referenced Army Rule."
  },
  {
    "id": "reference-sm-dcfb72e415394c87",
    "ownerId": "unit-sm-0b0b22ecffa74125",
    "sourceEntityId": "sm-source-291f5acb29d74894",
    "quote": "Support",
    "sourceFieldSha256": "BE91940B79F469101DF9A50544B6873AA5509A12F1F93F1CB5E3BE3990D344B3",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[10]/div[10]/div[2]/div[2]/table/tbody/tr[1]/td[2]/b/span",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00277",
    "modelProfileIds": [
      "model-sm-c279f7ee39b9485b"
    ],
    "canonicalAbilityId": null,
    "parameters": {},
    "status": "TEXT_ONLY_SOURCE_BACKED",
    "reason": "Leader/Support role is resolved by conditional central MFM relations, not an unconditional native ability."
  },
  {
    "id": "reference-sm-dd37107c44504142",
    "ownerId": "unit-sm-ac0e865c5ab94c9b",
    "sourceEntityId": "sm-source-1a6c4592a97845d4",
    "quote": "Deep Strike",
    "sourceFieldSha256": "3C428E37084730EF0C7FCB3A4DF90E292C881C1AD3F31EF93B951D71C10C4AD0",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[2]/div[6]/div[2]/div[2]/table/tbody/tr[1]/td[2]/b/span[1]",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00113",
    "modelProfileIds": [
      "model-sm-9c0eeeac90f44de9"
    ],
    "canonicalAbilityId": "core-deep-strike",
    "parameters": {},
    "status": "EXECUTABLE_PROVEN",
    "reason": "Native MODEL ability presence and source parameters; battle events are not simulated."
  },
  {
    "id": "reference-sm-def23ea31e804e83",
    "ownerId": "unit-sm-d101fa171b7a40c4",
    "sourceEntityId": "sm-source-fc5fb3a7448a4354",
    "quote": "Transhuman Strategist",
    "sourceFieldSha256": "069C48F23FB8A287AFDFFB14DBE8DEB12F57374BAE9FAF3CCF0FFDAD0B24383B",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[10]/div[18]/div[2]/div[2]/table/tbody/tr[2]/td[2]/b/span[2]",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00266",
    "modelProfileIds": [
      "model-sm-bf9fe78a1fa747b5"
    ],
    "canonicalAbilityId": null,
    "parameters": {},
    "status": "TEXT_ONLY_SOURCE_BACKED",
    "reason": "Army reference does not unconditionally execute the referenced Army Rule."
  },
  {
    "id": "reference-sm-df2d9812113c43e6",
    "ownerId": "unit-sm-f4717a6371254e73",
    "sourceEntityId": "sm-source-b9634fb7ca1d441f",
    "quote": "Deadly Demise D3",
    "sourceFieldSha256": "D265C9B278EBD2413359FD63CD7DC32E7106EA9AC45DC46DDC393F7CE65FB7FF",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[32]/div[14]/div[2]/div[2]/table/tbody/tr[1]/td[2]/b/span[1]",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00089",
    "modelProfileIds": [
      "model-sm-bbae71c1fb584a16"
    ],
    "canonicalAbilityId": "core-deadly-demise",
    "parameters": {
      "value": "D3"
    },
    "status": "EXECUTABLE_PROVEN",
    "reason": "Native MODEL ability presence and source parameters; battle events are not simulated."
  },
  {
    "id": "reference-sm-e0952dec13c94a49",
    "ownerId": "unit-sm-30663bda6074455f",
    "sourceEntityId": "sm-source-70aba7aff60249a8",
    "quote": "Deep Strike",
    "sourceFieldSha256": "3C428E37084730EF0C7FCB3A4DF90E292C881C1AD3F31EF93B951D71C10C4AD0",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[16]/div[2]/div[2]/div[2]/table/tbody/tr[1]/td[2]/b/span[2]",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00113",
    "modelProfileIds": [
      "model-sm-d81fc4cbf3c0472c"
    ],
    "canonicalAbilityId": "core-deep-strike",
    "parameters": {},
    "status": "EXECUTABLE_PROVEN",
    "reason": "Native MODEL ability presence and source parameters; battle events are not simulated."
  },
  {
    "id": "reference-sm-e1217f167c194a9a",
    "ownerId": "unit-sm-10396cd2726045a8",
    "sourceEntityId": "sm-source-2daa9b38b64e4a3b",
    "quote": "Feel No Pain 5+",
    "sourceFieldSha256": "F40249EF06CDF1CDDC339040E0D4703E1814443BA055186E12DE951372E8F455",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[2]/div[8]/div[2]/div[2]/table/tbody/tr[1]/td[2]/b/span[1]",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00022",
    "modelProfileIds": [
      "model-sm-d3448e055f4442b8"
    ],
    "canonicalAbilityId": "core-feel-no-pain",
    "parameters": {
      "value": 5
    },
    "status": "EXECUTABLE_PROVEN",
    "reason": "Native MODEL ability presence and source parameters; battle events are not simulated."
  },
  {
    "id": "reference-sm-e1289c0424644bf7",
    "ownerId": "unit-sm-bc4486ac79ec477f",
    "sourceEntityId": "sm-source-c7a1d68b8e1249ef",
    "quote": "Combat Doctrines",
    "sourceFieldSha256": "C7D35224BD3207AB80A296EDBD6B104C33DC5046C450CAAB7832588C740B3989",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[10]/div[34]/div[2]/div[2]/table/tbody/tr[2]/td[2]/b/span[1]",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00021",
    "modelProfileIds": [
      "model-sm-d4e935e883504d63"
    ],
    "canonicalAbilityId": null,
    "parameters": {},
    "status": "TEXT_ONLY_SOURCE_BACKED",
    "reason": "Army reference does not unconditionally execute the referenced Army Rule."
  },
  {
    "id": "reference-sm-e2ed49dd42cb4f32",
    "ownerId": "unit-sm-e62a5d7c19b24d57",
    "sourceEntityId": "sm-source-32d60b2a46ba437d",
    "quote": "Infiltrators",
    "sourceFieldSha256": "6B1564D0CAD2F0738872C3C952E04F811F7221AE14F7EA1B3E11B8A2E20A07CC",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[10]/div[16]/div[2]/div[2]/table/tbody/tr[1]/td[2]/b/span[2]",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00096",
    "modelProfileIds": [
      "model-sm-10bbe7774ccf491d"
    ],
    "canonicalAbilityId": "core-infiltrators",
    "parameters": {},
    "status": "EXECUTABLE_PROVEN",
    "reason": "Native MODEL ability presence and source parameters; battle events are not simulated."
  },
  {
    "id": "reference-sm-e3cb6c9786654486",
    "ownerId": "unit-sm-2e0979af1d9040af",
    "sourceEntityId": "sm-source-3699fae66b3a4006",
    "quote": "Combat Doctrines",
    "sourceFieldSha256": "C7D35224BD3207AB80A296EDBD6B104C33DC5046C450CAAB7832588C740B3989",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[4]/div[2]/div[2]/div[2]/table/tbody/tr[2]/td[2]/b/span[1]",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00021",
    "modelProfileIds": [
      "model-sm-650756a527544afa"
    ],
    "canonicalAbilityId": null,
    "parameters": {},
    "status": "TEXT_ONLY_SOURCE_BACKED",
    "reason": "Army reference does not unconditionally execute the referenced Army Rule."
  },
  {
    "id": "reference-sm-e435553bfedb470b",
    "ownerId": "unit-sm-02d5dee4717544ad",
    "sourceEntityId": "sm-source-ab7d3dc543b54a3b",
    "quote": "Leader",
    "sourceFieldSha256": "3F53871B0838BDF343A3A0CDBCFCBC28EF7E30A4FC8E032C3376431DE4D2F7DB",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[2]/div[10]/div[2]/div[2]/table/tbody/tr[1]/td[2]/b/span",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00264",
    "modelProfileIds": [
      "model-sm-d659e880bdc74ce3"
    ],
    "canonicalAbilityId": null,
    "parameters": {},
    "status": "TEXT_ONLY_SOURCE_BACKED",
    "reason": "Leader/Support role is resolved by conditional central MFM relations, not an unconditional native ability."
  },
  {
    "id": "reference-sm-e5b2ff33cb94474c",
    "ownerId": "unit-sm-56eaa095b0ae4fe4",
    "sourceEntityId": "sm-source-d69ecaeb2e964d11",
    "quote": "Combat Doctrines",
    "sourceFieldSha256": "C7D35224BD3207AB80A296EDBD6B104C33DC5046C450CAAB7832588C740B3989",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[26]/div[2]/div[2]/div[2]/table/tbody/tr/td[2]/b/span",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00021",
    "modelProfileIds": [
      "model-sm-58ca95bff983472f"
    ],
    "canonicalAbilityId": null,
    "parameters": {},
    "status": "TEXT_ONLY_SOURCE_BACKED",
    "reason": "Army reference does not unconditionally execute the referenced Army Rule."
  },
  {
    "id": "reference-sm-e6f335260e774b2a",
    "ownerId": "unit-sm-e62a5d7c19b24d57",
    "sourceEntityId": "sm-source-01547b0b26634efe",
    "quote": "Deep Strike",
    "sourceFieldSha256": "3C428E37084730EF0C7FCB3A4DF90E292C881C1AD3F31EF93B951D71C10C4AD0",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[10]/div[16]/div[2]/div[2]/table/tbody/tr[1]/td[2]/b/span[1]",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00113",
    "modelProfileIds": [
      "model-sm-10bbe7774ccf491d"
    ],
    "canonicalAbilityId": "core-deep-strike",
    "parameters": {},
    "status": "EXECUTABLE_PROVEN",
    "reason": "Native MODEL ability presence and source parameters; battle events are not simulated."
  },
  {
    "id": "reference-sm-e7f180913f354f58",
    "ownerId": "unit-sm-f9d22ec2aff840de",
    "sourceEntityId": "sm-source-e14f219ec67b4558",
    "quote": "Transhuman Strategist",
    "sourceFieldSha256": "069C48F23FB8A287AFDFFB14DBE8DEB12F57374BAE9FAF3CCF0FFDAD0B24383B",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[2]/div[22]/div[2]/div[2]/table/tbody/tr[2]/td[2]/b/span[2]",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00266",
    "modelProfileIds": [
      "model-sm-427242355ffe4bd4"
    ],
    "canonicalAbilityId": null,
    "parameters": {},
    "status": "TEXT_ONLY_SOURCE_BACKED",
    "reason": "Army reference does not unconditionally execute the referenced Army Rule."
  },
  {
    "id": "reference-sm-e8363a684e144d4b",
    "ownerId": "unit-sm-80ac1421ce0f4de3",
    "sourceEntityId": "sm-source-d0bf26c7c56748d2",
    "quote": "Deep Strike",
    "sourceFieldSha256": "3C428E37084730EF0C7FCB3A4DF90E292C881C1AD3F31EF93B951D71C10C4AD0",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[32]/div[8]/div[2]/div[2]/table/tbody/tr[1]/td[2]/b/span",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00113",
    "modelProfileIds": [
      "model-sm-6d882ea434844ab7"
    ],
    "canonicalAbilityId": "core-deep-strike",
    "parameters": {},
    "status": "EXECUTABLE_PROVEN",
    "reason": "Native MODEL ability presence and source parameters; battle events are not simulated."
  },
  {
    "id": "reference-sm-e8f2f133dc8f445d",
    "ownerId": "unit-sm-bdf36a7ab1d64d50",
    "sourceEntityId": "sm-source-f0eb754e06404772",
    "quote": "Transhuman Strategist",
    "sourceFieldSha256": "069C48F23FB8A287AFDFFB14DBE8DEB12F57374BAE9FAF3CCF0FFDAD0B24383B",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[2]/div[30]/div[2]/div[2]/table/tbody/tr[2]/td[2]/b/span[2]",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00266",
    "modelProfileIds": [
      "model-sm-19564c3ae075499c"
    ],
    "canonicalAbilityId": null,
    "parameters": {},
    "status": "TEXT_ONLY_SOURCE_BACKED",
    "reason": "Army reference does not unconditionally execute the referenced Army Rule."
  },
  {
    "id": "reference-sm-e99c39cd245f4039",
    "ownerId": "unit-sm-4ff82a9b79db48da",
    "sourceEntityId": "sm-source-6cf9daab324b40c5",
    "quote": "Combat Doctrines",
    "sourceFieldSha256": "C7D35224BD3207AB80A296EDBD6B104C33DC5046C450CAAB7832588C740B3989",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[24]/div[10]/div[2]/div[2]/table/tbody/tr[2]/td[2]/b/span",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00021",
    "modelProfileIds": [
      "model-sm-9ca19496ef0543c0",
      "model-sm-ca97b61da4fa490f"
    ],
    "canonicalAbilityId": null,
    "parameters": {},
    "status": "TEXT_ONLY_SOURCE_BACKED",
    "reason": "Army reference does not unconditionally execute the referenced Army Rule."
  },
  {
    "id": "reference-sm-ec998cc90b274f57",
    "ownerId": "unit-sm-10396cd2726045a8",
    "sourceEntityId": "sm-source-7fe4cc9ea8c24907",
    "quote": "Transhuman Strategist",
    "sourceFieldSha256": "069C48F23FB8A287AFDFFB14DBE8DEB12F57374BAE9FAF3CCF0FFDAD0B24383B",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[2]/div[8]/div[2]/div[2]/table/tbody/tr[2]/td[2]/b/span[1]",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00266",
    "modelProfileIds": [
      "model-sm-d3448e055f4442b8"
    ],
    "canonicalAbilityId": null,
    "parameters": {},
    "status": "TEXT_ONLY_SOURCE_BACKED",
    "reason": "Army reference does not unconditionally execute the referenced Army Rule."
  },
  {
    "id": "reference-sm-ed6369ef5940404f",
    "ownerId": "unit-sm-db3ce647d7024b24",
    "sourceEntityId": "sm-source-a30758cc63bd45f8",
    "quote": "Support",
    "sourceFieldSha256": "BE91940B79F469101DF9A50544B6873AA5509A12F1F93F1CB5E3BE3990D344B3",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[10]/div[4]/div[2]/div[2]/table/tbody/tr[1]/td[2]/b/span[2]",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00277",
    "modelProfileIds": [
      "model-sm-ffb187aea23b4d91"
    ],
    "canonicalAbilityId": null,
    "parameters": {},
    "status": "TEXT_ONLY_SOURCE_BACKED",
    "reason": "Leader/Support role is resolved by conditional central MFM relations, not an unconditional native ability."
  },
  {
    "id": "reference-sm-eddb142c2bac4217",
    "ownerId": "unit-sm-5d6184dd92154615",
    "sourceEntityId": "sm-source-4b9b48d2a8394823",
    "quote": "Scouts 6\"",
    "sourceFieldSha256": "5C83784955DE6C8879C40A37717633723B88859C178B1B3CFD7EE672FD0A7747",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[24]/div[26]/div[2]/div[2]/table/tbody/tr[1]/td[2]/b/span",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00050",
    "modelProfileIds": [
      "model-sm-8e85ff318de74b46",
      "model-sm-012361875ac94504"
    ],
    "canonicalAbilityId": "core-scouts",
    "parameters": {
      "range": 6
    },
    "status": "EXECUTABLE_PROVEN",
    "reason": "Native MODEL ability presence and source parameters; battle events are not simulated."
  },
  {
    "id": "reference-sm-ee682ed38fa14c95",
    "ownerId": "unit-sm-46fb0fe9443c4e95",
    "sourceEntityId": "sm-source-16a00a3b28fd4568",
    "quote": "Combat Doctrines",
    "sourceFieldSha256": "C7D35224BD3207AB80A296EDBD6B104C33DC5046C450CAAB7832588C740B3989",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[30]/div[4]/div[2]/div[2]/table/tbody/tr[2]/td[2]/b/span",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00021",
    "modelProfileIds": [
      "model-sm-af1ec6fca9c84e2c"
    ],
    "canonicalAbilityId": null,
    "parameters": {},
    "status": "TEXT_ONLY_SOURCE_BACKED",
    "reason": "Army reference does not unconditionally execute the referenced Army Rule."
  },
  {
    "id": "reference-sm-ef0322d368394fc6",
    "ownerId": "unit-sm-9f9e7c18b7354927",
    "sourceEntityId": "sm-source-efbcc8d5426c44b4",
    "quote": "Transhuman Strategist",
    "sourceFieldSha256": "069C48F23FB8A287AFDFFB14DBE8DEB12F57374BAE9FAF3CCF0FFDAD0B24383B",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[12]/div[2]/div[2]/div[2]/table/tbody/tr[2]/td[2]/b/span[2]",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00266",
    "modelProfileIds": [
      "model-sm-b3f300c033ed47f9"
    ],
    "canonicalAbilityId": null,
    "parameters": {},
    "status": "TEXT_ONLY_SOURCE_BACKED",
    "reason": "Army reference does not unconditionally execute the referenced Army Rule."
  },
  {
    "id": "reference-sm-f08c85a05426402c",
    "ownerId": "unit-sm-4bc3ce61558a4d90",
    "sourceEntityId": "sm-source-566b0a73388c45fc",
    "quote": "Combat Doctrines",
    "sourceFieldSha256": "C7D35224BD3207AB80A296EDBD6B104C33DC5046C450CAAB7832588C740B3989",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[24]/div[12]/div[2]/div[2]/table/tbody/tr/td[2]/b/span",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00021",
    "modelProfileIds": [
      "model-sm-76c129f90dad457e",
      "model-sm-c1621ed2a9b74f4c"
    ],
    "canonicalAbilityId": null,
    "parameters": {},
    "status": "TEXT_ONLY_SOURCE_BACKED",
    "reason": "Army reference does not unconditionally execute the referenced Army Rule."
  },
  {
    "id": "reference-sm-f17b9c73c8844f11",
    "ownerId": "unit-sm-004d28cd5dca4a1e",
    "sourceEntityId": "sm-source-d77ad9689c26460a",
    "quote": "Damaged 4",
    "sourceFieldSha256": "8C4C45FC7CC2CAD154C4ECA6B08E50B8B57B5185BC8CFC9F6F9DA2598B2EAD8E",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[34]/div[6]/div[2]/div[2]/table/tbody/tr[1]/td[2]/b/span[1]",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00128",
    "modelProfileIds": [
      "model-sm-16efbc04606b44da"
    ],
    "canonicalAbilityId": null,
    "parameters": {},
    "status": "TEXT_ONLY_SOURCE_BACKED",
    "reason": "Damaged requires current remaining wounds and battle-state hit roll evaluation."
  },
  {
    "id": "reference-sm-f56b2e55ad664809",
    "ownerId": "unit-sm-f9d22ec2aff840de",
    "sourceEntityId": "sm-source-7360bc7edbee4991",
    "quote": "Leader",
    "sourceFieldSha256": "3F53871B0838BDF343A3A0CDBCFCBC28EF7E30A4FC8E032C3376431DE4D2F7DB",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[2]/div[22]/div[2]/div[2]/table/tbody/tr[1]/td[2]/b/span",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00264",
    "modelProfileIds": [
      "model-sm-427242355ffe4bd4"
    ],
    "canonicalAbilityId": null,
    "parameters": {},
    "status": "TEXT_ONLY_SOURCE_BACKED",
    "reason": "Leader/Support role is resolved by conditional central MFM relations, not an unconditional native ability."
  },
  {
    "id": "reference-sm-f6787140e6444a4d",
    "ownerId": "unit-sm-a8f0770187044cbb",
    "sourceEntityId": "sm-source-3b17115afa1c45bf",
    "quote": "Combat Doctrines",
    "sourceFieldSha256": "C7D35224BD3207AB80A296EDBD6B104C33DC5046C450CAAB7832588C740B3989",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[32]/div[6]/div[2]/div[2]/table/tbody/tr[2]/td[2]/b/span",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00021",
    "modelProfileIds": [
      "model-sm-d0247ef5d2a54ab3"
    ],
    "canonicalAbilityId": null,
    "parameters": {},
    "status": "TEXT_ONLY_SOURCE_BACKED",
    "reason": "Army reference does not unconditionally execute the referenced Army Rule."
  },
  {
    "id": "reference-sm-f6f046ee0dc64b3e",
    "ownerId": "unit-sm-96f12b073f4649c7",
    "sourceEntityId": "sm-source-cf50845be5444e63",
    "quote": "Lone Operative",
    "sourceFieldSha256": "A3B8522CFC6E5A6C88305E79231704A1774509150CBCCD41DF6BAE3055FD3EAF",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[10]/div[42]/div[2]/div[2]/table/tbody/tr[1]/td[2]/b/span[3]",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00097",
    "modelProfileIds": [
      "model-sm-1c11eb57409a4d9b"
    ],
    "canonicalAbilityId": "core-lone-operative",
    "parameters": {},
    "status": "EXECUTABLE_PROVEN",
    "reason": "Native MODEL ability presence and source parameters; battle events are not simulated."
  },
  {
    "id": "reference-sm-f7a071a526364da1",
    "ownerId": "unit-sm-c9c30c70c3394fb6",
    "sourceEntityId": "sm-source-a643081fd7434eda",
    "quote": "Deadly Demise D3",
    "sourceFieldSha256": "D265C9B278EBD2413359FD63CD7DC32E7106EA9AC45DC46DDC393F7CE65FB7FF",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[32]/div[2]/div[2]/div[2]/table/tbody/tr[1]/td[2]/b/span[2]",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00089",
    "modelProfileIds": [
      "model-sm-206b3106ed5644b1"
    ],
    "canonicalAbilityId": "core-deadly-demise",
    "parameters": {
      "value": "D3"
    },
    "status": "EXECUTABLE_PROVEN",
    "reason": "Native MODEL ability presence and source parameters; battle events are not simulated."
  },
  {
    "id": "reference-sm-faf8cacaddd74bbd",
    "ownerId": "unit-sm-32e5b655a21342f6",
    "sourceEntityId": "sm-source-a685fbc81bce4431",
    "quote": "Damaged 4",
    "sourceFieldSha256": "8C4C45FC7CC2CAD154C4ECA6B08E50B8B57B5185BC8CFC9F6F9DA2598B2EAD8E",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[34]/div[8]/div[2]/div[2]/table/tbody/tr[1]/td[2]/b/span[1]",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00128",
    "modelProfileIds": [
      "model-sm-00a645a59aad47b3"
    ],
    "canonicalAbilityId": null,
    "parameters": {},
    "status": "TEXT_ONLY_SOURCE_BACKED",
    "reason": "Damaged requires current remaining wounds and battle-state hit roll evaluation."
  },
  {
    "id": "reference-sm-fd8851a62baa4e83",
    "ownerId": "unit-sm-d101fa171b7a40c4",
    "sourceEntityId": "sm-source-4c83c7cf24d4449d",
    "quote": "Combat Doctrines",
    "sourceFieldSha256": "C7D35224BD3207AB80A296EDBD6B104C33DC5046C450CAAB7832588C740B3989",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[10]/div[18]/div[2]/div[2]/table/tbody/tr[2]/td[2]/b/span[1]",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00021",
    "modelProfileIds": [
      "model-sm-bf9fe78a1fa747b5"
    ],
    "canonicalAbilityId": null,
    "parameters": {},
    "status": "TEXT_ONLY_SOURCE_BACKED",
    "reason": "Army reference does not unconditionally execute the referenced Army Rule."
  },
  {
    "id": "reference-sm-fd9169ba1d5a47af",
    "ownerId": "unit-sm-67f47cb0752e44ad",
    "sourceEntityId": "sm-source-56e6248a78e84cf4",
    "quote": "Combat Doctrines",
    "sourceFieldSha256": "C7D35224BD3207AB80A296EDBD6B104C33DC5046C450CAAB7832588C740B3989",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[24]/div[6]/div[2]/div[2]/table/tbody/tr/td[2]/b/span",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00021",
    "modelProfileIds": [
      "model-sm-bf5f36a2458c457d",
      "model-sm-e3b0418895b44e3d"
    ],
    "canonicalAbilityId": null,
    "parameters": {},
    "status": "TEXT_ONLY_SOURCE_BACKED",
    "reason": "Army reference does not unconditionally execute the referenced Army Rule."
  },
  {
    "id": "reference-sm-fe0ce3e612044fe9",
    "ownerId": "unit-sm-46fb0fe9443c4e95",
    "sourceEntityId": "sm-source-80f4e6159ec04f54",
    "quote": "Damaged 6",
    "sourceFieldSha256": "DE458EDA4905A7A939808C01FC175C3F670D113A5EE194827BB5211FD159CFEE",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[30]/div[4]/div[2]/div[2]/table/tbody/tr[1]/td[2]/b/span[1]",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00128",
    "modelProfileIds": [
      "model-sm-af1ec6fca9c84e2c"
    ],
    "canonicalAbilityId": null,
    "parameters": {},
    "status": "TEXT_ONLY_SOURCE_BACKED",
    "reason": "Damaged requires current remaining wounds and battle-state hit roll evaluation."
  },
  {
    "id": "reference-sm-fe0d9ea6498b429e",
    "ownerId": "unit-sm-1af70808102d4286",
    "sourceEntityId": "sm-source-e97466f5eca642bf",
    "quote": "Transhuman Strategist",
    "sourceFieldSha256": "069C48F23FB8A287AFDFFB14DBE8DEB12F57374BAE9FAF3CCF0FFDAD0B24383B",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[2]/div[24]/div[2]/div[2]/table/tbody/tr[2]/td[2]/b/span[2]",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00266",
    "modelProfileIds": [
      "model-sm-8f32fb102ead4603"
    ],
    "canonicalAbilityId": null,
    "parameters": {},
    "status": "TEXT_ONLY_SOURCE_BACKED",
    "reason": "Army reference does not unconditionally execute the referenced Army Rule."
  },
  {
    "id": "reference-sm-fec29c22657d4bbd",
    "ownerId": "unit-sm-3460439c3a774c66",
    "sourceEntityId": "sm-source-bf01984080d94ada",
    "quote": "Combat Doctrines",
    "sourceFieldSha256": "C7D35224BD3207AB80A296EDBD6B104C33DC5046C450CAAB7832588C740B3989",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[2]/div[18]/div[2]/div[2]/table/tbody/tr[2]/td[2]/b/span",
    "sourceSha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
    "sourceTooltip": "#tooltip_content00021",
    "modelProfileIds": [
      "model-sm-574846fb8e3e4e77"
    ],
    "canonicalAbilityId": null,
    "parameters": {},
    "status": "TEXT_ONLY_SOURCE_BACKED",
    "reason": "Army reference does not unconditionally execute the referenced Army Rule."
  }
]);
/** Mutates only a disposable runtime view. Canonical factual records stay intact. */
export function bindNativeAbilities(book,{coreCatalog=createEffectiveCoreCatalog()}={}){
  assert.equal(book.bookId,'space-marines');
  const index=new Map(book.entities.map(e=>[e.id,e]));
  const actual=book.entities.filter(e=>(e.sourceKind||e.kind)==='RULE_REFERENCE').map(e=>e.id).sort();
  assert.deepEqual(actual,nativeAbilityReview.map(e=>e.id).sort(),'Unreviewed native source occurrence');
  book.rosterReferenceSemantics??={};book.rosterAbilityReferences??={};
  const bindings=[],review=[];
  for(const proof of [...nativeAbilityReview].sort((a,b)=>a.id.localeCompare(b.id))){
    const source=index.get(proof.id),owner=index.get(proof.ownerId);
    assert.equal(source.parentId,proof.ownerId,'Wrong native physical UNIT owner');
    assert.equal(source.sourceEntityId,proof.sourceEntityId,'Native source identity changed');
    assert.equal(source.data.text,proof.quote,'Native source clause changed');
    assert.equal(source.data.label,proof.quote,'Native label differs from reviewed clause');
    assert.equal(sha(source.data.text),proof.sourceFieldSha256);
    assert.equal(source.provenance.pointer,proof.sourcePointer);
    assert.equal(source.provenance.sha256,proof.sourceSha256);
    assert.equal(owner?.kind,'DATASHEET');
    assert.deepEqual(owner.data.profileIds,proof.modelProfileIds,'Native MODEL recipients changed');
    for(const id of proof.modelProfileIds)assert.equal(index.get(id)?.parentId,proof.ownerId,'Foreign MODEL recipient');
    const record={...clone(proof),scope:'MODEL',field:['text'],provenance:clone(source.provenance)};
    review.push(record);
    if(!proof.canonicalAbilityId){
      assert.ok(!book.rosterReferenceSemantics[proof.id],'Unreviewed executable native source');continue;
    }
    const target=coreCatalog.getById(proof.canonicalAbilityId);
    assert.equal(target?.state,'FULL_CONTENT','Missing accepted Core ability');
    assert.equal(target.kind,'ability');
    const numeric=proof.canonicalAbilityId==='core-feel-no-pain';
    // Legacy numeric FNP is the existing executor representation. Canonical
    // identity remains explicit in the binding and presentation metadata.
    const ability=numeric?{name:'Feel No Pain',value:proof.parameters.value}:
      {canonicalId:target.id,name:source.data.label,parameters:clone(proof.parameters)};
    const semantics={scope:'MODEL',modelProfileIds:clone(proof.modelProfileIds),
      abilities:[ability],sourceFields:[['text']],sourceId:source.provenance.sourceId,provenance:clone(source.provenance)};
    if(book.rosterReferenceSemantics[proof.id])assert.deepEqual(book.rosterReferenceSemantics[proof.id],semantics,'Conflicting native ability binding');
    book.rosterReferenceSemantics[proof.id]=semantics;
    // Canonical grant validation accepts numeric parameters only. Random D3/D6
    // native references are source facts, never executable grant declarations.
    const parameters=Object.fromEntries(Object.entries(proof.parameters)
      .map(([key])=>[key,{type:'number',min:1}]));
    const reference={id:target.id,title:target.title,parameters,provenance:clone(target.provenance)};
    const old=book.rosterAbilityReferences[target.id];
    if(old)assert.deepEqual(old,reference,'Conflicting canonical Core reference');
    book.rosterAbilityReferences[target.id]=reference;
    bindings.push({...record,canonicalAbilityId:target.id,legacyValue:numeric,coreProvenance:clone(target.provenance)});
  }
  return {bindings,review,unsupported:review.filter(row=>row.status!=='EXECUTABLE_PROVEN')};
}

export const nativeInvulnerableReview=Object.freeze([
  {
    "id": "invulnerable-sm-01e71a5bc2ad47ae",
    "ownerId": "unit-sm-e62a5d7c19b24d57",
    "data": {
      "text": "INSV\n4+",
      "value": "4+",
      "conditionText": "",
      "scopeQualification": "DATASHEET_HEADER_SOURCE_PROFILES",
      "execution": "NOT_IMPLEMENTED",
      "sourceProfileIds": [
        "model-sm-10bbe7774ccf491d"
      ]
    },
    "provenance": {
      "sourceId": "space-marines-waha-11e-2026-10-20",
      "document": "books/space-marines/v2/sources/raw/wahapedia-datasheets-probe.html",
      "sha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
      "pointer": "/html/body/div/div[1]/div[3]/div[10]/div[16]/div[1]/div[9]",
      "sourceEntityId": "sm-source-285f889a711d409a",
      "authority": "ACCEPTED_SECONDARY"
    }
  },
  {
    "id": "invulnerable-sm-0e79df7c09a84fac",
    "ownerId": "unit-sm-bc9aa3cbedb2415c",
    "data": {
      "text": "INSV\n4+",
      "value": "4+",
      "conditionText": "",
      "scopeQualification": "DATASHEET_HEADER_SOURCE_PROFILES",
      "execution": "NOT_IMPLEMENTED",
      "sourceProfileIds": [
        "model-sm-68dfa445ba8842bb"
      ]
    },
    "provenance": {
      "sourceId": "space-marines-waha-11e-2026-10-20",
      "document": "books/space-marines/v2/sources/raw/wahapedia-datasheets-probe.html",
      "sha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
      "pointer": "/html/body/div/div[1]/div[3]/div[10]/div[14]/div[1]/div[9]",
      "sourceEntityId": "sm-source-606e65dd53f04993",
      "authority": "ACCEPTED_SECONDARY"
    }
  },
  {
    "id": "invulnerable-sm-10e9831139084641",
    "ownerId": "unit-sm-0b0b22ecffa74125",
    "data": {
      "text": "INSV\n4+",
      "value": "4+",
      "conditionText": "",
      "scopeQualification": "DATASHEET_HEADER_SOURCE_PROFILES",
      "execution": "NOT_IMPLEMENTED",
      "sourceProfileIds": [
        "model-sm-c279f7ee39b9485b"
      ]
    },
    "provenance": {
      "sourceId": "space-marines-waha-11e-2026-10-20",
      "document": "books/space-marines/v2/sources/raw/wahapedia-datasheets-probe.html",
      "sha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
      "pointer": "/html/body/div/div[1]/div[3]/div[10]/div[10]/div[1]/div[9]",
      "sourceEntityId": "sm-source-84da13cd58cd42f6",
      "authority": "ACCEPTED_SECONDARY"
    }
  },
  {
    "id": "invulnerable-sm-1663811ed2774a77",
    "ownerId": "unit-sm-ad36b4f4c8f14a97",
    "data": {
      "text": "INSV\n4+",
      "value": "4+",
      "conditionText": "",
      "scopeQualification": "DATASHEET_HEADER_SOURCE_PROFILES",
      "execution": "NOT_IMPLEMENTED",
      "sourceProfileIds": [
        "model-sm-7fe144bba1d44cf5"
      ]
    },
    "provenance": {
      "sourceId": "space-marines-waha-11e-2026-10-20",
      "document": "books/space-marines/v2/sources/raw/wahapedia-datasheets-probe.html",
      "sha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
      "pointer": "/html/body/div/div[1]/div[3]/div[2]/div[14]/div[1]/div[9]",
      "sourceEntityId": "sm-source-0d86bd90fc69444d",
      "authority": "ACCEPTED_SECONDARY"
    }
  },
  {
    "id": "invulnerable-sm-2c7b5cb47b7241d4",
    "ownerId": "unit-sm-9f9c66dce3814cc5",
    "data": {
      "text": "INSV\n4+",
      "value": "4+",
      "conditionText": "",
      "scopeQualification": "DATASHEET_HEADER_SOURCE_PROFILES",
      "execution": "NOT_IMPLEMENTED",
      "sourceProfileIds": [
        "model-sm-bc58a7069dd24cac"
      ]
    },
    "provenance": {
      "sourceId": "space-marines-waha-11e-2026-10-20",
      "document": "books/space-marines/v2/sources/raw/wahapedia-datasheets-probe.html",
      "sha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
      "pointer": "/html/body/div/div[1]/div[3]/div[2]/div[26]/div[1]/div[9]",
      "sourceEntityId": "sm-source-14dc643a1aed4595",
      "authority": "ACCEPTED_SECONDARY"
    }
  },
  {
    "id": "invulnerable-sm-2f399af720934f33",
    "ownerId": "unit-sm-f9d22ec2aff840de",
    "data": {
      "text": "INSV\n4+",
      "value": "4+",
      "conditionText": "",
      "scopeQualification": "DATASHEET_HEADER_SOURCE_PROFILES",
      "execution": "NOT_IMPLEMENTED",
      "sourceProfileIds": [
        "model-sm-427242355ffe4bd4"
      ]
    },
    "provenance": {
      "sourceId": "space-marines-waha-11e-2026-10-20",
      "document": "books/space-marines/v2/sources/raw/wahapedia-datasheets-probe.html",
      "sha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
      "pointer": "/html/body/div/div[1]/div[3]/div[2]/div[22]/div[1]/div[9]",
      "sourceEntityId": "sm-source-159cad6dbf7c4fcd",
      "authority": "ACCEPTED_SECONDARY"
    }
  },
  {
    "id": "invulnerable-sm-310875812a9a405a",
    "ownerId": "unit-sm-4cd4bf89720c4fa0",
    "data": {
      "text": "INSV\n4+",
      "value": "4+",
      "conditionText": "",
      "scopeQualification": "DATASHEET_HEADER_SOURCE_PROFILES",
      "execution": "NOT_IMPLEMENTED",
      "sourceProfileIds": [
        "model-sm-8a17f615197f4701"
      ]
    },
    "provenance": {
      "sourceId": "space-marines-waha-11e-2026-10-20",
      "document": "books/space-marines/v2/sources/raw/wahapedia-datasheets-probe.html",
      "sha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
      "pointer": "/html/body/div/div[1]/div[3]/div[12]/div[4]/div[1]/div[9]",
      "sourceEntityId": "sm-source-7e7ac22fb3f04b36",
      "authority": "ACCEPTED_SECONDARY"
    }
  },
  {
    "id": "invulnerable-sm-39353f2d25ea4c05",
    "ownerId": "unit-sm-70b477e461b5487a",
    "data": {
      "text": "INSV\n4+",
      "value": "4+",
      "conditionText": "",
      "scopeQualification": "DATASHEET_HEADER_SOURCE_PROFILES",
      "execution": "NOT_IMPLEMENTED",
      "sourceProfileIds": [
        "model-sm-39a9e28bbe2946fc"
      ]
    },
    "provenance": {
      "sourceId": "space-marines-waha-11e-2026-10-20",
      "document": "books/space-marines/v2/sources/raw/wahapedia-datasheets-probe.html",
      "sha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
      "pointer": "/html/body/div/div[1]/div[3]/div[6]/div[2]/div[1]/div[9]",
      "sourceEntityId": "sm-source-f9f11c705eee4d26",
      "authority": "ACCEPTED_SECONDARY"
    }
  },
  {
    "id": "invulnerable-sm-39b00a2e310c41ad",
    "ownerId": "unit-sm-02d5dee4717544ad",
    "data": {
      "text": "INSV\n4+",
      "value": "4+",
      "conditionText": "",
      "scopeQualification": "DATASHEET_HEADER_SOURCE_PROFILES",
      "execution": "NOT_IMPLEMENTED",
      "sourceProfileIds": [
        "model-sm-d659e880bdc74ce3"
      ]
    },
    "provenance": {
      "sourceId": "space-marines-waha-11e-2026-10-20",
      "document": "books/space-marines/v2/sources/raw/wahapedia-datasheets-probe.html",
      "sha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
      "pointer": "/html/body/div/div[1]/div[3]/div[2]/div[10]/div[1]/div[9]",
      "sourceEntityId": "sm-source-e286ed35353a4029",
      "authority": "ACCEPTED_SECONDARY"
    }
  },
  {
    "id": "invulnerable-sm-4c8f8c02661343d0",
    "ownerId": "unit-sm-55f195878fab446f",
    "data": {
      "text": "INSV\n4+",
      "value": "4+",
      "conditionText": "",
      "scopeQualification": "DATASHEET_HEADER_SOURCE_PROFILES",
      "execution": "NOT_IMPLEMENTED",
      "sourceProfileIds": [
        "model-sm-c30e0bfd59a24622"
      ]
    },
    "provenance": {
      "sourceId": "space-marines-waha-11e-2026-10-20",
      "document": "books/space-marines/v2/sources/raw/wahapedia-datasheets-probe.html",
      "sha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
      "pointer": "/html/body/div/div[1]/div[3]/div[2]/div[20]/div[1]/div[9]",
      "sourceEntityId": "sm-source-4495df2872d54fd1",
      "authority": "ACCEPTED_SECONDARY"
    }
  },
  {
    "id": "invulnerable-sm-4cceac43759f4957",
    "ownerId": "unit-sm-a2a8db8a9f124a7f",
    "data": {
      "text": "INSV*\n4+\n* Against melee attacks only",
      "value": "4+",
      "conditionText": "* Against melee attacks only",
      "scopeQualification": "CONDITIONAL_SOURCE_MODEL",
      "execution": "NOT_IMPLEMENTED",
      "sourceProfileIds": [
        "model-sm-4677647e191b44dc"
      ]
    },
    "provenance": {
      "sourceId": "space-marines-waha-11e-2026-10-20",
      "document": "books/space-marines/v2/sources/raw/wahapedia-datasheets-probe.html",
      "sha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
      "pointer": "/html/body/div/div[1]/div[3]/div[10]/div[30]/div[1]/div[9]",
      "sourceEntityId": "sm-source-0aef01b751c44c0f",
      "authority": "ACCEPTED_SECONDARY"
    }
  },
  {
    "id": "invulnerable-sm-510d9cd586214a4b",
    "ownerId": "unit-sm-1af70808102d4286",
    "data": {
      "text": "INSV\n4+",
      "value": "4+",
      "conditionText": "",
      "scopeQualification": "DATASHEET_HEADER_SOURCE_PROFILES",
      "execution": "NOT_IMPLEMENTED",
      "sourceProfileIds": [
        "model-sm-8f32fb102ead4603"
      ]
    },
    "provenance": {
      "sourceId": "space-marines-waha-11e-2026-10-20",
      "document": "books/space-marines/v2/sources/raw/wahapedia-datasheets-probe.html",
      "sha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
      "pointer": "/html/body/div/div[1]/div[3]/div[2]/div[24]/div[1]/div[9]",
      "sourceEntityId": "sm-source-1bd62aecbf8d4d6e",
      "authority": "ACCEPTED_SECONDARY"
    }
  },
  {
    "id": "invulnerable-sm-569a727aa6994a1a",
    "ownerId": "unit-sm-2e0979af1d9040af",
    "data": {
      "text": "INSV\n4+",
      "value": "4+",
      "conditionText": "",
      "scopeQualification": "DATASHEET_HEADER_SOURCE_PROFILES",
      "execution": "NOT_IMPLEMENTED",
      "sourceProfileIds": [
        "model-sm-650756a527544afa"
      ]
    },
    "provenance": {
      "sourceId": "space-marines-waha-11e-2026-10-20",
      "document": "books/space-marines/v2/sources/raw/wahapedia-datasheets-probe.html",
      "sha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
      "pointer": "/html/body/div/div[1]/div[3]/div[4]/div[2]/div[1]/div[9]",
      "sourceEntityId": "sm-source-a4adab68ed794725",
      "authority": "ACCEPTED_SECONDARY"
    }
  },
  {
    "id": "invulnerable-sm-592bba1fd43e48cf",
    "ownerId": "unit-sm-611995a1ac614acb",
    "data": {
      "text": "INSV\n4+",
      "value": "4+",
      "conditionText": "",
      "scopeQualification": "DATASHEET_HEADER_SOURCE_PROFILES",
      "execution": "NOT_IMPLEMENTED",
      "sourceProfileIds": [
        "model-sm-7390bc75a44140c4"
      ]
    },
    "provenance": {
      "sourceId": "space-marines-waha-11e-2026-10-20",
      "document": "books/space-marines/v2/sources/raw/wahapedia-datasheets-probe.html",
      "sha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
      "pointer": "/html/body/div/div[1]/div[3]/div[2]/div[2]/div[1]/div[9]",
      "sourceEntityId": "sm-source-881b1fc1eb0946df",
      "authority": "ACCEPTED_SECONDARY"
    }
  },
  {
    "id": "invulnerable-sm-5d9fbdf4d4e84ca7",
    "ownerId": "unit-sm-c7226873c51d43c0",
    "data": {
      "text": "INSV*\n4+\n* Veteran Sergeant Metaurus only",
      "value": "4+",
      "conditionText": "* Veteran Sergeant Metaurus only",
      "scopeQualification": "EXPLICIT_NAMED_MODEL",
      "execution": "NOT_IMPLEMENTED",
      "sourceProfileIds": [
        "model-sm-5e6df789f1434020"
      ]
    },
    "provenance": {
      "sourceId": "space-marines-waha-11e-2026-10-20",
      "document": "books/space-marines/v2/sources/raw/wahapedia-datasheets-probe.html",
      "sha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
      "pointer": "/html/body/div/div[1]/div[3]/div[2]/div[32]/div[1]/div[13]",
      "sourceEntityId": "sm-source-f314c16f85d34c0c",
      "authority": "ACCEPTED_SECONDARY"
    }
  },
  {
    "id": "invulnerable-sm-5ea1b5b2229a49a7",
    "ownerId": "unit-sm-7ee313f201ab42cf",
    "data": {
      "text": "INSV\n4+",
      "value": "4+",
      "conditionText": "",
      "scopeQualification": "DATASHEET_HEADER_SOURCE_PROFILES",
      "execution": "NOT_IMPLEMENTED",
      "sourceProfileIds": [
        "model-sm-06a690ddf76a4822"
      ]
    },
    "provenance": {
      "sourceId": "space-marines-waha-11e-2026-10-20",
      "document": "books/space-marines/v2/sources/raw/wahapedia-datasheets-probe.html",
      "sha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
      "pointer": "/html/body/div/div[1]/div[3]/div[2]/div[12]/div[1]/div[9]",
      "sourceEntityId": "sm-source-bedbff731d48432a",
      "authority": "ACCEPTED_SECONDARY"
    }
  },
  {
    "id": "invulnerable-sm-6030471ff50d4627",
    "ownerId": "unit-sm-10396cd2726045a8",
    "data": {
      "text": "INSV\n4+",
      "value": "4+",
      "conditionText": "",
      "scopeQualification": "DATASHEET_HEADER_SOURCE_PROFILES",
      "execution": "NOT_IMPLEMENTED",
      "sourceProfileIds": [
        "model-sm-d3448e055f4442b8"
      ]
    },
    "provenance": {
      "sourceId": "space-marines-waha-11e-2026-10-20",
      "document": "books/space-marines/v2/sources/raw/wahapedia-datasheets-probe.html",
      "sha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
      "pointer": "/html/body/div/div[1]/div[3]/div[2]/div[8]/div[1]/div[9]",
      "sourceEntityId": "sm-source-7991b457a2d74ac3",
      "authority": "ACCEPTED_SECONDARY"
    }
  },
  {
    "id": "invulnerable-sm-667ca96f2c134852",
    "ownerId": "unit-sm-3d29619313c24850",
    "data": {
      "text": "INSV\n4+",
      "value": "4+",
      "conditionText": "",
      "scopeQualification": "DATASHEET_HEADER_SOURCE_PROFILES",
      "execution": "NOT_IMPLEMENTED",
      "sourceProfileIds": [
        "model-sm-2d677528799548ba"
      ]
    },
    "provenance": {
      "sourceId": "space-marines-waha-11e-2026-10-20",
      "document": "books/space-marines/v2/sources/raw/wahapedia-datasheets-probe.html",
      "sha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
      "pointer": "/html/body/div/div[1]/div[3]/div[2]/div[4]/div[1]/div[9]",
      "sourceEntityId": "sm-source-5041d435916d4af8",
      "authority": "ACCEPTED_SECONDARY"
    }
  },
  {
    "id": "invulnerable-sm-6ee1fe6e4c59459c",
    "ownerId": "unit-sm-e595c56eab2f493b",
    "data": {
      "text": "INSV\n4+",
      "value": "4+",
      "conditionText": "",
      "scopeQualification": "DATASHEET_HEADER_SOURCE_PROFILES",
      "execution": "NOT_IMPLEMENTED",
      "sourceProfileIds": [
        "model-sm-787b279449d1493a"
      ]
    },
    "provenance": {
      "sourceId": "space-marines-waha-11e-2026-10-20",
      "document": "books/space-marines/v2/sources/raw/wahapedia-datasheets-probe.html",
      "sha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
      "pointer": "/html/body/div/div[1]/div[3]/div[10]/div[20]/div[1]/div[9]",
      "sourceEntityId": "sm-source-6288a720b3844f57",
      "authority": "ACCEPTED_SECONDARY"
    }
  },
  {
    "id": "invulnerable-sm-79eb0e6df548475e",
    "ownerId": "unit-sm-99eb03d4f2d448e2",
    "data": {
      "text": "INSV\n4+",
      "value": "4+",
      "conditionText": "",
      "scopeQualification": "DATASHEET_HEADER_SOURCE_PROFILES",
      "execution": "NOT_IMPLEMENTED",
      "sourceProfileIds": [
        "model-sm-6b73ec4e731b4220"
      ]
    },
    "provenance": {
      "sourceId": "space-marines-waha-11e-2026-10-20",
      "document": "books/space-marines/v2/sources/raw/wahapedia-datasheets-probe.html",
      "sha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
      "pointer": "/html/body/div/div[1]/div[3]/div[10]/div[12]/div[1]/div[9]",
      "sourceEntityId": "sm-source-be6b84a98a224537",
      "authority": "ACCEPTED_SECONDARY"
    }
  },
  {
    "id": "invulnerable-sm-7c82ad0b00154fcb",
    "ownerId": "unit-sm-ac0e865c5ab94c9b",
    "data": {
      "text": "INSV\n4+",
      "value": "4+",
      "conditionText": "",
      "scopeQualification": "DATASHEET_HEADER_SOURCE_PROFILES",
      "execution": "NOT_IMPLEMENTED",
      "sourceProfileIds": [
        "model-sm-9c0eeeac90f44de9"
      ]
    },
    "provenance": {
      "sourceId": "space-marines-waha-11e-2026-10-20",
      "document": "books/space-marines/v2/sources/raw/wahapedia-datasheets-probe.html",
      "sha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
      "pointer": "/html/body/div/div[1]/div[3]/div[2]/div[6]/div[1]/div[9]",
      "sourceEntityId": "sm-source-8f3678d492cb45fe",
      "authority": "ACCEPTED_SECONDARY"
    }
  },
  {
    "id": "invulnerable-sm-7d98b71711604311",
    "ownerId": "unit-sm-b994e641eaea4060",
    "data": {
      "text": "INSV\n4+",
      "value": "4+",
      "conditionText": "",
      "scopeQualification": "DATASHEET_HEADER_SOURCE_PROFILES",
      "execution": "NOT_IMPLEMENTED",
      "sourceProfileIds": [
        "model-sm-8ec7500054ae49f0"
      ]
    },
    "provenance": {
      "sourceId": "space-marines-waha-11e-2026-10-20",
      "document": "books/space-marines/v2/sources/raw/wahapedia-datasheets-probe.html",
      "sha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
      "pointer": "/html/body/div/div[1]/div[3]/div[10]/div[24]/div[1]/div[9]",
      "sourceEntityId": "sm-source-70c5b181294945d9",
      "authority": "ACCEPTED_SECONDARY"
    }
  },
  {
    "id": "invulnerable-sm-81027fe766bc4da4",
    "ownerId": "unit-sm-67f47cb0752e44ad",
    "data": {
      "text": "INSV\n4+",
      "value": "4+",
      "conditionText": "",
      "scopeQualification": "DATASHEET_HEADER_SOURCE_PROFILES",
      "execution": "NOT_IMPLEMENTED",
      "sourceProfileIds": [
        "model-sm-bf5f36a2458c457d",
        "model-sm-e3b0418895b44e3d"
      ]
    },
    "provenance": {
      "sourceId": "space-marines-waha-11e-2026-10-20",
      "document": "books/space-marines/v2/sources/raw/wahapedia-datasheets-probe.html",
      "sha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
      "pointer": "/html/body/div/div[1]/div[3]/div[24]/div[6]/div[1]/div[10]",
      "sourceEntityId": "sm-source-0c08f7ea154d4eb0",
      "authority": "ACCEPTED_SECONDARY"
    }
  },
  {
    "id": "invulnerable-sm-a196b93a8ba24859",
    "ownerId": "unit-sm-c7226873c51d43c0",
    "data": {
      "text": "INSV*\n5+\n* Gaius Silva only",
      "value": "5+",
      "conditionText": "* Gaius Silva only",
      "scopeQualification": "EXPLICIT_NAMED_MODEL",
      "execution": "NOT_IMPLEMENTED",
      "sourceProfileIds": [
        "model-sm-3b16612be262433d"
      ]
    },
    "provenance": {
      "sourceId": "space-marines-waha-11e-2026-10-20",
      "document": "books/space-marines/v2/sources/raw/wahapedia-datasheets-probe.html",
      "sha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
      "pointer": "/html/body/div/div[1]/div[3]/div[2]/div[32]/div[1]/div[9]",
      "sourceEntityId": "sm-source-c36067ed54ff4250",
      "authority": "ACCEPTED_SECONDARY"
    }
  },
  {
    "id": "invulnerable-sm-b37510203ae44837",
    "ownerId": "unit-sm-d101fa171b7a40c4",
    "data": {
      "text": "INSV\n4+",
      "value": "4+",
      "conditionText": "",
      "scopeQualification": "DATASHEET_HEADER_SOURCE_PROFILES",
      "execution": "NOT_IMPLEMENTED",
      "sourceProfileIds": [
        "model-sm-bf9fe78a1fa747b5"
      ]
    },
    "provenance": {
      "sourceId": "space-marines-waha-11e-2026-10-20",
      "document": "books/space-marines/v2/sources/raw/wahapedia-datasheets-probe.html",
      "sha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
      "pointer": "/html/body/div/div[1]/div[3]/div[10]/div[18]/div[1]/div[9]",
      "sourceEntityId": "sm-source-5e957e67edba46d9",
      "authority": "ACCEPTED_SECONDARY"
    }
  },
  {
    "id": "invulnerable-sm-bdd4a2c2a98841b1",
    "ownerId": "unit-sm-9f9e7c18b7354927",
    "data": {
      "text": "INSV\n4+",
      "value": "4+",
      "conditionText": "",
      "scopeQualification": "DATASHEET_HEADER_SOURCE_PROFILES",
      "execution": "NOT_IMPLEMENTED",
      "sourceProfileIds": [
        "model-sm-b3f300c033ed47f9"
      ]
    },
    "provenance": {
      "sourceId": "space-marines-waha-11e-2026-10-20",
      "document": "books/space-marines/v2/sources/raw/wahapedia-datasheets-probe.html",
      "sha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
      "pointer": "/html/body/div/div[1]/div[3]/div[12]/div[2]/div[1]/div[9]",
      "sourceEntityId": "sm-source-33ffc7874f2848ff",
      "authority": "ACCEPTED_SECONDARY"
    }
  },
  {
    "id": "invulnerable-sm-beae915dcfcf41b3",
    "ownerId": "unit-sm-ff2af9c56daa4536",
    "data": {
      "text": "INSV\n4+",
      "value": "4+",
      "conditionText": "",
      "scopeQualification": "DATASHEET_HEADER_SOURCE_PROFILES",
      "execution": "NOT_IMPLEMENTED",
      "sourceProfileIds": [
        "model-sm-26c519e8e2254dc5"
      ]
    },
    "provenance": {
      "sourceId": "space-marines-waha-11e-2026-10-20",
      "document": "books/space-marines/v2/sources/raw/wahapedia-datasheets-probe.html",
      "sha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
      "pointer": "/html/body/div/div[1]/div[3]/div[10]/div[26]/div[1]/div[9]",
      "sourceEntityId": "sm-source-23081c89a32b46db",
      "authority": "ACCEPTED_SECONDARY"
    }
  },
  {
    "id": "invulnerable-sm-c9fd106882594392",
    "ownerId": "unit-sm-db3ce647d7024b24",
    "data": {
      "text": "INSV\n4+",
      "value": "4+",
      "conditionText": "",
      "scopeQualification": "DATASHEET_HEADER_SOURCE_PROFILES",
      "execution": "NOT_IMPLEMENTED",
      "sourceProfileIds": [
        "model-sm-ffb187aea23b4d91"
      ]
    },
    "provenance": {
      "sourceId": "space-marines-waha-11e-2026-10-20",
      "document": "books/space-marines/v2/sources/raw/wahapedia-datasheets-probe.html",
      "sha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
      "pointer": "/html/body/div/div[1]/div[3]/div[10]/div[4]/div[1]/div[9]",
      "sourceEntityId": "sm-source-e365aba7f3914259",
      "authority": "ACCEPTED_SECONDARY"
    }
  },
  {
    "id": "invulnerable-sm-caddc9542dce4f1f",
    "ownerId": "unit-sm-3460439c3a774c66",
    "data": {
      "text": "INSV\n4+",
      "value": "4+",
      "conditionText": "",
      "scopeQualification": "DATASHEET_HEADER_SOURCE_PROFILES",
      "execution": "NOT_IMPLEMENTED",
      "sourceProfileIds": [
        "model-sm-574846fb8e3e4e77"
      ]
    },
    "provenance": {
      "sourceId": "space-marines-waha-11e-2026-10-20",
      "document": "books/space-marines/v2/sources/raw/wahapedia-datasheets-probe.html",
      "sha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
      "pointer": "/html/body/div/div[1]/div[3]/div[2]/div[18]/div[1]/div[9]",
      "sourceEntityId": "sm-source-b5c80c7ca85c4556",
      "authority": "ACCEPTED_SECONDARY"
    }
  },
  {
    "id": "invulnerable-sm-d87409ab19f84629",
    "ownerId": "unit-sm-9e163be8d4bb42c1",
    "data": {
      "text": "INSV\n4+",
      "value": "4+",
      "conditionText": "",
      "scopeQualification": "DATASHEET_HEADER_SOURCE_PROFILES",
      "execution": "NOT_IMPLEMENTED",
      "sourceProfileIds": [
        "model-sm-0fcf83855af74d94",
        "model-sm-eb6a88440ae64725"
      ]
    },
    "provenance": {
      "sourceId": "space-marines-waha-11e-2026-10-20",
      "document": "books/space-marines/v2/sources/raw/wahapedia-datasheets-probe.html",
      "sha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
      "pointer": "/html/body/div/div[1]/div[3]/div[24]/div[34]/div[1]/div[10]",
      "sourceEntityId": "sm-source-f37eaf9d80444d08",
      "authority": "ACCEPTED_SECONDARY"
    }
  },
  {
    "id": "invulnerable-sm-ea71b2c6356c42bb",
    "ownerId": "unit-sm-536d38b5ac7645dc",
    "data": {
      "text": "INSV\n4+",
      "value": "4+",
      "conditionText": "",
      "scopeQualification": "DATASHEET_HEADER_SOURCE_PROFILES",
      "execution": "NOT_IMPLEMENTED",
      "sourceProfileIds": [
        "model-sm-75a49570c8e74e4d"
      ]
    },
    "provenance": {
      "sourceId": "space-marines-waha-11e-2026-10-20",
      "document": "books/space-marines/v2/sources/raw/wahapedia-datasheets-probe.html",
      "sha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
      "pointer": "/html/body/div/div[1]/div[3]/div[10]/div[22]/div[1]/div[9]",
      "sourceEntityId": "sm-source-4b6bafb21c094309",
      "authority": "ACCEPTED_SECONDARY"
    }
  },
  {
    "id": "invulnerable-sm-f36eb1fc7f7c4b6c",
    "ownerId": "unit-sm-5ce71f2f4e5e4ebb",
    "data": {
      "text": "INSV\n4+",
      "value": "4+",
      "conditionText": "",
      "scopeQualification": "DATASHEET_HEADER_SOURCE_PROFILES",
      "execution": "NOT_IMPLEMENTED",
      "sourceProfileIds": [
        "model-sm-9229dcfcb0d4472d",
        "model-sm-41730e5a9b8540d9"
      ]
    },
    "provenance": {
      "sourceId": "space-marines-waha-11e-2026-10-20",
      "document": "books/space-marines/v2/sources/raw/wahapedia-datasheets-probe.html",
      "sha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
      "pointer": "/html/body/div/div[1]/div[3]/div[24]/div[32]/div[1]/div[10]",
      "sourceEntityId": "sm-source-28766c8f5a60489d",
      "authority": "ACCEPTED_SECONDARY"
    }
  },
  {
    "id": "invulnerable-sm-f4327302855d4ac6",
    "ownerId": "unit-sm-bdf36a7ab1d64d50",
    "data": {
      "text": "INSV\n4+",
      "value": "4+",
      "conditionText": "",
      "scopeQualification": "DATASHEET_HEADER_SOURCE_PROFILES",
      "execution": "NOT_IMPLEMENTED",
      "sourceProfileIds": [
        "model-sm-19564c3ae075499c"
      ]
    },
    "provenance": {
      "sourceId": "space-marines-waha-11e-2026-10-20",
      "document": "books/space-marines/v2/sources/raw/wahapedia-datasheets-probe.html",
      "sha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
      "pointer": "/html/body/div/div[1]/div[3]/div[2]/div[30]/div[1]/div[9]",
      "sourceEntityId": "sm-source-13ba06847e554736",
      "authority": "ACCEPTED_SECONDARY"
    }
  },
  {
    "id": "invulnerable-sm-f72a9fb011cc4888",
    "ownerId": "unit-sm-1330b7672f934fd8",
    "data": {
      "text": "INSV\n4+",
      "value": "4+",
      "conditionText": "",
      "scopeQualification": "DATASHEET_HEADER_SOURCE_PROFILES",
      "execution": "NOT_IMPLEMENTED",
      "sourceProfileIds": [
        "model-sm-b02318906963426a"
      ]
    },
    "provenance": {
      "sourceId": "space-marines-waha-11e-2026-10-20",
      "document": "books/space-marines/v2/sources/raw/wahapedia-datasheets-probe.html",
      "sha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
      "pointer": "/html/body/div/div[1]/div[3]/div[10]/div[36]/div[1]/div[9]",
      "sourceEntityId": "sm-source-8fd3e4f11adb4a45",
      "authority": "ACCEPTED_SECONDARY"
    }
  }
]);
/** Seed established native stats from explicit source MODEL recipients only. */
export function bindNativeBaseProfiles(book){
  const index=new Map(book.entities.map(entity=>[entity.id,entity])),bindings=[],unsupported=[];
  const facts=book.entities.filter(e=>(e.sourceKind||e.kind)==='INVULNERABLE_SAVE');
  assert.deepEqual(facts.map(e=>e.id).sort(),nativeInvulnerableReview.map(e=>e.id).sort());
  for(const proof of nativeInvulnerableReview){
    const source=index.get(proof.id);assert.equal(source.parentId,proof.ownerId);
    assert.deepEqual(source.provenance,proof.provenance,'Invulnerable source provenance changed');
    // The presentation-only profileIds alias is permitted; factual source
    // recipient identities and conditions must remain exactly reviewed.
    for(const [key,value]of Object.entries(proof.data))assert.deepEqual(source.data[key],value,'Invulnerable source field changed: '+key);
    if(proof.data.conditionText&&proof.data.scopeQualification!=='EXPLICIT_NAMED_MODEL'){
      unsupported.push({id:proof.id,ownerId:proof.ownerId,status:'TEXT_ONLY_SOURCE_BACKED',scope:'MODEL',
        reason:'Conditional invulnerable save requires incoming attack context.',provenance:clone(proof.provenance)});continue;
    }
    for(const profileId of proof.data.sourceProfileIds){
      const profile=index.get(profileId);assert.ok(profile&&['PROFILE','MODEL_PROFILE'].includes(profile.kind));
      assert.equal(profile.parentId,proof.ownerId,'Foreign static invulnerable MODEL');
      assert.equal(profile.data.invulnerableSaveId,proof.id,'Missing native invulnerable identity');
      assert.ok(profile.data.stats,'Missing native MODEL stats');
      assert.ok(!Object.hasOwn(profile.data,'INSV'),'Duplicate native characteristic owner');
      if(Object.hasOwn(profile.data.stats,'INSV'))assert.equal(profile.data.stats.INSV,proof.data.value,'Conflicting invulnerable value');
      profile.data.stats.INSV=proof.data.value;
      bindings.push({id:proof.id,ownerId:proof.ownerId,profileId,field:['stats','INSV'],value:proof.data.value,
        sourceFields:[['value'],['sourceProfileIds'],['conditionText']],provenance:clone(proof.provenance),status:'EXECUTABLE_PROVEN',
        reason:'Static source characteristic; no combat event or conditional attack is evaluated.'});
    }
  }
  return {bindings,unsupported};
}

/** Exact RAW token boundaries separate normal and source-filtered keywords. */
export const nativeKeywordReview=Object.freeze([
  {
    "id": "unit-sm-0b0b22ecffa74125",
    "sourceEntityId": "sm-source-db5ef7e41d1048ca",
    "sourceKeywords": [
      "INFANTRY",
      "ANCIENT",
      "CHARACTER",
      "EXPLOSIVES",
      "IMPERIUM",
      "TACTICUS, DEATHWING"
    ],
    "sourceKeywordFieldSha256": "CEF2A37B593CBEAD3AD8864AC9A806094C561F05EE1688B852DCDC0A058BB5C3",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[10]/div[10]/div[3]/div[1]",
    "sourceText": "KEYWORDS: INFANTRY; ANCIENT; CHARACTER; EXPLOSIVES; IMPERIUM; TACTICUS, DEATHWING",
    "tokens": [
      {
        "value": "INFANTRY",
        "pointer": "/html/body/div/div[1]/div[3]/div[10]/div[10]/div[3]/div[1]/span/span[1]",
        "tooltip": "#tooltip_contentInfantry",
        "classes": [
          "tooltipInfantry"
        ],
        "conditional": false
      },
      {
        "value": "ANCIENT",
        "pointer": "/html/body/div/div[1]/div[3]/div[10]/div[10]/div[3]/div[1]/span/span[2]",
        "tooltip": "#tooltip_contentAncient",
        "classes": [
          "tooltipAncient"
        ],
        "conditional": false
      },
      {
        "value": "CHARACTER",
        "pointer": "/html/body/div/div[1]/div[3]/div[10]/div[10]/div[3]/div[1]/span/span[3]",
        "tooltip": "#tooltip_contentCharacter",
        "classes": [
          "tooltipCharacter"
        ],
        "conditional": false
      },
      {
        "value": "EXPLOSIVES",
        "pointer": "/html/body/div/div[1]/div[3]/div[10]/div[10]/div[3]/div[1]/span/span[4]",
        "tooltip": "#tooltip_contentExplosives",
        "classes": [
          "tooltipExplosives"
        ],
        "conditional": false
      },
      {
        "value": "IMPERIUM",
        "pointer": "/html/body/div/div[1]/div[3]/div[10]/div[10]/div[3]/div[1]/span/span[5]",
        "tooltip": "#tooltip_contentImperium",
        "classes": [
          "tooltipImperium"
        ],
        "conditional": false
      },
      {
        "value": "TACTICUS",
        "pointer": "/html/body/div/div[1]/div[3]/div[10]/div[10]/div[3]/div[1]/span/span[6]",
        "tooltip": "#tooltip_contentTacticus",
        "classes": [
          "tooltipTacticus"
        ],
        "conditional": false
      },
      {
        "value": "DEATHWING",
        "pointer": "/html/body/div/div[1]/div[3]/div[10]/div[10]/div[3]/div[1]/span/span[8]",
        "tooltip": "#tooltip_contentDeathwing",
        "classes": [
          "tooltipDeathwing",
          "clFl",
          "CHDA",
          "AAAA",
          "AAGA",
          "AAAB",
          "AATB",
          "AADB",
          "AATS",
          "AATC",
          "AATF",
          "AAPS",
          "AAPF",
          "AAGL",
          "AAGS",
          "AAST",
          "AAIR",
          "AAGT",
          "AAIS",
          "AAFG",
          "AAMH",
          "AAVO",
          "AAAI",
          "AAEN",
          "AAWD",
          "AADP",
          "AAIC",
          "AAWR",
          "AABF",
          "AADS",
          "AAMW",
          "AACS",
          "AASK",
          "AAFS",
          "AACF",
          "AASS",
          "AAGW",
          "AABU",
          "AASF",
          "AABS",
          "AAPI",
          "AATA",
          "AASV"
        ],
        "conditional": true
      }
    ],
    "unconditionalKeywords": [
      "INFANTRY",
      "ANCIENT",
      "CHARACTER",
      "EXPLOSIVES",
      "IMPERIUM",
      "TACTICUS"
    ],
    "conditionalKeywords": [
      "DEATHWING"
    ],
    "provenance": {
      "sourceId": "space-marines-waha-11e-2026-10-20",
      "document": "books/space-marines/v2/sources/raw/wahapedia-datasheets-probe.html",
      "sha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
      "pointer": "/html/body/div/div[1]/div[3]/div[10]/div[10]",
      "sourceEntityId": "sm-source-db5ef7e41d1048ca",
      "authority": "ACCEPTED_SECONDARY"
    }
  },
  {
    "id": "unit-sm-0dd92e6d8ad54ee6",
    "sourceEntityId": "sm-source-370bcca7a77a4f20",
    "sourceKeywords": [
      "MOUNTED",
      "EXPLOSIVES",
      "IMPERIUM, RAVENWING"
    ],
    "sourceKeywordFieldSha256": "96A3339F22A4EFA23F9BBD7C1140D02471133A159C46B34E2BBD9ED24B40BCA4",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[26]/div[4]/div[3]/div[1]",
    "sourceText": "KEYWORDS: MOUNTED; EXPLOSIVES; IMPERIUM, RAVENWING",
    "tokens": [
      {
        "value": "MOUNTED",
        "pointer": "/html/body/div/div[1]/div[3]/div[26]/div[4]/div[3]/div[1]/span/span[1]",
        "tooltip": "#tooltip_contentMounted",
        "classes": [
          "tooltipMounted"
        ],
        "conditional": false
      },
      {
        "value": "EXPLOSIVES",
        "pointer": "/html/body/div/div[1]/div[3]/div[26]/div[4]/div[3]/div[1]/span/span[2]",
        "tooltip": "#tooltip_contentExplosives",
        "classes": [
          "tooltipExplosives"
        ],
        "conditional": false
      },
      {
        "value": "IMPERIUM",
        "pointer": "/html/body/div/div[1]/div[3]/div[26]/div[4]/div[3]/div[1]/span/span[3]",
        "tooltip": "#tooltip_contentImperium",
        "classes": [
          "tooltipImperium"
        ],
        "conditional": false
      },
      {
        "value": "RAVENWING",
        "pointer": "/html/body/div/div[1]/div[3]/div[26]/div[4]/div[3]/div[1]/span/span[5]",
        "tooltip": "#tooltip_contentRavenwing",
        "classes": [
          "tooltipRavenwing",
          "clFl",
          "CHDA",
          "AAAA",
          "AAGA",
          "AAAB",
          "AATB",
          "AADB",
          "AATS",
          "AATC",
          "AATF",
          "AAPS",
          "AAPF",
          "AAGL",
          "AAGS",
          "AAST",
          "AAIR",
          "AAGT",
          "AAIS",
          "AAFG",
          "AAMH",
          "AAVO",
          "AAAI",
          "AAEN",
          "AAWD",
          "AADP",
          "AAIC",
          "AAWR",
          "AABF",
          "AADS",
          "AAMW",
          "AACS",
          "AASK",
          "AAFS",
          "AACF",
          "AASS",
          "AAGW",
          "AABU",
          "AASF",
          "AABS",
          "AAPI",
          "AATA",
          "AASV"
        ],
        "conditional": true
      }
    ],
    "unconditionalKeywords": [
      "MOUNTED",
      "EXPLOSIVES",
      "IMPERIUM"
    ],
    "conditionalKeywords": [
      "RAVENWING"
    ],
    "provenance": {
      "sourceId": "space-marines-waha-11e-2026-10-20",
      "document": "books/space-marines/v2/sources/raw/wahapedia-datasheets-probe.html",
      "sha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
      "pointer": "/html/body/div/div[1]/div[3]/div[26]/div[4]",
      "sourceEntityId": "sm-source-370bcca7a77a4f20",
      "authority": "ACCEPTED_SECONDARY"
    }
  },
  {
    "id": "unit-sm-1330b7672f934fd8",
    "sourceEntityId": "sm-source-fbcd5943ab074e20",
    "sourceKeywords": [
      "INFANTRY",
      "CHARACTER",
      "IMPERIUM",
      "PSYKER",
      "TERMINATOR, DEATHWING"
    ],
    "sourceKeywordFieldSha256": "5491DBC437459D57DC9435981BF94725BB5789220AB028F3C82D6212A109D863",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[10]/div[36]/div[3]/div[1]",
    "sourceText": "KEYWORDS: INFANTRY; CHARACTER; IMPERIUM; PSYKER; TERMINATOR, DEATHWING",
    "tokens": [
      {
        "value": "INFANTRY",
        "pointer": "/html/body/div/div[1]/div[3]/div[10]/div[36]/div[3]/div[1]/span/span[1]",
        "tooltip": "#tooltip_contentInfantry",
        "classes": [
          "tooltipInfantry"
        ],
        "conditional": false
      },
      {
        "value": "CHARACTER",
        "pointer": "/html/body/div/div[1]/div[3]/div[10]/div[36]/div[3]/div[1]/span/span[2]",
        "tooltip": "#tooltip_contentCharacter",
        "classes": [
          "tooltipCharacter"
        ],
        "conditional": false
      },
      {
        "value": "IMPERIUM",
        "pointer": "/html/body/div/div[1]/div[3]/div[10]/div[36]/div[3]/div[1]/span/span[3]",
        "tooltip": "#tooltip_contentImperium",
        "classes": [
          "tooltipImperium"
        ],
        "conditional": false
      },
      {
        "value": "PSYKER",
        "pointer": "/html/body/div/div[1]/div[3]/div[10]/div[36]/div[3]/div[1]/span/span[4]",
        "tooltip": "#tooltip_contentPsyker",
        "classes": [
          "tooltipPsyker"
        ],
        "conditional": false
      },
      {
        "value": "TERMINATOR",
        "pointer": "/html/body/div/div[1]/div[3]/div[10]/div[36]/div[3]/div[1]/span/span[5]",
        "tooltip": "#tooltip_contentTerminator",
        "classes": [
          "tooltipTerminator"
        ],
        "conditional": false
      },
      {
        "value": "DEATHWING",
        "pointer": "/html/body/div/div[1]/div[3]/div[10]/div[36]/div[3]/div[1]/span/span[7]",
        "tooltip": "#tooltip_contentDeathwing",
        "classes": [
          "tooltipDeathwing",
          "clFl",
          "CHDA",
          "AAAA",
          "AAGA",
          "AAAB",
          "AATB",
          "AADB",
          "AATS",
          "AATC",
          "AATF",
          "AAPS",
          "AAPF",
          "AAGL",
          "AAGS",
          "AAST",
          "AAIR",
          "AAGT",
          "AAIS",
          "AAFG",
          "AAMH",
          "AAVO",
          "AAAI",
          "AAEN",
          "AAWD",
          "AADP",
          "AAIC",
          "AAWR",
          "AABF",
          "AADS",
          "AAMW",
          "AACS",
          "AASK",
          "AAFS",
          "AACF",
          "AASS",
          "AAGW",
          "AABU",
          "AASF",
          "AABS",
          "AAPI",
          "AATA",
          "AASV"
        ],
        "conditional": true
      }
    ],
    "unconditionalKeywords": [
      "INFANTRY",
      "CHARACTER",
      "IMPERIUM",
      "PSYKER",
      "TERMINATOR"
    ],
    "conditionalKeywords": [
      "DEATHWING"
    ],
    "provenance": {
      "sourceId": "space-marines-waha-11e-2026-10-20",
      "document": "books/space-marines/v2/sources/raw/wahapedia-datasheets-probe.html",
      "sha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
      "pointer": "/html/body/div/div[1]/div[3]/div[10]/div[36]",
      "sourceEntityId": "sm-source-fbcd5943ab074e20",
      "authority": "ACCEPTED_SECONDARY"
    }
  },
  {
    "id": "unit-sm-24b4709c45ef4b2d",
    "sourceEntityId": "sm-source-94e879232fda4b6a",
    "sourceKeywords": [
      "INFANTRY",
      "EXPLOSIVES",
      "IMPERIUM",
      "TACTICUS, DEATHWING"
    ],
    "sourceKeywordFieldSha256": "9BA45ACAB50730CD0F4FE3C3242289A5611ED7A261E25DDE519513C8082328CD",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[24]/div[30]/div[3]/div[1]",
    "sourceText": "KEYWORDS: INFANTRY; EXPLOSIVES; IMPERIUM; TACTICUS, DEATHWING",
    "tokens": [
      {
        "value": "INFANTRY",
        "pointer": "/html/body/div/div[1]/div[3]/div[24]/div[30]/div[3]/div[1]/span/span[1]",
        "tooltip": "#tooltip_contentInfantry",
        "classes": [
          "tooltipInfantry"
        ],
        "conditional": false
      },
      {
        "value": "EXPLOSIVES",
        "pointer": "/html/body/div/div[1]/div[3]/div[24]/div[30]/div[3]/div[1]/span/span[2]",
        "tooltip": "#tooltip_contentExplosives",
        "classes": [
          "tooltipExplosives"
        ],
        "conditional": false
      },
      {
        "value": "IMPERIUM",
        "pointer": "/html/body/div/div[1]/div[3]/div[24]/div[30]/div[3]/div[1]/span/span[3]",
        "tooltip": "#tooltip_contentImperium",
        "classes": [
          "tooltipImperium"
        ],
        "conditional": false
      },
      {
        "value": "TACTICUS",
        "pointer": "/html/body/div/div[1]/div[3]/div[24]/div[30]/div[3]/div[1]/span/span[4]",
        "tooltip": "#tooltip_contentTacticus",
        "classes": [
          "tooltipTacticus"
        ],
        "conditional": false
      },
      {
        "value": "DEATHWING",
        "pointer": "/html/body/div/div[1]/div[3]/div[24]/div[30]/div[3]/div[1]/span/span[6]",
        "tooltip": "#tooltip_contentDeathwing",
        "classes": [
          "tooltipDeathwing",
          "clFl",
          "CHDA",
          "AAAA",
          "AAGA",
          "AAAB",
          "AATB",
          "AADB",
          "AATS",
          "AATC",
          "AATF",
          "AAPS",
          "AAPF",
          "AAGL",
          "AAGS",
          "AAST",
          "AAIR",
          "AAGT",
          "AAIS",
          "AAFG",
          "AAMH",
          "AAVO",
          "AAAI",
          "AAEN",
          "AAWD",
          "AADP",
          "AAIC",
          "AAWR",
          "AABF",
          "AADS",
          "AAMW",
          "AACS",
          "AASK",
          "AAFS",
          "AACF",
          "AASS",
          "AAGW",
          "AABU",
          "AASF",
          "AABS",
          "AAPI",
          "AATA",
          "AASV"
        ],
        "conditional": true
      }
    ],
    "unconditionalKeywords": [
      "INFANTRY",
      "EXPLOSIVES",
      "IMPERIUM",
      "TACTICUS"
    ],
    "conditionalKeywords": [
      "DEATHWING"
    ],
    "provenance": {
      "sourceId": "space-marines-waha-11e-2026-10-20",
      "document": "books/space-marines/v2/sources/raw/wahapedia-datasheets-probe.html",
      "sha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
      "pointer": "/html/body/div/div[1]/div[3]/div[24]/div[30]",
      "sourceEntityId": "sm-source-94e879232fda4b6a",
      "authority": "ACCEPTED_SECONDARY"
    }
  },
  {
    "id": "unit-sm-32e5b655a21342f6",
    "sourceEntityId": "sm-source-b1226421533742d3",
    "sourceKeywords": [
      "VEHICLE",
      "DREADNOUGHT",
      "IMPERIUM",
      "WALKER, DEATHWING"
    ],
    "sourceKeywordFieldSha256": "D3438DF027EB3BDD44D2D7AC0918EF7DD06ADE9EB9A5415E41F2F471A549824D",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[34]/div[8]/div[3]/div[1]",
    "sourceText": "KEYWORDS: VEHICLE; DREADNOUGHT; IMPERIUM; WALKER, DEATHWING",
    "tokens": [
      {
        "value": "VEHICLE",
        "pointer": "/html/body/div/div[1]/div[3]/div[34]/div[8]/div[3]/div[1]/span/span[1]",
        "tooltip": "#tooltip_contentVehicle",
        "classes": [
          "tooltipVehicle"
        ],
        "conditional": false
      },
      {
        "value": "DREADNOUGHT",
        "pointer": "/html/body/div/div[1]/div[3]/div[34]/div[8]/div[3]/div[1]/span/span[2]",
        "tooltip": "#tooltip_contentDreadnought",
        "classes": [
          "tooltipDreadnought"
        ],
        "conditional": false
      },
      {
        "value": "IMPERIUM",
        "pointer": "/html/body/div/div[1]/div[3]/div[34]/div[8]/div[3]/div[1]/span/span[3]",
        "tooltip": "#tooltip_contentImperium",
        "classes": [
          "tooltipImperium"
        ],
        "conditional": false
      },
      {
        "value": "WALKER",
        "pointer": "/html/body/div/div[1]/div[3]/div[34]/div[8]/div[3]/div[1]/span/span[4]",
        "tooltip": "#tooltip_contentWalker",
        "classes": [
          "tooltipWalker"
        ],
        "conditional": false
      },
      {
        "value": "DEATHWING",
        "pointer": "/html/body/div/div[1]/div[3]/div[34]/div[8]/div[3]/div[1]/span/span[6]",
        "tooltip": "#tooltip_contentDeathwing",
        "classes": [
          "tooltipDeathwing",
          "clFl",
          "CHDA",
          "AAAA",
          "AAGA",
          "AAAB",
          "AATB",
          "AADB",
          "AATS",
          "AATC",
          "AATF",
          "AAPS",
          "AAPF",
          "AAGL",
          "AAGS",
          "AAST",
          "AAIR",
          "AAGT",
          "AAIS",
          "AAFG",
          "AAMH",
          "AAVO",
          "AAAI",
          "AAEN",
          "AAWD",
          "AADP",
          "AAIC",
          "AAWR",
          "AABF",
          "AADS",
          "AAMW",
          "AACS",
          "AASK",
          "AAFS",
          "AACF",
          "AASS",
          "AAGW",
          "AABU",
          "AASF",
          "AABS",
          "AAPI",
          "AATA",
          "AASV"
        ],
        "conditional": true
      }
    ],
    "unconditionalKeywords": [
      "VEHICLE",
      "DREADNOUGHT",
      "IMPERIUM",
      "WALKER"
    ],
    "conditionalKeywords": [
      "DEATHWING"
    ],
    "provenance": {
      "sourceId": "space-marines-waha-11e-2026-10-20",
      "document": "books/space-marines/v2/sources/raw/wahapedia-datasheets-probe.html",
      "sha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
      "pointer": "/html/body/div/div[1]/div[3]/div[34]/div[8]",
      "sourceEntityId": "sm-source-b1226421533742d3",
      "authority": "ACCEPTED_SECONDARY"
    }
  },
  {
    "id": "unit-sm-46fb0fe9443c4e95",
    "sourceEntityId": "sm-source-cbd29019463e4ce4",
    "sourceKeywords": [
      "VEHICLE",
      "EXPLOSIVES",
      "FRAME",
      "IMPERIUM",
      "SMOKE",
      "TRANSPORT, DEATHWING"
    ],
    "sourceKeywordFieldSha256": "FEF34991AFA470AD9ED0979847581C0C1C2B4D4EECF0E4658107443FD4D8946C",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[30]/div[4]/div[3]/div[1]",
    "sourceText": "KEYWORDS: VEHICLE; EXPLOSIVES; FRAME; IMPERIUM; SMOKE; TRANSPORT, DEATHWING",
    "tokens": [
      {
        "value": "VEHICLE",
        "pointer": "/html/body/div/div[1]/div[3]/div[30]/div[4]/div[3]/div[1]/span/span[1]",
        "tooltip": "#tooltip_contentVehicle",
        "classes": [
          "tooltipVehicle"
        ],
        "conditional": false
      },
      {
        "value": "EXPLOSIVES",
        "pointer": "/html/body/div/div[1]/div[3]/div[30]/div[4]/div[3]/div[1]/span/span[2]",
        "tooltip": "#tooltip_contentExplosives",
        "classes": [
          "tooltipExplosives"
        ],
        "conditional": false
      },
      {
        "value": "FRAME",
        "pointer": "/html/body/div/div[1]/div[3]/div[30]/div[4]/div[3]/div[1]/span/span[3]",
        "tooltip": "#tooltip_contentFrame",
        "classes": [
          "tooltipFrame"
        ],
        "conditional": false
      },
      {
        "value": "IMPERIUM",
        "pointer": "/html/body/div/div[1]/div[3]/div[30]/div[4]/div[3]/div[1]/span/span[4]",
        "tooltip": "#tooltip_contentImperium",
        "classes": [
          "tooltipImperium"
        ],
        "conditional": false
      },
      {
        "value": "SMOKE",
        "pointer": "/html/body/div/div[1]/div[3]/div[30]/div[4]/div[3]/div[1]/span/span[5]",
        "tooltip": "#tooltip_contentSmoke",
        "classes": [
          "tooltipSmoke"
        ],
        "conditional": false
      },
      {
        "value": "TRANSPORT",
        "pointer": "/html/body/div/div[1]/div[3]/div[30]/div[4]/div[3]/div[1]/span/span[6]",
        "tooltip": "#tooltip_contentTransport",
        "classes": [
          "tooltipTransport"
        ],
        "conditional": false
      },
      {
        "value": "DEATHWING",
        "pointer": "/html/body/div/div[1]/div[3]/div[30]/div[4]/div[3]/div[1]/span/span[8]",
        "tooltip": "#tooltip_contentDeathwing",
        "classes": [
          "tooltipDeathwing",
          "clFl",
          "CHDA",
          "AAAA",
          "AAGA",
          "AAAB",
          "AATB",
          "AADB",
          "AATS",
          "AATC",
          "AATF",
          "AAPS",
          "AAPF",
          "AAGL",
          "AAGS",
          "AAST",
          "AAIR",
          "AAGT",
          "AAIS",
          "AAFG",
          "AAMH",
          "AAVO",
          "AAAI",
          "AAEN",
          "AAWD",
          "AADP",
          "AAIC",
          "AAWR",
          "AABF",
          "AADS",
          "AAMW",
          "AACS",
          "AASK",
          "AAFS",
          "AACF",
          "AASS",
          "AAGW",
          "AABU",
          "AASF",
          "AABS",
          "AAPI",
          "AATA",
          "AASV"
        ],
        "conditional": true
      }
    ],
    "unconditionalKeywords": [
      "VEHICLE",
      "EXPLOSIVES",
      "FRAME",
      "IMPERIUM",
      "SMOKE",
      "TRANSPORT"
    ],
    "conditionalKeywords": [
      "DEATHWING"
    ],
    "provenance": {
      "sourceId": "space-marines-waha-11e-2026-10-20",
      "document": "books/space-marines/v2/sources/raw/wahapedia-datasheets-probe.html",
      "sha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
      "pointer": "/html/body/div/div[1]/div[3]/div[30]/div[4]",
      "sourceEntityId": "sm-source-cbd29019463e4ce4",
      "authority": "ACCEPTED_SECONDARY"
    }
  },
  {
    "id": "unit-sm-4cd4bf89720c4fa0",
    "sourceEntityId": "sm-source-67d73a21991b441d",
    "sourceKeywords": [
      "MOUNTED",
      "CHAPLAIN",
      "CHARACTER",
      "EXPLOSIVES",
      "IMPERIUM, RAVENWING"
    ],
    "sourceKeywordFieldSha256": "4E63E4260DBFDB871EAA565360979EF1F03C2376C4A9638E930EF0BBDB52D255",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[12]/div[4]/div[3]/div[1]",
    "sourceText": "KEYWORDS: MOUNTED; CHAPLAIN; CHARACTER; EXPLOSIVES; IMPERIUM, RAVENWING",
    "tokens": [
      {
        "value": "MOUNTED",
        "pointer": "/html/body/div/div[1]/div[3]/div[12]/div[4]/div[3]/div[1]/span/span[1]",
        "tooltip": "#tooltip_contentMounted",
        "classes": [
          "tooltipMounted"
        ],
        "conditional": false
      },
      {
        "value": "CHAPLAIN",
        "pointer": "/html/body/div/div[1]/div[3]/div[12]/div[4]/div[3]/div[1]/span/span[2]",
        "tooltip": "#tooltip_contentChaplain",
        "classes": [
          "tooltipChaplain"
        ],
        "conditional": false
      },
      {
        "value": "CHARACTER",
        "pointer": "/html/body/div/div[1]/div[3]/div[12]/div[4]/div[3]/div[1]/span/span[3]",
        "tooltip": "#tooltip_contentCharacter",
        "classes": [
          "tooltipCharacter"
        ],
        "conditional": false
      },
      {
        "value": "EXPLOSIVES",
        "pointer": "/html/body/div/div[1]/div[3]/div[12]/div[4]/div[3]/div[1]/span/span[4]",
        "tooltip": "#tooltip_contentExplosives",
        "classes": [
          "tooltipExplosives"
        ],
        "conditional": false
      },
      {
        "value": "IMPERIUM",
        "pointer": "/html/body/div/div[1]/div[3]/div[12]/div[4]/div[3]/div[1]/span/span[5]",
        "tooltip": "#tooltip_contentImperium",
        "classes": [
          "tooltipImperium"
        ],
        "conditional": false
      },
      {
        "value": "RAVENWING",
        "pointer": "/html/body/div/div[1]/div[3]/div[12]/div[4]/div[3]/div[1]/span/span[7]",
        "tooltip": "#tooltip_contentRavenwing",
        "classes": [
          "tooltipRavenwing",
          "clFl",
          "CHDA",
          "AAAA",
          "AAGA",
          "AAAB",
          "AATB",
          "AADB",
          "AATS",
          "AATC",
          "AATF",
          "AAPS",
          "AAPF",
          "AAGL",
          "AAGS",
          "AAST",
          "AAIR",
          "AAGT",
          "AAIS",
          "AAFG",
          "AAMH",
          "AAVO",
          "AAAI",
          "AAEN",
          "AAWD",
          "AADP",
          "AAIC",
          "AAWR",
          "AABF",
          "AADS",
          "AAMW",
          "AACS",
          "AASK",
          "AAFS",
          "AACF",
          "AASS",
          "AAGW",
          "AABU",
          "AASF",
          "AABS",
          "AAPI",
          "AATA",
          "AASV"
        ],
        "conditional": true
      }
    ],
    "unconditionalKeywords": [
      "MOUNTED",
      "CHAPLAIN",
      "CHARACTER",
      "EXPLOSIVES",
      "IMPERIUM"
    ],
    "conditionalKeywords": [
      "RAVENWING"
    ],
    "provenance": {
      "sourceId": "space-marines-waha-11e-2026-10-20",
      "document": "books/space-marines/v2/sources/raw/wahapedia-datasheets-probe.html",
      "sha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
      "pointer": "/html/body/div/div[1]/div[3]/div[12]/div[4]",
      "sourceEntityId": "sm-source-67d73a21991b441d",
      "authority": "ACCEPTED_SECONDARY"
    }
  },
  {
    "id": "unit-sm-4f6baee09b3248a6",
    "sourceEntityId": "sm-source-acc38a8b470a43ba",
    "sourceKeywords": [
      "VEHICLE",
      "DREADNOUGHT",
      "IMPERIUM",
      "WALKER, DEATHWING"
    ],
    "sourceKeywordFieldSha256": "D3438DF027EB3BDD44D2D7AC0918EF7DD06ADE9EB9A5415E41F2F471A549824D",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[34]/div[2]/div[3]/div[1]",
    "sourceText": "KEYWORDS: VEHICLE; DREADNOUGHT; IMPERIUM; WALKER, DEATHWING",
    "tokens": [
      {
        "value": "VEHICLE",
        "pointer": "/html/body/div/div[1]/div[3]/div[34]/div[2]/div[3]/div[1]/span/span[1]",
        "tooltip": "#tooltip_contentVehicle",
        "classes": [
          "tooltipVehicle"
        ],
        "conditional": false
      },
      {
        "value": "DREADNOUGHT",
        "pointer": "/html/body/div/div[1]/div[3]/div[34]/div[2]/div[3]/div[1]/span/span[2]",
        "tooltip": "#tooltip_contentDreadnought",
        "classes": [
          "tooltipDreadnought"
        ],
        "conditional": false
      },
      {
        "value": "IMPERIUM",
        "pointer": "/html/body/div/div[1]/div[3]/div[34]/div[2]/div[3]/div[1]/span/span[3]",
        "tooltip": "#tooltip_contentImperium",
        "classes": [
          "tooltipImperium"
        ],
        "conditional": false
      },
      {
        "value": "WALKER",
        "pointer": "/html/body/div/div[1]/div[3]/div[34]/div[2]/div[3]/div[1]/span/span[4]",
        "tooltip": "#tooltip_contentWalker",
        "classes": [
          "tooltipWalker"
        ],
        "conditional": false
      },
      {
        "value": "DEATHWING",
        "pointer": "/html/body/div/div[1]/div[3]/div[34]/div[2]/div[3]/div[1]/span/span[6]",
        "tooltip": "#tooltip_contentDeathwing",
        "classes": [
          "tooltipDeathwing",
          "clFl",
          "CHDA",
          "AAAA",
          "AAGA",
          "AAAB",
          "AATB",
          "AADB",
          "AATS",
          "AATC",
          "AATF",
          "AAPS",
          "AAPF",
          "AAGL",
          "AAGS",
          "AAST",
          "AAIR",
          "AAGT",
          "AAIS",
          "AAFG",
          "AAMH",
          "AAVO",
          "AAAI",
          "AAEN",
          "AAWD",
          "AADP",
          "AAIC",
          "AAWR",
          "AABF",
          "AADS",
          "AAMW",
          "AACS",
          "AASK",
          "AAFS",
          "AACF",
          "AASS",
          "AAGW",
          "AABU",
          "AASF",
          "AABS",
          "AAPI",
          "AATA",
          "AASV"
        ],
        "conditional": true
      }
    ],
    "unconditionalKeywords": [
      "VEHICLE",
      "DREADNOUGHT",
      "IMPERIUM",
      "WALKER"
    ],
    "conditionalKeywords": [
      "DEATHWING"
    ],
    "provenance": {
      "sourceId": "space-marines-waha-11e-2026-10-20",
      "document": "books/space-marines/v2/sources/raw/wahapedia-datasheets-probe.html",
      "sha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
      "pointer": "/html/body/div/div[1]/div[3]/div[34]/div[2]",
      "sourceEntityId": "sm-source-acc38a8b470a43ba",
      "authority": "ACCEPTED_SECONDARY"
    }
  },
  {
    "id": "unit-sm-56eaa095b0ae4fe4",
    "sourceEntityId": "sm-source-60a8b0f935b24f04",
    "sourceKeywords": [
      "MOUNTED",
      "VEHICLE",
      "FRAME",
      "IMPERIUM, RAVENWING"
    ],
    "sourceKeywordFieldSha256": "B13940F226BD337084A4961A390CDA7DF689D663FA8D5248279A0EF3232677F8",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[26]/div[2]/div[3]/div[1]",
    "sourceText": "KEYWORDS: MOUNTED; VEHICLE; FRAME; IMPERIUM, RAVENWING",
    "tokens": [
      {
        "value": "MOUNTED",
        "pointer": "/html/body/div/div[1]/div[3]/div[26]/div[2]/div[3]/div[1]/span/span[1]",
        "tooltip": "#tooltip_contentMounted",
        "classes": [
          "tooltipMounted"
        ],
        "conditional": false
      },
      {
        "value": "VEHICLE",
        "pointer": "/html/body/div/div[1]/div[3]/div[26]/div[2]/div[3]/div[1]/span/span[2]",
        "tooltip": "#tooltip_contentVehicle",
        "classes": [
          "tooltipVehicle"
        ],
        "conditional": false
      },
      {
        "value": "FRAME",
        "pointer": "/html/body/div/div[1]/div[3]/div[26]/div[2]/div[3]/div[1]/span/span[3]",
        "tooltip": "#tooltip_contentFrame",
        "classes": [
          "tooltipFrame"
        ],
        "conditional": false
      },
      {
        "value": "IMPERIUM",
        "pointer": "/html/body/div/div[1]/div[3]/div[26]/div[2]/div[3]/div[1]/span/span[4]",
        "tooltip": "#tooltip_contentImperium",
        "classes": [
          "tooltipImperium"
        ],
        "conditional": false
      },
      {
        "value": "RAVENWING",
        "pointer": "/html/body/div/div[1]/div[3]/div[26]/div[2]/div[3]/div[1]/span/span[6]",
        "tooltip": "#tooltip_contentRavenwing",
        "classes": [
          "tooltipRavenwing",
          "clFl",
          "CHDA",
          "AAAA",
          "AAGA",
          "AAAB",
          "AATB",
          "AADB",
          "AATS",
          "AATC",
          "AATF",
          "AAPS",
          "AAPF",
          "AAGL",
          "AAGS",
          "AAST",
          "AAIR",
          "AAGT",
          "AAIS",
          "AAFG",
          "AAMH",
          "AAVO",
          "AAAI",
          "AAEN",
          "AAWD",
          "AADP",
          "AAIC",
          "AAWR",
          "AABF",
          "AADS",
          "AAMW",
          "AACS",
          "AASK",
          "AAFS",
          "AACF",
          "AASS",
          "AAGW",
          "AABU",
          "AASF",
          "AABS",
          "AAPI",
          "AATA",
          "AASV"
        ],
        "conditional": true
      }
    ],
    "unconditionalKeywords": [
      "MOUNTED",
      "VEHICLE",
      "FRAME",
      "IMPERIUM"
    ],
    "conditionalKeywords": [
      "RAVENWING"
    ],
    "provenance": {
      "sourceId": "space-marines-waha-11e-2026-10-20",
      "document": "books/space-marines/v2/sources/raw/wahapedia-datasheets-probe.html",
      "sha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
      "pointer": "/html/body/div/div[1]/div[3]/div[26]/div[2]",
      "sourceEntityId": "sm-source-60a8b0f935b24f04",
      "authority": "ACCEPTED_SECONDARY"
    }
  },
  {
    "id": "unit-sm-5ce71f2f4e5e4ebb",
    "sourceEntityId": "sm-source-1c0e7c579f604bf6",
    "sourceKeywords": [
      "INFANTRY",
      "IMPERIUM",
      "TERMINATOR, DEATHWING"
    ],
    "sourceKeywordFieldSha256": "317A32E661F10ED135A40A7FE76EB92C5BCAC32D2FE082DAB3B91879DF85CC11",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[24]/div[32]/div[3]/div[1]",
    "sourceText": "KEYWORDS: INFANTRY; IMPERIUM; TERMINATOR, DEATHWING",
    "tokens": [
      {
        "value": "INFANTRY",
        "pointer": "/html/body/div/div[1]/div[3]/div[24]/div[32]/div[3]/div[1]/span/span[1]",
        "tooltip": "#tooltip_contentInfantry",
        "classes": [
          "tooltipInfantry"
        ],
        "conditional": false
      },
      {
        "value": "IMPERIUM",
        "pointer": "/html/body/div/div[1]/div[3]/div[24]/div[32]/div[3]/div[1]/span/span[2]",
        "tooltip": "#tooltip_contentImperium",
        "classes": [
          "tooltipImperium"
        ],
        "conditional": false
      },
      {
        "value": "TERMINATOR",
        "pointer": "/html/body/div/div[1]/div[3]/div[24]/div[32]/div[3]/div[1]/span/span[3]",
        "tooltip": "#tooltip_contentTerminator",
        "classes": [
          "tooltipTerminator"
        ],
        "conditional": false
      },
      {
        "value": "DEATHWING",
        "pointer": "/html/body/div/div[1]/div[3]/div[24]/div[32]/div[3]/div[1]/span/span[5]",
        "tooltip": "#tooltip_contentDeathwing",
        "classes": [
          "tooltipDeathwing",
          "clFl",
          "CHDA",
          "AAAA",
          "AAGA",
          "AAAB",
          "AATB",
          "AADB",
          "AATS",
          "AATC",
          "AATF",
          "AAPS",
          "AAPF",
          "AAGL",
          "AAGS",
          "AAST",
          "AAIR",
          "AAGT",
          "AAIS",
          "AAFG",
          "AAMH",
          "AAVO",
          "AAAI",
          "AAEN",
          "AAWD",
          "AADP",
          "AAIC",
          "AAWR",
          "AABF",
          "AADS",
          "AAMW",
          "AACS",
          "AASK",
          "AAFS",
          "AACF",
          "AASS",
          "AAGW",
          "AABU",
          "AASF",
          "AABS",
          "AAPI",
          "AATA",
          "AASV"
        ],
        "conditional": true
      }
    ],
    "unconditionalKeywords": [
      "INFANTRY",
      "IMPERIUM",
      "TERMINATOR"
    ],
    "conditionalKeywords": [
      "DEATHWING"
    ],
    "provenance": {
      "sourceId": "space-marines-waha-11e-2026-10-20",
      "document": "books/space-marines/v2/sources/raw/wahapedia-datasheets-probe.html",
      "sha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
      "pointer": "/html/body/div/div[1]/div[3]/div[24]/div[32]",
      "sourceEntityId": "sm-source-1c0e7c579f604bf6",
      "authority": "ACCEPTED_SECONDARY"
    }
  },
  {
    "id": "unit-sm-65c7cc53e3fc4fc8",
    "sourceEntityId": "sm-source-119963264a474fe5",
    "sourceKeywords": [
      "VEHICLE",
      "EXPLOSIVES",
      "FRAME",
      "IMPERIUM",
      "SMOKE",
      "TRANSPORT, DEATHWING"
    ],
    "sourceKeywordFieldSha256": "FEF34991AFA470AD9ED0979847581C0C1C2B4D4EECF0E4658107443FD4D8946C",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[30]/div[6]/div[3]/div[1]",
    "sourceText": "KEYWORDS: VEHICLE; EXPLOSIVES; FRAME; IMPERIUM; SMOKE; TRANSPORT, DEATHWING",
    "tokens": [
      {
        "value": "VEHICLE",
        "pointer": "/html/body/div/div[1]/div[3]/div[30]/div[6]/div[3]/div[1]/span/span[1]",
        "tooltip": "#tooltip_contentVehicle",
        "classes": [
          "tooltipVehicle"
        ],
        "conditional": false
      },
      {
        "value": "EXPLOSIVES",
        "pointer": "/html/body/div/div[1]/div[3]/div[30]/div[6]/div[3]/div[1]/span/span[2]",
        "tooltip": "#tooltip_contentExplosives",
        "classes": [
          "tooltipExplosives"
        ],
        "conditional": false
      },
      {
        "value": "FRAME",
        "pointer": "/html/body/div/div[1]/div[3]/div[30]/div[6]/div[3]/div[1]/span/span[3]",
        "tooltip": "#tooltip_contentFrame",
        "classes": [
          "tooltipFrame"
        ],
        "conditional": false
      },
      {
        "value": "IMPERIUM",
        "pointer": "/html/body/div/div[1]/div[3]/div[30]/div[6]/div[3]/div[1]/span/span[4]",
        "tooltip": "#tooltip_contentImperium",
        "classes": [
          "tooltipImperium"
        ],
        "conditional": false
      },
      {
        "value": "SMOKE",
        "pointer": "/html/body/div/div[1]/div[3]/div[30]/div[6]/div[3]/div[1]/span/span[5]",
        "tooltip": "#tooltip_contentSmoke",
        "classes": [
          "tooltipSmoke"
        ],
        "conditional": false
      },
      {
        "value": "TRANSPORT",
        "pointer": "/html/body/div/div[1]/div[3]/div[30]/div[6]/div[3]/div[1]/span/span[6]",
        "tooltip": "#tooltip_contentTransport",
        "classes": [
          "tooltipTransport"
        ],
        "conditional": false
      },
      {
        "value": "DEATHWING",
        "pointer": "/html/body/div/div[1]/div[3]/div[30]/div[6]/div[3]/div[1]/span/span[8]",
        "tooltip": "#tooltip_contentDeathwing",
        "classes": [
          "tooltipDeathwing",
          "clFl",
          "CHDA",
          "AAAA",
          "AAGA",
          "AAAB",
          "AATB",
          "AADB",
          "AATS",
          "AATC",
          "AATF",
          "AAPS",
          "AAPF",
          "AAGL",
          "AAGS",
          "AAST",
          "AAIR",
          "AAGT",
          "AAIS",
          "AAFG",
          "AAMH",
          "AAVO",
          "AAAI",
          "AAEN",
          "AAWD",
          "AADP",
          "AAIC",
          "AAWR",
          "AABF",
          "AADS",
          "AAMW",
          "AACS",
          "AASK",
          "AAFS",
          "AACF",
          "AASS",
          "AAGW",
          "AABU",
          "AASF",
          "AABS",
          "AAPI",
          "AATA",
          "AASV"
        ],
        "conditional": true
      }
    ],
    "unconditionalKeywords": [
      "VEHICLE",
      "EXPLOSIVES",
      "FRAME",
      "IMPERIUM",
      "SMOKE",
      "TRANSPORT"
    ],
    "conditionalKeywords": [
      "DEATHWING"
    ],
    "provenance": {
      "sourceId": "space-marines-waha-11e-2026-10-20",
      "document": "books/space-marines/v2/sources/raw/wahapedia-datasheets-probe.html",
      "sha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
      "pointer": "/html/body/div/div[1]/div[3]/div[30]/div[6]",
      "sourceEntityId": "sm-source-119963264a474fe5",
      "authority": "ACCEPTED_SECONDARY"
    }
  },
  {
    "id": "unit-sm-67f47cb0752e44ad",
    "sourceEntityId": "sm-source-988e747b1d2a40f9",
    "sourceKeywords": [
      "INFANTRY",
      "EXPLOSIVES",
      "IMPERIUM",
      "TACTICUS, DEATHWING"
    ],
    "sourceKeywordFieldSha256": "9BA45ACAB50730CD0F4FE3C3242289A5611ED7A261E25DDE519513C8082328CD",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[24]/div[6]/div[3]/div[1]",
    "sourceText": "KEYWORDS: INFANTRY; EXPLOSIVES; IMPERIUM; TACTICUS, DEATHWING",
    "tokens": [
      {
        "value": "INFANTRY",
        "pointer": "/html/body/div/div[1]/div[3]/div[24]/div[6]/div[3]/div[1]/span/span[1]",
        "tooltip": "#tooltip_contentInfantry",
        "classes": [
          "tooltipInfantry"
        ],
        "conditional": false
      },
      {
        "value": "EXPLOSIVES",
        "pointer": "/html/body/div/div[1]/div[3]/div[24]/div[6]/div[3]/div[1]/span/span[2]",
        "tooltip": "#tooltip_contentExplosives",
        "classes": [
          "tooltipExplosives"
        ],
        "conditional": false
      },
      {
        "value": "IMPERIUM",
        "pointer": "/html/body/div/div[1]/div[3]/div[24]/div[6]/div[3]/div[1]/span/span[3]",
        "tooltip": "#tooltip_contentImperium",
        "classes": [
          "tooltipImperium"
        ],
        "conditional": false
      },
      {
        "value": "TACTICUS",
        "pointer": "/html/body/div/div[1]/div[3]/div[24]/div[6]/div[3]/div[1]/span/span[4]",
        "tooltip": "#tooltip_contentTacticus",
        "classes": [
          "tooltipTacticus"
        ],
        "conditional": false
      },
      {
        "value": "DEATHWING",
        "pointer": "/html/body/div/div[1]/div[3]/div[24]/div[6]/div[3]/div[1]/span/span[6]",
        "tooltip": "#tooltip_contentDeathwing",
        "classes": [
          "tooltipDeathwing",
          "clFl",
          "CHDA",
          "AAAA",
          "AAGA",
          "AAAB",
          "AATB",
          "AADB",
          "AATS",
          "AATC",
          "AATF",
          "AAPS",
          "AAPF",
          "AAGL",
          "AAGS",
          "AAST",
          "AAIR",
          "AAGT",
          "AAIS",
          "AAFG",
          "AAMH",
          "AAVO",
          "AAAI",
          "AAEN",
          "AAWD",
          "AADP",
          "AAIC",
          "AAWR",
          "AABF",
          "AADS",
          "AAMW",
          "AACS",
          "AASK",
          "AAFS",
          "AACF",
          "AASS",
          "AAGW",
          "AABU",
          "AASF",
          "AABS",
          "AAPI",
          "AATA",
          "AASV"
        ],
        "conditional": true
      }
    ],
    "unconditionalKeywords": [
      "INFANTRY",
      "EXPLOSIVES",
      "IMPERIUM",
      "TACTICUS"
    ],
    "conditionalKeywords": [
      "DEATHWING"
    ],
    "provenance": {
      "sourceId": "space-marines-waha-11e-2026-10-20",
      "document": "books/space-marines/v2/sources/raw/wahapedia-datasheets-probe.html",
      "sha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
      "pointer": "/html/body/div/div[1]/div[3]/div[24]/div[6]",
      "sourceEntityId": "sm-source-988e747b1d2a40f9",
      "authority": "ACCEPTED_SECONDARY"
    }
  },
  {
    "id": "unit-sm-74c53544aa694147",
    "sourceEntityId": "sm-source-9b8d7b42e0cd4fc6",
    "sourceKeywords": [
      "INFANTRY",
      "EXPLOSIVES",
      "FLY",
      "IMPERIUM",
      "JUMP PACK",
      "TACTICUS, DEATHWING"
    ],
    "sourceKeywordFieldSha256": "8F2E84711F9AA0C0545E9EB016523D214EF44C390FF3C40C08ACB378B1913CEA",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[24]/div[36]/div[3]/div[1]",
    "sourceText": "KEYWORDS: INFANTRY; EXPLOSIVES; FLY; IMPERIUM; JUMP PACK; TACTICUS, DEATHWING",
    "tokens": [
      {
        "value": "INFANTRY",
        "pointer": "/html/body/div/div[1]/div[3]/div[24]/div[36]/div[3]/div[1]/span/span[1]",
        "tooltip": "#tooltip_contentInfantry",
        "classes": [
          "tooltipInfantry"
        ],
        "conditional": false
      },
      {
        "value": "EXPLOSIVES",
        "pointer": "/html/body/div/div[1]/div[3]/div[24]/div[36]/div[3]/div[1]/span/span[2]",
        "tooltip": "#tooltip_contentExplosives",
        "classes": [
          "tooltipExplosives"
        ],
        "conditional": false
      },
      {
        "value": "FLY",
        "pointer": "/html/body/div/div[1]/div[3]/div[24]/div[36]/div[3]/div[1]/span/span[3]",
        "tooltip": "#tooltip_contentFly",
        "classes": [
          "tooltipFly"
        ],
        "conditional": false
      },
      {
        "value": "IMPERIUM",
        "pointer": "/html/body/div/div[1]/div[3]/div[24]/div[36]/div[3]/div[1]/span/span[4]",
        "tooltip": "#tooltip_contentImperium",
        "classes": [
          "tooltipImperium"
        ],
        "conditional": false
      },
      {
        "value": "JUMP PACK",
        "pointer": "/html/body/div/div[1]/div[3]/div[24]/div[36]/div[3]/div[1]/span/span[5]",
        "tooltip": "#tooltip_contentJumpPack",
        "classes": [
          "tooltipJumpPack"
        ],
        "conditional": false
      },
      {
        "value": "TACTICUS",
        "pointer": "/html/body/div/div[1]/div[3]/div[24]/div[36]/div[3]/div[1]/span/span[6]",
        "tooltip": "#tooltip_contentTacticus",
        "classes": [
          "tooltipTacticus"
        ],
        "conditional": false
      },
      {
        "value": "DEATHWING",
        "pointer": "/html/body/div/div[1]/div[3]/div[24]/div[36]/div[3]/div[1]/span/span[8]",
        "tooltip": "#tooltip_contentDeathwing",
        "classes": [
          "tooltipDeathwing",
          "clFl",
          "CHDA",
          "AAAA",
          "AAGA",
          "AAAB",
          "AATB",
          "AADB",
          "AATS",
          "AATC",
          "AATF",
          "AAPS",
          "AAPF",
          "AAGL",
          "AAGS",
          "AAST",
          "AAIR",
          "AAGT",
          "AAIS",
          "AAFG",
          "AAMH",
          "AAVO",
          "AAAI",
          "AAEN",
          "AAWD",
          "AADP",
          "AAIC",
          "AAWR",
          "AABF",
          "AADS",
          "AAMW",
          "AACS",
          "AASK",
          "AAFS",
          "AACF",
          "AASS",
          "AAGW",
          "AABU",
          "AASF",
          "AABS",
          "AAPI",
          "AATA",
          "AASV"
        ],
        "conditional": true
      }
    ],
    "unconditionalKeywords": [
      "INFANTRY",
      "EXPLOSIVES",
      "FLY",
      "IMPERIUM",
      "JUMP PACK",
      "TACTICUS"
    ],
    "conditionalKeywords": [
      "DEATHWING"
    ],
    "provenance": {
      "sourceId": "space-marines-waha-11e-2026-10-20",
      "document": "books/space-marines/v2/sources/raw/wahapedia-datasheets-probe.html",
      "sha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
      "pointer": "/html/body/div/div[1]/div[3]/div[24]/div[36]",
      "sourceEntityId": "sm-source-9b8d7b42e0cd4fc6",
      "authority": "ACCEPTED_SECONDARY"
    }
  },
  {
    "id": "unit-sm-80ac1421ce0f4de3",
    "sourceEntityId": "sm-source-10e85d355cc24643",
    "sourceKeywords": [
      "VEHICLE",
      "FLY",
      "FRAME",
      "IMPERIUM",
      "SPEEDER, RAVENWING"
    ],
    "sourceKeywordFieldSha256": "8787D5233A34F6A7A7F76DF3FAE978E76618B456691D815B2C0D9C56DE3229C2",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[32]/div[8]/div[3]/div[1]",
    "sourceText": "KEYWORDS: VEHICLE; FLY; FRAME; IMPERIUM; SPEEDER, RAVENWING",
    "tokens": [
      {
        "value": "VEHICLE",
        "pointer": "/html/body/div/div[1]/div[3]/div[32]/div[8]/div[3]/div[1]/span/span[1]",
        "tooltip": "#tooltip_contentVehicle",
        "classes": [
          "tooltipVehicle"
        ],
        "conditional": false
      },
      {
        "value": "FLY",
        "pointer": "/html/body/div/div[1]/div[3]/div[32]/div[8]/div[3]/div[1]/span/span[2]",
        "tooltip": "#tooltip_contentFly",
        "classes": [
          "tooltipFly"
        ],
        "conditional": false
      },
      {
        "value": "FRAME",
        "pointer": "/html/body/div/div[1]/div[3]/div[32]/div[8]/div[3]/div[1]/span/span[3]",
        "tooltip": "#tooltip_contentFrame",
        "classes": [
          "tooltipFrame"
        ],
        "conditional": false
      },
      {
        "value": "IMPERIUM",
        "pointer": "/html/body/div/div[1]/div[3]/div[32]/div[8]/div[3]/div[1]/span/span[4]",
        "tooltip": "#tooltip_contentImperium",
        "classes": [
          "tooltipImperium"
        ],
        "conditional": false
      },
      {
        "value": "SPEEDER",
        "pointer": "/html/body/div/div[1]/div[3]/div[32]/div[8]/div[3]/div[1]/span/span[5]",
        "tooltip": "#tooltip_contentSpeeder",
        "classes": [
          "tooltipSpeeder"
        ],
        "conditional": false
      },
      {
        "value": "RAVENWING",
        "pointer": "/html/body/div/div[1]/div[3]/div[32]/div[8]/div[3]/div[1]/span/span[7]",
        "tooltip": "#tooltip_contentRavenwing",
        "classes": [
          "tooltipRavenwing",
          "clFl",
          "CHDA",
          "AAAA",
          "AAGA",
          "AAAB",
          "AATB",
          "AADB",
          "AATS",
          "AATC",
          "AATF",
          "AAPS",
          "AAPF",
          "AAGL",
          "AAGS",
          "AAST",
          "AAIR",
          "AAGT",
          "AAIS",
          "AAFG",
          "AAMH",
          "AAVO",
          "AAAI",
          "AAEN",
          "AAWD",
          "AADP",
          "AAIC",
          "AAWR",
          "AABF",
          "AADS",
          "AAMW",
          "AACS",
          "AASK",
          "AAFS",
          "AACF",
          "AASS",
          "AAGW",
          "AABU",
          "AASF",
          "AABS",
          "AAPI",
          "AATA",
          "AASV"
        ],
        "conditional": true
      }
    ],
    "unconditionalKeywords": [
      "VEHICLE",
      "FLY",
      "FRAME",
      "IMPERIUM",
      "SPEEDER"
    ],
    "conditionalKeywords": [
      "RAVENWING"
    ],
    "provenance": {
      "sourceId": "space-marines-waha-11e-2026-10-20",
      "document": "books/space-marines/v2/sources/raw/wahapedia-datasheets-probe.html",
      "sha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
      "pointer": "/html/body/div/div[1]/div[3]/div[32]/div[8]",
      "sourceEntityId": "sm-source-10e85d355cc24643",
      "authority": "ACCEPTED_SECONDARY"
    }
  },
  {
    "id": "unit-sm-9e163be8d4bb42c1",
    "sourceEntityId": "sm-source-a726ac87cf214e0c",
    "sourceKeywords": [
      "INFANTRY",
      "IMPERIUM",
      "TERMINATOR, DEATHWING"
    ],
    "sourceKeywordFieldSha256": "317A32E661F10ED135A40A7FE76EB92C5BCAC32D2FE082DAB3B91879DF85CC11",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[24]/div[34]/div[3]/div[1]",
    "sourceText": "KEYWORDS: INFANTRY; IMPERIUM; TERMINATOR, DEATHWING",
    "tokens": [
      {
        "value": "INFANTRY",
        "pointer": "/html/body/div/div[1]/div[3]/div[24]/div[34]/div[3]/div[1]/span/span[1]",
        "tooltip": "#tooltip_contentInfantry",
        "classes": [
          "tooltipInfantry"
        ],
        "conditional": false
      },
      {
        "value": "IMPERIUM",
        "pointer": "/html/body/div/div[1]/div[3]/div[24]/div[34]/div[3]/div[1]/span/span[2]",
        "tooltip": "#tooltip_contentImperium",
        "classes": [
          "tooltipImperium"
        ],
        "conditional": false
      },
      {
        "value": "TERMINATOR",
        "pointer": "/html/body/div/div[1]/div[3]/div[24]/div[34]/div[3]/div[1]/span/span[3]",
        "tooltip": "#tooltip_contentTerminator",
        "classes": [
          "tooltipTerminator"
        ],
        "conditional": false
      },
      {
        "value": "DEATHWING",
        "pointer": "/html/body/div/div[1]/div[3]/div[24]/div[34]/div[3]/div[1]/span/span[5]",
        "tooltip": "#tooltip_contentDeathwing",
        "classes": [
          "tooltipDeathwing",
          "clFl",
          "CHDA",
          "AAAA",
          "AAGA",
          "AAAB",
          "AATB",
          "AADB",
          "AATS",
          "AATC",
          "AATF",
          "AAPS",
          "AAPF",
          "AAGL",
          "AAGS",
          "AAST",
          "AAIR",
          "AAGT",
          "AAIS",
          "AAFG",
          "AAMH",
          "AAVO",
          "AAAI",
          "AAEN",
          "AAWD",
          "AADP",
          "AAIC",
          "AAWR",
          "AABF",
          "AADS",
          "AAMW",
          "AACS",
          "AASK",
          "AAFS",
          "AACF",
          "AASS",
          "AAGW",
          "AABU",
          "AASF",
          "AABS",
          "AAPI",
          "AATA",
          "AASV"
        ],
        "conditional": true
      }
    ],
    "unconditionalKeywords": [
      "INFANTRY",
      "IMPERIUM",
      "TERMINATOR"
    ],
    "conditionalKeywords": [
      "DEATHWING"
    ],
    "provenance": {
      "sourceId": "space-marines-waha-11e-2026-10-20",
      "document": "books/space-marines/v2/sources/raw/wahapedia-datasheets-probe.html",
      "sha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
      "pointer": "/html/body/div/div[1]/div[3]/div[24]/div[34]",
      "sourceEntityId": "sm-source-a726ac87cf214e0c",
      "authority": "ACCEPTED_SECONDARY"
    }
  },
  {
    "id": "unit-sm-9f9e7c18b7354927",
    "sourceEntityId": "sm-source-a47a10afba2d4971",
    "sourceKeywords": [
      "MOUNTED",
      "CAPTAIN",
      "CHARACTER",
      "EXPLOSIVES",
      "IMPERIUM, RAVENWING"
    ],
    "sourceKeywordFieldSha256": "8E27FF5C58BC7FD1940F588C82DE63117C0F241E5965C784C1C93FC213FB4482",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[12]/div[2]/div[3]/div[1]",
    "sourceText": "KEYWORDS: MOUNTED; CAPTAIN; CHARACTER; EXPLOSIVES; IMPERIUM, RAVENWING",
    "tokens": [
      {
        "value": "MOUNTED",
        "pointer": "/html/body/div/div[1]/div[3]/div[12]/div[2]/div[3]/div[1]/span/span[1]",
        "tooltip": "#tooltip_contentMounted",
        "classes": [
          "tooltipMounted"
        ],
        "conditional": false
      },
      {
        "value": "CAPTAIN",
        "pointer": "/html/body/div/div[1]/div[3]/div[12]/div[2]/div[3]/div[1]/span/span[2]",
        "tooltip": "#tooltip_contentCaptain",
        "classes": [
          "tooltipCaptain"
        ],
        "conditional": false
      },
      {
        "value": "CHARACTER",
        "pointer": "/html/body/div/div[1]/div[3]/div[12]/div[2]/div[3]/div[1]/span/span[3]",
        "tooltip": "#tooltip_contentCharacter",
        "classes": [
          "tooltipCharacter"
        ],
        "conditional": false
      },
      {
        "value": "EXPLOSIVES",
        "pointer": "/html/body/div/div[1]/div[3]/div[12]/div[2]/div[3]/div[1]/span/span[4]",
        "tooltip": "#tooltip_contentExplosives",
        "classes": [
          "tooltipExplosives"
        ],
        "conditional": false
      },
      {
        "value": "IMPERIUM",
        "pointer": "/html/body/div/div[1]/div[3]/div[12]/div[2]/div[3]/div[1]/span/span[5]",
        "tooltip": "#tooltip_contentImperium",
        "classes": [
          "tooltipImperium"
        ],
        "conditional": false
      },
      {
        "value": "RAVENWING",
        "pointer": "/html/body/div/div[1]/div[3]/div[12]/div[2]/div[3]/div[1]/span/span[7]",
        "tooltip": "#tooltip_contentRavenwing",
        "classes": [
          "tooltipRavenwing",
          "clFl",
          "CHDA",
          "AAAA",
          "AAGA",
          "AAAB",
          "AATB",
          "AADB",
          "AATS",
          "AATC",
          "AATF",
          "AAPS",
          "AAPF",
          "AAGL",
          "AAGS",
          "AAST",
          "AAIR",
          "AAGT",
          "AAIS",
          "AAFG",
          "AAMH",
          "AAVO",
          "AAAI",
          "AAEN",
          "AAWD",
          "AADP",
          "AAIC",
          "AAWR",
          "AABF",
          "AADS",
          "AAMW",
          "AACS",
          "AASK",
          "AAFS",
          "AACF",
          "AASS",
          "AAGW",
          "AABU",
          "AASF",
          "AABS",
          "AAPI",
          "AATA",
          "AASV"
        ],
        "conditional": true
      }
    ],
    "unconditionalKeywords": [
      "MOUNTED",
      "CAPTAIN",
      "CHARACTER",
      "EXPLOSIVES",
      "IMPERIUM"
    ],
    "conditionalKeywords": [
      "RAVENWING"
    ],
    "provenance": {
      "sourceId": "space-marines-waha-11e-2026-10-20",
      "document": "books/space-marines/v2/sources/raw/wahapedia-datasheets-probe.html",
      "sha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
      "pointer": "/html/body/div/div[1]/div[3]/div[12]/div[2]",
      "sourceEntityId": "sm-source-a47a10afba2d4971",
      "authority": "ACCEPTED_SECONDARY"
    }
  },
  {
    "id": "unit-sm-b994e641eaea4060",
    "sourceEntityId": "sm-source-1a202001e83b4046",
    "sourceKeywords": [
      "INFANTRY",
      "CHAPLAIN",
      "CHARACTER",
      "IMPERIUM",
      "TERMINATOR, DEATHWING"
    ],
    "sourceKeywordFieldSha256": "A5B2BA33BC6300DCC7EC0C6CB07DECFD3EFDDCD15FA5DB2B4426B148B32F5A6B",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[10]/div[24]/div[3]/div[1]",
    "sourceText": "KEYWORDS: INFANTRY; CHAPLAIN; CHARACTER; IMPERIUM; TERMINATOR, DEATHWING",
    "tokens": [
      {
        "value": "INFANTRY",
        "pointer": "/html/body/div/div[1]/div[3]/div[10]/div[24]/div[3]/div[1]/span/span[1]",
        "tooltip": "#tooltip_contentInfantry",
        "classes": [
          "tooltipInfantry"
        ],
        "conditional": false
      },
      {
        "value": "CHAPLAIN",
        "pointer": "/html/body/div/div[1]/div[3]/div[10]/div[24]/div[3]/div[1]/span/span[2]",
        "tooltip": "#tooltip_contentChaplain",
        "classes": [
          "tooltipChaplain"
        ],
        "conditional": false
      },
      {
        "value": "CHARACTER",
        "pointer": "/html/body/div/div[1]/div[3]/div[10]/div[24]/div[3]/div[1]/span/span[3]",
        "tooltip": "#tooltip_contentCharacter",
        "classes": [
          "tooltipCharacter"
        ],
        "conditional": false
      },
      {
        "value": "IMPERIUM",
        "pointer": "/html/body/div/div[1]/div[3]/div[10]/div[24]/div[3]/div[1]/span/span[4]",
        "tooltip": "#tooltip_contentImperium",
        "classes": [
          "tooltipImperium"
        ],
        "conditional": false
      },
      {
        "value": "TERMINATOR",
        "pointer": "/html/body/div/div[1]/div[3]/div[10]/div[24]/div[3]/div[1]/span/span[5]",
        "tooltip": "#tooltip_contentTerminator",
        "classes": [
          "tooltipTerminator"
        ],
        "conditional": false
      },
      {
        "value": "DEATHWING",
        "pointer": "/html/body/div/div[1]/div[3]/div[10]/div[24]/div[3]/div[1]/span/span[7]",
        "tooltip": "#tooltip_contentDeathwing",
        "classes": [
          "tooltipDeathwing",
          "clFl",
          "CHDA",
          "AAAA",
          "AAGA",
          "AAAB",
          "AATB",
          "AADB",
          "AATS",
          "AATC",
          "AATF",
          "AAPS",
          "AAPF",
          "AAGL",
          "AAGS",
          "AAST",
          "AAIR",
          "AAGT",
          "AAIS",
          "AAFG",
          "AAMH",
          "AAVO",
          "AAAI",
          "AAEN",
          "AAWD",
          "AADP",
          "AAIC",
          "AAWR",
          "AABF",
          "AADS",
          "AAMW",
          "AACS",
          "AASK",
          "AAFS",
          "AACF",
          "AASS",
          "AAGW",
          "AABU",
          "AASF",
          "AABS",
          "AAPI",
          "AATA",
          "AASV"
        ],
        "conditional": true
      }
    ],
    "unconditionalKeywords": [
      "INFANTRY",
      "CHAPLAIN",
      "CHARACTER",
      "IMPERIUM",
      "TERMINATOR"
    ],
    "conditionalKeywords": [
      "DEATHWING"
    ],
    "provenance": {
      "sourceId": "space-marines-waha-11e-2026-10-20",
      "document": "books/space-marines/v2/sources/raw/wahapedia-datasheets-probe.html",
      "sha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
      "pointer": "/html/body/div/div[1]/div[3]/div[10]/div[24]",
      "sourceEntityId": "sm-source-1a202001e83b4046",
      "authority": "ACCEPTED_SECONDARY"
    }
  },
  {
    "id": "unit-sm-bc409233f3fe4dc1",
    "sourceEntityId": "sm-source-e6c42bd37894420d",
    "sourceKeywords": [
      "VEHICLE",
      "FRAME",
      "IMPERIUM",
      "SMOKE",
      "TRANSPORT, DEATHWING"
    ],
    "sourceKeywordFieldSha256": "43985B3EE681F54CE338F7ECA1CBA1CD5B929C072290A99DC849E9049227D08F",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[30]/div[2]/div[3]/div[1]",
    "sourceText": "KEYWORDS: VEHICLE; FRAME; IMPERIUM; SMOKE; TRANSPORT, DEATHWING",
    "tokens": [
      {
        "value": "VEHICLE",
        "pointer": "/html/body/div/div[1]/div[3]/div[30]/div[2]/div[3]/div[1]/span/span[1]",
        "tooltip": "#tooltip_contentVehicle",
        "classes": [
          "tooltipVehicle"
        ],
        "conditional": false
      },
      {
        "value": "FRAME",
        "pointer": "/html/body/div/div[1]/div[3]/div[30]/div[2]/div[3]/div[1]/span/span[2]",
        "tooltip": "#tooltip_contentFrame",
        "classes": [
          "tooltipFrame"
        ],
        "conditional": false
      },
      {
        "value": "IMPERIUM",
        "pointer": "/html/body/div/div[1]/div[3]/div[30]/div[2]/div[3]/div[1]/span/span[3]",
        "tooltip": "#tooltip_contentImperium",
        "classes": [
          "tooltipImperium"
        ],
        "conditional": false
      },
      {
        "value": "SMOKE",
        "pointer": "/html/body/div/div[1]/div[3]/div[30]/div[2]/div[3]/div[1]/span/span[4]",
        "tooltip": "#tooltip_contentSmoke",
        "classes": [
          "tooltipSmoke"
        ],
        "conditional": false
      },
      {
        "value": "TRANSPORT",
        "pointer": "/html/body/div/div[1]/div[3]/div[30]/div[2]/div[3]/div[1]/span/span[5]",
        "tooltip": "#tooltip_contentTransport",
        "classes": [
          "tooltipTransport"
        ],
        "conditional": false
      },
      {
        "value": "DEATHWING",
        "pointer": "/html/body/div/div[1]/div[3]/div[30]/div[2]/div[3]/div[1]/span/span[7]",
        "tooltip": "#tooltip_contentDeathwing",
        "classes": [
          "tooltipDeathwing",
          "clFl",
          "CHDA",
          "AAAA",
          "AAGA",
          "AAAB",
          "AATB",
          "AADB",
          "AATS",
          "AATC",
          "AATF",
          "AAPS",
          "AAPF",
          "AAGL",
          "AAGS",
          "AAST",
          "AAIR",
          "AAGT",
          "AAIS",
          "AAFG",
          "AAMH",
          "AAVO",
          "AAAI",
          "AAEN",
          "AAWD",
          "AADP",
          "AAIC",
          "AAWR",
          "AABF",
          "AADS",
          "AAMW",
          "AACS",
          "AASK",
          "AAFS",
          "AACF",
          "AASS",
          "AAGW",
          "AABU",
          "AASF",
          "AABS",
          "AAPI",
          "AATA",
          "AASV"
        ],
        "conditional": true
      }
    ],
    "unconditionalKeywords": [
      "VEHICLE",
      "FRAME",
      "IMPERIUM",
      "SMOKE",
      "TRANSPORT"
    ],
    "conditionalKeywords": [
      "DEATHWING"
    ],
    "provenance": {
      "sourceId": "space-marines-waha-11e-2026-10-20",
      "document": "books/space-marines/v2/sources/raw/wahapedia-datasheets-probe.html",
      "sha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
      "pointer": "/html/body/div/div[1]/div[3]/div[30]/div[2]",
      "sourceEntityId": "sm-source-e6c42bd37894420d",
      "authority": "ACCEPTED_SECONDARY"
    }
  },
  {
    "id": "unit-sm-d0a8c043f5c24b22",
    "sourceEntityId": "sm-source-86840026ad0e4739",
    "sourceKeywords": [
      "VEHICLE",
      "FRAME",
      "IMPERIUM",
      "SMOKE",
      "TRANSPORT, DEATHWING"
    ],
    "sourceKeywordFieldSha256": "43985B3EE681F54CE338F7ECA1CBA1CD5B929C072290A99DC849E9049227D08F",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[30]/div[10]/div[3]/div[1]",
    "sourceText": "KEYWORDS: VEHICLE; FRAME; IMPERIUM; SMOKE; TRANSPORT, DEATHWING",
    "tokens": [
      {
        "value": "VEHICLE",
        "pointer": "/html/body/div/div[1]/div[3]/div[30]/div[10]/div[3]/div[1]/span/span[1]",
        "tooltip": "#tooltip_contentVehicle",
        "classes": [
          "tooltipVehicle"
        ],
        "conditional": false
      },
      {
        "value": "FRAME",
        "pointer": "/html/body/div/div[1]/div[3]/div[30]/div[10]/div[3]/div[1]/span/span[2]",
        "tooltip": "#tooltip_contentFrame",
        "classes": [
          "tooltipFrame"
        ],
        "conditional": false
      },
      {
        "value": "IMPERIUM",
        "pointer": "/html/body/div/div[1]/div[3]/div[30]/div[10]/div[3]/div[1]/span/span[3]",
        "tooltip": "#tooltip_contentImperium",
        "classes": [
          "tooltipImperium"
        ],
        "conditional": false
      },
      {
        "value": "SMOKE",
        "pointer": "/html/body/div/div[1]/div[3]/div[30]/div[10]/div[3]/div[1]/span/span[4]",
        "tooltip": "#tooltip_contentSmoke",
        "classes": [
          "tooltipSmoke"
        ],
        "conditional": false
      },
      {
        "value": "TRANSPORT",
        "pointer": "/html/body/div/div[1]/div[3]/div[30]/div[10]/div[3]/div[1]/span/span[5]",
        "tooltip": "#tooltip_contentTransport",
        "classes": [
          "tooltipTransport"
        ],
        "conditional": false
      },
      {
        "value": "DEATHWING",
        "pointer": "/html/body/div/div[1]/div[3]/div[30]/div[10]/div[3]/div[1]/span/span[7]",
        "tooltip": "#tooltip_contentDeathwing",
        "classes": [
          "tooltipDeathwing",
          "clFl",
          "CHDA",
          "AAAA",
          "AAGA",
          "AAAB",
          "AATB",
          "AADB",
          "AATS",
          "AATC",
          "AATF",
          "AAPS",
          "AAPF",
          "AAGL",
          "AAGS",
          "AAST",
          "AAIR",
          "AAGT",
          "AAIS",
          "AAFG",
          "AAMH",
          "AAVO",
          "AAAI",
          "AAEN",
          "AAWD",
          "AADP",
          "AAIC",
          "AAWR",
          "AABF",
          "AADS",
          "AAMW",
          "AACS",
          "AASK",
          "AAFS",
          "AACF",
          "AASS",
          "AAGW",
          "AABU",
          "AASF",
          "AABS",
          "AAPI",
          "AATA",
          "AASV"
        ],
        "conditional": true
      }
    ],
    "unconditionalKeywords": [
      "VEHICLE",
      "FRAME",
      "IMPERIUM",
      "SMOKE",
      "TRANSPORT"
    ],
    "conditionalKeywords": [
      "DEATHWING"
    ],
    "provenance": {
      "sourceId": "space-marines-waha-11e-2026-10-20",
      "document": "books/space-marines/v2/sources/raw/wahapedia-datasheets-probe.html",
      "sha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
      "pointer": "/html/body/div/div[1]/div[3]/div[30]/div[10]",
      "sourceEntityId": "sm-source-86840026ad0e4739",
      "authority": "ACCEPTED_SECONDARY"
    }
  },
  {
    "id": "unit-sm-d101fa171b7a40c4",
    "sourceEntityId": "sm-source-7a39dd5b9e3c45ff",
    "sourceKeywords": [
      "INFANTRY",
      "CAPTAIN",
      "CHARACTER",
      "IMPERIUM",
      "TERMINATOR, DEATHWING"
    ],
    "sourceKeywordFieldSha256": "BD786E4929F83C6EC00D339D5038A7A3383420040C85157B66A35A7FC9CC3871",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[10]/div[18]/div[3]/div[1]",
    "sourceText": "KEYWORDS: INFANTRY; CAPTAIN; CHARACTER; IMPERIUM; TERMINATOR, DEATHWING",
    "tokens": [
      {
        "value": "INFANTRY",
        "pointer": "/html/body/div/div[1]/div[3]/div[10]/div[18]/div[3]/div[1]/span/span[1]",
        "tooltip": "#tooltip_contentInfantry",
        "classes": [
          "tooltipInfantry"
        ],
        "conditional": false
      },
      {
        "value": "CAPTAIN",
        "pointer": "/html/body/div/div[1]/div[3]/div[10]/div[18]/div[3]/div[1]/span/span[2]",
        "tooltip": "#tooltip_contentCaptain",
        "classes": [
          "tooltipCaptain"
        ],
        "conditional": false
      },
      {
        "value": "CHARACTER",
        "pointer": "/html/body/div/div[1]/div[3]/div[10]/div[18]/div[3]/div[1]/span/span[3]",
        "tooltip": "#tooltip_contentCharacter",
        "classes": [
          "tooltipCharacter"
        ],
        "conditional": false
      },
      {
        "value": "IMPERIUM",
        "pointer": "/html/body/div/div[1]/div[3]/div[10]/div[18]/div[3]/div[1]/span/span[4]",
        "tooltip": "#tooltip_contentImperium",
        "classes": [
          "tooltipImperium"
        ],
        "conditional": false
      },
      {
        "value": "TERMINATOR",
        "pointer": "/html/body/div/div[1]/div[3]/div[10]/div[18]/div[3]/div[1]/span/span[5]",
        "tooltip": "#tooltip_contentTerminator",
        "classes": [
          "tooltipTerminator"
        ],
        "conditional": false
      },
      {
        "value": "DEATHWING",
        "pointer": "/html/body/div/div[1]/div[3]/div[10]/div[18]/div[3]/div[1]/span/span[7]",
        "tooltip": "#tooltip_contentDeathwing",
        "classes": [
          "tooltipDeathwing",
          "clFl",
          "CHDA",
          "AAAA",
          "AAGA",
          "AAAB",
          "AATB",
          "AADB",
          "AATS",
          "AATC",
          "AATF",
          "AAPS",
          "AAPF",
          "AAGL",
          "AAGS",
          "AAST",
          "AAIR",
          "AAGT",
          "AAIS",
          "AAFG",
          "AAMH",
          "AAVO",
          "AAAI",
          "AAEN",
          "AAWD",
          "AADP",
          "AAIC",
          "AAWR",
          "AABF",
          "AADS",
          "AAMW",
          "AACS",
          "AASK",
          "AAFS",
          "AACF",
          "AASS",
          "AAGW",
          "AABU",
          "AASF",
          "AABS",
          "AAPI",
          "AATA",
          "AASV"
        ],
        "conditional": true
      }
    ],
    "unconditionalKeywords": [
      "INFANTRY",
      "CAPTAIN",
      "CHARACTER",
      "IMPERIUM",
      "TERMINATOR"
    ],
    "conditionalKeywords": [
      "DEATHWING"
    ],
    "provenance": {
      "sourceId": "space-marines-waha-11e-2026-10-20",
      "document": "books/space-marines/v2/sources/raw/wahapedia-datasheets-probe.html",
      "sha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
      "pointer": "/html/body/div/div[1]/div[3]/div[10]/div[18]",
      "sourceEntityId": "sm-source-7a39dd5b9e3c45ff",
      "authority": "ACCEPTED_SECONDARY"
    }
  },
  {
    "id": "unit-sm-d44763a8089742c3",
    "sourceEntityId": "sm-source-84ecf94911fc47f9",
    "sourceKeywords": [
      "VEHICLE",
      "FLY",
      "FRAME",
      "IMPERIUM",
      "SPEEDER, RAVENWING"
    ],
    "sourceKeywordFieldSha256": "8787D5233A34F6A7A7F76DF3FAE978E76618B456691D815B2C0D9C56DE3229C2",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[32]/div[12]/div[3]/div[1]",
    "sourceText": "KEYWORDS: VEHICLE; FLY; FRAME; IMPERIUM; SPEEDER, RAVENWING",
    "tokens": [
      {
        "value": "VEHICLE",
        "pointer": "/html/body/div/div[1]/div[3]/div[32]/div[12]/div[3]/div[1]/span/span[1]",
        "tooltip": "#tooltip_contentVehicle",
        "classes": [
          "tooltipVehicle"
        ],
        "conditional": false
      },
      {
        "value": "FLY",
        "pointer": "/html/body/div/div[1]/div[3]/div[32]/div[12]/div[3]/div[1]/span/span[2]",
        "tooltip": "#tooltip_contentFly",
        "classes": [
          "tooltipFly"
        ],
        "conditional": false
      },
      {
        "value": "FRAME",
        "pointer": "/html/body/div/div[1]/div[3]/div[32]/div[12]/div[3]/div[1]/span/span[3]",
        "tooltip": "#tooltip_contentFrame",
        "classes": [
          "tooltipFrame"
        ],
        "conditional": false
      },
      {
        "value": "IMPERIUM",
        "pointer": "/html/body/div/div[1]/div[3]/div[32]/div[12]/div[3]/div[1]/span/span[4]",
        "tooltip": "#tooltip_contentImperium",
        "classes": [
          "tooltipImperium"
        ],
        "conditional": false
      },
      {
        "value": "SPEEDER",
        "pointer": "/html/body/div/div[1]/div[3]/div[32]/div[12]/div[3]/div[1]/span/span[5]",
        "tooltip": "#tooltip_contentSpeeder",
        "classes": [
          "tooltipSpeeder"
        ],
        "conditional": false
      },
      {
        "value": "RAVENWING",
        "pointer": "/html/body/div/div[1]/div[3]/div[32]/div[12]/div[3]/div[1]/span/span[7]",
        "tooltip": "#tooltip_contentRavenwing",
        "classes": [
          "tooltipRavenwing",
          "clFl",
          "CHDA",
          "AAAA",
          "AAGA",
          "AAAB",
          "AATB",
          "AADB",
          "AATS",
          "AATC",
          "AATF",
          "AAPS",
          "AAPF",
          "AAGL",
          "AAGS",
          "AAST",
          "AAIR",
          "AAGT",
          "AAIS",
          "AAFG",
          "AAMH",
          "AAVO",
          "AAAI",
          "AAEN",
          "AAWD",
          "AADP",
          "AAIC",
          "AAWR",
          "AABF",
          "AADS",
          "AAMW",
          "AACS",
          "AASK",
          "AAFS",
          "AACF",
          "AASS",
          "AAGW",
          "AABU",
          "AASF",
          "AABS",
          "AAPI",
          "AATA",
          "AASV"
        ],
        "conditional": true
      }
    ],
    "unconditionalKeywords": [
      "VEHICLE",
      "FLY",
      "FRAME",
      "IMPERIUM",
      "SPEEDER"
    ],
    "conditionalKeywords": [
      "RAVENWING"
    ],
    "provenance": {
      "sourceId": "space-marines-waha-11e-2026-10-20",
      "document": "books/space-marines/v2/sources/raw/wahapedia-datasheets-probe.html",
      "sha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
      "pointer": "/html/body/div/div[1]/div[3]/div[32]/div[12]",
      "sourceEntityId": "sm-source-84ecf94911fc47f9",
      "authority": "ACCEPTED_SECONDARY"
    }
  },
  {
    "id": "unit-sm-db3ce647d7024b24",
    "sourceEntityId": "sm-source-b89ca74df82b446d",
    "sourceKeywords": [
      "INFANTRY",
      "ANCIENT",
      "CHARACTER",
      "IMPERIUM",
      "TERMINATOR, DEATHWING"
    ],
    "sourceKeywordFieldSha256": "7884A0CEF80E19889BDD0999E7852C6A355A1AFF7391B7F7C6058538A62CD7FA",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[10]/div[4]/div[3]/div[1]",
    "sourceText": "KEYWORDS: INFANTRY; ANCIENT; CHARACTER; IMPERIUM; TERMINATOR, DEATHWING",
    "tokens": [
      {
        "value": "INFANTRY",
        "pointer": "/html/body/div/div[1]/div[3]/div[10]/div[4]/div[3]/div[1]/span/span[1]",
        "tooltip": "#tooltip_contentInfantry",
        "classes": [
          "tooltipInfantry"
        ],
        "conditional": false
      },
      {
        "value": "ANCIENT",
        "pointer": "/html/body/div/div[1]/div[3]/div[10]/div[4]/div[3]/div[1]/span/span[2]",
        "tooltip": "#tooltip_contentAncient",
        "classes": [
          "tooltipAncient"
        ],
        "conditional": false
      },
      {
        "value": "CHARACTER",
        "pointer": "/html/body/div/div[1]/div[3]/div[10]/div[4]/div[3]/div[1]/span/span[3]",
        "tooltip": "#tooltip_contentCharacter",
        "classes": [
          "tooltipCharacter"
        ],
        "conditional": false
      },
      {
        "value": "IMPERIUM",
        "pointer": "/html/body/div/div[1]/div[3]/div[10]/div[4]/div[3]/div[1]/span/span[4]",
        "tooltip": "#tooltip_contentImperium",
        "classes": [
          "tooltipImperium"
        ],
        "conditional": false
      },
      {
        "value": "TERMINATOR",
        "pointer": "/html/body/div/div[1]/div[3]/div[10]/div[4]/div[3]/div[1]/span/span[5]",
        "tooltip": "#tooltip_contentTerminator",
        "classes": [
          "tooltipTerminator"
        ],
        "conditional": false
      },
      {
        "value": "DEATHWING",
        "pointer": "/html/body/div/div[1]/div[3]/div[10]/div[4]/div[3]/div[1]/span/span[7]",
        "tooltip": "#tooltip_contentDeathwing",
        "classes": [
          "tooltipDeathwing",
          "clFl",
          "CHDA",
          "AAAA",
          "AAGA",
          "AAAB",
          "AATB",
          "AADB",
          "AATS",
          "AATC",
          "AATF",
          "AAPS",
          "AAPF",
          "AAGL",
          "AAGS",
          "AAST",
          "AAIR",
          "AAGT",
          "AAIS",
          "AAFG",
          "AAMH",
          "AAVO",
          "AAAI",
          "AAEN",
          "AAWD",
          "AADP",
          "AAIC",
          "AAWR",
          "AABF",
          "AADS",
          "AAMW",
          "AACS",
          "AASK",
          "AAFS",
          "AACF",
          "AASS",
          "AAGW",
          "AABU",
          "AASF",
          "AABS",
          "AAPI",
          "AATA",
          "AASV"
        ],
        "conditional": true
      }
    ],
    "unconditionalKeywords": [
      "INFANTRY",
      "ANCIENT",
      "CHARACTER",
      "IMPERIUM",
      "TERMINATOR"
    ],
    "conditionalKeywords": [
      "DEATHWING"
    ],
    "provenance": {
      "sourceId": "space-marines-waha-11e-2026-10-20",
      "document": "books/space-marines/v2/sources/raw/wahapedia-datasheets-probe.html",
      "sha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
      "pointer": "/html/body/div/div[1]/div[3]/div[10]/div[4]",
      "sourceEntityId": "sm-source-b89ca74df82b446d",
      "authority": "ACCEPTED_SECONDARY"
    }
  },
  {
    "id": "unit-sm-e75d543e81cf49f3",
    "sourceEntityId": "sm-source-4608c0570b4a46f5",
    "sourceKeywords": [
      "VEHICLE",
      "FRAME",
      "IMPERIUM",
      "SMOKE",
      "TRANSPORT, DEATHWING"
    ],
    "sourceKeywordFieldSha256": "43985B3EE681F54CE338F7ECA1CBA1CD5B929C072290A99DC849E9049227D08F",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[30]/div[8]/div[3]/div[1]",
    "sourceText": "KEYWORDS: VEHICLE; FRAME; IMPERIUM; SMOKE; TRANSPORT, DEATHWING",
    "tokens": [
      {
        "value": "VEHICLE",
        "pointer": "/html/body/div/div[1]/div[3]/div[30]/div[8]/div[3]/div[1]/span/span[1]",
        "tooltip": "#tooltip_contentVehicle",
        "classes": [
          "tooltipVehicle"
        ],
        "conditional": false
      },
      {
        "value": "FRAME",
        "pointer": "/html/body/div/div[1]/div[3]/div[30]/div[8]/div[3]/div[1]/span/span[2]",
        "tooltip": "#tooltip_contentFrame",
        "classes": [
          "tooltipFrame"
        ],
        "conditional": false
      },
      {
        "value": "IMPERIUM",
        "pointer": "/html/body/div/div[1]/div[3]/div[30]/div[8]/div[3]/div[1]/span/span[3]",
        "tooltip": "#tooltip_contentImperium",
        "classes": [
          "tooltipImperium"
        ],
        "conditional": false
      },
      {
        "value": "SMOKE",
        "pointer": "/html/body/div/div[1]/div[3]/div[30]/div[8]/div[3]/div[1]/span/span[4]",
        "tooltip": "#tooltip_contentSmoke",
        "classes": [
          "tooltipSmoke"
        ],
        "conditional": false
      },
      {
        "value": "TRANSPORT",
        "pointer": "/html/body/div/div[1]/div[3]/div[30]/div[8]/div[3]/div[1]/span/span[5]",
        "tooltip": "#tooltip_contentTransport",
        "classes": [
          "tooltipTransport"
        ],
        "conditional": false
      },
      {
        "value": "DEATHWING",
        "pointer": "/html/body/div/div[1]/div[3]/div[30]/div[8]/div[3]/div[1]/span/span[7]",
        "tooltip": "#tooltip_contentDeathwing",
        "classes": [
          "tooltipDeathwing",
          "clFl",
          "CHDA",
          "AAAA",
          "AAGA",
          "AAAB",
          "AATB",
          "AADB",
          "AATS",
          "AATC",
          "AATF",
          "AAPS",
          "AAPF",
          "AAGL",
          "AAGS",
          "AAST",
          "AAIR",
          "AAGT",
          "AAIS",
          "AAFG",
          "AAMH",
          "AAVO",
          "AAAI",
          "AAEN",
          "AAWD",
          "AADP",
          "AAIC",
          "AAWR",
          "AABF",
          "AADS",
          "AAMW",
          "AACS",
          "AASK",
          "AAFS",
          "AACF",
          "AASS",
          "AAGW",
          "AABU",
          "AASF",
          "AABS",
          "AAPI",
          "AATA",
          "AASV"
        ],
        "conditional": true
      }
    ],
    "unconditionalKeywords": [
      "VEHICLE",
      "FRAME",
      "IMPERIUM",
      "SMOKE",
      "TRANSPORT"
    ],
    "conditionalKeywords": [
      "DEATHWING"
    ],
    "provenance": {
      "sourceId": "space-marines-waha-11e-2026-10-20",
      "document": "books/space-marines/v2/sources/raw/wahapedia-datasheets-probe.html",
      "sha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
      "pointer": "/html/body/div/div[1]/div[3]/div[30]/div[8]",
      "sourceEntityId": "sm-source-4608c0570b4a46f5",
      "authority": "ACCEPTED_SECONDARY"
    }
  },
  {
    "id": "unit-sm-f4717a6371254e73",
    "sourceEntityId": "sm-source-558a519efeef43de",
    "sourceKeywords": [
      "VEHICLE",
      "FLY",
      "FRAME",
      "IMPERIUM",
      "SPEEDER, RAVENWING"
    ],
    "sourceKeywordFieldSha256": "8787D5233A34F6A7A7F76DF3FAE978E76618B456691D815B2C0D9C56DE3229C2",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[32]/div[14]/div[3]/div[1]",
    "sourceText": "KEYWORDS: VEHICLE; FLY; FRAME; IMPERIUM; SPEEDER, RAVENWING",
    "tokens": [
      {
        "value": "VEHICLE",
        "pointer": "/html/body/div/div[1]/div[3]/div[32]/div[14]/div[3]/div[1]/span/span[1]",
        "tooltip": "#tooltip_contentVehicle",
        "classes": [
          "tooltipVehicle"
        ],
        "conditional": false
      },
      {
        "value": "FLY",
        "pointer": "/html/body/div/div[1]/div[3]/div[32]/div[14]/div[3]/div[1]/span/span[2]",
        "tooltip": "#tooltip_contentFly",
        "classes": [
          "tooltipFly"
        ],
        "conditional": false
      },
      {
        "value": "FRAME",
        "pointer": "/html/body/div/div[1]/div[3]/div[32]/div[14]/div[3]/div[1]/span/span[3]",
        "tooltip": "#tooltip_contentFrame",
        "classes": [
          "tooltipFrame"
        ],
        "conditional": false
      },
      {
        "value": "IMPERIUM",
        "pointer": "/html/body/div/div[1]/div[3]/div[32]/div[14]/div[3]/div[1]/span/span[4]",
        "tooltip": "#tooltip_contentImperium",
        "classes": [
          "tooltipImperium"
        ],
        "conditional": false
      },
      {
        "value": "SPEEDER",
        "pointer": "/html/body/div/div[1]/div[3]/div[32]/div[14]/div[3]/div[1]/span/span[5]",
        "tooltip": "#tooltip_contentSpeeder",
        "classes": [
          "tooltipSpeeder"
        ],
        "conditional": false
      },
      {
        "value": "RAVENWING",
        "pointer": "/html/body/div/div[1]/div[3]/div[32]/div[14]/div[3]/div[1]/span/span[7]",
        "tooltip": "#tooltip_contentRavenwing",
        "classes": [
          "tooltipRavenwing",
          "clFl",
          "CHDA",
          "AAAA",
          "AAGA",
          "AAAB",
          "AATB",
          "AADB",
          "AATS",
          "AATC",
          "AATF",
          "AAPS",
          "AAPF",
          "AAGL",
          "AAGS",
          "AAST",
          "AAIR",
          "AAGT",
          "AAIS",
          "AAFG",
          "AAMH",
          "AAVO",
          "AAAI",
          "AAEN",
          "AAWD",
          "AADP",
          "AAIC",
          "AAWR",
          "AABF",
          "AADS",
          "AAMW",
          "AACS",
          "AASK",
          "AAFS",
          "AACF",
          "AASS",
          "AAGW",
          "AABU",
          "AASF",
          "AABS",
          "AAPI",
          "AATA",
          "AASV"
        ],
        "conditional": true
      }
    ],
    "unconditionalKeywords": [
      "VEHICLE",
      "FLY",
      "FRAME",
      "IMPERIUM",
      "SPEEDER"
    ],
    "conditionalKeywords": [
      "RAVENWING"
    ],
    "provenance": {
      "sourceId": "space-marines-waha-11e-2026-10-20",
      "document": "books/space-marines/v2/sources/raw/wahapedia-datasheets-probe.html",
      "sha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
      "pointer": "/html/body/div/div[1]/div[3]/div[32]/div[14]",
      "sourceEntityId": "sm-source-558a519efeef43de",
      "authority": "ACCEPTED_SECONDARY"
    }
  },
  {
    "id": "unit-sm-f92faa31422041f5",
    "sourceEntityId": "sm-source-c022c262993d44d6",
    "sourceKeywords": [
      "VEHICLE",
      "FLY",
      "FRAME",
      "IMPERIUM",
      "SPEEDER, RAVENWING"
    ],
    "sourceKeywordFieldSha256": "8787D5233A34F6A7A7F76DF3FAE978E76618B456691D815B2C0D9C56DE3229C2",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[32]/div[10]/div[3]/div[1]",
    "sourceText": "KEYWORDS: VEHICLE; FLY; FRAME; IMPERIUM; SPEEDER, RAVENWING",
    "tokens": [
      {
        "value": "VEHICLE",
        "pointer": "/html/body/div/div[1]/div[3]/div[32]/div[10]/div[3]/div[1]/span/span[1]",
        "tooltip": "#tooltip_contentVehicle",
        "classes": [
          "tooltipVehicle"
        ],
        "conditional": false
      },
      {
        "value": "FLY",
        "pointer": "/html/body/div/div[1]/div[3]/div[32]/div[10]/div[3]/div[1]/span/span[2]",
        "tooltip": "#tooltip_contentFly",
        "classes": [
          "tooltipFly"
        ],
        "conditional": false
      },
      {
        "value": "FRAME",
        "pointer": "/html/body/div/div[1]/div[3]/div[32]/div[10]/div[3]/div[1]/span/span[3]",
        "tooltip": "#tooltip_contentFrame",
        "classes": [
          "tooltipFrame"
        ],
        "conditional": false
      },
      {
        "value": "IMPERIUM",
        "pointer": "/html/body/div/div[1]/div[3]/div[32]/div[10]/div[3]/div[1]/span/span[4]",
        "tooltip": "#tooltip_contentImperium",
        "classes": [
          "tooltipImperium"
        ],
        "conditional": false
      },
      {
        "value": "SPEEDER",
        "pointer": "/html/body/div/div[1]/div[3]/div[32]/div[10]/div[3]/div[1]/span/span[5]",
        "tooltip": "#tooltip_contentSpeeder",
        "classes": [
          "tooltipSpeeder"
        ],
        "conditional": false
      },
      {
        "value": "RAVENWING",
        "pointer": "/html/body/div/div[1]/div[3]/div[32]/div[10]/div[3]/div[1]/span/span[7]",
        "tooltip": "#tooltip_contentRavenwing",
        "classes": [
          "tooltipRavenwing",
          "clFl",
          "CHDA",
          "AAAA",
          "AAGA",
          "AAAB",
          "AATB",
          "AADB",
          "AATS",
          "AATC",
          "AATF",
          "AAPS",
          "AAPF",
          "AAGL",
          "AAGS",
          "AAST",
          "AAIR",
          "AAGT",
          "AAIS",
          "AAFG",
          "AAMH",
          "AAVO",
          "AAAI",
          "AAEN",
          "AAWD",
          "AADP",
          "AAIC",
          "AAWR",
          "AABF",
          "AADS",
          "AAMW",
          "AACS",
          "AASK",
          "AAFS",
          "AACF",
          "AASS",
          "AAGW",
          "AABU",
          "AASF",
          "AABS",
          "AAPI",
          "AATA",
          "AASV"
        ],
        "conditional": true
      }
    ],
    "unconditionalKeywords": [
      "VEHICLE",
      "FLY",
      "FRAME",
      "IMPERIUM",
      "SPEEDER"
    ],
    "conditionalKeywords": [
      "RAVENWING"
    ],
    "provenance": {
      "sourceId": "space-marines-waha-11e-2026-10-20",
      "document": "books/space-marines/v2/sources/raw/wahapedia-datasheets-probe.html",
      "sha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
      "pointer": "/html/body/div/div[1]/div[3]/div[32]/div[10]",
      "sourceEntityId": "sm-source-c022c262993d44d6",
      "authority": "ACCEPTED_SECONDARY"
    }
  },
  {
    "id": "unit-sm-fee1a559233f4cbb",
    "sourceEntityId": "sm-source-c1f05d424a9f4f10",
    "sourceKeywords": [
      "VEHICLE",
      "DREADNOUGHT",
      "IMPERIUM",
      "WALKER, DEATHWING"
    ],
    "sourceKeywordFieldSha256": "D3438DF027EB3BDD44D2D7AC0918EF7DD06ADE9EB9A5415E41F2F471A549824D",
    "sourcePointer": "/html/body/div/div[1]/div[3]/div[34]/div[4]/div[3]/div[1]",
    "sourceText": "KEYWORDS: VEHICLE; DREADNOUGHT; IMPERIUM; WALKER, DEATHWING",
    "tokens": [
      {
        "value": "VEHICLE",
        "pointer": "/html/body/div/div[1]/div[3]/div[34]/div[4]/div[3]/div[1]/span/span[1]",
        "tooltip": "#tooltip_contentVehicle",
        "classes": [
          "tooltipVehicle"
        ],
        "conditional": false
      },
      {
        "value": "DREADNOUGHT",
        "pointer": "/html/body/div/div[1]/div[3]/div[34]/div[4]/div[3]/div[1]/span/span[2]",
        "tooltip": "#tooltip_contentDreadnought",
        "classes": [
          "tooltipDreadnought"
        ],
        "conditional": false
      },
      {
        "value": "IMPERIUM",
        "pointer": "/html/body/div/div[1]/div[3]/div[34]/div[4]/div[3]/div[1]/span/span[3]",
        "tooltip": "#tooltip_contentImperium",
        "classes": [
          "tooltipImperium"
        ],
        "conditional": false
      },
      {
        "value": "WALKER",
        "pointer": "/html/body/div/div[1]/div[3]/div[34]/div[4]/div[3]/div[1]/span/span[4]",
        "tooltip": "#tooltip_contentWalker",
        "classes": [
          "tooltipWalker"
        ],
        "conditional": false
      },
      {
        "value": "DEATHWING",
        "pointer": "/html/body/div/div[1]/div[3]/div[34]/div[4]/div[3]/div[1]/span/span[6]",
        "tooltip": "#tooltip_contentDeathwing",
        "classes": [
          "tooltipDeathwing",
          "clFl",
          "CHDA",
          "AAAA",
          "AAGA",
          "AAAB",
          "AATB",
          "AADB",
          "AATS",
          "AATC",
          "AATF",
          "AAPS",
          "AAPF",
          "AAGL",
          "AAGS",
          "AAST",
          "AAIR",
          "AAGT",
          "AAIS",
          "AAFG",
          "AAMH",
          "AAVO",
          "AAAI",
          "AAEN",
          "AAWD",
          "AADP",
          "AAIC",
          "AAWR",
          "AABF",
          "AADS",
          "AAMW",
          "AACS",
          "AASK",
          "AAFS",
          "AACF",
          "AASS",
          "AAGW",
          "AABU",
          "AASF",
          "AABS",
          "AAPI",
          "AATA",
          "AASV"
        ],
        "conditional": true
      }
    ],
    "unconditionalKeywords": [
      "VEHICLE",
      "DREADNOUGHT",
      "IMPERIUM",
      "WALKER"
    ],
    "conditionalKeywords": [
      "DEATHWING"
    ],
    "provenance": {
      "sourceId": "space-marines-waha-11e-2026-10-20",
      "document": "books/space-marines/v2/sources/raw/wahapedia-datasheets-probe.html",
      "sha256": "66E115EF9E2DC6E3336A3C1B8F3331EB4B92493DDA1D1B9B59133E8CCA07291D",
      "pointer": "/html/body/div/div[1]/div[3]/div[34]/div[4]",
      "sourceEntityId": "sm-source-c1f05d424a9f4f10",
      "authority": "ACCEPTED_SECONDARY"
    }
  }
]);
/** Resolve existing keyword-array semantics on a disposable view only.
 * No Chapter context is guessed; conditional source tokens remain unresolved.
 */
export function bindNativeKeywords(book){
  assert.equal(book.bookId,'space-marines');
  const index=new Map(book.entities.map(e=>[e.id,e])),bindings=[],unresolved=[];
  // Any new combined source token requires a new explicit reviewed binding.
  const combined=book.entities.filter(e=>e.kind==='DATASHEET'&&e.data.keywords.some(value=>value.includes(','))).map(e=>e.id);
  assert.ok(combined.every(id=>nativeKeywordReview.some(row=>row.id===id)),'Unreviewed keyword token boundary');
  for(const proof of nativeKeywordReview){
    const unit=index.get(proof.id);assert.equal(unit?.kind,'DATASHEET','Missing keyword source owner');
    assert.equal(unit.sourceEntityId,proof.sourceEntityId);
    assert.deepEqual(unit.provenance,proof.provenance,'Keyword provenance changed');
    const supplied=JSON.stringify(unit.data.keywords);
    assert.ok(supplied===JSON.stringify(proof.sourceKeywords)||supplied===JSON.stringify(proof.unconditionalKeywords),'Keyword source tokens changed');
    assert.equal(sha(JSON.stringify(proof.sourceKeywords)),proof.sourceKeywordFieldSha256);
    assert.equal(new Set(proof.unconditionalKeywords).size,proof.unconditionalKeywords.length);
    assert.ok(proof.tokens.every(token=>proof.unconditionalKeywords.includes(token.value)!==token.conditional));
    unit.data.keywords=clone(proof.unconditionalKeywords);
    bindings.push({...clone(proof),status:'EXECUTABLE_PROVEN',scope:'UNIT',field:['keywords'],
      reason:'Exact accepted RAW unconditional keyword spans; source-filtered Chapter tags are not unconditional grants.'});
    for(const token of proof.tokens.filter(token=>token.conditional))unresolved.push({id:proof.id,sourcePointer:token.pointer,
      keyword:token.value,status:'NOT_PROVEN',scope:'UNIT',provenance:clone(proof.provenance),
      reason:'Source token is Chapter-filtered (CHDA/clFl); no confirmed Chapter context is bound. Original source text is retained.'});
  }
  return {bindings,unresolved};
}

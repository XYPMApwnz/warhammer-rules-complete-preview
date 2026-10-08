import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {buildApp as buildDG,readAppInputs as readDG} from '../../death-guard/v2/app-build.mjs';
import {buildApp as buildAM,readAppInputs as readAM} from '../../adeptus-mechanicus/v2/app-build.mjs';
import {validatePresentation} from '../../death-guard/v2/app-qa.mjs';

const root=fileURLToPath(new URL('../../../',import.meta.url));
const baseline='51088e8ece8e5e3a9ad0d0baa4db8d2d89b54f35';
const results=[];
for(const [book,read,build,count]of [['death-guard',readDG,buildDG,36],['adeptus-mechanicus',readAM,buildAM,34]]){
  const inputs=read(),before=structuredClone(inputs.model),payload=build(inputs);
  assert.deepEqual(inputs.model,before,'Presentation mutated canonical facts/contracts');
  const original=JSON.parse(execFileSync('git',['show',`${baseline}:books/${book}/v2/generated/app-presentation.json`],{cwd:root,maxBuffer:20e6}));
  const unchanged=JSON.parse(JSON.stringify(payload));delete unchanged.datasheetPresentation.normal;
  assert.deepEqual(unchanged,original,'Non-normal presentation/factual projection changed');
  assert.deepEqual(build(inputs),payload,'Nondeterministic normal projection');
  const units=payload.cards.filter(card=>card.kind==='DATASHEET');assert.equal(units.length,count);
  const normal=payload.datasheetPresentation.normal;
  for(const selection of normal.profileSelections.filter(selection=>!selection.instructionId)){
    const source=selection.source,bytes=fs.readFileSync(new URL(source.sourcePath,new URL('../../../',import.meta.url)));
    assert.equal(createHash('sha256').update(bytes).digest('hex').toUpperCase(),source.sha256,'Accepted source evidence changed');
    const html=bytes.toString('utf8');assert(html.includes(source.pointer.slice(1)),'Source tooltip missing');
    assert(html.includes(selection.text),'Instruction is not exact accepted source wording');
    // This source check verifies explicit arrow-marked rows. Production never
    // searches names/prose; its renderer consumes the frozen canonical IDs.
    const rows=[...html.matchAll(/<tr class="dsWeaponRow">([\s\S]*?)<\/tr>/g)].map(match=>match[1]);
    for(const id of selection.profileIds){
      const weapon=inputs.model.entities.find(entity=>entity.id===id);
      assert(rows.some(row=>row.includes('data-tooltip-content="'+source.pointer+'"')&&row.includes(weapon.data.name)),
        'Profile is not marked by the accepted source arrow: '+id);
    }
  }
  if(book==='death-guard'){
    assert.equal(validatePresentation(payload,inputs.model,inputs.records).facts,3654);
    assert.equal(new Set(normal.profileSelections.filter(group=>!group.instructionId).map(group=>group.unitId)).size,15);
    assert.equal(normal.profileSelections.filter(group=>!group.instructionId).length,16);
    assert.equal(normal.optionCosts.length,2);
    assert.deepEqual(normal.optionCosts.map(cost=>cost.valueField.value),[15,15]);
    assert.deepEqual(normal.boundAbilities,[{unitId:'unit-great-unclean-one',itemId:'datasheet-great-unclean-one:weapon:6',ruleId:'datasheet-great-unclean-one:raw-dsAbility:1',fieldPath:'/text'}]);
  }else{
    assert.equal(normal.optionCosts.length,2);
    assert.deepEqual(normal.optionCosts.map(cost=>cost.valueField.value),[10,10]);
    assert.equal(payload.ruleContractIds.length,204);
  }
  results.push({book,normalDatasheets:units.length,canonicalProjectionUnchanged:true,
    profileGroups:normal.profileSelections.length,paidOptions:normal.optionCosts.length});
}
console.log(JSON.stringify({status:'PASS',results,acceptedSourceFactsChanged:0,sourceDifferenceFactsChanged:0,
  personalPayloadUnchanged:true}));

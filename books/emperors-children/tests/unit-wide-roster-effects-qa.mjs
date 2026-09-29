import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const clone=value=>structuredClone(value);
const plain=value=>JSON.parse(JSON.stringify(value));
const scope={console,URL,URLSearchParams};scope.window=scope;scope.globalThis=scope;vm.createContext(scope);
for(const file of ['books/emperors-children/scripts/roster-data.js','books/shared/effect-contract-runtime.js','books/shared/roster-context.js'])vm.runInContext(read(file),scope,{filename:file});
const baseline=scope.WH_BOOK_ROSTER_CATALOG;
const byId=(catalog,id)=>catalog.units.find(unit=>unit.id===id);
const contract=(catalog,id)=>catalog.effectContracts.find(item=>item.canonicalRecordId===id);
const title=(unit,id)=>unit.gameSelections.selections.find(item=>item.id===id)?.title;

const rawFor=(catalog,unitId,instanceId,{addSelectionId=null}={})=>{
  const unit=byId(catalog,unitId),models=[];
  for(const model of unit.gameSelections.models){
    const quantity=Number(model.min),defaults=new Map((unit.gameSelections.wargearDefaults.find(item=>item.modelId===model.id)?.selections||[]).map(item=>[item.selectionId,item.quantity])),name=model.aliases?.[0]||model.title;
    const format=equipment=>[...equipment].map(([id,amount])=>`${amount===1?'':`${amount}x `}${title(unit,id)}`).join(', ');
    if(addSelectionId&&models.length===0){const selected=new Map(defaults);selected.set(addSelectionId,(selected.get(addSelectionId)||0)+1);models.push({quantity:1,name,loadouts:[{quantity:1,wargear:format(selected)}]});if(quantity>1)models.push({quantity:quantity-1,name,loadouts:[{quantity:quantity-1,wargear:format(defaults)}]});}
    else models.push({quantity,name,loadouts:[{quantity,wargear:format(defaults)}]});
  }
  return{id:instanceId,canonicalUnitId:unit.id,name:unit.title,quantity:models.reduce((sum,item)=>sum+item.quantity,0),points:0,wargear:'',models,warlord:null};
};
const project=(catalog,units,{detachmentIds=[],attachments={}}={})=>{
  scope.WH_BOOK_ROSTER_CATALOG=catalog;
  return scope.WHArmyRosterContext.project({catalog,roster:{faction:"Emperor's Children",declared:0,calculated:0,unitLineTotal:0,detachments:detachmentIds.map(id=>({id,name:id})),enhancements:[],warnings:[],units},record:{id:'ec-unit-wide-effects',attachments},provider:{gameEffects:context=>scope.WHEffectContractRuntime.project(context)}}).game;
};
const modifier=(unit,target)=>unit.effective.characteristicModifiers?.find(item=>item.targetId===target);

const factionPack=JSON.parse(read('books/emperors-children/content/emperors-children-faction-pack.en.json'));
assert.equal(factionPack.detachments.find(item=>item.id==='spectacle-of-slaughter').rule.text,'Friendly FLAWLESS BLADES units have Fights First.','accepted Entitled to Victory source wording');
const corpus=JSON.parse(read('books/emperors-children/sources/waha-11e-current-2026-09-28/corpus.json'));
for(const sourceId of ['datasheet-daemonettes','datasheet-seekers']){
  const source=corpus.datasheets.find(item=>item.sourceId===sourceId),section=source.sections.find(item=>item.sourceId===`${sourceId}:section:1`);
  assert.ok(section.blocks.some(item=>item.text==='Instrument of Chaos: Add 1 to Charge rolls made for the bearer’s unit.'&&item.wargearAbility===true),`${sourceId}: accepted Instrument of Chaos source wording`);
}

const certify=catalog=>{
  const entitled=contract(catalog,'emperors-children-detachment-rule-entitled-to-victory'),instrument=contract(catalog,'emperors-children-equipment-instrument-of-chaos');
  assert.ok(entitled,'Entitled to Victory effect contract');
  assert.ok(entitled.clauses[0].operations.some(item=>item.type==='ABILITY_GRANT'&&item.canonicalTarget==='core-fights-first'),'Entitled to Victory grants canonical Fights First');
  assert.equal(instrument.scope,'owner-or-attached-group','Instrument uses the bearer-unit scope');
  assert.deepEqual(plain(instrument.selector.selectedWargearAbilityIds),['unit-daemonettes-wargear-ability-6721ceb7d6','unit-seekers-wargear-ability-6721ceb7d6'],'Instrument exact parent-scoped ability identities');
  assert.deepEqual(plain(instrument.clauses[0].operations),[{id:'instrument-of-chaos-charge',canonicalTarget:'Charge',parameters:{delta:1,modifierOnly:true},type:'CHARACTERISTIC_ADD'}],'Instrument exact +1 Charge operation');
  assert.equal(instrument.source.sourceId,'emperors-children-waha-11e-current-2026-09-28','Instrument uses the accepted current factual owner');
  assert.deepEqual(plain([instrument.source.locator,...instrument.source.supportingLocators]),['books/emperors-children/sources/waha-11e-current-2026-09-28/corpus.json#datasheet-daemonettes:section:1','books/emperors-children/sources/waha-11e-current-2026-09-28/corpus.json#datasheet-seekers:section:1'],'Instrument provenance covers both parent-scoped source records');

  let positive=0,negative=0,physical=0,recompute=0;
  const blades=rawFor(catalog,'unit-flawless-blades','blades'),infractors=rawFor(catalog,'unit-infractors','infractors');
  let game=project(catalog,[blades,infractors],{detachmentIds:['spectacle-of-slaughter']});
  const blade=game.units.find(item=>item.identity.instanceId==='blades'),other=game.units.find(item=>item.identity.instanceId==='infractors');
  assert.ok(blade.effective.abilities.some(item=>item.id==='core-fights-first'||item.title==='Fights First'),'eligible Flawless Blades gain Fights First');positive++;
  assert.equal(other.effective.abilities.some(item=>item.id==='core-fights-first'||item.title==='Fights First'),false,'ineligible unit does not gain Fights First');negative++;
  assert.equal(other.effects.some(item=>item.id==='entitled-to-victory-fights-first'),false,'Entitled to Victory does not leak');negative++;
  const noDetachment=project(catalog,[clone(blades)]).units[0];assert.equal(noDetachment.effects.some(item=>item.id==='entitled-to-victory-fights-first'),false,'effect absent outside its Detachment');negative++;
  assert.ok(project(catalog,[clone(blades)],{detachmentIds:['spectacle-of-slaughter']}).units[0].effects.some(item=>item.id==='entitled-to-victory-fights-first'),'recompute restores Detachment effect');recompute++;
  game=project(catalog,[clone(blades),rawFor(catalog,'unit-flawless-blades','blades-2')],{detachmentIds:['spectacle-of-slaughter']});
  assert.equal(game.units.filter(item=>item.effects.some(effect=>effect.id==='entitled-to-victory-fights-first')).length,2,'duplicate eligible physical instances resolve independently');physical++;

  for(const [unitId,selectionId] of [['unit-daemonettes','unit-daemonettes-selection-instrument-of-chaos'],['unit-seekers','unit-seekers-selection-instrument-of-chaos']]){
    const selected=rawFor(catalog,unitId,`${unitId}-selected`,{addSelectionId:selectionId}),unselected=rawFor(catalog,unitId,`${unitId}-plain`);
    game=project(catalog,[selected,unselected]);
    const equipped=game.units[0],plainUnit=game.units[1],charge=modifier(equipped,'Charge');
    assert.equal(charge?.delta,1,`${unitId}: selected Instrument grants +1 Charge`);positive++;
    assert.deepEqual(plain(charge?.sourceEffectIds),['instrument-of-chaos-charge'],`${unitId}: selected Instrument applies once`);positive++;
    assert.equal(modifier(plainUnit,'Charge'),undefined,`${unitId}: unselected unit gets no Charge modifier`);negative++;
    assert.equal(plainUnit.effects.some(item=>item.id==='instrument-of-chaos-charge'),false,`${unitId}: duplicate physical unit remains isolated`);physical++;
    const removed=project(catalog,[clone(unselected)]).units[0];assert.equal(modifier(removed,'Charge'),undefined,`${unitId}: deselect/recompute removes modifier`);recompute++;
    const restored=project(catalog,[clone(selected)]).units[0];assert.equal(modifier(restored,'Charge')?.delta,1,`${unitId}: reload/recompute restores selected modifier`);recompute++;
  }

  // Exercise the generic attached-group scope without adding a production relation.
  const harness=clone(catalog),leader=byId(harness,'unit-lord-exultant'),bodyguard=byId(harness,'unit-daemonettes');
  leader.relations.canLead.push({unitId:bodyguard.id,maxCharacters:1});bodyguard.relations.canBeLedBy.push({unitId:leader.id,maxCharacters:1});
  const selectedBodyguard=rawFor(harness,bodyguard.id,'bodyguard',{addSelectionId:'unit-daemonettes-selection-instrument-of-chaos'}),rawLeader=rawFor(harness,leader.id,'leader');
  game=project(harness,[selectedBodyguard,rawLeader],{attachments:{bodyguard:['leader']}});
  assert.equal(modifier(game.units.find(item=>item.identity.instanceId==='bodyguard'),'Charge')?.delta,1,'bearer unit retains Instrument modifier while attached');positive++;
  assert.equal(modifier(game.units.find(item=>item.identity.instanceId==='leader'),'Charge')?.delta,1,'formed Attached Unit receives Instrument modifier');positive++;
  const detached=project(harness,[clone(selectedBodyguard),clone(rawLeader)]);
  assert.equal(modifier(detached.units.find(item=>item.identity.instanceId==='leader'),'Charge'),undefined,'detach removes propagated modifier');recompute++;
  assert.equal(modifier(detached.units.find(item=>item.identity.instanceId==='bodyguard'),'Charge')?.delta,1,'detach retains modifier on bearer unit');recompute++;
  assert.equal(modifier(game.units.find(item=>item.identity.instanceId==='leader'),'Charge')?.sourceEffectIds.length,1,'Instrument stacking is once per physical source');physical++;
  return{positive,negative,physical,recompute};
};

const controls=certify(baseline);
assert.deepEqual(controls,{positive:7,negative:5,physical:4,recompute:7},'focused control inventory');
let mutations=0;
const killed=(label,mutate)=>{const catalog=clone(baseline);mutate(catalog);assert.throws(()=>certify(catalog),undefined,`${label} mutation survived`);mutations++;};
killed('MISSING_ENTITLED_GRANT',catalog=>{contract(catalog,'emperors-children-detachment-rule-entitled-to-victory').clauses[0].operations=contract(catalog,'emperors-children-detachment-rule-entitled-to-victory').clauses[0].operations.filter(item=>item.id!=='entitled-to-victory-fights-first');});
killed('WRONG_ENTITLED_TARGET',catalog=>{contract(catalog,'emperors-children-detachment-rule-entitled-to-victory').clauses[0].operations.find(item=>item.id==='entitled-to-victory-fights-first').canonicalTarget='core-stealth';});
killed('WRONG_ENTITLED_SELECTOR',catalog=>{contract(catalog,'emperors-children-detachment-rule-entitled-to-victory').selector.unitIds=['unit-infractors'];});
killed('MISSING_INSTRUMENT',catalog=>{catalog.effectContracts=catalog.effectContracts.filter(item=>item.canonicalRecordId!=='emperors-children-equipment-instrument-of-chaos');});
killed('WRONG_INSTRUMENT_SELECTION',catalog=>{contract(catalog,'emperors-children-equipment-instrument-of-chaos').selector.selectedWargearAbilityIds=['unit-daemonettes-wargear-ability-b3dad0463e'];});
killed('WRONG_INSTRUMENT_SCOPE',catalog=>{contract(catalog,'emperors-children-equipment-instrument-of-chaos').scope='owner';});
killed('WRONG_INSTRUMENT_DELTA',catalog=>{contract(catalog,'emperors-children-equipment-instrument-of-chaos').clauses[0].operations[0].parameters.delta=2;});
assert.equal(mutations,7,'source-backed mutation controls');
console.log(`Emperor's Children unit-wide effects: source 2/2; executable 2/2; positive ${controls.positive}/${controls.positive}; negative ${controls.negative}/${controls.negative}; physical-instance ${controls.physical}/${controls.physical}; recompute ${controls.recompute}/${controls.recompute}; mutations ${mutations}/${mutations} KILLED; PASS`);

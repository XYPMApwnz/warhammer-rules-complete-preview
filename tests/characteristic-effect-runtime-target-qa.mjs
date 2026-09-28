import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
import {createCatalogGameUnit,createRosterFixture} from './helpers/roster-fixtures.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const books=['death-guard','adeptus-mechanicus','tyranids','tau-empire','emperors-children','chaos-space-marines','space-marines','dark-angels','blood-angels'];
const values=value=>Array.isArray(value)?value:[];
const targetId=operation=>typeof operation?.canonicalTarget==='string'?operation.canonicalTarget:operation?.canonicalTarget?.id;
const scopedUnitIds=(contract,clause)=>[...new Set([
  contract?.sourceUnitId,
  ...values(contract?.selector?.sourceUnitIds),...values(contract?.selector?.unitIds),
  ...values(clause?.selector?.sourceUnitIds),...values(clause?.selector?.unitIds)
].filter(Boolean))];
const loadCatalog=book=>{const scope={window:{}};vm.runInNewContext(fs.readFileSync(path.join(root,`books/${book}/scripts/roster-data.js`),'utf8'),scope,{filename:`${book}/roster-data.js`});return scope.window.WH_BOOK_ROSTER_CATALOG;};

const catalogs=new Map(books.map(book=>[book,loadCatalog(book)])),operations=[],missing=[],unsupported=[];
for(const [book,catalog] of catalogs){
  for(const contract of values(catalog.effectContracts))for(const clause of values(contract.clauses))for(const operation of values(clause.operations)){
    if(!['CHARACTERISTIC_ADD','CHARACTERISTIC_SET'].includes(operation.type))continue;
    operations.push({book,contractId:contract.canonicalRecordId,operationId:operation.id,modifierOnly:operation.parameters?.modifierOnly===true});
    const target=targetId(operation);
    for(const unitId of scopedUnitIds(contract,clause)){
      const unit=catalog.units.find(item=>item.id===unitId);
      if(!unit){unsupported.push({book,contractId:contract.canonicalRecordId,operationId:operation.id,unitId,target});continue;}
      if(unit.gameSelections?.stats?.[target]==null&&operation.parameters?.modifierOnly!==true)missing.push({book,contractId:contract.canonicalRecordId,operationId:operation.id,unitId,target});
    }
  }
}
assert.equal(operations.length,83,'effective characteristic operation inventory');
assert.equal(new Set(operations.map(item=>item.operationId)).size,57,'unique characteristic operation inventory');
assert.deepEqual(operations.filter(item=>item.modifierOnly).map(({book,contractId,operationId})=>({book,contractId,operationId})),[
  {book:'death-guard',contractId:'lord-of-poxes-ability-gift-of-poxes',operationId:'gift-of-poxes-contagion-range'},
  {book:'death-guard',contractId:'detachment-rule-hypervirulent-strains',operationId:'hypervirulent-strains-contagion-range'},
  {book:'death-guard',contractId:'enhancement-plagueveil',operationId:'plagueveil-detection-range'}
],'modifier-only characteristics remain explicit source-backed effect operations');
assert.deepEqual(unsupported.map(item=>[item.book,item.unitId,item.target]),[
  ['dark-angels','unit-wardens-of-ultramar','OC'],['dark-angels','unit-wardens-of-ultramar','Ld'],
  ['blood-angels','unit-wardens-of-ultramar','OC'],['blood-angels','unit-wardens-of-ultramar','Ld']
],'excluded dependency units are legitimate unsupported target shapes');
assert.deepEqual(missing,[],'resolved runtime characteristic targets must expose their required canonical-derived field');

const mechanicusCatalog=catalogs.get('adeptus-mechanicus');
const lordsMissingBase=mechanicusCatalog.units.filter(unit=>
  values(unit.intrinsicKeywords).some(keyword=>String(keyword).toUpperCase()==='TECH-PRIEST')
  &&unit.gameSelections?.stats?.Invulnerable==null
);
assert.deepEqual([...lordsMissingBase].map(unit=>unit.id),[],'source-backed AM Invulnerable fields must exist before Lords of the Forge');
const farstalkers=catalogs.get('tau-empire').units.find(unit=>unit.id==='unit-kroot-farstalkers');
assert.equal(farstalkers.gameSelections?.stats?.M,undefined,'heterogeneous Farstalker model movement has no single unit-level base value');

function runtimeFor(book){
  const scope={console,addEventListener(){}};scope.window=scope;scope.globalThis=scope;vm.createContext(scope);
  const run=file=>vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),scope,{filename:file});
  for(const file of [`books/${book}/scripts/roster-data.js`,'roster-guides/points-data.js','books/shared/effect-contract-runtime.js','books/shared/roster-parser.js','books/shared/roster-context.js'])run(file);
  return scope;
}

{
  const runtime=runtimeFor('adeptus-mechanicus'),catalog=runtime.WH_BOOK_ROSTER_CATALOG,pointsCatalog=runtime.WH_POINTS_CATALOG['adeptus mechanicus'];
  const fixture=createRosterFixture({catalog,pointsCatalog,id:'lords-invulnerable-set',detachmentId:'detachment-lords-of-the-forge',units:[
    {datasheetId:'unit-tech-priest-dominus',instanceId:'parsed-unit-1',quantity:1},
    {datasheetId:'unit-skitarii-rangers',instanceId:'parsed-unit-2',quantity:10}
  ]});
  const roster=runtime.WHRosterParser.parse(fixture.record.sourceText),projection=runtime.WHArmyRosterContext.project({catalog,roster,record:fixture.record,provider:{gameEffects:context=>runtime.WHEffectContractRuntime.project(context)}}),dominus=projection.game.units[0],rangers=projection.game.units[1];
  const effect=dominus.effects.find(item=>item.id==='lords-invulnerable');
  assert.equal(effect?.base,'5+','Lords of the Forge uses the canonical prior invulnerable-save value');
  assert.equal(effect?.effective,'4+','Lords of the Forge materializes its canonical SET value');
  assert.equal(dominus.effective.stats.Invulnerable,'4+','eligible Tech-Priest receives the source-required invulnerable save');
  assert.equal(rangers.effects.some(item=>item.id==='lords-invulnerable'),false,'unrelated unit does not receive Lords of the Forge');
  assert.equal(rangers.effective.stats.Invulnerable,'5+','unrelated unit retains its canonical invulnerable save');
}
const shieldId='unit-terminator-assault-squad-wargear-ability-7aab29187a',unitId='unit-terminator-assault-squad';
for(const book of ['space-marines','dark-angels','blood-angels']){
  const runtime=runtimeFor(book),catalog=runtime.WH_BOOK_ROSTER_CATALOG,pointsKey=catalog.book.title.toLowerCase().replace(/[^a-z0-9]+/g,' ').trim(),pointsCatalog=runtime.WH_POINTS_CATALOG[pointsKey];
  const unit=catalog.units.find(item=>item.id===unitId),ability=unit.gameSelections.wargearAbilities.find(item=>item.id===shieldId);
  assert.equal(ability.id,shieldId,`${book}: persistent Storm Shield identity`);
  const fixture=createRosterFixture({catalog,pointsCatalog,id:`${book}-storm-shield`,units:[
    {datasheetId:unitId,instanceId:'parsed-unit-1',quantity:5,selectionIds:[`${unitId}-selection-thunder-hammer`,`${unitId}-selection-storm-shield`]},
    {datasheetId:unitId,instanceId:'parsed-unit-2',quantity:5,selectionIds:[`${unitId}-selection-twin-lightning-claws`]}
  ]});
  const roster=runtime.WHRosterParser.parse(fixture.record.sourceText),projection=runtime.WHArmyRosterContext.project({catalog,roster,record:fixture.record,provider:{gameEffects:context=>runtime.WHEffectContractRuntime.project(context)}}),selected=projection.game.units[0],plain=projection.game.units[1];
  const selectedEffect=selected.effects.find(effect=>effect.source?.id===shieldId&&effect.targetId==='W');
  assert.ok(selected.selection.loadout.selectedWargearAbilityIds.includes(shieldId),`${book}: shield selected canonically`);
  assert.equal(selectedEffect?.base,'3',`${book}: Storm Shield canonical base Wounds`);
  assert.equal(selectedEffect?.effective,'4',`${book}: Storm Shield effective Wounds`);
  assert.equal(selected.effective.stats.W,'4',`${book}: Storm Shield selected runtime Wounds`);
  assert.equal(plain.selection.loadout.selectedWargearAbilityIds.includes(shieldId),false,`${book}: shield absent`);
  assert.equal(plain.effects.some(effect=>effect.source?.id===shieldId),false,`${book}: unselected shield inactive`);
  assert.equal(plain.effective.stats.W,'3',`${book}: unselected canonical base Wounds`);
  const wrong=createCatalogGameUnit({catalog,datasheetId:'unit-intercessor-squad',instanceId:'wrong-unit'});wrong.selection.loadout.selectedWargearAbilityIds=[shieldId];
  const wrongEffects=runtime.WHEffectContractRuntime.project({gameUnit:wrong,gameUnits:[wrong],byInstance:new Map([['wrong-unit',wrong]]),enhancements:[]});
  assert.equal(wrongEffects.some(effect=>effect.source?.id===shieldId),false,`${book}: wrong unit must not receive Storm Shield`);
}

console.log('Characteristic effect runtime target QA: PASS (83 effective / 57 unique stat operations; 3 explicit modifier-only operations; 0 unresolved missing base fields; 4 excluded dependency target shapes classified; AM Invulnerable 5+ -> 4+; Storm Shield 3 -> 4 in SM/DA/BA).');

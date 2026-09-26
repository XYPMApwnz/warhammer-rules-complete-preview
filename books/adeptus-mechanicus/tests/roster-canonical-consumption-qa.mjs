import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
import {buildAdeptusMechanicusEffectiveModelInput} from '../tools/canonical-source-adapter.mjs';
import {createCanonicalBuildContext} from '../../shared/tools/canonical-build-contract.mjs';
import {assertRosterBaseStatProjection,canonicalBaseStatsForUnit,projectRosterBaseStats} from '../../shared/tools/canonical-unit-stats.mjs';
import {assertRosterUnitGameplayProjection,createRosterCatalog} from '../../shared/tools/build-roster-catalog.mjs';
import {createRosterFixture} from '../../../tests/helpers/roster-fixtures.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../..');
const configPath=path.join(root,'books','adeptus-mechanicus','book.config.json');
const context=createCanonicalBuildContext({configPath,args:['--check'],repo:root});
const model=buildAdeptusMechanicusEffectiveModelInput(context);
const catalog=createRosterCatalog({
  config:context.config,
  units:model.units,
  detachments:model.detachments,
  relationGraphs:model.relationGraphs,
  enhancementContracts:[],
  effectContracts:model.effectContracts
});
const clone=value=>structuredClone(value);
const unit=(records,id)=>records.find(item=>item.id===id);

const sourceCompositions=model.units.filter(item=>Array.isArray(item.composition)?item.composition.length:String(item.composition||'').trim()).length;
assert.equal(sourceCompositions,34,'all certified AM datasheets require source-backed composition');
assert.equal(catalog.units.filter(item=>item.gameSelections.models.length).length,34,'all AM compositions must project canonical model identities');

for(const [id,titles] of [
  ['unit-cybernetica-datasmith',['Cybernetica Datasmith']],
  ['unit-skitarii-rangers',['Skitarii Ranger Alpha','Skitarii Ranger']],
  ['unit-thulia-ghuld',['Archmagos Terminus Thulia Ghuld']],
  ['unit-hastarii-exterminators',['Hastarii Exterminator Alpha','Hastarii Exterminator']]
])assert.deepEqual(unit(catalog.units,id).gameSelections.models.map(item=>item.title),titles,`${id}: exact canonical model composition`);

const servitors=unit(catalog.units,'unit-servitor-battleclade').gameSelections.models;
assert.equal(servitors.length,3,'Servitor Battleclade structured composition remains intact');
assert.deepEqual(servitors.find(item=>item.title==='Servitor Underseer')?.intrinsicKeywords,['TECH-PRIEST'],'Servitor Underseer model scope remains intact');

const missingModel=clone(catalog.units);
unit(missingModel,'unit-cybernetica-datasmith').gameSelections.models=[];
assert.throws(()=>assertRosterUnitGameplayProjection(model.units,model.relationGraphs,missingModel),/missing roster model/,'missing canonical model identity passed projection validation');

const wrongComposition=clone(catalog.units);
unit(wrongComposition,'unit-skitarii-rangers').gameSelections.models.pop();
assert.throws(()=>assertRosterUnitGameplayProjection(model.units,model.relationGraphs,wrongComposition),/missing roster model/,'wrong canonical model composition passed projection validation');

const invulnerableUnits=model.units.filter(item=>String(item.invulnerable||'').trim());
assert.equal(invulnerableUnits.length,29,'certified AM INSV source denominator');
for(const sourceUnit of invulnerableUnits){
  const actual=unit(catalog.units,sourceUnit.id).gameSelections.stats.Invulnerable;
  assert.equal(actual,sourceUnit.invulnerable,`${sourceUnit.id}: canonical INSV projection`);
}
assert.equal(catalog.units.reduce((sum,item)=>sum+Object.keys(item.gameSelections.stats).length,0),233,'all certified AM characteristics project to Roster');

const missingInvulnerable=clone(catalog.units);
delete unit(missingInvulnerable,'unit-skitarii-rangers').gameSelections.stats.Invulnerable;
assert.throws(()=>assertRosterBaseStatProjection(model.units,missingInvulnerable,{effectContracts:model.effectContracts}),/conflicting canonical base stats/,'missing INSV passed projection validation');

const canonicalDirection=clone(model.units),canonicalRangers=unit(canonicalDirection,'unit-skitarii-rangers');
canonicalRangers.invulnerable='4+';
assert.equal(unit(projectRosterBaseStats(canonicalDirection,catalog.units,{effectContracts:model.effectContracts}),'unit-skitarii-rangers').gameSelections.stats.Invulnerable,'4+','canonical INSV did not control regenerated Roster state');
assert.throws(()=>canonicalBaseStatsForUnit({...canonicalRangers,profiles:[],stats:{...canonicalRangers.stats,Invulnerable:'6+'}}),/conflicting canonical Invulnerable/,'conflicting INSV owners did not fail closed');

const runtime={console,addEventListener(){}};runtime.window=runtime;runtime.globalThis=runtime;
const load=file=>vm.runInNewContext(fs.readFileSync(path.join(root,file),'utf8'),runtime,{filename:file});
load('roster-guides/points-data.js');
load('books/shared/effect-contract-runtime.js');
load('books/shared/roster-parser.js');
load('books/shared/roster-context.js');
runtime.WH_BOOK_ROSTER_CATALOG=catalog;
const fixture=createRosterFixture({
  catalog,
  pointsCatalog:runtime.WH_POINTS_CATALOG['adeptus mechanicus'],
  id:'am-duplicate-datasmith-composition',
  units:[
    {datasheetId:'unit-cybernetica-datasmith',instanceId:'parsed-unit-1',quantity:1},
    {datasheetId:'unit-cybernetica-datasmith',instanceId:'parsed-unit-2',quantity:1}
  ]
});
const parsed=runtime.WHRosterParser.parse(fixture.record.sourceText);
const projected=runtime.WHArmyRosterContext.project({catalog,roster:parsed,record:fixture.record,provider:{gameEffects:()=>[]}}).game.units;
assert.equal(projected.length,2,'duplicate physical Datasmith instances');
for(const item of projected){
  assert.equal(item.selection.composition.state,'resolved',`${item.identity.instanceId}: physical composition state`);
  assert.equal(JSON.stringify(item.selection.composition.models.map(model=>[model.quantity,model.sourceText])),JSON.stringify([[1,'Cybernetica Datasmith']]),`${item.identity.instanceId}: physical composition identity`);
}
assert.notEqual(projected[0].selection.composition,projected[1].selection.composition,'physical composition state must remain instance-local');
assert.equal(Object.isFrozen(projected[0].selection.composition.models),true,'physical composition must be immutable');
assert.equal(Object.isFrozen(projected[1].selection.composition.models),true,'duplicate physical composition must be immutable');

console.log('Adeptus Mechanicus Roster canonical consumption QA: PASS (34/34 compositions; 233/233 characteristics; 4/4 mutations killed; duplicate instances isolated).');

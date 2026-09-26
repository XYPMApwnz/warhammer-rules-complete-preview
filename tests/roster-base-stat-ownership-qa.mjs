import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
import {buildCanonicalBook} from '../books/shared/tools/build-army-book.mjs';
import {createCanonicalBuildContext} from '../books/shared/tools/canonical-build-contract.mjs';
import {assertRosterBaseStatProjection,projectRosterBaseStats} from '../books/shared/tools/canonical-unit-stats.mjs';
import {createEffectiveBookModel,validateEffectiveBookModel} from '../books/shared/tools/effective-book-model.mjs';
import {createRosterFixture} from './helpers/roster-fixtures.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const books=['death-guard','adeptus-mechanicus','tyranids','tau-empire','emperors-children','chaos-space-marines','space-marines','dark-angels','blood-angels'];
const clone=value=>structuredClone(value);
const loadScript=(scope,file)=>vm.runInNewContext(fs.readFileSync(path.join(root,file),'utf8'),scope,{filename:file});
const loadCatalog=bookId=>{const scope={};scope.window=scope;scope.globalThis=scope;loadScript(scope,`books/${bookId}/scripts/roster-data.js`);return scope.WH_BOOK_ROSTER_CATALOG;};

const models=new Map(),catalogs=new Map();
for(const bookId of books){
  const context=createCanonicalBuildContext({configPath:path.join(root,'books',bookId,'book.config.json'),args:['--check'],repo:root});
  const model=(await buildCanonicalBook(context,{projectionOnly:true})).effectiveBookModel,catalog=model.rosterCatalog||loadCatalog(bookId);
  assertRosterBaseStatProjection(model.units,catalog.units,{label:`${bookId} production roster base-stat projection`,effectContracts:model.effectContracts});
  models.set(bookId,model);catalogs.set(bookId,catalog);
}
const statCopies=[...catalogs.values()].flatMap(catalog=>catalog.units.map(unit=>unit.gameSelections.stats));
assert.equal(statCopies.length,540,'all nine roster base-stat projections');
assert.equal(statCopies.reduce((sum,stats)=>sum+Object.keys(stats).length,0),3796,'all nine roster base-stat cells including 29 canonical AM invulnerable saves');

const tau=models.get('tau-empire'),fireblade=tau.units.find(unit=>unit.id==='unit-cadre-fireblade');
assert.ok(fireblade&&tau.rosterCatalog,'T’au effective model contains the canonical Fireblade and roster projection');
const canonicalW=()=>fireblade.profiles[0].stats.W,rosterFireblade=model=>model.rosterCatalog.units.find(unit=>unit.id===fireblade.id);
assert.equal(canonicalW(),'3','accepted Fireblade canonical Wounds');
assert.equal(rosterFireblade(tau).gameSelections.stats.W,'3','accepted Fireblade derived roster Wounds');

const rosterPoison=clone(tau);
rosterFireblade(rosterPoison).gameSelections.stats.W='99';
assert.throws(()=>validateEffectiveBookModel(rosterPoison),/conflicting canonical base stats/,'contradictory roster Wounds passed validation');
const canonicalRoster=createEffectiveBookModel(rosterPoison);
assert.equal(rosterFireblade(canonicalRoster).gameSelections.stats.W,'3','canonical Wounds did not replace roster poison');

const canonicalDirection=clone(tau),canonicalDirectionUnit=canonicalDirection.units.find(unit=>unit.id===fireblade.id);
canonicalDirectionUnit.profiles[0].stats.W='7';
assert.equal(rosterFireblade(canonicalDirection).gameSelections.stats.W,'3','canonical-direction fixture must retain a stale roster copy before validation');
assert.throws(()=>validateEffectiveBookModel(canonicalDirection),/conflicting canonical base stats/,'stale roster Wounds passed validation');
const canonicalSeven=createEffectiveBookModel(canonicalDirection);
assert.equal(rosterFireblade(canonicalSeven).gameSelections.stats.W,'7','canonical Wounds did not control the derived roster projection');

const runtime={console,addEventListener(){}};runtime.window=runtime;runtime.globalThis=runtime;
loadScript(runtime,'roster-guides/points-data.js');
loadScript(runtime,'books/shared/effect-contract-runtime.js');
loadScript(runtime,'books/tau-empire/scripts/roster-filter.js');
loadScript(runtime,'books/shared/roster-parser.js');
loadScript(runtime,'books/shared/roster-context.js');
const pointsCatalog=runtime.WH_POINTS_CATALOG['t au empire'];
const projectFireblade=(model,provider=runtime.TAURosterSemantics)=>{
  const catalog=model.rosterCatalog;runtime.WH_BOOK_ROSTER_CATALOG=catalog;
  const fixture=createRosterFixture({catalog,pointsCatalog,id:'roster-stat-owner',units:[{datasheetId:'unit-cadre-fireblade',instanceId:'parsed-unit-1',quantity:1,selectionIds:['unit-cadre-fireblade-selection-shield-drone']} ]});
  const roster=runtime.WHRosterParser.parse(fixture.record.sourceText);
  return runtime.WHArmyRosterContext.project({catalog,roster,record:fixture.record,provider:{gameEffects:provider.projectEffects||provider.gameEffects}}).game.units[0];
};
const threePlusOne=projectFireblade(canonicalRoster),sevenPlusOne=projectFireblade(canonicalSeven);
assert.equal(threePlusOne.effective.stats.W,'4','canonical W=3 plus Shield Drone did not produce W=4');
assert.equal(sevenPlusOne.effective.stats.W,'8','canonical W=7 plus Shield Drone did not produce W=8');
for(const [result,base,effective] of [[threePlusOne,'3','4'],[sevenPlusOne,'7','8']])assert.ok(result.effects.some(effect=>effect.id==='shield-drone-wounds'&&effect.base===base&&effect.effective===effective),'actual Shield Drone effect did not resolve against canonical base Wounds');

const otherStats=projectFireblade(canonicalRoster,{projectEffects:()=>[
  {id:'move-set-control',component:'stat',operation:'set',targetId:'M',to:'10"',state:'active',certainty:'current'},
]});
assert.equal(otherStats.effective.stats.M,'10"','characteristic-set control did not use canonical-derived base stats');
const bestValueContract={
  canonicalRecordId:'tau-empire-fixture-best-invulnerable',sourceKind:'selected-wargear',sourceBookId:'tau-empire',effectiveBookIds:['tau-empire'],scope:'owner',
  selector:{selectedWargearAbilityIds:['unit-cadre-fireblade-wargear-ability-bc6aabc321']},
  clauses:[{selector:{},conditions:[],operations:[{id:'invulnerable-improve-control',type:'CHARACTERISTIC_SET',canonicalTarget:'Invulnerable',parameters:{to:'5+',direction:'lower-is-better'}}]}],
  timingState:{kind:'CURRENT_ROSTER_STATE'},stackingPolicy:'best-value',source:{sourceId:'fixture',locator:'tests/roster-base-stat-ownership-qa.mjs'},confidence:'VERIFIED_FROZEN'
};
const withInvulnerable=(value)=>{const input=clone(tau),unit=input.units.find(item=>item.id===fireblade.id);unit.profiles[0].stats.Invulnerable=value;const model=createEffectiveBookModel(input);model.rosterCatalog.effectContracts=[...model.rosterCatalog.effectContracts,bestValueContract];return model;};
const betterBase=projectFireblade(withInvulnerable('4+')),worseBase=projectFireblade(withInvulnerable('6+'));
assert.equal(betterBase.effective.stats.Invulnerable,'4+','best-value control downgraded the canonical invulnerable save');
assert.equal(worseBase.effective.stats.Invulnerable,'5+','best-value control ignored a canonical improvement');

const tauCatalog=tau.rosterCatalog,firebladeIndex=tauCatalog.units.findIndex(unit=>unit.id===fireblade.id);
const unknown=clone(tauCatalog.units);unknown[firebladeIndex].id='unit-unknown-stat-profile';
assert.throws(()=>projectRosterBaseStats(tau.units,unknown),/unknown canonical stat-profile scope/,'unknown stat-profile scope did not fail');
const duplicate=clone(tauCatalog.units);duplicate[firebladeIndex+1].id=fireblade.id;
assert.throws(()=>projectRosterBaseStats(tau.units,duplicate),/duplicate roster stat-profile identity/,'duplicate stat-profile scope did not fail');
const wrongScope=clone(tauCatalog.units),otherUnit=wrongScope.find(unit=>unit.id!==fireblade.id&&unit.gameSelections.stats.W!==rosterFireblade(tau).gameSelections.stats.W);
assert.ok(otherUnit,'wrong stat-profile scope control unit');
wrongScope[firebladeIndex].gameSelections.stats=clone(otherUnit.gameSelections.stats);
assert.throws(()=>assertRosterBaseStatProjection(tau.units,wrongScope),/conflicting canonical base stats/,'wrong-profile stats entered the Fireblade scope');

console.log('Roster base-stat ownership QA: PASS (540 derived maps; 3796 cells; Astra W=99 and canonical W=7 directions killed; actual Shield Drone runtime 4/8).');

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
import {mergeExactPointEnhancement,resolveArmyRuleBindings,resolvePointEnhancement} from '../books/shared/tools/canonical-join-contract.mjs';
import {createRosterCatalog} from '../books/shared/tools/build-roster-catalog.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const json=relative=>JSON.parse(fs.readFileSync(path.join(root,relative),'utf8'));

const armyBinding={id:'army-rule-pact-of-excess',sourceId:'army-rule-pact-of-excess'};
const armySource={id:'army-rule-pact-of-excess',title:'Arbitrary renamed rule',text:'Accepted semantic text'};
const resolvedArmy=resolveArmyRuleBindings([armyBinding],[armySource,{id:'other-rule',title:'ARBITRARY RENAMED RULE',text:'Other semantics'}],{label:'D4 Army rule'});
assert.equal(resolvedArmy[0].source.id,armyBinding.sourceId,'display-title collision changed exact Army rule identity');
assert.equal(resolvedArmy[0].source.text,armySource.text,'Army rule text changed after display rename');
assert.throws(()=>resolveArmyRuleBindings([{...armyBinding,sourceId:'unknown-rule'}],[armySource]),/unknown source ID/,'unknown Army rule identity did not fail closed');
assert.throws(()=>resolveArmyRuleBindings([armyBinding,armyBinding],[armySource]),/duplicate canonical ID/,'duplicate Army rule identity did not fail');
assert.throws(()=>resolveArmyRuleBindings([armyBinding],[armySource,{...armySource,title:'Conflicting title'}]),/conflicting source ID/,'conflicting duplicate Army rule owner did not fail');

const renamedEnhancement={id:'enhancement-strike-swiftly',title:'Arbitrary renamed Enhancement'};
const exactPoints={id:'enhancement-strike-swiftly',detachmentId:'montka',title:'Strike Swiftly',value:45,pointsSource:{label:'accepted'}};
const titleCollision={id:'enhancement-other',detachmentId:'montka',title:'Arbitrary renamed Enhancement',value:999};
const exactMatch=resolvePointEnhancement(renamedEnhancement,'montka',[titleCollision,exactPoints],{label:'D4 Enhancement points'});
assert.equal(exactMatch,exactPoints,'Enhancement display title overrode exact scoped identity');
assert.deepEqual(mergeExactPointEnhancement(renamedEnhancement,exactMatch),{...renamedEnhancement,value:45,pointsSource:{label:'accepted'}},'exact Enhancement value was gated by display title');
assert.equal(resolvePointEnhancement(renamedEnhancement,'wrong-detachment',[exactPoints],{label:'D4 Enhancement points'}),null,'wrong Detachment scope cross-matched an Enhancement');

const baPack=json('books/blood-angels/content/blood-angels-faction-pack.en.json'),baPoints=json('books/blood-angels/content/blood-angels-points.en.json');
const baDetachment=baPack.detachments.find(item=>item.id==='rage-cursed-onslaught'),baSource=baDetachment.enhancements.find(item=>item.id==='sanguinary-tear-aura'),baPoint=baPoints.enhancements.find(item=>item.id==='enhancement-sanguinary-tear-aura');
const baExact=resolvePointEnhancement(baSource,baDetachment.id,[{...baPoint,detachmentId:baDetachment.id}],{label:'BA Sanguinary Tear'});
assert.equal(mergeExactPointEnhancement(baSource,baExact,{qualified:true}).value,35,'Sanguinary Tear exact 35-point identity was lost to title drift');

const sandbox={window:{},URL,URLSearchParams};sandbox.window.window=sandbox.window;
vm.runInNewContext(fs.readFileSync(path.join(root,'books/shared/roster-context.js'),'utf8'),sandbox,{filename:'roster-context.js'});
const rosterApi=sandbox.window.WHArmyRosterContext;
const profile=(id,title,s)=>({id,title,mode:'ranged',characteristics:{Range:'24"',A:'1',BS:'3+',S:String(s),AP:'0',D:'1',Keywords:''}});
const selection=(id,title,profileIds)=>({id,title,aliases:[title],kind:'weapon',profileIds,wargearAbilityIds:[]});
const sourceUnit={id:'unit-example',title:'Example Unit',sourceBookId:'fixture',intrinsicKeywords:['INFANTRY'],stats:{M:'6"'},weapons:[{id:'profile-plasma',name:'Arbitrary renamed profile',mode:'ranged',range:'24"',a:'1',skill:'3+',s:'8',ap:'0',d:'1'},{id:'profile-bolt',name:'Plasma false title',mode:'ranged',range:'24"',a:'1',skill:'3+',s:'4',ap:'0',d:'1'}]};
const membership={id:'weapon-class-plasma',unitId:'unit-example',profileIds:['profile-plasma']};
const familyMembership={id:'unit-example-weapon-family-exact',unitId:'unit-example',title:'Arbitrary family label',profileIds:['profile-plasma']};
const built=createRosterCatalog({config:{id:'fixture',title:'Fixture',factionKeyword:'FIXTURE',rosterCatalog:{weaponClassMemberships:[membership],weaponFamilyMemberships:[familyMembership]}},units:[sourceUnit],detachments:[{id:'detachment-exact',title:'Exact'}]});
assert.deepEqual(built.units[0].gameSelections.weaponClasses,[{id:'weapon-class-plasma',profileIds:['profile-plasma']}],'display title changed canonical plasma membership');
assert.deepEqual(built.units[0].gameSelections.weaponFamilies.find(item=>item.id===familyMembership.id).profileIds,['profile-plasma'],'display title changed canonical weapon-family membership');
assert.throws(()=>createRosterCatalog({config:{id:'fixture',title:'Fixture',rosterCatalog:{weaponClassMemberships:[{...membership,profileIds:['profile-bolt-missing']}]}},units:[sourceUnit]}),/unknown profile/,'unknown canonical weapon class member did not fail');
assert.throws(()=>createRosterCatalog({config:{id:'fixture',title:'Fixture',rosterCatalog:{weaponClassMemberships:[membership,membership]}},units:[sourceUnit]}),/duplicate weapon class membership/,'duplicate canonical weapon class membership did not fail');
const catalogUnit={...built.units[0],gameSelections:{...built.units[0].gameSelections,selections:[selection('select-plasma','Selected weapon',['profile-plasma']),selection('select-bolt','Decoy weapon',['profile-bolt'])],weaponProfiles:[profile('profile-plasma','Arbitrary renamed profile',8),profile('profile-bolt','Plasma false title',4)]}};
const catalog={schema:rosterApi.CATALOG_SCHEMA,book:{id:'fixture',title:'Fixture',factionKeyword:'FIXTURE',dependencies:[]},units:[catalogUnit],detachments:[{id:'detachment-exact',title:'Exact'}],enhancements:[]};
const effectFor=profileIds=>()=>[{id:'exact-profile-effect',component:'weapon',operation:'add-stat',targetId:'weapon-class-plasma',profileIds,stat:'S',delta:1,state:'active',certainty:'current'}];
const project=weapon=>rosterApi.project({catalog,roster:{faction:'FIXTURE',detachments:[{id:'detachment-exact'}],units:[{id:'physical-1',canonicalUnitId:'unit-example',name:'Renamed unit',wargear:weapon}],enhancements:[]},record:{id:'fixture'},provider:{gameEffects:effectFor(['profile-plasma'])}}).game.units[0];
const plasma=project('Selected weapon'),plasmaProfile=plasma.effective.weaponProfiles.find(item=>item.id==='profile-plasma');
assert.equal(plasmaProfile.values.S,'9','renamed canonical plasma profile lost its exact effect');
assert.deepEqual([...plasma.effects[0].targets.map(item=>item.profileId)],['profile-plasma'],'renamed profile changed exact effect target identity');
const decoy=project('Decoy weapon'),boltProfile=decoy.effective.weaponProfiles.find(item=>item.id==='profile-bolt');
assert.equal(boltProfile.values.S,'4','plasma-looking display title acquired an effect');
assert.deepEqual([...decoy.effects[0].targets],[],'false display title produced an effect target');
assert.throws(()=>rosterApi.project({catalog:{...catalog,units:[{...catalogUnit,gameSelections:{...catalogUnit.gameSelections,selections:[selection('select-duplicate','Duplicate',['duplicate'])],weaponProfiles:[profile('duplicate','One',1),profile('duplicate','Two',2)]}}]},roster:{faction:'FIXTURE',detachments:[{id:'detachment-exact'}],units:[{id:'physical-1',canonicalUnitId:'unit-example',wargear:'Duplicate'}],enhancements:[]},provider:{gameEffects:effectFor(['duplicate'])}}),/duplicate canonical weapon profile ID/,'duplicate canonical weapon profile identity did not fail');
assert.equal(rosterApi.project({catalog,roster:{faction:'FIXTURE',detachments:[{id:'unknown-detachment',name:'Exact'}],units:[{id:'physical-1',canonicalUnitId:'unit-example'}],enhancements:[]}}).context.status,'unknown','unknown explicit Detachment ID fell through to its display title');

const buildSource=fs.readFileSync(path.join(root,'books/shared/tools/build-army-book.mjs'),'utf8');
const runtimeSource=fs.readFileSync(path.join(root,'books/shared/roster-context.js'),'utf8');
const providerSource=fs.readFileSync(path.join(root,'books/extensions/book-roster-enhancement-providers.js'),'utf8');
const rosterBuilderSource=fs.readFileSync(path.join(root,'books/shared/tools/build-roster-catalog.mjs'),'utf8');
assert.doesNotMatch(buildSource,/config\.armyRules|pointTitleKey\(/,'authoritative title join remains in shared publication');
assert.doesNotMatch(runtimeSource,/target==='plasma'|target\.startsWith\('family:'\)/,'runtime weapon targeting still reads display titles');
assert.doesNotMatch(rosterBuilderSource,/\bplasma\b.*profile\.name|profile\.name.*\bplasma\b/i,'weapon class membership still derives from a display title');
assert.doesNotMatch(providerSource,/candidates=.*normalize\(item\.title\)/,'downstream Enhancement provider still re-resolves display titles');
console.log('Authoritative non-ID join QA: PASS (Army rule, scoped Enhancement, profile membership, collision and fail-closed controls).');

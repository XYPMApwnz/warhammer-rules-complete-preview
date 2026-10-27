import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
import {catalog as builtCatalog,resolveEnhancementOwner} from '../books/shared/points/build.mjs';
import {createRosterFixture} from './helpers/roster-fixtures.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const sources=new Map();
const read=file=>{if(!sources.has(file))sources.set(file,fs.readFileSync(path.join(root,file),'utf8'));return sources.get(file);};
const json=file=>JSON.parse(read(file));
const local=value=>value===undefined?undefined:JSON.parse(JSON.stringify(value));
const normalize=value=>String(value||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const bookCatalog=book=>{const scope={window:{}};vm.runInNewContext(read('books/'+book+'/scripts/roster-data.js'),scope);return scope.window.WH_BOOK_ROSTER_CATALOG;};
const anchors=[
  {book:'space-marines',unit:'unit-ancient',id:'firestorm-assault-force-war-tempered-artifice',detachmentId:'firestorm-assault-force'},
  {book:'dark-angels',unit:'unit-ancient',id:'enhancement-weapons-of-the-first-legion',detachmentId:'unforgiven-task-force'},
  {book:'blood-angels',unit:'unit-captain-with-jump-pack',id:'enhancement-archangels-shard',detachmentId:'the-angelic-host'}
];
function lookupChecks(resolve=resolveEnhancementOwner){
  for(const anchor of anchors){
    const book=bookCatalog(anchor.book),canonical=book.enhancements.find(e=>e.id===anchor.id),detachment=book.detachments.find(e=>e.id===anchor.detachmentId);
    const point=json('books/'+anchor.book+'/content/'+anchor.book+'-points.en.json').enhancements.find(e=>normalize(e.title)===normalize(canonical.title)&&normalize(e.detachment)===normalize(detachment.title));
    assert.ok(point,anchor.book+': exact fixture point record');
    const contracts=json('books/'+anchor.book+'/content/'+anchor.book+'-related-rules.en.json').enhancements;
    const result=resolve(point,book,contracts);
    assert.deepEqual(local(result.owner),local(canonical.owner),anchor.book+': owner form preserved');
    assert.equal(result.canonicalEnhancementId,canonical.id,anchor.book+': exact canonical identity');
    assert.notEqual(result.sourceLimited,true,anchor.book+': owner contract must not become sourceLimited');
    const entries=Object.values(builtCatalog[normalize(book.book.title)].enhancements).flat();
    assert.ok(entries.some(e=>e.owner&&!e.sourceLimited),anchor.book+': sourceLimited cannot cover every owner contract');
  }
  const sm=bookCatalog('space-marines'),contracts=json('books/space-marines/content/space-marines-related-rules.en.json').enhancements;
  const fire=sm.enhancements.find(e=>e.id==='firestorm-assault-force-war-tempered-artifice'),forge=sm.enhancements.find(e=>e.id==='war-tempered-artifice');
  const point=json('books/space-marines/content/space-marines-points.en.json').enhancements.find(e=>e.id==='enhancement-war-tempered-artifice'&&normalize(e.detachment)==='forgefather s seekers');
  assert.ok(fire&&forge&&point,'retained same-name different-Detachment fixtures');
  const colliding={...sm,enhancements:[fire,forge]};
  assert.equal(resolve(point,colliding,contracts).canonicalEnhancementId,forge.id,'collision must use selected Detachment, not first match');
  assert.equal(resolve(point,{...sm,enhancements:[forge,fire]},contracts).canonicalEnhancementId,forge.id,'input order cannot alter identity');
  const ambiguous=resolve(point,{...sm,enhancements:[forge,{...forge}]},contracts);
  assert.equal(ambiguous.sourceLimited,true,'duplicate identity stays ambiguous');
  assert.equal(ambiguous.owner,undefined,'ambiguous identity cannot inherit first owner');
  const titleOnly=resolve({...point,id:'enhancement-unrelated-identity'},sm,contracts);
  assert.equal(titleOnly.owner,undefined,'same title is not identity');
  const missingDetachment=resolve({...point,detachment:'Not a known Detachment'},sm,contracts);
  assert.equal(missingDetachment.owner,undefined,'unknown Detachment fails closed');
  const ec=bookCatalog('emperors-children'),ecContracts=json('books/emperors-children/content/emperors-children-related-rules.en.json').enhancements;
  assert.equal(ec.enhancements.length,34,'EC roster catalog must publish one canonical record per Enhancement');
  assert.equal(new Set(ec.enhancements.map(item=>normalize(item.title))).size,34,'EC legacy records must not duplicate scoped canonical Enhancements');
  const empyric=ec.enhancements.filter(item=>normalize(item.title)==='empyric suffusion');
  assert.equal(empyric.length,1,'Empyric Suffusion must have one canonical identity');
  assert.equal(empyric[0].detachmentId,'carnival-of-excess','Empyric Suffusion must retain exact Detachment ownership');
  assert.equal(empyric[0].id,'enhancement-empyric-suffusion','Empyric Suffusion must retain its exact canonical owner identity');
  assert.equal(ec.enhancements.some(item=>item.id==='empyric-suffusion'),false,'unscoped legacy identity must not bypass Detachment ownership');
  const exalted=json('books/emperors-children/content/emperors-children-points.en.json').enhancements.find(e=>e.id==='enhancement-exalted-patron');
  const legacy=resolve(exalted,ec,ecContracts);
  assert.equal(legacy.canonicalEnhancementId,'enhancement-exalted-patron','exact EC owner identity');
  assert.deepEqual(local(legacy.owner.selector),local(ecContracts['exalted-patron'].roles[0].selector),'roles contract preserved');
  const csm=bookCatalog('chaos-space-marines'),csmContracts=json('books/chaos-space-marines/content/chaos-space-marines-related-rules.en.json').enhancements;
  const thrusters=json('books/chaos-space-marines/content/chaos-space-marines-points.en.json').enhancements.filter(e=>e.id.endsWith('-warp-fuelled-thrusters'));
  assert.equal(thrusters.length,2,'retained CSM Detachment collision');
  for(const point of thrusters){
    const result=resolve(point,csm,csmContracts),key=point.id.includes('dread-talons')?point.id:'warp-fuelled-thrusters';
    assert.deepEqual(local(result.owner.selector),local(csmContracts[key].roles[0].selector),'exact canonical/source ID precedes a different Detachment alias');
  }
  const tyranids=bookCatalog('tyranids'),tyranidContracts=json('books/tyranids/content/tyranids-related-rules.en.json').enhancements,synapticPoint=json('books/tyranids/content/tyranids-points.en.json').enhancements.find(e=>normalize(e.title)==='synaptic strategy'),synaptic=resolve(synapticPoint,tyranids,tyranidContracts);
  assert.equal(synapticPoint.id,'enhancement-synaptic-strategy','renamed MFM Enhancement receives its current identity');
  assert.equal(synapticPoint.sourceId,'enhancement-synaptic-synergy','renamed MFM Enhancement retains its previous source identity');
  assert.equal(synaptic.canonicalEnhancementId,'synaptic-strategy','renamed MFM Enhancement resolves its current canonical owner');
  assert.deepEqual(local(synaptic.owner),local(tyranidContracts['synaptic-strategy'].owner),'renamed MFM Enhancement preserves its owner contract');
}
function loadBook(book,overrides={}){
  const scope={console,URL,URLSearchParams,location:{href:'http://localhost/books/'+book+'/reader.html',pathname:'/books/'+book+'/reader.html',search:''},
    document:{documentElement:{dataset:{bookId:book}},querySelectorAll:()=>[],querySelector:()=>null},
    CustomEvent:class{constructor(type,options){this.type=type;this.detail=options?.detail;}},
    dispatchEvent(){},addEventListener(){}};
  scope.window=scope;scope.globalThis=scope;vm.createContext(scope);
  const run=file=>vm.runInContext(overrides[file]??read(file),scope,{filename:file});
  for(const file of ['books/shared/rule-facts.js','roster-guides/points-data.js','roster-guides/points-validator.js',
    'books/'+book+'/scripts/roster-data.js','books/shared/book-roster-enhancements.js',
    'books/extensions/book-roster-enhancement-providers.js','books/shared/roster-parser.js','books/shared/roster-context.js'])run(file);
  const api=scope.WHArmyRosterContext;
  let provider={keywordProfile:(context,base)=>base,gameEffects:context=>scope.WHBookRosterEnhancements.gameEffects(context)};
  if(book==='emperors-children'){
    let installation;
    scope.WHArmyRosterContext={...api,install:options=>{installation=options;}};
    run('books/emperors-children/scripts/roster-filter.js');
    assert.ok(installation?.provider,'actual EC provider installation captured');
    provider=installation.provider;scope.WHArmyRosterContext=api;
  }
  return {scope,catalog:scope.WH_BOOK_ROSTER_CATALOG,api,provider};
}
function fixture(loaded,unitId,id,detachmentId,raw=false){
  const unit=loaded.catalog.units.find(u=>u.id===unitId),enhancement=loaded.catalog.enhancements.find(e=>e.id===id),detachment=loaded.catalog.detachments.find(e=>e.id===detachmentId);
  assert.ok(unit&&enhancement&&detachment,'stable fixture identities');
  const melee=new Set(unit.gameSelections.weaponProfiles.filter(p=>p.mode==='melee').map(p=>p.id));
  const selection=unit.gameSelections.selections.find(s=>s.kind==='weapon'&&s.profileIds.some(id=>melee.has(id)));
  if(!raw){
    const key=normalize(loaded.catalog.book.title),created=createRosterFixture({catalog:loaded.catalog,pointsCatalog:loaded.scope.WH_POINTS_CATALOG[key],id:'legality-fixture',detachmentId,units:[{datasheetId:unitId,instanceId:'parsed-unit-1',quantity:1,selectionIds:selection?[selection.id]:[],enhancementId:id}]});
    return loaded.scope.WHRosterParser.parse(created.record.sourceText);
  }
  return {faction:loaded.catalog.book.title,detachments:[{name:detachment.title}],units:[
    {id:'physical-owner',canonicalUnitId:unitId,name:unit.title,points:100,quantity:1,
      models:[{quantity:1,name:unit.gameSelections.models[0]?.title||unit.title,loadouts:selection?[{quantity:1,wargear:selection.title}]:[]}]}
  ],enhancements:[{name:enhancement.title,ownerUnitId:'physical-owner',ownerStatus:'resolved',source:'raw/source-unverified'}],warnings:[]};
}
function project(loaded,roster){
  const original=JSON.stringify(roster);
  const result=loaded.api.project({catalog:loaded.catalog,provider:loaded.provider,roster,record:{id:'legality-qa',roster}});
  assert.equal(JSON.stringify(roster),original,'raw assignment preservation');
  assert.equal(result.context.enhancements.length,roster.enhancements.length,'diagnostics remain inspectable');
  return result;
}
const effects=projection=>projection.game.units.flatMap(u=>u.effects.filter(e=>e.source?.kind==='enhancement'&&e.state==='active'));
function legalityChecks(overrides={}){
  for(const anchor of anchors){
    const loaded=loadBook(anchor.book,overrides),roster=fixture(loaded,anchor.unit,anchor.id,anchor.detachmentId);
    let result=project(loaded,roster);
    assert.ok(effects(result).length>0,anchor.book+': verified legal positive active');
    const entries=Object.values(loaded.scope.WH_POINTS_CATALOG[normalize(loaded.catalog.book.title)].enhancements).flat();
    const entry=entries.find(e=>e.canonicalEnhancementId===anchor.id);
    assert.ok(entry?.owner,anchor.book+': generated owner metadata');
    // TEMP VM metadata only: same canonical legality, reduced source coverage.
    entry.sourceLimited=true;
    result=project(loaded,roster);
    assert.equal(result.context.enhancements[0].ownerEligibility,'valid',anchor.book+': sourceLimited legal owner remains valid');
    assert.equal(result.context.enhancements[0].sourceCoverage,'sourceLimited',anchor.book+': source warning retained');
    assert.ok(effects(result).length>0,anchor.book+': sourceLimited legal positive active');
    assert.ok(result.roster.warnings.some(w=>w.includes('source/contract coverage')),anchor.book+': active warning visible');
    assert.ok(effects(result).every(e=>e.source.ownerInstanceId==='parsed-unit-1'),anchor.book+': physical ownership');
  }
  const ec=loadBook('emperors-children',overrides),entry=ec.scope.WH_POINTS_CATALOG['emperor s children'].enhancements['exalted patron'];
  assert.deepEqual(local(entry.owner.selector.unitIds),['unit-lord-exultant'],'Exalted canonical owner is not fabricated');
  entry.sourceLimited=true;
  const lord=fixture(ec,'unit-lord-exultant','enhancement-exalted-patron','court-of-the-phoenician',true);
  const prince=fixture(ec,'unit-daemon-prince-of-slaanesh','enhancement-exalted-patron','court-of-the-phoenician',true);
  assert.equal(Object.hasOwn(lord.enhancements[0],'id'),false,'raw fixture must remain raw');
  assert.equal(Object.hasOwn(prince.enhancements[0],'id'),false,'wrong-bearer fixture must remain raw');
  const legal=project(ec,lord),illegal=project(ec,prince);
  assert.equal(legal.context.enhancements[0].ownerEligibility,'valid','sourceLimited Lord Exultant legality');
  assert.equal(illegal.context.enhancements[0].ownerEligibility,'invalid','sourceLimited Daemon Prince legality');
  assert.equal(legal.context.enhancements[0].sourceCoverage,illegal.context.enhancements[0].sourceCoverage,'same warning / different legality');
  assert.equal(legal.context.enhancements[0].sourceCoverage,'sourceLimited');
  assert.deepEqual(local(legal.roster.warnings.filter(w=>w.includes('source/contract coverage'))),local(illegal.roster.warnings.filter(w=>w.includes('source/contract coverage'))),'identical source warning retained');
  assert.equal(legal.game.units[0].effective.stats.M,'8"','legal Exalted Patron remains active');
  assert.equal(illegal.game.units[0].effective.stats.M,'10"','illegal Exalted Patron cannot alter Move');
  assert.equal(effects(illegal).length,0,'illegal bearer has no active effects');
  assert.equal(illegal.roster.enhancements.length,0,'inactive assignment excluded from activation only');
  assert.equal(illegal.sourceRoster.enhancements.length,1,'inactive raw assignment remains stored');
  delete entry.owner;
  const unknown=project(ec,lord);
  assert.equal(unknown.context.enhancements[0].ownerEligibility,'unresolved','missing owner contract is not invented');
  assert.equal(effects(unknown).length,0,'genuinely unknown legality remains inactive');

  const csm=loadBook('chaos-space-marines',overrides),nightmare=fixture(csm,'unit-chaos-lord-with-jump-pack','enhancement-nightmare-hunt-warp-fuelled-thrusters','nightmare-hunt'),accepted=project(csm,nightmare);
  assert.equal(accepted.enhancementAssessment.assignments[0].catalog?.id,'enhancement-nightmare-hunt-warp-fuelled-thrusters','matching explicit Enhancement identity is assessed');
  assert.equal(accepted.context.enhancements[0].status,'resolved','matching explicit Enhancement identity resolves at runtime');
  assert.equal(accepted.context.enhancements[0].active,true,'matching explicit Enhancement identity remains active');
  const mismatched={...nightmare,enhancements:nightmare.enhancements.map(item=>({...item,id:'enhancement-dread-talons-warp-fuelled-thrusters'}))},rejected=project(csm,mismatched);
  assert.equal(rejected.enhancementAssessment.assignments[0].catalog?.id,'enhancement-dread-talons-warp-fuelled-thrusters','explicit Enhancement ID cannot validate through a same-title Detachment sibling');
  assert.equal(rejected.enhancementAssessment.assignments[0].assessment?.ownerEligibility,'invalid','explicit cross-Detachment Enhancement identity fails eligibility');
  assert.equal(rejected.context.enhancements[0].status,'unresolved','runtime cannot resolve an explicit Enhancement ID outside the selected Detachment');
  assert.equal(rejected.context.enhancements[0].active,false,'cross-Detachment Enhancement identity remains inactive');
  assert.equal(effects(rejected).length,0,'cross-Detachment Enhancement identity has no active effects');
  const unknownId={...nightmare,enhancements:nightmare.enhancements.map(item=>({...item,id:'enhancement-not-a-canonical-id'}))},unknownIdResult=project(csm,unknownId);
  assert.equal(unknownIdResult.enhancementAssessment.assignments[0].catalog,null,'unknown explicit Enhancement ID cannot fall back to its display title');
  assert.equal(unknownIdResult.context.enhancements[0].status,'unresolved','unknown explicit Enhancement ID remains unresolved at runtime');

  const tyranids=loadBook('tyranids',overrides),strategy=fixture(tyranids,'unit-hive-tyrant','synaptic-strategy','subterranean-assault'),legacyStrategy={...strategy,enhancements:strategy.enhancements.map(item=>({...item,id:'enhancement-synaptic-synergy'}))},legacyStrategyResult=project(tyranids,legacyStrategy);
  assert.equal(legacyStrategyResult.enhancementAssessment.assignments[0].catalog?.id,'enhancement-synaptic-strategy','legacy Synaptic Synergy identity resolves to current points owner');
  assert.equal(legacyStrategyResult.enhancementAssessment.assignments[0].assessment?.ownerEligibility,'valid','legacy Synaptic Synergy identity retains canonical owner eligibility');
  assert.equal(legacyStrategyResult.context.enhancements[0].id,'synaptic-strategy','legacy Synaptic Synergy identity resolves to current runtime owner');
  assert.equal(legacyStrategyResult.context.enhancements[0].active,true,'renamed Synaptic Strategy remains active through its legacy identity');
}
function mutations(){
  const validator=read('roster-guides/points-validator.js'),context=read('books/shared/roster-context.js'),tyranidPoints=read('roster-guides/points-data.js'),tyranidRoster=read('books/tyranids/scripts/roster-data.js'),marker="    else if (!enhancement.owner?.selector)",identityFilter="candidates=explicitId?Object.values(records||{}).flat().filter(record).filter(item=>identities(item).includes(explicitId)):(Array.isArray(entry)?entry:[entry]).filter(record)",scopedResolver="if(explicitId)return byId&&(!byId.detachmentId||detachmentIds.has(byId.detachmentId))?byId:null;";
  assert.ok(validator.includes(marker),'status mutation anchor');
  assert.ok(validator.includes(identityFilter),'points identity mutation anchor');
  assert.ok(context.includes(scopedResolver),'runtime identity mutation anchor');
  const scenarios=[
    ['M6_SOURCE_LIMITED_AUTO_INVALID',()=>legalityChecks({'roster-guides/points-validator.js':validator.replace(marker,"    else if (enhancement.sourceLimited) { ownerEligibility = 'invalid'; }\n"+marker)}),/sourceLimited legal owner remains valid/],
    ['M7_SOURCE_LIMITED_AUTO_VALID',()=>legalityChecks({'roster-guides/points-validator.js':validator.replace(marker,"    else if (enhancement.sourceLimited) { ownerEligibility = 'valid'; }\n"+marker)}),/sourceLimited Daemon Prince legality/],
    ['M8_ROLES_ONLY_LOOKUP',()=>lookupChecks(vm.runInNewContext('('+resolveEnhancementOwner.toString().replace('const owned=canonical.owner||contract?.owner;','const owned=null;')+')')),/owner form preserved/],
    ['M9_FIRST_MATCH_IDENTITY',()=>lookupChecks(vm.runInNewContext('('+resolveEnhancementOwner.toString().replace('const candidates=catalog.enhancements.filter(item=>item.detachmentId===detachment.id&&matches(item,detachment.id));','const candidates=catalog.enhancements.filter(item=>matches(item,item.detachmentId)).slice(0,1);')+')')),/collision must use selected Detachment|exact canonical identity/],
    ['M10_EXPLICIT_ID_IGNORED',()=>legalityChecks({'roster-guides/points-validator.js':validator.replace(identityFilter,"candidates=(Array.isArray(entry)?entry:[entry]).filter(record)")}),/explicit Enhancement ID cannot validate through a same-title Detachment sibling/],
    ['M11_CROSS_DETACHMENT_ID_TRUSTED',()=>legalityChecks({'books/shared/roster-context.js':context.replace(scopedResolver,'if(explicitId)return byId;')}),/runtime cannot resolve an explicit Enhancement ID outside the selected Detachment/],
    ['M12_RENAMED_POINTS_ALIAS_DROPPED',()=>legalityChecks({'roster-guides/points-data.js':tyranidPoints.replaceAll(',"sourceId":"enhancement-synaptic-synergy"','')}),/legacy Synaptic Synergy identity resolves to current points owner/],
    ['M13_RENAMED_RUNTIME_ALIAS_DROPPED',()=>legalityChecks({'books/tyranids/scripts/roster-data.js':tyranidRoster.replace('      "sourceId": "enhancement-synaptic-synergy",\n','')}),/legacy Synaptic Synergy identity resolves to current runtime owner/]
  ];
  for(const [name,run,intended] of scenarios){
    let killed=false;
    try{run();}catch(error){assert.match(error.message,intended,name+': intended contract');killed=true;}
    assert.ok(killed,name+': mutation survived');
    console.log(name+': KILLED');
  }
}
lookupChecks();
legalityChecks();
const generated={window:{}};
vm.runInNewContext(read('roster-guides/points-data.js'),generated);
assert.deepEqual(local(generated.window.WH_POINTS_CATALOG),local(builtCatalog),'deterministic points owner metadata must be current');
console.log('RA02 legality/source coverage: PASS (owner + roles, scoped identities, ambiguity, same-warning legal/illegal, raw preservation)');
if(process.argv.includes('--mutations'))mutations();

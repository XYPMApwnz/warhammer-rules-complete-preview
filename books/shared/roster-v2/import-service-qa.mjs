import assert from 'node:assert/strict';
import {createRosterImportService} from './import-service.mjs';

// Independent synthetic registries; no army factual snapshot or effect module.
const book=id=>({bookId:id,entities:[
  {id:id+'/det',kind:'DETACHMENT',data:{title:'Sample Formation'}},
  {id:id+'/unit',kind:'DATASHEET',data:{title:'Sample Crew',profileIds:[id+'/a',id+'/b'],weaponIds:[id+'/weapon']}},
  {id:id+'/a',parentId:id+'/unit',kind:'PROFILE',data:{name:'Senior crew'}},
  {id:id+'/b',parentId:id+'/unit',kind:'PROFILE',data:{name:'Junior crew'}},
  {id:id+'/composition',parentId:id+'/unit',kind:'DATASHEET_SECTION',data:{text:'1 Foreman and 2 Workers'},provenance:{sourceId:id+'/source'}},
  {id:id+'/weapon',parentId:id+'/unit',kind:'WEAPON_PROFILE',data:{name:'Sample cutter'}},
  {id:id+'/enh',parentId:id+'/det',kind:'ENHANCEMENT',data:{title:'Sample Tool'}}
]});
const aliases=id=>[
  {canonicalId:id+'/a',labels:['Foreman'],evidence:{entityId:id+'/composition',path:'/text'}},
  {canonicalId:id+'/b',labels:['Worker'],evidence:{entityId:id+'/composition',path:'/text'}}
];
const text='+ DETACHMENT: Sample Formation\n+ WARLORD: Char1: Sample Crew\nChar1: 3x Sample Crew (50 pts)\nEnhancement: Sample Tool\n• 1x Foreman: Sample cutter\n• 2x Worker: Sample cutter\n3x Sample Crew (50 pts)\n• 1x Foreman\n• 2x Worker';
const first=book('first'),original=structuredClone(first),a=createRosterImportService(first,{identityAliases:aliases('first')}),b=createRosterImportService(book('second'),{identityAliases:aliases('second')});
const ar=a.import(text),br=b.import(text);
assert.equal(ar.status,'READY');assert.equal(br.status,'READY');
assert.deepEqual(ar.roster.units.map(unit=>unit.canonicalUnitId),['first/unit','first/unit']);
assert.deepEqual(br.roster.units.map(unit=>unit.canonicalUnitId),['second/unit','second/unit']);
assert.deepEqual(ar.roster.units[0].modelRows.map(row=>[row.canonicalProfileId,row.quantity]),[['first/a',1],['first/b',2]]);
assert.deepEqual(ar.roster.units.map(unit=>unit.enhancementIds),[['first/enh'],[]]);
assert.deepEqual(ar.roster.units.map(unit=>unit.warlord),[true,false]);
assert.equal(a.projection,undefined);assert.equal(a.effective,undefined);assert.equal(a.attach,undefined);
const snapshot=a.snapshot(),expected=a.state;
snapshot.units[0].modelRows[0].quantity=900;assert.deepEqual(a.state,expected);
assert.throws(()=>b.load(expected),/domain/);
const restored=createRosterImportService(first,{identityAliases:aliases('first')});restored.load(JSON.parse(JSON.stringify(expected)));assert.deepEqual(restored.state,expected);
assert.throws(()=>restored.load({...expected,attachments:[{leaderInstanceId:'parsed-unit-1',bodyguardInstanceId:'parsed-unit-2'}]}),/attachments/);
assert.deepEqual(restored.state,expected);
const contradiction=a.import(text.replace('Char1: 3x','Char1: 4x'));
assert.equal(contradiction.status,'INVALID');assert(contradiction.errors.some(error=>error.code==='CONTRADICTORY_COMPOSITION'));assert.deepEqual(a.state,expected);
const unknown=createRosterImportService(first,{identityAliases:aliases('first')}).import(text.replace('+ WARLORD: Char1: Sample Crew\n',''));
assert.equal(unknown.status,'READY');assert.deepEqual(unknown.roster.units.map(unit=>unit.warlord),[null,null]);
assert.equal(createRosterImportService(first).import(text).status,'NEEDS_BINDINGS');
const collision=createRosterImportService(first,{identityAliases:[...aliases('first'),{...aliases('first')[1],labels:['Foreman']}]});
const ambiguous=collision.import(text);assert.equal(ambiguous.status,'NEEDS_BINDINGS');assert(ambiguous.needsBindings.some(item=>item.state==='AMBIGUOUS'));assert.equal(ambiguous.roster,null);
assert.throws(()=>createRosterImportService(first,{identityAliases:[{...aliases('first')[0],evidence:{entityId:'first/composition',path:'/absent'}}]}),/evidence/);
assert.deepEqual(first,original);assert.equal(first.entities.some(entity=>entity.aliases),false);
const dual=book('dual');dual.entities.find(entity=>entity.id==='dual/unit').data.weaponIds.push('dual/weapon-melee');
dual.entities.push({id:'dual/weapon-melee',parentId:'dual/unit',kind:'WEAPON_PROFILE',data:{name:'Sample cutter'}});
const weaponSelections=[{ownerId:'dual/unit',label:'Sample cutter',canonicalProfileIds:['dual/weapon','dual/weapon-melee'],evidence:[{entityId:'dual/composition',path:'/text'}]}];
const dualService=createRosterImportService(dual,{identityAliases:aliases('dual'),weaponSelections});
const dualResult=dualService.import(text);assert.equal(dualResult.status,'READY');
assert.deepEqual(dualResult.roster.units[0].modelRows[0].selections[0].canonicalProfileIds,['dual/weapon','dual/weapon-melee']);
assert.equal(createRosterImportService(dual,{identityAliases:aliases('dual')}).import(text).status,'NEEDS_BINDINGS');
assert.throws(()=>createRosterImportService(dual,{weaponSelections:[{...weaponSelections[0],canonicalProfileIds:['first/weapon']}]}),/Foreign import weapon profile/);
weaponSelections[0].canonicalProfileIds.length=0;assert.equal(dualService.import(text).status,'READY','Caller metadata cannot mutate service state');
console.log(JSON.stringify({status:'PASS',crossBookRegistryIsolation:'PASS',physicalOwnerIsolation:'PASS',mixedProfileIsolation:'PASS',explicitWarlordOnly:'PASS',quantityContradiction:'REJECTED',aliasCollision:'FAIL_CLOSED',roundtrip:'PASS',effectsLoaded:0,attachmentsEnabled:0}));

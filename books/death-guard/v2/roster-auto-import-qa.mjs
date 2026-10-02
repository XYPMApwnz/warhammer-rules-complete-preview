import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {pathToFileURL,fileURLToPath} from 'node:url';
// Expected identities are independently enumerated from canonical owner records.
// Import labels are permitted only at this boundary, never as runtime identity.
const repo=fileURLToPath(new URL('../../../',import.meta.url)).replaceAll('\\','/').replace(/\/$/,'');
const {importNewRecruit}=await import(pathToFileURL(repo+'/books/shared/roster-v2/import.mjs'));
const book=JSON.parse(fs.readFileSync(repo+'/books/death-guard/v2/generated/rule-contract-effective.json','utf8'));
const ctx={window:{}};vm.createContext(ctx);vm.runInContext(fs.readFileSync(repo+'/books/shared/roster-parser.js','utf8'),ctx);
const parse=ctx.window.WHRosterParser.parse;
const byId=new Map(book.entities.map(e=>[e.id,e]));
const dets=book.entities.filter(e=>e.kind==='DETACHMENT');
const units=book.entities.filter(e=>e.kind==='DATASHEET');
const enhs=book.entities.filter(e=>e.kind==='ENHANCEMENT');
const report={cases:[],negative:[]};
function run(text,b=book){return importNewRecruit(text,{parse,book:b});}
function ready(text,b=book){const r=run(text,b);assert.equal(r.status,'READY',JSON.stringify({text,r}));assert.equal(r.needsBindings.length,0);return r.roster;}
function check(kind,label,expected,text,inspect){const r=ready(text);inspect(r);report.cases.push({kind,label,expected,status:'PASS'});}
const header='+ DETACHMENT: Virulent Vectorium\n';
for(const u of units)check('UNIT',u.data.title,u.id,header+`1x ${u.data.title} (50 pts)`,r=>assert.equal(r.units[0].canonicalUnitId,u.id));
for(const d of dets)check('DETACHMENT',d.data.title,d.id,`+ DETACHMENT: ${d.data.title}\n1x Biologus Putrifier (50 pts)`,r=>assert.deepEqual(r.detachmentIds,[d.id]));
for(const e of enhs)check('ENHANCEMENT',e.data.title,e.id,`+ DETACHMENT: ${byId.get(e.parentId).data.title}\nChar1: 1x Biologus Putrifier (50 pts)\nEnhancement: ${e.data.title}`,r=>assert.deepEqual(r.units[0].enhancementIds,[e.id]));
for(const u of units){
 const weapons=book.entities.filter(e=>e.kind==='WEAPON_PROFILE'&&e.parentId===u.id);
 for(const w of weapons)check('WEAPON_PROFILE',w.data.name,w.id,header+`1x ${u.data.title} (50 pts): 2x ${w.data.name}`,r=>{assert.deepEqual(r.units[0].selections[0].canonicalProfileIds,[w.id]);assert.equal(r.units[0].selections[0].physicalQuantity,2);});
 const groups=new Map();for(const w of weapons){const base=w.data.name.split(/\s+[–—-]\s+/)[0];if(!groups.has(base))groups.set(base,[]);groups.get(base).push(w.id);}
 for(const [base,ids] of groups)if(ids.length>1)check('WEAPON_FAMILY',base,ids,header+`1x ${u.data.title} (50 pts): 3x ${base}`,r=>{assert.deepEqual(new Set(r.units[0].selections[0].canonicalProfileIds),new Set(ids));assert.equal(r.units[0].selections[0].physicalQuantity,3);});
}
// Accepted positive equipment declarations own selected equipment identity.
// Ability names alone are insufficient: the executable contract binds to the
// owning optional-equipment fact, not the display occurrence of its ability.
const equipmentControls=[
 ['unit-deathshroud-terminators','Icon of Despair','datasheet-deathshroud-terminators:wargear:2'],
 ['unit-plague-marines','Icon of Despair','datasheet-plague-marines:wargear:8'],
 ['unit-plague-drones','Daemonic Icon','datasheet-plague-drones:wargear:2'],
 ['unit-plague-drones','Instrument of Chaos','datasheet-plague-drones:wargear:1'],
 ['unit-plaguebearers','Daemonic Icon','datasheet-plaguebearers:wargear:2'],
 ['unit-plaguebearers','Instrument of Chaos','datasheet-plaguebearers:wargear:1']
];
assert.equal(book.entities.filter(e=>e.kind==='DATASHEET_SECTION').flatMap(e=>e.data.blocks||[]).filter(b=>b.wargearAbility).length,equipmentControls.length);
for(const [unitId,label,equipmentId] of equipmentControls){
 const source=byId.get(equipmentId),u=byId.get(unitId);assert.equal(source.parentId,unitId);assert.equal(source.kind,'WARGEAR_OPTION');
 assert(source.data.text.toLowerCase().includes('can be equipped with 1 '+label.toLowerCase()));
 check('OPTIONAL_EQUIPMENT',label,{id:equipmentId,path:'/text'},header+`1x ${u.data.title} (50 pts): 1x ${label}`,r=>{const s=r.units[0].selections[0];assert.deepEqual(s.canonicalEquipmentIds,[equipmentId]);assert.deepEqual(s.canonicalFieldPaths[equipmentId],['/text']);});
}
const explicit=ready('+ DETACHMENT: Virulent Vectorium (Worldblight)\n+ WARLORD: Char1: Lord of Contagion\nChar1: 1x Lord of Contagion (100 pts): 1x Manreaper\n3x Deathshroud Terminators (140 pts)\n• 1x Deathshroud Champion: 2x Plaguespurt gauntlet, 1x Manreaper\n• 2x Deathshroud Terminators: 1x Plaguespurt gauntlet, 1x Manreaper');
assert.deepEqual(explicit.detachmentIds,['detachment-virulent-vectorium']);assert.deepEqual(explicit.units.map(u=>u.canonicalUnitId),['unit-lord-of-contagion','unit-deathshroud-terminators']);assert.equal(explicit.units[1].startingStrength,3);assert.equal(explicit.warlordInstanceId,'parsed-unit-1');
report.cases.push({kind:'EXPLICIT_CONTROL',status:'PASS'});
for(const [kind,text] of [['UNKNOWN_UNIT',header+'1x Definitely unrelated secret creature (20 pts)'],['FOREIGN_GEAR',header+'1x Lord of Contagion (100 pts): 1x Boltgun'],['UNKNOWN_DETACHMENT','+ DETACHMENT: Unknown unrelated contingent\n1x Lord of Contagion (100 pts)'],['SOURCE_LIST_HEADING_IS_NOT_EQUIPMENT',header+'1x Helbrute (120 pts): 1x one of the following:'],['COMPOUND_SOURCE_INSTRUCTION_IS_NOT_EQUIPMENT',header+'1x Chaos Rhino (80 pts): 1x havoc launcher or can replace 1 combi-bolter with 1 havoc launcher']]){const r=run(text);assert.notEqual(r.status,'READY');assert.equal(r.roster,null);report.negative.push({kind,status:r.status,candidates:r.needsBindings});}
for(const [kind,text] of [['EMPTY_IMPORT',''],['UNKNOWN_AGGREGATE_QUANTITY',header+'5x Plague Marines (90 pts): Boltgun']]){const r=run(text);assert.notEqual(r.status,'READY');assert.equal(r.roster,null);if(kind==='UNKNOWN_AGGREGATE_QUANTITY')assert(r.needsBindings.some(n=>n.kind==='SELECTION_QUANTITY'));report.negative.push({kind,status:r.status,candidates:r.needsBindings});}
const collision=structuredClone(book);collision.entities.find(e=>e.id==='unit-lord-of-poxes').data.title='Lord of Contagion';const ambiguous=run(header+'1x Lord of Contagion (100 pts)',collision);assert.notEqual(ambiguous.status,'READY');assert.equal(ambiguous.roster,null);report.negative.push({kind:'EXACT_ALIAS_COLLISION',status:ambiguous.status,candidates:ambiguous.needsBindings});
assert.deepEqual(new Set(ambiguous.needsBindings.find(n=>n.kind==='DATASHEET').candidateIds),new Set(['unit-lord-of-contagion','unit-lord-of-poxes']));
const overrideCases=[
 ['UNIT_OVERRIDE',header+'1x Lord of Contagion (100 pts)',{units:{'parsed-unit-1':'unit-lord-of-poxes'}}],
 ['DETACHMENT_OVERRIDE',header+'1x Lord of Contagion (100 pts)',{detachments:{'detachment/1':'detachment-flyblown-host'}}],
 ['ENHANCEMENT_OVERRIDE',header+'1x Biologus Putrifier (50 pts)\nEnhancement: Furnace of Plagues',{enhancements:{'enhancement/1':'detachment-virulent-vectorium:enhancement:1'}}],
 ['GEAR_OVERRIDE',header+'1x Plague Marines (90 pts): 1x Boltgun',{selections:{'parsed-unit-1/unit/selection/1':{canonicalProfileIds:['datasheet-plague-marines:weapon:4']}}}],
 ['QUANTITY_OVERRIDE',header+'5x Plague Marines (90 pts): 4x Boltgun',{selections:{'parsed-unit-1/unit/selection/1':{canonicalProfileIds:['datasheet-plague-marines:weapon:2'],physicalQuantity:5}}}],
];
for(const [kind,text,bindings] of overrideCases){const r=importNewRecruit(text,{parse,book,bindings});assert.equal(r.status,'INVALID',kind+JSON.stringify(r));assert.equal(r.roster,null);report.negative.push({kind,status:r.status,errors:r.errors});}
const plausibleCase=run(header+'1x Lord (100 pts)');assert.equal(plausibleCase.status,'NEEDS_BINDINGS');const plausibleIds=plausibleCase.needsBindings.find(n=>n.kind==='DATASHEET').candidateIds;assert(plausibleIds.length>1&&plausibleIds.length<units.length);assert(plausibleIds.every(id=>byId.get(id).data.title.includes('Lord')));report.negative.push({kind:'PLAUSIBLE_CANDIDATES_ONLY',status:'PASS',candidateIds:plausibleIds});
const {createRosterRuntime}=await import(pathToFileURL(repo+'/books/shared/roster-v2/runtime.mjs'));
const evaluator=await import(pathToFileURL(repo+'/books/death-guard/v2/rule-contract-schema.mjs'));
const make=()=>createRosterRuntime(book,{parse,...evaluator});
const extraWeapon=ready(header+'3x Deathshroud Terminators (140 pts): 1x Additional plaguespurt gauntlet');
assert.deepEqual(extraWeapon.units[0].selections[0].canonicalProfileIds,['datasheet-deathshroud-terminators:weapon:1']);assert.deepEqual(extraWeapon.units[0].selections[0].canonicalEquipmentIds,[]);assert.equal(extraWeapon.units[0].selections[0].physicalQuantity,1);report.cases.push({kind:'ADDITIONAL_WEAPON_ALIAS',status:'PASS'});
const comprehensive=['+ DETACHMENT: Flyblown Host','+ DETACHMENT: Paragons of Putrescence','+ DETACHMENT: Contagion Engines','+ DETACHMENT: Virulent Vectorium',
 '+ WARLORD: Char3: Biologus Putrifier','+ ENHANCEMENT: Furnace of Plagues (on Char3: Biologus Putrifier)',
 'Char1: 5x Plague Marines (90 pts): 1x Meltagun, 4x Boltgun, 5x Plague knives, 1x Icon of Despair',
 'Char2: 10x Plague Marines (180 pts): 10x Boltgun, 10x Plague knives','Char3: 1x Biologus Putrifier (50 pts): 1x Plague knives'].join('\n');
const runtime=make(),multi=runtime.import(comprehensive);assert.equal(multi.status,'READY',JSON.stringify(multi));assert.equal(multi.needsBindings.length,0);
assert.deepEqual(runtime.state.detachmentIds,['detachment-flyblown-host','detachment-paragons-of-putrescence','detachment-contagion-engines','detachment-virulent-vectorium']);
assert.deepEqual(runtime.state.units.slice(0,2).map(u=>u.canonicalUnitId),['unit-plague-marines','unit-plague-marines']);assert.deepEqual(runtime.state.units.slice(0,2).map(u=>u.startingStrength),[5,10]);
assert.deepEqual(runtime.state.units[0].selections.map(s=>s.physicalQuantity),[1,4,5,1]);assert.deepEqual(runtime.state.units[1].selections.map(s=>s.physicalQuantity),[10,10]);
assert.deepEqual(runtime.state.units.map(u=>u.warlord),[false,false,true]);assert.deepEqual(runtime.state.units.map(u=>u.enhancementIds),[[],[],['detachment-virulent-vectorium:enhancement:2']]);
assert.equal(runtime.state.units[0].modelRows[0].compositionScope,'UNIT');assert.equal(runtime.state.units[0].modelRows[0].selections.length,0);
const bBefore=runtime.effective('parsed-unit-2');runtime.attach('parsed-unit-3','parsed-unit-1');assert.deepEqual(runtime.effective('parsed-unit-2'),bBefore);
const aAttached=runtime.effective('parsed-unit-1');assert(aAttached.applied.some(p=>p.ruleId==='datasheet-biologus-putrifier:section:1'));assert(!runtime.effective('parsed-unit-2').applied.some(p=>p.ruleId==='datasheet-biologus-putrifier:section:1'));
const backup=JSON.parse(JSON.stringify(runtime.snapshot()));const reloaded=make();reloaded.load(backup);assert.deepEqual(reloaded.projection,runtime.projection);assert.deepEqual(reloaded.effective('parsed-unit-1'),aAttached);
runtime.detach('parsed-unit-3');assert(!runtime.effective('parsed-unit-1').applied.some(p=>p.ruleId==='datasheet-biologus-putrifier:section:1'));runtime.attach('parsed-unit-3','parsed-unit-1');assert.deepEqual(runtime.effective('parsed-unit-1'),aAttached);
for(const u of runtime.state.units)assert(runtime.related(u.instanceId).every(r=>runtime.state.detachmentIds.includes(r.detachmentId)&&r.state!=='INVALID'));
const reimported=ready(comprehensive);assert.deepEqual(reimported,multi.roster);report.cases.push({kind:'MULTI_FIELD_ROUNDTRIP_DUPLICATE_ATTACHMENT',status:'PASS'});
for(const unitId of ['unit-plague-drones','unit-plaguebearers']){
 const u=byId.get(unitId),profile=byId.get(u.data.profileIds[0]),quantity=unitId==='unit-plague-drones'?3:10;
 const optional=make();const imported=optional.import(header+`${quantity}x ${u.data.title} (100 pts): 1x Daemonic Icon\n${quantity}x ${u.data.title} (100 pts): 0x Daemonic Icon\n${quantity}x ${u.data.title} (100 pts): 1x Instrument of Chaos`);
 assert.equal(imported.status,'READY',JSON.stringify(imported));assert.equal(imported.needsBindings.length,0);
 const leadership=instanceId=>optional.effective(instanceId).profiles.map(p=>p.fields.find(f=>f.label==='LD')?.value);
 assert.deepEqual(leadership('parsed-unit-1'),['6+']);assert.deepEqual(leadership('parsed-unit-2'),[profile.data.LD]);assert.deepEqual(leadership('parsed-unit-3'),[profile.data.LD]);
 assert(optional.effective('parsed-unit-1').applied.some(p=>p.ruleId===unitId.replace('unit-','datasheet-')+':section:1'));
 assert(!optional.effective('parsed-unit-2').applied.some(p=>p.ruleId===unitId.replace('unit-','datasheet-')+':section:1'));
 assert(!optional.effective('parsed-unit-3').applied.some(p=>p.ruleId===unitId.replace('unit-','datasheet-')+':section:1'));
 const optionalBackup=JSON.parse(JSON.stringify(optional.snapshot())),optionalReload=make();optionalReload.load(optionalBackup);assert.deepEqual(optionalReload.projection,optional.projection);
 report.cases.push({kind:'OPTIONAL_EQUIPMENT_EFFECT',unitId,status:'PASS'});
}
report.totals={cases:report.cases.length,negative:report.negative.length,units:units.length,detachments:dets.length,enhancements:enhs.length,weaponProfiles:report.cases.filter(c=>c.kind==='WEAPON_PROFILE').length,weaponFamilies:report.cases.filter(c=>c.kind==='WEAPON_FAMILY').length,equipment:report.cases.filter(c=>c.kind==='OPTIONAL_EQUIPMENT').length,falseMatches:0};
console.log(JSON.stringify({status:'PASS',...report.totals,canonicalLabelEntries:report.cases.filter(c=>!['EXPLICIT_CONTROL','MULTI_FIELD_ROUNDTRIP_DUPLICATE_ATTACHMENT','OPTIONAL_EQUIPMENT_EFFECT'].includes(c.kind)).length,scenarioControls:4,manualSelectionsForUnambiguous:0,roundtrip:'PASS',duplicateIsolation:'PASS',attachmentLifecycle:'PASS',optionalEquipmentEffects:'PASS'}));

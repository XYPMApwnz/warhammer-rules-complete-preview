/** Known physical UNIT inventory is independent of unknown MODEL ownership.
 * Constructed New Recruit text; source-backed identities, no army legality QA. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {pathToFileURL} from 'node:url';
import {createDGRosterRuntime} from '../books/death-guard/v2/roster-boot.mjs';
import {createAdMechRosterRuntime} from '../books/adeptus-mechanicus/v2/roster-runtime.mjs';
import {createCSMBrowserRoster} from '../books/chaos-space-marines/v2/roster-boot.mjs';
import {createECBrowserRoster} from '../books/emperors-children/v2/roster-boot.mjs';
import {createTyranidsBrowserRoster} from '../books/tyranids/v2/roster-boot.mjs';
import {prepareRosterPresentationCards,projectInstanceCards} from '../books/shared/army-book-app-v2/personal.mjs';
import {projectSelectedComposition} from '../books/shared/army-book-app-v2/effective-datasheet-presentation.mjs';
import {selections,predicateContext} from '../books/shared/roster-v2/context.mjs';
import {enhancementOwnerContext} from '../books/shared/roster-v2/compatibility-context.mjs';
import {evaluatePredicate} from '../books/death-guard/v2/rule-contract-schema.mjs';
import {parseSourceHtml,sourceNode,sourceNodeText} from '../books/death-guard/v2/raw-source.mjs';
const read=path=>JSON.parse(fs.readFileSync(new URL('../'+path,import.meta.url)));
const sourceText=path=>{const raw=fs.readFileSync(new URL('../'+path,import.meta.url),'utf8');return sourceNodeText(raw,parseSourceHtml(raw)).replace(/\s+/g,' ').toLowerCase();};
const gear=(id,name,quantity=1)=>({id,name,quantity});
export const aggregateInventoryCases=[
  {book:'death-guard',unit:'unit-plague-drones',count:3,detachment:'Tallyband Summoners',
    source:'books/death-guard/v2/sources/accepted-waha-pages/Plague-Drones.html',
    plain:'3x Plague Drones (100 pts): 3x Death’s heads, 3x Foul mouthparts, 3x Plaguesword',
    extra:', 1x Instrument of Chaos, 1x Daemonic Icon',
    weapons:[gear('datasheet-plague-drones:weapon:1','Death’s heads',3),gear('datasheet-plague-drones:weapon:2','Foul mouthparts',3),gear('datasheet-plague-drones:weapon:3','Plaguesword',3)],
    equipment:[gear('datasheet-plague-drones:wargear:1','Instrument of Chaos'),gear('datasheet-plague-drones:wargear:2','Daemonic Icon')],charge:1,ld:'6+'},
  {book:'adeptus-mechanicus',unit:'unit-skitarii-rangers',count:10,detachment:'Haloscreed Battle Clade',
    source:'books/adeptus-mechanicus/sources/waha-11e-current-2026-09-25/Skitarii-Rangers.html',
    plain:'10x Skitarii Rangers (85 pts): 10x Galvanic rifle, 10x Close combat weapon',extra:', 1x Omnispex, 1x Enhanced data-tether',
    weapons:[gear('datasheet-skitarii-rangers:weapon:3','Galvanic rifle',10),gear('datasheet-skitarii-rangers:weapon:8','Close combat weapon',10)],
    equipment:[gear('datasheet-skitarii-rangers:section:1','Omnispex'),gear('datasheet-skitarii-rangers:section:1','Enhanced data-tether')],ignoresCover:true},
  {book:'chaos-space-marines',unit:'unit-legionaries',count:5,detachment:'Renegade Warband',
    source:'books/chaos-space-marines/sources/waha-11e-current-2026-09-29/Legionaries.html',
    plain:'5x Legionaries (90 pts)\n• 1x Aspiring Champion: Bolt pistol, Boltgun, Close combat weapon\n• 4x Legionary: Bolt pistol, Boltgun, Close combat weapon',
    extra:', 1x Chaos icon',
    weapons:[gear('datasheet-legionaries:weapon:2','Bolt pistol',5),gear('datasheet-legionaries:weapon:3','Boltgun',5),gear('datasheet-legionaries:weapon:18','Close combat weapon',5)],
    equipment:[gear('datasheet-legionaries:wargear:3','Chaos icon')],equipmentStaticEffect:'N/A — conditional Dark Pacts Leadership re-roll'},
  {book:'emperors-children',unit:'unit-daemonettes',count:10,detachment:'Carnival of Excess',
    source:'books/emperors-children/sources/waha-11e-current-2026-09-28/Daemonettes.html',
    plain:'10x Daemonettes (100 pts)\n• 1x Alluress: Slashing claws\n• 9x Daemonette: Slashing claws',extra:', 1x Instrument of Chaos, 1x Daemonic icon',
    weapons:[gear('datasheet-daemonettes:weapon:1','Slashing claws',10)],
    equipment:[gear('datasheet-daemonettes:wargear:1','Instrument of Chaos'),gear('datasheet-daemonettes:wargear:2','Daemonic icon')],charge:1,ld:'6+'},
  {book:'tyranids',unit:'unit-termagants',count:10,detachment:'Invasion Fleet',
    source:'books/tyranids/sources/waha-11e-current-2026-09-27/Termagants.html',
    plain:'10x Termagants (60 pts): 10x Fleshborer, 10x Chitinous claws and teeth',extra:'',
    weapons:[gear('datasheet-termagants:weapon:1','Fleshborer',10),gear('datasheet-termagants:weapon:7','Chitinous claws and teeth',10)],equipment:[],equipmentStaticEffect:'N/A — no optional equipment'}
];
function factory(id){
  const root='books/'+id+'/v2/';
  if(id==='death-guard')return ()=>createDGRosterRuntime(read(root+'generated/rule-contract-effective.json'));
  if(id==='adeptus-mechanicus')return ()=>createAdMechRosterRuntime(read(root+'generated/roster-runtime.json'),read(root+'roster-import-aliases.json'));
  if(id==='chaos-space-marines')return ()=>createCSMBrowserRoster(read(root+'generated/roster-runtime.json'),read(root+'generated/roster-import.json'),read(root+'roster-attachment-bindings.json'));
  if(id==='emperors-children')return ()=>createECBrowserRoster(read(root+'generated/roster-attachments.json'));
  return ()=>createTyranidsBrowserRoster(read(root+'generated/roster-runtime.json'));
}
const totals=rows=>{const result={};for(const row of rows)result[row.id]=(result[row.id]||0)+row.quantity;return result;};
const expectedWeapons=c=>totals(c.weapons);
export function aggregateInventoryFixture(c,enabled=true){
  const [first,...rest]=c.plain.split('\n');
  const extra=enabled&&c.extra?(first.includes(':')?c.extra:': '+c.extra.slice(2)):'';
  const selected=first+extra+(rest.length?'\n'+rest.join('\n'):'');
  return `+ DETACHMENT: ${c.detachment}\n${selected}\n${c.plain}\n`;
}
export function runAggregateInventoryGuard(){
  const results=[];
  for(const c of aggregateInventoryCases){
    const raw=sourceText(c.source);
    for(const item of [...c.weapons,...c.equipment])assert.ok(raw.includes(item.name.toLowerCase()),'Accepted source vocabulary: '+c.book+'/'+item.name);
    if(c.charge)assert.ok(raw.includes('add 1 to charge rolls made for the bearer’s unit'),'Accepted source Charge value/UNIT recipient');
    if(c.ld)assert.ok(raw.includes('models in the bearer’s unit have a leadership characteristic of 6+'),'Accepted source Leadership value/UNIT models');
    if(c.ignoresCover)assert.ok(raw.includes('ranged weapons equipped by models in the bearer’s unit have the [ignores cover] ability'),'Accepted source Omnispex recipient/operation');
    const make=factory(c.book),r=make(),text=aggregateInventoryFixture(c);assert.equal(r.import(text).status,'READY',c.book);
    const original=r.snapshot(),payload=read('books/'+c.book+'/v2/generated/app-presentation.json');
    const cards=prepareRosterPresentationCards(new Map(payload.cards.map(card=>[card.id,card])),payload.rosterPresentation);
    for(const [ordinal,unit]of r.state.units.entries()){
      assert.equal(unit.instanceId,'parsed-unit-'+(ordinal+1));assert.equal(unit.canonicalUnitId,c.unit);assert.equal(unit.startingStrength,c.count);
      const current=r.effective(unit.instanceId),variants=projectInstanceCards(cards,unit,current);
      const root=variants.get(c.unit)[0],display=projectSelectedComposition(unit,root.rosterComposition);
      const items=[...display.inventory.map(item=>({selection:item.selection,total:item.total})),...display.groups.flatMap(group=>group.equipment.map(item=>({selection:item.selections[0],total:item.total})))];
      assert.deepEqual(totals(current.weapons.map(w=>({id:w.id,quantity:w.physicalQuantity}))),expectedWeapons(c),c.book+' Effective quantity');
      assert.deepEqual(totals(items.flatMap(item=>item.selection.canonicalProfileIds.map(id=>({id,quantity:item.total})))),expectedWeapons(c),c.book+' Guide quantity');
      for(const item of c.weapons)assert.equal(variants.get(item.id).reduce((n,card)=>n+card.rosterQuantity,0),item.quantity,c.book+' production weapon presentation');
      const equipment=selections(unit).filter(selection=>selection.canonicalEquipmentIds.length);
      assert.equal(equipment.length,ordinal?0:c.equipment.length,c.book+' equipment selection count');
      for(const expected of ordinal?[]:c.equipment){
        const matches=equipment.filter(selection=>selection.canonicalEquipmentIds.includes(expected.id)&&selection.sourceReferences.some(reference=>reference.caption&&
          cards.get(reference.entityId).fields.find(field=>field.source?.path===reference.path)?.value.slice(reference.caption.start,reference.caption.end).toLowerCase()===expected.name.toLowerCase()));
        assert.equal(matches.length,1,c.book+' exact equipment caption '+expected.name);
        assert.equal(matches[0].physicalQuantity,expected.quantity);assert.equal(matches[0].perModelQuantity,null);assert.equal(matches[0].quantityEvidence.scope,'UNIT');
        assert.ok(display.inventory.some(item=>item.selection.selectionKey===matches[0].selectionKey&&item.total===expected.quantity));
      }
      assert.ok(unit.modelRows.every(row=>row.selections.every(selection=>!selection.canonicalEquipmentIds.length)&&row.loadouts.every(loadout=>loadout.selections.every(selection=>!selection.canonicalEquipmentIds.length))),c.book+' no invented equipment bearer');
      if(c.charge){assert.equal(current.unitMetrics?.chargeRoll?.modifier??0,ordinal?0:c.charge);assert.equal(root.rosterUnitMetrics?.find(metric=>metric.key==='chargeRoll')?.value.modifier??0,ordinal?0:c.charge);}
      if(c.ld&&!ordinal)assert.ok(current.profiles.every(profile=>profile.fields.find(field=>field.label==='LD')?.value===c.ld||profile.fields.find(field=>field.label==='stats')?.value.LD===c.ld));
      if(c.ignoresCover){const ranged=current.weapons.find(w=>w.id==='datasheet-skitarii-rangers:weapon:3');assert.equal(ranged.fields.find(field=>field.label==='abilities').value.some(value=>value.toUpperCase()==='IGNORES COVER'),!ordinal);}
    }
    const reloaded=make();reloaded.load(original);assert.deepEqual(reloaded.projection,r.projection);
    assert.equal(r.import(aggregateInventoryFixture(c,false)).status,'READY');assert.ok(r.state.units.every(unit=>selections(unit).every(selection=>!selection.canonicalEquipmentIds.length)));
    if(c.charge)assert.ok(r.state.units.every(unit=>!r.effective(unit.instanceId).unitMetrics?.chargeRoll));
    assert.equal(r.import(text).status,'READY');assert.deepEqual(r.snapshot(),original);
    if(c.book==='tyranids'){
      // A mixed composition still preserves a known UNIT total. This does not
      // assign any of the eleven weapons to its Nodebeast or other models.
      const mixed=make(),mixedText='+ DETACHMENT: Invasion Fleet\n'+
        '11x Neurogaunts (45 pts): 11x Chitinous claws and teeth\n'+
        '• 1x Neurogaunt Nodebeasts\n• 10x Neurogaunts\n';
      assert.equal(mixed.import(mixedText).status,'READY');
      const unit=mixed.state.units[0],view=mixed.effective(unit.instanceId);
      assert.deepEqual(unit.modelRows.map(row=>row.quantity),[1,10]);
      assert.ok(unit.modelRows.every(row=>row.selections.length===0));
      assert.ok(mixed.projection.units[0].profiles.every(profile=>profile.weapons.length===0));
      assert.deepEqual(view.weapons.map(weapon=>[weapon.id,weapon.physicalQuantity]),[['datasheet-neurogaunts:weapon:1',11]]);
      const presented=projectInstanceCards(cards,unit,view),display=projectSelectedComposition(unit,presented.get(unit.canonicalUnitId)[0].rosterComposition);
      assert.equal(display.inventory[0].total,11);assert.equal(presented.get('datasheet-neurogaunts:weapon:1')[0].rosterQuantity,11);
    }
    results.push({book:c.book,knownInventory:'PASS',unknownModelNotInvented:'PASS',productionEffectiveGuide:'PASS',isolationRemoveReload:'PASS',staticEffect:c.charge?'Charge +1 / LD6':c.ignoresCover?'IGNORES COVER':c.equipmentStaticEffect});
  }
  // Source eligibility and physical assignment are separate. Explicitly naming
  // a Plague Champion does not create CHARACTER or silently grant an effect.
  const book=read('books/death-guard/v2/generated/rule-contract-effective.json'),id='detachment-paragons-of-putrescence:enhancement:1';
  const introduction=sourceText('books/death-guard/v2/sources/accepted-waha-pages/death-guard.html');
  assert.ok(introduction.includes('enables you to upgrade characters using the enhancements'));
  const r=createDGRosterRuntime(book),text='+ DETACHMENT: Paragons of Putrescence\n'+
    '5x Plague Marines (100 pts)\n• 1x Plague Champion: Plague knives\n• 4x Plague Marine: Plague knives\nEnhancement: Rejuvenating Swarm\n'+
    '1x Noxious Blightbringer (50 pts): Plasma pistol, Cursed plague bell\nEnhancement: Rejuvenating Swarm';
  assert.equal(r.import(text).status,'READY');const state=r.snapshot(),contract=book.entities.find(entity=>entity.id===id).ruleContract;
  for(const [n,wanted]of [[0,'FALSE'],[1,'TRUE']]){
    const unit=r.projection.units[n],profile=unit.profiles.find(profile=>profile.quantity===1);
    state.units[n].enhancementAssignments=[{enhancementId:id,modelScopeId:profile.scopeId}];
    const context=enhancementOwnerContext(contract,predicateContext(r.state,r.projection,unit.instanceId,'MODEL',profile.scopeId));
    assert.equal(evaluatePredicate(contract.assignment.selector,context),wanted);
  }
  r.load(state);assert.ok(!r.projection.units[0].conditional.some(row=>row.ruleId===id));
  assert.ok(r.projection.units[1].conditional.some(row=>row.ruleId===id));assert.ok(r.projection.units.every(unit=>!unit.applied.some(row=>row.ruleId===id)));
  return {status:'PASS',books:5,aggregatePhysicalUnits:10,mixedCompositionUnits:1,assignmentUnits:2,results,
    modelEnhancementAssignment:{explicitChampion:'SOURCE_INELIGIBLE_NO_EFFECT',explicitCharacter:'CONDITIONAL_NO_BATTLE_SIMULATION'},realNewRecruitExportTested:false};
}
export const aggregateInventoryGuardResult=runAggregateInventoryGuard();
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)console.log(JSON.stringify(aggregateInventoryGuardResult,null,2));

import fs from 'node:fs';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {createDGRosterRuntime} from './roster-boot.mjs';
import {parseSourceHtml,sourceNodeText} from './raw-source.mjs';
import {projectInstanceCards} from '../../shared/army-book-app-v2/personal.mjs';

export const instrumentCases=[
  {slug:'plague-drones',name:'Plague Drones',member:'Plague Drone',champion:'Plaguebringer',count:3,weapons:'Death’s heads, Foul mouthparts, Plaguesword',file:'Plague-Drones.html'},
  {slug:'plaguebearers',name:'Plaguebearers',member:'Plaguebearer',champion:'Plagueridden',count:10,weapons:'Plaguesword',file:'Plaguebearers.html'}
];
/** Real import text with distinct explicit MODEL rows, not a fabricated flag. */
export function instrumentFixture(c,choice='instrument') {
  const instrument=['instrument','both'].includes(choice)?', Instrument of Chaos':'',icon=['icon','both'].includes(choice)?', Daemonic Icon':'';
  return `+ FACTION KEYWORD: Chaos - Death Guard\n+ DETACHMENT: Tallyband Summoners\n${c.count}x ${c.name} (100 pts)\n`+
    `• 1x ${c.champion}: ${c.weapons}\n• 1x ${c.member}: ${c.weapons}${instrument}\n• 1x ${c.member}: ${c.weapons}${icon}\n`+
    (c.count>3?`• ${c.count-3}x ${c.member}: ${c.weapons}\n`:'')+`${c.count}x ${c.name} (100 pts)\n5x Plague Marines (100 pts)`;
}
export function runInstrumentChargeQA() {
  const book=JSON.parse(fs.readFileSync(new URL('./generated/rule-contract-effective.json',import.meta.url),'utf8'));
  const payload=JSON.parse(fs.readFileSync(new URL('./generated/app-presentation.json',import.meta.url),'utf8')),cards=new Map(payload.cards.map(c=>[c.id,c]));
  const index=new Map(book.entities.map(e=>[e.id,e])),snapshot=JSON.stringify(book);let checks=0,mutations=0;
  const make=(candidate=book)=>createDGRosterRuntime(candidate),bonus=(runtime,id='parsed-unit-1')=>runtime.projection.units.find(u=>u.instanceId===id).metrics.chargeRoll?.modifier??0;
  const view=(runtime,id='parsed-unit-1')=>projectInstanceCards(cards,runtime.state.units.find(u=>u.instanceId===id),runtime.effective(id)).get(runtime.state.units.find(u=>u.instanceId===id).canonicalUnitId)[0].rosterUnitMetrics;
  for(const c of instrumentCases){
    const id=`datasheet-${c.slug}:section:1`,option=`datasheet-${c.slug}:wargear:1`,quote='Instrument of Chaos: Add 1 to Charge rolls made for the bearer’s unit.';
    const raw=fs.readFileSync(new URL('./sources/accepted-waha-pages/'+c.file,import.meta.url),'utf8');
    assert.ok(sourceNodeText(raw,parseSourceHtml(raw)).replace(/\s/g,'').includes(quote.replace(/\s/g,'')));
    assert.equal(index.get(id).data.blocks[2].text,quote);
    const clause=index.get(id).ruleContract.clauses.find(x=>x.id==='source-clause-3'),effect=clause.rosterEffects[0];
    assert.equal(clause.rosterClassification,'ROSTER_EXECUTABLE');
    assert.deepEqual([effect.operation,effect.targetSubject,effect.targetBinding,effect.unitScope,effect.field,effect.mode,effect.value],['MODIFY_RULE_METRIC','UNIT','SOURCE_UNIT','FORMED','chargeRoll','ADD',1]);
    assert.equal(effect.equipmentRequirement.equipmentId,option);
    for(const choice of ['none','instrument','icon','both']){
      const runtime=make(),result=runtime.import(instrumentFixture(c,choice));assert.equal(result.status,'READY',JSON.stringify(result.errors));
      const wanted=['instrument','both'].includes(choice)?1:0,icon=['icon','both'].includes(choice);
      assert.equal(bonus(runtime),wanted);for(const other of ['parsed-unit-2','parsed-unit-3'])assert.equal(bonus(runtime,other),0);
      const visible=view(runtime);assert.equal(visible.filter(m=>m.key==='chargeRoll').length,wanted);
      if(wanted){assert.equal(visible[0].displayValue,'+1');assert.equal(visible[0].unitScope,'FORMED');assert.ok(visible[0].sources.some(s=>s.ruleId===id));}
      for(const unit of runtime.projection.units)for(const model of unit.profiles){
        const expected=structuredClone(index.get(model.canonicalProfileId).data);if(unit.instanceId==='parsed-unit-1'&&icon)expected.LD='6+';
        assert.deepEqual(model.profile,expected,'Instrument cannot change Movement or MODEL characteristics');assert.equal(model.metrics.chargeRoll,undefined);
        for(const weapon of model.weapons)assert.deepEqual(weapon.data,index.get(weapon.canonicalProfileId).data);
      }
      const saved=runtime.snapshot(),again=make();again.load(JSON.parse(JSON.stringify(saved)));assert.deepEqual(again.projection,runtime.projection);checks++;
    }
    const runtime=make();assert.equal(runtime.import(instrumentFixture(c)).status,'READY');const enabled=runtime.snapshot(),expected=runtime.projection;
    const off=structuredClone(enabled);off.units[0].modelRows[1].selections=off.units[0].modelRows[1].selections.filter(s=>!s.canonicalEquipmentIds.includes(option));
    runtime.load(off);assert.equal(bonus(runtime),0);assert.deepEqual(view(runtime),[]);
    runtime.load(enabled);assert.deepEqual(runtime.projection,expected);runtime.load(enabled);assert.deepEqual(runtime.projection,expected);checks++;
    const zero=structuredClone(enabled);zero.units[0].modelRows[1].selections.find(s=>s.canonicalEquipmentIds.includes(option)).physicalQuantity=0;
    runtime.load(zero);assert.equal(bonus(runtime),0);
    const wrongField=structuredClone(enabled);wrongField.units[0].modelRows[1].selections.find(s=>s.canonicalEquipmentIds.includes(option)).canonicalFieldPaths[option]=['/order'];
    assert.throws(()=>runtime.load(wrongField),/Foreign equipment caption reference/);
    const duplicate=structuredClone(enabled);duplicate.units[0].modelRows[1].selections.find(s=>s.canonicalEquipmentIds.includes(option)).physicalQuantity=2;
    assert.throws(()=>runtime.load(duplicate),/Only one Instrument/);
    const wrong=structuredClone(enabled);wrong.units[2].selections.push(wrong.units[0].modelRows[1].selections.find(s=>s.canonicalEquipmentIds.includes(option)));
    assert.throws(()=>runtime.load(wrong),/Foreign equipment owner/);
    const champion=instrumentFixture(c).replace(`• 1x ${c.champion}: ${c.weapons}`,`• 1x ${c.champion}: ${c.weapons}, Instrument of Chaos`).replace(`• 1x ${c.member}: ${c.weapons}, Instrument of Chaos`,`• 1x ${c.member}: ${c.weapons}`);
    assert.equal(make().import(champion).status,'INVALID');
    const both=make();assert.equal(both.import(instrumentFixture(c,'both')).status,'READY');const same=both.snapshot();
    same.units[0].modelRows[1].selections.push(same.units[0].modelRows[2].selections.find(s=>s.canonicalEquipmentIds.length));
    same.units[0].modelRows[2].selections=same.units[0].modelRows[2].selections.filter(s=>!s.canonicalEquipmentIds.length);
    assert.throws(()=>runtime.load(same),/cannot share/);
    const aggregate=make();assert.equal(aggregate.import(`+ DETACHMENT: Tallyband Summoners\n${c.count}x ${c.name} (100 pts): 1x Instrument of Chaos, 1x Daemonic Icon`).status,'READY');
    assert.equal(bonus(aggregate),1);assert.equal(view(aggregate)[0].displayValue,'+1');
    assert.equal(aggregate.state.units[0].selections.filter(s=>s.canonicalEquipmentIds.length&&s.physicalQuantity===1).length,2);
    assert.ok(aggregate.state.units[0].modelRows.every(row=>!row.selections.some(s=>s.canonicalEquipmentIds.length)),'Known UNIT quantity never manufactures MODEL bearers');checks++;
    for(const alter of [clause=>{clause.rosterClassification='BATTLE_ONLY';clause.rosterEffects=[];},clause=>clause.rosterEffects[0].value=2,
      clause=>clause.rosterEffects[0].targetBinding='ROSTER_UNITS']){
      const candidate=structuredClone(book);alter(candidate.entities.find(e=>e.id===id).ruleContract.clauses.find(c=>c.id==='source-clause-3'));
      assert.throws(()=>{const bad=make(candidate);assert.equal(bad.import(instrumentFixture(c)).status,'READY');assert.equal(bonus(bad),1);assert.equal(bonus(bad,'parsed-unit-2'),0);assert.equal(view(bad)[0].displayValue,'+1');});mutations++;
    }
  }
  assert.equal(JSON.stringify(book),snapshot);
  return {status:'PASS',owners:2,checks,mutations,physicalBearer:true,eligibility:true,independentInstances:true,sourceEvidence:true,productionPresentation:true,reload:true,sharedExecutorChanged:false};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)console.log(JSON.stringify(runInstrumentChargeQA()));

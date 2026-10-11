/** Real import/attachment inputs; rendering composition does not execute rules. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {projectFormedUnitCards} from './personal.mjs';
import {projectEffectiveInstance} from '../roster-v2/effective-instance.mjs';
import {createSyntheticPersonalFixture} from './personal-datasheet-qa.mjs';
import {createRosterRuntime} from '../roster-v2/runtime.mjs';
import {parse} from '../roster-v2/parser.mjs';
import * as dgSchema from '../../death-guard/v2/rule-contract-schema.mjs';
import {createAdMechRosterRuntime} from '../../adeptus-mechanicus/v2/roster-runtime.mjs';
import {createCSMRosterRuntime} from '../../chaos-space-marines/v2/roster-runtime.mjs';
import {prepareCSMFormedFixturePayload,bindFixtureAbilityPresentation} from './formed-unit-fixture-payload.mjs';

const read=path=>JSON.parse(fs.readFileSync(new URL(path,import.meta.url),'utf8'));
const csmFixtures=read('../../chaos-space-marines/v2/roster-attachment-fixtures.json').fixtures;
export const fixtureInputs=[
  {id:'dg-lord-deathshroud',army:'death-guard',bodyguardOrdinal:2,participantOrdinals:[1],text:`+ FACTION KEYWORD: Chaos - Death Guard
+ DETACHMENT: Paragons of Putrescence, Virulent Vectorium
Char1: 1x Lord of Contagion (135 pts): Manreaper
Enhancement: Furnace of Plagues (+25 pts)
3x Deathshroud Terminators (150 pts)
• 1x Deathshroud Terminator Champion: Manreaper, Plaguespurt gauntlet
• 2x Deathshroud Terminator: 2 with Manreaper, Plaguespurt gauntlet`},
  {id:'am-leader-support-owners',army:'adeptus-mechanicus',bodyguardOrdinal:3,participantOrdinals:[1,2],text:`+ FACTION KEYWORD: Imperium - Adeptus Mechanicus
+ DETACHMENT: Haloscreed Battle Clade, Eradication Cohort
Char1: 1x Tech-priest Dominus (0 pts): Volkite blaster, Macrostubber, Omnissian axe
Enhancement: Cognitive Reinforcement (+0 pts)
Char2: 1x Skitarii Marshal (0 pts): Mechanicus pistol, Control stave
Enhancement: Omnicogitator (+0 pts)
10x Skitarii Rangers (0 pts)
• 1x Skitarii Ranger Alpha: Galvanic rifle, Close combat weapon
• 9x Skitarii Ranger: 9 with Galvanic rifle, Close combat weapon`},
  ...['duplicate-leader-support-ownership','mixed-profile-components'].map(id=>({
    id:'csm-'+id,army:'chaos-space-marines',text:csmFixtures.find(f=>f.id===id).text,
    bodyguardOrdinal:id==='mixed-profile-components'?2:5,participantOrdinals:id==='mixed-profile-components'?[1]:[1,3]}))
];

/** CSM adapter is QA-only: no production Personal Guide connection. */
export function createFormedFixtures() {
  return fixtureInputs.map(input=>{
    const {army}=input;
    const book=read(`../../${army}/v2/generated/${army==='death-guard'?'rule-contract-effective':'roster-runtime'}.json`);
    let payload=read(`../../${army}/v2/generated/app-presentation.json`);
    let service;
    if(army==='death-guard')service=createRosterRuntime(book,{parse,...dgSchema});
    else if(army==='adeptus-mechanicus')service=createAdMechRosterRuntime(book,read('../../adeptus-mechanicus/v2/roster-import-aliases.json'));
    else {
      service=createCSMRosterRuntime(book,read('../../chaos-space-marines/v2/generated/roster-import.json'),read('../../chaos-space-marines/v2/roster-attachment-bindings.json'));
      service.effective=id=>projectEffectiveInstance(book,service.projection,id);
      payload=prepareCSMFormedFixturePayload(payload,book);
    }
    const imported=service.import(input.text);
    assert.equal(imported.status,'READY',input.id+' native import');
    const bodyguardId='parsed-unit-'+input.bodyguardOrdinal;
    return {...input,payload,book,service,bodyguardId,participantIds:input.participantOrdinals.map(n=>'parsed-unit-'+n),
      attach:id=>army==='chaos-space-marines'?service.attach(bodyguardId,id):service.attach(id,bodyguardId),
      detach:id=>service.detach(id)};
  });
}

function baselineEffective() {
  const repo=fileURLToPath(new URL('../../../',import.meta.url));
  // Pin the pre-extraction implementation so this remains meaningful after the
  // presentation fix is committed. This is a behavior oracle, never factual data.
  const source=execFileSync('git',['show','9a952c7c6e0d866677eb48897b5a4b32bc207682:books/shared/roster-v2/runtime.mjs'],{cwd:repo,encoding:'utf8',maxBuffer:2*1024*1024});
  const start=source.indexOf('    effective(instanceId) {')+'    effective(instanceId) {'.length;
  const end=source.indexOf('\n    related(',start);
  assert.ok(start>30&&end>start,'Baseline shared effective method is identifiable');
  const body=source.slice(start,end).replace(/},\s*$/,'');
  return new Function('book','projection','instanceId',`const records=new Map(book.entities.map(e=>[e.id,e]));const clone=structuredClone;const fields=value=>Object.entries(value).map(([label,value])=>({label,value}));${body}`);
}
const identities=records=>records.map(record=>JSON.stringify([record.id,record.scopeId||null])).sort();
const serialize=view=>JSON.stringify(view,(_key,value)=>value instanceof Map?[...value]:value);

export function runFormedUnitGuards() {
  const oldEffective=baselineEffective(),results=[];
  for(const fixture of createFormedFixtures()) {
    const {service,book,payload,bodyguardId,participantIds,id}=fixture;
    const cards=new Map(payload.cards.map(card=>[card.id,card]));
    const original=structuredClone(service.state),canonicalBefore=structuredClone(book),cardsBefore=structuredClone(cards);
    function check(expected) {
      const stateBefore=service.snapshot(),projectionBefore=service.projection;
      const view=projectFormedUnitCards(cards,service,bodyguardId);
      assert.deepEqual(view.components.map(component=>component.unit.instanceId),expected,id+' exact physical components');
      assert.equal(new Set(view.components.map(c=>c.unit.instanceId)).size,expected.length,id+' no repeated component');
      for(const {unit,variants,card} of view.components) {
        const effective=service.effective(unit.instanceId);
        assert.deepEqual(effective,oldEffective(book,service.projection,unit.instanceId),id+' extraction preserves old effective data');
        if(fixture.army==='chaos-space-marines') {
          const saved=structuredClone(effective),bound=bindFixtureAbilityPresentation(effective,payload);
          assert.deepEqual(effective,saved,id+' fixture categories do not mutate effective state');
          assert.deepEqual(bound.profiles.map(p=>p.abilities.map(({group,...ability})=>ability)),saved.profiles.map(p=>p.abilities.map(({group,...ability})=>ability)),id+' fixture binding preserves every ability value and identity');
          assert.ok(bound.profiles.flatMap(p=>p.abilities).filter(a=>a.canonicalId==='army-rule-dark-pacts').every(a=>a.group==='ARMY RULES'),id+' Army Rule uses existing canonical presentation category');
        }
        assert.equal(card.instanceId,unit.instanceId,id+' root ownership');
        assert.deepEqual(unit,service.state.units.find(raw=>raw.instanceId===unit.instanceId),id+' loadout/Enhancement/Upgrade ownership');
        assert.equal(card.rosterComposition.reduce((n,row)=>n+row.quantity,0),unit.startingStrength,id+' complete composition');
        assert.deepEqual(card.rosterComposition.map(row=>[row.profileId,row.quantity]),unit.modelRows.map(row=>[row.canonicalProfileId,row.quantity]));
        const profiles=[...variants.values()].flat().filter(record=>record.kind==='PROFILE');
        const weapons=[...variants.values()].flat().filter(record=>record.kind==='WEAPON_PROFILE');
        assert.deepEqual(identities(profiles),identities(effective.profiles),id+' exact effective profiles');
        assert.deepEqual(identities(weapons),identities(effective.weapons),id+' selected weapons only');
        for(const profile of effective.profiles) {
          const card=profiles.find(record=>record.id===profile.id&&record.scopeId===profile.scopeId);
          const fields=new Map(profile.fields.map(field=>[field.label,field.value]));
          for(const [name,value] of Object.entries(fields.get('stats')||Object.fromEntries([...fields].filter(([key])=>['M','T','SV','W','LD','OC'].includes(key)))))
            assert.ok(card.fields.some(field=>['/'+name,'/stats/'+name].includes(field.source?.path)&&field.value===value),id+' complete effective statline '+name);
        }
        assert.ok([...profiles,...weapons].every(record=>record.instanceId===unit.instanceId),id+' physical record ownership');
        assert.ok(profiles.length&&weapons.length,id+' real model and selected weapon coverage');
        assert.ok(card.children.some(child=>['DATASHEET_SECTION','SUPPLEMENTAL_DATASHEET_RULE','RULE_REFERENCE'].includes(cards.get(child)?.kind)),id+' component rule content retained');
        const selections=[...(unit.selections||[]),...unit.modelRows.flatMap(row=>[...(row.selections||[]),...(row.loadouts||[]).flatMap(loadout=>loadout.selections||[])])];
        assert.deepEqual(new Set(card.rosterEquipmentIds),new Set(selections.filter(s=>s.physicalQuantity>0).flatMap(s=>s.canonicalEquipmentIds)),id+' selected equipment only');
      }
      assert.deepEqual(service.snapshot(),stateBefore,id+' presentation does not mutate roster');
      assert.deepEqual(service.projection,projectionBefore,id+' presentation does not execute/change effects');
      assert.deepEqual(book,canonicalBefore,id+' immutable canonical facts');
      assert.deepEqual(cards,cardsBefore,id+' immutable normal book cards');
      return view;
    }
    check([bodyguardId]);
    participantIds.forEach(fixture.attach);
    const expected=[bodyguardId,...original.units.filter(unit=>participantIds.includes(unit.instanceId)).map(unit=>unit.instanceId)];
    const attached=check(expected),attachedSerialized=serialize(attached);
    for(const participantId of participantIds) {
      fixture.detach(participantId);
      assert.deepEqual(projectFormedUnitCards(cards,service,participantId).components.map(c=>c.unit.instanceId),[participantId],id+' detached independent component');
    }
    check([bodyguardId]);
    [...participantIds].reverse().forEach(fixture.attach);
    assert.equal(serialize(check(expected)),attachedSerialized,id+' reattach/order independence');
    assert.deepEqual(service.state.units,original.units,id+' attachment retains all physical inputs');
    results.push({fixture:id,components:expected.length,profileScopes:attached.components.reduce((n,c)=>n+service.effective(c.unit.instanceId).profiles.length,0),
      attach:'PASS',detach:'PASS',reattach:'PASS',orderIndependence:'PASS'});
  }
  const synthetic=createSyntheticPersonalFixture('formed-independent');
  const group={formedUnitId:'formed-independent-group',bodyguardInstanceId:synthetic.unit.instanceId,
    memberInstanceIds:[synthetic.unit.instanceId,synthetic.duplicate.unit.instanceId]};
  const state={units:[synthetic.unit,synthetic.duplicate.unit]};
  const views=new Map([[synthetic.unit.instanceId,{...synthetic.effective,formedUnit:group}],
    [synthetic.duplicate.unit.instanceId,{...synthetic.duplicate.effective,formedUnit:group}]]);
  const roster={state,effective:id=>structuredClone(views.get(id))};
  const view=projectFormedUnitCards(synthetic.cards,roster,synthetic.unit.instanceId);
  assert.equal(view.components.length,2,'Same canonical datasheet never erases distinct physical components');
  assert.equal(new Set(view.components.map(c=>c.card.instanceId)).size,2);
  assert.equal([...view.components[1].variants.values()].flat().filter(c=>c.kind==='WEAPON_PROFILE').length,0,'Duplicate component without selected weapon remains independent');
  const stale=structuredClone(group);stale.memberInstanceIds.push('absent-physical-member');
  assert.throws(()=>projectFormedUnitCards(synthetic.cards,{state,effective:id=>({...views.get(id),formedUnit:stale})},synthetic.unit.instanceId),'Stale missing membership fails closed');
  assert.throws(()=>projectFormedUnitCards(synthetic.cards,{state,effective:id=>({...views.get(id),formedUnit:id===synthetic.unit.instanceId?group:null})},synthetic.unit.instanceId),'Detached component cannot linger');
  const ambiguous={datasheetPresentation:{referenceBindings:{fields:{one:[{targetId:'synthetic-ability',parameters:{distance:6},group:'ARMY RULES'}],
    two:[{targetId:'synthetic-ability',parameters:{distance:6},group:'CORE ABILITIES'}]}}}};
  assert.throws(()=>bindFixtureAbilityPresentation({profiles:[]},ambiguous),'Conflicting same-identity presentation categories fail closed');
  return {status:'PASS',fixtures:results,duplicateCanonicalComponents:'PASS',staleMembershipRejected:'PASS',
    physicalOwnership:'PASS',selectedInventory:'PASS',baseFactsMutated:0,rosterStateMutated:0,effectProjectionMutated:0,baselineEffectiveExtraction:'PASS'};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)console.log(JSON.stringify(runFormedUnitGuards()));

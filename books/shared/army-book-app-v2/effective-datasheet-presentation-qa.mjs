/** Independent synthetic display controls; no army factual imports. */
import {createSyntheticPersonalFixture} from './personal-datasheet-qa.mjs';
import {projectInstanceCards} from './personal.mjs';
import {groupDisplayRecords,profileDisplayKey,weaponDisplayKey,projectSelectedComposition,uniformProfileAnnotations} from './effective-datasheet-presentation.mjs';

export function createEffectivePresentationFixtures(){
  const cases=[];
  const add=(name,mutate,profiles,weapons)=>{const fixture=createSyntheticPersonalFixture('generic-effective-'+name);mutate(fixture);cases.push({name,fixture,profiles,weapons});};
  const selected=(f,id,count=1)=>({selectionKey:'explicit-'+id,canonicalProfileIds:[f.id(id)],canonicalEquipmentIds:[],physicalQuantity:count,perModelQuantity:count});
  add('identical',f=>{
    f.unit.modelRows[0].selections=[selected(f,'selected-weapon',2)];
    f.unit.modelRows[1].selections=[{...selected(f,'selected-weapon'),physicalQuantity:2}];
    f.unit.modelRows[2].selections=[{...selected(f,'selected-weapon'),physicalQuantity:3}];
  },1,1);
  add('different-statlines',f=>{f.effective.profiles[0].fields[0].value.W='3';f.effective.profiles[1].fields[0].value.T='5';},3,1);
  add('effect-splits-one-scope',f=>{f.effective.profiles[1].fields[0].value.M='8"';},2,1);
  add('equal-final-different-bases',f=>{f.effective.applied=f.effective.profiles.slice(0,2).map((profile,index)=>({
    operation:'MODIFY_STAT',field:'M',targetProfileId:profile.id,targetCompositionId:profile.scopeId,
    before:index?'5"':'4"',after:'6"',ruleId:f.id('numeric-source-'+index)}));},1,1);
  add('different-loadouts',f=>{
    const row=f.unit.modelRows[1];row.loadouts=[{loadoutId:'first',quantity:1,selections:[selected(f,'selected-weapon')]},
      {loadoutId:'second',quantity:1,selections:[selected(f,'unselected-weapon')]}];
  },1,1);
  add('different-weapon-stats',f=>{f.effective.weapons[1].fields.find(field=>field.label==='attacks').value='3';},1,2);
  add('different-weapon-abilities',f=>{f.effective.weapons[1].fields.find(field=>field.label==='abilities').value=['SUSTAINED HITS 2'];
    f.effective.weapons[2].fields.find(field=>field.label==='abilities').value=['SUSTAINED HITS 1'];},1,3);
  add('equivalent-ability-order',f=>{f.effective.weapons.forEach((weapon,index)=>weapon.fields.find(field=>field.label==='abilities').value=
    index%2?['HEAVY','ASSAULT']:['ASSAULT','HEAVY']);},1,1);
  const metrics=f=>{
    f.effective.profiles.forEach(profile=>profile.metrics={detectionRange:{modifier:3,max:12}});
    f.effective.applied=f.effective.profiles.map(profile=>({operation:'MODIFY_RULE_METRIC',field:'detectionRange',
      ruleId:f.id('metric-rule'),clauseId:f.id('metric-clause'),effectId:f.id('metric-effect'),sourceInstanceId:null,
      targetInstanceId:f.unit.instanceId,targetProfileId:profile.id,targetCompositionId:profile.scopeId,
      before:{modifier:0},after:{modifier:3,max:12},sourceFields:[{entityId:f.id('metric-rule'),path:'/text'}],lifetime:'WHILE_IN_ROSTER'}));
  };
  add('uniform-annotations',metrics,1,1);
  add('different-annotation-values',f=>{metrics(f);f.effective.profiles[1].metrics.detectionRange.modifier=2;},1,1);
  add('partial-annotation-applicability',f=>{metrics(f);delete f.effective.profiles[1].metrics.detectionRange;},1,1);
  add('different-annotation-owners',f=>{metrics(f);f.effective.applied[1].ruleId=f.id('other-metric-rule');},1,1);
  add('missing-annotation-provenance',f=>{metrics(f);f.effective.applied=[];},1,1);
  return cases;
}
export async function runEffectivePresentationGuards(){
  const {default:assert}=await import('node:assert/strict');
  const checks=[];
  for(const {name,fixture:f,profiles,weapons}of createEffectivePresentationFixtures()){
    const snapshot=()=>Object.fromEntries(Object.entries(f).filter(([,value])=>typeof value!=='function'));
    const before=structuredClone(snapshot()),variants=projectInstanceCards(f.cards,f.unit,f.effective);
    const modelCards=f.effective.profiles.map(profile=>variants.get(profile.id).find(card=>card.scopeId===profile.scopeId));
    const weaponCards=[...variants.values()].flat().filter(card=>card.kind==='WEAPON_PROFILE');
    const modelGroups=groupDisplayRecords(modelCards,profileDisplayKey),weaponGroups=groupDisplayRecords(weaponCards,weaponDisplayKey);
    assert.equal(modelGroups.length,profiles,name+' final MODEL statline partition');
    assert.equal(weaponGroups.length,weapons,name+' final weapon partition');
    assert.deepEqual(modelGroups.flatMap(group=>group.members).map(card=>[card.id,card.scopeId]).sort(),modelCards.map(card=>[card.id,card.scopeId]).sort());
    assert.equal(weaponGroups.reduce((sum,group)=>sum+group.quantity,0),f.effective.weapons.reduce((sum,weapon)=>sum+weapon.physicalQuantity,0));
    if(name.includes('annotation')){
      const uniform=uniformProfileAnnotations(modelGroups[0].members,f.effective.applied);
      assert.equal(uniform.length,name==='uniform-annotations'?1:0,name+' typed annotation intersection');
      if(uniform.length){
        assert.deepEqual(uniform[0].members.map(({card})=>[card.id,card.scopeId]),modelCards.map(card=>[card.id,card.scopeId]));
        assert.equal(uniform[0].field.displayValue,'+3" (maximum 12")');
        const altered=structuredClone(modelCards);altered[1].fields.find(field=>field.source.path==='/rosterMetrics/detectionRange').displayValue='A distinct display';
        assert.equal(uniformProfileAnnotations(altered,f.effective.applied).length,0,'Different displayed content stays scoped');
        const unrelated=structuredClone(modelCards);unrelated[1].fields.find(field=>field.source.path==='/rosterMetrics/detectionRange').source.path='/rosterMetrics/anotherMetric';
        assert.equal(uniformProfileAnnotations(unrelated,f.effective.applied).length,0,'Equal titles/text cannot merge different typed metrics');
      }
    }
    const composition=projectSelectedComposition(f.unit,variants.get(f.unit.canonicalUnitId)[0].rosterComposition);
    assert.equal(composition.groups.reduce((sum,group)=>sum+group.quantity,0),f.unit.startingStrength);
    if(name==='identical'){
      assert.equal(composition.groups.length,3,'Different imported roles remain distinct despite identical stats');
      assert.equal(composition.groups[0].equipment[0].perModel,2);assert.equal(composition.groups[0].equipment[0].total,2);
      assert.equal(composition.groups[1].equipment[0].perModel,1);assert.equal(composition.groups[1].equipment[0].total,2);
      assert.ok(composition.groups.flatMap(group=>group.equipment).every(item=>!item.selections[0].canonicalProfileIds.includes(f.id('unselected-weapon'))));
    }
    if(name==='different-loadouts'){
      const workers=composition.groups.filter(group=>group.label==='Gun models');assert.equal(workers.length,2);
      assert.notDeepEqual(workers[0].equipment,workers[1].equipment);
    }
    assert.equal(composition.inventory.length,1,'Aggregate selected inventory is not distributed to models');
    assert.equal(composition.inventory[0].total,1);
    const duplicate=projectInstanceCards(f.cards,f.duplicate.unit,f.duplicate.effective);
    assert.equal([...duplicate.values()].flat().filter(card=>card.kind==='WEAPON_PROFILE').length,0);
    assert.deepEqual(projectInstanceCards(f.cards,f.unit,f.effective),variants);
    assert.deepEqual(snapshot(),before,'Display grouping must not mutate canonical facts, imported state or effective records');
    checks.push(name);
  }
  const f=createSyntheticPersonalFixture('generic-modes'),row=f.unit.modelRows[0];
  row.selections=[{canonicalProfileIds:[f.id('selected-weapon'),f.id('unselected-weapon')],canonicalEquipmentIds:[],physicalQuantity:2,perModelQuantity:2}];
  const composition=projectSelectedComposition(f.unit,projectInstanceCards(f.cards,f.unit,f.effective).get(f.unit.canonicalUnitId)[0].rosterComposition);
  assert.equal(composition.groups[0].equipment.length,1);assert.equal(composition.groups[0].equipment[0].total,2,'Modes do not multiply equipment pieces');
  const legacy=structuredClone(f.unit);legacy.modelRows[0].quantity=3;delete legacy.modelRows[0].selections[0].perModelQuantity;
  legacy.modelRows[0].loadouts=[{loadoutId:'partition',quantity:1,selections:[]}];
  const uncertain=projectSelectedComposition(legacy,composition.groups.map(group=>({rowId:group.rowIds[0],label:group.label})));
  assert.equal(uncertain.inventory.filter(item=>item.rowId===row.rowId).length,1);
  assert.equal(uncertain.groups.filter(group=>group.rowIds.includes(row.rowId)).flatMap(group=>group.equipment).length,0,'Legacy scoped total must not be duplicated/distributed across partitions');
  legacy.modelRows[0].loadouts[0].quantity=legacy.modelRows[0].quantity;
  const fullRow=projectSelectedComposition(legacy,composition.groups.map(group=>({rowId:group.rowIds[0],label:group.label})));
  assert.equal(fullRow.inventory.filter(item=>item.rowId===row.rowId).length,0,'A preserved full-row total must not also appear in unit inventory');
  assert.equal(fullRow.groups.filter(group=>group.rowIds.includes(row.rowId)).flatMap(group=>group.equipment).length,1);
  assert.equal(fullRow.groups.find(group=>group.rowIds.includes(row.rowId)).equipment[0].perModel,null,'A known group total does not prove per-model multiplicity');
  checks.push('multimode-physical-multiplicity','unknown-ownership-fails-closed','legacy-full-row-total-once');
  const withOptions=structuredClone(legacy),option={canonicalProfileIds:[],canonicalEquipmentIds:[],
    canonicalOptionIds:['synthetic-keyword-option'],selectionField:'selectedMarkId',physicalQuantity:1,perModelQuantity:null};
  withOptions.selections.push(structuredClone(option));
  withOptions.modelRows[0].selections.push(structuredClone(option));
  withOptions.modelRows[0].loadouts[0].selections.push({...structuredClone(option),perModelQuantity:1});
  const optionBefore=structuredClone(withOptions),onlyItems=projectSelectedComposition(withOptions,[]);
  assert.deepEqual(onlyItems,projectSelectedComposition(legacy,[]),'Options must not change physical composition or inventory');
  assert.deepEqual(withOptions,optionBefore,'Display filtering must preserve imported options');
  withOptions.modelRows[0].loadouts[0].quantity=1;
  assert.ok(projectSelectedComposition(withOptions,[]).inventory.every(item=>item.selection.canonicalProfileIds.length||item.selection.canonicalEquipmentIds.length),
    'Option-only selections must not reappear as unallocated row totals');
  const noItems=structuredClone(f.unit);noItems.selections=[structuredClone(option)];
  for(const member of noItems.modelRows){member.selections=[structuredClone(option)];member.loadouts=[];}
  const empty=projectSelectedComposition(noItems,[]);assert.equal(empty.inventory.length,0);
  assert.ok(empty.groups.every(group=>group.equipment.length===0),'No empty item in MODEL equipment');
  assert.equal(empty.groups.reduce((sum,group)=>sum+group.quantity,0),noItems.modelRows.reduce((sum,member)=>sum+member.quantity,0));
  const physicalWithOption=structuredClone(f.unit);physicalWithOption.selections[0].canonicalOptionIds=['synthetic-equipment-option'];
  assert.deepEqual(projectSelectedComposition(physicalWithOption,[]).inventory[0].selection,physicalWithOption.selections[0],
    'An option annotation must not hide a real selected item');
  checks.push('option-only-unit-row-loadout-excluded','option-state-immutable','physical-items-with-options-preserved');
  return {status:'PASS',checks,armyFactualReads:0};
}
if(typeof process!=='undefined'&&process.argv?.[1]){const {pathToFileURL}=await import('node:url');
  if(import.meta.url===pathToFileURL(process.argv[1]).href)console.log(JSON.stringify(await runEffectivePresentationGuards()));}

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
/** Item identity is independent of physical selection keys and display prose. */
export async function runEquipmentGroupingGuards(project=projectSelectedComposition){
  const {default:assert}=await import('node:assert/strict');
  const checks=[],ref=(start=0,end=5,path='/text')=>({bookId:'synthetic',entityId:'option',path,caption:{start,end}});
  const gear=(selectionKey,identity,references=[ref()],quantity=1)=>({selectionKey,
    canonicalProfileIds:[],canonicalEquipmentIds:['option'],canonicalFieldPaths:{option:['/text']},
    physicalQuantity:quantity,perModelQuantity:quantity,sourceReferences:references,
    ...(identity?{sourceEquipmentIdentity:identity}:{})});
  const make=items=>({instanceId:'physical-unit-a',startingStrength:1,selections:[],modelRows:[{
    rowId:'model-a',canonicalProfileId:'profile',quantity:1,selections:items,loadouts:[]}]});
  const display=unit=>{const before=structuredClone(unit),result=project(unit,unit.modelRows.map(row=>({rowId:row.rowId,label:'Models'})));
    assert.deepEqual(unit,before,'Presentation must preserve every imported quantity, owner and provenance reference');return result;};
  const separate=make([gear('first','item-a'),gear('second','item-b')]);
  let result=display(separate),items=result.groups[0].equipment;
  assert.equal(items.length,2,'Different confirmed equipment identities sharing one option stay separate');
  assert.deepEqual(items.map(item=>[item.selections[0].sourceEquipmentIdentity,item.perModel,item.total]).sort(),[['item-a',1,1],['item-b',1,1]]);
  checks.push('different-confirmed-equipment-identities');

  const same=make([gear('first','item-a'),gear('another-physical-key','item-a',[ref(6,11)],2)]);
  result=display(same);assert.equal(result.groups[0].equipment.length,1,'Confirmed same item must not split by selection key or evidence location');
  const combined=result.groups[0].equipment[0];assert.equal(combined.perModel,3);assert.equal(combined.total,3);
  assert.deepEqual(combined.selections,same.modelRows[0].selections,'All source selections/provenance survive same-item merging');
  checks.push('same-equipment-different-selection-keys-merged');

  const spans=make([gear('first',null,[ref()]),gear('second',null,[ref(6,11)])]);
  assert.equal(display(spans).groups[0].equipment.length,2,'Legacy equipment source caption spans distinguish items within one paragraph');
  checks.push('legacy-reference-caption-identity');
  const fields=make([gear('first',null,[{entityId:'ability',path:'/blocks/0/text'}]),
    gear('second',null,[{entityId:'ability',path:'/blocks/1/text'}])]);
  assert.equal(display(fields).groups[0].equipment.length,2,'Legacy source FIELD addresses must not collapse');
  checks.push('legacy-reference-field-identity');
  const orderedRefs=[ref(),{entityId:'ability',path:'/blocks/0/text'}];
  const equivalent=make([gear('first',null,orderedRefs),gear('second',null,[...orderedRefs].reverse(),2)]);
  result=display(equivalent);assert.equal(result.groups[0].equipment.length,1,'Reference ordering is not a distinct item');
  assert.equal(result.groups[0].equipment[0].total,3);
  checks.push('legacy-equivalent-references-merged');
  const canonical=make([gear('first',null,[]),gear('second',null,[])]);
  assert.equal(display(canonical).groups[0].equipment[0].total,2,'Canonical-only legacy selections retain same-item grouping');
  canonical.modelRows[0].selections[1].canonicalEquipmentIds=['other-option'];
  canonical.modelRows[0].selections[1].canonicalFieldPaths={'other-option':['/text']};
  assert.equal(display(canonical).groups[0].equipment.length,2,'Different canonical equipment remains distinct without sourceEquipmentIdentity');
  checks.push('legacy-canonical-only-compatibility');

  const models=make([gear('first','item-a')]);models.startingStrength=2;
  models.modelRows.push({...structuredClone(models.modelRows[0]),rowId:'model-b',selections:[gear('second','item-a')]});
  result=display(models);assert.equal(result.groups.length,1);assert.equal(result.groups[0].quantity,2);
  assert.equal(result.groups[0].equipment[0].perModel,1);assert.equal(result.groups[0].equipment[0].total,2);
  assert.deepEqual(result.groups[0].rowIds,['model-a','model-b']);assert.equal(new Set(result.groups[0].scopeIds).size,2);
  const independent=structuredClone(models);independent.instanceId='physical-unit-b';independent.modelRows[0].selections=[gear('other','item-b')];
  assert.equal(display(independent).groups.length,2,'Independent MODEL loadouts stay partitioned');
  assert.deepEqual(display(models),result,'Another physical UNIT must not affect existing display');
  checks.push('same-items-across-models-owners-and-units-preserved');

  const unknown=make([]);unknown.selections=[{...gear('unit-only','item-a',undefined,2),perModelQuantity:null}];
  result=display(unknown);assert.equal(result.inventory.length,1);assert.equal(result.inventory[0].total,2);
  assert.deepEqual(result.inventory[0].selection,unknown.selections[0]);assert.equal(result.groups[0].equipment.length,0,'Known UNIT quantity does not invent a MODEL bearer');
  unknown.modelRows[0].selections=[gear('model-owned','item-a')];result=display(unknown);
  assert.equal(result.inventory[0].total,2);assert.equal(result.groups[0].equipment[0].total,1,'Known MODEL and unknown UNIT ownership must not be merged');
  checks.push('unknown-unit-owner-not-distributed-to-models');

  const loadouts=make([]);loadouts.modelRows[0].quantity=2;loadouts.startingStrength=2;
  loadouts.modelRows[0].loadouts=[{loadoutId:'loadout-a',quantity:1,selections:[gear('first','item-a')]},
    {loadoutId:'loadout-b',quantity:1,selections:[gear('second','item-b')]}];
  result=display(loadouts);assert.equal(result.groups.length,2);assert.equal(result.groups.reduce((sum,group)=>sum+group.quantity,0),2);
  assert.equal(new Set(result.groups.flatMap(group=>group.scopeIds)).size,2);
  checks.push('different-physical-loadout-equipment-identities');
  return checks;
}
async function equipmentGroupingMutations(){
  const {default:assert}=await import('node:assert/strict'),{readFile}=await import('node:fs/promises');
  const source=await readFile(new URL('./effective-datasheet-presentation.mjs',import.meta.url),'utf8');
  const changes=[
    ['equipment-identity-omitted',',equipmentIdentity(selection)', ''],
    ['different-confirmed-identities-collapsed',"['SOURCE_EQUIPMENT',selection.sourceEquipmentIdentity]","['SOURCE_EQUIPMENT',null]"],
    ['unique-selection-key-splits-same-item',"['SOURCE_EQUIPMENT',selection.sourceEquipmentIdentity]","['SOURCE_EQUIPMENT',selection.selectionKey]"],
    ['legacy-caption-span-lost','reference.caption?[reference.caption.start,reference.caption.end]:null','null'],
    ['legacy-source-field-lost','reference.entityId,reference.path','reference.entityId,null'],
    ['legacy-canonical-equipment-lost',"['EQUIPMENT',id,selection.canonicalFieldPaths?.[id]||[],equipmentIdentity(selection)]","['EQUIPMENT',equipmentIdentity(selection)]"]
  ];
  for(const [name,from,to]of changes){
    assert.ok(source.includes(from),'Mutation must exercise the current production grouping: '+name);
    const altered=source.replace(from,to),module=await import('data:text/javascript;base64,'+Buffer.from(altered).toString('base64'));
    await assert.rejects(()=>runEquipmentGroupingGuards(module.projectSelectedComposition),{name:'AssertionError'},name+' must fail the independent grouping oracle');
  }
  return changes.map(([name])=>name);
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
  const equipmentChecks=await runEquipmentGroupingGuards(),equipmentMutations=await equipmentGroupingMutations();
  return {status:'PASS',checks,equipmentChecks,equipmentMutations,armyFactualReads:0};
}
if(typeof process!=='undefined'&&process.argv?.[1]){const {pathToFileURL}=await import('node:url');
  if(import.meta.url===pathToFileURL(process.argv[1]).href)console.log(JSON.stringify(await runEffectivePresentationGuards()));}

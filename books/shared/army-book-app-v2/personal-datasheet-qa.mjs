/** Standalone Personal Guide presentation guards; synthetic canonical inputs only. */
import {projectArmyBook} from './project.mjs';
import {projectInstanceCards,projectFormedUnitCards} from './personal.mjs';
import {buildNormalDatasheetBindings} from './normal-datasheet-bindings.mjs';
import {buildDatasheetPresentation} from './datasheet-v1.mjs';

/** Browser guards may reuse these inputs, but assertions below are independent of DOM. */
export function createSyntheticPersonalFixture(prefix='synthetic-personal',nested=true) {
  const id=key=>`${prefix}:${key}`;
  const stats={M:'6"',T:'4',SV:'3+',W:'2',LD:'7+',OC:'1'};
  const profileIds=nested?[id('commander'),id('workers')]:[id('commander')];
  const weapon=key=>({id:id(key),kind:'WEAPON_PROFILE',parentId:id('unit'),data:{
    name:'Shared display weapon',mode:'ranged',range:'24"',attacks:'2',skill:'3+',strength:'4',ap:'0',damage:'1',abilities:[]}});
  const model={bookId:prefix,currentness:{currentness:'CURRENT',lastReconciledSource:'Synthetic source'},
    mfm:{source:{label:'Synthetic points'},unitBindings:[],detachmentBindings:[],enhancementBindings:[],paidUpgradeBindings:[],relations:[],eligibilityEvidenceBindings:[]},
    entities:[
      {id:id('unit'),kind:'DATASHEET',data:{name:'Shared display unit',profileIds,
        ...(nested?{keywordScopesId:id('keyword-scopes')}:{keywords:['INFANTRY'],factionKeywords:['SYNTHETIC']})}},
      {id:id('commander'),kind:'PROFILE',parentId:id('unit'),data:nested?
        {name:'Command model',stats:{...stats},keywordScopeIds:[id('all'),id('command'),id('faction')]}:{...stats}},
      ...(nested?[{id:id('workers'),kind:'PROFILE',parentId:id('unit'),data:{name:'Combat and Gun models',stats:{...stats},keywordScopeIds:[id('all'),id('faction')]}},
        {id:id('keyword-scopes'),kind:'KEYWORD_SCOPES',parentId:id('unit'),data:{scopes:[
          {id:id('all'),label:'ALL MODELS',keywords:['INFANTRY']},
          {id:id('command'),label:'COMMAND MODEL',keywords:['SPECIALIST']},
          {id:id('faction'),label:'FACTION KEYWORDS',keywords:['SYNTHETIC']}]}}]:[]),
      {id:id('base'),kind:'MODEL_BASE',parentId:id('commander'),data:{text:'(Ø32MM)',scope:'MODEL'}},
      weapon('selected-weapon'),weapon('unselected-weapon'),
      {id:id('instruction'),kind:'WEAPON_PROFILE_SELECTION',parentId:id('unit'),data:{text:'Choose one listed profile.',groups:[
        {id:id('weapon-group'),weaponProfileIds:[id('selected-weapon'),id('unselected-weapon')]}]}},
      {id:id('composition'),kind:'DATASHEET_SECTION',parentId:id('unit'),data:{title:'UNIT COMPOSITION',blocks:[
        {text:'- 1 Command model\n- 2 Gun models\n- 3 Combat models\nEvery model is equipped with: a default weapon.'}]}},
      {id:id('leader'),kind:'DATASHEET_SECTION',parentId:id('unit'),data:{title:'LEADER',blocks:[{text:'This model can lead the following unit: a synthetic receiver.'}]}},
      {id:id('equipment'),kind:'WARGEAR_OPTION',parentId:id('unit'),data:{text:'Selected canonical equipment.'}},
      {id:id('other-equipment'),kind:'WARGEAR_OPTION',parentId:id('unit'),data:{text:'Selected canonical equipment.'}},
      {id:id('note'),kind:'WARGEAR_FOOTNOTE',parentId:id('unit'),data:{text:'A construction-only restriction.'}},
      {id:id('weapon-rule'),kind:'SUPPLEMENTAL_DATASHEET_RULE',parentId:id('unit'),data:{text:'Bound weapon rule: source-backed effect.'}},
      {id:id('equipment-rule'),kind:'SUPPLEMENTAL_DATASHEET_RULE',parentId:id('unit'),data:{text:'Bound equipment rule: source-backed effect.'}},
      {id:id('other-unit'),kind:'DATASHEET',data:{name:'Shared display unit',profileIds:[id('other-profile')],keywords:['INFANTRY']}},
      {id:id('other-profile'),kind:'PROFILE',parentId:id('other-unit'),data:{...stats}},
      {id:id('foreign-option'),kind:'WARGEAR_OPTION',parentId:id('other-unit'),data:{text:'Selected canonical equipment.'}}
    ]};
  const records=new Map();
  const bindings={boundAbilities:[
    {unitId:id('unit'),itemId:id('selected-weapon'),ruleId:id('weapon-rule'),fieldPath:'/text'},
    {unitId:id('unit'),itemId:id('equipment'),ruleId:id('equipment-rule'),fieldPath:'/text'}],
    constructionNotes:[{unitId:id('unit'),noteId:id('note'),optionIds:[id('equipment')],standalone:false}]};
  const payload=projectArmyBook(model,records,{title:'Synthetic Personal Guide'});
  payload.datasheetPresentation=buildDatasheetPresentation(model,{units:{}},{records,bindings});
  const cards=new Map(payload.cards.map(card=>[card.id,card]));
  const instanceId=id('physical-a');
  const rows=nested?[
    {rowId:'command-row',canonicalProfileId:id('commander'),quantity:1,presentationLabel:'Command Alpha',compositionScope:'MODEL_ROW',selections:[],loadouts:[]},
    {rowId:'gun-row',canonicalProfileId:id('workers'),quantity:2,presentationLabel:'Gun models',compositionScope:'MODEL_ROW',selections:[],loadouts:[]},
    {rowId:'combat-row',canonicalProfileId:id('workers'),quantity:3,presentationLabel:'Combat models',compositionScope:'MODEL_ROW',selections:[],loadouts:[]}
  ]:[{rowId:'aggregate',canonicalProfileId:id('commander'),quantity:6,presentationLabel:'Import title must not become inferred ownership',compositionScope:'UNIT',selections:[],loadouts:[]}];
  const scope=(unitId,row)=>`${unitId}/${row.rowId}/PROFILE/${row.rowId}`;
  const unit={instanceId,canonicalUnitId:id('unit'),startingStrength:6,enhancementIds:[],modelRows:rows,
    selections:[{physicalQuantity:1,canonicalEquipmentIds:[id('equipment')],canonicalProfileIds:[],canonicalFieldPaths:[],
      sourceReferences:[{entityId:id('equipment-rule'),path:'/text'}]}]};
  const profiles=rows.map(row=>({id:row.canonicalProfileId,scopeId:scope(instanceId,row),quantity:row.quantity,ownerInstanceId:instanceId,
    modelInstanceId:row.quantity===1?row.rowId:null,fields:nested?[{label:'stats',value:{...stats}}]:Object.entries(stats).map(([label,value])=>({label,value})),
    keywords:row.rowId==='command-row'?['INFANTRY','SPECIALIST','SYNTHETIC']:['INFANTRY','SYNTHETIC'],abilities:[],metrics:{}}));
  const weaponData=model.entities.find(entity=>entity.id===id('selected-weapon')).data;
  const effective={instanceId,canonicalUnitId:id('unit'),startingStrength:6,keywords:['INFANTRY','SPECIALIST','SYNTHETIC'],
    profiles,weapons:rows.map(row=>({id:id('selected-weapon'),title:weaponData.name,ownerInstanceId:instanceId,
      physicalQuantity:row.quantity,scopeId:scope(instanceId,row),modelInstanceId:null,
      fields:Object.entries(weaponData).map(([label,value])=>({label,value:structuredClone(value)}))})),
    unitAbilities:[],applied:[],conditional:[]};
  const duplicate={unit:structuredClone(unit),effective:structuredClone(effective)};
  duplicate.unit.instanceId=id('physical-b');duplicate.effective.instanceId=duplicate.unit.instanceId;
  duplicate.unit.selections[0].physicalQuantity=0;
  for(const record of [...duplicate.effective.profiles,...duplicate.effective.weapons]) {
    record.ownerInstanceId=duplicate.unit.instanceId;record.scopeId=record.scopeId.replace(instanceId,duplicate.unit.instanceId);
  }
  duplicate.effective.weapons=[];
  duplicate.effective.keywords=['INFANTRY','SYNTHETIC'];
  return {id,model,records,bindings,payload,cards,unit,effective,duplicate};
}

export async function runPersonalDatasheetGuards() {
  const {default:assert}=await import('node:assert/strict');
  const checks=[],negativeControls=[];
  for(const [prefix,nested] of [['synthetic-flat',false],['synthetic-nested',true],['synthetic-independent',true]]) {
    const f=createSyntheticPersonalFixture(prefix,nested);
    const before=structuredClone({model:f.model,records:f.records,bindings:f.bindings,cards:f.cards,unit:f.unit,effective:f.effective});
    const variants=projectInstanceCards(f.cards,f.unit,f.effective),root=variants.get(f.unit.canonicalUnitId)[0];
    assert.deepEqual(root.rosterComposition,f.unit.modelRows.map(row=>({rowId:row.rowId,profileId:row.canonicalProfileId,
      quantity:row.quantity,label:nested?row.presentationLabel:'Shared display unit'})),'Actual composition uses explicit import groups, canonical profile fallback for aggregates');
    assert.equal(root.rosterComposition.reduce((n,row)=>n+row.quantity,0),f.unit.startingStrength);
    assert.ok(root.rosterComposition.every(row=>!Object.hasOwn(row,'modelInstanceId')),'Presentation must not invent individual-model ownership');
    if(nested)for(const label of ['Champion','Alpha','Princeps']) {
      const renamed=structuredClone(f.unit);renamed.modelRows[0].presentationLabel=label;
      const view=projectInstanceCards(f.cards,renamed,f.effective).get(f.unit.canonicalUnitId)[0];
      assert.equal(view.rosterComposition[0].label,label,'Explicit imported subtype labels must remain intact');
      assert.equal(view.rosterComposition[0].quantity,1);
    }
    assert.deepEqual(root.rosterEquipmentIds,[f.id('equipment')]);
    assert.equal(root.children.includes(f.id('other-equipment')),false,'Matching text does not establish selected equipment');
    assert.equal(variants.get(f.id('unselected-weapon'))?.length,0,'Unselected profiles remain absent');
    assert.equal(variants.get(f.id('selected-weapon')).length,f.unit.modelRows.length,'Selected weapon scopes remain separate');
    for(const row of f.unit.modelRows) {
      const weapon=variants.get(f.id('selected-weapon')).find(card=>card.scopeId.includes('/'+row.rowId+'/'));
      assert.equal(weapon.rosterQuantity,row.quantity);
      if(nested)assert.equal(weapon.presentationScope.label,row.presentationLabel);
      else assert.equal(weapon.presentationScope,undefined,'Aggregate imports must not manufacture model captions');
    }
    const selectionViews=variants.get(f.id('instruction'));
    assert.equal(selectionViews.length,f.unit.modelRows.length);
    assert.ok(selectionViews.every(card=>card.fields.filter(field=>field.targetIds).every(field=>!field.targetIds.includes(f.id('unselected-weapon')))));
    if(nested) {
      const labels=root.keywordGroups.map(group=>root.fields.find(field=>field.id===group.labelFieldId).value);
      assert.ok(labels.includes('Keywords'));
      assert.ok(labels.includes('Gun models (Combat and Gun models) · Model keywords'));
      assert.ok(labels.includes('Combat models (Combat and Gun models) · Model keywords'));
      const values=label=>{const group=root.keywordGroups.find(group=>root.fields.find(field=>field.id===group.labelFieldId).value===label);
        return group.fieldIds.map(id=>root.fields.find(field=>field.id===id).value);};
      assert.deepEqual(values('Gun models (Combat and Gun models) · Model keywords'),['INFANTRY']);
      assert.deepEqual(values('Combat models (Combat and Gun models) · Model keywords'),['INFANTRY']);
      assert.deepEqual(values('Command Alpha (Command model) · Model keywords'),['INFANTRY','SPECIALIST']);
      const changed=structuredClone(f.effective);changed.profiles[1].keywords.push('GUN_ONLY');
      const changedRoot=projectInstanceCards(f.cards,f.unit,changed).get(f.unit.canonicalUnitId)[0];
      const bags=changedRoot.keywordGroups.map(group=>({label:changedRoot.fields.find(field=>field.id===group.labelFieldId).value,
        values:group.fieldIds.map(id=>changedRoot.fields.find(field=>field.id===id).value)}));
      assert.ok(bags.find(group=>group.label.startsWith('Gun models')).values.includes('GUN_ONLY'));
      assert.ok(!bags.find(group=>group.label.startsWith('Combat models')).values.includes('GUN_ONLY'),'Same canonical profile must not collapse imported model scopes');
    } else assert.ok(root.fields.filter(field=>field.source?.path.startsWith('/keywords/')).every(field=>field.label==='Keywords'));
    const duplicate=projectInstanceCards(f.cards,f.duplicate.unit,f.duplicate.effective);
    const duplicateRoot=duplicate.get(f.unit.canonicalUnitId)[0];
    assert.deepEqual(duplicateRoot.rosterEquipmentIds,[],'Evidence without positive equipment quantity does not establish ownership');
    assert.ok(!duplicateRoot.children.includes(f.id('equipment')));
    assert.equal(duplicate.get(f.id('selected-weapon')).length,0);
    const evidenceOnly=structuredClone(f.unit);
    evidenceOnly.selections[0].canonicalEquipmentIds=[];
    const evidenceOnlyRoot=projectInstanceCards(f.cards,evidenceOnly,f.effective).get(f.unit.canonicalUnitId)[0];
    assert.deepEqual(evidenceOnlyRoot.rosterEquipmentIds,[],'Positive source evidence quantity is not canonical equipment selection');
    assert.ok(!evidenceOnlyRoot.children.includes(f.id('equipment')));
    assert.deepEqual(projectInstanceCards(f.cards,f.unit,f.effective),variants,'Independent duplicate projection must not contaminate first instance');
    assert.deepEqual(projectInstanceCards(f.cards,f.unit,f.effective),variants,'Repeated projection is deterministic');
    assert.deepEqual({model:f.model,records:f.records,bindings:f.bindings,cards:f.cards,unit:f.unit,effective:f.effective},before,'Presentation must not mutate canonical or effective inputs');
    const metadata=buildNormalDatasheetBindings(f.model,f.records,f.bindings);
    assert.deepEqual(metadata.boundAbilities,f.bindings.boundAbilities,'Bound ability identity is canonical, separately from evidence');
    assert.deepEqual(metadata.constructionNotes,f.bindings.constructionNotes);
    assert.deepEqual(buildDatasheetPresentation(f.model,{units:{}},{records:f.records,bindings:f.bindings}),f.payload.datasheetPresentation);
    const memberBindings=f.payload.datasheetPresentation.compositionMembers;
    assert.equal(memberBindings.length,1,'Canonical composition list has one display binding');
    const memberBinding=memberBindings[0];
    assert.deepEqual({unitId:memberBinding.unitId,sectionId:memberBinding.sectionId,fieldPath:memberBinding.fieldPath},
      {unitId:f.id('unit'),sectionId:f.id('composition'),fieldPath:'/blocks/0/text'});
    const source=f.model.entities.find(entity=>entity.id===memberBinding.sectionId).data.blocks[0].text;
    assert.deepEqual(memberBinding.spans.map(span=>source.slice(span.start,span.end)),
      ['- 1 Command model','- 2 Gun models','- 3 Combat models'],'Composition spans preserve exact source bullet text without default equipment prose');
    assert.ok(!memberBinding.spans.some(span=>source.slice(span.start,span.end).includes('default weapon')));
    checks.push(prefix+':composition-keyword-scope-inventory-immutable-deterministic');
  }
  // Aggregate loadout groups can share one canonical profile and keyword bag.
  // Distinguish the display scopes without inventing individual-model owners.
  {
    const f=createSyntheticPersonalFixture('synthetic-aggregate-loadouts');
    f.unit.modelRows=[{rowId:'aggregate-workers',canonicalProfileId:f.id('workers'),quantity:6,
      compositionScope:'UNIT',selections:[],loadouts:[{loadoutId:'a',quantity:2,selections:[]},{loadoutId:'b',quantity:4,selections:[]}]}];
    const worker=f.effective.profiles.find(profile=>profile.id===f.id('workers'));
    f.effective.profiles=['a','b'].map((key,index)=>({...structuredClone(worker),
      scopeId:`${f.unit.instanceId}/aggregate-workers/LOADOUT/${key}`,quantity:index?4:2,modelInstanceId:null}));
    f.effective.weapons=[];
    const root=projectInstanceCards(f.cards,f.unit,f.effective).get(f.unit.canonicalUnitId)[0];
    const labels=root.keywordGroups.map(group=>root.fields.find(field=>field.id===group.labelFieldId).value)
      .filter(label=>label.endsWith('Model keywords'));
    assert.equal(labels.length,2,'Two physical composition scopes remain represented');
    assert.equal(new Set(labels).size,2,'Uncaptioned repeated scopes must not create indistinguishable keyword groups');
    assert.ok(labels.every(label=>label.includes('Combat and Gun models')));
    assert.ok(labels.some(label=>/Group 1\b/.test(label)) && labels.some(label=>/Group 2\b/.test(label)));
    assert.deepEqual(root.rosterComposition,[{rowId:'aggregate-workers',profileId:f.id('workers'),quantity:6,label:'Combat and Gun models'}]);
    assert.ok(root.rosterComposition.every(row=>!Object.hasOwn(row,'modelInstanceId')));
    checks.push('aggregate-loadouts-repeat-profile-unique-keyword-captions');
  }
  // The selected Enhancement is a reference to its complete canonical card,
  // owned by one physical component even when a formed view contains both.
  {
    const f=createSyntheticPersonalFixture('synthetic-enhancement');
    const enhancementId=f.id('enhancement'),otherId=f.id('other-enhancement');
    f.model.entities.push(
      {id:f.id('detachment'),kind:'DETACHMENT',data:{name:'Synthetic detachment'}},
      {id:enhancementId,kind:'ENHANCEMENT',parentId:f.id('detachment'),data:{name:'Selected canonical Enhancement',
        text:'SYNTHETIC MODEL only. The bearer keeps this personal rule. While leading a unit, its unit has the following conditional benefit.',
        clauses:[{text:'When the stated battle event occurs, apply the source-defined benefit.'},
          {text:'Do not apply the benefit outside that condition.'}]}},
      {id:otherId,kind:'ENHANCEMENT',parentId:f.id('detachment'),data:{name:'Unselected canonical Enhancement',
        text:'An independent rule, never selected by matching its display title.'}},
      {id:f.id('granted-rule'),kind:'DETACHMENT_RULE',parentId:f.id('detachment'),data:{name:'Canonical granted rule',
        text:'When the stated condition is met, the source bearer’s unit receives this rule.'}});
    const payload=projectArmyBook(f.model,f.records,{title:'Synthetic selected Enhancement'});
    f.cards=new Map(payload.cards.map(card=>[card.id,card]));
    f.unit.enhancementIds=[enhancementId];
    f.effective.enhancements=[{canonicalId:enhancementId,ownerInstanceId:f.unit.instanceId,subject:'MODEL',
      modelScopeId:f.effective.profiles[0].scopeId,grantedRules:[{canonicalId:f.id('granted-rule'),sourceRuleId:enhancementId,
        clauseId:'synthetic-grant-clause',sourceInstanceId:f.unit.instanceId,sourceModelScopeId:f.effective.profiles[0].scopeId,
        subject:'UNIT',recipientInstanceIds:[f.unit.instanceId]}]}];
    const before=structuredClone({cards:f.cards,unit:f.unit,effective:f.effective,duplicate:f.duplicate});
    const rootOf=(unit,effective)=>projectInstanceCards(f.cards,unit,effective).get(unit.canonicalUnitId)[0];
    const root=rootOf(f.unit,f.effective);
    assert.deepEqual(root.rosterEnhancementIds,[enhancementId],'Selected Enhancement identity must reach the physical datasheet');
    assert.deepEqual(root.rosterEnhancements,f.effective.enhancements,
      'Declared granted-rule references retain physical source, model scope, recipients and canonical identities');
    assert.ok(!root.rosterEnhancementIds.includes(otherId),'Unselected canonical Enhancements must remain absent');
    assert.deepEqual(rootOf(f.duplicate.unit,f.duplicate.effective).rosterEnhancementIds,[],
      'A second instance of the same Datasheet must not inherit the bearer Enhancement');
    const legacyUnit=structuredClone(f.duplicate.unit);delete legacyUnit.enhancementIds;
    assert.deepEqual(rootOf(legacyUnit,f.duplicate.effective).rosterEnhancementIds,[],
      'A fixture without the optional selection list must not gain or invent Enhancements');
    const canonical=f.cards.get(enhancementId);
    assert.equal(canonical.kind,'ENHANCEMENT');
    assert.equal(canonical.parentId,f.id('detachment'),'The factual owner remains its canonical Detachment');
    const texts=canonical.fields.filter(field=>field.source.path==='/text'||/^\/clauses\/\d+\/text$/.test(field.source.path));
    assert.deepEqual(texts.map(field=>field.value),[
      'SYNTHETIC MODEL only. The bearer keeps this personal rule. While leading a unit, its unit has the following conditional benefit.',
      'When the stated battle event occurs, apply the source-defined benefit.',
      'Do not apply the benefit outside that condition.'
    ],'The referenced card retains eligibility, personal scope, leading condition and every conditional clause');
    assert.ok(texts.every(field=>field.source.entityId===enhancementId&&field.id===enhancementId+'::'+field.source.path),
      'Full text retains exact canonical field identities and provenance');
    const enhancement=projectInstanceCards(f.cards,f.unit,f.effective).get(enhancementId)?.[0];
    assert.ok(enhancement,'Selected Enhancement needs its complete presentation card, not only a name');
    assert.equal(enhancement.id,enhancementId);
    assert.equal(enhancement.instanceId,f.unit.instanceId,'The disposable Enhancement view identifies its physical bearer');
    assert.equal(enhancement.parentId,canonical.parentId,'The physical annotation must not reparent the canonical fact');
    assert.deepEqual(enhancement.fields,canonical.fields,'Every canonical field must reach the selected Enhancement view unchanged');
    const group={formedUnitId:'synthetic-enhancement-formed',bodyguardInstanceId:f.duplicate.unit.instanceId,
      memberInstanceIds:[f.duplicate.unit.instanceId,f.unit.instanceId]};
    const state={units:[f.unit,f.duplicate.unit]};
    const formed={state,effective:instanceId=>{
      const current=structuredClone(instanceId===f.unit.instanceId?f.effective:f.duplicate.effective);
      current.formedUnit=structuredClone(group);
      for(const enhancement of current.enhancements||[])for(const reference of enhancement.grantedRules)
        reference.recipientInstanceIds=[...group.memberInstanceIds];
      return current;
    }};
    for(const requested of group.memberInstanceIds){
      const view=projectFormedUnitCards(f.cards,formed,requested);
      assert.deepEqual(view.components.map(component=>[component.unit.instanceId,component.card.rosterEnhancementIds]),[
        [f.duplicate.unit.instanceId,[]],[f.unit.instanceId,[enhancementId]]
      ],'A formed view keeps the Enhancement on the exact physical bearer component');
      assert.deepEqual(view.components[1].card.rosterEnhancements[0].grantedRules[0].recipientInstanceIds,group.memberInstanceIds,
        'The source component retains the actual formed UNIT recipient reference without changing Enhancement ownership');
    }
    const detached={state,effective:instanceId=>structuredClone(instanceId===f.unit.instanceId?f.effective:f.duplicate.effective)};
    assert.deepEqual(projectFormedUnitCards(f.cards,detached,f.duplicate.unit.instanceId).components.map(component=>component.card.rosterEnhancementIds),[[]],
      'After detach, the former Bodyguard no longer displays the Character Enhancement');
    assert.deepEqual(projectFormedUnitCards(f.cards,detached,f.unit.instanceId).components.map(component=>component.card.rosterEnhancementIds),[[enhancementId]],
      'Detach preserves the selected Enhancement on its bearer');
    const removed=structuredClone(f.unit),removedEffective=structuredClone(f.effective);
    removed.enhancementIds=[];removedEffective.enhancements=[];
    assert.deepEqual(rootOf(removed,removedEffective).rosterEnhancementIds,[],'Removing the selection removes its presentation reference');
    assert.deepEqual(rootOf(removed,removedEffective).rosterEnhancements,[],'Removal also removes dependent canonical granted-rule references');
    assert.deepEqual(rootOf(f.unit,f.effective).rosterEnhancementIds,[enhancementId],'Reselect/recompute must not accumulate or lose references');
    assert.deepEqual({cards:f.cards,unit:f.unit,effective:f.effective,duplicate:f.duplicate},before,
      'Enhancement projection and attachment transitions must not mutate canonical facts or physical inputs');
    for(const [label,mutate] of [
      ['Enhancement wrong physical owner',item=>{item.ownerInstanceId=f.duplicate.unit.instanceId;}],
      ['Enhancement unselected canonical source',item=>{item.canonicalId=otherId;}],
      ['granted rule foreign source rule',item=>{item.grantedRules[0].sourceRuleId=otherId;}],
      ['granted rule foreign physical source',item=>{item.grantedRules[0].sourceInstanceId=f.duplicate.unit.instanceId;}],
      ['granted rule missing physical recipient',item=>{item.grantedRules[0].recipientInstanceIds=[f.duplicate.unit.instanceId];}],
      ['granted rule unresolved canonical target',item=>{item.grantedRules[0].canonicalId=f.id('missing-granted-rule');}]
    ]){
      const changed=structuredClone(f.effective);mutate(changed.enhancements[0]);
      assert.throws(()=>rootOf(f.unit,changed),TypeError,label);negativeControls.push(label);
    }
    checks.push('enhancement-full-canonical-reference-physical-owner-formed-detach-remove-immutable');
  }
  const invalid=[
    ['note absent',f=>{f.bindings.constructionNotes[0].noteId=f.id('missing-note');}],
    ['note wrong kind',f=>{f.bindings.constructionNotes[0].noteId=f.id('equipment');}],
    ['note wrong owner',f=>{f.bindings.constructionNotes[0].unitId=f.id('other-unit');}],
    ['note no options',f=>{f.bindings.constructionNotes[0].optionIds=[];}],
    ['note wrong option kind',f=>{f.bindings.constructionNotes[0].optionIds=[f.id('selected-weapon')];}],
    ['note foreign option',f=>{f.bindings.constructionNotes[0].optionIds=[f.id('foreign-option')];}],
    ['note standalone not prohibited',f=>{f.bindings.constructionNotes[0].standalone=true;}],
    ['note standalone unspecified',f=>{delete f.bindings.constructionNotes[0].standalone;}],
    ['bound ability absent',f=>{f.bindings.boundAbilities[0].ruleId=f.id('missing-rule');}],
    ['bound item foreign owner',f=>{f.bindings.boundAbilities[0].itemId=f.id('foreign-option');}],
    ['bound item wrong kind',f=>{f.bindings.boundAbilities[0].itemId=f.id('commander');}],
    ['bound field absent',f=>{f.bindings.boundAbilities[0].fieldPath='/missing';}],
    ['bound owner conflict',f=>{f.bindings.boundAbilities.push({...f.bindings.boundAbilities[0],itemId:f.id('equipment')});}]
  ];
  for(const [label,mutate]of invalid){const f=createSyntheticPersonalFixture();mutate(f);
    assert.throws(()=>buildNormalDatasheetBindings(f.model,f.records,f.bindings),undefined,label);negativeControls.push(label);}
  const left=createSyntheticPersonalFixture('left-book'),right=createSyntheticPersonalFixture('right-book');
  assert.throws(()=>buildNormalDatasheetBindings(left.model,left.records,right.bindings),'Independent registries must not join matching display titles');
  assert.throws(()=>projectInstanceCards(left.cards,left.unit,right.effective),'Wrong physical/canonical projection fails closed');
  checks.push('independent-registries-same-display-titles');
  return {status:'PASS',checks,negativeControls:negativeControls.length+2,mutations:negativeControls,armyFactualReads:0};
}

if(typeof process!=='undefined' && process.argv?.[1]) {
  const {pathToFileURL}=await import('node:url');
  if(import.meta.url===pathToFileURL(process.argv[1]).href)console.log(JSON.stringify(await runPersonalDatasheetGuards()));
}

/** Disposable normal-book projection. The canonical catalog remains the sole factual owner. */
import fs from 'node:fs';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {buildCSMContracts} from './rule-contract-build.mjs';
import {createCSMCompatibilityCompiler} from './rule-contract-context.mjs';
import {projectArmyBook} from '../../shared/army-book-app-v2/project.mjs';
import {buildDatasheetPresentation} from '../../shared/army-book-app-v2/datasheet-v1.mjs';
import {createEffectiveCoreCatalog} from '../../core-rules/content/effective-core-catalog.mjs';
import {renderCompatibilityEntry} from '../../shared/application-v2/compatibility.mjs';
import {buildPresentationReferences,referenceDeclaration} from './presentation-reference-build.mjs';
import {buildCSMRosterPresentation} from './roster-presentation.mjs';
import {modelBaseDisplayValue} from '../../shared/army-book-app-v2/model-base-presentation.mjs';

const read=name=>JSON.parse(fs.readFileSync(new URL(name,import.meta.url),'utf8'));
const aliases={MODEL_PROFILE:'PROFILE',CORE_ABILITY_MEMBERSHIP:'RULE_REFERENCE',ARMY_RULE_MEMBERSHIP:'RULE_REFERENCE',
  DATASHEET_ABILITY:'SUPPLEMENTAL_DATASHEET_RULE',EQUIPMENT_ABILITY:'SUPPLEMENTAL_DATASHEET_RULE',
  UNIT_COMPOSITION:'DATASHEET_SECTION',ATTACHMENT_DECLARATION:'DATASHEET_SECTION',TRANSPORT_DECLARATION:'DATASHEET_SECTION',
  SPECIAL_DATASHEET_RULE:'DATASHEET_SECTION',UPGRADE_DECLARATION:'DATASHEET_SECTION',
  POINTS_SCHEDULE_ROW:'MFM_UNIT_POINTS',PAID_WARGEAR_COST:'MFM_PAID_UPGRADE',FAQ:'SOURCE_UPDATE_REFERENCE',OFFICIAL_UPDATE:'SOURCE_UPDATE_REFERENCE',ERRATA:'SOURCE_UPDATE_REFERENCE'};
const visiblePaths={DATASHEET:[],PROFILE:['name','stats'],WEAPON_PROFILE:['name','mode','range','attacks','skill','strength','ap','damage','abilities'],
  RULE_REFERENCE:['label'],SUPPLEMENTAL_DATASHEET_RULE:['text'],WARGEAR_OPTION:['text'],DATASHEET_SECTION:['blocks','equipmentAndRules'],
  MFM_UNIT_POINTS:['sourceLabel','minModels','maxModels','value'],MFM_PAID_UPGRADE:['title','sourceLabel','value'],
  DETACHMENT:['title'],DETACHMENT_RULE:['title','text','blocks','content'],ARMY_RULE:['title','text','blocks'],
  ENHANCEMENT:['title','text'],STRATAGEM:['title','cp','category','lines'],
  SOURCE_UPDATE_REFERENCE:['officialQuestion','officialAnswer','instruction','text'],UPGRADE_OPTION:['text'],NAMED_RULE_COMPONENT:['text'],
  STRUCTURED_RULE_TABLE:['rows'],COMPOSITION_MEMBER:['sourceText'],MODEL_BASE_METADATA:['text'],
  KEYWORD_MEMBERSHIP:['keyword'],FACTION_KEYWORD:['keyword'],DETACHMENT_ROSTER_METADATA:['title','detachmentPoints','forceDispositions','qualifiers'],
  ENHANCEMENT_COST_QUALIFIERS:['title','value','qualifiers']};

export function buildApp(built=buildCSMContracts(),{relatedRules}={}){
  const facts=built.facts,index=new Map(facts.entities.map(e=>[e.id,e]));
  const sourceToCanonical=new Map(facts.entities.flatMap(e=>(e.provenance||[]).map(p=>[p.sourceEntityId,e.id])));
  const attachmentRoles=new Map(read('./roster-attachment-bindings.json').declarations.map(binding=>[binding.declarationId,binding.role]));
  const contracts=new Map(built.book.entities.filter(e=>e.ruleContract).map(e=>[e.id,e.ruleContract]));
  const model={...facts,entities:facts.entities.map(entity=>({...structuredClone(entity),label:entity.displayName,
    kind:aliases[entity.kind]||entity.kind,parentId:entity.ownerId===facts.bookId?undefined:entity.ownerId,
    ...(contracts.has(entity.id)?{ruleContract:contracts.get(entity.id)}:{})})),
    currentness:{currentness:'CURRENT',lastReconciledSource:'Accepted current source corpus'},
    mfm:{source:{label:''},unitBindings:[],detachmentBindings:[],enhancementBindings:[],paidUpgradeBindings:[],relations:[],eligibilityEvidenceBindings:[]}};
  for(const unit of model.entities.filter(e=>e.kind==='DATASHEET'))unit.data.profileIds=unit.data.modelProfileIds;
  const payload=projectArmyBook(model,new Map(),{title:'Chaos Space Marines',edition:'11th Edition'});
  const cards=new Map(payload.cards.map(c=>[c.id,c]));
  const mfmSource=read('../sources/official-mfm-v1.5.json');
  for(const entity of facts.entities.filter(e=>e.kind==='POINTS_SCHEDULE_ROW')){
    const occurrence=entity.provenance.find(p=>p.document.endsWith('/official-mfm-v1.5.json'));
    const address=occurrence.location.split('/').slice(0,-2),schedule=address.slice(1).reduce((value,key)=>value[key],mfmSource);
    const unitAddress=address.slice(0,-2),sourceUnit=unitAddress.slice(1).reduce((value,key)=>value[key],mfmSource);
    assert.ok(schedule.entries.some(entry=>entry.value===entity.data.value&&entry.sourceLabel===entity.data.sourceLabel),'Points source scope drift');
    if(sourceUnit.pointSchedules.length>1){
      cards.get(entity.id).pointsSchedule={label:schedule.maxCopies==null?`Units ${schedule.minCopies}+`:
        schedule.minCopies===schedule.maxCopies?`Unit ${schedule.minCopies}`:`Units ${schedule.minCopies}–${schedule.maxCopies}`,
        source:{...occurrence,location:address.join('/')}};
    }
  }
  const addField=(entity,path,value,label)=>{
    const field={id:entity.id+'::'+path,label,value:structuredClone(value),type:'text',contextId:entity.ownerId,
      source:{entityId:entity.id,path},presentation:path==='/displayName'?'heading':undefined};
    cards.get(entity.id).fields.push(field);
    payload.factManifest.push({id:field.id,entityId:entity.id,path:path.slice(1).split('/'),value:structuredClone(value),cardId:entity.id,contextId:entity.ownerId,ownerType:'CANONICAL_V2'});
    return field;
  };
  const relocate=(field,from,to,path)=>{from.fields=from.fields.filter(f=>f!==field);to.fields.push(field);if(path)field.presentationPath=path;};
  const roles={};
  for(const entity of facts.entities){
    const card=cards.get(entity.id),allowed=new Set(visiblePaths[card.kind]||[]);
    card.title=entity.displayName;card.provenance=structuredClone(entity.provenance);
    card.fields=card.fields.filter(f=>allowed.has(f.source.path.split('/')[1]));
    if(['ARMY_RULE','DETACHMENT_RULE','DETACHMENT','ENHANCEMENT','STRATAGEM','DATASHEET','DATASHEET_SECTION'].includes(card.kind)&&!card.fields.some(f=>f.presentation==='heading'))addField(entity,'/displayName',entity.displayName,'Title');
    if(card.kind==='PROFILE')for(const field of card.fields)if(field.source.path.startsWith('/stats/'))field.presentationPath=field.source.path.slice('/stats'.length);
    if(card.kind==='RULE_REFERENCE')card.referenceGroupLabel=referenceDeclaration({...entity,kind:'RULE_REFERENCE'}).group;
    if(card.kind==='ARMY_RULE'||card.kind==='DETACHMENT_RULE')for(const field of card.fields.filter(f=>/^\/blocks\/\d+\/text$/.test(f.source.path)))field.presentationPath=field.source.path.replace('/blocks/','/clauses/');
    if(card.kind==='DETACHMENT_RULE')for(const field of card.fields.filter(f=>/^\/content\/\d+\/text$/.test(f.source.path)))field.presentationPath=field.source.path.replace('/content/','/clauses/');
    if(card.kind==='DATASHEET_SECTION'){
      const role={UNIT_COMPOSITION:'composition',ATTACHMENT_DECLARATION:'leader',TRANSPORT_DECLARATION:'transport'}[entity.kind]||'additional';
      roles[entity.id]=role;
      const heading=card.fields.find(f=>f.presentation==='heading');
      if(heading&&role!=='additional')heading.displayValue=role==='leader'&&attachmentRoles.get(entity.id)==='SUPPORT'
        ?'Support':{composition:'Unit Composition',leader:'Leader',transport:'Transport'}[role];
      for(const field of card.fields.filter(f=>/^\/equipmentAndRules\/\d+\/text$/.test(f.source.path)))field.presentationPath=field.source.path.replace('/equipmentAndRules/','/blocks/');
    }
    if(entity.kind==='FAQ')for(const [i,field]of card.fields.entries()){
      if(field.source.path==='/officialQuestion'){field.label='Question';field.presentation='heading';}
      else{field.label='Answer';field.presentationPath=`/clauses/${i}/text`;}
    }
    if(entity.kind==='OFFICIAL_UPDATE')for(const field of card.fields)field.presentationPath='/text';
  }
  for(const entity of facts.entities){
    const card=cards.get(entity.id),parent=cards.get(entity.ownerId);
    if(entity.kind==='COMPOSITION_MEMBER'){
      const composition=facts.entities.find(e=>e.kind==='UNIT_COMPOSITION'&&e.ownerId===entity.ownerId&&e.data.memberIds.includes(entity.id));
      assert.ok(composition,'Unbound composition member');
      const target=cards.get(composition.id),offset=target.fields.filter(f=>/^\/blocks\//.test(f.presentationPath||f.source.path)).length;
      for(const field of [...card.fields])relocate(field,card,target,`/blocks/${offset}/text`);
    }
    if(['UPGRADE_OPTION','NAMED_RULE_COMPONENT'].includes(entity.kind)){
      const offset=parent.fields.filter(f=>/^\/blocks\//.test(f.presentationPath||f.source.path)).length;
      for(const field of card.fields)parent.fields.push({...field,presentationPath:`/blocks/${offset}/text`});
    }
    if(entity.kind==='MODEL_BASE_METADATA'){
      const composition=facts.entities.find(e=>e.kind==='UNIT_COMPOSITION'&&e.ownerId===entity.ownerId);
      const target=cards.get(composition.id),field=card.fields[0];
      // Preserve source-bound model captions when base declarations have
      // different recipients, including exceptions within a model profile.
      const bases=facts.entities.filter(e=>e.kind==='MODEL_BASE_METADATA'&&e.ownerId===entity.ownerId);
      const displayValue=modelBaseDisplayValue(entity,bases,id=>index.get(sourceToCanonical.get(id)),
        facts.entities.filter(e=>e.kind==='COMPOSITION_MEMBER'&&e.ownerId===entity.ownerId));
      if(displayValue!==undefined)field.displayValue=displayValue;
      // A separate details paragraph belongs to composition, never Weapons.
      field.label='Base';relocate(field,card,target,`/blocks/${100+target.fields.length}/text`);
    }
    if(entity.kind==='STRUCTURED_RULE_TABLE')for(const field of [...card.fields]){
      const [,row,column]=field.source.path.slice(1).split('/');
      field.presentation='table-cell';field.table={id:entity.id+'::/rows',row:Number(row),column:Number(column)};
      parent.fields.push({...field});
    }
  }
  const keywordFields=new Map(facts.entities.filter(e=>['KEYWORD_MEMBERSHIP','FACTION_KEYWORD'].includes(e.kind)).map(e=>[e.id,cards.get(e.id).fields[0]]));
  for(const unit of facts.entities.filter(e=>e.kind==='DATASHEET')){
    const card=cards.get(unit.id),members=facts.entities.filter(e=>e.kind==='COMPOSITION_MEMBER'&&e.ownerId===unit.id);
    const keywords=facts.entities.filter(e=>['KEYWORD_MEMBERSHIP','FACTION_KEYWORD'].includes(e.kind)&&e.ownerId===unit.id);
    card.keywordGroups=[];
    const scopes=new Map();
    for(const member of members){
      const rows=keywords.filter(e=>e.data.compositionMemberSourceIds.includes(member.id));
      const key=JSON.stringify(rows.map(e=>e.id));
      if(!scopes.has(key))scopes.set(key,{members:[],rows});scopes.get(key).members.push(member);
    }
    for(const {members:recipients,rows}of scopes.values())for(const faction of [false,true]){
      const selected=rows.filter(e=>(e.kind==='FACTION_KEYWORD')===faction);if(!selected.length)continue;
      const profileIds=[...new Set(recipients.map(e=>e.data.composition.modelProfileSourceId))];
      const wholeProfile=profileIds.length===1&&members.filter(e=>e.data.composition.modelProfileSourceId===profileIds[0]).length===recipients.length;
      const labelOwner=scopes.size===1?unit:wholeProfile?index.get(profileIds[0]):recipients[0];
      const label={id:labelOwner.id+'::keyword-caption:'+card.keywordGroups.length,label:'Scope',value:labelOwner.displayName,type:'text',
        displayValue:(scopes.size===1?'':(wholeProfile?labelOwner.displayName:recipients.map(e=>e.data.composition.name).join(' / '))+' · ')+(faction?'Faction Keywords':'Keywords'),
        contextId:unit.id,source:{entityId:labelOwner.id,path:'/displayName'}};
      card.fields.push(label);
      const fieldIds=[];
      for(const row of selected){const owner=cards.get(row.id),field=keywordFields.get(row.id);field.presentationPath=`/${faction?'factionKeywords':'keywords'}/${fieldIds.length}`;if(!card.fields.includes(field))relocate(field,owner,card);fieldIds.push(field.id);}
      card.keywordGroups.push({scopeId:recipients.map(e=>e.id).join('|'),profileIds,labelFieldId:label.id,fieldIds});
    }
  }
  const bindingData=read('./presentation-bindings.json'),appBindings=read('./app-datasheet-bindings.json');
  for(const binding of appBindings.tableStructures){
    const source=fs.readFileSync(new URL('../../../'+binding.source.document,import.meta.url),'utf8');
    assert.equal(crypto.createHash('sha256').update(source).digest('hex'),binding.source.sha256,'Source table structure drift');
    const owner=cards.get(binding.tableId),parent=cards.get(owner.parentId);
    for(const cell of binding.cells){
      const field=owner.fields.find(field=>field.source.path===cell.fieldPath);
      assert.ok(field?.table,'Unbound presentation table cell');
      Object.assign(field.table,{rowSpan:cell.rowSpan,columnSpan:cell.columnSpan,header:cell.header});
      if(cell.displayValue!==undefined){
        assert.equal(cell.displayValue.replace(/\s/g,''),String(field.value).replace(/\s/g,''),'Source table text changed');
        field.displayValue=cell.displayValue;
      }
      Object.assign(parent.fields.find(candidate=>candidate.id===field.id),structuredClone(field));
    }
  }
  // Instructions are enrolled presentation source occurrences, not inferred from profile count.
  const instruction=bindingData.instructionBindings[0];
  const html=fs.readFileSync(new URL('../../../'+instruction.sourceDocument,import.meta.url),'utf8');
  const instructionText=html.match(/<span id="tooltip_contenttooltipPointy"><i>([^<]+)<\/i><\/span>/)?.[1];
  assert.equal(crypto.createHash('sha256').update(instructionText).digest('hex'),instruction.expectedTextSha256,'Enrolled instruction drift');
  const profileSelections=bindingData.weaponProfileGroups.map(group=>({unitId:sourceToCanonical.get(group.ownerSourceId),groupId:group.id,
    profileIds:group.weaponProfileSourceIds,instructionId:group.instructionId,text:instructionText,
    source:{sourceId:instruction.sourceDocument,pointer:instruction.selector,sha256:instruction.expectedTextSha256}}));
  const records=new Map(facts.entities.filter(e=>e.kind==='PAID_WARGEAR_COST').map(e=>[e.id,{...e.data,id:e.id,recordType:'MFM_PAID_UPGRADE'}]));
  const optionCosts=facts.entities.filter(e=>e.kind==='PAID_WARGEAR_COST').flatMap(e=>e.data.weaponProfileIds.map(itemId=>({unitId:e.ownerId,itemId,optionIds:e.data.optionIds,costRecordId:e.id})));
  const boundAbilities=[...appBindings.boundAbilities,...bindingData.equipmentAbilityBindings.map(binding=>({unitId:sourceToCanonical.get(binding.ownerSourceId),
    itemId:binding.equipmentSourceId,ruleId:binding.abilitySourceId,fieldPath:'/text'}))];
  for(const visual of appBindings.tableVisuals){
    const evidence=visual.source,asset=new URL(visual.asset,import.meta.url);
    assert.equal(crypto.createHash('sha256').update(fs.readFileSync(asset)).digest('hex'),evidence.assetSha256,'Source icon drift');
    const owner=cards.get(visual.tableId),field=owner.fields.find(f=>f.source.path===visual.fieldPath);assert.equal(field.value,'');
    const visualView={url:'../books/chaos-space-marines/assets/'+fileURLToPath(asset).split(/[\\/]/).at(-1),alt:visual.alt,width:visual.width,height:visual.height};
    field.visual=visualView;cards.get(owner.parentId).fields.find(f=>f.id===field.id).visual=visualView;
  }
  const layoutModel={...model,entities:model.entities.map(e=>e.kind==='DATASHEET_SECTION'?{...e,data:{...e.data,title:e.displayName}}:e)};
  payload.datasheetPresentation=buildDatasheetPresentation(layoutModel,{units:{}},{bindings:{profileSelections,optionCosts,boundAbilities},records});
  Object.assign(payload.datasheetPresentation,{sectionRoles:roles,rosterEffectSummary:false,rosterKeywordLabel:'Keywords',basePlacement:'composition',compactPointsLabels:true});
  const reference=buildPresentationReferences({model,cards:payload.cards,coreCatalog:createEffectiveCoreCatalog()});
  payload.cards.push(...reference.coreCards);payload.glossary=reference.glossaryIndex;payload.datasheetPresentation.referenceBindings=reference.referenceBindings;
  payload.bookPresentation={schema:'army-book-app-v2/book-v1-presentation',coverImage:'../assets/chaos-space-marines-cover-800.webp',records:{}};
  for(const entity of model.entities){
    const record=payload.bookPresentation.records[entity.id]={id:entity.id,kind:entity.kind,provenance:entity.provenance,tables:[]};
    if(entity.kind==='DETACHMENT'){
      record.ruleId=entity.data.ruleIds[0];assert.equal(entity.data.ruleIds.length,1);
      record.enhancementIds=entity.data.enhancementIds;record.stratagemIds=entity.data.stratagemIds;
      const points=model.entities.find(e=>e.kind==='DETACHMENT_ROSTER_METADATA'&&e.parentId===entity.id);
      record.pointRecordId=points.id;record.detachmentPoints=cards.get(points.id).fields.find(f=>f.source.path==='/detachmentPoints');
      record.forceDispositions=cards.get(points.id).fields.filter(f=>f.source.path.startsWith('/forceDispositions/'));
      record.qualifiers=points.data.qualifiers.map((qualifier,i)=>({
        kind:cards.get(points.id).fields.find(field=>field.source.path===`/qualifiers/${i}/kind`),
        value:cards.get(points.id).fields.find(field=>field.source.path===`/qualifiers/${i}/value`)}));
    }
    if(entity.kind==='ENHANCEMENT')record.pointRecordId=entity.data.costRecordIds[0];
  }
  payload.groups.find(g=>g.id==='updates').itemIds=facts.entities.filter(e=>['FAQ','OFFICIAL_UPDATE','ERRATA'].includes(e.kind)&&!e.factOwnerId).map(e=>e.id);
  payload.groups=payload.groups.filter(group=>group.itemIds.length);
  if(relatedRules){assert.equal(relatedRules.authority,'DISPOSABLE_PROJECTION');payload.relatedRules=relatedRules;}else{
  const compiler=createCSMCompatibilityCompiler(built,built.schema.evaluator),kinds=['STRATAGEM','ENHANCEMENT'];
  const base=compiler.compileRows({kinds,order:'UNIT_RULE',sort:true});
  const selected=compiler.compileRows({kinds,order:'UNIT_RULE',sort:true,contextForRule:rule=>({detachmentId:rule.ruleContract.detachmentId})});
  const chosen=new Map(selected.rows.map(row=>[row.unitId+'\0'+row.ruleId,row]));
  const ruleIndex=new Map(built.book.entities.map(e=>[e.id,e]));
  const result=row=>({state:row.state,applicability:row.applicability,roles:row.roles});
  payload.relatedRules={schema:'army-book-related-rules/v2',authority:'DISPOSABLE_PROJECTION',
    contextPolicy:{roster:'UNKNOWN',battle:'UNKNOWN',formation:'UNKNOWN'},coreStratagemsStatus:'DEFERRED_NEEDS_CONTRACTS',
    rows:base.rows.map(row=>({unitId:row.unitId,ruleId:row.ruleId,kind:ruleIndex.get(row.ruleId).kind,detachmentId:ruleIndex.get(row.ruleId).ruleContract.detachmentId,
      ...result(row),selectedDetachment:result(chosen.get(row.unitId+'\0'+row.ruleId))}))};
  }
  assert.ok(payload.relatedRules.rows.every(row=>row.state!=='INVALID'&&row.selectedDetachment.state!=='INVALID'));
  payload.ruleContractIds=built.book.entities.filter(e=>e.ruleContract).map(e=>e.id);
  payload.rosterPresentation=buildCSMRosterPresentation(facts);
  return payload;
}
export function writeApp({check=false}={}){
  const payload=buildApp();
  for(const [name,value]of [['./generated/app-presentation.json',JSON.stringify(payload,null,2)+'\n'],['./app.html',renderCompatibilityEntry({title:'Chaos Space Marines',bookId:'chaos-space-marines'})]]){
    const file=new URL(name,import.meta.url);if(check)assert.equal(fs.readFileSync(file,'utf8'),value,'Stale CSM presentation');else{fs.mkdirSync(new URL('./generated/',import.meta.url),{recursive:true});fs.writeFileSync(file,value);}
  }
  return payload;
}
if(process.argv[1]===fileURLToPath(import.meta.url)){const p=writeApp({check:process.argv.includes('--check')});console.log(JSON.stringify({status:'PASS',cards:p.cards.length,contracts:p.ruleContractIds.length}));}

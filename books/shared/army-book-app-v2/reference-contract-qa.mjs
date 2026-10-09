/** Independent reference controls. No army inputs, generated files or DOM. */
import assert from 'node:assert/strict';
import {createReferenceContract} from './reference-contract.mjs';

const field=(owner,path,value,extra={})=>({id:`${owner}::${path}`,label:'Rule',value,type:'text',
  contextId:owner,source:{entityId:owner,path},...extra});
const card=(id,title,kind='DATASHEET_SECTION',extra={})=>({id,title,kind,parentId:null,contextId:id,
  source:{entityId:id},children:[],fields:[field(id,'/title',title,{presentation:'heading'})],links:[],...extra});
const entry=(record,aliases=[])=>({targetId:record.id,label:record.title,category:record.kind,
  contextLabel:record.domain==='CORE'?'Core Rules':'Synthetic Army',aliases});
const registry=(records,entries=records.map(record=>entry(record)))=>({cards:new Map(records.map(record=>[record.id,record])),
  index:{schema:'army-book-glossary/v2',authority:'DISPOSABLE_PROJECTION',entries}});
const ids=entries=>entries.map(item=>item.targetId);
const checks=[];
const check=(name,run)=>{run();checks.push(name);};

const definition=field('core-owner','/semanticContent','A bodyguard protects its attached leader.');
const coreOwner=card('core-owner','Forming Attached Units','CORE_MAIN_RULE',{domain:'CORE',
  fields:[field('core-owner','/title','Forming Attached Units',{type:'heading'}),definition]});
const coreDerived=card('core-derived','Bodyguard','CORE_CORE_CONCEPT',{domain:'CORE',
  links:[{targetId:'core-owner',label:'Source rule',relation:'sourceRuleId'}]});
const coreTransit=card('core-transit','Protective Formation','CORE_CORE_CONCEPT',{domain:'CORE',
  links:[{targetId:'core-derived',label:'Source rule',relation:'sourceRuleId'}]});
const visible=card('visible-section','Selected Ability', 'DATASHEET_SECTION',{
  children:['unselected-enhancement'],parentId:'unimported-unit',
  fields:[field('visible-section','/title','Selected Ability',{presentation:'heading'}),
    field('visible-section','/text','Use the explicitly linked rule.')],
  links:[{targetId:'linked-rule',label:'Linked rule'}]});
const linked=card('linked-rule','Referenced Rule','SUPPLEMENTAL_DATASHEET_RULE',{
  fields:[field('linked-rule','/title','Referenced Rule',{presentation:'heading'}),
    field('linked-rule','/text','Apply the second rule.'),
    field('linked-rule','/target','field-rule',{type:'reference',targetIds:['field-rule']})]});
const fieldRule=card('field-rule','Field Reference','DETACHMENT_RULE',{
  parentId:'unselected-detachment',fields:[field('field-rule','/text','An explicitly referenced exception.')],
  links:[{targetId:'linked-rule',label:'Back to referenced rule'}]});
const excludedEnhancement=card('unselected-enhancement','Unassigned Gift','ENHANCEMENT');
const excludedDetachment=card('unselected-detachment','Unselected Host','DETACHMENT',{children:['field-rule','unselected-enhancement']});
const excludedUnit=card('unimported-unit','Unimported Unit','DATASHEET',{children:['visible-section']});
const records=[coreOwner,coreDerived,coreTransit,visible,linked,fieldRule,excludedEnhancement,excludedDetachment,excludedUnit];
const inputs=registry(records),before=structuredClone([...inputs.cards]);
const contract=createReferenceContract(inputs),scope=new Set(['visible-section']);

check('Inherited Core definitions retain their existing owner and field object',()=>{
  for(const targetId of ['core-derived','core-transit']){
    const result=contract.resolve(targetId);
    assert.equal(result.targetId,targetId);
    assert.equal(result.title,inputs.cards.get(targetId).title);
    assert.ok(result.titleField===inputs.cards.get(targetId).fields[0],'Heading lost its source field');
    const owners=result.sections.filter(section=>section.fields.includes(definition));
    assert.equal(owners.length,1,'Inherited definition is missing or duplicated');
    assert.equal(owners[0].card,coreOwner,'Inherited definition changed its card owner');
    assert.equal(owners[0].fields.find(item=>item.id===definition.id),definition,'Definition field was copied');
    assert.equal(definition.source.entityId,'core-owner');
    assert.equal(definition.contextId,'core-owner');
    assert.ok(result.sections.flatMap(section=>section.fields).every(item=>item.source.entityId!=='core-derived'||item.source.path!=='/semanticContent'),
      'Derived concept manufactured a factual definition');
  }
});

check('A normal Core relation is a reference rather than definition inheritance',()=>{
  const related=card('related-concept','Other Concept','CORE_CORE_CONCEPT',{domain:'CORE',
    fields:[field('related-concept','/semanticContent','Its independent meaning.')],
    links:[{targetId:'core-owner',label:'Related rule',relation:'parentRuleId'}]});
  const result=createReferenceContract(registry([related,coreOwner])).resolve(related.id);
  assert.ok(!result.sections.some(section=>section.fields.includes(definition)),'A non-definition relation inherited another rule');
  assert.ok(result.references.some(reference=>reference.targetId==='core-owner'),'Explicit relation was lost');
});

check('Definition cycles fail instead of hanging or fabricating a definition',()=>{
  const a=card('cycle-a','Cycle A','CORE_CORE_CONCEPT',{domain:'CORE',links:[{targetId:'cycle-b',relation:'sourceRuleId'}]});
  const b=card('cycle-b','Cycle B','CORE_CORE_CONCEPT',{domain:'CORE',links:[{targetId:'cycle-a',relation:'sourceRuleId'}]});
  assert.throws(()=>createReferenceContract(registry([a,b])).resolve('cycle-a'),/cycl/i);
});

check('A missing definition owner fails instead of silently showing an empty concept',()=>{
  const broken=card('broken-concept','Broken Concept','CORE_CORE_CONCEPT',{domain:'CORE',
    links:[{targetId:'missing-definition-owner',relation:'sourceRuleId'}]});
  assert.throws(()=>createReferenceContract(registry([broken])).resolve(broken.id),/missing|unresolved|owner/i);
});

check('Scoped availability follows links and field targets transitively',()=>{
  for(const id of ['visible-section','linked-rule','field-rule','core-owner','core-derived','core-transit'])
    assert.equal(contract.canResolve(id,scope),true,'Unavailable explicit reference '+id);
  for(const id of ['unselected-enhancement','unselected-detachment','unimported-unit','missing-id'])
    assert.equal(contract.canResolve(id,scope),false,'Reference closure leaked '+id);
  assert.deepEqual([...scope],['visible-section'],'Reference closure mutated roster membership');
  for(const record of records)assert.equal(contract.canResolve(record.id),true,'Full reference registry lost '+record.id);
  assert.equal(contract.canResolve('missing-id'),false,'Unknown identity resolved');
});

check('Empty personal scope retains Core and excludes unrelated book rules',()=>{
  const empty=new Set();
  assert.deepEqual(new Set(ids(contract.search('',{allowedIds:empty}))),new Set(['core-owner','core-derived','core-transit']));
  const results=contract.search('',{allowedIds:scope});
  assert.deepEqual(new Set(ids(results)),new Set(['core-owner','core-derived','core-transit','visible-section','linked-rule','field-rule']));
  assert.equal(new Set(ids(results)).size,results.length,'Reference closure duplicated search results');
});

check('Title, alias and definition searches rank explicit names first',()=>{
  const direct=card('direct','Ward','ARMY_RULE',{fields:[field('direct','/text','Direct protection.')]});
  const alias=card('alias','Shield','ARMY_RULE_COMPONENT',{fields:[field('alias','/text','Ward: a named protection.')]});
  const prose=card('prose','Defence','DETACHMENT_RULE',{fields:[field('prose','/text','A ward protects friendly models.') ]});
  const references=createReferenceContract(registry([prose,alias,direct],[entry(prose),entry(alias,[
    {label:'Ward',fieldPath:'/text',presentationOnly:true},{label:'Warding',fieldPath:'/text',presentationOnly:true}]),entry(direct)]));
  const hits=references.search('ward');
  assert.deepEqual(new Set(ids(hits)),new Set(['direct','alias','prose']),'Definitions were not searchable');
  assert.ok(ids(hits).indexOf('direct')<ids(hits).indexOf('prose'),'Definition outranked exact title');
  assert.ok(ids(hits).indexOf('alias')<ids(hits).indexOf('prose'),'Definition outranked exact alias');
  assert.equal(hits.find(hit=>hit.targetId==='alias').matchedLabel,'Ward');
  assert.equal(hits.find(hit=>hit.targetId==='alias').matchedFieldPath,'/text','Alias source address was lost');
  assert.equal(new Set(ids(hits)).size,hits.length,'Multiple matching aliases duplicated a target');
  assert.deepEqual(references.search('NO_SUCH_TERM_35817'),[]);
});

check('Inherited definitions are searchable without copying factual values',()=>{
  const hits=contract.search('protects');
  assert.ok(ids(hits).includes('core-owner'),'Definition owner is not searchable');
  assert.ok(ids(hits).includes('core-derived'),'Derived reference lost its effective definition search');
});

check('Search normalization handles accents, punctuation and case',()=>{
  const deep=card('deep','DEEP STRIKE','CORE_MAIN_RULE',{domain:'CORE',fields:[field('deep','/semanticContent','Arrive from reserve.')]});
  const references=createReferenceContract(registry([deep]));
  for(const query of ['deep-strike','DÉEP STRIKE','deep strike'])assert.deepEqual(ids(references.search(query)),['deep']);
});

check('Categories expose human labels and retain canonical filtering',()=>{
  const categories=contract.categories(scope),idsInScope=new Set(contract.search('',{allowedIds:scope}).map(hit=>hit.category));
  assert.deepEqual(new Set(categories.map(category=>category.id)),idsInScope);
  assert.equal(new Set(categories.map(category=>category.id)).size,categories.length,'Duplicate category options');
  for(const category of categories){
    assert.ok(category.label.trim(),'Empty category label');
    assert.doesNotMatch(category.label,/_|^(?:CORE_|DATASHEET_SECTION$|SUPPLEMENTAL_DATASHEET_RULE$)/,'Machine-facing category label');
    const hits=contract.search('',{allowedIds:scope,category:category.id});
    assert.ok(hits.length,'Empty category option');
    assert.ok(hits.every(hit=>hit.category===category.id),'Category filter leaked a different category');
    for(const hit of hits){assert.equal(hit.categoryLabel,category.label);assert.ok(hit.contextLabel.trim());}
  }
});

check('Structured table fields retain exact values, coordinates and source objects',()=>{
  const text=field('table-rule','/text','Roll a D6 and consult this table.');
  const cell=field('table-rule','/tables/0/rows/0/0','1–3',{presentation:'table-cell',
    table:{id:'table-rule::/tables/0/rows',row:0,column:0,columnLabel:'Roll'}});
  const table=card('table-rule','Random Outcome','DETACHMENT_RULE',{fields:[text,cell]});
  const result=createReferenceContract(registry([table])).resolve(table.id),section=result.sections.find(section=>section.card===table);
  assert.ok(section,'Original table rule owner was lost');
  assert.ok(section.fields.includes(text),'Canonical source text was lost');
  assert.ok(section.fields.includes(cell),'Structured table cell was copied or lost');
  assert.equal(section.fields.find(item=>item.id===cell.id).table,cell.table,'Table coordinates were reconstructed');
});

check('Nested book sections retain their owners and respect personal membership',()=>{
  const component=card('army-component','Rule Component','ARMY_RULE_COMPONENT',{
    parentId:'army-rule',fields:[field('army-component','/text','A nested source-owned rule.')]});
  const omitted=card('other-component','Other Component','ARMY_RULE_COMPONENT',{
    parentId:'army-rule',fields:[field('other-component','/text','A section outside the personal scope.')]});
  const army=card('army-rule','Army Rule','ARMY_RULE',{children:[component.id,omitted.id],
    fields:[field('army-rule','/text','The parent source-owned rule.')]});
  const references=createReferenceContract(registry([army,component,omitted]));
  const full=references.resolve(army.id),personal=references.resolve(army.id,new Set([army.id,component.id]));
  assert.ok(full.sections.some(section=>section.card===component&&section.fields.includes(component.fields[0])));
  assert.ok(full.sections.some(section=>section.card===omitted&&section.fields.includes(omitted.fields[0])));
  assert.ok(personal.sections.some(section=>section.card===component&&section.fields.includes(component.fields[0])));
  assert.ok(!personal.sections.some(section=>section.card===omitted),'Nested content escaped personal membership');
});

check('An Enhancement retains its canonical contributed weapon fields and reference',()=>{
  const weapon=card('contributed-weapon','Supplied Weapon','WEAPON_PROFILE',{parentId:'weapon-enhancement',
    fields:[field('contributed-weapon','/name','Supplied Weapon',{presentation:'heading'}),
      ...Object.entries({range:'24"',attacks:'3',skill:'2+',strength:'11',ap:'-2',damage:'D3+2'})
        .map(([key,value])=>field('contributed-weapon','/'+key,value,{presentation:'stat'})),
      field('contributed-weapon','/abilities/0','HAZARDOUS',{type:'tokens'})]});
  const enhancement=card('weapon-enhancement','Weapon Enhancement','ENHANCEMENT',{
    children:[weapon.id],fields:[field('weapon-enhancement','/text','This model has the following weapon:')]});
  const references=createReferenceContract(registry([enhancement,weapon],[entry(enhancement)]));
  const model=references.resolve(enhancement.id),section=model.sections.find(section=>section.card===weapon);
  assert.ok(section,'Enhancement omitted the supplied weapon definition');
  assert.ok(section.fields.includes(weapon.fields[0]),'Contributed weapon name is absent from its source-owned model section');
  for(const field of weapon.fields.filter(field=>field.presentation==='stat'||field.type==='tokens'))
    assert.ok(section.fields.includes(field),'Contributed weapon field was copied or omitted '+field.id);
  assert.ok(model.references.some(reference=>reference.targetId===weapon.id),'No canonical link to contributed weapon');
  assert.ok(references.resolve(weapon.id).sections.some(section=>section.card===weapon&&section.fields.includes(weapon.fields[1])),
    'Standalone weapon reference lost its supplied statistics');
  assert.ok(references.search('hazardous').some(hit=>hit.targetId===enhancement.id),'Contributed weapon is absent from Enhancement definition search');
  assert.ok(!references.resolve(enhancement.id,new Set([enhancement.id])).sections.some(section=>section.card===weapon),
    'Child inventory expanded reference availability');
  assert.ok(references.resolve(enhancement.id,new Set([enhancement.id,weapon.id])).sections.some(section=>section.card===weapon),
    'Visible contributed weapon was removed from its Enhancement');
});

check('Presentation labels and iteration order never become identity',()=>{
  const a=card('collision-a','Same Title','ARMY_RULE',{fields:[field('collision-a','/text','First canonical rule.')]});
  const b=card('collision-b','Same Title','ARMY_RULE',{fields:[field('collision-b','/text','Second canonical rule.')]});
  const references=createReferenceContract(registry([b,a]));
  assert.deepEqual(new Set(ids(references.search('same title'))),new Set(['collision-a','collision-b']));
  assert.equal(references.resolve('collision-a').sections.find(section=>section.card===a).fields[0],a.fields[0]);
  assert.equal(references.canResolve('Same Title'),false,'Title became a canonical identity');
});

check('Independent registries sharing an ID never share definition state',()=>{
  const a=card('same-id','First Registry','ARMY_RULE',{fields:[field('same-id','/text','First distinctive definition.')]});
  const b=card('same-id','Second Registry','ARMY_RULE',{fields:[field('same-id','/text','Second distinctive definition.')]});
  const first=createReferenceContract(registry([a])),second=createReferenceContract(registry([b]));
  assert.equal(first.resolve(a.id).sections[0].fields[0],a.fields[0]);
  assert.equal(second.resolve(b.id).sections[0].fields[0],b.fields[0]);
  assert.deepEqual(ids(first.search('first distinctive')),['same-id']);
  assert.deepEqual(first.search('second distinctive'),[]);
  assert.deepEqual(ids(second.search('second distinctive')),['same-id']);
  assert.deepEqual(second.search('first distinctive'),[]);
});

check('Canonical field focus keeps book article identity without collapsing global subentries',()=>{
  const identity={...contract.identityFor('visible-section'),fieldPath:'/text'};
  assert.equal(contract.resolve(identity).targetId,'visible-section');
  assert.equal(contract.resolve({...identity,fieldPath:'/missing'}),null);
  assert.equal(contract.resolve({...identity,registryId:'another-registry'}),null);
  const scoped=card('qualified-entry','Scoped Entry','ABILITY',{
    identity:{registryId:'shared-owner',canonicalId:'shared-rule',fieldPath:'/scope/one'},fields:[field('shared-rule','/text','One definition.')]});
  const references=createReferenceContract(registry([scoped]));
  assert.equal(references.resolve(scoped.identity).targetId,scoped.id);
  assert.equal(references.resolve({...scoped.identity,fieldPath:'/text'}),null);
});

check('Resolution, search and scope closure leave source records unchanged',()=>{
  assert.deepEqual([...inputs.cards],before,'Reference presentation mutated canonical cards');
});

console.log(JSON.stringify({status:'PASS',checks:checks.length,syntheticRegistries:true,canonicalSourceIdentity:'PASS',
  definitionInheritance:'PASS',referenceScopeClosure:'PASS',searchAndCategories:'PASS'}));

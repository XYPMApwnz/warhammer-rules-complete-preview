/** Explicit equipment navigation; conditions and gameplay values stay immutable. */
import assert from 'node:assert/strict';
import {createEquipmentReferenceResolver} from './equipment-reference.mjs';

const unitId='unit-synthetic-owner',itemId='composition-synthetic',ruleId='ability-synthetic-icon';
const text='Chaos Icon: The complete source-owned effect remains here.';
const csm={id:ruleId,parentId:unitId,data:{text},ruleContract:{clauses:[{
  id:'source-clause',sourceFields:[['text']],canonicalEquipmentRequirement:{entityId:itemId,field:['equipmentAndRules',0,'text']},
  conditions:[{predicate:'FIELD',arguments:{key:'equipmentBattleTrigger',equals:true}}],rosterEffects:[]
}]}};
const csmField={id:ruleId+'::/text',value:text,source:{entityId:ruleId,path:'/text'}};
const csmCard={id:ruleId,parentId:unitId,fields:[csmField]};
const platformId='option-synthetic-platform',platformRuleId='section-synthetic-platform';
const platformText='Tidewall Defence Platform: The existing source defines its effect.';
const tau={id:platformRuleId,parentId:unitId,data:{blocks:[{text:'Unrelated sibling.'},{text:'Another sibling.'},{text:platformText}]},ruleContract:{clauses:[{
  id:'platform-clause',sourceFields:[['blocks',2,'text']],rosterEffects:[{
    operation:'MODIFY_STAT',field:'W',mode:'SET',value:15,
    equipmentRequirement:{binding:'SOURCE',kind:'EQUIPMENT_PRESENT',equipmentId:platformId,sourceFieldPath:['text']}
  }]
}]}};
const tauField={id:platformRuleId+'::/blocks/2/text',value:platformText,source:{entityId:platformRuleId,path:'/blocks/2/text'}};
const tauCard={id:platformRuleId,parentId:unitId,fields:[
  {id:platformRuleId+'::/blocks/0/text',value:'Unrelated sibling.',source:{entityId:platformRuleId,path:'/blocks/0/text'}},tauField
]};
const fixture=()=>({cards:new Map([[ruleId,structuredClone(csmCard)],[platformRuleId,structuredClone(tauCard)]]),rules:new Map([[ruleId,structuredClone(csm)],[platformRuleId,structuredClone(tau)]])});
const selected=(id,path)=>({canonicalEquipmentIds:[id],canonicalFieldPaths:{[id]:[path]}});
const csmSelection=selected(itemId,'/equipmentAndRules/0/text'),tauSelection=selected(platformId,'/text');
let checks=0;
function test(name,fn){fn();checks++;}
test('two canonical maps required',()=>assert.throws(()=>createEquipmentReferenceResolver({cards:[],rules:new Map()}),/canonical card and native rule maps/));
test('faithful CSM canonical requirement resolves exact rule field',()=>{
  const f=fixture(),resolver=createEquipmentReferenceResolver(f),result=resolver.resolve(unitId,itemId,csmSelection);
  assert.equal(result.length,1);assert.strictEqual(result[0].owner,f.cards.get(ruleId));assert.strictEqual(result[0].effect,f.cards.get(ruleId).fields[0]);
});
test('faithful Tau operation requirement resolves exact source block only',()=>{
  const result=createEquipmentReferenceResolver(fixture()).resolve(unitId,platformId,tauSelection);
  assert.deepEqual(result.map(({owner,effect})=>[owner.id,effect.id]),[[platformRuleId,tauField.id]]);
});
test('source reference may supply exact selected occurrence',()=>{
  const selection={canonicalEquipmentIds:[itemId],canonicalFieldPaths:{},sourceReferences:[{entityId:itemId,path:'/equipmentAndRules/0/text'}]};
  assert.equal(createEquipmentReferenceResolver(fixture()).resolve(unitId,itemId,selection).length,1);
});
test('wrong selected item cannot match',()=>assert.deepEqual(createEquipmentReferenceResolver(fixture()).resolve(unitId,itemId,selected('other-item','/equipmentAndRules/0/text')),[]));
test('wrong requirement field cannot match',()=>assert.deepEqual(createEquipmentReferenceResolver(fixture()).resolve(unitId,itemId,selected(itemId,'/equipmentAndRules/1/text')),[]));
test('same path on another source reference owner cannot match',()=>{
  assert.deepEqual(createEquipmentReferenceResolver(fixture()).resolve(unitId,itemId,{canonicalEquipmentIds:[itemId],sourceReferences:[{entityId:'other-item',path:'/equipmentAndRules/0/text'}]}),[]);
});
test('wrong requested UNIT cannot match',()=>assert.deepEqual(createEquipmentReferenceResolver(fixture()).resolve('unit-other',itemId,csmSelection),[]));
test('native rule owner mismatch cannot match',()=>{const f=fixture();f.rules.get(ruleId).parentId='unit-other';assert.deepEqual(createEquipmentReferenceResolver(f).resolve(unitId,itemId,csmSelection),[]);});
test('publication owner mismatch cannot match',()=>{const f=fixture();f.cards.get(ruleId).parentId='unit-other';assert.deepEqual(createEquipmentReferenceResolver(f).resolve(unitId,itemId,csmSelection),[]);});
test('native/public text mismatch cannot match',()=>{const f=fixture();f.cards.get(ruleId).fields[0].value+=' changed';assert.deepEqual(createEquipmentReferenceResolver(f).resolve(unitId,itemId,csmSelection),[]);});
test('wrong published field address cannot match',()=>{const f=fixture();f.cards.get(ruleId).fields[0].source.path='/wrong';assert.deepEqual(createEquipmentReferenceResolver(f).resolve(unitId,itemId,csmSelection),[]);});
test('wrong canonical fact owner cannot match',()=>{const f=fixture();f.cards.get(ruleId).fields[0].source.entityId='another-rule';assert.deepEqual(createEquipmentReferenceResolver(f).resolve(unitId,itemId,csmSelection),[]);});
test('presentation path may explicitly identify source occurrence',()=>{const f=fixture();const field=f.cards.get(ruleId).fields[0];field.source.path='/projection/text';field.presentationPath='/text';assert.equal(createEquipmentReferenceResolver(f).resolve(unitId,itemId,csmSelection).length,1);});
test('missing published source rejects link',()=>{const f=fixture();f.cards.delete(ruleId);assert.deepEqual(createEquipmentReferenceResolver(f).resolve(unitId,itemId,csmSelection),[]);});
test('nontext source and publication cannot become prose',()=>{const f=fixture();f.rules.get(ruleId).data.text=15;f.cards.get(ruleId).fields[0].value=15;assert.deepEqual(createEquipmentReferenceResolver(f).resolve(unitId,itemId,csmSelection),[]);});
test('non-SOURCE operation requirement is not another owner relation',()=>{const f=fixture();f.rules.get(platformRuleId).ruleContract.clauses[0].rosterEffects[0].equipmentRequirement.binding='TARGET';assert.deepEqual(createEquipmentReferenceResolver(f).resolve(unitId,platformId,tauSelection),[]);});
test('unknown requirement kind is ignored',()=>{const f=fixture();f.rules.get(platformRuleId).ruleContract.clauses[0].rosterEffects[0].equipmentRequirement.kind='UNKNOWN';assert.deepEqual(createEquipmentReferenceResolver(f).resolve(unitId,platformId,tauSelection),[]);});
test('malformed explicit paths cannot degrade to item-only matching',()=>{const f=fixture();f.rules.get(ruleId).ruleContract.clauses[0].canonicalEquipmentRequirement.field=[];assert.deepEqual(createEquipmentReferenceResolver(f).resolve(unitId,itemId,csmSelection),[]);});
test('absent optional requirement path retains exact item requirement',()=>{const f=fixture();delete f.rules.get(ruleId).ruleContract.clauses[0].canonicalEquipmentRequirement.field;assert.equal(createEquipmentReferenceResolver(f).resolve(unitId,itemId,{canonicalEquipmentIds:[itemId]}).length,1);});
test('duplicate native declaration deduplicates by fact identity',()=>{const f=fixture();f.rules.get(ruleId).ruleContract.clauses.push(structuredClone(f.rules.get(ruleId).ruleContract.clauses[0]));assert.equal(createEquipmentReferenceResolver(f).resolve(unitId,itemId,csmSelection).length,1);});
test('multiple distinct explicit effect facts remain multiple',()=>{const f=fixture(),rule=f.rules.get(ruleId),card=f.cards.get(ruleId);rule.data.blocks=[{text:'Another exact effect fact.'}];rule.ruleContract.clauses[0].sourceFields.push(['blocks',0,'text']);card.fields.push({id:ruleId+'::/blocks/0/text',value:rule.data.blocks[0].text,source:{entityId:ruleId,path:'/blocks/0/text'}});assert.equal(createEquipmentReferenceResolver(f).resolve(unitId,itemId,csmSelection).length,2);});
test('string metadata is not an effect text field',()=>{const f=fixture(),rule=f.rules.get(ruleId),card=f.cards.get(ruleId);rule.data.title='A source title';rule.ruleContract.clauses[0].sourceFields=[['title']];card.fields.push({id:ruleId+'::/title',value:rule.data.title,source:{entityId:ruleId,path:'/title'}});assert.deepEqual(createEquipmentReferenceResolver(f).resolve(unitId,itemId,csmSelection),[]);});
test('source and selection are never mutated or evaluated',()=>{
  const f=fixture(),before=JSON.stringify({cards:[...f.cards],rules:[...f.rules],selection:csmSelection});
  const resolver=createEquipmentReferenceResolver(f);assert(Object.isFrozen(resolver));resolver.resolve(unitId,itemId,csmSelection);
  assert.equal(JSON.stringify({cards:[...f.cards],rules:[...f.rules],selection:csmSelection}),before);
});
console.log(JSON.stringify({status:'PASS',checks,sourceRelations:'explicit-only',effectExecution:false}));

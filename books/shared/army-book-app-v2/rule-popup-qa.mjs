/** Focused canonical-rule presentation, independent of a browser or producer. */
import assert from 'node:assert/strict';
import {focusedRuleField,createRulePopupPresenter} from './rule-popup.mjs';

class Element {
  constructor(tagName,className='',text=''){this.tagName=tagName.toUpperCase();this.className=className;this.children=[];this.dataset={};this.value=text;this.classList={add:token=>{this.className=(this.className+' '+token).trim();}};}
  append(...children){this.children.push(...children);}
  get textContent(){return this.value+this.children.map(child=>child.textContent).join('');}
  set textContent(value){this.value=value;this.children=[];}
}
const el=(tag,className='',text='')=>new Element(tag,className,text);
const collect=(root,predicate)=>[...(predicate(root)?[root]:[]),...root.children.flatMap(child=>collect(child,predicate))];
const byClass=(root,className)=>collect(root,node=>node.className.split(/\s+/).includes(className));
const field=(path,value)=>({id:'section-abilities::'+path,value,type:'text',contextId:'unit-owner',source:{entityId:'section-abilities',path}});
const body='While this model is leading a unit, models in that unit have the Feel No Pain 4+ ability.';
const silent=field('/blocks/0/text','Silent Bodyguard: '+body);
const icon=field('/blocks/1/text','Icon of Despair (Aura): Enemy units within 6" are Afflicted.');
const section={id:'section-abilities',kind:'DATASHEET_SECTION',title:'ABILITIES',parentId:'unit-owner',fields:[
  silent,field('/blocks/0/wargearAbility',false),icon,field('/blocks/1/wargearAbility',true),field('/blocks/2/text','Death Approaches: A different complete canonical rule.')
]};
const owner={id:'unit-owner',kind:'DATASHEET',title:'Owner Character',parentId:null,fields:[]};
const cards=new Map([[section.id,section],[owner.id,owner]]),payload={cards:[section,owner]};
const before=JSON.stringify(payload),links=[],prose=[];
const presenter=createRulePopupPresenter({document:{},cards,payload,el,
  factValue:(tag,fact)=>{const node=el(tag,'',String(fact.value));node.dataset.factId=fact.id;node.dataset.factValue=JSON.stringify(fact.value);node.dataset.entityId=fact.source.entityId;node.dataset.contextId=fact.contextId;return node;},
  anchor:(label,targetId,reference,options)=>{links.push({label,targetId,reference,options});const node=el('a','',label);node.dataset.targetId=targetId;return node;},
  linkTerms:node=>prose.push(node)
});
let checks=0;
assert.equal(focusedRuleField(section),null,'Multiple canonical texts have no aggregate fallback');checks++;
assert.strictEqual(focusedRuleField(section,{fieldPath:silent.source.path}),silent,'Focus preserves the exact original field object');checks++;
assert.strictEqual(focusedRuleField(section,{label:'silent bodyguard'}),silent,'An exact named source prefix selects one field');checks++;
assert.equal(focusedRuleField(section,{fieldPath:'/blocks/99/text'}),null,'Unknown focus cannot open the whole section');checks++;
assert.equal(focusedRuleField(section,{fieldPath:'/blocks/1/wargearAbility'}),null,'Boolean classification metadata is never the rule body');checks++;
assert.equal(focusedRuleField({...section,kind:'WEAPON_PROFILE'},{fieldPath:silent.source.path}),null,'Unrelated kinds retain their own presenter');checks++;
const duplicate={...section,fields:[silent,{...silent,id:'another-field',source:{entityId:section.id,path:'/blocks/9/text'}}]};
assert.equal(focusedRuleField(duplicate,{label:'Silent Bodyguard'}),null,'Two same-named fields are not guessed');checks++;
const article=presenter.render(section,{fieldPath:silent.source.path,originUnitId:'unit-owner'});
assert.equal(article.dataset.cardId,section.id);assert.equal(article.dataset.ruleFieldPath,silent.source.path);checks++;
assert.equal(article.dataset.ruleType,'Datasheet ability','False marker remains classification, never a visible metadata row');checks++;
assert.equal(byClass(article,'reference-title')[0].textContent,'Silent Bodyguard');checks++;
const definition=byClass(article,'reference-fact');assert.equal(definition.length,1,'Only the clicked rule is rendered');checks++;
assert.equal(definition[0].textContent,body,'Full body is retained with its repeated caption split into the heading');checks++;
assert.equal(JSON.parse(definition[0].dataset.factValue),silent.value,'The fact dataset retains the complete canonical source value including title');checks++;
assert.equal(definition[0].dataset.factId,silent.id);assert.equal(definition[0].dataset.entityId,section.id);assert.equal(definition[0].dataset.contextId,'unit-owner');checks++;
assert.doesNotMatch(article.textContent,/Death Approaches|Icon of Despair|wargear Ability|DATASHEET SECTION|wargearAbility|\/blocks\//,'No sibling rule, metadata label or source pointer is exposed');checks++;
assert.equal(byClass(article,'ds-rule-popup-source').length,0,'Own source is not repeated');checks++;
assert.strictEqual(prose[0],byClass(article,'reference-definition')[0],'Only the rule body is supplied to the term-link pass');checks++;
assert.deepEqual(links[0],{label:'Open in Army Book',targetId:section.id,reference:false,options:{fieldPath:silent.source.path}},'Action preserves exact source field navigation');checks++;
for(const control of collect(article,node=>['A','BUTTON'].includes(node.tagName)))assert(control.textContent.trim(),'Every emitted action has an accessible text name');checks++;
const foreign=presenter.render(section,{fieldPath:silent.source.path,originUnitId:'unit-bodyguard'});
assert.deepEqual(byClass(foreign,'ds-rule-popup-source').map(node=>node.textContent),['From Owner Character'],'Foreign source is the precise parent datasheet, not a guessed title');checks++;
const wargear=presenter.render(section,{fieldPath:icon.source.path});
assert.equal(wargear.dataset.ruleType,'Wargear ability');assert.equal(byClass(wargear,'reference-title')[0].textContent,'Icon of Despair (Aura)');checks++;
assert.equal(byClass(wargear,'reference-fact')[0].dataset.factValue,JSON.stringify(icon.value));checks++;
const item=presenter.render(section,{fieldPath:icon.source.path,wargear:true});
assert.equal(item.dataset.ruleType,'Wargear','A composition-item focus may select Wargear presentation without changing source text');checks++;
assert.equal(presenter.render({...section,kind:'EQUIPMENT_RULE'},{fieldPath:silent.source.path}).dataset.ruleType,'Wargear');checks++;
assert.equal(presenter.render({...section,kind:'WARGEAR_ABILITY'},{fieldPath:silent.source.path}).dataset.ruleType,'Wargear ability');checks++;
assert.equal(presenter.render(section),null);assert.equal(presenter.render(section,{fieldPath:'/missing'}),null,'Missing exact field cannot fall back to aggregate section');checks++;
assert.equal(presenter.render({...section,kind:'WARGEAR_OPTION'},{fieldPath:silent.source.path}),null,'Selection-option prose is not presented as an equipment effect');checks++;
assert.equal(presenter.render({...section,kind:'STRATAGEM'},{fieldPath:silent.source.path}),null,'Other typed rules remain with their existing full presenter');checks++;
// SM-family records carry a direct /text and /wargearAbility pair rather than
// the DG /blocks/N pair. The colon inside a sentence is not an ability caption.
const smText='Each time this unit is selected to shoot, select one: its attacks gain LETHAL HITS, or its attacks gain SUSTAINED HITS 1.';
const smAbility={id:'ability-sm-synthetic',kind:'ABILITY',title:'A Canonical Ability',parentId:'unit-owner',fields:[
  {id:'ability-sm-synthetic::/text',value:smText,type:'text',contextId:'unit-owner',source:{entityId:'ability-sm-synthetic',path:'/text'}},
  {id:'ability-sm-synthetic::/wargearAbility',value:false,type:'text',contextId:'unit-owner',source:{entityId:'ability-sm-synthetic',path:'/wargearAbility'}}
]};
const smBefore=JSON.stringify(smAbility),smPopup=presenter.render(smAbility,{fieldPath:'/text'});
assert.strictEqual(focusedRuleField(smAbility,{fieldPath:'/text'}),smAbility.fields[0]);checks++;
assert.equal(smPopup.dataset.ruleType,'Datasheet ability');assert.equal(byClass(smPopup,'reference-title')[0].textContent,smAbility.title);checks++;
assert.equal(byClass(smPopup,'reference-fact')[0].textContent,smText,'A direct source body is not truncated at an internal colon');checks++;
assert.equal(byClass(smPopup,'reference-fact')[0].dataset.factValue,JSON.stringify(smText));checks++;
const smWargear={...smAbility,fields:[smAbility.fields[0],{...smAbility.fields[1],value:true}]};
assert.equal(presenter.render(smWargear,{fieldPath:'/text'}).dataset.ruleType,'Wargear ability','Direct /wargearAbility classifies its exact /text sibling');checks++;
assert.equal(presenter.render(smAbility,{fieldPath:'/text',wargear:true}).dataset.ruleType,'Wargear','Explicit item focus works with a direct source field');checks++;
assert.equal(JSON.stringify(smAbility),smBefore,'Direct-field source stays unchanged');checks++;
assert.equal(JSON.stringify(payload),before,'Presentation does not mutate any source field, boolean metadata or hierarchy');checks++;
console.log(JSON.stringify({status:'PASS',checks,canonicalTextPreserved:true,siblingRulesVisible:0}));

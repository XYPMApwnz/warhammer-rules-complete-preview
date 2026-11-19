/** Exhaustive source-backed rule focus and whole-section presentation boundary. */
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {parseProducerJSON} from '../source-refs-v2/producer-io.mjs';
import {armyBooks} from '../../../v2/army-books.mjs';
const arg=name=>process.argv.find(value=>value.startsWith(name+'='))?.slice(name.length+1);
const root=path.resolve(arg('--root')||fileURLToPath(new URL('../../../',import.meta.url)));
const {createRulePopupPresenter,focusedRuleField,ruleFieldPath}=await import(pathToFileURL(path.join(root,'books/shared/army-book-app-v2/rule-popup.mjs')));

class Element {
  constructor(tag,className='',value=''){this.tagName=tag.toUpperCase();this.className=className;this.children=[];this.dataset={};this.value=value;this.classList={add:name=>{this.className+=' '+name;}};}
  append(...nodes){this.children.push(...nodes);}
  get textContent(){return this.value+this.children.map(node=>node.textContent).join('');}
  set textContent(value){this.value=value;this.children=[];}
}
const el=(...args)=>new Element(...args),walk=root=>[root,...root.children.flatMap(walk)],classes=(root,name)=>walk(root).filter(node=>node.className.split(/\s+/).includes(name));
const supported=new Set(['ABILITY','WARGEAR_ABILITY','DATASHEET_SECTION','SUPPLEMENTAL_DATASHEET_RULE','EQUIPMENT_RULE']);
const bodyFields=card=>card.fields.filter(field=>typeof field.value==='string'&&field.value.trim()&&
  (/^\/blocks\/\d+\/text$/.test(field.presentationPath??field.source?.path??'')||['/text','/semanticContent'].includes(field.presentationPath??field.source?.path)));
const notes=(card,fields)=>card.fields.filter(note=>{
  const match=/^\/qualifications\/(\d+)\/value\/sourceText$/.exec(note.source?.path??'');if(!match)return false;
  const qualifier=card.fields.find(field=>field.source?.path===`/qualifications/${match[1]}/field/0`);
  return !qualifier||fields.some(field=>field.source.path.split('/')[1]===qualifier.value);
});
const sha=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
const rows=[];let checks=0;
function same(actual,expected,message){assert.deepEqual(actual,expected,message);checks++;}
for(const book of armyBooks){
  const payload=parseProducerJSON(fs.readFileSync(path.join(root,'books',book.id,'v2/generated/app-presentation.json'),'utf8'));
  const before=sha(payload),cards=new Map(payload.cards.map(card=>[card.id,card])),actions=[],linked=[];
  const presenter=createRulePopupPresenter({document:{},cards,payload,el,
    factValue:(tag,field)=>{const node=el(tag,'',String(field.value));Object.assign(node.dataset,{factId:field.id,factValue:JSON.stringify(field.value),entityId:field.source.entityId,contextId:field.contextId});return node;},
    anchor:(label,targetId,detail,options)=>{const node=el('a','',label);node.dataset.targetId=targetId;actions.push({label,targetId,detail,options});return node;},linkTerms:node=>linked.push(node)});
  assert.equal(typeof presenter.renderSection,'function','A known canonical section must remain available when focus is ambiguous');checks++;
  const summary={bookId:book.id,ruleCards:0,bodyFields:0,focused:0,ambiguousLocators:0,sections:0,unknownNameSections:0,unknownPathSections:0,sourceUnchanged:false};
  function inspect(card,article,fields,section){
    assert(article,`${book.id}/${card.id}: complete canonical content is available`);checks++;
    same(article.dataset.cardId,card.id,'Selected canonical rule/section identity');
    same(classes(article,'reference-title').length,1,'One named rule/section heading');
    const expected=[...fields,...notes(card,fields)],facts=walk(article).filter(node=>node.dataset.factId);
    same(facts.map(node=>node.dataset.factId),expected.map(field=>field.id),'Exact complete body/note inventory, without classification metadata');
    for(const[field,index]of expected.map((field,index)=>[field,index])){
      const node=facts[index];same(node.dataset.factValue,JSON.stringify(field.value),'Canonical source value retained');same(node.dataset.entityId,field.source.entityId,'Canonical fact owner retained');same(node.dataset.contextId,field.contextId,'Canonical contextual identity retained');
      if(section)same(node.textContent,String(field.value),'Whole section preserves complete source prose');
    }
    same(classes(article,'reference-definition').length,1,'One complete rule definition');
    assert(linked.includes(classes(article,'reference-definition')[0]),'Term linker receives the complete definition');checks++;
    assert(!article.textContent.includes('Choose a named ability from the Glossary to read its complete rule.'),'No generic named-rule placeholder');checks++;
    assert(!article.textContent.includes('wargear Ability'),'Boolean classification label is not visible');checks++;
    for(const control of walk(article).filter(node=>['A','BUTTON'].includes(node.tagName))){assert(control.textContent.trim(),'Every action has an accessible name');checks++;}
    const action=actions.at(-1);same(action.targetId,card.id,'Army Book action preserves selected identity');same(action.label,'Open in Army Book','Explicit source action');
    if(section){
      same(article.dataset.ruleSectionFull,'','Explicit full-section presentation');same(action.options,{fullBook:true,contents:true},'Whole-section source action does not guess a field');
      if(card.kind==='DATASHEET_SECTION'&&!card.fields.some(field=>typeof field.value==='boolean'&&field.source.path.endsWith('/wargearAbility')))
        same(article.dataset.ruleType,'Datasheet section','Unclassified source sections such as composition are not asserted to be abilities');
    }
    else same(article.dataset.ruleFieldPath,fields[0].presentationPath??fields[0].source.path,'Focused section-relative path is exact');
  }
  for(const card of payload.cards.filter(card=>supported.has(card.kind))){
    const fields=bodyFields(card);if(!fields.length)continue;
    summary.ruleCards++;summary.bodyFields+=fields.length;
    for(const field of fields){
      const locator=field.presentationPath??field.source.path;
      const canonicalMatches=fields.filter(candidate=>candidate.source.path===field.source.path||candidate.presentationPath===field.source.path);
      if(canonicalMatches.length===1)same(ruleFieldPath(card,field),field.source.path,'Unique canonical URLs stay unchanged rather than switching to display paths');
      const matches=fields.filter(candidate=>candidate.source.path===locator||candidate.presentationPath===locator);
      if(matches.length===1){
        same(focusedRuleField(card,{fieldPath:locator}),field,'Unique section-relative focus preserves original canonical field object');
        inspect(card,presenter.render(card,{fieldPath:locator}),[field],false);summary.focused++;
      }else{
        same(focusedRuleField(card,{fieldPath:locator}),null,'Colliding projected/source paths must not choose one fact');
        same(presenter.render(card,{fieldPath:locator}),null,'Ambiguous path remains fail-closed in the focused presenter');
        inspect(card,presenter.renderSection(card,{fieldPath:locator}),fields,true);summary.ambiguousLocators++;
      }
      const samePath=fields.filter(candidate=>candidate.source.path===field.source.path);
      if(samePath.length>1){
        same(focusedRuleField(card,{fieldPath:field.source.path}),null,'A source-local path shared by distinct projected facts cannot select the first member');
        inspect(card,presenter.renderSection(card,{fieldPath:field.source.path}),fields,true);
      }
    }
    inspect(card,presenter.renderSection(card),fields,true);summary.sections++;
    const unknown='Unrecognized canonical ability caption for the negative control';
    const focus=focusedRuleField(card,{label:unknown});
    if(fields.length>1){same(focus,null,'Unknown name cannot guess a subrule');same(presenter.render(card,{label:unknown}),null,'Focused presenter rejects ambiguous names');inspect(card,presenter.renderSection(card,{label:unknown}),fields,true);summary.unknownNameSections++;}
    same(focusedRuleField(card,{fieldPath:'/blocks/not-a-canonical-body/text'}),null,'Unknown exact path cannot select another field');
    same(presenter.render(card,{fieldPath:'/blocks/not-a-canonical-body/text'}),null,'Unknown path retains focused fail-closed behavior');
    inspect(card,presenter.renderSection(card,{fieldPath:'/blocks/not-a-canonical-body/text'}),fields,true);summary.unknownPathSections++;
  }
  same(sha(payload),before,'All source values, classifications, notes and hierarchy remain unchanged');summary.sourceUnchanged=true;rows.push(summary);
}
console.log(JSON.stringify({status:'PASS',checks,rows,totalCards:rows.reduce((n,r)=>n+r.ruleCards,0),totalBodyFields:rows.reduce((n,r)=>n+r.bodyFields,0),sourceUnchanged:rows.every(row=>row.sourceUnchanged)}));

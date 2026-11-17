/** Exact, source-inventory-only term matching; no browser or external payload. */
import assert from 'node:assert/strict';
import {createExactTermMatcher,createRuleTermLinker} from './rule-term-links.mjs';
const cards=new Map(['deep','feel','lethal','character','ambiguous-a','ambiguous-b','alias','not-enrolled'].map(id=>[id,{id}]));
const entries=[
  {targetId:'deep',label:'Deep Strike',aliases:[]},
  {targetId:'feel',label:'Feel No Pain',aliases:[]},
  {targetId:'lethal',label:'[LETHAL HITS]',aliases:[]},
  {targetId:'character',label:'CHARACTER',aliases:[]},
  {targetId:'ambiguous-a',label:'Leader',aliases:[]},
  {targetId:'ambiguous-b',label:'LEADER',aliases:[]},
  {targetId:'alias',label:'An enrolled ability',aliases:[{label:'Afflicted',match:'NORMALIZED'},{label:'Inferred search alias'}]},
  {targetId:'missing-card',label:'Ghost',aliases:[]}
];
const before=JSON.stringify(entries),matcher=createExactTermMatcher({cards,index:{entries}});
let checks=0;
const matches=(text,options)=>matcher.match(text,options).map(({text,targetId})=>[text,targetId]);
assert.deepEqual(matches('Deep Strike, DEEP STRIKE and deep strike.'),[['Deep Strike','deep'],['DEEP STRIKE','deep'],['deep strike','deep']]);checks++;
assert.deepEqual(matches('Deep Striker, myDeep Strike and Deep Strikeforce.'),[]);checks++;
assert.deepEqual(matches('Character models have Feel No Pain 4+.'),[['Character','character'],['Feel No Pain','feel']]);checks++;
assert.deepEqual(matches('Afflicted, Leader, Ghost and Inferred search alias.'),[['Afflicted','alias']]);checks++;
assert.deepEqual(matches('[LETHAL HITS] and Lethal Hits.'),[['[LETHAL HITS]','lethal']]);checks++;
assert.deepEqual(matches('Deep Strike: use Deep Strike.',{title:'Deep Strike'}),[['Deep Strike','deep']]);checks++;
assert.deepEqual(matches('Deep Strike',{title:'Deep Strike'}),[]);checks++;
assert.deepEqual(matches('Deep Strike grants Feel No Pain.',{title:'Deep Strike'}),[['Deep Strike','deep'],['Feel No Pain','feel']]);checks++;
assert.deepEqual(matcher.ambiguous,[{term:'Leader',targetIds:['ambiguous-a','ambiguous-b']}]);checks++;
assert.equal(JSON.stringify(entries),before,'Inventory source bytes are not changed');checks++;
const longest=createExactTermMatcher({cards,index:{entries:[...entries,{targetId:'alias',label:'Feel No Pain 4+',aliases:[]}]}});
assert.deepEqual(longest.match('Feel No Pain 4+ and Feel No Pain.').map(row=>row.targetId),['alias','feel']);checks++;
const absent=createExactTermMatcher({cards,index:{entries:entries.filter(entry=>entry.targetId!=='character')}});
assert.deepEqual(absent.match('CHARACTER'),[],'An unenrolled keyword is not guessed');checks++;
assert.deepEqual(createExactTermMatcher({cards,index:{entries:[]}}).match('Deep Strike'),[]);checks++;
assert.throws(()=>createRuleTermLinker({cards,index:{entries}}),/document and canonical anchor factory/);checks++;
// Negative controls: changing the source term or making identity ambiguous must
// visibly change the matcher result, rather than silently use a built-in catalog.
const removed=createExactTermMatcher({cards,index:{entries:entries.filter(entry=>entry.targetId!=='deep')}});
assert.throws(()=>assert.deepEqual(removed.match('Deep Strike'),matcher.match('Deep Strike')),assert.AssertionError);checks++;
const poisoned=createExactTermMatcher({cards,index:{entries:[...entries,{targetId:'alias',label:'Deep Strike',aliases:[]}]}});
assert.deepEqual(poisoned.match('Deep Strike'),[]);checks++;
// Minimal DOM surface: tests the actual text-node pass without adding a DOM
// dependency, alternate renderer or browser startup to this focused unit test.
class Node {
  constructor(tagName=null,text=''){this.tagName=tagName;this.nodeValue=tagName?null:text;this.children=[];this.parentElement=null;this.dataset={};this.classes=new Set();this.classList={add:value=>this.classes.add(value)};}
  get textContent(){return this.tagName?this.children.map(child=>child.textContent).join(''):this.nodeValue;}
  get firstElementChild(){return this.children.find(child=>child.tagName&&child.tagName!=='#FRAGMENT');}
  get nextSibling(){return this.parentElement?.children[this.parentElement.children.indexOf(this)+1]||null;}
  append(...nodes){for(const node of nodes){if(node.tagName==='#FRAGMENT'){this.append(...node.children);continue;}node.parentElement=this;this.children.push(node);}}
  replaceWith(fragment){const parent=this.parentElement,index=parent.children.indexOf(this);for(const node of fragment.children)node.parentElement=parent;parent.children.splice(index,1,...fragment.children);this.parentElement=null;}
  closest(selector){for(let node=this;node;node=node.parentElement){if(selector==='[data-card-id],[data-canonical-id],[data-rule-term-title]'){if(node.dataset.cardId||node.dataset.canonicalId||node.dataset.ruleTermTitle)return node;}else if(selector.split(',').some(tag=>tag.toUpperCase()===node.tagName))return node;}return null;}
}
const text=value=>new Node(null,value),element=(tag,...children)=>{const node=new Node(tag.toUpperCase());node.append(...children);return node;};
const document={
  createTreeWalker(root){const texts=[];const visit=node=>{for(const child of node.children){if(child.tagName)visit(child);else texts.push(child);}};visit(root);let i=0;return {nextNode:()=>texts[i++]||null};},
  createTextNode:text,createDocumentFragment:()=>element('#FRAGMENT')
};
const anchors=[];
const linker=createRuleTermLinker({document,cards,index:{entries},anchor:(label,targetId,reference,options)=>{anchors.push({label,targetId,reference,options});const node=element('a',text(label));node.dataset.targetId=targetId;return node;}});
const paragraph=element('p',text('Deep Strike: a CHARACTER has Feel No Pain 4+. '),element('a',text('Deep Strike')),element('button',text('Feel No Pain')));
paragraph.dataset.factId='original-field';const original=paragraph.textContent;
const root=element('article',element('h3',text('Deep Strike')),paragraph);
assert.deepEqual(linker.link(root,{title:'Deep Strike'}),{links:2,textNodes:1});checks++;
assert.equal(root.textContent,'Deep Strike'+original,'Visible text is preserved exactly');checks++;
assert.equal(paragraph.dataset.factId,'original-field','Fact owner and dataset stay on original DOM node');checks++;
assert.deepEqual(anchors,[{label:'CHARACTER',targetId:'character',reference:true,options:{reference:true}},{label:'Feel No Pain',targetId:'feel',reference:true,options:{reference:true}}]);checks++;
assert.deepEqual(linker.link(root,{title:'Deep Strike'}),{links:0,textNodes:0},'Repeated pass adds no links or work to existing text nodes');checks++;
assert.equal(linker.counts.links,2);assert.equal(linker.counts.byTarget.feel,1);checks++;
console.log(JSON.stringify({status:'PASS',checks,terms:matcher.terms.length,ambiguous:matcher.ambiguous.length,fetches:0}));

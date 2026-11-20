/** Older-browser substitutions preserve lexical identity and source table order. */
import assert from 'node:assert/strict';
import {normalizeImportLabel,importModelLabelCandidates} from '../books/shared/roster-v2/import.mjs';
import {createReferencePresenter} from '../books/shared/army-book-app-v2/reference-v1.mjs';
import {renderSourceTable} from '../books/shared/army-book-app-v2/source-table.mjs';

// This is the exact accepted pre-change expression, used only in Node QA.
const beforeNumber=value=>normalizeImportLabel(value).replace(/ies$/,'y').replace(/(?<!s|u|i)s$/,'');
const seeds=['','s','ss','us','is','xs','ies','y','Titus','Typhus','Belisarius','Legionaries',
  'Deathshroud Terminators','Skitarii','Kataphron Breachers','Plague Marines','Pteraxii',
  'Lictor','GENESTEALERS','Émissaries','Châssis','O’Shovah','T’au','Knight 2','Model-3',
  ' spaced  labels ','models\nwith\ttabs','I','S','U','x.s','x/s','model’s'];
for(const first of 'abcdefghijklmnopqrstuvwxyz')for(const last of 'suiy')seeds.push(first+last);
const candidates=[...new Set(seeds.flatMap(word=>[word,word+'s',word+'ies',word+'y',word.toUpperCase()]))];
let lexicalCases=0;
for(const query of candidates){
  const models=[query,query+'s',query+'ies',query.replace(/s$/,''),'Titus','Typhus','Skitarii'].map((name,index)=>({
    id:'model-'+index,labels:[name],data:{composition:{quantity:{max:index%3===0?1:2}}}
  }));
  // Exclude the exact spelling in this lane so the public API exercises the
  // plural boundary as well as the separate exact-name priority lane below.
  for(const records of [models,models.filter(model=>model.labels.every(name=>normalizeImportLabel(name)!==normalizeImportLabel(query)))]){
    const exact=records.filter(model=>model.labels.some(name=>normalizeImportLabel(name)===normalizeImportLabel(query)));
    const expected=exact.length||!normalizeImportLabel(query)?exact:records.filter(model=>
      model.data.composition.quantity.max>1&&model.labels.some(name=>beforeNumber(name)===beforeNumber(query)));
    assert.deepEqual(importModelLabelCandidates(records,query,model=>model.labels).map(row=>row.id),expected.map(row=>row.id),query);
    lexicalCases++;
  }
}
for(const [query,name,maximum,match]of[
  ['Legionaries','Legionary',10,true],['Terminators','Terminator',10,true],['Marines','Marine',10,true],
  ['Titus','Titu',2,false],['Typhus','Typhu',2,false],['Skitariis','Skitarii',2,false],
  ['Tituss','Titus',2,false],['Legionaries','Legionary',1,false],['Titus','Titus',1,true],
  ['s','',2,true],['Us','u',2,false],['Is','i',2,false]
]){
  const model={id:'reviewed-model',labels:[name],quantity:{max:maximum}};
  assert.equal(importModelLabelCandidates([model],query,row=>row.labels).length,match?1:0,query+' / '+name);
  lexicalCases++;
}

class Element {
  constructor(tag,className='',text){this.tag=tag;this.className=className;this.children=[];this.dataset={};this.attributes={};this.text=text;}
  append(...children){this.children.push(...children);}
  setAttribute(key,value){this.attributes[key]=String(value);}
  get classList(){return {add:value=>{this.className=[this.className,value].filter(Boolean).join(' ');}};}
}
const el=(...args)=>new Element(...args);
const descendants=(node,predicate)=>[...(predicate(node)?[node]:[]),...node.children.flatMap(child=>descendants(child,predicate))];
const allText=node=>[node.text,...node.children.map(allText)].filter(value=>value!==undefined).join('');
const factValue=(tag,field)=>{const node=el(tag,'',field.displayValue??field.value);node.dataset.factId=field.id;return node;};
const field=(row,column,value,geometry={})=>Object.freeze({id:`r${row}c${column}`,value,presentation:'table-cell',
  source:Object.freeze({entityId:'source-table',path:`/rows/${row}/${column}`}),
  table:Object.freeze({id:'bound-table',row,column,...geometry})});
const flatFields=Object.freeze([field(2,2,'D'),field(1,2,'C'),field(2,1,'B'),field(1,1,'A')]);
const geometryFields=Object.freeze([field(2,2,'D'),field(1,2,'C'),field(2,1,'B'),field(1,1,'A',{header:true,rowSpan:2})]);
const prose=Object.freeze({id:'prose',value:'ACBD\nComplete paragraph.',source:Object.freeze({entityId:'source-table',path:'/text'})});
function reference(fields){
  const card={id:'reference',kind:'APPENDIX',title:'Bound table',fields:Object.freeze([...fields,prose])};
  const presenter=createReferencePresenter({el,factValue,anchor:()=>el('a'),
    contract:{resolve:()=>({targetId:card.id,title:card.title,category:'Appendix',contextLabel:'Core Rules',
      sections:[{card,fields:card.fields}],references:[]})},cards:new Map([[card.id,card]]),
    payload:{bookPresentation:{records:{}}},allowedIds:()=>new Set([card.id])});
  return presenter.render(card.id);
}

const column=(a,b)=>a.table.column-b.table.column;
const rowColumn=(a,b)=>a.table.row-b.table.row||column(a,b);
let orderingCases=0;
// toSorted materializes sparse holes as undefined. Array.from/spread followed
// by sort preserves that property, without mutating the source array.
for(const fields of [[],[...flatFields],[undefined,...flatFields,undefined],Object.assign(new Array(8),{1:flatFields[0],4:flatFields[1],7:flatFields[2]})]){
  for(const compare of [column,rowColumn]){
    const original=fields.slice(),keys=Object.keys(fields),expected=fields.toSorted(compare),actual=[...fields].sort(compare);
    assert.deepEqual(actual,expected);assert.deepEqual(fields,original);assert.deepEqual(Object.keys(fields),keys);orderingCases++;
  }
}
const before=JSON.stringify({flatFields,geometryFields,prose});
const descriptor=Object.getOwnPropertyDescriptor(Array.prototype,'toSorted');
try{
  Object.defineProperty(Array.prototype,'toSorted',{...descriptor,value:undefined});
  const flat=reference(flatFields);
  assert.equal(allText(flat).includes('ACBD'),false,'The exact table echo remains suppressed');
  assert.equal(allText(flat).includes('Complete paragraph.'),true,'The remaining complete paragraph is unchanged');
  assert.deepEqual(descendants(flat,node=>node.dataset.factId!==undefined).map(node=>node.dataset.factId),
    ['prose','r2c1','r2c2','r1c1','r1c2'],'The legacy table keeps row insertion order and sorts each row by source column');
  const geometric=reference(geometryFields);
  assert.deepEqual(descendants(geometric,node=>node.dataset.factId!==undefined).map(node=>node.dataset.factId),
    ['prose','r1c1','r1c2','r2c1','r2c2'],'The explicit source layout sorts source rows and columns');
  const table=renderSourceTable({el,fields:geometryFields,factValue,metadata:{columns:['First','Second']}});
  assert.deepEqual(descendants(table,node=>node.dataset.factId!==undefined).map(node=>node.dataset.factId),
    ['r1c1','r1c2','r2c1','r2c2']);
  const header=descendants(table,node=>node.rowSpan===2)[0];assert.equal(header.tag,'th');assert.equal(header.scope,'col');
  assert.deepEqual(descendants(table,node=>node.dataset.rowId!==undefined).map(node=>node.dataset.rowId),['1','2']);
}finally{Object.defineProperty(Array.prototype,'toSorted',descriptor);}
assert.equal(JSON.stringify({flatFields,geometryFields,prose}),before,'Rendering does not mutate source facts or field order');
const bareMark=/\p{M}/u,classMark=/[\p{M}]/u;
for(let point=0;point<=0x10ffff;point++)assert.equal(bareMark.test(String.fromCodePoint(point)),classMark.test(String.fromCodePoint(point)),'Unicode mark '+point);
console.log(JSON.stringify({status:'PASS',unicodeCodePoints:0x110000,lexicalCases,orderingCases,renderedSorterCallSites:3,
  sourceFactsUnchanged:true,oldBrowserSimulation:'Array.prototype.toSorted unavailable',oldTestsChanged:false}));

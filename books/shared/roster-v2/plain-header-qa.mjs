import assert from 'node:assert/strict';
import {parse} from './parser.mjs';
import {lexicalDraft} from './import.mjs';
const names=['Steel and Fire','A','B','C','A and B','B and C','Red, Gold'];
const book={entities:names.map((title,index)=>({id:'det-'+index,kind:'DETACHMENT',data:{title}}))};
const input=(heading,{title='League: example',faction='Example faction',count=2}={})=>
 `${title} (950 Points)\n\n${faction}\n${heading} (${count} Detachment Points)\n\n1x Example (5 pts): Warlord, Example weapon\n• 1x Example: 1x Other weapon\nCreated with newrecruit.eu v37.15\n`;
const check=(heading,expected,options)=>assert.deepEqual(lexicalDraft(input(heading,options),parse,book).detachments.map(row=>row.label),expected);
check('Steel and Fire',['Steel and Fire']);
check('Steel and Fire and C',['Steel and Fire','C']);
check('A and B',['A and B']); // Whole known names win over individual names.
check('Steel and Fire, C and Red, Gold',['Steel and Fire','C','Red, Gold']);
check('Steel and Fire, C, and Red, Gold',['Steel and Fire','C','Red, Gold']);
check('A and B and C',['A and B and C']); // Two complete covers: remain unresolved.
check('Steel and Fire and Unknown',['Steel and Fire and Unknown']);
check('Steel and Fire, Unknown and C',['Steel and Fire, Unknown and C']);
check('A, A',['A','A']); // Canonical admission retains its existing duplicate semantics.
check('Unknown',['Unknown']);
const parsed=parse(input('Steel and Fire',{count:99}));
assert.deepEqual(parsed.plainHeader,{listName:'League: example',detachmentPoints:99});
assert.equal(parsed.pointsLimit,950);assert.equal(parsed.faction,'Example faction');
assert.equal(parsed.units.length,1);assert.equal(parsed.units[0].warlord,true);
const labelled=input('Steel and Fire').replace('Example faction\nSteel and Fire (2 Detachment Points)',
 '+ FACTION KEYWORD: Example faction\n+ DETACHMENT: Steel and Fire');
const oldStyle=labelled.replaceAll('+ FACTION','FACTION').replaceAll('+ DETACHMENT','DETACHMENT');
for(const text of [labelled,oldStyle]){
 const value=parse(text);assert(!Object.hasOwn(value,'plainHeader'));assert.equal(value.pointsLimit,null);
 assert.deepEqual(value.units,parsed.units,'The body decoder is identical across header formats');
 assert.deepEqual(lexicalDraft(text,parse,book).detachments.map(row=>row.label),['Steel and Fire']);
}
assert(!Object.hasOwn(parse(input('Steel and Fire').replace('Example faction','+ FACTION KEYWORD: Example faction')),'plainHeader'));
assert(!Object.hasOwn(parse(input('Steel and Fire').replace('\n\n1x Example','\nAttached Units\n\n1x Example')),'plainHeader'));
assert(!Object.hasOwn(parse(input('Steel and Fire').replace('Example faction','Example faction\nAnother faction')),'plainHeader'));
assert(!Object.hasOwn(parse(input('Steel and Fire').replace('(950 Points)','(9,50 Points)')),'plainHeader'));
console.log(JSON.stringify({status:'PASS',segmentationCases:10,controls:['colon in list name','known internal and/comma','unique complete cover','Oxford comma','ambiguous cover','unknown remainder retained','duplicate occurrence retained','DP count informational','body/warlord/gear unchanged','labelled precedence with/without plus','partial labelled header','Attached Units not enrolled','ambiguous faction header','malformed number']}));

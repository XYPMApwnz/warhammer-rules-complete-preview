import assert from 'node:assert/strict';
import {modelBaseCaption} from './cosmetics.mjs';
const cases=[
  ['(⌀Use model)','(Use model base)'],['(ØUse model)','(Use model base)'],
  ['(Use model)','(Use model base)'],['Use model','Use model base'],
  ['Profile: (⌀Use model)','Profile: (Use model base)'],
  ['Profile: ØUse model','Profile: Use model base'],
  ['(⌀32mm)','(⌀32mm)'],['(Ø120x92mm)','(Ø120x92mm)'],
  ['Profile: (⌀80mm)','Profile: (⌀80mm)'],['Use model base','Use model base']
];
for(const [value,expected]of cases){
  const field=Object.freeze({value});assert.equal(modelBaseCaption(field.value),expected);assert.equal(field.value,value);
}
assert.equal(modelBaseCaption(null),null);
console.log(JSON.stringify({status:'PASS',cases:cases.length,sourceValuesUnchanged:true}));

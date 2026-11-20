/** A target transform must not silently repair an incompatible publication. */
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {assertBrowserSource,checkBrowserPackage} from '../tools/browser-compatibility.mjs';

const mutations=[
  ['JSON with',"import data from './data.json' with {type:'json'};",/BROWSER_JSON_ATTRIBUTES/],
  ['JSON assert',"import data from './data.json' assert {type:'json'};",/BROWSER_JSON_ATTRIBUTES/],
  ['multiline attributes',"import data from './data.json'\nwith /* marker */ {\n type: 'json' };",/BROWSER_JSON_ATTRIBUTES/],
  ['unsupported regexp',"const pattern=/(?<!s|u|i)s$/;",/BROWSER_REQUIRES_TRANSFORM/],
  ['unsupported syntax must not be transpiled',"const value={using:1}; using resource = value;",/BROWSER_REQUIRES_TRANSFORM|BROWSER_SYNTAX/]
];
for(const [name,source,error]of mutations)assert.throws(()=>assertBrowserSource(source,'mutation-'+name+'.mjs'),error,name);
assertBrowserSource("const data={value:1}; export default data;",'supported.mjs');
const report=checkBrowserPackage(fileURLToPath(new URL('../',import.meta.url)));
console.log(JSON.stringify({...report,negativeControls:mutations.map(([name])=>name)}));

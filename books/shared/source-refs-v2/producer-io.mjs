// Node-only producer boundary. Accepted inputs and producer scratch views keep
// their original shape; published outputs carry the shared source declarations.
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import {compileBookSourceRefs,registerBookSources,setDefaultSourceRegistry,sourceDeclarationView} from './source-refs.mjs';
import {loadSourceRegistry} from './source-registry.mjs';
import {externalizeSources,compactSourceJSON} from './source-serialization.mjs';

const root=fileURLToPath(new URL('../../../',import.meta.url));
const registry=loadSourceRegistry(root);
setDefaultSourceRegistry(registry);

export function prepareSourceProducer(value){
  if(!value||typeof value!=='object')return value;
  registerBookSources(value);
  return sourceDeclarationView(value);
}
export const parseProducerJSON=text=>prepareSourceProducer(JSON.parse(text));
export const finalizeSourceOutput=value=>externalizeSources(compileBookSourceRefs(JSON.parse(JSON.stringify(prepareSourceProducer(value))),{registry}));
export const serializeSourceJSON=value=>compactSourceJSON(finalizeSourceOutput(value));

if(process.argv[1]===fileURLToPath(import.meta.url)){
  const input=JSON.parse(fs.readFileSync(0,'utf8'));
  const output=process.argv.includes('--batch')?Object.fromEntries(Object.entries(input).map(([key,value])=>[key,finalizeSourceOutput(value)])):finalizeSourceOutput(input);
  process.stdout.write(JSON.stringify(process.argv.includes('--serialized')?Object.fromEntries(Object.entries(output).map(([key,value])=>[key,compactSourceJSON(value)])):output));
}

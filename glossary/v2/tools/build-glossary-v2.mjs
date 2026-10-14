import fs from 'node:fs';
import assert from 'node:assert/strict';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {buildGlossaryV2Index,rebuildCoreGlossaryProjection} from '../content/glossary-v2-index.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const output=path.join(root,'generated','index.en.json');
const browserOutput=path.join(root,'generated','index.en.js');
const check=process.argv.includes('--check');
const coreOnly=process.argv.includes('--core-only');
const publication=process.argv.find(argument=>argument.startsWith('--publication='))?.slice('--publication='.length)||output;
if(publication!==output&&!coreOnly)throw new Error('--publication requires --core-only');
// A scoped Core rebuild must not preserve stale Army/MFM/Mission facts unnoticed.
const fresh=await buildGlossaryV2Index();
const index=coreOnly?rebuildCoreGlossaryProjection(JSON.parse(fs.readFileSync(publication,'utf8'))):fresh;
if(coreOnly)assert.deepEqual(index.entries.filter(entry=>entry.domain!=='CORE'),fresh.entries.filter(entry=>entry.domain!=='CORE'),'Stale non-Core factual publication; full Glossary rebuild required');
const serialized=`${JSON.stringify(index,null,2)}\n`;
const browserSerialized=`window.WH40K_GLOSSARY_V2_INDEX=${JSON.stringify(JSON.parse(serialized))};\n`;
if(check){
  if(!fs.existsSync(output)||fs.readFileSync(output,'utf8')!==serialized)throw new Error('Glossary V2 generated index is stale');
  if(!fs.existsSync(browserOutput)||fs.readFileSync(browserOutput,'utf8')!==browserSerialized)throw new Error('Glossary V2 browser index is stale');
}else{fs.mkdirSync(path.dirname(output),{recursive:true});fs.writeFileSync(output,serialized);fs.writeFileSync(browserOutput,browserSerialized);}
console.log(`Glossary V2 ${check?'check':'build'}${coreOnly?' (Core projection only)':''}: ${JSON.parse(serialized).counts.total} entries`);

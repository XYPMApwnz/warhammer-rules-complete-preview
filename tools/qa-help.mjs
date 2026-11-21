import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const scripts=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8')).scripts||{};
const descriptions={
  'qa:quick':'Sequential shared gates; select native books with -- --books=am,dg',
  'qa:pre-ff':'Sequential nine-book, shared, browser, package and source gates',
  'qa:sm':'Space Marines source conformance and local semantic QA',
  'qa:da':'Dark Angels dependency-overlay and Enhancement QA',
  'qa:ba':'Blood Angels dependency-overlay and Enhancement QA',
  'qa:dg':'Death Guard local semantic and presentation QA',
  'qa:am':'Adeptus Mechanicus local QA (heavy despite book scope)',
  'qa:tyranids':'Tyranids book, compatible-rules, and mobile QA',
  'qa:tau':"T'au book, compatible-rules, and mobile QA",
  'qa:ec':"Emperor's Children compatible-rules, mobile, and Pledge QA",
  'qa:csm':'Chaos Space Marines compatibility, roster, source, and mobile QA',
  'qa:effects':'Shared effect ownership, provider equality, and physical effects',
  'qa:points':'Effective points build/check and projection QA',
  'qa:roster':'Shared roster fixtures, context, ownership, and assessment',
  'qa:glossary':'Glossary check, editorial, viewer, and navigation QA',
  'qa:publication':'Static publication inventory, offline routes, and rendered output',
  'qa:sources':'Source freshness, enrollment, ingestion, and authenticated binding',
  'qa:architecture':'Cheap repository wiring smoke for closed architecture',
  'qa:integration':'Repository wiring and publication integration smoke',
  'qa:workflow':'Codex guidance, path, and npm-alias validation',
  'qa:release':'Explicit expensive aggregate of targeted and source/publication gates'
};

const missing=Object.keys(descriptions).filter(name=>!scripts[name]);
if(missing.length)throw new Error(`Missing QA scripts: ${missing.join(', ')}`);
const width=Math.max(...Object.keys(descriptions).map(name=>name.length));
console.log('Targeted QA commands\n');
for(const [name,description] of Object.entries(descriptions))console.log(`  npm run ${name.padEnd(width)}  ${description}`);
console.log('\nStart local. Expand with docs/codex/QA_MATRIX.md. Run qa:release only in an authorized release session.');

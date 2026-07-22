import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const file=path.join(root,'index.html');
const lines=fs.readFileSync(file,'utf8').split(/\r?\n/);
let mode='ranged';
let rowDepth=0;
let rowCell=0;
let rowIsHeader=false;
let changed=0;

const labels=()=>['Weapon','Range','A',mode==='ranged'?'BS':'WS','S','AP','D'];
const divDelta=line=>(line.match(/<div(?:\s|>)/g)||[]).length-(line.match(/<\/div>/g)||[]).length;

for(let index=0;index<lines.length;index+=1){
  const line=lines[index];
  if(line.includes('<h5>Ranged weapons</h5>'))mode='ranged';
  if(line.includes('<h5>Melee weapons</h5>'))mode='melee';

  if(!rowDepth&&line.includes('<div class="weapon-row')){
    rowDepth=divDelta(line);
    rowCell=0;
    rowIsHeader=line.includes('weapon-head');
    continue;
  }
  if(!rowDepth)continue;

  const directCell=rowDepth===1&&/^<div(?:\s[^>]*)?>/.test(line.trim());
  if(!rowIsHeader&&directCell){
    const label=labels()[rowCell];
    if(rowCell>0&&label&&!line.includes('data-label=')){
      lines[index]=line.replace('<div>',`<div data-label="${label}">`);
      changed+=1;
    }
    rowCell+=1;
  }else if(rowIsHeader&&directCell){
    rowCell+=1;
  }
  rowDepth+=divDelta(line);
}

if(changed){
  fs.writeFileSync(file,`${lines.join('\n')}\n`,'utf8');
}
console.log(`Death Guard weapon labels: ${changed} added`);

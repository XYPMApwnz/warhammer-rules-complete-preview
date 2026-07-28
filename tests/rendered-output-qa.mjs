import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {recordText} from '../books/core-rules/content/record-content.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const glossary=JSON.parse(fs.readFileSync(path.join(root,'glossary','registry.en.json'),'utf8')).terms;
const aliases=JSON.parse(fs.readFileSync(path.join(root,'glossary','aliases.en.json'),'utf8')).aliases;
const knownTerms=new Set([...Object.keys(glossary),...Object.keys(aliases)]);
const errors=[];

function walk(directory){
  return fs.readdirSync(directory,{withFileTypes:true}).flatMap(entry=>{
    const target=path.join(directory,entry.name);
    if(entry.isDirectory())return entry.name==='tmp'||entry.name==='node_modules'||entry.name==='design-prototypes'?[]:walk(target);
    return entry.name.endsWith('.html')?[target]:[];
  });
}

const htmlFiles=[path.join(root,'index.html'),...walk(path.join(root,'books')),...walk(path.join(root,'glossary')),...walk(path.join(root,'roster-guides'))];
for(const file of htmlFiles){
  const relative=path.relative(root,file).replaceAll('\\','/');
  const html=fs.readFileSync(file,'utf8');
  if(!/<html\b[^>]*\blang="en"/i.test(html))errors.push(`${relative}: missing lang="en"`);
  if(/[\u0400-\u04ff]|\ufffd/.test(html))errors.push(`${relative}: non-English or damaged visible text`);

  const ids=[...html.matchAll(/(?:^|\s)id="([^"]+)"/g)].map(match=>match[1]);
  for(const id of ids.filter((id,index)=>ids.indexOf(id)!==index))errors.push(`${relative}: duplicate id ${id}`);
  for(const termId of [...html.matchAll(/\bdata-term="([^"]+)"/g)].map(match=>match[1]))if(!knownTerms.has(termId))errors.push(`${relative}: unknown glossary term ${termId}`);

  for(const match of html.matchAll(/\b(?:href|src)="([^"]+)"/g)){
    const value=match[1];
    if(!value||/^(?:[a-z]+:|\/\/)/i.test(value)||value.startsWith('data:'))continue;
    const [rawPath,fragment='']=value.split('#',2);
    const cleanPath=rawPath.split('?')[0];
    const target=cleanPath?path.resolve(path.dirname(file),decodeURIComponent(cleanPath)):file;
    const resolved=fs.existsSync(target)&&fs.statSync(target).isDirectory()?path.join(target,'index.html'):target;
    if(!fs.existsSync(resolved)){errors.push(`${relative}: broken local asset ${value}`);continue;}
    if(fragment&&resolved.endsWith('.html')&&!resolved.endsWith(path.join('glossary','index.html'))){
      const targetHtml=resolved===file?html:fs.readFileSync(resolved,'utf8');
      if(!targetHtml.includes(`id="${decodeURIComponent(fragment)}"`))errors.push(`${relative}: missing anchor ${value}`);
    }
  }
}

const digital=JSON.parse(fs.readFileSync(path.join(root,'books','core-rules','content','core-rules.digital-11e.json'),'utf8'));
for(const record of digital.records){
  const text=`${record.title}\n${recordText(record)}`;
  const openings=(text.match(/</g)||[]).length,closings=(text.match(/>/g)||[]).length;
  if(openings!==closings)errors.push(`Core Rules ${record.code}: unmatched angle bracket`);
}

assert.equal(errors.length,0,errors.join('\n'));
console.log(`Rendered output QA passed: ${htmlFiles.length} public pages, ${knownTerms.size} glossary IDs.`);

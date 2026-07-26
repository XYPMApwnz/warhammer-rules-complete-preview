import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const registry=JSON.parse(fs.readFileSync(path.join(root,'registry.en.json'),'utf8'));
const aliases=JSON.parse(fs.readFileSync(path.join(root,'aliases.en.json'),'utf8')).aliases;
const errors=[];
const ids=new Set(Object.keys(registry.terms));
const presentations=new Set(['atomic','article','profile','reference','metadata']);
for(const [id,term] of Object.entries(registry.terms)){
  for(const field of ['id','kind','scope','edition','language','title','summary','definition','canonicalSource','status'])if(term[field]==null)errors.push(`${id}: missing ${field}`);
  const summary=String(term.summary?.en||'').replace(/\s+/g,' ').trim();
  const definition=String(term.definition?.en||'').replace(/\s+/g,' ').trim();
  if(!summary)errors.push(`${id}: empty popup summary`);
  if(!definition)errors.push(`${id}: empty full definition`);
  if(summary.length>280)errors.push(`${id}: popup summary is longer than 280 characters`);
  if(definition.length>320&&summary===definition)errors.push(`${id}: long definition is duplicated as popup summary`);
  if(!presentations.has(term.presentation))errors.push(`${id}: invalid presentation ${term.presentation}`);
  if(term.presentation==='article'&&summary===definition)errors.push(`${id}: article duplicates its popup summary as the full rule`);
  if(term.presentation==='profile'&&!term.structured?.weapon&&!term.structured?.statline)errors.push(`${id}: profile has no structured weapon or statline`);
  if(/^(weapon|datasheet) profile\.?$/i.test(summary))errors.push(`${id}: technical popup placeholder`);
  if(/^(weapon|datasheet) profile\.?$/i.test(definition))errors.push(`${id}: technical full-definition placeholder`);
  if(/no standalone Core Rules effect/i.test(`${summary} ${definition}`))errors.push(`${id}: obsolete keyword boilerplate`);
  if(!term.canonicalSource?.documentId||!term.canonicalSource?.revision||!term.canonicalSource?.locator)errors.push(`${id}: incomplete canonicalSource`);
  if(!['verified','provisional','deprecated'].includes(term.status))errors.push(`${id}: invalid status ${term.status}`);
  for(const target of [...(term.related||[]),...(term.mentions||[])])if(!ids.has(target))errors.push(`${id}: unresolved relation ${target}`);
  const keywordReferences=[...(term.references?.intrinsicRules||[]),...(term.references?.referencedByRules||[]),...(term.references?.commonRules||[]),...(term.references?.factionTerms||[]),...(term.references?.relatedKeywords||[])];
  for(const target of keywordReferences)if(!ids.has(target))errors.push(`${id}: unresolved keyword reference ${target}`);
  if(new Set(keywordReferences).size!==keywordReferences.length)errors.push(`${id}: duplicated keyword reference`);
  for(const target of term.references?.relatedKeywords||[])if(registry.terms[target]?.kind!=='keyword')errors.push(`${id}: related keyword ${target} is not a keyword`);
  if((term.kind==='keyword'||id.startsWith('keyword-'))&&term.references==null)errors.push(`${id}: keyword references were not generated`);
}
if(ids.has('keyword-flying'))errors.push('keyword-flying: FLYING must resolve to the canonical FLY keyword');
if(aliases['keyword-flying']!=='keyword-fly')errors.push('keyword-flying: missing legacy alias to keyword-fly');
for(const [alias,target] of Object.entries(aliases)){
  if(alias===target)errors.push(`${alias}: alias points to itself`);
  if(!ids.has(target))errors.push(`${alias}: unknown alias target ${target}`);
  if(aliases[target])errors.push(`${alias}: alias chain through ${target}`);
}
for(const bookId of ['core-rules','death-guard','adeptus-mechanicus']){
  const context=JSON.parse(fs.readFileSync(path.join(root,'contexts',`${bookId}.json`),'utf8'));
  for(const [localId,entry] of Object.entries(context.terms)){
    if(!ids.has(aliases[entry.termId]||entry.termId))errors.push(`${bookId}/${localId}: unknown term ${entry.termId}`);
    for(const field of ['title','summary','definition'])if(field in entry)errors.push(`${bookId}/${localId}: context contains canonical field ${field}`);
  }
}
if(errors.length){console.error(errors.join('\n'));process.exit(1);}
console.log(`Mega Glossary QA passed: ${ids.size} canonical terms, ${Object.keys(aliases).length} aliases.`);

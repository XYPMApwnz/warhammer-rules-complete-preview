import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const moduleFile=fileURLToPath(import.meta.url);
const defaultRoot=()=>path.resolve(path.dirname(moduleFile),'../../..');
const inventoryFile=root=>path.join(root,'books/publication-inventory.json');
const sorted=values=>values.slice().sort((a,b)=>a.localeCompare(b));

export function validatePublicationInventory({root=defaultRoot(),inventory}={}){
  const errors=[];
  if(inventory?.schema!=='warhammer-publication-inventory/v1')errors.push('Unsupported publication inventory schema');
  if(!Array.isArray(inventory?.books)||!inventory.books.length)return [...errors,'Publication inventory is empty'];
  const ids=inventory.books.map(book=>book.id),duplicates=[...new Set(ids.filter((id,index)=>ids.indexOf(id)!==index))];
  if(duplicates.length)errors.push('Duplicate publication IDs: '+duplicates.join(', '));
  for(const book of inventory.books){
    for(const field of ['id','title','config'])if(typeof book[field]!=='string'||!book[field])errors.push(`${book.id||'<unknown>'}: invalid ${field}`);
    for(const field of ['library','offline','freshness','mobile'])if(typeof book[field]!=='boolean')errors.push(`${book.id||'<unknown>'}: ${field} must be boolean`);
    if(book.offline&&!book.library)errors.push(`${book.id}: offline publication requires library publication`);
    if(book.mobile&&!book.library)errors.push(`${book.id}: mobile output requires library publication`);
    if(book.mobile&&!book.freshness)errors.push(`${book.id}: mobile output requires freshness coverage`);
    const configPath=path.join(root,book.config||'');
    if(!fs.existsSync(configPath)){errors.push(`${book.id}: missing config ${book.config}`);continue;}
    const config=JSON.parse(fs.readFileSync(configPath,'utf8'));
    if(config.id!==book.id)errors.push(`${book.id}: config ID is ${config.id}`);
    if(config.title!==book.title)errors.push(`${book.id}: config title is ${config.title}`);
    if(book.mobile&&!fs.existsSync(path.join(root,'books',book.id,'mobile','build.mjs')))errors.push(`${book.id}: mobile builder is missing`);
  }
  const discovered=[];
  for(const entry of fs.readdirSync(path.join(root,'books'),{withFileTypes:true}))if(entry.isDirectory()&&fs.existsSync(path.join(root,'books',entry.name,'book.config.json')))discovered.push(entry.name);
  const registered=inventory.books.map(book=>book.id);
  const missing=sorted(discovered.filter(id=>!registered.includes(id))),extra=sorted(registered.filter(id=>!discovered.includes(id)));
  if(missing.length||extra.length)errors.push(`Book config enrollment mismatch: missing=${missing.join(',')||'<none>'}; extra=${extra.join(',')||'<none>'}`);
  return errors;
}

export function loadPublicationInventory({root=defaultRoot()}={}){
  const inventory=JSON.parse(fs.readFileSync(inventoryFile(root),'utf8'));
  const errors=validatePublicationInventory({root,inventory});
  if(errors.length)throw new Error(errors.join('\n'));
  return inventory;
}

export const selectPublicationBooks=(inventory,field)=>inventory.books.filter(book=>book[field]);
export const selectArmyBookBuildBooks=inventory=>selectPublicationBooks(inventory,'library');
export const selectFreshnessOnlyBooks=inventory=>inventory.books.filter(book=>book.freshness&&!book.library);

function run(command,args,root){
  const result=spawnSync(command,args,{cwd:root,encoding:'utf8',maxBuffer:32*1024*1024});
  if(result.status!==0)throw new Error(`Freshness check failed: ${command} ${args.join(' ')}\n${result.stderr||result.stdout}`);
}

export function checkPublicationFreshness({root=defaultRoot()}={}){
  const inventory=loadPublicationInventory({root});
  for(const book of selectArmyBookBuildBooks(inventory))run(process.execPath,[`books/${book.id}/v2/app-build.mjs`,'--check'],root);
  if(selectFreshnessOnlyBooks(inventory).length)run(process.execPath,['books/shared/tools/source-freshness.mjs'],root);
  return inventory;
}

if(process.argv[1]&&path.resolve(process.argv[1])===moduleFile){
  try{
    const inventory=process.argv.includes('--check')?checkPublicationFreshness():loadPublicationInventory();
    console.log(`Publication inventory PASS: ${inventory.books.length} configured; ${selectPublicationBooks(inventory,'library').length} library; ${selectPublicationBooks(inventory,'offline').length} offline; ${selectPublicationBooks(inventory,'freshness').length} freshness.`);
  }catch(error){console.error(error.stack||error);process.exitCode=1;}
}

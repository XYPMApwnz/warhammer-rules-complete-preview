import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const input=path.resolve(root,'../../tmp/bsdata-wh40k-11e/Chaos - Emperor\'s Children.json');
const output=path.join(root,'sources/bsdata-enhancement-index.json');
const check=process.argv.includes('--check');
const raw=fs.readFileSync(input);
const source=JSON.parse(raw).catalogue;
const detachmentRoot=source.sharedSelectionEntries.find(item=>item.name==='Detachment');
const enhancementRoot=source.sharedSelectionEntryGroups.find(item=>item.name==='Enhancements');
if(!detachmentRoot||!enhancementRoot)throw new Error('Expected Detachment and Enhancements roots');

const detachments=new Map(detachmentRoot.selectionEntryGroups[0].selectionEntries.map(item=>[item.id,item.name]));
const childIds=value=>{
  if(Array.isArray(value))return value.flatMap(childIds);
  if(!value||typeof value!=='object')return[];
  const own=value.type==='equalTo'&&value.value===0&&value.field==='selections'&&value.scope==='force'&&detachments.has(value.childId)?[value.childId]:[];
  return own.concat(Object.values(value).flatMap(childIds));
};
const grouped=new Map([...detachments.values()].map(name=>[name,[]]));
for(const enhancement of enhancementRoot.selectionEntries){
  const ids=[...new Set(childIds(enhancement.modifiers||[]))];
  if(ids.length!==1)throw new Error(`${enhancement.name}: expected one detachment condition, got ${ids.length}`);
  grouped.get(detachments.get(ids[0])).push(enhancement);
}
const derived={
  schema:1,
  derivedFrom:{file:path.basename(input),sha256:crypto.createHash('sha256').update(raw).digest('hex').toUpperCase()},
  catalogue:{
    name:"Emperor's Children Enhancement Index",
    revision:source.revision,
    selectionEntryGroups:[...grouped].map(([name,selectionEntries],index)=>({
      id:`ec-enhancement-index-${index+1}`,
      name:`${name} Enhancements`,
      selectionEntries
    }))
  }
};
const content=`${JSON.stringify(derived,null,2)}\n`;
if(check){
  if(!fs.existsSync(output)||fs.readFileSync(output,'utf8')!==content)throw new Error('bsdata-enhancement-index.json is stale; rerun builder');
  console.log(`Checked ${enhancementRoot.selectionEntries.length} Enhancement records across ${grouped.size} detachments`);
}else{
  fs.writeFileSync(output,content);
  console.log(`Indexed ${enhancementRoot.selectionEntries.length} Enhancement records across ${grouped.size} detachments`);
}

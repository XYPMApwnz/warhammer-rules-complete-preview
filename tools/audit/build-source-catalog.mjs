/** Final source serialization pass, over existing accepted producer outputs.
 * --write consolidates document metadata once per book; --check is read-only.
 * Ordinary values, source associations and stratagem objects must inverse exactly. */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import assert from 'node:assert/strict';
import {compileBookSourceRefs,sourceDeclarationView} from '../../books/shared/source-refs-v2/source-refs.mjs';
import {externalizeSources,compactSourceJSON} from '../../books/shared/source-refs-v2/source-serialization.mjs';
import {loadSourceRegistry} from '../../books/shared/source-refs-v2/source-registry.mjs';
import {assertSourceReferenceClosure} from '../../books/shared/source-refs-v2/source-closure.mjs';
const root=fileURLToPath(new URL('../../',import.meta.url)),base='75d322e4e3274f14d7e2a81abace3ba63c784ec5';
const mode=process.argv[2];assert.ok(['--write','--check'].includes(mode));
const git=(...args)=>execFileSync('git',args,{cwd:root,maxBuffer:128*1024*1024});
// Explicit bootstrap from the reviewed migration base only. Normal rebuilds
// serialize current producer outputs and never replace facts from Git history.
const fromBase=process.argv.includes('--from-base');
if(fromBase)assert.equal(git('rev-parse','HEAD').toString().trim(),base,'Migration bootstrap is restricted to the exact reviewed base');
const ids=['adeptus-mechanicus','blood-angels','chaos-space-marines','dark-angels','death-guard','emperors-children','space-marines','tau-empire','tyranids'];
const files=git('ls-tree','-r','--name-only',base,'--','books').toString().trim().split('\n').filter(file=>ids.some(id=>file.startsWith(`books/${id}/v2/generated/`))&&file.endsWith('.json')).sort();
assert.equal(files.length,97);
const registry=loadSourceRegistry(root),published=new Set(JSON.parse(fs.readFileSync(path.join(root,'tools/pages-runtime-manifest.json'))).files.map(row=>row.path));
const tables={documents:{},layouts:{},contexts:{},bindings:{}},outputs=[];
for(const file of files){
 const original=fromBase?JSON.parse(git('show',base+':'+file)):sourceDeclarationView(JSON.parse(fs.readFileSync(path.join(root,file),'utf8'))),compiled=compileBookSourceRefs(original,{registry});
 assert.equal(JSON.stringify(sourceDeclarationView(compiled)),JSON.stringify(original),file+': exact inverse before publication');
 outputs.push([file,externalizeSources(compiled,{tables,bookId:file.split('/')[1],collect:true,shared:published.has(file)})]);
}
const catalog=path.join(root,'books/shared/source-refs-v2/source-catalog.json'),catalogBytes=JSON.stringify(tables)+'\n';
if(mode==='--write')fs.writeFileSync(catalog,catalogBytes);else assert.equal(fs.readFileSync(catalog,'utf8'),catalogBytes,'Shared source catalog changed');
for(const [file,output]of outputs){
 externalizeSources(output,{tables,bookId:file.split('/')[1]});
 assertSourceReferenceClosure(output,{catalog:tables,bookId:file.split('/')[1],label:file});
 const text=compactSourceJSON(output),target=path.join(root,file);
 if(mode==='--write')fs.writeFileSync(target,text);else assert.equal(fs.readFileSync(target,'utf8'),text,'Serialized source output changed: '+file);
}
console.log(JSON.stringify({status:'PASS',artifacts:outputs.length,catalogBytes:Buffer.byteLength(catalogBytes),documentsByBook:Object.fromEntries(Object.entries(tables.documents).map(([id,table])=>[id,Object.keys(table).length])),bindings:Object.keys(tables.bindings).length}));

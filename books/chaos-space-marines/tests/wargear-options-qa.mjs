import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=file=>JSON.parse(fs.readFileSync(path.join(root,file),'utf8'));
const source=read('content/chaos-space-marines-codex-datasheets.en.json');
const wargear=read('content/chaos-space-marines-codex-wargear.en.json');
const manifest=read('sources/source-manifest.json');
const compatible=read('generated/compatible-rules.json');
const targetContext={window:{}};
vm.runInNewContext(fs.readFileSync(path.join(root,'scripts/target-data.js'),'utf8'),targetContext);
const publication=targetContext.window.WH_ARMY_BOOK_TARGETS.html;
const hash=value=>crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex').toUpperCase();
const decode=value=>value.replace(/<br\s*\/?\s*>/gi,'\n').replace(/<[^>]+>/g,'').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&');
const options=html=>[...html.matchAll(/<li class="wargear-option">([\s\S]*?)<\/li>/g)].map(match=>decode(match[1]));
function extract(tag,id,html=publication){
  const opener=new RegExp(`<${tag}\\b[^>]*\\bid="${id}"[^>]*>`,'i').exec(html);assert.ok(opener,`Missing ${tag}#${id}`);
  const tags=new RegExp(`<\\/?${tag}\\b[^>]*>`,'gi');tags.lastIndex=opener.index;let depth=0;
  for(let match;(match=tags.exec(html));){depth+=match[0][1]==='/'?-1:1;if(depth===0)return html.slice(opener.index,tags.lastIndex);}
  assert.fail(`Unclosed ${tag}#${id}`);
}

assert.equal(source.datasheets.length,54);
assert.equal(source.legends.length,53);
assert.equal(wargear.source.bsdata.repositoryHead,'c714a01a5c7a7275495c4d3c32688a4292d4efd8');
assert.equal(wargear.source.bsdata.catalogueCommit,'b6d17952f74814528b4c70ef5016c86b922d5257');
assert.equal(wargear.source.bsdata.catalogueRevision,6);
assert.equal(wargear.source.bsdata.catalogueSha256,'A76D5ADAD2055572F6186996FD622B08CAB5AF95FAA38F82E80609E179F3EE35');
assert.equal(wargear.source.wahapedia.checkedAt,'2026-08-12');
assert.deepEqual(wargear.audit.summary,{checkedUnits:54,positiveCandidates:29,explicitNone:6,noSection:19,importedUnits:29,importedContracts:87,conflictUnits:0,unresolvedContracts:0,guessed:0});
assert.equal(wargear.audit.units.length,54);
assert.deepEqual(new Set(wargear.audit.units.map(item=>item.unitId)),new Set(source.datasheets.map(item=>item.id)));
assert.equal(wargear.units.length,29);
assert.equal(wargear.units.reduce((sum,item)=>sum+item.wargear.length,0),87);

const conflicts=Object.fromEntries(wargear.audit.units.filter(item=>item.unresolvedOptions?.length).map(item=>[item.title,item.unresolvedOptions]));
assert.deepEqual(conflicts,{});

const imported=new Map(wargear.units.map(item=>[item.title,item]));
assert.equal(imported.get('Chaos Rhino').wargear.length,2);
assert.equal(imported.get('Havocs').wargear.length,3);
assert.equal(imported.get('Helbrute').wargear.length,3);
assert.match(imported.get('Helbrute').wargear[2],/For each Helbrute fist[\s\S]*?can be equipped[\s\S]*?combi-bolter[\s\S]*?heavy flamer/);
for(const unit of source.datasheets){
  const record=imported.get(unit.title),article=extract('article',unit.id),stub=fs.readFileSync(path.join(root,'mobile',`${unit.id.replace(/^unit-/,'')}.html`),'utf8');
  assert.match(stub,new RegExp(`data-canonical-target="${unit.id}"`),`${unit.title}: legacy route target differs`);
  assert.doesNotMatch(stub,/<(?:article|section)\b|class="[^"]*\bunit-card\b|data-rule-id=/,`${unit.title}: legacy route contains copied content`);
  assert.equal((publication.match(new RegExp(`\\sid="${unit.id}"`,'g'))||[]).length,1,`${unit.title}: canonical Datasheet is duplicated`);
  if(record){
    assert.match(article,/<h5>Wargear Options<\/h5>/,`${unit.title}: Desktop options missing`);
    assert.deepEqual(options(article),record.wargear,`${unit.title}: Desktop option semantics differ`);
  }else{
    assert.doesNotMatch(article,/<h5>Wargear Options<\/h5>/,`${unit.title}: unresolved/no-option block rendered`);
  }
}

assert.equal(source.datasheets.reduce((sum,unit)=>sum+unit.weapons.length,0),315,'Weapon profile count changed');
assert.equal(source.datasheets.reduce((sum,unit)=>sum+(unit.wargearAbilities?.length||0),0),7,'Wargear Ability count changed');
assert.equal(hash(source.datasheets.map(unit=>[unit.id,unit.weapons])),'138D44F7678E2712E228F6A3EB5C9BFED3F91AEB0C8346972D4193311B1EA35A');
assert.equal(hash(source.datasheets.map(unit=>[unit.id,unit.abilities,unit.wargearAbilities])),'580DCB763C838EAD6DABF4A3E8FE2287B64D7211E4E4BB4B0646909A69809659');
assert.equal(hash(source.datasheets.map(unit=>[unit.id,unit.composition,unit.compositionText])),'3945D2254FF9F0F9CF4B198777F5E09B144527AA988A2A22AAFE903D2B9BA932');
assert.equal(hash(source.datasheets.map(unit=>[unit.id,unit.points])),'FF62E7F5ACA2DFD5E2F6926A9C9F420F7AB5ADB8748247957BD837EBE192C371');
const paidOptions=title=>source.datasheets.find(unit=>unit.title===title).paidWargear.map(({name,value})=>({name,value}));
assert.deepEqual(paidOptions('Defiler'),[{name:'Hades lascannon',value:15},{name:'Heavy reaper autocannon',value:15}]);
assert.deepEqual(paidOptions('Forgefiend'),[{name:'Ectoplasma cannon',value:5}]);
assert.equal(Object.values(compatible.units).reduce((sum,rows)=>sum+rows.length,0),3838);
assert.equal(hash(compatible),'D03D051EF1F9042D2951BE1604C90BC493305AEBE6640F3C6374C876C5FAC272');
assert.equal(fs.readdirSync(path.join(root,'mobile')).filter(file=>file.endsWith('.html')).length,74);
assert.equal(manifest.gates.publishAsComplete,true);
console.log('CSM Wargear Options QA: 54/54 audited; 29 candidates; 29 rendered units; 87 imported and 0 unresolved contracts; gameplay invariants preserved.');

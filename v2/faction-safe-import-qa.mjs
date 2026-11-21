/** Explicit all-format faction admission for the three newly enrolled books.
 * Reuses existing accepted/derived exports; no loadout or identity is invented. */
import fs from 'node:fs';
import assert from 'node:assert/strict';

const read=async url=>({ok:true,json:async()=>JSON.parse(fs.readFileSync(url,'utf8'))});
globalThis.fetch=read;
const fixtures=JSON.parse(fs.readFileSync(new URL('./fixtures/new-recruit-plain-header.json',import.meta.url),'utf8'));
const owner=fs.readFileSync(new URL('./fixtures/'+fixtures.owner.file,import.meta.url),'utf8');
const cases=[
  {bookId:'adeptus-mechanicus',bookName:'Adeptus Mechanicus'},
  {bookId:'death-guard',bookName:'Death Guard'},
  {bookId:'chaos-space-marines',bookName:'Chaos Space Marines'}
];
const results=[];
for(const c of cases){
  const entry=c.bookId==='adeptus-mechanicus'?'roster-runtime':'roster-boot';
  const {createBrowserRoster}=await import(`../books/${c.bookId}/v2/${entry}.mjs`);
  const service=await createBrowserRoster({fetch:read});
  const fixture=fixtures.derived.find(row=>row.bookId===c.bookId);
  const plain=fixture?.plainText||owner,bindings=fixture?.bindings||{};
  const labelled=fixture?.plusText||owner.replace(/^Unnamed list \(950 Points\)\r?\n\r?\nDeath Guard\r?\nContagion Engines and Paragons of Putrescence \(2 Detachment Points\)/,
    '+ FACTION KEYWORD: Chaos - Death Guard\n+ DETACHMENT: Contagion Engines, Paragons of Putrescence');
  assert.match(labelled,/^\+ FACTION KEYWORD:/m,'The accepted fixture supplies its labelled faction');
  const own=[{format:'labelled',text:labelled},{format:'plain',text:plain}];
  for(const source of own){
    const imported=service.import(source.text,bindings,{replaceExisting:true});
    assert.equal(imported.status,'READY',c.bookId+'/'+source.format+': '+JSON.stringify(imported.errors||imported.needsBindings));
    const saved=service.snapshot();
    const foreignName='Xenos - Tyranids';
    const foreign=source.format==='labelled'
      ?source.text.replace(/^\+ FACTION KEYWORD:[^\r\n]*/m,'+ FACTION KEYWORD: '+foreignName)
      :source.text.replace(c.bookName,foreignName);
    assert.notEqual(foreign,source.text,'The control must actually change the faction header');
    const rejected=service.import(foreign,bindings,{replaceExisting:true});
    assert.equal(rejected.status,'INVALID',c.bookId+'/'+source.format+': foreign faction must be rejected');
    assert.equal(rejected.roster,null);
    assert.deepEqual(rejected.errors.map(error=>error.code),['FOREIGN_FACTION_EXPORT']);
    assert.equal(rejected.errors[0].message,`This list is ${foreignName}, but ${c.bookName} is open.`);
    assert.deepEqual(service.snapshot(),saved,'Foreign input must leave the complete saved roster unchanged');
    results.push({book:c.bookId,format:source.format,own:'READY',foreign:'INVALID',savedRosterUnchanged:true});
  }
  const withoutFaction=labelled.replace(/^\+ FACTION KEYWORD:[^\r\n]*\r?\n/m,'');
  assert.notEqual(withoutFaction,labelled);
  const absent=service.import(withoutFaction,bindings,{replaceExisting:true});
  assert.equal(absent.status,'READY',c.bookId+': the existing missing-faction path remains accepted');
  assert.equal(absent.draft.metadata.faction,'—');
  assert.equal(absent.errors.some(error=>error.code==='FOREIGN_FACTION_EXPORT'),false);
  results.push({book:c.bookId,format:'labelled without faction',result:'READY'});
}
console.log(JSON.stringify({status:'PASS',results}));

/** Native New Recruit vocabulary and physical import regressions. */
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createExportFactionCheck} from '../books/shared/roster-v2/export-faction.mjs';
const fixtures=JSON.parse(fs.readFileSync(new URL('./fixtures/new-recruit-export.json',import.meta.url),'utf8'));
const selected=process.argv.find(arg=>arg.startsWith('--book='))?.slice('--book='.length);
assert(!selected||fixtures.factions.some(row=>row.bookId===selected),'Unknown book');
const read=async url=>({ok:true,json:async()=>JSON.parse(fs.readFileSync(url,'utf8'))});
globalThis.fetch=read;
const checks=[];
for(const c of fixtures.factions.filter(row=>!selected||row.bookId===selected)){
  const entry=c.bookId==='adeptus-mechanicus'?'roster-runtime':'roster-boot';
  const {createBrowserRoster}=await import(`../books/${c.bookId}/v2/${entry}.mjs`);
  const runtime=await createBrowserRoster({fetch:read});
  if(c.catalogueEvidence.document){
    const captured=JSON.parse(fs.readFileSync(new URL('../'+c.catalogueEvidence.document,import.meta.url),'utf8'));
    const observed=c.catalogueEvidence.path.slice(1).split('/').reduce((value,key)=>value[key],captured);
    assert.equal(c.catalogue,observed,'Independent captured catalogue identity');
  }else assert.equal(c.catalogueEvidence.authority,'OWNER_PROVIDED_TASK');
  const variants=[...new Set([c.shortLabel,c.catalogue,c.catalogue.replaceAll("'",'’'),...c.legacyLabels,'—','', '///'])];
  for(const faction of variants){
    const text=c.text.replace(/^\+ FACTION KEYWORD:[^\r\n]*/m,'+ FACTION KEYWORD: '+faction);
    const result=runtime.import(text,c.bindings,{replaceExisting:true});
    const accepted=faction!=='///'||c.normalizedEmptyAccepted;
    assert.equal(result.status,accepted?'READY':'INVALID',c.bookId+': '+faction+' '+JSON.stringify(result.errors||result.needsBindings));
    assert.equal(result.errors?.some(error=>error.code==='FOREIGN_FACTION_EXPORT')||false,!accepted);
    checks.push({book:c.bookId,faction,status:'PASS',result:result.status});
  }
  const before=JSON.stringify(runtime.state);
  const result=runtime.import(c.text.replace(/^\+ FACTION KEYWORD:[^\r\n]*/m,'+ FACTION KEYWORD: A Different Army'),c.bindings,{replaceExisting:true});
  assert.equal(result.status,c.factionGate?'INVALID':'READY',c.bookId+': foreign header');
  assert.equal(result.errors?.some(error=>error.code==='FOREIGN_FACTION_EXPORT')||false,c.factionGate);
  if(c.factionGate)assert.equal(JSON.stringify(runtime.state),before,'A foreign export cannot replace the active roster');
  checks.push({book:c.bookId,faction:'A Different Army',status:'PASS',result:result.status});
}
const strict=createExportFactionCheck({factionIdentityLabels:['T’au Empire',"Xenos - T'au Empire"]});
assert(strict('Xenos - T’au Empire'));assert(!strict('Not T’au Empire'));assert(!strict('///'));
assert.throws(()=>createExportFactionCheck({factionIdentityLabels:[]}),/vocabulary/);
assert.throws(()=>createExportFactionCheck({factionIdentityLabels:['T’au Empire'],allowNormalizedEmptyFaction:'yes'}),/vocabulary/);
console.log(JSON.stringify({status:'PASS',checks:checks.length,results:checks}));

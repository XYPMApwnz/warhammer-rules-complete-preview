import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import vm from 'node:vm';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const coreRoot=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const repoRoot=path.resolve(coreRoot,'..','..');
const windowValue=(file,key)=>{const sandbox={window:{}};vm.runInNewContext(fs.readFileSync(file,'utf8'),sandbox,{filename:file});return sandbox.window[key];};

function fixture(){
  const root=fs.mkdtempSync(path.join(os.tmpdir(),'core-reader-propagation-'));
  const stagedCore=path.join(root,'books','core-rules');
  fs.mkdirSync(path.join(stagedCore,'reader'),{recursive:true});
  fs.mkdirSync(path.join(root,'books','shared'),{recursive:true});
  fs.cpSync(path.join(coreRoot,'content'),path.join(stagedCore,'content'),{recursive:true});
  fs.cpSync(path.join(coreRoot,'sources'),path.join(stagedCore,'sources'),{recursive:true});
  fs.cpSync(path.join(coreRoot,'tools'),path.join(stagedCore,'tools'),{recursive:true});
  fs.copyFileSync(path.join(coreRoot,'reader','build.mjs'),path.join(stagedCore,'reader','build.mjs'));
  fs.copyFileSync(path.join(repoRoot,'books','shared','runtime-asset-versions.json'),path.join(root,'books','shared','runtime-asset-versions.json'));
  fs.cpSync(path.join(repoRoot,'books','shared','canonical-content-v2'),path.join(root,'books','shared','canonical-content-v2'),{recursive:true});
  return {root,core:stagedCore,reader:path.join(stagedCore,'reader')};
}

function buildAndRead(mutate){
  const staged=fixture();
  try{
    mutate(staged);
    execFileSync(process.execPath,[path.join(staged.reader,'build.mjs')],{cwd:staged.root,stdio:'pipe'});
    const html=fs.readdirSync(staged.reader).filter(file=>file.endsWith('.html')).map(file=>fs.readFileSync(path.join(staged.reader,file),'utf8')).join('\n');
    const search=fs.readFileSync(path.join(staged.reader,'search-index.json'),'utf8');
    return {html,search};
  }finally{fs.rmSync(staged.root,{recursive:true,force:true});}
}

const mainMarker='SYNTHETIC_READER_MAIN_PROPAGATION';
let oldMain='';
const main=buildAndRead(({core})=>{
  const file=path.join(core,'content','core-rules.digital-11e.json');
  const data=JSON.parse(fs.readFileSync(file,'utf8'));
  const record=data.records.find(record=>record.code==='24.05');
  oldMain=record.text;
  record.text=mainMarker;
  fs.writeFileSync(file,JSON.stringify(data,null,2)+'\n');
});
assert(main.html.includes(mainMarker)&&main.search.includes(mainMarker),'ordinary MAIN_RULE mutation did not reach Reader card/search');
assert(new RegExp(`data-term="core-blast"[^>]*data-term-definition="${mainMarker}"`).test(main.html),'ordinary MAIN_RULE mutation did not reach Reader popup projection');
assert(!main.html.includes(oldMain)&&!main.search.includes(oldMain),'stale ordinary MAIN_RULE survived the effective Reader projection');

const overrideMarker='SYNTHETIC_READER_OVERRIDE_PROPAGATION';
let oldOverride='';
const override=buildAndRead(({core})=>{
  const file=path.join(core,'content','core-rules.current-official.en.json');
  const data=JSON.parse(fs.readFileSync(file,'utf8'));
  const record=data.ruleOverrides.find(record=>record.code==='17.03');
  oldOverride=record.currentLine;
  record.currentLine=overrideMarker;
  fs.writeFileSync(file,JSON.stringify(data,null,2)+'\n');
  const baseFile=path.join(core,'content','core-rules.digital-11e.json');
  const base=JSON.parse(fs.readFileSync(baseFile,'utf8'));
  const baseRecord=base.records.find(record=>record.code==='17.03');
  baseRecord.text=baseRecord.text.replace(oldOverride,overrideMarker);
  fs.writeFileSync(baseFile,JSON.stringify(base,null,2)+'\n');
});
assert(override.html.includes(overrideMarker)&&override.search.includes(overrideMarker),'official override mutation did not reach Reader card/search');
assert(new RegExp(`data-term="core-rule-17-03-shooting-at-engaged-monsters-and-vehicles"[^>]*data-term-definition="[^"]*${overrideMarker}`).test(override.html),'official override mutation did not reach Reader popup projection');
assert(!override.html.includes(oldOverride)&&!override.search.includes(oldOverride),'stale official override survived the effective Reader projection');

const faqMarker='SYNTHETIC_READER_FAQ_PROPAGATION';
let oldFaq='';
const faq=buildAndRead(({core})=>{
  const file=path.join(core,'content','core-rules.source.en.js');
  const source=windowValue(file,'CORE_PDF_SOURCE');
  const answer=source.faqs[0].answer;
  oldFaq=answer;
  const script=fs.readFileSync(file,'utf8');
  assert(script.includes(answer),'FAQ mutation fixture could not locate accepted answer');
  fs.writeFileSync(file,script.replace(answer,faqMarker));
});
assert(faq.html.includes(faqMarker)&&faq.search.includes(faqMarker),'FAQ mutation did not reach Reader card/search');
assert(!faq.html.includes(oldFaq)&&!faq.search.includes(oldFaq),'stale FAQ answer survived the effective Reader projection');

const uruMarker='SYNTHETIC_READER_URU_PROPAGATION';
let oldUru='';
const uru=buildAndRead(({core})=>{
  const file=path.join(core,'content','core-rules.current-official.en.json');
  const data=JSON.parse(fs.readFileSync(file,'utf8'));
  oldUru=data.universalRulesUpdates[0].text;
  data.universalRulesUpdates[0].text=uruMarker;
  fs.writeFileSync(file,JSON.stringify(data,null,2)+'\n');
});
assert(uru.html.includes(uruMarker)&&uru.search.includes(uruMarker),'Universal Rules Update mutation did not reach Reader card/search');
assert(!uru.html.includes(oldUru)&&!uru.search.includes(oldUru),'stale Universal Rules Update survived the effective Reader projection');

console.log('Core Reader propagation QA passed: MAIN_RULE, official override, FAQ and URU mutations reach generated Reader facts without a Glossary tree.');

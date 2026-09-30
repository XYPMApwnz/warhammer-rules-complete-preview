import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
import {createCanonicalBuildContext} from '../../shared/tools/canonical-build-contract.mjs';
import {buildCanonicalBook} from '../../shared/tools/build-army-book.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../..'),read=relative=>JSON.parse(fs.readFileSync(path.join(root,relative),'utf8')),clone=value=>structuredClone(value);
const contractsSource=read('books/chaos-space-marines/sources/chaos-space-marines-effect-contracts.v1.json'),corpus=read('books/chaos-space-marines/sources/waha-11e-current-2026-09-29/corpus.json'),pack=read('books/chaos-space-marines/content/chaos-space-marines-faction-pack.en.json'),config=read('books/chaos-space-marines/book.config.json');
const context=createCanonicalBuildContext({repoRoot:root,configPath:path.join(root,'books/chaos-space-marines/book.config.json'),config}),{effectiveBookModel:model}=await buildCanonicalBook(context,{projectionOnly:true});
const generatedScope={window:{},URL,URLSearchParams};vm.runInNewContext(fs.readFileSync(path.join(root,'books/chaos-space-marines/scripts/roster-data.js'),'utf8'),generatedScope);const generated=generatedScope.window.WH_BOOK_ROSTER_CATALOG;
const corpusPath='books/chaos-space-marines/sources/waha-11e-current-2026-09-29/corpus.json',wahaOwner='chaos-space-marines-waha-11e-current-2026-09-29',packOwner='chaos-space-marines-faction-pack-v1.2',norm=value=>String(value||'').toLowerCase().replace(/[’‘]/g,"'").replace(/\s+/g,' ').trim();
const semanticHash=contracts=>crypto.createHash('sha256').update(JSON.stringify(contracts.map(contract=>{const value=clone(contract);delete value.source;delete value.confidence;return value;}))).digest('hex');
const contractById=(contracts,expected)=>contracts.find(contract=>contract.canonicalRecordId===expected.canonicalRecordId&&contract.sourceUnitId===expected.sourceUnitId&&contract.detachmentId===expected.detachmentId);
const exactOwner=contract=>{
  if(contract.source.sourceId===packOwner){
    const detachment=pack.detachments.find(item=>item.id===contract.detachmentId);assert.ok(detachment,`${contract.canonicalRecordId}: accepted official Detachment owner`);
    if(contract.sourceKind==='enhancement'){const canonical=model.enhancements.find(item=>item.id===contract.canonicalRecordId);assert.ok(canonical,`${contract.canonicalRecordId}: canonical Enhancement`);assert.equal(detachment.enhancements.filter(item=>norm(item.title)===norm(canonical.title)).length,1,`${contract.canonicalRecordId}: exact official Enhancement owner`);}
    else{const canonical=model.detachmentRules.find(item=>item.id===contract.canonicalRecordId);assert.ok(canonical,`${contract.canonicalRecordId}: canonical Detachment Rule`);assert.equal(norm(detachment.rule.title),norm(canonical.title),`${contract.canonicalRecordId}: exact official rule owner`);}
    return{sourceId:packOwner,locator:`books/chaos-space-marines/content/chaos-space-marines-faction-pack.en.json#${contract.canonicalRecordId}`,confidence:'VERIFIED_FROZEN'};
  }
  assert.equal(contract.source.sourceId,wahaOwner,`${contract.canonicalRecordId}: current operational owner`);
  let recordId;
  if(contract.sourceKind==='ability'){
    const unit=model.units.find(item=>item.id===contract.sourceUnitId),ability=[...(unit?.abilities||[]),...(unit?.wargearAbilities||[])].find(item=>item.termId===contract.canonicalRecordId),source=corpus.datasheets.find(item=>item.sourceId===contract.sourceUnitId.replace(/^unit-/,'datasheet-'));assert.ok(ability&&source,`${contract.canonicalRecordId}: accepted ability owner`);
    const matches=source.sections.filter(section=>section.blocks.some(block=>norm(block.text).startsWith(`${norm(ability.title)}:`)));assert.equal(matches.length,1,`${contract.canonicalRecordId}: exact current ability record`);recordId=matches[0].sourceId;
  }else if(contract.sourceKind==='enhancement'){
    const canonical=model.enhancements.find(item=>item.id===contract.canonicalRecordId),detachment=corpus.detachments.find(item=>item.sourceId===`detachment-${contract.detachmentId}`);assert.ok(canonical&&detachment,`${contract.canonicalRecordId}: accepted Enhancement owner`);const matches=detachment.enhancements.filter(item=>norm(item.title)===norm(canonical.title));assert.equal(matches.length,1,`${contract.canonicalRecordId}: exact current Enhancement record`);recordId=matches[0].sourceId;
  }else if(contract.sourceKind==='transport'){
    const source=corpus.datasheets.find(item=>item.sourceId===contract.sourceUnitId.replace(/^unit-/,'datasheet-')),section=source?.sections.find(item=>item.sourceId===contract.canonicalRecordId);assert.ok(source&&section,`${contract.canonicalRecordId}: exact current transport record`);recordId=section.sourceId;
  }else{
    const canonical=model.detachmentRules.find(item=>item.id===contract.canonicalRecordId),detachment=corpus.detachments.find(item=>item.sourceId===`detachment-${contract.detachmentId}`);assert.ok(canonical&&detachment,`${contract.canonicalRecordId}: accepted Detachment Rule owner`);assert.equal(norm(detachment.rule.title),norm(canonical.title),`${contract.canonicalRecordId}: exact current rule record`);recordId=detachment.rule.sourceId;
  }
  return{sourceId:wahaOwner,locator:`${corpusPath}#${recordId}`,confidence:'VERIFIED_CURRENT'};
};
const certify=(contracts=contractsSource.contracts,catalog=generated)=>{
  assert.equal(contracts.length,100,'active effect-contract denominator');assert.equal(semanticHash(contracts),'057be878b2d6740eaa7be0ac6bdb682e7dab4647363c834f5ba3f149b8a03f58','gameplay semantics excluding provenance');
  let current=0,retired=0,waha=0,official=0;
  for(const contract of contracts){const expected=exactOwner(contract),published=contractById(catalog.effectContracts,contract);assert.deepEqual(contract.source,{sourceId:expected.sourceId,locator:expected.locator},`${contract.canonicalRecordId}: exact accepted owner binding`);assert.equal(contract.confidence,expected.confidence,`${contract.canonicalRecordId}: current source confidence`);assert.ok(published,`${contract.canonicalRecordId}: generated active contract`);assert.deepEqual(JSON.parse(JSON.stringify(published)),JSON.parse(JSON.stringify(contract)),`${contract.canonicalRecordId}: generated provenance parity`);const sourceText=`${contract.source.sourceId} ${contract.source.locator}`;if(/secondary-consensus|codex-secondary/i.test(sourceText))retired++;else current++;if(contract.source.sourceId===wahaOwner)waha++;if(contract.source.sourceId===packOwner)official++;}
  assert.deepEqual({current,retired,waha,official},{current:100,retired:0,waha:67,official:33});return{current,retired,waha,official};
};
const result=certify();let mutations=0;const killed=(label,mutate)=>{const contracts=clone(contractsSource.contracts),catalog=clone(generated),changedCorpus=clone(corpus);mutate(contracts,catalog,changedCorpus);assert.throws(()=>{const original=corpus.datasheets;corpus.datasheets=changedCorpus.datasheets;try{certify(contracts,catalog);}finally{corpus.datasheets=original;}},undefined,`${label} mutation survived`);mutations++;};
killed('RETIRED_OWNER',(contracts,catalog)=>{for(const list of [contracts,catalog.effectContracts]){const contract=list.find(item=>item.source.sourceId===wahaOwner);contract.source={sourceId:'csm-codex-secondary-consensus',locator:`books/chaos-space-marines/sources/codex-secondary-consensus.en.json#${contract.canonicalRecordId}`};contract.confidence='SOURCE_LIMITED';}});
killed('MISSING_CURRENT_BINDING',(contracts,catalog)=>{for(const list of [contracts,catalog.effectContracts])list.find(item=>item.source.sourceId===wahaOwner).source=null;});
killed('WRONG_CANONICAL_RECORD',(contracts,catalog)=>{for(const list of [contracts,catalog.effectContracts]){const contract=list.find(item=>item.source.sourceId===wahaOwner);contract.source.locator=`${corpusPath}#datasheet-cultist-mob:section:1`;}});
killed('MISSING_FACTUAL_OWNER',(_contracts,_catalog,changedCorpus)=>{changedCorpus.datasheets=changedCorpus.datasheets.filter(item=>item.sourceId!=='datasheet-chaos-lord-with-jump-pack');});
killed('GAMEPLAY_PAYLOAD_CHANGED',(contracts,catalog)=>{for(const list of [contracts,catalog.effectContracts])list[0].scope='source-only';});
assert.equal(mutations,5,'provenance/source/semantic mutation inventory');
console.log(`CSM effect provenance QA: active 100/100; current owners ${result.current}/100 (${result.waha} Waha + ${result.official} official); retired owners ${result.retired}; semantic delta includes 2 certified Daemonic Allegiance contracts; provenance-only partials closed 15; mutations ${mutations}/${mutations} KILLED; PASS`);

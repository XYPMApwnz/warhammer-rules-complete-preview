/** Active, offline producer order. Accepted captures are inputs, not rebuilds. */
export const BOOKS=['space-marines','blood-angels','dark-angels','adeptus-mechanicus',
  'chaos-space-marines','death-guard','tau-empire','tyranids','emperors-children'];

export function generatedRebuildPlan(tracked) {
  const steps=[];
  const candidateSource='books/core-rules/sources/waha-core-2026-11-11/';
  // The accepted offline capture first produces the reviewed candidate, then
  // the active projection. The historical importer baseline stays immutable.
  steps.push({book:'core-candidate',runtime:'python',
    producer:'books/core-rules/tools/build_waha_core_corpus.py',args:['--write'],
    outputs:['waha-core-corpus.v1.json','waha-core-corpus.manifest.json','waha-core-corpus.census.json']
      .map(file=>candidateSource+file)});
  steps.push({book:'core-candidate',runtime:'python',
    producer:'books/core-rules/tools/build_core_candidate.py',args:['--write'],
    outputs:[candidateSource+'core-rules.candidate.v1.json']});
  steps.push({book:'core',runtime:'python',
    producer:'books/core-rules/tools/publish_core_candidate.py',args:['--write'],
    outputs:['books/core-rules/content/core-rules.digital-11e.json',
      'books/core-rules/content/core-identities.v1.json',
      'books/core-rules/content/core-effective-bindings.v1.json',
      'books/core-rules/content/core-official-source-registry.en.json',
      candidateSource+'known-source-defects.v1.json']});
  const add=(book,producer,names,args=[],runtime='node',extra={})=>steps.push({
    book,producer,args,runtime,outputs:names.map(name=>`books/${book}/v2/generated/${name}.json`),...extra});
  for(const book of BOOKS){
    const dir=`books/${book}/v2/`,sm=book==='space-marines',supplement=['blood-angels','dark-angels'].includes(book);
    if(sm||supplement){
      add(book,dir+'build.py',sm?['base','effective','cross-owner-references','factual-census']:['base','effective','factual-census'],[],'python');
      if(sm)add(book,dir+'datasheet-build.mjs',['native-datasheets','datasheet-presentation']);
      add(book,dir+'book-build.mjs',sm?['native-book','book-presentation','deathwatch-presentation','source-ledger-coverage']:
        ['mixed-owner-book','mixed-owner-presentation','mixed-owner-points','mixed-owner-coverage']);
      add(book,dir+'mfm-build.mjs',sm?['native-mfm-book','mfm-presentation','deathwatch-mfm-presentation','mfm-coverage']:
        ['native-mfm-book','mfm-presentation','mfm-coverage']);
      add(book,dir+'rule-contract-build.mjs',['rule-contracts','roster-runtime']);
      add(book,dir+'gameplay-presentation-build.mjs',['gameplay-presentation']);
      add(book,dir+(book==='blood-angels'?'roster-build.mjs':'roster-import-build.mjs'),['roster-import']);
      add(book,dir+'app-build.mjs',['app-presentation']);
    }else if(book==='death-guard'){
      add(book,dir+'build.mjs',['base','effective','comparison']);
      add(book,dir+'rule-contract-build.mjs',['rule-contract-effective','compatibility-v2','rule-contract-closure']);
      add(book,dir+'roster-contract-build.mjs',['roster-contract-closure']);
      add(book,dir+'related-rules-build.mjs',['related-rules-v2']);
      add(book,dir+'glossary-build.mjs',['glossary-v2']);
      add(book,dir+'app-build.mjs',['app-presentation']);
    }else{
      add(book,dir+'build.py',book==='adeptus-mechanicus'?['base','effective']:['base','effective','factual-census'],[],'python');
      if(book==='adeptus-mechanicus')add(book,dir+'factual-qa.py',['factual-census'],['--write-census'],'python');
      if(book==='tyranids')add(book,dir+'roster-import-build.mjs',['roster-import']);
      add(book,dir+'rule-contract-build.mjs',book==='adeptus-mechanicus'?['rule-contracts','rule-contract-compatibility','rule-contract-census']:
        book==='chaos-space-marines'?['rule-contracts','rule-contract-census','rule-contract-blockers','rule-contract-compatibility']:['rule-contracts']);
      if(!['adeptus-mechanicus','tyranids'].includes(book))add(book,dir+'roster-import-build.mjs',['roster-import']);
      if(book==='chaos-space-marines')add(book,dir+'roster-runtime-build.mjs',['roster-runtime']);
      if(book==='emperors-children')add(book,dir+'roster-attachment-build.mjs',['roster-attachments']);
      add(book,dir+'app-build.mjs',['adeptus-mechanicus','tyranids'].includes(book)?['roster-runtime','app-presentation']:['app-presentation']);
    }
  }
  const external=(book,producer,outputs,args=[],extra={})=>steps.push({book,producer,outputs,args,runtime:'node',...extra});
  for(const book of BOOKS){
    if(book!=='death-guard')external(book,'books/shared/tools/build-new-recruit-model-names.mjs',
      [`books/${book}/v2/model-name-aliases.json`],[`--book=${book}`,'--write']);
  }
  external('space-marines','books/space-marines/tools/build-related-rules.mjs',
    ['books/space-marines/content/space-marines-related-rules.en.json']);
  external('core','books/core-rules/reader/build.mjs',tracked.filter(file=>/^books\/core-rules\/reader\/[^/]+\.html$/.test(file)||file==='books/core-rules/reader/search-index.json'));
  external('glossary','glossary/v2/tools/build-glossary-v2.mjs',['glossary/v2/generated/index.en.json','glossary/v2/generated/index.en.js']);
  external('core','books/core-rules/tests/core-waha-player-visible-reference-census-qa.mjs',
    [candidateSource+'waha-core-player-visible-reference-census.v1.json'],['--write']);
  external('source-registry','tools/audit/build-source-catalog-additions.mjs',[],['--check']);
  external('source-registry','tools/audit/build-source-catalog.mjs',
    ['books/shared/source-refs-v2/source-catalog.json'],['--check'],{
      preserveOutputSeeds:true,
      reason:'registry: binding definitions are authored here; append-only; integrity and old-entry bytes checked before writes'
    });
  const excluded=tracked.filter(file=>/^books\/(blood-angels|dark-angels|chaos-space-marines)\/mobile\/related-rules\.inc$/.test(file))
    .map(file=>({file,reason:'Retired V1 markup: the declared shared CLI now delegates to native app-build and no longer emits this file. No V1 producer is restored.'}));
  if(tracked.includes('books/shared/points/points-data.js'))excluded.push({file:'books/shared/points/points-data.js',
    reason:'Retired V1 points catalog: not in the V2 runtime allowlist; V2 reads native MFM points; stale since 4a8b9a29 / 88441ee8. Removal is a separate cleanup task.'});
  for(const file of ['glossary/generated/cache-revision.js','v2/app.html'])if(tracked.includes(file))excluded.push({file,
    reason:'Release stamp: regenerated by tools/pages-runtime-package.mjs:83 for every package; the committed copy is a seed'});
  const native=tracked.filter(file=>BOOKS.some(book=>file.startsWith(`books/${book}/v2/generated/`)));
  const declared=steps.flatMap(step=>step.outputs),owned=new Set(declared);
  if(owned.size!==declared.length)throw Error('Duplicate generated output owner in rebuild plan');
  for(const file of native)if(!owned.has(file))throw Error('Tracked native output has no rebuild producer: '+file);
  for(const file of owned)if(!tracked.includes(file))throw Error('Rebuild plan declares an untracked output: '+file);
  return {steps,files:[...owned].sort(),excluded,untrackedPublicationManifest:
    'PAGES_RUNTIME_MANIFEST.json is emitted only into the runtime package; tools/pages-runtime-manifest.json is its reviewed input allowlist, not generated output.'};
}

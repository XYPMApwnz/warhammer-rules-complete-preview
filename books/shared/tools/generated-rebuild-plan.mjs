/** Active, offline producer order. Accepted captures are inputs, not rebuilds. */
export const BOOKS=['space-marines','blood-angels','dark-angels','adeptus-mechanicus',
  'chaos-space-marines','death-guard','tau-empire','tyranids','emperors-children'];

export function generatedRebuildPlan(tracked) {
  const steps=[];
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
    const compatible=`books/${book}/generated/compatible-rules.json`;
    if(tracked.includes(compatible))external(book,`books/${book}/tools/build-compatible-rules.mjs`,[compatible]);
  }
  external('space-marines','books/space-marines/tools/build-related-rules.mjs',
    ['books/space-marines/content/space-marines-related-rules.en.json']);
  external('core','books/core-rules/reader/build.mjs',tracked.filter(file=>/^books\/core-rules\/reader\/[^/]+\.html$/.test(file)||file==='books/core-rules/reader/search-index.json'));
  external('points','books/shared/points/build.mjs',['books/shared/points/points-data.js']);
  external('glossary','glossary/v2/tools/build-glossary-v2.mjs',['glossary/v2/generated/index.en.json','glossary/v2/generated/index.en.js']);
  external('publication','tools/cache-revision.mjs',['glossary/generated/cache-revision.js','v2/app.html'],['--write'],{preserveOutputSeeds:true});
  const excluded=tracked.filter(file=>/^books\/(blood-angels|dark-angels|chaos-space-marines)\/mobile\/related-rules\.inc$/.test(file))
    .map(file=>({file,reason:'Retired V1 markup: the declared shared CLI now delegates to native app-build and no longer emits this file. No V1 producer is restored.'}));
  const native=tracked.filter(file=>BOOKS.some(book=>file.startsWith(`books/${book}/v2/generated/`)));
  const declared=steps.flatMap(step=>step.outputs),owned=new Set(declared);
  if(owned.size!==declared.length)throw Error('Duplicate generated output owner in rebuild plan');
  for(const file of native)if(!owned.has(file))throw Error('Tracked native output has no rebuild producer: '+file);
  for(const file of owned)if(!tracked.includes(file))throw Error('Rebuild plan declares an untracked output: '+file);
  return {steps,files:[...owned].sort(),excluded,untrackedPublicationManifest:
    'PAGES_RUNTIME_MANIFEST.json is emitted only into the runtime package; tools/pages-runtime-manifest.json is its reviewed input allowlist, not generated output.'};
}

/** Accepted glossary transitions are checked on their own immutable Git trees. */
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';

export const GLOSSARY_OWNER_TRANSITIONS=Object.freeze({
  sevenToEight:Object.freeze({baseline:'c21b5881a8d38be02cf56fe0428ce8841a7cba76',accepted:'76bfe6f0c956b46bced515d3ec1e0cc4bfff19ed'}),
  sixToSeven:Object.freeze({baseline:'3e0c219f1210284a912faba71d46f3afa9710cea',accepted:'a5aa3a5273aa11fa63814b7a90338aedd83fe82b'}),
  fiveToSix:Object.freeze({baseline:'f5e3ebc5ff5d57674e842f47656a59c39c0c58f0',accepted:'9a9721247b16ac6fccc167fe2676023e0680fefe'})
});
const historicalFiles=new Set(['glossary/v2/generated/index.en.json','books/shared/army-book-app-v2/global-glossary-content.mjs']);
const historicalCommits=new Set(Object.values(GLOSSARY_OWNER_TRANSITIONS).flatMap(value=>[value.baseline,value.accepted]));

// The optional byte transform is for negative controls. It cannot bypass the
// Git object check: even a valid JSON change fails before the bytes are used.
export function createGlossaryOwnerHistory({repoRoot,transformBytes}={}){
  assert.equal(typeof repoRoot,'string','Historical glossary repository is required');
  const git=(args,options={})=>execFileSync('git',args,{cwd:repoRoot,maxBuffer:100*1024*1024,...options});
  const checked=new Set();
  function read(commit,file){
    assert(historicalCommits.has(commit)&&/^[a-f0-9]{40}$/.test(commit),'Unpinned historical glossary commit');
    assert(historicalFiles.has(file),'Unpinned historical glossary file');
    if(!checked.has(commit)){
      assert.equal(git(['rev-parse','--verify',commit+'^{commit}'],{encoding:'utf8'}).trim(),commit,'Historical glossary commit changed');
      checked.add(commit);
    }
    const accepted=git(['show',commit+':'+file]);
    const bytes=transformBytes?Buffer.from(transformBytes({commit,file,bytes:Buffer.from(accepted)})):accepted;
    const expectedObject=git(['rev-parse','--verify',commit+':'+file],{encoding:'utf8'}).trim();
    assert.equal(git(['hash-object','--stdin'],{input:bytes,encoding:'utf8'}).trim(),expectedObject,'Historical glossary bytes changed '+commit+':'+file);
    return bytes;
  }
  return {read,readJSON:(commit,file)=>JSON.parse(read(commit,file).toString('utf8'))};
}

/** Current Core facts come from the current catalog, never an older glossary. */
export function assertCurrentCoreOwnerParity(publication,coreCatalog){
  const aliasOnly=new Set(['core-errata-15-05','core-errata-15-06']);
  const records=coreCatalog.records.filter(record=>['FULL_CONTENT','SOURCE_CONFLICT'].includes(record.state)&&!aliasOnly.has(record.id));
  const articles=publication.entries.filter(article=>article.domain==='CORE');
  const current=new Map(articles.map(article=>[article.id,article]));
  assert.equal(current.size,articles.length,'Duplicate current Core owner');
  assert.deepEqual(new Set(current.keys()),new Set(records.map(record=>'core::'+record.id)),'Current Core canonical inventory changed');
  for(const record of records){
    const article=current.get('core::'+record.id),facts=structuredClone(record);
    for(const field of ['publicationRecord','compatibilityIdentity','referenceUrl','runtimeTitle'])delete facts[field];
    const expected={label:record.title,facts,provenance:record.provenance,
      // The Core projection has no separate top-level field-provenance owner.
      // Any canonical field provenance remains inside the complete facts above.
      fieldProvenance:undefined,sourceOwner:{domain:'CORE',canonicalId:record.id,interface:'createEffectiveCoreCatalog()'},
      currentness:{asOf:coreCatalog.asOf,state:record.state}};
    for(const field of ['label','facts','provenance','fieldProvenance','sourceOwner','currentness'])
      assert.deepEqual(article[field],expected[field],'Current Core canonical fact changed '+record.id+'/'+field);
  }
  return records.length;
}

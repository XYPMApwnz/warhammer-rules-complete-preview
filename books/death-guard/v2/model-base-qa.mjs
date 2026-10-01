import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {buildFactualV2} from './build.mjs';
import {normalizeDeathGuardCorpus} from './normalize.mjs';

const repository=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../..');
const corpusPath='books/death-guard/sources/waha-11e-current-2026-09-25/corpus.json';
const rawDirectory='books/death-guard/v2/sources/accepted-waha-pages';
const sha=value=>createHash('sha256').update(value).digest('hex').toUpperCase();
const decode=value=>value.replace(/&#x([0-9a-f]+);/gi,(_,code)=>String.fromCodePoint(parseInt(code,16))).replace(/&#([0-9]+);/g,(_,code)=>String.fromCodePoint(Number(code))).replace(/&(nbsp|amp|quot|apos|lt|gt);/g,(_,name)=>({nbsp:' ',amp:'&',quot:'"',apos:"'",lt:'<',gt:'>'})[name]);

// Independent HTML tag walk; denominator comes from every integrity-pinned raw page,
// not from the corpus statline, normalizer output, QA counts or display titles.
function physicalBaseNodes(html){
  const nodes=[],stack=[],tags=/<\/?([a-z][a-z0-9]*)\b[^>]*>/gi;let match;
  while((match=tags.exec(html))){
    const closing=match[0][1]==='/',tag=match[1].toLowerCase();
    if(closing){
      const index=stack.findLastIndex(frame=>frame.tag===tag);if(index<0)continue;
      const frame=stack[index];stack.length=index;
      if(frame.classToken)nodes.push({...frame,text:decode(html.slice(frame.contentStart,match.index).replace(/<[^>]*>/g,'')).trim()});
      continue;
    }
    const classes=match[0].match(/\bclass\s*=\s*["']([^"']*)["']/i)?.[1]?.split(/\s+/)||[];
    const tokens=classes.filter(token=>/^dsModelBase\d*$/.test(token));
    assert.ok(tokens.length<=1,'Raw Base node must have one physical fact class');
    const frame={tag,offset:match.index,contentStart:tags.lastIndex,classToken:tokens[0]};
    if(!/^(?:area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)$/.test(tag)&&!match[0].endsWith('/>'))stack.push(frame);
  }
  assert.equal(stack.filter(frame=>frame.classToken).length,0,'Accepted Base element is unclosed');
  return nodes.sort((a,b)=>a.offset-b.offset);
}

export function enumerateBaseSourceRecords(){
  const corpus=JSON.parse(fs.readFileSync(path.join(repository,corpusPath),'utf8'));
  const expected=[],sourceUnits=new Map(corpus.datasheets.map(unit=>[unit.url,unit]));
  assert.equal(sourceUnits.size,corpus.datasheets.length,'Accepted datasheet source identities are unique');
  for(const page of corpus.pages){
    const sourcePath=rawDirectory+'/'+page.file,bytes=fs.readFileSync(path.join(repository,sourcePath));
    assert.equal(sha(bytes),page.sha256.toUpperCase(),page.file+': accepted raw byte identity');
    const html=bytes.toString('utf8'),nodes=physicalBaseNodes(html),unit=sourceUnits.get(page.url);
    if(nodes.length)assert.ok(unit,page.file+': Base source has no explicit datasheet source owner');
    // Multiple source profile owners require explicit source-profile identity; never flatten.
    assert.ok(nodes.length<=1,page.file+': multiple Base owners need explicit profile mapping');
    for(const [index,node] of nodes.entries()){
      assert.ok(node.text,page.file+': empty source Base is unresolved');
      const id=unit.sourceId+':model-base:default';
      expected.push({sourceEntityId:id,canonicalEntityId:id,profileId:unit.sourceId+':profile:default',unitId:unit.sourceId.replace(/^datasheet-/,'unit-'),value:node.text,provenance:{sourceId:'dg-waha-2026-09-25',sourceRecordId:id,sourcePath,sha256:page.sha256.toUpperCase(),rawLocator:{classToken:node.classToken,occurrence:index+1},pointer:'raw:'+page.file+':character-offset:'+node.offset},line:html.slice(0,node.offset).split('\n').length});
    }
  }
  assert.equal(new Set(expected.map(record=>record.canonicalEntityId)).size,expected.length,'Source Base identities must remain distinct');
  return expected;
}

export function assertModelBaseFacts(model,expected){
  const bases=model.entities.filter(entity=>entity.kind==='MODEL_BASE'),wanted=new Map(expected.map(record=>[record.canonicalEntityId,record]));
  assert.deepEqual(bases.map(entity=>entity.id).sort(),[...wanted.keys()].sort(),'Every source-backed Base must exist exactly once, with no unsourced Base');
  const all=new Map(model.entities.map(entity=>[entity.id,entity]));
  assert.equal(all.size,model.entities.length,'Canonical identities remain unique');
  for(const entity of bases){
    const record=wanted.get(entity.id);
    assert.deepEqual(entity.data,{text:record.value,scope:'MODEL'},entity.id+': exact source notation/model scope');
    assert.equal(entity.parentId,record.profileId,entity.id+': correct physical profile owner');
    const profile=all.get(entity.parentId);
    assert.equal(profile?.kind,'PROFILE',entity.id+': Base owner is a profile');
    assert.equal(profile.parentId,record.unitId,entity.id+': profile retains its datasheet owner');
    for(const key of ['sourceId','sourceRecordId','sourcePath','sha256','pointer'])assert.equal(entity.provenance?.[key],record.provenance[key],entity.id+': source provenance '+key);
    assert.deepEqual(entity.provenance.rawLocator,record.provenance.rawLocator,entity.id+': exact raw source locator');
  }
  for(const entity of model.entities.filter(entity=>entity.kind!=='MODEL_BASE')){
    assert.ok(!Object.keys(entity.data).some(key=>/^(?:Base|baseSize|base_size|modelBase|modelBaseSize)$/i.test(key)),entity.id+': model Base must not leak into unit/weapon/combat fields');
  }
  return bases.length;
}

export function assertOtherFactsUnchanged(base,effective,baselineHead){
  assert.match(baselineHead,/^[a-f0-9]{40}$/i,'Repair baseline must be an explicit full commit identity');
  const frozen=name=>JSON.parse(execFileSync('git',['show',baselineHead+':books/death-guard/v2/generated/'+name+'.json'],{cwd:repository,encoding:'utf8',maxBuffer:12*1024*1024}));
  for(const [name,model]of Object.entries({base,effective})){
    const withoutBases=structuredClone(model);withoutBases.entities=withoutBases.entities.filter(entity=>entity.kind!=='MODEL_BASE');
    assert.deepEqual(withoutBases,frozen(name),name+': every non-Base factual value, identity, provenance, MFM relation and source state remains unchanged');
  }
}

// Synthetic source shapes exercise owner/scope behavior; they are not accepted census records.
export function runSyntheticBaseControls(){
  const corpus={schema:'wh40k-waha-death-guard-corpus/v1',datasheets:[],pages:[],armyRules:[],detachments:[],errata:[]},rawPages={};
  for(const [index,sourceText] of ['(&#8960;40mm)','(&#8960;Use model)',null,'32mm'].entries()){
    const sourceId='datasheet-synthetic-model-'+index,file='synthetic-'+index+'.html',url='https://qa.invalid/'+index;
    const raw=Buffer.from('<div class="dsOuterFrame"><div class="dsH2Header">Synthetic model</div>'+(sourceText===null?'':'<span class="dsModelBase2 ShowBaseSize">'+sourceText+'</span>')+'<div class="ds2colKWFlat"></div></div>');
    corpus.datasheets.push({sourceId,url,title:'Identical title',statline:{M:'6"',T:'4',SV:'3+',W:'2',LD:'6+',OC:'1'},weapons:[],wargearOptions:[],sections:[],ruleReferences:[]});
    corpus.pages.push({file,url,sha256:sha(raw)});rawPages[file]=raw;
  }
  const normalized=normalizeDeathGuardCorpus(corpus,{rawPages}),bases=normalized.entities.filter(entity=>entity.kind==='MODEL_BASE');
  assert.equal(bases.length,3,'Only synthetic source owners carrying a Base receive one');
  const expectedValues=['(⌀40mm)','(⌀Use model)',null,'32mm'];
  for(const [index,value]of expectedValues.entries()){
    const id='datasheet-synthetic-model-'+index,record=bases.find(entity=>entity.id===id+':model-base:default');
    if(value===null){assert.equal(record,undefined,'Source without Base gains none');continue;}
    assert.deepEqual(record.data,{text:value,scope:'MODEL'},'Exact synthetic diameter/ordinary-mm/Use-model notation');
    assert.equal(record.parentId,id+':profile:default','Distinct physical model profile is preserved');
    const profile=normalized.entities.find(entity=>entity.id===record.parentId);
    assert.equal(profile.parentId,'unit-synthetic-model-'+index,'Identical titles cannot merge physical profile owners');
  }
  const changeSource=(replacement,expectedError)=>{
    const changed=structuredClone(corpus),captures={...rawPages};
    captures['synthetic-0.html']=Buffer.from(rawPages['synthetic-0.html'].toString('utf8').replace('<span class="dsModelBase2 ShowBaseSize">(&#8960;40mm)</span>',replacement));
    changed.pages[0].sha256=sha(captures['synthetic-0.html']);
    assert.throws(()=>normalizeDeathGuardCorpus(changed,{rawPages:captures}),expectedError,'Ambiguous source may not flatten model-profile identity');
  };
  changeSource('<span class="dsModelBase2">(&#8960;40mm)</span><span class="dsModelBase2">(&#8960;60mm)</span>',/Ambiguous accepted model-base profile ownership/);
  changeSource('<span class="dsModelBase2"></span>',/Empty accepted model-base fact/);
  const wrongHash=structuredClone(corpus);wrongHash.pages[0].sha256='0'.repeat(64);
  assert.throws(()=>normalizeDeathGuardCorpus(wrongHash,{rawPages}),/does not match pinned source/,'Unaccepted raw bytes cannot supply Base facts');
  return ['NO_SOURCE_BASE','DISTINCT_MODEL_PROFILE_OWNERS','MODEL_SCOPE','DIAMETER_AND_ORDINARY_MM_NOTATION','USE_MODEL_DISTINCT','AMBIGUOUS_MULTIPROFILE_FAIL_CLOSED','EMPTY_SOURCE_FAIL_CLOSED','RAW_INTEGRITY_FAIL_CLOSED'];
}

export function runModelBaseQa(){
  const syntheticControls=runSyntheticBaseControls();
  const expected=enumerateBaseSourceRecords(),{base,effective}=buildFactualV2();
  const canonical=assertModelBaseFacts(base,expected),projected=assertModelBaseFacts(effective,expected);
  const baselineHead=process.argv.find(arg=>arg.startsWith('--baseline='))?.slice('--baseline='.length);
  if(baselineHead)assertOtherFactsUnchanged(base,effective,baselineHead);
  const numeric=expected.find(record=>/\d+mm/.test(record.value)),useModel=expected.find(record=>/Use model/.test(record.value));
  assert.ok(numeric&&useModel,'Accepted corpus supplies both numeric and Use model semantic controls');
  const guards=[];
  const mutation=(name,mutate,pattern)=>{
    const changed=structuredClone(effective);mutate(changed);
    assert.throws(()=>assertModelBaseFacts(changed,expected),pattern,name+': permanent guard must reject mutation');guards.push(name);
  };
  mutation('SOURCE_BASE_REMOVED',model=>{model.entities=model.entities.filter(entity=>entity.id!==numeric.canonicalEntityId);},/Every source-backed Base/);
  mutation('WRONG_CANONICAL_IDENTITY',model=>{model.entities.find(entity=>entity.id===numeric.canonicalEntityId).id+=':wrong';},/Every source-backed Base/);
  mutation('WRONG_PROFILE_PARENT',model=>{model.entities.find(entity=>entity.id===numeric.canonicalEntityId).parentId=useModel.profileId;},/correct physical profile owner/);
  mutation('NUMERIC_TO_USE_MODEL',model=>{model.entities.find(entity=>entity.id===numeric.canonicalEntityId).data.text=useModel.value;},/exact source notation/);
  mutation('USE_MODEL_TO_NUMERIC',model=>{model.entities.find(entity=>entity.id===useModel.canonicalEntityId).data.text=numeric.value;},/exact source notation/);
  mutation('UNSOURCED_BASE_ADDED',model=>{model.entities.push({...structuredClone(model.entities.find(entity=>entity.kind==='MODEL_BASE')),id:'army-rule-nurgles-gift:model-base:unsourced'});},/Every source-backed Base/);
  mutation('SOURCE_PROVENANCE_CHANGED',model=>{model.entities.find(entity=>entity.id===numeric.canonicalEntityId).provenance.sha256='0'.repeat(64);},/source provenance sha256/);
  mutation('RAW_LOCATOR_CHANGED',model=>{model.entities.find(entity=>entity.id===numeric.canonicalEntityId).provenance.rawLocator.occurrence=2;},/exact raw source locator/);
  mutation('MODEL_SCOPE_TO_UNIT',model=>{model.entities.find(entity=>entity.id===numeric.canonicalEntityId).data.scope='UNIT';},/exact source notation/);
  mutation('BASE_LEAKED_INTO_COMBAT_STATLINE',model=>{model.entities.find(entity=>entity.id===numeric.profileId).data.Base=numeric.value;},/must not leak/);
  const result={status:'PASS',baseSourceRecords:expected.length,baseSourceRecordsAccounted:expected.length,canonicalRecords:canonical,effectiveRecords:projected,correct:expected.length,incorrect:0,unresolved:0,useModelRecords:expected.filter(record=>/Use model/.test(record.value)).length,numericRecords:expected.filter(record=>/\d+mm/.test(record.value)).length,...(baselineHead?{otherV2FactDelta:0,baselineHead}:{}),mutations:guards.length,mutationControls:guards,syntheticControls};
  if(process.argv.includes('--census'))result.sourceCensus=expected;
  console.log(JSON.stringify(result));return result;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))runModelBaseQa();

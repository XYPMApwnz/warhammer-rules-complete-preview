/** Independent, inactive Core candidate review. Never writes production inputs. */
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync,spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {createEffectiveCoreCatalog} from '../../books/core-rules/content/effective-core-catalog.mjs';
import {createQaTempDir,cleanupQaTempDir} from '../../tests/helpers/qa-temp.mjs';

const root=fileURLToPath(new URL('../../',import.meta.url));
const baselineHead='7b15dc36425ac577b6928837ec9983409972e278';
const argv=process.argv.slice(2),mode=argv.shift();
assert(['--write','--check'].includes(mode),'Use --write or --check');
const option=name=>argv.find(arg=>arg.startsWith(name+'='))?.slice(name.length+1);
for(const arg of argv)assert(['--candidate=','--python=','--json=','--markdown=','--raw-root='].some(prefix=>arg.startsWith(prefix)),'Unknown option: '+arg);
const candidateFile=option('--candidate')||'books/core-rules/sources/waha-core-2026-11-11/core-rules.candidate.v1.json';
const jsonFile=option('--json')||'docs/audit/core-importer-a-v1.json';
const markdownFile=option('--markdown')||'docs/audit/core-importer-a-v1.md';
const read=file=>fs.readFileSync(path.resolve(root,file));
const sha=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
const compare=(a,b)=>a<b?-1:a>b?1:0;
const norm=value=>String(value??'').normalize('NFKC').replace(/[‘’]/g,"'").replace(/[“”]/g,'"').replace(/[–—−]/g,'-').replace(/\be\.g\./gi,'for example').replace(/^\s*[•▪●]\s*/gm,'').replace(/\s+/g,' ').trim();
const tokens=value=>norm(value).toLowerCase().match(/\d+(?:\.\d+)*(?:\+|")?|[a-z]+(?:'[a-z]+)?|[+\-/]/g)||[];
const key=value=>tokens(value).join('\u0001');
const contains=(hay,needle)=>!key(needle)||('\u0001'+key(hay)+'\u0001').includes('\u0001'+key(needle)+'\u0001');
const segmenter=new Intl.Segmenter('en',{granularity:'sentence'});
const sentences=text=>String(text??'').split(/\n+/).map(line=>line.replace(/^\s*[•▪●]\s*/,'').trim()).filter(Boolean)
 .flatMap(line=>[...segmenter.segment(line)].map(row=>row.segment.trim()).filter(Boolean));
const text=record=>String(record?.semanticContent??record?.text??record?.answer??'');
const section=record=>String(record?.code||'').split('.')[0];
const sourceUnits=corpus=>new Map(corpus.pages.flatMap(page=>['numbered','faqs','errata','universalRulesUpdates'].flatMap(kind=>page[kind]||[])).map(unit=>[unit.id,unit]));
const unitText=unit=>[unit?.content?.text,...(unit?.occurrences||[]).map(occurrence=>occurrence.content?.text)].filter(Boolean).join('\n');

// The active Core is the immutable comparison baseline, never a candidate input.
execFileSync('git',['diff','--exit-code',baselineHead,'--','books/core-rules/content','books/core-rules/sources/waha-core-2026-09-25'],{cwd:root,stdio:'pipe'});
const baseline=createEffectiveCoreCatalog(),oldById=new Map(baseline.records.map(record=>[record.id,record]));
assert.equal(oldById.size,371,'The active baseline must remain the reviewed371 identities');
const candidateBytes=read(candidateFile),candidate=JSON.parse(candidateBytes);
assert.equal(candidate.schema,'core-rules-candidate/v1');
assert.equal(candidate.status,'CANDIDATE_ONLY_NOT_ACTIVE');
assert.equal(candidate.baselineHead,baselineHead);
assert(Array.isArray(candidate.records));
const newById=new Map(candidate.records.map(record=>[record.id,record]));
assert.equal(newById.size,candidate.records.length,'Duplicate candidate canonical identity');
const corpusFile=path.join(path.dirname(candidateFile),'waha-core-corpus.v1.json');
const corpus=JSON.parse(read(corpusFile)),newSources=sourceUnits(corpus);
assert.equal(candidate.corpusFingerprint,corpus.fingerprint,'Candidate/corpus fingerprint mismatch');
const oldSources=baseline.sourceUnits;
const sourceText=(record,old=false)=>(record.sourceUnitIds||[]).map(id=>unitText(old?oldSources[id]:newSources.get(id))).join('\n');
const oldGlobalWitnesses=sentence=>[
 ...baseline.records.filter(record=>contains(text(record),sentence)).map(record=>({kind:'BASELINE_EFFECTIVE_RECORD',id:record.id})),
 ...Object.values(oldSources).filter(unit=>contains(unitText(unit),sentence)).map(unit=>({kind:'OLD_ACCEPTED_SOURCE_UNIT',id:unit.id})),
];
const violations=[],rows=[],redistributions=[];
const locatorPinned=locator=>{
 const unit=newSources.get(locator.sourceUnitId);if(!unit)return false;
 const occurrence=(unit.occurrences||[unit]).find(value=>value.sourceOrder===locator.sourceOrder&&String(unit.occurrences?value.content?.contentHash:unit.contentHash).toUpperCase()===String(locator.sourceContentHash).toUpperCase());
 return !!occurrence&&String(unit.contentHash).toUpperCase()===String(locator.sourceUnitContentHash).toUpperCase();
};
for(const record of candidate.records.filter(value=>value.origin==='CAPTURED_WAHAPEDIA')){
 if(!record.sourceLocators?.length)violations.push({kind:'MISSING_SOURCE_LOCATOR',id:record.id});
 for(const locator of record.sourceLocators||[])if(!locatorPinned(locator))violations.push({kind:'UNPINNED_SOURCE_LOCATOR',id:record.id,locator});
}
for(const id of oldById.keys())if(!newById.has(id))violations.push({kind:'LOST_BASELINE_ID',id});
const corrections=candidate.ownershipCorrections||candidate.ownershipRedistributions||[];
assert(Array.isArray(corrections),'Ownership corrections must be an explicit record list');
const correctionsById=new Map();
for(const correction of corrections){
 const id=correction.fromId||correction.sourceRecordId;
 assert(id&&!correctionsById.has(id),'Duplicate or missing ownership correction source');
 const ids=correction.toIds||correction.destinationIds||[];
 assert(Array.isArray(ids)&&ids.length&&new Set(ids).size===ids.length,'Ownership correction needs explicit unique destination IDs');
 correctionsById.set(id,{...correction,fromId:id,toIds:ids});
}

// This second implementation reads actual numbered HTML headings in DOM order.
// It does not import the producer or trust a producer-assigned owner for a quote.
const requests=[];
const requestFor=(record,sentence)=>({id:record.id,code:record.code,text:sentence,
 anchors:(record.sourceLocators||[]).map(locator=>locator.anchor).filter(Boolean),
 pages:[...new Set((record.sourceLocators||[]).map(locator=>locator.page))],
 hierarchyIds:[...new Set((record.sourceLocators||[]).flatMap(locator=>(locator.hierarchy||[]).map(heading=>heading.id)))],
});
for(const record of candidate.records)if(record.recordType==='MAIN_RULE'&&record.origin==='CAPTURED_WAHAPEDIA'){
 for(const sentence of [...sentences(text(record)),...sentences(text(oldById.get(record.id)))])requests.push(requestFor(record,sentence));
}
for(const correction of correctionsById.values())for(const sentence of sentences(text(oldById.get(correction.fromId)))){
 for(const id of correction.toIds)requests.push(requestFor(newById.get(id),sentence));
}
requests.push(requestFor(newById.get('core-rule-18-05-emergency-disembark-move'),'OR: (2) If the above is not possible while remaining unengaged, set up that model wholly within the set-up distance of that TRANSPORT, as close as possible to that TRANSPORT, and engaged.'));
const uniqueRequests=[...new Map(requests.map(request=>[request.id+'\0'+key(request.text),request])).values()];
const worker=String.raw`
import json,re,sys,unicodedata,bisect,contextlib,io,hashlib
from pathlib import Path
from lxml import html
request=json.loads(sys.stdin.buffer.read().decode('utf8'))
legacy={'__name__':'candidate_report_legacy_probe','__file__':request['oldImporter']}
exec(compile(Path(request['oldImporter']).read_text(encoding='utf8'),request['oldImporter'],'exec'),legacy)
def normalized(value):
 value=unicodedata.normalize('NFKC',str(value)).replace('\u2018',"'").replace('\u2019',"'").replace('\u2013','-').replace('\u2014','-').replace('\u2212','-').lower()
 value=re.sub(r'\be\.g\.','for example',value)
 return value
token_re=re.compile(r'\d+(?:\.\d+)*(?:\+|")?|[a-z]+(?:\x27[a-z]+)?|[+\-/]')
def words(value):return token_re.findall(normalized(value))
def hidden(node):
 return node.tag in ['script','style']or str(node.get('id','')).startswith('tooltip_content')or 'display:none'in node.get('style','').replace(' ','').lower()
documents=[];verified_boundaries=[]
for page,file in request['files'].items():
 tree=html.fromstring(Path(file).read_text(encoding='utf8'));chunks=[];chunk_owners=[];current={'code':None,'anchor':None};chapter=None;headings=[]
 declared={}
 for boundary in request['sourceBoundaries']:
  if boundary['page']!=page:continue
  assert hashlib.sha256(Path(file).read_bytes()).hexdigest().upper()==boundary['rawSha256'].upper()
  nodes=tree.xpath(boundary['xpath']);assert len(nodes)==1,'The frozen source heading must be unique'
  node=nodes[0];assert ' '.join(node.text_content().split())==boundary['headingText']
  body_parts=[node.tail or ''];sibling=node.getnext()
  while sibling is not None:
   if sibling.tag in ['h2','h3']or any(c in sibling.get('class','').split()for c in ['abWrap','str11Wrapper']):break
   body_parts.extend([sibling.text_content(),sibling.tail or '']);sibling=sibling.getnext()
  body=' '.join(' '.join(body_parts).split())
  assert words(body)==words(boundary['bodyQuote']),'The frozen child must own exactly the declared quote'
  assert hashlib.sha256(boundary['bodyQuote'].encode('utf8')).hexdigest().upper()==boundary['bodyQuoteSha256'].upper()
  declared[boundary['xpath']]=boundary
  verified_boundaries.append({**boundary,'independentlyVerifiedRawBody':body,'bodyEndsBefore':tree.getroottree().getpath(sibling)if sibling is not None else None})
 legacy_file=Path(request['legacyTemp'])/(page+'.json')
 with contextlib.redirect_stdout(io.StringIO()):legacy['main'](file,str(legacy_file))
 legacy_records=json.loads(legacy_file.read_text(encoding='utf8'))['records']
 def append(value,node):
  if value:
   value=normalized(value)
   # Inline formatting can separate visible labels without literal whitespace;
   # preserve possessive/hyphen tails while separating adjacent word fragments.
   if chunks and chunks[-1]and value and chunks[-1][-1].isalnum()and value[0].isalnum():
    chunks.append(' ');chunk_owners.append({**current,'textDomPath':tree.getroottree().getpath(node)})
   chunks.append(value);chunk_owners.append({**current,'textDomPath':tree.getroottree().getpath(node)})
 def walk(node):
  global current,chapter
  if not isinstance(node.tag,str)or hidden(node):return
  classes=node.get('class','').split()
  if 'outline_header'in classes:
   title=' '.join(' '.join(node.itertext()).split());number=re.search(r'\b(\d{2})\s*$',title)
   chapter={'id':node.get('id'),'title':title,'number':number.group(1)if number else None,'domPath':tree.getroottree().getpath(node)}
   current={**current,'sourceChapter':chapter}
  if node.tag in ['h2','h3']or 'str11Name'in classes or 'abName'in classes:
   label=' '.join(' '.join(node.itertext()).split());m=re.search(r'\b((?:0[1-9]|1\d|2[0-5])\.\d{2}(?:\.\d{2})?)\b',label)
   declaration=declared.get(tree.getroottree().getpath(node))
   if declaration:
    current={'code':declaration['internalCode'],'anchor':node.get('id'),'domPath':tree.getroottree().getpath(node),'sourceChapter':chapter,'explicitSourceBoundary':True};headings.append({**current,'label':label})
   if m:
    current={'code':m.group(1),'anchor':node.get('id'),'domPath':tree.getroottree().getpath(node),'sourceChapter':chapter};headings.append({**current,'label':label})
  block=node.tag in ['p','div','li','tr','td','th','ul','ol','h1','h2','h3','h4','table']
  if block:append('\n',node)
  append(node.text,node)
  for child in node:
   walk(child)
   append(child.tail,node)
  if block:append('\n',node)
 walk(tree)
 stream=''.join(chunks);chunk_starts=[];position=0
 for chunk in chunks:chunk_starts.append(position);position+=len(chunk)
 parts=[];owners=[]
 for token in token_re.finditer(stream):
  parts.append(token.group());owners.append(chunk_owners[bisect.bisect_right(chunk_starts,token.start())-1])
 starts=[];position=0
 for word in parts:starts.append(position);position+=len(word)+1
 documents.append({'page':page,'tree':tree,'joined':'\u0001'.join(parts),'starts':starts,'owners':owners,'headings':headings,'legacyRecords':legacy_records})
results=[]
for item in request['requests']:
 pattern='\u0001'.join(words(item['text']));matches=[]
 if pattern:
  for doc in documents:
   start=0
   while True:
    at=doc['joined'].find(pattern,start)
    if at<0:break
    end=at+len(pattern)
    if(at==0 or doc['joined'][at-1]=='\u0001')and(end==len(doc['joined'])or doc['joined'][end]=='\u0001'):
     index=bisect.bisect_right(doc['starts'],at)-1;last=bisect.bisect_right(doc['starts'],max(at,end-1))-1
     witness=doc['owners'][index];lastowner=doc['owners'][last]
     matches.append({'page':doc['page'],**witness,'lastOwnerCode':lastowner.get('code'),'crossesNumberedOwner':witness.get('code')!=lastowner.get('code')})
    start=at+1
 legacy_evidence=[]
 for doc in documents:
  if doc['page']not in item['pages']:continue
  old=[r for r in doc['legacyRecords']if r['code']==item['code']and(not r.get('sourceNode',{}).get('anchor')or r['sourceNode']['anchor']in item['anchors'])]
  captured=any(('\u0001'+pattern+'\u0001')in('\u0001'+'\u0001'.join(words(r.get('text','')))+'\u0001')for r in old)
  possible=[h for h in doc['headings']if h['code']==item['code']and(h.get('sourceChapter')or{}).get('id')in item['hierarchyIds']and(not item['anchors']or h.get('anchor')in item['anchors'])]
  boundaries=[]
  for heading in possible:
   node=doc['tree'].xpath(heading['domPath'])[0];boundary={'sourceHeading':heading}
   if node.tag in ['h2','h3']:
    sibling=node.getnext()
    while sibling is not None and sibling.tag not in ['h2','h3']:sibling=sibling.getnext()
    boundary.update({'oldFunction':'heading_record','oldFunctionLine':71,'kind':'NEXT_H2_OR_H3_SIBLING'if sibling is not None else'END_OF_HEADING_SIBLING_CONTAINER','oldContainerPath':doc['tree'].getroottree().getpath(node.getparent())})
    if sibling is not None:boundary['stopsAt']={'tag':sibling.tag,'id':sibling.get('id'),'label':' '.join(sibling.text_content().split()),'domPath':doc['tree'].getroottree().getpath(sibling)}
   else:
    classes=node.get('class','').split();wrapper=next((a for a in node.iterancestors()if('abWrap'if'abName'in classes else'str11Wrap')in a.get('class','').split()),None)
    boundary.update({'oldFunction':'main ability/sequence wrapper extraction','oldFunctionLine':220,'kind':'ABILITY_WRAPPER_ONLY'if'abName'in classes else'SEQUENCE_TEXT_WRAPPER_ONLY','oldContainerPath':doc['tree'].getroottree().getpath(wrapper)if wrapper is not None else None})
   witnesses=[m for m in matches if m['page']==doc['page']and m['code']==item['code']]
   boundary['omittedPublicSentenceTextPaths']=[m.get('textDomPath')for m in witnesses]
   boundary['exactOldExtractionOmitsSentence']=not captured
   boundaries.append(boundary)
  legacy_evidence.append({'page':doc['page'],'oldRecordCount':len(old),'oldExtractorOnSameFreshRawContainsSentence':captured,'structuralBoundaries':boundaries})
 results.append({**item,'matches':matches,'legacyExtractionEvidence':legacy_evidence})
sys.stdout.buffer.write(json.dumps({'results':results,'headings':{d['page']:d['headings']for d in documents},'verifiedSourceBoundaries':verified_boundaries},ensure_ascii=False).encode('utf8'))
`;
const bundled=process.env.USERPROFILE&&path.join(process.env.USERPROFILE,'.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe');
const python=option('--python')||process.env.WH_PYTHON||process.env.PYTHON||(bundled&&fs.existsSync(bundled)?bundled:'python');
const rawRoot=option('--raw-root')||path.dirname(candidateFile);
const sourceBoundaries=JSON.parse(read(path.join(rawRoot,'source-boundaries.v1.json'))).boundaries;
const rawFiles=Object.fromEntries(['core','appendix'].map(page=>[page,path.resolve(root,rawRoot,page==='core'?'core-rules.html':'rules-appendix.html')]));
for(const page of corpus.pages){const bytes=fs.readFileSync(rawFiles[page.id]);assert.equal(sha(bytes).toUpperCase(),page.rawSha256.toUpperCase(),'RAW byte hash mismatch: '+page.id);assert.equal(bytes.length,page.rawBytes,'RAW length mismatch: '+page.id);}
const legacyTemp=createQaTempDir('core-candidate-legacy-probe-');
let rawAudit;
try{
 const raw=spawnSync(python,['-c',worker],{input:JSON.stringify({files:rawFiles,requests:uniqueRequests,sourceBoundaries,oldImporter:path.resolve(root,'books/core-rules/tools/import_wahapedia_11e.py'),legacyTemp}),encoding:'utf8',env:{...process.env,PYTHONDONTWRITEBYTECODE:'1'},maxBuffer:64*1024*1024});
 assert.equal(raw.status,0,'Independent RAW ownership audit failed: '+raw.stderr);rawAudit=JSON.parse(raw.stdout);
}finally{cleanupQaTempDir(legacyTemp);}
const evidenceByKey=new Map(rawAudit.results.map(request=>[request.id+'\0'+key(request.text),request]));
const witnessByKey=new Map(rawAudit.results.map(request=>[request.id+'\0'+key(request.text),request.matches]));
const rawMatches=(record,sentence)=>(witnessByKey.get(record.id+'\0'+key(sentence))||[]);
const sameOwnerWitness=(record,sentence)=>rawMatches(record,sentence).filter(witness=>{
 if(witness.crossesNumberedOwner||witness.code!==record.code)return false;
 // Different headings can intentionally share a printed rule code. In that
 // case a code alone must never authenticate a quote from the neighbouring card.
 const occurrences=(record.sourceUnitIds||[]).flatMap(id=>newSources.get(id)?.occurrences||[]);
 const anchors=[...new Set(occurrences.filter(value=>value.page===witness.page||!value.page).map(value=>value.anchor).filter(Boolean))];
 return anchors.length<2||(record.sourceLocators||[]).some(locator=>locator.page===witness.page&&locator.anchor===witness.anchor);
});
const sharesPhysicalSourceChapter=(from,to,witness)=>{
 const id=witness.sourceChapter?.id;
 return !!id&&(from.sourceLocators||[]).some(locator=>locatorPinned(locator)&&(locator.hierarchy||[]).some(heading=>heading.id===id))
  &&(to.sourceLocators||[]).some(locator=>locatorPinned(locator)&&locator.page===witness.page&&(locator.hierarchy||[]).some(heading=>heading.id===id));
};
const approvedSourceChange=record=>record.recordType==='FAQ_CLARIFICATION'||(record.sourceLocators||[]).some(locator=>locator.page==='appendix')
 ||['09.07','12.08','15.09','18.07','21.02','07.01','25.04'].some(code=>record.code===code||String(record.code).startsWith(code+'.'));
const exactApprovedChanges=[{
 id:'core-rule-21-02-surge-move',
 before:'SET-UP DISTANCE: As stated in the rule allowing this move type.',
 after:'MAXIMUM DISTANCE: As stated in the rule allowing this move type.',
}];
// These are the six precise, accepted formatter paraphrases, not a waiver by
// record ID. Each old sentence must match exactly and its paired fresh wording
// must occur in both the candidate and independently owned public HTML.
const formatterPairs=[
 ['core-rule-02-02-01-modifiers','A value that has been changed is a modified rule (for example, a modified characteristic, modified roll or modified value).','A value that has been changed is a modified rule (e.g. modified characteristic, modified roll, modified value, etc).',181],
 ['core-rule-02-02-01-modifiers','If a rule has +1 to a characteristic, it improves it by the value after the ‘+’ symbol.','If the rule has +1 to a characteristic, it improves it by the value after the ‘+’ symbol.',183],
 ['core-rule-02-02-01-modifiers','For example, ‘This weapon has +1 AP’ would improve an AP characteristic of -2 to -3.','Example: ‘This weapon has +1 AP’ would improve an AP characteristic of -2 to -3.',183],
 ['core-rule-02-02-01-modifiers','If a rule has -1 to a characteristic, it worsens it by the value after the ‘-’ symbol.','If the rule has -1 to a characteristic, it worsens it by the value after the ‘-’ symbol.',184],
 ['core-rule-02-02-01-modifiers','For example, ‘This unit has -1 Sv’ would worsen a Sv characteristic of 3+ to 4+.','Example: ‘This unit has -1 Sv’ would worsen a Sv characteristic of 3+ to 4+.',184],
 ['core-rule-18-05-emergency-disembark-move','Or: If the above is not possible while remaining unengaged, set up that model wholly within the set-up distance of that TRANSPORT, as close as possible to that TRANSPORT, and engaged.','OR: (2) If the above is not possible while remaining unengaged, set up that model wholly within the set-up distance of that TRANSPORT, as close as possible to that TRANSPORT, and engaged.',null],
];
function exactFormatterPair(record,sentence){
 const pair=formatterPairs.find(([id,before])=>id===record.id&&key(before)===key(sentence));
 if(!pair||!contains(text(record),pair[2]))return null;
 const freshWitnesses=sameOwnerWitness(record,pair[2]);
 if(!freshWitnesses.length)return null;
 const oldImporter=fs.readFileSync(path.join(root,'books/core-rules/tools/import_wahapedia_11e.py'),'utf8');
 if(pair[3]&&!oldImporter.includes(pair[1]))return null;
 return {oldSentence:sentence,candidateSentence:pair[2],kind:pair[3]?'OLD_IMPORTER_LITERAL_PARAPHRASE':'ORDERED_LIST_OR_BULLET_REPRESENTATION',
  oldFormatter:pair[3]?{file:'books/core-rules/tools/import_wahapedia_11e.py',line:pair[3]}:{file:'books/core-rules/content/core-rules.digital-11e.json',representation:'The same second alternative is rendered as an Or bullet instead of inline OR (2).'},
  freshRawOwnerWitnesses:freshWitnesses};
}
function exactSourceChange(record,sentence){
 const change=exactApprovedChanges.find(value=>value.id===record.id&&key(value.before)===key(sentence));
 if(!change)return null;
 const previous=oldById.get(record.id),current=newById.get(record.id);
 const witnesses=sameOwnerWitness(current,change.after);
 if(!approvedSourceChange(current)||!contains(sourceText(previous,true),change.before)||!contains(text(current),change.after)||!witnesses.length)return null;
 return {...change,oldAcceptedSourceUnitIds:previous.sourceUnitIds,newSourceLocators:current.sourceLocators,independentNewRawWitnesses:witnesses};
}

for(const record of candidate.records){
 const previous=oldById.get(record.id),before=text(previous),after=text(record);
 assert(typeof record.id==='string'&&typeof record.title==='string'&&typeof record.text==='string','Incomplete candidate record');
 const oldSentences=sentences(before),newSentences=sentences(after);
 const missing=oldSentences.filter(sentence=>!contains(after,sentence));
 const additions=newSentences.filter(sentence=>!contains(before,sentence));
 const correction=correctionsById.get(record.id),transfers=[],actualChanges=[],representationPairs=[];
 for(const sentence of missing){
  const destinations=(correction?.toIds||[]).map(id=>newById.get(id)).filter(Boolean)
   .filter(destination=>destination.id!==record.id&&contains(text(destination),sentence))
   .map(destination=>({id:destination.id,code:destination.code,witnesses:sameOwnerWitness(destination,sentence).filter(witness=>sharesPhysicalSourceChapter(record,destination,witness))})).filter(destination=>destination.witnesses.length);
  if(destinations.length===1){transfers.push({sentence,normalizedSentence:norm(sentence),toId:destinations[0].id,rawWitnesses:destinations[0].witnesses});continue;}
  const representation=exactFormatterPair(record,sentence);
  if(representation){representationPairs.push(representation);continue;}
  const wasOwned=previous&&contains(sourceText(previous,true),sentence);
  const fresh=rawMatches(record,sentence);
  if(wasOwned&&!sameOwnerWitness(record,sentence).length&&record.origin==='CAPTURED_WAHAPEDIA'&&approvedSourceChange(record)){
   actualChanges.push({sentence,oldAcceptedSourceOwnsSentence:true,freshRawSameOwnerOccurrences:0,otherFreshRawOwners:fresh,authorizedScope:true});continue;
  }
  violations.push({kind:'UNPROVEN_REMOVAL',id:record.id,sentence,explicitDestinations:correction?.toIds||[],admissibleDestinationCount:destinations.length,oldAcceptedSourceOwnsSentence:!!wasOwned,freshRawWitnesses:fresh});
 }
 const exact=before===after,typography=norm(before)===norm(after),sameMeaning=key(before)===key(after);
 const incomingCorrections=[...correctionsById.values()].filter(value=>value.toIds.includes(record.id));
 const incomingSentences=additions.flatMap(sentence=>incomingCorrections
  .filter(value=>contains(text(oldById.get(value.fromId)),sentence))
  .map(value=>({sentence,fromId:value.fromId,rawOwnerWitnesses:sameOwnerWitness(record,sentence)})));
 const preservedOldSource=previous&&additions.every(sentence=>contains(sourceText(previous,true),sentence)||incomingSentences.some(value=>key(value.sentence)===key(sentence)&&value.rawOwnerWitnesses.length));
 let category=!previous?'new':exact?'unchanged':typography||sameMeaning?'presentation':actualChanges.length?'sourcechanged':transfers.length?'presentation':missing.length===representationPairs.length?'restored':'presentation';
 if(!previous)assert(!oldById.has(record.id));
 if(String(record.origin).startsWith('BASELINE_')&&!exact)violations.push({kind:'PROTECTED_BASELINE_TEXT_CHANGED',id:record.id,origin:record.origin});
 if(record.recordType==='FAQ_CLARIFICATION'&&previous&&norm(record.question)!==norm(previous.question))violations.push({kind:'EXISTING_FAQ_QUESTION_CHANGED',id:record.id,before:previous.question,after:record.question});
 const addedSourceEvidence=additions.map(sentence=>{
  const evidence=evidenceByKey.get(record.id+'\0'+key(sentence));
  const globalOldWitnesses=oldGlobalWitnesses(sentence);
  const legacyExtractionEvidence=evidence?.legacyExtractionEvidence||[];
  const rawOwnerWitnesses=sameOwnerWitness(record,sentence);
  const structuralOmissionWitnesses=legacyExtractionEvidence.flatMap(value=>value.structuralBoundaries.map(boundary=>({page:value.page,...boundary})))
   .filter(boundary=>boundary.exactOldExtractionOmitsSentence&&boundary.omittedPublicSentenceTextPaths.length);
  const oldExtractorCaptures=legacyExtractionEvidence.some(value=>value.oldExtractorOnSameFreshRawContainsSentence);
  const linkedNewAppendixTarget=['Replacing One Model with Another 01.02.12','Drawing a Line 01.04.06'].some(value=>key(value)===key(sentence));
  const formatterPair=representationPairs.find(value=>contains(sentence,value.candidateSentence));
  const cause=globalOldWitnesses.length?'EXISTING_ACCEPTED_FACT_OR_REFERENCE':formatterPair?'ACCEPTED_FORMATTER_REPRESENTATION':linkedNewAppendixTarget?'NEW_APPROVED_APPENDIX_TARGET_REFERENCE':
   structuralOmissionWitnesses.length?'OLD_EXTRACTOR_OMITS_THIS_FRESH_RAW_REGION':oldExtractorCaptures&&approvedSourceChange(record)?'AUTHORIZED_SOURCE_WORDING_CHANGE':!previous?'NEW_AUTHORIZED_ID':'UNRESOLVED_ADDITION';
  return {sentence,cause,oldAcceptedOwnerAlreadyContains:!!(previous&&contains(sourceText(previous,true),sentence)),globalOldWitnesses,candidateCorpusOwnerContains:contains(sourceText(record),sentence),rawOwnerWitnesses,legacyExtractionEvidence,structuralOmissionWitnesses};
 });
 if(record.recordType==='MAIN_RULE'&&record.origin==='CAPTURED_WAHAPEDIA')for(const evidence of addedSourceEvidence){
  if(!evidence.rawOwnerWitnesses.length)violations.push({kind:'NEW_TEXT_WITHOUT_INDEPENDENT_RAW_OWNER',id:record.id,...evidence});
  if(evidence.cause==='UNRESOLVED_ADDITION')violations.push({kind:'ADDITION_WITHOUT_RESTORATION_OR_AUTHORIZED_CHANGE_PROOF',id:record.id,...evidence});
 }
 if(previous&&addedSourceEvidence.some(evidence=>evidence.cause==='AUTHORIZED_SOURCE_WORDING_CHANGE'))category='sourcechanged';
 if(previous&&representationPairs.length===missing.length&&!addedSourceEvidence.some(evidence=>evidence.cause==='OLD_EXTRACTOR_OMITS_THIS_FRESH_RAW_REGION'||evidence.cause==='AUTHORIZED_SOURCE_WORDING_CHANGE')&&category!=='unchanged')category='presentation';
 const row={id:record.id,recordType:record.recordType,code:record.code||null,title:record.title,origin:record.origin,
  baselineEffectiveChars:previous?before.length:null,candidateChars:after.length,delta:previous?after.length-before.length:null,
  category,classificationVerified:missing.length===transfers.length+actualChanges.length+representationPairs.length&&!addedSourceEvidence.some(evidence=>evidence.cause==='UNRESOLVED_ADDITION'),
  detail:transfers.length?'EXPLICIT_SAME_SECTION_OWNERSHIP_REDISTRIBUTION':typography&&!exact?'TYPOGRAPHY_OR_WHITESPACE_ONLY':sameMeaning&&!exact?'PRESENTATION_WITH_IDENTICAL_WORD_NUMBER_OPERATOR_SEQUENCE':representationPairs.length?'EXACT_ACCEPTED_FORMATTER_PAIRINGS':missing.length&&!actualChanges.length?'UNRESOLVED_REPRESENTATION_OR_OWNERSHIP_DIFFERENCE':null,
  additionsAlreadyPresentInOldAcceptedOwner:!!preservedOldSource,
  allOldNormalizedSentencesRetainedInSameRecord:missing.length===0,removedSentenceCount:missing.length,redistributedSentenceCount:transfers.length,sourceChangedSentenceCount:actualChanges.length,
  sourceUnitIds:record.sourceUnitIds||[],sourceLocators:record.sourceLocators||[],addedSourceEvidence,incomingRedistributionSentences:incomingSentences,
  sourceChangedSentences:actualChanges,representationPairs,...(record.representation?{baselineRepresentation:record.representation}:{}),
  ...(category!=='unchanged'?{oldText:previous?before:null,newText:after}:{}),
  ...(record.question?{question:record.question,baselineQuestion:previous?.question||null}:{})};
 rows.push(row);
 if(correction){
  const destinationIds=[...new Set(transfers.map(transfer=>transfer.toId))].sort(compare);
  const affectedIds=[record.id,...destinationIds],oldAffected=affectedIds.map(id=>oldById.get(id)).filter(Boolean),newAffected=affectedIds.map(id=>newById.get(id)).filter(Boolean);
  const lost=[],approvedSourceChangedOmissions=[];
  for(const old of oldAffected)for(const sentence of sentences(text(old)))if(!newAffected.some(value=>contains(text(value),sentence))){
   const change=exactSourceChange(old,sentence);
   if(change)approvedSourceChangedOmissions.push(change);else lost.push({id:old.id,sentence});
  }
  if(lost.length)violations.push({kind:'AFFECTED_UNION_TEXT_LOSS',fromId:record.id,lost});
  redistributions.push({fromId:record.id,code:record.code,title:record.title,oldChars:before.length,newChars:after.length,
   explicitDestinationIds:correction.toIds,actualDestinationIds:destinationIds,removedNormalizedSentences:missing.map(norm),transfers,
  samePhysicalSourceChapter:transfers.every(transfer=>transfer.rawWitnesses.every(witness=>sharesPhysicalSourceChapter(record,newById.get(transfer.toId),witness))),
  affectedUnionPreservesUnchangedBaseline:lost.length===0,affectedUnionContainsOriginalLiteralBaseline:lost.length===0&&approvedSourceChangedOmissions.length===0,
  approvedSourceChangedOmissions,lossCount:lost.length,lost});
 }
}
for(const id of correctionsById.keys())if(!newById.has(id))violations.push({kind:'UNKNOWN_OWNERSHIP_CORRECTION_SOURCE',id});
const categoryCounts=Object.fromEntries(['unchanged','restored','sourcechanged','presentation','new'].map(category=>[category,rows.filter(row=>row.category===category).length]));
const rawBehindProtected=[];
for(const record of candidate.records.filter(record=>String(record.origin).startsWith('BASELINE_'))){
 const previous=oldById.get(record.id);if(!previous)continue;
 const oldRaw=sourceText(previous,true),newRaw=sourceText(record);
 if(oldRaw&&newRaw&&key(oldRaw)!==key(newRaw))rawBehindProtected.push({id:record.id,code:record.code,title:record.title,origin:record.origin,effectiveTextUnchanged:text(previous)===text(record),oldAcceptedRawText:oldRaw,newCapturedRawText:newRaw,note:'The raw Waha change does not replace the preserved stronger or helper baseline entry.'});
}
const existingMainAdditions=rows.filter(row=>oldById.has(row.id)&&row.recordType==='MAIN_RULE'&&row.origin==='CAPTURED_WAHAPEDIA').flatMap(row=>row.addedSourceEvidence.map(evidence=>({id:row.id,...evidence})));
const absentOldGlobal=existingMainAdditions.filter(evidence=>!evidence.globalOldWitnesses.length);
const causeCounts=Object.fromEntries([...new Set(existingMainAdditions.map(evidence=>evidence.cause))].sort(compare).map(cause=>[cause,existingMainAdditions.filter(evidence=>evidence.cause===cause).length]));
const report={schema:'core-importer-candidate-review/v1',status:violations.length?'BLOCKED':'PASS',candidateOnly:true,baselineHead,
 candidate:{path:candidateFile,sha256:sha(candidateBytes),schema:candidate.schema,status:candidate.status,corpusPath:corpusFile,corpusSha256:sha(read(corpusFile)),corpusFingerprint:corpus.fingerprint},
 provenanceLimits:['Original 2026-09-25 RAW HTML is absent from Git. The accepted pinned corpus transcription is the old-source comparison; the fresh 2026-11-11 HTML is checked independently.',
  'Executing the unchanged old importer against the same fresh HTML proves a structural extraction omission, not historical equality of the September and November webpages. Each restored addition records its old global witness or exact legacy extraction boundary and fresh public text DOM path.',
  'sourcechanged describes a difference from that accepted transcription with fresh same-owner RAW support; it does not claim an independently re-downloaded 2026-09-25 webpage. Only the owner-approved changed-rule scope is admitted.'],
 textDefinition:'Lengths compare the active effective semanticContent with candidate.text, in JavaScript UTF-16 code units. FAQ questions are separately preserved. Typography, whitespace, bullets and the existing core-fact-projection e.g.→for example expansion are presentation normalization; word/number/operator tokens remain explicit. Provenance-only differences do not change the text category.',
 baselineRecords:oldById.size,candidateRecords:rows.length,allOldIdsPreserved:[...oldById.keys()].every(id=>newById.has(id)),newIds:rows.filter(row=>!oldById.has(row.id)).map(row=>row.id),categoryCounts,
 rawCaptureFootprint:corpus.pages.map(page=>({page:page.id,url:page.url,bytes:page.rawBytes,sha256:page.rawSha256,numberedSourceUnits:page.numbered.length,faqSourceUnits:page.faqs.length,errataSourceUnits:page.errata.length,counts:page.counts})),
 independentlyVerifiedExplicitSourceBoundaries:rawAudit.verifiedSourceBoundaries,
 additionsReview:{scope:'Existing captured MAIN_RULE records only; sentence occurrences, not unique strings.',total:existingMainAdditions.length,causes:causeCounts,absentFromEntireOldAcceptedCorpusAndEffectiveCatalog:absentOldGlobal.length,
  absentGlobalAndOmittedByOldExtractorOnSameFreshHtml:absentOldGlobal.filter(evidence=>evidence.legacyExtractionEvidence.every(value=>!value.oldExtractorOnSameFreshRawContainsSentence)).length,
  exactStructuralOmissionWitnesses:existingMainAdditions.filter(evidence=>evidence.structuralOmissionWitnesses.length).length,unresolved:existingMainAdditions.filter(evidence=>evidence.cause==='UNRESOLVED_ADDITION').length},
 sourceChangedRecords:rows.filter(row=>row.category==='sourcechanged').map(row=>({id:row.id,code:row.code,title:row.title,oldText:row.oldText,newText:row.newText,sourceChangedSentences:row.sourceChangedSentences,addedSourceChangedSentences:row.addedSourceEvidence.filter(evidence=>evidence.cause==='AUTHORIZED_SOURCE_WORDING_CHANGE')})),
 baselineRepresentationExceptions:candidate.records.filter(record=>record.representation||record.origin==='BASELINE_PRESENTATION_EXCEPTION').map(record=>({id:record.id,origin:record.origin,representation:record.representation||null,oldTextExactlyRetained:text(oldById.get(record.id))===text(record),sourceLocators:record.sourceLocators})),
 productionScope:{activeCoreAndOldCaptureUnchangedAgainstBaseline:true,candidateRegisteredAsRuntimeInput:false,otherProductionByteIdentity:'Verified separately by the Core importer isolation QA; this report does not run publication consumers.',taskB:'Source registry recovery is a separate task; see docs/audit/core-importer-a-task-b-note.json. This candidate neither switches the active Core nor repairs that registry.'},
 rows,shortenedRecordRedistribution:redistributions,rawChangesBehindPreservedBaselineEntries:rawBehindProtected,violations};
const cell=value=>String(value??'—').replaceAll('|','\\|').replace(/\s+/g,' ');
const fenced=value=>'```text\n'+String(value??'(no previous record)').replaceAll('```','` ` `')+'\n```';
let markdown='# Core importer candidate review\n\n'+`Status: **${report.status}**. This report reviews an inactive candidate and never changes the active Core, reader, glossary or Army Books.\n\n`;
markdown+=`Baseline: \`${baselineHead}\`. Active identities: ${report.baselineRecords}; candidate identities: ${report.candidateRecords}; old IDs preserved: ${report.allOldIdsPreserved}.\n\n`;
markdown+='## Categories\n\n| Category | Records |\n|---|---:|\n'+Object.entries(categoryCounts).map(([name,count])=>`| ${name} | ${count} |`).join('\n')+'\n\n';
markdown+='## Raw capture footprint\n\n| Page | Bytes | SHA-256 | Numbered units | FAQ | Errata |\n|---|---:|---|---:|---:|---:|\n'+report.rawCaptureFootprint.map(page=>`| ${page.page} | ${page.bytes} | ${page.sha256} | ${page.numberedSourceUnits} | ${page.faqSourceUnits} | ${page.errataSourceUnits} |`).join('\n')+'\n\n';
markdown+='## New stable identities\n\n'+report.newIds.map(id=>'- `'+id+'`').join('\n')+'\n\n';
markdown+='## Addition attribution\n\n'+`Existing captured main-rule sentence additions: ${report.additionsReview.total}. Absent from the entire old accepted corpus and effective catalog: ${report.additionsReview.absentFromEntireOldAcceptedCorpusAndEffectiveCatalog}; of these, the unchanged old extractor also omits ${report.additionsReview.absentGlobalAndOmittedByOldExtractorOnSameFreshHtml} on the same fresh HTML. Unresolved additions: ${report.additionsReview.unresolved}.\n\n`;
markdown+='| Evidence category | Sentence occurrences |\n|---|---:|\n'+Object.entries(causeCounts).map(([cause,count])=>`| ${cause} | ${count} |`).join('\n')+'\n\nThe JSON contains every sentence, old global witnesses, exact legacy extraction boundary, fresh text DOM paths and source pins. Omitted-region evidence proves importer coverage, not historical webpage equality.\n\n';
markdown+='## Complete canonical record table\n\n| ID | Title | Live effective chars | Candidate chars | Category |\n|---|---|---:|---:|---|\n'+rows.map(row=>`| ${cell(row.id)} | ${cell(row.title)} | ${cell(row.baselineEffectiveChars)} | ${row.candidateChars} | ${row.category}${row.detail?' / '+row.detail:''} |`).join('\n')+'\n\n';
markdown+='## Exact ownership redistribution list\n\n| Source record | Old chars | New chars | Destinations | Lost sentences |\n|---|---:|---:|---|---:|\n'+redistributions.map(row=>`| ${cell(row.fromId)} | ${row.oldChars} | ${row.newChars} | ${cell(row.actualDestinationIds.join(', '))} | ${row.lossCount} |`).join('\n')+'\n\n';
for(const row of redistributions){markdown+=`### ${row.fromId}\n\n`;
 for(const transfer of row.transfers)markdown+=`Destination: \`${transfer.toId}\`.\n\n${fenced(transfer.sentence)}\n\n`;
 for(const change of row.approvedSourceChangedOmissions)markdown+=`Separately authorized source change in \`${change.id}\`: \`${change.before}\` → \`${change.after}\`. It is excluded only from literal-union equality; unchanged source facts have loss 0.\n\n`;
}
markdown+='## Exact formatter representation pairs\n\n';
for(const row of rows.filter(row=>row.representationPairs.length)){
 markdown+=`### ${row.id}\n\n`;
 for(const pair of row.representationPairs)markdown+=`Old accepted formatter (${pair.oldFormatter.file}${pair.oldFormatter.line?':'+pair.oldFormatter.line:''}):\n\n${fenced(pair.oldSentence)}\n\nEquivalent captured representation, with independent own-source witness in JSON:\n\n${fenced(pair.candidateSentence)}\n\n`;
}
markdown+='## Baseline representation exceptions\n\n| ID | Origin | Old effective text exactly retained | Proof |\n|---|---|---|---|\n'+report.baselineRepresentationExceptions.map(row=>`| ${row.id} | ${row.origin} | ${row.oldTextExactlyRetained} | ${cell(JSON.stringify(row.representation))} |`).join('\n')+'\n\n';
markdown+='## Full changed texts\n\n';
for(const row of rows.filter(row=>['restored','sourcechanged'].includes(row.category)||row.detail==='EXPLICIT_SAME_SECTION_OWNERSHIP_REDISTRIBUTION')){
 markdown+=`### ${row.id} — ${row.title}\n\nCategory: ${row.category}${row.detail?' / '+row.detail:''}.\n\nOld effective text:\n\n${fenced(row.oldText)}\n\nCandidate text:\n\n${fenced(row.newText)}\n\n`;
}
markdown+='## Protected entries and provenance limits\n\n'+report.provenanceLimits.map(note=>'- '+note).join('\n')+'\n\n';
markdown+=`Raw Waha differences behind preserved baseline entries: ${rawBehindProtected.length}; full old/new raw transcriptions are in the JSON report. They do not authorize replacing stronger official entries.\n\n`;
markdown+='## Violations\n\n'+(violations.length?violations.map(value=>'- '+JSON.stringify(value)).join('\n'):'None.')+'\n';
const outputs=[[jsonFile,JSON.stringify(report,null,2)+'\n'],[markdownFile,markdown]];
for(const [file,value]of outputs){const target=path.resolve(root,file);if(mode==='--write'){fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,value);}else assert.equal(fs.readFileSync(target,'utf8'),value,'Stale candidate audit report: '+file);}
console.log(JSON.stringify({status:report.status,baselineRecords:oldById.size,candidateRecords:rows.length,categoryCounts,redistributions:redistributions.length,violations:violations.length,reports:outputs.map(([file])=>file)}));
if(violations.length)process.exitCode=1;

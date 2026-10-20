/** Independent source/parity oracle for the isolated native full-book projection.
 * Expected facts are accepted Stage 2A records and their RAW addresses, never
 * output of the new book producer. No runtime/legality or MFM certification. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {buildNativeBook,writeNativeBook} from './book-build.mjs';
import {createBookPresenter} from '../../shared/army-book-app-v2/book-v1.mjs';

const read=name=>JSON.parse(fs.readFileSync(new URL(name,import.meta.url),'utf8'));
const facts=read('./generated/effective.json'),base=read('./generated/base.json'),cross=read('./generated/cross-owner-references.json');
const enrolled=read('./identity-bindings.json').bindings;
const native3a=read('./generated/native-datasheets.json'),presentation3a=read('./generated/datasheet-presentation.json');
const oldIds=new Set(native3a.entities.map(e=>e.id));
const additions=facts.entities.filter(e=>!oldIds.has(e.id));
const all=[...facts.entities,...cross.entities];
const sourceById=new Map(all.map(e=>[e.id,e]));
const sort=values=>[...values].sort();
const index=values=>new Map(values.map(e=>[e.id,e]));
const at=(data,pointer)=>pointer.slice(1).split('/').map(s=>s.replaceAll('~1','/').replaceAll('~0','~')).reduce((v,k)=>v?.[k],data);
const field=(card,pointer)=>card.fields.find(f=>f.source.path===pointer);
const expectedKinds={ARMY_RULE:5,DETACHMENT:21,DETACHMENT_RULE:24,ENHANCEMENT:56,STRATAGEM:84};

// Re-read accepted HTML using independent lxml, not the factual producer. Exact
// provenance XPaths select occurrences; text tokens prove full clauses survive.
// Presentation tests below additionally require exact accepted punctuation/text.
const python=process.env.PYTHON_EXECUTABLE||'C:/Users/denis/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe';
const rawOracle=String.raw`
import copy, hashlib, json, re, sys
from pathlib import Path
from lxml import html
root=Path(sys.argv[1]); here=root/'books/space-marines/v2'
rows=json.loads((here/'generated/effective.json').read_text(encoding='utf8'))['entities']
rows+=json.loads((here/'generated/cross-owner-references.json').read_text(encoding='utf8'))['entities']
old={e['id'] for e in json.loads((here/'generated/native-datasheets.json').read_text(encoding='utf8'))['entities']}
rows=[e for e in rows if e['id'] not in old]
trees={}; out={}; normalized=0
tokens=lambda s: re.findall(r'\w+',s,flags=re.UNICODE)
for e in rows:
 p=root/e['provenance']['document']
 assert hashlib.sha256(p.read_bytes()).hexdigest().upper()==e['provenance']['sha256'],e['id']+' raw SHA'
 if str(p) not in trees: trees[str(p)]=html.parse(str(p))
 nodes=trees[str(p)].xpath(e['provenance']['pointer']); assert len(nodes)==1,e['id']+' raw pointer'
 n=copy.deepcopy(nodes[0]); kind=e['kind']
 for child in list(n.iterdescendants()):
  classes=(child.get('class') or '').split()
  if child.getparent() is not None and (child.tag in ['script','style'] or 'ShowFluff' in classes or 'faqErrataSpoiler' in classes): child.drop_tree()
 if kind=='ENHANCEMENT':
  for prices in n.xpath('.//ul[contains(concat(" ",normalize-space(@class)," ")," EnhancementsPts ")]/li/span[last()]'):
   if re.search(r'\d+\s*pts', ''.join(prices.itertext())): prices.drop_tree()
 for node in n.iter():
  if node.tag in ['div','p','li','ul','ol','table','tr','td','h2','h3','h4','br']:
   node.text=' '+(node.text or '');node.tail=' '+(node.tail or '')
 raw=' '.join(''.join(n.itertext()).split())
 if kind!='DETACHMENT':
  assert tokens(raw)==tokens(e['data']['text']),e['id']+' full RAW clause mismatch'
  normalized+=1
 if kind=='STRATAGEM':
  one=lambda c: n.xpath('.//*[contains(concat(" ",normalize-space(@class)," ")," '+c+' ")]')
  cp=one('str11CP'); category=one('str11Type'); body=one('str11Text')
  assert len(cp)==len(category)==len(body)==1,e['id']+' strat structure'
  cptext=' '.join(''.join(cp[0].itertext()).split());m=re.fullmatch(r'(\d+)CP',cptext);assert m
  categorytext=' '.join(''.join(category[0].itertext()).split())
  out[e['id']]={'cp':int(m[1]),'category':categorytext,'body':' '.join(''.join(body[0].itertext()).split())}
print(json.dumps({'records':len(rows),'fullTexts':normalized,'stratagems':out},ensure_ascii=False))
`;
const repo=fileURLToPath(new URL('../../../',import.meta.url));
const probe=spawnSync(python,['-X','utf8','-c',rawOracle,repo],{encoding:'utf8',maxBuffer:8*1024*1024});
assert.equal(probe.status,0,'Independent RAW oracle failed: '+probe.stderr);
const raw=JSON.parse(probe.stdout);
assert.equal(raw.records,198);assert.equal(Object.keys(raw.stratagems).length,88);

export function assertNativeBook(result){
 const {model,payload,deathwatch,coverage}=result;
 assert.equal(model.bookId,'space-marines');assert.equal(deathwatch.model.bookId,'deathwatch');
 assert.equal(model.entities.length,1714);assert.equal(payload.cards.length,1714);
 assert.equal(deathwatch.model.entities.length,8);assert.equal(deathwatch.payload.cards.length,8);
 assert.equal(payload.schema,'army-book-app-v2/presentation');
 assert.deepEqual(sort(model.entities.map(e=>e.id)),sort(facts.entities.map(e=>e.id)));
 assert.deepEqual(sort(deathwatch.model.entities.map(e=>e.id)),sort(cross.entities.map(e=>e.id)));
 const records=index([...model.entities,...deathwatch.model.entities]);
 const cards=index([...payload.cards,...deathwatch.payload.cards]);
 assert.equal(records.size,1722);assert.equal(cards.size,1722);
 assert.deepEqual(sort(records.keys()),sort(enrolled.map(e=>e.id)),'Persistent source ledger differs');
 assert.deepEqual(sort(cards.keys()),sort(records.keys()),'Lost/invented canonical card');
 const sourceIds=new Map(all.map(e=>[e.sourceEntityId,e.id]));
 for(const binding of enrolled){
  const entity=records.get(binding.id);
  assert.equal(entity.sourceEntityId,binding.sourceEntityId);assert.equal(entity.bookId,binding.bookId);
  assert.equal(entity.sourceKind||entity.kind,binding.kind);
  assert.equal(entity.parentId||null,binding.ownerSourceId?sourceIds.get(binding.ownerSourceId):null);
 }
 for(const [doc,view,expected] of [[model,payload,facts],[deathwatch.model,deathwatch.payload,cross]]){
  const ownCards=index(view.cards),ownRecords=index(doc.entities),fieldIds=new Set();
  assert.equal(view.book.mfmVersion,'NOT_ENROLLED');
  assert.equal(view.sourceCompleteness.semanticCompleteness,'NOT_PROVEN');
  assert.equal(view.rulePresentationLimitations.points,'UNRESOLVED_MFM_V1_6_NOT_ENROLLED');
  for(const [key,value]of Object.entries(doc.mfm))if(key!=='source')assert.deepEqual(value,[],'MFM activated');
  for(const original of expected.entities){
   const entity=ownRecords.get(original.id),card=ownCards.get(original.id);
   assert.equal(entity.bookId,original.bookId);assert.equal(entity.parentId,original.parentId);
   assert.equal(card.parentId,original.parentId,'Incorrect presentation owner');
   assert.equal(entity.sourceEntityId,original.sourceEntityId);
   assert.deepEqual(entity.provenance,original.provenance);assert.deepEqual(card.provenance,original.provenance);
   assert.deepEqual(entity.fieldProvenance||{},original.fieldProvenance||{});
   assert.deepEqual(card.fieldProvenance||{},original.fieldProvenance||{});
   assert(!entity.ruleContract,'Invented executable effect');
   for(const [key,value]of Object.entries(original.data)){
    if(key==='stats')for(const [k,v]of Object.entries(value))assert.equal(entity.data.stats[k],v);
    else assert.deepEqual(entity.data[key],value,'Source field changed '+original.id+'/'+key);
   }
   for(const key of Object.keys(entity.data))assert.ok(Object.hasOwn(original.data,key)||
    ({MODEL_PROFILE:['invulnerableSaveId'],WEAPON_PROFILE:['mode'],INVULNERABLE_SAVE:['profileIds'],STRATAGEM:['cp','category','lines']}[original.kind]||[]).includes(key),
    'Invented factual alias '+original.id+'/'+key);
   for(const f of card.fields){
    assert(!fieldIds.has(f.id),'Duplicate field identity');fieldIds.add(f.id);
    assert.equal(f.source.entityId,original.id,'Foreign field owner');
    assert.notEqual(at(entity.data,f.source.path),undefined,'Unbacked field');
    assert.deepEqual(f.value,at(entity.data,f.source.path),'Field value changed');
   }
   if(!oldIds.has(original.id)&&original.kind!=='DETACHMENT'){
    assert.equal(field(card,'/text')?.value,original.data.text,'Full conditional text absent');
    assert.equal(field(card,'/title')?.value,original.data.title);
   }
   if(original.kind==='ENHANCEMENT'){
    assert.equal(field(card,'/eligibilityText')?.value,original.data.eligibilityText,'Eligibility truncated');
    assert.equal(field(card,'/scope')?.value,original.data.scope);
    if(original.data.itemKind==='UNIT_UPGRADE'){
     assert.equal(field(card,'/itemKind')?.displayValue,'UNIT Upgrade');
     assert.equal(field(card,'/itemKind')?.presentationPath,'/sourceTypeLabel');
    }
   }
   if(original.kind==='STRATAGEM'){
    const expected=raw.stratagems[original.id];assert(expected);
    assert.equal(entity.data.cp,`${expected.cp}CP`,'CP cost differs from RAW');
    assert.equal(entity.data.category,expected.category,'Stratagem owner/type differs from RAW');
    assert.equal(field(card,'/cp')?.value,`${expected.cp}CP`);
    assert.equal(field(card,'/category')?.value,expected.category);
    assert.equal(entity.data.lines.map(line=>line.label+(line.text.startsWith('\n')?'':' ')+line.text).join('\n'),original.data.text.split('\n').slice(3).join('\n'),'Timing/target/effect/tail lost');
   }
  }
 }
 // Full-book presentation must reuse the frozen native datasheet projection.
 const oldCards=index(presentation3a.cards),oldRecords=index(native3a.entities);
 for(const id of oldIds){assert.deepEqual(JSON.parse(JSON.stringify(records.get(id))),oldRecords.get(id),'Stage 3A adaptation changed');assert.deepEqual(JSON.parse(JSON.stringify(cards.get(id))),oldCards.get(id),'Stage 3A card changed');}
 assert.deepEqual(Object.fromEntries(Object.keys(expectedKinds).map(kind=>[kind,additions.filter(e=>e.kind===kind).length])),expectedKinds);
 assert.equal(additions.filter(e=>e.kind==='ARMY_RULE'&&e.data.ruleClass==='ARMY_RULE').length,3);
 assert.equal(additions.filter(e=>e.kind==='ENHANCEMENT'&&e.data.itemKind==='ENHANCEMENT').length,47);
 assert.equal(additions.filter(e=>e.kind==='ENHANCEMENT'&&e.data.itemKind==='UNIT_UPGRADE').length,9);
 assert.equal(additions.filter(e=>e.kind==='DETACHMENT'&&e.data.sourcePartition==='BASE').length,15);
 assert.equal(additions.filter(e=>e.kind==='DETACHMENT'&&e.data.sourcePartition!=='BASE').length,6);
 const groups=new Map(payload.groups.map(g=>[g.id,g.itemIds]));
 assert.deepEqual(sort(groups.get('army-rules')||[]),sort(additions.filter(e=>e.kind==='ARMY_RULE'&&e.data.ruleClass==='ARMY_RULE').map(e=>e.id)));
 assert.deepEqual(sort(groups.get('source-conditions')||[]),sort(additions.filter(e=>e.kind==='ARMY_RULE'&&e.data.ruleClass==='SOURCE_CONDITION').map(e=>e.id)));
 assert.deepEqual(sort(groups.get('detachments')||[]),sort(additions.filter(e=>e.kind==='DETACHMENT').map(e=>e.id)));
 for(const [view,expected]of [[payload,additions],[deathwatch.payload,cross.entities]]){
  assert.equal(view.bookPresentation.schema,'army-book-app-v2/book-v1-presentation');
  assert.deepEqual(sort(Object.keys(view.bookPresentation.records)),sort(expected.map(e=>e.id)),'Book layout source coverage');
  for(const source of expected){
   const layout=view.bookPresentation.records[source.id];
   assert.equal(layout.id,source.id);assert.equal(layout.kind,source.kind);assert.equal(layout.parentId,source.parentId);
   assert.equal(layout.source.entityId,source.id);assert.deepEqual(layout.provenance,source.provenance);
   for(const key of ['pointRecordId','detachmentPoints','forceDispositions','qualifiers'])assert.equal(layout[key],undefined,'Unresolved prices must remain absent');
   if(source.kind==='DETACHMENT'){
    assert.deepEqual(layout.ruleIds,source.data.ruleIds);assert.equal(layout.ruleId,source.data.ruleIds[0]);
    assert.deepEqual(layout.enhancementIds,source.data.enhancementIds);assert.deepEqual(layout.stratagemIds,source.data.stratagemIds);
   }
  }
 }
 const primary=additions.filter(e=>e.kind==='DETACHMENT_RULE'&&sourceById.get(e.parentId)?.kind==='DETACHMENT');
 const nested=additions.filter(e=>e.kind==='DETACHMENT_RULE'&&sourceById.get(e.parentId)?.kind==='DETACHMENT_RULE');
 assert.equal(primary.length,21);assert.deepEqual(sort(nested.map(e=>e.data.title)),['Defensive Mastery','Unparalleled Tactician','Wrath of the First Khan'].sort());
 for(const det of [...additions,...cross.entities].filter(e=>e.kind==='DETACHMENT')){
  const card=cards.get(det.id);
  for(const key of ['ruleIds','enhancementIds','stratagemIds'])for(const id of det.data[key])assert.equal(sourceById.get(id)?.parentId,det.id,'Foreign Detachment child');
  for(const id of det.data.ruleIds)assert(card.children.includes(id),'Primary Detachment block missing');
 }
 for(const rule of nested){
  assert(sourceById.get(rule.parentId).data.nestedRuleIds.includes(rule.id),'Nested ownership incomplete');
  assert.equal(cards.get(rule.id).parentId,rule.parentId);
  assert.equal(field(cards.get(rule.id),'/text').value,rule.data.text);
  assert.equal(field(cards.get(rule.parentId),'/text').value,sourceById.get(rule.parentId).data.text,'Parent text silently shortened');
  assert.deepEqual(cards.get(rule.parentId).links.filter(link=>link.targetId===rule.id),[{targetId:rule.id,label:rule.data.title}],'Standalone nested popup link missing');
 }
 assert.equal(payload.cards.filter(c=>c.kind==='STRATAGEM').length,84);
 assert.equal(deathwatch.payload.cards.filter(c=>c.kind==='STRATAGEM').length,4);
 for(const [id,clause]of [
  ['stratagem-sm-f5590987ff0f48fe','SECONDARY EFFECT:'],
  ['stratagem-sm-65917e52c6534c21','Designer’s Note:'],
  ['stratagem-sm-5f21bfd0016f4012','While doing so your unit can only target that enemy unit.'],
  ['stratagem-sm-df1a5abb4e824983','Your unit is not able to embark within a TRANSPORT until the end of the turn.']
 ]){assert(sourceById.get(id).data.text.includes(clause));assert(field(cards.get(id),'/text').value.includes(clause),'Post-effect clause missing');}
 assert(payload.cards.every(c=>!cross.entities.some(e=>e.id===c.id)),'Deathwatch mixed into SM');
 assert.deepEqual(coverage.sourceCounts,{spaceMarines:1714,deathwatch:8,total:1722});
 assert.deepEqual(sort(coverage.stage3aIds),sort(oldIds));assert.deepEqual(sort(coverage.stage3bIds),sort(additions.map(e=>e.id)));
 assert.deepEqual(sort(coverage.deathwatchIds),sort(cross.entities.map(e=>e.id)));
 assert.deepEqual(coverage.missingIds,[]);assert.deepEqual(coverage.overlapIds,[]);
 assert.equal(coverage.records.length,1722);assert.equal(new Set(coverage.records.map(e=>e.id)).size,1722);
 for(const row of coverage.records){const e=sourceById.get(row.id);assert(e);assert.equal(row.bookId,e.bookId);assert.equal(row.kind,e.kind);assert.equal(row.parentId||null,e.parentId||null);
  assert.equal(row.stage,e.bookId==='deathwatch'?'DEATHWATCH_REFERENCE':oldIds.has(e.id)?'3A':'3B');}
 assert.equal(model.entities.filter(e=>e.sourceKind==='COMPOSITION_MEMBER'&&e.data.profileBindingStatus==='NOT_PROVEN').length,3);
 const bridges=read('./mfm-identity-candidates.json').candidateBindings;
 assert.equal(bridges.length,164);
 assert(bridges.every(e=>e.status==='NOT_PROVEN'&&e.active===false&&e.mfmRecordId===null),'Unreviewed MFM candidate activated');
 return {records:1722,stage3a:1524,stage3b:190,deathwatch:8,nestedBlocks:3,independentRawTexts:raw.fullTexts,stratagemCpFromRaw:88};
}

// A small component test double, limited to the DOM methods used by this
// renderer. It tests the real presenter; it cannot certify browser layout,
// navigation, styling or application wiring and is not reported as doing so.
function node(tag,classes='',text){
 const value={tag,className:classes,dataset:{},childNodes:[],attributes:{},_text:'',
  append(...children){this.childNodes.push(...children);},
  setAttribute(name,content){this.attributes[name]=content;},
  get lastChild(){return this.childNodes.at(-1);},
  get textContent(){return this._text+this.childNodes.map(child=>child.textContent??String(child)).join('');},
  set textContent(content){this._text=String(content);this.childNodes=[];}};
 value.classList={add(...tokens){value.className=[...new Set([...value.className.split(' ').filter(Boolean),...tokens])].join(' ');},
  remove(...tokens){value.className=value.className.split(' ').filter(token=>!tokens.includes(token)).join(' ');}};
 if(text!==undefined)value.textContent=text;
 return value;
}
const descendants=element=>[element,...element.childNodes.flatMap(child=>typeof child==='object'?descendants(child):[])];
function assertComponentRendering(result){
 let rendered=0;
 for(const [view,sources]of [[result.payload,additions],[result.deathwatch.payload,cross.entities]]){
  const cards=index(view.cards),document={createTextNode:text=>node('#text','',text)};
  const factValue=(tag,field)=>{const element=node(tag,'v2-field-value',field.displayValue??field.value);element.dataset.factId=field.id;element.dataset.factValue=structuredClone(field.value);return element;};
  const anchor=(label,id)=>{const element=node('a','',label);element.attributes.href='#'+id;return element;};
  const presenter=createBookPresenter({document,payload:view,cards,el:node,factValue,anchor,allowedIds:()=>null});
  for(const source of sources){
   const card=cards.get(source.id);assert(presenter.accepts(card));
   const renderedNode=presenter.render(card),tree=descendants(renderedNode);
   const bound=tree.filter(element=>element.dataset.factId),byFact=id=>bound.filter(element=>element.dataset.factId===id);
   const expectedField=(pointer,value)=>{
    const id=source.id+'::'+pointer,nodes=byFact(id);assert.equal(nodes.length,1,'Missing/duplicate rendered source field '+id);
    assert.deepEqual(nodes[0].dataset.factValue,value,'Rendered source value changed '+id);return nodes[0];};
   expectedField('/title',source.data.title);
   assert(tree.every(element=>!['enhancement-cost','detachment-dp','force-disposition','detachment-qualifiers'].some(token=>element.className.split(' ').includes(token))),'Unresolved MFM value rendered');
   if(source.kind==='STRATAGEM'){
    expectedField('/cp',raw.stratagems[source.id].cp+'CP');expectedField('/category',raw.stratagems[source.id].category);
    // Independent segmentation of the accepted original body; do not read the
    // new producer's aliases to obtain expected captions or continuations.
    const paragraphs=source.data.text.split('\n').slice(3),sections=[];
    for(const paragraph of paragraphs){
     const split=paragraph.indexOf(':');const caption=split<0?'':paragraph.slice(0,split);
     if(['WHEN','TARGET','EFFECT','SECONDARY EFFECT','Designer’s Note'].includes(caption))sections.push({label:caption+':',text:paragraph.slice(split+1).replace(/^ /,'')});
     else{assert(sections.length);sections.at(-1).text+='\n'+paragraph;}
    }
    for(const [i,section]of sections.entries()){
     expectedField(`/lines/${i}/label`,section.label);expectedField(`/lines/${i}/text`,section.text);
    }
    assert.equal(bound.filter(element=>element.dataset.factId.startsWith(source.id+'::/lines/')).length,sections.length*2,'Extra/missing source Stratagem clauses rendered');
   }else if(source.kind!=='DETACHMENT')expectedField('/text',source.data.text);
   if(source.kind==='ENHANCEMENT'&&source.data.itemKind==='UNIT_UPGRADE'){
    assert.equal(expectedField('/itemKind','UNIT_UPGRADE').textContent,'UNIT Upgrade','Upgrade rendered as ordinary Enhancement');
   }
   if(source.kind==='DETACHMENT'){
    const ids=tree.map(element=>element.dataset.cardId).filter(Boolean);
    for(const id of [...source.data.ruleIds,...source.data.enhancementIds,...source.data.stratagemIds])assert.equal(ids.filter(value=>value===id).length,1,'Lost/duplicate rendered Detachment child '+id);
   }
   if(source.kind==='DETACHMENT_RULE')for(const id of source.data.nestedRuleIds||[]){
    assert.equal(tree.filter(element=>element.tag==='a'&&element.attributes.href==='#'+id).length,1,'Nested source rule is not independently reachable');
   }
   rendered++;
  }
 }
 assert.equal(rendered,198);return rendered;
}

const original=JSON.stringify({facts,base,cross});
const result=buildNativeBook({facts,base,cross}),census=assertNativeBook(result);
const componentRecords=assertComponentRendering(result);
assert.equal(JSON.stringify({facts,base,cross}),original,'Producer mutates factual input');
assert.deepEqual(buildNativeBook({facts,base,cross}),result,'Nondeterministic double build');
assert.deepEqual(buildNativeBook({facts:{...facts,entities:[...facts.entities].reverse()},base:{...base,entities:[...base.entities].reverse()},
 cross:{...cross,entities:[...cross.entities].reverse()}}),result,'Source order changes identities or presentation');
const nested=additions.find(e=>e.kind==='DETACHMENT_RULE'&&sourceById.get(e.parentId)?.kind==='DETACHMENT_RULE');
const strat=additions.find(e=>e.kind==='STRATAGEM'),enh=additions.find(e=>e.kind==='ENHANCEMENT');
let mutations=0;
for(const [name,change]of [
 ['missing nested block',r=>{r.model.entities=r.model.entities.filter(e=>e.id!==nested.id);}],
 ['wrong Detachment owner',r=>{r.payload.cards.find(c=>c.id===strat.id).parentId=enh.id;}],
 ['wrong CP',r=>{r.model.entities.find(e=>e.id===strat.id).data.cp=9;}],
 ['lost timing clause',r=>{r.payload.cards.find(c=>c.id===strat.id).fields.find(f=>f.source.path==='/text').value='EFFECT only';}],
 ['lost secondary effect/tail',r=>{r.model.entities.find(e=>e.id===strat.id).data.lines.pop();}],
 ['lost secondary effect',r=>{r.payload.cards.find(c=>c.id==='stratagem-sm-f5590987ff0f48fe').fields.find(f=>f.source.path==='/text').value='METHODICAL BRUTALITY without secondary effect';}],
 ['lost designers note',r=>{r.model.entities.find(e=>e.id==='stratagem-sm-65917e52c6534c21').data.text='ESTABLISH SUPREMACY without designer note';}],
 ['Deathwatch mixed into SM',r=>{r.payload.cards.push(structuredClone(r.deathwatch.payload.cards[0]));}],
 ['invented canonical identity',r=>{r.model.entities[0].id='fabricated';}],
 ['truncated eligibility',r=>{r.model.entities.find(e=>e.id===enh.id).data.eligibilityText='model only';}],
 ['guessed unresolved composition',r=>{r.model.entities.find(e=>e.sourceKind==='COMPOSITION_MEMBER'&&e.data.profileBindingStatus==='NOT_PROVEN').data.profileBindingStatus='PROVEN';}],
 ['fabricated points',r=>{r.model.entities.find(e=>e.kind==='DETACHMENT').data.points=0;}],
 ['official/source provenance lost',r=>{r.payload.cards.find(c=>c.id===enh.id).provenance={};}],
 ['Upgrade shown as ordinary Enhancement',r=>{field(r.payload.cards.find(c=>c.id===additions.find(e=>e.data.itemKind==='UNIT_UPGRADE').id),'/itemKind').displayValue='Enhancement';}],
 ['ledger missing source record',r=>{r.coverage.records.pop();}]
 ,['nested popup unreachable',r=>{r.payload.cards.find(c=>c.id===nested.parentId).links=[];}]
 ,['Detachment layout wrong rule',r=>{r.payload.bookPresentation.records[strat.parentId].ruleIds=[nested.id];}]
 ,['MFM values fabricated by layout',r=>{r.payload.bookPresentation.records[strat.parentId].detachmentPoints=0;}]
]){const changed=structuredClone(result);change(changed);assert.throws(()=>assertNativeBook(changed),undefined,'Mutation survived: '+name);mutations++;}
for(const [name,change]of [
 ['accepted source text altered',input=>{input.facts.entities.find(e=>e.id===enh.id).data.text+=' altered';}],
 ['source record removed',input=>{input.facts.entities=input.facts.entities.filter(e=>e.id!==nested.id);}],
 ['source owner changed',input=>{input.facts.entities.find(e=>e.id===strat.id).parentId=enh.id;}],
 ['cross-owner source altered',input=>{input.cross.entities.find(e=>e.kind==='STRATAGEM').data.text='altered';}]
]){const input=structuredClone({facts,base,cross});change(input);assert.throws(()=>buildNativeBook(input),undefined,'Producer accepts '+name);mutations++;}
let componentMutations=0;
for(const [name,change]of [
 ['missing rendered CP',r=>{const c=r.payload.cards.find(c=>c.id===strat.id);c.fields=c.fields.filter(f=>f.source.path!=='/cp');}],
 ['missing rendered WHEN',r=>{const c=r.payload.cards.find(c=>c.id===strat.id);c.fields=c.fields.filter(f=>f.source.path!=='/lines/0/label');}],
 ['missing rendered secondary clause',r=>{const c=r.payload.cards.find(c=>c.id==='stratagem-sm-f5590987ff0f48fe');c.fields=c.fields.filter(f=>!f.source.path.startsWith('/lines/3/'));}],
 ['lost rendered nested link',r=>{r.payload.cards.find(c=>c.id===nested.parentId).links=[];}]
]){const changed=structuredClone(result);change(changed);assert.throws(()=>assertComponentRendering(changed),undefined,'Renderer mutation survived '+name);componentMutations++;}
const originalRead=fs.readFileSync,forbidden=[];
fs.readFileSync=function(file,...args){const absolute=path.resolve(file instanceof URL?fileURLToPath(file):String(file)).replaceAll('\\','/').toLowerCase();
 const root=repo.replaceAll('\\','/').toLowerCase();if(absolute.startsWith(root+'mfm/')||absolute.startsWith(root+'books/space-marines/')&&!absolute.startsWith(root+'books/space-marines/v2/')){
 forbidden.push(absolute);throw new Error('Forbidden legacy or MFM read '+absolute);}
 return originalRead.call(this,file,...args);};
try{writeNativeBook({check:true});}finally{fs.readFileSync=originalRead;}
assert.deepEqual(forbidden,[]);
console.log(JSON.stringify({status:'PASS',...census,armyRules:3,sourceConditions:2,detachments:21,detachmentBlocks:24,
 enhancements:47,unitUpgrades:9,smStratagems:84,deathwatchStratagems:4,mutationControls:mutations,
 componentRecords,componentMutationControls:componentMutations,componentRendering:'PASS_NOT_BROWSER_ACCEPTANCE',
 deterministic:true,reorderedInputStable:true,freshness:'PASS',legacyOrCentralMfmReads:0,executableBindings:0,
 semanticCompleteness:'NOT_PROVEN',mfmIntegration:false,browserAcceptance:'NOT_RUN'},null,2));

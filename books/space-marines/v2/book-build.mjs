/** Book-owned native rule layout over the accepted Stage 2A factual owner.
 * Reuses the V2 projector and book-v1 presentation vocabulary. No MFM prices,
 * executable clauses, source parsing, legacy builder or application registration.
 */
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {projectArmyBook} from '../../shared/army-book-app-v2/project.mjs';
import {assertSourceCompletenessGate,captureSourceReview} from '../../shared/roster-v2/source-completeness.mjs';
import {buildNativeDatasheets} from './datasheet-build.mjs';

const read=name=>JSON.parse(fs.readFileSync(new URL(name,import.meta.url),'utf8'));
const clone=structuredClone;
const sorted=items=>[...items].sort((a,b)=>a.id.localeCompare(b.id));
const ruleKinds=new Set(['ARMY_RULE','DETACHMENT','DETACHMENT_RULE','ENHANCEMENT','STRATAGEM']);

// Only lossless layout segmentation: all original text remains on the owner.
// Captions are explicit source labels, never inferred gameplay conditions.
function stratagemLayout(entity){
  const [title,cp,category,...body]=entity.data.text.split('\n');
  assert.equal(title,entity.data.title,`${entity.id}: source title mismatch`);
  assert.match(cp,/^\d+CP$/,`${entity.id}: missing source CP`);
  assert.match(category,/Stratagem$/,`${entity.id}: missing source category`);
  const lines=[];
  for(const paragraph of body){
    const match=/^(WHEN|TARGET|EFFECT|SECONDARY EFFECT|Designer’s Note):( ?)(.*)$/.exec(paragraph);
    if(match)lines.push({label:match[1]+':',text:match[3]});
    else{assert.ok(lines.length,`${entity.id}: unlabelled source preamble`);lines.at(-1).text+='\n'+paragraph;}
  }
  assert.deepEqual(lines.slice(0,3).map(line=>line.label),['WHEN:','TARGET:','EFFECT:'],`${entity.id}: missing source captions`);
  const reconstructed=[title,cp,category,...lines.map(line=>line.label+(line.text.startsWith('\n')?'':' ')+line.text)].join('\n');
  assert.equal(reconstructed,entity.data.text,`${entity.id}: lossy Stratagem layout`);
  return {cp,category,lines};
}

function ruleView(owner,template){
  const model={...clone(template),bookId:owner.bookId,entities:sorted(clone(owner.entities))};
  const entities=new Map(model.entities.map(entity=>[entity.id,entity]));
  assert.equal(entities.size,model.entities.length,'Duplicate rule identity');
  const requireEntity=(id,kind,parentId)=>{
    const entity=entities.get(id);
    assert.equal(entity?.kind,kind,`Wrong native rule reference: ${id}`);
    assert.equal(entity.parentId,parentId,`Foreign native rule owner: ${id}`);
    return id;
  };
  for(const entity of model.entities){
    assert.ok(ruleKinds.has(entity.kind),`Unsupported source rule kind: ${entity.kind}`);
    assert.equal(entity.bookId,owner.bookId,'Foreign factual owner');
    entity.sourceKind=entity.kind;
    if(entity.kind==='STRATAGEM')Object.assign(entity.data,stratagemLayout(entity));
    if(entity.parentId)assert.ok(entities.has(entity.parentId),'Unresolved source parent');
  }
  const payload=projectArmyBook(model,new Map(),{title:owner.bookId==='deathwatch'?'Deathwatch source references':'Space Marines',edition:'11th Edition'});
  const cards=new Map(payload.cards.map(card=>[card.id,card])),records={};
  for(const entity of model.entities){
    const card=cards.get(entity.id);
    card.provenance=clone(entity.provenance);card.fieldProvenance=clone(entity.fieldProvenance||{});
    const record=records[entity.id]={id:entity.id,kind:entity.kind,parentId:entity.parentId,
      contextId:entity.parentId||entity.id,source:{entityId:entity.id},
      provenance:clone(entity.provenance||{}),fieldProvenance:clone(entity.fieldProvenance||{}),tables:[]};
    if(entity.kind==='ARMY_RULE')record.componentIds=[];
    if(entity.kind==='DETACHMENT'){
      record.ruleIds=entity.data.ruleIds.map(id=>requireEntity(id,'DETACHMENT_RULE',entity.id));
      assert.ok(record.ruleIds.length,'Missing primary Detachment rule');
      record.ruleId=record.ruleIds[0];
      record.enhancementIds=entity.data.enhancementIds.map(id=>requireEntity(id,'ENHANCEMENT',entity.id));
      record.stratagemIds=entity.data.stratagemIds.map(id=>requireEntity(id,'STRATAGEM',entity.id));
      for(const ids of [record.ruleIds,record.enhancementIds,record.stratagemIds])assert.equal(new Set(ids).size,ids.length,'Duplicate Detachment child');
    }
    if(entity.kind==='DETACHMENT_RULE')for(const id of entity.data.nestedRuleIds||[]){
      requireEntity(id,'DETACHMENT_RULE',entity.id);
      // Parent's complete source body stays intact; the independently owned
      // nested source record is also reachable through the existing rule link.
      card.links.push({targetId:id,label:entities.get(id).data.title});
    }
    if(entity.kind==='ENHANCEMENT'&&entity.data.itemKind==='UNIT_UPGRADE'){
      const field=card.fields.find(field=>field.source.path==='/itemKind');
      assert.ok(field,'Missing source Upgrade kind');
      field.presentationPath='/sourceTypeLabel';field.displayValue='UNIT Upgrade';
    }
  }
  // The existing renderer allows absent MFM costs. Its MFM convenience projector
  // requires enrolled prices; this book-owned layout deliberately supplies none.
  payload.bookPresentation={schema:'army-book-app-v2/book-v1-presentation',records};
  payload.groups=payload.groups.filter(group=>group.itemIds.length);
  return {model,payload};
}

export function buildNativeBook({facts=read('./generated/effective.json'),base=read('./generated/base.json'),cross=read('./generated/cross-owner-references.json')}={}){
  const before=[facts,base,cross].map(value=>JSON.stringify(value));
  const review=assertSourceCompletenessGate({review:read('./source-review.json'),books:[
    {bookId:'space-marines',facts,executionBook:null,sourceReview:captureSourceReview('space-marines',facts)},
    {bookId:'deathwatch',facts:cross,executionBook:null,sourceReview:captureSourceReview('space-marines',cross)}
  ],expectations:[],registeredBookIds:[],checkAllRegistrations:false});
  const native=buildNativeDatasheets({facts,base}),datasheetIds=new Set(native.model.entities.map(entity=>entity.id));
  const remaining=facts.entities.filter(entity=>!datasheetIds.has(entity.id));
  const rules=ruleView({...facts,entities:remaining},native.model);
  const deathwatch=ruleView(cross,native.model);
  const model={...native.model,entities:sorted([...native.model.entities,...rules.model.entities])};
  const payload={...native.payload,cards:sorted([...native.payload.cards,...rules.payload.cards]),
    factManifest:sorted([...native.payload.factManifest,...rules.payload.factManifest]),
    bookPresentation:rules.payload.bookPresentation};
  const mainRules=remaining.filter(entity=>entity.kind==='ARMY_RULE'&&entity.data.ruleClass==='ARMY_RULE').map(entity=>entity.id).sort();
  const conditions=remaining.filter(entity=>entity.kind==='ARMY_RULE'&&entity.data.ruleClass==='SOURCE_CONDITION').map(entity=>entity.id).sort();
  assert.equal(mainRules.length,3);assert.equal(conditions.length,2);
  payload.groups=[{id:'army-rules',label:'Army Rules',itemIds:mainRules},
    {id:'source-conditions',label:'Chapter and move-type conditions',itemIds:conditions},
    ...native.payload.groups,...rules.payload.groups.filter(group=>group.id==='detachments')];
  payload.sourceCompleteness=review;
  payload.rulePresentationLimitations={...native.payload.rulePresentationLimitations,scope:'STAGE_3B_NATIVE_BOOK',
    executableBindings:'NOT_IMPLEMENTED',ruleSemantics:'UNVERIFIED_FULL_SOURCE_TEXT',deathwatch:'SEPARATE_REFERENCE_OWNER'};
  deathwatch.payload.sourceCompleteness=review;
  deathwatch.payload.sourceEnrollment=clone(native.payload.sourceEnrollment);
  deathwatch.payload.rulePresentationLimitations=clone(payload.rulePresentationLimitations);
  const records=sorted([...facts.entities.map(entity=>({id:entity.id,bookId:entity.bookId,kind:entity.kind,
    stage:datasheetIds.has(entity.id)?'3A':'3B',...(entity.parentId?{parentId:entity.parentId}:{})})),
    ...cross.entities.map(entity=>({id:entity.id,bookId:entity.bookId,kind:entity.kind,stage:'DEATHWATCH_REFERENCE',
      ...(entity.parentId?{parentId:entity.parentId}:{})}))]);
  const expectedIds=records.map(record=>record.id).sort();
  const actualIds=[...payload.cards,...deathwatch.payload.cards].map(card=>card.id).sort();
  const coverage={sourceCounts:{spaceMarines:facts.entities.length,deathwatch:cross.entities.length,total:records.length},
    stage3aIds:[...datasheetIds].sort(),stage3bIds:remaining.map(entity=>entity.id).sort(),deathwatchIds:cross.entities.map(entity=>entity.id).sort(),
    missingIds:expectedIds.filter(id=>!actualIds.includes(id)),overlapIds:actualIds.filter((id,i)=>i>0&&id===actualIds[i-1]),records};
  assert.deepEqual(actualIds,expectedIds,'Source ledger presentation coverage mismatch');
  assert.equal(facts.entities.length,1714);assert.equal(cross.entities.length,8);assert.equal(remaining.length,190);
  assert.deepEqual([facts,base,cross].map(value=>JSON.stringify(value)),before,'Native build mutated source owner');
  return {model,payload,deathwatch,coverage};
}

export function writeNativeBook({check=false}={}){
  const result=buildNativeBook();
  for(const [name,value] of [['native-book',result.model],['book-presentation',result.payload],
    ['deathwatch-presentation',result.deathwatch.payload],['source-ledger-coverage',result.coverage]]){
    const file=new URL(`./generated/${name}.json`,import.meta.url),bytes=JSON.stringify(value,null,2)+'\n';
    if(check)assert.equal(fs.readFileSync(file,'utf8'),bytes,`Stale native output: ${name}`);else fs.writeFileSync(file,bytes);
  }
  return result;
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
  const result=writeNativeBook({check:process.argv.includes('--check')});
  console.log(JSON.stringify({status:'PASS',sourceCounts:result.coverage.sourceCounts,
    stage3a:result.coverage.stage3aIds.length,stage3b:result.coverage.stage3bIds.length,
    points:'UNRESOLVED',executableBindings:'NOT_IMPLEMENTED'}));
}

/** DA-owned native layout adapter over existing V2 projectors. No new source facts. */
import assert from 'node:assert/strict';
import {projectArmyBook} from '../../shared/army-book-app-v2/project.mjs';
import {buildNativeDatasheets} from './datasheet-build.mjs';
const clone=structuredClone,sorted=items=>[...items].sort((a,b)=>a.id.localeCompare(b.id));
const ruleKinds=new Set(['ARMY_RULE','DETACHMENT','DETACHMENT_RULE','ENHANCEMENT','STRATAGEM']);
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
  const payload=projectArmyBook(model,new Map(),{title:'Dark Angels',edition:'11th Edition'});
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


export function buildDAOwnedNative({facts,base}){
  const native=buildNativeDatasheets({facts,base});
  const dsIds=new Set(native.model.entities.map(entity=>entity.id));
  const rules=ruleView({...facts,entities:facts.entities.filter(entity=>!dsIds.has(entity.id))},native.model);
  const model={...native.model,entities:sorted([...native.model.entities,...rules.model.entities])};
  const payload={...native.payload,cards:sorted([...native.payload.cards,...rules.payload.cards]),
    factManifest:sorted([...native.payload.factManifest,...rules.payload.factManifest]),bookPresentation:rules.payload.bookPresentation};
  assert.equal(model.entities.length,facts.entities.length,'Lost DA native source occurrence');
  return {model,payload};
}

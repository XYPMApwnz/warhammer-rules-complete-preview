import {createGlobalGlossaryContent} from './global-glossary-content.mjs';
import {validateGlossary} from './glossary.mjs';

const human=value=>String(value||'Reference').replace(/[-_]/g,' ').replace(/\b\w/g,c=>c.toUpperCase());
const escape=value=>String(value).replaceAll('~','~0').replaceAll('/','~1');

/** Display adapter only. Canonical owners and the disposable corpus stay unchanged. */
export function adaptGlobalGlossary(corpus,{bookId='',registryLabels={}}={}) {
  if(corpus?.schema!=='wh40k-glossary-v2-index/v1'||!Array.isArray(corpus.entries))throw new TypeError('Unsupported global Glossary corpus');
  const entries=corpus.entries,byId=new Map(entries.map(entry=>[entry.id,entry]));
  if(byId.size!==entries.length)throw new TypeError('Duplicate global Glossary identity');
  const exactKeys=new Map(),compatibilityKeys=new Map();
  for(const entry of entries) {
    for(const key of [entry.sourceOwner.canonicalId,...(entry.aliases||[])]) {
      const ids=exactKeys.get(key)||new Set();ids.add(entry.id);exactKeys.set(key,ids);
    }
    if(!entry.parent&&entry.facts?.termId) {
      const ids=compatibilityKeys.get(entry.facts.termId)||new Set();ids.add(entry.id);compatibilityKeys.set(entry.facts.termId,ids);
    }
  }
  const {project}=createGlobalGlossaryContent({entries,bookId,registryLabels});
  const cards=[],index=[],contextLinks=[];
  for(const entry of entries) {
    const owner=entry.sourceOwner,registryId=owner.bookId||({CORE:'core-rules',MISSIONS:'missions',MFM:'mfm'}[entry.domain])||entry.domain.toLowerCase();
    const identity={registryId,canonicalId:owner.canonicalId,fieldPath:`/glossary/${escape(entry.id)}`};
    const content=project(entry),fields=[];
    const add=(path,value,label='Rule')=>{if(value!==null&&value!==undefined&&value!=='')fields.push({id:`${entry.id}::${path}`,label,value,type:'text',source:{entityId:owner.canonicalId,path}});};
    if(!entry.canonicalReferences?.some(reference=>reference.relationType==='sourceRuleId'))add('/semanticContent',content.definition);
    for(const [i,line] of (content.mfm?.lines||[]).entries())add(`/blocks/${i}/text`,line,'Points');
    const links=(entry.canonicalReferences||[]).filter(reference=>byId.has(reference.id)).map(reference=>({targetId:reference.id,label:reference.relationType==='faqIds'?'FAQ':human(reference.relationType),...(reference.relationType==='sourceRuleId'?{relation:'sourceRuleId'}:{})}));
    for(const id of content.structured?.terrainLayoutReference?.memberIds||[])if(byId.has(id)&&!links.some(link=>link.targetId===id))links.push({targetId:id,label:'Force Disposition'});
    cards.push({id:entry.id,identity,kind:entry.recordType,domain:entry.domain,title:entry.label,fields,links,children:[],
      provenance:entry.provenance,...(entry.fieldProvenance?{fieldProvenance:entry.fieldProvenance}:{}),sourceParentId:entry.parent?.canonicalId||null,
      contextRegistryIds:(entry.contexts||[]).map(context=>context.effectiveBookId),
      contextParentIds:(entry.contexts||[]).map(context=>context.parentUnitId).filter(Boolean),referenceVisuals:content.structured});
    const aliases=[...(entry.aliases||[])].filter(Boolean).map(label=>({label,presentationOnly:true,match:'EXACT'}));
    const termId=entry.facts?.termId;
    if(!entry.parent&&compatibilityKeys.get(termId)?.size===1&&(!exactKeys.has(termId)||[...exactKeys.get(termId)].every(id=>id===entry.id)))aliases.push({label:termId,presentationOnly:true,match:'EXACT'});
    for(const label of entry.presentation?.preferredMatchLabels||[])if(label)aliases.push({label,presentationOnly:true,match:'NORMALIZED'});
    if(entry.presentation?.referenceLabel)cards[cards.length-1].title=entry.presentation.referenceLabel;
    if(entry.presentation?.referenceContext)contextLinks.push({card:cards[cards.length-1],owner,context:entry.presentation.referenceContext});
    index.push({targetId:entry.id,label:entry.presentation?.referenceLabel||entry.label,category:entry.presentation?.referenceCategory||entry.recordType,
      contextLabel:registryLabels[registryId]||({CORE:'Core Rules',MISSIONS:'Missions',MFM:'Munitorum Field Manual'}[entry.domain])||human(registryId),
      aliases});
    // A named field is a view of an existing canonical fact, not another fact owner.
    const seen=new Set();
    for(const descriptor of entry.presentation?.referenceFields||[]) {
      const match=/^\/blocks\/(0|[1-9]\d*)\/text$/.exec(descriptor.path),block=match&&entry.facts?.canonicalData?.blocks?.[Number(match[1])];
      const expectedCategory=block?.wargearAbility?'WARGEAR_ABILITY':'ABILITY';
      if(entry.recordType!=='DATASHEET_SECTION'||!match||!block||typeof block.wargearAbility!=='boolean'||
        seen.has(descriptor.path)||descriptor.factId!==owner.canonicalId+'::'+descriptor.path||
        descriptor.category!==expectedCategory||descriptor.label!==block.text.slice(0,block.text.indexOf(': '))||
        entry.facts.blocks?.[Number(match[1])]?.text!==block.text)throw new TypeError('Invalid canonical ability field '+entry.id);
      seen.add(descriptor.path);
      const qualificationFields=(entry.facts.qualifications||[]).flatMap((qualification,index)=>{
        if('/'+qualification.field.join('/')!==descriptor.path||!qualification.value?.faqId||typeof qualification.value.sourceText!=='string')return [];
        const path=`/qualifications/${index}/value/sourceText`;
        return [{id:owner.canonicalId+'::'+path,label:'FAQ',type:'text',value:qualification.value.sourceText,
          source:{entityId:owner.canonicalId,path},presentationPath:'/semanticContent',
          provenance:{sourceId:qualification.sourceId,...qualification.provenance}}];
      });
      const id=entry.id+'::'+descriptor.path,parent=entries.find(candidate=>candidate.sourceOwner.bookId===owner.bookId&&candidate.sourceOwner.canonicalId===entry.parent?.canonicalId);
      cards.push({id,identity:{registryId,canonicalId:owner.canonicalId,fieldPath:descriptor.path},kind:descriptor.category,domain:entry.domain,title:descriptor.label,
        fields:[{id:descriptor.factId,label:'Rule',type:'text',value:block.text,source:{entityId:owner.canonicalId,path:descriptor.path},presentationPath:'/semanticContent'},...qualificationFields],
        links:[...links,{targetId:entry.id,label:entry.label}],children:[],provenance:descriptor.provenance,
        sourceParentId:entry.parent?.canonicalId||null,contextRegistryIds:(entry.contexts||[]).map(context=>context.effectiveBookId),
        contextParentIds:(entry.contexts||[]).map(context=>context.parentUnitId).filter(Boolean)});
      if(descriptor.referenceContext)contextLinks.push({card:cards[cards.length-1],owner,context:descriptor.referenceContext});
      index.push({targetId:id,label:descriptor.label,category:descriptor.category,
        contextLabel:[registryLabels[registryId]||human(registryId),parent?.label].filter(Boolean).join(' · '),
        aliases:[{label:descriptor.factId,presentationOnly:true,match:'EXACT'}]});
    }
  }
  const unitOwner=entry=>{
    const visited=new Set();
    while(entry&&!visited.has(entry.id)) {
      if(entry.recordType==='UNIT')return entry.sourceOwner.canonicalId;
      visited.add(entry.id);
      entry=entries.find(candidate=>candidate.sourceOwner.bookId===entry.sourceOwner.bookId&&candidate.sourceOwner.canonicalId===entry.parent?.canonicalId);
    }
    return null;
  };
  for(const {card,owner,context}of contextLinks) {
    const candidates=entries.filter(entry=>entry.sourceOwner.bookId===owner.bookId&&entry.sourceOwner.canonicalId===context.canonicalId);
    const target=candidates.length===1&&cards.find(candidate=>candidate.id===candidates[0].id+(context.path?'::'+context.path:''));
    const source=entries.find(entry=>entry.sourceOwner.bookId===owner.bookId&&entry.sourceOwner.canonicalId===owner.canonicalId);
    if(!target||target.id===card.id||!unitOwner(source)||unitOwner(source)!==unitOwner(candidates[0]))throw new TypeError('Invalid canonical ability context '+card.id);
    card.links.push({targetId:target.id,label:target.title,relation:'sourceRuleId'});
  }
  const glossary={schema:'army-book-glossary/v2',authority:'DISPOSABLE_PROJECTION',entries:index};
  validateGlossary(glossary,cards);
  return {cards,index:glossary,counts:globalGlossaryCounts(corpus)};
}

export function globalGlossaryCounts(corpus) {
  const owners={},categories={};let mfm=0,total=0;
  for(const entry of corpus.entries) {
    const owner=entry.sourceOwner.bookId||entry.domain;
    const add=category=>{total++;owners[owner]=(owners[owner]||0)+1;const key=`${entry.domain}:${category}`;categories[key]=(categories[key]||0)+1;};
    add(entry.presentation?.referenceCategory||entry.recordType);
    for(const field of entry.presentation?.referenceFields||[])add(field.category);
    if(entry.mfm)mfm++;
  }
  return {total,sourceEntries:corpus.entries.length,owners,categories,mfm};
}

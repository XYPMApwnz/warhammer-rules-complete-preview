import {createGlobalGlossaryContent} from './global-glossary-content.mjs';
import {validateGlossary} from './glossary.mjs';

const human=value=>String(value||'Reference').replace(/[-_]/g,' ').replace(/\b\w/g,c=>c.toUpperCase());
const escape=value=>String(value).replaceAll('~','~0').replaceAll('/','~1');

/** Display adapter only. The enrolled global corpus remains unchanged and authoritative. */
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
  const cards=[],index=[];
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
      provenance:entry.provenance,sourceParentId:entry.parent?.canonicalId||null,
      contextRegistryIds:(entry.contexts||[]).map(context=>context.effectiveBookId),
      contextParentIds:(entry.contexts||[]).map(context=>context.parentUnitId).filter(Boolean),referenceVisuals:content.structured});
    const aliases=[...(entry.aliases||[])].filter(Boolean).map(label=>({label,presentationOnly:true,match:'EXACT'}));
    const termId=entry.facts?.termId;
    if(!entry.parent&&compatibilityKeys.get(termId)?.size===1&&(!exactKeys.has(termId)||[...exactKeys.get(termId)].every(id=>id===entry.id)))aliases.push({label:termId,presentationOnly:true,match:'EXACT'});
    for(const label of entry.presentation?.preferredMatchLabels||[])if(label)aliases.push({label,presentationOnly:true,match:'NORMALIZED'});
    index.push({targetId:entry.id,label:entry.label,category:entry.recordType,
      contextLabel:registryLabels[registryId]||({CORE:'Core Rules',MISSIONS:'Missions',MFM:'Munitorum Field Manual'}[entry.domain])||human(registryId),
      aliases});
  }
  const glossary={schema:'army-book-glossary/v2',authority:'DISPOSABLE_PROJECTION',entries:index};
  validateGlossary(glossary,cards);
  return {cards,index:glossary,counts:globalGlossaryCounts(corpus)};
}

export function globalGlossaryCounts(corpus) {
  const owners={},categories={};let mfm=0;
  for(const entry of corpus.entries) {
    const owner=entry.sourceOwner.bookId||entry.domain;
    owners[owner]=(owners[owner]||0)+1;categories[`${entry.domain}:${entry.recordType}`]=(categories[`${entry.domain}:${entry.recordType}`]||0)+1;
    if(entry.mfm)mfm++;
  }
  return {total:corpus.entries.length,owners,categories,mfm};
}

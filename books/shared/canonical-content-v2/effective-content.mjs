import {createHash} from 'node:crypto';

const clone=value=>structuredClone(value);
const hash=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
const sameSet=(left=[],right=[])=>left.length===right.length&&left.every(value=>right.includes(value));
export const SOURCE_CONFLICT_STATUS='UNRESOLVED_ACCEPTED_SOURCE_CONFLICT';

// Formatting equivalence only: retain punctuation, values, and reference codes.
export const normalizeFaqPayload=value=>String(value||'').normalize('NFKC')
  .replace(/[‘’]/g,"'").replace(/[“”]/g,'"').replace(/[–—]/g,'-')
  .replace(/•\s*/g,'').replace(/([.!?;:])(?=[A-Za-z])/g,'$1 ')
  .replace(/([A-Za-z])\((\d+(?:\.\d+)+)\)/g,'$1 ($2)')
  .replace(/\s+/g,' ').trim().toLowerCase();
export const faqPresentationIdentity=faq=>`${normalizeFaqPayload(faq.question)}|${normalizeFaqPayload(faq.answer)}`;

function readPointer(value,pointer){
  if(pointer==='')return value;
  if(!pointer?.startsWith('/'))throw new Error(`Invalid source pointer: ${pointer}`);
  for(const key of pointer.slice(1).split('/').map(part=>part.replace(/~1/g,'/').replace(/~0/g,'~'))){
    if(value===null||typeof value!=='object'||!Object.hasOwn(value,key))throw new Error(`Missing bound source value: ${pointer}`);
    value=value[key];
  }
  return value;
}

function writePointer(value,pointer,next){
  const split=pointer.lastIndexOf('/'),parent=readPointer(value,pointer.slice(0,split));
  const key=pointer.slice(split+1).replace(/~1/g,'/').replace(/~0/g,'~');
  if(!Object.hasOwn(parent,key))throw new Error(`Missing effective edit target: ${pointer}`);
  parent[key]=clone(next);
}

function boundSource(binding,{sourceRecords,sourceUnits}){
  let source,contentHash;
  if(binding.recordId){
    source=sourceRecords.get(binding.recordId);
    contentHash=source?.provenance?.sourceContentHash;
  }else{
    const unit=sourceUnits.get(binding.unitId);
    source=binding.sourceOrder===undefined?unit:unit?.occurrences?.find(item=>item.sourceOrder===binding.sourceOrder);
    contentHash=source?.content?.contentHash||source?.contentHash;
  }
  if(!source||contentHash!==binding.contentHash)throw new Error('Stale or missing effective source binding');
  return {source,value:readPointer(source,binding.path)};
}

function stageFromSource(stage,content){
  const prefix=`${stage.label}:`;
  if(!content.text?.startsWith(prefix)||content.lists?.length!==1)throw new Error('Invalid bound source stage');
  const items=content.lists[0].items;
  if(!items.length)throw new Error('Empty bound source stage');
  const body=content.text.slice(prefix.length).trim();
  const first=body.indexOf(items[0]),last=body.lastIndexOf(items.at(-1));
  if(first<0||last<first||body.slice(first,last+items.at(-1).length)!==items.join(''))throw new Error('Ambiguous bound source stage list');
  return {...stage,text:body.slice(0,first).trim(),items:clone(items),afterText:body.slice(last+items.at(-1).length).trim()};
}

export function applySourceBoundEdits(records,bindings,context){
  const result=clone(records),byId=new Map(result.map(record=>[record.id,record]));
  for(const edit of bindings){
    const record=byId.get(edit.targetRuleId);
    if(!record)throw new Error(`Unknown effective edit owner: ${edit.targetRuleId}`);
    const previous=readPointer(record,edit.targetPath);
    if(hash(previous)!==edit.previousHash)throw new Error(`Changed effective edit anchor: ${edit.targetRuleId}`);
    const {source,value}=boundSource(edit.source,context);
    let next;
    if(edit.operation==='REPLACE_STAGE')next=stageFromSource(previous,value);
    else if(edit.operation==='REPLACE_VALUE'){
      next=value;
      if(edit.preservePrefixThrough){
        const end=previous.indexOf(edit.preservePrefixThrough);
        if(end<0)throw new Error('Missing effective edit label prefix');
        next=previous.slice(0,end+edit.preservePrefixThrough.length)+value;
      }
    }else throw new Error(`Unknown effective edit operation: ${edit.operation}`);
    writePointer(record,edit.targetPath,next);
    record.provenance.effectiveSourceBindings=[...(record.provenance.effectiveSourceBindings||[]),{
      operation:edit.operation,targetPath:edit.targetPath,source:clone(edit.source),
      ...(source.id?{sourceRecordId:source.id}:{}),before:clone(previous),effective:clone(next)
    }];
  }
  return result;
}

export function normalizeFaqOwnership(faqs,bindings){
  const byId=new Map(bindings.map(binding=>[binding.faqId,binding]));
  return faqs.map(input=>{
    const faq=clone(input),binding=byId.get(faq.id);
    if(binding){
      if(faq.provenance.sourceContentHash!==binding.sourceContentHash)throw new Error(`Stale FAQ ownership evidence: ${faq.id}`);
      delete faq.primaryRule;
      delete faq.relationships.primaryRuleId;
      if(binding.primaryRuleId)faq.relationships.primaryRuleId=binding.primaryRuleId;
      faq.relationships.relatedRuleIds=clone(binding.relatedRuleIds||[]);
      faq.provenance.relationshipBinding={sourceUnitId:faq.provenance.sourceUnitId,sourceContentHash:binding.sourceContentHash,evidence:clone(binding.evidence),primaryEstablished:!!binding.primaryRuleId};
    }
    faq.presentationIdentity=faqPresentationIdentity(faq);
    return faq;
  });
}

export function validateFaqOwnership(faqs,bindings){
  for(const binding of bindings){
    const faq=faqs.find(record=>record.id===binding.faqId);
    if(!faq||faq.relationships.primaryRuleId!==binding.primaryRuleId||!sameSet(faq.relationships.relatedRuleIds||[],binding.relatedRuleIds||[]))throw new Error(`Invalid source-bound FAQ ownership: ${binding.faqId}`);
    if(faq.provenance.sourceContentHash!==binding.sourceContentHash)throw new Error(`Changed FAQ source evidence: ${binding.faqId}`);
    if(!binding.primaryRuleId&&faq.primaryRule!==undefined)throw new Error(`Invented FAQ primary owner: ${binding.faqId}`);
  }
}

export function separateEmbeddedFaqPanels(records,faqs){
  const groups=new Map();
  for(const faq of faqs){const key=faqPresentationIdentity(faq);groups.set(key,[...(groups.get(key)||[]),faq.id]);}
  return records.map(input=>{
    const record=clone(input);
    if(typeof record.text!=='string')return record;
    const marker=/(?:\n)?FAQ\n(?:Show\n)?(?=Q:)/.exec(record.text);
    if(!marker)return record;
    const panel=record.text.slice(marker.index+marker[0].length),matches=[...panel.matchAll(/Q:\s*([\s\S]*?)\s*A:\s*([\s\S]*?)(?=\nQ:|$)/g)];
    if(!matches.length)throw new Error(`Unbound embedded FAQ panel: ${record.id}`);
    const ids=matches.flatMap(match=>{
      const key=faqPresentationIdentity({question:match[1],answer:match[2]}),owners=groups.get(key);
      if(!owners)throw new Error(`Unbound embedded FAQ payload: ${record.id}`);
      return owners;
    });
    record.text=record.text.slice(0,marker.index).trimEnd();
    record.relationships.faqIds=[...new Set([...(record.relationships.faqIds||[]),...ids])];
    return record;
  });
}

export function separateAppliedErrataPanels(records,errata){
  return records.map(input=>{
    const record=clone(input);
    if(typeof record.text!=='string')return record;
    const marker=/\nErrata\n/.exec(record.text);
    if(!marker)return record;
    const before=record.text.slice(0,marker.index),panel=record.text.slice(marker.index);
    const applied=errata.filter(item=>item.relationships.targetRuleId===record.id&&item.semanticContent&&normalizeFaqPayload(panel).includes(normalizeFaqPayload(item.semanticContent))&&normalizeFaqPayload(before).includes(normalizeFaqPayload(item.semanticContent)));
    if(applied.length){record.text=before.trimEnd();record.relationships.errataIds=[...new Set([...(record.relationships.errataIds||[]),...applied.map(item=>item.id)])];}
    return record;
  });
}

function conflictOccurrences(binding,sourceUnits){
  return binding.occurrences.map(reference=>{
    const unit=sourceUnits.get(reference.sourceUnitId),occurrence=unit?.occurrences?.find(item=>item.sourceOrder===reference.sourceOrder);
    if(!occurrence||occurrence.content.contentHash!==reference.contentHash)throw new Error(`Stale source conflict evidence: ${binding.targetRuleId}`);
    let text=occurrence.content.text;
    // Source extraction may retain whitespace between a heading and its code.
    const heading=new RegExp('^'+occurrence.title.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'\\s*'+unit.code.replaceAll('.','\\.'));
    text=text.replace(heading,'').trim().replace(/([.!?])(?=[A-Z])/g,'$1\n');
    for(const list of occurrence.content.lists||[])for(const item of list.items)text=text.replace(item,`\n• ${item}\n`);
    return {...clone(reference),title:occurrence.title,content:clone(occurrence.content),presentationText:text};
  });
}

export function applySourceConflicts(records,bindings,{sourceUnits,adjudications=[]}){
  const byId=new Map(bindings.map(binding=>[binding.targetRuleId,binding]));
  return records.map(input=>{
    const record=clone(input),binding=byId.get(record.id);
    if(!binding)return record;
    if(adjudications.some(item=>item.targetRuleId===record.id))throw new Error('Source conflict resolution requires an explicitly updated accepted binding');
    record.state='SOURCE_CONFLICT';record.semanticContent=null;record.evidenceStatus=SOURCE_CONFLICT_STATUS;
    delete record.text;delete record.content;delete record.sourceStructure;
    record.sourceConflict={status:SOURCE_CONFLICT_STATUS,occurrences:conflictOccurrences(binding,sourceUnits)};
    record.sourceConflict.notice=sourceConflictNotice(record);
    return record;
  });
}

export function validateSourceConflicts(records,bindings,{sourceUnits}){
  for(const binding of bindings){
    const record=records.find(item=>item.id===binding.targetRuleId),expected=conflictOccurrences(binding,sourceUnits);
    if(!record||record.state!=='SOURCE_CONFLICT'||record.semanticContent!==null||record.text!==undefined||record.content!==undefined||record.evidenceStatus!==SOURCE_CONFLICT_STATUS||record.sourceConflict?.status!==SOURCE_CONFLICT_STATUS)throw new Error(`Source conflict silently adjudicated: ${binding.targetRuleId}`);
    if(JSON.stringify(record.sourceConflict.occurrences)!==JSON.stringify(expected))throw new Error(`Source conflict variants changed: ${binding.targetRuleId}`);
    if(record.sourceConflict.notice!==sourceConflictNotice(record))throw new Error(`Source conflict warning changed: ${binding.targetRuleId}`);
  }
}

export function sourceConflictNotice(record){
  if(record.sourceConflict?.status!==SOURCE_CONFLICT_STATUS)return '';
  return 'Unresolved accepted-source conflict. The enrolled sources contain different versions of this rule. No version has been established as current; consult the source variants in the full rule.';
}

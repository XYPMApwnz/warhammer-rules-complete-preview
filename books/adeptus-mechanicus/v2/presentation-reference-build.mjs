import {prepareSourceProducer} from '../../shared/source-refs-v2/producer-io.mjs';
import {buildGlossary} from '../../shared/army-book-app-v2/glossary.mjs';

// Book-owned source-occurrence bindings. Labels remain canonical source facts;
// these declarations select existing definition owners, never copy definitions.
export const REFERENCE_SCHEMA='army-book-app-v2/datasheet-reference-bindings/v1';
export const sourceReferenceTargets=Object.freeze({
  '#tooltip_content00061':{group:'CORE ABILITIES',targetId:'core-deadly-demise'},
  '#tooltip_content00091':{group:'CORE ABILITIES',targetId:'core-deep-strike'},
  '#tooltip_content00193':{group:'CORE ABILITIES',targetId:'core-hover'},
  '#tooltip_content00037':{group:'CORE ABILITIES',targetId:'core-feel-no-pain'},
  '#tooltip_content00212':{group:'CORE ABILITIES',targetId:'core-support'},
  '#tooltip_content00035':{group:'CORE ABILITIES',targetId:'core-scouts'},
  '#tooltip_content00034':{group:'CORE ABILITIES',targetId:'core-infiltrators'},
  '#tooltip_content00006':{group:'CORE ABILITIES',targetId:'core-stealth'},
  '#tooltip_content00056':{group:'CORE ABILITIES',targetId:'core-firing-deck'},
  '#tooltip_content00071':{group:'CORE ABILITIES',targetId:'core-lone-operative'},
  '#tooltip_content00096':{group:'CORE ABILITIES',targetId:'core-leader'},
  '#tooltip_content00094':{group:'ARMY RULES',targetId:'army-rule-doctrina-imperatives'}
});

// Typed presentation parameters of canonical source occurrences. These bindings
// do not change their source label or define an ability/effect at runtime.
const referenceParameters=Object.freeze({
  'datasheet-archaeopter-fusilave:rule-reference:1:entry:1:1':{value:'D3'},
  'datasheet-archaeopter-stratoraptor:rule-reference:1:entry:1:1':{value:'D3'},
  'datasheet-archaeopter-transvector:rule-reference:1:entry:1:1':{value:'D3'},
  'datasheet-corpuscarii-electro-priests:rule-reference:1:entry:1:1':{value:5},
  'datasheet-fulgurite-electro-priests:rule-reference:1:entry:1:1':{value:5},
  'datasheet-ironstrider-ballistarii:rule-reference:1:entry:1:1':{value:1},
  'datasheet-kastelan-robots:rule-reference:1:entry:1:1':{value:1},
  'datasheet-onager-dunecrawler:rule-reference:1:entry:1:1':{value:'D3'},
  'datasheet-serberys-raiders:rule-reference:1:entry:1:1':{distance:9},
  'datasheet-skitarii-rangers:rule-reference:1:entry:1:1':{distance:6},
  'datasheet-skorpius-disintegrator:rule-reference:1:entry:1:1':{value:'D3'},
  'datasheet-skorpius-dunerider:rule-reference:1:entry:1:1':{value:'D3'},
  'datasheet-skorpius-dunerider:rule-reference:1:entry:1:2':{value:2},
  'datasheet-sydonian-dragoons-with-radium-jezzails:rule-reference:1:entry:1:1':{value:1},
  'datasheet-sydonian-dragoons-with-taser-lances:rule-reference:1:entry:1:1':{value:1}
});

/** Presentation-only canonical bindings over already projected V2 records.
 * Every field span refers to the original canonical entry label. Consumers
 * format structured groups directly; no source parsing occurs at runtime.
 */
export function buildPresentationReferences({model,cards,coreCatalog}) {
  if(!Array.isArray(model?.entities)||!Array.isArray(cards))throw new TypeError('Missing canonical presentation inputs');
  const {coreCards,coreFactManifest,index}=prepareSourceProducer(buildGlossary({model,coreCatalog}));
  const targets=new Map([...cards,...coreCards].map(card=>[card.id,card]));
  if(targets.size!==cards.length+coreCards.length)throw new Error('Duplicate canonical presentation identity');
  const fields={},entries={},seen=new Set();
  for(const reference of model.entities.filter(entity=>entity.kind==='RULE_REFERENCE')) {
    const card=targets.get(reference.id);
    if(card?.kind!=='RULE_REFERENCE')throw new Error(`Unresolved canonical reference owner: ${reference.id}`);
    reference.data.groups.forEach((group,g)=>group.entries.forEach((entry,e)=>{
      if(seen.has(entry.id))throw new Error(`Duplicate canonical reference entry: ${entry.id}`);
      seen.add(entry.id);
      const declared=entry.sourceTooltipIds.map(id=>sourceReferenceTargets[id]);
      if(!declared.length||declared.some(item=>!item))throw new Error(`Unbound source reference: ${entry.id}`);
      const ids=new Set(declared.map(item=>item.targetId));
      if(ids.size!==1||declared.some(item=>item.group!==group.label))throw new Error(`Ambiguous source reference: ${entry.id}`);
      const targetId=declared[0].targetId,target=targets.get(targetId);
      if(!target || (group.label==='CORE ABILITIES' ? target.domain!=='CORE' : target.kind!=='ARMY_RULE'))throw new Error(`Unavailable reference definition: ${targetId}`);
      const path=`/groups/${g}/entries/${e}/label`;
      const field=card.fields.find(item=>item.source?.entityId===reference.id&&item.source.path===path);
      if(!field||field.value!==entry.label||typeof field.value!=='string'||!field.value.length)throw new Error(`Reference label projection mismatch: ${entry.id}`);
      fields[field.id]=[{start:0,end:field.value.length,targetId,group:group.label,
        runtimeEntryId:entry.id,parameters:referenceParameters[entry.id]||{}}];
      entries[entry.id]={fieldId:field.id,targetId};
    }));
  }
  return {coreCards,coreFactManifest,glossaryIndex:index,
    referenceBindings:{schema:REFERENCE_SCHEMA,fields,entries}};
}

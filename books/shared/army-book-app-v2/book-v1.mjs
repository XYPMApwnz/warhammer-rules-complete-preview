/** Actual V1 book templates adapted to canonical V2 fields. Presentation only. */
import {hasSourceTableLayout, renderSourceTable} from './source-table.mjs';
const bookKinds = new Set(['BOOK_USAGE_RULES','BOOK_USAGE','ARMY_RULE','ARMY_RULE_COMPONENT',
  'DETACHMENT','DETACHMENT_RULE','ENHANCEMENT','STRATAGEM','SOURCE_ERRATUM','SOURCE_UPDATE_REFERENCE']);
const layoutPath=field=>field.presentationPath??field.source?.path;
const fieldAt = (card,path) => card.fields?.find(field=>layoutPath(field)===path);

export function createBookPresenter({document,payload,cards,el,factValue:makeFactValue,anchor,allowedIds,renderWeapon}) {
  const config=payload.bookPresentation;
  if(config?.schema!=='army-book-app-v2/book-v1-presentation')throw new TypeError('Missing book presentation projection');
  const records=config.records;
  const factValue=(tag,field)=>{const node=makeFactValue(tag,field);node.classList.remove('v2-field-value');node.classList.add('book-fact-value');return node;};
  const accepts=card=>bookKinds.has(card.kind);
  const identity=(node,card)=>{
    node.dataset.cardId=card.id;node.dataset.entityId=card.id;
    node.classList.add('v2-book-record','v2-kind-'+card.kind.replace(/_/g,'-'));
    return node;
  };
  const heading=(card,tag,className,{popup=false}={})=>{
    const field=card.fields.find(field=>field.presentation==='heading'||field.type==='heading');
    const node=el(tag,className);
    if(field){const value=factValue('span',field);if(popup)node.append(value);else{const link=anchor('',card.id,true);link.className='term-button v2-reference';link.append(value);node.append(link);}}
    else node.textContent=card.title;
    return node;
  };
  const sourceFooter=(card,node)=>{
    const metadata=records[card.id]||card;
    const sources=[metadata.provenance,...Object.values(metadata.fieldProvenance||{})].filter(Boolean);
    const ids=[...new Set(sources.flatMap(source=>[source.sourceId||source.base?.sourceId]).filter(Boolean))];
    if(!ids.length)return;
    node.dataset.sourceIds=JSON.stringify(ids);
  };
  const paragraph=(node,field,className='content-block')=>{
    const block=el('div',className);block.append(factValue('p',field));node.append(block);
  };
  const textPresentation=(card,field)=>{
    // A source capture can contain a flattened table occurrence in its prose
    // as well as typed cells. Suppress only a complete duplicate display line;
    // keep the original fact/value/provenance and every structured cell intact.
    const tables=new Map();
    for(const cell of card.fields.filter(item=>item.presentation==='table-cell')){
      const cells=tables.get(cell.table.id)||[];cells.push(cell);tables.set(cell.table.id,cells);
    }
    const echoes=new Set([...tables.values()].map(cells=>cells.sort((a,b)=>a.table.row-b.table.row||a.table.column-b.table.column).map(cell=>String(cell.value)).join('')));
    const text=field.displayValue??field.value;
    if(typeof text!=='string'||!echoes.size)return field;
    const lines=text.split('\n'),kept=lines.filter(line=>!echoes.has(line.trim()));
    return kept.length===lines.length?field:{...field,displayValue:kept.join('\n')};
  };
  const appendText=(node,card)=>{
    for(const field of card.fields.filter(field=>layoutPath(field)==='/text'||layoutPath(field)==='/semanticContent'||/^\/clauses\/\d+\/text$/.test(layoutPath(field)||'')))paragraph(node,textPresentation(card,field));
    // Tables are already atomized into canonical fields. No source/title parsing.
    const groups=new Map();
    for(const field of card.fields.filter(field=>field.presentation==='table-cell')){
      const key=field.table.id;if(!groups.has(key))groups.set(key,[]);groups.get(key).push(field);
    }
    for(const fields of groups.values()){
      const metadata=records[card.id]?.tables?.find(item=>item.path===fields[0].table.path||item.id===fields[0].table.id);
      if(hasSourceTableLayout(fields)){
        node.append(renderSourceTable({el,fields,factValue,metadata,className:'data-table'}));continue;
      }
      const table=el('div','data-table');table.setAttribute('role','table');
      if(metadata?.columns?.length){const header=el('div','data-row data-head');header.setAttribute('role','row');for(const name of metadata.columns){const cell=el('div','',name);cell.setAttribute('role','columnheader');header.append(cell);}table.append(header);}
      const rows=new Map();for(const field of fields){if(!rows.has(field.table.row))rows.set(field.table.row,[]);rows.get(field.table.row).push(field);}
      for(const rowFields of rows.values()){const row=el('div','data-row');row.setAttribute('role','row');for(const field of rowFields.sort((a,b)=>a.table.column-b.table.column)){const cell=el('div');cell.setAttribute('role','cell');cell.append(factValue('span',field));if(field.visual){const image=el('img');Object.assign(image,field.visual);image.src=field.visual.url;cell.append(image);}row.append(cell);}table.append(row);}
      node.append(table);
    }
  };
  const visible=id=>!allowedIds()||allowedIds().has(id);
  const pointCard=id=>{if(!id||!cards.has(id))throw new TypeError('Unresolved book points identity');return cards.get(id);};
  const cost=(record,header)=>{
    if(!record?.pointRecordId)return;
    const card=pointCard(record.pointRecordId),field=fieldAt(card,'/value');
    if(!field)throw new TypeError('Missing bound Enhancement cost');
    const span=identity(el('span','enhancement-cost'),card);span.classList.remove('v2-book-record');span.append(document.createTextNode(' – '),factValue('span',field),document.createTextNode(' pts'));header.append(span);
  };
  const renderStratagem=(card,options)=>{
    const node=identity(el('article','stratagem surface'),card),record=records[card.id];
    const head=el('div','stratagem-head'),label=el('div');label.append(heading(card,'h3','',options));
    const category=fieldAt(card,'/category');if(category){label.append(factValue('span',category));node.dataset.sourceCategory=category.value;}
    label.lastChild?.classList.add('stratagem-type');
    const cp=fieldAt(card,'/cp');if(!cp)throw new TypeError('Missing structured Stratagem CP');
    const diamond=el('div','cp');diamond.append(factValue('span',cp));head.append(label,diamond);node.append(head);
    for(const field of card.fields.filter(field=>/^\/lines\/\d+\/text$/.test(field.source?.path||''))){
      const line=el('p','field'),caption=card.fields.find(item=>item.id===field.captionFactId);
      if(!caption)throw new TypeError('Missing structured Stratagem field label');
      line.append(factValue('b',caption),el('br'),factValue('span',field));node.append(line);
    }
    if(options.popup)sourceFooter(card,node);return node;
  };
  const renderEnhancement=(card,options)=>{
    const node=identity(el('article','enhancement surface'),card),record=records[card.id];
    const sourceType=fieldAt(card,'/sourceTypeLabel');
    if(sourceType){const label=factValue('div',sourceType);label.classList.add('eyebrow');node.append(label);}else node.append(el('div','eyebrow','Enhancement'));
    const title=heading(card,'h4','',options);cost(record,title);node.append(title);
    appendText(node,card);
    // Effective inventory already renders contributed weapons with their final
    // values and quantities. Inline rules must not repeat base weapon profiles.
    if(!options.inline)for(const id of card.children.filter(id=>cards.get(id)?.kind==='WEAPON_PROFILE'))node.append(renderWeapon(cards.get(id),{popup:true}));
    if(options.popup||options.inline)sourceFooter(card,node);return node;
  };
  const renderRule=(card,options)=>{
    const ability=card.kind==='DETACHMENT_RULE';
    const node=identity(el('article',ability?'ability':'rule-card surface'),card);
    // Named rule tables already contain their source heading in a bound cell.
    if(card.kind!=='STRUCTURED_RULE_TABLE')node.append(heading(card,ability?'h5':'h3','',options));
    if(ability){const text=fieldAt(card,'/text');if(text)node.append(factValue('p',textPresentation(card,text)));appendText(node,{...card,fields:card.fields.filter(field=>field.source?.path!=='/text')});}
    else appendText(node,card);
    if(card.kind==='SOURCE_UPDATE_REFERENCE'){
      const page=fieldAt(card,'/page');if(page){const line=el('p','source-note');line.append(document.createTextNode('Official update · Page '),factValue('span',page));node.append(line);}
      const targets=el('p','book-rule-references');
      for(const field of card.fields.filter(field=>/^\/targetIds\/\d+$/.test(field.source?.path||''))){const link=anchor('',field.targetIds[0],true);link.append(factValue('span',field));targets.append(link,document.createTextNode(' '));}node.append(targets);
    }
    if(card.links?.length){const links=el('p','book-rule-references');for(const link of card.links.filter(link=>visible(link.targetId))){links.append(anchor(link.label||cards.get(link.targetId).title,link.targetId,true),document.createTextNode(' '));}node.append(links);}
    if(options.popup||options.inline||card.kind==='SOURCE_ERRATUM')sourceFooter(card,node);return node;
  };
  const part=(card,kind,title,ids,options)=>{
    const section=el('section','detachment-part');
    const heading=el('h4','detachment-part-title',title);heading.dataset.contentsTarget='nav:'+card.id+':'+kind;section.append(heading);
    const body=el('div','detachment-content'+(kind==='STRATAGEM'?' stratagem-grid':''));
    for(const id of ids.filter(visible)){const child=cards.get(id);if(!child||child.kind!==kind)throw new TypeError('Invalid book part identity');body.append(render(child,options));}section.append(body);return section;
  };
  const renderDetachment=(card,options)=>{
    const record=records[card.id];if(!record)throw new TypeError('Missing typed Detachment presentation');
    const node=identity(el('section','content-group detachment'),card),title=heading(card,'h3','category-title detachment-title',options);
    if(record.detachmentPoints){const owner=pointCard(record.pointRecordId);const badge=identity(el('span','detachment-dp'),owner);badge.append(factValue('span',record.detachmentPoints),document.createTextNode('DP'));title.append(badge);}node.append(title);
    if(record.forceDispositions?.length){const p=el('p','force-disposition','Force Disposition: ');record.forceDispositions.forEach((binding,index)=>{if(index)p.append(document.createTextNode(' / '));const owner=pointCard(record.pointRecordId);const node=identity(el('span'),owner);node.append(factValue('span',binding));p.append(node);});node.append(p);}
    if(record.qualifiers?.length){
      const line=el('p','detachment-qualifiers'),owner=pointCard(record.pointRecordId);
      for(const [index,qualifier]of record.qualifiers.entries()){
        if(index)line.append(document.createTextNode(' · '));
        const item=identity(el('span'),owner);
        const label=String(qualifier.kind.value).toLowerCase().replace(/(^|_)(\w)/g,(_,separator,letter)=>(separator?' ':'')+letter.toUpperCase());
        item.append(factValue('span',{...qualifier.kind,displayValue:label}),document.createTextNode(': '),factValue('span',qualifier.value));line.append(item);
      }
      node.append(line);
    }
    const ruleIds=record.ruleIds||[record.ruleId].filter(Boolean);
    if(ruleIds.some(visible))node.append(part(card,'DETACHMENT_RULE',ruleIds.length>1?'Detachment Rules':'Detachment Rule – '+cards.get(record.ruleId).title,ruleIds,options));
    if(record.enhancementIds?.some(visible))node.append(part(card,'ENHANCEMENT','Enhancements',record.enhancementIds,options));
    if(record.stratagemIds?.some(visible))node.append(part(card,'STRATAGEM','Stratagems',record.stratagemIds,options));
    sourceFooter(card,node);return node;
  };
  const renderContentGroup=(card,options)=>{
    const node=identity(el('section','content-group'),card);node.append(heading(card,'h3','category-title',options));
    const text=el('div','rule-card surface');appendText(text,card);if(text.childNodes.length)node.append(text);
    for(const id of records[card.id]?.componentIds||card.children.filter(id=>cards.get(id)?.kind==='ARMY_RULE_COMPONENT'))if(visible(id))node.append(renderRule(cards.get(id),options));
    sourceFooter(card,node);return node;
  };
  const render=(card,{inDialog=false,primaryDetail=true,inline=false}={})=>{
    if(!accepts(card)&&!(inline&&card.kind==='STRUCTURED_RULE_TABLE'))throw new TypeError('Unsupported book presentation kind '+card.kind);
    const options={popup:inDialog,inline};let node;
    if(card.kind==='STRATAGEM')node=renderStratagem(card,options);
    else if(card.kind==='ENHANCEMENT')node=renderEnhancement(card,options);
    else if(card.kind==='DETACHMENT')node=renderDetachment(card,options);
    else if(card.kind==='ARMY_RULE'||card.kind==='SOURCE_ERRATUM')node=renderContentGroup(card,options);
    else node=renderRule(card,options);
    if(inDialog&&primaryDetail){
      node.querySelector('h3,h4,h5')?.setAttribute('id','v2-detail-heading');
      const permalink=anchor('Open this entry',card.id);permalink.className='v2-permalink book-permalink';node.append(permalink);
    }
    return node;
  };
  return Object.freeze({accepts,render});
}

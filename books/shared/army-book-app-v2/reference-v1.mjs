/** Catalog articles and popups share this presentation, not generic record cards. */
export function createReferencePresenter({el,factValue,anchor,contract,cards,payload,allowedIds,renderWeapon,renderProfile}) {
  const value=(tag,field)=>{const node=factValue(tag,field);node.className='reference-fact';return node;};
  function render(id,{popup=false}={}) {
    const model=contract.resolve(id,allowedIds());
    if(!model)return el('p','v2-not-found','This reference is unavailable. Choose an entry from the Glossary.');
    const article=el('article','v1-reference-article');article.dataset.cardId=model.targetId;
    const target=cards.get(id);
    if(['PROFILE','WEAPON_PROFILE'].includes(target.kind)) {
      article.append(el('p','reference-context',`${model.category} · ${model.contextLabel}`),
        target.kind==='WEAPON_PROFILE'?renderWeapon(target,{popup:true}):renderProfile(target,{inDialog:true}));
      return article;
    }
    const header=el('header','reference-header');
    header.append(el('p','reference-context',`${model.category} · ${model.contextLabel}`));
    const title=model.titleField?value(popup?'h2':'h1',model.titleField):el(popup?'h2':'h1','',model.title);
    title.classList.add('reference-title');if(popup)title.id='v2-detail-heading';header.append(title);
    const pointId=payload.bookPresentation?.records[id]?.pointRecordId;
    const point=cards.get(pointId)?.fields.find(field=>field.source?.path==='/value');
    if(point){const cost=el('p','reference-cost');cost.dataset.cardId=pointId;cost.append(value('span',point),documentText(' pts'));header.append(cost);}
    article.append(header);
    for(const section of model.sections) {
      if(section.card.kind==='WEAPON_PROFILE'){article.append(renderWeapon(section.card,{popup:true}));continue;}
      const body=el('section','reference-definition');body.dataset.cardId=section.card.id;
      if(section.card.id!==id)body.append(el('h3','',section.card.title));
      const tables=new Map();
      for(const field of section.fields)if(field.presentation==='table-cell') {
        if(!tables.has(field.table.id))tables.set(field.table.id,[]);tables.get(field.table.id).push(field);
      }
      // Exact duplicate table capture lines are display-only, as in the V1 book.
      const echoes=new Set([...tables.values()].map(fields=>fields.toSorted((a,b)=>a.table.row-b.table.row||a.table.column-b.table.column).map(field=>String(field.value)).join('')));
      for(const field of section.fields) {
        if(field.presentation==='table-cell'||field.presentation==='caption'||/\/lines\/\d+\/label$/.test(field.source?.path || ''))continue;
        const paragraph=el('p');
        const caption=section.card.fields.find(item=>item.id===field.captionFactId);
        if(caption)paragraph.append(value('strong',caption),el('br'));
        else if(field.source?.path==='/cp')paragraph.append(documentText('CP: '));
        const display=typeof field.value==='string'&&echoes.size?{...field,displayValue:field.value.split('\n').filter(line=>!echoes.has(line.trim())).join('\n')}:field;
        paragraph.append(value('span',display));body.append(paragraph);
      }
      for(const fields of tables.values()) {
        const wrap=el('div','reference-table'),table=el('table');
        const metadata=payload.bookPresentation?.records[section.card.id]?.tables?.find(item=>item.id===fields[0].table.id||item.path===fields[0].table.path);
        if(metadata?.columns){const head=el('thead'),row=el('tr');for(const label of metadata.columns)row.append(el('th','',label));head.append(row);table.append(head);}
        const rows=new Map();for(const field of fields){if(!rows.has(field.table.row))rows.set(field.table.row,[]);rows.get(field.table.row).push(field);}
        const tbody=el('tbody');for(const rowFields of rows.values()){const row=el('tr');for(const field of rowFields.toSorted((a,b)=>a.table.column-b.table.column)){const cell=el('td');cell.append(value('span',field));row.append(cell);}tbody.append(row);}table.append(tbody);wrap.append(table);body.append(wrap);
      }
      article.append(body);
    }
    if(model.references.length) {
      const related=el('nav','reference-links');related.setAttribute('aria-label','Related references');related.append(el('h3','','Related references'));
      for(const link of model.references)related.append(anchor(link.label,link.targetId,true,{reference:true}));article.append(related);
    }
    if(popup){const permalink=anchor('Open full entry',id,false,{reference:true});permalink.className='v2-permalink reference-permalink';article.append(permalink);}
    return article;
  }
  // Text nodes are created through the supplied DOM factory to keep testing portable.
  const documentText=text=>el('span','',text);
  return Object.freeze({render});
}

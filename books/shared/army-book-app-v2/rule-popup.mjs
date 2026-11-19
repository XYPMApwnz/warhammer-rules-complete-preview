/** Focused views of existing canonical fields. No rule/effect ownership is inferred. */
export const rulePopupKinds = new Set(['ABILITY','WARGEAR_ABILITY','DATASHEET_SECTION','SUPPLEMENTAL_DATASHEET_RULE','WARGEAR_OPTION','EQUIPMENT_RULE']);
const pathOf=field=>field.presentationPath??field.source?.path;
const prefix=text=>{const colon=text.indexOf(':');return colon>0&&colon<160?text.slice(0,colon):null;};
const key=text=>String(text||'').replace(/:\s*$/,'').trim().toLocaleLowerCase('en');
const ruleTextFields=card=>card.fields.filter(field=>typeof field.value==='string'&&field.value.trim()&&
  (/^\/blocks\/\d+\/text$/.test(pathOf(field)||'')||['/text','/semanticContent'].includes(pathOf(field))));

export function focusedRuleField(card,{fieldPath,label}={}) {
  if(!card||!rulePopupKinds.has(card.kind))return null;
  const fields=ruleTextFields(card);
  if(fieldPath){
    const matches=fields.filter(field=>field.source?.path===fieldPath||pathOf(field)===fieldPath);
    return matches.length===1?matches[0]:null;
  }
  const named=label&&fields.filter(field=>key(prefix(field.value))===key(label));
  return named?.length===1?named[0]:fields.length===1?fields[0]:null;
}

export function createRulePopupPresenter({document,cards,payload,el,factValue,anchor,linkTerms}) {
  function renderFields(card,fields,{wargear=false,originUnitId=null,reference=false,wholeSection=false}={}) {
    const field=fields[0];
    const markerFor=field=>card.fields.find(candidate=>candidate.source?.path===field.source?.path?.replace(/\/text$/,'/wargearAbility'));
    const marker=markerFor(field);
    const caption=prefix(field.value),splitCaption=caption&&(key(caption)===key(card.title)||
      /^\/blocks\/\d+\/text$/.test(field.source.path)&&typeof marker?.value==='boolean');
    const title=!wholeSection&&splitCaption?caption:card.title;
    const markers=fields.map(markerFor).map(marker=>marker?.value);
    const type=wargear||card.kind==='EQUIPMENT_RULE'?'Wargear':card.kind==='WARGEAR_ABILITY'||markers.every(value=>value===true)?'Wargear ability':
      wholeSection&&markers.some(value=>value===true)?'Datasheet section':'Datasheet ability';
    const article=el('article','v1-reference-article '+(wholeSection?'ds-rule-section':'ds-rule-popup'));article.dataset.cardId=card.id;
    if(wholeSection)article.dataset.ruleSectionFull='';else article.dataset.ruleFieldPath=pathOf(field);
    article.dataset.ruleType=type;
    article.append(el('p','reference-context',type));
    const heading=el('h2','reference-title',title);heading.id='v2-detail-heading';article.append(heading);
    const body=el('section','reference-definition');body.dataset.cardId=card.id;
    // Keep the exact canonical fact/value; only split its repeated caption.
    for(const source of fields){
      const paragraph=factValue('p',source);paragraph.classList.add('reference-fact');
      if(!wholeSection&&splitCaption)paragraph.textContent=source.value.slice(source.value.indexOf(':')+1).trimStart();
      body.append(paragraph);
    }
    for(const note of card.fields.filter(candidate=>/^\/qualifications\/\d+\/value\/sourceText$/.test(candidate.source?.path||''))) {
      const index=Number(note.source.path.split('/')[2]);
      const qualifier=card.fields.find(candidate=>candidate.source?.path===`/qualifications/${index}/field/0`);
      if(qualifier&&!fields.some(field=>field.source.path.split('/')[1]===qualifier.value))continue;
      body.append(factValue('p',note));
    }
    linkTerms?.(body);article.append(body);
    let owner=card,seen=new Set();
    while(owner?.parentId&&!seen.has(owner.id)&&owner.kind!=='DATASHEET'){seen.add(owner.id);owner=cards.get(owner.parentId);}
    if(owner?.kind==='DATASHEET'&&originUnitId&&owner.id!==originUnitId)article.append(el('p','ds-rule-popup-source','From '+owner.title));
    const link=anchor(reference?'Open in Glossary':'Open in Army Book',card.id,false,{...(!wholeSection?{fieldPath:pathOf(field)}:{}),...(reference?{reference:true}:{fullBook:true,contents:true})});
    link.className='v2-permalink reference-permalink';article.append(link);
    return article;
  }
  function render(card,options={}) {
    if(!rulePopupKinds.has(card.kind)||card.kind==='WARGEAR_OPTION')return null;
    const field=focusedRuleField(card,options);
    return field?renderFields(card,[field],options):null;
  }
  function renderSection(card,options={}) {
    if(!rulePopupKinds.has(card.kind)||card.kind==='WARGEAR_OPTION')return null;
    const fields=ruleTextFields(card);
    // An ambiguous name never chooses a sibling rule. Keep every canonical
    // text in the exact section, without rendering classification metadata.
    return fields.length?renderFields(card,fields,{...options,wholeSection:true}):null;
  }
  return Object.freeze({render,renderSection});
}

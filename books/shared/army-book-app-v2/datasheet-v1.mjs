/** V1 presentation contract over V2 records. No eligibility or effect execution. */
const sectionRoles = new Map([
  ['ABILITIES','abilities'],['WARGEAR ABILITIES','wargear-abilities'],
  ['UNIT COMPOSITION','composition'],['WARGEAR OPTIONS','wargear'],
  ['LEADER','leader'],['TRANSPORT','transport'],['DEPLOYMENT','deployment']
]);

/** Build-time layout metadata, keyed by existing identity; never a factual catalog. */
export function buildDatasheetPresentation(model, images) {
  const units = new Set(model.entities.filter(e=>e.kind==='DATASHEET').map(e=>e.id));
  const roles = {};
  for (const entity of model.entities) if (entity.kind==='DATASHEET_SECTION') {
    const label=entity.data.title;
    // Source section headings select formatting only. They never resolve a rule,
    // unit, effect, eligibility relation or other gameplay identity.
    roles[entity.id]=sectionRoles.get(label) || (label.startsWith('DAMAGED:')?'damaged':'additional');
  }
  return {schema:'army-book-app-v2/datasheet-layout',sectionRoles:roles,
    artwork:Object.fromEntries(Object.entries(images.units || {}).filter(([id])=>units.has(id)).map(([id,art])=>[id,
      {asset:art.asset,width:art.width,height:art.height,presentation:structuredClone(art.presentation)}]))};
}

// Formal weapon-ability codes have explicit Core targets. No glossary title
// search or prose matcher participates in resolution.
const coreTargets=Object.freeze({ASSAULT:'core-assault',HEAVY:'core-heavy',PISTOL:'core-pistol',TORRENT:'core-torrent',
  LETHAL_HITS:'core-lethal-hits',SUSTAINED_HITS:'core-sustained-hits',LANCE:'core-lance',
  DEVASTATING_WOUNDS:'core-devastating-wounds',PRECISION:'core-precision',BLAST:'core-blast',
  HAZARDOUS:'core-hazardous',IGNORES_COVER:'core-ignores-cover',TWIN_LINKED:'core-twin-linked',
  RAPID_FIRE:'core-rapid-fire',MELTA:'core-melta',EXTRA_ATTACKS:'core-extra-attacks',INDIRECT_FIRE:'core-indirect-fire',
  ONE_SHOT:'core-one-shot',ANTI:'core-anti'});
const abilityCode=value=>String(value).trim().toUpperCase().replace(/[\[\]]/g,'').replace(/\s+/g,'_').replace(/_(?:\d+\+?|D\d+)$/,'').replace(/^ANTI[-_].+$/,'ANTI');
const layoutPath=field=>field.presentationPath ?? field.source?.path;
const pointerKey=field=>layoutPath(field)?.slice(1).split('/')[0];
const single=(card,key)=>card.fields.find(f=>layoutPath(f)==='/'+key);
const domKey=value=>encodeURIComponent(value).replace(/%/g,'_');

export function createDatasheetPresenter({document,payload,cards,el,factValue,anchor,showDetail,related,roster,navigateSection}) {
  const config=payload.datasheetPresentation;
  const boundFields=new Map([...cards.values()].flatMap(card=>card.fields.map(field=>[field.id,field])));
  if (config?.schema!=='army-book-app-v2/datasheet-layout') throw new TypeError('Missing V2 datasheet layout metadata');
  const identity=(node,card,instanceId)=>{
    node.dataset.cardId=card.id;node.dataset.entityId=card.source?.entityId || card.id;node.dataset.v2EntityId=card.id;
    if(instanceId)node.dataset.rosterInstanceId=instanceId;
    if(card.scopeId)node.dataset.compositionId=card.scopeId;
    node.dataset.popupIdentity=JSON.stringify([card.id,instanceId || null,card.scopeId || null]);
    return node;
  };
  const scopedAnchor=(label,card,instanceId,fieldPath)=>{
    const link=el('a','term-button v2-reference',label);link.href='#'+encodeURIComponent(card.id);link.dataset.targetId=card.id;
    link.dataset.popupIdentity=JSON.stringify([card.id,instanceId || null,card.scopeId || null]);
    if(card.scopeId)link.dataset.compositionId=card.scopeId;
    link.addEventListener('click',event=>{if(event.button||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;event.preventDefault();showDetail(card.id,{scopeId:card.scopeId || null,fieldPath:fieldPath || null});});
    return link;
  };
  const heading=(card,tag='h4')=>{const field=card.fields.find(f=>f.presentation==='heading');return field?factValue(tag,field):el(tag,'',card.title);};
  const scopeCaption=card=>card.presentationScope
    ?`${card.presentationScope.label} · ${card.presentationScope.quantity} ${card.presentationScope.quantity===1?'model':'models'}`:null;
  const modifiers=(card,field,instanceId)=>{
    if(!instanceId)return null;
    const trace=roster.effective(instanceId).applied.filter(change=>change.operation==='MODIFY_STAT'&&change.field===pointerKey(field)&&
      (card.kind==='WEAPON_PROFILE'?change.targetWeaponProfileId===card.id:change.targetProfileId===card.id)&&
      (!card.scopeId || !change.targetCompositionId || change.targetCompositionId===card.scopeId));
    if(!trace.length)return null;
    // Only format an existing ordered numeric change trace. The final value is
    // always read from the effective record, never calculated here.
    const base=trace[0].before;
    if(!/^-?\d+(?:["+])?$/.test(String(base)))return null;
    const changes=trace.map(change=>Number.parseInt(change.after,10)-Number.parseInt(change.before,10));
    if(changes.some(Number.isNaN))return null;
    const text=String(base)+changes.map(value=>value<0?` − ${Math.abs(value)}`:` + ${value}`).join('');
    const node=el('small','ds-modifier-breakdown',text);node.dataset.rosterBaseValue=String(base);node.dataset.rosterModifier=String(changes.reduce((a,b)=>a+b,0));
    node.dataset.ruleIds=JSON.stringify(trace.map(change=>change.ruleId));return node;
  };
  const renderProfile=(card,{instanceId,inDialog=false}={})=>{
    const box=identity(el('div','model-profile'),card,instanceId),used=new Set();
    const caption=scopeCaption(card);if(caption)box.append(el('h5','ds-composition-scope',caption));
    const titleField=card.fields.find(f=>f.presentation==='heading');if(titleField){box.append(factValue('h5',titleField));used.add(titleField.id);}
    const line=el('div','statline');
    const labels={M:'M',T:'T',SV:'SV',W:'W',LD:'LD',OC:'OC',INSV:'INV'};
    for(const field of [...card.fields,...(card.profileFieldIds||[]).map(id=>boundFields.get(id))].filter(f=>Object.hasOwn(labels,pointerKey(f)))){
      const stat=el('div','stat');stat.append(el('b','',labels[pointerKey(field)]),factValue('span',field));
      const change=modifiers(card,field,instanceId);if(change)stat.append(change);line.append(stat);used.add(field.id);
    }
    box.append(line);
    for(const field of card.fields.filter(f=>f.source?.path.startsWith('/rosterAbilities/'))){const pill=el('div','ds-granted-ability');if(field.value?.value!==undefined)pill.append(el('b','',field.label.replace(/:\s*$/,'')+' '));pill.append(factValue('span',field));box.append(pill);used.add(field.id);}
    for(const field of card.fields.filter(f=>f.source?.path.startsWith('/rosterMetrics/'))){
      const metric=el('p','ds-effective-metric');metric.append(el('b','',field.label+': '),factValue('span',field));box.append(metric);
    }
    for(const id of card.children || []){
      const child=cards.get(id);
      if(child.kind==='MODEL_BASE'){
        const base=identity(el('div','profile-base'),child,instanceId);
        if(caption)base.append(el('span','ds-base-scope',caption+' · '));
        else if(titleField)base.append(factValue('span',titleField),document.createTextNode(' · '));
        base.append(el('b','','Base: '));
        base.append(factValue('span',single(child,'text')));box.append(base);
        for(const note of child.fields.filter(field=>/^\/notes\/\d+$/.test(field.source?.path||'')))base.append(document.createTextNode(' '),factValue('span',note));
      }
    }
    return box;
  };
  const renderWeapon=(card,{instanceId,popup=false}={})=>{
    const row=identity(el(popup?'article':'div',popup?'popup-weapon-profile':'weapon-row'),card,instanceId),used=new Set();
    if(!popup)row.setAttribute('role','row');
    const name=single(card,'name'),mode=single(card,'mode');
    const nameCell=el('div','weapon-name'),nameLine=el('div');nameCell.setAttribute('role','rowheader');const link=scopedAnchor('',card,instanceId);
    link.classList.add('weapon-button');link.classList.remove('v2-reference');
    if(name){link.append(factValue('span',name));used.add(name.id);}else link.textContent=card.title;
    nameLine.append(link);nameCell.append(nameLine);
    const caption=scopeCaption(card);if(caption)nameCell.append(el('small','ds-composition-scope',caption));
    const tags=el('div','weapon-tags');
    for(const field of card.fields.filter(f=>pointerKey(f)==='abilities'&&!(Array.isArray(f.value)&&!f.value.length))){
      const target=coreTargets[abilityCode(field.value)];const chip=target&&cards.has(target)?anchor('',target,true):el('span');
      chip.classList.add('tag','weapon-tag');chip.append(factValue('span',field));tags.append(chip);used.add(field.id);
    }
    nameCell.append(tags);
    if(card.rosterQuantity!==undefined)nameLine.append(el('small','ds-weapon-quantity',` ×${card.rosterQuantity}`));
    if(popup) {const h=el('h3');h.append(nameCell);row.append(h);}else row.append(nameCell);
    const fieldLabels={range:'Range',attacks:'A',skill:(mode?.value??card.weaponMode)==='melee'?'WS':'BS',strength:'S',ap:'AP',damage:'D'};
    let table,body;
    if(popup){table=el('table','popup-weapon-table');const head=el('tr');for(const label of Object.values(fieldLabels)){const th=el('th','',label);th.scope='col';head.append(th);}const thead=el('thead');thead.append(head);body=el('tr');const tbody=el('tbody');tbody.append(body);table.append(thead,tbody);}
    for(const [key,label] of Object.entries(fieldLabels)){
      const field=single(card,key);if(!field)throw new TypeError(`Missing typed weapon field ${card.id}/${key}`);
      const cell=el(popup?'td':'div');cell.dataset.label=label;
      if(!popup)cell.setAttribute('role','cell');
      const value=factValue('span',field);value.classList.add('ds-effective-value');cell.append(value);
      const change=modifiers(card,field,instanceId);if(change){cell.dataset.rosterBaseValue=change.dataset.rosterBaseValue;cell.dataset.rosterModifier=change.dataset.rosterModifier;cell.append(change);}
      (popup?body:row).append(cell);used.add(field.id);
    }
    if(popup)row.append(table);
    return row;
  };
  const renderSection=(card,{instanceId,inDialog=false}={})=>{
    const role=config.sectionRoles[card.id] || 'additional';
    const section=identity(el('section','unit-part'),card,instanceId);section.dataset.datasheetSection=role;
    section.id='ds-'+domKey(JSON.stringify([card.id,instanceId || null,card.scopeId || null]));
    const used=new Set();const title=card.fields.find(f=>f.presentation==='heading');section.append(heading(card));if(title)used.add(title.id);
    const list=el('div','ability-list');
    for(const field of card.fields.filter(f=>/^\/blocks\/\d+\/text$/.test(f.source?.path || ''))){
      const content=el(role==='abilities'||role==='wargear-abilities'?'article':'div',role==='abilities'||role==='wargear-abilities'?'ability':'content-block');
      identity(content,card,instanceId);content.dataset.sourceFieldPath=field.source.path;
      const value=factValue('p',field);
      if(role==='abilities'||role==='wargear-abilities'){
        // Split a display caption, retaining exactly the same factual string.
        const text=value.textContent,colon=text.indexOf(':');
        if(colon>0){value.replaceChildren();const label=scopedAnchor(text.slice(0,colon+1),card,instanceId,field.source.path);value.append(label,document.createTextNode(text.slice(colon+1)));}
      }
      content.append(value);used.add(field.id);
      list.append(content);
    }
    section.append(list);
    for(const id of card.referenceCardIds||[]){
      const reference=cards.get(id),line=identity(el('p','book-rule-references'),reference,instanceId);
      const role=single(reference,'roleHeading');if(role)line.append(factValue('b',role),document.createTextNode(': '));
      for(const field of reference.fields.filter(field=>/^\/references\/\d+\/targetId$/.test(field.source.path))){const link=anchor('',field.targetIds[0],true);link.append(factValue('span',field));line.append(link,document.createTextNode(' '));}section.append(line);
    }
    for(const field of card.fields.filter(f=>/^\/qualifications\/\d+\/value\/sourceText$/.test(f.source?.path || ''))){
      const note=el('aside','ds-source-update');note.append(el('b','','Rules update: '),factValue('p',field));section.append(note);
    }
    return section;
  };
  const renderRuleReference=(card,instanceId)=>{
    const node=identity(el('div','ability shared-abilities'),card,instanceId);
    const groups=card.fields.filter(field=>/^\/groups\/\d+\/label$/.test(field.source?.path||''));
    if(groups.length){
      for(const label of groups){
        const group=el('span','ability ds-shared-rule-group'),prefix=label.source.path.replace(/label$/,'');
        const caption=factValue('strong',label);caption.classList.add('ds-rule-reference-label');group.append(caption);
        for(const field of card.fields.filter(field=>field.source?.path.startsWith(prefix+'entries/')&&field.source.path.endsWith('/label'))){
          const bindings=config.referenceBindings?.fields?.[field.id];
          if(!bindings?.length)throw new TypeError('Unbound canonical rule reference: '+field.id);
          let cursor=0;const value=factValue('span',field);value.replaceChildren();
          for(const binding of bindings){value.append(document.createTextNode(field.value.slice(cursor,binding.start)),anchor(field.value.slice(binding.start,binding.end),binding.targetId,true));cursor=binding.end;}
          value.append(document.createTextNode(field.value.slice(cursor)));group.append(value,document.createTextNode(' '));
        }node.append(group);
      }return node;
    }
    for(const field of card.fields){const value=factValue('p',field);
      // Source markers format Core/Faction paragraphs only. No rule definition
      // or identity is looked up from their contents.
      if(field.source?.path==='/label'){
        const text=value.textContent,markers=['CORE ABILITIES','ARMY RULES'];value.replaceChildren();let offset=0;
        const starts=markers.map(marker=>({marker,start:text.indexOf(marker)})).filter(item=>item.start>=0).sort((a,b)=>a.start-b.start);
        starts.forEach(({marker,start},index)=>{
          if(start>offset)value.append(document.createTextNode(text.slice(offset,start)));
          const group=el('span','ability ds-shared-rule-group');
          group.id='ds-'+domKey(card.id)+(marker==='CORE ABILITIES'?'-ability-core':'-ability-faction');
          group.append(el('strong','ds-rule-reference-label',marker==='CORE ABILITIES'?'CORE':'FACTION'));
          const end=starts[index+1]?.start ?? text.length,body=text.slice(start+marker.length,end);
          // Identity is bound during build. Runtime only slices source spans.
          let cursor=start+marker.length;
          const bindings=config.referenceBindings?.fields?.[field.id] || [];
          for(const binding of bindings.filter(b=>b.start>=cursor&&b.end<=end)){
            group.append(document.createTextNode(text.slice(cursor,binding.start)),anchor(text.slice(binding.start,binding.end),binding.targetId,true));
            group.lastChild.classList.add('term-button');cursor=binding.end;
          }
          group.append(document.createTextNode(text.slice(cursor,end)));
          value.append(group);offset=end;
        });
        if(!starts.length)value.append(document.createTextNode(text));
      }
      node.append(value);
    }
    return node;
  };
  const renderDatasheet=(card,{variants=null,instanceId=null,inDialog=false}={})=>{
    const root=identity(el('article','unit-card surface v2-card v2-kind-DATASHEET'),card,instanceId),used=new Set();
    const children=(card.children || []).flatMap(id=>variants?.get(id) || [cards.get(id)]);
    const head=el('div','unit-header v2-card-header'),brand=el('div');brand.append(el('div','eyebrow',`${payload.book.title} · Datasheet`),heading(card,'h3'));head.append(brand);
    const title=card.fields.find(f=>f.presentation==='heading');if(title)used.add(title.id);
    const art=config.artwork[card.id];if(art){
      const background=art.presentation.mode==='background';root.classList.add(background?'has-unit-art-background':'has-unit-art');
      const figure=el('figure',background?'unit-art-background':'unit-art');figure.setAttribute('aria-hidden','true');
      for(const [device,settings] of Object.entries({desktop:art.presentation.desktop,phone:art.presentation.phone}))for(const [key,value] of Object.entries(settings))figure.style.setProperty(`--unit-art${background?'-background':''}${device==='phone'?'-phone':''}-${key}`,value);
      const img=el('img');img.src=`../${art.asset}`;img.width=art.width;img.height=art.height;img.alt='';img.loading='lazy';img.decoding='async';figure.append(img);head.append(figure);
    }
    const cost=el('div','points ds-cost'),costGrid=el('div','ds-cost-grid');
    for(const price of children.filter(c=>c.kind==='MFM_UNIT_POINTS')){
      const valueFields=price.fields.filter(f=>f.source?.path.endsWith('/value')||f.source?.path==='/value');
      const schedules=new Map(),schedulePaths=new Set(valueFields.map(f=>f.source.path.split('/entries/')[0]));
      for(const field of valueFields){
        const prefix=field.source.path.slice(0,-'value'.length),caption=price.fields.find(f=>f.source?.path===prefix+'sourceLabel');
        if(!caption)throw new TypeError('Unbound points count: '+field.id);
        const schedulePath=field.source.path.split('/entries/')[0];
        let container=costGrid;
        if(schedulePaths.size>1){
          if(!schedules.has(schedulePath)){
            const schedule=el('div','ds-cost-schedule'),label=price.fields.find(f=>f.source.path===schedulePath+'/sourceLabel');
            if(!label)throw new TypeError('Missing points tier: '+schedulePath);
            schedule.append(factValue('small',label));costGrid.append(schedule);schedules.set(schedulePath,schedule);
          }container=schedules.get(schedulePath);
        }
        const cell=identity(el('div','ds-cost-cell'),price,instanceId);cell.dataset.priceEntry=prefix;
        const value=el('strong');value.append(factValue('span',field),document.createTextNode(' pts'));
        cell.append(factValue('small',caption),value);container.append(cell);
      }
    }
    cost.append(costGrid);head.append(cost);root.append(head);
    const nav=el('div','local-nav');nav.setAttribute('role','navigation');nav.setAttribute('aria-label','Datasheet sections');root.append(nav);
    const part=(role,label)=>{const section=el('section','unit-part');section.dataset.datasheetSection=role;section.id='ds-'+domKey(JSON.stringify([card.id,instanceId,role]));section.append(el('h4','',label));return section;};
    const profile=part('profile','Profile & Weapons'),abilities=part('abilities','Abilities');
    for(const child of children.filter(c=>c.kind==='PROFILE')){
      const view=renderProfile(child,{instanceId,inDialog}),bases=[...view.querySelectorAll('.profile-base')];profile.append(view);
      for(const base of bases){const note=el('div','ds-base-note');note.append(base);profile.append(note);}
    }
    for(const mode of ['ranged','melee']){
      const weapons=children.filter(c=>c.kind==='WEAPON_PROFILE'&&single(c,'mode')?.value===mode);if(!weapons.length)continue;
      const group=el('div','weapon-group');group.append(el('h5','',mode==='ranged'?'Ranged Weapons':'Melee Weapons'));
      const grid=el('div','weapon-table');grid.setAttribute('role','table');grid.setAttribute('aria-label',`${mode} weapons`);
      const header=el('div','weapon-row weapon-head');header.setAttribute('role','row');for(const label of ['Weapon','Range','A',mode==='ranged'?'BS':'WS','S','AP','D'])header.append(el('div','',label));grid.append(header);
      weapons.forEach(weapon=>grid.append(renderWeapon(weapon,{instanceId})));group.append(grid);profile.append(group);
    }
    for(const child of children.filter(c=>c.kind==='WEAPON_PROFILE_SELECTION')){
      const instruction=identity(el('aside','ds-profile-selection'),child,instanceId);instruction.append(factValue('p',single(child,'text')));
      for(const field of child.fields.filter(f=>/\/(?:profileIds|weaponProfileIds)\/\d+$/.test(f.source.path))){
        // The binding is an explicit canonical reference, not a title join.
        const link=anchor('',field.targetIds[0],true);link.append(factValue('span',field));instruction.append(link,document.createTextNode(' · '));
      }profile.append(instruction);
    }
    const abilityList=el('div','ability-list');abilities.append(abilityList);
    for(const child of children.filter(c=>c.kind==='RULE_REFERENCE'))abilityList.append(renderRuleReference(child,instanceId));
    const rendered=new Set(children.filter(c=>['PROFILE','WEAPON_PROFILE','WEAPON_PROFILE_SELECTION','RULE_REFERENCE','MFM_UNIT_POINTS'].includes(c.kind)).map(c=>c.id));
    for(const child of children.filter(c=>config.sectionRoles[c.id]==='abilities')){
      const section=renderSection(child,{instanceId,inDialog}),items=[...section.querySelector('.ability-list').children];
      const titleField=child.fields.find(f=>f.presentation==='heading');if(titleField){const caption=factValue('span',titleField);caption.textContent='Abilities';abilities.querySelector('h4').replaceChildren(caption);}
      items.forEach(item=>abilityList.append(item));
      const updates=[...section.querySelectorAll('.ds-source-update')];abilityList.append(...updates);
      rendered.add(child.id);
    }
    root.append(profile,abilities);
    const options=children.filter(c=>c.kind==='WARGEAR_OPTION');
    if(options.length&&!instanceId){const section=part('wargear','Wargear Options');const list=el('ul');for(const child of options){const line=identity(el('li'),child,instanceId);line.append(factValue('span',single(child,'text')));list.append(line);rendered.add(child.id);}section.append(list);root.append(section);}
    for(const child of children.filter(c=>c.kind==='SUPPLEMENTAL_DATASHEET_RULE')){
      const item=identity(el('article','ability'),child,instanceId);item.append(factValue('p',single(child,'text')));abilityList.append(item);rendered.add(child.id);
    }
    for(const child of children.filter(c=>c.kind==='WARGEAR_FOOTNOTE')){const note=identity(el('p','ds-wargear-footnote'),child,instanceId);note.append(factValue('span',single(child,'text')));root.append(note);rendered.add(child.id);}
    const eligible=children.find(c=>c.kind==='MFM_LEADER_ELIGIBILITY');
    for(const child of children.filter(c=>!rendered.has(c.id))) {
      if(child.kind!=='DATASHEET_SECTION')continue;
      const role=config.sectionRoles[child.id];
      if(role==='leader'&&eligible){
        if(!instanceId){const leader=part('leader','Leader'),titleField=child.fields.find(f=>f.presentation==='heading');
          if(titleField){const title=factValue('span',titleField);title.textContent='Leader';leader.querySelector('h4').replaceChildren(title);}
          leader.append(el('p','','This model can be attached to the following units:'));
          const list=identity(el('ul'),eligible,instanceId);
          for(const field of eligible.fields.filter(f=>f.source.path.startsWith('/targetUnitReferenceIds/'))){const line=el('li'),link=anchor('',field.targetIds[0],true);link.append(factValue('span',field));line.append(link);list.append(line);}leader.append(list);
          // Attachment exceptions remain exact accepted source prose, once.
          for(const field of child.fields.filter(f=>/^\/blocks\/\d+\/text$/.test(f.source.path))){
            // Format the source list in its current MFM location; retain the
            // exact independent attachment exception paragraph, without joins.
            const exceptionText=String(field.value).split('\n').filter(line=>!line.startsWith('This model can be attached to the following unit')&&!line.startsWith('- ')).join('\n').trim();
            if(exceptionText){const paragraph=factValue('p',field);paragraph.textContent=exceptionText;leader.append(paragraph);}
          }root.append(leader);
        }
      }else if(role==='composition'&&instanceId){
        const composition=part('composition','Unit Composition'),unit=roster.state.units.find(u=>u.instanceId===instanceId);
        composition.append(el('p','',`${unit.startingStrength} ${unit.startingStrength===1?'model':'models'}`));root.append(composition);
      }else root.append(renderSection(child,{instanceId,inDialog}));
    }
    for(const child of children.filter(c=>c.kind==='MFM_PAID_UPGRADE')){
      const note=identity(el('p','ds-paid-upgrade'),child,instanceId);note.append(el('b','',child.title+': '),factValue('span',single(child,'value')),document.createTextNode(' pts '),factValue('span',single(child,'sourceLabel')));profile.append(note);
    }
    const keywords=part('keywords','Keywords');
    if(card.keywordGroups){for(const group of card.keywordGroups){
      const line=el('p'),label=card.fields.find(field=>field.id===group.labelFieldId);
      line.append(factValue('b',label),document.createTextNode(': '));
      group.fieldIds.forEach((id,index)=>{if(index)line.append(document.createTextNode(', '));line.append(factValue('span',card.fields.find(field=>field.id===id)));});keywords.append(line);
    }}else for(const [path,label] of [['keywords',instanceId?'Effective unit keywords':'Keywords'],['factionKeywords','Faction Keywords']]){
      const line=el('p');line.append(el('b','',label+': '));const fields=card.fields.filter(f=>f.source?.path.startsWith('/'+path+'/'));
      fields.forEach((field,index)=>{if(index)line.append(document.createTextNode(', '));line.append(factValue('span',field));});keywords.append(line);
    }root.append(keywords);
    const sections=[...root.children].filter(n=>n.classList.contains('unit-part'));
    for(const section of sections){const tab=el('button','local-tab',section.querySelector('h4')?.textContent || 'Section');tab.type='button';tab.dataset.datasheetTarget=section.id;tab.addEventListener('click',()=>{if(inDialog)section.scrollIntoView({block:'start'});else navigateSection(card.id,section,nav,instanceId);});nav.append(tab);}
    if(instanceId){const u=roster.state.units.find(u=>u.instanceId===instanceId),context=el('div','ds-roster-context');
      const assigned=roster.state.attachments.find(a=>a.leaderInstanceId===instanceId),members=roster.state.attachments.filter(a=>a.bodyguardInstanceId===instanceId);
      const name=id=>{const unit=roster.state.units.find(u=>u.instanceId===id),copies=roster.state.units.filter(u=>u.canonicalUnitId===unit.canonicalUnitId);return cards.get(unit.canonicalUnitId).title+(copies.length>1?` #${copies.findIndex(u=>u.instanceId===id)+1}`:'');};
      context.dataset.rosterContextInstanceId=instanceId;
      if(u.warlord)context.append(el('span','ds-roster-badge','Warlord'));
      u.enhancementIds.forEach(id=>context.append(anchor(cards.get(id).title,id,true)));
      if(assigned)context.append(el('p','',`Leading: ${name(assigned.bodyguardInstanceId)}`));
      for(const member of members)context.append(el('p','',`${member.role==='SUPPORT_EXCEPTION'?'Supported by':'Led by'} ${name(member.leaderInstanceId)}`));
      // Detachment selection lives in roster navigation, not repeated on each unit.
      head.after(context);
      const effects=roster.effective(instanceId),summary=el('article','ability ds-effect-summary');summary.append(el('h5','','Active roster effects'));
      const sources=new Map();for(const effect of effects.applied){const key=JSON.stringify([effect.ruleId,effect.sourceInstanceId,effect.sourceFields]);if(!sources.has(key))sources.set(key,effect);}
      for(const effect of sources.values()){
        const line=el('p');line.dataset.effectSourceRuleId=effect.ruleId;
        if(effect.sourceInstanceId)line.append(el('span','',name(effect.sourceInstanceId)+' → '));
        const source=cards.get(effect.ruleId),sourcePath=effect.sourceFields?.[0];
        const textField=sourcePath&&source.fields.find(f=>f.source.path==='/'+sourcePath.map(p=>String(p).replaceAll('~','~0').replaceAll('/','~1')).join('/'));
        const label=textField?.value.includes(':')?textField.value.slice(0,textField.value.indexOf(':')):
          source.kind==='DATASHEET_SECTION'?cards.get(source.parentId).title+' ability':source.title;
        line.append(scopedAnchor(label,source,instanceId,textField?.source.path));summary.append(line);
      }if(sources.size)abilityList.append(summary);
    }
    if(payload.relatedRules)root.append(related(card.id,instanceId));
    return root;
  };
  return {renderDatasheet,renderProfile,renderWeapon,renderSection};
}

(function(root){
  'use strict';
  const SCHEMA='wh40k-physical-unit-game-projection/v1';
  const list=value=>Array.isArray(value)?value:[];
  const unique=value=>[...new Set(list(value).filter(Boolean))];
  const directParts=card=>[...card.querySelectorAll('.unit-part')].filter(node=>node.closest('.unit-card')===card);
  const cardsIn=node=>[...(node?.matches?.('.unit-card')?[node]:[]),...node?.querySelectorAll?.('.unit-card')||[]];
  const currentRelation=relation=>relation?.certainty==='current'&&relation?.provenance?.kind==='explicit-roster-attachment';
  const exactGameUnit=(card,projection)=>projection?.game?.units?.find(unit=>unit.identity.instanceId===card.dataset.rosterInstance)||null;
  const partEnding=(card,suffix)=>directParts(card).find(part=>part.id.endsWith(suffix))||null;
  const element=(tag,className,text)=>{const node=document.createElement(tag);if(className)node.className=className;if(text!=null)node.textContent=text;return node;};
  const signed=value=>Number(value)>0?`+${value}`:String(value);

  function instanceTitle(instanceId,projection){
    const units=list(projection.game?.units),unit=units.find(item=>item.identity.instanceId===instanceId);if(!unit)return 'Roster unit';
    const copies=units.filter(item=>item.identity.canonicalDatasheetId===unit.identity.canonicalDatasheetId),index=copies.findIndex(item=>item.identity.instanceId===instanceId);
    return copies.length>1?`${unit.identity.canonicalTitle} · roster unit ${index+1}`:unit.identity.canonicalTitle;
  }
  function sourceTitle(effect,projection){
    const source=effect.source||{},catalog=projection.catalog||{};
    if(source.kind==='detachment')return list(catalog.detachments).find(item=>item.id===source.id)?.title||'Detachment';
    if(source.kind==='enhancement')return list(catalog.enhancements).find(item=>[item.id,item.ruleId,item.legacyKey].includes(source.id))?.title||'Enhancement';
    if(source.kind==='explicit-attachment')return source.ownerInstanceId?instanceTitle(source.ownerInstanceId,projection):'Explicit attachment';
    if(source.kind==='selected-wargear')return 'Selected wargear';
    if(source.kind==='datasheet')return source.ownerInstanceId?instanceTitle(source.ownerInstanceId,projection):'Datasheet';
    if(source.kind==='faction-rule')return 'Faction rule';
    return '';
  }
  function effectLabel(effect){
    if(effect.component==='ability'){if(effect.operation==='remove'&&effect.targetState!=='resolved')return'';const title=effect.title||'Granted ability';if(effect.operation==='add-range')return `${title} range ${effect.base}\" → ${effect.effective}\"`;return [effect.ruleTitle,effect.operation==='remove'?`${title} removed`:title].filter(Boolean).join(' · ');}
    if(effect.component==='keyword')return `${effect.targetId} ${effect.operation==='remove'?'removed':'added'}`;
    if(effect.component==='stat'){const conditional=effect.state==='conditional'||effect.certainty==='conditional'||Boolean(effect.condition);if(!conditional&&(effect.base==null||effect.effective==null||String(effect.base)===String(effect.effective)))return '';return effect.base!=null&&effect.effective!=null&&effect.base!==effect.effective?`${effect.targetId} ${effect.base} → ${effect.effective}`:`${effect.targetId} ${effect.operation==='set'?`set to ${effect.to}`:signed(effect.delta)}`;}
    if(effect.component==='weapon'&&effect.operation==='grant-tag'){const applied=(effect.targets||[]).some(target=>JSON.stringify(target?.base)!==JSON.stringify(target?.effective));if(!applied)return'';return `${effect.tag} · ${effect.targetId==='all'?'all weapons':`${effect.targetId} weapons`}`;}
    if(effect.component==='weapon'&&effect.operation==='add-stat'){const conditional=effect.state==='conditional'||effect.certainty==='unknown',applied=(effect.targets||[]).some(target=>target?.base!=null&&target?.effective!=null&&JSON.stringify(target.base)!==JSON.stringify(target.effective));if(!conditional&&!applied)return'';return `${effect.stat} ${signed(effect.delta)} · ${effect.targetId} weapons`;}
    if(effect.component==='weapon'&&effect.operation==='grant-profile')return 'Additional weapon profile';
    return '';
  }
  const activeEffect=effect=>(effect.state||'active')==='active'&&(effect.certainty||'current')==='current'&&effect.condition?.state!=='unknown';
  function markChange(host,base,effective){if(!host||base==null||effective==null||String(base)===String(effective))return;host.querySelector(':scope > .roster-game-change')?.remove();host.append(element('small','roster-game-change',`${base} → ${effective}`));}
  function applyEffectiveStats(card,gameUnit,projection){const stats=gameUnit.effective?.stats||{};for(const stat of card.querySelectorAll('.stat[data-source-field]')){const field=stat.dataset.sourceField.split('.').pop(),entry=Object.entries(stats).find(([key])=>String(key).toLowerCase()===String(field).toLowerCase());if(!entry)continue;const effects=list(gameUnit.effects).filter(effect=>activeEffect(effect)&&effect.component==='stat'&&String(effect.targetId).toLowerCase()===String(field).toLowerCase()),value=stat.querySelector('span');if(!effects.length||!value)continue;const base=effects[0].base??value.textContent.trim(),effective=entry[1];value.dataset.rosterBaseValue=base;value.textContent=effective;value.classList.add('roster-modified');markChange(stat,base,effective,effects,projection);}}
  const rowId=row=>row.dataset.rosterProfileId||row.id||'';
  function ensureWeaponRow(card,profile){let row=[...card.querySelectorAll('.weapon-row:not(.weapon-head)')].find(item=>rowId(item)===profile.id);if(row)return{row,created:false};const group=[...card.querySelectorAll('.weapon-group')].find(node=>node.querySelector('h5')?.textContent.trim().toLowerCase().startsWith(profile.mode));const table=group?.querySelector('.weapon-table');if(!table)return null;row=element('div','weapon-row roster-derived-weapon');row.dataset.rosterProfileId=profile.id;const name=element('div','',profile.title);name.append(element('div','weapon-tags'));row.append(name);for(const field of profile.mode==='melee'?['Range','A','WS','S','AP','D']:['Range','A','BS','S','AP','D']){const cell=element('div','',profile.values?.[field]??'');cell.dataset.label=field;row.append(cell);}table.append(row);return{row,created:true};}
  function applyEffectiveWeapons(card,gameUnit,projection){for(const profile of list(gameUnit.effective?.weaponProfiles)){const effects=list(gameUnit.effects).filter(effect=>activeEffect(effect)&&effect.component==='weapon'&&list(effect.targets).some(target=>target.profileId===profile.id));if(!effects.length)continue;const resolved=ensureWeaponRow(card,profile);if(!resolved)continue;const{row,created}=resolved;if(created||effects.some(effect=>effect.operation==='grant-profile'))row.hidden=false;for(const [field,effective] of Object.entries(profile.values||{})){const cell=row.querySelector(`[data-label="${field}"]`),target=effects.flatMap(effect=>list(effect.targets).map(item=>({effect,...item}))).find(item=>item.profileId===profile.id&&item.field===field);if(!cell||!target||String(target.base)===String(effective))continue;cell.dataset.rosterBaseValue=target.base;cell.textContent=effective;cell.classList.add('roster-modified');}let tags=row.firstElementChild?.querySelector('.weapon-tags');if(!tags&&row.firstElementChild){tags=element('div','weapon-tags');row.firstElementChild.append(tags);}const existing=new Set([...tags?.children||[]].map(node=>node.textContent.trim().toLowerCase()));for(const tag of list(profile.tags))if(!existing.has(String(tag).toLowerCase()))tags?.append(element('span','tag roster-modified',tag));}}
  function applyEffectiveAbilities(card,gameUnit,projection){
    const section=partEnding(card,'-abilities'),listNode=section?.querySelector('.ability-list');if(!listNode)return;
    const referenceTitle=value=>String(value||'').replace(/\s+-\s+\d+\s*pts$/i,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
    const exactOwners=identity=>{const owners=[];for(const node of card.querySelectorAll('[data-roster-canonical-reference-id],[data-roster-canonical-ability-id],[data-ability-id],[data-term]')){const ids=[node.dataset.rosterCanonicalReferenceId,node.dataset.rosterCanonicalAbilityId,node.dataset.abilityId,node.dataset.term].filter(Boolean);if(!ids.includes(identity))continue;const owner=node.closest('.ability,.roster-enhancement')||node;if(!owners.includes(owner))owners.push(owner);}if(owners.length>1)throw new Error(`duplicate canonical ability presentation ${identity}`);return owners;};
    for(const effect of list(gameUnit.effects).filter(effect=>effect.component==='ability')){
      const reference=effect.operation==='reference'?(effect.canonicalReference||effect.canonicalAbility):null,title=reference?.title||effect.title||effect.targetId,identity=reference?.id||effect.targetId||title,candidates=[...card.querySelectorAll('.ability,.roster-enhancement,[data-ability-id],[data-roster-enhancement],[data-term]')],displayMatches=candidates.filter(node=>[node.dataset.rosterCanonicalReferenceId,node.dataset.rosterCanonicalAbilityId,node.dataset.rosterCanonicalEnhancementId,node.dataset.rosterRuleId,node.dataset.abilityId,node.dataset.rosterEnhancement,node.dataset.term,node.id].some(value=>referenceTitle(value)===referenceTitle(identity))||referenceTitle(node.querySelector('h5')?.textContent)===referenceTitle(title)||referenceTitle(node.textContent)===referenceTitle(title)),matches=effect.operation==='remove'?exactOwners(effect.targetId):displayMatches,existing=matches[0];
      if(effect.operation==='remove'&&activeEffect(effect)){for(const match of matches){match.hidden=true;match.style.display='none';}continue;}
      if(activeEffect(effect)&&effect.operation==='grant'&&String(effect.targetId||'').startsWith('core-')){const compact=section.querySelector('[data-ability-class="core"] .shared-abilities');if(compact){let granted=[...compact.children].find(node=>node.dataset.term===effect.targetId||node.dataset.rosterEffectId===effect.id);if(!granted){granted=element('button','term-button roster-modified',title);granted.type='button';granted.dataset.term=effect.targetId;compact.append(granted);}else if(granted.textContent.trim()!==title){granted.dataset.rosterBaseValue=granted.textContent.trim();granted.textContent=title;granted.classList.add('roster-modified');}granted.dataset.rosterEffectId=effect.id;continue;}const core=[...listNode.querySelectorAll(':scope > .ability')].find(node=>referenceTitle(node.querySelector('h5')?.textContent)==='core'),body=core?.querySelector('p');if(body){const normalized=referenceTitle(title),present=body.textContent.split(',').some(value=>referenceTitle(value)===normalized)||[...body.querySelectorAll('[data-roster-effect-id]')].some(node=>node.dataset.rosterEffectId===effect.id);if(!present){if(body.textContent.trim())body.append(document.createTextNode(', '));const granted=element('span','',title);granted.dataset.rosterEffectId=effect.id;body.append(granted);}continue;}}
      if(effect.operation==='reference'&&!reference)continue;
      if(!title)continue;
      if(reference&&existing){existing.dataset.rosterCanonicalReferenceId=reference.id;existing.dataset.rosterCanonicalReferenceKind=reference.kind||'ability';if(reference.kind==='enhancement')existing.dataset.rosterCanonicalEnhancementId=reference.id;else if(reference.kind==='detachment-rule')existing.dataset.rosterCanonicalDetachmentRuleId=reference.id;else existing.dataset.rosterCanonicalAbilityId=reference.id;existing.dataset.rosterCanonicalSectionId=reference.sectionId||'';const source=effect.source?.ownerInstanceId!==gameUnit.identity?.instanceId?sourceTitle(effect,projection):'',heading=existing.querySelector('h5');if(source&&heading&&!existing.querySelector('.roster-game-ability-source'))heading.after(element('div','roster-game-ability-source',source));continue;}
      if(existing&&effect.operation==='add-range'){if(activeEffect(effect))markChange(existing,`${effect.base}\"`,`${effect.effective}\"`);continue;}
      if(existing)continue;
      const article=element('article',`ability roster-game-derived-ability${reference?' roster-game-canonical-reference':activeEffect(effect)?'':' roster-game-conditional'}`),heading=element('h5','',title);article.dataset.rosterEffectId=effect.id;
      if(reference){article.dataset.rosterCanonicalReferenceId=reference.id;article.dataset.rosterCanonicalReferenceKind=reference.kind||'ability';if(reference.kind==='enhancement')article.dataset.rosterCanonicalEnhancementId=reference.id;else if(reference.kind==='detachment-rule')article.dataset.rosterCanonicalDetachmentRuleId=reference.id;else article.dataset.rosterCanonicalAbilityId=reference.id;article.dataset.rosterCanonicalSectionId=reference.sectionId||'';const source=effect.source?.ownerInstanceId!==gameUnit.identity?.instanceId?sourceTitle(effect,projection):'';article.append(heading);if(source)article.append(element('div','roster-game-ability-source',source));article.append(element('p','',reference.text||''));}else article.append(heading,element('p','',effect.summary||'Roster effect reference.'));
      listNode.prepend(article);
    }
  }
  function applyEffectiveKeywords(card,gameUnit){const section=partEnding(card,'-keywords'),host=section?.querySelector('.keyword-list');if(!host)return;const effective=unique(gameUnit.effective?.keywords),keys=new Set(effective.map(value=>String(value).toLowerCase()));for(const tag of host.children)tag.hidden=!keys.has(tag.textContent.trim().toLowerCase());for(const keyword of effective)if(![...host.children].some(tag=>tag.textContent.trim().toLowerCase()===String(keyword).toLowerCase()))host.append(element('span','roster-derived-keyword',keyword));}
  function applyEffectiveState(card,gameUnit,projection){applyEffectiveStats(card,gameUnit,projection);applyEffectiveWeapons(card,gameUnit,projection);applyEffectiveAbilities(card,gameUnit,projection);applyEffectiveKeywords(card,gameUnit);}
  function replaceCost(card,gameUnit){
    const points=gameUnit.selection.points,models=gameUnit.selection.modelCount;
    const cost=card.querySelector(':scope > :is(.unit-head,.unit-header) :is(.points,.unit-status)');if(!cost)return;
    const canonical=element('div','roster-game-current-cost'),label=element('small','roster-game-cost-label','Current points · authoritative');
    canonical.append(label,...cost.childNodes);cost.replaceChildren(canonical);cost.classList.add('roster-game-cost');
    if(points?.state==='resolved'){
      const exported=element('div','roster-game-exported-cost'),currentValues=[...canonical.textContent.matchAll(/(\d+)\s*pts\b/gi)].map(match=>Number(match[1])),matches=currentValues.length===1&&currentValues[0]===Number(points.value);
      exported.append(element('small','roster-game-cost-label',`Exported points · source roster${matches?' · matches current':''}`),element('span','',`${points.value} pts${models?.state==='resolved'?` · ${models.value} ${models.value===1?'model':'models'} in roster`:''}`));cost.append(exported);
    }
    else if(models?.state==='resolved')cost.append(element('small','roster-game-model-count',`${models.value} ${models.value===1?'model':'models'} in roster`));
  }
  function buildSummary(card,gameUnit,projection){
    const summary=element('div','roster-game-summary');summary.setAttribute('aria-label','Roster details');
    const facts=element('div','roster-game-facts');
    for(const enhancement of list(gameUnit.rosterState.enhancements))if(enhancement.title)facts.append(element('span','roster-game-enhancement',`Enhancement: ${enhancement.title}${enhancement.active===false?` [inactive: ${enhancement.ownerMessage}]`:""}${enhancement.sourceMessage?` [${enhancement.sourceMessage}]`:""}`));
    if(facts.children.length)summary.append(facts);
    const leaders=list(gameUnit.attachments.leaders).filter(currentRelation),leading=list(gameUnit.attachments.leading).filter(currentRelation);
    const relations=element('div','roster-game-relations');
    const addRelations=(label,items)=>{if(!items.length)return;const row=element('p','');row.append(element('strong','',`${label}: `),document.createTextNode(items.map(item=>instanceTitle(item.instanceId,projection)).join(', ')));relations.append(row);};
    addRelations(leaders.length>1?'Leaders':'Leader',leaders);addRelations('Leading',leading);
    if(relations.children.length)summary.append(relations);
    if(!summary.children.length)return;
    const head=[...card.children].find(node=>node.matches?.('.unit-head,.unit-header'));(head||card.firstElementChild)?.after(summary);
  }
  function filterWeapons(card,gameUnit){
    const loadout=gameUnit.selection.loadout,resolution=loadout.weaponResolution||{},selected=unique(loadout.selectedProfileIds),rows=[...card.querySelectorAll('.weapon-row:not(.weapon-head)')];
    const idFor=row=>row.dataset.rosterProfileId||row.id||'',mapped=selected.every(id=>rows.filter(row=>idFor(row)===id).length===1),complete=resolution.state==='resolved'&&selected.length>0&&mapped,visible=new Set(mapped?selected:[]);
    for(const row of rows){row.style.removeProperty('display');row.hidden=!visible.has(idFor(row));}
    for(const group of card.querySelectorAll('.weapon-group'))group.hidden=![...group.querySelectorAll('.weapon-row:not(.weapon-head)')].some(row=>!row.hidden);
    if(complete){card.dataset.rosterGameWeapons='filtered';return;}
    if(!rows.length)return;
    card.dataset.rosterGameWeapons=visible.size?'partial':'unknown';
    const profile=partEnding(card,'-profile');if(!profile)return;
    const notice=element('aside','roster-game-loadout-status'),title=visible.size?'Weapon loadout partially known':'Weapon loadout unknown',unresolved=unique(list(resolution.unresolved).map(item=>item.sourceText));
    notice.setAttribute('aria-label',title);notice.append(element('h5','',title),element('p','',visible.size?'Known equipped weapons are shown. Other exported selections could not be matched, so no additional weapons are assumed.':'No equipped weapons could be confirmed from this roster export. No weapons are assumed.'));
    if(unresolved.length)notice.append(element('p','roster-game-loadout-unresolved',`Could not match: ${unresolved.join(', ')}`));
    const reference=element('a','popup-action roster-game-reference-link','Open full datasheet reference'),url=new URL(root.location.href);url.searchParams.delete('roster');url.searchParams.delete('rosterInstance');url.hash=gameUnit.identity.canonicalDatasheetId;reference.href=url.href;notice.append(reference);
    const heading=profile.querySelector(':scope > h4');heading?.after(notice);
  }
  function filterWargearAbilities(card,gameUnit){
    const section=partEnding(card,'-wargear-abilities');if(!section)return;
    const loadout=gameUnit.selection.loadout,resolution=loadout.wargearResolution||{},selected=unique(loadout.selectedWargearAbilityIds),articles=[...section.querySelectorAll('.ability')],idFor=article=>article.dataset.rosterWargearAbilityId||article.id||'';
    const mapped=selected.every(id=>articles.filter(article=>idFor(article)===id).length===1),visible=new Set(mapped?selected:[]);for(const article of articles)article.hidden=!visible.has(idFor(article));section.hidden=!articles.some(article=>!article.hidden);section.dataset.rosterGameAbilities=resolution.state==='resolved'&&mapped?'filtered':resolution.state==='known-none'?'known-none':'fallback';
  }
  function transformComposition(card,gameUnit){
    const composition=gameUnit.selection.composition,models=gameUnit.selection.modelCount,section=partEnding(card,'-composition');if(!section||models?.state!=='resolved')return;
    const heading=section.querySelector(':scope > h4');for(const child of [...section.children])if(child!==heading){child.hidden=true;child.dataset.rosterGameCanonical='true';}
    const block=element('div','roster-game-composition');block.dataset.rosterGameGenerated='composition';block.append(element('p','roster-game-composition-total',`${models.value} ${models.value===1?'model':'models'}`));
    const grouped=new Map();if(composition?.state==='resolved')for(const model of list(composition.models)){const name=model.sourceText||'Model';grouped.set(name,(grouped.get(name)||0)+Number(model.quantity||0));}
    if(grouped.size){const rows=element('ul','');for(const [name,quantity] of grouped)rows.append(element('li','',`${quantity} × ${name}`));block.append(rows);}
    section.append(block);section.dataset.rosterGameComposition='actual';
  }
  function omitBuildGuidance(card,gameUnit){
    if(gameUnit.selection.loadout.state==='resolved'){const options=partEnding(card,'-wargear-options');if(options){options.hidden=true;options.dataset.rosterGameOmitted='wargear-options';}}
    const factual=[...list(gameUnit.attachments.leaders),...list(gameUnit.attachments.leading)].some(currentRelation);if(!factual)return;
    for(const part of directParts(card))if(part.id.endsWith('-leader')||part.id.endsWith('-support')){part.hidden=true;part.dataset.rosterGameOmitted='generic-attachment-eligibility';}
  }
  function presentEffects(card,gameUnit,projection){
    const effects=list(gameUnit.effects).filter(effect=>activeEffect(effect)&&!(effect.component==='ability'&&effect.operation==='reference'));if(!effects.length)return;
    const abilities=partEnding(card,'-abilities')||card,block=element('aside','roster-game-effects');block.setAttribute('aria-label','Active roster effects');block.append(element('h5','', 'Active roster effects'));
    const rows=element('ul','');for(const effect of effects){const label=effectLabel(effect);if(!label)continue;const item=element('li','');item.dataset.effectState=activeEffect(effect)?'active':'conditional';const source=sourceTitle(effect,projection),prefix=activeEffect(effect)?'':'Conditional · ';item.append(element('span','',source?`${prefix}${source} → ${label}`:`${prefix}${label}`));rows.append(item);}
    if(rows.children.length){block.append(rows);abilities.append(block);}
  }
  function emphasizeKeywords(card,gameUnit){
    const section=partEnding(card,'-keywords');if(!section)return;section.dataset.rosterGameEffective='true';const heading=section.querySelector(':scope > h4');if(heading)heading.textContent='Keywords';
    const profile=gameUnit.rosterState.keywordProfile||{},added=unique([...list(profile.added),...list(gameUnit.effects).filter(effect=>effect.component==='keyword'&&effect.operation!=='remove').map(effect=>effect.targetId)]),removed=unique([...list(profile.removed),...list(gameUnit.effects).filter(effect=>effect.component==='keyword'&&effect.operation==='remove').map(effect=>effect.targetId)]);
    if(!added.length&&!removed.length)return;const changes=element('div','roster-game-keyword-changes');for(const value of added)changes.append(element('span','roster-game-added',`+ ${value}`));for(const value of removed)changes.append(element('span','roster-game-removed',`− ${value}`));section.append(changes);
  }
  function syncNavigation(card){
    const nav=[...card.children].find(node=>node.matches?.('.local-nav'));if(!nav)return;
    for(const button of nav.querySelectorAll('[data-journey-target]')){const target=[...card.querySelectorAll('[id]')].find(node=>node.id===button.dataset.journeyTarget);button.hidden=!target||target.hidden;}
  }
  function present(card,gameUnit,projection){
    if(card.dataset.rosterGameInstance===gameUnit.identity.instanceId)return card;
    card.dataset.rosterGameInstance=gameUnit.identity.instanceId;card.classList.add('roster-game-view');
    replaceCost(card,gameUnit);buildSummary(card,gameUnit,projection);filterWeapons(card,gameUnit);filterWargearAbilities(card,gameUnit);transformComposition(card,gameUnit);omitBuildGuidance(card,gameUnit);applyEffectiveState(card,gameUnit,projection);presentEffects(card,gameUnit,projection);emphasizeKeywords(card,gameUnit);syncNavigation(card);return card;
  }
  function install(node=document,projection=root.WH_ARMY_ROSTER_PROJECTION){
    if(projection?.game?.schema!==SCHEMA)return node;
    for(const card of cardsIn(node)){if(card.dataset.rosterSelected!=='true'||!card.dataset.rosterInstance)continue;const gameUnit=exactGameUnit(card,projection);if(gameUnit)present(card,gameUnit,projection);}
    return node;
  }
  root.addEventListener?.('wh-roster-projection-ready',event=>install(document,event.detail?.projection));
  root.WHArmyRosterGamePresentation=Object.freeze({SCHEMA,install,present});
  install(document,root.WH_ARMY_ROSTER_PROJECTION);
}(window));

import fs from 'node:fs';
import path from 'node:path';
import {canonicalRosterModelsFor,canonicalWargearAbilityId,canonicalWeaponProfileId} from './build-roster-catalog.mjs';
import {renderUnitArt} from './render-unit-art.mjs';

export async function renderEffectiveBook(context,effectiveModelInput,{rosterCatalog}={}){
const {root,repo,config,runtimeVersions}=context;
const {sourceTranscript:source,codexSource,codexDatasheetsSource,unitImages}=effectiveModelInput.presentation;
const {units,detachments:allDetachments,enhancements}=effectiveModelInput;
const rules={...effectiveModelInput.rules,datasheets:units,detachments:allDetachments.filter(item=>item.sourcePages),glossary:effectiveModelInput.glossary};
const pointsCatalog={source:effectiveModelInput.sourceMetadata.points};
const titleKey=value=>String(value||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const slugKey=value=>String(value||'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const slugify=slugKey;
const abilityText=item=>[item.openingText,...(item.options||[]).flatMap(option=>[option.title,option.text]),item.text].filter(Boolean).join(' ');
const coreTermKeys=new Map();
for(const term of rules.glossary.filter(term=>term.group==='Core abilities'))for(const label of [term.title,...(term.aliases||[])])coreTermKeys.set(titleKey(label.replace(/^core-|^datasheet-/i,'').replace(/^\[|\]$/g,'')),term);
const coreBaseKey=value=>{const normalized=titleKey(value).replace(/\s+(?:d\d+|\d+|\d+\+|\d+ inches)$/,'').trim();return normalized.startsWith('anti ')?'anti':normalized;};
const termIds=new Set(rules.glossary.map(term=>term.id));
const esc=value=>String(value??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const cleanText=value=>String(value??'').replace(/[ \t]+\n/g,'\n').trim();
const pagesLabel=pages=>pages.length===1?`p. ${pages[0]}`:`pp. ${pages[0]}–${pages.at(-1)}`;
const sourceLink=pages=>`<a class="source-link" href="./${esc(rules.source.file)}#page=${pages[0]}">Faction Pack v${esc(rules.source.version)} · ${pagesLabel(pages)}</a>`;
const transcript=pages=>`<details class="source-transcript"><summary>Official page transcript</summary>${pages.map(page=>`<h5>Page ${page}</h5><pre>${esc(source.pages[String(page)])}</pre>`).join('')}</details>`;
const tracked=(id,title,body,classes='content-group')=>`<section class="${classes}" id="${id}" data-track="${id}"><h3 class="category-title">${esc(title)}</h3>${body}</section>`;
const navLeaf=(id,label,depth)=>`<li data-nav-id="${id}" data-nav-depth="${depth}"><div class="toc-row no-toggle"><button class="toc-label" data-nav-target="${id}">${esc(label)}</button></div></li>`;
const navBranch=(id,label,depth,children)=>`<li data-nav-id="${id}" data-nav-depth="${depth}"><div class="toc-row"><button class="toc-label" data-nav-target="${id}">${esc(label)}</button><button class="toc-toggle" data-nav-toggle aria-label="Toggle ${esc(label)}" aria-expanded="false"></button></div><ul class="toc-branch" hidden>${children}</ul></li>`;
const termMap=new Map(rules.glossary.map(term=>[term.title.toLowerCase(),term]));
const escapeRegExp=value=>String(value).replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
const normalizeDecoratedTerm=value=>String(value)
  .replace(/^\[/,'')
  .replace(/\]$/,'')
  .replace(/\s+\d+\+$/,'')
  .trim()
  .toLowerCase();
const decoratorTermMap=new Map();
for(const term of [...rules.glossary].sort((a,b)=>b.title.length-a.title.length)){
  for(const variant of [term.title,...(term.aliases||[])]){
    const key=normalizeDecoratedTerm(variant);
    if(!key)continue;
    const candidates=decoratorTermMap.get(key)||[];
    if(!candidates.includes(term))candidates.push(term);
    decoratorTermMap.set(key,candidates);
  }
}
const decoratorAlternation=[...decoratorTermMap.keys()].sort((a,b)=>b.length-a.length).map(escapeRegExp).join('|');
const decoratorPattern=decoratorAlternation
  ?new RegExp(`(^|[^A-Za-z0-9])((?:\\[)?(?:${decoratorAlternation})(?:\\])?(?:\\s+\\d+\\+)?)(?=$|[^A-Za-z0-9])`,'gi')
  :null;
const decoratorTerm=(key,unitId='')=>{
  const candidates=decoratorTermMap.get(key)||[];
  return candidates.find(term=>term.group==='Core abilities')
    ||candidates.find(term=>unitId&&(term.unitIds||[]).includes(unitId))
    ||candidates[0];
};
const decorate=(value,unitId='')=>{
  const raw=String(value??'').replace(/[ \t]+\n/g,'\n');
  if(!decoratorPattern)return esc(raw);
  const output=[];
  let cursor=0;
  decoratorPattern.lastIndex=0;
  for(let match=decoratorPattern.exec(raw);match;match=decoratorPattern.exec(raw)){
    const prefix=match[1]||'';
    const token=match[2];
    const tokenStart=match.index+prefix.length;
    const term=decoratorTerm(normalizeDecoratedTerm(token),unitId);
    if(!term)continue;
    output.push(esc(raw.slice(cursor,tokenStart)));
    output.push(`<button class="term-button" data-term="${term.id}">${esc(token)}</button>`);
    cursor=tokenStart+token.length;
  }
  output.push(esc(raw.slice(cursor)));
  return output.join('');
};

function validate(){
  const fail=message=>{throw new Error(message);};
  const navigationRuntime=fs.readFileSync(path.join(root,'../shared/controllers/navigation-controller.js'),'utf8');
  if(source.meta.pageCount!==rules.source.pages)fail(`Expected ${rules.source.pages} source pages`);
  if(source.meta.sha256!==rules.source.sha256)fail('Source hashes disagree');
  if(rules.detachments.length!==rules.audit.detachments)fail('Detachment audit mismatch');
  if(allDetachments.length!==config.expected.matchedDetachments)fail(`Expected ${config.expected.matchedDetachments} total Adeptus Mechanicus detachments`);
  if(rules.datasheets.length!==config.expected.codexDatasheets)fail('Codex datasheet audit mismatch');
  if(rules.datasheets.filter(unit=>unit.status==='Warhammer Legends').length!==rules.audit.legendsDatasheets)fail('Legends audit mismatch');
  if(rules.glossary.length!==rules.audit.glossaryTerms)fail('Glossary audit mismatch');
  const ids=[rules.armyRule.id,...rules.armyRule.options.map(x=>x.id),...rules.updates.map(x=>x.id),...allDetachments.flatMap(x=>[x.id,x.rule.id,`${x.id.replace('detachment-','')}-enhancements`,`${x.id.replace('detachment-','')}-stratagems`]),...rules.datasheets.map(x=>x.id),...rules.glossary.map(x=>`glossary-${x.id}`)];
  if(new Set(ids).size!==ids.length)fail('Canonical IDs are not unique');
  const units=new Set(rules.datasheets.map(x=>x.id));
  const sections=new Set(ids);
  for(const term of rules.glossary){
    if(term.sectionId&&!sections.has(term.sectionId))fail(`Missing term section: ${term.sectionId}`);
    for(const unit of term.unitIds||[])if(!units.has(unit))fail(`Missing term unit: ${unit}`);
  }
  for(const item of [rules.armyRule,...rules.updates,...allDetachments,...rules.datasheets])for(const page of [...(item.sourcePages||[]),...(item.updatedSourcePages||[])])if(!source.pages[String(page)])fail(`Missing source page ${page}`);
  if(!navigationRuntime.includes("this.panel.contains(target)"))fail('Navigation must ignore cancellation gestures inside Contents');
  if(!navigationRuntime.includes("this.pathIsOpen(item.node)"))fail('Navigation must restore the active open path after manual article scrolling');
  if(!navigationRuntime.includes("this.revealPath(item.node,{includeSelf:true})"))fail('Navigation must keep an active parent branch expanded');
  if(!navigationRuntime.includes('lastCrossedDescendant(parent,scrollY)'))fail('Mechanicus must use the Death Guard descendant tracking contract');
  if(!navigationRuntime.includes('reachableDestination(destination)'))fail('Navigation must clamp destinations to the reachable document range');
}

const detNav=allDetachments.map(det=>{
  const slug=det.id.replace('detachment-','');
  return navBranch(det.id,det.title,2,navLeaf(det.rule.id,'Detachment Rule',3)+navLeaf(`${slug}-enhancements`,'Enhancement',3)+navLeaf(`${slug}-stratagems`,'Stratagems',3));
}).join('');
const fixedCategoryOrder=['Epic Heroes','Characters','Battleline','Dedicated Transports'];
const categoryOrder=[...fixedCategoryOrder,...new Set(rules.datasheets.map(unit=>unit.category).filter(category=>!fixedCategoryOrder.includes(category)&&category!=='Other'&&category!=='Warhammer Legends')),'Other','Warhammer Legends'];
const datasheetCategories=categoryOrder.map(title=>({title,id:`datasheets-${title.toLowerCase().replaceAll(/[^a-z0-9]+/g,'-')}`,units:rules.datasheets.filter(unit=>unit.category===title)})).filter(group=>group.units.length);
const glossaryOrder=['Core abilities','Faction & publication','Datasheet abilities','Weapon profiles'];
const glossaryGroups=glossaryOrder.map(title=>({title,id:title==='Core abilities'?'glossary-core':title==='Faction & publication'?'glossary-faction':`glossary-${slugify(title)}`,terms:rules.glossary.filter(term=>term.group===title)})).filter(group=>group.terms.length);
const toc=navLeaf('start','Start',1)
  +navBranch('core-rules','Core Rules',1,navBranch(rules.armyRule.id,rules.armyRule.title,2,rules.armyRule.options.map(x=>navLeaf(x.id,x.label,3)).join('')))
  +navBranch('detachments','Detachments',1,detNav)
  +navBranch('datasheets','Datasheets',1,datasheetCategories.map(group=>navBranch(group.id,group.title,2,group.units.map(x=>navLeaf(x.id,x.title,3)).join(''))).join(''))
  +navBranch('updates','Updates',1,rules.updates.map(x=>navLeaf(x.id,x.title,2)).join(''));

const updates=rules.updates.map(item=>tracked(item.id,item.title,`<article class="rule-card surface"><div class="eyebrow">Official update</div><p>${decorate(item.summary)}</p><div class="source">${sourceLink(item.sourcePages)}</div>${transcript(item.sourcePages)}</article>`)).join('');
const options=rules.armyRule.options.map((option,index)=>`<button class="protocol${option.id===rules.armyRule.options.find(x=>x.id.endsWith(rules.armyRule.default))?.id||(!index?'':' active')}" data-protocol="${option.id.split('-')[0]}"><span>${esc(option.symbol)}</span><b>${esc(option.label)}</b><small>${esc(option.subtitle)}</small></button>`).join('');
const optionPanels=rules.armyRule.options.map(option=>`<section id="${option.id}" data-track="${option.id}" data-source-field="effects"${option.id.endsWith(rules.armyRule.default)?'':' hidden'}><b>${esc(option.label.toUpperCase())} IMPERATIVE</b><ul>${option.effects.map(x=>`<li>${decorate(x)}</li>`).join('')}</ul></section>`).join('');
const armyRule=tracked(rules.armyRule.id,rules.armyRule.title,`<article class="doctrina-console surface"><div class="doctrina-code"><span>DOCTRINA</span><strong>Ω-01</strong></div><div class="doctrina-body"><div class="eyebrow">Battle Protocol</div><p>Select the active imperative. The console shows the complete Faction Pack v${rules.source.version} replacement.</p><div class="protocol-switch" role="group" aria-label="Select Doctrina Imperative">${options}</div><div class="protocol-result">${optionPanels}</div><div class="source">${sourceLink(rules.armyRule.sourcePages)}</div></div></article>`);

const supportedSubjects=new Set(['unit','model','objective']);
const validateEligibility=item=>{
  const roles=item.eligibility?.owner?[{...item.eligibility.owner,side:'friendly'}]:(item.eligibility?.roles||item.eligibility?.targets||[]);
  for(const role of roles){
    const subject=role.subject||'unit';
    if(!supportedSubjects.has(subject))throw new Error(`Adeptus Mechanicus: ${item.id} uses unsupported eligibility subject ${subject}`);
  }
};
const detachments=allDetachments.map(det=>{
  const slug=det.id.replace('detachment-','');
  const isCodex=!det.sourcePages;
  const renderedEnhancements=det.enhancements.map(original=>{
    const matches=enhancements.filter(item=>item.detachmentId===det.id&&item.id===original.id);
    if(matches.length!==1)throw new Error(`Adeptus Mechanicus: ${det.id}/${original.id} must resolve to one effective Enhancement`);
    const item=matches[0],isUpgrade=(item.tags||[]).includes('UPGRADE');
    validateEligibility(item);
    return `<article class="enhancement surface" data-rule-id="${esc(item.id)}" data-enhancement-tags="${esc((item.tags||[]).join('|'))}" data-owner-subject="${esc(item.owner?.subject||item.eligibility?.owner?.subject||'')}" data-enhancement-title="${esc(item.title)}"><div class="eyebrow">Enhancement${isUpgrade?' · UPGRADE':''}</div><h4>${esc(item.title)}</h4><p data-source-field="text">${decorate(item.text)}</p></article>`;
  }).join('');
  const stratagems=det.stratagems.map(item=>{
    validateEligibility(item);
    const turn=/opponent|enemy/i.test(item.when)?'THEIR TURN':/your\b/i.test(item.when)?'YOUR TURN':'ANY TURN';
    const turnClass=turn==='THEIR TURN'?'turn-their':turn==='YOUR TURN'?'turn-yours':'turn-any';
    const match=String(item.category||'').trim().match(/(Battle Tactic|Strategic Ploy|Wargear|Epic Deed|Core) Stratagem\s*$/i);
    const type=match?match[1].toLowerCase().replace(/\s+/g,'-'):'unknown';
    const label=type==='unknown'?'Type unverified':item.category;
    return `<article class="stratagem surface ${turnClass}" data-rule-id="${esc(item.id)}" data-turn="${turn}" data-target="${esc(item.target||'')}" data-stratagem-type="${type}"><div class="stratagem-head"><div><h3><button class="term-button" data-term="${esc(item.id)}">${esc(item.title)}</button></h3><span class="stratagem-type">${esc(label)}</span></div><div class="cp">${esc(item.cp)}</div></div><p class="field" data-source-field="when"><b>When</b><br>${decorate(item.when)}</p>${item.target?`<p class="field" data-source-field="target"><b>Target</b><br>${decorate(item.target)}</p>`:''}<p class="field" data-source-field="effect"><b>Effect</b><br>${decorate(item.effect)}</p>${item.restrictions?`<p class="field" data-source-field="restrictions"><b>Restrictions</b><br>${decorate(item.restrictions)}</p>`:''}</article>`;
  }).join('');
  if(!Number.isFinite(det.detachmentPoints))throw new Error(`${det.title}: Detachment Points are missing`);
  const publication=`<div class="detachment-meta"><span>${isCodex?'CODEX + 11E UPDATE':'FACTION PACK'}</span>${det.forceDisposition?`<span>${esc(det.forceDisposition)}</span>`:''}</div>`;
  const provenance=isCodex?`<div class="source"><a class="source-link" href="${codexSource.officialIndexUrl}">Official 11e detachment index</a> · <a class="source-link" href="${codexSource.referenceUrl}">Codex rules reference</a>${det.updatedSourcePages?.length?` · ${sourceLink(det.updatedSourcePages)}`:''}</div>${det.updatedSourcePages?.length?transcript(det.updatedSourcePages):''}`:`<div class="source">${sourceLink(det.sourcePages)}</div>${transcript(det.sourcePages)}`;
  const body=`${publication}<p class="lead">${esc(det.tagline)}</p><div class="detachment-content">${tracked(det.rule.id,'Detachment Rule',`<article class="rule-card surface"><h3>${esc(det.rule.title)}</h3><p data-source-field="text">${decorate(det.rule.text)}</p></article>`,'detachment-part')}${tracked(`${slug}-enhancements`,'Enhancements',`<div class="detachment-grid">${renderedEnhancements}</div>`,'detachment-part')}${tracked(`${slug}-stratagems`,'Stratagems',`<div class="stratagem-grid">${stratagems}</div>`,'detachment-part')}</div>${provenance}`;
  return `<section class="content-group detachment" id="${det.id}" data-track="${det.id}" data-detachment="${slug}"><h3 class="category-title detachment-title">${esc(det.title)} <span class="detachment-dp">${esc(det.detachmentPoints)}DP</span></h3>${body}</section>`;
}).join('');

const stats=unit=>(unit.profiles?.length?unit.profiles:[{name:unit.title,stats:unit.stats}]).map(profile=>`<div class="model-profile" data-profile="${esc(slugKey(profile.name))}">${unit.profiles?.length>1?`<h5>${esc(profile.name)}</h5>`:''}<div class="statline">${Object.entries(profile.stats).map(([key,value])=>`<div class="stat" data-source-field="stats.${esc(key)}"><b>${key}</b><span>${esc(value)}</span></div>`).join('')}${unit.invulnerable?`<div class="stat invulnerable" data-source-field="invulnerable"><b>INV</b><span>${esc(unit.invulnerable)}</span></div>`:''}</div></div>`).join('');
const weapons=unit=>['ranged','melee'].map(mode=>{
  const rows=unit.weapons.map((item,index)=>({item,index})).filter(record=>record.item.mode===mode);
  if(!rows.length)return '';
  const skillLabel=mode==='ranged'?'BS':'WS';
  return `<div class="weapon-group"><h5>${mode==='ranged'?'Ranged':'Melee'} weapons</h5><div class="weapon-table" role="table" aria-label="${esc(unit.title)} ${mode} weapons"><div class="weapon-row weapon-head"><div>Weapon</div><div>Range</div><div>A</div><div>${skillLabel}</div><div>S</div><div>AP</div><div>D</div></div>${rows.map(({item:w,index})=>`<div class="weapon-row" data-roster-profile-id="${esc(canonicalWeaponProfileId(unit,w,index))}" data-source-field="weapons.${esc(slugKey(w.name))}" data-mode="${mode}"><div data-source-field="name"><button class="weapon-button" data-term="${w.termId}">${esc(w.name)}</button>${w.abilities?`<div class="weapon-tags">${String(w.abilities).split(',').map(rawLabel=>{const label=rawLabel.trim();const term=coreTermKeys.get(coreBaseKey(label));const text=esc(label.toUpperCase());return term?`<button class="tag" data-term="${term.id}">${text}</button>`:`<span class="tag">${text}</span>`;}).join('')}</div>`:''}</div><div data-label="Range" data-source-field="range">${esc(w.range)}</div><div data-label="A" data-source-field="a">${esc(w.a)}</div><div data-label="${skillLabel}" data-source-field="skill">${esc(w.skill)}</div><div data-label="S" data-source-field="s">${esc(w.s)}</div><div data-label="AP" data-source-field="ap">${esc(w.ap)}</div><div data-label="D" data-source-field="d">${esc(w.d)}</div></div>`).join('')}</div></div>`;
}).join('');
const abilityKind=item=>{
  if(/^doctrina imperatives$/i.test(item.title))return 'faction';
  if(/^(leader|support|attached unit)$/i.test(item.title))return 'relation';
  if(/^damaged:/i.test(item.title))return 'damaged';
  if(/^transport$/i.test(item.title))return 'transport';
  if(/^core$/i.test(item.title)||item.coreAbilityId)return 'core';
  return 'datasheet';
};
const abilityCard=(item,unit,wargearAbilityId='')=>`<article class="ability"${wargearAbilityId?` data-roster-wargear-ability-id="${esc(wargearAbilityId)}"`:''} data-source-field="abilities.${esc(slugKey(item.title))}"><h5 data-source-field="title"><button class="term-button" data-term="${item.termId}">${esc(item.title)}</button></h5>${item.openingText?`<p data-source-field="openingText">${decorate(item.openingText,unit.id)}</p>`:''}${(item.options||[]).map(option=>`<div class="ability-option" data-source-field="options.${esc(option.id)}"><h6>${esc(option.title)}</h6><p data-source-field="text">${decorate(option.text,unit.id)}</p></div>`).join('')}${item.text?`<p data-source-field="text">${decorate(item.text,unit.id)}</p>`:''}</article>`;
const compactAbilities=(title,items,unit)=>items.length?`<div class="shared-ability-group" data-ability-class="${esc(slugKey(title))}"><h5>${title}</h5><div class="keyword-list shared-abilities">${items.map(item=>/^core$/i.test(item.title)?decorate(abilityText(item),unit.id):`<button class="term-button" data-term="${item.termId}" data-source-field="abilities.${esc(slugKey(item.title))}">${esc(item.title)}</button>`).join(' ')}</div></div>`:'';
const compositionWeaponTerms=unit=>{
  const variants=new Map();
  const add=(label,term)=>{
    const key=String(label||'').toLowerCase();if(!key)return;
    const records=variants.get(key)||[];if(!records.some(record=>record.id===term.id))records.push(term);variants.set(key,records);
  };
  for(const weapon of unit.weapons||[]){
    const term={id:weapon.termId,label:weapon.name};
    for(const label of [weapon.name,weapon.name.replaceAll(' & ',' and '),weapon.name.replaceAll(' and ',' & '),weapon.name.replaceAll('-', ' '),weapon.name.endsWith('s')?weapon.name:`${weapon.name}s`])add(label,term);
  }
  const keys=[...variants].filter(([,records])=>records.length===1).map(([key])=>key).sort((a,b)=>b.length-a.length);
  const pattern=keys.length?new RegExp(`(^|[^A-Za-z0-9])(${keys.map(escapeRegExp).join('|')})(?=$|[^A-Za-z0-9])`,'gi'):null;
  return {variants,pattern};
};
const decorateComposition=(value,unit)=>{
  const raw=String(value??'').replace(/[ \t]+\n/g,'\n'),{variants,pattern}=compositionWeaponTerms(unit);
  if(!pattern)return esc(raw);
  const output=[];let cursor=0;pattern.lastIndex=0;
  for(let match=pattern.exec(raw);match;match=pattern.exec(raw)){
    const prefix=match[1]||'',token=match[2],start=match.index+prefix.length,records=variants.get(token.toLowerCase())||[];
    if(records.length!==1)continue;
    output.push(esc(raw.slice(cursor,start)),`<button class="term-button" data-term="${esc(records[0].id)}">${esc(token)}</button>`);cursor=start+token.length;
  }
  output.push(esc(raw.slice(cursor)));return output.join('');
};
const composition=unit=>unit.compositionText
  ?`<p>${decorateComposition(unit.compositionText,unit)}</p>`
  :Array.isArray(unit.composition)
    ?`<ul>${unit.composition.map(model=>`<li>${model.min}${model.max!==model.min?`–${model.max}`:''} ${esc(model.name)}</li>`).join('')}</ul>`
    :`<p>${decorateComposition(unit.composition,unit)}</p>`;
const modelKeywords=unit=>canonicalRosterModelsFor(unit).filter(model=>model.intrinsicKeywords?.length).map(model=>`<p class="model-keywords" data-roster-model-id="${esc(model.id)}"><b>${esc(model.title)}</b> only: ${model.intrinsicKeywords.map(keyword=>`<span data-model-keyword="${esc(keyword)}">${esc(keyword)}</span>`).join(', ')}</p>`).join('');
const unitCard=unit=>{
  const slug=unit.id.replace('unit-','');
  const grouped={core:[],faction:[],datasheet:[],relation:[],damaged:[],transport:[]};
  for(const item of unit.abilities)(grouped[abilityKind(item)]||grouped.datasheet).push(item);
  const wargearAbilities=unit.wargearAbilities||[];
  const wargear=Array.isArray(unit.wargear)?unit.wargear:(unit.wargear?[unit.wargear]:[]);
  const pointRows=(unit.points||[]).filter(row=>Number.isFinite(Number(row.value)));

  const points=pointRows.length===1?`${pointRows[0].value}`:pointRows.length>1?'MULTIPLE COSTS':(unit.points?.length?unit.points.join(' / '):'');
  const pointsPanel=pointRows.length?`<div class="points-panel surface"><div class="eyebrow">Points</div>${pointRows.map(row=>`<div class="points-row"><span>${esc(row.label)}</span><strong>${esc(row.value)} pts</strong></div>`).join('')}</div>`:'';
  const parts=[
    ['Profile & Weapons',`${slug}-profile`,`${pointsPanel}${stats(unit)}${weapons(unit)}`],
    ['Abilities',`${slug}-abilities`,`<div class="ability-list">${compactAbilities('CORE',grouped.core,unit)}${compactAbilities('FACTION',grouped.faction,unit)}${grouped.datasheet.map(item=>abilityCard(item,unit)).join('')}</div>`],
    ['Unit Composition',`${slug}-composition`,composition(unit)],
    ...grouped.relation.map(item=>[item.title,`${slug}-${slugify(item.title)}`,`<div class="ability-list">${abilityCard(item,unit)}</div>`]),
    ...grouped.transport.map(item=>['Transport',`${slug}-transport`,`<div class="ability-list">${abilityCard(item,unit)}</div>`]),
    ...(unit.relations?.transport?.length?[['Transport',`${slug}-transport`,unit.relations.transport.map(text=>`<p data-source-field="relations.transport">${esc(text)}</p>`).join('')]]:[]),
    ...grouped.damaged.map(item=>['Damaged',`${slug}-damaged`,`<div class="ability-list">${abilityCard(item,unit)}</div>`]),
    ...(wargear.length?[['Wargear Options',`${slug}-wargear-options`,`<ul>${wargear.map(x=>`<li>${decorate(x,unit.id)}</li>`).join('')}</ul>`]]:[]),
    ...(wargearAbilities.length?[['Wargear Abilities',`${slug}-wargear-abilities`,`<p class="unit-note">These abilities apply only while the corresponding wargear is equipped.</p><div class="ability-list">${wargearAbilities.map((item,index)=>abilityCard(item,unit,canonicalWargearAbilityId(unit,item,index))).join('')}</div>`]]:[]),
    ['Keywords',`${slug}-keywords`,`<div class="keyword-list">${unit.keywords.map(x=>`<span data-source-field="keywords.${esc(slugKey(x))}">${esc(x)}</span>`).join('')}</div>${modelKeywords(unit)}`]
  ];
  const tabs=parts.map(([label,id])=>`<button class="local-tab" data-journey-target="${id}" data-journey-type="datasheet">${label}</button>`).join('');
  const sections=parts.map(([label,id,body])=>`<section class="unit-part" id="${id}"><h4>${label}</h4>${body}</section>`).join('');
  const provenance=unit.sourcePages
    ?`<div class="source">${sourceLink(unit.sourcePages)}</div>${transcript(unit.sourcePages)}`
    :unit.source?.url?`<div class="source"><a class="source-link" href="${esc(unit.source.url)}">${esc(unit.source.label||'Pinned Codex transcription')}</a></div>`:'';
  const art=renderUnitArt({unit,unitImages,escape:esc});
  const artClass=art?(unitImages[unit.id]?.presentation?.mode==='background'?' has-unit-art-background':' has-unit-art'):'';
  return `<article class="unit-card surface${unit.status==='Warhammer Legends'?' legends-card':''}${artClass}" id="${unit.id}" data-track="${unit.id}" data-unit-title="${esc(unit.title)}" data-rule-facts="${esc(JSON.stringify(unit.ruleFacts))}"><div class="unit-header"><div><div class="eyebrow">${esc(unit.status)}</div><h3>${esc(unit.title)}</h3></div>${art}<div class="unit-status">${unit.status==='Warhammer Legends'?'LEGENDS':points?`${esc(points)}${points==='MULTIPLE COSTS'?'':' PTS'}`:'CODEX'}</div></div><div class="local-nav">${tabs}</div>${sections}${provenance}</article>`;
};
const datasheetGroups=datasheetCategories.map(group=>tracked(group.id,group.title,`<p class="lead">${group.units.length} datasheet${group.units.length===1?'':'s'} in this category.</p>${group.units.map(unitCard).join('')}`)).join('');
const glossaryGroup=(id,title,terms)=>tracked(id,title,`<div class="glossary-grid">${terms.map(term=>`<article class="glossary-card surface" id="glossary-${term.id}" data-glossary-title="${esc(term.title)}"><h4>${esc(term.title)}</h4><p>${esc(cleanText(term.summary))}</p><p class="glossary-full">${esc(cleanText(term.full))}</p>${term.sectionId?`<button class="popup-action" data-journey-target="${term.sectionId}" data-journey-type="rule">Open rule</button>`:''}</article>`).join('')}</div>`);
const glossary=glossaryGroups.map(group=>glossaryGroup(group.id,group.title,group.terms)).join('');

const trackedCount=[...toc.matchAll(/data-nav-target="([^"]+)"/g)].length;
const sourceStatus=`<div class="source-grid"><article class="rule-card surface"><div class="eyebrow">Primary official source</div><h3>Adeptus Mechanicus Faction Pack v1.0</h3><p>26 pages · SHA-256 <code>${rules.source.sha256}</code></p><p>${sourceLink([1])}</p></article><article class="rule-card surface"><div class="eyebrow">Official live points · dated capture</div><h3>Munitorum Field Manual ${esc(pointsCatalog.source.officialVersion)}</h3><p>Dated repository capture verified ${esc(pointsCatalog.source.verifiedAt)}; all 34 current Enhancement costs and all non-Legends unit point rows match the official live source.</p><p><a class="source-link" href="${esc(pointsCatalog.source.officialUrl)}">Open official MFM</a></p></article><article class="rule-card surface"><div class="eyebrow">Codex transcription layer</div><h3>${rules.datasheets.length} indexed datasheets</h3><p>Codex profiles are generated from a pinned 11th-edition community catalogue. Every sheet reprinted by GW is replaced with the official Faction Pack version.</p><p><a class="source-link" href="${codexDatasheetsSource.url}">Pinned catalogue · revision ${esc(codexDatasheetsSource.revision)}</a></p></article></div>`;
const html=`<!doctype html>
<html lang="en" data-theme="dark"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="theme-color" content="#101313"><meta name="description" content="Adeptus Mechanicus Faction Pack and current Codex rules reference."><title>Adeptus Mechanicus Rules — Faction Pack v1.0</title><link rel="manifest" href="../../manifest.webmanifest"><link rel="icon" href="./assets/mechanicus-logo.png" type="image/png"><link rel="stylesheet" href="./styles/tokens.css?v=${config.assetVersions.tokens}"><link rel="stylesheet" href="../shared/styles/layout.css?v=${runtimeVersions.shared.readerLayout}"><link rel="stylesheet" href="../shared/styles/navigation.css?v=${runtimeVersions.shared.readerNavigationCss}"><link rel="stylesheet" href="../shared/styles/content.css?v=${runtimeVersions.shared.readerContent}"><link rel="stylesheet" href="../shared/styles/popups.css?v=${runtimeVersions.shared.readerPopups}"><link rel="stylesheet" href="../shared/styles/offline-status.css?v=${runtimeVersions.shared.offlineStatusCss}"><link rel="stylesheet" href="./styles/mechanicus.css?v=${config.assetVersions.book}"><link rel="stylesheet" href="../shared/datasheet-system.css?v=8"><link rel="stylesheet" href="../shared/unit-art.css?v=${runtimeVersions.shared.unitArt}"></head><body>
<header class="app-header" id="appHeader"><button class="header-button nav-menu" id="navMenu" type="button" aria-label="Open navigation" aria-controls="tocPanel" aria-expanded="false">☰</button><button class="header-button nav-collapse" id="navCollapse" type="button" aria-label="Collapse navigation" aria-controls="tocPanel" aria-expanded="true">◀</button><div class="app-brand"><strong>Adeptus Mechanicus Rules</strong><small>11E · Adeptus Mechanicus reference</small></div><a class="library-link" href="../../index.html" aria-label="Back to rulebook library"><span aria-hidden="true">←</span><b>Library</b></a><button class="back-button" id="backButton" type="button" hidden>Back</button><div class="header-spacer"></div></header><button class="toc-scrim" id="tocScrim" type="button" aria-label="Close navigation" aria-hidden="true"></button>
<nav class="toc-panel" id="tocPanel" aria-label="Rulebook navigation"><h2 class="toc-heading">Contents</h2><div class="toc-shortcuts"><a class="toc-label" href="../../glossary/index.html">Mega Glossary</a><a class="toc-label" data-roster-guides href="../../roster-guides/index.html" hidden>← Roster Guides</a></div><ul class="toc-tree" id="tocTree">${toc}</ul></nav>
<main class="main" id="main"><div class="document">
<section class="hero section surface am-hero" id="start" data-track="start"><div class="hero-content"><div class="eyebrow">11th Edition Army Book</div><h1>Adeptus Mechanicus</h1><p>Current Faction Pack rules combined with the applicable carried-forward Codex Detachments and datasheets.</p><div class="source">Faction Pack v${esc(rules.source.version)} · Munitorum Field Manual ${esc(pointsCatalog.source.officialVersion)}</div></div><div class="hero-mark"><img src="./assets/mechanicus-logo.png" width="512" height="512" alt="Adeptus Mechanicus emblem"><span>Faction reference</span></div></section>
<section class="section" id="core-rules" data-track="core-rules"><h2 class="section-title">Core Rules</h2><p class="lead">Faction rules replaced by Faction Pack v1.0.</p>${armyRule}</section>
<section class="section" id="detachments" data-track="detachments"><h2 class="section-title">Detachments</h2><p class="lead">All ten Adeptus Mechanicus Detachments currently listed for 11th edition: five carried forward from Codex and five printed in Faction Pack v1.0.</p><div class="detachment-overview surface"><strong>10 TOTAL</strong><span>5 Codex</span><span>5 Faction Pack</span></div>${detachments}</section>
<section class="section" id="datasheets" data-track="datasheets"><h2 class="section-title">Datasheets</h2><p class="lead">${rules.datasheets.length} Codex and Faction Pack datasheets, grouped by battlefield role.</p>${datasheetGroups}</section>
<section class="section" id="updates" data-track="updates"><h2 class="section-title">Updates</h2><p class="lead">Official replacement text and FAQ, with page transcripts for verification.</p>${updates}<div class="source-library"><h3 class="category-title">Sources & Build Status</h3>${sourceStatus}</div></section>
<footer class="footer">Adeptus Mechanicus · Faction Pack v1.0 · data-driven local edition</footer></div></main><div class="popup-layer" id="popupLayer" aria-live="polite"></div><script src="../../glossary/v2/generated/index.en.js?v=1"></script><script src="../../glossary/v2/runtime/glossary-v2-runtime.js?v=1"></script><script src="../shared/roster-parser.js?v=${runtimeVersions.shared.rosterParser}"></script><script src="../shared/roster-entities.js?v=1"></script><script src="../../roster-guides/points-data.js?v=${runtimeVersions.points.data}"></script><script src="../../roster-guides/points-validator.js?v=${runtimeVersions.points.validator}"></script><script src="../shared/navigation-targets.js?v=${runtimeVersions.shared.navigationTargets}"></script><script src="../shared/popup-rule-actions.js?v=1"></script><script src="../shared/datasheet-layout.js?v=6"></script><script src="../shared/popup-content.js?v=3"></script><script src="../shared/glossary-autolink.js?v=7"></script><script src="./scripts/data.js?v=${config.assetVersions.data}"></script><script src="../shared/controllers/navigation-controller.js?v=${runtimeVersions.shared.navigationController}"></script><script src="../shared/controllers/full-entry-controller.js?v=${runtimeVersions.shared.fullEntryController}"></script><script src="../shared/controllers/popup-controller.js?v=${runtimeVersions.shared.popupController}"></script><script src="../shared/controllers/journey-controller.js?v=${runtimeVersions.shared.journeyController}"></script><script src="../shared/controllers/ui-controllers.js?v=${runtimeVersions.shared.uiControllers}"></script><script src="./scripts/faction-ui.js?v=1"></script><script src="./scripts/roster-data.js?v=${runtimeVersions.shared.rosterCatalog}"></script><script src="../shared/effect-contract-runtime.js?v=${runtimeVersions.shared.effectContractRuntime}"></script><script src="./scripts/roster-enhancements.js?v=${config.assetVersions.rosterEnhancements}"></script><script src="./scripts/roster-filter.js?v=7"></script><script src="./scripts/app.js?v=41"></script></body></html>\n`;

const terms={};
for(const term of rules.glossary)terms[term.id]={title:term.title,summary:term.summary,full:term.full,glossary:`glossary-${term.id}`,...(term.sectionId?{rule:term.sectionId}:{}),...(term.fullRulePath?{fullRulePath:term.fullRulePath}:{}),...(term.unitIds?.length?{units:term.unitIds,datasheet:term.unitIds[0],statline:`${term.unitIds[0].replace('unit-','')}-profile`}:{})};
const dataJs=`window.DG_TERMS=${JSON.stringify(terms,null,2)};\n`;
const releaseHtml=html
  .replace('<button class="back-button" id="backButton" type="button" hidden>','<a class="library-link view-switch" href="./reader.html?view=mobile" data-view-switch><span aria-hidden="true">↔</span><b>Phone view</b></a><button class="back-button" id="backButton" type="button" hidden>')
  .replace('../shared/datasheet-layout.js?v=6',`../shared/datasheet-layout.js?v=${runtimeVersions.shared.datasheetLayout}`)
  .replace(/<section class="unit-part" id="([^"]+-profile)">([\s\S]*?)<\/section>/g,(section,ownerId,body)=>`<section class="unit-part" id="${ownerId}">${body
    .replace('<div class="model-profile"',`<div class="model-profile" data-logical-owner="${ownerId}"`)
    .replace('<div class="statline"',`<div class="statline" data-logical-owner="${ownerId}"`)}</section>`)
  .replaceAll('Faction Pack v1.0',`Faction Pack v${rules.source.version}`)
  .replace(/26 pages([^S]+)SHA-256/,`${rules.source.pages} pages$1SHA-256`)
  .replace('<script src="../shared/navigation-targets.js', `<script src="../../glossary-return.js?v=${runtimeVersions.shared.glossaryReturn}"></script><script src="../shared/navigation-targets.js`)
  .replace('../shared/glossary-autolink.js?v=7','../shared/glossary-autolink.js?v=9')
  .replace('<script src="./scripts/faction-ui.js?v=1"></script>',`<script src="./scripts/faction-ui.js?v=${config.assetVersions.factionUi}"></script><script src="../shared/rule-facts.js?v=${runtimeVersions.shared.ruleFacts}"></script><script src="../shared/modal-focus.js?v=1"></script><script src="../shared/army-related-rules.js?v=${runtimeVersions.shared.relatedRules}"></script><script src="../shared/roster-context.js?v=${runtimeVersions.shared.rosterContext}"></script><script src="../shared/roster-game-presentation.js?v=${runtimeVersions.shared.rosterGamePresentation}"></script><script src="../shared/offline-status.js?v=${runtimeVersions.shared.offlineStatus}" data-service-worker="../../service-worker.js"></script><script src="../shared/army-book-app.js?v=${runtimeVersions.shared.armyBook}"></script>`)
  .replace('./scripts/roster-filter.js?v=7',`./scripts/roster-filter.js?v=${config.assetVersions.rosterFilter}`)
  .replace('popup-controller.js?v=18','popup-controller.js?v=21')
  .replace('app.js?v=41',`app.js?v=${config.assetVersions.app}`);
const entryHtml=`<!doctype html>
<html lang="en" data-canonical-reader="./reader.html" data-canonical-target="start"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Adeptus Mechanicus Rules</title><script src="../shared/mobile-route-redirect.js?v=${runtimeVersions.shared.mobileRouteRedirect}"></script></head><body><noscript><a href="./reader.html#start">Open Adeptus Mechanicus Rules</a></noscript></body></html>\n`;

if(/data-term="[^"]*</i.test(html))throw new Error('Generated data-term attributes must never contain markup');
for(const match of html.matchAll(/data-term="([^"]+)"/g))if(!termIds.has(match[1]))throw new Error(`Generated page references unknown term: ${match[1]}`);

validate();

return {
  readerSource:releaseHtml,
  indexHtml:entryHtml,
  dataJs,
  normalizeLineEndings:false,
  summary:`Adeptus Mechanicus effective-model publication: ${allDetachments.length} detachments, ${rules.datasheets.length} datasheets`
};
}


import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const readJson=file=>JSON.parse(fs.readFileSync(path.join(root,file),'utf8'));
const factionRules=readJson('content/adeptus-mechanicus-rules.en.json');
const source=readJson('content/adeptus-mechanicus-source.en.json');
const codex=readJson('content/adeptus-mechanicus-codex-detachments.en.json');
const codexDatasheets=readJson('content/adeptus-mechanicus-codex-datasheets.en.json');
const factionDatasheets=new Map(factionRules.datasheets.map(unit=>[unit.id,unit]));
const mergedDatasheets=codexDatasheets.datasheets.map(unit=>{
  const official=factionDatasheets.get(unit.id);
  if(!official)return unit;
  factionDatasheets.delete(unit.id);
  return {...unit,...official,category:unit.category,profiles:[{name:official.title,stats:official.stats}]};
}).concat([...factionDatasheets.values()]);
const rules={...factionRules,datasheets:mergedDatasheets,audit:{...factionRules.audit,datasheets:mergedDatasheets.length,legendsDatasheets:mergedDatasheets.filter(unit=>unit.status==='Warhammer Legends').length}};
const officialOrder=['detachment-cohort-acquisitus','detachment-lords-of-the-forge','detachment-luminen-auto-choir','detachment-cohort-cybernetica','detachment-data-psalm-conclave','detachment-eradication-cohort','detachment-explorator-maniple','detachment-haloscreed-battle-clade','detachment-rad-zone-corps','detachment-skitarii-hunter-cohort'];
const allDetachments=[...rules.detachments,...codex.detachments].sort((a,b)=>officialOrder.indexOf(a.id)-officialOrder.indexOf(b.id));
const esc=value=>String(value??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const slugify=value=>String(value).toLowerCase().replaceAll('’','').replaceAll("'",'').replaceAll(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const glossaryTerms=rules.glossary.map(term=>({...term,group:term.group==='Core abilities'?'Core abilities':'Faction & publication',unitIds:[...(term.unitIds||[])]}));
const termKeys=new Map(glossaryTerms.map(term=>[term.title.toLowerCase(),term]));
const termIds=new Set(glossaryTerms.map(term=>term.id));
const uniqueTermId=base=>{let id=base,index=2;while(termIds.has(id))id=`${base}-${index++}`;termIds.add(id);return id;};
const attachUnit=(term,unitId)=>{if(!term.unitIds.includes(unitId))term.unitIds.push(unitId);};
for(const unit of rules.datasheets){
  for(const ability of unit.abilities){
    const key=ability.title.toLowerCase();
    let term=termKeys.get(key);
    if(!term){
      const full=ability.text||`${ability.title} is listed on the ${unit.title} datasheet.`;
      term={id:uniqueTermId(`datasheet-${slugify(ability.title)}`),title:ability.title,group:'Datasheet abilities',summary:full.split(/(?<=[.!?])\s/)[0].slice(0,220),full,sectionId:unit.id,unitIds:[]};
      glossaryTerms.push(term);termKeys.set(key,term);
    }
    attachUnit(term,unit.id);ability.termId=term.id;
  }
  for(const weapon of unit.weapons){
    const profile=`${weapon.mode==='ranged'?'Ranged':'Melee'} · ${weapon.range} · A ${weapon.a} · ${weapon.mode==='ranged'?'BS':'WS'} ${weapon.skill} · S ${weapon.s} · AP ${weapon.ap} · D ${weapon.d}${weapon.abilities?` · ${weapon.abilities}`:''}`;
    const key=`weapon:${weapon.name.toLowerCase()}:${profile}`;
    let term=termKeys.get(key);
    if(!term){
      term={id:uniqueTermId(`weapon-${slugify(weapon.name.replace(/^➤\s*/,''))}`),title:weapon.name.replace(/^➤\s*/,''),group:'Weapon profiles',summary:profile,full:profile,sectionId:unit.id,unitIds:[]};
      glossaryTerms.push(term);termKeys.set(key,term);
    }
    attachUnit(term,unit.id);weapon.termId=term.id;
  }
}
rules.glossary=glossaryTerms;
rules.audit.glossaryTerms=glossaryTerms.length;
const pagesLabel=pages=>pages.length===1?`p. ${pages[0]}`:`pp. ${pages[0]}–${pages.at(-1)}`;
const sourceLink=pages=>`<a class="source-link" href="./sources/adeptus-mechanicus-faction-pack-v1.0.pdf#page=${pages[0]}">Faction Pack v1.0 · ${pagesLabel(pages)}</a>`;
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
  const raw=String(value??'');
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
  const navigationRuntime=fs.readFileSync(path.join(root,'scripts/navigation-controller.js'),'utf8');
  if(source.meta.pageCount!==26)fail('Expected 26 source pages');
  if(source.meta.sha256!==rules.source.sha256)fail('Source hashes disagree');
  if(rules.detachments.length!==rules.audit.detachments)fail('Detachment audit mismatch');
  if(allDetachments.length!==10)fail('Expected ten total Adeptus Mechanicus detachments');
  if(rules.datasheets.length!==codexDatasheets.audit.datasheets)fail('Codex datasheet audit mismatch');
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
  if(!navigationRuntime.includes("stable=atDestination&&"))fail('Navigation stable frames must only count at the reachable destination');
  if(navigationRuntime.includes("if(atDestination||stable>=this.options.stableFrames)"))fail('Navigation must not release scroll-spy on the first destination frame');
  if(!navigationRuntime.includes("window.scrollTo({top:this.reachableDestination(destination)"))fail('Navigation timeout must finish at the reachable destination before releasing scroll-spy');
}

const detNav=allDetachments.map(det=>{
  const slug=det.id.replace('detachment-','');
  return navBranch(det.id,det.title,2,navLeaf(det.rule.id,'Detachment Rule',3)+navLeaf(`${slug}-enhancements`,'Enhancement',3)+navLeaf(`${slug}-stratagems`,'Stratagems',3));
}).join('');
const categoryOrder=['Epic Heroes','Characters','Battleline','Dedicated Transports','Other','Warhammer Legends'];
const datasheetCategories=categoryOrder.map(title=>({title,id:`datasheets-${title.toLowerCase().replaceAll(/[^a-z0-9]+/g,'-')}`,units:rules.datasheets.filter(unit=>unit.category===title)})).filter(group=>group.units.length);
const glossaryOrder=['Core abilities','Faction & publication','Datasheet abilities','Weapon profiles'];
const glossaryGroups=glossaryOrder.map(title=>({title,id:title==='Core abilities'?'glossary-core':title==='Faction & publication'?'glossary-faction':`glossary-${slugify(title)}`,terms:rules.glossary.filter(term=>term.group===title)})).filter(group=>group.terms.length);
const toc=navLeaf('start','Start',1)
  +navBranch('updates','Updates',1,rules.updates.map(x=>navLeaf(x.id,x.title,2)).join(''))
  +navBranch('core-rules','Core Rules',1,navBranch(rules.armyRule.id,rules.armyRule.title,2,rules.armyRule.options.map(x=>navLeaf(x.id,x.label,3)).join('')))
  +navBranch('detachments','Detachments',1,detNav)
  +navBranch('datasheets','Datasheets',1,datasheetCategories.map(group=>navBranch(group.id,group.title,2,group.units.map(x=>navLeaf(x.id,x.title,3)).join(''))).join(''))
  +navBranch('glossary','Glossary',1,glossaryGroups.map(group=>navLeaf(group.id,group.title,2)).join(''));

const updates=rules.updates.map(item=>tracked(item.id,item.title,`<article class="rule-card surface"><div class="eyebrow">Official update</div><p>${decorate(item.summary)}</p><div class="source">${sourceLink(item.sourcePages)}</div>${transcript(item.sourcePages)}</article>`)).join('');
const options=rules.armyRule.options.map((option,index)=>`<button class="protocol${option.id===rules.armyRule.options.find(x=>x.id.endsWith(rules.armyRule.default))?.id||(!index?'':' active')}" data-protocol="${option.id.split('-')[0]}"><span>${esc(option.symbol)}</span><b>${esc(option.label)}</b><small>${esc(option.subtitle)}</small></button>`).join('');
const optionPanels=rules.armyRule.options.map(option=>`<section id="${option.id}" data-track="${option.id}"${option.id.endsWith(rules.armyRule.default)?'':' hidden'}><b>${esc(option.label.toUpperCase())} IMPERATIVE</b><ul>${option.effects.map(x=>`<li>${decorate(x)}</li>`).join('')}</ul></section>`).join('');
const armyRule=tracked(rules.armyRule.id,rules.armyRule.title,`<article class="doctrina-console surface"><div class="doctrina-code"><span>DOCTRINA</span><strong>Ω-01</strong></div><div class="doctrina-body"><div class="eyebrow">Battle Protocol</div><p>Select the active imperative. The console shows the complete Faction Pack v1.0 replacement.</p><div class="protocol-switch" role="group" aria-label="Select Doctrina Imperative">${options}</div><div class="protocol-result">${optionPanels}</div><div class="source">${sourceLink(rules.armyRule.sourcePages)}</div></div></article>`);

const detachments=allDetachments.map(det=>{
  const slug=det.id.replace('detachment-','');
  const enhancements=det.enhancements.map(item=>`<article class="enhancement surface"><div class="eyebrow">Enhancement</div><h4>${esc(item.title)}</h4><p>${decorate(item.text)}</p></article>`).join('');
  const stratagems=det.stratagems.map(item=>`<article class="stratagem surface"><div class="stratagem-head"><div><h3>${esc(item.title)}</h3><span class="stratagem-type">${esc(item.category)}</span></div><div class="cp">${esc(item.cp)}</div></div><p class="field"><b>When</b><br>${decorate(item.when)}</p>${item.target?`<p class="field"><b>Target</b><br>${decorate(item.target)}</p>`:''}<p class="field"><b>Effect</b><br>${decorate(item.effect)}</p></article>`).join('');
  const isCodex=!det.sourcePages;
  const publication=`<div class="detachment-meta"><span>${isCodex?'CODEX + 11E UPDATE':'FACTION PACK'}</span>${det.disposition?`<span>${esc(det.disposition)}</span>`:''}${det.dp?`<strong>${esc(det.dp)}</strong>`:''}</div>`;
  const provenance=isCodex?`<div class="source"><a class="source-link" href="${codex.source.officialIndexUrl}">Official 11e detachment index</a> · <a class="source-link" href="${codex.source.referenceUrl}">Codex rules reference</a>${det.updatedSourcePages?.length?` · ${sourceLink(det.updatedSourcePages)}`:''}</div>${det.updatedSourcePages?.length?transcript(det.updatedSourcePages):''}`:`<div class="source">${sourceLink(det.sourcePages)}</div>${transcript(det.sourcePages)}`;
  const body=`${publication}<p class="lead">${esc(det.tagline)}</p><div class="detachment-content">${tracked(det.rule.id,'Detachment Rule',`<article class="rule-card surface"><h3>${esc(det.rule.title)}</h3><p>${decorate(det.rule.text)}</p></article>`,'detachment-part')}${tracked(`${slug}-enhancements`,'Enhancements',`<div class="detachment-grid">${enhancements}</div>`,'detachment-part')}${tracked(`${slug}-stratagems`,'Stratagems',stratagems,'detachment-part')}</div>${provenance}`;
  return tracked(det.id,det.title,body);
}).join('');

const stats=unit=>(unit.profiles?.length?unit.profiles:[{name:unit.title,stats:unit.stats}]).map(profile=>`<div class="model-profile">${unit.profiles?.length>1?`<h5>${esc(profile.name)}</h5>`:''}<div class="statline">${Object.entries(profile.stats).map(([key,value])=>`<div class="stat"><b>${key}</b><span>${esc(value)}</span></div>`).join('')}${unit.invulnerable?`<div class="stat invulnerable"><b>InSv</b><span>${esc(unit.invulnerable)}</span></div>`:''}</div></div>`).join('');
const weapons=unit=>['ranged','melee'].map(mode=>{
  const rows=unit.weapons.filter(x=>x.mode===mode);
  if(!rows.length)return '';
  const skillLabel=mode==='ranged'?'BS':'WS';
  return `<div class="weapon-group"><h5>${mode==='ranged'?'Ranged':'Melee'} weapons</h5><div class="weapon-table" role="table" aria-label="${esc(unit.title)} ${mode} weapons"><div class="weapon-row weapon-head"><div>Weapon</div><div>Range</div><div>A</div><div>${skillLabel}</div><div>S</div><div>AP</div><div>D</div></div>${rows.map(w=>`<div class="weapon-row"><div><button class="weapon-button" data-term="${w.termId}">${esc(w.name)}</button>${w.abilities?`<small>${decorate(w.abilities,unit.id)}</small>`:''}</div><div data-label="Range">${esc(w.range)}</div><div data-label="A">${esc(w.a)}</div><div data-label="${skillLabel}">${esc(w.skill)}</div><div data-label="S">${esc(w.s)}</div><div data-label="AP">${esc(w.ap)}</div><div data-label="D">${esc(w.d)}</div></div>`).join('')}</div></div>`;
}).join('');
const unitCard=unit=>{
  const slug=unit.id.replace('unit-','');
  const parts={profile:`${slug}-profile`,abilities:`${slug}-abilities`,composition:`${slug}-composition`,keywords:`${slug}-keywords`};
  const tabs=Object.entries(parts).map(([label,id])=>`<button class="local-tab" data-journey-target="${id}" data-journey-type="datasheet">${label[0].toUpperCase()+label.slice(1)}</button>`).join('');
  const abilities=unit.abilities.map(item=>`<article class="ability"><h5><button class="term-button" data-term="${item.termId}">${esc(item.title)}</button></h5>${item.text?`<p>${decorate(item.text,unit.id)}</p>`:''}</article>`).join('');
  const wargear=Array.isArray(unit.wargear)?unit.wargear:(unit.wargear?[unit.wargear]:[]);
  const gear=wargear.length?`<h5>Wargear Options</h5><ul>${wargear.map(x=>`<li>${decorate(x,unit.id)}</li>`).join('')}</ul>`:'';
  const provenance=unit.sourcePages?`<div class="source">${sourceLink(unit.sourcePages)}</div>${transcript(unit.sourcePages)}`:`<div class="source"><a class="source-link" href="${esc(unit.source?.url||unit.referenceUrl)}">${esc(unit.source?.label||'Codex transcription')}</a>${unit.referenceUrl?` · <a class="source-link" href="${esc(unit.referenceUrl)}">Rules reference</a>`:''}</div>`;
  const points=unit.points?.length?unit.points.join(' / '):'';
  return `<article class="unit-card surface${unit.status==='Warhammer Legends'?' legends-card':''}" id="${unit.id}" data-track="${unit.id}"><div class="unit-header"><div><div class="eyebrow">${esc(unit.status)}</div><h3>${esc(unit.title)}</h3></div><div class="unit-status">${unit.status==='Warhammer Legends'?'LEGENDS':points?`${esc(points)} PTS`:'CODEX'}</div></div><div class="local-nav">${tabs}</div><section class="unit-part" id="${parts.profile}"><h4>Profile & Weapons</h4>${stats(unit)}${weapons(unit)}</section><section class="unit-part" id="${parts.abilities}"><h4>Abilities</h4><div class="ability-list">${abilities}</div></section><section class="unit-part" id="${parts.composition}"><h4>Composition & Wargear</h4><p>${decorate(unit.composition,unit.id)}</p>${gear}</section><section class="unit-part" id="${parts.keywords}"><h4>Keywords</h4><div class="keyword-list">${unit.keywords.map(x=>`<span>${esc(x)}</span>`).join('')}</div></section>${provenance}</article>`;
};
const datasheetGroups=datasheetCategories.map(group=>tracked(group.id,group.title,`<p class="lead">${group.units.length} datasheet${group.units.length===1?'':'s'} in this category.</p>${group.units.map(unitCard).join('')}`)).join('');
const glossaryGroup=(id,title,terms)=>tracked(id,title,`<div class="glossary-grid">${terms.map(term=>`<article class="glossary-card surface" id="glossary-${term.id}" data-glossary-title="${esc(term.title)}"><h4>${esc(term.title)}</h4><p>${esc(term.summary)}</p><p class="glossary-full">${esc(term.full)}</p>${term.sectionId?`<button class="popup-action" data-journey-target="${term.sectionId}" data-journey-type="rule">Open rule</button>`:''}</article>`).join('')}</div>`);
const glossary=glossaryGroups.map(group=>glossaryGroup(group.id,group.title,group.terms)).join('');

const trackedCount=[...toc.matchAll(/data-nav-target="([^"]+)"/g)].length;
const sourceStatus=`<div class="source-grid"><article class="rule-card surface"><div class="eyebrow">Primary official source</div><h3>Adeptus Mechanicus Faction Pack v1.0</h3><p>26 pages · SHA-256 <code>${rules.source.sha256}</code></p><p>${sourceLink([1])}</p></article><article class="rule-card surface"><div class="eyebrow">Codex transcription layer</div><h3>${rules.datasheets.length} complete datasheets</h3><p>Codex profiles are generated from the pinned BSData catalogue; all eight Faction Pack and Legends sheets printed by GW are overlaid from the official PDF.</p><p><a class="source-link" href="${codexDatasheets.source.url}">Pinned catalogue · revision ${esc(codexDatasheets.source.revision)}</a></p></article></div>`;
const html=`<!doctype html>
<html lang="en" data-theme="dark"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="theme-color" content="#101313"><meta name="description" content="Complete local Adeptus Mechanicus Faction Pack v1.0 rules reference."><title>Adeptus Mechanicus Rules — Faction Pack v1.0</title><link rel="manifest" href="../../manifest.webmanifest"><link rel="icon" href="./assets/mechanicus-logo.png" type="image/png">${['tokens','layout','navigation','content','popups','mechanicus'].map(x=>`<link rel="stylesheet" href="./styles/${x}.css?v=${x==='content'?'14':x==='popups'?'16':'13'}">`).join('')}<link rel="stylesheet" href="../shared/datasheet-system.css?v=5"></head><body>
<header class="app-header" id="appHeader"><button class="header-button nav-menu" id="navMenu" type="button" aria-label="Open navigation" aria-controls="tocPanel" aria-expanded="false">☰</button><button class="header-button nav-collapse" id="navCollapse" type="button" aria-label="Collapse navigation" aria-controls="tocPanel" aria-expanded="true">◀</button><button class="app-brand" type="button" data-header-home><strong>Adeptus Mechanicus Rules</strong><small>Faction Pack v1.0 · complete local build</small></button><a class="library-link" href="../../index.html" aria-label="Back to rulebook library"><span aria-hidden="true">←</span><b>Library</b></a><a class="library-link" href="../../glossary/index.html"><b>Mega Glossary</b></a><button class="back-button" id="backButton" type="button" hidden>Back</button><div class="header-spacer"></div><button class="header-button" id="themeButton" type="button" aria-label="Use light theme">☼</button></header><button class="toc-scrim" id="tocScrim" type="button" aria-label="Close navigation" aria-hidden="true"></button>
<nav class="toc-panel" id="tocPanel" aria-label="Rulebook navigation"><h2 class="toc-heading">Contents</h2><label class="toc-search" for="navSearch"><span aria-hidden="true">⌕</span><input id="navSearch" type="search" placeholder="Find a section…" autocomplete="off"></label><ul class="toc-tree" id="tocTree">${toc}</ul></nav>
<main class="main" id="main"><div class="document"><div class="reader-tools surface" id="readerTools"><label for="globalSearch"><span aria-hidden="true">⌕</span><input id="globalSearch" type="search" placeholder="Search rules, units and terms…" autocomplete="off"></label><button id="globalSearchClear" type="button" hidden>Clear</button><span class="reader-status">${trackedCount} TARGETS // LOCAL</span></div><section class="search-results surface" id="searchResults" hidden aria-live="polite"></section>
<section class="hero section surface am-hero" id="start" data-track="start"><div class="hero-content"><div class="eyebrow">11th Edition // 10 Detachments // ${rules.datasheets.length} Datasheets</div><h1>Flesh fails.<br><em>The Machine endures.</em></h1><p>Complete Adeptus Mechanicus rules reference: Codex army, all current Detachments, Faction Pack replacements, Legends, updates and FAQ.</p><div class="source">Faction Pack legal from 20 June 2026 · Codex transcription pinned and audited</div></div><div class="hero-mark"><img src="./assets/mechanicus-logo.png" width="512" height="512" alt="Adeptus Mechanicus emblem"><span>THE OMNISSIAH KNOWS ALL</span></div></section>
<section class="section" id="updates" data-track="updates"><h2 class="section-title">Updates</h2><p class="lead">Official replacement text and FAQ, with page transcripts for verification.</p>${updates}<div class="source-library"><h3 class="category-title">Sources & Build Status</h3>${sourceStatus}</div></section>
<section class="section" id="core-rules" data-track="core-rules"><h2 class="section-title">Core Rules</h2><p class="lead">Faction rules replaced by Faction Pack v1.0.</p>${armyRule}</section>
<section class="section" id="detachments" data-track="detachments"><h2 class="section-title">Detachments</h2><p class="lead">All ten Adeptus Mechanicus Detachments currently listed for 11th edition: five carried forward from Codex and five printed in Faction Pack v1.0.</p><div class="detachment-overview surface"><strong>10 TOTAL</strong><span>5 Codex</span><span>5 Faction Pack</span></div>${detachments}</section>
<section class="section" id="datasheets" data-track="datasheets"><h2 class="section-title">Datasheets</h2><p class="lead">${rules.datasheets.length} Codex, Faction Pack and Warhammer Legends datasheets, grouped by battlefield role.</p>${datasheetGroups}</section>
<section class="section" id="glossary" data-track="glossary"><h2 class="section-title">Glossary</h2><p class="lead">Searchable terms referenced by the Faction Pack.</p><div class="glossary-tools surface"><label class="sr-only" for="glossarySearch">Search glossary</label><input id="glossarySearch" type="search" placeholder="Search terms…" autocomplete="off"><button class="search-clear" id="searchClear" aria-label="Clear glossary search">×</button></div>${glossary}<div class="no-results" id="noResults" hidden>No matching terms.</div></section>
<footer class="footer">Adeptus Mechanicus · Faction Pack v1.0 · data-driven local edition</footer></div></main><div class="popup-layer" id="popupLayer" aria-live="polite"></div><script src="../../glossary/generated/glossary.en.js"></script><script src="../shared/navigation-targets.js?v=1"></script><script src="../shared/datasheet-layout.js?v=2"></script><script src="../shared/popup-content.js?v=2"></script><script src="../shared/glossary-autolink.js?v=7"></script>${['data','navigation-controller','popup-controller','journey-controller','ui-controllers','app'].map(x=>`<script src="./scripts/${x}.js?v=${x==='popup-controller'?'18':x==='app'?'17':'13'}"></script>`).join('')}</body></html>\n`;

const terms={};
for(const term of rules.glossary)terms[term.id]={title:term.title,summary:term.summary,full:term.full,glossary:`glossary-${term.id}`,...(term.sectionId?{rule:term.sectionId}:{}),...(term.unitIds?.length?{units:term.unitIds,datasheet:term.unitIds[0],statline:`${term.unitIds[0].replace('unit-','')}-profile`}:{})};
const dataJs=`window.DG_TERMS=${JSON.stringify(terms,null,2)};\n`;
const releaseHtml=html
  .replace('../../glossary/generated/glossary.en.js"','../../glossary/generated/glossary.en.js?v=3"')
  .replace('<script src="../shared/navigation-targets.js', '<script src="../../glossary-return.js?v=1"></script><script src="../shared/navigation-targets.js')
  .replace('../shared/glossary-autolink.js?v=7','../shared/glossary-autolink.js?v=8')
  .replace('popup-controller.js?v=18','popup-controller.js?v=20')
  .replace('ui-controllers.js?v=13','ui-controllers.js?v=14')
  .replace('app.js?v=17','app.js?v=19');
const outputs=new Map([['index.html',releaseHtml],['scripts/data.js',dataJs]]);

if(/data-term="[^"]*</i.test(html))throw new Error('Generated data-term attributes must never contain markup');
for(const match of html.matchAll(/data-term="([^"]+)"/g))if(!termIds.has(match[1]))throw new Error(`Generated page references unknown term: ${match[1]}`);

validate();
if(process.argv.includes('--check')){
  const stale=[];
  for(const [file,content] of outputs)if(!fs.existsSync(path.join(root,file))||fs.readFileSync(path.join(root,file),'utf8')!==content)stale.push(file);
  if(stale.length){console.error(`Generated artifacts are stale: ${stale.join(', ')}`);process.exit(1);}
  console.log(`Full build is current: ${allDetachments.length} detachments, ${rules.datasheets.length} datasheets, root PWA cache`);
}else{
  for(const [file,content] of outputs)fs.writeFileSync(path.join(root,file),content,'utf8');
  console.log(`Built full Mechanicus project: ${allDetachments.length} detachments, ${rules.datasheets.length} datasheets, root PWA cache`);
}

import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {verifyPdfParity} from '../tools/verify_pdf_parity.mjs';
import {recordText} from '../content/record-content.mjs';
import {createCoreFactProjection} from '../content/core-fact-projection.mjs';
import {createReaderPresentation} from './presentation.mjs';
import {createAutolinkTerms} from './term-bindings.mjs';

const root=path.dirname(fileURLToPath(import.meta.url));
const bookRoot=path.dirname(root);
const repoRoot=path.resolve(bookRoot,'..','..');
const runtimeVersions=JSON.parse(fs.readFileSync(path.join(repoRoot,'books','shared','runtime-asset-versions.json'),'utf8'));
const projection=createCoreFactProjection({repoRoot});
const catalog=projection.catalog;
const presentationBindings=JSON.parse(fs.readFileSync(path.join(root,'presentation-bindings.json'),'utf8'));
const readerPresentation=createReaderPresentation(catalog,presentationBindings);
const data=catalog.presentation.reader;
const pdf=projection.coreSource;
const modules=[
  {id:'introduction',title:'Introduction',sections:[data.introduction.id]},
  ...data.groups.map(group=>({id:group.id,title:group.title,sections:group.sections.map(section=>section.id)}))
];
const baseDigital=JSON.parse(fs.readFileSync(path.join(bookRoot,'content','core-rules.digital-11e.json'),'utf8'));
const parity=verifyPdfParity(pdf,baseDigital);
const digital={meta:catalog.presentation.baseMeta,images:catalog.presentation.images,records:catalog.mainRules,universalRulesUpdates:catalog.universalUpdates};
const sections=[data.introduction,...data.groups.flatMap(group=>group.sections)];
const byId=new Map(sections.map(section=>[section.id,section]));
const order=modules.flatMap(module=>module.sections);
const sectionByNumber=new Map(sections.filter(section=>section.number).map(section=>[section.number.padStart(2,'0'),section.id]));
const recordsBySection=new Map(order.map(id=>[id,[]]));
for(const record of digital.records){
  const id=sectionByNumber.get(record.code.slice(0,2));
  if(id)recordsBySection.get(id).push(record);
}
const pdfUrl='https://assets.warhammer-community.com/eng_01-06_warhammer40k_new40k_core_rules-was6fbu1ix-hfewhmxyiy.pdf';
const wahapediaUrl=digital.meta.source;

const diagramRules={
  'DatasheetExample.png':'02.01','ex2.png':'03.01','ex4.png':'03.01','ex5.png':'03.01','ex6.png':'03.03','ex7.png':'03.04',
  'ex8.png':'04.01','ex9.png':'05.04','ex10.png':'05.04','ex11.png':'19.02','ex12.png':'05.04',
  'ModelVisible.png':'06.01','ModelFullyVisible.png':'06.01','UnitVisible.png':'06.01','UnitFullyVisible.png':'06.01',
  'BattleShockExamples1.png':'08.03','BattleShockExamples2.png':'08.03','BattleShockExamples3.png':'08.03','BattleShockExamples4.png':'08.03',
  'MakingAChargeMove.png':'11.02',
  'StartOfFightPhase.png':'12.01','PileInMoves.png':'12.02','NormalFight.png':'12.05','OverrunFight.png':'12.06','OngoingConsolidation.png':'12.07','ObjectiveConsolidation.png':'12.07',
  'TerrainPlacedOnAMat.png':'13.01','TerrainPlacedOnTheBattlefield.png':'13.01','TerrainAndMovement.png':'13.06','TerrainAndMovement2.png':'13.06','BenefitOfCover.png':'13.08','HiddenAndObscuring.png':'13.09','Solid.png':'13.11',
  'ControllingATerrainObjective.png':'14.01','ExampleAction.png':'16.01','EngagedMonstersVehiclesShooting.png':'17.03',
  'MakingASurgeMove.png':'21.02','TakingToTheSkies.png':'21.03','PlungingFire.png':'22.05'
};
const diagramLabels={'ex9.png':'Resolving attack dice','ex10.png':'Resolving other attacks'};
const diagrams=Object.values(digital.images).flat();
const ruleReferences={
  '01.03':['core-active-player']
};
const faqs=catalog.faqs;

const escapeHtml=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const normalize=value=>String(value||'').replace(/\r/g,'').replace(/\s+/g,' ').trim();
const normalizeLabel=value=>String(value||'').replace(/[‘’]/g,"'").replace(/[–—]/g,'-').replace(/\s+/g,' ').trim().toLowerCase();
const escapeRegExp=value=>value.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
const slug=value=>String(value).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');

const coreTermById=new Map(projection.terms.map(term=>[term.id,{...term,title:{en:term.title},summary:{en:term.summary},definition:{en:term.definition},scope:'global',matchLabels:[term.code,...(term.aliases||[])].filter(Boolean)}]));
// A source citation is not an identity when separate source nodes reuse it.
const termByCode=new Map([...coreTermById.values()].filter(term=>term.code&&catalog.getByCode(term.code)).map(term=>[term.code,term]));
const excludedRuleId=record=>termByCode.get(record.code)?.id||record.id;
const recordAnchor=record=>record.fullRulePath?.split('#')[1]||`rule-${slug(record.code)}`;
const displayTitleOverrides={'24.37.01':'Torrent Restrictions'};
const displayTitle=rule=>displayTitleOverrides[rule.code]||rule.title;
const sectionReferences=new Map([
  ['16.00',{label:'Actions',term:termByCode.get('16.01')}],
  ['23.00',{label:'Aircraft',chapterId:sectionByNumber.get('23')}],
  ['17.00',{label:'Monsters and Vehicles',term:termByCode.get('17.01')}],
  ['20.00',{label:'Strategic Reserves',term:termByCode.get('20.01')}],
  ['18.00',{label:'Transports',term:termByCode.get('18.01')}]
]);
const chapterReferences=new Map([
  ['03',{label:'Moving',term:termByCode.get('03.01')}],
  ['04',{label:'Making Attacks',term:termByCode.get('04.01')}],
  ['05',{label:'Attack Sequence',term:termByCode.get('05.01')}],
  ['15',{label:'Stratagems',term:termByCode.get('15.01')}],
  ['16',{label:'Actions',term:termByCode.get('16.01')}],
  ['24',{label:'Abilities',term:termByCode.get('24.01')}]
]);

const ignoredAutolinkLabels=new Set(['you','attacks','within','weapons','destroyed','dice','set up','keywords','shoot','shooting','dense']);
const characteristicTerms=new Map([
  ['Move','02.02'],
  ['Toughness','02.02'],
  ['Save','02.02'],
  ['Invulnerable Save','02.02'],
  ['Wounds','02.02'],
  ['Leadership','02.02'],
  ['Objective Control','02.02'],
  ['Range','02.04'],
  ['Attacks','02.04'],
  ['Ballistic Skill','02.04'],
  ['Weapon Skill','02.04'],
  ['Strength','02.04'],
  ['Armour Penetration','02.04'],
  ['Damage','02.04']
]);
const terms=createAutolinkTerms({terms:[...coreTermById.values()],termByCode,referenceOnlyIds:presentationBindings.referenceOnlyAutolinkIds,ignoredLabels:ignoredAutolinkLabels});
const matcher=new RegExp(`(^|[^A-Za-z0-9])(${[...terms.keys()].sort((a,b)=>b.length-a.length).map(escapeRegExp).join('|')})(?=$|[^A-Za-z0-9])`,'gi');

function chapterLink(reference,label=reference.label){
  return `<a class="rule-reference" href="${escapeHtml(fileFor(reference.chapterId))}">${escapeHtml(label)}</a>`;
}

function termButton(term,label,extraClass=''){
  if(!term)return escapeHtml(label);
  return `<button class="term${extraClass?` ${extraClass}`:''}" type="button" data-term="${escapeHtml(term.id)}" data-term-title="${escapeHtml(term.title?.en||label)}" data-term-summary="${escapeHtml(term.summary?.en||'')}" data-term-definition="${escapeHtml(term.definition?.en||term.summary?.en||'')}"${term.fullRulePath?` data-full-rule-path="${escapeHtml(term.fullRulePath)}"`:''} aria-haspopup="dialog">${escapeHtml(label)}</button>`;
}

function linkedTerms(text,seen,excludedId){
  let cursor=0;
  let html='';
  matcher.lastIndex=0;
  for(let match=matcher.exec(text);match;match=matcher.exec(text)){
    const prefix=match[1]||'';
    const label=match[2];
    const start=match.index+prefix.length;
    const term=terms.get(normalizeLabel(label));
    html+=escapeHtml(text.slice(cursor,start));
    html+=term&&term.id!==excludedId&&!seen.has(term.id)?termButton(term,label):escapeHtml(label);
    if(term&&term.id!==excludedId)seen.add(term.id);
    cursor=start+label.length;
  }
  return html+escapeHtml(text.slice(cursor));
}

function linkedText(value,seen=new Set(),excludedId=''){
  const text=normalize(value);
  const characteristic=text.match(/^(Move|Toughness|Save|Invulnerable Save|Wounds|Leadership|Objective Control|Range|Attacks|Ballistic Skill|Weapon Skill|Strength|Armour Penetration|Damage) \((M|T|Sv|InSv|W|Ld|OC|R|A|BS|WS|S|AP|D)\):\s*/i);
  if(characteristic){
    const [label,id]=[...characteristicTerms].find(([label])=>label.toLowerCase()===characteristic[1].toLowerCase())||[];
    const term=termByCode.get(id);
    if(term){
      seen.add(id);
      return `${termButton(term,label)} ${escapeHtml(`(${characteristic[2]}):`)} ${linkedText(text.slice(characteristic[0].length),seen,excludedId)}`;
    }
  }
  const codeMatcher=/\(?\b\d{2}\.\d{2}(?:\.\d{2})?\b\)?|\((?:03|04|05|15|16|24)\)/g;
  let cursor=0;
  let html='';
  for(let match=codeMatcher.exec(text);match;match=codeMatcher.exec(text)){
    const code=match[0].replace(/[()]/g,'');
    const sectionReference=sectionReferences.get(code);
    const chapterReference=chapterReferences.get(code);
    if(sectionReference?.chapterId){
      const before=text.slice(cursor,match.index);
      const duplicate=new RegExp(`${escapeRegExp(sectionReference.label)}\\s*$`,'i').exec(before);
      html+=linkedTerms(duplicate?before.slice(0,duplicate.index):before,seen,excludedId);
      html+=chapterLink(sectionReference,duplicate?.[0].trim()||sectionReference.label);
      cursor=match.index+match[0].length;
      continue;
    }
    const term=termByCode.get(code)||sectionReference?.term||chapterReference?.term;
    if(!term)continue;
    const before=text.slice(cursor,match.index);
    if(seen.has(term.id)){
      html+=linkedTerms(before,seen,excludedId);
      cursor=match.index+match[0].length;
      continue;
    }
    const title=sectionReference?.label||chapterReference?.label||term.title?.en||code;
    const singular=title.endsWith('s')?title.slice(0,-1):title;
    const duplicate=new RegExp(`\\[?(${escapeRegExp(title)}|${escapeRegExp(singular)})\\]?(\\s+(?:rule|table|step))?\\s*$`,'i').exec(before);
    if(duplicate){
      html+=linkedTerms(before.slice(0,duplicate.index),seen,excludedId);
      html+=termButton(term,duplicate[1],'rule-reference');
      if(duplicate[2])html+=escapeHtml(duplicate[2]);
    }else{
      html+=linkedTerms(before,seen,excludedId);
      const button=termButton(term,title,'rule-reference');
      html+=match[0].startsWith('(')?`(${button})`:button;
    }
    seen.add(term.id);
    cursor=match.index+match[0].length;
  }
  return html+linkedTerms(text.slice(cursor),seen,excludedId);
}

function seeAlsoItem(value){
  const text=normalize(value);
  const match=text.match(/\b\d{2}\.\d{2}(?:\.\d{2})?\b/);
  if(match){
    const code=match[0];
    const reference=sectionReferences.get(code);
    if(reference?.chapterId)return chapterLink(reference,text.slice(0,match.index).trim()||reference.label);
    const term=termByCode.get(code)||sectionReferences.get(code)?.term||chapterReferences.get(code)?.term;
    const label=text.slice(0,match.index).trim().replace(/^\[|\]$/g,'')||term?.title?.en||code;
    return termButton(term,label,'rule-reference');
  }
  const term=terms.get(normalizeLabel(text));
  return term?termButton(term,text,'rule-reference'):linkedText(text,new Set());
}

function prose(text,seen=new Set(),excludedId='',hiddenReferences=[],markers=[]){
  const lines=[...String(text||'').matchAll(/[^\n]+/g)].map(match=>({line:match[0].trim(),start:match.index,end:match.index+match[0].length})).filter(item=>item.line);
  const output=[];
  let bullets=[];
  let previous='';
  let seeAlso=false;
  const flush=()=>{if(bullets.length){const items=seeAlso?bullets.filter(item=>!hiddenReferences.includes(item.match(/\b\d{2}\.\d{2}(?:\.\d{2})?\b/)?.[0])):bullets;if(items.length){if(seeAlso)output.push('<h4 class="see-also">See also</h4>');output.push(`<ul>${items.map(item=>`<li>${seeAlso?seeAlsoItem(item):linkedText(item,seen,excludedId)}</li>`).join('')}</ul>`);}bullets=[];}};
  for(const {line,start,end} of lines){
    if(line===previous)continue;
    previous=line;
    if(/^SEE ALSO$/i.test(line)){flush();seeAlso=true;continue;}
    if(seeAlso&&/^\d{2}\.\d{2}(?:\.\d{2})?$/.test(line)&&bullets.length){bullets[bullets.length-1]+=` ${line}`;continue;}
    if(/^\u2022\s*/.test(line)){
      bullets.push(line.replace(/^\u2022\s*/,''));
      continue;
    }
    if(seeAlso&&line!=='PROFILES AND WEAPONS')seeAlso=false;
    const visuals=markers.filter(marker=>marker.offset>start&&marker.offset<=end).map(marker=>` <img class="rule-marker" src="${escapeHtml(marker.src)}" alt="${escapeHtml(marker.alt)}">`).join('');
    flush();output.push(`<p>${linkedText(line,seen,excludedId)}${visuals}</p>`);
  }
  flush();
  return output.join('')||'<p>See the linked source.</p>';
}

function renderTable(block,seen,excludedId){
  const columns=block.columns.map(column=>`<th>${linkedText(column,seen,excludedId)}</th>`).join('');
  const rows=block.rows.map(row=>`<tr><th>${linkedText(row.label,seen,excludedId)}</th>${row.cells.map(cell=>`<td>${linkedText(cell,seen,excludedId)}</td>`).join('')}</tr>`).join('');
  const rowHeaderIncluded=block.rows.every(row=>block.columns.length===row.cells.length+1);
  return `<div class="table-scroll"><table class="rules-table"><thead><tr>${rowHeaderIncluded?'':'<th></th>'}${columns}</tr></thead><tbody>${rows}</tbody></table></div>`;
}

function renderContent(record,seen=new Set(),excludedId='',hiddenReferences=[]){
  record=readerPresentation.recordView(record);
  if(record.sourceConflict)return sourceConflictContent(record,seen,excludedId);
  if(!record.content)return prose(recordText(record),seen,excludedId,hiddenReferences,record.inlineMarkers);
  return record.content.map(block=>{
    if(block.type==='paragraph')return `<p>${linkedText(block.text,seen,excludedId)}</p>`;
    if(block.type==='heading')return `<h4 class="official-heading">${linkedText(block.text,seen,excludedId)}</h4>`;
    if(block.type==='list')return `<ul>${block.items.map(item=>`<li>${linkedText(item,seen,excludedId)}</li>`).join('')}</ul>`;
    if(block.type==='see-also'){
      const items=block.items.filter(item=>!hiddenReferences.includes(item.match(/\b\d{2}\.\d{2}(?:\.\d{2})?\b/)?.[0]));
      return items.length?`<h4 class="see-also">See also</h4><ul>${items.map(item=>`<li>${seeAlsoItem(item)}</li>`).join('')}</ul>`:'';
    }
    if(block.type==='comparison-table')return renderTable(block,seen,excludedId);
    if(block.type==='matrix')return `<div class="table-scroll"><table class="rules-table matrix"><caption>${linkedText(block.caption,seen,excludedId)}</caption><tbody>${block.rows.map(row=>`<tr><th>${linkedText(row.condition,seen,excludedId)}</th><td>${linkedText(row.result,seen,excludedId)}</td></tr>`).join('')}</tbody></table></div>`;
    if(block.type==='procedure')return `<ol class="procedure">${block.steps.map(step=>`<li><strong>${linkedText(step.label,seen,excludedId)}</strong>${step.text?` <span>${linkedText(step.text,seen,excludedId)}</span>`:''}${step.items?.length?`<ul>${step.items.map(item=>`<li>${linkedText(item,seen,excludedId)}</li>`).join('')}</ul>`:''}</li>`).join('')}</ol>`;
    if(block.type==='named-stages')return `<dl class="named-stages">${block.stages.map(stage=>`<div><dt>${escapeHtml(stage.label)}</dt><dd>${stage.text?`<p>${linkedText(stage.text,seen,excludedId)}</p>`:''}${stage.items?.length?`<ul>${stage.items.map(item=>`<li>${linkedText(item,seen,excludedId)}</li>`).join('')}</ul>`:''}${stage.afterText?`<p>${linkedText(stage.afterText,seen,excludedId)}</p>`:''}</dd></div>`).join('')}</dl>`;
    return '';
  }).join('');
}

function fileFor(id){return `${id}.html`;}
function pageLabel(pages){
  if(!pages.length)return 'Digital 11E';
  return pages.length===1?`page ${pages[0]}`:`pages ${pages[0]}–${pages.at(-1)}`;
}
function sourceLabel(record){
  if(record.sourceConflict)return 'Accepted source variants &middot; unresolved';
  if(record.provenance?.effectiveSourceBindings?.length){
    const labels=record.provenance.effectiveSourceBindings.map(binding=>{
      const source=catalog.getById(binding.sourceRecordId||binding.source.recordId)?.provenance||record.provenance.base;
      const label=source.sourceClass==='ACCEPTED_OPERATIONAL_SECONDARY'?'Accepted secondary update':source.authorityLevel==='GLOBAL_OFFICIAL'?'Official GW update':'Accepted source update';
      const artifact=source.sourceArtifact,href=/^https?:\/\//.test(artifact)?artifact:`../../../${artifact}`;
      return `${label} &middot; <a href="${escapeHtml(href)}" target="_blank" rel="noreferrer">Source ↗</a>`;
    });
    return [...new Set(labels)].join(' &middot; ');
  }
  if(record.currentOfficialOverride){
    const label=record.currentOfficialOverride.sourceClass==='GW_CURRENT_OFFICIAL'?'Official GW update':record.currentOfficialOverride.operation==='compatibility-alias'?'Official PDF · secondary-corroborated alias':'Secondary wording · GW gameplay corroborated';
    return `${label} &middot; <a href="${escapeHtml(record.currentOfficialOverride.sourceArtifact)}" target="_blank" rel="noreferrer">Source ↗</a>`;
  }
  return parity.verifiedCodes.has(record.code)?`Official PDF &middot; page ${parity.pages.get(record.code)}`:'Digital 11E';
}

function primaryNav(current=''){
  return modules.map(module=>`<section class="nav-group"><h2>${escapeHtml(module.title)}</h2>${module.sections.map(id=>{
    const section=byId.get(id);
    return `<a href="${fileFor(id)}"${id===current?' aria-current="page"':''}>${escapeHtml(section.title)}</a>`;
  }).join('')}</section>`).join('');
}

function shell({title,current='',currentLabel='Start',onPage='',content}){
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="theme-color" content="#0d0f0d"><link rel="manifest" href="../../../manifest.webmanifest"><title>${escapeHtml(title)} — Core Rules</title><link rel="stylesheet" href="styles.css?v=16"></head><body>
<header class="topbar"><button class="menu" id="navButton" type="button" aria-label="Open navigation" aria-controls="sidebar" aria-expanded="false">☰</button><a class="brand" href="index.html"><strong>Core Rules</strong><small>11E · Reference</small></a><span class="current">${escapeHtml(currentLabel)}</span><button class="search-button" id="searchButton" type="button" aria-label="Search Core Rules">Search</button><a class="library" href="../../../index.html">← Library</a></header><button class="scrim" id="navScrim" type="button" aria-label="Close navigation" hidden></button>
<aside class="sidebar" id="sidebar"><div class="sidebar-head"><span class="eyebrow">Core register // 11E</span><h1>Contents</h1></div><nav><section class="nav-group"><h2>Reference</h2><a href="index.html"${!current?' aria-current="page"':''}>Start</a></section>${primaryNav(current)}${onPage}</nav><a class="mega" href="../../../glossary/index.html">Mega Glossary →</a></aside>
<main class="main">${content}</main><a class="popup-return" id="popupReturn" hidden>← Back to popup</a><dialog class="search-dialog" id="searchDialog"><form method="dialog" class="dialog-head"><span>Core Rules // search</span><button type="submit" aria-label="Close search">×</button></form><label for="searchInput">Find a rule</label><input id="searchInput" type="search" autocomplete="off" placeholder="Title or rule text"><p class="search-status" id="searchStatus">Type at least two characters.</p><div class="search-results" id="searchResults"></div></dialog><dialog class="dialog" id="termDialog"><div class="dialog-head"><span>Mega Glossary // quick entry</span><button id="termClose" type="button" aria-label="Close">×</button></div><h2 id="termTitle"></h2><p id="termSummary"></p><a id="termRule" hidden>Open full rule →</a><a id="termFull">Glossary entry →</a></dialog><dialog class="image-dialog" id="imageDialog"><button id="imageClose" type="button" aria-label="Close diagram">×</button><img id="imagePreview" alt=""><p id="imageCaption"></p></dialog><script src="../../../glossary/v2/generated/index.en.js?v=1"></script><script src="../../../glossary/v2/runtime/glossary-v2-runtime.js?v=1"></script><script src="../../../glossary-return.js?v=${runtimeVersions.shared.glossaryReturn}"></script><script type="application/json" id="readerPresentation">${JSON.stringify(readerPresentation.popupData).replaceAll('<','\\u003c')}</script><script src="app.js?v=18"></script></body></html>`;
}

function sourceLinks(pages){
  const pageLinks=pages.map(page=>`<a href="../assets/pages/page-${String(page).padStart(2,'0')}.jpg" target="_blank" rel="noreferrer">Official page ${page}</a>`).join('');
  return `<details class="source-pages"><summary>Sources and original pages</summary><div><a href="${pdfUrl}" target="_blank" rel="noreferrer">Official GW PDF ↗</a>${pageLinks}<a href="${wahapediaUrl}" target="_blank" rel="noreferrer">Secondary reference: Wahapedia 11E ↗</a></div></details>`;
}

function ruleVisuals(code){
  const items=diagrams.filter(item=>diagramRules[item.file]===code);
  if(!items.length)return '';
  const rule=digital.records.find(record=>record.code===code);
  const ruleLabel=(rule?.title||'Rules diagram').replace(/^\d+\.\s*/,'');
  return `<div class="rule-visuals" aria-label="Diagrams for ${escapeHtml(ruleLabel)}">${items.map(item=>{const detail=diagramLabels[item.file]||(/^ex\d+$/i.test(item.caption||'')?'':item.caption);const imageFile=item.file.replace(/\.png$/i,'.webp');return `<figure data-visual-rule="${escapeHtml(code)}"><figcaption><small>Diagram for rule</small><strong>${escapeHtml(ruleLabel)}</strong>${detail?`<span>${escapeHtml(detail)}</span>`:''}</figcaption><a href="../assets/diagrams/${escapeHtml(imageFile)}"><img src="../assets/diagrams/${escapeHtml(imageFile)}" alt="${escapeHtml(detail||ruleLabel)}" loading="lazy" decoding="async"></a></figure>`;}).join('')}</div>`;
}

function referenceStrip(code,seen=new Set()){
  const items=(ruleReferences[code]||[]).map(id=>coreTermById.get(id)).filter(term=>term&&!seen.has(term.id));
  if(!items.length)return '';
  items.forEach(term=>seen.add(term.id));
  return `<nav class="rule-references" aria-label="Glossary concepts for ${escapeHtml(code)}"><span>Glossary concepts</span>${items.map(term=>termButton(term,term.title.en)).join('')}</nav>`;
}

function faqPresentationIdentity(faq){
  return faq.presentationIdentity||JSON.stringify([faq.question,faq.answer].map(value=>normalize(value).replace(/[‘’]/g,"'").replace(/[“”]/g,'"')));
}

function faqProvenanceLabel(faq){
  const source=faq.provenance;
  if(source.sourceClass==='GW_CORE_FAQ')return `Official FAQ &middot; ${escapeHtml(source.sourceLocator.replace(/;\s*/g,' · '))}`;
  if(source.sourceClass==='ACCEPTED_OPERATIONAL_SECONDARY')return `Accepted Wahapedia FAQ &middot; ${escapeHtml(source.sourceDate)}`;
  return `FAQ &middot; ${escapeHtml(source.sourceDate||'')}`;
}

function faqRuleIds(faq){
  return [...new Set([faq.relationships?.primaryRuleId,...(faq.relationships?.relatedRuleIds||[])].filter(Boolean))];
}

function faqCard(group,{canonicalAnchors=false,surfaceId=''}={}){
  const seen=new Set();
  const faq=group[0];
  const related=[...new Set(group.flatMap(faqRuleIds))].map(id=>coreTermById.get(id)).filter(Boolean);
  const anchorId=item=>canonicalAnchors?item.id:`${surfaceId}--${item.id}`;
  const aliases=group.slice(1).map(item=>`<span id="${escapeHtml(anchorId(item))}" data-faq-alias="${escapeHtml(faq.id)}"></span>`).join('');
  // Existing chapter URLs remain valid at the explicitly established primary
  // rule. Related-rule appearances retain their scoped local anchors only.
  const compatibilityAnchors=canonicalAnchors?'':group.filter(item=>item.relationships?.primaryRuleId===surfaceId).map(item=>`<span id="${escapeHtml(item.id)}" data-faq-compatibility-alias="${escapeHtml(anchorId(item))}"></span>`).join('');
  const sources=group.map(item=>`<span class="source-label" data-faq-source="${escapeHtml(item.id)}">${faqProvenanceLabel(item)}${item.provenance.sourceArtifact?` &middot; <a href="${escapeHtml(item.provenance.sourceArtifact)}" target="_blank" rel="noreferrer">Source ↗</a>`:''}</span>`).join('');
  return `<aside class="official-faq" id="${escapeHtml(anchorId(faq))}" data-faq-id="${escapeHtml(faq.id)}">${compatibilityAnchors}${aliases}${sources}<h4>${linkedText(faq.question,seen)}</h4><p>${linkedText(faq.answer,seen)}</p>${related.length?`<nav aria-label="Related rules"><span>Related rules</span>${related.map(term=>termButton(term,term.title.en,'rule-reference')).join('')}</nav>`:''}</aside>`;
}

function faqCards(items,options){
  const groups=new Map();
  for(const faq of items){
    const identity=faqPresentationIdentity(faq);
    const group=groups.get(identity)||[];
    if(!group.some(item=>item.id===faq.id))group.push(faq);
    groups.set(identity,group);
  }
  return [...groups.values()].map(group=>faqCard(group,options)).join('');
}

function ruleFaqs(record){
  return faqs.filter(faq=>(record.relationships?.faqIds||[]).includes(faq.id)||faqRuleIds(faq).includes(record.id));
}

function sourceConflictContent(record,seen,excludedId){
  const conflict=record.sourceConflict;
  const variants=conflict.occurrences.map(occurrence=>`<section class="source-variant"><h4 class="official-heading">${escapeHtml(occurrence.title)} · source occurrence ${escapeHtml(occurrence.sourceOrder)}</h4>${prose(occurrence.presentationText??occurrence.content.text,seen,excludedId)}</section>`).join('');
  return `<aside class="official-faq source-conflict" role="note"><span class="source-label">Unresolved accepted-source conflict</span><p>The accepted sources contain different versions of this rule. Neither version has been established as the current rule.</p></aside>${variants}`;
}

function stratagemCard(record){
  const lines=recordText(record).split(/\n+/).map(normalize).filter(Boolean);
  const cp=/^\+?\d+CP$/i.test(lines[0]||'')?lines.shift():'';
  if(/^Core Stratagem$/i.test(lines[0]||''))lines.shift();
  const fields=[];
  let flavour=[];
  let current=null;
  for(const line of lines){
    const marker=line.match(/^(WHEN|TARGET|EFFECT|RESTRICTIONS?|ELIGIBLE IF|WHILE SHOOTING|AFTER SHOOTING):\s*(.*)$/i);
    if(marker){current={label:marker[1],lines:marker[2]?[marker[2]]:[]};fields.push(current);continue;}
    if(current)current.lines.push(line);else flavour.push(line);
  }
  const when=fields.find(field=>field.label.toUpperCase()==='WHEN')?.lines.join(' ')||'';
  const turn=/opponent|enemy/i.test(when)?'their':/\byour\b/i.test(when)?'yours':'any';
  const turnLabel=turn==='their'?'THEIR TURN':turn==='yours'?'YOUR TURN':'ANY TURN';
  const excludedId=excludedRuleId(record);
  const seen=new Set();
  const flavourHtml=flavour.length?`<p class="stratagem-flavour">${linkedText(flavour.join(' '),seen,excludedId)}</p>`:'';
  const fieldsHtml=fields.map(field=>`<section class="field"><span>${escapeHtml(field.label)}</span>${prose(field.lines.join('\n'),seen,excludedId)}</section>`).join('');
  return `<article class="stratagem turn-${turn}" id="${escapeHtml(recordAnchor(record))}" data-rule-id="${escapeHtml(record.id)}" data-rule-code="${escapeHtml(record.code)}" data-turn="${turnLabel}"><div class="stratagem-rail">${cp?`<strong class="cp"><span>${escapeHtml(cp)}</span></strong>`:''}</div><header class="stratagem-head"><h3>${escapeHtml(record.title)}</h3><p class="stratagem-type">${sourceLabel(record)}</p>${flavourHtml}</header><div class="stratagem-fields">${fieldsHtml}${ruleVisuals(record.code)}</div></article>`;
}

function mainRule(record,children=[]){
  const id=recordAnchor(record);
  const inlineChildren=children.filter(child=>child.presentation==='inline');
  const nestedChildren=children.filter(child=>child.presentation!=='inline');
  const nested=nestedChildren.length?`<div class="subrules">${nestedChildren.map(child=>{const excludedId=excludedRuleId(child),seen=new Set();const text=renderContent(child,seen,excludedId),childFaqs=faqCards(ruleFaqs(child),{surfaceId:child.id});return `<details class="subrule" id="${escapeHtml(recordAnchor(child))}" data-rule-id="${escapeHtml(child.id)}" data-rule-code="${escapeHtml(child.code)}"><summary><strong>${escapeHtml(displayTitle(child))}</strong></summary><div><span class="source-label">${sourceLabel(child)}</span>${text}${childFaqs}${referenceStrip(child.code,seen)}${ruleVisuals(child.code)}</div></details>`;}).join('')}</div>`:'';
  const excludedId=excludedRuleId(record);
  const seen=new Set();
  const inline=inlineChildren.map(child=>`<div class="inline-clarification" id="${escapeHtml(recordAnchor(child))}" data-rule-id="${escapeHtml(child.id)}" data-rule-code="${escapeHtml(child.code)}">${renderContent(child,seen,excludedRuleId(child))}${faqCards(ruleFaqs(child),{surfaceId:child.id})}</div>`).join('');
  const text=renderContent(record,seen,excludedId,children.map(child=>child.code))+inline;
  const faqHtml=faqCards(ruleFaqs(record),{surfaceId:record.id});
  return `<article class="rule kind-${escapeHtml(record.kind)}" id="${id}" data-rule-id="${escapeHtml(record.id)}" data-rule-code="${escapeHtml(record.code)}"><header class="rule-head"><h3>${escapeHtml(displayTitle(record))}</h3><span class="page">${sourceLabel(record)}</span></header><div class="rule-body">${text}${faqHtml}${referenceStrip(record.code,seen)}${ruleVisuals(record.code)}${nested}</div></article>`;
}

function introductionArticle(){
  const paragraphs=(data.introduction.paragraphs||[]).map(paragraph=>`<p>${linkedText(paragraph)}</p>`).join('');
  return `<article class="rule kind-introduction" id="introduction-overview"><header class="rule-head"><h3>Welcome to Warhammer 40,000</h3><span class="page">Introduction</span></header><div class="rule-body">${paragraphs}</div></article>`;
}

function universalUpdateCards(){
  const updates=digital.universalRulesUpdates||[];
  if(!updates.length)return '';
  return `<section class="universal-updates" aria-label="Universal Rules Updates"><h2>Universal Rules Updates</h2><p>Current official updates to rules with a broader scope than individual Faction Packs. <a href="${escapeHtml(updates[0].sourceArtifact)}" target="_blank" rel="noreferrer">GW source ↗</a></p><div class="rules">${updates.map(update=>`<article class="rule" id="${escapeHtml(update.id)}" data-update-id="${escapeHtml(update.id)}"><header class="rule-head"><h3>${escapeHtml(update.title)}</h3><span class="page">Official GW update</span></header><div class="rule-body"><p>${escapeHtml(update.text)}</p></div></article>`).join('')}</div></section>`;
}

function sectionPage(id,index){
  const section=byId.get(id);
  const pages=pdf.sections[id]||[];
  const records=recordsBySection.get(id)||[];
  const previous=order[index-1];
  const next=order[index+1];
  let cards='';
  if(id==='introduction'){
    cards=introductionArticle();
  }else{
    const parents=records.filter(record=>record.code.split('.').length===2);
    if(id==='stratagems'){
      const overview=parents.filter(record=>record.code==='15.01').map(record=>mainRule(record,records.filter(child=>child.code.startsWith(`${record.code}.`)))).join('');
      cards=`${overview}<div class="core-stratagem-grid">${parents.filter(record=>record.code!=='15.01').map(stratagemCard).join('')}</div>${universalUpdateCards()}`;
    }else cards=parents.map(record=>mainRule(record,records.filter(child=>child.code.startsWith(`${record.code}.`)))).join('');
  }
  const anchors=id==='introduction'?[]:records.filter(record=>record.code.split('.').length===2).map(record=>({id:recordAnchor(record),title:record.title}));
  const onPage=anchors.length?anchors.length>12?`<details class="nav-group on-page"><summary>On this page <span>${anchors.length}</span></summary>${anchors.map(item=>`<a href="#${item.id}">${escapeHtml(item.title)}</a>`).join('')}</details>`:`<section class="nav-group on-page"><h2>On this page</h2>${anchors.map(item=>`<a href="#${item.id}">${escapeHtml(item.title)}</a>`).join('')}</section>`:'';
  const actions=[`<a class="button source" href="${pdfUrl}" target="_blank" rel="noreferrer">Official GW PDF ↗</a>`];
  if(previous)actions.push(`<a class="button" href="${fileFor(previous)}">← ${escapeHtml(byId.get(previous).title)}</a>`);
  if(next)actions.push(`<a class="button" href="${fileFor(next)}">${escapeHtml(byId.get(next).title)} →</a>`);
  const label=pages.length?pageLabel(pages):'Digital 11E';
  const content=`<header class="chapter-hero" data-number="${escapeHtml(section.number||'00')}"><span class="eyebrow">${escapeHtml(modules.find(module=>module.sections.includes(id))?.title||'Core Rules')} // ${escapeHtml(label)}</span><h2>${escapeHtml(section.title)}</h2><p>${escapeHtml(section.summary||'Complete rules for this section.')}</p><div class="hero-actions">${actions.join('')}</div></header><div class="rules">${cards}</div>${sourceLinks(pages)}`;
  return shell({title:section.title,current:id,currentLabel:section.title,onPage,content});
}

const groups=data.groups.map(group=>`<section class="home-section"><header><span class="eyebrow">${escapeHtml(group.pages)}</span><h2>${escapeHtml(group.title)}</h2><p>${escapeHtml(group.description)}</p></header><div class="home-grid">${group.sections.map(section=>`<a class="home-card" href="${fileFor(section.id)}"><small>${escapeHtml(pageLabel(pdf.sections[section.id]||[]))}</small><strong>${escapeHtml(section.title)}</strong><span>${escapeHtml(section.summary)}</span><em>Open chapter →</em></a>`).join('')}</div></section>`).join('');
const intro=data.introduction;
const faqCatalog=`<section class="home-section" id="faq"><header><h2>FAQ</h2></header>${faqCards(faqs,{canonicalAnchors:true})}</section>`;
const indexContent=`<section class="chapter-hero"><span class="eyebrow">Warhammer 40,000 // Core Rules 11E</span><h2>Core Rules Reference</h2><p>Core Rules</p><div class="hero-actions"><a class="button" href="${fileFor(intro.id)}">Start with Introduction →</a><a class="button source" href="${pdfUrl}" target="_blank" rel="noreferrer">Official GW PDF ↗</a></div></section>${groups}${faqCatalog}`;
fs.writeFileSync(path.join(root,'index.html'),shell({title:'Core Rules Reference',content:indexContent}));
for(const [index,id] of order.entries())fs.writeFileSync(path.join(root,fileFor(id)),sectionPage(id,index));
const searchIndex=digital.records.map(record=>{
  const sectionId=sectionByNumber.get(record.code.slice(0,2));
  const conflictText=record.sourceConflict?`Unresolved accepted-source conflict. ${record.sourceConflict.occurrences.map(occurrence=>occurrence.content.text).join(' ')}`:'';
  return {id:record.id,code:record.code,title:record.title,chapter:byId.get(sectionId)?.title||'',text:normalize(`${conflictText||recordText(record)} ${(record.compatibilityAliases||[]).join(' ')}`),url:`${fileFor(sectionId)}#${recordAnchor(record)}`};
});
for(const update of digital.universalRulesUpdates||[])searchIndex.push({code:update.id,title:update.title,chapter:'Stratagems',text:update.text,url:`stratagems.html#${update.id}`});
for(const faq of faqs){
  searchIndex.push({code:faq.id,title:faq.question,chapter:'FAQ',text:faq.answer,url:`index.html#${faq.id}`});
}
fs.writeFileSync(path.join(root,'search-index.json'),JSON.stringify(searchIndex));
const stale=path.join(root,'rules-appendix.html');
if(fs.existsSync(stale))fs.unlinkSync(stale);
console.log(`Core Rules Reader built: ${order.length} chapters, ${digital.records.length} base 11E records, ${digital.universalRulesUpdates.length} current official universal updates, ${Object.values(digital.images).flat().length} diagrams.`);

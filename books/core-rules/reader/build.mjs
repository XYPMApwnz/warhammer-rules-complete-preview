import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
import {verifyPdfParity} from '../tools/verify_pdf_parity.mjs';
import {recordText} from '../content/record-content.mjs';

const root=path.dirname(fileURLToPath(import.meta.url));
const bookRoot=path.dirname(root);
const repoRoot=path.resolve(bookRoot,'..','..');
const context={window:{}};
for(const file of ['content/core-rules.source.en.js','content/core-rules.en.js']){
  vm.runInNewContext(fs.readFileSync(path.join(bookRoot,file),'utf8'),context);
}

const data=context.window.CORE_RULES;
const pdf=context.window.CORE_PDF_SOURCE;
const modules=[
  {id:'introduction',title:'Introduction',sections:[data.introduction.id]},
  ...data.groups.map(group=>({id:group.id,title:group.title,sections:group.sections.map(section=>section.id)}))
];
const digital=JSON.parse(fs.readFileSync(path.join(bookRoot,'content','core-rules.digital-11e.json'),'utf8'));
const parity=verifyPdfParity(pdf,digital);
const registry=JSON.parse(fs.readFileSync(path.join(repoRoot,'glossary','registry.en.json'),'utf8'));
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
  'ex8.png':'04.01','ex9.png':'05.01','ex10.png':'05.01','ex11.png':'19.02','ex12.png':'05.04',
  'ModelVisible.png':'06.01','ModelFullyVisible.png':'06.01','UnitVisible.png':'06.01','UnitFullyVisible.png':'06.01',
  'BattleShockExamples1.png':'08.03','BattleShockExamples2.png':'08.03','BattleShockExamples3.png':'08.03','BattleShockExamples4.png':'08.03',
  'MakingAChargeMove.png':'11.02',
  'StartOfFightPhase.png':'12.01','PileInMoves.png':'12.02','NormalFight.png':'12.05','OverrunFight.png':'12.06','OngoingConsolidation.png':'12.07','ObjectiveConsolidation.png':'12.07',
  'TerrainPlacedOnAMat.png':'13.01','TerrainPlacedOnTheBattlefield.png':'13.01','TerrainAndMovement.png':'13.06','TerrainAndMovement2.png':'13.06','BenefitOfCover.png':'13.08','HiddenAndObscuring.png':'13.09','Solid.png':'13.11',
  'ControllingATerrainObjective.png':'14.01','ExampleAction.png':'16.01','EngagedMonstersVehiclesShooting.png':'17.03',
  'MakingASurgeMove.png':'21.02','TakingToTheSkies.png':'21.03','PlungingFire.png':'22.05'
};
const diagrams=Object.values(digital.images).flat();
const ruleReferences={
  '01.02.01':['core-starting-strength','core-half-strength','core-below-half-strength','core-below-starting-strength'],
  '01.03':['core-player-turn']
};
const faqs=pdf.faqs||[];
const faqsByPrimary=new Map();
for(const faq of faqs)faqsByPrimary.set(faq.primaryRule,[...(faqsByPrimary.get(faq.primaryRule)||[]),faq]);

const escapeHtml=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const normalize=value=>String(value||'').replace(/\r/g,'').replace(/\s+/g,' ').trim();
const normalizeLabel=value=>String(value||'').replace(/[‘’]/g,"'").replace(/[–—]/g,'-').replace(/\s+/g,' ').trim().toLowerCase();
const escapeRegExp=value=>value.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
const slug=value=>String(value).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');

const termsByCode=new Map();
for(const term of Object.values(registry.terms)){
  if(term.canonicalSource?.documentId!=='core-rules'||term.kind==='keyword')continue;
  const code=String(term.canonicalSource.locator||'').match(/^(\d{2}\.\d{2}(?:\.\d{2})?)/)?.[1];
  if(code)termsByCode.set(code,[...(termsByCode.get(code)||[]),term]);
}
const termByCode=new Map(digital.records.map(rule=>{
  const title=rule.title.replace(/^\d+\.\s*/,'').trim().toLowerCase();
  const matches=termsByCode.get(rule.code)||[];
  return [rule.code,matches.find(term=>term.title.en.trim().toLowerCase()===title)||matches[0]];
}).filter(([,term])=>term));
const displayTitleOverrides={'24.37.01':'Torrent Restrictions'};
const displayTitle=rule=>displayTitleOverrides[rule.code]||rule.title;
const sectionReferences=new Map([
  ['16.00',{label:'Actions',term:termByCode.get('16.01')}],
  ['23.00',{label:'Aircraft',term:registry.terms['keyword-aircraft']}],
  ['17.00',{label:'Monsters and Vehicles',term:termByCode.get('17.01')}],
  ['20.00',{label:'Strategic Reserves',term:registry.terms['core-strategic-reserves']}],
  ['18.00',{label:'Transports',term:termByCode.get('18.01')}]
]);
const chapterReferences=new Map([
  ['03',{label:'Moving',term:termByCode.get('03.01')}],
  ['04',{label:'Making Attacks',term:termByCode.get('04.01')}],
  ['05',{label:'Attack Sequence',term:termByCode.get('05.01')}],
  ['15',{label:'Stratagems',term:termByCode.get('15.01')}],
  ['16',{label:'Actions',term:termByCode.get('16.01')}],
  ['24',{label:'Abilities',term:registry.terms['core-abilities']}]
]);

const ignoredAutolinkLabels=new Set(['you','attacks','within','weapons','destroyed','dice','set up','keywords','shoot','shooting','dense']);
const characteristicTerms=new Map([
  ['Move','core-characteristic-move'],
  ['Toughness','core-characteristic-toughness'],
  ['Save','core-characteristic-save'],
  ['Invulnerable Save','core-characteristic-invulnerable-save'],
  ['Wounds','core-characteristic-wounds'],
  ['Leadership','core-characteristic-leadership'],
  ['Objective Control','core-objective-control'],
  ['Range','core-characteristic-range'],
  ['Attacks','core-characteristic-attacks'],
  ['Ballistic Skill','core-characteristic-ballistic-skill'],
  ['Weapon Skill','core-characteristic-weapon-skill'],
  ['Strength','core-characteristic-strength'],
  ['Armour Penetration','core-characteristic-armour-penetration'],
  ['Damage','core-characteristic-damage']
]);
const candidates=new Map();
for(const term of Object.values(registry.terms)){
  if(term.scope!=='global'&&term.canonicalSource?.documentId!=='core-rules'&&!(term.sourceRefs||[]).includes('core-rules'))continue;
  for(const label of [term.title?.en,...(term.aliases||[]),...(term.matchLabels||[])]){
    const token=normalizeLabel(label);
    if(token.length<3||ignoredAutolinkLabels.has(token))continue;
    const entries=candidates.get(token)||[];
    if(!entries.some(entry=>entry.id===term.id))entries.push(term);
    candidates.set(token,entries);
  }
}
for(const [code,term] of termByCode)candidates.set(normalizeLabel(code),[term]);
const terms=new Map([...candidates].filter(([,entries])=>entries.length===1).map(([token,entries])=>[token,entries[0]]));
const matcher=new RegExp(`(^|[^A-Za-z0-9])(${[...terms.keys()].sort((a,b)=>b.length-a.length).map(escapeRegExp).join('|')})(?=$|[^A-Za-z0-9])`,'gi');

function termButton(term,label,extraClass=''){
  if(!term)return escapeHtml(label);
  return `<button class="term${extraClass?` ${extraClass}`:''}" type="button" data-term="${escapeHtml(term.id)}" data-term-title="${escapeHtml(term.title?.en||label)}" data-term-summary="${escapeHtml(term.summary?.en||term.definition?.en||'Open the complete glossary entry for this term.')}"${term.fullRulePath?` data-full-rule-path="${escapeHtml(term.fullRulePath)}"`:''} aria-haspopup="dialog">${escapeHtml(label)}</button>`;
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
    const term=registry.terms[id];
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
    const term=termByCode.get(code)||sectionReferences.get(code)?.term||chapterReferences.get(code)?.term;
    const label=text.slice(0,match.index).trim().replace(/^\[|\]$/g,'')||term?.title?.en||code;
    return termButton(term,label,'rule-reference');
  }
  const term=terms.get(normalizeLabel(text));
  return term?termButton(term,text,'rule-reference'):linkedText(text,new Set());
}

function prose(text,seen=new Set(),excludedId='',hiddenReferences=[]){
  const lines=String(text||'').split(/\n+/).map(line=>line.trim()).filter(Boolean);
  const output=[];
  let bullets=[];
  let previous='';
  let seeAlso=false;
  const flush=()=>{if(bullets.length){const items=seeAlso?bullets.filter(item=>!hiddenReferences.includes(item.match(/\b\d{2}\.\d{2}(?:\.\d{2})?\b/)?.[0])):bullets;if(items.length){if(seeAlso)output.push('<h4 class="see-also">See also</h4>');output.push(`<ul>${items.map(item=>`<li>${seeAlso?seeAlsoItem(item):linkedText(item,seen,excludedId)}</li>`).join('')}</ul>`);}bullets=[];}};
  for(const line of lines){
    if(line===previous)continue;
    previous=line;
    if(/types are marked with this icon\.?$/i.test(line))continue;
    if(/^SEE ALSO$/i.test(line)){flush();seeAlso=true;continue;}
    if(seeAlso&&/^\d{2}\.\d{2}(?:\.\d{2})?$/.test(line)&&bullets.length){bullets[bullets.length-1]+=` ${line}`;continue;}
    if(/^\u2022\s*/.test(line)){
      bullets.push(line.replace(/^\u2022\s*/,''));
      continue;
    }
    if(seeAlso&&line!=='PROFILES AND WEAPONS')seeAlso=false;
    flush();output.push(`<p>${linkedText(line,seen,excludedId)}</p>`);
  }
  flush();
  return output.join('')||'<p>See the linked source.</p>';
}

function renderTable(block,seen,excludedId){
  const columns=block.columns.map(column=>`<th>${linkedText(column,seen,excludedId)}</th>`).join('');
  const rows=block.rows.map(row=>`<tr><th>${linkedText(row.label,seen,excludedId)}</th>${row.cells.map(cell=>`<td>${linkedText(cell,seen,excludedId)}</td>`).join('')}</tr>`).join('');
  return `<div class="table-scroll"><table class="rules-table"><thead><tr><th></th>${columns}</tr></thead><tbody>${rows}</tbody></table></div>`;
}

function renderContent(record,seen=new Set(),excludedId='',hiddenReferences=[]){
  if(!record.content)return prose(recordText(record),seen,excludedId,hiddenReferences);
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
    if(block.type==='named-stages')return `<dl class="named-stages">${block.stages.map(stage=>`<div><dt>${escapeHtml(stage.label)}</dt><dd>${stage.text?`<p>${linkedText(stage.text,seen,excludedId)}</p>`:''}${stage.items?.length?`<ul>${stage.items.map(item=>`<li>${linkedText(item,seen,excludedId)}</li>`).join('')}</ul>`:''}</dd></div>`).join('')}</dl>`;
    return '';
  }).join('');
}

function fileFor(id){return `${id}.html`;}
function pageLabel(pages){
  if(!pages.length)return 'Digital 11E';
  return pages.length===1?`page ${pages[0]}`:`pages ${pages[0]}–${pages.at(-1)}`;
}
function sourceLabel(record){
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
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="theme-color" content="#0d0f0d"><link rel="manifest" href="../../../manifest.webmanifest"><title>${escapeHtml(title)} — Core Rules</title><link rel="stylesheet" href="styles.css?v=12"></head><body>
<header class="topbar"><button class="menu" id="navButton" type="button" aria-label="Open navigation" aria-controls="sidebar" aria-expanded="false">☰</button><a class="brand" href="index.html"><strong>Core Rules</strong><small>11E · Reference</small></a><span class="current">${escapeHtml(currentLabel)}</span><button class="search-button" id="searchButton" type="button" aria-label="Search Core Rules">Search</button><a class="library" href="../../../index.html">← Library</a></header><button class="scrim" id="navScrim" type="button" aria-label="Close navigation" hidden></button>
<aside class="sidebar" id="sidebar"><div class="sidebar-head"><span class="eyebrow">Core register // 11E</span><h1>Contents</h1></div><nav><section class="nav-group"><h2>Reference</h2><a href="index.html"${!current?' aria-current="page"':''}>Start</a></section>${primaryNav(current)}${onPage}</nav><a class="mega" href="../../../glossary/index.html">Mega Glossary →</a></aside>
<main class="main">${content}</main><dialog class="search-dialog" id="searchDialog"><form method="dialog" class="dialog-head"><span>Core Rules // search</span><button type="submit" aria-label="Close search">×</button></form><label for="searchInput">Find a rule</label><input id="searchInput" type="search" autocomplete="off" placeholder="Title or rule text"><p class="search-status" id="searchStatus">Type at least two characters.</p><div class="search-results" id="searchResults"></div></dialog><dialog class="dialog" id="termDialog"><div class="dialog-head"><span>Mega Glossary // quick entry</span><button id="termClose" type="button" aria-label="Close">×</button></div><h2 id="termTitle"></h2><p id="termSummary"></p><a id="termRule" hidden>Open full rule →</a><a id="termFull">Glossary entry →</a></dialog><dialog class="image-dialog" id="imageDialog"><button id="imageClose" type="button" aria-label="Close diagram">×</button><img id="imagePreview" alt=""><p id="imageCaption"></p></dialog><script src="../../../glossary-return.js?v=1"></script><script src="app.js?v=10"></script></body></html>`;
}

function sourceLinks(pages){
  const pageLinks=pages.map(page=>`<a href="../assets/pages/page-${String(page).padStart(2,'0')}.jpg" target="_blank" rel="noreferrer">Official page ${page}</a>`).join('');
  return `<details class="source-pages"><summary>Sources and original pages</summary><div><a href="${pdfUrl}" target="_blank" rel="noreferrer">Official GW PDF ↗</a>${pageLinks}<a href="${wahapediaUrl}" target="_blank" rel="noreferrer">Secondary reference: Wahapedia 11E ↗</a></div></details>`;
}

function musterTable(){
  return `<div class="table-scroll"><table class="battle-size-table"><thead><tr><th>Battle size</th><th>Points</th><th>DP</th><th>Enhancements</th><th>Unit limit</th></tr></thead><tbody><tr><th>Incursion</th><td>1000</td><td>2</td><td>2</td><td>2</td></tr><tr><th>Strike Force</th><td>2000</td><td>3</td><td>4</td><td>3</td></tr></tbody></table></div>`;
}

function ruleVisuals(code){
  const items=diagrams.filter(item=>diagramRules[item.file]===code);
  if(!items.length)return '';
  const rule=digital.records.find(record=>record.code===code);
  const ruleLabel=(rule?.title||'Rules diagram').replace(/^\d+\.\s*/,'');
  return `<div class="rule-visuals" aria-label="Diagrams for ${escapeHtml(ruleLabel)}">${items.map(item=>{const detail=/^ex\d+$/i.test(item.caption||'')?'':item.caption;const imageFile=item.file.replace(/\.png$/i,'.webp');return `<figure data-visual-rule="${escapeHtml(code)}"><figcaption><small>Diagram for rule</small><strong>${escapeHtml(ruleLabel)}</strong>${detail?`<span>${escapeHtml(detail)}</span>`:''}</figcaption><a href="../assets/diagrams/${escapeHtml(imageFile)}"><img src="../assets/diagrams/${escapeHtml(imageFile)}" alt="${escapeHtml(detail||ruleLabel)}" loading="lazy" decoding="async"></a></figure>`;}).join('')}</div>`;
}

function referenceStrip(code,seen=new Set()){
  const items=(ruleReferences[code]||[]).map(id=>registry.terms[id]).filter(term=>term&&!seen.has(term.id));
  if(!items.length)return '';
  items.forEach(term=>seen.add(term.id));
  return `<nav class="rule-references" aria-label="Glossary concepts for ${escapeHtml(code)}"><span>Glossary concepts</span>${items.map(term=>termButton(term,term.title.en)).join('')}</nav>`;
}

function faqCard(faq){
  const seen=new Set();
  const related=faq.relatedRules.map(code=>termByCode.get(code)).filter(Boolean);
  return `<aside class="official-faq" id="${escapeHtml(faq.id)}"><span class="source-label">Official FAQ &middot; Rules Appendix &middot; page 88</span><h4>${linkedText(faq.question,seen)}</h4><p>${linkedText(faq.answer,seen)}</p>${related.length?`<nav aria-label="Related rules"><span>Related rules</span>${related.map(term=>termButton(term,term.title.en,'rule-reference')).join('')}</nav>`:''}</aside>`;
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
  const excludedId=termByCode.get(record.code)?.id||'';
  const seen=new Set();
  const flavourHtml=flavour.length?`<p class="stratagem-flavour">${linkedText(flavour.join(' '),seen,excludedId)}</p>`:'';
  const fieldsHtml=fields.map(field=>`<section class="field"><span>${escapeHtml(field.label)}</span>${prose(field.lines.join('\n'),seen,excludedId)}</section>`).join('');
  return `<article class="stratagem turn-${turn}" id="rule-${slug(record.code)}" data-rule-code="${escapeHtml(record.code)}" data-turn="${turnLabel}"><div class="stratagem-rail">${cp?`<strong class="cp"><span>${escapeHtml(cp)}</span></strong>`:''}</div><header class="stratagem-head"><h3>${escapeHtml(record.title)}</h3><p class="stratagem-type">${sourceLabel(record)}</p>${flavourHtml}</header><div class="stratagem-fields">${fieldsHtml}${ruleVisuals(record.code)}</div></article>`;
}

function mainRule(record,children=[]){
  const id=`rule-${slug(record.code)}`;
  const special=record.code==='25.03'?musterTable():'';
  const nested=children.length?`<div class="subrules">${children.map(child=>{const excludedId=termByCode.get(child.code)?.id||'',seen=new Set();const text=renderContent(child,seen,excludedId);return `<details class="subrule" id="rule-${slug(child.code)}" data-rule-code="${escapeHtml(child.code)}"><summary><strong>${escapeHtml(displayTitle(child))}</strong></summary><div><span class="source-label">${sourceLabel(child)}</span>${text}${referenceStrip(child.code,seen)}${ruleVisuals(child.code)}</div></details>`;}).join('')}</div>`:'';
  const excludedId=termByCode.get(record.code)?.id||'';
  const seen=new Set();
  const text=record.code==='25.03'?prose(recordText(record).replace(/BATTLE SIZE\nIncursion:[\s\S]*?Unit limit 3\.\n?/,''),seen,excludedId,children.map(child=>child.code)):renderContent(record,seen,excludedId,children.map(child=>child.code));
  const faqHtml=(faqsByPrimary.get(record.code)||[]).map(faqCard).join('');
  return `<article class="rule kind-${escapeHtml(record.kind)}" id="${id}" data-rule-code="${escapeHtml(record.code)}"><header class="rule-head"><h3>${escapeHtml(displayTitle(record))}</h3><span class="page">${sourceLabel(record)}</span></header><div class="rule-body">${text}${faqHtml}${special}${referenceStrip(record.code,seen)}${ruleVisuals(record.code)}${nested}</div></article>`;
}

function introductionArticle(){
  const paragraphs=(data.introduction.paragraphs||[]).map(paragraph=>`<p>${linkedText(paragraph)}</p>`).join('');
  return `<article class="rule kind-introduction" id="introduction-overview"><header class="rule-head"><h3>Welcome to Warhammer 40,000</h3><span class="page">Introduction</span></header><div class="rule-body">${paragraphs}</div></article>`;
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
      cards=`${overview}<div class="core-stratagem-grid">${parents.filter(record=>record.code!=='15.01').map(stratagemCard).join('')}</div>`;
    }else cards=parents.map(record=>mainRule(record,records.filter(child=>child.code.startsWith(`${record.code}.`)))).join('');
  }
  const anchors=id==='introduction'?[]:records.filter(record=>record.code.split('.').length===2).map(record=>({id:`rule-${slug(record.code)}`,title:record.title}));
  const onPage=anchors.length?`<section class="nav-group on-page"><h2>On this page</h2>${anchors.map(item=>`<a href="#${item.id}">${escapeHtml(item.title)}</a>`).join('')}</section>`:'';
  const actions=[`<a class="button source" href="${pdfUrl}" target="_blank" rel="noreferrer">Official GW PDF ↗</a>`];
  if(previous)actions.push(`<a class="button" href="${fileFor(previous)}">← ${escapeHtml(byId.get(previous).title)}</a>`);
  if(next)actions.push(`<a class="button" href="${fileFor(next)}">${escapeHtml(byId.get(next).title)} →</a>`);
  const label=pages.length?pageLabel(pages):'Digital 11E';
  const content=`<header class="chapter-hero" data-number="${escapeHtml(section.number||'00')}"><span class="eyebrow">${escapeHtml(modules.find(module=>module.sections.includes(id))?.title||'Core Rules')} // ${escapeHtml(label)}</span><h2>${escapeHtml(section.title)}</h2><p>${escapeHtml(section.summary||'Complete rules for this section.')}</p><div class="hero-actions">${actions.join('')}</div></header><div class="rules">${cards}</div>${sourceLinks(pages)}`;
  return shell({title:section.title,current:id,currentLabel:section.title,onPage,content});
}

const groups=data.groups.map(group=>`<section class="home-section"><header><span class="eyebrow">${escapeHtml(group.pages)}</span><h2>${escapeHtml(group.title)}</h2><p>${escapeHtml(group.description)}</p></header><div class="home-grid">${group.sections.map(section=>`<a class="home-card" href="${fileFor(section.id)}"><small>${escapeHtml(pageLabel(pdf.sections[section.id]||[]))}</small><strong>${escapeHtml(section.title)}</strong><span>${escapeHtml(section.summary)}</span><em>Open chapter →</em></a>`).join('')}</div></section>`).join('');
const intro=data.introduction;
const indexContent=`<section class="chapter-hero"><span class="eyebrow">Warhammer 40,000 // Core Rules 11E</span><h2>Core Rules Reference</h2><p>Technical placeholder.</p><div class="hero-actions"><a class="button" href="${fileFor(intro.id)}">Start with Introduction →</a><a class="button source" href="${pdfUrl}" target="_blank" rel="noreferrer">Official GW PDF ↗</a></div></section>${groups}`;
fs.writeFileSync(path.join(root,'index.html'),shell({title:'Core Rules Reference',content:indexContent}));
for(const [index,id] of order.entries())fs.writeFileSync(path.join(root,fileFor(id)),sectionPage(id,index));
const searchIndex=digital.records.map(record=>{
  const sectionId=sectionByNumber.get(record.code.slice(0,2));
  return {code:record.code,title:record.title,chapter:byId.get(sectionId)?.title||'',text:normalize(recordText(record)),url:`${fileFor(sectionId)}#rule-${slug(record.code)}`};
});
for(const faq of faqs){
  const sectionId=sectionByNumber.get(faq.primaryRule.slice(0,2));
  searchIndex.push({code:faq.id,title:faq.question,chapter:byId.get(sectionId)?.title||'',text:faq.answer,url:`${fileFor(sectionId)}#${faq.id}`});
}
fs.writeFileSync(path.join(root,'search-index.json'),JSON.stringify(searchIndex));
const stale=path.join(root,'rules-appendix.html');
if(fs.existsSync(stale))fs.unlinkSync(stale);
console.log(`Core Rules Reader built: ${order.length} chapters, ${digital.records.length} Wahapedia 11E records, ${Object.values(digital.images).flat().length} diagrams.`);

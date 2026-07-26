import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';

const root=path.dirname(fileURLToPath(import.meta.url));
const bookRoot=path.dirname(root);
const repoRoot=path.resolve(bookRoot,'..','..');
const context={window:{}};
for(const file of ['content/core-rules.source.en.js','content/core-rules.en.js','config.js','basic-content.js']){
  vm.runInNewContext(fs.readFileSync(path.join(bookRoot,file),'utf8'),context);
}

const data=context.window.CORE_RULES;
const pdf=context.window.CORE_PDF_SOURCE;
const modules=context.window.CORE_LEARN_MODULES;
const basic=context.window.CORE_BASIC_LAYOUTS;
const digital=JSON.parse(fs.readFileSync(path.join(bookRoot,'content','core-rules.digital-11e.json'),'utf8'));
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
  'PhaseAbility_Move.png':'09.02','PhaseAbility_Shoot.png':'10.02','MakingAChargeMove.png':'11.02',
  'StartOfFightPhase.png':'12.01','PileInMoves.png':'12.02','PhaseAbility_Fight.png':'12.04','NormalFight.png':'12.05','OverrunFight.png':'12.06','OngoingConsolidation.png':'12.07','ObjectiveConsolidation.png':'12.07',
  'TerrainPlacedOnAMat.png':'13.01','TerrainPlacedOnTheBattlefield.png':'13.01','TerrainAndMovement.png':'13.06','TerrainAndMovement2.png':'13.06','BenefitOfCover.png':'13.08','HiddenAndObscuring.png':'13.09','Solid.png':'13.11',
  'ControllingATerrainObjective.png':'14.01','ExampleAction.png':'16.01','EngagedMonstersVehiclesShooting.png':'17.03',
  'MakingASurgeMove.png':'21.02','TakingToTheSkies.png':'21.03','PlungingFire.png':'22.05'
};
const diagrams=Object.values(digital.images).flat();
const ruleReferences={
  '01.02.01':['core-starting-strength','core-half-strength','core-below-half-strength','core-below-starting-strength'],
  '01.03':['core-player-turn'],
  '02.02':['core-characteristic-move','core-characteristic-toughness','core-characteristic-save','core-characteristic-wounds','core-characteristic-leadership'],
  '02.03':['core-characteristic-invulnerable-save'],
  '02.04':['core-characteristic-ballistic-skill','core-characteristic-weapon-skill','core-characteristic-strength','core-characteristic-damage']
};

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

const candidates=new Map();
for(const term of Object.values(registry.terms)){
  if(term.scope!=='global'&&term.canonicalSource?.documentId!=='core-rules'&&!(term.sourceRefs||[]).includes('core-rules'))continue;
  for(const label of [term.title?.en,...(term.aliases||[]),...(term.matchLabels||[])]){
    const token=normalizeLabel(label);
    if(token.length<3)continue;
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
  return `<button class="term${extraClass?` ${extraClass}`:''}" type="button" data-term="${escapeHtml(term.id)}" data-term-title="${escapeHtml(term.title?.en||label)}" data-term-summary="${escapeHtml(term.summary?.en||term.definition?.en||'Open the complete glossary entry for this term.')}" aria-haspopup="dialog">${escapeHtml(label)}</button>`;
}

function linkedText(value){
  const text=normalize(value);
  let cursor=0;
  let html='';
  matcher.lastIndex=0;
  for(let match=matcher.exec(text);match;match=matcher.exec(text)){
    const prefix=match[1]||'';
    const label=match[2];
    const start=match.index+prefix.length;
    const term=terms.get(normalizeLabel(label));
    html+=escapeHtml(text.slice(cursor,start));
    html+=termButton(term,label);
    cursor=start+label.length;
  }
  return html+escapeHtml(text.slice(cursor));
}

function prose(text){
  const lines=String(text||'').split(/\n+/).map(line=>line.trim()).filter(Boolean);
  const output=[];
  let bullets=[];
  let previous='';
  const flush=()=>{if(bullets.length){output.push(`<ul>${bullets.map(item=>`<li>${linkedText(item)}</li>`).join('')}</ul>`);bullets=[];}};
  for(const line of lines){
    if(line===previous)continue;
    previous=line;
    if(/^SEE ALSO$/i.test(line)){flush();output.push('<h4 class="see-also">See also</h4>');continue;}
    if(/^•\s*/.test(line)){bullets.push(line.replace(/^•\s*/,''));continue;}
    flush();output.push(`<p>${linkedText(line)}</p>`);
  }
  flush();
  return output.join('')||'<p>See the linked source.</p>';
}

function fileFor(id){return `${id}.html`;}
function pageLabel(pages){
  if(!pages.length)return 'Digital 11E';
  return pages.length===1?`page ${pages[0]}`:`pages ${pages[0]}–${pages.at(-1)}`;
}

function primaryNav(current=''){
  return modules.map(module=>`<section class="nav-group"><h2>${escapeHtml(module.title)}</h2>${module.sections.map(id=>{
    const section=byId.get(id);
    return `<a href="${fileFor(id)}"${id===current?' aria-current="page"':''}>${section.number?`${escapeHtml(section.number)} `:''}${escapeHtml(section.title)}</a>`;
  }).join('')}</section>`).join('');
}

function shell({title,current='',currentLabel='Start',onPage='',content}){
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="theme-color" content="#0d0f0d"><link rel="manifest" href="../../../manifest.webmanifest"><title>${escapeHtml(title)} — Core Rules</title><link rel="stylesheet" href="styles.css?v=5"></head><body>
<header class="topbar"><button class="menu" id="navButton" type="button" aria-label="Open navigation" aria-controls="sidebar" aria-expanded="false">☰</button><a class="brand" href="index.html"><strong>Core Rules</strong><small>11E · Quick Reader</small></a><span class="current">${escapeHtml(currentLabel)}</span><button class="search-button" id="searchButton" type="button" aria-label="Search Core Rules">Search</button><a class="library" href="../../../index.html">← Library</a></header><button class="scrim" id="navScrim" type="button" aria-label="Close navigation" hidden></button>
<aside class="sidebar" id="sidebar"><div class="sidebar-head"><span class="eyebrow">Core register // 11E</span><h1>Contents</h1></div><nav><section class="nav-group"><h2>Reader</h2><a href="index.html"${!current?' aria-current="page"':''}>Start</a></section>${primaryNav(current)}${onPage}</nav><a class="mega" href="../index.html">Classic reader →</a><a class="mega" href="../../../glossary/index.html">Mega Glossary →</a></aside>
<main class="main">${content}</main><dialog class="search-dialog" id="searchDialog"><form method="dialog" class="dialog-head"><span>Core Rules // search</span><button type="submit" aria-label="Close search">×</button></form><label for="searchInput">Find a rule</label><input id="searchInput" type="search" autocomplete="off" placeholder="Code, title or rule text"><p class="search-status" id="searchStatus">Type at least two characters.</p><div class="search-results" id="searchResults"></div></dialog><dialog class="dialog" id="termDialog"><div class="dialog-head"><span>Mega Glossary // quick entry</span><button id="termClose" type="button" aria-label="Close">×</button></div><h2 id="termTitle"></h2><p id="termSummary"></p><a id="termFull">Full article →</a></dialog><dialog class="image-dialog" id="imageDialog"><button id="imageClose" type="button" aria-label="Close diagram">×</button><img id="imagePreview" alt=""><p id="imageCaption"></p></dialog><script src="app.js?v=3"></script></body></html>`;
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
  const ruleLabel=`${code} — ${(rule?.title||'Rules diagram').replace(/^\d+\.\s*/,'')}`;
  return `<div class="rule-visuals" aria-label="Diagrams for ${escapeHtml(ruleLabel)}">${items.map(item=>{const detail=/^ex\d+$/i.test(item.caption||'')?'':item.caption;return `<figure data-visual-rule="${escapeHtml(code)}"><figcaption><small>Diagram for rule</small><strong>${escapeHtml(ruleLabel)}</strong>${detail?`<span>${escapeHtml(detail)}</span>`:''}</figcaption><a href="../assets/diagrams/${escapeHtml(item.file)}"><img src="../assets/diagrams/${escapeHtml(item.file)}" alt="${escapeHtml(detail||ruleLabel)}" loading="lazy" decoding="async"></a></figure>`;}).join('')}</div>`;
}

function referenceStrip(code){
  const items=(ruleReferences[code]||[]).map(id=>registry.terms[id]).filter(Boolean);
  if(!items.length)return '';
  return `<nav class="rule-references" aria-label="Glossary concepts for ${escapeHtml(code)}"><span>Glossary concepts</span>${items.map(term=>termButton(term,term.title.en)).join('')}</nav>`;
}

function stratagemCard(record){
  const lines=String(record.text||'').split(/\n+/).map(normalize).filter(Boolean);
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
  const title=termButton(termByCode.get(record.code),record.title,'stratagem-title');
  return `<article class="stratagem turn-${turn}" id="rule-${slug(record.code)}" data-rule-code="${escapeHtml(record.code)}" data-turn="${turnLabel}"><div class="stratagem-rail">${cp?`<strong class="cp"><span>${escapeHtml(cp)}</span></strong>`:''}</div><header class="stratagem-head"><h3>${title}</h3><p class="stratagem-type">CORE // ${escapeHtml(record.kind.replaceAll('-',' '))}</p>${flavour.length?`<p class="stratagem-flavour">${linkedText(flavour.join(' '))}</p>`:''}</header><div class="stratagem-fields">${fields.map(field=>`<section class="field"><span>${escapeHtml(field.label)}</span>${prose(field.lines.join('\n'))}</section>`).join('')}${ruleVisuals(record.code)}</div></article>`;
}

function mainRule(record,children=[]){
  const id=`rule-${slug(record.code)}`;
  const special=record.code==='25.03'?musterTable():'';
  const nested=children.length?`<div class="subrules">${children.map(child=>`<details class="subrule" id="rule-${slug(child.code)}" data-rule-code="${escapeHtml(child.code)}"><summary><span>${termButton(termByCode.get(child.code),child.code)}</span><strong>${termButton(termByCode.get(child.code),child.title)}</strong></summary><div>${prose(child.text)}${referenceStrip(child.code)}${ruleVisuals(child.code)}</div></details>`).join('')}</div>`:'';
  return `<article class="rule kind-${escapeHtml(record.kind)}" id="${id}" data-rule-code="${escapeHtml(record.code)}"><header class="rule-head"><span class="rule-code">${termButton(termByCode.get(record.code),record.code)}</span><h3>${termButton(termByCode.get(record.code),record.title)}</h3><span class="page">${escapeHtml(record.kind.replaceAll('-',' '))}</span></header><div class="rule-body">${prose(record.text)}${special}${referenceStrip(record.code)}${ruleVisuals(record.code)}${nested}</div></article>`;
}

function sectionPage(id,index){
  const section=byId.get(id);
  const pages=pdf.sections[id]||[];
  const records=recordsBySection.get(id)||[];
  const previous=order[index-1];
  const next=order[index+1];
  let cards='';
  if(id==='introduction'){
    cards=(basic.introduction?.paragraphs||[]).map((paragraph,paragraphIndex)=>mainRule({code:`00.${String(paragraphIndex+1).padStart(2,'0')}`,title:paragraphIndex===0?'Welcome to Warhammer 40,000':`Introduction ${paragraphIndex+1}`,text:paragraph,kind:'introduction'})).join('');
  }else{
    const parents=records.filter(record=>record.code.split('.').length===2);
    if(id==='stratagems'){
      const overview=parents.filter(record=>record.code==='15.01').map(record=>mainRule(record,records.filter(child=>child.code.startsWith(`${record.code}.`)))).join('');
      cards=`${overview}<div class="core-stratagem-grid">${parents.filter(record=>record.code!=='15.01').map(stratagemCard).join('')}</div>`;
    }else cards=parents.map(record=>mainRule(record,records.filter(child=>child.code.startsWith(`${record.code}.`)))).join('');
  }
  const anchors=(id==='introduction'?[]:records.filter(record=>record.code.split('.').length===2).map(record=>({id:`rule-${slug(record.code)}`,title:record.title}))).slice(0,20);
  const onPage=anchors.length?`<section class="nav-group on-page"><h2>On this page</h2>${anchors.map(item=>`<a href="#${item.id}">${escapeHtml(item.title)}</a>`).join('')}</section>`:'';
  const actions=[`<a class="button source" href="${pdfUrl}" target="_blank" rel="noreferrer">Official GW PDF ↗</a>`];
  if(previous)actions.push(`<a class="button" href="${fileFor(previous)}">← ${escapeHtml(byId.get(previous).title)}</a>`);
  if(next)actions.push(`<a class="button" href="${fileFor(next)}">${escapeHtml(byId.get(next).title)} →</a>`);
  const label=pages.length?pageLabel(pages):'Digital 11E';
  const content=`<header class="chapter-hero" data-number="${escapeHtml(section.number||'00')}"><span class="eyebrow">${escapeHtml(modules.find(module=>module.sections.includes(id))?.title||'Core Rules')} // ${escapeHtml(label)}</span><h2>${escapeHtml(section.title)}</h2><p>${escapeHtml(section.summary||basic[id]?.lead||'Complete rules for this section.')}</p><div class="hero-actions">${actions.join('')}</div></header><div class="rules">${cards}</div>${sourceLinks(pages)}`;
  return shell({title:section.title,current:id,currentLabel:`${section.number||'00'} ${section.title}`,onPage,content});
}

const groups=data.groups.map(group=>`<section class="home-section"><header><span class="eyebrow">${escapeHtml(group.range)} // ${escapeHtml(group.pages)}</span><h2>${escapeHtml(group.title)}</h2><p>${escapeHtml(group.description)}</p></header><div class="home-grid">${group.sections.map(section=>`<a class="home-card" href="${fileFor(section.id)}"><small>${escapeHtml(section.number)} // ${escapeHtml(pageLabel(pdf.sections[section.id]||[]))}</small><strong>${escapeHtml(section.title)}</strong><span>${escapeHtml(section.summary)}</span><em>Open chapter →</em></a>`).join('')}</div></section>`).join('');
const intro=data.introduction;
const indexContent=`<section class="chapter-hero" data-number="25"><span class="eyebrow">Warhammer 40,000 // Core Rules 11E</span><h2>Rules,<br>without the weight.</h2><p>Introduction and all 25 numbered chapters, including digital clarifications, Core Stratagems, Muster Armies and the diagrams used by the 11E reference.</p><div class="hero-actions"><a class="button" href="${fileFor(intro.id)}">Start with Introduction →</a><a class="button source" href="${pdfUrl}" target="_blank" rel="noreferrer">Official GW PDF ↗</a></div></section>${groups}`;
fs.writeFileSync(path.join(root,'index.html'),shell({title:'Complete Reader',content:indexContent}));
for(const [index,id] of order.entries())fs.writeFileSync(path.join(root,fileFor(id)),sectionPage(id,index));
const searchIndex=digital.records.map(record=>{
  const sectionId=sectionByNumber.get(record.code.slice(0,2));
  return {code:record.code,title:record.title,chapter:byId.get(sectionId)?.title||'',text:normalize(record.text),url:`${fileFor(sectionId)}#rule-${slug(record.code)}`};
});
fs.writeFileSync(path.join(root,'search-index.json'),JSON.stringify(searchIndex));
const stale=path.join(root,'rules-appendix.html');
if(fs.existsSync(stale))fs.unlinkSync(stale);
console.log(`Core Rules Reader built: ${order.length} chapters, ${digital.records.length} Wahapedia 11E records, ${Object.values(digital.images).flat().length} diagrams.`);

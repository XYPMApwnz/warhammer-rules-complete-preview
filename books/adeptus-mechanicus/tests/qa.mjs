import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const json=file=>JSON.parse(read(file));
const html=read('index.html');
const sharedTargets=fs.readFileSync(path.resolve(root,'..','shared','navigation-targets.js'),'utf8');
const sharedDatasheetLayout=fs.readFileSync(path.resolve(root,'..','shared','datasheet-layout.js'),'utf8');
const sharedDatasheetCss=fs.readFileSync(path.resolve(root,'..','shared','datasheet-system.css'),'utf8');
const sharedPopupContent=fs.readFileSync(path.resolve(root,'..','shared','popup-content.js'),'utf8');
const sharedGlossaryAutolink=fs.readFileSync(path.resolve(root,'..','shared','glossary-autolink.js'),'utf8');
const factionRules=json('content/adeptus-mechanicus-rules.en.json');
const source=json('content/adeptus-mechanicus-source.en.json');
const codex=json('content/adeptus-mechanicus-codex-detachments.en.json');
const codexDatasheets=json('content/adeptus-mechanicus-codex-datasheets.en.json');
const currentPoints=json('content/adeptus-mechanicus-points.en.json');
const factionDatasheets=new Map(factionRules.datasheets.map(unit=>[unit.id,unit]));
const mergedDatasheets=codexDatasheets.datasheets.map(unit=>factionDatasheets.has(unit.id)?{...unit,...factionDatasheets.get(unit.id),category:unit.category}:unit);
const rules={...factionRules,datasheets:mergedDatasheets};
const allDetachments=[...rules.detachments,...codex.detachments];
const node=process.execPath;
const results=[];
const check=(name,ok,detail='')=>results.push({name,ok,detail});

const scripts=['scripts/data.js','scripts/navigation-controller.js','scripts/popup-controller.js','scripts/journey-controller.js','scripts/ui-controllers.js','scripts/related-rules.js','scripts/roster-enhancements.js','scripts/roster-filter.js','scripts/app.js'];
for(const file of scripts){try{new vm.Script(read(file),{filename:file});check(`${file} syntax`,true);}catch(error){check(`${file} syntax`,false,error.message);}}
try{new vm.Script(sharedTargets,{filename:'../shared/navigation-targets.js'});check('shared navigation targets syntax',true);}catch(error){check('shared navigation targets syntax',false,error.message);}
try{new vm.Script(sharedDatasheetLayout,{filename:'../shared/datasheet-layout.js'});check('shared datasheet layout syntax',true);}catch(error){check('shared datasheet layout syntax',false,error.message);}
try{new vm.Script(sharedPopupContent,{filename:'../shared/popup-content.js'});check('shared popup content syntax',true);}catch(error){check('shared popup content syntax',false,error.message);}
try{new vm.Script(sharedGlossaryAutolink,{filename:'../shared/glossary-autolink.js'});check('shared glossary autolink syntax',true);}catch(error){check('shared glossary autolink syntax',false,error.message);}

const markup=html.replace(/<script[\s\S]*?<\/script>/gi,'');
const ids=[...markup.matchAll(/\sid="([^"]+)"/g)].map(x=>x[1]);
const idSet=new Set(ids);
const navTargets=[...markup.matchAll(/data-nav-target="([^"]+)"/g)].map(x=>x[1]);
const trackTargets=[...markup.matchAll(/data-track="([^"]+)"/g)].map(x=>x[1]);
const journeyTargets=[...markup.matchAll(/data-journey-target="([^"]+)"/g)].map(x=>x[1]);
const localTargets=[...markup.matchAll(/class="local-tab" data-journey-target="([^"]+)"/g)].map(x=>x[1]);
const depths=[...markup.matchAll(/data-nav-depth="(\d+)"/g)].map(x=>Number(x[1]));
const topLevelTargets=[...markup.matchAll(/<li data-nav-id="[^"]+" data-nav-depth="1">[\s\S]*?<button class="toc-label" data-nav-target="([^"]+)"/g)].map(x=>x[1]);
const required=['appHeader','navMenu','navCollapse','backButton','themeButton','tocScrim','tocPanel','tocTree','navSearch','main','readerTools','globalSearch','globalSearchClear','searchResults','glossary','glossarySearch','searchClear','noResults','popupLayer'];

check('source snapshot has all 26 pages',source.meta.pageCount===26&&Object.keys(source.pages).length===26);
check('source hash is locked',source.meta.sha256==='7F01DD2CE7E35C762B0AB625ADE779022275574CF2D01EE46EE16B2F5582341C'&&source.meta.sha256===rules.source.sha256);
check('canonical content has five detachments',rules.detachments.length===5);
check('army has ten total detachments',allDetachments.length===10);
check('five Codex detachments are restored',codex.detachments.length===5);
check('every Codex detachment has four enhancements and six stratagems',codex.detachments.every(x=>x.enhancements.length===4&&x.stratagems.length===6));
check('detachment card counts are complete',JSON.stringify(rules.detachments.map(x=>[x.enhancements.length,x.stratagems.length]))===JSON.stringify([[2,3],[2,3],[2,3],[4,6],[4,6]]));
check('codex layer has 39 datasheets',rules.datasheets.length===39&&rules.datasheets.length===codexDatasheets.audit.datasheets);
check('five datasheets are Legends',rules.datasheets.filter(x=>x.status==='Warhammer Legends').length===5);
check('every datasheet has stats, weapons, abilities and provenance',rules.datasheets.every(x=>Object.keys(x.stats).length>=6&&x.weapons.length&&x.abilities.length&&(x.sourcePages?.length||x.source?.url)));
check('official multi-profile datasheet is preserved',factionRules.datasheets.find(unit=>unit.title==='Servitor Battleclade')?.profiles?.length===2);
check('official Legends and Faction Pack clarifications are complete',[
  'cannot end a move within a wall',
  "Starting Strength is increased accordingly",
  'neither it nor any units embarked within it count towards limits',
  'Enhanced data-tether',
  'Designer\'s Note: a unit that already has HALO OVERRIDE'
].every(text=>JSON.stringify(factionRules).includes(text)));
check('placeholder compositions are gone',codexDatasheets.datasheets.every(unit=>!/^See the model selections/i.test(unit.composition||'')));
check('all source pages are represented in the UI',Array.from({length:26},(_,i)=>i+1).every(page=>html.includes(`#page=${page}`)||html.includes(`Page ${page}`)));
check('required interaction IDs are present',required.every(id=>idSet.has(id)),required.filter(id=>!idSet.has(id)).join(', '));
check('HTML IDs are unique',ids.length===idSet.size,`${ids.length}/${idSet.size}`);
check('all navigation targets exist',navTargets.every(id=>idSet.has(id)),navTargets.filter(id=>!idSet.has(id)).join(', '));
check('all navigation targets are tracked',navTargets.every(id=>trackTargets.includes(id)),navTargets.filter(id=>!trackTargets.includes(id)).join(', '));
check('navigation depth stays at three',Math.max(...depths)===3);
check('top-level navigation matches the DG contract',JSON.stringify(topLevelTargets)===JSON.stringify(['start','updates','core-rules','detachments','datasheets','glossary']),topLevelTargets.join(', '));
check('datasheets use category then unit hierarchy',['datasheets-epic-heroes','datasheets-characters','datasheets-battleline','datasheets-dedicated-transports','datasheets-other','datasheets-warhammer-legends'].every(id=>navTargets.includes(id))&&rules.datasheets.every(unit=>markup.includes(`data-nav-id="${unit.id}" data-nav-depth="3"`)));
check('detachment navigation uses singular Enhancement label',(markup.match(/data-nav-depth="3"[^>]*>[\s\S]*?data-nav-target="[^"]+-enhancements">Enhancement<\/button>/g)||[]).length===allDetachments.length);
check('all Journey targets resolve',journeyTargets.every(id=>idSet.has(id)));
check('local datasheet tabs are not global navigation',localTargets.length===rules.datasheets.length*4&&localTargets.every(id=>!navTargets.includes(id)));
check('all ten detachments render all tracked parts',(markup.match(/class="detachment-part"/g)||[]).length===30);
check('all 39 unit cards render',(markup.match(/class="unit-card surface/g)||[]).length===rules.datasheets.length);
check('Legends is a datasheet category, not a global section',!topLevelTargets.includes('legends')&&navTargets.includes('datasheets-warhammer-legends')&&legendsCount(markup)===5);
check('favorite Doctrina console is preserved',markup.includes('class="doctrina-console surface"')&&markup.includes('data-protocol="protector"')&&markup.includes('data-protocol="conqueror"'));
check('local official transcripts are embedded',(markup.match(/class="source-transcript"/g)||[]).length===rules.updates.length+rules.detachments.length+factionRules.datasheets.length+2);
check('Codex transcription status is explicit',markup.includes('Codex transcription layer')&&markup.includes('39 indexed datasheets'));
check('official MFM verification is visible',markup.includes('Munitorum Field Manual v1.1')&&markup.includes('All 34 current Enhancement costs'));
check('removed army points section stays removed',!markup.includes('My Army · 995')&&!markup.includes('army-roster-995'));
check('no replacement characters in generated/runtime files',!['index.html',...scripts,...['styles/content.css','styles/mechanicus.css']].map(read).join('').includes('\uFFFD'));
check('no inline script or style',!/<style|<script(?![^>]*src=)/i.test(html));
check('all stylesheet and script assets resolve',[...markup.matchAll(/(?:href|src)="\.\/([^"?#]+)/g)].map(x=>x[1]).filter(x=>!x.endsWith('.pdf')).every(file=>fs.existsSync(path.join(root,file))));

const context={window:{},Object};vm.runInNewContext(read('scripts/data.js'),context);
const terms=context.window.DG_TERMS||{};
check('term registry expands the canonical glossary',Object.keys(terms).length>=rules.glossary.length+150,`${Object.keys(terms).length} terms`);
check('term glossary destinations resolve',Object.values(terms).every(term=>idSet.has(term.glossary)));
check('term rule and unit destinations resolve',Object.values(terms).every(term=>(!term.rule||idSet.has(term.rule))&&(!term.units||term.units.every(id=>idSet.has(id)))));
check('datasheet abilities and weapons are interactive',(markup.match(/class="ability"/g)||[]).length>100&&(markup.match(/class="weapon-button" data-term=/g)||[]).length>150);

const navSource=read('scripts/navigation-controller.js');
const popupSource=read('scripts/popup-controller.js');
check('single passive scroll owner remains',(navSource.match(/addEventListener\('scroll'/g)||[]).length===1&&navSource.includes("state={owner:'reader'")&&navSource.includes('{passive:true}'));
check('scroll spy uses cached geometry',!navSource.slice(navSource.indexOf('pickActive(){'),navSource.indexOf('scheduleRead(){')).includes('getBoundingClientRect'));
check('manual scroll ignores transient navigation candidates',navSource.includes('readerHoldMs=90')&&navSource.includes('this.readerCandidate'));
check('navigation uses the shared explicit target resolver',navSource.includes('WHNavigationTargets.resolve')&&!navSource.includes("querySelector(':scope > .stratagem')")&&!navSource.includes("querySelector('.stratagem')"));
check('outside click closes the complete popup chain',popupSource.includes("this.ids.length&&!event.target.closest('.term-popup')")&&popupSource.includes('this.closeFrom(0)'));
check('popup actions inherit their originating unit context',popupSource.includes("contextualUnit(){return this.rootElement()?.closest?.('.unit-card')||null;}")&&popupSource.includes('contextualStatline'));
check('Mega Glossary transitions use the shared return helper',html.includes('../../glossary-return.js?v=2')&&popupSource.includes('WHGlossaryReturn')&&read('scripts/app.js').includes('WHGlossaryReturn'));
check('book loads the shared navigation target resolver',html.includes('src="../shared/navigation-targets.js?v=1"'));
check('book loads the shared datasheet design',html.includes('href="../shared/datasheet-system.css?v=6"'));
check('book loads the shared datasheet layout',html.includes('src="../shared/datasheet-layout.js?v=2"'));
check('glossary autolinking precedes navigation geometry',read('scripts/app.js').indexOf('WHGlossaryAutolink?.apply')<read('scripts/app.js').indexOf('new window.DGNavigation'));
check('shared datasheet statlines keep every characteristic on one row',/\.unit-card \.statline\s*\{[^}]*display:\s*flex/.test(sharedDatasheetCss));
check('mobile weapon characteristics use one six-column row',sharedDatasheetCss.includes('grid-template-columns: repeat(6, minmax(0, 1fr))')&&(html.match(/data-label="(?:Range|A|BS|WS|S|AP|D)"/g)||[]).length===rules.datasheets.reduce((sum,unit)=>sum+unit.weapons.length,0)*6);
check('mobile layout avoids content-visibility geometry jumps',!read('styles/content.css').includes('content-visibility: auto'));
check('desktop stratagem cards use two columns with a responsive fallback',read('styles/content.css').includes('.detachment-part[id$="-stratagems"] > .detachment-content { grid-template-columns: repeat(2, minmax(0, 1fr))')&&/@media\s*\(max-width:\s*1100px\)[\s\S]*?grid-template-columns:\s*1fr/.test(read('styles/content.css')));
check('navigation cancellation remains wired',navSource.includes("root.style.scrollBehavior='auto'")&&navSource.includes("behavior:'auto'"));
check('navigation gap has one CSS source',read('styles/tokens.css').includes('--navigation-gap: 18px')&&navSource.includes("getPropertyValue('--navigation-gap')")&&!navSource.includes('trackingGap=18'));
check('header home does not mutate the URL hash',markup.includes('<button class="app-brand" type="button" data-header-home>')&&!markup.includes('href="#start"'));
check('header exposes the shared Mega Glossary',markup.includes('href="../../glossary/index.html"')&&markup.includes('Mega Glossary'));
check('mobile weapon labels stay dynamic',read('scripts/ui-controllers.js').includes('cell.dataset.label=labels[columnIndex]')&&read('styles/content.css').includes('content: attr(data-label)'));

const extractor=spawnSync('C:\\Users\\denis\\.cache\\codex-runtimes\\codex-primary-runtime\\dependencies\\python\\python.exe',[path.join(root,'tools','extract-faction-pack.py'),'--check'],{encoding:'utf8'});
check('PDF extraction snapshot is current',extractor.status===0,(extractor.stderr||extractor.stdout).trim());
const codexExtractor=spawnSync(node,[path.join(root,'tools','extract-datasheets.mjs'),'--check'],{encoding:'utf8'});
check('Codex datasheet snapshot is current',codexExtractor.status===0,(codexExtractor.stderr||codexExtractor.stdout).trim());
const pointsExtractor=spawnSync(node,[path.join(root,'tools','extract-points.mjs'),'--check'],{encoding:'utf8'});
check('current points and Enhancements snapshot is current',pointsExtractor.status===0,(pointsExtractor.stderr||pointsExtractor.stdout).trim());
check('official MFM unit sizes are locked',[
  ['Ironstrider Ballistarii','3rd+ unit: 3 models'],
  ['Sydonian Dragoons with radium jezzails','3 models'],
  ['Sydonian Dragoons with taser lances','3 models'],
  ['Servitor Battleclade','9 models'],
  ['Skitarii Rangers','10 models'],
  ['Sydonian Skatros','1 model']
].every(([title,label])=>currentPoints.units.find(unit=>unit.title===title)?.points.some(row=>row.label===label)));
check('official MFM provenance is locked',currentPoints.source.officialVersion==='v1.1'&&currentPoints.source.officialUrl==='https://mfm.warhammer-community.com/en/adeptus-mechanicus');
check('carried-forward rules no longer use placeholder wording',!JSON.stringify(codex).match(/rule's listed roll|following the rule's unit restrictions|under the listed Acquisition conditions|according to the Stratagem's conditions/));
check('personal roster integration is loaded',html.includes('../shared/roster-parser.js?v=2')&&html.includes('../../roster-guides/points-validator.js?v=2')&&html.includes('./scripts/roster-filter.js?v=2')&&html.includes('data-roster-guides'));
check('every Enhancement has a detachment and current cost',json('content/adeptus-mechanicus-points.en.json').enhancements.length===34&&json('content/adeptus-mechanicus-points.en.json').enhancements.every(item=>item.detachment&&item.value>0));
const build=spawnSync(node,[path.join(root,'tools','build-full-content.mjs'),'--check'],{encoding:'utf8'});
check('generated project artifacts are current',build.status===0,(build.stderr||build.stdout).trim());

function legendsCount(markup){return (markup.match(/class="unit-card surface legends-card"/g)||[]).length;}
for(const result of results)console.log(`${result.ok?'PASS':'FAIL'}  ${result.name}${result.detail?' — '+result.detail:''}`);
const failed=results.filter(x=>!x.ok);
console.log(`\n${results.length-failed.length}/${results.length} checks passed.`);
if(failed.length)process.exitCode=1;

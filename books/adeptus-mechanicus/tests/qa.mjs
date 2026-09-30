import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {normalizedTextSha256} from '../tools/source-hash.mjs';
import {createAdeptusMechanicusCanonicalModel} from '../tools/canonical-source-adapter.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const json=file=>JSON.parse(read(file));
const entry=read('index.html');
const targetSandbox={window:{}};vm.runInNewContext(read('scripts/target-data.js'),targetSandbox);
const html=read('reader.html')+targetSandbox.window.WH_ARMY_BOOK_TARGETS.html;
const mobileArmyRules=read('mobile/army-rules.html');
const mobileUnitPage=read('mobile/skitarii-rangers.html');
const mobileBuildSource=read('mobile/build.mjs');
const mobileRouteFiles=fs.readdirSync(path.join(root,'mobile')).filter(file=>file.endsWith('.html')).sort();
const mobileRoutePages=mobileRouteFiles.map(file=>read(`mobile/${file}`));
const deathGuardRoot=path.resolve(root,'..','death-guard');
const sharedOwned=new Map([['styles/content.css','styles/content.css'],['styles/popups.css','styles/popups.css'],['scripts/navigation-controller.js','controllers/navigation-controller.js'],['scripts/popup-controller.js','controllers/popup-controller.js']]);
const sharedRoot=path.resolve(root,'..','shared');
const deathGuardRead=file=>fs.readFileSync(sharedOwned.has(file)?path.join(sharedRoot,sharedOwned.get(file)):path.join(deathGuardRoot,file),'utf8');
const deathGuardTargetSandbox={window:{}};vm.runInNewContext(fs.readFileSync(path.join(deathGuardRoot,'scripts','target-data.js'),'utf8'),deathGuardTargetSandbox);
const deathGuardHtml=deathGuardRead('reader.html')+deathGuardTargetSandbox.window.WH_ARMY_BOOK_TARGETS.html;
const appSource=read('scripts/app.js');
const sharedArmyBookSource=read('../shared/army-book-app.js');
const sharedRelatedRulesSource=read('../shared/army-related-rules.js');
const sharedCompatibleMatrixSource=read('../shared/compatible-rules-matrix.mjs');
const sharedStratagemPresentationSource=read('../shared/stratagem-presentation.mjs');
const rosterFilterSource=read('scripts/roster-filter.js');
const rosterEnhancementSource=read('scripts/roster-enhancements.js');
const canonicalPopupRuntime=deathGuardRead('scripts/popup-controller.js');
const canonicalPopupCss=deathGuardRead('styles/popups.css');
const mobileRedirectRuntime=fs.readFileSync(path.resolve(root,'..','shared','mobile-route-redirect.js'),'utf8');
const sharedTargets=fs.readFileSync(path.resolve(root,'..','shared','navigation-targets.js'),'utf8');
const sharedDatasheetLayout=fs.readFileSync(path.resolve(root,'..','shared','datasheet-layout.js'),'utf8');
const sharedDatasheetCss=fs.readFileSync(path.resolve(root,'..','shared','datasheet-system.css'),'utf8');
const sharedPopupContent=fs.readFileSync(path.resolve(root,'..','shared','popup-content.js'),'utf8');
const sharedGlossaryAutolink=fs.readFileSync(path.resolve(root,'..','shared','glossary-autolink.js'),'utf8');
const serviceWorker=read('../../service-worker.js');
const glossaryRegistryText=fs.readFileSync(path.resolve(root,'..','..','glossary','registry.en.json'),'utf8');
const glossaryRegistry=JSON.parse(glossaryRegistryText);
const glossaryBuildSource=fs.readFileSync(path.resolve(root,'..','..','glossary','tools','build-glossary.mjs'),'utf8');
const cacheRevisionSource=fs.readFileSync(path.resolve(root,'..','..','tools','cache-revision.mjs'),'utf8');
const factionRules=json('content/adeptus-mechanicus-rules.en.json');
const rosterCatalogSandbox={window:{}};vm.runInNewContext(read('scripts/roster-data.js'),rosterCatalogSandbox);
const rosterCatalog=rosterCatalogSandbox.window.WH_BOOK_ROSTER_CATALOG;
const pointsCatalogSandbox={window:{}};vm.runInNewContext(read('../../roster-guides/points-data.js'),pointsCatalogSandbox);
const publishedMechanicusPoints=pointsCatalogSandbox.window.WH_POINTS_CATALOG['adeptus mechanicus'].enhancements;
const source=json('content/adeptus-mechanicus-source.en.json');
const codex=json('content/adeptus-mechanicus-codex-detachments.en.json');
const codexParity=json('content/adeptus-mechanicus-codex-parity.en.json');
const codexDatasheets=json('content/adeptus-mechanicus-codex-datasheets.en.json');
const codexWargear=json('content/adeptus-mechanicus-codex-wargear.en.json');
const currentPoints=json('content/adeptus-mechanicus-points.en.json');
const officialMfm=json('sources/official-mfm-v1.3.json');
const relatedRulesConfig=json('content/adeptus-mechanicus-related-rules.en.json');
const canonicalModel=createAdeptusMechanicusCanonicalModel({config:json('book.config.json'),readJson:json});
const factionDatasheets=new Map(factionRules.datasheets.map(unit=>[unit.id,unit]));
const mergedDatasheets=codexDatasheets.datasheets.map(unit=>factionDatasheets.has(unit.id)?{...unit,...factionDatasheets.get(unit.id),category:unit.category}:unit);
const rules={...factionRules,datasheets:mergedDatasheets};
const allDetachments=[...rules.detachments,...codex.detachments];
const node=process.execPath;
const results=[];
const check=(name,ok,detail='')=>results.push({name,ok,detail});
const textIdentity=value=>String(value??'').replace(/<[^>]+>/g,'').replaceAll('&nbsp;',' ').replaceAll('&quot;','"').replaceAll('&#39;',"'").replaceAll('&lt;','<').replaceAll('&gt;','>').replaceAll('&amp;','&').replace(/\s+/g,' ').trim();
const identityDelta=(expected,actual)=>{const duplicates=actual.filter((id,index)=>actual.indexOf(id)!==index),expectedSet=new Set(expected),actualSet=new Set(actual);return{missing:[...expectedSet].filter(id=>!actualSet.has(id)).sort(),unexpected:[...actualSet].filter(id=>!expectedSet.has(id)).sort(),duplicates:[...new Set(duplicates)].sort()};};
const deltaDetail=delta=>[delta.missing.length&&`missing: ${delta.missing.join(', ')}`,delta.unexpected.length&&`unexpected: ${delta.unexpected.join(', ')}`,delta.duplicates.length&&`duplicates: ${delta.duplicates.join(', ')}`].filter(Boolean).join('; ');
const publishedFieldText=(marker,boundaryTag)=>{const start=html.indexOf(marker);if(start<0)return'';const boundary=html.indexOf(`</${boundaryTag}>`,start),prefix='<p data-source-field="text">',open=html.indexOf(prefix,start),content=open+prefix.length,end=html.indexOf('</p>',content);return open>=0&&open<boundary&&end>=0&&end<boundary?textIdentity(html.slice(content,end)):'';};

const servitorId='unit-servitor-battleclade';
const canonicalServitors=factionRules.datasheets.find(unit=>unit.id===servitorId);
const rosterServitors=rosterCatalog.units.find(unit=>unit.id===servitorId);
const underseer=rosterServitors?.gameSelections.models.find(model=>model.title==='Servitor Underseer');
const servitorHtml=(()=>{const range=targetSandbox.window.WH_ARMY_BOOK_TARGETS.targets[servitorId];return range?targetSandbox.window.WH_ARMY_BOOK_TARGETS.html.slice(range.start,range.end):'';})();
check('Servitor Battleclade authoritative model scope stays canonical',
  source.meta.version==='1.2'&&source.meta.legalFrom==='2026-08-26'&&canonicalServitors.sourcePages.join(',')==='15,16'
  &&canonicalServitors.keywords.includes('TECH-PRIEST')===false
  &&canonicalServitors.composition.find(model=>model.name==='Servitor Underseer')?.intrinsicKeywords?.join(',')==='TECH-PRIEST'
  &&canonicalServitors.composition.filter(model=>model.name!=='Servitor Underseer').every(model=>model.intrinsicKeywords===undefined));
check('Servitor Battleclade roster metadata does not flatten TECH-PRIEST',
  rosterServitors.intrinsicKeywords.includes('TECH-PRIEST')===false
  &&underseer?.intrinsicKeywords?.join(',')==='TECH-PRIEST'
  &&rosterServitors.gameSelections.models.filter(model=>model!==underseer).every(model=>model.intrinsicKeywords===undefined));
check('Servitor Battleclade presentation scopes TECH-PRIEST to the Underseer',
  (servitorHtml.match(/data-model-keyword="TECH-PRIEST"/g)||[]).length===1
  &&servitorHtml.includes(`data-roster-model-id="${underseer?.id}"`)
  &&servitorHtml.includes('data-source-field="keywords.tech-priest"')===false);

check('BSData source hash ignores LF/CRLF differences',
  normalizedTextSha256('{\n  "revision": 1\n}\n')===normalizedTextSha256('{\r\n  "revision": 1\r\n}\r\n'));

const scripts=['scripts/data.js','scripts/faction-ui.js','scripts/roster-enhancements.js','scripts/roster-filter.js','scripts/app.js'];
for(const file of scripts){try{new vm.Script(read(file),{filename:file});check(`${file} syntax`,true);}catch(error){check(`${file} syntax`,false,error.message);}}
try{new vm.Script(sharedTargets,{filename:'../shared/navigation-targets.js'});check('shared navigation targets syntax',true);}catch(error){check('shared navigation targets syntax',false,error.message);}
try{new vm.Script(sharedDatasheetLayout,{filename:'../shared/datasheet-layout.js'});check('shared datasheet layout syntax',true);}catch(error){check('shared datasheet layout syntax',false,error.message);}
try{new vm.Script(sharedPopupContent,{filename:'../shared/popup-content.js'});check('shared popup content syntax',true);}catch(error){check('shared popup content syntax',false,error.message);}
try{new vm.Script(sharedGlossaryAutolink,{filename:'../shared/glossary-autolink.js'});check('shared glossary autolink syntax',true);}catch(error){check('shared glossary autolink syntax',false,error.message);}

const rosterLogicContext={window:{}};vm.runInNewContext(read('scripts/roster-enhancements.js'),rosterLogicContext);
const rosterLogic=rosterLogicContext.window.AMRosterEnhancements;
try{new vm.Script(mobileRedirectRuntime,{filename:'../shared/mobile-route-redirect.js'});check('legacy Mobile redirect syntax',true);}catch(error){check('legacy Mobile redirect syntax',false,error.message);}
const runMobileRedirect=(href,dataset={canonicalReader:'../reader.html',canonicalTarget:'unit-skitarii-rangers'})=>{
  const current=new URL(href),replacements=[];
  const context={URL,document:{documentElement:{dataset}},location:{href:current.href,search:current.search,hash:current.hash,replace:value=>replacements.push(value)}};
  vm.runInNewContext(mobileRedirectRuntime,context,{filename:'../shared/mobile-route-redirect.js'});
  return{replacements,destination:replacements[0]?new URL(replacements[0]):null};
};
try{
  const fallback=runMobileRedirect('https://example.test/books/adeptus-mechanicus/mobile/skitarii-rangers.html');
  const explicit=runMobileRedirect('https://example.test/books/adeptus-mechanicus/mobile/skitarii-rangers.html?roster=roster-1&instance=unit-2&view=mobile&mode=compact#skitarii-rangers-profile');
  check('legacy Mobile route resolves its canonical reader target',fallback.destination?.pathname==='/books/adeptus-mechanicus/reader.html'&&fallback.destination.hash==='#unit-skitarii-rangers');
  check('legacy Mobile route explicit hash overrides the route default',explicit.destination?.hash==='#skitarii-rangers-profile');
  check('legacy Mobile redirect preserves roster query',explicit.destination?.searchParams.get('roster')==='roster-1');
  check('legacy Mobile redirect preserves exact instance query',explicit.destination?.searchParams.get('instance')==='unit-2');
check('legacy Mobile redirect preserves responsive view query',explicit.destination?.searchParams.get('view')==='mobile');
  check('legacy Mobile redirect preserves unrelated query state',explicit.destination?.searchParams.get('mode')==='compact');
  check('legacy Mobile redirect performs one history-replacing navigation',explicit.replacements.length===1);
  check('legacy Mobile redirect fails closed without a canonical reader',runMobileRedirect('https://example.test/books/adeptus-mechanicus/mobile/skitarii-rangers.html',{}).replacements.length===0);
  check('legacy Mobile redirect stays inside the Mechanicus canonical book',explicit.destination?.pathname==='/books/adeptus-mechanicus/reader.html');
}catch(error){check('legacy Mobile redirect behavioral contract',false,error.message);}
check('responsive reader popup uses canonical Glossary V2 records and shared renderers',/glossary\/v2\/generated\/index\.en\.js\?v=/.test(html)&&/glossary\/v2\/runtime\/glossary-v2-runtime\.js\?v=/.test(html)&&appSource.includes('WHArmyBook.install')&&html.includes('../shared/army-book-app.js?v=')&&sharedArmyBookSource.includes('WH40K_GLOSSARY')&&canonicalPopupRuntime.includes('WHPopupContent'));
check('responsive reader owns one canonical popup layer',html.includes('id="popupLayer"')&&!html.includes('id="termPopupStack"')&&!mobileUnitPage.includes('id="termPopupStack"'));
check('legacy stubs preserve query and hash through the shared redirect',mobileRoutePages.every(page=>page.includes('mobile-route-redirect.js?v=2'))&&mobileRedirectRuntime.includes('destination.search=location.search')&&mobileRedirectRuntime.includes('destination.hash=location.hash||root.dataset.canonicalTarget'));
check('canonical reader serializes the complete Glossary chain',canonicalPopupRuntime.includes('snapshot()')&&canonicalPopupRuntime.includes('restore(')&&sharedArmyBookSource.includes('WHPageState?.installArmyBook')&&sharedArmyBookSource.includes('WHGlossaryReturn'));
check('responsive Stratagems use one canonical type classification before and after Compatible Rules load',appSource.includes('shared/stratagem-presentation.mjs')&&appSource.includes('presentation.decorate(document)')&&appSource.includes('decorateContent:presentation.decorate')&&sharedStratagemPresentationSource.includes('Battle Tactic|Strategic Ploy|Wargear|Epic Deed|Core')&&sharedStratagemPresentationSource.includes('unknown'));
check('Stratagem primary colors use canonical type selectors rather than turn classes',deathGuardRead('styles/content.css').includes('.stratagem[data-stratagem-type="battle-tactic"]')&&deathGuardRead('styles/content.css').includes('.stratagem[data-stratagem-type="strategic-ploy"]')&&deathGuardRead('styles/content.css').includes('.stratagem[data-stratagem-type="wargear"]')&&deathGuardRead('styles/content.css').includes('.stratagem[data-stratagem-type="epic-deed"]')&&deathGuardRead('styles/content.css').includes('.stratagem[data-stratagem-type="core"]')&&!deathGuardRead('styles/content.css').includes('.stratagem.turn-yours{--strat-color'));
check('Popup actions use equal responsive grid cells and telephone single-column controls',canonicalPopupCss.includes('.popup-actions { display: grid; grid-template-columns: repeat(2,minmax(0,1fr));')&&canonicalPopupCss.includes('@media (max-width: 600px)')&&canonicalPopupCss.includes('.popup-actions { grid-template-columns: 1fr; }'));
check('responsive popup bounds long content inside the canonical layer',/\.term-popup\s*\{[^}]*max-height:\s*min\([^}]*overflow-y:\s*auto/.test(canonicalPopupCss)&&html.includes('id="popupLayer"'));
check('canonical popup ordinary actions do not use Browser History',!canonicalPopupRuntime.includes('pushState')&&!canonicalPopupRuntime.includes('history.back'));
const detachmentSlug=value=>String(value||'').toLowerCase().replace(/[’']/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const detachmentInventory=allDetachments.map(item=>detachmentSlug(item.title));
const knownDetachment=allDetachments[0].title,knownDetachmentId=detachmentSlug(knownDetachment);
check('one known roster Detachment resolves',rosterLogic.resolveDetachment([knownDetachment],detachmentInventory)===knownDetachmentId);
check('zero roster Detachments fail closed',rosterLogic.resolveDetachment([],detachmentInventory)==='');
check('unknown roster Detachment fails closed',rosterLogic.resolveDetachment(['Unknown Forge'],detachmentInventory)==='');
check('two different roster Detachments fail closed',rosterLogic.resolveDetachment([allDetachments[0].title,allDetachments[1].title],detachmentInventory)==='');
check('duplicate normalized Detachment remains unambiguous',rosterLogic.resolveDetachment([knownDetachment,knownDetachment.toUpperCase()],detachmentInventory)===knownDetachmentId);
const rosterUnits=[{id:'roster-unit-1',name:'Skitarii Rangers',points:85},{id:'roster-unit-2',name:'Skitarii Rangers',points:85}];
const rosterFixture={enhancements:[{name:'Exact Owner Enhancement',ownerStatus:'resolved',ownerUnitId:'roster-unit-1'}]};
const firstOwnership=rosterLogic.resolveOwnership(rosterFixture,[rosterUnits[0]]),secondOwnership=rosterLogic.resolveOwnership(rosterFixture,[rosterUnits[1]]),aggregatedOwnership=rosterLogic.resolveOwnership(rosterFixture,rosterUnits);
check('single datasheet instance receives only its exact Enhancement',firstOwnership.cardEnhancements.length===1&&firstOwnership.cardEnhancements[0].ownerUnitId==='roster-unit-1');
check('second datasheet instance does not inherit Enhancement',secondOwnership.cardEnhancements.length===0);
check('aggregated card applies no owner-specific Enhancement effect',aggregatedOwnership.cardEnhancements.length===0);
check('Roster instances preserve exact assignment and points',aggregatedOwnership.instances[0].label==='Skitarii Rangers #1'&&aggregatedOwnership.instances[0].points===85&&aggregatedOwnership.instances[0].enhancements.length===1&&aggregatedOwnership.instances[1].label==='Skitarii Rangers #2'&&aggregatedOwnership.instances[1].enhancements.length===0);
const compatibleFixture=[{ruleId:'core',kind:'stratagem',scope:'core',state:'match'},{ruleId:'faction',kind:'stratagem',detachmentId:knownDetachmentId,state:'conditional'},{ruleId:'owned',kind:'enhancement',state:'match'},{ruleId:'other-owner',kind:'enhancement',state:'match'}];
const rosterRules=rosterLogic.filterCompatibleRules(compatibleFixture,true,new Set(['owned']));
check('aggregated Related Rules hide owner Enhancements',rosterLogic.filterCompatibleRules(compatibleFixture,true,new Set()).every(rule=>rule.kind!=='enhancement'));
check('roster Related Rules preserve Core, faction and conditional Stratagems',rosterRules.some(rule=>rule.ruleId==='core')&&rosterRules.some(rule=>rule.ruleId==='faction'&&rule.state==='conditional'));
check('no-roster All Detachments leaves all compatible rows available',rosterLogic.filterCompatibleRules(compatibleFixture,false,new Set()).length===compatibleFixture.length);
const canonicalFactionSource=rosterFilterSource.match(/const adeptusMechanicusFaction=(value=>\{[\s\S]*?\});/)?.[1]||'(()=>false)';
const canonicalFactionContext={};vm.runInNewContext(`result=${canonicalFactionSource}`,canonicalFactionContext);
const canonicalFaction=canonicalFactionContext.result;
const responsiveParsed={faction:'Adeptus Mechanicus',detachments:[{label:knownDetachment}],units:[{id:'responsive-unit-1',name:'Skitarii Rangers',points:85},{id:'responsive-unit-2',name:'Skitarii Rangers',points:85}],enhancements:[{name:'Exact Owner Enhancement',ownerStatus:'resolved',ownerUnitId:'responsive-unit-1'}]};
const responsiveOwnership=rosterLogic.resolveOwnership(responsiveParsed,responsiveParsed.units);
const rosterP1SharedContextSource=fs.readFileSync(path.resolve(root,'..','shared','roster-context.js'),'utf8'),rosterP1CatalogSource=read('scripts/roster-data.js'),rosterP1ThinProvider=rosterFilterSource.includes('WHArmyRosterContext.install({')&&(rosterFilterSource.match(/WHArmyRosterContext\.install\(/g)||[]).length===1&&!rosterFilterSource.includes('querySelectorAll')&&!rosterFilterSource.includes('DocumentFragment')&&!rosterFilterSource.includes('resolvedDetachmentIds')&&!rosterFilterSource.includes('group.units.push')&&!rosterFilterSource.includes('location.replace')&&!rosterFilterSource.includes('history.replaceState')&&!rosterFilterSource.includes('./mobile/')&&!rosterFilterSource.includes('AMPhoneRoster');
const projectionScope={URLSearchParams,CustomEvent:class{},dispatchEvent(){}};vm.runInNewContext(rosterP1SharedContextSource,projectionScope);
const servitorProjection=projectionScope.WHArmyRosterContext.project({catalog:rosterCatalog,roster:{faction:'Adeptus Mechanicus',units:[{id:'servitor-physical',name:'Servitor Battleclade',points:65,models:[{quantity:1,name:'Servitor Underseer',loadouts:[]},{quantity:2,name:'Gun Servitor',loadouts:[]},{quantity:6,name:'Combat Servitor',loadouts:[]}]}],detachments:[],enhancements:[],warnings:[]},record:{id:'servitor-scope-fixture'}}).game.units[0];
check('personal Servitor Battleclade projection keeps scoped keyword out of unit identity',
  servitorProjection.rosterState.keywordProfile.intrinsic.includes('TECH-PRIEST')===false
  &&servitorProjection.effective.keywords.includes('TECH-PRIEST')===false);
const canonicalNavTargets=[...html.matchAll(/data-nav-target="([^"]+)"/g)].map(match=>match[1]);
check('responsive reader accepts plain and Imperium faction identities',rosterP1ThinProvider&&/"factionKeyword"\s*:\s*"Adeptus Mechanicus"/i.test(rosterP1CatalogSource)&&rosterP1SharedContextSource.includes('factionKeyword'));
check('responsive reader rejects wrong faction parents',['Chaos - Adeptus Mechanicus','Xenos - Adeptus Mechanicus','Chaos \u2013 Adeptus Mechanicus','Xenos \u2014 Adeptus Mechanicus','Adeptus Mechanic',''].every(value=>!canonicalFaction(value)));
check('responsive reader resolves one known Detachment',rosterLogic.resolveDetachment([knownDetachment],detachmentInventory)===knownDetachmentId);
check('responsive reader zero Detachment fails closed',rosterLogic.resolveDetachment([],detachmentInventory)==='');
check('responsive reader unknown Detachment fails closed',rosterLogic.resolveDetachment(['Unknown Forge'],detachmentInventory)==='');
check('canonical roster path retains every resolved Detachment',rosterP1ThinProvider&&rosterP1SharedContextSource.includes('detachmentIds')&&!rosterFilterSource.includes('resolvedDetachmentIds'));
check('responsive reader duplicate normalized Detachment remains valid',rosterLogic.resolveDetachment([knownDetachment,knownDetachment.toUpperCase()],detachmentInventory)===knownDetachmentId);
check('canonical navigation contains every Detachment target',allDetachments.every(item=>canonicalNavTargets.includes(`detachment-${detachmentSlug(item.title)}`)));
check('canonical navigation uses one tree for every responsive viewport',html.includes('id="tocTree"')&&(html.match(/id="tocTree"/g)||[]).length===1&&!mobileUnitPage.includes('id="tocTree"'));
check('canonical roster grouping keeps duplicate datasheet instances in one state group',responsiveOwnership.instances.length===2&&responsiveOwnership.instances[0].enhancements.length===1&&responsiveOwnership.instances[1].enhancements.length===0&&!rosterFilterSource.includes('group.units.push(unit)'));
check('canonical navigation keeps source categories and non-empty groups',rules.datasheets.every(unit=>canonicalNavTargets.includes(unit.id))&&['datasheets-battleline','datasheets-vehicle'].every(id=>canonicalNavTargets.includes(id)));
check('canonical reader unmatched roster units fail closed',rosterP1ThinProvider&&rosterP1SharedContextSource.includes('incompatible')&&rosterP1SharedContextSource.includes('roster-guides/index.html')&&!rosterFilterSource.includes('location.replace'));
check('responsive duplicate instances retain exact owners without card-level Enhancement',responsiveOwnership.instances.length===2&&responsiveOwnership.instances[0].enhancements.length===1&&responsiveOwnership.instances[1].enhancements.length===0&&responsiveOwnership.cardEnhancements.length===0);
const responsiveRoute=runMobileRedirect('https://example.test/books/adeptus-mechanicus/mobile/skitarii-rangers.html?roster=roster-1&instance=responsive-unit-2#unit-skitarii-rangers').destination;
check('legacy route keeps one roster ID and canonical hash',responsiveRoute.searchParams.getAll('roster').length===1&&responsiveRoute.hash==='#unit-skitarii-rangers');
check('legacy route preserves exact instance into the responsive reader',responsiveRoute.searchParams.get('instance')==='responsive-unit-2'&&responsiveRoute.pathname.endsWith('/books/adeptus-mechanicus/reader.html'));
check('responsive no-roster navigation remains complete',allDetachments.every(item=>canonicalNavTargets.includes(`detachment-${detachmentSlug(item.title)}`))&&rules.datasheets.every(unit=>canonicalNavTargets.includes(unit.id)));

const markup=html.replace(/<script[\s\S]*?<\/script>/gi,'');
const ids=[...markup.matchAll(/\sid="([^"]+)"/g)].map(x=>x[1]);
const idSet=new Set(ids);
const navTargets=[...markup.matchAll(/data-nav-target="([^"]+)"/g)].map(x=>x[1]);
const trackTargets=[...markup.matchAll(/data-track="([^"]+)"/g)].map(x=>x[1]);
const journeyTargets=[...markup.matchAll(/data-journey-target="([^"]+)"/g)].map(x=>x[1]);
const localTargets=[...markup.matchAll(/class="local-tab" data-journey-target="([^"]+)"/g)].map(x=>x[1]);
const depths=[...markup.matchAll(/data-nav-depth="(\d+)"/g)].map(x=>Number(x[1]));
const topLevelTargets=[...markup.matchAll(/<li data-nav-id="[^"]+" data-nav-depth="1">[\s\S]*?<button class="toc-label" data-nav-target="([^"]+)"/g)].map(x=>x[1]);
const required=['appHeader','navMenu','navCollapse','backButton','tocScrim','tocPanel','tocTree','main','popupLayer'];

check('source snapshot has all 27 pages',source.meta.pageCount===27&&Object.keys(source.pages).length===27);
check('source hash is locked',source.meta.sha256==='76819664005154632450E45677D609AA3934DEE965317F74DFEDC26EFC3467AB'&&source.meta.sha256===rules.source.sha256);
check('Faction Pack v1.2 metadata is current',rules.source.version==='1.2'&&rules.source.pages===27&&rules.source.legalFrom==='2026-08-26'&&rules.source.file==='sources/adeptus-mechanicus-faction-pack-v1.2.pdf');
check('canonical content has five detachments',rules.detachments.length===5);
check('army has ten total detachments',allDetachments.length===10);
check('official MFM has DP and disposition for every detachment',Object.keys(officialMfm.detachments||{}).length===10&&allDetachments.every(detachment=>{
  const record=officialMfm.detachments[detachment.title];
  return Number.isInteger(record?.dp)&&record.dp>0&&Boolean(record.disposition);
}));
check('five Codex detachments are restored',codex.detachments.length===5);
const parityContracts=codexParity.detachments.map(parity=>{const owner=codex.detachments.find(item=>item.title===parity.title);return{id:owner?.id,title:parity.title,rule:{id:owner?.rule?.id,title:parity.rule.title,text:parity.rule.text},enhancements:parity.enhancements.map(item=>{const owned=owner?.enhancements.find(candidate=>candidate.title===item.title);return{id:owned?.id,title:item.title,text:item.text};})};});
const canonicalParityContracts=canonicalModel.codex.detachments.map(detachment=>({id:detachment.id,title:detachment.title,rule:{id:detachment.rule.id,title:detachment.rule.title,text:detachment.rule.text},enhancements:detachment.enhancements.map(item=>({id:item.id,title:item.title,text:item.text}))}));
const parityDetachmentDelta=identityDelta(codex.detachments.map(item=>item.title),codexParity.detachments.map(item=>item.title)),parityIdentityIssues=[],parityTextBindings=[];
for(const parity of codexParity.detachments){const owner=codex.detachments.find(item=>item.title===parity.title);if(!owner)continue;if(parity.rule?.title!==owner.rule?.title)parityIdentityIssues.push(`${owner.id}: rule title`);const enhancementDelta=identityDelta(owner.enhancements.map(item=>item.title),(parity.enhancements||[]).map(item=>item.title));if(enhancementDelta.missing.length||enhancementDelta.unexpected.length||enhancementDelta.duplicates.length)parityIdentityIssues.push(`${owner.id}: ${deltaDetail(enhancementDelta)}`);parityTextBindings.push({id:owner.rule.id,source:parity.rule?.text,published:publishedFieldText(`<section class="detachment-part" id="${owner.rule.id}"`,'section')});for(const sourceEnhancement of parity.enhancements||[]){const canonicalEnhancement=owner.enhancements.find(item=>item.title===sourceEnhancement.title);if(canonicalEnhancement)parityTextBindings.push({id:canonicalEnhancement.id,source:sourceEnhancement.text,published:publishedFieldText(`data-rule-id="${canonicalEnhancement.id}"`,'article')});}}
const parityTextMismatches=parityTextBindings.filter(item=>!textIdentity(item.source)||textIdentity(item.source)!==item.published).map(item=>item.id);
check('Codex parity layer maps every source-bound rule and Enhancement to its canonical identity',codexParity.schema===1&&codexParity.source.url===codex.source.referenceUrl&&/^\d{4}-\d{2}-\d{2}$/.test(codexParity.source.checkedAt||'')&&new Set(canonicalParityContracts.map(item=>item.id)).size===canonicalParityContracts.length&&canonicalParityContracts.every(detachment=>new Set(detachment.enhancements.map(item=>item.id)).size===detachment.enhancements.length)&&JSON.stringify(canonicalParityContracts)===JSON.stringify(parityContracts)&&!parityDetachmentDelta.missing.length&&!parityDetachmentDelta.unexpected.length&&!parityDetachmentDelta.duplicates.length&&!parityIdentityIssues.length&&!parityTextMismatches.length,[deltaDetail(parityDetachmentDelta),...parityIdentityIssues,parityTextMismatches.length&&`text mismatch: ${parityTextMismatches.join(', ')}`].filter(Boolean).join('; '));
check('every Codex detachment has four enhancements and six stratagems',codex.detachments.every(x=>x.enhancements.length===4&&x.stratagems.length===6));
check('detachment card counts are complete',JSON.stringify(rules.detachments.map(x=>[x.enhancements.length,x.stratagems.length]))===JSON.stringify([[2,3],[2,3],[2,3],[4,6],[4,6]]));
check('codex layer has 34 current 11e datasheets',rules.datasheets.length===34&&rules.datasheets.length===codexDatasheets.audit.datasheets);
check('Legends datasheets are absent from the published book',rules.datasheets.every(x=>x.status!=='Warhammer Legends'));
check('obsolete 10e Servitors datasheet is absent',!rules.datasheets.some(unit=>unit.title==='Servitors'));
const attachmentTargets={
  'Skitarii Marshal':['Hastarii Exterminators','Hastarii Fusiliers','Skitarii Rangers','Skitarii Vanguard'],
  'Technoarcheologist':['Corpuscarii Electro-Priests','Fulgurite Electro-Priests','Hastarii Exterminators','Hastarii Fusiliers','Kataphron Breachers','Kataphron Destroyers','Servitor Battleclade','Skitarii Rangers','Skitarii Vanguard'],
  'Tech-Priest Dominus':['Corpuscarii Electro-Priests','Fulgurite Electro-Priests','Hastarii Exterminators','Hastarii Fusiliers','Kataphron Breachers','Kataphron Destroyers','Servitor Battleclade','Skitarii Rangers','Skitarii Vanguard'],
  'Tech-Priest Manipulus':['Corpuscarii Electro-Priests','Fulgurite Electro-Priests','Hastarii Exterminators','Hastarii Fusiliers','Kataphron Breachers','Kataphron Destroyers','Servitor Battleclade','Skitarii Rangers','Skitarii Vanguard'],
  'Tech-Priest Enginseer':['Corpuscarii Electro-Priests','Fulgurite Electro-Priests','Kataphron Breachers','Kataphron Destroyers','Skitarii Rangers','Skitarii Vanguard']
};
for(const [title,expected] of Object.entries(attachmentTargets)){
  const unit=codexDatasheets.datasheets.find(unit=>unit.title===title);
  const relation=unit?.abilities.find(ability=>/^(?:Leader|Support)$/.test(ability.title));
  const actual=(relation?.text.match(/^■ (.+)$/gm)||[]).map(line=>line.slice(2));
  check(`${title} has the current official attachment targets`,JSON.stringify(actual)===JSON.stringify(expected),actual.join(', '));
}
const canonicalStatFields=['Ld','M','OC','Sv','T','W'];
const canonicalStats=stats=>Object.fromEntries(Object.entries(stats||{}).map(([key,value])=>[key==='SV'?'Sv':key==='LD'?'Ld':key,value]));
check('every datasheet has the exact canonical stat schema, weapons, abilities and provenance',rules.datasheets.every(unit=>{
  const stats=canonicalStats(unit.stats),fields=Object.keys(stats).sort();
  return Object.keys(unit.stats||{}).length===canonicalStatFields.length&&JSON.stringify(fields)===JSON.stringify(canonicalStatFields)&&canonicalStatFields.every(field=>String(stats[field]??'').trim())&&unit.weapons.length&&unit.abilities.length&&(unit.sourcePages?.length||unit.source?.url);
}));
check('official multi-profile datasheet is preserved',factionRules.datasheets.find(unit=>unit.title==='Servitor Battleclade')?.profiles?.length===2);
check('official Legends and Faction Pack clarifications are complete',[
  'for a final result of 2+',
  "Starting Strength is increased accordingly",
  'neither it nor any units embarked within it count towards limits',
  'Enhanced data-tether',
  'Designer’s Note: This means that if the targeted unit already has the HALO OVERRIDE keyword',
  'it can be affected by multiple Override abilities at the same time',
  'does not have the HALO OVERRIDE keyword'
].every(text=>JSON.stringify(factionRules).includes(text)));
check('placeholder compositions are gone',codexDatasheets.datasheets.every(unit=>!/^See the model selections/i.test(unit.composition||'')));
const ranger=codexDatasheets.datasheets.find(unit=>unit.title==='Skitarii Rangers');
check('unit composition preserves complete model groups',ranger?.composition==='9 Skitarii Rangers. 1 Skitarii Ranger Alpha.');
check('optional wargear abilities stay out of unit abilities',
  ['Enhanced data-tether','Omnispex'].every(title=>ranger?.wargearAbilities?.some(item=>item.title===title))
  &&['Enhanced data-tether','Omnispex'].every(title=>!ranger?.abilities?.some(item=>item.title===title)));
const skatros=codexDatasheets.datasheets.find(unit=>unit.title==='Sydonian Skatros');
check('Sydonian Skatros keeps Achillan Eye as a permanent datasheet ability',skatros?.abilities.some(ability=>ability.title==='Achillan Eye')&&!skatros?.wargearAbilities?.some(ability=>ability.title==='Achillan Eye'));
check('Codex selection tree produces wargear contracts',codexDatasheets.datasheets.filter(unit=>unit.wargear?.length).length===32&&ranger.wargear.some(text=>text.includes('up to 1 Skitarii Ranger w/ transuranic arquebus'))&&codexDatasheets.datasheets.find(unit=>unit.title==='Kastelan Robots')?.wargear.some(text=>text.includes('Twin Kastelan fist')));
const thulia=factionRules.datasheets.find(unit=>unit.title==='Thulia Ghuld');
const onager=codexDatasheets.datasheets.find(unit=>unit.title==='Onager Dunecrawler');
check('July v1.1 Thulia replacement is exact',thulia?.keywords.includes('MOBILE')&&!thulia?.abilities.some(item=>item.title==='Cybernetic Augmentation'));
check('July v1.1 Onager dissipated profile is S9',onager?.weapons.find(item=>/eradication beamer - dissipated/i.test(item.name))?.s==='9');
check('July v1.1 Hunter rule has no obsolete cover clause',codex.detachments.find(item=>item.title==='Skitarii Hunter Cohort')?.rule.text==='Friendly SKITARII INFANTRY, SKITARII MOUNTED and IRONSTRIDER BALLISTARII units have Stealth.');
check('Hunter Cohort conditional Stealth stays on its Detachment rule instead of permanent datasheet abilities',['Skitarii Rangers','Skitarii Vanguard','Skitarii Marshal','Serberys Raiders','Serberys Sulphurhounds','Ironstrider Ballistarii'].every(title=>!codexDatasheets.datasheets.find(unit=>unit.title===title)?.abilities.some(ability=>ability.title==='Stealth')));
check('July v1.1 FAQ explains the final BS2 result',factionRules.updates.find(item=>item.id==='faction-faq')?.summary.includes('for a final result of 2+'));
check('Legends page ranges follow the 27-page pack',JSON.stringify(factionRules.datasheets.filter(unit=>unit.status==='Warhammer Legends').map(unit=>unit.sourcePages))===JSON.stringify([[20,21],[22,23],[24,25],[26,27]]));
check('known catalogue text corruption is removed',!JSON.stringify(codexDatasheets).match(/havealready|Conflagaration|Pteraxii Sterylizors[\s\S]{0,1200}Pteraxii Skystalker Alpha/));
check('detachment-only categories never become permanent datasheet keywords',codexDatasheets.datasheets.every(unit=>!unit.keywords.includes('Recon Augury')));
check('current FRAME keywords are present',['Skorpius Disintegrator','Skorpius Dunerider'].every(title=>rules.datasheets.find(unit=>unit.title===title)?.keywords.some(keyword=>keyword.toUpperCase()==='FRAME')));
check('conditional shared weapon modifiers are resolved for their bearer',codexDatasheets.datasheets.find(unit=>unit.title==='Skitarii Marshal')?.weapons.find(weapon=>weapon.name==='Mechanicus pistol')?.skill==='3+'&&codexDatasheets.datasheets.find(unit=>unit.title==='Skitarii Rangers')?.weapons.find(weapon=>weapon.name==='Mechanicus pistol')?.skill==='4+');
check('all published source pages are represented in the UI',Array.from({length:19},(_,i)=>i+1).every(page=>html.includes(`#page=${page}`)||html.includes(`Page ${page}`)));
check('required interaction IDs are present',required.every(id=>idSet.has(id)),required.filter(id=>!idSet.has(id)).join(', '));
check('HTML IDs are unique',ids.length===idSet.size,`${ids.length}/${idSet.size}`);
check('all navigation targets exist',navTargets.every(id=>idSet.has(id)),navTargets.filter(id=>!idSet.has(id)).join(', '));
check('all navigation targets are tracked',navTargets.every(id=>trackTargets.includes(id)),navTargets.filter(id=>!trackTargets.includes(id)).join(', '));
check('navigation depth stays at three',Math.max(...depths)===3);
check('top-level navigation matches the DG contract',JSON.stringify(topLevelTargets)===JSON.stringify(['start','core-rules','detachments','datasheets','updates']),topLevelTargets.join(', '));
check('datasheets use source categories then unit hierarchy',['datasheets-epic-heroes','datasheets-characters','datasheets-battleline','datasheets-dedicated-transports','datasheets-infantry','datasheets-mounted','datasheets-vehicle'].every(id=>navTargets.includes(id))&&!navTargets.includes('datasheets-other')&&rules.datasheets.every(unit=>markup.includes(`data-nav-id="${unit.id}" data-nav-depth="3"`)));
check('detachment navigation uses singular Enhancement label',(markup.match(/data-nav-depth="3"[^>]*>[\s\S]*?data-nav-target="[^"]+-enhancements">Enhancement<\/button>/g)||[]).length===allDetachments.length);
check('all Journey targets resolve',journeyTargets.every(id=>idSet.has(id)));
check('local datasheet tabs are not global navigation',localTargets.length>=rules.datasheets.length*4&&localTargets.every(id=>!navTargets.includes(id)));
check('all ten detachments render all tracked parts',(markup.match(/class="detachment-part"/g)||[]).length===30);
check('all 34 unit cards render',(markup.match(/class="unit-card surface/g)||[]).length===rules.datasheets.length);
check('datasheets use typed DG sections',
  markup.includes('id="skitarii-rangers-wargear-abilities"')
  &&markup.includes('id="tech-priest-dominus-leader"')
  &&markup.includes('id="onager-dunecrawler-damaged"'));
check('conditional wargear is labelled honestly',markup.includes('These abilities apply only while the corresponding wargear is equipped.'));
check('Legends category and cards are absent from the published book',!topLevelTargets.includes('legends')&&!navTargets.includes('datasheets-warhammer-legends')&&legendsCount(markup)===0);
check('favorite Doctrina console is preserved',markup.includes('class="doctrina-console surface"')&&markup.includes('data-protocol="protector"')&&markup.includes('data-protocol="conqueror"'));
check('desktop Doctrina selector remains interactive',markup.includes('class="protocol-switch"')&&markup.includes('data-protocol="protector"')&&markup.includes('data-protocol="conqueror"'));
check('responsive Doctrina exposes both canonical branches through one selector',html.includes('id="protector-imperative"')&&html.includes('id="conqueror-imperative"')&&read('scripts/faction-ui.js').includes("button.setAttribute('aria-pressed',String(active))")&&read('scripts/faction-ui.js').includes('panel.hidden=id!==protocol'));
check('responsive Doctrina keeps one canonical selector', (html.match(/class="protocol-switch"/g)||[]).length===1&&html.includes('data-protocol="protector"')&&html.includes('data-protocol="conqueror"'));
check('responsive Doctrina keeps tracked glossary destinations',html.includes('id="protector-imperative" data-track="protector-imperative"')&&html.includes('id="conqueror-imperative" data-track="conqueror-imperative"')&&html.includes('data-term="doctrina-imperatives"'));
check('canonical navigation has stable roster target metadata',(html.match(/data-nav-id="detachment-/g)||[]).length===10&&(html.match(/data-nav-id="unit-/g)||[]).length===34&&(html.match(/data-nav-id="datasheets-[^"]+" data-nav-depth="2"/g)||[]).length===7);
check('responsive no-roster keeps Start',html.includes('data-nav-target="start"'));
check('responsive no-roster keeps Army Rules',html.includes('data-nav-target="core-rules"'));
check('responsive no-roster keeps Updates',html.includes('data-nav-target="updates"'));
check('responsive no-roster keeps Mega Glossary',html.includes('Mega Glossary'));
check('responsive no-roster keeps Roster Guides',html.includes('data-roster-guides'));
check('responsive reader owns one in-place view switch',((html.match(/data-view-switch/g)||[]).length===1)&&!appSource.includes("new URL('./mobile/"));
check('responsive no-roster keeps All Detachments',appSource.includes("storageKey:'adeptus-mechanicus-detachment-filter'")&&sharedRelatedRulesSource.includes("'All detachments'"));
check('local official transcripts are embedded',(markup.match(/class="source-transcript"/g)||[]).length===rules.updates.length+rules.detachments.length+factionRules.datasheets.filter(unit=>unit.status!=='Warhammer Legends').length+2);
check('Codex transcription status is explicit',markup.includes('Codex transcription layer')&&markup.includes('34 indexed datasheets'));
check('official MFM verification is visible',markup.includes('Munitorum Field Manual v1.5')&&/Dated repository capture verified \d{4}-\d{2}-\d{2}; all 34 current Enhancement costs and all non-Legends unit point rows match the official live source\./.test(markup)&&markup.includes('>Open official MFM</a>'));
check('generated reader identifies the current 27-page Faction Pack',markup.includes('Faction Pack v1.2')&&markup.includes('27 pages')&&!markup.includes('Faction Pack v1.0'));
check('generated hero contains no technical placeholders',!read('tools/build-full-content.mjs').includes('Technical placeholder')&&!html.includes('Technical placeholder')&&markup.includes('11th Edition Army Book')&&markup.includes('Adeptus Mechanicus emblem'));
check('Stratagem restrictions render as a separate field',markup.includes('<b>Restrictions</b>')&&markup.includes('Programmed Withdrawal'));
check('datasheet wargear text uses the unit name, not extractor UI labels',!markup.includes('Wargear is equipped with:')&&!markup.includes('Wargear can be equipped with:'));
check('all carried-forward Codex datasheets have exact wargear and composition snapshots',codexWargear.units.length===30&&codexWargear.units.every(unit=>unit.title&&Array.isArray(unit.wargear)&&unit.composition));
const rangerWargear=codexWargear.units.find(unit=>unit.title==='Skitarii Rangers')?.wargear||[];
check('conditional Skitarii wargear limits remain visible',rangerWargear.includes('* That model’s galvanic rifle cannot be replaced.')&&rangerWargear.some(row=>row.startsWith('1 Skitarii Ranger equipped with a galvanic rifle'))&&markup.includes('That model’s')&&markup.includes('cannot be replaced.'));
check('removed army points section stays removed',!markup.includes('My Army · 995')&&!markup.includes('army-roster-995'));
check('no replacement characters in generated/runtime files',!['index.html','reader.html',...scripts,'styles/mechanicus.css'].map(read).join('').includes('\uFFFD'));
check('known BSData spelling errors stay normalised',!html.includes(' mdel ')&&!glossaryRegistryText.includes(' mdel '));
const dataSpikeUnit=codexDatasheets.datasheets.find(unit=>unit.id==='unit-tech-priest-dominus'),dataSpikeAbility=dataSpikeUnit?.abilities.find(ability=>ability.title==='Data-spike'),dataSpikeTerm=glossaryRegistry.terms?.['adeptus-mechanicus-datasheet-data-spike'];
check('Mechanicus glossary Data-spike definition preserves its canonical source identity and text',dataSpikeTerm?.id==='adeptus-mechanicus-datasheet-data-spike'&&dataSpikeTerm?.title?.en===dataSpikeAbility?.title&&dataSpikeTerm?.scope==='adeptus-mechanicus'&&dataSpikeTerm?.canonicalSource?.documentId==='adeptus-mechanicus'&&dataSpikeTerm?.canonicalSource?.locator===dataSpikeUnit?.id&&JSON.stringify(dataSpikeTerm?.sourceRefs)===JSON.stringify(['adeptus-mechanicus'])&&codexDatasheets.source?.sha256===normalizedTextSha256(read('sources/bsdata-adeptus-mechanicus-11e.json'))&&codexDatasheets.source?.url===dataSpikeUnit?.source?.url&&textIdentity(dataSpikeTerm?.definition?.en)===textIdentity(dataSpikeAbility?.text));
check('no inline script or style',!/<style|<script(?![^>]*src=)/i.test(html));
check('all stylesheet and script assets resolve',[...markup.matchAll(/(?:href|src)="([^"?#]+)"/g)].map(x=>x[1]).filter(file=>!file.endsWith('.pdf')&&!/^(?:https?:|data:)/.test(file)).every(file=>fs.existsSync(path.resolve(root,file))));

const unitImageManifest=json('presentation/unit-images.json');
const unitImageEntries=Object.entries(unitImageManifest.units||{});
const unitImageIds=unitImageEntries.map(([id])=>id);
const responsiveUnitArt=(html.match(/<figure class="unit-art-background" aria-hidden="true"/g)||[]).length;
check('unit images remain explicitly opt-in',unitImageEntries.length===34&&unitImageEntries.every(([id,item])=>idSet.has(id)&&item.presentation.mode==='background')&&(html.match(/<figure class="unit-art-background"/g)||[]).length===34);
check('unit image provenance is official and complete',unitImageEntries.every(([,item])=>item.unitName&&(/^https:\/\/(?:www\.warhammer\.com|www\.warhammer-community\.com)\//.test(item.source.productUrl)||item.source.productUrl==='User-provided official GW product image')&&(/^https:\/\/(?:www\.warhammer\.com|assets\.warhammer-community\.com)\//.test(item.source.imageUrl)||item.source.imageUrl.startsWith('attachment:'))&&item.source.originalFilename&&fs.existsSync(path.join(root,'sources/unit-images',item.source.originalFilename))));
check('unit art remains decorative and layout-stable in the responsive reader',responsiveUnitArt===34&&(html.match(/<img src="\.\/assets\/unit-images\/[^"]+"[^>]+alt=""/g)||[]).length===34&&html.includes('--unit-art-background-phone-scale:'));
check('processed unit art is cached while official originals stay out of the app shell',unitImageEntries.every(([,item])=>fs.existsSync(path.join(root,item.asset))&&fs.existsSync(path.join(root,item.original))&&serviceWorker.includes(`./books/adeptus-mechanicus/${item.asset}`)&&!serviceWorker.includes(`./books/adeptus-mechanicus/${item.original}`)));
const unitImageBuild=spawnSync('C:\\Users\\denis\\.cache\\codex-runtimes\\codex-primary-runtime\\dependencies\\python\\python.exe',[path.join(root,'tools','build-unit-images.py'),'--check'],{encoding:'utf8'});
check('transparent unit image derivatives are current',unitImageBuild.status===0,(unitImageBuild.stderr||unitImageBuild.stdout).trim());

const context={window:{},Object};vm.runInNewContext(read('scripts/data.js'),context);
const terms=context.window.DG_TERMS||{};
const expectedTermRecords=canonicalModel.rules.glossary,expectedTermIds=expectedTermRecords.map(term=>term.id),serializedTermIds=[...read('scripts/data.js').matchAll(/^  "([^"]+)": \{$/gm)].map(match=>match[1]),termIdentityDiff=identityDelta(expectedTermIds,serializedTermIds),expectedTermGroups=new Map();
for(const term of expectedTermRecords){if(!expectedTermGroups.has(term.group))expectedTermGroups.set(term.group,[]);expectedTermGroups.get(term.group).push(term.id);}
const missingTermsByGroup=[...expectedTermGroups].map(([group,ids])=>[group,ids.filter(id=>termIdentityDiff.missing.includes(id))]).filter(([,ids])=>ids.length).map(([group,ids])=>`${group}: ${ids.join(', ')}`);
check('term registry exactly publishes every source-owned semantic category',expectedTermIds.length===new Set(expectedTermIds).size&&serializedTermIds.length===Object.keys(terms).length&&!termIdentityDiff.missing.length&&!termIdentityDiff.unexpected.length&&!termIdentityDiff.duplicates.length,[...missingTermsByGroup,termIdentityDiff.unexpected.length&&`unexpected: ${termIdentityDiff.unexpected.join(', ')}`,termIdentityDiff.duplicates.length&&`duplicates: ${termIdentityDiff.duplicates.join(', ')}`].filter(Boolean).join('; '));
check('term rule and unit destinations resolve',Object.values(terms).every(term=>(!term.rule||idSet.has(term.rule))&&(!term.units||term.units.every(id=>idSet.has(id)))));
const abilityCards=(markup.match(/<article class="ability"[^>]*>/g)||[]).length;
const interactiveAbilityCards=(markup.match(/<article class="ability"[^>]*><h5[^>]*><button class="term-button" data-term="[^"]+"/g)||[]).length;
const compactAbilityButtons=(markup.match(/<button class="term-button" data-term="[^"]+" data-source-field="abilities\./g)||[]).length;
const interactiveWeaponNames=(markup.match(/class="weapon-button" data-term=/g)||[]).length;
const expectedWeaponNames=rules.datasheets.reduce((sum,unit)=>sum+unit.weapons.length,0);
check('datasheet abilities and weapons are interactive',abilityCards>0&&interactiveAbilityCards===abilityCards&&compactAbilityButtons>0&&interactiveWeaponNames===expectedWeaponNames,`${interactiveAbilityCards}/${abilityCards} ability cards; ${compactAbilityButtons} compact abilities; ${interactiveWeaponNames}/${expectedWeaponNames} weapons`);
check('Core abilities use canonical destinations',!markup.includes('data-term="datasheet-deep-strike"')&&!markup.includes('data-term="datasheet-deadly-demise')&&markup.includes('data-term="core-deep-strike"')&&markup.includes('data-term="core-deadly-demise"')&&terms['core-deep-strike']?.fullRulePath==='books/core-rules/reader/core-abilities.html#rule-24-09');
check('official and Codex datasheets show provenance',(markup.match(/class="unit-card surface/g)||[]).length===(markup.match(/<div class="source"><a class="source-link"/g)||[]).length-rules.updates.length-allDetachments.length-1);

const weaponAbilityTermIds=new Map([
  ['ANTI','core-anti'],['ASSAULT','core-assault'],['BLAST','core-blast'],['DEVASTATING WOUNDS','core-devastating-wounds'],
  ['EXTRA ATTACKS','core-extra-attacks'],['HAZARDOUS','core-hazardous'],['HEAVY','core-heavy'],['IGNORES COVER','core-ignores-cover'],
  ['INDIRECT FIRE','core-indirect-fire'],['LANCE','core-lance'],['MELTA','core-melta'],['PISTOL','core-pistol'],
  ['PRECISION','core-precision'],['RAPID FIRE','core-rapid-fire'],['SUSTAINED HITS','core-sustained-hits'],
  ['TORRENT','core-torrent'],['TWIN-LINKED','core-twin-linked']
]);
const splitWeaponAbilities=value=>String(value||'').split(',').map(label=>label.trim().toUpperCase()).filter(Boolean);
const weaponAbilityBase=label=>{const base=label.replace(/\s+(?:D\d+|\d+\+|\d+)$/i,'').trim();return base.startsWith('ANTI-')?'ANTI':base;};
const canonicalWeaponAbilityRows=rules.datasheets.flatMap(unit=>unit.weapons.filter(weapon=>weapon.abilities).map(weapon=>splitWeaponAbilities(weapon.abilities)));
const extractWeaponAbilityRows=sourceMarkup=>[...sourceMarkup.matchAll(/<div class="weapon-tags">([\s\S]*?)<\/div>/g)].map(([,body])=>[...body.matchAll(/<(button|span)\b([^>]*)>([^<]+)<\/\1>/g)].filter(([, ,attrs])=>/\bclass="[^"]*\btag\b/.test(attrs)).map(([,element,attrs,label])=>({element,label:label.trim(),term:attrs.match(/\bdata-term="([^"]+)"/)?.[1]||''})));
const desktopWeaponAbilityRows=extractWeaponAbilityRows(html);
const canonicalLabels=canonicalWeaponAbilityRows.flat();
const desktopTokens=desktopWeaponAbilityRows.flat();
const rowInventory=rows=>rows.map(row=>JSON.stringify(row.map(item=>typeof item==='string'?item:item.label))).sort();
check('all 34 Mechanicus datasheets share one deterministic weapon ability inventory',rules.datasheets.length===34&&canonicalWeaponAbilityRows.length===93&&canonicalLabels.length===166,`${rules.datasheets.length} datasheets; ${canonicalWeaponAbilityRows.length} weapons; ${canonicalLabels.length} labels`);
check('desktop weapon abilities render one atomic token per canonical label',JSON.stringify(rowInventory(desktopWeaponAbilityRows))===JSON.stringify(rowInventory(canonicalWeaponAbilityRows))&&desktopTokens.length===canonicalLabels.length,`${desktopTokens.length}/${canonicalLabels.length} tokens`);
check('responsive reader weapon abilities preserve canonical token text and order',JSON.stringify(rowInventory(desktopWeaponAbilityRows))===JSON.stringify(rowInventory(canonicalWeaponAbilityRows))&&mobileRoutePages.every(page=>!page.includes('weapon-tags')),`${desktopTokens.length} canonical tokens`);
check('known weapon ability tokens resolve canonical base glossary rules',desktopTokens.every(token=>token.element==='button'&&token.term===weaponAbilityTermIds.get(weaponAbilityBase(token.label)))&&canonicalLabels.every(label=>weaponAbilityTermIds.has(weaponAbilityBase(label))),`${desktopTokens.filter(token=>token.term).length} interactive; ${canonicalLabels.filter(label=>!weaponAbilityTermIds.has(weaponAbilityBase(label))).length} unknown`);
check('weapon ability markup has no raw comma list or partial nested glossary links',!/<button class="weapon-button"[^>]*>[^<]*<\/button><small>/i.test(html)&&!/<(?:button|span)[^>]*class="[^"]*\btag\b[^"]*"[^>]*>[^<]*<button/i.test(html)&&!/>ANTI<\/button>-[^<]+/i.test(html)&&mobileRoutePages.every(page=>!page.includes('weapon-button')));
check('Mechanicus weapon ability tokens reuse the Death Guard production DOM contract',deathGuardHtml.includes('<div class="weapon-tags">')&&deathGuardHtml.includes('<button class="tag" data-term=')&&html.includes('<div class="weapon-tags"><button class="tag" data-term='));
check('cache revision tracks the authoritative APP_SHELL while legacy routes stay content-free',glossaryBuildSource.includes('writeCacheRevision({root})')&&cacheRevisionSource.includes('readAppShell')&&cacheRevisionSource.includes('CACHE_REVISION_RELATIVE_PATH')&&serviceWorker.includes('importScripts("./glossary/generated/cache-revision.js")')&&mobileRoutePages.every(page=>!/<(?:article|section)\b|class="[^"]*\bunit-card\b|data-rule-id=/.test(page)));

const navSource=deathGuardRead('scripts/navigation-controller.js');
const popupSource=deathGuardRead('scripts/popup-controller.js');
check('single passive scroll owner remains',(navSource.match(/addEventListener\('scroll'/g)||[]).length===1&&navSource.includes("state={owner:'reader'")&&navSource.includes('{passive:true}'));
check('scroll spy uses cached geometry',!navSource.slice(navSource.indexOf('pickActive(){'),navSource.indexOf('scheduleRead(){')).includes('getBoundingClientRect'));
check('manual scroll keeps the last crossed descendant active',navSource.includes('lastCrossedDescendant(parent,scrollY)'));
check('navigation uses the shared explicit target resolver',navSource.includes('WHNavigationTargets.resolve')&&!navSource.includes("querySelector(':scope > .stratagem')")&&!navSource.includes("querySelector('.stratagem')"));
check('outside click closes the complete popup chain',popupSource.includes("this.ids.length&&!event.target.closest('.term-popup,.full-entry-layer')")&&popupSource.includes('this.closeFrom(0)'));
check('datasheet actions appear only inside Related Rules',!popupSource.includes('Datasheet & Wargear')&&!popupSource.includes("label:'Statline'")&&popupSource.includes("label:'Open datasheet'")&&popupSource.includes("closest?.('.related-rules-layer')"));
check('Mega Glossary transitions use the shared return helper',/\.\.\/\.\.\/glossary-return\.js\?v=\d+/.test(html)&&popupSource.includes('WHGlossaryReturn')&&sharedArmyBookSource.includes('WHGlossaryReturn'));
check('book loads the shared navigation target resolver',html.includes('src="../shared/navigation-targets.js?v='));
check('book loads the shared datasheet design',html.includes('href="../shared/datasheet-system.css?v='));
check('book loads the shared datasheet layout',html.includes('src="../shared/datasheet-layout.js?v='));
check('long datasheet abilities use an original-node continuation',sharedDatasheetLayout.includes("layout.continuation.className='ability-list ds-abilities-continuation'")&&sharedDatasheetLayout.includes('layout.cards.slice(split).forEach(node=>layout.continuation.append(node))'));
check('long datasheet continuation recalculates from available card width',sharedDatasheetLayout.includes("'ResizeObserver' in window")&&sharedDatasheetLayout.includes('entry.contentRect.width')&&sharedDatasheetLayout.includes('restoreAbilities(layout)'));
check('long datasheet continuation spans the datasheet width',sharedDatasheetCss.includes('.unit-card.ds-layout .ds-abilities-continuation')&&sharedDatasheetCss.includes('grid-template-columns: 1fr'));
check('glossary autolinking and navigation remain installed by the shared runtime',sharedArmyBookSource.includes('WHGlossaryAutolink?.apply')&&sharedArmyBookSource.includes('new root.DGNavigation'));
check('shared datasheet statlines keep every characteristic on one row',/\.unit-card \.statline\s*\{[^}]*display:\s*flex/.test(sharedDatasheetCss));
check('mobile weapon characteristics use one six-column row',sharedDatasheetCss.includes('grid-template-columns: repeat(6, minmax(0, 1fr))')&&(html.match(/data-label="(?:Range|A|BS|WS|S|AP|D)"/g)||[]).length===rules.datasheets.reduce((sum,unit)=>sum+unit.weapons.length,0)*6);
check('mobile layout avoids content-visibility geometry jumps',!deathGuardRead('styles/content.css').includes('content-visibility: auto'));
check('desktop stratagem cards use the shared responsive grid',deathGuardRead('styles/content.css').includes('.stratagem-grid')&&html.includes('class="stratagem-grid"'));
check('navigation cancellation remains wired',navSource.includes("root.style.scrollBehavior='auto'")&&navSource.includes("behavior:'auto'"));
check('navigation is loaded from the shared Army Book runtime contract',html.includes('../shared/controllers/navigation-controller.js'));
check('entry route resolves directly to the single canonical reader',entry.includes('data-canonical-reader="./reader.html"')&&entry.includes('../shared/mobile-route-redirect.js?v=2')&&!entry.includes('./mobile/index.html'));
check('header exposes the shared Mega Glossary',markup.includes('href="../../glossary/index.html"')&&markup.includes('Mega Glossary'));
check('mobile weapon labels stay dynamic',html.includes('data-label="Range"')&&/content:\s*attr\(data-label\)/.test(sharedDatasheetCss));
check('responsive mode preserves the active roster instance without a second route',!appSource.includes("new URL('./mobile/")&&!rosterFilterSource.includes('./mobile/')&&!rosterFilterSource.includes('history.replaceState')&&responsiveRoute.searchParams.get('instance')==='responsive-unit-2');
check('nested Full Entry stays above Related Rules',read('styles/mechanicus.css').includes('.related-rules-open .full-entry-layer{z-index:170}'));
check('Related Rules uses an opaque book background',/\.related-rules-dialog\{[^}]*background:var\(--panel\)/.test(read('styles/mechanicus.css'))&&!/\.related-rules-dialog\{[^}]*background:var\(--void\)/.test(read('styles/mechanicus.css')));
check('conditional attached-unit Enhancements are never guessed',firstOwnership.cardEnhancements.length===1&&aggregatedOwnership.cardEnhancements.length===0);
check('unconditional whole-unit Enhancements retain exact physical ownership',responsiveOwnership.instances.length===responsiveParsed.units.length&&firstOwnership.cardEnhancements.length===1&&aggregatedOwnership.cardEnhancements.length===0);
check('personal roster reports unmatched units and renders loadout',rosterP1ThinProvider&&responsiveOwnership.instances.length===responsiveParsed.units.length&&rosterP1SharedContextSource.includes('datasheetState')&&!rosterFilterSource.includes('Unmatched roster units:'));
check('shared points validation recognises New Recruit Legends suffixes',fs.readFileSync(path.resolve(root,'..','..','roster-guides','points-validator.js'),'utf8').includes('\\[legends\\]'));

const allStratagems=allDetachments.flatMap(detachment=>detachment.stratagems);
const allEnhancements=allDetachments.flatMap(detachment=>detachment.enhancements);
const allEligibleItems=[...allStratagems,...allEnhancements];
const unitIds=new Set(rules.datasheets.map(unit=>unit.id));
const knownKeywords=new Set(rules.datasheets.flatMap(unit=>unit.keywords).map(keyword=>keyword.toUpperCase()));
for(const grants of Object.values(relatedRulesConfig.keywordGrants||{}))for(const grant of grants)knownKeywords.add(grant.keyword.toUpperCase());
const eligibilityTargets=allEligibleItems.flatMap(item=>item.eligibility?.targets||[]);
check('all 51 Stratagems and 34 Enhancements have explicit eligibility',allStratagems.length===51&&allEnhancements.length===34&&allEligibleItems.every(item=>item.id&&(item.eligibility?.owner||item.eligibility?.targets?.some(target=>target.side==='friendly'))));
check('eligibility IDs are stable and unique',new Set(allEligibleItems.map(item=>item.id)).size===allEligibleItems.length&&allStratagems.every(item=>item.id.startsWith('stratagem-'))&&allEnhancements.every(item=>item.id.startsWith('enhancement-')));
check('eligibility references known datasheets and keywords',eligibilityTargets.every(target=>(target.units||[]).every(id=>unitIds.has(id))&&[...(target.all||[]),...(target.any||[]),...(target.none||[])].every(keyword=>knownKeywords.has(keyword.toUpperCase()))));
check('legacy Mechanicus matcher path is absent',!fs.existsSync(path.join(root,'scripts','related-rules.js'))&&!html.includes('related-rules-matcher.js')&&!read('mobile/related-rules.inc').includes('data-eligibility=')&&!read('mobile/related-rules.inc').includes('data-keyword-grants='));

const extractor=spawnSync('C:\\Users\\denis\\.cache\\codex-runtimes\\codex-primary-runtime\\dependencies\\python\\python.exe',[path.join(root,'tools','extract-faction-pack.py'),'--check'],{encoding:'utf8'});
check('PDF extraction snapshot is current',extractor.status===0,(extractor.stderr||extractor.stdout).trim());
const codexExtractor=spawnSync(node,[path.join(root,'tools','extract-datasheets.mjs'),'--check'],{encoding:'utf8'});
check('Codex datasheet snapshot is current',codexExtractor.status===0,(codexExtractor.stderr||codexExtractor.stdout).trim());
const codexOwnership=spawnSync(node,[path.resolve(root,'..','..','tests','am-datasheet-source-ownership-qa.mjs')],{encoding:'utf8'});
check('Codex datasheet producer ignores absent or poisoned previous output',codexOwnership.status===0,(codexOwnership.stderr||codexOwnership.stdout).trim());
const pointsExtractor=spawnSync(node,[path.join(root,'tools','extract-points.mjs'),'--check'],{encoding:'utf8'});
check('current points and Enhancements snapshot is current',pointsExtractor.status===0,(pointsExtractor.stderr||pointsExtractor.stdout).trim());
const compatibleRulesSnapshot=spawnSync(node,[path.join(root,'tests','compatible-rules-import-qa.mjs')],{encoding:'utf8'});
check('Wahapedia compatible-rules snapshot is current',compatibleRulesSnapshot.status===0,(compatibleRulesSnapshot.stderr||compatibleRulesSnapshot.stdout).trim());
const m2DataAudit=spawnSync(node,[path.join(root,'tests','m2-data-audit-qa.mjs')],{encoding:'utf8'});
check('M2 official parity and correction ledger are complete',m2DataAudit.status===0,(m2DataAudit.stderr||m2DataAudit.stdout).trim());
const compatibleRulesMatrix=spawnSync(node,[path.join(root,'tests','compatible-rules-matrix-qa.mjs')],{encoding:'utf8'});
check('Mechanicus compatible-rules matrix is current',compatibleRulesMatrix.status===0,(compatibleRulesMatrix.stderr||compatibleRulesMatrix.stdout).trim());
check('official MFM unit sizes are locked',[
  ['Ironstrider Ballistarii','3rd+ unit: 3 models'],
  ['Sydonian Dragoons with radium jezzails','3 models'],
  ['Sydonian Dragoons with taser lances','3 models'],
  ['Servitor Battleclade','1st–2nd unit: 9 models'],
  ['Skitarii Rangers','10 models'],
  ['Sydonian Skatros','1 model']
].every(([title,label])=>currentPoints.units.find(unit=>unit.title===title)?.points.some(row=>row.label===label)));
check('official MFM provenance is locked',currentPoints.source.officialVersion==='v1.3'&&currentPoints.source.officialUrl==='https://mfm.warhammer-community.com/en/adeptus-mechanicus');
check('carried-forward rules no longer use placeholder wording',!JSON.stringify(codex).match(/rule's listed roll|following the rule's unit restrictions|under the listed Acquisition conditions|according to the Stratagem's conditions/));
check('personal roster integration is loaded',/\.\.\/shared\/roster-parser\.js\?v=\d+/.test(html)&&/\.\.\/\.\.\/roster-guides\/points-validator\.js\?v=\d+/.test(html)&&/\.\/scripts\/roster-filter\.js\?v=\d+/.test(html)&&html.includes('data-roster-guides'));
check('Compatible Rules runtime uses only the generated matrix',appSource.includes('generated/compatible-rules.json')&&appSource.includes('createCompatibleRulesLoader')&&appSource.includes('fetch:loadCompatibleRulesMatrix')&&appSource.includes("replace(/^detachment-/,'')")&&!fs.existsSync(path.join(root,'scripts','compatible-rules-runtime.mjs'))&&!appSource.includes('AMRelatedRules')&&!fs.existsSync(path.join(root,'mobile','mobile.js')));
const unverifiedStratagemIds=['stratagem-defect-scrutiny','stratagem-repolarised-augurs','stratagem-clandestine-reposition','stratagem-scriptural-prognosis','stratagem-overloaded-safeguards','stratagem-holy-avarice','stratagem-echoes-of-the-conduit-wars','stratagem-chant-of-electrotraction','stratagem-momentum-feedback','stratagem-verse-of-vengeance','stratagem-auto-oracular-retrieval','stratagem-incense-exhausts','stratagem-isolate-and-destroy'];
const stratagemCards=markup=>[...markup.matchAll(/<article\b([^>]*\bclass="[^"]*\bstratagem\b[^"]*"[^>]*)>([\s\S]*?)<\/article>/g)].map(([,attrs,body])=>({id:attrs.match(/\bdata-rule-id="([^"]+)"/)?.[1],type:attrs.match(/\bdata-stratagem-type="([^"]+)"/)?.[1],labels:[...body.matchAll(/<span\b[^>]*class="stratagem-type"[^>]*>([^<]*)<\/span>/g)].map(match=>match[1].trim())}));
const honestStratagemLabels=markup=>{const cards=stratagemCards(markup);return unverifiedStratagemIds.every(id=>{const card=cards.find(item=>item.id===id);return card?.type==='unknown'&&card.labels.length===1&&card.labels[0]==='Type unverified';})&&cards.filter(card=>card.type&&card.type!=='unknown').every(card=>card.labels.length===1&&card.labels[0]!=='Type unverified');};
check('Compatible Rules assets and unverified Stratagem labels use the current contract',appSource.includes("templateUrl:'./mobile/related-rules.inc?v=4'")&&/\.\/scripts\/app\.js\?v=\d+/.test(html)&&mobileRoutePages.every(page=>page.includes('mobile-route-redirect.js?v=2')&&!page.includes('mobile.js'))&&honestStratagemLabels(html)&&honestStratagemLabels(read('mobile/related-rules.inc')));
check('canonical responsive faction validation preserves only the Imperium parent',rosterP1ThinProvider&&/"factionKeyword"\s*:\s*"Adeptus Mechanicus"/i.test(rosterP1CatalogSource)&&!rosterFilterSource.includes('adeptusMechanicusFaction')&&!fs.existsSync(path.join(root,'mobile','mobile.js')));
check('canonical invalid roster handoff is terminal and non-reentrant',rosterP1SharedContextSource.includes('incompatible')&&rosterP1SharedContextSource.includes('roster-guides/index.html')&&!rosterFilterSource.includes('location.replace')&&!rosterFilterSource.includes('AMPhoneRoster'));
check('Compatible Rules renders every matrix condition',appSource.includes("'second-unit-unknown'")&&appSource.includes("'battle-state-unknown'")&&sharedCompatibleMatrixSource.includes('conditionsFor')&&!fs.existsSync(path.join(root,'scripts','compatible-rules-runtime.mjs'))&&!fs.existsSync(path.join(root,'mobile','mobile.js')));
check('roster Compatible Rules fail closed and filter assigned owners',rosterLogic.resolveDetachment([],detachmentInventory)===''&&firstOwnership.cardEnhancements.length===1&&aggregatedOwnership.cardEnhancements.length===0&&rosterRules.some(rule=>rule.ruleId==='owned')&&!rosterRules.some(rule=>rule.ruleId==='other-owner'));
const relatedRulesMarkup=read('mobile/related-rules.inc');
check('Compatible Rules artifact keeps canonical group structure',(relatedRulesMarkup.match(/<section class="related-detachment(?: related-core)?"/g)||[]).length===11&&(relatedRulesMarkup.match(/<h2>Core Stratagems<\/h2>/g)||[]).length===1&&!/<h[34]\b[^>]*>(?:Core )?Stratagems<\/h[34]>/.test(relatedRulesMarkup)&&(relatedRulesMarkup.match(/<article\b[^>]*\bid="(?:core-stratagem|stratagem|enhancement)-[^"]+"/g)||[]).length===95);
check('every Enhancement has a detachment and current cost',json('content/adeptus-mechanicus-points.en.json').enhancements.length===34&&json('content/adeptus-mechanicus-points.en.json').enhancements.every(item=>item.detachment&&item.value>0));
const canonicalEnhancements=allDetachments.flatMap(detachment=>(detachment.enhancements||[]).map(item=>({id:item.id,detachmentId:detachment.id})));
const uniquePublishedEnhancements=[...new Map(Object.values(publishedMechanicusPoints).map(item=>[JSON.stringify(item),item])).values()];
check('Enhancement points preserve exact canonical identity',canonicalEnhancements.length===34&&uniquePublishedEnhancements.length===34&&canonicalEnhancements.every(item=>uniquePublishedEnhancements.filter(point=>point.id===item.id&&point.canonicalEnhancementId===item.id&&point.canonicalDetachmentId===item.detachmentId&&Number.isFinite(Number(point.value))).length===1));
check('Enhancement points aliases preserve one canonical identity',
  JSON.stringify(publishedMechanicusPoints['autoclavic denounciation'])===JSON.stringify(publishedMechanicusPoints['autoclavic denunciation'])&&
  publishedMechanicusPoints['autoclavic denounciation']?.canonicalEnhancementId==='enhancement-autoclavic-denunciation'&&
  publishedMechanicusPoints['tl 4 9']?.canonicalEnhancementId==='enhancement-tl-4-9'&&
  publishedMechanicusPoints['stealth screened cybercanids upgrade']?.canonicalEnhancementId==='enhancement-stealth-screened-cybercanids-upgrade');
const build=spawnSync(node,[path.join(root,'tools','build-full-content.mjs'),'--check'],{encoding:'utf8'});
check('generated project artifacts are current',build.status===0,(build.stderr||build.stdout).trim());
const mobileBuild=spawnSync(node,[path.join(root,'mobile','build.mjs'),'--check'],{encoding:'utf8'});
check('generated Phone outputs are current',mobileBuild.status===0,(mobileBuild.stderr||mobileBuild.stdout).trim());

function legendsCount(markup){return (markup.match(/class="unit-card surface legends-card"/g)||[]).length;}
for(const result of results)console.log(`${result.ok?'PASS':'FAIL'}  ${result.name}${result.detail?' — '+result.detail:''}`);
const failed=results.filter(x=>!x.ok);
console.log(`\n${results.length-failed.length}/${results.length} checks passed.`);
if(failed.length)process.exitCode=1;

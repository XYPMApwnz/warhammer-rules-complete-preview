import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=name=>fs.readFileSync(path.join(root,name),'utf8');
const html=read('index.html');
const source=JSON.parse(read('content/adeptus-mechanicus-prototype.en.json'));
const scripts=['scripts/data.js','scripts/navigation-controller.js','scripts/popup-controller.js','scripts/journey-controller.js','scripts/ui-controllers.js','scripts/app.js'];
const checks=[];
const check=(name,ok,detail='')=>checks.push({name,ok,detail});

for(const file of scripts){try{new vm.Script(read(file),{filename:file});check(file+' syntax',true);}catch(error){check(file+' syntax',false,error.message);}}
const markup=html.replace(/<script[\s\S]*?<\/script>/gi,'');
const ids=[...markup.matchAll(/\sid="([^"]+)"/g)].map(match=>match[1]);
const idSet=new Set(ids);
const navTargets=[...markup.matchAll(/data-nav-target="([^"]+)"/g)].map(match=>match[1]);
const trackTargets=[...markup.matchAll(/data-track="([^"]+)"/g)].map(match=>match[1]);
const journeyTargets=[...markup.matchAll(/data-journey-target="([^"]+)"/g)].map(match=>match[1]);
const usedTerms=[...markup.matchAll(/data-term="([^"]+)"/g)].map(match=>match[1]);
const navigationSource=read('scripts/navigation-controller.js');
const requiredIds=['appHeader','navMenu','navCollapse','backButton','themeButton','tocScrim','tocPanel','tocTree','navSearch','main','readerTools','globalSearch','globalSearchClear','searchResults','glossary','glossarySearch','searchClear','noResults','popupLayer'];

check('required DG engine IDs are present',requiredIds.every(id=>idSet.has(id)),requiredIds.filter(id=>!idSet.has(id)).join(', '));
check('HTML IDs are unique',ids.length===idSet.size);
check('all navigation targets exist',navTargets.every(id=>idSet.has(id)),navTargets.filter(id=>!idSet.has(id)).join(', '));
check('all navigation targets have tracked ranges',navTargets.every(id=>trackTargets.includes(id)),navTargets.filter(id=>!trackTargets.includes(id)).join(', '));
check('all Journey targets exist',journeyTargets.every(id=>idSet.has(id)),journeyTargets.filter(id=>!idSet.has(id)).join(', '));
const depths=[...markup.matchAll(/data-nav-depth="(\d+)"/g)].map(match=>Number(match[1]));
check('navigation depth is at most three',Math.max(...depths)===3);
check('source audit is 5 detachments and 4 datasheets',source.audit.detachments===5&&source.audit.datasheets===4);
check('all five Detachments have three tracked parts',(markup.match(/class="detachment-part"/g)||[]).length===15);
check('all four unit cards are global destinations',(markup.match(/class="unit-card surface"/g)||[]).length===4&&source.sections.filter(section=>section.kind==='unit').every(section=>navTargets.includes(section.id)));
check('saved 995-point army section is removed',!markup.includes('army-roster-995')&&!markup.includes('My Army · 995')&&!JSON.stringify(source).includes('Local Adeptus Mechanicus points export'));
const localParts=['thulia-profile','thulia-abilities','thulia-composition','thulia-keywords','exterminators-profile','exterminators-abilities','exterminators-composition','exterminators-keywords','fusiliers-profile','fusiliers-abilities','fusiliers-composition','fusiliers-keywords','servitor-profile','servitor-abilities','servitor-composition','servitor-keywords'];
check('datasheet local parts stay out of global navigation',localParts.every(id=>idSet.has(id)&&!navTargets.includes(id)));

const context={window:{},Object};vm.runInNewContext(read('scripts/data.js'),context);
const termKeys=Object.keys(context.window.DG_TERMS||{});
check('term registry matches source audit',termKeys.length===source.audit.glossaryTerms,String(termKeys.length));
check('all term triggers resolve',usedTerms.every(id=>termKeys.includes(id)),usedTerms.filter(id=>!termKeys.includes(id)).join(', '));
check('every registered term is exercised',termKeys.every(id=>usedTerms.includes(id)),termKeys.filter(id=>!usedTerms.includes(id)).join(', '));
const termRegistry=context.window.DG_TERMS;
check('term actions and relations resolve',Object.values(termRegistry).every(term=>['glossary','rule','datasheet','statline'].every(key=>!term[key]||idSet.has(term[key]))&&(term.related||[]).every(id=>termKeys.includes(id))&&(term.units||[]).every(id=>idSet.has(id))));
check('favorite Doctrina console is preserved',markup.includes('class="doctrina-console surface"')&&markup.includes('data-protocol="protector"')&&markup.includes('data-protocol="conqueror"'));
check('glossary search contract is present',markup.includes('data-glossary-title=')&&idSet.has('glossarySearch')&&idSet.has('searchClear'));
check('popup and Journey controllers are unchanged contracts',read('scripts/popup-controller.js').includes("this.ids=[];this.origins=[]")&&read('scripts/journey-controller.js').includes('popupIds:this.popups.snapshot()'));
const journeyBack=read('scripts/journey-controller.js').slice(read('scripts/journey-controller.js').indexOf('back(){'));
check('Back restores scroll before recreating popups',journeyBack.indexOf('this.navigation.restore')<journeyBack.indexOf('this.popups.restore'));
check('all six style layers are linked',['tokens','layout','navigation','content','popups','mechanicus'].every(name=>html.includes(`./styles/${name}.css?v=5`)));
check('no inline style or inline script',!/<style|<script(?![^>]*src=)/i.test(html));
check('Mechanicus logo exists',fs.existsSync(path.join(root,'assets','mechanicus-logo.png')));
check('navigation and global search are wired',markup.includes('id="navSearch"')&&markup.includes('id="globalSearch"')&&read('scripts/app.js').includes('new window.AMGlobalSearch'));
check('navigation search resets before navigation and syncs ARIA',read('scripts/ui-controllers.js').includes("this.reset();},true)")&&read('scripts/ui-controllers.js').includes("setAttribute('aria-expanded',String(!hidden))"));
check('header brand uses controlled navigation',markup.includes('data-header-home')&&read('scripts/app.js').includes("navigation.go('start')"));
check('table accessibility and mobile labels are dynamic',read('scripts/ui-controllers.js').includes(".weapon-table[role=\"table\"],.data-table[role=\"table\"]")&&read('scripts/ui-controllers.js').includes('cell.dataset.label=labels[columnIndex]')&&read('styles/content.css').includes('content: attr(data-label)'));
check('all buttons receive explicit runtime type',read('scripts/app.js').includes("button:not([type])"));
check('integrated PWA delegates to the shared root',!fs.existsSync(path.join(root,'manifest.webmanifest'))&&!fs.existsSync(path.join(root,'service-worker.js'))&&html.includes('../../manifest.webmanifest')&&read('scripts/app.js').includes("register('../../service-worker.js')"));
check('Faction Pack source hash is recorded',source.sources[0].sha256==='7F01DD2CE7E35C762B0AB625ADE779022275574CF2D01EE46EE16B2F5582341C');
check('active runtime has no replacement characters',!['index.html',...scripts,'styles/layout.css','styles/navigation.css','styles/content.css','styles/popups.css'].map(read).join('').includes('\uFFFD'));
const scriptPositions=scripts.map(file=>html.indexOf('./'+file));
check('runtime scripts load in dependency order',scriptPositions.every((position,index)=>position>=0&&(index===0||position>scriptPositions[index-1])));
check('navigation uses one passive scroll owner',(navigationSource.match(/addEventListener\('scroll'/g)||[]).length===1&&navigationSource.includes("state={owner:'reader'")&&navigationSource.includes("{passive:true}"));
check('navigation geometry constants match v5 contract',navigationSource.includes('trackingGap=18')&&navigationSource.includes('epsilon=1')&&navigationSource.includes('settleDistance=2')&&navigationSource.includes('stableFrames=6')&&navigationSource.includes('maxTransitionMs=2200'));
const spyBody=navigationSource.slice(navigationSource.indexOf('pickActive(){'),navigationSource.indexOf('scheduleRead(){'));
check('scroll-spy reads cached geometry only',spyBody.length>0&&!spyBody.includes('getBoundingClientRect'));
check('Journey metric compatibility alias exists',navigationSource.includes('scheduleMetrics(){this.scheduleGeometry();}'));
check('manual input stops the native smooth scroll',navigationSource.includes("root.style.scrollBehavior='auto'")&&navigationSource.includes("left:window.scrollX,behavior:'auto'"));
check('Start highlights its heading without a hero outline',!navigationSource.match(/matches\?\.\([^\n]*\.hero/)&&navigationSource.includes("contains('hero'))return element.querySelector('h1')"));
check('project navigation spec is Mechanicus v5 contract',read('docs/SPEC_NAVIGATION.md').includes('навигация Adeptus Mechanicus Rules')&&read('docs/SPEC_NAVIGATION.md').includes('36 глобальных целей'));

const navContext={window:{scrollY:0},HTMLElement:function(){}};
navContext.HTMLElement.prototype={};
vm.runInNewContext(navigationSource,navContext);
const Navigation=navContext.window.DGNavigation;
const geometryProbe=Object.create(Navigation.prototype);
geometryProbe.options={trackingGap:18,epsilon:1};
geometryProbe.metrics={headerBottom:64,glossarySticky:48,ranges:[]};
geometryProbe.items=[];
geometryProbe.byId=new Map();
const parentItem={id:'parent',depth:1,section:{},glossaryNested:false};
const childItem={id:'child',depth:2,section:{},glossaryNested:false};
geometryProbe.items=[parentItem,childItem];
geometryProbe.metrics.ranges=[{item:parentItem,top:0,bottom:1000},{item:childItem,top:300,bottom:600}];
navContext.window.scrollY=216;
const beforeChild=geometryProbe.pickActive()?.id;
navContext.window.scrollY=217;
const atChild=geometryProbe.pickActive()?.id;
check('nested section does not activate before its control line',beforeChild==='parent'&&atChild==='child',`${beforeChild} / ${atChild}`);

const glossaryRoot={id:'glossary',dataset:{track:'glossary'},getBoundingClientRect:()=>({top:500})};
const glossaryChild={id:'glossary-core',dataset:{track:'glossary-core'},getBoundingClientRect:()=>({top:500})};
geometryProbe.glossary=glossaryRoot;
geometryProbe.byId=new Map([
  ['glossary',{section:glossaryRoot,glossaryNested:false}],
  ['glossary-core',{section:glossaryChild,glossaryNested:true}]
]);
navContext.window.scrollY=100;
geometryProbe.metrics.readerSticky=60;
check('reader toolbar and glossary offsets share destination geometry',geometryProbe.destination(glossaryRoot)===458&&geometryProbe.destination(glossaryChild)===410,`${geometryProbe.destination(glossaryRoot)} / ${geometryProbe.destination(glossaryChild)}`);

const popupContext={window:{},document:{getElementById:id=>id?{}:null}};
vm.runInNewContext(read('scripts/popup-controller.js'),popupContext);
const popupProbe=Object.create(popupContext.window.DGPopups.prototype);
popupProbe.rootElement=()=>({closest:()=>({id:'unit-hastarii-exterminators',querySelector:()=>({id:'exterminators-profile'})})});
const contextualActions=popupProbe.actionList({title:'Shared',units:['unit-hastarii-exterminators'],datasheet:'unit-thulia-ghuld',statline:'thulia-profile'});
check('shared popup routes to its contextual datasheet',contextualActions.some(action=>action.target==='unit-hastarii-exterminators')&&contextualActions.some(action=>action.target==='exterminators-profile'));

for(const result of checks)console.log(`${result.ok?'PASS':'FAIL'}  ${result.name}${result.detail?' — '+result.detail:''}`);
const failed=checks.filter(result=>!result.ok);
console.log(`\n${checks.length-failed.length}/${checks.length} checks passed.`);
if(failed.length)process.exitCode=1;

/** Independent review expectations: the report never owns or changes gameplay. */
import assert from 'node:assert/strict';
import {compareBookGameplay,shortWordDiff,renderBookUpdateReport} from '../books/shared/tools/book-update-report.mjs';

const field=(id,label,value,extra={})=>({id,label,value,type:'text',source:{entityId:id.split('::')[0],path:id.split('::')[1]},...extra});
const card=(id,kind,title,fields=[],parentId)=>({id,kind,title,fields,parentId,contextId:parentId||id,children:[],source:{entityId:id}});
const baseline={book:{id:'synthetic',title:'Synthetic Army'},cards:[
 card('unit','DATASHEET','Plague Marines',[field('unit::/title','title','Plague Marines',{presentation:'heading'}),field('unit::/keywords/0','keywords','INFANTRY',{type:'tokens'}),field('unit::/keywords/1','keywords','CHAOS',{type:'tokens'})]),
 card('profile','PROFILE','PROFILE',[field('profile::/T','Toughness','5',{presentation:'stat'})],'unit'),
 card('weapon','WEAPON_PROFILE','Plague knife',[field('weapon::/attacks','Attacks','2',{presentation:'stat'}),field('weapon::/strength','Strength','4',{presentation:'stat'})],'unit'),
 card('rule','DETACHMENT_RULE','Test Rule',[field('rule::/text','Rule','Each time this unit makes an attack, add 1 to the Hit roll.')],'detachment'),
 card('enhancement','ENHANCEMENT','Test Enhancement',[field('enhancement::/text','Rule','The bearer has Scouts 5".'),field('enhancement::/eligibilityText','eligibility Text','The bearer has Scouts 5".')]),
 card('composition','COMPOSITION_MEMBER','Plague Marine',[field('composition::/quantity/min','Minimum models',5),field('composition::/quantity/max','Maximum models',10)],'unit'),
 card('cost','MFM_UNIT_POINTS','PLAGUE MARINES',[field('cost::/pointSchedules/0/sourceLabel','Applies to','YOUR UNIT COSTS'),field('cost::/pointSchedules/0/entries/0/sourceLabel','Applies to','5 models'),field('cost::/pointSchedules/0/entries/0/value','Points',90)],'unit')
]};
const clone=()=>structuredClone(baseline),compare=after=>compareBookGameplay({bookId:'synthetic',before:baseline,after});
const rows=[];
function check(name,run){run();rows.push({check:name,status:'PASS'});}
check('identical gameplay and metadata',()=>{assert.equal(compare(clone()).gameplayChanges,0);assert.equal(compare(clone()).metadataChanges,0);});
check('one weapon stat produces exactly one contextual row',()=>{
 const after=clone();after.cards.find(c=>c.id==='weapon').fields[0].value='3';const r=compare(after);
 assert.equal(r.gameplayChanges,1);assert.equal(r.changes[0].category,'WEAPON');assert.equal(r.changes[0].summary,'Plague Marines · Plague knife · A: 2 → 3');
});
check('datasheet statistic uses its player-facing abbreviation',()=>{
 const after=clone();after.cards.find(c=>c.id==='profile').fields[0].value='6';const r=compare(after);assert.equal(r.gameplayChanges,1);assert.equal(r.changes[0].summary,'Plague Marines · T: 5 → 6');
});
check('rule text reports changed words with bounded unchanged context',()=>{
 const after=clone();after.cards.find(c=>c.id==='rule').fields[0].value='Each time this unit makes an attack, add 2 to the Hit roll.';
 const r=compare(after);assert.equal(r.gameplayChanges,1);assert(r.changes[0].summary.includes('[-1-] [+2+]'));assert(!r.changes[0].summary.startsWith('Each time'));
 const long=shortWordDiff('prefix '+Array(100).fill('old').join(' ')+' suffix','prefix '+Array(100).fill('new').join(' ')+' suffix');assert(long.length<550);assert(long.includes('…'));
});
check('duplicate eligibility text is not a second gameplay change',()=>{
 const after=clone(),e=after.cards.find(c=>c.id==='enhancement');e.fields.forEach(f=>f.value='The bearer has Scouts 6".');assert.equal(compare(after).gameplayChanges,1);
});
check('keyword membership is a set, not its source order',()=>{
 const after=clone();[after.cards[0].fields[1].value,after.cards[0].fields[2].value]=[after.cards[0].fields[2].value,after.cards[0].fields[1].value];assert.equal(compare(after).gameplayChanges,0);
 after.cards[0].fields.push(field('unit::/keywords/2','keywords','FLY',{type:'tokens'}));const r=compare(after);assert.equal(r.gameplayChanges,1);assert.equal(r.changes[0].category,'KEYWORDS');assert(r.changes[0].after.includes('FLY'));
});
check('composition quantities are gameplay',()=>{
 const after=clone();after.cards.find(c=>c.id==='composition').fields[1].value=20;const r=compare(after);assert.equal(r.gameplayChanges,1);assert.equal(r.changes[0].category,'COMPOSITION');assert.equal(r.changes[0].after,20);
});
check('inline members sharing a pointer keep distinct source identities',()=>{
 const before=clone(),after=clone();
 const members=[field('member-1::/sourceText','Composition','1 Prime'),field('member-2::/sourceText','Composition','4 Warriors')];
 before.cards.push(card('members','DATASHEET_SECTION','UNIT COMPOSITION',members,'unit'));
 after.cards.push(card('members','DATASHEET_SECTION','UNIT COMPOSITION',structuredClone(members),'unit'));
 after.cards.at(-1).fields[1].value='5 Warriors';
 const r=compareBookGameplay({bookId:'synthetic',before,after});assert.equal(r.gameplayChanges,1);assert.equal(r.changes[0].before,'4 Warriors');assert.equal(r.changes[0].after,'5 Warriors');
});
check('MFM model tier is named rather than showing a JSON path',()=>{
 const after=clone();after.cards.find(c=>c.id==='cost').fields[2].value=95;const r=compare(after);assert.equal(r.gameplayChanges,1);assert.equal(r.changes[0].summary,'Plague Marines · 5 models: 90 → 95');
});
check('provenance changes have one counter and no fake gameplay',()=>{
 const before=clone(),after=clone();before.cards[0].provenance={sha256:'old'};after.cards[0].provenance={sha256:'new'};
 const r=compareBookGameplay({bookId:'synthetic',before,after});assert.equal(r.gameplayChanges,0);assert.equal(r.metadataChanges,1);
 const md=renderBookUpdateReport({books:[r]});assert(md.includes('No gameplay values changed.'));assert(!md.includes('sha256'));assert(!md.includes('old'));
});
check('technical stat-labelled source pointer stays metadata',()=>{
 const before=clone(),after=clone();before.cards[1].fields.push(field('profile::/columnHeaderPointer','column Header Pointer','/before',{presentation:'stat'}));after.cards[1].fields.push(field('profile::/columnHeaderPointer','column Header Pointer','/after',{presentation:'stat'}));
 const r=compareBookGameplay({bookId:'synthetic',before,after});assert.equal(r.gameplayChanges,0);assert.equal(r.metadataChanges,1);
});
check('whitespace-only rule representation is counted without a game change',()=>{
 const after=clone();after.cards.find(c=>c.id==='rule').fields[0].value='Each time this unit\n makes an attack, add 1 to the Hit roll.';
 const r=compare(after);assert.equal(r.gameplayChanges,0);assert.equal(r.metadataChanges,1);
});
check('new unit is reported once instead of every new child field',()=>{
 const after=clone();after.cards.push(card('new-unit','DATASHEET','New Unit'),card('new-weapon','WEAPON_PROFILE','New weapon',[field('new-weapon::/attacks','Attacks','3')],'new-unit'));
 const r=compare(after);assert.equal(r.gameplayChanges,1);assert.equal(r.changes[0].kind,'ADDED');assert.equal(r.changes[0].label,'New Unit');
 const removed=compareBookGameplay({bookId:'synthetic',before:after,after:baseline});assert.equal(removed.gameplayChanges,1);assert.equal(removed.changes[0].kind,'REMOVED');
});
const mfm={version:'v1.6',captureSha256:'old',units:[{title:'PLAGUE MARINES',sourceGroup:'UNITS',status:'CURRENT',pointSchedules:[{sourceLabel:'YOUR UNIT COSTS',entries:[{sourceLabel:'5 models',minModels:5,maxModels:5,value:90}]}]}],detachments:[{title:'TEST',detachmentPoints:1,forceDispositions:['A','B'],enhancements:[{title:'Test Enhancement',value:15,qualifiers:[]}]}]};
check('complete MFM capture covers invisible source rows without duplicating cards',()=>{
 const after=clone();after.cards.find(c=>c.id==='cost').fields[2].value=95;const mfmAfter=structuredClone(mfm);mfmAfter.units[0].pointSchedules[0].entries[0].value=95;mfmAfter.captureSha256='new';
 const r=compareBookGameplay({bookId:'synthetic',before:baseline,after,mfmBefore:mfm,mfmAfter});assert.equal(r.gameplayChanges,1);assert.equal(r.changes[0].after,95);assert(r.changes[0].summary.includes('PLAGUE MARINES · 5 models: 90 → 95'));
 mfmAfter.units.push({title:'REFERENCE ONLY UNIT',sourceGroup:'LEGENDS',status:'LEGENDS',pointSchedules:[]});assert(compareBookGameplay({bookId:'synthetic',before:baseline,after,mfmBefore:mfm,mfmAfter}).changes.some(c=>c.kind==='ADDED'&&c.label==='REFERENCE ONLY UNIT'));
});
check('MFM paid equipment and Enhancement prices are separate source rows',()=>{
 const after=structuredClone(mfm);after.units[0].paidOptions=[{title:'Icon',sourceLabel:'per Icon',sourceGroup:'WARGEAR OPTIONS',value:5}];
 const before=structuredClone(after);after.units[0].paidOptions[0].value=10;after.detachments[0].enhancements[0].value=20;
 const r=compareBookGameplay({bookId:'synthetic',before:baseline,after:baseline,mfmBefore:before,mfmAfter:after});assert.equal(r.gameplayChanges,2);assert(r.changes.some(c=>c.summary==='PLAGUE MARINES · Icon · per Icon: 5 → 10'));assert(r.changes.some(c=>c.summary==='TEST · Test Enhancement · Points: 15 → 20'));
});
check('ambiguous identities and incomplete snapshots fail explicitly',()=>{
 const after=clone();after.cards.push(after.cards[0]);assert.throws(()=>compare(after),/Duplicate or missing/);
 assert.throws(()=>compareBookGameplay({bookId:'synthetic',before:baseline,after:baseline,mfmBefore:mfm}),/Both MFM snapshots/);
 assert.throws(()=>compareBookGameplay({bookId:'another-book',before:baseline,after:baseline}),/different book owners/);
 assert.throws(()=>compareBookGameplay({bookId:'synthetic',before:baseline,after:baseline,mfmBefore:null,mfmAfter:null}),/MFM report requires/);
 const ambiguous=structuredClone(mfm);ambiguous.units.push(ambiguous.units[0]);assert.throws(()=>compareBookGameplay({bookId:'synthetic',before:baseline,after:baseline,mfmBefore:ambiguous,mfmAfter:mfm}),/Ambiguous MFM source occurrence/);
});
check('comparison and rendering never mutate snapshots',()=>{
 const before=JSON.stringify(baseline),capture=JSON.stringify(mfm);compareBookGameplay({bookId:'synthetic',before:baseline,after:baseline,mfmBefore:mfm,mfmAfter:mfm});assert.equal(JSON.stringify(baseline),before);assert.equal(JSON.stringify(mfm),capture);
 const r=compare(clone());const md=renderBookUpdateReport({status:'FAIL',books:[r],generatedChanges:[{file:'books/synthetic/generated/example.json',kind:'changed'}],fallbackReason:'Uncovered input',error:'Synthetic Army: data.json: missing rule',steps:[{book:'synthetic',rebuild:'node producer.mjs',status:'FAIL',elapsedMs:1200}]});
 assert(md.includes('**FAIL**'));assert(md.includes('Synthetic Army: data.json'));assert(md.includes('Full plan selected: Uncovered input'));assert(md.includes('node producer.mjs'));assert(md.includes('1.200'));
});
console.log(JSON.stringify({status:'PASS',checks:rows.length,rows}));

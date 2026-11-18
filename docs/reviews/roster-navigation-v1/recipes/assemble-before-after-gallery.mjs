/** Offline evidence assembler. Does not launch browsers or read the repository.
 * Required: --before=<RESULTS.json or directory> --after=<RESULTS.json or directory>
 *           --out=<fresh directory>
 * Optional, repeatable: --before-extra=<report> --after-extra=<report>
 * Extra reports use {screenshots:[{book,width,stage,file,fixture?,version?}]}.
 * Arbitrary stage names, including expanded Stratagems, are retained. A stage
 * captured on only one side is explicitly shown as unpaired, never substituted.
 * Run only after the captures are finished. No third-party packages required.
 */
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';

const allowed=new Set(['before','after','out','before-extra','after-extra']);
const args=new Map();
for(let i=2;i<process.argv.length;i++){
 const token=process.argv[i];assert(token.startsWith('--'),'Expected a named argument: '+token);
 const equal=token.indexOf('='),name=token.slice(2,equal<0?undefined:equal);
 const value=equal<0?process.argv[++i]:token.slice(equal+1);
 assert(allowed.has(name),'Unknown argument: --'+name);
 assert(typeof value==='string'&&value.trim()&&!value.startsWith('--'),'Missing value for --'+name);
 const values=args.get(name)||[];values.push(value);args.set(name,values);
}
for(const name of ['before','after','out'])assert.equal(args.get(name)?.length,1,'Provide exactly one --'+name);
const out=path.resolve(args.get('out')[0]);
assert(!fs.existsSync(out),'Fresh output directory required: '+out);
const digest=bytes=>createHash('sha256').update(bytes).digest('hex');
const esc=value=>String(value??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');
const compare=(left,right)=>left<right?-1:left>right?1:0;
const books=[['death-guard','Death Guard'],['adeptus-mechanicus','Adeptus Mechanicus'],['chaos-space-marines','Chaos Space Marines'],['emperors-children',"Emperor’s Children"],['tyranids','Tyranids'],['tau-empire','T’au Empire'],['space-marines','Space Marines'],['dark-angels','Dark Angels'],['blood-angels','Blood Angels']];
const bookTitles=new Map(books),bookOrder=new Map(books.map(([id],index)=>[id,index]));
const stageOrder=stage=>stage==='attachment-setup'?0:stage==='guide'?1:stage==='units-menu'?2:stage.startsWith('physical-')?3:4;
const stageTitle=stage=>stage==='attachment-setup'?'Attachment Setup':stage==='guide'?'Personal Guide':stage==='units-menu'?'Units menu / navigation':stage.startsWith('physical-')?'Physical datasheet · '+stage.slice('physical-'.length):/strat/i.test(stage)&&/expand/i.test(stage)?'Expanded Stratagems · '+stage:stage.replaceAll('-',' ');
const reports=[],assets=new Map(),sides={before:new Map(),after:new Map()},notes=[];
const rowKey=row=>JSON.stringify([row.book,row.width,row.stage]);

for(const side of ['before','after'])for(const [index,input]of [...args.get(side),...args.get(side+'-extra')||[]].entries()){
 let file=path.resolve(input);if(fs.statSync(file).isDirectory())file=path.join(file,'RESULTS.json');
 const bytes=fs.readFileSync(file),report=JSON.parse(bytes.toString('utf8'));
 assert(Array.isArray(report.screenshots),'Expected screenshots array in '+file);
 assert(report.status!=='RUNNING','Capture must finish before assembly: '+file);
 const directory=path.dirname(file),ref=side+'-'+(index+1);
 const versions=[...new Set(report.screenshots.map(row=>row.version).filter(Boolean))];
 const identity=versions.length===1?report.identities?.[versions[0]]:null;
 reports.push({id:ref,side,file:path.basename(file),sha256:digest(bytes),captureStatus:report.status||null,
  captureStarted:report.started||null,captureFinished:report.finished||null,identity:identity?{sha:identity.sha,workingTreeClean:identity.workingTree==='',diffSha256:identity.diffSha256}:null,
  screenshots:report.screenshots.length});
 if(report.errors?.length)notes.push(ref+' reports '+report.errors.length+' application error(s).');
 if(report.missing?.length)notes.push(ref+' reports '+report.missing.length+' missing dependency request(s).');
 for(const shot of report.screenshots){
  assert(typeof shot.book==='string'&&shot.book&&Number.isSafeInteger(shot.width)&&shot.width>0&&typeof shot.stage==='string'&&shot.stage,'Invalid screenshot identity in '+file);
  assert(typeof shot.file==='string'&&shot.file&&!/^[a-z][a-z\d+.-]*:/i.test(shot.file),'Screenshot file must be a local relative path');
  const source=path.resolve(directory,shot.file),relative=path.relative(directory,source);
  assert(relative&&!relative.startsWith('..'+path.sep)&&relative!=='..'&&!path.isAbsolute(relative),'Screenshot escapes its report directory: '+shot.file);
  assert.equal(path.extname(source).toLowerCase(),'.png','Only referenced PNG assets may be copied');
  const realDirectory=fs.realpathSync(directory),realSource=fs.realpathSync(source),realRelative=path.relative(realDirectory,realSource);
  assert(realRelative&&!realRelative.startsWith('..'+path.sep)&&realRelative!=='..'&&!path.isAbsolute(realRelative),'Screenshot symlink escapes its report directory');
  const png=fs.readFileSync(source);assert(png.length>=24&&png.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])),'Invalid PNG: '+source);
  const sha256=digest(png),asset='images/'+sha256+'.png';
  if(!assets.has(sha256))assets.set(sha256,{sha256,file:asset,source,width:png.readUInt32BE(16),height:png.readUInt32BE(20),bytes:png.length});
  const id=shot.stage.startsWith('physical-')?shot.stage.slice('physical-'.length):null;
  const observation=(report.observations||[]).find(row=>row.book===shot.book&&row.width===shot.width&&(!shot.fixture||row.fixture===shot.fixture));
  const physical=id&&observation?.value?.effective?.find(unit=>unit.instanceId===id);
  const unit=id&&observation?.value?.state?.units?.find(unit=>unit.instanceId===id);
  const item={book:shot.book,width:shot.width,stage:shot.stage,fixture:shot.fixture||null,version:shot.version||null,
   sourceReport:ref,originalFile:shot.file,file:asset,sha256,imageWidth:png.readUInt32BE(16),imageHeight:png.readUInt32BE(20),
   physical:id?{instanceId:id,canonicalUnitId:physical?.canonicalUnitId||unit?.canonicalUnitId||null,title:physical?.title||null,startingStrength:physical?.startingStrength??unit?.startingStrength??null}:null};
  const key=rowKey(item),previous=sides[side].get(key);
  assert(!previous||previous.sha256===item.sha256,'Conflicting screenshots for '+side+' '+key+'; use distinct exact stages for supplementary captures');
  if(!previous)sides[side].set(key,item);
 }
}

const allKeys=[...new Set([...sides.before.keys(),...sides.after.keys()])];
const rows=allKeys.map(key=>({before:sides.before.get(key)||null,after:sides.after.get(key)||null})).sort((left,right)=>{
 const a=left.before||left.after,b=right.before||right.after;
 return (bookOrder.get(a.book)??999)-(bookOrder.get(b.book)??999)||compare(a.book,b.book)||a.width-b.width||stageOrder(a.stage)-stageOrder(b.stage)||compare(a.stage,b.stage);
});
const presentBooks=[...new Set(rows.map(row=>(row.before||row.after).book))];
const counts={before:sides.before.size,after:sides.after.size,paired:rows.filter(row=>row.before&&row.after).length,
 beforeOnly:rows.filter(row=>row.before&&!row.after).length,afterOnly:rows.filter(row=>!row.before&&row.after).length,uniquePngs:assets.size,books:presentBooks.length,rows:rows.length};
const coverage=[];
for(const book of presentBooks)for(const width of [...new Set(rows.filter(row=>(row.before||row.after).book===book).map(row=>(row.before||row.after).width))].sort((a,b)=>a-b)){
 const entries=rows.filter(row=>{const shot=row.before||row.after;return shot.book===book&&shot.width===width;});
 coverage.push({book,width,before:entries.filter(row=>row.before).length,after:entries.filter(row=>row.after).length,paired:entries.filter(row=>row.before&&row.after).length,
  beforePhysical:entries.filter(row=>row.before?.stage.startsWith('physical-')).length,afterPhysical:entries.filter(row=>row.after?.stage.startsWith('physical-')).length});
}
const figure=(shot,side)=>{
 if(!shot)return '<div class="missing"><strong>'+side+'</strong><p>No matching screenshot was captured for this exact book, width, and stage.</p></div>';
 const physical=shot.physical,asset=assets.get(shot.sha256);
 const caption=physical?[physical.title,physical.startingStrength===null?null:String(physical.startingStrength)+' model(s)',physical.instanceId,physical.canonicalUnitId].filter(Boolean).join(' · '):shot.fixture||shot.stage;
 return '<figure><figcaption><strong>'+side+'</strong><span>'+esc(caption)+'</span></figcaption><div class="image-frame"><a href="'+shot.file+'" target="_blank" rel="noopener"><img src="'+shot.file+'" width="'+asset.width+'" height="'+asset.height+'" loading="lazy" decoding="async" alt="'+esc(side+' — '+(bookTitles.get(shot.book)||shot.book)+' — '+shot.width+' pixels — '+stageTitle(shot.stage))+'"></a></div><p class="image-meta">'+asset.width+' × '+asset.height+' PNG · <a href="'+shot.file+'">Open full-resolution image</a></p></figure>';
};
const reportLine=report=>'<li><strong>'+esc(report.side==='before'?'Before':'After')+' · '+esc(report.id)+'</strong>: '+report.screenshots+' screenshots; captured status <code>'+esc(report.captureStatus||'not supplied')+'</code>'+(report.identity?'; source <code>'+esc(report.identity.sha)+'</code>; working tree '+(report.identity.workingTreeClean?'clean':'modified')+'; recorded diff SHA-256 <code>'+esc(report.identity.diffSha256)+'</code>':'')+'.</li>';
const sections=presentBooks.map(book=>{
 const group=rows.filter(row=>(row.before||row.after).book===book),widths=[...new Set(group.map(row=>(row.before||row.after).width))].sort((a,b)=>a-b);
 return '<section id="book-'+esc(book)+'"><h2>'+esc(bookTitles.get(book)||book)+'</h2>'+widths.map(width=>'<section class="viewport"><h3>'+width+' px viewport</h3>'+group.filter(row=>(row.before||row.after).width===width).map(row=>{
 const shot=row.before||row.after,pair=row.before&&row.after;
 return '<article class="capture-row"><h4>'+esc(stageTitle(shot.stage))+'</h4><p class="stage-meta">Exact stage: <code>'+esc(shot.stage)+'</code> · '+(pair?'Before and after captured':'One-sided supplementary capture')+'</p><div class="comparison">'+figure(row.before,'Before')+figure(row.after,'After')+'</div></article>';
 }).join('')+'</section>').join('')+'</section>';
}).join('');
const html='<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Roster navigation — before and after evidence</title><style>\n'+
 ':root{color-scheme:light;font-family:system-ui,sans-serif;color:#1a2430;background:#edf0f4}*{box-sizing:border-box}body{margin:0}main{max-width:1900px;margin:auto;padding:24px}h1,h2,h3,h4{line-height:1.25}h1{font-size:30px}h2{border-top:3px solid #32465d;padding-top:20px;margin-top:48px}h3{font-size:23px;margin-top:32px}h4{font-size:19px;margin:0 0 8px}p,li{line-height:1.5}a{color:#184d8b}code{font-size:.9em;overflow-wrap:anywhere}nav{display:flex;gap:8px 18px;flex-wrap:wrap;padding:16px 0}header,.capture-row{background:white;border:1px solid #c8d0da;border-radius:10px;padding:20px;margin-bottom:20px}.comparison{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:18px}figure{margin:0;min-width:0}figcaption{display:flex;flex-direction:column;gap:6px;min-height:66px;padding:10px 0;overflow-wrap:anywhere}figcaption strong{font-size:18px}.image-frame{max-height:800px;overflow:auto;border:1px solid #c0c8d2;background:#11171e}.image-frame img{display:block;width:100%;height:auto}.image-meta,.stage-meta{font-size:13px;color:#485669;margin:8px 0 16px}.missing{padding:24px;border:2px dashed #9fa9b6;background:#f4f6f9;align-self:start}.warning{padding:14px;border-left:4px solid #9c5a0f;background:#fff6e6}table{border-collapse:collapse;width:100%;font-size:14px}th,td{border:1px solid #c8d0da;text-align:left;padding:8px}th{background:#edf0f4}footer{padding:28px 0;font-size:13px;color:#485669}@media(max-width:850px){main{padding:12px}.comparison{grid-template-columns:minmax(0,1fr)}header,.capture-row{padding:14px}.image-frame{max-height:680px}h1{font-size:25px}}\n'+
 '</style></head><body><main><header><h1>Roster navigation — before and after</h1><p>Offline screenshot evidence for Personal Guide, navigation, Attachment Setup, and physical datasheets. '+counts.books+' books; '+counts.paired+' paired rows; '+counts.beforeOnly+' before-only and '+counts.afterOnly+' after-only rows. Images load lazily and can be opened at full resolution. Long screenshots scroll inside their image frames.</p><p>Rows match exact book, viewport width, and capture-stage identities. A missing counterpart remains explicit. Screenshot coverage alone does not establish gameplay correctness or performance acceptance.</p><nav aria-label="Books">'+presentBooks.map(book=>'<a href="#book-'+esc(book)+'">'+esc(bookTitles.get(book)||book)+'</a>').join('')+'</nav><details><summary>Capture provenance and coverage</summary><ul>'+reports.map(reportLine).join('')+'</ul>'+notes.map(note=>'<p class="warning">'+esc(note)+'</p>').join('')+'<table><thead><tr><th>Book</th><th>Viewport</th><th>Before</th><th>After</th><th>Paired</th><th>Before physical cards</th><th>After physical cards</th></tr></thead><tbody>'+coverage.map(row=>'<tr><td>'+esc(bookTitles.get(row.book)||row.book)+'</td><td>'+row.width+' px</td><td>'+row.before+'</td><td>'+row.after+'</td><td>'+row.paired+'</td><td>'+row.beforePhysical+'</td><td>'+row.afterPhysical+'</td></tr>').join('')+'</tbody></table></details></header>'+sections+'<footer>Only PNGs referenced by the supplied capture reports are included. No network assets, application runtime, scripts, or RAW source files are bundled. Asset integrity and row mappings are listed in <a href="GALLERY_INDEX.json">GALLERY_INDEX.json</a>.</footer></main></body></html>\n';

// Validate every input before creating the new output directory. No deletion or
// cleanup operation is needed: callers must choose a fresh output location.
fs.mkdirSync(path.join(out,'images'),{recursive:true});
for(const asset of [...assets.values()].sort((a,b)=>compare(a.sha256,b.sha256)))fs.copyFileSync(asset.source,path.join(out,asset.file));
const manifest={schema:'roster-navigation-offline-gallery/v1',title:'Roster navigation — before and after',counts,reports,coverage,notes,
 rows:rows.map(row=>({book:(row.before||row.after).book,width:(row.before||row.after).width,stage:(row.before||row.after).stage,...row})),
 assets:[...assets.values()].sort((a,b)=>compare(a.sha256,b.sha256)).map(({source,...asset})=>asset)};
fs.writeFileSync(path.join(out,'index.html'),html,'utf8');
fs.writeFileSync(path.join(out,'GALLERY_INDEX.json'),JSON.stringify(manifest,null,2)+'\n','utf8');
console.log(JSON.stringify({status:'ASSEMBLED',out,html:path.join(out,'index.html'),...counts}));

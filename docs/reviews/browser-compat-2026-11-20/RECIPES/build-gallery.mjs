/** Optional local HTML over existing screenshots; no image edits/browser run. */
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';

const out=fileURLToPath(new URL('../',import.meta.url));
const escape=value=>String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
const image=(file,label)=>{
 assert(fs.statSync(path.join(out,file)).isFile(),'Missing existing screenshot: '+file);
 return '<figure><figcaption>'+escape(label)+'</figcaption><a href="'+escape(file)+'"><img loading="lazy" src="'+escape(file)+'" alt="'+escape(label)+'"></a></figure>';
};
const sections=[];
for(const [lane,title]of [['home','Cold Home'],['roster-dg','Saved DG owner v37.25 roster'],['roster-sm','Saved SM roster']]){
 sections.push('<section><h2>'+title+'</h2><p>390px screenshots from the recorded measured sample. See PERFORMANCE.json for all three samples per revision.</p><div class="pair">'+
  image('performance-'+lane+'-base-390.png','Accepted baseline 9876164d')+
  image('performance-'+lane+'-head-390.png','Feature b0aa1273')+'</div></section>');
}
for(const width of [390,1440])for(const [book,title]of [['death-guard','Death Guard'],['space-marines','Space Marines']]){
 sections.push('<section><h2>'+title+' old-release update — '+width+'px</h2><div class="triple">'+
  image('update-path/'+width+'-old-'+book+'.jpg','Saved roster on old release 1fd0b279')+
  image('update-path/'+width+'-new-'+book+'.jpg','Same saved roster after automatic update')+
  image('update-path/'+width+'-offline-'+book+'.jpg','Reopened offline after update')+'</div></section>');
}
const html='<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Browser compatibility review gallery</title>'+
 '<style>body{margin:24px;max-width:2000px;background:#151714;color:#eee;font:16px/1.5 system-ui}a{color:#dac581}section{border-top:1px solid #666;padding:24px 0}.pair,.triple{display:grid;gap:20px;align-items:start}.pair{grid-template-columns:repeat(2,minmax(250px,1fr))}.triple{grid-template-columns:repeat(3,minmax(250px,1fr))}figure{margin:0}figcaption{font-weight:bold;margin-bottom:10px}img{width:100%;height:auto;display:block}@media(max-width:900px){.pair,.triple{display:block}figure{margin-bottom:24px}}</style>'+
 '<h1>Browser compatibility review</h1><p>Existing performance and real old-release update screenshots. No network connection is needed. Click a picture for its original size. These are Chromium observations, not physical old-browser certification.</p>'+
 '<p><a href="REPORT.md">Report</a></p>'+sections.join('\n')+'</html>\n';
fs.writeFileSync(path.join(out,'GALLERY.html'),html);
console.log(JSON.stringify({status:'PASS',gallery:path.join(out,'GALLERY.html'),screenshots:6+12,browserOrImageEdits:false}));

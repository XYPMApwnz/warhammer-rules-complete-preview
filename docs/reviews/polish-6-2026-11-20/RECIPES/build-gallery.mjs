import fs from 'node:fs';
import path from 'node:path';
const out='E:/Warhammer/qa-evidence/polish-6-v1-2026-11-20';
const rows=[
 ['Home sources','library-sources','home-sources'],
 ['Army Book sources','library-sources','death-guard-sources'],
 ['Chaos Rhino: Use model base','library-sources','chaos-space-marines-model-base'],
 ['Owner v37.25: informational DP comparison','import-notices','death-guard-owner-dp'],
 ['Recognized Force Disposition outside selected Detachments','import-notices','death-guard-disposition-note'],
 ['Tau: common numeric points summary','import-notices','tau-summary'],
];
const esc=value=>String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
fs.mkdirSync(out+'/gallery',{recursive:true});
const sections=rows.map(([title,folder,name],index)=>{
 const pictures=[390,1440].map(width=>{
  const file=`${width}-${name}.png`;fs.copyFileSync(path.join(out,folder,file),path.join(out,'gallery',file));
  return `<figure><figcaption>${width}px</figcaption><a href="gallery/${esc(file)}"><img src="gallery/${esc(file)}" alt="${esc(title)} at ${width}px" loading="lazy"></a></figure>`;
 }).join('');
 return `<section id="case-${index+1}"><h2>${esc(title)}</h2><div class="pair">${pictures}</div></section>`;
}).join('\n');
fs.writeFileSync(out+'/GALLERY.html',`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Polish 6 review gallery</title><style>body{margin:24px;max-width:1800px;font:16px/1.5 system-ui;background:#151714;color:#eee}a{color:#dac581}h1,h2{line-height:1.2}section{border-top:1px solid #666;padding:24px 0}.pair{display:grid;grid-template-columns:minmax(250px,390px) minmax(400px,1fr);gap:24px;align-items:start}figure{margin:0}figcaption{font-weight:bold;padding-bottom:8px}img{display:block;width:100%;height:auto}nav a{display:block}@media(max-width:850px){.pair{display:block}figure{margin-bottom:20px}}</style><h1>Polish 6 review gallery</h1><p>Local, self-contained screenshots. Open a picture for its original size. No internet connection is required.</p><nav>${rows.map(([title],index)=>`<a href="#case-${index+1}">${esc(title)}</a>`).join('')}</nav>${sections}</html>\n`);
console.log(JSON.stringify({gallery:out+'/GALLERY.html',screenshots:rows.length*2}));

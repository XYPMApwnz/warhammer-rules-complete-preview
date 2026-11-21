import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import {createQaEvidenceDir} from '../../../tests/helpers/qa-temp.mjs';

const root=fileURLToPath(new URL('../../../',import.meta.url));
export const retiredFaqAnchor='core-rule-18-03-disembarking--core-faq-waha-050';
const currentFaqAnchor='core-rule-18-07-shock-disembark-move--core-faq-waha-050';
const expectedTerms=['core-rule-18-04-disembark-move','core-rule-18-05-emergency-disembark-move','core-rule-18-07-shock-disembark-move'];

export function assertNoRetiredFaqURL(text,label){
 let decoded=String(text).replace(/&#(?:x2d|45);/gi,'-').replace(/\\u002d/gi,'-');
 for(let i=0;i<3;i++){
  assert(!decoded.includes(retiredFaqAnchor),'Retired FAQ050 URL must redirect to18.07: '+label);
  try{const next=decodeURIComponent(decoded);if(next===decoded)break;decoded=next;}catch{break;}
 }
}

function panel(html,id){
 const opening=[...html.matchAll(/<aside\b[^>]*\bid="([^"]+)"[^>]*\bdata-faq-id="core-faq-waha-050"[^>]*>/g)];
 assert.equal(opening.length,1,'FAQ050 must appear exactly once in '+id);
 assert.equal(opening[0][1],id,'FAQ050 has the wrong physical rule owner');
 const start=opening[0].index,end=html.indexOf('</aside>',start);
 assert(end>start,'Missing FAQ050 closing panel');
 const text=html.slice(start,end);
 for(const target of expectedTerms)assert.equal([...text.matchAll(new RegExp('data-term="'+target+'"','g'))].length,1,'FAQ050 lost or duplicated its button '+target);
 return {id,terms:expectedTerms};
}

export function auditFaq050Publication(repo=root){
 const manifest=JSON.parse(fs.readFileSync(path.join(repo,'tools/pages-runtime-manifest.json')));
 const tracked=execFileSync('git',['ls-files','--cached','--others','--exclude-standard','-z'],{cwd:repo,encoding:'utf8'}).split('\0').filter(Boolean);
 const publicBooks='(?:adeptus-mechanicus|blood-angels|chaos-space-marines|dark-angels|death-guard|emperors-children|space-marines|tau-empire|tyranids)';
 const output=new RegExp('^books/'+publicBooks+'/v2/generated/');
 const checked=[...new Set([...manifest.files.map(row=>row.path),...tracked.filter(file=>output.test(file)||file.startsWith('books/core-rules/reader/')||file.startsWith('glossary/v2/generated/'))])]
  .filter(file=>/\.(?:html|json|mjs|js)$/.test(file)).sort();
 for(const file of checked)assertNoRetiredFaqURL(fs.readFileSync(path.join(repo,file),'utf8'),file);
 const panels=[panel(fs.readFileSync(path.join(repo,'books/core-rules/reader/transports.html'),'utf8'),currentFaqAnchor),
  panel(fs.readFileSync(path.join(repo,'books/core-rules/reader/index.html'),'utf8'),'core-faq-waha-050')];
 // The reader's serialized search destinations are saved URLs too.
 const search=JSON.parse(fs.readFileSync(path.join(repo,'books/core-rules/reader/search-index.json')));
 assert.equal(search.filter(row=>row.url==='index.html#core-faq-waha-050').length,1,'FAQ050 must have one canonical search URL');
 return {checked,panels,canonicalSearchURL:'index.html#core-faq-waha-050',retiredURLReferences:0};
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const out=createQaEvidenceDir('core-faq-anchor-'),result=auditFaq050Publication();
 const percentEncoded=[...retiredFaqAnchor].map(char=>'%'+char.charCodeAt(0).toString(16)).join('');
 for(const text of ['transports.html#'+retiredFaqAnchor,percentEncoded,retiredFaqAnchor.replaceAll('-','\\u002d')])
  assert.throws(()=>assertNoRetiredFaqURL(text,'synthetic saved reader URL'),/Retired FAQ050 URL/);
 const report={status:'PASS',...result,negativeControls:3};
 fs.writeFileSync(path.join(out,'RESULTS.json'),JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify({status:'PASS',files:result.checked.length,panels:result.panels.length,negativeControls:3,evidence:out}));
}

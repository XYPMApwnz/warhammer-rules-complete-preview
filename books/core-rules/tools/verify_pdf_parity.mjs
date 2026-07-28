import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
import {recordText} from '../content/record-content.mjs';

export function normalizeOfficialText(value){
  return String(value||'').normalize('NFKC').toLowerCase().replace(/e\.g\./g,'for example').replace(/[^a-z0-9]+/g,'');
}

export function verifyPdfParity(pdf,digital){
  const official=Object.values(pdf.rules).flat();
  const digitalByCode=new Map(digital.records.map(rule=>[rule.code,rule]));
  const report={verifiedNormalized:[],digitalExtension:[],requiresStructuralComparison:[],missing:[]};
  const pages=new Map();
  for(const rule of official){
    pages.set(rule.code,rule.page);
    const candidate=digitalByCode.get(rule.code);
    if(!candidate){report.missing.push(rule.code);continue;}
    const officialText=normalizeOfficialText(rule.text),digitalText=normalizeOfficialText(recordText(candidate));
    if(officialText.includes(digitalText))report.verifiedNormalized.push(rule.code);
    else if(digitalText.includes(officialText))report.digitalExtension.push(rule.code);
    else report.requiresStructuralComparison.push(rule.code);
  }
  return {...report,pages,verifiedCodes:new Set(report.verifiedNormalized)};
}

if(process.argv[1]===fileURLToPath(import.meta.url)){
  const bookRoot=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
  const context={window:{}};
  vm.runInNewContext(fs.readFileSync(path.join(bookRoot,'content','core-rules.source.en.js'),'utf8'),context);
  const digital=JSON.parse(fs.readFileSync(path.join(bookRoot,'content','core-rules.digital-11e.json'),'utf8'));
  const report=verifyPdfParity(context.window.CORE_PDF_SOURCE,digital);
  console.log(`Verified normalized: ${report.verifiedNormalized.length}`);
  console.log(`Digital extension: ${report.digitalExtension.length}`);
  console.log(`Requires structural comparison: ${report.requiresStructuralComparison.length}`);
  console.log('Explicit exception: 0');
  console.log(`Missing: ${report.missing.length}`);
}

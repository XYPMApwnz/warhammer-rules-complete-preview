/** Closure evidence is linked to the exact reviewed source and clause.
 * This verifies declared evidence identity/shape, not whether a test was run.
 */
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';

const nonempty=value=>typeof value==='string'&&value.trim().length>0;
const strings=value=>Array.isArray(value)&&value.length>0&&value.every(nonempty)&&new Set(value).size===value.length;
const sameSet=(left,right)=>strings(left)&&strings(right)&&left.length===right.length&&left.every(value=>right.includes(value));
const sourcePath=value=>Array.isArray(value)&&value.length>0&&value.every(part=>nonempty(part)||Number.isSafeInteger(part)&&part>=0);
const within=(root,file)=>{
 const relative=path.relative(root,file);
 return relative!==''&&!path.isAbsolute(relative)&&relative!=='..'&&!relative.startsWith('..'+path.sep);
};
const exactLiteral=(text,value)=>['"',"'",'`'].some(quote=>text.includes(quote+value+quote));

function evidenceFile(root,relative){
 if(!nonempty(root)||!nonempty(relative)||relative.includes('\\')||relative.includes('\0')||
  path.isAbsolute(relative)||path.win32.isAbsolute(relative)||relative.split('/').some(part=>!part||part==='.'||part==='..'))return null;
 const actualRoot=fs.realpathSync(root),file=path.resolve(actualRoot,relative);
 if(!within(actualRoot,file)||!fs.statSync(file).isFile())return null;
 const actualFile=fs.realpathSync(file);
 // A valid-looking repository path must not follow a symlink/junction outside it.
 if(!within(actualRoot,actualFile))return null;
 return actualFile;
}

function fixtureClauses(evidence,row){
 const reviewed=row.clauseIds||row.proof?.clauseIds;
 if(!strings(reviewed))return null;
 if(evidence.clauseIds===undefined)return reviewed;
 return strings(evidence.clauseIds)&&evidence.clauseIds.every(id=>reviewed.includes(id))?evidence.clauseIds:null;
}

function recipientFixture(document,{evidence,row,canonicalId}){
 if(document?.schema!=='recipient-enrollment-qa/v1'||document.bookId!==row.book)return false;
 const expected=fixtureClauses(evidence,row);if(!expected)return false;
 if(evidence.identity===row.id||evidence.identity===canonicalId){
  if(!Array.isArray(document.records))return false;
  return expected.every(clauseId=>{
   const matches=document.records.filter(record=>record?.ruleId===canonicalId&&record.clauseId===clauseId);
   return matches.length===1&&matches[0].kind==='RECORDED'&&nonempty(matches[0].quote)&&sourcePath(matches[0].sourcePath);
  });
 }
 // Only the actual source-bound browser-case ID format is accepted. A common
 // word elsewhere in the fixture cannot become evidence for an unrelated rule.
 const prefix=row.book+':'+canonicalId+':';
 if(!evidence.identity.startsWith(prefix)||evidence.identity.length===prefix.length||!Array.isArray(document.browserCases))return false;
 const matches=document.browserCases.filter(record=>record?.id===evidence.identity);
 if(matches.length!==1)return false;
 const record=matches[0];
 return record.book===row.book&&record.canonical?.ruleId===canonicalId&&
  sameSet(record.clauseIds,expected)&&sourcePath(record.canonical.sourcePath)&&
  nonempty(record.canonical.text)&&typeof record.expectedAttached==='boolean';
}

/** Unknown evidence formats deliberately fail closed; add a reviewed adapter
 * rather than treating arbitrary files containing an identity as fixtures.
 */
export function verifyMarkupEvidence({root,evidence,row}={}){
 try{
  if(!row||!nonempty(row.book)||!nonempty(row.id)||!evidence||!nonempty(evidence.identity)||
   !['test','fixture','source'].includes(evidence.kind))return false;
  const canonicalId=row.sourceEntityId||row.id;
  if(!nonempty(canonicalId))return false;
  if(canonicalId!==row.id&&!row.id.startsWith(canonicalId+'#')&&!row.id.startsWith(canonicalId+':'))return false;
  const file=evidenceFile(root,evidence.path);if(!file)return false;
  const text=fs.readFileSync(file,'utf8').replace(/^\uFEFF/,'');
  if(evidence.kind==='source'){
   if(evidence.identity!==row.id||path.extname(file)!=='.json')return false;
   const document=JSON.parse(text);
   if(document.schema!=='markup-retirement-review/v1'||!Array.isArray(document.records))return false;
   const matches=document.records.filter(record=>record.book===row.book&&record.id===row.id);
   if(matches.length!==1)return false;
   const record=matches[0],accepted=record.acceptedSource;
   if(record.sourceEntityId!==canonicalId||record.previousSourceFingerprint!==row.sourceFingerprint||!nonempty(record.reason)||
    !accepted||!nonempty(accepted.document)||!new RegExp('^books/'+row.book+'/(?:v2/)?sources/').test(accepted.document)||
    !/^[a-f0-9]{64}$/.test(accepted.sha256))return false;
   const source=evidenceFile(root,accepted.document);
   return Boolean(source)&&createHash('sha256').update(fs.readFileSync(source)).digest('hex')===accepted.sha256;
  }
  if(evidence.kind==='test'){
   if(evidence.identity!==row.id&&evidence.identity!==canonicalId)return false;
   // These are the existing source-bound QA module forms, not arbitrary prose.
   if(!/(?:^|[-_.])(?:qa|test|spec)(?:[.-]|$)/i.test(path.basename(file))||!['.mjs','.js','.cjs','.py'].includes(path.extname(file)))return false;
   return exactLiteral(text,canonicalId)&&/\bassert(?:\s*\(|\.)/.test(text);
  }
  if(path.extname(file)!=='.json')return false;
  return recipientFixture(JSON.parse(text),{evidence,row,canonicalId});
 }catch{
  return false;
 }
}

/** Real closure linkage plus independent unrelated/forged evidence controls. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {verifyMarkupEvidence} from '../tools/markup-census/evidence.mjs';
import {createQaTempDir,cleanupQaTempDir} from './helpers/qa-temp.mjs';

const root=fileURLToPath(new URL('../',import.meta.url));
const ruleId='detachment-flyblown-host:enhancement:1',clauseId='wound-reroll';
const caseId='death-guard:detachment-flyblown-host:enhancement:1:28';
const row={book:'death-guard',id:ruleId,sourceEntityId:ruleId,clauseIds:[clauseId]};
const fixturePath='books/death-guard/v2/recipient-enrollment-qa.json';
const fixture=JSON.parse(fs.readFileSync(path.join(root,fixturePath),'utf8'));
const cases=fixture.browserCases.filter(record=>record.id===caseId);
assert.equal(cases.length,1,'The approved physical source fixture is unique');
assert.equal(cases[0].canonical.ruleId,ruleId);
assert.deepEqual(cases[0].clauseIds,[clauseId]);
assert.equal(cases[0].expectedAttached,true,'The closure fixture now requires the text');
const controls=[];
const check=(name,expected,{evidence,context=row,atRoot=root})=>{
 assert.equal(verifyMarkupEvidence({root:atRoot,evidence,row:context}),expected,name);
 controls.push({name,status:'PASS'});
};
const realFixture={kind:'fixture',path:fixturePath,identity:caseId};
check('approved native source test',true,{evidence:{kind:'test',path:'books/death-guard/v2/insectile-recipient-qa.mjs',identity:ruleId}});
check('approved browser source test',true,{evidence:{kind:'test',path:'v2/markup-insectile-browser-qa.mjs',identity:ruleId}});
check('approved exact browser fixture and clause',true,{evidence:realFixture});
check('approved exact source recipient record',true,{evidence:{...realFixture,identity:ruleId}});
check('unrelated canonical-owner context cannot retarget closure',false,{evidence:{...realFixture,identity:ruleId},context:{...row,id:'different-census-rule'}});
check('unrelated real test with common-word identity',false,{evidence:{kind:'test',path:'tests/markup-census-qa.mjs',identity:'assert'}});
check('unrelated fixture common-word identity',false,{evidence:{...realFixture,identity:'RECORDED'}});
check('existing fixture cannot prove another clause',false,{evidence:realFixture,context:{...row,clauseIds:['not-the-reviewed-clause']}});
check('missing exact decision clause context',false,{evidence:realFixture,context:{book:row.book,id:ruleId,sourceEntityId:ruleId}});
check('reviewed fixture subset accepted explicitly',true,{evidence:{...realFixture,clauseIds:[clauseId]},context:{...row,clauseIds:[clauseId,'another-reviewed-clause']}});
check('unreviewed fixture subset rejected',false,{evidence:{...realFixture,clauseIds:['unreviewed-clause']}});
check('fixture cannot cover omitted decision clause implicitly',false,{evidence:realFixture,context:{...row,clauseIds:[clauseId,'another-reviewed-clause']}});
check('unknown evidence kind',false,{evidence:{...realFixture,kind:'unreviewed'}});
check('missing evidence file',false,{evidence:{...realFixture,path:'tests/missing-markup-evidence-fixture.json'}});
check('lexical path escape',false,{evidence:{...realFixture,path:'../recipient-enrollment-qa.json'}});
check('absolute evidence path',false,{evidence:{...realFixture,path:path.join(root,fixturePath)}});

const arena=createQaTempDir('markup-evidence-qa-'),isolated=path.join(arena,'repository');
try{
 fs.mkdirSync(isolated);
 const write=(name,value)=>{
  fs.writeFileSync(path.join(isolated,name),typeof value==='string'?value:JSON.stringify(value));return name;
 };
 const forged=mutate=>{
  const document={schema:fixture.schema,bookId:fixture.bookId,browserCases:[structuredClone(cases[0])]};
  mutate(document);return {kind:'fixture',path:write('forged-fixture.json',document),identity:caseId};
 };
 check('source-linked identity cannot hide a different canonical rule',false,{atRoot:isolated,evidence:forged(document=>{document.browserCases[0].canonical.ruleId='unrelated-rule';})});
 check('same rule but wrong exact clause',false,{atRoot:isolated,evidence:forged(document=>{document.browserCases[0].clauseIds=['different-clause'];})});
 check('duplicate browser-case identity',false,{atRoot:isolated,evidence:forged(document=>{document.browserCases.push(structuredClone(document.browserCases[0]));})});
 check('unknown fixture schema cannot close debt',false,{atRoot:isolated,evidence:forged(document=>{document.schema='unreviewed-fixture/v1';})});
 check('fixture without source text cannot close debt',false,{atRoot:isolated,evidence:forged(document=>{delete document.browserCases[0].canonical.text;})});
 check('fixture without exact source field cannot close debt',false,{atRoot:isolated,evidence:forged(document=>{document.browserCases[0].canonical.sourcePath=[];})});
 const unrelated=write('unrelated-qa.mjs',"import assert from 'node:assert/strict';\nassert.equal('unrelated-rule','unrelated-rule');\n");
 check('valid test form still needs the exact canonical rule',false,{atRoot:isolated,evidence:{kind:'test',path:unrelated,identity:ruleId}});
 const noTest=write('source-qa.mjs',`export const source=${JSON.stringify(ruleId)};\n`);
 check('a source constant alone is not a test witness',false,{atRoot:isolated,evidence:{kind:'test',path:noTest,identity:ruleId}});
 const literal=write('exact-qa.mjs',`import assert from 'node:assert/strict';\nassert.equal(${JSON.stringify(ruleId)},${JSON.stringify(ruleId)});\n`);
 check('exact literal witness is linked without executing it',true,{atRoot:isolated,evidence:{kind:'test',path:literal,identity:ruleId}});
 const document='books/death-guard/sources/retirement-control.txt',acceptedBytes=Buffer.from('Accepted replacement source in this isolated control.\n');
 fs.mkdirSync(path.dirname(path.join(isolated,document)),{recursive:true});fs.writeFileSync(path.join(isolated,document),acceptedBytes);
 const prior='a'.repeat(64),retirement={schema:'markup-retirement-review/v1',records:[{book:row.book,id:row.id,sourceEntityId:row.sourceEntityId,
  previousSourceFingerprint:prior,reason:'The accepted replacement source explicitly retires this exact source owner.',
  acceptedSource:{document,sha256:createHash('sha256').update(acceptedBytes).digest('hex')}}]};
 const retirementFile=write('retirement.json',retirement),retirementEvidence={kind:'source',path:retirementFile,identity:ruleId};
 check('retirement review pins prior identity and accepted source bytes',true,{atRoot:isolated,context:{...row,sourceFingerprint:prior},evidence:retirementEvidence});
 check('retirement cannot target a different prior fingerprint',false,{atRoot:isolated,context:{...row,sourceFingerprint:'b'.repeat(64)},evidence:retirementEvidence});
 fs.appendFileSync(path.join(isolated,document),'tampered source');
 check('retirement source bytes cannot be substituted',false,{atRoot:isolated,context:{...row,sourceFingerprint:prior},evidence:retirementEvidence});
 const outside=path.join(arena,'outside');fs.mkdirSync(outside);
 fs.copyFileSync(path.join(isolated,literal),path.join(outside,literal));
 fs.symlinkSync(outside,path.join(isolated,'linked'),'junction');
 check('junction evidence cannot escape the repository',false,{atRoot:isolated,evidence:{kind:'test',path:'linked/'+literal,identity:ruleId}});
}finally{
 cleanupQaTempDir(arena);
}
console.log(JSON.stringify({status:'PASS',controls}));

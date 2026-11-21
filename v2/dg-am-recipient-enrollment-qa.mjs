/** Scoped DG/AM recipient enrollment invariants and execution parity.
 * Run after the browser census with --browser=<results.json>. The baseline is
 * the owner's accepted commit; fixtures are QA evidence, not factual owners. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {parseSourceFixtureJSON} from '../tests/helpers/source-refs-fixtures.mjs';
import {createQaEvidenceDir} from '../tests/helpers/qa-temp.mjs';
import {validateBookRecipients} from '../books/shared/rule-contract-v2/recipients.mjs';
import {createDGRosterRuntime} from '../books/death-guard/v2/roster-boot.mjs';
import {createAdMechRosterRuntime} from '../books/adeptus-mechanicus/v2/roster-runtime.mjs';
const gitRoot=fileURLToPath(new URL('../',import.meta.url)),BASE='3bb12ef850a477fde6b78df40e7644646c9304c6';
const option=name=>process.argv.find(arg=>arg.startsWith(name+'='))?.slice(name.length+1);
const root=path.resolve(option('--root')||gitRoot);
const out=createQaEvidenceDir('dg-am-recipient-parity-'),report={baseline:BASE,books:[],snapshots:0,negativeControls:0};
const names={'death-guard':'rule-contract-effective','adeptus-mechanicus':'roster-runtime'};
const loaded=new Map(),at=(value,parts)=>parts.reduce((v,k)=>v?.[k],value);
for(const [bookId,name]of Object.entries(names)){
 const fixturePath=path.join(root,'books',bookId,'v2/recipient-enrollment-qa.json');if(!fs.existsSync(fixturePath))continue;
 const cases=JSON.parse(fs.readFileSync(fixturePath)),relative=`books/${bookId}/v2/generated/${name}.json`;
 const baselineBytes=execFileSync('git',['show',BASE+':'+relative],{cwd:gitRoot,encoding:'utf8',maxBuffer:128*1024*1024}),featureBytes=fs.readFileSync(path.join(root,relative),'utf8');
 const before=parseSourceFixtureJSON(baselineBytes),after=parseSourceFixtureJSON(featureBytes);
 const rawAfter=new Map(JSON.parse(featureBytes).entities.map(entity=>[entity.id,entity]));
 for(const entity of JSON.parse(baselineBytes).entities.filter(entity=>entity.kind==='STRATAGEM'||entity.ruleContract?.kind==='STRATAGEM'))assert.equal(JSON.stringify(rawAfter.get(entity.id)),JSON.stringify(entity),'Serialized Stratagem entity bytes unchanged');
 validateBookRecipients(after);loaded.set(bookId,{before,after});
 const old=new Map(before.entities.map(e=>[e.id,e])),current=new Map(after.entities.map(e=>[e.id,e]));
 assert.deepEqual([...old.keys()],[...current.keys()],'Canonical entities/order unchanged');
 const expected=new Set(cases.records.map(row=>row.ruleId+'\0'+row.clauseId));let n0=0,n1=0,recorded=0,stratagems=0;
 for(const [id,e]of old){
  const other=current.get(id);assert.deepEqual(other.data,e.data,id+': original gameplay/text facts');
  if(e.kind==='STRATAGEM'||e.ruleContract?.kind==='STRATAGEM'){assert.equal(JSON.stringify(other),JSON.stringify(e),'Stratagem bytes');stratagems++;continue;}
  if(!e.ruleContract)continue;
  for(const key of Object.keys(e.ruleContract).filter(key=>key!=='clauses'))assert.deepEqual(other.ruleContract[key],e.ruleContract[key],id+': contract '+key);
  for(const c of e.ruleContract.clauses){
   const d=other.ruleContract.clauses.find(row=>row.id===c.id);assert.ok(d,'Preserved clause identity');
   for(const key of ['rosterClassification','rosterEffects','conditionalPolicy','f1RecipientIds','conditions','executionMode','effect','semanticEffects'])assert.deepEqual(d[key],c[key],id+'/'+c.id+': '+key);
   for(const role of c.roles||[]){
    const retained=d.roles.find(row=>row.id===role.id);assert.ok(retained,'Existing role retained');
    for(const key of Object.keys(role).filter(key=>!['purpose','binding','scope','evidence'].includes(key)))assert.deepEqual(retained[key],role[key],id+'/'+c.id+': original role '+role.id+'/'+key);
    if(role.binding!==undefined)assert.equal(retained.binding,role.binding,'Existing source binding retained');
    if(role.scope!==undefined)assert.equal(retained.scope,role.scope,'Existing explicit scope retained');
    if(role.purpose!==undefined)assert.equal(retained.purpose,role.purpose,'Actor/target purpose retained');
   }
   const ids=[...(c.f1RecipientIds||[]),...c.rosterEffects.flatMap(effect=>effect.recipientIds||[effect.recipientId]),...(c.conditionalPolicy?[c.conditionalPolicy.recipientId]:[])];
   for(const rid of ids)assert.deepEqual(d.recipients.find(r=>r.id===rid),c.recipients.find(r=>r.id===rid),'Executable/policy/F1 address unchanged');
   if(!expected.has(id+'\0'+c.id))assert.deepEqual(d,c,'Unregistered clause change '+id+'/'+c.id);
   n0+=c.recipientStatus==='NOT_RECORDED';n1+=d.recipientStatus==='NOT_RECORDED';recorded+=c.recipientStatus==='NOT_RECORDED'&&d.recipientStatus==='RECORDED';
  }
 }
 for(const row of cases.records){
  const entity=current.get(row.ruleId),clause=entity.ruleContract.clauses.find(c=>c.id===row.clauseId);
  assert.equal(clause.recipientStatus,'RECORDED');assert.ok(at(entity.data,row.sourcePath).includes(row.quote),'Exact reviewed source quote');
  assert.ok(clause.recipients.some(recipient=>recipient.roleId||recipient.scope==='FORMED'),'Real participant/address');
 }
 for(const row of cases.deferred)assert.equal(current.get(row.ruleId).ruleContract.clauses.find(c=>c.id===row.clauseId).recipientStatus,'NOT_RECORDED','Deferred clause remains unrecorded');
 const candidate=structuredClone(after),r=candidate.entities.find(e=>cases.records.some(x=>x.ruleId===e.id)&&e.ruleContract.clauses.some(c=>c.recipients?.some(r=>r.purpose==='EFFECT_RECIPIENT')));
 if(r){const c=r.ruleContract.clauses.find(c=>c.recipients?.some(r=>r.purpose==='EFFECT_RECIPIENT')),receiver=c.recipients.find(r=>r.purpose==='EFFECT_RECIPIENT');receiver.roleId='unresolved-mutated-role';assert.throws(()=>validateBookRecipients(candidate));report.negativeControls++;}
 const orphan=structuredClone(after),host=orphan.entities.find(e=>e.id===cases.records[0].ruleId).ruleContract.clauses.find(c=>c.id===cases.records[0].clauseId);
 host.recipients.push({id:'qa-orphan',who:'UNIT',side:'FRIENDLY',from:'SOURCE_UNIT',how:'ROSTER'});
 assert.throws(()=>validateBookRecipients(orphan),/orphan recipient declaration/);report.negativeControls++;
 report.books.push({bookId,beforeNotRecorded:n0,recorded,remainingNotRecorded:n1,reviewed:cases.records.length,stratagems,status:'PASS'});
}
if(option('--browser')||option('--states')){
 // --states checks execution independently, including captures made before a
 // presentation assertion failed. It never certifies that browser assertion.
 const observed=JSON.parse(fs.readFileSync(option('--browser')||option('--states'),'utf8'));
 if(option('--browser'))assert.equal(observed.status,'PASS','Browser census must pass');
 report.browserInputStatus=observed.status;
 const factories=new Map([
  ['death-guard',createDGRosterRuntime],
  ['adeptus-mechanicus',book=>createAdMechRosterRuntime(book,JSON.parse(fs.readFileSync(path.join(root,'books/adeptus-mechanicus/v2/roster-import-aliases.json'),'utf8')))]
 ]),runtimes=new Map();
 for(const sample of observed.snapshots){
  // Use the real book entry points on both sides, including DG's schema and
  // AM's reviewed equipment caption bindings. No generic evaluator substitute.
  if(!runtimes.has(sample.book)){const {before,after}=loaded.get(sample.book);runtimes.set(sample.book,[before,after].map(factories.get(sample.book)));}
  const outputs=runtimes.get(sample.book).map(runtime=>{runtime.load(sample.state);return runtime.projection;});
  assert.deepEqual(outputs[1],outputs[0],sample.id+': complete execution, statistics, effects and conditional rows');report.snapshots++;
  if(report.snapshots%10===0)console.log('Execution parity '+report.snapshots+'/'+observed.snapshots.length);
 }
 assert.ok(report.snapshots,'Real browser roster snapshots are required');
}else assert.ok(process.argv.includes('--static-only'),'Pass --browser=<results.json> or explicit --static-only');
report.status='PASS';fs.writeFileSync(path.join(out,'RESULTS.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({...report,out}));

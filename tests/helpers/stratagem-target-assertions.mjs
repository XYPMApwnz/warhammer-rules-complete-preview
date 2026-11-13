/** Literal TARGET enrollment and unchanged prior-contract controls. */
import fs from 'node:fs';import assert from 'node:assert/strict';import {createHash} from 'node:crypto';
import {parseProducerJSON,prepareSourceProducer} from '../../books/shared/source-refs-v2/producer-io.mjs';
import {recordReviewedStratagemTargets} from '../../books/shared/rule-contract-v2/reviewed-stratagem-targets.mjs';
import {verifyAcceptedMfmHistory} from './accepted-mfm-history.mjs';
import {currentMfmContractExpectation} from './current-mfm-contract.mjs';
import {getCurrentMfmSource} from '../../mfm/content/current-mfm-release.mjs';
import {createEffectiveMfmCatalog} from '../../mfm/content/effective-mfm-catalog.mjs';
import {readOfficialUpdates} from '../../books/shared/official-updates-v1/book.mjs';
import {assertCurrentGwContracts} from './current-gw-contract.mjs';
const hash=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
function priorContracts(book,expected){
 const restored=[];
 for(const entity of book.entities.filter(e=>e.ruleContract)){
  const c=structuredClone(entity.ruleContract),prior=expected.contractSourceFields[c.ruleId];
  if(!prior){assert.equal(c.kind,'STRATAGEM');assert.equal(c.clauses.length,0,'New TARGET cannot execute');assert.equal(c.roles.length,1);continue;}
  if(c.roles.some(r=>r.id==='compatibility-target')){c.roles=c.roles.filter(r=>r.id!=='compatibility-target');delete c.compatibilityRoleIds;c.sourceFields=prior;}
  restored.push({entityId:entity.id,contract:c});
 }
 return restored;
}
export function assertRealTargetContracts(bookId,expected){
 if(!expected.runtimeFile)return 0;
 const book=prepareSourceProducer(parseProducerJSON(fs.readFileSync(new URL('../../books/'+bookId+'/v2/generated/'+expected.runtimeFile,import.meta.url),'utf8')));
 const declarations=JSON.parse(fs.readFileSync(new URL('../../books/'+bookId+'/v2/stratagem-target-declarations.json',import.meta.url)));
 const owners=new Map(book.entities.map(e=>[e.id,e]));
 for(const row of declarations){const contract=owners.get(row.ruleId)?.ruleContract;
  assert(contract,'TARGET must be in actual runtime input');assert.deepEqual(contract.compatibilityRoleIds,['compatibility-target']);
  assert.deepEqual(contract.roles.find(r=>r.id==='compatibility-target'),row.role,'Published TARGET differs from declaration');}
 const runtimeFile='books/'+bookId+'/v2/generated/'+expected.runtimeFile;
 const historical=verifyAcceptedMfmHistory({script:'v2/related-panel-qa.mjs',args:['--book='+bookId,'--phase=all'],
  fixtures:['v2/fixtures/related-panel.json'],decodedFiles:[runtimeFile],label:bookId+' TARGET transition'});
 const accepted=priorContracts(historical.decoded[runtimeFile],expected);
 assert.equal(hash(accepted),expected.priorContractsSha256,'Historical roles/clauses/effects/conditions/CP/timing/duration changed');
 let central;
 const source=getCurrentMfmSource(bookId),resolveOwnedFact=id=>{
  const record=(central??=createEffectiveMfmCatalog({asOf:source.currentnessCutoff})).getById(id);
  assert.equal(record?.provenance.sourceId,source.sourceId,'TARGET transition uses a stale MFM source');
  assert.equal(record.provenance.sourceVersion,source.version,'TARGET transition uses a stale MFM version');
  return record;
 };
 const currentExpected=accepted.map(row=>({...row,contract:currentMfmContractExpectation(row.contract,{bookId,resolveOwnedFact})}));
 assertCurrentGwContracts(priorContracts(book,expected),currentExpected,{
  historicalBook:historical.decoded[runtimeFile],currentBook:book,document:readOfficialUpdates(bookId).document
 });
 const single=declarations[0],old=()=>{const copy=structuredClone(book);const c=copy.entities.find(e=>e.id===single.ruleId).ruleContract;
  c.roles=c.roles.filter(r=>r.id!=='compatibility-target');delete c.compatibilityRoleIds;return copy;};
 const success=old(),data=hash(success.entities.map(e=>e.data));recordReviewedStratagemTargets(success,[single]);assert.equal(hash(success.entities.map(e=>e.data)),data);
 assert.throws(()=>recordReviewedStratagemTargets(old(),[single,single]),/Duplicate/);
 assert.throws(()=>recordReviewedStratagemTargets(old(),[{...single,quote:'POISON NOT IN TARGET'}]),/TARGET/);
 assert.throws(()=>recordReviewedStratagemTargets(old(),[{...single,field:['lines',0,'text']}]),/TARGET/);
 assert.throws(()=>recordReviewedStratagemTargets(success,[single]),/Existing target authority/);
 assert.throws(()=>recordReviewedStratagemTargets(old(),[{...single,ruleId:'foreign-stratagem'}]),/book-owned/);
 return 5;
}

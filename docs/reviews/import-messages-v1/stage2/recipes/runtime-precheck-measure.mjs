import fs from 'node:fs/promises';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
const root='E:/Warhammer/worktrees/import-messages-v1/';
const fixturePath='v2/fixtures/roster-navigation-saved-v2.json';
const fixtureBytes=await fs.readFile(root+fixturePath),fixtures=JSON.parse(fixtureBytes).books;
const results=[];
for(const book of ['death-guard','space-marines']){
const {createBrowserRoster}=await import(pathToFileURL(root+'books/'+book+'/v2/roster-boot.mjs'));
const service=await createBrowserRoster({fetch:async url=>{const data=await fs.readFile(fileURLToPath(url),'utf8');return {ok:true,json:async()=>JSON.parse(data)};}});
const snapshot=fixtures.find(row=>row.bookId===book).snapshot;
service.load(snapshot);
const id=service.state.units.find(unit=>book==='death-guard'?unit.canonicalUnitId==='unit-deathshroud-terminators':true).instanceId;
const trials=[];
for(let n=0;n<3;n++){const start=performance.now();const rows=service.related(id);trials.push({milliseconds:performance.now()-start,metadataRows:rows.length,eligibleStratagems:rows.filter(row=>row.kind==='STRATAGEM'&&snapshot.detachmentIds.includes(row.detachmentId)&&['MATCH','CONDITIONAL'].includes(row.applicability)).length});}
results.push({book,instanceId:id,snapshotSha256:createHash('sha256').update(JSON.stringify(snapshot)).digest('hex'),trials,medianMilliseconds:trials.map(row=>row.milliseconds).sort((a,b)=>a-b)[1]});
}
console.log(JSON.stringify({schema:'import-messages-exact-stratagem-precheck-timing/v1',scope:'Serial Node metadata-query timing only; browser card/guide timings remain a separate required check.',fixturePath,fixtureSha256:createHash('sha256').update(fixtureBytes).digest('hex'),results},null,2));

import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
import {execFileSync} from 'node:child_process';
const root='E:/Warhammer/worktrees/markup-unknown-v1',out='E:/Warhammer/qa-evidence/markup-unknown-v1-2026-11-21';
const census=JSON.parse(fs.readFileSync(out+'/CENSUS_BEFORE.json')),proposal=JSON.parse(fs.readFileSync(out+'/PROPOSALS.json'));
const {collectNativeInventory}=await import(pathToFileURL(root+'/tools/markup-census/native-inventory.mjs'));
const {ownerOnlyViolations,OWNER_ONLY_REASON}=await import(pathToFileURL(root+'/tools/markup-census/owner-only.mjs'));
const inventory=await collectNativeInventory({root}),byKey=new Map(inventory.rows.map(row=>[row.book+'\0'+row.id,row]));
const checked=[];for(const row of proposal.rows.filter(row=>row.registryReason===OWNER_ONLY_REASON)){
 const native=byKey.get(row.book+'\0'+row.id);assert(native);assert.equal(native.sourceFingerprint,row.sourceFingerprint);
 const violations=ownerOnlyViolations(native,inventory);checked.push({book:row.book,id:row.id,violations});
}
assert(checked.every(row=>row.violations.length===0),'Proposed registry-only closure would require a display change');
for(const input of census.inputs)assert.equal(createHash('sha256').update(fs.readFileSync(root+'/'+input.path)).digest('hex'),input.sha256,input.path+' changed');
assert.equal(execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim(),'6f2e5fb23643fc0041efcd7006f3e150bd5ce4be');
assert.equal(execFileSync('git',['status','--porcelain'],{cwd:root,encoding:'utf8'}).trim(),'');
const report={status:'PASS',analysisOnly:true,noRegistryOrProductWrites:true,source:'6f2e5fb23643fc0041efcd7006f3e150bd5ce4be',nativeInputBytesUnchanged:census.inputs.length,
 currentOwnerOnlyAdmission:{rows:checked.length,foreignPathViolations:0,checked},remainingDebtBaselineMustRemainByteUnchanged:true,
 warning:'This is read-only proposal feasibility over existing consumers, not an approved closure, a post-change census or a new browser test.'};
fs.writeFileSync(out+'/PROPOSAL_BOUNDARY.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({status:'PASS',ownerOnlyRows:checked.length,inputBytesUnchanged:census.inputs.length,repoClean:true}));

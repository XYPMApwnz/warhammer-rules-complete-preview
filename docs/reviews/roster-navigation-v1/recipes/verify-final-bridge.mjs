import fs from 'node:fs';import assert from 'node:assert/strict';import {execFileSync} from 'node:child_process';
const root='E:/Warhammer/worktrees/roster-navigation-v1',measured='8e17f9d39f286d4cbc930539f817b2fb7ef0047d';
const git=(...args)=>execFileSync('git',args,{cwd:root,encoding:'utf8'}).trim();
const final=git('rev-parse','HEAD');assert.equal(final,'880a98dbb9dd743f548fc1ed750093912628b570');assert.equal(git('status','--porcelain'),'');
const files=git('diff','--name-only',measured,final).split('\n').filter(Boolean);assert.deepEqual(files,['tools/pages-runtime-manifest.json']);
assert.deepEqual(JSON.parse(git('show',measured+':'+files[0])),JSON.parse(fs.readFileSync(root+'/'+files[0],'utf8')),'Only JSON formatting changed');
const report={status:'PASS',measuredCommit:measured,finalCommit:final,changedFiles:files,
  manifestJsonDeepEqual:true,runtimeAndGameplayBytesUnchanged:true,reason:'Canonical two-space JSON serialization for the existing CRLF/LF packaging invariant. No manifest entry/value, published asset, test, generated fact or gameplay code changed.'};
fs.writeFileSync(new URL('../FINAL_COMMIT_BRIDGE.json',import.meta.url),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));

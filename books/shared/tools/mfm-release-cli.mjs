import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {parseSavedMfm,replayMfmIdentityRegistry,json} from './mfm-capture.mjs';
import {updateMfm,activateMfm} from './mfm-release-update.mjs';
import {createCanonicalMfmFacts} from '../../../mfm/content/canonical-mfm-facts.mjs';

const root=fileURLToPath(new URL('../../../',import.meta.url)),args=process.argv.slice(2);
const option=name=>args.find(a=>a.startsWith(name+'='))?.slice(name.length+1);
const allowed=['--version','--input','--decisions','--observed-at','--out'];
if(args.includes('--help')){
 console.log(`Update the nine Army Books and both CSM dependencies from the official MFM.

npm run mfm:update -- --version=v1.7
  Capture all official faction pages. Only this command uses the network.
npm run mfm:update -- --version=v1.7 --input=E:/saved-pages --observed-at=2027-01-15
  Read saved official pages offline with the same DOM reader.
  All CURRENT/LEGENDS page filenames must match the selected capture layout.
  Existing accepted releases are never overwritten.

Review mfm/releases/v1.7/REPORT.md and capture.json.
Unknown, renamed, removed or differently owned entries block activation.
Provide explicit decisions, with opaque IDs and exact source locators:
npm run mfm:update -- --version=v1.7 --input=E:/saved-pages --observed-at=2027-01-15 --decisions=E:/decisions.json

npm run mfm:activate -- --version=v1.7
  Validate every retained artifact and identity, archive the previous eleven
  source declarations and update the current pointer in one transaction.
  No network, builds, commit or push is performed. Rebuild and review afterwards.

npm run mfm:update -- --replay --input=mfm/sources/v1.6 --out=E:/Warhammer/qa-tmp/mfm-update-v1/replay
  Reproduce v1.6 offline, using its explicit observation/identity input.
  Compare every byte before writing the separate replay directory.

Saved-page input requires --observed-at=ISO-TIME: use its actual capture time.
The official effective date remains unknown unless separately established.`);
 process.exit(0);
}
for(const arg of args)if(!['update','activate','--replay'].includes(arg)&&!allowed.some(k=>arg.startsWith(k+'=')))throw Error('Unknown MFM option '+arg);
try{
 if(args.includes('--replay')){
  const input=path.resolve(option('--input')||path.join(root,'mfm/sources/v1.6')),out=option('--out');
  if(!out)throw Error('Replay requires a separate --out directory');
  const destination=path.resolve(out),relative=path.relative(root,destination);
  if(!relative.startsWith('..')||fs.existsSync(destination))throw Error('Replay output must be a fresh directory outside the checkout');
  const parsed=await parseSavedMfm({root,input,version:'v1.6',replay:true});
  const registryPath='mfm/content/mfm-v1.6-scoped.identity-registry.json';
  parsed.files.set(registryPath,Buffer.from(json(replayMfmIdentityRegistry(parsed))));
  createCanonicalMfmFacts({repoRoot:root,identityRegistry:JSON.parse(parsed.files.get(registryPath)),crossDomainBindings:JSON.parse(fs.readFileSync(path.join(root,'mfm/content/mfm-v1.6-army-mission-bindings.json')))});
  for(const[p,b]of parsed.files)if(!b.equals(fs.readFileSync(path.join(root,p))))throw Error('v1.6 replay differs: '+p);
  for(const[p,b]of parsed.files){const target=path.join(destination,p);fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,b);}
  console.log(`PASS: ${parsed.files.size} v1.6 files reproduced byte for byte; opaque identities validated against independently parsed facts.`);
 }else if(args[0]==='activate')console.log(JSON.stringify(await activateMfm({root,version:option('--version')}),null,2));
 else{
  const state=await updateMfm({root,version:option('--version'),input:option('--input'),decisionsFile:option('--decisions'),observedAt:option('--observed-at')});
  console.log(`MFM ${state.version}: ${state.changes.length} changes; ${state.pending.length} decisions. See mfm/releases/${state.version}/REPORT.md.`);
 }
}catch(error){console.error(error.stack);process.exitCode=1;}

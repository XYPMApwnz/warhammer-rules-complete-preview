import {resolveQaPython} from './helpers/qa-python.cjs';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {
  authenticatedInputPaths,
  buildAuthenticatedChildArguments,
  classifyForwardedArgument,
  runExtractor,
  validateForwardedArguments
} from '../books/space-marines/tools/extract-faction-pack.mjs';

const inputOverrideMutations=[
  '--bsdata-faction',
  '--bsdata-faction=alternate.json',
  '--bsdata-f=alternate.json',
  '--bsdata-library',
  '--bsdata-library=alternate.json',
  '--bsdata-l=alternate.json',
  '--bsdata=alternate.json'
];
for(const mutation of inputOverrideMutations){
  assert.equal(classifyForwardedArgument(mutation),'AUTHENTICATED_INPUT_SELECTOR',mutation);
  assert.throws(
    ()=>buildAuthenticatedChildArguments({forwardedArguments:[mutation]}),
    /Authenticated BSData input selector cannot be overridden/,
    mutation
  );
}

for(const [operation,classification] of [['--check','OUTPUT_OR_CHECK_BEHAVIOR'],['--help','MODE_OR_OPERATION'],['-h','MODE_OR_OPERATION']]){
  assert.equal(classifyForwardedArgument(operation),classification);
  assert.deepEqual(validateForwardedArguments([operation]),[operation]);
}
assert.deepEqual(validateForwardedArguments([]),[]);
assert.throws(()=>validateForwardedArguments(['--candidate-dir','elsewhere']),/Unsupported Space Marines Faction Pack wrapper argument/);

let childInvocation;
const outcome=runExtractor(['--check'],{
  spawn:(command,args,options)=>{
    childInvocation={command,args,options};
    return {status:0,stdout:'',stderr:'',error:null};
  }
});
assert(childInvocation,'Python child was not invoked');
assert.equal(childInvocation.args.filter(value=>value==='--bsdata-faction').length,1);
assert.equal(childInvocation.args.filter(value=>value==='--bsdata-library').length,1);
assert.equal(childInvocation.args.at(-1),'--check');

const configuredFaction=fs.realpathSync.native(authenticatedInputPaths.faction);
const configuredLibrary=fs.realpathSync.native(authenticatedInputPaths.library);
assert.equal(fs.realpathSync.native(childInvocation.args[childInvocation.args.indexOf('--bsdata-faction')+1]),configuredFaction);
assert.equal(fs.realpathSync.native(childInvocation.args[childInvocation.args.indexOf('--bsdata-library')+1]),configuredLibrary);

const python=resolveQaPython();
const parser=[
  'import argparse,json',
  'p=argparse.ArgumentParser()',
  "p.add_argument('--check',action='store_true')",
  "p.add_argument('--bsdata-faction',required=True)",
  "p.add_argument('--bsdata-library',required=True)",
  'a=p.parse_args()',
  "print(json.dumps({'faction':a.bsdata_faction,'library':a.bsdata_library,'check':a.check}))"
].join(';');
const parsed=spawnSync(python,['-c',parser,...childInvocation.args.slice(1)],{encoding:'utf8'});
assert.equal(parsed.status,0,parsed.stderr);
const childParsed=JSON.parse(parsed.stdout);
assert.equal(fs.realpathSync.native(childParsed.faction),configuredFaction);
assert.equal(fs.realpathSync.native(childParsed.library),configuredLibrary);
assert.equal(childParsed.check,true);

assert.throws(
  ()=>runExtractor([],{
    verify:()=>({checkout:outcome.authenticated.checkout,inputFiles:[outcome.authenticated.inputFiles[0]]}),
    spawn:()=>assert.fail('Child must not spawn when the verified input set is incomplete')
  }),
  /did not authenticate the exact configured child input set/
);

console.log('Space Marines authenticated BSData argument binding QA passed.');

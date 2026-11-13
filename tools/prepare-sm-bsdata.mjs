/** Explicit pinned-input preparation; normal builds and tests remain offline. */
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {getQaTmpRoot} from '../tests/helpers/qa-temp.mjs';
import {verifyBsdataSource} from '../books/shared/tools/verify-bsdata-source.mjs';

const configFile=fileURLToPath(new URL('../books/space-marines/sources/bsdata-extract.config.json',import.meta.url));
const config=JSON.parse(fs.readFileSync(configFile,'utf8'));
const checkout=path.resolve(path.dirname(configFile),config.source.checkout);
const inputFiles=config.inputs.map(input=>path.resolve(path.dirname(configFile),input.path));
const command='npm run qa:sm:prepare-bsdata';
const git=(directory,args)=>{
  const result=spawnSync('git',[...(directory?['-C',directory]:[]),...args],{encoding:'utf8',maxBuffer:8*1024*1024});
  if(result.error||result.status!==0)throw Error(`BSData preparation failed: ${result.error?.message||(result.stderr||result.stdout).trim()}`);
  return result.stdout.trim();
};
const repositoryKey=value=>String(value).replace(/\.git$/,'').replace(/\/$/,'');

function verifyPrepared(directory,files){
  const authenticated=verifyBsdataSource({checkout:directory,expectedCommit:config.source.commit,inputFiles:files});
  const remote=git(directory,['remote','get-url','origin']);
  if(repositoryKey(remote)!==repositoryKey(config.source.repository))throw Error(`BSData preparation failed: unexpected origin ${remote}`);
  const status=git(directory,['status','--porcelain=v1','--untracked-files=all']);
  if(status)throw Error(`BSData preparation failed: checkout is not clean: ${directory}\n${status}`);
  return authenticated;
}

export function prepareSmBsdata({cache}={}){
  if(!/^[0-9a-f]{40}$/.test(config.source.commit))throw Error('BSData preparation failed: configured commit must be a full Git SHA');
  const relativeInputs=inputFiles.map(file=>path.relative(checkout,file));
  const cached=cache?verifyPrepared(path.resolve(cache),relativeInputs.map(file=>path.resolve(cache,file))):null;
  // Never replace an existing directory or silently repair someone else's input.
  if(fs.existsSync(checkout))return verifyPrepared(checkout,inputFiles);
  const storage=path.join(getQaTmpRoot(),`bsdata-wh40k-11e-${config.source.commit}`);
  if(!fs.existsSync(storage)){
    fs.mkdirSync(path.dirname(storage),{recursive:true});
    if(cached){
      const upstream=git(cached.checkout,['remote','get-url','origin']);
      console.log('BSDATA_TRANSPORT '+JSON.stringify({kind:'verified-local-cache',cache:cached.checkout,upstream,commit:cached.commit}));
      git(null,['clone','--local','--no-hardlinks','--no-checkout',cached.checkout,storage]);
      // The cache is a transport for the accepted upstream Git objects, not a new source.
      git(storage,['remote','set-url','origin',upstream]);
    }else{
      git(null,['clone','--filter=blob:none','--no-checkout',config.source.repository,storage]);
    }
    git(storage,['checkout','--detach',config.source.commit]);
  }
  verifyPrepared(storage,relativeInputs.map(file=>path.join(storage,file)));
  fs.mkdirSync(path.dirname(checkout),{recursive:true});
  fs.symlinkSync(storage,checkout,process.platform==='win32'?'junction':'dir');
  return verifyPrepared(checkout,inputFiles);
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const args=process.argv.slice(2);
  if(args.length===1&&args[0]==='--help'){
    console.log(`${command} [-- --cache=<Git-checkout>]\nPrepares the configured BSData Git SHA outside the checkout and verifies all configured inputs.\nAn optional local cache must have the same accepted origin, exact SHA, inputs and clean Git tree.\nNo commit, repository or input overrides are accepted. Existing dirty or mismatched checkouts are rejected.`);
  }else{
    try{
      if(args.length>1||args.some(arg=>!arg.startsWith('--cache=')||arg==='--cache='))throw Error(`Unsupported preparation argument: ${args.join(' ')}. Only --cache=<Git-checkout> is accepted.`);
      console.log('BSDATA_PREPARED '+JSON.stringify(prepareSmBsdata({cache:args[0]?.slice('--cache='.length)})));
    }catch(error){console.error(error.message);process.exitCode=1;}
  }
}

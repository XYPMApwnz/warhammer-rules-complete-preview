/** Test-only interpreter selection; never imported by factual producers.
 * Explicit CLI override -> QA_PYTHON -> caller's existing environment key(s)
 * -> current user's Codex runtime -> python on PATH. Invalid overrides remain
 * explicit commands so a failed launch is not hidden by a different interpreter.
 */
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');

function resolveQaPython({override,env=process.env,envKeys=['PYTHON']}={}){
  for(const value of [override,env.QA_PYTHON,...envKeys.map(key=>env[key])]){
    if(typeof value==='string'&&value.trim())return value.trim();
  }
  const home=env.USERPROFILE||env.HOME||os.homedir();
  const runtime=path.join(home,'.cache','codex-runtimes','codex-primary-runtime','dependencies','python');
  for(const relative of ['python.exe','bin/python3','bin/python']){
    const candidate=path.join(runtime,relative);
    try{if(fs.statSync(candidate).isFile())return candidate;}
    catch(error){if(!['ENOENT','ENOTDIR'].includes(error.code))throw error;}
  }
  return 'python';
}

exports.resolveQaPython=resolveQaPython;

/** Mandatory optional-equipment text checks reuse the native enrollment UI QA. */
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const result=spawnSync(process.execPath,[fileURLToPath(new URL('./dg-am-recipient-enrollment-browser-qa.mjs',import.meta.url)),
  '--equipment-only','--device=desktop',...process.argv.slice(2)],{stdio:'inherit'});
if(result.error)throw result.error;
process.exitCode=result.status??1;

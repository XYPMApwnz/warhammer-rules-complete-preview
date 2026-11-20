/** Disposable, small startup metadata derived from accepted source owners. */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {BOOK_PASSPORT_IDS,readBookPassport} from './book-passport.mjs';

const defaultRoot=fileURLToPath(new URL('../../../',import.meta.url));
export const SOURCE_METADATA_OUTPUT='books/shared/application-v2/generated/source-metadata.v1.json';
const corePath='books/core-rules/content/core-rules.digital-11e.json';
const mfmPath='mfm/current.json';
const text=value=>typeof value==='string'&&value.trim()===value&&value.length>0;
const fail=message=>{throw new TypeError('Source metadata: '+message);};
const validDate=value=>{
  if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value))return false;
  const date=new Date(`${value}T00:00:00Z`);
  return Number.isFinite(date.valueOf())&&date.toISOString().slice(0,10)===value;
};
const version=release=>{
  if(release?.schema!=='current-mfm-release/v1'||!text(release.version)||/[\r\n\t]/.test(release.version))fail('missing or invalid current MFM version');
  return release.version;
};

export function projectCoreBattleSizes(rule) {
  if(rule?.code!=='25.03')fail('Core battle-size source 25.03 is missing');
  const tables=(rule.content||[]).filter(block=>block.type==='comparison-table'&&block.columns?.[0]==='BATTLE SIZE');
  if(tables.length!==1)fail('Core battle-size comparison table is missing or ambiguous');
  const table=tables[0],headers=['Points Total','Detachment Points (DP)'];
  if(headers.some(header=>table.columns.filter(column=>column===header).length!==1))fail('Core battle-size columns are missing or ambiguous');
  if(!Array.isArray(table.rows)||!table.rows.length)fail('Core battle-size rows are missing');
  const numeric=(value,label)=>{
    if(!(typeof value==='string'&&/^\d+$/.test(value)||typeof value==='number')||!Number.isSafeInteger(Number(value))||Number(value)<=0)
      fail('invalid Core battle-size '+label);
    return Number(value);
  };
  const rows=table.rows.map(row=>{
    if(!text(row.label)||!Array.isArray(row.cells)||row.cells.length!==table.columns.length-1)fail('invalid Core battle-size row');
    return {label:row.label,
      pointsLimit:numeric(row.cells[table.columns.indexOf(headers[0])-1],headers[0]),
      detachmentPoints:numeric(row.cells[table.columns.indexOf(headers[1])-1],headers[1])};
  });
  if(new Set(rows.map(row=>row.label)).size!==rows.length)fail('duplicate Core battle-size row');
  return rows;
}

export function projectSourceMetadata({currentMfm,core,bookReleases}) {
  if(!validDate(core?.meta?.captureDate))fail('invalid Core capture date');
  if(typeof core.meta.corpusFingerprint!=='string'||!/^([a-f\d]{64})$/i.test(core.meta.corpusFingerprint))fail('invalid Core corpus fingerprint');
  const rules=core.records?.filter(record=>record.code==='25.03');
  if(rules?.length!==1)fail('Core battle-size source 25.03 is missing or ambiguous');
  const ids=[...BOOK_PASSPORT_IDS].sort();
  if(!bookReleases||JSON.stringify(Object.keys(bookReleases).sort())!==JSON.stringify(ids))fail('book release owners do not match the registered passports');
  return {schema:'application-source-metadata/v1',mfm:{version:version(currentMfm)},
    core:{captureDate:core.meta.captureDate,corpusFingerprint:core.meta.corpusFingerprint,battleSizes:projectCoreBattleSizes(rules[0])},
    books:Object.fromEntries(ids.map(id=>[id,{mfmVersion:version(bookReleases[id])}]))};
}

export function buildSourceMetadata({root=defaultRoot,readJSON}={}) {
  root=path.resolve(root);
  const loaded=new Map();
  const read=relative=>{
    if(!loaded.has(relative))loaded.set(relative,readJSON?readJSON(relative):JSON.parse(fs.readFileSync(path.join(root,relative),'utf8')));
    return loaded.get(relative);
  };
  const bookReleases={};
  for(const id of BOOK_PASSPORT_IDS){
    const passport=readBookPassport(id,{root,config:read(`books/${id}/book.config.json`)});
    bookReleases[id]=read(passport.mfm.currentRelease);
  }
  return projectSourceMetadata({currentMfm:read(mfmPath),core:read(corePath),bookReleases});
}

export const serializeSourceMetadata=metadata=>JSON.stringify(metadata,null,2)+'\n';

export function runSourceMetadataBuild({root=defaultRoot,outputPath,check=false,readJSON}={}) {
  root=path.resolve(root);outputPath=path.resolve(outputPath||path.join(root,SOURCE_METADATA_OUTPUT));
  const bytes=serializeSourceMetadata(buildSourceMetadata({root,readJSON}));
  if(check){
    if(!fs.existsSync(outputPath)||fs.readFileSync(outputPath,'utf8')!==bytes){
      const error=new Error('Generated source metadata is stale: '+outputPath);error.code='ERR_SOURCE_METADATA_STALE';throw error;
    }
  }else{
    fs.mkdirSync(path.dirname(outputPath),{recursive:true});fs.writeFileSync(outputPath,bytes,'utf8');
  }
  return {status:'PASS',mode:check?'check':'build',output:outputPath,bytes:Buffer.byteLength(bytes)};
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const options={};
  for(const arg of process.argv.slice(2)){
    if(arg==='--check')options.check=true;
    else if(arg.startsWith('--root='))options.root=arg.slice(7);
    else if(arg.startsWith('--out='))options.outputPath=arg.slice(6);
    else throw new TypeError('Unknown source metadata build option: '+arg);
  }
  try{console.log(JSON.stringify(runSourceMetadataBuild(options)));}
  catch(error){console.error(error.message);process.exitCode=1;}
}

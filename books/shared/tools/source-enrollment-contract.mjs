import fs from 'node:fs';
import path from 'node:path';
import {loadPublicationInventory,selectPublicationBooks} from './publication-inventory.mjs';
import {readSourceRegistry,verifyFrozenSource} from './source-ingestion-contract.mjs';

export const SOURCE_LIFECYCLES=new Set(['ACCEPTED_SOURCE','AUTHORITATIVE_RUNTIME_SOURCE','HISTORICAL_EVIDENCE']);
export const UPSTREAM_CURRENTNESS=new Set(['UNKNOWN','CURRENT','UPDATE_AVAILABLE','N/A']);
export const SOURCE_CLASSIFICATIONS=new Set(['VERIFIED_FROZEN','VERIFIED_CURRENT','UPDATE_AVAILABLE','REVIEW_REQUIRED','SOURCE_LIMITED','LEGACY_UNVERIFIABLE']);
export const SOURCE_CONSUMERS=new Set([
  'CANONICAL_BUILD','EFFECTIVE_MODEL','POINTS_PROJECTION','RELATED_RULES','COMPATIBLE_RULES','RUNTIME_PUBLICATION','SOURCE_FRESHNESS',
  'CERTIFICATION_QA','GLOSSARY_V2'
]);

const toPosix=value=>String(value).replaceAll('\\','/');
const normalizeRelative=(value,label)=>{
  const raw=toPosix(value);
  if(!raw||path.posix.isAbsolute(raw)||raw.startsWith('/')||raw.split('/').some(part=>!part||part==='.'||part==='..')||path.posix.normalize(raw)!==raw)throw new Error(`${label} must be a normalized repository-relative path: ${value}`);
  return raw;
};
const sourceRecords=manifest=>[...(manifest.layers||[]),...(manifest.sources||[])];
const activeRecords=manifest=>sourceRecords(manifest).filter(source=>source.active!==false);
const registryKey=(book,id)=>`${book}\0${id}`;
const sourceIdentity=source=>source.sourceId||source.id;

function generatedPaths(config,repo){
  const result=new Set();
  for(const declaration of config.generatedOutputs||[]){
    for(const relative of declaration.paths||[])result.add(toPosix(path.posix.join('books',config.id,relative)));
    if(declaration.pattern){
      const directory=path.posix.dirname(declaration.pattern),name=path.posix.basename(declaration.pattern),matcher=new RegExp(`^${name.replace(/[.+^${}()|[\]\\]/g,'\\$&').replaceAll('*','[^/]*')}$`),absolute=path.join(repo,'books',config.id,directory);
      if(fs.existsSync(absolute))for(const entry of fs.readdirSync(absolute,{withFileTypes:true}))if(entry.isFile()&&matcher.test(entry.name))result.add(toPosix(path.posix.join('books',config.id,directory,entry.name)));
    }
  }
  return result;
}

const consumerTextExtensions=new Set(['.cjs','.html','.inc','.js','.json','.mjs','.py']);
function consumerGraphFiles(directory,excluded){
  if(!fs.existsSync(directory))return [];
  return fs.readdirSync(directory,{withFileTypes:true}).flatMap(entry=>{
    const absolute=path.join(directory,entry.name),relative=toPosix(absolute);
    if(excluded.has(relative))return [];
    if(entry.isDirectory())return consumerGraphFiles(absolute,excluded);
    return entry.isFile()&&consumerTextExtensions.has(path.extname(entry.name).toLowerCase())?[absolute]:[];
  });
}
function strings(value,prefix=[],result=[]){
  if(typeof value==='string')result.push({key:prefix.join('.'),value});
  else if(value&&typeof value==='object')for(const [key,child] of Object.entries(value))strings(child,[...prefix,key],result);
  return result;
}

function validateManifestSource({repo,book,source,generated}){
  const label=`${book}/${sourceIdentity(source)||'<missing>'}`;
  if(!source.id||typeof source.id!=='string')throw new Error(`${label}: source id is required`);
  if(typeof source.active!=='boolean')throw new Error(`${label}: active must be explicit`);
  if(!SOURCE_LIFECYCLES.has(source.lifecycle))throw new Error(`${label}: unsupported lifecycle ${source.lifecycle}`);
  if(source.active===false){
    if(source.lifecycle!=='HISTORICAL_EVIDENCE')throw new Error(`${label}: inactive source must be historical evidence`);
    return;
  }
  if(source.lifecycle==='HISTORICAL_EVIDENCE')throw new Error(`${label}: historical evidence cannot be active`);
  if(!source.sourceType||typeof source.sourceType!=='string')throw new Error(`${label}: sourceType is required`);
  if(!Array.isArray(source.factsOwned)||!source.factsOwned.length||source.factsOwned.some(value=>typeof value!=='string'||!value))throw new Error(`${label}: factsOwned must be non-empty`);
  if(!Array.isArray(source.consumers)||!source.consumers.length||source.consumers.some(value=>!SOURCE_CONSUMERS.has(value)))throw new Error(`${label}: consumers are incomplete or unsupported`);
  if(!Array.isArray(source.paths)||!source.paths.length)throw new Error(`${label}: paths must be non-empty`);
  const seen=new Set();
  for(const [index,value] of source.paths.entries()){
    const relative=normalizeRelative(value,`${label}.paths[${index}]`);
    if(seen.has(relative))throw new Error(`${label}: duplicate path ${relative}`);seen.add(relative);
    if(!relative.startsWith(`books/${book}/`))throw new Error(`${label}: source path is outside its book owner: ${relative}`);
    const absolute=path.resolve(repo,...relative.split('/')),inside=path.relative(repo,absolute);
    if(inside.startsWith(`..${path.sep}`)||inside==='..'||path.isAbsolute(inside))throw new Error(`${label}: source path escapes repository: ${relative}`);
    if(!fs.existsSync(absolute)||!fs.statSync(absolute).isFile())throw new Error(`${label}: source path is missing: ${relative}`);
    if(generated.has(relative))throw new Error(`${label}: generated output is mislabeled as accepted source: ${relative}`);
  }
}

function validateRegisteredSource(source){
  const label=`${source.book||'<missing>'}/${source.sourceId||'<missing>'}`;
  if(!source.book||!source.sourceId)throw new Error(`${label}: registered source owner and identity are required`);
  if(!SOURCE_CLASSIFICATIONS.has(source.status))throw new Error(`${label}: source is not classified`);
  if(!source.authority||!source.sourceType||!source.acceptedRevision||!source.reproducible||!source.rawOrigin)throw new Error(`${label}: source identity/provenance metadata is incomplete`);
  if(!/^[a-f0-9]{64}$/i.test(source.acceptedHash||''))throw new Error(`${label}: acceptedHash is missing or invalid`);
  if(!UPSTREAM_CURRENTNESS.has(source.upstreamCurrentness))throw new Error(`${label}: invalid upstreamCurrentness ${source.upstreamCurrentness}`);
  if(source.upstreamCurrentness==='CURRENT'&&(source.status!=='VERIFIED_CURRENT'||!source.upstreamObservedAt))throw new Error(`${label}: CURRENT requires a verified upstream observation`);
  if(source.upstreamCurrentness==='UPDATE_AVAILABLE'&&source.upstreamUpdateKnown!==true)throw new Error(`${label}: UPDATE_AVAILABLE requires an explicit upstream observation`);
  if(source.status==='LEGACY_UNVERIFIABLE'&&(source.rawOrigin!=='UNAVAILABLE'||source.reproducible!=='normalized-artifacts-only'))throw new Error(`${label}: legacy-unverifiable provenance must remain explicit`);
  if(!Array.isArray(source.artifacts)||!source.artifacts.length)throw new Error(`${label}: no authenticated artifacts are declared`);
}

export function buildSourceEnrollment({repo=path.resolve(process.cwd()),includeFreshnessOnly=true}={}){
  const root=path.resolve(repo),inventory=loadPublicationInventory({root}),books=selectPublicationBooks(inventory,includeFreshnessOnly?'freshness':'library'),registry=readSourceRegistry(path.join(root,'books','source-ingestion-contract.json'));
  const registered=new Map(),globalIds=new Set(),artifactOwners=new Map();
  for(const source of registry.sources){
    validateRegisteredSource(source);
    if(globalIds.has(source.sourceId))throw new Error(`duplicate registered source identity ${source.sourceId}`);globalIds.add(source.sourceId);
    const key=registryKey(source.book,source.sourceId);
    if(registered.has(key))throw new Error(`duplicate registered source ${source.book}/${source.sourceId}`);
    registered.set(key,source);
    for(const artifact of source.artifacts){const previous=artifactOwners.get(artifact.path);if(previous)throw new Error(`source artifact has conflicting owners: ${artifact.path} (${previous}, ${source.sourceId})`);artifactOwners.set(artifact.path,source.sourceId);}
  }
  const rows=[],bookRows=[];
  for(const publication of books){
    const book=publication.id,configPath=path.join(root,publication.config),config=JSON.parse(fs.readFileSync(configPath,'utf8'));
    if(!config.sources?.manifest)throw new Error(`${book}: sources.manifest is required for source enrollment`);
    const manifestPath=path.resolve(path.dirname(configPath),config.sources.manifest);
    if(!fs.existsSync(manifestPath))throw new Error(`${book}: source manifest is missing`);
    const manifest=JSON.parse(fs.readFileSync(manifestPath,'utf8')),all=sourceRecords(manifest),ids=new Set(),generated=generatedPaths(config,root);
    const expectedScope=publication.library?'PUBLIC_BOOK':'FRESHNESS_ONLY';
    if(manifest.enrollmentScope!==expectedScope)throw new Error(`${book}: source enrollment scope ${manifest.enrollmentScope||'<missing>'} does not match publication scope ${expectedScope}`);
    for(const source of all){
      const id=sourceIdentity(source);
      if(ids.has(id))throw new Error(`${book}: duplicate manifest source ${id}`);ids.add(id);
      validateManifestSource({repo:root,book,source,generated});
    }
    const active=activeRecords(manifest),activeIds=new Set(active.map(sourceIdentity));
    const pathOwners=new Map();
    for(const source of active)for(const relative of source.paths){
      if(pathOwners.has(relative))throw new Error(`${book}: accepted source artifact has duplicate manifest owners: ${relative}`);
      pathOwners.set(relative,sourceIdentity(source));
    }
    if(publication.library)for(const input of strings(config.sources)){
      if(['manifest','unitImages','globalGlossary','coreRules'].includes(input.key))continue;
      const absolute=path.resolve(path.dirname(configPath),input.value),relative=toPosix(path.relative(root,absolute));
      if(!fs.existsSync(absolute)||!fs.statSync(absolute).isFile()||generated.has(relative))continue;
      // A compiled related-rules aggregate is a downstream projection unless an
      // accepted owner explicitly enrolls that same path.
      if(input.key==='relatedRules'&&!pathOwners.has(relative))continue;
      if(relative.startsWith(`books/${book}/`)&&!pathOwners.has(relative))throw new Error(`${book}: actual build source is omitted from manifest: ${relative}`);
    }
    const excluded=new Set([
      toPosix(manifestPath),
      ...[...generated].map(relative=>toPosix(path.resolve(root,...relative.split('/'))))
    ]);
    const graphFiles=consumerGraphFiles(path.join(root,'books',book),excluded);
    for(const source of active){
      const own=new Set(source.paths.map(relative=>toPosix(path.resolve(root,...relative.split('/')))));
      const needles=[sourceIdentity(source),source.id,...source.paths.flatMap(relative=>[relative.slice(`books/${book}/`.length),path.posix.basename(relative)])].filter(Boolean);
      const referenced=graphFiles.some(file=>!own.has(toPosix(file))&&needles.some(needle=>fs.readFileSync(file,'utf8').includes(needle)));
      if(!referenced)throw new Error(`${book}/${sourceIdentity(source)}: active source has no declared consumer graph reference`);
    }
    const bookRegistered=registry.sources.filter(source=>source.book===book),registeredIds=new Set(bookRegistered.map(source=>source.sourceId));
    const undeclared=bookRegistered.filter(source=>!ids.has(source.sourceId));
    const unregistered=active.filter(source=>!registeredIds.has(sourceIdentity(source)));
    if(undeclared.length)throw new Error(`${book}: registered sources are not actively declared: ${undeclared.map(source=>source.sourceId).join(', ')}`);
    if(unregistered.length)throw new Error(`${book}: active manifest sources are not registered: ${unregistered.map(sourceIdentity).join(', ')}`);
    for(const source of active){
      const id=sourceIdentity(source),status=registered.get(registryKey(book,id));
      const manifestPaths=[...source.paths].sort(),registryPaths=status.artifacts.map(artifact=>artifact.path).sort();
      if(JSON.stringify(manifestPaths)!==JSON.stringify(registryPaths))throw new Error(`${book}/${id}: manifest and registry artifact sets differ`);
      if(source.sourceType!==status.sourceType)throw new Error(`${book}/${id}: manifest and registry source types differ`);
      verifyFrozenSource(id,{repoRoot:root,registryPath:path.join(root,'books','source-ingestion-contract.json')});
      rows.push({book,sourceId:id,status:status.status,lifecycle:source.lifecycle,upstreamCurrentness:status.upstreamCurrentness,paths:manifestPaths});
    }
    const dependencies=manifest.sourceDependencies||[],expectedDependencies=config.dependencies||[];
    if(new Set(dependencies.map(item=>item.bookId)).size!==dependencies.length)throw new Error(`${book}: duplicate source dependency`);
    if(JSON.stringify(dependencies.map(item=>item.bookId).sort())!==JSON.stringify([...expectedDependencies].sort()))throw new Error(`${book}: source dependency set does not match book config`);
    for(const dependency of dependencies){
      if(dependency.type!=='CANONICAL_SOURCE_DEPENDENCY'||dependency.ownerBookId!==dependency.bookId||dependency.active!==true)throw new Error(`${book}: invalid source dependency owner for ${dependency.bookId}`);
      if(!inventory.books.some(item=>item.id===dependency.bookId))throw new Error(`${book}: unknown source dependency ${dependency.bookId}`);
    }
    bookRows.push({book,public:Boolean(publication.library),active:active.length,historical:all.length-active.length,registered:bookRegistered.length,classified:active.length,dependencies:dependencies.map(item=>item.bookId)});
  }
  return{rows,books:bookRows,publicBooks:bookRows.filter(item=>item.public),freshnessOnlyBooks:bookRows.filter(item=>!item.public)};
}

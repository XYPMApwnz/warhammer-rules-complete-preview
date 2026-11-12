/** One offline selector for the accepted current MFM release. No capture or writes. */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const defaultRoot=fileURLToPath(new URL('../../',import.meta.url));
const sourceRegistryPath='books/source-ingestion-contract.json';
export const isModernMfmVersion=version=>typeof version==='string'&&/^v1\.(?:[6-9]|[1-9]\d+)$/.test(version);
export function mfmVersionFromRegistryVersion(value){
  if(value==='v1.4')return value;
  const match=typeof value==='string'&&value.match(/^(v1\.(?:[5-9]|[1-9]\d+))-scoped-(?:six|nine)$/);
  if(!match)throw Error('Unsupported MFM registry version '+String(value));
  return match[1];
}
const object=(value,label,keys)=>{
  if(!value||typeof value!=='object'||Array.isArray(value))throw Error(`MFM current pointer ${label}: object required`);
  for(const key of keys)if(!Object.hasOwn(value,key))throw Error(`MFM current pointer ${label}.${key}: missing field`);
  for(const key of Object.keys(value))if(!keys.includes(key))throw Error(`MFM current pointer ${label}.${key}: unknown field`);
};
const repoPath=(root,relative)=>{
  if(typeof relative!=='string'||!relative||relative.includes('\\')||path.posix.isAbsolute(relative)||relative.split('/').some(p=>!p||p==='.'||p==='..')||!/^(?:mfm|books)\//.test(relative))throw Error('Unsafe MFM release path '+String(relative));
  return path.join(root,...relative.split('/'));
};
const read=(root,file)=>JSON.parse(fs.readFileSync(repoPath(root,file),'utf8'));

export function readCurrentMfmRelease({repoRoot=defaultRoot}={}){
  const release=read(repoRoot,'mfm/current.json');
  object(release,'release',['schema','version','registryVersion','identityRegistryPath','crossDomainBindingsPath','sourceRegistryPath','factions','dependencies']);
  if(release.schema!=='current-mfm-release/v1'||!isModernMfmVersion(release.version)||mfmVersionFromRegistryVersion(release.registryVersion)!==release.version)throw Error('MFM current pointer: unsupported release/schema version');
  if(release.sourceRegistryPath!==sourceRegistryPath)throw Error('MFM current pointer: the real global source registry is required');
  const registry=read(repoRoot,release.identityRegistryPath),cross=read(repoRoot,release.crossDomainBindingsPath);
  if(registry.schema!=='wh40k-mfm-identity-registry/v1'||registry.sourceVersion!==release.registryVersion||cross.schema!=='wh40k-mfm-cross-domain-bindings/v1'||cross.sourceVersion!==release.registryVersion||cross.currentnessCutoff!==registry.currentnessCutoff)throw Error('MFM current pointer: registry/cross-domain release mismatch');
  if(!Array.isArray(release.factions)||release.factions.length!==9||!Array.isArray(registry.factionBindings)||registry.factionBindings.length!==9)throw Error('MFM current pointer: exactly nine active faction sources required');
  if(!Array.isArray(release.dependencies)||release.dependencies.length!==2||!Array.isArray(registry.crossFactionUnitDependencies)||registry.crossFactionUnitDependencies.length!==2)throw Error('MFM current pointer: exactly two cross-faction dependency sources required');
  const seen=new Set(),ids=new Set();
  for(const item of release.factions){
    object(item,'faction',['bookId','sourceId','capturePath']);
    if(typeof item.bookId!=='string'||!item.bookId||seen.has(item.bookId))throw Error('MFM current pointer: missing/duplicate faction '+String(item.bookId));
    seen.add(item.bookId);const binding=registry.factionBindings.find(row=>row.factionId===item.bookId);
    if(!binding||binding.sourceId!==item.sourceId||binding.sourceCapturePath!==item.capturePath)throw Error('MFM current pointer: faction source mismatch '+item.bookId);
    if(typeof item.sourceId!=='string'||!item.sourceId.endsWith('-mfm-'+release.version)||ids.has(item.sourceId))throw Error('MFM current pointer: invalid/duplicate source '+String(item.sourceId));
    ids.add(item.sourceId);repoPath(repoRoot,item.capturePath);
  }
  seen.clear();
  for(const item of release.dependencies){
    object(item,'dependency',['key','bookId','sourceId','capturePath']);
    if(typeof item.key!=='string'||!item.key||seen.has(item.key))throw Error('MFM current pointer: missing/duplicate dependency key');
    seen.add(item.key);const binding=registry.crossFactionUnitDependencies.find(row=>row.sourceId===item.sourceId&&row.sourceCapturePath===item.capturePath);
    if(!binding||binding.consumerArmyBookId!==item.bookId||!item.sourceId.endsWith('-mfm-'+release.version)||ids.has(item.sourceId))throw Error('MFM current pointer: dependency source mismatch '+String(item.key));
    ids.add(item.sourceId);repoPath(repoRoot,item.capturePath);
  }
  return structuredClone(release);
}

export function getCurrentMfmSource(bookId,{repoRoot=defaultRoot}={}){
  const route=read(repoRoot,`books/${bookId}/book.config.json`).passport?.mfm;
  if(route?.currentRelease!=='mfm/current.json'||route.scope!==bookId)throw Error(`Book passport ${bookId}: mfm.currentRelease/scope must select the shared current MFM release`);
  const release=readCurrentMfmRelease({repoRoot}),entry=release.factions.find(row=>row.bookId===route.scope);
  if(!entry)throw Error('Current MFM faction is not registered: '+String(bookId));
  const capture=read(repoRoot,entry.capturePath);
  if(capture.factionId!==bookId||capture.version!==release.version||capture.currentness!=='CURRENT')throw Error('Current MFM capture identity/version mismatch: '+bookId);
  return {sourceId:entry.sourceId,capturePath:entry.capturePath,version:release.version,
    observedAt:capture.observedAt??capture.currentnessEvidence?.observedAt??capture.currentnessCutoff,
    verifiedAt:capture.verifiedAt??capture.currentnessCutoff,effectiveDate:capture.effectiveDate??capture.currentnessEvidence?.effectiveDate??null,
    currentnessCutoff:capture.currentnessCutoff};
}

/** Explicit historical requests never silently follow a later current pointer. */
export function resolveMfmReleasePaths(version,{repoRoot=defaultRoot}={}){
  const historical={
    'v1.4':{registryVersion:'v1.4',identityRegistryPath:'mfm/content/mfm-v1.4.identity-registry.json',crossDomainBindingsPath:'mfm/content/mfm-army-mission-bindings.json'},
    'v1.5':{registryVersion:'v1.5-scoped-six',identityRegistryPath:'mfm/content/mfm-v1.5-scoped.identity-registry.json',crossDomainBindingsPath:'mfm/content/mfm-army-mission-bindings.json'},
    'v1.6':{registryVersion:'v1.6-scoped-six',identityRegistryPath:'mfm/content/mfm-v1.6-scoped.identity-registry.json',crossDomainBindingsPath:'mfm/content/mfm-v1.6-army-mission-bindings.json'}
  };
  if(Object.hasOwn(historical,version))return {version,...historical[version],sourceRegistryPath};
  if(!isModernMfmVersion(version))throw Error('Unsupported MFM release '+String(version));
  const current=readCurrentMfmRelease({repoRoot});
  if(current.version===version)return {version,registryVersion:current.registryVersion,identityRegistryPath:current.identityRegistryPath,crossDomainBindingsPath:current.crossDomainBindingsPath,sourceRegistryPath:current.sourceRegistryPath};
  const identityRegistryPath=`mfm/content/mfm-${version}-scoped.identity-registry.json`,crossDomainBindingsPath=`mfm/content/mfm-${version}-army-mission-bindings.json`;
  const registry=read(repoRoot,identityRegistryPath);
  if(mfmVersionFromRegistryVersion(registry.sourceVersion)!==version)throw Error('MFM historical registry version mismatch '+version);
  repoPath(repoRoot,crossDomainBindingsPath);
  return {version,registryVersion:registry.sourceVersion,identityRegistryPath,crossDomainBindingsPath,sourceRegistryPath};
}

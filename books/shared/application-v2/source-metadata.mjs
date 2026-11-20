/** Small runtime projection of the accepted source owners. No rule execution. */
import currentMfm from '../../../mfm/current.json' with {type:'json'};
import coreCanonical from '../../core-rules/content/core-rules.digital-11e.json' with {type:'json'};

const defaultRootURL=new URL('../../../',import.meta.url);
const currentMfmPath='mfm/current.json',corePath='books/core-rules/content/core-rules.digital-11e.json';
const preloadedOwners=new Map([[currentMfmPath,currentMfm],[corePath,coreCanonical]]);
const text=value=>typeof value==='string'&&value.trim();
const isoDate=value=>{
  if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value))return false;
  const parsed=new Date(`${value}T00:00:00Z`);
  return Number.isFinite(parsed.valueOf())&&parsed.toISOString().slice(0,10)===value;
};

export function projectCoreBattleSizes(rule) {
  if(rule?.code!=='25.03')throw new TypeError('Core battle size source unavailable');
  const tables=(rule.content||[]).filter(block=>block.type==='comparison-table'&&block.columns?.[0]==='BATTLE SIZE');
  if(tables.length!==1)throw new TypeError('Core battle size table unavailable');
  const table=tables[0],points=table.columns.indexOf('Points Total')-1,detachments=table.columns.indexOf('Detachment Points (DP)')-1;
  if(points<0||detachments<0||!Array.isArray(table.rows)||!table.rows.length)throw new TypeError('Core battle size columns unavailable');
  const positive=value=>typeof value==='string'&&/^\d+$/.test(value)&&Number.isSafeInteger(Number(value))&&Number(value)>0;
  const rows=table.rows.map(row=>{
    if(!text(row.label)||!positive(row.cells?.[points])||!positive(row.cells?.[detachments]))throw new TypeError('Core battle size row unavailable');
    return Object.freeze({label:row.label,pointsLimit:Number(row.cells[points]),detachmentPoints:Number(row.cells[detachments])});
  });
  if(new Set(rows.map(row=>row.label)).size!==rows.length)throw new TypeError('Duplicate Core battle size row');
  return Object.freeze(rows);
}

export function projectCoreSourceMetadata(core) {
  const {captureDate,corpusFingerprint}=core?.meta||{};
  if(!isoDate(captureDate)||!text(corpusFingerprint))throw new TypeError('Core source metadata unavailable');
  const rule=core.records?.find(record=>record.code==='25.03');
  return Object.freeze({captureDate,corpusFingerprint,
    battleSizes:projectCoreBattleSizes(rule),battleSizeRule:{code:rule.code,content:structuredClone(rule.content)}});
}

export function projectSourcesMetadata(release,core) {
  if(!text(release?.version))throw new TypeError('Points source metadata unavailable');
  if(!isoDate(core?.captureDate)||!text(core?.corpusFingerprint))throw new TypeError('Core source metadata unavailable');
  return Object.freeze({mfmVersion:release.version,coreCaptureDate:core.captureDate,coreCorpusFingerprint:core.corpusFingerprint});
}

export function formatSourcesLine(metadata) {
  if(!text(metadata?.mfmVersion)||!isoDate(metadata?.coreCaptureDate))throw new TypeError('Sources line metadata unavailable');
  const date=new Intl.DateTimeFormat('en-GB',{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'})
    .format(new Date(`${metadata.coreCaptureDate}T00:00:00Z`));
  return `Points: Munitorum Field Manual ${metadata.mfmVersion} · Core Rules: ${date}`;
}

/** JSON module owners are parsed once by the module loader. An explicit reader
 * selects independent inputs for isolated consumers and source-mutation QA. */
export function createSourceMetadataLoader(options={}) {
  const {fetch:read=globalThis.fetch,rootURL=defaultRootURL,readPassport}=options;
  const usePreloadedOwners=!Object.hasOwn(options,'fetch');
  const root=new URL(rootURL),pending=new Map();
  const repositoryURL=path=>{
    if(typeof path!=='string'||!path||path.includes('\\')||path.split('/').some(part=>!part||part==='.'||part==='..')||!/^(?:books|mfm)\//.test(path))
      throw new TypeError('Invalid source metadata path');
    return new URL(path,root);
  };
  function cached(key,load) {
    if(!pending.has(key)){
      const request=Promise.resolve().then(load).catch(error=>{pending.delete(key);throw error;});
      pending.set(key,request);
    }
    return pending.get(key);
  }
  async function json(path) {
    if(usePreloadedOwners&&preloadedOwners.has(path))return preloadedOwners.get(path);
    const response=await read(repositoryURL(path));
    if(!response.ok)throw new TypeError('Source metadata unavailable');
    return response.json();
  }
  const release=path=>cached(path,async()=>{
    const value=await json(path);
    if(value.schema!=='current-mfm-release/v1'||!text(value.version))throw new TypeError('Points source metadata unavailable');
    return {version:value.version};
  });
  const core=()=>cached('core',async()=>projectCoreSourceMetadata(await json(corePath)));
  const global=async()=>{
    const [points,metadata]=await Promise.all([release(currentMfmPath),core()]);
    return projectSourcesMetadata(points,metadata);
  };
  const book=async(bookId)=>{
    if(typeof bookId!=='string'||!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(bookId))throw new TypeError('Invalid source metadata book');
    const path=await cached(`passport:${bookId}`,async()=>{
      const config=readPassport?null:await json(`books/${bookId}/book.config.json`);
      const passport=readPassport?await readPassport(bookId):config?.passport;
      if(config&&config.id!==bookId||passport?.schema!=='army-book-passport/v1')throw new TypeError('Wrong source metadata passport');
      const selected=passport.mfm?.currentRelease;
      repositoryURL(selected);return selected;
    });
    const [points,metadata]=await Promise.all([release(path),core()]);
    return projectSourcesMetadata(points,metadata);
  };
  return Object.freeze({core,global,book});
}

export function createSourcesLine(document,metadata,{className='v2-sources-line'}={}) {
  const line=document.createElement('p');line.className=className;line.dataset.v2SourcesLine='';
  line.textContent=formatSourcesLine(metadata);return line;
}

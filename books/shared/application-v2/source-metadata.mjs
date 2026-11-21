/** Small disposable metadata projection; accepted sources remain build inputs. */
const text=value=>typeof value==='string'&&value.trim()===value&&value.length>0;
const isoDate=value=>typeof value==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(value)&&
  Number.isFinite(Date.parse(value+'T00:00:00Z'))&&new Date(value+'T00:00:00Z').toISOString().slice(0,10)===value;

function validateMetadata(value){
  const fail=()=>{throw new TypeError('Source metadata unavailable or invalid');};
  if(value?.schema!=='application-source-metadata/v1'||!text(value.mfm?.version)||
    !isoDate(value.core?.captureDate)||!/^[a-f\d]{64}$/i.test(value.core?.corpusFingerprint)||
    !Array.isArray(value.core.battleSizes)||!value.core.battleSizes.length||
    !value.books||typeof value.books!=='object'||Array.isArray(value.books))fail();
  const labels=new Set();
  for(const row of value.core.battleSizes){
    if(!row||!text(row.label)||labels.has(row.label)||!Number.isSafeInteger(row.pointsLimit)||row.pointsLimit<=0||
      !Number.isSafeInteger(row.detachmentPoints)||row.detachmentPoints<=0)fail();
    labels.add(row.label);Object.freeze(row);
  }
  const entries=Object.entries(value.books);
  if(!entries.length||entries.some(([id,book])=>!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)||!text(book?.mfmVersion)))fail();
  Object.freeze(value.core.battleSizes);Object.freeze(value.core);
  for(const [,book]of entries)Object.freeze(book);
  Object.freeze(value.books);Object.freeze(value.mfm);return Object.freeze(value);
}

export function formatSourcesLine(metadata) {
  if(!text(metadata?.mfmVersion)||!isoDate(metadata?.coreCaptureDate))throw new TypeError('Sources line metadata unavailable');
  const date=new Intl.DateTimeFormat('en-GB',{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'})
    .format(new Date(`${metadata.coreCaptureDate}T00:00:00Z`));
  return `Points: Munitorum Field Manual ${metadata.mfmVersion} · Core Rules: ${date}`;
}

/** One normal fetch/parse shared by Home, all books and import notes. A failed
 * read is retryable. This module imports no JSON and reads no full rule corpus. */
export function createSourceMetadataLoader({fetch=globalThis.fetch}={}) {
  let pending;
  const data=()=>pending ||= Promise.resolve().then(async()=>{
    const response=await fetch(new URL('./generated/source-metadata.v1.json',import.meta.url));
    if(!response.ok)throw new TypeError('Source metadata unavailable');
    return validateMetadata(await response.json());
  }).catch(error=>{pending=undefined;throw error;});
  const project=(metadata,version)=>Object.freeze({mfmVersion:version,
    coreCaptureDate:metadata.core.captureDate,coreCorpusFingerprint:metadata.core.corpusFingerprint});
  return Object.freeze({
    global:async()=>{const metadata=await data();return project(metadata,metadata.mfm.version);},
    core:async()=>{const metadata=await data();return metadata.core;},
    book:async id=>{
      if(typeof id!=='string'||!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id))throw new TypeError('Invalid source metadata book');
      const metadata=await data(),book=Object.hasOwn(metadata.books,id)&&metadata.books[id];
      if(!book)throw new TypeError('Source metadata unavailable for book '+id);
      return project(metadata,book.mfmVersion);
    }
  });
}

export function createSourcesLine(document,metadata,{className='v2-sources-line'}={}) {
  const line=document.createElement('p');line.className=className;line.dataset.v2SourcesLine='';
  line.textContent=formatSourcesLine(metadata);return line;
}

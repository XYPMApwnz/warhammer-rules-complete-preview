/** URL identity only. No facts, roster inference, history state or presentation. */
export const destinations=Object.freeze(['HOME','CORE_RULES','ARMY_BOOK','ROSTER','PERSONAL_GUIDE','UNIT_INSTANCE','REFERENCE','GLOSSARY']);
const keys=Object.freeze({bookId:'book',registryId:'registry',rosterId:'roster',instanceId:'instance',profileId:'profile',
  scopeId:'scope',fieldPath:'field',chapterId:'chapter',sectionId:'section'});
const text=value=>value===undefined||value===null||value===''?null:value;
export function normalizeRoute(input) {
  if(!input||!destinations.includes(input.destination))throw new TypeError('Invalid V2 destination');
  const route={destination:input.destination};
  for(const key of [...Object.keys(keys),'canonicalId']) {
    const value=text(input[key]);if(value!==null&&(typeof value!=='string'||!value.trim()))throw new TypeError('Invalid route identity');
    route[key]=value;
  }
  const require=(...fields)=>{if(fields.some(key=>!route[key]))throw new TypeError('Incomplete V2 route context');};
  if(['ARMY_BOOK','ROSTER','PERSONAL_GUIDE','UNIT_INSTANCE'].includes(route.destination))require('bookId');
  if(['PERSONAL_GUIDE','UNIT_INSTANCE'].includes(route.destination))require('rosterId');
  if(route.destination==='UNIT_INSTANCE')require('instanceId');
  if(route.destination==='CORE_RULES')require('registryId');
  if(route.destination==='REFERENCE'||route.canonicalId&&route.destination==='GLOSSARY')require('registryId','canonicalId');
  if(route.rosterId)require('bookId');
  if(route.instanceId)require('bookId','rosterId');
  if(route.profileId||route.scopeId)require('instanceId');
  return Object.freeze(route);
}
export function encodeRoute(baseURL,input) {
  const route=normalizeRoute(input),url=new URL(baseURL);
  // Remove the prior entity's context before writing this entity's identity.
  for(const name of ['v2','view',...Object.values(keys)])url.searchParams.delete(name);
  url.searchParams.set('v2',route.destination);
  for(const [key,name]of Object.entries(keys))if(route[key])url.searchParams.set(name,route[key]);
  const aliases={ROSTER:'view-roster',PERSONAL_GUIDE:'view-roster-guide',GLOSSARY:'view-glossary'};
  const target=route.destination==='UNIT_INSTANCE'?`roster-unit/${encodeURIComponent(route.instanceId)}`:
    route.canonicalId||aliases[route.destination]||'';
  url.hash=target?encodeURIComponent(target):'';
  if(route.destination==='REFERENCE'||route.destination==='GLOSSARY'&&route.canonicalId)url.searchParams.set('view','reference');
  return url.href;
}
export function decodeRoute(address,{bookId=null,identityFor=()=>null}={}) {
  const url=new URL(address),query=url.searchParams;
  for(const name of ['v2','view',...Object.values(keys)])if(query.getAll(name).length>1)throw new TypeError('Ambiguous V2 route parameter');
  let target;try{target=decodeURIComponent(url.hash.slice(1));}catch{throw new TypeError('Invalid V2 route target');}
  const identity=identityFor(target),input={};
  for(const [key,name]of Object.entries(keys))input[key]=query.get(name);
  input.bookId ||= bookId;
  input.registryId ||= identity?.registryId || input.bookId;
  input.canonicalId=target||null;
  if(query.has('v2'))input.destination=query.get('v2');
  else if(target==='view-roster')input.destination='ROSTER';
  else if(target==='view-roster-guide')input.destination='PERSONAL_GUIDE';
  else if(target==='view-glossary')input.destination='GLOSSARY';
  else if(target.startsWith('roster-unit/'))input.destination='UNIT_INSTANCE';
  else if(query.get('view')==='reference'||identity?.registryId==='core-rules')input.destination='REFERENCE';
  else input.destination='ARMY_BOOK';
  if(input.destination==='UNIT_INSTANCE') {
    let instance;try{instance=decodeURIComponent(target.slice('roster-unit/'.length));}catch{throw new TypeError('Invalid physical instance route');}
    if(!target.startsWith('roster-unit/')||input.instanceId&&input.instanceId!==instance)throw new TypeError('Conflicting physical instance route');
    input.instanceId=instance;input.canonicalId=null;
  }
  if(target===({ROSTER:'view-roster',PERSONAL_GUIDE:'view-roster-guide',GLOSSARY:'view-glossary'})[input.destination])input.canonicalId=null;
  return normalizeRoute(input);
}

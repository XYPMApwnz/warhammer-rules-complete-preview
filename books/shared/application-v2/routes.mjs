import {decodeRoute,encodeRoute} from '../army-book-app-v2/route-context.mjs';

/** Shell selectors are not canonical entities. Bound entities use the existing contract. */
export function resolveApplicationRoute(address,registry) {
  const url=new URL(address),query=url.searchParams;
  if(['v2','book','registry','section'].some(key=>query.getAll(key).length>1))throw new TypeError('Ambiguous application route');
  const bookId=query.get('book') || registry.forPath(url.pathname)?.id ||
    (query.get('v2')==='ARMY_BOOK'&&registry.has(query.get('registry'))?query.get('registry'):null);
  const destination=query.get('v2') || (bookId?'ARMY_BOOK':'HOME');
  const local=new Set(['ARMY_BOOK','ROSTER','PERSONAL_GUIDE','UNIT_INSTANCE','REFERENCE','GLOSSARY']);
  if(bookId) {
    if(!registry.has(bookId))throw new TypeError('Unknown Army Book');
    if(!local.has(destination))throw new TypeError('This destination does not belong to an Army Book');
    // Leave legacy hashes/registry inference to the module's canonical resolver.
    return Object.freeze({destination,bookId,module:true});
  }
  if(destination==='ROSTER' && !url.hash && !['registry','roster','instance','profile','scope','field','chapter','section','view'].some(key=>query.has(key)))
    return Object.freeze({destination,bookId:null,module:false});
  if(!query.has('v2')&&!url.hash)query.set('v2','HOME');
  const route=decodeRoute(url.href);
  if(!['HOME','CORE_RULES','GLOSSARY','REFERENCE'].includes(route.destination) || route.canonicalId&&!['CORE_RULES','GLOSSARY','REFERENCE'].includes(route.destination) ||
    route.destination==='CORE_RULES' && route.registryId!=='core-rules')throw new TypeError('This destination is not integrated yet');
  return Object.freeze({...route,module:false});
}

export function applicationRouteURL(baseURL,input) {
  if(input.destination==='ROSTER' && !input.bookId) {
    const url=new URL(encodeRoute(baseURL,{destination:'HOME'}));url.searchParams.set('v2','ROSTER');return url.href;
  }
  return encodeRoute(baseURL,input);
}

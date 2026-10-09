import {encodeRoute} from '../../books/shared/army-book-app-v2/route-context.mjs';

// Old identity aliases are resolved once by the shared reference contract after loading.
const original=new URL(location.href),target=new URL(encodeRoute(new URL('../../v2/app.html',import.meta.url),{destination:'GLOSSARY'}));
let hash;try{hash=decodeURIComponent(original.hash.slice(1));}catch{hash='';}
if(hash)target.searchParams.set('legacy',hash);
for(const [old,key] of [['book','context'],['parent','parent'],['recordType','type']])if(original.searchParams.get(old))target.searchParams.set(key,original.searchParams.get(old));
location.replace(target.href);

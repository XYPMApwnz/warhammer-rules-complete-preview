import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createReaderNavigation} from '../books/core-rules/reader/mount.mjs';
import {createCoreFactProjection} from '../books/core-rules/content/core-fact-projection.mjs';
import {encodeRoute,decodeRoute} from '../books/shared/army-book-app-v2/route-context.mjs';
import {resolveApplicationRoute} from '../books/shared/application-v2/routes.mjs';
import {createBookRegistry} from '../books/shared/application-v2/registry.mjs';

const source=new URL('../books/core-rules/reader/',import.meta.url);
const placements=JSON.parse(fs.readFileSync(new URL('search-index.json',source),'utf8'));
const chapters=fs.readdirSync(source).filter(file=>file.endsWith('.html'));
const baseURL='https://example.invalid/books/core-rules/reader/index.html',entryURL='https://example.invalid/v2/app.html';
const navigation=createReaderNavigation({chapterURLs:chapters,placements,baseURL});
const registry=createBookRegistry([]),catalog=createCoreFactProjection().catalog;
assert.equal(navigation.chapterIds.length,27);
for(const placement of placements) {
  const id=placement.id||placement.code;assert(catalog.getById(id),`Placement invents a canonical identity: ${id}`);
  const route=navigation.routeFor(new URL(placement.url,baseURL));
  assert.equal(route.canonicalId,id);
  const url=encodeRoute(entryURL,route),decoded=decodeRoute(url);
  assert.equal(resolveApplicationRoute(url,registry).destination,'CORE_RULES');
  assert.equal(navigation.locationFor(decoded).url,new URL(placement.url,baseURL).href);
}
assert.equal(navigation.locationFor({destination:'CORE_RULES',registryId:'core-rules'}).url,baseURL);
for(const route of [
  {destination:'CORE_RULES',registryId:'foreign'},
  {destination:'CORE_RULES',registryId:'core-rules',chapterId:'../outside'},
  {destination:'CORE_RULES',registryId:'core-rules',canonicalId:'invented'},
  {destination:'CORE_RULES',registryId:'core-rules',chapterId:'terrain',canonicalId:'core-blast'},
  {destination:'CORE_RULES',registryId:'core-rules',sectionId:'unrelated',canonicalId:'core-blast'}
])assert.throws(()=>navigation.locationFor(route));
assert.equal(navigation.routeFor('https://foreign.invalid/books/core-rules/reader/terrain.html'),null);
assert.equal(navigation.routeFor('../assets/diagrams/ex9.webp'),null);
const changed=createReaderNavigation({chapterURLs:chapters,placements:placements.map(entry=>({...entry,title:'POISON',text:'POISON',chapter:'POISON'})),baseURL});
for(const id of navigation.chapterIds)assert.equal(changed.locationFor({destination:'CORE_RULES',registryId:'core-rules',chapterId:id}).url,navigation.locationFor({destination:'CORE_RULES',registryId:'core-rules',chapterId:id}).url);
assert.throws(()=>createReaderNavigation({chapterURLs:chapters,placements:[...placements,placements[0]],baseURL}),/Duplicate/);
console.log(JSON.stringify({status:'PASS',chapters:chapters.length,canonicalPlacements:placements.length,factualDataAdded:0,router:'existing V2',proseAuthority:false}));

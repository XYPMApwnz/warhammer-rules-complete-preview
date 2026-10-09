/** Standalone URL/registry controls: no army facts, runtime, history or browser. */
import assert from 'node:assert/strict';
import {normalizeRoute,encodeRoute,decodeRoute,destinations} from './route-context.mjs';
import {createReferenceContract} from './reference-contract.mjs';

const checks=[];
const check=(name,run)=>{run();checks.push(name);};
const base='https://example.invalid/v2/app.html?display=compact';
const routes=[
  {destination:'HOME'},
  {destination:'CORE_RULES',registryId:'core-rules',chapterId:'chapter:movement',sectionId:'section/advance',canonicalId:'core-rule-advance'},
  {destination:'ARMY_BOOK',bookId:'synthetic-a',registryId:'synthetic-a',canonicalId:'unit:sentinel'},
  {destination:'ROSTER',bookId:'synthetic-a',registryId:'synthetic-a',rosterId:'roster:one'},
  {destination:'PERSONAL_GUIDE',bookId:'synthetic-a',registryId:'synthetic-a',rosterId:'roster:one'},
  {destination:'UNIT_INSTANCE',bookId:'synthetic-a',registryId:'synthetic-a',rosterId:'roster:one',instanceId:'unit:one/first'},
  {destination:'REFERENCE',bookId:'synthetic-a',registryId:'synthetic-a',canonicalId:'weapon:beam',rosterId:'roster:one',
    instanceId:'unit:one/first',profileId:'profile:operator',scopeId:'unit:one/first/row:1',fieldPath:'/skill'},
  {destination:'GLOSSARY'},
  {destination:'GLOSSARY',registryId:'core-rules',canonicalId:'core-rule-advance',bookId:'synthetic-a',rosterId:'roster:one'}
];

check('Every destination round-trips without external history state',()=>{
  assert.deepEqual(new Set(routes.map(route=>route.destination)),new Set(destinations));
  for(const input of routes){
    const normalized=normalizeRoute(input),url=encodeRoute(base,input);
    assert.deepEqual(decodeRoute(url),normalized,input.destination+' lost route identity');
    assert.deepEqual(decodeRoute(new URL(url).href),normalized,'A fresh URL consumer lost identity');
    assert.equal(new URL(url).searchParams.get('display'),'compact','Unrelated parameter was lost');
    assert.equal(encodeRoute(url,decodeRoute(url)),url,'Canonical route rebuild was not deterministic');
    assert.ok(Object.isFrozen(normalized));
  }
});

check('Unicode and URL punctuation preserve exact physical/profile/scope identities',()=>{
  const route={destination:'REFERENCE',bookId:'book α',registryId:'book α',canonicalId:'weapon/#?%+Ж',
    rosterId:'roster/one + two',instanceId:'instance%2F/Ж:1',profileId:'profile/α#1',
    scopeId:'scope/row 1/LOADOUT/%2F',fieldPath:'/fields/0/~1/?#%+',chapterId:'chapter:λ',sectionId:'section/β'};
  assert.deepEqual(decodeRoute(encodeRoute(base,route)),normalizeRoute(route));
  const instance={destination:'UNIT_INSTANCE',bookId:'book α',registryId:'book α',rosterId:'roster%2F',instanceId:'one/%2F/#Ж'};
  assert.deepEqual(decodeRoute(encodeRoute(base,instance)),normalizeRoute(instance),'Physical alias was double-decoded');
});

check('Changing entity removes stale semantic URL context',()=>{
  const effective=encodeRoute(base,routes.find(route=>route.destination==='REFERENCE'));
  const canonical={destination:'REFERENCE',registryId:'core-rules',canonicalId:'core-rule-advance'};
  const url=new URL(encodeRoute(effective,canonical));
  assert.deepEqual(decodeRoute(url.href),normalizeRoute(canonical));
  for(const key of ['book','roster','instance','profile','scope','field','chapter','section'])
    assert.equal(url.searchParams.has(key),false,'Stale '+key+' survived canonical navigation');
  assert.equal(url.searchParams.get('view'),'reference','Standalone reference alias was lost');
  const home=new URL(encodeRoute(url.href,{destination:'HOME'}));
  assert.equal(home.hash,'');assert.equal(home.searchParams.has('view'),false);
  assert.equal(home.searchParams.get('display'),'compact');
});

check('Missing required physical identity is invalid rather than inferred',()=>{
  const invalid=[
    {},{destination:'UNKNOWN'},{destination:'ARMY_BOOK'},{destination:'ROSTER'},
    {destination:'PERSONAL_GUIDE',bookId:'a'},
    {destination:'UNIT_INSTANCE',bookId:'a',rosterId:'r'},
    {destination:'REFERENCE',canonicalId:'weapon'},
    {destination:'REFERENCE',registryId:'a'},
    {destination:'CORE_RULES'},
    {destination:'REFERENCE',registryId:'a',canonicalId:'weapon',instanceId:'owner'},
    {destination:'REFERENCE',registryId:'a',canonicalId:'weapon',rosterId:'r'},
    {destination:'REFERENCE',registryId:'a',canonicalId:'weapon',profileId:'profile'},
    {destination:'REFERENCE',registryId:'a',canonicalId:'weapon',scopeId:'scope'},
    {destination:'REFERENCE',registryId:'a',canonicalId:'weapon',bookId:'a',rosterId:'r',instanceId:' '},
    {destination:'REFERENCE',registryId:'a',canonicalId:22}
  ];
  for(const route of invalid)assert.throws(()=>normalizeRoute(route),TypeError,JSON.stringify(route));
  assert.throws(()=>decodeRoute(base+'#roster-unit/owner',{bookId:'a'}),TypeError,'Missing roster was inferred');
  assert.throws(()=>decodeRoute(base+'&v2=UNIT_INSTANCE&book=a&roster=r&instance=other#roster-unit%2Fowner'),TypeError);
});

const field=(owner,text)=>({id:owner+'::/text',source:{entityId:owner,path:'/text'},type:'text',value:text});
const card=(id,text,domain='ARMY')=>({id,title:id,kind:domain==='CORE'?'CORE_MAIN_RULE':'SOURCE_ERRATUM',domain,
  fields:[field(id,text)],children:[],links:[]});
const common=card('core-rule-advance','Shared canonical Core definition','CORE');
const localA=card('errata-1','First book correction'),localB=card('errata-1','Second book correction');
const visible=card('selected-rule','Selected rule'),linked=card('linked-reference','Referenced book rule');
visible.links.push({targetId:linked.id,relation:'reference'});
const excluded=card('unselected-rule','Not roster content');
const registry=(id,records)=>createReferenceContract({registryId:id,cards:new Map(records.map(record=>[record.id,record])),
  index:{entries:records.map(record=>({targetId:record.id,label:record.title,category:record.kind,aliases:[]}))}});
const first=registry('synthetic-a',[localA,common,visible,linked,excluded]);
const second=registry('synthetic-b',[localB,common]);

check('Namespaced collisions resolve only their owning canonical registry',()=>{
  const a=first.identityFor('errata-1'),b=second.identityFor('errata-1');
  assert.notDeepEqual(a,b);assert.equal(a.canonicalId,b.canonicalId);
  assert.equal(first.canResolve(a),true);assert.equal(second.canResolve(b),true);
  assert.equal(first.canResolve(b),false);assert.equal(second.canResolve(a),false);
  assert.equal(first.resolve(b),null);assert.equal(second.resolve(a),null);
  assert.equal(first.resolve(a).sections[0].fields[0],localA.fields[0]);
  assert.equal(second.resolve(b).sections[0].fields[0],localB.fields[0]);
  assert.deepEqual(first.resolve(a).identity,a);
  for(const identity of [a,b]){
    const route=decodeRoute(encodeRoute(base,{destination:'REFERENCE',...identity}));
    assert.equal(route.registryId,identity.registryId);assert.equal(route.canonicalId,identity.canonicalId);
  }
  assert.deepEqual(first.identityFor(common.id),second.identityFor(common.id));
  assert.equal(first.identityFor(common.id).registryId,'core-rules');
  assert.equal(first.identityFor('missing'),null);
});

check('Legacy routes resolve through supplied canonical registry identity',()=>{
  const options={bookId:'synthetic-a',identityFor:first.identityFor};
  const cases=[
    ['#errata-1',{destination:'ARMY_BOOK',bookId:'synthetic-a',registryId:'synthetic-a',canonicalId:'errata-1'}],
    ['#core-rule-advance',{destination:'REFERENCE',bookId:'synthetic-a',registryId:'core-rules',canonicalId:'core-rule-advance'}],
    ['&view=reference#errata-1',{destination:'REFERENCE',bookId:'synthetic-a',registryId:'synthetic-a',canonicalId:'errata-1'}],
    ['#view-roster',{destination:'ROSTER',bookId:'synthetic-a',registryId:'synthetic-a'}],
    ['&roster=r#view-roster-guide',{destination:'PERSONAL_GUIDE',bookId:'synthetic-a',registryId:'synthetic-a',rosterId:'r'}],
    ['&roster=r#roster-unit%2Fowner',{destination:'UNIT_INSTANCE',bookId:'synthetic-a',registryId:'synthetic-a',rosterId:'r',instanceId:'owner'}],
    ['#view-glossary',{destination:'GLOSSARY',bookId:'synthetic-a',registryId:'synthetic-a'}]
  ];
  for(const [suffix,expected] of cases)assert.deepEqual(decodeRoute(base+suffix,options),normalizeRoute(expected),suffix);
  const explicitlyOther=decodeRoute(base+'&v2=REFERENCE&registry=synthetic-b#errata-1',options);
  assert.equal(explicitlyOther.registryId,'synthetic-b','Local resolver overrode explicit registry');
  assert.equal(first.canResolve(explicitlyOther),false,'Wrong book substituted a colliding local ID');
});

check('Book membership and canonical reference closure remain distinct',()=>{
  const allowed=new Set([visible.id]),snapshot=[...allowed];
  assert.equal(first.canResolve(first.identityFor(visible.id),allowed),true);
  assert.equal(first.canResolve(first.identityFor(linked.id),allowed),true,'Visible canonical link became unavailable');
  assert.equal(first.canResolve(first.identityFor(common.id),allowed),true,'Core reference required roster membership');
  assert.equal(first.canResolve(first.identityFor(excluded.id),allowed),false,'Unrelated book content entered personal scope');
  assert.equal(first.canResolve(first.identityFor(common.id),new Set()),true);
  assert.deepEqual([...allowed],snapshot,'Reference resolution mutated content membership');
  const route={destination:'REFERENCE',...first.identityFor(common.id),bookId:'synthetic-a',rosterId:'r'};
  assert.deepEqual(decodeRoute(encodeRoute(base,route)),normalizeRoute(route));
});

check('Ambiguous or malformed URL identity fails closed',()=>{
  for(const parameter of ['v2','view','book','registry','roster','instance','profile','scope','field','chapter','section'])
    assert.throws(()=>decodeRoute(base+'&'+parameter+'=a&'+parameter+'=b#entry',{bookId:'a'}),TypeError,parameter);
  assert.throws(()=>decodeRoute(base+'#%XX',{bookId:'a'}),TypeError);
  assert.throws(()=>decodeRoute(base+'&v2=UNRECOGNIZED'),TypeError);
});

console.log(JSON.stringify({status:'PASS',checks:checks.length,standaloneSynthetic:true,
  destinations:destinations.length,namespaceSafeIdentity:'PASS',urlOnlySemanticIdentity:'PASS',
  profileScopeRoundTrip:'PASS',legacyAliases:'PASS',referenceScopeSeparation:'PASS'}));

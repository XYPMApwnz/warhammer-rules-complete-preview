/** Accepted-source oracle -> import -> executor -> production presentation.
 * No roll simulation, characteristic substitution or title-based joining. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createDGRosterRuntime} from './roster-boot.mjs';
import {parseSourceHtml,sourceNodeText} from './raw-source.mjs';
import {projectInstanceCards} from '../../shared/army-book-app-v2/personal.mjs';
import {weaponDisplayKey} from '../../shared/army-book-app-v2/effective-datasheet-presentation.mjs';
import {assertSourceEffectExpectation} from '../../shared/roster-v2/source-effect-expectations-qa.mjs';
import {resolveRecipient,recipientDeclarationView} from '../../shared/rule-contract-v2/recipients.mjs';
import {validateRosterEffectDeclarations} from '../../shared/roster-v2/effects.mjs';
import {validatePredicate,evaluatePredicate} from './rule-contract-schema.mjs';
const read=p=>JSON.parse(fs.readFileSync(new URL(p,import.meta.url),'utf8'));
const book=read('./generated/rule-contract-effective.json'),payload=read('./generated/app-presentation.json');
const cards=new Map(payload.cards.map(c=>[c.id,c]));
export const criticalHitExpectations=read('./critical-hit-source-expectations.json').cases;
const normalize=s=>s.replace(/\s+/g,'').replace(/(?<=\w)\.(?=\w)/g,'.');
const text=`+ DETACHMENT: Virulent Vectorium
1x Biologus Putrifier (0 pts): Hyper blight grenades, Injector pistol, Plague knives
1x Biologus Putrifier (0 pts): Hyper blight grenades, Injector pistol, Plague knives
5x Plague Marines (0 pts)
• 1x Plague Champion: Boltgun, Plague knives
• 4x Plague Marine: Boltgun, Plague knives
5x Plague Marines (0 pts)
• 1x Plague Champion: Boltgun, Plague knives
• 4x Plague Marine: Boltgun, Plague knives
1x Noxious Blightbringer (0 pts): Plasma pistol, Cursed plague bell
Enhancement: Daemon Weapon of Nurgle`;
const first='parsed-unit-1',duplicate='parsed-unit-2',body='parsed-unit-3',other='parsed-unit-4',bearer='parsed-unit-5';
function verify(candidate=book,present=projectInstanceCards){
  const binding=candidate.entities.find(e=>e.id==='datasheet-biologus-putrifier:section:1').ruleContract.clauses[0].rosterEffects.find(e=>e.field==='criticalHitThreshold');
  assert.deepEqual(binding?.conditions.map(c=>[c.binding,c.predicate.predicate,c.predicate.subject,c.predicate.contextLevel,c.predicate.arguments]),
    [['SOURCE','LEADING','MODEL','ROSTER',{value:true}]],'Source activation gate must remain explicit');
  const r=createDGRosterRuntime(candidate);assert.equal(r.import(text).status,'READY');
  const values=id=>r.effective(id).weapons.map(w=>w.fields.find(f=>f.label==='criticalHitThreshold')?.value);
  for(const id of [first,duplicate,body,other])assert.ok(values(id).every(v=>v===undefined));
  r.attach(first,body);r.attach(bearer,body);
  for(const id of [first,body,bearer])assert.ok(values(id).length&&values(id).every(v=>v===5));
  for(const id of [duplicate,other])assert.ok(values(id).every(v=>v===undefined));
  for(const id of [first,body,bearer]){
    const effective=r.effective(id),unit=r.state.units.find(u=>u.instanceId===id),view=present(cards,unit,effective);
    for(const weapon of effective.weapons){
      const card=view.get(weapon.id).find(c=>c.scopeId===weapon.scopeId);
      assert.equal(card.criticalHitThreshold,5,'Production Effective presentation lost threshold');
      assert.ok(card.criticalHitSources.length&&card.criticalHitSources.every(s=>s.targetInstanceId===id));
      const canonical=book.entities.find(e=>e.id===weapon.id);
      assert.equal(weapon.fields.find(f=>f.label==='skill').value,canonical.data.skill,'Threshold cannot change BS/WS');
      const missing=structuredClone(card);delete missing.criticalHitThreshold;delete missing.criticalHitSources;
      assert.notEqual(weaponDisplayKey(card),weaponDisplayKey(missing),'Threshold must split presentation groups');
    }
  }
  for(const expectation of criticalHitExpectations){
    const applied=r.projection.units.flatMap(u=>u.applied).filter(a=>a.ruleId===expectation.source.canonicalId&&a.field==='criticalHitThreshold');
    assertSourceEffectExpectation({expectation,book:candidate,applied,observation:applied.map(a=>a.after),expectedObservation:applied.map(()=>5)});
  }
  const snapshot=r.snapshot(),before=r.projection;r.load(JSON.parse(JSON.stringify(snapshot)));assert.deepEqual(r.projection,before);
  r.detach(first);for(const id of [first,body])assert.ok(values(id).every(v=>v===undefined));
  assert.ok(values(bearer).some(v=>v===5),'Independent bearer Enhancement remains');
  for(const w of r.effective(bearer).weapons)assert.equal(w.fields.find(f=>f.label==='criticalHitThreshold')?.value,
    book.entities.find(e=>e.id===w.id).data.mode==='melee'?5:undefined,'Melee-only Enhancement cannot affect ranged weapons');
  r.reattach(first,body);assert.deepEqual(r.projection,before);
  const removed=structuredClone(snapshot);removed.units.find(u=>u.instanceId===bearer).enhancementIds=[];
  r.load(removed);r.detach(first);assert.ok(values(bearer).every(v=>v===undefined));
  const poisoned=r.effective(other);poisoned.weapons[0].fields.push({label:'criticalHitThreshold',value:5});
  assert.throws(()=>projectInstanceCards(cards,r.state.units.find(u=>u.instanceId===other),poisoned),/Critical Hit presentation/);
  return r;
}
for(const [i,file]of ['Biologus-Putrifier.html','death-guard.html'].entries()){
  const html=fs.readFileSync(new URL('./sources/accepted-waha-pages/'+file,import.meta.url),'utf8');
  assert.ok(normalize(sourceNodeText(html,parseSourceHtml(html))).includes(normalize(criticalHitExpectations[i].source.quote)),'Independent accepted raw expectation');
}
verify();let mutations=0;
for(const kind of ['missing','value','recipient','gate']){
  const bad=structuredClone(book),rule=bad.entities.find(e=>e.id===criticalHitExpectations[0].source.canonicalId),clause=rule.ruleContract.clauses[0],effect=clause.rosterEffects.find(e=>e.field==='criticalHitThreshold');
  if(kind==='missing')bad.entities.find(e=>e.id===criticalHitExpectations[0].source.canonicalId).ruleContract.clauses[0].rosterEffects=bad.entities.find(e=>e.id===criticalHitExpectations[0].source.canonicalId).ruleContract.clauses[0].rosterEffects.filter(e=>e!==effect);
  if(kind==='value')effect.value=4;
  if(kind==='recipient')resolveRecipient(rule,clause,effect.recipientId).from='SOURCE_UNIT_MODELS';
  if(kind==='gate')effect.conditions=[];
  assert.throws(()=>verify(bad),undefined,kind+' mutation escaped');mutations++;
}
assert.throws(()=>verify(book,(...args)=>{const result=projectInstanceCards(...args);for(const values of result.values())for(const c of values){delete c.criticalHitThreshold;delete c.criticalHitSources;}return result;}));mutations++;
for(const invalid of [{mode:'ADD'},{value:1},{value:7},{value:4.5},{value:'5+'},{unitScope:'FORMED'},{weaponMode:'psychic'}]){
  if(Object.hasOwn(invalid,'unitScope')){
    // This is a malformed producer-address control. Keep its original typed
    // operation guard before canonicalization removes the declaration field.
    const declaration=recipientDeclarationView(book),effect=declaration.entities.find(e=>e.id===criticalHitExpectations[0].source.canonicalId).ruleContract.clauses[0].rosterEffects.find(e=>e.field==='criticalHitThreshold');
    Object.assign(effect,invalid);assert.throws(()=>validateRosterEffectDeclarations(declaration,validatePredicate,evaluatePredicate),/Critical Hit threshold/);mutations++;continue;
  }
  const bad=structuredClone(book),effect=bad.entities.find(e=>e.id===criticalHitExpectations[0].source.canonicalId).ruleContract.clauses[0].rosterEffects.find(e=>e.field==='criticalHitThreshold');
  Object.assign(effect,invalid);assert.throws(()=>createDGRosterRuntime(bad),/Critical Hit threshold/);mutations++;
}
export const criticalHitGuardResult={status:'PASS',ids:criticalHitExpectations.map(e=>e.id),mutations,physicalIsolation:true,sourceBacked:true,presentation:true};
console.log(JSON.stringify(criticalHitGuardResult));

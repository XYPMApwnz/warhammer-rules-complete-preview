import assert from 'node:assert/strict';
import {readdir,readFile,stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {assertOwnedMobileRouteInventory,assertOwnedMobileStubOutputs} from '../../../tests/helpers/mobile-route-inventory.mjs';

const root=new URL('./',import.meta.url);
assertOwnedMobileRouteInventory({root:path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../..'),bookId:'tau-empire'});
await assertOwnedMobileStubOutputs({root:path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../..'),bookId:'tau-empire'});
const files=(await readdir(root)).filter(name=>name.endsWith('.html'));
const app=await readFile(new URL('../scripts/app.js',root),'utf8');
for(const file of files){
  const html=await readFile(new URL(file,root),'utf8');
  assert.match(html,/data-canonical-reader="\.\.\/reader\.html"/,`${file}: canonical reader target is absent`);
  assert.match(html,/data-canonical-target="[^"]+"/,`${file}: canonical target is absent`);
  assert.match(html,/mobile-route-redirect\.js\?v=2/,`${file}: shared redirect runtime is absent`);
  assert.doesNotMatch(html,/<(?:article|section)\b|class="[^"]*\bunit-card\b|data-rule-id=/,`${file}: compatibility stub contains duplicated content`);
  assert.doesNotMatch(html,/mobile\.js|mobile\.css|phone-popup-controller|book-roster-enhancements/,`${file}: obsolete Phone runtime is present`);
}
const related=await readFile(new URL('related-rules.inc',root),'utf8');
assert.equal([...related.matchAll(/<section class="related-detachment(?: [^"]*)?" data-detachment=/g)].length,8,'Related Rules must contain Core plus 7 T’au detachments');
assert.doesNotMatch(related,/data-eligibility|data-keyword-grants/);
assert.match(app,/shared\/compatible-rules-matrix\.mjs\?v=\d+/,'canonical reader runtime must use the shared matrix-backed Compatible Rules source');
assert.match(app,/WHArmyBook\.install/,'canonical reader runtime must use the shared Army Book contract');
assert.ok(!files.includes('rvarna-battlesuit.html')&&!files.includes('yvahra-battlesuit.html')&&!files.includes('tetras.html'),'retired Imperial Armour routes must be absent');
for(const file of ['ax-1-0-tiger-shark.html','manta.html','tiger-shark.html','taunar-supremacy-armour.html'])assert.ok(files.includes(file),`${file}: current Imperial Armour route missing`);
assert.doesNotMatch(related,/data-term-title="[^"]*"[^>]*data-term-title=/,'Related Rules hydration must be idempotent');
for(const obsolete of ['mobile.js','mobile.css','phone-popup-controller.js'])await assert.rejects(stat(new URL(obsolete,root)),`${obsolete} must not exist`);
console.log(`T'au Empire responsive QA passed: ${files.length} content-free compatibility stubs and 8 Related Rules sections.`);

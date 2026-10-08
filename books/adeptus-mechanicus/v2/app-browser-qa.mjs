import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import {buildApp,readAppInputs} from './app-build.mjs';
import {enumerateExpectedFacts} from './app-fact-oracle.mjs';

const {chromium}=createRequire(import.meta.url)('playwright');
const repo=fileURLToPath(new URL('../../../',import.meta.url));
const appPath='/books/adeptus-mechanicus/v2/app.html';
const payloadPath='/books/adeptus-mechanicus/v2/generated/app-presentation.json';
const inputs=readAppInputs(),payload=buildApp(inputs);
const effective=JSON.parse(fs.readFileSync(new URL('./generated/effective.json',import.meta.url),'utf8'));
const contracts=JSON.parse(fs.readFileSync(new URL('./generated/rule-contracts.json',import.meta.url),'utf8')).contracts;
const entities=new Map(effective.entities.map(entity=>[entity.id,entity]));
const sourceFacts=enumerateExpectedFacts(effective);
const internalSourceIds=[...new Set(effective.entities.map(entity=>entity.provenance.sourceId))];
const internalCanonicalIds=effective.entities.map(entity=>entity.id);
const cards=new Map(payload.cards.map(card=>[card.id,card]));
const byKind=kind=>effective.entities.filter(entity=>entity.kind===kind);
const rows=payload.relatedRules.rows;
assert.equal(byKind('DATASHEET').length,34);
assert.equal(byKind('PROFILE').length,35);
assert.equal(byKind('WEAPON_PROFILE').length,139);
assert.equal(byKind('DETACHMENT').length,10);
assert.equal(byKind('ENHANCEMENT').length,34);
assert.equal(byKind('STRATAGEM').length,51);
assert.equal(Object.keys(contracts).length,204);
assert.ok(rows.every(row=>row.state!=='INVALID'&&row.selectedDetachment.state!=='INVALID'));
for(const id of Object.keys(contracts))assert.ok(cards.has(id),`Missing canonical contract owner ${id}`);

// This server deliberately cannot serve a legacy factual/runtime file. A
// request for one receives poisoned content and fails the request census.
const forbidden=address=>/\/books\/death-guard\/(?!assets\/)/.test(address)||
  /\/books\/adeptus-mechanicus\/(?!v2\/|assets\/)/.test(address)||
  /(?:target-data|compatible-rules\.json|correction-ledger|enhancement-owner|\/glossary\/(?:data|generated)|\/shared\/(?:roster-parser|effect-runtime|roster-context)\.)/.test(address);
const allowed=address=>address===appPath||address===payloadPath||
  /^\/books\/adeptus-mechanicus\/v2\/(?:theme\.css|roster-runtime\.mjs|roster-import\.mjs|roster-import-aliases\.json|generated\/roster-runtime\.json)$/.test(address)||
  /^\/books\/shared\/(?:army-book-app-v2|rule-contract-v2|roster-v2)\/[\w.-]+\.(?:mjs|css)$/.test(address)||
  /^\/books\/shared\/(?:datasheet-system|unit-art)\.css$/.test(address)||
  /^\/books\/adeptus-mechanicus\/assets\/[\w./-]+\.(?:webp|png|jpe?g|svg)$/.test(address)||
  /^\/assets\/[\w./-]+\.(?:webp|png|jpe?g|svg)$/.test(address);
const requests=[],forbiddenRequests=[],unexpectedRequests=[];
let servedPayload=payload;
const mime=address=>address.endsWith('.mjs')?'text/javascript':address.endsWith('.css')?'text/css':address.endsWith('.html')?'text/html':address.endsWith('.json')?'application/json':address.endsWith('.svg')?'image/svg+xml':address.endsWith('.png')?'image/png':address.endsWith('.webp')?'image/webp':'image/jpeg';
const server=http.createServer((request,response)=>{
  const address=new URL(request.url,'http://localhost').pathname;requests.push(address);
  if(forbidden(address)){forbiddenRequests.push(address);response.writeHead(200,{'Content-Type':'text/javascript'});response.end('throw new Error("POISONED_LEGACY_INPUT");');return;}
  if(!allowed(address)){if(address!=='/favicon.ico')unexpectedRequests.push(address);response.writeHead(404);response.end();return;}
  response.writeHead(200,{'Content-Type':mime(address),'Cache-Control':'no-store'});
  response.end(address===payloadPath?JSON.stringify(servedPayload):fs.readFileSync(path.join(repo,address.slice(1))));
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const origin=`http://127.0.0.1:${server.address().port}`;
const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE}:{})});
const screenshots=process.env.ARMY_APP_V2_SCREENSHOTS;
if(screenshots)fs.mkdirSync(screenshots,{recursive:true});
const signature=row=>[row.ruleId,row.kind,row.detachmentId,row.applicability].join('|');
const expectedRelated=(unitId,detachmentId)=>rows.filter(row=>row.unitId===unitId&&(!detachmentId||row.detachmentId===detachmentId))
  .map(row=>({...row,...(detachmentId?row.selectedDetachment:{})})).filter(row=>['MATCH','CONDITIONAL'].includes(row.applicability));
const results=[];
try{
  for(const [device,viewport] of [['desktop',{width:1440,height:1000}],['phone',{width:390,height:844}]]){
    const context=await browser.newContext({viewport,...(device==='phone'?{isMobile:true,hasTouch:true}:{})});
    const page=await context.newPage(),errors=[];
    page.on('pageerror',error=>errors.push(error.message));
    await page.goto(origin+appPath);await page.waitForFunction(()=>Boolean(window.ArmyBookAppV2));
    assert.equal(await page.evaluate(()=>window.ArmyBookAppV2.roster?.state??null),null,'Book mode invented roster state');
    const normalCoverage=new Map();
    const observeNormal=async()=>{
      const observed=await page.evaluate(()=>({facts:[...document.querySelectorAll('main [data-fact-id],dialog[open] [data-fact-id]')]
        .filter(node=>node.getClientRects().length).map(node=>({id:node.dataset.factId,value:JSON.parse(node.dataset.factValue)})),
        text:[...document.querySelectorAll('main,dialog[open]')].map(node=>node.innerText).join('\n')}));
      assert.ok(!internalSourceIds.some(id=>observed.text.includes(id)),`${device} internal source ID in normal/detail text`);
      assert.ok(!internalCanonicalIds.some(id=>observed.text.includes(id)),`${device} internal canonical ID in normal/detail text`);
      assert.doesNotMatch(observed.text,/parsed-unit-|SUPPORT_EXCEPTION|targetUnitReferenceIds|CORE_MAIN_RULE|CORE_ERRATA|\bCURRENT\b/);
      for(const fact of observed.facts)normalCoverage.set(fact.id,fact);
    };
    const normalPresentations=new Map();
    const seenProfiles=new Set(),seenWeapons=new Set(),seenRules=new Set();
    for(const unit of byKind('DATASHEET')){
      await page.evaluate(id=>window.ArmyBookAppV2.open(id),unit.id);
      // Base sizes remain available through the normal optional model details.
      await page.locator('main .ds-model-metadata > summary').click();
      const observed=await page.locator('main').evaluate(main=>({
        root:main.querySelector('.v2-current-card')?.dataset.cardId,
        profiles:[...main.querySelectorAll('.model-profile[data-card-id]')].map(node=>({id:node.dataset.cardId,text:node.textContent})),
        weapons:[...main.querySelectorAll('.weapon-row[data-card-id]')].map(node=>({id:node.dataset.cardId,text:node.textContent,mode:node.closest('.weapon-table').getAttribute('aria-label').split(' ')[0]})),
        facts:[...main.querySelectorAll('[data-fact-id]')].map(node=>({id:node.dataset.factId,value:JSON.parse(node.dataset.factValue),text:node.textContent})),
        text:main.innerText,overflow:document.documentElement.scrollWidth>innerWidth+1,
        debug:!!main.querySelector('.v2-source-evidence'),
        inventedRoster:!!main.querySelector('[data-roster-instance-id],.ds-modifier-breakdown,.ds-granted-ability')
      }));
      assert.equal(observed.root,unit.id);
      assert.equal(observed.overflow,false,`${device} datasheet overflow ${unit.id}`);
      assert.equal(observed.debug,false);
      assert.equal(observed.inventedRoster,false,`${device} book mode invented roster/effective state ${unit.id}`);
      await observeNormal();
      assert.doesNotMatch(observed.text,/parsed-unit-|SUPPORT_EXCEPTION|targetUnitReferenceIds|\bCURRENT\b/);
      assert.deepEqual(observed.profiles.map(profile=>profile.id).sort(),[...unit.data.profileIds].sort(),`${device} model profile scope ${unit.id}`);
      assert.deepEqual(observed.weapons.map(weapon=>weapon.id).sort(),[...unit.data.weaponIds].sort(),`${device} weapon inventory ${unit.id}`);
      assert.equal(new Set(observed.weapons.map(weapon=>weapon.id)).size,observed.weapons.length,'Duplicate canonical weapon rows');
      for(const profile of observed.profiles){seenProfiles.add(profile.id);const source=entities.get(profile.id);for(const [key,value] of Object.entries(source.data.stats))assert.ok(observed.facts.some(fact=>fact.id===`${profile.id}::/stats/${key}`&&fact.value===value),`${device} missing profile stat ${profile.id}/${key}`);}
      for(const weapon of observed.weapons){seenWeapons.add(weapon.id);const source=entities.get(weapon.id);assert.equal(weapon.mode,source.data.mode);normalPresentations.set(`${weapon.id}::/mode`,{classification:'WEAPON_MODE_GROUP_CAPTION',value:weapon.mode});for(const key of ['range','attacks','skill','strength','ap','damage'])assert.ok(observed.facts.some(fact=>fact.id===`${weapon.id}::/${key}`&&fact.value===source.data[key]),`${device} wrong weapon ${weapon.id}/${key}`);}
      // Source-backed membership is visible on the datasheet, but does not
      // imply battle activation or fabricate an effective weapon change.
      for(const profileId of unit.data.profileIds){const source=entities.get(profileId);assert.equal(observed.profiles.find(profile=>profile.id===profileId).id,source.id);}
    }
    assert.equal(seenProfiles.size,35);
    for(const detachment of byKind('DETACHMENT')){
      await page.evaluate(id=>window.ArmyBookAppV2.open(id),detachment.id);
      const observed=await page.locator('main').evaluate(main=>({ids:[...main.querySelectorAll('[data-card-id]')].map(node=>node.dataset.cardId),facts:[...main.querySelectorAll('[data-fact-id]')].map(node=>({id:node.dataset.factId,value:JSON.parse(node.dataset.factValue)})),text:main.innerText,overflow:document.documentElement.scrollWidth>innerWidth+1}));
      assert.equal(observed.overflow,false,`${device} detachment overflow ${detachment.id}`);
      await observeNormal();
      for(const rule of effective.entities.filter(entity=>entity.parentId===detachment.id&&['DETACHMENT_RULE','ENHANCEMENT','STRATAGEM'].includes(entity.kind))){
        assert.ok(observed.ids.includes(rule.id),`${device} missing book rule ${rule.id}`);seenRules.add(rule.id);
        for(const fact of sourceFacts.filter(fact=>fact.entityId===rule.id&&(/\/(?:title|text|cp|category)$/.test('/'+fact.path.join('/'))||fact.path[0]==='lines'))){
          assert.ok(observed.facts.some(item=>item.id===fact.id&&item.value===fact.value),`${device} missing normal rule fact ${fact.id}`);
        }
      }
    }
    for(const rule of effective.entities.filter(entity=>['ARMY_RULE','SOURCE_ERRATUM','BOOK_USAGE','SOURCE_UPDATE_REFERENCE'].includes(entity.kind))){
      await page.evaluate(id=>window.ArmyBookAppV2.open(id),rule.id);
      const observed=await page.locator('main').evaluate(main=>({ids:[...main.querySelectorAll('[data-card-id]')].map(node=>node.dataset.cardId),facts:[...main.querySelectorAll('[data-fact-id]')].map(node=>({id:node.dataset.factId,value:JSON.parse(node.dataset.factValue)})),overflow:document.documentElement.scrollWidth>innerWidth+1}));
      assert.ok(observed.ids.includes(rule.id));assert.equal(observed.overflow,false);
      await observeNormal();
      for(const fact of sourceFacts.filter(fact=>fact.entityId===rule.id&&['text','title'].includes(fact.path[0])))assert.ok(observed.facts.some(item=>item.id===fact.id&&item.value===fact.value),`${device} missing normal army/update text ${fact.id}`);
    }
    for(const ruleId of Object.keys(contracts)){
      await page.evaluate(id=>window.ArmyBookAppV2.showDetail(id),ruleId);await page.waitForSelector('dialog.v2-detail-dialog[open]');
      const detail=page.locator('dialog.v2-detail-dialog[open]');
      assert.equal(await detail.locator('[data-card-id]').first().getAttribute('data-card-id'),ruleId,`${device} contract canonical popup ${ruleId}`);
      assert.ok((await detail.innerText()).trim().length>0);seenRules.add(ruleId);
      await observeNormal();
      await page.keyboard.press('Escape');await page.waitForSelector('dialog.v2-detail-dialog[open]',{state:'hidden'});
    }
    for(const weapon of byKind('WEAPON_PROFILE').filter(weapon=>!seenWeapons.has(weapon.id))){
      await page.evaluate(id=>window.ArmyBookAppV2.showDetail(id),weapon.id);await page.waitForSelector('dialog.v2-detail-dialog[open]');
      const detail=page.locator('dialog.v2-detail-dialog[open]');assert.equal(await detail.locator('[data-card-id]').first().getAttribute('data-card-id'),weapon.id);
      for(const key of ['range','attacks','skill','strength','ap','damage'])assert.equal(await detail.locator(`[data-fact-id="${weapon.id}::/${key}"]`).textContent(),String(weapon.data[key]));
      await observeNormal();
      seenWeapons.add(weapon.id);await page.keyboard.press('Escape');await page.waitForSelector('dialog.v2-detail-dialog[open]',{state:'hidden'});
    }
    assert.equal(seenWeapons.size,139);
    assert.ok(Object.keys(contracts).every(id=>seenRules.has(id)));
    const normalMissing=sourceFacts.filter(fact=>!normalCoverage.has(fact.id)),unaccounted=[];
    const presentationClassifications={};
    for(const fact of normalMissing){
      const owner=entities.get(fact.entityId),pointer='/'+fact.path.join('/');
      if(owner.kind==='PROFILE'&&pointer==='/name'){
        const unit=entities.get(owner.parentId);
        assert.equal(unit.data.profileIds.length,1,'Mixed profile name cannot be replaced by unit title');
        assert.equal(fact.value,normalCoverage.get(`${unit.id}::/title`)?.value,'Single MODEL profile name differs from visible UNIT title');
        normalPresentations.set(fact.id,{classification:'SINGLE_PROFILE_NAME_EQUALS_VISIBLE_UNIT_TITLE',value:fact.value});
      }else if(owner.kind==='DATASHEET_SECTION'&&/^\/blocks\/\d+\/wargearAbility$/.test(pointer)){
        assert.equal(fact.value,false,'Unclassified positive wargear ability qualifier');
        assert.ok(normalCoverage.has(`${owner.id}::/blocks/${fact.path[1]}/text`),'Presentation-only boolean lacks visible source text');
        normalPresentations.set(fact.id,{classification:'NON_PLAYER_SOURCE_ADAPTER_BLOCK_FLAG',value:fact.value});
      }else if(owner.kind==='ATTACHMENT_DECLARATION'){
        const section=entities.get(owner.data.sourceSectionId);
        assert.ok(section,'Attachment source section missing');
        if(pointer==='/roleHeading'){
          assert.equal(normalCoverage.get(`${section.id}::/title`)?.value,fact.value,'Attachment role heading lost');
        }else{
          assert.match(pointer,/^\/references\/\d+\/targetId$/);
          const target=entities.get(fact.value);assert.equal(target?.kind,'DATASHEET');
          const paragraphs=section.data.blocks.map((block,index)=>{
            assert.equal(normalCoverage.get(`${section.id}::/blocks/${index}/text`)?.value,block.text,'Attachment source paragraph lost');
            return block.text;
          }).join('\n');
          const normalize=text=>text.toUpperCase().replace(/[^A-Z0-9]/g,'');
          assert.ok(normalize(paragraphs).includes(normalize(target.data.title)),'Attachment recipient missing from source paragraph');
        }
        normalPresentations.set(fact.id,{classification:'ATTACHMENT_SOURCE_SECTION_PRESENTATION',value:fact.value});
      }
      const equivalent=normalPresentations.get(fact.id);
      if(equivalent){assert.deepEqual(equivalent.value,fact.value);presentationClassifications[equivalent.classification]=(presentationClassifications[equivalent.classification]||0)+1;}else unaccounted.push(fact);
    }
    assert.deepEqual(unaccounted.map(fact=>fact.id),[],`${device} missing NORMAL player fact`);
    for(const fact of sourceFacts.filter(fact=>normalCoverage.has(fact.id)))assert.deepEqual(normalCoverage.get(fact.id).value,fact.value,`${device} normal source value ${fact.id}`);
    // Supplementary lossless evidence is checked only after normal player
    // surfaces have accounted for every gameplay field and presentation alias.
    const evidence=await page.evaluate(()=>{
      window.ArmyBookAppV2.renderAllForQA();
      return [...document.querySelectorAll('main [data-fact-id]')].map(node=>({id:node.dataset.factId,value:JSON.parse(node.dataset.factValue),entityId:node.dataset.entityId,visible:!!node.getClientRects().length}));
    });
    const sourceIds=new Set(sourceFacts.map(fact=>fact.id)),seenEvidence=new Map();
    for(const fact of evidence.filter(fact=>sourceIds.has(fact.id))){assert.ok(!seenEvidence.has(fact.id),`Duplicate evidence ${fact.id}`);seenEvidence.set(fact.id,fact);}
    for(const fact of sourceFacts){const observed=seenEvidence.get(fact.id);assert.ok(observed,`${device} missing source fact ${fact.id}`);assert.deepEqual(observed.value,fact.value,`${device} wrong source value ${fact.id}`);assert.equal(observed.entityId,fact.entityId);assert.equal(observed.visible,true);}
    // A genuinely mixed MODEL datasheet retains both source names/statlines.
    await page.evaluate(()=>window.ArmyBookAppV2.open('unit-servitor-battleclade'));
    await page.locator('main .ds-model-metadata > summary').click();
    assert.match(await page.locator('main .model-profile[data-card-id$="servitor-underseer"]').innerText(),/Servitor Underseer/);
    assert.match(await page.locator('main .model-profile[data-card-id$="combat-and-gun-servitors"]').innerText(),/Combat Servitors and Gun Servitors/);
    assert.equal(await page.locator('main .profile-base').count(),2);
    for(const profileId of entities.get('unit-servitor-battleclade').data.profileIds){
      const source=entities.get(profileId),base=byKind('MODEL_BASE').find(entity=>entity.parentId===profileId);
      assert.ok(base,`Missing canonical mixed-profile Base ${profileId}`);
      const rendered=page.locator(`main .profile-base[data-card-id="${base.id}"]`);
      assert.equal(await rendered.count(),1);
      assert.equal(await rendered.locator(`[data-fact-id="${profileId}::/name"]`).textContent(),source.data.name,`${device} Base scope missing for ${source.data.name}`);
      const caption=(await rendered.innerText()).replace(/\s+/g,' ');
      assert.ok(caption.toLocaleLowerCase().startsWith(`${source.data.name} · Base: `.toLocaleLowerCase()),`Wrong Base caption ${JSON.stringify(caption)}`);
      assert.equal(await rendered.locator(`[data-fact-id="${base.id}::/text"]`).textContent(),base.data.text);
    }
    const doctrinaLink=page.locator('main a[data-target-id="army-rule-doctrina-imperatives"]').first();
    assert.equal(await doctrinaLink.count(),1,'Canonical Doctrina membership link missing');await doctrinaLink.click();
    await page.waitForSelector('dialog.v2-detail-dialog[open]');
    assert.equal(await page.locator('dialog.v2-detail-dialog[open] [data-card-id]').first().getAttribute('data-card-id'),'army-rule-doctrina-imperatives');
    await page.keyboard.press('Escape');await page.waitForSelector('dialog.v2-detail-dialog[open]',{state:'hidden'});
    const weaponLink=page.locator('main .weapon-row .weapon-button').first(),weaponTarget=await weaponLink.getAttribute('data-target-id');
    await weaponLink.click();await page.waitForSelector('dialog.v2-detail-dialog[open]');
    assert.equal(await page.locator('dialog.v2-detail-dialog[open] [data-card-id]').first().getAttribute('data-card-id'),weaponTarget);
    await page.keyboard.press('Escape');await page.waitForSelector('dialog.v2-detail-dialog[open]',{state:'hidden'});
    if(screenshots){await page.evaluate(()=>window.scrollTo(0,0));await page.screenshot({path:path.join(screenshots,`${device}-admech-mixed-profile.png`),animations:'disabled'});await page.locator('main .profile-base').last().evaluate(node=>node.scrollIntoView({block:'center'}));await page.screenshot({path:path.join(screenshots,`${device}-admech-base-scopes.png`),animations:'disabled'});}
    let relatedQueries=0;
    for(const unit of byKind('DATASHEET')){
      await page.evaluate(id=>{window.ArmyBookAppV2.open(id);window.ArmyBookAppV2.openRelatedRules(id);},unit.id);await page.waitForSelector('dialog.v2-related-dialog[open]');
      for(const detachmentId of ['',...byKind('DETACHMENT').map(entity=>entity.id)]){
        assert.equal(await page.locator('dialog.v2-related-dialog[open] .full-related-filter').count(),1,`${device} ${unit.id} missing Related Rules filter`);
        const observed=await page.evaluate(detachmentId=>{
          const filter=document.querySelector('dialog.v2-related-dialog[open] .full-related-filter');
          [...filter.querySelectorAll('button')].find(button=>button.dataset.detachment===detachmentId).click();
          const dialog=document.querySelector('dialog.v2-related-dialog[open]');
          return {items:[...dialog.querySelectorAll('.v2-compatible-item')].map(node=>({ruleId:node.dataset.ruleId,kind:node.closest('[data-related-kind]').dataset.relatedKind==='stratagems'?'STRATAGEM':'ENHANCEMENT',detachmentId:node.dataset.detachmentId,applicability:node.dataset.applicability,targetId:node.querySelector('a.v2-reference').dataset.targetId})),overflow:document.documentElement.scrollWidth>innerWidth+1};
        },detachmentId);
        assert.deepEqual(observed.items.map(signature).sort(),expectedRelated(unit.id,detachmentId).map(signature).sort(),`${device} Related Rules ${unit.id}/${detachmentId}`);
        assert.equal(observed.overflow,false);assert.equal(new Set(observed.items.map(row=>row.ruleId)).size,observed.items.length);
        for(const row of observed.items){assert.ok(['MATCH','CONDITIONAL'].includes(row.applicability));assert.equal(row.targetId,row.ruleId);if(detachmentId)assert.equal(row.detachmentId,detachmentId);}
        relatedQueries++;
      }
      await page.getByRole('button',{name:'Close compatible rules',exact:true}).click();
    }
    for(const kind of ['STRATAGEM','ENHANCEMENT']){
      const example=rows.find(row=>row.kind===kind&&['MATCH','CONDITIONAL'].includes(row.selectedDetachment.applicability));
      assert.ok(example,`No ${kind} canonical click control`);
      await page.evaluate(id=>{window.ArmyBookAppV2.open(id);window.ArmyBookAppV2.openRelatedRules(id);},example.unitId);
      await page.locator('dialog.v2-related-dialog[open] .full-related-filter summary').click();
      await page.locator(`dialog.v2-related-dialog[open] .full-related-filter button[data-detachment="${example.detachmentId}"]`).click();
      await page.locator(`dialog.v2-related-dialog[open] .full-related-tabs button[data-kind="${kind==='STRATAGEM'?'stratagems':'enhancements'}"]`).click();
      await page.locator(`dialog.v2-related-dialog[open] .v2-compatible-item[data-rule-id="${example.ruleId}"] a.v2-reference`).click();
      await page.waitForSelector('dialog.v2-detail-dialog[open]');
      assert.equal(await page.locator('dialog.v2-detail-dialog[open] [data-card-id]').first().getAttribute('data-card-id'),example.ruleId);
      assert.equal(await page.locator('main .v2-current-card').getAttribute('data-card-id'),example.unitId);
      await page.keyboard.press('Escape');await page.waitForSelector('dialog.v2-detail-dialog[open]',{state:'hidden'});
    }
    for(const id of ['army-rule-doctrina-imperatives:protector-imperative','army-rule-doctrina-imperatives:conqueror-imperative']){
      const relevant=contracts[id];assert.ok(relevant,'Missing canonical Imperative contract');
      assert.ok(relevant.roles.flatMap(role=>role.conditions||[]).some(condition=>condition.contextLevel==='BATTLE'),'Imperative activation lost BATTLE condition');
    }
    const deepStrikeOwner=byKind('RULE_REFERENCE').find(record=>record.data.groups.some(group=>group.entries.some(entry=>entry.sourceTooltipIds.includes('#tooltip_content00091'))));
    assert.ok(deepStrikeOwner,'Missing accepted Deep Strike reference control');
    await page.evaluate(id=>window.ArmyBookAppV2.open(id),deepStrikeOwner.parentId);
    await page.locator('main a[data-target-id="core-deep-strike"]').first().click();await page.waitForSelector('dialog.v2-detail-dialog[open]');
    assert.equal(await page.locator('dialog.v2-detail-dialog[open] [data-card-id]').first().getAttribute('data-card-id'),'core-deep-strike');
    await page.keyboard.press('Escape');await page.waitForSelector('dialog.v2-detail-dialog[open]',{state:'hidden'});
    await page.goto(origin+appPath+'#unit-servitor-battleclade');await page.waitForFunction(()=>Boolean(window.ArmyBookAppV2));
    assert.equal(await page.locator('main .v2-current-card').getAttribute('data-card-id'),'unit-servitor-battleclade');
    await page.reload();await page.waitForFunction(()=>Boolean(window.ArmyBookAppV2));
    await page.evaluate(()=>window.ArmyBookAppV2.open('unit-tech-priest-dominus'));
    await page.goBack();await page.waitForFunction(()=>document.querySelector('main .v2-current-card')?.dataset.cardId==='unit-servitor-battleclade');
    await page.goForward();await page.waitForFunction(()=>document.querySelector('main .v2-current-card')?.dataset.cardId==='unit-tech-priest-dominus');
    if(device==='phone'){
      await page.getByRole('button',{name:'Open navigation'}).click();assert.equal(await page.locator('main').evaluate(node=>node.inert),true);
      await page.keyboard.press('Escape');assert.equal(await page.locator('main').evaluate(node=>node.inert),false);
    }else{
      await page.getByRole('button',{name:'Collapse navigation'}).click();assert.equal(await page.locator('body').evaluate(node=>node.classList.contains('nav-collapsed')),true);
      await page.getByRole('button',{name:'Expand navigation'}).click();
    }
    assert.deepEqual(errors,[],`${device} uncaught errors`);
    results.push({device,status:'PASS',sourceFacts:seenEvidence.size,normalDirectSourceFacts:sourceFacts.length-normalMissing.length,normalPresentationClassifications:presentationClassifications,normalUnaccountedFacts:0,datasheets:34,profiles:seenProfiles.size,weapons:seenWeapons.size,detachments:10,enhancements:34,stratagems:51,contractOwners:204,relatedQueries,mixedProfiles:'PASS',mixedBaseScopes:'PASS',normalInternalIdsVisible:0,popupInternalIdsVisible:0,navigation:'PASS',canonicalPopups:'PASS',rosterStateInvented:0});
    await context.close();
  }
  // A payload-only poison must reach the normal weapon row. Legacy factual
  // routes remain disconnected throughout both viewport journeys.
  servedPayload=structuredClone(payload);
  const weapon=byKind('WEAPON_PROFILE').find(entity=>entities.get(entity.parentId)?.kind==='DATASHEET');
  const field=servedPayload.cards.find(card=>card.id===weapon.id).fields.find(field=>field.source?.path==='/strength');
  field.value='77';field.displayValue='77';
  const page=await browser.newPage();await page.goto(origin+appPath+'#'+weapon.parentId);await page.waitForFunction(()=>Boolean(window.ArmyBookAppV2));
  assert.equal(await page.locator(`main [data-fact-id="${weapon.id}::/strength"]`).textContent(),'77');await page.close();
  assert.deepEqual(forbiddenRequests,[],'Legacy or DG factual/runtime dependency');assert.deepEqual(unexpectedRequests,[],'Unclassified frontend dependency');
  console.log(JSON.stringify({status:'PASS',results,legacyAdMechFactualReads:0,legacyAdMechRuntimeReads:0,deathGuardFactualReads:0,legacyDisconnected:'PASS',v2FactPoison:'VISIBLE_77',requestedPaths:[...new Set(requests)]},null,2));
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}

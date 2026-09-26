import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
import {createRosterCatalog} from '../books/shared/tools/build-roster-catalog.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const books=['adeptus-mechanicus','tyranids','tau-empire','chaos-space-marines','emperors-children','space-marines','dark-angels','blood-angels','death-guard'];
const clone=value=>JSON.parse(JSON.stringify(value));
const normalize=value=>String(value||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const loadWindow=relative=>{const context={window:{}};vm.createContext(context);vm.runInContext(fs.readFileSync(path.join(root,relative),'utf8'),context);return context.window;};
const catalogs=new Map(books.map(book=>[book,loadWindow(`books/${book}/scripts/roster-data.js`).WH_BOOK_ROSTER_CATALOG]));
const targets=new Map(books.map(book=>[book,loadWindow(`books/${book}/scripts/target-data.js`).WH_ARMY_BOOK_TARGETS]));
const points=loadWindow('roster-guides/points-data.js').WH_POINTS_CATALOG;
const glossaryIds=new Set(Object.keys(JSON.parse(fs.readFileSync(path.join(root,'glossary/registry.en.json'),'utf8')).terms));
const runtime=loadWindow('books/shared/roster-context.js').WHArmyRosterContext;

const decodeAttribute=value=>String(value).replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&');
const occurrences=(text,needle)=>text.split(needle).length-1;
const unitRuleFacts=(html,unitId)=>{
  const unitAt=html.indexOf(`id="${unitId}"`);
  assert.notEqual(unitAt,-1,`${unitId}: target article missing`);
  const tagStart=html.lastIndexOf('<article',unitAt),tagEnd=html.indexOf('>',unitAt),tag=html.slice(tagStart,tagEnd+1),match=tag.match(/data-rule-facts="([^"]*)"/);
  assert.ok(match,`${unitId}: data-rule-facts missing`);
  return JSON.parse(decodeAttribute(match[1]));
};
const targetRecord=(html,abilityId)=>{
  const rosterMarker=`data-roster-wargear-ability-id="${abilityId}"`,canonicalMarker=`id="${abilityId}"`,marker=html.includes(rosterMarker)?rosterMarker:canonicalMarker;
  assert.equal(occurrences(html,marker),1,`${abilityId}: target article must exist exactly once`);
  const markerAt=html.indexOf(marker),articleStart=html.lastIndexOf('<article',markerAt),articleEnd=html.indexOf('</article>',markerAt);
  assert.ok(articleStart>=0&&articleEnd>markerAt,`${abilityId}: complete target article missing`);
  return {markerAt,html:html.slice(articleStart,articleEnd+10)};
};

const validateAll=(catalogSet=catalogs,targetSet=targets,pointsSet=points)=>{
  let total=0,intersections=0,unresolved=0,pointsLeaks=0,targetLeaks=0,articleLeaks=0,glossaryMissing=0,runtimeLeaks=0;
  for(const [book,catalog] of catalogSet){
    const html=targetSet.get(book).html;
    for(const unit of catalog.units){
      const ordinaryIds=new Set((unit.gameSelections?.abilities||[]).map(item=>item.id));
      const selections=unit.gameSelections?.selections||[];
      const facts=unitRuleFacts(html,unit.id);
      const pointBook=pointsSet[normalize(catalog.book.title)],pointMatches=Object.values(pointBook?.units||{}).filter(item=>item.id===unit.id||item.unitId===unit.id),pointRecord=pointMatches[0];
      assert.equal(pointMatches.length,1,`${book}/${unit.id}: points unit identity`);
      for(const ability of unit.gameSelections?.wargearAbilities||[]){
        total+=1;
        if(ordinaryIds.has(ability.id))intersections+=1;
        if(!ability.requiredSelectionIds?.length)unresolved+=1;
        for(const selectionId of ability.requiredSelectionIds||[]){
          const matches=selections.filter(item=>item.id===selectionId);
          if(matches.length!==1||!matches[0].wargearAbilityIds?.includes(ability.id))unresolved+=1;
        }
        const article=targetRecord(html,ability.id),sectionId=`${unit.id.replace(/^unit-/,'')}-wargear-abilities`,sectionAt=html.lastIndexOf('<section',article.markerAt),sectionTagEnd=html.indexOf('>',sectionAt),sectionClose=html.indexOf('</section>',sectionTagEnd);
        if(sectionAt<0||!html.slice(sectionAt,sectionTagEnd+1).includes(`id="${sectionId}"`)||article.markerAt>sectionClose)articleLeaks+=1;
        const termId=article.html.match(/data-term="([^"]+)"/)?.[1];
        if(termId&&!glossaryIds.has(termId)&&!glossaryIds.has(`${book}-${termId}`))glossaryMissing+=1;
        if((facts.abilities||[]).some(title=>normalize(title)===normalize(ability.title))||(termId&&(facts.termIds||[]).includes(termId)))targetLeaks+=1;
        if((pointRecord.abilities||[]).some(title=>normalize(title)===normalize(ability.title))||(termId&&(pointRecord.termIds||[]).includes(termId)))pointsLeaks+=1;
        const selected=selections.find(item=>ability.requiredSelectionIds?.includes(item.id));
        if(selected){
          const raw=id=>({id,canonicalUnitId:unit.id,name:unit.title,quantity:1,models:[]}),base={faction:catalog.book.title,detachments:[],enhancements:[]};
          const unselected=runtime.project({catalog,roster:{...base,units:[raw('unselected')]},record:{id:'unselected',attachments:{}}}).game.units[0];
          const selectedRaw=raw('selected'),contracts=unit.gameSelections?.wargearOptionContracts||[];
          const option=contracts.map(contract=>({contract,choice:contract.choices.find(choice=>choice.add.some(item=>item.selectionId===selected.id))})).find(item=>item.choice);
          if(option){
            const modelId=option.contract.eligibleModelIds[0],model=unit.gameSelections.models.find(item=>item.id===modelId),defaults=unit.gameSelections.wargearDefaults.find(item=>item.modelId===modelId),quantities=new Map(defaults.selections.map(item=>[item.selectionId,item.quantity]));
            for(const item of option.choice.remove)quantities.set(item.selectionId,(quantities.get(item.selectionId)||0)-item.quantity);
            for(const item of option.choice.add)quantities.set(item.selectionId,(quantities.get(item.selectionId)||0)+item.quantity);
            selectedRaw.models=[{name:model.title,quantity:1,wargear:[...quantities].filter(([,quantity])=>quantity>0).map(([id,quantity])=>{const title=selections.find(item=>item.id===id).title;return quantity===1?title:`${quantity}x ${title}`;}).join(', ')}];
          }else selectedRaw.models=[{name:unit.title,quantity:1,wargear:selected.title}];
          const selectedGame=runtime.project({catalog,roster:{...base,units:[selectedRaw]},record:{id:'selected',attachments:{}}}).game.units[0];
          if(unselected.effective.abilities.some(item=>item.id===ability.id)||selectedGame.selection.loadout.wargearResolution.state!=='resolved'||!selectedGame.selection.loadout.selectedWargearAbilityIds.includes(ability.id))runtimeLeaks+=1;
        }
      }
    }
  }
  assert.equal(intersections,0,'ordinary/wargear ability IDs must be disjoint');
  assert.equal(unresolved,0,'every gated ability must have an exact reciprocal selection');
  assert.equal(targetLeaks,0,'gated abilities must not enter unconditional ruleFacts');
  assert.equal(pointsLeaks,0,'gated abilities must not enter ordinary points abilities');
  assert.equal(articleLeaks,0,'gated articles must remain inside their Wargear Abilities section');
  assert.equal(glossaryMissing,0,'gated article glossary identities must remain published');
  assert.equal(runtimeLeaks,0,'selection gating must hold in runtime projection');
  return {total,intersections,unresolved,pointsLeaks,targetLeaks,articleLeaks,glossaryMissing,runtimeLeaks};
};

const syntheticUnit={id:'unit-test',title:'Test Unit',abilities:[{id:'ability-banner',title:'Banner',text:'Canonical banner text.'}],wargearAbilities:[{id:'ability-banner',title:'Banner',text:'Canonical banner text.',requiredSelections:[{id:'selection-banner',title:'Banner'}]}]};
const synthetic=createRosterCatalog({config:{id:'test-book',title:'Test Book'},units:[syntheticUnit]}),syntheticGame=synthetic.units[0].gameSelections,ordinary=syntheticGame.abilities.find(item=>item.id==='ability-banner'),wargear=syntheticGame.wargearAbilities.find(item=>item.id==='ability-banner');
assert.equal(ordinary,undefined,'selection-gated ability must not be emitted as an ordinary ability');
assert.ok(wargear,'selection-gated ability remains in the Wargear Ability projection');
assert.deepEqual(Object.fromEntries(['id','sectionId','title','text','sourceUnitId'].map(field=>[field,wargear[field]])),{id:'ability-banner',sectionId:'ability-banner',title:'Banner',text:'Canonical banner text.',sourceUnitId:'unit-test'});
assert.deepEqual(wargear.requiredSelectionIds,['selection-banner']);
assert.throws(()=>createRosterCatalog({config:{id:'test-book',title:'Test Book'},units:[{...syntheticUnit,wargearAbilities:[{...syntheticUnit.wargearAbilities[0],text:'Conflicting text.'}]}]}),/conflicting canonical ability ability-banner field text/,'conflicting same-ID semantic records fail closed');

const stats=validateAll();
const dgCatalog=catalogs.get('death-guard'),plaguebearers=dgCatalog.units.find(item=>item.id==='unit-plaguebearers'),instrumentId='plaguebearers-ability-instrument-of-chaos';
const semantics=loadWindow('books/death-guard/scripts/roster-semantics.js').DGRosterSemantics,rawInstrument={id:'raw-instrument',canonicalUnitId:'unit-plaguebearers',name:'Plaguebearers',quantity:10,models:[{name:'Plaguebearer',quantity:1,wargear:'Instrument of Chaos'},{name:'Plaguebearer',quantity:9,wargear:'Plaguesword'}]},rawContext=semantics.createContext({roster:{faction:'Death Guard',units:[rawInstrument],detachments:[],enhancements:[]},attachments:{}}),rawEffects=rawContext.projectEffects(rawInstrument,'unit-plaguebearers',[],{identity:{instanceId:'raw-instrument',canonicalDatasheetId:'unit-plaguebearers'},selection:{loadout:{selectedWargearAbilityIds:[]}},item:{catalogUnit:plaguebearers}});
assert.equal(rawEffects.length,0,'book-local raw wargear text must not remain a factual effect owner');
const selectedProjection=runtime.project({catalog:dgCatalog,roster:{faction:'Death Guard',detachments:[],enhancements:[],units:[rawInstrument]},record:{id:'selected-instrument',attachments:{}}}),selectedGame=selectedProjection.game.units[0],effectScope={window:{WH_BOOK_ROSTER_CATALOG:dgCatalog}};effectScope.globalThis=effectScope.window;vm.createContext(effectScope);vm.runInContext(fs.readFileSync(path.join(root,'books/shared/effect-contract-runtime.js'),'utf8'),effectScope);const canonicalEffects=effectScope.window.WHEffectContractRuntime.project({gameUnit:selectedGame,gameUnits:[selectedGame],byInstance:new Map([[selectedGame.identity.instanceId,selectedGame]]),enhancements:[]});
assert.ok(canonicalEffects.some(effect=>effect.canonicalReference?.id===instrumentId&&effect.source?.kind==='selected-wargear'),'canonical selected-wargear identity must control the Instrument effect');
const unknownProjection=runtime.project({catalog:dgCatalog,roster:{faction:'Death Guard',detachments:[],enhancements:[],units:[{...rawInstrument,id:'unknown',models:[{name:'Plaguebearer',quantity:1,wargear:'Unknown Instrument'},{name:'Plaguebearer',quantity:9,wargear:'Plaguesword'}]}]},record:{id:'unknown',attachments:{}}}),unknown=unknownProjection.game.units[0];
assert.equal(unknown.selection.loadout.state,'partial');
assert.ok(unknown.selection.loadout.unresolved.some(item=>item.reason==='no-canonical-alias'),'unknown selection ID fails closed');

const expectKilled=(label,mutate)=>{const changed={catalogs:new Map([...catalogs].map(([book,catalog])=>[book,clone(catalog)])),targets:new Map([...targets].map(([book,target])=>[book,clone(target)])),points:clone(points)};mutate(changed);assert.throws(()=>validateAll(changed.catalogs,changed.targets,changed.points),undefined,`${label} must be killed`);console.log(`${label}: KILLED`);};
expectKilled('DUAL_CLASSIFICATION_MUTATION',state=>{const unit=state.catalogs.get('death-guard').units.find(item=>item.id==='unit-plaguebearers'),record=unit.gameSelections.wargearAbilities.find(item=>item.id===instrumentId);unit.gameSelections.abilities.push(record);});
expectKilled('MISSING_SELECTION_LINK_MUTATION',state=>{const unit=state.catalogs.get('death-guard').units.find(item=>item.id==='unit-plague-marines'),record=unit.gameSelections.wargearAbilities.find(item=>item.id==='plague-marines-ability-icon-of-despair-aura');record.requiredSelectionIds=[];});
expectKilled('UNCONDITIONAL_RULEFACT_MUTATION',state=>{const target=state.targets.get('death-guard'),needle='&quot;abilities&quot;:[',at=target.html.indexOf('id="unit-plaguebearers"'),pos=target.html.indexOf(needle,at)+needle.length;target.html=target.html.slice(0,pos)+'&quot;Instrument of Chaos&quot;,'+target.html.slice(pos);});
expectKilled('POINTS_FLATTENING_MUTATION',state=>{const book=state.points['death guard'],unit=Object.values(book.units).find(item=>item.id==='unit-plaguebearers');unit.abilities.push('INSTRUMENT OF CHAOS');});
assert.throws(()=>{const changed=clone(selectedGame);changed.selection.loadout.selectedWargearAbilityIds=['unknown-instrument'];assert.ok(effectScope.window.WHEffectContractRuntime.project({gameUnit:changed,gameUnits:[changed],byInstance:new Map([[changed.identity.instanceId,changed]]),enhancements:[]}).some(effect=>effect.canonicalReference?.id===instrumentId));},undefined,'SELECTED_WARGEAR_ID_SUBSTITUTION_MUTATION must be killed');
console.log('SELECTED_WARGEAR_ID_SUBSTITUTION_MUTATION: KILLED');
console.log(`Selection-gated ability QA: ${stats.total} records; intersections ${stats.intersections}; unresolved ${stats.unresolved}; points leaks ${stats.pointsLeaks}; runtime leaks ${stats.runtimeLeaks}; presentation leaks ${stats.articleLeaks}; PASS`);

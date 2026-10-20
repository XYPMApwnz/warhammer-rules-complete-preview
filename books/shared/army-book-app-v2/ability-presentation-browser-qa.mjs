/** Rendered synthetic scope/identity guards. No faction factual/runtime data. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
const repo=fileURLToPath(new URL('../../../',import.meta.url));
const out=process.env.ARMY_APP_V2_SCREENSHOTS||'E:/Warhammer/qa-artifacts/ability-presentation-synthetic';
fs.mkdirSync(out,{recursive:true});
const server=http.createServer((request,response)=>{
  const address=new URL(request.url,'http://localhost').pathname;
  if(address==='/'){response.setHeader('Content-Type','text/html');response.end('<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><body>');return;}
  const file=path.resolve(repo,'.'+decodeURIComponent(address));
  if(!file.startsWith(path.resolve(repo)+path.sep)||!fs.existsSync(file)){response.writeHead(404);response.end();return;}
  response.setHeader('Content-Type','text/javascript');response.end(fs.readFileSync(file));
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const {chromium}=createRequire(import.meta.url)('playwright');
const chrome='C:/Program Files/Google/Chrome/Application/chrome.exe';
const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE||(fs.existsSync(chrome)?chrome:undefined)});
const observations=[],errors=[];
try{
  for(const [device,viewport]of [['desktop',{width:1440,height:900}],['phone',{width:390,height:844}]]){
    const context=await browser.newContext({viewport}),page=await context.newPage();page.on('pageerror',error=>errors.push(error.message));
    await page.goto(`http://127.0.0.1:${server.address().port}/`);
    const cases=await page.evaluate(async()=>{
      const {createSyntheticPersonalFixture}=await import('/books/shared/army-book-app-v2/personal-datasheet-qa.mjs');
      const {projectInstanceCards}=await import('/books/shared/army-book-app-v2/personal.mjs');
      const {createDatasheetPresenter}=await import('/books/shared/army-book-app-v2/datasheet-v1.mjs');
      const controls=[['uniform',[[5],[5],[5]]],['subset',[[5],[],[]]],['mixed-values',[[4],[5],[]]],
        ['same-canonical-different-scope',[[],[4],[5]]],['duplicate-occurrences',[[5,5],[5,5],[5,5]]],
        ['suppressed-all',[[5],[5],[5]]],['suppressed-first',[[5],[5],[5]]],
        ['suppressed-reference-all',[[5],[5],[5]]],['suppressed-reference-first',[[5],[5],[5]]],
        ['suppressed-reference-gun',[[5],[5],[5]]],
        ['unit-grant-sources',[[],[],[]]],['model-grant-sources',[[5],[],[]]],['unit-grant-removed-source',[[],[],[]]],
        ['native-and-model-grant-sources',[[5],[5],[5]]]];
      const cases=[];
      for(const [name,values]of controls){
        const f=createSyntheticPersonalFixture('generic-scope',true);
        f.effective.profiles.forEach((profile,index)=>profile.abilities=values[index].map(value=>({canonicalId:'canonical-defence',name:'Same caption',parameters:{value}})));
        if(name.includes('grant-')){
          f.cards.set('grant-rule',{id:'grant-rule',title:'Source-backed grant',fields:[],children:[]});
          const model=['model-grant-sources','native-and-model-grant-sources'].includes(name),target=f.effective.profiles[0];
          if(!model)f.effective.unitAbilities=[{canonicalId:'canonical-defence',name:'Same caption',parameters:{value:5}}];
          f.effective.applied=[f.unit,f.duplicate.unit].slice(name==='unit-grant-removed-source'?1:0).map(source=>({
            ruleId:'grant-rule',clauseId:'grant',effectId:'grant-effect',operation:'GRANT_ABILITY',
            sourceInstanceId:source.instanceId,sourceModelInstanceId:source.instanceId+'/known-model',
            targetInstanceId:f.unit.instanceId,targetAbilityId:'canonical-defence',abilityParameters:{value:5},
            targetProfileId:model?target.id:null,targetCompositionId:model?target.scopeId:null}));
        }
        if(name.startsWith('suppressed-'))f.effective.profiles.forEach((profile,index)=>{
          if(name.endsWith('-all')||index===(name.endsWith('-gun')?1:0))profile.suppressedAbilityIds=['canonical-defence'];
        });
        if(name.startsWith('suppressed-reference-')){
          const fieldId='canonical-membership::/text',label='Canonical source caption';
          const reference={id:'canonical-membership',kind:'RULE_REFERENCE',parentId:f.unit.canonicalUnitId,
            fields:[{id:fieldId,source:{entityId:'canonical-membership',path:'/text'},label:'text',value:label}],children:[]};
          f.cards.set(reference.id,reference);f.cards.get(f.unit.canonicalUnitId).children.push(reference.id);
          f.payload.datasheetPresentation.referenceBindings={fields:{[fieldId]:[
            {targetId:'canonical-defence',parameters:{value:5},group:'ARMY RULES',start:0,end:label.length}]}};
        }
        const el=(tag,classes='',text)=>{const node=document.createElement(tag);node.className=classes;if(text!==undefined)node.textContent=text;return node;};
        const factValue=(tag,field)=>el(tag,'',String(field.displayValue??field.value));
        const anchor=(label,id)=>{const node=el('a','',label);node.dataset.targetId=id;return node;};
        const roster={state:{units:[f.unit,f.duplicate.unit],attachments:[]},effective:()=>f.effective};
        const presenter=createDatasheetPresenter({document,payload:f.payload,cards:f.cards,el,factValue,anchor,showDetail:()=>{},related:()=>el('div'),roster,navigateSection:()=>{}});
        const variants=projectInstanceCards(f.cards,f.unit,f.effective);
        const root=presenter.renderDatasheet(variants.get(f.unit.canonicalUnitId)[0],{variants,instanceId:f.unit.instanceId});document.body.append(root);
        const rows=[...root.querySelectorAll('[data-ability-presentation-identity]')].map(node=>({
          identity:node.dataset.abilityPresentationIdentity,id:node.dataset.canonicalAbilityId,
          params:JSON.parse(node.dataset.abilityParameters),scopes:JSON.parse(node.dataset.recipientScopes),
          surface:node.closest('.model-profile')?'PROFILE':'CORE',
          profile:node.closest('.model-profile')?.dataset.cardId,scope:node.closest('.model-profile')?.dataset.compositionId,
          captions:[...node.closest('.model-profile')?.querySelectorAll('h5')||[]].map(node=>node.textContent),text:node.textContent,
          sources:[...node.querySelectorAll('[data-ability-source-instance-id]')].map(source=>({
            instanceId:source.dataset.abilitySourceInstanceId,modelId:source.dataset.abilitySourceModelInstanceId,text:source.textContent})),
          traces:JSON.parse(node.dataset.abilitySources||'[]')}));
        cases.push({name,rows,profileIds:f.effective.profiles.map(profile=>profile.id),scopeIds:f.effective.profiles.map(profile=>profile.scopeId)});
        root.remove();
      }
      return cases;
    });
    for(const control of cases){
      assert.equal(new Set(control.rows.map(row=>row.identity)).size,control.rows.length);
      if(control.name.includes('grant-')){
        assert.equal(control.rows.length,1);
        const row=control.rows[0],count=control.name==='unit-grant-removed-source'?1:2;
        assert.equal(row.sources.length,count);assert.equal(row.traces.length,count);
        assert.equal(row.surface,control.name==='model-grant-sources'?'PROFILE':'CORE');
        if(control.name==='native-and-model-grant-sources'){
          assert.ok(row.text.includes('Applies to:'));
          assert.ok(row.text.includes(control.scopeIds[0]));
          assert.ok(!row.text.includes(control.scopeIds[1]));
        }
        assert.ok(row.text.includes('Source-backed grant'));
        assert.ok(row.sources.every(source=>row.text.includes(source.modelId)));
        assert.equal(new Set(row.sources.map(source=>source.instanceId)).size,count);continue;
      }
      if(control.name==='suppressed-reference-gun'){
        assert.equal(control.rows.length,2);assert.ok(control.rows.every(row=>row.surface==='PROFILE'));
        assert.ok(!control.rows.some(row=>row.scope===control.scopeIds[1]));
        assert.ok(control.rows.some(row=>row.profile===control.profileIds[1]&&row.scope===control.scopeIds[2]));continue;
      }
      if(control.name.startsWith('suppressed-')&&control.name.endsWith('-all')){assert.equal(control.rows.length,0);continue;}
      if(control.name.startsWith('suppressed-')&&control.name.endsWith('-first')){
        assert.equal(control.rows.length,2);assert.ok(control.rows.every(row=>row.surface==='PROFILE'));
        assert.ok(control.rows.every(row=>row.profile!==control.profileIds[0]&&row.params.value===5));continue;
      }
      if(['uniform','duplicate-occurrences'].includes(control.name)){assert.equal(control.rows.length,1);assert.equal(control.rows[0].surface,'CORE');assert.equal(control.rows[0].scopes.length,3);}
      else{
        assert.equal(control.rows.length,control.name==='subset'?1:2);
        assert.ok(control.rows.every(row=>row.surface==='PROFILE'&&row.scopes.length===1&&row.captions.length));
        if(control.name==='subset')assert.equal(control.rows[0].profile,control.profileIds[0]);
        else assert.deepEqual(control.rows.map(row=>row.params.value),[4,5]);
        if(control.name==='same-canonical-different-scope'){
          assert.equal(control.rows[0].profile,control.rows[1].profile);assert.notEqual(control.rows[0].scope,control.rows[1].scope);
          assert.notDeepEqual(control.rows[0].captions,control.rows[1].captions);
        }
      }
    }
    observations.push({device,cases});await context.close();
  }
  assert.deepEqual(errors,[]);const result={status:'PASS',armyFactualReads:0,views:observations.reduce((sum,view)=>sum+view.cases.length,0),observations,errors};
  fs.writeFileSync(path.join(out,'ability-presentation-synthetic-browser-report.json'),JSON.stringify(result,null,2));console.log(JSON.stringify({status:result.status,views:result.views,armyFactualReads:0}));
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}

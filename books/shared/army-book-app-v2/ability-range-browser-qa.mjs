import {launchQaBrowser} from '../../../tests/helpers/qa-browser.cjs';
/** Real shared runtime -> effective cards -> existing renderer, no army UI. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
const repo=fileURLToPath(new URL('../../../',import.meta.url));
const server=http.createServer((request,response)=>{
  const address=new URL(request.url,'http://localhost').pathname;
  if(address==='/'){response.setHeader('Content-Type','text/html');response.end('<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><body>');return;}
  const file=path.resolve(repo,'.'+decodeURIComponent(address));
  if(!file.startsWith(path.resolve(repo)+path.sep)||!fs.existsSync(file)){response.writeHead(404);response.end();return;}
  response.setHeader('Content-Type','text/javascript');response.end(fs.readFileSync(file));
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const {chromium}=createRequire(import.meta.url)('playwright');
const browser=await launchQaBrowser(chromium,{headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE||'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const errors=[],views=[];
try{
  for(const [device,viewport]of [['desktop',{width:1440,height:1000}],['phone',{width:390,height:844}]]){
    const context=await browser.newContext({viewport}),page=await context.newPage();page.on('pageerror',error=>errors.push(error.message));
    await page.goto(`http://127.0.0.1:${server.address().port}/`);
    const result=await page.evaluate(async()=>{
      const {createAbilityRangeFixture,rangeId:id}=await import('/books/shared/roster-v2/ability-range-fixture.mjs');
      const {projectArmyBook}=await import('/books/shared/army-book-app-v2/project.mjs');
      const {projectInstanceCards}=await import('/books/shared/army-book-app-v2/personal.mjs');
      const {createDatasheetPresenter,buildDatasheetPresentation}=await import('/books/shared/army-book-app-v2/datasheet-v1.mjs');
      const f=createAbilityRangeFixture(),runtime=f.runtime(),original=JSON.stringify(f.book);
      const model={...f.book,currentness:{currentness:'CURRENT'},mfm:{source:{label:'Synthetic'},unitBindings:[],detachmentBindings:[],
        enhancementBindings:[],paidUpgradeBindings:[],relations:[],eligibilityEvidenceBindings:[]}};
      const payload=projectArmyBook(model,new Map(),{title:'Synthetic range book'});
      payload.datasheetPresentation=buildDatasheetPresentation(model,{units:{}});
      const cards=new Map(payload.cards.map(card=>[card.id,card]));
      const refId=id('source-membership'),fieldId=refId+'::/text';
      cards.set(refId,{id:refId,kind:'RULE_REFERENCE',parentId:id('mixed'),title:'Source membership',children:[],
        fields:[{id:fieldId,source:{entityId:refId,path:'/text'},label:'Rule',value:'Same caption'}]});
      cards.get(id('mixed')).children.push(refId);
      payload.datasheetPresentation.referenceBindings={fields:{[fieldId]:[{targetId:id('ability-a'),parameters:{range:4},
        group:'CORE ABILITIES',start:0,end:12}]}};
      const el=(tag,classes='',text)=>{const node=document.createElement(tag);node.className=classes;if(text!==undefined)node.textContent=text;return node;};
      const factValue=(tag,field)=>el(tag,'',String(field.displayValue??field.value));
      const anchor=(label,target)=>{const node=el('a','',label);node.dataset.targetId=target;return node;};
      const presenter=createDatasheetPresenter({document,payload,cards,el,factValue,anchor,showDetail:()=>{},related:()=>el('div'),roster:runtime,navigateSection:()=>{}});
      const checks=[];
      for(const instanceId of ['a','b']){
        const unit=runtime.state.units.find(unit=>unit.instanceId===instanceId),effective=runtime.effective(instanceId);
        const variants=projectInstanceCards(cards,unit,effective),root=presenter.renderDatasheet(variants.get(unit.canonicalUnitId)[0],{variants,instanceId});
        document.body.replaceChildren(root);
        checks.push({instanceId,text:root.textContent,
          scopes:[...root.querySelectorAll('.ds-composition-scope')].map(node=>node.textContent),
          sourceVariants:(variants.get(id('ability-a'))||[]).map(card=>({scope:card.scopeId,
            text:card.fields.find(field=>field.source.path==='/text').value})),
          pills:[...root.querySelectorAll('[data-canonical-ability-id]')].map(node=>node.dataset.canonicalAbilityId)});
      }
      const normal=presenter.renderDatasheet(cards.get(id('mixed')));document.body.replaceChildren(normal);
      return {checks,normal:normal.textContent,immutable:JSON.stringify(f.book)===original};
    });
    const [a,b]=result.checks;
    assert.equal(a.sourceVariants.length,2);assert.equal(new Set(a.sourceVariants.map(row=>row.scope)).size,2);
    assert.ok(a.text.includes('Select within 6". Roll D3; other rules and values remain unchanged.'));
    assert.ok(a.text.includes('Select within 4". Roll D3; other rules and values remain unchanged.'));
    assert.ok(!a.pills.includes('synthetic-range:ability-a'),'Base-range pill duplicated effective source ability');
    assert.ok(a.scopes.includes('eligible · 1 model'));assert.ok(a.scopes.includes('sibling · 1 model'));
    assert.ok(!a.text.includes('undefined'));assert.ok(!b.text.includes('within 6"'));
    assert.ok(!result.normal.includes('within 6"'));assert.ok(result.normal.includes('within 4"'));assert.ok(result.immutable);
    views.push({device,status:'PASS',cases:3});await context.close();
  }
  assert.deepEqual(errors,[]);console.log(JSON.stringify({status:'PASS',views,armyFactualReads:0,effectiveRangeVisible:true,
    restOfSourceTextPreserved:true,scopeLabels:true,noContradictoryBasePills:true,normalBookUnchanged:true,errors}));
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}

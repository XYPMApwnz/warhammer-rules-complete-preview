/** Literal O-3 physical fixtures through saved-roster load, Effective and Guide UI. */
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {createQaEvidenceDir} from '../tests/helpers/qa-temp.mjs';
import {launchChromium} from '../tests/helpers/browser-launch.mjs';
import {isApplicationTestDependency} from '../books/shared/application-v2/browser-test-dependencies.mjs';
import {createDetachmentBrowserFixture} from '../tests/helpers/detachment-card-text-browser-fixtures.mjs';
const root=fileURLToPath(new URL('../',import.meta.url)),out=createQaEvidenceDir('wh-detachment-card-text-browser-');
const {cases}=JSON.parse(fs.readFileSync(new URL('./fixtures/detachment-card-text.json',import.meta.url),'utf8'));
const allowed=new Set(JSON.parse(fs.readFileSync(path.join(root,'tools/pages-runtime-manifest.json'))).files.map(row=>'/'+row.path));
const mime={'.html':'text/html','.mjs':'text/javascript','.js':'text/javascript','.json':'application/json','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg'};
const results=[],errors=[],missing=[];
const server=http.createServer((request,response)=>{
  const address=decodeURIComponent(new URL(request.url,'http://local').pathname),file=path.resolve(root,'.'+address);
  if(address==='/favicon.ico'){response.writeHead(204).end();return;}
  if(!file.startsWith(path.resolve(root)+path.sep)||!allowed.has(address)&&!isApplicationTestDependency(address)||!fs.existsSync(file)){
    missing.push(address);response.writeHead(404).end();return;
  }
  response.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'}).end(fs.readFileSync(file));
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const origin='http://127.0.0.1:'+server.address().port;
const norm=value=>String(value).replace(/[‘’]/g,"'").replace(/\s+/g,' ').trim();
async function roster(page){
  await page.locator('[data-v2-primary-nav] [data-v2-destination="ROSTER"]').click();
  await page.getByRole('textbox',{name:'New Recruit text export',exact:true}).waitFor();
}
async function inspect(page,spec,unit,id,mode,device,stage){
  await roster(page);
  if(mode==='Effective')await page.locator(`[data-roster-instance-id="${id}"]`).getByRole('button',{name:'Effective datasheet',exact:true}).click();
  else{
    await page.getByRole('button',{name:'Open personal guide',exact:true}).click();
    await page.locator(`main a[data-target-id="roster-unit/${id}"]`).click();
  }
  const card=page.locator(`main .unit-card[data-roster-instance-id="${id}"]`);await card.waitFor();
  const groups=card.locator(`.ds-detachment-rule[data-detachment-rule-id="${spec.ruleId}"]`);
  assert.equal(await groups.count(),unit.expectText?1:0,`${spec.id}/${device}/${mode}/${stage}/${unit.unitId}`);
  let content=null;
  if(unit.expectText){
    content=await groups.innerText();assert(norm(content).includes(norm(spec.quote)),'Exact English source clause missing');
    const rows=await groups.locator('[data-conditional-policy="DETACHMENT_TEXT"]').evaluateAll(nodes=>nodes.map(node=>({
      source:JSON.parse(node.dataset.policySource),subject:node.dataset.recipientSubject,kind:node.dataset.selectionStatus,
      refs:JSON.parse(node.dataset.detachmentClauseFieldRefs),content:node.innerText
    })));
    const row=rows.find(row=>row.source.clauseId===spec.clauseId);assert(row,'Expected source clause identity missing');
    assert.equal(row.source.ruleId,spec.ruleId);assert.equal(row.subject,spec.subject);assert.equal(row.kind,spec.textKind);
    assert(row.content.includes('Source:'));assert(row.refs.length,'Source text is not linked to its visible field');
    for(const ref of row.refs)assert(await page.locator('[id="'+ref+'"]').isVisible(),'Referenced source field must be visible');
    assert.doesNotMatch(content,/Not automatically calculated|Selection not recorded|Conditional rule|model count unresolved/);
  }
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);
  results.push({case:spec.id,device,mode,stage,unitId:unit.unitId,expected:unit.expectText,status:'PASS',content});
}
let browser,completed=false;
try{
  browser=await launchChromium();
  for(const [device,viewport]of [['desktop',{width:1440,height:1000}],['mobile',{width:390,height:844}]])
    for(const spec of cases){
      const context=await browser.newContext({viewport,serviceWorkers:'block'}),page=await context.newPage();
      context.setDefaultTimeout(30000);page.on('pageerror',error=>errors.push(error.message));
      try{
        console.log('RUN '+device+' '+spec.id);
        await page.goto(origin+'/v2/app.html');await page.locator('[data-v2-book="'+spec.bookId+'"]').click();
        await page.waitForFunction(()=>window.ArmyBookAppV2?.roster);
        const snapshot=await createDetachmentBrowserFixture(spec);
        await page.evaluate(snapshot=>{
          window.ArmyBookAppV2.roster.load(snapshot);
          window.ArmyBookAppV2.rosterPanel.refresh();
        },snapshot);
        const units=await page.evaluate(()=>window.ArmyBookAppV2.roster.state.units.map(unit=>({id:unit.instanceId,canonicalId:unit.canonicalUnitId})));
        assert.deepEqual(units.map(unit=>unit.canonicalId),spec.units.map(unit=>unit.unitId));
        const ids=new Map(spec.units.map((unit,index)=>[unit.instanceId,units[index].id]));
        if(spec.attachment){
          const leader=ids.get(spec.attachment.leader),bodyguard=ids.get(spec.attachment.bodyguard);await roster(page);
          await page.locator('[data-attachment-candidate-for="'+bodyguard+'"]').selectOption(leader);
          await page.locator('[data-attachment-target-instance-id="'+bodyguard+'"] [data-roster-action="attach"]').click();
          await page.locator('[data-attached-leader-instance-id="'+leader+'"]').waitFor();
        }
        const before=await page.evaluate(()=>JSON.stringify(window.ArmyBookAppV2.roster.projection));
        for(const unit of spec.units)for(const mode of ['Effective','Guide'])await inspect(page,spec,unit,ids.get(unit.instanceId),mode,device,'selected');
        assert.equal(await page.evaluate(()=>JSON.stringify(window.ArmyBookAppV2.roster.projection)),before,'Rendering changed execution');
        await page.screenshot({path:path.join(out,device+'-'+spec.id.replaceAll('/','-')+'.png')});
        if(spec.attachment){
          const leader=ids.get(spec.attachment.leader);await roster(page);
          await page.locator('[data-roster-action="detach"][data-leader-instance-id="'+leader+'"]').click();
          await page.locator('[data-attached-leader-instance-id="'+leader+'"]').waitFor({state:'hidden'});
          for(const unit of spec.units)await inspect(page,spec,
            {...unit,expectText:unit.expectAfterDetach??unit.expectText},ids.get(unit.instanceId),'Guide',device,'detached');
        }
        console.log('PASS '+device+' '+spec.id);
      }catch(error){await page.screenshot({path:path.join(out,device+'-'+spec.id.replaceAll('/','-')+'-FAIL.png')}).catch(()=>{});throw error;}
      finally{await context.close();}
    }
  assert.deepEqual(errors,[]);assert.deepEqual(missing,[]);completed=true;
}finally{
  fs.writeFileSync(path.join(out,'RESULTS.json'),JSON.stringify({status:completed?'PASS':'FAIL',results,errors,missing},null,2)+'\n');
  if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));
}
console.log(JSON.stringify({status:'PASS',scenarios:cases.length,devices:2,checks:results.length,evidence:out}));

import {launchQaBrowser} from '../../../tests/helpers/qa-browser.cjs';
/** Synthetic source geometry and paragraph controls in both publication presenters. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
const repo=fileURLToPath(new URL('../../../',import.meta.url));
const out=process.env.ARMY_APP_V2_SCREENSHOTS;
if(out)fs.mkdirSync(out,{recursive:true});
const server=http.createServer((request,response)=>{
  const address=new URL(request.url,'http://localhost').pathname;
  if(address==='/'){response.setHeader('Content-Type','text/html');response.end('<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><body class="v2-book-surface">');return;}
  const file=path.resolve(repo,'.'+decodeURIComponent(address));
  if(!file.startsWith(path.resolve(repo)+path.sep)||!fs.existsSync(file)){response.writeHead(404);response.end();return;}
  response.setHeader('Content-Type',file.endsWith('.css')?'text/css':'text/javascript');response.end(fs.readFileSync(file));
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const {chromium}=createRequire(import.meta.url)('playwright');
const chrome='C:/Program Files/Google/Chrome/Application/chrome.exe';
let browser;
const observations=[],errors=[];
try{
  browser=await launchQaBrowser(chromium,{headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE||(fs.existsSync(chrome)?chrome:undefined)});
  for(const [device,viewport]of [['desktop',{width:1440,height:1000}],['phone',{width:390,height:844}]]){
    const page=await browser.newPage({viewport});page.on('pageerror',error=>errors.push(error.message));
    await page.goto(`http://127.0.0.1:${server.address().port}/`);
    await page.addStyleTag({url:'/books/shared/army-book-app-v2/book-v1.css'});
    await page.addStyleTag({url:'/books/shared/army-book-app-v2/reference-v1.css'});
    const results=await page.evaluate(async()=>{
      const {createBookPresenter}=await import('/books/shared/army-book-app-v2/book-v1.mjs');
      const {createReferencePresenter}=await import('/books/shared/army-book-app-v2/reference-v1.mjs');
      const el=(tag,classes='',text)=>{const node=document.createElement(tag);node.className=classes;if(text!==undefined)node.textContent=text;return node;};
      const factValue=(tag,field)=>{const node=el(tag,'',field.displayValue??field.value);node.dataset.factId=field.id;node.dataset.factValue=JSON.stringify(field.value);return node;};
      const anchor=(label,id)=>{const node=el('a','',label);node.href='#'+id;return node;};
      const field=(row,column,value,table={})=>({id:`cell:${row}:${column}`,value,source:{entityId:'table-owner',path:`/rows/${row}/${column}`},presentation:'table-cell',table:{id:'table-owner::/rows',row,column,...table}});
      const cases=[['spans',[
        field(0,0,'Category',{rowSpan:2,header:true}),field(0,1,'Number',{columnSpan:2,header:true}),
        field(1,0,'First',{header:true}),field(1,1,'Second',{header:true}),
        field(2,0,'Small'),field(2,1,'2'),field(2,2,'3'),field(3,0,'Large'),field(3,1,'4'),field(3,2,'5')]],
        ['paragraphs',[{...field(0,0,'HeadingFlavour.Gameplay.'),displayValue:'Heading\n\nFlavour.\n\nGameplay.'}]],
        ['ordinary',[field(0,0,'A'),field(0,1,'B'),field(1,0,'C'),field(1,1,'D')]]];
      cases.push(['paragraphs-bound',cases[1][1].map(f=>({...f,table:{...f.table,rowSpan:1,columnSpan:1,header:false}}))]);
      const results=[];
      for(const [name,fields]of cases){
        const card={id:name,title:name,kind:'DETACHMENT_RULE',children:[],fields};
        const cards=new Map([[name,card]]),payload={bookPresentation:{schema:'army-book-app-v2/book-v1-presentation',records:{[name]:{tables:[]}}}};
        const book=createBookPresenter({document,payload,cards,el,factValue,anchor,allowedIds:()=>null});
        const contract={resolve:()=>({targetId:name,title:name,category:'Synthetic rule',contextLabel:'Source layout control',sections:[{card,fields}],references:[]})};
        const reference=createReferencePresenter({el,factValue,anchor,contract,cards,payload,allowedIds:()=>null});
        for(const [surface,node]of [['book',book.render(card)],['reference',reference.render(name)]]){
          node.dataset.case=name+'-'+surface;document.body.append(node);
          const bound=[...node.querySelectorAll('[data-fact-id]')];
          const result={name,surface,fieldIds:bound.map(n=>n.dataset.factId),values:bound.map(n=>JSON.parse(n.dataset.factValue)),native:!!node.querySelector('.source-fact-table'),overflow:node.getBoundingClientRect().right>innerWidth};
          if(name==='spans'){
            const table=node.querySelector('table'),rows=table.rows,rect=cell=>{const r=cell.getBoundingClientRect();return {x:r.x,right:r.right,bottom:r.bottom};};
            result.geometry={category:rect(rows[0].cells[0]),group:rect(rows[0].cells[1]),first:rect(rows[1].cells[0]),second:rect(rows[1].cells[1]),leftValue:rect(rows[2].cells[1]),rightValue:rect(rows[2].cells[2])};
            result.spans=[rows[0].cells[0].rowSpan,rows[0].cells[1].colSpan];result.scopes=[...table.querySelectorAll('th')].map(n=>n.scope);
          }
          if(name.startsWith('paragraphs')){result.visibleText=bound[0].innerText;result.whiteSpace=getComputedStyle(bound[0]).whiteSpace;}
          if(name==='ordinary')result.legacy=surface==='book'?!!node.querySelector('.data-row'):!!node.querySelector('.reference-table table');
          results.push(result);
        }
      }
      return {results,pageOverflow:document.documentElement.scrollWidth>innerWidth};
    });
    assert.equal(results.pageOverflow,false,device+' page overflow');
    for(const result of results.results){
      assert.equal(new Set(result.fieldIds).size,result.fieldIds.length,'Duplicated fact occurrence');assert.equal(result.overflow,false);
      if(result.name==='spans'){
        assert.equal(result.native,true);assert.deepEqual(result.spans,[2,2]);assert.deepEqual(result.scopes,['col','colgroup','col','col']);
        const g=result.geometry,close=(a,b)=>assert.ok(Math.abs(a-b)<1,'Header-to-value column association');
        close(g.first.x,g.leftValue.x);close(g.second.x,g.rightValue.x);close(g.group.x,g.first.x);close(g.group.right,g.second.right);close(g.category.bottom,g.first.bottom);
        assert.deepEqual(result.values,['Category','Number','First','Second','Small','2','3','Large','4','5']);
      }else if(result.name.startsWith('paragraphs')){
        assert.equal(result.native,result.name==='paragraphs-bound');assert.equal(result.whiteSpace,'pre-line');assert.match(result.visibleText,/Heading\n\nFlavour\.\n\nGameplay\./);assert.deepEqual(result.values,['HeadingFlavour.Gameplay.']);
      }else{assert.equal(result.native,false);assert.equal(result.legacy,true);assert.deepEqual(result.values,['A','B','C','D']);}
    }
    observations.push({device,...results});
    if(out)await page.screenshot({path:path.join(out,`source-table-synthetic-${device}.png`),fullPage:true});
    await page.close();
  }
  assert.deepEqual(errors,[]);
  if(out)fs.writeFileSync(path.join(out,'source-table-synthetic.json'),JSON.stringify(observations,null,2)+'\n');
  console.log(JSON.stringify({status:'PASS',viewports:observations.length,surfaces:2,cases:4,errors}));
}finally{await browser?.close();await new Promise(resolve=>server.close(resolve));}

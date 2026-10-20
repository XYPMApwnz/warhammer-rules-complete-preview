import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {loadPublicationInventory,selectPublicationBooks} from '../books/shared/tools/publication-inventory.mjs';

const moduleFile=fileURLToPath(import.meta.url);
const defaultRoot=()=>path.resolve(path.dirname(moduleFile),'..');
const startMarker='  // BEGIN GENERATED OFFLINE MOBILE ROUTES';
const endMarker='  // END GENERATED OFFLINE MOBILE ROUTES';

export function collectOfflineMobileRoutes({root=defaultRoot()}={}){
  const inventory=loadPublicationInventory({root}),routes=[];
  for(const book of selectPublicationBooks(inventory,'offline')){
    if(!book.mobile)throw new Error(`${book.id}: offline Army Book has no mobile route contract`);
    const directory=path.join(root,'books',book.id,'mobile');
    for(const file of fs.readdirSync(directory).filter(file=>file.endsWith('.html')).sort()){
      const html=fs.readFileSync(path.join(directory,file),'utf8');
      const target=/\bdata-canonical-target=["']([^"']+)["']/.exec(html)?.[1];
      if(!target)throw new Error(`${book.id}/mobile/${file}: missing canonical target`);
      routes.push({book:book.id,title:book.title,file,target,url:`./books/${book.id}/mobile/${file}`});
    }
  }
  const duplicates=[...new Set(routes.map(route=>route.url).filter((url,index,urls)=>urls.indexOf(url)!==index))];
  if(duplicates.length)throw new Error(`Duplicate offline mobile routes: ${duplicates.join(', ')}`);
  return routes;
}

const render=routes=>[startMarker,...routes.map(route=>`  ,${JSON.stringify(route.url)}`),endMarker].join('\n');

export function buildOfflineMobileRoutes({root=defaultRoot(),sourceRoot=root,check=false}={}){
  // A publication package need not contain build-only configs or mobile producers.
  const file=path.join(root,'service-worker.js'),routes=collectOfflineMobileRoutes({root:sourceRoot});
  let source=fs.readFileSync(file,'utf8'),expectedBlock=render(routes);
  const markerPattern=new RegExp(`${startMarker}[\\s\\S]*?${endMarker}`);
  if(markerPattern.test(source))source=source.replace(markerPattern,expectedBlock);
  else{
    const routeUrls=new Set(routes.map(route=>route.url));
    source=source.split(/\r?\n/).filter(line=>{
      const url=/["'](\.\/books\/[^"']+\/mobile\/[^"']+\.html)["']/.exec(line)?.[1];
      if(/^\s*,?\s*[A-Z_]+_MOBILE_FALLBACK\s*$/.test(line))return false;
      return !/^\s*,?\s*["']/.test(line)||!url||!routeUrls.has(url);
    }).join('\n');
    const end=source.indexOf('\n];');
    if(end<0)throw new Error('Unable to locate APP_SHELL end');
    source=source.slice(0,end)+'\n'+expectedBlock+source.slice(end);
  }
  const actual=fs.readFileSync(file,'utf8').replace(/\r\n?/g,'\n');
  if(check){
    if(actual!==source.replace(/\r\n?/g,'\n'))throw new Error('Generated offline mobile APP_SHELL routes are stale');
  }else fs.writeFileSync(file,source.replace(/\r\n?/g,'\n'),'utf8');
  return routes;
}

if(process.argv[1]&&path.resolve(process.argv[1])===moduleFile){
  try{
    const routes=buildOfflineMobileRoutes({check:process.argv.includes('--check')});
    console.log(`Offline mobile APP_SHELL routes ${process.argv.includes('--check')?'verified':'built'}: ${routes.length} physical routes across ${new Set(routes.map(route=>route.book)).size} books.`);
  }catch(error){console.error(error.stack||error);process.exitCode=1;}
}

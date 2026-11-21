/** Offline, read-only rule-markup coverage gate. No decision auto-refresh mode. */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {collectNativeInventory} from './markup-census/native-inventory.mjs';
import {checkMarkup,CATEGORIES} from './markup-census/check.mjs';
import {probeConditionComputers} from './markup-census/computers.mjs';
import {verifyMarkupEvidence} from './markup-census/evidence.mjs';
import {checkUnknownReview} from './markup-census/unknown-review.mjs';

const root=fileURLToPath(new URL('../',import.meta.url)),directory=path.join(root,'tools/markup-census');
const args=process.argv.slice(2),reportArg=args.find(arg=>arg.startsWith('--report='));
if(args.includes('--help')){
 console.log('Usage: npm run markup:census -- --check [--report=<external.json|external.md>]');
 console.log('Reads native inputs and reviewed decisions. Changed sources require review; there is no automatic repin/write option.');
 process.exit(0);
}
if(!args.length||args.some(arg=>arg!=='--check'&&!arg.startsWith('--report=')))throw new TypeError('Use --check and/or --report=<path>');
const read=name=>JSON.parse(fs.readFileSync(path.join(directory,name+'.v1.json'),'utf8'));
const started=performance.now();
let result;
try{
 const inventory=await collectNativeInventory({root});
 const computerAvailability=await probeConditionComputers({inventory,root});
 result=checkMarkup({inventory,registry:read('decisions'),baseline:read('debt-baseline'),debt:read('debt'),closures:read('closures'),retirements:read('retirements'),computerAvailability,
  verifyEvidence:(evidence,row)=>verifyMarkupEvidence({root,evidence,row})});
 result.computers=computerAvailability;
 result.unknownReview=checkUnknownReview({review:read('unknown-review'),registry:read('decisions'),debt:read('debt')});
}catch(error){result={schema:'markup-census-report/v1',status:'FAIL',error:error.message};process.exitCode=1;}
result.elapsedMs=Math.round((performance.now()-started)*1000)/1000;
if(reportArg){
 const target=path.resolve(reportArg.slice('--report='.length));
 if(target===path.resolve(root)||target.startsWith(path.resolve(root)+path.sep))throw new TypeError('Markup reports must be outside the checkout');
 fs.mkdirSync(path.dirname(target),{recursive:true});
 const markdown=path.extname(target).toLowerCase()==='.md';
 const text=markdown?['# Native markup census','',`Status: ${result.status}; elapsed: ${result.elapsedMs} ms.`,
  ...(result.status==='PASS'?[`N: ${result.N}; partial: ${result.partial}; resolved: ${result.resolved.count}/${result.N} (${result.resolved.percent.toFixed(2)}%).`,'',
   '| Book | Kind | N | '+CATEGORIES.join(' | ')+' |','| --- | --- | ---: | '+CATEGORIES.map(()=>'---:').join(' | ')+' |',
   ...result.summary.map(row=>'| '+[row.book,row.kind,row.N,...CATEGORIES.map(category=>row[category])].join(' | ')+' |'),
   '', '## Reviewed remaining debt', '', '| Book | ID | Next step |', '| --- | --- | --- |',
   ...result.unknownReview.nextSteps.map(row=>'| '+[row.book,row.id,row.nextStep].map(value=>value.replaceAll('|','&#124;').replaceAll('\n',' ')).join(' | ')+' |')]:[result.error]),''].join('\n'):JSON.stringify(result,null,2)+'\n';
 fs.writeFileSync(target,text);console.log('Report: '+target);
}
if(result.status==='PASS'){
 console.log('Book | Kind | N | '+CATEGORIES.join(' | '));
 for(const row of result.summary)console.log([row.book,row.kind,row.N,...CATEGORIES.map(category=>row[category])].join(' | '));
 console.log('MARKUP_CENSUS '+JSON.stringify({status:result.status,N:result.N,...result.counts,partial:result.partial,resolved:result.resolved,debt:result.debt,elapsedMs:result.elapsedMs}));
 console.log('Reviewed UNKNOWN next steps: '+result.unknownReview.remaining+'; use --report=<path> for the exact named list.');
}else console.error(result.error);

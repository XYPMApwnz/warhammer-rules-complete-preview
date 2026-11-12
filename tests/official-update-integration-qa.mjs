/** The common format must not require private phase tags or lose metadata. */
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {resolveQaPython} from './helpers/qa-python.cjs';
import {qaTempEnvironment} from './helpers/qa-temp.mjs';

const root=fileURLToPath(new URL('../',import.meta.url));
const source=String.raw`
import copy,json,runpy,sys
from pathlib import Path
root=Path(sys.argv[1])
results=[]
for book in ['adeptus-mechanicus','blood-angels','dark-angels']:
    namespace=runpy.run_path(str(root/'books'/book/'v2/build.py'))
    build=namespace['build']; scope=build.__globals__
    baseline=build()
    config=json.loads((root/'books'/book/'book.config.json').read_text('utf-8'))
    relative=config['passport']['official']['input']
    document=json.loads((root/relative).read_text('utf-8'))
    if book=='adeptus-mechanicus':
        original_read=scope['read']
        removed=0
        for entry in document['entries']:
            annotation=entry.get('annotations',{})
            if annotation.get('phase')=='effective':
                del annotation['phase']; removed+=1
        assert removed>0, 'The regular field-update path must be exercised'
        def read_without_private_tags(name):
            return copy.deepcopy(document) if str(name)==relative else original_read(name)
        try:
            scope['read']=read_without_private_tags
            assert build()==baseline, 'Optional phase tags changed accepted AM facts'
        finally:
            scope['read']=original_read
        results.append({'bookId':book,'optionalEffectivePhase':'PASS','acceptedFactsUnchanged':True})
    else:
        original_bridge=scope['apply_book_official_updates']
        marker={'syntheticTestMetadata':'retained after the default review seed'}
        document['initialize']=[{'path':['officialReview'],'value':marker}]
        def bridge_with_metadata(book_id,model,repository,**kwargs):
            return original_bridge(book_id,model,repository,**{**kwargs,'document':document})
        try:
            scope['apply_book_official_updates']=bridge_with_metadata
            updated=build()
        finally:
            scope['apply_book_official_updates']=original_bridge
        assert updated['effective']['officialReview']==marker, 'Accepted update metadata was overwritten: '+book
        updated['effective']['officialReview']=copy.deepcopy(baseline['effective']['officialReview'])
        assert updated==baseline, 'Review metadata changed factual records: '+book
        results.append({'bookId':book,'authoritativeUpdateMetadata':'PASS','acceptedFactsUnchanged':True})
print(json.dumps({'status':'PASS','results':results}))
`;
const env={...qaTempEnvironment(),PYTHONUTF8:'1',PYTHONIOENCODING:'utf-8',PYTHONDONTWRITEBYTECODE:'1'};
delete env.BOOK_UPDATE_OFFICIAL_LOG;
const result=JSON.parse(execFileSync(resolveQaPython(),['-B','-c',source,root],{cwd:root,env,encoding:'utf8',maxBuffer:8e6}));
assert.equal(result.status,'PASS');assert.equal(result.results.length,3);
console.log(JSON.stringify(result));

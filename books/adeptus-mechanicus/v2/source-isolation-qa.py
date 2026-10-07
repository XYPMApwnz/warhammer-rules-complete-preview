"""Closed-input rebuild: no legacy AdMech contracts or generated V1 content."""
import copy
import importlib.util
import json
import shutil
import tempfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
enrollment = json.loads((HERE/'sources/enrollment.json').read_text('utf8'))
relative = HERE.relative_to(ROOT)

with tempfile.TemporaryDirectory(prefix='am-v2-source-isolation-') as directory:
    isolated = Path(directory)
    paths = [item['path'] for item in enrollment['artifacts']]
    paths += [str(relative/name) for name in ('build.py','profile-bindings.json','weapon-selection-bindings.json','update-bindings.json','source-adjudications.json','sources/enrollment.json','sources/title-adjudication.json')]
    for name in paths:
        target = isolated/name
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(ROOT/name, target)
    assert not (isolated/'books/adeptus-mechanicus/sources/adeptus-mechanicus-effect-contracts.v1.json').exists()
    assert not (isolated/'books/adeptus-mechanicus/tools/canonical-source-adapter.mjs').exists()
    spec = importlib.util.spec_from_file_location('isolated_am_factual_build', isolated/relative/'build.py')
    builder = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(builder)
    actual = builder.build()
    for name in ('base','effective'):
        expected = json.loads((HERE/'generated'/f'{name}.json').read_text('utf8'))
        assert actual[name] == expected, 'Closed-input rebuild changed factual output'
    # The accepted transcription is narrowly enrolled for one title. Everything
    # except that field can be absent/poisoned without affecting V2 facts.
    original_read = builder.read
    reads = set()
    transcription = 'books/adeptus-mechanicus/content/adeptus-mechanicus-codex-detachments.en.json'

    def limited_read(name):
        reads.add(name)
        source = original_read(name)
        if name == transcription:
            title = source['detachments'][1]['stratagems'][1]['title']
            return {'detachments': [None, {'stratagems': [None, {'title':title,'eligibility':'POISON','effects':'POISON','contracts':'POISON'}]}]}
        return source

    builder.read = limited_read
    assert builder.build() == actual, 'Legacy contract contamination through accepted title transcription'
    assert all('effect-contract' not in path and '/generated/' not in path and '/tools/' not in path for path in reads)
    # Corrupting the only allowed title must fail its accepted evidence binding.
    def wrong_title(name):
        source = limited_read(name)
        if name == transcription:
            source = copy.deepcopy(source)
            source['detachments'][1]['stratagems'][1]['title'] = 'POISON'
        return source
    builder.read = wrong_title
    try:
        builder.build()
    except AssertionError:
        pass
    else:
        raise AssertionError('Severed accepted-title evidence was not detected')

print(json.dumps({'status':'PASS','legacyFactReads':0,'legacyContractsAbsent':True,'closedInputRebuild':'IDENTICAL','titleOnlyEvidenceIsolation':'PASS','sourceInputsRead':sorted(reads)}))

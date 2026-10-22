"""Fail-closed source/review mutation probes in temporary copies only.

The accepted repository files and expected values are never edited. Mutation
success means the existing producer rejects the corrupted enrollment/source.
"""
from __future__ import annotations
import copy, hashlib, importlib.util, json, shutil, sys, tempfile
from pathlib import Path

sys.dont_write_bytecode = True
HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
read = lambda p:json.loads(p.read_text(encoding='utf8'))
sha = lambda p:hashlib.sha256(p.read_bytes()).hexdigest().upper()


def module(path, name):
    spec = importlib.util.spec_from_file_location(name, path)
    result = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(result)
    return result


def main():
    producer = module(HERE/'build.py', 'ba_mutation_producer')
    original = producer.build()
    pristine_hashes = {p.relative_to(HERE).as_posix():sha(p) for p in HERE.rglob('*')
        if p.is_file() and '__pycache__' not in p.parts}
    checks = []
    def rejected(name, action):
        try:
            action()
        except (ValueError, AssertionError) as error:
            checks.append({'name':name,'result':'REJECTED','message':str(error)[:240]})
        else:
            raise AssertionError('Producer accepted mutation: '+name)
    for name, change in [
        ('foreign canonical owner', lambda d:d['entities'][0].update(bookId='space-marines')),
        ('missing parent', lambda d:next(r for r in d['entities'] if r.get('parentId')).update(parentId='unit-ba-unknown')),
        ('duplicate canonical identity', lambda d:d['entities'].append(copy.deepcopy(d['entities'][0]))),
        ('invented numeric MFM value', lambda d:d['entities'][0]['data'].update(points=0)),
        ('executed relation', lambda d:next(r for r in d['entities'] if r['kind']=='SOURCE_RELATION')['data'].update(effectiveEligibility=True)),
    ]:
        damaged = copy.deepcopy(original['base'])
        change(damaged)
        rejected(name, lambda d=damaged:producer.validate(d))
    with tempfile.TemporaryDirectory(prefix='ba-stage2a-source-mutations-') as name:
        temp_root = Path(name)
        destination = temp_root/'books/blood-angels/v2'
        shutil.copytree(HERE,destination,ignore=shutil.ignore_patterns('__pycache__'))
        # Existing canonical SM source owners are external references, never
        # copied into BA facts. Their accepted source files are needed here only
        # to prove the isolated mutation sandbox has the same enrollment.
        paths = [r['path'] for r in read(HERE/'sources/enrollment.json')['artifacts']]
        paths += [r['path'] for r in read(HERE/'source-review.json')['reviewedArtifacts']]
        for path in paths:
            target=temp_root/path
            if not target.exists():
                target.parent.mkdir(parents=True,exist_ok=True)
                shutil.copyfile(ROOT/path,target)
        isolated = module(destination/'build.py', 'ba_isolated_source_producer')
        assert isolated.build()==original, 'Temporary exact source copy changes producer result'
        raw = destination/'sources/raw/wahapedia-blood-angels-main.html'
        accepted = raw.read_bytes()
        assert b'Legacy of the Angel' in accepted
        raw.write_bytes(accepted.replace(b'Legacy of the Angel',b'Corrupted source condition',1))
        rejected('altered accepted RAW bytes', isolated.build)
        raw.write_bytes(accepted)
        review = destination/'source-review.json'
        accepted_review = review.read_bytes()
        altered = read(review)
        altered['reviewedArtifacts'][0]['sha256']='0'*64
        review.write_text(json.dumps(altered,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
        rejected('altered review SHA pin', isolated.build)
        review.write_bytes(accepted_review)
        binding_path = destination/'source-bindings.json'
        accepted_binding = binding_path.read_bytes()
        altered = read(binding_path)
        altered['recordAddresses'][0]['rawNodeSha256']='0'*64
        binding_path.write_text(json.dumps(altered,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
        rejected('altered persistent source node binding', isolated.build)
        binding_path.write_bytes(accepted_binding)
        # The exact prior state must be usable after each failed candidate.
        assert isolated.build()==original, 'Rejected import/source mutation damaged prior factual state'
    assert {p.relative_to(HERE).as_posix():sha(p) for p in HERE.rglob('*')
        if p.is_file() and '__pycache__' not in p.parts}==pristine_hashes, 'Mutation probes changed accepted files'
    print(json.dumps({'status':'PASS','controls':checks,'acceptedFilesChanged':0,
        'temporaryCopiesOutsideRepository':True,'restoredBuildParity':True},indent=2))


if __name__=='__main__':
    main()

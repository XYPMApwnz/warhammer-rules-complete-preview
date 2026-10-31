"""Source-only rebuild and fail-closed integrity/ownership controls in isolation."""
import copy
import json
import shutil
import sys
from pathlib import Path

sys.dont_write_bytecode = True
sys.path.insert(0, str(Path(__file__).resolve().parents[3]/'tests/helpers'))
from qa_temp import create_qa_temp_dir, qa_tmp_root
from build import ROOT, SOURCE, build, read, verify_sources


def main():
    baseline = build()
    here = ROOT/'books/emperors-children/v2'
    enrollment = read(here/'sources/enrollment.json')
    checks = []
    # Temporary files remain outside the repository; no current worktree bytes change.
    temporary_root = qa_tmp_root()
    with create_qa_temp_dir('ec-source-only-') as directory:
        isolated = Path(directory).resolve()
        if isolated == Path(isolated.anchor) or isolated.parent != temporary_root or not isolated.name.startswith('ec-source-only-'):
            raise ValueError('Unsafe temporary isolation path')
        for artifact in enrollment['artifacts']:
            target = isolated/artifact['path']; target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(ROOT/artifact['path'], target)
        for name in ['identity-bindings.json', 'model-bindings.json', 'official-bindings.json', 'mfm-bindings.json', 'sources/enrollment.json', 'sources/source-census.json']:
            target = isolated/'books/emperors-children/v2'/name; target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(here/name, target)
        assert not (isolated/'books/emperors-children/content').exists()
        assert not (isolated/'books/emperors-children/v2/generated').exists()
        assert not (isolated/'books/emperors-children/sources/emperors-children-effect-contracts.v1.json').exists()
        assert build(isolated) == baseline, 'Factual rebuild depends on legacy/runtime/generated input'
        checks.append('isolated accepted-source-only rebuild')

        def rejects(name, relative, mutate, integrity_only=False):
            file = isolated/relative
            before = file.read_bytes()
            try:
                file.write_bytes(mutate(before))
                try:
                    if integrity_only:
                        verify_sources(isolated, enrollment)
                    else:
                        build(isolated)
                except (ValueError, AssertionError):
                    checks.append(name)
                else:
                    raise AssertionError('Invalid mutation was accepted: '+name)
            finally:
                file.write_bytes(before)
        def json_change(change):
            def mutate(raw):
                value = json.loads(raw); change(value)
                return (json.dumps(value, ensure_ascii=False, indent=2)+'\n').encode()
            return mutate
        rejects('changed HTML bytes', SOURCE+'/Noise-Marines.html', lambda raw: raw+b' ', True)
        rejects('changed corpus bytes', SOURCE+'/corpus.json', lambda raw: raw+b' ', True)
        rejects('damaged official PDF bytes', 'books/emperors-children/v2/sources/emperors-children-faction-pack-v1.3.pdf', lambda raw: raw+b' ', True)
        rejects('missing canonical identity', 'books/emperors-children/v2/identity-bindings.json', json_change(lambda value: value['bindings'].pop()))
        rejects('duplicate canonical identity', 'books/emperors-children/v2/identity-bindings.json', json_change(lambda value: value['bindings'].append(copy.deepcopy(value['bindings'][0]))))
        rejects('wrong source owner', 'books/emperors-children/v2/identity-bindings.json', json_change(lambda value: value['bindings'][1].update(ownerSourceId='datasheet-noise-marines')))
        rejects('MODEL recipient changed to Bodyguard', 'books/emperors-children/v2/model-bindings.json', json_change(lambda value: value['ruleScopeBindings'][0].update(compositionMemberSourceIds=['datasheet-tormentors:section:2:member:1'], modelProfileSourceIds=['datasheet-tormentors:profile:1'])))
        rejects('official correction wrong canonical target', 'books/emperors-children/v2/official-bindings.json', json_change(lambda value: value['occurrences'][0]['patches'][0].update(targetId='detachment-carnival-of-excess:rule')))
        assert build(isolated) == baseline, 'Temporary mutation restoration changed the foundation'
    print(json.dumps({'status': 'PASS', 'checks': checks, 'repositorySourcesChanged': False, 'legacyOrGeneratedFactualInputs': 0}))


if __name__ == '__main__':
    main()

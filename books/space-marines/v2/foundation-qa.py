"""SM Stage 2A independent factual boundary and corruption controls.

All factual expectations come from the independent RAW/PDF oracles. The
production build is the actual value under test, never the expected model.
"""
from __future__ import annotations
import copy
import json
import re
import sys
from collections import Counter
from pathlib import Path
import importlib.util

sys.dont_write_bytecode = True
HERE=Path(__file__).resolve().parent
ROOT=HERE.parents[2]
if str(HERE) not in sys.path:
    sys.path.insert(0,str(HERE))


def load(name,path):
    spec=importlib.util.spec_from_file_location(name,path)
    module=importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def boundary_errors(snapshot, bindings):
    errors=[]
    need=lambda ok,msg:errors.append(msg) if not ok else None
    records=snapshot['entities']
    byid={r['id']:r for r in records}
    ledger={b['sourceEntityId']:b for b in bindings}
    need(snapshot.get('bookId')=='space-marines','wrong-snapshot-owner')
    need(snapshot.get('edition')=='11E','wrong-edition')
    need(len(byid)==len(records),'duplicate-id')
    need(len({r['sourceEntityId'] for r in records})==len(records),'duplicate-source-id')
    forbidden={'points','pointCost','pointsCost','unitCost','mfmCost','mfmPoints','officialPoints','rosterPoints'}
    def walk(value,path):
        if isinstance(value,dict):
            for k,v in value.items():
                need(k not in forbidden,'forbidden-points-field:'+path+'/'+k)
                walk(v,path+'/'+k)
        elif isinstance(value,list):
            for i,v in enumerate(value):walk(v,path+'/'+str(i))
    for r in records:
        sid=r['sourceEntityId']
        b=ledger.get(sid,{})
        need(r.get('bookId')=='space-marines','foreign-book:'+sid)
        need(r['id']==b.get('id') and r['kind']==b.get('kind'),'identity-ledger-disagreement:'+sid)
        need(re.fullmatch(r'[a-z-]+sm-[0-9a-f]{16}',r['id']) is not None,'nonopaque-canonical-id:'+sid)
        parent=r.get('parentId')
        need(parent is None or parent in byid,'dangling-parent:'+sid)
        if parent in byid:
            need(b.get('ownerSourceId')==byid[parent]['sourceEntityId'],'binding-owner-disagreement:'+sid)
        walk(r.get('data',{}),sid)
        if r['kind']=='RULE_REFERENCE':
            need(r['data'].get('scope')=='SOURCE_DECLARATION','guessed-native-reference-recipient:'+sid)
            need(not ({'recipient','modelProfileIds','compositionMemberIds'} & set(r['data'])),
                'invented-native-reference-recipient:'+sid)
        if r['kind']=='SOURCE_RELATION':
            need(r['data'].get('effectiveEligibility') is False and r['data'].get('mfmIntegrated') is False,
                'executed-source-only-relation:'+sid)
        if r['kind']=='MODEL_PROFILE':
            need(set(r['data']['stats'])=={'M','T','SV','W','LD','OC'},'model-stat-shape:'+sid)
        if r['kind']=='COMPOSITION_MEMBER' and r['data'].get('modelProfileId'):
            target=byid.get(r['data']['modelProfileId'],{})
            need(target.get('kind')=='MODEL_PROFILE' and target.get('parentId')==parent,'cross-unit-model-join:'+sid)
        if r['kind']=='INVULNERABLE_SAVE':
            for target in r['data'].get('sourceProfileIds',[]):
                model=byid.get(target,{})
                need(model.get('kind')=='MODEL_PROFILE' and model.get('parentId')==parent,'cross-unit-invulnerable-join:'+sid)
            need(bool(r['data'].get('scopeQualification')),'lost-invulnerable-scope:'+sid)
    for key in ['contentCertified','presentationImplemented','rosterIntegrationImplemented']:
        need(snapshot.get(key) is False,'premature-stage-claim:'+key)
    need(snapshot.get('gameplayContractsImplemented')==0,'premature-gameplay-execution')
    return errors


def mutation_controls(result,oracle,raw,bindings,addresses):
    controls=[]
    original=result['base']['entities']
    def first(rows,kind):return next(r for r in rows if r['kind']==kind)
    def trial(name,change):
        damaged=copy.deepcopy(original)
        change(damaged)
        errors=raw.compare(damaged,oracle,bindings,addresses)
        if not errors:
            errors=boundary_errors({**result['base'],'entities':damaged},bindings)
        assert errors,'Existing QA assertions missed mutation: '+name
        controls.append(name)
    trial('missing-source-weapon',lambda rows:rows.remove(first(rows,'WEAPON_PROFILE')))
    trial('duplicate-identity',lambda rows:rows.append(copy.deepcopy(rows[0])))
    trial('wrong-model-owner',lambda rows:first(rows,'MODEL_PROFILE').update(parentId='unit-sm-invalid'))
    trial('changed-weapon-stat',lambda rows:first(rows,'WEAPON_PROFILE')['data'].update(strength='99'))
    trial('removed-source-clause',lambda rows:first(rows,'DATASHEET_ABILITY')['data'].update(text='Truncated'))
    trial('missing-provenance',lambda rows:first(rows,'ENHANCEMENT').update(provenance={}))
    trial('changed-canonical-identity',lambda rows:first(rows,'MODEL_PROFILE').update(id='model-sm-0000000000000000'))
    trial('changed-source-identity',lambda rows:first(rows,'MODEL_PROFILE').update(sourceEntityId='sm-source-0000000000000000'))
    trial('wrong-source-hash',lambda rows:first(rows,'ENHANCEMENT')['provenance'].update(sha256='0'*64))
    trial('foreign-owned-record',lambda rows:first(rows,'DATASHEET').update(bookId='deathwatch'))
    trial('invented-native-MODEL-scope',lambda rows:first(rows,'RULE_REFERENCE')['data'].update(scope='MODEL'))
    trial('lost-invulnerable-recipient',lambda rows:first(rows,'INVULNERABLE_SAVE')['data'].update(sourceProfileIds=[]))
    conditional=next(r for r in original if r['kind']=='INVULNERABLE_SAVE' and
        r['data']['scopeQualification']=='CONDITIONAL_SOURCE_MODEL')
    trial('lost-conditional-invulnerable-scope',lambda rows:next(r for r in rows if r['id']==conditional['id'])[
        'data'].update(scopeQualification='DATASHEET_HEADER_SOURCE_PROFILES',conditionText=''))
    named=next(r for r in original if r['kind']=='DATASHEET' and r['data'].get('modelKeywordDeclarations'))
    trial('lost-named-model-keyword-recipient',lambda rows:next(r for r in rows if r['id']==named['id'])[
        'data']['modelKeywordDeclarations'][0].update(sourceProfileId=None))
    trial('named-keyword-applied-to-all-models',lambda rows:next(r for r in rows if r['id']==named['id'])[
        'data']['keywords'].append(named['data']['modelKeywordDeclarations'][0]['keywords'][0]))
    trial('unreachable-owned-weapon',lambda rows:first(rows,'DATASHEET')['data']['weaponIds'].pop())
    trial('invented-MFM-numeric-field',lambda rows:first(rows,'DATASHEET')['data'].update(points=123))
    nested=next(r for r in original if r['kind']=='DETACHMENT_RULE' and
        any(p['id']==r.get('parentId') and p['kind']=='DETACHMENT_RULE' for p in original))
    trial('missing-nested-rule',lambda rows:rows.remove(next(r for r in rows if r['id']==nested['id'])))
    long_enh=next(r for r in original if r['kind']=='ENHANCEMENT' and 'Or:' in r['data']['text'])
    trial('lost-enhancement-list-tail',lambda rows:next(r for r in rows if r['id']==long_enh['id'])['data'].update(
        text=long_enh['data']['text'].split('Or:',1)[0]))
    return controls


def enrollment_controls(producer,raw):
    """Exercise explicit enrollment without rewriting a source or ledger file."""
    sources=raw.read(HERE/'source-bindings.json')
    identities=raw.read(HERE/'identity-bindings.json')
    pristine_sources,pristine_identities=copy.deepcopy(sources),copy.deepcopy(identities)
    expected=producer.collect()
    reversed_sources,reversed_identities=copy.deepcopy(sources),copy.deepcopy(identities)
    reversed_sources['recordAddresses'].reverse()
    reversed_identities['bindings'].reverse()
    reversed_before=copy.deepcopy((reversed_sources,reversed_identities))
    assert producer.collect(source_bindings=reversed_sources,identity_bindings=reversed_identities)==expected, \
        'Canonical entities/accounting depend on source or identity ledger order'
    assert (reversed_sources,reversed_identities)==reversed_before,'Collection mutated injected enrollment'
    controls=['reversed-source-and-identity-ledgers-preserve-exact-collection']
    def reject(name,change):
        damaged_sources,damaged_identities=copy.deepcopy(sources),copy.deepcopy(identities)
        change(damaged_sources,damaged_identities)
        try:
            producer.collect(source_bindings=damaged_sources,identity_bindings=damaged_identities)
        except ValueError:
            controls.append(name)
        else:
            raise AssertionError('Producer accepted damaged enrollment: '+name)
    reject('missing-source-binding',lambda source,identity:source['recordAddresses'].pop())
    reject('duplicate-source-binding',lambda source,identity:source['recordAddresses'].append(
        copy.deepcopy(source['recordAddresses'][0])))
    reject('unbound-source-address',lambda source,identity:source['recordAddresses'][0].update(key='unbound-source-address'))
    reject('missing-identity-binding',lambda source,identity:identity['bindings'].pop())
    reject('duplicate-identity-binding',lambda source,identity:identity['bindings'].append(
        copy.deepcopy(identity['bindings'][0])))
    def wrong_owner(source,identity):
        child=next(b for b in identity['bindings'] if b.get('ownerSourceId'))
        other=next(b for b in identity['bindings'] if b.get('ownerSourceId') is None and
            b['sourceEntityId']!=child['ownerSourceId'])
        child['ownerSourceId']=other['sourceEntityId']
    reject('wrong-existing-owner-binding',wrong_owner)
    enrollment=raw.read(HERE/'sources/enrollment.json')
    pristine_enrollment=copy.deepcopy(enrollment)
    damaged=copy.deepcopy(enrollment)
    damaged['artifacts'][0]['sha256']='0'*64
    try:
        producer.verify_sources(enrollment=damaged)
    except ValueError:
        controls.append('altered-expected-raw-source-sha')
    else:
        raise AssertionError('Source integrity accepted an altered expected SHA')
    assert sources==pristine_sources and identities==pristine_identities and enrollment==pristine_enrollment, \
        'Enrollment controls mutated their pristine inputs'
    return controls


def main():
    raw=load('sm_independent_raw',HERE/'raw-inventory-qa.py')
    producer=load('sm_foundation_producer',HERE/'build.py')
    official=load('sm_independent_official',HERE/'official-qa.py')
    official_producer=load('sm_official_layer',HERE/'official.py')
    oracle=raw.raw_oracle()
    bindings=raw.read(HERE/'identity-bindings.json')['bindings']
    addresses=raw.read(HERE/'source-bindings.json')['recordAddresses']
    result=producer.build()
    pristine=copy.deepcopy(result)
    assert result['base']['schema']=='space-marines-v2-canonical/v1'
    assert result['effective']['schema']=='space-marines-v2-effective/v1'
    errors=raw.compare(result['base']['entities'],oracle,bindings,addresses)
    cross=result['cross-owner-references']
    errors+=raw.compare(cross['entities'],oracle,bindings,addresses,cross_owner=True)
    errors+=boundary_errors(result['base'],bindings)
    errors+=boundary_errors(result['effective'],bindings)
    assert not errors,'\n'.join(errors)
    main_sources={r['sourceEntityId'] for r in result['base']['entities']}
    foreign_sources={r['sourceEntityId'] for r in cross['entities']}
    assert not main_sources & foreign_sources,'Cross-owner source identity duplicated into SM facts'
    assert main_sources|foreign_sources=={b['sourceEntityId'] for b in bindings},'Unused or missing identity enrollment'
    assert main_sources|foreign_sources=={a['sourceEntityId'] for a in addresses},'Unused or missing source enrollment'
    roots={r['id'] for r in cross['entities'] if not r.get('parentId')}
    assert set(result['base']['crossOwnerReferenceIds'])==roots,'Cross-owner references lost their separate owner'
    counts=Counter(r['kind'] for r in oracle['rows'])
    census=result['factual-census']
    assert census['counts']==counts,'Reported census disagrees with independent raw partition'
    assert census['mainEntities']==len(oracle['rows']) and census['sourceRows']==len(oracle['rows'])+len(oracle['crossOwnerRows'])
    assert census['crossOwnerCounts']==Counter(r['kind'] for r in oracle['crossOwnerRows'])
    assert census['enhancements']==sum(r['kind']=='ENHANCEMENT' and r['data']['itemKind']=='ENHANCEMENT' for r in oracle['rows'])
    assert census['unitUpgrades']==sum(r['kind']=='ENHANCEMENT' and r['data']['itemKind']=='UNIT_UPGRADE' for r in oracle['rows'])
    assert producer.build()==pristine,'Offline build is not reproducible from persistent bindings'
    assert result==pristine,'Build/check mutated its previous return value'
    official_checks=official.check_official(result['base'],result['effective'])
    controls=mutation_controls(result,oracle,raw,bindings,addresses)
    enrollment_checks=enrollment_controls(producer,raw)
    official_controls=official.corruption_controls(result['base'],official_producer.apply_official)
    print(json.dumps({'status':'PASS','independentRawCensus':raw.census(oracle),
        'official':official_checks,'mutationControls':controls,
        'enrollmentControls':enrollment_checks,
        'officialCorruptionControls':official_controls,
        'boundaries':{'offline':True,'bookOwned':True,'MFMPointsImported':False,
        'gameplayContractsImplemented':0,'contentCertified':False}},ensure_ascii=False,indent=2))


if __name__=='__main__':main()

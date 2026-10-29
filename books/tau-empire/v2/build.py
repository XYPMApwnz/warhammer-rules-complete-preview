"""Offline, source-owned T'au V2 factual projection. No import/UI/effect execution.

Uses the existing accepted-HTML parser as a transcription helper, then explicit
reviewed raw bindings preserve complete sibling rules/lists and source scopes.
Legacy corpus/effect contracts are never read. Identity enrollment is not rebuilt.
"""
from __future__ import annotations
import argparse
import copy
import hashlib
import importlib.util
import json
import re
import sys
from collections import Counter
from pathlib import Path
from lxml import html
import pdfplumber

sys.dont_write_bytecode = True

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
sys.path.insert(0, str(ROOT/'books/shared/tools'))
from source_refs_output import serialized_source_outputs
BOOK = 'tau-empire'
SOURCE = 'books/tau-empire/sources/waha-11e-current-2026-09-28'
HUB = SOURCE+'/tau-empire.html'
read = lambda p: json.loads(Path(p).read_text(encoding='utf-8'))
sha = lambda b: hashlib.sha256(b).hexdigest().upper()
norm = lambda s: ' '.join(str(s).split())
serialize = lambda v: (json.dumps(v, ensure_ascii=False, indent=2)+'\n').encode('utf-8')
value_sha = lambda v: sha(json.dumps(v, ensure_ascii=False, separators=(',', ':')).encode())
MFM_FIELDS = {'points','pointSchedules','wahaPoints','paidOptions','paidWargear','wargearCosts',
              'enhancementCost','enhancementPoints','detachmentPoints','forceDisposition','forceDispositions'}

def unique(rows, key='id'):
    result = {}
    for row in rows:
        k = row[key]
        if not k or k in result:
            raise ValueError('Missing/duplicate identity: '+str(k))
        result[k] = row
    return result

def body(node):
    node = copy.deepcopy(node)
    for bad in list(node.iterdescendants()):
        if not isinstance(bad.tag, str):
            continue
        classes = (bad.get('class') or '').split()
        if bad.tag in ('script','style','h2','h3') or any(c in classes for c in ('ShowFluff','faqErrataSpoiler','EnhancementsPts')):
            if bad.getparent() is not None:
                bad.drop_tree()
    for e in node.iter():
        if e.tag in ('br','p','ul','ol','li','div','tr','td'):
            if e.text:
                e.text = ' '+e.text
            e.tail = ' '+(e.tail or '')
    return norm(''.join(node.itertext()))

def verify_sources(enrollment):
    for artifact in enrollment['artifacts']:
        raw = (ROOT/artifact['path']).read_bytes()
        if sha(raw) != artifact['sha256'] or len(raw) != artifact['bytes']:
            raise ValueError('Source integrity mismatch: '+artifact['path'])
        if 'capturedSha256' in artifact:
            captured = raw.replace(b'\n',b'\r\n')
            if b'\r' in raw or sha(captured) != artifact['capturedSha256'] or len(captured) != artifact['capturedBytes']:
                raise ValueError('Captured byte representation mismatch: '+artifact['path'])
    for dependency in enrollment.get('producerDependencies',[]):
        if sha((ROOT/dependency['path']).read_bytes()) != dependency['sha256']:
            raise ValueError('Reviewed transcription helper changed: '+dependency['path'])

def parser():
    spec = importlib.util.spec_from_file_location('tau_accepted_raw_parser', ROOT/'books/tau-empire/tools/import-waha-current-corpus.py')
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module

def tree_node(binding):
    tree = html.parse(str(ROOT/binding['document']))
    nodes = tree.xpath(binding['xpath'])
    if len(nodes) != 1:
        raise ValueError('Unresolved source address: '+binding['sourceId'])
    return nodes[0]

def bound_text(binding):
    value = body(tree_node(binding))
    if sha(value.encode()) != binding['textSha256']:
        raise ValueError('Reviewed raw block changed: '+binding['sourceId'])
    return value

def collect(source_bindings=None, enrollment=None):
    source_bindings = source_bindings or read(HERE/'source-bindings.json')
    enrollment = enrollment or read(HERE/'sources/enrollment.json')
    p = parser()
    hub = p.parse_hub(ROOT/HUB)
    rows = []
    def add(sid, kind, parent, data):
        rows.append({'sourceId':sid,'kind':kind,'ownerSourceId':parent,'data':copy.deepcopy(data)})
    for rule in hub['armyRules']:
        add(rule['sourceId'],'ARMY_RULE',None,rule)
        for part in rule['components']:
            add(part['sourceId'],'ARMY_RULE_COMPONENT',rule['sourceId'],part)
    for det in hub['detachments']:
        add(det['sourceId'],'DETACHMENT',None,det)
        for binding in source_bindings['namedRules']:
            if binding['ownerSourceId'] == det['sourceId']:
                add(binding['sourceId'],'DETACHMENT_RULE',det['sourceId'],
                    {'title':binding['title'],'text':bound_text(binding),'tableIds':[],
                     'sourceOccurrences':copy.deepcopy(binding.get('sourceOccurrences',[]))})
        for field,kind in [('enhancements','ENHANCEMENT'),('stratagems','STRATAGEM')]:
            for item in det[field]:
                if kind == 'ENHANCEMENT':
                    binding = next(b for b in source_bindings['rawEnhancementText'] if b['sourceId']==item['sourceId'])
                    item = copy.deepcopy(item)
                    item['text'] = bound_text(binding)
                    item['scope'] = 'UNIT' if binding['unitUpgrade'] else 'MODEL'
                    item['itemKind'] = 'UNIT_UPGRADE' if binding['unitUpgrade'] else 'ENHANCEMENT'
                    item['eligibilityText'] = item['text'].split('.',1)[0]+'.'
                add(item['sourceId'],kind,det['sourceId'],item)
    for page in enrollment['rawPages']:
        if page['path'] == HUB:
            continue
        unit = p.parse_datasheet(ROOT/page['path'],page['url'])
        for binding in source_bindings['sectionSupplements']:
            if binding['ownerSourceId'] == unit['sourceId']:
                unit['sections'].append({'sourceId':binding['sourceId'],'title':binding['title'],
                    'blocks':[{'text':bound_text(binding),'wargearAbility':False}]})
        add(unit['sourceId'],'DATASHEET',None,unit)
        for field,kind in [('profiles','MODEL_PROFILE'),('weapons','WEAPON_PROFILE'),('wargearOptions','WARGEAR_OPTION'),
                           ('sections','DATASHEET_SECTION'),('ruleReferences','RULE_REFERENCE')]:
            for item in unit[field]:
                add(item['sourceId'],kind,unit['sourceId'],item)
        for member in source_bindings['modelUnits'][unit['sourceId']]:
            text = bound_text(member)
            add(member['sourceId'],'COMPOSITION_MEMBER',unit['sourceId'],
                {'name':member['name'],'quantity':member['quantity'],'modelProfileId':member['modelProfileSourceId'],'text':text})
    for item in hub['errata']:
        if item['sourceId'] in source_bindings['excludedSourceOccurrences']:
            continue
        add(item['sourceId'],item['class'],None,item)
    for binding in source_bindings['drones']:
        add(binding['sourceId'],'EQUIPMENT_RULE',None,{'title':binding['title'],'text':bound_text(binding),
            'scope':'MODEL_BEARER','tokensAreModels':False,'weaponIds':[w['sourceId'] for w in binding['weapons']]})
        for w in binding['weapons']:
            node = tree_node(w)
            cells = [norm(e.text_content()) for e in node.xpath('./td')]
            values = cells[-6:]
            data = dict(zip(['range','attacks','skill','strength','ap','damage'],values))
            data.update(name=w['name'],mode='ranged',abilities=w['abilities'])
            add(w['sourceId'],'WEAPON_PROFILE',binding['sourceId'],data)
    unique(rows,'sourceId')
    return rows

def clean_data(data):
    if isinstance(data,list):
        return [clean_data(v) for v in data]
    if not isinstance(data,dict):
        return data
    return {k:clean_data(v) for k,v in data.items() if k not in MFM_FIELDS and k not in {'sourceId','class','normalizedContentFingerprint'}}

def build():
    enrollment = read(HERE/'sources/enrollment.json')
    verify_sources(enrollment)
    sb = read(HERE/'source-bindings.json')
    identities = read(HERE/'identity-bindings.json')
    ids = unique(identities['bindings'],'sourceEntityId')
    unique(identities['bindings'])
    rows = collect(sb,enrollment)
    if {r['sourceId'] for r in rows} != set(ids):
        raise ValueError('Persistent source inventory changed; explicit identity review required')
    addresses = unique(sb['recordAddresses'],'sourceId')
    if set(addresses) != set(ids):
        raise ValueError('Incomplete source addresses')
    cid = lambda sid: ids[sid]['id']
    records = []
    for row in rows:
        sid,kind,parent = row['sourceId'],row['kind'],row['ownerSourceId']
        identity,address = ids[sid],addresses[sid]
        if identity['kind'] != kind or identity['ownerSourceId'] != parent:
            raise ValueError('Wrong source kind/owner: '+sid)
        data = clean_data(row['data'])
        if kind == 'DATASHEET':
            data = {k:data[k] for k in ['title','url','keywords','factionKeywords','keywordGroups'] if k in data}
            for field,k in [('profileIds','MODEL_PROFILE'),('weaponIds','WEAPON_PROFILE'),('sectionIds','DATASHEET_SECTION'),
                            ('wargearOptionIds','WARGEAR_OPTION'),('ruleReferenceIds','RULE_REFERENCE'),('compositionMemberIds','COMPOSITION_MEMBER')]:
                data[field] = [cid(r['sourceId']) for r in rows if r['ownerSourceId']==sid and r['kind']==k]
        elif kind == 'DETACHMENT':
            data = {'title':data['title'],'ruleIds':[cid(r['sourceId']) for r in rows if r['ownerSourceId']==sid and r['kind']=='DETACHMENT_RULE'],
                    'enhancementIds':[cid(e['sourceId']) for e in row['data']['enhancements']],
                    'stratagemIds':[cid(e['sourceId']) for e in row['data']['stratagems']]}
        elif kind == 'ARMY_RULE':
            data = {'title':data['title'],'componentIds':[cid(c['sourceId']) for c in row['data']['components']]}
        elif kind == 'MODEL_PROFILE':
            data['compositionMemberIds'] = [cid(r['sourceId']) for r in rows if r['kind']=='COMPOSITION_MEMBER' and r['data']['modelProfileId']==sid]
            data['scope'] = 'SOURCE_PROFILE'
        elif kind == 'COMPOSITION_MEMBER':
            data['modelProfileId'] = cid(data['modelProfileId'])
        elif kind == 'RULE_REFERENCE':
            # Factual native recipients; semantic/executable classification belongs to Stage 3.
            data.update(scope='MODEL',recipient={'scope':'MODEL',
                'modelProfileIds':[cid(r['sourceId']) for r in rows if r['ownerSourceId']==parent and r['kind']=='MODEL_PROFILE'],
                'compositionMemberIds':[cid(r['sourceId']) for r in rows if r['ownerSourceId']==parent and r['kind']=='COMPOSITION_MEMBER']})
        elif kind == 'EQUIPMENT_RULE':
            data['weaponIds'] = [cid(s) for s in data['weaponIds']]
        proof = {'sourceId':'tau-empire-waha-11e-2026-09-28','document':address['document'],
                 'sha256':next(a['sha256'] for a in enrollment['artifacts'] if a['path']==address['document']),
                 'sourceEntityId':sid,'pointer':address['xpath'],'authority':'ACCEPTED_SECONDARY'}
        records.append({'id':cid(sid),'kind':kind,'sourceEntityId':sid,'bookId':BOOK,'data':data,
                        'provenance':proof,**({'parentId':cid(parent)} if parent else {})})
    base = {'schema':'tau-empire-v2-canonical/v1','bookId':BOOK,'edition':'11E','entities':records,
            'sourceAccounting':[{k:r[k] for k in ['sourceId','kind','ownerSourceId']}|{'document':addresses[r['sourceId']]['document'],'pointer':addresses[r['sourceId']]['xpath']} for r in rows],
            'sourceEnrollment':'books/tau-empire/v2/sources/enrollment.json',
            'mfmBoundary':{'owner':'CENTRALIZED_MFM','sourceVersion':'v1.6','bindingsDocument':'books/tau-empire/v2/mfm-bindings.json','valuesCopied':False},
            'coreReferences':copy.deepcopy(sb['coreReferences']),
            'rosterReferenceSemantics':{},'gameplayContractsImplemented':0,'rosterIntegrationImplemented':False,'presentationImplemented':False,'contentCertified':False}
    effective = apply_official(base)
    effective['unresolvedSources'] = read(HERE/'source-issues.json')['unresolved']
    validate(base);validate(effective)
    census = {'schema':'tau-empire-v2-factual-census/v1','counts':dict(sorted(Counter(e['kind'] for e in effective['entities']).items())),
              'sourceRows':len(rows),'sourceEnrollmentVerified':True,
              'officialInstructions':sum(u['group']=='RULES_UPDATE' for u in effective['officialUpdates']),
              'officialFaqOccurrences':sum(u['group']=='FAQ' for u in effective['officialUpdates']),
              'officialOccurrences':len(effective['officialUpdates']),
              'officialSupplementalChecks':len(effective['officialSupplementalChecks']),
              'universalAlreadyCurrentChecks':len(effective['universalChecks']['checks']),
              'gameplayContractsImplemented':0,'rosterIntegrationImplemented':False,'presentationImplemented':False,'contentCertified':False}
    return {'base':base,'effective':effective,'factual-census':census}

def apply_official(base):
    effective = copy.deepcopy(base)
    effective['schema'] = 'tau-empire-v2-effective/v1'
    records = unique(effective['entities'],'sourceEntityId')
    declarations = read(HERE/'official-bindings.json')
    updates = []
    document = declarations.get('document',declarations.get('sourceDocument'))
    document_sha = declarations.get('sha256',declarations.get('sourceSha256'))
    with pdfplumber.open(ROOT/document) as pdf:
        for item in declarations['occurrences']:
            box = item.get('sourceBox',item)
            text = pdf.pages[box['page']-1].crop(tuple(box['bbox'])).extract_text(x_tolerance=3,y_tolerance=3) or ''
            if sha(text.encode()) != box['textSha256']:
                raise ValueError('Official source occurrence mismatch: '+item['id'])
            proof = {'sourceId':declarations['sourceId'],'document':document,'sha256':document_sha,
                     'page':box['page'],'bbox':box['bbox'],'textSha256':box['textSha256'],'effectiveFrom':declarations['effectiveFrom'],'authority':'AUTHORITATIVE_CURRENT'}
            targets = []
            for patch in item.get('patches',[]):
                target = records[patch['targetSourceId']]
                owner = target['data']
                field = patch['field']
                for key in field[:-1]:
                    owner = owner[key]
                before = owner[field[-1]]
                if value_sha(before) != patch['beforeSha256']:
                    raise ValueError('Official target changed: '+patch['targetSourceId']+'/'+str(field))
                if patch.get('operation','SET') != 'SET':
                    raise ValueError('Unknown official patch operation')
                after = patch['after']
                if patch.get('afterSha256') and value_sha(after) != patch['afterSha256']:
                    raise ValueError('Official value changed')
                owner[field[-1]] = copy.deepcopy(after)
                target.setdefault('fieldProvenance',{})['/'.join(map(str,field))] = copy.deepcopy(proof)
                targets.append(target['id'])
            updates.append({'id':item['id'],'group':item['group'],'status':'APPLIED' if item.get('patches') else 'VERIFY_CURRENT',
                            **({'sourceScopeQualification':item['sourceScopeQualification']} if 'sourceScopeQualification' in item else {}),
                            'targetIds':list(dict.fromkeys(targets)),'provenance':proof,'sourceText':text})
        supplemental = []
        for item in declarations.get('supplementalChecks',[]):
            box = item['sourceBox']
            text = pdf.pages[box['page']-1].crop(tuple(box['bbox'])).extract_text(x_tolerance=3,y_tolerance=3) or ''
            if sha(text.encode()) != box['textSha256']:
                raise ValueError('Official supplemental source changed: '+item['id'])
            targets = []
            for check in item['targets']:
                target = records[check['targetSourceId']]
                value = target['data']
                for key in check['field']:
                    value = value[key]
                if value_sha(value) != check['valueSha256'] or check['absentValue'] in value:
                    raise ValueError('Official supplemental target mismatch: '+check['targetSourceId'])
                targets.append(target['id'])
            supplemental.append({'id':item['id'],'status':'VERIFIED_CURRENT','targetIds':targets,
                'qualification':item['qualification'],'sourceText':text,
                'provenance':{'sourceId':declarations['sourceId'],'document':document,'sha256':document_sha,
                    'page':box['page'],'bbox':box['bbox'],'textSha256':box['textSha256'],
                    'effectiveFrom':declarations['effectiveFrom'],'authority':'AUTHORITATIVE_CURRENT'}})
    effective['officialUpdates'] = updates
    effective['officialSupplementalChecks'] = supplemental
    universal = declarations['universalChecks']
    with pdfplumber.open(ROOT/universal['sourceDocument']) as pdf:
        text = pdf.pages[universal['page']-1].extract_text(x_tolerance=3,y_tolerance=3) or ''
    if sha(text.encode()) != universal['textSha256']:
        raise ValueError('Universal source occurrence changed')
    checks = []
    for item in universal['checks']:
        if item['instructionHeading'] not in norm(text):
            raise ValueError('Universal instruction missing: '+item['id'])
        target = records[item['targetSourceId']]
        value = target['data']
        for key in item['field']:
            value = value[key]
        if value_sha(value) != item['valueSha256'] or any(s not in value for s in item['requiredText']):
            raise ValueError('Universal current target mismatch: '+item['targetSourceId'])
        checks.append({'id':item['id'],'targetId':target['id'],'field':item['field'],
                       'status':'VERIFIED_CURRENT','instructionHeading':item['instructionHeading']})
    effective['universalChecks'] = {'provenance':{'sourceId':universal['sourceId'],
        'document':universal['sourceDocument'],'sha256':universal['sourceSha256'],
        'page':universal['page'],'textSha256':universal['textSha256'],'authority':'AUTHORITATIVE_CURRENT'},
        'checks':checks,'sourceScopeQualification':universal['sourceScopeQualification']}
    return effective

def validate(document):
    records = unique(document['entities'])
    for e in records.values():
        if e.get('parentId') and e['parentId'] not in records:
            raise ValueError('Missing factual owner: '+e['id'])
        if e['bookId'] != BOOK or not e.get('provenance',{}).get('sourceId'):
            raise ValueError('Missing source provenance')
        if e.get('ruleContract'):
            raise ValueError('Gameplay contract outside factual scope')
        def check(v):
            if isinstance(v,dict):
                if set(v)&MFM_FIELDS:
                    raise ValueError('Army-owned MFM values: '+e['id'])
                for x in v.values():check(x)
            elif isinstance(v,list):
                for x in v:check(x)
        check(e['data'])
        if e['kind']=='DATASHEET':
            for k in ['profileIds','weaponIds','sectionIds','wargearOptionIds','ruleReferenceIds','compositionMemberIds']:
                if len(e['data'][k]) != len(set(e['data'][k])) or any(i not in records or records[i].get('parentId')!=e['id'] for i in e['data'][k]):
                    raise ValueError('Unresolved/foreign factual child')
    return True

def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument('--check',action='store_true')
    args = ap.parse_args()
    outputs = build()
    for name,value in serialized_source_outputs(outputs, ROOT).items():
        target = HERE/'generated'/(name+'.json')
        if args.check:
            if not target.exists() or target.read_bytes()!=value:
                raise ValueError('Stale factual output: '+name)
        else:
            target.parent.mkdir(exist_ok=True)
            target.write_bytes(value)
    print(json.dumps(outputs['factual-census']))

if __name__=='__main__':
    main()

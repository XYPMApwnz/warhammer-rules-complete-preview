"""Focused Tau V2 factual/official boundary and corruption controls.

The official oracle reads the accepted PDF at independently fixed addresses.
Neither official-bindings after-values nor generated output define expectations.
"""
from __future__ import annotations
import copy
import hashlib
import importlib.util
import json
import re
import sys
from pathlib import Path
import pdfplumber

sys.dont_write_bytecode = True

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
PDF = ROOT/'books/tau-empire/sources/tau-empire-faction-pack-v1.1.pdf'
PDF_SHA = '32B985646BAA02A3B505FF3404E91D374A5F53C1D3B8000D7166CA94D1B52675'
UNIVERSAL_PDF = ROOT/'books/tyranids/v2/sources/universal-rules-updates-v1.1.pdf'
UNIVERSAL_SHA = 'E9368C75BF4C9040FA978E7F792080E71D140997DEF77182DD41E71959185A72'
read = lambda path: json.loads(path.read_text(encoding='utf-8'))
norm = lambda value: ' '.join(value.replace('‑','-').split())
digest = lambda raw: hashlib.sha256(raw).hexdigest().upper()


def load(name, path):
    spec = importlib.util.spec_from_file_location(name, path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def field(data, path):
    for key in path:
        data = data[key]
    return data


def official_oracle(base):
    """27 instructions, addressed independently of the production ledger."""
    assert digest(PDF.read_bytes()) == PDF_SHA, 'Accepted official PDF changed'
    records = {r['sourceEntityId']:r for r in base['entities']}
    results = []
    with pdfplumber.open(PDF) as pdf:
        def add(name, page, box, patches, mode='replace'):
            literal = pdf.pages[page-1].crop(box).extract_text(x_tolerance=3,y_tolerance=3) or ''
            value = norm(literal)
            proof = {'sourceId':'tau-empire-faction-pack-v1.1',
                'document':PDF.relative_to(ROOT).as_posix(),'sha256':PDF_SHA,
                'page':page,'bbox':list(box),'textSha256':digest(literal.encode()),
                'effectiveFrom':'2026-07-22','authority':'AUTHORITATIVE_CURRENT'}
            expected = []
            for sid, path, prefix in patches:
                if mode == 'replace':
                    after = prefix+value.split('Change to:',1)[1].strip().strip('‘’\'')
                elif mode == 'distance':
                    old, new = re.search(r'Change (\d+\") to (\d+\")',value).groups()
                    after = field(records[sid]['data'],path).replace(old,new)
                    assert new in after
                elif mode == 'frame':
                    assert 'FRAME' in value and records[sid]['data']['title'].replace('’',"'") in value.replace('’',"'")
                    after = copy.deepcopy(field(records[sid]['data'],path))
                    if 'FRAME' not in after:
                        after.append('FRAME')
                elif mode == 'aircraft':
                    assert 'Change M and OC to' in value
                    after = '-'
                elif mode == 'reference':
                    assert 'FACTION: For the Greater Good' in value
                    after = 'For the Greater Good'
                elif mode == 'faq':
                    question, answer = value.split('Q:',1)[1].split(' A:',1)
                    after = question.strip() if path == ['title'] else answer.strip()
                else:
                    raise AssertionError('Unknown independent official mode')
                expected.append({'targetSourceId':sid,'field':path,'after':after})
            results.append({'id':'tau-official-v1.1:'+name,'patches':expected,'provenance':proof,'sourceText':value})
        add('army-for-the-greater-good',19,(42,250,292,462),[('army-rule-for-the-greater-good:definition',['text'],'')])
        add('kauyon-through-unity-devastation',19,(42,481,292,550),[('detachment-kauyon:enhancement:4',['text'],'')])
        add('kauyon-photon-grenades',19,(42,558,292,605),[('detachment-kauyon:stratagem:5',['lines',0,'text'],'')])
        add('kauyon-patient-hunter',19,(42,613,292,716),[('detachment-kauyon:rule',['text'],'')])
        add('montka-coordinated-exploitation',19,(303,217,556,286),[('detachment-montka:enhancement:1',['text'],'')])
        add('montka-strike-swiftly',19,(303,294,556,364),[('detachment-montka:enhancement:4',['text'],'')])
        add('montka-killing-blow',19,(303,371,556,452),[('detachment-montka:rule',['text'],'')])
        add('retaliation-puretide-neurochip',19,(303,470,556,518),[('detachment-retaliation-cadre:enhancement:3',['text'],'')])
        add('retaliation-shortened-blade',19,(303,525,556,551),[('detachment-retaliation-cadre:stratagem:3',['lines',2,'text'],'')],'distance')
        add('retaliation-bonded-heroes',19,(303,558,556,639),[('detachment-retaliation-cadre:rule',['text'],'')])
        frame = ['devilfish','hammerhead-gunship','piranhas','sky-ray-gunship','tidewall-droneport','tidewall-gunrig','tidewall-shieldline']
        add('datasheets-frame',19,(303,657,556,695),[('datasheet-'+sid,['keywords'],'') for sid in frame],'frame')
        add('crisis-sunforge',19,(303,701,556,760),[('datasheet-crisis-sunforge-battlesuits:section:1',['blocks',0,'text'],'Sunforge: ')])
        add('ethereal-faction-ability',20,(42,63,292,100),[('datasheet-ethereal:rule-reference:2',['label'],'')],'reference')
        add('firesight-precise-targeting',20,(42,107,292,155),[('datasheet-firesight-team:section:1',['blocks',0,'text'],'Precise Targeting: ')])
        add('kroot-trail-ambush',20,(42,163,292,228),[('datasheet-kroot-trail-shaper:section:1',['blocks',1,'text'],'Kroot Ambush: ')])
        add('kroot-trail-finding',20,(42,228,292,287),[('datasheet-kroot-trail-shaper:section:1',['blocks',0,'text'],'Trail Finding: ')])
        add('pathfinder-target-uploaded',20,(42,294,292,353),[('datasheet-pathfinder-team:section:1',['blocks',0,'text'],'Target Uploaded: ')])
        add('riptide-nova-charge',20,(42,361,292,426),[('datasheet-riptide-battlesuit:section:1',['blocks',1,'text'],'Nova Charge: ')])
        # The two numeric rows, including signs, come directly from the PDF.
        box = (42,437,292,547)
        value = norm(pdf.pages[19].crop(box).extract_text(x_tolerance=3,y_tolerance=3) or '')
        values = re.findall(r'(\d+\")\s+(\d+)\s+(\d\+)\s+(\d+)\s+(-\d+)\s+(\d+)',value)
        assert len(values) == 2 and '[HAZARDOUS]' in value
        numeric = []
        for number, stats in enumerate(values,2):
            sid = 'datasheet-riptide-battlesuit:weapon:'+str(number)
            numeric += [{'targetSourceId':sid,'field':[key],'after':after} for key,after in zip(['range','attacks','skill','strength','ap','damage'],stats)]
            numeric.append({'targetSourceId':sid,'field':['abilities'],'after':['hazardous'] if number == 3 else []})
        add('riptide-ion-accelerator-profiles',20,box,[])
        results[-1]['patches'] = numeric
        add('stealth-forward-observers',20,(42,548,292,613),[('datasheet-stealth-battlesuits:section:1',['blocks',0,'text'],'Forward Observers: ')])
        add('stealth-homing-beacon',20,(42,613,292,630),[('datasheet-stealth-battlesuits:section:1',['blocks',1,'text'],'')],'distance')
        aircraft = ['razorshark-strike-fighter','sun-shark-bomber']
        add('aircraft-frame',20,(42,635,292,657),[('datasheet-'+sid,['keywords'],'') for sid in aircraft],'frame')
        add('aircraft-move-objective-control',20,(42,635,292,672),[('datasheet-'+sid+':profile:1',['stats',key],'') for sid in aircraft for key in ['M','OC']],'aircraft')
        add('sun-shark-pulse-bombs',20,(42,679,292,738),[('datasheet-sun-shark-bomber:section:1',['blocks',0,'text'],'Pulse Bombs: ')])
        add('twin-lance-neocapacitor',20,(303,63,556,133),[('datasheet-the-twin-lance:section:1',['blocks',1,'text'],'Neocapacitor Shields: ')])
        add('faq-ethereal-embarked',20,(303,162,556,199),[('faq-2',[key],'') for key in ['title','text']],'faq')
        add('faq-hidden-hunters',20,(303,206,556,299),[('faq-3',[key],'') for key in ['title','text']],'faq')
    return results


def cover_oracle():
    box = (50,249.55,292,271.55)
    with pdfplumber.open(PDF) as pdf:
        text = pdf.pages[0].crop(box).extract_text(x_tolerance=3,y_tolerance=3) or ''
    assert norm(text) == "Imperial Armour: Remove 'FRAME' from Tiger Shark and AX-1-0 Tiger Shark"
    return {'id':'tau-official-v1.1:tiger-sharks-frame-removed','status':'VERIFIED_CURRENT',
        'sourceText':text,'qualification':"The v1.1 cover identifies removal of FRAME from Tiger Shark and AX-1-0 Tiger Shark. Current raw native keyword arrays already omit FRAME; no overwrite or invented removal is applied.",
        'provenance':{'sourceId':'tau-empire-faction-pack-v1.1','document':PDF.relative_to(ROOT).as_posix(),
            'sha256':PDF_SHA,'page':1,'bbox':list(box),'textSha256':digest(text.encode()),
            'effectiveFrom':'2026-07-22','authority':'AUTHORITATIVE_CURRENT'}}


def universal_oracle():
    assert digest(UNIVERSAL_PDF.read_bytes()) == UNIVERSAL_SHA,'Accepted universal PDF changed'
    with pdfplumber.open(UNIVERSAL_PDF) as pdf:
        assert len(pdf.pages) == 1
        text = pdf.pages[0].extract_text(x_tolerance=3,y_tolerance=3) or ''
    value = norm(text)
    assert 'VERSION 1.1' in value and '26th August 2026' in value
    hidden_heading = 'STRATAGEMS THAT PREVENT UNITS FROM BEING TARGETED'
    hunt_heading = 'STRATAGEMS THAT ADD NEW UNITS TO YOUR ARMY'
    disembark_heading = 'MOVE TYPES FOR DISEMBARKING UNITS'
    hidden = value.split(hidden_heading,1)[1].split(hunt_heading,1)[0]
    hunt = value.split(hunt_heading,1)[1].split(disembark_heading,1)[0]
    disembark = value.split(disembark_heading,1)[1]
    assert 'can only be selected as the target of a ranged attack if the attacking model is within 18".' in hidden
    assert 'You can only use this stratagem once per battle.' in hunt
    assert 'advance move that turn, that unit makes a shock disembark move (18.07)' in disembark
    return {'provenance':{'sourceId':'universal-rules-updates-v1.1',
        'document':UNIVERSAL_PDF.relative_to(ROOT).as_posix(),'sha256':UNIVERSAL_SHA,
        'page':1,'textSha256':digest(text.encode()),'authority':'AUTHORITATIVE_CURRENT'},
        'checks':[
            ('detachment-kroot-hunting-pack:stratagem:6',['lines',2,'text'],hidden_heading,'hidden'),
            ('detachment-kroot-hunting-pack:stratagem:1',['lines',3,'text'],hunt_heading,'hunt'),
            ('datasheet-devilfish:section:1',['blocks',0,'text'],disembark_heading,'disembark')]}


def compare(result, official, cover, universal):
    errors = []
    need = lambda condition, message: errors.append(message) if not condition else None
    base, effective = result['base'], result['effective']
    b = {r['sourceEntityId']:r for r in base['entities']}
    e = {r['sourceEntityId']:r for r in effective['entities']}
    need(len(b) == len(base['entities']) and len(e) == len(effective['entities']),'duplicate source entity')
    need(len({r['id'] for r in effective['entities']}) == len(effective['entities']),'duplicate effective identity')
    need(set(b) == set(e),'official identity inventory changed')
    expected = copy.deepcopy(b)
    updates = {u['id']:u for u in effective.get('officialUpdates',[])}
    need(len(updates) == len(effective.get('officialUpdates',[])),'duplicate official instruction')
    need(set(updates) == {u['id'] for u in official},'official update inventory changed')
    for item in official:
        targets = []
        for patch in item['patches']:
            sid, path = patch['targetSourceId'], patch['field']
            if sid not in e:
                errors.append('missing-official-target:'+sid)
                continue
            wanted = expected[sid]
            data = wanted['data']
            for key in path[:-1]:
                data = data[key]
            data[path[-1]] = copy.deepcopy(patch['after'])
            wanted.setdefault('fieldProvenance',{})['/'.join(map(str,path))] = item['provenance']
            targets.append(e[sid]['id'])
        update = updates.get(item['id'],{})
        need(update.get('targetIds') == list(dict.fromkeys(targets)),'wrong-official-targets:'+item['id'])
        need(update.get('provenance') == item['provenance'],'wrong-official-provenance:'+item['id'])
        need(norm(update.get('sourceText','')) == item['sourceText'],'lost-official-evidence:'+item['id'])
        need(update.get('status') == 'APPLIED','unapplied-official-instruction:'+item['id'])
        need(update.get('group') == ('FAQ' if ':faq-' in item['id'] else 'RULES_UPDATE'),'wrong-official-group:'+item['id'])
        if item['id'] == 'tau-official-v1.1:montka-strike-swiftly':
            qualification = "The official quoted replacement does not state the raw-source eligibility preface “T’AU EMPIRE model only.”. The replacement body follows the accepted PDF literally; baseline eligibility metadata is separately retained and this omission does not implement or infer expanded eligibility."
            need(update.get('sourceScopeQualification') == qualification,'lost-source-eligibility-qualification')
    for sid, wanted in expected.items():
        need(e.get(sid) == wanted,'unexpected-effective-value-or-delta:'+sid)
    targets = ['datasheet-tiger-shark','datasheet-ax-1-0-tiger-shark']
    wanted_cover = copy.deepcopy(cover)
    wanted_cover['targetIds'] = [b[sid]['id'] for sid in targets]
    need(effective.get('officialSupplementalChecks') == [wanted_cover],'wrong-cover-FRAME-verification')
    for sid in targets:
        need('FRAME' not in b[sid]['data']['keywords'] and 'FRAME' not in e.get(sid,{}).get('data',{}).get('keywords',[]),'invented-Tiger-Shark-FRAME:'+sid)
    verified = effective.get('universalChecks',{})
    need(verified.get('provenance') == universal['provenance'],'wrong-universal-source-proof')
    checks = verified.get('checks',[])
    need(len(checks) == len(universal['checks']),'wrong-universal-target-inventory')
    expected_checks = {(b[sid]['id'],tuple(path),heading,'VERIFIED_CURRENT') for sid,path,heading,_ in universal['checks']}
    actual_checks = {(item.get('targetId'),tuple(item.get('field',[])),item.get('instructionHeading'),item.get('status')) for item in checks}
    need(actual_checks == expected_checks,'wrong-universal-target-or-instruction')
    qualification = verified.get('sourceScopeQualification','')
    need(isinstance(qualification,str) and 'Rapid Ingress' in qualification,'lost-named-Stratagem-scope-qualification')
    for sid,path,_,mode in universal['checks']:
        for name,records in [('base',b),('effective',e)]:
            value = field(records[sid]['data'],path).casefold() if sid in records else ''
            if mode == 'hidden':
                valid = 'can only be selected as the target of a ranged attack if the attacking model is within 18"' in value
            elif mode == 'hunt':
                valid = 'you can only use this stratagem once per battle.' in value
            else:
                valid = 'after it has advanced' in value and 'shock disembark move (core rules, 18.07)' in value
            need(valid,'wrong-universal-fact:'+name+'/'+sid)
    for snapshot in [base,effective]:
        need(snapshot.get('gameplayContractsImplemented') == 0,'factual stage gained gameplay execution')
        need(snapshot.get('rosterReferenceSemantics') == {},'native references became executable')
        need(snapshot.get('rosterIntegrationImplemented') is False,'factual stage gained roster integration')
        need(snapshot.get('presentationImplemented') is False,'factual stage gained presentation')
        need(snapshot.get('contentCertified') is False,'premature content certification')
    return errors


def main():
    producer = load('tau_stage2_build',HERE/'build.py')
    raw = load('tau_stage2_raw_qa',HERE/'raw-inventory-qa.py')
    result = producer.build()
    oracle = raw.raw_oracle()
    bindings = read(HERE/'identity-bindings.json')['bindings']
    addresses = read(HERE/'source-bindings.json')['recordAddresses']
    errors = raw.compare(result['base']['entities'],oracle,bindings,addresses)
    official = official_oracle(result['base'])
    cover = cover_oracle()
    universal = universal_oracle()
    errors += compare(result,official,cover,universal)
    assert not errors,'\n'.join(errors)
    def entity(value,sid):
        return next(r for r in value['effective']['entities'] if r['sourceEntityId']==sid)
    def trial(name,mutate):
        damaged = copy.deepcopy(result)
        mutate(damaged)
        assert compare(damaged,official,cover,universal),'Comparator missed '+name
        return name
    controls = [
        trial('wrong-official-value',lambda r: entity(r,'datasheet-riptide-battlesuit:weapon:2')['data'].update(strength='99')),
        trial('lost-official-provenance',lambda r: entity(r,'detachment-kauyon:rule').pop('fieldProvenance')),
        trial('missing-official-update',lambda r:r['effective']['officialUpdates'].pop()),
        trial('wrong-official-owner',lambda r: entity(r,'datasheet-the-twin-lance:section:1').update(parentId='unit-ethereal')),
        trial('unrelated-effective-delta',lambda r: entity(r,'datasheet-kroot-carnivores:section:bodyguard')['data']['blocks'].clear()),
        trial('native-FNP-execution',lambda r:r['effective']['rosterReferenceSemantics'].update({'arbitrary':{'abilities':[{'name':'Feel No Pain','value':5}]}})),
        trial('invented-Tiger-Shark-FRAME',lambda r:entity(r,'datasheet-tiger-shark')['data']['keywords'].append('FRAME')),
        trial('invented-AX-keyword',lambda r:entity(r,'datasheet-ax-1-0-tiger-shark')['data']['keywords'].append('SCOUTS')),
        trial('lost-cover-verification',lambda r:r['effective']['officialSupplementalChecks'].clear()),
        trial('universal-Hidden-Hunters-18-to-12',lambda r:entity(r,'detachment-kroot-hunting-pack:stratagem:6')['data']['lines'][2].update(text=entity(r,'detachment-kroot-hunting-pack:stratagem:6')['data']['lines'][2]['text'].replace('18"','12"'))),
        trial('universal-Join-Hunt-once-per-battle-lost',lambda r:entity(r,'detachment-kroot-hunting-pack:stratagem:1')['data']['lines'][3].update(text=entity(r,'detachment-kroot-hunting-pack:stratagem:1')['data']['lines'][3]['text'].replace('You can only use this Stratagem once per battle.',''))),
        trial('universal-Devilfish-shock-declaration-lost',lambda r:entity(r,'datasheet-devilfish:section:1')['data']['blocks'][0].update(text='Rapid Deployment: Units can disembark from this TRANSPORT after it has Advanced.')),
        trial('lost-universal-verification',lambda r:r['effective'].pop('universalChecks')),
    ]
    for label,mutate in [('army-owned-points',lambda d:d['entities'][0]['data'].update(points=999)),
                         ('missing-owner',lambda d:d['entities'][1].update(parentId='absent-owner')),
                         ('gameplay-contract',lambda d:d['entities'][0].update(ruleContract={'operation':'new'}))]:
        damaged = copy.deepcopy(result['base'])
        mutate(damaged)
        try:
            producer.validate(damaged)
        except ValueError:
            controls.append(label)
        else:
            raise AssertionError('Validator missed '+label)
    enrollment = read(HERE/'sources/enrollment.json')
    poisoned = copy.deepcopy(enrollment)
    poisoned['artifacts'][0]['sha256'] = '0'*64
    try:
        producer.verify_sources(poisoned)
    except ValueError:
        controls.append('source-integrity-mismatch')
    else:
        raise AssertionError('Validator accepted mismatched source bytes')
    for name,value in result.items():
        assert producer.serialize(value) == (HERE/'generated'/(name+'.json')).read_bytes(),'Stale generated '+name
    assert producer.serialize(producer.build()) == producer.serialize(result),'Nondeterministic factual build'
    print(json.dumps({'FOUNDATION':'PASS','OFFICIAL_INSTRUCTIONS':len(official),'COVER_FRAME_CHECK':'PASS','UNIVERSAL_CHECKS':'3/3',
        'RAW_COVERAGE':raw.census(oracle),'MUTATIONS_DETECTED':controls,
        'SOURCE_INTEGRITY':'PASS','DETERMINISM':'PASS','STALE_GUARD':'PASS'},indent=2))


if __name__ == '__main__':
    main()

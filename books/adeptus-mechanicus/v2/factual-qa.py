"""Independent source census/parity and in-memory factual mutations.

Does not import the producer. Expectations come from pinned capture values,
independent raw DOM selectors, and the current official PDF.
"""
import copy
import hashlib
import json
import re
import sys
from collections import Counter
from pathlib import Path
from urllib.parse import urlparse
from lxml import html
import pdfplumber

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
SOURCE = ROOT/'books/adeptus-mechanicus/sources/waha-11e-current-2026-09-25'
read = lambda path: json.loads(path.read_text('utf8'))
norm = lambda value: re.sub(r'\s+', ' ', str(value)).strip()
compact = lambda value: re.sub(r'\s+', '', re.sub(r'^\s*[-•]\s*', '', str(value), flags=re.M))
has = lambda name: 'contains(concat(" ", normalize-space(@class), " "), " '+name+' ")'
digest = lambda value: hashlib.sha256(value).hexdigest().upper()


def scalars(value):
    if isinstance(value, dict):
        return sum(scalars(v) for v in value.values())
    if isinstance(value, list):
        return sum(scalars(v) for v in value)
    return 1


def capture_leaves(value, prefix=''):
    if isinstance(value, dict):
        for key, child in value.items():
            yield from capture_leaves(child, prefix+'/'+key.replace('~','~0').replace('/','~1'))
    elif isinstance(value, list):
        for i, child in enumerate(value):
            yield from capture_leaves(child, prefix+'/'+str(i))
    else:
        yield prefix


def official_update_parity(index, pages):
    """Independent literal checkpoints transcribed from official pp17–19.

    These are assertions, never inputs to the factual producer. Source paragraphs
    remain authoritative; this guard rejects a stale operational capture.
    """
    def data(identity):
        return index[identity]['data']

    def core(unit):
        return [entry['label'] for group in data('datasheet-'+unit+':rule-reference:1')['groups'] if group['label']=='CORE ABILITIES' for entry in group['entries']]

    def keywords(unit):
        return [k for scope in data('datasheet-'+unit+':keyword-scopes')['scopes'] if scope['id'].endswith(':all-models') for k in scope['keywords']]

    for unit in ('belisarius-cawl','corpuscarii-electro-priests','cybernetica-datasmith','fulgurite-electro-priests','kastelan-robots','tech-priest-dominus','tech-priest-enginseer','tech-priest-manipulus','technoarcheologist'):
        groups = data('datasheet-'+unit+':rule-reference:1')['groups']
        assert any(e['label']=='Doctrina Imperatives' for g in groups for e in g['entries']), 'Official p17: '+unit
    for unit in ('archaeopter-fusilave','archaeopter-stratoraptor'):
        stats = data('datasheet-'+unit+':profile:default')['stats']
        assert stats['M']==stats['OC']=='-' and 'Hover' not in core(unit), 'Official p17 aircraft'
    assert data('datasheet-archaeopter-transvector:profile:default')['stats']['M']=='14"'
    assert 'AIRCRAFT' not in keywords('archaeopter-transvector')
    assert data('datasheet-belisarius-cawl:profile:default')['stats']['M']=='8"'
    assert 'MOBILE' in keywords('belisarius-cawl')
    assert data('datasheet-belisarius-cawl:weapon:1')['attacks']=='3'
    assert data('datasheet-belisarius-cawl:weapon:1')['damage']=='D6'
    for unit in ('cybernetica-datasmith','skitarii-marshal','technoarcheologist'):
        assert 'Support' in core(unit) and 'Leader' not in core(unit), 'Official Support update: '+unit
    assert 'VEHICLE' in keywords('cybernetica-datasmith') and 'INFANTRY' not in keywords('cybernetica-datasmith')
    assert 'Firing Deck 2' in core('skorpius-dunerider')
    for unit in ('skorpius-disintegrator','skorpius-dunerider'):
        assert 'FRAME' in keywords(unit)
    # page, unit, source weapon ordinal, exact six values, exact abilities
    weapons = [
        (18,'ironstrider-ballistarii',1,['48"','4','4+','9','-1','3'],['sustained hits 1','twin-linked']),
        (18,'ironstrider-ballistarii',2,['48"','2','4+','12','-3','D6+1'],['sustained hits 1','twin-linked']),
        (18,'onager-dunecrawler',2,['48"','2','4+','10','-2','D6+1'],['anti-fly 2+']),
        (18,'onager-dunecrawler',3,['36"','3D3','4+','9','-2','2'],['blast','sustained hits 1']),
        (18,'onager-dunecrawler',4,['18"','3D3','4+','10','-3','3'],['blast','sustained hits 1']),
        (18,'onager-dunecrawler',5,['48"','3','4+','16','-4','D6+2'],['heavy']),
        (18,'onager-dunecrawler',7,['36"','12','4+','6','-1','2'],['ignores cover','twin-linked']),
        (18,'sicarian-infiltrators',3,['Melee','4','4+','4','-2','1'],[]),
        (18,'sicarian-infiltrators',4,['Melee','3','4+','6','-1','1'],['sustained hits 2']),
        (19,'sicarian-ruststalkers',1,['Melee','5','4+','5','-1','1'],['devastating wounds','precision']),
        (19,'sicarian-ruststalkers',2,['Melee','5','4+','5','-2','1'],['anti-infantry 3+','devastating wounds','precision']),
        (19,'sicarian-ruststalkers',3,['Melee','3','4+','5','-2','2'],['anti-infantry 3+','precision']),
        (19,'skorpius-disintegrator',4,['48"','3','4+','12','-3','D6+1'],[]),
    ]
    letters = lambda text: re.sub(r'[^a-z0-9]', '', text.lower())
    for page, unit, number, values, abilities in weapons:
        weapon = data('datasheet-'+unit+':weapon:'+str(number))
        assert [weapon[k] for k in ('range','attacks','skill','strength','ap','damage')]==values, (unit,number,'official values')
        assert weapon['abilities']==abilities, (unit,number,'official weapon abilities')
        assert letters(weapon['name']) in letters(pages[str(page)]), (unit,number,'official source locator')
    literal_clauses = [
        (17,'datasheet-archaeopter-fusilave:section:1',0,'excluding Lone Operative units'),
        (17,'datasheet-archaeopter-transvector:section:1',0,'In your first Movement phase, this unit can make an ingress move.'),
        (18,'datasheet-cybernetica-datasmith:section:1',1,'This unit loses VEHICLE.'),
        (18,'datasheet-belisarius-cawl:section:1',0,'Until the start of your next Command phase, this model has that ability.'),
        (18,'datasheet-belisarius-cawl:section:4',0,'you can re-roll the Hit roll.'),
        (18,'datasheet-belisarius-cawl:section:4',1,'This model has the BATTLELINE keyword'),
        (18,'datasheet-belisarius-cawl:section:4',2,'that unit has the Stealth ability.'),
        (18,'datasheet-kastelan-robots:section:1',1,'after that enemy unit has shot'),
        (18,'datasheet-onager-dunecrawler:section:1',1,'4" or less in height'),
        (18,'datasheet-serberys-raiders:section:1',0,'wholly within 6"'),
        (19,'datasheet-skitarii-marshal:section:1',1,'That unit is no longer Battle-shocked.'),
    ]
    for page, identity, block, text in literal_clauses:
        assert text in data(identity)['blocks'][block]['text'], (identity,'official source clause')
        assert letters(text) in letters(pages[str(page)]), (identity,'official source clause evidence')
    assert '8"' in data('detachment-haloscreed-battle-clade:stratagem:6')['lines'][1]['text'], 'Official p8 Analytical Divination target'
    assert letters('Analytical Divination') in letters(pages['8'])


def verify(base, effective):
    corpus = read(SOURCE/'corpus.json')
    enrollment = read(HERE/'sources/enrollment.json')
    records = base['entities']
    ids = [r['id'] for r in records]
    assert len(ids) == len(set(ids)), 'duplicate semantic owner'
    index = {r['id']: r for r in records}
    fact_addresses = {}
    leaf_rows = base['sourceLeafAccounting']
    equal_leaf_paths = [row['sourcePointer'] for row in leaf_rows]
    assert len(equal_leaf_paths) == len(set(equal_leaf_paths)), 'duplicate source leaf disposition'
    assert set(equal_leaf_paths) == set(capture_leaves(corpus)), 'unclassified capture leaves'
    allowed_dispositions = {'SOURCE_METADATA','CANONICAL_FACT','CAPTURE_OCCURRENCE_REFERENCE','MFM_OWNED','REFERENCE_METADATA'}
    assert all(row['classification'] in allowed_dispositions for row in leaf_rows)
    assert all(row.get('entityId') in index for row in leaf_rows if row['classification'] in ('CANONICAL_FACT','CAPTURE_OCCURRENCE_REFERENCE'))

    def equal(actual, expected, label, count=False):
        assert actual == expected, label
        if count:
            assert label not in fact_addresses, 'source fact counted twice: '+label
            fact_addresses[label] = scalars(expected)

    def source_fields(actual, source, excluded, label):
        expected = {k: v for k, v in source.items() if k not in excluded}
        for key, value in expected.items():
            equal(actual[key], value, label+'/'+key, count=True)

    for artifact in enrollment['artifacts']:
        raw = (ROOT/artifact['path']).read_bytes()
        assert digest(raw) == artifact['sha256'], artifact['path']+': source bytes'
        if artifact.get('capturedSha256'):
            assert digest(raw.decode('utf8').replace('\r\n', '\n').replace('\n', '\r\n').encode()) == artifact['capturedSha256'], 'historical capture correspondence'
    for record in records:
        evidence = record['provenance']
        assert (ROOT/evidence['sourcePath']).exists(), record['id']+': provenance'
        if evidence.get('pointer') is not None:
            node = corpus
            for part in evidence['pointer'].strip('/').split('/'):
                node = node[int(part)] if isinstance(node, list) else node[part]
            assert node is not None
        elif evidence.get('xpath'):
            raw = (ROOT/evidence['sourcePath']).read_bytes()
            assert digest(raw) == evidence['sha256']
            assert len(html.fromstring(raw.decode('utf8')).xpath(evidence['xpath'])) == 1
        else:
            assert evidence.get('page'), record['id']+': unbound source record'
        if 'parentId' in record:
            assert record['parentId'] in index

    expected_ids = set()
    expected_record_ids = {'book-introduction'}
    registered_profiles = read(HERE/'profile-bindings.json')
    raw_profiles, raw_weapon_rows, raw_bases, raw_invulns = 0, 0, 0, 0
    attachment_sections, ability_blocks = 0, 0
    source_units = {urlparse(u['url']).path.rstrip('/'): u['sourceId'].replace('datasheet-','unit-',1) for u in corpus['datasheets']}
    for unit in corpus['datasheets']:
        uid = unit['sourceId'].replace('datasheet-', 'unit-', 1)
        expected_ids.add(uid)
        expected_record_ids.add(uid)
        expected_record_ids.add(unit['sourceId']+':keyword-scopes')
        for field in ('weapons','wargearOptions','sections','ruleReferences'):
            expected_record_ids.update(child['sourceId'] for child in unit[field])
        data = index[uid]['data']
        source_fields(data, unit, {'sourceId', 'statline', 'weapons', 'sections', 'wargearOptions', 'ruleReferences', 'keywords', 'factionKeywords', 'normalizedContentFingerprint'}, uid)
        page = next(p for p in corpus['pages'] if p['url'] == unit['url'])
        doc = html.fromstring((SOURCE/page['file']).read_text('utf8'))
        frame, = doc.xpath('//div['+has('dsOuterFrame')+']')
        wraps = frame[0].xpath('.//div['+has('dsProfileBaseWrap')+']')
        equal(len(data['profileIds']), len(wraps), uid+': mixed profile count')
        equal(data['profileIds'], [p['id'] for p in registered_profiles[uid]], uid+': registered canonical profile identities')
        for pid, wrap in zip(data['profileIds'], wraps):
            expected_record_ids.add(pid)
            profile = index[pid]['data']
            labels = wrap.xpath('.//span['+has('dsModelName')+']')
            equal(profile['name'], norm(labels[0].text_content()) if labels else unit['title'], pid+': model profile label', count=True)
            values = [norm(n.text_content()) for n in wrap.xpath('.//div['+has('dsCharValue')+']')]
            equal(list(profile['stats'].keys()), ['M', 'T', 'SV', 'W', 'LD', 'OC'], pid+': characteristic identity')
            equal(list(profile['stats'].values()), values, pid+': every raw characteristic', count=True)
            raw_profiles += 1
            bases = wrap.xpath('.//span[starts-with(@class,"dsModelBase")]')
            if not bases and len(wraps) == 1:
                bases = frame[0].xpath('.//span[starts-with(@class,"dsModelBase")]')
                bases = [n for n in bases if not any(a in bases for a in n.iterancestors())]
            if bases:
                expected_record_ids.add(pid+':base')
                base_values = {'text':norm(''.join(bases[0].xpath('./text()'))), 'notes':[norm(n.text_content()) for n in bases[0].xpath('.//span['+has('dsBaseSizeComment')+']')]}
                equal(index[pid+':base']['data'], base_values, pid+': exact Base and scoped qualifiers', count=True)
                raw_bases += 1
            inv = frame[0].xpath('.//div['+has('dsCharInvulValue')+']')
            if inv:
                equal(index[profile['invulnerableSaveId']]['data']['value'], norm(inv[0].text_content()), pid+': invulnerable save')
            else:
                assert 'invulnerableSaveId' not in profile, pid+': invented invulnerable save'
        raw_invulns += len(inv)
        if inv:
            expected_record_ids.add(unit['sourceId']+':invulnerable-save')
            equal(index[unit['sourceId']+':invulnerable-save']['data']['value'], norm(inv[0].text_content()), uid+': shared invulnerable owner', count=True)
        scope = index[data['keywordScopesId']]['data']['scopes']
        equal([k for s in scope if s['id'].endswith(':faction') for k in s['keywords']], unit['factionKeywords'], uid+': faction keywords')
        equal([k for s in scope if s['id'].endswith(':all-models') for k in s['keywords']], [k for k in unit['keywords'] if ':' not in k], uid+': intrinsic shared keywords')
        for s in scope:
            equal('; '.join(s['keywords']), norm(doc.xpath(s['xpath'])[0].text_content()), s['id']+': scoped source keyword string')
            equal(s['keywords'], [norm(v) for v in doc.xpath(s['xpath'])[0].text_content().split(';')], s['id']+': keywords', count=True)
        scope_ids = {s['id'] for s in scope}
        for pid in data['profileIds']:
            assert set(index[pid]['data']['keywordScopeIds']) <= scope_ids, pid+': unresolved keyword scope'
        combat = next(n for n in frame if n.get('class') == 'ds2col')
        rows = combat.xpath('.//tr['+has('dsWeaponRow')+']')
        equal(len(rows), len(unit['weapons']), uid+': raw weapon rows')
        for row, weapon in zip(rows, unit['weapons']):
            actual = index[weapon['sourceId']]['data']
            source_fields(actual, weapon, {'sourceId'}, weapon['sourceId'])
            values = [norm(td.text_content()) for td in row.xpath('./td')][-6:]
            equal([actual[k] for k in ('range', 'attacks', 'skill', 'strength', 'ap', 'damage')], values, weapon['sourceId']+': raw weapon values')
            raw_weapon_rows += 1
        for option in unit['wargearOptions']:
            source_fields(index[option['sourceId']]['data'], option, {'sourceId'}, option['sourceId'])
        reference_tables = frame.xpath('.//table['+has('dsCoreArmy')+']')
        equal(len(reference_tables), len(unit['ruleReferences']), uid+': all Core/Army reference tables')
        for reference, table in zip(unit['ruleReferences'], reference_tables):
            actual = index[reference['sourceId']]['data']
            expected_groups = []
            for row in table.xpath('.//tr'):
                title, value = row.xpath('./td')
                items = value.xpath('.//*[@data-tooltip-content]')
                expected_groups.append((norm(title.text_content()), [(norm(item.text_content()),[item.get('data-tooltip-content')]) for item in items]))
                equal(compact(''.join(n.text_content() for n in items)), compact(value.text_content()).replace(',', ''), reference['sourceId']+': no discarded Core ability parameters')
            equal([(g['label'],[(e['label'],e['sourceTooltipIds'])for e in g['entries']])for g in actual['groups']], expected_groups, reference['sourceId']+': individual source references', count=True)
            assert 'label' not in actual, 'concatenated reference bucket is not a gameplay owner'
        represented = '\n'.join(o['text'] for o in unit['wargearOptions'])
        for section in unit['sections']:
            section_data = index[section['sourceId']]['data']
            expected = [block for block in section['blocks'] if not re.match(r'^YOUR\b.*COST', block['text'], re.I)]
            equal(section_data['blocks'], expected, section['sourceId']+': all source blocks', count=True)
            equal(section_data['title'], section['title'], section['sourceId']+': section identity', count=True)
            represented += '\n'+'\n'.join(b['text'] for b in expected)
            if section['title'] == 'ABILITIES':
                ability_blocks += len(expected)
            if section['title'] in ('LEADER', 'SUPPORT', 'ATTACHED UNIT'):
                attachment_sections += 1
                expected_record_ids.add(section['sourceId']+':attachment-declaration')
                declaration = index[section['sourceId']+':attachment-declaration']
                equal(declaration['data']['sourceSectionId'], section['sourceId'], section['sourceId']+': declaration owner')
                equal(declaration['data']['roleHeading'], section['title'], section['sourceId']+': Leader/Support distinction')
                raw_declaration, = doc.xpath(declaration['provenance']['xpath'])
                equal([r['sourceHref'] for r in declaration['data']['references']], raw_declaration.xpath('.//a/@href'), section['sourceId']+': exact relation references', count=True)
                for reference in declaration['data']['references']:
                    path = urlparse(reference['sourceHref']).path.rstrip('/')
                    if path in source_units:
                        equal(reference['targetId'], source_units[path], section['sourceId']+': canonical target')
                    elif '/the-rules/' in path:
                        equal(reference['externalDomain'], 'CORE', section['sourceId']+': external Core reference')
                    else:
                        equal(reference['excludedScope'], 'LEGENDS', section['sourceId']+': excluded target')
        for node in combat.xpath('.//div['+has('dsAbility')+' or '+has('dsOptionsComment')+']'):
            text = node.text_content()
            if re.match(r'^YOUR\b.*COST', norm(text), re.I):
                continue
            assert compact(text) in compact(represented), uid+': unaccounted raw datasheet gameplay text'
        selection = index.get(unit['sourceId']+':weapon-profile-selection')
        marked = [w['sourceId'] for w, row in zip(unit['weapons'], rows) if row.xpath('.//*[@data-tooltip-content="#tooltip_contenttooltipPointy"]')]
        if marked:
            expected_record_ids.add(unit['sourceId']+':weapon-profile-selection')
            equal(sorted(w for g in selection['data']['groups'] for w in g['weaponProfileIds']), sorted(marked), uid+': profile selection scope')
            source_note, = doc.xpath('//*[@id="tooltip_contenttooltipPointy"]')
            equal(compact(selection['data']['text']), compact(source_note.text_content()), uid+': selection instruction', count=True)
            for group in selection['data']['groups']:
                names = [index[w]['data']['name'] for w in group['weaponProfileIds']]
                equal(names, group['sourceProfileLabels'], uid+': group source binding')
                # Independent source name families corroborate the declared scope;
                # this QA comparison does not feed runtime identity or answers.
                assert len({n.split(' – ')[0] for n in names}) == 1, uid+': distinct weapons merged'
        else:
            assert selection is None
    equal({r['id'] for r in records if r['kind']=='DATASHEET'}, expected_ids, 'complete non-Legends datasheet domain')
    hub = html.fromstring((SOURCE/'adeptus-mechanicus.html').read_text('utf8'))
    for rule in corpus['armyRules']:
        expected_record_ids.add(rule['sourceId'])
        source_fields(index[rule['sourceId']]['data'], rule, {'sourceId','components','normalizedContentFingerprint'}, rule['sourceId'])
        for component in rule['components']:
            expected_record_ids.add(component['sourceId'])
            equal(index[component['sourceId']]['data']['title'], component['title'], component['sourceId']+': title', count=True)
            actual = index[component['sourceId']]['data']['text']
            if component['text']:
                equal(actual, component['text'], component['sourceId'], count=True)
            else:
                paragraph, = hub.xpath('//*[@id="Doctrina-Imperatives"]/../p['+has('ShowFluff')+']')
                equal(actual, norm(paragraph.tail), 'Doctrina activation/lifetime', count=True)
    for det in corpus['detachments']:
        expected_record_ids.update((det['sourceId'],det['rule']['sourceId']))
        container, = hub.xpath('//div[@class="clFl" and @data-f="'+det['filterId']+'"]')
        raw_enhancements = container.xpath('.//ul['+has('EnhancementsPts')+']')
        raw_stratagems = container.xpath('.//div['+has('str11Wrap')+']')
        equal(len(raw_enhancements), len(det['enhancements']), det['sourceId']+': raw Enhancement denominator')
        equal(len(raw_stratagems), len(det['stratagems']), det['sourceId']+': raw Stratagem denominator')
        equal(index[det['sourceId']]['data']['title'], det['title'], det['sourceId'], count=True)
        data = index[det['rule']['sourceId']]['data']
        source_fields(index[det['sourceId']]['data'], det, {'sourceId','rule','enhancements','stratagems','normalizedContentFingerprint','detachmentPoints','forceDisposition','title'}, det['sourceId'])
        equal(data['title'], det['rule']['title'], det['sourceId']+': rule title', count=True)
        semantic = [table for table in det['rule']['tables'] if all(len(row)>1 for row in table['rows'])]
        equal(data['tables'], semantic, det['sourceId']+': one semantic table owner', count=True)
        expected_text = det['rule']['text']
        for table in det['rule']['tables']:
            if table not in semantic:
                expected_text = expected_text.replace(table['rows'][0][0], '').strip()
        equal(data['text'], expected_text, det['sourceId']+': rule text without duplicate table', count=True)
        for enhancement, raw_enhancement in zip(det['enhancements'], raw_enhancements):
            expected_record_ids.add(enhancement['sourceId'])
            actual = index[enhancement['sourceId']]['data']
            source_fields(actual, enhancement, {'sourceId','wahaPoints','weaponProfiles','text'}, enhancement['sourceId'])
            if enhancement['text']:
                equal(actual['text'], enhancement['text'], enhancement['sourceId']+': qualifier/body', count=True)
            else:
                equal(actual['text'], 'TECH-PRIEST model only. This model has the following weapon:', 'raw TL-4Ø9 qualifier', count=True)
            raw_card = copy.deepcopy(raw_enhancement.getparent())
            for item in list(raw_card.iterdescendants()):
                if set((item.get('class') or '').split()) & {'ShowFluff','EnhancementsPts','itc','faqErrataStrat'}:
                    item.drop_tree()
            equal(compact(actual['text']), compact(raw_card.text_content()), enhancement['sourceId']+': complete raw Enhancement qualifier/body')
            raw_title = copy.deepcopy(raw_enhancement.xpath('./li/span')[0])
            type_labels = raw_title.xpath('.//span['+has('EnhUpgrade')+']')
            if type_labels:
                equal(actual['sourceTypeLabel'], norm(type_labels[0].text_content()), enhancement['sourceId']+': Upgrade source label', count=True)
                type_labels[0].drop_tree()
            else:
                assert 'sourceTypeLabel' not in actual, 'Invented Upgrade classification'
            equal(actual['title'], norm(raw_title.text_content()), enhancement['sourceId']+': exact raw Enhancement name')
            for weapon in enhancement['weaponProfiles']:
                expected_record_ids.add(weapon['sourceId'])
                source_fields(index[weapon['sourceId']]['data'], weapon, {'sourceId'}, weapon['sourceId'])
        for stratagem, raw_stratagem in zip(det['stratagems'], raw_stratagems):
            expected_record_ids.add(stratagem['sourceId'])
            actual = index[stratagem['sourceId']]['data']
            source_fields(actual, stratagem, {'sourceId'}, stratagem['sourceId'])
            equal(actual['title'], norm(raw_stratagem.xpath('.//div['+has('str11Name')+']')[0].text_content()), stratagem['sourceId']+': raw title')
            equal(actual['cp'], norm(raw_stratagem.xpath('.//div['+has('str11CP')+']')[0].text_content()), stratagem['sourceId']+': raw CP')
            body, = raw_stratagem.xpath('.//div['+has('str11Text')+']')
            source_text = ''.join(line['label']+':'+line['text'] for line in actual['lines'])
            # The structured capture inserts literal list markers for HTML li
            # nodes. Ignore only those formatting markers, never minus values.
            source_text = re.sub(r'(?<=\s)[-•]\s+(?=[A-Za-z])', '', source_text)
            equal(compact(source_text), compact(body.text_content()), stratagem['sourceId']+': complete raw Stratagem body')
    for erratum in corpus['errata']:
        expected_record_ids.add(erratum['sourceId'])
        source_fields(index[erratum['sourceId']]['data'], erratum, {'sourceId'}, erratum['sourceId'])
    refs = [row['value'] for row in base['sourceAccounting'] if row['classification']=='REFERENCE_METADATA']
    expected_record_ids.add('faq-2')
    source_fields(index['faq-2']['data'], {
        'class': 'FAQ',
        'title': 'When I select one of Thulia Ghuld’s Icon of War abilities, when do I select the unit that ability affects?',
        'text': 'When you have selected the Icon of War ability you want to use.'
    }, set(), 'Official v1.4 Thulia FAQ')
    expected_record_ids.update(row['id'] for row in read(HERE/'update-bindings.json'))
    equal(set(ids), expected_record_ids, 'complete source-derived canonical identity domain/no extra semantic owners')
    equal(refs, corpus['references'], 'complete source reference metadata', count=True)
    assert 'Crusade' not in index['book-introduction']['data']['text']
    assert len([row for row in base['sourceAccounting'] if row['classification']=='EXCLUDED_SCOPE']) == 2
    intro, = hub.xpath('//*[@id="Introduction"]/following-sibling::div[1]')
    for node in intro.xpath('./div|./p|./ul/li'):
        text = norm(node.text_content())
        if text and 'Crusade battle' not in text:
            assert compact(text) in compact(index['book-introduction']['data']['text']), 'unaccounted Introduction instruction'
    fact_addresses['book-introduction: source-backed instructions'] = 1
    assert 'SUPPORT' in str(base) and 'mandatoryParticipant' not in str(base), 'Legacy attachment contracts excluded'
    # The official current pack owns update/FAQ evidence. Compare directly with
    # PDF extraction and source bindings; no legacy rule/effect adapter is loaded.
    with pdfplumber.open(HERE/'sources/gw-adeptus-mechanicus-faction-pack-v1.3.pdf') as pdf:
        pages = read(HERE/'sources/gw-faction-pack-v1.3.pages.json')
        for page in range(1,20):
            equal(pages[str(page)], pdf.pages[page-1].extract_text(), 'official PDF page '+str(page))
        assert 'VERSION 1.3' in pages['1'] and '30th September 2026' in pages['1']
        # The official profile heading has two coincident glyph layers; retain
        # the exact extraction rather than silently rewriting source text.
        assert 'GGUUNN SSEERRVVIITTOORRSS' in pages['15'] and 'Underseer' in pages['16']
        for reference in (r for r in records if r['kind']=='SOURCE_UPDATE_REFERENCE'):
            data = reference['data']
            assert data['page'] == reference['provenance']['page']
            assert all(target in index for target in data['targetIds'])
            if data.get('sourceOccurrenceId'):
                letters = lambda text: re.sub(r'[^a-z0-9]', '', text.lower())
                for target in data['targetIds']:
                    title = index[target]['data']['title']
                    assert letters(title) in letters(pages[str(data['page'])]), reference['id']+': wrong official source page'
        official_update_parity(index, pages)
    # Historical v1.3 evidence remains frozen. The current official source has
    # three precisely bounded field changes and one additional FAQ.
    with pdfplumber.open(HERE/'sources/gw-adeptus-mechanicus-faction-pack-v1.4.pdf') as pdf:
        pages = read(HERE/'sources/gw-faction-pack-v1.4.pages.json')
        for page in range(1, 20):
            equal(pages[str(page)], pdf.pages[page-1].extract_text(), 'official v1.4 PDF page '+str(page))
        assert 'VERSION 1.4' in pages['1'] and '14th October 2026' in pages['1']
        letters = lambda text: re.sub(r'[^a-z0-9]', '', text.lower())
        faq_page = pdf.pages[18]
        faq_column = faq_page.crop((faq_page.width/2, 0, faq_page.width, faq_page.height)).extract_text()
        for text in index['faq-2']['data'].values():
            if text != 'FAQ':
                assert letters(text) in letters(faq_column), 'Official Thulia FAQ evidence'
        assert index['faq-2']['provenance']['sourceId'] == 'gw-am-faction-pack-v1.4'
        assert index['faq-2']['provenance']['page'] == 19
    # Effective changes are exclusively the editorial ledger and these exact
    # independently transcribed current official fields.
    expected_effective = copy.deepcopy(base['entities'])
    modified = {r['id']: r for r in expected_effective}
    operations = read(HERE/'source-adjudications.json')
    for op in operations:
        target = modified[op['targetId']]['data']
        for key in op['field'][:-1]:
            target = target[key]
        assert target[op['field'][-1]] == op['before']
        target[op['field'][-1]] = op['after']
    current_fields = [
        ('detachment-luminen-auto-choir:stratagem:2', 0,
         'Your Movement phase, when a friendly ELECTRO-PRIESTS unit is selected to make an advance move.'),
        ('detachment-haloscreed-battle-clade:stratagem:5', 0,
         'Your Movement phase, when a friendly ADEPTUS MECHANICUS unit is selected to make a fall-back move.'),
        ('detachment-haloscreed-battle-clade:stratagem:5', 2,
         '• If your unit is a HALO OVERRIDE unit, your unit can re-roll hazard rolls.\n'
         '• That fall-back move does not prevent your unit from:\n'
         '  • Being eligible to shoot.\n  • Being eligible to declare a charge.')
    ]
    for identity, line, text in current_fields:
        modified[identity]['data']['lines'][line]['text'] = text
    assert len(effective['appliedOfficialUpdates']) == len(current_fields)
    equal([(r['id'],r['kind'],r.get('parentId'),r['data']) for r in effective['entities']], [(r['id'],r['kind'],r.get('parentId'),r['data']) for r in expected_effective], 'effective factual parity/no unrelated delta')
    servitor = index['unit-servitor-battleclade']['data']['profileIds']
    equal([index[p]['data']['stats']['W'] for p in servitor], ['2','1'], 'Servitor W isolation')
    equal([index[p]['data']['stats']['LD'] for p in servitor], ['7+','8+'], 'Servitor Ld isolation')
    assert any(s.endswith(':underseer') for s in index[servitor[0]]['data']['keywordScopeIds'])
    assert not any(s.endswith(':underseer') for s in index[servitor[1]]['data']['keywordScopeIds']), 'Underseer keyword leakage'
    facts = sum(fact_addresses.values())
    return {'sourceFactsTotal': facts, 'sourceFactsBound': facts, 'sourceFactsMissing':0, 'duplicateSemanticOwners':0, 'unclassifiedSourceFacts':0, 'captureLeavesAccounted':len(leaf_rows), 'leafDispositions':dict(Counter(row['classification'] for row in leaf_rows)), 'modelProfiles':raw_profiles, 'weaponProfiles':raw_weapon_rows+sum(len(e['weaponProfiles'])for d in corpus['detachments']for e in d['enhancements']), 'modelBases':raw_bases, 'invulnerableSaveOwners':raw_invulns, 'datasheetAbilityBlocks':ability_blocks, 'attachmentDeclarations':attachment_sections, 'factPartitions':fact_addresses, 'kinds':dict(Counter(r['kind'] for r in records))}


def main():
    base = read(HERE/'generated/base.json')
    effective = read(HERE/'generated/effective.json')
    result = verify(base, effective)
    mutations = [
        lambda m: m['entities'].pop(next(i for i,r in enumerate(m['entities']) if r['kind']=='DATASHEET')),
        lambda m: m['entities'].append(copy.deepcopy(m['entities'][0])),
        lambda m: next(r for r in m['entities'] if r['kind']=='PROFILE')['data']['stats'].update(W='999'),
        lambda m: next(r for r in m['entities'] if r['kind']=='WEAPON_PROFILE')['data'].update(strength='999'),
        lambda m: next(r for r in m['entities'] if r['kind']=='INVULNERABLE_SAVE')['data'].update(value='2+'),
        lambda m: next(r for r in m['entities'] if r['kind']=='MODEL_BASE')['data'].update(text='wrong'),
        lambda m: next(r for r in m['entities'] if r['kind']=='STRATAGEM')['data'].update(cp='99CP'),
        lambda m: next(r for r in m['entities'] if r['id']=='detachment-lords-of-the-forge:enhancement:2')['data'].update(text=''),
        lambda m: next(r for r in m['entities'] if r['kind']=='WARGEAR_OPTION')['data'].update(text=''),
        lambda m: next(r for r in m['entities'] if r['id']=='datasheet-servitor-battleclade:profile:combat-and-gun-servitors')['data']['keywordScopeIds'].append('datasheet-servitor-battleclade:keyword-scope:underseer'),
        lambda m: next(r for r in m['entities'] if r['id']=='datasheet-thulia-ghuld:weapon-profile-selection')['data']['groups'].pop(),
        lambda m: next(r for r in m['entities'] if r['kind']=='STRATAGEM')['provenance'].update(pointer='/missing'),
        lambda m: next(r for r in m['entities'] if r['kind']=='DATASHEET_SECTION')['data']['blocks'].clear(),
        lambda m: m['sourceLeafAccounting'].pop(),
        lambda m: next(r for r in m['entities'] if r['kind']=='RULE_REFERENCE')['data']['groups'][0]['entries'].pop(),
        lambda m: next(r for r in m['entities'] if r['id']=='datasheet-cybernetica-datasmith:section:3:attachment-declaration')['data']['references'][0].update(targetId='unit-belisarius-cawl'),
        lambda m: next(r for r in m['entities'] if r['id']=='official-update-reference:errata-7')['data'].update(page=7),
        lambda m: m['entities'].append({**copy.deepcopy(m['entities'][0]),'id':'extra-duplicate-owner'}),
        lambda m: next(r for r in m['entities'] if r['id']=='detachment-cohort-acquisitus:enhancement:2')['data'].pop('sourceTypeLabel'),
    ]
    for mutate in mutations:
        poisoned = copy.deepcopy(base)
        mutate(poisoned)
        # Poison both projections. A fixed effective snapshot must not be the
        # oracle that detects a missing/wrong base fact.
        poisoned_effective = copy.deepcopy(effective)
        poisoned_effective['entities'] = copy.deepcopy(poisoned['entities'])
        poisoned_effective['sourceLeafAccounting'] = copy.deepcopy(poisoned['sourceLeafAccounting'])
        poisoned_index = {r['id']:r for r in poisoned_effective['entities']}
        for op in read(HERE/'source-adjudications.json'):
            if op['targetId'] not in poisoned_index:
                continue
            field = poisoned_index[op['targetId']]['data']
            for key in op['field'][:-1]:
                field = field[key]
            field[op['field'][-1]] = op['after']
        for op in read(HERE/'sources/official-v1.4-updates.json')['operations']:
            if op['targetId'] not in poisoned_index:
                continue
            field = poisoned_index[op['targetId']]['data']
            for key in op['field'][:-1]:
                field = field[key]
            field[op['field'][-1]] = op['after']
        try:
            verify(poisoned, poisoned_effective)
        except (AssertionError, KeyError, IndexError):
            continue
        raise AssertionError('Undetected factual mutation')
    result['mutationsDetected'] = len(mutations)
    text = json.dumps(result, indent=2, sort_keys=True)+'\n'
    if '--write-census' in sys.argv:
        (HERE/'generated/factual-census.json').write_text(text,encoding='utf8',newline='\n')
    print(text)


if __name__ == '__main__':
    main()

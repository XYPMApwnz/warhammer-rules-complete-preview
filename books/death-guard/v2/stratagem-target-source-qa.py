"""Independent accepted-DOM/PDF census of DG Stratagem target prerequisites.

This program does not import Rule Contracts, producer declarations, generated
compatibility rows, or a condition inventory. Existing source locators supply
identity addresses only. Expected conditions are derived afresh from the raw
TARGET text and the antecedent of a demonstrative TARGET in WHEN.
"""
import argparse
import hashlib
import json
import re
from pathlib import Path

from lxml import html
import pdfplumber

ROOT = Path(__file__).resolve().parents[3]
HERE = Path(__file__).resolve().parent
HUB = HERE / 'sources/accepted-waha-pages/death-guard.html'
# Publisher scope addresses for the accepted nine matched-play detachments.
# Boarding Actions, Crusade and tooltip repetitions are separate source scopes.
SCOPE_ADDRESSES = {'DG:1001', 'DG:41', 'DG:5', 'DG:201', 'DG:101',
                   'DG:11', 'DG:9', 'DG:21', 'DG:81'}


def normalize(value):
    return re.sub(r'\s+', ' ', value).strip()


def typography(value):
    # PDF typographic differences are not changes to gameplay wording.
    return re.sub(r'[^a-z0-9]+', '', value.lower())


def flow(node):
    result = node.text or ''
    for child in node:
        result += '\n' if child.tag == 'br' else flow(child)
        result += child.tail or ''
    return result


def clauses(node):
    value = flow(node)
    labels = list(re.finditer(r'\b(WHEN|TARGET|EFFECT|RESTRICTIONS?):', value))
    assert len({label[1] for label in labels}) == len(labels), 'Repeated clause label'
    return {match[1]: normalize(value[match.end():labels[index + 1].start()
                                     if index + 1 < len(labels) else len(value)])
            for index, match in enumerate(labels)}


def expected(target, when):
    """Independent finite source grammar; unsupported residual text fails closed."""
    atoms = []
    selector_text = target.split(' that ', 1)[0]
    subject = ('MODEL' if re.search(r'\bmodel\b|\bWARLORD\b', selector_text)
               else 'FORMED_ATTACHED_UNIT' if 'Attached unit' in selector_text
               else 'UNIT')
    primary, *secondary = re.split(r', and one friendly ', target, maxsplit=1)
    remainder = primary

    def add(predicate, level, arguments, quote, role='primary', proof_label='TARGET',
            atom_subject=None):
        atoms.append({'roleId': role, 'subject': atom_subject or subject,
                      'predicate': predicate, 'contextLevel': level,
                      'arguments': arguments, 'sourceLabel': proof_label,
                      'quote': quote})

    def consume(pattern, key, value=True, level='BATTLE'):
        nonlocal remainder
        match = re.search(pattern, remainder)
        if match:
            add('FIELD', level, {'key': key, 'equals': value}, match[0])
            remainder = remainder[:match.start()] + remainder[match.end():]

    if re.search(r'\bWARLORD\b', primary):
        add('FIELD', 'ROSTER', {'key': 'isWarlord', 'equals': True}, 'WARLORD')
    if 'Attached unit' in selector_text:
        add('FIELD', 'ROSTER', {'key': 'attached', 'equals': True}, 'Attached unit')
    match = re.search(r'with the (.+?) ability', remainder)
    if match:
        add('MODEL_ABILITY', 'STATIC', {'ability': match[1]}, match[0])
        remainder = remainder[:match.start()] + remainder[match.end():]
    match = re.search(r'that includes (two) CHARACTER models', remainder)
    if match:
        add('CHARACTER_MODEL_COUNT', 'ROSTER', {'min': 2}, match[0])
        remainder = remainder[:match.start()] + remainder[match.end():]
    match = re.search(r'that is not leading a unit', remainder)
    if match:
        add('LEADING', 'ROSTER', {'value': False}, match[0])
        remainder = remainder[:match.start()] + remainder[match.end():]
    consume(r'that is not within Engagement Range of one or more enemy units', 'withinEnemyEngagementRange', False)
    consume(r'that is within Engagement Range of one or more enemy units', 'engaged')
    consume(r'that is within Engagement Range of that enemy unit',
            'withinEngagementRangeOfTriggeringEnemy')
    consume(r'\bunengaged\b', 'engaged', False)
    consume(r'\bengaged\b', 'engaged')
    consume(r'that was just destroyed', 'justDestroyed')
    consume(r'that was selected as the target of one or more of the attacking unit[’\']s attacks',
            'selectedAsEnemyAttackTarget')
    consume(r'that is on the battlefield', 'onBattlefield')
    consume(r'that has lost one or more wounds', 'hasLostWounds')
    consume(r'(?:that has not|has not) been selected to shoot or fight this phase',
            'selectedToShootOrFightThisPhase', False)
    consume(r'(?:that has not|has not) been selected to move or charge this phase',
            'selectedToMoveOrChargeThisPhase', False)
    consume(r'(?:that has not|has not) been selected to shoot this phase',
            'selectedToShootThisPhase', False)
    consume(r'(?:that has not|has not) been selected to fight this phase',
            'selectedToFightThisPhase', False)
    consume(r'that is in Strategic Reserves', 'inStrategicReserves')
    consume(r'that is not an Attached unit', 'attached', False, 'ROSTER')

    # Demonstrative TARGET selects the exact event actor described by WHEN.
    antecedents = []
    if primary.startswith('That '):
        add('FIELD', 'BATTLE', {'key': 'isTriggerUnit', 'equals': True}, primary)
        antecedents.append({'sourceLabel': 'WHEN', 'quote': when,
                            'binding': 'EXACT_EVENT_ACTOR', 'roleId': 'primary'})
        # This condition is in WHEN but determines WHICH friendly target is
        # the actor denoted by That, not merely the phase's availability.
        match = re.search(r'if that enemy unit is engaged with a friendly ([A-Z ]+) unit', when)
        if match:
            add('FIELD', 'BATTLE', {'key': 'withinEngagementRangeOfTriggeringEnemy',
                                  'equals': True}, match[0], proof_label='WHEN')

    if secondary:
        shield = 'one friendly ' + secondary[0]
        match = re.search(r'within 3" of your unit', shield)
        assert match, ('Unresolved secondary-target distance', shield)
        add('FIELD', 'BATTLE', {'key': 'within3OfPrimary', 'equals': True},
            match[0], role='shield-unit', atom_subject='UNIT')
        match = re.search(r'visible to both your unit and the attacking unit', shield)
        assert match, ('Unresolved secondary-target visibility', shield)
        for key in ['visibleToPrimary', 'visibleToAttackingUnit']:
            add('FIELD', 'BATTLE', {'key': key, 'equals': True}, match[0],
                role='shield-unit', atom_subject='UNIT')
        residue = re.sub(r'within 3" of your unit and visible to both your unit and the attacking unit', '', shield)
        assert re.fullmatch(r'one friendly [A-Z ]+ unit\.', re.sub(r'\s+\.', '.', normalize(residue))), residue

    # Destroyed-unit permission reiterates its eligibility; it is not a new
    # or contradictory live/not-destroyed prerequisite.
    remainder = re.sub(r'You can (?:use this Stratagem on that model|target that unit with this Stratagem) even though it was just destroyed\.', '', remainder)
    remainder = normalize(remainder)
    remainder = re.sub(r'\b(?:and|that is)\b', '', remainder)
    remainder = normalize(remainder)
    # Only source-owned allegiance/keyword/subject selector text may remain.
    # Any unrecognised state, modifier or conditional wording fails here.
    remainder = re.sub(r'\s+\.', '.', remainder)
    base = r'(?:One|Your|That) (?:friendly )?[A-Z ]+(?:or [A-Z ]+)?(?:Attached )?(?:unit|model)?(?: (?:from )?your army)?\.?'
    assert re.fullmatch(base, remainder), ('Unclassified TARGET residue', target, remainder)
    return subject, atoms, antecedents


def census():
    raw = HUB.read_bytes()
    doc = html.fromstring(raw.decode('utf8'))
    tree = doc.getroottree()
    # Deliberately use only source identity locators, never existing declared
    # conditions/sourceClauses/coverage counts from this older QA artifact.
    locator_rows = json.loads((HERE / 'rule-contract-source-evidence.json').read_text('utf8'))['stratagems']
    identities = {row['sourceProof']['rawLocator']: row['sourceId'] for row in locator_rows}
    assert len(identities) == len(locator_rows)
    nodes = []
    for scope in doc.xpath('//div[@id="wahMainContent"]/div[@data-f]'):
        if scope.get('data-f') in SCOPE_ADDRESSES:
            nodes.extend(scope.xpath('.//div[@class="str11Text"][b[normalize-space(.)="TARGET:"]]'))
    assert set(tree.getpath(node) for node in nodes) == set(identities), 'Source card identity coverage differs'
    enrollment = json.loads((HERE / 'sources/source-enrollment.json').read_text('utf8'))
    raw_captures = {capture['path']: capture for capture in enrollment['acceptedRawCaptures']}
    hub_path = str(HUB.relative_to(ROOT)).replace('\\', '/')
    assert hashlib.sha256(raw).hexdigest().upper() == raw_captures[hub_path]['sha256'], 'Accepted hub bytes changed'
    pdf_sources = {source['path']: source for source in enrollment['sources'] if source['type'] == 'OFFICIAL_PDF'}
    pdf_pages = {}
    for path, source in pdf_sources.items():
        pdf_path = ROOT / path
        assert hashlib.sha256(pdf_path.read_bytes()).hexdigest().upper() == source['sha256']
        with pdfplumber.open(pdf_path) as pdf:
            # Current supplement pages use two columns. Whole-page extraction
            # can interleave left-column prose into a right-column WHEN clause.
            pdf_pages[path] = ['\n'.join([page.extract_text() or '',
                                         page.crop((page.width / 2, 0, page.width, page.height)).extract_text() or ''])
                               for page in pdf.pages]

    rows = []
    for node in nodes:
        location = tree.getpath(node)
        rule_id = identities[location]
        fields = clauses(node)
        assert {'WHEN', 'TARGET', 'EFFECT'} <= set(fields), rule_id
        subject, conditions, antecedents = expected(fields['TARGET'], fields['WHEN'])
        official = []
        for operation in enrollment['overlayOperations']:
            if operation.get('targetId') != rule_id:
                continue
            field = operation['field']
            if field == ['lines'] or field == ['lines', 1, 'text']:
                proof = operation['provenance']
                page = pdf_pages[proof['documentPath']][proof['page'] - 1]
                assert typography(fields['TARGET']) in typography(page), (rule_id, 'Official TARGET contradiction')
                verified_labels = ['TARGET']
                if field == ['lines']:
                    assert typography(fields['WHEN']) in typography(page), (rule_id, 'Official antecedent contradiction')
                    verified_labels.append('WHEN')
                official.append({'path': proof['documentPath'], 'page': proof['page'],
                                 'sha256': pdf_sources[proof['documentPath']]['sha256'],
                                 'verifiedLabels': verified_labels})
        rows.append({'ruleId': rule_id, 'primarySubject': subject,
                     'sourceProof': {'path': str(HUB.relative_to(ROOT)).replace('\\', '/'),
                                     'sha256': hashlib.sha256(raw).hexdigest().upper(),
                                     'rawLocator': location},
                     'sourceClauses': [{'label': key, 'text': fields[key]} for key in ['WHEN', 'TARGET']],
                     'officialProofs': official, 'expectedConditions': conditions,
                     'antecedentBindings': antecedents})

    # Independently verify the two originally reported publisher occurrences.
    addresses = json.loads((HERE / 'rule-source-addresses.json').read_text('utf8'))['bindings']
    by_id = {row['ruleId']: row for row in rows}
    for binding in addresses:
        if binding['publisherReferenceId'] not in {'tooltip_content00224', 'tooltip_content00223'}:
            continue
        source_path = ROOT / binding['proof']['sourceArtifact']
        source_doc = html.fromstring(source_path.read_text('utf8'))
        assert hashlib.sha256(source_path.read_bytes()).hexdigest().upper() == raw_captures[binding['proof']['sourceArtifact']]['sha256']
        tooltip = source_doc.xpath('//*[@id=$identity]', identity=binding['publisherReferenceId'])
        assert len(tooltip) == 1
        text = flow(tooltip[0])
        row = by_id[binding['ruleId']]
        assert normalize(row['sourceClauses'][1]['text']) in normalize(text), binding['ruleId']
        row['sourceOccurrences'] = [{'path': binding['proof']['sourceArtifact'],
                                     'publisherReferenceId': binding['publisherReferenceId'],
                                     'sha256': hashlib.sha256(source_path.read_bytes()).hexdigest().upper()}]
    totals = {'stratagemsScanned': len(rows),
              'targetConditionsTotal': sum(len(row['expectedConditions']) for row in rows),
              'primaryTargetConditions': sum(sum(a['roleId'] == 'primary' for a in row['expectedConditions']) for row in rows),
              'secondaryTargetConditions': sum(sum(a['roleId'] != 'primary' for a in row['expectedConditions']) for row in rows),
              'antecedentBindings': sum(len(row['antecedentBindings']) for row in rows),
              'battleShockTargetConditions': sum(sum(a.get('arguments', {}).get('key') == 'battleShocked' for a in row['expectedConditions']) for row in rows),
              'unresolved': 0}
    return {'schema': 'dg-stratagem-target-source-census/v1',
            'authority': 'INDEPENDENT_QA_EVIDENCE_ONLY', 'totals': totals, 'stratagems': rows}


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--write', action='store_true', help='Write the disposable independent evidence snapshot')
    parser.add_argument('--summary', action='store_true', help='Print totals only')
    args = parser.parse_args()
    result = census()
    if args.write:
        (HERE / 'stratagem-target-source-evidence.json').write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n', 'utf8')
    print(json.dumps(result['totals'] if args.summary else result, ensure_ascii=True))

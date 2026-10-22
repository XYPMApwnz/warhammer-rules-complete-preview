"""Offline RAW-backed inherited-reference and inactive MFM boundary QA.

The expected membership is selected from accepted SM ownership and independently
checked BA source links/full blocks. Neither producer discovery nor BA runtime is
an oracle. No old Army Book or old pricing is read.
"""
from __future__ import annotations
import copy, hashlib, importlib.util, json, sys
from collections import Counter
from functools import cache
from pathlib import Path
from lxml import html

sys.dont_write_bytecode = True
HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
read = lambda p: json.loads(p.read_text(encoding='utf8'))
sha = lambda p: hashlib.sha256(p.read_bytes()).hexdigest().upper()
spec = importlib.util.spec_from_file_location('ba_independent_source_qa', HERE/'foundation-qa.py')
oracle = importlib.util.module_from_spec(spec)
spec.loader.exec_module(oracle)


@cache
def tree(path):
    return html.fromstring(path.read_text(encoding='utf8'))


@cache
def captured_byte_tree(path):
    # Stage 1 membership review deliberately hashed the byte-parsed DOM. Unlike
    # read_text(), that parser retains CRLF in text nodes. Match that declared
    # evidence domain exactly; do not replace or relax its saved fingerprint.
    return html.fromstring(path.read_bytes())


def validate(inherited, mfm, issues):
    errors = []
    def need(ok, message):
        if not ok:
            errors.append(message)
    sm = read(ROOT/'books/space-marines/v2/generated/base.json')
    ba = read(HERE/'generated/base.json')
    smby = {r['id']:r for r in sm['entities']}
    baby = {r['id']:r for r in ba['entities']}
    hubpath = HERE/'sources/raw/wahapedia-blood-angels-main.html'
    hub = tree(hubpath)
    common = {r['id'] for r in smby.values() if r['kind']=='DATASHEET'
        and r['data']['factionKeywords']==['ADEPTUS ASTARTES']
        and hub.xpath('//div[contains(@class,"clFl") and not(contains(@class,"sLegendary")) and not(contains(@class,"sForgeWorld"))]/a[@href=$href]',
            href='/wh40k11ed/factions/space-marines/'+r['data']['sourceAnchor'])}
    dets = {r['id'] for r in smby.values() if r['kind']=='DETACHMENT'
        and r['data']['sourcePartition']=='BASE'
        and hub.xpath('//h2[@id=$anchor]', anchor=r['data']['sourceAnchor'])}
    shared = common|dets|{r['id'] for r in smby.values() if r.get('parentId') in dets
        and r['kind'] in ('DETACHMENT_RULE','ENHANCEMENT','STRATAGEM')}
    shared |= {r['id'] for r in smby.values() if r['kind']=='ARMY_RULE'
        and r['data'].get('sourceAnchor') in ('Combat-Doctrines','Transhuman-Strategist','Librarius')}
    refs = inherited['references']
    ids = [r['canonicalId'] for r in refs]
    need(len(ids)==len(set(ids))==180 and set(ids)==shared, 'inherited population differs from independent source membership')
    need(inherited['runtimeActive'] is False and inherited['factsCopied'] is False,
        'membership ledger prematurely activates runtime or copies SM facts')
    need(set(baby).isdisjoint(smby), 'BA canonical owner duplicates an SM identity')
    need(not any(r.get('bookId')!='blood-angels' for r in baby.values()), 'SM facts copied into BA foundation')
    for reference in refs:
        entity = smby.get(reference['canonicalId'])
        need(entity is not None, 'unknown inherited canonical identity')
        if entity is None:
            continue
        need(reference['sourceOwner']=='space-marines' and reference['sourceEntityId']==entity['sourceEntityId']
            and reference['kind']==entity['kind'] and reference['provenance']==entity['provenance'],
            'inherited canonical owner, persistent identity or provenance changed')
        need(not {'data','text','profiles','points','weaponProfiles','keywords'}&reference.keys(), 'SM factual content copied')
        source = ROOT/entity['provenance']['document']
        need(sha(source)==entity['provenance']['sha256'], 'accepted SM source revision changed')
        raw = tree(source).xpath(entity['provenance']['pointer'])
        need(len(raw)==1, 'SM canonical source occurrence does not resolve')
        proof = reference['membershipProof']
        need(proof['sourceSHA256']==sha(hubpath), 'BA membership capture hash changed')
        if entity['kind']=='DATASHEET':
            href = '/wh40k11ed/factions/space-marines/'+entity['data']['sourceAnchor']
            pointers = proof['hubOccurrencePointers']
            need(bool(pointers) and all(len(hub.xpath(p))==1 and hub.xpath(p)[0].get('href')==href for p in pointers),
                'physical source href membership points at a different Datasheet')
            need(proof['sourceHref']==href and proof['sourceFramePointer']==entity['provenance']['pointer'],
                'SM source frame/reference address mismatch')
            if raw:
                captured_frame=captured_byte_tree(source).xpath(entity['provenance']['pointer'])
                need(len(captured_frame)==1 and hashlib.sha256(html.tostring(captured_frame[0],encoding='utf8')).hexdigest().upper()==proof['sourceFrameSHA256'],
                    'SM source frame fingerprint changed')
        else:
            matches = [n for p in proof['matchingFullBlockPointers'] for n in hub.xpath(p)]
            need(bool(matches), 'BA full mechanical block evidence missing')
            if raw and entity['kind']!='DETACHMENT':
                need(any(oracle.text(n)==oracle.text(raw[0]) for n in matches), 'inherited mechanical text differs')
            if entity['kind']=='DETACHMENT':
                need(all(n.get('id')==entity['data']['sourceAnchor'] for n in matches), 'Detachment ownership changed')
    other = {r['id'] for r in smby.values() if r['kind']=='DATASHEET'}-common
    need({r['canonicalId'] for r in inherited['excludedOtherChapterDatasheets']}==other and len(other)==18,
        'foreign Chapter exclusion set changed')
    need(dict(Counter(r['kind'] for r in refs))=={k:v for k,v in inherited['counts'].items()
        if k not in ('ORDINARY_ENHANCEMENT','UNIT_UPGRADE')}, 'reference summary is inconsistent')
    need(Counter(smby[r['canonicalId']]['data'].get('itemKind') for r in refs if r['kind']=='ENHANCEMENT')
        =={'ENHANCEMENT':24,'UNIT_UPGRADE':8}, 'inherited Enhancement/Upgrade boundary changed')
    need(mfm['centralAcceptedVersion']=='v1.4' and mfm['candidateVersion']=='v1.6'
        and mfm['centralOldPointsUsable'] is False and mfm['activeBindings']==0 and mfm['valuesCopied'] is False,
        'MFM candidate boundary activated or old points used')
    candidates = mfm['identityCandidates']
    need(len(candidates)==25, 'BA-owned MFM candidate census changed')
    need(len({c['candidateNativeCanonicalId'] for c in candidates})==25, 'duplicate pricing candidate')
    for candidate in candidates:
        entity = baby.get(candidate['candidateNativeCanonicalId'])
        need(entity is not None, 'pricing candidate invented a native recipient')
        if entity:
            need(entity['sourceEntityId']==candidate['candidateNativeSourceIdentity'], 'pricing native persistent identity mismatch')
            need(entity['kind'] in ('DATASHEET','DETACHMENT','ENHANCEMENT'), 'invalid pricing candidate kind')
            need(candidate['native']['pointer']==entity['provenance']['pointer']
                and candidate['native']['sha256']==entity['provenance']['sha256'], 'pricing native source address changed')
        need(candidate['active'] is False, 'unreviewed MFM bridge activated')
        need(candidate.get('mappingStatus')=='REFERENCE_ONLY' and candidate['runtimeActive'] is False
            and candidate['canonicalMfmEntityId'] is None and candidate['independentSourceMappingProof']=='NOT_PROVEN_IN_STAGE_2A',
            'candidate automatically promoted to proven')
        for label in ('native','mfm'):
            proof=candidate[label]
            need(sha(ROOT/proof['document'])==proof['sha256'], 'pricing candidate source bytes changed')
            found=tree(ROOT/proof['document']).xpath(proof['pointer'])
            need(len(found)==1, 'pricing candidate occurrence missing')
            if found:
                need(hashlib.sha256(html.tostring(found[0],encoding='utf8')).hexdigest().upper()==proof['rawNodeSha256'],
                    'pricing candidate source node changed')
        need(candidate['mfm']['sourceOwner']=='blood-angels' and candidate['mfm']['version']=='v1.6', 'foreign/old pricing candidate owner')
    need(Counter(c['candidateKind'] for c in candidates)=={'UNIT':14,'DETACHMENT':3,'ENHANCEMENT':8},
        'MFM candidate owner population changed')
    boundaries=mfm['boundaries']
    need(boundaries['inheritedSpaceMarinesMfmUnitRecords']==69 and boundaries['factsCopied'] is False
        and boundaries['inheritedSpaceMarinesPaidOptions']==7 and boundaries['syntheticDatasheetsCreated']==[]
        and set(boundaries['mfmOnlySpaceMarinesUnits'])=={'Astraeus','Thunderhawk Gunship'}
        and boundaries['deathwatchRecordsPromotedToBloodAngels'] is False, 'SM/MFM-only/Deathwatch boundary changed')
    def no_prices(value):
        if isinstance(value,dict):
            need(not {'value','points','pointSchedules','totalPoints','DP'}&value.keys(), 'numeric MFM facts copied')
            for child in value.values(): no_prices(child)
        elif isinstance(value,list):
            for child in value: no_prices(child)
    no_prices(mfm)
    need(issues['sourceCompleteness']=='PARTIAL' and issues['semanticCompleteness']=='NOT_PROVEN'
        and issues['runtimeActive'] is False and issues['realNewRecruitExportTested'] is False,
        'unsupported source/semantic/import completeness claim')
    for issue in issues['issues']:
        for proof in issue.get('provenance',[]):
            need(sha(ROOT/proof['document'])==proof['sha256'], 'source issue evidence changed')
            if proof.get('pointer'):
                evidence = tree(ROOT/proof['document']).xpath(proof['pointer'])
                need(len(evidence)==1, 'source issue evidence occurrence missing')
                if evidence and proof.get('rawNodeSha256'):
                    need(hashlib.sha256(html.tostring(evidence[0],encoding='utf8')).hexdigest().upper()
                        ==proof['rawNodeSha256'], 'source issue node hash changed')
    issues_by_id = {issue['id']:issue for issue in issues['issues']}
    need(issues_by_id.get('BA-SRC-STORMLANCE-DP',{}).get('applied') is False,
        'Stormlance conflict silently applied')
    need(issues_by_id.get('BA-SRC-LEGACY-OF-THE-ANGEL',{}).get('runtimeActive') is False,
        'Legacy of the Angel prematurely executable')
    jump = next(r for r in baby.values() if r['kind']=='DATASHEET'
        and r['data']['sourceAnchor']=='Death-Company-Captain-with-Jump-Pack')
    need('IMPERIUM' not in jump['data']['keywords'], 'unproven IMPERIUM keyword invented')
    jump_refs = [r for r in baby.values() if r.get('parentId')==jump['id'] and r['kind']=='RULE_REFERENCE']
    need(not any(r['data']['label']=='Leader' for r in jump_refs), 'missing CORE Leader reference invented')
    need(any(r.get('parentId')==jump['id'] and r['kind']=='SOURCE_RELATION' and r['data']['role']=='LEADER'
        for r in baby.values()), 'explicit Jump Captain Leader declaration lost')
    need(not any({'DOOMED','GRACE'} & set(r['data'].get('keywords',[])) for r in baby.values()),
        'unproven named keyword created')
    return errors


def main():
    docs = [read(HERE/name) for name in ('inherited-sm-references.json','mfm-identity-candidates.json','source-issues.json')]
    errors = validate(*docs)
    assert not errors, '\n'.join(errors)
    mutations = [
        ('foreign owner', lambda d:d[0]['references'][0].update(sourceOwner='blood-angels')),
        ('copied SM fact', lambda d:d[0]['references'][0].update(text='Copied')),
        ('lost membership', lambda d:d[0]['references'].pop()),
        ('wrong persistent ID', lambda d:d[0]['references'][0].update(canonicalId='unit-not-proven')),
        ('premature runtime', lambda d:d[0].update(runtimeActive=True)),
        ('pricing activated', lambda d:d[1].update(activeBindings=25)),
        ('price invented', lambda d:d[1]['identityCandidates'][0].update(points=0)),
        ('foreign pricing recipient', lambda d:d[1]['identityCandidates'][0].update(candidateNativeCanonicalId='unit-sm-invented')),
    ]
    for label, mutate in mutations:
        damaged = copy.deepcopy(docs)
        mutate(damaged)
        assert validate(*damaged), 'Mutation escaped: '+label
    print(json.dumps({'status':'PASS','inheritedReferences':180,'inheritedDatasheets':67,
        'excludedOtherChapters':18,'inheritedDetachments':15,'inheritedRuleBlocks':15,
        'inheritedEnhancements':24,'inheritedUpgrades':8,'inheritedStratagems':48,'inheritedArmyRules':3,
        'mfmCandidates':25,'activeBindings':0,'mutationControls':[m[0] for m in mutations],
        'mixedOwnerRuntime':'NOT_ACTIVATED_STAGE_2A'},indent=2))


if __name__=='__main__':
    main()

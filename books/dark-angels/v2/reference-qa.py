"""Offline source/reference boundary QA for DA Stage 2A/2B; no runtime execution."""
from pathlib import Path
import copy, hashlib, json, re, sys
from collections import Counter
from functools import cache
from lxml import html
ROOT=Path(__file__).resolve().parents[3]
HERE=Path(__file__).resolve().parent

@cache
def load(path): return json.loads(path.read_text('utf8'))
@cache
def source_tree(path): return html.fromstring(path.read_text("utf8"))
def norm(text): return ''.join(text.split())
@cache
def sha(path): return hashlib.sha256(path.read_bytes()).hexdigest().upper()

def validate(inherited,chapter,mfm):
    errors=[]
    def check(ok,message):
        if not ok: errors.append(message)
    sm=load(ROOT/'books/space-marines/v2/generated/base.json')
    native=load(HERE/'generated/base.json')
    smby={e['id']:e for e in sm['entities']}; daby={e['id']:e for e in native['entities']}
    dafile=HERE/'sources/raw/wahapedia-dark-angels-main.html'; da=source_tree(dafile)
    smdoc=ROOT/'books/space-marines/v2/sources/raw/wahapedia-datasheets-probe.html'; sheets=source_tree(smdoc)
    expected_ds=set()
    for e in smby.values():
        if e['kind']!='DATASHEET': continue
        nodes=sheets.xpath(e['provenance']['pointer'])
        if not nodes: continue
        field=nodes[0].get('data-f',''); match=re.search(r'(?:^|,)CH:([0-9a-fA-F]+)',field)
        anchor=e['data']['sourceAnchor']
        linked=bool(da.xpath('//a[@href=$href]',href='/wh40k11ed/factions/space-marines/'+anchor))
        if match and int(match.group(1),16)&(1<<5) and linked: expected_ds.add(e['id'])
    expected_det={e['id'] for e in smby.values() if e['kind']=='DETACHMENT' and da.xpath('//h2[@id=$anchor]',anchor=e['data']['sourceAnchor'])}
    expected_children={e['id'] for e in smby.values() if e.get('parentId') in expected_det and e['kind'] in ['DETACHMENT_RULE','ENHANCEMENT','STRATAGEM']}
    expected_army={e['id'] for e in smby.values() if e['kind']=='ARMY_RULE' and e['data'].get('ruleClass')=='ARMY_RULE'}
    refs=inherited['references']; ids=[r['canonicalId'] for r in refs]
    check(len(ids)==len(set(ids)),'duplicate inherited canonical identity')
    check(set(ids)==expected_ds|expected_det|expected_children|expected_army,'inherited reference set differs from raw DA membership and native SM ownership')
    check(inherited['runtimeActive'] is False and inherited['factsCopied'] is False,'mixed-owner references must not activate or copy facts')
    for r in refs+[inherited['chapterRestrictionReference']]:
        e=smby.get(r['canonicalId']); check(e is not None,'unknown inherited canonical identity')
        if e is None: continue
        check(r['sourceOwner']=='space-marines' and r['sourceEntityId']==e['sourceEntityId'] and r['kind']==e['kind'] and r['provenance']==e['provenance'],'inherited ownership, identity or provenance changed')
        check(not any(k in r for k in ['data','text','profiles','points','weaponProfiles','keywords']),'SM facts duplicated in DA reference')
        check(sha(ROOT/r['provenance']['document'])==r['provenance']['sha256'].upper(),'inherited accepted source hash changed')
    excluded={x['canonicalId']for x in inherited['excludedOtherChapterDatasheets']}
    check(excluded=={e['id']for e in smby.values()if e['kind']=='DATASHEET'}-expected_ds,'other-Chapter exclusion set changed')
    check(not excluded&set(ids),'other-Chapter Datasheet inherited')
    counts=dict(Counter(r['kind']for r in refs));check(all(inherited['counts'].get(k)==v for k,v in counts.items()),'reference summary does not match records')
    records=chapter['records']; check(len(records)==26,'Chapter condition census changed'); check(len({r['recipient']['canonicalId']for r in records})==26,'duplicate Chapter recipient')
    tally=Counter(k for r in records for k in r['grantedKeywords']);check(tally=={'DEATHWING':18,'RAVENWING':8},'Deathwing/Ravenwing condition split changed')
    for r in records:
        p=r['recipient']; e=smby.get(p['canonicalId']); check(p['canonicalId'] in expected_ds,'Chapter recipient is not common SM UNIT')
        check(e is not None and p['kind']=='DATASHEET' and p['sourceOwner']=='space-marines' and p['provenance']==e['provenance'],'Chapter source/recipient identity changed')
        check(r['scope']=='UNIT' and r['runtimeActive'] is False,'Chapter condition activated or broadened beyond UNIT')
        ctx=r['physicalContext'];check(ctx['chapter']=='DARK_ANGELS' and ctx['chapterConfirmationRequired'] is True and ctx['modelKeywordPropagation']=='NOT_PROVEN_DO_NOT_GRANT','Chapter physical context guard changed')
        rule=r['rule'];check(rule['document']==dafile.relative_to(ROOT).as_posix() and rule['sha256'].upper()==sha(dafile),'Chapter rule provenance differs')
        nodes=da.xpath(rule['pointer']);check(len(nodes)==1,'Chapter rule pointer missing')
        if nodes:check(norm(nodes[0].text_content())==norm(rule['text']),'Chapter full source clause lost')
        eligibility=da.xpath(r['eligibilityEvidence']['pointer']); check(len(eligibility)==1,'Chapter eligibility source pointer missing')
        if eligibility:check(norm(r['eligibilityEvidence']['sourceClause']) in norm(eligibility[0].text_content()),'Chapter eligibility clause changed')
        proof=r['eligibilityEvidence']
        if e and proof['kind'].startswith('EXISTING_CANONICAL_KEYWORD'):
            keyword_text=' '.join(sheets.xpath(t['pointer'])[0].getparent().getparent().text_content() for t in r['conditionalSourceTokens'])
            check(all(re.search(r'\b'+re.escape(k)+r'\b',keyword_text) for k in proof['requiredKeywords']),'Chapter recipient does not meet literal raw-source keyword condition')
        elif e and proof['kind']=='EXACT_SOURCE_HREF_REFERENCE':
            check(proof['sourceHref']=='/wh40k11ed/factions/space-marines/'+e['data']['sourceAnchor'],'Chapter source href points at a different recipient')
            if eligibility:check(bool(eligibility[0].xpath('.//a[@href=$href]',href=proof['sourceHref'])),'explicit Chapter recipient href absent from source clause')
        check(set(r['grantedKeywords'])=={t['value']for t in r['conditionalSourceTokens']},'Chapter granted keywords differ from conditional source tokens')
        for token in r['conditionalSourceTokens']:
            check(token['pointer'].startswith(p['provenance']['pointer']+'/'),'conditional token belongs to a different UNIT')
            ts=sheets.xpath(token['pointer']);check(len(ts)==1 and norm(ts[0].text_content())==norm(token['value']),'conditional keyword source token changed')
        check(r['negativeControls'] and 'attachment' in ' '.join(r['negativeControls']).lower(),'Chapter negative control lost')
    check(mfm['centralAcceptedVersion']=='v1.6' and mfm['previousCentralVersion']=='v1.4' and mfm['centralOldPointsUsable'] is False and mfm['candidateVersion']=='v1.6','MFM version boundary changed')
    check(mfm['activeBindings']==27 and mfm['valuesCopied'] is False and mfm['pointsStatus']=='SOURCE_PROVEN_DA_OWNED_TIERS','DA pricing enrollment status differs')
    review={r['entityId']:r for r in load(HERE/'mfm-mapping-review.json')['reviewedBindings']}
    bindings=load(HERE/'mfm-bindings.json')
    bound={r['entityId']:r for part in ['unitBindings','detachmentBindings','enhancementBindings'] for r in bindings[part]}
    raw=ROOT/mfm['source']['document'];check(sha(raw)==mfm['source']['sha256'].upper(),'official MFM capture hash changed'); md=source_tree(raw)
    check(len(mfm['identityCandidates'])==27,'MFM source identity candidate census changed')
    for c in mfm['identityCandidates']:
        cid=c['candidateNativeCanonicalId']; proof=review.get(cid,{}); binding=bound.get(cid,{})
        check(c['active'] is True and c['disposition']=='BOUND' and c['mappingStatus']=='SOURCE_PROVEN_NATIVE_PRICING_ONLY','MFM pricing review disposition differs')
        check(proof.get('status')=='PROVEN' and len(proof.get('corroboratedProperties',[]))>=2 and binding.get('mfmRecordId')==c.get('mfmRecordId'),'MFM pricing activated without matching reviewed source bridge')
        check(len(md.xpath(c['sourcePointer']))==1,'MFM candidate source pointer missing')
        e=daby.get(c['candidateNativeCanonicalId']); check(e is not None and e['sourceEntityId']==c['candidateNativeSourceIdentity'],'MFM candidate native identity missing')
        if e:check(c['candidateNativeSourceAddress']=={k:e['provenance'][k]for k in ['document','sha256','pointer']},'MFM candidate native source address changed')
    shared=mfm['sharedSMBoundary'];check(shared['recordsCopied'] is False and shared['count']==69 and shared['nativeCommonCount']==67,'shared MFM owner boundary changed')
    check({x['canonicalId']for x in shared['nativeReferences']}==expected_ds,'shared MFM native references mismatch')
    check(len(shared['mfmOnly'])==2 and all(x['sourceOwner']=='space-marines' and x['nativeDatasheetId'] is None for x in shared['mfmOnly']),'MFM-only units invented as native Datasheets')
    check(mfm['deathwatchBoundary']['sourceOwner']=='deathwatch' and mfm['deathwatchBoundary']['active'] is False,'Deathwatch ownership lost')
    check(len(mfm['paidOptionCandidates'])==1,'DA paid option candidate count changed')
    for c in mfm['paidOptionCandidates']:
        check(c['chargeEnabled'] is False and c['physicalSelectionStatus']=='NOT_PROVEN' and c['nativeEquipmentCanonicalId'] is None,'Cyclone paid option applied without physical proof')
        check(len(md.xpath(c['sourcePointer']))==1,'Cyclone source pointer missing')
    def no_values(x):
        if isinstance(x,dict):
            check(not {'value','points','pointSchedules','totalPoints','DP'}&x.keys(),'numeric MFM facts copied into DA boundary')
            for v in x.values(): no_values(v)
        elif isinstance(x,list):
            for v in x:no_values(v)
    no_values(mfm)
    return errors

def main():
    docs=[load(HERE/name)for name in ['inherited-sm-references.json','chapter-conditions.json','mfm-boundary.json']]
    errors=validate(*docs)
    if errors: print(json.dumps({'status':'FAIL','errors':errors},indent=2));return 1
    mutations=[('foreign owner',lambda d:d[0]['references'][0].update(sourceOwner='dark-angels')),('copied SM fact',lambda d:d[0]['references'][0].update(text='Copied fact')),('dropped inherited reference',lambda d:d[0]['references'].pop()),('changed Chapter recipient',lambda d:d[1]['records'][0]['recipient'].update(canonicalId='unit-not-proven')),('Chapter grant activated',lambda d:d[1]['records'][0].update(runtimeActive=True)),('missing physical Chapter confirmation',lambda d:d[1]['records'][0]['physicalContext'].update(chapterConfirmationRequired=False)),('MFM pricing census corrupted',lambda d:d[2].update(activeBindings=1)),('MFM price copied',lambda d:d[2]['identityCandidates'][0].update(points=80)),('Cyclone charged',lambda d:d[2]['paidOptionCandidates'][0].update(chargeEnabled=True))]
    failed=[]
    for label,mutate in mutations:
        mutated=copy.deepcopy(docs);mutate(mutated)
        if not validate(*mutated): failed.append(label)
    if failed:print(json.dumps({'status':'FAIL','mutationEscapes':failed}));return 1
    print(json.dumps({'status':'PASS','inheritedReferences':len(docs[0]['references']),'inheritedDatasheets':67,'inheritedDetachments':15,'inheritedRuleBlocks':15,'inheritedEnhancements':24,'inheritedUpgrades':8,'inheritedStratagems':48,'inheritedArmyRules':3,'chapterConditions':26,'mfmProvenPricingBindings':27,'paidOptionCandidates':1,'mutationControls':len(mutations),'mixedOwnerRuntime':'NOT_PROVEN'},indent=2));return 0
if __name__=='__main__':sys.exit(main())

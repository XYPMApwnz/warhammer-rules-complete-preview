"""Isolated, offline Dark Angels 11E factual producer (existing V2 pattern).

RAW is read on every build. Persistent IDs are explicit enrollment data, never
minted by this producer. No legacy facts, MFM, contracts, importer or UI input.
"""
from __future__ import annotations
import argparse
import copy
import hashlib
import json
import re
import sys
from collections import Counter
from pathlib import Path
from urllib.parse import urljoin, urlsplit
from lxml import html

sys.dont_write_bytecode = True
HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
BOOK = 'dark-angels'
RAW = 'books/dark-angels/v2/sources/raw/'
HUB = RAW+'wahapedia-dark-angels-main.html'
SHEETS = RAW+'wahapedia-datasheets.html'
SOURCE = 'dark-angels-waha-11e-2026-10-21'
URL = 'https://wahapedia.ru/wh40k11ed/factions/space-marines/'
MFM_FIELDS = {'points','pointSchedules','wahaPoints','paidOptions','paidWargear','wargearCosts',
              'enhancementCost','enhancementPoints','detachmentPoints','forceDisposition','forceDispositions'}
COMMON_BADGE = 'App. Dark Angels (11th edition)'
read = lambda p: json.loads(Path(p).read_text(encoding='utf-8'))
sha = lambda b: hashlib.sha256(b).hexdigest().upper()
norm = lambda s: ' '.join(str(s).split())
serialize = lambda v: (json.dumps(v, ensure_ascii=False, indent=2)+'\n').encode('utf-8')
fingerprint = lambda v: sha(json.dumps(v, ensure_ascii=False, sort_keys=True, separators=(',',':')).encode())
css = lambda c: 'contains(concat(" ",normalize-space(@class)," ")," '+c+' ")'
has = lambda n,c: c in (n.get('class') or '').split()
flat = lambda n: norm(n.text_content())


def source_text(node):
    """Preserve gameplay paragraphs/lists; MFM mirrors and display fluff are not facts."""
    if has(node,'dsAbility') and node.xpath('.//*['+css('dsUnitCostHeader')+']'):
        return ''
    node = copy.deepcopy(node)
    for child in list(node.iterdescendants()):
        if not isinstance(child.tag,str) or child.getparent() is None:
            continue
        tokens = (child.get('class') or '').split()
        if child.tag in ('script','style') or set(tokens)&{'ShowFluff','faqErrataSpoiler','faqErrataStrat'}:
            child.drop_tree()
        elif has(child,'dsAbility') and child.xpath('.//*['+css('dsUnitCostHeader')+']'):
            child.drop_tree()
    for price in node.xpath('.//ul['+css('EnhancementsPts')+']/li/span[position()>1]'):
        price.drop_tree()
    for e in node.iter():
        if not isinstance(e.tag,str):
            continue
        if e.tag in ('div','p','h1','h2','h3','h4','h5','h6','ul','ol','table','tr'):
            e.text = '\n'+(e.text or '')
            e.tail = '\n'+(e.tail or '')
        elif e.tag in ('td','th'):
            e.text = ' '+(e.text or '')
            e.tail = ' '+(e.tail or '')
        elif e.tag=='li':
            e.text = '\n- '+(e.text or '')
            e.tail = '\n'+(e.tail or '')
        elif e.tag=='br':
            e.tail = '\n'+(e.tail or '')
    return '\n'.join(norm(s) for s in ''.join(node.itertext()).splitlines() if norm(s))


def section_nodes(header):
    result=[]
    for sibling in header.itersiblings():
        if has(sibling,'dsHeader'):
            break
        if isinstance(sibling.tag,str):
            result.append(sibling)
    return result


def section_text(header):
    return '\n'.join([flat(header)]+[source_text(n) for n in section_nodes(header) if source_text(n)])


def load_tree(document):
    return html.fromstring((ROOT/document).read_text(encoding='utf-8'))


def address(document,node,kind):
    return document+'#'+node.getroottree().getpath(node)+'::'+kind


def discover():
    """Enumerate source addresses afresh; compare with the explicit ledger in build()."""
    rows=[]
    accounting=[]
    def add(document,node,kind,parent,data,book=BOOK):
        key=address(document,node,kind)
        rows.append({'key':key,'kind':kind,'ownerKey':parent,'bookId':book,'data':data,
                     'document':document,'pointer':node.getroottree().getpath(node),
                     'rawNodeSha256':sha(html.tostring(node,encoding='utf-8'))})
        return key
    sheets=load_tree(SHEETS)
    all_frames=sheets.xpath('//div['+css('dsOuterFrame')+']')
    by_anchor={f.getprevious().get('id'):f for f in all_frames}
    for frame in all_frames:
        anchor=frame.getprevious().get('id')
        badges=sorted(set(frame.xpath('.//img['+css('logo3')+']/@title')))
        selected=badges==[COMMON_BADGE]
        accounting.append({'document':SHEETS,'pointer':frame.getroottree().getpath(frame),
                           'sourceAnchor':anchor,'sourcePublication':badges,
                           'classification':'INCLUDED_CURRENT_DA' if selected else
                           'EXCLUDED_LEGENDS' if any('Legends' in b for b in badges) else
                           'EXCLUDED_FORGE_WORLD' if any('Forge World' in b for b in badges) else 'EXCLUDED_FOREIGN_CHAPTER_OWNER'})
        if not selected:
            continue
        title=flat(frame.xpath('./div[contains(@class,"dsBannerWrap")]//*[contains(@class,"dsH2Header")]/div[1]')[0])
        left=frame.xpath('./div['+css('ds2colKWFlat')+']/*[starts-with(@class,"dsLeft")]')[0]
        right=frame.xpath('./div['+css('ds2colKWFlat')+']/*[starts-with(@class,"dsRight")]')[0]
        keyword_spans=left.xpath('./span[not('+css('dsVertLine')+')]')
        if not keyword_spans:
            raise ValueError('Unclassified keyword source: '+anchor)
        keywords=[norm(x) for x in flat(keyword_spans[0]).split(';') if norm(x)]
        named_keywords=[]
        for span in keyword_spans[1:]:
            separator=span.getprevious()
            if separator is None or not has(separator,'dsVertLine') or not norm(separator.tail or '').endswith(':'):
                raise ValueError('Unresolved named MODEL keyword declaration: '+anchor)
            named_keywords.append({'modelSourceName':norm(separator.tail).rstrip(':'),
                'keywords':[norm(x) for x in flat(span).split(';') if norm(x)],
                'pointer':span.getroottree().getpath(span),'scope':'SOURCE_NAMED_MODEL'})
        faction=[norm(x) for x in flat(right).split(':',1)[1].split(';') if norm(x)]
        owner=add(SHEETS,frame,'DATASHEET',None,{'title':title,'sourceAnchor':anchor,'url':URL+anchor,
                  'keywords':keywords,'modelKeywordDeclarations':named_keywords,
                  'keywordScope':'ALL_SOURCE_MODELS','factionKeywords':faction,'sourcePublication':badges,
                  'sourcePartition':'DA_OWNED'})
        main=frame.xpath('./div['+css('ds2col')+' and not(contains(@class,"ShowDatasheetFeatures"))]')[0]
        profiles=[]
        profile_nodes=frame.xpath('./div['+css('dsBannerWrap')+']//div['+css('dsProfileBaseWrap')+']')
        for p in profile_nodes:
            cells=p.xpath('.//div['+css('dsCharWrap')+']')
            values=[flat(n.xpath('.//*['+css('dsCharValue')+']')[0]) for n in cells]
            own_labels=p.xpath('.//*['+css('dsCharName')+']')
            headers=own_labels or profile_nodes[0].xpath('.//*['+css('dsCharName')+']')
            if len(values)!=6 or len(headers)!=6:
                raise ValueError('Incomplete MODEL profile: '+anchor)
            names=p.xpath('.//*['+css('dsModelName')+']')
            label=flat(names[0]) if names else title if len(profile_nodes)==1 else None
            if not label:
                raise ValueError('Unresolved source MODEL label: '+anchor)
            key=add(SHEETS,p,'MODEL_PROFILE',owner,{'name':label,'stats':dict(zip(map(flat,headers),values)),
                 'sharedColumnHeadersUsed':not bool(own_labels),'columnHeaderPointer':headers[0].getroottree().getpath(headers[0]),
                 'scope':'SOURCE_MODEL_PROFILE'})
            profiles.append((p,label,key))
        for declaration in named_keywords:
            candidates=[p for p in profiles if p[1].casefold()==declaration['modelSourceName'].casefold()]
            declaration['sourceProfileKey']=candidates[0][2] if len(candidates)==1 else None
            declaration['profileBindingStatus']='SOURCE_CONFIRMED' if len(candidates)==1 else 'NOT_PROVEN'
        for weapon in main.xpath('.//tr['+css('dsWeaponRow')+']'):
            cells=weapon.xpath('./td');name_nodes=weapon.xpath('.//*['+css('dsWeaponName')+']')
            if len(cells)<8 or len(name_nodes)!=1:
                raise ValueError('Incomplete weapon source')
            abilities=[flat(n) for n in cells[1].xpath('.//*['+css('kwbw')+']')]
            add(SHEETS,weapon,'WEAPON_PROFILE',owner,{'name':flat(name_nodes[0]),
                **dict(zip(['range','attacks','skill','strength','ap','damage'],map(flat,cells[-6:]))),
                'abilities':abilities,'sourceWeaponCellText':source_text(cells[1]),'ownership':'DATASHEET_PROFILE_ONLY'})
        for option in main.xpath('.//div['+css('dsWargearOptionsList')+']/ul/li'):
            add(SHEETS,option,'WARGEAR_OPTION',owner,{'text':source_text(option),'nestedListItems':len(option.xpath('.//li')),
                                                    'execution':'NOT_IMPLEMENTED','legalityValidationImplemented':False})
        headers=main.xpath('.//div['+css('dsHeader')+']')
        for header in headers:
            label=flat(header)
            if label in ['RANGED WEAPONS','MELEE WEAPONS','RANGE','A','BS','WS','S','AP','D']:
                continue
            full=section_text(header)
            add(SHEETS,header,'DATASHEET_SECTION',owner,{'title':label,'text':full})
            nodes=section_nodes(header)
            if label in ('LEADER','SUPPORT','TRANSPORT'):
                refs=[]
                for node in nodes:
                    for link in node.xpath('.//a[@href]'):
                        href=urljoin(URL,link.get('href'));frag=urlsplit(href).fragment
                        if frag in by_anchor:
                            refs.append({'label':flat(link),'href':href,'sourceAnchor':frag,
                                         'sourcePublication':sorted(set(by_anchor[frag].xpath('.//img['+css('logo3')+']/@title')))})
                add(SHEETS,header,'SOURCE_RELATION',owner,{'role':label,'rawText':full,
                    'targetSourceAnchors':list(dict.fromkeys(r['sourceAnchor'] for r in refs)),'sourceReferences':refs,
                    'bindingStatus':'SOURCE_DECLARATION_ONLY','effectiveEligibility':False,'mfmIntegrated':False})
            if label=='UNIT COMPOSITION':
                for node in nodes:
                    if node.xpath('.//*['+css('dsUnitCostHeader')+']'):
                        accounting.append({'document':SHEETS,'pointer':node.getroottree().getpath(node),'classification':'CENTRAL_MFM_MIRROR_EXCLUDED'})
                        continue
                    for li in node.xpath('./ul['+css('dsUl')+']/li'):
                        literal=source_text(li)
                        m=re.match(r'^(\d+)(?:[-–](\d+))?\s+(.+?)\s+models?\.?$',flat(li),re.I)
                        label=m.group(3) if m else flat(li)
                        qty={'min':int(m.group(1)),'max':int(m.group(2) or m.group(1))} if m else None
                        exact=[p for p in profiles if p[1].casefold()==label.casefold()]
                        target=exact[0][2] if len(exact)==1 else profiles[0][2] if len(profiles)==1 else None
                        add(SHEETS,li,'COMPOSITION_MEMBER',owner,{'name':label,'quantity':qty,'text':literal,
                            'modelProfileKey':target,'profileBindingStatus':'SOURCE_CONFIRMED' if target else 'NOT_PROVEN'})
        for ability in main.xpath('.//div['+css('dsAbility')+' or '+css('dsAbility_noLine')+']'):
            prior=ability.xpath('preceding-sibling::div['+css('dsHeader')+'][1]')
            section=flat(prior[0]) if prior else None
            if section not in ('ABILITIES','PSYCHIC ABILITIES','WARGEAR ABILITIES','CHIEF LIBRARIAN (PSYKER LEVEL 3)','PRIMARCH OF THE FIRST LEGION'):
                continue
            bold=ability.xpath('./b|./div['+css('dsWargearAbilityText')+']/b')
            title_text=flat(bold[0]).rstrip(':') if bold else ''
            add(SHEETS,ability,'DATASHEET_ABILITY',owner,{'title':title_text,'text':source_text(ability),
                'section':section,'supplemental':section in ('CHIEF LIBRARIAN (PSYKER LEVEL 3)','PRIMARCH OF THE FIRST LEGION'),
                'sourceSectionPointer':prior[0].getroottree().getpath(prior[0]) if prior else None,'wargearAbility':has(ability,'dsWargearAbility'),'execution':'UNVERIFIED'})
        for table in main.xpath('.//*['+css('dsCoreArmy')+']'):
            for cell in table.xpath('.//td['+css('dsCoreArmyValue')+']'):
                spans=cell.xpath('./b/span|./b/a')
                if not spans:
                    raise ValueError('Unclassified native reference cell: '+anchor)
                for node in spans:
                    add(SHEETS,node,'RULE_REFERENCE',owner,{'label':flat(node),'text':source_text(node),
                        'scope':'SOURCE_DECLARATION','recipientBindingStatus':'NOT_EXECUTABLE',
                        'sourceSection':flat(cell.getprevious())})
        for panel in frame.xpath('.//div['+css('dsInvulWrap')+']'):
            nextnode=panel.getnext()
            comment=flat(nextnode) if nextnode is not None and has(nextnode,'dsInvulComment') else ''
            value=panel.xpath('.//*['+css('dsCharInvulValue')+']')
            if len(value)!=1:
                raise ValueError('Unresolved invulnerable value')
            named=re.fullmatch(r'\*\s*(.+?)\s+only',comment,re.I) if comment and not comment.lower().startswith('* against') else None
            selected=[p[2] for p in profiles if named and p[1].casefold()==named.group(1).casefold()] if named else [p[2] for p in profiles]
            if named and len(selected)!=1:
                raise ValueError('Unresolved named invulnerable MODEL scope: '+anchor)
            add(SHEETS,panel,'INVULNERABLE_SAVE',owner,{'text':source_text(panel)+('\n'+comment if comment else ''),
                'value':flat(value[0]),'sourceProfileKeys':selected,'conditionText':comment,
                'scopeQualification':'EXPLICIT_NAMED_MODEL' if named else 'CONDITIONAL_SOURCE_MODEL' if comment else 'DATASHEET_HEADER_SOURCE_PROFILES',
                'execution':'NOT_IMPLEMENTED'})
    hub=load_tree(HUB)
    army=hub.xpath('//*[@id="Army-Rules"]')[0].getnext()
    for header in army.xpath('.//h3[@id]|.//h4[@id]'):
        anchor=header.get('id')
        if anchor in ['The-Ravenwing','The-Deathwing']:
            add(HUB,header.getparent(),'ARMY_RULE',None,{'title':flat(header),'sourceAnchor':anchor,
                'text':source_text(header.getparent()),'ruleClass':'ARMY_RULE','execution':'UNVERIFIED'})
        else:
            accounting.append({'document':HUB,'pointer':header.getparent().getroottree().getpath(header.getparent()),
                               'sourceAnchor':anchor,'classification':'INHERITED_RULE_REFERENCE_ONLY'})
    for header in hub.xpath('//*[@id="wahMainContent"]//h2['+css('outline_header')+']'):
        if not header.xpath('.//*['+css('dpPts')+']'):
            continue
        badges=sorted(set(header.xpath('.//img[contains(@class,"logo3")]/@title')))
        selected=badges==[COMMON_BADGE]
        container=header.getparent()
        accounting.append({'document':HUB,'pointer':container.getroottree().getpath(container),
            'sourceAnchor':header.get('id'),'sourcePublication':badges,
            'classification':'INCLUDED_CURRENT_DA_DETACHMENT' if selected else 'NON_DA_DETACHMENT_REFERENCE_ONLY'})
        if not selected:
            continue
        book=BOOK
        title=flat(header.xpath('./span[1]')[0]) if header.xpath('./span[1]') else flat(header).split('DP',1)[0]
        # The filter supplies a display label, never a persistent identity.
        label=hub.xpath('//*[@data-det-name and @data-f=$f]/@data-det-name',f=container.get('data-f'))
        if label:
            title=label[0]
        else:
            plain=copy.deepcopy(header)
            for span in plain.xpath('.//*['+css('dpPts')+']'):
                span.drop_tree()
            title=flat(plain)
        det=add(HUB,header,'DETACHMENT',None,{'title':title,'sourceAnchor':header.get('id'),
                'sourcePublication':badges or [COMMON_BADGE],'sourcePartition':'DA_OWNED'},book)
        for rule in container.xpath('.//h3[@id]'):
            parent=rule.getparent()
            r=add(HUB,parent,'DETACHMENT_RULE',det,{'title':flat(rule),'sourceAnchor':rule.get('id'),
                'text':source_text(parent),'execution':'UNVERIFIED'},book)
            for grant in parent.xpath('.//div['+css('blueAbility')+']'):
                bold=grant.xpath('./b')
                grant_title=flat(bold[0]).rstrip(':') if bold else flat(grant).split(':',1)[0]
                add(HUB,grant,'DETACHMENT_RULE',r,{'title':grant_title,'text':source_text(grant),'nested':True,'execution':'UNVERIFIED'},book)
        for priceheader in container.xpath('.//ul['+css('EnhancementsPts')+']'):
            body=priceheader.xpath('ancestor::td[1]')[0]
            heading=priceheader.xpath('./li/span[1]')[0]
            title=flat(heading)
            upgrade=bool(heading.xpath('.//*['+css('EnhancementUnitUpgrade')+']')) or 'UPGRADE' in title
            if upgrade:
                title=norm(title.replace('UPGRADE',''))
            add(HUB,body,'ENHANCEMENT',det,{'title':title,'text':source_text(body),'itemKind':'UNIT_UPGRADE' if upgrade else 'ENHANCEMENT',
                 'scope':'UNIT' if upgrade else 'MODEL','eligibilityText':source_text(body),'execution':'UNVERIFIED'},book)
        for strat in container.xpath('.//div['+css('str11Wrap')+']'):
            names=strat.xpath('.//div['+css('str11Name')+']')
            add(HUB,strat,'STRATAGEM',det,{'title':flat(names[0]),'text':source_text(strat),'execution':'UNVERIFIED'},book)
        for qualifier in container.xpath('./div[starts-with(normalize-space(text()),"UNIQUE:")]'):
            accounting.append({'document':HUB,'pointer':qualifier.getroottree().getpath(qualifier),'classification':'CENTRAL_MFM_QUALIFIER_REFERENCE_NOT_CONNECTED'})
        for dp in header.xpath('.//*['+css('dpPts')+']'):
            accounting.append({'document':HUB,'pointer':dp.getroottree().getpath(dp),'classification':'CENTRAL_MFM_DISPOSITION_REFERENCE_NOT_CONNECTED'})
    keys=[r['key'] for r in rows]
    if len(keys)!=len(set(keys)):
        raise ValueError('Duplicate raw source address')
    return rows,accounting


def verify_sources(enrollment=None):
    enrollment=enrollment or read(HERE/'sources/enrollment.json')
    for artifact in enrollment['artifacts']:
        raw=(ROOT/artifact['path']).read_bytes()
        if sha(raw)!=artifact['sha256'] or len(raw)!=artifact['bytes']:
            raise ValueError('Source integrity mismatch: '+artifact['path'])


def collect(*,source_bindings=None,identity_bindings=None):
    verify_sources()
    rows,accounting=discover()
    bindings=(read(HERE/'source-bindings.json') if source_bindings is None else source_bindings)['recordAddresses']
    identities=(read(HERE/'identity-bindings.json') if identity_bindings is None else identity_bindings)['bindings']
    bykey={x['key']:x for x in bindings}
    bysource={x['sourceEntityId']:x for x in identities}
    if len(bykey)!=len(bindings) or len(bysource)!=len(identities) or {r['key'] for r in rows}!=set(bykey):
        raise ValueError('Raw inventory changed; explicit source/identity review required')
    if {x['sourceEntityId'] for x in bindings}!=set(bysource):
        raise ValueError('Identity/source enrollment mismatch')
    entities=[]
    sourcebykey={k:v['sourceEntityId'] for k,v in bykey.items()}
    canonicalbykey={k:bysource[v]['id'] for k,v in sourcebykey.items()}
    artifact_hashes={document:sha((ROOT/document).read_bytes()) for document in {r['document'] for r in rows}}
    for row in rows:
        binding=bykey[row['key']];identity=bysource[binding['sourceEntityId']]
        parent=sourcebykey.get(row['ownerKey'])
        if binding['kind']!=row['kind'] or identity['kind']!=row['kind'] or identity['ownerSourceId']!=parent or identity['bookId']!=row['bookId']:
            raise ValueError('Source kind/owner mismatch: '+row['key'])
        if binding['rawNodeSha256']!=row['rawNodeSha256'] or binding['dataFingerprint']!=fingerprint(row['data']):
            raise ValueError('Reviewed source block changed: '+row['key'])
        data=copy.deepcopy(row['data'])
        if 'modelProfileKey' in data:
            key=data.pop('modelProfileKey')
            data['modelProfileId']=canonicalbykey[key] if key else None
        if 'sourceProfileKeys' in data:
            data['sourceProfileIds']=[canonicalbykey[k] for k in data.pop('sourceProfileKeys')]
        for declaration in data.get('modelKeywordDeclarations',[]):
            key=declaration.pop('sourceProfileKey')
            declaration['sourceProfileId']=canonicalbykey[key] if key else None
        proof={'sourceId':SOURCE,'document':row['document'],'sha256':artifact_hashes[row['document']],
               'pointer':row['pointer'],'sourceEntityId':binding['sourceEntityId'],'authority':'ACCEPTED_SECONDARY'}
        entities.append({'id':identity['id'],'kind':row['kind'],'sourceEntityId':binding['sourceEntityId'],'bookId':row['bookId'],
                         'data':data,'provenance':proof,**({'parentId':bysource[parent]['id']} if parent else {})})
    for entity in entities:
        children=[r for r in entities if r.get('parentId')==entity['id']]
        if entity['kind']=='DATASHEET':
            for name,kind in [('profileIds','MODEL_PROFILE'),('weaponIds','WEAPON_PROFILE'),('sectionIds','DATASHEET_SECTION'),
                ('wargearOptionIds','WARGEAR_OPTION'),('ruleReferenceIds','RULE_REFERENCE'),('compositionMemberIds','COMPOSITION_MEMBER'),
                ('abilityIds','DATASHEET_ABILITY'),('relationIds','SOURCE_RELATION'),('invulnerableIds','INVULNERABLE_SAVE')]:
                entity['data'][name]=[r['id'] for r in children if r['kind']==kind]
        elif entity['kind']=='DETACHMENT':
            for name,kind in [('ruleIds','DETACHMENT_RULE'),('enhancementIds','ENHANCEMENT'),('stratagemIds','STRATAGEM')]:
                entity['data'][name]=[r['id'] for r in children if r['kind']==kind]
        elif entity['kind']=='DETACHMENT_RULE':
            entity['data']['nestedRuleIds']=[r['id'] for r in children if r['kind']=='DETACHMENT_RULE']
    return entities,accounting


def validate(document):
    records={r['id']:r for r in document['entities']}
    if len(records)!=len(document['entities']):
        raise ValueError('Duplicate canonical identity')
    sourceids=[r['sourceEntityId'] for r in records.values()]
    if len(sourceids)!=len(set(sourceids)):
        raise ValueError('Duplicate source identity')
    for record in records.values():
        if record['bookId']!=document['bookId'] or record.get('parentId') and record['parentId'] not in records:
            raise ValueError('Foreign/missing canonical owner')
        if not record.get('provenance',{}).get('sourceId'):
            raise ValueError('Missing source provenance')
        def visit(v):
            if isinstance(v,dict):
                if set(v)&MFM_FIELDS:
                    raise ValueError('MFM fact copied into Army factual owner')
                for value in v.values():visit(value)
            elif isinstance(v,list):
                for value in v:visit(value)
        visit(record['data'])
        for key,value in record['data'].items():
            if key.endswith('Ids') and isinstance(value,list):
                if len(value)!=len(set(value)) or any(x not in records for x in value):
                    raise ValueError('Unresolved/duplicate factual reference: '+key)
        if record['kind']=='MODEL_PROFILE' and set(record['data']['stats'])!={'M','T','SV','W','LD','OC'}:
            raise ValueError('Incomplete model characteristics')
        if record['kind']=='SOURCE_RELATION' and (record['data']['effectiveEligibility'] or record['data']['mfmIntegrated']):
            raise ValueError('Unapproved executable MFM relation')
    return True


def build():
    entities,accounting=collect()
    main=sorted(entities,key=lambda r:r['id'])
    base={'schema':'dark-angels-v2-canonical/v1','bookId':BOOK,'edition':'11E','entities':main,
          'sourceEnrollment':'books/dark-angels/v2/sources/enrollment.json','sourceAccounting':accounting,
          'inheritedMembership':'books/dark-angels/v2/inherited-sm-references.json',
          'chapterConditions':'books/dark-angels/v2/chapter-conditions.json',
          'mfmBoundary':{'owner':'CENTRALIZED_MFM','integration':'NATIVE_PRICING_BOUND','valuesCopied':False,'relationsConnected':False},
          'sourceCompleteness':'PARTIAL','semanticCompleteness':'NOT_PROVEN',
          'gameplayContractsImplemented':0,'rosterIntegrationImplemented':False,'presentationImplemented':False,'contentCertified':False,
          'mixedOwnerRuntimeStatus':'NOT_PROVEN; reference ledger is not runtime integration'}
    effective=copy.deepcopy(base)
    effective['schema']='dark-angels-v2-effective/v1'
    effective['officialReview']={'applicableDaFieldCorrections':[],
        'status':'NO_ADDITIONAL_APPLICABLE_OFFICIAL_FIELDS_PROVEN; full official App unavailable',
        'legendsPack':'v1.3 is Legends-only, excluded from current facts',
        'inheritedSmOfficialCorrections':'Existing SM effective owner; not reapplied'}
    validate(base);validate(effective)
    counts=dict(Counter(r['kind'] for r in main))
    census={'bookId':BOOK,'sourceRows':len(main),'mainEntities':len(main),'counts':counts,
        'datasheets':counts.get('DATASHEET',0),
        'mainDatasheetAbilities':sum(r['kind']=='DATASHEET_ABILITY' and not r['data']['supplemental'] for r in main),
        'supplementalNamedAbilities':sum(r['kind']=='DATASHEET_ABILITY' and r['data']['supplemental'] for r in main),
        'enhancements':sum(r['kind']=='ENHANCEMENT' and r['data']['itemKind']=='ENHANCEMENT' for r in main),
        'unitUpgrades':sum(r['kind']=='ENHANCEMENT' and r['data']['itemKind']=='UNIT_UPGRADE' for r in main),
        'relationTargetEdges':dict(Counter(role for r in main if r['kind']=='SOURCE_RELATION'
                 for role in [r['data']['role']]*len(r['data']['targetSourceAnchors']))),
        'sourceScopeClassifications':dict(Counter(r['classification'] for r in accounting)),
        'unresolvedCompositionProfiles':[r['id'] for r in main if r['kind']=='COMPOSITION_MEMBER' and r['data']['profileBindingStatus']=='NOT_PROVEN'],
        'identityPolicy':'EXPLICIT_ONCE_ENROLLED_OPAQUE_IDS;NO_TITLE_ORDER_DERIVATION',
        'mfmIntegration':'NATIVE_PRICING_BOUND','mixedOwnerRuntime':'NOT_PROVEN','sourceCompleteness':'PARTIAL','semanticCompleteness':'NOT_PROVEN',
        'contentCertified':False,'runtimeAcceptancePerformed':False}
    return {'base':base,'effective':effective,'factual-census':census}


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check',action='store_true')
    args=parser.parse_args()
    documents=build()
    for name,value in documents.items():
        path=HERE/'generated'/(name+'.json')
        expected=serialize(value)
        if args.check:
            if not path.exists() or path.read_bytes()!=expected:
                raise ValueError('Stale/non-deterministic factual output: '+name)
        else:
            path.parent.mkdir(exist_ok=True)
            path.write_bytes(expected)
    print(json.dumps(documents['factual-census'],ensure_ascii=False))


if __name__=='__main__':
    main()

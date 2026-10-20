"""Independent offline lxml oracle for the accepted Space Marines RAW.

The producer, its parser, generated census and old Stage 1 inventories are not
expected-value inputs. Identity bindings supply names for observed addresses.
"""
from __future__ import annotations
import copy
import hashlib
import importlib.util
import json
import re
import sys
from collections import Counter, defaultdict
from functools import lru_cache
from pathlib import Path
from lxml import html

sys.dont_write_bytecode = True
HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
if str(HERE) not in sys.path:
    sys.path.insert(0,str(HERE))
RAW = HERE / 'sources/raw'
read = lambda p: json.loads(p.read_text(encoding='utf-8-sig'))
norm = lambda s: ' '.join(s.split())
@lru_cache(maxsize=4)
def digest(p):
    return hashlib.sha256(p.read_bytes()).hexdigest().upper()
SM = 'App. Space Marines (11th edition)'
OWNED = {SM, *['App. '+chapter+' (11th edition)' for chapter in
    ['Iron Hands','Imperial Fists','Ultramarines','Raven Guard','Salamanders','White Scars']]}


def has(node, token):
    return token in (node.get('class') or '').split()


def nodes(node, token):
    return [n for n in node.iter() if has(n, token)]


def text(node, omit=(), keep_fluff=False):
    """Preserve all gameplay siblings/list items; omit display-only material."""
    clone = copy.deepcopy(node)
    for n in list(clone.iterdescendants()):
        if n.getparent() is not None and (n.tag in ['script', 'style'] or
                any(has(n, c) for c in (('faqErrataSpoiler', *omit) if keep_fluff else ('ShowFluff', 'faqErrataSpoiler', *omit)))):
            n.drop_tree()
    for n in clone.iter():
        if n.tag in ['div','p','li','ul','ol','table','tr','td','h2','h3','h4','br']:
            n.text = ' '+(n.text or '')
            n.tail = ' '+(n.tail or '')
    return norm(''.join(clone.itertext()))


def loc(node, path):
    return {'document': path.relative_to(ROOT).as_posix(),
        'pointer': node.getroottree().getpath(node), 'sha256': digest(path)}


def observation(kind, node, path, data, owner=None):
    return {**loc(node, path), 'kind': kind, 'data': data,
        'ownerPointer': owner.getroottree().getpath(owner) if owner is not None else None}


def raw_oracle():
    """Discover source partitions before applying any persistent bindings."""
    result = {'rows': [], 'crossOwnerRows': [], 'datasheetPartitions': Counter(),
        'detachmentPartitions': Counter(), 'coverage': Counter(), 'rawDatasheets': 0}
    rows = result['rows']
    path = RAW/'wahapedia-datasheets-probe.html'
    tree = html.parse(str(path))
    for frame in nodes(tree.getroot(), 'datasheet'):
        result['rawDatasheets'] += 1
        badges = tuple(sorted(set(i.get('title') for box in nodes(frame,'dsPicWide')
            for i in box.xpath('.//img[contains(@src,"expansions/")]'))))
        result['datasheetPartitions'][' | '.join(badges)] += 1
        if badges != (SM,):
            continue
        title = norm(nodes(frame,'dsH2Header')[0][0].text_content())
        anchor = frame.getprevious().get('id')
        data = {'title':title,'sourceAnchor':anchor}
        for key, token, prefix in [('keywords','dsLeftСolKW','KEYWORDS:'),
                ('factionKeywords','dsRightСolKW','FACTION KEYWORDS:')]:
            boxes=nodes(frame,token)
            if key=='keywords':
                assert len(boxes)==1
                groups=[n for n in boxes[0] if n.tag=='span' and not has(n,'dsVertLine')]
                data[key]=[norm(s) for s in norm(groups[0].text_content()).split(';') if norm(s)]
                data['keywordScope']='ALL_SOURCE_MODELS'
                declarations=[]
                for sep in [n for n in boxes[0] if has(n,'dsVertLine')]:
                    values=sep.getnext()
                    declarations.append({'modelSourceName':norm(sep.tail or '').rstrip(':'),
                        'keywords':[norm(s) for s in norm(values.text_content()).split(';') if norm(s)],
                        'pointer':values.getroottree().getpath(values),'scope':'SOURCE_NAMED_MODEL'})
                data['modelKeywordDeclarations']=declarations
                result['coverage']['namedModelKeywordDeclarations']+=len(declarations)
            else:
                data[key] = [norm(s) for box in boxes
                    for s in norm(box.text_content()).replace(prefix,'',1).split(';') if norm(s)]
        rows.append(observation('DATASHEET',frame,path,data))
        datasheet_row=rows[-1]
        for panel in nodes(frame,'dsProfileWrap'):
            values = [norm(v.text_content()) for v in nodes(panel,'dsCharValue')]
            assert len(values) == 6, 'Incomplete six-column raw model profile'
            result['coverage']['modelRowsWithOwnHeaders' if nodes(panel,'dsCharName') else 'modelRowsWithoutOwnHeaders'] += 1
            base = next(n for n in panel.iterancestors() if has(n,'dsProfileBaseWrap'))
            names = nodes(base,'dsModelName')
            name = norm(names[0].text_content()) if names else title
            rows.append(observation('MODEL_PROFILE',base,path,
                {'name':name,'stats':dict(zip(['M','T','SV','W','LD','OC'],values))},frame))
        datasheet_row['namedKeywordProfilePointers']=[]
        for declaration in data['modelKeywordDeclarations']:
            candidates=[r for r in rows if r['kind']=='MODEL_PROFILE' and r['ownerPointer']==datasheet_row['pointer']
                and r['data']['name'].casefold()==declaration['modelSourceName'].casefold()]
            declaration['profileBindingStatus']='SOURCE_CONFIRMED' if len(candidates)==1 else 'NOT_PROVEN'
            datasheet_row['namedKeywordProfilePointers'].append(candidates[0]['pointer'] if len(candidates)==1 else None)
        for inv in nodes(frame,'dsInvulWrap'):
            adjacent = inv.getnext()
            comment = text(adjacent) if adjacent is not None and has(adjacent,'dsInvulComment') else ''
            named=bool(comment and not re.search(r'(?i)against .* attacks only',comment))
            rows.append(observation('INVULNERABLE_SAVE',inv,path,{'text':norm(text(inv)+' '+comment),
                'value':norm(nodes(inv,'dsCharInvulValue')[0].text_content()), 'conditionText':comment,
                'scopeQualification':'EXPLICIT_NAMED_MODEL' if named else 'CONDITIONAL_SOURCE_MODEL' if comment else 'DATASHEET_HEADER_SOURCE_PROFILES'},frame))
            profiles = [r for r in rows if r['kind']=='MODEL_PROFILE' and r['ownerPointer']==frame.getroottree().getpath(frame)]
            if named:
                recipient = re.sub(r'^\*\s*|\s+only$','',comment).strip()
                profiles = [p for p in profiles if equivalent(p['data']['name'],recipient)]
                assert profiles, 'Unresolved explicit invulnerable-save source recipient'
            rows[-1]['sourceProfilePointers'] = [p['pointer'] for p in profiles]
        main, = [n for n in frame if has(n,'ds2col') and not has(n,'ShowDatasheetFeatures')]
        for weapon in nodes(main,'dsWeaponRow'):
            cells = weapon.xpath('./td')
            assert len(cells) == 8, 'Unexpected raw weapon shape'
            vals = [norm(c.text_content()) for c in cells[-6:]]
            wd = {'name':norm(nodes(weapon,'dsWeaponName')[0].text_content()),
                **dict(zip(['range','attacks','skill','strength','ap','damage'],vals)),
                'abilities':list(dict.fromkeys(norm(n.text_content()) for n in nodes(weapon,'kwbw')))}
            rows.append(observation('WEAPON_PROFILE',weapon,path,wd,frame))
        for box in nodes(main,'dsCoreArmyValue'):
            declarations = box.xpath('./b/span|./b/a|./span')
            assert declarations, 'Unclassified native source declaration'
            for declaration in declarations:
                rows.append(observation('RULE_REFERENCE',declaration,path,
                    {'label':norm(declaration.text_content()),'scope':'SOURCE_DECLARATION',
                     'recipientBindingStatus':'NOT_EXECUTABLE'},frame))
        for col in main:
            if not any(has(col,c) for c in ['dsLeftColFlat','dsRightColFlat']):
                continue
            for header in [n for n in col if has(n,'dsHeader')]:
                title = norm(header.text_content())
                siblings = []
                for sibling in header.itersiblings():
                    if has(sibling,'dsHeader'):
                        break
                    if nodes(sibling,'dsUnitCostHeader'):
                        continue
                    if text(sibling):
                        siblings.append(sibling)
                rows.append(observation('DATASHEET_SECTION',header,path,
                    {'title':title,'text':norm(text(header)+' '+' '.join(text(n) for n in siblings))},frame))
                if title in ['ABILITIES','PSYCHIC ABILITIES','WARGEAR ABILITIES']:
                    for n in siblings:
                        if has(n,'dsAbility') or has(n,'dsAbility_noLine'):
                            bold = n.xpath('./b[1]|./div[contains(@class,"dsWargearAbilityText")]/b[1]')
                            rows.append(observation('DATASHEET_ABILITY',n,path,
                                {'title':norm(bold[0].text_content()).rstrip(':') if bold else '', 'text':text(n)},frame))
                            if re.search(r'replace this unit.s Leader ability with the Support ability',text(n)):
                                rows.append(observation('SOURCE_RELATION',n,path,
                                    {'role':'CONDITIONAL_ROLE_REPLACEMENT','rawText':text(n)},frame))
                if title == 'WARGEAR OPTIONS':
                    for n in siblings:
                        for li in n.xpath('./li|./ul/li'):
                            rows.append(observation('WARGEAR_OPTION',li,path,{'text':text(li)},frame))
                        for foot in nodes(n,'dsOptionsComment'):
                            rows.append(observation('WARGEAR_OPTION',foot,path,{'text':text(foot)},frame))
                if title == 'UNIT COMPOSITION':
                    for n in siblings:
                        for li in n.xpath('./ul/li'):
                            literal = text(li)
                            match = re.match(r'^(\d+)(?:[-–](\d+))?\s+(.+)$',literal)
                            assert match, 'Unparsed raw composition: '+literal
                            rows.append(observation('COMPOSITION_MEMBER',li,path,{'text':literal,
                                'name':re.sub(r'\s+models?\.?$','',match[3]), 'quantity':{'min':int(match[1]),'max':int(match[2] or match[1])}},frame))
                            member=rows[-1]
                            profiles=[r for r in rows if r['kind']=='MODEL_PROFILE' and r['ownerPointer']==datasheet_row['pointer']]
                            exact=[p for p in profiles if p['data']['name'].casefold()==member['data']['name'].casefold()]
                            target=exact[0] if len(exact)==1 else profiles[0] if len(profiles)==1 else None
                            member['modelProfilePointer']=target['pointer'] if target else None
                            member['data']['profileBindingStatus']='SOURCE_CONFIRMED' if target else 'NOT_PROVEN'
                if title in ['LEADER','SUPPORT','TRANSPORT']:
                    # These are source declarations, never MFM authority.
                    targets = list(dict.fromkeys(a.get('href').split('#',1)[1]
                        for n in siblings for a in n.xpath('.//a[contains(@href,"datasheets.html#")]')))
                    rows.append(observation('SOURCE_RELATION',header,path,{'role':title,
                        'rawText':norm(text(header)+' '+' '.join(text(n) for n in siblings)),
                        'targetSourceAnchors':targets},frame))
    path = RAW/'wahapedia-space-marines-main.html'
    tree = html.parse(str(path))
    army, = tree.xpath('//*[@id="Army-Rules"]')
    region = army.getnext()
    for heading in region.xpath('.//h3|.//h4[@id]'):
        if heading.tag=='h3' and not has(heading,'padHeader'):
            continue
        container = heading.getparent()
        badges = set(heading.xpath('.//img[contains(@src,"expansions/")]/@title'))
        if badges and not badges.issubset(OWNED):
            if badges=={'App. Deathwatch (11th edition)'}:
                result['crossOwnerRows'].append(observation('ARMY_RULE',container,path,
                    {'title':norm(heading.text_content()),'text':text(container)}))
            continue
        rows.append(observation('ARMY_RULE',container,path,
            {'title':norm(heading.text_content()),'text':text(container)}))
    for heading in tree.xpath('//h2'):
        if not has(heading,'outline_header') or not nodes(heading,'dpPts'):
            continue
        badges = tuple(sorted(set(heading.xpath('.//img[contains(@src,"expansions/")]/@title'))))
        result['detachmentPartitions'][' | '.join(badges)] += 1
        owned = not badges or set(badges).issubset(OWNED)
        foreign = badges == ('App. Deathwatch (11th edition)',) and heading.get('id') == 'Deathwatch-Support'
        if not owned and not foreign:
            continue
        target = rows if owned else result['crossOwnerRows']
        container = heading.getparent()
        title = norm(''.join(heading.xpath('./text()')))
        target.append(observation('DETACHMENT',heading,path,{'title':title,
            'sourcePublication':list(badges) or [SM]},None))
        for rule in container.xpath('.//h3'):
            if not has(rule,'padHeader'):
                continue
            box = rule.getparent()
            target.append(observation('DETACHMENT_RULE',box,path,
                {'title':norm(rule.text_content()),'text':text(box)},heading))
            for nested in nodes(box,'blueAbility'):
                b = nested.xpath('./b[1]')
                target.append(observation('DETACHMENT_RULE',nested,path,
                    {'title':norm(b[0].text_content()).rstrip(':') if b else '', 'text':text(nested)},box))
        for label in nodes(container,'EnhancementsPts'):
            cell = next(n for n in label.iterancestors() if n.tag == 'td')
            span, = label.xpath('./li/span[1]')
            name = norm(''.join(span.xpath('./text()')))
            upgrade = bool(nodes(span,'EnhUpgrade'))
            # Only the printed price span is outside this source-text field.
            clone = copy.deepcopy(cell)
            for price in clone.xpath('.//ul[contains(@class,"EnhancementsPts")]/li/span[2]'):
                price.drop_tree()
            value = text(clone)
            target.append(observation('ENHANCEMENT',cell,path,{'title':name,'text':value,
                'itemKind':'UNIT_UPGRADE' if upgrade else 'ENHANCEMENT','scope':'UNIT' if upgrade else 'MODEL'},heading))
            result['coverage']['enhancementListItems'] += sum(len(n.xpath('.//li')) for n in cell if n is not label and not has(n,'ShowFluff'))
        for strat in nodes(container,'str11Wrap'):
            target.append(observation('STRATAGEM',strat,path,
                {'title':norm(nodes(strat,'str11Name')[0].text_content()),
                 'text':text(strat)},heading))
    result['datasheetPartitions'] = dict(result['datasheetPartitions'])
    result['detachmentPartitions'] = dict(result['detachmentPartitions'])
    result['coverage'] = dict(result['coverage'])
    return result


def equivalent(actual, expected):
    if isinstance(expected,str):
        if not isinstance(actual,str):
            return False
        # Formatting may differ; words, numbers, signs and list punctuation may not.
        tokens = lambda s: re.findall(r'[+-]?\d+(?:[-–]\d+)?\+?|\w+|["%/]',s.casefold())
        return tokens(actual) == tokens(expected)
    if isinstance(expected,list):
        return isinstance(actual,list) and len(actual)==len(expected) and all(equivalent(a,b) for a,b in zip(actual,expected))
    if isinstance(expected,dict):
        return isinstance(actual,dict) and all(k in actual and equivalent(actual[k],v) for k,v in expected.items())
    return actual == expected


def census(oracle):
    counts = dict(Counter(r['kind'] for r in oracle['rows']))
    return {'rawDatasheets':oracle['rawDatasheets'], 'ownedRecordsByKind':counts,
        'datasheetPartitions':oracle['datasheetPartitions'],
        'detachmentPartitions':oracle['detachmentPartitions'], 'coverage':oracle['coverage'],
        'crossOwnerRecordsByKind':dict(Counter(r['kind'] for r in oracle['crossOwnerRows']))}


def compare(records, oracle, bindings, addresses, cross_owner=False):
    """Compare every independently found source occurrence and its owner joins."""
    errors = []
    need = lambda ok,msg: errors.append(msg) if not ok else None
    expected = oracle['crossOwnerRows' if cross_owner else 'rows']
    expected_book = 'deathwatch' if cross_owner else 'space-marines'
    ids = {r['sourceEntityId']:r for r in bindings}
    addrs = {r['sourceEntityId']:r for r in addresses}
    for label, values, key in [('record',records,'id'),('source-record',records,'sourceEntityId'),
            ('binding',bindings,'sourceEntityId'),('address',addresses,'sourceEntityId')]:
        need(len({r[key] for r in values})==len(values),'duplicate-'+label)
    by_location = defaultdict(list)
    for r in records:
        p = r.get('provenance',{})
        by_location[(r['kind'],p.get('document'),p.get('pointer'))].append(r)
    used = set()
    observed = {}
    for raw in expected:
        key = (raw['kind'],raw['document'],raw['pointer'])
        candidates = by_location[key]
        # Multiple native declarations share a printed table cell.
        matches = [r for r in candidates if r['id'] not in used and
            equivalent(r.get('data',{}).get('label'),raw['data'].get('label'))] if raw['kind']=='RULE_REFERENCE' else [r for r in candidates if r['id'] not in used]
        if len(matches)!=1:
            errors.append('missing-or-ambiguous-raw-occurrence:'+repr(key))
            continue
        row = matches[0]
        used.add(row['id'])
        observed.setdefault((raw['document'],raw['pointer']),[]).append(row)
        sid = row['sourceEntityId']
        binding,address = ids.get(sid,{}),addrs.get(sid,{})
        need(row.get('bookId')==expected_book,'wrong-book:'+sid)
        need(row['id']==binding.get('id') and row['kind']==binding.get('kind'),'wrong-identity:'+sid)
        need(re.fullmatch(r'sm-source-[0-9a-f]{16}',sid) is not None,'nonopaque-source-identity:'+sid)
        for field,value in raw['data'].items():
            need(equivalent(row.get('data',{}).get(field),value),'wrong-data:'+sid+'/'+field)
        proof = row.get('provenance',{})
        need(proof.get('sourceId')=='space-marines-waha-11e-2026-10-20' and
            proof.get('sha256')==raw['sha256'] and proof.get('authority')=='ACCEPTED_SECONDARY' and
            proof.get('sourceEntityId')==sid,'wrong-provenance:'+sid)
        need(address.get('document')==raw['document'] and address.get('xpath',address.get('pointer'))==raw['pointer'],
            'wrong-bound-address:'+sid)
    need(len(used)==len(records),'extra-or-duplicate-records')
    for raw in expected:
        found = observed.get((raw['document'],raw['pointer']),[])
        for row in [r for r in found if r['kind']==raw['kind']]:
            owners = observed.get((raw['document'],raw['ownerPointer']),[]) if raw['ownerPointer'] else []
            need(row.get('parentId')==(owners[0]['id'] if len(owners)==1 else None),'wrong-owner:'+row['sourceEntityId'])
            if raw['kind']=='INVULNERABLE_SAVE':
                recipients=[observed[(raw['document'],p)][0]['id'] for p in raw['sourceProfilePointers']
                    if len(observed.get((raw['document'],p),[]))==1]
                need(row['data'].get('sourceProfileIds')==recipients,'wrong-invulnerable-source-recipient:'+row['sourceEntityId'])
            if raw['kind']=='DATASHEET':
                declarations=row['data'].get('modelKeywordDeclarations',[])
                for index,p in enumerate(raw['namedKeywordProfilePointers']):
                    matches=observed.get((raw['document'],p),[]) if p else []
                    recipient=matches[0]['id'] if len(matches)==1 else None
                    need(index<len(declarations) and declarations[index].get('sourceProfileId')==recipient,
                        'wrong-named-model-keyword-recipient:'+row['sourceEntityId'])
            if raw['kind']=='COMPOSITION_MEMBER':
                p=raw['modelProfilePointer']
                matches=observed.get((raw['document'],p),[]) if p else []
                recipient=matches[0]['id'] if len(matches)==1 else None
                need(row['data'].get('modelProfileId')==recipient,'wrong-composition-model-profile:'+row['sourceEntityId'])
    fields = {'DATASHEET':{'MODEL_PROFILE':'profileIds','WEAPON_PROFILE':'weaponIds',
        'DATASHEET_SECTION':'sectionIds','DATASHEET_ABILITY':'abilityIds','WARGEAR_OPTION':'wargearOptionIds',
        'RULE_REFERENCE':'ruleReferenceIds','COMPOSITION_MEMBER':'compositionMemberIds',
        'SOURCE_RELATION':'relationIds','INVULNERABLE_SAVE':'invulnerableIds'},
        'DETACHMENT':{'DETACHMENT_RULE':'ruleIds','ENHANCEMENT':'enhancementIds','STRATAGEM':'stratagemIds'},
        'DETACHMENT_RULE':{'DETACHMENT_RULE':'nestedRuleIds'}}
    for row in records:
        for kind,field in fields.get(row['kind'],{}).items():
            children = [r['id'] for r in records if r.get('parentId')==row['id'] and r['kind']==kind]
            listed=row['data'].get(field)
            need(isinstance(listed,list) and len(listed)==len(set(listed)) and set(listed)==set(children),
                'wrong-child-membership:'+row['sourceEntityId']+'/'+field)
        if row['kind']=='RULE_REFERENCE':
            need(row['data'].get('scope')=='SOURCE_DECLARATION','invented-reference-scope:'+row['sourceEntityId'])
    return errors


def load(name,path):
    spec=importlib.util.spec_from_file_location(name,path)
    module=importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def main():
    oracle=raw_oracle()
    result=load('sm_producer',HERE/'build.py').build()
    bindings=read(HERE/'identity-bindings.json')['bindings']
    addresses=read(HERE/'source-bindings.json')['recordAddresses']
    errors=compare(result['base']['entities'],oracle,bindings,addresses)
    errors+=compare(result['cross-owner-references']['entities'],oracle,bindings,addresses,cross_owner=True)
    assert not errors, '\n'.join(errors)
    print(json.dumps({'status':'PASS','independentRawCensus':census(oracle)},ensure_ascii=False,indent=2))


if __name__=='__main__':
    main()

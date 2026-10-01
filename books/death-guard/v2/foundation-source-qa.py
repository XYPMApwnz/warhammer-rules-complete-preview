"""Independent raw DOM/PDF proof for the bounded, previously missing leaves."""
import hashlib,json,re,sys
from pathlib import Path
from lxml import html
import pdfplumber

ROOT=Path(__file__).resolve().parents[3]
ledger=json.loads((ROOT/'books/death-guard/v2/foundation-closure.json').read_text('utf8'))
hub_path='books/death-guard/v2/sources/accepted-waha-pages/death-guard.html'
raw=(ROOT/hub_path).read_bytes();doc=html.fromstring(raw.decode('utf8'))
norm=lambda value:re.sub(r'\s+',' ',value).strip()
intro=doc.get_element_by_id('Introduction').getnext()

def flow(node):
    if 'redDiamondLeft' in (node.get('class')or'').split() or 'hi_custom' in (node.get('class')or'').split():return ''
    value=node.text or ''
    for child in node:
        value+= '\n' if child.tag=='br' else flow(child)
        value+=child.tail or ''
        if child.tag in ['p','li','ul','div']:value+='\n'
    return value

clauses=[norm(x) for x in re.split(r'(?<=[.!?])\s+(?=[A-Z“‘\[0-9])|\s*\n\s*|;\s+',flow(intro)) if norm(x)]
def intro_class(text):
    if text.startswith('Each Detachment is a themed'):return 'NON_GAMEPLAY'
    if text.startswith('If any additional restrictions'):return 'PRESENTATION_METADATA'
    if text.startswith('You can find out more'):return 'SOURCE_NAVIGATION'
    return 'GAMEPLAY_FACT'

expected_intro=[text for text in clauses if 'Crusade' not in text and intro_class(text)=='GAMEPLAY_FACT']
assert len(expected_intro)==6,expected_intro
categories={};ids=set()
for leaf in ledger['leaves']:
    assert leaf['sourceLeafId'] not in ids;ids.add(leaf['sourceLeafId'])
    data=(ROOT/leaf['sourceArtifact']).read_bytes()
    assert hashlib.sha256(data).hexdigest().upper()==leaf['sourceSha256']
    typ=leaf['factType'];category='REFERENCE_METADATA'
    if typ=='BOOK_USAGE_CLAUSE':category=intro_class(leaf['rawValue'])
    elif typ in ['ERRATUM_IDENTITY','ERRATUM_DIRECTIVE','GW_WEAPON_PROFILE_SELECTION_NOTE','GW_WEAPON_PROFILE_SELECTION_SCOPE']:category='GAMEPLAY_FACT'
    assert leaf['classification']==category,(leaf['sourceLeafId'],category)
    assert leaf['justification']
    categories[category]=categories.get(category,0)+1
    if leaf['sourceArtifact'].endswith('.html'):
        locator=re.sub(r'/(href|label|clause\[\d+\])$','',leaf['sourceLocation'])
        nodes=doc.xpath(locator);assert len(nodes)==1,locator
        value=nodes[0].get('href') if typ=='CROSS_REFERENCE_TARGET' else norm(nodes[0].text_content())
        assert leaf['rawValue']==value if typ in ['CROSS_REFERENCE_TARGET','CROSS_REFERENCE_LABEL','ERRATUM_IDENTITY'] else norm(leaf['rawValue']) in value,leaf['sourceLeafId']
assert len(ids)==158
assert categories=={'REFERENCE_METADATA':142,'GAMEPLAY_FACT':13,'NON_GAMEPLAY':1,'PRESENTATION_METADATA':1,'SOURCE_NAVIGATION':1},categories
assert [leaf['rawValue'] for leaf in ledger['leaves'] if leaf['factType']=='BOOK_USAGE_CLAUSE' and leaf['classification']=='GAMEPLAY_FACT']==expected_intro
envelope=doc.xpath('/html/body/div/div[1]/div[3]/div[3]/div[2]')[0]
title=norm(envelope.xpath('./div[@class="errata_H"]')[0].text_content())
body=envelope.xpath('./div[@class="errata"]')[0]
directive=norm(body.text or '')
assert directive=='Change to:'
pdf_path='books/death-guard/v2/sources/gw-death-guard-faction-pack-2026-09-30.pdf'
with pdfplumber.open(ROOT/pdf_path) as pdf:
    p4=norm(pdf.pages[3].extract_text());p7=norm(pdf.pages[6].extract_text())
    assert 'Nurgle’s Gift (see Codex: Death Guard)' in p4
    assert 'that enemy unit is Afflicted (pg 71)' in p7
    left=norm(pdf.pages[6].crop((0,0,310,pdf.pages[6].height)).extract_text())
    assert 'Stinking Mire Stratagem, Target and Effect Sections Change to:' in left
print(json.dumps(dict(categories=categories,introduction=expected_intro,erratum=dict(title=title,directive=directive,text=flow(body).strip()),htmlLeaves=151,printedReferences=2),ensure_ascii=False))

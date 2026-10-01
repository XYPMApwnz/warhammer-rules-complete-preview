"""Independent DOM implementation for source-first Rule Contract QA evidence."""
import hashlib,json,re
from pathlib import Path
from lxml import html
ROOT=Path(__file__).resolve().parents[3]
evidence=json.loads((ROOT/'books/death-guard/v2/rule-contract-source-evidence.json').read_text('utf8'))
hub=ROOT/'books/death-guard/v2/sources/accepted-waha-pages/death-guard.html'
raw=hub.read_bytes();doc=html.fromstring(raw.decode('utf8'))
assert hashlib.sha256(raw).hexdigest().upper()==evidence['stratagems'][0]['sourceProof']['sha256']
def norm(value):
    value=re.sub(r'(^|\s)-\s+',r'\1',value.lower())
    value=re.sub(r'([.!?])\s*',r'\1 ',value)
    return re.sub(r'\s+',' ',value).strip()
def flow(node):
    value=node.text or ''
    for child in node:
        value+='\n' if child.tag=='br' else flow(child)
        value+=child.tail or ''
        if child.tag in ['p','li','ul','div']:value+='\n'
    return value
checked=0
for record in evidence['stratagems']:
    nodes=doc.xpath(record['sourceProof']['rawLocator']);assert len(nodes)==1,record['sourceId']
    body=norm(flow(nodes[0]))
    for clause in record['sourceClauses']:assert norm(clause['text']) in body,(record['sourceId'],clause['label'])
    checked+=1
for record in evidence['enhancementsAndDetachments']:
    nodes=doc.xpath(record['rawLocator']);assert len(nodes)==1,record['id']
    body=norm(flow(nodes[0]))
    assert norm(record['rawText']) in body,(record['id'],record['rawText'],body)
    assert not record['genuineAmbiguity']
    checked+=1
print(json.dumps({'status':'PASS','rawSourceRecords':checked,'genuineSourceAmbiguities':0}))

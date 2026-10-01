"""Independent accepted-source static applicability census. No contract imports.

Default stdout is the re-derived machine-readable inventory. --summary emits
counts only. Source locators/role identifiers are stable identity bindings; all
selector logic and source denominators are recomputed from accepted raw text.
"""
import argparse,collections,copy,hashlib,json,re,sys
from pathlib import Path
from lxml import html
import pdfplumber

sys.stdout.reconfigure(encoding='utf8')
parser=argparse.ArgumentParser()
parser.add_argument('--repo',type=Path)
parser.add_argument('--expectations',type=Path)
parser.add_argument('--summary',action='store_true')
args=parser.parse_args()
here=Path(__file__).resolve()
root=args.repo or next((p for p in here.parents if(p/'books/death-guard/v2/sources/source-enrollment.json').is_file()),None)
if root is None:raise SystemExit('Pass --repo when running outside the repository.')
base=root/'books/death-guard/v2'
expected_path=args.expectations or here.with_name('stratagem-static-source-expectations.json')
expected=json.loads(expected_path.read_text(encoding='utf8'))
source_path=root/'books/death-guard/v2/sources/accepted-waha-pages/death-guard.html'
source_bytes=source_path.read_bytes()
assert hashlib.sha256(source_bytes).hexdigest()==expected['acceptedHubSha256'],'accepted source byte identity changed'
hub=html.fromstring(source_bytes.decode('utf8'))
norm=lambda t:re.sub(r'\s+',' ',t).strip()
keyword_names=['DEATH GUARD','VEHICLE','MONSTER','CHARACTER','INFANTRY','BIOLOGUS PUTRIFIER','NURGLINGS','PLAGUE LEGIONS','POXWALKERS','TERMINATOR','LORD OF VIRULENCE','CONTAGION ENGINE','PLAGUE MARINES','AIRCRAFT']
def keywords(text):
 # Plural prose names denote the same published singular keyword identity.
 text=re.sub(r'\bVEHICLES\b','VEHICLE',re.sub(r'\bMONSTERS\b','MONSTER',text))
 return[k for k in keyword_names if re.search(r'(?<![A-Z])'+re.escape(k)+r'(?![A-Z])',text)]
def atom(subject,k):return{'predicate':'MODEL_KEYWORD'if subject=='MODEL'else'UNIT_KEYWORD','subject':subject,'contextLevel':'STATIC','arguments':{'keyword':k}}
def logic(op,subject,*children):return{'op':op,'subject':subject,'args':list(children)}
def selector(subject,kw):
 a=[atom(subject,k)for k in kw]
 return a[0]if len(a)==1 else logic('ALL',subject,*a)if a else{'predicate':'ALWAYS','subject':subject,'contextLevel':'STATIC','arguments':{}}
def subject(text):
 return'FORMED_ATTACHED_UNIT'if'Attached unit'in text and'not an Attached unit'not in text else'UNIT'if re.search(r'\bunit\b',text)else'MODEL'
def strip_proof(n):
 if isinstance(n,list):return[strip_proof(x)for x in n]
 if not isinstance(n,dict):return n
 return{k:strip_proof(v)for k,v in n.items()if k!='evidence'}
def semantic(n):
 n=strip_proof(n)
 if isinstance(n,list):return[semantic(x)for x in n]
 if not isinstance(n,dict):return n
 n={k:semantic(v)for k,v in n.items()}
 if n.get('op')in['ALL','ANY']:n['args']=sorted(n['args'],key=lambda x:json.dumps(x,sort_keys=True))
 return n
def atoms(n):
 if isinstance(n,list):return[a for x in n for a in atoms(x)]
 if not isinstance(n,dict):return[]
 if 'predicate'in n:return[n]
 return[a for v in n.values()for a in atoms(v)]

# Expected records hold only reviewed stable role/participant bindings during
# derivation. Their selector bodies are checked afterward as regression claims.
def category(r):
 f=r['sourceField'];p=r['participant']
 if f=='TARGET':return'PRIMARY'if'primary target' in p else'SECONDARY'
 if f=='WHEN':return'WHEN_ENEMY_EXCLUSION'if'enemy initial' in p else'WHEN_PRIMARY_REFERENCE'
 if'current primary-unit model attack'in p:return'EFFECT_ATTACK_TARGET_EXCLUSION'
 if'prospective Bodyguard'in p:return'EFFECT_ATTACH_RECIPIENT'
 if'all Plagues'in p:return'EFFECT_SELECTED_ENEMY_EXCLUSION'
 if'identical to primary'in p:return'EFFECT_IDENTICAL_UNIT'
 if'Plague Legions anchor'in p:return'EFFECT_ENGAGED_ANCHOR'
 if'friendly unit making ranged attacks'in p:return'EFFECT_FRIENDLY_ATTACKS'
 if'primary Death Guard target'in p:return'EFFECT_PRIMARY_REFERENCE'
 if'secondary shield target'in p:return'EFFECT_SECONDARY_REFERENCE'
 raise AssertionError(('unclassified reviewed participant binding',r))
bindings={(r['ruleId'],r['sourceField'],category(r)):r for r in expected['records']}
assert len(bindings)==len(expected['records'])
by_locator={r['sourceLocator'].split('#',1)[1]:r for r in expected['rules']}
assert len(by_locator)==len(expected['rules'])
scope_addresses={'DG:1001','DG:41','DG:5','DG:201','DG:101','DG:11','DG:9','DG:21','DG:81'}
sections=[node for node in hub.xpath('//div[@id="wahMainContent"]/div[@data-f]')if node.get('data-f')in scope_addresses]
assert {node.get('data-f')for node in sections}==scope_addresses,'accepted matched-play source scope changed'
for locator in by_locator:
 head=hub.xpath('//*[@id=$locator]',locator=locator);assert len(head)==1,('missing/duplicate source locator',locator)
 section=next(p for p in head[0].iterancestors()if p.tag=='div'and p.get('data-f'))
 assert section in sections,'reviewed identity is outside the accepted matched-play source scope'
rules=[];records=[];roster_components=[]
def emit(rule,field,mode,sub,sel,static=()):
 key=(rule['ruleId'],field,mode);binding=bindings[key]
 record=copy.deepcopy(binding)
 record.update(sourceQuote=rule['fields'][field],subject=sub,selector=sel,expectedContext='STATIC')
 if static:record['staticConditions']=list(static)
 else:record.pop('staticConditions',None)
 assert semantic(record['selector'])==semantic(binding['selector']),(key,'reviewed selector contradicts independently derived raw source')
 assert record.get('staticConditions',[])==binding.get('staticConditions',[]),(key,'reviewed STATIC conditions differ')
 assert record['subject']==binding['subject']
 records.append(record)
for section in sections:
 for card in section.xpath('.//*[contains(concat(" ",normalize-space(@class)," ")," str11Wrap ")]'):
  head=card.xpath('.//*[contains(concat(" ",normalize-space(@class)," ")," str11Name ")]')[0]
  bound=by_locator[head.get('id')]
  body=norm(' '.join(card.xpath('.//div[@class="str11Text"]')[0].itertext()))
  fields={};markers=list(re.finditer(r'(WHEN|TARGET|EFFECT|RESTRICTIONS):\s*',body))
  for i,mark in enumerate(markers):fields[mark.group(1)]=body[mark.end():markers[i+1].start()if i+1<len(markers)else len(body)].strip()
  assert fields==bound['fields'],'reviewed source field snapshot changed'
  rule={**bound,'fields':fields};rules.append(rule)
  pieces=re.split(r', and one friendly ',fields['TARGET'],maxsplit=1)
  main=pieces[0];sub=subject(main);prefix=main.split(' that ',1)[0];kw=keywords(prefix)
  primary_sel=selector(sub,kw)
  if re.search(r'VEHICLE or DEATH GUARD MONSTER',prefix):primary_sel=logic('ALL',sub,atom(sub,'DEATH GUARD'),logic('ANY',sub,atom(sub,'VEHICLE'),atom(sub,'MONSTER')))
  static=[]
  if'with the Deadly Demise ability'in main:static=[{'predicate':'MODEL_ABILITY','subject':'MODEL','contextLevel':'STATIC','arguments':{'ability':'Deadly Demise'}}]
  emit(rule,'TARGET','PRIMARY',sub,primary_sel,static)
  if len(pieces)>1:emit(rule,'TARGET','SECONDARY','UNIT',selector('UNIT',keywords(pieces[1].split(' within ',1)[0])))
  when=fields['WHEN'];effect=fields['EFFECT']
  if main.startswith('That '):emit(rule,'WHEN','WHEN_PRIMARY_REFERENCE',sub,selector(sub,keywords(when)))
  exc=re.search(r'enemy unit \(excluding ([^)]+)\)',when)
  if exc:emit(rule,'WHEN','WHEN_ENEMY_EXCLUSION','UNIT',logic('ALL','UNIT',*[logic('NOT','UNIT',atom('UNIT',k))for k in keywords(exc.group(1))]))
  # Source-explicit effect participants. Neither effect timing/state conditions
  # nor returned/granted weapon keywords are promoted into intrinsic selectors.
  exc=re.search(r'attack that targets (?:a visible |an )enemy unit \(excluding ([^)]+)\)',effect)
  if exc:
   terms=[logic('NOT','UNIT',atom('UNIT',k))for k in keywords(exc.group(1))]
   emit(rule,'EFFECT','EFFECT_ATTACK_TARGET_EXCLUSION','UNIT',terms[0]if len(terms)==1 else logic('ALL','UNIT',*terms))
  exc=re.search(r'Select one enemy unit \(excluding ([^)]+)\)',effect)
  if exc:emit(rule,'EFFECT','EFFECT_SELECTED_ENEMY_EXCLUSION','UNIT',logic('NOT','UNIT',atom('UNIT',keywords(exc.group(1))[0])))
  m=re.search(r'Select one other friendly (.*?) unit',effect)
  if m:emit(rule,'EFFECT','EFFECT_ATTACH_RECIPIENT','UNIT',selector('UNIT',keywords(m.group(1))))
  m=re.search(r'each time a (.*?) unit from your army selects that enemy unit',effect)
  if m:emit(rule,'EFFECT','EFFECT_FRIENDLY_ATTACKS','UNIT',selector('UNIT',keywords(m.group(1))))
  m=re.search(r'within Engagement Range of one or more (.*?) units from your army',effect)
  if m:emit(rule,'EFFECT','EFFECT_ENGAGED_ANCHOR','UNIT',selector('UNIT',keywords(m.group(1))))
  if'Add a new unit to your army identical to your destroyed unit'in effect:emit(rule,'EFFECT','EFFECT_IDENTICAL_UNIT','UNIT',selector('UNIT',kw))
  if len(pieces)>1:
   for text,mode in [(pieces[0],'EFFECT_PRIMARY_REFERENCE'),(pieces[1],'EFFECT_SECONDARY_REFERENCE')]:
    kw_ref=keywords(text.split(' that ',1)[0].split(' within ',1)[0]);phrase='your '+' '.join(kw_ref)+' unit'
    assert phrase in effect,(rule['ruleId'],'compound effect co-reference lost')
    emit(rule,'EFFECT',mode,'UNIT',selector('UNIT',kw_ref))
  if'includes two CHARACTER models'in main:
   roster_components.append({'ruleId':rule['ruleId'],'sourceField':'TARGET','context':'ROSTER','intrinsicComponent':'CHARACTER MODEL class','semantics':'exactly two CHARACTER models contained in the target unit'})
  if'Attached units that already have two Leader units or one of your CHARACTER units leading it'in effect:
   roster_components.append({'ruleId':rule['ruleId'],'sourceField':'EFFECT','context':'ROSTER','intrinsicComponent':'friendly CHARACTER Leader class','semantics':'existing attachment/Leader relationship exclusion, not STATIC exclusion of all CHARACTER units'})
assert len(records)==len(bindings)and{r['sourceLocator']for r in rules}=={r['sourceLocator']for r in expected['rules']},'source census coverage changed'

# Re-read pinned current official documents, verifying their bytes and current
# supplement/erratum selector text without consulting any generated contracts.
enrollment=json.loads((base/'sources/source-enrollment.json').read_text(encoding='utf8'))
official=next(s for s in enrollment['sources']if s['id']=='gw-death-guard-faction-pack-v1.3-2026-09-30')
universal=next(s for s in enrollment['sources']if s['id']=='gw-universal-rules-updates-v1.1-2026-08-26')
for pin in[official,universal]:assert hashlib.sha256((root/pin['path']).read_bytes()).hexdigest().upper()==pin['sha256']
def semnorm(t):
 t=t.replace('\u2011','-').replace('\u2010','-').replace('\u2019',"'").replace('▪',' ').replace('•',' ')
 return re.sub(r'\s+([.,:;)])',r'\1',norm(t)).casefold()
official_checks=0
with pdfplumber.open(root/official['path'])as pdf:
 for stub,page in[('contagion-engines',2),('flyblown-host',3),('paragons-of-putrescence',4)]:
  p=pdf.pages[page-1];text=semnorm(p.crop((p.width/2,0,p.width,p.height)).extract_text())
  for rule in rules:
   if rule['detachmentId']!='detachment-'+stub:continue
   for field in['WHEN','TARGET','EFFECT']:
    assert semnorm(rule['fields'][field])in text,(rule['ruleId'],field,'stronger official selector clause mismatch');official_checks+=1
 p=pdf.pages[6];text=semnorm(p.crop((0,0,p.width/2,p.height)).extract_text())
 erratum=next(r for r in rules if r['sourceLocator'].endswith('#STINKING-MIRE'))
 for field in['TARGET','EFFECT']:assert semnorm(erratum['fields'][field])in text;official_checks+=1
with pdfplumber.open(root/universal['path'])as pdf:
 text=semnorm(pdf.pages[0].extract_text())
 replacements=[r for r in rules if'Add a new unit to your army identical to your destroyed unit'in r['fields']['EFFECT']]
 for rule in replacements:assert semnorm(rule['fields']['RESTRICTIONS'])in text;official_checks+=1

canonical_roles={}
for record in records:
 for role_id in record['compareRoleIds']:canonical_roles[(record['ruleId'],role_id)]=[record['selector']]+record.get('staticConditions',[])
all_atoms=[a for record in records for a in atoms([record['selector']]+record.get('staticConditions',[]))]
counts={'stratagemsScanned':len(rules),'sourceStaticRecords':len(records),'targetRecords':sum(r['sourceField']=='TARGET'for r in records),'whenRecords':sum(r['sourceField']=='WHEN'for r in records),'effectRecords':sum(r['sourceField']=='EFFECT'for r in records),'sourceStaticAtomOccurrences':len(all_atoms),'intrinsicKeywordAtomOccurrences':sum(a['predicate'].endswith('_KEYWORD')for a in all_atoms),'intrinsicAbilityAtomOccurrences':sum(a['predicate']=='MODEL_ABILITY'for a in all_atoms),'canonicalRoleBindings':len(canonical_roles),'canonicalRoleStaticAtoms':sum(len(atoms(s))for s in canonical_roles.values()),'rosterRelationshipsWithIntrinsicComponents':len(roster_components),'officialFieldChecks':official_checks,'unresolved':0}
result={**expected,'rules':rules,'records':records,'derivedRosterRelationshipComponents':roster_components,'totals':counts,'oracle':'RAW_ACCEPTED_HTML_AND_CURRENT_GW_PDF_REDERIVED_EACH_RUN','generatedContractReads':0,'producerReads':0}
print(json.dumps(counts if args.summary else result,ensure_ascii=False,indent=2))

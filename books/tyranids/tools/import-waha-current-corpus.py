from __future__ import annotations
import hashlib,importlib.util,json,re,sys,tempfile
from copy import deepcopy
from pathlib import Path
from lxml import html
REPO=Path(__file__).resolve().parents[3]
spec=importlib.util.spec_from_file_location('am_importer',REPO/'books/adeptus-mechanicus/tools/import-waha-current-corpus.py')
am=importlib.util.module_from_spec(spec);spec.loader.exec_module(am)
dg=am.dg
norm,text,slug,sha=dg.norm,dg.text,dg.slug,dg.sha
BASE='https://wahapedia.ru/wh40k11ed/factions/tyranids/'

def strip_rule_container(node):
 c=deepcopy(node)
 for bad in c.xpath('.//*[contains(concat(" ",normalize-space(@class)," ")," faqErrataSpoiler ")]|.//h2|.//h3'):
  p=bad.getparent()
  if p is not None:
   tail=bad.tail or ''; prev=bad.getprevious()
   if prev is not None: prev.tail=(prev.tail or '')+tail
   else: p.text=(p.text or '')+tail
   p.remove(bad)
 return text(c)

def parse_army_rule(document,heading_id,title):
 h=document.xpath(f'//*[@id="{heading_id}"]')[0]
 container=h.getparent()
 value=strip_rule_container(container)
 comp={'sourceId':f'army-rule-{slug(title)}:definition','title':title,'text':value}
 rec={'sourceId':f'army-rule-{slug(title)}','class':'ARMY_RULE','title':title,'components':[comp]}
 rec['normalizedContentFingerprint']=sha(rec)
 return rec

def parse_hub(path):
 raw=path.read_text(encoding='utf-8')
 with tempfile.NamedTemporaryFile('w',suffix='.html',encoding='utf-8',delete=False) as tmp:
  tmp.write(raw.replace('</body>','<div><span id="Doctrina-Imperatives"></span><div></div></div></body>')); fake=Path(tmp.name)
 try: hub=am.parse_hub(fake)
 finally: fake.unlink(missing_ok=True)
 document=html.fromstring(raw)
 hub['armyRules']=[parse_army_rule(document,'Synapse','Synapse'),parse_army_rule(document,'Shadow-in-the-Warp','Shadow in the Warp')]
 hub['errata']=[x for x in hub['errata'] if x['class']=='ERRATA' and x['title']!='Cult Ambush']
 seen={(x['title'],x['text']) for x in hub['errata']}
 faq_heading=document.xpath('//*[@id="FAQ"]')[0];faq_holder=faq_heading.getnext()
 for table in faq_holder.xpath('.//div[contains(concat(" ",normalize-space(@class)," ")," faq ")]//table'):
  q=table.xpath('.//tr[contains(@class,"faq_Q_line")]/td[2]'); a=table.xpath('.//td[contains(@class,"faq_A")]/following-sibling::td[1]')
  if not q or not a: continue
  pair=(text(q[0]),text(a[0]))
  if any(norm(pair[0])==norm(x[0]) for x in seen): continue
  seen.add(pair);hub['errata'].append({'sourceId':f'faq-{sum(x["class"]=="FAQ" for x in hub["errata"])+1}','class':'FAQ','title':pair[0],'text':pair[1]})
 for idx,x in enumerate(hub['errata'],1): x['sourceId']=('faq-' if x['class']=='FAQ' else 'errata-')+str(idx)
 return hub

def parse_datasheet(path,url):
 record=dg.parse_datasheet(path,url)
 document=html.fromstring(path.read_bytes()); frame=document.xpath('//div[contains(concat(" ",normalize-space(@class)," ")," dsOuterFrame ") and contains(concat(" ",normalize-space(@class)," ")," datasheet ")]')[0]
 main=frame.xpath('./div[contains(concat(" ",normalize-space(@class)," ")," ds2col ") and not(contains(@class,"ShowDatasheetFeatures"))]')[0]
 # Source profiles retain distinct current model rows even when multiple canonical
 # model identities legitimately share one source statline.
 keys=['M','T','SV','W','LD','OC'];profiles=[]
 for order,base in enumerate(frame.xpath('.//*[contains(concat(" ",normalize-space(@class)," ")," dsProfileBaseWrap ")]'),1):
  wrap=base.xpath('./div[contains(concat(" ",normalize-space(@class)," ")," dsProfileWrapLeft ")]//div[contains(concat(" ",normalize-space(@class)," ")," dsProfileWrap ")]')
  if not wrap: continue
  values=[norm(x.text_content()) for x in wrap[0].xpath('./div[contains(concat(" ",normalize-space(@class)," ")," dsCharWrap ")]//*[contains(concat(" ",normalize-space(@class)," ")," dsCharValue ")]')]
  right=base.xpath('./div[contains(concat(" ",normalize-space(@class)," ")," dsProfileWrapRight ")]')
  name=re.sub(r'\s*\([^)]*\)\s*$','',norm(right[0].text_content()) if right else record['title']) or record['title']
  stats=dict(zip(keys,values[:6])); inv=base.xpath('.//*[contains(concat(" ",normalize-space(@class)," ")," dsCharInvulValue ")]')
  if inv:stats['INSV']=norm(inv[0].text_content())
  profiles.append({'sourceId':f"{record['sourceId']}:profile:{order}",'order':order,'name':name,'stats':stats})
 record['profiles']=profiles
 if profiles: record['statline']=profiles[0]['stats']
 # Each explicitly presented Core/Army rule identity is a separate reference.
 refs=[]
 for cell in main.xpath('.//td[contains(concat(" ",normalize-space(@class)," ")," dsCoreArmyValue ")]'):
  candidates=cell.xpath('./b/span[contains(@class,"tooltip")]') or cell.xpath('./span[contains(@class,"tooltip")]')
  if not candidates:
   candidates=[x for x in re.split(r'\s*,\s*',norm(cell.text_content())) if x]
  for candidate in candidates:
   label=norm(candidate.text_content()) if hasattr(candidate,'text_content') else candidate
   if label:refs.append({'sourceId':f"{record['sourceId']}:rule-reference:{len(refs)+1}",'order':len(refs)+1,'label':label})
 record['ruleReferences']=refs
 # Preserve model-scoped keyword identity instead of flattening it globally.
 box=frame.xpath('./div[contains(concat(" ",normalize-space(@class)," ")," ds2colKWFlat ")]')
 if box:
  left=box[0].xpath('./div[1]');right=box[0].xpath('./div[2]')
  if left:
   lc=deepcopy(left[0]);vert=lc.xpath('.//*[contains(concat(" ",normalize-space(@class)," ")," dsVertLine ")]')
   if vert:vert[0].tail=' SCOPEBREAK '+(vert[0].tail or '')
   raw=norm(lc.text_content())
  else:raw=''
  raw=re.sub(r'^KEYWORDS(?:\s*(?:–|-)\s*ALL MODELS)?\s*:\s*','',raw,flags=re.I)
  groups=[]
  # A model-scoped suffix is separated from the all-model list by the first
  # plain-text colon after the ALL MODELS prefix.
  scoped=re.search(r'\s*SCOPEBREAK\s+([A-Z][A-Z \-]+):\s*(.+)$',raw)
  common=raw[:scoped.start()].strip() if scoped else raw
  groups.append({'scope':'ALL MODELS','keywords':[norm(x) for x in re.split(r'[;,]',common) if norm(x)]})
  if scoped:groups.append({'scope':norm(scoped.group(1)),'keywords':[norm(x) for x in re.split(r'[;,]',scoped.group(2)) if norm(x)]})
  record['keywordGroups']=groups;record['keywords']=groups[0]['keywords']+[f"{g['scope']}: {x}" for g in groups[1:] for x in g['keywords']]
  rr=norm(right[0].text_content()) if right else '';rr=re.sub(r'^FACTION KEYWORDS:\s*','',rr,flags=re.I);record['factionKeywords']=[norm(x) for x in re.split(r'[;,]',rr) if norm(x)]
 # Keep accepted option comments and exclude MFM points widgets from composition.
 for section in record['sections']:
  if section['title'].upper()=='UNIT COMPOSITION':section['blocks']=[b for b in section['blocks'] if not b['text'].upper().startswith('YOUR ')]
 for comment in main.xpath('.//*[contains(concat(" ",normalize-space(@class)," ")," dsOptionsComment ")]'):
  value=text(comment)
  if value:record['wargearOptions'].append({'sourceId':f"{record['sourceId']}:wargear:{len(record['wargearOptions'])+1}",'order':len(record['wargearOptions'])+1,'text':value})
 known={s['title'].upper() for s in record['sections']}
 for header in main.xpath('.//div[contains(concat(" ",normalize-space(@class)," ")," dsHeader ")]'):
  heading=norm(header.text_content()).upper()
  if heading not in {'LED BY','HUNTER ORGANISM'} or heading in known: continue
  blocks=[]; sib=header.getnext()
  while sib is not None and 'dsHeader' not in (sib.get('class') or '').split():
   value=text(sib)
   if value: blocks.append({'text':value,'wargearAbility':False})
   sib=sib.getnext()
  record['sections'].append({'sourceId':f"{record['sourceId']}:section:{len(record['sections'])+1}",'order':len(record['sections'])+1,'title':norm(header.text_content()),'blocks':blocks})
 record['normalizedContentFingerprint']=sha(record)
 return record

def main(src,out):
 src=Path(src); manifest=json.loads((src/'pages.json').read_text(encoding='utf-8-sig')); hub_path=src/'tyranids.html'; hub=parse_hub(hub_path); pages=[dg.page_source_record(hub_path,BASE)]; datasheets=[]
 for order,info in enumerate(manifest,1):
  p=src/info['file']; r=parse_datasheet(p,info['url']);r['sourceOrder']=order;datasheets.append(r);pages.append(dg.page_source_record(p,info['url']))
 inv={'armyRule':len(hub['armyRules']),'errata':len(hub['errata']),'detachment':len(hub['detachments']),'detachmentRule':sum(bool(x['rule']['text']) for x in hub['detachments']),'enhancement':sum(len(x['enhancements']) for x in hub['detachments']),'stratagem':sum(len(x['stratagems']) for x in hub['detachments']),'datasheet':len(datasheets),'statline':sum(len(x['profiles']) for x in datasheets),'statCharacteristic':sum(sum(len(p['stats']) for p in x['profiles']) for x in datasheets),'weaponProfile':sum(len(x['weapons']) for x in datasheets),'wargearOption':sum(len(x['wargearOptions']) for x in datasheets),'datasheetSection':sum(len(x['sections']) for x in datasheets),'datasheetSectionBlock':sum(sum(len(s['blocks']) for s in x['sections']) for x in datasheets),'ruleReference':sum(len(x['ruleReferences']) for x in datasheets)+len(hub['references']),'keywordOccurrence':sum(len(x['keywords'])+len(x['factionKeywords']) for x in datasheets)}
 corpus={'schema':'wh40k-waha-tyranids-corpus/v1','edition':'11E','captureDate':'2026-09-27','currentnessCutoff':'2026-09-27','scope':{'included':['current Faction Pack 11E v1.2','52 non-Legends current datasheets'],'excluded':['5 Legends datasheets','10E Boarding Actions','10E Crusade']},'pages':pages,'inventory':inv,'gameplayUnits':sum(inv.values()),**hub,'datasheets':datasheets};corpus['corpusFingerprint']=sha({k:v for k,v in corpus.items() if k not in {'pages','corpusFingerprint'}});Path(out).write_text(json.dumps(corpus,ensure_ascii=False,indent=2)+'\n',encoding='utf-8');print(json.dumps({'pages':len(pages),'inventory':inv,'gameplayUnits':sum(inv.values()),'fingerprint':corpus['corpusFingerprint']},indent=2))
if __name__=='__main__':main(sys.argv[1],sys.argv[2])




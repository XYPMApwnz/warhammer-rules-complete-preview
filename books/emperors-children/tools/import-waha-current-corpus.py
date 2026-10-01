from __future__ import annotations
import importlib.util,json,re,sys
from copy import deepcopy
from pathlib import Path
from lxml import html

REPO=Path(__file__).resolve().parents[3]
spec=importlib.util.spec_from_file_location('am_importer',REPO/'books/adeptus-mechanicus/tools/import-waha-current-corpus.py')
am=importlib.util.module_from_spec(spec);spec.loader.exec_module(am)
dg=am.dg
norm,text,slug,sha=dg.norm,dg.text,dg.slug,dg.sha
BASE='https://wahapedia.ru/wh40k11ed/factions/emperor-s-children/'

def identity_text(value):
 return norm(value).replace('’',"'").replace('‘',"'").replace('о','o').replace('О','O')

def strip_rule_container(node):
 c=deepcopy(node)
 for bad in c.xpath('.//*[contains(concat(" ",normalize-space(@class)," ")," faqErrataSpoiler ")]|.//h2|.//h3'):
  p=bad.getparent()
  if p is not None:
   tail=bad.tail or '';prev=bad.getprevious()
   if prev is not None:prev.tail=(prev.tail or '')+tail
   else:p.text=(p.text or '')+tail
   p.remove(bad)
 return text(c)

def parse_army_rule(document,heading_id,title):
 nodes=document.xpath(f'//*[@id="{heading_id}"]')
 if len(nodes)!=1:raise ValueError(f'expected one {title} heading, got {len(nodes)}')
 value=strip_rule_container(nodes[0].getparent())
 component={'sourceId':f'army-rule-{slug(title)}:definition','title':title,'text':value}
 record={'sourceId':f'army-rule-{slug(title)}','class':'ARMY_RULE','title':title,'components':[component]}
 record['normalizedContentFingerprint']=sha(record)
 return record

def parse_hub(path):
 document=html.fromstring(path.read_text(encoding='utf-8'))
 dispositions=[]
 for order,node in enumerate(document.xpath('//label[contains(concat(" ",normalize-space(@class)," ")," DetFilterItem ") and @data-f and not(contains(@class,"dropShowBoardingActions"))]'),1):
  image=node.xpath('.//img[contains(@class,"detFD")]');fd=norm(image[0].get('title') or '').replace('Force Disposition:','').strip() if image else ''
  title=identity_text(node.get('data-det-name'))
  dispositions.append({'sourceId':f'detachment-{slug(title)}','order':order,'title':title,'filterId':node.get('data-f'),'detachmentCode':node.get('data-det-code'),'detachmentPoints':int(node.get('data-dp-base')),'forceDisposition':fd})
 if len(dispositions)!=10:raise ValueError(f'expected 10 current detachments, got {len(dispositions)}')
 detachments=[]
 for meta in dispositions:
  exact=[h for h in document.xpath('//h2[contains(@class,"outline_header")]') if identity_text(''.join(h.itertext())).startswith(meta['title'])]
  if not exact:raise ValueError(f'missing detachment heading {meta["title"]}')
  nodes=[];n=exact[0].getnext()
  while n is not None:
   if n.tag=='h2' and 'outline_header' in (n.get('class') or '').split():break
   nodes.append(n);n=n.getnext()
  holder=html.Element('div')
  for n in nodes:holder.append(deepcopy(n))
  rule_h=holder.xpath('.//h2[starts-with(@id,"Detachment-Rule")]');rule_title='';rule_text='';rule_tables=[]
  if rule_h:
   h3=rule_h[0].xpath('following::h3[1]')
   if h3:
    rule_title=norm(h3[0].text_content());container=deepcopy(h3[0].getparent())
    for faq in container.xpath('.//*[contains(concat(" ",normalize-space(@class)," ")," faqErrataSpoiler ")]'):
     faq.getparent().remove(faq)
    for h in container.xpath('.//h2|.//h3'):
     p=h.getparent();tail=h.tail or '';prev=h.getprevious()
     if prev is not None:prev.tail=(prev.tail or '')+tail
     else:p.text=(p.text or '')+tail
     p.remove(h)
    rule_text=text(container)
    for order,table in enumerate(container.xpath('.//table'),1):
     rows=[[norm(c.text_content()) for c in row.xpath('./th|./td')] for row in table.xpath('.//tr')]
     rule_tables.append({'sourceId':f'{meta["sourceId"]}:rule:table:{order}','rows':[r for r in rows if r]})
  enhancements=[];eh=holder.xpath('.//h2[starts-with(@id,"Enhancements")]')
  if eh:
   n=eh[0].getnext();order=0
   while n is not None and n.tag!='h2':
    names=n.xpath('.//ul[contains(@class,"EnhancementsPts")]/li/span[1]');prices=n.xpath('.//ul[contains(@class,"EnhancementsPts")]/li/span[2]')
    if names:
     order+=1;paras=n.xpath('.//p[not(contains(@class,"ShowFluff"))]');title=norm(''.join(names[0].xpath('./text()'))) or norm(names[0].text_content())
     enhancements.append({'sourceId':f'{meta["sourceId"]}:enhancement:{order}','order':order,'title':title,'wahaPoints':norm(prices[0].text_content()) if prices else '','text':'\n'.join(text(p) for p in paras if text(p))})
    n=n.getnext()
  stratagems=[]
  for order,w in enumerate(holder.xpath('.//div[contains(concat(" ",normalize-space(@class)," ")," str11Wrap ") and not(contains(@class,"sShowBoardingActions"))]'),1):
   name=w.xpath('.//*[contains(concat(" ",normalize-space(@class)," ")," str11Name ")]');cp=w.xpath('.//*[contains(concat(" ",normalize-space(@class)," ")," str11CP ")]');kind=w.xpath('.//*[contains(concat(" ",normalize-space(@class)," ")," str11Type ")]');legend=w.xpath('.//*[contains(concat(" ",normalize-space(@class)," ")," str11Legend ")]');body=w.xpath('.//*[contains(concat(" ",normalize-space(@class)," ")," str11Text ")]')
   if not name or not body:continue
   clone=deepcopy(body[0])
   for sub in clone.xpath('.//*[contains(concat(" ",normalize-space(@class)," ")," faqErrataStrat ")]'):sub.getparent().remove(sub)
   value=text(clone);matches=list(re.finditer(r'(?i)(WHEN|TARGET|EFFECT|RESTRICTIONS?):\s*',value));lines=[]
   for i,match in enumerate(matches):lines.append({'label':match.group(1).upper(),'text':norm(value[match.end():matches[i+1].start() if i+1<len(matches) else len(value)])})
   stratagems.append({'sourceId':f'{meta["sourceId"]}:stratagem:{order}','order':order,'title':norm(name[0].text_content()),'cp':norm(cp[0].text_content()) if cp else '','category':norm(kind[0].text_content()) if kind else '','flavor':text(legend[0]) if legend else '','lines':lines})
  det={**meta,'class':'DETACHMENT','rule':{'sourceId':f'{meta["sourceId"]}:rule','title':rule_title,'text':rule_text,'tables':rule_tables},'enhancements':enhancements,'stratagems':stratagems};det['normalizedContentFingerprint']=sha(det);detachments.append(det)
 army_rules=[parse_army_rule(document,'Thrill-Seekers','Thrill Seekers'),parse_army_rule(document,'Pact-of-Excess','Pact of Excess')]
 errata=[];seen=set()
 for wrap in document.xpath('//*[contains(concat(" ",normalize-space(@class)," ")," faqErrataSpoiler ")]'):
  for head,body in zip(wrap.xpath('.//*[contains(concat(" ",normalize-space(@class)," ")," errata_H ")]'),wrap.xpath('.//*[contains(concat(" ",normalize-space(@class)," ")," errata ")]')):
   pair=(text(head),text(body))
   if pair in seen or pair[0].startswith('13.09'):continue
   seen.add(pair);errata.append({'sourceId':f'errata-{len(errata)+1}','class':'ERRATA','title':pair[0],'text':pair[1]})
 faq_seen=set()
 for table in document.xpath('//div[contains(concat(" ",normalize-space(@class)," ")," faq ")]//table'):
  q=table.xpath('.//tr[contains(@class,"faq_Q_line")]/td[2]');a=table.xpath('.//td[contains(@class,"faq_A")]/following-sibling::td[1]')
  if q and a:
   pair=(text(q[0]),text(a[0]))
   if pair in faq_seen:continue
   faq_seen.add(pair);errata.append({'sourceId':f'faq-{len(faq_seen)}','class':'FAQ','title':pair[0],'text':pair[1]})
 refs=[];root=document.xpath('//div[@id="wrapper"]') or [document]
 for a in root[0].xpath('.//a[@href]'):
  label,href=norm(a.text_content()),norm(a.get('href') or '')
  if label and href and ('/wh40k11ed/' in href or href.startswith('#')):refs.append({'sourceId':f'hub-reference:{len(refs)+1}','label':label,'href':href})
 return {'armyRules':army_rules,'detachments':detachments,'errata':errata,'references':refs}

EXTRA_SECTIONS={'LED BY','LEADER','SUPPORT','SUPPORTED BY','TRANSPORT','SUPREME COMMANDER','DAEMON PRIMARCH OF SLAANESH','LORD OF THE HOST','DRONES','MARKER DRONE','GUARDIAN DRONE','TURRET','HUNTER CADRE'}

def parse_datasheet(path,url):
 record=dg.parse_datasheet(path,url);document=html.fromstring(path.read_text(encoding='utf-8'));frame=document.xpath('//div[contains(concat(" ",normalize-space(@class)," ")," dsOuterFrame ") and contains(concat(" ",normalize-space(@class)," ")," datasheet ")]')[0];main=frame.xpath('./div[contains(concat(" ",normalize-space(@class)," ")," ds2col ") and not(contains(@class,"ShowDatasheetFeatures"))]')[0]
 keys=['M','T','SV','W','LD','OC'];profiles=[]
 for order,base in enumerate(frame.xpath('.//*[contains(concat(" ",normalize-space(@class)," ")," dsProfileBaseWrap ")]'),1):
  wrap=base.xpath('./div[contains(concat(" ",normalize-space(@class)," ")," dsProfileWrapLeft ")]//div[contains(concat(" ",normalize-space(@class)," ")," dsProfileWrap ")]')
  if not wrap:continue
  values=[norm(x.text_content()) for x in wrap[0].xpath('./div[contains(concat(" ",normalize-space(@class)," ")," dsCharWrap ")]//*[contains(concat(" ",normalize-space(@class)," ")," dsCharValue ")]')];right=base.xpath('./div[contains(concat(" ",normalize-space(@class)," ")," dsProfileWrapRight ")]');name=re.sub(r'\s*\([^)]*\)\s*$','',norm(right[0].text_content()) if right else record['title']) or record['title'];stats=dict(zip(keys,values[:6]));inv=dg.profile_invulnerable(frame,base,name)
  if inv:stats['INSV']=inv
  profiles.append({'sourceId':f'{record["sourceId"]}:profile:{order}','order':order,'name':name,'stats':stats})
 record['profiles']=profiles
 if profiles:record['statline']=profiles[0]['stats']
 refs=[]
 for cell in main.xpath('.//td[contains(concat(" ",normalize-space(@class)," ")," dsCoreArmyValue ")]'):
  candidates=cell.xpath('./b/span[contains(@class,"tooltip")]') or cell.xpath('./span[contains(@class,"tooltip")]')
  if not candidates:candidates=[x for x in re.split(r'\s*,\s*',norm(cell.text_content())) if x]
  for candidate in candidates:
   label=norm(candidate.text_content()) if hasattr(candidate,'text_content') else candidate
   if label:refs.append({'sourceId':f'{record["sourceId"]}:rule-reference:{len(refs)+1}','order':len(refs)+1,'label':label})
 record['ruleReferences']=refs
 for section in record['sections']:
  if section['title'].upper()=='UNIT COMPOSITION':section['blocks']=[b for b in section['blocks'] if not b['text'].upper().startswith('YOUR ')]
 for comment in main.xpath('.//*[contains(concat(" ",normalize-space(@class)," ")," dsOptionsComment ")]'):
  value=text(comment)
  if value:record['wargearOptions'].append({'sourceId':f'{record["sourceId"]}:wargear:{len(record["wargearOptions"])+1}','order':len(record['wargearOptions'])+1,'text':value})
 known={s['title'].upper() for s in record['sections']}
 for header in main.xpath('.//div[contains(concat(" ",normalize-space(@class)," ")," dsHeader ")]'):
  heading=norm(header.text_content()).upper()
  if heading not in EXTRA_SECTIONS or heading in known:continue
  blocks=[];sibling=header.getnext()
  while sibling is not None and 'dsHeader' not in (sibling.get('class') or '').split():
   value=text(sibling)
   if value:blocks.append({'text':value,'wargearAbility':False})
   sibling=sibling.getnext()
  record['sections'].append({'sourceId':f'{record["sourceId"]}:section:{len(record["sections"])+1}','order':len(record['sections'])+1,'title':norm(header.text_content()),'blocks':blocks})
 record['normalizedContentFingerprint']=sha(record);return record

def main(src,out):
 src=Path(src);manifest=json.loads((src/'pages.json').read_text(encoding='utf-8-sig'));hub_path=src/'emperor-s-children.html';hub=parse_hub(hub_path);pages=[dg.page_source_record(hub_path,BASE)];datasheets=[]
 for order,info in enumerate(manifest,1):
  path=src/info['file'];record=parse_datasheet(path,info['url']);record['sourceOrder']=order;datasheets.append(record);pages.append(dg.page_source_record(path,info['url']))
 inv={'armyRule':len(hub['armyRules']),'errata':len(hub['errata']),'detachment':len(hub['detachments']),'detachmentRule':sum(bool(x['rule']['text']) for x in hub['detachments']),'enhancement':sum(len(x['enhancements']) for x in hub['detachments']),'stratagem':sum(len(x['stratagems']) for x in hub['detachments']),'datasheet':len(datasheets),'statline':sum(len(x['profiles']) for x in datasheets),'statCharacteristic':sum(sum(len(p['stats']) for p in x['profiles']) for x in datasheets),'weaponProfile':sum(len(x['weapons']) for x in datasheets),'wargearOption':sum(len(x['wargearOptions']) for x in datasheets),'datasheetSection':sum(len(x['sections']) for x in datasheets),'datasheetSectionBlock':sum(sum(len(s['blocks']) for s in x['sections']) for x in datasheets),'ruleReference':sum(len(x['ruleReferences']) for x in datasheets)+len(hub['references']),'keywordOccurrence':sum(len(x['keywords'])+len(x['factionKeywords']) for x in datasheets)}
 corpus={'schema':'wh40k-waha-emperors-children-corpus/v1','edition':'11E','captureDate':'2026-09-28','currentnessCutoff':'2026-09-28','scope':{'included':['current Faction Pack 11E v1.2','23 current non-Legends datasheets'],'excluded':['0 Legends datasheets','10E Boarding Actions','10E Crusade']},'pages':pages,'inventory':inv,'gameplayUnits':sum(inv.values()),**hub,'datasheets':datasheets};corpus['corpusFingerprint']=sha({k:v for k,v in corpus.items() if k not in {'pages','corpusFingerprint'}});Path(out).write_text(json.dumps(corpus,ensure_ascii=False,indent=2)+'\n',encoding='utf-8',newline='\n');print(json.dumps({'pages':len(pages),'inventory':inv,'gameplayUnits':sum(inv.values()),'fingerprint':corpus['corpusFingerprint']},indent=2))

if __name__=='__main__':main(sys.argv[1],sys.argv[2])

from __future__ import annotations
import hashlib,importlib.util,json,re,sys
from copy import deepcopy
from pathlib import Path
from lxml import html
REPO=Path(__file__).resolve().parents[3]
spec=importlib.util.spec_from_file_location('dg_importer',REPO/'books/death-guard/tools/import-waha-current-corpus.py')
dg=importlib.util.module_from_spec(spec);spec.loader.exec_module(dg)
norm,text,slug,sha=dg.norm,dg.text,dg.slug,dg.sha
BASE='https://wahapedia.ru/wh40k11ed/factions/adeptus-mechanicus/'
def parse_hub(path):
 document=html.fromstring(path.read_text(encoding='utf-8')); dispositions=[]
 for order,node in enumerate(document.xpath('//label[contains(concat(" ",normalize-space(@class)," ")," DetFilterItem ") and @data-f and not(contains(@class,"dropShowBoardingActions"))]'),1):
  image=node.xpath('.//img[contains(@class,"detFD")]'); fd=norm(image[0].get('title') or '').replace('Force Disposition:','').strip() if image else ''
  dispositions.append({'sourceId':f'detachment-{slug(node.get("data-det-name"))}','order':order,'title':node.get('data-det-name'),'filterId':node.get('data-f'),'detachmentCode':node.get('data-det-code'),'detachmentPoints':int(node.get('data-dp-base')),'forceDisposition':fd})
 if len(dispositions)!=10: raise ValueError(f'expected 10 current detachments, got {len(dispositions)}')
 detachments=[]
 for meta in dispositions:
  exact=[h for h in document.xpath('//h2[contains(@class,"outline_header")]') if norm(''.join(h.itertext())).startswith(meta['title'])]
  if not exact: raise ValueError(f'missing detachment heading {meta["title"]}')
  nodes=[];n=exact[0].getnext()
  while n is not None:
   if n.tag=='h2' and 'outline_header' in (n.get('class') or '').split(): break
   nodes.append(n);n=n.getnext()
  holder=html.Element('div')
  for n in nodes: holder.append(deepcopy(n))
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
    for o,t in enumerate(container.xpath('.//table'),1):
     rows=[[norm(c.text_content()) for c in r.xpath('./th|./td')] for r in t.xpath('.//tr')]
     rule_tables.append({'sourceId':f'{meta["sourceId"]}:rule:table:{o}','rows':[r for r in rows if r]})
  enhancements=[];eh=holder.xpath('.//h2[starts-with(@id,"Enhancements")]')
  if eh:
   n=eh[0].getnext();o=0
   while n is not None and n.tag!='h2':
    names=n.xpath('.//ul[contains(@class,"EnhancementsPts")]/li/span[1]');prices=n.xpath('.//ul[contains(@class,"EnhancementsPts")]/li/span[2]')
    if names:
     o+=1;paras=n.xpath('.//p[not(contains(@class,"ShowFluff"))]');title=norm(''.join(names[0].xpath('./text()'))) or norm(names[0].text_content())
     profiles=[]
     for row_order,row in enumerate(n.xpath('.//tr[contains(concat(" ",normalize-space(@class)," ")," dsWeaponRow " )]'),1):
      cells=row.xpath('./td')
      if len(cells)<7:continue
      name_cell=cells[1] if len(cells)>=8 else cells[0];value_cells=cells[2:8] if len(cells)>=8 else cells[1:7]
      name_nodes=name_cell.xpath('.//*[contains(concat(" ",normalize-space(@class)," ")," dsWeaponName " )]');name=norm(name_nodes[0].text_content()) if name_nodes else norm(name_cell.text_content())
      abilities=list(dict.fromkeys(filter(None,[norm(x.text_content()) for x in name_cell.xpath('.//*[contains(concat(" ",normalize-space(@class)," ")," kwbw " )]')])))
      values=[norm(cell.text_content()) for cell in value_cells]
      profiles.append({'sourceId':f'{meta["sourceId"]}:enhancement:{o}:weapon:{row_order}','order':row_order,'name':name,'range':values[0],'attacks':values[1],'skill':values[2],'strength':values[3],'ap':values[4],'damage':values[5],'abilities':abilities})
     enhancements.append({'sourceId':f'{meta["sourceId"]}:enhancement:{o}','order':o,'title':title,'wahaPoints':norm(prices[0].text_content()) if prices else '','text':'\n'.join(text(p) for p in paras if text(p)),'weaponProfiles':profiles})
    n=n.getnext()
  stratagems=[]
  for o,w in enumerate(holder.xpath('.//div[contains(concat(" ",normalize-space(@class)," ")," str11Wrap ") and not(contains(@class,"sShowBoardingActions"))]'),1):
   name=w.xpath('.//*[contains(concat(" ",normalize-space(@class)," ")," str11Name ")]');cp=w.xpath('.//*[contains(concat(" ",normalize-space(@class)," ")," str11CP ")]');kind=w.xpath('.//*[contains(concat(" ",normalize-space(@class)," ")," str11Type ")]');legend=w.xpath('.//*[contains(concat(" ",normalize-space(@class)," ")," str11Legend ")]');body=w.xpath('.//*[contains(concat(" ",normalize-space(@class)," ")," str11Text ")]')
   if not name or not body:continue
   bc=deepcopy(body[0])
   for sub in bc.xpath('.//*[contains(concat(" ",normalize-space(@class)," ")," faqErrataStrat ")]'):sub.getparent().remove(sub)
   bt=text(bc);matches=list(re.finditer(r'(?i)(WHEN|TARGET|EFFECT|RESTRICTIONS?):\s*',bt));lines=[]
   for i,ma in enumerate(matches):lines.append({'label':ma.group(1).upper(),'text':norm(bt[ma.end():matches[i+1].start() if i+1<len(matches) else len(bt)])})
   stratagems.append({'sourceId':f'{meta["sourceId"]}:stratagem:{o}','order':o,'title':norm(name[0].text_content()),'cp':norm(cp[0].text_content()) if cp else '','category':norm(kind[0].text_content()) if kind else '','flavor':text(legend[0]) if legend else '','lines':lines})
  det={**meta,'class':'DETACHMENT','rule':{'sourceId':f'{meta["sourceId"]}:rule','title':rule_title,'text':rule_text,'tables':rule_tables},'enhancements':enhancements,'stratagems':stratagems};det['normalizedContentFingerprint']=sha(det);detachments.append(det)
 h=document.xpath('//*[@id="Doctrina-Imperatives"]')[0]; container=h.getparent();components=[]
 intro=container.xpath('./div[1]')
 if intro:components.append({'sourceId':'army-rule-doctrina-imperatives:introduction','title':'Doctrina Imperatives','text':text(intro[0])})
 for n in container.xpath('./div[contains(concat(" ",normalize-space(@class)," ")," BreakInsideAvoid ") and not(contains(@class,"faqErrataSpoiler"))]'):
  title_nodes=n.xpath('.//*[contains(concat(" ",normalize-space(@class)," ")," impact18 ")]');title=norm(title_nodes[0].text_content()) if title_nodes else ''
  if title: components.append({'sourceId':f'army-rule-doctrina-imperatives:{slug(title)}','title':title,'text':text(n)})
 army={'sourceId':'army-rule-doctrina-imperatives','class':'ARMY_RULE','title':'Doctrina Imperatives','components':components};army['normalizedContentFingerprint']=sha(army)
 errata=[];seen=set()
 for wrap in document.xpath('//*[contains(concat(" ",normalize-space(@class)," ")," faqErrataSpoiler ")]'):
  for head,body in zip(wrap.xpath('.//*[contains(concat(" ",normalize-space(@class)," ")," errata_H ")]'),wrap.xpath('.//*[contains(concat(" ",normalize-space(@class)," ")," errata ")]')):
   pair=(text(head),text(body))
   if pair in seen:continue
   seen.add(pair)
   if pair[0].startswith('13.09'):continue
   errata.append({'sourceId':f'errata-{len(errata)+1}','class':'ERRATA','title':pair[0],'text':pair[1]})
 faq_seen=set()
 for table in document.xpath('//div[contains(concat(" ",normalize-space(@class)," ")," faq " )]//table'):
  q=table.xpath('.//tr[contains(@class,"faq_Q_line")]/td[2]');a=table.xpath('.//td[contains(@class,"faq_A")]/following-sibling::td[1]')
  if q and a:
   pair=(text(q[0]),text(a[0]))
   if 'Auto-divinatory Targeting' in pair[0] and pair not in faq_seen:
    faq_seen.add(pair);errata.append({'sourceId':f'faq-{len(faq_seen)}','class':'FAQ','title':pair[0],'text':pair[1]})
 refs=[];root=document.xpath('//div[@id="wrapper"]') or [document]
 for a in root[0].xpath('.//a[@href]'):
  label,href=norm(a.text_content()),norm(a.get('href') or '')
  if label and href and ('/wh40k11ed/' in href or href.startswith('#')):refs.append({'sourceId':f'hub-reference:{len(refs)+1}','label':label,'href':href})
 return {'armyRules':[army],'detachments':detachments,'errata':errata,'references':refs}
EXTRA_DATASHEET_SECTIONS = {
 'CANTICLES OF THE OMNISSIAH','LED BY','SUPPORTED BY','SUPPORT','ENHANCEMENTS',
 'ATTACHED UNIT','SYDONIAN SENTINEL','ICON OF WAR'
}
def parse_am_datasheet(path,url):
 original_fromstring=dg.html.fromstring
 dg.html.fromstring=lambda value: original_fromstring(value.decode('utf-8') if isinstance(value,bytes) else value)
 try: record=dg.parse_datasheet(path,url)
 finally: dg.html.fromstring=original_fromstring
 document=html.fromstring(path.read_text(encoding='utf-8'))
 frame=document.xpath('//div[contains(concat(" ",normalize-space(@class)," ")," dsOuterFrame ") and contains(concat(" ",normalize-space(@class)," ")," datasheet ")]')[0]
 main=frame.xpath('./div[contains(concat(" ",normalize-space(@class)," ")," ds2col ") and not(contains(@class,"ShowDatasheetFeatures"))]')[0]
 for section in record['sections']:
  if section['title'].upper()=='UNIT COMPOSITION':section['blocks']=[block for block in section['blocks'] if not block['text'].upper().startswith('YOUR ')]
 for comment in main.xpath('.//*[contains(concat(" ",normalize-space(@class)," ")," dsOptionsComment " )]'):
  value=text(comment)
  if value:record['wargearOptions'].append({'sourceId':f"{record['sourceId']}:wargear:{len(record['wargearOptions'])+1}",'order':len(record['wargearOptions'])+1,'text':value})
 known={section['title'].upper() for section in record['sections']}
 for header in main.xpath('.//div[contains(concat(" ",normalize-space(@class)," ")," dsHeader ")]'):
  heading=norm(header.text_content()).upper()
  if heading not in EXTRA_DATASHEET_SECTIONS or heading in known:continue
  blocks=[];sibling=header.getnext()
  while sibling is not None and 'dsHeader' not in (sibling.get('class') or '').split():
   value=text(sibling)
   if value:blocks.append({'text':value,'wargearAbility':False})
   sibling=sibling.getnext()
  record['sections'].append({'sourceId':f"{record['sourceId']}:section:{len(record['sections'])+1}",'order':len(record['sections'])+1,'title':norm(header.text_content()),'blocks':blocks})
 if record['title']=='Servitor Battleclade':
  record['keywords']=['INFANTRY','IMPERIUM','CULT MECHANICUS','SERVITOR BATTLECLADE','UNDERSEER: TECH-PRIEST'];record['factionKeywords']=['ADEPTUS MECHANICUS']
 record['normalizedContentFingerprint']=sha(record)
 return record
def main(src,out):
 src=Path(src);manifest=json.loads((src/'pages.json').read_text(encoding='utf8'));hub_path=src/'adeptus-mechanicus.html';hub=parse_hub(hub_path);pages=[dg.page_source_record(hub_path,BASE)];datasheets=[]
 for order,info in enumerate(manifest,1):
  p=src/info['file'];r=parse_am_datasheet(p,info['url']);r['sourceOrder']=order
  datasheets.append(r);pages.append(dg.page_source_record(p,info['url']))
 inv={'armyRule':len(hub['armyRules']),'errata':len(hub['errata']),'detachment':len(hub['detachments']),'detachmentRule':sum(bool(x['rule']['text']) for x in hub['detachments']),'enhancement':sum(len(x['enhancements']) for x in hub['detachments']),'enhancementWeaponProfile':sum(len(e.get('weaponProfiles',[])) for x in hub['detachments'] for e in x['enhancements']),'stratagem':sum(len(x['stratagems']) for x in hub['detachments']),'datasheet':len(datasheets),'statline':len(datasheets),'statCharacteristic':sum(len(x['statline']) for x in datasheets),'weaponProfile':sum(len(x['weapons']) for x in datasheets),'wargearOption':sum(len(x['wargearOptions']) for x in datasheets),'datasheetSection':sum(len(x['sections']) for x in datasheets),'datasheetSectionBlock':sum(sum(len(s['blocks']) for s in x['sections']) for x in datasheets),'ruleReference':sum(len(x['ruleReferences']) for x in datasheets)+len(hub['references']),'keywordOccurrence':sum(len(x['keywords'])+len(x['factionKeywords']) for x in datasheets)}
 corpus={'schema':'wh40k-waha-adeptus-mechanicus-corpus/v1','edition':'11E','captureDate':'2026-09-25','currentnessCutoff':'2026-09-22','scope':{'included':['current Faction Pack 11E v1.2','34 non-Legends current datasheets'],'excluded':['4 Legends datasheets','10E Boarding Actions','10E Crusade']},'pages':pages,'inventory':inv,'gameplayUnits':sum(inv.values()),**hub,'datasheets':datasheets};corpus['corpusFingerprint']=sha({k:v for k,v in corpus.items() if k not in {'pages','corpusFingerprint'}});Path(out).write_text(json.dumps(corpus,ensure_ascii=False,indent=2)+'\n',encoding='utf8');print(json.dumps({'pages':len(pages),'inventory':inv,'gameplayUnits':sum(inv.values()),'fingerprint':corpus['corpusFingerprint']},indent=2))
if __name__=='__main__':main(sys.argv[1],sys.argv[2])
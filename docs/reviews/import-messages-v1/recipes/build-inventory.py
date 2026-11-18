from pathlib import Path
import json,csv,re,html,hashlib,subprocess,collections

repo=Path('E:/Warhammer/worktrees/import-messages-v1')
out=Path('E:/Warhammer/qa-evidence/import-messages-v1-2026-11-18')
base='5bc1b038437fcac86966f87371760da94d7e9b38'
read=lambda name:json.loads((out/name).read_text(encoding='utf-8-sig'))
ui=read('ui-copy-inventory.json');native=read('native-needs-inventory.json');book=read('book-limitations-inventory.json');options=read('native-option-copy-inventory.json')
observations=read('browser-observations.json')['observations']+read('browser-supplement.json')['observations']
assert len(observations)==50 and read('browser-observations.json')['status']=='COMPLETE' and read('browser-supplement.json')['status']=='COMPLETE'
assert not read('browser-observations.json')['errors'] and not read('browser-supplement.json')['errors']
assert len(native['needKindCoverage'])==15 and len(native['needReasonCoverage'])==5

overrides={
 'points-mfm-size-copy':"This unit's size or number of copies has no verified points cost. Check the current points document before using the total.",
 'points-enhancement':"This Enhancement's cost could not be verified. Check the current points document.",
 'points-fallback':'The points total could not be verified. Check the current points document before using it.',
 'points-message-passthrough':'The points total could not be verified. Check the highlighted unit against the current points document.',
 'unknown-value':'Unavailable',
 'initial-status':'No roster is loaded. Paste your New Recruit text export and select Import roster.',
 'backup-help':'Your roster is saved in this browser. Download a backup to keep a separate copy.',
 'backup-restored':'Roster backup restored. Review the restored units before continuing.',
 'backup-exported':'Backup download requested. Save the file to keep a separate copy.',
 'saved-restored':'Saved roster reloaded. Review the units before continuing.',
 'player-error-fallback':'The app could not read an entry. Check the original export or restore a valid roster backup.',
 'state-invalid-fallback':'The app could not validate this roster. Import the original export or restore a valid roster backup.',
 'replacement-kept':'Current roster kept. Continue with this roster or import another export.',
 'replacement-help':'Replacing this roster clears manual attachments. Choose Replace roster to continue or Keep current roster to cancel.',
 'replacement-status':'This export would replace your current roster. Choose Replace roster or Keep current roster.',
 'import-success':'Roster imported. Review your units, then open your personal guide.',
 'clarification-status':'Some entries need attention. Review the highlighted entries below.',
 'enhancement-bearer-choice':'The Enhancement bearer needs confirmation. Choose the model carrying it.',
 'matching-choice-help':'This name needs confirmation. Choose the matching entry below.',
 'matching-label':'Choose a match',
 'matching-aria':'Choose a match for {entryName}',
 'bindings-submit':'Confirm selections',
 'binding-blocked':'This entry could not be read. Correct the export in New Recruit and import it again.',
 'binding-unsupported':'This entry cannot be confirmed here. Send the original export to the site owner.',
 'confirm-each-error':'Some entries still need a choice. Choose a match for each one before continuing.',
 'detachment-match-failure':'The Detachment could not be recognized in this Army Book. Check its name and the selected Army Book.',
 'points-unresolved-value':'Not calculated',
 'mfm-base-label':'Points',
 'enhancements-none-imported':'REMOVE_WHEN_NO_IMPORTED_ENHANCEMENT',
 'enhancements-none-applied':'Not applied',
 'roster-summary':'{count} unit / {count} units. Review your units and optional attachments.',
 'draft-summary':'Imported text ({count} unit / {count} units)',
 'draft-unit':'{unitName} · {count} model / {count} models in the export',
 'warlord-none':'No eligible Warlord is available in this roster.',
 'warlord-choose-error':'A Warlord has not been selected. Choose an eligible CHARACTER from this roster.',
 'warlord-saved':'Warlord saved. Review your roster before opening the personal guide.',
 'open-card':'Open card',
 'invalid-enhancement-heading':'Enhancement not applied',
 'epic-enhancement-warning':"{enhancement} cannot be applied to an Epic Hero. Remove it in New Recruit and import the corrected list.",
 'source-choice-saved':'Choice saved. Review the affected unit.',
 'source-choice-unavailable':'This choice cannot be changed here. Send the export to the site owner.',
 'attached-status':'Character or Support attached. Review the unit in your personal guide.',
 'detached-status':'Character or Support detached. Review the affected units.',
 'header-message':'The export header could not be read. Export the complete list as text from New Recruit and try again.',
 'header-instruction':'Supported headers begin with three nonempty lines: list name and points, faction, then Detachment(s). Example:',
 'header-optional-instruction':'A Force Disposition, a battle size, or both may follow the Detachment line. Each may appear once, in either order.',
 'limitations-heading':'Known limitations of this Army Book',
 'unsupported-mechanics-general':'Some rules are not applied automatically. Check their full text before using them.',
 'unit-name-format':'{unitName} ({composition})[ #{identicalCopyNumber}]; identical one-model units: {unitName} #{identicalCopyNumber}',
 'unit-composition-format':'{count} model / {count} models; omit redundant one-model suffix only for otherwise identical one-model units',
}

rows=[];dormant=[]
def normalize(raw,scope,prefix):
 r=dict(raw);r['sourceId']=r['id'];r['id']=prefix+r['id'];r['scope']=scope
 b=r.get('books',[])
 if isinstance(b,str):
  known={'T’au Empire':['tau-empire'],'Tyranids':['tyranids']}
  b=known.get(b,list(native['needKindCoverage']['DATASHEET']['books']) if 'nine' in b.lower() or b.lower()=='all' else [b])
 r['books']=b
 if r.get('fixtureTest') is not None:r['fixture']=r['fixtureTest']
 r.setdefault('fixture',[]);r.setdefault('notes','')
 r['proposal']=overrides.get(r['sourceId'],r['proposal'])
 if r['sourceId'] in overrides:r['notes']+=' Primary review: proposal reconciled with the owner\'s plain-language principle and stage-2 polish constraints.'
 return r

for raw in ui:
 r=normalize(raw,'Shared production copy','UI-')
 if raw['id'].startswith('dormant-'):
  r['scope']='Dormant/test-only view';r['proposal']='NO_CHANGE_IN_THIS_TASK';dormant.append(r);continue
 if raw['id'].startswith('points-') and raw['id'] not in ['points-label','points-value']:
  r['severity']='Information';r['condition']="A roster is already loaded and service.points.status is UNRESOLVED; show only matching unit/reason issues. Import success is not revoked. "+str(r['condition'])
 if raw['id'].startswith('player-error-'):
  code={'empty':'EMPTY_IMPORT','composition':'INVALID_COMPOSITION','quantity':'INVALID_SELECTION_QUANTITY','quantity-conflict':'CONFLICTING_SELECTION_QUANTITY','warlord':'AMBIGUOUS_WARLORD_IDENTITY','enhancement-owner':'UNRESOLVED_ENHANCEMENT_OWNER','enhancement-context':'FOREIGN_ENHANCEMENT_CONTEXT'}.get(raw['id'][13:],'all other returned error codes')
  r['condition']='Returned import/validation errors mapped through playerError; code = '+code+'. '+str(r['condition'])
 if raw['id']=='save-failed-suffix':
  r['severity']='Information';r['condition']='The action/import completed in memory, but localStorage.setItem threw. Do not say that the import was refused. '+str(r['condition'])
 if raw['id'] in ['confirm-each-error','warlord-choose-error','attachment-choose-error']:r['severity']='Choice'
 if raw['id'] in ['epic-enhancement-warning','invalid-enhancement-heading','enhancements-none-applied']:
  r['severity']='Information';r['condition']='The roster imported; an illegal Epic Hero Enhancement is retained as evidence but is NOT active. This is not an import rejection. '+str(r['condition'])
 if raw['id']=='epic-enhancement-warning':r['proposedDetails']='{enhancement} was assigned to {unit}. This assignment is invalid under Core Rules 25.04: Epic Hero units cannot take Enhancements. The Enhancement is not applied. Exported points were retained.'
 if raw['id']=='replacement-help':r['proposedDetails']='Replacing this roster clears manual attachments. Your current roster and saved roster are unchanged until you confirm.'
 if raw['id']=='header-message':r['proposedDetails']='Your current roster and saved roster were not changed. The supported three-line and optional five-line examples below keep their exact names, numbers, line order and grammar.'
 if raw['id']=='binding-blocked':r['proposedDetails']='Model counts and equipment quantities cannot be edited in this clarification form. The current roster was not replaced.'
 if raw['id']=='enhancements-none-imported':r['notes']+=' Hide only when the original unit has no imported Enhancement IDs. Do not hide a suppressed invalid Enhancement or its not-applied explanation.'
 if raw['id']=='warlord-save':r['notes']+=' Keep caption, but do not render the button when the existing eligibility result has zero candidates. Do not infer CHARACTER or modify Warlord rules.'
 if raw['id']=='clarification-status':r['notes']+=' Use Choice only for an actionable clarification; use Error if any need is blocked. Do not tell the player to choose when no usable choice is offered.'
 if raw['id'] in ['limitations-heading','rules-points-limitations-heading','unsupported-mechanics-general']:r['books']=['blood-angels','dark-angels'] if raw['id']=='limitations-heading' else ['blood-angels']
 if raw['id']=='no-weapon-profiles':
  r['scope']='Shared card-only copy (unchanged)';r['condition']='Card-only shared helper at datasheet-v1.mjs:1235; no Attachment Setup consumer. Listed for completeness, with no change proposed.'
 rows.append(r)

ui_by_text={r['currentText']:r for r in rows}
code_overrides={
 'AMBIGUOUS_WARLORD_IDENTITY':overrides.get('player-error-warlord','The Warlord could not be identified. Select one Warlord in New Recruit and export the list again.'),
 'FOREIGN_ENHANCEMENT_CONTEXT':'An Enhancement belongs to a Detachment missing from this export. Check the Detachment and Enhancement in New Recruit, then export the complete list.',
 'SOURCE_COMPOSITION_QUANTITY':'A unit’s model count does not match its composition. Check the model counts in New Recruit and export the list again.',
 'UNKNOWN_ENHANCEMENT':'The Enhancement could not be recognized. Check its name in New Recruit and export the list again.',
 'DUPLICATE_ENHANCEMENT_SELECTION':'An Enhancement is selected more than once. Check its assignments in New Recruit and export the list again.',
 'WRONG_UPGRADE_UNIT':'An upgrade does not belong to this unit. Check the upgrade assignment in New Recruit and export the list again.',
 'WRONG_UPGRADE_SCOPE':'An upgrade could not be assigned to its intended bearer. Check the upgrade assignment in New Recruit and export the list again.',
 'FOREIGN_FACTION_EXPORT':'This list is for {faction}, but {book} is open. Open the matching Army Book and import it there.',
}
need_overrides={
 'need-csm-deferred-unit':'This unit is not supported by automatic import yet. Send the original export to the site owner.',
 'need-detachment-membership-not-proven':'The Detachment could not be recognized in this Army Book. Check its name and the selected Army Book.',
 'need-tyranids-unresolved_source_restriction':'The app cannot import this Enhancement yet. Send the original export to the site owner.',
 'need-tyranids-enhancement_eligibility_needs_bindings':'The app could not confirm who can take this Enhancement. Check its assignment in New Recruit and export the list again.',
 'need-ba-astartes-chainsword':'Astartes Chainsword cannot be identified reliably by this importer yet. Send the original export to the site owner.',
 'need-ba-bolt-rifle-fire':'Bolt Rifle Fire cannot be identified reliably by this importer yet. Send the original export to the site owner.',
}
for raw in native['rows']:
 category=raw.get('category','native-need')
 if raw.get('needKind'):category='native-need'
 prefix={'native-need':'NEED-','native-error-origin':'ERROR-','points-reason':'POINT-','import-status':'STATUS-'}[category]
 r=normalize(raw,category,prefix)
 if raw['id'] in need_overrides:r['proposal']=need_overrides[raw['id']]
 if raw.get('nativeCode') in code_overrides:r['proposal']=code_overrides[raw['nativeCode']]
 if category=='native-error-origin':
  r['condition']='Returned error mapping only; ordinary-export reachability is not claimed unless observed. '+r['condition']
  r['notes']+=' This is a producer-origin coverage row, not an additional unique player message. A thrown error without playerMessage follows the generic action-failure UI instead.'
  if r['currentText'] in ui_by_text and r['currentText']!=next(x['currentText'] for x in ui if x['id']=='player-error-fallback'):
   r['proposal']=ui_by_text[r['currentText']]['proposal']
 if category=='import-status' and r['currentText'] in ui_by_text:r['proposal']=ui_by_text[r['currentText']]['proposal']
 if category=='points-reason' and r['currentText'] in ui_by_text:r['proposal']=ui_by_text[r['currentText']]['proposal'];r['severity']='Information'
 if raw.get('needKind') in ['OPTION','COMPOSITION_MEMBER'] and 'unconfirmable' in raw['id']:
  r['severity']='Error';r['notes']+=' EXISTING STATIC UI MISMATCH: current form may offer a chooser, but the confirmation map has no handler for this kind. No ordinary-nine-book UI reproduction of that candidate path was established. Do not enable new accepted inputs in stage 2; any logic repair needs separate approval.'
 if raw['id']=='need-datasheet-choice':r['notes']+=' The Astraeus pointer is a related unresolved-unit test; it does not prove that this chooser has usable candidates. This particular chooser branch is not reproduced.'
 if raw.get('nativeCode')=='FOREIGN_FACTION_EXPORT':r['notes']+=' Placeholder values must come from existing parsed metadata and the open book title; use a generic different-army fallback if unavailable. Never infer faction from a unit name.'
 rows.append(r)

for raw in book['rows']:
 scope='Book limitation' if raw['currentText'] else 'Already-hidden authored fragment'
 r=normalize(raw,scope,'BOOK-')
 if raw['id']=='BA-WEAPON-MAPPINGS':r['proposal']='{weaponName} cannot be identified reliably by this importer yet. Send the original export to the site owner.'
 if raw['id']=='BA-PAID-EQUIPMENT':r['severity']='Information';r['proposal']='The equipment cost could not be verified. Check the highlighted unit against the current points document.'
 if raw['id']=='BA-AMBIGUITY-PRESERVES-ROSTER':r['proposal']='Your saved roster has not changed. Review the highlighted entry before trying the import again.'
 if raw['id']=='BA-BLACK-RAGE':r['proposal']='Battlefield conditions are not checked automatically. Check Black Rage during the battle.'
 if raw['id']=='BA-LEGACY-OF-THE-ANGEL':r['proposal']='Legacy of the Angel needs an eligible BLOOD ANGELS CHARACTER. Check the affected unit’s keywords before using this rule.'
 if raw['id']=='BA-STORMLANCE-SOURCE-CONFLICT':r['proposal']='Stormlance references disagree about Detachment Points. Use the current points document for Detachment Points.'
 if raw['id']=='BA-UNSUPPORTED-MECHANICS':r['proposal']='Some rules are not applied automatically. Check their full text before using them.'
 if raw['id'].startswith('FACTION-') or 'FOREIGN_FACTION_EXPORT' in str(raw['condition']):r['proposal']=code_overrides['FOREIGN_FACTION_EXPORT']
 rows.append(r)

for raw in options:
 r=normalize(raw,'Native source-choice caption','OPTION-')
 if raw['id']=='tau-prototype-single-weapon':r['proposal']='{weaponName} — 1 weapon'
 if raw['id']=='tau-prototype-two-weapons':r['proposal']='{weaponName} — choose 1 of 2 weapons'
 if raw['id']=='tau-prototype-selection-key-suffix':r['proposal']='{weaponName}{quantityCaption} · {modelOrLoadoutCaption} · selection {occurrenceNumber}'
 if raw['id']=='tau-student-recipient-caption':r['proposal']='{unitCaption}'
 if raw['id']=='tau-student-recipient-set':r['proposal']='{unitCaption1} + {unitCaption2} [+ …]'
 if raw['id']=='tyranids-trygon-character-option':r['proposal']=r['currentText']
 rows.append(r)

extra=[
 ('NEW-details','books/shared/army-book-app-v2/roster.mjs:377','No Details disclosure currently exists around ordinary clarification explanations.','(not currently present)','Details','Information','collapsed Details','All explanatory detail remains player-readable even after expanding Details; no raw codes, IDs, JSON or paths.'),
 ('LEGEND-compound','books/tyranids/v2/roster-import.mjs:114; books/shared/army-book-app-v2/roster.mjs:396','Need COMPOUND_WEAPON_SOURCE has a developer-authored rawLabel.','Complete combined item required in one physical loadout','Equipment entry','Error','after import if relevant','Preserve full human explanation in the body; do not expose technical loadout language.'),
 ('LEGEND-venom','books/tyranids/v2/roster-import.mjs:167; books/shared/army-book-app-v2/roster.mjs:396','Need VENOM_BOLT_MODEL_OWNER has a developer-authored rawLabel.','Venom bolt requires one explicitly identified Ravener','Venom bolt bearer','Error','after import if relevant','The exact weapon and model owner remain unresolved; no default is selected.'),
 ('LEGEND-possessed','books/emperors-children/v2/roster-boot.mjs:35; books/shared/army-book-app-v2/roster.mjs:396','Adapted Possessed Blade choice uses this complete legend.','Possessed Blade: choose the bearer’s equipped melee weapon','Possessed Blade','Choice','after import if relevant','Existing exact equipped-weapon candidates and values are unchanged.'),
 ('LEGEND-restriction','books/shared/army-book-app-v2/roster.mjs:396','Tyranids restriction needs use the existing eligibilityText value as rawLabel.','{binding.eligibilityText}','{enhancementName}','Error','after import if relevant','If this value is canonical rule text, retain it verbatim in Details; this proposal changes the heading only. Use an existing explicit Enhancement identity; do not guess a name.'),
]
for id,location,condition,current,proposal,severity,placement,notes in extra:
 rows.append(dict(id=id,sourceId=id,scope='New label proposal' if id.startswith('NEW') else 'Clarification legend',location=location,books=['tyranids'] if 'tyranids/' in location else ['emperors-children'] if 'emperors-children/' in location else list(native['needKindCoverage']['DATASHEET']['books']),condition=condition,fixture=[],currentText=current,proposal=proposal,severity=severity,placement=placement,reproductionStatus='NOT_REPRODUCED',notes=notes))

assert len({r['id'] for r in rows})==len(rows)

def observation_text(o):
 parts=[o.get('text',''),'\n'.join(o.get('visibleText',[]))]
 for c in o.get('controls',[]):
  parts += [str(c.get(k) or '') for k in ['text','label','placeholder']]
  parts += [str(x.get('text') or '') for x in c.get('options') or []]
 return '\n'.join(parts)

def pattern(text):
 chunks=re.split(r'(\$\{[^}]+\}|\{[^{}]+\})',text)
 literal=''.join(chunks[::2])
 if len(literal.strip())<5:return None
 return re.compile(''.join('[^\n]*?' if i%2 else re.escape(v) for i,v in enumerate(chunks)))

for r in rows:
 hits=[];p=pattern(r['currentText']) if r['currentText'] else None
 for o in observations:
  if o['book'] not in r['books']:continue
  if r['scope']=='native-error-origin':
   code=r.get('nativeCode')
   if not (code=='FOREIGN_FACTION_EXPORT' and o['scenario']=='foreign-faction' or code=='EMPTY_IMPORT' and o['scenario']=='empty-import'):continue
  if r['scope']=='native-need':
   fields=[x for x in o.get('clarifications',[]) if x['kind']==r.get('needKind')]
   if not fields or not any(r['currentText'] in x['text'] for x in fields):continue
   # Do not claim the deliberately unconfirmable-candidate branch from a blocked zero-choice form.
   if 'unconfirmable' in r['sourceId'] and not any(len(x.get('options',[]))>1 for x in fields):continue
   if r['sourceId'].endswith('choice') and not any(len(x.get('options',[]))>1 for x in fields):continue
  text=observation_text(o)
  if r['currentText'] and (r['currentText'] in text or p and p.search(text)):hits.append({'id':o['id'],'fixture':o['fixture']})
 r['observedIn']=hits
 r['sourceEvidenceStatus']=r.get('reproductionStatus','NOT_REPRODUCED')
 r['reproductionStatus']='OBSERVED_STAGE_1' if hits else 'NOT_REPRODUCED'
 if not hits and r['sourceEvidenceStatus']=='STATIC_TEST_COVERAGE':r['notes']+=' An existing test/fixture reference was read, not run; this particular rendered branch was not reproduced in stage 1.'

ban=re.compile(r'\b(?:NOT_PROVEN|MFM|canonical|physical|binding|bindings)\b|source entry',re.I)
violations=[]
for r in rows:
 candidate=re.sub(r'\{[^{}]*\}','',r['proposal'])
 if ban.search(candidate) and r['proposal'] not in ['KEEP_HIDDEN','REMOVE_FROM_PLAYER_COPY']:violations.append((r['id'],r['proposal']))
assert not violations,violations

counts=collections.Counter(r['scope'] for r in rows)
report={'schema':'import-messages-review-inventory/v1','status':'STAGE_1_PROPOSAL_ONLY','baseCommit':base,'date':'2026-11-18','books':list(native['needKindCoverage']['DATASHEET']['books']),'counts':{'reviewRows':len(rows),'byScope':dict(counts),'observedRows':sum(bool(r['observedIn']) for r in rows),'notReproducedRows':sum(not r['observedIn'] for r in rows),'browserObservations':len(observations),'pageErrors':0,'finalNeedKinds':15,'needReasons':5,'nativeErrorCodes':85,'dormantRows':len(dormant)},'method':'Application-authored copy, interpolation templates and native producer origins are distinguished. Repeated current messages are not counted as unique player paragraphs. Data-owned unit/rule names, weapon statistics and point values are parameterized and are not proposed for rewriting. Static test references are not test PASS claims.','rows':rows,'dormant':dormant,'needKindCoverage':native['needKindCoverage'],'needReasonCoverage':native['needReasonCoverage'],'internalOnlyDiagnostics':native['internalOnlyDiagnostics']}
(out/'inventory.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf8')

def string(value):
 if isinstance(value,str):return value
 return json.dumps(value,ensure_ascii=False)
def condition(r):
 evidence=r['reproductionStatus']+': '+(', '.join(x['id'] for x in r['observedIn']) if r['observedIn'] else 'not reproduced; static references do not establish an observed UI result')
 return string(r['condition'])+'\nEvidence: '+evidence+'\nExisting fixtures/tests: '+string(r.get('fixture',[]))
def proposal(r):return r['proposal']+ ('\nDetails: '+r['proposedDetails'] if r.get('proposedDetails') else '')
def md(value):return html.escape(string(value),quote=False).replace('|','\\|').replace('\r\n','\n').replace('\n','<br>')
header=['ID','Location (file:line)','Book(s)','When shown — condition and existing evidence','Current text','Proposal','Importance','Proposed placement']
lines=['# Import and Attachment Setup copy — full proposal table','',f'Pinned source: `{base}`. **Stage 1 only: no implementation or test-expectation changes.**','',f'{len(rows)} review rows include repeated native producer origins, not {len(rows)} unique visible messages. The CSV is the same ordered table with scope, reproduction status and notes for filtering.','', 'Placeholders represent existing runtime values, not invented roster content. Labels/buttons may be short noun/verb phrases; actionable messages use short event/action copy. KEEP_HIDDEN and REMOVE_FROM_PLAYER_COPY are review dispositions, never proposed player text.','', '**Importance:** Error = the import/action is blocked; Choice = a usable confirmation is required; Information = a completed import, points warning, display label or background limitation. Points unavailable and inactive illegal Enhancements do not mean that the roster import was refused. Details is player-facing too: do not expose raw reason codes, IDs, paths or JSON there.','', '[CSV](messages.csv) · [Machine-readable inventory](inventory.json) · [Browser observations](evidence/browser-observations.json) · [Supplement](evidence/browser-supplement.json)','']
for scope in counts:
 group=[r for r in rows if r['scope']==scope]
 lines += ['## '+scope,'']
 if scope=='native-error-origin':lines += ['These are conditional producer/guard origins. Ordinary-export reachability is explicitly unproven for many guards; a code in a source file is not an observed user error. Existing errors returned to playerError map to the shown copy; exceptions can instead use the generic action fallback.','']
 if scope=='Already-hidden authored fragment':lines += ['These two sentences are already absent from visible UI. They are listed to prevent accidental resurrection and are not part of the visible-warning count.','']
 lines += ['| '+' | '.join(header)+' |','|'+'|'.join(['---']*len(header))+'|']
 for r in group:lines.append('| '+' | '.join(md(v) for v in [r['id'],r['location'],', '.join(r['books']),condition(r),r['currentText'] or '(already hidden)',proposal(r),r['severity'],r['placement']])+' |')
 lines += ['']
(out/'messages.md').write_text('\n'.join(lines).rstrip()+'\n',encoding='utf8')
with (out/'messages.csv').open('w',encoding='utf-8-sig',newline='') as f:
 writer=csv.writer(f,lineterminator='\n');writer.writerow(['ID','Scope',*header[1:],'Reproduction','Notes'])
 for r in rows:writer.writerow([r['id'],r['scope'],string(r['location']),', '.join(r['books']),condition(r),r['currentText'],proposal(r),r['severity'],r['placement'],r['reproductionStatus'],r['notes']])

d=['# Dormant and internal-only text — excluded from the player-copy proposal','', 'These strings are not current supported import/Attachment Setup screens. renderInstanceContext has no production caller; the synthetic route test invokes the exported API directly. No stage-2 changes to these strings are proposed.','', '| ID | Location | Text | Why excluded |','|---|---|---|---|']
for r in dormant:d.append('| '+' | '.join(md(v) for v in [r['id'],r['location'],r['currentText'],r['condition']])+' |')
d+=['','The native inventory separately retains '+str(len(native['internalOnlyDiagnostics']))+' internal diagnostic records for traceability; do not publish them as player messages or treat their wording as UI expectations.']
(out/'dormant-and-internal.md').write_text('\n'.join(d)+'\n',encoding='utf8')
print(json.dumps({'status':'STAGE_1_PROPOSAL_ONLY',**report['counts']},ensure_ascii=False))

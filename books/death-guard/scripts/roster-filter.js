(function () {
  const rosterId = new URLSearchParams(location.search).get("roster");
  if (!rosterId) return;

  let roster, sourceText = "", record;
  try {
    const records = JSON.parse(localStorage.getItem("wh40k-rosters-v1")) || [];
    record = records.find((record) => record.id === rosterId);
    roster = record?.roster;
    sourceText = record?.sourceText || "";
    if (!roster && rosterId === "1") roster = JSON.parse(sessionStorage.getItem("wh40k-roster-guide"));
  } catch {}
  if (sourceText && window.WHRosterParser) {
    const parsed = window.WHRosterParser.parse(sourceText);
    if (parsed.units.length) roster = parsed;
  }
  if (roster?.faction) roster.faction = roster.faction.replace(/^(?:Chaos|Imperium)\s*[-–—]\s*/i, '').trim();
  if (!roster?.units?.length) {
    location.replace("../../index.html");
    return;
  }

  const slug = (value) => String(value || "").toLowerCase().replace(/[’']/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const normalize = (value) => String(value || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  const restoreLegacyLoadouts = () => {
    let unitIndex = -1, modelIndex = -1;
    sourceText.replace(/\u00a0/g, " ").split(/\r?\n/).map((line) => line.trim()).filter(Boolean).forEach((line) => {
      if (/^(?:Char\d+:\s*)?\d+x\s+.+?\s+\(\d+\s*pts?\)/i.test(line)) { unitIndex += 1; modelIndex = -1; return; }
      if (line.startsWith("•")) { modelIndex += 1; return; }
      const match = line.match(/^(\d+)\s+with\s+(.+)$/i), model = roster.units[unitIndex]?.models?.[modelIndex];
      if (match && model) {
        model.loadouts ||= [];
        if (!model.loadouts.some((item) => item.quantity === Number(match[1]) && item.wargear === match[2])) model.loadouts.push({ quantity:Number(match[1]), wargear:match[2] });
      }
    });
  };
  restoreLegacyLoadouts();
  const canonicalTerms = window.WH40K_GLOSSARY.forBook('death-guard');
  const rosterTerms = {};
  window.DG_ROSTER_TERMS = rosterTerms;
  const renderComposition = (card, units) => {
    const root = card.querySelector('[id$="-composition"] .ability-list');
    if (!root) return;
    const rows = new Map();
    const add = (quantity, name, wargear) => {
      const key = `${name}\0${wargear}`;
      rows.set(key, { quantity:(rows.get(key)?.quantity || 0) + quantity, name, wargear });
    };
    units.forEach((unit) => {
      if (!unit.models?.length) return add(unit.quantity, unit.name, unit.wargear);
      unit.models.forEach((model) => model.loadouts?.length
        ? model.loadouts.forEach((loadout) => add(loadout.quantity, model.name, loadout.wargear))
        : add(model.quantity, model.name, model.wargear));
    });
    const block = document.createElement('div');block.className='content-block roster-composition';
    const title = document.createElement('strong');title.textContent='Roster loadout';block.append(title);
    const list = document.createElement('ul');
    const groups=window.WHRosterEntities.weaponGroups(canonicalTerms,card.id);
    rows.forEach((row) => {
      const item=document.createElement('li');item.append(`${row.quantity}× ${row.name}`);
      if(row.wargear){
        item.append(' — ');
        splitLabels(row.wargear).forEach((label,index)=>{
          if(index)item.append(', ');
          const family=window.WHRosterEntities.weaponFamily(label),profiles=groups.get(family)||[];
          if(!profiles.length){item.append(label);return;}
          const exact=profiles.find(profile=>window.WHRosterEntities.normalize(profile.title)===window.WHRosterEntities.normalize(label));
          const termId=exact?.id||`roster-${card.id}-${family.replace(/\s+/g,'-')}`;
          if(!exact)rosterTerms[termId]={title:label,summary:`${profiles.length} weapon profiles`,datasheet:card.id,profiles};
          const button=document.createElement('button');button.type='button';button.className='term-button';button.dataset.term=termId;button.textContent=label;item.append(button);
        });
      }
      list.append(item);
    });
    block.append(list);root.replaceChildren(block);
  };
  const renderDetachmentKeywords = (card) => {
    const grants=window.DGRelatedRules.grantedKeywords(card.id.replace(/^unit-/,''),window.DG_ROSTER_GUIDE.detachmentIds);
    if(!grants.length)return;
    const root=card.querySelector('[id$="-keywords"] .ability-list');
    if(!root)return;
    const block=document.createElement('div');block.className='content-block roster-granted-keywords';
    const line=document.createElement('p');line.append('Granted by Detachment: ');
    grants.forEach((grant,index)=>{
      if(index)line.append(', ');
      if(!canonicalTerms[grant.id])rosterTerms[grant.id]={title:grant.title,summary:`This unit has the ${grant.title} keyword while using the ${grant.detachment.replace(/-/g,' ')} Detachment.`};
      const button=document.createElement('button');button.type='button';button.className='term-button';button.dataset.term=grant.id;button.textContent=grant.title;line.append(button);
    });
    block.append(line);root.prepend(block);
  };
  const splitLabels = (value) => {
    const labels = [];
    let depth = 0;
    let start = 0;
    for (let index = 0; index < value.length; index += 1) {
      if (value[index] === "(") depth += 1;
      if (value[index] === ")") depth = Math.max(0, depth - 1);
      if (value[index] === "," && depth === 0) {
        labels.push(value.slice(start, index).trim());
        start = index + 1;
      }
    }
    labels.push(value.slice(start).trim());
    return labels.filter(Boolean);
  };
  const storedDetachments = roster.detachments?.length ? roster.detachments : [{ label:roster.detachment, disposition:roster.disposition }];
  const detachments = storedDetachments.flatMap((item) => splitLabels(item.label).map((label) => ({ ...item, label, name:label.replace(/\s*\([^)]*\)\s*$/, "") })));
  const detachmentIds = new Set(detachments.map((item) => `detachment-${slug(item.name || item.label.split("(")[0])}`));
  window.DG_ROSTER_GUIDE = Object.freeze({ detachmentIds:[...detachmentIds].map((id) => id.replace(/^detachment-/, "")) });
  const detachmentLabel = detachments.map((item) => item.label).join(" + ");
  const selected = new Map();

  for (const unit of roster.units) {
    const id = `unit-${slug(unit.name)}`;
    const entry = selected.get(id) || { copies:0, points:0, loadout:[], units:[] };
    entry.copies += 1;
    entry.points += unit.points;
    entry.units.push(unit);
    entry.loadout.push(...[unit.wargear, ...(unit.models || []).flatMap((model) => [model.wargear, ...(model.loadouts || []).map((loadout) => loadout.wargear)])].filter(Boolean));
    selected.set(id, entry);
  }

  document.title = `${roster.faction} Roster Guide`;
  document.querySelector(".app-brand strong").textContent = `${roster.faction} Roster Guide`;
  document.querySelector(".app-brand small").textContent = `${detachmentLabel} · ${roster.declared || roster.calculated} pts`;
  const hero = document.querySelector("#start");
  hero.querySelector(".eyebrow").textContent = "Personal roster guide";
  hero.querySelector("h1").textContent = roster.faction;
  hero.querySelector("h1 + p").textContent = detachmentLabel;
  hero.querySelector(".source").textContent = `${roster.units.length} units · ${roster.declared || roster.calculated} pts · generated from New Recruit`;
  hero.querySelector(".lead").textContent = "This guide is reduced to the selected Death Guard detachments, units and recognised loadout.";
  const rosterWarnings = [...(roster.warnings || [])];
  if (!sourceText) rosterWarnings.push('This legacy roster has no source text, so Enhancement owners and derived effects cannot be rebuilt.');
  if (rosterWarnings.length) {
    const warning = document.createElement('p');
    warning.className = 'roster-warning';
    warning.textContent = rosterWarnings.join(' ');
    hero.append(warning);
  }

  document.querySelectorAll(".content-group.detachment").forEach((section) => {
    if (!detachmentIds.has(section.id)) section.remove();
  });
  const usesPactOfDecay = [...document.querySelectorAll('#pact-of-decay-datasheets .unit-card')].some((card) => selected.has(card.id));
  if (!usesPactOfDecay) {
    document.querySelector('#pact-of-decay')?.remove();
    document.querySelector('[data-nav-id="pact-of-decay"]')?.remove();
  }
  document.querySelectorAll('[data-nav-depth="2"][data-nav-id^="detachment-"]').forEach((item) => {
    if (!detachmentIds.has(item.dataset.navId)) item.remove();
  });

  const enhancements = roster.enhancements || (roster.enhancement && roster.enhancement !== "—" ? [roster.enhancement] : []);
  if (!enhancements.length) {
    detachmentIds.forEach((id) => {
      const prefix = id.replace(/^detachment-/, "");
      document.querySelector(`#${CSS.escape(prefix)}-enhancements`)?.remove();
      document.querySelector(`[data-nav-id="${CSS.escape(prefix)}-enhancements"]`)?.remove();
    });
  }

  document.querySelectorAll(".unit-card").forEach((card) => {
    const entry = selected.get(card.id);
    if (!entry) {
      card.remove();
      return;
    }
    const points = card.querySelector(".points");
    if (points) {
      const value=document.createElement('strong');
      value.textContent=`Roster: ${entry.copies > 1 ? `${entry.copies} units · ` : ""}${entry.points} pts`;
      points.replaceChildren(value);
    }
    renderComposition(card,entry.units);
    renderDetachmentKeywords(card);
    window.WHRosterEnhancements?.decorate(card,roster,entry.units);
    card.querySelector('[id$="-wargear-options"]')?.remove();
    if (!entry.loadout.length) return;
    card.querySelectorAll(".weapon-row:not(.weapon-head)").forEach((row) => {
      const weapon = row.querySelector(".weapon-button")?.textContent || row.firstElementChild?.textContent;
      if (weapon && !window.WHRosterEntities.loadoutIncludesProfile(entry.loadout,weapon)) row.remove();
    });
    card.querySelectorAll(".weapon-group").forEach((group) => {
      if (!group.querySelector(".weapon-row:not(.weapon-head)")) group.remove();
    });
  });

  document.querySelectorAll('[data-nav-id^="unit-"]').forEach((item) => {
    if (!selected.has(item.dataset.navId)) item.remove();
  });
  document.querySelectorAll('#datasheets > .content-group[id^="datasheets-"]').forEach((group) => {
    if (group.querySelector(".unit-card")) return;
    document.querySelector(`[data-nav-id="${CSS.escape(group.id)}"]`)?.remove();
    group.remove();
  });

  const detachmentRoot = document.querySelector('[data-nav-id="detachments"]');
  const detachmentItems = [...detachmentIds].map((id) => document.querySelector(`[data-nav-id="${CSS.escape(id)}"]`)).filter(Boolean);
  if (detachmentRoot && detachmentItems.length) {
    detachmentItems.forEach((item) => {
      item.remove();
      item.dataset.navDepth = "1";
      item.querySelectorAll('[data-nav-depth="3"]').forEach((child) => { child.dataset.navDepth = "2"; });
    });
    detachmentRoot.replaceWith(...detachmentItems);
  }

  const unitsRoot = document.querySelector('[data-nav-id="datasheets"]');
  if (unitsRoot) {
    const rootLabel = unitsRoot.querySelector('[data-nav-target="datasheets"]');
    if (rootLabel) rootLabel.textContent = "Units";
    const branch = [...unitsRoot.children].find((child) => child.matches("ul"));
    const unitItems = [...unitsRoot.querySelectorAll('[data-nav-id^="unit-"]')];
    unitItems.forEach((item) => {
      item.dataset.navDepth = "2";
      const entry = selected.get(item.dataset.navId);
      const label = item.querySelector(".toc-label");
      if (label && entry?.copies > 1) label.textContent += ` ×${entry.copies}`;
    });
    branch?.replaceChildren(...unitItems);
  }
  const datasheetTitle = document.querySelector("#datasheets > .section-title");
  if (datasheetTitle) datasheetTitle.textContent = "Units";

  document.querySelectorAll("#updates .content-block").forEach((block) => {
    const text = normalize(block.textContent);
    const relevant = text.includes("nurgle s gift") || [...selected.keys()].some((id) => text.includes(normalize(id.replace(/^unit-/, ""))));
    if (!relevant) block.remove();
  });
})();

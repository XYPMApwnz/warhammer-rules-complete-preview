(function () {
  'use strict';

  const data = window.CORE_RULES;
  const pdfSource = window.CORE_PDF_SOURCE;
  const documentRoot = document.getElementById('rulesDocument');
  const tocRoot = document.getElementById('tocTree');

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function sourcePageControl(pageNumber, linkLabel) {
    if (!data.meta.pdfPath) {
      return element('span', 'source-page-label', `Page ${pageNumber}`);
    }
    const link = element('a', '', linkLabel);
    link.href = `${data.meta.pdfPath}#page=${pageNumber}`;
    link.target = '_blank';
    link.rel = 'noreferrer';
    return link;
  }

  function termButton(id) {
    const term = data.terms[id];
    const button = element('button', 'term-link', term?.title || id);
    button.type = 'button';
    button.dataset.term = id;
    return button;
  }

  function addTerms(container, ids = []) {
    const valid = ids.filter((id) => data.terms[id]);
    if (!valid.length) return;
    const strip = element('div', 'term-strip');
    valid.forEach((id) => strip.append(termButton(id)));
    container.append(strip);
  }

  function renderBlock(block) {
    if (block.type === 'rule') {
      const card = element('article', 'rule-card');
      card.id = block.id;
      const meta = element('div', 'rule-meta');
      meta.append(element('span', '', `RULE // ${block.code}`), element('span', '', data.meta.edition));
      card.append(meta, element('h4', '', block.title), element('p', '', block.text));
      addTerms(card, block.terms);
      return card;
    }
    if (block.type === 'callout') {
      const card = element('aside', `callout ${block.tone || ''}`);
      card.append(element('span', 'micro-label', block.tone === 'alert' ? 'IMPORTANT' : 'REFERENCE'), element('h4', '', block.title), element('p', '', block.text));
      addTerms(card, block.terms);
      return card;
    }
    if (block.type === 'stats') {
      const card = element('article', 'stats-card');
      card.append(element('span', 'micro-label', 'DATASHEET // PROFILE'), element('h4', '', block.title));
      const line = element('div', 'statline');
      block.values.forEach(([key, value]) => { const item = element('div'); item.append(element('b', '', key), element('span', '', value)); line.append(item); });
      card.append(line);
      return card;
    }
    if (block.type === 'weapons') {
      const card = element('article', 'weapon-card');
      card.append(element('span', 'micro-label', 'REFERENCE TABLE'), element('h4', '', block.title));
      const table = element('div', 'weapon-table');
      table.setAttribute('role', 'table');
      table.setAttribute('aria-label', block.title);
      const labels = ['WEAPON','RANGE','A','BS/WS','S','AP','D'];
      const head = element('div', 'weapon-row weapon-head');
      labels.forEach((label) => head.append(element('div', '', label)));
      table.append(head);
      block.rows.forEach((row) => {
        const line = element('div', 'weapon-row');
        row.slice(0, 7).forEach((value, index) => {
          const cell = element('div');
          cell.dataset.label = labels[index];
          if (index === 0) { cell.append(element('b', '', value)); if (row[7]) cell.append(element('small', '', row[7])); }
          else cell.textContent = value;
          line.append(cell);
        });
        table.append(line);
      });
      card.append(table);
      return card;
    }
    if (block.type === 'steps') {
      const card = element('article', 'steps-card');
      card.append(element('span', 'micro-label', 'SEQUENCE'), element('h4', '', block.title));
      const list = element('div', 'step-list');
      block.steps.forEach(([number, title, copy]) => { const item = element('div', 'step'); const body = element('div'); body.append(element('strong', '', title), element('span', '', copy)); item.append(element('b', '', number), body); list.append(item); });
      card.append(list);
      return card;
    }
    if (block.type === 'phase-rail') {
      const card = element('article', 'phase-card');
      const rail = element('div', 'phase-rail');
      block.phases.forEach(([number, title]) => { const item = element('div'); item.append(element('b', '', number), element('span', '', title)); rail.append(item); });
      card.append(rail);
      return card;
    }
    if (block.type === 'stratagem') {
      const card = element('article', 'stratagem-card');
      const head = element('div', 'stratagem-head');
      const cp = element('strong', 'cp'); cp.append(document.createTextNode(block.cp), element('small', '', 'CP'));
      head.append(element('h4', '', block.name), cp);
      const grid = element('div', 'stratagem-grid');
      [['WHEN',block.when],['TARGET',block.target],['EFFECT',block.effect]].forEach(([label, copy]) => { const row = element('div'); row.append(element('b', '', label), element('span', '', copy)); grid.append(row); });
      card.append(head, grid);
      return card;
    }
    if (block.type === 'ability-grid') {
      const card = element('article', 'ability-grid');
      const grid = element('div', 'abilities');
      block.abilities.forEach(([title, copy]) => { const item = element('article', 'ability'); item.append(element('h4', '', title), element('p', '', copy)); grid.append(item); });
      card.append(grid);
      return card;
    }
    return element('div');
  }

  function renderGlossary(body) {
    const tools = element('div', 'glossary-tools');
    const label = document.createElement('label'); label.setAttribute('for', 'glossarySearch');
    const input = document.createElement('input'); input.id = 'glossarySearch'; input.type = 'search'; input.placeholder = 'Filter terms…'; input.autocomplete = 'off';
    label.append(element('span', '', '⌕'), input);
    const clear = element('button', '', 'Reset'); clear.id = 'glossaryClear'; clear.type = 'button';
    tools.append(label, clear);
    const grid = element('div', 'glossary-grid'); grid.id = 'glossaryGrid';
    Object.entries(data.terms).sort((a,b) => a[1].title.localeCompare(b[1].title)).forEach(([id, term]) => {
      const card = element('article', 'glossary-card');
      card.id = `glossary-${id}`; card.dataset.glossaryTitle = term.title; card.dataset.glossarySearch = `${term.title} ${term.summary}`.toLocaleLowerCase('en');
      card.append(element('span', 'source-kind', 'CONNECTED TERM'), element('h4', '', term.title), element('p', '', term.summary), termButton(id));
      grid.append(card);
    });
    data.groups.flatMap((group) => group.sections).forEach((section) => {
      (pdfSource.rules?.[section.id] || []).forEach((rule) => {
        const target = ruleAnchor(section.id, rule.code);
        const card = element('article', 'glossary-card source-glossary-card');
        card.id = `glossary-${target}`;
        card.dataset.glossaryTitle = rule.title;
        card.dataset.glossarySearch = `${rule.code} ${rule.title} ${rule.text}`.toLocaleLowerCase('en');
        const action = element('button', 'glossary-rule-action', 'To rule →');
        action.type = 'button';
        action.dataset.journeyTarget = target;
        action.dataset.journeyType = 'rule';
        action.dataset.actionKey = `glossary-${target}`;
        card.append(element('span', 'source-kind', 'SOURCE RULE'), element('h4', '', rule.title), element('p', '', sourceExcerpt(rule.text)), action);
        grid.append(card);
      });
    });
    pdfSource.appendix.forEach((article) => {
      const target = `appendix-${article.id}`;
      const card = element('article', 'glossary-card source-glossary-card');
      card.id = `glossary-${target}`;
      card.dataset.glossaryTitle = article.title;
      card.dataset.glossarySearch = article.title.toLocaleLowerCase('en');
      const action = element('button', 'glossary-rule-action', 'To rule →');
      action.type = 'button';
      action.dataset.journeyTarget = target;
      action.dataset.journeyType = 'rule';
      action.dataset.actionKey = `glossary-${target}`;
      card.append(element('span', 'source-kind', 'APPENDIX'), element('h4', '', article.title), action);
      grid.append(card);
    });
    const empty = element('p', 'no-results', 'No matching terms.'); empty.id = 'noResults'; empty.hidden = true; grid.append(empty);
    body.append(tools, grid);
  }

  function renderPdfSource(section, body) {
    const pageNumbers = pdfSource?.sections?.[section.id] || [];
    if (!pageNumbers.length) return;
    const details = element('details', 'pdf-source');
    const summary = element('summary');
    const pagesLabel = pageNumbers.length === 1 ? `PAGE ${pageNumbers[0]}` : `PAGES ${pageNumbers[0]}–${pageNumbers.at(-1)}`;
    summary.append(element('span', '', 'PDF'), element('strong', '', 'Original source text'), element('small', '', pagesLabel));
    details.append(summary);
    const pages = element('div', 'pdf-pages');
    pageNumbers.forEach((pageNumber) => {
      const page = element('section', 'pdf-page');
      const head = element('header');
      const link = sourcePageControl(pageNumber, 'Open PDF page ↗');
      head.append(element('b', '', `SOURCE PAGE // ${pageNumber}`), link);
      page.append(head, element('pre', '', pdfSource.pages[String(pageNumber)] || 'Page text was not extracted.'));
      pages.append(page);
    });
    details.append(pages);
    body.append(details);
  }

  function ruleAnchor(sectionId, code) {
    return `${sectionId}-rule-${code.replace('.', '-')}`;
  }

  function sourceExcerpt(value) {
    const lines = value.split('\n').map((line) => line.trim()).filter(Boolean);
    const kept = [];
    const hardStops = /^(SEE ALSO|BOYZ|RANGED WEAPONS|MELEE WEAPONS|WARGEAR OPTIONS|UNIT COMPOSITION|CONTINUED IN THE APP|DIGITAL SUPPORT)$/;
    for (const line of lines) {
      const accumulated = kept.join(' ').length;
      const letters = [...line].filter((character) => /[A-Za-z]/.test(character)).join('');
      const isHeading = letters.length > 2 && letters === letters.toUpperCase() && line.length < 64 && !line.startsWith('▪');
      if (kept.length && (hardStops.test(line) || (accumulated > 180 && isHeading))) break;
      kept.push(line);
      if (accumulated > 1100) break;
    }
    let excerpt = kept.join(' ').replace(/\s+/g, ' ').trim();
    if (excerpt.length > 900) {
      const sentence = excerpt.lastIndexOf('.', 900);
      excerpt = `${excerpt.slice(0, sentence > 520 ? sentence + 1 : 900).trim()}…`;
    }
    return excerpt;
  }

  function sourceRuleCard(sectionId, rule) {
    const card = element('article', 'pdf-rule');
    card.id = ruleAnchor(sectionId, rule.code);
    card.dataset.sourceRule = rule.code;
    card.dataset.ref = rule.code;
    const head = element('header');
    const source = element('span', '', 'CORE RULE');
    const pageLink = sourcePageControl(rule.page, `PDF page ${rule.page} ↗`);
    head.append(source, pageLink);
    card.append(head, element('h4', '', rule.title), element('div', 'pdf-rule-text', sourceExcerpt(rule.text)));
    return card;
  }

  function renderSourceRules(section, body) {
    const rules = pdfSource?.rules?.[section.id] || [];
    if (rules.length) {
      rules.forEach((rule) => {
        const card = sourceRuleCard(section.id, rule);
        card.dataset.track = card.id;
        body.append(card);
      });
      return true;
    }
    if (section.id !== 'rules-appendix') return false;
    pdfSource.appendix.forEach((article) => {
      const card = element('article', 'pdf-rule appendix-rule');
      card.id = `appendix-${article.id}`;
      card.dataset.track = card.id;
      const head = element('header');
      const link = sourcePageControl(article.page, 'Open source page ↗');
      head.append(element('span', '', 'APPENDIX'), link);
      card.append(head, element('h4', '', article.title));
      body.append(card);
    });
    return true;
  }

  function renderDocument() {
    const cover = element('section', 'cover'); cover.id = 'cover'; cover.dataset.track = 'cover';
    const copy = element('div', 'cover-copy');
    const title = document.createElement('h1'); title.append(document.createTextNode('Rules'), document.createElement('br'), element('em', '', 'of war.'));
    const meta = element('div', 'cover-meta'); ['11TH EDITION','ORIGINAL ENGLISH','PDF SOURCE','FILE:// READY'].forEach((item) => meta.append(element('span', '', item)));
    copy.append(element('span', 'micro-label', 'CORE RULES // FIELD MANUAL'), title, element('p', '', 'An interactive field reference built directly from the original Core Rules PDF.'), meta);
    const plate = element('div', 'cover-plate'); plate.setAttribute('aria-hidden','true'); plate.append(element('span','', 'WARHAMMER 40,000'), element('strong','', 'CORE\nRULES'), element('i','', '11'), element('small','', 'BATTLE PROTOCOL'));
    cover.append(copy, plate); documentRoot.append(cover);
    const notice = element('aside', 'prototype-notice'); notice.append(element('b', '', 'PROTOTYPE NOTICE'), document.createTextNode(data.meta.notice)); documentRoot.append(notice);

    const introduction = element('section', 'chapter-group introduction');
    introduction.id = data.introduction.id;
    introduction.dataset.track = data.introduction.id;
    const introductionHeading = element('header', 'group-heading');
    const introductionCopy = element('div');
    introductionCopy.append(element('h2', '', data.introduction.title), element('p', '', data.introduction.summary));
    introductionHeading.append(introductionCopy);
    const introductionBody = element('div', 'section-body');
    renderPdfSource(data.introduction, introductionBody);
    introduction.append(introductionHeading, introductionBody);
    documentRoot.append(introduction);

    data.groups.forEach((group) => {
      const groupSection = element('section', 'chapter-group'); groupSection.id = group.id; groupSection.dataset.track = group.id;
      const heading = element('header', 'group-heading');
      const copyWrap = element('div'); copyWrap.append(element('h2', '', group.title), element('p', '', group.description));
      heading.append(copyWrap);
      groupSection.append(heading);
      group.sections.forEach((section) => {
        const sectionNode = element('section', 'rule-section'); sectionNode.id = section.id; sectionNode.dataset.track = section.id;
        sectionNode.dataset.ref = section.number;
        const titleWrap = element('header', 'section-title');
        const headingCopy = element('div'); headingCopy.append(element('h3', '', section.title), element('p', '', section.summary));
        titleWrap.append(headingCopy);
        const body = element('div', 'section-body');
        if (section.id === 'glossary') renderGlossary(body);
        else if (!renderSourceRules(section, body)) body.append(element('div', 'index-only', 'The original source pages for this section are available below.'));
        renderPdfSource(section, body);
        sectionNode.append(titleWrap, body); groupSection.append(sectionNode);
      });
      documentRoot.append(groupSection);
    });

    const glossaryTool = element('section', 'chapter-group reader-tool-section');
    glossaryTool.id = 'glossary';
    glossaryTool.dataset.track = 'glossary';
    const glossaryHeading = element('header', 'group-heading');
    const glossaryCopy = element('div');
    glossaryCopy.append(element('h2', '', 'Rules Glossary'), element('p', '', 'Search every extracted source rule, Core Ability, Appendix article and connected term. This reader tool is separate from the PDF contents.'));
    glossaryHeading.append(glossaryCopy);
    const glossaryBody = element('div', 'section-body');
    renderGlossary(glossaryBody);
    glossaryTool.append(glossaryHeading, glossaryBody);
    documentRoot.append(glossaryTool);
    documentRoot.append(element('footer', 'document-footer', `${data.meta.source.toUpperCase()} // ${data.meta.version.toUpperCase()}`));
  }

  function navNode(id, title, depth, children = []) {
    const node = element('div', 'toc-node'); node.dataset.navId = id; node.dataset.navDepth = String(depth);
    const row = element('div', `toc-row${children.length ? '' : ' no-branch'}`);
    const target = element('button', 'toc-target'); target.type = 'button'; target.dataset.navTarget = id;
    target.append(element('span', '', title)); row.append(target);
    if (children.length) { const toggle = element('button', 'toc-toggle', '▶'); toggle.type = 'button'; toggle.dataset.navToggle = ''; toggle.setAttribute('aria-label', `Expand ${title}`); toggle.setAttribute('aria-expanded','false'); toggle.setAttribute('aria-controls', `branch-${id}`); row.append(toggle); }
    node.append(row);
    if (children.length) { const branch = element('div', 'toc-branch'); branch.id = `branch-${id}`; branch.dataset.navBranch = ''; branch.hidden = true; children.forEach((child) => branch.append(child)); node.append(branch); }
    return node;
  }

  function renderNavigation() {
    tocRoot.append(navNode(data.introduction.id, data.introduction.title, 0));
    data.groups.forEach((group) => {
      const sections = group.sections.map((section) => {
        const rules = pdfSource.rules?.[section.id] || [];
        const children = section.id === 'rules-appendix'
          ? pdfSource.appendix.map((article) => navNode(`appendix-${article.id}`, article.title, 2))
          : rules.map((rule) => navNode(ruleAnchor(section.id, rule.code), rule.title, 2));
        return navNode(section.id, section.title, 1, children);
      });
      tocRoot.append(navNode(group.id, group.title, 0, sections));
    });
    const divider = element('div', 'toc-divider');
    divider.append(element('span', '', 'READER TOOLS'));
    tocRoot.append(divider, navNode('glossary', 'Rules Glossary', 0));
  }

  renderDocument();
  renderNavigation();
  window.CORE_RENDER = Object.freeze({ data, element, ruleAnchor });
}());

(function () {
  'use strict';

  const navButton = document.getElementById('navButton');
  const scrim = document.getElementById('navScrim');
  const dialog = document.getElementById('termDialog');
  const title = document.getElementById('termTitle');
  const summary = document.getElementById('termSummary');
  const full = document.getElementById('termFull');
  const nav = document.getElementById('mobileNav');
  const relatedRules = document.getElementById('relatedRules');
  const relatedContent = document.getElementById('relatedRulesContent');
  const relatedDetachment = document.getElementById('relatedDetachment');
  const drawerMedia = window.matchMedia('(max-width: 800px)');
  let gesture = null;
  let suppressed = null;
  let opener = null;
  let openedByTouch = false;
  let relatedLoaded = false;
  let relatedKind = 'stratagems';
  const unit = document.querySelector('.unit-card');

  function drawer(open) {
    document.body.classList.toggle('nav-drawer-open', open);
    navButton.setAttribute('aria-expanded', String(open));
    nav.setAttribute('aria-hidden', String(!open));
    scrim.hidden = !open;
  }

  function syncDrawerMode() {
    if (drawerMedia.matches) drawer(false);
    else {
      document.body.classList.remove('nav-drawer-open');
      nav.setAttribute('aria-hidden', 'false');
      scrim.hidden = true;
    }
  }

  function showTerm(trigger, byTouch) {
    const id = trigger.dataset.term;
    const termTitle = trigger.dataset.termTitle || trigger.textContent.trim();
    const termSummary = trigger.dataset.termSummary;
    if (!id || !termSummary) return;
    opener = trigger;
    openedByTouch = byTouch;
    title.textContent = termTitle;
    summary.textContent = termSummary;
    full.href = `../../../glossary/index.html#${id}`;
    dialog.showModal();
  }

  function filterRelated() {
    if (!relatedContent || !unit) return;
    const selected = relatedDetachment.value;
    const unitProfile = window.DGRelatedRules.profile(unit);
    relatedContent.querySelectorAll('.stratagem,.enhancement').forEach(card => {
      card.hidden = !window.DGRelatedRules.matches(card, unitProfile);
    });
    const enhancementTab = relatedRules.querySelector('[data-related-tab="enhancements"]');
    const hasEnhancements = [...relatedContent.querySelectorAll('.enhancement')].some(card => !card.hidden);
    if (enhancementTab) enhancementTab.hidden = !hasEnhancements;
    if (relatedKind === 'enhancements' && !hasEnhancements) relatedKind = 'stratagems';
    relatedContent.querySelectorAll('[data-related-kind]').forEach(group => {
      group.hidden = group.dataset.relatedKind !== relatedKind || ![...group.querySelectorAll('.stratagem,.enhancement')].some(card => !card.hidden);
    });
    relatedContent.querySelectorAll('.related-detachment').forEach(section => {
      const chosen = section.dataset.detachment === 'core' || selected === 'all' || section.dataset.detachment === selected;
      section.hidden = !chosen || ![...section.querySelectorAll('[data-related-kind]')].some(group => !group.hidden);
    });
    relatedRules.querySelectorAll('[data-related-tab]').forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.relatedTab === relatedKind));
    });
  }

  async function loadRelated() {
    if (relatedLoaded) return;
    try {
      const response = await fetch('./related-rules.inc?v=2');
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      relatedContent.innerHTML = await response.text();
      relatedLoaded = true;
      filterRelated();
    } catch {
      relatedContent.innerHTML = '<p class="related-status">Could not load related rules. Check the connection and try again.</p>';
    }
  }

  document.addEventListener('pointerdown', event => {
    if (event.pointerType === 'mouse' || !event.isPrimary) return;
    const trigger = event.target.closest('[data-term]');
    gesture = trigger ? { trigger, id: event.pointerId, x: event.clientX, y: event.clientY, moved: false } : null;
  }, { capture: true, passive: true });

  document.addEventListener('pointermove', event => {
    if (!gesture || gesture.id !== event.pointerId) return;
    if (Math.hypot(event.clientX - gesture.x, event.clientY - gesture.y) > 10) gesture.moved = true;
  }, { capture: true, passive: true });

  document.addEventListener('pointerup', event => {
    if (!gesture || gesture.id !== event.pointerId) return;
    suppressed = { trigger: gesture.trigger, until: performance.now() + 700 };
    if (!gesture.moved) showTerm(gesture.trigger, true);
    gesture = null;
  }, { capture: true, passive: true });

  document.addEventListener('pointercancel', () => { gesture = null; }, { capture: true, passive: true });

  document.addEventListener('click', event => {
    const local = event.target.closest('[data-journey-target]');
    if (local) {
      document.getElementById(local.dataset.journeyTarget)?.scrollIntoView({ block: 'start' });
      return;
    }

    const trigger = event.target.closest('[data-term]');
    if (!trigger) return;
    if (suppressed?.trigger === trigger && performance.now() < suppressed.until) {
      event.preventDefault();
      return;
    }
    showTerm(trigger, false);
  });

  navButton.addEventListener('click', () => drawer(!document.body.classList.contains('nav-drawer-open')));
  scrim.addEventListener('click', () => drawer(false));
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
  dialog.addEventListener('close', () => {
    if (openedByTouch) requestAnimationFrame(() => opener?.blur());
    openedByTouch = false;
  });
  if (relatedRules) {
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(entries => {
        if (!entries.some(entry => entry.isIntersecting)) return;
        observer.disconnect();
        loadRelated();
      }, { rootMargin: '600px 0px' });
      observer.observe(relatedRules);
    } else loadRelated();
  }
  if (relatedDetachment) {
    try {
      const saved = localStorage.getItem('death-guard-detachment-filter');
      if (saved && relatedDetachment.querySelector(`option[value="${CSS.escape(saved)}"]`)) relatedDetachment.value = saved;
    } catch {}
    relatedDetachment.addEventListener('change', () => {
      try { localStorage.setItem('death-guard-detachment-filter', relatedDetachment.value); } catch {}
      filterRelated();
    });
    filterRelated();
  }
  relatedRules?.addEventListener('click', event => {
    const tab = event.target.closest('[data-related-tab]');
    if (tab) {
      relatedKind = tab.dataset.relatedTab;
      filterRelated();
    }
  });
  drawerMedia.addEventListener?.('change', syncDrawerMode);
  syncDrawerMode();
}());

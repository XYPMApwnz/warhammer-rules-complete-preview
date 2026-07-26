(function () {
  'use strict';

  const navButton = document.getElementById('navButton');
  const scrim = document.getElementById('navScrim');
  const dialog = document.getElementById('termDialog');
  const title = document.getElementById('termTitle');
  const summary = document.getElementById('termSummary');
  const full = document.getElementById('termFull');
  const nav = document.getElementById('mobileNav');
  const drawerMedia = window.matchMedia('(max-width: 800px)');
  let gesture = null;
  let suppressed = null;
  let opener = null;
  let openedByTouch = false;

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
  drawerMedia.addEventListener?.('change', syncDrawerMode);
  syncDrawerMode();
}());

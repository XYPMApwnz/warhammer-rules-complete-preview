import {createLifecycle} from './lifecycle.mjs';

const cardLayouts = new WeakMap();
const lifecycleByDocument = new WeakMap();

function watchLifecycle(ownerDocument, view, registration) {
  let lifecycle = lifecycleByDocument.get(ownerDocument);
  if (!lifecycle) {
    const registrations = new Set();
    const observer = new view.MutationObserver(() => {
      for (const item of [...registrations]) {
        const connected = item.layouts.some(layout => layout.card.isConnected);
        if (connected && !item.wasConnected) {
          item.wasConnected = true;
          item.schedule();
        } else if (!connected && item.wasConnected) item.destroy();
      }
    });
    observer.observe(ownerDocument.documentElement, {childList: true, subtree: true});
    lifecycle = {registrations, observer};
    lifecycleByDocument.set(ownerDocument, lifecycle);
  }
  lifecycle.registrations.add(registration);
  return () => {
    lifecycle.registrations.delete(registration);
    if (!lifecycle.registrations.size) {
      lifecycle.observer.disconnect();
      lifecycleByDocument.delete(ownerDocument);
    }
  };
}

const direct = (root, selector) =>
  Array.from(root?.children || []).find(node => node.matches?.(selector)) || null;

const directParts = card =>
  Array.from(card.children).filter(node => node.matches?.('.unit-part'));

const section = (parts, role) =>
  parts.find(part => part.dataset.datasheetSection === role) || null;

function restoreAbilities(layout) {
  layout.cards.forEach(node => layout.list.append(node));
  layout.continuation?.remove();
}

function placeProfileStrip(layout) {
  const {card, localNav, profileStrip, phoneMedia} = layout;
  if (!profileStrip) return;
  if (phoneMedia.matches && localNav) localNav.after(profileStrip);
  else if (localNav) card.insertBefore(profileStrip, localNav);
  else if (layout.grid) card.insertBefore(profileStrip, layout.grid);
}

function balanceAbilities(layout) {
  restoreAbilities(layout);
  if (layout.cards.length < 2 || !layout.card.isConnected) return;

  const arsenalBox = layout.arsenal.getBoundingClientRect();
  const supportBox = layout.support.getBoundingClientRect();
  const parallel = Math.abs(arsenalBox.top - supportBox.top) <= 1
    && supportBox.left > arsenalBox.left + 1;
  if (!parallel || !arsenalBox.width) return;

  let split = layout.cards.length;
  for (let index = 0; index < layout.cards.length; index += 1) {
    if (layout.cards[index].getBoundingClientRect().bottom > arsenalBox.bottom + 1) {
      split = Math.max(1, index);
      break;
    }
  }
  if (split >= layout.cards.length) return;

  if (!layout.continuation) {
    layout.continuation = layout.card.ownerDocument.createElement('div');
    layout.continuation.className = 'ability-list ds-abilities-continuation';
  }
  layout.arsenal.append(layout.continuation);
  layout.cards.slice(split).forEach(node => layout.continuation.append(node));
}

function enhance(card, phoneMedia) {
  const existing = cardLayouts.get(card);
  if (existing) return existing;

  const parts = directParts(card);
  const profile = section(parts, 'profile');
  const abilities = section(parts, 'abilities');
  const originalNodes = [...card.childNodes];
  const profileNodes = profile ? [...profile.childNodes] : [];
  const profileHeading = profile && direct(profile, 'h4');
  const headingNodes = profileHeading ? [...profileHeading.childNodes] : [];
  const hadLayoutClass = card.classList.contains('ds-layout');
  const localNav = direct(card, '.local-nav');
  let profileStrip = null;

  if (profile) {
    const profiles = Array.from(profile.children).filter(node =>
      node.matches?.('.model-profile,.statline,.profile-base,.ds-effective-profile-group')
    );
    if (profiles.length) {
      profileStrip = card.ownerDocument.createElement('div');
      profileStrip.className = 'ds-profile-strip';
      profileStrip.dataset.logicalOwner = profile.id || profile.dataset.datasheetSection;
      profiles.forEach(node => profileStrip.append(node));
    }
  }

  let grid = null;
  let arsenal = null;
  let support = null;
  let list = null;
  if (profile && abilities) {
    grid = card.ownerDocument.createElement('div');
    grid.className = 'ds-main-grid';
    arsenal = card.ownerDocument.createElement('div');
    arsenal.className = 'ds-arsenal';
    support = card.ownerDocument.createElement('div');
    support.className = 'ds-support';
    card.insertBefore(grid, profile);
    grid.append(arsenal, support);
    arsenal.append(profile);
    support.append(abilities);
    const profileHeading = direct(profile, 'h4');
    if (profileHeading) profileHeading.textContent = 'Weapons';
    list = direct(abilities, '.ability-list') || abilities.querySelector('.ability-list');
  }

  const layout = {
    card,
    originalNodes,
    profile,
    profileNodes,
    profileHeading,
    headingNodes,
    hadLayoutClass,
    localNav,
    profileStrip,
    phoneMedia,
    grid,
    arsenal,
    support,
    list,
    listNodes: list ? [...list.childNodes] : [],
    cards: list
      ? Array.from(list.children).filter(node => node.matches?.('.ability'))
      : [],
    continuation: null,
    lastWidth: 0
  };
  cardLayouts.set(card, layout);
  card.classList.add('ds-layout');
  placeProfileStrip(layout);
  return layout;
}

const cardsWithin = root => [
  ...(root?.matches?.('.unit-card') ? [root] : []),
  ...(root?.querySelectorAll?.('.unit-card') || [])
];

/**
 * Finish registered datasheet layout before another presentation system reads
 * document geometry. Installed resize and lifecycle observers remain active.
 */
export function flushDatasheetLayouts(root) {
  const flushes = new Set();
  cardsWithin(root).forEach(card => {
    const flush = cardLayouts.get(card)?.flush;
    if (flush) flushes.add(flush);
  });
  flushes.forEach(flush => flush());
  return root;
}

/**
 * Apply the V1 datasheet column treatment to cards already rendered by V2.
 * The renderer owns all factual and interactive nodes; this module only moves
 * those nodes into the V1 presentation containers.
 */
export function installDatasheetLayout(root, view = window, {lifecycle: parentLifecycle} = {}) {
  if (!root) throw new TypeError('A datasheet root is required');

  const lifecycle = createLifecycle(view);
  const phoneMedia = view.matchMedia('(max-width: 900px)');
  const cards = cardsWithin(root);
  // A card has one presentation owner, including repeated standalone installs.
  new Set(cards.map(card => cardLayouts.get(card)?.destroy).filter(Boolean)).forEach(destroy => destroy());
  const layouts = cards.map(card => enhance(card, phoneMedia));
  let frame = 0;
  let ready = Promise.resolve();
  let finishReady = null;
  let destroyed = false;
  let removeParentCleanup;

  const runLayout = () => {
    layouts.forEach(layout => {
      placeProfileStrip(layout);
      if (layout.arsenal && layout.support && layout.list) balanceAbilities(layout);
    });
  };

  const flush = () => {
    if (destroyed) return root;
    if (frame) {
      lifecycle.cancelFrame(frame);
      frame = 0;
      const finish = finishReady;
      finishReady = null;
      finish?.();
    }
    runLayout();
    return root;
  };
  layouts.forEach(layout => { layout.flush = flush; });

  const schedule = () => {
    if (destroyed || frame) return ready;
    ready = new Promise(resolve => { finishReady = resolve; });
    frame = lifecycle.frame(() => {
      frame = 0;
      try {
        runLayout();
      } finally {
        const finish = finishReady;
        finishReady = null;
        finish?.();
      }
    });
    return ready;
  };

  const resizeObserver = 'ResizeObserver' in view
    ? lifecycle.observe(new view.ResizeObserver(lifecycle.guard(entries => {
        let changed = false;
        entries.forEach(entry => {
          const layout = cardLayouts.get(entry.target);
          if (!layout) return;
          const width = entry.contentRect.width;
          if (Math.abs(width - layout.lastWidth) > .5) {
            layout.lastWidth = width;
            changed = true;
          }
        });
        if (changed) schedule();
      })))
    : null;
  layouts.forEach(layout => resizeObserver?.observe(layout.card));

  const ownerDocument = root.ownerDocument || view.document;
  const onViewportChange = () => schedule();
  lifecycle.listen(view, 'resize', onViewportChange, {passive: true});
  if (phoneMedia.addEventListener) lifecycle.listen(phoneMedia, 'change', onViewportChange);
  ownerDocument?.fonts?.ready.then(lifecycle.guard(schedule));
  let unwatchLifecycle = () => {};
  const destroy = () => {
    if (destroyed) return;
    destroyed = true;
    removeParentCleanup?.();
    if (frame) {
      lifecycle.cancelFrame(frame);
      frame = 0;
      finishReady?.();
      finishReady = null;
    }
    lifecycle.destroy();
    unwatchLifecycle();
    layouts.forEach(layout => {
      restoreAbilities(layout);
      if (layout.list) layout.list.replaceChildren(...layout.listNodes);
      if (layout.profile) layout.profile.replaceChildren(...layout.profileNodes);
      if (layout.profileHeading) layout.profileHeading.replaceChildren(...layout.headingNodes);
      layout.card.replaceChildren(...layout.originalNodes);
      layout.card.classList.toggle('ds-layout', layout.hadLayoutClass);
      cardLayouts.delete(layout.card);
      delete layout.flush;
      delete layout.destroy;
    });
  };
  layouts.forEach(layout => { layout.destroy = destroy; });
  if (ownerDocument?.documentElement) {
    const registration = {
      layouts,
      schedule,
      destroy,
      wasConnected: layouts.some(layout => layout.card.isConnected)
    };
    unwatchLifecycle = watchLifecycle(ownerDocument, view, registration);
  }
  removeParentCleanup = parentLifecycle?.cleanup(destroy);
  schedule();

  return Object.freeze({
    ready: () => ready,
    schedule,
    destroy
  });
}

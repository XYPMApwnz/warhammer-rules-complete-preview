(function () {
  'use strict';
  const key = 'wh40k-mega-glossary-return';
  const lifetime = 30 * 60 * 1000;
  const root = new URL('.', document.currentScript.src);
  function clear() { try { sessionStorage.removeItem(key); } catch {} }
  function read() {
    try {
      const record = JSON.parse(sessionStorage.getItem(key) || 'null');
      const target = record?.path ? new URL(record.path, location.origin) : null;
      if (record?.v !== 1 || !Number.isFinite(record.createdAt) || Date.now() - record.createdAt > lifetime || target?.origin !== location.origin || !target.pathname.startsWith(root.pathname)) {
        clear();
        return null;
      }
      return record;
    } catch { clear(); return null; }
  }
  function save(extra = {}) {
    if (!location.pathname.startsWith(root.pathname)) return;
    try { sessionStorage.setItem(key, JSON.stringify({v:1,createdAt:Date.now(),path:location.pathname+location.search+location.hash,scrollX:window.scrollX||0,scrollY:window.scrollY||0,...extra})); } catch {}
  }
  function matchesCurrent(record = read()) {
    if (!record) return false;
    const target = new URL(record.path, location.origin);
    return target.pathname === location.pathname && target.search === location.search;
  }
  window.WHGlossaryReturn = Object.freeze({href:path=>new URL(path,root).href,save,read,clear,matchesCurrent});
}());

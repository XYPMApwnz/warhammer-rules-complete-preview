(function () {
  'use strict';
  const key = 'wh40k-mega-glossary-return';
  const lifetime = 30 * 60 * 1000;
  const root = new URL('.', document.currentScript.src);
  const targetFor = record => record?.path ? new URL(record.path, location.origin) : null;
  function clear() { try { sessionStorage.removeItem(key); } catch {} }
  function read() {
    try {
      const record = JSON.parse(sessionStorage.getItem(key) || 'null');
      const target = targetFor(record);
      if (record?.v !== 1 || !Number.isFinite(record.createdAt) || Date.now() - record.createdAt > lifetime || target?.origin !== location.origin || !target.pathname.startsWith(root.pathname)) {
        clear();
        return null;
      }
      return record;
    } catch { clear(); return null; }
  }
  function save(extra = {}) {
    if (!location.pathname.startsWith(root.pathname)) return;
    try { sessionStorage.setItem(key, JSON.stringify({v:1,createdAt:Date.now(),path:location.pathname+location.search+location.hash,scrollX:window.scrollX||0,scrollY:window.scrollY||0,restoreMode:'automatic',...extra})); } catch {}
  }
  function setRestoreMode(mode) {
    if (mode !== 'automatic' && mode !== 'manual') return;
    const record = read();
    if (!record) return;
    try { sessionStorage.setItem(key, JSON.stringify({...record,restoreMode:mode})); } catch {}
  }
  function isSameDocument(record = read()) {
    const target = targetFor(record);
    if (!target) return false;
    return target.pathname === location.pathname && target.search === location.search;
  }
  function isExactReturnTarget(record = read()) {
    const target = targetFor(record);
    return isSameDocument(record) && target.hash === location.hash;
  }
  function shouldRestoreAutomatically(record = read()) {
    return (record?.restoreMode || 'automatic') === 'automatic' && isExactReturnTarget(record);
  }
  window.WHGlossaryReturn = Object.freeze({href:path=>new URL(path,root).href,save,read,clear,setRestoreMode,isSameDocument,isExactReturnTarget,shouldRestoreAutomatically});
}());

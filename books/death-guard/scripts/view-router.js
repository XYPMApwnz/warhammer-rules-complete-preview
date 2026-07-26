(function () {
  'use strict';

  const requested = new URLSearchParams(location.search).get('view');
  const explicit = requested === 'mobile' || requested === 'full' ? requested : '';
  let saved = '';
  try {
    if (explicit) localStorage.setItem('dg-reader-view', explicit);
    saved = localStorage.getItem('dg-reader-view');
  } catch {}
  const phoneUserAgent = navigator.userAgentData?.mobile === true || /iPhone|iPod|Android.+Mobile/i.test(navigator.userAgent);
  const smallTouchScreen = matchMedia('(pointer: coarse)').matches && Math.min(screen.width, screen.height) <= 600;
  const phone = phoneUserAgent || smallTouchScreen || matchMedia('(max-width: 600px)').matches;
  const view = explicit || (saved === 'mobile' || saved === 'full' ? saved : '') ||
    (phone ? 'mobile' : 'full');
  location.replace(view === 'mobile' ? './mobile/index.html' : './reader.html');
}());

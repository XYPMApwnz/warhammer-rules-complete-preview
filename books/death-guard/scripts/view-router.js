(function () {
  'use strict';

  const requested = new URLSearchParams(location.search).get('view');
  const explicit = requested === 'mobile' || requested === 'full' ? requested : '';
  const phoneUserAgent = navigator.userAgentData?.mobile === true || /iPhone|iPod|Android.+Mobile/i.test(navigator.userAgent);
  const smallTouchScreen = matchMedia('(pointer: coarse)').matches && Math.min(screen.width, screen.height) <= 600;
  const phone = phoneUserAgent || smallTouchScreen || matchMedia('(max-width: 600px)').matches;
  const view = explicit || (phone ? 'mobile' : 'full');
  const destination = new URL(view === 'mobile' ? './mobile/index.html' : './reader.html', location.href);
  const params = new URLSearchParams(location.search);
  params.delete('view');
  destination.search = params.toString();
  destination.hash = location.hash;
  location.replace(destination);
}());

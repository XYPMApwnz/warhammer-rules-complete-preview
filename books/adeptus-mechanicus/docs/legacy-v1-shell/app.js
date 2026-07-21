(() => {
  const root = document.documentElement;
  const themeButton = document.getElementById('themeButton');
  const menuButton = document.getElementById('menuButton');
  const sidebar = document.getElementById('sidebar');
  const scrim = document.getElementById('scrim');
  const searchButton = document.getElementById('searchButton');
  const searchDrawer = document.getElementById('searchDrawer');
  const searchClose = document.getElementById('searchClose');
  const bookSearch = document.getElementById('bookSearch');
  const searchStatus = document.getElementById('searchStatus');
  const noSearchResults = document.getElementById('noSearchResults');

  const setTheme = (theme) => {
    root.dataset.theme = theme;
    themeButton.textContent = theme === 'dark' ? '☼' : '☾';
    themeButton.setAttribute('aria-label', theme === 'dark' ? 'Включить светлую тему' : 'Включить тёмную тему');
    try { localStorage.setItem('am-codex-theme', theme); } catch (_) {}
  };

  let savedTheme = null;
  try { savedTheme = localStorage.getItem('am-codex-theme'); } catch (_) {}
  setTheme(savedTheme || 'dark');
  themeButton.addEventListener('click', () => setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark'));

  const setMenu = (open) => {
    sidebar.classList.toggle('open', open);
    scrim.classList.toggle('open', open);
    menuButton.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  };
  menuButton.addEventListener('click', () => setMenu(!sidebar.classList.contains('open')));
  scrim.addEventListener('click', () => setMenu(false));
  sidebar.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setMenu(false)));

  const protocolCopy = {
    protector: '<b>PROTECTOR IMPERATIVE</b><ul><li>Ranged weapons have <strong>[HEAVY]</strong>.</li><li>Improve Ballistic Skill by 1.</li><li>Melee attacks targeting a qualifying BATTLELINE unit subtract 1 from the Hit roll.</li></ul>',
    conqueror: '<b>CONQUEROR IMPERATIVE</b><ul><li>Ranged weapons have <strong>[ASSAULT]</strong>.</li><li>Improve Weapon Skill of melee weapons by 1.</li><li>Qualifying BATTLELINE units improve the AP of their attacks by 1.</li></ul>'
  };
  document.querySelectorAll('.protocol').forEach((button) => {
    button.addEventListener('click', () => {
      document.querySelectorAll('.protocol').forEach((item) => item.classList.toggle('active', item === button));
      document.getElementById('protocolResult').innerHTML = protocolCopy[button.dataset.protocol];
    });
  });

  const searchable = [...document.querySelectorAll('[data-search], .points-row:not(.head), .source-list article')];
  const setSearch = (query) => {
    const value = query.trim().toLocaleLowerCase('ru');
    searchable.forEach((item) => {
      item.classList.remove('search-hidden', 'search-match');
      if (!value) return;
      const haystack = `${item.dataset.search || ''} ${item.textContent}`.toLocaleLowerCase('ru');
      const match = haystack.includes(value);
      const isContainer = item.matches('.section');
      if (!match && !isContainer) item.classList.add('search-hidden');
      if (match && !isContainer) {
        item.classList.add('search-match');
        if (item.tagName === 'DETAILS') item.open = true;
      }
    });
    if (!value) {
      noSearchResults.hidden = true;
      searchStatus.textContent = 'Введите название правила, Detachment или юнита.';
      return;
    }
    const matches = searchable.filter((item) => !item.matches('.section') && item.classList.contains('search-match')).length;
    searchStatus.textContent = matches ? `Найдено совпадений: ${matches}` : 'Совпадений не найдено.';
    noSearchResults.hidden = matches > 0;
  };

  const openSearch = () => {
    searchDrawer.hidden = false;
    requestAnimationFrame(() => bookSearch.focus());
  };
  const closeSearch = () => {
    searchDrawer.hidden = true;
    bookSearch.value = '';
    setSearch('');
    searchButton.focus();
  };
  searchButton.addEventListener('click', openSearch);
  searchClose.addEventListener('click', closeSearch);
  bookSearch.addEventListener('input', () => setSearch(bookSearch.value));
  document.addEventListener('keydown', (event) => {
    if (event.key === '/' && searchDrawer.hidden && !/input|textarea/i.test(document.activeElement.tagName)) {
      event.preventDefault();
      openSearch();
    } else if (event.key === 'Escape' && !searchDrawer.hidden) closeSearch();
  });

  const links = [...document.querySelectorAll('.nav-link')];
  const sections = [...document.querySelectorAll('[data-track]')];
  const observer = new IntersectionObserver((entries) => {
    const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;
    links.forEach((link) => link.classList.toggle('active', link.hash === `#${visible.target.id}`));
  }, { rootMargin: '-24% 0px -62% 0px', threshold: [0, .2, .55] });
  sections.forEach((section) => observer.observe(section));
})();

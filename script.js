(() => {
  'use strict';

  const root = document.documentElement;
  const themeButton = document.querySelector('.theme-toggle');
  const themeMeta = document.querySelector('meta[name="theme-color"]');

  function updateTheme(theme) {
    const dark = theme === 'dark';
    root.dataset.theme = dark ? 'dark' : 'light';
    themeButton.setAttribute('aria-pressed', String(dark));
    themeButton.setAttribute('aria-label', `Switch to ${dark ? 'light' : 'dark'} theme`);
    themeMeta.setAttribute('content', dark ? '#181b1e' : '#ffffff');
  }

  updateTheme(root.dataset.theme);
  themeButton.hidden = false;
  themeButton.addEventListener('click', () => {
    const theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    updateTheme(theme);
    try { localStorage.setItem('han-li-theme', theme); } catch (_) { /* Optional storage. */ }
  });

  const menuButton = document.querySelector('.menu-toggle');
  const navigation = document.querySelector('.site-nav');
  const mobileQuery = window.matchMedia('(max-width: 680px)');

  function closeMenu(returnFocus = false) {
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Open navigation');
    navigation.classList.remove('is-open');
    if (returnFocus) menuButton.focus();
  }

  menuButton.hidden = false;
  root.classList.add('navigation-ready');
  menuButton.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') !== 'true';
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', `${open ? 'Close' : 'Open'} navigation`);
    navigation.classList.toggle('is-open', open);
  });
  navigation.addEventListener('click', event => {
    if (event.target.closest('a')) closeMenu();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') closeMenu(true);
  });
  document.addEventListener('click', event => {
    if (mobileQuery.matches && !event.target.closest('.masthead')) closeMenu();
  });
  mobileQuery.addEventListener('change', () => closeMenu());

  const navLinks = [...navigation.querySelectorAll('a[href^="#"]')];
  const navSections = navLinks.map(link => document.querySelector(link.getAttribute('href'))).filter(Boolean);
  let scrollQueued = false;

  function updateActiveSection() {
    const threshold = document.querySelector('.masthead').getBoundingClientRect().height + 90;
    let active = navSections[0];
    for (const section of navSections) {
      if (section.getBoundingClientRect().top <= threshold) active = section;
    }
    for (const link of navLinks) {
      if (link.getAttribute('href') === `#${active.id}`) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    }
    scrollQueued = false;
  }

  window.addEventListener('scroll', () => {
    if (!scrollQueued) {
      scrollQueued = true;
      window.requestAnimationFrame(updateActiveSection);
    }
  }, { passive: true });
  updateActiveSection();

  const search = document.querySelector('#publication-search');
  const year = document.querySelector('#publication-year');
  const papers = [...document.querySelectorAll('.publication-list > li')];
  const groups = [...document.querySelectorAll('.publication-group')];
  const count = document.querySelector('#publication-count');
  const emptyState = document.querySelector('.no-results');
  const searchablePapers = papers.map(element => ({
    element,
    text: `${element.textContent} ${element.dataset.topics}`.toLocaleLowerCase(),
    year: element.dataset.year,
  }));

  function filterPublications() {
    const terms = search.value.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
    let visible = 0;
    for (const paper of searchablePapers) {
      const match = (year.value === 'all' || paper.year === year.value)
        && terms.every(term => paper.text.includes(term));
      paper.element.hidden = !match;
      if (match) visible += 1;
    }
    for (const group of groups) {
      const groupCount = group.querySelectorAll('.publication-list > li:not([hidden])').length;
      group.hidden = groupCount === 0;
      group.querySelector('.publication-year-heading span').textContent = `${groupCount} ${groupCount === 1 ? 'paper' : 'papers'}`;
    }
    count.textContent = terms.length || year.value !== 'all'
      ? `${visible} of ${papers.length} publications`
      : `${papers.length} publications`;
    emptyState.hidden = visible !== 0;
  }

  document.querySelector('.publication-controls').hidden = false;
  search.addEventListener('input', filterPublications);
  year.addEventListener('change', filterPublications);
  document.querySelector('#clear-filters').addEventListener('click', () => {
    search.value = '';
    year.value = 'all';
    filterPublications();
    search.focus();
  });
  window.addEventListener('pageshow', filterPublications);
  filterPublications();
  document.querySelector('#year').textContent = String(new Date().getFullYear());
})();

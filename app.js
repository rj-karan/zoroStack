const contentUrl = (name) => new URL('content/' + name + '.json', document.baseURI);
const assetUrl = (path) => new URL(path, document.baseURI);
const safeUrl = (value) => {
  if (typeof value !== 'string') return '';
  try {
    const url = new URL(value, document.baseURI);
    return ['https:', 'http:', 'mailto:'].includes(url.protocol) ? url.href : '';
  } catch {
    return '';
  }
};
const element = (tag, className, text) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined && text !== null) node.textContent = String(text);
  return node;
};
const fetchContent = async (name, fallback) => {
  try {
    const response = await fetch(contentUrl(name));
    if (!response.ok) throw new Error(name + ': HTTP ' + response.status);
    return await response.json();
  } catch (error) {
    console.warn('Could not load portfolio content:', error);
    return fallback;
  }
};
const formatDate = (value) => {
  if (!value) return '';
  const parsed = new Date(String(value) + (String(value).length === 10 ? 'T12:00:00' : ''));
  return Number.isNaN(parsed.getTime()) ? '' : new Intl.DateTimeFormat('en', {month: 'short', year: 'numeric'}).format(parsed);
};

function setupMenu() {
  const button = document.querySelector('.menu-toggle');
  const nav = document.getElementById('mobile-nav');
  if (!button || !nav) return;
  const close = () => {
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('aria-label', 'Open menu');
    nav.hidden = true;
    document.body.classList.remove('menu-open');
  };
  button.addEventListener('click', () => {
    const opening = button.getAttribute('aria-expanded') !== 'true';
    button.setAttribute('aria-expanded', String(opening));
    button.setAttribute('aria-label', opening ? 'Close menu' : 'Open menu');
    nav.hidden = !opening;
    document.body.classList.toggle('menu-open', opening);
  });
  nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', close));
  window.addEventListener('keydown', (event) => { if (event.key === 'Escape') close(); });
  window.addEventListener('resize', () => { if (window.innerWidth > 820) close(); });
}

function setupReveals() {
  const nodes = [...document.querySelectorAll('.reveal')];
  if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) {
    nodes.forEach((node) => node.classList.add('is-visible'));
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, {threshold: .09, rootMargin: '0px 0px -30px 0px'});
  nodes.forEach((node) => observer.observe(node));
}

function setupLottie() {
  const container = document.getElementById('signal-lottie');
  if (!container || !window.lottie) return;
  try {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const animation = window.lottie.loadAnimation({
      container,
      renderer: 'svg',
      loop: true,
      autoplay: !reduced,
      path: assetUrl('public/animations/signal.json').href,
      rendererSettings: {preserveAspectRatio: 'xMidYMid meet'}
    });
    if (reduced) animation.addEventListener('DOMLoaded', () => animation.goToAndStop(12, true));
  } catch (error) {
    console.warn('Signal animation unavailable:', error);
  }
}

function renderProjects(projects) {
  const grid = document.getElementById('project-grid');
  if (!grid) return;
  grid.replaceChildren();
  const visible = Array.isArray(projects) ? projects.filter((item) => item && item.published !== false) : [];
  if (!visible.length) {
    grid.append(element('p', 'loading-note', 'Projects will appear here soon.'));
    return;
  }
  visible.sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
  visible.forEach((project, index) => {
    const card = element('article', 'project-card');
    const top = element('div', 'project-top');
    top.append(element('span', 'project-index', 'PROJECT / ' + String(index + 1).padStart(2, '0')));
    top.append(element('span', 'project-kind', project.kind || 'OPEN SOURCE'));
    const middle = element('div');
    middle.append(element('span', 'project-symbol', project.symbol || '✳'));
    middle.append(element('h3', '', project.title || 'Untitled project'));
    middle.append(element('p', '', project.summary || ''));
    const bottom = element('div', 'project-bottom');
    bottom.append(element('span', 'project-meta', (project.stack || []).join(' / ')));
    const url = safeUrl(project.url);
    if (url) {
      const link = element('a', 'project-link', '↗');
      link.href = url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.setAttribute('aria-label', 'Open ' + (project.title || 'project'));
      bottom.append(link);
    }
    card.append(top, middle, bottom);
    grid.append(card);
  });
}

const researchSources = [
  ['reports', 'report'],
  ['cves', 'cve'],
  ['articles', 'article'],
  ['achievements', 'achievement']
];
let researchItems = [];
let activeFilter = 'all';

function renderResearch() {
  const grid = document.getElementById('research-grid');
  const empty = document.getElementById('research-empty');
  if (!grid || !empty) return;
  grid.replaceChildren();
  const shown = activeFilter === 'all' ? researchItems : researchItems.filter((item) => item.type === activeFilter);
  empty.hidden = shown.length > 0;
  shown.forEach((item) => {
    const card = element('article', 'research-card');
    const top = element('div', 'research-card-top');
    top.append(element('span', 'research-type', item.type.toUpperCase()));
    top.append(element('span', '', formatDate(item.date) || 'UNDATED'));
    card.append(top, element('h3', '', item.title || 'Untitled'), element('p', '', item.summary || ''));
    const localEntry = ['article', 'report'].includes(item.type) && item.body && item.slug;
    const url = safeUrl(item.url) || (localEntry ? assetUrl('article.html?type=' + encodeURIComponent(item.type) + '&slug=' + encodeURIComponent(item.slug)).href : '');
    if (url) {
      const link = element('a', '', localEntry && !item.url ? (item.type === 'report' ? 'Read report' : 'Read article') : 'Open source');
      const arrow = element('span', '', '↗');
      link.append(arrow);
      link.href = url;
      if (item.url) { link.target = '_blank'; link.rel = 'noopener noreferrer'; }
      card.append(link);
    }
    grid.append(card);
  });
}

async function loadResearch() {
  const results = await Promise.all(researchSources.map(async ([file, type]) => {
    const data = await fetchContent(file, []);
    return Array.isArray(data) ? data.filter((item) => item && item.published !== false).map((item) => ({...item, type})) : [];
  }));
  researchItems = results.flat().sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')));
  const counts = {all: researchItems.length, report: 0, cve: 0, article: 0, achievement: 0};
  researchItems.forEach((item) => { counts[item.type] += 1; });
  Object.entries(counts).forEach(([type, count]) => {
    const node = document.getElementById('count-' + type);
    if (node) node.textContent = String(count).padStart(2, '0');
  });
  const archive = document.getElementById('archive-count');
  if (archive) archive.textContent = String(counts.all).padStart(2, '0');
  renderResearch();
}

function setupFilters() {
  document.querySelectorAll('.filter-button').forEach((button) => {
    button.addEventListener('click', () => {
      activeFilter = button.dataset.filter || 'all';
      document.querySelectorAll('.filter-button').forEach((item) => {
        const active = item === button;
        item.classList.toggle('active', active);
        item.setAttribute('aria-pressed', String(active));
      });
      renderResearch();
    });
  });
}

async function loadSiteSettings() {
  const settings = await fetchContent('site', null);
  if (!settings || typeof settings !== 'object') return;
  const fields = [
    ['.hero-lede', settings.hero_intro],
    ['.about-description', settings.about],
    ['.contact-layout > div > p:last-child', settings.contact_intro]
  ];
  fields.forEach(([selector, value]) => {
    if (typeof value === 'string' && value.trim()) {
      const node = document.querySelector(selector);
      if (node) node.textContent = value;
    }
  });
  if (typeof settings.email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settings.email)) {
    document.querySelectorAll('a[href^="mailto:"]').forEach((link) => {
      link.href = 'mailto:' + settings.email;
      if (link.classList.contains('contact-email')) link.firstChild.textContent = settings.email + ' ';
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());
  setupMenu();
  setupReveals();
  setupLottie();
  setupFilters();
  loadSiteSettings();
  fetchContent('projects', []).then(renderProjects);
  loadResearch();
});

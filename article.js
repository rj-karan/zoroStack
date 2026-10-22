const titleNode = document.getElementById('article-title');
const bodyNode = document.getElementById('article-body');
const summaryNode = document.getElementById('article-summary');
const dateNode = document.getElementById('article-date');
const slug = new URLSearchParams(location.search).get('slug') || '';
const type = new URLSearchParams(location.search).get('type') === 'report' ? 'report' : 'article';

function safeLink(url) {
  try {
    const value = new URL(url, document.baseURI);
    return ['https:', 'http:', 'mailto:'].includes(value.protocol) ? value.href : '';
  } catch { return ''; }
}

function inline(parent, text) {
  const pattern = /(\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*|\*([^*]+)\*|`([^`]+)`)/g;
  let offset = 0;
  for (const match of text.matchAll(pattern)) {
    parent.append(document.createTextNode(text.slice(offset, match.index)));
    if (match[2]) {
      const url = safeLink(match[3]);
      if (url) {
        const link = document.createElement('a');
        link.href = url;
        link.textContent = match[2];
        if (/^https?:/.test(url)) { link.target = '_blank'; link.rel = 'noopener noreferrer'; }
        parent.append(link);
      } else parent.append(document.createTextNode(match[2]));
    } else {
      const tag = match[4] ? 'strong' : match[5] ? 'em' : 'code';
      const node = document.createElement(tag);
      node.textContent = match[4] || match[5] || match[6];
      parent.append(node);
    }
    offset = match.index + match[0].length;
  }
  parent.append(document.createTextNode(text.slice(offset)));
}

function renderMarkdown(markdown) {
  const fragment = document.createDocumentFragment();
  const lines = String(markdown || '').replace(/\r/g, '').split('\n');
  let index = 0;
  while (index < lines.length) {
    const line = lines[index];
    if (!line.trim()) { index++; continue; }
    if (line.startsWith('```')) {
      const language = line.slice(3).trim();
      const codeLines = [];
      index++;
      while (index < lines.length && !lines[index].startsWith('```')) codeLines.push(lines[index++]);
      if (index < lines.length) index++;
      const pre = document.createElement('pre');
      const code = document.createElement('code');
      if (language) code.dataset.language = language;
      code.textContent = codeLines.join('\n');
      pre.append(code);
      fragment.append(pre);
      continue;
    }
    const image = line.trim().match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (image) {
      const source = safeLink(image[2]);
      if (source) {
        const figure = document.createElement('figure');
        const picture = document.createElement('img');
        picture.src = source;
        picture.alt = image[1];
        picture.loading = 'lazy';
        figure.append(picture);
        if (image[1]) {
          const caption = document.createElement('figcaption');
          caption.textContent = image[1];
          figure.append(caption);
        }
        fragment.append(figure);
      }
      index++;
      continue;
    }
    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      const node = document.createElement('h' + Math.min(heading[1].length + 1, 4));
      inline(node, heading[2]);
      fragment.append(node);
      index++;
      continue;
    }
    if (/^---+$/.test(line.trim())) { fragment.append(document.createElement('hr')); index++; continue; }
    if (/^>\s?/.test(line)) {
      const quote = document.createElement('blockquote');
      const text = [];
      while (index < lines.length && /^>\s?/.test(lines[index])) text.push(lines[index++].replace(/^>\s?/, ''));
      inline(quote, text.join(' '));
      fragment.append(quote);
      continue;
    }
    if (/^[-*]\s+/.test(line) || /^\d+\.\s+/.test(line)) {
      const ordered = /^\d+\.\s+/.test(line);
      const list = document.createElement(ordered ? 'ol' : 'ul');
      const test = ordered ? /^\d+\.\s+/ : /^[-*]\s+/;
      while (index < lines.length && test.test(lines[index])) {
        const item = document.createElement('li');
        inline(item, lines[index++].replace(test, ''));
        list.append(item);
      }
      fragment.append(list);
      continue;
    }
    const text = [];
    while (index < lines.length && lines[index].trim() && !/^(#{1,3}\s|>\s?|[-*]\s+|\d+\.\s+|```|---+$)/.test(lines[index])) text.push(lines[index++].trim());
    if (!text.length) { index++; continue; }
    const paragraph = document.createElement('p');
    inline(paragraph, text.join(' '));
    fragment.append(paragraph);
  }
  bodyNode.replaceChildren(fragment);
}

async function loadArticle() {
  document.getElementById('year').textContent = String(new Date().getFullYear());
  if (!/^[a-z0-9-]{1,120}$/i.test(slug)) {
    titleNode.textContent = 'Article not found';
    bodyNode.textContent = 'This article has not been published.';
    return;
  }
  try {
    const response = await fetch(new URL('content/' + (type === 'report' ? 'reports' : 'articles') + '.json', document.baseURI));
    if (!response.ok) throw new Error('HTTP ' + response.status);
    const articles = await response.json();
    const article = Array.isArray(articles) && articles.find((item) => item.slug === slug && item.published !== false && item.body);
    if (!article) throw new Error('Article not found');
    titleNode.textContent = article.title || 'Untitled';
    document.querySelector('.article-meta span:first-child').textContent = (type === 'report' ? 'REPORT' : 'FIELD NOTES') + ' / KARAN RJ';
    summaryNode.textContent = article.summary || '';
    document.title = (article.title || 'Article') + ' — Karan RJ';
    if (article.date) {
      const date = new Date(String(article.date) + (String(article.date).length === 10 ? 'T12:00:00' : ''));
      if (!Number.isNaN(date.getTime())) dateNode.textContent = new Intl.DateTimeFormat('en', {day: 'numeric', month: 'long', year: 'numeric'}).format(date);
    }
    renderMarkdown(article.body);
  } catch (error) {
    titleNode.textContent = 'Article not found';
    bodyNode.textContent = 'This article is unavailable. Browse the research archive for published work.';
    console.warn(error);
  }
}

loadArticle();

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { marked } from 'marked';
import sanitizeHtml from 'sanitize-html';

const siteRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
process.chdir(siteRoot);
const definitions = [
  { id: 'atlas', repo: 'luuna-atlas', title: 'Atlas' },
  { id: 'missions', repo: 'luuna-missions', title: 'Missions' },
  { id: 'beacon', repo: 'luuna-beacon', title: 'Beacon' },
  { id: 'ai', repo: 'luuna-ai', title: 'Luuna AI' },
];
const argv = process.argv.slice(2);
const roots = new Map();
for (const item of definitions) {
  const at = argv.indexOf(`--${item.id}`);
  const supplied = at >= 0 ? argv[at + 1] : undefined;
  if (at >= 0 && (!supplied || supplied.startsWith('--'))) throw new Error(`--${item.id} requires a repository path`);
  roots.set(item.id, path.resolve(supplied ?? path.join(siteRoot, '..', `.source-${item.repo}`)));
}
if (argv.some((arg, i) => arg.startsWith('--') && !definitions.some(x => arg === `--${x.id}`))) {
  throw new Error(`Usage: node scripts/import-docs.mjs [--atlas path] [--missions path] [--beacon path] [--ai path]`);
}

const publicFiles = new Set([
  'README.md', 'CHANGELOG.md', 'CONFIG.md', 'CONTRIBUTING.md', 'MIGRATION.md',
  'ROADMAP.md', 'RUNBOOK.md', 'SECURITY.md', 'SPEC.md', 'UPSTREAM.md',
  'V1_DONE.md', 'V1_PLAN.md', 'PLAN_SPEC.md', 'docs/UPSTREAM-README.md',
  'docs/cli-reference.md', 'LICENSE',
  'AGENTS.md', 'CLAUDE.md',
]);
const htmlTags = [...sanitizeHtml.defaults.allowedTags, 'details', 'summary', 'kbd', 'samp', 'mark', 'dl', 'dt', 'dd'];
const htmlAttrs = {
  ...sanitizeHtml.defaults.allowedAttributes,
  a: ['href', 'name', 'target', 'rel'],
  code: ['class'],
  img: ['src', 'alt', 'title', 'width', 'height'],
  h1: ['id'], h2: ['id'], h3: ['id'], h4: ['id'], h5: ['id'], h6: ['id'],
  th: ['align'], td: ['align'],
};
const filesByRepo = new Map();
const commits = {};
for (const item of definitions) {
  const root = roots.get(item.id);
  if (!fs.existsSync(path.join(root, '.git'))) throw new Error(`Not a Git checkout: ${root}`);
  commits[item.id] = execFileSync('git', ['-C', root, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
  const tracked = execFileSync('git', ['-C', root, 'ls-files', '-z'], { encoding: 'utf8' }).split('\0').filter(Boolean);
  const selected = tracked.filter(file => (file === 'LICENSE' || /\.md$/i.test(file)) && (publicFiles.has(file) || file.startsWith('docs/')));
  if (!selected.includes('README.md')) throw new Error(`${item.repo} has no tracked README.md`);
  filesByRepo.set(item.id, selected);
}

function slug(value) {
  return value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    .replace(/[`'"’]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}
function slugForRepoFile(repoId, relative) {
  return `components-${repoId}-${slug(relative.replace(/\.(?:md|markdown)$/i, '').replace(/[/\\]/g, '-'))}`;
}
function sourceUrl(item, commit, relative) {
  return `https://github.com/luuna-ai/${item.repo}/blob/${commit}/${relative.split(path.sep).join('/')}`;
}
function isInside(root, candidate) {
  const rel = path.relative(root, candidate);
  return !!rel && !rel.startsWith('..') && !path.isAbsolute(rel);
}
function copyImage(root, item, rel) {
  const source = path.resolve(root, rel);
  if (!isInside(root, source) || !fs.existsSync(source) || !fs.statSync(source).isFile()) return null;
  const destinationRel = path.join('components', item.id, rel).split(path.sep).join('/');
  const destination = path.join('public', destinationRel);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.copyFileSync(source, destination);
  return `/${destinationRel}`;
}

const slugBySource = new Map();
for (const item of definitions) {
  for (const rel of filesByRepo.get(item.id)) slugBySource.set(`${item.id}/${rel.replace(/\\/g, '/')}`, slugForRepoFile(item.id, rel));
}
function rewriteDestination(raw, item, relative, root, commit) {
  if (/^(?:https?:|mailto:|data:|#|\/docs\/|\/components\/)/i.test(raw)) return raw;
  const match = raw.match(/^([^?#]*)([?#].*)?$/);
  if (!match) return raw;
  const rel = decodeURIComponent(match[1] || '');
  const suffix = match[2] || '';
  if (!rel) return raw;
  const resolved = path.posix.normalize(path.posix.join(path.posix.dirname(relative.split(path.sep).join('/')), rel.replace(/\\/g, '/')));
  const pageSlug = slugBySource.get(`${item.id}/${resolved}`);
  if (pageSlug) return `/docs/${pageSlug}${suffix}`;
  const candidate = path.resolve(root, resolved);
  if (isInside(root, candidate) && fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
    const ext = path.extname(candidate).toLowerCase();
    if (['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp'].includes(ext)) return `${copyImage(root, item, resolved)}${suffix}`;
  }
  return sourceUrl(item, commit, resolved) + suffix;
}
function rewriteMarkdownLinks(markdown, item, relative, root, commit) {
  const withLinks = markdown.replace(/(!?)\[([^\]]*)\]\(([^\s)]+)(?:\s+[^)]*)?\)/g, (whole, image, text, href) => {
    const next = rewriteDestination(href, item, relative, root, commit);
    return `${image}[${text}](${next})`;
  });
  return withLinks.replace(/(<img\b[^>]*\bsrc=["'])([^"']+)(["'][^>]*>)/gi, (whole, before, src, after) => `${before}${rewriteDestination(src, item, relative, root, commit)}${after}`);
}
function plain(text) {
  return text.replace(/<[^>]*>/g, '').replace(/[`*_~>#]/g, '').replace(/\s+/g, ' ').trim();
}
function headingsAndHtml(markdown) {
  const headings = [];
  const seen = new Map();
  const renderer = new marked.Renderer();
  renderer.heading = function (token) {
    const base = slug(token.text) || 'section';
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    const id = count ? `${base}-${count}` : base;
    headings.push({ id, title: plain(token.text), depth: token.depth });
    const content = this.parser.parseInline(token.tokens);
    return `<h${token.depth} id="${id}">${content}</h${token.depth}>\n`;
  };
  const raw = marked.parse(markdown, { gfm: true, renderer });
  const html = sanitizeHtml(raw, {
    allowedTags: htmlTags,
    allowedAttributes: htmlAttrs,
    allowedSchemes: ['http', 'https', 'mailto'],
    transformTags: {
      a: (tagName, attrs) => {
        const external = /^(?:https?:)?\/\//i.test(attrs.href ?? '');
        return { tagName, attribs: { ...attrs, ...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {}) } };
      },
    },
  });
  return { headings, html };
}
function firstParagraph(markdown) {
  const paragraph = markdown.split(/\r?\n/).map(line => line.trim()).find(line => line && !line.startsWith('#') && !line.startsWith('```') && !line.startsWith('>')) ?? '';
  return plain(paragraph).slice(0, 230);
}
function statusFor(file) {
  const base = path.basename(file).toUpperCase();
  if (['CHANGELOG.MD', 'UPSTREAM.MD', 'UPSTREAM-README.MD', 'V1_DONE.MD', 'V1_PLAN.MD', 'ROADMAP.MD', 'RUNBOOK.MD'].includes(base)) return 'historical';
  if (base === 'README.MD') return 'current';
  return 'reference';
}
function docFromMarkdown({ slug: docSlug, path: docPath, title, markdown, source, commit, group = 'Components', status = 'reference', ai = true }) {
  const { headings, html } = headingsAndHtml(markdown);
  return { slug: docSlug, path: docPath, title, group, status, ai, markdown, source, commit, headings, html, description: firstParagraph(markdown) };
}

const docsFile = path.join('data', 'docs.json');
const docs = JSON.parse(fs.readFileSync(docsFile, 'utf8'));
const componentPrefixes = definitions.map(item => `components/${item.id}/`);
const kept = docs.filter(doc => !componentPrefixes.some(prefix => doc.path.startsWith(prefix)) && !doc.path.startsWith('content/components/'));
const componentDocs = [];
for (const item of definitions) {
  const root = roots.get(item.id);
  for (const relative of filesByRepo.get(item.id)) {
    const markdownPath = path.join(root, relative);
    let markdown = rewriteMarkdownLinks(fs.readFileSync(markdownPath, 'utf8').replace(/\r\n?/g, '\n'), item, relative, root, commits[item.id]);
    if (relative === 'LICENSE' && !/^#\s/.test(markdown)) markdown = `# ${item.title} license\n\n${markdown}`;
    const firstHeading = markdown.match(/^#\s+(.+)$/m)?.[1]?.replace(/[`*_]/g, '').trim();
    const title = relative === 'README.md' ? item.title : `${item.title}: ${firstHeading || relative}`;
    const docPath = `components/${item.id}/${relative.split(path.sep).join('/')}`;
    const docSlug = slugForRepoFile(item.id, relative);
    const status = statusFor(relative);
    componentDocs.push(docFromMarkdown({ slug: docSlug, path: docPath, title, markdown, source: sourceUrl(item, commits[item.id], relative), commit: commits[item.id], status, ai: !['historical', 'dated'].includes(status) }));
  }
}
for (const [relative, title, docSlug] of [
  ['index.md', 'Luuna components', 'guide-components'],
  ['atlas.md', 'Atlas: structured knowledge and project memory', 'guide-component-atlas'],
  ['missions.md', 'Missions: git-native tickets and work plans', 'guide-component-missions'],
  ['beacon.md', 'Beacon: versioned prompts and agent instructions', 'guide-component-beacon'],
  ['ai.md', 'Luuna AI: native Pi desktop client', 'guide-component-ai'],
]) {
  const docPath = `content/components/${relative}`;
  const markdown = fs.readFileSync(docPath, 'utf8');
  const doc = docFromMarkdown({ slug: docSlug, path: docPath, title, markdown, source: `https://github.com/luuna-ai/luuna-documentation/blob/main/${docPath}`, commit: 'local-site-source', group: 'Components', status: 'current', ai: true });
  componentDocs.push(doc);
}

// Keep the home page's component description in sync with its dedicated guides.
const overview = kept.find(doc => doc.slug === 'guide-overview');
if (overview && fs.existsSync('content/overview.md')) {
  overview.markdown = fs.readFileSync('content/overview.md', 'utf8');
  const rendered = headingsAndHtml(overview.markdown);
  overview.headings = rendered.headings;
  overview.html = rendered.html;
  overview.description = firstParagraph(overview.markdown);
}
const coverage = kept.find(doc => doc.slug === 'reference-coverage');
if (coverage) {
  coverage.markdown = coverage.markdown
    .replace('- All 113 tracked Markdown documents in Luuna and its three pinned components.', '- The core Luuna documentation and generated references from its pinned source snapshot. Component repositories are documented independently below.')
    .replace('- New overview, installation guide, troubleshooting and assistant documentation.', '- Five authored guides covering all four supporting components and their integration boundaries.');
  const scope = [
    '## Current component reference sources',
    '',
    `This publication contains ${componentDocs.filter(doc => doc.path.startsWith('components/')).length} tracked Markdown and license pages from four component repositories, plus five authored guide pages. These reference snapshots follow the component repository heads recorded below; they can be newer than the code pinned into the core Luuna source snapshot.`,
    '',
    '| Component | Repository snapshot in these docs | Commit pinned by core Luuna |',
    '| --- | --- | --- |',
    '| Atlas | [`' + commits.atlas.slice(0, 12) + '`](https://github.com/luuna-ai/luuna-atlas/tree/' + commits.atlas + ') | [`76ad209`](https://github.com/luuna-ai/luuna-atlas/tree/76ad209daf404dd9a12aeaf46293e05e9f41e517) |',
    '| Missions | [`' + commits.missions.slice(0, 12) + '`](https://github.com/luuna-ai/luuna-missions/tree/' + commits.missions + ') | [`e1b5db1`](https://github.com/luuna-ai/luuna-missions/tree/e1b5db171892de653e7462e630d64d4964d01422) |',
    '| Beacon | [`' + commits.beacon.slice(0, 12) + '`](https://github.com/luuna-ai/luuna-beacon/tree/' + commits.beacon + ') | [`072e482`](https://github.com/luuna-ai/luuna-beacon/tree/072e482169e0d469c3744ec712222f8b310fa7da) |',
    '| Luuna AI | [`' + commits.ai.slice(0, 12) + '`](https://github.com/luuna-ai/luuna-ai/tree/' + commits.ai + ') | Independently maintained desktop app; not a core submodule |',
    '',
    'The file inventory under “Other tracked files” below describes the core Luuna checkout and its three submodules at the core snapshot; it is not an inventory of every file in the current independent component repositories.',
  ].join('\n');
  if (!coverage.markdown.includes('## Current component reference sources')) coverage.markdown = coverage.markdown.replace('## Document index', `${scope}\n\n## Document index`);
  const rendered = headingsAndHtml(coverage.markdown);
  coverage.headings = rendered.headings;
  coverage.html = rendered.html;
  coverage.description = firstParagraph(coverage.markdown);
}

const allDocs = [...kept, ...componentDocs].sort((a, b) => a.group.localeCompare(b.group) || a.title.localeCompare(b.title));
const chunks = [];
function addChunk(doc, title, text) {
  const value = text.trim();
  if (value) chunks.push({ id: `p${chunks.length}`, slug: doc.slug, title: title || doc.title, text: value, group: doc.group });
}
function splitText(text, max = 1450) {
  let remaining = text;
  while (remaining.length > max) {
    let cut = remaining.lastIndexOf('\n\n', max);
    if (cut < max * 0.55) cut = remaining.lastIndexOf('\n', max);
    if (cut < max * 0.55) cut = max;
    const part = remaining.slice(0, cut);
    addChunk(currentDoc, currentTitle, part);
    remaining = remaining.slice(cut);
  }
  addChunk(currentDoc, currentTitle, remaining);
}
let currentDoc;
let currentTitle;
for (const doc of allDocs) {
  if (!doc.ai || ['historical', 'dated'].includes(doc.status)) continue;
  currentDoc = doc;
  const lines = doc.markdown.split(/\r?\n/);
  let section = '';
  let title = doc.title;
  for (const line of lines) {
    if (/^#{1,3}\s+/.test(line) && section.trim()) {
      currentTitle = title;
      splitText(section);
      section = '';
      title = plain(line.replace(/^#+\s+/, '')) || doc.title;
    } else if (/^#{1,3}\s+/.test(line)) title = plain(line.replace(/^#+\s+/, '')) || doc.title;
    section += `${line}\n`;
  }
  currentTitle = title;
  splitText(section);
}
fs.writeFileSync(docsFile, JSON.stringify(allDocs));
fs.writeFileSync('data/chunks.json', JSON.stringify(chunks));
fs.writeFileSync('public/search-index.json', JSON.stringify(allDocs.map(({ slug, title, description, group, status, markdown }) => ({ slug, title, description, group, status, text: markdown }))));

const metaPath = 'data/meta.json';
const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
meta.documents = allDocs.length;
meta.date = new Date().toISOString().slice(0, 10);
meta.components = definitions.map(item => ({ name: item.title, repository: item.repo, commit: commits[item.id], documents: componentDocs.filter(doc => doc.path.startsWith(`components/${item.id}/`)).length }));
fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2) + '\n');

const llms = ['# Luuna documentation', '', 'Public documentation snapshot. Component references are pinned to the source commit recorded in data/meta.json.', '', ...allDocs.map(doc => `- [${doc.title}](/docs/${doc.slug}): ${doc.description}`)].join('\n');
fs.writeFileSync('public/llms.txt', `${llms}\n`);
const llmsFull = ['# Luuna documentation: full text', '', ...allDocs.map(doc => `## ${doc.title}\n\nSource: ${doc.source}\nCommit: ${doc.commit}\n\n${doc.markdown}`)].join('\n\n---\n\n');
fs.writeFileSync('public/llms-full.txt', `${llmsFull}\n`);
console.log(JSON.stringify({ documents: allDocs.length, componentDocuments: componentDocs.length, passages: chunks.length, components: meta.components }, null, 2));

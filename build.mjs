// Production build — precompiles JSX with esbuild, vendors React locally,
// and assembles a deployable dist/ folder. No bundling: files stay classic
// scripts in the same order, so cross-file globals behave exactly as in dev.
//
//   node build.mjs           one-shot build
//   node build.mjs --watch   rebuild on change + serve dist/ on :8080

import { transform } from 'esbuild';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';

const ROOT = path.dirname(new URL(import.meta.url).pathname);
const DIST = path.join(ROOT, 'dist');
// Year target, not a browser target: esbuild's safari compat data flags an old
// WebKit destructuring quirk it can't downlevel. es2020 ships syntax as-is,
// which every iPadOS 14+ / evergreen browser parses natively.
const TARGET = 'es2020';

const STATIC_COPIES = [
  'styles/design.css',
  'src/juice.css',
  'assets/hero-space-cockpit.png',
  'favicon.svg',
  '_redirects',
];

const VENDOR = [
  ['node_modules/react/umd/react.production.min.js', 'vendor/react.production.min.js'],
  ['node_modules/react-dom/umd/react-dom.production.min.js', 'vendor/react-dom.production.min.js'],
];

function read(p) { return fs.readFileSync(path.join(ROOT, p), 'utf8'); }
function write(p, content) {
  const out = path.join(DIST, p);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, content);
}
function copy(from, to) {
  const out = path.join(DIST, to);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.copyFileSync(path.join(ROOT, from), out);
}

function appScripts(html) {
  // Every <script type="text/babel" src="..."> in document order
  return [...html.matchAll(/<script type="text\/babel" src="([^"]+)"><\/script>/g)].map(m => m[1]);
}

async function compileScript(src) {
  const isJsx = src.endsWith('.jsx');
  const { code } = await transform(read(src), {
    loader: isJsx ? 'jsx' : 'js',
    jsx: 'transform', // React.createElement — window.React comes from the vendor script
    target: TARGET,
    minifyWhitespace: true,
    minifySyntax: true,
    // Never rename identifiers: cross-file references rely on top-level
    // const/function bindings shared between classic scripts.
    minifyIdentifiers: false,
  });
  return code;
}

function buildHtml(html) {
  return html
    // unpkg React/Babel → local vendor React, no Babel
    .replace(/<script src="https:\/\/unpkg\.com\/react@[^"]+"[^>]*><\/script>\s*/g, '')
    .replace(/<script src="https:\/\/unpkg\.com\/react-dom@[^"]+"[^>]*><\/script>\s*/g, '')
    .replace(/<script src="https:\/\/unpkg\.com\/@babel\/standalone@[^"]+"[^>]*><\/script>\s*/g,
      '<script src="vendor/react.production.min.js"></script>\n' +
      '<script src="vendor/react-dom.production.min.js"></script>\n')
    // text/babel sources → compiled plain scripts
    .replace(/<script type="text\/babel" src="([^"]+)\.jsx"><\/script>/g, '<script src="$1.js" defer></script>')
    .replace(/<script type="text\/babel" src="([^"]+)\.js"><\/script>/g, '<script src="$1.js" defer></script>');
}

async function buildAll() {
  const started = Date.now();
  fs.rmSync(DIST, { recursive: true, force: true });

  const html = read('index.html');
  const scripts = appScripts(html);

  for (const src of scripts) {
    write(src.replace(/\.jsx$/, '.js'), await compileScript(src));
  }
  // cursor.js is a plain classic script outside the babel list
  write('src/cursor.js', await compileScript('src/cursor.js'));

  for (const f of STATIC_COPIES) copy(f, f);
  for (const [from, to] of VENDOR) copy(from, to);

  write('index.html', buildHtml(html));
  console.log(`built dist/ (${scripts.length + 1} scripts) in ${Date.now() - started}ms`);
}

function serve(port) {
  const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png' };
  http.createServer((req, res) => {
    let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (p === '/') p = '/index.html';
    const file = path.join(DIST, p);
    if (!file.startsWith(DIST) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      // SPA fallback, mirrors _redirects
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(fs.readFileSync(path.join(DIST, 'index.html')));
      return;
    }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
    res.end(fs.readFileSync(file));
  }).listen(port, () => console.log(`serving dist/ at http://localhost:${port}`));
}

await buildAll();

if (process.argv.includes('--watch')) {
  let timer = null;
  for (const dir of ['src', 'styles']) {
    fs.watch(path.join(ROOT, dir), { recursive: true }, () => {
      clearTimeout(timer);
      timer = setTimeout(() => buildAll().catch(e => console.error(e.message)), 100);
    });
  }
  fs.watch(path.join(ROOT, 'index.html'), () => {
    clearTimeout(timer);
    timer = setTimeout(() => buildAll().catch(e => console.error(e.message)), 100);
  });
  serve(8080);
}

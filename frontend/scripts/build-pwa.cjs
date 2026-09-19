const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const root = path.resolve(__dirname, '../build');
const base = new URL(process.env.PUBLIC_URL || '/', 'https://localhost').pathname.replace(/\/?$/, '/');
const prefix = 'drummist-' + crypto.createHash('sha256').update(base).digest('hex').slice(0, 8) + '-';
function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const file = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(file) : [file];
  });
}
const files = walk(root).filter(file => /\.(html|js|css|png|webmanifest|wav|flac|woff2?|txt|md|json)$/.test(file) && !file.endsWith('service-worker.js'));
const hash = crypto.createHash('sha256');
hash.update(base);
files.sort().forEach(file => hash.update(path.relative(root, file)).update(fs.readFileSync(file)));
const version = hash.digest('hex').slice(0, 16);
const urls = files.map(file => base + path.relative(root, file).replaceAll('\\', '/'));
urls.push(base);
fs.writeFileSync(path.join(root, '.nojekyll'), '');
fs.writeFileSync(path.join(root, 'service-worker.js'), `
const CACHE = '${prefix}${version}';
const URLS = ${JSON.stringify(urls)};
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(URLS)));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('${prefix}') && key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('message', event => {
  if (event.data === 'ACTIVATE_UPDATE') self.skipWaiting();
});
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== self.location.origin || !url.pathname.startsWith('${base}')) return;
  event.respondWith(caches.open(CACHE).then(async cache => {
    const cached = await cache.match(event.request, { ignoreSearch: event.request.mode === 'navigate' });
    if (cached) return cached;
    if (event.request.mode === 'navigate') return cache.match('${base}index.html');
    return fetch(event.request);
  }));
});
`);
console.log('PWA cache:', urls.length, 'assets, version', version);

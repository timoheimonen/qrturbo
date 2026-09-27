// Minimal static file server for browser tests. Python's http.server resets
// connections when many parallel workers load the app at once, which made
// scripts fail to load at random; Node's server handles that load reliably.
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');

const publicDir = path.resolve(__dirname, '../../Public');
const port = Number(process.env.PORT || 4173);

const MIME_TYPES = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8'
};

function resolvePath(requestUrl) {
  const { pathname } = new URL(requestUrl, 'http://localhost');
  const filePath = path.resolve(publicDir, `.${decodeURIComponent(pathname)}`);
  if (!filePath.startsWith(publicDir)) return null;
  return pathname.endsWith('/') ? path.join(filePath, 'index.html') : filePath;
}

const server = http.createServer((request, response) => {
  const filePath = resolvePath(request.url);

  fs.readFile(filePath || '', (error, body) => {
    if (error) {
      response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      response.end('Not found');
      return;
    }

    response.writeHead(200, {
      'Content-Type': MIME_TYPES[path.extname(filePath)] || 'application/octet-stream',
      'Cache-Control': 'no-cache'
    });
    response.end(body);
  });
});

server.listen(port, '127.0.0.1', () => {
  console.log(`Serving ${publicDir} at http://127.0.0.1:${port}`);
});

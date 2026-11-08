import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
const root = resolve('.');
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.svg': 'image/svg+xml', '.md': 'text/plain; charset=utf-8' };
http.createServer(async (req, res) => {
  try {
    if (req.method === 'POST' && ['/demo/logout', '/demo/save'].includes(req.url)) {
      req.resume();
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' }).end('<!doctype html><html lang="nl"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><link rel="stylesheet" href="/dist/minicss.css"><title>Demo ontvangen — minicss</title><main class="container"><h1>Formulier ontvangen</h1><p>Dit is een demonstratie. Er is geen account en er worden geen gegevens bewaard.</p><a href="/">Terug naar de demo</a></main></html>');
      return;
    }
    const path = resolve(root, '.' + decodeURIComponent(new URL(req.url, 'http://localhost').pathname).replace(/\/$/, '/index.html'));
    if (!path.startsWith(root + sep)) { res.writeHead(403).end(); return; }
    const data = await readFile(path);
    res.writeHead(200, { 'Content-Type': types[extname(path)] || 'application/octet-stream', 'Cache-Control': 'no-cache' }).end(data);
  } catch { res.writeHead(404).end('Niet gevonden'); }
}).listen(Number(process.env.PORT || 4173), '127.0.0.1', () => console.log('minicss: http://127.0.0.1:4173'));

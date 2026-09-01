const { createServer } = require('http');
const { parse } = require('url');
const next = require('.next/standalone/server.js');

const port = parseInt(process.env.PORT || '3000', 10);
const app = next({
  dev: false,
  dir: __dirname,
  hostname: '0.0.0.0',
  port: port
});

const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  }).listen(port, '0.0.0.0', () => {
    console.log(`> Server ready on http://0.0.0.0:${port}`);
  });
});

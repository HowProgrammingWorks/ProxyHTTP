'use strict';

const net = require('node:net');
const { parseHeader } = require('./utils.js');

const EOL = '\r\n';
const PORT = 8000;

const credentials = 'marcus:marcus';
const authToken = `Basic ${btoa(credentials)}`;

const server = net.createServer();

server.on('connection', (client) => {
  const { remoteAddress } = client;
  console.log('Client connected:', remoteAddress);

  client.once('data', (data) => {
    const headers = parseHeader(data.toString());
    const { host, method, proxyAuthorization } = headers;

    if (proxyAuthorization !== authToken) {
      const msg = 'HTTP/1.1 407 Proxy Authentication Required' + EOL +
      'Proxy-Authenticate: Basic realm="Proxy Authentication Required"' + EOL +
      'Content-Length: 0' + EOL + EOL;
      client.write(msg);
      return void client.end();
    }

    const { hostname, port } = new URL(`http://${host}`);

    const proxy = net.createConnection(port || '80', hostname, () => {
      const isHttps = method === 'CONNECT';
      if (isHttps) client.write('HTTP/1.1 200 OK' + EOL + EOL);
      else proxy.write(data);
      proxy.pipe(client);
      client.pipe(proxy);
    });

    proxy.on('error', (err) => {
      console.error('Proxy connection error:', err.message);
      client.end();
    });
  });

  client.on('end', () => {
    console.log('Client disconnected:', remoteAddress);
  });

  client.on('error', (err) => {
    console.error('Client connection error:', err.message);
  });
});

server.listen(PORT);

'use strict';

const net = require('node:net');
const { spawn } = require('node:child_process');

const PORT = 8080;
const PROXY_PORT = 8000;
const PROXY_HOST = 'localhost';

const filename = '4-net.js';
spawn('node', [filename]);

const server = net.createServer();

server.on('connection', (client) => {
  const { remoteAddress } = client;
  console.log('Client connected:', remoteAddress);

  client.once('data', (data) => {
    const proxy = new net.Socket();

    proxy.connect(PROXY_PORT, PROXY_HOST, () => {
      proxy.write(data);
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

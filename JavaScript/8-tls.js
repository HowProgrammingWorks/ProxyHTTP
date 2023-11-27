'use strict';

const tls = require('node:tls');
const fs = require('node:fs');
const { parseHeader } = require('./utils.js');

const PORT = 8000;

const server = tls.createServer({
  key: fs.readFileSync('./cert/key.pem'),
  cert: fs.readFileSync('./cert/cert.pem'),
});

server.on('secureConnection', (client) => {
  const { remoteAddress } = client;
  console.log('Client connected:', remoteAddress + '\n');

  const proxy = new tls.TLSSocket();

  client.on('data', (data) => {
    console.log(`${data}`);
    const { host } = parseHeader(data.toString());
    proxy.connect(443, host, () => {
      proxy.write(data);
      proxy.pipe(client);
      client.pipe(proxy);
    });
  });
});

server.listen(PORT);

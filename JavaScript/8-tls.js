'use strict';

const tls = require('node:tls');
const fs = require('node:fs');
const { parseHeaders } = require('./utils.js');

const PORT = 8000;
const DEFAULT_TLS_PORT = 443;

const options = {
  key: fs.readFileSync('./cert/key.pem'),
  cert: fs.readFileSync('./cert/cert.pem'),
};

const server = tls.createServer(options);

server.on('secureConnection', (socket) => {
  const { remoteAddress } = socket;
  console.log('Client connected:', remoteAddress + '\n');

  socket.on('data', (data) => {
    console.log(`${data}`);
    const { host, port } = parseHeaders(data);
    const targetPort = parseInt(port, 10) || DEFAULT_TLS_PORT;
    const proxy = new tls.TLSSocket();
    proxy.connect(targetPort, host, () => {
      proxy.write(data);
      socket.pipe(proxy).pipe(socket);
    });
  });
});

server.listen(PORT);

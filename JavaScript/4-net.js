'use strict';

const net = require('node:net');
const { parseHeader } = require('./utils.js');

const EOL = '\r\n';
const PORT = 8000;

const server = net.createServer();

server.on('connection', (socket) => {
  const { remoteAddress } = socket;
  console.log('Client connected:', remoteAddress + '\n');

  socket.once('data', (data) => {
    console.log(`${data}`);
    const { method, host } = parseHeader(data.toString());
    const { hostname, port } = new URL(`http://${host}`);

    const proxy = net.createConnection(port || '80', hostname, () => {
      const isHttps = method === 'CONNECT';
      if (isHttps) socket.write('HTTP/1.1 200 OK' + EOL + EOL);
      else proxy.write(data);
      proxy.pipe(socket);
      socket.pipe(proxy);
    });

    proxy.on('error', (err) => {
      console.error('Proxy connection error:', err.message);
      socket.end();
    });
  });

  socket.on('end', () => {
    console.log('Client disconnected:', remoteAddress);
  });

  socket.on('error', (err) => {
    console.error('Client connection error:', err.message);
  });
});

server.listen(PORT);

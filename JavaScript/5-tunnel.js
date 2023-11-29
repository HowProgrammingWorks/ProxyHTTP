'use strict';

const net = require('node:net');

const PORT = 8080;
const PROXY_PORT = 8000;
const PROXY_HOST = 'localhost';

const server = net.createServer();

server.on('connection', (socket) => {
  const { remoteAddress } = socket;
  console.log('Client connected:', remoteAddress);

  socket.once('data', (data) => {
    const proxy = new net.Socket();

    proxy.connect(PROXY_PORT, PROXY_HOST, () => {
      proxy.write(data);
      socket.pipe(proxy).pipe(socket);
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

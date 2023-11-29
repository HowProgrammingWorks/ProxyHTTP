'use strict';

const http = require('node:http');
const net = require('node:net');

const EOL = '\r\n';
const PORT = 8000;

const server = http.createServer((req, res) => {
  res.end('HTTP requests is not supported');
});

server.on('connect', (req, socket, head) => {
  socket.write('HTTP/1.1 200 Connection Established' + EOL + EOL);
  const { port, hostname } = new URL(`http://${req.url}`);
  const proxy = net.connect(port, hostname, () => {
    if (head) proxy.write(head);
    socket.pipe(proxy).pipe(socket);
  });
});

server.listen(PORT);

'use strict';

const http = require('node:http');
const net = require('node:net');

const CRLF = '\r\n';
const PORT = 8000;
const DEFAULT_HTTP_PORT = 80;

const server = http.createServer((req, res) => {
  res.end('HTTP requests is not supported');
});

server.on('connect', (req, socket, head) => {
  socket.write('HTTP/1.1 200 Connection Established' + CRLF + CRLF);
  const { hostname, port } = new URL(`http://${req.url}`);
  const targetPort = parseInt(port, 10) || DEFAULT_HTTP_PORT;
  const proxy = net.connect(targetPort, hostname, () => {
    if (head) proxy.write(head);
    socket.pipe(proxy).pipe(socket);
  });
});

server.listen(PORT);

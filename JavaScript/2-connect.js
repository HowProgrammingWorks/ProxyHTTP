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
  const { hostname, port = '80' } = new URL(`http://${req.url}`);
  const targetPort = parseInt(port, 10);
  const proxy = net.connect(targetPort, hostname, () => {
    if (head) proxy.write(head);
    socket.pipe(proxy).pipe(socket);
  });
});

server.listen(PORT);

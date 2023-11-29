'use strict';

const net = require('node:net');
const { parseHeaders } = require('./utils.js');

const CRLF = '\r\n';
const PORT = 8000;
const DEFAULT_HTTP_PORT = 80;

const credentials = 'marcus:marcus';
const authToken = `Basic ${btoa(credentials)}`;

const server = net.createServer();

server.on('connection', (socket) => {
  const { remoteAddress } = socket;
  console.log('Client connected:', remoteAddress);

  socket.once('data', (data) => {
    const headers = parseHeaders(data);
    const { host, method, proxyAuthorization } = headers;

    if (proxyAuthorization !== authToken) {
      const HEADERS = [
        'HTTP/1.1 407 Proxy Authentication Required',
        'Proxy-Authenticate: Basic realm="Proxy Authentication Required"',
        'Content-Length: 0'
      ].join(CRLF) + CRLF + CRLF;
      socket.write(HEADERS);
      return void socket.end();
    }

    const { hostname, port } = new URL(`http://${host}`);
    const targetPort = parseInt(port, 10) || DEFAULT_HTTP_PORT;
    const proxy = net.createConnection(targetPort, hostname, () => {
      const isHttps = method === 'CONNECT';
      if (isHttps) socket.write('HTTP/1.1 200 OK' + CRLF + CRLF);
      else proxy.write(data);
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

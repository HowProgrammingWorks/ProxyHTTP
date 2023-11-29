'use strict';

const net = require('node:net');
const { parseHeaders } = require('./utils.js');

const EOL = '\r\n';
const PORT = 8000;

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
      const msg = 'HTTP/1.1 407 Proxy Authentication Required' + EOL +
      'Proxy-Authenticate: Basic realm="Proxy Authentication Required"' + EOL +
      'Content-Length: 0' + EOL + EOL;
      socket.write(msg);
      return void socket.end();
    }

    const { hostname, port = '80' } = new URL(`http://${host}`);
    const targetPort = parseInt(port, 10);
    const proxy = net.createConnection(targetPort, hostname, () => {
      const isHttps = method === 'CONNECT';
      if (isHttps) socket.write('HTTP/1.1 200 OK' + EOL + EOL);
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

'use strict';

const net = require('node:net');
const stream  = require('node:stream');
const { parseHeaders } = require('./utils.js');

const EOL = '\r\n';
const PORT = 8000;

const server = net.createServer();

server.on('connection', (socket) => {
  const { remoteAddress } = socket;
  console.log('Client connected:', remoteAddress + '\n');

  let size = 0;
  socket.once('data', (data) => {
    const { method, host } = parseHeaders(data.toString());
    const { hostname, port = '80' } = new URL(`http://${host}`);
    const targetPort = parseInt(port, 10);
    const proxy = net.createConnection(targetPort, hostname, () => {
      const isHttps = method === 'CONNECT';
      if (isHttps) socket.write('HTTP/1.1 200 OK' + EOL + EOL);
      else proxy.write(data);
      const options = {
        transform(chunk, encoding, next) {
          size += chunk.length;
          this.push(chunk);
          next();
        }
      };
      const sizeStream = new stream.Transform(options);
      socket.pipe(proxy).pipe(sizeStream).pipe(socket);
    });

    proxy.on('error', (err) => {
      console.error('Proxy connection error:', err.message);
      socket.end();
    });
  });

  socket.on('end', () => {
    console.log('Client disconnected:', remoteAddress, `Used ${size} bytes`);
  });

  socket.on('error', (err) => {
    console.error('Client connection error:', err.message);
  });
});

server.listen(PORT);

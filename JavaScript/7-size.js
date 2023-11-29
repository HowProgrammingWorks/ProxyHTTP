'use strict';

const net = require('node:net');
const stream  = require('node:stream');
const { parseHeader } = require('./utils.js');

const EOL = '\r\n';
const PORT = 8000;

const server = net.createServer();

server.on('connection', (socket) => {
  const { remoteAddress } = socket;
  console.log('Client connected:', remoteAddress + '\n');

  socket.once('data', (data) => {
    const { method, host } = parseHeader(data.toString());
    const { hostname, port } = new URL(`http://${host}`);

    const proxy = net.createConnection(port || '80', hostname, () => {
      const isHttps = method === 'CONNECT';
      if (isHttps) socket.write('HTTP/1.1 200 OK' + EOL + EOL);
      else proxy.write(data);
      let size = 0;
      const options = {
        transform(chunk, encoding, next) {
          size += chunk.length;
          this.push(chunk);
          next();
        }
      };
      const sizeStream = new stream.Transform(options);
      proxy.pipe(sizeStream).pipe(socket);
      socket.pipe(proxy);
      proxy.on('close', () => void console.log(`Client used "${size}" bytes`));
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

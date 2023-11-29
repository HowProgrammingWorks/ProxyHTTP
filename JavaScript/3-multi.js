'use strict';

const http = require('node:http');
const net = require('node:net');

const EOL = '\r\n';
const PORT = 8000;

const receiveBody = async (stream) => {
  const chunks = [];
  for await (const chunk of stream) chunks.push(chunk);
  return Buffer.concat(chunks);
};

const server = http.createServer(async (req, res) => {
  const { headers, url, method } = req;
  const { pathname, hostname } = new URL(url);
  const options = { hostname, path: pathname, method, headers };
  const request = http.request(options, (result) => void result.pipe(res));
  if (method === 'POST') {
    const body = await receiveBody(req);
    request.write(body);
  }
  request.end();
});

server.on('connect', (req, socket, head) => {
  socket.write('HTTP/1.1 200 Connection Established' + EOL + EOL);
  const { hostname, port } = new URL(`http://${req.url}`);
  const proxy = net.connect(port, hostname, () => {
    if (head) proxy.write(head);
    socket.pipe(proxy).pipe(socket);
  });
});

server.listen(PORT);

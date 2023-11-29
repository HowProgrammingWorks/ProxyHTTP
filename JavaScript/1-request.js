'use strict';

const http = require('node:http');

const PORT = 8000;

const receiveBody = async (stream) => {
  const chunks = [];
  for await (const chunk of stream) chunks.push(chunk);
  return Buffer.concat(chunks);
};

http.createServer(async (req, res) => {
  const { headers, url, method } = req;
  const { pathname, hostname } = new URL(url);
  const options = { hostname, path: pathname, method, headers };
  const request = http.request(options, (response) => void response.pipe(res));
  if (method === 'POST') {
    const body = await receiveBody(req);
    request.write(body);
  }
  request.end();
}).listen(PORT);

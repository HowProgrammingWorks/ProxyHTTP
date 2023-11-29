'use strict';

const https = require('node:https');

const port = 8000;
const host = 'localhost';

const options = {
  host: 'www.google.com',
  rejectUnauthorized: false, //Remove if proxy not use self-signed cert
  agent: new https.Agent({ host, port }),
};

https.request(options, (res) => {
  const chunks = [];
  res.on('data', (data) => void chunks.push(data));
  res.on('end', () => void console.log(chunks.join()));
}).end();

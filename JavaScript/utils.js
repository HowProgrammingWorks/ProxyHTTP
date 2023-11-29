'use strict';


const EOL = '\r\n';

const toUpperCamel = (s) => s.charAt(0).toUpperCase() + s.slice(1);

const toLower = (s) => s.toLowerCase();

const spinalToCamel = (s) => {
  const words = s.split('-');
  const first = words.length > 0 ? words.shift().toLowerCase() : '';
  return first + words.map(toLower).map(toUpperCamel).join('');
};

const parseHeaders = (buffer) => {
  const [headers] = buffer.toString().split(EOL + EOL);
  const lines = headers.split('\n');
  const [method] = lines.shift().split(' ');
  const result = lines.reduce((headers, line) => {
    const [key, value = ''] = line.split(': ');
    const header = key.includes('-') ? spinalToCamel(key) : toLower(key);
    headers[header] = value.trim();
    return headers;
  }, { method });
  return result;
};

module.exports = { parseHeaders };

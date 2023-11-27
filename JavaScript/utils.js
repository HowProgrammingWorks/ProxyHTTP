'use strict';

const toUpperCamel = (s) => s.charAt(0).toUpperCase() + s.slice(1);

const toLower = (s) => s.toLowerCase();

const spinalToCamel = (s) => {
  const words = s.split('-');
  const first = words.length > 0 ? words.shift().toLowerCase() : '';
  return first + words.map(toLower).map(toUpperCamel).join('');
};

const parseHeader = (header) => {
  const lines = header.split('\n').filter((l) => l !== '\r');
  const [method] = lines.shift().split(' ');
  const body = lines.pop();
  const result = lines.reduce((obj, line) => {
    const [key, value = ''] = line.split(': ');
    obj[key.includes('-') ? spinalToCamel(key) : toLower(key)] = value.trim();
    return obj;
  }, { method, body });
  return result;
};

module.exports = { parseHeader };

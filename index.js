#!/usr/bin/env node

var fs = require('fs');
var path = require('path');
var readline = require('readline');
var cwd = process.argv[2] ? path.resolve(process.argv[2]) : __dirname;
var files;
var res;
var rl;
require('colors');

if (!fs.statSync(cwd).isDirectory()) {
  console.log('Dir not found');
  process.exit(1);
}

files = fs.readdirSync(cwd);

function filterMedia(file) {
  return file.toLowerCase().match(/\.(avi|mp4|mkv|mov|flv|wmv)$/);
}

function extract(file) {
  var match = file.match(/[s|S]{1}(\d+).*[e|E]+(\d{2})/);
  if (match !== null) {
    return { filename: file, s: match[1], e: match[2] };
  }
  return null;
}

function filterParsed(ep) {
  return !!ep;
}

function formatName(ep) {
  ep.newFilename = 's' + ep.s + 'e' + ep.e + path.extname(ep.filename);
  ep.newFilename.toLowerCase();
  return ep;
}

function prinResult(ep) {
  console.log(ep.filename.cyan + ' -> ' + ep.newFilename.green);
}

function rename(ep) {
  fs.renameSync(path.join(cwd, ep.filename), path.join(cwd, ep.newFilename));
}

function answer(str) {
  var letter = str === '' || str === 'Y' ? 'Y' : 'n';
  if (letter === 'Y') {
    res.forEach(rename);
  }
  rl.close();
}

res = files
  .filter(filterMedia)
  .map(extract)
  .filter(filterParsed)
  .map(formatName);

if (res.length > 0) {
  rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  res.forEach(prinResult);
  rl.question('Is it ok? [Y/n] ', answer);
} else {
  console.log('This dir does not contains any episodes');
}

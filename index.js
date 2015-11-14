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

function pad(num, size) {
  var s = num + '';
  while (s.length < size) s = '0' + s;
  return s;
}

function filterMedia(file) {
  return file.toLowerCase().match(/\.(avi|mp4|mkv|mov|flv|wmv)$/);
}

function extract(file) {
  var match1 = file.match(/[s|S]{1}(\d+).*[e|E]+(\d+)/);
  var match2 = file.match(/(\d+)[x|X](\d+)/);
  var result = match1 || match2 || null;
  if (result !== null) {
    return { filename: file, s: pad(result[1], 2), e: pad(result[2], 2) };
  }
  return result;
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
    console.log('Completed');
  } else {
    console.log('Nothing changed');
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
  rl.question('\nIs it ok? [Y/n] ', answer);
} else {
  console.log('This dir does not contains any episodes');
}

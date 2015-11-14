'use strict';

var fs = require('fs');
var path = require('path');
var readline = require('readline');
require('colors');

var cwd = process.argv[2] ? path.resolve(process.argv[2]) : __dirname;
fs.statSync(cwd).isDirectory();
var files = fs.readdirSync(cwd);

function filterMedia(file) {
  return file.toLowerCase().match(/\.(avi|mp4|mkv|mov|flv|wmv)$/);
}

function extract(file) {
  var match = file.match(/[s|S]+(\d+).*[e|E]+(\d+)/);
  if (match !== null) {
    return { filename: file, s: match[1], e: match[2] }
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

var res = files
  .filter(filterMedia)
  .map(extract)
  .filter(filterParsed)
  .map(formatName);

if (res.length > 0) {
  res.forEach(prinResult);

  var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question('It is ok? [Y/n] ', function(answer) {
    answer = answer === '' || answer === 'Y' ? 'Y' : 'n';
    rl.close();
    if (answer === 'Y') {
      res.forEach(rename);
    }
  });
} else {
  console.log('This dir does not contains any episodes');
}

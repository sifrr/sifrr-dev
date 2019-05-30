const fs = require('fs'),
  path = require('path');

function loadDir(dir, onFile, deep = 100) {
  fs.readdirSync(dir).forEach(file => {
    const filePath = path.join(dir, file);
    fs.statSync(filePath).isDirectory()
      ? (deep > 0 ? loadDir(filePath, onFile, deep - 1) : () => {})
      : onFile(filePath);
  });
}

module.exports = loadDir;

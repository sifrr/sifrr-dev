const fs = require('fs'),
  path = require('path');

function loadDir({
  dir,
  onFile = () => {},
  onDir = () => {},
  deep = 100
} = {}) {
  if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) return false;
  fs.readdirSync(dir).forEach(file => {
    const filePath = path.join(dir, file);
    fs.statSync(filePath).isDirectory()
      ? (deep > 0 ? (onDir(filePath), loadDir({ dir: filePath, onFile, onDir, deep: deep - 1})) : () => {})
      : onFile(filePath);
  });
  return true;
}

module.exports = loadDir;

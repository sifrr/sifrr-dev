const fs = require('fs'),
  path = require('path');

function loadDir({
  dir,
  onFile = () => {},
  onDir = () => {},
  deep = 100,
  filter = () => true
} = {}) {
  if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) return false;
  fs.readdirSync(dir).forEach(file => {
    const filePath = path.join(dir, file);
    fs.statSync(filePath).isDirectory() && filter(dir) ? onDir(filePath) : onFile(filePath);
    if (deep > 0) loadDir({ dir: filePath, onFile, onDir, deep: deep - 1 });
  });
  return true;
}

module.exports = loadDir;

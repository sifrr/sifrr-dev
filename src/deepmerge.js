function type(value) {
  if (value === null) return 'null';
  if (typeof value === 'object') {
    if (Array.isArray(value)) return 'array';
  }
  return typeof value;
}

function deepMerge(target, merger) {
  switch (type(target)) {
  case 'array':
    return [...target, ...merger];
  case 'object':
    Object.keys(merger).forEach(k => {
      target[k] = deepMerge(target[k], merger[k]);
    });
    return target;
  default:
    return typeof merger === 'undefined' ? target : merger;
  }
}

module.exports = deepMerge;

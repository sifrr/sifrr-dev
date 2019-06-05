module.exports = (obj, keys = []) => {
  const ret = {};
  keys.forEach(k => {
    if (obj[k]) ret[k] = obj[k];
  });
  return ret;
};

const portfinder = require('portfinder');

module.exports = async function() {
  const first = await portfinder.getPortPromise({
    port: 10000
  });
  const second = await portfinder.getPortPromise({
    port: first + 1
  });

  return [first, second];
};

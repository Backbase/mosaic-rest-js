var BBRest = require('lib-bb-portal-rest').default;
var plugin = require('./plugin-request');

module.exports = function(config) {
  config.plugin = plugin;
  return new BBRest(config);
}

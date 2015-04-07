var fs = require('fs');
var path = require('path');
var Promise = require('bluebird');
var config = require('./config');
var Almanac = require('./lib/almanac');

 module.exports = function (mozaik) {
  mozaik.loadApiConfig(config);
  var keyPath = path.normalize(config.get('calendar.googleServiceKeypath'));

  // Seems absolute/relative?
  if (keyPath.substr(0, 1) !== '/') {
    keyPath = path.join(process.cwd(), keyPath);
  }

  if (!fs.existsSync(keyPath)) {
    mozaik.logger.error('Failed to find calendar .PEM file: %s -- ignoring API', keyPath);
    return {};
  }

  var almanac = new Almanac({
    serviceEmail: config.get('calendar.googleServiceEmail'),
    serviceKey: fs.readFileSync(keyPath).toString()
  });

  return {
    events: function(params) {

      return almanac.authorize()
      .then(function() {
        return almanac.readMultipleCalendars({ calendars: params.calendars });
      })
      .then(function(events) {
        return Promise.resolve(events);
      })
      .catch(function(err) {
        console.warn('Failed to read calendar events', err.toString())
        return Promise.resolve([]);
      });

    }
  }
};
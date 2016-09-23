var Promise = require('bluebird');
var googleapis = require('googleapis');
var _ = require('lodash');
var moment = require('moment');

/**
 * Almanac class for communicating with Analytics via googleapis
 * @param {object} opts Options { serviceEmail: 'googleemail', serviceKey: 'pemkeycontents..' }
 */
function Almanac(opts) {
  // Log the authentication
  var keyHeader = '-----BEGIN RSA PRIVATE KEY-----';
  var keyIdentifier = opts.serviceKey.substr(opts.serviceKey.indexOf(keyHeader) + keyHeader.length, 10);
  console.log('Authenticating calendar with', opts.serviceEmail, '/', keyIdentifier.replace(/\n/g, ''), '...');

  this.gapi = googleapis.calendar('v3');
  this.jwtClient = new googleapis.auth.JWT(
    opts.serviceEmail, null, opts.serviceKey, [
      'https://www.googleapis.com/auth/calendar.readonly'
    ]
  );
};

Almanac.prototype.authorize = function() {
  var self = this;
  return new Promise(function(resolve, reject) {
    self.jwtClient.authorize(function(err, tokens) {
      if (err) {
        return reject('Failed to authenticate:' + err.toString());
      }
      return resolve({ client: self.jwtClient, tokens: tokens });
    });
  });
};

/**
 * Internal method for making requests to Analytics
 * @param  {object} opts All the opts
 * @return {Promise}        Promise
 */
Almanac.prototype.readCalendar = function(opts) {
  opts = opts || {};
  var self = this;
  var events;

  opts.duration = opts.duration || 7;

  return new Promise(function(resolve, reject) {
    if (!self.gapi || !self.gapi.events || self.gapi.events.length === 0) {
      return reject('Failed to initialise calendar client or no events');
    }

    self.gapi.events.list({
      calendarId: opts.calendar.id,
      orderBy: "startTime",
      singleEvents: true,
      timeMin: moment().format(),
      timeMax: moment().add(opts.duration, "days").format(),
      auth: self.jwtClient
    }, function(err, response) {
      if (err) {
        reject(err);
      }

      if (!response.items || response.items.length === 0) {
        console.warn('No items found with calendarId:', opts.calendar.id);
        return resolve([]);
      }

      events = response.items.map(function(event) {
        return {
          title: event.summary,
          body: event.description,
          calendar: {
            id: opts.calendar.id,
            name: response.summary,
            title: opts.calendar.title || response.summary
          },
          location: event.location,
          start: moment(event.start.dateTime).valueOf(),
          end: moment(event.end.dateTime).valueOf()
        };
      });

      resolve(events);
    });
  });
};

/**
 * Read calendar events from multiple calendars
 * @param  {object} opts All the params
 * @param  {array} opts.calendars Array of calendars where each entry has { title: 'name cal', id: '123123' }
 * @return {Promise}     Promise that resolves with events
 */
Almanac.prototype.readMultipleCalendars = function(opts) {
  var self = this;

  var calendarPromises = opts.calendars.map(function(calendar) {
    return self.readCalendar({ calendar: calendar });
  });

  return new Promise(function(resolve, reject) {
    Promise.all(calendarPromises)
    .then(function(calendars) {
      var events = calendars.reduce(function(arr, calendar) {
        return arr.concat(calendar);
      })
      .filter(function(event) {
        if (opts.location) {
          return event.location === opts.location;
        } else {
          return true;
        }
      })
      .sort(function(a, b) {
        return a.start - b.start;
      });

      resolve(events);
    })
    .catch(reject);
  });
};

module.exports = exports = Almanac;

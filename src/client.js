import fs from 'fs';
import path from 'path';
import Promise from 'bluebird';
import config from './config';
import Almanac from './almanac';

const client = mozaik => {

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

  const apiCalls = {
    events: (params) => {

      return almanac.authorize()
      .then(() => {
        return almanac.readMultipleCalendars({ calendars: params.calendars });
      })
      .then((events) => {
        return Promise.resolve(events);
      })
      .catch((err) => {
        console.warn('Failed to read calendar events', err.toString())
        return Promise.resolve([]);
      });

    }
  };

  return apiCalls;
};

export default client;

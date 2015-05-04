# mozaik-ext-calendar

Google Calendar widgets for Mozaïk dashboard.

![preview-page-views](https://raw.githubusercontent.com/SC5/mozaik-ext-calendar/master/previews/next_event.png)

**Table of contents**
<!-- MarkdownTOC depth=0 autolink=true bracket=round -->

- [Setup](#setup)
- [Widget: calendar.next_event](#widget-calendarnext_event)
  - [parameters](#parameters)
  - [usage](#usage)
- [Changelog](#changelog)
- [License](#license)
- [Credit](#credit)

<!-- /MarkdownTOC -->


## Setup

Follow the steps to install and configure widget into dashboard

- Install modules from npmjs:

  ```shell
  npm install mozaik-ext-calendar
  ```

- Register client api by adding to dashboard `app.js`:

  ```javascript
  mozaik.bus.registerApi('calendar', require('mozaik-ext-calendar/client'));
  ```

- Register widgets by adding to dashboard ``src/App.jsx``:

  ```javascript
  mozaik.addBatch('calendar', require('mozaik-ext-calendar'));
  ```

- Build the dashboard:

  ```shell
  gulp publish
  ```

- Create Google service account for reading the calendar events

  - Create a project and service account in Google Developer Console if you don't have one yet
  - Enable API: Calendar API
  - Collect service email and .p12 file
  - Convert .p12 file into .PEM
  - Configure service key and .PEM file into dashboard `config.js` file and environment variables / `.env` file:

    ```javascript
    api: {
      calendar: {
        googleServiceEmail: process.env.GOOGLE_SERVICE_EMAIL,
        googleServiceKeypath: process.env.GOOGLE_SERVICE_KEYPATH
      }
    }
    ```

- Share the calendar(s) and collect id(s)

  - Login to Google Calendar
  - Select calendar you want to show in dashboard > **Share this Calendar**
  - Add service email address to list
  - Collect the **Calendar ID** from **Calendar Details** page (needed in widget configuration)

- Configure widgets (see next sections)

- Run the dashboard:

  ```shell
  node app.js
  ```

## Widget: calendar.next_event

Show next upcoming or ongoing event from calendar(s).
If multiple calendars are defined, the event closest to current
moment is shown.

![preview-page-views](https://raw.githubusercontent.com/SC5/mozaik-ext-calendar/master/previews/next_event.png)

### parameters

key           | required | description
--------------|----------|---------------
`calendars`   | yes      | *A list of calendar ids to read. Each entry must have id and title. Example: `[{ id: 'user.name@gmail.com', title: 'User' }, { id: 'another.user@gmail.com', title: 'Another' }]`*
`ordinal`     | no       | *The ordinal of the calendar event. 0 (default) shows the next/current, 1 shows the next after current etc. Handy with meeting room reseravation calendars*

### usage

```javascript
// dashboard config.js

// Calendars variable for widget configuration
var calendars = [
  { title: 'Meeting room 1', id: 'company.com_123@group.calendar.google.com' },
  { title: 'Meeting room 2', id: 'company.com_321@group.calendar.google.com' }
];

module.exports = {
  // Configure api
  api: {
    calendar: {
      googleServiceEmail: process.env.GOOGLE_SERVICE_EMAIL,
      googleServiceKeypath: process.env.GOOGLE_SERVICE_KEYPATH
    },
    // Other services ...
  },

  // Set widgets
  dashboards: [
    columns: 2,
    rows: 2,
    // See next sections for details
    widgets: [
      {
        type: 'calendar.next_event',
        calendars: calendars,
        ordinal: 0, // closest event to current moment
        columns: 1, rows: 1,
        x: 0, y: 0
      },
      {
        type: 'calendar.next_event',
        calendars: calendars,
        ordinal: 1, // event after closest one
        columns: 1, rows: 1,
        x: 1, y: 0
      },
    ]
  ]
}
```


## Changelog

- 0.1.3: Added missing almanac.js file in repo
- 0.1.2: Added previews in documentation
- 0.1.1: Fixed the documentation
- 0.1.0: Initial release

## License

Distributed under the MIT license

## Credit

The module is backed by [SC5](http://sc5.io/)

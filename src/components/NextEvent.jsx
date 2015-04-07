var _ = require('lodash');
var format = require('string-format');
var moment = require('moment');
var cryptojs = require('crypto-js');
var React = require('react');
var Reflux = require('reflux');
var ApiConsumerMixin = require('mozaik/browser').Mixin.ApiConsumer;


var formatEventTimerange = function(event) {
  var start, end, now, diff;
  start = moment(event.start);
  end = moment(event.end);
  now = moment();
  diff = start.diff(now);
  if (diff < 0) {
    return "Ends " + end.fromNow();
  } else {
    return start.calendar() + " to " + end.format("HH:mm");
  }
};

var NextEvent = React.createClass({
  mixins: [
    Reflux.ListenerMixin,
    ApiConsumerMixin
  ],

  getInitialState() {
    return {};
  },

  propTypes: {
    calendars: React.PropTypes.array.isRequired,
    ordinal: React.PropTypes.number
  },

  getApiRequest() {
    // NOTE: MD5 is unique enough for our purposes
    var calendarIds = _.map(this.props.calendars, function(calendar) {
      return calendar.id
    });
    var id = format('calendar.events.{}', cryptojs.MD5(calendarIds.join('-')));

    return {
      id: id,
      params: {
        calendars: this.props.calendars
      }
    };
  },

  onApiData(events) {
    if (!events || events.length === 0) {
      console.warn('No calendar events');
      return;
    }

    if (this.props.ordinal === undefined) {
      this.props.ordinal = 0;
    }

    var now = moment();

    this.setState({
      // NOTE: It's fine to have undefined if out of index
      event: events[this.props.ordinal],
      updated: now,
      ordinal: this.props.ordinal
    });
  },

  render() {
    var title = '';
    var timerange = '';
    var calendar = {};
    var desc = '';

    if (this.state.event) {
      calendar = this.state.event.calendar;
      title = this.state.event.title;
      desc = this.state.event.body;
      timerange = formatEventTimerange(this.state.event);
    }

    var widget = (
      <div>
        <div className="widget__header">
          {calendar.title}
          <i className="fa fa-calendar" />
        </div>
        <div className="widget__body calendar calendar__next_event">
          <h2>{title}</h2>
          <div>{timerange}</div>
          <p>{desc}</p>
        </div>
      </div>
    );

    return widget;
  }
});

module.exports = NextEvent;

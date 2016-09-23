import _ from 'lodash';
import moment from 'moment';
import cryptojs from 'crypto-js';
import React, { Component } from 'react';
import reactMixin from 'react-mixin';
import { ListenerMixin } from 'reflux';
import Mozaik from 'mozaik/browser';
import classNames from 'classnames';
import moment from 'moment';


function formatEventTimerange(event) {
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

class NextEvent extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  getApiRequest() {
    // NOTE: Generating unique id from calendar names
    var calendarIds = this.props.calendars.map((calendar) => calendar.id);
    var id = `calendar.events.${cryptojs.MD5(calendarIds.join('-'))}`;

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

NextEvent.propTypes = {
  calendars: React.PropTypes.array.isRequired,
  ordinal: React.PropTypes.number
};

NextEvent.defaultProps = {
  title: ''
};

// apply the mixins on the component
reactMixin(NextEvent.prototype, ListenerMixin);
reactMixin(NextEvent.prototype, Mozaik.Mixin.ApiConsumer);

export default NextEvent;

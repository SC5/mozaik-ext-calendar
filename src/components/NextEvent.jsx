import _ from 'lodash';
import moment from 'moment';
import cryptojs from 'crypto-js';
import React, { Component } from 'react';
import reactMixin from 'react-mixin';
import { ListenerMixin } from 'reflux';
import Mozaik from 'mozaik/browser';


function formatEventTimerange(event) {
  var start, end, now, diff;
  start = moment(event.start);
  end = moment(event.end);
  now = moment();
  diff = start.diff(now);
  if (diff < 0) {
    return `Ends ${end.fromNow()}`;
  } else {
    return `${start.calendar()} to ${end.format('HH:mm')}`;
  }
};

class NextEvent extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  getApiRequest() {
    // NOTE: Generating unique id from calendar names
    const calendarIds = this.props.calendars.map((calendar) => calendar.id);
    const id = `calendar.events.${cryptojs.MD5(calendarIds.join('-'))}`;

    return {
      id: id,
      params: {
        calendars: this.props.calendars
      }
    };
  }

  onApiData(events) {
    if (!events || events.length === 0) {
      console.warn('No calendar events');
      return;
    }

    if (this.props.ordinal === undefined) {
      this.props.ordinal = 0;
    }

    const now = moment();

    this.setState({
      // NOTE: It's fine to have undefined if out of index
      event: events[this.props.ordinal],
      updated: now,
      ordinal: this.props.ordinal
    });
  }

  render() {
    let title = '';
    let timerange = '';
    let calendar = {};
    let desc = '';

    // Collect values from event
    if (this.state.event) {
      calendar = this.state.event.calendar;
      title = this.state.event.title;
      desc = this.state.event.body;
      timerange = formatEventTimerange(this.state.event);
    }

    const widget = (
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

}

NextEvent.propTypes = {
  calendars: React.PropTypes.array.isRequired,
  ordinal: React.PropTypes.number
};

NextEvent.defaultProps = {
  title: 'Calendar'
};

// apply the mixins on the component
reactMixin(NextEvent.prototype, ListenerMixin);
reactMixin(NextEvent.prototype, Mozaik.Mixin.ApiConsumer);

export default NextEvent;

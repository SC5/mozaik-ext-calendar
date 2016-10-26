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

class List extends Component {
  constructor(props) {
    super(props);
    this.state = {
      events: []
    };
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

    const now = moment();
    this.setState({
      events: events,
      updated: now
    });
  }

  render() {
    //console.log('Events', this.state.events);
    const listItems = _.chain(this.state.events)
      .sortBy('time')
      .slice(0, this.props.limit !== 0 ? this.props.limit : this.state.events.length)
      .map((event, key) => {
        const time = moment(event.start);
        return (<li className="calendar__list-item" key={key}>
          <span className="calendar__list-item--title">{event.title}</span>
          <span className="calendar__list-item--date">({time.format(this.props.dateFormat)})</span>
        </li>);
      })
      .value();

    const widget = (
      <div>
        <div className="widget__header">
          {this.props.title}
          <i className="fa fa-calendar" />
        </div>
        <div className="widget__body calendar calendar__list-wrapper">
          <ul className="calendar__list">
            {listItems}
          </ul>
        </div>
      </div>
    );

    return widget;
  }

}

List.propTypes = {
  calendars: React.PropTypes.array.isRequired,
  dateFormat: React.PropTypes.string,
  limit: React.PropTypes.integer,
};

List.defaultProps = {
  title: 'Calendar',
  dateFormat: 'LL',
  limit: 0
};

// apply the mixins on the component
reactMixin(List.prototype, ListenerMixin);
reactMixin(List.prototype, Mozaik.Mixin.ApiConsumer);

export default List;

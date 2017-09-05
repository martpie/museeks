import React, { Component } from 'react';
import PropTypes from 'prop-types';

import AppActions from '../../actions/AppActions';

import classnames from 'classnames';


/*
|--------------------------------------------------------------------------
| TrackRow
|--------------------------------------------------------------------------
*/

export default class TrackRow extends Component {
  static propTypes = {
    children: PropTypes.array,
    selected: PropTypes.bool,
    trackId: PropTypes.string,
    index: PropTypes.number,
    onMouseDown: PropTypes.func,
    onContextMenu: PropTypes.func,
  }

  constructor(props) {
    super(props);
    this.state = {};

    this.start = this.start.bind(this);
    this.onMouseDown   = this.onMouseDown.bind(this);
    this.onContextMenu = this.onContextMenu.bind(this);
  }

  onMouseDown(e) {
    this.props.onMouseDown(e, this.props.trackId, this.props.index);
  }

  onContextMenu(e) {
    this.props.onContextMenu(e, this.props.index);
  }

  start() {
    AppActions.player.start(this.props.trackId);
  }

  render() {
    const trackClasses = classnames('track', {
      selected: this.props.selected,
    });

    return (
      <div
        className={trackClasses}
        onDoubleClick={this.start}
        onMouseDown={this.onMouseDown}
        onContextMenu={this.onContextMenu}
      >
        { this.props.children }
      </div>
    );
  }
}

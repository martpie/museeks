import React, { Component } from 'react';
import PropTypes from 'prop-types';

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
    onDoubleClick: PropTypes.func,
    onMouseDown: PropTypes.func,
    onContextMenu: PropTypes.func,
  }

  constructor(props) {
    super(props);
    this.state = {};

    this.onDoubleClick = this.onDoubleClick.bind(this);
    this.onMouseDown   = this.onMouseDown.bind(this);
    this.onContextMenu = this.onContextMenu.bind(this);
  }

  onMouseDown(e) {
    this.props.onMouseDown(e, this.props.trackId, this.props.index);
  }

  onContextMenu(e) {
    this.props.onContextMenu(e, this.props.index);
  }

  onDoubleClick() {
    this.props.onDoubleClick(this.props.trackId);
  }

  render() {
    const trackClasses = classnames('track', {
      selected: this.props.selected,
    });

    return (
      <div
        className={trackClasses}
        onDoubleClick={this.onDoubleClick}
        onMouseDown={this.onMouseDown}
        onContextMenu={this.onContextMenu}
      >
        { this.props.children }
      </div>
    );
  }
}

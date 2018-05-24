import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';


/*
|--------------------------------------------------------------------------
| Dropzone
|--------------------------------------------------------------------------
*/

export default class Dropzone extends Component {
  static propTypes = {
    title: PropTypes.string.isRequired,
    subtitle: PropTypes.string.isRequired,
    onDrop: PropTypes.func.isRequired,
    onClick: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props);
    this.state = {
      state: 'idle',
    };

    this.onDrop = this.onDrop.bind(this);
    this.onDragEnter = this.onDragEnter.bind(this);
    this.onDragLeave = this.onDragLeave.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
  }

  onKeyDown(e) {
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();

    switch (e.keyCode) {
      case 32: { // Space
        this.props.onClick();
        break;
      }
      default: {
        break;
      }
    }
  }

  onDragEnter() {
    this.setState({ state: 'dragging' });
  }

  onDragLeave() {
    this.setState({ state: 'idle' });
  }

  onDragOver(e) {
    e.preventDefault();
  }

  onDrop(e) {
    e.preventDefault();
    this.setState({ state: 'idle' });
    if (this.props.onDrop) this.props.onDrop(e.nativeEvent);
  }

  render() {
    const classes = classnames('dropzone', this.state.state);

    return (
      <div
        className={classes}
        onDragEnter={this.onDragEnter}
        onDragOver={this.onDragOver}
        onDragLeave={this.onDragLeave}
        onDrop={this.onDrop}
        onClick={this.props.onClick}
        onKeyDown={this.onKeyDown}
        role="button"
        tabIndex="0"
      >
        <div className="title">{ this.props.title }</div>
        <div className="subtitle">{ this.props.subtitle }</div>
      </div>
    );
  }
}

import React, { Component } from 'react';
import PropTypes from 'prop-types';


/*
|--------------------------------------------------------------------------
| Toast
|--------------------------------------------------------------------------
*/

export default class Toast extends Component {
  static propTypes = {
    type: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired,
  }

  render() {
    const { type, content } = this.props;

    return (
      <div className={`alert alert-${type}`}>
        { content }
      </div>
    );
  }
}

import React, { Component } from 'react';
import PropTypes from 'prop-types';


/*
|--------------------------------------------------------------------------
| Toast
|--------------------------------------------------------------------------
*/

export default class Toast extends Component {
  static propTypes = {
    type: PropTypes.string,
    content: PropTypes.string,
  }

  constructor(props) {
    super(props);
  }

  render() {
    const type = this.props.type;
    const content = this.props.content;

    return (
      <div className={`alert alert-${type}`}>
        { content }
      </div>
    );
  }
}

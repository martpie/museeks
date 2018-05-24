import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

/*
|--------------------------------------------------------------------------
| FullViewMessage
|--------------------------------------------------------------------------
*/

export default class FullViewMessage extends PureComponent {
  static propTypes = {
    children: PropTypes.node,
  }

  static defaultProps = {
    children: '',
  }

  render() {
    return (
      <div className="full-message">
        { this.props.children }
      </div>
    );
  }
}

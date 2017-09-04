import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

/*
|--------------------------------------------------------------------------
| FullViewMessage
|--------------------------------------------------------------------------
*/

export default class FullViewMessage extends PureComponent {
    static propTypes = {
      children: PropTypes.oneOfType([
        PropTypes.array,
        PropTypes.object,
      ]),
    }

    constructor(props) {
      super(props);
    }

    render() {
      return (
        <div className='full-message'>
          { this.props.children }
        </div>
      );
    }
}

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Toast from './Toast.react';


/*
|--------------------------------------------------------------------------
| Toasts
|--------------------------------------------------------------------------
*/

export default class Toasts extends Component {
    static propTypes = {
      toasts: PropTypes.array,
    }

    constructor(props) {
      super(props);
    }

    render() {
      return (
        <div className='toasts'>
          { this.props.toasts.map((toast, index) => {
            return (
              <Toast
                type={toast.type}
                content={toast.content}
                key={index}
              />
            );
          }) }
        </div>
      );
    }
}

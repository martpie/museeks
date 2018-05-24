import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import Toast from './Toast.react';


/*
|--------------------------------------------------------------------------
| Toasts
|--------------------------------------------------------------------------
*/

class Toasts extends Component {
  static propTypes = {
    toasts: PropTypes.array.isRequired,
  }

  render() {
    return (
      <div className="toasts">
        { this.props.toasts.map(toast => (
          <Toast
            type={toast.type}
            content={toast.content}
            key={toast._id}
          />
        )) }
      </div>
    );
  }
}


function mapStateToProps(state) {
  return { toasts: state.toasts };
}

export default connect(mapStateToProps)(Toasts);

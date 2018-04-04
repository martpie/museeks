import os from 'os';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Row } from 'react-bootstrap';
import KeyBinding from 'react-keybinding-component';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import classnames from 'classnames';

import Header from './Header/Header.react';
import Footer from './Footer/Footer.react';
import Toasts from './Toasts/Toasts.react';

import AppActions from '../actions/AppActions';
import * as PlayerActions from '../actions/PlayerActions';

import { config } from '../lib/app';


/*
|--------------------------------------------------------------------------
| The App
|--------------------------------------------------------------------------
*/

class Museeks extends Component {
  static propTypes = {
    toasts: PropTypes.array,
    children: PropTypes.object,
  }

  constructor(props) {
    super(props);

    this.onKey = this.onKey.bind(this);
  }

  componentDidMount() {
    AppActions.init();
  }

  onKey(e) {
    switch(e.keyCode) {
      case 32:
        e.preventDefault();
        e.stopPropagation();
        PlayerActions.playToggle();
        break;
    }
  }

  render() {
    const { toasts } = this.props;

    const wrapClasses = classnames('root', `os-${os.platform()}`, {
      'native-frame': config.get('useNativeFrame'),
    });

    return (
      <div className={wrapClasses}>
        <KeyBinding onKey={this.onKey} preventInputConflict />
        <Header />
        <main className='main-content container-fluid'>
          <Row className='content'>
            {this.props.children}
          </Row>
        </main>
        <Footer />
        <Toasts toasts={toasts} />
      </div>
    );
  }
}

function mapStateToProps(state) {
  return { toasts: state.toasts };
}

export default withRouter(connect(mapStateToProps)(Museeks));

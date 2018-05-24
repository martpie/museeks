import os from 'os';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Row } from 'react-bootstrap';
import KeyBinding from 'react-keybinding-component';
import { withRouter } from 'react-router';
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
    children: PropTypes.node,
  }

  static defaultProps = {
    children: null,
  }

  static onKey(e) {
    switch (e.keyCode) {
      case 32: // Space
        e.preventDefault();
        e.stopPropagation();
        PlayerActions.playPause();
        break;
      default:
        break;
    }
  }

  componentDidMount() {
    AppActions.init();
  }

  render() {
    const wrapClasses = classnames('root', `os-${os.platform()}`, {
      'native-frame': config.get('useNativeFrame'),
    });

    return (
      <div className={wrapClasses}>
        <KeyBinding onKey={Museeks.onKey} preventInputConflict />
        <Header />
        <main className="main-content container-fluid">
          <Row className="content">
            {this.props.children}
          </Row>
        </main>
        <Footer />
        <Toasts />
      </div>
    );
  }
}

export default withRouter(Museeks);

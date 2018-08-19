import * as os from 'os';
import * as React from 'react';
import { Row } from 'react-bootstrap';
import KeyBinding from 'react-keybinding-component';
import { withRouter, RouteComponentProps } from 'react-router';
import classnames from 'classnames';

import Header from './Header/Header';
import Footer from './Footer/Footer';
import Toasts from './Toasts/Toasts';

import AppActions from '../actions/AppActions';
import * as PlayerActions from '../actions/PlayerActions';

import { config } from '../lib/app';


/*
|--------------------------------------------------------------------------
| The App
|--------------------------------------------------------------------------
*/

type Props = RouteComponentProps<{}>;


class Museeks extends React.Component<Props> {
  static onKey(e: React.KeyboardEvent) {
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

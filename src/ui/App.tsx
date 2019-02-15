import * as os from 'os';
import * as React from 'react';
import { Row } from 'react-bootstrap';
import KeyBinding from 'react-keybinding-component';
import { withRouter, RouteComponentProps } from 'react-router';

import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import Toasts from './components/Toasts/Toasts';

import AppActions from './actions/AppActions';
import * as PlayerActions from './actions/PlayerActions';

import * as styles from './App.css';

/*
|--------------------------------------------------------------------------
| The App
|--------------------------------------------------------------------------
*/

type Props = RouteComponentProps<{}>;

class Museeks extends React.Component<Props> {
  static async onKey (e: KeyboardEvent) {
    switch (e.code) {
      case 'Space':
        e.preventDefault();
        e.stopPropagation();
        await PlayerActions.playPause();
        break;
      default:
        break;
    }
  }

  async componentDidMount () {
    await AppActions.init();
  }

  render () {
    return (
      <div className={`${styles.root} os-${os.platform()}`}>
        <KeyBinding onKey={Museeks.onKey} preventInputConflict />
        <Header />
        <main className={`${styles.mainContent} container-fluid`}>
          <Row className={styles.content}>
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

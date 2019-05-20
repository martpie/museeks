import * as os from 'os';
import * as React from 'react';
import KeyBinding from 'react-keybinding-component';
import { withRouter, RouteComponentProps } from 'react-router';

import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import Toasts from './components/Toasts/Toasts';

import AppActions from './actions/AppActions';
import * as PlayerActions from './actions/PlayerActions';

import * as styles from './App.css';
import { isCtrlKey } from './utils/utils-platform';

/*
|--------------------------------------------------------------------------
| The App
|--------------------------------------------------------------------------
*/

type Props = RouteComponentProps<{}>;

class Museeks extends React.Component<Props> {
  onKey = async (e: KeyboardEvent) => {
    switch (e.key) {
      case ' ':
        e.preventDefault();
        e.stopPropagation();
        await PlayerActions.playPause();
        break;
      case ',':
        if (isCtrlKey(e)) {
          e.preventDefault();
          e.stopPropagation();
          this.props.history.push('/settings');
        }
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
        <KeyBinding onKey={this.onKey} preventInputConflict />
        <Header />
        <main className={`${styles.mainContent} container-fluid`}>
          {this.props.children}
        </main>
        <Footer />
        <Toasts />
      </div>
    );
  }
}

export default withRouter(Museeks);

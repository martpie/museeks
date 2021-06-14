import os from 'os';
import React, { useCallback, useEffect } from 'react';
import KeyBinding from 'react-keybinding-component';
import { useHistory } from 'react-router';

import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import Toasts from './components/Toasts/Toasts';

import AppActions from './store/actions/AppActions';
import * as PlayerActions from './store/actions/PlayerActions';

import styles from './App.module.css';
import { isCtrlKey } from './lib/utils-platform';
import Player from './lib/player';

/*
|--------------------------------------------------------------------------
| The App
|--------------------------------------------------------------------------
*/

const Museeks: React.FC = (props) => {
  const history = useHistory();

  const onKey = useCallback(
    async (e: KeyboardEvent) => {
      switch (e.key) {
        case ' ':
          e.preventDefault();
          e.stopPropagation();
          PlayerActions.playPause();
          break;
        case ',':
          if (isCtrlKey(e)) {
            e.preventDefault();
            e.stopPropagation();
            history.push('/settings');
          }
          break;
        case 'ArrowLeft':
          e.preventDefault();
          e.stopPropagation();
          PlayerActions.jumpTo(Player.getCurrentTime() - 10);
          break;
        case 'ArrowRight':
          e.preventDefault();
          e.stopPropagation();
          PlayerActions.jumpTo(Player.getCurrentTime() + 10);
          break;
        default:
          break;
      }
    },
    [history]
  );

  useEffect(() => {
    AppActions.init();
  }, []);

  return (
    <div className={`${styles.root} os-${os.platform()}`}>
      <KeyBinding onKey={onKey} preventInputConflict />
      <Header />
      <main className={styles.mainContent}>{props.children}</main>
      <Footer />
      <Toasts />
    </div>
  );
};

export default Museeks;

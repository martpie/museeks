import PlayingBar from '../PlayingBar/PlayingBar';
import PlayerControls from '../PlayerControls/PlayerControls';
import Search from '../Search/Search';

import styles from './Header.module.css';

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.header__mainControls}>
        <PlayerControls />
      </div>
      <div className={styles.header__playingBar}>
        <PlayingBar />
      </div>
      <div className={styles.header__search}>
        <Search />
      </div>
    </header>
  );
}

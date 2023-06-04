import PlayingBar from '../PlayingBar/PlayingBar';
import PlayerControls from '../PlayerControls/PlayerControls';
import Search from '../Search/Search';
import usePlayerStore from '../../stores/usePlayerStore';

import styles from './Header.module.css';

export default function Header() {
  const { playerStatus, queue, queueCursor, shuffle, repeat } = usePlayerStore((state) => {
    return {
      playerStatus: state.playerStatus,
      repeat: state.repeat,
      shuffle: state.shuffle,
      queue: state.queue,
      queueCursor: state.queueCursor,
    };
  });

  return (
    <header className={styles.header}>
      <div className={styles.header__mainControls}>
        <PlayerControls playerStatus={playerStatus} />
      </div>
      <div className={styles.header__playingBar}>
        <PlayingBar queue={queue} queueCursor={queueCursor} shuffle={shuffle} repeat={repeat} />
      </div>
      <div className={styles.header__search}>
        <Search />
      </div>
    </header>
  );
}

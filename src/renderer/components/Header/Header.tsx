import React from 'react';
import { useSelector } from 'react-redux';

import PlayingBar from '../PlayingBar/PlayingBar';
import PlayerControls from '../PlayerControls/PlayerControls';
import Search from '../Search/Search';

import { RootState } from '../../store/reducers';

import styles from './Header.module.css';

const Header: React.FC = () => {
  const { playerStatus, queue, queueCursor, shuffle, repeat } = useSelector(({ player }: RootState) => {
    return {
      playerStatus: player.playerStatus,
      repeat: player.repeat,
      shuffle: player.shuffle,
      queue: player.queue,
      queueCursor: player.queueCursor,
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
};

export default Header;

import React from 'react';
import { connect } from 'react-redux';

import PlayingBar from '../PlayingBar/PlayingBar';
import PlayerControls from '../PlayerControls/PlayerControls';
import Search from '../Search/Search';

import * as LibraryActions from '../../store/actions/LibraryActions';
import { RootState } from '../../store/reducers';
import { TrackModel, PlayerStatus, Repeat } from '../../../shared/types/museeks';

import styles from './Header.module.css';

interface Props {
  playerStatus: PlayerStatus;
  repeat: Repeat;
  shuffle: boolean;
  queue: TrackModel[];
  queueCursor: number | null;
}

class Header extends React.Component<Props> {
  input: React.RefObject<React.Component>;

  constructor(props: Props) {
    super(props);

    this.input = React.createRef();
  }

  search(e: React.ChangeEvent<HTMLInputElement>) {
    LibraryActions.search(e.target.value);
  }

  render() {
    const { playerStatus, queue, queueCursor, shuffle, repeat } = this.props;

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
}

const mapStateToProps = ({ player }: RootState) => ({
  playerStatus: player.playerStatus,
  repeat: player.repeat,
  shuffle: player.shuffle,
  queue: player.queue,
  queueCursor: player.queueCursor,
});

export default connect(mapStateToProps)(Header);

import * as React from 'react';
import { connect } from 'react-redux';
import Input from 'react-simple-input';
import KeyBinding from 'react-keybinding-component';

import PlayingBar from '../PlayingBar/PlayingBar';
import PlayerControls from '../PlayerControls/PlayerControls';

import * as LibraryActions from '../../actions/LibraryActions';
import { isCtrlKey } from '../../utils/utils-platform';
import { RootState } from '../../reducers';
import { TrackModel, PlayerStatus, Repeat } from '../../../shared/types/interfaces';

import * as styles from './Header.css';

interface Props {
  playerStatus: PlayerStatus;
  repeat: Repeat;
  shuffle: boolean;
  queue: TrackModel[];
  queueCursor: number | null;
}

class Header extends React.Component<Props> {
  input: React.RefObject<React.Component>;

  constructor (props: Props) {
    super(props);

    this.input = React.createRef();
    this.onKey = this.onKey.bind(this);
  }

  onKey (e: KeyboardEvent) {
    // ctrl-f shortcut
    if (isCtrlKey(e) && e.key.toLowerCase() === 'f') {
      if (this.input.current) {
        // @ts-ignore
        // tslint:disable-next-line
        this.input.current.refs.input.select(); // HACKY
      }
    }
  }

  search (e: React.ChangeEvent<HTMLInputElement>) {
    LibraryActions.search(e.target.value);
  }

  render () {
    const {
      playerStatus, queue, queueCursor, shuffle, repeat
    } = this.props;

    return (
      <header className={styles.header}>
        <div className={styles.header__mainControls}>
          <PlayerControls
            playerStatus={playerStatus}
          />
        </div>
        <div className={styles.header__playingBar}>
          <PlayingBar
            queue={queue}
            queueCursor={queueCursor}
            shuffle={shuffle}
            repeat={repeat}
          />
        </div>
        <div className={styles.header__search}>
          <Input
            selectOnClick
            placeholder='search'
            className={styles.header__search__input}
            changeTimeout={250}
            clearButton
            ref={this.input}
            onChange={this.search}
          />
        </div>
        <KeyBinding onKey={this.onKey} preventInputConflict />
      </header>
    );
  }
}

const mapStateToProps = ({ player }: RootState) => ({
  playerStatus: player.playerStatus,
  repeat: player.repeat,
  shuffle: player.shuffle,
  queue: player.queue,
  queueCursor: player.queueCursor
});

export default connect(mapStateToProps)(Header);

import * as os from 'os';
import * as React from 'react';
import { connect } from 'react-redux';
import Input from 'react-simple-input';
import KeyBinding from 'react-keybinding-component';

import PlayingBar from './PlayingBar';
import WindowControls from './WindowControls';
import PlayerControls from './PlayerControls';

import * as LibraryActions from '../../actions/LibraryActions';
import { config } from '../../lib/app';
import { isCtrlKey } from '../../utils/utils-platform';
import { RootState } from '../../reducers';
import { TrackModel, PlayerStatus, Repeat } from '../../typings/interfaces';


/*
|--------------------------------------------------------------------------
| Header
|--------------------------------------------------------------------------
*/

interface Props {
  playerStatus: PlayerStatus;
  repeat: Repeat;
  shuffle: boolean;
  queue: TrackModel[];
  queueCursor: number;
  showTopHeader: boolean;
}


class Header extends React.Component<Props> {
  input: React.RefObject<HTMLInputElement>;

  constructor(props: Props) {
    super(props);

    this.input = React.createRef();
    this.onKey = this.onKey.bind(this);
  }

  onKey(e: React.KeyboardEvent) {
    // ctrl-f shortcut
    if (isCtrlKey(e) && e.keyCode === 70) {
      if (this.input.current) {
        this.input.current.select(); // HACKY
      }
    }
  }

  search(e: React.ChangeEvent<HTMLInputElement>) {
    LibraryActions.search(e.target.value);
  }

  render() {
    const {
      playerStatus, queue, queueCursor, shuffle, repeat, showTopHeader,
    } = this.props;

    return (
      <header>
        {
          showTopHeader && (
            <div className="top-header">
              <WindowControls />
            </div>
          )
        }
        <div className="main-header">
          <div className="col-main-controls">
            <PlayerControls
              playerStatus={playerStatus}
            />
          </div>
          <div className="col-player-infos">
            <PlayingBar
              queue={queue}
              queueCursor={queueCursor}
              shuffle={shuffle}
              repeat={repeat}
            />
          </div>
          <div className="col-search-controls">
            <Input
              selectOnClick
              placeholder="search"
              className="form-control input-sm search"
              changeTimeout={250}
              clearButton
              ref={this.input}
              onChange={this.search}
            />
          </div>
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
  queueCursor: player.queueCursor || 0,
  showTopHeader: os.platform() !== 'darwin' && !config.get('useNativeFrame'),
});

export default connect(mapStateToProps)(Header);

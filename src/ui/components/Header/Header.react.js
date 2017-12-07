import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Input from 'react-simple-input';
import KeyBinding from 'react-keybinding-component';

import PlayingBar     from './PlayingBar.react';
import WindowControls from './WindowControls.react';
import PlayerControls from './PlayerControls.react';

import AppActions from '../../actions/AppActions';
import { config } from '../../lib/app';


/*
|--------------------------------------------------------------------------
| Header
|--------------------------------------------------------------------------
*/

class Header extends Component {
  static propTypes = {
    playerStatus: PropTypes.string,
    queue: PropTypes.array,
    queueCursor: PropTypes.number,
    shuffle: PropTypes.bool,
    repeat: PropTypes.string,
    useNativeFrame: PropTypes.bool,
  }

  constructor(props) {
    super(props);

    this.onKey = this.onKey.bind(this);
  }

  getTopHeader(props) {
    if (props.useNativeFrame) return null;

    return (
      <div className='top-header'>
        <WindowControls />
      </div>
    );
  }

  search(e) {
    AppActions.library.filterSearch(e.target.value);
  }

  onKey(e) {
    switch (e.keyCode) {
      case 70: { // "F"
        if(e.ctrlKey) {
          this.refs.search.refs.input.select();
        }
      }
    }
  }

  render() {
    const { playerStatus, queue, queueCursor, shuffle, repeat } = this.props;

    return (
      <header>
        { this.getTopHeader(this.props) }
        <div className='main-header'>
          <div className='col-main-controls'>
            <PlayerControls
              playerStatus={playerStatus}
            />
          </div>
          <div className='col-player-infos'>
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
              placeholder='search'
              className='form-control input-sm search'
              changeTimeout={250}
              clearButton
              ref='search'
              onChange={this.search}
            />
          </div>
        </div>
        <KeyBinding onKey={this.onKey} preventInputConflict />
      </header>
    );
  }
}

const mapStateToProps = ({ player }) => ({
  playerStatus: player.playerStatus,
  repeat: player.repeat,
  shuffle: player.shuffle,
  queue: player.queue,
  queueCursor: player.queueCursor,
  useNativeFrame: config.get('useNativeFrame'),
});

export default connect(mapStateToProps)(Header);

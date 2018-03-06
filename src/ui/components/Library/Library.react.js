import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import FullViewMessage from '../Shared/FullViewMessage.react';
import TracksList from '../Shared/TracksList.react';
import { filterTracks, sortTracks } from '../../utils/utils-library';
import * as SORT_ORDERS from '../../constants/sort-orders';


/*
|--------------------------------------------------------------------------
| Global View
|--------------------------------------------------------------------------
*/

class Library extends Component {
  static propTypes = {
    library: PropTypes.object,
    playlists: PropTypes.array,
    playerStatus: PropTypes.string,
    queue: PropTypes.any,
  }

  constructor(props) {
    super(props);
  }

  getLibraryComponent(props) {
    const { library, playerStatus, playlists, player, tracks } = props;
    const trackPlayingId = (player.queue.length > 0 && player.queueCursor !== null) ? player.queue[player.queueCursor]._id : null;

    // Loading library
    if (library.loading) {
      return (
        <FullViewMessage>
          <p>Loading library...</p>
        </FullViewMessage>
      );
    }

    // Empty library
    if (tracks.length === 0 && library.search === '') {
      if (library.refreshing) {
        return (
          <FullViewMessage>
            <p>Your library is being scanned =)</p>
            <p className='sub-message'>hold on...</p>
          </FullViewMessage>
        );
      }

      return (
        <FullViewMessage>
          <p>Too bad, there is no music in your library =(</p>
          <p className='sub-message'>
            <span>nothing found yet, but that's fine, you can always </span>
            <Link to='/settings/library'>add your music here</Link>
          </p>
        </FullViewMessage>
      );
    }

    // Empty search
    if (tracks.length === 0) {
      return (
        <FullViewMessage>
          <p>Your search returned no results</p>
          <p className='sub-message'>
            <span>nothing found yet, but that's fine, you can always <Link to='/settings/library'>add your music here</Link>
            </span>
          </p>
        </FullViewMessage>
      );
    }

    // All good !
    return (
      <TracksList
        type='library'
        playerStatus={playerStatus}
        tracks={tracks}
        trackPlayingId={trackPlayingId}
        playlists={playlists}
      />
    );
  }

  render() {
    return (
      <div className='view view-library' >
        { this.getLibraryComponent(this.props) }
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  const { search, tracks, sort } = state.library;

  // Filter and sort TracksList
  // sorting being a costly operation, do it after filtering
  const filteredTracks = sortTracks(
    filterTracks(tracks.library, search),
    SORT_ORDERS[sort.by][sort.order]
  );

  return {
    playerStatus: state.player.playerStatus,
    playlists: state.playlists,
    library: state.library,
    player: state.player,
    tracks: filteredTracks,
  };
};

export default connect(mapStateToProps)(Library);

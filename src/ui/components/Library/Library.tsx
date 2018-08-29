import * as React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';

import FullViewMessage from '../Shared/FullViewMessage';
import TracksList from '../Shared/TracksList';
import { filterTracks, sortTracks } from '../../utils/utils-library';
import SORT_ORDERS from '../../constants/sort-orders';
import { PlaylistModel, TrackModel } from '../../../shared/types/interfaces';
import { LibraryState } from '../../reducers/library';
import { PlayerState } from '../../reducers/player';
import { RootState } from '../../reducers';

/*
|--------------------------------------------------------------------------
| Global View
|--------------------------------------------------------------------------
*/

interface Props {
  library: LibraryState;
  playlists: PlaylistModel[];
  player: PlayerState;
  tracks: TrackModel[];
}

class Library extends React.Component<Props> {
  constructor (props: Props) {
    super(props);
    this.getLibraryComponent = this.getLibraryComponent.bind(this);
  }

  getLibraryComponent () {
    const { library, playlists, player, tracks } = this.props;
    const { playerStatus } = player;

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
            <span>nothing found yet, but that{"'"}s fine, you can always</span>
            {' '}
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

  render () {
    return (
      <div className='view view-library' >
        { this.getLibraryComponent() }
      </div>
    );
  }
}

const mapStateToProps = (state: RootState) => {
  const { search, tracks, sort } = state.library;

  // Filter and sort TracksList
  // sorting being a costly operation, do it after filtering
  const filteredTracks = sortTracks(
    filterTracks(tracks.library, search),
    SORT_ORDERS[sort.by][sort.order]
  );

  return {
    playlists: state.playlists,
    library: state.library,
    player: state.player,
    tracks: filteredTracks
  };
};

export default connect(mapStateToProps)(Library);

import * as React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';

import * as ViewMessage from '../../elements/ViewMessage/ViewMessage';
import TracksList from '../../components/TracksList/TracksList';
import { filterTracks, sortTracks } from '../../utils/utils-library';
import SORT_ORDERS from '../../constants/sort-orders';
import { PlaylistModel, TrackModel } from '../../../shared/types/interfaces';
import { LibraryState } from '../../reducers/library';
import { PlayerState } from '../../reducers/player';
import { RootState } from '../../reducers';

import * as styles from './Library.css';
import * as appStyles from '../../App.css';

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
        <ViewMessage.Notice>
          <p>Loading library...</p>
        </ViewMessage.Notice>
      );
    }

    // Empty library
    if (tracks.length === 0 && library.search === '') {
      if (library.refreshing) {
        return (
          <ViewMessage.Notice>
            <p>Your library is being scanned =)</p>
            <ViewMessage.Sub>hold on...</ViewMessage.Sub>
          </ViewMessage.Notice>
        );
      }

      return (
        <ViewMessage.Notice>
          <p>Too bad, there is no music in your library =(</p>
          <ViewMessage.Sub>
            <span>nothing found yet, but that{"'"}s fine, you can always</span>
            {' '}
            <Link to='/settings/library' draggable={false}>add your music here</Link>
          </ViewMessage.Sub>
        </ViewMessage.Notice>
      );
    }

    // Empty search
    if (tracks.length === 0) {
      return (
        <ViewMessage.Notice>
          <p>Your search returned no results</p>
        </ViewMessage.Notice>
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
      <div className={`${appStyles.view} ${styles.viewLibrary}`}>
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
    playlists: state.playlists.list,
    library: state.library,
    player: state.player,
    tracks: filteredTracks
  };
};

export default connect(mapStateToProps)(Library);

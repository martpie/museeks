import * as React from 'react';
import { connect } from 'react-redux';
import { Route, Redirect, withRouter, RouteComponentProps } from 'react-router-dom';

import PlaylistsNav from './PlaylistsNav';
import FullViewMessage from '../Shared/FullViewMessage';

import * as PlaylistsActions from '../../actions/PlaylistsActions';
import Playlist from './Playlist';
import { PlaylistModel } from '../../typings/interfaces';
import { RootState } from '../../reducers';


/*
|--------------------------------------------------------------------------
| Playlists
|--------------------------------------------------------------------------
*/

interface OwnProps {
  playlists: PlaylistModel[],
}

interface RouteParams {
  playlistId: string;
}

type Props = OwnProps & RouteComponentProps<RouteParams>;

class Playlists extends React.Component<Props> {
  constructor(props: Props) {
    super(props);

    this.autoRedirect = this.autoRedirect.bind(this);
    this.createPlaylist = this.createPlaylist.bind(this);
  }

  createPlaylist() {
    PlaylistsActions.create('New playlist', true);
  }

  autoRedirect() {
    const { playlistId } = this.props.match.params;

    // If there is not playlist selected, redirect to the first one
    if (!playlistId) {
      return <Redirect to={`/playlists/${this.props.playlists[0]._id}`} />;
    }

    // Maybe this id does not exist in the library anymore
    // (after deleting a library for example)
    const { playlists } = this.props;

    if (playlists.every(elem => elem._id !== playlistId)) {
      if (playlists.length === 0) {
        return <Redirect to="/playlists" />;
      }

      return <Redirect to={`/playlists/${this.props.playlists[0]._id}`} />;
    }

    return null;
  }

  render() {
    const { playlists } = this.props;
    let playlistContent;

    if (playlists === null) {
      playlistContent = (
        <FullViewMessage>
          <p>Loading playlists</p>
        </FullViewMessage>
      );
    } else if (playlists.length === 0) {
      playlistContent = (
        <FullViewMessage>
          <p>You haven{"'"}t created any playlist yet</p>
          <p className="sub-message">
            <button
              onClick={this.createPlaylist}
              className="button-link"
              tabIndex={0}
            >
              create one now
            </button>
          </p>
        </FullViewMessage>
      );
    } else {
      playlistContent = (
        <React.Fragment>
          <Route path="/playlists" render={this.autoRedirect} />
          <Route path="/playlists/:playlistId" component={Playlist} />
        </React.Fragment>
      );
    }

    return (
      <div className="view view-playlists">
        <PlaylistsNav playlists={playlists} />
        <div className="playlist">
          { playlistContent }
        </div>
      </div>
    );
  }
}


const mapStateToProps = ({ playlists, player }: RootState) => ({
  playlists,
  playerStatus: player.playerStatus,
});


export default withRouter(connect(mapStateToProps)(Playlists));

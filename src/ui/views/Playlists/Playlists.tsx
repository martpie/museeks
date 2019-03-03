import * as React from 'react';
import { connect } from 'react-redux';
import { Route, Redirect, withRouter, RouteComponentProps } from 'react-router-dom';

import PlaylistsNav from '../../components/PlaylistsNav/PlaylistsNav';
import * as ViewMessage from '../../elements/ViewMessage/ViewMessage';

import * as PlaylistsActions from '../../actions/PlaylistsActions';
import Playlist from '../../components/Playlists/Playlist';
import { PlaylistModel } from '../../../shared/types/interfaces';
import { RootState } from '../../reducers';

import * as styles from './Playlists.css';
import * as appStyles from '../../App.css';

interface OwnProps {
  playlists: PlaylistModel[];
  playlistsLoading: boolean;
}

interface RouteParams {
  playlistId: string;
}

type Props = OwnProps & RouteComponentProps<RouteParams>;

class Playlists extends React.Component<Props> {
  constructor (props: Props) {
    super(props);

    this.autoRedirect = this.autoRedirect.bind(this);
    this.createPlaylist = this.createPlaylist.bind(this);
  }

  async createPlaylist () {
    await PlaylistsActions.create('New playlist', [], false, true);
  }

  autoRedirect () {
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
        return <Redirect to='/playlists' />;
      }

      return <Redirect to={`/playlists/${this.props.playlists[0]._id}`} />;
    }

    return null;
  }

  render () {
    const { playlists, playlistsLoading } = this.props;
    let playlistContent;

    if (playlistsLoading) {
      playlistContent = (
        <ViewMessage.Notice>
          <p>Loading playlists...</p>
        </ViewMessage.Notice>
      );
    } else if (playlists.length === 0) {
      playlistContent = (
        <ViewMessage.Notice>
          <p>You haven{"'"}t created any playlist yet</p>
          <ViewMessage.Sub>
            <button
              onClick={this.createPlaylist}
              className='reset'
              tabIndex={0}
            >
              create one now
            </button>
          </ViewMessage.Sub>
        </ViewMessage.Notice>
      );
    } else {
      playlistContent = (
        <React.Fragment>
          <Route path='/playlists' render={this.autoRedirect} />
          <Route path='/playlists/:playlistId' component={Playlist} />
        </React.Fragment>
      );
    }

    return (
      <div className={`${appStyles.view} ${styles.viewPlaylists}`}>
        <PlaylistsNav playlists={playlists} />
        <div className={styles.playlist}>
          { playlistContent }
        </div>
      </div>
    );
  }
}

const mapStateToProps = ({ playlists }: RootState): OwnProps => ({
  playlistsLoading: playlists.loading,
  playlists: playlists.list
});

export default withRouter(connect(mapStateToProps)(Playlists));

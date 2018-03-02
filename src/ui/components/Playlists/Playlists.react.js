import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Route, Redirect } from 'react-router-dom';

import PlaylistsNav from './PlaylistsNav.react';
import FullViewMessage from '../Shared/FullViewMessage.react';

import AppActions from '../../actions/AppActions';
import Playlist from './Playlist.react';


/*
|--------------------------------------------------------------------------
| Playlists
|--------------------------------------------------------------------------
*/

class Playlists extends Component {
  static propTypes = {
    params: PropTypes.object,
    playlists: PropTypes.array,
    playerStatus: PropTypes.string,
  }

  constructor(props) {
    super(props);

    this.autoRedirect = this.autoRedirect.bind(this);
  }

  createPlaylist() {
    AppActions.playlists.create('New playlist', true);
  }

  autoRedirect() {
    return <Redirect to={`/playlists/${this.props.playlists[0]._id}`} />;
  }

  render() {
    const { playlists } = this.props;
    let playlistContent;

    if(playlists === null) {
      playlistContent = (
        <FullViewMessage>
          <p>Loading playlists</p>
        </FullViewMessage>
      );
    } else if(playlists.length === 0) {
      playlistContent = (
        <FullViewMessage>
          <p>You haven't created any playlist yet</p>
          <p className='sub-message'>
            <a onClick={this.createPlaylist}>create one now</a>
          </p>
        </FullViewMessage>
      );
    } else {
      playlistContent = (
        <React.Fragment>
          <Route exact path="/playlists" render={this.autoRedirect} />
          <Route path='/playlists/:playlistId' component={Playlist} />
        </React.Fragment>
      );
    }

    return (
      <div className='view view-playlists'>
        <PlaylistsNav playlists={playlists} />
        <div className='playlist'>
          { playlistContent }
        </div>
      </div>
    );
  }
}


const mapStateToProps = ({ playlists, player }) => ({
  playlists,
  playerStatus: player.playerStatus,
});


export default connect(mapStateToProps)(Playlists);

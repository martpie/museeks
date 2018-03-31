import electron from 'electron';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { ButtonGroup, Button } from 'react-bootstrap';
import Icon from 'react-fontawesome';

import AppActions from '../../actions/AppActions';

import PlaylistsNavLink from './PlaylistsNavLink.react';

import { IPCM_PL_CONTEXTMENU_REPLY } from '../../../shared/constants/ipc';

const ipcRenderer = electron.ipcRenderer;


/*
|--------------------------------------------------------------------------
| PlaylistsNav
|--------------------------------------------------------------------------
*/

class PlaylistsNav extends Component {
  static propTypes = {
    playlists: PropTypes.array,
  }

  constructor(props) {
    super(props);

    this.state = {
      renamed: null, // the playlist being renamed if there's one
    };

    this.blur = this.blur.bind(this);
    this.focus = this.focus.bind(this);
    this.keyDown = this.keyDown.bind(this);
    this.showContextMenu = this.showContextMenu.bind(this);
    this.createPlaylist = this.createPlaylist.bind(this);
  }

  componentDidMount() {
    const self = this;

    ipcRenderer.on(IPCM_PL_CONTEXTMENU_REPLY, (event, reply, _id) => {
      switch(reply) {
        case 'delete':
          AppActions.playlists.remove(_id);
          break;
        case 'rename':
          self.setState({ renamed: _id });
          break;
      }
    });
  }

  componentWillUnmount() {
    ipcRenderer.removeAllListeners(IPCM_PL_CONTEXTMENU_REPLY);
  }

  showContextMenu(_id) {
    ipcRenderer.send('playlistContextMenu', _id);
  }

  createPlaylist() {
    AppActions.playlists.create('New playlist', true);
  }

  rename(_id, name) {
    AppActions.playlists.rename(_id, name);
  }

  keyDown(e) {
    switch(e.keyCode) {
      case 13: { // Enter
        this.rename(this.state.renamed, e.currentTarget.value);
        this.setState({ renamed: null });
        break;
      }
      case 27: { // Escape
        this.setState({ renamed: null });
        break;
      }
    }
  }

  blur(e) {
    this.rename(this.state.renamed, e.currentTarget.value);
    this.setState({ renamed: null });
  }

  focus(e) {
    e.currentTarget.select();
  }

  render() {
    const self = this;
    const { playlists } = this.props;

    // TODO (y.solovyov): extract into separate method that returns items
    const nav = playlists.map((elem) => {
      let navItemContent;

      if(elem._id === self.state.renamed) {
        navItemContent = (
          <input
            type='text'
            autoFocus
            defaultValue={elem.name}
            onKeyDown={self.keyDown}
            onBlur={self.blur}
            onFocus={self.focus}
          />
        );
      } else {
        navItemContent = (
          <PlaylistsNavLink
            playlistId={elem._id}
            onContextMenu={self.showContextMenu}
          >
            { elem.name }
          </PlaylistsNavLink>
        );
      }

      return (
        <div className='playlist-nav-item' key={`playlist-${elem._id}`}>
          { navItemContent }
        </div>
      );
    });

    return (
      <div className='playlists-nav'>
        <div className='playlists-nav-body'>
          { nav }
        </div>
        <div className='playlists-nav-footer'>
          <ButtonGroup className='playlists-management'>
            <Button bsStyle='link' bsSize='xs' onClick={this.createPlaylist}>
              <Icon name='plus' />
            </Button>
          </ButtonGroup>
        </div>
      </div>
    );
  }
}

export default PlaylistsNav;

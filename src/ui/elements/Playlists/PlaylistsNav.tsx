import * as electron from 'electron';
import * as React from 'react';
import { ButtonGroup, Button } from 'react-bootstrap';
import * as Icon from 'react-fontawesome';

import * as PlaylistsActions from '../../actions/PlaylistsActions';

import PlaylistsNavLink from './PlaylistsNavLink';
import { PlaylistModel } from '../../../shared/types/interfaces';

const { Menu } = electron.remote;

/*
|--------------------------------------------------------------------------
| PlaylistsNav
|--------------------------------------------------------------------------
*/

interface Props {
  playlists: PlaylistModel[];
}

interface State {
  renamed: string | null;
}

class PlaylistsNav extends React.Component<Props, State> {
  constructor (props: Props) {
    super(props);

    this.state = {
      renamed: null // the playlist being renamed if there's one
    };

    this.blur = this.blur.bind(this);
    this.focus = this.focus.bind(this);
    this.keyDown = this.keyDown.bind(this);
    this.showContextMenu = this.showContextMenu.bind(this);
    this.createPlaylist = this.createPlaylist.bind(this);
  }

  showContextMenu (_id: string) {
    const template = [
      {
        label: 'Delete',
        click: async () => {
          await PlaylistsActions.remove(_id);
        }
      },
      {
        label: 'Rename',
        click: () => {
          this.setState({ renamed: _id });
        }
      }
    ];

    const context = Menu.buildFromTemplate(template);

    context.popup({}); // Let it appear
  }

  async createPlaylist () {
    // Todo 'new playlist 1', 'new playlist 2' ...
    await PlaylistsActions.create('New playlist', true);
  }

  async rename (_id: string, name: string) {
    await PlaylistsActions.rename(_id, name);
  }

  async keyDown (e: React.KeyboardEvent<HTMLInputElement>) {
    e.persist();

    switch (e.nativeEvent.code) {
      case 'Enter': { // Enter
        if (this.state.renamed && e.currentTarget) {
          await this.rename(this.state.renamed, e.currentTarget.value);
          this.setState({ renamed: null });
        }
        break;
      }
      case 'Escape': { // Escape
        this.setState({ renamed: null });
        break;
      }
      default: {
        break;
      }
    }
  }

  async blur (e: React.FocusEvent<HTMLInputElement>) {
    if (this.state.renamed) {
      await this.rename(this.state.renamed, e.currentTarget.value);
    }

    this.setState({ renamed: null });
  }

  focus (e: React.FocusEvent<HTMLInputElement>) {
    e.currentTarget.select();
  }

  render () {
    const self = this;
    const { playlists } = this.props;

    // TODO (y.solovyov): extract into separate method that returns items
    const nav = playlists.map((elem) => {
      let navItemContent;

      if (elem._id === self.state.renamed) {
        navItemContent = (
          <input
            type='text'
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

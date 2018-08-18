import electron from 'electron';
import React, { Component } from 'react';
import { ButtonGroup, Button } from 'react-bootstrap';
import Icon from 'react-fontawesome';

import * as PlaylistsActions from '../../actions/PlaylistsActions';

import PlaylistsNavLink from './PlaylistsNavLink';
import { PlaylistModel } from '../../typings/interfaces';

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

class PlaylistsNav extends Component<Props, State> {
  constructor(props: Props) {
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

  showContextMenu(_id: string) {
    const template = [
      {
        label: 'Delete',
        click: () => {
          PlaylistsActions.remove(_id);
        },
      },
      {
        label: 'Rename',
        click: () => {
          this.setState({ renamed: _id });
        },
      },
    ];

    const context = Menu.buildFromTemplate(template);

    context.popup({}); // Let it appear
  }

  createPlaylist() {
    // Todo 'new playlist 1', 'new playlist 2' ...
    PlaylistsActions.create('New playlist', true);
  }

  rename(_id: string, name: string) {
    PlaylistsActions.rename(_id, name);
  }

  keyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    switch (e.keyCode) {
      case 13: { // Enter
        if (this.state.renamed && e.currentTarget) {
          this.rename(this.state.renamed, e.currentTarget.value);
          this.setState({ renamed: null });
        }
        break;
      }
      case 27: { // Escape
        this.setState({ renamed: null });
        break;
      }
      default: {
        break;
      }
    }
  }

  blur(e: React.FocusEvent<HTMLInputElement>) {
    if (this.state.renamed) {
      this.rename(this.state.renamed, e.currentTarget.value);
    }

    this.setState({ renamed: null });
  }

  focus(e: React.FocusEvent<HTMLInputElement>) {
    e.currentTarget.select();
  }

  render() {
    const self = this;
    const { playlists } = this.props;

    // TODO (y.solovyov): extract into separate method that returns items
    const nav = playlists.map((elem) => {
      let navItemContent;

      if (elem._id === self.state.renamed) {
        navItemContent = (
          <input
            type="text"
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
        <div className="playlist-nav-item" key={`playlist-${elem._id}`}>
          { navItemContent }
        </div>
      );
    });

    return (
      <div className="playlists-nav">
        <div className="playlists-nav-body">
          { nav }
        </div>
        <div className="playlists-nav-footer">
          <ButtonGroup className="playlists-management">
            <Button bsStyle="link" bsSize="xs" onClick={this.createPlaylist}>
              <Icon name="plus" />
            </Button>
          </ButtonGroup>
        </div>
      </div>
    );
  }
}

export default PlaylistsNav;

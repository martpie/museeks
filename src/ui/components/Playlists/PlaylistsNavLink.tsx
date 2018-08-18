import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';


/*
|--------------------------------------------------------------------------
| PlaylistsNav
|--------------------------------------------------------------------------
*/

interface Props {
  playlistId: string,
  onContextMenu: (playlistId: string) => void,
}

export default class PlaylistsNavLink extends Component<Props> {
  constructor(props: Props) {
    super(props);

    this.onContextMenu = this.onContextMenu.bind(this);
  }

  onContextMenu() {
    this.props.onContextMenu(this.props.playlistId);
  }

  render() {
    return (
      <NavLink
        className="playlist-link"
        activeClassName="active"
        to={`/playlists/${this.props.playlistId}`}
        onContextMenu={this.onContextMenu}
      >
        { this.props.children }
      </NavLink>
    );
  }
}

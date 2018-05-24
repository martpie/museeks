import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';


/*
|--------------------------------------------------------------------------
| PlaylistsNav
|--------------------------------------------------------------------------
*/

export default class PlaylistsNavLink extends Component {
  static propTypes = {
    children: PropTypes.node,
    playlistId: PropTypes.string.isRequired,
    onContextMenu: PropTypes.func.isRequired,
  }

  static defaultProps = {
    children: null,
  }

  constructor(props) {
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

import * as React from 'react';
import { NavLink } from 'react-router-dom';

import * as styles from './PlaylistsNavLink.css';

interface Props {
  playlistId: string;
  onContextMenu: (playlistId: string) => void;
}

export default class PlaylistsNavLink extends React.Component<Props> {
  constructor (props: Props) {
    super(props);

    this.onContextMenu = this.onContextMenu.bind(this);
  }

  onContextMenu () {
    this.props.onContextMenu(this.props.playlistId);
  }

  render () {
    return (
      <NavLink
        className={styles.playlistLink}
        activeClassName='-is-active'
        to={`/playlists/${this.props.playlistId}`}
        onContextMenu={this.onContextMenu}
      >
        { this.props.children }
      </NavLink>
    );
  }
}

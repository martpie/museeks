import * as React from 'react';
import { NavLink } from 'react-router-dom';

import * as PlaylistActions from '../../actions/PlaylistsActions';

import * as styles from './PlaylistsNavLink.css';

interface Props {
  className?: string;
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
        className={`${this.props.className} ${styles.playlistLink}`}
        activeClassName='-is-active'
        to={`/playlists/${this.props.playlistId}`}
        onContextMenu={this.onContextMenu}
        draggable={false}
        onDoubleClick={() => PlaylistActions.play(this.props.playlistId)}
      >
        { this.props.children }
      </NavLink>
    );
  }
}

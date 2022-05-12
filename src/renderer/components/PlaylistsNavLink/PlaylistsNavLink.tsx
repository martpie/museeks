import React from 'react';
import { NavLink } from 'react-router-dom';

import * as PlaylistActions from '../../store/actions/PlaylistsActions';

import styles from './PlaylistsNavLink.module.css';

interface Props {
  children: React.ReactNode;
  className?: string;
  playlistId: string;
  onContextMenu: (playlistId: string) => void;
}

export default class PlaylistsNavLink extends React.Component<Props> {
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
        className={({ isActive }) => `${this.props.className} ${styles.playlistLink} ${isActive && 'isActive'}`}
        to={`/playlists/${this.props.playlistId}`}
        onContextMenu={this.onContextMenu}
        draggable={false}
        onDoubleClick={() => PlaylistActions.play(this.props.playlistId)}
      >
        {this.props.children}
      </NavLink>
    );
  }
}

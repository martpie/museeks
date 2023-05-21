import React from 'react';
import { NavLink } from 'react-router-dom';

import * as PlaylistActions from '../../store/actions/PlaylistsActions';

import styles from './PlaylistsNavLink.module.css';

type Props = {
  children: React.ReactNode;
  className?: string;
  playlistId: string;
  onContextMenu: (playlistId: string) => void;
};

export default function PlaylistsNavLink(props: Props) {
  return (
    <NavLink
      className={({ isActive }) => `${props.className} ${styles.playlistLink} ${isActive && 'isActive'}`}
      to={`/playlists/${props.playlistId}`}
      onContextMenu={() => props.onContextMenu(props.playlistId)}
      draggable={false}
      onDoubleClick={() => PlaylistActions.play(props.playlistId)}
    >
      {props.children}
    </NavLink>
  );
}

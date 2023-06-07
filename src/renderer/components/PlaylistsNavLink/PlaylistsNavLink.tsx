import React from 'react';
import { NavLink } from 'react-router-dom';

import PlaylistsAPI from '../../stores/PlaylistsAPI';

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
      onDoubleClick={() => PlaylistsAPI.play(props.playlistId)}
    >
      {props.children}
    </NavLink>
  );
}

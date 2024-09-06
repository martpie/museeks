import type React from 'react';
import { NavLink } from 'react-router-dom';

import PlaylistsAPI from '../../stores/PlaylistsAPI';

import styles from './SideNavLink.module.css';

type Props = {
  children: React.ReactNode;
  className?: string;
  playlistID: string;
  onContextMenu: (e: React.MouseEvent, playlistID: string) => void;
};

export default function SideNavLink(props: Props) {
  return (
    <NavLink
      className={({ isActive }) =>
        `${props.className} ${styles.playlistLink} ${isActive && 'isActive'}`
      }
      to={`/playlists/${props.playlistID}`}
      onContextMenu={(e) => props.onContextMenu(e, props.playlistID)}
      draggable={false}
      onDoubleClick={() => PlaylistsAPI.play(props.playlistID)}
    >
      {props.children}
    </NavLink>
  );
}

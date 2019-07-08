import * as React from 'react';
import { NavLink } from 'react-router-dom';

import * as app from '../../lib/app';
import * as PlayerActions from '../../actions/PlayerActions';
import * as styles from './PlaylistsNavLink.css';

import { TrackModel, PlaylistModel } from 'src/shared/types/interfaces';

interface Props {
  className?: string;
  playlistId: string;
  onContextMenu: (playlistId: string) => void;
}

export default class PlaylistsNavLink extends React.Component<Props> {
  // Start playing playlist on double click (Issue #495)
  handleDoubleClick = async () => {
    try {
      const playlist: PlaylistModel = await app.models.Playlist.findOneAsync({ _id: this.props.playlistId });
      const tracks: TrackModel[] = await app.models.Track.findAsync({ _id: { $in: playlist.tracks } });
      PlayerActions.start(tracks).catch((err) => console.warn(err));
    } catch (err) {
      console.warn(err);
    }
  }

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
        onDoubleClick={this.handleDoubleClick}
      >
        { this.props.children }
      </NavLink>
    );
  }
}

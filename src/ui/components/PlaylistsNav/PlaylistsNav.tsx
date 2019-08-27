/* eslint-disable jsx-a11y/no-autofocus */

import * as electron from 'electron';
import * as React from 'react';
import * as Icon from 'react-fontawesome';

import * as PlaylistsActions from '../../actions/PlaylistsActions';
import PlaylistsNavLink from '../PlaylistsNavLink/PlaylistsNavLink';
import { PlaylistModel } from '../../../shared/types/interfaces';

import * as styles from './PlaylistsNav.css';

const { Menu } = electron.remote;

interface Props {
  playlists: PlaylistModel[];
}

interface State {
  renamed: string | null;
}

class PlaylistsNav extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      renamed: null // the playlist being renamed if there's one
    };

    this.blur = this.blur.bind(this);
    this.focus = this.focus.bind(this);
    this.keyDown = this.keyDown.bind(this);
    this.showContextMenu = this.showContextMenu.bind(this);
    this.createPlaylist = this.createPlaylist.bind(this);
  }

  showContextMenu(playlistId: string) {
    const template: electron.MenuItemConstructorOptions[] = [
      {
        label: 'Rename',
        click: () => {
          this.setState({ renamed: playlistId });
        }
      },
      {
        label: 'Delete',
        click: async () => {
          await PlaylistsActions.remove(playlistId);
        }
      },
      {
        type: 'separator'
      },
      {
        label: 'Duplicate',
        click: async () => {
          await PlaylistsActions.duplicate(playlistId);
        }
      },
      {
        type: 'separator'
      },
      {
        label: 'Export',
        click: async () => {
          await PlaylistsActions.exportToM3u(playlistId);
        }
      }
    ];

    const context = Menu.buildFromTemplate(template);

    context.popup({}); // Let it appear
  }

  async createPlaylist() {
    // Todo 'new playlist 1', 'new playlist 2' ...
    await PlaylistsActions.create('New playlist', [], false, true);
  }

  async rename(_id: string, name: string) {
    await PlaylistsActions.rename(_id, name);
  }

  async keyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    e.persist();

    switch (e.nativeEvent.code) {
      case 'Enter': {
        // Enter
        if (this.state.renamed && e.currentTarget) {
          await this.rename(this.state.renamed, e.currentTarget.value);
          this.setState({ renamed: null });
        }
        break;
      }
      case 'Escape': {
        // Escape
        this.setState({ renamed: null });
        break;
      }
      default: {
        break;
      }
    }
  }

  async blur(e: React.FocusEvent<HTMLInputElement>) {
    if (this.state.renamed) {
      await this.rename(this.state.renamed, e.currentTarget.value);
    }

    this.setState({ renamed: null });
  }

  focus(e: React.FocusEvent<HTMLInputElement>) {
    e.currentTarget.select();
  }

  render() {
    const { playlists } = this.props;

    // TODO (y.solovyov): extract into separate method that returns items
    const nav = playlists.map((elem) => {
      let navItemContent;

      if (elem._id === this.state.renamed) {
        navItemContent = (
          <input
            className={styles.item__input}
            type='text'
            defaultValue={elem.name}
            onKeyDown={this.keyDown}
            onBlur={this.blur}
            onFocus={this.focus}
            autoFocus
          />
        );
      } else {
        navItemContent = (
          <PlaylistsNavLink className={styles.item__link} playlistId={elem._id} onContextMenu={this.showContextMenu}>
            {elem.name}
          </PlaylistsNavLink>
        );
      }

      return <div key={`playlist-${elem._id}`}>{navItemContent}</div>;
    });

    return (
      <div className={styles.playlistsNav}>
        <div className={styles.playlistsNav__header}>
          <h4 className={styles.playlistsNav__title}>Playlists</h4>
          <div className={styles.actions}>
            <button className={styles.action} onClick={this.createPlaylist} title='New playlist'>
              <Icon name='plus' />
            </button>
          </div>
        </div>
        <div className={styles.playlistsNav__body}>{nav}</div>
      </div>
    );
  }
}

export default PlaylistsNav;

/**
 * Module in charge of the dock menu on macOS
 */

import { Menu, app, ipcMain } from 'electron';

import channels from '../../shared/lib/ipc-channels';
import { PlayerStatus, TrackModel } from '../../shared/types/museeks';

import ModuleWindow from './module-window';

export default class DockMenuDarwinModule extends ModuleWindow {
  protected menu: Electron.MenuItemConstructorOptions[];
  protected songDetails: Electron.MenuItemConstructorOptions[];
  protected playToggle: Electron.MenuItemConstructorOptions[];
  protected pauseToggle: Electron.MenuItemConstructorOptions[];

  constructor(window: Electron.BrowserWindow) {
    super(window);
    this.platforms = ['darwin'];

    this.menu = [];
    this.songDetails = [];
    this.playToggle = [];
    this.pauseToggle = [];
  }

  async load(): Promise<void> {
    this.songDetails = [
      {
        label: 'Not playing',
        enabled: false,
      },
      {
        type: 'separator',
      },
    ];

    this.playToggle = [
      {
        label: 'Play',
        click: () => {
          this.window.webContents.send(channels.PLAYBACK_PLAY);
        },
      },
    ];

    this.pauseToggle = [
      {
        label: 'Pause',
        click: () => {
          this.window.webContents.send(channels.PLAYBACK_PAUSE);
        },
      },
    ];

    this.menu = [
      {
        label: 'Previous',
        click: () => {
          this.window.webContents.send(channels.PLAYBACK_PREVIOUS);
        },
      },
      {
        label: 'Next',
        click: () => {
          this.window.webContents.send(channels.PLAYBACK_NEXT);
        },
      },
    ];

    // Load events listener for player actions
    ipcMain.on(channels.PLAYBACK_PLAY, () => {
      this.setDockMenu(PlayerStatus.PLAY);
    });

    ipcMain.on(channels.PLAYBACK_PAUSE, () => {
      this.setDockMenu(PlayerStatus.PAUSE);
    });

    ipcMain.on(
      channels.PLAYBACK_TRACK_CHANGE,
      (_e: Event, track: TrackModel) => {
        this.updateDockMenu(track);
        this.setDockMenu(PlayerStatus.PLAY);
      },
    );

    this.setDockMenu(PlayerStatus.PAUSE);
  }

  setDockMenu(state: PlayerStatus): void {
    const playPauseItem = state === 'play' ? this.pauseToggle : this.playToggle;
    const menuTemplate = [...this.songDetails, ...playPauseItem, ...this.menu];
    app.dock.setMenu(Menu.buildFromTemplate(menuTemplate));
  }

  updateDockMenu(metadata: TrackModel): void {
    this.songDetails = [
      {
        label: `${metadata.title}`,
        enabled: false,
      },
      {
        label: `by ${metadata.artist}`,
        enabled: false,
      },
      {
        label: `on ${metadata.album}`,
        enabled: false,
      },
      {
        type: 'separator',
      },
    ];
  }
}

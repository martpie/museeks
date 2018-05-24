/**
 * Module in charge of the dock menu on macOS
 */

const { Menu, app, ipcMain } = require('electron');

const ModuleWindow = require('./module-window');


class DockMenuModule extends ModuleWindow {
  constructor(window) {
    super(window);
    this.platforms = ['darwin'];
  }

  load() {
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
          this.window.webContents.send('playback:play');
        },
      },
    ];

    this.pauseToggle = [
      {
        label: 'Pause',
        click: () => {
          this.window.webContents.send('playback:pause');
        },
      },
    ];

    this.menu = [
      {
        label: 'Previous',
        click: () => {
          this.window.webContents.send('playback:previous');
        },
      },
      {
        label: 'Next',
        click: () => {
          this.window.webContents.send('playback:next');
        },
      },
    ];

    // Load events listener for player actions
    ipcMain.on('playback:play', () => {
      this.setDockMenu('play');
    });

    ipcMain.on('playback:pause', () => {
      this.setDockMenu('pause');
    });

    ipcMain.on('playback:trackChange', (event, track) => {
      this.updateTrayMetadata(track);
      this.setDockMenu('play');
    });

    this.setDockMenu('pause');
  }

  setDockMenu(state) {
    const playPauseItem = state === 'play' ? this.pauseToggle : this.playToggle;
    const menuTemplate = [...this.songDetails, ...playPauseItem, ...this.menu];
    app.dock.setMenu(Menu.buildFromTemplate(menuTemplate));
  }


  updateTrayMetadata(metadata) {
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

module.exports = DockMenuModule;

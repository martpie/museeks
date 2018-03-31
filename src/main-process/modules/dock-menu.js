/**
 * Module in charge of the dock menu on macOS
 */

const { Menu, app, ipcMain } = require('electron');

const ModuleWindow = require('./module-window');
const { IPCR_PLAYER_ACTION } = require('../../shared/constants/ipc');


class TrayManager extends ModuleWindow {
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
          this.window.webContents.send(IPCR_PLAYER_ACTION, 'play');
        },
      },
    ];

    this.pauseToggle = [
      {
        label: 'Pause',
        click: () => {
          this.window.webContents.send(IPCR_PLAYER_ACTION, 'pause');
        },
      },
    ];

    this.menu = [
      {
        label: 'Previous',
        click: () => {
          this.window.webContents.send(IPCR_PLAYER_ACTION, 'prev');
        },
      },
      {
        label: 'Next',
        click: () => {
          this.window.webContents.send(IPCR_PLAYER_ACTION, 'next');
        },
      },
    ],

    // Load events listener for player actions
    ipcMain.on(IPCR_PLAYER_ACTION, (event, reply, data) => {
      switch(reply) {
        case 'play': {
          this.setDockMenu('play');
          break;
        }

        case 'pause': {
          this.setDockMenu('pause');
          break;
        }
        case 'trackStart': {
          this.updateTrayMetadata(data);
          this.setDockMenu('play');
          break;
        }
      }
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

module.exports = TrayManager;

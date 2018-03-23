/**
 * Module in charge of communicating with the render process, especially
 * in TracksList.
 *
 * TODO parts of this file should return to ui/, as content menus can now be
 * made async without blocking the rendering process
 */

const { Menu, ipcMain, powerSaveBlocker, shell, app } = require('electron');

const ModuleWindow = require('./module-window');
const { IPC_APP_CLOSE, IPC_TL_CONTEXTMENU_REPLY } = require('../../shared/constants/ipc');


class IpcManager extends ModuleWindow {
  constructor(window) {
    super(window);

    this.instance = {};
    this.forceQuit = false;
  }

  load() {
    ipcMain.on('tracksListContextMenu', (event, stringData) => {
      const data = JSON.parse(stringData);
      let playlistTemplate = [];
      let addToQueueTemplate = [];

      if(data.playlists) {
        playlistTemplate = [
          {
            label: 'Create new playlist...',
            click: () => {
              event.sender.send(IPC_TL_CONTEXTMENU_REPLY, 'createPlaylist');
            },
          },
        ];

        if(data.playlists.length > 0) {
          playlistTemplate.push(
            {
              type: 'separator',
            }
          );
        }

        data.playlists.forEach((elem) => {
          playlistTemplate.push({
            label: elem.name,
            click: () => {
              event.sender.send(IPC_TL_CONTEXTMENU_REPLY, 'addToPlaylist', {
                playlistId: elem._id,
              });
            },
          });
        });
      } else {
        playlistTemplate = [
          {
            label: 'Create new playlist...',
            click: () => {
              event.sender.send(IPC_TL_CONTEXTMENU_REPLY, 'createPlaylist');
            },
          },
          {
            type: 'separator',
          },
          {
            label: 'No playlist',
            enabled: false,
          },
        ];
      }

      if(data.playerStatus !== 'stop') {
        addToQueueTemplate = [
          {
            label: 'Add to queue',
            click: () => {
              event.sender.send(IPC_TL_CONTEXTMENU_REPLY, 'addToQueue');
            },
          },
          {
            label: 'Play next',
            click: () => {
              event.sender.send(IPC_TL_CONTEXTMENU_REPLY, 'playNext');
            },
          },
          {
            type: 'separator',
          },
        ];
      }

      const template = [
        {
          label: data.selectedCount > 1 ? `${data.selectedCount} tracks selected` : `${data.selectedCount} track selected`,
          enabled: false,
        },
        {
          type: 'separator',
        },
        ...addToQueueTemplate,
        {
          label: 'Add to playlist',
          submenu: playlistTemplate,
        },
        {
          type: 'separator',
        },
        {
          label: `Search for "${data.track.artist[0]}"`,
          click: () => {
            event.sender.send(IPC_TL_CONTEXTMENU_REPLY, 'searchFor', { search: data.track.artist[0] });
          },
        },
        {
          label: `Search for "${data.track.album}"`,
          click: () => {
            event.sender.send(IPC_TL_CONTEXTMENU_REPLY, 'searchFor', { search: data.track.album });
          },
        },
      ];

      if(data.type === 'playlist') template.push(
        {
          type: 'separator',
        },
        {
          label: 'Remove from playlist',
          click: () => {
            event.sender.send(IPC_TL_CONTEXTMENU_REPLY, 'removeFromPlaylist');
          },
        }
      );

      template.push(
        {
          type: 'separator',
        },
        {
          label: 'Show in file manager',
          click: () => {
            shell.showItemInFolder(data.track.path);
          },
        },
        {
          label: 'Remove from library',
          click: () => {
            event.sender.send(IPC_TL_CONTEXTMENU_REPLY, 'removeFromLibrary');
          },
        }
      );

      const context = Menu.buildFromTemplate(template);

      context.popup(this.window, { async: true }); // Let it appear
    });

    ipcMain.on('playlistContextMenu', (event, _id) => {
      const template = [
        {
          label: 'Delete',
          click: () => {
            event.sender.send('playlistContextMenuReply', 'delete', _id);
          },
        },
        {
          label: 'Rename',
          click: () => {
            event.sender.send('playlistContextMenuReply', 'rename', _id);
          },
        },
      ];

      const context = Menu.buildFromTemplate(template);

      context.popup(this.window, { async: true }); // Let it appear
    });


    ipcMain.on('toggleSleepBlocker', (event, toggle, mode) => {
      if(toggle) {
        this.instance.sleepBlockerId = powerSaveBlocker.start(mode);
      } else {
        powerSaveBlocker.stop(this.instance.sleepBlockerId);
        delete(this.instance.sleepBlockerId);
      }
    });

    ipcMain.on('appRestart', () => {
      app.relaunch({ args: process.argv.slice(1) + ['--relaunch'] });
      app.exit(0);
    });


    this.window.on('closed', () => {
      // Dereference the window object
      this.window = null;
    });

    // Prevent the window to be closed, hide it instead (to continue audio playback)
    this.window.on(IPC_APP_CLOSE, (e) => {
      if (this.forceQuit) {
        app.quit();
        this.window.destroy();
      } else {
        e.preventDefault();
        this.window.webContents.send(IPC_APP_CLOSE);
      }
    });

    // Small hack to check on MacOS if the dock close action has been clicked
    // https://stackoverflow.com/questions/35008347/electron-close-w-x-vs-right-click-dock-and-quit#35782702
    app.on('before-quit', () => {
      this.forceQuit = true;
    });
  }
}

module.exports = IpcManager;
